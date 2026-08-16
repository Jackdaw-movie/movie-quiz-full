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

/* Movie Quiz – ticket booth hand + bubble controller v30.5
   Restores the smaller, unclipped bubble geometry from the good v10.5/v10.7
   sequence. The five PNGs now include transparent safe canvas, so 272×204 is
   the canvas size, not the visible speech-bubble size. Frame timing is restored
   to the v10.7 visual cadence (~360 ms 1→5 and ~360 ms 5→1).
   Text visibility is event-driven: it turns on exactly when frame 5 is assigned
   and turns off in the same tick frame 5 is left. */
(()=>{
  'use strict';

  const ASSET_VERSION='30.5-v107-geometry';
  const HAND_SRC=`assets/exterior-v6-9/production/ticket-booth-hand.png?v=${ASSET_VERSION}`;
  const BUBBLE_FRAMES=[1,2,3,4,5].map(n=>`assets/exterior-v6-9/production/bubble_frame_${n}.png?v=${ASSET_VERSION}`);

  const HAND_MS=3744;
  const BUBBLE_START_IN_HAND_MS=2952;
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

    let bubbleArt=bubble.querySelector('.mq-ticket-bubble-art');
    let text=bubble.querySelector('.mq-ticket-bubble-text');
    if(!bubbleArt||!text){
      bubble.replaceChildren();
      bubbleArt=document.createElement('img');
      bubbleArt.className='mq-ticket-bubble-art';
      bubbleArt.alt='';
      bubbleArt.decoding='async';
      text=document.createElement('div');
      text.className='mq-ticket-bubble-text';
      text.innerHTML='Pojďte sem,<br>máme poslední<br>volná místa!';
      bubble.append(bubbleArt,text);
    }
    if(!bubbleArt.getAttribute('src'))bubbleArt.src=BUBBLE_FRAMES[0];

    return {stage,portal,hand,bubble,bubbleArt,text};
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
    const src=BUBBLE_FRAMES[frameNumber-1];
    if(ui.bubbleArt.getAttribute('src')!==src)ui.bubbleArt.src=src;
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

    /* First reverse tick is 5 → 4, so text is hidden before any smaller frame
       is painted. There is no independent text timer. */
    for(let frame=4;frame>=1;frame--){
      if(token!==generation||!exteriorActive())return false;
      setBubbleFrame(ui,frame);
      await sleep(BUBBLE_STEP_MS);
    }

    if(token===generation){
      ui.bubble.classList.remove('is-visible','is-text-visible');
      ui.bubble.style.visibility='hidden';
      ui.bubble.dataset.mqBubbleFrame='0';
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

    /* Bubble/hand assets are decorative. Load/decode them only after the user
       has left the loading gate, so they cannot compete with the first-paint
       background or critical exterior assets on a first visit. */
    await preloadAssets();
    if(!initialized)return;
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
    version:'30.5-v107-geometry-frame5-sync',
    restart:start
  });
})();



/* Movie Quiz – ticket/avatar fine-tune v11.7
   Text-based and DOM-safe polish layer added after the core guards. */
(()=>{
  'use strict';
  const HOME_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>';
  const GEAR_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.1a3.9 3.9 0 1 1 0 7.8a3.9 3.9 0 0 1 0-7.8Z"/><path d="M19.4 13.1l1.3-1.1l-1-2.8l-1.7.1a6.9 6.9 0 0 0-1.2-1.2l.1-1.7l-2.8-1l-1.1 1.3a6.9 6.9 0 0 0-1.7 0L10 4.4l-2.8 1l.1 1.7c-.43.33-.83.73-1.2 1.2l-1.7-.1l-1 2.8l1.3 1.1a6.9 6.9 0 0 0 0 1.8l-1.3 1.1l1 2.8l1.7-.1c.35.45.76.86 1.2 1.2l-.1 1.7l2.8 1l1.1-1.3c.56.08 1.13.08 1.7 0l1.1 1.3l2.8-1l-.1-1.7c.45-.35.86-.76 1.2-1.2l1.7.1l1-2.8l-1.3-1.1c.08-.59.08-1.2 0-1.8Z"/></svg>';
  const BUTTON_SELECTOR='button,a,[role="button"],.mqf-btn';
  let observer=null;

  function normalize(text){
    return String(text||'')
      .replace(/\s+/g,' ')
      .replace(/[★☆✦✧✩✪✫✬✭✮✯✨⇠⇦⇤↞←↤⇐➜➝➞➟➠➡↩↪]+/g,' ')
      .trim()
      .toLowerCase();
  }

  function elementLabel(el){
    return normalize(
      el?.getAttribute?.('aria-label') ||
      el?.getAttribute?.('title') ||
      el?.dataset?.mqTip ||
      el?.textContent
    );
  }

  function forEachElement(root, cb){
    const nodes=root.querySelectorAll('*');
    nodes.forEach(node=>{
      try{cb(node)}catch(_){}
    });
  }

  function patchPinMismatch(){
    forEachElement(document, el=>{
      if(el.children.length) return;
      const txt=normalize(el.textContent);
      if(txt==='oba piny se musí shodovat' || txt==='oba piny se musi shodovat'){
        el.classList.add('mq-pin-match-error-v117');
      }
    });
  }

  function patchAvatarSavedText(){
    forEachElement(document, el=>{
      if(el.children.length) return;
      const txt=normalize(el.textContent);
      if(txt==='avatar byl uložen' || txt==='avatar byl ulozen'){
        el.classList.add('mq-avatar-saved-v117');
      }
    });
  }

  function removeDuplicateDecorativeIcons(button){
    const icons=[...button.querySelectorAll('svg,.icon,[class*="icon"],[class*="star"],[class*="arrow"]')]
      .filter(node=>node.closest(BUTTON_SELECTOR)===button);
    if(icons.length>1){
      icons.slice(1).forEach(node=>node.remove());
    }
    const decorative=[...button.querySelectorAll('span,i,b,em,strong,small')]
      .filter(node=>node.closest(BUTTON_SELECTOR)===button)
      .filter(node=>/^[★☆✦✧✩✪✫✬✭✮✯✨⇠⇦⇤↞←↤⇐➜➝➞➟➠➡↩↪]+$/.test((node.textContent||'').trim()));
    if(decorative.length>1){
      decorative.slice(1).forEach(node=>node.remove());
    }
  }

  function patchTicketButtons(){
    document.querySelectorAll(BUTTON_SELECTOR).forEach(btn=>{
      const label=elementLabel(btn);
      if(label.includes('hrát jako host') || label.includes('hrat jako host')){
        btn.classList.add('mq-single-icon-v117');
        removeDuplicateDecorativeIcons(btn);
      }
      if((label==='zpět' || label==='zpet') && btn.closest('.mq-ticket-facade,.mqf-pin-box,[class*="pin"]')){
        btn.classList.add('mq-single-icon-v117');
        removeDuplicateDecorativeIcons(btn);
      }
    });
  }

  function clickSettingsFallback(){
    const candidates=[
      '#settingsBtn','#openSettingsBtn','#playerSettingsBtn','#mqSettingsButton',
      '#mqSettingsToggle','#settingsToggle','#audioSettingsBtn','#gearBtn',
      '[aria-label*="Nastavení"]','[title*="Nastavení"]','[data-mq-tip*="Nastavení"]',
      '[aria-label*="Settings"]','[title*="Settings"]','[data-mq-tip*="Settings"]'
    ];
    for(const sel of candidates){
      const node=document.querySelector(sel);
      if(node){ node.click?.(); return; }
    }
    const buttons=[...document.querySelectorAll(BUTTON_SELECTOR)];
    const node=buttons.find(el=>{
      if(el.closest('#mqAvatarModal')) return false;
      const label=elementLabel(el);
      return label.includes('nastavení') || label.includes('settings');
    });
    if(node){ node.click?.(); return; }
    const menu=document.getElementById('mqSettingsMenu');
    if(menu){
      const hidden=menu.hidden || getComputedStyle(menu).display==='none';
      menu.hidden=!hidden ? true : false;
      menu.style.display=hidden ? 'block' : 'none';
      menu.setAttribute('aria-hidden', hidden ? 'false' : 'true');
    }
  }

  function ensureAvatarCornerButtons(){
    const modal=document.getElementById('mqAvatarModal');
    if(!modal) return;
    let rail=modal.querySelector('.mq-avatar-corner-rail');
    if(!rail){
      rail=document.createElement('div');
      rail.className='mq-avatar-corner-rail';
      rail.setAttribute('aria-hidden','false');
      modal.appendChild(rail);
    }
    let gear=rail.querySelector('.mq-avatar-corner-btn.mq-settings');
    if(!gear){
      gear=document.createElement('button');
      gear.type='button';
      gear.className='mq-avatar-corner-btn mq-settings';
      gear.setAttribute('aria-label','Nastavení');
      gear.innerHTML=GEAR_SVG;
      gear.addEventListener('click',clickSettingsFallback);
      rail.appendChild(gear);
    }
    let home=rail.querySelector('.mq-avatar-corner-btn.mq-home');
    if(!home){
      home=document.createElement('button');
      home.type='button';
      home.className='mq-avatar-corner-btn mq-home';
      home.setAttribute('aria-label','Hlavní menu');
      home.innerHTML=HOME_SVG;
      home.addEventListener('click',()=>{
        const existing=document.getElementById('homeBtn');
        if(existing){ existing.click?.(); return; }
        const fallback=[...document.querySelectorAll(BUTTON_SELECTOR)]
          .find(el=>{
            if(el.closest('#mqAvatarModal')) return false;
            const label=elementLabel(el);
            return label.includes('hlavní menu') || label.includes('hlavni menu') || label==='domů' || label==='domu' || label==='home';
          });
        fallback?.click?.();
      });
      rail.appendChild(home);
    }
  }

  function hideAvatarBracketsRuntime(){
    const modal=document.getElementById('mqAvatarModal');
    if(!modal) return;
    modal.querySelectorAll('[class*="bracket"],[class*="Bracket"],[data-avatar-bracket]').forEach(el=>{
      el.style.display='none';
      el.style.opacity='0';
      el.style.visibility='hidden';
    });
  }

  function applyAll(){
    patchPinMismatch();
    patchAvatarSavedText();
    patchTicketButtons();
    ensureAvatarCornerButtons();
    hideAvatarBracketsRuntime();
  }

  function init(){
    applyAll();
    if(observer) return;
    observer=new MutationObserver(()=>applyAll());
    observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.MovieQuizTicketAvatarFineTune=Object.freeze({version:'11.7',apply:applyAll});
})();

