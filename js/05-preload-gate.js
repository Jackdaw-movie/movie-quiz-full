(()=>{
  'use strict';
  const VERSION='preload-gate-v7.0-loading2';
  const PEOPLE_URL='https://assets.mixkit.co/active_storage/sfx/375/375-preview.mp3';
  const TRAFFIC_URL='https://assets.mixkit.co/active_storage/sfx/2930/2930-preview.mp3';
  const SFX_KEY='movieQuizSfxVolumeV1';
  const MIN_VISUAL_MS=900;

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

  const people=new Audio(PEOPLE_URL);
  const traffic=new Audio(TRAFFIC_URL);
  const footsteps=new Audio('assets/audio/footsteps.ogg');
  for(const audio of [people,traffic,footsteps]){
    audio.preload='auto';
    audio.playsInline=true;
    try{audio.load()}catch(_){}
  }
  people.loop=true;
  traffic.loop=true;

  const pool=window.MovieQuizPreload={
    version:VERSION,cityPeople:people,cityTraffic:traffic,footsteps,released:false,ready:false,
    startAudio(){
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

  function audioReady(audio){
    return new Promise(resolve=>{
      if(audio.readyState>=3){resolve(true);return}
      let settled=false;
      const finish=ok=>{if(settled)return;settled=true;cleanup();resolve(ok)};
      const cleanup=()=>{
        audio.removeEventListener('canplay',yes);audio.removeEventListener('canplaythrough',yes);audio.removeEventListener('error',no);
      };
      const yes=()=>finish(true),no=()=>finish(false);
      audio.addEventListener('canplay',yes,{once:true});
      audio.addEventListener('canplaythrough',yes,{once:true});
      audio.addEventListener('error',no,{once:true});
      setTimeout(()=>finish(audio.readyState>=2),7000);
    });
  }

  function appReady(){
    return new Promise(resolve=>{
      const start=performance.now();
      const tick=()=>{
        if(document.readyState==='complete'&&window.MovieQuizExterior){resolve(true);return}
        if(performance.now()-start>11000&&document.readyState!=='loading'){resolve(false);return}
        setTimeout(tick,80);
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
    const total=criticalImages.length+3; // images + city people + traffic + complete application/exterior

    const renderProgress=value=>{
      const p=Math.max(0,Math.min(100,value));
      bar.style.width=`${p}%`;
      track.setAttribute('aria-valuenow',String(p));
      // Three complete reel rotations across 0–100%, visually tied to the progress line.
      reel.style.setProperty('--mq-reel-angle',`${p*10.8}deg`);
    };
    const step=()=>{
      completed=Math.min(total,completed+1);
      renderProgress(Math.round((completed/total)*100));
    };

    const imagesPromise=Promise.all(criticalImages.map((url,i)=>preloadImage(url,i,step)));
    const peoplePromise=audioReady(people).then(v=>{step();return v});
    const trafficPromise=audioReady(traffic).then(v=>{step();return v});
    const appPromise=appReady().then(v=>{step();return v});

    Promise.all([imagesPromise,peoplePromise,trafficPromise,appPromise]).then(async()=>{
      const elapsed=performance.now()-startedAt;
      if(elapsed<MIN_VISUAL_MS)await delay(MIN_VISUAL_MS-elapsed);
      pool.ready=true;
      renderProgress(100);
      status.textContent='VŠE JE PŘIPRAVENO';
      gate.classList.add('is-ready');
      enter.disabled=false;
      enter.removeAttribute('aria-disabled');
      enter.classList.add('is-ready');
    });

    enter.addEventListener('click',()=>{
      if(enter.disabled||!pool.ready)return;
      enter.disabled=true;
      pool.startAudio();
      // Trusted user gesture also unlocks the existing game's WebAudio engine.
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
      setTimeout(()=>{gate.hidden=true;gate.setAttribute('hidden','')},760);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
