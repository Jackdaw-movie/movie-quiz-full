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

/* Exterior virtual booth interaction v2.2
   The DOM hotspot no longer participates in pointer hit-testing. Instead we
   convert the real pointer position back into the approved 1672×941 master and
   test a precise polygon. The lower booth base / sidewalk is intentionally NOT
   interactive. */
(()=>{
  'use strict';
  const VERSION='responsive-exterior-pointer-v2.2';
  const MASTER_W=1672;
  const MASTER_H=941;
  const ACTIVE_POLYGON=[
    [926,452],[913,471],[865,492],[833,545],[841,569],[835,585],
    [841,675],[831,679],[841,690],[842,720],[1058,720],[1061,610],
    [1065,550],[1026,495],[940,470]
  ];
  let lastPointer=null;
  let pointerRaf=0;

  const booth=()=>document.getElementById('mqTicketBoothHotspot');
  const stage=()=>document.getElementById('mqExteriorStage');
  const shoes=()=>document.getElementById('mqWalkCursor');

  function exteriorIsInteractive(){
    return document.body.classList.contains('mq-exterior-active') &&
      !document.body.classList.contains('mq-ticket-open') &&
      !document.body.classList.contains('mq-entering-auditorium');
  }

  function pointInPolygon(x,y,polygon){
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const xi=polygon[i][0],yi=polygon[i][1];
      const xj=polygon[j][0],yj=polygon[j][1];
      const intersects=((yi>y)!==(yj>y)) && (x<((xj-xi)*(y-yi))/((yj-yi)||1e-9)+xi);
      if(intersects)inside=!inside;
    }
    return inside;
  }

  function clientToMaster(clientX,clientY){
    const el=stage();
    if(!el)return null;
    const rect=el.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0)return null;
    return {
      x:(clientX-rect.left)*(MASTER_W/rect.width),
      y:(clientY-rect.top)*(MASTER_H/rect.height)
    };
  }

  function isVirtualBoothPoint(clientX,clientY){
    if(!exteriorIsInteractive())return false;
    const target=booth();
    if(!target||target.disabled)return false;
    const p=clientToMaster(clientX,clientY);
    return Boolean(p&&pointInPolygon(p.x,p.y,ACTIVE_POLYGON));
  }

  function setHover(active){
    const root=document.documentElement;
    const cursor=shoes();
    root.classList.toggle('mq-booth-virtual-hover',Boolean(active));
    if(cursor)cursor.classList.toggle('is-visible',Boolean(active));
  }

  function clearHover(){setHover(false)}

  function applyPointerState(){
    pointerRaf=0;
    if(!lastPointer||lastPointer.pointerType!=='mouse'){
      clearHover();return;
    }
    const active=isVirtualBoothPoint(lastPointer.x,lastPointer.y);
    setHover(active);
    if(active){
      const cursor=shoes();
      if(cursor){
        cursor.style.left=`${lastPointer.x}px`;
        cursor.style.top=`${lastPointer.y}px`;
      }
    }
  }

  function schedulePointerCheck(){
    if(pointerRaf)return;
    pointerRaf=requestAnimationFrame(applyPointerState);
  }

  function rememberPointer(event){
    lastPointer={x:event.clientX,y:event.clientY,pointerType:event.pointerType||'mouse'};
    schedulePointerCheck();
  }

  document.addEventListener('pointermove',rememberPointer,true);
  document.addEventListener('pointerdown',rememberPointer,true);
  document.addEventListener('pointercancel',clearHover,true);
  document.addEventListener('mouseleave',clearHover,true);
  window.addEventListener('blur',clearHover);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHover();});

  /* Preserve the existing booth click handler without exposing its rectangular
     DOM box. Trusted clicks inside the virtual polygon are forwarded to it. */
  document.addEventListener('click',event=>{
    if(!event.isTrusted||event.button!==0)return;
    if(!isVirtualBoothPoint(event.clientX,event.clientY))return;
    event.preventDefault();
    event.stopPropagation();
    clearHover();
    booth()?.click();
  },true);

  window.addEventListener('resize',schedulePointerCheck,{passive:true});
  window.visualViewport?.addEventListener('resize',schedulePointerCheck,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedulePointerCheck,{passive:true});
  window.addEventListener('mq:responsive-layout-applied',schedulePointerCheck,{passive:true});
  window.addEventListener('mq:master-stage-resized',schedulePointerCheck,{passive:true});

  const start=()=>{
    new MutationObserver(schedulePointerCheck).observe(document.body,{attributes:true,attributeFilter:['class']});
    clearHover();
    window.__mqResponsiveExteriorPointerVersion=VERSION;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();