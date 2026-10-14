# 케이학습지 시드 묶음 (2026-10-14)

수파베이스 SQL 편집기에서 **파일 하나씩 통째로 붙여 넣고 Run**. 순서 상관없고 다시 돌려도 됨(UPSERT).

1. `g1_1_all.sql` — 1학년 1학기 국어 u1~u7 · 수학 u2~u5 (3.6MB)
2. `g1_2_all.sql` — 1학년 2학기 국어 u1~u7 · 수학 u1~u6 (4.3MB)
3. `g2_1_all.sql` — 2학년 1학기 국어 u1~u8 · 수학 u1~u5 (4.9MB)
4. `g2_2_all.sql` — 2학년 2학기 수학 u1~u6 (2.0MB)
5. `g6_2_all.sql` — 6학년 2학기 수학 u1·u2 (0.8MB)

확인: `SELECT grade, semester, subject, unit_code, count(*) FROM question_bank GROUP BY 1,2,3,4 ORDER BY 1,2,3,4;`

편집기가 큰 파일을 거부하면 `sql/seed_worksheet_<학년>_<학기>_<과목>_u<N>.sql` 낱개로.
