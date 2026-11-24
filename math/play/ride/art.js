/* 타고 내리기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 집 = House_1(박공 앞면이 마당을 본다) · 문 = Door_4(집 문 자리에 따로 달아 여닫는다) · 울타리 = Fence · 종 = Bell(그루터기 TreeStump 위).
 *  창 덧문 · 창 안 · 문 안의 어둠 = Crate 를 납작하게 눌러 판으로(UI_Wood 는 이 레포에서 장작 더미 모형이라 판자로 쓰지 않는다 — T05~T07 과 같음). */
export const MODEL = { house: 'House_1', door: 'Door_4', fence: 'Fence', bell: 'Bell', panel: 'Crate', stump: 'TreeStump' };
/** 동물(Ultimate Animated Animal Pack — 걷는 움직임이 든 것) — 나들이마다 한 종류. 첫 나들이는 기본(ShibaInu). */
export const ANIMALS = ['ShibaInu', 'Husky', 'Fox', 'Deer', 'Alpaca'];
/** 동물마다: h = 키(마당에 선 키) · win = 창에서의 크기(곱 — 머리 끝이 제 칸 위 끝에 온다) · nose = 코끝이 벽 앞으로 나오는 길이 */
export const ANIMAL = {
  ShibaInu: { h: .5, win: 1.5, nose: .2 }, Husky: { h: .52, win: 1.45, nose: .2 }, Fox: { h: .46, win: 1.6, nose: .2 },
  Deer: { h: .7, win: 1.5, nose: .18 }, Alpaca: { h: .72, win: 1.45, nose: .18 } };
/** 마당 둘레 꾸밈(Ultimate Nature Pack): [모형, x, z, 키, 돌림] — 가로 화면 · 전화기 세로 */
export const SCENERY = {
  WIDE: [['CommonTree_1', -5.2, -2.6, 4.4, 0], ['CommonTree_3', 5.6, -3.2, 4.8, 1], ['CommonTree_1', 8.2, -1.4, 3.8, 2], ['CommonTree_3', -8.4, -3.6, 4.2, 2.4], ['Bush_1', -3.3, -.9, .8, 0], ['BushBerries_1', 3.5, -1.0, .75, 1], ['Bush_1', 6.6, -.8, .7, 2],
    ['Rock_Moss_4', -6.4, -.9, .5, .5], ['Rock_1', 4.9, 3.4, .32, 0], ['Flowers', -4.4, 3.2, .34, 0], ['Flowers', 3.8, 2.9, .34, 1], ['Flowers', -6.8, 1.9, .34, 2], ['Grass', -3.7, 2.2, .3, 0], ['Grass', 5.6, 1.6, .3, 1], ['Grass', -5.6, .3, .3, 2], ['Grass', 7.2, 2.8, .3, 0]],
  TALL: [['CommonTree_1', -2.9, -2.8, 4.2, 0], ['CommonTree_3', 3.0, -3.3, 4.6, 1], ['Bush_1', -2.5, -.9, .7, 0], ['BushBerries_1', 2.5, -1.0, .7, 1],
    ['Flowers', -2.3, 3.5, .32, 0], ['Flowers', 2.2, 3.7, .32, 1], ['Grass', -1.2, 3.9, .28, 0], ['Grass', 1.1, 3.4, .28, 1], ['Rock_1', 2.7, 3.1, .26, 0]],
};
export const SCENERY_NAMES = ['CommonTree_1', 'CommonTree_3', 'Bush_1', 'BushBerries_1', 'Rock_Moss_4', 'Rock_1', 'Flowers', 'Grass'];
/** 빛깔: 풀밭 · 방울 단 손님의 반짝임 · 문짝 · 창 안과 문 안의 어둠 · 덧문 · 저녁 창의 불빛 */
export const GRASS = '#7cbf5a';
export const GLOW = '#ffcf3a';
export const DOOR_TINT = '#c08a52';
export const DARK = '#1c1109';
export const SHUTTER_TINT = '#d9a566';
export const LAMP = '#ffcf6a';
/** 하늘 · 빛(낮 → 해 질 녘) */
export const DAY = { SKY: ['#5fb8ea', '#bfe6f5', '#e8f6fb'], SUN: '#fff1d8', I: 2.4, HEMI: 1.25 };
export const DUSK = { SKY: ['#3b3a78', '#e0785a', '#ffc27a'], SUN: '#ff9146', I: 1.5, HEMI: .95 };
/** 화면 위 그림(common/art.js 이름표): 방울 = 종 그림 · 해 */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin', bell: 'shop.bell', sun: 'deco.sun' };
