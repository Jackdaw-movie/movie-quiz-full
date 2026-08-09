(()=>{
  'use strict';
  const VERSION='ticket-login-v4.0-facade';
  const layer=document.getElementById('mqTicketLayer');
  const mount=document.getElementById('mqTicketProfileMount');
  const shell=document.getElementById('mqProfileShell');
  const errorSource=document.getElementById('mqNameError');
  const errorMirror=document.getElementById('mqTicketError');
  const onlineSource=document.getElementById('mqOnlineStatus');
  const onlineMark=document.getElementById('mqTicketOnlineMark');
  const tooltip=document.getElementById('mqTicketTooltip');
  const ticket=document.getElementById('mqAdmitTicket');
  if(!layer||!mount||!shell||!ticket)return;

  let facade=document.getElementById('mqTicketFacade');
  if(!facade){
    facade=document.createElement('div');
    facade.className='mq-ticket-facade';
    facade.id='mqTicketFacade';
    ticket.appendChild(facade);
  }

  let queued=false;
  let tipAnchor=null;
  const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const digits=v=>String(v||'').replace(/\D/g,'').slice(0,6);

  function state(){
    if(shell.querySelector('[data-mq-guest-current],#mqContinueGuest'))return 'guest';
    if(shell.querySelector('#mqCheckNameForm'))return 'name';
    if(shell.querySelector('#mqLoginForm'))return 'login';
    if(shell.querySelector('#mqRegisterForm'))return 'register';
    if(shell.querySelector('#mqRecoverForm'))return 'recovery';
    if(shell.querySelector('#mqRecoveryCodeValue,#mqRecoveryDone'))return 'reveal';
    if(shell.querySelector('#mqContinueProfile'))return 'linked';
    return 'unknown';
  }
  function originalTitle(){return clean(shell.querySelector('.mq-profile-title')?.textContent)}
  function contextName(s){
    const t=originalTitle();
    if(s==='login')return clean(t.match(/^Jméno\s+(.+?)\s+už existuje/i)?.[1]);
    if(s==='register')return clean(t.match(/^Vytvořit profil\s+(.+)$/i)?.[1]);
    if(s==='recovery')return clean(t.match(/^Obnova profilu\s+(.+)$/i)?.[1]);
    if(s==='linked')return clean(t.match(/^Vítej zpět,\s*(.+?)\.?$/i)?.[1]);
    const chip=[...shell.querySelectorAll('.mq-profile-chip-soft')].map(n=>clean(n.textContent)).find(t=>/^Jméno:/i.test(t));
    return clean(chip?.replace(/^Jméno:\s*/i,''));
  }
  function hint(){
    const texts=[...shell.querySelectorAll('.mq-profile-subtitle,.mq-profile-hint,.mq-guest-note')].map(n=>clean(n.textContent)).filter(Boolean);
    return [...new Set(texts)].join(' ');
  }
  function tip(text,label='Více informací'){
    if(!text)return '';
    return `<button type="button" class="mqf-tip" data-tip="${esc(text)}" aria-label="${esc(label)}"><span>?</span></button>`;
  }
  function actual(sel){return shell.querySelector(sel)||document.querySelector(sel)}
  function val(id){return document.getElementById(id)?.value||''}
  function disabled(sel){return Boolean(actual(sel)?.disabled)}
  function workingLabel(sel,fallback){
    const b=actual(sel);return b?.disabled?clean(b.textContent)||fallback:fallback;
  }
  function field(id,placeholder='',cls=''){
    return `<input class="mqf-field ${cls}" data-source-input="${id}" value="${esc(val(id))}" placeholder="${esc(placeholder)}" autocomplete="off">`;
  }
  function pin(id,compact=false){
    const v=digits(val(id));
    const boxes=Array.from({length:6},(_,i)=>`<i class="mqf-pin-box${i<v.length?' filled':''}"></i>`).join('');
    return `<div class="mqf-pin${compact?' compact':''}" data-pin-source="${id}"><input class="mqf-pin-capture" data-source-input="${id}" inputmode="numeric" maxlength="6" value="${esc(v)}" aria-label="PIN"><div class="mqf-pin-boxes" aria-hidden="true">${boxes}</div></div>`;
  }
  function btn(text,cls,attrs=''){return `<button type="button" class="mqf-btn ${cls}" ${attrs}>${esc(text)}</button>`}
  function submit(text,form,sel){return btn(workingLabel(sel,text),'mqf-primary',`data-submit-form="${form}"${disabled(sel)?' disabled':''}`)}
  function click(text,cls,sel){return btn(text,cls,`data-source-click="${esc(sel)}"`)}

  function renderName(){
    const h=hint();
    return `<div class="mqf-panel" data-state="name">
      <div class="mqf-head"><h2 class="mqf-title">Vstup hráče</h2>${tip(h)}</div>
      <div class="mqf-body">
        <div class="mqf-label-row"><span class="mqf-label">Jméno hráče</span></div>
        ${field('mqPlayerName','Například Tomáš')}
      </div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click('★ Hrát jako host','mqf-guest','#mqPlayAsGuest')}${tip(clean(shell.querySelector('.mq-guest-note')?.textContent),'Informace o hraní jako host')}</div>
        <div class="mqf-right-actions">${submit('Pokračovat','mqCheckNameForm','#mqCheckNameForm .mq-primary')}</div>
      </div>
    </div>`;
  }
  function renderLogin(){
    const name=contextName('login');
    return `<div class="mqf-panel" data-state="login">
      <div class="mqf-head"><h2 class="mqf-title">Vstup hráče</h2>${tip(hint())}</div>
      <div class="mqf-body">
        ${name?`<p class="mqf-context">Hráč: ${esc(name)}</p>`:''}
        <div class="mqf-label-row"><span class="mqf-label">PIN</span></div>
        ${pin('mqPlayerPin')}
      </div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click('← Zpět','mqf-back','[data-back-to-name]')}${click('↻ Obnovit profil','mqf-link','[data-open-recovery]')}</div>
        <div class="mqf-right-actions">${submit('Vstoupit do kina','mqLoginForm','#mqLoginForm .mq-primary')}</div>
      </div>
    </div>`;
  }
  function renderRegister(){
    const name=contextName('register');
    const pinTip=clean(shell.querySelector('.mq-profile-hint')?.textContent);
    return `<div class="mqf-panel" data-state="register">
      <div class="mqf-head"><h2 class="mqf-title">Nový hráč</h2>${tip(pinTip)}</div>
      <div class="mqf-body">
        ${name?`<p class="mqf-context">Jméno: ${esc(name)}</p>`:''}
        <div class="mqf-label-row"><span class="mqf-label">Zvolte PIN</span></div>${pin('mqPlayerPinNew',true)}
        <div class="mqf-label-row"><span class="mqf-label">Potvrďte PIN</span></div>${pin('mqPlayerPinConfirm',true)}
      </div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click('← Zpět','mqf-back','[data-back-to-name]')}</div>
        <div class="mqf-right-actions">${submit('Vytvořit profil','mqRegisterForm','#mqRegisterForm .mq-primary')}</div>
      </div>
    </div>`;
  }
  function renderRecovery(){
    const name=contextName('recovery');
    return `<div class="mqf-panel" data-state="recovery">
      <div class="mqf-head"><h2 class="mqf-title">Obnovení profilu</h2>${tip(hint())}</div>
      <div class="mqf-body">
        ${name?`<p class="mqf-context">Hráč: ${esc(name)}</p>`:''}
        <div class="mqf-label-row"><span class="mqf-label">Recovery code</span></div>
        ${field('mqRecoveryCode','MQ-ABCD-EFGH-IJKL-MNOP','mqf-recovery-code')}
        <div class="mqf-recovery-grid">
          <div><div class="mqf-label-row"><span class="mqf-label">Nový PIN</span></div>${pin('mqRecoveryPinNew',true)}</div>
          <div><div class="mqf-label-row"><span class="mqf-label">Potvrzení</span></div>${pin('mqRecoveryPinConfirm',true)}</div>
        </div>
      </div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click('← Zpět','mqf-back','[data-back-to-login]')}</div>
        <div class="mqf-right-actions">${submit('Obnovit profil','mqRecoverForm','#mqRecoverForm .mq-primary')}</div>
      </div>
    </div>`;
  }
  function renderReveal(){
    const title=originalTitle();
    const code=clean(shell.querySelector('#mqRecoveryCodeValue')?.textContent);
    return `<div class="mqf-panel" data-state="reveal">
      <div class="mqf-head"><h2 class="mqf-title">${esc(title||'Profil je připraven')}</h2>${tip(hint())}</div>
      <div class="mqf-body"><div class="mqf-recovery-box"><small>Recovery code</small><div class="mqf-recovery-value">${esc(code)}</div></div></div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click(workingLabel('#mqCopyRecovery','Kopírovat kód'),'mqf-back','#mqCopyRecovery')}</div>
        <div class="mqf-right-actions">${click('Pokračovat','mqf-primary','#mqRecoveryDone')}</div>
      </div>
    </div>`;
  }
  function renderLinked(){
    const name=contextName('linked')||clean(window.MovieQuizOnline?.getPlayerName?.())||'Hráč';
    return `<div class="mqf-panel" data-state="linked">
      <div class="mqf-head"><h2 class="mqf-title">Vítejte zpět</h2>${tip(hint())}</div>
      <div class="mqf-body"><div class="mqf-status-copy">Na tomto zařízení jste přihlášený.<span class="mqf-status-name">${esc(name)}</span></div></div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click('Změnit hráče','mqf-back','#mqSwitchProfile')}</div>
        <div class="mqf-right-actions">${click('Vstoupit do kina','mqf-primary','#mqContinueProfile')}</div>
      </div>
    </div>`;
  }
  function renderGuest(){
    return `<div class="mqf-panel" data-state="guest">
      <div class="mqf-head"><h2 class="mqf-title">Hrajete jako host</h2>${tip(hint())}</div>
      <div class="mqf-body"><div class="mqf-status-copy">Vstupenka hosta je připravena.<span class="mqf-status-name">HOST</span></div></div>
      <div class="mqf-footer">
        <div class="mqf-left-actions">${click('Přihlásit se','mqf-back','#mqLeaveGuest')}</div>
        <div class="mqf-right-actions">${click('Vstoupit jako host','mqf-primary','#mqContinueGuest')}</div>
      </div>
    </div>`;
  }
  function render(){
    queued=false;
    const s=state();
    layer.dataset.ticketState=s;
    let html='';
    if(s==='name')html=renderName();
    else if(s==='login')html=renderLogin();
    else if(s==='register')html=renderRegister();
    else if(s==='recovery')html=renderRecovery();
    else if(s==='reveal')html=renderReveal();
    else if(s==='linked')html=renderLinked();
    else if(s==='guest')html=renderGuest();
    else html='<div class="mqf-panel" data-state="unknown"><div class="mqf-head"><h2 class="mqf-title">Připravuji vstupenku…</h2></div><div></div><div></div></div>';
    facade.innerHTML=html;
    syncError();syncOnline();
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(render)}

  function syncToSource(visual){
    const id=visual.dataset.sourceInput;if(!id)return;
    const src=document.getElementById(id);if(!src)return;
    let value=visual.value;
    if(src.classList.contains('mq-pin-input'))value=digits(value);
    src.value=value;
    src.dispatchEvent(new Event('input',{bubbles:true}));
    visual.value=src.value;
    if(visual.classList.contains('mqf-pin-capture'))updatePin(visual);
  }
  function updatePin(input){
    const wrap=input.closest('.mqf-pin');if(!wrap)return;
    const n=digits(input.value).length;
    wrap.querySelectorAll('.mqf-pin-box').forEach((box,i)=>box.classList.toggle('filled',i<n));
  }
  function submitForm(id){
    facade.querySelectorAll('[data-source-input]').forEach(syncToSource);
    const form=document.getElementById(id);form?.requestSubmit?.();
  }
  function sourceClick(sel){
    const target=actual(sel);target?.click?.();
  }
  function syncError(){
    if(!errorMirror)return;const text=clean(errorSource?.textContent);errorMirror.textContent=text;errorMirror.classList.toggle('has-error',Boolean(text));
  }
  function syncOnline(){
    if(!onlineMark||!onlineSource)return;onlineMark.dataset.state=onlineSource.dataset.state||'loading';onlineMark.dataset.tip=clean(onlineSource.textContent)||'Online archiv';onlineMark.setAttribute('aria-label',clean(onlineSource.textContent)||'Stav online archivu');
  }

  function showTip(anchor){
    if(!tooltip||!anchor)return;const text=clean(anchor.dataset.tip);if(!text)return;tipAnchor=anchor;tooltip.textContent=text;tooltip.classList.add('visible');
    tooltip.style.left='0px';tooltip.style.top='0px';const r=anchor.getBoundingClientRect();const t=tooltip.getBoundingClientRect();const m=12;
    let left=r.left+r.width/2-t.width/2;left=Math.max(m,Math.min(left,innerWidth-t.width-m));let top=r.top-t.height-9;if(top<m)top=r.bottom+9;top=Math.max(m,Math.min(top,innerHeight-t.height-m));
    tooltip.style.left=`${Math.round(left)}px`;tooltip.style.top=`${Math.round(top)}px`;
  }
  function hideTip(){tipAnchor=null;tooltip?.classList.remove('visible')}

  new MutationObserver(queue).observe(shell,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['disabled']});
  if(errorSource)new MutationObserver(syncError).observe(errorSource,{childList:true,subtree:true,characterData:true});
  if(onlineSource)new MutationObserver(syncOnline).observe(onlineSource,{childList:true,subtree:true,characterData:true,attributes:true});

  facade.addEventListener('input',e=>{const input=e.target.closest?.('[data-source-input]');if(input)syncToSource(input)});
  facade.addEventListener('click',e=>{
    const tipBtn=e.target.closest?.('[data-tip]');
    if(tipBtn){e.preventDefault();e.stopPropagation();tipAnchor===tipBtn&&tooltip?.classList.contains('visible')?hideTip():showTip(tipBtn);return}
    const submit=e.target.closest?.('[data-submit-form]');if(submit){e.preventDefault();submitForm(submit.dataset.submitForm);return}
    const click=e.target.closest?.('[data-source-click]');if(click){e.preventDefault();sourceClick(click.dataset.sourceClick);return}
    const pinWrap=e.target.closest?.('.mqf-pin');pinWrap?.querySelector('.mqf-pin-capture')?.focus();
  });
  facade.addEventListener('mouseover',e=>{const a=e.target.closest?.('[data-tip]');if(a)showTip(a)});
  facade.addEventListener('mouseout',e=>{if(e.target.closest?.('[data-tip]'))hideTip()});
  facade.addEventListener('focusin',e=>{const a=e.target.closest?.('[data-tip]');if(a)showTip(a)});
  facade.addEventListener('focusout',e=>{if(e.target.closest?.('[data-tip]'))hideTip()});
  onlineMark?.addEventListener('mouseenter',()=>showTip(onlineMark));onlineMark?.addEventListener('mouseleave',hideTip);onlineMark?.addEventListener('focus',()=>showTip(onlineMark));onlineMark?.addEventListener('blur',hideTip);

  /* The original profile module focuses its own hidden inputs. Redirect that focus
     to the corresponding visible ticket control, so keyboard UX stays natural. */
  shell.addEventListener('focusin',e=>{
    const id=e.target?.id;if(!id||!document.body.classList.contains('mq-ticket-open'))return;
    setTimeout(()=>facade.querySelector(`[data-source-input="${CSS.escape(id)}"]`)?.focus({preventScroll:true}),0);
  });
  window.addEventListener('resize',hideTip,{passive:true});window.addEventListener('scroll',hideTip,{passive:true,capture:true});
  window.addEventListener('mq:guest-mode-changed',queue);
  layer.dataset.ticketUiVersion=VERSION;
  queue();
})();
