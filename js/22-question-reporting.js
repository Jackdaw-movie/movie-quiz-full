(()=>{
  'use strict';

  const REASONS={
    fact_error:'Faktická chyba',
    multiple_answers:'Více možných správných odpovědí',
    typo:'Překlep nebo špatná formulace',
    wrong_genre:'Nesprávný žánr',
    wrong_difficulty:'Nevhodná obtížnost',
    other:'Jiný problém'
  };

  let activeQuestion=null;
  let submitting=false;

  function onlineApi(){return window.MovieQuizOnline}
  function bankApi(){return window.MovieQuizQuestionBank}

  function installUi(){
    const wrap=document.querySelector('#game .question-wrap');
    if(!wrap||document.getElementById('mqReportQuestion'))return;

    const toolbar=document.createElement('div');
    toolbar.className='mq-report-toolbar';
    toolbar.innerHTML=`<button type="button" class="mq-report-trigger" id="mqReportQuestion" hidden aria-haspopup="dialog" aria-controls="mqReportDialog">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 21V4m0 1h11l-2 4 2 4H6"/></svg>
      <span>Nahlásit otázku</span>
    </button>`;
    wrap.appendChild(toolbar);

    const layer=document.createElement('div');
    layer.className='mq-report-layer';
    layer.id='mqReportLayer';
    layer.hidden=true;
    layer.innerHTML=`<div class="mq-report-backdrop" data-report-close></div>
      <section class="mq-report-dialog" id="mqReportDialog" role="dialog" aria-modal="true" aria-labelledby="mqReportTitle" tabindex="-1">
        <button type="button" class="mq-report-close" data-report-close aria-label="Zavřít">×</button>
        <div class="mq-report-kicker">Kontrola databáze</div>
        <h2 id="mqReportTitle">Nahlásit otázku</h2>
        <p class="mq-report-question" id="mqReportPrompt"></p>
        <form id="mqReportForm">
          <label class="mq-report-label" for="mqReportReason">Co je podle vás špatně?</label>
          <select id="mqReportReason" required>
            <option value="" selected disabled>Vyberte důvod</option>
            ${Object.entries(REASONS).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}
          </select>
          <label class="mq-report-label" for="mqReportNote">Poznámka <small>nepovinná</small></label>
          <textarea id="mqReportNote" maxlength="1000" rows="4" placeholder="Například která odpověď je podle vás správná nebo co je potřeba opravit."></textarea>
          <div class="mq-report-count"><span id="mqReportCount">0</span> / 1000</div>
          <div class="mq-report-message" id="mqReportMessage" role="status" aria-live="polite"></div>
          <div class="mq-report-actions">
            <button type="button" class="mq-report-cancel" data-report-close>Zrušit</button>
            <button type="submit" class="mq-report-submit" id="mqReportSubmit">Odeslat hlášení</button>
          </div>
        </form>
      </section>`;
    document.body.appendChild(layer);

    document.getElementById('mqReportQuestion')?.addEventListener('click',openDialog);
    document.getElementById('mqReportForm')?.addEventListener('submit',submitReport);
    document.getElementById('mqReportNote')?.addEventListener('input',updateCount);
    layer.addEventListener('click',event=>{
      if(event.target.closest?.('[data-report-close]'))closeDialog();
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!layer.hidden)closeDialog();
    });
  }

  function trigger(){return document.getElementById('mqReportQuestion')}
  function layer(){return document.getElementById('mqReportLayer')}
  function dialog(){return document.getElementById('mqReportDialog')}
  function reason(){return document.getElementById('mqReportReason')}
  function note(){return document.getElementById('mqReportNote')}
  function message(){return document.getElementById('mqReportMessage')}
  function submitButton(){return document.getElementById('mqReportSubmit')}

  function showTrigger(question){
    activeQuestion=question||bankApi()?.getCurrentQuestion?.()||null;
    const button=trigger();
    if(!button)return;
    const valid=Boolean(activeQuestion?.sessionId&&activeQuestion?.questionId&&bankApi()?.isServerMode?.());
    button.hidden=!valid;
    button.disabled=!valid;
    button.classList.remove('is-reported');
    button.querySelector('span').textContent='Nahlásit otázku';
  }

  function hideTrigger(){
    activeQuestion=null;
    const button=trigger();
    if(button)button.hidden=true;
    closeDialog();
  }

  function updateCount(){
    const count=document.getElementById('mqReportCount');
    if(count)count.textContent=String(note()?.value.length||0);
  }

  function setMessage(text,type=''){
    const box=message();
    if(!box)return;
    box.textContent=text||'';
    box.dataset.type=type;
  }

  function setSubmitting(value){
    submitting=Boolean(value);
    const button=submitButton();
    if(button){
      button.disabled=submitting;
      button.textContent=submitting?'Odesílám…':'Odeslat hlášení';
    }
    const select=reason();
    const textarea=note();
    if(select)select.disabled=submitting;
    if(textarea)textarea.disabled=submitting;
  }

  async function loadExistingReport(){
    if(!activeQuestion)return;
    try{
      const api=onlineApi();
      const {client:db}=await api.ensureBackend();
      const {data,error}=await db.rpc('get_my_question_report',{
        p_session_id:activeQuestion.sessionId,
        p_question_id:activeQuestion.questionId
      });
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;
      if(!row)return;
      if(reason())reason().value=row.reason||'';
      if(note())note().value=row.note||'';
      updateCount();
      const button=submitButton();
      if(button)button.textContent='Aktualizovat hlášení';
      setMessage('Tuto otázku jste už nahlásili. Hlášení můžete upravit.','info');
    }catch(error){
      console.warn('Movie Quiz: existující hlášení se nepodařilo načíst.',error);
    }
  }

  function openDialog(){
    if(!activeQuestion)activeQuestion=bankApi()?.getCurrentQuestion?.()||null;
    if(!activeQuestion?.sessionId||!activeQuestion?.questionId)return;
    const overlay=layer();
    if(!overlay)return;
    if(reason())reason().value='';
    if(note())note().value='';
    updateCount();
    setMessage('');
    setSubmitting(false);
    const prompt=document.getElementById('mqReportPrompt');
    if(prompt)prompt.textContent=activeQuestion.prompt||'Aktuální filmová otázka';
    overlay.hidden=false;
    document.body.classList.add('mq-report-open');
    requestAnimationFrame(()=>dialog()?.focus());
    loadExistingReport();
  }

  function closeDialog(){
    if(submitting)return;
    const overlay=layer();
    if(overlay)overlay.hidden=true;
    document.body.classList.remove('mq-report-open');
    trigger()?.focus?.({preventScroll:true});
  }

  async function submitReport(event){
    event.preventDefault();
    if(submitting||!activeQuestion)return;
    const selectedReason=reason()?.value||'';
    if(!selectedReason){
      setMessage('Nejprve vyberte důvod nahlášení.','error');
      reason()?.focus();
      return;
    }
    setSubmitting(true);
    setMessage('Odesílám hlášení…','info');
    try{
      const api=onlineApi();
      if(!api?.ensureBackend)throw new Error('Online připojení není připravené.');
      const {client:db}=await api.ensureBackend();
      const {data,error}=await db.rpc('report_quiz_question',{
        p_session_id:activeQuestion.sessionId,
        p_question_id:activeQuestion.questionId,
        p_reason:selectedReason,
        p_note:note()?.value.trim()||null
      });
      if(error)throw error;
      const row=Array.isArray(data)?data[0]:data;
      if(!row?.report_id)throw new Error('Databáze nepotvrdila uložení hlášení.');
      setMessage('Děkujeme. Hlášení bylo uloženo k této otázce.','success');
      const button=trigger();
      if(button){
        button.classList.add('is-reported');
        button.querySelector('span').textContent='Otázka nahlášena';
      }
      const submit=submitButton();
      if(submit)submit.textContent='Uloženo';
      setTimeout(()=>{
        setSubmitting(false);
        closeDialog();
      },1100);
    }catch(error){
      console.error('Movie Quiz: hlášení otázky se nepodařilo uložit.',error);
      setSubmitting(false);
      setMessage(String(error?.message||'Hlášení se nepodařilo uložit. Zkuste to znovu.'),'error');
    }
  }

  installUi();
  window.addEventListener('mq:server-question-rendered',event=>showTrigger(event.detail));
  window.addEventListener('mq:server-question-cleared',hideTrigger);
  document.getElementById('homeBtn')?.addEventListener('click',hideTrigger);
  ['replayEnd','replayWin','creditsSkip'].forEach(id=>document.getElementById(id)?.addEventListener('click',hideTrigger));

  window.MovieQuizReporting=Object.freeze({
    version:'v1',
    open:openDialog,
    close:closeDialog,
    getActiveQuestion:()=>activeQuestion?{...activeQuestion}:null
  });
})();
