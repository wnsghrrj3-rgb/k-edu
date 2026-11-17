/* 보물 길(3D) 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다). 기준: 핸드오프 kedu/math-play-work/N00_세_기준.md
 * 광장 먼바다에 솟은 새 섬(지도 조각 넷). 섬에서 바다로 뻗은 판자 길이 있고, 판자 하나가 한 걸음이다.
 * 쪽지 팻말 「→ 5」가 뜨면 다섯 걸음 앞 판자를 누른다. 앤이 한 걸음씩 걸으며 걸음 수가 세어진다. 딱 맞으면 다음 쪽지(「→ 3」 또는 「← 2」).
 * 틀리면 고개를 젓고 쪽지를 받은 자리로 돌아온다(잃는 것 없음). 쪽지를 다 따르면 「지금 몇째 판자지?」 5 + 3 = ? — 맞는 수를 누르면 그 판자 옆에서 보물 통이 솟는다.
 * 섞는 것(판마다 다름): 시계 = 해적선(늘, 생각하는 동안에만 다가온다 — 닿으면 이번 보물은 해적 차지, 벌 없이 새 판) ·
 *   손 = 떠내려가는 통(눌러 건지면 덤 동전) · 궁금함 = 통 속(동전 · 가끔 생선·나무) · 쌍둥이 통(동전 두 배) · 손맛 = 불꽃(연달아 딱 맞게 걸으면 걸음이 빨라지고 음이 오름).
 * 처음 여섯 판은 새것을 하나씩(쪽지 하나 → 둘 → 되돌아오기 → 가운데서 떠나기 → 쪽지 셋 → 먼 길), 그 뒤엔 섞는다. 놓쳐도 어려워지지 않는다(찾은 보물 수로만 오른다). */

// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const CELLS = { NEAR: 10, FAR: 15 };          // 판자 길의 칸 수(가까운 길 · 먼 길)
/** 쪽지 종류. at = 처음 나오는 때(찾은 보물 수) · w = 그 뒤 섞이는 무게 */
export const KINDS = [
  { id: 'one', at: 0, w: 0 },      // → a
  { id: 'two', at: 2, w: 3 },      // → a  → b
  { id: 'back', at: 3, w: 3 },     // → a  ← b
  { id: 'from', at: 4, w: 2 },     // 가운데 판자(수 팻말)에서 떠남: s → a 또는 s ← a
  { id: 'three', at: 5, w: 3 },    // 쪽지 셋
  { id: 'far', at: 6, w: 3 } ];    // 먼 길(15칸): 합이 11~15
export const MIX = {
  DRIFT: { FIRST: 3, P: .4 },       // 떠내려가는 통: 처음 보이는 판 · 그 뒤 확률
  TWIN: { FIRST: 7, P: .25 },       // 쌍둥이 통
  BUDGET: { BASE: 24, PER: 11 },    // 해적선이 닿기까지(생각하는 시간, 초) = BASE + 쪽지 수 × PER
  STREAK_MAX: 4, FAST: .12,         // 불꽃 하나에 걸음이 12% 빨라짐(넷까지)
  PRIZE: [3, 6], GIFT_P: { fish: .18, wood: .12 }, DRIFT_COINS: [1, 2],
  LEARN: 2 };                        // 처음 두 보물까지: 앞 판자들에 걸음 수가 옅게 보인다

const ri = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
/** 이번 판의 쪽지 종류: 처음엔 차례대로, 그 뒤엔 섞음. far = 먼 길을 낼 수 있는가(세로로 긴 화면은 칸이 너무 작아 내지 않음) */
export function kindOf(found, rnd = Math.random, far = true){ const first = KINDS.filter(k => k.at === found)[0]; if (first && (far || first.id !== 'far')) return first.id; if (found < 2) return 'one';
  const pool = KINDS.filter(k => k.w && k.at <= found && (far || k.id !== 'far')); let r = rnd() * pool.reduce((a, k) => a + k.w, 0); for (const k of pool) { r -= k.w; if (r < 0) return k.id; } return pool[pool.length - 1].id; }
/** 한 판 → { kind, cells, start, notes:[{ dir, n }], sum, budget, drift, twin } · 지나는 자리는 늘 1~cells, 쪽지의 수는 1~9 */
export function round(found, rnd = Math.random, opt = {}){ const kind = opt.kind || kindOf(found, rnd, opt.far !== false), cells = kind === 'far' ? CELLS.FAR : CELLS.NEAR; let start = 0, notes = [];
  if (kind === 'one') notes = [{ dir: 1, n: ri(rnd, 2, found < 1 ? 5 : 7) }];
  else if (kind === 'two') { const a = ri(rnd, 2, 6), b = ri(rnd, 1, Math.min(6, cells - a)); notes = [{ dir: 1, n: a }, { dir: 1, n: b }]; }
  else if (kind === 'back') { const a = ri(rnd, 4, 9), b = ri(rnd, 1, Math.min(6, a - 1)); notes = [{ dir: 1, n: a }, { dir: -1, n: b }]; }
  else if (kind === 'from') { start = ri(rnd, 3, 6); if (rnd() < .6) notes = [{ dir: 1, n: ri(rnd, 1, cells - start) }]; else notes = [{ dir: -1, n: ri(rnd, 1, start - 1) }]; }
  else if (kind === 'three') { const a = ri(rnd, 2, 5), b = ri(rnd, 1, Math.min(5, cells - a)); const p = a + b; if (rnd() < .5 && p > 1) notes = [{ dir: 1, n: a }, { dir: 1, n: b }, { dir: -1, n: ri(rnd, 1, Math.min(5, p - 1)) }]; else if (p < cells) notes = [{ dir: 1, n: a }, { dir: 1, n: b }, { dir: 1, n: ri(rnd, 1, Math.min(5, cells - p)) }]; else notes = [{ dir: 1, n: a }, { dir: 1, n: b }, { dir: -1, n: ri(rnd, 1, 4) }]; }
  else { const a = ri(rnd, 6, 9), b = ri(rnd, Math.max(2, 11 - a), Math.min(9, cells - a)); notes = [{ dir: 1, n: a }, { dir: 1, n: b }]; }
  const sum = total(start, notes), n = notes.length + (start ? 1 : 0);
  return { kind, cells, start, notes, sum, budget: MIX.BUDGET.BASE + n * MIX.BUDGET.PER, drift: found >= MIX.DRIFT.FIRST && (found === MIX.DRIFT.FIRST || rnd() < MIX.DRIFT.P), twin: found >= MIX.TWIN.FIRST && (found === MIX.TWIN.FIRST || rnd() < MIX.TWIN.P) }; }
/** 쪽지를 다 따르면 서는 판자(= 끝의 셈의 답) */
export const total = (start, notes) => notes.reduce((p, q) => p + q.dir * q.n, start);
/** 지금 자리 pos 에서 쪽지 note 를 받고 판자 target 을 눌렀다 → { ok, steps(걸은 수), dir(걸은 쪽) } */
export function walk(pos, note, target){ const d = target - pos; return { ok: d === note.dir * note.n, steps: Math.abs(d), dir: d >= 0 ? 1 : -1 }; }
/** 통 속: 동전(쌍둥이면 두 배) · 가끔 생선(장터 진열대로)·나무(광장 더미로) */
export function prize(rnd = Math.random, twin = false){ const coins = ri(rnd, MIX.PRIZE[0], MIX.PRIZE[1]) * (twin ? 2 : 1), r = rnd(); return { coins, gift: r < MIX.GIFT_P.fish ? 'fish' : r < MIX.GIFT_P.fish + MIX.GIFT_P.wood ? 'wood' : null }; }
/** 한 걸음에 걸리는 시간 배수(불꽃이 많을수록 빠름) */
export const pace = streak => 1 - MIX.FAST * Math.min(streak, MIX.STREAK_MAX);

/** 화면 없이 한 판을 끝까지(하네스용): 늘 맞는 판자를 누른다 → 지나온 자리들 */
export function play(found, rnd = Math.random, opt = {}){ const r = round(found, rnd, opt); let pos = r.start; const path = [pos]; for (const q of r.notes) { const t = pos + q.dir * q.n, o = walk(pos, q, t); if (!o.ok) throw new Error('walk'); pos = t; path.push(pos); } return { round: r, path, end: pos }; }
