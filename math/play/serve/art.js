/* 담아 주기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 파는 물건 = 한 가지(세는 것이 헷갈리지 않게). 설계서 기본안 「상자」(Medieval Village `Crate`) — 준호가 후보(귤 · 달걀 · 버섯 · 상자)에서 고르면 여기만 바꾼다.
 *  바구니 · 접시 = Pirate Kit 통(common/barrel.js — 바구니는 넓고 납작하게 · 접시는 뚜껑 원판) · 종 = Medieval Village `Bell`(T03 에서 준호가 고른 것). */
export const MODEL = { goods: 'Crate', barrel: 'Prop_Barrel', bell: 'Bell', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole', guests: ['Characters_Henry', 'Characters_Anne'] };
/** 파는 물건의 크기(모형이 작아 키움) */
export const GOODS_S = 1.7;
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] */
export const SCENERY = [ ['Environment_Cliff1', -11.5, 0, -8, 1.1, .5], ['Environment_Cliff4', 12.5, 0, -10, 1.0, -.6], ['Environment_PalmTree_3', -8.8, 1.4, -6.6, 1.0, .3], ['Environment_PalmTree_1', 9.8, 1.0, -7.5, 1.0, 2] ];
/** 손님 빛깔(옅게 입힘 — 항구 장터와 같은 방식) · 선장(마지막 손님) · 깜짝 손님 */
export const TINTS = ['#ff8a8a', '#8ad0ff', '#ffd27a', '#9be39b', '#c9a2ff', '#ffb0d8', '#8ff0e0'];
export const CAPTAIN = { tint: '#3d4f7a', scale: 1.3 };
export const GLOW = '#ffcf3a';
/** 화면 위 그림(common/art.js 이름표) — 나들이 끝 줄 = 오늘 다녀간 손님들 */
export const ICON = { guests: ['guest.bear', 'guest.rabbit', 'guest.cat', 'guest.dog', 'guest.fox', 'guest.panda', 'guest.frog', 'guest.monkey'], flag: 'flag', star: 'flag.star', coin: 'coin' };
