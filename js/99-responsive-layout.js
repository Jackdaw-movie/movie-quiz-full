(()=>{
  'use strict';

  const VERSION='responsive-layout-v2.0-full-bleed';
  const MASTER_W=1672;
  const MASTER_H=941;
  let raf=0;

  function viewport(){
    const vv=window.visualViewport;
    const width=Math.max(1,Number(vv?.width)||window.innerWidth||document.documentElement.clientWidth||1);
    const height=Math.max(1,Number(vv?.height)||window.innerHeight||document.documentElement.clientHeight||1);
    return {width,height};
  }

  function coverScale(width,height,masterWidth=MASTER_W,masterHeight=MASTER_H){
    return Math.max(width/masterWidth,height/masterHeight);
  }

  function apply(){
    raf=0;
    const root=document.documentElement;
    const {width,height}=viewport();
    const ratio=width/height;
    const cover=coverScale(width,height);

    root.style.setProperty('--mq-exterior-cover-scale',cover.toFixed(7));
    root.style.setProperty('--mq-avatar-cover-scale',cover.toFixed(7));
    root.style.setProperty('--mq-responsive-vw',`${width.toFixed(2)}px`);
    root.style.setProperty('--mq-responsive-vh',`${height.toFixed(2)}px`);

    root.dataset.mqResponsiveVersion=VERSION;
    root.dataset.mqResponsiveWidth=String(Math.round(width));
    root.dataset.mqResponsiveHeight=String(Math.round(height));
    root.dataset.mqResponsiveRatio=ratio.toFixed(4);
    root.classList.toggle('mq-responsive-tall',ratio<1.2);
    root.classList.toggle('mq-responsive-wide',ratio>2.05);

    const exterior=document.getElementById('mqExteriorStage');
    if(exterior){
      exterior.dataset.mqMasterWidth=String(MASTER_W);
      exterior.dataset.mqMasterHeight=String(MASTER_H);
      exterior.dataset.mqMasterScale=cover.toFixed(7);
      exterior.dataset.mqScaleMode='cover';
    }

    const avatar=document.querySelector('#mqAvatarModal .mq-avatar-dialog');
    if(avatar){
      avatar.dataset.mqMasterWidth=String(MASTER_W);
      avatar.dataset.mqMasterHeight=String(MASTER_H);
      avatar.dataset.mqMasterScale=cover.toFixed(7);
      avatar.dataset.mqScaleMode='cover';
    }

    window.dispatchEvent(new CustomEvent('mq:responsive-layout-applied',{
      detail:{version:VERSION,width,height,ratio,coverScale:cover}
    }));
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(apply);
  }

  const observer=new MutationObserver(mutations=>{
    for(const mutation of mutations){
      if(mutation.type==='attributes'){
        const target=mutation.target;
        if(target?.id==='mqAvatarModal'||target?.id==='mqTicketLayer'||target?.id==='mqExteriorScene'){
          schedule();return;
        }
      }
      for(const node of mutation.addedNodes||[]){
        if(!(node instanceof Element))continue;
        if(node.id==='mqAvatarModal'||node.id==='mqExteriorStage'||node.querySelector?.('#mqAvatarModal,#mqExteriorStage')){
          schedule();return;
        }
      }
    }
  });

  window.MovieQuizResponsiveLayout={VERSION,viewport,coverScale,applyNow:apply,update:schedule};

  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('mq:master-stage-resized',schedule,{passive:true});
  window.addEventListener('mq:preload-entered',schedule,{passive:true});

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{
      observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
      apply();
    },{once:true});
  }else{
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
    apply();
  }
})();
