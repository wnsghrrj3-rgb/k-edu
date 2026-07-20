# K-MAKER Architecture Summary

한 장으로 보는 시스템. 상세는 각 라운드 정본(§1.33~§1.45)과 코드.

## 계층도

```
UI 25 screens (MK_SCREENS, MK.* 조립)
 ├─ 경험 규범: MK_FLOW(경로·예측·팔레트) · MK_DLS(토큰·린트) · MK_TOUCH(입력·레이아웃)
 ├─ 제작: Editor(MK_HIST undo · MK_AIED 27액션) · MK_AGENT(10 Agent, {action,args,explain})
 ├─ 콘텐츠: MK_SEC(섹션 조립) → MK_TPL(템플릿) → MK_CAT(브라우저) · MK_ANIM
 ├─ 자산·브랜드: MK_DAM(Entity·Reference·dedup) · MK_BRAND(토큰 수학·자동 적용 훅)
 ├─ 조직: MK_TEAM(can() 단일 판정·버전·댓글) · MK_COLLAB(op 프로토콜) · MK_ADMIN(5계층 정책)
 ├─ 생태계: MK_PLUGIN(FSM·권한 게이트) · MK_MARKET(발행 FSM·정산) · MK_API(Gateway·OpenAPI)
 └─ 출력: MK_RENDER — Scene→Display List→Adapter 8종(SVG·HTML·JSON·PNG·JPG·PDF·PPTX·Video플랜)
저장(미구현): Supabase Auth·DB·Storage·Realtime ← Phase A
```

## 단일 진입점 목록 (아키텍처 불변식)

| 관심사 | 유일한 경로 | 우회 시 |
|---|---|---|
| 캔버스 변경 | MK_HIST 경유(수동·AI 공용) | undo 불가 변경 = 버그 |
| 렌더/Export | MK_RENDER Display List | 포맷별 중복 구현 금지 |
| 자산 | MK_DAM Reference | 파일 복사 경로 금지 |
| 권한 | can() (팀)·effectivePolicy(조직) | 화면 자체 판정 금지 |
| 브랜드 적용 | MK_BRAND.apply() 하나 | 개별 요소 수정 경로 없음 |
| 외부 호출 | MK_API request() Gateway | UI 전용 기능 금지 |
| 디자인 값 | DLS 토큰 레지스트리 | 하드코딩은 린트 거부 |
| AI 변경 | Agent 계약+Safety 게이트 | 설명 없는 변경 금지 |

## 실동작 / 시뮬 경계 (정직 지도)

- **실규격으로 동작**: 템플릿 실렌더·가상 리스트 60fps(실측)·PPTX(zip 유효)·PDF(라틴)·HTML 단일 파일·QR(Reed-Solomon 왕복 검산)·Code39·브랜드 색 수학·WCAG 대비 실계산·BroadcastChannel 멀티탭 동기.
- **판정 완성·인프라 시뮬**: 실시간 협업(봇+멀티탭)·DAM 스토리지(해시 레코드)·AI(규칙 엔진, LLM 계약 대기)·SSO/DNS/결제/이메일(프로토콜 형태만)·터치/펜/음성(합성 이벤트)·시간(내부 클록).
- **구조만**: Cloud 5종 스키마·Video 프레임 플랜·GPU/Worker 타일 플랜·Figma 구조 명세.

## 데이터 흐름 (대표 시나리오)

**"우리 학교 스타일 발표자료 만들어줘"**: MK_AGENT.request → 의도 분류 → Planner(종류·목차) → MK_SEC.buildTemplate 실조립 → Brand Agent 자동 정렬(MK_BRAND.apply) → MK_HIST 스냅+explain → Editor 렌더 → Export 시 MK_RENDER → PPTX Adapter → 파일. 전 구간에서 우회 경로 없음 — 이것이 아키텍처의 완성 증명이다.

## 규모 실측 요약

엔진 코드 ~11,000줄(data/) + 화면 ~7,000줄(screens/), 검증 1,700+ 어서션. 스케일 실측: 카탈로그 1,000(60.2fps) · DAM 100,000(검색 3ms) · Admin 사용자 10,000(can() 1만 회 19ms) · 렌더 100p/5,000obj 108ms. 식별된 핫스팟: tree() O(N×U) — 서버 이식 직후 캐시 대상.
