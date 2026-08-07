(()=>{
  'use strict';

  const VERSION='noir-ui-v2';

  function installFonts(){
    if(document.getElementById('mqNoirV2Fonts'))return;

    const link=document.createElement('link');
    link.id='mqNoirV2Fonts';
    link.rel='stylesheet';
    link.href='https://fonts.googleapis.com/css2?family=Limelight&family=Oswald:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
  }

  function cleanPlayerFacingCopy(){
    // Výběr obtížnosti a žánru: pouze to, co hráč opravdu potřebuje.
    document.querySelectorAll('#difficulty .selection-note,#genres .selection-note')
      .forEach(node=>node.hidden=true);

    document.querySelectorAll('#difficulty .difficulty-card .card-copy small')
      .forEach(node=>node.hidden=true);

    document.querySelectorAll('#genres .genre-card .card-copy small')
      .forEach(node=>node.hidden=true);

    // Odstraň starší experimentální tipy, pokud zůstaly v DOM.
    document.querySelectorAll('.mq-selection-ux-hints')
      .forEach(node=>node.remove());

    // Avatarové interní názvy nesmí být nikde vidět.
    document.querySelectorAll('.mq-avatar-profile-row')
      .forEach(node=>node.remove());

    document.querySelectorAll('#mqAvatarGrid .mq-avatar-choice strong')
      .forEach(node=>node.remove());
  }

  function moveReportingToGameCorner(){
    const game=document.getElementById('game');
    const toolbar=document.querySelector('.mq-report-toolbar');
    if(!game||!toolbar)return;

    if(toolbar.parentElement!==game){
      game.appendChild(toolbar);
    }
  }

  function restoreSeats(){
    const seats=document.getElementById('seats');
    if(!seats)return;

    // Core normálně vytváří 12 sedadel. Pokud jiná vrstva DOM vyčistila,
    // bezpečně je doplníme zpět bez zásahu do herní logiky.
    if(!seats.querySelector('.seat')){
      for(let i=0;i<12;i++){
        const seat=document.createElement('i');
        seat.className='seat';
        seats.appendChild(seat);
      }
    }
  }

  function prepareInitialCurtain(){
    const cinema=document.getElementById('cinema');
    const intro=document.getElementById('intro');
    if(!cinema||!intro)return;

    if(intro.classList.contains('active')){
      cinema.classList.remove('open','running');
      cinema.classList.add('mq-intro-curtain-closed');
    }

    document.getElementById('startBtn')?.addEventListener('click',()=>{
      cinema.classList.remove('mq-intro-curtain-closed');
    },{once:true});
  }

  function markUi(){
    document.body.classList.add('mq-noir-v2');
    document.getElementById('cinema')?.classList.add('mq-noir-cinema-v2');
    document.getElementById('screen')?.classList.add('mq-noir-screen-v2');

    cleanPlayerFacingCopy();
    moveReportingToGameCorner();
    restoreSeats();
  }

  function observe(){
    const screen=document.getElementById('screen');
    if(screen){
      let queued=false;
      const observer=new MutationObserver(()=>{
        if(queued)return;
        queued=true;
        queueMicrotask(()=>{
          queued=false;
          markUi();
        });
      });
      observer.observe(screen,{childList:true,subtree:true});
    }

    window.addEventListener('mq:server-question-rendered',()=>{
      requestAnimationFrame(()=>{
        moveReportingToGameCorner();
        cleanPlayerFacingCopy();
      });
    });
  }

  function init(){
    installFonts();
    markUi();
    prepareInitialCurtain();
    observe();

    // Profil, avatar a reporting se mohou přidat o chvíli později.
    setTimeout(markUi,250);
    setTimeout(markUi,800);
    setTimeout(markUi,1500);
  }

  window.MovieQuizNoirUi=Object.freeze({
    version:VERSION,
    refresh:markUi
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();