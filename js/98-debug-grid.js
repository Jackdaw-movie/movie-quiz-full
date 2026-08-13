(()=>{
  'use strict';

  const params=new URLSearchParams(location.search);
  if(params.get('mqGrid')!=='1') return;

  const MASTER_W=1672;
  const MASTER_H=941;
  const body=document.body;
  body.classList.add('mq-debug-grid-enabled','mq-debug-grid-on');

  let cinema=null;
  let overlay=null;
  let canvas=null;
  let ctx=null;
  let crossX=null;
  let crossY=null;
  let screenBox=null;
  let elementBox=null;
  let readout=null;
  let toggle=null;
  let mouse={x:0,y:0,inside:false,clientX:0,clientY:0};

  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const round=v=>Math.round(v);

  function make(tag,id,parent){
    const el=document.createElement(tag);
    el.id=id;
    parent.appendChild(el);
    return el;
  }

  function ensureUI(){
    cinema=document.getElementById('cinema');
    if(!cinema) return false;
    if(document.getElementById('mqDebugGridOverlay')) return true;

    overlay=make('div','mqDebugGridOverlay',cinema);
    canvas=make('canvas','mqDebugGridCanvas',overlay);
    canvas.width=MASTER_W;
    canvas.height=MASTER_H;
    ctx=canvas.getContext('2d');

    crossX=make('div','mqDebugCrosshairX',overlay);
    crossY=make('div','mqDebugCrosshairY',overlay);
    screenBox=make('div','mqDebugScreenBox',overlay);
    elementBox=make('div','mqDebugElementBox',overlay);
    readout=make('div','mqDebugReadout',document.body);
    toggle=make('button','mqDebugToggle',document.body);
    toggle.type='button';
    toggle.textContent='GRID ON · G';
    toggle.title='Zapnout / vypnout master mřížku (G)';
    toggle.addEventListener('click',toggleGrid);

    drawGrid();
    updateGeometry();
    return true;
  }

  function drawGrid(){
    if(!ctx) return;
    ctx.clearRect(0,0,MASTER_W,MASTER_H);
    ctx.save();

    for(let x=0;x<=MASTER_W;x+=10){
      const major=x%100===0;
      const medium=!major && x%50===0;
      ctx.beginPath();
      ctx.moveTo(x+.5,0);
      ctx.lineTo(x+.5,MASTER_H);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.52)':medium?'rgba(255,255,255,.26)':'rgba(255,255,255,.085)';
      ctx.stroke();
    }
    for(let y=0;y<=MASTER_H;y+=10){
      const major=y%100===0;
      const medium=!major && y%50===0;
      ctx.beginPath();
      ctx.moveTo(0,y+.5);
      ctx.lineTo(MASTER_W,y+.5);
      ctx.lineWidth=major?2:1;
      ctx.strokeStyle=major?'rgba(255,255,255,.52)':medium?'rgba(255,255,255,.26)':'rgba(255,255,255,.085)';
      ctx.stroke();
    }

    ctx.font='700 17px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline='top';
    for(let x=0;x<=MASTER_W-20;x+=100){
      ctx.fillStyle='rgba(0,0,0,.68)';
      ctx.fillRect(x+3,3,54,22);
      ctx.fillStyle='rgba(255,255,255,.96)';
      ctx.fillText(String(x),x+7,5);
    }
    for(let y=100;y<=MASTER_H-20;y+=100){
      ctx.fillStyle='rgba(0,0,0,.68)';
      ctx.fillRect(3,y+3,54,22);
      ctx.fillStyle='rgba(255,255,255,.96)';
      ctx.fillText(String(y),7,y+5);
    }

    ctx.restore();
  }

  function masterRectFromViewportRect(r){
    const c=cinema.getBoundingClientRect();
    if(!c.width||!c.height) return null;
    return {
      x:(r.left-c.left)/c.width*MASTER_W,
      y:(r.top-c.top)/c.height*MASTER_H,
      w:r.width/c.width*MASTER_W,
      h:r.height/c.height*MASTER_H
    };
  }

  function setMasterBox(el,r,label){
    if(!r){el.style.display='none';return;}
    el.style.display='block';
    el.style.left=(r.x/MASTER_W*100)+'%';
    el.style.top=(r.y/MASTER_H*100)+'%';
    el.style.width=(r.w/MASTER_W*100)+'%';
    el.style.height=(r.h/MASTER_H*100)+'%';
    el.dataset.label=label;
  }

  function updateGeometry(){
    if(!ensureUI()) return;
    const screen=document.querySelector('#cinema .screen-frame');
    if(screen){
      const r=masterRectFromViewportRect(screen.getBoundingClientRect());
      setMasterBox(screenBox,r,`GAME SCREEN  x:${round(r.x)} y:${round(r.y)}  ${round(r.w)}×${round(r.h)}`);
    }else{
      screenBox.style.display='none';
    }
  }

  function describeElement(el){
    if(!el || el===document.body || el===document.documentElement) return 'BODY';
    const tag=el.tagName.toLowerCase();
    const id=el.id?`#${el.id}`:'';
    const cls=[...el.classList].filter(c=>!c.startsWith('mq-debug')).slice(0,3).map(c=>'.'+c).join('');
    return `${tag}${id}${cls}`;
  }

  function updatePointer(e){
    if(!ensureUI()) return;
    mouse.clientX=e.clientX;
    mouse.clientY=e.clientY;
    const r=cinema.getBoundingClientRect();
    const inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
    mouse.inside=inside;

    if(!inside || !body.classList.contains('mq-debug-grid-on')){
      body.classList.remove('mq-debug-grid-cursor');
      if(readout) readout.style.display='none';
      if(elementBox) elementBox.style.display='none';
      return;
    }

    const x=clamp((e.clientX-r.left)/r.width*MASTER_W,0,MASTER_W);
    const y=clamp((e.clientY-r.top)/r.height*MASTER_H,0,MASTER_H);
    mouse.x=x; mouse.y=y;

    body.classList.add('mq-debug-grid-cursor');
    crossY.style.left=(x/MASTER_W*100)+'%';
    crossX.style.top=(y/MASTER_H*100)+'%';

    const hit=document.elementFromPoint(e.clientX,e.clientY);
    let hitRect=null;
    if(hit && cinema.contains(hit) && !hit.closest('#mqDebugGridOverlay')){
      hitRect=masterRectFromViewportRect(hit.getBoundingClientRect());
      const label=`${describeElement(hit)}  x:${round(hitRect.x)} y:${round(hitRect.y)} ${round(hitRect.w)}×${round(hitRect.h)}`;
      setMasterBox(elementBox,hitRect,label);
    }else{
      elementBox.style.display='none';
    }

    const screen=document.querySelector('#cinema .screen-frame');
    let screenText='';
    if(screen){
      const sr=screen.getBoundingClientRect();
      if(e.clientX>=sr.left&&e.clientX<=sr.right&&e.clientY>=sr.top&&e.clientY<=sr.bottom){
        const smr=masterRectFromViewportRect(sr);
        const sx=(e.clientX-sr.left)/sr.width*smr.w;
        const sy=(e.clientY-sr.top)/sr.height*smr.h;
        screenText=`\nSCREEN x:${round(sx)} y:${round(sy)} / ${round(smr.w)}×${round(smr.h)}`;
      }
    }

    const scale=r.width/MASTER_W;
    readout.textContent=`MASTER x:${round(x)} y:${round(y)} / ${MASTER_W}×${MASTER_H}${screenText}\nSCALE ${scale.toFixed(3)}×${hitRect?`\n${describeElement(hit)}  box ${round(hitRect.x)},${round(hitRect.y)}  ${round(hitRect.w)}×${round(hitRect.h)}`:''}`;

    const pad=14;
    let left=e.clientX+16;
    let top=e.clientY+16;
    const rw=readout.offsetWidth||280;
    const rh=readout.offsetHeight||90;
    if(left+rw>innerWidth-pad) left=e.clientX-rw-16;
    if(top+rh>innerHeight-pad) top=e.clientY-rh-16;
    readout.style.left=Math.max(pad,left)+'px';
    readout.style.top=Math.max(pad,top)+'px';
    readout.style.display='block';
  }

  function toggleGrid(){
    const on=body.classList.toggle('mq-debug-grid-on');
    toggle.textContent=on?'GRID ON · G':'GRID OFF · G';
    if(!on){
      body.classList.remove('mq-debug-grid-cursor');
      readout.style.display='none';
      elementBox.style.display='none';
    }else{
      updateGeometry();
    }
  }

  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()!=='g' || e.metaKey || e.ctrlKey || e.altKey) return;
    const a=document.activeElement;
    if(a && (a.matches('input,textarea,select,[contenteditable="true"]'))) return;
    e.preventDefault();
    toggleGrid();
  },true);

  document.addEventListener('mousemove',updatePointer,{passive:true});
  window.addEventListener('resize',updateGeometry,{passive:true});

  const observer=new MutationObserver(()=>{
    ensureUI();
    updateGeometry();
  });
  /* Child additions only. Watching style/class mutations here would also see
     this debug overlay moving and could create a self-triggering observer loop. */
  observer.observe(document.documentElement,{subtree:true,childList:true});

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{ensureUI();updateGeometry();},{once:true});
  }else{
    ensureUI();
    updateGeometry();
  }
})();
