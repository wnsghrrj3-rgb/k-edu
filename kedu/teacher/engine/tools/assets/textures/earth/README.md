# earth 텍스처 자산 자리 (탐구 표준 v2 · 4층)

- `earth_day.png` (필수) / `earth_night.png` (2차) — 프롬프트 = handoff `klab/redesigns/earth.md` G칸.
- 경로 규약: `/kedu/teacher/engine/tools/assets/textures/earth/<name>.png` (탐구표준_v2.md §1-4층).
- 파일이 없어도 도구는 기존 캔버스 그림으로 폴백 — 안 깨짐. 파일 커밋하면 로드 성공 시 자동 승급.

- 2026-09-08 교체: NASA 블루마블 계열 실사(three.js examples/planets `earth_atmos_2048` → 1024×512). **동경 127°(우리나라)를 중앙으로 굴려 둠** — 모든 도구의 「우리나라」 핀이 텍스처 중앙(+X)에 있으므로 정렬 유지. GPT 그림 지구는 폐기.
