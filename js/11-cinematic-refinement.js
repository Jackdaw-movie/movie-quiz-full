(()=>{
  'use strict';

  const awardV2 = () => `
  <svg class="mq-award-svg mq-award-v2" viewBox="0 0 180 430" role="img" aria-label="Zlatá filmová soška">
    <defs>
      <linearGradient id="mqGoldBodyV2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7f4908"/><stop offset=".10" stop-color="#e6a926"/>
        <stop offset=".23" stop-color="#fff2a2"/><stop offset=".38" stop-color="#b87308"/>
        <stop offset=".55" stop-color="#ffe77a"/><stop offset=".72" stop-color="#8d5108"/>
        <stop offset=".88" stop-color="#f8c94f"/><stop offset="1" stop-color="#704008"/>
      </linearGradient>
      <linearGradient id="mqGoldEdgeV2" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#fff7c8"/><stop offset=".45" stop-color="#c47b0a"/><stop offset="1" stop-color="#fff0a0"/>
      </linearGradient>
      <linearGradient id="mqBaseGoldV2" x1="0" y1="0" x2="1" y2="0">
        <stop stop-color="#6e3a05"/><stop offset=".25" stop-color="#ffd65d"/><stop offset=".58" stop-color="#9e5c07"/><stop offset=".83" stop-color="#ffe891"/><stop offset="1" stop-color="#603205"/>
      </linearGradient>
      <linearGradient id="mqBaseBlackV2" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#24262c"/><stop offset=".55" stop-color="#08090c"/><stop offset="1" stop-color="#1b1d23"/>
      </linearGradient>
    </defs>
    <ellipse cx="90" cy="39" rx="21" ry="28" class="gold-body"/>
    <path class="gold-body" d="M72 62C55 69 47 83 48 105c1 22 10 43 20 60l-7 46 8 87 11 58h20l11-58 8-87-7-46c10-17 19-38 20-60 1-22-7-36-24-43-9 11-27 11-36 0z"/>
    <path class="dark-cut" d="M84 87c-15 9-27 21-32 36 3 15 9 28 17 42l9-9-10-35 18-18z"/>
    <path class="dark-cut" d="M96 87c15 9 27 21 32 36-3 15-9 28-17 42l-9-9 10-35-18-18z"/>
    <path class="gold-body" d="M76 106l14 29 14-29 14 13-15 44-13 11-13-11-15-44z"/>
    <path class="gold-edge" d="M90 68v34M66 121l24 14 24-14M90 174v170"/>
    <path class="shine" d="M78 18c-8 10-7 28-1 38M63 77c-9 18-8 39 1 58M77 184l-5 101 10 57"/>
    <path class="dark-cut" d="M70 205l10 76-4 62h-9l-8-47zM110 205l-10 76 4 62h9l8-47z"/>
    <path class="gold-body" d="M67 344h46l8 20H59z"/>
    <ellipse cx="90" cy="366" rx="37" ry="11" class="base-top"/>
    <path d="M51 367h78l9 20H42z" class="base-rim"/>
    <path d="M42 386h96l11 34H31z" class="base"/>
    <path d="M35 414h110l5 13H30z" class="base-rim"/>
  </svg>`;

  const policeSVG = `
  <svg class="mq-police-svg" viewBox="0 0 560 220" aria-hidden="true">
    <defs>
      <linearGradient id="mqCarBody" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#485764"/><stop offset=".48" stop-color="#1f2c36"/><stop offset="1" stop-color="#10171d"/></linearGradient>
      <linearGradient id="mqCarWhite" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4f7f8"/><stop offset=".55" stop-color="#b9c4ca"/><stop offset="1" stop-color="#7e8c95"/></linearGradient>
      <linearGradient id="mqWindow" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8eb0c2"/><stop offset=".55" stop-color="#263c49"/><stop offset="1" stop-color="#0b151d"/></linearGradient>
      <radialGradient id="mqWheel" cx=".48" cy=".44"><stop stop-color="#aeb9c1"/><stop offset=".22" stop-color="#49535a"/><stop offset=".3" stop-color="#151a1e"/><stop offset=".72" stop-color="#050607"/><stop offset="1" stop-color="#1f252a"/></radialGradient>
      <linearGradient id="mqBlueLamp" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#0d54ff"/><stop offset=".5" stop-color="#9fe5ff"/><stop offset="1" stop-color="#0b43c7"/></linearGradient>
      <linearGradient id="mqRedLamp" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9f071b"/><stop offset=".5" stop-color="#ff9cab"/><stop offset="1" stop-color="#ec1530"/></linearGradient>
      <filter id="mqGlowBlue"><feGaussianBlur stdDeviation="18"/></filter>
      <filter id="mqGlowRed"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <ellipse cx="272" cy="200" rx="245" ry="17" fill="#000" opacity=".42"/>
    <path d="M55 118l34-13 35-47 88-23h144l74 55 70 17 26 29-5 36-42 10H76l-35-18 3-31z" fill="url(#mqCarBody)" stroke="#070a0d" stroke-width="7"/>
    <path d="M213 45h139l64 50H294V45z" fill="url(#mqCarWhite)"/>
    <path d="M92 105h199v70H76l-30-17 3-29z" fill="#263540"/>
    <path d="M293 96h185l25 21 18 34-21 25H293z" fill="url(#mqCarWhite)"/>
    <path d="M128 94l35-41 68-15v56zM246 42h43v52h-43zM303 43h45l56 51H303z" fill="url(#mqWindow)" stroke="#d2dce1" stroke-width="5"/>
    <path d="M293 96v80M236 99v77" stroke="#111a21" stroke-width="6"/>
    <path d="M84 124h403" stroke="#6e7d86" stroke-width="4" opacity=".7"/>
    <path d="M98 145h50M349 134h34" stroke="#05090d" stroke-width="7" stroke-linecap="round"/>
    <rect x="222" y="25" width="94" height="17" rx="7" fill="#dbe5e9" stroke="#090d10" stroke-width="5"/>
    <rect x="224" y="27" width="42" height="13" rx="5" fill="url(#mqBlueLamp)"/>
    <rect x="272" y="27" width="42" height="13" rx="5" fill="url(#mqRedLamp)"/>
    <ellipse class="blue-beam" cx="244" cy="34" rx="86" ry="55" fill="#1f6cff" opacity=".55" filter="url(#mqGlowBlue)"/>
    <ellipse class="red-beam" cx="294" cy="34" rx="86" ry="55" fill="#ff2845" opacity=".55" filter="url(#mqGlowRed)"/>
    <circle class="wheel" cx="151" cy="179" r="43" fill="url(#mqWheel)" stroke="#050607" stroke-width="8"/>
    <circle class="wheel" cx="427" cy="179" r="43" fill="url(#mqWheel)" stroke="#050607" stroke-width="8"/>
    <circle cx="151" cy="179" r="11" fill="#c8d1d7"/><circle cx="427" cy="179" r="11" fill="#c8d1d7"/>
    <path class="headlight" d="M493 117l44 12-5 25-39 2z" fill="#ffe9a2"/>
    <path d="M46 132l39-5v28l-40 2z" fill="#ff9f21"/>
    <path d="M206 110h73v12h-73z" fill="#eef2f4" opacity=".7"/>
  </svg>`;

  const handSVG = `
  <svg class="mq-horror-hand-v2" viewBox="0 0 760 620" aria-hidden="true">
    <defs>
      <linearGradient id="mqSleeveV2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#27282c"/><stop offset=".45" stop-color="#0b0c0f"/><stop offset="1" stop-color="#313238"/></linearGradient>
      <linearGradient id="mqSkinV2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e5c5ad"/><stop offset=".5" stop-color="#b98d72"/><stop offset="1" stop-color="#725044"/></linearGradient>
      <linearGradient id="mqSteelV2" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#f9fcff"/><stop offset=".22" stop-color="#889097"/><stop offset=".49" stop-color="#e2e6e9"/><stop offset=".73" stop-color="#525961"/><stop offset="1" stop-color="#b7bdc2"/></linearGradient>
      <linearGradient id="mqHandleV2" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3b3c41"/><stop offset=".5" stop-color="#090a0c"/><stop offset="1" stop-color="#25262b"/></linearGradient>
    </defs>
    <path class="sleeve" d="M56 618L17 371 68 276l167-88 137 90-28 155-126 185z"/>
    <path class="skin" d="M244 288c-3-46 3-101 16-151 8-30 34-35 48-9 11 20 8 61 7 93 9-48 17-104 34-146 12-30 41-25 48 4 6 27-4 79-10 119 18-45 34-91 54-119 18-25 44-12 42 19-2 28-23 74-37 108 23-31 45-61 68-76 23-14 43 5 31 31-14 29-47 65-69 88 33-15 71-32 98-34 29-2 38 27 14 44-27 19-74 36-106 47-35 34-70 69-117 83-59 18-122-19-121-101z"/>
    <path class="detail" d="M274 145c-4 42-1 83 4 113M356 92c-7 47-10 94-9 137M438 108c-13 43-25 81-35 116M505 168c-24 33-44 57-62 78"/>
    <path class="handle" d="M449 222l61-80 87 63-60 86z"/>
    <circle cx="563" cy="202" r="10" fill="#777c82" stroke="#050608" stroke-width="5"/>
    <path class="knife" d="M581 181L748 13 718 262 538 263z"/>
    <path class="steel-shine" d="M605 187L718 57 682 226"/>
    <path d="M510 142l34-44 88 64-35 43z" class="handle"/>
  </svg>`;

  const rocket = (cls='') => `
  <div class="mq-rocket ${cls}">
    <svg viewBox="0 0 240 110" aria-hidden="true">
      <defs><linearGradient id="mqRocketMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f2f6f8"/><stop offset=".45" stop-color="#7d909b"/><stop offset="1" stop-color="#263a45"/></linearGradient>
      <linearGradient id="mqRocketFlame" x1="1" y1="0" x2="0" y2="0"><stop stop-color="#fff6b0"/><stop offset=".35" stop-color="#ff9f2e"/><stop offset=".75" stop-color="#ef2c16"/><stop offset="1" stop-color="transparent"/></linearGradient></defs>
      <path class="flame" d="M49 55L0 27l19 28L0 84z" fill="url(#mqRocketFlame)"/>
      <path d="M40 55l40-23 91 0c30 0 51 10 65 23-14 13-35 23-65 23H80z" fill="url(#mqRocketMetal)" stroke="#071019" stroke-width="5"/>
      <path d="M96 33L75 5l52 26zM96 77L75 105l52-26z" fill="#425764" stroke="#071019" stroke-width="5"/>
      <ellipse cx="180" cy="55" rx="22" ry="19" fill="#70d8ff" stroke="#0b2734" stroke-width="5"/>
      <circle cx="180" cy="55" r="10" fill="#d8fbff" opacity=".65"/>
    </svg>
  </div>`;

  const meteor = (cls='') => `
  <div class="mq-meteor ${cls}">
    <svg viewBox="0 0 300 180" aria-hidden="true">
      <defs><linearGradient id="mqMeteorTrail" x1="1" y1=".5" x2="0" y2=".5"><stop stop-color="#fff2af"/><stop offset=".28" stop-color="#ff8426"/><stop offset=".65" stop-color="#df2d14"/><stop offset="1" stop-color="transparent"/></linearGradient>
      <radialGradient id="mqMeteorCore" cx=".35" cy=".3"><stop stop-color="#f3c38a"/><stop offset=".35" stop-color="#8d5430"/><stop offset=".8" stop-color="#3e2418"/><stop offset="1" stop-color="#17100d"/></radialGradient></defs>
      <path class="trail" d="M240 82L4 8l176 103L20 172z"/>
      <path class="core" d="M190 48l45-16 41 21 15 41-21 42-47 12-40-28-6-42z"/>
      <circle cx="234" cy="78" r="13" fill="#3c2418"/><circle cx="261" cy="102" r="9" fill="#5e3722"/>
    </svg>
  </div>`;

  function installAwardV2(node){
    if(!node)return;
    if(node.dataset.mqAwardV2==='1'&&node.querySelector?.('.mq-award-v2'))return;
    node.innerHTML=awardV2();
    node.dataset.mqAwardV2='1';
  }

  function upgradeAwards(root=document){
    const template=document.getElementById('awardSvg');
    if(template&&template.dataset.mqAwardV2!=='1'){
      template.innerHTML=awardV2();
      template.dataset.mqAwardV2='1';
    }
    if(root?.nodeType===1&&root.matches?.('.flying-award,.big-award'))installAwardV2(root);
    root.querySelectorAll?.('.flying-award,.big-award').forEach(installAwardV2);
  }

  function upgradeFx(){
    const fx=document.getElementById('mq-cinematic-fx');
    if(!fx||fx.dataset.mqRefinementV2==='1')return;
    const police=fx.querySelector('.mq-police-wrap');
    if(police&&!police.querySelector('.mq-police-svg'))police.insertAdjacentHTML('afterbegin',policeSVG);
    const hand=fx.querySelector('.mq-knife-hand');
    if(hand)hand.innerHTML=handSVG;
    const scifi=fx.querySelector('.fx-scifi');
    if(scifi&&!scifi.querySelector('.mq-rocket')){
      scifi.insertAdjacentHTML('beforeend',rocket('r1')+rocket('r2')+meteor('m1')+meteor('m2'));
    }
    fx.dataset.mqRefinementV2='1';
  }

  function syncMute(){
    const btn=document.getElementById('muteBtn');
    if(!btn)return;
    btn.setAttribute('aria-pressed',btn.classList.contains('muted')?'false':'true');
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#muteBtn'))setTimeout(syncMute,0);
  },true);

  const boot=()=>{upgradeAwards();upgradeFx();syncMute()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

  /* Sledujeme jen skutečně přidané herní uzly. Observer nic nepřepisuje
     bez změny, takže už nemůže vyvolat nekonečný MutationObserver cyklus. */
  const refinementObserver=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType===1)upgradeAwards(node);
      }
    }
  });
  const observeRoot=document.body||document.documentElement;
  refinementObserver.observe(observeRoot,{subtree:true,childList:true});
})();
