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

/* Movie Quiz – exterior interaction v3.0
   The exterior mouse layer is rebuilt around the ACTUAL alpha silhouette of
   assets/exterior-v6-9/production/booth.webp.

   - no rectangular DOM mouse hotspot
   - no hand cursor anywhere in the exterior
   - only pixels belonging to the booth activate hover/click
   - transparent holes inside the booth silhouette are filled, so windows still
     behave as part of the booth
   - native cursor is hidden only while the booth is active; animated shoes are
     then the only visible pointer */
(()=>{
  'use strict';

  const VERSION='responsive-exterior-alpha-hit-v3.0';
  const ALPHA_THRESHOLD=56;
  let alphaMask=null;
  let maskWidth=0;
  let maskHeight=0;
  let maskSource='';
  let maskBuildPromise=null;
  let lastPointer=null;
  let pointerRaf=0;

  const boothButton=()=>document.getElementById('mqTicketBoothHotspot');
  const boothArt=()=>document.querySelector('#mqExteriorStage .mq-v6-booth-direct');
  const shoes=()=>document.getElementById('mqWalkCursor');

  function exteriorIsInteractive(){
    return document.body.classList.contains('mq-exterior-active') &&
      !document.body.classList.contains('mq-preloading') &&
      !document.body.classList.contains('mq-ticket-open') &&
      !document.body.classList.contains('mq-entering-auditorium');
  }

  function clearHover(){
    document.documentElement.classList.remove('mq-booth-alpha-hover');
    shoes()?.classList.remove('is-visible');
  }

  function setHover(active){
    const on=Boolean(active&&exteriorIsInteractive());
    document.documentElement.classList.toggle('mq-booth-alpha-hover',on);
    shoes()?.classList.toggle('is-visible',on);
  }

  function waitForImage(image){
    if(image.complete&&image.naturalWidth>0)return Promise.resolve(true);
    return new Promise(resolve=>{
      const done=ok=>{image.removeEventListener('load',onLoad);image.removeEventListener('error',onError);resolve(ok)};
      const onLoad=()=>done(true);
      const onError=()=>done(false);
      image.addEventListener('load',onLoad,{once:true});
      image.addEventListener('error',onError,{once:true});
    });
  }

  async function buildAlphaMask(){
    const image=boothArt();
    if(!image)return false;
    const source=image.currentSrc||image.src||'';
    if(alphaMask&&maskSource===source&&maskWidth===image.naturalWidth&&maskHeight===image.naturalHeight)return true;
    if(maskBuildPromise)return maskBuildPromise;

    maskBuildPromise=(async()=>{
      if(!await waitForImage(image))return false;
      try{await image.decode?.()}catch(_){}
      const w=image.naturalWidth|0;
      const h=image.naturalHeight|0;
      if(w<2||h<2)return false;

      try{
        const canvas=document.createElement('canvas');
        canvas.width=w;
        canvas.height=h;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});
        if(!ctx)return false;
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(image,0,0,w,h);
        const rgba=ctx.getImageData(0,0,w,h).data;
        const count=w*h;
        const solid=new Uint8Array(count);
        const outside=new Uint8Array(count);
        const queue=new Int32Array(count);
        let head=0;
        let tail=0;

        for(let i=0,p=3;i<count;i++,p+=4){
          if(rgba[p]>=ALPHA_THRESHOLD)solid[i]=1;
        }

        const enqueue=index=>{
          if(index<0||index>=count||solid[index]||outside[index])return;
          outside[index]=1;
          queue[tail++]=index;
        };

        /* Flood-fill transparent pixels connected to the image border. Any
           transparent pixels NOT reachable from the border are interior holes
           (windows etc.) and therefore belong to the booth silhouette. */
        for(let x=0;x<w;x++){
          enqueue(x);
          enqueue((h-1)*w+x);
        }
        for(let y=1;y<h-1;y++){
          enqueue(y*w);
          enqueue(y*w+w-1);
        }

        while(head<tail){
          const index=queue[head++];
          const x=index%w;
          if(x>0)enqueue(index-1);
          if(x<w-1)enqueue(index+1);
          if(index>=w)enqueue(index-w);
          if(index<count-w)enqueue(index+w);
        }

        const mask=new Uint8Array(count);
        for(let i=0;i<count;i++){
          if(solid[i]||!outside[i])mask[i]=1;
        }

        alphaMask=mask;
        maskWidth=w;
        maskHeight=h;
        maskSource=source;
        window.__mqExteriorBoothHitMap={version:VERSION,width:w,height:h,source};
        return true;
      }catch(error){
        console.warn('[Movie Quiz] Booth alpha hit-map unavailable',error);
        alphaMask=null;
        maskWidth=0;
        maskHeight=0;
        return false;
      }
    })().finally(()=>{maskBuildPromise=null});

    return maskBuildPromise;
  }

  function alphaHit(clientX,clientY){
    if(!exteriorIsInteractive()||!alphaMask)return false;
    const button=boothButton();
    const image=boothArt();
    if(!button||button.disabled||!image)return false;
    const rect=image.getBoundingClientRect();
    if(rect.width<=0||rect.height<=0)return false;
    if(clientX<rect.left||clientX>=rect.right||clientY<rect.top||clientY>=rect.bottom)return false;

    const px=Math.max(0,Math.min(maskWidth-1,Math.floor((clientX-rect.left)/rect.width*maskWidth)));
    const py=Math.max(0,Math.min(maskHeight-1,Math.floor((clientY-rect.top)/rect.height*maskHeight)));
    return alphaMask[py*maskWidth+px]===1;
  }

  function applyPointerState(){
    pointerRaf=0;
    if(!lastPointer||lastPointer.pointerType!=='mouse'){
      clearHover();
      return;
    }
    const active=alphaHit(lastPointer.x,lastPointer.y);
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
  window.addEventListener('blur',clearHover);
  window.addEventListener('mouseout',event=>{if(!event.relatedTarget)clearHover()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHover()});

  /* Forward only real clicks/taps on the booth silhouette to the existing booth
     button. The original ticket/approach logic remains untouched. */
  document.addEventListener('click',event=>{
    if(!event.isTrusted)return;
    if(typeof event.button==='number'&&event.button!==0)return;
    if(!alphaHit(event.clientX,event.clientY))return;
    event.preventDefault();
    event.stopPropagation();
    clearHover();
    boothButton()?.click();
  },true);

  const layoutChanged=()=>{
    schedulePointerCheck();
    if(!alphaMask)buildAlphaMask().then(schedulePointerCheck);
  };
  window.addEventListener('resize',layoutChanged,{passive:true});
  window.visualViewport?.addEventListener('resize',layoutChanged,{passive:true});
  window.visualViewport?.addEventListener('scroll',layoutChanged,{passive:true});
  window.addEventListener('mq:responsive-layout-applied',layoutChanged,{passive:true});
  window.addEventListener('mq:master-stage-resized',layoutChanged,{passive:true});
  window.addEventListener('mq:preload-entered',layoutChanged,{passive:true});

  const start=()=>{
    new MutationObserver(()=>{
      if(!exteriorIsInteractive())clearHover();
      schedulePointerCheck();
    }).observe(document.body,{attributes:true,attributeFilter:['class']});
    clearHover();
    buildAlphaMask().then(schedulePointerCheck);
    window.__mqResponsiveExteriorPointerVersion=VERSION;
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
