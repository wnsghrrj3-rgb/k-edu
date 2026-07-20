# K-MAKER V1 Roadmap

Bible §17의 실행 계획. 날짜가 아니라 **완료 조건**으로 단계를 정의한다 — 1인 개발 체계에서 날짜 약속은 거짓말이 되기 쉽다. 순서는 약속이고 속도는 실측이다.

## Phase A — 이식 (V1 전제 작업)

목표: "다음 날 다시 열었을 때 그대로 있다."

1. **A-1 Supabase 기반 계층**
   - Auth(이메일+Google OAuth), 프로필 테이블, RLS 정책(나이제 패턴 재사용).
   - STORE 어댑터: MK_PROJ·MK_BRAND·MK_DAM(메타)·MK_HIST 스냅샷의 저장/로드를 단일 인터페이스로. 인메모리 모드는 테스트용으로 보존(결정론 스위트가 서버 없이 돌아야 함).
   - 완료 조건: 로그인→프로젝트 생성→편집→로그아웃→재로그인→복원, 자동저장 디바운스가 서버 라운드트립으로 실동작.
2. **A-2 LLM 연결**
   - MK_AGENT 판정부를 Claude API 도구 호출로 교체. 계약 {action,args,explain} 불변 — 규칙 엔진은 오프라인/폴백 경로로 보존.
   - 컨텍스트 조립: Canvas Context + Brand + (있으면) Workspace. 시스템/사용자 데이터 분리(프롬프트 주입 방어).
   - 사용량 계측 → MK_ADMIN 3중 한도 활성.
   - 완료 조건: R12·R22 스위트가 폴백 모드로 그린 + 실 API 모드 스모크 10문장 통과 + 토큰 비용 로그.
3. **A-3 PDF 한글**
   - 결정: CID 폰트 서브셋 임베드 시도 → 2일 내 미해결 시 래스터 폴백(씬을 PNG로 렌더해 PDF 삽입) 확정. 어느 쪽이든 Alpha 전 완료.
4. **A-4 MVP 화면 축소**
   - 내비 노출 6종(Home·Library·Editor·AI Dock·Brand·Export)으로 컷. 나머지 라우트는 숨김 플래그(삭제 금지).
   - Startup 실측 시작(§12 미실측 칸 채우기).

## Phase B — Alpha (금성초 5인, 3주)

- 배포: keduclass.com/maker (기존 maker-playground 경로 승격).
- 관찰 항목: TimeToFirstExport, 저장 실패 0건, AI 요청당 비용, 교사가 실제로 만든 자료 종류.
- 합격선: 5인 중 3인 2주차 자발 재사용(Bible §15). 미달 시 Phase C 진입 금지 — 원인 라운드 우선.

## Phase C — Closed Beta (교사 30인)

- 초대 채널: 교사 커뮤니티(인디스쿨 등) 수기 초대 — 광고 금지, 피드백 밀도 우선.
- 추가 기능: 버전 히스토리 열람(MK_TEAM version 계층 개인용 노출), 템플릿 요청 수집 파이프.
- 합격선: 주간 Export 인당 ≥2, P0 0건 2주 연속.

## Phase D — Open Beta → V1

- 공개 + 요금제: Free(일일 AI 상한·Export 워터마크 없음 — 교육 도구에 워터마크 금지) / Pro / **Education 무상(교사 인증)**. 가격 수치는 Beta 데이터로 결정 — 지금 확정하지 않는다.
- V1 선언 조건: 결제 실동작(Toss, 나이제 스택) + Metrics 6종 대시보드 가동 + Bible §21 네 질문에 신규 세션이 실제로 답하는지 검증 1회.

## Phase E — V1.1 (협업)

- Supabase Realtime 브리지: collab op {sceneId,elIdx,field,value} 서버 중계, Presence·Lock 이식. BroadcastChannel 경로는 로컬 폴백으로 보존.
- DAM 실스토리지(Storage 버킷+dedup 해시 유지), 댓글·멘션 알림(이메일 실발송).
- Mobile·Flow 재배선: #/editor에 MK_TOUCH 레이아웃 판정 + MK_FLOW 팔레트·예측 체인 이식(R21·R23 이월 소화).

## Phase F — V2 (생태계)

- Marketplace 실결제·정산, 학교 전용 마켓(금성초 첫 테넌트 — 나아정↔나이제 패턴 그대로), 외부 플러그인 개방(샌드박스 재론 포함), Public API·SDK 공개, Admin Console 노출.

## 이월 부채 대장 (라운드 정직 보고 승계)

| 부채 | 출처 | 해소 시점 |
|---|---|---|
| PDF 한글 CID | R16 | Phase A-3 |
| #/editor 터치 재배선 | R21 | Phase E |
| #/editor Flow 재배선 | R23 | Phase E |
| playground.css 레거시 하드코딩 정리 | R24 | Phase D 전 정리 라운드 1회 |
| 실기기 60fps 실측 | R21(§1.25 통합) | Phase B에서 iPad 실측 |
| tree() O(N×U) 핫스팟 | R19 스케일 | 서버 이식 직후 캐시 |
| 브랜드 PNG 로고 업로드 | R13 | Phase A-1(Storage 연결과 동시) |
| PPTX 이미지 미디어 임베드 | R16 | Phase C(교사 요구 확실) |
