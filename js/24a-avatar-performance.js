(()=>{
  'use strict';
  const VERSION='avatar-performance-v1.0';
  const urls=Array.from({length:20},(_,i)=>`assets/avatars/Avatar_${String(i+1).padStart(2,'0')}.png`);
  const priority=[0,19,1,18,2,3,17]; // 01,20,02,19,03,04,18: first carousel + next neighbours
  const retained=new Map();
  const warmed=new Set();
  const warming=new Map();
  const canIdle='requestIdleCallback' in window;
  const saveData=Boolean(navigator.connection?.saveData);
  const slow=/^(slow-2g|2g)$/.test(String(navigator.connection?.effectiveType||''));

  function warmImage(index,high=false){
    index=((Number(index)||0)%urls.length+urls.length)%urls.length;
    if(warmed.has(index))return Promise.resolve(true);
    if(warming.has(index))return warming.get(index);
    const task=new Promise(resolve=>{
      const img=new Image();
      retained.set(index,img);
      img.decoding='async';
      try{img.fetchPriority=high?'high':'low'}catch(_){}
      const finish=ok=>{
        warmed.add(index);
        warming.delete(index);
        resolve(ok);
      };
      img.onload=()=>{
        if(typeof img.decode==='function'){
          Promise.resolve(img.decode()).catch(()=>{}).finally(()=>finish(true));
        }else finish(true);
      };
      img.onerror=()=>finish(false);
      img.src=urls[index];
    });
    warming.set(index,task);
    return task;
  }

  async function warmInitial(){
    // Two at a time avoids fighting the city/ticket requests while still making the
    // first five carousel positions ready before onboarding normally opens.
    for(let i=0;i<priority.length;i+=2){
      await Promise.all(priority.slice(i,i+2).map((idx,pos)=>warmImage(idx,i===0&&pos===0)));
    }
  }

  function warmRest(){
    if(saveData||slow)return;
    const rest=urls.map((_,i)=>i).filter(i=>!priority.includes(i));
    let cursor=0;
    const step=deadline=>{
      if(cursor>=rest.length)return;
      const budget=deadline?.timeRemaining?.()??8;
      if(budget<3&&deadline&&!deadline.didTimeout){schedule();return}
      const idx=rest[cursor++];
      // Network-cache the remaining avatars gently. We intentionally don't hold
      // every decoded bitmap in memory; visible/nearby avatars are retained above.
      try{
        fetch(urls[idx],{cache:'force-cache',credentials:'same-origin'}).catch(()=>{});
      }catch(_){}
      schedule();
    };
    const schedule=()=>canIdle?requestIdleCallback(step,{timeout:1200}):setTimeout(()=>step(null),180);
    schedule();
  }

  function promoteCarouselImages(root=document){
    root.querySelectorAll?.('#mqAvatarModal img.mq-avatar-img').forEach(img=>{
      img.loading='eager';
      img.decoding='async';
      try{img.fetchPriority='high'}catch(_){}
      const m=(img.getAttribute('src')||'').match(/Avatar_(\d{2})\.png(?:\?|$)/i);
      if(m)warmImage(Number(m[1])-1,true);
    });
  }

  let started=false;
  function start(){
    if(started)return;
    started=true;
    warmInitial().finally(()=>setTimeout(warmRest,220));
  }

  // Start only after the exterior is visually ready, so avatar traffic never delays
  // the loading gate. If this file executes after readiness, start immediately.
  window.addEventListener('mq:preload-ready',start,{once:true});
  if(window.MovieQuizPreload?.ready)setTimeout(start,0);

  // Creating a profile means onboarding is imminent: promote the first carousel set.
  const observer=new MutationObserver(mutations=>{
    let onboardingSoon=false;
    for(const m of mutations){
      for(const node of m.addedNodes||[]){
        if(!(node instanceof Element))continue;
        if(node.matches?.('#mqRegisterForm,#mqRecoveryDone,#mqAvatarModal')||node.querySelector?.('#mqRegisterForm,#mqRecoveryDone,#mqAvatarModal'))onboardingSoon=true;
        promoteCarouselImages(node);
      }
    }
    if(onboardingSoon)start();
    const modal=document.getElementById('mqAvatarModal');
    if(modal&&!modal.hidden)promoteCarouselImages(modal);
  });
  observer.observe(document.documentElement,{subtree:true,childList:true});

  // Attribute changes caused by carousel rerenders are also promoted immediately.
  const attrObserver=new MutationObserver(mutations=>{
    for(const m of mutations){
      const img=m.target;
      if(img instanceof HTMLImageElement&&img.closest?.('#mqAvatarModal'))promoteCarouselImages(img.parentElement||document);
    }
  });
  attrObserver.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['src','hidden']});

  window.MovieQuizAvatarPerformance=Object.freeze({version:VERSION,start,warmInitial});
})();
