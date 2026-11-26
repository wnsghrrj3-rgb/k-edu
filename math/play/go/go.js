/* 수학 놀이터 「고르는 화면」 한 곳(T03 · 정본 27 문서 5-10절) — 단원 줄 · 깃발 · 빈 깃대 · 꼬리표 · 「할 수 있어요」.
 * 가르기 틀 들머리(split/)에서 옮겨 왔다 — 통과 규칙 · 저장 · 깃발 모양은 그대로. 깃발을 누르면 그 낱칸의 틀로 간다(cells.js 의 frame → /math/play/<틀>/?cell=<낱칸>).
 * 학년 · 단원 꼬리표는 이 화면(과 부모 화면)에만. 깃발 줄은 내용 지도 차례 · 사이의 아직 없는 낱칸은 빈 깃대 하나(지도에 구멍이 있다는 것을 숨기지 않는다).
 * 시작점과 열림: built.js STARTS · map.js openSet — 이미 열렸거나 딴 깃발은 닫지 않는다. 누름에는 늘 답이 있다(5-11): 잠긴 깃발 · 빈 곳 → 물결 + 손이 열린 깃발을 짚는다.
 * 통째로 빈 단원(만들어진 낱칸이 하나도 없는 단원)은 같은 학년끼리 흐린 줄 하나로 묶는다(T11 — 「1학년 2학기 · 덧셈과 뺄셈 1 · 2 · 3 — 아직」 · 빈 깃대 하나). 구멍을 숨기지 않되 화면을 빈 줄로 채우지 않는다.
 * 「오늘의 번쩍」 단추(T09): 깃발 줄들 위에 하나(낱칸이 아니라 줄에 끼우지 않는다 · 꼬리표 없음). 세 모습 — 꺼짐(통과한 낱칸 없음) · 켜짐(오늘 할 것 — 심지가 반짝 · 오늘 별을 딸 수 있는 깃발 수만큼 별 테 · 셋까지) · 터짐(오늘 끝 · 그날 가장 큰 불꽃). */
import * as M from '../common/map.js?v=13';
import * as H from '../common/hint.js?v=5';
import { BUILT } from '../common/built.js?v=10';
import { art } from '../common/art.js?v=11';
import { audio, tone, wallet } from '../common/kit.js?v=8';
import { cell as cellOf, tag, CELLS } from '../common/cells.js?v=1';
import * as V from '../flash/review.js?v=6';
import { gradeNo } from './next.js?v=1';

const ICON = { flag: 'flag', star: 'flag.star', fuse: 'flash.fuse', burst: 'flash.burst' };
const $ = id => document.getElementById(id);
const log = [];
/** 낱칸이 갈 곳(틀 주소). */
export const href = id => `/math/play/${cellOf(id).frame}/?cell=${id}`;
export const todayHref = () => '/math/play/flash/?today=1';

function draw(){ const g = $('gate'), m = M.all(), ids = BUILT, open = M.openSet(m, ids); for (const id of open) if (!(m[id] || {}).seen) M.put(id, { ...M.get(id), seen: 1 });   /* 한 번 열린 채 보인 깃발은 닫지 않는다 */
  const can2 = id => open.includes(id) || M.passed(m[id]), back = id => { for (let k = ids.indexOf(id) - 1; k >= 0; k--) if (can2(ids[k]) && gradeNo(ids[k]) === gradeNo(id)) return ids[k]; return null; };   /* 같은 학년 안에서만(2학년 J01 이 막혀도 1학년 깃발을 흔들지 않음 · 없으면 흔들지 않음 · T11) */
  const nudge = new Set(open.filter(id => M.stuck(m[id]) >= 2).map(back).filter(Boolean));   /* 막힌 낱칸의 앞 깃발(열렸거나 딴 것 가운데 가장 가까운 것)이 살짝 흔들림(권할 뿐) */
  const can = ids.filter(id => M.passed(m[id])).map(id => `<p>${cellOf(id).can}${M.kept(m[id]) ? ' ' + art(ICON.star) : ''}</p>`).join('');
  const all = CELLS.map(c => c.id), lo = Math.min(...ids.map(id => all.indexOf(id))), hi = Math.max(...ids.map(id => all.indexOf(id))), unitsAll = [...new Set(all.slice(lo, hi + 1).map(id => cellOf(id).unit))], has = u => ids.some(id => cellOf(id).unit === u);
  const flag = id => { const r = m[id], cls = M.passed(r) ? 'won' : open.includes(id) ? 'open' : 'locked';
    return `<button class="flag ${cls}${nudge.has(id) ? ' nudge' : ''}" data-id="${id}" data-frame="${cellOf(id).frame}" type="button"${cls === 'locked' ? ' aria-disabled="true"' : ''}><span class="pic">${art(ICON.flag)}</span><span class="nm">${cellOf(id).name}</span>${M.kept(r) ? `<span class="star">${art(ICON.star)}</span>` : ''}</button>`; };
  const pole = '<div class="pole"><span class="stick"></span><span class="nm">아직 만드는 중</span></div>';
  const row = u => { const out = []; let gap = false; for (let k = 0; k < all.length; k++) {   /* 그 단원의 낱칸 모두(마지막 단원의 뒤쪽 빈 낱칸도 빈 깃대 하나 — T10 「C04 · 빈 깃대(C05~C09)」) */ const id = all[k]; if (cellOf(id).unit !== u) continue; if (ids.includes(id)) { if (gap) out.push(pole); gap = false; out.push(flag(id)); } else gap = true; }
    if (gap) out.push(pole); return `<div class="unit"><div class="tag">${tag(ids.find(id => cellOf(id).unit === u))}</div><div class="flags">${out.join('')}</div></div>`; };
  const gradeOf = u => cellOf(all.find(id => cellOf(id).unit === u)).grade, short = u => u.replace(/\s*\(.*\)\s*$/, '');
  const names = us => { const ns = us.map(short), m = ns.map(n => n.match(/^(.*) (\d+)$/)); return m.every(x => x && x[1] === m[0][1]) ? m[0][1] + ' ' + m.map(x => x[2]).join(' · ') : ns.join(' · '); };   /* 「덧셈과 뺄셈 1 · 2 · 3」 · 「세 자리 수 · 덧셈과 뺄셈」 */
  const ghost = us => `<div class="unit ghost" data-units="${us.length}"><div class="tag">${gradeOf(us[0])} · ${names(us)} — 아직</div><div class="flags">${pole}</div></div>`;
  const rows = []; let empty = []; const flush = () => { if (empty.length) rows.push(ghost(empty)); empty = []; };
  for (const u of unitsAll) { if (has(u)) { flush(); rows.push(row(u)); } else { if (empty.length && gradeOf(empty[0]) !== gradeOf(u)) flush(); empty.push(u); } } flush();
  const ts = V.status(m, M.dayKey()), tsub = ts.look === 'off' ? '깃발을 하나 따면 켜져요' : ts.look === 'done' ? '오늘은 다 했어요. 내일 또 만나요' : '',
    stars = ts.look !== 'off' && ts.stars ? `<span class="rings">${Array.from({ length: Math.min(3, ts.stars) }, () => `<i class="${ts.look === 'on' ? 'empty' : 'got'}"><b>${art(ICON.star)}</b></i>`).join('')}</span>` : '',   /* 켜짐 = 오늘 딸 수 있는 별의 빈 테(흐린 별) · 터짐 = 오늘 딴 별만 채움 */
    today = `<button id="today" class="today ${ts.look}" type="button" data-look="${ts.look}" data-stars="${ts.look !== 'off' ? Math.min(3, ts.stars) : 0}"${ts.look === 'off' ? ' aria-disabled="true"' : ''}><span class="pic" style="--best:${ts.best | 0}">${art(ts.look === 'done' ? ICON.burst : ICON.fuse)}</span><span class="tx"><span class="nm">오늘의 번쩍</span>${tsub ? `<span class="sub">${tsub}</span>` : ''}</span>${stars}</button>`;
  g.innerHTML = `<div class="title">수학 길</div>${today}${rows.join('')}${can ? `<div class="can"><b>할 수 있어요</b>${can}</div>` : ''}`;
  g.querySelectorAll('.flag').forEach(b => b.addEventListener('click', e => { audio(); const id = b.dataset.id;
    if (b.classList.contains('locked')) { H.ripple(e.clientX, e.clientY); tone(200, .12, 'sine', .06); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); pointOpen(); log.push({ locked: id }); return; }
    log.push({ go: id }); location.href = href(id); }));
  const tb = g.querySelector('#today'); tb.addEventListener('click', e => { audio(); if (ts.look === 'off') { H.ripple(e.clientX, e.clientY); tone(200, .12, 'sine', .06); tb.classList.remove('shake'); void tb.offsetWidth; tb.classList.add('shake'); pointOpen(); log.push({ todayOff: true }); return; } log.push({ today: ts.look }); location.href = todayHref(); });
  log.push({ draw: open.join(), today: ts.look, stars: ts.stars }); }
/** 손이 열린 깃발(내용 지도 차례로 첫 것)을 짚는다. */
function pointOpen(){ const b = document.querySelector('#gate .flag.open'); if (b) H.at(b); }
document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.flag, a, #today')) return; audio(); H.ripple(e.clientX, e.clientY); setTimeout(pointOpen, 0); log.push({ empty: true }); });   /* 손 그림은 누르면 사라지므로 한 박자 뒤에 띄운다 */
if (!wallet.persists()) { const n = document.createElement('div'); n.id = 'note'; n.textContent = '지금은 구경 중이에요 · 화면을 나가면 깃발이 처음으로 돌아가요'; document.body.appendChild(n); }
draw();
addEventListener('pageshow', e => { if (e.persisted) { M.reload(); draw(); } });   /* 「뒤로」로 돌아와도 새 깃발로(검수 3) */
window.__go = { M, V, draw, href, todayHref, log, open: () => M.openSet(M.all()), status: () => V.status(M.all(), M.dayKey()) };
