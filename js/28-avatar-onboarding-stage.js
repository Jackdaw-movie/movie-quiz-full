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
