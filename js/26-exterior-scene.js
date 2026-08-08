(()=>{
  'use strict';
  const VERSION='exterior-integration-v4.0';
  const exterior=document.getElementById('mqExteriorScene');
  const stage=document.getElementById('mqExteriorStage');
  const booth=document.getElementById('mqTicketBoothHotspot');
  const ticketLayer=document.getElementById('mqTicketLayer');
  const ticketMount=document.getElementById('mqTicketProfileMount');
  const cinema=document.getElementById('cinema');
  const walkCursor=document.getElementById('mqWalkCursor');
  if(!exterior||!stage||!booth||!ticketLayer||!ticketMount||!cinema)return;

  let originalShowView=null,wrapped=false,ticketOpen=false,entering=false,auditoriumEntered=false;
  let profilePanel=null,profilePlaceholder=null;
  const ambience=new Audio('assets/audio/city_ambience.ogg');ambience.loop=true;ambience.preload='auto';ambience.playsInline=true;
  const footsteps=new Audio('assets/audio/footsteps.ogg');footsteps.preload='auto';footsteps.playsInline=true;
  let ambienceUnlocked=false;

  function resizeStage(){
    const scale=Math.max(.34,Math.min(window.innerWidth/1672,window.innerHeight/941));
    stage.style.transform=`translate(-50%,-50%) scale(${scale})`;
  }
  resizeStage();window.addEventListener('resize',resizeStage,{passive:true});

  function settings(){return window.MovieQuizSettings||null}
  function musicLevel(){try{return settings()?.musicVolume?.()??50}catch(_){return 50}}
  function sfxLevel(){try{return settings()?.sfxVolume?.()??50}catch(_){return 50}}
  function syncExternalAudio(){const v=Math.max(0,Math.min(100,Number(sfxLevel())||0))/100;ambience.volume=.50*v;footsteps.volume=Math.min(1,.90*v)}
  function unlockAmbience(){syncExternalAudio();if(ambienceUnlocked)return;ambienceUnlocked=true;ambience.play().catch(()=>{ambienceUnlocked=false})}
  function stopAmbience(){ambience.pause()}
  function playFootsteps(){syncExternalAudio();try{footsteps.currentTime=0;footsteps.play().catch(()=>{})}catch(_){}}

  function findProfilePanel(){profilePanel=document.getElementById('mqProfileShell')||document.querySelector('.mq-player-shell,.mq-player-card');return profilePanel}
  function mountProfileOnTicket(){const panel=findProfilePanel();if(!panel)return false;if(!profilePlaceholder){profilePlaceholder=document.createComment('mq-profile-return');panel.parentNode?.insertBefore(profilePlaceholder,panel)}panel.classList.add('mq-ticket-player-panel');ticketMount.appendChild(panel);return true}
  function restoreProfilePanel(){const panel=findProfilePanel();if(!panel)return;if(profilePlaceholder?.parentNode)profilePlaceholder.parentNode.insertBefore(panel,profilePlaceholder.nextSibling);panel.classList.remove('mq-ticket-player-panel')}
  function showTicketLayer(){ticketLayer.hidden=false;document.body.classList.add('mq-ticket-open');ticketOpen=true;requestAnimationFrame(mountProfileOnTicket);setTimeout(mountProfileOnTicket,90);setTimeout(mountProfileOnTicket,300)}
  function openTicket(){if(ticketOpen||entering)return;unlockAmbience();playFootsteps();exterior.classList.add('is-approaching');setTimeout(()=>{try{originalShowView?.('playerView')}catch(_){}showTicketLayer()},760)}
  function enterAuditorium(){if(entering)return;entering=true;document.body.classList.add('mq-entering-auditorium');exterior.classList.add('is-leaving');stopAmbience();setTimeout(()=>{restoreProfilePanel();ticketLayer.hidden=true;exterior.hidden=true;ticketOpen=false;auditoriumEntered=true;entering=false;document.body.classList.remove('mq-exterior-active','mq-ticket-open','mq-entering-auditorium');document.body.classList.add('mq-auditorium-entered');cinema.classList.add('running','open');try{originalShowView?.('difficulty')}catch(_){}try{document.getElementById('screen')?.removeAttribute('data-genre');if(typeof switchMusic==='function')switchMusic('menu');if(typeof sound==='function')sound('soft')}catch(_){}setTimeout(()=>window.dispatchEvent(new Event('resize')),80)},820)}
  function wrapShowView(){if(wrapped||typeof window.showView!=='function')return false;originalShowView=window.showView;window.showView=function(id){if(id==='difficulty'&&ticketOpen&&!auditoriumEntered){enterAuditorium();return}if(id==='playerView'&&auditoriumEntered){originalShowView(id);showTicketLayer();return}return originalShowView(id)};wrapped=true;return true}
  function waitForGameSystems(){if(wrapShowView())return;setTimeout(waitForGameSystems,60)}

  function updateWalkCursor(e){if(!walkCursor)return;walkCursor.style.left=e.clientX+'px';walkCursor.style.top=e.clientY+'px'}
  function showWalk(v){walkCursor?.classList.toggle('is-visible',!!v)}

  const music=document.getElementById('mqExteriorMusic');
  const sfx=document.getElementById('mqExteriorSfx');
  const audioToggle=document.getElementById('mqExteriorAudioOpen');
  const audioPanel=document.getElementById('mqExteriorAudioPanel');
  function syncSliders(){const api=settings();if(!api)return;if(music&&!music.matches(':active'))music.value=String(Math.round(api.musicVolume()));if(sfx&&!sfx.matches(':active'))sfx.value=String(Math.round(api.sfxVolume()));syncExternalAudio()}
  function setAudioOpen(open){if(!audioPanel||!audioToggle)return;audioPanel.hidden=!open;audioToggle.setAttribute('aria-expanded',String(open))}
  audioToggle?.addEventListener('pointerdown',e=>e.stopPropagation());
  audioToggle?.addEventListener('click',e=>{e.stopPropagation();setAudioOpen(audioPanel?.hidden!==false)});
  audioPanel?.addEventListener('pointerdown',e=>e.stopPropagation());
  audioPanel?.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('pointerdown',()=>setAudioOpen(false));
  music?.addEventListener('input',()=>settings()?.setMusicVolume?.(Number(music.value)));
  sfx?.addEventListener('input',()=>{settings()?.setSfxVolume?.(Number(sfx.value));syncExternalAudio()});
  window.addEventListener('mq:settings-changed',syncSliders);setInterval(syncSliders,900);

  booth.addEventListener('pointerenter',e=>{showWalk(true);updateWalkCursor(e)});
  booth.addEventListener('pointermove',updateWalkCursor);
  booth.addEventListener('pointerleave',()=>showWalk(false));
  booth.addEventListener('click',e=>{e.preventDefault();showWalk(false);openTicket()});
  exterior.addEventListener('pointerdown',unlockAmbience,{once:true,passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement===booth)openTicket()});

  waitForGameSystems();setTimeout(syncSliders,300);setTimeout(syncSliders,1200);
  window.MovieQuizExterior=Object.freeze({version:VERSION,openTicket,stopAmbience});
})();
