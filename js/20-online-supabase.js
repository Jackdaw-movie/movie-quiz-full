(()=>{
  const SUPABASE_URL='https://ymfaskxcgtgflhnjoylz.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_NpNQJqorFyNgiTQ4GahgtQ__UmulD3Y';
  const LAST_NAME_KEY='movieQuizOnlineNicknameV2';
  const PENDING_RUNS_KEY='movieQuizPendingRunsV1';
  const CLIENT_VERSION='v42-persistent-profiles';

  let client=null;
  let backendPromise=null;
  let currentUserId='';
  let currentProfileId='';
  let currentPlayerName='';
  let currentProfile=null;
  let previousView='intro';
  let roundSaved=false;
  let roundStartedAt=0;
  let savePromise=Promise.resolve();
  let profileMode='name';
  let pendingNickname='';
  let revealedRecoveryCode='';
  let revealedRecoveryName='';

  const safeGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(_){return false}};
  const safeRemove=k=>{try{localStorage.removeItem(k)}catch(_){} };
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function cleanName(value){
    return String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim().slice(0,20);
  }
  function isGeneratedName(value){
    return /^Hráč-[A-F0-9]{6}$/i.test(String(value||''));
  }
  function digits(value){return String(value||'').replace(/\D+/g,'').slice(0,6)}
  function recoveryCode(value){
    return String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16).replace(/(.{4})/g,'$1-').replace(/-$/,'');
  }
  function oscarWord(n){
    return n===1?'Oscar':n>=2&&n<=4?'Oscary':'Oscarů';
  }
  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
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
  function profileErrorText(error){
    const code=typeof error==='string'?error:(error?.error||error?.message||'');
    if(/INVALID_NICKNAME/.test(code))return 'Jméno musí mít 2 až 20 znaků.';
    if(/PIN_MUST_HAVE_6_DIGITS/.test(code))return 'PIN musí mít přesně 6 číslic.';
    if(/PIN_CONFIRMATION_MISMATCH/.test(code))return 'Oba PINy se musí shodovat.';
    if(/NAME_ALREADY_EXISTS/.test(code))return 'Toto jméno už existuje. Přihlaste se k němu.';
    if(/INVALID_NAME_OR_PIN/.test(code))return 'Jméno nebo kód nesouhlasí.';
    if(/INVALID_RECOVERY_CODE/.test(code))return 'Obnovovací kód nesouhlasí.';
    if(/DEVICE_ALREADY_HAS_PROFILE/.test(code))return 'Na tomto zařízení už je aktivní jiný hráč. Použijte nejprve volbu Změnit hráče.';
    if(/TOO_MANY_ATTEMPTS/.test(code))return 'Příliš mnoho chybných pokusů. Zkuste to znovu za 15 minut.';
    return backendMessage(error);
  }
  function normalizeRpcObject(data){
    let value=Array.isArray(data)?data[0]:data;
    if(typeof value==='string'){
      try{value=JSON.parse(value)}catch(_){return null}
    }
    return value&&typeof value==='object'?value:null;
  }
  function setCurrentProfile(profile){
    currentProfile=profile&&typeof profile==='object'?profile:null;
    currentProfileId=currentProfile?.profileId||currentUserId||'';
    currentPlayerName=cleanName(currentProfile?.nickname||'');
    if(currentPlayerName)safeSet(LAST_NAME_KEY,currentPlayerName);
  }
  async function loadCurrentProfile(){
    const {data,error}=await client.rpc('get_current_player_profile');
    if(error)throw error;
    const profile=normalizeRpcObject(data);
    setCurrentProfile(profile);
    return currentProfile;
  }

  async function ensureBackend(){
    if(currentUserId&&client)return {client,userId:currentUserId,profileId:currentProfileId,profile:currentProfile};
    if(backendPromise)return backendPromise;
    backendPromise=(async()=>{
      setOnlineStatus('Připojování k online archivu…','loading');
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
      currentProfileId=currentUserId;
      currentPlayerName=cleanName(safeGet(LAST_NAME_KEY));
      currentProfile=null;

      await loadCurrentProfile();
      setOnlineStatus('Online archiv je připojený','online');
      flushPendingRuns().catch(()=>{});
      return {client,userId:currentUserId,profileId:currentProfileId,profile:currentProfile};
    })().catch(error=>{
      backendPromise=null;
      setOnlineStatus('Online archiv není dostupný','offline');
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

  async function checkNickname(name){
    const nickname=cleanName(name);
    const {client:db}=await ensureBackend();
    const {data,error}=await db.rpc('check_player_profile_name',{p_nickname:nickname});
    if(error)throw error;
    const result=normalizeRpcObject(data);
    if(!result)throw new Error('Databáze nevrátila stav profilu.');
    return result;
  }
  async function registerProfile(name,pin,pinConfirmation){
    const nickname=cleanName(name);
    const {client:db}=await ensureBackend();
    const {data,error}=await db.rpc('register_player_profile',{p_nickname:nickname,p_pin:digits(pin),p_pin_confirmation:digits(pinConfirmation)});
    if(error)throw error;
    const result=normalizeRpcObject(data);
    if(!result?.ok)throw result||new Error('Profil se nepodařilo vytvořit.');
    await loadCurrentProfile();
    return result;
  }
  async function loginProfile(name,pin){
    const nickname=cleanName(name);
    const {client:db}=await ensureBackend();
    const {data,error}=await db.rpc('login_player_profile',{p_nickname:nickname,p_pin:digits(pin)});
    if(error)throw error;
    const result=normalizeRpcObject(data);
    if(!result?.ok)throw result||new Error('Přihlášení se nepodařilo.');
    await loadCurrentProfile();
    return result;
  }
  async function recoverProfile(name,recovery,pin,pinConfirmation){
    const nickname=cleanName(name);
    const {client:db}=await ensureBackend();
    const {data,error}=await db.rpc('recover_player_profile',{
      p_nickname:nickname,
      p_recovery_code:recoveryCode(recovery),
      p_new_pin:digits(pin),
      p_new_pin_confirmation:digits(pinConfirmation)
    });
    if(error)throw error;
    const result=normalizeRpcObject(data);
    if(!result?.ok)throw result||new Error('Obnovení profilu se nepodařilo.');
    await loadCurrentProfile();
    return result;
  }
  async function refreshProfileState(){
    await ensureBackend();
    await loadCurrentProfile();
    return currentProfile;
  }
  async function switchPlayer(){
    if(!confirm('Na tomto zařízení odhlásíte aktuální profil a budete moci přihlásit jiného hráče. Pokračovat?'))return false;
    try{
      if(!client)await ensureBackend();
      await client.auth.signOut();
    }catch(_){ }
    backendPromise=null;
    currentUserId='';
    currentProfileId='';
    currentPlayerName='';
    currentProfile=null;
    client=null;
    pendingNickname='';
    revealedRecoveryCode='';
    revealedRecoveryName='';
    safeRemove(LAST_NAME_KEY);
    await ensureBackend();
    return true;
  }

  async function getOwnOscarCounts(){
    const {client:db}=await ensureBackend();
    const {data,error}=await db.rpc('get_my_player_statistics');
    if(error)throw error;
    const stats=normalizeRpcObject(data)||{};
    return stats.oscars||{easy:0,medium:0,hard:0,total:0};
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

  function profileShellMarkup(){
    return `<div id="mqProfileShell" class="mq-profile-shell"></div><div class="mq-name-error" id="mqNameError"></div>`;
  }

  function playerViewMarkup(){
    return `<div class="mq-player-panel"><div class="eyebrow">Vstupenka na projekci</div><h1 class="mq-player-title">Kdo dnes hraje?</h1><p class="mq-player-note">Hráčský profil je svázaný se jménem a 6místným kódem. Na stejném zařízení si vás hra zapamatuje, na jiném zařízení se přihlásíte stejným jménem a kódem.</p><div class="mq-online-status" id="mqOnlineStatus" data-state="loading">Připojování k online archivu…</div>${profileShellMarkup()}<div class="mq-player-actions"><button class="mq-secondary" type="button" data-open-scoreboard>Společný žebříček</button></div><p class="mq-storage-note">Veřejně se zobrazuje pouze jméno hráče. Přihlašovací PIN ani obnovovací kód se nikomu nezobrazují.</p></div>`;
  }
  function scoreboardMarkup(){
    return `<div class="mq-scoreboard-panel"><div class="mq-scoreboard-head"><div class="eyebrow">Síň vítězů</div><h1 class="mq-scoreboard-title">Top 10 hráčů</h1><p class="mq-scoreboard-note">Sdílené výsledky ze všech zařízení a prohlížečů.</p><div class="mq-scoreboard-player" id="mqScoreboardPlayer"></div></div><div class="mq-score-table" id="mqScoreTable"><div class="mq-score-empty">Načítání online žebříčku…</div></div><div class="mq-scoreboard-actions"><button class="mq-secondary mq-scoreboard-back" id="mqScoreboardBack" type="button">Zpět</button><button class="mq-secondary" id="mqScoreboardNewPlayer" type="button">Změnit hráče</button></div></div>`;
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

  function renderProfileShell(markup){
    const shell=document.getElementById('mqProfileShell');
    if(shell)shell.innerHTML=markup;
    const errorEl=document.getElementById('mqNameError');
    if(errorEl)errorEl.textContent='';
  }
  function setProfileError(text=''){
    const errorEl=document.getElementById('mqNameError');
    if(errorEl)errorEl.textContent=text;
  }
  function setSubmitting(formId,workingText,active){
    const button=document.querySelector(`#${formId} .mq-primary`);
    if(!button)return ()=>{};
    const original=button.dataset.original||button.textContent;
    button.dataset.original=original;
    button.disabled=!!active;
    button.textContent=active?workingText:original;
  }
  function stepHeader(title,sub=''){
    return `<div class="mq-profile-step"><h2 class="mq-profile-title">${escapeHtml(title)}</h2>${sub?`<p class="mq-profile-subtitle">${sub}</p>`:''}</div>`;
  }
  function pinHint(){
    return `<div class="mq-profile-hint">Tento 6místný kód budete potřebovat při přihlášení na jiném zařízení. Na tomto zařízení si vás hra zapamatuje.</div>`;
  }
  function recoveryHint(){
    return `<div class="mq-profile-hint">Obnovovací kód je jediný způsob, jak si bez e-mailu nastavit nový PIN, když ho zapomenete. Uložte si ho mimo toto zařízení. Po zavření už se celý znovu nezobrazí.</div>`;
  }

  function renderLinkedProfile(){
    profileMode='linked';
    const name=currentPlayerName||'Hráč';
    renderProfileShell(`
      <div class="mq-profile-card mq-profile-linked">
        ${stepHeader(`Vítej zpět, ${name}.`,'Na tomto zařízení už jste přihlášený. Můžete rovnou pokračovat do hry.')}
        <div class="mq-profile-chip-row"><span class="mq-profile-chip">Přihlášený profil</span><span class="mq-profile-chip mq-profile-chip-soft">Jméno: ${escapeHtml(name)}</span></div>
        <div class="mq-profile-button-row">
          <button class="mq-primary" type="button" id="mqContinueProfile">Pokračovat</button>
          <button class="mq-secondary" type="button" id="mqSwitchProfile">Změnit hráče</button>
        </div>
      </div>
    `);
    setTimeout(()=>document.getElementById('mqContinueProfile')?.focus(),80);
  }

  function renderNameStep(prefill=''){
    profileMode='name';
    const value=cleanName(prefill||pendingNickname||currentPlayerName||safeGet(LAST_NAME_KEY));
    renderProfileShell(`
      <div class="mq-profile-card">
        ${stepHeader('Zadejte hráčské jméno','Pokud jméno už existuje, hra si vyžádá 6místný kód. Pokud je nové, vytvoříte si vlastní PIN a obnovovací kód.')}
        <form class="mq-form-stack" id="mqCheckNameForm">
          <label class="mq-form-label" for="mqPlayerName">Hráčské jméno</label>
          <input class="mq-name-input" id="mqPlayerName" maxlength="20" autocomplete="nickname" placeholder="Například Tomáš" aria-label="Hráčské jméno" value="${escapeHtml(value)}">
          <div class="mq-profile-hint">Jméno uvidí ostatní hráči v žebříčku. Veřejně se nikde nezobrazuje váš PIN ani obnovovací kód.</div>
          <button class="mq-primary" type="submit">Pokračovat</button>
        </form>
      </div>
    `);
    setTimeout(()=>document.getElementById('mqPlayerName')?.focus(),80);
  }

  function renderLoginStep(name){
    pendingNickname=cleanName(name);
    profileMode='login';
    renderProfileShell(`
      <div class="mq-profile-card">
        ${stepHeader(`Jméno ${pendingNickname} už existuje`,'Zadejte 6místný kód tohoto hráče.')}
        <form class="mq-form-stack" id="mqLoginForm">
          <label class="mq-form-label" for="mqPlayerPin">6místný kód</label>
          <input class="mq-name-input mq-pin-input" id="mqPlayerPin" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••" aria-label="6místný kód">
          ${pinHint()}
          <div class="mq-profile-button-row">
            <button class="mq-secondary" type="button" data-back-to-name>Zpět</button>
            <button class="mq-primary" type="submit">Přihlásit</button>
          </div>
        </form>
        <div class="mq-profile-links"><button class="mq-link-button" type="button" data-open-recovery>Zapomněl jsem kód</button></div>
      </div>
    `);
    setTimeout(()=>document.getElementById('mqPlayerPin')?.focus(),80);
  }

  function renderRegisterStep(name){
    pendingNickname=cleanName(name);
    profileMode='register';
    renderProfileShell(`
      <div class="mq-profile-card">
        ${stepHeader(`Vytvořit profil ${pendingNickname}`,'Zvolte si vlastní 6místný kód a zadejte ho dvakrát pro kontrolu.')}
        <form class="mq-form-stack" id="mqRegisterForm">
          <label class="mq-form-label" for="mqPlayerPinNew">6místný kód</label>
          <input class="mq-name-input mq-pin-input" id="mqPlayerPinNew" inputmode="numeric" maxlength="6" autocomplete="new-password" placeholder="••••••" aria-label="Nový 6místný kód">
          <label class="mq-form-label" for="mqPlayerPinConfirm">Zopakujte kód</label>
          <input class="mq-name-input mq-pin-input" id="mqPlayerPinConfirm" inputmode="numeric" maxlength="6" autocomplete="new-password" placeholder="••••••" aria-label="Potvrzení 6místného kódu">
          ${pinHint()}
          <div class="mq-profile-button-row">
            <button class="mq-secondary" type="button" data-back-to-name>Zpět</button>
            <button class="mq-primary" type="submit">Vytvořit profil</button>
          </div>
        </form>
      </div>
    `);
    setTimeout(()=>document.getElementById('mqPlayerPinNew')?.focus(),80);
  }

  function renderRecoveryStep(name){
    pendingNickname=cleanName(name);
    profileMode='recovery';
    renderProfileShell(`
      <div class="mq-profile-card">
        ${stepHeader(`Obnova profilu ${pendingNickname}`,'Pomocí obnovovacího kódu nastavíte nový 6místný PIN.')}
        <form class="mq-form-stack" id="mqRecoverForm">
          <label class="mq-form-label" for="mqRecoveryCode">Obnovovací kód</label>
          <input class="mq-name-input mq-recovery-input" id="mqRecoveryCode" maxlength="19" autocomplete="off" placeholder="MQ-ABCD-EFGH-IJKL-MNOP" aria-label="Obnovovací kód">
          <label class="mq-form-label" for="mqRecoveryPinNew">Nový 6místný kód</label>
          <input class="mq-name-input mq-pin-input" id="mqRecoveryPinNew" inputmode="numeric" maxlength="6" autocomplete="new-password" placeholder="••••••" aria-label="Nový 6místný kód">
          <label class="mq-form-label" for="mqRecoveryPinConfirm">Zopakujte nový kód</label>
          <input class="mq-name-input mq-pin-input" id="mqRecoveryPinConfirm" inputmode="numeric" maxlength="6" autocomplete="new-password" placeholder="••••••" aria-label="Potvrzení nového kódu">
          ${recoveryHint()}
          <div class="mq-profile-button-row">
            <button class="mq-secondary" type="button" data-back-to-login>Zpět</button>
            <button class="mq-primary" type="submit">Obnovit profil</button>
          </div>
        </form>
      </div>
    `);
    setTimeout(()=>document.getElementById('mqRecoveryCode')?.focus(),80);
  }

  function renderRecoveryReveal(name,code,isNewProfile){
    revealedRecoveryName=name;
    revealedRecoveryCode=code;
    profileMode='recoveryReveal';
    renderProfileShell(`
      <div class="mq-profile-card mq-profile-reveal">
        ${stepHeader(isNewProfile?'Profil byl vytvořen':'PIN byl obnoven',isNewProfile?`Profil ${escapeHtml(name)} je připravený. Níže si uložte obnovovací kód.`:`Profil ${escapeHtml(name)} je znovu přístupný. Uložte si nový obnovovací kód.`)}
        <div class="mq-recovery-code-wrap">
          <div class="mq-recovery-code-label">Obnovovací kód</div>
          <div class="mq-recovery-code" id="mqRecoveryCodeValue">${escapeHtml(code)}</div>
        </div>
        ${recoveryHint()}
        <div class="mq-profile-button-row">
          <button class="mq-secondary" type="button" id="mqCopyRecovery">Kopírovat</button>
          <button class="mq-primary" type="button" id="mqRecoveryDone">Rozumím, pokračovat</button>
        </div>
      </div>
    `);
    setTimeout(()=>document.getElementById('mqRecoveryDone')?.focus(),80);
  }

  showView=function(id){
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===id));
    if(id==='playerView')preparePlayerView();
    if(id==='scoreboardView')renderScoreboard();
  };

  async function preparePlayerView(){
    try{
      setProfileError('');
      await ensureBackend();
      await refreshProfileState();
      if(currentProfile?.profileId)renderLinkedProfile();
      else renderNameStep();
    }catch(error){
      renderNameStep();
      setProfileError(backendMessage(error));
    }
  }

  function proceedToGame(){
    document.getElementById('selectedDifficulty').textContent=difficultyLabels[state.difficulty];
    showView('difficulty');
    screen.removeAttribute('data-genre');
    try{sound?.('soft')}catch(_){ }
  }

  async function handleCheckName(name){
    const formId='mqCheckNameForm';
    setProfileError('');
    setSubmitting(formId,'Ověřuji…',true);
    try{
      const result=await checkNickname(name);
      pendingNickname=cleanName(result.nickname||name);
      if(result.exists)renderLoginStep(pendingNickname);
      else renderRegisterStep(pendingNickname);
      sound?.('soft');
    }catch(error){
      setProfileError(profileErrorText(error));
    }finally{
      setSubmitting(formId,'Ověřuji…',false);
    }
  }
  async function handleLogin(pin){
    const formId='mqLoginForm';
    setProfileError('');
    setSubmitting(formId,'Přihlašuji…',true);
    try{
      await loginProfile(pendingNickname,pin);
      sound?.('soft');
      proceedToGame();
    }catch(error){
      setProfileError(profileErrorText(error));
    }finally{
      setSubmitting(formId,'Přihlašuji…',false);
    }
  }
  async function handleRegister(pin,pinConfirmation){
    const formId='mqRegisterForm';
    setProfileError('');
    setSubmitting(formId,'Vytvářím…',true);
    try{
      const result=await registerProfile(pendingNickname,pin,pinConfirmation);
      sound?.('soft');
      renderRecoveryReveal(currentPlayerName||pendingNickname,result.recoveryCode||'',true);
    }catch(error){
      setProfileError(profileErrorText(error));
    }finally{
      setSubmitting(formId,'Vytvářím…',false);
    }
  }
  async function handleRecover(recovery,pin,pinConfirmation){
    const formId='mqRecoverForm';
    setProfileError('');
    setSubmitting(formId,'Obnovuji…',true);
    try{
      const result=await recoverProfile(pendingNickname,recovery,pin,pinConfirmation);
      sound?.('soft');
      renderRecoveryReveal(currentPlayerName||pendingNickname,result.recoveryCode||'',false);
    }catch(error){
      setProfileError(profileErrorText(error));
    }finally{
      setSubmitting(formId,'Obnovuji…',false);
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
      const [rows,ownCounts]=await Promise.all([getLeaderboard(),getOwnOscarCounts()]);
      if(current&&currentPlayerName)current.textContent=`Aktuální hráč: ${currentPlayerName} · ${Number(ownCounts.total)||0} ${oscarWord(Number(ownCounts.total)||0)}`;
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
    if(event.target?.id==='mqCheckNameForm'){
      event.preventDefault();
      handleCheckName(document.getElementById('mqPlayerName')?.value);
      return;
    }
    if(event.target?.id==='mqLoginForm'){
      event.preventDefault();
      handleLogin(document.getElementById('mqPlayerPin')?.value);
      return;
    }
    if(event.target?.id==='mqRegisterForm'){
      event.preventDefault();
      handleRegister(document.getElementById('mqPlayerPinNew')?.value,document.getElementById('mqPlayerPinConfirm')?.value);
      return;
    }
    if(event.target?.id==='mqRecoverForm'){
      event.preventDefault();
      handleRecover(document.getElementById('mqRecoveryCode')?.value,document.getElementById('mqRecoveryPinNew')?.value,document.getElementById('mqRecoveryPinConfirm')?.value);
    }
  });

  document.addEventListener('input',event=>{
    if(event.target?.matches?.('.mq-pin-input'))event.target.value=digits(event.target.value);
    if(event.target?.id==='mqRecoveryCode')event.target.value=recoveryCode(event.target.value);
  });

  document.addEventListener('click',async event=>{
    if(event.target.closest?.('[data-open-scoreboard]')){openScoreboard();return}
    if(event.target.closest?.('[data-change-player]')){
      const changed=await switchPlayer();
      if(changed)goPlayer();
      return;
    }
    if(event.target.closest?.('[data-back-to-name]')){renderNameStep(pendingNickname);sound?.('soft');return}
    if(event.target.closest?.('[data-back-to-login]')){renderLoginStep(pendingNickname);sound?.('soft');return}
    if(event.target.closest?.('[data-open-recovery]')){renderRecoveryStep(pendingNickname);sound?.('soft');return}
    if(event.target.id==='mqContinueProfile'){proceedToGame();return}
    if(event.target.id==='mqSwitchProfile'){
      const changed=await switchPlayer();
      if(changed)preparePlayerView();
      return;
    }
    if(event.target.id==='mqRecoveryDone'){proceedToGame();return}
    if(event.target.id==='mqCopyRecovery'){
      const code=document.getElementById('mqRecoveryCodeValue')?.textContent||revealedRecoveryCode;
      try{await navigator.clipboard.writeText(code);event.target.textContent='Zkopírováno';setTimeout(()=>event.target.textContent='Kopírovat',1600);}catch(_){setProfileError('Obnovovací kód zkopírujte ručně.');}
      return;
    }
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

  window.MovieQuizOnline=Object.freeze({
    ensureBackend,
    refreshProfileState,
    getClient:()=>client,
    getUserId:()=>currentUserId,
    getProfileId:()=>currentProfileId,
    getPlayerName:()=>currentPlayerName,
    getProfile:()=>currentProfile,
    isReady:()=>Boolean(client&&currentUserId)
  });
})();
