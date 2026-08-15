# K-edu Supabase SQL 매니페스트

> 이 폴더의 SQL은 모두 Supabase SQL Editor에서 **수동 실행**하는 마이그레이션/설정 스크립트다.
> 코드에서 참조하지 않으므로 배포와 무관하며, 실행 이력의 기록용으로 보존한다.
> 적용일은 git 커밋일 기준 추정 — 실제 실행일과 다를 수 있음.

## 적용 순서 (커밋일 기준 시간순)

| # | 파일 | 커밋일 | 용도 |
|---|------|--------|------|
| 1 | setup_tables.sql | 2026-04-13 (~04-30 수정) | 기초 테이블 설정 |
| 2 | setup_student_profiles.sql | 2026-04-13 | student_profiles 테이블 + RLS |
| 3 | setup_contents_data.sql | 2026-04-13 | teachers RLS 재설정 + contents 데이터 등록 |
| 4 | setup_analytics_upgrade.sql | 2026-04-15 | 방문 분석 업그레이드 |
| 5 | setup_consent_confirmed.sql | 2026-04-28 | 적합성 갭 #1 — consent_confirmed 강제 |
| 6 | setup_data_requests.sql | 2026-04-28 | 적법성 갭 #2 — 권리 행사 채널 |
| 7 | setup_diagnosis_v2.sql | 2026-04-28 | 진단 시스템 인프라 (스키마 v2) |
| 8 | setup_student_entry.sql | 2026-04-29 | 학생 진입 흐름 — student_seats RPC 2종 |
| 9 | setup_parent_link_actions.sql | 2026-04-29 | 학부모 매핑 검증 (사이클 ㊷, 적합성 #13) |
| 10 | setup_yearly_wipe.sql | 2026-04-29 | 적법성 갭 #3 — 학년 와이프 자동화 |
| 11 | setup_parent_dashboard.sql | 2026-04-29 | 학부모 대시보드 (사이클 ㊵, 적합성 #11) |
| 12 | setup_parent_data_view.sql | 2026-04-30 | 학부모 데이터 열람 뷰 |
| 13 | setup_rls_audit_fix.sql | 2026-04-30 | RLS audit fix — UPDATE WITH CHECK 보강 |
| 14 | setup_classwork.sql | 2026-06-16 | 케이박스(classwork) 본체 |
| 15 | setup_classwork3.sql | 2026-07-09 | 케이박스 증분 3 — 케이퀴즈 편입 |
| 16 | setup_seats_select_lockdown.sql | 2026-07-11 | student_seats 공개 SELECT 잠금 (대점검 3차) |
| 17 | setup_classwork4.sql | 2026-07-13 | 케이박스 증분 4 — 활동 시스템 편입 (cw_items.kind에 'activity') |
| 18 | setup_kbattle.sql | 2026-07-13 | 케이배틀 — kb_profiles(+xp 강등방지 트리거·link_code) · kb_answers · RLS 8종 |
| 19 | setup_morning.sql | 2026-08-14 최초 · **2026-08-15 재실행 확인** | 아침활동(케이모닝) — ma_routines·ma_progress·ma_sessions·ma_submissions + RPC 8종(ma_max_step 포함) · RLS 6종. 재실행 안전(테이블 IF NOT EXISTS · 함수 OR REPLACE · 정책 DROP IF EXISTS 선행). **한자 회차 확장 시 ma_max_step 도 함께 고쳐야 함** — 어긋나면 kedu/quiz/test_hanja_morning.js 가 잡는다. **2026-08-15 재실행분** = 진도 단위 회차→글자 전환(ma_max_step 5/5/5/8/8/10 → 50/50/50/75/75/100) + ma_today 의 lesson_key c형식(g4_hanja_c015). 검산 `SELECT ma_max_step('hanja',1),('hanja',4),('hanja',6)` → 50/75/100 확인함. 함께 돌린 마이그레이션: `UPDATE ma_progress SET next_step=1, cycle=1 WHERE subject='hanja';` + 당일 hanja 세션 DELETE(진도 의미가 바뀌어 리셋 필수였음). 달러 인용을 $$ → $fn$/$do$ 로 교체 — SQL Editor 붙여넣기가 중간에 잘렸을 때 미종료 지점이 드러나게 하려는 것 |

| 20 | setup_morning.sql | **2026-08-15 3차 재실행(수학 편입)** | 아침활동 수학(하루 1차시) 라이브 준비 — ma_max_step 에 math 6행 추가(g1:33·g2:34·g3:38·g4:26·g5:31·g6:22, 1학기분·소진 후 복습 순환). 그 외 함수·테이블 변경 없음(전문 재실행이지만 실질 diff 는 이 6행). 6차 절단 사고 예방으로 4토막 분할본으로 실행(합본=원본 diff 0 검산). 진도 리셋 불필요(hanja 무변경·math 신규). 검산 `SELECT ma_max_step('math',1), ma_max_step('math',6), ma_max_step('hanja',6);` → 기대값 **33 / 22 / 100** → **2026-08-15 확인함**(열 이름 중복으로 1차 검산이 마지막 열만 보였던 함정 있음 — 검산 SELECT 엔 AS 별칭 필수) |

## 새 SQL 추가 룰

1. 파일은 이 폴더(`sql/`)에 `setup_이름.sql`로 추가
2. Supabase에서 실행 후 이 표에 한 줄 추가 (커밋일·용도)
3. 코드 주석에서 SQL을 언급할 때는 `sql/파일명` 경로로 표기
