(()=>{
  const SUPABASE_URL='https://ymfaskxcgtgflhnjoylz.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_NpNQJqorFyNgiTQ4GahgtQ__UmulD3Y';
  const LAST_NAME_KEY='movieQuizOnlineNicknameV1';
  const PENDING_RUNS_KEY='movieQuizPendingRunsV1';
  const CLIENT_VERSION='v38-all-genres-question-bank';

  let client=null;
  let backendPromise=null;
  let currentUserId='';
  let currentPlayerName='';
  let previousView='intro';
  let roundSaved=false;
  let roundStartedAt=0;
  let savePromise=Promise.resolve();

  const safeGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(_){return false}};
  const safeRemove=k=>{try{localStorage.removeItem(k)}catch(_){}};
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function cleanName(value){
    return String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim().slice(0,20);
  }
  function isGeneratedName(value){
    return /^Hráč-[A-F0-9]{6}$/i.test(String(value||''));
  }
  function oscarWord(n){
    return n===1?'Oscar':n>=2&&n<=4?'Oscary':'Oscarů';
  }
  function setOnlineStatus(text,state='loading'){
    const el=document.getElementById('mqOnlineStatus');
    if(!el)return;
    el.textContent=text;
    el.dataset.state=state;
  }
  function backendMessage(error){
    const text=String(error?.message||error||'');
    if(/Failed to fetch|NetworkError|Load failed/i.test(text))return 'Nepodařilo se připojit k databázi. Zkontrolujte internetové připojení.';
    return text||'Databáze momentálně neodpovídá.';
  }

  async function ensureBackend(){
    if(currentUserId&&client)return {client,userId:currentUserId};
    if(backendPromise)return backendPromise;
    backendPromise=(async()=>{
      setOnlineStatus('Připojování k online žebříčku…','loading');
      if(!window.supabase?.createClient)throw new Error('Nepodařilo se načíst knihovnu Supabase.');

      client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
      });

      let {data:sessionData,error:sessionError}=await client.auth.getSession();
      if(sessionError)throw sessionError;
      let session=sessionData?.session;
      if(!session){
        const signed=await client.auth.signInAnonymously();
        if(signed.error)throw signed.error;
        session=signed.data?.session;
      }
      if(!session?.user?.id)throw new Error('Nepodařilo se vytvořit hráčskou relaci.');
      currentUserId=session.user.id;

      let profile=null;
      for(let attempt=0;attempt<3&&!profile;attempt++){
        const result=await client.from('players').select('id,nickname,last_seen_at').eq('id',currentUserId).limit(1);
        if(result.error)throw result.error;
        profile=result.data?.[0]||null;
        if(!profile&&attempt<2)await sleep(180);
      }

      if(!profile){
        const generated='Hráč-'+currentUserId.replace(/-/g,'').slice(0,6).toUpperCase();
        const created=await client.from('players').insert({id:currentUserId,nickname:generated});
        if(created.error)throw created.error;
        profile={id:currentUserId,nickname:generated};
      }

      currentPlayerName=cleanName(profile.nickname)||cleanName(safeGet(LAST_NAME_KEY));
      await client.from('players').update({last_seen_at:new Date().toISOString()}).eq('id',currentUserId);
      setOnlineStatus('Online žebříček je připojený','online');
      flushPendingRuns().catch(()=>{});
      return {client,userId:currentUserId};
    })().catch(error=>{
      backendPromise=null;
      setOnlineStatus('Online žebříček není dostupný','offline');
      throw error;
    });
    return backendPromise;
  }

  function readPendingRuns(){
    try{
      const data=JSON.parse(safeGet(PENDING_RUNS_KEY)||'[]');
      return Array.isArray(data)?data:[];
    }catch(_){return []}
  }
  function queueRun(run){
    const queue=readPendingRuns();
    queue.push(run);
    safeSet(PENDING_RUNS_KEY,JSON.stringify(queue.slice(-20)));
  }
  async function flushPendingRuns(){
    if(!client||!currentUserId)return;
    const queue=readPendingRuns();
    if(!queue.length)return;
    const rows=queue.map(run=>({...run,player_id:currentUserId}));
    const {error}=await client.from('game_runs').insert(rows);
    if(!error)safeRemove(PENDING_RUNS_KEY);
  }

  async function updateNickname(name){
    const nickname=cleanName(name);
    if(nickname.length<2)throw new Error('Zadejte alespoň 2 znaky.');
    const {client:db,userId}=await ensureBackend();
    const {error}=await db.from('players').update({nickname,last_seen_at:new Date().toISOString()}).eq('id',userId);
    if(error)throw error;
    currentPlayerName=nickname;
    safeSet(LAST_NAME_KEY,nickname);
    return nickname;
  }

  async function getOwnOscarCounts(){
    if(!client||!currentUserId)return {easy:0,medium:0,hard:0,total:0};
    const {data,error}=await client.from('game_runs').select('difficulty,won').eq('player_id',currentUserId).eq('won',true);
    if(error)throw error;
    const counts={easy:0,medium:0,hard:0,total:0};
    (data||[]).forEach(row=>{
      if(row.difficulty in counts)counts[row.difficulty]++;
      counts.total++;
    });
    return counts;
  }

  async function getLeaderboard(){
    const {client:db}=await ensureBackend();
    const {data,error}=await db.rpc('get_leaderboard',{limit_count:10});
    if(error)throw error;
    return Array.isArray(data)?data:[];
  }

  function createRunPayload(){
    const finished=Date.now();
    const answered=Math.max(0,Number(state.questionNo)||0);
    const correct=Math.max(0,Number(state.score)||0);
    return {
      game_mode:'classic',
      genre:String(state.genre||'unknown'),
      difficulty:String(state.difficulty||'medium'),
      score:correct,
      max_score:15,
      questions_answered:answered,
      correct_answers:correct,
      wrong_answers:Math.max(0,answered-correct),
      lives_remaining:Math.max(0,Number(state.lives)||0),
      duration_ms:roundStartedAt?Math.max(0,finished-roundStartedAt):null,
      started_at:new Date(roundStartedAt||finished).toISOString(),
      finished_at:new Date(finished).toISOString(),
      client_version:CLIENT_VERSION,
      metadata:{viewport:`${window.innerWidth}x${window.innerHeight}`,language:navigator.language||'cs'}
    };
  }

  function saveGameRun(){
    /* Nová databázová banka ukládá dokončený výsledek serverově přímo
       ve funkci submit_quiz_answer. Starý klientský zápis proto přeskočíme,
       aby nevznikly dva záznamy stejné hry. */
    if(window.__mqServerVerifiedSessionActive){
      roundSaved=true;
      savePromise=Promise.resolve();
      return savePromise;
    }
    if(roundSaved)return savePromise;
    roundSaved=true;
    const payload=createRunPayload();
    savePromise=(async()=>{
      try{
        const {client:db,userId}=await ensureBackend();
        const {error}=await db.from('game_runs').insert({...payload,player_id:userId});
        if(error)throw error;
      }catch(error){
        queueRun(payload);
        console.warn('Movie Quiz: výsledek byl dočasně uložen lokálně.',error);
      }
    })();
    return savePromise;
  }

  const award=`<g transform="translate(1 1)"><circle class="gold-fill" cx="8" cy="5" r="2.4"/><path class="gold-fill" d="M5.2 8.1h5.6l1.5 8.8H3.7z"/><path class="gold-line" d="M6.1 9.5L3.5 13M9.9 9.5l2.6 3.5M6.5 17h3M5 19h6"/></g>`;
  const icons={
    account:`<span class="mq-score-icon account" title="Hráč" role="img" aria-label="Hráč"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="gold-line" cx="18" cy="11" r="6"/><path class="gold-line" d="M7 31c1.2-7.2 5.1-11 11-11s9.8 3.8 11 11"/></svg></span>`,
    easy:`<span class="mq-score-icon" title="Oscar za lehkou obtížnost" role="img" aria-label="Oscar s popcornem"><svg viewBox="0 0 48 32" aria-hidden="true">${award}<g transform="translate(21 3)"><path class="white-line" d="M5 10h17l-2 17H7zM8 13l1 11m5-11v11m5-11-1 11"/><path class="gold-fill" d="M6 10C2 9 3 4 7 4c1-4 6-4 8-1 3-3 8-1 7 3 4 1 4 5 0 6z"/></g></svg></span>`,
    medium:`<span class="mq-score-icon" title="Oscar za střední obtížnost" role="img" aria-label="Oscar s filmovou klapkou"><svg viewBox="0 0 48 32" aria-hidden="true">${award}<g transform="translate(21 4)"><path class="white-line" d="M3 9h22v16H3zM3 3h22v7H3zM6 3l5 7m2-7 5 7m2-7 5 7M8 16h12m-12 5h8"/></g></svg></span>`,
    hard:`<span class="mq-score-icon" title="Oscar za těžkou obtížnost" role="img" aria-label="Oscar s filmovou kamerou"><svg viewBox="0 0 48 32" aria-hidden="true">${award}<g transform="translate(21 4)"><circle class="white-line" cx="9" cy="7" r="5"/><circle class="white-line" cx="20" cy="8" r="4"/><circle class="gold-fill" cx="9" cy="7" r="1.4"/><circle class="gold-fill" cx="20" cy="8" r="1.2"/><path class="white-line" d="M4 14h20v12H4zM24 17l6-3v12l-6-3z"/></g></svg></span>`
  };

  function playerViewMarkup(){
    return `<div class="mq-player-panel"><div class="eyebrow">Vstupenka na projekci</div><h1 class="mq-player-title">Kdo dnes hraje?</h1><p class="mq-player-note">Přezdívka, odehrané hry a vyhrané Oscary se ukládají do společné online databáze.</p><div class="mq-online-status" id="mqOnlineStatus" data-state="loading">Připojování k online žebříčku…</div><div class="mq-player-known" id="mqPlayerKnown"></div><form class="mq-name-form" id="mqNameForm"><input class="mq-name-input" id="mqPlayerName" maxlength="20" autocomplete="nickname" placeholder="Zadejte přezdívku" aria-label="Přezdívka hráče"><button class="mq-primary" type="submit">Pokračovat</button></form><div class="mq-name-error" id="mqNameError"></div><div class="mq-player-actions"><button class="mq-secondary" type="button" data-open-scoreboard>Společný žebříček</button></div><p class="mq-storage-note">Tento prohlížeč používá anonymní hráčský účet. Po vymazání dat prohlížeče se vytvoří nový účet.</p></div>`;
  }
  function scoreboardMarkup(){
    return `<div class="mq-scoreboard-panel"><div class="mq-scoreboard-head"><div class="eyebrow">Síň vítězů</div><h1 class="mq-scoreboard-title">Top 10 hráčů</h1><p class="mq-scoreboard-note">Sdílené výsledky ze všech zařízení a prohlížečů.</p><div class="mq-scoreboard-player" id="mqScoreboardPlayer"></div></div><div class="mq-score-table" id="mqScoreTable"><div class="mq-score-empty">Načítání online žebříčku…</div></div><div class="mq-scoreboard-actions"><button class="mq-secondary mq-scoreboard-back" id="mqScoreboardBack" type="button">Zpět</button><button class="mq-secondary" id="mqScoreboardNewPlayer" type="button">Změnit přezdívku</button></div></div>`;
  }
  function installViews(){
    const difficulty=document.getElementById('difficulty');
    const intro=document.getElementById('intro');
    if(!difficulty||!intro)return;
    if(!document.getElementById('playerView')){
      const view=document.createElement('section');
      view.className='view selection-view';
      view.id='playerView';
      view.innerHTML=playerViewMarkup();
      difficulty.before(view);
    }
    if(!document.getElementById('scoreboardView')){
      const view=document.createElement('section');
      view.className='view selection-view';
      view.id='scoreboardView';
      view.innerHTML=scoreboardMarkup();
      difficulty.before(view);
    }
    if(!document.getElementById('mqIntroScoreboard')){
      const button=document.createElement('button');
      button.id='mqIntroScoreboard';
      button.className='mq-intro-scoreboard';
      button.type='button';
      button.textContent='Žebříček';
      intro.appendChild(button);
    }
    document.querySelectorAll('#difficulty .selection-panel,#genres .selection-panel').forEach(panel=>{
      if(panel.querySelector('.mq-selection-tools'))return;
      const tools=document.createElement('div');
      tools.className='mq-selection-tools';
      tools.innerHTML='<button type="button" data-open-scoreboard>Žebříček</button><button type="button" data-change-player>Změnit hráče</button>';
      panel.prepend(tools);
    });
  }

  showView=function(id){
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===id));
    if(id==='playerView')preparePlayerView();
    if(id==='scoreboardView')renderScoreboard();
  };

  async function preparePlayerView(){
    const input=document.getElementById('mqPlayerName');
    const known=document.getElementById('mqPlayerKnown');
    const errorEl=document.getElementById('mqNameError');
    if(errorEl)errorEl.textContent='';
    const cached=cleanName(safeGet(LAST_NAME_KEY));
    if(input&&!input.value)input.value=cached;
    if(known)known.textContent=cached?`Vítej zpět, ${cached}.`:'';
    setTimeout(()=>input?.focus(),80);
    try{
      await ensureBackend();
      const displayName=isGeneratedName(currentPlayerName)?'':currentPlayerName;
      if(input&&!input.value)input.value=displayName;
      if(known)known.textContent=displayName?`Vítej zpět, ${displayName}.`:'';
    }catch(error){
      if(errorEl)errorEl.textContent=backendMessage(error);
    }
  }

  async function submitPlayer(name){
    const errorEl=document.getElementById('mqNameError');
    const button=document.querySelector('#mqNameForm .mq-primary');
    if(errorEl)errorEl.textContent='';
    if(button){button.disabled=true;button.textContent='Připojuji…';}
    try{
      const nickname=await updateNickname(name);
      currentPlayerName=nickname;
      document.getElementById('selectedDifficulty').textContent=difficultyLabels[state.difficulty];
      showView('difficulty');
      sound?.('soft');
    }catch(error){
      if(errorEl)errorEl.textContent=backendMessage(error);
    }finally{
      if(button){button.disabled=false;button.textContent='Pokračovat';}
    }
  }

  async function renderScoreboard(){
    const table=document.getElementById('mqScoreTable');
    const current=document.getElementById('mqScoreboardPlayer');
    if(!table)return;
    table.innerHTML='<div class="mq-score-empty">Načítání online žebříčku…</div>';
    if(current)current.textContent=currentPlayerName?`Aktuální hráč: ${currentPlayerName}`:'';
    try{
      await savePromise.catch(()=>{});
      const [rows,ownCounts]=await Promise.all([getLeaderboard(),ensureBackend().then(getOwnOscarCounts)]);
      if(current&&currentPlayerName)current.textContent=`Aktuální hráč: ${currentPlayerName} · ${ownCounts.total} ${oscarWord(ownCounts.total)}`;
      table.innerHTML=`<div class="mq-score-row mq-score-header"><div class="mq-score-cell">${icons.account}</div><div class="mq-score-cell">${icons.easy}</div><div class="mq-score-cell">${icons.medium}</div><div class="mq-score-cell">${icons.hard}</div></div>`;
      if(!rows.length){
        table.insertAdjacentHTML('beforeend','<div class="mq-score-empty">Žebříček je zatím prázdný. Vyhrajte první Oscar.</div>');
        return;
      }
      rows.forEach(row=>{
        const item=document.createElement('div');
        item.className='mq-score-row'+(row.player_nickname===currentPlayerName?' mq-score-current':'');
        const name=document.createElement('div');
        name.className='mq-score-cell';
        const rank=document.createElement('span');
        rank.className='mq-player-rank';
        rank.textContent=row.leaderboard_rank;
        const strong=document.createElement('span');
        strong.className='mq-score-name';
        strong.textContent=row.player_nickname;
        const sub=document.createElement('small');
        sub.className='mq-score-total';
        const total=Number(row.easy_oscars||0)+Number(row.medium_oscars||0)+Number(row.hard_oscars||0);
        sub.textContent=`Celkem ${total} ${oscarWord(total)}`;
        name.append(rank,strong,sub);
        item.appendChild(name);
        [row.easy_oscars,row.medium_oscars,row.hard_oscars].forEach(value=>{
          const cell=document.createElement('div');
          cell.className='mq-score-cell';
          cell.textContent=Number(value)||0;
          item.appendChild(cell);
        });
        table.appendChild(item);
      });
    }catch(error){
      table.innerHTML=`<div class="mq-score-empty">${backendMessage(error)}</div>`;
    }
  }

  function activeViewId(){return document.querySelector('.view.active')?.id||'intro'}
  function openScoreboard(from){
    previousView=from||activeViewId();
    if(previousView==='scoreboardView')previousView='difficulty';
    showView('scoreboardView');
    sound?.('soft');
  }
  function goPlayer(){showView('playerView');sound?.('soft')}

  installViews();
  ensureBackend().catch(()=>{});

  const start=document.getElementById('startBtn');
  start?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopImmediatePropagation();
    initAudio();
    switchMusic('menu');
    openCurtain();
    setTimeout(()=>{
      showView('playerView');
      screen.removeAttribute('data-genre');
      sound('soft');
    },820);
  },true);

  document.getElementById('mqIntroScoreboard')?.addEventListener('click',()=>{
    initAudio();
    switchMusic('menu');
    openCurtain();
    setTimeout(()=>openScoreboard('intro'),620);
  });
  document.addEventListener('submit',event=>{
    if(event.target?.id!=='mqNameForm')return;
    event.preventDefault();
    submitPlayer(document.getElementById('mqPlayerName')?.value);
  });
  document.addEventListener('click',event=>{
    if(event.target.closest?.('[data-open-scoreboard]')){openScoreboard();return}
    if(event.target.closest?.('[data-change-player]')){goPlayer()}
  });
  document.getElementById('mqScoreboardBack')?.addEventListener('click',()=>showView(previousView||'difficulty'));
  document.getElementById('mqScoreboardNewPlayer')?.addEventListener('click',goPlayer);

  const oldStartGame=startGame;
  startGame=function(genre){
    roundSaved=false;
    roundStartedAt=Date.now();
    return oldStartGame(genre);
  };
  const oldCredits=creditsThenEnd;
  creditsThenEnd=function(){
    saveGameRun();
    const result=oldCredits();
    const name=document.querySelector('#creditsRoll .credit-name');
    if(name&&currentPlayerName)name.textContent=currentPlayerName;
    return result;
  };
  const oldWin=win;
  win=function(){
    saveGameRun();
    return oldWin();
  };

  /* Sdílený přístup pro samostatný modul databázových otázek. Publikujeme
     pouze klienta s veřejným publishable klíčem a bezpečnou autentizaci. */
  window.MovieQuizOnline=Object.freeze({
    ensureBackend,
    getClient:()=>client,
    getUserId:()=>currentUserId,
    getPlayerName:()=>currentPlayerName,
    isReady:()=>Boolean(client&&currentUserId)
  });
})();
