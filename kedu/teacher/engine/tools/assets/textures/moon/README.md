# moon 텍스처 자산 (탐구 표준 v2 · 4층)

- `moon.png` — 달 표면 equirectangular 2:1 (예: 1024×512). **earth·moon 도구 공유 자산.**
- GPT 출력 프롬프트 = `handoff/klab/redesigns/moon.md` G칸.
- 필수 조건: 평면 지도(구체 아님) / NO shading·lighting(조명은 Three.js 코드 담당) / 좌우 seamless.
- 파일이 없으면 도구는 캔버스 그림 달로 폴백 — 배포가 깨지지 않음.
- 파일을 이 폴더에 커밋하면 moon 도구 무대 좌상단 라벨이 '🖼️ 실사 달 텍스처'로 바뀜.

- 2026-09-08 교체: NASA Clementine 계열 실사 달 지도(three.js examples/planets `moon_1024`, 1024×512). 앞면(바다)이 중앙 = 도구 앞면 마커(+X)와 일치. GPT 그림 달은 폐기.
