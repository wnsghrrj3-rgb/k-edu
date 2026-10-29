// 문제 고르기(07 문서 7-3) — 장면 개념 묶음 안에서 기대 정답률 .75에 가까운 문제
// 최근 30문제 같은 사실 키 금지 · 오답 뒤 같은 개념 쉬운 문제 예약 · 정답 자리 고르게
import { GENERATORS } from './generators/index.js';
import { Mastery } from './mastery.js';
export { GENERATORS };
export class QuestionEngine {
  constructor({ rng, concepts, mastery = new Mastery(), grade = null, fallback = [] }){ this.rng = rng; this.concepts = concepts.filter(k => GENERATORS[k]); this.m = mastery; this.recent = []; this.retry = []; this.slotUse = [0, 0, 0]; this.seq = 0;
    // v2.3: 변환표 학년 줄의 일반 생성기가 아직 없으면(오푸스 양산 전) fallback 생성기(3학년 = share 3종)로 보통·봉인·강화 수정을 채운다 — 빈 풀로 막히지 않게. empty = 일반 생성기 0
    this.fallback = fallback.filter(k => GENERATORS[k]); this.empty = this.concepts.length === 0; if (this.empty) this.concepts = this.fallback.slice();
    // v2.0: 장면 개념이 속한 단원(들)만 — want 풀이 다른 학년 단원으로 새지 않게(14 문서)
    this.units = new Set(this.concepts.map(k => GENERATORS[k].unit || 'g1-1-u3'));
    // v2.1: 비교형·규칙형(강화 수정 얼음·번개)은 같은 학년에서 장면 단원 이하(이미 배운 단원)까지 — 1-1 3단원 장면이면 1-1 1단원의 비교·순서는 되고 5단원(50까지)은 안 됨
    this.unitKey = u => { const m = /^g(\d)-(\d)-u(\d+)$/.exec(u || 'g1-1-u3'); return m ? [+m[1], +m[2] * 100 + +m[3]] : [1, 103]; };
    const ks = [...this.units].map(this.unitKey); this.grade = grade || (ks.length ? ks[0][0] : 1); this.unitMax = ks.length ? Math.max(...ks.map(k => k[1])) : 0; }
  // 어느 단원 생성기를 want 풀에 넣을지: word·calc 는 장면 단원 그대로 · compare·pattern 은 같은 학년 장면 단원 이하
  unitOk(unit, want){ if (this.units.has(unit)) return true; if (want !== 'compare' && want !== 'pattern') return false; const [g, k] = this.unitKey(unit); return g === this.grade && k <= this.unitMax; }
  next(opt = {}){
    // v1.6: fixed = 수가 정해진 문제(방패병 방패의 빈칸 식 「□+b=c」 그대로) — 고르기 없이 바로 만든다
    if (opt.fixed) { const k = opt.fixed.concept, g = GENERATORS[k]; if (g) { const q = g.gen(this.rng, .5, { fixed: opt.fixed }); q.p = this.m.p(k, q.d); this.recent.push(q.fact); if (this.recent.length > 30) this.recent.shift(); return this.build(q, false); } }
    let cands = [];
    const forced = opt.want ? null : this.retry.shift();
    // want 'word' = 문장제만(보스 마지막 봉인 칸) · 'calc' = 계산형만 · 'compare' = 비교·크기형 · 'pattern' = 규칙형(강화 수정, 05 문서 12항) — 장면 개념 밖이어도 같은 단원 생성기에서, 없으면 장면 개념으로
    const TAG = { word: x => !!x.word, calc: x => !x.word, compare: x => !!x.compare, pattern: x => !!x.pattern };
    const wantPool = opt.want && TAG[opt.want] ? Object.keys(GENERATORS).filter(k => TAG[opt.want](GENERATORS[k]) && this.unitOk(GENERATORS[k].unit || 'g1-1-u3', opt.want) && (this.concepts.includes(k) || opt.want !== 'calc')) : null;
    const pool = forced ? [forced.concept] : (wantPool && wantPool.length ? wantPool : this.concepts); if (!pool.length) return null;   // v2.3 생성기 0 = 문제 없음(호출 쪽이 수정을 안 연다)
    for (let i = 0; i < 24; i++) { const k = this.rng.pick(pool), g = GENERATORS[k]; const dd = forced ? .1 : this.rng.next(); const q = g.gen(this.rng, dd);
      if (this.recent.includes(q.fact)) continue; if (forced && q.d > .35) continue; q.p = this.m.p(k, q.d); cands.push(q); }
    if (!cands.length) { const k = pool[0]; cands = [GENERATORS[k].gen(this.rng, .2)]; cands[0].p = this.m.p(k, cands[0].d); }
    cands.sort((a, b) => Math.abs(a.p - .75) - Math.abs(b.p - .75)); const q = this.rng.pick(cands.slice(0, 5));
    this.recent.push(q.fact); if (this.recent.length > 30) this.recent.shift();
    return this.build(q, !!forced);
  }
  build(q, retry){
    const G = GENERATORS[q.concept], max = Number.isFinite(G.max) ? G.max : 18;   // v2.0: 오답 상한은 생성기 max(기본 18 = 1-1 3단원)
    const seen = new Set([q.answer]); const wrong = [];
    for (const [v, tag] of this.rng.shuffle(q.wrongs.slice())) if (Number.isInteger(v) && v >= 0 && v <= max && !seen.has(v)) { seen.add(v); wrong.push({ v, tag }); if (wrong.length === 2) break; }
    for (const dv of [2, -2, 3, 1, -1]) { if (wrong.length >= 2) break; const v = q.answer + dv; if (v >= 0 && !seen.has(v)) { seen.add(v); wrong.push({ v, tag: 'other' }); } }
    // 정답 자리: 적게 쓰인 자리 우선
    const minU = Math.min(...this.slotUse), free = [0, 1, 2].filter(s => this.slotUse[s] === minU); const slot = this.rng.pick(free); this.slotUse[slot]++;
    const vals = []; let wi = 0; for (let s = 0; s < 3; s++) vals.push(s === slot ? { v: q.answer, tag: null } : wrong[wi++]);
    const id = `${G.unit || 'g1-1-u3'}-gen-${q.fact}-${++this.seq}`;
    return { id, concept: q.concept, fact: q.fact, d: q.d, p: q.p, type: q.type || 'calc1', hint1: q.hint1 || null, hint2: q.hint2 || null, prompt: q.prompt, answer: q.answer, correctSlot: slot, retry,
      choices: vals.map((c, s) => ({ id: 'c' + s, slot: s, num: c.v, tag: c.tag })), verified: G.verify(q) };
  }
  result(q, y, ms, fast){ const r = this.m.update(q.concept, q.d, y, fast); if (y <= 0) this.retry.push({ concept: q.concept }); return r; }
}
