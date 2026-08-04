(()=>{
  const balloonSVG=(variant=1)=>`
  <svg class="mq-balloon-svg" viewBox="0 0 300 420" aria-hidden="true">
    <g ${variant===2?'transform="translate(16,8) scale(.92)"':''}>
      <g transform="translate(52 72)"><ellipse cx="44" cy="92" rx="38" ry="52" fill="#f1d556"/><ellipse class="shine" cx="28" cy="70" rx="9" ry="17"/><circle class="shine" cx="41" cy="48" r="5"/></g>
      <g transform="translate(20 14)"><ellipse cx="44" cy="92" rx="34" ry="48" fill="#b6e84b"/><ellipse class="shine" cx="28" cy="70" rx="8" ry="15"/><circle class="shine" cx="40" cy="50" r="4.5"/></g>
      <g transform="translate(86 0)"><ellipse cx="44" cy="92" rx="34" ry="50" fill="#5a74ef"/><ellipse class="shine" cx="29" cy="68" rx="8" ry="15"/><circle class="shine" cx="39" cy="48" r="4.5"/></g>
      <g transform="translate(158 18)"><ellipse cx="44" cy="92" rx="33" ry="48" fill="#ddb056"/><ellipse class="shine" cx="30" cy="71" rx="8" ry="14"/><circle class="shine" cx="41" cy="52" r="4"/></g>
      <g transform="translate(138 82)"><ellipse cx="44" cy="92" rx="34" ry="49" fill="#63dfd3"/><ellipse class="shine" cx="28" cy="70" rx="8" ry="15"/><circle class="shine" cx="40" cy="51" r="4.5"/></g>
      <g transform="translate(68 76)"><ellipse cx="44" cy="92" rx="35" ry="49" fill="#b14fe9"/><ellipse class="shine" cx="29" cy="71" rx="8" ry="15"/><circle class="shine" cx="41" cy="51" r="4.5"/></g>
      <g transform="translate(170 92)"><ellipse cx="44" cy="92" rx="33" ry="47" fill="#f25a93"/><ellipse class="shine" cx="28" cy="70" rx="8" ry="14"/><circle class="shine" cx="40" cy="50" r="4"/></g>
      <g transform="translate(94 132)"><ellipse cx="44" cy="92" rx="35" ry="48" fill="#fb6561"/><ellipse class="shine" cx="29" cy="70" rx="8" ry="14"/><circle class="shine" cx="40" cy="50" r="4"/></g>
      <path class="string" d="M89 170C97 245 110 284 139 362"/>
      <path class="string" d="M64 156C76 231 105 290 138 364"/>
      <path class="string" d="M129 141C130 226 133 287 140 364"/>
      <path class="string" d="M203 159C183 234 161 292 141 366"/>
      <path class="string" d="M182 216C171 264 157 312 141 364"/>
      <path class="string" d="M117 216C120 264 130 314 140 365"/>
      <path class="string" d="M211 233C191 276 167 322 142 367"/>
      <path class="string" d="M137 255C138 294 139 333 141 367"/>
      <path class="knot" d="M141 364c-8 6-16 18-13 30 7-8 14-16 20-24 7 8 14 16 20 24 2-12-4-24-13-30-3 16-2 30 4 42"/>
    </g>
  </svg>`;

  const patchAnimationFx=()=>{
    const fx=document.getElementById('mq-cinematic-fx');
    if(!fx) return;
    fx.querySelectorAll('.mq-balloon-cluster').forEach((cluster,idx)=>{
      if(cluster.dataset.mqBalloonV4==='1') return;
      cluster.innerHTML=balloonSVG(idx===0?1:2);
      cluster.dataset.mqBalloonV4='1';
    });
  };

  const patchMusic=()=>{
    try{
      if(typeof profiles!=='undefined'){
        Object.assign(profiles.default,{tempo:70,pad:'warm',lead:'piano',drums:'none',density:.42,air:.24});
        Object.assign(profiles.all,{tempo:72,pad:'warm',lead:'piano',drums:'none',density:.44,air:.24});
        Object.assign(profiles.action,{tempo:100,pad:'brass',lead:'horn',drums:'cinema',density:.68,air:.16});
        Object.assign(profiles.comedy,{tempo:94,pad:'light',lead:'piano',drums:'light',density:.56,air:.16});
        Object.assign(profiles.drama,{tempo:64,pad:'strings',lead:'piano',drums:'none',density:.36,air:.24});
        Object.assign(profiles.horror,{tempo:48,pad:'dark',lead:'piano',drums:'heartbeat',density:.34,air:.38});
        Object.assign(profiles.scifi,{tempo:74,pad:'space',lead:'rhodes',drums:'none',density:.48,air:.34});
        Object.assign(profiles.thriller,{tempo:74,pad:'tense',lead:'rhodes',drums:'none',density:.46,air:.28});
        Object.assign(profiles.crime,{tempo:68,pad:'noir',lead:'rhodes',drums:'brush',density:.48,air:.22});
        Object.assign(profiles.animation,{tempo:100,pad:'light',lead:'celesta',drums:'light',density:.62,air:.15});
        Object.assign(profiles.romance,{tempo:66,pad:'lush',lead:'piano',drums:'none',density:.38,air:.23});
        Object.assign(profiles.fantasy,{tempo:74,pad:'choir',lead:'celesta',drums:'none',density:.5,air:.32});
        Object.assign(profiles.adventure,{tempo:90,pad:'brass',lead:'horn',drums:'cinema',density:.62,air:.18});
        Object.assign(profiles.western,{tempo:84,pad:'dry',lead:'guitar',drums:'light',density:.46,air:.12});
      }
      if(typeof CinematicScore!=='undefined'){
        CinematicScore.prototype.tick=function(t,vol=0.006){ if(!this.ctx) return; const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter(); s.buffer=this.noiseBuffer; f.type='bandpass'; f.frequency.value=1550; f.Q.value=1.2; s.connect(f); f.connect(g); g.connect(this.musicBus); this.envelope(g,t,.012,.06,.18,.18,vol); s.start(t); s.stop(t+.22); };
        CinematicScore.prototype.hat=function(t,vol=.006,open=false){ if(!this.ctx) return; const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter(); s.buffer=this.noiseBuffer; f.type='bandpass'; f.frequency.value=2400; f.Q.value=.7; s.connect(f); f.connect(g); g.connect(this.musicBus); this.envelope(g,t,.01,.03,.12,open?.18:.09,vol); s.start(t); s.stop(t+(open?.22:.14)); };
        CinematicScore.prototype.wood=function(t,vol=.01,freq=520){ this.osc('sine',freq*.78,t,.14,vol*.45,this.musicBus); this.osc('sine',freq*1.56,t,.1,vol*.12,this.musicBus); };
      }
      if(typeof score!=='undefined' && score){
        if(score.musicBus) score.musicBus.gain.value=.858;
        const current=score.genre||'default';
        if(score.playing){ score.stop(false); setTimeout(()=>{ try{ score.setGenre(current); if(score.enabled) score.start(); }catch(_e){} },120); }
      }
    }catch(_e){}
  };

  const boot=()=>{ patchAnimationFx(); patchMusic(); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
