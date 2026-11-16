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
  let needs, tries = 0;
  do { needs = shuffle(TUNE.NEED.slice(), rnd).slice(0, TUNE.GAPS);
    if (opt.first) { needs = needs.filter(n => n !== TUNE.FIRST_NEED).slice(0, TUNE.GAPS - 1); needs.unshift(TUNE.FIRST_NEED); }
  } while (opt.prev && ++tries < 8 && needs.join() === opt.prev.gaps.map(g => g.need).join());
  const spare = TUNE.SPARE[Math.floor(rnd() * TUNE.SPARE.length)];
  return { gaps: needs.map(need => ({ have: SLOTS - need, need })), cargo: shuffle([...needs, spare], rnd), spare };
}
/** 판자가 filled 장 놓인 다리에 뗏목 n 을 놓으면: { put(놓이는 수), extra(물에 떨어지는 수), filled, done(다리가 이어짐), kind:'fit'|'over'|'short' }. */
export function place(filled, n){ const room = SLOTS - filled, put = Math.min(n, room); return { put, extra: n - put, filled: filled + put, done: filled + put === SLOTS, kind: n === room ? 'fit' : n > room ? 'over' : 'short' }; }
/** 낱 판자가 떠내려와야 하는가 — 남은 칸에 들어갈 뗏목(넘치지 않는 것)이 하나도 없을 때. */
export function needSingle(filled, cargo){ const room = SLOTS - filled; return room > 0 && !cargo.some(n => n <= room); }
/** 한 길을 끝까지 돌려 본다(하네스·봇용). choose(room, cargo, 낱 판자가 오는 중인가) → 쓸 뗏목의 자리(index) 또는 -1(낱 판자를 씀). → { singles, lost, left:[남은 뗏목] } */
export function play(v, choose){ const cargo = v.cargo.slice(); let singles = 0, lost = 0, guard = 0;
  for (const g of v.gaps) { let filled = g.have;
    while (filled < SLOTS && ++guard < 200) { const room = SLOTS - filled, single = needSingle(filled, cargo); let i = choose(room, cargo, single);
      if (!(i >= 0 && i < cargo.length)) { if (single) { singles++; filled++; continue; } i = cargo.findIndex(n => n <= room); }
      const out = place(filled, cargo.splice(i, 1)[0]); lost += out.extra; filled = out.filled; } }
  return { singles, lost, left: cargo, ok: guard < 200 }; }
/** 길 끝의 물음: 세 틈에 놓은 판자의 합과 고를 수 셋(하나만 맞음, 순서 섞임). → { sum, picks } */
export function total(v, rnd = Math.random){ const sum = v.gaps.reduce((a, g) => a + g.need, 0), near = shuffle([sum - 2, sum - 1, sum + 1, sum + 2].filter(n => n > 0), rnd).slice(0, 2); return { sum, picks: shuffle([sum, ...near], rnd) }; }
