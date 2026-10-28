# hq 스킨 에셋 출처·라이선스 (전부 CC0 1.0 — 상업·교육 사용 가능, 표기 의무 없음)

| 파일 | 출처 | 팩 | 라이선스 |
|---|---|---|---|
| Mage.glb | Kay Lousberg (kaylousberg.com) — github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 | KayKit Adventurers Character Pack 1.0 (76 애니메이션 클립 내장, 텍스처 1장) | CC0 (원본 LICENSE.txt = KAYKIT_LICENSE.txt) |
| CommonTree_1·2·3·5, PineTree_1·3, BirchTree_1·4, Bush_1·2, BushBerries_1, Grass, Grass_2, Flowers, Rock_1·4, Rock_Moss_1·2·4·6, TreeStump_Moss | Quaternius (quaternius.com/packs/ultimatenature.html) — 거울: github.com/trebeljahr/quaternius-showcase (public/glb/nature_pack) | Ultimate Nature Pack | CC0 |
| Mushroom_1·3 | Quaternius — Ultimate Crops Pack (crops_pack) | CC0 |
| Chest_Closed, Chest_Open, Crystal1·2·3·5, Coin, Star | Quaternius — Ultimate RPG Pack (rpg_items_pack) | CC0 |

- 받은 날: 2026-10-28, premium-rebuild 브랜치. 합계 약 5.1 MB(Mage 3.5 MB).
- 슬라임 몬스터: 적합한 CC0 GLB 를 못 찾아 **절차적(젤리 셰이더)** 으로 만듦 — actors.js makeSlime.
- 적용 방식: 정적 소품은 로더가 재질 색을 정점색으로 굽고 지오메트리를 하나로 합쳐 InstancedMesh 로 그림(1 종류 = 1 드로우콜).
