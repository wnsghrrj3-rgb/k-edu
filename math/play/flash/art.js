/* 번쩍 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 궤짝 = 선착장 판자(Environment_Dock 조각)로 짠 바닥 · 벽 · 덧문 두 짝 · 칸막이(UI_Wood 는 이 레포에서 장작 더미 모형이라 쓰지 않는다 — T05~T08 과 같음).
 *  통 = Prop_Barrel(작게) · 폭죽 = Prop_Barrel 을 가늘게 세운 것(폭죽 모형 후보는 준호에게 — 그동안 가는 통) · 앤 = Characters_Anne · 말뚝 · 뒤쪽 긴 부두 = Env2_Dock_Long. */
export const MODEL = { barrel: 'Prop_Barrel', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole', keeper: 'Characters_Anne', pier: 'Env2_Dock_Long' };
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] */
export const SCENERY = [ ['Environment_Cliff1', -11.5, 0, -8, 1.1, .5], ['Environment_Cliff4', 12.5, 0, -11, 1.0, -.6], ['Environment_PalmTree_3', -9.4, 1.4, -6.6, 1.0, .3], ['Environment_PalmTree_1', 10.4, 1.0, -8.2, 1.0, 2], ['Environment_Rock_4', 7.4, -.2, -6.2, 1.1, 1], ['Environment_Rock_1', -6.6, -.2, -5.4, 1.0, 0] ];
export const SCENERY_NAMES = ['Environment_Cliff1', 'Environment_Cliff4', 'Environment_PalmTree_3', 'Environment_PalmTree_1', 'Environment_Rock_4', 'Environment_Rock_1'];
/** 밤(달빛 · 등불): 하늘 · 안개 · 바다 · 빛 */
export const NIGHT = { SKY: ['#08122b', '#18264f', '#2d3a6a'], FOG: '#141f40', SEA: '#123e66', DEEP: '#06182e', HEMI: ['#7d93c8', '#1a2236', .55], MOON: ['#b4c8ff', .75], LAMP: ['#ffb45a', 3.2, 7], FLASH: ['#fff3c4', 7, 4.5] };
/** 빛깔: 판자(덧문은 조금 밝게) · 통의 두 빛깔(사건 — 수는 그대로) · 금빛 폭죽 · 폭죽 몸 */
export const WOOD = { door: '#e0b27a', wall: '#a77443', floor: '#8a5c32', cover: '#d9a566', pallet: .62, seam: '#f3d79e' };   /* seam = 닫힌 덧문 위 칸 금(밝은 띠 — 칸 셋으로 읽히게) */
export const TINTS = ['#e8604c', '#4f8fe6'];
export const GOLD = '#ffcf3a';
export const ROCKET = '#d8463a';
/** 불꽃 빛깔(단계마다 돌려 씀) · 불똥 · 연기 */
export const FIRE = ['#ffd35c', '#ff7a3d', '#7dffa8', '#8fe3ff', '#ff8fb8', '#c6a0ff'];
export const SPARK = '#ffb347';
export const SMOKE = '#8c8f99';
/** 화면 위 그림(common/art.js 이름표): 깃발 · 별 · 동전 · 폭죽(심지) · 터진 불꽃 */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin', fuse: 'flash.fuse', burst: 'flash.burst', spark: 'flash.spark' };
