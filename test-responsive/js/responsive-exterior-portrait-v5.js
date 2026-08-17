(()=>{
  'use strict';

  const VERSION='responsive-exterior-portrait-v5.0';
  const MASTER_W=1086;
  const MASTER_H=1448;
  const BOOTH_X=565;
  const BOOTH_Y=830;
  const PORTRAIT_QUERY='(orientation: portrait) and (max-width: 1180px)';
  const MASTER_SRC='test-responsive/assets/exterior-portrait-v5/master.webp';
  const mql=window.matchMedia(PORTRAIT_QUERY);
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

  function addImg(s,cls,src){
    let node=s.querySelector('.'+cls.split(' ').join('.'));
    if(node)return node;
    node=document.createElement('img');
    node.className=`mq-portrait-fx ${cls}`;
    node.src=src;
    node.alt='';
    node.setAttribute('aria-hidden','true');
    node.decoding='async';
    s.appendChild(node);
    return node;
  }

  function ensureFx(){
    const s=stage();
    if(!s)return;
    const base='test-responsive/assets/exterior-portrait-v5/';
    addImg(s,'mq-portrait-sign-glow',base+'sign-glow.png');
    addImg(s,'mq-portrait-hotel-glow',base+'hotel-glow.png');
    addImg(s,'mq-portrait-marquee-bulbs',base+'marquee-bulbs.png');
    addImg(s,'mq-portrait-booth-glow',base+'booth-hover.png');
    addImg(s,'mq-portrait-steam steam-a',base+'steam.png');
    addImg(s,'mq-portrait-steam steam-b',base+'steam.png');
    if(!s.querySelector('.mq-portrait-car-shine')){
      const shine=document.createElement('div');
      shine.className='mq-portrait-car-shine';
      shine.setAttribute('aria-hidden','true');
      s.appendChild(shine);
    }
  }

  function setMasterPortrait(on){
    const img=master();
    if(!img)return;
    if(!img.dataset.mqPortraitOriginalSrc){
      img.dataset.mqPortraitOriginalSrc=img.getAttribute('src')||'';
      img.dataset.mqPortraitOriginalWidth=img.getAttribute('width')||'1672';
      img.dataset.mqPortraitOriginalHeight=img.getAttribute('height')||'941';
    }
    if(on){
      if(img.getAttribute('src')!==MASTER_SRC)img.setAttribute('src',MASTER_SRC);
      img.setAttribute('width',String(MASTER_W));
      img.setAttribute('height',String(MASTER_H));
    }else{
      const original=img.dataset.mqPortraitOriginalSrc;
      if(original&&img.getAttribute('src')!==original)img.setAttribute('src',original);
      img.setAttribute('width',img.dataset.mqPortraitOriginalWidth||'1672');
      img.setAttribute('height',img.dataset.mqPortraitOriginalHeight||'941');
    }
  }

  function applyPortraitTransform(){
    const {width,height}=viewport();

    /* Exact booth-centred cover: the booth anchor maps to 50% / 50% while the
       portrait art still covers every viewport edge. This naturally produces
       the requested closer framing without any horizontal drag/pan. */
    const leftRoom=BOOTH_X;
    const rightRoom=MASTER_W-BOOTH_X;
    const topRoom=BOOTH_Y;
    const bottomRoom=MASTER_H-BOOTH_Y;
    const scale=Math.max(
      (width/2)/Math.min(leftRoom,rightRoom),
      (height/2)/Math.min(topRoom,bottomRoom)
    );
    const tx=(width/2)-(BOOTH_X*scale);
    const ty=(height/2)-(BOOTH_Y*scale);

    const r=root();
    r.style.setProperty('--mq-exterior-portrait-scale',scale.toFixed(7));
    r.style.setProperty('--mq-exterior-portrait-x',`${tx.toFixed(3)}px`);
    r.style.setProperty('--mq-exterior-portrait-y',`${ty.toFixed(3)}px`);
    r.dataset.mqPortraitExteriorScale=scale.toFixed(5);
    r.dataset.mqPortraitExteriorX=tx.toFixed(1);
    r.dataset.mqPortraitExteriorY=ty.toFixed(1);
  }

  function apply(){
    raf=0;
    const active=mql.matches;
    root().classList.toggle('mq-exterior-portrait-v5',active);
    setMasterPortrait(active);
    if(active){
      ensureFx();
      applyPortraitTransform();
      const s=stage();
      if(s){
        s.dataset.mqMasterWidth=String(MASTER_W);
        s.dataset.mqMasterHeight=String(MASTER_H);
        s.dataset.mqScaleMode='portrait-booth-center-cover';
      }
    }
    window.__mqResponsiveExteriorPortraitVersion=VERSION;
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(apply);
  }

  const observer=new MutationObserver(()=>schedule());

  function start(){
    observer.observe(document.documentElement,{subtree:true,childList:true});
    mql.addEventListener?.('change',schedule);
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});
    window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('mq:responsive-layout-applied',schedule,{passive:true});
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
