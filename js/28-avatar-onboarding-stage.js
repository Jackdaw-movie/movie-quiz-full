(()=>{
  'use strict';
  const STAGE_ASSET='assets/avatar-onboarding/production/avatar-stage.webp';
  function preloadStage(){
    try{
      const img=new Image();
      img.decoding='async';
      img.fetchPriority='low';
      img.src=STAGE_ASSET;
    }catch(_e){}
  }
  if('requestIdleCallback' in window){
    window.requestIdleCallback(preloadStage,{timeout:1500});
  }else{
    window.addEventListener('load',()=>setTimeout(preloadStage,300),{once:true});
  }
})();
