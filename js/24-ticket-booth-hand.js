(function(){
  const DEFAULT_IMAGE_SRC = 'assets/exterior-v6-9/production/ticket-booth-hand.png';
  const HOST_SELECTORS = [
    '#exteriorScene',
    '#cinemaExterior',
    '#jackdawExterior',
    '#movieQuizExterior',
    '#screenView',
    '#gameScreen',
    '.exterior-scene',
    '.cinema-exterior',
    '.game-stage',
    '.screen-stage'
  ];

  function ensureRelative(host){
    const style = window.getComputedStyle(host);
    if(style.position === 'static') host.style.position = 'relative';
  }

  function buildMarkup(src){
    const overlay = document.createElement('div');
    overlay.className = 'mq-ticket-hand-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="mq-ticket-hand-portal">
        <img class="mq-ticket-hand-sprite" src="${src}" alt="">
      </div>
    `;
    return overlay;
  }

  function findHost(){
    for(const selector of HOST_SELECTORS){
      const el = document.querySelector(selector);
      if(el) return el;
    }
    return null;
  }

  function mount(host, options = {}){
    if(!host || host.__mqTicketBoothHandMounted) return null;
    ensureRelative(host);
    const src = options.src || host.getAttribute('data-ticket-hand-src') || window.MQ_TICKET_BOOTH_HAND_SRC || DEFAULT_IMAGE_SRC;
    const overlay = buildMarkup(src);
    host.appendChild(overlay);
    host.__mqTicketBoothHandMounted = true;
    host.__mqTicketBoothHandOverlay = overlay;
    return overlay;
  }

  function autoMount(){
    const host = findHost();
    if(host) mount(host);
  }

  window.MovieQuizTicketBoothHand = {
    mount,
    autoMount,
    findHost
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', autoMount, { once:true });
  } else {
    autoMount();
  }
})();
