(() => {
  'use strict';
  if (window.__MQ_CINEMATIC_UPGRADE__) return;
  window.__MQ_CINEMATIC_UPGRADE__ = true;

  /* ==============================================================
     A) ZLATÁ FILMOVÁ SOŠKA
     ============================================================== */
  const awardSvg = () => `
  <svg class="mq-award-svg" viewBox="0 0 180 430" role="img" aria-label="Zlatá filmová soška" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mqGoldBody" x1="0" y1="0" x2="1" y2=".2">
        <stop offset="0" stop-color="#6d3d05"/><stop offset=".12" stop-color="#c88313"/>
        <stop offset=".28" stop-color="#ffe39a"/><stop offset=".42" stop-color="#d89b22"/>
        <stop offset=".59" stop-color="#fff0b2"/><stop offset=".72" stop-color="#bd7410"/>
        <stop offset=".88" stop-color="#f4c85a"/><stop offset="1" stop-color="#704006"/>
      </linearGradient>
      <linearGradient id="mqGoldDark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3e2203"/><stop offset=".22" stop-color="#8c5309"/>
        <stop offset=".52" stop-color="#d79b28"/><stop offset=".78" stop-color="#754006"/><stop offset="1" stop-color="#2c1702"/>
      </linearGradient>
      <linearGradient id="mqGoldBright" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff8cb"/><stop offset=".24" stop-color="#ffd866"/>
        <stop offset=".56" stop-color="#b96b0b"/><stop offset=".76" stop-color="#f4bd3c"/><stop offset="1" stop-color="#6f3b04"/>
      </linearGradient>
      <radialGradient id="mqHead" cx="36%" cy="25%" r="70%">
        <stop offset="0" stop-color="#fff5c5"/><stop offset=".28" stop-color="#f3c451"/>
        <stop offset=".7" stop-color="#a96008"/><stop offset="1" stop-color="#4c2902"/>
      </radialGradient>
      <linearGradient id="mqBaseTop" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe795"/><stop offset=".23" stop-color="#bf7c18"/>
        <stop offset=".58" stop-color="#5c3304"/><stop offset="1" stop-color="#1d1103"/>
      </linearGradient>
      <filter id="mqMetal" x="-40%" y="-30%" width="180%" height="180%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="blur"/>
        <feSpecularLighting in="blur" surfaceScale="4" specularConstant="1.05" specularExponent="22" lighting-color="#fff4ba" result="spec">
          <fePointLight x="35" y="10" z="120"/>
        </feSpecularLighting>
        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut"/>
        <feBlend in="SourceGraphic" in2="specOut" mode="screen"/>
      </filter>
      <filter id="mqSoftShadow" x="-30%" y="-30%" width="160%" height="190%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dy="7"/>
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0"/>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <g filter="url(#mqSoftShadow)">
      <!-- vícepatrový podstavec -->
      <ellipse cx="90" cy="400" rx="69" ry="19" fill="#241401" opacity=".72"/>
      <path d="M24 367h132l-7 35c-2 9-13 16-25 17H56c-13-1-23-8-25-17z" fill="url(#mqGoldDark)"/>
      <ellipse cx="90" cy="367" rx="66" ry="18" fill="url(#mqBaseTop)"/>
      <path d="M35 342h110l9 26H26z" fill="url(#mqGoldBody)"/>
      <ellipse cx="90" cy="342" rx="55" ry="14" fill="url(#mqGoldBright)"/>
      <path d="M49 325h82l12 19H37z" fill="url(#mqGoldDark)"/>
      <ellipse cx="90" cy="325" rx="41" ry="10" fill="#e0a434"/>

      <!-- chodidla a nohy, plná zlatá silueta -->
      <path d="M67 321c-3-19-4-39-2-62l7-82h36l7 82c2 23 1 43-2 62l-17 6-6-63-7 63z" fill="url(#mqGoldBody)" filter="url(#mqMetal)"/>
      <path d="M65 315c-4 4-8 8-12 10l1 8h33l2-11-9-10zM115 315c4 4 8 8 12 10l-1 8H93l-2-11 9-10z" fill="url(#mqGoldDark)"/>

      <!-- trup, ramena a paže -->
      <path d="M72 88c-18 8-27 21-29 43l8 53 14 4 5-47 4 30-7 80c8 14 16 21 23 22 8-1 16-8 23-22l-7-80 4-30 5 47 14-4 8-53c-2-22-11-35-29-43l-8-5H80z" fill="url(#mqGoldBody)" filter="url(#mqMetal)"/>
      <!-- zkřížené paže -->
      <path d="M46 131c7 2 18 12 31 29l13 19-11 13-23-20-12-29z" fill="url(#mqGoldBright)"/>
      <path d="M134 131c-7 2-18 12-31 29l-13 19 11 13 23-20 12-29z" fill="url(#mqGoldDark)"/>
      <ellipse cx="80" cy="181" rx="12" ry="9" fill="#f6c44e" transform="rotate(22 80 181)"/>
      <ellipse cx="100" cy="181" rx="12" ry="9" fill="#bd7411" transform="rotate(-22 100 181)"/>

      <!-- meč držený před tělem -->
      <path d="M86 160h8l3 17-3 105-4 18-4-18-3-105z" fill="url(#mqGoldBright)"/>
      <path d="M66 177h48l-5 10H71z" fill="url(#mqGoldDark)"/>
      <ellipse cx="90" cy="161" rx="9" ry="7" fill="#f8ca51"/>
      <path d="M90 285l9 18-9 14-9-14z" fill="url(#mqGoldBright)"/>

      <!-- krk a hlava -->
      <path d="M79 77h22l4 17-15 13-15-13z" fill="url(#mqGoldDark)"/>
      <ellipse cx="90" cy="56" rx="22" ry="28" fill="url(#mqHead)" filter="url(#mqMetal)"/>
      <path d="M70 48c4-18 14-27 28-23 8 2 14 10 15 22-10-7-27-10-43 1z" fill="#704006" opacity=".85"/>
      <path d="M72 64c7 16 26 23 37 2-4 18-13 25-20 25-8-1-15-10-17-27z" fill="#8c5108" opacity=".5"/>

      <!-- modelace hrudi a boků -->
      <path d="M78 97c-7 25-5 53 12 76 17-23 19-51 12-76l-12 10z" fill="url(#mqGoldBright)" opacity=".78"/>
      <path d="M68 207c14 6 30 6 44 0l3 34c-17 8-33 8-50 0z" fill="#7c4506" opacity=".5"/>

      <!-- světelné odlesky -->
      <path class="mq-award-shine" d="M77 37c-7 10-7 23-2 33 2 3 4 5 6 6-4-16-1-31 8-44-5 0-9 2-12 5zM55 118c-5 17-4 41 2 54l5 4 4-43c2-13 7-24 14-34-12 3-20 9-25 19zM75 193l-5 57c4 8 8 12 12 15l5-71zM42 353l91-2 8 13H31z" fill="#fff8d5"/>
      <path class="mq-award-rim" d="M111 90c15 8 22 21 24 42l-8 50-7 2 5-51c-2-17-7-29-14-43zM106 257l4 58-10 4-5-58z" fill="#fff0a2"/>
    </g>
  </svg>`;

  function replaceAwards(root = document) {
    root.querySelectorAll?.('.flying-award,.big-award').forEach(node => {
      if (node.querySelector('.mq-award-svg')) return;
      node.dataset.mqAwardUpgraded = '1';
      node.innerHTML = awardSvg();
    });
  }

  /* ==============================================================
     B) ŽÁNROVÁ FILMOVÁ VRSTVA
     ============================================================== */
  const genreAliases = {
    '': 'default', all: 'all', mix: 'all', mixed: 'all', general: 'all', vse: 'all', vsechny: 'all',
    thriller: 'thriller', suspense: 'thriller', mystery: 'thriller', mysterium: 'thriller',
    animation: 'animation', animated: 'animation', animace: 'animation', animaky: 'animation', family: 'animation',
    horror: 'horror', horor: 'horror', scary: 'horror',
    scifi: 'scifi', 'sci-fi': 'scifi', sciencefiction: 'scifi', science_fiction: 'scifi', sci_fi: 'scifi',
    action: 'action', akce: 'action',
    crime: 'crime', kriminalni: 'crime', kriminalka: 'crime', noir: 'crime',
    comedy: 'comedy', komedie: 'comedy',
    drama: 'drama',
    romance: 'romance', romantika: 'romance', romantic: 'romance',
    fantasy: 'fantasy', fantazie: 'fantasy',
    adventure: 'adventure', dobrodruzny: 'adventure', dobrodruzstvi: 'adventure',
    western: 'western',
    musical: 'comedy', music: 'comedy', muzikaly: 'comedy'
  };
  const normalize = value => String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/g,'').replace(/_/g,'-');
  const canonicalGenre = value => genreAliases[normalize(value)] || normalize(value) || 'default';

  const fxMarkup = `
    <div class="mq-dust"></div>
    <div class="mq-fx-layer fx-thriller"><div class="mq-rain r1"></div><div class="mq-rain r2"></div><div class="mq-rain r3"></div><div class="mq-lightning"></div><div class="mq-road-glow"></div><div class="mq-police-wrap"><div class="mq-police-car"></div><div class="mq-police-wheel w1"></div><div class="mq-police-wheel w2"></div><div class="mq-lightbar"></div></div></div>
    <div class="mq-fx-layer fx-animation"><div class="mq-cloud c1"></div><div class="mq-cloud c2"></div><div class="mq-balloon-cluster b1"><i class="mq-balloon ba"></i><i class="mq-balloon bb"></i><i class="mq-balloon bc"></i><i class="mq-balloon bd"></i></div><div class="mq-balloon-cluster b2"><i class="mq-balloon ba"></i><i class="mq-balloon bb"></i><i class="mq-balloon bc"></i></div><i class="mq-toon-star s1"></i><i class="mq-toon-star s2"></i><i class="mq-toon-star s3"></i></div>
    <div class="mq-fx-layer fx-horror"><div class="mq-horror-fog"></div><div class="mq-horror-shadow"></div><div class="mq-knife-hand"><svg viewBox="0 0 520 460" aria-hidden="true"><defs><linearGradient id="mqKnifeSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7fbff"/><stop offset=".24" stop-color="#6d7881"/><stop offset=".5" stop-color="#e7edf1"/><stop offset=".76" stop-color="#3e474e"/><stop offset="1" stop-color="#dbe2e6"/></linearGradient><linearGradient id="mqHand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7c2a8"/><stop offset=".45" stop-color="#8e7563"/><stop offset="1" stop-color="#3e302a"/></linearGradient></defs><path d="M428 337c-49-18-84-21-121-8l-72 25-79 14-36-16-39-7-43 25 11 51 77-7 69 18 110-15 138-1z" fill="url(#mqHand)"/><path d="M302 337c-8-38-22-69-42-92-11-12-27-8-28 8-1 24 8 53 25 87z" fill="url(#mqHand)"/><path d="M273 344c-16-43-36-75-58-96-12-11-28-5-27 12 2 26 17 58 39 94z" fill="url(#mqHand)"/><path d="M239 355c-22-39-45-68-69-83-13-8-26 1-22 17 7 24 26 52 51 80z" fill="url(#mqHand)"/><path d="M181 379c-29-25-54-41-76-45-14-3-22 10-14 22 12 18 35 35 63 49z" fill="url(#mqHand)"/><path d="M281 332l54-48 21 19-39 61z" fill="#27170d"/><path d="M330 294L159 52 110 18l18 62 180 237z" fill="url(#mqKnifeSteel)"/><path d="M115 24l20 49 176 231-7 8-183-232z" fill="#fff" opacity=".48"/><path d="M334 282l28 25-17 27-31-29z" fill="#1c110c"/></svg></div><div class="mq-horror-flash"></div></div>
    <div class="mq-fx-layer fx-scifi"><div class="mq-stars"></div><div class="mq-scan"></div><div class="mq-drone"></div></div>
    <div class="mq-fx-layer fx-action"><div class="mq-embers"></div><div class="mq-smoke"></div><div class="mq-heli"></div></div>
    <div class="mq-fx-layer fx-crime"><div class="mq-blinds"></div><div class="mq-noir-smoke"></div><div class="mq-neon"></div></div>
    <div class="mq-fx-layer fx-comedy"><div class="mq-spot sp1"></div><div class="mq-spot sp2"></div><i class="mq-popcorn p1"></i><i class="mq-popcorn p2"></i><i class="mq-popcorn p3"></i></div>
    <div class="mq-fx-layer fx-drama"><div class="mq-window-light"></div><div class="mq-slow-rain"></div></div>
    <div class="mq-fx-layer fx-romance"><div class="mq-bokeh"></div><i class="mq-petal r1"></i><i class="mq-petal r2"></i><i class="mq-petal r3"></i><i class="mq-petal r4"></i></div>
    <div class="mq-fx-layer fx-fantasy"><div class="mq-moon"></div><div class="mq-fireflies"></div><div class="mq-magic-wave"></div></div>
    <div class="mq-fx-layer fx-adventure"><div class="mq-map-lines"></div><div class="mq-plane"></div></div>
    <div class="mq-fx-layer fx-western"><div class="mq-tumbleweed"></div></div>`;

  let gameEl = null;
  let fxEl = null;
  function ensureFx() {
    gameEl = document.getElementById('game') || document.querySelector('[data-genre].view,main [data-genre]');
    if (!gameEl) return null;
    fxEl = document.getElementById('mq-cinematic-fx');
    if (!fxEl) {
      fxEl = document.createElement('div');
      fxEl.id = 'mq-cinematic-fx';
      fxEl.setAttribute('aria-hidden','true');
      fxEl.innerHTML = fxMarkup;
      gameEl.prepend(fxEl);
    }
    return fxEl;
  }

  function detectGenre() {
    const fromGame = gameEl?.dataset?.genre || gameEl?.getAttribute?.('data-theme');
    if (fromGame) return canonicalGenre(fromGame);
    const active = document.querySelector('[data-genre].selected,[data-genre].active,[data-genre][aria-pressed="true"],[data-genre][aria-selected="true"]');
    if (active?.dataset?.genre) return canonicalGenre(active.dataset.genre);
    const label = document.querySelector('#selectedGenre,.selected-genre,[data-current-genre]')?.textContent;
    return canonicalGenre(label || 'default');
  }

  function setFxGenre(value) {
    const genre = canonicalGenre(value);
    ensureFx();
    if (fxEl) fxEl.dataset.fxGenre = genre;
    score.setGenre(genre);
  }

  /* ==============================================================
     C) GENERATIVNÍ FILMOVÁ HUDBA: VÍCEVRSTVÉ ARANŽE PODLE ŽÁNRU
     ============================================================== */
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  const NOTE = n => 440 * Math.pow(2,(n - 69) / 12);
  const ownContexts = new WeakSet();

  const profiles = {
    default:{tempo:54,root:41,scale:[0,2,3,5,7,8,10],prog:[[0,3,5],[5,1,3],[3,6,1],[4,0,2]],pad:'warm',lead:'ambient',bass:'drone',drums:'none',density:.18,air:.31},
    all:{tempo:56,root:41,scale:[0,2,3,5,7,8,10],prog:[[0,3,5],[5,1,3],[3,6,1],[4,0,2]],pad:'warm',lead:'ambient',bass:'drone',drums:'none',density:.18,air:.30},
    action:{tempo:70,root:38,scale:[0,2,3,5,7,8,10],prog:[[0,2,4],[0,3,5],[5,0,2],[4,6,1]],pad:'brass',lead:'ambient',bass:'sub',drums:'cinema',density:.22,air:.20},
    comedy:{tempo:66,root:43,scale:[0,2,4,5,7,9,11],prog:[[0,2,4],[3,5,0],[4,6,1],[0,2,4]],pad:'light',lead:'ambient',bass:'soft',drums:'none',density:.20,air:.20},
    drama:{tempo:48,root:38,scale:[0,2,3,5,7,8,10],prog:[[0,2,4],[5,0,2],[3,5,0],[4,6,1]],pad:'strings',lead:'ambient',bass:'drone',drums:'none',density:.15,air:.35},
    horror:{tempo:42,root:31,scale:[0,1,3,5,6,8,10],prog:[[0,1,4],[0,3,6],[1,4,5],[0,2,6]],pad:'dark',lead:'ambient',bass:'drone',drums:'heartbeat',density:.11,air:.42},
    scifi:{tempo:52,root:35,scale:[0,2,4,6,7,9,11],prog:[[0,2,4],[4,6,1],[1,3,5],[5,0,2]],pad:'space',lead:'ambient',bass:'sub',drums:'none',density:.16,air:.40},
    thriller:{tempo:50,root:34,scale:[0,2,3,5,7,8,10],prog:[[0,2,4],[0,3,5],[1,4,6],[0,2,5]],pad:'tense',lead:'ambient',bass:'drone',drums:'none',density:.13,air:.36},
    crime:{tempo:48,root:36,scale:[0,2,3,5,7,9,10],prog:[[0,2,4,6],[3,5,0,2],[4,6,1,3],[0,2,4,6]],pad:'noir',lead:'ambient',bass:'drone',drums:'none',density:.14,air:.34},
    animation:{tempo:64,root:43,scale:[0,2,4,5,7,9,11],prog:[[0,2,4],[4,6,1],[3,5,0],[0,2,4]],pad:'light',lead:'ambient',bass:'soft',drums:'none',density:.20,air:.20},
    romance:{tempo:46,root:40,scale:[0,2,4,5,7,9,11],prog:[[0,2,4,6],[5,0,2,4],[3,5,0,2],[4,6,1,3]],pad:'lush',lead:'ambient',bass:'drone',drums:'none',density:.14,air:.34},
    fantasy:{tempo:52,root:38,scale:[0,2,4,5,7,9,11],prog:[[0,2,4],[5,0,2],[3,5,0],[4,6,1]],pad:'choir',lead:'ambient',bass:'drone',drums:'none',density:.16,air:.42},
    adventure:{tempo:64,root:38,scale:[0,2,4,5,7,9,10],prog:[[0,2,4],[3,5,0],[5,0,2],[4,6,1]],pad:'brass',lead:'ambient',bass:'sub',drums:'cinema',density:.22,air:.22},
    western:{tempo:58,root:36,scale:[0,2,4,5,7,9,10],prog:[[0,2,4],[3,5,0],[0,2,4],[4,6,1]],pad:'dry',lead:'ambient',bass:'drone',drums:'none',density:.17,air:.18}
  };

  class CinematicScore {
    constructor(){
      this.ctx=null;this.master=null;this.musicBus=null;this.fxBus=null;this.reverb=null;this.delay=null;this.delayFeedback=null;
      this.enabled=true;this.playing=false;this.genre='default';this.nextTime=0;this.step=0;this.timer=0;this.noiseBuffer=null;this.generation=0;this.lastChord=-1;
    }
    async unlock(){
      if (!NativeAudioContext) return false;
      if (!this.ctx) this.createContext();
      if (this.ctx.state==='suspended') await this.ctx.resume().catch(()=>{});
      return this.ctx.state==='running';
    }
    createContext(){
      try{this.ctx=new NativeAudioContext({latencyHint:'interactive'});}catch(_e){this.ctx=new NativeAudioContext();}ownContexts.add(this.ctx);
      const c=this.ctx;
      this.master=c.createGain();this.master.gain.value=.0001;
      const compressor=c.createDynamicsCompressor();compressor.threshold.value=-20;compressor.knee.value=18;compressor.ratio.value=3.2;compressor.attack.value=.018;compressor.release.value=.32;
      const tone=c.createBiquadFilter();tone.type='lowpass';tone.frequency.value=3900;tone.Q.value=.12;
      this.musicBus=c.createGain();this.musicBus.gain.value=.8112;
      this.fxBus=c.createGain();this.fxBus.gain.value=.864;
      this.reverb=c.createConvolver();this.reverb.buffer=this.makeImpulse(4.2,2.8);
      const reverbGain=c.createGain();reverbGain.gain.value=.23;
      this.delay=c.createDelay(2);this.delay.delayTime.value=.31;
      this.delayFeedback=c.createGain();this.delayFeedback.gain.value=.22;
      const delayGain=c.createGain();delayGain.gain.value=.14;
      this.musicBus.connect(tone);this.fxBus.connect(tone);tone.connect(compressor);compressor.connect(this.master);this.master.connect(c.destination);
      this.musicBus.connect(this.reverb);this.reverb.connect(reverbGain);reverbGain.connect(compressor);
      this.musicBus.connect(this.delay);this.delay.connect(this.delayFeedback);this.delayFeedback.connect(this.delay);this.delay.connect(delayGain);delayGain.connect(compressor);
      this.noiseBuffer=this.makeNoise(2.8);
      this.master.gain.setValueAtTime(.0001,c.currentTime);if(this.enabled)this.master.gain.exponentialRampToValueAtTime(.864,c.currentTime+1.8);
    }
    makeImpulse(seconds,decay){const c=this.ctx,len=Math.floor(c.sampleRate*seconds),b=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay)*(1-.12*Math.sin(i*.0007));}return b;}
    makeNoise(seconds){const c=this.ctx,len=Math.floor(c.sampleRate*seconds),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){const white=Math.random()*2-1;last=.985*last+.015*white;d[i]=white*.67+last*.33;}return b;}
    setGenre(value){const g=canonicalGenre(value);if(g===this.genre)return;this.genre=profiles[g]?g:'default';this.generation++;this.step=0;this.lastChord=-1;if(this.playing){this.stop(false);this.start();}}
    async start(){if(!this.enabled)return;await this.unlock();if(!this.ctx||this.playing)return;this.playing=true;this.generation++;this.step=0;this.nextTime=this.ctx.currentTime+.08;this.schedule(this.generation);}
    stop(fade=true){if(!this.ctx)return;this.playing=false;this.generation++;clearTimeout(this.timer);const t=this.ctx.currentTime;this.musicBus.gain.cancelScheduledValues(t);this.musicBus.gain.setValueAtTime(Math.max(.0001,this.musicBus.gain.value),t);this.musicBus.gain.exponentialRampToValueAtTime(.0001,t+(fade?.65:.05));setTimeout(()=>{if(this.ctx&&this.playing){const n=this.ctx.currentTime;this.musicBus.gain.cancelScheduledValues(n);this.musicBus.gain.setValueAtTime(.0001,n);this.musicBus.gain.exponentialRampToValueAtTime(.8112,n+1.2);}},fade?700:80);}
    setEnabled(on){
      this.enabled=!!on;
      if(this.ctx){
        const t=this.ctx.currentTime;
        this.master.gain.cancelScheduledValues(t);
        this.master.gain.setTargetAtTime(this.enabled?.864:.0001,t,.035);
      }
      if(this.enabled)this.start();else this.stop();
    }
    profile(){return profiles[this.genre]||profiles.default;}
    schedule(gen){if(!this.playing||gen!==this.generation||!this.ctx)return;const p=this.profile(),beat=60/p.tempo,look=.5;while(this.nextTime<this.ctx.currentTime+look){this.renderStep(this.nextTime,this.step,p,beat);this.nextTime+=beat/2;this.step++;}this.timer=setTimeout(()=>this.schedule(gen),120);}
    degree(p,index,oct=0){const len=p.scale.length,wrapped=((index%len)+len)%len,octave=Math.floor(index/len);return p.root+p.scale[wrapped]+12*(octave+oct);}
    chordNotes(p,chordIndex){const chord=p.prog[chordIndex%p.prog.length];return chord.map((d,i)=>this.degree(p,d,i>2?1:0));}
    renderStep(t,step,p,beat){
      const half=step%2,quarter=Math.floor(step/2),bar=Math.floor(quarter/4),barBeat=quarter%4;
      const phrase=Math.floor(bar/4),variation=phrase%3;
      const chordIndex=(phrase+(variation===2?1:0))%p.prog.length;
      if(half===0&&barBeat===0&&this.lastChord!==chordIndex){
        this.lastChord=chordIndex;
        const duration=beat*(13.5+variation*2.4);
        const level=.105+p.density*.05+(variation===1?.008:0);
        this.playPad(t,this.chordNotes(p,chordIndex),duration,p.pad,level);
      }
      if(half===0)this.playBassPattern(t,quarter,p,beat,chordIndex);
      this.playLeadPattern(t,step,p,beat,chordIndex);
      this.playDrums(t,step,p,beat);
      if(step%48===0)this.playAir(t,p.air,beat*(24+variation*6));
    }
    envelope(g,t,a,d,s,r,peak){const v=Math.max(.0001,peak);g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(Math.max(.0001,v*s),t+a+d);g.gain.setValueAtTime(Math.max(.0001,v*s),t+a+d);g.gain.exponentialRampToValueAtTime(.0001,t+a+d+r);}
    osc(type,freq,t,dur,vol,bus=this.musicBus,detune=0,filterFreq=0){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.detune.value=detune;let last=g;if(filterFreq){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=filterFreq;f.Q.value=.5;o.connect(f);f.connect(g);}else o.connect(g);g.connect(bus);this.envelope(g,t,.02,Math.min(.2,dur*.18),.68,Math.max(.08,dur*.55),vol);o.start(t);o.stop(t+dur+1);return{osc:o,gain:g};}
    playPad(t,notes,dur,kind,vol){
      const warmKinds=new Set(['warm','strings','lush','light','dry','noir']);
      notes.slice(0,4).forEach((m,i)=>{
        const midi=m-12+(i===0?-12:0),f0=NOTE(midi);
        [-5,5].forEach((det,j)=>{
          const c=this.ctx,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();
          o.type=(j===0||kind==='space')?'sine':'triangle';
          o.frequency.value=f0;o.detune.value=det;
          filter.type='lowpass';
          const start=kind==='dark'?430:kind==='space'?720:kind==='brass'?820:warmKinds.has(kind)?640:600;
          const end=kind==='dark'?610:kind==='space'?1050:kind==='brass'?1250:900;
          filter.frequency.setValueAtTime(start,t);
          filter.frequency.exponentialRampToValueAtTime(end,t+Math.max(1,dur*.42));
          filter.Q.value=kind==='space'?1.1:.35;
          o.connect(filter);filter.connect(g);g.connect(this.musicBus);
          this.envelope(g,t,1.7,2.4,.72,Math.max(2.8,dur-4.1),vol/(notes.length*2));
          o.start(t);o.stop(t+dur+2.2);
        });
      });
      if(kind==='choir')notes.slice(0,3).forEach((m,i)=>this.formantVoice(t,NOTE(m-12),dur,vol*.10/(i+1)));
    }
    formantVoice(t,f,dur,vol){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;f1.type='bandpass';f1.frequency.value=700;f1.Q.value=7;f2.type='bandpass';f2.frequency.value=1150;f2.Q.value=9;o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.connect(this.musicBus);this.envelope(g,t,.9,.8,.55,dur*.7,vol);o.start(t);o.stop(t+dur+1);}
    playBassPattern(t,q,p,beat,chordIndex){
      const root=p.prog[chordIndex%p.prog.length][0],mode=p.bass;
      if(mode==='drone'){if(q%8===0)this.bass(t,this.degree(p,root,-2),beat*7.4,.075,'sine');return;}
      if(mode==='sub'){if(q%4===0)this.bass(t,this.degree(p,root,-2),beat*3.6,.072,'sine');return;}
      if(q%4===0)this.bass(t,this.degree(p,root,-2),beat*3.2,.058,'triangle');
    }
    bass(t,midi,dur,vol,type){const c=this.ctx,o=c.createOscillator(),sub=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=type;o.frequency.value=NOTE(midi);sub.type='sine';sub.frequency.value=NOTE(midi-12);f.type='lowpass';f.frequency.value=type==='square'?520:680;f.Q.value=.7;o.connect(f);sub.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.012,.1,.48,Math.max(.08,dur*.65),vol);o.start(t);sub.start(t);o.stop(t+dur+1);sub.stop(t+dur+1);}
    playLeadPattern(t,step,p,beat,chordIndex){
      if(step%16!==0||Math.random()>Math.min(.72,p.density+.28))return;
      const chord=p.prog[chordIndex%p.prog.length],phrase=Math.floor(step/16),degree=chord[phrase%chord.length];
      const low=this.degree(p,degree,-1),f=NOTE(low);
      const soft=(m,delay,dur,vol,wave="sine",cut=720)=>this.osc(wave,NOTE(m),t+delay,dur,vol,this.musicBus,(Math.random()-.5)*5,cut);
      if(this.genre==="horror"){
        soft(low-5,0,beat*8,.017,"sine",390);soft(low-4,.18,beat*6.8,.009,"triangle",430);
      }else if(this.genre==="crime"||this.genre==="thriller"){
        soft(low,0,beat*6.8,.018,"triangle",560);soft(low+3,beat*1.5,beat*4.8,.010,"sine",620);
      }else if(this.genre==="scifi"){
        const c=this.ctx,o=c.createOscillator(),g=c.createGain(),filter=c.createBiquadFilter();
        o.type="sine";o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(NOTE(low+5),t+beat*7.5);
        filter.type="lowpass";filter.frequency.value=760;filter.Q.value=1.1;o.connect(filter);filter.connect(g);g.connect(this.musicBus);
        this.envelope(g,t,1.4,1.5,.62,beat*5.2,.018);o.start(t);o.stop(t+beat*8.5);
      }else if(this.genre==="fantasy"){
        soft(low+7,0,beat*7.5,.014,"sine",820);soft(low+12,beat*2,beat*5.2,.007,"triangle",900);
        if(phrase%3===1)this.formantVoice(t+.4,NOTE(low),beat*8,.0055);
      }else if(this.genre==="comedy"){
        const pattern=phrase%2?[0,4,7]:[0,7,4];
        pattern.forEach((n,i)=>soft(low+n,i*beat*1.25,beat*2.6,.010-i*.0015,i===1?"triangle":"sine",880));
      }else if(this.genre==="animation"){
        const pattern=[0,4,7,4];pattern.forEach((n,i)=>soft(low+12+n,i*beat*.9,beat*2,.0085-i*.0008,"sine",950));
      }else{
        soft(low,0,beat*7,.016,"sine",620);if(phrase%2)soft(low+7,beat*2,beat*4.5,.007,"triangle",720);
      }
    }
    pluck(t,midi,dur,vol,type='triangle',cut=2600){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=type;o.frequency.value=NOTE(midi);f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(350,cut*.22),t+dur);f.Q.value=1.8;o.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.004,.07,.18,dur*.72,vol);o.start(t);o.stop(t+dur+1);}
    marimba(t,midi,dur,vol){const c=this.ctx,g=c.createGain();[1,3.98,9.1].forEach((r,i)=>{const o=c.createOscillator();o.type='sine';o.frequency.value=NOTE(midi)*r;const og=c.createGain();og.gain.value=1/(1+i*2.5);o.connect(og);og.connect(g);o.start(t);o.stop(t+dur+.8);});g.connect(this.musicBus);this.envelope(g,t,.003,.055,.08,dur*.75,vol);}
    key(t,midi,dur,vol,kind){const c=this.ctx,g=c.createGain();[1,2,3.01].forEach((r,i)=>{const o=c.createOscillator();o.type=i===0?'triangle':'sine';o.frequency.value=NOTE(midi)*r;const og=c.createGain();og.gain.value=[1,.32,.13][i];o.connect(og);og.connect(g);o.start(t);o.stop(t+dur+1);});g.connect(this.musicBus);this.envelope(g,t,.005,.15,kind==='rhodes'?.34:.22,dur*.78,vol);}
    chime(t,midi,vol){const c=this.ctx,g=c.createGain();[1,2.01,3.99,6.02].forEach((r,i)=>{const o=c.createOscillator();o.type='sine';o.frequency.value=NOTE(midi)*r;const og=c.createGain();og.gain.value=[1,.5,.22,.09][i];o.connect(og);og.connect(g);o.start(t);o.stop(t+3.4);});g.connect(this.musicBus);this.envelope(g,t,.004,.22,.35,2.4,vol);}
    horn(t,midi,dur,vol){const c=this.ctx,g=c.createGain(),f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(850,t);f.frequency.exponentialRampToValueAtTime(2200,t+.18);[-9,0,8].forEach((d,i)=>{const o=c.createOscillator();o.type=i===1?'sawtooth':'square';o.frequency.value=NOTE(midi);o.detune.value=d;const og=c.createGain();og.gain.value=i===1?.55:.22;o.connect(og);og.connect(f);o.start(t);o.stop(t+dur+1);});f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.06,.18,.58,dur*.62,vol);}
    pluckNoise(t,midi,dur,vol){this.pluck(t,midi,dur,vol*.72,'triangle',1900);const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;f.type='bandpass';f.frequency.value=NOTE(midi)*2;f.Q.value=8;s.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.002,.03,.06,.2,vol*.24);s.start(t);s.stop(t+.4);}
    playDrums(t,step,p,beat){const m=p.drums;if(m==='none')return;const e=step%8;
      if(m==='action'){if(e===0||e===4)this.kick(t,.13);if(e===2||e===6)this.tom(t,e===2?90:72,.085);if(step%2===1)this.hat(t,.025,step%4===3);if(e===6)this.snare(t,.075);}
      else if(m==='thriller'){if(e===0||e===5)this.kick(t,.085);this.tick(t,.022);if(e===6)this.snare(t,.045);}
      else if(m==='heartbeat'){if(step%8===0){this.kick(t,.1,54);this.kick(t+beat*.23,.07,47);}}
      else if(m==='electro'){if(e===0||e===4)this.kick(t,.09);if(e===2||e===6)this.snare(t,.055);if(step%2===1)this.hat(t,.018);}
      else if(m==='brush'){if(e===0||e===4)this.kick(t,.045,62);if(e===2||e===6)this.brush(t,.04);if(step%2===1)this.hat(t,.009);}
      else if(m==='playful'){if(e===0||e===5)this.kick(t,.055,76);if(e===2||e===6)this.wood(t,.035,e===2?580:720);if(step%4===3)this.hat(t,.012);}
      else if(m==='light'){if(e===0||e===4)this.kick(t,.052,70);if(e===2||e===6)this.brush(t,.032);}
      else if(m==='cinema'){if(step%16===0)this.tom(t,68,.09);if(step%16===12)this.tom(t,92,.065);}
    }
    kick(t,vol=.1,start=95){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(start,t);o.frequency.exponentialRampToValueAtTime(38,t+.18);o.connect(g);g.connect(this.musicBus);this.envelope(g,t,.002,.04,.15,.24,vol);o.start(t);o.stop(t+.5);}
    tom(t,freq,vol){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(freq*1.5,t);o.frequency.exponentialRampToValueAtTime(freq,t+.12);o.connect(g);g.connect(this.musicBus);this.envelope(g,t,.003,.08,.28,.48,vol);o.start(t);o.stop(t+.8);}
    snare(t,vol){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;f.type='highpass';f.frequency.value=1200;s.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.002,.05,.18,.2,vol);s.start(t);s.stop(t+.35);this.osc('triangle',185,t,.18,vol*.28,this.musicBus);}
    hat(t,vol,open=false){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;f.type='highpass';f.frequency.value=6200;s.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.001,.02,.08,open?.25:.055,vol);s.start(t);s.stop(t+(open?.4:.12));}
    brush(t,vol){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;f.type='bandpass';f.frequency.value=2400;f.Q.value=.7;s.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.01,.09,.35,.28,vol);s.start(t);s.stop(t+.5);}
    wood(t,vol,freq){this.osc('sine',freq,t,.13,vol,this.musicBus);this.osc('sine',freq*2.73,t,.08,vol*.22,this.musicBus);}
    tick(t,vol){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;f.type='bandpass';f.frequency.value=3900;f.Q.value=12;s.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,.001,.008,.06,.035,vol);s.start(t);s.stop(t+.08);}
    metalHit(t,vol){const c=this.ctx,g=c.createGain();[317,521,733,1091].forEach((f,i)=>{const o=c.createOscillator();o.type='sine';o.frequency.value=f*(.97+Math.random()*.06);const og=c.createGain();og.gain.value=1/(i+1);o.connect(og);og.connect(g);o.start(t);o.stop(t+2.8);});g.connect(this.musicBus);this.envelope(g,t,.002,.11,.32,2.2,vol);}
    riser(t,dur,vol){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(280,t);f.frequency.exponentialRampToValueAtTime(7200,t+dur);f.Q.value=2.8;s.connect(f);f.connect(g);g.connect(this.musicBus);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.82);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.start(t);s.stop(t+dur+.05);}
    playAir(t,amount,dur){if(!amount)return;const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;s.loop=true;f.type='lowpass';f.frequency.value=this.genre==='horror'?420:this.genre==='scifi'?2600:1200;s.connect(f);f.connect(g);g.connect(this.musicBus);this.envelope(g,t,1.2,1,.65,Math.max(1,dur-2.2),amount*.075);s.start(t);s.stop(t+dur+1);}
    /* UI zvuky, protože původní hudební oscilátory jsou níže bezpečně umlčeny */
    sfxClick(){if(!this.ctx||this.ctx.state!=='running')return;const t=this.ctx.currentTime;this.osc('sine',620,t,.09,.035,this.fxBus);this.osc('sine',930,t+.025,.07,.018,this.fxBus);}
    sfxCorrect(){if(!this.ctx)return;const t=this.ctx.currentTime;[0,4,7,12].forEach((n,i)=>this.chimeToFx(t+i*.065,NOTE(72+n),.047/(1+i*.08)));}
    sfxWrong(){if(!this.ctx)return;const t=this.ctx.currentTime;this.downTone(t,165,82,.42,.09);this.downTone(t+.08,121,61,.38,.065);}
    sfxWin(){if(!this.ctx)return;const t=this.ctx.currentTime;[0,4,7,12,16,19].forEach((n,i)=>this.hornToFx(t+i*.11,NOTE(55+n),1.4,.045));setTimeout(()=>{if(this.ctx)this.chimeToFx(this.ctx.currentTime,NOTE(91),.09)},680);}
    sfxThrow(){if(!this.ctx)return;const t=this.ctx.currentTime;this.riserToFx(t,.34,.045);this.chimeToFx(t+.27,NOTE(83),.045);}
    sfxLose(){if(!this.ctx)return;const t=this.ctx.currentTime;[0,1,5].forEach((n,i)=>this.downTone(t+i*.19,146-n*9,58-n*3,.75,.06/(1+i*.12)));}
    sfxBurn(){if(!this.ctx)return;const t=this.ctx.currentTime,c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(4400,t+.7);f.Q.value=.7;s.connect(f);f.connect(g);g.connect(this.fxBus);this.envelope(g,t,.02,.22,.45,.8,.055);s.start(t);s.stop(t+1.2);}
    chimeToFx(t,f,vol){const c=this.ctx,g=c.createGain();[1,2.01,4.03].forEach((r,i)=>{const o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.value=f*r;og.gain.value=[1,.4,.13][i];o.connect(og);og.connect(g);o.start(t);o.stop(t+2.3);});g.connect(this.fxBus);this.envelope(g,t,.002,.12,.3,1.7,vol);}
    downTone(t,a,b,dur,vol){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(b,t+dur);o.connect(g);g.connect(this.fxBus);this.envelope(g,t,.003,.08,.42,dur*.72,vol);o.start(t);o.stop(t+dur+1);}
    hornToFx(t,f,dur,vol){const c=this.ctx,g=c.createGain(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2400;[-8,0,7].forEach((d,i)=>{const o=c.createOscillator(),og=c.createGain();o.type='sawtooth';o.frequency.value=f;o.detune.value=d;og.gain.value=i===1?.5:.25;o.connect(og);og.connect(filter);o.start(t);o.stop(t+dur+1);});filter.connect(g);g.connect(this.fxBus);this.envelope(g,t,.04,.14,.58,dur*.65,vol);}
    riserToFx(t,dur,vol){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.noiseBuffer;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(420,t);f.frequency.exponentialRampToValueAtTime(5200,t+dur);f.Q.value=1.8;s.connect(f);f.connect(g);g.connect(this.fxBus);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.72);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.start(t);s.stop(t+dur+.04);}
  }

  const score = new CinematicScore();

  /* ==============================================================
     D) POTLAČENÍ PŮVODNÍ JEDNODUCHÉ HUDBY
     Zachováme herní logiku, ale staré Web Audio uzly nepustíme přímo
     do reproduktorů. Nový engine používá uložený nativní AudioContext.
     ============================================================== */
  function muteLegacyContexts() {
    /* Bez globálního přepisování AudioNode.prototype.connect.
       Původní hudební sběrnice hry je dostupná ve stejném
       klasickém script scope. Po jejím vytvoření ji bezpečně stáhneme,
       aby nehrála současně s novým soundtrackem. Zvukové efekty ponecháme. */
    try{
      if(typeof audioCtx!=='undefined'&&audioCtx){
        const t=audioCtx.currentTime;
        if(typeof musicGain!=='undefined'&&musicGain?.gain){
          musicGain.gain.cancelScheduledValues(t);
          musicGain.gain.setTargetAtTime(.0001,t,.015);
        }
        /* Původní hudbu umlčíme, ale původní SFX musí zůstat aktivní.
           Právě přes tuto sběrnici hraje buzzer správné/chybné odpovědi.
           V předchozí verzi se sfxGain po prvním kliknutí stáhl téměř na
           nulu a při další hře už buzzer nebyl slyšet. */
        if(typeof sfxGain!=='undefined'&&sfxGain?.gain){
          sfxGain.gain.cancelScheduledValues(t);
          sfxGain.gain.setTargetAtTime(.82,t,.015);
        }
      }
    }catch(_e){}
  }

  function suppressNamedLegacyMusic() {
    const re=/(music|soundtrack|ambient|ambience|score)/i;
    for(const key of Object.getOwnPropertyNames(window)){
      if(!re.test(key)||/^__MQ_/.test(key))continue;
      let value;try{value=window[key]}catch(_e){continue}
      if(value&&typeof value==='object'){
        try{if(typeof value.stop==='function')value.stop();}catch(_e){}
        try{if(typeof value.pause==='function')value.pause();}catch(_e){}
        try{if(typeof value.setVolume==='function')value.setVolume(0);}catch(_e){}
      }
    }
  }

  /* ==============================================================
     E) NAPOJENÍ NA EXISTUJÍCÍ HRU BEZ ZMĚNY JEJÍ LOGIKY
     ============================================================== */
  function musicButtonState(btn){
    if(!btn)return null;
    /* Tlačítkový handler původní hry už před document click změnil class/label.
       Tyto hodnoty jsou proto aktuálnější než aria-pressed, které doplňuje až refinement. */
    if(btn.classList.contains('muted')||btn.classList.contains('off'))return false;
    const label=(btn.getAttribute('aria-label')||btn.title||btn.textContent||'').toLowerCase();
    if(/zapnout|unmute|music off|hudba vyp/.test(label))return false;
    if(/vypnout|mute|music on|hudba zap/.test(label))return true;
    const pressed=btn.getAttribute('aria-pressed');if(pressed==='true')return true;if(pressed==='false')return false;
    return null;
  }

  async function unlockAndStart(){
    await score.unlock();
    setFxGenre(detectGenre());
    if(score.enabled)score.start();
  }

  document.addEventListener('pointerdown',event=>{
    const target=event.target.closest?.('button,[role="button"],.selection-card,.answer');
    if(!target)return;
    unlockAndStart();
    const genre=target.dataset?.genre||target.closest?.('[data-genre]')?.dataset?.genre;
    if(genre)setFxGenre(genre);
    const text=((target.getAttribute('aria-label')||'')+' '+(target.id||'')+' '+(target.className||'')).toLowerCase();
    if(!target.closest?.('.answer')&&!/music|hudba|soundtrack|mute|zvuk/.test(text)) score.sfxClick();
  },true);

  document.addEventListener('click',event=>{
    /* Document bubble phase proběhne až po původních handlerech tlačítek. */
    muteLegacyContexts();
    const clicked=event.target.closest?.('button,[role="button"]');
    const clickText=((clicked?.getAttribute?.('aria-label')||'')+' '+(clicked?.id||'')+' '+(clicked?.className||'')).toLowerCase();
    if(clicked&&/music|hudba|soundtrack|mute|zvuk/.test(clickText)){
      setTimeout(()=>{const current=musicButtonState(clicked);score.setEnabled(current===null?!score.enabled:current);},0);
    }
    /* Odpovědi si přehrávají vlastní správný/chybný zvuk přímo ve funkci answer(). */
  },true);

  function inspectGameState(root=document){
    replaceAwards(root);
    ensureFx();
    setFxGenre(detectGenre());
    const win=root.querySelector?.('#winView.active,#win.active,#victory.active,.win.active,.victory.active,.winner.active,[data-view="win"].active,[data-screen="victory"].active');
    if(win&&!win.dataset.mqWinSound){win.dataset.mqWinSound='1';score.sfxWin();}
    const lose=root.querySelector?.('#creditsView.active,#endView.active,#lose.active,#loss.active,#gameOver.active,.lose.active,.loss.active,.game-over.active,[data-view="lose"].active,[data-screen="loss"].active');
    if(lose&&!lose.dataset.mqLoseSound){lose.dataset.mqLoseSound='1';score.sfxLose();}
    root.querySelectorAll?.('.flying-award').forEach(node=>{
      if(!node.dataset.mqThrowSound){
        node.dataset.mqThrowSound='1';
        /* Cinknutí letu sošky patří jen ke správné odpovědi. Při chybě
           zůstane slyšet pouze samostatný hluboký buzzer. */
        if(window.__mqLastAnswerCorrect!==false)score.sfxThrow();
      }
    });
    root.querySelectorAll?.('.burning,.film-burning,.burn-film,.film-burn').forEach(node=>{if(!node.dataset.mqBurnSound){node.dataset.mqBurnSound='1';score.sfxBurn();}});
  }

  const observer=new MutationObserver(records=>{
    let genreChanged=false;
    for(const record of records){
      if(record.type==='childList')record.addedNodes.forEach(node=>{if(node.nodeType===1){replaceAwards(node);if(node.matches?.('[data-genre],#game')||node.querySelector?.('[data-genre],#game'))genreChanged=true;}});
      if(record.type==='attributes'&&(record.attributeName==='data-genre'||record.attributeName==='data-theme'||record.attributeName==='class'||record.attributeName==='aria-selected'||record.attributeName==='aria-pressed'))genreChanged=true;
    }
    if(genreChanged)setFxGenre(detectGenre());
    inspectGameState();
  });

  function init(){
    muteLegacyContexts();suppressNamedLegacyMusic();replaceAwards();ensureFx();setFxGenre(detectGenre());
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-genre','data-theme','aria-selected','aria-pressed','hidden']});
    const start=document.getElementById('startBtn');start?.addEventListener('click',unlockAndStart,{once:false});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)score.stop();else if(score.enabled&&document.querySelector('#game.active,#game:not([hidden])'))score.start();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
