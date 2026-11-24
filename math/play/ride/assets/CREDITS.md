# 타고 내리기 틀 「들락날락 동물 집」 3D 재료 (T08, 2026-11-24)
- 모두 Quaternius (https://quaternius.com) — 라이선스 **CC0 1.0**(출처 표시 의무 없음). 파일은 그대로 복사(모양 그대로 · 새로 그린 도형 없음). 덧문 · 창 안 · 문 안의 판만 상자 모형을 납작하게 눌렀고, 문짝은 집의 문 자리에 맞게 너비를 늘였다(`ride.js` `fitBox`).
- **Medieval Village Pack**(`/english/play/lunch/assets/` 에서 복사 — 공개 저장소 `trebeljahr/quaternius-showcase` 의 CC0 꾸러미): `House_1` — 집(박공 앞면이 마당을 본다) · `Door_4` — 문(집 문 자리에 따로 달아 여닫는다) · `Fence` — 울타리 · `Bell` — 종(B07 「다 썼어요」 · `count/` 와 같은 것) · `Crate` — 납작하게 눌러 창 덧문 둘 · 창 안과 문 안의 어둠.
- **Ultimate Animated Animal Pack**(같은 곳): `ShibaInu`(기본) · `Husky` · `Fox` · `Deer` · `Alpaca` — 드나드는 동물(나들이마다 한 종류 · 걷기 `Walk` · 달리기 `Gallop` · 서기 `Idle`).
- **Ultimate Nature Pack**(`/english/play/assets/models/` 에서 복사): `CommonTree_1` · `CommonTree_3` · `Bush_1` · `BushBerries_1` · `Flowers` · `Grass` · `Rock_1` · `Rock_Moss_4` — 마당 둘레 꾸밈 · `TreeStump` — 종 받침.
- 쓰지 않은 것: `UI_Wood` 는 이 레포에서 장작 더미 모형이라 덧문 판자로 쓰지 않았다(설계서의 「UI_Wood 판자 둘」 대신 `Crate` 를 눌러 판으로). 방울 모형은 없다 — 방울 단 손님은 몸이 금빛으로 반짝이고 머리 위에 종 그림(`common/art.js` `shop.bell`)이 뜬다. 문패는 `common/numsign.js` 의 화면 위 나무 팻말, 발자국 · 세는 수 · 해는 화면 위 그림. 땅(풀밭)은 바다 평면처럼 무대 바닥 하나를 코드가 깐다.
