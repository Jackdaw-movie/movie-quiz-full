(()=>{
  'use strict';
  const VERSION='interaction-guards-v27.0';

  function avatarModalOpen(){
    const modal=document.getElementById('mqAvatarModal');
    return Boolean(modal && !modal.hidden);
  }

  function installAvatarArrowOnlyGuard(){
    const modal=document.getElementById('mqAvatarModal');
    const viewport=document.getElementById('mqAvatarCarouselViewport');
    if(!modal||!viewport||viewport.dataset.mqArrowOnlyGuard==='1')return false;
    viewport.dataset.mqArrowOnlyGuard='1';

    /* The stock avatar module listens for wheel and pointer drag on this viewport.
       Capture first and contain those gestures before they reach those listeners.
       We intentionally do NOT preventDefault for wheel, so normal trackpad/page
       behaviour is not unnecessarily hijacked. */
    viewport.addEventListener('wheel',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },{capture:true,passive:true});

    viewport.addEventListener('pointerdown',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },true);

    viewport.addEventListener('pointerup',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },true);

    viewport.addEventListener('pointercancel',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },true);

    viewport.addEventListener('touchstart',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },{capture:true,passive:true});

    viewport.addEventListener('touchmove',event=>{
      if(!avatarModalOpen())return;
      event.stopImmediatePropagation();
    },{capture:true,passive:true});

    /* Clicking an avatar itself must not jump the carousel. Navigation is only
       through [data-avatar-nav] buttons, which are siblings of the viewport. */
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

  /* Disable keyboard navigation of the carousel. Confirmation and Back remain
     keyboard-accessible; only changing which avatar is centered is arrow-click-only. */
  document.addEventListener('keydown',event=>{
    if(!avatarModalOpen())return;
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  /* The legacy cinema HUD has a mute button with a core click listener. It is
     hidden by CSS, and this capture guard also makes accidental/forwarded or
     programmatic DOM clicks unable to toggle the global mute state. */
  document.addEventListener('click',event=>{
    const mute=event.target instanceof Element ? event.target.closest('#muteBtn') : null;
    if(!mute)return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);

  /* Defensive recovery: a normal click outside audio Settings must never leave
     the global core mute flag enabled. Volume sliders remain untouched, so 0%
     chosen directly in Settings still works exactly as requested. */
  document.addEventListener('click',event=>{
    const target=event.target;
    if(!(target instanceof Element))return;
    const insideSettings=Boolean(target.closest(
      '#mqExteriorAudio,.mq-settings-modal,#mqSettingsModal,#mqPlayerSettings,'+
      '[data-settings-panel],[data-player-settings]'
    ));
    if(insideSettings)return;

    queueMicrotask(()=>{
      try{
        if(typeof state==='undefined'||!state?.muted)return;
        state.muted=false;
        const mute=document.getElementById('muteBtn');
        mute?.classList.remove('muted');
        mute?.setAttribute('aria-label','Vypnout zvuk');
        if(typeof masterGain!=='undefined'&&masterGain?.gain&&
           typeof audioCtx!=='undefined'&&audioCtx){
          masterGain.gain.setTargetAtTime(.96,audioCtx.currentTime,.05);
          if(audioCtx.state==='suspended')audioCtx.resume?.().catch?.(()=>{});
        }
      }catch(_){}
    });
  },true);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',observeAvatarModal,{once:true});
  }else{
    observeAvatarModal();
  }

  window.__mqInteractionGuardsVersion=VERSION;
})();