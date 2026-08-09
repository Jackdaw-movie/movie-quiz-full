(()=>{
  'use strict';
  const VERSION='avatar-stage-v14.0';
  const STAGE_ASSET='assets/avatar-onboarding/production/avatar-stage-v13.webp?v=14.0';

  function preloadStage(){
    try{
      const img=new Image();
      img.decoding='async';
      img.fetchPriority='low';
      img.src=STAGE_ASSET;
    }catch(_e){}
  }

  function syncBackLabel(){
    const back=document.querySelector('#mqAvatarModal .mq-avatar-close');
    if(!back)return;
    back.setAttribute('aria-label','Zpět');
    back.setAttribute('title','Zpět');
  }

  function backToRecoveryTicket(event){
    const back=event.target?.closest?.('#mqAvatarModal .mq-avatar-close');
    if(!back)return;
    const modal=document.getElementById('mqAvatarModal');
    if(!modal?.classList.contains('is-onboarding'))return;

    /* The stock avatar module deliberately prevents closeGallery() while onboarding.
       For the painted ZPĚT control we explicitly return to the recovery-code ticket. */
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

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
    window.dispatchEvent(new CustomEvent('mq:avatar-onboarding-back'));
  }

  function observeModal(){
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>[...m.addedNodes].some(n=>n instanceof Element && (n.id==='mqAvatarModal'||n.querySelector?.('#mqAvatarModal'))))){
        syncBackLabel();
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    syncBackLabel();
  }

  /* Capture phase is intentional: the original module's onboarding close handler is a no-op. */
  document.addEventListener('click',backToRecoveryTicket,true);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeModal,{once:true});
  else observeModal();

  if('requestIdleCallback' in window)window.requestIdleCallback(preloadStage,{timeout:1200});
  else window.addEventListener('load',()=>setTimeout(preloadStage,250),{once:true});

  window.__mqAvatarStageVersion=VERSION;
})();
