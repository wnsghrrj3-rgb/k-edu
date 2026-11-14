/* 수학 놀이터 지갑 — 동전 · 섬마다의 걸음과 키운 것 · 도감 · 오늘 한 일 · 오늘의 부탁.
 * 저장은 localStorage 한 칸 `kedu_mathplay_v2`. 페이지가 /kedu_scope.js 를 먼저 실어야 한다:
 *   정식 세션(계정·동의한 자리) = 기기에 남는다 / 동의 전·방문자 = 화면이 열려 있는 동안만(scope 가 메모리에 둔다).
 *   scope 가 실리지 않은 페이지에서는 기기에 쓰지 않고 메모리에만 둔다.
 * 예전 `kedu_mathplay_v1` · `kedu_mathplay_cards_v1` 은 읽지 않는다. 서버 호출 0. */
const KEY = 'kedu_mathplay_v2';
// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const TUNE = {
  QUEST_BONUS: 30,                 // 부탁 셋을 다 했을 때 덤 동전
  QUEST_SHOP: [3, 4, 5, 6],        // 가게 부탁: 손님 n명(날짜로 고름)
  QUEST_FISH: [2, 3, 4],           // 낚시 부탁: 통 n개(날짜로 고름)
  COIN_MAX: 99999 };

const scope = () => (typeof window !== 'undefined' && window.__keduScope) || null;
/** 기기에 남는가(정식 세션). */
export function persists(){ const s = scope(); return !!(s && !s.off && s.persist); }
const store = (() => { const mem = {}; return {
  get(k){ try { if (scope()) return localStorage.getItem(k); } catch (_) {} return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  set(k, v){ try { if (scope()) { localStorage.setItem(k, v); return; } } catch (_) {} mem[k] = v; } }; })();

export function dayKey(d = new Date()){ return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
const blankDay = date => ({ date, did: {}, stamp: {}, bonus: false });
const blank = () => ({ v: 2, coins: 0, islands: {}, book: {}, day: blankDay(dayKey()) });
let S = null; const subs = new Set();
function load(){ let o = null; try { o = JSON.parse(store.get(KEY) || 'null'); } catch (_) {}
  S = blank(); if (o && o.v === 2) { S.coins = Math.max(0, Math.min(TUNE.COIN_MAX, o.coins | 0)); if (o.islands && typeof o.islands === 'object') S.islands = o.islands; if (o.book && typeof o.book === 'object') S.book = o.book; if (o.day && o.day.date === S.day.date) S.day = { ...blankDay(S.day.date), ...o.day }; } }
function roll(){ const t = dayKey(); if (S.day.date !== t) S.day = blankDay(t); }       // 날이 바뀌면 오늘 한 일을 새로
export function save(){ try { store.set(KEY, JSON.stringify(S)); } catch (_) {} subs.forEach(f => { try { f(S); } catch (_) {} }); }
load();

// ── 동전
export const coins = () => S.coins;
/** 동전을 번다. from = 어디서('shop'·'fish'·'island'·'board'). */
export function earn(n, from){ n = Math.max(0, n | 0); if (!n) return S.coins; S.coins = Math.min(TUNE.COIN_MAX, S.coins + n); roll(); S.day.did['coin.' + (from || 'etc')] = (S.day.did['coin.' + (from || 'etc')] | 0) + n; save(); return S.coins; }
/** 동전을 쓴다. 모자라면 false(아무것도 안 바뀜). */
export function spend(n){ n = Math.max(0, n | 0); if (n > S.coins) return false; S.coins -= n; save(); return true; }

// ── 섬마다의 저장 칸 · 도감
/** 그 섬의 저장 칸(걸음·키운 것). 고친 뒤 save() 를 부른다. */
export function island(id){ return S.islands[id] || (S.islands[id] = {}); }
/** 도감에 넣는다(kind = 'fish'·'guest'…). 처음이면 true. */
export function collect(kind, id){ const b = S.book[kind] || (S.book[kind] = {}); if (b[id]) return false; b[id] = dayKey(); save(); return true; }
export const book = kind => Object.keys(S.book[kind] || {});

// ── 오늘 한 일 · 오늘의 부탁
/** 오늘 한 일을 센다(what = 'shop.guest'·'fish.bucket'·'course.treasure'). 이번에 막 해낸 부탁이 있으면 그 부탁을 돌려준다. */
export function did(what, n = 1){ roll(); const before = quests().filter(q => q.done).map(q => q.id); S.day.did[what] = (S.day.did[what] | 0) + n; save(); return quests().find(q => q.done && !before.includes(q.id)) || null; }
export const today = what => { roll(); return S.day.did[what] | 0; };
function hash(s){ let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/** 그 날의 부탁 셋(날짜로 고른다 — 같은 날엔 누구에게나 같다). */
export function questsOf(date){ const h = hash('mathplay|' + date), a = TUNE.QUEST_SHOP[h % TUNE.QUEST_SHOP.length], b = TUNE.QUEST_FISH[(h >>> 8) % TUNE.QUEST_FISH.length];
  return [ { id: 'shop', what: 'shop.guest', need: a, art: 'board.shop', short: `손님 ${a}명`, text: `가게에서 손님 ${a}명 받아 줘`, where: '가게 섬' },
           { id: 'fish', what: 'fish.bucket', need: b, art: 'board.fish', short: `물고기 통 ${b}개`, text: `물고기 통 ${b}개 채워서 보내 줘`, where: '낚시 섬' },
           { id: 'course', what: 'course.treasure', need: 1, art: 'board.course', short: '보물 상자', text: '보물 상자를 찾아 줘', where: '보물 섬' } ]; }
/** 오늘의 부탁 셋 + 얼마나 했는지(have) · 해냈는지(done) · 게시판에 도장이 찍혔는지(stamped). */
export function quests(){ roll(); return questsOf(S.day.date).map(q => { const have = Math.min(q.need, S.day.did[q.what] | 0); return { ...q, have, done: have >= q.need, stamped: !!S.day.stamp[q.id] }; }); }
/** 게시판 앞에서: 해냈는데 아직 도장이 없는 부탁에 도장을 찍는다. 셋 다 찍히면 덤 동전을 한 번 준다. → { stamped: [id…], bonus: 덤 동전(없으면 0) } */
export function stampQuests(){ const qs = quests(), fresh = qs.filter(q => q.done && !q.stamped).map(q => q.id); fresh.forEach(id => { S.day.stamp[id] = 1; }); let bonus = 0;
  if (!S.day.bonus && qs.every(q => S.day.stamp[q.id])) { S.day.bonus = true; bonus = TUNE.QUEST_BONUS; S.coins = Math.min(TUNE.COIN_MAX, S.coins + bonus); S.day.did['coin.board'] = (S.day.did['coin.board'] | 0) + bonus; }
  if (fresh.length || bonus) save(); return { stamped: fresh, bonus }; }
export const bonusGiven = () => { roll(); return !!S.day.bonus; };

/** 지갑이 바뀔 때마다 부른다(동전 표시 등). 끊는 함수를 돌려준다. */
export function onChange(f){ subs.add(f); return () => subs.delete(f); }
/** 하네스·교사용: 지갑을 저장 칸에서 다시 읽는다. */
export function reload(){ load(); subs.forEach(f => { try { f(S); } catch (_) {} }); }
export const _state = () => S;
