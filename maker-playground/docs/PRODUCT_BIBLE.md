# K-MAKER Product Bible

**버전** 1.0 (Round 25 = GPT Round 26 지시서) · **작성일** 2026-07-21
**지위** 이 문서는 K-MAKER 개발의 최상위 규범이다. 코드·화면·라운드 지시서가 이 문서와 충돌하면 이 문서가 이긴다. 이 문서를 바꾸려면 문서를 먼저 고치고 코드를 고친다.

**전제가 되는 사실(2026-07-21 현재)**: maker-playground에는 14개 엔진(MK_CAT·MK_AIED·MK_BRAND·MK_TEAM·MK_COLLAB·MK_DAM·MK_RENDER·MK_PLUGIN·MK_MARKET·MK_ADMIN·MK_API·MK_TOUCH·MK_AGENT·MK_FLOW·MK_DLS)과 코어 계층(MK_SEC·MK_TPL·MK_PROJ·MK_ANIM·MK_HIST), 25개 화면, 라운드별 jsdom 스위트 총 1,700+ 검증이 존재한다. **전부 인메모리·결정론이다.** 실서버·영속화·실결제·LLM·실 SSO는 없다. 이 Bible의 존재 이유는 "무엇이 이미 판정 계층으로 완성됐고, 무엇이 이식이며, 무엇을 버릴 것인가"를 확정하는 것이다.

---

## §0. 핵심 목표 — 삭제·보류·필수의 확정

모든 기능을 세 무더기로 나눈다. 기준은 하나다: **교사 한 명이 월요일 아침에 실제로 쓰는 데 필요한가.**

### 반드시 만든다 (V1)
| 기능 | 현재 상태 | V1에서 할 일 |
|---|---|---|
| 계정·영속화 | 없음(세션 메모리) | Supabase Auth+DB. STORE 교체 지점은 R13 정직 보고에 이미 명시됨 |
| Editor + 46 큐레이션 템플릿 | 완성(실렌더) | 실저장 연결만 |
| Export: PPTX·PDF·PNG·HTML | PPTX·PDF·HTML 실파일 유효, PNG 브라우저 실래스터 | PDF 한글 CID 폰트 임베드(현재 라틴만 — V1 차단 이슈) |
| AI 편집·생성 | 결정론 규칙 엔진, {action,args,explain} 계약 | 판정부만 LLM(Claude API) 교체 — 계약 유지 |
| Brand(개인) | 완성(토큰 수학·자동 적용 훅) | 영속화만 |
| 자동저장 | 디바운스 판정 완성(_tick 검증) | localStorage→서버 이중화 |
| K-DLS 준수 | 완성(린트·감사) | 신규 화면 전부 통과 의무 |

### 미룬다 (V1.1 이후 — 판정 계층은 완성, 이식만 남음)
- **실시간 협업**: op 프로토콜 {sceneId,elIdx,field,value}는 서버 이식 가능 형태로 설계 완료. Supabase Realtime 브리지 = V1.1. BroadcastChannel 멀티탭은 V1에 그대로 탑재(같은 브라우저 한정임을 명시).
- **DAM 실스토리지**: Entity·Reference·dedup 판정 완성. Supabase Storage 연결 = V1.1.
- **Mobile 터치 재배선**: MK_TOUCH는 판정 엔진으로 대기. #/editor 재배선 = V1.1 (R21 정직 보고의 이월 그대로).
- **Flow 재배선**: MK_FLOW 동일 — #/editor에 예측 체인·팔레트 이식 = V1.1.
- **Plugin**: 런타임 완성. V1은 KEDU 스위트 내장 플러그인만 활성, 외부 개발자 개방 = V2.
- **Marketplace 실결제**: 파이프라인 완성. Toss Payments 연결(나이제에서 검증된 스택 재사용) = V2.
- **Admin Console·Public API·SDK/CLI**: 완성 상태로 동결. Enterprise 고객이 생기기 전까지 노출 안 함 = V2.

### 삭제하거나 명시적으로 안 만든다
- **음성 STT 실인식** — 텍스트 명령이 동일 판정 계층을 쓴다. 실 STT는 Web Speech API가 공짜로 줄 때까지 자체 구현 금지.
- **카메라·마이크 실장치 연동** — 권한 게이트 선언만 유지. 파일 업로드로 충분.
- **Cloud 5종(GDrive·Dropbox·OneDrive·S3) 실연동** — 스키마만 보존. V1 스토리지는 Supabase 단일.
- **CMYK 인쇄 고급 경로·Video 실인코딩** — 재단선 PDF까지만. 영상은 프레임 플랜 동결.
- **iframe/Worker 실샌드박스** — API 게이트 격리 유지. 외부 플러그인 개방 시점(V2)에 재론.
- **Boolean subtract/intersect·Noise·Glass** — 경고 수집 상태로 동결.
- **자체 형태소 검색·임베딩 유사도** — 부분 문자열+토큰 역색인으로 충분. LLM 연결 후 재평가.

원칙: **판정 계층이 완성된 것은 지우지 않는다 — 노출을 미룬다.** 지우는 것은 "실물 하드웨어·외부 인프라를 흉내 내는 부분"뿐이다.

---

## §1. Product Vision

**왜 만드는가**: 기존 도구(Canva·미리캔버스·아이스크림·홈런)는 "잘 만든 빈 틀"이다. 교사는 틀에 내용을 채우느라 퇴근이 늦다. K-MAKER는 수업 키에 정렬된 콘텐츠 + 캔버스를 이해하는 AI로 "생각→클릭→결과" 최단 경로를 만든다.

**누구를 위한가**: 1차 — 대한민국 초등 교사. 2차 — 학생·개인 크리에이터. (§3 참조)

**어떤 문제를 푸는가**: ① 자료 제작 시간(발표·활동지·가정통신문을 분 단위로) ② 디자인 일관성(브랜드/학교 스타일 자동) ③ 도구 파편화(제작→협업→배포→수업 활용을 한 파이프라인으로).

**5년 목표**: 한국 초등 교사가 "수업 자료는 K-MAKER"라고 답하는 도구. 교사 크리에이터가 학교 전용 마켓에서 콘텐츠로 수익을 얻는 생태계(파이프라인은 이미 R18에서 금성초 실증).

**10년 목표**: K-edu 생태계(KLab·K-Museum·KBattle·KTeacher)의 제작 계층으로서, 교육 콘텐츠가 만들어지고·유통되고·수업에서 실행되는 전 사슬의 캔버스가 된다.

---

## §2. Product Principles

1. **Simple First** — 확인 모달은 destructive에만. 빈 화면은 존재하지 않는다. 전문 도구는 필요할 때만 나타난다. (MK_FLOW가 강제)
2. **AI Native** — AI는 챗봇이 아니라 캔버스를 이해하는 편집기다. 모든 AI 변경은 undo 스택과 설명 의무를 통과한다. (MK_AGENT·MK_HIST가 강제)
3. **Touch First** — 모바일은 데스크톱 축소판이 아니다. 5레이아웃은 서로 다른 구성을 가진다. 44pt 미만 타깃 금지. (MK_TOUCH가 강제)
4. **Flow First** — 명령 18종 전부 3클릭 이내·단축키 100%. 위반 등록은 코드가 거부한다. (MK_FLOW가 강제)
5. **Creator First** — 만든 사람이 심사받고·판매하고·정산받는 사슬이 끊기지 않는다. 교육 무상(eduPrice 0)은 가격 규칙 최우선. (MK_MARKET이 강제)
6. **Platform First** — UI만 쓰는 기능을 만들지 않는다. 모든 핵심 기능은 Gateway를 통과한다. 새 기능은 Core가 아니라 Plugin이다. (MK_API·MK_PLUGIN이 강제)

각 원칙은 구호가 아니라 **거부 코드가 있는 규칙**이다. 원칙 위반 기능은 머지 전에 해당 엔진의 린트/게이트가 거부해야 하며, 거부가 불가능한 원칙은 원칙이 아니다.

---

## §3. Target Users — 우선순위 확정

| 순위 | 사용자 | V1 근거 | 대응 자산 |
|---|---|---|---|
| 1 | **Teacher(초등)** | 창업자의 해자 — 현직 도메인 지식. KEDU 스위트·금성초 시드·교육 무상 가격이 이미 코드에 있음 | kedu-suite 플러그인, education 플랜, 학교 마켓 |
| 2 | **Individual Creator** | 템플릿 46종·브랜드·Export가 그대로 적용 | 전 코어 |
| 3 | **Student** | 교사 배포를 따라 유입. 자체 마케팅 안 함 | viewer/commenter 권한, 접근성 |
| 4 | Designer | V1.1 — DLS·Figma 토큰 내보내기 시점 | MK_DLS |
| 5 | Marketing | V2 — SNS 프리셋 존재하나 우선 아님 | 프리셋 9종 |
| 6 | Enterprise | V2 — Admin·SSO·API 완성 상태로 동결 | MK_ADMIN·MK_API |
| 7 | Developer | V2 — 외부 플러그인·SDK 개방 시점 | MK_PLUGIN·SDK |

**결정**: V1 마케팅·온보딩·기본 템플릿·요금제는 전부 Teacher 기준으로 설계한다. Creator는 막지 않되 최적화하지 않는다.

---

## §4. Product Architecture

```
사용자 ── UI(화면 25종, MK.* 컴포넌트 조립만)
              │
        MK_FLOW(경로) · MK_DLS(언어) · MK_TOUCH(입력)   ← 경험 계층: 화면이 지켜야 할 판정
              │
  Editor(MK_HIST·MK_AIED) ── AI(MK_AGENT) ── Assets(MK_DAM)
  Templates(MK_TPL·MK_SEC·MK_CAT) ── Brand(MK_BRAND)
  Workspace(MK_TEAM·MK_COLLAB) ── Marketplace(MK_MARKET)
  Plugin(MK_PLUGIN) ── Automation·API(MK_API) ── Admin(MK_ADMIN)
              │
        MK_RENDER — Canvas는 하나, 출력만 다르다(Display List → Adapter 8종)
              │
        저장 계층(V1: Supabase Auth·DB·Storage·Realtime) ← 현재 유일한 미구현 층
```

불변 규칙: ① 렌더는 MK_RENDER 단일 파이프라인 ② 자산 접근은 DAM Reference만(파일 복사 경로 금지) ③ 권한 판정은 can() 단일 함수 ④ 캔버스 변경은 MK_HIST 경유(기록 없는 변경 경로 금지) ⑤ 색·간격·모션은 DLS 토큰만.

---

## §5. Feature Priority (요약 — 상세는 PRIORITY_MATRIX.md)

- **Must Have (V1)**: 계정·영속화 / Editor+템플릿 / Export 4종 / AI(LLM 연결) / Brand 개인 / 자동저장 / KEDU 내장 플러그인 / DLS 준수
- **Should Have (V1.1)**: DAM 실스토리지 / 실시간 협업(Realtime 브리지) / Mobile·Flow 재배선 / 버전·댓글 / Figma 토큰 내보내기
- **Nice to Have (V2)**: Marketplace 실결제 / Admin Console 노출 / Public API·SDK / 외부 플러그인 / 학교 전용 마켓
- **Future Vision**: Video 실인코딩 / 실 SSO(IdP) / 오프라인 서비스워커 / Cloud 외부 스토리지 / GPU·Worker 타일 렌더

## §6. MVP Scope

MVP = **"교사가 로그인해서 템플릿을 고르고, AI로 다듬고, PPTX로 내려받고, 다음 날 다시 열었을 때 그대로 있는 것."** 이 문장에 없는 기능은 MVP가 아니다. 화면 25종 중 MVP 노출은 6종뿐: Home·Library·Editor·AI(Dock)·Brand·Export. 나머지 19종은 라우트 유지하되 내비에서 숨긴다(코드 삭제 금지 — §0 원칙).

## §7. Release Plan (요약 — 상세는 RELEASE_STRATEGY.md)

Alpha(준호+금성초 동료 5인, 3주) → Closed Beta(교사 30인 초대) → Open Beta(keduclass.com 공개, 무료) → V1(요금제 도입: Free/Pro/**Education 무상**) → V1.1(협업) → V2(마켓·API).

## §8. UX Standards

- Flow: 명령 ≤3클릭·단축키 100%·예측 체인 — MK_FLOW 등록기가 위반을 거부한다.
- Adaptive: 5레이아웃(desktop/tablet 2/phone 2)+폴더블, 구성 상이함을 테스트로 보증.
- Accessibility: 텍스트 대비 ≥4.5, UI ≥3.0(실계산), 포커스 링 2px, 낭독 트리, 44pt 타깃.
- Performance: 아래 §12 수치가 UX 기준이다 — 느린 기능은 미완성 기능이다.

## §9. Design Standards

- **K-DLS가 유일한 원천**: 색은 semantic 토큰만(text-safe/ui-safe 파생 보장), 간격 4px 그리드(spacingLint), 모션 150~250ms 밴드(등록기 거부), radius/elevation 토큰.
- 컴포넌트는 components.js에만 추가, 화면은 MK.* 조립만, 스타일은 토큰 참조만.
- 신규 화면은 componentLint·consistencyAudit 통과가 머지 조건.
- 이월 과제(부채로 등록): playground.css 레거시 하드코딩 정리 라운드 1회 필요(R24 정직 보고).

## §10. AI Standards

- **Agent 원칙**: AI는 {action, args, explain} 계약으로만 캔버스를 만진다. 설명 없는 변경 금지. 파괴 어휘는 확인 게이트, >20곳 변경은 Preview 게이트.
- **Prompt 구조**: LLM 교체 시 컨텍스트 = Canvas Context(R12) + Workspace Context(R14) + Brand(R13). 시스템 프롬프트는 Action Registry 27종+Agent 10종의 함수 시그니처를 도구로 제공 — 자유 텍스트 생성이 아니라 도구 호출로 제한한다.
- **Memory 정책**: 대화 기억은 프로젝트별 격리(R22). 학습(팔레트·톤 선호)은 사용자 로컬 — 타 사용자 오염 금지.
- **Safety 정책**: 학생 사용자 존재 전제 — 생성 콘텐츠는 교육 안전 필터 통과(V1은 Claude API 기본 안전성 + 금칙어 계층, R18 심사 파이프라인 재사용). AI 사용량 3중 한도(개인/부서/플랜)는 MK_ADMIN에 이미 있음 — 비용 통제 장치로 V1부터 활성.

## §11. Development Standards (상세는 DEVELOPMENT_GUIDE.md)

핵심만: 순수 판정 로직과 화면 분리(window.MK_* 엔진) / 라운드당 jsdom 스위트 + 전 회귀 그린 / Puppeteer 실렌더 캡처 / 정직 보고(미구현 명시)를 커밋 메시지에 포함 / 같은 단원 두 채팅 동시 작업 금지.

## §12. Performance Goals (실측 기반)

| 항목 | 목표 | 근거 실측 |
|---|---|---|
| Startup(초기 로드) | <2s(3G Fast) | 미실측 — V1 Alpha에서 측정, 스크립트 분할 예산 수립 |
| Editor FPS | 60fps 상시 | 가상 리스트 중앙값 16.6ms 실측(R11) — 이 수준을 에디터 캔버스 기준으로 |
| 렌더 | 100p·5,000obj <150ms | 108ms 실측(R16) |
| Export | PPTX <150ms·PDF <100ms(100p) | 90ms·43ms 실측(R16) |
| 권한 판정 | can() 1만 회 <30ms | 19ms 실측(R19 스케일) |
| API Latency | Gateway p95 <200ms(서버 도입 후) | 미실측 — 인메모리 수치는 기준 불가, V1.1에서 측정 |
| Memory | 에디터 세션 <300MB | 미실측 — Alpha 측정 |

주의: 실측 없는 칸에 숫자를 만들어 넣지 않는다. "미실측"은 그대로 두고 측정 시점만 못 박는다.

## §13. Quality Standards

- Bug 등급: P0(데이터 손실·저장 실패) 즉시 / P1(핵심 흐름 차단) 24h / P2(우회 가능) 주간 / P3(마이너) 백로그.
- QA: 라운드 스위트 전 그린이 배포 전제. 플레이크는 발견 즉시 결정론화(R19 클록 앵커 선례).
- 릴리즈 체크리스트: 전 회귀 그린 → 실브라우저 캡처 검수 → 캐시버스터 갱신 → 정직 보고 갱신 → 정본 등재.

## §14. Security

- **Authentication**: V1 Supabase Auth(이메일+OAuth Google). 실 SSO(IdP)는 V2. 비밀번호 평문 보관은 데모 전제였음 — **실서비스 전 반드시 폐기**(Supabase가 해시 대체).
- **Authorization**: can() 단일 판정 + RLS(나이제에서 검증된 패턴 재사용). 클라이언트 판정은 UX용, 서버 RLS가 최종.
- **Encryption**: 전송 TLS, 저장 Supabase 기본 암호화. 학생 개인정보는 최소 수집 원칙(이름·학급 외 수집 금지).
- **Audit**: 이벤트 카탈로그 38종(MK_ADMIN) 서버 이식.
- **Backup**: 스냅샷+체크섬 구조 완성 — Supabase 일일 백업 + 주간 export.
- 신규 위협: LLM 프롬프트 주입(사용자 doc 내용이 프롬프트에 들어감) — 도구 호출 제한(§10)이 1차 방어, 시스템 지시와 사용자 데이터 분리 필수.

## §15. Success Metrics

- **North Star: 주간 Export 수**(교사가 실제 수업 자료를 뽑아 갔는가). DAU/MAU·Retention(주간, 교사는 주 단위 리듬)·AI 사용률(세션 중 AI 1회 이상 비율)·Template 사용률·TimeToFirstDesign/TimeToExport(MK_FLOW 지표 6종 그대로 이식).
- Alpha 합격선: 동료 교사 5인 중 3인이 2주차에 자발 재사용. 이 선을 못 넘으면 V1 일정보다 원인 분석이 먼저다.

## §16. Risk Analysis

| 위험 | 내용 | 대응 |
|---|---|---|
| 기술 | 인메모리→서버 이식 시 성능 특성 붕괴(tree() O(N×U) 등 이미 식별됨) | 스케일 테스트를 서버 환경에서 재실행, 식별된 핫스팟부터 캐시 |
| 기술 | PDF 한글 미지원이 V1 차단 | CID 폰트 임베드 또는 래스터 폴백 — Alpha 전 결정 |
| 사업 | Canva·미리캔버스와 정면 경쟁 | 정면 회피 — "수업 키 정렬 콘텐츠+교사 워크플로"로만 승부. 범용 디자인 시장 진입 금지 |
| 사업 | 1인 개발 지속성 | 판정 계층+테스트가 인수인계 문서 역할. Bible이 단일 진실 |
| 운영 | LLM 비용 폭주 | 3중 한도 V1부터 활성, Free 티어 일일 상한 |
| 법적 | 학생 개인정보(만 14세 미만) | 학생 계정은 교사 발급 익명 코드 방식 — 자체 가입 금지. 개인정보 최소화 |
| 법적 | 마켓 콘텐츠 저작권 | R18 신고·takedown 파이프라인 V2 개방 전 법률 검토 |

## §17. Development Roadmap (상세는 V1_ROADMAP.md)

3개월: Supabase 이식+LLM 연결+PDF 한글 → Alpha·Closed Beta / 6개월: Open Beta+V1 요금제 / 1년: V1.1 협업+모바일 재배선 / 3년: V2 마켓·API 생태계, K-edu 제작 계층 통합.

## §18. Team Structure

현실: **1인 + AI 협업 체계**. Product=준호(최종 결정) / 아트 디렉션·UX 지시서=GPT / Frontend·Backend·AI 연결·QA·DevOps 구현=Claude(베프) / Design=K-DLS가 디자이너 역할을 코드로 대행. 채용 트리거: Open Beta에서 문의·버그 처리량이 주당 제작 시간을 넘는 시점에 CS·운영 1인이 첫 채용이다(개발자가 아니라).

## §19. Documentation

정본 위계: ① 이 Bible ② ARCHITECTURE_SUMMARY.md ③ DEVELOPMENT_GUIDE.md ④ handoff 정본(KMAKER_재정비_플레이그라운드.md — 라운드 이력·정직 보고) ⑤ OpenAPI(/vN/openapi.json 자동 생성) ⑥ DLS Docs(컴포넌트 100% 커버, 엔진 내장). 문서가 코드와 어긋나면 그 라운드는 미완성이다.

## §20. Deliverables

본 라운드 산출 6종: PRODUCT_BIBLE.md(본 문서) · V1_ROADMAP.md · RELEASE_STRATEGY.md · PRIORITY_MATRIX.md · DEVELOPMENT_GUIDE.md · ARCHITECTURE_SUMMARY.md — 전부 docs/ 아래.

## §21. 완료 조건

새 개발자(또는 새 Claude 세션)가 이 문서 하나로 다음에 답할 수 있어야 한다: ① 무엇을 먼저 만드나 → §0·§6(MVP 한 문장) ② 어떤 기준으로 판단하나 → §2(거부 코드 있는 원칙 6)·§9~§14 ③ 무엇을 만들면 안 되나 → §0 삭제 목록·§16(범용 시장 진입 금지) ④ 지금 어디까지 와 있나 → 전제 사실+§5. 이 네 질문에 답이 안 되는 개정은 개정이 아니라 훼손이다.
