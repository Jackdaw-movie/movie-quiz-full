(()=>{
  'use strict';

  const VERSION='debug-grid-v46-inert-overlay';
  const STAGES=[
    {name:'AVATAR',selector:'#mqAvatarModal .mq-avatar-dialog',w:1672,h:941},
    {name:'TICKET',selector:'.mq-ticket-master-stage',w:1672,h:941},
    {name:'LOADING',selector:'.mq-preload-master-stage',w:1279,h:720},
    {name:'EXTERIOR',selector:'.mq-v6-stage',w:1672,h:941},
    {name:'CINEMA',selector:'#cinema',w:1672,h:941}
  ];

  let enabled=false;
  let current=null;
  let overlay=null;
  let canvas=null;
  let toggle=null;
  let readout=null;
  let raf=0;
  let paintedKey='';

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function ensureStyle(id,href){
    if(document.getElementById(id))return;
    const link=document.createElement('link');
    link.id=id;
    link.rel='stylesheet';
    link.href=href;
    document.head.appendChild(link);
  }

  function visible(el){
    if(!el||!el.isConnected||el.closest('[hidden]'))return false;
    const s=getComputedStyle(el);
    if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;
    const r=el.getBoundingClientRect();
    return r.width>20&&r.height>20&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;
  }

  function findStage(){
    for(const spec of STAGES){
      const nodes=document.querySelectorAll(spec.selector);
      for(const el of nodes){
        if(visible(el))return {...spec,el};
      }
    }
    return null;
  }

  function removeLegacyGridState(){
    document.body?.classList.remove('mq-debug-grid-on','mq-debug-grid-enabled','mq-debug-grid-cursor','mq-debug-avatar-local');
    for(const id of [
      'mqDebugGridOverlay','mqDebugGridCanvas','mqDebugCrosshairX','mqDebugCrosshairY',
      'mqDebugScreenBox','mqDebugElementBox','mqDebugReadout','mqDebugToggle','mqAvatarDebugGridLocal'
    ]){
      document.getElementById(id)?.remove();
    }
  }

  function ensureUI(){
    if(!document.body)return false;
    ensureStyle('mq-debug-grid-v46-style','css/debug-grid-v46.css?v=46.0');
    ensureStyle('mq-avatar-alignment-v46-style','css/avatar-alignment-v46.css?v=46.0');

    overlay=document.getElementById('mqDebugGridOverlayV46');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='mqDebugGridOverlayV46';
      overlay.setAttribute('aria-hidden','true');
      canvas=document.createElement('canvas');
      canvas.id='mqDebugGridCanvasV46';
      overlay.appendChild(canvas);
      document.body.appendChild(overlay);
    }else{
      canvas=document.getElementById('mqDebugGridCanvasV46');
    }

    toggle=document.getElementById('mqDebugToggleV46');
    if(!toggle){
      toggle=document.createElement('button');
      toggle.id='mqDebugToggleV46';
      toggle.type='button';
      toggle.title='Zapnout / vypnout master mřížku (G)';
      toggle.addEventListener('click',toggleGrid);
      document.body.appendChild(toggle);
    }

    readout=document.getElementById('mqDebugReadoutV46');
    if(!readout){
      readout=document.createElement('div');
      readout.id='mqDebugReadoutV46';
      readout.setAttribute('aria-hidden','true');
      document.body.appendChild(readout);
    }

    updateButton();
    return true;
  }

  function paintGrid(w,h){
    if(!canvas)return;
    const key=`${w}x${h}`;
    if(key===paintedKey)return;
    paintedKey=key;
    canvas.width=w;
    canvas.height=h;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;
    ctx.clearRect(0,0,w,h);
    ctx.save();

    for(let x=0;x<=w;x+=10){
      const major=x%100===0;
      const medium=!major&&x%50===0;
      ctx.beginPath();
      ctx.moveTo(x+.5,0);
      ctx.lineTo(x+.5,h);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.58)':medium?'rgba(255,255,255,.30)':'rgba(255,255,255,.10)';
      ctx.stroke();
    }
    for(let y=0;y<=h;y+=10){
      const major=y%100===0;
      const medium=!major&&y%50===0;
      ctx.beginPath();
      ctx.moveTo(0,y+.5);
      ctx.lineTo(w,y+.5);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.58)':medium?'rgba(255,255,255,.30)':'rgba(255,255,255,.10)';
      ctx.stroke();
    }

    ctx.font='700 17px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textBaseline='top';
    for(let x=0;x<=w-20;x+=100){
      ctx.fillStyle='rgba(0,0,0,.74)';
      ctx.fillRect(x+3,3,58,23);
      ctx.fillStyle='#fff';
      ctx.fillText(String(x),x+7,5);
    }
    for(let y=100;y<=h-20;y+=100){
      ctx.fillStyle='rgba(0,0,0,.74)';
      ctx.fillRect(3,y+3,58,23);
      ctx.fillStyle='#fff';
      ctx.fillText(String(y),7,y+5);
    }
    ctx.restore();
  }

  function placeOverlay(spec){
    if(!overlay||!spec)return;
    const r=spec.el.getBoundingClientRect();
    overlay.style.setProperty('left',`${r.left}px`,'important');
    overlay.style.setProperty('top',`${r.top}px`,'important');
    overlay.style.setProperty('width',`${r.width}px`,'important');
    overlay.style.setProperty('height',`${r.height}px`,'important');
    overlay.dataset.active='1';
    paintGrid(spec.w,spec.h);
  }

  function sync(){
    if(!enabled)return;
    const found=findStage();
    current=found;
    if(!found){
      if(overlay)overlay.dataset.active='0';
      updateButton();
      return;
    }
    placeOverlay(found);
    updateButton();
  }

  function loop(){
    if(!enabled)return;
    sync();
    raf=requestAnimationFrame(loop);
  }

  function updateButton(){
    if(!toggle)return;
    toggle.textContent=enabled?`GRID ON${current?.name?` · ${current.name}`:''} · G`:'GRID OFF · G';
  }

  function setEnabled(next){
    enabled=Boolean(next);
    cancelAnimationFrame(raf);
    raf=0;
    if(enabled){
      sync();
      raf=requestAnimationFrame(loop);
    }else{
      current=null;
      if(overlay)overlay.dataset.active='0';
      if(readout)readout.dataset.active='0';
    }
    updateButton();
  }

  function toggleGrid(){
    setEnabled(!enabled);
  }

  function pointerMove(e){
    if(!enabled||!current||!readout)return;
    const r=current.el.getBoundingClientRect();
    const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
    if(!inside||r.width<=0||r.height<=0){
      readout.dataset.active='0';
      return;
    }
    const x=clamp((e.clientX-r.left)/r.width*current.w,0,current.w);
    const y=clamp((e.clientY-r.top)/r.height*current.h,0,current.h);
    readout.textContent=`${current.name}  x:${Math.round(x)}  y:${Math.round(y)}`;
    readout.dataset.active='1';
    let left=e.clientX+14;
    let top=e.clientY+14;
    const rw=readout.offsetWidth||180;
    const rh=readout.offsetHeight||32;
    if(left+rw>innerWidth-10)left=e.clientX-rw-14;
    if(top+rh>innerHeight-10)top=e.clientY-rh-14;
    readout.style.left=Math.max(10,left)+'px';
    readout.style.top=Math.max(10,top)+'px';
  }

  function keyHandler(e){
    if(String(e.key).toLowerCase()!=='g'||e.metaKey||e.ctrlKey||e.altKey)return;
    const active=document.activeElement;
    if(active&&active.matches('input,textarea,select,[contenteditable="true"]'))return;
    e.preventDefault();
    e.stopImmediatePropagation();
    toggleGrid();
  }

  function boot(){
    removeLegacyGridState();
    ensureUI();
    window.addEventListener('keydown',keyHandler,true);
    document.addEventListener('mousemove',pointerMove,{passive:true});
    const p=new URLSearchParams(location.search);
    if(p.get('mqGrid')==='1')setEnabled(true);
    window.MovieQuizDebugGrid={version:VERSION,get enabled(){return enabled},toggle:toggleGrid,setEnabled};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
