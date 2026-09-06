# 케이티처 자료층 (resources/) — 자료 표준 v1

> 2026-09-07 신설. 「내용이 부실하다」의 정체 = 영상·자료 항목에 **클릭되는 것**이 없었다.
> 실측(신설 전): 영상 extras 207개 중 실제 유튜브 ID 6개(같은 영상 하나) · 검색 링크 117 · 링크 없음 84.
> 이 층은 그 빈자리를 **실제 링크**로 채운다.

## 1. 왜 별도 층인가
- `data/g*_u*.js`는 생성기 산출물이라 직접 고치지 않는다(머리 주석 규약). 생성기를 다시 돌리면 손으로 넣은 링크가 날아간다.
- 그래서 자료는 `resources/g{학년}_{과목}_u{단원}.js`에 따로 두고, 엔진이 `openShow` 때 덧씌운다.
- 생성기·게이트·audit는 이 층을 모른다. 자료만 따로 계속 채운다.

## 2. 파일 꼴
```js
window.KT_RESOURCES = window.KT_RESOURCES || {};
window.KT_RESOURCES["g1_math"] = Object.assign(window.KT_RESOURCES["g1_math"] || {}, {
  u1_l01: [ { ...항목 }, ... ],
  u1_l02_03: [ ... ]
});
```
- 바깥 키 = 홈의 `SUBJECT_INFO.slug`(`g1_math`). 안쪽 키 = `LESSONS` 실제 키(0패딩·묶음 그대로).
- 홈 HTML에서 `data/…` 스크립트 **뒤**에 `<script src="resources/g1_math_u1.js">` 한 줄.

## 3. 항목 필드
| 필드 | 뜻 |
|---|---|
| `id` | 유일. 기존 extras와 **같은 id면 덮어쓴다**(검색 링크 카드를 실제 영상으로 승격할 때). |
| `type` | `video` 유튜브 embed · `link` 외부 페이지 · `kedu` 케이에듀 내부(자기주도 차시·게임·케이랩) |
| `title` · `description` | 카드 제목·한 줄 설명 |
| `url` | 링크. video는 watch URL, kedu는 사이트 루트 기준 절대 경로(`/grade1/…html`) |
| `video_id` | 유튜브 11자. 없으면 url에서 뽑는다 |
| `start` · `end` | 구간 재생(초). start<end |
| `source` | 출처 배지(EBS · 경상북도교육청 온학교 · KBS · 밀크T …) |
| `status` | `확보`(실제 링크) · `미확보`(검색 폴백만) |
| `verified` | 링크를 마지막으로 확인한 날 `YYYY-MM-DD` |
| `audience` | 생략 시 학생용. `teacher`면 교사용 배지 |
| `fit_slides` | 슬라이드 id(`s01`) 또는 block 이름(`cover`·`motivate`). 그 슬라이드의 추천 목록에 올라간다 |
| `note` | 교사에게 보이는 주의(예: 「2015 교육과정 4단원 영상 — 내용은 같음」) |

## 4. 소스 우선순위
1. 교육청·공공: 시도교육청 온학교, EBS, KBS, 국립기관, 에듀넷
2. 교사 공개 채널(온스쿨 등)
3. 상업 채널(밀크T·대교·아이스크림) — 내용이 맞을 때만, `source`에 채널명 명시
- **ID를 지어내지 않는다.** 못 찾으면 `status: "미확보"` + 검색 url.

## 5. 차시당 최소선
- 영상 1(도입용) + 자료 링크 1 + 케이에듀 연결 1.
- `node scripts/check_resources.js`가 형식·최소선을 잰다. **살아 있는지는 사람이 재생해 본다.**

## 6. 황금샘플
- `g1_math_u1.js` · `g1_korean_u1.js` (2026-09-07). 새 단원은 이 둘의 꼴을 복제한다.
