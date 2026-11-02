// v2.12 도형 정령 「모양 보호막」 이름 맞히기(06 문서 44행) — 정령 하나에 붙은 문제라 fixed 전용(보통 풀에 안 들어감, fixedOnly)
// fixed = { fam, code } → 문제 그림 = 보호막 모양(그 그림 코드), 보기 = 이름 판 3(정답 이름 + 그 모양에 틀린 이름 2). fixed 없으면(검산용) 학년 줄에서 무작위.
// 답은 정수 하나(이름 판 코드 40~48, pics.js) — 계약·엔진 그대로. 범위: 1학년 입체 이름 · 2학년 평면 이름 · 3학년 직각 도형 이름(4학년 낱말 0)
import { PIC, CODES, NAME_CODE } from '../pics.js';
import { SPIRIT_SETS } from '../spirit.js';
const make = (key, set, unit) => ({ [key]: { id: key, unit, max: 48, choicePic: true, fixedOnly: true, picPool: Object.values(NAME_CODE),
  gen(rng, d, opt = {}){ const f = opt.fixed && set.fams.includes(opt.fixed.fam) ? opt.fixed.fam : rng.pick(set.fams); const code = opt.fixed && CODES[f].includes(opt.fixed.code) ? opt.fixed.code : rng.pick(CODES[f]);
    const ws = set.wrongs[f].map(w => [NAME_CODE[w], 'nm-' + f]);
    return { concept: key, fact: `name:${PIC[code]}`, d: .3, type: 'calc1', prompt: { key: 'q.spirit.name', args: {} }, pic: PIC[code], fam: f, answer: NAME_CODE[f], wrongs: ws,
      choicePic: true, picPool: set.wrongs[f].map(w => NAME_CODE[w]), hint1: { key: 'hint.spirit.' + f, args: {} }, hint2: null }; },
  verify: q => q.answer === NAME_CODE[q.fam] && CODES[q.fam].includes(+Object.keys(PIC).find(k => PIC[k] === q.pic)) && q.wrongs.every(([v]) => v !== q.answer && set.wrongs[q.fam].map(w => NAME_CODE[w]).includes(v)) } });
export const GSHAPE_NAME = Object.assign({}, make('g1.solid.name', SPIRIT_SETS.g1, 'g1-1-u2'), make('g2.plane.name', SPIRIT_SETS.g2, 'g2-1-u2'), make('g3.rshape.name', SPIRIT_SETS.g3, 'g3-1-u2'));
