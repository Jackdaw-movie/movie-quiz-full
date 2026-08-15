(()=>{
  'use strict';

  const VERSION='v55.0-statistics-scene';
  const SCENE_ID='mqStatisticsScene';
  const GENRE_ORDER=['fantasy','horror','scifi','crime','animation','comedy'];
  const DIFFICULTY_ORDER=['easy','medium','hard'];

  let previousView='difficulty';
  let loading=false;
  let latestData=null;

  const onlineApi=()=>window.MovieQuizOnline;
  const activeViewId=()=>document.querySelector('.view.active')?.id||'intro';
  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const integer=value=>Math.max(0,Math.round(number(value)));

  function percent(value){
    const parsed=Math.max(0,Math.min(100,number(value)));
    return `${parsed.toLocaleString('cs-CZ',{maximumFractionDigits:1})} %`;
  }

  function duration(ms){
    const value=integer(ms);
    if(!value)return '0 min';
    const totalSeconds=Math.round(value/1000);
    const hours=Math.floor(totalSeconds/3600);
    const minutes=Math.floor((totalSeconds%3600)/60);
    const seconds=totalSeconds%60;
    if(hours)return `${hours} h ${minutes} min`;
    if(minutes)return `${minutes} min ${seconds} s`;
    return `${seconds} s`;
  }

  function dateTime(value){
    if(!value)return 'Zatím nehráno';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return 'Neznámé datum';
    return new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);
  }

  function shortDate(value){
    if(!value)return 'bez data';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return 'bez data';
    return new Intl.DateTimeFormat('cs-CZ',{day:'numeric',month:'short'}).format(date);
  }

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[char]);
  }

  function errorText(error){
    const parts=[];
    if(error?.code)parts.push(`Kód: ${error.code}`);
    if(error?.message)parts.push(error.message);
    if(error?.details)parts.push(error.details);
    return parts.filter(Boolean).join(' · ')||'Statistiky se nepodařilo načíst.';
  }

  function normalizeRpcData(data){
    let value=Array.isArray(data)?data[0]:data;
    if(typeof value==='string'){
      try{value=JSON.parse(value)}catch(_){return null}
    }
    return value&&typeof value==='object'?value:null;
  }

  const backSvg=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const refreshSvg=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5M18.5 10A7 7 0 0 0 6.2 7.2L4 11M5.5 14A7 7 0 0 0 17.8 16.8L20 13"/></svg>';
  const homeSvg=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg>';
  const gearSvg=()=>'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.5 4.2h5l.8 3a10 10 0 0 1 2.2.9l2.7-1.5 3.5 3.5-1.5 2.7c.4.7.7 1.4.9 2.2l3 .8v5l-3 .8a10 10 0 0 1-.9 2.2l1.5 2.7-3.5 3.5-2.7-1.5a10 10 0 0 1-2.2.9l-.8 3h-5l-.8-3a10 10 0 0 1-2.2-.9L7.8 30l-3.5-3.5 1.5-2.7a10 10 0 0 1-.9-2.2l-3-.8v-5l3-.8c.2-.8.5-1.5.9-2.2l-1.5-2.7 3.5-3.5 2.7 1.5a10 10 0 0 1 2.2-.9z"/><circle cx="16" cy="18.3" r="4.6"/></svg>';

  function difficultyIcon(key){
    if(key==='easy')return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 25h28l-3 29H21z"/><path d="M21 25c-5-2-5-9 1-11 1-6 9-7 12-2 4-5 12-2 12 4 6 1 7 7 2 10"/><path d="M25 31l2 18M36 31l-1 18"/></svg>';
    if(key==='medium')return '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 25h38v28H13z"/><path d="M13 14h38v12H13z"/><path d="M17 14l8 12M29 14l8 12M41 14l8 12"/><path d="M21 36h22M21 44h14"/></svg>';
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="23" r="10"/><circle cx="43" cy="25" r="7"/><circle cx="24" cy="23" r="2.3"/><circle cx="43" cy="25" r="1.7"/><path d="M17 34h31v19H17z"/><path d="M48 38l9-5v21l-9-5z"/><path d="M23 53v6M42 53v6"/></svg>';
  }

  function installScene(){
    document.getElementById('statisticsView')?.remove();
    document.getElementById(SCENE_ID)?.remove();
    const cinema=document.getElementById('cinema');
    if(!cinema)return;

    const scene=document.createElement('section');
    scene.id=SCENE_ID;
    scene.hidden=true;
    scene.setAttribute('aria-label','Statistiky hráče');
    scene.innerHTML=`
      <button class="mq-stat-corner" id="mqStatGear" type="button" aria-label="Nastavení" title="Nastavení">${gearSvg()}</button>
      <button class="mq-stat-corner" id="mqStatHome" type="button" aria-label="Hlavní menu" title="Hlavní menu">${homeSvg()}</button>
      <div class="mq-stat-layout">
        <header class="mq-stat-header">
          <div class="mq-stat-title">
            <span class="mq-stat-kicker">Filmová bilance</span>
            <h1>Statistiky</h1>
            <p id="mqStatSubtitle">Přehled výsledků ze všech dokončených projekcí.</p>
          </div>
          <div class="mq-stat-actions">
            <button class="mq-stat-action" id="mqStatBack" type="button">${backSvg()}<span>Zpět</span></button>
            <button class="mq-stat-action" id="mqStatRefresh" type="button">${refreshSvg()}<span>Obnovit</span></button>
          </div>
        </header>
        <div class="mq-stat-body" id="mqStatBody" style="display:contents">
          ${loadingMarkup()}
        </div>
      </div>`;
    cinema.appendChild(scene);

    scene.querySelector('#mqStatBack')?.addEventListener('click',closeStatistics);
    scene.querySelector('#mqStatRefresh')?.addEventListener('click',()=>renderStatistics(true));
    scene.querySelector('#mqStatGear')?.addEventListener('click',openSettings);
    scene.querySelector('#mqStatHome')?.addEventListener('click',goHome);
  }

  function openSettings(){
    const existing=document.querySelector('#mqPlayerBadge .mq-settings-gear')||document.querySelector('.mq-settings-gear');
    if(existing){existing.click();return;}
    const menu=document.getElementById('mqSettingsMenu');
    if(menu){menu.hidden=false;menu.classList.add('is-open');}
  }

  function goHome(){
    closeStatistics(false);
    const home=document.getElementById('homeBtn');
    if(home){setTimeout(()=>home.click(),0);return;}
    if(typeof window.showView==='function')window.showView('intro');
  }

  function installButtons(){
    const intro=document.getElementById('intro');
    const scoreboard=document.getElementById('mqIntroScoreboard');
    if(intro&&scoreboard&&!document.getElementById('mqIntroTools')){
      const tools=document.createElement('div');
      tools.className='mq-intro-tools';
      tools.id='mqIntroTools';
      scoreboard.classList.remove('mq-intro-scoreboard');
      scoreboard.classList.add('mq-intro-tool');
      intro.insertBefore(tools,scoreboard);
      tools.appendChild(scoreboard);
      const stats=document.createElement('button');
      stats.type='button';stats.className='mq-intro-tool';stats.dataset.openStatistics='';stats.textContent='Moje statistiky';
      tools.appendChild(stats);
    }

    const playerActions=document.querySelector('#playerView .mq-player-actions');
    if(playerActions&&!playerActions.querySelector('[data-open-statistics]')){
      const button=document.createElement('button');button.type='button';button.className='mq-secondary';button.dataset.openStatistics='';button.textContent='Moje statistiky';playerActions.appendChild(button);
    }

    document.querySelectorAll('.mq-selection-tools').forEach(tools=>{
      if(tools.querySelector('[data-open-statistics]'))return;
      const button=document.createElement('button');button.type='button';button.dataset.openStatistics='';button.textContent='Statistiky';tools.insertBefore(button,tools.firstChild);
    });

    const scoreActions=document.querySelector('#scoreboardView .mq-scoreboard-actions');
    if(scoreActions&&!scoreActions.querySelector('[data-open-statistics]')){
      const button=document.createElement('button');button.type='button';button.className='mq-secondary';button.dataset.openStatistics='';button.textContent='Moje statistiky';scoreActions.appendChild(button);
    }

    [['#endView .end-card','mqEndStats'],['#winView .win-card','mqWinStats']].forEach(([selector,id])=>{
      const card=document.querySelector(selector);
      if(!card||document.getElementById(id))return;
      const button=document.createElement('button');button.type='button';button.id=id;button.className='mq-end-statistics';button.dataset.openStatistics='';button.textContent='Moje statistiky';card.appendChild(button);
    });
  }

  async function fetchStatistics(){
    const api=onlineApi();
    if(!api?.ensureBackend)throw new Error('Online připojení Movie Quiz není připravené.');
    const {client:db}=await api.ensureBackend();
    const {data,error}=await db.rpc('get_my_player_statistics');
    if(error)throw error;
    const normalized=normalizeRpcData(data);
    if(!normalized)throw new Error('Databáze nevrátila platná hráčská data.');
    return normalized;
  }

  function metric(label,value,note,kind=''){
    return `<article class="mq-stat-metric ${kind}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
  }

  function genre(item){
    const accuracy=Math.max(0,Math.min(100,number(item?.accuracy_percent)));
    const games=integer(item?.games), wins=integer(item?.wins), correct=integer(item?.correct_answers), answered=integer(item?.questions_answered);
    return `<article class="mq-stat-genre"><div class="mq-stat-genre-head"><strong>${escapeHtml(item?.label||item?.genre||'Žánr')}</strong><span>${games} ${games===1?'hra':games>=2&&games<=4?'hry':'her'}</span></div><div class="mq-stat-bar"><i style="width:${accuracy}%"></i></div><div class="mq-stat-genre-foot"><span>${percent(accuracy)}</span><span>${wins} výher</span></div><div class="mq-stat-genre-note">${correct} správně z ${answered} odpovězených</div></article>`;
  }

  function difficulty(item){
    const key=item?.difficulty||'', games=integer(item?.games), wins=integer(item?.wins);
    return `<article class="mq-stat-difficulty"><div class="mq-stat-difficulty-icon">${difficultyIcon(key)}</div><div class="mq-stat-difficulty-copy"><span>${escapeHtml(item?.label||key)}</span><strong>${wins} ${wins===1?'Oscar':wins>=2&&wins<=4?'Oscary':'Oscarů'}</strong><small>${games} ${games===1?'hra':games>=2&&games<=4?'hry':'her'} · ${percent(item?.accuracy_percent)}</small></div></article>`;
  }

  function recent(item){
    const won=Boolean(item?.won), score=integer(item?.score), max=Math.max(1,integer(item?.maxScore)||15);
    return `<article class="mq-stat-game ${won?'is-win':'is-loss'}"><div class="mq-stat-game-result">${won?'Výhra':'Prohra'}</div><div class="mq-stat-game-main"><strong>${escapeHtml(item?.genreLabel||item?.genre||'Film')}</strong><span>${escapeHtml(item?.difficultyLabel||item?.difficulty||'')}</span></div><div class="mq-stat-game-score"><strong>${score}</strong><span>/ ${max}</span></div><div class="mq-stat-game-meta">${shortDate(item?.finishedAt||item?.startedAt)} · ${duration(item?.durationMs)}</div></article>`;
  }

  function sectionHead(kicker,title,note=''){
    return `<div class="mq-stat-section-head"><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2>${note?`<small>${escapeHtml(note)}</small>`:''}</div>`;
  }

  function loadingMarkup(){
    return `<div class="mq-stat-state" style="grid-row:2 / 5"><div class="mq-stat-state-inner"><span class="mq-stat-spinner"></span><strong>Připravuji statistiky</strong><small>Načítám vaše dokončené hry.</small></div></div>`;
  }

  function renderData(data){
    latestData=data;
    const body=document.getElementById('mqStatBody');
    if(!body)return;
    const summary=data.summary||{}, oscars=data.oscars||{}, leaderboard=data.leaderboard||{};
    const totalGames=integer(summary.totalGames), totalPlayers=integer(leaderboard.totalPlayers), rank=leaderboard.rank?integer(leaderboard.rank):null;

    if(!totalGames){
      body.innerHTML=`<div class="mq-stat-state" style="grid-row:2 / 5"><div class="mq-stat-state-inner"><h2>První projekce teprve čeká</h2><p>Po první dokončené hře se zde objeví vaše filmová bilance.</p><button class="mq-stat-action" type="button" data-stat-play>Spustit promítání</button></div></div>`;
      body.querySelector('[data-stat-play]')?.addEventListener('click',()=>{closeStatistics(false);if(typeof window.showView==='function')window.showView('difficulty');});
      return;
    }

    const genres=[...(Array.isArray(data.byGenre)?data.byGenre:[])].sort((a,b)=>GENRE_ORDER.indexOf(a.genre)-GENRE_ORDER.indexOf(b.genre)).slice(0,6);
    const difficulties=[...(Array.isArray(data.byDifficulty)?data.byDifficulty:[])].sort((a,b)=>DIFFICULTY_ORDER.indexOf(a.difficulty)-DIFFICULTY_ORDER.indexOf(b.difficulty)).slice(0,3);
    const recentGames=(Array.isArray(data.recentGames)?data.recentGames:[]).slice(0,6);
    const best=data.bestGenre||null, most=data.mostPlayedGenre||null;

    body.innerHTML=`
      <section class="mq-stat-metrics">
        ${metric('Pořadí',rank?`#${rank}`:'—',totalPlayers?`z ${totalPlayers} hráčů`:'síň slávy čeká')}
        ${metric('Odehrané hry',totalGames,`${integer(summary.wins)} výher · ${integer(summary.losses)} proher`)}
        ${metric('Oscary',integer(oscars.total),`${integer(leaderboard.rankingPoints)} bodů do síně slávy`,'is-oscar')}
        ${metric('Úspěšnost',percent(summary.accuracyPercent),`${integer(summary.correctAnswers)} správně z ${integer(summary.questionsAnswered)}`)}
      </section>

      <section class="mq-stat-main">
        <div class="mq-stat-column">
          ${sectionHead('Žánrový profil','Výsledky podle žánrů','Správné odpovědi a počet výher')}
          <div class="mq-stat-genres">${genres.map(genre).join('')}</div>
        </div>
        <div class="mq-stat-column">
          ${sectionHead('Trofeje','Oscary podle obtížnosti')}
          <div class="mq-stat-difficulties">${difficulties.map(difficulty).join('')}</div>
          <div class="mq-stat-highlights">
            <div class="mq-stat-highlight"><span>Nejlepší žánr</span><strong>${escapeHtml(best?.label||'—')}</strong><small>${best?`${percent(best.accuracy_percent)} · ${integer(best.wins)} výher`:'Zatím neurčeno'}</small></div>
            <div class="mq-stat-highlight"><span>Nejhranější</span><strong>${escapeHtml(most?.label||'—')}</strong><small>${most?`${integer(most.games)} her · ${percent(most.win_rate_percent)} výher`:'Zatím neurčeno'}</small></div>
            <div class="mq-stat-highlight"><span>Filmový archiv</span><strong>${integer(summary.uniqueMoviesSeen)} filmů</strong><small>${integer(summary.uniqueQuestionsSeen)} unikátních otázek</small></div>
          </div>
        </div>
        <div class="mq-stat-column">
          ${sectionHead('Historie','Poslední projekce')}
          <div class="mq-stat-recent">${recentGames.length?recentGames.map(recent).join(''):'<div class="mq-stat-state"><small>Zatím bez dokončených her.</small></div>'}</div>
        </div>
      </section>

      <footer class="mq-stat-footer">
        <span>Nejlepší skóre <strong>${integer(summary.bestScore)} / 15</strong></span>
        <span>Průměr <strong>${number(summary.averageScore).toLocaleString('cs-CZ',{maximumFractionDigits:2})}</strong></span>
        <span>Celkový čas <strong>${duration(summary.totalDurationMs)}</strong></span>
        <span>Naposledy <strong>${dateTime(summary.lastPlayedAt)}</strong></span>
      </footer>`;
  }

  function renderError(error){
    const body=document.getElementById('mqStatBody');
    if(!body)return;
    body.innerHTML=`<div class="mq-stat-state" style="grid-row:2 / 5"><div class="mq-stat-state-inner"><h2>Statistiky nejsou dostupné</h2><p>${escapeHtml(errorText(error))}</p><button class="mq-stat-action" id="mqStatRetry" type="button">Zkusit znovu</button></div></div>`;
    document.getElementById('mqStatRetry')?.addEventListener('click',()=>renderStatistics(true));
  }

  async function renderStatistics(force=false){
    if(loading)return;
    if(latestData&&!force){renderData(latestData);return;}
    const body=document.getElementById('mqStatBody');
    if(body)body.innerHTML=loadingMarkup();
    loading=true;
    const refresh=document.getElementById('mqStatRefresh');
    if(refresh)refresh.disabled=true;
    try{renderData(await fetchStatistics());}
    catch(error){console.error('Movie Quiz: statistiky se nepodařilo načíst.',error);renderError(error);}
    finally{loading=false;if(refresh)refresh.disabled=false;}
  }

  function openStatistics(){
    previousView=activeViewId();
    const scene=document.getElementById(SCENE_ID);
    if(!scene)return;
    scene.hidden=false;
    document.body.classList.add('mq-statistics-open');
    renderStatistics(false);
    try{window.sound?.('soft')}catch(_){}
  }

  function closeStatistics(playSound=true){
    const scene=document.getElementById(SCENE_ID);
    if(scene)scene.hidden=true;
    document.body.classList.remove('mq-statistics-open');
    if(playSound){try{window.sound?.('soft')}catch(_){}}
  }

  function boot(){
    installScene();
    installButtons();
    setTimeout(installButtons,300);
    setTimeout(installButtons,1200);

    document.addEventListener('click',event=>{
      if(event.target.closest?.('[data-open-statistics]')){event.preventDefault();openStatistics();}
    });

    window.addEventListener('mq:server-question-cleared',()=>{latestData=null;});
    window.MovieQuizStatistics=Object.freeze({version:VERSION,open:openStatistics,close:closeStatistics,refresh:()=>renderStatistics(true),getLatest:()=>latestData?JSON.parse(JSON.stringify(latestData)):null});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
