(()=>{
  'use strict';

  const VERSION='exterior-scene-v1.1-polish';
  const exterior=document.getElementById('mqExteriorScene');
  const booth=document.getElementById('mqTicketBoothHotspot');
  const ticketLayer=document.getElementById('mqTicketLayer');
  const ticketMount=document.getElementById('mqTicketProfileMount');
  const cinema=document.getElementById('cinema');
  const walkCursor=document.getElementById('mqWalkCursor');

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
  let murmurTimer=null;
  let hornTimer=null;
  let pointerRaf=0;

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

  function playMurmurBurst(){
    if(!ambienceStarted)return;
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    const now=ctx.currentTime;
    const base=88+Math.random()*54;

    [0,1,2].forEach((voice)=>{
      const osc=ctx.createOscillator();
      const filter=ctx.createBiquadFilter();
      const gain=ctx.createGain();
      const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;

      osc.type=voice===1?'triangle':'sawtooth';
      osc.frequency.setValueAtTime(base*(1+voice*.28),now);
      osc.frequency.linearRampToValueAtTime(base*(.90+voice*.27),now+.5+Math.random()*.5);

      filter.type='bandpass';
      filter.frequency.value=340+voice*280+Math.random()*180;
      filter.Q.value=.7;

      const peak=.006+Math.random()*.007;
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(peak,now+.06+voice*.02);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.55+Math.random()*.5);

      if(pan){
        pan.pan.value=-.75+Math.random()*1.5;
        osc.connect(filter).connect(gain).connect(pan).connect(destination);
      }else{
        osc.connect(filter).connect(gain).connect(destination);
      }

      osc.start(now);
      osc.stop(now+1.15);
    });
  }

  function scheduleMurmur(){
    if(!ambienceStarted)return;
    playMurmurBurst();
    murmurTimer=setTimeout(scheduleMurmur,520+Math.random()*980);
  }

  function playDistantHorn(){
    if(!ambienceStarted)return;
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    const now=ctx.currentTime;
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    const oscA=ctx.createOscillator();
    const oscB=ctx.createOscillator();

    oscA.type='sawtooth';
    oscB.type='triangle';
    oscA.frequency.value=196;
    oscB.frequency.value=247;
    filter.type='lowpass';
    filter.frequency.value=720;

    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.018,now+.08);
    gain.gain.setValueAtTime(.018,now+.26);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.72);

    oscA.connect(filter);
    oscB.connect(filter);
    filter.connect(gain).connect(destination);

    oscA.start(now);oscB.start(now);
    oscA.stop(now+.8);oscB.stop(now+.8);
  }

  function scheduleHorn(){
    if(!ambienceStarted)return;
    playDistantHorn();
    hornTimer=setTimeout(scheduleHorn,7000+Math.random()*9000);
  }

  function startStreetAmbience(){
    if(ambienceStarted)return;
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    ambienceStarted=true;

    // Broad crowd bed.
    const crowd=ctx.createBufferSource();
    const crowdFilter=ctx.createBiquadFilter();
    const crowdGain=ctx.createGain();
    crowd.buffer=noiseBuffer(ctx,5);
    crowd.loop=true;
    crowdFilter.type='bandpass';
    crowdFilter.frequency.value=620;
    crowdFilter.Q.value=.32;
    crowdGain.gain.value=.070;
    crowd.connect(crowdFilter).connect(crowdGain).connect(destination);
    crowd.start();

    // Brighter crowd texture so the ambience reads as people, not only hiss.
    const crowdHigh=ctx.createBufferSource();
    const crowdHighFilter=ctx.createBiquadFilter();
    const crowdHighGain=ctx.createGain();
    crowdHigh.buffer=noiseBuffer(ctx,4);
    crowdHigh.loop=true;
    crowdHighFilter.type='bandpass';
    crowdHighFilter.frequency.value=1450;
    crowdHighFilter.Q.value=.48;
    crowdHighGain.gain.value=.022;
    crowdHigh.connect(crowdHighFilter).connect(crowdHighGain).connect(destination);
    crowdHigh.start();

    // Street / engine rumble.
    const rumble=ctx.createBufferSource();
    const rumbleFilter=ctx.createBiquadFilter();
    const rumbleGain=ctx.createGain();
    rumble.buffer=noiseBuffer(ctx,4);
    rumble.loop=true;
    rumbleFilter.type='lowpass';
    rumbleFilter.frequency.value=175;
    rumbleGain.gain.value=.052;
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(destination);
    rumble.start();

    ambienceNodes.push(
      crowd,crowdHigh,rumble,
      crowdGain,crowdHighGain,rumbleGain
    );

    const scheduleCar=()=>{
      if(!ambienceStarted)return;
      playOldCarPass();
      carTimer=setTimeout(scheduleCar,3900+Math.random()*4200);
    };

    carTimer=setTimeout(scheduleCar,900+Math.random()*1200);
    murmurTimer=setTimeout(scheduleMurmur,240);
    hornTimer=setTimeout(scheduleHorn,4500+Math.random()*3500);
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
    gain.gain.exponentialRampToValueAtTime(.050,now+.55);
    gain.gain.exponentialRampToValueAtTime(.0001,now+3.15);

    if(pan){
      pan.pan.setValueAtTime(-.82,now);
      pan.pan.linearRampToValueAtTime(.82,now+3.15);
      osc.connect(filter).connect(gain).connect(pan).connect(destination);
    }else{
      osc.connect(filter).connect(gain).connect(destination);
    }

    osc.start(now);
    osc.stop(now+3.25);
  }

  function playFootsteps(){
    const ctx=coreAudio();
    const destination=audioDestination();
    if(!ctx||!destination)return;

    const count=9;
    for(let i=0;i<count;i++){
      const t=ctx.currentTime+i*.17;

      const thump=ctx.createOscillator();
      const thumpGain=ctx.createGain();
      const scuff=ctx.createBufferSource();
      const scuffFilter=ctx.createBiquadFilter();
      const scuffGain=ctx.createGain();
      const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;

      thump.type='triangle';
      thump.frequency.setValueAtTime(i%2?92:104,t);
      thump.frequency.exponentialRampToValueAtTime(58,t+.075);
      thumpGain.gain.setValueAtTime(.0001,t);
      thumpGain.gain.exponentialRampToValueAtTime(.075,t+.012);
      thumpGain.gain.exponentialRampToValueAtTime(.0001,t+.115);

      scuff.buffer=noiseBuffer(ctx,.13);
      scuffFilter.type='bandpass';
      scuffFilter.frequency.value=720+(i%3)*120;
      scuffFilter.Q.value=.7;
      scuffGain.gain.setValueAtTime(.0001,t+.015);
      scuffGain.gain.exponentialRampToValueAtTime(.030,t+.028);
      scuffGain.gain.exponentialRampToValueAtTime(.0001,t+.12);

      if(pan){
        pan.pan.value=i%2?-.16:.16;
        thump.connect(thumpGain).connect(pan).connect(destination);
        scuff.connect(scuffFilter).connect(scuffGain).connect(pan);
      }else{
        thump.connect(thumpGain).connect(destination);
        scuff.connect(scuffFilter).connect(scuffGain).connect(destination);
      }

      thump.start(t);
      thump.stop(t+.13);
      scuff.start(t+.015);
      scuff.stop(t+.145);
    }
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
    if(murmurTimer){clearTimeout(murmurTimer);murmurTimer=null}
    if(hornTimer){clearTimeout(hornTimer);hornTimer=null}

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

  function cleanTicketProfileUi(){
    const panel=findProfilePanel();
    if(!panel)return;

    panel.querySelectorAll(
      '[data-open-statistics],[data-open-scoreboard],#mqIntroScoreboard,.mq-stats-avatar-action'
    ).forEach(node=>{
      node.hidden=true;
      node.style.display='none';
    });

    // Fallback for older profile builds where action buttons did not
    // yet have stable data attributes.
    panel.querySelectorAll('button,a').forEach(node=>{
      const text=(node.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(text.includes('statistik')||text.includes('žebříčk')||text.includes('zebricek')){
        node.hidden=true;
        node.style.display='none';
      }
    });
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
    cleanTicketProfileUi();
    requestAnimationFrame(cleanTicketProfileUi);
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

  function updateWalkCursor(event){
    if(!walkCursor)return;
    walkCursor.style.left=`${event.clientX}px`;
    walkCursor.style.top=`${event.clientY}px`;
  }

  function setWalkCursorVisible(visible){
    if(!walkCursor)return;
    walkCursor.classList.toggle('is-visible',Boolean(visible));
  }

  function updateParallax(event){
    if(pointerRaf)return;
    pointerRaf=requestAnimationFrame(()=>{
      pointerRaf=0;
      const x=(event.clientX/window.innerWidth-.5)*2;
      const y=(event.clientY/window.innerHeight-.5)*2;
      exterior.style.setProperty('--scene-x',x.toFixed(3));
      exterior.style.setProperty('--scene-y',y.toFixed(3));
    });
  }

  function bind(){
    booth.addEventListener('pointerenter',event=>{
      startStreetAmbience();
      setWalkCursorVisible(true);
      updateWalkCursor(event);
    });

    booth.addEventListener('pointermove',updateWalkCursor);

    booth.addEventListener('pointerleave',()=>{
      setWalkCursorVisible(false);
    });

    booth.addEventListener('click',event=>{
      event.preventDefault();
      setWalkCursorVisible(false);
      openTicket(false);
    });

    exterior.addEventListener('pointermove',updateParallax,{passive:true});

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