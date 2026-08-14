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


/* Movie Quiz – Film lives overlay upgrade v4 */
(()=>{
  'use strict';
  const MAX_LIVES = 3;
  const STYLE_ID = 'mq-film-lives-style-v4';
  const LOST_TOKEN = /(lost|used|dead|empty|off|burned?|gone|inactive|disabled)/i;
  const BURN_MS = 1150;

  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#filmLives.mq-film-lives-upgraded{position:relative!important;isolation:isolate!important;display:flex!important;align-items:center!important;gap:0!important}
#filmLives.mq-film-lives-upgraded>.life{opacity:0!important;pointer-events:none!important}
#filmLives.mq-film-lives-upgraded .mq-film-lives-strip{position:absolute!important;inset:0!important;display:flex!important;align-items:stretch!important;justify-content:flex-start!important;gap:0!important;pointer-events:none!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual{position:relative!important;flex:1 1 0!important;min-width:0!important;height:100%!important;background:url('assets/lives/film-life-intact.webp') center/contain no-repeat!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28));overflow:visible!important;transform-origin:center center!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual + .mq-life-visual{margin-left:-1px!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual::before,#filmLives.mq-film-lives-upgraded .mq-life-visual::after{content:'';position:absolute;inset:-3%;opacity:0;pointer-events:none}
#filmLives.mq-film-lives-upgraded .mq-life-visual::before{
 background:
  radial-gradient(24% 42% at 8% 95%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  radial-gradient(24% 46% at 22% 98%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  radial-gradient(24% 42% at 38% 95%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  radial-gradient(24% 46% at 52% 98%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  radial-gradient(24% 42% at 68% 95%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  radial-gradient(24% 46% at 82% 98%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  radial-gradient(24% 42% at 96% 95%, rgba(255,247,180,.95) 0 18%, rgba(255,188,62,.94) 28%, rgba(255,110,18,.95) 47%, rgba(170,36,0,.70) 63%, rgba(0,0,0,0) 72%),
  linear-gradient(to top, rgba(255,173,66,.48) 0%, rgba(255,124,26,.18) 18%, rgba(0,0,0,0) 56%);
 filter:blur(2.2px) saturate(1.15) brightness(1.08); mix-blend-mode:screen;
}
#filmLives.mq-film-lives-upgraded .mq-life-visual::after{
 background:
  radial-gradient(circle at 12% 74%, rgba(255,242,170,.95) 0 1.4%, rgba(255,242,170,0) 3%),
  radial-gradient(circle at 22% 61%, rgba(255,205,96,.94) 0 1.2%, rgba(255,205,96,0) 2.8%),
  radial-gradient(circle at 34% 72%, rgba(255,154,56,.88) 0 1.2%, rgba(255,154,56,0) 2.7%),
  radial-gradient(circle at 48% 58%, rgba(255,242,170,.95) 0 1.4%, rgba(255,242,170,0) 3%),
  radial-gradient(circle at 60% 73%, rgba(255,205,96,.94) 0 1.2%, rgba(255,205,96,0) 2.8%),
  radial-gradient(circle at 72% 59%, rgba(255,154,56,.88) 0 1.2%, rgba(255,154,56,0) 2.7%),
  radial-gradient(circle at 86% 72%, rgba(255,242,170,.95) 0 1.4%, rgba(255,242,170,0) 3%),
  linear-gradient(to top, rgba(255,115,30,.18) 0%, rgba(255,115,30,.06) 24%, rgba(0,0,0,0) 60%);
 filter:blur(.45px);
}
#filmLives.mq-film-lives-upgraded .mq-life-visual .mq-char{position:absolute;inset:0;opacity:0;pointer-events:none;background:linear-gradient(to top, rgba(17,13,12,.62) 0%, rgba(17,13,12,.18) 35%, rgba(0,0,0,0) 72%)}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning{animation:mqLifeBump ${BURN_MS}ms cubic-bezier(.22,.8,.22,1) both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning::before{opacity:1;animation:mqLifeFlame ${BURN_MS}ms cubic-bezier(.22,.8,.22,1) both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning::after{opacity:1;animation:mqLifeGlow ${BURN_MS}ms linear both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning .mq-char{opacity:1;animation:mqLifeChar ${BURN_MS}ms linear both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned{background:url('assets/lives/film-life-burned.webp') center/contain no-repeat!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.34))}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned::before,#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned::after,#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned .mq-char{opacity:0}
@keyframes mqLifeFlame{0%{opacity:0;transform:translateY(18%) scale(.92);filter:blur(4px) saturate(1.06)}18%{opacity:.92;transform:translateY(8%) scale(1.00);filter:blur(2.6px) saturate(1.12)}42%{opacity:1;transform:translateY(1%) scale(1.05);filter:blur(2.1px) saturate(1.20)}72%{opacity:.94;transform:translateY(-6%) scale(1.12);filter:blur(2.8px) saturate(1.22)}100%{opacity:0;transform:translateY(-16%) scale(1.18);filter:blur(7px) saturate(1.05)}}
@keyframes mqLifeGlow{0%{opacity:0;transform:scale(.96)}18%{opacity:.92;transform:scale(1)}60%{opacity:.80;transform:scale(1.04)}100%{opacity:0;transform:scale(1.10)}}
@keyframes mqLifeChar{0%{opacity:0}35%{opacity:.12}70%{opacity:.34}100%{opacity:.56}}
@keyframes mqLifeBump{0%{transform:scale(1)}22%{transform:scale(1.03)}52%{transform:scale(.99)}100%{transform:scale(1)}}
`;
    document.head.appendChild(style);
  }

  function directLifeNodes(container){
    return Array.from(container.children).filter(el => el.classList && el.classList.contains('life'));
  }
  function isNodeLost(node){
    if(!node) return true;
    if(node.hidden) return true;
    const cls = Array.from(node.classList).join(' ');
    if(LOST_TOKEN.test(cls)) return true;
    const ds = `${node.dataset.state||''} ${node.dataset.status||''}`;
    if(LOST_TOKEN.test(ds)) return true;
    try{
      const s = getComputedStyle(node);
      if(s.display === 'none') return true;
      if(parseFloat(s.width || '1') === 0 || parseFloat(s.height || '1') === 0) return true;
    } catch(_){ }
    return false;
  }
  function inferRemainingLives(container){
    const nodes = directLifeNodes(container);
    if(!nodes.length) return MAX_LIVES;
    return Math.max(0, Math.min(MAX_LIVES, nodes.filter(n => !isNodeLost(n)).length));
  }
  function ensureOverlay(container){
    let strip = container.querySelector(':scope > .mq-film-lives-strip');
    if(strip) return strip;
    strip = document.createElement('div');
    strip.className = 'mq-film-lives-strip';
    for(let i=0;i<MAX_LIVES;i++){
      const cell = document.createElement('div');
      cell.className = 'mq-life-visual';
      cell.dataset.slot = String(i);
      const char = document.createElement('div');
      char.className = 'mq-char';
      cell.appendChild(char);
      strip.appendChild(cell);
    }
    container.appendChild(strip);
    return strip;
  }
  function setState(container, remaining, animateIndex = -1){
    const strip = ensureOverlay(container);
    const cells = Array.from(strip.children);
    cells.forEach((cell, idx) => {
      cell.classList.remove('mq-burning','mq-burned');
      if(idx >= remaining) cell.classList.add('mq-burned');
    });
    if(animateIndex >= 0 && animateIndex < cells.length){
      const cell = cells[animateIndex];
      cell.classList.remove('mq-burned');
      void cell.offsetWidth;
      cell.classList.add('mq-burning');
      setTimeout(()=>{
        cell.classList.remove('mq-burning');
        cell.classList.add('mq-burned');
      }, BURN_MS - 30);
    }
    container.dataset.mqLivesRemaining = String(remaining);
  }
  function sync(container){
    const next = inferRemainingLives(container);
    const prev = Number.isFinite(container.__mqPrevLives) ? container.__mqPrevLives : MAX_LIVES;
    let animateIndex = -1;
    if(next < prev) animateIndex = Math.max(0, Math.min(MAX_LIVES - 1, prev - 1));
    setState(container, next, animateIndex);
    container.__mqPrevLives = next;
  }
  function upgrade(container){
    if(!container || container.dataset.mqLivesUpgradeBound === '1') return;
    injectStyles();
    container.dataset.mqLivesUpgradeBound = '1';
    container.classList.add('mq-film-lives-upgraded');
    container.__mqPrevLives = MAX_LIVES;
    setState(container, MAX_LIVES, -1);
    const observer = new MutationObserver(()=>sync(container));
    observer.observe(container, {childList:true, subtree:false, attributes:true, attributeFilter:['class','style','hidden','data-state','data-status']});
    container.__mqLivesSync = ()=>sync(container);
    setTimeout(()=>sync(container), 600);
  }
  function init(){
    const container = document.getElementById('filmLives');
    if(container){ upgrade(container); return true; }
    return false;
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      if(init()) return;
      let tries = 0;
      const t = setInterval(()=>{ tries += 1; if(init() || tries > 60) clearInterval(t); }, 250);
    }, {once:true});
  } else {
    if(!init()){
      let tries = 0;
      const t = setInterval(()=>{ tries += 1; if(init() || tries > 60) clearInterval(t); }, 250);
    }
  }
})();
