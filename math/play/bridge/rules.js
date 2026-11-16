/* 다리 판 「10 만들기」 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다).
 * 끊어진 다리에 칸이 열 개. 이미 놓인 판자가 몇 개 있고, 물 위에 판자 묶음 셋이 떠 있다. 아이는 하나를 끌어온다.
 * 딱 맞으면 다리가 이어져 건너가고 · 넘치면 남은 판자가 물에 떨어지고 · 모자라면 틈이 남는다. 수를 맞히는 것 말고는 건널 길이 없다. */
export const SLOTS = 10;                    // 다리 칸(10 만들기)
export const TUNE = { HAVE_MIN: 5, HAVE_MAX: 9, BUNDLE_MAX: 6 };   // 이미 놓인 판자 5~9 → 모자란 수 1~5 · 묶음은 1~6
/** 한 판: { have, need, bundles:[셋, 순서 섞임] } — 묶음 셋은 모자란 수 하나 + 그보다 작은 것(있으면) + 큰 것, 셋 다 다름. */
export function round(rnd = Math.random, prev = null){
  const R = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  let have; do { have = R(TUNE.HAVE_MIN, TUNE.HAVE_MAX); } while (prev && have === prev.have && rnd() < .8);
  const need = SLOTS - have, less = [], more = [];
  for (let v = 1; v < need; v++) less.push(v); for (let v = need + 1; v <= TUNE.BUNDLE_MAX; v++) more.push(v);
  const pick = a => a.splice(Math.floor(rnd() * a.length), 1)[0], set = [need];
  if (less.length) set.push(pick(less)); if (more.length) set.push(pick(more)); while (set.length < 3) set.push(more.length ? pick(more) : pick(less));
  for (let i = set.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [set[i], set[j]] = [set[j], set[i]]; }
  return { have, need, bundles: set };
}
/** 묶음 n 을 끌어오면: 'fit'(딱 맞음) · 'over'(넘침, 남는 수 extra) · 'short'(모자람, 틈 gap). */
export function drop(r, n){ const d = r.have + n - SLOTS; return d === 0 ? { kind: 'fit' } : d > 0 ? { kind: 'over', extra: d } : { kind: 'short', gap: -d }; }
