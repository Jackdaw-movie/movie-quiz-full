(()=>{
  'use strict';
  const VERSION='master-stage-v1.0';
  const BASE={
    preload:[1279,720],
    exterior:[1672,941],
    ticket:[1672,941],
    avatar:[1672,941]
  };
  let raf=0;

  function viewport(){
    const vv=window.visualViewport;
    const w=Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||1));
    const h=Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||1));
    return {w,h};
  }
  function fit(w,h,pad=0){
    const v=viewport();
    return Math.max(.12,Math.min((v.w-pad*2)/w,(v.h-pad*2)/h));
  }
  function scaleStage(el,w,h,pad=0,varName='--mq-stage-scale'){
    if(!el)return 1;
    const s=fit(w,h,pad);
    el.style.setProperty(varName,String(s));
    el.dataset.mqMasterWidth=String(w);
    el.dataset.mqMasterHeight=String(h);
    el.dataset.mqMasterScale=s.toFixed(6);
    return s;
  }
  function updatePreload(){
    const stage=document.getElementById('mqPreloadMasterStage');
    if(stage)scaleStage(stage,...BASE.preload,0);
  }
  function updateExterior(){
    const stage=document.getElementById('mqExteriorStage');
    if(!stage)return;
    const s=fit(...BASE.exterior,0);
    stage.style.transform=`translate(-50%,-50%) scale(${s})`;
    stage.dataset.mqMasterWidth='1672';
    stage.dataset.mqMasterHeight='941';
    stage.dataset.mqMasterScale=s.toFixed(6);
  }
  function updateTicket(){
    const stage=document.getElementById('mqTicketMasterStage');
    if(stage)scaleStage(stage,...BASE.ticket,0);
  }
  function updateAvatar(){
    const modal=document.getElementById('mqAvatarModal');
    const dialog=modal?.querySelector('.mq-avatar-dialog');
    if(!dialog)return;
    const s=fit(...BASE.avatar,0);
    dialog.style.setProperty('--mq-avatar-stage-scale',String(s));
    dialog.dataset.mqMasterWidth='1672';
    dialog.dataset.mqMasterHeight='941';
    dialog.dataset.mqMasterScale=s.toFixed(6);
  }
  function updateAll(){
    raf=0;
    updatePreload();
    updateExterior();
    updateTicket();
    updateAvatar();
    window.dispatchEvent(new CustomEvent('mq:master-stage-resized',{detail:{version:VERSION,viewport:viewport()}}));
  }
  function queueUpdate(){
    if(raf)return;
    raf=requestAnimationFrame(updateAll);
  }
  function observeDynamicStages(){
    const observer=new MutationObserver(mutations=>{
      let relevant=false;
      for(const m of mutations){
        if(m.type==='attributes'){
          if(m.target?.id==='mqAvatarModal'||m.target?.id==='mqTicketLayer'){relevant=true;break;}
        }
        for(const node of m.addedNodes||[]){
          if(!(node instanceof Element))continue;
          if(node.id==='mqAvatarModal'||node.id==='mqTicketMasterStage'||node.querySelector?.('#mqAvatarModal,#mqTicketMasterStage')){relevant=true;break;}
        }
        if(relevant)break;
      }
      if(relevant)queueUpdate();
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  }

  const API={VERSION,BASE,viewport,fit,scaleStage,update:queueUpdate,updateNow:updateAll};
  window.MovieQuizMasterStage=API;

  if(new URLSearchParams(location.search).get('mqStageDebug')==='1')document.body?.classList.add('mq-stage-debug');
  window.addEventListener('resize',queueUpdate,{passive:true});
  window.addEventListener('orientationchange',queueUpdate,{passive:true});
  window.visualViewport?.addEventListener('resize',queueUpdate,{passive:true});
  window.visualViewport?.addEventListener('scroll',queueUpdate,{passive:true});

  /* The loading stage already exists when this script is parsed, so size it
     synchronously. The rest of the stages are finalized on DOMContentLoaded. */
  updatePreload();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{observeDynamicStages();updateAll();},{once:true});
  }else{
    observeDynamicStages();updateAll();
  }
})();
