-- ============================================================
-- MOVIE QUIZ
-- ADMINISTRACE NAHLÁŠENÝCH OTÁZEK
-- Databázový základ v1
--
-- Povolený administrátor:
--   kafkatomas13@gmail.com
--
-- Tato migrace:
-- 1. vytvoří neveřejný seznam administrátorů,
-- 2. přidá audit všech administrátorských změn,
-- 3. zpřístupní zabezpečené RPC funkce pro admin.html,
-- 4. umožní zobrazovat a filtrovat hlášení,
-- 5. umožní měnit stav hlášení,
-- 6. umožní deaktivovat a znovu aktivovat otázku.
--
-- Neobsahuje žádné heslo, service_role ani databázový secret.
-- ============================================================

begin;


-- ------------------------------------------------------------
-- 1. SEZNAM POVOLENÝCH ADMINISTRÁTORŮ
-- ------------------------------------------------------------

create table if not exists quiz_private.quiz_admins (
  email_key text primary key,
  display_name text,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,

  constraint quiz_admins_email_key_check
    check (
      email_key = lower(btrim(email_key))
      and char_length(email_key) between 5 and 320
      and position('@' in email_key) > 1
    ),

  constraint quiz_admins_display_name_length_check
    check (
      display_name is null
      or char_length(display_name) between 1 and 100
    )
);

insert into quiz_private.quiz_admins (
  email_key,
  display_name,
  active,
  updated_at
)
values (
  'kafkatomas13@gmail.com',
  'Tomáš',
  true,
  now()
)
on conflict (email_key)
do update
set
  display_name = excluded.display_name,
  active = true,
  updated_at = now();

revoke all privileges
on quiz_private.quiz_admins
from public, anon, authenticated;


-- ------------------------------------------------------------
-- 2. AUDIT ADMINISTRÁTORSKÝCH ZMĚN
-- ------------------------------------------------------------

create table if not exists quiz_private.admin_audit_log (
  id bigint generated always as identity primary key,

  admin_user_id uuid,
  admin_email text not null,

  action text not null,

  report_id uuid
    references quiz_private.question_reports(id)
    on delete set null,

  question_id uuid
    references quiz_private.questions(id)
    on delete set null,

  old_values jsonb,
  new_values jsonb,

  created_at timestamptz not null default now(),

  constraint admin_audit_action_length_check
    check (char_length(action) between 2 and 80),

  constraint admin_audit_email_length_check
    check (char_length(admin_email) between 5 and 320)
);

create index if not exists admin_audit_created_idx
  on quiz_private.admin_audit_log (created_at desc);

create index if not exists admin_audit_question_idx
  on quiz_private.admin_audit_log (
    question_id,
    created_at desc
  );

create index if not exists admin_audit_report_idx
  on quiz_private.admin_audit_log (
    report_id,
    created_at desc
  );

revoke all privileges
on quiz_private.admin_audit_log
from public, anon, authenticated;


-- ------------------------------------------------------------
-- 3. INTERNÍ KONTROLA ADMINISTRÁTORA
-- ------------------------------------------------------------

create or replace function quiz_private.current_admin_email()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select nullif(
    lower(
      btrim(
        coalesce(
          auth.jwt() ->> 'email',
          ''
        )
      )
    ),
    ''
  );
$$;

create or replace function quiz_private.is_quiz_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null
    and coalesce(
      auth.jwt() ->> 'is_anonymous',
      'false'
    ) <> 'true'
    and exists (
      select 1
      from quiz_private.quiz_admins as admin_row
      where
        admin_row.email_key =
          quiz_private.current_admin_email()
        and admin_row.active is true
    );
$$;

revoke all privileges
on function quiz_private.current_admin_email()
from public, anon, authenticated;

revoke all privileges
on function quiz_private.is_quiz_admin()
from public, anon, authenticated;


-- ------------------------------------------------------------
-- 4. OVĚŘENÍ ADMINISTRÁTORSKÉ RELACE
-- ------------------------------------------------------------

create or replace function public.admin_get_session()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_display_name text;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  v_email := quiz_private.current_admin_email();

  select admin_row.display_name
  into v_display_name
  from quiz_private.quiz_admins as admin_row
  where
    admin_row.email_key = v_email
    and admin_row.active is true
  limit 1;

  update quiz_private.quiz_admins as admin_row
  set
    last_login_at = now(),
    updated_at = now()
  where admin_row.email_key = v_email;

  return jsonb_build_object(
    'ok', true,
    'email', v_email,
    'displayName', coalesce(v_display_name, v_email)
  );
end;
$$;


-- ------------------------------------------------------------
-- 5. SOUHRN HLÁŠENÍ PRO DASHBOARD
-- ------------------------------------------------------------

create or replace function public.admin_get_report_summary()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  select jsonb_build_object(
    'totalReports',
      count(*)::integer,

    'reportedQuestions',
      count(distinct report.question_id)::integer,

    'new',
      count(*) filter (
        where report.status = 'new'
      )::integer,

    'reviewing',
      count(*) filter (
        where report.status = 'reviewing'
      )::integer,

    'resolved',
      count(*) filter (
        where report.status = 'resolved'
      )::integer,

    'dismissed',
      count(*) filter (
        where report.status = 'dismissed'
      )::integer,

    'activeReportedQuestions',
      count(
        distinct case
          when question.active is true
            then report.question_id
          else null
        end
      )::integer,

    'disabledReportedQuestions',
      count(
        distinct case
          when question.active is false
            then report.question_id
          else null
        end
      )::integer,

    'latestReportAt',
      max(report.created_at)
  )
  into v_result
  from quiz_private.question_reports as report
  join quiz_private.questions as question
    on question.id = report.question_id;

  return coalesce(
    v_result,
    jsonb_build_object(
      'totalReports', 0,
      'reportedQuestions', 0,
      'new', 0,
      'reviewing', 0,
      'resolved', 0,
      'dismissed', 0,
      'activeReportedQuestions', 0,
      'disabledReportedQuestions', 0,
      'latestReportAt', null
    )
  );
end;
$$;


-- ------------------------------------------------------------
-- 6. SEZNAM NAHLÁŠENÝCH OTÁZEK
--
-- Více hlášení stejné otázky se zobrazí jako jedna položka.
-- ------------------------------------------------------------

create or replace function public.admin_list_question_reports(
  p_status text default null,
  p_reason text default null,
  p_genre text default null,
  p_difficulty integer default null,
  p_search text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  question_id uuid,
  question_external_id text,
  question_active boolean,
  prompt text,
  genre text,
  difficulty smallint,
  difficulty_label text,
  question_type text,
  type_label text,
  movie_title text,
  movie_year smallint,

  report_count bigint,
  new_count bigint,
  reviewing_count bigint,
  resolved_count bigint,
  dismissed_count bigint,

  latest_report_id uuid,
  latest_status text,
  latest_reason text,
  latest_note text,
  latest_report_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict error
declare
  v_limit integer;
  v_offset integer;
  v_status text;
  v_reason text;
  v_genre text;
  v_search text;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  v_limit := least(
    greatest(coalesce(p_limit, 50), 1),
    200
  );

  v_offset := greatest(
    coalesce(p_offset, 0),
    0
  );

  v_status := nullif(
    lower(btrim(coalesce(p_status, ''))),
    ''
  );

  if v_status = 'all' then
    v_status := null;
  end if;

  if v_status is not null
     and v_status not in (
       'new',
       'reviewing',
       'resolved',
       'dismissed'
     ) then
    raise exception 'Unsupported report status';
  end if;

  v_reason := nullif(
    lower(btrim(coalesce(p_reason, ''))),
    ''
  );

  if v_reason = 'all' then
    v_reason := null;
  end if;

  if v_reason is not null
     and v_reason not in (
       'fact_error',
       'multiple_answers',
       'typo',
       'wrong_genre',
       'wrong_difficulty',
       'other'
     ) then
    raise exception 'Unsupported report reason';
  end if;

  v_genre := nullif(
    lower(btrim(coalesce(p_genre, ''))),
    ''
  );

  if v_genre = 'all' then
    v_genre := null;
  end if;

  v_search := nullif(
    lower(btrim(coalesce(p_search, ''))),
    ''
  );

  return query
  with filtered_reports as (
    select
      report.id,
      report.question_id,
      report.status,
      report.reason,
      report.note,
      report.created_at
    from quiz_private.question_reports as report
    join quiz_private.questions as question
      on question.id = report.question_id
    where
      (
        v_status is null
        or report.status = v_status
      )
      and (
        v_reason is null
        or report.reason = v_reason
      )
      and (
        v_genre is null
        or lower(question.genre) = v_genre
      )
      and (
        p_difficulty is null
        or question.difficulty = p_difficulty
      )
      and (
        v_search is null
        or lower(question.prompt) like '%' || v_search || '%'
        or lower(coalesce(question.movie_title, ''))
          like '%' || v_search || '%'
        or lower(question.external_id)
          like '%' || v_search || '%'
        or lower(coalesce(report.note, ''))
          like '%' || v_search || '%'
      )
  ),
  grouped_reports as (
    select
      question.id as question_id,
      question.external_id as question_external_id,
      question.active as question_active,
      question.prompt,
      question.genre,
      question.difficulty,
      case question.difficulty
        when 1 then 'Lehká'
        when 2 then 'Střední'
        when 3 then 'Těžká'
        else 'Neznámá'
      end as difficulty_label,
      question.question_type,
      question.type_label,
      question.movie_title,
      question.movie_year,

      count(*) as report_count,

      count(*) filter (
        where filtered.status = 'new'
      ) as new_count,

      count(*) filter (
        where filtered.status = 'reviewing'
      ) as reviewing_count,

      count(*) filter (
        where filtered.status = 'resolved'
      ) as resolved_count,

      count(*) filter (
        where filtered.status = 'dismissed'
      ) as dismissed_count,

      (
        array_agg(
          filtered.id
          order by filtered.created_at desc
        )
      )[1] as latest_report_id,

      (
        array_agg(
          filtered.status
          order by filtered.created_at desc
        )
      )[1] as latest_status,

      (
        array_agg(
          filtered.reason
          order by filtered.created_at desc
        )
      )[1] as latest_reason,

      (
        array_agg(
          filtered.note
          order by filtered.created_at desc
        )
      )[1] as latest_note,

      max(filtered.created_at) as latest_report_at

    from filtered_reports as filtered
    join quiz_private.questions as question
      on question.id = filtered.question_id
    group by
      question.id,
      question.external_id,
      question.active,
      question.prompt,
      question.genre,
      question.difficulty,
      question.question_type,
      question.type_label,
      question.movie_title,
      question.movie_year
  )
  select
    grouped.question_id,
    grouped.question_external_id,
    grouped.question_active,
    grouped.prompt,
    grouped.genre,
    grouped.difficulty,
    grouped.difficulty_label,
    grouped.question_type,
    grouped.type_label,
    grouped.movie_title,
    grouped.movie_year,

    grouped.report_count,
    grouped.new_count,
    grouped.reviewing_count,
    grouped.resolved_count,
    grouped.dismissed_count,

    grouped.latest_report_id,
    grouped.latest_status,
    grouped.latest_reason,
    grouped.latest_note,
    grouped.latest_report_at
  from grouped_reports as grouped
  order by
    case
      when grouped.new_count > 0 then 0
      when grouped.reviewing_count > 0 then 1
      when grouped.resolved_count > 0 then 2
      else 3
    end,
    grouped.latest_report_at desc
  limit v_limit
  offset v_offset;
end;
$$;


-- ------------------------------------------------------------
-- 7. DETAIL OTÁZKY A VŠECH JEJÍCH HLÁŠENÍ
-- ------------------------------------------------------------

create or replace function public.admin_get_question_report_detail(
  p_question_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  select jsonb_build_object(
    'question',
      jsonb_build_object(
        'id', question.id,
        'externalId', question.external_id,
        'active', question.active,
        'gameMode', question.game_mode,
        'genre', question.genre,
        'difficulty', question.difficulty,
        'questionType', question.question_type,
        'typeLabel', question.type_label,
        'eraLabel', question.era_label,
        'tags', question.tags,
        'prompt', question.prompt,
        'movieTitle', question.movie_title,
        'movieYear', question.movie_year,
        'explanation', question.explanation,
        'reviewStatus', question.review_status,
        'questionBankVersion',
          question.question_bank_version,
        'sourceUrl', question.source_url,
        'secondarySourceUrl',
          question.secondary_source_url,
        'genreSourceUrl',
          question.genre_source_url,
        'createdAt', question.created_at,
        'updatedAt', question.updated_at
      ),

    'options',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', option_row.id,
              'text', option_row.option_text,
              'isCorrect', option_row.is_correct,
              'displayOrder',
                option_row.display_order
            )
            order by option_row.display_order
          )
          from quiz_private.question_options
            as option_row
          where
            option_row.question_id = question.id
        ),
        '[]'::jsonb
      ),

    'reports',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', report.id,
              'status', report.status,
              'reason', report.reason,
              'note', report.note,
              'resolutionNote',
                report.resolution_note,
              'createdAt', report.created_at,
              'reviewedAt', report.reviewed_at,
              'reviewedBy', report.reviewed_by,
              'playerId', report.player_id,
              'playerNickname',
                coalesce(
                  player.nickname,
                  'Neznámý hráč'
                ),
              'sessionId', report.session_id,
              'promptSnapshot',
                report.question_prompt_snapshot,
              'genreSnapshot',
                report.question_genre_snapshot,
              'difficultySnapshot',
                report.question_difficulty_snapshot,
              'bankVersionSnapshot',
                report.question_bank_version_snapshot
            )
            order by report.created_at desc
          )
          from quiz_private.question_reports
            as report
          left join public.players as player
            on player.id = report.player_id
          where
            report.question_id = question.id
        ),
        '[]'::jsonb
      )
  )
  into v_result
  from quiz_private.questions as question
  where question.id = p_question_id
  limit 1;

  if v_result is null then
    raise exception 'Question was not found';
  end if;

  return v_result;
end;
$$;


-- ------------------------------------------------------------
-- 8. ZMĚNA STAVU VŠECH HLÁŠENÍ JEDNÉ OTÁZKY
-- ------------------------------------------------------------

create or replace function public.admin_update_question_reports(
  p_question_id uuid,
  p_status text,
  p_resolution_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_email text;
  v_status text;
  v_resolution_note text;
  v_updated_count integer;
  v_old_values jsonb;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  v_admin_email :=
    quiz_private.current_admin_email();

  v_status :=
    lower(btrim(coalesce(p_status, '')));

  v_resolution_note :=
    nullif(
      btrim(coalesce(p_resolution_note, '')),
      ''
    );

  if v_status not in (
    'new',
    'reviewing',
    'resolved',
    'dismissed'
  ) then
    raise exception 'Unsupported report status';
  end if;

  if v_resolution_note is not null
     and char_length(v_resolution_note) > 2000 then
    raise exception 'Resolution note is too long';
  end if;

  if not exists (
    select 1
    from quiz_private.questions as question
    where question.id = p_question_id
  ) then
    raise exception 'Question was not found';
  end if;

  select jsonb_build_object(
    'reportCount', count(*)::integer,
    'statuses',
      coalesce(
        jsonb_object_agg(
          status_rows.status,
          status_rows.status_count
        ),
        '{}'::jsonb
      )
  )
  into v_old_values
  from (
    select
      report.status,
      count(*)::integer as status_count
    from quiz_private.question_reports as report
    where report.question_id = p_question_id
    group by report.status
  ) as status_rows;

  update quiz_private.question_reports as report
  set
    status = v_status,
    resolution_note = v_resolution_note,
    reviewed_at =
      case
        when v_status = 'new' then null
        else now()
      end,
    reviewed_by =
      case
        when v_status = 'new' then null
        else auth.uid()
      end
  where report.question_id = p_question_id;

  get diagnostics v_updated_count = row_count;

  if v_updated_count = 0 then
    raise exception 'No reports were found for this question';
  end if;

  insert into quiz_private.admin_audit_log (
    admin_user_id,
    admin_email,
    action,
    question_id,
    old_values,
    new_values
  )
  values (
    auth.uid(),
    v_admin_email,
    'update_question_reports',
    p_question_id,
    v_old_values,
    jsonb_build_object(
      'status', v_status,
      'resolutionNote', v_resolution_note,
      'updatedCount', v_updated_count
    )
  );

  return jsonb_build_object(
    'ok', true,
    'questionId', p_question_id,
    'status', v_status,
    'updatedCount', v_updated_count
  );
end;
$$;


-- ------------------------------------------------------------
-- 9. DEAKTIVACE NEBO OPĚTOVNÁ AKTIVACE OTÁZKY
-- ------------------------------------------------------------

create or replace function public.admin_set_question_active(
  p_question_id uuid,
  p_active boolean,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_email text;
  v_reason text;
  v_old_active boolean;
  v_external_id text;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  if p_active is null then
    raise exception 'Active state is required';
  end if;

  v_admin_email :=
    quiz_private.current_admin_email();

  v_reason :=
    nullif(
      btrim(coalesce(p_reason, '')),
      ''
    );

  if v_reason is not null
     and char_length(v_reason) > 1000 then
    raise exception 'Reason is too long';
  end if;

  select
    question.active,
    question.external_id
  into
    v_old_active,
    v_external_id
  from quiz_private.questions as question
  where question.id = p_question_id
  limit 1
  for update;

  if not found then
    raise exception 'Question was not found';
  end if;

  update quiz_private.questions as question
  set
    active = p_active,
    updated_at = now()
  where question.id = p_question_id;

  insert into quiz_private.admin_audit_log (
    admin_user_id,
    admin_email,
    action,
    question_id,
    old_values,
    new_values
  )
  values (
    auth.uid(),
    v_admin_email,
    case
      when p_active is true
        then 'activate_question'
      else 'deactivate_question'
    end,
    p_question_id,
    jsonb_build_object(
      'active', v_old_active,
      'externalId', v_external_id
    ),
    jsonb_build_object(
      'active', p_active,
      'externalId', v_external_id,
      'reason', v_reason
    )
  );

  return jsonb_build_object(
    'ok', true,
    'questionId', p_question_id,
    'externalId', v_external_id,
    'active', p_active
  );
end;
$$;


-- ------------------------------------------------------------
-- 10. POSLEDNÍ AUDITNÍ ZÁZNAMY
-- ------------------------------------------------------------

create or replace function public.admin_get_recent_audit(
  p_limit integer default 50
)
returns table (
  audit_id bigint,
  admin_email text,
  action text,
  report_id uuid,
  question_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict error
declare
  v_limit integer;
begin
  if not quiz_private.is_quiz_admin() then
    raise exception using
      errcode = '42501',
      message = 'Administrator access is required';
  end if;

  v_limit := least(
    greatest(coalesce(p_limit, 50), 1),
    200
  );

  return query
  select
    audit_row.id,
    audit_row.admin_email,
    audit_row.action,
    audit_row.report_id,
    audit_row.question_id,
    audit_row.old_values,
    audit_row.new_values,
    audit_row.created_at
  from quiz_private.admin_audit_log as audit_row
  order by audit_row.created_at desc
  limit v_limit;
end;
$$;


-- ------------------------------------------------------------
-- 11. OPRÁVNĚNÍ RPC
-- ------------------------------------------------------------

revoke all privileges
on function public.admin_get_session()
from public, anon, authenticated;

grant execute
on function public.admin_get_session()
to authenticated;


revoke all privileges
on function public.admin_get_report_summary()
from public, anon, authenticated;

grant execute
on function public.admin_get_report_summary()
to authenticated;


revoke all privileges
on function public.admin_list_question_reports(
  text,
  text,
  text,
  integer,
  text,
  integer,
  integer
)
from public, anon, authenticated;

grant execute
on function public.admin_list_question_reports(
  text,
  text,
  text,
  integer,
  text,
  integer,
  integer
)
to authenticated;


revoke all privileges
on function public.admin_get_question_report_detail(uuid)
from public, anon, authenticated;

grant execute
on function public.admin_get_question_report_detail(uuid)
to authenticated;


revoke all privileges
on function public.admin_update_question_reports(
  uuid,
  text,
  text
)
from public, anon, authenticated;

grant execute
on function public.admin_update_question_reports(
  uuid,
  text,
  text
)
to authenticated;


revoke all privileges
on function public.admin_set_question_active(
  uuid,
  boolean,
  text
)
from public, anon, authenticated;

grant execute
on function public.admin_set_question_active(
  uuid,
  boolean,
  text
)
to authenticated;


revoke all privileges
on function public.admin_get_recent_audit(integer)
from public, anon, authenticated;

grant execute
on function public.admin_get_recent_audit(integer)
to authenticated;


-- ------------------------------------------------------------
-- 12. KONTROLA INSTALACE
-- ------------------------------------------------------------

do $$
begin
  if to_regclass(
    'quiz_private.quiz_admins'
  ) is null then
    raise exception 'quiz_admins table was not created';
  end if;

  if to_regclass(
    'quiz_private.admin_audit_log'
  ) is null then
    raise exception 'admin_audit_log table was not created';
  end if;

  if not exists (
    select 1
    from quiz_private.quiz_admins as admin_row
    where
      admin_row.email_key =
        'kafkatomas13@gmail.com'
      and admin_row.active is true
  ) then
    raise exception 'The requested administrator was not added';
  end if;

  if to_regprocedure(
    'public.admin_get_session()'
  ) is null then
    raise exception 'admin_get_session RPC was not created';
  end if;

  if to_regprocedure(
    'public.admin_get_report_summary()'
  ) is null then
    raise exception 'admin_get_report_summary RPC was not created';
  end if;

  if to_regprocedure(
    'public.admin_list_question_reports(text,text,text,integer,text,integer,integer)'
  ) is null then
    raise exception 'admin_list_question_reports RPC was not created';
  end if;

  if to_regprocedure(
    'public.admin_get_question_report_detail(uuid)'
  ) is null then
    raise exception 'admin_get_question_report_detail RPC was not created';
  end if;

  if to_regprocedure(
    'public.admin_update_question_reports(uuid,text,text)'
  ) is null then
    raise exception 'admin_update_question_reports RPC was not created';
  end if;

  if to_regprocedure(
    'public.admin_set_question_active(uuid,boolean,text)'
  ) is null then
    raise exception 'admin_set_question_active RPC was not created';
  end if;

  if to_regprocedure(
    'public.admin_get_recent_audit(integer)'
  ) is null then
    raise exception 'admin_get_recent_audit RPC was not created';
  end if;
end;
$$;

notify pgrst, 'reload schema';

commit;

select
  'Movie Quiz question reports administration database v1 installed successfully'
  as status;
