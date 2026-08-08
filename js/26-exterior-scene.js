(()=>{
  'use strict';

  const VERSION='exterior-integration-v6.0';
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

  const footsteps=new Audio('assets/audio/footsteps.ogg');
  footsteps.preload='auto';
  footsteps.playsInline=true;

  const MUSIC_KEY='movieQuizMusicVolumeV1';
  const SFX_KEY='movieQuizSfxVolumeV1';

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
    window.dispatchEvent(new CustomEvent('mq:volume-changed',{detail:{kind,value:v,source:VERSION}}));
  }

  function sfxLevel(){
    try{return clampVolume(window.MovieQuizSettings?.sfxVolume?.()??storedVolume(SFX_KEY))}catch(_){return storedVolume(SFX_KEY)}
  }

  function playFootsteps(){
    try{
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
