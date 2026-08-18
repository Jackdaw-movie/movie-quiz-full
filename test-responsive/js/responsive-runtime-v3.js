(()=>{
  "use strict";
  const VERSION="responsive-layout-v3.0-layout-only";
  const MASTER_W=1672, MASTER_H=941;
  let raf=0;
  function viewport(){const vv=window.visualViewport;return {width:Math.max(1,Number(vv?.width)||innerWidth||1),height:Math.max(1,Number(vv?.height)||innerHeight||1)}}
  function apply(){raf=0;const {width,height}=viewport();const ratio=width/height;const cover=Math.max(width/MASTER_W,height/MASTER_H);const r=document.documentElement;r.style.setProperty("--mq-exterior-cover-scale",cover.toFixed(7));r.style.setProperty("--mq-responsive-vw",`${width.toFixed(2)}px`);r.style.setProperty("--mq-responsive-vh",`${height.toFixed(2)}px`);r.dataset.mqResponsiveVersion=VERSION;r.classList.toggle("mq-responsive-tall",ratio<1.2);r.classList.toggle("mq-responsive-wide",ratio>2.05);window.dispatchEvent(new CustomEvent("mq:responsive-layout-applied",{detail:{version:VERSION,width,height,ratio,coverScale:cover}}));}
  function schedule(){if(!raf)raf=requestAnimationFrame(apply)}
  addEventListener("resize",schedule,{passive:true});addEventListener("orientationchange",schedule,{passive:true});visualViewport?.addEventListener("resize",schedule,{passive:true});visualViewport?.addEventListener("scroll",schedule,{passive:true});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
  window.MovieQuizResponsiveLayout={VERSION,applyNow:apply,update:schedule};
})();
