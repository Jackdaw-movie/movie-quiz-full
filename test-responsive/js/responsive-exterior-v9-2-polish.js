(()=>{
  'use strict';

  const VERSION='responsive-exterior-v9.2-polish';
  const LEGACY_HOVER_CLASSES=[
    'mq-booth-target-hover','mq-booth-alpha-hover','mq-booth-virtual-hover',
    'mq-pv6-booth-hover','mq-pv7-booth-hover','mq-pv8-booth-hover'
  ];

  let rootObserver=null;
  let stageObserver=null;
  let raf=0;

  const root=()=>document.documentElement;
  const stage=()=>document.getElementById('mqExteriorStage');
  const booth=()=>document.getElementById('mqTicketBoothHotspot');

  function stripLegacyHoverState(){
    const html=root();
    let changed=false;
    for(const className of LEGACY_HOVER_CLASSES){
      if(html.classList.contains(className)){
        html.classList.remove(className);
        changed=true;
      }
    }
    return changed;
  }

  function hardenCleanBooth(){
    const target=booth();
    if(!target||target.dataset.mqV9Clean!=='1')return false;

    /* This is the important cleanup: the production .mq-booth-button class owns
       the old :hover/:focus/mobile cursor rules. Removing it makes those rules
       structurally incapable of firing on the v9 interaction target. */
    target.classList.remove('mq-booth-button');
    target.classList.add('mq-v9-booth-target');
    target.removeAttribute('title');
    target.setAttribute('aria-label','Přejít k pokladně');

    /* Reset any visual state a browser or older stylesheet may try to inherit. */
    target.style.setProperty('background','transparent','important');
    target.style.setProperty('border','0','important');
    target.style.setProperty('outline','0','important');
    target.style.setProperty('box-shadow','none','important');
    target.style.setProperty('filter','none','important');
    target.style.setProperty('transform','none','important');
    target.style.setProperty('-webkit-tap-highlight-color','transparent','important');

    return true;
  }

  function sync(){
    raf=0;
    stripLegacyHoverState();
    hardenCleanBooth();
    window.__mqResponsiveExteriorPolishVersion=VERSION;
  }

  function schedule(){
    if(!raf)raf=requestAnimationFrame(sync);
  }

  function observe(){
    if(!rootObserver){
      rootObserver=new MutationObserver(()=>{
        if(LEGACY_HOVER_CLASSES.some(className=>root().classList.contains(className))){
          queueMicrotask(stripLegacyHoverState);
        }
      });
      rootObserver.observe(root(),{attributes:true,attributeFilter:['class']});
    }

    const s=stage();
    if(s&&!stageObserver){
      stageObserver=new MutationObserver(schedule);
      stageObserver.observe(s,{childList:true,subtree:false});
    }
  }

  function start(){
    sync();
    observe();
    setTimeout(sync,80);
    setTimeout(sync,320);
    setTimeout(sync,900);
    window.addEventListener('mq:preload-entered',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    window.addEventListener('orientationchange',schedule,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
