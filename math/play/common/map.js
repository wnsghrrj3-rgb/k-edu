/* 수학 놀이터 내용 지도 기록 — 낱칸마다 「했는가 · 통과했는가 · 익혔는가」(정본 27 문서 5-4 · 5-6절).
 * 판정은 순수 함수(하네스가 그대로 돌린다): clean(판) · record(기록, 판) · passed · kept · stuck · next · open.
 *   깨끗한 문제 = 길잡이 손이 뜨기 전에, 넘침 · 물러난 수 없이 첫 손에 해낸 문제(틀이 정해 res.clean 으로 넘긴다)
 *   깨끗한 판   = 문제 셋이 모두 깨끗한 판
 *   통과       = 세는 판(counts)에서 깨끗한 판 PASS_CLEAN 연달아 → 깃발
 *   익힘       = 통과한 날에서 KEEP_DAYS 넘게 지난 날에 다시 깨끗하게 → 깃발에 별.
 *                옮김 표에 「켬」인 낱칸(MOVED — flash/review.js 의 MOVE 와 같은 목록 · 하네스가 본다)은 「오늘의 번쩍」 복습에서만 별을 딴다: keep(rec, 그 낱칸의 복습 결과 셋, 날).
 *                「끔」인 낱칸(아직 옮김 표에 줄이 없는 낱칸)은 옛 대신 규칙 그대로 — 그 낱칸 나들이에서 깨끗한 판 하나(별을 딸 길이 사라지지 않게 · T09).
 *   막힘       = 깨끗하지 못한 판 STUCK 연달아 → 틀이 길잡이를 일찍 · 작은 수부터 · 손으로 한 판(벌 없음). 2×STUCK 이면 고르는 화면에서 앞 깃발이 살짝 흔들림
 *   기록은 거꾸로 가지 않는다(딴 깃발은 내려가지 않는다).
 * 저장: localStorage `kedu_mathplay_map` 한 칸 — /kedu_scope.js 가 먼저 실려 있어야 기기에 남는다(정식 세션). 그 밖에는 화면이 열려 있는 동안만. 서버 호출 0. */
import { BUILT, STARTS } from './built.js?v=8';

// ── 내가 정한 수치(정본 5-4절 기본안 — 준호가 바꾼다)
export const RULE = { PASS_CLEAN: 2, KEEP_DAYS: 1, STUCK: 3, KEEP_Q: 3 };   /* KEEP_Q = 복습에서 별을 따려면 그 낱칸의 문제가 이만큼(모두 깨끗) — flash/review.js REVIEW_Q 와 같게 */
export const KEY = 'kedu_mathplay_map';
/** 익힘을 「오늘의 번쩍」 복습으로 옮긴 낱칸(옮김 표의 「켬」 — flash/review.js MOVE 의 열쇠와 같다 · T09). 새 틀이 생기면 그 묶음에서 둘 다에 줄을 더한다. */
export const MOVED = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A13', 'A14', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'C02', 'C03'];
export const moved = id => MOVED.includes(id);

/** 낱칸 기록 하나. state: 0 안 함 · 1 하는 중 · 2 통과 · 3 익힘 / cleanRun: 세는 판에서 깨끗한 판 연달아 / stuckRun: 깨끗하지 못한 판 연달아 / hand: 손으로 하는 판(걸음 ①)을 깨끗하게 마쳤는가 / evBoards: 사건이 붙은 판 수(틀이 사건을 차례로 보여 줄 때) */
export const blank = () => ({ state: 0, cleanRun: 0, stuckRun: 0, plays: 0, lastDay: '', passDay: '', hand: 0, evBoards: 0 });

/** 오늘(YYYY-MM-DD). 하네스가 날짜를 바꿔 볼 때만 window.__keduDay(addInitScript)가 앞선다 — 운영 주소의 day= 는 받지 않는다(기록에 남지 않게 · T09 검수). */
const dayOverride = () => { try { if (typeof window === 'undefined') return null; const v = window.__keduDay; return /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : null; } catch (_) { return null; } };
export function dayKey(d){ if (!d) { const o = dayOverride(); if (o) return o; d = new Date(); } return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
/** 두 날짜(YYYY-MM-DD) 사이의 날 수(b − a). */
export function days(a, b){ if (!a || !b) return 0; const t = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)); return Math.round((t(b) - t(a)) / 864e5); }

/** 깨끗한 판인가: 문제 셋이 모두 깨끗. results = [{ clean }…] */
export const clean = results => Array.isArray(results) && results.length >= 3 && results.every(r => r && r.clean);

/** 판 하나를 기록에 더한다(순수 — 새 기록을 돌려준다).
 *  opt.counts = 통과를 세는 판인가(가르기 틀은 걸음 ② 판) · opt.hand = 손으로 하는 판(걸음 ①)이었나 · opt.ev = 사건이 붙은 판이었나
 *  opt.cell(없으면 rec.id — get() 이 붙여 준다) = 그 낱칸. 옮김 표에 「켬」인 낱칸은 여기서 별이 붙지 않는다(복습의 keep() 에서만). */
export function record(rec, results, day = dayKey(), opt = {}){ const r = { ...blank(), ...(rec || {}) }, ok = clean(results), cid = opt.cell || (rec && rec.id) || '';
  r.plays++; r.lastDay = day; if (r.state < 1) r.state = 1; if (opt.ev) r.evBoards++;
  if (opt.hand && ok) r.hand = 1;
  if (ok) r.stuckRun = 0; else r.stuckRun++;
  if (opt.counts) { r.cleanRun = ok ? r.cleanRun + 1 : 0; }
  if (r.state < 2 && opt.counts && r.cleanRun >= RULE.PASS_CLEAN) { r.state = 2; r.passDay = day; }
  else if (r.state === 2 && ok && opt.counts && !moved(cid) && days(r.passDay, day) >= RULE.KEEP_DAYS) r.state = 3;   /* 「끔」인 낱칸만 옛 대신 규칙 */
  r.state = Math.max(r.state, (rec && rec.state) | 0);   /* 거꾸로 가지 않는다 */
  return r; }
/** 복습의 익힘(순수 — T09 「오늘의 번쩍」): 그날 복습에서 그 낱칸의 문제(셋)가 모두 깨끗하고 통과한 날에서 KEEP_DAYS 이상 지났으면 별.
 *  복습으로는 통과되지 않는다(통과는 그 틀의 걸음 ② 에서만) · 별 · 깃발은 내려가지 않는다 · 복습한 날(revDay)을 남긴다(별이 있는 낱칸의 「복습한 지 오래된 것」 차례). */
export function keep(rec, results, day = dayKey()){ const r = { ...blank(), ...(rec || {}) }; if (r.state < 2) return r; r.revDay = day;
  const ok = Array.isArray(results) && results.length >= RULE.KEEP_Q && results.every(x => x && x.clean); if (r.state === 2 && ok && (!r.passDay || days(r.passDay, day) >= RULE.KEEP_DAYS)) { r.state = 3; r.keptDay = day; }   /* 통과한 날을 모르는 옛 기록은 앞날로 친다 */
  r.state = Math.max(r.state, (rec && rec.state) | 0); return r; }
export const passed = rec => !!rec && rec.state >= 2;
export const kept = rec => !!rec && rec.state >= 3;
/** 막힘 단계: 0 아님 · 1 막힘(길잡이 일찍 · 작은 수부터 · 손으로 한 판) · 2 앞 낱칸을 권함 */
export const stuck = rec => !rec ? 0 : rec.stuckRun >= RULE.STUCK * 2 ? 2 : rec.stuckRun >= RULE.STUCK ? 1 : 0;
/** 막힘이 막 시작됐는가(이 판으로 STUCK 의 배수가 됨) — 틀은 다음 판을 손으로 한 판 돌린다. */
export const stuckNow = rec => !!rec && rec.stuckRun > 0 && rec.stuckRun % RULE.STUCK === 0;

/** 다음 낱칸 — 만들어진 낱칸(built.js)만 따라간다(아직 없는 낱칸은 건너 잇는다 · T02). ids 를 주면 그 안에서. */
export function next(id, ids = BUILT){ const i = ids.indexOf(id); return i >= 0 && i < ids.length - 1 ? ids[i + 1] : null; }
/** 열려 있는 낱칸: ids 가운데 아직 통과하지 않은 첫 낱칸(다 통과했으면 null). 낱칸은 차례대로 열린다. */
export function open(ids, m){ for (const id of ids) if (!passed(m[id])) return id; return null; }
/** 열린 낱칸들(T03 — 고르는 화면 한 곳): 아직 통과하지 않았고 ① 시작점(built.js STARTS)이거나 ② 앞 낱칸(만들어진 것끼리 차례)을 땄거나 ③ 이미 해 본 낱칸.
 *  앞쪽에 낱칸이 새로 생겨도 이미 열렸던 것은 닫히지 않는다(B01 은 시작점 · B02~ 는 앞 깃발을 땄으면 그대로). */
export function openSet(m, ids = BUILT, starts = STARTS){ return ids.filter((id, k) => !passed(m[id]) && (starts.includes(id) || (k > 0 && passed(m[ids[k - 1]])) || (((m[id] || {}).state | 0) >= 1) || !!(m[id] || {}).seen)); }   /* seen = 고르는 화면에 열린 채 보였던 낱칸(앞에 낱칸이 새로 끼어도 닫지 않는다) */

// ── 저장(kedu_scope 를 따른다 — 지갑과 같은 방식)
const scope = () => (typeof window !== 'undefined' && window.__keduScope) || null;
const mem = {};
const store = { get(k){ try { if (scope()) return localStorage.getItem(k); } catch (_) {} return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  set(k, v){ try { if (scope()) { localStorage.setItem(k, v); return; } } catch (_) {} mem[k] = v; } };
let M = null;
function load(){ let o = null; try { o = JSON.parse(store.get(KEY) || 'null'); } catch (_) {} M = {}; if (o && o.v === 1 && o.cells && typeof o.cells === 'object') for (const k of Object.keys(o.cells)) M[k] = { ...blank(), ...o.cells[k] }; }
export function save(){ try { store.set(KEY, JSON.stringify({ v: 1, cells: M })); } catch (_) {} }
/** 낱칸 기록(없으면 빈 기록). */
export function get(id){ if (!M) load(); return { ...blank(), ...(M[id] || {}), id }; }   /* id = 그 낱칸(record 가 옮김 표를 볼 때 · T09) */
/** 낱칸 하나를 쓴다 — 쓰기 직전에 저장 칸을 다시 읽어 그 낱칸만 합친다(뒤로 가기로 되살아난 쪽 · 탭 둘이 옛 기록으로 다른 낱칸의 깃발 · 별을 지우지 않게). 다른 쪽이 그사이 올린 state 는 큰 쪽(기록은 거꾸로 가지 않는다). */
export function put(id, rec){ const mine = M && M[id] ? M[id].state | 0 : 0; load(); const old = M[id], r = { ...rec }; if (old && (old.state | 0) > mine) r.state = Math.max(rec.state | 0, old.state | 0);   /* 다른 쪽(탭 · 되살아난 쪽)이 올려 둔 state 는 내려가지 않는다 · 이 쪽이 읽은 그대로면 받은 대로(하네스의 되돌리기) */
  M[id] = r; save(); return r; }
/** 기록 전체 { id: rec }(읽기용 복사). */
export function all(){ if (!M) load(); const o = {}; for (const k of Object.keys(M)) o[k] = { ...M[k] }; return o; }
/** 하네스·교사용: 저장 칸에서 다시 읽는다. */
export function reload(){ load(); }
