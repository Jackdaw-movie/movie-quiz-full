(()=>{
  'use strict';

  const VERSION='player-settings-v2-cinema-shell';
  const MUSIC_KEY='movieQuizMusicVolumeV1';
  const SFX_KEY='movieQuizSfxVolumeV1';
  const MUSIC_BEFORE_MUTE_KEY='movieQuizMusicBeforeMuteV1';
  const SFX_BEFORE_MUTE_KEY='movieQuizSfxBeforeMuteV1';

  const DEFAULT_VOLUME=50;
  const BASE_MUSIC_GAIN=1.6848;
  const BASE_SFX_GAIN=.82;
  const MASTER_GAIN=.96;

  let menuOpen=false;
  let audioPatched=false;
  let avatarObserver=null;
  let shellObserver=null;
  let shellSyncQueued=false;

  function clamp(value){
    const number=Number(value);
    return Number.isFinite(number)
      ? Math.max(0,Math.min(100,Math.round(number)))
      : DEFAULT_VOLUME;
  }

  function read(key,fallback=DEFAULT_VOLUME){
    try{
      const raw=localStorage.getItem(key);
      return raw===null ? fallback : clamp(raw);
    }catch(_){
      return fallback;
    }
  }

  function write(key,value){
    try{
      localStorage.setItem(key,String(clamp(value)));
    }catch(_){}
  }

  function musicVolume(){return read(MUSIC_KEY)}
  function sfxVolume(){return read(SFX_KEY)}
  function scale(percent){return clamp(percent)/50}

  function currentIdentity(){
    const guest=window.__mqGuestMode===true;
    const api=window.MovieQuizOnline;
    const profile=api?.getProfile?.()||null;
    const name=guest
      ? 'Host'
      : (api?.getPlayerName?.()||profile?.nickname||'Hráč');
    const avatar=window.MovieQuizAvatars?.current?.()||null;
    return {guest,name,avatar};
  }

  function setTextIfChanged(element,value){
    if(!element)return;
    const next=String(value??'');
    if(element.textContent!==next)element.textContent=next;
  }

  function normalizeText(value){
    return String(value??'').replace(/\s+/g,' ').trim();
  }

  function gearSvg(){
    return `<svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M13.5 4.2h5l.8 3a10 10 0 0 1 2.2.9l2.7-1.5 3.5 3.5-1.5 2.7c.4.7.7 1.4.9 2.2l3 .8v5l-3 .8a10 10 0 0 1-.9 2.2l1.5 2.7-3.5 3.5-2.7-1.5a10 10 0 0 1-2.2.9l-.8 3h-5l-.8-3a10 10 0 0 1-2.2-.9L7.8 30l-3.5-3.5 1.5-2.7a10 10 0 0 1-.9-2.2l-3-.8v-5l3-.8c.2-.8.5-1.5.9-2.2l-1.5-2.7 3.5-3.5 2.7 1.5a10 10 0 0 1 2.2-.9z"/>
      <circle cx="16" cy="18.3" r="4.6"/>
    </svg>`;
  }

  function speakerSvg(muted=false){
    if(muted){
      return `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z"/>
        <path d="M17 9l5 6M22 9l-5 6"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z"/>
      <path d="M17 8c2.5 2.3 2.5 5.7 0 8"/>
    </svg>`;
  }

  function movePlayerDockOutsideScreen(){
    const badge=document.getElementById('mqPlayerBadge');
    const cinema=document.getElementById('cinema');
    if(!badge||!cinema)return;

    if(badge.parentElement!==cinema){
      cinema.appendChild(badge);
    }
    badge.classList.add('mq-player-dock');
  }

  function moveHomeDockOutsideScreen(){
    const home=document.getElementById('homeBtn');
    const cinema=document.getElementById('cinema');
    if(!home||!cinema)return;
    if(home.parentElement!==cinema)cinema.appendChild(home);
    home.classList.add('mq-home-dock');
    if(home.tagName==='BUTTON'){
      home.setAttribute('title','Domů');
      home.setAttribute('aria-label','Domů');
    }
  }

  function ensureCinemaMasthead(){
    const cinema=document.getElementById('cinema');
    if(!cinema)return null;

    let masthead=cinema.querySelector('#mqCinemaMasthead');
    if(!masthead){
      masthead=document.createElement('div');
      masthead.id='mqCinemaMasthead';
      masthead.className='mq-cinema-masthead';
      masthead.innerHTML='<span>Kino noir</span><strong>Movie Quiz</strong>';
      cinema.appendChild(masthead);
    }
    return masthead;
  }

  function refreshShellLayout(){
    const body=document.body;
    const cinema=document.getElementById('cinema');
    const screen=document.getElementById('screen');

    if(body)body.classList.add('mq-noir-shell');
    if(cinema)cinema.classList.add('mq-noir-shell');
    if(screen)screen.classList.add('mq-noir-screen');

    movePlayerDockOutsideScreen();
    moveHomeDockOutsideScreen();
    ensureCinemaMasthead();
  }

  function replaceLeadText(scope,text){
    if(!scope||!text)return;
    const target=scope.querySelector('.mq-profile-subtitle, .mq-selection-subtitle, .subtitle, p');
    if(target){
      target.hidden=false;
      setTextIfChanged(target,text);
      target.dataset.mqPlayerFacingLead='1';
    }
  }

  function ensureUxHint(scope,id,text){
    if(!scope||!id||!text)return;

    let host=scope.querySelector('[data-mq-ux-hints]');
    if(!host){
      host=document.createElement('div');
      host.className='mq-selection-ux-hints';
      host.dataset.mqUxHints='1';

      const anchor=
        scope.querySelector('.mq-profile-step, .mq-selection-header, h1, h2, h3') ||
        scope.firstElementChild ||
        scope;
      anchor.insertAdjacentElement?.('afterend',host);
      if(host.parentElement!==scope)scope.prepend(host);
    }

    let hint=host.querySelector(`[data-mq-ux-hint="${id}"]`);
    if(!hint){
      hint=document.createElement('div');
      hint.className='mq-selection-ux-hint';
      hint.dataset.mqUxHint=id;
      host.appendChild(hint);
    }

    setTextIfChanged(hint,text);
  }

  function hideNonPlayerCopy(scope){
    if(!scope)return;
    const reject=/(metodik|metodika|složen|sklád|výběr\s+otázek|otázky\s+jsou|databáz|server|lokáln(?:í|i)\s+banka|review|verif|ověř|kurát|poměr|mix\s+typ|typy\s+otázek|metoda|zdroj|jak\s+jsou\s+otázky)/i;

    scope.querySelectorAll('p, small, .mq-note, .mq-profile-note, .mq-selection-note, li').forEach(node=>{
      const text=normalizeText(node.textContent);
      if(!text)return;
      if(node.dataset.mqPlayerFacingLead==='1')return;
      if(node.closest?.('.mq-selection-ux-hints'))return;

      if(reject.test(text)){
        node.hidden=true;
        node.dataset.mqHiddenNonPlayer='1';
      }
    });
  }

  function cleanupPlayerFacingCopy(){
    const playerView=document.getElementById('playerView');
    const difficulty=document.getElementById('difficulty');
    const genres=document.getElementById('genres');

    if(playerView){
      replaceLeadText(
        playerView,
        'Pokračujte se svým profilem, přihlaste se jiným hráčem nebo vstupte jako host.'
      );
      ensureUxHint(
        playerView,
        'profile',
        'Tip: profil si hra pamatuje na tomto zařízení, host zůstává bez statistik a žebříčku.'
      );
    }

    if(difficulty){
      replaceLeadText(
        difficulty,
        'Vyberte si náročnost projekce. Lehká je přístupná, střední prověří přehled a těžká míří na zkušené filmové hráče.'
      );
      ensureUxHint(
        difficulty,
        'difficulty',
        'Obtížnost určuje jen náročnost otázek. Ovládání i cíl hry zůstávají stejné.'
      );
      hideNonPlayerCopy(difficulty);
    }

    if(genres){
      replaceLeadText(
        genres,
        'Zvolte žánr podle nálady. Jakmile vyberete, projekce se okamžitě rozjede.'
      );
      ensureUxHint(
        genres,
        'genre',
        'Tip: Náhodně promíchá více žánrů, ostatní volby drží jednotnou atmosféru.'
      );
      hideNonPlayerCopy(genres);
    }
  }

  function queueShellSync(){
    if(shellSyncQueued)return;
    shellSyncQueued=true;
    queueMicrotask(()=>{
      shellSyncQueued=false;
      refreshShellLayout();
      cleanupPlayerFacingCopy();
      if(menuOpen)positionMenu();
    });
  }

  function observeShell(){
    const screen=document.getElementById('screen');
    if(!screen)return;

    if(shellObserver)shellObserver.disconnect();

    shellObserver=new MutationObserver(()=>queueShellSync());
    shellObserver.observe(screen,{childList:true,subtree:true});
  }

  function ensureGear(){
    movePlayerDockOutsideScreen();

    const badge=document.getElementById('mqPlayerBadge');
    if(!badge)return null;

    let button=badge.querySelector('.mq-settings-gear');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='mq-settings-gear';
      button.setAttribute('aria-label','Otevřít nastavení');
      button.setAttribute('title','Nastavení');
      button.setAttribute('aria-expanded','false');
      button.innerHTML=gearSvg();
      badge.appendChild(button);
    }

    if(button.dataset.mqSettingsBound!=='1'){
      button.dataset.mqSettingsBound='1';
      button.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        toggleMenu();
      });
    }

    return button;
  }

  function ensureMenu(){
    let menu=document.getElementById('mqSettingsMenu');
    if(menu)return menu;

    menu=document.createElement('section');
    menu.id='mqSettingsMenu';
    menu.className='mq-settings-menu';
    menu.hidden=true;
    menu.setAttribute('role','dialog');
    menu.setAttribute('aria-label','Nastavení Movie Quiz');

    menu.innerHTML=`
      <div class="mq-settings-menu-head">
        <div>
          <span>Nastavení</span>
          <strong id="mqSettingsPlayerName">Hráč</strong>
        </div>
        <button type="button" class="mq-settings-menu-close" aria-label="Zavřít nastavení">×</button>
      </div>

      <div class="mq-settings-profile">
        <span class="mq-settings-avatar mq-avatar-frame">
          <img class="mq-avatar-img" alt="">
        </span>
        <div class="mq-settings-profile-main">
          <strong id="mqSettingsIdentityName">Hráč</strong>
          <small id="mqSettingsProfileHint"></small>
        </div>
        <button type="button" class="mq-settings-avatar-button" id="mqSettingsAvatarButton">
          Změnit avatar
        </button>
      </div>

      <div class="mq-settings-section">
        <div class="mq-settings-section-title">
          <strong>Zvuk</strong>
          <small>50 % = dosavadní hlasitost</small>
        </div>

        <div class="mq-volume-row" data-volume-kind="music">
          <div class="mq-volume-label">
            <strong>Hudba</strong>
            <small>Hudební doprovod projekce</small>
          </div>
          <div class="mq-volume-controls">
            <input id="mqMusicVolume" type="range" min="0" max="100" step="1" value="50" aria-label="Hlasitost hudby">
            <output id="mqMusicVolumeValue" for="mqMusicVolume">50 %</output>
            <button type="button" class="mq-volume-toggle" id="mqMusicToggle" aria-label="Vypnout hudbu"></button>
          </div>
        </div>

        <div class="mq-volume-row" data-volume-kind="sfx">
          <div class="mq-volume-label">
            <strong>Herní zvuky</strong>
            <small>Odpovědi, buzzer, Oscar, opona a další efekty</small>
          </div>
          <div class="mq-volume-controls">
            <input id="mqSfxVolume" type="range" min="0" max="100" step="1" value="50" aria-label="Hlasitost herních zvuků">
            <output id="mqSfxVolumeValue" for="mqSfxVolume">50 %</output>
            <button type="button" class="mq-volume-toggle" id="mqSfxToggle" aria-label="Vypnout herní zvuky"></button>
          </div>
        </div>
      </div>

      <div class="mq-settings-foot">
        Nastavení zvuku se ukládá na tomto zařízení.
      </div>
    `;

    document.body.appendChild(menu);

    menu.querySelector('.mq-settings-menu-close')?.addEventListener('click',closeMenu);
    menu.querySelector('#mqSettingsAvatarButton')?.addEventListener('click',()=>{
      closeMenu();
      window.MovieQuizAvatars?.open?.();
    });

    const music=menu.querySelector('#mqMusicVolume');
    const sfx=menu.querySelector('#mqSfxVolume');

    music?.addEventListener('input',()=>setVolume('music',music.value,true));
    sfx?.addEventListener('input',()=>setVolume('sfx',sfx.value,true));

    menu.querySelector('#mqMusicToggle')?.addEventListener('click',()=>toggleChannel('music'));
    menu.querySelector('#mqSfxToggle')?.addEventListener('click',()=>toggleChannel('sfx'));

    return menu;
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
    const musicToggle=document.getElementById('mqMusicToggle');
    const sfxToggle=document.getElementById('mqSfxToggle');

    const mv=musicVolume();
    const sv=sfxVolume();

    if(music){
      music.value=String(mv);
      setRangeFill(music);
    }
    if(sfx){
      sfx.value=String(sv);
      setRangeFill(sfx);
    }
    if(musicValue)musicValue.textContent=`${mv} %`;
    if(sfxValue)sfxValue.textContent=`${sv} %`;

    syncToggleButton(musicToggle,'music',mv);
    syncToggleButton(sfxToggle,'sfx',sv);
  }

  function syncToggleButton(button,kind,value){
    if(!button)return;
    const muted=clamp(value)===0;
    button.classList.toggle('is-muted',muted);
    button.setAttribute('aria-pressed',String(muted));

    const label=kind==='music'?'hudbu':'herní zvuky';
    button.setAttribute('aria-label',muted?`Zapnout ${label}`:`Vypnout ${label}`);
    button.innerHTML=speakerSvg(muted);
  }

  function syncProfileUi(){
    const identity=currentIdentity();
    const name=document.getElementById('mqSettingsPlayerName');
    const identityName=document.getElementById('mqSettingsIdentityName');
    const hint=document.getElementById('mqSettingsProfileHint');
    const button=document.getElementById('mqSettingsAvatarButton');
    const frame=document.querySelector('#mqSettingsMenu .mq-settings-avatar');
    const img=frame?.querySelector('img');

    if(name)name.textContent=identity.name||'Hráč';
    if(identityName)identityName.textContent=identity.name||'Hráč';

    if(hint){
      hint.textContent=identity.guest
        ? 'Host používá automatický anonymní avatar.'
        : 'Avatar je uložený k vašemu profilu.';
    }

    if(button){
      button.hidden=identity.guest;
      button.disabled=identity.guest;
    }

    if(frame)frame.classList.toggle('is-guest',identity.guest);

    if(img){
      const fallback=identity.guest
        ? 'assets/avatars/guest_unknown.svg'
        : 'assets/avatars/popcorn_noir_01.png';

      const next=identity.avatar?.path||fallback;
      if(img.getAttribute('src')!==next)img.src=next;

      // Názvy avatarů jsou interní informace.
      img.alt='';
    }
  }

  function unmuteLegacyMaster(){
    try{
      if(typeof state!=='undefined'&&state)state.muted=false;

      const oldButton=document.getElementById('muteBtn');
      if(oldButton){
        oldButton.classList.remove('muted');
        oldButton.setAttribute('aria-hidden','true');
        oldButton.tabIndex=-1;
      }

      if(typeof audioCtx!=='undefined'&&audioCtx&&typeof masterGain!=='undefined'&&masterGain){
        masterGain.gain.setTargetAtTime(MASTER_GAIN,audioCtx.currentTime,.025);
      }
    }catch(_){}
  }

  function applyVolumes(smooth=true){
    try{
      if(typeof audioCtx==='undefined'||!audioCtx)return false;

      unmuteLegacyMaster();

      const now=audioCtx.currentTime||0;
      const musicTarget=BASE_MUSIC_GAIN*scale(musicVolume());
      const sfxTarget=BASE_SFX_GAIN*scale(sfxVolume());

      if(typeof musicGain!=='undefined'&&musicGain){
        if(smooth&&musicGain.gain?.setTargetAtTime){
          musicGain.gain.setTargetAtTime(musicTarget,now,.035);
        }else{
          musicGain.gain.value=musicTarget;
        }
      }

      if(typeof sfxGain!=='undefined'&&sfxGain){
        if(smooth&&sfxGain.gain?.setTargetAtTime){
          sfxGain.gain.setTargetAtTime(sfxTarget,now,.035);
        }else{
          sfxGain.gain.value=sfxTarget;
        }
      }
      return true;
    }catch(error){
      console.warn('Movie Quiz Settings: hlasitost se nepodařilo aplikovat.',error);
      return false;
    }
  }

  function ensureAudioFromUserGesture(){
    try{
      if(typeof initAudio==='function')initAudio();
      if(typeof audioCtx!=='undefined'&&audioCtx?.state==='suspended'){
        audioCtx.resume?.().catch?.(()=>{});
      }
    }catch(_){}
    applyVolumes(false);
  }

  function patchAudioInit(){
    if(audioPatched)return;
    if(typeof initAudio!=='function')return;

    const original=initAudio;
    initAudio=function(){
      const result=original.apply(this,arguments);
      setTimeout(()=>applyVolumes(false),0);
      return result;
    };

    audioPatched=true;
  }

  function setVolume(kind,value,fromUser=false){
    const v=clamp(value);

    if(kind==='music'){
      write(MUSIC_KEY,v);
      if(v>0)write(MUSIC_BEFORE_MUTE_KEY,v);
    }else{
      write(SFX_KEY,v);
      if(v>0)write(SFX_BEFORE_MUTE_KEY,v);
    }

    if(fromUser)ensureAudioFromUserGesture();
    syncVolumeUi();
    applyVolumes(true);

    window.dispatchEvent(new CustomEvent('mq:volume-changed',{
      detail:{kind,value:v,version:VERSION}
    }));
  }

  function toggleChannel(kind){
    const isMusic=kind==='music';
    const key=isMusic?MUSIC_KEY:SFX_KEY;
    const restoreKey=isMusic?MUSIC_BEFORE_MUTE_KEY:SFX_BEFORE_MUTE_KEY;
    const current=isMusic?musicVolume():sfxVolume();

    if(current===0){
      const restored=Math.max(1,read(restoreKey,DEFAULT_VOLUME));
      setVolume(kind,restored,true);
    }else{
      write(restoreKey,current);
      setVolume(kind,0,true);
    }
  }

  function sanitizeAvatarUi(){
    // Interní názvy avatarů se nikde v hráčském UI nezobrazují ani
    // nepoužívají jako přístupný název volby.
    document.querySelectorAll('#mqAvatarGrid .mq-avatar-choice').forEach(choice=>{
      const selected=choice.classList.contains('is-selected');
      choice.setAttribute(
        'aria-label',
        selected?'Aktuálně vybraný avatar':'Vybrat avatar'
      );

      const img=choice.querySelector('img');
      if(img)img.alt='';

      const label=choice.querySelector('strong');
      if(label)label.setAttribute('aria-hidden','true');
    });
  }

  function observeAvatarGallery(){
    const grid=document.getElementById('mqAvatarGrid');
    if(!grid)return;

    if(avatarObserver)avatarObserver.disconnect();

    avatarObserver=new MutationObserver(()=>{
      queueMicrotask(sanitizeAvatarUi);
    });
    avatarObserver.observe(grid,{childList:true,subtree:true});
    sanitizeAvatarUi();
  }

  function positionMenu(){
    const menu=document.getElementById('mqSettingsMenu');
    const gear=document.querySelector('#mqPlayerBadge .mq-settings-gear');
    if(!menu||!gear||menu.hidden)return;

    const rect=gear.getBoundingClientRect();
    const margin=12;
    const gap=10;

    menu.style.left='0px';
    menu.style.top='0px';

    const box=menu.getBoundingClientRect();

    let left=rect.left;
    let top=rect.bottom+gap;

    if(left+box.width>window.innerWidth-margin){
      left=window.innerWidth-box.width-margin;
    }
    if(left<margin)left=margin;

    if(top+box.height>window.innerHeight-margin){
      top=rect.top-box.height-gap;
    }
    if(top<margin)top=margin;

    menu.style.left=`${Math.round(left)}px`;
    menu.style.top=`${Math.round(top)}px`;
  }

  function openMenu(){
    ensureGear();
    const menu=ensureMenu();

    syncProfileUi();
    syncVolumeUi();
    sanitizeAvatarUi();

    ensureAudioFromUserGesture();

    menu.hidden=false;
    menuOpen=true;

    const gear=document.querySelector('#mqPlayerBadge .mq-settings-gear');
    gear?.setAttribute('aria-expanded','true');

    requestAnimationFrame(()=>{
      menu.classList.add('is-open');
      positionMenu();
    });
  }

  function closeMenu(){
    const menu=document.getElementById('mqSettingsMenu');
    const gear=document.querySelector('#mqPlayerBadge .mq-settings-gear');

    gear?.setAttribute('aria-expanded','false');
    menuOpen=false;

    if(!menu)return;

    menu.classList.remove('is-open');
    setTimeout(()=>{
      if(!menuOpen)menu.hidden=true;
    },130);
  }

  function toggleMenu(){
    if(menuOpen)closeMenu();
    else openMenu();
  }

  function sync(){
    refreshShellLayout();
    ensureGear();
    ensureMenu();
    syncProfileUi();
    syncVolumeUi();
    unmuteLegacyMaster();
    cleanupPlayerFacingCopy();

    const oldMute=document.getElementById('muteBtn');
    if(oldMute){
      oldMute.hidden=true;
      oldMute.setAttribute('aria-hidden','true');
      oldMute.tabIndex=-1;
    }

    observeAvatarGallery();
    sanitizeAvatarUi();
    if(menuOpen)positionMenu();
  }

  function bindGlobalEvents(){
    document.addEventListener('click',event=>{
      if(!menuOpen)return;

      const menu=event.target.closest?.('#mqSettingsMenu');
      const gear=event.target.closest?.('.mq-settings-gear');

      if(!menu&&!gear)closeMenu();
    });

    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&menuOpen)closeMenu();
    });

    window.addEventListener('resize',()=>{
      if(menuOpen)positionMenu();
    },{passive:true});

    window.addEventListener('scroll',()=>{
      if(menuOpen)positionMenu();
    },{passive:true,capture:true});

    window.addEventListener('mq:guest-mode-changed',()=>{
      setTimeout(sync,0);
    });

    window.addEventListener('mq:avatar-changed',()=>{
      setTimeout(()=>{
        syncProfileUi();
        sanitizeAvatarUi();
      },0);
    });

    window.addEventListener('mq:server-question-rendered',queueShellSync);
    window.addEventListener('load',queueShellSync);
  }

  function init(){
    patchAudioInit();
    bindGlobalEvents();
    sync();
    observeShell();

    // Badge a avatarový modul už normálně existují, ale tyto opakované
    // průchody pokrývají pomalejší načtení Supabase a pozdější přepnutí view.
    setTimeout(sync,250);
    setTimeout(sync,900);
    setTimeout(queueShellSync,1400);
  }

  window.MovieQuizSettings=Object.freeze({
    version:VERSION,
    open:openMenu,
    close:closeMenu,
    musicVolume,
    sfxVolume,
    setMusicVolume:value=>setVolume('music',value,true),
    setSfxVolume:value=>setVolume('sfx',value,true),
    toggleMusic:()=>toggleChannel('music'),
    toggleSfx:()=>toggleChannel('sfx'),
    apply:()=>applyVolumes(false)
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();