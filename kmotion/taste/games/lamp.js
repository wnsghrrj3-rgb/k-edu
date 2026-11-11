/* 등불 창고(2장 「주문 싣기」 맛보기) — 주문한 수만큼 묶음·낱개를 집어 수레에 싣는다. 낱개 열 개는 묶음 하나로 「펑」.
 * 받는 문제 모양: place {n, units[]} */
import { W, H, txt, panel, circle, rr, dist, danger, sign } from '../ui.js';
import { scene, horse, glow } from '../scenes.js';
export default function(api){
  const N = 5, CART = { x: 500, y: 250, w: 560, h: 360 };
  const LOOK = { 1000: ['#b06cff', '천'], 100: ['#4d9dff', '백'], 10: ['#ffb02e', '십'], 1: ['#ffe27a', '일'] };
  const S = { i: 0, q: null, cnt: {}, held: new Map(), phase: 'play', pt: 0, pop: 0, bounce: 0, src: [] };
  const total = () => S.q.units.reduce((s, u) => s + u * S.cnt[u], 0);
  function next(){ S.q = api.pack.place(); S.cnt = {}; S.q.units.forEach(u => S.cnt[u] = 0); S.held.clear(); S.phase = 'play'; const k = S.q.units.length; S.src = S.q.units.map((u, j) => ({ u, x: 190, y: 250 + j * (k > 3 ? 110 : k > 2 ? 140 : 190) + (k === 2 ? 40 : 0) })); api.say(`${S.q.n} 실어 줘`); }
  function chip(c, u, x, y, s = 1){ const [col] = LOOK[u]; c.save(); c.translate(x, y); c.scale(s, s);
    if (u === 1) { glow(c, 0, 0, 46, 'rgba(255,240,140,A)', .6); circle(c, 0, 0, 22, col, '#b78a12', 3); } else { const w = u === 10 ? 64 : u === 100 ? 96 : 120, h = u === 10 ? 96 : 84; rr(c, -w / 2, -h / 2, w, h, 12); c.fillStyle = col; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); txt(c, u, 0, 2, u === 10 ? 34 : 32, '#1a1206'); } c.restore(); }
  return {
    id: 'lamp', icon: '🏮', title: '등불 창고', how: '수레에 적힌 수만큼 실어요. 왼쪽 상자를 쥐어서 수레 위에서 펴요. 묶음째 나르면 빨라요.', touch: '왼쪽 상자를 끌어다 수레에 놓아요',
    threatSec: 26, pushBack: .6, total: N,
    dbg: () => S,
    prog: () => [S.i, N],
    start(){ S.i = 0; next(); },
    update(dt, cur){
      S.pop = Math.max(0, S.pop - dt); S.bounce = Math.max(0, S.bounce - dt);
      if (S.phase !== 'play') { S.pt -= dt; if (S.pt <= 0) { S.i++; if (S.i >= N) return api.finish(); next(); } return; }
      for (const c of cur) {
        if (c.jg && !S.held.has(c.id)) { const s = S.src.find(s => dist(s, c) < 105); if (s) { S.held.set(c.id, s.u); api.sfx('grab'); } }
        if (S.held.has(c.id) && c.jr) { const u = S.held.get(c.id); S.held.delete(c.id);
          if (c.x > CART.x - 30 && c.x < CART.x + CART.w + 30 && c.y > CART.y - 60 && c.y < CART.y + CART.h + 60) {
            if (total() + u > S.q.n) { S.bounce = .6; api.wrong(); api.fx.shake(8); api.fx.burst(c.x, c.y, '#ff8f7a', 10, 300); }
            else { S.cnt[u]++; api.sfx('drop'); api.fx.burst(c.x, c.y, LOOK[u][0], 8, 240); const j = S.q.units.indexOf(u); if (S.cnt[u] >= 10 && j > 0) { S.cnt[u] -= 10; S.cnt[S.q.units[j - 1]]++; S.pop = .8; api.sfx('ok'); api.fx.burst(CART.x + CART.w / 2, CART.y + 160, '#ffe27a', 34, 520); api.fx.ring(CART.x + CART.w / 2, CART.y + 160, '#ffe27a'); }   // 열 개 = 큰 것 하나
              if (total() === S.q.n) { S.phase = 'ok'; S.pt = 1.1; api.correct(); api.fx.text(CART.x + CART.w / 2, CART.y + 120, '딱 맞아!', '#6dffb0', 60); } } } } }
      for (const id of [...S.held.keys()]) if (!cur.some(c => c.id === id)) S.held.delete(id);
    },
    draw(c, t){
      const v = api.threat.v, go = S.phase === 'ok' ? Math.pow(1.1 - S.pt, 2) * 700 : 0;
      scene.yard(c, t, v);
      for (const s of S.src) { panel(c, s.x - 120, s.y - 62, 240, 124, 'rgba(30,20,10,.82)', '#d1a765'); glow(c, s.x - 34, s.y, 90, 'rgba(255,210,120,A)', .35); chip(c, s.u, s.x - 34, s.y + Math.sin(t / 400 + s.y) * 3); txt(c, LOOK[s.u][1], s.x + 62, s.y, 44, '#f1dfbd'); }
      // 수레 + 말 + 주문
      c.save(); c.translate(go + (S.bounce > 0 ? Math.sin(t / 30) * 6 : 0), 0);
      horse(c, CART.x + CART.w + 96, CART.y + CART.h - 44, t, v > .7 || S.phase === 'ok');
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(CART.x + CART.w / 2, CART.y + CART.h + 62, CART.w * .52, 16, 0, 0, 7); c.fill();
      panel(c, CART.x, CART.y, CART.w, CART.h, '#6b4522', '#e2bb78', 18); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 3; for (let yy = CART.y + 60; yy < CART.y + CART.h; yy += 60) { c.beginPath(); c.moveTo(CART.x + 8, yy); c.lineTo(CART.x + CART.w - 8, yy); c.stroke(); }
      for (const wx of [CART.x + 120, CART.x + CART.w - 120]) { circle(c, wx, CART.y + CART.h + 20, 42, '#2a1c0e', '#e2bb78', 6); c.save(); c.translate(wx, CART.y + CART.h + 20); c.rotate(go / 42 + t / 4000); c.strokeStyle = '#e2bb78'; c.lineWidth = 4; for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(-38, 0); c.lineTo(38, 0); c.stroke(); } c.restore(); }
      sign(c, S.q.n, CART.x + CART.w / 2, CART.y - 72, 80);
      const colW = CART.w / S.q.units.length; S.q.units.forEach((u, j) => { const n = S.cnt[u], cx = CART.x + colW * (j + .5); txt(c, LOOK[u][1], cx, CART.y + 28, 26, '#f1dfbd', 'center', 700);
        for (let k = 0; k < n; k++) { const per = u === 1 ? 5 : 3, col = k % per, row = Math.floor(k / per), gx = u === 1 ? 52 : (u === 10 ? 70 : colW / 3.1), gy = u === 1 ? 54 : 100; chip(c, u, cx + (col - (per - 1) / 2) * Math.min(gx, colW / per), CART.y + 86 + row * gy, u === 1 ? 1 : .82); } });
      if (S.pop > 0) txt(c, '펑! 열 개가 하나로', CART.x + CART.w / 2, CART.y + CART.h - 40, 40, '#ffe27a');
      if (S.bounce > 0) txt(c, '넘쳤어!', CART.x + CART.w / 2, CART.y + CART.h - 40, 44, '#ffd0d0');
      c.restore();
      if (S.phase === 'ok') txt(c, '출발!', W / 2 - 100, 672, 56, '#6dffb0');
      for (const [id, u] of S.held) { const q = api.cursor(id); if (q) { glow(c, q.x, q.y, 110, 'rgba(255,220,120,A)', .5); chip(c, u, q.x, q.y, 1.2); } }
      // 떠날 시간(위협)
      panel(c, 40, 40, 300, 46, 'rgba(8,12,24,.75)'); c.fillStyle = v > .7 ? '#ff6b4d' : '#ffd45c'; if (v > .06) { rr(c, 46, 46, 288 * v, 34, 12); c.fill(); } txt(c, v > .7 ? '곧 떠나요!' : '떠날 시간', 190, 64, 22, '#fff', 'center', 700);
      danger(c, v, t);
    } };
}
