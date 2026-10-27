// 숙달도 — Elo 단순형(07 문서 7-2). 개념 키마다 m∈[0,1](처음 .3)
export const STAGES = [[0, 'seed'], [.35, 'sprout'], [.6, 'tree'], [.8, 'fruit']];
export const stageOf = m => { let s = 'seed'; for (const [a, n] of STAGES) if (m >= a) s = n; return s; };
export class Mastery {
  constructor(init = {}){ this.c = {}; for (const [k, v] of Object.entries(init)) this.c[k] = Object.assign({ m: .3, n: 0 }, v); }
  get(k){ return this.c[k] || (this.c[k] = { m: .3, n: 0 }); }
  p(k, d){ return 1 / (1 + Math.exp(-6 * (this.get(k).m - d))); }
  // y: 정답 1 / 힌트1 .8 / 힌트2 .6 / 오답 0 · fast: 그 유형 중앙값의 .6배 미만 정답
  update(k, d, y, fast = false){ const c = this.get(k), p = this.p(k, d); if (y >= 1 && fast) y = Math.min(1, y + .05);
    const before = c.m, K = c.n < 10 ? .2 : .12; c.m = Math.max(0, Math.min(1, c.m + K * (y - p))); c.n++;
    const up = stageOf(c.m) !== stageOf(before) && c.m > before; return { before, after: c.m, p, stageUp: up ? stageOf(c.m) : null }; }
  toJSON(){ return this.c; }
}
