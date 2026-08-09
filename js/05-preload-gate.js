(()=>{
  'use strict';
  const VERSION='preload-gate-v8.0-fast-first-paint';
  const PEOPLE_URL='https://assets.mixkit.co/active_storage/sfx/375/375-preview.mp3';
  const TRAFFIC_URL='https://assets.mixkit.co/active_storage/sfx/2930/2930-preview.mp3';
  const SFX_KEY='movieQuizSfxVolumeV1';
  const MIN_VISUAL_MS=650;

  const criticalImages=[
    'assets/exterior-v6-9/production/master.webp',
    'assets/exterior-v6-9/production/sign.webp',
    'assets/exterior-v6-9/production/jackdaws-letters.webp',
    'assets/exterior-v6-9/production/hotel-letters.webp',
    'assets/exterior-v6-9/production/marquee.webp',
    'assets/exterior-v6-9/production/marquee-bulbs-halo.webp',
    'assets/exterior-v6-9/production/marquee-bulbs-1.webp',
    'assets/exterior-v6-9/production/marquee-bulbs-2.webp',
    'assets/exterior-v6-9/production/marquee-bulbs-3.webp',
    'assets/exterior-v6-9/production/lamp.webp',
    'assets/exterior-v6-9/production/car.webp',
    'assets/exterior-v6-9/production/booth.webp',
    'assets/exterior-v6-9/production/steam-front.webp',
    'assets/exterior-v6-9/production/shoe-left.webp',
    'assets/exterior-v6-9/production/shoe-right.webp'
  ];

  const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
  const stored=(key,fallback=50)=>{try{const v=localStorage.getItem(key);return v===null?fallback:clamp(v)}catch(_){return fallback}};
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  /* Audio elements exist early so exterior integration can reuse them, but no
     remote audio request is started until the visual scene is already ready. */
  const people=new Audio();
  const traffic=new Audio();
  const footsteps=new Audio();
  for(const audio of [people,traffic,footsteps]){
    audio.preload='none';
    audio.playsInline=true;
  }
  people.loop=true;
  traffic.loop=true;

  let audioPrimed=false;
  function primeAudio(){
    if(audioPrimed)return;
    audioPrimed=true;
    try{people.src=PEOPLE_URL;people.preload='auto';people.load()}catch(_){}
    try{traffic.src=TRAFFIC_URL;traffic.preload='auto';traffic.load()}catch(_){}
    try{footsteps.src='assets/audio/footsteps.ogg';footsteps.preload='auto';footsteps.load()}catch(_){}
  }

  function primePostEntryAssets(){
    for(const url of ['assets/ticket-login/production/desk.webp','assets/ticket-login/production/ticket-stack.webp?v=7.0']){
      try{const img=new Image();img.decoding='async';img.src=url}catch(_){}
    }
  }

  const pool=window.MovieQuizPreload={
    version:VERSION,cityPeople:people,cityTraffic:traffic,footsteps,released:false,ready:false,
    startAudio(){
      primeAudio();
      const sfx=stored(SFX_KEY,50)/100;
      people.volume=Math.min(1,sfx*.62);
      traffic.volume=Math.min(1,sfx*.30);
      try{if(Number.isFinite(traffic.duration)&&traffic.duration>17&&traffic.currentTime<1)traffic.currentTime=11.7}catch(_){}
      const results=[];
      if(sfx>0){
        try{results.push(Promise.resolve(people.play()).catch(()=>false))}catch(_){}
        try{results.push(Promise.resolve(traffic.play()).catch(()=>false))}catch(_){}
      }
      return Promise.allSettled(results);
    }
  };

  function preloadImage(url,index,onStep){
    return new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      if(index===0)img.fetchPriority='high';
      let settled=false;
      const done=async ok=>{
        if(settled)return;settled=true;
        if(ok&&typeof img.decode==='function'){try{await img.decode()}catch(_){}}
        onStep();resolve(ok);
      };
      img.onload=()=>done(true);
      img.onerror=()=>done(false);
      img.src=url;
    });
  }

  function essentialStylesReady(){
    const refs=['css/core.css','css/exterior-scene.css','css/exterior-performance.css'];
    return refs.every(part=>{
      const link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(el=>(el.getAttribute('href')||'').includes(part));
      return !link||Boolean(link.sheet);
    });
  }

  function appReady(){
    return new Promise(resolve=>{
      const start=performance.now();
      const tick=()=>{
        /* Do not wait for window.load, remote audio or analytics/CDN leftovers.
           We only need the exterior integration and its essential styles. */
        if(window.MovieQuizExterior&&essentialStylesReady()){resolve(true);return}
        if(performance.now()-start>12000&&document.readyState!=='loading'){resolve(false);return}
        setTimeout(tick,60);
      };
      tick();
    });
  }

  function init(){
    const gate=document.getElementById('mqPreloadGate');
    const bar=document.getElementById('mqPreloadProgress');
    const track=document.getElementById('mqPreloadTrack');
    const reel=document.getElementById('mqPreloadReel');
    const status=document.getElementById('mqPreloadStatus');
    const enter=document.getElementById('mqPreloadEnter');
    if(!gate||!bar||!track||!reel||!status||!enter)return;

    const startedAt=performance.now();
    let completed=0;
    const total=criticalImages.length+1;
    const renderProgress=value=>{
      const p=Math.max(0,Math.min(100,value));
      bar.style.width=`${p}%`;
      track.setAttribute('aria-valuenow',String(p));
      reel.style.setProperty('--mq-reel-angle',`${p*10.8}deg`);
    };
    const step=()=>{
      completed=Math.min(total,completed+1);
      renderProgress(Math.round((completed/total)*100));
    };

    const imagesPromise=Promise.all(criticalImages.map((url,i)=>preloadImage(url,i,step)));
    const appPromise=appReady().then(v=>{step();return v});

    Promise.all([imagesPromise,appPromise]).then(async()=>{
      const elapsed=performance.now()-startedAt;
      if(elapsed<MIN_VISUAL_MS)await delay(MIN_VISUAL_MS-elapsed);
      pool.ready=true;
      renderProgress(100);
      status.textContent='VŠE JE PŘIPRAVENO';
      gate.classList.add('is-ready');
      enter.disabled=false;
      enter.removeAttribute('aria-disabled');
      enter.classList.add('is-ready');
      /* Start buffering ambience only after visual readiness. It no longer
         competes with the assets needed to draw the loading/exterior screens. */
      setTimeout(primeAudio,80);
      setTimeout(primePostEntryAssets,140);
    });

    enter.addEventListener('click',()=>{
      if(enter.disabled||!pool.ready)return;
      enter.disabled=true;
      pool.startAudio();
      try{
        if(typeof initAudio==='function')initAudio();
        if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended')audioCtx.resume?.().catch?.(()=>{});
        window.MovieQuizSettings?.apply?.();
      }catch(_){}
      pool.released=true;
      document.body.classList.remove('mq-preloading');
      document.body.classList.add('mq-preload-released');
      window.dispatchEvent(new CustomEvent('mq:preload-entered',{detail:{version:VERSION}}));
      gate.classList.add('is-leaving');
      setTimeout(()=>{gate.hidden=true;gate.setAttribute('hidden','')},560);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
