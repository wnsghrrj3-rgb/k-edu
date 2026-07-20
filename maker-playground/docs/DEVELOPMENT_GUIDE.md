# K-MAKER Development Guide

새 세션·새 개발자가 코드를 만지기 전에 읽는 문서. Bible §11의 상세.

## 1. 폴더 구조

```
maker-playground/
  index.html          # 스크립트 등록 단일 지점 + 캐시버스터
  app.js              # 라우터·NAV — 화면 추가 시 내비 항목 외 수정 금지
  components.js       # MK.* 공용 컴포넌트 — 컴포넌트 추가는 여기에만
  tokens.css          # DLS 토큰 원천(auditCss 감사 대상)
  playground.css      # 화면 스타일(토큰 참조만·레거시 정리 부채 있음)
  data/*.js           # 엔진 계층 window.MK_* — 순수 판정 로직, DOM 접근 금지
  screens/*.js        # 화면 계층 MK_SCREENS.<id> = {title, variants, render, mount}
  test-roundNN.mjs    # 라운드별 jsdom 스위트
  shotNN.mjs / shots/ # Puppeteer 실렌더 캡처
  docs/               # Product Bible 및 규범 문서
```

## 2. 코딩 규약

- 엔진은 `window.MK_X` 하나만 노출, 내부 상태는 클로저. 화면·타 엔진은 공개 API만 호출.
- 화면은 MK.* 조립만. 인라인 스타일·하드코딩 색/간격/모션 금지 — DLS 토큰 참조(spacingLint·모션 밴드가 거부).
- 시간 의존 로직은 내부 클록 `_tick`으로 결정론화(정오 앵커 — R19·R22 선례). `Date.now()` 직접 분기 금지.
- 기록 없는 변경 경로 금지: 캔버스 변경은 MK_HIST, 조직 변경은 Audit, AI 변경은 explain 필수.
- 자산 접근은 MK_DAM Reference만. 파일 복사 경로를 만들지 않는다.
- 신규 Export 포맷은 registerAdapter 하나로 — Canvas 코드 복제 금지.

## 3. 테스트 규약

- 라운드마다 test-roundNN.mjs 신설, **직전까지 전 스위트 회귀 그린이 완료 조건**. 기존 테스트 완화는 사유를 정본에 명기(R13 팔레트 id 이관 선례 — "완화 아님" 증명 의무).
- jsdom은 `runScripts:'outside-only'` + index.html의 script src 순서 그대로 eval — 실로드 순서와 동일해야 한다.
- 화면 검증은 실함수 호출 결과로: 데모용 가짜 성공 금지, 권한 거부·실패 메시지가 그대로 표시되는지 확인.
- 실렌더 검수: Puppeteer 1440×900@2x 캡처 + GIF, 픽셀 실측(잔존 0px 검증 등)이 필요한 라운드는 수치로 남긴다.
- 플레이크 발견 = 즉시 결정론화. 재시도 루프로 덮지 않는다.

## 4. 커밋·보고 규약

- 커밋 메시지: `RNN 제목 — 핵심 신설/변경, 스위트 N/N + 회귀 범위`. **정직 보고(미구현·시뮬 범위) 포함** — 과장은 다음 세션의 부채다.
- 작업 보고 형식: [완료]/[파일]/[확인 방법]/[현재 미구현]/[다음 작업].
- handoff 정본 §1.NN 등재 후 푸시까지가 한 라운드의 끝. GPT Round N 지시서 = 정본 §1.(N+20)... 주의: 현행 매핑은 **GPT Round N = 정본 §1.(N+20)** (R25 기준 — GPT 26 = §1.46). 과거 표기(N+19)는 R19 시점 밀림 이전 기준.
- 같은 단원(라운드) 두 채팅 동시 작업 금지. 공용 파일(STATUS·정본)은 자기 라운드 섹션 추가 외 수정 금지.

## 5. 서버 이식 규약 (Phase A부터)

- 저장은 STORE 어댑터 인터페이스 경유 — 인메모리 구현을 테스트용으로 영구 보존(결정론 스위트는 서버 없이 돈다).
- RLS가 최종 권한. 클라이언트 can()은 UX 선반영일 뿐 보안 경계가 아니다.
- LLM 교체는 판정부만: {action,args,explain} 계약·Safety 게이트·undo 경유 불변. 규칙 엔진은 폴백으로 유지.
- 마이그레이션 forward-only, 실행 전 스냅샷.

## 6. 하지 말 것 (요약)

Bible §0 ⚫ 항목 작업 금지 / 범용 디자인 시장용 기능 금지(§16) / 실측 없는 성능 숫자 기입 금지(§12) / 확인 모달 남발 금지(destructive만) / Core에 기능 추가 금지(Plugin 우선 검토) / 워터마크·다크패턴 금지.
