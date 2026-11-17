/* 통 부두(3D) 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 돌린다). 기준: 핸드오프 kedu/math-play-work/N00_세_기준.md
 * 부두에 통이 열 개씩 묶인 깔판(팻말 「10」)과 낱개 통이 있다. 배 팻말에 실을 수(34)가 적혀 있고, 깔판을 누르면 열 개가, 낱개를 누르면 하나가 실린다.
 * 실을수록 배 팻말의 수가 준다. 남은 수보다 큰 묶음을 실으려 하면 깔판이 도로 튕겨 온다(잃는 것 없음). 딱 맞으면 「30 + 4 = ?」 — 맞는 수를 누르면 배가 떠난다.
 * 섞는 것: 시계 = 배가 부두에서 떠밀려 간다(늘, 생각하는 동안에만 · 다 멀어지면 이번 배는 그냥 떠남 — 벌 없이 새 배) ·
 *   손 = 굴러가는 통(눌러 잡으면 덤 동전) · 궁금함 = 팻말이 식(「24 + 10」「45 − 10」: 10 큰 수·작은 수) · 손맛 = 불꽃(튕김 없이 연달아 보내면 싣는 속도가 빨라지고 음이 오름).
 * 처음엔 새것을 하나씩(십몇 → 굴러가는 통 → 몇십 → 10 큰 수 → 10 작은 수), 그 뒤엔 섞는다. 놓쳐도 어려워지지 않는다(보낸 배 수로만 오른다). */

// ── 내가 정한 수치(준호가 해 보고 바꾼다)
/** 걸음: 보낸 배 수로 오른다. n = 실을 수 범위 */
export const STEPS = [ { at: 0, n: [11, 19] }, { at: 3, n: [20, 39] }, { at: 6, n: [40, 69] }, { at: 10, n: [70, 99] } ];
export const MIX = {
  FIRST: { roll: 1, tens: 2, more: 4, less: 5 },     // 처음 보이는 배(보낸 배 수)
  P: { roll: .4, tens: .15, more: .25, less: .25 },  // 그 뒤 섞일 확률
  TENS_MAX: 50,                                       // 몇십만 싣는 배는 50까지(띠가 길어지지 않게)
  BUDGET: { BASE: 26, PER: 2.4 },                     // 배가 다 떠밀리기까지(생각하는 시간, 초) = BASE + (묶음 수 + 낱개 수) × PER
  ONES: 9,                                            // 부두에 놓인 낱개 통(다 쓰면 다시 채워짐)
  STREAK_MAX: 4, FAST: .12,
  ROLL_COINS: 1 };
const ri = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
export const stepOf = shipped => { let k = 0; STEPS.forEach((s, i) => { if (shipped >= s.at) k = i; }); return k; };
/** 배 한 척의 주문 → { n(실을 수), kind: plain|tens|more|less, show(팻말 글), roll, budget, coins } */
export function order(shipped, rnd = Math.random, opt = {}){ const S = STEPS[stepOf(shipped)], F = MIX.FIRST, P = MIX.P; let kind = opt.kind || 'plain';
  if (!opt.kind) { if (shipped === F.tens) kind = 'tens'; else if (shipped === F.more) kind = 'more'; else if (shipped === F.less) kind = 'less'; else if (shipped > F.less) { const r = rnd(); kind = r < P.tens ? 'tens' : r < P.tens + P.more ? 'more' : r < P.tens + P.more + P.less ? 'less' : 'plain'; } }
  let n = ri(rnd, S.n[0], S.n[1]);
  if (kind === 'tens') n = Math.max(20, Math.min(MIX.TENS_MAX, Math.round(n / 10) * 10));
  else if (n % 10 === 0) n += ri(rnd, 1, 9);                        /* 보통 배는 낱개가 꼭 있게 */
  if (kind === 'more' && n < 21) n += 10; if (kind === 'less' && n > 89) n -= 10;
  const show = kind === 'more' ? `${n - 10} + 10` : kind === 'less' ? `${n + 10} − 10` : String(n), roll = opt.roll != null ? opt.roll : shipped >= F.roll && (shipped === F.roll || rnd() < P.roll);
  return { n, kind, show, roll, budget: MIX.BUDGET.BASE + (Math.floor(n / 10) + n % 10) * MIX.BUDGET.PER, coins: 2 + Math.floor(n / 25) }; }
/** 남은 수 left 에 k(10 또는 1)를 실으려 한다 → fit(딱) · more(더 실어야) · over(넘침 — 튕겨 옴, 남은 수 그대로) */
export function load(left, k){ if (k > left) return { kind: 'over', left }; return { kind: left - k === 0 ? 'fit' : 'more', left: left - k }; }
/** 띠에 보일 식: 실은 묶음 t개·낱개 o개 → 더할 수들(늘 둘 이상이게) */
export function parts(t, o){ if (t && o) return [t * 10, o]; if (t) return t === 1 ? [10] : t <= 5 ? Array(t).fill(10) : [(t - 1) * 10, 10]; return o > 10 ? [10, o - 10] : o > 1 ? [o - 1, 1] : [o]; }
export const pace = streak => 1 - MIX.FAST * Math.min(streak, MIX.STREAK_MAX);
/** 화면 없이 배 한 척(하네스용). pick(left) → 10 또는 1 */
export function play(o, pick = left => left >= 10 ? 10 : 1){ let left = o.n, t = 0, one = 0, over = 0; for (let k = 0; k < 400 && left > 0; k++) { const c = pick(left), r = load(left, c); if (r.kind === 'over') { over++; continue; } left = r.left; if (c === 10) t++; else one++; } return { ok: left === 0, t, o: one, over, parts: parts(t, one) }; }
