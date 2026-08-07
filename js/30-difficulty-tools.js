(()=>{
  const moveTools=()=>{
    const difficulty=document.getElementById('difficulty');
    const tools=difficulty?.querySelector('.mq-selection-tools');
    if(difficulty&&tools&&tools.parentElement!==difficulty)difficulty.appendChild(tools);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',moveTools,{once:true});
  else moveTools();
})();

(()=>{
  'use strict';

  const VERSION='guest-mode-v1';
  const patchedClients=new WeakSet();
  const originalRpcByClient=new WeakMap();

  let guestMode=false;
  let uiSyncQueued=false;
  let lastGuestError=null;

  function onlineApi(){
    return window.MovieQuizOnline;
  }

  function normalizeRpcObject(data){
    let value=Array.isArray(data)?data[0]:data;
    if(typeof value==='string'){
      try{value=JSON.parse(value)}catch(_){return null}
    }
    return value&&typeof value==='object'?value:null;
  }

  function errorSnapshot(error){
    return {
      code:error?.code||'MQ_GUEST_MODE_SETUP',
      message:error?.message||String(error||'Hostovský režim se nepodařilo připravit.'),
      details:error?.details||null,
      hint:error?.hint||null
    };
  }

  function createGuestError(message,source){
    const snapshot=errorSnapshot(source);
    return {
      code:snapshot.code||'MQ_GUEST_MODE_SETUP',
      message:message,
      details:snapshot.details||snapshot.message||null,
      hint:snapshot.hint||'Zkuste se vrátit do nabídky a hostovskou hru spustit znovu.'
    };
  }

  function dispatchGuestState(){
    window.__mqGuestMode=guestMode;
    window.dispatchEvent(new CustomEvent('mq:guest-mode-changed',{
      detail:{guestMode,version:VERSION}
    }));
  }

  function installStyles(){
    if(document.getElementById('mqGuestModeStyles'))return;

    const style=document.createElement('style');
    style.id='mqGuestModeStyles';
    style.textContent=`
      .mq-guest-entry{
        margin-top:14px;
        padding-top:14px;
        border-top:1px solid rgba(255,255,255,.16);
        text-align:center;
      }
      .mq-guest-separator{
        display:flex;
        align-items:center;
        gap:10px;
        margin:0 0 12px;
        color:rgba(255,255,255,.62);
        font-size:10px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .mq-guest-separator::before,
      .mq-guest-separator::after{
        content:"";
        flex:1;
        height:1px;
        background:rgba(255,255,255,.14);
      }
      .mq-guest-button{
        width:100%;
        min-height:46px;
        border:1px solid rgba(255,217,92,.62);
        border-radius:12px;
        background:rgba(255,199,55,.10);
        color:#ffe08a;
        cursor:pointer;
        font:800 13px/1.2 inherit;
        letter-spacing:.01em;
        transition:transform .16s ease,background .16s ease,border-color .16s ease;
      }
      .mq-guest-button:hover{
        transform:translateY(-1px);
        background:rgba(255,199,55,.16);
        border-color:rgba(255,224,138,.9);
      }
      .mq-guest-button:disabled{
        cursor:wait;
        opacity:.62;
        transform:none;
      }
      .mq-guest-note{
        margin:9px 0 0;
        color:rgba(255,255,255,.66);
        font-size:10px;
        line-height:1.55;
      }
      .mq-guest-card{
        text-align:left;
      }
      .mq-guest-card .mq-profile-chip-row{
        margin-top:12px;
      }
      .mq-guest-status-strip{
        display:none;
        width:min(680px,calc(100% - 28px));
        margin:7px auto 0;
        padding:8px 12px;
        border:1px solid rgba(255,217,92,.34);
        border-radius:999px;
        background:rgba(12,12,12,.44);
        color:#f6e5ae;
        font-size:10px;
        font-weight:700;
        line-height:1.35;
        text-align:center;
        backdrop-filter:blur(5px);
      }
      body.mq-guest-mode .mq-guest-status-strip{
        display:block;
      }
      body.mq-guest-mode [data-open-statistics],
      body.mq-guest-mode [data-open-scoreboard],
      body.mq-guest-mode #mqIntroScoreboard{
        display:none!important;
      }
      .mq-guest-result-note{
        display:none;
        width:min(680px,calc(100% - 32px));
        margin:10px auto 0;
        padding:9px 12px;
        border:1px solid rgba(255,217,92,.34);
        border-radius:10px;
        background:rgba(0,0,0,.35);
        color:#f5df9a;
        font-size:10px;
        line-height:1.45;
        text-align:center;
      }
      body.mq-guest-mode .mq-guest-result-note{
        display:block;
      }
      @media(max-width:640px){
        .mq-guest-status-strip{
          border-radius:12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureGuestStatusStrip(){
    if(document.getElementById('mqGuestStatusStrip'))return;

    const strip=document.createElement('div');
    strip.id='mqGuestStatusStrip';
    strip.className='mq-guest-status-strip';
    strip.textContent='Hrajete jako Host · Výsledek se neuloží do statistik ani společného žebříčku.';

    const difficulty=document.getElementById('difficulty');
    const genres=document.getElementById('genres');

    if(difficulty) difficulty.prepend(strip);

    if(genres){
      const clone=strip.cloneNode(true);
      clone.id='mqGuestStatusStripGenres';
      genres.prepend(clone);
    }
  }

  function ensureResultNotes(){
    [
      ['win','Výhra hosta se neukládá do statistik ani společného žebříčku.'],
      ['end','Výsledek hosta se neukládá do statistik ani společného žebříčku.']
    ].forEach(([viewId,text])=>{
      const view=document.getElementById(viewId);
      if(!view||view.querySelector('.mq-guest-result-note'))return;
      const note=document.createElement('div');
      note.className='mq-guest-result-note';
      note.textContent=text;
      view.appendChild(note);
    });
  }

  function syncPlayerBadge(){
    const badge=document.getElementById('mqPlayerBadge');
    const name=document.getElementById('mqPlayerBadgeName');
    if(!badge||!name)return;

    let label=badge.querySelector('span');

    if(guestMode){
      if(label)label.textContent='Režim';
      name.textContent='Host';
      badge.classList.add('visible');
      return;
    }

    if(label)label.textContent='Hráč';
    const playerName=onlineApi()?.getPlayerName?.()||'';
    name.textContent=playerName;
    badge.classList.toggle('visible',Boolean(playerName));
  }

  function guestCurrentMarkup(){
    return `
      <div class="mq-profile-card mq-profile-linked mq-guest-card" data-mq-guest-current>
        <div class="mq-profile-step">
          <h2 class="mq-profile-title">Hrajete jako host</h2>
          <p class="mq-profile-subtitle">Do hry můžete vstoupit okamžitě. Výsledky hosta se neukládají do osobních statistik ani společného žebříčku.</p>
        </div>
        <div class="mq-profile-chip-row">
          <span class="mq-profile-chip">Host</span>
          <span class="mq-profile-chip mq-profile-chip-soft">Bez statistik a žebříčku</span>
        </div>
        <div class="mq-profile-button-row">
          <button class="mq-primary" type="button" id="mqContinueGuest">Pokračovat jako host</button>
          <button class="mq-secondary" type="button" id="mqLeaveGuest">Přihlásit se / vytvořit profil</button>
        </div>
      </div>
    `;
  }

  function injectGuestEntry(){
    const shell=document.getElementById('mqProfileShell');
    if(!shell)return;

    const api=onlineApi();
    const hasProfile=Boolean(api?.getProfile?.()?.profileId);

    if(hasProfile){
      shell.querySelector('.mq-guest-entry')?.remove();
      if(guestMode)setGuestMode(false);
      return;
    }

    if(guestMode){
      if(!shell.querySelector('[data-mq-guest-current]')){
        shell.innerHTML=guestCurrentMarkup();
      }
      return;
    }

    if(shell.querySelector('.mq-guest-entry'))return;

    const card=shell.querySelector('.mq-profile-card');
    if(!card)return;

    const entry=document.createElement('div');
    entry.className='mq-guest-entry';
    entry.innerHTML=`
      <div class="mq-guest-separator"><span>nebo</span></div>
      <button class="mq-guest-button" id="mqPlayAsGuest" type="button">Hrát jako host</button>
      <p class="mq-guest-note">Hra funguje normálně, ale výsledek se neuloží do statistik ani společného žebříčku.</p>
    `;
    card.appendChild(entry);
  }

  function syncChangePlayerButtons(){
    document.querySelectorAll('[data-change-player]').forEach(button=>{
      if(!button.dataset.mqNormalLabel){
        button.dataset.mqNormalLabel=button.textContent||'Změnit hráče';
      }
      button.textContent=guestMode?'Přihlásit se':button.dataset.mqNormalLabel;
    });
  }

  function syncCredits(){
    if(!guestMode)return;
    const name=document.querySelector('#creditsRoll .credit-name');
    if(name)name.textContent='Host';
  }

  function syncGuestUi(){
    document.body.classList.toggle('mq-guest-mode',guestMode);
    installStyles();
    ensureGuestStatusStrip();
    ensureResultNotes();
    injectGuestEntry();
    syncPlayerBadge();
    syncChangePlayerButtons();
    syncCredits();
  }

  function queueUiSync(){
    if(uiSyncQueued)return;
    uiSyncQueued=true;
    queueMicrotask(()=>{
      uiSyncQueued=false;
      syncGuestUi();
    });
  }

  function setGuestMode(value){
    guestMode=Boolean(value);
    lastGuestError=null;
    dispatchGuestState();
    queueUiSync();
    return guestMode;
  }

  async function markCreatedSessionAsGuest(db,originalRpc,startResponse){
    if(!guestMode||startResponse?.error)return startResponse;

    const row=Array.isArray(startResponse?.data)
      ?startResponse.data[0]
      :startResponse?.data;

    const sessionId=row?.session_id||row?.sessionId;

    if(!sessionId){
      const error=createGuestError(
        'Databáze nevrátila identifikátor hostovské hry.',
        null
      );
      lastGuestError=error;
      console.error('Movie Quiz guest mode:',error);
      return {data:null,error};
    }

    const markResponse=await originalRpc(
      'mark_quiz_session_as_guest',
      {p_session_id:sessionId}
    );

    if(markResponse?.error||markResponse?.data!==true){
      const error=createGuestError(
        'Hostovskou hru se nepodařilo bezpečně označit před první otázkou.',
        markResponse?.error||new Error('mark_quiz_session_as_guest returned false')
      );
      lastGuestError=error;
      console.error('Movie Quiz guest mode:',error);
      return {data:null,error};
    }

    const verifyResponse=await originalRpc(
      'get_my_quiz_session_mode',
      {p_session_id:sessionId}
    );

    const mode=normalizeRpcObject(verifyResponse?.data);

    if(
      verifyResponse?.error
      || !mode
      || mode.guestMode!==true
      || mode.statisticsEnabled!==false
    ){
      const error=createGuestError(
        'Databáze nepotvrdila bezpečný hostovský režim.',
        verifyResponse?.error||new Error('Guest mode verification failed')
      );
      lastGuestError=error;
      console.error('Movie Quiz guest mode:',{
        error,
        verification:mode
      });
      return {data:null,error};
    }

    window.dispatchEvent(new CustomEvent('mq:guest-session-ready',{
      detail:{sessionId,guestMode:true,statisticsEnabled:false}
    }));

    return startResponse;
  }

  function patchClient(db){
    if(!db||patchedClients.has(db))return db;

    const originalRpc=db.rpc.bind(db);
    originalRpcByClient.set(db,originalRpc);

    db.rpc=function(fn,args,options){
      const response=originalRpc(fn,args,options);

      if(fn!=='start_quiz_session'){
        return response;
      }

      return Promise.resolve(response).then(result=>
        markCreatedSessionAsGuest(db,originalRpc,result)
      );
    };

    patchedClients.add(db);
    return db;
  }

  async function ensurePatchedClient(){
    const api=onlineApi();
    if(!api?.ensureBackend){
      throw new Error('Online připojení Movie Quiz není připravené.');
    }

    const state=await api.ensureBackend();
    patchClient(state?.client||api.getClient?.());
    return state;
  }

  function proceedToDifficulty(){
    if(typeof window.showView==='function'){
      window.showView('difficulty');
    }
    document.getElementById('screen')?.removeAttribute('data-genre');
    try{window.sound?.('soft')}catch(_){}
  }

  async function enterGuest(button=null){
    if(button){
      button.disabled=true;
      button.dataset.originalText=button.dataset.originalText||button.textContent;
      button.textContent='Připravuji hosta…';
    }

    try{
      const state=await ensurePatchedClient();
      const api=onlineApi();
      const profile=api?.getProfile?.()||state?.profile||null;

      if(profile?.profileId){
        throw new Error('Na tomto zařízení je přihlášený profil. Nejdřív použijte Změnit hráče.');
      }

      setGuestMode(true);
      proceedToDifficulty();
      return true;
    }catch(error){
      lastGuestError=errorSnapshot(error);
      console.error('Movie Quiz: vstup hosta se nepodařilo připravit.',lastGuestError);

      const errorEl=document.getElementById('mqNameError');
      if(errorEl){
        errorEl.textContent='Hostovský režim se nepodařilo připravit. Zkuste to znovu.';
      }
      return false;
    }finally{
      if(button){
        button.disabled=false;
        button.textContent=button.dataset.originalText||'Hrát jako host';
      }
    }
  }

  function leaveGuestToProfile(){
    setGuestMode(false);
    if(typeof window.showView==='function'){
      window.showView('playerView');
    }
    try{window.sound?.('soft')}catch(_){}
  }

  function handleProtectedClick(event){
    if(!guestMode)return false;

    if(
      event.target.closest?.('[data-open-statistics]')
      || event.target.closest?.('[data-open-scoreboard]')
      || event.target.closest?.('#mqIntroScoreboard')
    ){
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }

    if(event.target.closest?.('[data-change-player]')){
      event.preventDefault();
      event.stopImmediatePropagation();
      leaveGuestToProfile();
      return true;
    }

    return false;
  }

  function bindEvents(){
    document.addEventListener('click',async event=>{
      if(handleProtectedClick(event))return;

      const guestButton=event.target.closest?.('#mqPlayAsGuest');
      if(guestButton){
        event.preventDefault();
        event.stopImmediatePropagation();
        await enterGuest(guestButton);
        return;
      }

      if(event.target.closest?.('#mqContinueGuest')){
        event.preventDefault();
        event.stopImmediatePropagation();
        proceedToDifficulty();
        return;
      }

      if(event.target.closest?.('#mqLeaveGuest')){
        event.preventDefault();
        event.stopImmediatePropagation();
        leaveGuestToProfile();
        return;
      }
    },true);

    window.addEventListener('mq:guest-mode-changed',queueUiSync);
    window.addEventListener('mq:server-question-rendered',queueUiSync);

    document.getElementById('homeBtn')?.addEventListener('click',queueUiSync);
    document.getElementById('replayEnd')?.addEventListener('click',queueUiSync);
    document.getElementById('replayWin')?.addEventListener('click',queueUiSync);
  }

  function observeUi(){
    const observer=new MutationObserver(queueUiSync);
    observer.observe(document.body,{
      childList:true,
      subtree:true
    });
  }

  async function init(){
    installStyles();
    ensureGuestStatusStrip();
    ensureResultNotes();
    bindEvents();
    observeUi();

    try{
      await ensurePatchedClient();
    }catch(error){
      console.warn('Movie Quiz guest mode: Supabase klient se zatím nepodařilo připravit.',error);
    }

    syncGuestUi();
  }

  window.__mqGuestMode=false;

  window.MovieQuizGuest=Object.freeze({
    version:VERSION,
    isGuestMode:()=>guestMode,
    enter:()=>enterGuest(),
    leave:leaveGuestToProfile,
    getLastError:()=>lastGuestError?{...lastGuestError}:null
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
