-- 케이히스토리 저장 — 학생×시대 진행(깃발·주머니·확인 결과). 구조 설계 v1 §9. 재실행 안전.
-- 미적용이면 케이월드는 조용히 이 브라우저에만 저장한다(오류 없음).
create table if not exists kworld_progress (
  student_id uuid not null references student_profiles(id) on delete cascade,
  era        text not null,
  flags      jsonb not null default '[]',
  inventory  jsonb not null default '[]',
  results    jsonb not null default '[]',
  hunger     real,
  pos        jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, era)
);
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
-- 리포트: 학생×시대 진행률(깃발 수·발견 수·확인 결과 수)
drop view if exists report_kworld;
create view report_kworld as
  select p.student_id, p.era,
         jsonb_array_length(p.flags) as flag_n,
         (select count(*) from jsonb_array_elements_text(p.flags) f where f like 'journal:%') as discovery_n,
         jsonb_array_length(p.results) as check_n,
         (select count(*) from jsonb_array_elements(p.results) r where (r->>'ok')::boolean) as check_ok_n,
         p.updated_at
  from kworld_progress p;
grant select on report_kworld to authenticated;
-- 검산: select count(*) from kworld_progress;  → 0 · select * from report_kworld limit 1;
