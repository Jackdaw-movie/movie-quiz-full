(()=>{
  function getDragonSrc(){
    const script = document.getElementById('mq-v30-fantasy-dragon-script');
    if(!script) return '';
    const m = script.textContent.match(/dragonSrc='([^']+)'/);
    return m ? m[1] : '';
  }
  function enhanceFantasy(){
    const fxFantasy = document.querySelector('#mq-cinematic-fx .fx-fantasy');
    if(!fxFantasy) return false;
    if(!fxFantasy.querySelector('.mq-fantasy-stars-v34')){
      const stars = document.createElement('div');
      stars.className = 'mq-fantasy-stars-v34';
      fxFantasy.appendChild(stars);
    }
    if(!fxFantasy.querySelector('.mq-fantasy-mist-v34')){
      const mist = document.createElement('div');
      mist.className = 'mq-fantasy-mist-v34';
      fxFantasy.appendChild(mist);
    }
    if(!fxFantasy.querySelector('.mq-fantasy-dragon-v34')){
      const src = getDragonSrc();
      if(src){
        const dragon = document.createElement('img');
        dragon.className = 'mq-fantasy-dragon-v34';
        dragon.alt = '';
        dragon.setAttribute('aria-hidden','true');
        dragon.decoding = 'async';
        dragon.loading = 'eager';
        dragon.src = src;
        fxFantasy.appendChild(dragon);
      }
    }
    return true;
  }
  function boot(){
    enhanceFantasy();
    const mo = new MutationObserver(()=>{ enhanceFantasy(); });
    mo.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click', ()=>setTimeout(enhanceFantasy,0), {passive:true});
    setInterval(enhanceFantasy, 1500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
