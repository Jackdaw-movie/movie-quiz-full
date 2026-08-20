(()=>{
  'use strict';

  const VERSION='responsive-ticket-mobile-v4.0-approved-asset';
  const MOBILE_QUERY='(orientation: portrait) and (max-width: 820px)';
  const WIDE_QUERY='(orientation: portrait) and (max-width: 820px) and (min-aspect-ratio: 3/5)';
  const TALL_SRC='test-responsive/assets/ticket-mobile/mobile-ticket-master-v4-tall.webp?v=4.0.0';
  const WIDE_SRC='test-responsive/assets/ticket-mobile/mobile-ticket-master-v4-wide.webp?v=4.0.0';

  const mobileMql=matchMedia(MOBILE_QUERY);
  const wideMql=matchMedia(WIDE_QUERY);

  let guestSelected=false;
  let facadeObserver=null;
  let queued=false;
  let originalTicketSrc='';
  let autoGuestPending=false;

  const layer=()=>document.getElementById('mqTicketLayer');
  const art=()=>document.querySelector('#mqAdmitTicket .mq-ticket-art');
  const facade=()=>document.getElementById('mqTicketFacade');
  const shell=()=>document.getElementById('mqProfileShell');

  function source(selector){
    return shell()?.querySelector(selector)||document.querySelector(selector);
  }

  function isNameState(){
    return Boolean(facade()?.querySelector('.mqf-panel[data-state="name"]'));
  }

  function rememberOriginalTicket(){
    const image=art();
    if(!image)return;
    if(!originalTicketSrc)originalTicketSrc=image.getAttribute('src')||'';
  }

  function activeMobileSrc(){
    return wideMql.matches?WIDE_SRC:TALL_SRC;
  }

  function setTicketVariant(){
    const l=layer();
    if(!l)return;
    const wide=wideMql.matches;
    l.classList.toggle('mq-ticket-v4-wide',wide);
    l.classList.toggle('mq-ticket-v4-tall',!wide);
  }

  function applyMobileArtwork(){
    const image=art();
    if(!image)return;
    rememberOriginalTicket();
    setTicketVariant();
    const src=activeMobileSrc();
    if(image.getAttribute('src')!==src)image.setAttribute('src',src);
  }

  function restoreArtwork(){
    const image=art();
    if(!image)return;
    if(originalTicketSrc&&image.getAttribute('src')!==originalTicketSrc){
      image.setAttribute('src',originalTicketSrc);
    }
  }

  function restoreNameFacade(){
    const f=facade();
    if(!f)return;
    const panel=f.querySelector('.mqf-panel[data-state="name"]');
    if(!panel)return;

    panel.classList.remove('mq-mobile-guest-selected');

    const guest=panel.querySelector('.mqf-guest');
    if(guest){
      if(guest.dataset.mqV4OriginalGuestText!==undefined){
        guest.textContent=guest.dataset.mqV4OriginalGuestText;
      }
      guest.classList.remove('mq-mobile-guest-choice');
      guest.removeAttribute('role');
      guest.removeAttribute('aria-checked');
      guest.removeAttribute('aria-pressed');
      delete guest.dataset.mqV4MobileGuest;
    }

    const field=panel.querySelector('.mqf-field[data-source-input="mqPlayerName"]');
    if(field){
      const src=source('#mqPlayerName');
      field.disabled=Boolean(src?.disabled);
      field.setAttribute('aria-disabled',String(Boolean(src?.disabled)));
    }

    const primary=panel.querySelector('.mqf-primary[data-submit-form="mqCheckNameForm"]');
    if(primary){
      if(primary.dataset.mqV4OriginalPrimaryText!==undefined){
        primary.textContent=primary.dataset.mqV4OriginalPrimaryText;
      }
      const sourcePrimary=source('#mqCheckNameForm .mq-primary');
      primary.disabled=Boolean(sourcePrimary?.disabled);
      primary.removeAttribute('aria-label');
    }
  }

  function patchMobileNameFacade(){
    const f=facade();
    if(!f)return;
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
      if(guest.dataset.mqV4OriginalGuestText===undefined){
        guest.dataset.mqV4OriginalGuestText=guest.textContent||'';
      }
      /* Only the mode name appears inside the control. Explanation stays in the existing ? tooltip. */
      guest.textContent='Hrát jako host';
      guest.classList.add('mq-mobile-guest-choice');
      guest.dataset.mqV4MobileGuest='1';
      guest.setAttribute('role','checkbox');
      guest.setAttribute('aria-checked',String(guestSelected));
      guest.setAttribute('aria-pressed',String(guestSelected));
    }

    if(field){
      field.disabled=guestSelected;
      field.setAttribute('aria-disabled',String(guestSelected));
      if(guestSelected)field.blur();
    }

    if(primary){
      if(primary.dataset.mqV4OriginalPrimaryText===undefined){
        primary.dataset.mqV4OriginalPrimaryText=primary.textContent||'Pokračovat';
      }
      primary.textContent=guestSelected?'Vstoupit jako host':'Pokračovat';
      primary.setAttribute('aria-label',primary.textContent);
      if(guestSelected){
        primary.disabled=false;
      }else{
        const sourcePrimary=source('#mqCheckNameForm .mq-primary');
        primary.disabled=Boolean(sourcePrimary?.disabled);
      }
    }
  }

  function activateMobile(){
    const l=layer();
    if(!l)return;
    l.classList.add('mq-mobile-ticket-v4');
    applyMobileArtwork();
    patchMobileNameFacade();
  }

  function deactivateMobile(){
    guestSelected=false;
    autoGuestPending=false;
    const l=layer();
    l?.classList.remove('mq-mobile-ticket-v4','mq-ticket-v4-wide','mq-ticket-v4-tall');
    restoreArtwork();
    restoreNameFacade();
  }

  function patch(){
    queued=false;
    rememberOriginalTicket();
    if(mobileMql.matches)activateMobile();
    else deactivateMobile();
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
      if(performance.now()-start<2200)requestAnimationFrame(wait);
      else autoGuestPending=false;
    };
    requestAnimationFrame(wait);
  }

  function toggleGuest(){
    guestSelected=!guestSelected;
    patchMobileNameFacade();
    if(!guestSelected){
      requestAnimationFrame(()=>{
        facade()?.querySelector('.mqf-field[data-source-input="mqPlayerName"]')?.focus?.({preventScroll:true});
      });
    }
  }

  function onClick(event){
    if(!mobileMql.matches)return;
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
    if(!mobileMql.matches)return;
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
    rememberOriginalTicket();
    new Image().src=TALL_SRC;
    new Image().src=WIDE_SRC;

    document.addEventListener('click',onClick,true);
    document.addEventListener('keydown',onKeydown,true);

    const onMediaChange=()=>{
      guestSelected=false;
      autoGuestPending=false;
      schedule();
    };

    mobileMql.addEventListener?.('change',onMediaChange);
    wideMql.addEventListener?.('change',onMediaChange);

    window.addEventListener('pageshow',schedule);
    window.addEventListener('orientationchange',schedule,{passive:true});
    window.visualViewport?.addEventListener('resize',schedule,{passive:true});

    observeFacade();
    schedule();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
