// 그림 보기 등록부(월드 2 「도형의 신전」, 16 문서 3절) — 답·오답은 여전히 **정수 하나**(계약·엔진·골든 그대로),
// 그 정수가 여기 그림 코드(pic id)로 바뀌어 보기 구슬에 숫자 대신 그림이 뜬다. 스킨은 id 문자열만 받아 그린다(13 문서 분리).
// 코드 1~9 = 평면·입체 기본 도형(보기 구슬) · 물건 글리프는 문제 그림(prompt pic)에만 쓰고 코드가 없다.
export const PIC = {
  1: 'tri', 2: 'tri2',          // 삼각형(정·둔각) — 둘 다 「삼각형」 (원형 편향 막기)
  3: 'quad', 4: 'quad2',        // 사각형(정사각·사다리꼴)
  5: 'circ', 6: 'circ2',        // 원(큰·작은)
  7: 'box', 8: 'cyl', 9: 'ball', // 1-1 2단원 입체: 상자·둥근 기둥·공 모양
  // v2.10 3학년 줄(3-1 2단원 평면도형 · 3-2 3단원 원) — 코드 10~27. 이름은 3학년 범위 안(예각·둔각·사다리꼴 같은 4학년 낱말 없음)
  10: 'seg', 11: 'ray', 12: 'line',               // 선분(양끝 점)·반직선(한쪽 화살표)·직선(양쪽 화살표)
  13: 'rangle', 14: 'angle', 15: 'angle2', 16: 'rangle2',   // 직각 2종(놓인 방향 다름)·직각이 아닌 각 2종(좁은·벌어진)
  17: 'rtri', 18: 'rtri2',                        // 직각삼각형 2종(직각 자리 다름) — 직각 없는 삼각형은 1·2 를 그대로 씀
  19: 'rect', 20: 'rect2', 21: 'square', 22: 'square2', 23: 'quad3',   // 직사각형 2종(가로·세로)·정사각형 2종(크기)·직각 없는 사각형(4 와 함께)
  24: 'cdia', 25: 'cchord', 26: 'crad', 27: 'cline',   // 원: 중심을 지나는 선분(지름)·중심 안 지나는 선분·중심에서 원 위까지(반지름)·원 밖까지 나간 선
  28: 'seg2', 29: 'ray2', 30: 'line2', 31: 'cdia2', 32: 'crad2',   // 놓인 방향이 다른 변형(한 그림으로 외우지 않게)
  // v2.12 이름 판(도형 정령 「모양 보호막」 이름 맞히기, 06 문서 44행) — 그림이 아니라 이름 글자. 스킨은 id 만 받아 글자 판을 그린다
  // v2.14 4학년 진짜 줄(4-1 2단원 각도 · 4단원 삼각형) — 코드 50~63. 직각(13·16)·직각삼각형(17·18)은 3학년 그림 그대로 씀
  50: 'acute', 51: 'acute2', 52: 'obtuse', 53: 'obtuse2',     // 예각 2(좁은·넓은)·둔각 2(직각보다 조금·많이 큼)
  54: 'iso', 55: 'iso2', 56: 'equi', 57: 'equi2', 58: 'scal', 59: 'scal2',   // 이등변삼각형 2(같은 변 표시 2)·정삼각형 2(표시 3)·세 변이 다 다른 삼각형 2(표시 0)
  60: 'atri', 61: 'atri2', 62: 'otri', 63: 'otri2',           // 예각삼각형 2(세 각이 다 예각)·둔각삼각형 2(한 각이 둔각)
  40: 'nm-box', 41: 'nm-cyl', 42: 'nm-ball', 43: 'nm-tri', 44: 'nm-quad', 45: 'nm-circ', 46: 'nm-rtri', 47: 'nm-rect', 48: 'nm-square',
  70: 'nm-atri', 71: 'nm-otri', 72: 'nm-iso', 73: 'nm-equi',   // v2.14 4학년 이름 판: 예각삼각형·둔각삼각형·이등변삼각형·정삼각형
};
export const FAMILY = { tri: 'tri', tri2: 'tri', quad: 'quad', quad2: 'quad', circ: 'circ', circ2: 'circ', box: 'box', cyl: 'cyl', ball: 'ball',
  seg: 'seg', ray: 'ray', line: 'line', rangle: 'rangle', rangle2: 'rangle', angle: 'angle', angle2: 'angle', rtri: 'rtri', rtri2: 'rtri', rect: 'rect', rect2: 'rect', square: 'square', square2: 'square', quad3: 'quad', cdia: 'cdia', cchord: 'cchord', crad: 'crad', cline: 'cline', seg2: 'seg', ray2: 'ray', line2: 'line', cdia2: 'cdia', crad2: 'crad',
  acute: 'acute', acute2: 'acute', obtuse: 'obtuse', obtuse2: 'obtuse', iso: 'iso', iso2: 'iso', equi: 'equi', equi2: 'equi', scal: 'scal', scal2: 'scal', atri: 'atri', atri2: 'atri', otri: 'otri', otri2: 'otri',
  'nm-atri': 'nm', 'nm-otri': 'nm', 'nm-iso': 'nm', 'nm-equi': 'nm',
  'nm-box': 'nm', 'nm-cyl': 'nm', 'nm-ball': 'nm', 'nm-tri': 'nm', 'nm-quad': 'nm', 'nm-circ': 'nm', 'nm-rtri': 'nm', 'nm-rect': 'nm', 'nm-square': 'nm' };
export const CODES = { tri: [1, 2], quad: [3, 4], circ: [5, 6], box: [7], cyl: [8], ball: [9],
  seg: [10, 28], ray: [11, 29], line: [12, 30], rangle: [13, 16], angle: [14, 15], rtri: [17, 18], rect: [19, 20], square: [21, 22], quadNoRight: [4, 23], cdia: [24, 31], cchord: [25], crad: [26, 32], cline: [27],
  acute: [50, 51], obtuse: [52, 53], iso: [54, 55], equi: [56, 57], scal: [58, 59], atri: [60, 61], otri: [62, 63] };
// 생활 물건(문제 그림 전용) — 1-1 2단원 「교실·생활 주변 물건」: 각 입체 모양 3개씩
export const OBJECTS = { box: ['book', 'gift', 'brick'], cyl: ['can', 'drum', 'battery'], ball: ['orange', 'ball2', 'marble'] };
export const OBJ_KO = { book: '책', gift: '선물 상자', brick: '벽돌', can: '통조림', drum: '북', battery: '건전지', orange: '귤', ball2: '공', marble: '구슬' };
export const SHAPE_KO = { tri: '삼각형', quad: '사각형', circ: '원', box: '상자 모양', cyl: '둥근 기둥 모양', ball: '공 모양', seg: '선분', ray: '반직선', line: '직선', rangle: '직각', rtri: '직각삼각형', rect: '직사각형', square: '정사각형',
  acute: '예각', obtuse: '둔각', iso: '이등변삼각형', equi: '정삼각형', scal: '세 변의 길이가 모두 다른 삼각형', atri: '예각삼각형', otri: '둔각삼각형' };
// v2.10 직각 개수(3-1 2단원 06차 분류): 그림 코드 → 직각 수. 1·2·4·23 = 0, 직각삼각형 1, 직사각형·정사각형 4
export const RIGHT_ANGLES = { 1: 0, 2: 0, 4: 0, 23: 0, 17: 1, 18: 1, 19: 4, 20: 4, 21: 4, 22: 4 };
// v2.12 도형 이름 판 코드: 도형 묶음 → 그 이름 판 코드(40~48)
export const NAME_CODE = { box: 40, cyl: 41, ball: 42, tri: 43, quad: 44, circ: 45, rtri: 46, rect: 47, square: 48, atri: 70, otri: 71, iso: 72, equi: 73 };
// v2.14 각의 크기(그림 코드 → 도): 예각·둔각 분류 검산용. 직각 13·16 = 90
export const ANGLE_DEG = { 13: 90, 16: 90, 50: 35, 51: 60, 52: 120, 53: 150 };
