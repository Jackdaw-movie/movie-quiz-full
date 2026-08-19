(()=>{
  'use strict';

  const VERSION='responsive-ticket-mobile-v1.1';
  const MOBILE_QUERY='(max-width: 820px) and (orientation: portrait)';
  const mql=matchMedia(MOBILE_QUERY);
  let guestSelected=false;
  let facadeObserver=null;
  let queued=false;

  const facade=()=>document.getElementById('mqTicketFacade');
  const shell=()=>document.getElementById('mqProfileShell');
  const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

  function isNameState(){
    return Boolean(facade()?.querySelector('.mqf-panel[data-state="name"]'));
  }

  function hostNote(){
    const note=shell()?.querySelector('.mq-guest-note');
    const text=clean(note?.textContent);
    if(!text)return 'Bez statistik a žebříčku.';
    return text;
  }

  function patchNameState(){
    const f=facade();
    if(!f)return;
    const panel=f.querySelector('.mqf-panel[data-state="name"]');
    if(!mql.matches){
      if(panel){
        const guest=panel.querySelector('.mqf-guest');
        const field=panel.querySelector('.mqf-field[data-source-input="mqPlayerName"]');
        const primary=panel.querySelector('.mqf-primary[data-submit-form="mqCheckNameForm"]');
        panel.classList.remove('mq-mobile-guest-selected');
        if(guest?.dataset.mqMobileGuestPatched==='1'){
          guest.innerHTML='★ Hrát jako host';
          guest.classList.remove('mq-mobile-guest-choice','is-selected');
          guest.removeAttribute('role');
          guest.removeAttribute('aria-checked');
          delete guest.dataset.mqMobileGuestPatched;
        }
        if(field){field.disabled=false;field.removeAttribute('aria-disabled')}
        if(primary)primary.textContent='Pokračovat';
      }
      guestSelected=false;
      return;
    }
    if(!panel){guestSelected=false;return}

    const guest=panel.querySelector('.mqf-guest[data-source-click="#mqPlayAsGuest"]');
    const field=panel.querySelector('.mqf-field[data-source-input="mqPlayerName"]');
    const primary=panel.querySelector('.mqf-primary[data-submit-form="mqCheckNameForm"]');

    panel.classList.toggle('mq-mobile-guest-selected',guestSelected);
    if(guest){
      guest.classList.add('mq-mobile-guest-choice');
      guest.classList.toggle('is-selected',guestSelected);
      guest.setAttribute('role','checkbox');
      guest.setAttribute('aria-checked',String(guestSelected));
      if(guest.dataset.mqMobileGuestPatched!=='1'){
        guest.dataset.mqMobileGuestPatched='1';
        guest.innerHTML=`<span class="mqf-guest-copy"><strong>Hrát jako host</strong><small>${hostNote()}</small></span>`;
      }
    }

    if(field){
      field.disabled=guestSelected;
      field.setAttribute('aria-disabled',String(guestSelected));
    }

    if(primary){
      primary.disabled=false;
      primary.textContent=guestSelected?'Vstoupit jako host':'Pokračovat';
      primary.setAttribute('aria-label',guestSelected?'Vstoupit jako host':'Pokračovat');
    }
  }

  function schedulePatch(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;patchNameState()});
  }

  function clickSource(selector){
    const target=shell()?.querySelector(selector)||document.querySelector(selector);
    target?.click?.();
    return Boolean(target);
  }

  function continueGuestFlow(){
    if(!clickSource('#mqPlayAsGuest'))return;
    const started=performance.now();
    const step=()=>{
      const continueButton=shell()?.querySelector('#mqContinueGuest')||document.querySelector('#mqContinueGuest');
      if(continueButton){
        guestSelected=false;
        continueButton.click();
        return;
      }
      if(performance.now()-started<1800)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function onClick(event){
    if(!mql.matches)return;
    const f=facade();
    if(!f||!f.contains(event.target))return;

    const guest=event.target.closest?.('.mqf-guest[data-source-click="#mqPlayAsGuest"]');
    if(guest&&isNameState()){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      guestSelected=!guestSelected;
      patchNameState();
      if(!guestSelected){
        requestAnimationFrame(()=>facade()?.querySelector('.mqf-field[data-source-input="mqPlayerName"]')?.focus?.({preventScroll:true}));
      }
      return;
    }

    const primary=event.target.closest?.('.mqf-primary[data-submit-form="mqCheckNameForm"]');
    if(primary&&isNameState()&&guestSelected){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      continueGuestFlow();
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
    guestSelected=!guestSelected;
    patchNameState();
  }

  function observeFacade(){
    const f=facade();
    if(!f){setTimeout(observeFacade,80);return}
    if(facadeObserver)return;
    facadeObserver=new MutationObserver(schedulePatch);
    facadeObserver.observe(f,{childList:true,subtree:true});
    schedulePatch();
  }

  function start(){
    document.addEventListener('click',onClick,true);
    document.addEventListener('keydown',onKeydown,true);
    mql.addEventListener?.('change',()=>{guestSelected=false;schedulePatch()});
    window.addEventListener('resize',schedulePatch,{passive:true});
    window.visualViewport?.addEventListener('resize',schedulePatch,{passive:true});
    observeFacade();
    window.__mqResponsiveTicketVersion=VERSION;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
