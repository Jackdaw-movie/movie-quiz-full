(()=>{
  'use strict';

  const VERSION='avatar-system-v2.0-carousel';
  const DEFAULT_ID='popcorn_noir_01';
  const DEFAULT_PATH='assets/avatars/popcorn_noir_01.png';
  const GUEST_ID='guest_unknown';
  const GUEST_PATH='assets/avatars/guest_unknown.svg';

  let galleryOpen=false;
  let galleryLoading=false;
  let galleryRows=[];
  let carouselIndex=0;
  let wheelCooldown=0;
  let dragPointerId=null;
  let dragStartX=0;
  let scoreboardTimer=0;

  const onlineApi=()=>window.MovieQuizOnline;
  const isGuest=()=>window.__mqGuestMode===true;
  const currentProfile=()=>onlineApi()?.getProfile?.()||null;

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[char]);
  }

  function setTextIfChanged(element,value){
    if(!element)return;
    const next=String(value??'');
    if(element.textContent!==next)element.textContent=next;
  }

  function safePath(value,fallback=DEFAULT_PATH){
    const path=String(value||'');
    return /^assets\/avatars\/[A-Za-z0-9._/-]+$/.test(path)?path:fallback;
  }

  function currentAvatar(){
    if(isGuest()){
      return {id:GUEST_ID,label:'Host',path:GUEST_PATH,guest:true};
    }
    const profile=currentProfile();
    return {
      id:profile?.avatarId||DEFAULT_ID,
      label:profile?.avatarLabel||'Popcorn Noir',
      path:safePath(profile?.avatarPath,DEFAULT_PATH),
      guest:false
    };
  }

  function makeFrame(path,className='',guest=false,label='Avatar'){
    const frame=document.createElement('span');
    frame.className=`mq-avatar-frame ${className}${guest?' is-guest':''}`.trim();

    const img=document.createElement('img');
    img.className='mq-avatar-img';
    img.alt='Avatar';
    img.decoding='async';
    img.loading='eager';
    img.src=safePath(path,guest?GUEST_PATH:DEFAULT_PATH);
    img.addEventListener('error',()=>{
      if(img.dataset.fallback==='1')return;
      img.dataset.fallback='1';
      img.src=guest?GUEST_PATH:DEFAULT_PATH;
    });

    frame.appendChild(img);
    return frame;
  }

  function updateFrame(frame,avatar){
    if(!frame)return;
    frame.classList.toggle('is-guest',Boolean(avatar.guest));
    const img=frame.querySelector('img');
    if(!img)return;
    const path=safePath(avatar.path,avatar.guest?GUEST_PATH:DEFAULT_PATH);
    if(img.getAttribute('src')!==path){
      img.dataset.fallback='';
      img.src=path;
    }
    img.alt='Avatar';
  }

  function syncBadge(){
    const badge=document.getElementById('mqPlayerBadge');
    if(!badge)return;

    let frame=badge.querySelector('.mq-avatar-badge');
    if(!frame){
      frame=makeFrame(DEFAULT_PATH,'mq-avatar-badge',false,'Avatar hráče');
      badge.prepend(frame);
    }
    updateFrame(frame,currentAvatar());
  }

  function syncProfileCard(){
    const shell=document.getElementById('mqProfileShell');
    if(!shell)return;

    // Profilová karta zůstává čistá. Avatar se mění pouze přes Settings.
    shell.querySelectorAll('.mq-avatar-profile-row').forEach(node=>node.remove());
    shell.querySelectorAll('[data-open-avatar-gallery]').forEach(button=>{
      if(!button.closest?.('#mqAvatarModal'))button.remove();
    });
  }

  function syncStatisticsHeader(){
    const header=document.querySelector('#statisticsView .mq-stats-header');
    if(!header||isGuest())return;

    let wrap=header.querySelector('.mq-stats-profile-avatar');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='mq-stats-profile-avatar';
      const eyebrow=header.querySelector('.eyebrow');
      header.insertBefore(wrap,eyebrow||header.firstChild);
    }

    let frame=wrap.querySelector('.mq-avatar-frame');
    if(!frame){
      frame=makeFrame(DEFAULT_PATH,'',false,'Avatar hráče');
      wrap.appendChild(frame);
    }
    updateFrame(frame,currentAvatar());

    header.querySelectorAll('.mq-stats-avatar-action').forEach(button=>button.remove());
  }

  async function getPublicAvatars(names){
    const unique=[...new Set(names.filter(Boolean))].slice(0,25);
    if(!unique.length)return new Map();

    const api=onlineApi();
    if(!api?.ensureBackend)return new Map();
    const {client:db}=await api.ensureBackend();
    const {data,error}=await db.rpc('get_public_player_avatars',{p_nicknames:unique});
    if(error)throw error;

    const map=new Map();
    (Array.isArray(data)?data:[]).forEach(row=>{
      map.set(String(row.nickname||''),{
        id:row.avatar_id||DEFAULT_ID,
        label:row.nickname||'Hráč',
        path:safePath(row.asset_path,DEFAULT_PATH),
        guest:false
      });
    });
    return map;
  }

  async function enrichScoreboard(){
    const table=document.getElementById('mqScoreTable');
    if(!table)return;

    const rows=[...table.querySelectorAll('.mq-score-row:not(.mq-score-header)')];
    const pending=rows.filter(row=>!row.dataset.avatarEnriched);
    if(!pending.length)return;

    const names=pending.map(row=>row.querySelector('.mq-score-name')?.textContent?.trim()||'');
    let avatarMap=new Map();
    try{
      avatarMap=await getPublicAvatars(names);
    }catch(error){
      console.warn('Movie Quiz: avatary žebříčku se nepodařilo načíst.',error);
    }

    pending.forEach(row=>{
      const cell=row.querySelector('.mq-score-cell:first-child');
      const nameEl=cell?.querySelector('.mq-score-name');
      if(!cell||!nameEl){
        row.dataset.avatarEnriched='1';
        return;
      }

      const nickname=nameEl.textContent.trim();
      const avatar=avatarMap.get(nickname)||{
        id:DEFAULT_ID,label:nickname,path:DEFAULT_PATH,guest:false
      };

      const existingChildren=[...cell.childNodes];
      const copy=document.createElement('span');
      copy.className='mq-avatar-score-copy';
      existingChildren.forEach(child=>copy.appendChild(child));

      const frame=makeFrame(avatar.path,'mq-avatar-scoreboard',false,`Avatar hráče ${nickname}`);
      cell.classList.add('mq-avatar-score-cell');
      cell.append(frame,copy);
      row.dataset.avatarEnriched='1';
    });
  }

  function scheduleScoreboard(){
    clearTimeout(scoreboardTimer);
    scoreboardTimer=setTimeout(()=>enrichScoreboard(),60);
  }

  function wrapIndex(index){
    const total=galleryRows.length;
    if(!total)return 0;
    return ((index%total)+total)%total;
  }

  function selectedGalleryIndex(){
    const index=galleryRows.findIndex(row=>Boolean(row.selected));
    return index>=0?index:0;
  }

  function ensureModal(){
    if(document.getElementById('mqAvatarModal'))return;

    const modal=document.createElement('div');
    modal.id='mqAvatarModal';
    modal.className='mq-avatar-modal';
    modal.hidden=true;
    modal.innerHTML=`
      <div class="mq-avatar-modal-backdrop" data-close-avatar-gallery></div>
      <section class="mq-avatar-dialog" role="dialog" aria-modal="true" aria-labelledby="mqAvatarTitle">
        <div class="mq-avatar-dialog-head">
          <div>
            <div class="eyebrow">Hráčský profil</div>
            <h2 id="mqAvatarTitle">Vyberte avatar</h2>
            <p>Posouvejte šipkami, kolečkem nebo tažením. Prostřední avatar je právě vybraný pro potvrzení.</p>
          </div>
          <button type="button" class="mq-avatar-close" data-close-avatar-gallery aria-label="Zavřít">×</button>
        </div>

        <div class="mq-avatar-carousel-shell">
          <button type="button" class="mq-avatar-carousel-arrow is-prev" data-avatar-nav="-1" aria-label="Předchozí avatar">
            <span aria-hidden="true">‹</span>
          </button>
          <div class="mq-avatar-carousel-viewport" id="mqAvatarCarouselViewport" tabindex="0" aria-label="Výběr avatara">
            <div class="mq-avatar-carousel-stage" id="mqAvatarGrid"></div>
          </div>
          <button type="button" class="mq-avatar-carousel-arrow is-next" data-avatar-nav="1" aria-label="Další avatar">
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div class="mq-avatar-carousel-footer">
          <span class="mq-avatar-carousel-count" id="mqAvatarCounter" aria-live="polite"></span>
          <button type="button" class="mq-avatar-confirm" id="mqAvatarConfirm" data-avatar-confirm>Vybrat avatara</button>
        </div>
        <div class="mq-avatar-modal-status" id="mqAvatarStatus" aria-live="polite"></div>
        <p class="mq-avatar-modal-note">Výběr se uloží k vašemu profilu.</p>
      </section>`;

    document.body.appendChild(modal);

    const viewport=modal.querySelector('#mqAvatarCarouselViewport');
    viewport?.addEventListener('wheel',event=>{
      if(!galleryOpen||galleryRows.length<2)return;
      event.preventDefault();
      const now=performance.now();
      if(now<wheelCooldown)return;
      const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(Math.abs(delta)<3)return;
      wheelCooldown=now+145;
      moveCarousel(delta>0?1:-1);
    },{passive:false});

    viewport?.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      dragPointerId=event.pointerId;
      dragStartX=event.clientX;
      viewport.setPointerCapture?.(event.pointerId);
    });
    viewport?.addEventListener('pointerup',event=>{
      if(dragPointerId!==event.pointerId)return;
      const delta=event.clientX-dragStartX;
      dragPointerId=null;
      if(Math.abs(delta)>=34)moveCarousel(delta<0?1:-1);
    });
    viewport?.addEventListener('pointercancel',()=>{dragPointerId=null;});
  }

  function currentCarouselRow(){
    return galleryRows.length?galleryRows[wrapIndex(carouselIndex)]:null;
  }

  function moveCarousel(delta){
    if(galleryRows.length<2)return;
    carouselIndex=wrapIndex(carouselIndex+delta);
    renderGallery();
  }

  function setCarouselIndex(index){
    if(!galleryRows.length)return;
    carouselIndex=wrapIndex(Number(index)||0);
    renderGallery();
  }

  function renderGallery(){
    const stage=document.getElementById('mqAvatarGrid');
    const counter=document.getElementById('mqAvatarCounter');
    const confirm=document.getElementById('mqAvatarConfirm');
    if(!stage)return;

    if(!galleryRows.length){
      stage.innerHTML='<div class="mq-score-empty">Zatím není k dispozici žádný avatar.</div>';
      if(counter)counter.textContent='';
      if(confirm){confirm.disabled=true;confirm.textContent='Vybrat avatara';}
      return;
    }

    const total=galleryRows.length;
    const slots=[-2,-1,0,1,2];
    stage.innerHTML=slots.map(offset=>{
      const index=wrapIndex(carouselIndex+offset);
      const row=galleryRows[index];
      const selected=Boolean(row.selected);
      const unlocked=Boolean(row.unlocked);
      const selectable=Boolean(row.selectable);
      const available=unlocked&&selectable;
      const distance=Math.abs(offset);
      const slotClass=offset===0?'is-center':offset<0?`is-left-${distance}`:`is-right-${distance}`;
      const stateClass=selected?' is-current':'';
      const lockedClass=available?'':' is-locked';
      const ariaState=selected?', aktuálně používaný':'';
      return `
        <button type="button"
          class="mq-avatar-carousel-choice ${slotClass}${stateClass}${lockedClass}"
          data-carousel-index="${index}"
          aria-label="Avatar ${index+1} z ${total}${ariaState}"
          aria-current="${offset===0?'true':'false'}"
          tabindex="${offset===0?'0':'-1'}">
          <span class="mq-avatar-frame">
            <img class="mq-avatar-img" src="${escapeHtml(safePath(row.asset_path,DEFAULT_PATH))}" alt="" decoding="async" loading="${distance<=1?'eager':'lazy'}">
          </span>
          ${selected?'<span class="mq-avatar-current-mark" aria-hidden="true">✓</span>':''}
        </button>`;
    }).join('');

    const row=currentCarouselRow();
    const available=Boolean(row?.unlocked)&&Boolean(row?.selectable);
    const selected=Boolean(row?.selected);
    if(counter)counter.textContent=`${String(wrapIndex(carouselIndex)+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    if(confirm){
      confirm.disabled=!row||!available||selected;
      confirm.textContent=selected?'Aktuálně vybraný':available?'Použít avatara':'Avatar je zamčený';
    }
  }

  async function loadGallery(){
    if(galleryLoading)return;
    const status=document.getElementById('mqAvatarStatus');
    galleryLoading=true;
    if(status)status.textContent='Načítám galerii…';

    try{
      const api=onlineApi();
      if(!api?.ensureBackend)throw new Error('Online profil není připravený.');
      const {client:db}=await api.ensureBackend();
      const {data,error}=await db.rpc('list_my_player_avatars');
      if(error)throw error;
      galleryRows=Array.isArray(data)?data:[];
      carouselIndex=selectedGalleryIndex();
      renderGallery();
      if(status)status.textContent='';
    }catch(error){
      if(status)status.textContent='Galerii se nepodařilo načíst.';
      console.error('Movie Quiz: galerie avatarů se nepodařila načíst.',error);
    }finally{
      galleryLoading=false;
    }
  }

  async function chooseAvatar(avatarId,button){
    if(!avatarId||button?.disabled)return;
    const status=document.getElementById('mqAvatarStatus');
    if(status)status.textContent='Ukládám avatar…';
    if(button)button.disabled=true;

    try{
      const api=onlineApi();
      const {client:db}=await api.ensureBackend();
      const {data,error}=await db.rpc('set_my_player_avatar',{p_avatar_id:avatarId});
      if(error)throw error;

      const result=Array.isArray(data)?data[0]:data;
      if(!result?.ok)throw new Error(result?.error||'Avatar se nepodařilo uložit.');

      await api.refreshProfileState();
      galleryRows=galleryRows.map(row=>({...row,selected:row.avatar_id===avatarId}));
      renderGallery();
      syncAll();
      scheduleScoreboard();
      window.dispatchEvent(new CustomEvent('mq:avatar-changed',{detail:{avatarId}}));
      if(status)status.textContent='Avatar byl uložen.';
    }catch(error){
      console.error('Movie Quiz: avatar se nepodařilo uložit.',error);
      if(status)status.textContent='Avatar se nepodařilo uložit.';
    }finally{
      if(button)button.disabled=false;
      renderGallery();
    }
  }

  function openGallery(){
    if(isGuest())return;
    if(!currentProfile()?.profileId)return;

    ensureModal();
    const modal=document.getElementById('mqAvatarModal');
    modal.hidden=false;
    galleryOpen=true;
    if(galleryRows.length){
      carouselIndex=selectedGalleryIndex();
      renderGallery();
    }else{
      loadGallery();
    }
    requestAnimationFrame(()=>document.getElementById('mqAvatarCarouselViewport')?.focus({preventScroll:true}));
  }

  function closeGallery(){
    const modal=document.getElementById('mqAvatarModal');
    if(modal)modal.hidden=true;
    galleryOpen=false;
    dragPointerId=null;
  }

  function syncAll(){
    syncBadge();
    syncProfileCard();
    syncStatisticsHeader();
  }

  function observe(){
    const shell=document.getElementById('mqProfileShell');
    if(shell){
      let profileSyncQueued=false;
      const queueProfileSync=()=>{
        if(profileSyncQueued)return;
        profileSyncQueued=true;
        queueMicrotask(()=>{
          profileSyncQueued=false;
          syncProfileCard();
        });
      };
      new MutationObserver(mutations=>{
        const relevant=mutations.some(mutation=>{
          if(mutation.type!=='childList')return false;
          return Array.from(mutation.addedNodes).some(node=>{
            if(!(node instanceof Element))return false;
            return (
              node.matches?.('.mq-profile-linked,.mq-avatar-profile-row,[data-open-avatar-gallery]')
              || node.querySelector?.('.mq-profile-linked,.mq-avatar-profile-row,[data-open-avatar-gallery]')
            );
          });
        });
        if(relevant)queueProfileSync();
      }).observe(shell,{childList:true,subtree:true});
    }

    const table=document.getElementById('mqScoreTable');
    if(table){
      new MutationObserver(scheduleScoreboard).observe(table,{childList:true,subtree:true});
    }

    const stats=document.getElementById('statisticsView');
    if(stats){
      new MutationObserver(()=>syncStatisticsHeader()).observe(stats,{childList:true,subtree:true});
    }
  }

  function bind(){
    document.addEventListener('click',event=>{
      if(event.target.closest?.('[data-open-avatar-gallery]')){
        event.preventDefault();
        openGallery();
        return;
      }

      if(event.target.closest?.('[data-close-avatar-gallery]')){
        event.preventDefault();
        closeGallery();
        return;
      }

      const nav=event.target.closest?.('[data-avatar-nav]');
      if(nav){
        event.preventDefault();
        moveCarousel(Number(nav.dataset.avatarNav)||0);
        return;
      }

      const choice=event.target.closest?.('[data-carousel-index]');
      if(choice){
        event.preventDefault();
        setCarouselIndex(choice.dataset.carouselIndex);
        return;
      }

      const confirm=event.target.closest?.('[data-avatar-confirm]');
      if(confirm){
        event.preventDefault();
        const row=currentCarouselRow();
        if(row)chooseAvatar(row.avatar_id,confirm);
      }
    });

    document.addEventListener('keydown',event=>{
      if(!galleryOpen)return;
      if(event.key==='Escape'){
        event.preventDefault();
        closeGallery();
        return;
      }
      if(event.key==='ArrowLeft'){
        event.preventDefault();
        moveCarousel(-1);
        return;
      }
      if(event.key==='ArrowRight'){
        event.preventDefault();
        moveCarousel(1);
        return;
      }
      if(event.key==='Enter'&&event.target.closest?.('#mqAvatarCarouselViewport')){
        event.preventDefault();
        const confirm=document.getElementById('mqAvatarConfirm');
        const row=currentCarouselRow();
        if(row&&confirm&&!confirm.disabled)chooseAvatar(row.avatar_id,confirm);
      }
    });

    window.addEventListener('mq:guest-mode-changed',syncAll);
    window.addEventListener('mq:avatar-changed',syncAll);
  }

  async function init(){
    ensureModal();
    bind();

    try{
      await onlineApi()?.ensureBackend?.();
      await onlineApi()?.refreshProfileState?.();
    }catch(_){}

    syncAll();
    observe();
    scheduleScoreboard();
  }

  window.MovieQuizAvatars=Object.freeze({
    version:VERSION,
    open:openGallery,
    close:closeGallery,
    refresh:syncAll,
    current:currentAvatar
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();