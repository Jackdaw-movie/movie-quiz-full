(()=>{
  'use strict';

  /* v44 also loads the final UI-polish layer. Keeping this as a separate CSS
     file makes the geometry patch reversible and avoids touching game logic. */
  function ensurePolishStyles(){
    if(document.getElementById('mq-ui-polish-v44'))return;
    const link=document.createElement('link');
    link.id='mq-ui-polish-v44';
    link.rel='stylesheet';
    link.href='css/ui-polish-v44.css?v=44.0';
    document.head.appendChild(link);
  }
  ensurePolishStyles();

  const STAGES=[
    {name:'AVATAR',selector:'#mqAvatarModal .mq-avatar-dialog',w:1672,h:941},
    {name:'TICKET',selector:'.mq-ticket-master-stage',w:1672,h:941},
    {name:'LOADING',selector:'.mq-preload-master-stage',w:1279,h:720},
    {name:'EXTERIOR',selector:'.mq-v6-stage',w:1672,h:941},
    {name:'CINEMA',selector:'#cinema',w:1672,h:941}
  ];

  let enabled=false;
  let target=null;
  let targetName='';
  let masterW=1672;
  let masterH=941;
  let overlay=null, canvas=null, ctx=null;
  let crossX=null, crossY=null, screenBox=null, elementBox=null, readout=null, toggle=null;
  let rafId=0;
  let lastGridKey='';
  let lastRectKey='';

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const round=v=>Math.round(v);

  function make(tag,id,parent){
    let el=document.getElementById(id);
    if(el)return el;
    el=document.createElement(tag);
    el.id=id;
    parent.appendChild(el);
    return el;
  }

  function elementVisible(el){
    if(!el||!el.isConnected)return false;
    if(el.closest('[hidden]'))return false;
    const style=getComputedStyle(el);
    if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0)return false;
    const r=el.getBoundingClientRect();
    return r.width>20&&r.height>20&&r.bottom>0&&r.right>0&&r.left<innerWidth&&r.top<innerHeight;
  }

  function findStage(){
    for(const spec of STAGES){
      const nodes=document.querySelectorAll(spec.selector);
      for(const el of nodes){
        if(elementVisible(el))return {...spec,el};
      }
    }
    return null;
  }

  function drawGrid(force=false){
    if(!ctx||!canvas)return;
    const key=`${masterW}x${masterH}`;
    if(!force&&key===lastGridKey)return;
    lastGridKey=key;

    canvas.width=masterW;
    canvas.height=masterH;
    ctx.clearRect(0,0,masterW,masterH);
    ctx.save();

    for(let x=0;x<=masterW;x+=10){
      const major=x%100===0;
      const medium=!major&&x%50===0;
      ctx.beginPath();
      ctx.moveTo(x+.5,0);
      ctx.lineTo(x+.5,masterH);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.55)':medium?'rgba(255,255,255,.28)':'rgba(255,255,255,.09)';
      ctx.stroke();
    }
    for(let y=0;y<=masterH;y+=10){
      const major=y%100===0;
      const medium=!major&&y%50===0;
      ctx.beginPath();
      ctx.moveTo(0,y+.5);
      ctx.lineTo(masterW,y+.5);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.55)':medium?'rgba(255,255,255,.28)':'rgba(255,255,255,.09)';
      ctx.stroke();
    }

    ctx.font='700 17px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textBaseline='top';
    for(let x=0;x<=masterW-20;x+=100){
      ctx.fillStyle='rgba(0,0,0,.72)';
      ctx.fillRect(x+3,3,58,23);
      ctx.fillStyle='#fff';
      ctx.fillText(String(x),x+7,5);
    }
    for(let y=100;y<=masterH-20;y+=100){
      ctx.fillStyle='rgba(0,0,0,.72)';
      ctx.fillRect(3,y+3,58,23);
      ctx.fillStyle='#fff';
      ctx.fillText(String(y),7,y+5);
    }
    ctx.restore();
  }

  function ensureUI(){
    const body=document.body;
    if(!body)return false;

    overlay=make('div','mqDebugGridOverlay',body);
    canvas=make('canvas','mqDebugGridCanvas',overlay);
    ctx=canvas.getContext('2d');
    crossX=make('div','mqDebugCrosshairX',overlay);
    crossY=make('div','mqDebugCrosshairY',overlay);
    screenBox=make('div','mqDebugScreenBox',overlay);
    elementBox=make('div','mqDebugElementBox',overlay);
    readout=make('div','mqDebugReadout',body);

    toggle=make('button','mqDebugToggle',body);
    toggle.type='button';
    toggle.title='Zapnout / vypnout master mřížku (G)';
    if(!toggle.dataset.bound){
      toggle.dataset.bound='1';
      toggle.addEventListener('click',toggleGrid);
    }

    body.classList.add('mq-debug-grid-enabled');
    updateToggleLabel();
    return true;
  }

  function updateToggleLabel(){
    if(!toggle)return;
    const suffix=targetName?` · ${targetName}`:'';
    toggle.textContent=enabled?`GRID ON${suffix} · G`:'GRID OFF · G';
  }

  function setOverlayRect(r){
    if(!overlay||!r)return;
    const key=[r.left,r.top,r.width,r.height].map(v=>Math.round(v*100)/100).join('|');
    if(key===lastRectKey)return;
    lastRectKey=key;
    overlay.style.setProperty('left',`${r.left}px`,'important');
    overlay.style.setProperty('top',`${r.top}px`,'important');
    overlay.style.setProperty('width',`${r.width}px`,'important');
    overlay.style.setProperty('height',`${r.height}px`,'important');
  }

  function syncTarget(force=false){
    if(!ensureUI())return false;
    const found=findStage();
    if(!found){
      target=null;
      targetName='';
      if(overlay){
        overlay.style.setProperty('width','0px','important');
        overlay.style.setProperty('height','0px','important');
      }
      updateToggleLabel();
      return false;
    }

    const changed=target!==found.el||targetName!==found.name||masterW!==found.w||masterH!==found.h;
    target=found.el;
    targetName=found.name;
    masterW=found.w;
    masterH=found.h;

    setOverlayRect(target.getBoundingClientRect());
    if(changed||force){
      lastGridKey='';
      drawGrid(true);
      updateToggleLabel();
    }else{
      drawGrid(false);
    }
    updateScreenBox();
    return true;
  }

  function masterRectFromViewportRect(r){
    if(!target)return null;
    const t=target.getBoundingClientRect();
    if(!t.width||!t.height)return null;
    return {
      x:(r.left-t.left)/t.width*masterW,
      y:(r.top-t.top)/t.height*masterH,
      w:r.width/t.width*masterW,
      h:r.height/t.height*masterH
    };
  }

  function setMasterBox(el,r,label){
    if(!el||!r){if(el)el.style.display='none';return;}
    el.style.display='block';
    el.style.left=(r.x/masterW*100)+'%';
    el.style.top=(r.y/masterH*100)+'%';
    el.style.width=(r.w/masterW*100)+'%';
    el.style.height=(r.h/masterH*100)+'%';
    el.dataset.label=label;
  }

  function updateScreenBox(){
    if(!screenBox)return;
    if(targetName!=='CINEMA'){
      screenBox.style.display='none';
      return;
    }
    const screen=document.querySelector('#cinema .screen-frame');
    if(!screen||!elementVisible(screen)){
      screenBox.style.display='none';
      return;
    }
    const r=masterRectFromViewportRect(screen.getBoundingClientRect());
    setMasterBox(screenBox,r,`GAME SCREEN x:${round(r.x)} y:${round(r.y)} ${round(r.w)}×${round(r.h)}`);
  }

  function startSyncLoop(){
    cancelAnimationFrame(rafId);
    const tick=()=>{
      if(!enabled)return;
      syncTarget(false);
      rafId=requestAnimationFrame(tick);
    };
    rafId=requestAnimationFrame(tick);
  }

  function toggleGrid(){
    ensureUI();
    enabled=!enabled;
    document.body.classList.toggle('mq-debug-grid-on',enabled);
    document.body.classList.remove('mq-debug-grid-cursor');
    if(readout)readout.style.display='none';
    if(elementBox)elementBox.style.display='none';
    if(screenBox)screenBox.style.display='none';

    if(enabled){
      syncTarget(true);
      startSyncLoop();
    }else{
      cancelAnimationFrame(rafId);
      rafId=0;
    }
    updateToggleLabel();
  }

  function describeElement(el){
    if(!el||el===document.body||el===document.documentElement)return 'BODY';
    const id=el.id?`#${el.id}`:'';
    const cls=[...el.classList]
      .filter(c=>!c.startsWith('mq-debug'))
      .slice(0,3)
      .map(c=>'.'+c)
      .join('');
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }

  function pointerMove(e){
    if(!enabled)return;
    if(!syncTarget(false)||!target||!overlay||!readout)return;

    const r=target.getBoundingClientRect();
    const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&r.width>0&&r.height>0;
    if(!inside){
      document.body.classList.remove('mq-debug-grid-cursor');
      readout.style.display='none';
      if(elementBox)elementBox.style.display='none';
      return;
    }

    const x=clamp((e.clientX-r.left)/r.width*masterW,0,masterW);
    const y=clamp((e.clientY-r.top)/r.height*masterH,0,masterH);
    document.body.classList.add('mq-debug-grid-cursor');
    crossY.style.left=(x/masterW*100)+'%';
    crossX.style.top=(y/masterH*100)+'%';

    overlay.style.visibility='hidden';
    const hit=document.elementFromPoint(e.clientX,e.clientY);
    overlay.style.visibility='';

    let hitRect=null;
    if(hit&&target.contains(hit)){
      hitRect=masterRectFromViewportRect(hit.getBoundingClientRect());
      setMasterBox(elementBox,hitRect,`${describeElement(hit)} x:${round(hitRect.x)} y:${round(hitRect.y)} ${round(hitRect.w)}×${round(hitRect.h)}`);
    }else if(elementBox){
      elementBox.style.display='none';
    }

    let screenText='';
    if(targetName==='CINEMA'){
      const screen=document.querySelector('#cinema .screen-frame');
      if(screen){
        const sr=screen.getBoundingClientRect();
        if(e.clientX>=sr.left&&e.clientX<=sr.right&&e.clientY>=sr.top&&e.clientY<=sr.bottom){
          const sx=(e.clientX-r.left)/r.width*masterW-(sr.left-r.left)/r.width*masterW;
          const sy=(e.clientY-r.top)/r.height*masterH-(sr.top-r.top)/r.height*masterH;
          screenText=`\nSCREEN local x:${round(sx)} y:${round(sy)}`;
        }
      }
    }

    readout.textContent=`${targetName} MASTER x:${round(x)} y:${round(y)} / ${masterW}×${masterH}${screenText}${hitRect?`\n${describeElement(hit)} box ${round(hitRect.x)},${round(hitRect.y)} ${round(hitRect.w)}×${round(hitRect.h)}`:''}`;
    readout.style.display='block';

    let left=e.clientX+16;
    let top=e.clientY+16;
    const rw=readout.offsetWidth||320;
    const rh=readout.offsetHeight||100;
    if(left+rw>innerWidth-12)left=e.clientX-rw-16;
    if(top+rh>innerHeight-12)top=e.clientY-rh-16;
    readout.style.left=Math.max(12,left)+'px';
    readout.style.top=Math.max(12,top)+'px';
  }

  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()!=='g'||e.metaKey||e.ctrlKey||e.altKey)return;
    const a=document.activeElement;
    if(a&&a.matches('input,textarea,select,[contenteditable="true"]'))return;
    e.preventDefault();
    toggleGrid();
  },true);

  document.addEventListener('mousemove',pointerMove,{passive:true});
  window.addEventListener('resize',()=>{if(enabled)syncTarget(true);},{passive:true});

  /* Page/state switches use class/hidden mutations. Do not observe style here,
     because the grid itself writes inline geometry while enabled. */
  const observer=new MutationObserver(mutations=>{
    if(!enabled)return;
    if(mutations.some(m=>!m.target.closest?.('#mqDebugGridOverlay,#mqDebugReadout,#mqDebugToggle'))){
      syncTarget(true);
    }
  });

  function boot(){
    ensurePolishStyles();
    ensureUI();
    observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden']});
    const p=new URLSearchParams(location.search);
    if(p.get('mqGrid')==='1'&&!enabled)toggleGrid();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();
