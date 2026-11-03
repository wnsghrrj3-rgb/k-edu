// v2.12 도형 정령 「모양 보호막」 학년 줄(06 문서 44행 · 16 문서 8절 ②) — 보호막 모양(그림 코드)과 그 이름 판(NAME_CODE)
// 1학년 = 1-1 2단원 입체(상자·둥근 기둥·공 모양) · 2학년 = 2-1 2단원 평면(삼각형·사각형·원) · 3학년 = 3-1 2단원 직각 도형(직각삼각형·직사각형·정사각형) · 4학년 = 4-1 4단원 삼각형(예각·둔각·정삼각형, v2.14)
// 오답 이름은 그 모양에 「틀린」 이름만: 정사각형은 직사각형·사각형이기도 해서 정사각형 보호막 오답엔 직사각형·사각형을 안 넣는다(원으로 채움). 직사각형 보호막 오답 정사각형은 거짓(네 변이 같지 않음)이라 넣음
import { CODES, NAME_CODE } from './pics.js';
import { timeSet, genTime, clockPic } from './clock.js';   // v3.4 시간 정령 「시계 보호막」
export const SPIRIT_SETS = {
  g1: { concept: 'g1.solid.name', fams: ['box', 'cyl', 'ball'], wrongs: { box: ['cyl', 'ball'], cyl: ['box', 'ball'], ball: ['box', 'cyl'] } },
  g2: { concept: 'g2.plane.name', fams: ['tri', 'quad', 'circ'], wrongs: { tri: ['quad', 'circ'], quad: ['tri', 'circ'], circ: ['tri', 'quad'] } },
  g3: { concept: 'g3.rshape.name', fams: ['rtri', 'rect', 'square'], wrongs: { rtri: ['rect', 'square'], rect: ['rtri', 'square'], square: ['rtri', 'circ'] } },
  // v2.14 4학년 진짜 줄(4-1 4단원): 예각삼각형·둔각삼각형·정삼각형 보호막. 정삼각형은 예각삼각형이자 이등변삼각형이라 그 오답엔 둔각·직각삼각형만(둘 다 거짓). 예각삼각형 그림은 세 변이 다 달라 정삼각형 이름은 거짓
  g4: { concept: 'g4.tri.name', fams: ['atri', 'otri', 'equi'], wrongs: { atri: ['otri', 'equi'], otri: ['atri', 'equi'], equi: ['otri', 'rtri'] } },
};
export const spiritSet = grade => grade <= 1 ? SPIRIT_SETS.g1 : grade === 2 ? SPIRIT_SETS.g2 : grade === 3 ? SPIRIT_SETS.g3 : SPIRIT_SETS.g4;
// 보호막 모양 하나(전 모양과 다른 묶음) — { fam, code, nameCode }
export function pickSpiritShape(rng, grade, prevFam = null, type = 'shape'){
  // v3.4 시간 정령(type 'time'): 묶음 = 시계 읽기 단계(1학년 정각·30분 / 2학년 5분·1분 / 3학년 1분·초), 코드 = 'clock:h,m[,s]' 그림 문자열(PIC 코드가 아님)
  if (type === 'time') { const S = timeSet(grade), fams = S.fams.filter(f => f !== prevFam), fam = rng.pick(fams.length ? fams : S.fams), t = genTime(rng, fam);
    return { fam, code: clockPic(t.h, t.m, t.s), nameCode: null, concept: S.concept, type: 'time' }; }
  const S = spiritSet(grade), fams = S.fams.filter(f => f !== prevFam), fam = rng.pick(fams.length ? fams : S.fams), code = rng.pick(CODES[fam]);
  return { fam, code, nameCode: NAME_CODE[fam], concept: S.concept, type: 'shape' };
}
