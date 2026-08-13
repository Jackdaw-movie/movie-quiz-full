(()=>{
  'use strict';

  const MASTER_W=1672;
  const MASTER_H=941;

  let enabled=false;
  let cinema=null, overlay=null, canvas=null, ctx=null;
  let crossX=null, crossY=null, screenBox=null, elementBox=null, readout=null, toggle=null;

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

  function drawGrid(){
    if(!ctx)return;
    canvas.width=MASTER_W;
    canvas.height=MASTER_H;
    ctx.clearRect(0,0,MASTER_W,MASTER_H);
    ctx.save();
    for(let x=0;x<=MASTER_W;x+=10){
      const major=x%100===0, medium=!major&&x%50===0;
      ctx.beginPath(); ctx.moveTo(x+.5,0); ctx.lineTo(x+.5,MASTER_H);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.55)':medium?'rgba(255,255,255,.28)':'rgba(255,255,255,.09)';
      ctx.stroke();
    }
    for(let y=0;y<=MASTER_H;y+=10){
      const major=y%100===0, medium=!major&&y%50===0;
      ctx.beginPath(); ctx.moveTo(0,y+.5); ctx.lineTo(MASTER_W,y+.5);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.55)':medium?'rgba(255,255,255,.28)':'rgba(255,255,255,.09)';
      ctx.stroke();
    }
    ctx.font='700 17px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textBaseline='top';
    for(let x=0;x<=MASTER_W-20;x+=100){
      ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(x+3,3,58,23);
      ctx.fillStyle='#fff'; ctx.fillText(String(x),x+7,5);
    }
    for(let y=100;y<=MASTER_H-20;y+=100){
      ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(3,y+3,58,23);
      ctx.fillStyle='#fff'; ctx.fillText(String(y),7,y+5);
    }
    ctx.restore();
  }

  function ensureUI(){
    const body=document.body;
    if(!body)return false;

    cinema=document.getElementById('cinema');

    toggle=make('button','mqDebugToggle',body);
    toggle.type='button';
    toggle.title='Zapnout / vypnout master mřížku (G)';
    if(!toggle.dataset.bound){
      toggle.dataset.bound='1';
      toggle.addEventListener('click',toggleGrid);
    }

    body.classList.add('mq-debug-grid-enabled');
    toggle.textContent=enabled?'GRID ON · G':'GRID OFF · G';

    if(!cinema)return true; // Toggle still works; cinema may become available later.

    overlay=make('div','mqDebugGridOverlay',cinema);
    canvas=make('canvas','mqDebugGridCanvas',overlay);
    ctx=canvas.getContext('2d');
    crossX=make('div','mqDebugCrosshairX',overlay);
    crossY=make('div','mqDebugCrosshairY',overlay);
    screenBox=make('div','mqDebugScreenBox',overlay);
    elementBox=make('div','mqDebugElementBox',overlay);
    readout=make('div','mqDebugReadout',body);
    drawGrid();
    updateScreenBox();
    return true;
  }

  function masterRectFromViewportRect(r){
    if(!cinema)return null;
    const c=cinema.getBoundingClientRect();
    if(!c.width||!c.height)return null;
    return {
      x:(r.left-c.left)/c.width*MASTER_W,
      y:(r.top-c.top)/c.height*MASTER_H,
      w:r.width/c.width*MASTER_W,
      h:r.height/c.height*MASTER_H
    };
  }

  function setMasterBox(el,r,label){
    if(!el||!r){if(el)el.style.display='none';return;}
    el.style.display='block';
    el.style.left=(r.x/MASTER_W*100)+'%';
    el.style.top=(r.y/MASTER_H*100)+'%';
    el.style.width=(r.w/MASTER_W*100)+'%';
    el.style.height=(r.h/MASTER_H*100)+'%';
    el.dataset.label=label;
  }

  function updateScreenBox(){
    if(!cinema||!screenBox)return;
    const screen=document.querySelector('#cinema .screen-frame');
    if(!screen){screenBox.style.display='none';return;}
    const r=masterRectFromViewportRect(screen.getBoundingClientRect());
    setMasterBox(screenBox,r,`GAME SCREEN x:${round(r.x)} y:${round(r.y)} ${round(r.w)}×${round(r.h)}`);
  }

  function toggleGrid(){
    ensureUI();
    enabled=!enabled;
    document.body.classList.toggle('mq-debug-grid-on',enabled);
    document.body.classList.toggle('mq-debug-grid-cursor',false);
    if(toggle)toggle.textContent=enabled?'GRID ON · G':'GRID OFF · G';
    if(readout)readout.style.display='none';
    if(elementBox)elementBox.style.display='none';
    if(enabled)updateScreenBox();
  }

  function describeElement(el){
    if(!el||el===document.body||el===document.documentElement)return 'BODY';
    const id=el.id?`#${el.id}`:'';
    const cls=[...el.classList].filter(c=>!c.startsWith('mq-debug')).slice(0,3).map(c=>'.'+c).join('');
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }

  function pointerMove(e){
    if(!enabled)return;
    ensureUI();
    if(!cinema||!overlay||!readout)return;
    const r=cinema.getBoundingClientRect();
    const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&r.width>0&&r.height>0;
    if(!inside){
      document.body.classList.remove('mq-debug-grid-cursor');
      readout.style.display='none';
      if(elementBox)elementBox.style.display='none';
      return;
    }

    const x=clamp((e.clientX-r.left)/r.width*MASTER_W,0,MASTER_W);
    const y=clamp((e.clientY-r.top)/r.height*MASTER_H,0,MASTER_H);
    document.body.classList.add('mq-debug-grid-cursor');
    crossY.style.left=(x/MASTER_W*100)+'%';
    crossX.style.top=(y/MASTER_H*100)+'%';

    // Temporarily hide overlay from hit testing so the real element is found.
    overlay.style.visibility='hidden';
    const hit=document.elementFromPoint(e.clientX,e.clientY);
    overlay.style.visibility='';

    let hitRect=null;
    if(hit&&cinema.contains(hit)){
      hitRect=masterRectFromViewportRect(hit.getBoundingClientRect());
      setMasterBox(elementBox,hitRect,`${describeElement(hit)} x:${round(hitRect.x)} y:${round(hitRect.y)} ${round(hitRect.w)}×${round(hitRect.h)}`);
    }else if(elementBox){
      elementBox.style.display='none';
    }

    const screen=document.querySelector('#cinema .screen-frame');
    let screenText='';
    if(screen){
      const sr=screen.getBoundingClientRect();
      if(e.clientX>=sr.left&&e.clientX<=sr.right&&e.clientY>=sr.top&&e.clientY<=sr.bottom){
        const sx=(e.clientX-sr.left)/sr.width*sr.width/(r.width/MASTER_W);
        const sy=(e.clientY-sr.top)/sr.height*sr.height/(r.height/MASTER_H);
        screenText=`\nSCREEN x:${round(sx)} y:${round(sy)}`;
      }
    }

    readout.textContent=`MASTER x:${round(x)} y:${round(y)} / ${MASTER_W}×${MASTER_H}${screenText}${hitRect?`\n${describeElement(hit)} box ${round(hitRect.x)},${round(hitRect.y)} ${round(hitRect.w)}×${round(hitRect.h)}`:''}`;
    readout.style.display='block';
    let left=e.clientX+16, top=e.clientY+16;
    const rw=readout.offsetWidth||300, rh=readout.offsetHeight||90;
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
  window.addEventListener('resize',()=>{if(enabled)updateScreenBox();},{passive:true});

  const boot=()=>{
    ensureUI();
    // Optional auto-enable still supported, but it is no longer required.
    const p=new URLSearchParams(location.search);
    if(p.get('mqGrid')==='1'&&!enabled)toggleGrid();
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  const observer=new MutationObserver(()=>ensureUI());
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
