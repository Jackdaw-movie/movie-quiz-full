(()=>{
  'use strict';

  const VERSION='v43-ui-variety';
  const GENRE_ORDER=['fantasy','horror','scifi','crime','animation','comedy'];
  const DIFFICULTY_ORDER=['easy','medium','hard'];
  const DIFFICULTY_ICONS={easy:'🍿',medium:'🎬',hard:'🎥'};

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

  function installView(){
    const difficulty=document.getElementById('difficulty');
    if(!difficulty||document.getElementById('statisticsView'))return;

    const view=document.createElement('section');
    view.className='view selection-view';
    view.id='statisticsView';
    view.innerHTML=`
      <div class="mq-stats-shell">
        <div class="mq-stats-toolbar">
          <button type="button" class="mq-stats-back" id="mqStatsBack" aria-label="Zpět">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
            <span>Zpět</span>
          </button>
          <button type="button" class="mq-stats-refresh" id="mqStatsRefresh">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6v5h-5M4 18v-5h5M18.5 10A7 7 0 0 0 6.2 7.2L4 11M5.5 14A7 7 0 0 0 17.8 16.8L20 13"/></svg>
            <span>Obnovit</span>
          </button>
        </div>
        <header class="mq-stats-header">
          <div class="eyebrow">Osobní profil hráče</div>
          <h1>Moje statistiky</h1>
          <p id="mqStatsSubtitle">Načítám filmovou bilanci…</p>
        </header>
        <div class="mq-stats-content" id="mqStatsContent" aria-live="polite">
          <div class="mq-stats-loading">
            <span class="mq-stats-spinner" aria-hidden="true"></span>
            <strong>Připravuji statistiky</strong>
            <small>Načítám vaše dokončené hry ze Supabase.</small>
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
    return `<article class="mq-stat-card ${kind}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(note||'')}</small>
    </article>`;
  }

  function genreCard(item){
    const accuracy=Math.max(0,Math.min(100,number(item?.accuracy_percent)));
    const games=integer(item?.games);
    const wins=integer(item?.wins);
    const correct=integer(item?.correct_answers);
    const answered=integer(item?.questions_answered);
    return `<article class="mq-genre-stat" data-genre="${escapeHtml(item?.genre||'')}">
      <div class="mq-genre-stat-head">
        <strong>${escapeHtml(item?.label||item?.genre||'Žánr')}</strong>
        <span>${games} ${games===1?'hra':games>=2&&games<=4?'hry':'her'}</span>
      </div>
      <div class="mq-stat-bar" aria-label="Úspěšnost odpovědí ${percent(accuracy)}">
        <i style="width:${accuracy}%"></i>
      </div>
      <div class="mq-genre-stat-foot">
        <span>Úspěšnost odpovědí <strong>${percent(accuracy)}</strong></span>
        <span>Výhry <strong>${wins}</strong></span>
      </div>
      <div class="mq-genre-stat-explain">${correct} správně z ${answered} odpovězených</div>
    </article>`;
  }

  function difficultyCard(item){
    const key=item?.difficulty||'';
    const games=integer(item?.games);
    const wins=integer(item?.wins);
    return `<article class="mq-difficulty-stat" data-difficulty="${escapeHtml(key)}">
      <div class="mq-difficulty-icon" aria-hidden="true">${DIFFICULTY_ICONS[key]||'🎞️'}</div>
      <div>
        <span>${escapeHtml(item?.label||key)}</span>
        <strong>${wins} ${wins===1?'Oscar':wins>=2&&wins<=4?'Oscary':'Oscarů'}</strong>
        <small>${games} ${games===1?'odehraná hra':games>=2&&games<=4?'odehrané hry':'odehraných her'} · úspěšnost ${percent(item?.accuracy_percent)}</small>
      </div>
    </article>`;
  }

  function recentGame(item){
    const won=Boolean(item?.won);
    const score=integer(item?.score);
    const maxScore=Math.max(1,integer(item?.maxScore)||15);
    return `<article class="mq-recent-game ${won?'is-win':'is-loss'}">
      <div class="mq-recent-result" aria-label="${won?'Výhra':'Prohra'}">${won?'VÝHRA':'PROHRA'}</div>
      <div class="mq-recent-main">
        <strong>${escapeHtml(item?.genreLabel||item?.genre||'Film')}</strong>
        <span>${escapeHtml(item?.difficultyLabel||item?.difficulty||'')}</span>
      </div>
      <div class="mq-recent-score"><strong>${score}</strong><span>/ ${maxScore}</span></div>
      <div class="mq-recent-meta">
        <span>${dateTime(item?.finishedAt||item?.startedAt)}</span>
        <span>${duration(item?.durationMs)}</span>
      </div>
    </article>`;
  }

  function emptyState(nickname){
    return `<div class="mq-stats-empty">
      <div class="mq-stats-empty-icon" aria-hidden="true">🎞️</div>
      <h2>První projekce teprve čeká</h2>
      <p>${escapeHtml(nickname||'Hráč')} zatím nemá dokončenou hru. Po první výhře nebo prohře se zde objeví osobní bilance.</p>
      <button type="button" class="mq-primary" data-stats-play>Spustit promítání</button>
    </div>`;
  }

  function renderData(data){
    latestData=data;
    const content=document.getElementById('mqStatsContent');
    const subtitle=document.getElementById('mqStatsSubtitle');
    if(!content)return;

    const player=data.player||{};
    const summary=data.summary||{};
    const oscars=data.oscars||{};
    const leaderboard=data.leaderboard||{};
    const nickname=player.nickname||onlineApi()?.getPlayerName?.()||'Hráč';
    const totalGames=integer(summary.totalGames);
    const totalPlayers=integer(leaderboard.totalPlayers);
    const rank=leaderboard.rank?integer(leaderboard.rank):null;

    if(subtitle){
      subtitle.textContent=`${nickname} · výsledky jsou uložené pro hráčský účet v tomto prohlížeči`;
    }

    if(!totalGames){
      content.innerHTML=emptyState(nickname);
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
        ${metricCard('Pořadí',rank?`#${rank}`:'Bez pořadí',totalPlayers?`z ${totalPlayers} hráčů`:'žebříček je zatím prázdný','is-rank')}
        ${metricCard('Odehrané hry',totalGames,`${integer(summary.wins)} výher · ${integer(summary.losses)} proher`)}
        ${metricCard('Oscary',integer(oscars.total),`${integer(leaderboard.rankingPoints)} bodů do žebříčku`,'is-oscar')}
        ${metricCard('Úspěšnost',percent(summary.accuracyPercent),`${integer(summary.correctAnswers)} správně z ${integer(summary.questionsAnswered)}`)}
      </section>

      <section class="mq-stats-section">
        <div class="mq-stats-section-title">
          <div><span>Trofeje</span><h2>Oscary podle obtížnosti</h2></div>
          <small>Lehká = 1 bod, střední = 2 body, těžká = 3 body.</small>
        </div>
        <div class="mq-difficulty-stats">
          ${orderedDifficulties.map(difficultyCard).join('')}
        </div>
      </section>

      <section class="mq-stats-highlights">
        <article>
          <span>Nejlepší žánr</span>
          <strong>${escapeHtml(best?.label||'Zatím neurčeno')}</strong>
          <small>${best?`${percent(best.accuracy_percent)} správných odpovědí · ${integer(best.wins)} výher`:'Odehrajte více žánrů.'}</small>
        </article>
        <article>
          <span>Nejhranější žánr</span>
          <strong>${escapeHtml(most?.label||'Zatím neurčeno')}</strong>
          <small>${most?`${integer(most.games)} odehraných her · ${percent(most.win_rate_percent)} výher`:'Odehrajte první projekci.'}</small>
        </article>
        <article>
          <span>Filmový archiv</span>
          <strong>${integer(summary.uniqueMoviesSeen)} filmů</strong>
          <small>${integer(summary.uniqueQuestionsSeen)} unikátních otázek · ${integer(summary.reportsSubmitted)} hlášení</small>
        </article>
      </section>

      <section class="mq-stats-section">
        <div class="mq-stats-section-title">
          <div><span>Žánrový profil</span><h2>Výsledky podle žánrů</h2></div>
          <small>Lišta ukazuje podíl správných odpovědí.</small>
        </div>
        <div class="mq-genre-stats">
          ${orderedGenres.map(genreCard).join('')}
        </div>
      </section>

      <section class="mq-stats-section">
        <div class="mq-stats-section-title">
          <div><span>Poslední projekce</span><h2>Nedávné hry</h2></div>
          <small>Nejvýše je poslední dokončená hra.</small>
        </div>
        <div class="mq-recent-games">
          ${recent.length?recent.map(recentGame).join(''):'<div class="mq-stats-inline-empty">Zatím zde nejsou žádné dokončené hry.</div>'}
        </div>
      </section>

      <footer class="mq-stats-footer">
        <span>Nejlepší skóre <strong>${integer(summary.bestScore)} / 15</strong></span>
        <span>Průměrné skóre <strong>${number(summary.averageScore).toLocaleString('cs-CZ',{maximumFractionDigits:2})}</strong></span>
        <span>Celkový čas <strong>${duration(summary.totalDurationMs)}</strong></span>
        <span>Naposledy hráno <strong>${dateTime(summary.lastPlayedAt)}</strong></span>
      </footer>`;
  }

  function renderError(error){
    const content=document.getElementById('mqStatsContent');
    const subtitle=document.getElementById('mqStatsSubtitle');
    if(subtitle)subtitle.textContent='Statistiky se nepodařilo načíst.';
    if(!content)return;
    content.innerHTML=`<div class="mq-stats-error">
      <div class="mq-stats-error-icon" aria-hidden="true">!</div>
      <h2>Databáze statistik vrátila chybu</h2>
      <p>${escapeHtml(errorText(error))}</p>
      <button type="button" class="mq-primary" id="mqStatsRetry">Zkusit znovu</button>
    </div>`;
    document.getElementById('mqStatsRetry')?.addEventListener('click',()=>renderStatistics(true));
  }

  async function renderStatistics(force=false){
    if(loading)return;
    if(latestData&&!force){
      renderData(latestData);
      return;
    }
    const content=document.getElementById('mqStatsContent');
    const subtitle=document.getElementById('mqStatsSubtitle');
    if(content){
      content.innerHTML=`<div class="mq-stats-loading">
        <span class="mq-stats-spinner" aria-hidden="true"></span>
        <strong>Připravuji statistiky</strong>
        <small>Načítám vaše dokončené hry ze Supabase.</small>
      </div>`;
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

  window.addEventListener('mq:server-question-cleared',()=>{
    latestData=null;
  });

  window.MovieQuizStatistics=Object.freeze({
    version:VERSION,
    open:openStatistics,
    refresh:()=>renderStatistics(true),
    getLatest:()=>latestData?JSON.parse(JSON.stringify(latestData)):null
  });
})();
