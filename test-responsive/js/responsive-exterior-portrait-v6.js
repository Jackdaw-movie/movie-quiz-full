(()=>{
  'use strict';

  const VERSION='responsive-exterior-portrait-v6.0';
  const QUERY='(orientation: portrait) and (max-width: 1180px)';
  const MASTER_W=1086;
  const MASTER_H=1235;
  const MASTER_SRC='test-responsive/assets/exterior-portrait-v6/master.webp';
  const BASE='test-responsive/assets/exterior-portrait-v6/';
  const mql=window.matchMedia(QUERY);
  let raf=0;

  const root=()=>document.documentElement;
  const stage=()=>document.getElementById('mqExteriorStage');
  const master=()=>stage()?.querySelector('.mq-v6-master');

  function viewport(){
    const vv=window.visualViewport;
    return {
      width:Math.max(1,Number(vv?.width)||window.innerWidth||document.documentElement.clientWidth||1),
      height:Math.max(1,Number(vv?.height)||window.innerHeight||document.documentElement.clientHeight||1)
    };
  }

  function addImg(s,cls,file){
    let node=s.querySelector('.'+cls.split(' ').join('.'));
    if(node)return node;
    node=document.createElement('img');
    node.className=`mq-pv6-layer ${cls}`;
    node.src=BASE+file;
    node.alt='';
    node.decoding='async';
    node.setAttribute('aria-hidden','true');
    s.appendChild(node);
    return node;
  }

  function ensurePortraitLayers(){
    const s=stage();
    if(!s)return;

    addImg(s,'mq-pv6-jackdaws-glow','jackdaws-glow.png');
    addImg(s,'mq-pv6-hotel-glow','hotel-glow.png');

    addImg(s,'mq-pv6-marquee halo','marquee-bulbs-halo.png');
    addImg(s,'mq-pv6-marquee g1','marquee-bulbs-1.png');
    addImg(s,'mq-pv6-marquee g2','marquee-bulbs-2.png');
    addImg(s,'mq-pv6-marquee g3','marquee-bulbs-3.png');

    addImg(s,'mq-pv6-lamp','lamp.png');
    addImg(s,'mq-pv6-lamp-glow','lamp-glow.png');

    addImg(s,'mq-pv6-car','car.png');
    if(!s.querySelector('.mq-pv6-car-shine')){
      const shine=document.createElement('div');
      shine.className='mq-pv6-car-shine';
      shine.setAttribute('aria-hidden','true');
      s.appendChild(shine);
    }

    addImg(s,'mq-pv6-booth','booth.png');
    addImg(s,'mq-pv6-steam steam-a','steam.png');
    addImg(s,'mq-pv6-steam steam-b','steam.png');

    if(!s.querySelector('.mq-pv6-searchlights')){
      const lights=document.createElement('div');
      lights.className='mq-pv6-searchlights';
      lights.setAttribute('aria-hidden','true');
      lights.innerHTML='<i></i><i></i>';
      s.appendChild(lights);
    }
  }

  function rememberOriginal(img){
    if(!img||img.dataset.mqPV6OriginalSrc)return;
    img.dataset.mqPV6OriginalSrc=img.getAttribute('src')||'';
    img.dataset.mqPV6OriginalWidth=img.getAttribute('width')||'1672';
    img.dataset.mqPV6OriginalHeight=img.getAttribute('height')||'941';
  }

  function setPortraitMaster(on){
    const img=master();
    if(!img)return;
    rememberOriginal(img);

    if(on){
      if(img.getAttribute('src')!==MASTER_SRC)img.setAttribute('src',MASTER_SRC);
      img.setAttribute('width',String(MASTER_W));
      img.setAttribute('height',String(MASTER_H));
    }else{
      const original=img.dataset.mqPV6OriginalSrc;
      if(original&&img.getAttribute('src')!==original)img.setAttribute('src',original);
      img.setAttribute('width',img.dataset.mqPV6OriginalWidth||'1672');
      img.setAttribute('height',img.dataset.mqPV6OriginalHeight||'941');
    }
  }

  function applyTopAnchoredCover(){
    const {width,height}=viewport();

    /* COVER, but the Y origin is always the top edge of the portrait artwork.
       No booth-centering and no bottom anchoring. */
    const scale=Math.max(width/MASTER_W,height/MASTER_H);

    const r=root();
    r.style.setProperty('--mq-pv6-scale',scale.toFixed(7));
    r.dataset.mqPortraitExteriorScale=scale.toFixed(5);
    r.dataset.mqPortraitExteriorAnchor='top-center';

    const s=stage();
    if(s){
      s.dataset.mqMasterWidth=String(MASTER_W);
      s.dataset.mqMasterHeight=String(MASTER_H);
      s.dataset.mqMasterScale=scale.toFixed(7);
      s.dataset.mqScaleMode='portrait-top-cover';
    }
  }

  function restartBoothAnimation(){
    try{
      if(document.body.classList.contains('mq-exterior-active')&&!document.body.classList.contains('mq-ticket-open')){
        window.MovieQuizTicketBoothAnimation?.restart?.();
      }
    }catch(_){}
  }

  function apply(){
    raf=0;
    const active=mql.matches;
    root().classList.toggle('mq-exterior-portrait-v6',active);
    setPortraitMaster(active);

    if(active){
      ensurePortraitLayers();
      applyTopAnchoredCover();
    }else{
      root().classList.remove('mq-booth-target-hover');
      try{window.MovieQuizMasterStage?.updateNow?.()}catch(_){}
      try{window.MovieQuizExteriorZoom?.updateNow?.()}catch(_){}
    }

    window.__mqResponsiveExteriorPortraitVersion=VERSION;
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(apply);
  }

  function start(){
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='childList'||mutation.type==='attributes'){
          schedule();
          break;
        }
      }
    });
    observer.observe(document.documentElement,{
      subtree:true,
      childList:true,
      attributes:true,
      attributeFilter:['class','hidden']
    });

    mql.addEventListener?.('change',()=>{
      schedule();
      setTimeout(restartBoothAnimation,120);
    });
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});
    window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('mq:responsive-layout-applied',schedule,{passive:true});
    window.addEventListener('mq:preload-entered',()=>{
      schedule();
      setTimeout(restartBoothAnimation,180);
    },{passive:true});

    schedule();
    setTimeout(schedule,120);
    setTimeout(schedule,650);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
