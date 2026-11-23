/* 수학 놀이터 「끌어 놓기」(T05 짝 잇기 틀 — 뒤 틀 T06 줄 세우기 · T07 견주기도 쓴다).
 * 끌기와 「누르고 → 누르기」를 같은 판정으로 돌려준다: onDrop({ from, to, how: 'drag' | 'tap' }).
 *   sources() = 집을 수 있는 것 [{ id, x, y, r }] · targets() = 놓을 곳 [{ id, x, y, rect? }] (화면 좌표 — 부르는 쪽이 장면마다 계산)
 *   놓을 곳 판정: rect 안이거나 (x, y)에서 R(px) 안 — 둘 이상이면 가까운 쪽. 아니면 onCancel(from)(줄이 스르르 돌아온다 · 벌 없음).
 *   끄는 동안 집은 것에서 손끝까지 줄(밧줄 — 코드로 그린 화면 위 선)을 그린다. 손을 떼지 않고 R 안에 들어오면 그 곳이 들썩(onHover).
 *   집은 것을 누르기만 하면(끌지 않으면) 「들었다」(onArm) — 둘째로 누를 곳을 부르는 쪽이 들썩여 준다(정본 5-11절). 그다음 놓을 곳을 누르면 onDrop(how 'tap').
 *   그 밖의 누름은 onTap({ x, y, target, armed }) — 부르는 쪽이 물결 · 손 · 한 줄 안내(5-11)를 띄운다. enabled() 가 거짓이면 onBusy({ x, y }).
 * 화면 굴림과 싸우지 않게 el 에 touch-action:none. 화면 위 표시(줄 · 반경 원)는 svg 하나(#dragsvg). */
export const DRAG = { R: 80, SLOP: 12, ROPE: '#a0703a', ROPE_DARK: '#6b4423', ROPE_W: 7, SAG: .12, BACK_MS: 260 };

let svg = null;
const NSV = 'http://www.w3.org/2000/svg';
function layer(){ if (svg) return svg; svg = document.createElementNS(NSV, 'svg'); svg.id = 'dragsvg'; svg.setAttribute('style', 'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:4;overflow:visible'); document.body.appendChild(svg); return svg; }
const pathOf = (a, b) => { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + Math.hypot(b.x - a.x, b.y - a.y) * DRAG.SAG; return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`; };
/** 줄 하나를 a → b 로 그린다(id 마다 하나 · 축 늘어진 밧줄). a 나 b 가 없으면 지운다. */
export function line(id, a, b){ const s = layer(); let g = s.querySelector(`g[data-id="${id}"]`);
  if (!a || !b) { if (g) g.remove(); return; }
  if (!g) { g = document.createElementNS(NSV, 'g'); g.dataset.id = id; for (const [col, w, dash] of [[DRAG.ROPE_DARK, DRAG.ROPE_W + 3, ''], [DRAG.ROPE, DRAG.ROPE_W, ''], ['rgba(255,235,190,.7)', DRAG.ROPE_W * .4, '6 7']]) { const p = document.createElementNS(NSV, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', col); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round'); if (dash) p.setAttribute('stroke-dasharray', dash); g.appendChild(p); } s.appendChild(g); }
  const d = pathOf(a, b); for (const p of g.children) p.setAttribute('d', d); }
export const lines = () => (svg ? svg.querySelectorAll('g[data-id]').length : 0);
/** 줄이 스르르 돌아온다(b → a 로 줄어듦). */
export function retract(id, a, b, ms = DRAG.BACK_MS){ return new Promise(res => { const t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / ms), e = k * k; line(id, a, { x: b.x + (a.x - b.x) * e, y: b.y + (a.y - b.y) * e }); if (k < 1) requestAnimationFrame(step); else { line(id, null); res(); } }; requestAnimationFrame(step); }); }
/** 놓는 반경을 화면에 그린다(검사 · 교사용) — pts = [{ x, y, rect? }] · 없으면 지운다. */
export function showRadius(pts, R = DRAG.R){ const s = layer(); s.querySelectorAll('.radius').forEach(e => e.remove()); if (!pts) return;
  for (const q of pts) { const c = document.createElementNS(NSV, 'circle'); c.setAttribute('class', 'radius'); c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); c.setAttribute('r', R); c.setAttribute('fill', 'rgba(255,230,120,.18)'); c.setAttribute('stroke', 'rgba(255,200,40,.95)'); c.setAttribute('stroke-width', 3); c.setAttribute('stroke-dasharray', '10 6'); s.appendChild(c);
    if (q.rect) { const r = document.createElementNS(NSV, 'rect'); r.setAttribute('class', 'radius'); r.setAttribute('x', q.rect.left); r.setAttribute('y', q.rect.top); r.setAttribute('width', q.rect.right - q.rect.left); r.setAttribute('height', q.rect.bottom - q.rect.top); r.setAttribute('fill', 'none'); r.setAttribute('stroke', 'rgba(255,255,255,.9)'); r.setAttribute('stroke-width', 2); r.setAttribute('stroke-dasharray', '4 4'); s.appendChild(r); } } }

/** 놓을 곳 찾기: rect 안이거나 R 안 — 가까운 쪽. */
export function targetAt(list, x, y, R = DRAG.R){ let best = null, d0 = Infinity;
  for (const t of list) { if (!t) continue; const inRect = t.rect && x >= t.rect.left && x <= t.rect.right && y >= t.rect.top && y <= t.rect.bottom, d = Math.hypot(t.x - x, t.y - y);
    if ((inRect || d <= R) && d < d0) { d0 = d; best = t; } }
  return best; }
const sourceAt = (list, x, y) => { let best = null, d0 = Infinity; for (const s of list) { if (!s) continue; const d = Math.hypot(s.x - x, s.y - y); if (d <= (s.r || 40) && d < d0) { d0 = d; best = s; } } return best; };

/** 끌어 놓기를 단다. → { armed(), disarm(), cancel(), state() } */
export function drag(el, o){ const R = () => (typeof o.R === 'function' ? o.R() : o.R) || DRAG.R; let cur = null, armedId = null, hoverId = null;
  el.style.touchAction = 'none';
  const ropeFrom = id => { const s = (o.sources() || []).find(q => q && q.id === id); return s ? { x: s.x, y: s.y } : null; };
  const setHover = id => { if (id === hoverId) return; hoverId = id; if (o.onHover) o.onHover(id); };
  el.addEventListener('pointerdown', e => { if (e.button > 0) return; const x = e.clientX, y = e.clientY;
    if (o.enabled && !o.enabled()) { cur = null; if (o.onBusy) o.onBusy({ x, y }); return; }
    const s = sourceAt(o.sources() || [], x, y);
    if (s) { cur = { id: s.id, x0: x, y0: y, moved: false, pid: e.pointerId }; try { el.setPointerCapture(e.pointerId); } catch (_) {} return; }
    cur = null; const t = targetAt(o.targets() || [], x, y, R());
    if (armedId != null && t) { const from = armedId; armedId = null; if (o.onDisarm) o.onDisarm(from); o.onDrop({ from, to: t.id, how: 'tap', x, y }); return; }
    if (o.onTap) o.onTap({ x, y, target: t ? t.id : null, armed: armedId }); });
  el.addEventListener('pointermove', e => { if (!cur || e.pointerId !== cur.pid) return; const x = e.clientX, y = e.clientY;
    if (!cur.moved && Math.hypot(x - cur.x0, y - cur.y0) > DRAG.SLOP) { cur.moved = true; if (armedId != null) { const a = armedId; armedId = null; if (o.onDisarm) o.onDisarm(a); } if (o.onDragStart) o.onDragStart(cur.id); }
    if (cur.moved) { if (o.enabled && !o.enabled()) { const id = cur.id; cur = null; line('drag', null); setHover(null); if (o.onCancel) o.onCancel(id, null); return; }
      line('drag', ropeFrom(cur.id), { x, y }); const t = targetAt(o.targets() || [], x, y, R()); setHover(t ? t.id : null); if (o.onMove) o.onMove(cur.id, x, y); } });
  const up = e => { if (!cur || e.pointerId !== cur.pid) return; const c = cur; cur = null; const x = e.clientX, y = e.clientY; setHover(null);
    if (!c.moved) { if (o.enabled && !o.enabled()) { if (o.onBusy) o.onBusy({ x, y }); return; } armedId = c.id; if (o.onArm) o.onArm(c.id, { x, y }); return; }
    const a = ropeFrom(c.id), t = e.type === 'pointerup' && (!o.enabled || o.enabled()) ? targetAt(o.targets() || [], x, y, R()) : null;
    if (t) { line('drag', null); o.onDrop({ from: c.id, to: t.id, how: 'drag', x, y }); return; }
    if (a) retract('drag', a, { x, y }); else line('drag', null); if (o.onCancel) o.onCancel(c.id, { x, y }); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  return { armed: () => armedId, disarm(){ const a = armedId; armedId = null; if (a != null && o.onDisarm) o.onDisarm(a); }, cancel(){ cur = null; armedId = null; line('drag', null); setHover(null); }, dragging: () => !!(cur && cur.moved), state: () => ({ armed: armedId, dragging: !!(cur && cur.moved), hover: hoverId }) }; }
