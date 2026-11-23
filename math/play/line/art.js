/* 줄 세우기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 배 기차(기차 모형이 없어 배를 줄지어 기차로 삼는다 — 설계서 기본안): 끄는 배 = Ship_Small · 칸 = Prop_Rowboat(한 줄에 아홉 척까지) · 빈 자리 부표 = Prop_Barrel(눕혀 띄움).
 *  종 = Bell(세기 틀에서 준호가 고른 것 · 앞 배에 단다) · 종 치는 이 = Characters_Henry · 선착장 = Env2_Dock_Long(이어 붙임) · 끝에 Env2_Dock_Stairs · 말뚝 Environment_Dock_Pole · 깜짝 짐 = Crate.
 *  팻말 = common/numsign.js 의 나무 팻말(UI_Wood 는 이 레포에서 장작 더미 모형이라 팻말 판으로 쓰지 않는다 — T05 와 같음). 기적 = 뱃고동 소리(모형 없음). 밧줄 = 화면 위 선(common/drag.js line). */
export const MODEL = { lead: 'Ship_Small', boat: 'Prop_Rowboat', buoy: 'Prop_Barrel', bell: 'Bell', keeper: 'Characters_Henry', dock: 'Env2_Dock_Long', stairs: 'Env2_Dock_Stairs', pole: 'Environment_Dock_Pole', crate: 'Crate' };
/** 둘레 꾸밈(가로 화면 · 전화기 세로): [모형, x, y, z, 크기, 돌림] — 물이 화면의 대부분(창고도 가게도 없다) */
export const SCENERY = {
  WIDE: [['Environment_Cliff1', -13.5, -.3, -9.5, 1.3, .5], ['Environment_PalmTree_3', -11.2, .9, -8.2, 1.0, .3], ['Environment_Rock_2', 11.5, -.25, -7.5, 1.6, 1], ['Environment_Rock_5', 9.6, -.1, -6.4, 1.4, .4], ['Environment_Rock_5', -9.8, -.1, -5.4, 1.1, 2]],
  TALL: [['Environment_Cliff1', 4.6, -.3, -9.5, 1.1, 2.4], ['Environment_PalmTree_3', 3.6, .9, -8.6, .9, .3], ['Environment_Rock_2', 3.3, -.25, 6.8, 1.2, 1], ['Environment_Rock_5', 2.6, -.1, 5.6, 1.0, .4]],
};
export const SCENERY_NAMES = ['Environment_Cliff1', 'Environment_PalmTree_3', 'Environment_Rock_2', 'Environment_Rock_5'];
/** 끄는 배 빛깔(돛이 없는 모형이라 몸통을 밝은 빨강으로 — 칸 배와 갈리게) · 깜짝 짐 덮개 · 빛 */
export const LEAD_TINT = '#d9452f';
export const GLOW = '#ffcf3a';
/** 화면 위 그림(common/art.js 이름표) */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin' };
