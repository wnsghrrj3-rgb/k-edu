# 케이점검 — K-edu 전 영역 자동 점검·보고·수정

> 준호가 놓치는 곳을 기계가 수시로 훑어 `/admin` 「케이점검」에 올리고, 준호가 승인한 것만 고쳐 커밋한다.
> 완전 자율 아님 — **점검은 자동, 판단은 준호, 수정은 승인 뒤 자동(가능한 것만)**.

## 흐름

```
매일 03:00 KST + main 푸시 + 손으로
  └ audit.yml ── node audit/inspector.js ── audit/rules.js (r01~r20)
                     │  audit/out/report.json · report.md (Actions 요약·아티팩트에도 남음)
                     └ audit/upload.js ──▶ Supabase admin_audit_runs / admin_audit_findings (#37)
                                                        │
/admin 「케이점검」 ◀────────────────────────────────────┘   준호: 승인 · 무시 · 되돌리기
                                                        │
2시간마다 + 손으로 + (선택) DB Webhook
  └ audit-fix.yml ── audit/fix.js (approved + fixable 만) ── 회귀(r04·r09) ── 커밋·푸시 ── status=applied
```

## 항목 상태

| 상태 | 뜻 | 누가 바꾸나 |
|---|---|---|
| open | 확인 대기 | 점검이 새로 발견 |
| approved | 승인 — 자동 수정 가능하면 다음 주기에 고침, 아니면 「내가 할 일」 | 준호 |
| ignored | 무시 — 다시 검출돼도 안 보임 | 준호 |
| applied | 자동 수정·커밋됨 (다시 검출되면 open 으로 되살아남) | 워크플로 |
| resolved | 이번 점검에서 안 보임(손으로 고쳤거나 파일이 사라짐) | 워크플로 |

지문(fingerprint) = 규칙 + 파일 + 문면 해시. 같은 문제는 같은 지문이라 한 번 무시하면 계속 무시된다.
**규칙 id(rNN) 는 지문의 일부 — 바꾸면 이력이 끊긴다.**

## 규칙 (audit/rules.js)

| id | 이름 | 잡는 것 | 자동 수정 |
|---|---|---|---|
| r01 | 내부 링크·자원 깨짐 | href/src/poster/CSS url/meta refresh/인라인 절대경로 | 같은 이름이 한 곳뿐이면 relink |
| r02 | 차시 메타·필수 스크립트 | kedu-lesson-id 차시의 `/kedu_gate.js` 누락, lessonId 중복, viewport | add_gate (`</head>` 앞) |
| r03 | 지도·허브·실파일 일치 | kedu_map ↔ 허브 UNITS ↔ 실파일, 루트 CONTENT_MAP ↔ 허브 폴더 (track:soon 제외) | — |
| r04 | JS 구문 오류 | 인라인·외부 JS(vendor·min·ESM 제외) | — |
| r05 | HTML 뼈대 | id 중복, `<title>` 비어 있음, div 여닫음 불일치 | — |
| r06 | 차단 어휘 | config.blocked_vocab 이 학생 화면에 보이면 | — |
| r07 | 돌아가기 배선 | 도구 화면에 kedu_back.js 없음 | add_back (`</body>` 앞) |
| r08 | SQL 원장 | sql/*.sql 미등재, ⏳ 미실행 잔존 | ledger_row (⏳로 등재) |
| r09 | 회귀 테스트 | tests/*.js 실행, 실패·모듈 미발견 | — |
| r10 | 크기·빈 파일 | 200B 미만 HTML, 1.5MB 넘는 HTML, 20MB 넘는 에셋 | — |
| r11 | 시크릿 노출 | GitHub/Anthropic/AWS 키, 개인키, service_role JWT | — |
| r12 | 고아 HTML | 어디서도 링크 안 되는 HTML (폴더 단위 묶음) | — |
| r13 | 영역 입구 | 각 영역 진입 파일 존재 (표는 r13 안) | — |
| r14 | TODO·임시 표식 | TODO/FIXME/XXX/HACK/임시 | — |
| r15 | DB 참조 정합 | 코드가 부르는 표·RPC 가 sql/ 에 정의돼 있는지 | — |
| r16 | vercel 설정 | vercel.json 파싱·rewrite 대상 | — |
| r20 | AI 내용 검토(선택) | 직전 커밋에서 바뀐 학생 화면 ≤4개를 Claude 가 읽고 사실·오탈자·수준 의견 (ANTHROPIC_API_KEY 있을 때만) | — |

심각도: **high** 사용자가 막히거나 데이터가 틀림 · **mid** 어긋남 · **low** 정리 대상.
`critical_areas`(계정·입구·관리·학부모·약관·케이박스) 의 깨진 링크·구문은 mid → high 로 올린다.

## 로컬에서

```
npm ci --ignore-scripts          # jsdom (r09 에 필요)
node audit/inspector.js          # 전부  → audit/out/report.md
node audit/inspector.js --rules=r01,r03
node audit/fix.js --local        # report.json 의 fixable 전부 고침 (승인 없이 — 확인용, 커밋 전 diff 볼 것)
```

## 처음 켤 때 (한 번)

1. Supabase SQL Editor 에서 `sql/setup_admin_audit.sql` 실행 → APPLIED.md #37 갱신
2. GitHub 레포 Settings → Secrets → Actions 에 `SUPABASE_SERVICE_KEY` (Supabase → Settings → API → service_role) 추가
   - (선택) `ANTHROPIC_API_KEY` 를 넣으면 r20 이 산다
3. Actions → 「케이점검」 → Run workflow 로 첫 실행 → `/admin` 「케이점검」 확인
4. (선택, 즉시 수정) Supabase → Database → Webhooks: `admin_audit_findings` UPDATE 시
   `POST https://api.github.com/repos/wnsghrrj3-rgb/k-edu/dispatches` · 헤더 `Authorization: Bearer <repo 권한 토큰>` · 본문 `{"event_type":"audit-approved"}`
   → 승인 즉시 audit-fix.yml 이 돈다. 안 걸어도 2시간 주기로 돈다.

## 새 규칙 추가

`audit/rules.js` 배열에 `{ id:'rNN', name, run(ctx) }` 한 항목. `ctx.add({ rule, severity, file, line, msg, fix })`.
자동 수정을 붙이려면 `audit/fix.js` 의 FIXERS 에 같은 `fix.type` 함수를 — **고치는 줄이 하나이고 되돌리기 쉬운 것만**.
새 모듈(영역)을 만들면 `audit/config.json` 의 `areas` 에 접두어 한 줄 + r13 입구 표에 한 줄.

## 워크플로 파일 위치 (임시)

`audit/workflows/audit.yml`·`audit-fix.yml` 는 **`.github/workflows/` 로 옮겨야 돈다.** 지금 토큰이 workflow 권한이 없어
베프가 `.github/workflows/` 에 직접 못 올렸다. 두 가지 중 하나:
- GitHub 웹에서 Add file → 경로 `.github/workflows/audit.yml` 로 내용 붙여넣기 (audit-fix.yml 도 같이)
- 또는 토큰에 `workflow` 스코프를 추가해 베프에게 주면 옮겨서 푸시
