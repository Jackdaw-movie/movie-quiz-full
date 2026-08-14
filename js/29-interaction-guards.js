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


/* Movie Quiz – Film lives overlay upgrade v1
   Replaces the visual rendering of the 3-life strip with film-frame assets
   while preserving existing gameplay logic. */
(()=>{
  'use strict';
  const MAX_LIVES = 3;
  const LOST_TOKEN = /(lost|used|dead|empty|off|burned?|gone|inactive)/i;
  const STYLE_ID = 'mq-film-lives-style-v1';

  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#filmLives.mq-film-lives-upgraded{position:relative!important;isolation:isolate!important;display:flex!important;align-items:center!important;gap:0!important}
#filmLives.mq-film-lives-upgraded>.life{opacity:0!important;pointer-events:none!important}
#filmLives.mq-film-lives-upgraded .mq-film-lives-strip{position:absolute!important;inset:0!important;display:flex!important;align-items:stretch!important;justify-content:flex-start!important;gap:0!important;pointer-events:none!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual{position:relative!important;flex:1 1 0!important;min-width:0!important;height:100%!important;background-image:url('assets/lives/film-life-intact.webp');background-repeat:no-repeat!important;background-position:center center!important;background-size:contain!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.32));transform-origin:center center!important;overflow:visible!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual+.mq-life-visual{margin-left:-1px!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual::before,#filmLives.mq-film-lives-upgraded .mq-life-visual::after{content:'';position:absolute;inset:-8% -6%;opacity:0;pointer-events:none}
#filmLives.mq-film-lives-upgraded .mq-life-visual::before{background:radial-gradient(circle at 38% 68%, rgba(255,240,170,0) 0 18%, rgba(255,196,76,.90) 24%, rgba(255,124,26,.95) 42%, rgba(160,28,0,.62) 63%, rgba(0,0,0,0) 78%),radial-gradient(circle at 50% 50%, rgba(255,199,92,0) 0 28%, rgba(255,176,48,.45) 34%, rgba(255,111,10,.62) 54%, rgba(0,0,0,0) 72%);mix-blend-mode:screen;filter:blur(1.8px)}
#filmLives.mq-film-lives-upgraded .mq-life-visual::after{background:radial-gradient(circle at 46% 44%, rgba(255,234,160,.95) 0 3%, rgba(255,234,160,0) 6%),radial-gradient(circle at 56% 36%, rgba(255,208,110,.92) 0 2.6%, rgba(255,208,110,0) 5.6%),radial-gradient(circle at 62% 58%, rgba(255,165,58,.85) 0 2.4%, rgba(255,165,58,0) 5.2%),radial-gradient(circle at 42% 60%, rgba(255,121,38,.72) 0 2.2%, rgba(255,121,38,0) 5%);filter:blur(.3px)}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning{animation:mqLifePop .95s cubic-bezier(.22,.8,.22,1) both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning::before{opacity:1;animation:mqLifeIgnite .95s cubic-bezier(.2,.8,.2,1) both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning::after{opacity:1;animation:mqLifeEmbers .95s linear both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned{background-image:url('assets/lives/film-life-burned.webp')!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.36))}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned::before,#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned::after{opacity:0}
@keyframes mqLifeIgnite{0%{opacity:0;transform:scale(.88) translate3d(0,8%,0);filter:blur(3px) saturate(1.1)}18%{opacity:.82;transform:scale(1.03) translate3d(0,-1%,0);filter:blur(2px) saturate(1.2)}46%{opacity:1;transform:scale(1.08) translate3d(0,-4%,0);filter:blur(1.1px) saturate(1.25)}100%{opacity:0;transform:scale(1.2) translate3d(0,-14%,0);filter:blur(6px) saturate(1.35)}}
@keyframes mqLifeEmbers{0%{opacity:0;transform:translate3d(0,8%,0) scale(.94)}25%{opacity:.95;transform:translate3d(0,0,0) scale(1)}65%{opacity:.72;transform:translate3d(1%,-10%,0) scale(1.06)}100%{opacity:0;transform:translate3d(3%,-24%,0) scale(1.16)}}
@keyframes mqLifePop{0%{transform:scale(1)}28%{transform:scale(1.04)}54%{transform:scale(.98)}100%{transform:scale(1)}}
`;
    document.head.appendChild(style);
  }

  function directLifeNodes(container){
    return Array.from(container.children).filter(el => el.classList && el.classList.contains('life'));
  }

  function isNodeLost(node){
    if(!node) return true;
    if(node.hidden) return true;
    if(node.getAttribute('aria-hidden') === 'true') return true;
    if(LOST_TOKEN.test(Array.from(node.classList).join(' '))) return true;
    const ds = `${node.dataset.state||''} ${node.dataset.status||''}`;
    if(LOST_TOKEN.test(ds)) return true;
    try{
      const s = getComputedStyle(node);
      if(s.display === 'none' || s.visibility === 'hidden') return true;
      if(Number.parseFloat(s.opacity || '1') === 0) return true;
      if(Number.parseFloat(s.width || '1') === 0 || Number.parseFloat(s.height || '1') === 0) return true;
    }catch(_){ }
    return false;
  }

  function inferRemainingLives(container){
    const nodes = directLifeNodes(container);
    if(!nodes.length) return MAX_LIVES;
    const visibleCount = nodes.filter(n => !isNodeLost(n)).length;
    return Math.max(0, Math.min(MAX_LIVES, visibleCount));
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
      strip.appendChild(cell);
    }
    container.appendChild(strip);
    return strip;
  }

  function render(container, remaining, animateIndex){
    const strip = ensureOverlay(container);
    const cells = Array.from(strip.children);
    cells.forEach((cell, index) => {
      cell.classList.remove('mq-burning','mq-burned');
      if(index >= remaining) cell.classList.add('mq-burned');
    });
    if(Number.isInteger(animateIndex) && animateIndex >= 0 && animateIndex < cells.length){
      const cell = cells[animateIndex];
      cell.classList.remove('mq-burned');
      void cell.offsetWidth;
      cell.classList.add('mq-burning');
      setTimeout(() => {
        cell.classList.remove('mq-burning');
        cell.classList.add('mq-burned');
      }, 920);
    }
    container.dataset.mqLivesRemaining = String(remaining);
  }

  function sync(container){
    const next = inferRemainingLives(container);
    const prev = Number.isFinite(container.__mqPrevLives) ? container.__mqPrevLives : MAX_LIVES;
    let animateIndex = -1;
    if(next < prev) animateIndex = Math.max(0, Math.min(MAX_LIVES - 1, next));
    render(container, next, animateIndex);
    container.__mqPrevLives = next;
  }

  function upgradeContainer(container){
    if(!container || container.dataset.mqLivesUpgradeBound === '1') return;
    injectStyles();
    container.dataset.mqLivesUpgradeBound = '1';
    container.classList.add('mq-film-lives-upgraded');
    container.__mqPrevLives = inferRemainingLives(container);
    render(container, container.__mqPrevLives, -1);
    const observer = new MutationObserver(() => sync(container));
    observer.observe(container, {childList:true, subtree:false, attributes:true, attributeFilter:['class','style','hidden','aria-hidden','data-state','data-status']});
    container.__mqLivesSync = () => sync(container);
  }

  function initFilmLivesUpgrade(){
    const container = document.getElementById('filmLives');
    if(container) upgradeContainer(container);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFilmLivesUpgrade, {once:true});
  else initFilmLivesUpgrade();

  window.MovieQuizLivesFX = {
    sync(){ document.getElementById('filmLives')?.__mqLivesSync?.(); },
    reset(){
      const c = document.getElementById('filmLives');
      if(!c) return;
      c.__mqPrevLives = MAX_LIVES;
      render(c, MAX_LIVES, -1);
    }
  };
})();
