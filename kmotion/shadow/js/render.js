/* 그림자 괴물 · 그리기 층 v2 — 낡은 그림자 극장 무대. 시스템(main/village/physics)과 분리: GPT는 이 파일과 shadow.css 만 갈아끼운다
 * 좌표: 벽 캔버스 W×H. lamp = { x, y }(0~1, 투영 중심 = 전등 자리), s = 벽 거리 배율
 */
export const WALL = { W: 960, H: 720 };
const TAU = Math.PI * 2;
let dust = null;

/** 무대: 벽(전등 빛이 lamp 자리에서 퍼짐) · 바닥 널 · 양옆 커튼 · 빛줄기 먼지 · 비네트 */
export function drawStage(ctx, W, H, t, lamp, warm = 1){
  const lx = lamp.x * W, ly = lamp.y * H;
  ctx.fillStyle = '#2a1a12'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(lx, ly, 30, lx, ly, H * 1.05);
  g.addColorStop(0, `rgba(255,232,186,${.98 * warm})`); g.addColorStop(.35, `rgba(240,200,140,${.9 * warm})`); g.addColorStop(.75, 'rgba(150,100,62,.9)'); g.addColorStop(1, 'rgba(60,34,22,1)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .07; for (let i = 0; i < 14; i++) { const sx = (i * 173) % W, sy = (i * 97) % (H * .8); ctx.fillStyle = i % 2 ? '#000' : '#fff'; ctx.beginPath(); ctx.ellipse(sx, sy, 60 + i * 9, 30 + i * 4, i, 0, TAU); ctx.fill(); } ctx.restore();
  const fy = H * .86; const fg = ctx.createLinearGradient(0, fy, 0, H); fg.addColorStop(0, '#6b4528'); fg.addColorStop(1, '#2d1b10'); ctx.fillStyle = fg; ctx.fillRect(0, fy, W, H - fy);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; for (let i = 0; i <= 12; i++) { const x = i * W / 12; ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(x + (x - W / 2) * .18, H); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,220,160,.18)'; ctx.fillRect(0, fy, W, 3);
  if (!dust) dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.2, v: .004 + Math.random() * .01, p: Math.random() * TAU }));
  ctx.save(); for (const d of dust) { d.y -= d.v * .016; d.x += Math.sin(t / 1300 + d.p) * .0006; if (d.y < -.02) { d.y = 1.02; d.x = Math.random(); }
    const dx = d.x * W, dy = d.y * H, dist = Math.hypot(dx - lx, dy - ly) / H; const a = Math.max(0, .55 - dist * .5) * (.6 + .4 * Math.sin(t / 400 + d.p)); if (a <= 0) continue;
    ctx.fillStyle = `rgba(255,236,200,${a})`; ctx.beginPath(); ctx.arc(dx, dy, d.r, 0, TAU); ctx.fill(); } ctx.restore();
  for (const side of [0, 1]) { const cw = W * .075; const x0 = side ? W - cw : 0; const cg = ctx.createLinearGradient(x0, 0, x0 + cw, 0); if (side) { cg.addColorStop(0, '#2b0a0c'); cg.addColorStop(1, '#6a1d22'); } else { cg.addColorStop(0, '#6a1d22'); cg.addColorStop(1, '#2b0a0c'); }
    ctx.fillStyle = cg; ctx.fillRect(x0, 0, cw, H); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3; for (let i = 1; i < 5; i++) { const x = x0 + cw * i / 5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + (side ? -6 : 6), H * .5, x, H); ctx.stroke(); }
    ctx.fillStyle = '#c99a3a'; ctx.fillRect(x0, H * .52, cw, 10); }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

/** 전등 레일 + 전구(전등이 어디 있는지). lamp.y 가 아래쪽이면 바닥 전등 */
export function drawLampRail(ctx, W, H, lamp, t){
  const top = lamp.y < .5; const ry = top ? 20 : H - 18; const bx = lamp.x * W;
  ctx.save(); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W * .09, ry); ctx.lineTo(W * .91, ry); ctx.stroke();
  ctx.strokeStyle = '#3b2a1c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, ry); ctx.lineTo(bx, ry + (top ? 26 : -26)); ctx.stroke();
  const by = ry + (top ? 34 : -34); const gg = ctx.createRadialGradient(bx, by, 2, bx, by, 60); gg.addColorStop(0, 'rgba(255,240,200,.95)'); gg.addColorStop(.3, 'rgba(255,220,140,.5)'); gg.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(bx, by, 60, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff3cf'; ctx.beginPath(); ctx.arc(bx, by, 9 + Math.sin(t / 150) * .6, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a4a30'; ctx.fillRect(bx - 6, by + (top ? -14 : 8), 12, 6);
  ctx.restore();
}

/** 사람 마스크(원본 방향 알파) → 그림자. 투영 중심 = 전등 자리(lamp), 배율 s. 반그림자도 s 에 비례 */
export function drawShadow(ctx, mask, W, H, s, lamp, { mirror = true, alpha = .97, color = '#140c0a' } = {}){
  if (!mask || !mask.width) return;
  const tmp = drawShadow._tmp || (drawShadow._tmp = document.createElement('canvas'));
  if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
  const c = tmp.getContext('2d'); c.clearRect(0, 0, W, H);
  const cx = lamp.x * W, cy = lamp.y * H;
  c.save(); c.translate(cx, cy); c.scale(mirror ? -s : s, s); c.translate(-W / 2, -H / 2); c.drawImage(mask, 0, 0, W, H); c.restore();
  c.globalCompositeOperation = 'source-in'; c.fillStyle = color; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalAlpha = alpha * .3; ctx.filter = `blur(${Math.min(16, 3 + s * 3.5).toFixed(1)}px)`; ctx.drawImage(tmp, 0, 0);
  ctx.filter = 'blur(1px)'; ctx.globalAlpha = alpha; ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

/** 괴물 얼굴: 머리 자리(hx, hy=머리 꼭대기)·머리 폭 hw·그림자 키 hh 에 눈·뿔·이빨. mood = { glow, horn, roar (0~1), lookX(-1~1), blink } */
export function drawMonsterFace(ctx, hx, hy, hw, hh, mood, t){
  const eye = Math.max(5, hw * .14), gap = hw * .36, ey = hy + hh * .085; const blink = mood.blink ? .12 : 1;
  ctx.save();
  if (mood.horn > .02) { const hl = hh * .18 * mood.horn, hb = hw * .14; ctx.fillStyle = '#140c0a';
    for (const sd of [-1, 1]) { const bx = hx + sd * hw * .28, by = hy + hh * .01; ctx.beginPath(); ctx.moveTo(bx - hb, by); ctx.quadraticCurveTo(bx + sd * hl * .6, by - hl * .7, bx + sd * hl * .35, by - hl); ctx.quadraticCurveTo(bx + sd * hb * .2, by - hl * .5, bx + hb, by); ctx.closePath(); ctx.fill(); } }
  for (const sd of [-1, 1]) { const ex = hx + sd * gap / 2;
    const gl = ctx.createRadialGradient(ex, ey, 1, ex, ey, eye * 3.2); gl.addColorStop(0, `rgba(255,200,90,${.55 * mood.glow + .2})`); gl.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ex, ey, eye * 3.2, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgb(255,${210 - mood.roar * 120 | 0},${90 - mood.roar * 70 | 0})`; ctx.beginPath(); ctx.ellipse(ex, ey, eye, eye * .72 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1a0c08'; ctx.beginPath(); ctx.ellipse(ex + mood.lookX * eye * .45, ey, eye * .34, eye * .5 * blink, 0, 0, TAU); ctx.fill(); }
  if (mood.roar > .05) { const my = hy + hh * .17, mw = hw * .5 * mood.roar; ctx.fillStyle = `rgba(255,120,110,${.85 * mood.roar})`; ctx.beginPath(); ctx.ellipse(hx, my, mw, hh * .05 * mood.roar, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff6e0'; const n = 6; for (let i = 0; i < n; i++) { const tx = hx - mw + (i + .5) * (mw * 2 / n); const th = hh * .05 * mood.roar; ctx.beginPath(); ctx.moveTo(tx - mw / n * .4, my - th * .6); ctx.lineTo(tx + mw / n * .4, my - th * .6); ctx.lineTo(tx, my + th * .5); ctx.closePath(); ctx.fill(); } }
  ctx.restore();
}

/** 마을: 집(등불 켜짐/꺼짐)·마을 사람(숨음/나옴). v = { houses:[{x,w,lit,shake}], folk:[{x,hide}], fear } */
export function drawVillage(ctx, W, H, v, t){
  const fy = H * .86;
  for (const h of v.houses) { const x = h.x * W + (h.shake ? Math.sin(t / 25) * 3 : 0), w = h.w * W, hh = w * .95; const y = fy - hh;
    if (h.lit) { const lg = ctx.createRadialGradient(x, y + hh * .55, 4, x, y + hh * .55, w * 1.6); lg.addColorStop(0, 'rgba(255,190,90,.5)'); lg.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, y + hh * .55, w * 1.6, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#1d1008'; ctx.fillRect(x - w / 2, y + hh * .35, w, hh * .65);
    ctx.beginPath(); ctx.moveTo(x - w * .6, y + hh * .38); ctx.lineTo(x, y); ctx.lineTo(x + w * .6, y + hh * .38); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(x + w * .18, y + hh * .08, w * .14, hh * .3);
    ctx.fillStyle = h.lit ? `rgba(255,${200 + Math.sin(t / 120 + x) * 20 | 0},110,.95)` : '#0e0805'; ctx.fillRect(x - w * .17, y + hh * .5, w * .34, hh * .28);
    if (h.lit) { ctx.fillStyle = 'rgba(80,40,20,.8)'; ctx.fillRect(x - w * .02, y + hh * .5, w * .04, hh * .28); ctx.fillRect(x - w * .17, y + hh * .62, w * .34, hh * .04); }
    ctx.fillStyle = h.lit ? '#ffd35c' : '#3a2a1c'; ctx.beginPath(); ctx.arc(x - w * .5, y + hh * .42, w * .07, 0, TAU); ctx.fill(); }
  for (const f of v.folk) { const x = f.x * W, hh = H * .055, y = fy; if (f.hide > .98) continue;
    ctx.save(); ctx.globalAlpha = 1 - f.hide; ctx.fillStyle = '#3a2416'; ctx.strokeStyle = '#3a2416'; ctx.lineWidth = hh * .22; ctx.lineCap = 'round';
    const bob = Math.sin(t / 180 + x) * 1.5; ctx.beginPath(); ctx.arc(x, y - hh * .85 + bob, hh * .16, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - hh * .65 + bob); ctx.lineTo(x, y - hh * .3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - hh * .3); ctx.lineTo(x - hh * .18, y); ctx.moveTo(x, y - hh * .3); ctx.lineTo(x + hh * .18, y); ctx.stroke();
    const arm = v.fear > .5 ? -hh * .4 : hh * .15; ctx.beginPath(); ctx.moveTo(x, y - hh * .6 + bob); ctx.lineTo(x - hh * .22, y - hh * .6 + arm); ctx.moveTo(x, y - hh * .6 + bob); ctx.lineTo(x + hh * .22, y - hh * .6 + arm); ctx.stroke(); ctx.restore(); }
}

/** 도둑: 살금살금 웅크린 실루엣 + 초록 눈. th = { x, y(발), h, dir, flee 0~1 } */
export function drawThief(ctx, th, drawFigure, t){
  const sc = th.flee ? 1 - th.flee * .6 : 1; const hh = th.h * sc; const bob = Math.sin(t / 110 + th.x) * 2 * (th.flee ? 3 : 1);
  ctx.save(); ctx.translate(th.x, th.y + bob); ctx.scale(th.dir, 1);
  drawFigure(ctx, th.flee ? { armL: 150, armR: 150, legs: .6 } : { armL: 40, armR: 60, legs: .5, crouch: .55, lean: 12 }, 0, 0, hh, th.flee ? '#3b2a4a' : '#2a1a3a');
  if (!th.flee) { ctx.fillStyle = '#4a3350'; ctx.beginPath(); ctx.arc(-hh * .22, -hh * .55, hh * .16, 0, TAU); ctx.fill(); }
  const ey = -hh * (th.flee ? .9 : .66), ex = hh * .04; ctx.fillStyle = th.flee ? '#ffe9a0' : '#9dff5c';
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(ex + sd * hh * .045, ey, hh * .03, hh * .022, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/** 위협 계기판: 내 그림자 크기 vs 도둑 겁 문턱 vs 마을 공포 한계 (전부 0~1) */
export function drawThreatMeter(ctx, box, size, need, fearLimit){
  const { x, y, w, h } = box; ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,6,4,.72)'; roundRect(ctx, 0, 0, w, h, 12); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
  const bx = 14, bw = w - 28, by = h / 2 - 8, bh = 16;
  const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, '#4de1ff'); grd.addColorStop(Math.min(.99, need == null ? .5 : need), '#ffd35c'); grd.addColorStop(Math.min(.995, fearLimit), '#5cf2a4'); grd.addColorStop(Math.min(1, fearLimit + .005), '#ff5c7a'); grd.addColorStop(1, '#ff5c7a');
  ctx.fillStyle = 'rgba(255,255,255,.12)'; roundRect(ctx, bx, by, bw, bh, 8); ctx.fill();
  ctx.save(); roundRect(ctx, bx, by, Math.max(2, bw * Math.min(1, size)), bh, 8); ctx.clip(); ctx.fillStyle = grd; ctx.fillRect(bx, by, bw, bh); ctx.restore();
  ctx.fillStyle = '#fff'; ctx.font = '700 12px sans-serif'; ctx.textAlign = 'center';
  if (need != null) { ctx.fillRect(bx + bw * need - 1, by - 6, 2, bh + 12); ctx.fillText('도둑 겁', bx + bw * need, by - 9); }
  ctx.fillRect(bx + bw * fearLimit - 1, by - 6, 2, bh + 12); ctx.fillText('마을 공포', bx + bw * fearLimit, by + bh + 16);
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('내 그림자', bx, by + bh + 16);
  ctx.restore();
}

/** 옆에서 본 그림: 전등 ─ 사람 ─ 벽, 빛은 직진 */
export function drawSideView(ctx, box, d, L, Hb, S){
  const { x, y, w, h } = box;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,10,20,.78)'; roundRect(ctx, 0, 0, w, h, 14); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
  const pad = 22, floor = h - 26, lampX = pad + 18, wallX = w - pad; const scale = (wallX - lampX) / Math.max(L, 60); const lampY = floor - 60;
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, floor); ctx.lineTo(w - pad, floor); ctx.stroke();
  ctx.fillStyle = '#d8b98a'; ctx.fillRect(wallX - 4, 14, 6, floor - 14);
  const px = lampX + Math.min(L - 10, Math.max(10, d || L * .6)) * scale; const ph = Math.min(floor - 20, Hb * scale * .9);
  ctx.fillStyle = '#eef2ff'; ctx.fillRect(px - 4, floor - ph, 8, ph); ctx.beginPath(); ctx.arc(px, floor - ph - 7, 7, 0, TAU); ctx.fill();
  if (d) { const topY = floor - ph - 14, botY = floor; const k = (wallX - lampX) / (px - lampX);
    for (const [py, dash] of [[topY, 0], [botY, 1]]) { const wy = lampY + (py - lampY) * k; ctx.strokeStyle = 'rgba(255,214,120,.9)'; ctx.lineWidth = 1.5; ctx.setLineDash(dash ? [4, 4] : []); ctx.beginPath(); ctx.moveTo(lampX, lampY); ctx.lineTo(wallX, wy); ctx.stroke(); ctx.setLineDash([]); }
    const sy0 = lampY + (topY - lampY) * k, sy1 = lampY + (botY - lampY) * k; ctx.fillStyle = 'rgba(20,10,6,.85)'; ctx.fillRect(wallX - 4, Math.max(10, Math.min(sy0, sy1)), 6, Math.min(floor + 10, Math.max(sy0, sy1)) - Math.max(10, Math.min(sy0, sy1))); }
  ctx.fillStyle = '#ffd35c'; ctx.beginPath(); ctx.arc(lampX, lampY, 9, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,211,92,.25)'; ctx.beginPath(); ctx.arc(lampX, lampY, 18, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('전등', lampX - 12, lampY - 24); ctx.textAlign = 'right'; ctx.fillText('벽', wallX, 24);
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '12px sans-serif'; if (d) ctx.fillText(`${Math.round(d)}cm`, (lampX + px) / 2, floor + 16); ctx.fillText(`벽까지 ${Math.round(L)}cm`, (lampX + wallX) / 2, 24);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/** 벽 위 큰 안내 글자(전자칠판) */
export function banner(ctx, W, text, y = 64, color = '#fff', size = 40){
  if (!text) return; ctx.save(); ctx.font = `900 ${size}px sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(20,10,6,.75)'; ctx.lineJoin = 'round'; ctx.strokeText(text, W / 2, y); ctx.fillStyle = color; ctx.fillText(text, W / 2, y); ctx.restore();
}

/** 목표 괴물(괴물 만들기): 황금 윤곽 + 옅은 채움, fit 오르면 초록 */
export function drawTarget(ctx, drawFn, fit = 0, t = 0){
  const W = ctx.canvas.width, H = ctx.canvas.height; const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const fill = drawTarget._a || (drawTarget._a = mk()), ring = drawTarget._b || (drawTarget._b = mk());
  const hue = 42 + fit * 90, col = `hsl(${hue} 90% 58%)`;
  const fc = fill.getContext('2d'); fc.clearRect(0, 0, W, H); drawFn(fc); fc.globalCompositeOperation = 'source-in'; fc.fillStyle = col; fc.fillRect(0, 0, W, H); fc.globalCompositeOperation = 'source-over';
  const rc = ring.getContext('2d'); rc.clearRect(0, 0, W, H); rc.filter = 'blur(2.5px)'; rc.drawImage(fill, -3, -3, W + 6, H + 6); rc.filter = 'none'; rc.globalCompositeOperation = 'destination-out'; rc.drawImage(fill, 0, 0); rc.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.globalAlpha = .14 + fit * .26 + Math.sin(t / 300) * .03; ctx.drawImage(fill, 0, 0); ctx.globalAlpha = .95; ctx.drawImage(ring, 0, 0); ctx.drawImage(ring, 0, 0); ctx.restore();
}

/** 거리-그림자 키 산점도 + 이론선 */
export function drawChart(ctx, box, rows, Hb, L){
  const { x, y, w, h } = box; ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,10,20,.78)'; roundRect(ctx, 0, 0, w, h, 14); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
  const pad = { l: 44, r: 14, t: 24, b: 30 }; const X0 = pad.l, X1 = w - pad.r, Y0 = h - pad.b, Y1 = pad.t; const dMax = 400, sMax = Math.max(300, Hb * L / 60);
  const fx = d => X0 + (d / dMax) * (X1 - X0), fy = s => Y0 - (s / sMax) * (Y0 - Y1);
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; for (let d = 0; d <= dMax; d += 100) ctx.fillText(d, fx(d), Y0 + 14); ctx.fillText('광원까지 거리(cm)', (X0 + X1) / 2, Y0 + 27);
  ctx.textAlign = 'right'; for (let s = 0; s <= sMax; s += 100) ctx.fillText(Math.round(s), X0 - 6, fy(s) + 4);
  ctx.textAlign = 'left'; ctx.fillStyle = '#ffd35c'; ctx.fillText('그림자 키(cm)  ─ 이론 S = 키×벽거리÷거리', X0, 14);
  ctx.strokeStyle = 'rgba(255,211,92,.8)'; ctx.setLineDash([5, 4]); ctx.beginPath(); for (let d = 40; d <= dMax; d += 4) { const Y = fy(Hb * L / d); if (d === 40) ctx.moveTo(fx(d), Math.max(Y1, Y)); else ctx.lineTo(fx(d), Math.max(Y1, Y)); } ctx.stroke(); ctx.setLineDash([]);
  for (const r of rows) { ctx.fillStyle = '#4de1ff'; ctx.beginPath(); ctx.arc(fx(Math.min(dMax, r.d)), fy(Math.min(sMax, r.S)), 5, 0, TAU); ctx.fill(); }
  ctx.restore();
}
