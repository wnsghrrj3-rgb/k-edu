/* 수직선 폴짝(점프 게임에서 가져온 틀) — 개구리가 수직선 위를 뛴다. 발판(+2, +3, +5)을 골라 깃발 수에 딱 서기.
 * 넘어가면 풍덩(뛰기 전 자리로). 뛰어 세기·덧셈을 「몇 번, 얼마씩」으로 스스로 짠다.
 * 받는 문제 모양: hop {start, target, steps[3], lo, hi, tick} */
import { W, H, txt, panel, circle, rr, lerp, clamp, dist, danger } from '../ui.js';
import { scene } from '../scenes.js';
export default function(api){
  const LY = 400, X0 = 110, X1 = 1170, PADS = [360, 640, 920], PY = 610;
  const S = { q: null, p: 0, from: 0, to: 0, jt: 0, phase: 'idle', pt: 0, hops: [], splash: 0 };
  const X = v => lerp(X0, X1, (v - S.q.lo) / (S.q.hi - S.q.lo));
  function next(){ S.q = api.pack.hop(); S.p = S.q.start; S.phase = 'idle'; S.hops = []; api.say(S.q.say); }
  return {
    id: 'hop', icon: '🐸', title: '수직선 폴짝', tag: '터치', how: '아래 발판에 손을 대고 쥐면 개구리가 그만큼 뛰어요. 깃발이 꽂힌 수에 딱 서게 해요.', touch: '아래 발판을 눌러 개구리를 뛰게 해요. 깃발 수에 딱 서면 성공',
    threatSec: 17, pushBack: .5,
    dbg: () => S,
    start(){ next(); },
    update(dt, cur){
      S.splash = Math.max(0, S.splash - dt);
      if (S.phase === 'jump') { S.jt += dt / .42; if (S.jt >= 1) { if (S.to > S.q.target) { S.phase = 'fall'; S.pt = .7; S.splash = .7; api.wrong(); api.fx.burst(X(Math.min(S.to, S.q.hi)), LY + 30, '#9fe3ff', 26, 460); api.fx.shake(10); }
          else { S.p = S.to; S.hops.push(S.to - S.from); api.sfx('drop'); api.fx.ring(X(S.p), LY, '#bfffd6', 12, 260); if (S.p === S.q.target) { S.phase = 'ok'; S.pt = 1.0; api.correct(); api.fx.burst(X(S.p), LY - 40, '#ffe27a', 30, 520); api.fx.text(X(S.p), LY - 150, `${S.q.start} + ${S.hops.join(' + ')} = ${S.p}`, '#6dffb0', S.hops.length > 4 ? 34 : 46); } else S.phase = 'idle'; } } return; }
      if (S.phase === 'fall') { S.pt -= dt; if (S.pt <= 0) S.phase = 'idle'; return; }
      if (S.phase === 'ok') { S.pt -= dt; if (S.pt <= 0) next(); return; }
      for (const c of cur) { if (!c.jg) continue; const k = PADS.findIndex(x => Math.abs(c.x - x) < 125 && Math.abs(c.y - PY) < 80); if (k < 0) continue; S.from = S.p; S.to = S.p + S.q.steps[k]; S.jt = 0; S.phase = 'jump'; api.sfx('grab'); break; }
    },
    draw(c, t){
      const v = api.threat.v, q = S.q; scene.pond(c, t, v, LY);
      panel(c, W / 2 - 250, 34, 500, 96, 'rgba(10,20,40,.8)', '#ffd35c'); txt(c, `${q.target}에 딱!`, W / 2, 84, 60, '#fff');
      // 수직선(통나무) + 눈금 + 연잎
      c.fillStyle = '#6b4526'; rr(c, X0 - 40, LY + 18, X1 - X0 + 80, 26, 13); c.fill(); c.strokeStyle = '#3d2714'; c.lineWidth = 3; c.stroke();
      const many = (q.hi - q.lo) / q.tick > 12; for (let val = q.lo; val <= q.hi; val += (q.tick === 10 ? 1 : q.tick)) { const major = val % q.tick === 0, x = X(val); if (q.tick === 10 && !major) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x - 1, LY + 12, 2, 10); continue; }
        c.fillStyle = '#3fae5a'; c.beginPath(); c.ellipse(x, LY + 14, many ? 20 : 30, 11, 0, 0, 7); c.fill(); c.strokeStyle = '#1d6b35'; c.lineWidth = 2; c.stroke(); txt(c, val, x, LY + 66, many ? 26 : 34, val === q.target ? '#ffe27a' : '#eaf6ff', 'center', val === q.target ? 900 : 700); }
      const tx = X(q.target); c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.moveTo(tx, LY + 10); c.lineTo(tx, LY - 92); c.stroke(); c.fillStyle = '#ff4d6a'; c.beginPath(); c.moveTo(tx, LY - 92); c.lineTo(tx + 46 + Math.sin(t / 180) * 4, LY - 76); c.lineTo(tx, LY - 58); c.closePath(); c.fill();
      // 지나온 뜀 자국
      let acc = q.start; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 4; c.setLineDash([8, 8]); for (const hgt of S.hops) { const a = X(acc), b = X(acc + hgt); c.beginPath(); c.moveTo(a, LY); c.quadraticCurveTo((a + b) / 2, LY - 70 - Math.min(80, (b - a) * .25), b, LY); c.stroke(); txt(c, '+' + hgt, (a + b) / 2, LY - 96 - Math.min(80, (b - a) * .25) / 2, 28, '#fff'); acc += hgt; } c.setLineDash([]);
      // 쫓아오는 물뱀(위협)
      const fx0 = X(S.p), sx = lerp(X0 - 160, fx0 - 60, v); c.strokeStyle = v > .7 ? '#ff6b4d' : '#7a3fb0'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); for (let k = 0; k <= 8; k++) { const xx = sx - k * 18, yy = LY - 6 + Math.sin(t / 120 + k) * 8; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); circle(c, sx + 6, LY - 12, 5, '#fff'); 
      // 개구리
      let fx = fx0, fy = LY - 6; if (S.phase === 'jump') { const u = clamp(S.jt, 0, 1), a = X(S.from), b = X(Math.min(S.to, q.hi + q.tick)); fx = lerp(a, b, u); fy = LY - 6 - Math.sin(u * Math.PI) * (80 + Math.min(90, Math.abs(b - a) * .3)); } else if (S.phase === 'fall') { fx = X(Math.min(S.to, q.hi + q.tick)); fy = LY + (.7 - S.pt) * 260; }
      c.save(); c.translate(fx, fy + (S.phase === 'idle' ? Math.sin(t / 240) * 2 : 0)); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 12, 34, 8, 0, 0, 7); c.fill(); c.fillStyle = '#5fd46a'; c.beginPath(); c.ellipse(0, -18, 38, 30, 0, 0, 7); c.fill(); c.strokeStyle = '#2b8f3b'; c.lineWidth = 4; c.stroke(); for (const s of [-1, 1]) { circle(c, s * 20, -46, 13, '#5fd46a', '#2b8f3b', 3); circle(c, s * 20, -47, 7, '#fff'); circle(c, s * 20 + 2, -47, 3.5, '#122'); } c.strokeStyle = '#1d6b35'; c.lineWidth = 4; c.beginPath(); c.arc(0, -16, 16, .15 * Math.PI, .85 * Math.PI); c.stroke(); txt(c, S.phase === 'jump' ? '' : S.p, 0, -92, 40, '#fff'); c.restore();
      // 발판
      q.steps.forEach((s, k) => { const x = PADS[k], over = S.p + s > q.target; c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, PY + 44, 120, 18, 0, 0, 7); c.fill(); c.fillStyle = over ? '#5a7a66' : '#3fae5a'; c.beginPath(); c.ellipse(x, PY, 122, 62, 0, 0, 7); c.fill(); c.strokeStyle = '#eaffef'; c.lineWidth = 5; c.stroke(); txt(c, '+' + s, x, PY + 2, 62, '#fff'); });
      if (S.phase === 'fall') txt(c, '풍덩! 넘어갔어', W / 2, 250, 46, '#ffd0d0');
      danger(c, v, t);
    } };
}
