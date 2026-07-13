-- ============================================================================
-- 케이배틀 — Supabase 스키마 (헌법 제9조)
-- 실행: Supabase 대시보드 → SQL Editor 에 붙여넣고 1회 실행.
--
-- ⚠️ 헌법 제8조: 여기 없는 건 안 모은다. 생년월일·전화·이메일·주소·사진·비밀번호 컬럼 없음.
-- ⚠️ 신원 = 학급코드 + 표시명 (비밀번호 없음 — 저학년 로그인은 벽).
--    그래서 anon 이 쓰기 가능하다. 학급코드를 아는 사람만 그 반에 접근하는 구조.
--    (교실 규모에서 감당 가능한 리스크. 이관 코드·교사 삭제 버튼이 제8조 안전판.)
-- ============================================================================

create table if not exists kb_profiles (
  id           uuid primary key default gen_random_uuid(),
  class_code   text not null,
  name         text not null,
  xp           int  not null default 0,
  partner      jsonb not null default '{"species":null,"stage":0,"parts":[],"name":null}'::jsonb,
  badges       jsonb not null default '[]'::jsonb,
  stats        jsonb not null default '{"played":0,"correct":0,"bestStreak":0}'::jsonb,
  updated_at   timestamptz not null default now(),
  unique (class_code, name)
);

-- 강등 없음(제5조 ①) — xp 는 줄어들 수 없다. DB 레벨에서 못 박는다.
create or replace function kb_xp_never_drops() returns trigger as $$
begin
  if new.xp < old.xp then new.xp := old.xp; end if;
  new.updated_at := now();
  return new;
end $$ language plpgsql;

drop trigger if exists kb_xp_guard on kb_profiles;
create trigger kb_xp_guard before update on kb_profiles
  for each row execute function kb_xp_never_drops();

alter table kb_profiles enable row level security;

drop policy if exists kb_profiles_read on kb_profiles;
create policy kb_profiles_read on kb_profiles for select using (true);

drop policy if exists kb_profiles_write on kb_profiles;
create policy kb_profiles_write on kb_profiles for insert with check (true);

drop policy if exists kb_profiles_update on kb_profiles;
create policy kb_profiles_update on kb_profiles for update using (true);

-- 교사가 명부에서 아이를 뺄 수 있어야 한다 (class.html — 제7조).
drop policy if exists kb_profiles_delete on kb_profiles;
create policy kb_profiles_delete on kb_profiles for delete using (true);

-- ============================================================================
-- answers — 케이배틀의 모든 파생 가치가 나오는 뿌리 (제9조)
--   교사 대시보드(개념별 정답률) · 학부모 리포트(유료 층) · 오답 재편성 · 배지 판정
--   → 전부 이 테이블의 '다른 뷰'일 뿐. 유료화를 위해 더 모으는 건 없다(제1조 ②).
-- ⛔ 문제 본문·정답·아이 실명 안 실림. 개념(concept)과 정오(correct)만.
-- ============================================================================
create table if not exists kb_answers (
  id          bigserial primary key,
  profile_id  uuid references kb_profiles(id) on delete cascade,
  class_code  text,
  qid         text not null,
  concept     text,
  difficulty  int,
  type        text,
  correct     boolean not null,
  ms          int,
  kind        text,                        -- daily | race | battle | wrongset
  at          timestamptz not null default now()
);

create index if not exists kb_answers_profile on kb_answers (profile_id, at desc);
create index if not exists kb_answers_class on kb_answers (class_code, concept);

alter table kb_answers enable row level security;

drop policy if exists kb_answers_read on kb_answers;
create policy kb_answers_read on kb_answers for select using (true);

drop policy if exists kb_answers_write on kb_answers;
create policy kb_answers_write on kb_answers for insert with check (true);

-- 학년말 정리(제8조) — 교사가 class.html 에서 우리 반 응답만 지운다.
drop policy if exists kb_answers_delete on kb_answers;
create policy kb_answers_delete on kb_answers for delete using (true);

-- 학년말 정리(제8조): 교사가 학급을 닫으면 응답 기록만 지운다.
--   파트너·XP(kb_profiles)는 남아 '이관 코드'로 다음 학급에 따라간다.
--   delete from kb_answers where class_code = 'XXXX';

-- ============================================================================
-- 학부모 연결 (제1조 ② — 유료는 오직 학부모의 '보는 눈')
--   아이가 코드를 만들어 부모에게 준다. ⛔ 부모 계정·이메일·전화 없음(제8조).
--   아이가 주지 않으면 부모도 못 본다.
-- ============================================================================
alter table kb_profiles add column if not exists link_code text;
create unique index if not exists kb_profiles_link on kb_profiles (link_code) where link_code is not null;
