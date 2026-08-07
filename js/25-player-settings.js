(()=>{
  'use strict';

  const VERSION='player-settings-v1.1-stability-fix';
  const MUSIC_KEY='movieQuizMusicVolumeV1';
  const SFX_KEY='movieQuizSfxVolumeV1';
  const DEFAULT_VOLUME=50;
  const BASE_MUSIC_GAIN=1.6848;
  const BASE_SFX_GAIN=.82;

  let open=false;
  let syncQueued=false;
  let observer=null;

  function clamp(value){
    const number=Number(value);
    return Number.isFinite(number)?Math.max(0,Math.min(100,Math.round(number))):DEFAULT_VOLUME;
  }

  function read(key){
    try{
      const raw=localStorage.getItem(key);
      return raw===null?DEFAULT_VOLUME:clamp(raw);
    }catch(_){
      return DEFAULT_VOLUME;
    }
  }

  function write(key,value){
    try{localStorage.setItem(key,String(clamp(value)))}catch(_){ }
  }

  function musicVolume(){return read(MUSIC_KEY)}
  function sfxVolume(){return read(SFX_KEY)}
  function scale(percent){return clamp(percent)/50}

  function applyVolumes(smooth=true){
    try{
      // AudioContext vytváří až původní hra po uživatelské interakci.
      if(typeof audioCtx==='undefined'||!audioCtx)return false;
      const now=audioCtx.currentTime||0;
      const musicTarget=BASE_MUSIC_GAIN*scale(musicVolume());
      const sfxTarget=BASE_SFX_GAIN*scale(sfxVolume());

      if(typeof musicGain!=='undefined'&&musicGain){
        if(smooth&&musicGain.gain?.setTargetAtTime)musicGain.gain.setTargetAtTime(musicTarget,now,.035);
        else musicGain.gain.value=musicTarget;
      }
      if(typeof sfxGain!=='undefined'&&sfxGain){
        if(smooth&&sfxGain.gain?.setTargetAtTime)sfxGain.gain.setTargetAtTime(sfxTarget,now,.035);
        else sfxGain.gain.value=sfxTarget;
      }
      return true;
    }catch(error){
      console.warn('Movie Quiz Settings: hlasitost se nepodařilo aplikovat.',error);
      return false;
    }
  }

  function gearSvg(){
    return `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13.5 4.2h5l.8 3a10 10 0 0 1 2.2.9l2.7-1.5 3.5 3.5-1.5 2.7c.4.7.7 1.4.9 2.2l3 .8v5l-3 .8a10 10 0 0 1-.9 2.2l1.5 2.7-3.5 3.5-2.7-1.5a10 10 0 0 1-2.2.9l-.8 3h-5l-.8-3a10 10 0 0 1-2.2-.9L7.8 30l-3.5-3.5 1.5-2.7a10 10 0 0 1-.9-2.2l-3-.8v-5l3-.8c.2-.8.5-1.5.9-2.2l-1.5-2.7 3.5-3.5 2.7 1.5a10 10 0 0 1 2.2-.9z"/><circle cx="16" cy="18.3" r="4.6"/></svg>`;
  }

  function ensureGear(){
    const badge=document.getElementById('mqPlayerBadge');
    if(!badge)return;

    let button=badge.querySelector('.mq-settings-gear');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='mq-settings-gear';
      button.setAttribute('aria-label','Nastavení');
      button.setAttribute('title','Nastavení');
      button.innerHTML=gearSvg();
      badge.appendChild(button);
    }
  }

  function currentIdentity(){
    const guest=window.__mqGuestMode===true;
    const api=window.MovieQuizOnline;
    const profile=api?.getProfile?.()||null;
    const name=guest?'Host':(api?.getPlayerName?.()||profile?.nickname||'Hráč');
    const avatar=window.MovieQuizAvatars?.current?.()||null;
    return {guest,name,avatar};
  }

  function ensureModal(){
    if(document.getElementById('mqSettingsModal'))return;

    const modal=document.createElement('div');
    modal.id='mqSettingsModal';
    modal.className='mq-settings-modal';
    modal.hidden=true;
    modal.innerHTML=`
      <div class="mq-settings-backdrop" data-close-settings></div>
      <section class="mq-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="mqSettingsTitle">
        <div class="mq-settings-head">
          <div>
            <div class="eyebrow">Movie Quiz</div>
            <h2 id="mqSettingsTitle">Nastavení</h2>
          </div>
          <button type="button" class="mq-settings-close" data-close-settings aria-label="Zavřít">×</button>
        </div>

        <div class="mq-settings-profile">
          <span class="mq-settings-avatar mq-avatar-frame"><img class="mq-avatar-img" alt="Profilový avatar"></span>
          <div class="mq-settings-profile-copy">
            <span>Profil</span>
            <strong id="mqSettingsPlayerName">Hráč</strong>
            <small id="mqSettingsProfileHint"></small>
          </div>
          <button type="button" class="mq-settings-avatar-button" id="mqSettingsAvatarButton">Změnit avatar</button>
        </div>

        <div class="mq-settings-section">
          <div class="mq-settings-section-title">
            <span>Zvuk</span>
            <small>Výchozí dnešní hlasitost = 50 %</small>
          </div>

          <label class="mq-volume-row" for="mqMusicVolume">
            <span class="mq-volume-copy"><strong>Hudba</strong><small>Hudební doprovod projekce</small></span>
            <span class="mq-volume-control">
              <input id="mqMusicVolume" type="range" min="0" max="100" step="1" value="50">
              <output id="mqMusicVolumeValue" for="mqMusicVolume">50 %</output>
            </span>
          </label>

          <label class="mq-volume-row" for="mqSfxVolume">
            <span class="mq-volume-copy"><strong>Herní zvuky</strong><small>Odpovědi, buzzer, Oscar, opona a další efekty</small></span>
            <span class="mq-volume-control">
              <input id="mqSfxVolume" type="range" min="0" max="100" step="1" value="50">
              <output id="mqSfxVolumeValue" for="mqSfxVolume">50 %</output>
            </span>
          </label>
        </div>

        <div class="mq-settings-foot">Hlasitost se ukládá pouze na tomto zařízení.</div>
      </section>`;

    (document.getElementById('screen')||document.body).appendChild(modal);
  }

  function setRangeFill(input){
    if(!input)return;
    input.style.setProperty('--mq-range',`${clamp(input.value)}%`);
  }

  function syncVolumeUi(){
    const music=document.getElementById('mqMusicVolume');
    const sfx=document.getElementById('mqSfxVolume');
    const musicValue=document.getElementById('mqMusicVolumeValue');
    const sfxValue=document.getElementById('mqSfxVolumeValue');

    const mv=musicVolume();
    const sv=sfxVolume();
    if(music){music.value=String(mv);setRangeFill(music)}
    if(sfx){sfx.value=String(sv);setRangeFill(sfx)}
    if(musicValue)musicValue.textContent=`${mv} %`;
    if(sfxValue)sfxValue.textContent=`${sv} %`;
  }

  function syncProfileUi(){
    const identity=currentIdentity();
    const name=document.getElementById('mqSettingsPlayerName');
    const hint=document.getElementById('mqSettingsProfileHint');
    const button=document.getElementById('mqSettingsAvatarButton');
    const frame=document.querySelector('#mqSettingsModal .mq-settings-avatar');
    const img=frame?.querySelector('img');

    if(name)name.textContent=identity.name||'Hráč';
    if(hint)hint.textContent=identity.guest?'Host používá automatický anonymní avatar.':'Avatar je uložený k vašemu hráčskému profilu.';
    if(button){
      button.hidden=identity.guest;
      button.disabled=identity.guest;
    }

    if(frame)frame.classList.toggle('is-guest',identity.guest);
    if(img){
      const fallback=identity.guest?'assets/avatars/guest_unknown.svg':'assets/avatars/popcorn_noir_01.png';
      img.src=identity.avatar?.path||fallback;
      img.alt=identity.guest?'Avatar hosta':`Avatar hráče ${identity.name||''}`;
    }
  }

  function sync(){
    ensureGear();
    ensureModal();
    syncVolumeUi();
    syncProfileUi();
  }

  function queueSync(){
    if(syncQueued)return;
    syncQueued=true;
    requestAnimationFrame(()=>{
      syncQueued=false;
      sync();
    });
  }

  function openSettings(){
    ensureModal();
    sync();
    const modal=document.getElementById('mqSettingsModal');
    if(!modal)return;
    modal.hidden=false;
    open=true;
    document.querySelector('.mq-settings-close')?.focus({preventScroll:true});
  }

  function closeSettings(){
    const modal=document.getElementById('mqSettingsModal');
    if(modal)modal.hidden=true;
    open=false;
  }

  function setVolume(kind,value){
    const v=clamp(value);
    if(kind==='music')write(MUSIC_KEY,v);
    else write(SFX_KEY,v);
    syncVolumeUi();
    applyVolumes(true);
    window.dispatchEvent(new CustomEvent('mq:volume-changed',{detail:{kind,value:v}}));
  }

  function bind(){
    document.addEventListener('click',event=>{
      const gear=event.target.closest?.('.mq-settings-gear');
      if(gear){
        event.preventDefault();
        event.stopPropagation();
        openSettings();
        return;
      }

      if(event.target.closest?.('[data-close-settings]')){
        event.preventDefault();
        closeSettings();
        return;
      }

      if(event.target.closest?.('#mqSettingsAvatarButton')){
        event.preventDefault();
        closeSettings();
        window.MovieQuizAvatars?.open?.();
      }
    });

    document.addEventListener('input',event=>{
      if(event.target?.id==='mqMusicVolume')setVolume('music',event.target.value);
      if(event.target?.id==='mqSfxVolume')setVolume('sfx',event.target.value);
    });

    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&open)closeSettings();
    });

    window.addEventListener('mq:guest-mode-changed',queueSync);
    window.addEventListener('mq:avatar-changed',queueSync);
    document.addEventListener('click',()=>{
      setTimeout(()=>applyVolumes(false),0);
    },true);
  }

  function init(){
    bind();
    sync();
    applyVolumes(false);
  }

  window.MovieQuizSettings=Object.freeze({
    version:VERSION,
    open:openSettings,
    close:closeSettings,
    getMusicVolume:musicVolume,
    getSfxVolume:sfxVolume,
    setMusicVolume:value=>setVolume('music',value),
    setSfxVolume:value=>setVolume('sfx',value),
    apply:()=>applyVolumes(false)
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
