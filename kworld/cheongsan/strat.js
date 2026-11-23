/* 청산리 — 엿새 · 장 5 지도 판(설계 v2 ⑨ strat.js) — 고동하를 따라 마디 열 개. 마디마다 길 셋(큰길·능선·물길) 가운데 하나를 고른다.
   종이 지도처럼: 땅 그림(작은 지도와 같은 그림을 크게) 위에 마디·길·우리 부대·적 다섯 갈래(살핀 갈래는 붉은 화살, 아니면 흐린 연기). */
import { clamp, lerp } from '../scene/kit.js';
import { MAP_W, MAP_H } from './map.js';

export const NODES = [[548, 258], [478, 288], [420, 300], [360, 312], [300, 302], [240, 308], [180, 310], [120, 302], [82, 316], [48, 330], [26, 352]];
export const NODE_NAME = ['어랑촌 남쪽', '고동하 어귀', '물굽이', '맹개골', '바위 여울', '만기구', '자작 숲', '쉬구', '갈대 늪', '천보산 아래', '안도 가는 길'];
export const ROUTES = {
  road: { name: '골짜기 큰길', icon: '🛤', col: '#c8a060', net: 5, hunger: 1, troop: 0, note: '빠르다 · 들키기 쉽다 · 포위망 +4' },
  ridge: { name: '능선 길', icon: '⛰', col: '#7ab070', net: 2, hunger: 6, troop: 0, note: '느리고 배고프다 · 멀리 살핀다(적 두 갈래)' },
  river: { name: '물길(고동하)', icon: '💧', col: '#6aa0d0', net: 1, hunger: 2, troop: -1, note: '발자국이 안 남는다 · 춥다(부대 −1)' } };

export function makeStrat(img, { onPick }) {
  const cv = document.createElement('canvas'); cv.id = 'strat'; cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:4;display:none;cursor:pointer'; document.body.appendChild(cv);
  const ui = document.createElement('div'); ui.id = 'stratUi'; ui.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:5;display:none;gap:10px;flex-wrap:wrap;justify-content:center;max-width:96vw'; document.body.appendChild(ui);
  const g = cv.getContext('2d'); const R0 = [0, 215, 600, 385];   /* 지도 판이 보여 주는 넓이(x0, z0, x1, z1) */
  let st = null, anim = null, opts = [];
  function fit() { const W = innerWidth, H = innerHeight, dpr = Math.min(2, devicePixelRatio || 1); if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; } const sw = R0[2] - R0[0], sh = R0[3] - R0[1], k = Math.min(W / sw, (H - 190) / sh) * 0.94; return { W, H, dpr, k, ox: (W - sw * k) / 2 - R0[0] * k, oz: 110 + ((H - 190) - sh * k) / 2 - R0[1] * k }; }
  const pathPts = (a, b, kind) => { const n = 14, out = []; for (let i = 0; i <= n; i++) { const t = i / n, x = lerp(a[0], b[0], t), z = lerp(a[1], b[1], t), bow = Math.sin(t * Math.PI); out.push([x, z + (kind === 'ridge' ? -16 * bow : kind === 'river' ? 9 * bow + Math.sin(t * 18) * 1.4 : 2 * bow)]); } return out; };
  function draw(t) {
    if (!st || cv.style.display === 'none') return; const { W, H, dpr, k, ox, oz } = fit(); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, W, H);
    const sx = img.width / MAP_W, sz = img.height / MAP_H; g.globalAlpha = 0.9; g.drawImage(img, R0[0] * sx, R0[1] * sz, (R0[2] - R0[0]) * sx, (R0[3] - R0[1]) * sz, R0[0] * k + ox, R0[1] * k + oz, (R0[2] - R0[0]) * k, (R0[3] - R0[1]) * k); g.globalAlpha = 1;
    g.fillStyle = 'rgba(240,226,196,.25)'; g.fillRect(R0[0] * k + ox, R0[1] * k + oz, (R0[2] - R0[0]) * k, (R0[3] - R0[1]) * k);
    const P = (p) => [p[0] * k + ox, p[1] * k + oz];
    /* 길: 지나온 마디는 진하게(고른 길), 앞은 흐리게 셋 */
    for (let i = 0; i < NODES.length - 1; i++) { const done = i < st.at, kinds = done ? [st.taken[i] || 'road'] : ['road', 'ridge', 'river'];
      for (const kd of kinds) { const pts = pathPts(NODES[i], NODES[i + 1], kd); g.strokeStyle = ROUTES[kd].col; g.globalAlpha = done ? 1 : i === st.at ? 0.95 : 0.35; g.lineWidth = done ? 5 : i === st.at ? 4 : 2.5; g.setLineDash(kd === 'ridge' ? [7, 5] : []); g.beginPath(); pts.forEach((p, j) => { const q = P(p); j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); }
      g.setLineDash([]); g.globalAlpha = 1; }
    /* 마디 */
    NODES.forEach((n, i) => { const q = P(n), ev = st.events[i]; g.fillStyle = i < st.at ? '#5a4a30' : i === st.at ? '#ffcf4d' : '#fffaf0'; g.strokeStyle = '#3a2a10'; g.lineWidth = 2; g.beginPath(); g.arc(q[0], q[1], i === st.at ? 9 : 6, 0, 6.28); g.fill(); g.stroke();
      g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillStyle = '#2a2010'; g.fillText(NODE_NAME[i] + (ev && i > st.at - 1 ? ' ' + ev.icon : ''), q[0], q[1] - 13); });
    /* 적 다섯 갈래 — 포위망만큼 가까이 */
    const me = anim ? anim.pos : NODES[st.at], f = clamp(st.net / 100, 0, 1);
    st.branches.forEach((b, i) => { const from = b.from, x = lerp(from[0], me[0], f * 0.9 + 0.05), z = lerp(from[1], me[1], f * 0.9 + 0.05) + Math.sin(t * 0.8 + i) * 2, q = P([x, z]), a = Math.atan2(me[1] - z, me[0] - x), seen = st.seen[b.k];
      g.save(); g.translate(q[0], q[1]); if (seen) { g.rotate(a); g.fillStyle = b.lured ? '#a08070' : '#d8301e'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -11); g.lineTo(-5, 0); g.lineTo(-10, 11); g.closePath(); g.fill(); g.stroke(); g.rotate(-a); g.font = 'bold 12px sans-serif'; g.fillStyle = '#5a1008'; g.textAlign = 'center'; g.fillText(b.name + (b.lured ? '(속음)' : ''), 0, 24); }
      else { g.fillStyle = 'rgba(110,100,90,.45)'; for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(Math.sin(t + j) * 4, -j * 7, 7 + j * 2.5, 0, 6.28); g.fill(); } } g.restore(); });
    /* 우리 부대 */
    { const q = P(me); g.fillStyle = '#ffcf4d'; g.strokeStyle = '#2a2010'; g.lineWidth = 3; g.beginPath(); g.arc(q[0], q[1], 11, 0, 6.28); g.fill(); g.stroke(); g.font = 'bold 14px sans-serif'; g.fillStyle = '#2a2010'; g.textAlign = 'center'; g.fillText('우리', q[0], q[1] + 5); }
    /* 위 글 */
    g.font = 'bold 17px sans-serif'; const mw = Math.min(W - 20, g.measureText(st.msg || '').width + 40); g.fillStyle = 'rgba(30,26,20,.85)'; g.fillRect(W / 2 - mw / 2, 112, mw, 34); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(st.msg || '', W / 2, 135);
  }
  function show(state, options, msg) { st = state; st.msg = msg; opts = options; cv.style.display = 'block'; ui.style.display = options.length ? 'flex' : 'none';
    ui.innerHTML = options.map((o, i) => `<button data-i="${i}" style="font-family:inherit;font-weight:900;font-size:16px;border:0;border-radius:14px;padding:10px 14px;background:${i === 0 ? '#ffcf4d' : '#f6ecd4'};color:#2a2410;box-shadow:0 4px 0 #a88a40;cursor:pointer;min-width:150px">${i + 1}. ${o.t}<small style="display:block;font-size:12px;font-weight:700;opacity:.85;margin-top:2px">${o.s || ''}</small></button>`).join('');
    ui.querySelectorAll('button').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); pick(+b.dataset.i); })); }
  function pick(i) { const o = opts[i]; if (!o || anim) return; ui.style.display = 'none'; opts = []; onPick(o); }
  function hide() { cv.style.display = 'none'; ui.style.display = 'none'; opts = []; }
  function march(from, to, kind, sec, done) { const pts = pathPts(from, to, kind); anim = { pts, t: 0, sec, done, pos: from.slice() }; }
  function update(dt) { if (anim) { anim.t += dt; const f = clamp(anim.t / anim.sec, 0, 1), i = Math.min(anim.pts.length - 2, Math.floor(f * (anim.pts.length - 1))), u = f * (anim.pts.length - 1) - i; anim.pos = [lerp(anim.pts[i][0], anim.pts[i + 1][0], u), lerp(anim.pts[i][1], anim.pts[i + 1][1], u)]; if (f >= 1) { const d = anim.done; anim = null; d(); } } }
  addEventListener('keydown', (e) => { if (cv.style.display === 'none' || !opts.length) return; if (/^Digit[1-4]$/.test(e.code)) pick(+e.code.slice(5) - 1); });
  return { show, hide, draw, update, pick, march, get busy() { return !!anim; }, get open() { return cv.style.display !== 'none'; }, get opts() { return opts; } };
}
