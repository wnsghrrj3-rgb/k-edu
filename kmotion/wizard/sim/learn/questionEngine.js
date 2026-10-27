// 문제 고르기(07 문서 7-3) — 장면 개념 묶음 안에서 기대 정답률 .75에 가까운 문제
// 최근 30문제 같은 사실 키 금지 · 오답 뒤 같은 개념 쉬운 문제 예약 · 정답 자리 고르게
import { G1U3 } from './generators/g1u3.js';
import { Mastery } from './mastery.js';
export const GENERATORS = Object.assign({}, G1U3);
export class QuestionEngine {
  constructor({ rng, concepts, mastery = new Mastery() }){ this.rng = rng; this.concepts = concepts.filter(k => GENERATORS[k]); this.m = mastery; this.recent = []; this.retry = []; this.slotUse = [0, 0, 0]; this.seq = 0; }
  next(){
    let cands = [];
    const forced = this.retry.shift();
    const pool = forced ? [forced.concept] : this.concepts;
    for (let i = 0; i < 24; i++) { const k = this.rng.pick(pool), g = GENERATORS[k]; const dd = forced ? .1 : this.rng.next(); const q = g.gen(this.rng, dd);
      if (this.recent.includes(q.fact)) continue; if (forced && q.d > .35) continue; q.p = this.m.p(k, q.d); cands.push(q); }
    if (!cands.length) { const k = pool[0]; cands = [GENERATORS[k].gen(this.rng, .2)]; cands[0].p = this.m.p(k, cands[0].d); }
    cands.sort((a, b) => Math.abs(a.p - .75) - Math.abs(b.p - .75)); const q = this.rng.pick(cands.slice(0, 5));
    this.recent.push(q.fact); if (this.recent.length > 30) this.recent.shift();
    return this.build(q, !!forced);
  }
  build(q, retry){
    const seen = new Set([q.answer]); const wrong = [];
    for (const [v, tag] of this.rng.shuffle(q.wrongs.slice())) if (v >= 0 && v <= 18 && !seen.has(v)) { seen.add(v); wrong.push({ v, tag }); if (wrong.length === 2) break; }
    for (const dv of [2, -2, 3, 1, -1]) { if (wrong.length >= 2) break; const v = q.answer + dv; if (v >= 0 && !seen.has(v)) { seen.add(v); wrong.push({ v, tag: 'other' }); } }
    // 정답 자리: 적게 쓰인 자리 우선
    const minU = Math.min(...this.slotUse), free = [0, 1, 2].filter(s => this.slotUse[s] === minU); const slot = this.rng.pick(free); this.slotUse[slot]++;
    const vals = []; let wi = 0; for (let s = 0; s < 3; s++) vals.push(s === slot ? { v: q.answer, tag: null } : wrong[wi++]);
    const id = `g1-1-u3-gen-${q.fact}-${++this.seq}`;
    return { id, concept: q.concept, fact: q.fact, d: q.d, p: q.p, type: 'calc1', prompt: q.prompt, answer: q.answer, correctSlot: slot, retry,
      choices: vals.map((c, s) => ({ id: 'c' + s, slot: s, num: c.v, tag: c.tag })), verified: GENERATORS[q.concept].verify(q) };
  }
  result(q, y, ms, fast){ const r = this.m.update(q.concept, q.d, y, fast); if (y === 0) this.retry.push({ concept: q.concept }); return r; }
}
