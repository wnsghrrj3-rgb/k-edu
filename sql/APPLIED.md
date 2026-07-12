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

## 새 SQL 추가 룰

1. 파일은 이 폴더(`sql/`)에 `setup_이름.sql`로 추가
2. Supabase에서 실행 후 이 표에 한 줄 추가 (커밋일·용도)
3. 코드 주석에서 SQL을 언급할 때는 `sql/파일명` 경로로 표기
