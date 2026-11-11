/* 등불 창고(2장 「주문 싣기」 맛보기) — 주문한 수만큼 묶음·낱개를 집어 수레에 싣는다. 낱개 열 개는 묶음 하나로 「펑」.
 * 받는 문제 모양: place {n, units[]} */
import { W, H, txt, panel, circle, rr, dist, danger, sign } from '../ui.js';
export default function(api){
  const N = 5, CART = { x: 560, y: 250, w: 640, h: 360 };
  const LOOK = { 1000: ['#b06cff', '천'], 100: ['#4d9dff', '백'], 10: ['#ffb02e', '십'], 1: ['#ffe27a', '일'] };
  const S = { i: 0, q: null, cnt: {}, held: new Map(), phase: 'play', pt: 0, pop: 0, bounce: 0, src: [] };
  const total = () => S.q.units.reduce((s, u) => s + u * S.cnt[u], 0);
  function next(){ S.q = api.pack.place(); S.cnt = {}; S.q.units.forEach(u => S.cnt[u] = 0); S.held.clear(); S.phase = 'play'; const k = S.q.units.length; S.src = S.q.units.map((u, j) => ({ u, x: 190, y: 250 + j * (k > 3 ? 110 : k > 2 ? 140 : 190) + (k === 2 ? 40 : 0) })); api.say(`${S.q.n} 실어 줘`); }
  function chip(c, u, x, y, s = 1){ const [col] = LOOK[u]; c.save(); c.translate(x, y); c.scale(s, s);
    if (u === 1) circle(c, 0, 0, 24, col, '#b78a12', 3); else { const w = u === 10 ? 64 : u === 100 ? 96 : 120, h = u === 10 ? 96 : 84; rr(c, -w / 2, -h / 2, w, h, 12); c.fillStyle = col; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.stroke(); txt(c, u, 0, 2, u === 10 ? 34 : 32, '#1a1206'); } c.restore(); }
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
            if (total() + u > S.q.n) { S.bounce = .6; api.wrong(); }
            else { S.cnt[u]++; api.sfx('drop'); const j = S.q.units.indexOf(u); if (S.cnt[u] >= 10 && j > 0) { S.cnt[u] -= 10; S.cnt[S.q.units[j - 1]]++; S.pop = .8; api.sfx('ok'); }   // 열 개 = 큰 것 하나
              if (total() === S.q.n) { S.phase = 'ok'; S.pt = 1.1; api.correct(); } } } } }
      for (const id of [...S.held.keys()]) if (!cur.some(c => c.id === id)) S.held.delete(id);
    },
    draw(c, t){
      c.fillStyle = '#221a12'; c.fillRect(0, 0, W, H); c.fillStyle = '#31261a'; c.fillRect(0, 620, W, 100);
      for (const s of S.src) { panel(c, s.x - 110, s.y - 62, 220, 124, 'rgba(255,255,255,.07)', 'rgba(255,255,255,.25)'); chip(c, s.u, s.x - 30, s.y); txt(c, LOOK[s.u][1], s.x + 62, s.y, 40, '#d9c7a6'); }
      // 수레 + 주문
      const v = api.threat.v, go = S.phase === 'ok' ? (1.1 - S.pt) * 500 : 0;
      c.save(); c.translate(go + (S.bounce > 0 ? Math.sin(t / 30) * 6 : 0), 0);
      panel(c, CART.x, CART.y, CART.w, CART.h, '#5a3b1e', '#d1a765', 18); circle(c, CART.x + 120, CART.y + CART.h + 20, 40, '#2a1c0e', '#d1a765'); circle(c, CART.x + CART.w - 120, CART.y + CART.h + 20, 40, '#2a1c0e', '#d1a765');
      sign(c, S.q.n, CART.x + CART.w / 2, CART.y - 70, 78);
      const colW = CART.w / S.q.units.length; S.q.units.forEach((u, j) => { const n = S.cnt[u], cx = CART.x + colW * (j + .5); txt(c, LOOK[u][1], cx, CART.y + 28, 26, '#e8d2a8', 'center', 700);
        for (let k = 0; k < n; k++) { const per = u === 1 ? 5 : 3, col = k % per, row = Math.floor(k / per), gx = u === 1 ? 52 : (u === 10 ? 70 : colW / 3.1), gy = u === 1 ? 54 : 100; chip(c, u, cx + (col - (per - 1) / 2) * Math.min(gx, colW / per), CART.y + 86 + row * gy, u === 1 ? 1 : .82); } });
      if (S.pop > 0) txt(c, '펑! 열 개가 하나로', CART.x + CART.w / 2, CART.y + CART.h - 40, 40, '#ffe27a');
      if (S.bounce > 0) txt(c, '넘쳤어!', CART.x + CART.w / 2, CART.y + CART.h - 40, 44, '#ffb3b3');
      c.restore();
      if (S.phase === 'ok') txt(c, '출발!', W / 2, 660, 54, '#6dffb0');
      for (const [id, u] of S.held) { const q = api.cursor(id); if (q) chip(c, u, q.x, q.y, 1.15); }
      // 떠날 시간(위협)
      panel(c, 40, 40, 300, 46, 'rgba(8,12,24,.7)'); c.fillStyle = v > .7 ? '#ff6b4d' : '#ffd45c'; if (v > .06) { rr(c, 46, 46, 288 * v, 34, 12); c.fill(); } txt(c, '🐴 곧 떠나요', 190, 64, 22, '#fff', 'center', 700);
      danger(c, v, t);
    } };
}
