/* 시계탑 고치기(맞추기 공방 시계탑 1·2장 맛보기) — 긴바늘을 잡고 돌리면 짧은바늘이 톱니로 따라온다.
 * 받는 문제 모양: time {h, m, step, label} */
import { W, H, txt, panel, circle, dist, danger, sign } from '../ui.js';
import { scene, glow } from '../scenes.js';
export default function(api){
  const N = 6, C = { x: 640, y: 410 }, RAD = 235;
  const S = { i: 0, q: null, M: 0, hold: null, la: 0, phase: 'play', pt: 0, miss: 0, said: false };
  const target = () => (S.q.h % 12) * 60 + S.q.m;
  const norm = m => ((m % 720) + 720) % 720;
  const read = M => { const m = norm(Math.round(M / S.q.step) * S.q.step); return { h: Math.floor(m / 60) || 12, m: m % 60, raw: m }; };
  function next(){ S.q = api.pack.time(); const st = S.q.step === 30 ? 60 : 30; do { S.M = Math.floor(api.rnd() * (720 / st)) * st; } while (Math.abs(norm(S.M - target())) < 60 || Math.abs(norm(S.M - target())) > 660); S.hold = null; S.phase = 'play'; S.miss = 0; api.say(S.q.say); }
  function check(){ S.M = read(S.M).raw; if (!(S.moved > .15) && S.M !== target()) return; if (S.M === target()) { S.phase = 'ok'; S.pt = 1.2; api.correct(); api.sfx('bell'); api.fx.ring(C.x, C.y, '#ffe9a8', RAD, 420); api.fx.ring(C.x, C.y, '#fff', RAD * .6, 520); api.fx.burst(C.x, C.y - RAD, '#ffe27a', 26, 460); } else { S.miss++; if (S.miss === 1) api.wrong(); } }
  return {
    id: 'clock', icon: '🕰️', title: '시계탑 고치기', how: '긴바늘을 쥐고 빙글 돌려요. 짧은바늘이 따라 움직여요. 맞춘 뒤 손을 펴요.', touch: '시계를 누른 채 빙글 돌리고, 손을 떼요',
    threatSec: 26, pushBack: .6, total: N,
    dbg: () => S,
    prog: () => [S.i, N],
    start(){ S.i = 0; next(); },
    update(dt, cur){
      if (S.phase === 'ok') { S.pt -= dt; if (S.pt <= 0) { S.i++; if (S.i >= N) return api.finish(); next(); } return; }
      for (const c of cur) {
        if (c.jg && !S.hold && dist(c, C) < RAD + 90) { S.hold = c.id; S.moved = 0; S.la = Math.atan2(c.y - C.y, c.x - C.x); }
        if (S.hold === c.id) { if (c.grab) { if (dist(c, C) > 34) { const a = Math.atan2(c.y - C.y, c.x - C.x); let d = a - S.la; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; S.la = a; S.M += d / (Math.PI * 2) * 60; S.moved += Math.abs(d); } } else { S.hold = null; check(); } } }
      if (S.hold && !cur.some(c => c.id === S.hold)) { S.hold = null; check(); }
    },
    draw(c, t){
      const v = api.threat.v;       // 위협 = 해가 넘어감
      scene.tower(c, t, v, C, RAD);
      sign(c, S.q.label, W / 2, 62, 58);
      // 톱니(시계 뒤에서 도는)
      for (const [gx, gy, gr, dir] of [[C.x - RAD - 26, C.y + 150, 54, 1], [C.x + RAD + 30, C.y - 120, 42, -1.3]]) { c.save(); c.translate(gx, gy); c.rotate(S.M / 60 * Math.PI * 2 * dir * .5); c.fillStyle = '#b08a3e'; for (let k = 0; k < 10; k++) { c.rotate(Math.PI / 5); c.fillRect(-9, -gr - 12, 18, 16); } c.beginPath(); c.arc(0, 0, gr, 0, 7); c.fill(); c.fillStyle = '#6b5222'; c.beginPath(); c.arc(0, 0, gr * .35, 0, 7); c.fill(); c.restore(); }
      glow(c, C.x, C.y, RAD + 120, 'rgba(255,240,200,A)', .25 + v * .3);
      circle(c, C.x, C.y, RAD + 24, '#3c2d1e', '#e8c987', 10); const g = c.createRadialGradient(C.x - 60, C.y - 80, 20, C.x, C.y, RAD); g.addColorStop(0, '#fffdf3'); g.addColorStop(1, '#efe3c2'); c.fillStyle = g; c.beginPath(); c.arc(C.x, C.y, RAD, 0, 7); c.fill(); c.strokeStyle = '#3c2d1e'; c.lineWidth = 6; c.stroke();
      for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2 - Math.PI / 2, big = k % 5 === 0; if (!big && S.q.step === 30) continue; c.strokeStyle = '#3c2d1e'; c.lineWidth = big ? 6 : 2; c.beginPath(); c.moveTo(C.x + Math.cos(a) * (RAD - (big ? 24 : 12)), C.y + Math.sin(a) * (RAD - (big ? 24 : 12))); c.lineTo(C.x + Math.cos(a) * (RAD - 4), C.y + Math.sin(a) * (RAD - 4)); c.stroke(); }
      for (let n = 1; n <= 12; n++) { const a = n / 12 * Math.PI * 2 - Math.PI / 2; txt(c, n, C.x + Math.cos(a) * (RAD - 56), C.y + Math.sin(a) * (RAD - 56) + 2, 44, '#3c2d1e'); }
      const M = S.hold ? S.M : read(S.M).raw, am = (M % 60) / 60 * Math.PI * 2 - Math.PI / 2, ah = (M / 720) * Math.PI * 2 - Math.PI / 2;
      c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 16; c.beginPath(); c.moveTo(C.x + 5, C.y + 7); c.lineTo(C.x + 5 + Math.cos(ah) * RAD * .5, C.y + 7 + Math.sin(ah) * RAD * .5); c.stroke();
      c.strokeStyle = '#1f2a44'; c.lineWidth = 16; c.beginPath(); c.moveTo(C.x, C.y); c.lineTo(C.x + Math.cos(ah) * RAD * .5, C.y + Math.sin(ah) * RAD * .5); c.stroke();
      const hx = C.x + Math.cos(am) * RAD * .86, hy = C.y + Math.sin(am) * RAD * .86; if (S.hold) glow(c, hx, hy, 90, 'rgba(255,150,60,A)', .7);
      c.strokeStyle = S.hold ? '#ff7a3d' : '#d2452f'; c.lineWidth = 10; c.beginPath(); c.moveTo(C.x, C.y); c.lineTo(hx, hy); c.stroke();
      circle(c, hx, hy, 26, S.hold ? '#ff7a3d' : '#d2452f', '#fff', 5); circle(c, C.x, C.y, 15, '#1f2a44', '#e8c987', 4);
      if (S.phase === 'ok') txt(c, '뎅~ 맞췄어!', W / 2, 690, 46, '#6dffb0');
      else if (S.miss >= 2 && !S.hold) { const r = read(S.M); txt(c, `지금은 ${r.h}시${r.m ? ' ' + r.m + '분' : ''}`, W / 2, 690, 38, '#ffe27a'); }
      else if (S.miss === 1 && !S.hold) txt(c, '조금 더 돌려 봐요', W / 2, 690, 36, '#fff', 'center', 700);
      if (v > .7 && S.phase === 'play') txt(c, '해가 져요!', 190, 660, 34, '#ffd0a0');
      danger(c, v, t);
    } };
}
