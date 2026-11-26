/* 같은 접시 틀 그림 이름표 — 모형 · 빛깔 · 화면 그림이 닿는 곳을 이 파일 한 곳에 모은다(정본 27 문서 8절). 자체 그림으로 바꿀 때 이 파일만 고친다.
 * 접시 = Plate_1 · 물고기 = Fish_Clownfish 한 종류(가만히 누운 꼴 · 인스턴스 하나로 여럿) · 탁자 · 함지(D06 의 통) · 부두 바닥 = 판자 조각(Environment_Dock — UI_Wood 는 이 레포에서 장작 더미)
 * 밥집 = MarketStand_1 · 물고기 통(J01 — 물고기가 나오는 곳 · 꾸밈) = Prop_Bucket_Fishes · 종 = Bell · 주방 = Characters_Anne · 강아지 = ShibaInu · 둘레 = Cliff · PalmTree · Rock.
 * 주문 쪽지 · 쪽지 줄 · 수 팻말 · 띠 · 카드 · 찍힌 수는 화면 위 그림(코드). 손님은 그리지 않는다(쪽지가 손님을 대신한다). */
export const ASSETS = './assets/';
export const MODEL = { plate: 'Plate_1', fish: 'Fish_Clownfish', bucket: 'Prop_Bucket_Fishes', bell: 'Bell', cook: 'Characters_Anne', dog: 'ShibaInu', stand: 'MarketStand_1', dock: 'Environment_Dock', pole: 'Environment_Dock_Pole' };
/** 둘레 꾸밈: [모형, x, y, z, 크기, 돌림] — 가로 화면 · 전화기 세로 */
export const SCENERY = {
  WIDE: [['Environment_Cliff1', 9.5, -.4, -10, 1.3, -.3], ['Environment_PalmTree_1', -7.4, -.2, -4.2, 1.0, .5], ['Environment_PalmTree_3', 7.0, -.2, -4.8, 1.1, 2.2], ['Environment_Rock_1', -6.6, -.1, 3.4, 1.1, 0], ['Environment_Rock_4', 6.9, -.1, 3.0, 1.0, 1.4]],
  TALL: [['Environment_Cliff1', 6.0, -.4, -12.5, 1.3, -.3], ['Environment_PalmTree_1', -3.6, -.2, -6.8, 1.0, .5], ['Environment_PalmTree_3', 3.7, -.2, -7.4, 1.1, 2.2], ['Environment_Rock_1', -3.2, -.1, 4.4, .9, 0], ['Environment_Rock_4', 3.3, -.1, 4.6, .9, 1.4]],
};
export const SCENERY_NAMES = ['Environment_Cliff1', 'Environment_PalmTree_1', 'Environment_PalmTree_3', 'Environment_Rock_1', 'Environment_Rock_4'];
/** 빛깔: 탁자 윗판 · 탁자 앞판 · 함지 · 함지 뚜껑 · 흐린 접시 자리 · 금빛(금테 쪽지 · 반짝) */
export const WOOD = { top: '#c99760', skirt: '#9c6b3c', tub: '#d9b27a', lid: '#9c6b3c' };
export const GHOST = '#fff4d6';
export const GLOW = '#ffcf3a';
/** 화면 위 그림(common/art.js 이름표) — 깃발 · 별 · 동전 */
export const ICON = { flag: 'flag', star: 'flag.star', coin: 'coin' };
