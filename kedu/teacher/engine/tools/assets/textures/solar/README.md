# solar 텍스처 자산 (탐구 표준 v2 · 4층)

- `sun.png`·`jupiter.png`·`saturn.png` — equirectangular 2:1 (1024×512).
- `saturn_ring.png` — 정사각 1:1 투명 알파 스프라이트(가운데 구멍).
- 2차(2026-09-08 완료): `mercury.jpg`·`mars.jpg`·`uranus.jpg`·`neptune.jpg` — Solar System Scope 텍스처(CC BY 4.0, https://www.solarsystemscope.com/textures/) 2048×1024 축소 · `venus.jpg` — 구름 절차 생성(bpy/numpy, 좌우 seamless). 배선: tools3/solar.html·space_journey.html·engine/tools/solar.js(TEXDEF). 없으면 단색 폴백.
- GPT 프롬프트 = handoff `klab/redesigns/solar.md` G칸.
- solar 도구 v2 구현 시 로더가 이 파일들을 배선함.
