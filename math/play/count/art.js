/* 세기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 통 · 뚜껑 = Prop_Barrel 을 조각으로 나눠(위 판자 넷 = 뚜껑 · 바닥에도 한 벌) · 앤 · 뜰채(낚싯대 모형으로 대신) · 선착장 · 나룻배 · 바위 · 해초.
 *  종: 꾸러미에 없어 준호가 고르기 전까지 null — 그동안은 통 옆에 기대 둔 뚜껑을 눌러 「다 담았어요」(T03 설계 「그림」). 고르면 모형 이름을 넣고 assets 에 복사한다. */
export const MODEL = { tub: 'Prop_Barrel', keeper: 'Characters_Anne', net: 'Prop_FishingRod', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole', boat: 'Prop_Rowboat', rock: 'Rock_Moss_6', weed: 'Plant_3', weed2: 'Grass', bell: null };
/** 헤엄치는 물고기(rules.js FISH 의 이름 → 모형) */
export const fishModel = n => 'Fish_' + n;
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] */
export const SCENERY = [ ['Environment_Cliff1', -11.5, 0, -7, 1.1, .5], ['Environment_Cliff4', 12.5, 0, -10, 1.0, -.6], ['Environment_PalmTree_3', -9.2, 1.4, -6.2, 1.0, .3], ['Environment_PalmTree_1', 10.6, 1.0, -8.5, 1.0, 2] ];
/** 「다 담았어요」를 알리는 것의 이름(한 줄 안내에 쓴다) — 종을 고르면 '종' */
export const DONE = { name: '뚜껑', eul: '을' };
export const GLOW = '#ffcf3a';
export const SAND = '#d8c38c';
/** 화면 위 그림(common/art.js 이름표) — 나들이 끝 줄의 물고기는 낚시 섬 도감 그림 */
export const ICON = { fish: n => 'fishbook.' + n, flag: 'flag', star: 'flag.star', coin: 'coin' };
