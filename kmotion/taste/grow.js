/* 내 성장 — 수학 놀이터에서 한 사람이 쌓아 가는 것: 성장 레벨(경험치) · 놀이별 메달 · 도장.
 * 저장은 localStorage 한 칸. /kedu_scope.js 가 먼저 실려 있으면 계정마다 따로 남고,
 * 동의 전(정식 세션 없음)에는 이 화면이 열려 있는 동안만 남는다(기기에도 서버에도 안 남김 — 케이에듀 원칙). */
const KEY = 'kedu_mathplay_v1';
const TITLES = [[1, '씨앗'], [3, '새싹'], [5, '떡잎'], [8, '꽃봉오리'], [12, '꽃'], [16, '어린나무'], [20, '큰 나무'], [26, '숲지기']];
export const MEDAL = ['', '동', '은', '금'], MEDAL_COL = ['', '#d08a4a', '#cfd6e0', '#ffd35c'];
const blank = () => ({ xp: 0, games: {}, stamps: {} });
export function load(){ try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && typeof p.xp === 'number' ? Object.assign(blank(), p) : blank(); } catch (_) { return blank(); } }
function save(p){ try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (_) {} }
export const persists = () => !!(typeof window !== 'undefined' && window.__keduScope && window.__keduScope.persist);
const need = lv => 60 + 40 * (lv - 1);                         // 레벨 lv → lv+1 에 드는 경험치
export function levelOf(xp){ let lv = 1, left = xp; while (left >= need(lv)) { left -= need(lv); lv++; } let title = TITLES[0][1]; for (const [n, s] of TITLES) if (lv >= n) title = s; return { lv, cur: left, need: need(lv), title }; }
export const medalFor = glevel => glevel >= 6 ? 3 : glevel >= 4 ? 2 : glevel >= 2 ? 1 : 0;      // 한 판에서 놀이 레벨 2·4·6 에 닿으면 동·은·금
/* 한 판 결과를 반영하고, 화면에 보여 줄 변화를 돌려준다 */
export function apply(r){ const p = load(), before = levelOf(p.xp), g = p.games[r.id] || (p.games[r.id] = { best: 0, plays: 0, medal: 0 });
  const gained = r.ok * 3 + Math.round(r.pts / 20); p.xp += gained; g.plays++; const bestNew = r.pts > g.best && r.pts > 0; if (bestNew) g.best = r.pts;
  const m = medalFor(r.glevel), medalNew = m > g.medal ? m : 0; if (medalNew) { g.medal = m; p.xp += m * 20; }
  const sk = r.id + '|' + r.term, stampNew = r.ok >= 8 && !p.stamps[sk]; if (stampNew) p.stamps[sk] = 1;
  save(p); return { gained: gained + (medalNew ? medalNew * 20 : 0), before, after: levelOf(p.xp), medalNew, stampNew, bestNew, profile: p }; }
export const counts = p => ({ medals: Object.values(p.games).filter(g => g.medal).length, gold: Object.values(p.games).filter(g => g.medal === 3).length, stamps: Object.keys(p.stamps).length });
export function reset(){ try { localStorage.removeItem(KEY); } catch (_) {} }
