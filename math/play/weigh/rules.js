/* 견주기 틀 「저울에 올려 보기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 설계: 핸드오프 kedu/math-play-work/T07_견주기_틀.md · 정본 27 문서 4 · 5절(5-9 · 5-10 · 5-11).
 * 손: 숫자 꼬리표가 달린 자루를 누른다 — 걸음 ① 은 누른 자루가 저울에 올라가고(올려 보기), 걸음 ② 는 누른 자루가 내 답이다(찍기 → 저울이 확인).
 * 묻는 것은 A13 「더 큰 수 · 더 작은 수」 · A14 「가장 큰 수 · 가장 작은 수」 뿐(같다 · 몇 개 더 많은지 · 덧셈 · 뺄셈 · 부등호 없음). 같은 수 둘은 내지 않는다(저울이 평평하게 멎는 판이 없다).
 *   문제 = { cell, nums: [자리 차례대로], ask: 'big' | 'small', answer: 자리 번호, set: [작은 수부터], key }
 * 같은 틀이 뒤에 맡을 낱칸(C09 · D05 · H05 · K05)은 낱칸 번호로 풀을 받게만 둔다(열 개 묶음 그림이 따로 필요하다). */

// ── 낱칸 표(설계서 그대로 · far = 차이 4 이상인 짝의 최대 · big = 8 이나 9 가 든 문제의 최소(코드가 정함 — 「셋 이상」))
export const CELLS = {
  A13: { k: 2, lim: [0, 9], near: 4, far: 2, zero: [1, 2], big: 3, ask: ['big', 'small'] },   // 두 수 비교 — 차이 1 인 짝이 아홉 중 넷 이상
  A14: { k: 3, lim: [0, 9], near: 5, zero: [1, 2], ask: ['big', 'small'] },                   // 세 수 비교 — 이웃한 수가 든 것이 아홉 중 다섯 이상
};
export const IDS = Object.keys(CELLS);

// ── 내가 정한 수치(T07 설계 기본안 — 준호가 반에서 보고 바꾼다)
export const T = {
  SAND_S: { A13: 12, A14: 16 }, SAND_LAST: { A13: 10, A14: 13 },   // 모래가 다 새기까지(생각하는 동안에만 가는 초) · 나들이 셋째 판
  COVER_P: .35, REVEAL_GAP: .7, FOX_P: .25, FOX_S: 4, SURPRISE_P: .25, FAT_P: .3, FAT_X: 1.5,   // 가려진 자루 · 하나 나오는 사이(초) · 여우 · 물고 가기까지(초) · 깜짝 자루 · 뚱뚱한 자루(통과 뒤) · 부푼 크기
  STREAK: 3, HINT_AFTER: 7, TILT_S: 1.1, POUR_GAP: .25, NEAR: { A13: 4, A14: 5 },              // 쿵쿵 가락 · 길잡이 손(초) · 기우는 시간(초) · 한 쌍 쏟아지는 사이(초) · 차이 1 몫
  PER_BOARD: 3, BOARDS: 3, RETRY_GAP: 2,
  SURPRISE_COINS: 3, COIN_PER: 1,                                                               // 깜짝 자루의 덤 · 문제 하나에 동전(코드가 정함 — 앞 틀과 같게)
};
export const INTRO = ['sand', 'cover', 'fox', 'surprise', 'fat', 'streak'];   // 걸음 ② 의 처음 판들은 이 차례로 하나씩
export const ASK = { big: 'big', small: 'small' };

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const pick1 = (a, rnd) => a[Math.floor(rnd() * a.length)];

/** 같은 문제 = 같은 수들(자리 · 물음과 상관없이). */
export const keyOf = set => set.slice().sort((a, b) => a - b).join(',');
export const same = (p, q) => !!p && !!q && p.key === q.key;
/** 그 낱칸의 풀: 서로 다른 수 둘(셋)의 모든 묶음(작은 수부터). 표에 없는 낱칸은 빈 풀. */
export function pool(id){ const c = CELLS[id]; if (!c) return []; const [lo, hi] = c.lim, out = [];
  const go = (from, acc) => { if (acc.length === c.k) { out.push(acc.slice()); return; } for (let v = from; v <= hi; v++) { acc.push(v); go(v + 1, acc); acc.pop(); } };
  go(lo, []); return out; }
/** 이웃한 수(차이 1)가 든 묶음인가 · 가장 작은 사이(A13 은 두 수의 차이). */
export const hasNear = set => { const s = set.slice().sort((a, b) => a - b); return s.some((v, k) => k && v - s[k - 1] === 1); };
export const gap = set => { const s = set.slice().sort((a, b) => a - b); let g = 99; for (let k = 1; k < s.length; k++) g = Math.min(g, s[k] - s[k - 1]); return g; };
/** 답 수: 큰 = 가장 큰 · 작은 = 가장 작은. */
export const ansNum = (set, ask) => ask === 'big' ? Math.max(...set) : Math.min(...set);
/** 답이 이웃 수의 한쪽인가(A14 — 답 바로 옆 수(차이 1)가 같이 있다). */
export const ansNear = (set, ask) => { const a = ansNum(set, ask); return set.includes(a + (ask === 'big' ? -1 : 1)); };
const has89 = set => set.some(v => v >= 8);

/** 묶음 아홉(차례 없음) — 낱칸의 섞는 비율을 맞춘다. */
function compose(id, rnd){ const c = CELLS[id], all = pool(id);
  for (let g = 0; g < 400; g++) { let out;
    if (c.k === 2) { const near = all.filter(s => s[1] - s[0] === 1), far = all.filter(s => s[1] - s[0] >= 4), mid = all.filter(s => s[1] - s[0] >= 2 && s[1] - s[0] <= 3);
      const nN = c.near + Math.floor(rnd() * 2), nF = Math.floor(rnd() * (c.far + 1)); out = [...shuffle(near.slice(), rnd).slice(0, nN), ...shuffle(far.slice(), rnd).slice(0, nF), ...shuffle(mid.slice(), rnd).slice(0, 9 - nN - nF)];
      if (out.length !== 9) continue; if (out.filter(s => s[1] - s[0] >= 4).length > c.far) continue; if (out.filter(has89).length < c.big) continue; }
    else { const adj = all.filter(hasNear), non = all.filter(s => !hasNear(s)), nA = c.near + Math.floor(rnd() * 3); out = [...shuffle(adj.slice(), rnd).slice(0, nA), ...shuffle(non.slice(), rnd).slice(0, 9 - nA)]; }
    const z = out.filter(s => s.includes(0)).length; if (z < c.zero[0] || z > c.zero[1]) continue;
    if (out.filter(hasNear).length < c.near) continue;
    return out; }
  return null; }
/** 판마다의 물음(걸음 ② · 아홉): 첫째 판 first · 둘째 판 다른 물음 · 셋째 판 섞음(둘이 다 있음). */
export function asks(rnd = Math.random, first = 'big'){ const other = first === 'big' ? 'small' : 'big', mix = shuffle(['big', 'small', pick1(['big', 'small'], rnd)], rnd);
  return [first, first, first, other, other, other, ...mix]; }
/** 답의 자리 아홉: A13 왼쪽이 넷~다섯 · A14 자리마다 셋 · 같은 자리 넷 연달아 없음(앞 나들이 끝과도). */
export function seatRow(id, rnd = Math.random, prev = []){ const k = CELLS[id].k;
  for (let g = 0; g < 400; g++) { const s = k === 2 ? (() => { const L = 4 + Math.floor(rnd() * 2); return shuffle([...Array(L).fill(0), ...Array(9 - L).fill(1)], rnd); })() : shuffle([0, 0, 0, 1, 1, 1, 2, 2, 2], rnd);
    if (!run4([...prev.slice(-3), ...s])) return s; }
  return k === 2 ? [0, 1, 0, 1, 0, 1, 0, 1, 0] : [0, 1, 2, 0, 1, 2, 0, 1, 2]; }
const run4 = a => { let r = 1; for (let i = 1; i < a.length; i++) { r = a[i] === a[i - 1] ? r + 1 : 1; if (r >= 4) return true; } return false; };
const run3 = a => { let r = 1; for (let i = 1; i < a.length; i++) { r = a[i] === a[i - 1] ? r + 1 : 1; if (r >= 3) return true; } return false; };
/** 문제 하나를 짓는다: 답 수를 seat 자리에 · 나머지는 남은 자리에 섞어. */
export function make(id, set, ask, seat, rnd = Math.random){ const s = set.slice().sort((a, b) => a - b), a = ansNum(s, ask), rest = shuffle(s.filter(v => v !== a), rnd), nums = [];
  for (let k = 0; k < s.length; k++) nums.push(k === seat ? a : rest.shift());
  return { cell: id, nums, ask, answer: seat, set: s, key: s.join(',') }; }
/** 답 자리(문제에서 다시 셈 — 하네스도 쓴다). */
export const answerOf = p => p.nums.indexOf(ansNum(p.nums, p.ask));

/** 나들이 하나(문제 아홉). history = 앞 나들이(같은 묶음 연달아 · 같은 답 수 셋 · 같은 자리 넷 연달아를 이어서 본다).
 *  opt.small = 막혔을 때 차이가 큰 묶음부터 · opt.first = 첫째 판의 물음(앞 나들이 마지막으로 센 판이 「큰」이면 「작은」부터 — 연달은 두 판에 늘 둘이 다 있게). */
export function deal(id, history = [], rnd = Math.random, opt = {}){ const c = CELLS[id]; if (!c) return [];
  const prev = history[history.length - 1], prevAns = history.slice(-2).map(p => ansNum(p.nums, p.ask));
  for (let g = 0; g < 400; g++) { const sets = compose(id, rnd); if (!sets) continue; const ak = asks(rnd, opt.first || 'big');
    let order = shuffle(sets.slice(), rnd); if (opt.small) order = order.map(s => [s, gap(s) + rnd() * .5]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
    if (prev && keyOf(order[0]) === prev.key) continue;
    const an = order.map((s, k) => ansNum(s, ak[k])); if (run3([...prevAns, ...an])) continue;
    if (c.k === 3 && order.filter((s, k) => ansNear(s, ak[k])).length < 3) continue;
    const seats = seatRow(id, rnd, history.map(p => p.answer));
    return order.map((s, k) => make(id, s, ak[k], seats[k], rnd)); }
  return []; }
/** 걸음 ① 판: A13 은 「더 큰 수」만 · A14 는 「가장 큰 수」 둘 + 「가장 작은 수」 하나(마지막 문제). 수와 답 자리는 그대로(답 수만 그 자리로 옮긴다). */
export function handFix(q, start){ return q.map((p, k) => { if (k < start || k >= start + T.PER_BOARD) return p; const ask = CELLS[p.cell].k === 3 && k === start + T.PER_BOARD - 1 ? 'small' : 'big';
  if (p.ask === ask) return { ...p, hand: true }; return { ...make(p.cell, p.set, ask, p.answer, () => .5), nums: swapIn(p, ask), hand: true, retry: !!p.retry }; }); }
/** 같은 자리에 새 물음의 답 수가 오게 두 수를 바꾼다(다른 수의 자리는 그대로). */
function swapIn(p, ask){ const a = ansNum(p.set, ask), n = p.nums.slice(), at = n.indexOf(a); [n[at], n[p.answer]] = [n[p.answer], n[at]]; return n; }
/** 깨끗하지 못했던 문제를 「문제 둘을 사이에 두고」 다시(같은 수들 · 같은 물음 · 자리는 새로) — 밀어 넣지 않고 **뒤의 문제 하나와 바꾼다**.
 *  마지막 문제(아홉째)는 바꾸지 않는다. 바꿀 자리는 같은 물음의 자리(첫째 · 둘째 판은 한 물음뿐이다) — 셋째 판(섞음)은 바꿔도 둘이 다 있으면 된다.
 *  앞뒤로 같은 묶음 · 같은 답 수 셋 연달아 · 같은 자리 넷 연달아가 되지 않게 · 낱칸의 섞는 비율(0 · 이웃 수)이 무너지지 않게. 그런 자리가 없으면 다시 내지 않는다. */
export function requeue(q, i, rnd = Math.random){ const p = q[i], c = p && CELLS[p.cell]; if (!c) return q.slice();
  for (const strict of [true, false]) for (let at = i + T.RETRY_GAP + 1; at < q.length - 1; at++) { if (q[at].retry) continue; const b = Math.floor(at / T.PER_BOARD), inMix = b === T.BOARDS - 1 && !q[at].hand;
    if (q[at].ask !== p.ask && !inMix) continue;
    for (const seat of shuffle(range(0, c.k - 1).filter(s => s !== p.answer), rnd).concat([p.answer])) { const a = q.slice(); a[at] = { ...make(p.cell, p.set, p.ask, seat, rnd), retry: true, hand: q[at].hand };
      if (same(a[at - 1], a[at]) || same(a[at], a[at + 1])) continue;
      if (inMix) { const mix = a.slice(b * 3, b * 3 + 3).map(x => x.ask); if (!mix.includes('big') || !mix.includes('small')) continue; }
      if (run3(a.map(x => ansNum(x.nums, x.ask))) || run4(a.map(x => x.answer))) continue;
      const z = a.filter(x => x.set.includes(0)).length, zq = q.filter(x => x.set.includes(0)).length, nr = a.filter(x => hasNear(x.set)).length, nq = q.filter(x => hasNear(x.set)).length; if (z < Math.min(1, zq) || (strict && nr < Math.min(c.near, nq))) continue;   /* 섞는 비율이 무너지지 않게(0 은 늘 남김 · 이웃 수는 먼저 지키고, 그런 자리가 없으면 다시 내는 쪽을 앞세움) */
      return a; } }
  return q.slice(); }

/** 저울: 큰 쪽이 내려간다(a = 왼 접시 수 · b = 오른 접시 수 · 같은 수는 없다). */
export const tilt = (a, b) => (a > b ? 'left' : 'right');
/** 찍은 자루가 이기는가: 큰 = 더 무거움 · 작은 = 더 가벼움. */
export const wins = (mine, other, ask) => (ask === 'big' ? mine > other : mine < other);
/** A14 의 맞은편 차례: 가려진 자루가 이미 접시에 나와 있으면 그것 먼저 · 그다음 자리 차례(왼쪽부터). out = 물러난 자루들. */
export const order = (p, pick, cover = -1, out = []) => { const rest = p.nums.map((_, k) => k).filter(k => k !== pick && !out.includes(k)); return cover >= 0 && rest.includes(cover) ? [cover, ...rest.filter(k => k !== cover)] : rest; };
/** 확인 차례 [{ vs: 맞은편 자리, win }] — 진 데서 멈춘다(A13 은 하나). */
export function bouts(p, pick, cover = -1, out = []){ const res = []; for (const k of order(p, pick, cover, out)) { const w = wins(p.nums[pick], p.nums[k], p.ask); res.push({ vs: k, win: w }); if (!w) break; } return res; }
/** 판정: 찍은 자리가 답이면 fit. */
export const judge = (p, pick) => (pick === p.answer ? 'fit' : 'off');
/** 깨끗한 문제 = 물러난 자루 없음 · 길잡이 손이 뜨기 전 · 시간을 놓치지 않음. 헛누름 · 손님을 눌러 다시 들은 것 · 여우를 쫓은 것 · 가려진 자루를 기다린 것은 깨끗함 그대로. */
export const clean = r => !!r && !(r.retreat || r.hinted || r.missed);
/** 쏟아지는 차례(짝지어 번갈아 · 남는 것은 뒤에): ['L','R','L','R',…] — a0 · b0 = 이미 접시에 나와 있는 수(가려진 자루). */
export function pour(a, b, a0 = 0, b0 = 0){ const out = []; let l = a0, r = b0; while (l < a || r < b) { if (l < a) { out.push('L'); l++; } if (r < b) { out.push('R'); r++; } } return out; }
/** 가려진 자루에서 하나씩 나오는 차례(0 이면 아무것도 안 나온다 — 천만 걷힌다). */
export const reveal = n => Array.from({ length: Math.max(0, n) }, (_, i) => i + 1);

/** 그 판의 사건. evBoards = 이 낱칸에서 앞서 사건이 붙은 판 수 · opt = { passed, calm, hand, fatShown }.
 *  손으로 하는 판(걸음 ①)은 사건 없음. 처음 판들은 INTRO 차례로 하나씩(새는 모래 자루는 한 번 나온 뒤로 늘) · 그 뒤는 판마다 하나.
 *  뚱뚱한 자루는 통과한 뒤만 — 통과 전에는 그 차례를 건너뛰고(모래만 남는 판이 없게), 통과한 뒤 첫 사건 판에 한 번 보여 준다(fatShown).
 *  ?calm = 모래 · 가려진 자루 · 여우 · 뚱뚱한 자루 없음. 사건은 수를 바꾸지 않는다(문제는 deal 이 정하고 사건은 꾸밈만 고른다). */
export function events(evBoards, rnd = Math.random, opt = {}){ const ev = { sand: false, cover: false, fox: false, surprise: false, fat: false, streak: true, intro: null };
  if (opt.hand) return { ...ev, none: true };
  const list = INTRO.filter(k => k !== 'fat'), i = evBoards - (opt.fatShown ? 1 : 0);
  if (opt.passed && !opt.fatShown && evBoards > 0) { ev.intro = 'fat'; ev.fat = true; ev.sand = true; }
  else if (i < list.length) { const k = list[i]; ev.intro = k; ev[k] = true; if (evBoards > 0) ev.sand = true; }
  else { ev.sand = true; const w = [['cover', T.COVER_P], ['fox', T.FOX_P], ['surprise', T.SURPRISE_P], ['fat', opt.passed ? T.FAT_P : 0]], sum = w.reduce((a, x) => a + x[1], 0); let r = rnd() * Math.max(1, sum);
    for (const [name, p] of w) { if (r < p) { ev[name] = true; break; } r -= p; } }
  if (opt.calm) { ev.sand = false; ev.cover = false; ev.fox = false; ev.fat = false; }
  return ev; }
/** 모래가 다 새기까지(초): 나들이 셋째 판이 조금 빠르다. */
export const sandS = (id, board) => (board >= T.BOARDS - 1 ? T.SAND_LAST : T.SAND_S)[id] || T.SAND_S.A13;
/** 가려진 자루: 어느 자루인지는 답과 상관없이(A13 둘 가운데 · A14 는 접시 위에 놓인 양 끝 둘 가운데 — 상자가 그 아래 접시로 나온다). */
export const coverAt = (p, rnd = Math.random) => (p.nums.length === 2 ? Math.floor(rnd() * 2) : rnd() < .5 ? 0 : 2);
/** 여우 · 깜짝 자루: 답과 상관없이 고르게. */
export const foxAt = (p, rnd = Math.random) => Math.floor(rnd() * p.nums.length);
export const surpriseAt = (p, rnd = Math.random) => Math.floor(rnd() * p.nums.length);
/** 뚱뚱한 자루 = 가장 작은 수의 자루(크기에 속지 않기 — 통과 뒤에만). */
export const fatAt = p => p.nums.indexOf(Math.min(...p.nums));
/** 사건을 입힌 문제(하네스가 「사건이 수를 바꾸지 않음」을 본다): 꾸밈 자리만 더하고 수 · 물음 · 답은 그대로. */
export const dress = (p, ev, rnd = Math.random) => ({ ...p, nums: p.nums.slice(), cover: ev.cover ? coverAt(p, rnd) : -1, fox: ev.fox ? foxAt(p, rnd) : -1, surprise: ev.surprise ? surpriseAt(p, rnd) : -1, fat: ev.fat ? fatAt(p) : -1 });

/** 띠 · 말풍선의 말(교과서 말 그대로 · 토씨는 say.js 의 eun). */
export const question = p => (CELLS[p.cell].k === 2 ? (p.ask === 'big' ? '더 큰 수는?' : '더 작은 수는?') : (p.ask === 'big' ? '가장 큰 수는?' : '가장 작은 수는?'));
export function closing(p, eun){ const a = p.nums[p.answer];
  if (CELLS[p.cell].k === 3) return (p.ask === 'big' ? '가장 큰 수는 ' : '가장 작은 수는 ') + a;
  const o = p.nums[1 - p.answer]; return `${a}${eun(a)} ${o}보다 ${p.ask === 'big' ? '큽니다' : '작습니다'}`; }

/** 한 문제를 봇이 끝까지(하네스용): 아무 자루나 찍고 · 지면 물러남 → 남은 것 가운데 다시(A13 은 남은 하나를 손님이 싣는다). → { ok, tries } */
export function play(p, rnd = Math.random){ const out = []; let tries = 0;
  for (let g = 0; g < 10; g++) { const left = p.nums.map((_, k) => k).filter(k => !out.includes(k)); if (left.length === 1) return { ok: left[0] === p.answer, tries, last: true };
    const pk = pick1(left, rnd); tries++; const bs = bouts(p, pk, -1, out); if (bs.every(b => b.win)) return { ok: judge(p, pk) === 'fit', tries }; out.push(pk); if (p.nums.length === 2) return { ok: true, tries, last: true }; }
  return { ok: false, tries }; }
