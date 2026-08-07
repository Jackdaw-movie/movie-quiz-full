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

  const VERSION='guest-mode-v1.3-tooltip';
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
      body.mq-guest-mode #mqPlayerBadge{
        position:relative;
        overflow:visible;
      }
      .mq-guest-info{
        position:relative;
        display:inline-grid;
        place-items:center;
        width:18px;
        height:18px;
        margin-left:6px;
        padding:0;
        border:1px solid rgba(255,224,138,.60);
        border-radius:50%;
        background:rgba(255,205,72,.12);
        color:#ffe08a;
        cursor:help;
        font:800 11px/1 inherit;
        vertical-align:middle;
      }
      .mq-guest-info-tooltip{
        position:absolute;
        top:calc(100% + 9px);
        left:50%;
        z-index:120;
        width:max-content;
        max-width:min(300px,calc(100vw - 32px));
        padding:9px 11px;
        border:1px solid rgba(255,224,138,.42);
        border-radius:9px;
        background:rgba(12,12,12,.96);
        color:#f6e5ae;
        box-shadow:0 10px 28px rgba(0,0,0,.30);
        font-size:10px;
        font-weight:700;
        line-height:1.45;
        text-align:left;
        white-space:normal;
        opacity:0;
        visibility:hidden;
        transform:translate(-50%,-3px);
        pointer-events:none;
        transition:opacity .14s ease,transform .14s ease,visibility .14s ease;
      }
      .mq-guest-info:hover .mq-guest-info-tooltip,
      .mq-guest-info:focus .mq-guest-info-tooltip,
      .mq-guest-info:focus-visible .mq-guest-info-tooltip{
        opacity:1;
        visibility:visible;
        transform:translate(-50%,0);
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
        .mq-guest-info-tooltip{
          left:auto;
          right:-10px;
          transform:translateY(-3px);
        }
        .mq-guest-info:hover .mq-guest-info-tooltip,
        .mq-guest-info:focus .mq-guest-info-tooltip,
        .mq-guest-info:focus-visible .mq-guest-info-tooltip{
          transform:translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
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

  function setTextIfChanged(element,value){
    if(!element)return;
    const next=String(value??'');
    if(element.textContent!==next)element.textContent=next;
  }

  function syncPlayerBadge(){
    const badge=document.getElementById('mqPlayerBadge');
    const name=document.getElementById('mqPlayerBadgeName');
    if(!badge||!name)return;

    const label=badge.querySelector('span');

    if(guestMode){
      setTextIfChanged(label,'Režim');
      setTextIfChanged(name,'Host');
      badge.classList.add('visible');

      if(!badge.querySelector('.mq-guest-info')){
        const info=document.createElement('button');
        info.type='button';
        info.className='mq-guest-info';
        info.setAttribute('aria-label','Informace o režimu hosta');
        info.innerHTML=`i<span class="mq-guest-info-tooltip" role="tooltip">Hrajete jako Host · Výsledek se neuloží do statistik ani společného žebříčku.</span>`;
        badge.appendChild(info);
      }
      return;
    }

    badge.querySelector('.mq-guest-info')?.remove();
    setTextIfChanged(label,'Hráč');
    const playerName=onlineApi()?.getPlayerName?.()||'';
    setTextIfChanged(name,playerName);
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
      setTextIfChanged(
        button,
        guestMode?'Přihlásit se':button.dataset.mqNormalLabel
      );
    });
  }

  function syncCredits(){
    if(!guestMode)return;
    const name=document.querySelector('#creditsRoll .credit-name');
    setTextIfChanged(name,'Host');
  }

  function syncGuestUi(){
    document.body.classList.toggle('mq-guest-mode',guestMode);
    installStyles();
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
    const shell=document.getElementById('mqProfileShell');
    if(!shell)return;

    let observerBusy=false;

    const observer=new MutationObserver(mutations=>{
      if(observerBusy)return;

      const relevant=mutations.some(mutation=>{
        if(mutation.type!=='childList')return false;

        return Array.from(mutation.addedNodes).some(node=>{
          if(!(node instanceof Element))return false;
          return (
            node.matches?.('.mq-profile-card,[data-mq-guest-current]')
            || node.querySelector?.('.mq-profile-card,[data-mq-guest-current]')
          );
        });
      });

      if(!relevant)return;

      observerBusy=true;
      queueMicrotask(()=>{
        try{
          injectGuestEntry();
        }finally{
          observerBusy=false;
        }
      });
    });

    observer.observe(shell,{
      childList:true,
      subtree:true
    });
  }

  async function init(){
    installStyles();
    ensureResultNotes();
    bindEvents();
    syncGuestUi();
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
