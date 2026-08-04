(()=>{
  const moveGenreTools=()=>{
    const genres=document.getElementById('genres');
    const tools=genres?.querySelector('.mq-selection-tools');
    if(genres&&tools&&tools.parentElement!==genres)genres.appendChild(tools);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',moveGenreTools,{once:true});
  else moveGenreTools();
})();
