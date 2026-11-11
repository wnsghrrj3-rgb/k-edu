/* 맛보기 공통 그리기 — 기능 확인 수준(디자인은 나중에 따로 입힌다) */
export const W = 1280, H = 720;
export function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }
export function txt(c, s, x, y, size = 40, color = '#fff', align = 'center', weight = 900){ c.font = `${weight} ${size}px "Pretendard","Noto Sans KR",sans-serif`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = color; c.fillText(String(s), x, y); }
export function panel(c, x, y, w, h, fill = 'rgba(8,12,24,.78)', stroke = 'rgba(255,255,255,.22)', r = 22){ rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = 3; c.stroke(); } }
export function circle(c, x, y, r, fill, stroke, lw = 4){ c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function sign(c, text, x, y, size = 44){ c.font = `900 ${size}px "Pretendard","Noto Sans KR",sans-serif`; const w = Math.max(220, c.measureText(text).width + 70); panel(c, x - w / 2, y - size * .85, w, size * 1.7, 'rgba(255,244,214,.96)', '#b9853b', 18); txt(c, text, x, y + 2, size, '#4a2c0a'); }
// 빨간 테두리(위협이 70% 를 넘으면)
export function danger(c, v, t){ if (v < .7) return; const a = (v - .7) / .3 * (.35 + .2 * Math.sin(t / 110)); const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .8); g.addColorStop(0, 'rgba(255,40,40,0)'); g.addColorStop(1, `rgba(255,40,40,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
