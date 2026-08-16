(()=>{
  'use strict';
  const VERSION='interaction-guards-v28.1';

  function visible(element){
    if(!element||element.hidden)return false;
    try{
      const style=getComputedStyle(element);
      return style.display!=='none'&&style.visibility!=='hidden';
    }catch(_){return true}
  }

  function avatarModal(){return document.getElementById('mqAvatarModal')}
  function avatarModalOpen(){return visible(avatarModal())}
  function insideRealAudioSettings(target){
    return Boolean(target instanceof Element && target.closest(
      '#mqSettingsMenu,#mqExteriorAudio,#mqExteriorAudioPanel,'+
      '#mqMusicVolume,#mqSfxVolume,#mqMusicToggle,#mqSfxToggle,'+
      '.mq-volume-controls,.mq-volume-row'
    ));
  }

  /* Remove the legacy core mute click listener structurally. 00-core.js binds
     directly to the original node. Replacing that node with an identical clone
     drops that listener completely. The Settings module remains the only audio UI. */
  function neutralizeLegacyMuteButton(){
    const old=document.getElementById('muteBtn');
    if(!old||old.dataset.mqLegacyMuteNeutralized==='1')return;
    const clean=old.cloneNode(true);
    clean.dataset.mqLegacyMuteNeutralized='1';
    clean.hidden=true;
    clean.setAttribute('aria-hidden','true');
    clean.tabIndex=-1;
    clean.style.display='none';
    clean.style.pointerEvents='none';
    old.replaceWith(clean);
  }

  function restoreConfiguredAudio(){
    if(!avatarModalOpen())return;
    try{
      if(typeof state!=='undefined'&&state)state.muted=false;
    }catch(_){}
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended'){
        audioCtx.resume?.().catch?.(()=>{});
      }
    }catch(_){}
    try{window.MovieQuizSettings?.apply?.()}catch(_){}
    try{
      const volume=Number(window.MovieQuizSettings?.musicVolume?.()??50);
      if(volume>0&&typeof switchMusic==='function')switchMusic('menu');
      /* apply again after switchMusic: the exterior guard used to zero musicGain. */
      window.MovieQuizSettings?.apply?.();
    }catch(_){}
  }

  function scheduleAudioIntegrityCheck(event){
    if(insideRealAudioSettings(event?.target))return;
    if(!avatarModalOpen())return;
    queueMicrotask(()=>{
      if(avatarModalOpen())restoreConfiguredAudio();
    });
    requestAnimationFrame(()=>{
      if(avatarModalOpen())restoreConfiguredAudio();
    });
  }

  function installAvatarArrowOnlyGuard(){
    const modal=avatarModal();
    const viewport=document.getElementById('mqAvatarCarouselViewport');
    if(!modal||!viewport||viewport.dataset.mqArrowOnlyGuard==='1')return false;
    viewport.dataset.mqArrowOnlyGuard='1';

    viewport.addEventListener('wheel',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },{capture:true,passive:true});

    for(const type of ['pointerdown','pointerup','pointercancel']){
      viewport.addEventListener(type,event=>{
        if(!avatarModalOpen())return;
        event.stopImmediatePropagation();
      },true);
    }
    for(const type of ['touchstart','touchmove','touchend']){
      viewport.addEventListener(type,event=>{
        if(!avatarModalOpen())return;
        event.stopImmediatePropagation();
      },{capture:true,passive:true});
    }

    /* Avatar cards are previews only. Navigation happens exclusively through
       the two graphical [data-avatar-nav] buttons outside the viewport. */
    viewport.addEventListener('click',event=>{
      if(!avatarModalOpen())return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);
    return true;
  }

  function observeAvatarModal(){
    if(installAvatarArrowOnlyGuard())return;
    const observer=new MutationObserver(()=>{
      if(installAvatarArrowOnlyGuard())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  document.addEventListener('keydown',event=>{
    if(!avatarModalOpen())return;
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  /* Any ordinary interaction on the avatar screen is allowed to do its UI job,
     then the configured music level is re-applied. Only actual Settings controls
     are exempt, because those are the only controls allowed to change audio. */
  document.addEventListener('pointerdown',scheduleAudioIntegrityCheck,true);
  document.addEventListener('click',scheduleAudioIntegrityCheck,true);

  function init(){
    neutralizeLegacyMuteButton();
    observeAvatarModal();
    restoreConfiguredAudio();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.addEventListener('mq:avatar-gallery-opened',restoreConfiguredAudio);
  window.__mqInteractionGuardsVersion=VERSION;
})();

/* Movie Quiz – exterior browser zoom fix v29.0
   26-exterior-scene.js intentionally fits the 1672×941 master into the viewport,
   but using visualViewport dimensions means browser zoom is immediately cancelled
   by another fit-to-screen resize. This later guard preserves the fit scale in
   physical viewport space, so browser zoom can actually magnify/crop the exterior. */
(()=>{
  'use strict';
  const DESIGN_W=1672;
  const DESIGN_H=941;
  const initialDpr=Math.max(.1,Number(window.devicePixelRatio)||1);
  let raf=0;

  function applyZoomSafeExteriorFit(){
    raf=0;
    const stage=document.getElementById('mqExteriorStage');
    if(!stage)return;

    const currentDpr=Math.max(.1,Number(window.devicePixelRatio)||initialDpr);
    const zoomRatio=currentDpr/initialDpr;

    /* innerWidth/innerHeight shrink when desktop browser zoom increases.
       Multiplying by the DPR ratio removes that artificial shrink while still
       responding normally to a real window resize. */
    const physicalCssWidth=Math.max(1,window.innerWidth*zoomRatio);
    const physicalCssHeight=Math.max(1,window.innerHeight*zoomRatio);
    const fit=Math.max(.12,Math.min(physicalCssWidth/DESIGN_W,physicalCssHeight/DESIGN_H));

    stage.style.transform=`translate(-50%,-50%) scale(${fit})`;
  }

  function scheduleZoomSafeExteriorFit(){
    if(raf)cancelAnimationFrame(raf);
    raf=requestAnimationFrame(applyZoomSafeExteriorFit);
  }

  function neutralizeExteriorNativeHoverHints(){
    const scene=document.getElementById('mqExteriorScene');
    if(scene){
      scene.querySelectorAll('[title]').forEach(element=>{
        if(element.id!=='mqTicketBoothHotspot')element.removeAttribute('title');
      });
    }
    document.getElementById('mqDebugToggle')?.removeAttribute('title');
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{neutralizeExteriorNativeHoverHints();scheduleZoomSafeExteriorFit()},{once:true});
  }else{
    neutralizeExteriorNativeHoverHints();
    scheduleZoomSafeExteriorFit();
  }

  /* Registered after 26-exterior-scene.js, then applied in RAF, so this wins
     over the legacy visualViewport fit without touching the rest of exterior JS. */
  window.addEventListener('resize',scheduleZoomSafeExteriorFit,{passive:true});
  window.visualViewport?.addEventListener('resize',scheduleZoomSafeExteriorFit,{passive:true});
  window.addEventListener('orientationchange',scheduleZoomSafeExteriorFit,{passive:true});
  window.addEventListener('mq:preload-entered',scheduleZoomSafeExteriorFit);

  window.MovieQuizExteriorZoom=Object.freeze({
    version:'29.0-zoom-safe',
    updateNow:applyZoomSafeExteriorFit
  });
})();

/* Movie Quiz – cinema Home parity v30.5
   Uses the exact same SVG geometry and cinema-relative positioning as the
   Statistics scene corner Home button. player-settings.js may move #homeBtn to
   document.body during its delayed sync passes, so this guard moves it back to
   #cinema whenever that happens without replacing the button itself/listeners. */
(()=>{
  'use strict';
  const HOME_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>';
  let observer=null;

  function syncCinemaHome(){
    const cinema=document.getElementById('cinema');
    const home=document.getElementById('homeBtn');
    if(!cinema||!home)return false;

    if(home.parentElement!==cinema)cinema.appendChild(home);
    home.classList.add('mq-home-dock');
    home.setAttribute('aria-label','Hlavní menu');
    home.setAttribute('title','Hlavní menu');
    home.dataset.mqTip='Hlavní menu';

    if(home.dataset.mqStatisticsHomeGraphic!=='1'){
      home.dataset.mqStatisticsHomeGraphic='1';
      home.innerHTML=HOME_SVG;
    }
    return true;
  }

  function init(){
    syncCinemaHome();
    setTimeout(syncCinemaHome,420);
    setTimeout(syncCinemaHome,1350);

    if(observer)return;
    observer=new MutationObserver(()=>{
      const home=document.getElementById('homeBtn');
      const cinema=document.getElementById('cinema');
      if(home&&cinema&&home.parentElement!==cinema)queueMicrotask(syncCinemaHome);
    });
    observer.observe(document.body,{childList:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.MovieQuizCinemaHome=Object.freeze({version:'30.5-stats-parity',sync:syncCinemaHome});
})();

/* Movie Quiz – ticket booth hand + bubble controller v30.7
   v11.2: hand stays 20 px farther behind the portal; no-flicker frame stack preserved. All five decoded PNG frames stay mounted in
   the DOM and the controller only switches the active layer, so changing a
   bubble frame can never expose an undecoded/blank image between paints.
   Text visibility is still tied exactly to frame 5. */
(()=>{
  'use strict';

  const ASSET_VERSION='30.6-frame-stack';
  const HAND_SRC=`assets/exterior-v6-9/production/ticket-booth-hand.png?v=${ASSET_VERSION}`;
  const BUBBLE_FRAMES=[1,2,3,4,5].map(n=>`assets/exterior-v6-9/production/bubble_frame_${n}.png?v=${ASSET_VERSION}`);

  /* 3744 ms × 1.15 = 4305.6 ms. */
  const HAND_MS=4306;
  /* Preserve the same point on the slower hand-return timeline. */
  const BUBBLE_START_IN_HAND_MS=3395;
  const BUBBLE_STEP_MS=90;
  const BUBBLE_HOLD_MS=7000;
  const SECOND_HAND_DELAY_MS=1200;
  const HIDDEN_TO_NEXT_HAND_MS=2950;

  let generation=0;
  let running=false;
  let handAnimation=null;
  let bodyObserver=null;
  let initialized=false;

  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const exteriorActive=()=>document.body.classList.contains('mq-exterior-active')&&!document.body.classList.contains('mq-ticket-open');

  function ensureUi(){
    const stage=document.getElementById('mqExteriorStage');
    if(!stage)return null;

    let portal=document.getElementById('mqTicketHandPortal');
    if(!portal){
      portal=document.createElement('div');
      portal.id='mqTicketHandPortal';
      stage.appendChild(portal);
    }
    portal.className='mq-ticket-hand-portal';
    portal.setAttribute('aria-hidden','true');
    portal.dataset.mqBoothVersion=ASSET_VERSION;

    let hand=portal.querySelector('.mq-ticket-hand-img');
    if(!hand){
      portal.replaceChildren();
      hand=document.createElement('img');
      hand.className='mq-ticket-hand-img';
      hand.alt='';
      hand.decoding='async';
      portal.appendChild(hand);
    }
    if(hand.getAttribute('src')!==HAND_SRC)hand.src=HAND_SRC;

    let bubble=document.getElementById('mqTicketBubbleUi');
    if(!bubble){
      bubble=document.createElement('div');
      bubble.id='mqTicketBubbleUi';
      stage.appendChild(bubble);
    }
    bubble.className='mq-ticket-bubble-ui';
    bubble.setAttribute('aria-hidden','true');
    bubble.dataset.mqBoothVersion=ASSET_VERSION;

    let frameWrap=bubble.querySelector('.mq-ticket-bubble-frames');
    let text=bubble.querySelector('.mq-ticket-bubble-text');
    let frames=frameWrap?[...frameWrap.querySelectorAll('.mq-ticket-bubble-frame')]:[];

    if(!frameWrap||frames.length!==5||!text){
      bubble.replaceChildren();

      frameWrap=document.createElement('div');
      frameWrap.className='mq-ticket-bubble-frames';
      frameWrap.setAttribute('aria-hidden','true');

      frames=BUBBLE_FRAMES.map((src,index)=>{
        const img=document.createElement('img');
        img.className='mq-ticket-bubble-frame';
        img.dataset.mqBubbleFrame=String(index+1);
        img.alt='';
        img.decoding='async';
        img.src=src;
        frameWrap.appendChild(img);
        return img;
      });

      text=document.createElement('div');
      text.className='mq-ticket-bubble-text';
      text.innerHTML='Přistupte.<br>máme poslední<br>volná místa!';
      bubble.append(frameWrap,text);
    }else{
      frames.forEach((img,index)=>{
        const src=BUBBLE_FRAMES[index];
        if(img.getAttribute('src')!==src)img.src=src;
      });
    }

    return {stage,portal,hand,bubble,frameWrap,frames,text};
  }

  function preloadOne(src){
    return new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      try{img.fetchPriority='low'}catch(_){}
      img.onload=async()=>{
        try{await img.decode?.()}catch(_){}
        resolve(true);
      };
      img.onerror=()=>resolve(false);
      img.src=src;
    });
  }

  async function preloadAssets(){
    await Promise.all([HAND_SRC,...BUBBLE_FRAMES].map(preloadOne));
  }

  function setBubbleFrame(ui,frameNumber){
    ui.frames.forEach((img,index)=>img.classList.toggle('is-active',index===(frameNumber-1)));
    ui.bubble.dataset.mqBubbleFrame=String(frameNumber);

    const textVisible=frameNumber===5;
    ui.bubble.classList.toggle('is-text-visible',textVisible);
    ui.text.style.opacity=textVisible?'1':'0';
  }

  function resetUi(ui){
    handAnimation?.cancel?.();
    handAnimation=null;
    if(ui?.hand){
      ui.hand.style.transform='translateX(-112px) rotate(0deg)';
      ui.hand.style.opacity='1';
    }
    if(ui?.bubble){
      ui.bubble.classList.remove('is-visible','is-text-visible');
      ui.bubble.style.visibility='hidden';
      ui.bubble.style.opacity='1';
      ui.bubble.style.transform='none';
      ui.bubble.dataset.mqBubbleFrame='0';
    }
    ui?.frames?.forEach(img=>img.classList.remove('is-active'));
    if(ui?.text)ui.text.style.opacity='0';
  }

  function runHand(ui){
    handAnimation?.cancel?.();
    handAnimation=ui.hand.animate([
      {transform:'translateX(-112px) rotate(0deg)',offset:0},
      {transform:'translateX(-20px) rotate(0deg)',offset:.20},
      {transform:'translateX(-20px) rotate(-14deg)',offset:.28},
      {transform:'translateX(-20px) rotate(14deg)',offset:.36},
      {transform:'translateX(-20px) rotate(-14deg)',offset:.44},
      {transform:'translateX(-20px) rotate(14deg)',offset:.52},
      {transform:'translateX(-20px) rotate(0deg)',offset:.60},
      {transform:'translateX(-20px) rotate(0deg)',offset:.72},
      {transform:'translateX(-112px) rotate(0deg)',offset:1}
    ],{
      duration:HAND_MS,
      easing:'cubic-bezier(.42,0,.58,1)',
      fill:'forwards'
    });
    return handAnimation.finished.catch(()=>{});
  }

  async function showBubble(ui,token){
    if(token!==generation||!exteriorActive())return false;

    ui.bubble.style.visibility='visible';
    ui.bubble.classList.add('is-visible');
    ui.bubble.classList.remove('is-text-visible');
    ui.text.style.opacity='0';

    for(let frame=1;frame<=5;frame++){
      if(token!==generation||!exteriorActive())return false;
      setBubbleFrame(ui,frame);
      if(frame<5)await sleep(BUBBLE_STEP_MS);
    }
    return true;
  }

  async function hideBubble(ui,token){
    if(token!==generation||!exteriorActive())return false;

    /* Frame 5 -> 4 hides text in the same operation, before the smaller frame
       is exposed. The frame image itself is already decoded and mounted. */
    for(let frame=4;frame>=1;frame--){
      if(token!==generation||!exteriorActive())return false;
      setBubbleFrame(ui,frame);
      await sleep(BUBBLE_STEP_MS);
    }

    if(token===generation){
      ui.bubble.classList.remove('is-visible','is-text-visible');
      ui.bubble.style.visibility='hidden';
      ui.bubble.dataset.mqBubbleFrame='0';
      ui.frames.forEach(img=>img.classList.remove('is-active'));
      ui.text.style.opacity='0';
    }
    return true;
  }

  async function cycle(token,ui){
    while(token===generation&&exteriorActive()){
      runHand(ui);
      await sleep(BUBBLE_START_IN_HAND_MS);
      if(token!==generation||!exteriorActive())break;

      const shown=await showBubble(ui,token);
      if(!shown)break;

      const secondHandTimer=setTimeout(()=>{
        if(token===generation&&exteriorActive())runHand(ui);
      },SECOND_HAND_DELAY_MS);

      await sleep(BUBBLE_HOLD_MS);
      clearTimeout(secondHandTimer);
      if(token!==generation||!exteriorActive())break;

      await hideBubble(ui,token);
      if(token!==generation||!exteriorActive())break;

      await sleep(HIDDEN_TO_NEXT_HAND_MS);
    }
    resetUi(ui);
    running=false;
  }

  function start(){
    const ui=ensureUi();
    if(!ui)return;
    generation++;
    const token=generation;
    resetUi(ui);
    if(!exteriorActive())return;
    running=true;
    cycle(token,ui);
  }

  function syncToScene(){
    if(!initialized)return;
    if(exteriorActive()){
      if(!running)start();
    }else{
      generation++;
      const ui=ensureUi();
      resetUi(ui);
      running=false;
    }
  }

  async function initController(){
    if(initialized)return;
    initialized=true;
    const ui=ensureUi();
    if(!ui)return;

    await preloadAssets();
    if(!initialized)return;

    /* Decoding the detached preload images warms the resource cache; decode the
       five mounted frame layers too before the first cycle starts. */
    await Promise.all(ui.frames.map(async img=>{try{await img.decode?.()}catch(_){}}));
    syncToScene();

    if(!bodyObserver){
      bodyObserver=new MutationObserver(syncToScene);
      bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    }
  }

  function scheduleController(){
    setTimeout(initController,70);
  }

  if(document.body.classList.contains('mq-preload-released'))scheduleController();
  else window.addEventListener('mq:preload-entered',scheduleController,{once:true});

  window.MovieQuizTicketBoothAnimation=Object.freeze({
    version:'30.7-frame-stack-no-flicker',
    restart:start
  });
})();

/* Movie Quiz v11.15 — loss ending only.
   IMPORTANT: appended after the byte-identical current v28.0 interaction guards,
   so all existing exterior/zoom/hand/bubble behavior above remains untouched. */
;(()=>{
  'use strict';

  function polishEndingLabels(){
    const skip=document.getElementById('creditsSkip');
    const skipLabel=skip?.querySelector('span');
    if(skipLabel)skipLabel.textContent='Zpět';
    if(skip){
      skip.setAttribute('aria-label','Zpět z titulků');
      skip.setAttribute('title','Zpět');
    }
    const replay=document.getElementById('replayEnd');
    if(replay){
      replay.textContent='Odejít ze sálu';
      replay.setAttribute('aria-label','Odejít ze sálu');
      replay.setAttribute('title','Odejít ze sálu');
    }
  }

  polishEndingLabels();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polishEndingLabels,{once:true});

  /* Core uses a 16.992 s credits roll and previously switched to THE END at
     17.112 s (120 ms later). v11.15 halves that post-roll gap to 60 ms. */
  if(typeof creditsThenEnd==='function'){
    creditsThenEnd=function(){
      polishEndingLabels();
      state.locked=true;
      cinema.classList.add('dim');
      $('#filmLives').style.display='none';
      showView('creditsView');
      $('#creditsRoll').innerHTML=`
        <h2>Movie Quiz</h2>
        <div class="credit-block"><div class="credit-role">Dnešní divák</div><div class="credit-name">Filmový znalec v první řadě</div></div>
        <div class="credit-block"><div class="credit-role">Správné odpovědi</div><div class="credit-name">${state.score} z 15</div></div>
        <div class="credit-block"><div class="credit-role">Režim projekce</div><div class="credit-name">${difficultyLabels[state.difficulty]} · ${genreLabels[state.genre]}</div></div>
        <div class="credit-block"><div class="credit-role">Projekce</div><div class="credit-name">Skončila po ${state.questionNo}. otázce</div></div>
        <div class="credit-block"><div class="credit-role">Poděkování</div><div class="credit-name">Všem filmům, které stojí za další zhlédnutí</div></div>
        <div class="credit-block"><div class="credit-role">Konec projekce</div><div class="credit-name">Prosíme, rozsviťte v sále</div></div>`;
      const roll=$('#creditsRoll');
      roll.style.animation='none';
      void roll.offsetWidth;
      roll.style.animation='creditsRoll 16.992s linear forwards';
      switchMusic('credits');
      sound('credits');
      creditsEndTimer=setTimeout(()=>{
        creditsEndTimer=null;
        showView('endView');
        const score=$('#endScore');
        if(score){
          score.innerHTML=`<span class="mq-end-score-number">${state.score}</span><span class="mq-end-score-copy">správných odpovědí · ${difficultyLabels[state.difficulty]} · ${genreLabels[state.genre]}</span>`;
        }
        $('#endCard').classList.add('reveal');
        sound('end');
      },17052);
    };
  }
})();


/* Movie Quiz v11.16 — global zoom / repaint isolation.
   The Statistics scene is stable because it removes every inactive cinema layer
   from painting. Apply the same principle to the regular #screen views without
   changing their authored geometry: inactive views do not paint at all and the
   one active view is kept as a single isolated compositor plane. */
;(()=>{
  'use strict';
  const VERSION='11.16-global-paint-isolation';
  let observer=null;
  let raf=0;

  function syncViewPaintState(){
    raf=0;
    const screen=document.getElementById('screen');
    if(!screen)return;
    const views=[...screen.children].filter(node=>node.classList?.contains('view'));
    const active=views.find(view=>view.classList.contains('active'))||null;

    for(const view of views){
      const isActive=view===active;
      view.dataset.mqPaintState=isActive?'active':'inactive';
      view.setAttribute('aria-hidden',isActive?'false':'true');
      try{view.inert=!isActive}catch(_){}
    }
    screen.dataset.mqPaintView=active?.id||'none';
  }

  function scheduleSync(){
    if(raf)cancelAnimationFrame(raf);
    syncViewPaintState();
    raf=requestAnimationFrame(syncViewPaintState);
  }

  function install(){
    const screen=document.getElementById('screen');
    if(!screen)return;
    syncViewPaintState();

    observer?.disconnect?.();
    observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>m.type==='attributes'&&m.attributeName==='class'))scheduleSync();
    });
    [...screen.children].forEach(node=>{
      if(node.classList?.contains('view'))observer.observe(node,{attributes:true,attributeFilter:['class']});
    });

    window.addEventListener('resize',scheduleSync,{passive:true});
    window.visualViewport?.addEventListener('resize',scheduleSync,{passive:true});
    window.visualViewport?.addEventListener('scroll',scheduleSync,{passive:true});
    window.addEventListener('orientationchange',scheduleSync,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleSync()},{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.MovieQuizZoomIsolation=Object.freeze({version:VERSION,sync:scheduleSync});
})();


/* ==========================================================================
   Movie Quiz v11.18 — NÁHODNÉ + canonical question IDs + genre attribution
   --------------------------------------------------------------------------
   Architecture:
   - "random" is a game-selection mode, not a seventh source genre.
   - One server-verified random session contains questions from all six genres.
   - The server resolves every source genre from question_id, never from client text.
   - Completed random answers are redistributed into the six real genre profiles.
   - Overall game history still shows the completed projection as "Náhodné".
   ========================================================================== */
;(()=>{
  'use strict';

  const VERSION='11.18.4-random-question-mark';
  const RANDOM='random';
  const RANDOM_LABEL='Náhodné';
  const SOURCE_GENRES=['fantasy','horror','scifi','crime','animation','comedy'];
  const LABELS={
    fantasy:'Fantasy',
    horror:'Horor',
    scifi:'Sci-fi',
    crime:'Krimi a thriller',
    animation:'Animace',
    comedy:'Komedie'
  };

  const baseStartGame=window.startGame;
  const baseNextQuestion=window.nextQuestion;
  const baseAnswer=window.answer;
  const baseQuestionBank=window.MovieQuizQuestionBank||null;

  let active=false;
  let finished=false;
  let sessionId='';
  let currentQuestion=null;
  let loading=false;
  let answering=false;
  let shownAt=0;
  let activeAudio=null;
  let statsBusy=false;
  let statsTimer=0;
  let statsObserver=null;
  let lastQuestionId='';

  const onlineApi=()=>window.MovieQuizOnline;
  const questionWrap=()=>document.querySelector('#game .question-wrap');
  const rows=data=>Array.isArray(data)?data:(data?[data]:[]);
  const integer=v=>Math.max(0,Math.round(Number(v)||0));
  const number=v=>Number.isFinite(Number(v))?Number(v):0;
  const pct=v=>`${Math.max(0,Math.min(100,number(v))).toLocaleString('cs-CZ',{maximumFractionDigits:1})} %`;
  const gamesWord=n=>n===1?'hra':n>=2&&n<=4?'hry':'her';

  function jsonValue(value,fallback=[]){
    if(Array.isArray(value))return value;
    if(value&&typeof value==='object')return value;
    if(typeof value==='string'){try{return JSON.parse(value)}catch(_){}}
    return fallback;
  }

  function addLabel(){
    try{genreLabels[RANDOM]=RANDOM_LABEL}catch(_){}
  }

  function installButton(){
    addLabel();
    const grid=document.querySelector('#genres .genre-grid');
    if(!grid)return false;
    grid.classList.add('mq-random-seven');
    if(grid.querySelector('.genre-card[data-genre="random"]'))return true;

    const button=document.createElement('button');
    button.type='button';
    button.className='selection-card genre-card mq-random-genre-card';
    button.dataset.genre=RANDOM;
    button.setAttribute('aria-label','Náhodný mix všech filmových žánrů');
    button.innerHTML=`
      <span class="selection-icon genre-icon mq-random-question-mark" aria-hidden="true">?</span>
      <span class="card-copy"><strong>${RANDOM_LABEL}</strong></span>`;
    button.addEventListener('click',()=>window.startGame?.(RANDOM));
    grid.appendChild(button);
    return true;
  }

  function tagQuestion(questionId,sourceGenre='',externalId=''){
    const id=String(questionId||'').trim();
    lastQuestionId=id;
    const wrap=questionWrap();
    const q=document.getElementById('question');
    const answers=document.querySelectorAll('#answers .answer');

    for(const el of [wrap,q]){
      if(!el)continue;
      if(id)el.dataset.questionId=id;else delete el.dataset.questionId;
      if(externalId)el.dataset.questionExternalId=String(externalId);else delete el.dataset.questionExternalId;
      if(sourceGenre)el.dataset.questionSourceGenre=sourceGenre;else delete el.dataset.questionSourceGenre;
    }
    answers.forEach(el=>{
      if(id)el.dataset.questionId=id;else delete el.dataset.questionId;
    });
  }

  function mediaStage(){
    let stage=document.getElementById('mqMediaStage');
    if(stage)return stage;
    stage=document.createElement('div');
    stage.id='mqMediaStage';
    document.getElementById('question')?.parentNode?.insertBefore(stage,document.getElementById('question'));
    return stage;
  }

  function stopMedia(){
    if(activeAudio){try{activeAudio.pause()}catch(_){} activeAudio=null}
    mediaStage().innerHTML='';
  }

  function publicMediaUrl(storagePath){
    const db=onlineApi()?.getClient?.();
    if(db){
      const result=db.storage.from('quiz-media').getPublicUrl(storagePath);
      if(result?.data?.publicUrl)return result.data.publicUrl;
    }
    return `https://ymfaskxcgtgflhnjoylz.supabase.co/storage/v1/object/public/quiz-media/${String(storagePath||'').split('/').map(encodeURIComponent).join('/')}`;
  }

  function formatSeconds(value){
    const total=Math.max(0,Math.ceil(Number(value)||0));
    return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`;
  }

  function renderMedia(mediaItems){
    stopMedia();
    const stage=mediaStage();
    const items=jsonValue(mediaItems,[]);
    if(!items.length)return;
    const item=items[0]||{};
    const path=item.storagePath||item.storage_path;
    if(!path)return;
    const url=publicMediaUrl(path);
    const type=item.type||'';

    if(type==='image'){
      const img=document.createElement('img');
      img.className='mq-media-image';img.src=url;img.alt='Obrazová filmová otázka';img.loading='eager';img.decoding='async';
      stage.appendChild(img);return;
    }
    if(type==='video'){
      const video=document.createElement('video');
      video.className='mq-media-video';video.src=url;video.controls=true;video.preload='metadata';video.playsInline=true;
      stage.appendChild(video);return;
    }
    if(type!=='audio')return;

    const clipStart=Math.max(0,Number(item.clipStartMs||item.clip_start_ms||0)/1000);
    const rawEnd=item.clipEndMs??item.clip_end_ms;
    const clipEnd=rawEnd==null?null:Math.max(clipStart,Number(rawEnd)/1000);
    const audio=new Audio(url);audio.preload='metadata';activeAudio=audio;

    const card=document.createElement('div');card.className='mq-audio-card';
    const head=document.createElement('div');head.className='mq-audio-head';
    const button=document.createElement('button');button.type='button';button.className='mq-audio-play';button.textContent='▶';button.setAttribute('aria-label','Přehrát zvukovou ukázku');
    const copy=document.createElement('div');copy.className='mq-audio-copy';
    const title=document.createElement('div');title.className='mq-audio-title';title.textContent='Zvuková stopa';
    const time=document.createElement('div');time.className='mq-audio-time';time.textContent='Připraveno k přehrání';
    const progress=document.createElement('div');progress.className='mq-audio-progress';progress.innerHTML='<i></i>';
    copy.append(title,time);head.append(button,copy);card.append(head,progress);stage.appendChild(card);
    const fill=progress.querySelector('i');

    const duration=()=>{
      if(clipEnd!=null)return Math.max(.1,clipEnd-clipStart);
      if(Number.isFinite(audio.duration))return Math.max(.1,audio.duration-clipStart);
      return Math.max(.1,Number(item.durationMs||item.duration_ms||10000)/1000);
    };
    const reset=()=>{
      audio.pause();button.textContent='▶';fill.style.width='0%';time.textContent=`Ukázka ${formatSeconds(duration())}`;
      try{audio.currentTime=clipStart}catch(_){}
    };
    const update=()=>{
      const elapsed=Math.max(0,audio.currentTime-clipStart),d=duration();
      fill.style.width=`${Math.min(100,elapsed/d*100)}%`;
      time.textContent=`Zbývá ${formatSeconds(Math.max(0,d-elapsed))}`;
      if((clipEnd!=null&&audio.currentTime>=clipEnd)||elapsed>=d)reset();
    };
    button.addEventListener('click',async()=>{
      if(!audio.paused){audio.pause();button.textContent='▶';return}
      if(audio.currentTime<clipStart||audio.currentTime>=clipStart+duration())audio.currentTime=clipStart;
      try{await audio.play();button.textContent='❚❚'}catch(_){time.textContent='Zvuk se nepodařilo přehrát'}
    });
    audio.addEventListener('loadedmetadata',()=>{if(audio.currentTime<clipStart)audio.currentTime=clipStart;time.textContent=`Ukázka ${formatSeconds(duration())}`});
    audio.addEventListener('timeupdate',update);
    audio.addEventListener('pause',()=>{if(audio.currentTime<clipStart+duration())button.textContent='▶'});
    audio.addEventListener('ended',reset);
    if(item.autoplay)audio.addEventListener('canplay',()=>button.click(),{once:true});
  }

  function loadingState(){
    state.locked=true;
    questionWrap()?.classList.add('mq-db-loading');
    document.getElementById('qType').textContent='Online databáze';
    document.getElementById('qEra').textContent=RANDOM_LABEL;
    document.getElementById('question').textContent='Losuji otázku napříč filmovými žánry…';
    answersEl.innerHTML='<div class="mq-db-loading-card"><i class="mq-db-spinner" aria-hidden="true"></i><span>Chystá se další filmová otázka</span></div>';
    stopMedia();
  }

  function errorState(error){
    console.error('Movie Quiz random:',error);
    state.locked=true;
    questionWrap()?.classList.remove('mq-db-loading');
    document.getElementById('qType').textContent='Online databáze';
    document.getElementById('qEra').textContent=RANDOM_LABEL;
    document.getElementById('question').textContent='Náhodnou otázku se nepodařilo načíst';
    answersEl.innerHTML=`<div class="mq-db-error-card">
      <strong>Náhodný režim zůstal aktivní</strong>
      <span>${String(error?.message||'Databázová část režimu Náhodné ještě není dostupná.')}</span>
      <div class="mq-db-error-actions">
        <button type="button" class="mq-db-retry" id="mqRandomRetry">Zkusit znovu</button>
        <button type="button" class="mq-db-menu" id="mqRandomMenu">Zpět do nabídky</button>
      </div>
    </div>`;
    document.getElementById('mqRandomRetry')?.addEventListener('click',()=>loadQuestion());
    document.getElementById('mqRandomMenu')?.addEventListener('click',()=>document.getElementById('homeBtn')?.click());
  }

  async function ensureSession(){
    if(sessionId)return sessionId;
    const {client:db}=await onlineApi().ensureBackend();
    const {data,error}=await db.rpc('start_random_quiz_session',{
      p_game_mode:'classic',
      p_difficulty:state.difficulty,
      p_question_count:18,
      p_client_version:'v11.18-random-balanced'
    });
    if(error)throw error;
    const row=rows(data)[0];
    const id=String(row?.session_id||'');
    if(!id)throw new Error('Supabase nevrátil identifikátor náhodné hry.');
    sessionId=id;
    window.__mqServerVerifiedSessionActive=true;
    return id;
  }

  function parseQuestion(row){
    const options=jsonValue(row.options,[]).map(item=>({
      id:item.id,
      text:item.text??item.option_text??''
    })).filter(item=>item.id&&item.text);
    if(options.length!==4)throw new Error('Otázka nemá přesně čtyři možnosti odpovědi.');

    const questionId=String(row.question_id||'').trim();
    if(!questionId)throw new Error('Otázka nemá databázové ID.');

    return {
      server:true,
      randomMode:true,
      questionId,
      externalId:String(row.question_external_id||''),
      sourceGenre:String(row.source_genre||''),
      q:row.prompt,
      type:row.question_type,
      typeLabel:row.type_label||'Film',
      eraLabel:row.era_label||'Napříč érami',
      tags:row.question_tags||[],
      options,
      media:row.media||[]
    };
  }

  function renderQuestion(question){
    questionWrap()?.classList.remove('mq-db-loading','mq-db-error');
    currentQuestion=question;
    state.current={...question};
    state.locked=false;

    document.getElementById('question').textContent=question.q;
    document.getElementById('qType').textContent=question.typeLabel;
    document.getElementById('qEra').textContent=question.eraLabel;
    document.getElementById('questionNo').textContent=state.questionNo;
    document.getElementById('score').textContent=state.score;
    document.getElementById('progress').style.width=`${state.score/15*100}%`;
    answersEl.innerHTML='';

    question.options.forEach((option,index)=>{
      const button=document.createElement('button');
      button.className='answer';
      button.dataset.letter='ABCD'[index];
      button.dataset.optionId=option.id;
      button.dataset.questionId=question.questionId;
      button.textContent=option.text;
      button.addEventListener('click',()=>window.answer?.(button,option.id));
      answersEl.appendChild(button);
    });

    tagQuestion(question.questionId,question.sourceGenre,question.externalId);
    renderMedia(question.media);
    shownAt=performance.now();

    window.dispatchEvent(new CustomEvent('mq:server-question-rendered',{detail:{
      sessionId,
      questionId:question.questionId,
      questionExternalId:question.externalId,
      prompt:question.q,
      typeLabel:question.typeLabel,
      eraLabel:question.eraLabel,
      genre:RANDOM,
      sourceGenre:question.sourceGenre,
      difficulty:state.difficulty
    }}));

    try{animateQuestionIn();sound('tick')}catch(_){}
  }

  async function loadQuestion(){
    if(!active||loading||finished)return;
    loading=true;
    window.dispatchEvent(new CustomEvent('mq:server-question-cleared'));
    currentQuestion=null;
    tagQuestion('');
    loadingState();
    try{
      const sid=await ensureSession();
      const {client:db}=await onlineApi().ensureBackend();
      const {data,error}=await db.rpc('get_next_random_quiz_question',{p_session_id:sid});
      if(error)throw error;
      const row=rows(data)[0];
      if(!row)throw new Error('Databáze nevrátila další náhodnou otázku.');
      renderQuestion(parseQuestion(row));
    }catch(error){
      errorState(error);
    }finally{
      loading=false;
    }
  }

  async function answerRandom(button,optionId){
    if(!active||finished||answering||state.locked||!currentQuestion)return;
    answering=true;
    state.locked=true;
    stopMedia();

    const buttons=[...document.querySelectorAll('#answers .answer')];
    buttons.forEach(item=>item.classList.add('locked'));
    button.classList.add('mq-checking');

    try{
      const {client:db}=await onlineApi().ensureBackend();
      const responseMs=Math.max(0,Math.round(performance.now()-shownAt));
      const {data,error}=await db.rpc('submit_random_quiz_answer',{
        p_session_id:sessionId,
        p_question_id:currentQuestion.questionId,
        p_option_id:optionId,
        p_response_ms:responseMs
      });
      if(error)throw error;
      const result=rows(data)[0];
      if(!result)throw new Error('Databáze nepotvrdila odpověď.');

      button.classList.remove('mq-checking');
      const good=Boolean(result.answer_correct);
      const correctButton=buttons.find(item=>item.dataset.optionId===String(result.correct_option_id));

      window.__mqLastAnswerCorrect=good;
      if(good){button.classList.add('correct','answer-correct-pulse');sound('correct')}
      else{
        button.classList.add('wrong','answer-wrong-pulse');
        correctButton?.classList.add('correct','correct-answer-blink');
        sound('wrong');
      }

      await throwAward(button);
      window.__mqLastAnswerCorrect=undefined;

      state.score=Number(result.current_score)||0;
      state.lives=Math.max(0,Number(result.current_lives)||0);
      document.getElementById('score').textContent=state.score;
      document.getElementById('progress').style.width=`${state.score/15*100}%`;

      if(good){showFeedback('Správně');confettiBurst(button)}
      else burnLife(state.lives);

      const gameFinished=Boolean(result.game_finished);
      const won=Boolean(result.game_won);
      if(gameFinished)finished=true;

      const wait=good?1350:1900;
      setTimeout(()=>{
        answering=false;
        if(!active)return;
        if(gameFinished){
          if(won)win();else creditsThenEnd();
          scheduleStatsSync(650);
          return;
        }
        state.questionNo++;
        window.nextQuestion?.();
      },wait);
    }catch(error){
      button.classList.remove('mq-checking');
      state.locked=false;
      answering=false;
      buttons.forEach(item=>item.classList.remove('locked'));
      console.error('Movie Quiz random: odpověď se nepodařilo ověřit.',error);
      try{showFeedback('Zkuste odpověď znovu')}catch(_){}
    }
  }

  async function abandon(){
    const id=sessionId;
    sessionId='';
    if(!id||finished)return;
    try{
      const {client:db}=await onlineApi().ensureBackend();
      await db.rpc('abandon_quiz_session',{p_session_id:id});
    }catch(error){
      console.warn('Movie Quiz random: rozehranou relaci se nepodařilo označit jako opuštěnou.',error);
    }
  }

  function cleanup(abandonOpen=true){
    if(abandonOpen)abandon();
    active=false;
    finished=false;
    sessionId='';
    currentQuestion=null;
    loading=false;
    answering=false;
    window.__mqServerVerifiedSessionActive=false;
    tagQuestion('');
    stopMedia();
  }

  function startRandom(){
    if(active)cleanup(true);
    active=true;
    finished=false;
    sessionId='';
    currentQuestion=null;
    loading=false;
    answering=false;
    addLabel();

    const result=baseStartGame(RANDOM);
    /* js/21 deliberately treats unknown genres as local mode. We immediately
       promote this one mode to our verified random RPC before the first question. */
    window.__mqServerVerifiedSessionActive=true;
    return result;
  }

  window.startGame=function(genre){
    if(genre===RANDOM)return startRandom();
    if(active)cleanup(true);
    return baseStartGame(genre);
  };

  window.nextQuestion=function(){
    if(!active)return baseNextQuestion();
    return loadQuestion();
  };

  window.answer=function(button,value){
    if(!active)return baseAnswer(button,value);
    return answerRandom(button,value);
  };

  function wrapBank(){
    const bank=window.MovieQuizQuestionBank||baseQuestionBank;
    if(!bank||bank.__mqRandomV1118)return;
    window.MovieQuizQuestionBank=Object.freeze({
      ...bank,
      __mqRandomV1118:true,
      isServerMode:()=>active||Boolean(bank.isServerMode?.()),
      getSessionId:()=>active?sessionId:(bank.getSessionId?.()||''),
      getCurrentQuestionId:()=>active?(currentQuestion?.questionId||''):(bank.getCurrentQuestionId?.()||''),
      getCurrentQuestion:()=>active&&currentQuestion?Object.freeze({
        sessionId,
        questionId:currentQuestion.questionId,
        questionExternalId:currentQuestion.externalId,
        prompt:currentQuestion.q,
        typeLabel:currentQuestion.typeLabel,
        eraLabel:currentQuestion.eraLabel,
        genre:RANDOM,
        sourceGenre:currentQuestion.sourceGenre,
        difficulty:state.difficulty
      }):bank.getCurrentQuestion?.(),
      getSupportedGenres:()=>[...new Set([...(bank.getSupportedGenres?.()||[]),RANDOM])],
      version:`${bank.version||'question-bank'}+${VERSION}`
    });
  }

  /* -------------------------- statistics merge -------------------------- */

  function genreCard(item){
    const games=integer(item.games),wins=integer(item.wins);
    const correct=integer(item.correct_answers),answered=integer(item.questions_answered);
    const accuracy=Math.max(0,Math.min(100,number(item.accuracy_percent)));
    return `<article class="mq-stat-genre" data-genre="${item.genre}">
      <div class="mq-stat-genre-head"><strong>${LABELS[item.genre]||item.genre}</strong><span>${games} ${gamesWord(games)}</span></div>
      <div class="mq-stat-bar"><i style="width:${accuracy}%"></i></div>
      <div class="mq-stat-genre-foot"><span>${pct(accuracy)}</span><span>${wins} výher</span></div>
      <div class="mq-stat-genre-note">${correct} správně z ${answered} odpovězených</div>
    </article>`;
  }

  function playedCard(item,index,maxGames){
    const games=integer(item.games),wins=integer(item.wins);
    const width=Math.max(4,Math.min(100,maxGames?games/maxGames*100:0));
    const winRate=number(item.win_rate_percent)||(games?wins/games*100:0);
    return `<article class="mq-stat-played-genre" data-genre="${item.genre}">
      <div class="mq-stat-played-rank">${index+1}</div>
      <div class="mq-stat-played-copy">
        <div class="mq-stat-played-head"><strong>${LABELS[item.genre]||item.genre}</strong><span>${games} ${gamesWord(games)}</span></div>
        <div class="mq-stat-played-bar"><i style="width:${width}%"></i></div>
        <small>${wins} výher · ${pct(winRate)} výhernost</small>
      </div>
    </article>`;
  }

  function normalizeStatData(data){
    let value=Array.isArray(data)?data[0]:data;
    if(typeof value==='string'){try{value=JSON.parse(value)}catch(_){return null}}
    return value&&typeof value==='object'?value:null;
  }

  async function syncRandomStatistics(){
    const scene=document.getElementById('mqStatisticsScene');
    if(!scene||scene.hidden||statsBusy)return;
    const genreHost=scene.querySelector('.mq-stat-genres');
    if(!genreHost||genreHost.dataset.mqRandomMerged==='1'){
      normalizeHistoryLabels(scene);
      return;
    }

    statsBusy=true;
    try{
      const {client:db}=await onlineApi().ensureBackend();
      const [baseResult,randomResult]=await Promise.all([
        db.rpc('get_my_player_statistics'),
        db.rpc('get_my_random_genre_statistics')
      ]);
      if(baseResult.error)throw baseResult.error;
      if(randomResult.error)throw randomResult.error;

      const stats=normalizeStatData(baseResult.data);
      if(!stats)return;

      const baseGenres=Array.isArray(stats.byGenre)?stats.byGenre:[];
      const extras=rows(randomResult.data);
      const extraByGenre=new Map(extras.map(item=>[String(item.genre||''),item]));

      const realBaseAnswered=baseGenres
        .filter(item=>SOURCE_GENRES.includes(String(item?.genre||'')))
        .reduce((sum,item)=>sum+integer(item?.questions_answered),0);
      const summaryAnswered=integer(stats?.summary?.questionsAnswered);
      const extraAnswered=extras.reduce((sum,item)=>sum+integer(item?.questions_answered),0);

      /* If overall answered > the six real genre rows, the legacy statistics
         grouped random-session answers under "random" (or omitted them). Only in
         that case do we redistribute our canonical question-id attribution.
         If a future backend already groups by question.genre, this stays zero and
         prevents double counting automatically. */
      const missingFromRealGenres=Math.max(0,summaryAnswered-realBaseAnswered);
      const addRandomContributions=extraAnswered>0&&missingFromRealGenres>0;

      const merged=SOURCE_GENRES.map(key=>{
        const base=baseGenres.find(item=>String(item?.genre||'')===key)||{};
        const extra=extraByGenre.get(key)||{};
        const baseAnswered=integer(base.questions_answered);
        const baseCorrect=integer(base.correct_answers);
        const answered=baseAnswered+(addRandomContributions?integer(extra.questions_answered):0);
        const correct=baseCorrect+(addRandomContributions?integer(extra.correct_answers):0);
        const games=integer(base.games);
        const wins=integer(base.wins);
        return {
          genre:key,
          label:LABELS[key],
          games,
          wins,
          correct_answers:correct,
          questions_answered:answered,
          accuracy_percent:answered?correct/answered*100:0,
          win_rate_percent:number(base.win_rate_percent)||(games?wins/games*100:0)
        };
      });

      genreHost.innerHTML=merged.map(genreCard).join('');
      genreHost.dataset.mqRandomMerged='1';

      const playedHost=scene.querySelector('.mq-stat-played-genres');
      if(playedHost){
        const played=merged
          .filter(item=>item.games>0)
          .sort((a,b)=>b.games-a.games||b.wins-a.wins)
          .slice(0,6);
        const maxGames=Math.max(1,...played.map(item=>item.games));
        playedHost.innerHTML=played.length
          ? played.map((item,index)=>playedCard(item,index,maxGames)).join('')
          : '<div class="mq-stat-state"><small>Zatím bez odehraných žánrů.</small></div>';
      }

      const eligibleBest=merged.filter(item=>item.questions_answered>0);
      const best=[...eligibleBest].sort((a,b)=>b.accuracy_percent-a.accuracy_percent||b.questions_answered-a.questions_answered)[0]||null;
      const most=[...merged].filter(item=>item.games>0).sort((a,b)=>b.games-a.games||b.wins-a.wins)[0]||null;
      const highlights=scene.querySelectorAll('.mq-stat-highlight');

      if(highlights[0]){
        const strong=highlights[0].querySelector('strong');
        const small=highlights[0].querySelector('small');
        if(strong)strong.textContent=best?LABELS[best.genre]:'—';
        if(small)small.textContent=best?`${pct(best.accuracy_percent)} · ${best.wins} výher`:'Zatím neurčeno';
      }
      if(highlights[1]){
        const strong=highlights[1].querySelector('strong');
        const small=highlights[1].querySelector('small');
        if(strong)strong.textContent=most?LABELS[most.genre]:'—';
        if(small)small.textContent=most?`${most.games} her · ${pct(most.win_rate_percent)} výher`:'Zatím neurčeno';
      }

      normalizeHistoryLabels(scene);
    }catch(error){
      console.warn('Movie Quiz random: žánrové statistiky Náhodného režimu se nepodařilo sloučit.',error);
    }finally{
      statsBusy=false;
    }
  }

  function normalizeHistoryLabels(scene=document){
    scene.querySelectorAll('.mq-stat-game-main strong').forEach(el=>{
      const value=String(el.textContent||'').trim().toLowerCase();
      if(value==='random'||value==='náhodné')el.textContent=RANDOM_LABEL;
    });
  }

  function scheduleStatsSync(delay=90){
    if(statsTimer)clearTimeout(statsTimer);
    statsTimer=setTimeout(()=>{statsTimer=0;syncRandomStatistics()},delay);
  }

  function installStatsObserver(){
    const scene=document.getElementById('mqStatisticsScene');
    if(!scene||statsObserver)return;
    statsObserver=new MutationObserver(mutations=>{
      const becameVisible=mutations.some(m=>m.type==='attributes'&&m.attributeName==='hidden');
      const bodyChanged=mutations.some(m=>m.type==='childList');
      if(becameVisible||bodyChanged)scheduleStatsSync(110);
    });
    statsObserver.observe(scene,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
    document.addEventListener('click',event=>{
      if(event.target.closest?.('[data-open-statistics],#mqStatRefresh'))scheduleStatsSync(180);
    });
  }

  function installIds(){
    window.addEventListener('mq:server-question-rendered',event=>{
      const detail=event.detail||{};
      tagQuestion(detail.questionId,detail.sourceGenre||'',detail.questionExternalId||'');
    });
    window.addEventListener('mq:server-question-cleared',()=>{
      if(!active)tagQuestion('');
    });

    window.MovieQuizQuestionIds=Object.freeze({
      version:VERSION,
      current:()=>lastQuestionId||window.MovieQuizQuestionBank?.getCurrentQuestionId?.()||'',
      sourceGenre:()=>questionWrap()?.dataset.questionSourceGenre||'',
      externalId:()=>questionWrap()?.dataset.questionExternalId||'',
      isRandomMode:()=>active
    });
  }

  function install(){
    addLabel();
    installButton();
    wrapBank();
    installIds();
    installStatsObserver();

    document.getElementById('homeBtn')?.addEventListener('click',()=>{if(active)cleanup(true)});
    ['replayEnd','replayWin','creditsSkip'].forEach(id=>{
      document.getElementById(id)?.addEventListener('click',()=>{if(active)cleanup(false)});
    });
    window.addEventListener('beforeunload',()=>{if(active&&!finished)abandon()});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.MovieQuizRandomMode=Object.freeze({
    version:VERSION,
    label:RANDOM_LABEL,
    sourceGenres:Object.freeze([...SOURCE_GENRES]),
    active:()=>active,
    sessionId:()=>sessionId,
    currentQuestionId:()=>currentQuestion?.questionId||''
  });
})();
