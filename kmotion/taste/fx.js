/* 맛보기 공통 연출 — 입자·흔들림·떠오르는 글자·고리. 그림만 담당(판정과 무관). */
import { W, H } from './ui.js';
const P = [], T = [], R = []; let shakeAmt = 0, flashA = 0, flashCol = '255,60,60';
export const fx = {
  burst(x, y, col = '#ffe27a', n = 18, sp = 420, g = 700){ for (let i = 0; i < n && P.length < 420; i++) { const a = Math.random() * Math.PI * 2, v = sp * (.35 + Math.random() * .65); P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .25, g, r: 4 + Math.random() * 7, a: 1, d: 1.1 + Math.random() * .8, col, star: Math.random() < .35 }); } },
  dust(x, y, col = 'rgba(190,170,140,1)', n = 4){ for (let i = 0; i < n && P.length < 420; i++) P.push({ x: x + (Math.random() - .5) * 60, y, vx: (Math.random() - .5) * 160, vy: -60 - Math.random() * 140, g: -40, r: 10 + Math.random() * 16, a: .55, d: 1.4, col, soft: true }); },
  text(x, y, s, col = '#fff', size = 54){ T.push({ x, y, s, col, size, a: 1, t: 0 }); },
  ring(x, y, col = '#fff', r0 = 20, sp = 520){ R.push({ x, y, r: r0, sp, a: 1, col }); },
  shake(a){ shakeAmt = Math.max(shakeAmt, a); },
  flash(col = '255,60,60', a = .45){ flashCol = col; flashA = a; },
  clear(){ P.length = T.length = R.length = 0; shakeAmt = 0; flashA = 0; },
  update(dt){ for (const p of P) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a -= dt / p.d * (p.soft ? .55 : 1); } for (let i = P.length - 1; i >= 0; i--) if (P[i].a <= 0) P.splice(i, 1);
    for (const t of T) { t.t += dt; t.y -= dt * 70; t.a = 1 - Math.max(0, t.t - .5) / .6; } for (let i = T.length - 1; i >= 0; i--) if (T[i].a <= 0) T.splice(i, 1);
    for (const r of R) { r.r += r.sp * dt; r.a -= dt * 1.7; } for (let i = R.length - 1; i >= 0; i--) if (R[i].a <= 0) R.splice(i, 1);
    shakeAmt *= Math.pow(.02, dt); if (shakeAmt < .3) shakeAmt = 0; flashA = Math.max(0, flashA - dt * 1.4); },
  offset(){ return shakeAmt ? { x: (Math.random() - .5) * 2 * shakeAmt, y: (Math.random() - .5) * 2 * shakeAmt } : { x: 0, y: 0 }; },
  draw(c){ for (const r of R) { c.globalAlpha = Math.max(0, r.a); c.strokeStyle = r.col; c.lineWidth = 7; c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2); c.stroke(); }
    for (const p of P) { c.globalAlpha = Math.max(0, Math.min(1, p.a)); c.fillStyle = p.col; if (p.star) { c.save(); c.translate(p.x, p.y); c.rotate(p.x * .02); c.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? p.r * .45 : p.r * 1.25, a = k * Math.PI / 4; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); } else { c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill(); } }
    for (const t of T) { c.globalAlpha = Math.max(0, t.a); const s = t.size * (1 + Math.max(0, .18 - t.t) * 3); c.font = `900 ${s}px "Pretendard","Noto Sans KR",sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,.55)'; c.strokeText(t.s, t.x, t.y); c.fillStyle = t.col; c.fillText(t.s, t.x, t.y); }
    c.globalAlpha = 1; if (flashA > 0) { c.fillStyle = `rgba(${flashCol},${flashA})`; c.fillRect(0, 0, W, H); } } };
