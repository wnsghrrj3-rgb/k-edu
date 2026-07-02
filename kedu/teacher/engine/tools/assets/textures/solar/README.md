# solar 텍스처 자산 (탐구 표준 v2 · 4층)

- `sun.png`·`jupiter.png`·`saturn.png` — equirectangular 2:1 (1024×512).
- `saturn_ring.png` — 정사각 1:1 투명 알파 스프라이트(가운데 구멍).
- 2차(선택): mercury/venus/mars/uranus/neptune.png — 없으면 단색 폴백.
- GPT 프롬프트 = handoff `klab/redesigns/solar.md` G칸.
- solar 도구 v2 구현 시 로더가 이 파일들을 배선함.
