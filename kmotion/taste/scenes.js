/* 맛보기 배경 — 놀이마다 다른 곳. 전부 도형으로 그린다(그림 파일 0). 시스템과 무관: 여기를 통째로 바꿔도 놀이는 그대로. */
import { W, H, lerp, clamp, rr } from './ui.js';
const h = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const grad = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, col]) => g.addColorStop(p, col)); return g; };
const glow = (c, x, y, r, col, a = 1) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
function hills(c, base, amp, seed, col, shift = 0){ c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 40) { const u = (x + shift) / 260; c.lineTo(x, base - amp * (.5 + .5 * Math.sin(u + seed)) - amp * .35 * Math.sin(u * 2.3 + seed * 3)); } c.lineTo(W, H); c.closePath(); c.fill(); }
function stars(c, t, n, a = 1, yMax = 330){ for (let i = 0; i < n; i++) { const tw = .5 + .5 * Math.sin(t / 500 + i * 2.1); c.fillStyle = `rgba(255,255,240,${a * (.35 + .65 * tw)})`; c.beginPath(); c.arc(h(i) * W, h(i + 50) * yMax, 1.2 + h(i + 99) * 2.2, 0, 7); c.fill(); } }
function cloud(c, x, y, s, col){ c.fillStyle = col; for (const [dx, dy, r] of [[0, 0, 34], [38, -12, 42], [84, 0, 36], [44, 12, 40]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, 7); c.fill(); } }
function tree(c, x, y, s, dark){ c.fillStyle = dark ? '#3a2816' : '#5a3d22'; c.fillRect(x - s * .07, y - s * .35, s * .14, s * .35); for (let k = 0; k < 3; k++) { c.fillStyle = dark ? ['#0f3b2c', '#14493a', '#1a5a45'][k] : ['#1f6b3f', '#2a8650', '#38a362'][k]; c.beginPath(); c.moveTo(x, y - s * (1.0 + k * .02)); c.lineTo(x + s * (.36 - k * .08), y - s * (.3 + k * .2)); c.lineTo(x - s * (.36 - k * .08), y - s * (.3 + k * .2)); c.closePath(); c.fill(); } }
function torch(c, x, y, t, s = 1){ c.fillStyle = '#3b2a1a'; c.fillRect(x - 6 * s, y, 12 * s, 60 * s); const f = 1 + .12 * Math.sin(t / 70 + x) + .08 * Math.sin(t / 37 + x * 2); glow(c, x, y - 10 * s, 190 * s * f, 'rgba(255,170,60,A)', .5); c.fillStyle = '#ff8a2b'; c.beginPath(); c.ellipse(x, y - 14 * s, 15 * s, 30 * s * f, 0, 0, 7); c.fill(); c.fillStyle = '#ffe07a'; c.beginPath(); c.ellipse(x, y - 8 * s, 8 * s, 17 * s * f, 0, 0, 7); c.fill(); }
function bricks(c, x0, y0, w, hh, bw, bh, base, line){ c.fillStyle = base; c.fillRect(x0, y0, w, hh); c.strokeStyle = line; c.lineWidth = 2; for (let r = 0; r * bh < hh; r++) { const y = y0 + r * bh; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); for (let x = x0 + (r % 2 ? bw / 2 : 0); x < x0 + w; x += bw) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, Math.min(y0 + hh, y + bh)); c.stroke(); } } }
function motes(c, t, n, col, yMin = 0, yMax = H, sp = 1){ for (let i = 0; i < n; i++) { const x = (h(i) * W + Math.sin(t / 1900 * sp + i) * 60 + t * .012 * sp * (h(i + 7) - .5) * 4) % W, y = yMin + ((h(i + 31) * (yMax - yMin) - t * .018 * sp * (.4 + h(i + 5))) % (yMax - yMin) + (yMax - yMin)) % (yMax - yMin), a = .35 + .65 * Math.abs(Math.sin(t / 700 + i * 1.7)); glow(c, (x + W) % W, y, 16, col, a * .7); c.fillStyle = col.replace('A', a); c.beginPath(); c.arc((x + W) % W, y, 2.6, 0, 7); c.fill(); } }

export const scene = {
  // 갈림길 달리기 — 해 질 녘 숲길. 나무가 옆으로 스쳐 가고, 뒤에서 바위가 솟아오른다.
  run(c, t, { road, dash, v, HOR }){
    c.fillStyle = grad(c, 0, 0, 0, HOR, [[0, '#1b2a5c'], [.55, '#7a4f8f'], [1, '#ffb36b']]); c.fillRect(0, 0, W, HOR + 2);
    glow(c, W * .68, HOR - 30, 260, 'rgba(255,220,150,A)', .9); c.fillStyle = '#ffe9b0'; c.beginPath(); c.arc(W * .68, HOR - 30, 46, 0, 7); c.fill();
    stars(c, t, 26, .6, 150); cloud(c, (t * .012) % (W + 300) - 200, 70, 1, 'rgba(255,255,255,.16)'); cloud(c, (t * .02 + 600) % (W + 300) - 200, 130, .7, 'rgba(255,255,255,.12)');
    hills(c, HOR, 130, 1.3, '#3d3566', road * 6); hills(c, HOR + 6, 80, 4.1, '#2c4a4f', road * 14);
    c.fillStyle = grad(c, 0, HOR, 0, H, [[0, '#2d6b45'], [1, '#143820']]); c.fillRect(0, HOR, W, H - HOR);
    c.fillStyle = grad(c, 0, HOR, 0, H, [[0, '#a68a63'], [1, '#6b5237']]); c.beginPath(); c.moveTo(W / 2 - 150, HOR); c.lineTo(W / 2 + 150, HOR); c.lineTo(W / 2 + 520, H); c.lineTo(W / 2 - 520, H); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,245,210,.4)'; c.lineWidth = 4; for (const k of [-.5, .5]) { c.beginPath(); c.moveTo(W / 2 + k * 100, HOR); c.lineTo(W / 2 + k * 346, H); c.stroke(); }
    for (let i = 0; i < 9; i++) { const s = ((i / 9 + road * .5) % 1), e = s * s, y = lerp(HOR, H, e); c.strokeStyle = `rgba(60,40,20,${.3 * s})`; c.lineWidth = 2 + e * 8; c.beginPath(); c.moveTo(W / 2 - lerp(150, 520, e), y); c.lineTo(W / 2 + lerp(150, 520, e), y); c.stroke(); }
    const N = 16, list = []; for (let i = 0; i < N; i++) { const s = ((i / N + road * .5) % 1); list.push({ s, side: i % 2 ? 1 : -1, k: i }); } list.sort((a, b) => a.s - b.s);
    for (const o of list) { const e = o.s * o.s, y = lerp(HOR, H + 60, e), x = W / 2 + o.side * lerp(190, 800, e) + o.side * h(o.k) * 60 * e; c.globalAlpha = clamp(o.s * 6, 0, 1); if (h(o.k + 3) < .22) { c.fillStyle = '#5d6a7a'; c.beginPath(); c.ellipse(x, y - 14 * e, 60 * e + 6, 34 * e + 4, 0, 0, 7); c.fill(); } else tree(c, x, y, lerp(40, 520, e), false); c.globalAlpha = 1; }
    if (dash > 0) { c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; for (let i = 0; i < 26; i++) { const a = h(i + Math.floor(t / 50)) * Math.PI * 2, r0 = 260 + h(i * 3) * 120, r1 = r0 + 180; c.beginPath(); c.moveTo(W / 2 + Math.cos(a) * r0, HOR + 90 + Math.sin(a) * r0 * .6); c.lineTo(W / 2 + Math.cos(a) * r1, HOR + 90 + Math.sin(a) * r1 * .6); c.stroke(); } }
  },
  // 바위(달리기의 위협) — 화면 아래에서 굴러 올라온다
  boulder(c, t, v){ if (v < .3) return; const r = (v - .3) / .7, R0 = 460, cy = H + R0 - 40 - r * 250, rot = t / 260;
    c.save(); c.translate(W / 2, cy); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, -R0 - 10, R0 * .9, 40, 0, 0, 7); c.fill();
    c.fillStyle = grad(c, 0, -R0, 0, 0, [[0, '#8d8378'], [1, '#4a433c']]); c.beginPath(); c.arc(0, 0, R0, 0, 7); c.fill(); c.strokeStyle = '#2b2622'; c.lineWidth = 8; c.stroke();
    c.save(); c.rotate(rot); c.strokeStyle = 'rgba(30,25,22,.6)'; c.lineWidth = 7; for (let i = 0; i < 9; i++) { const a = i * .7; c.beginPath(); c.moveTo(Math.cos(a) * R0 * .35, Math.sin(a) * R0 * .35); c.lineTo(Math.cos(a + .25) * R0 * .7, Math.sin(a + .25) * R0 * .7); c.lineTo(Math.cos(a + .1) * R0 * .93, Math.sin(a + .1) * R0 * .93); c.stroke(); } c.restore();
    if (r > .45) { const ey = -R0 + 120; for (const sx of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sx * 90, ey, 44, 34, 0, 0, 7); c.fill(); c.fillStyle = '#d02020'; c.beginPath(); c.arc(sx * 90, ey + 6, 16, 0, 7); c.fill(); c.strokeStyle = '#1a1512'; c.lineWidth = 12; c.beginPath(); c.moveTo(sx * 40, ey - 44); c.lineTo(sx * 140, ey - 70); c.stroke(); } }
    c.restore(); },
  // 슬라임 공방 — 버섯 불빛이 도는 동굴 작업실
  slime(c, t, v){
    c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#0e1b2e'], [.6, '#143246'], [1, '#0c1a26']]); c.fillRect(0, 0, W, H);
    c.fillStyle = '#0a1320'; c.beginPath(); c.moveTo(0, 0); for (let x = 0; x <= W; x += 80) c.lineTo(x, 40 + h(x) * 90); c.lineTo(W, 0); c.closePath(); c.fill();     // 천장 종유석
    for (let i = 0; i < 9; i++) { const x = 60 + i * 150 + h(i) * 40, L = 60 + h(i + 9) * 110; c.fillStyle = '#0d1a2b'; c.beginPath(); c.moveTo(x - 22, 30); c.lineTo(x + 22, 30); c.lineTo(x, 30 + L); c.closePath(); c.fill(); }
    for (const [x, col] of [[120, 'rgba(110,255,200,A)'], [330, 'rgba(255,150,230,A)'], [980, 'rgba(120,200,255,A)'], [1170, 'rgba(255,220,120,A)']]) { const y = 560 + h(x) * 20, s = .8 + h(x + 1) * .6, p = .6 + .4 * Math.sin(t / 600 + x); glow(c, x, y - 40 * s, 200 * s, col, .35 * p); c.fillStyle = '#e9e2d0'; c.fillRect(x - 9 * s, y - 50 * s, 18 * s, 60 * s); c.fillStyle = col.replace('A', .95); c.beginPath(); c.ellipse(x, y - 54 * s, 52 * s, 30 * s, 0, Math.PI, 0); c.fill(); }
    // 선반과 병
    for (const sx of [70, 1010]) { c.fillStyle = '#3b2a1c'; c.fillRect(sx, 250, 200, 12); c.fillRect(sx, 340, 200, 12); for (let k = 0; k < 4; k++) for (const sy of [250, 340]) { const x = sx + 22 + k * 46, col = ['#6df0c0', '#ff8fd0', '#8fc8ff', '#ffd76d'][(k + sy) % 4]; glow(c, x + 12, sy - 26, 44, 'rgba(255,255,255,A)', .12); c.fillStyle = 'rgba(220,240,255,.25)'; rr(c, x, sy - 50, 26, 50, 8); c.fill(); c.fillStyle = col; rr(c, x + 3, sy - 26 - 6 * Math.sin(t / 500 + k), 20, 24 + 6 * Math.sin(t / 500 + k), 6); c.fill(); } }
    // 작업대
    c.fillStyle = grad(c, 0, 520, 0, 720, [[0, '#6b4a2c'], [1, '#33210f']]); c.fillRect(0, 540, W, 180); c.fillStyle = '#8a623a'; c.fillRect(0, 528, W, 18); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let x = 60; x < W; x += 170) { c.beginPath(); c.moveTo(x, 546); c.lineTo(x - 30, 720); c.stroke(); }
    motes(c, t, 22, 'rgba(160,255,220,A)', 120, 520);
    if (v > .7) { c.fillStyle = `rgba(255,90,40,${(v - .7) * .5})`; c.fillRect(0, 0, W, H); }
  },
  // 구슬 모으기 — 횃불이 타는 돌벽과 마법 문
  vault(c, t, v){
    bricks(c, 0, 0, W, 600, 128, 60, '#2b2a44', 'rgba(0,0,0,.35)'); c.fillStyle = grad(c, 0, 0, 0, 600, [[0, 'rgba(8,8,24,.75)'], [.5, 'rgba(8,8,24,.15)'], [1, 'rgba(8,8,24,.6)']]); c.fillRect(0, 0, W, 600);
    c.fillStyle = grad(c, 0, 600, 0, H, [[0, '#3a3552'], [1, '#17152a']]); c.fillRect(0, 600, W, 120); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let x = -200; x < W + 200; x += 160) { c.beginPath(); c.moveTo(W / 2 + (x - W / 2) * .55, 600); c.lineTo(x, H); c.stroke(); }
    torch(c, 400, 150, t, 1.1); torch(c, 880, 150, t, 1.1);
    for (let i = 0; i < 7; i++) { const a = t / 1400 + i * .9, x = 640 + Math.cos(a) * 330, y = 120 + Math.sin(a * 1.3) * 26 + i * 8; c.fillStyle = `rgba(160,140,255,${.25 + .2 * Math.sin(t / 300 + i)})`; c.font = '900 26px serif'; c.textAlign = 'center'; c.fillText('✦', x, y); }
    motes(c, t, 14, 'rgba(255,200,120,A)', 80, 600, .6);
  },
  // 등불 창고 — 반딧불 도는 밤의 창고 앞마당
  yard(c, t, v){
    c.fillStyle = grad(c, 0, 0, 0, 620, [[0, '#070b22'], [.7, '#1b2452'], [1, '#3a2f5a']]); c.fillRect(0, 0, W, 620); stars(c, t, 60, 1, 420);
    glow(c, 900, 110, 220, 'rgba(220,230,255,A)', .5); c.fillStyle = '#eef2ff'; c.beginPath(); c.arc(900, 110, 50, 0, 7); c.fill(); c.fillStyle = 'rgba(190,200,230,.6)'; c.beginPath(); c.arc(884, 98, 12, 0, 7); c.fill(); c.beginPath(); c.arc(916, 126, 8, 0, 7); c.fill();
    hills(c, 560, 110, 2.2, '#131a3c'); hills(c, 600, 70, 5.0, '#0d1330');
    // 창고(왼쪽)
    c.fillStyle = '#3a2917'; c.fillRect(0, 150, 360, 470); c.fillStyle = '#2a1d10'; c.beginPath(); c.moveTo(-20, 160); c.lineTo(180, 60); c.lineTo(390, 160); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; for (let x = 30; x < 360; x += 46) { c.beginPath(); c.moveTo(x, 160); c.lineTo(x, 620); c.stroke(); }
    for (const [x, y] of [[330, 190], [500, 120], [1230, 250]]) { const sw = Math.sin(t / 900 + x) * 6; c.strokeStyle = '#1a120a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 60); c.lineTo(x + sw, y); c.stroke(); glow(c, x + sw, y + 18, 170, 'rgba(255,180,70,A)', .5 + .08 * Math.sin(t / 130 + x)); c.fillStyle = '#ffb347'; rr(c, x + sw - 16, y, 32, 40, 10); c.fill(); c.fillStyle = '#5a3a14'; c.fillRect(x + sw - 18, y - 4, 36, 7); c.fillRect(x + sw - 18, y + 38, 36, 7); }
    c.fillStyle = grad(c, 0, 620, 0, H, [[0, '#2d2538'], [1, '#15111d']]); c.fillRect(0, 620, W, 100);
    motes(c, t, 26, 'rgba(230,255,120,A)', 180, 640, 1.2);
  },
  // 성문 지키기 — 노을 진 성벽. 양쪽 언덕에서 투석기가 쏜다
  castle(c, t, v){
    c.fillStyle = grad(c, 0, 0, 0, 560, [[0, '#2a2f6b'], [.5, '#b0527a'], [1, '#ffb070']]); c.fillRect(0, 0, W, 560);
    glow(c, 640, 470, 420, 'rgba(255,220,150,A)', .7); cloud(c, (t * .01) % (W + 300) - 200, 150, 1.2, 'rgba(255,220,220,.2)'); cloud(c, (t * .016 + 700) % (W + 300) - 200, 230, .8, 'rgba(255,220,220,.16)');
    hills(c, 520, 160, .7, '#5a3a66'); hills(c, 560, 90, 3.3, '#3d2f55');
    for (const sx of [-1, 1]) { const x = 640 + sx * 560, y = 400; c.fillStyle = '#2a2038'; c.fillRect(x - 40, y, 80, 60); c.save(); c.translate(x, y); c.rotate(sx * (-.5 + .25 * Math.sin(t / 420 + sx))); c.fillRect(-6, -90, 12, 90); c.beginPath(); c.arc(0, -96, 16, 0, 7); c.fill(); c.restore(); }
    // 성벽
    c.fillStyle = grad(c, 0, 520, 0, H, [[0, '#8b7a94'], [1, '#4a4058']]); c.fillRect(0, 540, W, 180); bricks(c, 0, 540, W, 180, 110, 44, 'rgba(0,0,0,0)', 'rgba(0,0,0,.2)');
    c.fillStyle = '#8b7a94'; for (let x = 0; x < W; x += 110) c.fillRect(x, 510, 66, 34);
    for (const fx of [240, 1040]) { c.fillStyle = '#3a3048'; c.fillRect(fx - 4, 400, 8, 120); c.fillStyle = '#e04a5a'; c.beginPath(); c.moveTo(fx + 4, 404); for (let k = 0; k <= 6; k++) c.lineTo(fx + 4 + k * 12, 404 + Math.sin(t / 200 + k * .8) * 6 + (k === 6 ? 22 : 0)); for (let k = 6; k >= 0; k--) c.lineTo(fx + 4 + k * 12, 448 + Math.sin(t / 200 + k * .8) * 6 - (k === 6 ? 22 : 0)); c.closePath(); c.fill(); }
  },
  // 시계탑 — 해가 넘어가는 마을 위 탑
  tower(c, t, v, C, RAD){
    const day = [[90, 170, 235], [255, 214, 150]], dusk = [[36, 30, 84], [220, 96, 70]], m = (a, b) => `rgb(${a.map((x, i) => Math.round(lerp(x, b[i], v))).join(',')})`;
    c.fillStyle = grad(c, 0, 0, 0, H, [[0, m(day[0], dusk[0])], [1, m(day[1], dusk[1])]]); c.fillRect(0, 0, W, H);
    if (v > .45) stars(c, t, 50, (v - .45) / .55, 380);
    const sx = 150 + v * 90, sy = 130 + v * 500; glow(c, sx, sy, 240, 'rgba(255,220,130,A)', .8); c.fillStyle = v > .6 ? '#ff9a4d' : '#ffe07a'; c.beginPath(); c.arc(sx, sy, 58, 0, 7); c.fill();
    cloud(c, (t * .014) % (W + 300) - 200, 110, 1.1, 'rgba(255,255,255,.55)'); cloud(c, (t * .022 + 500) % (W + 300) - 200, 210, .7, 'rgba(255,255,255,.4)'); cloud(c, (t * .009 + 900) % (W + 300) - 200, 300, .9, 'rgba(255,255,255,.3)');
    for (let i = 0; i < 5; i++) { const bx = (t * .05 + i * 290) % (W + 100) - 50, by = 170 + h(i) * 120 + Math.sin(t / 300 + i) * 8, fl = Math.sin(t / 110 + i) * 8; c.strokeStyle = 'rgba(30,30,50,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 12, by - fl); c.lineTo(bx, by); c.lineTo(bx + 12, by - fl); c.stroke(); }
    hills(c, 640, 60, 1.9, `rgba(40,50,80,${.5 + v * .3})`);
    for (let i = 0; i < 16; i++) { const x = i * 86 - 20, w = 70, hh = 50 + h(i) * 70; c.fillStyle = `rgb(${50 - v * 20 | 0},${56 - v * 22 | 0},${84 - v * 26 | 0})`; c.fillRect(x, 720 - hh, w, hh); c.beginPath(); c.moveTo(x - 8, 720 - hh); c.lineTo(x + w / 2, 720 - hh - 34); c.lineTo(x + w + 8, 720 - hh); c.closePath(); c.fill(); if (v > .5 && h(i + 4) > .4) { c.fillStyle = `rgba(255,214,120,${(v - .5) * 1.8})`; c.fillRect(x + 20, 720 - hh + 16, 14, 16); } }
    // 탑 몸통
    bricks(c, C.x - RAD - 70, C.y - RAD - 40, (RAD + 70) * 2, H, 92, 46, '#7b5a48', 'rgba(0,0,0,.22)'); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(C.x - RAD - 70, C.y - RAD - 40, 40, H);
    c.fillStyle = '#4a2f2a'; c.beginPath(); c.moveTo(C.x - RAD - 110, C.y - RAD - 38); c.lineTo(C.x, C.y - RAD - 150); c.lineTo(C.x + RAD + 110, C.y - RAD - 38); c.closePath(); c.fill();
  } };

// ── 터치 놀이용 배경 셋
scene.orchard = function(c, t, v){        // 과일 베기 — 과수원 하늘
  c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#3aa0e8'], [.6, '#a8e0ff'], [1, '#e8f7c8']]); c.fillRect(0, 0, W, H);
  glow(c, 1080, 120, 260, 'rgba(255,245,180,A)', .9); c.fillStyle = '#fff3a8'; c.beginPath(); c.arc(1080, 120, 54, 0, 7); c.fill();
  cloud(c, (t * .012) % (W + 300) - 200, 120, 1.2, 'rgba(255,255,255,.85)'); cloud(c, (t * .02 + 640) % (W + 300) - 200, 220, .8, 'rgba(255,255,255,.7)');
  hills(c, 600, 120, 1.1, '#7fcf7a'); hills(c, 650, 80, 3.7, '#4fae5c');
  for (let i = 0; i < 6; i++) { const x = 80 + i * 230 + h(i) * 50, y = 640 + h(i + 4) * 30, s = 150 + h(i + 8) * 60; c.fillStyle = '#6b4526'; c.fillRect(x - 9, y - s * .5, 18, s * .5); c.fillStyle = '#2f8f47'; c.beginPath(); c.arc(x, y - s * .7, s * .42, 0, 7); c.fill(); c.fillStyle = '#3fae5a'; c.beginPath(); c.arc(x - s * .18, y - s * .78, s * .26, 0, 7); c.fill(); for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? '#ff5d5d' : '#ffb02e'; c.beginPath(); c.arc(x + (h(i * 7 + k) - .5) * s * .6, y - s * (.55 + h(i * 3 + k) * .35), 8, 0, 7); c.fill(); } }
  c.fillStyle = grad(c, 0, 660, 0, H, [[0, '#4fae5c'], [1, '#2f7d43']]); c.fillRect(0, 668, W, 60);
  if (v > .7) { c.fillStyle = `rgba(255,70,50,${(v - .7) * .5})`; c.fillRect(0, 0, W, H); }
};
scene.pond = function(c, t, v, lineY){     // 수직선 폴짝 — 연못
  c.fillStyle = grad(c, 0, 0, 0, 330, [[0, '#254a8a'], [1, '#f2b880']]); c.fillRect(0, 0, W, 330); stars(c, t, 20, .5, 140);
  hills(c, 330, 120, 2.4, '#2e5a52'); hills(c, 345, 70, 5.2, '#234a45');
  c.fillStyle = grad(c, 0, 330, 0, H, [[0, '#2c7a8c'], [1, '#12384a']]); c.fillRect(0, 330, W, H - 330);
  c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 3; for (let i = 0; i < 16; i++) { const y = 350 + i * 24, o = Math.sin(t / 900 + i) * 40; c.beginPath(); c.moveTo(60 + (i % 3) * 120 + o, y); c.lineTo(260 + (i % 3) * 120 + o, y); c.moveTo(700 + (i % 4) * 90 - o, y + 8); c.lineTo(900 + (i % 4) * 90 - o, y + 8); c.stroke(); }
  for (let i = 0; i < 9; i++) { const x = 30 + i * 150 + h(i) * 60, y = 330; c.strokeStyle = '#1d5a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y + 30); c.quadraticCurveTo(x + Math.sin(t / 700 + i) * 10, y - 40, x + Math.sin(t / 700 + i) * 16, y - 80 - h(i + 2) * 40); c.stroke(); c.fillStyle = '#5a3a1e'; c.beginPath(); c.ellipse(x + Math.sin(t / 700 + i) * 16, y - 86 - h(i + 2) * 40, 7, 18, 0, 0, 7); c.fill(); }
  motes(c, t, 16, 'rgba(230,255,140,A)', 120, 330, 1);
};
scene.alley = function(c, t, v){           // 볼링 — 불 켜진 볼링장
  c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#1a1033'], [1, '#2a1a4a']]); c.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { const col = ['#ff5d8f', '#ffd35c', '#5dd0ff', '#7dff9a'][i % 4]; c.fillStyle = col; c.globalAlpha = .5 + .5 * Math.sin(t / 300 + i); c.beginPath(); c.arc(60 + i * 106, 40, 10, 0, 7); c.fill(); c.globalAlpha = 1; }
  c.fillStyle = grad(c, 0, 150, 0, H, [[0, '#c9955a'], [1, '#e8c088']]); c.beginPath(); c.moveTo(W / 2 - 210, 150); c.lineTo(W / 2 + 210, 150); c.lineTo(W / 2 + 430, H); c.lineTo(W / 2 - 430, H); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(90,50,20,.25)'; c.lineWidth = 2; for (let k = -5; k <= 5; k++) { c.beginPath(); c.moveTo(W / 2 + k * 40, 150); c.lineTo(W / 2 + k * 82, H); c.stroke(); }
  for (const sx of [-1, 1]) { c.fillStyle = '#3a2a5a'; c.beginPath(); c.moveTo(W / 2 + sx * 210, 150); c.lineTo(W / 2 + sx * 250, 150); c.lineTo(W / 2 + sx * 520, H); c.lineTo(W / 2 + sx * 430, H); c.closePath(); c.fill(); }
  c.fillStyle = '#120a26'; c.fillRect(W / 2 - 250, 96, 500, 60);
};

// ── 등장인물(도형)
export function wizardCart(c, x, y, t, dash){ c.save(); c.translate(x, y + Math.sin(t / 60) * 3);
  c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 52, 80, 14, 0, 0, 7); c.fill();
  if (dash > 0) { for (let k = 0; k < 5; k++) { c.fillStyle = `rgba(255,${200 - k * 30},60,${.7 - k * .12})`; c.beginPath(); c.ellipse((Math.random() - .5) * 50, 70 + k * 22, 26 - k * 3, 20, 0, 0, 7); c.fill(); } }
  c.fillStyle = '#8c1f2a'; rr(c, -66, -40, 132, 76, 16); c.fill(); c.fillStyle = '#c0392b'; rr(c, -66, -46, 132, 66, 16); c.fill(); c.strokeStyle = '#ffd35c'; c.lineWidth = 5; c.stroke();
  for (const sx of [-1, 1]) { c.fillStyle = '#231a14'; c.beginPath(); c.arc(sx * 42, 30, 20, 0, 7); c.fill(); c.strokeStyle = '#c9b089'; c.lineWidth = 4; c.stroke(); c.save(); c.translate(sx * 42, 30); c.rotate(t / 80); c.beginPath(); c.moveTo(-18, 0); c.lineTo(18, 0); c.moveTo(0, -18); c.lineTo(0, 18); c.stroke(); c.restore(); }
  c.fillStyle = '#5b3fd6'; c.beginPath(); c.ellipse(0, -52, 30, 24, 0, 0, 7); c.fill();                                    // 망토
  c.fillStyle = '#ffd9b3'; c.beginPath(); c.arc(0, -82, 22, 0, 7); c.fill();                                                 // 머리(뒤통수)
  c.fillStyle = '#3a2bb0'; c.beginPath(); c.moveTo(-34, -92); c.lineTo(34, -92); c.lineTo(6 + Math.sin(t / 200) * 6, -160); c.closePath(); c.fill(); c.fillRect(-40, -96, 80, 9);
  c.fillStyle = '#ffd35c'; c.beginPath(); c.arc(6 + Math.sin(t / 200) * 6, -160, 7, 0, 7); c.fill(); c.restore(); }
export function villager(c, x, y, t, col = '#4d9dff', cheer = 0){ const b = Math.abs(Math.sin(t / 160 + x)) * (6 + cheer * 16); c.save(); c.translate(x, y - b); c.fillStyle = col; rr(c, -18, -44, 36, 50, 10); c.fill(); c.fillStyle = '#ffd9b3'; c.beginPath(); c.arc(0, -60, 17, 0, 7); c.fill(); c.fillStyle = '#2b1d10'; c.beginPath(); c.arc(-6, -62, 2.6, 0, 7); c.arc(6, -62, 2.6, 0, 7); c.fill(); c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round'; const up = cheer ? -28 : 6; c.beginPath(); c.moveTo(-18, -34); c.lineTo(-32, -34 + up); c.moveTo(18, -34); c.lineTo(32, -34 + up); c.stroke(); c.restore(); }
export function horse(c, x, y, t, hurry){ const st = Math.sin(t / (hurry ? 70 : 260)) * (hurry ? 10 : 2); c.save(); c.translate(x, y); c.fillStyle = '#7a5230'; c.beginPath(); c.ellipse(0, 0, 62, 34, 0, 0, 7); c.fill(); c.fillRect(-44, 20, 12, 46 + st); c.fillRect(-18, 20, 12, 46 - st); c.fillRect(18, 20, 12, 46 + st); c.fillRect(40, 20, 12, 46 - st);
  c.save(); c.translate(54, -18); c.rotate(-.5 + (hurry ? Math.sin(t / 90) * .12 : 0)); c.fillRect(-12, -52, 26, 60); c.beginPath(); c.ellipse(6, -62, 20, 30, .5, 0, 7); c.fill(); c.fillStyle = '#3d2714'; c.fillRect(-16, -56, 8, 50); c.fillStyle = '#fff'; c.beginPath(); c.arc(8, -70, 5, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(9, -70, 2.5, 0, 7); c.fill(); c.restore();
  c.strokeStyle = '#3d2714'; c.lineWidth = 8; c.beginPath(); c.moveTo(-60, -8); c.quadraticCurveTo(-92, 0 + st, -84, 34); c.stroke(); c.restore(); }
// 슬라임 한 마리(가로로 긴 몸) — xa..xb 사이를 덮는다
export function slimeBody(c, xa, xb, cy, hgt, t, col, mood = 0, seed = 0){ const w = xb - xa, cx = (xa + xb) / 2, rx = w / 2, ry = hgt / 2;
  c.save(); c.translate(cx, cy); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, ry + 4, rx * .95, 16, 0, 0, 7); c.fill();
  // 알약 모양 몸 + 위쪽이 살짝 출렁
  const r0 = Math.min(ry, rx), n = 48; c.beginPath(); for (let k = 0; k <= n; k++) { const a = k / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); const px = (rx - r0) * Math.sign(ca) * Math.min(1, Math.abs(ca) * 3) + ca * r0, wob = sa < 0 ? 1 + .05 * Math.sin(px / 46 + t / 260 + seed) : 1; c.lineTo(px, sa * ry * wob * (sa > 0 ? .9 : 1)); } c.closePath();
  const g = c.createLinearGradient(0, -ry, 0, ry); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-rx * .45, -ry * .55, rx * .22, ry * .14, -.3, 0, 7); c.fill();
  const blink = (Math.sin(t / 1300 + seed * 3) > .96) ? .15 : 1, ey = -ry * .42, ex = Math.min(34, rx * .3);
  for (const sx of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sx * ex, ey, 13, 15 * blink, 0, 0, 7); c.fill(); c.fillStyle = '#122'; c.beginPath(); c.ellipse(sx * ex + 2, ey + 2, 6, 7 * blink, 0, 0, 7); c.fill(); }
  c.strokeStyle = '#122'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); if (mood > .7) { c.arc(0, ey + 30, 10, Math.PI, 0); } else if (mood < 0) { c.arc(0, ey + 16, 12, .1 * Math.PI, .9 * Math.PI); } else { c.moveTo(-8, ey + 22); c.lineTo(8, ey + 22); } c.stroke(); c.restore(); }
export function orb(c, x, y, r, t, held, seed = 0){ const by = held ? 0 : Math.sin(t / 420 + seed) * 7; glow(c, x, y + by, r * 2.1, 'rgba(255,200,80,A)', held ? .7 : .4); const g = c.createRadialGradient(x - r * .3, y + by - r * .35, r * .1, x, y + by, r); g.addColorStop(0, '#fff3c2'); g.addColorStop(.5, '#ffc93d'); g.addColorStop(1, '#d98a12'); c.fillStyle = g; c.beginPath(); c.arc(x, y + by, r, 0, 7); c.fill(); c.strokeStyle = held ? '#fff' : 'rgba(255,255,255,.7)'; c.lineWidth = held ? 7 : 4; c.stroke(); return by; }
export function bolt(c, a, b, t){ c.strokeStyle = 'rgba(190,230,255,.9)'; c.lineWidth = 5; c.beginPath(); c.moveTo(a.x, a.y); for (let k = 1; k < 7; k++) { const u = k / 7; c.lineTo(lerp(a.x, b.x, u) + (h(k + Math.floor(t / 45)) - .5) * 44, lerp(a.y, b.y, u) + (h(k * 3 + Math.floor(t / 45)) - .5) * 44); } c.lineTo(b.x, b.y); c.stroke(); }
export { glow };
