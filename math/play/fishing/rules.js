/* 낚시 섬(3D, N03) 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다).
 * 해가 지기 전에 통 셋을 딱 채워 배에 싣는다. 물고기 등에 수가 있고, 통 팻말의 수(남은 칸)만큼 모은다.
 * 딱 맞으면 뚜껑이 닫히고 다음 통 · 넘치면 통이 기우뚱, 물고기가 도로 뛰어든다(통은 그대로) · 모자라면 더 낚는다.
 * 끝의 셈: 실은 통의 수를 모두 더한다(「오늘 낚은 물고기는 모두 몇 마리?」 6 + 9 + 7 = ?).
 * 섞는 것(판마다 다름): 시계 = 해넘이(늘) · 갈매기 / 손 = 빠른 물고기 떼 · 큰 물고기 / 궁금함 = 황금 물고기 / 수 = 복어(+1) · 게(−1) / 손맛 = 불꽃.
 * 처음 여섯 판은 새것을 하나씩(갈매기 → 떼 → 황금 → 복어 → 게 → 큰 물고기), 그 뒤엔 섞는다. 놓쳐도(해가 져도) 어려워지지 않는다(다 실은 판 수로만 오른다).
 * 설계: 핸드오프 kedu/math-play-work/N03_낚시섬.md */

export const TUBS = 3;
// ── 내가 정한 수치(준호가 해 보고 바꾼다)
/** 걸음: 다 실은 판 수로 오른다. tub = 통 팻말 범위 · fish = 물고기 수 최대 · n = 화면의 물고기 수 · budget = 해가 지기까지(생각하는 시간, 초) */
export const STEPS = [
  { at: 0, tub: [4, 6], fish: 3, n: 5, budget: 95 },
  { at: 2, tub: [6, 10], fish: 5, n: 6, budget: 90 },
  { at: 4, tub: [10, 15], fish: 9, n: 7, budget: 100 },
  { at: 7, tub: [15, 20], fish: 9, n: 8, budget: 110 } ];
export const MIX = {
  FIRST: { gull: 1, school: 2, gold: 3, puffer: 4, crab: 5, big: 6 },     // 처음 보이는 판(다 실은 판 수)
  P: { gull: .4, school: .4, gold: .35, puffer: .4, crab: .3, big: .3 },  // 그 뒤 섞일 확률
  EXTRA_MAX: 3,                 // 한 판에 섞이는 것 최대
  HELP_P: .55,                  // 남은 칸에 딱 맞는 물고기가 섞여 나올 확률
  KIND_P: { gold: .12, puffer: .16, crab: .12, big: .14 },   // 그 판에 켜진 별난 물고기가 한 마리 나올 확률
  BIG_TAPS: 3,                  // 큰 물고기는 세 번 당겨야 올라온다
  SCHOOL: [5, 7],               // 떼의 물고기 수
  GULL: { every: [14, 24], land: 7 },   // 갈매기: 몇 초마다 날아오고 · 내려앉기까지(그동안 누르면 쫓음)
  STREAK_MAX: 4 };

const R = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const stepOf = trips => { let s = 0; STEPS.forEach((x, i) => { if (trips >= x.at) s = i; }); return s; };

/** 이번 판의 사건. 해넘이(시계)는 늘 있다. 처음 보이는 판에는 그것 하나만 새로. */
export function event(trips, rnd = Math.random, opt = {}){ const F = MIX.FIRST, no = new Set(opt.no || []), keys = Object.keys(F), ev = { sunset: true };   /* opt.no = 모형이 없어 못 내는 사건 */
  const first = keys.find(k => trips === F[k]); if (first) { if (!no.has(first)) ev[first] = true; return ev; }
  let n = 0; for (const k of shuffle(keys.filter(k => !no.has(k)), rnd)) if (trips > F[k] && n < MIX.EXTRA_MAX && rnd() < MIX.P[k]) { ev[k] = true; n++; }
  return ev; }

/** 한 판: { tubs:[수×3], step, fishMax, n, budget, ev }. opt.prev = 앞 판(같은 통 셋이 연달아 안 나오게). */
export function trip(trips, rnd = Math.random, opt = {}){ const step = stepOf(trips), S = STEPS[step]; let tubs, guard = 0;
  do { tubs = Array.from({ length: TUBS }, () => R(rnd, S.tub[0], S.tub[1])); } while (++guard < 10 && ((new Set(tubs).size < 2) || (opt.prev && opt.prev.tubs.join() === tubs.join())));
  return { tubs, step, fishMax: S.fish, n: S.n, budget: S.budget, ev: event(trips, rnd, opt) }; }

/** 물고기가 통에 들어가면 몇이 되나 — 황금은 남은 만큼 딱, 복어는 하나 부풂. 게는 물고기가 아니라 통에서 집어 간다(null). */
export const worth = (f, left) => f.kind === 'crab' ? null : f.kind === 'gold' ? left : f.kind === 'puffer' ? f.v + 1 : f.v;
/** 낚아서 통에 넣는다(남은 칸 left) → { kind:'fit'|'more'|'over', w(들어가는 수), left(뒤의 남은 칸) }. 넘치면 통은 그대로. */
export function land(left, f){ const w = worth(f, left); if (w == null) return { kind: 'crab', w: 0, left }; if (w > left) return { kind: 'over', w, left }; return { kind: w === left ? 'fit' : 'more', w, left: left - w }; }
/** 게: 통에서 마지막에 넣은 물고기 하나를 집어 간다 → 남은 칸이 그만큼 는다. fill = 통에 든 수들. → 집어 간 수(없으면 0) */
export const crabTake = fill => fill.length ? fill.pop() : 0;
/** 갈매기도 집어 가면 한 마리(가장 작은 것) — 팻말 +그 수. */
export function gullTake(fill){ if (!fill.length) return 0; let i = 0; fill.forEach((v, j) => { if (v < fill[i]) i = j; }); return fill.splice(i, 1)[0]; }

/** 새 물고기 하나(남은 칸 left 를 보고). 그 판에 켜진 별난 물고기가 가끔. 남은 칸에 딱 맞는 수가 자주 섞인다. */
export function spawn(left, t, onScreen = [], rnd = Math.random, opt = {}){ const mx = t.fishMax, ev = t.ev, r = rnd(), K = MIX.KIND_P; let acc = 0;
  if (ev.gold && r < (acc += K.gold) && !onScreen.some(f => f.kind === 'gold')) return { kind: 'gold', v: 0 };
  if (ev.crab && r < (acc += K.crab) && opt.filled && !onScreen.some(f => f.kind === 'crab')) return { kind: 'crab', v: 0 };
  if (ev.puffer && r < (acc += K.puffer)) { const v = left >= 2 && rnd() < .6 ? Math.min(mx, left - 1) : R(rnd, 1, Math.max(1, mx - 1)); return { kind: 'puffer', v }; }
  if (ev.big && r < (acc += K.big) && !onScreen.some(f => f.kind === 'big')) return { kind: 'big', v: Math.max(2, mx - R(rnd, 0, Math.min(2, mx - 2))) };
  if (left >= 1 && left <= mx && rnd() < MIX.HELP_P && !onScreen.some(f => f.kind === 'plain' && f.v === left)) return { kind: 'plain', v: left };
  return { kind: 'plain', v: R(rnd, 1, mx) }; }
/** 빠른 떼: 한꺼번에 지나가는 물고기 수들 — 그 안에 남은 칸에 들어가는 것이 꼭 하나는 있다. */
export function school(left, t, rnd = Math.random){ const n = R(rnd, MIX.SCHOOL[0], MIX.SCHOOL[1]), out = Array.from({ length: n }, () => R(rnd, 1, t.fishMax)); if (!out.some(v => v <= left) && left > 0) out[R(rnd, 0, n - 1)] = Math.min(left, t.fishMax); return out; }
/** 막힘 방지: 화면 물고기 가운데 남은 칸에 들어갈 것(넘치지 않는 것)이 없으면 하나를 바꿀 수(아니면 null). */
export function unstick(left, t, fish){ if (left <= 0 || fish.some(f => f.kind !== 'crab' && worth(f, left) <= left)) return null; return Math.min(left, t.fishMax); }
/** 끝의 셈: 실은 통의 수를 모두 더한다 → { sum, picks(셋, 하나만 맞음) } */
export function total(loaded, rnd = Math.random){ const sum = loaded.reduce((a, b) => a + b, 0), near = shuffle([sum - 2, sum - 1, sum + 1, sum + 2].filter(n => n > 0), rnd).slice(0, 2); return { sum, picks: shuffle([sum, ...near], rnd) }; }

/** 한 판을 끝까지 돌려 본다(하네스·봇용). choose(left, fish[]) → 낚을 물고기 자리(또는 -1 = 아무거나). → { landed:[실은 통], overs, crabs, ok } */
export function play(t, choose, rnd = Math.random){ let overs = 0, crabs = 0, guard = 0; const landed = [];
  for (const cap of t.tubs) { let left = cap; const fill = [], fish = []; while (fish.length < t.n) fish.push(spawn(left, t, fish, rnd, { filled: fill.length > 0 }));
    while (left > 0 && ++guard < 2000) { const u = unstick(left, t, fish); if (u != null) fish[0] = { kind: 'plain', v: u };
      let i = choose(left, fish); if (!(i >= 0 && i < fish.length)) i = fish.findIndex(f => f.kind !== 'crab' && worth(f, left) <= left); const f = fish.splice(i, 1)[0];
      if (f.kind === 'crab') { const v = crabTake(fill); left += v; crabs++; } else { const o = land(left, f); if (o.kind === 'over') { overs++; fish.push(f); } else { fill.push(o.w); left = o.left; } }
      while (fish.length < t.n) fish.push(spawn(left, t, fish, rnd, { filled: fill.length > 0 })); }
    landed.push(cap); }
  return { landed, overs, crabs, ok: guard < 2000 }; }
