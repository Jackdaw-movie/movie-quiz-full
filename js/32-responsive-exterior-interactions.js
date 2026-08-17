(()=>{
  'use strict';
  const VERSION='responsive-exterior-interactions-v2.1';
  let lastPointer=null;
  let raf=0;

  const booth=()=>document.getElementById('mqTicketBoothHotspot');
  const shoes=()=>document.getElementById('mqWalkCursor');

  function exteriorIsInteractive(){
    return document.body.classList.contains('mq-exterior-active') &&
      !document.body.classList.contains('mq-ticket-open') &&
      !document.body.classList.contains('mq-entering-auditorium');
  }

  function hideShoes(){
    const cursor=shoes();
    if(cursor)cursor.classList.remove('is-visible');
  }

  function realBoothUnderPointer(x,y){
    const target=booth();
    if(!target||target.disabled||!exteriorIsInteractive())return false;
    if(!Number.isFinite(x)||!Number.isFinite(y))return false;
    const hit=document.elementFromPoint(x,y);
    return hit===target || Boolean(hit?.closest?.('#mqTicketBoothHotspot'));
  }

  function applyPointerState(){
    raf=0;
    const cursor=shoes();
    if(!cursor||!lastPointer){hideShoes();return;}
    if(lastPointer.pointerType&&lastPointer.pointerType!=='mouse'){
      hideShoes();
      return;
    }
    const active=realBoothUnderPointer(lastPointer.x,lastPointer.y);
    cursor.classList.toggle('is-visible',active);
    if(active){
      cursor.style.left=`${lastPointer.x}px`;
      cursor.style.top=`${lastPointer.y}px`;
    }
  }

  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(applyPointerState);
  }

  function rememberPointer(event){
    lastPointer={x:event.clientX,y:event.clientY,pointerType:event.pointerType||'mouse'};
    schedule();
  }

  /* Do not trust pointerenter/pointerleave alone. A transformed master can move
     underneath a stationary cursor during resize/zoom. Re-evaluate the actual
     hit-tested element on every pointer move and every layout change. */
  document.addEventListener('pointermove',rememberPointer,true);
  document.addEventListener('pointerdown',rememberPointer,true);
  document.addEventListener('pointercancel',hideShoes,true);
  document.addEventListener('mouseleave',hideShoes,true);
  window.addEventListener('blur',hideShoes);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hideShoes();});
  window.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('mq:responsive-layout-applied',schedule,{passive:true});
  window.addEventListener('mq:master-stage-resized',schedule,{passive:true});

  /* Class changes such as ticket opening must immediately kill the shoes even if
     the mouse has not moved by a single pixel. */
  const observer=new MutationObserver(()=>schedule());
  const start=()=>{
    observer.observe(document.body,{attributes:true,attributeFilter:['class']});
    hideShoes();
    window.__mqResponsiveExteriorInteractionsVersion=VERSION;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
