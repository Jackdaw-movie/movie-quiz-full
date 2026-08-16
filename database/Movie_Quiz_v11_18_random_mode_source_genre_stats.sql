-- ============================================================
-- MOVIE QUIZ v11.18
-- NÁHODNÉ: one verified mixed session + source-genre statistics
--
-- Design:
-- - "random" is a play mode / completed projection label.
-- - Questions KEEP their canonical genre in quiz_private.questions.
-- - Every random answer is attributed by question_id on the SERVER.
-- - Only COMPLETED random sessions are included in redistributed genre stats.
-- - Existing six-genre question bank and existing RPCs stay unchanged.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Canonical attribution history for random-mode answers
-- ------------------------------------------------------------

create table if not exists quiz_private.random_genre_answer_history (
  id bigint generated always as identity primary key,
  player_id uuid not null,
  session_id uuid not null
    references public.quiz_sessions(id)
    on delete cascade,
  question_id uuid not null
    references quiz_private.questions(id)
    on delete restrict,
  genre text not null,
  difficulty smallint not null,
  was_correct boolean not null,
  run_completed boolean not null default false,
  answered_at timestamptz not null default now(),

  constraint random_genre_answer_genre_check
    check (genre in (
      'fantasy','horror','scifi','crime','animation','comedy'
    )),

  constraint random_genre_answer_difficulty_check
    check (difficulty between 1 and 3),

  constraint random_genre_answer_unique
    unique (player_id, session_id, question_id)
);

create index if not exists random_genre_answer_player_genre_idx
  on quiz_private.random_genre_answer_history (
    player_id,
    genre,
    answered_at desc
  );

create index if not exists random_genre_answer_player_question_idx
  on quiz_private.random_genre_answer_history (
    player_id,
    question_id,
    answered_at desc
  );

revoke all privileges
on quiz_private.random_genre_answer_history
from public, anon, authenticated;


-- ------------------------------------------------------------
-- 2. Start one balanced RANDOM session
--
-- Reuses the current battle-tested start_quiz_session selector six times.
-- It asks every source genre for its quota, copies only the selected question
-- IDs into one master session, then removes the temporary selector sessions.
-- For the current 18-question pool this produces exactly 3 questions/genre.
-- ------------------------------------------------------------

create or replace function public.start_random_quiz_session(
  p_game_mode text,
  p_difficulty text,
  p_question_count integer default 18,
  p_client_version text default null
)
returns table (
  session_id uuid,
  selected_questions integer
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict error
declare
  v_user_id uuid;
  v_master_session uuid;
  v_donor_session uuid;
  v_genres text[] := array[
    'fantasy','horror','scifi','crime','animation','comedy'
  ];
  v_genre text;
  v_index integer;
  v_requested integer;
  v_base_quota integer;
  v_remainder integer;
  v_quota integer;
  v_inserted integer := 0;
begin
  v_user_id := quiz_private.current_player_profile_id();

  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_difficulty not in ('easy','medium','hard') then
    raise exception 'Unsupported difficulty';
  end if;

  if nullif(btrim(coalesce(p_game_mode,'')), '') is null then
    raise exception 'Game mode is required';
  end if;

  v_requested := least(
    greatest(coalesce(p_question_count,18),6),
    48
  );

  v_base_quota := v_requested / 6;
  v_remainder := v_requested % 6;

  create temporary table tmp_mq_random_donors (
    session_id uuid primary key
  ) on commit drop;

  create temporary table tmp_mq_random_questions (
    question_id uuid primary key,
    source_genre text not null
  ) on commit drop;

  for v_index in 1..6 loop
    v_genre := v_genres[v_index];
    v_quota := v_base_quota
      + case when v_index <= v_remainder then 1 else 0 end;

    if v_quota <= 0 then
      continue;
    end if;

    select started.session_id
    into v_donor_session
    from public.start_quiz_session(
      p_game_mode,
      v_genre,
      p_difficulty,
      v_quota,
      coalesce(p_client_version,'v11.18')
        || ':random-selector:' || v_genre
    ) as started
    limit 1;

    if v_donor_session is null then
      raise exception 'Random selector did not return a session for %', v_genre;
    end if;

    insert into tmp_mq_random_donors(session_id)
    values (v_donor_session);

    insert into tmp_mq_random_questions (
      question_id,
      source_genre
    )
    select
      selected.question_id,
      v_genre
    from quiz_private.session_questions as selected
    where selected.session_id = v_donor_session
    order by selected.question_number
    limit v_quota;
  end loop;

  select count(*)
  into v_inserted
  from tmp_mq_random_questions;

  if v_inserted <> v_requested then
    raise exception
      'Random mode selected % of % requested questions',
      v_inserted,
      v_requested;
  end if;

  insert into public.quiz_sessions (
    player_id,
    game_mode,
    genre,
    difficulty,
    requested_question_count,
    client_version,
    question_bank_version,
    history_tier,
    history_window_used,
    movie_history_window_used
  )
  values (
    v_user_id,
    btrim(p_game_mode),
    'random',
    p_difficulty,
    v_requested,
    p_client_version,
    'random-balanced-source-genres-v1',
    1,
    150,
    50
  )
  returning id into v_master_session;

  insert into quiz_private.session_questions (
    session_id,
    question_number,
    question_id
  )
  select
    v_master_session,
    row_number() over (
      order by md5(
        random_question.question_id::text
        || v_master_session::text
      )
    )::integer,
    random_question.question_id
  from tmp_mq_random_questions as random_question;

  update public.quiz_sessions
  set
    selected_question_count = v_inserted,
    diversity_tier = 1,
    history_tier = 1,
    history_window_used = 150,
    movie_history_window_used = 50,
    unseen_questions_selected = 0,
    repeated_questions_selected = 0,
    unseen_movies_selected = 0,
    repeated_movies_selected = 0
  where id = v_master_session;

  -- Temporary selector sessions have never been played.
  delete from quiz_private.session_questions as selected
  where selected.session_id in (
    select donor.session_id
    from tmp_mq_random_donors as donor
  );

  delete from public.quiz_sessions as donor_session
  where donor_session.id in (
    select donor.session_id
    from tmp_mq_random_donors as donor
  );

  return query
  select v_master_session, v_inserted;
end;
$$;


-- ------------------------------------------------------------
-- 3. Get next RANDOM question + its true source genre
-- ------------------------------------------------------------

create or replace function public.get_next_random_quiz_question(
  p_session_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_payload jsonb;
  v_question_id uuid;
  v_source_genre text;
  v_external_id text;
begin
  v_user_id := quiz_private.current_player_profile_id();

  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.quiz_sessions as session_row
    where
      session_row.id = p_session_id
      and session_row.player_id = v_user_id
      and session_row.genre = 'random'
  ) then
    raise exception 'Random quiz session was not found';
  end if;

  select to_jsonb(next_row)
  into v_payload
  from public.get_next_quiz_question(p_session_id) as next_row
  limit 1;

  if v_payload is null then
    raise exception 'Random quiz session did not return a question';
  end if;

  v_question_id := nullif(v_payload ->> 'question_id','')::uuid;

  select
    question.genre,
    question.external_id
  into
    v_source_genre,
    v_external_id
  from quiz_private.questions as question
  where question.id = v_question_id
  limit 1;

  if v_source_genre not in (
    'fantasy','horror','scifi','crime','animation','comedy'
  ) then
    raise exception 'Random question has unsupported source genre';
  end if;

  return v_payload || jsonb_build_object(
    'source_genre', v_source_genre,
    'question_external_id', v_external_id
  );
end;
$$;


-- ------------------------------------------------------------
-- 4. Submit RANDOM answer
--
-- Calls the existing verified answer RPC, then attributes the result to the
-- source genre resolved from question_id. The client cannot choose the genre.
-- ------------------------------------------------------------

create or replace function public.submit_random_quiz_answer(
  p_session_id uuid,
  p_question_id uuid,
  p_option_id uuid,
  p_response_ms integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_payload jsonb;
  v_source_genre text;
  v_difficulty smallint;
  v_correct boolean;
  v_finished boolean;
begin
  v_user_id := quiz_private.current_player_profile_id();

  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.quiz_sessions as session_row
    join quiz_private.session_questions as selected
      on selected.session_id = session_row.id
    where
      session_row.id = p_session_id
      and session_row.player_id = v_user_id
      and session_row.genre = 'random'
      and selected.question_id = p_question_id
  ) then
    raise exception 'Question does not belong to this random session';
  end if;

  select
    question.genre,
    question.difficulty
  into
    v_source_genre,
    v_difficulty
  from quiz_private.questions as question
  where question.id = p_question_id
  limit 1;

  if v_source_genre not in (
    'fantasy','horror','scifi','crime','animation','comedy'
  ) then
    raise exception 'Unsupported source genre';
  end if;

  select to_jsonb(answer_row)
  into v_payload
  from public.submit_quiz_answer(
    p_session_id,
    p_question_id,
    p_option_id,
    p_response_ms
  ) as answer_row
  limit 1;

  if v_payload is null then
    raise exception 'Answer was not verified';
  end if;

  v_correct := coalesce(
    (v_payload ->> 'answer_correct')::boolean,
    false
  );

  v_finished := coalesce(
    (v_payload ->> 'game_finished')::boolean,
    false
  );

  insert into quiz_private.random_genre_answer_history (
    player_id,
    session_id,
    question_id,
    genre,
    difficulty,
    was_correct,
    run_completed,
    answered_at
  )
  values (
    v_user_id,
    p_session_id,
    p_question_id,
    v_source_genre,
    v_difficulty,
    v_correct,
    v_finished,
    now()
  )
  on conflict (player_id, session_id, question_id)
  do update set
    genre = excluded.genre,
    difficulty = excluded.difficulty,
    was_correct = excluded.was_correct,
    answered_at = excluded.answered_at;

  if v_finished then
    update quiz_private.random_genre_answer_history as history
    set run_completed = true
    where
      history.player_id = v_user_id
      and history.session_id = p_session_id;
  end if;

  return v_payload || jsonb_build_object(
    'source_genre', v_source_genre
  );
end;
$$;


-- ------------------------------------------------------------
-- 5. Source-genre contribution of COMPLETED random games
-- ------------------------------------------------------------

create or replace function public.get_my_random_genre_statistics()
returns table (
  genre text,
  questions_answered bigint,
  correct_answers bigint,
  accuracy_percent numeric,
  unique_questions bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select quiz_private.current_player_profile_id() as player_id
  ),
  source_genres(genre) as (
    values
      ('fantasy'::text),
      ('horror'::text),
      ('scifi'::text),
      ('crime'::text),
      ('animation'::text),
      ('comedy'::text)
  ),
  aggregated as (
    select
      history.genre,
      count(*)::bigint as questions_answered,
      count(*) filter (
        where history.was_correct is true
      )::bigint as correct_answers,
      count(distinct history.question_id)::bigint as unique_questions
    from quiz_private.random_genre_answer_history as history
    join me
      on me.player_id = history.player_id
    where
      history.run_completed is true
      and me.player_id is not null
    group by history.genre
  )
  select
    source.genre,
    coalesce(aggregated.questions_answered,0)::bigint,
    coalesce(aggregated.correct_answers,0)::bigint,
    case
      when coalesce(aggregated.questions_answered,0) = 0
        then 0::numeric
      else round(
        aggregated.correct_answers::numeric
        * 100
        / aggregated.questions_answered::numeric,
        1
      )
    end as accuracy_percent,
    coalesce(aggregated.unique_questions,0)::bigint
  from source_genres as source
  left join aggregated
    on aggregated.genre = source.genre;
$$;


-- ------------------------------------------------------------
-- 6. Permissions
-- ------------------------------------------------------------

revoke all privileges
on function public.start_random_quiz_session(
  text,text,integer,text
)
from public, anon, authenticated;

revoke all privileges
on function public.get_next_random_quiz_question(uuid)
from public, anon, authenticated;

revoke all privileges
on function public.submit_random_quiz_answer(
  uuid,uuid,uuid,integer
)
from public, anon, authenticated;

revoke all privileges
on function public.get_my_random_genre_statistics()
from public, anon, authenticated;

grant execute
on function public.start_random_quiz_session(
  text,text,integer,text
)
to authenticated;

grant execute
on function public.get_next_random_quiz_question(uuid)
to authenticated;

grant execute
on function public.submit_random_quiz_answer(
  uuid,uuid,uuid,integer
)
to authenticated;

grant execute
on function public.get_my_random_genre_statistics()
to authenticated;

notify pgrst, 'reload schema';

commit;

select
  'Movie Quiz v11.18 random mode installed successfully'
  as status;
