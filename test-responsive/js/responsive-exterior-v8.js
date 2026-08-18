(()=>{
  'use strict';

  const VERSION='responsive-exterior-v8.0-single-target';
  const QUERY='(orientation: portrait) and (max-width: 1180px)';
  const MASTER_W=1086;
  const MASTER_H=1235;
  const BOOTH_X=445;
  const BOOTH_Y=650;
  const BASE='test-responsive/assets/exterior-portrait-v7/';
  const MASTER_SRC=BASE+'master.webp';
  const mql=matchMedia(QUERY);
  const initialDpr=Math.max(.1,Number(devicePixelRatio)||1);

  let raf=0;
  let maskData=null;
  let maskW=245;
  let maskH=405;
  let triggeringSyntheticBoothClick=false;
  let stageObserver=null;
  let marqueeAnimations=[];
  let wasPortrait=false;

  const root=()=>document.documentElement;
  const stage=()=>document.getElementById('mqExteriorStage');
  const scene=()=>document.getElementById('mqExteriorScene');
  const master=()=>stage()?.querySelector('.mq-v6-master');
  const booth=()=>document.getElementById('mqTicketBoothHotspot');
  const shoes=()=>document.getElementById('mqWalkCursor');

  function addImg(s,cls,file){
    let n=s.querySelector('.'+cls.split(' ').join('.'));
    if(n)return n;
    n=document.createElement('img');
    n.className='mq-pv8-layer '+cls;
    n.src=BASE+file;
    n.alt='';
    n.decoding='async';
    n.setAttribute('aria-hidden','true');
    s.appendChild(n);
    return n;
  }

  function ensurePortraitLayers(){
    const s=stage();
    if(!s)return;

    addImg(s,'mq-pv8-sign','jackdaws-sign.png');
    addImg(s,'mq-pv8-sign-glow','jackdaws-glow.png');
    addImg(s,'mq-pv8-hotel','hotel-sign.png');
    addImg(s,'mq-pv8-hotel-glow','hotel-glow.png');
    addImg(s,'mq-pv8-lamp','lamp.png');
    addImg(s,'mq-pv8-car','car.png');

    if(!s.querySelector('.mq-pv8-car-shine')){
      const shine=document.createElement('div');
      shine.className='mq-pv8-car-shine';
      shine.setAttribute('aria-hidden','true');
      s.appendChild(shine);
    }

    addImg(s,'mq-pv8-booth','booth.png');
    addImg(s,'mq-pv8-booth-glow','booth-glow-only.png');

    if(!s.querySelector('.mq-pv8-marquee')){
      const lights=document.createElement('div');
      lights.className='mq-pv8-marquee';
      lights.setAttribute('aria-hidden','true');
      lights.innerHTML=
        `<img class="mq-pv8-bulb-halo" src="${BASE}marquee-bulbs-halo.png" alt="">`+
        `<img class="mq-pv8-bulb g1" src="${BASE}marquee-bulbs-1.png" alt="">`+
        `<img class="mq-pv8-bulb g2" src="${BASE}marquee-bulbs-2.png" alt="">`+
        `<img class="mq-pv8-bulb g3" src="${BASE}marquee-bulbs-3.png" alt="">`;
      s.appendChild(lights);
    }

    addImg(s,'mq-pv8-steam steam-a','steam.png');
    addImg(s,'mq-pv8-steam steam-b','steam.png');

    if(!s.querySelector('.mq-pv8-searchlights')){
      const lights=document.createElement('div');
      lights.className='mq-pv8-searchlights';
      lights.setAttribute('aria-hidden','true');
      lights.innerHTML='<i></i><i></i>';
      s.appendChild(lights);
    }
  }

  function stopMarqueeAnimations(){
    marqueeAnimations.forEach(animation=>{
      try{animation.cancel()}catch(_){}
    });
    marqueeAnimations=[];
  }

  /* Exact production v6.3 choreography, executed by WAAPI so no older responsive
     CSS rule can silently cancel or override the chase. */
  function startMarqueeAnimations(){
    stopMarqueeAnimations();
    const s=stage();
    if(!s||!mql.matches)return;

    const halo=s.querySelector('.mq-pv8-bulb-halo');
    const groups=[...s.querySelectorAll('.mq-pv8-bulb')];
    if(!halo||groups.length!==3)return;

    const haloAnimation=halo.animate([
      {opacity:.12,filter:'blur(.15px)',offset:0},
      {opacity:.27,filter:'blur(.55px)',offset:.5},
      {opacity:.12,filter:'blur(.15px)',offset:1}
    ],{
      duration:3200,
      iterations:Infinity,
      easing:'ease-in-out',
      fill:'both'
    });
    marqueeAnimations.push(haloAnimation);

    const chaseFrames=[
      {opacity:.08,filter:'brightness(1.10) saturate(1.02) drop-shadow(0 0 1px rgba(255,198,92,.28))',offset:0},
      {opacity:.08,filter:'brightness(1.10) saturate(1.02) drop-shadow(0 0 1px rgba(255,198,92,.28))',offset:.28},
      {opacity:.82,filter:'brightness(1.62) saturate(1.08) drop-shadow(0 0 3px rgba(255,205,105,.78)) drop-shadow(0 0 7px rgba(255,156,42,.30))',offset:.42},
      {opacity:.82,filter:'brightness(1.62) saturate(1.08) drop-shadow(0 0 3px rgba(255,205,105,.78)) drop-shadow(0 0 7px rgba(255,156,42,.30))',offset:.68},
      {opacity:.08,filter:'brightness(1.10) saturate(1.02) drop-shadow(0 0 1px rgba(255,198,92,.28))',offset:1}
    ];

    groups.forEach((group,index)=>{
      const animation=group.animate(chaseFrames,{
        duration:1350,
        iterations:Infinity,
        easing:'ease-in-out',
        fill:'both'
      });
      /* Production CSS uses 0 / -.45 / -.90 s delays. Setting currentTime gives
         the same phase separation without relying on CSS animation-delay. */
      try{animation.currentTime=index*450}catch(_){}
      marqueeAnimations.push(animation);
    });
  }

  function loadBoothMask(){
    if(maskData)return Promise.resolve(true);
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const canvas=document.createElement('canvas');
          canvas.width=img.naturalWidth;
          canvas.height=img.naturalHeight;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});
          ctx.drawImage(img,0,0);
          const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
          maskW=canvas.width;
          maskH=canvas.height;
          maskData=new Uint8Array(maskW*maskH);
          for(let i=0,j=0;i<maskData.length;i++,j+=4){
            maskData[i]=Math.max(rgba[j],rgba[j+1],rgba[j+2]);
          }
          resolve(true);
        }catch(_){resolve(false)}
      };
      img.onerror=()=>resolve(false);
      img.src=BASE+'booth-mask.png';
    });
  }

  function rememberMaster(img){
    if(!img||img.dataset.mqPV8OriginalSrc)return;
    img.dataset.mqPV8OriginalSrc=img.getAttribute('src')||'';
    img.dataset.mqPV8OriginalWidth=img.getAttribute('width')||'1672';
    img.dataset.mqPV8OriginalHeight=img.getAttribute('height')||'941';
  }

  function setPortraitMaster(active){
    const img=master();
    if(!img)return;
    rememberMaster(img);
    if(active){
      if(img.getAttribute('src')!==MASTER_SRC)img.setAttribute('src',MASTER_SRC);
      img.setAttribute('width',String(MASTER_W));
      img.setAttribute('height',String(MASTER_H));
      return;
    }
    const src=img.dataset.mqPV8OriginalSrc;
    if(src&&img.getAttribute('src')!==src)img.setAttribute('src',src);
    img.setAttribute('width',img.dataset.mqPV8OriginalWidth||'1672');
    img.setAttribute('height',img.dataset.mqPV8OriginalHeight||'941');
  }

  function viewport(){
    const currentDpr=Math.max(.1,Number(devicePixelRatio)||initialDpr);
    const zoomRatio=currentDpr/initialDpr;
    return {
      width:Math.max(1,(innerWidth||1)*zoomRatio),
      height:Math.max(1,(innerHeight||1)*zoomRatio)
    };
  }

  function scalePortraitStage(){
    const {width,height}=viewport();
    const scale=Math.max(width/MASTER_W,height/MASTER_H);
    root().style.setProperty('--mq-pv8-scale',scale.toFixed(7));
    const s=stage();
    if(s){
      s.dataset.mqMasterWidth=String(MASTER_W);
      s.dataset.mqMasterHeight=String(MASTER_H);
      s.dataset.mqMasterScale=scale.toFixed(7);
      s.dataset.mqScaleMode='portrait-v8-top-cover';
    }
  }

  function localPoint(clientX,clientY){
    const s=stage();
    if(!s)return null;
    const rect=s.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    return {
      x:(clientX-rect.left)*MASTER_W/rect.width,
      y:(clientY-rect.top)*MASTER_H/rect.height
    };
  }

  function isPortraitBoothPoint(clientX,clientY){
    if(!mql.matches||!maskData)return false;
    const point=localPoint(clientX,clientY);
    if(!point)return false;
    const x=Math.floor(point.x-BOOTH_X);
    const y=Math.floor(point.y-BOOTH_Y);
    if(x<0||y<0||x>=maskW||y>=maskH)return false;
    return maskData[y*maskW+x]>96;
  }

  function eventIsProductionBooth(event){
    const target=booth();
    if(!target)return false;
    if(event?.target===target)return true;
    try{return event?.composedPath?.().includes(target)===true}catch(_){return false}
  }

  function pointInsideStage(clientX,clientY){
    const s=stage();
    if(!s)return false;
    const rect=s.getBoundingClientRect();
    return clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom;
  }

  function setPortraitHover(active,event){
    root().classList.toggle('mq-pv8-booth-hover',Boolean(active));
    const cursor=shoes();
    if(!cursor||!mql.matches)return;
    if(active&&event){
      cursor.style.left=`${event.clientX}px`;
      cursor.style.top=`${event.clientY}px`;
      cursor.classList.add('is-visible');
    }else{
      cursor.classList.remove('is-visible');
    }
  }

  function clearPortraitHover(){
    root().classList.remove('mq-pv8-booth-hover');
    if(mql.matches)shoes()?.classList.remove('is-visible');
  }

  function blockEvent(event){
    if(event.cancelable)event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /* One interaction firewall for the entire exterior stage.
     Desktop: only events whose actual DOM target is the production booth survive.
     Portrait: all old stage events are stopped; this controller owns the mask. */
  function captureStageEvent(event){
    if(triggeringSyntheticBoothClick&&eventIsProductionBooth(event))return;
    if(typeof event.clientX!=='number'||typeof event.clientY!=='number')return;
    if(!pointInsideStage(event.clientX,event.clientY)){
      if(mql.matches&&(event.type==='pointermove'||event.type==='mousemove'))clearPortraitHover();
      return;
    }

    if(!mql.matches){
      if(eventIsProductionBooth(event))return;
      blockEvent(event);
      return;
    }

    if(event.type==='pointermove'||event.type==='mousemove'){
      const isMouse=!event.pointerType||event.pointerType==='mouse';
      if(!isMouse){
        clearPortraitHover();
        blockEvent(event);
        return;
      }
      setPortraitHover(isPortraitBoothPoint(event.clientX,event.clientY),event);
      blockEvent(event);
      return;
    }

    if(event.type==='click'){
      const hit=isPortraitBoothPoint(event.clientX,event.clientY);
      blockEvent(event);
      if(!hit)return;
      if(!document.body.classList.contains('mq-exterior-active'))return;
      if(document.body.classList.contains('mq-ticket-open')||document.body.classList.contains('mq-preloading'))return;
      const target=booth();
      if(!target||target.disabled)return;
      clearPortraitHover();
      triggeringSyntheticBoothClick=true;
      try{target.click()}finally{queueMicrotask(()=>{triggeringSyntheticBoothClick=false})}
      return;
    }

    /* No legacy pointerover/down/up context may leak through portrait. */
    blockEvent(event);
  }

  function removeLegacyResponsiveTargets(){
    const s=stage();
    if(!s)return;
    s.querySelectorAll(
      '#mqResponsiveBoothHitTarget,.mq-responsive-booth-hit-target,'+
      '[data-mq-responsive-booth-target],[data-mq-booth-hit-target]'
    ).forEach(node=>node.remove());

    root().classList.remove(
      'mq-booth-target-hover','mq-booth-alpha-hover','mq-booth-virtual-hover',
      'mq-pv6-booth-hover','mq-pv7-booth-hover'
    );
  }

  function sanitizeStage(){
    const s=stage();
    if(!s)return;
    removeLegacyResponsiveTargets();
    const productionBooth=booth();
    s.querySelectorAll('*').forEach(node=>{
      if(node===productionBooth)return;
      node.style.setProperty('pointer-events','none','important');
      if(node instanceof HTMLElement)node.style.setProperty('cursor','default','important');
      if((node instanceof HTMLButtonElement||node instanceof HTMLAnchorElement)&&node!==productionBooth){
        node.tabIndex=-1;
      }
    });
    if(productionBooth){
      if(mql.matches){
        productionBooth.style.setProperty('pointer-events','none','important');
        productionBooth.style.setProperty('cursor','default','important');
      }else{
        productionBooth.style.setProperty('pointer-events','auto','important');
        productionBooth.style.setProperty('cursor','none','important');
      }
    }
  }

  function setPortraitLayerVisibility(active){
    const s=stage();
    if(!s)return;
    s.querySelectorAll('.mq-pv8-layer,.mq-pv8-car-shine,.mq-pv8-marquee,.mq-pv8-searchlights')
      .forEach(node=>{node.style.display=active?'block':'none'});
  }

  function apply(){
    raf=0;
    const active=mql.matches;
    if(!active&&wasPortrait){
      root().classList.remove('mq-pv8-booth-hover');
      shoes()?.classList.remove('is-visible');
    }
    root().classList.toggle('mq-exterior-portrait-v8',active);
    setPortraitMaster(active);
    sanitizeStage();

    if(active){
      ensurePortraitLayers();
      sanitizeStage();
      setPortraitLayerVisibility(true);
      scalePortraitStage();
      loadBoothMask();
      requestAnimationFrame(startMarqueeAnimations);
    }else{
      clearPortraitHover();
      stopMarqueeAnimations();
      setPortraitLayerVisibility(false);
      try{window.MovieQuizMasterStage?.updateNow?.()}catch(_){}
      try{window.MovieQuizExteriorZoom?.updateNow?.()}catch(_){}
    }

    wasPortrait=active;
    window.__mqResponsiveExteriorVersion=VERSION;
  }

  function schedule(){
    if(!raf)raf=requestAnimationFrame(apply);
  }

  function observeStage(){
    const s=stage();
    if(!s||stageObserver)return;
    stageObserver=new MutationObserver(()=>queueMicrotask(sanitizeStage));
    stageObserver.observe(s,{childList:true,subtree:true});
  }

  function start(){
    removeLegacyResponsiveTargets();
    observeStage();

    for(const type of ['pointermove','mousemove','pointerover','mouseover','pointerdown','mousedown','pointerup','mouseup','click']){
      document.addEventListener(type,captureStageEvent,true);
    }
    document.addEventListener('pointercancel',()=>{if(mql.matches)clearPortraitHover()},true);
    document.addEventListener('pointerout',event=>{
      if(mql.matches&&event.relatedTarget==null)clearPortraitHover();
    },true);
    window.addEventListener('blur',()=>{if(mql.matches)clearPortraitHover()});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden&&mql.matches)clearPortraitHover();
    });

    window.addEventListener('resize',()=>{if(mql.matches)clearPortraitHover();schedule()},{passive:true});
    window.addEventListener('orientationchange',()=>{if(mql.matches)clearPortraitHover();schedule()},{passive:true});
    window.visualViewport?.addEventListener('resize',()=>{if(mql.matches)clearPortraitHover();schedule()},{passive:true});
    mql.addEventListener?.('change',()=>{clearPortraitHover();schedule()});

    schedule();
    setTimeout(schedule,120);
    setTimeout(schedule,650);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
