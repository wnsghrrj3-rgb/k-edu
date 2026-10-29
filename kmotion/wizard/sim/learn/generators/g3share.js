// 3학년 「똑같이 나누기 공격」 전용 생성기(15 문서 3절, D-30) — 새 종류 `share`, 베프 몫(14 문서 금지 ⑥ 「새 문제 종류는 베프」).
// 숫자는 장면의 실제 묶음 몬스터에서 온다: qe.next({ fixed: { concept, n, hpEach } }) — 방패병 빈칸 식과 같은 `fixed` 경로. fixed 없이 부르면(검산·fallback) 학년 표 안에서 무작위.
// 정본: 3-1 3단원 나눗셈 [4수01-05] 똑같이 나누기·곱셈구구로 나눗셈 / 3-1 4단원 곱셈 [4수01-04]. 4학년(두 자리 ÷ 한 자리, 나머지 0)은 같은 틀에 수만 큼(15 문서 7절).
// 글자 수 3학년 40자 안(08 문서 7절). hint1 = 곱셈구구 n단 · hint2 = 묶음 그림(n줄로 나눈 구슬, 기존 beads 틀에 kind 'groups' 추가 — 합 ≤ 54).
const RANGE = { 3: { n: [2, 6], hpEach: [2, 9] }, 4: { n: [2, 8], hpEach: [2, 12] } };
// 묶음 수(n)·한 마리 힘(hpEach): fixed 면 그대로, 아니면 d 로 — d 낮음: 2~3마리·2~5 / 높음: 큰 쪽
function pick(rng, d, opt, grade){
  const fx = opt && opt.fixed; const R = RANGE[grade] || RANGE[3];
  if (fx && Number.isInteger(fx.n) && Number.isInteger(fx.hpEach)) return { n: fx.n, hpEach: fx.hpEach };
  const lo = rng.next() >= d; const n = lo ? rng.int(R.n[0], Math.min(3, R.n[1])) : rng.int(R.n[0], R.n[1]); const h = lo ? rng.int(R.hpEach[0], Math.min(5, R.hpEach[1])) : rng.int(R.hpEach[0], R.hpEach[1]);
  return { n, hpEach: h };
}
const diff = (n, h) => Math.min(1, .1 + (n - 2) / 6 * .35 + (h - 2) / 10 * .45);   // 큰 묶음·큰 단일수록 어려움
const neighbor = (rng, h) => h <= 2 ? h + 1 : h >= 9 ? h - 1 : h + (rng.chance(.5) ? 1 : -1);
const BASE = {
  // 「슬라임 n마리의 힘이 모두 total. 똑같이 나누면 한 마리는?」 → total ÷ n
  'g3.share.div': { id: 'shareDiv', share: true, gen(rng, d, opt){ const { n, hpEach } = pick(rng, d, opt, 3), total = n * hpEach;
      return { concept: 'g3.share.div', fact: `div:${total},${n}`, d: diff(n, hpEach), prompt: { key: 'q.share.div', args: { n, total } }, n, hpEach, total, answer: hpEach,
        wrongs: [[total * n, 'mul-instead'], [hpEach + 1, 'off-one'], [hpEach - 1, 'off-one'], [n, 'swap-div'], [total + n, 'add-instead']],
        hint1: { key: 'hint.share.div', args: { n, total } }, hint2: { kind: 'groups', n, each: hpEach } }; },
    verify: q => q.answer * q.n === q.total && q.n >= 2 && q.answer >= 1 && q.total <= 96 },
  // 「힘 hpEach짜리 슬라임이 n마리. 모두 합치면?」 → hpEach × n (역방향 묶음)
  'g3.share.mul': { id: 'shareMul', share: true, gen(rng, d, opt){ const { n, hpEach } = pick(rng, d, opt, 3), total = n * hpEach, nb = neighbor(rng, hpEach);
      return { concept: 'g3.share.mul', fact: `mul:${hpEach},${n}`, d: diff(n, hpEach), prompt: { key: 'q.share.mul', args: { n, each: hpEach } }, n, hpEach, total, answer: total,
        wrongs: [[hpEach + n, 'add-instead'], [nb * n, 'table-neighbor'], [total + 10, 'off-ten'], [total - 10, 'off-ten']],
        hint1: { key: 'hint.share.mul', args: { n, each: hpEach } }, hint2: { kind: 'groups', n, each: hpEach } }; },
    verify: q => q.answer === q.n * q.hpEach && q.n >= 2 && q.hpEach >= 1 },
  // 곱셈 빈칸: 「n마리가 똑같이 나눠 한 마리 hpEach. 모두 몇?」(→ total) / 「total을 몇 마리에 나눠 한 마리 hpEach?」(→ n)
  'g3.share.missing': { id: 'shareMissing', share: true, gen(rng, d, opt){ const { n, hpEach } = pick(rng, d, opt, 3), total = n * hpEach; const askN = rng.chance(.5), nb = neighbor(rng, hpEach);
      return askN
        ? { concept: 'g3.share.missing', fact: `miss:n:${total},${hpEach}`, d: diff(n, hpEach) + .05, prompt: { key: 'q.share.missingN', args: { total, each: hpEach } }, n, hpEach, total, answer: n, askN,
            wrongs: [[hpEach, 'swap-factor'], [n + 1, 'off-one'], [n - 1, 'off-one'], [total - hpEach, 'sub-instead']], hint1: { key: 'hint.share.div', args: { n: hpEach, total } }, hint2: { kind: 'groups', n, each: hpEach } }
        : { concept: 'g3.share.missing', fact: `miss:t:${n},${hpEach}`, d: diff(n, hpEach), prompt: { key: 'q.share.missingT', args: { n, each: hpEach } }, n, hpEach, total, answer: total, askN,
            wrongs: [[n, 'swap-factor'], [nb * n, 'table-neighbor'], [hpEach + n, 'add-instead']], hint1: { key: 'hint.share.mul', args: { n, each: hpEach } }, hint2: { kind: 'groups', n, each: hpEach } }; },
    verify: q => q.n * q.hpEach === q.total && (q.askN ? q.answer === q.n : q.answer === q.total) && q.n >= 2 },
  // v2.4 방패병 방패 식 「□ × b = c」(3-1 3단원 곱셈구구로 나눗셈 [4수01-05]) — fixed {b, c} 면 방패의 식 그대로(1학년 g1.missing.add9 와 같은 경로), 없으면 b 2~9·답 2~9(검산). 4학년 변환표는 답 ≤12 — 같은 생성기, 수만 큼.
  'g3.shield.mul': { id: 'shieldMul', gen(rng, d, opt){ const fx = opt && opt.fixed; const hiA = fx ? 12 : rng.next() >= d ? 5 : 9; const b = fx ? fx.b : rng.int(2, 9), ans = fx ? Math.round(fx.c / fx.b) : rng.int(2, hiA), c = fx ? fx.c : b * ans;
      return { concept: 'g3.shield.mul', fact: `shield:${b},${c}`, d: Math.min(1, .15 + (b - 2) / 7 * .4 + (ans - 2) / 10 * .4), prompt: { key: 'q.shield.mul', args: { b, c } }, b, c, answer: ans,
        wrongs: [[c - b, 'sub-instead-mul'], [c, 'equals-answer'], [ans + 1, 'off-one'], [ans - 1, 'off-one'], [c + b, 'add-instead-mul']],
        hint1: { key: 'hint.shield.mul', args: { b, c } }, hint2: b <= 8 && c <= 96 ? { kind: 'groups', n: b, each: ans } : null }; },
    verify: q => q.answer * q.b === q.c && q.b >= 2 && q.answer >= 1 && q.c <= 96 },
};
export const G3SHARE = {};
for (const [k, g] of Object.entries(BASE)) G3SHARE[k] = Object.assign({}, g, { unit: k === 'g3.share.mul' ? 'g3-1-u4' : 'g3-1-u3', max: 96, gen(rng, d, opt){ const q = g.gen(rng, d, opt); q.type = 'calc1'; return q; } });
