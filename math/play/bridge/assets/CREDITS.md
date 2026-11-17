# 다리 판 3D 재료
- **Pirate Kit** — Quaternius (https://quaternius.com/packs/piratekit.html), 라이선스 **CC0 1.0**(누구나 자유롭게 사용, 출처 표시 의무 없음).
- 원본 glTF 를 `@gltf-transform/cli copy` 로 .glb 로만 바꿈(모양·색 그대로). 캐릭터의 무기(Weapon_*) 노드는 화면에서 숨김.
- 판자·기둥·받침은 `Environment_Dock` 모형을 이어진 조각 단위로 나눠 그대로 씀(새로 그린 도형 없음).

## N02(2026-11-17)에 꾸러미에서 더 꺼낸 것 — 다리 길과 광장(`/math/play/plaza/`)이 이 폴더를 같이 씀
- `Characters_Henry` — 둘째 주민 모형(앤과 번갈아, 빛깔만 옅게 입힘). 손에 든 류트(Weapon_Lute)는 숨김.
- `Environment_Dock_Broken` — 광장의 부서진 선착장(첫 짓기: 고치기) · `Environment_Dock_Pole` — 지을 자리 네 귀퉁이 말뚝 · `Environment_Cliff2` — 지도 조각 넷이면 먼 바다에 솟는 새 섬.
- 내려받지 못해 아직 없는 것(Google Drive 내려받기 한도): 해적선 `Ship_Large` · 상어 `Characters_Shark` · 보물 상자 · 집(`Environment_House1~3`) · 지도 종이 `UI_Paper`. 코드는 있으면 쓰고 없으면 그 장면 없이 돈다(`bridge.js` EXTRA · `plaza/rules.js` opt).

## N05(2026-11-17)에 꾸러미에서 더 꺼낸 것 — 항구 장터(`/math/play/market/`)도 이 폴더를 같이 씀
- `UI_Wood` — 장터의 「장작」 · `Environment_Rock_5` — 장터의 「돌」, 다리 길 스무 칸 다리의 가운데 돌기둥(세로로 늘려 씀).
- 장터 바닥·계산대 판자는 `Environment_Dock` 판자 조각, 계산대 다리는 `Prop_Barrel`, 「통」 = `Prop_Barrel`, 「물고기 통」 = `Prop_Bucket_Fishes`.
- 음식 꾸러미(Ultimate Food Pack 등)는 아직 못 받음 — 받으면 `market/scene3d.js` GOODS 와 `shop/shop.js` ARTN 표만 바꾼다. 갈매기 모형도 없어 갈매기 장면은 뺌.

## N03(2026-11-17) 낚시 섬(`/math/play/fishing/`)도 이 폴더를 같이 씀
- 물고기: 고른 꾸러미(후보 — Animated Cute Fish Pack 추천)가 오기 전까지 `Prop_Bucket_Fishes` 모형을 조각으로 나눠 물고기 넷(몸통 + 가까운 지느러미)과 빈 통으로 씀. 아틀라스 자리로 나눔(통 = 왼쪽, 물고기 = 오른쪽). 새로 그린 도형 없음.
- 도둑 배(갈매기 자리) = `Ship_Small`. 게(`Characters_Crab`)는 있으면 씀 — 없으면 게 사건은 건너뜀.
- `math/play/art/*.png` — 장터 물건·광장 나무 그림은 이 폴더의 모형(UI_Wood·Rock_5·Prop_Barrel·Prop_Bucket_Fishes·Environment_Dock 판자)을 three.js 로 찍은 것.

## 낚시 섬 물고기(2026-11-17, 준호가 올린 Quaternius **Animated Cute Fish Pack**, CC0 — handoff `inbox/quaternius/cutefish/` FBX 원본)
- FBX → GLB(three FBXLoader + GLTFExporter, 빛깔 공간만 바로잡음) → gltf-transform 로 움직임 둘(Swimming_Normal · Out_Of_Water)만 남기고 압축.
- `Fish_Clownfish · BlueTang · YellowTang · Koi · Tetra · ButterflyFish · CardinalFish · RoyalGramma · Betta · Tang`(보통) · `Fish_Goldfish`(황금 물고기, 빛깔 입힘) · `Fish_Puffer`(복어) · `Fish_Shark` · `Fish_Anglerfish`(큰 물고기) · `Prop_FishingRod`(앤의 낚싯대).
- 양동이 조각 물고기는 모형을 못 불러올 때만 씀.
- 다리 길의 상어 사건도 `Fish_Shark`(Cute Fish Pack)를 씀 — 앞바다를 돌다 물에 떨어진 판자를 물고, 낱 판자를 노림.
- 낚싯대 다섯 단계 `Prop_FishingRod`·`Prop_FishingRod2~5`(Cute Fish Pack 의 FishingRod_Lvl1~5) — 낚시 섬에서 동전으로 삼. 단추 그림 `math/play/art/rod.1~5.png` 는 이 모형을 찍은 것.
- `Env2_Dock_Long`·`Env2_Dock_Wide`·`Env2_Dock_Stairs`·`Prop_Rowboat`(같은 꾸러미의 선착장·배) — 광장에 더 지을 것에 씀.
