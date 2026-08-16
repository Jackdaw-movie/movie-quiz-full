(()=>{
  'use strict';
  const VERSION='interaction-guards-v28.0';

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

/* Movie Quiz – ticket booth hand + bubble controller v30.6
   v11.1: no-flicker frame stack. All five decoded PNG frames stay mounted in
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
      text.innerHTML='Pojďte sem,<br>máme poslední<br>volná místa!';
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
      {transform:'translateX(0px) rotate(0deg)',offset:.20},
      {transform:'translateX(0px) rotate(-14deg)',offset:.28},
      {transform:'translateX(0px) rotate(14deg)',offset:.36},
      {transform:'translateX(0px) rotate(-14deg)',offset:.44},
      {transform:'translateX(0px) rotate(14deg)',offset:.52},
      {transform:'translateX(0px) rotate(0deg)',offset:.60},
      {transform:'translateX(0px) rotate(0deg)',offset:.72},
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
    version:'30.6-frame-stack-no-flicker',
    restart:start
  });
})();
