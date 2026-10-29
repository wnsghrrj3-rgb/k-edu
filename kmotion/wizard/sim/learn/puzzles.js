// 길 구간 수학 퍼즐(07 문서 상황 D · 09 문서 9행) — 숫자 다리(모으기) · 크기 문(비교) · 규칙 징검다리(규칙)
// 게이지 없음(조작형) · 3번 틀리면 정답을 천천히 보여 주고 통과(숙달도에는 오답 1번, 보상 없음)
// 학년 폭: 1학년 9 이내 · 2학년 20 이내 · 3학년↑ 50 이내(규칙은 2·3·5 걸음)
import { eul, iga } from './josa.js';
const span = g => g <= 1 ? 9 : g <= 2 ? 20 : 50;
export const PUZZLE_CONCEPT = { 'number-bridge': 'g1.compose9', 'size-gate': 'g1.compare', 'rule-stones': 'g1.pattern', 'mushroom-add': 'g1.add.expr9', 'crystal-count': 'g1.count.tens' };

// v2.4 spec = 학년 변환표 puzzle 줄(gradeTable.puzzleSpec) — bridge/mushroom 'mul' 이면 두 돌의 곱·버섯 점의 곱, ruleMul 이면 「배가 되는 규칙」 섞임. 1학년({})은 rng 호출까지 그대로(골든 불변).
export function makePuzzle(type, rng, grade = 1, opt = {}, spec = {}){
  const N = span(grade);
  if (type === 'number-bridge' && spec.bridge === 'mul') {
    // 「곱해서 T가 되는 두 돌」 — 돌 3개(2~9) 중 2개, 곱이 T인 쌍은 하나뿐(c ∉ {a, b} 면 a·c ≠ a·b, b·c ≠ a·b)
    const a = rng.int(2, 9); let b = rng.int(2, 9); if (b === a) b = a < 9 ? a + 1 : a - 1; const T = a * b;
    let c = rng.int(2, 9); for (let i = 0; i < 9 && (c === a || c === b); i++) c = c < 9 ? c + 1 : 2;
    const slots = rng.shuffle([a, b, c]); const ans = [slots.indexOf(a), slots.indexOf(b)].sort();
    return { type, id: `pz-bridge-x${T}-${a}-${b}-${c}`, concept: 'g3.share.mul', fact: `bridge:x${T}:${a}*${b}`, d: .25 + T / 81 * .5, need: 2, target: T, op: '×',
      prompt: { key: 'pz.bridge.mul', args: { t: T, j: iga(T) } }, stones: slots.map((n, s) => ({ slot: s, num: n })), answer: ans,
      hint1: { key: 'pz.bridge.mul.hint', args: { a: Math.min(a, b), t: T, j: eul(T) } } };
  }
  if (type === 'number-bridge') {
    // 「T를 만드는 두 돌」 돌 3개 중 2개 — 정답 쌍은 하나뿐
    const T = opt.target && opt.target <= N ? opt.target : rng.int(Math.min(5, N), N);
    let a, b, c; for (let i = 0; i < 40; i++) { a = rng.int(1, T - 1); b = T - a; if (a === b) continue;
      c = rng.int(1, Math.min(N, T + 3)); if (c === a || c === b || a + c === T || b + c === T) continue; break; }
    if (a === b) { a = Math.max(1, a - 1); b = T - a; } if (c === a || c === b || a + c === T || b + c === T) c = T + 2 > N ? Math.max(1, T - a - b) || 1 : T + 2;
    const slots = rng.shuffle([a, b, c]); const ans = [slots.indexOf(a), slots.indexOf(b)].sort();
    return { type, id: `pz-bridge-${T}-${a}-${b}-${c}`, concept: PUZZLE_CONCEPT[type], fact: `bridge:${T}:${a}+${b}`, d: .25 + T / N * .45, need: 2, target: T,
      prompt: { key: 'pz.bridge', args: { t: T, j: eul(T) } }, stones: slots.map((n, s) => ({ slot: s, num: n })), answer: ans,
      hint1: { key: 'pz.bridge.hint', args: { a: Math.min(a, b), t: T } } };
  }
  if (type === 'size-gate') {
    // 「더 큰(작은) 수의 문으로」 — 두 문 L/R, 자리 = 몸 위치(I1)
    const bigger = opt.bigger != null ? !!opt.bigger : rng.chance(.7);
    let a = rng.int(1, N), b = rng.int(1, N); if (a === b) b = a < N ? a + 1 : a - 1;
    const left = rng.chance(.5) ? a : b, right = left === a ? b : a; const ans = bigger ? (left > right ? 'L' : 'R') : (left < right ? 'L' : 'R');
    return { type, id: `pz-gate-${left}-${right}-${bigger ? 'big' : 'small'}`, concept: PUZZLE_CONCEPT[type], fact: `gate:${left},${right}`, d: .2 + Math.min(1, Math.abs(left - right) <= 2 ? .5 : .2), need: 1, bigger,
      prompt: { key: bigger ? 'pz.gate.big' : 'pz.gate.small', args: {} }, gate: { left, right }, answer: ans,
      hint1: { key: 'pz.gate.hint', args: { a: Math.max(left, right), b: Math.min(left, right), j: iga(Math.max(left, right)) } } };
  }
  if (type === 'rule-stones' && spec.ruleMul && rng.chance(spec.ruleMul)) {
    // 배가 되는 규칙(3학년↑): 3, 6, 12, □ — ×2 또는 ×3, 네 번째 돌까지 N 안
    const m = rng.pick([2, 3]); const start = rng.int(1, Math.max(1, Math.floor(N / (m * m * m)))); const seq = [start, start * m, start * m * m], ans = start * m * m * m;
    const wrongs = []; for (const w of rng.shuffle([seq[2] + (seq[2] - seq[1]), ans + 1, ans - 1, ans + seq[0], seq[2] + m])) { if (w > 0 && w !== ans && !wrongs.includes(w) && !seq.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? ans : wrongs[wi++]);
    return { type, id: `pz-rule-${start}x${m}`, concept: 'g3.pattern', fact: `rule:${start}*${m}`, d: .3 + (m - 2) * .3, need: 1, seq, step: null, mul: m,
      prompt: { key: 'pz.rule', args: { s: seq.join(', ') } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.rule.mul.hint', args: { d: m } } };
  }
  if (type === 'rule-stones') {
    // 2, 4, 6, □ — 앞 돌 3개 보여 주고 다음 돌 고르기(3개 중 1)
    const steps = grade <= 1 ? [1, 2] : grade <= 2 ? [2, 3, 5] : [2, 3, 5, 10]; const dlt = rng.pick(steps);
    const start = rng.int(1, Math.max(1, N - dlt * 3)); const seq = [start, start + dlt, start + dlt * 2], ans = start + dlt * 3;
    const wrongs = []; for (const w of rng.shuffle([ans + 1, ans - 1, ans + dlt, ans - dlt - dlt, ans + 2])) { if (w > 0 && w !== ans && !wrongs.includes(w) && !seq.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? ans : wrongs[wi++]);
    return { type, id: `pz-rule-${start}-${dlt}`, concept: PUZZLE_CONCEPT[type], fact: `rule:${start}+${dlt}`, d: .2 + dlt / 10 * .5, need: 1, seq, step: dlt,
      prompt: { key: 'pz.rule', args: { s: seq.join(', ') } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.rule.hint', args: { d: dlt } } };
  }
  if (type === 'mushroom-add' && spec.mushroom === 'mul') {
    // 버섯 점 곱하기 문: 점 a·b(각 2~4)의 곱 = 문 번호(4~16) — 오답 = 더한 수(a+b)·곱 ±1·한 번 덜 더함
    const a = rng.int(2, 4), b = rng.int(2, 4), T = a * b, hi = 16;
    const wrongs = []; for (const w of rng.shuffle([a + b, T + 1, T - 1, T - a, T + a])) { if (w >= 1 && w <= hi && w !== T && !wrongs.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    while (wrongs.length < 2) { const w = rng.int(1, hi); if (w !== T && !wrongs.includes(w)) wrongs.push(w); }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? T : wrongs[wi++]);
    return { type, id: `pz-mush-x${a}-${b}`, concept: 'g3.share.mul', fact: `mush:${a}*${b}`, d: .15 + T / 16 * .45, need: 1, target: T, mush: { a, b }, op: '×',
      prompt: { key: 'pz.mush.mul', args: { a, b } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.mush.mul.hint', args: { a, b, j: eul(a) } } };
  }
  if (type === 'mushroom-add') {
    // 버섯 점 더하기 문(09 문서 9행, 1-2 버섯 마을 길): 버섯 두 송이의 점(a·b) 합 = 문 번호 — 문 3개 중 1(점을 세어 더한다, 글자 없음)
    const hi = Math.min(N, 9), a = rng.int(1, 4), b = rng.int(1, Math.min(4, hi - a)), T = a + b;
    const wrongs = []; for (const w of rng.shuffle([T + 1, T - 1, Math.max(a, b), a + b + 2, Math.abs(a - b)])) { if (w >= 1 && w <= hi && w !== T && !wrongs.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    while (wrongs.length < 2) { const w = rng.int(1, hi); if (w !== T && !wrongs.includes(w)) wrongs.push(w); }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? T : wrongs[wi++]);
    return { type, id: `pz-mush-${a}-${b}`, concept: PUZZLE_CONCEPT[type], fact: `mush:${a}+${b}`, d: .15 + T / 9 * .45, need: 1, target: T, mush: { a, b },
      prompt: { key: 'pz.mush', args: { a, b } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: 'pz.mush.hint', args: { a, b } } };
  }
  if (type === 'crystal-count') {
    // 수정 묶음 세기(09 문서 9행, 1-3 반딧불 동굴): 벽 수정이 10개씩 묶음 n개 + 낱개 m개 → 모두 몇 개? 돌 3개 중 1
    // 1학년 10~49(50까지의 수) · 2학년 10~99 · 3학년↑ 백 묶음 1~4 더해 100~499. 오답 = 자리 바꿈(m·n)·묶음 ±1·낱개 ±1 — 「묶음을 낱개처럼 세기」 오개념
    const hund = grade >= 3 ? rng.int(1, 4) : 0, tens = rng.int(1, grade <= 1 ? 4 : 9), ones = rng.int(grade <= 1 ? 1 : 0, 9), T = hund * 100 + tens * 10 + ones;
    const cands = [hund * 100 + ones * 10 + tens, T + 10, T - 10, T + 1, T - 1, hund * 100 + tens + ones];
    const wrongs = []; for (const w of rng.shuffle(cands.slice(0, 3)).concat(cands.slice(3))) { if (w > 0 && w !== T && !wrongs.includes(w)) wrongs.push(w); if (wrongs.length === 2) break; }
    const slot = rng.int(0, 2), nums = []; let wi = 0; for (let s = 0; s < 3; s++) nums.push(s === slot ? T : wrongs[wi++]);
    return { type, id: `pz-count-${T}`, concept: PUZZLE_CONCEPT[type], fact: `count:${T}`, d: .2 + tens / 9 * .3 + (hund ? .2 : 0), need: 1, target: T, bundle: { hund, tens, ones },
      prompt: { key: hund ? 'pz.count3' : 'pz.count', args: { h: hund, t: tens, o: ones } }, stones: nums.map((n, s) => ({ slot: s, num: n })), answer: [slot],
      hint1: { key: hund ? 'pz.count3.hint' : 'pz.count.hint', args: { h: hund, t: tens, o: ones, tt: tens * 10 } } };
  }
  throw new Error('퍼즐 종류 없음: ' + type);
}
export function verifyPuzzle(p){
  if (p.type === 'number-bridge') { const n = p.stones.map(s => s.num), f = p.op === '×' ? (x, y) => x * y : (x, y) => x + y; let pairs = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (f(n[i], n[j]) === p.target) pairs++; return pairs === 1 && f(n[p.answer[0]], n[p.answer[1]]) === p.target; }
  if (p.type === 'size-gate') { const { left, right } = p.gate; return left !== right && ((p.bigger ? left > right : left < right) ? 'L' : 'R') === p.answer; }
  if (p.type === 'rule-stones') { const n = p.stones.map(s => s.num), nx = p.mul ? p.seq[2] * p.mul : p.seq[2] + p.step; return n.filter(x => x === nx).length === 1 && n[p.answer[0]] === nx; }
  if (p.type === 'mushroom-add') { const n = p.stones.map(s => s.num), T = p.op === '×' ? p.mush.a * p.mush.b : p.mush.a + p.mush.b; return T === p.target && n.filter(x => x === T).length === 1 && n[p.answer[0]] === T; }
  if (p.type === 'crystal-count') { const n = p.stones.map(s => s.num), b = p.bundle, T = b.hund * 100 + b.tens * 10 + b.ones; return T === p.target && n.filter(x => x === T).length === 1 && n[p.answer[0]] === T; }
  return false;
}
