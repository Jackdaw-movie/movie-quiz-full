(()=>{
  'use strict';

  const SUPABASE_URL='https://ymfaskxcgtgflhnjoylz.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_NpNQJqorFyNgiTQ4GahgtQ__UmulD3Y';
  const ADMIN_EMAIL='kafkatomas13@gmail.com';
  const PAGE_LIMIT=100;

  const STATUS_LABELS={
    new:'Nové',
    reviewing:'Kontroluji',
    resolved:'Vyřešené',
    dismissed:'Zamítnuté'
  };
  const REASON_LABELS={
    fact_error:'Faktická chyba',
    multiple_answers:'Více správných odpovědí',
    typo:'Překlep nebo formulace',
    wrong_genre:'Špatný žánr',
    wrong_difficulty:'Špatná obtížnost',
    other:'Jiný důvod'
  };
  const GENRE_LABELS={
    comedy:'Komedie',
    fantasy:'Fantasy',
    scifi:'Sci-fi',
    horror:'Horor',
    crime:'Krimi a thriller',
    animation:'Animace'
  };
  const ACTION_LABELS={
    update_question_reports:'Změna stavu hlášení',
    activate_question:'Aktivace otázky',
    deactivate_question:'Deaktivace otázky'
  };

  let db=null;
  let selectedQuestionId='';
  let latestDetail=null;
  let toastTimer=null;

  const $=selector=>document.querySelector(selector);
  const $$=selector=>Array.from(document.querySelectorAll(selector));

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[char]);
  }

  function normalizeRpcObject(data){
    let value=Array.isArray(data)?data[0]:data;
    if(typeof value==='string'){
      try{value=JSON.parse(value)}catch(_){return null}
    }
    return value&&typeof value==='object'?value:null;
  }

  function number(value){
    const parsed=Number(value);
    return Number.isFinite(parsed)?parsed:0;
  }

  function formatDate(value){
    if(!value)return 'Neuvedeno';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return 'Neznámé datum';
    return new Intl.DateTimeFormat('cs-CZ',{
      day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'
    }).format(date);
  }

  function errorMessage(error){
    const raw=[error?.message,error?.details,error?.hint].filter(Boolean).join(' · ')||String(error||'Neznámá chyba');
    if(/Invalid login credentials/i.test(raw))return 'E-mail nebo heslo nejsou správné, případně účet ještě nebyl vytvořený v Supabase Authentication.';
    if(/Administrator access is required|42501/i.test(raw))return 'Tento přihlášený účet nemá administrátorské oprávnění pro Movie Quiz.';
    if(/Failed to fetch|NetworkError|Load failed/i.test(raw))return 'Nepodařilo se spojit se Supabase. Zkontrolujte internetové připojení.';
    return raw;
  }

  function showToast(message,type='success'){
    const toast=$('#adminToast');
    if(!toast)return;
    toast.textContent=message;
    toast.className=`admin-toast show${type==='error'?' error':''}`;
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.className='admin-toast',2800);
  }

  function setLoginError(message=''){
    const alert=$('#adminLoginError');
    if(!alert)return;
    alert.textContent=message;
    alert.hidden=!message;
  }

  function setSignupMessage(message=''){
    const alert=$('#adminSignupMessage');
    if(!alert)return;
    alert.textContent=message;
    alert.hidden=!message;
  }

  function showSignupMode(show){
    $('#adminLoginMode').hidden=!!show;
    $('#adminSignupMode').hidden=!show;
    setLoginError('');
    setSignupMessage('');
    setTimeout(()=>{
      (show?$('#adminSignupPassword'):$('#adminPassword'))?.focus();
    },50);
  }

  function setView(authenticated){
    $('#adminLogin').hidden=authenticated;
    $('#adminDashboard').hidden=!authenticated;
    $('#adminSession').hidden=!authenticated;
  }

  function setBusy(button,busy,text){
    if(!button)return;
    if(!button.dataset.defaultText)button.dataset.defaultText=button.textContent;
    button.disabled=busy;
    button.textContent=busy?text:button.dataset.defaultText;
  }

  function filters(){
    const difficulty=$('#filterDifficulty').value;
    return {
      p_status:$('#filterStatus').value||'all',
      p_reason:$('#filterReason').value||'all',
      p_genre:$('#filterGenre').value||'all',
      p_difficulty:difficulty?Number(difficulty):null,
      p_search:$('#filterSearch').value.trim()||null,
      p_limit:PAGE_LIMIT,
      p_offset:0
    };
  }

  async function verifyAdmin(){
    const {data,error}=await db.rpc('admin_get_session');
    if(error)throw error;
    const session=normalizeRpcObject(data);
    if(!session?.ok)throw new Error('Administrátorská relace nebyla ověřena.');
    $('#adminSessionName').textContent=session.displayName||session.email||ADMIN_EMAIL;
    setView(true);
    await loadDashboard();
  }

  async function login(email,password){
    setLoginError('');
    const button=$('#adminLoginButton');
    setBusy(button,true,'Přihlašuji…');
    try{
      const {error}=await db.auth.signInWithPassword({
        email:String(email||'').trim(),
        password:String(password||'')
      });
      if(error)throw error;
      await verifyAdmin();
      $('#adminPassword').value='';
    }catch(error){
      await db.auth.signOut({scope:'local'}).catch(()=>{});
      setView(false);
      setLoginError(errorMessage(error));
    }finally{
      setBusy(button,false,'Přihlašuji…');
    }
  }

  async function signup(password,passwordConfirmation){
    setLoginError('');
    setSignupMessage('');
    if(String(password||'').length<8){
      setLoginError('Heslo musí mít alespoň 8 znaků.');
      return;
    }
    if(password!==passwordConfirmation){
      setLoginError('Obě hesla se musí shodovat.');
      return;
    }
    const button=$('#adminSignupButton');
    setBusy(button,true,'Vytvářím…');
    try{
      const redirectTo=`${location.origin}${location.pathname}`;
      const {data,error}=await db.auth.signUp({
        email:ADMIN_EMAIL,
        password:String(password),
        options:{emailRedirectTo:redirectTo}
      });
      if(error)throw error;
      if(data?.session){
        await verifyAdmin();
        $('#adminSignupPassword').value='';
        $('#adminSignupPasswordConfirm').value='';
        return;
      }
      showSignupMode(false);
      setSignupMessage('Účet byl založen. V e-mailu potvrďte registraci a potom se zde přihlaste zvoleným heslem.');
    }catch(error){
      const message=errorMessage(error);
      if(/already registered|already exists/i.test(String(error?.message||''))){
        showSignupMode(false);
        setLoginError('Účet už existuje. Přihlaste se svým heslem.');
      }else{
        setLoginError(message);
      }
    }finally{
      setBusy(button,false,'Vytvářím…');
    }
  }

  async function logout(){
    closeDetail();
    await db.auth.signOut({scope:'local'});
    setView(false);
    setLoginError('');
    $('#adminPassword').value='';
  }

  async function loadDashboard(){
    const refresh=$('#adminRefresh');
    setBusy(refresh,true,'Načítám…');
    $('#adminReportList').innerHTML='<div class="admin-loading"><span></span><strong>Načítám hlášení</strong></div>';
    $('#adminAuditList').innerHTML='<div class="admin-loading admin-loading-small"><span></span><strong>Načítám audit</strong></div>';
    try{
      const [summaryResult,reportsResult,auditResult]=await Promise.all([
        db.rpc('admin_get_report_summary'),
        db.rpc('admin_list_question_reports',filters()),
        db.rpc('admin_get_recent_audit',{p_limit:30})
      ]);
      if(summaryResult.error)throw summaryResult.error;
      if(reportsResult.error)throw reportsResult.error;
      if(auditResult.error)throw auditResult.error;
      renderSummary(normalizeRpcObject(summaryResult.data)||{});
      renderReports(Array.isArray(reportsResult.data)?reportsResult.data:[]);
      renderAudit(Array.isArray(auditResult.data)?auditResult.data:[]);
    }catch(error){
      const message=errorMessage(error);
      $('#adminReportList').innerHTML=`<div class="admin-empty"><strong>Data se nepodařilo načíst</strong>${escapeHtml(message)}</div>`;
      $('#adminAuditList').innerHTML=`<div class="admin-empty"><strong>Audit není dostupný</strong>${escapeHtml(message)}</div>`;
      showToast(message,'error');
    }finally{
      setBusy(refresh,false,'Načítám…');
    }
  }

  function renderSummary(summary){
    const cards=[
      ['Celkem hlášení',summary.totalReports,'Všechna odeslaná hlášení','total'],
      ['Nahlášené otázky',summary.reportedQuestions,'Unikátní otázky','questions'],
      ['Nové',summary.new,'Čekají na kontrolu','new'],
      ['Kontroluji',summary.reviewing,'Právě řešené','reviewing'],
      ['Vyřešené',summary.resolved,'Uzavřené opravou','resolved'],
      ['Zamítnuté',summary.dismissed,'Bez nutnosti opravy','dismissed']
    ];
    $('#adminSummary').innerHTML=cards.map(([label,value,note,tone])=>`
      <article class="admin-summary-card" data-tone="${tone}">
        <span>${escapeHtml(label)}</span>
        <strong>${number(value).toLocaleString('cs-CZ')}</strong>
        <small>${escapeHtml(note)}</small>
      </article>
    `).join('');
  }

  function renderReports(rows){
    $('#adminReportCount').textContent=`Zobrazeno ${rows.length} ${rows.length===1?'otázka':rows.length>=2&&rows.length<=4?'otázky':'otázek'}`;
    if(!rows.length){
      $('#adminReportList').innerHTML='<div class="admin-empty"><strong>Žádné odpovídající hlášení</strong>Změňte filtry nebo počkejte na další hlášení od hráčů.</div>';
      return;
    }
    $('#adminReportList').innerHTML=rows.map(row=>{
      const status=row.latest_status||'new';
      const reportCount=number(row.report_count);
      const note=row.latest_note?`<p class="admin-report-note">${escapeHtml(row.latest_note)}</p>`:'';
      return `
        <article class="admin-report-card" data-question-id="${escapeHtml(row.question_id)}" tabindex="0" role="button" aria-label="Otevřít detail otázky">
          <div class="admin-report-main">
            <div class="admin-report-meta">
              <span class="admin-badge" data-status="${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[status]||status)}</span>
              <span class="admin-badge">${escapeHtml(GENRE_LABELS[row.genre]||row.genre||'Žánr')}</span>
              <span class="admin-badge">${escapeHtml(row.difficulty_label||'Obtížnost')}</span>
              <span class="admin-badge" data-active="${row.question_active?'true':'false'}">${row.question_active?'Aktivní otázka':'Deaktivovaná'}</span>
            </div>
            <h3>${escapeHtml(row.prompt)}</h3>
            <div class="admin-report-sub">
              <span>${escapeHtml(row.movie_title||'Film neuveden')}${row.movie_year?` (${escapeHtml(row.movie_year)})`:''}</span>
              <span>${escapeHtml(row.type_label||row.question_type||'Typ neuveden')}</span>
              <span>${escapeHtml(REASON_LABELS[row.latest_reason]||row.latest_reason||'Důvod neuveden')}</span>
              <span>${escapeHtml(formatDate(row.latest_report_at))}</span>
            </div>
            ${note}
          </div>
          <div class="admin-report-count">
            <strong>${reportCount}</strong>
            <small>${reportCount===1?'hlášení':'hlášení'}</small>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderAudit(rows){
    if(!rows.length){
      $('#adminAuditList').innerHTML='<div class="admin-empty"><strong>Zatím bez změn</strong>První administrátorský zásah se zobrazí zde.</div>';
      return;
    }
    $('#adminAuditList').innerHTML=rows.map(row=>{
      const active=row.new_values?.active;
      const status=row.new_values?.status;
      const detail=status?`Nový stav: ${STATUS_LABELS[status]||status}`:active===true?'Otázka byla aktivována':active===false?'Otázka byla deaktivována':'';
      return `
        <article class="admin-audit-item">
          <strong>${escapeHtml(ACTION_LABELS[row.action]||row.action)}</strong>
          <span>${escapeHtml(detail||'Změna byla zaznamenána')}</span>
          <small>${escapeHtml(formatDate(row.created_at))} · ${escapeHtml(row.admin_email||'Administrátor')}</small>
        </article>
      `;
    }).join('');
  }

  async function openDetail(questionId){
    selectedQuestionId=questionId;
    latestDetail=null;
    const modal=$('#adminDetailModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    $('#adminDetailBody').innerHTML='<div class="admin-loading"><span></span><strong>Načítám detail otázky</strong></div>';
    try{
      const {data,error}=await db.rpc('admin_get_question_report_detail',{p_question_id:questionId});
      if(error)throw error;
      const detail=normalizeRpcObject(data);
      if(!detail?.question)throw new Error('Databáze nevrátila detail otázky.');
      latestDetail=detail;
      renderDetail(detail);
    }catch(error){
      $('#adminDetailBody').innerHTML=`<div class="admin-empty"><strong>Detail se nepodařilo načíst</strong>${escapeHtml(errorMessage(error))}</div>`;
    }
  }

  function closeDetail(){
    const modal=$('#adminDetailModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    selectedQuestionId='';
    latestDetail=null;
  }

  function sourceLinks(question){
    const links=[
      ['Hlavní zdroj',question.sourceUrl],
      ['Druhý zdroj',question.secondarySourceUrl],
      ['Zdroj žánru',question.genreSourceUrl]
    ].filter(([,url])=>url);
    if(!links.length)return '<span class="admin-badge">Zdroj není uložený</span>';
    return links.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`).join('');
  }

  function renderDetail(detail){
    const q=detail.question;
    const reports=Array.isArray(detail.reports)?detail.reports:[];
    const options=Array.isArray(detail.options)?detail.options:[];
    const currentStatus=reports[0]?.status||'new';
    const currentResolution=reports.find(report=>report.resolutionNote)?.resolutionNote||'';
    $('#adminDetailTitle').textContent=q.movieTitle?`${q.movieTitle}${q.movieYear?` (${q.movieYear})`:''}`:'Nahlášená otázka';

    $('#adminDetailBody').innerHTML=`
      <section class="admin-detail-section">
        <div class="admin-detail-meta">
          <span class="admin-badge" data-active="${q.active?'true':'false'}">${q.active?'Aktivní otázka':'Deaktivovaná otázka'}</span>
          <span class="admin-badge">${escapeHtml(GENRE_LABELS[q.genre]||q.genre||'Žánr')}</span>
          <span class="admin-badge">${escapeHtml(['','Lehká','Střední','Těžká'][number(q.difficulty)]||'Obtížnost')}</span>
          <span class="admin-badge">${escapeHtml(q.typeLabel||q.questionType||'Typ')}</span>
        </div>
        <div class="admin-detail-question">${escapeHtml(q.prompt)}</div>
      </section>

      <section class="admin-detail-section">
        <h3>Odpovědi</h3>
        <div class="admin-options">
          ${options.map((option,index)=>`
            <div class="admin-option${option.isCorrect?' correct':''}">
              <span class="admin-option-index">${String.fromCharCode(65+index)}</span>
              <span>${escapeHtml(option.text)}${option.isCorrect?' <strong>· správná odpověď</strong>':''}</span>
            </div>
          `).join('')||'<div class="admin-empty">Odpovědi nejsou dostupné.</div>'}
        </div>
      </section>

      <section class="admin-detail-section">
        <h3>Informace o otázce</h3>
        <div class="admin-detail-grid">
          <div class="admin-detail-data"><span>Interní ID</span><strong>${escapeHtml(q.externalId||q.id)}</strong></div>
          <div class="admin-detail-data"><span>Film</span><strong>${escapeHtml(q.movieTitle||'Neuveden')}${q.movieYear?` (${escapeHtml(q.movieYear)})`:''}</strong></div>
          <div class="admin-detail-data"><span>Stav redakce</span><strong>${escapeHtml(q.reviewStatus||'Neuveden')}</strong></div>
          <div class="admin-detail-data"><span>Verze banky</span><strong>${escapeHtml(q.questionBankVersion||'Neuvedena')}</strong></div>
          <div class="admin-detail-data"><span>Vytvořeno</span><strong>${escapeHtml(formatDate(q.createdAt))}</strong></div>
          <div class="admin-detail-data"><span>Poslední změna</span><strong>${escapeHtml(formatDate(q.updatedAt))}</strong></div>
        </div>
        ${q.explanation?`<p class="admin-report-note">${escapeHtml(q.explanation)}</p>`:''}
        <div class="admin-source-links">${sourceLinks(q)}</div>
      </section>

      <section class="admin-detail-section">
        <h3>Hlášení hráčů (${reports.length})</h3>
        <div class="admin-report-detail-list">
          ${reports.map(report=>`
            <article class="admin-report-detail">
              <div class="admin-report-detail-head">
                <span class="admin-badge" data-status="${escapeHtml(report.status)}">${escapeHtml(STATUS_LABELS[report.status]||report.status)}</span>
                <span class="admin-badge">${escapeHtml(REASON_LABELS[report.reason]||report.reason)}</span>
              </div>
              <p>${escapeHtml(report.note||'Hráč nepřidal vlastní poznámku.')}</p>
              ${report.resolutionNote?`<p class="admin-report-note"><strong>Interní poznámka:</strong> ${escapeHtml(report.resolutionNote)}</p>`:''}
              <small>${escapeHtml(report.playerNickname||'Neznámý hráč')} · ${escapeHtml(formatDate(report.createdAt))}</small>
            </article>
          `).join('')||'<div class="admin-empty">Hlášení nejsou dostupná.</div>'}
        </div>
      </section>

      <section class="admin-detail-section">
        <h3>Vyřešení hlášení</h3>
        <div class="admin-resolution-form">
          <label>
            <span class="admin-form-caption">Interní poznámka</span>
            <textarea id="adminResolutionNote" maxlength="2000" placeholder="Například: Ověřeno podle zdroje, odpověď je správná. Změněna formulace otázky.">${escapeHtml(currentResolution)}</textarea>
          </label>
          <div class="admin-status-buttons" data-current-status="${escapeHtml(currentStatus)}">
            <button class="admin-status-button" type="button" data-set-status="new">Vrátit mezi nové</button>
            <button class="admin-status-button" type="button" data-set-status="reviewing">Označit: kontroluji</button>
            <button class="admin-status-button" type="button" data-set-status="resolved">Označit: vyřešeno</button>
            <button class="admin-status-button" type="button" data-set-status="dismissed">Označit: zamítnuto</button>
          </div>
        </div>
      </section>

      <section class="admin-detail-section">
        <h3>Dostupnost otázky ve hře</h3>
        <p class="admin-profile-subtitle">Deaktivovaná otázka se přestane vybírat do nových her. Zůstane ale v databázi, historii a administraci.</p>
        <div class="admin-question-actions">
          ${q.active
            ?'<button class="admin-button admin-button-danger" id="adminToggleQuestion" data-next-active="false" type="button">Deaktivovat otázku</button>'
            :'<button class="admin-button admin-button-success" id="adminToggleQuestion" data-next-active="true" type="button">Znovu aktivovat otázku</button>'}
        </div>
      </section>
    `;
  }

  async function updateStatus(status,button){
    if(!selectedQuestionId)return;
    const note=$('#adminResolutionNote')?.value.trim()||null;
    setBusy(button,true,'Ukládám…');
    try{
      const {data,error}=await db.rpc('admin_update_question_reports',{
        p_question_id:selectedQuestionId,
        p_status:status,
        p_resolution_note:note
      });
      if(error)throw error;
      const result=normalizeRpcObject(data);
      showToast(`Stav byl změněn na „${STATUS_LABELS[status]||status}“ pro ${number(result?.updatedCount)} hlášení.`);
      await Promise.all([openDetail(selectedQuestionId),loadDashboard()]);
    }catch(error){
      showToast(errorMessage(error),'error');
    }finally{
      setBusy(button,false,'Ukládám…');
    }
  }

  async function toggleQuestion(button){
    if(!selectedQuestionId||!latestDetail?.question)return;
    const nextActive=button.dataset.nextActive==='true';
    const action=nextActive?'znovu aktivovat':'deaktivovat';
    const confirmed=confirm(`Opravdu chcete otázku ${action}?`);
    if(!confirmed)return;
    const note=$('#adminResolutionNote')?.value.trim()||`${nextActive?'Aktivováno':'Deaktivováno'} v administraci nahlášených otázek.`;
    setBusy(button,true,nextActive?'Aktivuji…':'Deaktivuji…');
    try{
      const {error}=await db.rpc('admin_set_question_active',{
        p_question_id:selectedQuestionId,
        p_active:nextActive,
        p_reason:note
      });
      if(error)throw error;
      showToast(nextActive?'Otázka byla znovu aktivována.':'Otázka byla deaktivována a nebude se vybírat do nových her.');
      await Promise.all([openDetail(selectedQuestionId),loadDashboard()]);
    }catch(error){
      showToast(errorMessage(error),'error');
    }finally{
      setBusy(button,false,nextActive?'Aktivuji…':'Deaktivuji…');
    }
  }

  function clearFilters(){
    $('#filterSearch').value='';
    $('#filterStatus').value='all';
    $('#filterReason').value='all';
    $('#filterGenre').value='all';
    $('#filterDifficulty').value='';
    loadDashboard();
  }

  function bindEvents(){
    $('#adminLoginForm').addEventListener('submit',event=>{
      event.preventDefault();
      login($('#adminEmail').value,$('#adminPassword').value);
    });
    $('#adminSignupForm').addEventListener('submit',event=>{
      event.preventDefault();
      signup($('#adminSignupPassword').value,$('#adminSignupPasswordConfirm').value);
    });
    $('#adminOpenSignup').addEventListener('click',()=>showSignupMode(true));
    $('#adminBackToLogin').addEventListener('click',()=>showSignupMode(false));
    $('#adminLogout').addEventListener('click',logout);
    $('#adminRefresh').addEventListener('click',loadDashboard);
    $('#adminFilterForm').addEventListener('submit',event=>{
      event.preventDefault();
      loadDashboard();
    });
    $('#adminClearFilters').addEventListener('click',clearFilters);

    document.addEventListener('click',event=>{
      const card=event.target.closest('.admin-report-card');
      if(card){openDetail(card.dataset.questionId);return}
      if(event.target.closest('[data-close-detail]')){closeDetail();return}
      const statusButton=event.target.closest('[data-set-status]');
      if(statusButton){updateStatus(statusButton.dataset.setStatus,statusButton);return}
      const toggle=event.target.closest('#adminToggleQuestion');
      if(toggle){toggleQuestion(toggle)}
    });

    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&$('#adminDetailModal').classList.contains('open'))closeDetail();
      if((event.key==='Enter'||event.key===' ')&&event.target.classList.contains('admin-report-card')){
        event.preventDefault();
        openDetail(event.target.dataset.questionId);
      }
    });
  }

  async function init(){
    if(!window.supabase?.createClient){
      setLoginError('Nepodařilo se načíst knihovnu Supabase.');
      return;
    }
    db=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{
        storageKey:'movie-quiz-admin-auth-v1',
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:true
      }
    });
    bindEvents();
    $('#adminEmail').value=ADMIN_EMAIL;
    $('#adminSignupEmail').value=ADMIN_EMAIL;
    showSignupMode(false);

    const {data,error}=await db.auth.getSession();
    if(error){
      setLoginError(errorMessage(error));
      return;
    }
    if(data?.session){
      try{
        await verifyAdmin();
      }catch(error){
        await db.auth.signOut({scope:'local'}).catch(()=>{});
        setView(false);
        setLoginError(errorMessage(error));
      }
    }else{
      setView(false);
    }
  }

  init();
})();
