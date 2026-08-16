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
    try{if(typeof state!=='undefined'&&state)state.muted=false}catch(_){}
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended')audioCtx.resume?.().catch?.(()=>{});
    }catch(_){}
    try{window.MovieQuizSettings?.apply?.()}catch(_){}
    try{
      const volume=Number(window.MovieQuizSettings?.musicVolume?.()??50);
      if(volume>0&&typeof switchMusic==='function')switchMusic('menu');
      window.MovieQuizSettings?.apply?.();
    }catch(_){}
  }

  function scheduleAudioIntegrityCheck(event){
    if(insideRealAudioSettings(event?.target))return;
    if(!avatarModalOpen())return;
    queueMicrotask(()=>{if(avatarModalOpen())restoreConfiguredAudio()});
    requestAnimationFrame(()=>{if(avatarModalOpen())restoreConfiguredAudio()});
  }

  function installAvatarArrowOnlyGuard(){
    const modal=avatarModal();
    const viewport=document.getElementById('mqAvatarCarouselViewport');
    if(!modal||!viewport||viewport.dataset.mqArrowOnlyGuard==='1')return false;
    viewport.dataset.mqArrowOnlyGuard='1';
    viewport.addEventListener('wheel',event=>{if(avatarModalOpen())event.stopImmediatePropagation()},{capture:true,passive:true});
    for(const type of ['pointerdown','pointerup','pointercancel'])viewport.addEventListener(type,event=>{if(avatarModalOpen())event.stopImmediatePropagation()},true);
    for(const type of ['touchstart','touchmove','touchend'])viewport.addEventListener(type,event=>{if(avatarModalOpen())event.stopImmediatePropagation()},{capture:true,passive:true});
    viewport.addEventListener('click',event=>{
      if(!avatarModalOpen())return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);
    return true;
  }

  function observeAvatarModal(){
    if(installAvatarArrowOnlyGuard())return;
    const observer=new MutationObserver(()=>{if(installAvatarArrowOnlyGuard())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  document.addEventListener('keydown',event=>{
    if(!avatarModalOpen())return;
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

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

/* Movie Quiz – exterior browser zoom fix v29.0 */
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
    if(scene)scene.querySelectorAll('[title]').forEach(element=>{if(element.id!=='mqTicketBoothHotspot')element.removeAttribute('title')});
    document.getElementById('mqDebugToggle')?.removeAttribute('title');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{neutralizeExteriorNativeHoverHints();scheduleZoomSafeExteriorFit()},{once:true});
  else{neutralizeExteriorNativeHoverHints();scheduleZoomSafeExteriorFit()}
  window.addEventListener('resize',scheduleZoomSafeExteriorFit,{passive:true});
  window.visualViewport?.addEventListener('resize',scheduleZoomSafeExteriorFit,{passive:true});
  window.addEventListener('orientationchange',scheduleZoomSafeExteriorFit,{passive:true});
  window.addEventListener('mq:preload-entered',scheduleZoomSafeExteriorFit);
  window.MovieQuizExteriorZoom=Object.freeze({version:'29.0-zoom-safe',updateNow:applyZoomSafeExteriorFit});
})();

/* Movie Quiz – ticket booth hand + bubble controller v30.2
   Uses the approved static hand and the unclipped final bubble asset. */
(()=>{
  'use strict';

  const HAND_SRC='assets/exterior-v6-9/production/ticket-booth-hand.png';
  const BUBBLE_SRC='assets/exterior-v6-9/production/ticket-booth-bubble-final.png';
  const BUBBLE_TRANSITION_MS=154;
  const HAND_MS=3120;
  const BUBBLE_START_IN_HAND_MS=2460;
  const BUBBLE_HOLD_MS=7000;
  const TEXT_DELAY_MS=800;
  const SECOND_HAND_DELAY_MS=1200;
  const HIDDEN_TO_NEXT_HAND_MS=2950;

  let generation=0;
  let running=false;
  let handAnimation=null;
  let bubbleAnimation=null;

  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const exteriorActive=()=>document.body.classList.contains('mq-exterior-active')&&!document.body.classList.contains('mq-ticket-open');

  function ensureUi(){
    const stage=document.getElementById('mqExteriorStage');
    if(!stage)return null;

    let portal=document.getElementById('mqTicketHandPortal');
    if(!portal){
      portal=document.createElement('div');
      portal.id='mqTicketHandPortal';
      portal.className='mq-ticket-hand-portal';
      portal.setAttribute('aria-hidden','true');
      portal.innerHTML=`<img class="mq-ticket-hand-img" src="${HAND_SRC}" alt="">`;
      stage.appendChild(portal);
    }

    let bubble=document.getElementById('mqTicketBubbleUi');
    if(!bubble){
      bubble=document.createElement('div');
      bubble.id='mqTicketBubbleUi';
      bubble.className='mq-ticket-bubble-ui';
      bubble.setAttribute('aria-hidden','true');
      bubble.innerHTML=`<img class="mq-ticket-bubble-art" src="${BUBBLE_SRC}" alt=""><div class="mq-ticket-bubble-text">Pojďte sem,<br>máme poslední<br>volná místa!</div>`;
      stage.appendChild(bubble);
    }

    return {stage,portal,hand:portal.querySelector('.mq-ticket-hand-img'),bubble,bubbleArt:bubble.querySelector('.mq-ticket-bubble-art'),text:bubble.querySelector('.mq-ticket-bubble-text')};
  }

  function preloadAssets(){
    [HAND_SRC,BUBBLE_SRC].forEach(src=>{const img=new Image();img.decoding='async';img.src=src});
  }

  function resetUi(ui){
    handAnimation?.cancel?.();
    bubbleAnimation?.cancel?.();
    handAnimation=null;
    bubbleAnimation=null;
    if(ui?.hand){ui.hand.style.transform='translateX(-112px) rotate(0deg)';ui.hand.style.opacity='1'}
    if(ui?.bubble){
      ui.bubble.classList.remove('is-visible','is-text-visible');
      ui.bubble.style.visibility='hidden';
      ui.bubble.style.opacity='0';
      ui.bubble.style.transform='scale(.08)';
    }
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
    ],{duration:HAND_MS,easing:'cubic-bezier(.42,0,.58,1)',fill:'forwards'});
    return handAnimation.finished.catch(()=>{});
  }

  async function showBubble(ui,token){
    if(token!==generation||!exteriorActive())return false;
    bubbleAnimation?.cancel?.();
    ui.bubble.style.visibility='visible';
    ui.bubble.classList.add('is-visible');
    ui.bubble.classList.remove('is-text-visible');
    ui.text.style.opacity='0';
    bubbleAnimation=ui.bubble.animate([
      {opacity:0,transform:'scale(.08)',offset:0},
      {opacity:1,transform:'scale(.34)',offset:.24},
      {opacity:1,transform:'scale(.64)',offset:.50},
      {opacity:1,transform:'scale(.86)',offset:.74},
      {opacity:1,transform:'scale(1)',offset:1}
    ],{duration:BUBBLE_TRANSITION_MS,easing:'cubic-bezier(.18,.85,.22,1)',fill:'forwards'});
    await bubbleAnimation.finished.catch(()=>{});
    return token===generation&&exteriorActive();
  }

  async function hideBubble(ui,token){
    if(token!==generation||!exteriorActive())return false;
    ui.bubble.classList.remove('is-text-visible');
    ui.text.style.opacity='0';
    bubbleAnimation?.cancel?.();
    bubbleAnimation=ui.bubble.animate([
      {opacity:1,transform:'scale(1)',offset:0},
      {opacity:1,transform:'scale(.86)',offset:.24},
      {opacity:1,transform:'scale(.64)',offset:.50},
      {opacity:1,transform:'scale(.34)',offset:.74},
      {opacity:0,transform:'scale(.08)',offset:1}
    ],{duration:BUBBLE_TRANSITION_MS,easing:'cubic-bezier(.55,0,.8,.45)',fill:'forwards'});
    await bubbleAnimation.finished.catch(()=>{});
    if(token===generation){ui.bubble.classList.remove('is-visible');ui.bubble.style.visibility='hidden'}
    return true;
  }

  async function cycle(token,ui){
    while(token===generation&&exteriorActive()){
      runHand(ui);
      await sleep(BUBBLE_START_IN_HAND_MS);
      if(token!==generation||!exteriorActive())break;

      const shown=await showBubble(ui,token);
      if(!shown)break;

      const textTimer=setTimeout(()=>{
        if(token===generation&&exteriorActive()){
          ui.bubble.classList.add('is-text-visible');
          ui.text.style.opacity='1';
        }
      },TEXT_DELAY_MS);

      const secondHandTimer=setTimeout(()=>{if(token===generation&&exteriorActive())runHand(ui)},SECOND_HAND_DELAY_MS);

      await sleep(BUBBLE_HOLD_MS);
      clearTimeout(textTimer);
      clearTimeout(secondHandTimer);
      if(token!==generation||!exteriorActive())break;

      ui.bubble.classList.remove('is-text-visible');
      ui.text.style.opacity='0';
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
    if(exteriorActive()){
      if(!running)start();
    }else{
      generation++;
      const ui=ensureUi();
      resetUi(ui);
      running=false;
    }
  }

  function init(){
    preloadAssets();
    ensureUi();
    syncToScene();
    new MutationObserver(syncToScene).observe(document.body,{attributes:true,attributeFilter:['class']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.MovieQuizTicketBoothAnimation=Object.freeze({version:'30.2-dom-sync',restart:start});
})();
