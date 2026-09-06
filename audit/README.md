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

## 「봐줘」 — 피라미드 점검 (판단 층, 2026-09-07 준호 요청)

r01~r16 은 기계가 확실히 아는 것만 잡는다. 동선이 이상하다·문구가 1학년에게 어렵다·나가기가 엉뚱한 데로 간다 같은 건
**읽고 판단**해야 하므로 채팅에서 한다. 신호 **「케이에듀 봐줘」** — 그 채팅은 아래 피라미드를 위에서부터 내려간다.

```
1층 전체   홈 · 로그인 · 학생 입장 · 교사 대시보드 · /admin          ── 매번 전수
2층 영역   케이학습지 · 케이티처 · 케이박스 · 아침활동 · 리포트 · 라이브 · 케이플 · 케이랩 · … ── 영역마다 대표 동선 1개를 끝까지
3층 화면   그 영역의 화면 하나하나 — 나가기 · 빈 상태 · 오류 문구 · 버튼 · 저장                      ── 전수
4층 차시   단원 목록 → 차시 화면(600+)                                                            ── 바뀐 것 + 표본
```

- **4층은 전수 안 한다.** 지난 「봐줘」 이후 git 에서 바뀐 차시 전부 + 학년·과목마다 무작위 2차시. 한 채팅에 다 못 보면 어디까지 봤는지 적고 끊는다.
- 각 층에서 보는 눈: ① 막히는가(진입·나가기·저장) ② 틀렸는가(사실·계산·문구) ③ 어긋나는가(같은 뜻을 다른 말·모양으로) ④ 학생 눈높이(학년별 3단계 표준).
- 결과는 핸드오프 `audit/봐줘-YYYYMMDD.md` 한 장 — 표 하나: `층 | 어디 | 무엇 | 심각도 | 고치는 법 | ✓`. r01~r16 이 잡을 종류면 거기 안 적고 `/admin` 케이점검에 맡긴다(중복 장부 금지).
- **판단은 준호** — 표의 ✓ 칸에 준호가 표시한 것만, 다음 「케이점검 이어서」 채팅이 고친다. 「봐줘」 채팅은 고치지 않는다(보는 눈과 고치는 손을 나눈다).
- 진화: 「봐줘」에서 같은 종류가 두 번 나오면 그건 사람이 볼 일이 아니다 — `audit/rules.js` 에 규칙으로 내려보내 기계 층이 잡게 한다. 피라미드는 위로 갈수록 사람, 아래로 갈수록 기계가 맡는 쪽으로 계속 옮겨 간다.

## 처음 켤 때 (한 번)

1. Supabase SQL Editor 에서 `sql/setup_admin_audit.sql` 실행 → APPLIED.md #37 갱신
2. GitHub 레포 Settings → Secrets → Actions 에 `SUPABASE_SERVICE_KEY` (Supabase → Settings → API → service_role) 추가
   - (선택) `ANTHROPIC_API_KEY` 를 넣으면 r20 이 산다
3. Actions → 「케이점검」 → Run workflow 로 첫 실행 → `/admin` 「케이점검」 확인
4. (선택, 즉시 수정) Supabase → Database → Webhooks: `admin_audit_findings` UPDATE 시
   `POST https://api.github.com/repos/wnsghrrj3-rgb/k-edu/dispatches` · 헤더 `Authorization: Bearer <repo 권한 토큰>` · 본문 `{"event_type":"audit-approved"}`
   → 승인 즉시 audit-fix.yml 이 돈다. 안 걸어도 2시간 주기로 돈다.

## 보안 — 겹겹이

| 층 | 어디 | 무엇 |
|---|---|---|
| 1 | Supabase RLS | `admin_audit_*` 읽기는 `kedu_is_admin()` 만. 교사·학생·비로그인은 0줄 |
| 2 | Supabase GRANT | anon·authenticated 의 INSERT/UPDATE/DELETE 권한 자체를 REVOKE — RLS 가 뚫려도 브라우저 역할은 못 쓴다. 상태 변경은 RPC 두 개뿐(관리자 검사·상태값·지문 형식·500건 상한) |
| 3 | 결정 기록 | `admin_audit_decisions` 에 누가(auth.uid)·언제·무엇을 승인/무시했는지 남고 지울 수 없다(관리자도 읽기만) |
| 4 | 워크플로 권한 | `audit.yml` 은 `contents: read` + `persist-credentials: false`. 쓰기는 `audit-fix.yml` 만. npm 은 `--ignore-scripts` |
| 5 | 수정기 불신 원칙 | `fix.js` 는 DB 의 fix 지시를 쓰지 않는다 — 레포에서 **지금 다시 점검**해 같은 지문이 실제로 검출될 때만, 그 로컬 결과의 fix 만 적용. service_role 키가 새어 DB 줄을 조작해도 임의 파일 변경 불가 |
| 6 | 경로 허용 목록 | 수정기·워크플로 둘 다 `.github/ audit/ sql/(APPLIED.md 제외) kedu_config.js vercel.json package*` 는 손대면 전부 되돌리고 중단. 한 번에 300파일 상한 |
| 7 | 비밀 가림 | 보고 문면·오류 메시지에서 토큰·JWT 는 `[가림]` 으로 치환. r11 이 레포 안 시크릿을 매일 훑는다. `upload.js` 는 키가 service_role 이 아니면 시작 안 함 |
| 8 | 비밀 보관 | service_role 키는 GitHub Secrets 에만. 브라우저(`/admin`)는 anon 키 + 로그인 세션만 |

## 새 규칙 추가

`audit/rules.js` 배열에 `{ id:'rNN', name, run(ctx) }` 한 항목. `ctx.add({ rule, severity, file, line, msg, fix })`.
자동 수정을 붙이려면 `audit/fix.js` 의 FIXERS 에 같은 `fix.type` 함수를 — **고치는 줄이 하나이고 되돌리기 쉬운 것만**.
새 모듈(영역)을 만들면 `audit/config.json` 의 `areas` 에 접두어 한 줄 + r13 입구 표에 한 줄.

## 워크플로 파일 위치 (임시)

`audit/workflows/audit.yml`·`audit-fix.yml` 는 **`.github/workflows/` 로 옮겨야 돈다.** 지금 토큰이 workflow 권한이 없어
베프가 `.github/workflows/` 에 직접 못 올렸다. 두 가지 중 하나:
- GitHub 웹에서 Add file → 경로 `.github/workflows/audit.yml` 로 내용 붙여넣기 (audit-fix.yml 도 같이)
- 또는 토큰에 `workflow` 스코프를 추가해 베프에게 주면 옮겨서 푸시
