(()=>{
  'use strict';

  const VERSION='v53.12-statistics-rebuild';
  const GENRE_ORDER=['fantasy','horror','scifi','crime','animation','comedy'];
  const DIFFICULTY_ORDER=['easy','medium','hard'];

  let previousView='difficulty';
  let loading=false;
  let latestData=null;

  const onlineApi=()=>window.MovieQuizOnline;
  const activeViewId=()=>document.querySelector('.view.active')?.id||'intro';

  function number(value){
    const parsed=Number(value);
    return Number.isFinite(parsed)?parsed:0;
  }

  function integer(value){
    return Math.max(0,Math.round(number(value)));
  }

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
    return new Intl.DateTimeFormat('cs-CZ',{
      day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'
    }).format(date);
  }

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[char]);
  }

  function errorText(error){
    const parts=[];
    if(error?.code)parts.push(`Kód: ${error.code}`);
    if(error?.message)parts.push(error.message);
    if(error?.details)parts.push(error.details);
    if(error?.hint)parts.push(`Nápověda: ${error.hint}`);
    return parts.filter(Boolean).join(' · ')||String(error||'Statistiky se nepodařilo načíst.');
  }

  function normalizeRpcData(data){
    let value=Array.isArray(data)?data[0]:data;
    if(typeof value==='string'){
      try{value=JSON.parse(value)}catch(_){return null}
    }
    return value&&typeof value==='object'?value:null;
  }

  function backSvg(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  }

  function refreshSvg(){
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5M18.5 10A7 7 0 0 0 6.2 7.2L4 11M5.5 14A7 7 0 0 0 17.8 16.8L20 13"/></svg>';
  }

  function difficultyIcon(key){
    if(key==='easy'){
      return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 25h28l-3 29H21z"/><path d="M21 25c-5-2-5-9 1-11 1-6 9-7 12-2 4-5 12-2 12 4 6 1 7 7 2 10"/><path d="M25 31l2 18M36 31l-1 18"/></svg>`;
    }
    if(key==='medium'){
      return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 25h38v28H13z"/><path d="M13 14h38v12H13z"/><path d="M17 14l8 12M29 14l8 12M41 14l8 12"/><path d="M21 36h22M21 44h14"/></svg>`;
    }
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="24" cy="23" r="10"/><circle cx="43" cy="25" r="7"/><circle cx="24" cy="23" r="2.3"/><circle cx="43" cy="25" r="1.7"/><path d="M17 34h31v19H17z"/><path d="M48 38l9-5v21l-9-5z"/><path d="M23 53v6M42 53v6"/></svg>`;
  }

  function installView(){
    const difficulty=document.getElementById('difficulty');
    const existing=document.getElementById('statisticsView');
    if(!difficulty)return;
    existing?.remove();

    const view=document.createElement('section');
    view.className='view selection-view';
    view.id='statisticsView';
    view.innerHTML=`
      <div class="mq-stats-shell">
        <header class="mq-stats-topbar">
          <div class="mq-stats-heading">
            <div class="eyebrow">Filmová bilance</div>
            <h1>Statistiky</h1>
            <p id="mqStatsSubtitle">Přehled výsledků ze všech dokončených projekcí.</p>
          </div>
          <div class="mq-stats-toolbar" aria-label="Ovládání statistik">
            <button type="button" class="mq-stats-back" id="mqStatsBack" aria-label="Zpět">${backSvg()}<span>Zpět</span></button>
            <button type="button" class="mq-stats-refresh" id="mqStatsRefresh">${refreshSvg()}<span>Obnovit</span></button>
          </div>
        </header>
        <div class="mq-stats-content" id="mqStatsContent" aria-live="polite">
          <div class="mq-stats-loading">
            <span class="mq-stats-spinner" aria-hidden="true"></span>
            <strong>Připravuji statistiky</strong>
            <small>Načítám vaše dokončené hry.</small>
          </div>
        </div>
      </div>`;
    difficulty.before(view);

    document.getElementById('mqStatsBack')?.addEventListener('click',closeStatistics);
    document.getElementById('mqStatsRefresh')?.addEventListener('click',()=>renderStatistics(true));
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
      stats.type='button';
      stats.className='mq-intro-tool';
      stats.dataset.openStatistics='';
      stats.textContent='Moje statistiky';
      tools.appendChild(stats);
    }

    const playerActions=document.querySelector('#playerView .mq-player-actions');
    if(playerActions&&!playerActions.querySelector('[data-open-statistics]')){
      const button=document.createElement('button');
      button.type='button';
      button.className='mq-secondary';
      button.dataset.openStatistics='';
      button.textContent='Moje statistiky';
      playerActions.appendChild(button);
    }

    document.querySelectorAll('.mq-selection-tools').forEach(tools=>{
      if(tools.querySelector('[data-open-statistics]'))return;
      const button=document.createElement('button');
      button.type='button';
      button.dataset.openStatistics='';
      button.textContent='Statistiky';
      tools.insertBefore(button,tools.firstChild);
    });

    const scoreActions=document.querySelector('#scoreboardView .mq-scoreboard-actions');
    if(scoreActions&&!scoreActions.querySelector('[data-open-statistics]')){
      const button=document.createElement('button');
      button.type='button';
      button.className='mq-secondary';
      button.dataset.openStatistics='';
      button.textContent='Moje statistiky';
      scoreActions.appendChild(button);
    }

    [
      ['#endView .end-card','mqEndStats'],
      ['#winView .win-card','mqWinStats']
    ].forEach(([selector,id])=>{
      const card=document.querySelector(selector);
      if(!card||document.getElementById(id))return;
      const button=document.createElement('button');
      button.type='button';
      button.id=id;
      button.className='mq-end-statistics';
      button.dataset.openStatistics='';
      button.textContent='Moje statistiky';
      card.appendChild(button);
    });
  }

  function showStatisticsView(){
    if(typeof window.showView==='function'){
      window.showView('statisticsView');
      return;
    }
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id==='statisticsView'));
  }

  function showPreviousView(){
    const destination=previousView&&previousView!=='statisticsView'?previousView:'difficulty';
    if(typeof window.showView==='function'){
      window.showView(destination);
      return;
    }
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===destination));
  }

  function openStatistics(){
    previousView=activeViewId();
    if(previousView==='statisticsView')previousView='difficulty';
    showStatisticsView();
    renderStatistics(false);
    try{window.sound?.('soft')}catch(_){}
  }

  function closeStatistics(){
    showPreviousView();
    try{window.sound?.('soft')}catch(_){}
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

  function metricCard(label,value,note,kind=''){
    return `<article class="mq-stat-card ${kind}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note||'')}</small></article>`;
  }

  function genreCard(item){
    const accuracy=Math.max(0,Math.min(100,number(item?.accuracy_percent)));
    const games=integer(item?.games);
    const wins=integer(item?.wins);
    const correct=integer(item?.correct_answers);
    const answered=integer(item?.questions_answered);
    return `<article class="mq-genre-stat" data-genre="${escapeHtml(item?.genre||'')}">
      <div class="mq-genre-stat-head"><strong>${escapeHtml(item?.label||item?.genre||'Žánr')}</strong><span>${games} ${games===1?'hra':games>=2&&games<=4?'hry':'her'}</span></div>
      <div class="mq-stat-bar" aria-label="Úspěšnost odpovědí ${percent(accuracy)}"><i style="width:${accuracy}%"></i></div>
      <div class="mq-genre-stat-foot"><span>${percent(accuracy)} úspěšnost</span><span>${wins} výher</span></div>
      <div class="mq-genre-stat-explain">${correct} správně z ${answered} odpovězených</div>
    </article>`;
  }

  function difficultyCard(item){
    const key=item?.difficulty||'';
    const games=integer(item?.games);
    const wins=integer(item?.wins);
    return `<article class="mq-difficulty-stat" data-difficulty="${escapeHtml(key)}">
      <div class="mq-difficulty-icon" aria-hidden="true">${difficultyIcon(key)}</div>
      <div class="mq-difficulty-copy">
        <span>${escapeHtml(item?.label||key)}</span>
        <strong>${wins} ${wins===1?'Oscar':wins>=2&&wins<=4?'Oscary':'Oscarů'}</strong>
        <small>${games} ${games===1?'hra':games>=2&&games<=4?'hry':'her'} · ${percent(item?.accuracy_percent)}</small>
      </div>
    </article>`;
  }

  function recentGame(item){
    const won=Boolean(item?.won);
    const score=integer(item?.score);
    const maxScore=Math.max(1,integer(item?.maxScore)||15);
    return `<article class="mq-recent-game ${won?'is-win':'is-loss'}">
      <div class="mq-recent-result">${won?'VÝHRA':'PROHRA'}</div>
      <div class="mq-recent-main"><strong>${escapeHtml(item?.genreLabel||item?.genre||'Film')}</strong><span>${escapeHtml(item?.difficultyLabel||item?.difficulty||'')}</span></div>
      <div class="mq-recent-score"><strong>${score}</strong><span>/ ${maxScore}</span></div>
      <div class="mq-recent-meta"><span>${dateTime(item?.finishedAt||item?.startedAt)}</span><span>${duration(item?.durationMs)}</span></div>
    </article>`;
  }

  function emptyState(){
    return `<div class="mq-stats-empty"><div class="mq-stats-empty-icon" aria-hidden="true">◎</div><h2>První projekce teprve čeká</h2><p>Po první dokončené hře se zde objeví vaše filmová bilance.</p><button type="button" class="mq-primary" data-stats-play>Spustit promítání</button></div>`;
  }

  function sectionHeading(kicker,title,note=''){
    return `<div class="mq-stats-section-title"><div><span>${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2></div>${note?`<small>${escapeHtml(note)}</small>`:''}</div>`;
  }

  function renderData(data){
    latestData=data;
    const content=document.getElementById('mqStatsContent');
    const subtitle=document.getElementById('mqStatsSubtitle');
    if(!content)return;

    const summary=data.summary||{};
    const oscars=data.oscars||{};
    const leaderboard=data.leaderboard||{};
    const totalGames=integer(summary.totalGames);
    const totalPlayers=integer(leaderboard.totalPlayers);
    const rank=leaderboard.rank?integer(leaderboard.rank):null;

    if(subtitle)subtitle.textContent='Přehled výsledků ze všech dokončených projekcí.';

    if(!totalGames){
      content.innerHTML=emptyState();
      content.querySelector('[data-stats-play]')?.addEventListener('click',()=>{
        previousView='difficulty';
        if(typeof window.showView==='function')window.showView('difficulty');
      });
      return;
    }

    const byGenre=Array.isArray(data.byGenre)?data.byGenre:[];
    const byDifficulty=Array.isArray(data.byDifficulty)?data.byDifficulty:[];
    const recent=Array.isArray(data.recentGames)?data.recentGames:[];
    const orderedGenres=[...byGenre].sort((a,b)=>GENRE_ORDER.indexOf(a.genre)-GENRE_ORDER.indexOf(b.genre));
    const orderedDifficulties=[...byDifficulty].sort((a,b)=>DIFFICULTY_ORDER.indexOf(a.difficulty)-DIFFICULTY_ORDER.indexOf(b.difficulty));
    const best=data.bestGenre||null;
    const most=data.mostPlayedGenre||null;

    content.innerHTML=`
      <section class="mq-stats-summary" aria-label="Hlavní statistiky">
        ${metricCard('Pořadí',rank?`#${rank}`:'—',totalPlayers?`z ${totalPlayers} hráčů`:'síň slávy čeká','is-rank')}
        ${metricCard('Odehrané hry',totalGames,`${integer(summary.wins)} výher · ${integer(summary.losses)} proher`)}
        ${metricCard('Oscary',integer(oscars.total),`${integer(leaderboard.rankingPoints)} bodů do síně slávy`,'is-oscar')}
        ${metricCard('Úspěšnost',percent(summary.accuracyPercent),`${integer(summary.correctAnswers)} správně z ${integer(summary.questionsAnswered)}`)}
      </section>

      <div class="mq-stats-dashboard">
        <section class="mq-stats-pane mq-stats-pane-genres">
          ${sectionHeading('Žánrový profil','Výsledky podle žánrů','Správné odpovědi a počet výher')}
          <div class="mq-genre-stats">${orderedGenres.map(genreCard).join('')}</div>
        </section>

        <section class="mq-stats-pane mq-stats-pane-awards">
          ${sectionHeading('Trofeje','Oscary podle obtížnosti')}
          <div class="mq-difficulty-stats">${orderedDifficulties.map(difficultyCard).join('')}</div>
          <div class="mq-stats-mini-highlights">
            <div><span>Nejlepší žánr</span><strong>${escapeHtml(best?.label||'—')}</strong><small>${best?`${percent(best.accuracy_percent)} · ${integer(best.wins)} výher`:'Zatím neurčeno'}</small></div>
            <div><span>Nejhranější</span><strong>${escapeHtml(most?.label||'—')}</strong><small>${most?`${integer(most.games)} her · ${percent(most.win_rate_percent)} výher`:'Zatím neurčeno'}</small></div>
            <div><span>Filmový archiv</span><strong>${integer(summary.uniqueMoviesSeen)} filmů</strong><small>${integer(summary.uniqueQuestionsSeen)} unikátních otázek</small></div>
          </div>
        </section>

        <section class="mq-stats-pane mq-stats-pane-recent">
          ${sectionHeading('Historie','Poslední projekce')}
          <div class="mq-recent-games">${recent.length?recent.slice(0,6).map(recentGame).join(''):'<div class="mq-stats-inline-empty">Zatím zde nejsou žádné dokončené hry.</div>'}</div>
        </section>
      </div>

      <footer class="mq-stats-footer">
        <span>Nejlepší skóre <strong>${integer(summary.bestScore)} / 15</strong></span>
        <span>Průměr <strong>${number(summary.averageScore).toLocaleString('cs-CZ',{maximumFractionDigits:2})}</strong></span>
        <span>Celkový čas <strong>${duration(summary.totalDurationMs)}</strong></span>
        <span>Naposledy <strong>${dateTime(summary.lastPlayedAt)}</strong></span>
      </footer>`;
  }

  function renderError(error){
    const content=document.getElementById('mqStatsContent');
    const subtitle=document.getElementById('mqStatsSubtitle');
    if(subtitle)subtitle.textContent='Statistiky se nepodařilo načíst.';
    if(!content)return;
    content.innerHTML=`<div class="mq-stats-error"><div class="mq-stats-error-icon" aria-hidden="true">!</div><h2>Statistiky nejsou dostupné</h2><p>${escapeHtml(errorText(error))}</p><button type="button" class="mq-primary" id="mqStatsRetry">Zkusit znovu</button></div>`;
    document.getElementById('mqStatsRetry')?.addEventListener('click',()=>renderStatistics(true));
  }

  async function renderStatistics(force=false){
    if(loading)return;
    if(latestData&&!force){renderData(latestData);return;}

    const content=document.getElementById('mqStatsContent');
    const subtitle=document.getElementById('mqStatsSubtitle');
    if(content){
      content.innerHTML='<div class="mq-stats-loading"><span class="mq-stats-spinner" aria-hidden="true"></span><strong>Připravuji statistiky</strong><small>Načítám vaše dokončené hry.</small></div>';
    }
    if(subtitle)subtitle.textContent='Načítám filmovou bilanci…';

    loading=true;
    const refresh=document.getElementById('mqStatsRefresh');
    if(refresh)refresh.disabled=true;
    try{
      const data=await fetchStatistics();
      renderData(data);
    }catch(error){
      console.error('Movie Quiz: hráčské statistiky se nepodařilo načíst.',error);
      renderError(error);
    }finally{
      loading=false;
      if(refresh)refresh.disabled=false;
    }
  }

  installView();
  installButtons();

  document.addEventListener('click',event=>{
    if(event.target.closest?.('[data-open-statistics]')){
      event.preventDefault();
      openStatistics();
    }
  });

  window.addEventListener('mq:server-question-cleared',()=>{latestData=null;});

  window.MovieQuizStatistics=Object.freeze({
    version:VERSION,
    open:openStatistics,
    refresh:()=>renderStatistics(true),
    getLatest:()=>latestData?JSON.parse(JSON.stringify(latestData)):null
  });
})();
