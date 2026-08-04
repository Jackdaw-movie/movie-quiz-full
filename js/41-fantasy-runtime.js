(()=>{
  let flightTimer = null;
  let flightTimeout = null;
  let activeFantasy = false;

  function getDragonSrc(){
    const script = document.getElementById('mq-v30-fantasy-dragon-script');
    if(!script) return '';
    const m = script.textContent.match(/dragonSrc='([^']+)'/);
    return m ? m[1] : '';
  }

  function ensureDragon(){
    const fantasy = document.querySelector('#mq-cinematic-fx .fx-fantasy');
    if(!fantasy) return null;
    fantasy.querySelectorAll('.mq-dragon.d2').forEach(n=>n.remove());
    let dragon = fantasy.querySelector('.mq-dragon');
    if(!dragon){
      const src = getDragonSrc();
      if(!src) return null;
      dragon = document.createElement('img');
      dragon.className = 'mq-dragon';
      dragon.alt = '';
      dragon.setAttribute('aria-hidden','true');
      dragon.decoding = 'async';
      dragon.loading = 'eager';
      dragon.src = src;
      fantasy.appendChild(dragon);
    }
    if(!dragon.src){
      const src = getDragonSrc();
      if(src) dragon.src = src;
    }
    return dragon;
  }

  function flyDragon(){
    if(!activeFantasy) return;
    const dragon = ensureDragon();
    if(!dragon) return;
    dragon.classList.remove('is-flying');
    void dragon.offsetWidth;
    dragon.classList.add('is-flying');
    if(flightTimer) clearTimeout(flightTimer);
    flightTimer = setTimeout(()=>{
      if(dragon) dragon.classList.remove('is-flying');
    }, 7300);
  }

  function stopSchedule(){
    activeFantasy = false;
    if(flightTimeout){ clearTimeout(flightTimeout); flightTimeout = null; }
    if(flightTimer){ clearTimeout(flightTimer); flightTimer = null; }
    const dragon = document.querySelector('#mq-cinematic-fx .fx-fantasy .mq-dragon');
    if(dragon) dragon.classList.remove('is-flying');
  }

  function scheduleFlights(){
    stopSchedule();
    activeFantasy = true;
    ensureDragon();
    flightTimeout = setTimeout(function loop(){
      if(!activeFantasy) return;
      flyDragon();
      flightTimeout = setTimeout(loop, 22000);
    }, 6500);
  }

  function refreshState(){
    const fx = document.getElementById('mq-cinematic-fx');
    const genre = fx ? fx.getAttribute('data-fx-genre') : '';
    if(genre === 'fantasy') {
      if(!activeFantasy) scheduleFlights();
      else ensureDragon();
    } else if(activeFantasy) {
      stopSchedule();
    }
  }

  function boot(){
    ensureDragon();
    refreshState();
    const bodyObserver = new MutationObserver(()=>{ ensureDragon(); refreshState(); });
    bodyObserver.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-fx-genre']});
    document.addEventListener('click', ()=>setTimeout(refreshState,0), {passive:true});
    window.addEventListener('focus', refreshState, {passive:true});
    setInterval(refreshState, 1500);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
