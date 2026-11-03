# 그림자 괴물 — 디자인 덧씌우기 안내(GPT 자리)

- 손대도 되는 파일: `shadow.css`(화면·HUD·패널), `js/render.js`(무대·전등·먼지·그림자·괴물 얼굴·마을·도둑·계기판·옆그림·그래프), `js/silhouette.js`의 색·괴물 모양, `js/audio.js`(소리 합성).
- 손대지 않는 파일: `js/village.js`(마을 놀이 규칙) — 여기 수치는 실기기 보고로 베프가 조정.
- 손대지 않는 파일: `js/main.js`(흐름·판정·기록), `js/physics.js`(수식). 마크업의 `id`와 `data-*` 는 유지.
- 그리기 규약: `render.js` 의 함수 이름·인자는 그대로 두고 안을 바꾼다. 그림자는 `drawShadow(ctx, mask, W, H, s)` — mask 는 원본 방향 알파 캔버스, 화면엔 거울로.
- 목표 괴물은 `drawTarget(ctx, drawFn, fit, t)` — fit(0~1)이 오를수록 금 → 초록.
- 전자칠판 가독: 벽 위 안내 글자는 30px 이상, 수치는 HUD 상단.
