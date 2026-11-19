/* 가르기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
export const MODEL = { boat: 'Ship_Small', cargo: 'Prop_Barrel', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole', keeper: 'Characters_Henry', wood: 'UI_Wood' };
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] */
export const SCENERY = [ ['Environment_Cliff1', -11, 0, -6, 1.1, .5], ['Environment_Cliff4', 12, 0, -10, 1.0, -.6], ['Environment_PalmTree_3', -8.6, 1.4, -5.2, 1.0, .3], ['Environment_PalmTree_1', 10.2, 1.0, -7.5, 1.0, 2], ['Environment_Rock_4', 6.5, -.2, -9.5, 1.2, 1], ['Environment_Rock_1', -5.5, -.2, -8.6, 1.1, 0] ];
/** 두 배의 빛깔과 무늬(색을 못 가리는 아이를 위해 팻말에 무늬 하나) */
export const BOATS = { red: { tint: '#e2483c', mark: '●', css: '#d23a2f' }, blue: { tint: '#4a9bff', mark: '▲', css: '#2c6fd6' } };
export const GLOW = '#ffcf3a';
/** 화면 위 그림(common/art.js 이름표) */
export const ICON = { cargo: 'market.barrel', flag: 'flag', star: 'flag.star', coin: 'coin' };
