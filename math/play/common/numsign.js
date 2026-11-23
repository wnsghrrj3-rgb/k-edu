/* 수학 놀이터 「숫자 팻말」(T05 짝 잇기 틀 — 뒤 틀 T06 줄 세우기 · T07 견주기도 쓴다).
 * 나무 팻말 위에 숫자를 그린 그림 한 장(캔버스)을 만든다. 숫자 꼴 · 빛깔 · 크기가 이 한 곳에 있다(화면 표시라 코드로 그려도 된다).
 *   numsign(n, { dots, lit, face, back, px, flash }) → <canvas>      paint(캔버스, n, { … }) → 같은 캔버스에 다시 그림
 *   dots  = 숫자 아래 점 무늬(정본 5-10절 — 다섯씩 한 줄 · 6~9 는 윗줄 다섯 + 아랫줄 · 점 카드와 같은 눈) · lit = 켜진 점 수(기본 n) · flash = 반짝이는 점(0부터)
 *   face  = 'book' 교과서 꼴(기기에 있는 글꼴) | 'chalk' 분필 꼴(손으로 쓴 꼴 — 위가 닫힌 4 · 가로줄 있는 7 · 꼬리가 굽은 9)
 *   back  = 뒷면(빈 나무 — 바람에 뒤집혔을 때)
 *   px    = 숫자 높이(화면 px — 가로 화면 96 이상 · 전화기 72 이상)
 * 팻말은 늘 같은 크기다(점 무늬 두 줄 자리를 늘 비워 둔다 — 점이 켜져도 팻말이 커지지 않고, 크기로 수를 미리 알 수 없다).
 * 팻말은 평면 안에서 돌지 않는다(6 과 9 가 뒤집혀 보이면 안 된다) — 이 그림에는 돌림이 없다. 뒤집힘은 세로 축으로만(부르는 쪽 CSS). */
export const NS = {
  WOOD: ['#d9a566', '#b47b3e'], GRAIN: 'rgba(90,50,15,.18)', EDGE: '#6b4423', NAIL: '#5b5f66',
  INK: '#3a2108', CHALK: '#fffdf2', CHALK_SHADE: 'rgba(255,253,242,.35)',
  DOT_ON: '#e0662c', DOT_ON_EDGE: '#a8431a', DOT_OFF: '#8a5a2b', FLASH: '#ffe27a',
  FONT: '"Pretendard","Noto Sans KR",system-ui,sans-serif',
  W: 1.32, PAD: .14, DOT: .17, DOT_GAP: .05, TOP: .16,        /* px 에 곱하는 몫: 너비 · 안쪽 여백 · 점 지름 · 점 사이 · 못 자리 */
};
/** 팻말 크기(화면 px): 숫자 높이 px → { w, h, dotsTop } */
export function size(px = 96){ const d = px * NS.DOT, g = px * NS.DOT_GAP, w = Math.round(Math.max(px * NS.W, 5 * d + 4 * g + px * NS.PAD * 2)), top = px * (NS.TOP + NS.PAD), dotsTop = top + px * 1.08, h = Math.round(dotsTop + 2 * d + g + px * NS.PAD * 1.4);
  return { w, h, dotsTop, d, g }; }

const DPR = () => Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
/** 숫자 팻말 하나(캔버스). */
export function numsign(n, opt = {}){ const c = document.createElement('canvas'); c.className = 'numsign'; paint(c, n, opt); return c; }

/** 같은 캔버스에 다시 그린다(팻말을 바꾸지 않고 점 · 꼴만 바꿀 때). */
export function paint(c, n, opt = {}){ const px = opt.px || 96, z = size(px), r = DPR();
  if (c.width !== Math.round(z.w * r) || c.height !== Math.round(z.h * r)) { c.width = Math.round(z.w * r); c.height = Math.round(z.h * r); }
  c.style.width = z.w + 'px'; c.style.height = z.h + 'px';
  const x = c.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0); x.clearRect(0, 0, z.w, z.h);
  board(x, z, px);
  c.dataset.n = opt.back ? '' : String(n); c.dataset.face = opt.back ? 'back' : (opt.face || 'book'); c.dataset.dots = opt.dots && !opt.back ? String(opt.lit == null ? n : opt.lit) : '';
  if (opt.back) { c.dataset.numpx = '0'; return c; }
  const cy = px * (NS.TOP + NS.PAD) + px * .5;
  c.dataset.numpx = String(Math.round(opt.face === 'chalk' ? chalk(x, n, z.w / 2, cy, px) : book(x, n, z.w / 2, cy, px)));
  if (opt.dots) dots(x, z, n, opt.lit == null ? n : opt.lit, opt.flash == null ? -1 : opt.flash);
  return c; }

function rr(x, a, b, w, h, k){ x.beginPath(); x.moveTo(a + k, b); x.arcTo(a + w, b, a + w, b + h, k); x.arcTo(a + w, b + h, a, b + h, k); x.arcTo(a, b + h, a, b, k); x.arcTo(a, b, a + w, b, k); x.closePath(); }
/** 나무 판: 둥근 네모 · 나뭇결 · 테두리 · 위의 못 둘(걸려 있다). */
function board(x, z, px){ const top = px * NS.TOP, k = px * .14, g = x.createLinearGradient(0, top, 0, z.h);
  g.addColorStop(0, NS.WOOD[0]); g.addColorStop(1, NS.WOOD[1]);
  x.save(); x.shadowColor = 'rgba(0,0,0,.28)'; x.shadowBlur = px * .08; x.shadowOffsetY = px * .05; rr(x, 2, top, z.w - 4, z.h - top - px * .07, k); x.fillStyle = g; x.fill(); x.restore();
  rr(x, 2, top, z.w - 4, z.h - top - px * .07, k); x.lineWidth = Math.max(2, px * .045); x.strokeStyle = NS.EDGE; x.stroke();
  x.save(); rr(x, 2, top, z.w - 4, z.h - top - px * .07, k); x.clip(); x.strokeStyle = NS.GRAIN; x.lineWidth = Math.max(1, px * .018);
  for (let y = top + px * .22; y < z.h; y += px * .27) { x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(z.w * .3, y - px * .05, z.w * .6, y + px * .06, z.w, y - px * .02); x.stroke(); } x.restore();
  for (const a of [.2, .8]) { x.beginPath(); x.arc(z.w * a, top + px * .1, px * .045, 0, 7); x.fillStyle = NS.NAIL; x.fill(); }
  x.beginPath(); x.moveTo(z.w * .2, top + px * .1); x.lineTo(z.w / 2, 1); x.lineTo(z.w * .8, top + px * .1); x.lineWidth = Math.max(1.5, px * .025); x.strokeStyle = NS.EDGE; x.stroke(); }
/** 교과서 꼴(기기 글꼴) — 숫자 높이가 px 가 되게 글자 크기를 맞춘다. → 그린 높이 */
function book(x, n, cx, cy, px){ const s = String(n); let f = px * 1.36; x.font = `900 ${f}px ${NS.FONT}`; let m = x.measureText(s), h = (m.actualBoundingBoxAscent || f * .72) + (m.actualBoundingBoxDescent || 0);
  if (h > 0) { f = f * px / h; x.font = `900 ${f}px ${NS.FONT}`; m = x.measureText(s); h = (m.actualBoundingBoxAscent || f * .72) + (m.actualBoundingBoxDescent || 0); }
  const asc = m.actualBoundingBoxAscent || f * .72; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = NS.INK; x.fillText(s, cx, cy - h / 2 + asc); return h; }
/** 분필 꼴: 손으로 쓴 획(0~1 칸 안의 길) — 위가 닫힌 4 · 가로줄 있는 7 · 꼬리가 굽은 9. → 그린 높이 */
const STROKES = {
  0: [['M', .5, .05], ['C', .12, .05, .12, .95, .5, .95], ['C', .88, .95, .88, .05, .5, .05]],
  1: [['M', .32, .22], ['L', .56, .05], ['L', .56, .95]],
  2: [['M', .2, .27], ['C', .26, .02, .8, .02, .78, .3], ['C', .76, .5, .4, .7, .2, .95], ['L', .84, .93]],
  3: [['M', .22, .13], ['C', .5, -.02, .86, .12, .7, .35], ['C', .62, .45, .5, .48, .44, .48], ['M', .44, .48], ['C', .9, .46, .88, .95, .48, .95], ['C', .34, .95, .24, .9, .18, .84]],
  4: [['M', .66, .95], ['L', .66, .05], ['L', .14, .66], ['L', .88, .66]],
  5: [['M', .78, .07], ['L', .32, .07], ['L', .27, .46], ['C', .55, .3, .86, .46, .8, .7], ['C', .74, .98, .34, 1, .18, .84]],
  6: [['M', .74, .1], ['C', .5, -.02, .2, .2, .22, .62], ['C', .24, 1.02, .8, 1, .79, .66], ['C', .78, .36, .36, .36, .24, .6]],
  7: [['M', .16, .08], ['L', .84, .08], ['L', .42, .95], ['M', .32, .5], ['L', .72, .5]],
  8: [['M', .5, .48], ['C', .12, .4, .2, .05, .5, .05], ['C', .8, .05, .88, .4, .5, .48], ['C', .08, .56, .16, .95, .5, .95], ['C', .84, .95, .92, .56, .5, .48]],
  9: [['M', .76, .34], ['C', .76, .02, .22, .02, .24, .33], ['C', .26, .62, .74, .6, .76, .34], ['C', .78, .7, .66, .92, .38, .95]],
};
function chalk(x, n, cx, cy, px){ const s = String(n), wch = px * .62, gap = px * .08, total = s.length * wch + (s.length - 1) * gap; let left = cx - total / 2;
  x.lineCap = 'round'; x.lineJoin = 'round';
  for (const ch of s) { const st = STROKES[ch]; if (!st) { left += wch + gap; continue; } const X = u => left + u * wch, Y = v => cy - px / 2 + v * px;
    for (const [lw, col, dy] of [[px * .15, NS.CHALK_SHADE, px * .015], [px * .11, NS.CHALK, 0]]) { x.beginPath(); for (const c of st) { if (c[0] === 'M') x.moveTo(X(c[1]), Y(c[2]) + dy); else if (c[0] === 'L') x.lineTo(X(c[1]), Y(c[2]) + dy); else x.bezierCurveTo(X(c[1]), Y(c[2]) + dy, X(c[3]), Y(c[4]) + dy, X(c[5]), Y(c[6]) + dy); } x.lineWidth = lw; x.strokeStyle = col; x.stroke(); }
    left += wch + gap; }
  return px; }
/** 점 무늬: 다섯씩 한 줄(빈 칸은 테두리만) · lit 개가 켜짐 · flash 번째가 반짝. */
function dots(x, z, n, lit, flash){ const rows = Math.max(1, Math.ceil(n / 5)), d = z.d, g = z.g, w0 = 5 * d + 4 * g, left = (z.w - w0) / 2;
  for (let r = 0; r < rows; r++) for (let k = 0; k < 5; k++) { const j = r * 5 + k, cx = left + k * (d + g) + d / 2, cy = z.dotsTop + r * (d + g) + d / 2, on = j < lit;
    if (j === flash) { x.beginPath(); x.arc(cx, cy, d * .85, 0, 7); x.fillStyle = NS.FLASH; x.fill(); }
    x.beginPath(); x.arc(cx, cy, d / 2 - 1, 0, 7); if (on) { x.fillStyle = NS.DOT_ON; x.fill(); x.lineWidth = 2; x.strokeStyle = NS.DOT_ON_EDGE; x.stroke(); } else { x.lineWidth = 2; x.strokeStyle = NS.DOT_OFF; x.globalAlpha = .55; x.stroke(); x.globalAlpha = 1; } } }
