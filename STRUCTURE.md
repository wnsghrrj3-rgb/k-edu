# K-edu 레포 구조 지도

> 새 세션 진입 시 이 파일 먼저. 상세 작업 이력은 handoff 레포의 도메인별 STATUS 참조.
> 최종 갱신: 2026-07-12 (구조 정리 — sql/ 신설, 세대 구분 명문화)

## 최상위 배치

| 경로 | 역할 | 비고 |
|------|------|------|
| `index.html` | 학생 허브 (진입점) | **CONTENT_MAP 수동 갱신 필수** — 새 학년·학기·과목 라이브 시 |
| `grade{1~4}/semester1/{과목}/{N단원_이름}/` | 자기주도 차시 콘텐츠 | 자기완결형 HTML. 공용 의존은 `/kedu_gate.js`, `/kedu_boxbar.js` 2개뿐 |
| `english/g1~g6/` + `english/v3/` | 영어 콘텐츠 + v3 엔진 | v3가 현행 엔진 |
| `kedu/` | 케이 생태계 (아래 표) | |
| `labs/` | 케이랩 시뮬레이션 (라이브) | ⚠️ 대부분 허브에서 참조 중 — **파일 이동 금지** (아래 표) |
| `museum/` | 케이뮤지엄 | `core/` 공용 + 전시별 HTML + `tests/` E1·E2 하네스 |
| `draw/`, `kmake/`, `kple/` | 케이아트/케이메이크/케이플 | draw/assets ≈ 25MB (에셋 비대 시 분리 후보) |
| `sql/` | Supabase 수동 실행 SQL | **`sql/APPLIED.md`가 적용 이력 원장** — 새 SQL은 여기에 추가 |
| `auth/ board/ classwork/ parent/ teacher/ admin/` | 계정·게시판·케이박스·학부모·교사·관리 | |
| `live/` | 케이라이브 (실시간 모니터·스포트라이트) | `klive-core.js` 순수 로직 + 학생 `index.html` + 교사 `teacher.html` + `tests/` |
| `terms/ privacy/ docs/` | 약관·개인정보·내부 문서 | |
| `archive/` | 폐기 콘텐츠 보관 | old-math-content |

## kedu/ 내부

| 경로 | 역할 |
|------|------|
| `kedu/components/` | 공용 웹컴포넌트 부품 (kedu-*.js) |
| `kedu/hub/` | 케이랩 허브 (klab.html, science.html) |
| `kedu/quiz/` | 케이퀴즈 |
| `kedu/teacher/` | 케이티처 (엔진·도구·표준) |
| `kedu/activities/` | 케이티처 활동 시스템 (bridge.js 계열) |

## 엔진 세대 현황 — 헷갈리지 말 것

| 엔진 | 위치 | 상태 | 사용처 |
|------|------|------|--------|
| teacher engine (v1) | `kedu/teacher/engine/` | **현행 유지** (레거시 아님) | g1_math, g1_korean, g2_math, g2_korean 교사용 페이지 4종 + tools/map.js |
| engine3 (klab3) | `kedu/teacher/engine3/` | **현행** | tools3/ (clock·magnet·volcano), labs/artlab 계열 |
| english v3 | `english/v3/` | **현행** | 영어 전체 |

→ engine과 engine3는 **용도가 다른 공존 관계**지 신구 교체 관계가 아님. 삭제·통합 시도 금지.

## labs/ 파일 분류 (2026-07-12 참조 전수조사 기준)

**라이브 (허브·엔진에서 링크됨 — 이동/개명 절대 금지)**
- `scilab_hub.html` + `scilab_*.html` 시뮬 전체 (kedu/hub/klab.html, kedu/teacher/klab.html에서 진입)
- `earthsun_proto.html` (hub/klab, hub/science)
- `neigh_explore.html`, `neigh_time.html` + neigh_*.js 부품
- `jido_proto.html` (engine/tools/map.js가 iframe) + `jido_3d.html` (jido_proto가 참조)
- `space_window.html` (hub/klab)

**외부 참조 없음 (보관 후보 — 단 직접 URL 공유 이력 있을 수 있어 이동은 준호 결정 필요)**
- `artlab_crown.html`, `artlab_proto.html`
- `class_lens.html` + `classlab-proto.js`

**신작 — 링크 배선 대기 (보관 후보 아님, 이동 금지)**
- `animlab.html` = 애니메이션 공방 (H4a 완성 2026-07-09, 케이아트 탑바 🎬 배선 완료 2026-07-12)
- `livestage.html` = 살아나는 무대 (2026-07-13, 케이아트 탑바 🎪 배선 완료 — 그림 1장 → 무대 5종에서 자율 이동)
- `livestage-core.js` = **살아나는 무대 엔진(단일 정답)** — `livestage.html`과 `kple/games/live-stage.js`가 공유. 순수 로직 + 배경 렌더러 + 획 재현기. **중복 정의 금지**. STATUS-kedu-draw 참조

## 루트 공용 스크립트

`kedu_gate.js`(진입 게이트) · `kedu_boxbar.js`(케이박스 바) · `kedu_tracker.js` · `kedu_collect.js` · `kedu_gate/boxbar` 테스트 · `kedu_config.js` · `kedu_ga.js` · `kedu_kbox_adapter.js`
— 차시 파일들이 절대경로(`/kedu_*.js`)로 참조하므로 **위치·파일명 변경 금지**.

## 새 콘텐츠 라이브 체크리스트

1. 차시 파일을 `grade{N}/semester1/{과목}/{단원}/`에 배치
2. 과목 index.html에 차시 링크 추가
3. **처음 여는 학년·과목이면 `index.html`의 CONTENT_MAP 갱신** (404가드)
4. git push (배포 룰: push까지가 완료)
