// v2.12 도형 정령 「모양 보호막」 학년 줄(06 문서 44행 · 16 문서 8절 ②) — 보호막 모양(그림 코드)과 그 이름 판(NAME_CODE)
// 1학년 = 1-1 2단원 입체(상자·둥근 기둥·공 모양) · 2학년 = 2-1 2단원 평면(삼각형·사각형·원) · 3·4학년 = 3-1 2단원 직각 도형(직각삼각형·직사각형·정사각형; 4학년 진짜 줄 전 임시)
// 오답 이름은 그 모양에 「틀린」 이름만: 정사각형은 직사각형·사각형이기도 해서 정사각형 보호막 오답엔 직사각형·사각형을 안 넣는다(원으로 채움). 직사각형 보호막 오답 정사각형은 거짓(네 변이 같지 않음)이라 넣음
import { CODES, NAME_CODE } from './pics.js';
export const SPIRIT_SETS = {
  g1: { concept: 'g1.solid.name', fams: ['box', 'cyl', 'ball'], wrongs: { box: ['cyl', 'ball'], cyl: ['box', 'ball'], ball: ['box', 'cyl'] } },
  g2: { concept: 'g2.plane.name', fams: ['tri', 'quad', 'circ'], wrongs: { tri: ['quad', 'circ'], quad: ['tri', 'circ'], circ: ['tri', 'quad'] } },
  g3: { concept: 'g3.rshape.name', fams: ['rtri', 'rect', 'square'], wrongs: { rtri: ['rect', 'square'], rect: ['rtri', 'square'], square: ['rtri', 'circ'] } },
};
export const spiritSet = grade => grade <= 1 ? SPIRIT_SETS.g1 : grade === 2 ? SPIRIT_SETS.g2 : SPIRIT_SETS.g3;
// 보호막 모양 하나(전 모양과 다른 묶음) — { fam, code, nameCode }
export function pickSpiritShape(rng, grade, prevFam = null){
  const S = spiritSet(grade), fams = S.fams.filter(f => f !== prevFam), fam = rng.pick(fams.length ? fams : S.fams), code = rng.pick(CODES[fam]);
  return { fam, code, nameCode: NAME_CODE[fam], concept: S.concept };
}
