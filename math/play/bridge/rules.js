/* 다리 길 「10 만들기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다).
 * 한 번의 길: 끊어진 다리 셋(칸은 늘 열 개, 이미 놓인 판자 5~9). 앤은 떠날 때 판자 뗏목 넷을 끌고 간다 — 세 틈에 딱 맞는 셋 + 덤 하나. 뗏목은 그게 전부다.
 * 딱 맞으면 건넌다 · 넘치면 건너되 남는 판자는 물에 떨어져 사라진다 · 모자라면 놓은 판자는 남고 뗏목을 더 써야 한다.
 * 쓸 수 있는 뗏목이 없으면(남은 칸보다 작은 게 없으면) 낱 판자가 한 장씩 떠내려온다 — 막히지 않는다.
 * 틈에는 수가 적혀 있다(빈 칸 수). 그 수만큼 판자를 놓는다. 셋을 다 이으면 「이번 길에 놓은 판자는 모두 몇 장」을 고른다(세 수의 합).
 * 설계: 핸드오프 kmotion/math-wizard/25_수학놀이터_네곳_설계_v1.md 3절 */
export const SLOTS = 10;                                   // 다리 칸(10 만들기)
// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const TUNE = { GAPS: 3, NEED: [1, 2, 3, 4, 5], SPARE: [1, 2], FIRST_NEED: 2 };   // 틈 수 · 모자란 수 후보(한 길 안에서 서로 다름) · 덤 뗏목 크기 · 맨 처음 길 첫 틈

const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** 한 번의 길: { gaps:[{ have, need }×3], cargo:[뗏목 넷, 순서 섞임], spare }. opt.first = 맨 처음 길(첫 틈이 둘) · opt.prev = 바로 앞 길(같은 길이 연달아 안 나오게). */
export function voyage(rnd = Math.random, opt = {}){
  let needs, tries = 0; const G = opt.gaps || TUNE.GAPS;
  do { needs = shuffle(TUNE.NEED.slice(), rnd).slice(0, G);
    if (opt.first) { needs = needs.filter(n => n !== TUNE.FIRST_NEED).slice(0, G - 1); needs.unshift(TUNE.FIRST_NEED); }
  } while (opt.prev && ++tries < 8 && needs.join() === opt.prev.gaps.map(g => g.need).join());
  const spare = TUNE.SPARE[Math.floor(rnd() * TUNE.SPARE.length)], gaps = needs.map(need => ({ have: SLOTS - need, need, slots: SLOTS }));
  if (opt.long) { const li = opt.longAt != null ? opt.longAt : 1 + Math.floor(rnd() * (G - 1)), g = gaps[li], parts = split(g.need + SLOTS, g.need, rnd); Object.assign(g, { need: g.need + SLOTS, slots: LONG.SLOTS, parts });   /* 스무 칸: 첫 열 칸에 g.need 가 비고, 그다음 열 칸은 통째로 빔 */
    const rest = gaps.filter(x => x !== g).map(x => x.need); return { gaps, cargo: shuffle([...rest, ...parts, spare], rnd), spare, long: li }; }
  return { gaps, cargo: shuffle([...needs, spare], rnd), spare };
}
/** 스무 칸 다리(N05): 가운데 돌기둥을 사이에 둔 열 칸 둘. 넘친 판자는 떨어지지 않고 다음 열 칸으로 이어진다. 뗏목은 둘로 나눠 싣는데, 첫 뗏목이 첫 열 칸에 딱 맞지 않게(넘어가는 것을 보게). */
export const LONG = { SLOTS: 20, PART: [2, 9] };
export function split(total, room1, rnd = Math.random){ const [lo, hi] = LONG.PART, ok = []; for (let a = lo; a <= hi; a++) { const b = total - a; if (b >= lo && b <= hi && a !== room1 && b !== room1 && a !== SLOTS - room1) ok.push(a); }
  const a = ok.length ? ok[Math.floor(rnd() * ok.length)] : Math.ceil(total / 2); return [a, total - a]; }
/** 스무 칸 다리의 두 팻말: 「10까지 몇」(첫 열 칸의 빈 칸) · 「그다음 10」(둘째 열 칸의 빈 칸). */
export const tens = (filled, slots = SLOTS) => slots <= SLOTS ? [slots - filled] : [Math.max(0, SLOTS - filled), Math.min(SLOTS, slots - filled)];
/** 판자가 filled 장 놓인 다리에 뗏목 n 을 놓으면: { put(놓이는 수), extra(물에 떨어지는 수), filled, done(다리가 이어짐), kind:'fit'|'over'|'short' }. */
export function place(filled, n, slots = SLOTS){ const room = slots - filled, put = Math.min(n, room); return { put, extra: n - put, filled: filled + put, done: filled + put === slots, kind: n === room ? 'fit' : n > room ? 'over' : 'short' }; }
/** 낱 판자가 떠내려와야 하는가 — 남은 칸에 들어갈 뗏목(넘치지 않는 것)이 하나도 없을 때. */
export function needSingle(filled, cargo, slots = SLOTS){ const room = slots - filled; return room > 0 && !cargo.some(n => n <= room); }
/** 한 길을 끝까지 돌려 본다(하네스·봇용). choose(room, cargo, 낱 판자가 오는 중인가) → 쓸 뗏목의 자리(index) 또는 -1(낱 판자를 씀). → { singles, lost, left:[남은 뗏목] } */
export function play(v, choose){ const cargo = v.cargo.slice(); let singles = 0, lost = 0, guard = 0;
  for (const g of v.gaps) { let filled = g.have; const N = g.slots || SLOTS;
    while (filled < N && ++guard < 200) { const room = N - filled, single = needSingle(filled, cargo, N); let i = choose(room, cargo, single);
      if (!(i >= 0 && i < cargo.length)) { if (single) { singles++; filled++; continue; } i = cargo.findIndex(n => n <= room); }
      const out = place(filled, cargo.splice(i, 1)[0], N); lost += out.extra; filled = out.filled; } }
  return { singles, lost, left: cargo, ok: guard < 200 }; }
/** 길 끝의 물음: 세 틈에 놓은 판자의 합과 고를 수 셋(하나만 맞음, 순서 섞임). → { sum, picks } */
export function total(v, rnd = Math.random){ const sum = v.gaps.reduce((a, g) => a + g.need, 0), near = shuffle([sum - 2, sum - 1, sum + 1, sum + 2].filter(n => n > 0), rnd).slice(0, 2); return { sum, picks: shuffle([sum, ...near], rnd) }; }

// ── 흥미진진(준호 2026-11-17 「여러 가지로 계속 섞어서」): 길마다 사건이 다르다. 생각하는 동안에만 시계가 간다(판자가 놓이고 달리는 동안은 멈춤).
//   tide = 밀물(물이 차올라 건너편 주민의 발밑까지) · ship = 해적선(먼저 닿으면 주민을 태워 감) · drift = 물살(뗏목이 흔들려 떠다님)
export const PRESS = { BUDGET: [80, 60, 50, 42, 36, 32], BACK: .05, RAFT_P: .6, RAFT_N: [1, 2, 3] };   // 생각할 수 있는 시간(초, 데려온 주민 수에 따라) · 딱 맞추면 시계가 되감기는 몫 · 통에서 뗏목이 나올 확률 · 그 뗏목의 크기
/** 이번 길의 사건. saved = 지금까지 데려온 주민 수(놓쳐도 어려워지지 않는다). */
/* N02(2026-11-18): 섞을 것을 넓힌다 — 시계(밀물·해적선·무너지는 다리) × 손(물살·상어) × 수(밤 다리·쌍둥이 틈) · 큰 길(틈 다섯).
 *   처음에는 데려온 주민 수에 따라 정해진 차례로 하나씩 처음 보여 준다(MIX.FIRST): 0 밀물 · 1 해적선 · 2 물살 · 3 밤 다리 · 4 무너지는 다리 · 5 쌍둥이 틈 · 6 상어 · 7 큰 길.
 *   그 뒤에는 섞는다. 상어는 모형이 있을 때만(opt.shark). */
export const MIX = { FIRST: { drift: 2, night: 3, fall: 4, twin: 5, shark: 6, big: 7, long: 8 }, P: { drift: .4, night: .35, twin: .3, shark: .35, big: .3, fall: .34, long: .35 }, LONG_BUDGET: 1.35, NIGHT: [[0, 1], [8, 2], [10, 3]], BIG_GAPS: 5, BIG_BUDGET: 1.6 };
export function event(saved, rnd = Math.random, opt = {}){ const F = MIX.FIRST, P = MIX.P, first = k => saved === F[k], later = k => saved > F[k] && rnd() < P[k];
  let kind = saved === 0 ? 'tide' : saved === 1 ? 'ship' : first('fall') ? 'fall' : saved > F.fall && rnd() < P.fall ? 'fall' : rnd() < .5 ? 'tide' : 'ship';
  const drift = first('drift') || (saved > F.drift && !first('night') && !first('fall') && !first('twin') && !first('shark') && !first('big') && rnd() < P.drift);
  const nightOn = first('night') || (later('night') && !first('fall') && !first('twin') && !first('shark') && !first('big')), night = nightOn ? MIX.NIGHT.filter(([s]) => saved >= s).pop()[1] : 0;
  const twin = first('twin') || (later('twin') && !first('shark') && !first('big')), shark = !!opt.shark && (first('shark') || (later('shark') && !first('big'))), big = first('big') || (later('big') && !first('long'));
  /* N05 스무 칸 다리: 8 에서 처음, 그 뒤로 섞는다(큰 길과도). 쌍둥이 틈·밤 다리와는 같은 길에 내지 않는다(한 번에 하나씩 새것). */
  const long = first('long') || (later('long') && !twin && !night);
  const gaps = big ? MIX.BIG_GAPS : TUNE.GAPS, budget = PRESS.BUDGET[Math.min(saved, PRESS.BUDGET.length - 1)] * (big ? MIX.BIG_BUDGET : 1) * (long ? MIX.LONG_BUDGET : 1);
  return { kind, drift, budget, night: long && !first('night') ? 0 : night, twin: long ? false : twin, shark, big, gaps, long }; }
/** 길 끝 물음의 종류: 첫 길은 합(「모두 몇 장 놓았지?」), 그 뒤로는 합과 「남은 나무는 몇 장?」 가운데 하나. */
export const askKind = (n, rnd = Math.random) => n <= 1 ? 'sum' : rnd() < .5 ? 'sum' : 'left';
/** 남은 나무: 실은 판자 − 놓은 판자 − 물에 빠진 판자. */
export const leftover = (loaded, placed, lost) => loaded - placed - lost;
/** 쉬어 가는 땅의 통을 열면: 덤 뗏목 또는 물고기 양동이. */
export const MAP = { P: .25, MAX: 4 };   // 통에서 지도 조각이 나올 확률(조각이 아직 모자랄 때) · 넷이면 광장에 새 섬
export function barrel(rnd = Math.random, opt = {}){ if (opt.map && rnd() < MAP.P) return { kind: 'map' }; return rnd() < PRESS.RAFT_P ? { kind: 'raft', n: PRESS.RAFT_N[Math.floor(rnd() * PRESS.RAFT_N.length)] } : { kind: 'fish' }; }
