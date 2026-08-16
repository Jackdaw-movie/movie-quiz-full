(()=>{
'use strict';
const TITLE='Jak obtížná bude dnešní projekce?';
const CSS=`
html body #cinema{container-type:size!important;container-name:mq-cinema-master}
html body #cinema #screen #difficulty{padding:0!important}
html body #cinema #screen #difficulty .eyebrow{display:none!important}
html body #cinema #screen #difficulty .difficulty-panel{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;padding:0!important}
html body #cinema #screen #difficulty .selection-title{position:absolute!important;left:50%!important;top:8.49846cqh!important;width:94cqw!important;max-width:94cqw!important;margin:0!important;transform:translateX(-50%)!important;text-align:center!important;z-index:12!important}
html body #cinema #screen #difficulty .difficulty-grid{position:absolute!important;left:50%!important;top:32.61418cqh!important;width:94cqw!important;height:16.07714cqh!important;max-width:none!important;min-width:0!important;margin:0!important;transform:translateX(-50%)!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;align-items:stretch!important;z-index:11!important}
html body #cinema #screen #difficulty .difficulty-card{height:100%!important;min-height:0!important;max-height:none!important;padding:1cqh 1.4cqw!important;box-sizing:border-box!important;overflow:hidden!important}
html body #cinema #screen #difficulty .difficulty-icon{max-height:9cqh!important}
html body #cinema #screen #difficulty>.mq-selection-tools,html body #cinema #screen #genres>.mq-selection-tools{position:absolute!important;left:50%!important;top:4.63994cqh!important;right:auto!important;bottom:auto!important;display:flex!important;align-items:flex-start!important;justify-content:center!important;gap:.8cqw!important;width:max-content!important;max-width:78cqw!important;margin:0!important;transform:translateX(-50%)!important;z-index:40!important}
html body #cinema #screen #genres>#difficultyBack{position:absolute!important;left:1.72cqw!important;top:4.63994cqh!important;right:auto!important;bottom:auto!important;margin:0!important;z-index:41!important}
html body #cinema>#mqPlayerBadge.mq-player-dock{position:absolute!important;left:0!important;top:2.65675cqh!important;right:auto!important;bottom:auto!important;z-index:220!important;display:flex!important;align-items:center!important;gap:.7177cqw!important;width:max-content!important;min-width:21.5311cqw!important;max-width:31.10048cqw!important;height:13.28374cqh!important;min-height:13.28374cqh!important;max-height:13.28374cqh!important;margin:0!important;padding:.79702cqh .59809cqw!important;overflow:visible!important;box-sizing:border-box!important}
html body #cinema>#mqPlayerBadge.mq-player-dock>span:not(.mq-avatar-frame){display:none!important}
html body #cinema>#mqPlayerBadge .mq-avatar-badge{width:6.57895cqw!important;height:11.68969cqh!important;flex:0 0 6.57895cqw!important;margin:0!important}
html body #cinema>#mqPlayerBadge strong{max-width:13.75598cqw!important;font-size:1.91286cqh!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
html body #cinema>#mqPlayerBadge .mq-settings-gear{width:2.99043cqw!important;height:5.3135cqh!important;flex:0 0 2.99043cqw!important;margin-left:auto!important;border-radius:4px!important;transform:none!important;transition:transform .16s ease,filter .16s ease,box-shadow .16s ease,background .16s ease,border-color .16s ease!important}
html body #cinema>#mqPlayerBadge .mq-settings-gear svg{width:1.55502cqw!important;height:2.76302cqh!important;transform:none!important}
html body #cinema>#mqPlayerBadge .mq-settings-gear:hover,html body #cinema>#mqPlayerBadge .mq-settings-gear:focus-visible,html body #cinema>#mqPlayerBadge .mq-settings-gear[aria-expanded="true"]{transform:translateY(-.42508cqh) scale(1.06)!important;filter:brightness(1.22)!important;background:rgba(218,180,89,.22)!important;border-color:rgba(248,218,143,.92)!important;box-shadow:0 0 1.8cqh rgba(239,198,101,.42),0 .7cqh 1.5cqh rgba(0,0,0,.42)!important;outline:none!important}
body:not(.mq-auditorium-entered) #cinema>#mqPlayerBadge.mq-player-dock,body.mq-ticket-open #cinema>#mqPlayerBadge.mq-player-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important}
html body #cinema>#homeBtn.mq-home-dock{position:absolute!important;left:94.34809cqw!important;top:8.23592cqh!important;right:auto!important;bottom:auto!important;width:2.69139cqw!important;height:4.78215cqh!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;transform:none!important;z-index:221!important;display:grid!important;place-items:center!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important}
body:not(.mq-auditorium-entered) #cinema>#homeBtn.mq-home-dock,body.mq-ticket-open #cinema>#homeBtn.mq-home-dock{opacity:0!important;visibility:hidden!important;pointer-events:none!important}

/* v41: restore the large player avatar exactly in cinema-master units.
   v40 accidentally changed these percentages relative to the badge itself. */
html body.mq-noir-master #page #cinema>#mqPlayerBadge .mq-avatar-badge{
  width:6.57895cqw!important;
  height:11.68969cqh!important;
  flex:0 0 6.57895cqw!important;
  margin:0!important
}

/* v41: both main selection headings end exactly at master y=300.
   Cinema screen starts at master y=197.1395, so this equals 16.53703cqh. */
html body.mq-noir-master #page #cinema #screen #difficulty .selection-title,
html body.mq-noir-master #page #cinema #screen #genres .genre-panel>.selection-title{
  left:50%!important;
  top:16.53703cqh!important;
  bottom:auto!important;
  margin:0!important;
  transform:translate(-50%,-100%)!important;
  text-align:center!important
}

/* Move the selected-difficulty label by the same master-pixel delta as the
   genre title, preserving their previous vertical relationship. */
html body.mq-noir-master #page #cinema #screen #genres .genre-panel>.eyebrow{
  top:9.19720cqh!important;
  bottom:auto!important;
  margin:0!important
}
`;
function installStyle(){let s=document.getElementById('mqMasterPixelUiV39');if(s)return;s=document.createElement('style');s.id='mqMasterPixelUiV39';s.textContent=CSS;document.head.appendChild(s)}
function anchorDocks(){const c=document.getElementById('cinema');if(!c)return;const b=document.getElementById('mqPlayerBadge');if(b&&b.parentElement!==c){c.appendChild(b);b.classList.add('mq-player-dock')}const h=document.getElementById('homeBtn');if(h&&h.parentElement!==c){c.appendChild(h);h.classList.add('mq-home-dock')}}
function normalizeSelectionUi(){const d=document.getElementById('difficulty'),g=document.getElementById('genres');const dt=d?.querySelector('.mq-selection-tools');if(d&&dt&&dt.parentElement!==d)d.appendChild(dt);const gt=g?.querySelector('.mq-selection-tools');if(g&&gt&&gt.parentElement!==g)g.appendChild(gt);const back=document.getElementById('difficultyBack');if(g&&back&&back.parentElement!==g)g.appendChild(back);const title=d?.querySelector('.selection-title');if(title&&title.textContent!==TITLE)title.textContent=TITLE}
function apply(){installStyle();normalizeSelectionUi();anchorDocks()}
function init(){apply();setTimeout(anchorDocks,450);setTimeout(anchorDocks,1300);document.addEventListener('click',()=>queueMicrotask(anchorDocks));window.addEventListener('mq:guest-mode-changed',()=>setTimeout(anchorDocks,20));window.addEventListener('mq:avatar-changed',()=>setTimeout(anchorDocks,0))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Movie Quiz – statistics Home navigation repair v41.2
   The Statistics scene has its own Home control. This handler does not proxy
   through the movable global #homeBtn. It closes the overlay and forces the
   canonical difficulty menu immediately and again after the current event
   cycle, so no later UI synchronizer can leave Statistics visually open. */
(()=>{
'use strict';
let navigating=false;

function forceDifficultyHome(){
  const stats=document.getElementById('mqStatisticsScene');
  if(stats)stats.hidden=true;
  document.body.classList.remove('mq-statistics-open','mq-hall-open');

  const settings=document.getElementById('mqSettingsMenu');
  if(settings){settings.hidden=true;settings.classList.remove('is-open')}

  try{if(typeof state!=='undefined'&&state)state.locked=true}catch(_){}
  try{if(typeof resetLives==='function')resetLives(false)}catch(_){}
  document.getElementById('screen')?.removeAttribute('data-genre');

  try{if(typeof showView==='function')showView('difficulty')}catch(_){}
  document.querySelectorAll('#screen > .view').forEach(view=>view.classList.toggle('active',view.id==='difficulty'));
  document.getElementById('difficulty')?.classList.add('active');

  try{if(typeof switchMusic==='function')switchMusic('menu')}catch(_){}
  try{window.MovieQuizCinemaHome?.sync?.()}catch(_){}
}

function activateStatisticsHome(event){
  const target=event.target?.closest?.('#mqStatHome');
  if(!target||navigating)return;
  navigating=true;
  event.preventDefault();
  event.stopImmediatePropagation();

  forceDifficultyHome();
  queueMicrotask(forceDifficultyHome);
  requestAnimationFrame(()=>{
    forceDifficultyHome();
    navigating=false;
  });
  setTimeout(forceDifficultyHome,80);
  try{if(typeof sound==='function')sound('soft');else window.sound?.('soft')}catch(_){}
}

function bindStatisticsHome(){
  const button=document.getElementById('mqStatHome');
  if(!button||button.dataset.mqHomeRepair==='41.2')return;
  button.dataset.mqHomeRepair='41.2';
  button.addEventListener('pointerup',activateStatisticsHome,true);
  button.addEventListener('click',activateStatisticsHome,true);
}

function init(){
  bindStatisticsHome();
  const observer=new MutationObserver(bindStatisticsHome);
  observer.observe(document.getElementById('cinema')||document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',activateStatisticsHome,true);
})();
