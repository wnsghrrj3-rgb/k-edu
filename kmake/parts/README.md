# 케이메이커 영상 부품 (kmake/parts)

프리미어·리졸브 사용자가 매번 쓰는 것만 "잘 만든 기본값"으로 고정한 오버레이 부품.
편집기(타임라인)가 아니다 — 헌법(영상확장 설계서) 그대로. 부품은 렌더러의 최소 단위.

- 미리보기: `keduclass.com/kmake/parts/`
- 뽑기(알파 MOV): `npm i && npm run render` → `dist/<테마>_<부품>.mov` (ProRes 4444, 필모라·프리미어·리졸브 공용)
- 룩(LUT): `npm run lut` → `lut/*.cube` → 편집기 LUT 슬롯에 넣기
- 새 학교: `presets/<학교>.json` 복사 후 문구·테마만 교체. 테마는 `parts.js` THEMES.

부품 계약: `draw(ctx, W, H, t, p, theme)` — 같은 t 면 같은 그림, DOM·타이머 접촉 0.

## 그림 자산 (assets/)
부품이 PNG 를 쓸 땐 `register({ assets: ['x.png'] })` 로 적고 `K.asset('x.png')` 로 받는다(브라우저는 알아서 읽고, node 는 미리 읽어 넣음). 내보내기 전엔 `K.preload()`.
- `emblem-in.png` · `emblem-in.json` — 금성초 3D 엠블럼 등장 63프레임 스프라이트(24fps, 8열×384px). 뒷공장 `bake/hero_emblem.py --sec 2.6` → `assets/make-sprite.py`
- `emblem.png` — 정면 1024px (멈춘 뒤·배지용). `bake/hero_emblem.py --still 3.0`
- 원화질로 바꾸려면 준호 PC 블렌더로 같은 명령을 돌려 두 파일만 갈아 끼운다(이름 같음).

## 엠블럼 쓰는 자리
- `emblem` 부품 — 엠블럼만 돌아 들어와 멈추고 금선·문구 (크기·자리 선택)
- `opening` — 엠블럼 on/off (기본 on: 학교 이름 위에 먼저 들어옴)
- `section` · `lower3rd` — 엠블럼 배지 on/off (크림 원판 위 정면 엠블럼)
- 다른 부품에서 직접: `K.drawEmblem(ctx, tIn, x, y, size, alpha)` / `K.drawEmblemBadge(ctx, x, y, d, alpha)`
