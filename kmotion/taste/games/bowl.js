/* 볼링(볼링에서 가져온 틀) — 공을 굴리면 핀이 쓰러지고 막이 내려온다. 쓰러진 핀을 보고 남은 핀 수를 맞힌다.
 * 받는 문제 모양: pins {n, k, ans, opts[3]} */
import { W, H, txt, panel, circle, rr, lerp, clamp, dist, danger } from '../ui.js';
import { scene } from '../scenes.js';
export default function(api){
  const BALL = { x: 640, y: 610 }, OPT = [390, 640, 890], OY = 600;
  const S = { q: null, phase: 'aim', pt: 0, bt: 0, pins: [], pick: -1, ok: false, len: 1 };
  function layout(n){ const out = []; let row = 1, left = n; const rows = []; while (left > 0) { const m = Math.min(row, left, 8); rows.push(m); left -= m; row++; } const R = rows.length; rows.forEach((m, r) => { for (let k = 0; k < m; k++) out.push({ x: 640 + (k - (m - 1) / 2) * (R > 5 ? 50 : 62), y: 330 - r * (R > 5 ? 26 : 34), down: false, lx: 0, ly: 0, la: 0 }); }); return out; }
  function next(){ S.q = api.pack.pins(); S.pins = layout(S.q.n); S.phase = 'aim'; S.pick = -1; api.say(`핀이 ${S.q.n}개야. 공을 굴려 봐`); }
  function pin(c, x, y, s = 1, lying = 0){ c.save(); c.translate(x, y); c.rotate(lying); c.scale(s, s); c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(0, 4, 13, 5, 0, 0, 7); c.fill(); c.fillStyle = '#fbfbf5'; c.beginPath(); c.ellipse(0, -18, 12, 20, 0, 0, 7); c.fill(); c.beginPath(); c.arc(0, -44, 9, 0, 7); c.fill(); c.strokeStyle = '#c9c4b4'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#e5484d'; c.fillRect(-8, -36, 16, 5); c.restore(); }
  return {
    id: 'bowl', icon: '🎳', title: '볼링', tag: '터치', how: '공에 손을 대고 쥐면 굴러가요. 쓰러진 핀을 보고, 막 뒤에 남은 핀이 몇 개인지 골라요.', touch: '공을 눌러 굴려요. 쓰러진 핀을 보고 남은 핀 수를 골라요',
    threatSec: 20, pushBack: .5,
    dbg: () => S,
    start(){ next(); },
    update(dt, cur){
      if (S.phase === 'aim') { for (const c of cur) if (c.jg && dist(c, BALL) < 130) { S.phase = 'roll'; S.bt = 0; api.sfx('grab'); } return; }
      if (S.phase === 'roll') { S.bt += dt / .75; if (S.bt >= 1) { const idx = S.pins.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(api.rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
          idx.slice(0, S.q.k).forEach((i, m) => { const p = S.pins[i]; p.down = true; const per = S.q.k > 12 ? 10 : 6; p.lx = 150 + (m % per) * (S.q.k > 12 ? 30 : 44); p.ly = 470 + Math.floor(m / per) * 34; p.la = 1.2 + api.rnd() * .7; });
          S.phase = 'crash'; S.pt = .9; api.sfx('hit'); api.fx.shake(16); api.fx.burst(640, 300, '#fff', 30, 600); } return; }
      if (S.phase === 'crash') { S.pt -= dt; if (S.pt <= 0) { S.phase = 'ask'; api.say(`${S.q.k}개 쓰러졌어. 남은 핀은 몇 개?`); } return; }
      if (S.phase === 'ask') { for (const c of cur) { if (!c.jg) continue; const k = OPT.findIndex(x => Math.abs(c.x - x) < 110 && Math.abs(c.y - OY) < 80); if (k < 0) continue; S.pick = k; S.ok = S.q.opts[k] === S.q.ans; S.phase = 'show'; S.pt = S.len = S.ok ? 1.3 : 2.0; if (S.ok) { api.correct(); api.fx.burst(OPT[k], OY, '#ffe27a', 28, 500); } else { api.wrong(); api.fx.shake(10); } break; } return; }
      if (S.phase === 'show') { S.pt -= dt; if (S.pt <= 0) next(); }
    },
    draw(c, t){
      const v = api.threat.v, q = S.q; scene.alley(c, t, v);
      const hide = S.phase === 'ask', reveal = S.phase === 'show';
      for (const p of S.pins) if (!p.down) pin(c, p.x, p.y, 1.25);
      // 막(남은 핀을 가린다)
      const drop = S.phase === 'crash' ? 1 - Math.max(0, S.pt - .3) / .6 : hide ? 1 : reveal ? Math.max(0, 1 - (S.len - S.pt) * 3) : 0; if (drop > 0) { const y0 = 70, hh = 330 * Math.min(1, drop); c.fillStyle = '#7a2a8a'; c.fillRect(W / 2 - 300, y0, 600, hh); c.fillStyle = '#9a3fb0'; for (let x = W / 2 - 300; x < W / 2 + 300; x += 50) c.fillRect(x, y0, 24, hh); c.fillStyle = '#ffd35c'; c.fillRect(W / 2 - 300, y0 + hh - 10, 600, 10); if (hide) txt(c, '?', W / 2, 240, 130, '#fff'); }
      panel(c, 110, 340, 330, 64, 'rgba(10,8,30,.75)', '#ffd35c'); txt(c, `핀은 모두 ${q.n}개`, 275, 373, 34, '#ffe27a');
      // 쓰러진 핀(왼쪽에 모아 보여 줌)
      const fallen = S.pins.filter(p => p.down); if (fallen.length) { panel(c, 110, 420, 330, fallen.length > 12 ? 160 : 120, 'rgba(10,8,30,.6)', 'rgba(255,255,255,.25)'); txt(c, `쓰러진 핀 ${reveal || hide ? q.k : ''}`, 275, 440, 24, '#e8dcff', 'center', 700); for (const p of fallen) pin(c, p.lx, p.ly + 26, .8, p.la); }
      // 공
      if (S.phase === 'aim' || S.phase === 'roll') { const u = S.phase === 'roll' ? clamp(S.bt, 0, 1) : 0, bx = BALL.x, by = lerp(BALL.y, 330, u), r = lerp(74, 34, u); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(bx, by + r * .9, r, r * .25, 0, 0, 7); c.fill(); const g = c.createRadialGradient(bx - r * .3, by - r * .3, r * .1, bx, by, r); g.addColorStop(0, '#7fd0ff'); g.addColorStop(1, '#1a4fb0'); c.fillStyle = g; c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); c.save(); c.translate(bx, by); c.rotate(u * 9); for (const [dx, dy] of [[-.2, -.3], [.15, -.35], [0, -.05]]) circle(c, dx * r, dy * r, r * .11, '#0a1a44'); c.restore(); if (S.phase === 'aim') txt(c, '공을 톡!', W / 2, 500 + Math.sin(t / 200) * 6, 40, '#fff'); }
      if (hide || reveal) { txt(c, '남은 핀은?', W / 2, 500, 44, '#fff'); q.opts.forEach((o, k) => { const x = OPT[k], good = o === q.ans; const g = c.createRadialGradient(x - 20, OY - 24, 8, x, OY, 76); g.addColorStop(0, '#fff'); g.addColorStop(1, reveal ? (good ? '#35d07f' : k === S.pick ? '#e5484d' : '#bbb') : '#ffd35c'); c.fillStyle = g; c.beginPath(); c.arc(x, OY, 76, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 6; c.stroke(); txt(c, o, x, OY + 3, 62, '#2b1c00'); }); }
      if (reveal) { panel(c, 820, 205, 330, 90, 'rgba(10,8,30,.75)', S.ok ? '#6dffb0' : '#ff8f9a'); txt(c, `${q.n} − ${q.k} = ${q.ans}`, 985, 252, 50, S.ok ? '#6dffb0' : '#ffd0d0'); }
      danger(c, v, t);
    } };
}
