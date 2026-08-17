(()=>{
  'use strict';

  const VERSION='responsive-layout-v2.2-full-bleed';
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

/* Movie Quiz – exterior interaction v4.0
   One dedicated DOM hit target owns all pointer hover/click behaviour.
   The old booth button is pointer-dead and is used only to invoke the existing
   ticket/footstep handler programmatically after the new target is clicked. */
(()=>{
  'use strict';

  const VERSION='responsive-exterior-single-target-v4.0';
  const TARGET_ID='mqResponsiveBoothHitTarget';
  let bodyObserver=null;

  const root=()=>document.documentElement;
  const stage=()=>document.getElementById('mqExteriorStage');
  const booth=()=>document.getElementById('mqTicketBoothHotspot');
  const shoes=()=>document.getElementById('mqWalkCursor');
  const target=()=>document.getElementById(TARGET_ID);

  function exteriorInteractive(){
    return document.body.classList.contains('mq-exterior-active') &&
      !document.body.classList.contains('mq-preloading') &&
      !document.body.classList.contains('mq-ticket-open') &&
      !document.body.classList.contains('mq-entering-auditorium');
  }

  function clearLegacyStates(){
    root().classList.remove('mq-booth-alpha-hover','mq-booth-virtual-hover');
  }

  function clearHover(){
    root().classList.remove('mq-booth-target-hover');
    clearLegacyStates();
    shoes()?.classList.remove('is-visible');
  }

  function placeShoes(event){
    const cursor=shoes();
    if(!cursor)return;
    cursor.style.left=`${event.clientX}px`;
    cursor.style.top=`${event.clientY}px`;
  }

  function showHover(event){
    if(!exteriorInteractive()||event.pointerType&&event.pointerType!=='mouse'){
      clearHover();
      return;
    }
    clearLegacyStates();
    root().classList.add('mq-booth-target-hover');
    const cursor=shoes();
    cursor?.classList.add('is-visible');
    placeShoes(event);
  }

  function disableLegacyHotspot(){
    const old=booth();
    if(!old)return;
    old.style.setProperty('pointer-events','none','important');
    old.style.setProperty('cursor','default','important');
  }

  function installTarget(){
    const s=stage();
    if(!s)return false;
    disableLegacyHotspot();

    let hit=target();
    if(!hit){
      hit=document.createElement('div');
      hit.id=TARGET_ID;
      hit.setAttribute('aria-hidden','true');
      hit.tabIndex=-1;
      s.appendChild(hit);
    }
    if(hit.dataset.mqInstalled===VERSION)return true;
    hit.dataset.mqInstalled=VERSION;

    hit.addEventListener('pointerenter',event=>showHover(event));
    hit.addEventListener('pointermove',event=>showHover(event));
    hit.addEventListener('pointerleave',clearHover);
    hit.addEventListener('pointercancel',clearHover);

    hit.addEventListener('click',event=>{
      if(!exteriorInteractive())return;
      if(typeof event.button==='number'&&event.button!==0)return;
      const old=booth();
      if(!old||old.disabled)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      clearHover();
      old.click();
    });

    return true;
  }

  function safetyPointerCheck(event){
    if(!root().classList.contains('mq-booth-target-hover'))return;
    const hit=target();
    if(!hit||!event.composedPath().includes(hit))clearHover();
  }

  function sync(){
    installTarget();
    if(!exteriorInteractive())clearHover();
  }

  function start(){
    clearHover();
    installTarget();

    document.addEventListener('pointermove',safetyPointerCheck,true);
    window.addEventListener('blur',clearHover);
    window.addEventListener('resize',clearHover,{passive:true});
    window.visualViewport?.addEventListener('resize',clearHover,{passive:true});
    window.visualViewport?.addEventListener('scroll',clearHover,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHover()});

    if(!bodyObserver){
      bodyObserver=new MutationObserver(sync);
      bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
    }

    window.__mqResponsiveExteriorPointerVersion=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();