(()=>{
  'use strict';
  const VERSION='ticket-login-v3.0';
  const layer=document.getElementById('mqTicketLayer');
  const mount=document.getElementById('mqTicketProfileMount');
  const shell=document.getElementById('mqProfileShell');
  const errorSource=document.getElementById('mqNameError');
  const errorMirror=document.getElementById('mqTicketError');
  const onlineSource=document.getElementById('mqOnlineStatus');
  const onlineMark=document.getElementById('mqTicketOnlineMark');
  const tooltip=document.getElementById('mqTicketTooltip');
  if(!layer||!mount||!shell)return;

  let queued=false;
  let tooltipAnchor=null;

  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();

  function detectState(){
    if(shell.querySelector('[data-mq-guest-current],#mqContinueGuest'))return 'guest';
    if(shell.querySelector('#mqCheckNameForm'))return 'name';
    if(shell.querySelector('#mqLoginForm'))return 'login';
    if(shell.querySelector('#mqRegisterForm'))return 'register';
    if(shell.querySelector('#mqRecoverForm'))return 'recovery';
    if(shell.querySelector('#mqRecoveryCodeValue,#mqRecoveryDone'))return 'reveal';
    if(shell.querySelector('#mqContinueProfile'))return 'linked';
    return 'unknown';
  }

  function setButtonText(selector,text){
    const button=shell.querySelector(selector);
    if(!button||button.disabled)return;
    if(button.textContent!==text)button.textContent=text;
  }

  function originalTitle(){
    const title=shell.querySelector('.mq-profile-title');
    if(!title)return '';
    if(!title.dataset.mqOriginalTitle)title.dataset.mqOriginalTitle=clean(title.textContent);
    return title.dataset.mqOriginalTitle;
  }

  function ensureContextName(state,titleText){
    let name='';
    if(state==='login')name=titleText.match(/^Jméno\s+(.+?)\s+už existuje/i)?.[1]||'';
    if(state==='register')name=titleText.match(/^Vytvořit profil\s+(.+)$/i)?.[1]||'';
    if(state==='recovery')name=titleText.match(/^Obnova profilu\s+(.+)$/i)?.[1]||'';
    let context=shell.querySelector('.mq-ticket-context-name');
    if(!name){context?.remove();return}
    const step=shell.querySelector('.mq-profile-step');
    if(!step)return;
    if(!context){
      context=document.createElement('div');
      context.className='mq-ticket-context-name';
      step.insertAdjacentElement('afterend',context);
    }
    const text=`Hráč: ${clean(name)}`;
    if(context.textContent!==text)context.textContent=text;
  }

  function titleForState(state,current){
    if(state==='name')return 'Vstup hráče';
    if(state==='login')return 'Vstup hráče';
    if(state==='register')return 'Nový hráč';
    if(state==='recovery')return 'Obnovení profilu';
    if(state==='guest')return 'Vstup hosta';
    if(state==='linked')return 'Vítejte zpět';
    /* Keep recovery-reveal heading untouched: the avatar onboarding module uses
       'Profil byl vytvořen' as a functional hook. */
    if(state==='reveal')return current;
    return current;
  }

  function normalizeLabels(state){
    const labels=[...shell.querySelectorAll('.mq-form-label')];
    labels.forEach(label=>{
      const target=label.getAttribute('for')||'';
      if(target==='mqPlayerName')label.childNodes[0].textContent='Jméno hráče';
      if(target==='mqPlayerPin')label.childNodes[0].textContent='PIN';
      if(target==='mqPlayerPinNew')label.childNodes[0].textContent='Nový PIN';
      if(target==='mqPlayerPinConfirm')label.childNodes[0].textContent='Potvrzení PINu';
      if(target==='mqRecoveryCode')label.childNodes[0].textContent='Recovery code';
      if(target==='mqRecoveryPinNew')label.childNodes[0].textContent='Nový PIN';
      if(target==='mqRecoveryPinConfirm')label.childNodes[0].textContent='Potvrzení PINu';
    });

    if(state==='name')setButtonText('#mqCheckNameForm .mq-primary','Pokračovat');
    if(state==='login'){
      setButtonText('#mqLoginForm .mq-primary','Vstoupit do kina');
      setButtonText('[data-back-to-name]','Zpět');
      setButtonText('[data-open-recovery]','Obnovit profil');
    }
    if(state==='register'){
      setButtonText('#mqRegisterForm .mq-primary','Vytvořit profil');
      setButtonText('[data-back-to-name]','Zpět');
    }
    if(state==='recovery'){
      setButtonText('#mqRecoverForm .mq-primary','Obnovit profil');
      setButtonText('[data-back-to-login]','Zpět');
    }
    if(state==='reveal'){
      setButtonText('#mqCopyRecovery','Kopírovat kód');
      setButtonText('#mqRecoveryDone','Pokračovat');
    }
    if(state==='linked'){
      setButtonText('#mqContinueProfile','Vstoupit do kina');
      setButtonText('#mqSwitchProfile','Změnit hráče');
    }
    if(state==='guest'){
      setButtonText('#mqContinueGuest','Vstoupit jako host');
      setButtonText('#mqLeaveGuest','Přihlásit se');
    }
    setButtonText('#mqPlayAsGuest','Hrát jako host');
  }

  function pinValue(input){return String(input?.value||'').replace(/\D/g,'').slice(0,6)}
  function updatePinVisual(input){
    const wrap=input?.closest('.mq-ticket-pin-wrap');
    const boxes=wrap?.querySelectorAll('.mq-ticket-pin-boxes>i');
    if(!boxes?.length)return;
    const value=pinValue(input);
    boxes.forEach((box,index)=>box.classList.toggle('is-filled',index<value.length));
  }
  function ensurePinVisual(input){
    if(!input||input.closest('.mq-ticket-pin-wrap')){updatePinVisual(input);return}
    const wrap=document.createElement('div');
    wrap.className='mq-ticket-pin-wrap';
    const boxes=document.createElement('div');
    boxes.className='mq-ticket-pin-boxes';
    boxes.setAttribute('aria-hidden','true');
    boxes.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';
    input.parentNode.insertBefore(wrap,input);
    wrap.append(boxes,input);
    updatePinVisual(input);
  }

  function infoText(){
    const texts=[...shell.querySelectorAll('.mq-profile-subtitle,.mq-profile-hint')]
      .map(node=>clean(node.textContent)).filter(Boolean);
    return [...new Set(texts)].join(' ');
  }
  function ensureMainInfo(){
    const text=infoText();
    const step=shell.querySelector('.mq-profile-step');
    let button=shell.querySelector('.mq-ticket-info[data-generated="main"]');
    if(!text||!step){button?.remove();return}
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='mq-ticket-info';
      button.dataset.generated='main';
      button.setAttribute('aria-label','Více informací');
      button.textContent='?';
      step.appendChild(button);
    }
    if(button.dataset.mqTicketTip!==text)button.dataset.mqTicketTip=text;
  }
  function ensureGuestInfo(){
    const entry=shell.querySelector('.mq-guest-entry');
    const guestButton=entry?.querySelector('#mqPlayAsGuest');
    const note=clean(entry?.querySelector('.mq-guest-note')?.textContent);
    let info=shell.querySelector('.mq-ticket-info[data-generated="guest"]');
    if(!guestButton||!note){info?.remove();return}
    if(!info){
      info=document.createElement('button');
      info.type='button';
      info.className='mq-ticket-info';
      info.dataset.generated='guest';
      info.setAttribute('aria-label','Informace o hraní jako host');
      info.textContent='?';
      guestButton.insertAdjacentElement('afterend',info);
    }
    if(info.dataset.mqTicketTip!==note)info.dataset.mqTicketTip=note;
  }

  function forcePaperCritical(){
    const imp=(el,prop,value)=>{if(el)el.style.setProperty(prop,value,'important')};
    [shell,...shell.querySelectorAll('.mq-profile-card,.mq-profile-linked,.mq-profile-reveal,.mq-guest-card,.mq-form-stack')].forEach(el=>{
      imp(el,'background','transparent');imp(el,'background-color','transparent');imp(el,'background-image','none');
      imp(el,'border','0');imp(el,'border-radius','0');imp(el,'box-shadow','none');imp(el,'backdrop-filter','none');imp(el,'filter','none');
      imp(el,'color','#563219');
    });
    shell.querySelectorAll('.mq-profile-title').forEach(el=>{imp(el,'color','#60371b');imp(el,'background','transparent');imp(el,'text-shadow','0 1px rgba(255,248,224,.70)')});
    shell.querySelectorAll('input.mq-name-input,input.mq-recovery-input').forEach(el=>{
      if(el.classList.contains('mq-pin-input')&&el.closest('.mq-ticket-pin-wrap'))return;
      imp(el,'background','rgba(255,249,226,.16)');imp(el,'background-color','rgba(255,249,226,.16)');imp(el,'background-image','none');
      imp(el,'color','#4b2914');imp(el,'-webkit-text-fill-color','#4b2914');imp(el,'border','1.5px solid rgba(113,67,29,.78)');
      imp(el,'box-shadow','inset 0 0 0 2px rgba(255,251,235,.20), inset 0 1px 4px rgba(75,39,13,.05)');imp(el,'opacity','1');
    });
    shell.querySelectorAll('.mq-ticket-pin-wrap>input.mq-pin-input').forEach(el=>{
      imp(el,'background','transparent');imp(el,'border','0');imp(el,'box-shadow','none');imp(el,'opacity','.01');
      imp(el,'color','transparent');imp(el,'-webkit-text-fill-color','transparent');
    });
  }

  function enhance(){
    queued=false;
    const state=detectState();
    layer.dataset.ticketState=state;
    const title=shell.querySelector('.mq-profile-title');
    const sourceTitle=originalTitle();
    if(title&&state!=='reveal'){
      const next=titleForState(state,sourceTitle);
      if(next&&clean(title.textContent)!==next)title.textContent=next;
    }
    ensureContextName(state,sourceTitle);
    normalizeLabels(state);
    shell.querySelectorAll('.mq-pin-input').forEach(ensurePinVisual);
    ensureMainInfo();
    ensureGuestInfo();
    forcePaperCritical();
    syncError();
    syncOnline();
  }
  function queueEnhance(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(enhance);
  }

  function syncError(){
    if(!errorMirror)return;
    const text=clean(errorSource?.textContent);
    errorMirror.textContent=text;
    errorMirror.classList.toggle('has-error',Boolean(text));
  }
  function syncOnline(){
    if(!onlineMark||!onlineSource)return;
    onlineMark.dataset.state=onlineSource.dataset.state||'loading';
    onlineMark.dataset.mqTicketTip=clean(onlineSource.textContent)||'Online archiv';
    onlineMark.setAttribute('aria-label',clean(onlineSource.textContent)||'Stav online archivu');
  }

  function positionTooltip(anchor){
    if(!tooltip||!anchor)return;
    const text=clean(anchor.dataset.mqTicketTip);
    if(!text)return;
    tooltipAnchor=anchor;
    tooltip.textContent=text;
    tooltip.classList.add('visible');
    tooltip.style.left='0px';tooltip.style.top='0px';
    const rect=anchor.getBoundingClientRect();
    const tip=tooltip.getBoundingClientRect();
    const margin=12;
    let left=rect.left+rect.width/2-tip.width/2;
    left=Math.max(margin,Math.min(left,window.innerWidth-tip.width-margin));
    let top=rect.top-tip.height-9;
    if(top<margin)top=rect.bottom+9;
    top=Math.max(margin,Math.min(top,window.innerHeight-tip.height-margin));
    tooltip.style.left=`${Math.round(left)}px`;
    tooltip.style.top=`${Math.round(top)}px`;
  }
  function hideTooltip(){
    tooltipAnchor=null;
    tooltip?.classList.remove('visible');
  }

  new MutationObserver(queueEnhance).observe(shell,{childList:true,subtree:true});
  if(errorSource)new MutationObserver(syncError).observe(errorSource,{childList:true,characterData:true,subtree:true});
  if(onlineSource)new MutationObserver(syncOnline).observe(onlineSource,{childList:true,characterData:true,attributes:true,subtree:true});

  document.addEventListener('input',event=>{
    if(event.target?.matches?.('.mq-pin-input'))updatePinVisual(event.target);
  },true);
  document.addEventListener('focusin',event=>{
    const anchor=event.target?.closest?.('[data-mq-ticket-tip]');
    if(anchor&&layer.contains(anchor))positionTooltip(anchor);
  });
  document.addEventListener('focusout',event=>{
    if(event.target?.closest?.('[data-mq-ticket-tip]'))hideTooltip();
  });
  document.addEventListener('mouseover',event=>{
    const anchor=event.target?.closest?.('[data-mq-ticket-tip]');
    if(anchor&&layer.contains(anchor))positionTooltip(anchor);
  });
  document.addEventListener('mouseout',event=>{
    if(event.target?.closest?.('[data-mq-ticket-tip]'))hideTooltip();
  });
  document.addEventListener('click',event=>{
    const anchor=event.target?.closest?.('[data-mq-ticket-tip]');
    if(anchor&&layer.contains(anchor)){
      if(tooltipAnchor===anchor&&tooltip?.classList.contains('visible'))hideTooltip();
      else positionTooltip(anchor);
      if(anchor.classList.contains('mq-ticket-info')||anchor.id==='mqTicketOnlineMark'){
        event.preventDefault();
        event.stopPropagation();
      }
    }else if(tooltipAnchor)hideTooltip();
  },true);
  window.addEventListener('resize',hideTooltip,{passive:true});
  window.addEventListener('scroll',hideTooltip,{passive:true,capture:true});
  window.addEventListener('mq:guest-mode-changed',queueEnhance);
  document.addEventListener('click',event=>{
    const btn=event.target?.closest?.('#mqLeaveGuest');
    if(btn){
      layer.hidden=false;
      document.body.classList.add('mq-ticket-open');
      queueEnhance();
    }
  },true);

  layer.dataset.ticketUiVersion=VERSION;
  queueEnhance();
})();
