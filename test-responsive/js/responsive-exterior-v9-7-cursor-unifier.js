(()=>{
  'use strict';

  const VERSION='responsive-exterior-v9.7-cursor-unifier';
  const savedCursor=new WeakMap();
  let scheduled=false;
  let stageObserver=null;
  let rootObserver=null;

  const root=()=>document.documentElement;
  const scene=()=>document.getElementById('mqExteriorScene');
  const viewport=()=>scene()?.querySelector('.mq-v6-viewport');
  const stage=()=>document.getElementById('mqExteriorStage');

  function isElement(node){
    return node instanceof HTMLElement;
  }

  function stageNodes(){
    const s=stage();
    if(!s)return [];
    return [s,...s.querySelectorAll('*')].filter(isElement);
  }

  function exteriorShellNodes(){
    return [root(),document.body,scene(),viewport()].filter(isElement);
  }

  /* v9.6 sanitizeStage wrote cursor:default!important inline to every child of
     #mqExteriorStage. Inline !important beats every stylesheet rule, including
     html.mq-v9-booth-hover * { cursor:none!important }. Strip those stale inline
     cursor declarations first. Stage graphics have no legitimate native cursor;
     the booth interaction is owned entirely by the v9 controller. */
  function stripStageInlineCursor(){
    for(const node of stageNodes()){
      node.style.removeProperty('cursor');
    }
  }

  function lockNode(node){
    if(!isElement(node))return;
    if(!savedCursor.has(node)){
      savedCursor.set(node,{
        value:node.style.getPropertyValue('cursor'),
        priority:node.style.getPropertyPriority('cursor')
      });
    }
    if(node.style.getPropertyValue('cursor')!=='none' || node.style.getPropertyPriority('cursor')!=='important'){
      node.style.setProperty('cursor','none','important');
    }
  }

  function unlockNode(node){
    if(!isElement(node))return;
    const saved=savedCursor.get(node);
    if(!saved)return;
    if(saved.value)node.style.setProperty('cursor',saved.value,saved.priority||'');
    else node.style.removeProperty('cursor');
    savedCursor.delete(node);
  }

  function applyPolicy(){
    scheduled=false;
    const hover=root().classList.contains('mq-v9-booth-hover');

    /* Always remove the v9.6 inline default before deciding the new state. */
    stripStageInlineCursor();

    const shell=exteriorShellNodes();
    const graphics=stageNodes();

    if(hover){
      for(const node of shell)lockNode(node);
      for(const node of graphics)lockNode(node);
      return;
    }

    /* Restore only values that this unifier itself replaced. Stage nodes were
       intentionally clean before locking, so they return to no inline cursor. */
    for(const node of shell)unlockNode(node);
    for(const node of graphics)unlockNode(node);
    stripStageInlineCursor();
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(applyPolicy);
  }

  function observeStage(){
    const s=stage();
    if(!s || stageObserver)return;
    stageObserver=new MutationObserver(schedule);
    stageObserver.observe(s,{childList:true,subtree:true});
  }

  function start(){
    observeStage();

    rootObserver=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='attributes' && mutation.attributeName==='class'){
          schedule();
          break;
        }
      }
    });
    rootObserver.observe(root(),{attributes:true,attributeFilter:['class']});

    /* These listeners are registered after v9.6. On every mouse move, v9.6
       computes the hit-test first; v9.7 then applies one uniform cursor state. */
    window.addEventListener('pointermove',schedule,true);
    window.addEventListener('mousemove',schedule,true);
    window.addEventListener('pointerover',schedule,true);
    window.addEventListener('mouseover',schedule,true);
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});

    applyPolicy();
    window.__mqResponsiveExteriorCursorVersion=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
