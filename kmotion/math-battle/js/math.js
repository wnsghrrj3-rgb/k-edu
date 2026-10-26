// K-MOTION MATH BATTLE · MathQuestionEngine / AnswerValidator
// 선택 방식(손·마우스)과 무관. 유형은 GRADES[grade][type] 생성기로 추가.
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];

// 각 생성기: (diff) → { a, b, op, ans } ; diff: easy | normal | hard
const G1 = {
  add10:  { label: '10 이내 덧셈', gen: d => { const max = d === 'easy' ? 5 : 9; let a = ri(1, max), b = ri(1, max); while (a + b > (d === 'easy' ? 9 : 10)) { a = ri(1, max); b = ri(1, max); } return { a, b, op: '+', ans: a + b }; } },
  sub10:  { label: '10 이내 뺄셈', gen: d => { const a = ri(d === 'easy' ? 3 : 4, d === 'easy' ? 9 : 10), b = ri(1, a - (d === 'hard' ? 0 : 1)); return { a, b, op: '-', ans: a - b }; } },
  make10: { label: '10을 만들어 더하기', gen: d => { // 받아올림(합 11~18)
      const a = ri(d === 'easy' ? 7 : 5, 9); const b = ri(11 - a, d === 'easy' ? Math.min(9, 13 - a) : 9); return { a, b, op: '+', ans: a + b }; } },
  from10: { label: '10을 기준으로 빼기', gen: d => { // 받아내림(11~18) − (한 자리)
      const a = ri(11, d === 'easy' ? 14 : 18); const b = ri(a - 9, d === 'easy' ? Math.min(9, a - 8) : 9); return { a, b, op: '-', ans: a - b }; } },
  add20:  { label: '20 이내 덧셈', gen: d => { const hi = d === 'easy' ? 15 : 20; let a = ri(1, hi - 1), b = ri(1, hi - a); if (d === 'hard' && Math.random() < .5) { a = ri(10, 18); b = ri(1, 20 - a); } return { a, b, op: '+', ans: a + b }; } },
  sub20:  { label: '20 이내 뺄셈', gen: d => { const a = ri(d === 'easy' ? 10 : 11, d === 'easy' ? 16 : 20), b = ri(1, d === 'easy' ? Math.min(9, a - 1) : a - 1); return { a, b, op: '-', ans: a - b }; } },
  mix:    { label: '덧셈·뺄셈 섞어서', gen: d => G1[pick(['add10', 'sub10', 'make10', 'from10', 'add20', 'sub20'])].gen(d) },
};
export const GRADES = { 1: G1 };

export class MathQuestionEngine {
  constructor({ grade = 1, type = 'mix', diff = 'normal' } = {}){ this.grade = grade; this.type = type; this.diff = diff; this.recent = []; this.slotCount = [0, 0, 0]; }
  gen(){ const g = (GRADES[this.grade] || G1)[this.type] || G1.mix; let q, tries = 0;
    do { q = g.gen(this.diff); tries++; } while (tries < 30 && this.recent.includes(q.a + q.op + q.b)); // 같은 문제 반복 방지(최근 8개)
    this.recent.push(q.a + q.op + q.b); if (this.recent.length > 8) this.recent.shift();
    q.text = `${q.a} ${q.op} ${q.b} = ?`; q.choices = this.choices(q); return q; }
  // 오답: 학생이 실제로 헷갈리는 수 — ±1·±2, 연산 바꾼 값, 받아올림/내림 실수(±10), 자리 바꿔 빼기
  choices(q){ const ans = q.ans, cand = new Set(); const add = v => { if (v !== ans && v >= 0 && v <= 30) cand.add(v); };
    const pool = []; pool.push(ans + 1, ans - 1); if (this.diff !== 'easy') pool.push(ans + 2, ans - 2);
    if (q.op === '+') { pool.push(q.a - q.b, q.b - q.a, ans - 10, ans + 10, Math.abs(q.a - q.b)); } else { pool.push(q.a + q.b, ans + 10, ans - 10, q.b - q.a + 10, q.a - q.b + 1, 10 - (q.a - q.b)); }
    const order = this.diff === 'hard' ? pool.slice(2).concat(pool.slice(0, 2)) : pool; // 어려움: 가까운 수보다 개념 오답 먼저
    for (const v of order) { if (cand.size >= 2) break; add(v); }
    while (cand.size < 2) add(ans + pick([-3, 3, -4, 4, 5]));
    const wrong = [...cand].slice(0, 2);
    // 정답 위치: 적게 쓰인 자리에 가중치
    const minC = Math.min(...this.slotCount); const wt = [0, 1, 2].map(i => 1 / (this.slotCount[i] - minC + 1)); const tot = wt[0] + wt[1] + wt[2]; let r = Math.random() * tot, slot = 0; while (slot < 2 && r >= wt[slot]) { r -= wt[slot]; slot++; } this.slotCount[slot]++;
    const out = []; let w = 0; for (let i = 0; i < 3; i++) out.push(i === slot ? ans : wrong[w++]); return { values: out, correct: slot }; }
}
export class AnswerValidator { static check(q, slot){ return slot === q.choices.correct; } }
