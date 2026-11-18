/* 나룻배 나루(3D) 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 돌린다). 기준: 핸드오프 kedu/math-play-work/N00_세_기준.md
 * 같은 수씩 묶어 세기(뛰어 세기 → 곱셈의 기초). 나룻배마다 통이 같은 수씩(팻말 「3」) 실려 있다.
 * 채우기: 큰 배 팻말에 실을 수(12)가 있고, 나룻배를 누르면 큰 배로 가서 통을 내린다 — 팻말이 3씩 준다(12 → 9 → 6 → 3 → 0).
 * 세기: 나룻배 몇 척이 이미 큰 배에 붙어 있다. 하나씩 누르면 큰 배 팻말이 3, 6, 9, 12 로 오른다(뛰어 세기).
 * 끝의 셈: 「3 + 3 + 3 + 3 = ?」(배가 다섯 척 넘으면 「3씩 5번 = ?」) — 고를 수는 맞는 수와 한 묶음 앞뒤(9 · 12 · 15)라 뛰어 세야 고른다.
 * 섞는 것: 시계 = 밀물(큰 배가 밧줄째 부두에서 떠밀려 감 · 생각하는 동안에만 · 다 멀어지면 그냥 떠남 — 벌 없이 새 판) ·
 *   손 = 지나가는 물고기(눌러 잡으면 덤 동전) · 궁금함 = 빈 나룻배 하나(팻말 「?」 — 열어 보면 같은 수가 들어 있음) · 손맛 = 불꽃.
 * 처음엔 새것을 하나씩(2씩 채우기 → 5씩 → 세기 → 10씩 → 물고기 → 3·4씩 → 「?」 배 → 묶음 말 「3씩 5번」), 그 뒤엔 섞는다. 놓쳐도 어려워지지 않는다. */

// ── 내가 정한 수치(준호가 해 보고 바꾼다)
/** 걸음: 보낸 배 수(판 수)로 오른다. g = 한 척에 실린 수 · k = 나룻배 수 범위 */
export const STEPS = [
  { at: 0, g: [2], k: [2, 4] },
  { at: 1, g: [5], k: [2, 4] },
  { at: 3, g: [10], k: [2, 5] },
  { at: 5, g: [2, 5, 3, 4], k: [3, 5] },
  { at: 8, g: [3, 4, 6], k: [3, 6] },
  { at: 12, g: [3, 4, 6, 7, 8, 9], k: [3, 6] } ];
export const MIX = {
  FIRST: { count: 2, fish: 4, mystery: 6, word: 7 },   // 처음 보이는 판(판 수) — 세기 · 물고기 · 「?」 배 · 묶음 말
  P: { count: .4, fish: .4, mystery: .3 },
  WORD_K: 5,                 // 배가 이만큼 넘으면 띠를 「3씩 5번」으로(묶음 말을 배운 뒤)
  SPARE: 1,                  // 채우기 판에 더 매어 둔 나룻배(골라서 멈춰야)
  BUDGET: { BASE: 22, PER: 3.5 },   // 큰 배가 다 떠밀리기까지(생각하는 시간, 초) = BASE + 척 수 × PER
  STREAK_MAX: 4, FAST: .12, FISH_COINS: 1 };
const ri = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = (rnd, a) => a[Math.floor(rnd() * a.length)];
export const stepOf = n => { let k = 0; STEPS.forEach((s, i) => { if (n >= s.at) k = i; }); return k; };
/** 한 판 → { kind: fill|count, g, k, sum, boats(매어 둔 나룻배 수), mystery(「?」 배 자리 · 없으면 -1), word(띠를 묶음 말로), fish, budget, coins } */
export function round(n, rnd = Math.random, opt = {}){ const S = STEPS[stepOf(n)], F = MIX.FIRST, P = MIX.P, g = opt.g || pick(rnd, S.g), k = opt.k || ri(rnd, S.k[0], S.k[1]);
  const kind = opt.kind || (n === F.count ? 'count' : n > F.count && n !== F.mystery && rnd() < P.count ? 'count' : 'fill');
  const boats = kind === 'fill' ? k + MIX.SPARE : k, mystery = opt.mystery != null ? opt.mystery : (n === F.mystery || (n > F.mystery && rnd() < P.mystery)) ? ri(rnd, 0, k - 1) : -1;
  const word = opt.word != null ? opt.word : n >= F.word && k >= MIX.WORD_K, fish = opt.fish != null ? opt.fish : n === F.fish || (n > F.fish && rnd() < P.fish);
  return { kind, g, k, sum: g * k, boats, mystery, word, fish, budget: MIX.BUDGET.BASE + k * MIX.BUDGET.PER, coins: 2 + Math.floor(g * k / 15) }; }
/** 채우기: 남은 수 left 에 나룻배 하나(g)를 보낸다 → fit · more · over(넘침 — 배가 돌아옴) */
export function send(left, g){ if (g > left) return { kind: 'over', left }; return { kind: left === g ? 'fit' : 'more', left: left - g }; }
/** 끝의 셈 고를 수: 맞는 수와 한 묶음 앞뒤(0 아래는 두 묶음 뒤) — 뛰어 세야 고른다 */
export function picks(sum, g, rnd = Math.random){ const a = [sum, sum - g > 0 ? sum - g : sum + 2 * g, sum + g]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/** 뛰어 세기: g 씩 k 번 → [g, 2g, …] */
export const skip = (g, k) => Array.from({ length: k }, (_, i) => g * (i + 1));
export const pace = streak => 1 - MIX.FAST * Math.min(streak, MIX.STREAK_MAX);
/** 화면 없이 한 판(하네스용): 채우기는 맞을 때까지 보내기(spare 를 하나 더 눌러 보기도) → { ok, sent, over } */
export function play(r, extra = false){ if (r.kind === 'count') return { ok: true, sent: r.k, over: 0, seen: skip(r.g, r.k) }; let left = r.sum, sent = 0, over = 0; for (let i = 0; i < r.boats && left > 0; i++) { const o = send(left, r.g); left = o.left; sent++; } if (extra) { if (send(left || 0, r.g).kind === 'over') over++; } return { ok: left === 0 && sent === r.k, sent, over, seen: skip(r.g, sent) }; }
