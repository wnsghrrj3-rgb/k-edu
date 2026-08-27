# 케이메이커 영상 부품 (kmake/parts)

프리미어·리졸브 사용자가 매번 쓰는 것만 "잘 만든 기본값"으로 고정한 오버레이 부품.
편집기(타임라인)가 아니다 — 헌법(영상확장 설계서) 그대로. 부품은 렌더러의 최소 단위.

- 미리보기: `keduclass.com/kmake/parts/`
- 뽑기(알파 MOV): `npm i && npm run render` → `dist/<테마>_<부품>.mov` (ProRes 4444, 필모라·프리미어·리졸브 공용)
- 룩(LUT): `npm run lut` → `lut/*.cube` → 편집기 LUT 슬롯에 넣기
- 새 학교: `presets/<학교>.json` 복사 후 문구·테마만 교체. 테마는 `parts.js` THEMES.

부품 계약: `draw(ctx, W, H, t, p, theme)` — 같은 t 면 같은 그림, DOM·타이머 접촉 0.
