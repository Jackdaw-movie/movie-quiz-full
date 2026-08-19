(()=>{
  'use strict';

  const VERSION='responsive-ticket-mobile-v2.0';
  const QUERY='(orientation: portrait) and (max-width: 820px)';
  const TICKET_SRC='test-responsive/assets/ticket-mobile/mobile-ticket-master-v2.webp?v=2.0.0';
  const mql=matchMedia(QUERY);

  let guestSelected=false;
  let facadeObserver=null;
  let queued=false;
  let originalTicketSrc='';
  let autoGuestPending=false;

  const layer=()=>document.getElementById('mqTicketLayer');
  const art=()=>document.querySelector('#mqAdmitTicket .mq-ticket-art');
  const facade=()=>document.getElementById('mqTicketFacade');
  const shell=()=>document.getElementById('mqProfileShell');
  const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

  function source(selector){
    return shell()?.querySelector(selector)||document.querySelector(selector);
  }

  function isNameState(){
    return Boolean(facade()?.querySelector('.mqf-panel[data-state="name"]'));
  }

  function guestNote(){
    const raw=clean(shell()?.querySelector('.mq-guest-note')?.textContent);
    if(!raw)return 'Bez ukládání statistik a účasti v žebříčku.';
    return raw
      .replace(/^Hra funguje normálně,?\s*/i,'')
      .replace(/^ale\s+/i,'')
      .replace(/výsledek se neuloží do statistik ani společného žebříčku\.?/i,'Bez ukládání statistik a účasti v žebříčku.')
      .trim() || 'Bez ukládání statistik a účasti v žebříčku.';
  }

  function applyTicketArtwork(){
    const image=art();
    if(!image)return;
    if(!originalTicketSrc)originalTicketSrc=image.getAttribute('src')||'';
    if(mql.matches){
      if(image.getAttribute('src')!==TICKET_SRC)image.setAttribute('src',TICKET_SRC);
    }else if(originalTicketSrc&&image.getAttribute('src')!==originalTicketSrc){
      image.setAttribute('src',originalTicketSrc);
    }
  }

  function patchNamePanel(){
    const f=facade();
    if(!f||!mql.matches)return;
    const panel=f.querySelector('.mqf-panel[data-state="name"]');
    if(!panel){
      guestSelected=false;
      return;
    }

    const guest=panel.querySelector('.mqf-guest');
    const field=panel.querySelector('.mqf-field[data-source-input="mqPlayerName"]');
    const primary=panel.querySelector('.mqf-primary[data-submit-form="mqCheckNameForm"]');

    panel.classList.toggle('mq-mobile-guest-selected',guestSelected);

    if(guest){
      guest.classList.add('mq-mobile-guest-choice');
      guest.setAttribute('role','checkbox');
      guest.setAttribute('aria-checked',String(guestSelected));
      guest.setAttribute('aria-pressed',String(guestSelected));
      guest.removeAttribute('data-source-click');
      guest.dataset.mqMobileGuest='1';
      if(guest.dataset.mqMobileGuestPatched!=='1'){
        guest.dataset.mqMobileGuestPatched='1';
        guest.innerHTML=`
          <span class="mq-mobile-guest-check" aria-hidden="true"></span>
          <span class="mq-mobile-guest-copy">
            <span class="mq-mobile-guest-title">Hrát jako host</span>
            <span class="mq-mobile-guest-note">${guestNote()}</span>
          </span>`;
      }
    }

    if(field){
      field.disabled=guestSelected;
      field.setAttribute('aria-disabled',String(guestSelected));
      if(guestSelected)field.blur();
    }

    if(primary){
      primary.disabled=false;
      primary.textContent=guestSelected?'Vstoupit jako host':'Pokračovat';
      primary.setAttribute('aria-label',guestSelected?'Vstoupit jako host':'Pokračovat');
    }
  }

  function patch(){
    queued=false;
    applyTicketArtwork();
    patchNamePanel();
    layer()?.classList.toggle('mq-mobile-ticket-v2',mql.matches);
    window.__mqResponsiveTicketVersion=VERSION;
  }

  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(patch);
  }

  function clickSource(selector){
    const target=source(selector);
    if(!target)return false;
    target.click?.();
    return true;
  }

  function continueAsGuest(){
    if(autoGuestPending)return;
    autoGuestPending=true;
    if(!clickSource('#mqPlayAsGuest')){
      autoGuestPending=false;
      return;
    }

    const start=performance.now();
    const wait=()=>{
      const continueButton=source('#mqContinueGuest');
      if(continueButton){
        guestSelected=false;
        autoGuestPending=false;
        continueButton.click?.();
        return;
      }
      if(performance.now()-start<2200){
        requestAnimationFrame(wait);
      }else{
        autoGuestPending=false;
      }
    };
    requestAnimationFrame(wait);
  }

  function toggleGuest(){
    guestSelected=!guestSelected;
    patchNamePanel();
    if(!guestSelected){
      requestAnimationFrame(()=>facade()?.querySelector('.mqf-field[data-source-input="mqPlayerName"]')?.focus?.({preventScroll:true}));
    }
  }

  function onClick(event){
    if(!mql.matches)return;
    const f=facade();
    if(!f||!f.contains(event.target))return;

    const guest=event.target.closest?.('.mq-mobile-guest-choice');
    if(guest&&isNameState()){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      toggleGuest();
      return;
    }

    const primary=event.target.closest?.('.mqf-primary[data-submit-form="mqCheckNameForm"]');
    if(primary&&isNameState()&&guestSelected){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      continueAsGuest();
    }
  }

  function onKeydown(event){
    if(!mql.matches)return;
    const guest=event.target.closest?.('.mq-mobile-guest-choice');
    if(!guest||!isNameState())return;
    if(event.key!==' '&&event.key!=='Enter')return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    toggleGuest();
  }

  function observeFacade(){
    const f=facade();
    if(!f){
      setTimeout(observeFacade,80);
      return;
    }
    if(facadeObserver)return;
    facadeObserver=new MutationObserver(schedule);
    facadeObserver.observe(f,{childList:true,subtree:true});
    schedule();
  }

  function start(){
    new Image().src=TICKET_SRC;
    document.addEventListener('click',onClick,true);
    document.addEventListener('keydown',onKeydown,true);
    mql.addEventListener?.('change',()=>{
      guestSelected=false;
      autoGuestPending=false;
      schedule();
    });
    observeFacade();
    schedule();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
