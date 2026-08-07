(()=>{
  'use strict';

  const VERSION='exterior-scene-v1';
  const exterior=document.getElementById('mqExteriorScene');
  const booth=document.getElementById('mqTicketBoothHotspot');
  const ticketLayer=document.getElementById('mqTicketLayer');
  const ticketMount=document.getElementById('mqTicketProfileMount');
  const cinema=document.getElementById('cinema');

  if(!exterior||!booth||!ticketLayer||!ticketMount||!cinema)return;

  let originalShowView=null;
  let wrapped=false;
  let ticketOpen=false;
  let entering=false;
  let auditoriumEntered=false;

  let profilePanel=null;
  let profilePlaceholder=null;

  let ambienceStarted=false;
  let ambienceNodes=[];
  let carTimer=null;

  function coreAudio(){
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended'){
        audioCtx.resume?.().catch?.(()=>{});
      }
      return typeof audioCtx!=='undefined'?audioCtx:null;
    }catch(_){
      return null;
    }
  }

  function audioDestination(){
    try{
      if(typeof sfxGain!=='undefined'&&sfxGain)return sfxGain;
      if(typeof masterGain!=='undefined'&&masterGain)return masterGain;
    }catch(_){}
    return null;
  }

  function noiseBuffer(ctx,seconds=3){
    const length=Math.max(1,Math.floor(ctx.sampleRate*seconds));
    const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
    const data=buffer.getChannelData(0);
    let last=0;
    for(let i=0;i<length;i++){
      const white=Math.random()*2-1;
      last=.985*last+.015*white;
      data[i]=last*.9+white*.10;
    }
    return buffer;
  }

  function startStreetAmbience(){
    if(ambienceStarted)return;
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    ambienceStarted=true;

    // Distant crowd wash.
    const crowd=ctx.createBufferSource();
    const crowdFilter=ctx.createBiquadFilter();
    const crowdGain=ctx.createGain();
    crowd.buffer=noiseBuffer(ctx,4);
    crowd.loop=true;
    crowdFilter.type='bandpass';
    crowdFilter.frequency.value=560;
    crowdFilter.Q.value=.42;
    crowdGain.gain.value=.030;
    crowd.connect(crowdFilter).connect(crowdGain).connect(destination);
    crowd.start();

    // Low street rumble.
    const rumble=ctx.createBufferSource();
    const rumbleFilter=ctx.createBiquadFilter();
    const rumbleGain=ctx.createGain();
    rumble.buffer=noiseBuffer(ctx,3);
    rumble.loop=true;
    rumbleFilter.type='lowpass';
    rumbleFilter.frequency.value=145;
    rumbleGain.gain.value=.028;
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(destination);
    rumble.start();

    ambienceNodes.push(crowd,rumble,crowdGain,rumbleGain);

    const scheduleCar=()=>{
      if(!ambienceStarted)return;
      playOldCarPass();
      carTimer=setTimeout(scheduleCar,4700+Math.random()*5300);
    };
    carTimer=setTimeout(scheduleCar,1800+Math.random()*1800);
  }

  function playOldCarPass(){
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    const now=ctx.currentTime;
    const osc=ctx.createOscillator();
    const filter=ctx.createBiquadFilter();
    const gain=ctx.createGain();
    const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;

    osc.type='sawtooth';
    osc.frequency.setValueAtTime(74,now);
    osc.frequency.exponentialRampToValueAtTime(46,now+2.5);
    filter.type='lowpass';
    filter.frequency.value=290;

    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.032,now+.55);
    gain.gain.exponentialRampToValueAtTime(.0001,now+2.6);

    if(pan){
      pan.pan.setValueAtTime(-.82,now);
      pan.pan.linearRampToValueAtTime(.82,now+2.6);
      osc.connect(filter).connect(gain).connect(pan).connect(destination);
    }else{
      osc.connect(filter).connect(gain).connect(destination);
    }

    osc.start(now);
    osc.stop(now+2.7);
  }

  function playFootsteps(){
    coreAudio();
    try{
      if(typeof tone==='function'){
        [0,.18,.37,.56].forEach((delay,index)=>{
          tone(index%2?112:96,.075,'triangle',.050,delay);
          tone(index%2?220:185,.028,'square',.014,delay+.018);
        });
      }
    }catch(_){}
  }

  function playTicketPaper(){
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    const source=ctx.createBufferSource();
    const filter=ctx.createBiquadFilter();
    const gain=ctx.createGain();
    const now=ctx.currentTime;

    source.buffer=noiseBuffer(ctx,.22);
    filter.type='highpass';
    filter.frequency.value=900;
    gain.gain.setValueAtTime(.024,now);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.20);

    source.connect(filter).connect(gain).connect(destination);
    source.start(now);
    source.stop(now+.22);
  }

  function stopStreetAmbience(){
    if(!ambienceStarted)return;
    ambienceStarted=false;
    if(carTimer){clearTimeout(carTimer);carTimer=null}

    const ctx=coreAudio();
    const now=ctx?.currentTime||0;

    ambienceNodes.forEach(node=>{
      try{
        if(node?.gain?.setTargetAtTime){
          node.gain.setTargetAtTime(.0001,now,.18);
        }
      }catch(_){}
    });

    setTimeout(()=>{
      ambienceNodes.forEach(node=>{
        try{node?.stop?.()}catch(_){}
        try{node?.disconnect?.()}catch(_){}
      });
      ambienceNodes=[];
    },650);
  }

  function findProfilePanel(){
    if(profilePanel?.isConnected)return profilePanel;
    profilePanel=document.querySelector('#playerView .mq-player-panel')||document.querySelector('.mq-ticket-profile-mount .mq-player-panel');
    return profilePanel;
  }

  function mountProfileOnTicket(){
    const panel=findProfilePanel();
    if(!panel)return false;

    if(!profilePlaceholder){
      profilePlaceholder=document.createComment('Movie Quiz player panel home');
      panel.parentNode?.insertBefore(profilePlaceholder,panel);
    }

    if(panel.parentElement!==ticketMount){
      ticketMount.appendChild(panel);
    }
    panel.classList.add('mq-ticket-player-panel');
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
    document.body.classList.add('mq-ticket-open');
    ticketOpen=true;
    playTicketPaper();

    // Profile state may finish asynchronously; panel stays valid because
    // all profile rendering targets #mqProfileShell by id.
    requestAnimationFrame(mountProfileOnTicket);
    setTimeout(mountProfileOnTicket,80);
    setTimeout(mountProfileOnTicket,280);
  }

  function openTicket(fromHall=false){
    if(ticketOpen||entering)return;

    startStreetAmbience();

    if(!fromHall){
      exterior.classList.add('is-approaching');
      playFootsteps();
    }

    const delay=fromHall?0:690;

    setTimeout(()=>{
      try{
        originalShowView?.('playerView');
      }catch(_){}

      showTicketLayer();
    },delay);
  }

  function enterAuditorium(){
    if(entering)return;
    entering=true;
    document.body.classList.add('mq-entering-auditorium');
    exterior.classList.add('is-leaving');
    stopStreetAmbience();

    setTimeout(()=>{
      restoreProfilePanel();

      ticketLayer.hidden=true;
      exterior.hidden=true;

      ticketOpen=false;
      auditoriumEntered=true;
      entering=false;

      document.body.classList.remove(
        'mq-exterior-active',
        'mq-ticket-open',
        'mq-entering-auditorium'
      );
      document.body.classList.add('mq-auditorium-entered');

      // There is no longer an intro click inside the hall, so reveal the
      // already built auditorium with the curtain open.
      cinema.classList.add('running','open');

      try{originalShowView?.('difficulty')}catch(_){}
      try{
        document.getElementById('screen')?.removeAttribute('data-genre');
        if(typeof switchMusic==='function')switchMusic('menu');
        if(typeof sound==='function')sound('soft');
      }catch(_){}

      setTimeout(()=>window.dispatchEvent(new Event('resize')),80);
    },820);
  }

  function wrapShowView(){
    if(wrapped||typeof window.showView!=='function')return false;

    originalShowView=window.showView;
    window.showView=function(id){
      // Successful login, registration recovery or Guest mode all converge
      // on the same difficulty view. While the player is still at the ticket,
      // use that call as the transition into the auditorium.
      if(id==='difficulty'&&ticketOpen&&!auditoriumEntered){
        enterAuditorium();
        return;
      }

      // "Změnit hráče" from inside the hall returns to the ticket UI.
      if(id==='playerView'&&auditoriumEntered){
        originalShowView(id);
        showTicketLayer();
        return;
      }

      return originalShowView(id);
    };

    wrapped=true;
    return true;
  }

  function waitForGameSystems(){
    if(wrapShowView())return;
    setTimeout(waitForGameSystems,60);
  }

  function bind(){
    booth.addEventListener('pointerenter',()=>{
      startStreetAmbience();
    },{passive:true});

    booth.addEventListener('click',event=>{
      event.preventDefault();
      openTicket(false);
    });

    // Browser autoplay restrictions mean street ambience begins with the
    // player's first real interaction.
    exterior.addEventListener('pointerdown',startStreetAmbience,{once:true,passive:true});
  }

  bind();
  waitForGameSystems();

  window.MovieQuizExterior=Object.freeze({
    version:VERSION,
    openTicket:()=>openTicket(auditoriumEntered),
    enterAuditorium,
    isAuditoriumEntered:()=>auditoriumEntered
  });
})();