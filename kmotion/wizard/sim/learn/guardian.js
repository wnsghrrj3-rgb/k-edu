// v2.15 월드 2 보스 「기하학 수호신」 학습 틀(16 문서 9절) — 모양 벽(wall)·거울 분신(mirror) 문제. 그림 없음(코드·이름만), 스킨은 pic id 만 받아 그린다.
// 벽: 열쇠 문(puzzles.js shape-key)과 같은 학년 줄 — 구멍 3개 중 「문제의 답 모양」 구멍만 진짜. 답 = 몸 x 자리(좌·중·우).
// 분신: 문제 그림(pic)과 같은 모양 묶음인 수호신 하나만 진짜. 1학년은 입체 셋(종류 차이), 2학년 평면 셋, 3학년 직각 도형(정사각형 ↔ 직사각형은 같이 안 냄 — 정사각형은 직사각형이기도 해서), 4학년 삼각형(정삼각형 ↔ 이등변 같이 안 냄)
import { makePuzzle } from './puzzles.js';
import { CODES, FAMILY, PIC, SHAPE_KO, OBJ_KO } from './pics.js';
import { wWa, wIga } from './josa.js';

export const WALL_X = [-2.6, 0, 2.6];   // 구멍 자리(전투장 반폭 4.0 안)
export const MIRROR_X = [-2.4, 0, 2.4];

// 모양 벽 문제 — makePuzzle('shape-key') 재사용: stones = 구멍 그림 코드 3, answer[0] = 진짜 구멍 자리. 1학년은 물건 이름으로 묻는다(「통조림과 같은 모양 구멍으로」)
export function makeWall(rng, grade){
  const p = makePuzzle('shape-key', rng, grade);
  const holes = p.stones.map((s, i) => ({ pic: PIC[s.num], code: s.num, x: WALL_X[i] }));
  const solid = p.hole.kind === 'solid';
  return { concept: p.concept, fact: 'wall:' + p.fact.slice(4), holes, answer: p.answer[0], answerPic: holes[p.answer[0]].pic, name: p.hole.name,
    toast: solid ? { key: 'toast.wall.solid', args: { o: p.hole.name, w: wWa(p.hole.name) } } : { key: 'toast.wall', args: { n: p.hole.name } }, hint: solid ? null : p.hint1 };
}
// 몸풀기 벽(1페이즈): 구멍 하나(그림 없음), 자리만
export function makeWarmWall(rng){ const i = rng.int(0, 2); return { concept: null, fact: 'wall:warm', holes: [{ pic: null, code: 0, x: WALL_X[i] }], answer: 0, answerPic: null, name: null, toast: { key: 'toast.wall.warm', args: {} }, hint: null }; }

// 거울 분신 학년 줄: real 묶음 후보 · 그 묶음과 같이 내면 안 되는 묶음(두 답이 되는 것)
export const MIRROR_SETS = {
  g1: { fams: ['box', 'cyl', 'ball'], concept: 'g1.solid.same', ban: {} },
  g2: { fams: ['tri', 'quad', 'circ'], concept: 'g2.plane.pick', ban: {} },
  g3: { fams: ['rtri', 'rect', 'square', 'tri', 'quadNoRight', 'circ'], concept: 'g3.right.find', ban: { rect: ['square', 'quadNoRight'], square: ['rect', 'quadNoRight'], quadNoRight: ['rect', 'square'], tri: ['rtri'], rtri: ['tri'] } },
  g4: { fams: ['iso', 'equi', 'scal', 'atri', 'otri', 'rtri'], concept: 'g4.tri.side', ban: { iso: ['equi', 'rtri'], equi: ['iso', 'atri'], scal: ['atri', 'otri'], atri: ['equi', 'scal'], otri: ['scal'], rtri: ['iso'] } },   // 예각·둔각삼각형 그림(60~63)은 세 변이 다 달라 이등변과 같이 내도 됨 · rtri(직각삼각형) 은 예각·둔각 문제의 가짜용
};
export const mirrorSet = grade => grade <= 1 ? MIRROR_SETS.g1 : grade === 2 ? MIRROR_SETS.g2 : grade === 3 ? MIRROR_SETS.g3 : MIRROR_SETS.g4;
// { concept, pic(문제 그림), bodies[{x, pic, code, real}] } — 진짜는 같은 묶음의 다른 변형(한 그림으로 외우지 않게), 가짜 둘은 다른 묶음(ban 제외)
export function makeMirror(rng, grade){
  const S = mirrorSet(grade), fam = rng.pick(S.fams), qCode = rng.pick(CODES[fam]);
  const other = CODES[fam].filter(c => c !== qCode), realCode = other.length ? rng.pick(other) : qCode;
  const pool = S.fams.filter(f => f !== fam && !(S.ban[fam] || []).includes(f) && !(S.ban[f] || []).includes(fam));
  const fakes = rng.shuffle(pool).slice(0, 2).map(f => rng.pick(CODES[f]));
  const codes = rng.shuffle([realCode, ...fakes]);
  const bodies = codes.map((c, i) => ({ x: MIRROR_X[i], pic: PIC[c], code: c, real: c === realCode }));
  const name = fam === 'quadNoRight' ? null : SHAPE_KO[fam] || null;
  return { concept: S.concept, fact: 'mirror:' + fam, fam, pic: PIC[qCode], code: qCode, bodies, real: bodies.findIndex(b => b.real), name, toast: { key: 'toast.mirror', args: {} } };
}
// 검산: 진짜 하나뿐 · 같은 묶음 하나뿐 · ban 끼리 같이 안 나옴
export function verifyMirror(m){
  const fam = c => FAMILY[PIC[c]] === 'quad' && [4, 23].includes(c) ? 'quadNoRight' : FAMILY[PIC[c]];
  const fams = m.bodies.map(b => fam(b.code)), qf = m.fam === 'quadNoRight' ? 'quadNoRight' : FAMILY[m.pic];
  const sameN = fams.filter(f => f === qf).length, realN = m.bodies.filter(b => b.real).length;
  const S = Object.values(MIRROR_SETS).find(s => s.fams.includes(m.fam)) || { ban: {} };
  const banOk = fams.every(f => f === qf || !(S.ban[m.fam] || []).includes(f) && !(S.ban[f] || []).includes(m.fam));
  return sameN === 1 && realN === 1 && fam(m.bodies[m.real].code) === qf && new Set(m.bodies.map(b => b.code)).size === 3 && banOk;
}
export function verifyWall(w){ if (!w.answerPic) return w.holes.length === 1; const fam = c => FAMILY[PIC[c]]; const f = fam(w.holes[w.answer].code); return w.holes.filter(h => fam(h.code) === f).length === 1 && w.answerPic === w.holes[w.answer].pic; }
