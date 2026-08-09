(()=>{
  'use strict';
  const VERSION='avatar-stage-assets-v18.0';
  const ASSETS=[
    'assets/avatar-onboarding-v15/production/background.webp?v=18.0',
    'assets/avatar-onboarding-v15/production/arrow-left.webp?v=18.0',
    'assets/avatar-onboarding-v15/production/continue.webp?v=18.0',
    'assets/avatar-onboarding-v15/production/back.webp?v=18.0'
  ];

  const warmed=[];
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

  function markBackControl(){
    const back=document.querySelector('#mqAvatarModal .mq-avatar-close');
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
  scheduleWarm();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeModal,{once:true});
  else observeModal();

  window.__mqAvatarStageVersion=VERSION;
})();
