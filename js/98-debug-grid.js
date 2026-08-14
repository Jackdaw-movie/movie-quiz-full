(()=>{
  'use strict';

  const VERSION='debug-grid-v47-restored';
  const STAGES={
    AVATAR:{name:'AVATAR',selector:'#mqAvatarModal .mq-avatar-dialog',w:1672,h:941},
    TICKET:{name:'TICKET',selector:'#mqTicketLayer',w:1672,h:941},
    LOADING:{name:'LOADING',selector:'#mqPreloadGate',w:1279,h:720},
    EXTERIOR:{name:'EXTERIOR',selector:'#mqExteriorStage',w:1672,h:941},
    CINEMA:{name:'CINEMA',selector:'#cinema',w:1672,h:941}
  };

  let enabled=false;
  let current=null;
  let overlay=null;
  let canvas=null;
  let ctx=null;
  let toggle=null;
  let readout=null;
  let raf=0;
  let painted='';

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  function visible(el){
    if(!el||!el.isConnected||el.closest('[hidden]'))return false;
    const s=getComputedStyle(el);
    if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;
    const r=el.getBoundingClientRect();
    return r.width>20&&r.height>20&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;
  }

  function candidate(spec){
    const el=document.querySelector(spec.selector);
    return visible(el)?{...spec,el}:null;
  }

  function findStage(){
    /* Overlay states always win over the screen beneath them. */
    let found=candidate(STAGES.AVATAR);
    if(found)return found;
    found=candidate(STAGES.TICKET);
    if(found)return found;
    found=candidate(STAGES.LOADING);
    if(found)return found;

    /* Exterior remains in the DOM after entry, so body state decides whether
       it is still the active visual master. */
    if(document.body?.classList.contains('mq-exterior-active')){
      found=candidate(STAGES.EXTERIOR);
      if(found)return found;
    }

    found=candidate(STAGES.CINEMA);
    if(found)return found;

    return candidate(STAGES.EXTERIOR);
  }

  function removeLegacyNodes(){
    for(const id of [
      'mqDebugGridOverlay','mqDebugGridCanvas','mqDebugReadout','mqDebugToggle',
      'mqDebugCrosshairX','mqDebugCrosshairY','mqDebugScreenBox','mqDebugElementBox',
      'mqDebugGridOverlayV46','mqDebugGridCanvasV46','mqDebugToggleV46','mqDebugReadoutV46',
      'mqAvatarDebugGridLocal'
    ]) document.getElementById(id)?.remove();

    /* Earlier versions used these classes to control layout-adjacent debug UI.
       They are not used by v47. */
    document.body?.classList.remove(
      'mq-debug-grid-on','mq-debug-grid-enabled','mq-debug-grid-cursor','mq-debug-avatar-local'
    );
  }

  function ensureUI(){
    if(!document.body)return false;

    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='mqDebugGridOverlay';
      overlay.setAttribute('aria-hidden','true');
      canvas=document.createElement('canvas');
      canvas.id='mqDebugGridCanvas';
      overlay.appendChild(canvas);
      document.body.appendChild(overlay);
      ctx=canvas.getContext('2d');
    }

    if(!toggle){
      toggle=document.createElement('button');
      toggle.id='mqDebugToggle';
      toggle.type='button';
      toggle.title='Zapnout / vypnout master mřížku (G)';
      toggle.addEventListener('click',toggleGrid);
      document.body.appendChild(toggle);
    }

    if(!readout){
      readout=document.createElement('div');
      readout.id='mqDebugReadout';
      readout.setAttribute('aria-hidden','true');
      document.body.appendChild(readout);
    }

    updateToggle();
    return true;
  }

  function drawGrid(w,h){
    if(!ctx||!canvas)return;
    const key=`${w}x${h}`;
    if(key===painted)return;
    painted=key;
    canvas.width=w;
    canvas.height=h;
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

    ctx.font='700 17px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
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
    overlay.style.setProperty('display','block','important');
    drawGrid(spec.w,spec.h);
  }

  function hideOverlay(){
    if(overlay)overlay.style.setProperty('display','none','important');
    if(readout)readout.style.setProperty('display','none','important');
  }

  function updateToggle(){
    if(!toggle)return;
    toggle.textContent=enabled
      ?`GRID ON${current?.name?` · ${current.name}`:''} · G`
      :'GRID OFF · G';
  }

  function sync(){
    if(!enabled)return;
    const found=findStage();
    current=found;
    if(found)placeOverlay(found);
    else hideOverlay();
    updateToggle();
  }

  function frameLoop(){
    if(!enabled)return;
    sync();
    raf=requestAnimationFrame(frameLoop);
  }

  function setEnabled(value){
    enabled=Boolean(value);
    cancelAnimationFrame(raf);
    raf=0;

    if(enabled){
      sync();
      raf=requestAnimationFrame(frameLoop);
    }else{
      current=null;
      hideOverlay();
    }
    updateToggle();
  }

  function toggleGrid(){setEnabled(!enabled)}

  function pointerMove(e){
    if(!enabled||!current||!readout)return;
    const r=current.el.getBoundingClientRect();
    const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&r.width>0&&r.height>0;
    if(!inside){
      readout.style.setProperty('display','none','important');
      return;
    }

    const x=clamp((e.clientX-r.left)/r.width*current.w,0,current.w);
    const y=clamp((e.clientY-r.top)/r.height*current.h,0,current.h);
    readout.textContent=`${current.name} MASTER  x:${Math.round(x)}  y:${Math.round(y)}  /  ${current.w}×${current.h}`;
    readout.style.setProperty('display','block','important');

    let left=e.clientX+16;
    let top=e.clientY+16;
    const rw=readout.offsetWidth||260;
    const rh=readout.offsetHeight||38;
    if(left+rw>innerWidth-12)left=e.clientX-rw-16;
    if(top+rh>innerHeight-12)top=e.clientY-rh-16;
    readout.style.setProperty('left',`${Math.max(12,left)}px`,'important');
    readout.style.setProperty('top',`${Math.max(12,top)}px`,'important');
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
    removeLegacyNodes();
    ensureUI();
    window.addEventListener('keydown',keyHandler,true);
    document.addEventListener('mousemove',pointerMove,{passive:true});
    const p=new URLSearchParams(location.search);
    if(p.get('mqGrid')==='1')setEnabled(true);
    window.MovieQuizDebugGrid={
      version:VERSION,
      get enabled(){return enabled},
      toggle:toggleGrid,
      setEnabled,
      get stage(){return current?.name||null}
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
