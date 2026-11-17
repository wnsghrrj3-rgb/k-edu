# 영어 놀이터 — 숲 둘레 모형

- 만든 이: **Quaternius** (https://quaternius.com) — 라이선스 **CC0 1.0**(누구나 자유롭게 사용, 출처 표시 의무 없음).
- 꾸러미: **Ultimate Nature Pack**(나무 · 바위 · 덤불 · 풀 · 꽃 · 연잎 · 그루터기 · 통나무 · 밀 — quaternius.com/packs/ultimatenature.html) · **Ultimate Crops Pack**(버섯 · 꽃 — quaternius.com/packs/ultimatecrops.html).
- 받은 곳: 공개 저장소 `trebeljahr/quaternius-showcase` 의 `public/glb/nature_pack` · `public/glb/crops_pack`(2026-11-17, 커밋 `0128ca5`) — 그 저장소가 꾸러미마다 CC0 임을 적어 두었다.
- 바꾼 점: 파일은 그대로(.glb). 화면에서는 **꼴만** 쓰고 색은 놀이터의 색 토큰으로 다시 입힌다 — 재질 이름 → 토큰 표는 `content/models/kit.js` 의 `MODEL_TONES`.
- 쓰는 곳: 글자 숲 빈터의 둘레(`content/rooms/*.js` 의 `place.around.models`) · 모형 한 장 보기 `zone/models-lab.html`.
- 표: `content/models/kit.js` 의 `MODELS` 는 이 폴더의 파일에서 센 것 — 파일을 더하거나 빼면 `node handoff/scripts/gen_en_play_models.js <k-edu>` 를 다시 돌린다.
