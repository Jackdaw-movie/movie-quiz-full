(()=>{
  'use strict';

  const CLIENT_VERSION='v39-history-v2-no-silent-fallback';
  const QUESTION_COUNT=18;
  const SUPABASE_URL='https://ymfaskxcgtgflhnjoylz.supabase.co';
  const SERVER_GENRES=new Set(['fantasy','horror','scifi','crime','animation','comedy']);
  const SERVER_GENRE_LABELS={
    fantasy:'Fantasy',
    horror:'Horor',
    scifi:'Sci-fi',
    crime:'Krimi a thriller',
    animation:'Animace',
    comedy:'Komedie'
  };

  const localStartGame=startGame;
  const localNextQuestion=nextQuestion;
  const localAnswer=answer;

  let serverMode=false;
  let sessionId='';
  let startingPromise=null;
  let loadingQuestion=false;
  let questionShownAt=0;
  let activeAudio=null;
  let sessionFinished=false;

  function questionWrap(){return document.querySelector('.question-wrap')}
  function onlineApi(){return window.MovieQuizOnline}
  function currentGenreLabel(){
    return SERVER_GENRE_LABELS[state?.genre]||genreLabels?.[state?.genre]||'Filmový žánr';
  }

  function normalizeRows(data){
    if(Array.isArray(data))return data;
    return data?[data]:[];
  }

  function normalizeJson(value,fallback=[]){
    if(Array.isArray(value))return value;
    if(value&&typeof value==='object')return value;
    if(typeof value==='string'){
      try{return JSON.parse(value)}catch(_){return fallback}
    }
    return fallback;
  }

  function setServerFlag(value){
    window.__mqServerVerifiedSessionActive=Boolean(value);
  }

  function ensureMediaStage(){
    let stage=document.getElementById('mqMediaStage');
    if(stage)return stage;
    stage=document.createElement('div');
    stage.id='mqMediaStage';
    const question=document.getElementById('question');
    question?.parentNode?.insertBefore(stage,question);
    return stage;
  }

  function stopActiveMedia(){
    if(activeAudio){
      try{activeAudio.pause()}catch(_){}
      activeAudio=null;
    }
    const stage=ensureMediaStage();
    stage.innerHTML='';
  }

  function publicMediaUrl(storagePath){
    const api=onlineApi();
    const db=api?.getClient?.();
    if(db){
      const result=db.storage.from('quiz-media').getPublicUrl(storagePath);
      const url=result?.data?.publicUrl;
      if(url)return url;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/quiz-media/${String(storagePath||'').split('/').map(encodeURIComponent).join('/')}`;
  }

  function formatSeconds(value){
    const total=Math.max(0,Math.ceil(Number(value)||0));
    const minutes=Math.floor(total/60);
    const seconds=String(total%60).padStart(2,'0');
    return `${minutes}:${seconds}`;
  }

  function renderMedia(mediaItems){
    stopActiveMedia();
    const stage=ensureMediaStage();
    const items=normalizeJson(mediaItems,[]);
    if(!items.length)return;

    const item=items[0]||{};
    const path=item.storagePath||item.storage_path;
    if(!path)return;
    const url=publicMediaUrl(path);
    const type=item.type||'';

    if(type==='image'){
      const img=document.createElement('img');
      img.className='mq-media-image';
      img.src=url;img.alt='Obrazová filmová otázka';img.loading='eager';img.decoding='async';
      stage.appendChild(img);return;
    }

    if(type==='video'){
      const video=document.createElement('video');
      video.className='mq-media-video';video.src=url;video.controls=true;video.preload='metadata';video.playsInline=true;
      stage.appendChild(video);return;
    }

    if(type!=='audio')return;

    const clipStart=Math.max(0,Number(item.clipStartMs||item.clip_start_ms||0)/1000);
    const rawEnd=item.clipEndMs??item.clip_end_ms;
    const clipEnd=rawEnd==null?null:Math.max(clipStart,Number(rawEnd)/1000);
    const audio=new Audio(url);audio.preload='metadata';activeAudio=audio;

    const card=document.createElement('div');card.className='mq-audio-card';
    const head=document.createElement('div');head.className='mq-audio-head';
    const button=document.createElement('button');button.type='button';button.className='mq-audio-play';button.textContent='▶';button.setAttribute('aria-label','Přehrát zvukovou ukázku');
    const copy=document.createElement('div');copy.className='mq-audio-copy';
    const title=document.createElement('div');title.className='mq-audio-title';title.textContent='Zvuková stopa';
    const time=document.createElement('div');time.className='mq-audio-time';time.textContent='Připraveno k přehrání';
    const progress=document.createElement('div');progress.className='mq-audio-progress';progress.innerHTML='<i></i>';
    copy.append(title,time);head.append(button,copy);card.append(head,progress);stage.appendChild(card);
    const fill=progress.querySelector('i');

    function duration(){
      if(clipEnd!=null)return Math.max(.1,clipEnd-clipStart);
      if(Number.isFinite(audio.duration))return Math.max(.1,audio.duration-clipStart);
      return Math.max(.1,Number(item.durationMs||item.duration_ms||10000)/1000);
    }
    function reset(){
      audio.pause();button.textContent='▶';fill.style.width='0%';time.textContent=`Ukázka ${formatSeconds(duration())}`;
      try{audio.currentTime=clipStart}catch(_){}
    }
    function update(){
      const elapsed=Math.max(0,audio.currentTime-clipStart),d=duration();
      fill.style.width=`${Math.min(100,elapsed/d*100)}%`;
      time.textContent=`Zbývá ${formatSeconds(Math.max(0,d-elapsed))}`;
      if((clipEnd!=null&&audio.currentTime>=clipEnd)||elapsed>=d)reset();
    }
    button.addEventListener('click',async()=>{
      if(!audio.paused){audio.pause();button.textContent='▶';return}
      if(audio.currentTime<clipStart||audio.currentTime>=clipStart+duration())audio.currentTime=clipStart;
      try{await audio.play();button.textContent='❚❚'}catch(_){time.textContent='Zvuk se nepodařilo přehrát';}
    });
    audio.addEventListener('loadedmetadata',()=>{if(audio.currentTime<clipStart)audio.currentTime=clipStart;time.textContent=`Ukázka ${formatSeconds(duration())}`});
    audio.addEventListener('timeupdate',update);
    audio.addEventListener('pause',()=>{if(audio.currentTime<clipStart+duration())button.textContent='▶'});
    audio.addEventListener('ended',reset);
    if(item.autoplay){audio.addEventListener('canplay',()=>button.click(),{once:true})}
  }

  function renderLoading(text='Načítám otázku z filmového archivu…'){
    state.locked=true;
    const wrap=questionWrap();wrap?.classList.add('mq-db-loading');
    document.getElementById('qType').textContent='Online databáze';
    document.getElementById('qEra').textContent=currentGenreLabel();
    document.getElementById('question').textContent=text;
    answersEl.innerHTML='<div class="mq-db-loading-card"><i class="mq-db-spinner" aria-hidden="true"></i><span>Chystá se další filmová otázka</span></div>';
    stopActiveMedia();
  }

  function clearLoading(){questionWrap()?.classList.remove('mq-db-loading')}

  async function abandonSession(){
    if(!serverMode||!sessionId||sessionFinished)return;
    const abandonedSessionId=sessionId;
    try{
      const api=onlineApi();
      const {client:db}=await api.ensureBackend();
      await db.rpc('abandon_quiz_session',{p_session_id:abandonedSessionId});
    }catch(error){console.warn('Movie Quiz: rozehranou online relaci se nepodařilo označit jako opuštěnou.',error)}
  }

  function deactivateServerMode(){
    serverMode=false;sessionId='';startingPromise=null;loadingQuestion=false;sessionFinished=false;
    setServerFlag(false);stopActiveMedia();clearLoading();
  }

  function databaseErrorMessage(error){
    const message=String(error?.message||error?.error_description||error||'').trim();
    if(!message)return 'Spojení s filmovou databází se nezdařilo.';
    if(/failed to fetch|network|load failed|connection/i.test(message))return 'Nepodařilo se spojit s filmovou databází. Zkontrolujte připojení k internetu.';
    if(/only .* non-repeating questions could be selected/i.test(message))return 'Databáze nedokázala sestavit dostatečně různorodou sadu otázek. Zkuste načtení zopakovat.';
    return 'Filmová databáze vrátila chybu. Hra nebude použita s lokálními náhradními otázkami.';
  }

  function renderDatabaseError(error){
    console.error('Movie Quiz: online otázku se nepodařilo načíst. Lokální banka nebyla spuštěna.',error);
    state.locked=true;
    stopActiveMedia();
    clearLoading();
    questionWrap()?.classList.add('mq-db-error');
    document.getElementById('qType').textContent='Online databáze';
    document.getElementById('qEra').textContent=currentGenreLabel();
    document.getElementById('question').textContent='Otázku se nepodařilo načíst';
    answersEl.innerHTML=`<div class="mq-db-error-card">
      <strong>Databázový režim zůstal aktivní</strong>
      <span>${databaseErrorMessage(error)}</span>
      <small>Nedochází k tichému přepnutí na starou lokální banku.</small>
      <div class="mq-db-error-actions">
        <button type="button" class="mq-db-retry" id="mqDbRetry">Zkusit znovu</button>
        <button type="button" class="mq-db-menu" id="mqDbMenu">Zpět do nabídky</button>
      </div>
    </div>`;
    document.getElementById('mqDbRetry')?.addEventListener('click',()=>{
      questionWrap()?.classList.remove('mq-db-error');
      loadNextServerQuestion();
    });
    document.getElementById('mqDbMenu')?.addEventListener('click',()=>{
      document.getElementById('homeBtn')?.click();
    });
  }

  async function beginSession(){
    if(sessionId)return sessionId;
    if(startingPromise)return startingPromise;
    startingPromise=(async()=>{
      const api=onlineApi();
      if(!api?.ensureBackend)throw new Error('Online připojení hry ještě není připravené.');
      const {client:db}=await api.ensureBackend();
      const {data,error}=await db.rpc('start_quiz_session',{
        p_game_mode:'classic',
        p_genre:state.genre,
        p_difficulty:state.difficulty,
        p_question_count:QUESTION_COUNT,
        p_client_version:CLIENT_VERSION
      });
      if(error)throw error;
      const row=normalizeRows(data)[0];
      if(!row?.session_id)throw new Error('Databáze nevrátila identifikátor hry.');
      sessionId=row.session_id;
      sessionFinished=false;
      return sessionId;
    })().finally(()=>{startingPromise=null});
    return startingPromise;
  }

  function renderQuestion(row){
    clearLoading();
    const options=normalizeJson(row.options,[]).map(item=>({
      id:item.id,
      text:item.text??item.option_text??''
    })).filter(item=>item.id&&item.text);
    if(options.length!==4)throw new Error('Otázka nemá přesně čtyři možnosti odpovědi.');

    state.current={
      server:true,
      questionId:row.question_id,
      q:row.prompt,
      type:row.question_type,
      typeLabel:row.type_label||'Film',
      eraLabel:row.era_label||'Napříč érami',
      tags:row.question_tags||[],
      options,
      media:row.media||[]
    };
    state.locked=false;
    document.getElementById('question').textContent=state.current.q;
    document.getElementById('qType').textContent=state.current.typeLabel;
    document.getElementById('qEra').textContent=state.current.eraLabel;
    document.getElementById('questionNo').textContent=state.questionNo;
    document.getElementById('score').textContent=state.score;
    document.getElementById('progress').style.width=`${state.score/15*100}%`;
    answersEl.innerHTML='';
    options.forEach((option,index)=>{
      const button=document.createElement('button');
      button.className='answer';button.dataset.letter='ABCD'[index];button.dataset.optionId=option.id;button.textContent=option.text;
      button.addEventListener('click',()=>answer(button,option.id));
      answersEl.appendChild(button);
    });
    renderMedia(state.current.media);
    questionShownAt=performance.now();
    animateQuestionIn();sound('tick');
  }

  async function loadNextServerQuestion(){
    if(loadingQuestion)return;
    loadingQuestion=true;renderLoading();
    try{
      await beginSession();
      const api=onlineApi();
      const {client:db}=await api.ensureBackend();
      const {data,error}=await db.rpc('get_next_quiz_question',{p_session_id:sessionId});
      if(error)throw error;
      const row=normalizeRows(data)[0];
      if(!row)throw new Error('Databáze nevrátila další otázku.');
      renderQuestion(row);
    }catch(error){
      renderDatabaseError(error);
    }finally{loadingQuestion=false}
  }

  startGame=function(genre){
    if(!SERVER_GENRES.has(genre)){
      if(serverMode&&!sessionFinished)abandonSession();
      deactivateServerMode();
      return localStartGame(genre);
    }
    if(serverMode&&!sessionFinished)abandonSession();
    serverMode=true;sessionId='';sessionFinished=false;startingPromise=null;loadingQuestion=false;
    setServerFlag(true);
    return localStartGame(genre);
  };

  nextQuestion=function(){
    if(!serverMode)return localNextQuestion();
    if(state.score>=15)return win();
    return loadNextServerQuestion();
  };

  answer=async function(button,optionId){
    if(!serverMode||!state.current?.server)return localAnswer(button,optionId);
    if(state.locked)return;
    state.locked=true;stopActiveMedia();
    const buttons=[...document.querySelectorAll('.answer')];
    buttons.forEach(item=>item.classList.add('locked'));
    button.classList.add('mq-checking');

    try{
      const api=onlineApi();
      const {client:db}=await api.ensureBackend();
      const responseMs=Math.max(0,Math.round(performance.now()-questionShownAt));
      const {data,error}=await db.rpc('submit_quiz_answer',{
        p_session_id:sessionId,
        p_question_id:state.current.questionId,
        p_option_id:optionId,
        p_response_ms:responseMs
      });
      if(error)throw error;
      const result=normalizeRows(data)[0];
      if(!result)throw new Error('Databáze nepotvrdila odpověď.');

      button.classList.remove('mq-checking');
      const good=Boolean(result.answer_correct);
      const correctButton=buttons.find(item=>item.dataset.optionId===String(result.correct_option_id));
      window.__mqLastAnswerCorrect=good;
      if(good){button.classList.add('correct','answer-correct-pulse');sound('correct')}
      else{
        button.classList.add('wrong','answer-wrong-pulse');
        correctButton?.classList.add('correct','correct-answer-blink');
        sound('wrong');
      }

      await throwAward(button);
      window.__mqLastAnswerCorrect=undefined;
      state.score=Number(result.current_score)||0;
      state.lives=Math.max(0,Number(result.current_lives)||0);
      document.getElementById('score').textContent=state.score;
      document.getElementById('progress').style.width=`${state.score/15*100}%`;

      if(good){showFeedback('Správně');confettiBurst(button)}
      else burnLife(state.lives);

      const finished=Boolean(result.game_finished);
      const won=Boolean(result.game_won);
      if(finished)sessionFinished=true;
      const wait=good?1350:1900;
      setTimeout(()=>{
        if(finished){
          if(won)win();else creditsThenEnd();
          return;
        }
        state.questionNo++;
        nextQuestion();
      },wait);
    }catch(error){
      button.classList.remove('mq-checking');
      state.locked=false;
      buttons.forEach(item=>item.classList.remove('locked'));
      console.error('Movie Quiz: odpověď se nepodařilo ověřit.',error);
      showFeedback('Zkuste odpověď znovu');
    }
  };

  document.getElementById('homeBtn')?.addEventListener('click',()=>{
    if(serverMode&&!sessionFinished)abandonSession();
    deactivateServerMode();
  });
  ['replayEnd','replayWin','creditsSkip'].forEach(id=>{
    document.getElementById(id)?.addEventListener('click',()=>deactivateServerMode());
  });
  addEventListener('beforeunload',()=>{
    if(serverMode&&!sessionFinished)abandonSession();
  });

  window.MovieQuizQuestionBank=Object.freeze({
    isServerMode:()=>serverMode,
    getSessionId:()=>sessionId,
    getSupportedGenres:()=>[...SERVER_GENRES],
    version:CLIENT_VERSION
  });
})();
