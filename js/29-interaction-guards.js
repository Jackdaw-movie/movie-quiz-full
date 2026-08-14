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


/* Movie Quiz – Film lives overlay upgrade v3 */
(()=>{
  'use strict';
  const MAX_LIVES = 3;
  const STYLE_ID = 'mq-film-lives-style-v3';
  const LOST_TOKEN = /(lost|used|dead|empty|off|burned?|gone|inactive|disabled)/i;

  function injectStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#filmLives.mq-film-lives-upgraded{position:relative!important;isolation:isolate!important;display:flex!important;align-items:center!important;gap:0!important}
#filmLives.mq-film-lives-upgraded>.life{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
#filmLives.mq-film-lives-upgraded .mq-film-lives-strip{position:absolute!important;inset:0!important;display:flex!important;align-items:stretch!important;justify-content:flex-start!important;gap:0!important;pointer-events:none!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual{position:relative!important;flex:1 1 0!important;min-width:0!important;height:100%!important;background:url('assets/lives/film-life-intact.webp') center/contain no-repeat!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.28));transform-origin:center center!important;overflow:visible!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual+.mq-life-visual{margin-left:-1px!important}
#filmLives.mq-film-lives-upgraded .mq-life-visual::before,#filmLives.mq-film-lives-upgraded .mq-life-visual::after{content:'';position:absolute;inset:-6% -4%;opacity:0;pointer-events:none}
#filmLives.mq-film-lives-upgraded .mq-life-visual::before{background:radial-gradient(ellipse at 10% 92%, rgba(255,250,204,.98) 0 5%, rgba(255,208,86,.98) 8%, rgba(255,140,34,.97) 16%, rgba(188,38,0,.74) 27%, rgba(0,0,0,0) 40%),radial-gradient(ellipse at 26% 88%, rgba(255,245,190,.98) 0 5%, rgba(255,194,68,.98) 8%, rgba(255,118,22,.97) 16%, rgba(188,38,0,.74) 27%, rgba(0,0,0,0) 40%),radial-gradient(ellipse at 42% 92%, rgba(255,250,204,.98) 0 5%, rgba(255,208,86,.98) 8%, rgba(255,140,34,.97) 16%, rgba(188,38,0,.74) 27%, rgba(0,0,0,0) 40%),radial-gradient(ellipse at 58% 88%, rgba(255,245,190,.98) 0 5%, rgba(255,194,68,.98) 8%, rgba(255,118,22,.97) 16%, rgba(188,38,0,.74) 27%, rgba(0,0,0,0) 40%),radial-gradient(ellipse at 74% 92%, rgba(255,250,204,.98) 0 5%, rgba(255,208,86,.98) 8%, rgba(255,140,34,.97) 16%, rgba(188,38,0,.74) 27%, rgba(0,0,0,0) 40%),radial-gradient(ellipse at 90% 88%, rgba(255,245,190,.98) 0 5%, rgba(255,194,68,.98) 8%, rgba(255,118,22,.97) 16%, rgba(188,38,0,.74) 27%, rgba(0,0,0,0) 40%),radial-gradient(ellipse at 50% 64%, rgba(255,244,176,.46) 0 10%, rgba(255,150,44,.30) 20%, rgba(0,0,0,0) 45%);mix-blend-mode:screen;filter:blur(2.3px) saturate(1.15) brightness(1.08)}
#filmLives.mq-film-lives-upgraded .mq-life-visual::after{background:radial-gradient(circle at 15% 82%, rgba(255,236,158,.95) 0 1.2%, rgba(255,236,158,0) 2.6%),radial-gradient(circle at 24% 68%, rgba(255,214,114,.92) 0 1.1%, rgba(255,214,114,0) 2.5%),radial-gradient(circle at 35% 77%, rgba(255,174,76,.9) 0 1.15%, rgba(255,174,76,0) 2.8%),radial-gradient(circle at 46% 66%, rgba(255,236,158,.95) 0 1.2%, rgba(255,236,158,0) 2.6%),radial-gradient(circle at 57% 80%, rgba(255,214,114,.92) 0 1.1%, rgba(255,214,114,0) 2.5%),radial-gradient(circle at 68% 70%, rgba(255,174,76,.9) 0 1.15%, rgba(255,174,76,0) 2.8%),radial-gradient(circle at 80% 83%, rgba(255,236,158,.95) 0 1.2%, rgba(255,236,158,0) 2.6%),radial-gradient(circle at 90% 71%, rgba(255,174,76,.9) 0 1.15%, rgba(255,174,76,0) 2.8%),linear-gradient(to top, rgba(76,26,10,.52) 0%, rgba(36,16,12,.26) 40%, rgba(0,0,0,0) 78%);filter:blur(.6px)}
#filmLives.mq-film-lives-upgraded .mq-life-visual .mq-charr{position:absolute;inset:0;opacity:0;pointer-events:none;background:radial-gradient(circle at 50% 52%, rgba(0,0,0,0) 28%, rgba(18,12,10,.22) 52%, rgba(10,10,10,.56) 100%)}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning{animation:mqLifePop 1.15s cubic-bezier(.22,.78,.22,1) both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning::before{opacity:1;animation:mqLifeFlame 1.15s cubic-bezier(.22,.78,.22,1) both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning::after{opacity:1;animation:mqLifeSpark 1.15s linear both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burning .mq-charr{opacity:1;animation:mqLifeChar 1.15s linear both}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned{background:url('assets/lives/film-life-burned.webp') center/contain no-repeat!important;filter:drop-shadow(0 2px 3px rgba(0,0,0,.34))}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned::before,#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned::after{opacity:0}
#filmLives.mq-film-lives-upgraded .mq-life-visual.mq-burned .mq-charr{opacity:0}
@keyframes mqLifeFlame{0%{opacity:0;transform:translateY(14%) scale(.92);filter:blur(4px) saturate(1.08)}16%{opacity:.9;transform:translateY(4%) scale(1.01);filter:blur(2.8px) saturate(1.16)}40%{opacity:1;transform:translateY(-4%) scale(1.05);filter:blur(2px) saturate(1.28)}68%{opacity:.95;transform:translateY(-9%) scale(1.12);filter:blur(2.4px) saturate(1.24)}100%{opacity:0;transform:translateY(-22%) scale(1.24);filter:blur(7px) saturate(1.1)}}
@keyframes mqLifeSpark{0%{opacity:0;transform:translateY(6%) scale(.96)}18%{opacity:.95;transform:translateY(0) scale(1)}56%{opacity:.75;transform:translateY(-10%) scale(1.04)}100%{opacity:0;transform:translateY(-24%) scale(1.12)}}
@keyframes mqLifeChar{0%{opacity:0;filter:blur(0)}35%{opacity:.16;filter:blur(.2px)}70%{opacity:.38;filter:blur(.35px)}100%{opacity:.62;filter:blur(.45px)}}
@keyframes mqLifePop{0%{transform:scale(1)}28%{transform:scale(1.035)}55%{transform:scale(.985)}100%{transform:scale(1)}}
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
    const cls = Array.from(node.classList).join(' ');
    if(LOST_TOKEN.test(cls)) return true;
    const ds = `${node.dataset.state||''} ${node.dataset.status||''}`;
    if(LOST_TOKEN.test(ds)) return true;
    try{
      const s = getComputedStyle(node);
      if(s.display === 'none' || s.visibility === 'hidden') return true;
      if(parseFloat(s.width || '1') === 0 || parseFloat(s.height || '1') === 0) return true;
    }catch(_){ }
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
      const ch = document.createElement('div');
      ch.className = 'mq-charr';
      cell.appendChild(ch);
      strip.appendChild(cell);
    }
    container.appendChild(strip);
    return strip;
  }

  function render(container, remaining, animateIndex = -1){
    const strip = ensureOverlay(container);
    const cells = Array.from(strip.children);
    cells.forEach((cell, index) => {
      cell.classList.remove('mq-burning','mq-burned');
      if(index >= remaining) cell.classList.add('mq-burned');
    });
    if(animateIndex >= 0 && animateIndex < cells.length){
      const cell = cells[animateIndex];
      cell.classList.remove('mq-burned');
      void cell.offsetWidth;
      cell.classList.add('mq-burning');
      setTimeout(() => {
        cell.classList.remove('mq-burning');
        cell.classList.add('mq-burned');
      }, 1120);
    }
    container.dataset.mqLivesRemaining = String(remaining);
  }

  function sync(container){
    const next = inferRemainingLives(container);
    const prev = Number.isFinite(container.__mqPrevLives) ? container.__mqPrevLives : MAX_LIVES;
    let animateIndex = -1;
    if(next < prev) animateIndex = Math.max(0, Math.min(MAX_LIVES - 1, prev - 1));
    render(container, next, animateIndex);
    container.__mqPrevLives = next;
  }

  function upgrade(container){
    if(!container || container.dataset.mqLivesUpgradeBound === '1') return;
    injectStyles();
    const initial = inferRemainingLives(container);
    container.__mqPrevLives = initial;
    container.dataset.mqLivesUpgradeBound = '1';
    container.classList.add('mq-film-lives-upgraded');
    render(container, initial, -1);
    const observer = new MutationObserver(() => sync(container));
    observer.observe(container, {childList:true, subtree:false, attributes:true, attributeFilter:['class','style','hidden','aria-hidden','data-state','data-status']});
    container.__mqLivesSync = () => sync(container);
  }

  function init(){
    const container = document.getElementById('filmLives');
    if(container) { upgrade(container); return true; }
    return false;
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if(init()) return;
      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if(init() || tries > 60) clearInterval(t);
      }, 250);
    }, {once:true});
  } else {
    if(!init()) {
      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if(init() || tries > 60) clearInterval(t);
      }, 250);
    }
  }
})();
