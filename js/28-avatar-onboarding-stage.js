(()=>{
  'use strict';
  const VERSION='avatar-stage-v13.0';
  const STAGE_ASSET='assets/avatar-onboarding/production/avatar-stage-v13.webp?v=13.0';
  function preloadStage(){
    try{
      const img=new Image();
      img.decoding='async';
      img.fetchPriority='low';
      img.src=STAGE_ASSET;
    }catch(_e){}
  }
  function syncAccessibleBackLabel(){
    const back=document.querySelector('#mqAvatarModal .mq-avatar-close');
    if(!back)return;
    back.setAttribute('aria-label','Zpět');
    back.setAttribute('title','Zpět');
  }
  function observeModal(){
    const root=document.documentElement;
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>[...m.addedNodes].some(n=>n instanceof Element && (n.id==='mqAvatarModal'||n.querySelector?.('#mqAvatarModal'))))){
        syncAccessibleBackLabel();
      }
    });
    observer.observe(root,{childList:true,subtree:true});
    syncAccessibleBackLabel();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeModal,{once:true});
  else observeModal();
  if('requestIdleCallback' in window)window.requestIdleCallback(preloadStage,{timeout:1200});
  else window.addEventListener('load',()=>setTimeout(preloadStage,250),{once:true});
  window.__mqAvatarStageVersion=VERSION;
})();
