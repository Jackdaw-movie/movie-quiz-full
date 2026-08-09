(()=>{
  'use strict';
  if(!('serviceWorker' in navigator))return;
  const register=()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
  if(window.MovieQuizPreload?.ready)setTimeout(register,1200);
  else window.addEventListener('mq:preload-ready',()=>setTimeout(register,1200),{once:true});
})();
