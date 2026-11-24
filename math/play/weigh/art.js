/* 견주기 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다. */
export const ASSETS = './assets/';
/** 시소 저울(저울 모형이 없어 통 + 판자로 짓는다 — 설계서 기본안): 받침 = Barrel(눕힘) · 판자 = Environment_Dock_Pole(눕힘 — UI_Wood 는 이 레포에서 장작 더미라 판자로 쓰지 않는다) · 양 끝 접시 = Plate_1(크게).
 *  자루 = Bag(크기는 모두 같다) · 속의 것 = Crate(작게 · 한 가지) · 자루 받침대 = Environment_Dock_Pole(가는 말뚝) + 작은 Plate_1 · 옆 받침대 = TreeStump · 실은 자루 = Bags.
 *  모래 자루(시계) = Bag 을 Environment_Dock_Pole 에 건 것 · 손님 = Characters_Henry(큰 배 Ship_Small) · Characters_Anne(작은 나룻배 Prop_Rowboat) · 여우 = Fox · 구경꾼 = ShibaInu · Alpaca · Deer.
 *  꼬리표 = common/numsign.js 의 나무 팻말(숫자만 · 교과서 꼴). 천 · 모래 알갱이 · 깃발 · 리본 빛은 화면 위 그림. 땅(풀밭)만 바다 평면처럼 무대 바닥으로 코드가 깐다. */
export const MODEL = { pivot: 'Barrel', beam: 'Environment_Dock_Pole', pan: 'Plate_1', sack: 'Bag', box: 'Crate', stand: 'Environment_Dock_Pole', side: 'TreeStump', load: 'Bags', pole: 'Environment_Dock_Pole',
  henry: 'Characters_Henry', anne: 'Characters_Anne', ship: 'Ship_Small', rowboat: 'Prop_Rowboat', fox: 'Fox', dock: 'Env2_Dock_Stairs' };
/** 마당 구경꾼(쿵쿵 가락이 셋 이어지면 폴짝) */
export const WATCHERS = ['ShibaInu', 'Alpaca', 'Deer'];
/** 장터 마당 꾸밈(가로 화면 · 전화기 세로): [모형, x, z, 키(높이) , 돌림] — 풀밭 · 울타리 · 가판대 · 나무 · 덤불 · 꽃 · 멀리 집 */
export const SCENERY = {
  WIDE: [['House_1', -3.5, -10.5, 3.6, .3], ['MarketStand_1', -6.8, -4.3, 2.0, .35], ['MarketStand_2', 3.9, -5.2, 2.0, -.25], ['CommonTree_1', -8.4, -5.6, 4.2, 0], ['CommonTree_3', 7.4, -7.5, 4.4, 1], ['CommonTree_1', 1.0, -8.6, 3.6, 2],
    ['Fence', -5.6, -2.4, .8, 1.57], ['Fence', -5.6, -.4, .8, 1.57], ['Fence', -5.6, 1.6, .8, 1.57], ['Bush_1', -7.4, -1.6, .8, 0], ['BushBerries_1', 4.2, -3.2, .7, 1], ['Bush_1', -6.6, 2.4, .7, 2],
    ['Flowers', -4.9, 2.2, .35, 0], ['Flowers', 2.2, 3.0, .35, 1], ['Grass', -2.6, 2.9, .3, 0], ['Grass', 1.3, -2.3, .3, 1], ['Grass', -5.4, .6, .3, 2], ['TreeStump', 2.6, 3.6, .5, 0]],
  TALL: [['House_1', 1.2, -11.5, 3.6, .3], ['MarketStand_2', -3.6, -6.0, 2.0, .25], ['CommonTree_1', 3.8, -7.0, 4.0, 0], ['CommonTree_3', -4.4, -8.2, 4.2, 1],
    ['Bush_1', -3.2, 4.4, .7, 0], ['Flowers', .2, 4.3, .35, 1], ['Grass', 2.9, -2.6, .3, 0], ['Grass', -2.9, -2.2, .3, 1]],
};
export const SCENERY_NAMES = ['House_1', 'MarketStand_1', 'MarketStand_2', 'CommonTree_1', 'CommonTree_3', 'Fence', 'Bush_1', 'BushBerries_1', 'Flowers', 'Grass', 'TreeStump'];
/** 땅 빛깔(풀밭) · 깜짝 자루 빛 · 남는 상자 반짝 · 빛나는 접시 */
export const GRASS = '#7cbf5a';
export const GLOW = '#ffcf3a';
/** 화면 위 그림(common/art.js 이름표) */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin' };
