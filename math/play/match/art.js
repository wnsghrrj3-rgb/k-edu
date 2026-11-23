/* 짝 잇기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 창고 칸 = 가판대(MarketStand_1 — 지붕과 기둥) 앞에 문짝(Door_4)을 세운 것 · 옆은 상자(Crate) · 통(Barrel) · 자루(Bags)로 막는다(설계서 기본안 — 준호가 화면을 보고 고른다).
 *  빗장 = 울타리 판(Fence)을 문 앞에 가로로 · 수레 = 상자를 눕혀 납작하게 · 쟁반 = 접시(Plate_1)를 크게 · 바닥 = 선착장 판자(Environment_Dock 조각) · 옆 부두 = Env2_Dock_Wide. */
export const MODEL = { stand: 'MarketStand_1', door: 'Door_4', crate: 'Crate', barrel: 'Barrel', bags: 'Bags', bar: 'Fence', plate: 'Plate_1', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole', jetty: 'Env2_Dock_Wide' };
/** 문 안의 동물(물고기를 먹는 셋 — 판마다 섞음) · 마지막 문제의 큰 문 · 끝 장면의 구경꾼(Ultimate Animated Animal Pack) */
export const ANIMALS = ['Fox', 'Husky', 'ShibaInu'];
export const BIG = 'Alpaca';
export const WATCHER = 'Deer';
/** 동물 키(창고 칸 높이 1 에 견준 몫) · 큰 동물 */
export const ANIMAL_H = { Fox: .32, Husky: .4, ShibaInu: .38, Alpaca: .62, Deer: .56 };
/** 쟁반 위 물고기(Cute Fish Pack — 가만히 놓인 것 · 한 쟁반에는 한 종류: 종류를 세는 놀이가 아니다) */
export const FISH = ['Clownfish', 'BlueTang', 'YellowTang', 'Koi', 'Tetra'];
/** 다섯씩 한 줄로 놓는 낱칸(A07)은 밝은 물고기만 — 작아도 잘 보이게 */
export const FISH_ROWS = ['Clownfish', 'YellowTang', 'Koi'];
export const fishModel = n => 'Fish_' + n;
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] */
export const SCENERY = [ ['Environment_Cliff2', -12.5, 0, -9, 1.1, .4], ['Environment_Cliff2', 13.5, 0, -11, 1.0, 2.4], ['Environment_PalmTree_1', -8.6, 1.1, -6.5, 1.0, .3], ['Environment_PalmTree_1', 9.4, 1.1, -7.2, .9, 2] ];
/** 깜짝 쟁반의 반짝(리본 모형이 없어 쟁반이 금빛으로 빛남) · 끝 장면의 빛 */
export const GLOW = '#ffcf3a';
/** 문짝 빛깔(꾸러미의 짙은 나무를 조금 밝게 — 문으로 읽히게) */
export const DOOR_TINT = '#c08a52';
/** 빗장 빛깔(울타리 판을 밝게 — 짙은 문 위에서 보이게) */
export const BAR_TINT = '#f2d08a';
/** 화면 위 그림(common/art.js 이름표) */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin' };
