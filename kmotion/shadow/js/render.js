/* 그림자 괴물 · 그리기 층 — 벽·전등 빛·그림자·옆에서 본 그림. 시스템(main/physics)과 분리: GPT가 여기만 갈아끼워도 된다 */
import { project } from './physics.js?v=1223';

export const WALL = { W: 960, H: 720 };

/** 벽: 따뜻한 전등 빛이 가운데서 퍼지고 가장자리는 어둡다. 바닥 선 하나 */
export function drawWall(ctx, W, H, t, warm = 1){
  const g = ctx.createRadialGradient(W / 2, H * .42, 40, W / 2, H * .42, H * .95);
  g.addColorStop(0, `rgba(255,236,196,${.98 * warm})`); g.addColorStop(.45, `rgba(246,214,160,${.92 * warm})`); g.addColorStop(1, `rgba(120,86,56,${.95})`);
  ctx.fillStyle = '#5a4030'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // 벽 질감: 가로 줄 몇 개
  ctx.strokeStyle = 'rgba(80,50,30,.08)'; ctx.lineWidth = 1; for (let y = 90; y < H; y += 90) { ctx.beginPath(); ctx.moveTo(0, y + Math.sin(t / 900 + y) * 1.2); ctx.lineTo(W, y); ctx.stroke(); }
  // 전등 깜빡임(아주 약하게)
  const fl = .02 * Math.sin(t / 140) * Math.sin(t / 310); ctx.fillStyle = `rgba(255,240,210,${Math.max(0, fl)})`; ctx.fillRect(0, 0, W, H);
}

/** 사람 마스크(원본 방향 알파 캔버스)를 그림자로. s = 중심 배율, mirror = 거울(카메라는 거울로 보이게). 반그림자도 s 에 비례해 넓어진다 */
export function drawShadow(ctx, mask, W, H, s, { mirror = true, alpha = .96, soft = true } = {}){
  if (!mask || !mask.width) return;
  const tmp = drawShadow._tmp || (drawShadow._tmp = document.createElement('canvas'));
  if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
  const c = tmp.getContext('2d'); c.clearRect(0, 0, W, H);
  c.save(); c.translate(W / 2, H / 2); c.scale(mirror ? -s : s, s); c.translate(-W / 2, -H / 2);
  c.drawImage(mask, 0, 0, W, H); c.restore();
  // 알파만 남기고 검정으로
  c.globalCompositeOperation = 'source-in'; c.fillStyle = '#120b08'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
  ctx.save();
  if (soft) { ctx.globalAlpha = alpha * .35; ctx.filter = `blur(${Math.min(14, 3 + s * 3).toFixed(1)}px)`; ctx.drawImage(tmp, 0, 0); }   // 반그림자
  ctx.filter = soft ? 'blur(1.2px)' : 'none'; ctx.globalAlpha = alpha; ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

/** 목표 괴물: 황금빛 윤곽 + 옅은 채움(drawFn = 실루엣 그리는 콜백). 맞춘 정도 fit(0~1)에 따라 금색 → 초록 */
export function drawTarget(ctx, drawFn, fit = 0, t = 0){
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const fill = drawTarget._a || (drawTarget._a = mk()), ring = drawTarget._b || (drawTarget._b = mk());
  if (fill.width !== W) { fill.width = ring.width = W; fill.height = ring.height = H; }
  const hue = 42 + fit * 90, col = `hsl(${hue} 90% 58%)`;
  const fc = fill.getContext('2d'); fc.clearRect(0, 0, W, H); drawFn(fc);
  fc.globalCompositeOperation = 'source-in'; fc.fillStyle = col; fc.fillRect(0, 0, W, H); fc.globalCompositeOperation = 'source-over';
  const rc = ring.getContext('2d'); rc.clearRect(0, 0, W, H); rc.filter = 'blur(2.5px)'; rc.drawImage(fill, -3, -3, W + 6, H + 6); rc.filter = 'none';
  rc.globalCompositeOperation = 'destination-out'; rc.drawImage(fill, 0, 0); rc.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalAlpha = .14 + fit * .26 + Math.sin(t / 300) * .03; ctx.drawImage(fill, 0, 0);
  ctx.globalAlpha = .95; ctx.drawImage(ring, 0, 0); ctx.drawImage(ring, 0, 0);
  ctx.restore();
}

/** 옆에서 본 그림: 전등 ─ 사람 ─ 벽, 빛은 직진. d, L(cm), 그림자 키 S(cm) */
export function drawSideView(ctx, box, d, L, Hb, S){
  const { x, y, w, h } = box;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,10,20,.78)'; roundRect(ctx, 0, 0, w, h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
  const pad = 22, floor = h - 26, lampX = pad + 18, wallX = w - pad;
  const scale = (wallX - lampX) / Math.max(L, 60);       // cm → px
  const lampY = floor - 60;
  // 바닥
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pad, floor); ctx.lineTo(w - pad, floor); ctx.stroke();
  // 벽
  ctx.fillStyle = '#d8b98a'; ctx.fillRect(wallX - 4, 14, 6, floor - 14);
  // 사람
  const px = lampX + Math.min(L - 10, Math.max(10, d || L * .6)) * scale; const ph = Math.min(floor - 20, Hb * scale * .9);
  ctx.fillStyle = '#eef2ff'; ctx.fillRect(px - 4, floor - ph, 8, ph); ctx.beginPath(); ctx.arc(px, floor - ph - 7, 7, 0, Math.PI * 2); ctx.fill();
  // 빛 직진선: 전등 → 사람 머리/발 → 벽
  if (d) {
    const topY = floor - ph - 14, botY = floor;
    for (const [py, dash] of [[topY, 0], [botY, 1]]) {
      const k = (wallX - lampX) / (px - lampX); const wy = lampY + (py - lampY) * k;
      ctx.strokeStyle = 'rgba(255,214,120,.9)'; ctx.lineWidth = 1.5; ctx.setLineDash(dash ? [4, 4] : []); ctx.beginPath(); ctx.moveTo(lampX, lampY); ctx.lineTo(wallX, wy); ctx.stroke(); ctx.setLineDash([]);
    }
    // 벽 위 그림자
    const k = (wallX - lampX) / (px - lampX); const sy0 = lampY + (topY - lampY) * k, sy1 = lampY + (botY - lampY) * k;
    ctx.fillStyle = 'rgba(20,10,6,.85)'; ctx.fillRect(wallX - 4, Math.max(10, Math.min(sy0, sy1)), 6, Math.min(floor + 10, Math.max(sy0, sy1)) - Math.max(10, Math.min(sy0, sy1)));
  }
  // 전등
  ctx.fillStyle = '#ffd35c'; ctx.beginPath(); ctx.arc(lampX, lampY, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,211,92,.25)'; ctx.beginPath(); ctx.arc(lampX, lampY, 18, 0, Math.PI * 2); ctx.fill();
  // 글자
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '700 13px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('전등', lampX - 12, lampY - 24);
  ctx.textAlign = 'right'; ctx.fillText('벽', wallX, 12 + 12);
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '12px sans-serif';
  if (d) ctx.fillText(`${Math.round(d)}cm`, (lampX + px) / 2, floor + 16); ctx.fillText(`벽까지 ${Math.round(L)}cm`, (lampX + wallX) / 2, 12 + 12);
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/** 벽 위 한 줄 안내(큰 글자, 전자칠판용) */
export function banner(ctx, W, text, y = 64, color = '#fff', size = 40){
  if (!text) return; ctx.save(); ctx.font = `900 ${size}px sans-serif`; ctx.textAlign = 'center'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(20,10,6,.7)'; ctx.lineJoin = 'round'; ctx.strokeText(text, W / 2, y); ctx.fillStyle = color; ctx.fillText(text, W / 2, y); ctx.restore();
}

/** 간단한 거리-그림자 키 산점도 + 이론선 S = Hb·L/d */
export function drawChart(ctx, box, rows, Hb, L){
  const { x, y, w, h } = box; ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(8,10,20,.78)'; roundRect(ctx, 0, 0, w, h, 14); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
  const pad = { l: 44, r: 14, t: 24, b: 30 }; const X0 = pad.l, X1 = w - pad.r, Y0 = h - pad.b, Y1 = pad.t;
  const dMax = 400, sMax = Math.max(300, Hb * L / 60);
  const fx = d => X0 + (d / dMax) * (X1 - X0), fy = s => Y0 - (s / sMax) * (Y0 - Y1);
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  for (let d = 0; d <= dMax; d += 100) ctx.fillText(d, fx(d), Y0 + 14); ctx.fillText('광원까지 거리(cm)', (X0 + X1) / 2, Y0 + 27);
  ctx.textAlign = 'right'; for (let s = 0; s <= sMax; s += 100) ctx.fillText(Math.round(s), X0 - 6, fy(s) + 4);
  ctx.textAlign = 'left'; ctx.fillStyle = '#ffd35c'; ctx.fillText('그림자 키(cm)  ─ 이론 S = 키×벽거리÷거리', X0, 14);
  ctx.strokeStyle = 'rgba(255,211,92,.8)'; ctx.setLineDash([5, 4]); ctx.beginPath();
  for (let d = 40; d <= dMax; d += 4) { const s = Hb * L / d; const X = fx(d), Y = fy(s); if (d === 40) ctx.moveTo(X, Math.max(Y1, Y)); else ctx.lineTo(X, Math.max(Y1, Y)); } ctx.stroke(); ctx.setLineDash([]);
  for (const r of rows) { ctx.fillStyle = '#4de1ff'; ctx.beginPath(); ctx.arc(fx(Math.min(dMax, r.d)), fy(Math.min(sMax, r.S)), 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
