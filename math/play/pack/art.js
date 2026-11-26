/* 포장 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다.
 * 낱개 = Bag(자루 · 인스턴스) · 판 = 판자 조각(Environment_Dock — UI_Wood 는 이 레포에서 장작 더미) · 테 = Fence 조각 넷 · 굴림대 = 판자 옆판 + 눕힌 Environment_Dock_Pole 굴대 · 창고 = MarketStand_2
 * 배 = Ship_Small(돛이 없는 모형이라 돛대 = Environment_Dock_Pole · 돛 = 판자 조각을 빛깔만 옅게) · 일꾼 = Characters_Henry · 둘레 = Cliff · PalmTree · Rock.
 * 칸(걸음 ①) = 흐리게 비친 자루 · 수 팻말 · 찍힌 수 · 띠 · 카드는 화면 위 그림(코드). */
export const ASSETS = './assets/';
export const MODEL = { bag: 'Bag', fence: 'Fence', store: 'MarketStand_2', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole', ship: 'Ship_Small', worker: 'Characters_Henry' };
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] — 가로 화면 · 전화기 세로 */
export const SCENERY = {
  WIDE: [['Environment_Cliff4', -9.5, -.4, -8.5, 1.5, .4], ['Environment_Cliff1', 8.5, -.4, -9.5, 1.3, -.3], ['Environment_PalmTree_1', -7.6, -.2, -4.6, 1.0, .5], ['Environment_PalmTree_3', 6.6, -.2, -5.6, 1.1, 2.2], ['Environment_Rock_1', -6.8, -.1, 3.6, 1.1, 0], ['Environment_Rock_4', 7.2, -.1, 3.2, 1.0, 1.4], ['Environment_PalmTree_3', -9.6, -.2, 1.0, 1.0, 1.0]],
  TALL: [['Environment_Cliff4', -6.5, -.4, -11.5, 1.5, .4], ['Environment_Cliff1', 6.0, -.4, -12.5, 1.3, -.3], ['Environment_PalmTree_1', -3.8, -.2, -7.6, 1.0, .5], ['Environment_PalmTree_3', 3.9, -.2, -8.2, 1.1, 2.2], ['Environment_Rock_1', -3.4, -.1, 4.6, .9, 0], ['Environment_Rock_4', 3.5, -.1, 4.8, .9, 1.4]],
};
export const SCENERY_NAMES = ['Environment_Cliff1', 'Environment_Cliff4', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4'];
/** 빛깔: 판 바닥 · 넘침 자리 · 덮개 · 돛 · 금빛 자루 · 흐린 칸 · 착착 반짝 */
export const WOOD = { board: '#c08a52', seat: '#b98a55', cover: '#a37443', sail: '#fff3d6', rail: '#7b5a3a' };
export const GOLD = '#ffcf3a';
export const GHOST = '#fff4d6';
/** 화면 위 그림(common/art.js 이름표) — 깃발 · 별 · 동전 · 묶은 판(끝 장면의 한 줄) */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin', pack: 'shop.box' };
