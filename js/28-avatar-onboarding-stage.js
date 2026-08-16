(()=>{
  'use strict';
  const VERSION='avatar-master-stage-v34.0';
  const ASSETS=[
    'assets/avatar-onboarding-v15/production/background.webp?v=28.0',
    'assets/avatar-onboarding-v15/production/arrow-left.webp?v=28.0',
    'assets/avatar-onboarding-v15/production/continue.webp?v=28.0',
    'assets/avatar-onboarding-v15/production/back.webp?v=28.0'
  ];

  const warmed=[];

  const MASTER_WIDTH=1672;
  const MASTER_HEIGHT=941;
  const STAGE_MARGIN=8;
  let resizeRaf=0;

  function viewportSize(){
    const vv=window.visualViewport;
    return {
      width:Math.max(1,Number(vv?.width)||window.innerWidth||document.documentElement.clientWidth||MASTER_WIDTH),
      height:Math.max(1,Number(vv?.height)||window.innerHeight||document.documentElement.clientHeight||MASTER_HEIGHT)
    };
  }

  function applyMasterStageScale(){
    const dialog=document.querySelector('#mqAvatarModal .mq-avatar-dialog');
    if(!dialog)return;
    const {width,height}=viewportSize();
    const scale=Math.min(
      Math.max(1,width-STAGE_MARGIN*2)/MASTER_WIDTH,
      Math.max(1,height-STAGE_MARGIN*2)/MASTER_HEIGHT,
      1
    );
    dialog.style.setProperty('--mq-avatar-stage-scale',String(Math.max(.1,scale)));
    dialog.dataset.mqMasterWidth=String(MASTER_WIDTH);
    dialog.dataset.mqMasterHeight=String(MASTER_HEIGHT);
    dialog.dataset.mqMasterScale=String(scale);
  }

  function scheduleMasterStageScale(){
    cancelAnimationFrame(resizeRaf);
    resizeRaf=requestAnimationFrame(applyMasterStageScale);
  }

  function installMasterStageScaling(){
    applyMasterStageScale();
    window.addEventListener('resize',scheduleMasterStageScale,{passive:true});
    window.visualViewport?.addEventListener?.('resize',scheduleMasterStageScale,{passive:true});
    window.visualViewport?.addEventListener?.('scroll',scheduleMasterStageScale,{passive:true});
  }
  function warmAssets(){
    if(warmed.length)return;
    ASSETS.forEach((src,index)=>{
      const img=new Image();
      warmed.push(img);
      img.decoding='async';
      try{img.fetchPriority=index===0?'low':'auto'}catch(_e){}
      img.src=src;
    });
  }

  function scheduleWarm(){
    const run=()=>{
      if('requestIdleCallback' in window)requestIdleCallback(warmAssets,{timeout:1600});
      else setTimeout(warmAssets,220);
    };
    window.addEventListener('mq:preload-ready',run,{once:true});
    if(window.MovieQuizPreload?.ready)run();
    else window.addEventListener('load',()=>setTimeout(run,220),{once:true});
  }

  function isolateOnboardingBlankClicks(modal){
    if(!modal||modal.dataset.mqBlankClickIsolation==='1')return;
    modal.dataset.mqBlankClickIsolation='1';

    const isBlankInteraction=event=>{
      if(modal.hidden||!modal.classList.contains('is-onboarding'))return false;
      const target=event.target;
      if(!(target instanceof Element))return false;

      /* Keep every real control fully functional. Only decorative/background
         clicks are contained inside the modal so they cannot reach global
         document handlers (settings/audio/exterior). */
      return !target.closest(
        'button,input,select,textarea,a,[role="button"],' +
        '[data-avatar-nav],[data-avatar-confirm],.mq-avatar-close'
      );
    };

    modal.addEventListener('pointerdown',event=>{
      if(isBlankInteraction(event))event.stopPropagation();
    });

    modal.addEventListener('click',event=>{
      if(!isBlankInteraction(event))return;
      event.preventDefault();
      event.stopPropagation();
    });
  }

  function markBackControl(){
    const modal=document.getElementById('mqAvatarModal');
    isolateOnboardingBlankClicks(modal);
    scheduleMasterStageScale();

    const back=modal?.querySelector('.mq-avatar-close');
    if(!back)return;
    back.setAttribute('aria-label','Zpět');
    back.setAttribute('title','Zpět');
  }

  function isCreationOnboarding(modal){
    if(!modal?.classList.contains('is-onboarding'))return false;
    const done=document.getElementById('mqRecoveryDone');
    const title=document.querySelector('#mqProfileShell .mq-profile-title')?.textContent||'';
    return Boolean(done)&&/Profil byl vytvořen/i.test(title);
  }

  function returnToRecoveryCode(modal){
    modal.hidden=true;

    const done=document.getElementById('mqRecoveryDone');
    if(done){
      delete done.dataset.mqAvatarOnboardingPending;
      delete done.dataset.mqAvatarOnboardingComplete;
    }

    const ticket=document.getElementById('mqTicketLayer');
    if(ticket){
      ticket.hidden=false;
      ticket.classList.remove('is-leaving');
      document.body.classList.add('mq-ticket-open');
    }

    requestAnimationFrame(()=>done?.focus?.({preventScroll:true}));
    window.dispatchEvent(new CustomEvent('mq:avatar-onboarding-back',{detail:{destination:'recovery-code'}}));
  }

  /* Only override ZPĚT for the mandatory avatar step after a newly-created account.
     Everywhere else the stock gallery close handler runs untouched, so the player
     returns to the exact screen/modal underneath the gallery. */
  function handleBack(event){
    const back=event.target?.closest?.('#mqAvatarModal .mq-avatar-close');
    if(!back)return;
    const modal=document.getElementById('mqAvatarModal');
    if(!isCreationOnboarding(modal))return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    returnToRecoveryCode(modal);
  }

  function observeModal(){
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        for(const node of mutation.addedNodes||[]){
          if(!(node instanceof Element))continue;
          if(node.id==='mqAvatarModal'||node.querySelector?.('#mqAvatarModal')){
            markBackControl();
            warmAssets();
            return;
          }
        }
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    markBackControl();
  }

  document.addEventListener('click',handleBack,true);
  installMasterStageScaling();
  scheduleWarm();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeModal,{once:true});
  else observeModal();

  window.__mqAvatarStageVersion=VERSION;
})();

/* Movie Quiz – safe ticket/avatar UI polish v11.8
   IMPORTANT: intentionally isolated from js/29 interaction/exterior controller. */
(()=>{
  'use strict';

  const HOME_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>';
  const GEAR_SVG='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.5 4.2h5l.8 3a10 10 0 0 1 2.2.9l2.7-1.5 3.5 3.5-1.5 2.7c.4.7.7 1.4.9 2.2l3 .8v5l-3 .8a10 10 0 0 1-.9 2.2l1.5 2.7-3.5 3.5-2.7-1.5a10 10 0 0 1-2.2.9l-.8 3h-5l-.8-3a10 10 0 0 1-2.2-.9L7.8 30l-3.5-3.5 1.5-2.7a10 10 0 0 1-.9-2.2l-3-.8v-5l3-.8c.2-.8.5-1.5.9-2.2l-1.5-2.7 3.5-3.5 2.7 1.5a10 10 0 0 1 2.2-.9z"/><circle cx="16" cy="18.3" r="4.6"/></svg>';

  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();

  function syncPinMismatchPosition(){
    const error=document.getElementById('mqTicketError');
    if(!error)return;
    const normalized=clean(error.textContent).toLocaleLowerCase('cs-CZ').replace(/[.!?]+$/,'');
    error.classList.toggle('mq-pin-mismatch-offset-v118',normalized==='oba piny se musí shodovat');
  }

  function stripOneDuplicateSymbol(){
    const facade=document.getElementById('mqTicketFacade');
    if(!facade)return;

    const guest=facade.querySelector('.mqf-panel[data-state="name"] .mqf-guest');
    if(guest){
      const text=clean(guest.textContent);
      if(/^★\s*/.test(text))guest.textContent=text.replace(/^★\s*/,'');
    }

    const registerBack=facade.querySelector('.mqf-panel[data-state="register"] .mqf-back');
    if(registerBack){
      const text=clean(registerBack.textContent);
      if(/^←\s*/.test(text))registerBack.textContent=text.replace(/^←\s*/,'');
    }
  }

  function syncAvatarSavedState(){
    const status=document.getElementById('mqAvatarStatus');
    if(!status)return;
    const saved=/^Avatar byl uložen\.?$/i.test(clean(status.textContent));
    status.classList.toggle('is-avatar-saved-v118',saved);
  }

  function goHomeFromAvatar(){
    const modal=document.getElementById('mqAvatarModal');
    if(modal?.classList.contains('is-onboarding')){
      /* Use the already-approved onboarding back path first so internal state
         is not left half-open, then invoke the real Home control. */
      modal.querySelector('.mq-avatar-close')?.click();
      setTimeout(()=>document.getElementById('homeBtn')?.click(),60);
      return;
    }

    window.MovieQuizAvatars?.close?.();
    requestAnimationFrame(()=>document.getElementById('homeBtn')?.click());
  }

  function ensureAvatarCornerControls(){
    const modal=document.getElementById('mqAvatarModal');
    const dialog=modal?.querySelector('.mq-avatar-dialog');
    if(!dialog)return;

    let settings=dialog.querySelector('#mqAvatarSettingsCorner');
    if(!settings){
      settings=document.createElement('button');
      settings.type='button';
      settings.id='mqAvatarSettingsCorner';
      settings.className='mq-avatar-corner-control mq-avatar-corner-settings mq-settings-gear';
      settings.setAttribute('aria-label','Nastavení');
      settings.setAttribute('title','Nastavení');
      settings.innerHTML=GEAR_SVG;
      settings.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        window.MovieQuizSettings?.open?.();
      });
      dialog.appendChild(settings);
    }

    let home=dialog.querySelector('#mqAvatarHomeCorner');
    if(!home){
      home=document.createElement('button');
      home.type='button';
      home.id='mqAvatarHomeCorner';
      home.className='mq-avatar-corner-control mq-avatar-corner-home';
      home.setAttribute('aria-label','Hlavní menu');
      home.setAttribute('title','Hlavní menu');
      home.innerHTML=HOME_SVG;
      home.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        goHomeFromAvatar();
      });
      dialog.appendChild(home);
    }

    syncAvatarSavedState();
  }

  function bindTargetedObservers(){
    ensureAvatarCornerControls();
    stripOneDuplicateSymbol();
    syncPinMismatchPosition();
    syncAvatarSavedState();

    const facade=document.getElementById('mqTicketFacade');
    if(facade && facade.dataset.mqV118Observer!=='1'){
      facade.dataset.mqV118Observer='1';
      new MutationObserver(stripOneDuplicateSymbol).observe(facade,{childList:true,subtree:true});
    }

    const error=document.getElementById('mqTicketError');
    if(error && error.dataset.mqV118Observer!=='1'){
      error.dataset.mqV118Observer='1';
      new MutationObserver(syncPinMismatchPosition).observe(error,{childList:true,subtree:true,characterData:true});
    }

    const status=document.getElementById('mqAvatarStatus');
    if(status && status.dataset.mqV118Observer!=='1'){
      status.dataset.mqV118Observer='1';
      new MutationObserver(syncAvatarSavedState).observe(status,{childList:true,subtree:true,characterData:true});
    }
  }

  const modalObserver=new MutationObserver(()=>bindTargetedObservers());
  modalObserver.observe(document.documentElement,{childList:true,subtree:true});

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',bindTargetedObservers,{once:true});
  }else{
    bindTargetedObservers();
  }

  window.__mqSafeTicketAvatarPolish='11.8';
})();
