/* 수학 놀이터 고리(N04) — 네 곳이 한 바퀴로: 낚시 ──물고기──▶ 장터 ──동전──▶ 판자 화물 ──▶ 다리 길 ──주민·나무·지도──▶ 광장 ──▶ 낚시.
 * 한 곳에서 읽고 쓴다. 저장은 지금 칸 그대로(옮기지 않음 — 옛 저장이 그대로 이어진다):
 *   동전 = wallet.coins() · 나무 = 다리 칸 wood · 주민 = 다리 칸 saved · 지도 = 광장 칸 map · 생선·통·부탁·덤 = 고리 칸(loop).
 * 아래 「규칙」 부분은 지갑 없이 도는 순수 함수(하네스가 3000회 돌린다). */
import * as wallet from './wallet.js?v=1';

// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const LOOP = {
  PLANK: 1,                 // 판자 한 장 = 동전 하나
  BUNDLES: [1, 2, 3, 4, 5], // 화물은 1~5장 묶음으로 싣는다
  CARGO_FROM: 2,            // 데려온 주민이 이만큼이면 화물을 직접 싣는다(그 전 두 길은 뗏목을 선물로)
  BUCKET_FISH: 3,           // 다리 길 통에서 나온 물고기 양동이 하나 = 생선 셋
  REQ_PER_DAY: 3, REQ: [3, 6], HELP_RAFT: [1, 3],   // 주민 부탁(생선 n마리) 하루 셋 · 들어주면 다음 길 덤 뗏목(1~3장)
  WANT: { coins: 3, fish: 1 },                       // 이보다 적으면 나루터 팻말이 깜빡인다
};

// ── 규칙(순수)
/** 어느 섬을 지금 할 수 있나. 낚시는 늘(아무것도 안 듦) · 장터도 늘(장작·돌·통은 늘 있음, 생선만 낚시에서) · 다리 길은 화물 길이면 동전 1 이상 · 광장 짓기는 나무가 있어야. */
export function doable(s){ return { fishing: true, market: true, bridge: s.people < LOOP.CARGO_FROM || s.coins >= LOOP.PLANK, plaza: s.wood > 0 }; }
/** 모자란 것(나루터 팻말이 깜빡일 것) → { coins, fish, wood } */
export function wants(s, woodNeed = 0){ return { coins: s.coins < LOOP.WANT.coins, fish: s.fish < LOOP.WANT.fish, wood: woodNeed > 0 && s.wood < woodNeed }; }
/** 화물을 싣는다: 동전 coins 로 n 장 묶음 → { ok, coins } */
export const load = (coins, n) => n * LOOP.PLANK <= coins ? { ok: true, coins: coins - n * LOOP.PLANK } : { ok: false, coins };
/** 장터: 생선을 n 마리 판다(있는 만큼만) → { sold, fish } */
export const sellFish = (fish, n) => { const sold = Math.min(fish, n); return { sold, fish: fish - sold }; };
/** 오늘의 부탁: 날짜와 순번으로 고른다(누구에게나 같음). → { n } 또는 null(오늘 다 함) */
export function request(day, done, rnd = null){ if (done >= LOOP.REQ_PER_DAY) return null; let h = 7; for (const c of day + '#' + done) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; const r = rnd ? rnd() : (h % 1000) / 1000; return { n: LOOP.REQ[0] + Math.floor(r * (LOOP.REQ[1] - LOOP.REQ[0] + 1)) }; }

// ── 지갑과 이어진 쪽
const L = () => { const o = wallet.island('loop'); if (!o.v) { o.v = 1; const F = wallet.island('fishing'), B = wallet.island('bridge'); o.fish = Math.max(0, (F.fish | 0) + (B.fish | 0) * LOOP.BUCKET_FISH); o.tubs = F.tubs | 0; o.help = 0; o.reqDay = ''; o.reqDone = 0; wallet.save(); } return o; };
/** 지금 가진 것 한눈에 → { coins, wood, fish, people, map, tubs, help } */
export function stock(){ const o = L(), B = wallet.island('bridge'), P = wallet.island('plaza'); return { coins: wallet.coins(), wood: Math.max(0, B.wood | 0), fish: Math.max(0, o.fish | 0), people: Math.max(0, B.saved | 0), map: Math.max(0, P.map | 0), tubs: o.tubs | 0, help: o.help | 0 }; }
/** 낚시에서 통을 싣고 왔다: 생선 += 통의 수 합 · 통 수 += */
export function landFish(tubs){ const o = L(); o.fish = (o.fish | 0) + tubs.reduce((a, b) => a + b, 0); o.tubs = (o.tubs | 0) + tubs.length; wallet.save(); }
/** 다리 길 통에서 물고기 양동이 → 생선 */
export function bucketFish(n){ if (!n) return; const o = L(); o.fish = (o.fish | 0) + n * LOOP.BUCKET_FISH; wallet.save(); }
/** 장터에서 생선을 팔았다(또는 바구니에 담으려 한다): 남은 생선 */
export const fish = () => Math.max(0, L().fish | 0);
export function useFish(n){ const o = L(); const r = sellFish(o.fish | 0, n); o.fish = r.fish; wallet.save(); return r.sold; }
/** 판자를 동전으로 산다(화물). 모자라면 false */
export const buyPlanks = n => wallet.spend(n * LOOP.PLANK);
export const refundPlanks = n => wallet.earn(n * LOOP.PLANK, 'cargo');
/** 화물을 직접 싣는 길인가(주민을 CARGO_FROM 명 데려온 뒤부터) */
export const cargoOn = () => stock().people >= LOOP.CARGO_FROM;
/** 주민 부탁(생선 n마리): 지금 걸린 부탁 · 들어주기 */
export function todayRequest(){ const o = L(), d = wallet.dayKey(); if (o.reqDay !== d) { o.reqDay = d; o.reqDone = 0; wallet.save(); } return request(d, o.reqDone | 0); }
export function giveRequest(){ const q = todayRequest(); if (!q || fish() < q.n) return false; const o = L(); o.fish -= q.n; o.reqDone = (o.reqDone | 0) + 1; o.help = 1; wallet.save(); return true; }
/** 다음 길의 덤 뗏목(부탁을 들어준 주민이 짐을 들고 따라옴) — 쓰면 사라진다 → 장 수 또는 0 */
export function takeHelp(rnd = Math.random){ const o = L(); if (!o.help) return 0; o.help = 0; wallet.save(); return LOOP.HELP_RAFT[0] + Math.floor(rnd() * (LOOP.HELP_RAFT[1] - LOOP.HELP_RAFT[0] + 1)); }
