// v3.4 시간 정령 「시계 보호막」 시각 읽기(09 문서 5절 W3 6행 · 17 문서 2차 ⑤) — 정령 하나에 붙은 문제라 fixed 전용(보통 풀에 안 들어감, fixedOnly). 정본: handoff kedu/curriculum/math/g1_2/unit3(몇 시·몇 시 30분) · g2_2 지도서 2-2-4 248~267(5분·1분 단위) · g3/unit5(초)
// fixed = { fam, code } → 문제 그림 = 보호막 시계(`clock:h,m[,s]`), 보기 = 시각 글자 판 3(`tm:h,m[,s]`, choicePicOf) — 답 = 부호화한 시각(clock.js encodeTime). 오답 = 지도서 오개념(min-num·swap·hour-next·half-as-hour·min-one·sec-num).
import { TIME_SETS, encodeTime, timePic, clockPic, parseClock, genTime, timeWrongs } from '../clock.js';
const make = (set, max) => ({ [set.concept]: { id: set.concept, unit: set.unit, max, choicePic: true, fixedOnly: true, picPool: [],
  gen(rng, d, opt = {}){ const fx = opt.fixed && set.fams.includes(opt.fixed.fam) && opt.fixed.code ? parseClock(opt.fixed.code) : null; const f = fx ? opt.fixed.fam : rng.pick(set.fams);
    const t = fx ? { fam: f, h: fx.h, m: fx.m, s: fx.s } : genTime(rng, f); const ans = encodeTime(t.h, t.m, t.s), ws = timeWrongs(t);
    return { concept: set.concept, fact: `clock:${t.h},${t.m}${t.s == null ? '' : ',' + t.s}`, d: f === 'hour' ? .2 : f === 'half' ? .35 : f === 'five' ? .45 : f === 'one' ? .6 : .7, type: 'calc1', prompt: { key: 'q.spirit.time', args: {} }, pic: clockPic(t.h, t.m, t.s), fam: f, h: t.h, m: t.m, s: t.s,
      answer: ans, wrongs: ws, choicePic: true, choicePicOf: timePic, picPool: [], hint1: { key: 'hint.spirit.' + f, args: {} }, hint2: null }; },
  verify: q => q.answer === encodeTime(q.h, q.m, q.s) && q.h >= 1 && q.h <= 12 && q.m >= 0 && q.m <= 59 && (q.s == null || (q.s >= 0 && q.s <= 59)) && (q.fam !== 'hour' || q.m === 0) && (q.fam !== 'half' || q.m === 30) && (q.fam !== 'five' || q.m % 5 === 0) && (q.fam !== 'one' || q.m % 5 !== 0) && (q.fam !== 'sec' || q.s != null) && q.wrongs.every(([v]) => v !== q.answer) } });
export const GTIME_READ = Object.assign({}, make(TIME_SETS.g1, 1259), make(TIME_SETS.g2, 1259), make(TIME_SETS.g3, 125959));
