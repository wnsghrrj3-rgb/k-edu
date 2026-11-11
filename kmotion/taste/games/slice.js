/* 수 과일 베기(과일 베기에서 가져온 틀) — 팻말에 맞는 수 과일만 휙 벤다. 아닌 과일을 베면 꽝.
 * 터치: 손가락으로 긋기 · 카메라: 손을 빠르게 휘두르기
 * 받는 문제 모양: judge {text, ok(v), gen()} */
import { W, H, txt, circle, clamp, danger, sign } from '../ui.js';
import { scene } from '../scenes.js';
export default function(api){
  const G = 520, R = 62, WAVE = 10, COL = [['#ff5d5d', '#b3202a'], ['#ffb02e', '#c26a00'], ['#8ee04a', '#3d8f1e'], ['#c58bff', '#6a32b3']];
  const S = { rule: null, fr: [], st: 0, n: 0, trail: new Map(), msg: null, mt: 0, newT: 0, wave: 0 };
  const every = () => Math.max(.55, 1.35 * Math.pow(.9, api.level() - 1));
  function toss(){ const v = S.rule.gen(), x0 = 180 + api.rnd() * (W - 360), apex = 170 + api.rnd() * 170, vy = Math.sqrt(2 * G * (H + 70 - apex)); S.fr.push({ v, need: S.rule.ok(v), x0, vx: (W / 2 - x0) * (.25 + api.rnd() * .35) / 1.4, vy, t: 0, x: x0, y: H + 70, cut: 0, col: COL[S.n % 4], rot: api.rnd() * 6 }); S.n++; }
  const say = m => { S.msg = m; S.mt = 1; };
  function seg(ax, ay, bx, by, px, py){ const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, u = clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1); return Math.hypot(ax + u * dx - px, ay + u * dy - py); }
  return {
    id: 'slice', icon: '🍉', title: '수 과일 베기', tag: '터치·몸', how: '팻말에 맞는 수가 적힌 과일만 손을 휙 휘둘러 베요. 아닌 과일은 건드리지 마요.', touch: '팻말에 맞는 수 과일만 손가락으로 휙 그어요',
    threatSec: 0, pushBack: .12,
    dbg: () => S,
    start(){ S.rule = api.pack.judge(); S.fr = []; S.st = .8; S.n = 0; S.trail.clear(); S.newT = 0; S.wave = 0; api.say(S.rule.say.replace('막아', '베어')); },
    update(dt, cur, t){
      S.mt = Math.max(0, S.mt - dt); S.newT = Math.max(0, S.newT - dt); S.st -= dt;
      const w = Math.floor(S.n / WAVE);
      if (w > S.wave) { if (!S.fr.length) { S.wave = w; S.rule = api.pack.judge(); S.newT = 2; S.st = 1.8; api.say('새 팻말! ' + S.rule.say.replace('막아', '베어')); api.sfx('bell'); } }      // 한 물결이 다 지나가면 팻말이 바뀐다
      else if (S.st <= 0) { toss(); S.st = every(); }
      // 손자국
      const live = new Set(); for (const c of cur) { if (!(c.cam || c.grab)) continue; live.add(c.id); const tr = S.trail.get(c.id) || []; tr.push({ x: c.x, y: c.y, t }); while (tr.length > 9) tr.shift(); S.trail.set(c.id, tr); }
      for (const id of [...S.trail.keys()]) if (!live.has(id)) S.trail.delete(id);
      for (const f of S.fr) { if (f.cut) { f.cut += dt; continue; } f.t += dt; f.x = f.x0 + f.vx * f.t; f.y = H + 70 - f.vy * f.t + G * f.t * f.t / 2;
        for (const tr of S.trail.values()) { if (tr.length < 2) continue; const a = tr[tr.length - 2], b = tr[tr.length - 1], sp = Math.hypot(b.x - a.x, b.y - a.y) / Math.max(.001, (b.t - a.t) / 1000);
          if (sp > 420 && seg(a.x, a.y, b.x, b.y, f.x, f.y) < R) { f.cut = .001; f.ang = Math.atan2(b.y - a.y, b.x - a.x); api.sfx('block'); api.fx.burst(f.x, f.y, f.col[0], 22, 480); api.fx.burst(f.x, f.y, '#fff', 8, 300);
            if (f.need) { api.correct(); api.fx.text(f.x, f.y - 70, '싹둑!', '#fff', 44); } else { api.wrong(); api.threat.v = Math.min(1, api.threat.v + .26); api.fx.shake(18); api.fx.flash('255,80,60', .3); say('앗, 그건 아니야!'); } break; } }
        if (!f.cut && f.y > H + 80 && f.t > 1) { f.cut = 9; if (f.need) { api.threat.v = Math.min(1, api.threat.v + .14); say('놓쳤어!'); } else api.bonus(3); } }
      S.fr = S.fr.filter(f => !f.cut || f.cut < .7);
    },
    draw(c, t){
      const v = api.threat.v; scene.orchard(c, t, v);
      sign(c, S.rule.text.replace('막아라', '베어라'), W / 2, 86 + (S.newT > 0 ? Math.sin(t / 60) * 6 : 0), S.rule.text.length > 14 ? 40 : 52); if (S.newT > 0) txt(c, '새 팻말!', W / 2, 250, 70, '#ff7a3d');
      for (const f of S.fr) { const big = String(f.v).length > 2;
        if (f.cut) { const o = f.cut * 260, a = 1 - f.cut / .7; c.globalAlpha = Math.max(0, a); for (const s of [-1, 1]) { c.save(); c.translate(f.x + Math.cos(f.ang + Math.PI / 2) * o * s, f.y + Math.sin(f.ang + Math.PI / 2) * o * s + f.cut * f.cut * 500); c.rotate(f.ang); c.beginPath(); c.arc(0, 0, R, s > 0 ? 0 : Math.PI, s > 0 ? Math.PI : Math.PI * 2); c.closePath(); c.fillStyle = f.col[0]; c.fill(); c.strokeStyle = f.col[1]; c.lineWidth = 6; c.stroke(); c.restore(); } c.globalAlpha = 1; continue; }
        c.save(); c.translate(f.x, f.y); c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.arc(6, 8, R, 0, 7); c.fill(); const g = c.createRadialGradient(-18, -22, 6, 0, 0, R); g.addColorStop(0, '#fff'); g.addColorStop(.25, f.col[0]); g.addColorStop(1, f.col[1]); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill(); c.strokeStyle = f.col[1]; c.lineWidth = 5; c.stroke();
        c.fillStyle = '#2f8f47'; c.beginPath(); c.ellipse(10, -R - 4, 18, 9, -.5, 0, 7); c.fill(); c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,.35)'; c.font = `900 ${big ? 40 : 54}px "Pretendard","Noto Sans KR",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText(f.v, 0, 3); c.fillStyle = '#fff'; c.fillText(f.v, 0, 3); c.restore(); }
      for (const tr of S.trail.values()) { for (let i = 1; i < tr.length; i++) { c.strokeStyle = `rgba(255,255,255,${i / tr.length * .9})`; c.lineWidth = 3 + i * 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(tr[i - 1].x, tr[i - 1].y); c.lineTo(tr[i].x, tr[i].y); c.stroke(); } }
      if (S.mt > 0) txt(c, S.msg, W / 2, 190, 44, '#c0392b');
      // 위협 = 썩은 과일 바구니
      c.fillStyle = 'rgba(8,12,24,.6)'; c.fillRect(40, 40, 260, 30); c.fillStyle = v > .7 ? '#ff5d5d' : '#ffb02e'; c.fillRect(44, 44, 252 * v, 22); txt(c, '꽝 바구니', 170, 56, 18, '#fff', 'center', 700);
      danger(c, v, t);
    } };
}
