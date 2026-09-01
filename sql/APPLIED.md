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

| 21 | setup_morning.sql | **2026-08-15 4차 재실행(수학 일수 정본화)** | 사다리 기준이 자기주도 본차시로 전환(9.7차)되어 ma_max_step math 일수 33/34/38/26/31/22 → **44/52/55/54/53/51**. 2of4 토막(시간표·진도상한)만 재실행. 검산 `ma_max_step('math',1), ('math',4), ('hanja',6)` → **44/54/100 확인함**. 진도 리셋 불필요(수학 세션 0) |

| 22 | setup_morning.sql | **2026-08-16 5차 재실행(영어 편입)** | 아침영어(하루 1문장) 라이브 준비 — `ma_max_step` 에 english 행 추가(`english IN (3,4,5,6) THEN 40`). **1·2학년 행은 일부러 만들지 않음** — 영어 원장이 3~6학년만 있어, 행만 있고 세트가 없으면 그 학년은 매일 '준비 중' 화면을 만난다. `kedu/quiz/test_english_morning.js` 가 이 *없음*까지 강제한다. 실행 범위는 **ma_max_step 함수 블록 + GRANT 한 조각만**(전문 재실행 아님 — 실질 diff 가 이 1행뿐이라 절단 위험을 없앴다). 진도 리셋 불필요(english 신규·hanja/math 무변경). 검산 `SELECT ma_max_step('english',3) AS e3, ma_max_step('english',6) AS e6, ma_max_step('english',1) AS e1, ma_max_step('hanja',6) AS h6, ma_max_step('math',1) AS m1;` → 기대 **40/40/50/100/44** → **2026-08-16 확인함**. ※1차 검산에서 e3·e6 가 50 으로 나왔는데 이는 함수가 옛 버전이라 `ELSE 50` 으로 떨어진 것 — english 행이 없을 때의 정상 동작이며, e1=50 을 검산에 함께 넣어 '행 없음'과 '실행 안 됨'을 구분할 수 있게 했다 |

| 23 | setup_teacher_approval.sql | 2026-08-26 작성 · **2026-08-26 실행 확인함**(검산 `count(*) FROM edu_domains` → 17) | 교사 승인(교사 증명) — 생태계설계_v2_공개준비 §D·§J-1. `kedu_policy`(정책 스위치 `auto_approve_edu_domains`=false) · `edu_domains`(17개 시도 초안, verified=false) · `teachers.approval/approved_at/approved_by/approval_note/approval_requested_at` · 헬퍼 `kedu_is_admin()`·`kedu_teacher_approved()`·`kedu_email_is_edu()` · 트리거 2(가입 시 승인 결정 — 클라이언트 approval·is_admin 무시 / 비관리자의 approval·is_admin·user_id 변경 되돌림) · RLS 잠금 5(`teachers_insert_codes`·`cw_bundles/items/sends_teacher`·`p_ma_routines_teacher` WITH CHECK 에 승인 조건) · 관리자 RPC 3(`admin_teacher_list`·`admin_set_teacher_approval`·`admin_set_policy`) · 교사 RPC `request_teacher_approval`. **게이트 이전 가입 행(created_at < 2026-08-27)은 일괄 approved** — 원치 않는 계정은 /admin 에서 반려. 재실행 안전. 검산 `SELECT approval, count(*) FROM teachers GROUP BY 1;` → 전부 approved · `SELECT kedu_email_is_edu('a@sen.go.kr') AS s, kedu_email_is_edu('a@gmail.com') AS g;` → true/false · `SELECT count(*) FROM edu_domains;` → 17. 화면 배선: `teacher/index.html`(배너·신청) · `admin/index.html`(대기 표·승인/반려·정책 스위치) — SQL 미적용 상태에선 둘 다 폴백으로 종전처럼 동작 |

| 24 | setup_contents_tier.sql | 2026-08-26 작성 · **⏳ 미실행** | 콘텐츠 원장 등급 `contents.tier`(open/class/class_rec/home, 기본 open) — 생태계설계_v2 §B·§J-4. `/kedu_tier.js CONTENT_TIERS` 경로 표의 DB 거울(같은 접두·같은 순서, `tests/test_kedu_gate.js` 가 둘을 대조). 백필은 file_path 접두로 — 현재 원장이 /grade1·/english 뿐이라 결과는 전부 open. 판정은 1단계엔 브라우저가 하므로 실행을 서두를 이유는 없고, 서버 강제(2단계) 전까지만 들어가 있으면 된다. 검산 `SELECT tier, count(*) FROM contents GROUP BY 1;` → open 400 |

| 25 | setup_class_openings.sql | 2026-08-26 작성 · **2026-08-26 실행 확인함**(검산 pg_policies → p_class_openings_teacher) | 「우리 반에 열기」 원장 — 생태계설계_v2 §F·§J-3. `class_openings(class_code_id, content_key, title, kind, url, bundle_id, opened_by, opened_at)` UNIQUE(반, 키) · RLS 교사 자기 학급(쓰기는 승인 교사) · RPC 셋: `list_class_openings(코드)`(anon, 활성 학급의 키 목록만) · `open_for_class(...)`(멱등 upsert, bundle_id 는 첫 열기만) · `close_for_class(반, 키)`. 의존 #14 classwork(cw_my_teacher_id, cw_bundles) · #23 교사 승인(kedu_teacher_approved). 검산 `SELECT count(*) FROM class_openings;` → 0 · `SELECT * FROM list_class_openings('ABCDEF');` → 0 rows · `SELECT policyname FROM pg_policies WHERE tablename='class_openings';` → p_class_openings_teacher. **실행 후** 준호가 케이파크에서 📦 → 반 → 「우리 반에 열기」 한 번 → 학급코드로 케이파크 열림 확인 → 그 다음 `kedu_tier.js` `OPENING_LOCK=true` |
| 27 | setup_teacher_approval2.sql | 2026-08-27 작성 · **2026-08-27 실행 확인함**(검산 rpc 1 · trg 2 · kr 1 — 4조각 분할 실행) | 교사 승인 2차 경화 — §D 후속. ① `claim_edu_auto_approval()`(pending + 스위치 ON + 교육청 메일 → 본인 자동승인; 반려는 불가) + 트리거② 교체(트랜잭션 로컬 플래그 통로) — 스위치를 나중에 켜도 기존 pending 교육청메일 교사가 화면 접속만으로 승인됨(teacher/index.html 조용한 시도 배선). ② class_codes UPDATE 정책에 승인 조건(미승인=끄기만) + 동의 다운그레이드 금지를 트리거로 이전 — #5 WITH CHECK 가 활성 게스트 학급의 모든 UPDATE(학년 변경·재발급)를 막던 잠복 결함 교정. ③ student_seats INSERT 트리거 — 반려 교사는 DEFINER RPC(bulk_create_seats)로도 슬롯 등록 불가. 부록: korea.kr 을 active=false 로 등록(결정 대기). **로컬 PG16 + Supabase 셈으로 시나리오 16종 전수 통과**(가입 즉시 pending·대기 생성 차단·게스트 학년 변경·다운그레이드 차단·반려 슬롯 차단·반려 끄기만·셀프 승격 되돌림·claim 4상태·스위치 ON 가입 즉시 auto). 재실행 안전. 검산 쿼리는 파일 하단 |
| 28 | setup_kmovie_projects.sql | 2026-08-31 작성 · **2026-08-31 실행 확인함**(검산 pg_policies → p_kmovie_projects_owner) | 케이무비 「내 작업」 — 편집 상태 JSON 을 교사 계정에 저장해 어느 기기에서든 목록에서 연다. `kmovie_projects(id uuid=클라이언트 생성, user_id, name, doc jsonb, dur_sec, clips, updated_at)` · RLS 본인 행만(authenticated) · doc 4MB 가드(원본 바이트 유입 방지). 원본 영상은 올리지 않는다(기기에 남음). 검산 `SELECT policyname FROM pg_policies WHERE tablename='kmovie_projects';` → p_kmovie_projects_owner. 미적용 상태에선 케이무비가 조용히 이 브라우저에만 저장(오류 없음) |

| 28 | setup_report_v1.sql | 2026-08-31 작성(v1.1) · **2026-08-31 실행 확인함**(전문 180줄 한 번에 Success) | 케이학습리포트 R0 집계층 — `report_lesson_mastery`(판정 = 문항별 마지막 답 q_n·q_latest_ok, 문항<3 watching, runs·last_run_*) · `report_morning_daily` · `report_teacher_comments`(+rtc_teacher_manage·rtc_parent_read) · 학부모 아침활동 RLS(ma_subs_parent_read·ma_sess_parent_read) · `report_parent_views`(학부모 열람 로그, rpv_parent_insert·rpv_admin_read). DROP VIEW 후 재생성이라 재실행 안전. 검산: `SELECT column_name FROM information_schema.columns WHERE table_name='report_lesson_mastery'` 에 q_n·runs 있으면 v1.1 |

| 29 | setup_worksheet_bank.sql | 2026-08-31 작성 · **2026-08-31 실행 확인함**(검산 to_regclass → concepts·misconceptions·question_bank·quiz_sets 넷 다) | 케이학습지 E1 문항 원장 — `concepts`(개념 트리) · `misconceptions`(오개념 사전) · `question_bank`(문항, payload jsonb 가 학습지 JSON 무손실 사본) · `quiz_sets`/`quiz_set_items`(교사가 조립한 쪽지) · `scores` 열 4개 추가(quiz_set_id·question_bank_id·concept_code·misconception_code) · `get_quiz_set()` RPC(학생은 우리 반에 열린 쪽지만 받는다) · 뷰 `quiz_misconception_dist`(오개념 분포) · `quiz_item_stats`(문항 정답률). 배포는 새 표 없이 기존 `class_openings` 에 `content_key='quiz:<set_id>'` 한 줄로 나간다. 검산 `SELECT count(*) FROM question_bank;` |
| 30 | seed_worksheet_g1_math_u1.sql (+ _part2) | 2026-08-31 작성 · **2026-08-31 실행 확인함**(검산 개념 7 · 오개념 11 · 문항 240) | 1학년 수학 1단원 적재 — 개념 7 · 오개념 11 · 문항 240(part1 차시 140, part2 단원 종합 100). qcode UNIQUE UPSERT 라 재실행 안전. 29번 먼저 실행. 검산 `SELECT count(*) FROM question_bank;` → 240 |
| 31 | setup_report_v1.sql **v1.2** | 2026-08-31 작성 · **2026-08-31 실행 확인함**(검산 information_schema.views `report_%` → 5줄) | 케이학습리포트 R4 개념 합류 — `report_concept_mastery`(학생×개념, 차시와 같은 규칙: 문항별 마지막 답·표본 3 미만 watching·80/60) · `report_worksheet_runs`(학생×세트, `ws:` 파일 학습지 + `quiz:` 쪽지, source 열) · `report_misconception`(학생×오개념, n·still_open — 화면은 2회 이상만 반복으로 읽음). `report_lesson_mastery` 재생성 = 차시 도달 지도에서 `ws:%`·`quiz:%` 제외(학습지는 차시가 아니다). 열은 29번과 같은 `concept_code`·`misconception_code`(멱등 보장용으로 한 번 더 ADD COLUMN IF NOT EXISTS). DROP VIEW 후 재생성이라 재실행 안전. 검산 `SELECT concept_code, status, q_n, q_latest_ok FROM report_concept_mastery;` |
| 32 | setup_edu_domains_fix.sql | 2026-09-02 작성 · **2026-09-02 실행 확인함**(검산 gbe.kr/true/true/false) | 경북교육청 도메인 오기 교정 gbe.go.kr → gbe.kr(재실행 안전). 검산 `SELECT domain FROM edu_domains WHERE region='경북';` → gbe.kr. 같은 자리에서 `SELECT value FROM kedu_policy WHERE key='auto_approve_edu_domains';` — **2026-09-02 준호 결정: 당분간 수동 승인** → 스위치는 false 유지, 화면 문구도 수동 승인 기준으로 교정(k-edu). 켜는 건 SMTP 연결 뒤 |
| 33 | setup_admin_overview.sql | 2026-09-02 작성 · **⏳ 미실행** | 관리 화면 개요 — `admin_overview()` RPC(관리자만, SECURITY DEFINER: 학급 장부·학습 기록 유입 7일·처리할 것·DB 적용 점검을 jsonb 하나로) + `class_codes_admin_read` 정책(관리자가 교사 목록의 학급코드를 전부 볼 수 있게 — 종전엔 본인 것만). 재실행 안전. 미적용이면 관리 화면의 새 칸만 'SQL #33 미적용', 나머지는 종전대로. 검산 `SELECT jsonb_pretty(admin_overview());` |

## 새 SQL 추가 룰

1. 파일은 이 폴더(`sql/`)에 `setup_이름.sql`로 추가
2. Supabase에서 실행 후 이 표에 한 줄 추가 (커밋일·용도)
3. 코드 주석에서 SQL을 언급할 때는 `sql/파일명` 경로로 표기
