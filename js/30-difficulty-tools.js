(()=>{
  const moveTools=()=>{
    const difficulty=document.getElementById('difficulty');
    const tools=difficulty?.querySelector('.mq-selection-tools');
    if(difficulty&&tools&&tools.parentElement!==difficulty)difficulty.appendChild(tools);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',moveTools,{once:true});
  else moveTools();
})();
