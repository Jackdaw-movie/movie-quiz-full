(()=>{
  'use strict';

  const VERSION='responsive-exterior-v9.4-root-cause-clean';
  const PORTRAIT_QUERY='(orientation: portrait) and (max-width: 1180px)';
  const PORTRAIT_W=1086;
  const PORTRAIT_H=1235;
  const PORTRAIT_BOOTH_X=445;
  const PORTRAIT_BOOTH_Y=650;
  const DESKTOP_W=1672;
  const DESKTOP_H=941;
  const DESKTOP_BOOTH_X=820;
  const DESKTOP_BOOTH_Y=452;
  const DESKTOP_BOOTH_W=250;
  const DESKTOP_BOOTH_H=367;
  const ASSET_BASE='test-responsive/assets/exterior-portrait-v7/';
  const PORTRAIT_MASTER=ASSET_BASE+'master.webp';
  const DESKTOP_BOOTH_SRC='assets/exterior-v6-9/production/booth.webp';
  const portraitMql=matchMedia(PORTRAIT_QUERY);
  const initialDpr=Math.max(.1,Number(devicePixelRatio)||1);

  const PORTRAIT_BOOTH_POLYGON=[
    [104,19],[144,19],[173,29],[195,47],[207,67],[213,92],[207,108],
    [222,114],[228,124],[219,132],[219,379],[227,387],[227,396],[211,402],
    [37,402],[26,395],[26,385],[34,377],[34,134],[26,129],[24,118],[36,111],
    [41,92],[46,70],[58,49],[78,31]
  ];

  const DESKTOP_FALLBACK_POLYGON=[
    [.42,.02],[.34,.04],[.24,.08],[.14,.16],[.08,.27],[.09,.35],
    [.09,.87],[.13,.95],[.83,.95],[.90,.87],[.90,.34],[.88,.24],
    [.80,.14],[.62,.05]
  ];

  const BULBS=[
    [34,142],[50,144],[80,132],[90,130],[102,128],[114,124],[128,124],[142,120],[160,118],[176,116],
    [196,112],[210,110],[222,108],[234,106],[250,102],[268,100],[284,98],[300,94],[314,92],[328,90],
    [344,88],[364,84],[384,80],[400,78],[418,74],[438,70],[458,68],[478,64],[500,60],[520,58],
    [540,54],[560,52],[582,46],[604,40],[624,40],[646,34],[670,32],[692,26],[716,22],[738,20],
    [766,14],[790,10],[814,8],[836,2],[898,1],[910,7],[922,14],[934,21],[946,29],[958,37]
  ];

  let raf=0;
  let detachedOriginalBooth=null;
  let cleanBooth=null;
  let syntheticClick=false;
  let stageObserver=null;
  let bodyObserver=null;
  let desktopBoothAlpha=null;
  let desktopBoothAlphaW=0;
  let desktopBoothAlphaH=0;

  const root=()=>document.documentElement;
  const stage=()=>document.getElementById('mqExteriorStage');
  const scene=()=>document.getElementById('mqExteriorScene');
  const viewport=()=>scene()?.querySelector('.mq-v6-viewport');
  const master=()=>stage()?.querySelector('.mq-v6-master');
  const shoes=()=>document.getElementById('mqWalkCursor');

  function isExteriorInteractive(){
    const body=document.body;
    return Boolean(
      body?.classList.contains('mq-exterior-active') &&
      !body.classList.contains('mq-preloading') &&
      !body.classList.contains('mq-ticket-open') &&
      !body.classList.contains('mq-entering-auditorium')
    );
  }

  function isProtectedExteriorUi(event){
    const target=event?.target;
    return Boolean(target instanceof Element && target.closest?.(
      '#mqExteriorAudio,#mqExteriorAudioPanel,#mqExteriorAudioOpen'
    ));
  }

  function addImg(cls,file){
    const s=stage();
    if(!s)return null;
    let node=s.querySelector('.'+cls.split(' ').join('.'));
    if(node)return node;
    node=document.createElement('img');
    node.className='mq-pv9-layer '+cls;
    node.src=ASSET_BASE+file;
    node.alt='';
    node.decoding='async';
    node.setAttribute('aria-hidden','true');
    s.appendChild(node);
    return node;
  }

  function createBulbLayer(groupIndex){
    const layer=document.createElement('div');
    layer.className='mq-pv9-bulb-group g'+(groupIndex+1);
    for(let i=groupIndex;i<BULBS.length;i+=3){
      const [x,y]=BULBS[i];
      const bulb=document.createElement('i');
      bulb.className='mq-pv9-bulb-dot';
      bulb.style.left=x+'px';
      bulb.style.top=y+'px';
      layer.appendChild(bulb);
    }
    return layer;
  }

  function ensurePortraitLayers(){
    const s=stage();
    if(!s)return;
    addImg('mq-pv9-sign','jackdaws-sign.png');
    addImg('mq-pv9-sign-glow','jackdaws-glow.png');
    addImg('mq-pv9-hotel','hotel-sign.png');
    addImg('mq-pv9-hotel-glow','hotel-glow.png');
    addImg('mq-pv9-lamp','lamp.png');
    addImg('mq-pv9-car','car.png');
    if(!s.querySelector('.mq-pv9-car-shine')){
      const shine=document.createElement('div');
      shine.className='mq-pv9-car-shine';
      shine.setAttribute('aria-hidden','true');
      s.appendChild(shine);
    }
    addImg('mq-pv9-booth','booth.png');
    addImg('mq-pv9-booth-glow','booth-glow-only.png');
    if(!s.querySelector('.mq-pv9-marquee')){
      const marquee=document.createElement('div');
      marquee.className='mq-pv9-marquee';
      marquee.setAttribute('aria-hidden','true');
      marquee.appendChild(createBulbLayer(0));
      marquee.appendChild(createBulbLayer(1));
      marquee.appendChild(createBulbLayer(2));
      s.appendChild(marquee);
    }
    addImg('mq-pv9-steam steam-a','steam.png');
    addImg('mq-pv9-steam steam-b','steam.png');
    if(!s.querySelector('.mq-pv9-searchlights')){
      const lights=document.createElement('div');
      lights.className='mq-pv9-searchlights';
      lights.setAttribute('aria-hidden','true');
      lights.innerHTML='<i></i><i></i>';
      s.appendChild(lights);
    }
  }

  function rememberMaster(img){
    if(!img||img.dataset.mqPV9OriginalSrc)return;
    img.dataset.mqPV9OriginalSrc=img.getAttribute('src')||'';
    img.dataset.mqPV9OriginalWidth=img.getAttribute('width')||'1672';
    img.dataset.mqPV9OriginalHeight=img.getAttribute('height')||'941';
  }

  function setPortraitMaster(active){
    const img=master();
    if(!img)return;
    rememberMaster(img);
    if(active){
      if(img.getAttribute('src')!==PORTRAIT_MASTER)img.setAttribute('src',PORTRAIT_MASTER);
      img.setAttribute('width',String(PORTRAIT_W));
      img.setAttribute('height',String(PORTRAIT_H));
    }else{
      const src=img.dataset.mqPV9OriginalSrc;
      if(src&&img.getAttribute('src')!==src)img.setAttribute('src',src);
      img.setAttribute('width',img.dataset.mqPV9OriginalWidth||'1672');
      img.setAttribute('height',img.dataset.mqPV9OriginalHeight||'941');
    }
  }

  function scalePortrait(){
    const currentDpr=Math.max(.1,Number(devicePixelRatio)||initialDpr);
    const zoomRatio=currentDpr/initialDpr;
    const w=Math.max(1,innerWidth*zoomRatio);
    const h=Math.max(1,innerHeight*zoomRatio);
    root().style.setProperty('--mq-pv9-scale',Math.max(w/PORTRAIT_W,h/PORTRAIT_H).toFixed(7));
  }

  function loadDesktopBoothAlpha(){
    if(desktopBoothAlpha)return Promise.resolve(true);
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
          desktopBoothAlphaW=canvas.width;
          desktopBoothAlphaH=canvas.height;
          desktopBoothAlpha=new Uint8Array(desktopBoothAlphaW*desktopBoothAlphaH);
          for(let i=0,j=3;i<desktopBoothAlpha.length;i++,j+=4){
            desktopBoothAlpha[i]=rgba[j];
          }
          resolve(true);
        }catch(_){resolve(false)}
      };
      img.onerror=()=>resolve(false);
      img.src=DESKTOP_BOOTH_SRC;
    });
  }

  function pointInPolygon(x,y,points){
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const xi=points[i][0], yi=points[i][1];
      const xj=points[j][0], yj=points[j][1];
      const crosses=((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/((yj-yi)||1e-9)+xi);
      if(crosses)inside=!inside;
    }
    return inside;
  }

  function stageLocalPoint(clientX,clientY,designW,designH){
    const s=stage();
    if(!s)return null;
    const rect=s.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    return {
      x:(clientX-rect.left)*designW/rect.width,
      y:(clientY-rect.top)*designH/rect.height
    };
  }

  function portraitBoothHit(clientX,clientY){
    const point=stageLocalPoint(clientX,clientY,PORTRAIT_W,PORTRAIT_H);
    if(!point)return false;
    const x=point.x-PORTRAIT_BOOTH_X;
    const y=point.y-PORTRAIT_BOOTH_Y;
    if(x<0||y<0||x>245||y>405)return false;
    return pointInPolygon(x,y,PORTRAIT_BOOTH_POLYGON);
  }

  function desktopBoothHit(clientX,clientY){
    const point=stageLocalPoint(clientX,clientY,DESKTOP_W,DESKTOP_H);
    if(!point)return false;
    const nx=(point.x-DESKTOP_BOOTH_X)/DESKTOP_BOOTH_W;
    const ny=(point.y-DESKTOP_BOOTH_Y)/DESKTOP_BOOTH_H;
    if(nx<0||ny<0||nx>1||ny>1)return false;

    if(desktopBoothAlpha&&desktopBoothAlphaW&&desktopBoothAlphaH){
      const x=Math.max(0,Math.min(desktopBoothAlphaW-1,Math.floor(nx*(desktopBoothAlphaW-1))));
      const y=Math.max(0,Math.min(desktopBoothAlphaH-1,Math.floor(ny*(desktopBoothAlphaH-1))));
      return desktopBoothAlpha[y*desktopBoothAlphaW+x]>32;
    }
    return pointInPolygon(nx,ny,DESKTOP_FALLBACK_POLYGON);
  }

  function boothHit(clientX,clientY){
    return portraitMql.matches
      ? portraitBoothHit(clientX,clientY)
      : desktopBoothHit(clientX,clientY);
  }

  function stageContainsPoint(clientX,clientY){
    const s=stage();
    if(!s)return false;
    const rect=s.getBoundingClientRect();
    return clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom;
  }

  function setCursorHidden(active){
    const nodes=[root(),document.body,scene(),viewport(),stage()];
    stage()?.querySelectorAll(':scope > *').forEach(node=>nodes.push(node));
    for(const node of nodes){
      if(!(node instanceof HTMLElement))continue;
      if(active)node.style.setProperty('cursor','none','important');
      else if(node===stage()||node?.parentElement===stage())node.style.setProperty('cursor','default','important');
      else node.style.removeProperty('cursor');
    }
  }

  function setHover(active,event){
    root().classList.toggle('mq-v9-booth-hover',Boolean(active));
    root().classList.toggle('mq-pv9-booth-hover',Boolean(active&&portraitMql.matches));
    setCursorHidden(Boolean(active));
    const cursor=shoes();
    if(!cursor)return;
    if(active&&event){
      cursor.style.left=event.clientX+'px';
      cursor.style.top=event.clientY+'px';
      cursor.classList.add('is-visible');
    }else{
      cursor.classList.remove('is-visible');
    }
  }

  function clearHover(){
    root().classList.remove('mq-v9-booth-hover','mq-pv9-booth-hover');
    shoes()?.classList.remove('is-visible');
    setCursorHidden(false);
  }

  function removeLegacyRuntimeState(){
    root().classList.remove(
      'mq-booth-target-hover','mq-booth-alpha-hover','mq-booth-virtual-hover',
      'mq-pv6-booth-hover','mq-pv7-booth-hover','mq-pv8-booth-hover'
    );
    stage()?.querySelectorAll(
      '#mqResponsiveBoothHitTarget,.mq-responsive-booth-hit-target,'+
      '[data-mq-responsive-booth-target],[data-mq-booth-hit-target]'
    ).forEach(node=>node.remove());
  }

  function installCleanBooth(){
    const current=document.getElementById('mqTicketBoothHotspot');
    if(!current)return false;
    if(current.dataset.mqV94Clean==='1'){
      cleanBooth=current;
      return true;
    }
    detachedOriginalBooth=current;
    cleanBooth=current.cloneNode(true);
    cleanBooth.dataset.mqV94Clean='1';
    cleanBooth.removeAttribute('data-mq-v9-clean');
    cleanBooth.removeAttribute('data-mq-v93-clean');
    cleanBooth.className='mq-v9-booth-target';
    cleanBooth.setAttribute('aria-hidden','true');
    cleanBooth.tabIndex=-1;
    current.replaceWith(cleanBooth);
    return true;
  }

  function sanitizeStage(){
    const s=stage();
    if(!s)return;
    removeLegacyRuntimeState();
    for(const node of s.children){
      node.style.setProperty('pointer-events','none','important');
      if(node instanceof HTMLElement)node.style.setProperty('cursor','default','important');
    }
    if(cleanBooth){
      cleanBooth.style.setProperty('display','none','important');
      cleanBooth.style.setProperty('pointer-events','none','important');
      cleanBooth.style.setProperty('cursor','default','important');
    }
  }

  function triggerBooth(){
    if(syntheticClick||!detachedOriginalBooth||!isExteriorInteractive())return;
    syntheticClick=true;
    clearHover();
    try{detachedOriginalBooth.click()}finally{queueMicrotask(()=>{syntheticClick=false})}
  }

  function stopEvent(event){
    if(event.cancelable)event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  function captureExterior(event){
    if(syntheticClick||!isExteriorInteractive()){
      if(event.type==='pointermove'||event.type==='mousemove')clearHover();
      return;
    }
    if(isProtectedExteriorUi(event))return;
    if(typeof event.clientX!=='number'||typeof event.clientY!=='number')return;

    const insideStage=stageContainsPoint(event.clientX,event.clientY);
    if(!insideStage){
      if(event.type==='pointermove'||event.type==='mousemove')clearHover();
      return;
    }

    const hit=boothHit(event.clientX,event.clientY);

    if(event.type==='pointermove'||event.type==='mousemove'){
      const mouse=!event.pointerType||event.pointerType==='mouse';
      setHover(Boolean(hit&&mouse),event);
      stopEvent(event);
      return;
    }

    if(event.type==='click'){
      stopEvent(event);
      if(hit)triggerBooth();
      return;
    }

    stopEvent(event);
  }

  function setPortraitLayersVisible(active){
    stage()?.querySelectorAll('.mq-pv9-layer,.mq-pv9-car-shine,.mq-pv9-marquee,.mq-pv9-searchlights')
      .forEach(node=>{node.style.display=active?'block':'none'});
  }

  function apply(){
    raf=0;
    const portrait=portraitMql.matches;
    root().classList.toggle('mq-exterior-portrait-v9',portrait);
    setPortraitMaster(portrait);
    if(portrait){
      ensurePortraitLayers();
      setPortraitLayersVisible(true);
      scalePortrait();
    }else{
      setPortraitLayersVisible(false);
      loadDesktopBoothAlpha();
    }
    clearHover();
    sanitizeStage();
    try{window.MovieQuizMasterStage?.updateNow?.()}catch(_){}
    window.__mqResponsiveExteriorVersion=VERSION;
  }

  function schedule(){if(!raf)raf=requestAnimationFrame(apply)}

  function observe(){
    const s=stage();
    if(s&&!stageObserver){
      stageObserver=new MutationObserver(()=>queueMicrotask(sanitizeStage));
      stageObserver.observe(s,{childList:true,subtree:false});
    }
    if(document.body&&!bodyObserver){
      bodyObserver=new MutationObserver(()=>{
        if(!isExteriorInteractive())clearHover();
      });
      bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
    }
  }

  function start(){
    removeLegacyRuntimeState();
    if(!installCleanBooth()){
      setTimeout(start,80);
      return;
    }
    observe();
    sanitizeStage();
    loadDesktopBoothAlpha();

    for(const type of ['pointermove','mousemove','pointerover','mouseover','pointerdown','mousedown','pointerup','mouseup','click']){
      window.addEventListener(type,captureExterior,true);
    }
    window.addEventListener('blur',clearHover);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)clearHover()});
    window.addEventListener('resize',()=>{clearHover();schedule()},{passive:true});
    window.addEventListener('orientationchange',()=>{clearHover();schedule()},{passive:true});
    window.visualViewport?.addEventListener('resize',()=>{clearHover();schedule()},{passive:true});
    portraitMql.addEventListener?.('change',()=>{clearHover();schedule()});

    schedule();
    setTimeout(schedule,120);
    setTimeout(schedule,650);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
