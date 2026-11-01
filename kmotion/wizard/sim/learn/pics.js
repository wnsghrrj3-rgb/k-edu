// 그림 보기 등록부(월드 2 「도형의 신전」, 16 문서 3절) — 답·오답은 여전히 **정수 하나**(계약·엔진·골든 그대로),
// 그 정수가 여기 그림 코드(pic id)로 바뀌어 보기 구슬에 숫자 대신 그림이 뜬다. 스킨은 id 문자열만 받아 그린다(13 문서 분리).
// 코드 1~9 = 평면·입체 기본 도형(보기 구슬) · 물건 글리프는 문제 그림(prompt pic)에만 쓰고 코드가 없다.
export const PIC = {
  1: 'tri', 2: 'tri2',          // 삼각형(정·둔각) — 둘 다 「삼각형」 (원형 편향 막기)
  3: 'quad', 4: 'quad2',        // 사각형(정사각·사다리꼴)
  5: 'circ', 6: 'circ2',        // 원(큰·작은)
  7: 'box', 8: 'cyl', 9: 'ball', // 1-1 2단원 입체: 상자·둥근 기둥·공 모양
};
export const FAMILY = { tri: 'tri', tri2: 'tri', quad: 'quad', quad2: 'quad', circ: 'circ', circ2: 'circ', box: 'box', cyl: 'cyl', ball: 'ball' };
export const CODES = { tri: [1, 2], quad: [3, 4], circ: [5, 6], box: [7], cyl: [8], ball: [9] };
// 생활 물건(문제 그림 전용) — 1-1 2단원 「교실·생활 주변 물건」: 각 입체 모양 3개씩
export const OBJECTS = { box: ['book', 'gift', 'brick'], cyl: ['can', 'drum', 'battery'], ball: ['orange', 'ball2', 'marble'] };
export const OBJ_KO = { book: '책', gift: '선물 상자', brick: '벽돌', can: '통조림', drum: '북', battery: '건전지', orange: '귤', ball2: '공', marble: '구슬' };
export const SHAPE_KO = { tri: '삼각형', quad: '사각형', circ: '원', box: '상자 모양', cyl: '둥근 기둥 모양', ball: '공 모양' };
