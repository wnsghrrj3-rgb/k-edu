-- #38 케이히스토리 저장 v2 (2026-10-12) — 학생×시대 진행 + 인생 층 + 족보. 구조 설계 v1 §9. 재실행 안전.
-- 미적용이면 케이월드는 조용히 이 기기(localStorage)에만 저장한다(오류 없음). 저장은 정식 좌석(동의)만 — KeduTier.canSave.
-- v2: life·chr·sex·mi 열(인생 층 스냅샷 — 다른 기기에서 이어서) · kworld_jokbo(끝 갈림 한 줄씩, 족보·넘겨받기가 기기를 안 가림)
--     · 뷰 report_kworld(시대별 지금 상태) · report_kworld_jokbo(학생별 n대·끝 갈림) — 케이학습리포트 「케이히스토리」 칸
create table if not exists kworld_progress (
  student_id uuid not null references student_profiles(id) on delete cascade,
  era        text not null,
  flags      jsonb not null default '[]',
  inventory  jsonb not null default '[]',
  results    jsonb not null default '[]',
  telemetry  jsonb,
  hunger     real,
  pos        jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, era)
);
alter table kworld_progress add column if not exists telemetry jsonb;
alter table kworld_progress add column if not exists life jsonb;      -- 인생 층 스냅샷(값·능력·흔적·열린/끝난 상황·씨앗·신분·나라)
alter table kworld_progress add column if not exists chr  text;       -- 태어난 사람(능력 넷 중)
alter table kworld_progress add column if not exists sex  text;       -- 성별 f|m
alter table kworld_progress add column if not exists mi   int;        -- 미션 번호
alter table kworld_progress enable row level security;
drop policy if exists p_kworld_progress_student on kworld_progress;
create policy p_kworld_progress_student on kworld_progress
  for all to authenticated
  using (student_id in (select id from student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from student_profiles where user_id = auth.uid()));
drop policy if exists p_kworld_progress_teacher_read on kworld_progress;
create policy p_kworld_progress_teacher_read on kworld_progress
  for select to authenticated
  using (student_id in (select id from student_profiles where class_code_id in (select id from class_codes where teacher_id = auth.uid())));

-- 족보 — 시대를 끝낼 때마다 한 줄(끝 갈림·신분·나라·값). 지우지 않는다(지난 집도 족보의 일부).
create table if not exists kworld_jokbo (
  id          bigserial primary key,
  student_id  uuid not null references student_profiles(id) on delete cascade,
  era         text not null,
  branch      text,
  title       text,          -- 끝 갈림 제목 「곳간이 찬 집」
  status      text,          -- 신분 id
  status_name text,
  nation      text,
  nation_name text,
  record      jsonb not null default '{}',   -- carryRecord 그대로(craft·heart·grain·rank·cap·hurt·marks·sits·t)
  ended_at    timestamptz not null default now()
);
create index if not exists kworld_jokbo_student_idx on kworld_jokbo(student_id, ended_at);
alter table kworld_jokbo enable row level security;
drop policy if exists p_kworld_jokbo_student on kworld_jokbo;
create policy p_kworld_jokbo_student on kworld_jokbo
  for all to authenticated
  using (student_id in (select id from student_profiles where user_id = auth.uid()))
  with check (student_id in (select id from student_profiles where user_id = auth.uid()));
drop policy if exists p_kworld_jokbo_teacher_read on kworld_jokbo;
create policy p_kworld_jokbo_teacher_read on kworld_jokbo
  for select to authenticated
  using (student_id in (select id from student_profiles where class_code_id in (select id from class_codes where teacher_id = auth.uid())));

-- 리포트 ① 학생×시대 지금 상태 — 값(솜씨·인심·곡식·벼슬)·신분·나라·겪은 상황 수·끝났나
drop view if exists report_kworld;
create view report_kworld with (security_invoker = true) as
  select p.student_id, p.era,
         jsonb_array_length(p.flags) as flag_n,
         (select count(*) from jsonb_array_elements_text(p.flags) f where f like 'journal:%') as discovery_n,
         jsonb_array_length(p.results) as check_n,
         (select count(*) from jsonb_array_elements(p.results) r where (r->>'ok')::boolean) as check_ok_n,
         (p.telemetry->>'hints')::int as hint_n, (p.telemetry->>'starved')::int as starved_n,
         (select coalesce(sum((m->>'sec')::int),0) from jsonb_array_elements(coalesce(p.telemetry->'missions','[]')) m) as play_sec,
         p.chr, p.sex,
         p.life->>'statusName' as status_name, p.life->>'nationName' as nation_name,
         (p.life->'values'->>'craft')::int as craft, (p.life->'values'->>'heart')::int as heart,
         (p.life->'values'->>'grain')::int as grain, (p.life->'values'->>'rank')::int as rank,
         coalesce(jsonb_array_length(p.life->'log'),0) as sit_n,
         coalesce(jsonb_array_length(p.life->'hurt'),0) as hurt_n,
         (select count(*) from jsonb_array_elements_text(p.flags) f where f = 'life:end') > 0 as ended,
         p.updated_at
  from kworld_progress p;
grant select on report_kworld to authenticated;

-- 리포트 ② 학생별 족보 요약 — 몇 대까지 살았나(끝낸 시대 수), 마지막 끝 갈림, 시대별 가장 최근 끝 한 줄
drop view if exists report_kworld_jokbo;
create view report_kworld_jokbo with (security_invoker = true) as
  with last_per_era as (
    select distinct on (student_id, era) student_id, era, title, status_name, nation_name, record, ended_at
    from kworld_jokbo order by student_id, era, ended_at desc
  )
  select j.student_id,
         count(distinct j.era) as era_n,                       -- n대
         count(*) as run_n,                                    -- 끝낸 판 수(지난 집 포함)
         (array_agg(j.era order by j.ended_at desc))[1] as last_era,
         (array_agg(j.title order by j.ended_at desc))[1] as last_title,
         (array_agg(j.status_name order by j.ended_at desc))[1] as last_status_name,
         max(j.ended_at) as last_ended_at,
         (select jsonb_agg(jsonb_build_object('era', l.era, 'title', l.title, 'status_name', l.status_name, 'nation_name', l.nation_name,
                 'craft', l.record->'craft', 'heart', l.record->'heart', 'grain', l.record->'grain', 'rank', l.record->'rank', 'marks', l.record->'marks', 'ended_at', l.ended_at) order by l.ended_at)
            from last_per_era l where l.student_id = j.student_id) as eras
  from kworld_jokbo j group by j.student_id;
grant select on report_kworld_jokbo to authenticated;
-- 검산: select count(*) from kworld_progress; → 0 · select count(*) from kworld_jokbo; → 0 · select * from report_kworld_jokbo limit 1;
