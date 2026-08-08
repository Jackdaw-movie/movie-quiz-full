(()=>{
  'use strict';

  const VERSION='exterior-integration-v6.9-preloaded-production';
  const exterior=document.getElementById('mqExteriorScene');
  const stage=document.getElementById('mqExteriorStage');
  const booth=document.getElementById('mqTicketBoothHotspot');
  const ticketLayer=document.getElementById('mqTicketLayer');
  const ticketMount=document.getElementById('mqTicketProfileMount');
  const cinema=document.getElementById('cinema');
  const walkCursor=document.getElementById('mqWalkCursor');
  if(!exterior||!stage||!booth||!ticketLayer||!ticketMount||!cinema)return;

  let originalShowView=null;
  let wrapped=false;
  let ticketOpen=false;
  let entering=false;
  let auditoriumEntered=false;
  let profilePanel=null;
  let profilePlaceholder=null;
  let approachTimer=0;
  let exteriorAudioStarted=false;
  let sfxPreviewTimer=0;

  const preloadPool=window.MovieQuizPreload||null;
  const footsteps=preloadPool?.footsteps||new Audio('assets/audio/footsteps.ogg');
  footsteps.preload='auto';
  footsteps.playsInline=true;

  /* v6.9 reuses the Audio elements created by the loading gate. That means the
     first trusted click can start already-buffered city recordings immediately,
     without creating duplicate downloads or competing playback objects. */
  const STREET_PEOPLE_URL='https://assets.mixkit.co/active_storage/sfx/375/375-preview.mp3';
  const STREET_TRAFFIC_URL='https://assets.mixkit.co/active_storage/sfx/2930/2930-preview.mp3';
  const cityPeople=preloadPool?.cityPeople||new Audio(STREET_PEOPLE_URL);
  const cityTraffic=preloadPool?.cityTraffic||new Audio(STREET_TRAFFIC_URL);
  for(const track of [cityPeople,cityTraffic]){
    track.preload='auto';
    track.loop=true;
    track.playsInline=true;
  }
  /* Desynchronise the two loops so the repeated ambience is much less obvious. */
  cityTraffic.addEventListener('loadedmetadata',()=>{
    try{if(Number.isFinite(cityTraffic.duration)&&cityTraffic.duration>17)cityTraffic.currentTime=11.7}catch(_){}
  },{once:true});

  let cityAmbienceStarted=false;
  let cityAmbienceBlocked=false;
  let cityWanted=true;
  let cityRestartTimer=0;
  let cityPlayInFlight=null;

  const MUSIC_KEY='movieQuizMusicVolumeV1';
  const SFX_KEY='movieQuizSfxVolumeV1';
  const MUSIC_BEFORE_MUTE_KEY='movieQuizMusicBeforeMuteV1';
  const SFX_BEFORE_MUTE_KEY='movieQuizSfxBeforeMuteV1';
  const AUDIO_DEFAULTS_MIGRATION_KEY='movieQuizExteriorAudioDefaultsV68';

  /* Make 50 / 50 the real standard for this release, including users who
     still have extreme values left over from the earlier exterior tests.
     This runs once only; later user changes remain persistent. */
  function ensureDefaultAudioLevels(){
    try{
      if(localStorage.getItem(AUDIO_DEFAULTS_MIGRATION_KEY)==='1')return;
      localStorage.setItem(MUSIC_KEY,'50');
      localStorage.setItem(SFX_KEY,'50');
      localStorage.setItem(MUSIC_BEFORE_MUTE_KEY,'50');
      localStorage.setItem(SFX_BEFORE_MUTE_KEY,'50');
      localStorage.setItem(AUDIO_DEFAULTS_MIGRATION_KEY,'1');
    }catch(_){}
  }
  ensureDefaultAudioLevels();
  setTimeout(()=>{
    try{window.MovieQuizSettings?.apply?.()}catch(_){}
    window.dispatchEvent(new CustomEvent('mq:volume-changed',{detail:{kind:'all',value:50,source:VERSION}}));
  },0);

  function clampVolume(value){
    const number=Number(value);
    return Number.isFinite(number)?Math.max(0,Math.min(100,Math.round(number))):50;
  }

  function storedVolume(key){
    try{
      const raw=localStorage.getItem(key);
      return raw===null?50:clampVolume(raw);
    }catch(_){return 50}
  }

  function resizeStage(){
    const scale=Math.max(.34,Math.min(window.innerWidth/1672,window.innerHeight/941));
    stage.style.transform=`translate(-50%,-50%) scale(${scale})`;
  }
  resizeStage();
  window.addEventListener('resize',resizeStage,{passive:true});

  function syncStoredLevelsToGame(){
    try{window.MovieQuizSettings?.apply?.()}catch(_){}
  }

  function writeExteriorVolume(kind,value){
    const v=clampVolume(value);
    const key=kind==='music'?MUSIC_KEY:SFX_KEY;
    try{localStorage.setItem(key,String(v))}catch(_){}
    syncStoredLevelsToGame();

    if(kind==='music'){
      if(v>0){
        startExteriorAudio();
        try{if(typeof switchMusic==='function')switchMusic('menu')}catch(_){}
      }
    }else if(kind==='sfx'){
      syncCityAmbienceVolume();
      if(v>0){
        startCityAmbience();
        previewExteriorSfx();
      }else{
        for(const track of [cityPeople,cityTraffic]){try{track.pause()}catch(_){}}
      }
    }
    window.dispatchEvent(new CustomEvent('mq:volume-changed',{detail:{kind,value:v,source:VERSION}}));
  }

  function sfxLevel(){
    try{return clampVolume(window.MovieQuizSettings?.sfxVolume?.()??storedVolume(SFX_KEY))}catch(_){return storedVolume(SFX_KEY)}
  }

  function musicLevel(){
    try{return clampVolume(window.MovieQuizSettings?.musicVolume?.()??storedVolume(MUSIC_KEY))}catch(_){return storedVolume(MUSIC_KEY)}
  }

  function cityPeopleTargetVolume(){
    /* At the standard 50% SFX setting the human street layer is clearly
       audible (~0.31) without sitting on top of the menu music. */
    return Math.max(0,Math.min(1,(sfxLevel()/100)*.62));
  }

  function cityTrafficTargetVolume(){
    /* Traffic remains a quieter supporting layer behind the people. */
    return Math.max(0,Math.min(1,(sfxLevel()/100)*.30));
  }

  function cityAmbienceTargetVolume(){
    return Math.max(cityPeopleTargetVolume(),cityTrafficTargetVolume());
  }

  function syncCityAmbienceVolume(){
    try{cityPeople.volume=cityPeopleTargetVolume()}catch(_){}
    try{cityTraffic.volume=cityTrafficTargetVolume()}catch(_){}
  }

  function startCityAmbience(){
    if(document.body.classList.contains('mq-preloading'))return Promise.resolve(false);
    if(!cityWanted||auditoriumEntered||document.body.classList.contains('mq-auditorium-entered'))return Promise.resolve(false);
    syncCityAmbienceVolume();
    if(cityAmbienceTargetVolume()<=0)return Promise.resolve(false);

    const bothPlaying=!cityPeople.paused&&!cityPeople.ended&&!cityTraffic.paused&&!cityTraffic.ended;
    if(bothPlaying){
      cityAmbienceStarted=true;
      cityAmbienceBlocked=false;
      return Promise.resolve(true);
    }
    if(cityPlayInFlight)return cityPlayInFlight;

    const playTrack=track=>{
      try{
        if(!track.paused&&!track.ended)return Promise.resolve(true);
        return Promise.resolve(track.play()).then(()=>true).catch(()=>false);
      }catch(_){return Promise.resolve(false)}
    };

    cityPlayInFlight=Promise.all([playTrack(cityPeople),playTrack(cityTraffic)])
      .then(results=>{
        /* The people layer is the important one. The traffic bed may fail
           independently without killing the whole exterior soundscape. */
        cityAmbienceStarted=Boolean(results[0]||results[1]);
        cityAmbienceBlocked=!cityAmbienceStarted;
        return cityAmbienceStarted;
      })
      .finally(()=>{cityPlayInFlight=null});
    return cityPlayInFlight;
  }

  function scheduleCityRestart(delay=90){
    if(cityRestartTimer)clearTimeout(cityRestartTimer);
    if(!cityWanted||auditoriumEntered||document.hidden)return;
    cityRestartTimer=window.setTimeout(()=>{
      cityRestartTimer=0;
      if(cityWanted&&!auditoriumEntered&&!document.hidden)startCityAmbience();
    },delay);
  }

  function stopCityAmbience(fadeMs=450){
    cityWanted=false;
    if(cityRestartTimer){clearTimeout(cityRestartTimer);cityRestartTimer=0}
    const tracks=[cityPeople,cityTraffic];
    const starts=tracks.map(track=>track.volume||0);
    const started=performance.now();
    const step=now=>{
      const t=Math.min(1,(now-started)/fadeMs);
      tracks.forEach((track,index)=>{
        try{track.volume=starts[index]*(1-t)}catch(_){}
      });
      if(t<1){requestAnimationFrame(step);return}
      tracks.forEach(track=>{
        try{track.pause();track.currentTime=0}catch(_){}
      });
      cityAmbienceStarted=false;
      syncCityAmbienceVolume();
    };
    requestAnimationFrame(step);
  }

  /* Use the game's real musical engine. The previous exterior noise loop is
     deliberately not used. Audio is unlocked by a real player gesture and
     then remains continuous when the player enters the auditorium. */
  function startExteriorAudio(){
    try{
      if(typeof initAudio==='function')initAudio();
      window.MovieQuizSettings?.apply?.();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended'){
        audioCtx.resume?.().catch?.(()=>{});
      }
      if(musicLevel()>0&&typeof switchMusic==='function'){
        switchMusic('menu');
      }
      exteriorAudioStarted=true;
      return true;
    }catch(_){return false}
  }

  function previewExteriorSfx(){
    if(sfxLevel()<=0)return;
    startCityAmbience();
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended')audioCtx.resume?.().catch?.(()=>{});
      window.MovieQuizSettings?.apply?.();
    }catch(_){}
    if(sfxPreviewTimer)clearTimeout(sfxPreviewTimer);
    sfxPreviewTimer=window.setTimeout(()=>{
      try{
        if(typeof sound==='function')sound('tick');
        else if(typeof tone==='function')tone(720,.035,'sine',.012);
      }catch(_){}
    },70);
  }

  function playFootsteps(){
    try{
      startCityAmbience();
      const volume=(sfxLevel()/100)*.62;
      if(volume<=0)return;
      footsteps.pause();
      footsteps.currentTime=0;
      footsteps.volume=Math.min(1,volume);
      footsteps.playbackRate=1.03;
      footsteps.play().catch(()=>{});
    }catch(_){}
  }

  function findProfilePanel(){
    profilePanel=document.getElementById('mqProfileShell')||document.querySelector('.mq-player-shell,.mq-player-card');
    return profilePanel;
  }

  function mountProfileOnTicket(){
    const panel=findProfilePanel();
    if(!panel)return false;
    if(!profilePlaceholder){
      profilePlaceholder=document.createComment('mq-profile-return');
      panel.parentNode?.insertBefore(profilePlaceholder,panel);
    }
    panel.classList.add('mq-ticket-player-panel');
    ticketMount.appendChild(panel);
    return true;
  }

  function restoreProfilePanel(){
    const panel=findProfilePanel();
    if(!panel)return;
    if(profilePlaceholder?.parentNode){
      profilePlaceholder.parentNode.insertBefore(panel,profilePlaceholder.nextSibling);
    }
    panel.classList.remove('mq-ticket-player-panel');
  }

  function showTicketLayer(){
    ticketLayer.hidden=false;
    ticketLayer.removeAttribute('hidden');
    document.body.classList.add('mq-ticket-open');
    exterior.classList.remove('is-approaching');
    ticketOpen=true;

    /* Player view can be prepared either before or just after the layer appears. */
    try{originalShowView?.('playerView')}catch(_){}
    requestAnimationFrame(()=>{
      mountProfileOnTicket();
      ticketLayer.querySelector('button,input,[tabindex]:not([tabindex="-1"])')?.focus?.({preventScroll:true});
    });
    setTimeout(mountProfileOnTicket,80);
    setTimeout(mountProfileOnTicket,260);
    setTimeout(mountProfileOnTicket,700);
  }

  function openTicket(){
    if(ticketOpen||entering||approachTimer)return;
    playFootsteps();
    exterior.classList.add('is-approaching');
    booth.disabled=true;
    approachTimer=window.setTimeout(()=>{
      approachTimer=0;
      booth.disabled=false;
      showTicketLayer();
    },1450);
  }

  function startAuditoriumAudio(){
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended')audioCtx.resume?.().catch?.(()=>{});
      window.MovieQuizSettings?.apply?.();
      if(typeof switchMusic==='function')switchMusic('menu');
    }catch(_){}
  }

  function enterAuditorium(){
    if(entering)return;
    entering=true;
    stopCityAmbience(520);
    document.body.classList.add('mq-entering-auditorium');
    ticketLayer.classList.add('is-leaving');
    exterior.classList.add('is-leaving');

    setTimeout(()=>{
      restoreProfilePanel();
      ticketLayer.hidden=true;
      ticketLayer.setAttribute('hidden','');
      ticketLayer.classList.remove('is-leaving');
      exterior.hidden=true;
      exterior.setAttribute('hidden','');
      ticketOpen=false;
      auditoriumEntered=true;
      entering=false;
      document.body.classList.remove('mq-exterior-active','mq-ticket-open','mq-entering-auditorium');
      document.body.classList.add('mq-auditorium-entered');
      cinema.classList.add('running','open');

      try{originalShowView?.('difficulty')}catch(_){}
      try{document.getElementById('screen')?.removeAttribute('data-genre')}catch(_){}
      startAuditoriumAudio();
      try{if(typeof sound==='function')sound('soft')}catch(_){}
      setTimeout(()=>window.dispatchEvent(new Event('resize')),80);
    },650);
  }

  function wrapShowView(){
    if(wrapped||typeof window.showView!=='function')return false;
    originalShowView=window.showView;
    window.showView=function(id){
      if(id==='difficulty'&&ticketOpen&&!auditoriumEntered){
        enterAuditorium();
        return;
      }
      if(id==='playerView'&&auditoriumEntered){
        return originalShowView(id);
      }
      return originalShowView(id);
    };
    wrapped=true;
    if(ticketOpen){
      try{originalShowView('playerView')}catch(_){}
      setTimeout(mountProfileOnTicket,0);
    }
    return true;
  }

  function waitForGameSystems(){
    if(wrapShowView())return;
    setTimeout(waitForGameSystems,70);
  }

  function updateWalkCursor(event){
    if(!walkCursor)return;
    walkCursor.style.left=`${event.clientX}px`;
    walkCursor.style.top=`${event.clientY}px`;
  }
  function showWalk(value){walkCursor?.classList.toggle('is-visible',Boolean(value))}

  const music=document.getElementById('mqExteriorMusic');
  const sfx=document.getElementById('mqExteriorSfx');
  const audioToggle=document.getElementById('mqExteriorAudioOpen');
  const audioPanel=document.getElementById('mqExteriorAudioPanel');

  function syncSliders(){
    if(music&&!music.matches(':active'))music.value=String(storedVolume(MUSIC_KEY));
    if(sfx&&!sfx.matches(':active'))sfx.value=String(storedVolume(SFX_KEY));
    syncCityAmbienceVolume();
  }

  function setAudioOpen(open){
    if(!audioPanel||!audioToggle)return;
    audioPanel.hidden=!open;
    audioToggle.setAttribute('aria-expanded',String(open));
  }

  audioToggle?.addEventListener('pointerdown',event=>event.stopPropagation());
  audioToggle?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    setAudioOpen(audioPanel?.hidden!==false);
  });
  audioPanel?.addEventListener('pointerdown',event=>event.stopPropagation());
  audioPanel?.addEventListener('click',event=>event.stopPropagation());
  document.addEventListener('pointerdown',()=>setAudioOpen(false));
  music?.addEventListener('input',()=>writeExteriorVolume('music',music.value));
  sfx?.addEventListener('input',()=>writeExteriorVolume('sfx',sfx.value));
  window.addEventListener('mq:settings-changed',syncSliders);
  window.addEventListener('mq:volume-changed',syncSliders);
  setAudioOpen(false);

  booth.addEventListener('pointerenter',event=>{showWalk(true);updateWalkCursor(event)});
  booth.addEventListener('pointermove',updateWalkCursor);
  booth.addEventListener('pointerleave',()=>showWalk(false));
  booth.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    showWalk(false);
    openTicket();
  });
  document.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&document.activeElement===booth){
      event.preventDefault();
      openTicket();
    }
  });

  /* Start the real menu soundtrack on the first genuine interaction with the
     exterior. This also unlocks the audio context for footsteps and previews. */
  const unlockExteriorSound=()=>{
    if(document.body.classList.contains('mq-preloading'))return;
    if(!document.body.classList.contains('mq-exterior-active')||auditoriumEntered)return;
    cityWanted=true;
    startCityAmbience();
    /* Unlock WebAudio for later game SFX, but do not start the synthesized
       menu score on the same gesture as the city ambience. Keeping those two
       systems separate avoids the short-start/race heard in v6.6. */
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended')audioCtx.resume?.().catch?.(()=>{});
      window.MovieQuizSettings?.apply?.();
      /* Start the normal menu score after the browser gesture has unlocked
         WebAudio. A small delay keeps it independent from HTMLAudio ambience. */
      if(musicLevel()>0&&typeof switchMusic==='function'){
        setTimeout(()=>{
          try{if(!auditoriumEntered&&musicLevel()>0)switchMusic('menu')}catch(_){}
        },140);
      }
    }catch(_){}
    document.removeEventListener('pointerdown',unlockExteriorSound,true);
    document.removeEventListener('keydown',unlockExteriorSound,true);
  };
  document.addEventListener('pointerdown',unlockExteriorSound,true);
  document.addEventListener('keydown',unlockExteriorSound,true);
  window.addEventListener('mq:preload-entered',()=>{
    cityWanted=true;
    syncCityAmbienceVolume();
    // Same preloaded tracks are already playing; this only reconciles state,
    // unlocks WebAudio and starts the normal menu score at the stored volume.
    unlockExteriorSound();
  },{once:true});

  syncCityAmbienceVolume();
  cityWanted=true;
  /* With the v6.9 gate we intentionally wait for the explicit Enter click.
     Keep the old best-effort path only if the gate is absent/already released. */
  if(!document.body.classList.contains('mq-preloading')){
    requestAnimationFrame(()=>startCityAmbience());
    setTimeout(()=>{if(cityWanted&&!cityAmbienceStarted)startCityAmbience()},220);
  }

  for(const track of [cityPeople,cityTraffic]){
    track.addEventListener('playing',()=>{
      cityAmbienceStarted=true;
      cityAmbienceBlocked=false;
    });
    track.addEventListener('pause',()=>{
      if(cityPeople.paused&&cityTraffic.paused)cityAmbienceStarted=false;
      if(cityWanted&&!auditoriumEntered&&!document.hidden)scheduleCityRestart(120);
    });
    track.addEventListener('ended',()=>{
      if(cityWanted&&!auditoriumEntered)scheduleCityRestart(0);
    });
    track.addEventListener('stalled',()=>scheduleCityRestart(180));
    track.addEventListener('error',()=>scheduleCityRestart(600));
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      for(const track of [cityPeople,cityTraffic]){try{track.pause()}catch(_){}}
    }else if(!auditoriumEntered&&document.body.classList.contains('mq-exterior-active')){
      cityWanted=true;
      startCityAmbience();
    }
  });

  waitForGameSystems();
  syncSliders();
  setTimeout(syncSliders,400);
  setTimeout(syncSliders,1200);

  window.MovieQuizExterior=Object.freeze({
    version:VERSION,
    openTicket,
    enterAuditorium
  });
})();
