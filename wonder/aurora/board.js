/* 케이원더 · 오로라 — 묶음 ㄱ 손잡이 판(회색 도형). 그림·셰이더는 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 보는 창: 망원경(호숫가에서 북쪽 하늘) 또는 위성 창(북극 위에서 내려다본 지구).
 * 오른쪽(아래) = 조종판: 태양 바람 레버 · 고도 다이얼 · 컷 스위치(망원경 ↔ 위성 창).
 */
import { aurora, ALT_MIN, ALT_MAX, ALT_DEFAULT, KOREA_LAT, N2_TOP, GREEN_TOP, LEVELS, COLORS, MISSIONS, WHY } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = { waiting: false, pid: null, wind: 0.45, alt: ALT_DEFAULT, cut: 'ground', magnet: true, planet: 'earth', mi: 0, free: false, grab: null, phase: 0, res: null, lastSay: '' };
  let W = 0, H = 0, dpr = 1, VIEW = null, PANEL = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', metal: '#aeb4bf', sky: '#0e1118', warm: '#d8b48a' };
  const TINT = { pink: [196, 140, 172], green: [128, 176, 140], red: [186, 112, 104], blue: [128, 156, 200] };   // 살짝 탁한 색(형광 아님)
  const rgba = (k, a) => `rgba(${TINT[k][0]},${TINT[k][1]},${TINT[k][2]},${a})`;

  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    const h = H - top - bottom;
    if (W >= H * 1.15) { VIEW = { x: 8, y: top, w: W * 0.62 - 12, h }; PANEL = { x: W * 0.62 + 4, y: top, w: W * 0.38 - 12, h }; }
    else { VIEW = { x: 8, y: top, w: W - 16, h: h * 0.6 }; PANEL = { x: 8, y: top + h * 0.6 + 6, w: W - 16, h: h * 0.4 - 6 }; }
  }

  // ── 조종판 손잡이 자리
  function handles() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    const P = PANEL, wide = P.w >= P.h * 1.05;
    let lever, dial, sw;
    if (wide) {
      const cw = P.w / 3, top = P.y + 30, bot = P.y + P.h - 26;
      lever = { x: P.x + cw * 0.5, y0: top + 14, y1: bot - 18 };
      dial = { x: P.x + cw * 1.5, y: (top + bot) / 2, r: Math.max(20, Math.min(cw * 0.32, (bot - top) * 0.3)) };
      sw = { x: P.x + cw * 2.5, y: (top + bot) / 2, w: Math.min(cw * 0.5, 56), h: Math.min((bot - top) * 0.62, 120) };
    } else {
      const top = P.y + 34, bot = P.y + P.h - 26, cx2 = P.x + P.w * 0.7;
      lever = { x: P.x + P.w * 0.27, y0: top + 14, y1: bot - 18 };
      const mid = top + (bot - top) * 0.45;
      dial = { x: cx2, y: top + (mid - top) / 2 + 12, r: Math.max(22, Math.min(P.w * 0.18, (mid - top) * 0.34)) };
      sw = { x: cx2, y: mid + (bot - mid) / 2 + 6, w: Math.min(P.w * 0.2, 56), h: Math.min((bot - mid) * 0.6, 110) };
    }
    lever.ky = lever.y1 - (lever.y1 - lever.y0) * S.wind;
    dial.a = dialAngle(S.alt);
    return { lever, dial, sw };
  }
  const A0 = -Math.PI * 0.75, A1 = Math.PI * 0.75;                                 // 다이얼이 도는 끝(12시 기준)
  const dialAngle = alt => A0 + (A1 - A0) * (alt - ALT_MIN) / (ALT_MAX - ALT_MIN);

  // ── 상태가 바뀜 → 말·판정
  function update(judgeNow) {
    S.res = aurora({ wind: S.wind, alt: S.alt, cut: S.cut, magnet: S.magnet, planet: S.planet });
    if (S.res.says !== S.lastSay) { S.lastSay = S.res.says; ui.say(S.res.says); }
    if (judgeNow) judge();
    return S.res;
  }
  let nextT = null, whyT = null;
  function showMission() {
    S.waiting = false; clearTimeout(nextT); nextT = null;                               // 성공 뒤 쉬는 때가 끝남 → 다음 의뢰를 보여 주고 나서야 판정
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 바꿔 보세요', '지구 자석을 끄거나 목성으로 가 볼 수도 있어요');
    ui.freeMode(S.free);
  }
  function succeed(i) {
    S.waiting = true;
    S.mi = i + 1; if (S.mi >= MISSIONS.length) { S.free = true; ui.freeMode(true); }
    ui.note('성공! ⭐', ['초록 커튼이 머리 위에서 너울거려요.', '아래는 분홍, 위는 초록 — 높이마다 빛내는 공기가 달라요.', '아주 큰 폭풍 때는 우리나라 하늘에도 붉은 오로라가 떴어요. 옛 기록에 남아 있어요.'][i]);
    clearTimeout(whyT); whyT = setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    clearTimeout(nextT); nextT = setTimeout(showMission, 8000);
  }
  function judge() {
    if (S.waiting || S.mi >= MISSIONS.length) return;
    const m = MISSIONS[S.mi], r = S.res;
    if (m.ok(r)) succeed(S.mi);
    else ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, m.tell(r) + ' · 귀띔: ' + m.hint);
  }
  function set(o = {}, judgeNow = true) {
    if (o.wind != null) S.wind = Math.max(0, Math.min(1, o.wind));
    if (o.alt != null) S.alt = Math.max(ALT_MIN, Math.min(ALT_MAX, o.alt));
    if (o.cut) S.cut = o.cut;
    if (o.magnet != null) S.magnet = !!o.magnet;
    if (o.planet) S.planet = o.planet;
    return update(judgeNow);
  }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    if (S.grab) return;                                                                  // 한 손가락이 쥐고 있는 동안 다른 손가락은 무시
    const [x, y] = P(e), h = handles();
    if (Math.abs(x - h.lever.x) < 34 && y > h.lever.y0 - 26 && y < h.lever.y1 + 26) { S.grab = 'lever'; moveLever(y, h); }
    else if (Math.hypot(x - h.dial.x, y - h.dial.y) < h.dial.r + 22) { S.grab = 'dial'; moveDial(x, y, h); }
    else if (Math.abs(x - h.sw.x) < h.sw.w / 2 + 16 && Math.abs(y - h.sw.y) < h.sw.h / 2 + 16) { S.grab = 'switch'; set({ cut: S.cut === 'ground' ? 'space' : 'ground' }, false); }
    else return;
    S.pid = e.pointerId;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  });
  cv.addEventListener('pointermove', e => {
    if (!S.grab || e.pointerId !== S.pid) return; const [x, y] = P(e), h = handles();
    if (S.grab === 'lever') moveLever(y, h); else if (S.grab === 'dial') moveDial(x, y, h);
  });
  const up = e => { if (S.grab && e.pointerId === S.pid) { S.grab = null; update(true); } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { if (e.pointerId === S.pid) S.grab = null; });
  function moveLever(y, h) { set({ wind: (h.lever.y1 - y) / (h.lever.y1 - h.lever.y0) }, false); }
  function moveDial(x, y, h) {
    let a = Math.atan2(x - h.dial.x, -(y - h.dial.y));                               // 12시 = 0, 시계 방향 +
    a = Math.max(A0, Math.min(A1, a));
    set({ alt: ALT_MIN + (a - A0) / (A1 - A0) * (ALT_MAX - ALT_MIN) }, false);
  }

  // ── 돌리기
  function step(dt) { S.phase += dt * (S.res && S.res.sky && S.res.sky.fold ? S.res.sky.fold : 0.5); }

  // ── 그리기
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const STARS = Array.from({ length: 120 }, () => [rnd(), rnd(), 0.5 + rnd()]);
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    if (!S.res) update(false);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    const r = S.res;
    if (r.planet === 'jupiter' || r.cut === 'space') drawSpace(r); else drawGround(r);
    drawPanel();
  }
  function frame(R, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(R.x + .5, R.y + .5, R.w - 1, R.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(label, R.x + 10, R.y + 18); }
  const colorAt = km => (km < N2_TOP ? 'pink' : km < GREEN_TOP ? 'green' : 'red');

  function drawGround(r) {
    frame(VIEW, '망원경 — 호숫가에서 본 북쪽 하늘');
    const V = VIEW, ruler = 46, sx = V.x + ruler + 8, sw = V.w - ruler - 16, top = V.y + 28, hor = V.y + V.h * 0.74, bot = V.y + V.h - 6;
    const ey = el => hor - (Math.min(el, 90) / 90) * (hor - top);                       // 올려다본 각 → 화면 높이
    g.save(); g.beginPath(); g.rect(sx, top, sw, bot - top); g.clip();
    g.fillStyle = C.sky; g.fillRect(sx, top, sw, hor - top);
    g.fillStyle = '#c9ced8'; for (const [a, b, m] of STARS) { g.globalAlpha = 0.5; g.fillRect(sx + a * sw, top + b * (hor - top), m, m); } g.globalAlpha = 1;
    const curtainY = [];
    if (r.visible) {
      const s = r.sky, c = r.curtain, a = s.bright;
      if (s.cover > 0.5) { g.fillStyle = rgba(c.main, 0.10 + 0.12 * s.cover); g.fillRect(sx, top, sw, hor - top); }   // 하늘 전체 물듦
      const base = Math.min(s.reach, 90), tall = (hor - top) * (0.18 + 0.5 * (c.top - c.base) / 230) * (0.45 + 0.55 * Math.min(1, base / 60));
      const yB = ey(base) + (s.reach > 90 ? (hor - top) * 0.25 : 0);                     // 머리 위를 넘어가면 커튼 아래 끝이 화면 아래쪽까지 늘어진다
      const n = 70, amp = 6 + 22 * r.wind, freq = 2 + 3 * r.wind;
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1), x = sx + f * sw, wob = Math.sin(f * freq * 6.28 + S.phase * 1.7) * amp + Math.sin(f * 17 + S.phase * 3.1) * amp * 0.3;
        const y0 = yB + wob, y1 = y0 - tall * (0.75 + 0.25 * Math.sin(f * 9 + S.phase));
        curtainY.push(y0);
        const gr = g.createLinearGradient(0, y0, 0, y1);
        const stops = [[0, c.base], [1, c.top]];
        for (const km of [N2_TOP, GREEN_TOP]) if (km > c.base && km < c.top) stops.push([(km - c.base) / (c.top - c.base), km]);
        stops.sort((p, q) => p[0] - q[0]);
        for (let j = 0; j < stops.length; j++) {
          const [p, km] = stops[j], k = colorAt(km + (j === stops.length - 1 ? -0.01 : 0.01));
          gr.addColorStop(Math.min(1, p), rgba(k, a * (j === stops.length - 1 ? 0.15 : 0.85)));
        }
        g.fillStyle = gr; g.fillRect(x - sw / n * 0.42, y1, sw / n * 0.84, y0 - y1);
      }
      if (s.corona) {                                                                     // 왕관: 머리 위 한 점으로 모이는 빛살
        const cx = sx + sw / 2, cy = top + 4;
        g.strokeStyle = rgba('green', 0.55); g.lineWidth = 2;
        for (let i = 0; i < 26; i++) { const ang = Math.PI * (i / 25), L = (hor - top) * (0.7 + 0.3 * Math.sin(i * 3 + S.phase * 2)); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(ang) * L * 1.4, cy + Math.sin(ang) * L); g.stroke(); }
        g.fillStyle = C.hi; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText('왕관', cx, cy + 30); g.textAlign = 'left';
      }
      // 이름표
      g.font = '700 12px system-ui'; g.fillStyle = C.ink;
      const lab = `${COLORS[c.main].name} 커튼` + (c.pinkRim ? ' · 아래 분홍 테' : '') + (c.redTop ? ' · 위 빨강' : '');
      g.fillStyle = 'rgba(11,13,18,.7)'; g.fillRect(sx + 6, hor - 26, g.measureText(lab).width + 12, 20);
      g.fillStyle = C.ink; g.fillText(lab, sx + 12, hor - 11);
    } else if (!r.magnet) {                                                               // 자석 끔: 바람이 땅까지
      g.strokeStyle = 'rgba(220,224,232,.35)'; g.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) { const x = sx + ((i * 37 + S.phase * 120) % sw), y = top + ((i * 53 + S.phase * 260) % (hor - top)); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 26); g.stroke(); }
      g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('태양 바람이 땅까지', sx + 12, top + 40);
    }
    // 땅: 나무 · 오두막 · 얼음 호수(하늘을 비춤)
    g.fillStyle = '#1b1f27'; g.fillRect(sx, hor, sw, bot - hor);
    if (r.visible) { g.fillStyle = rgba(r.curtain.main, 0.06 + 0.25 * r.sky.bright * Math.min(1, r.sky.reach / 60)); g.fillRect(sx + sw * 0.15, hor + 4, sw * 0.7, (bot - hor) * 0.6); }
    g.fillStyle = '#2a2f39';
    for (let i = 0; i < 14; i++) { const x = sx + (i + 0.5) * sw / 14 + (i % 3) * 5, th = 18 + (i * 7) % 16; if (Math.abs(x - (sx + sw * 0.5)) < sw * 0.33 && i % 4) continue; g.beginPath(); g.moveTo(x, hor - th); g.lineTo(x - 7, hor + 2); g.lineTo(x + 7, hor + 2); g.closePath(); g.fill(); }
    const cx = sx + sw * 0.8; g.fillStyle = '#353b46'; g.fillRect(cx, hor - 12, 22, 12); g.beginPath(); g.moveTo(cx - 3, hor - 12); g.lineTo(cx + 11, hor - 21); g.lineTo(cx + 25, hor - 12); g.fill();
    g.fillStyle = C.warm; g.fillRect(cx + 8, hor - 8, 5, 5);
    g.strokeStyle = C.line; g.lineWidth = 1; g.beginPath(); g.moveTo(sx, hor); g.lineTo(sx + sw, hor); g.stroke();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText('북쪽 지평선', sx + 6, hor + 14); g.fillText('머리 위 ↑', sx + 6, top + 14);
    g.restore();
    drawRuler(r, V.x + 6, top, ruler, hor - top);
    if (r.visible) drawDome(r, sx + sw - 92, top + 6);
  }
  // 높이 자: 50~300km, 색 띠, 커튼이 걸친 높이
  function drawRuler(r, x, y, w, h) {
    const k0 = 50, k1 = 300, ky = km => y + h - (Math.max(k0, Math.min(k1, km)) - k0) / (k1 - k0) * h;
    for (const [lo, hi, c] of [[k0, N2_TOP, 'pink'], [N2_TOP, GREEN_TOP, 'green'], [GREEN_TOP, k1, 'red']]) { g.fillStyle = rgba(c, 0.25); g.fillRect(x + 4, ky(hi), 10, ky(lo) - ky(hi)); }
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'left';
    for (const km of [100, 200, 300]) g.fillText(km + '', x + 16, ky(km) + 4);
    g.fillText('높이 km', x + 2, y + h + 12);
    if (r.visible && r.curtain) {
      g.strokeStyle = C.hi; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 9, ky(r.curtain.base)); g.lineTo(x + 9, ky(r.curtain.top)); g.stroke();
      g.fillStyle = C.hi; g.beginPath(); g.moveTo(x + 15, ky(S.alt)); g.lineTo(x + 22, ky(S.alt) - 4); g.lineTo(x + 22, ky(S.alt) + 4); g.fill();
    }
  }
  // 하늘 반쪽 그림: 북 지평선 → 머리 위 → 남 지평선, 오로라가 덮은 몫
  function drawDome(r, x, y) {
    const R = 36, cx = x + 44, cy = y + 46;
    g.fillStyle = 'rgba(11,13,18,.85)'; g.fillRect(x - 4, y - 4, 96, 70);
    g.strokeStyle = C.soft; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, R, Math.PI, 0); g.stroke(); g.beginPath(); g.moveTo(cx - R - 4, cy); g.lineTo(cx + R + 4, cy); g.stroke();
    const s = r.sky; g.strokeStyle = rgba(r.curtain.main, 0.95); g.lineWidth = 6;
    g.beginPath(); g.arc(cx, cy, R, Math.PI + s.north * Math.PI / 180, Math.PI + Math.max(s.north + 2, s.reach) * Math.PI / 180); g.stroke();
    g.fillStyle = C.ink; g.fillRect(cx - 1, cy - 8, 2, 8);
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText('북', cx - R - 2, cy + 12); g.fillText('남', cx + R + 2, cy + 12); g.fillText('하늘의 ' + Math.round(s.cover * 100) + '%', cx, y + 6); g.textAlign = 'left';
  }

  function drawSpace(r) {
    frame(VIEW, r.planet === 'jupiter' ? '위성 창 — 목성 북극 위에서' : '위성 창 — 북극 위에서 내려다본 지구');
    const V = VIEW, cx = V.x + V.w / 2, cy = V.y + V.h / 2 + 10, R = Math.min(V.w, V.h - 40) * 0.42;
    g.save(); g.beginPath(); g.rect(V.x, V.y, V.w, V.h); g.clip();
    g.fillStyle = '#c9ced8'; for (const [a, b, m] of STARS) { g.globalAlpha = 0.4; g.fillRect(V.x + a * V.w, V.y + b * V.h, m, m); } g.globalAlpha = 1;
    const rp = lat => R * (90 - lat) / 90;                                                 // 극에서 잰 거리로 펼침
    g.fillStyle = r.planet === 'jupiter' ? '#4a4538' : '#262b34'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
    if (r.planet === 'jupiter') { g.strokeStyle = 'rgba(200,190,160,.18)'; g.lineWidth = R * 0.08; for (const f of [0.35, 0.55, 0.75, 0.92]) { g.beginPath(); g.arc(cx, cy, R * f, 0, 7); g.stroke(); } }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); g.fill();      // 밤 쪽
    g.setLineDash([3, 4]); g.strokeStyle = C.soft; g.lineWidth = 1;
    for (const lat of [30, 60]) { g.beginPath(); g.arc(cx, cy, rp(lat), 0, 7); g.stroke(); }
    g.setLineDash([]);
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.fillText('위도 60°', cx + 4, cy - rp(60) - 3); g.fillText('30°', cx + 4, cy - rp(30) - 3);
    if (r.ring) {
      const c = r.planet === 'jupiter' ? 'blue' : 'green', ro = rp(r.ring.edge), ri = rp(r.ring.edge + r.ring.width);
      const TAU = Math.PI * 2, band = (a, b) => { g.beginPath(); g.arc(cx, cy, a, 0, TAU); g.closePath(); g.moveTo(cx + b, cy); g.arc(cx, cy, b, 0, TAU); g.closePath(); g.fill('evenodd'); };
      if (r.ring.glowTo) { g.fillStyle = rgba(c, 0.12); band(Math.max(0, ri), rp(r.ring.glowTo)); }
      g.fillStyle = rgba(c, 0.25 + 0.5 * Math.min(1, 0.3 + r.wind)); band(ro, Math.max(0, ri));
      g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText(r.planet === 'jupiter' ? '푸른 고리' : `고리 끝 ${r.ring.edge.toFixed(0)}°`, cx + ro * 0.72 + 6, cy + ro * 0.72 + 4);
    }
    if (r.planet === 'jupiter') {                                                          // 크기 견주기: 지구
      const e = R * 6371 / 71492, ex = cx + R * 0.62, ey = cy + R * 0.62; g.fillStyle = '#7f9cc4'; g.beginPath(); g.arc(ex, ey, Math.max(2, e), 0, 7); g.fill();
      g.fillStyle = C.ink; g.font = '600 11px system-ui'; g.fillText('지구 크기', ex + e + 4, ey + 4);
    } else {
      const ka = Math.PI * 0.8, kx = cx + Math.cos(ka) * rp(KOREA_LAT), ky = cy + Math.sin(ka) * rp(KOREA_LAT);
      g.fillStyle = r.korea && r.korea.sees ? C.hi : '#7f8794'; g.beginPath(); g.arc(kx, ky, 5, 0, 7); g.fill();
      g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('우리나라' + (r.korea && r.korea.sees ? ' — 보여요!' : ''), kx - 30, ky + 20);
      g.fillStyle = C.ink; g.beginPath(); g.arc(cx + Math.cos(ka + 0.35) * rp(60), cy + Math.sin(ka + 0.35) * rp(60), 3, 0, 7); g.fill();
      g.font = '600 11px system-ui'; g.fillText('호숫가', cx + Math.cos(ka + 0.35) * rp(60) + 6, cy + Math.sin(ka + 0.35) * rp(60) - 4);
    }
    if (!r.magnet) {
      g.strokeStyle = 'rgba(220,224,232,.4)'; g.lineWidth = 1.5;
      for (let i = 0; i < 18; i++) { const yy = cy - R + (i + 0.5) * (2 * R / 18), x0 = V.x + 10 + ((S.phase * 80 + i * 29) % 60); g.beginPath(); g.moveTo(x0, yy); g.lineTo(cx - Math.sqrt(Math.max(0, R * R - (yy - cy) ** 2)), yy); g.stroke(); }
      g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('자석이 없어 바람이 그대로 부딪쳐요', V.x + 12, V.y + V.h - 12);
    }
    g.restore();
  }

  function drawPanel() {
    frame(PANEL, '조종판');
    const h = handles(), L = h.lever, D = h.dial, Sw = h.sw;
    // 바람 레버: 홈 + T 손잡이 + 눈금 넷
    g.fillStyle = '#12151c'; g.beginPath(); g.roundRect(L.x - 7, L.y0 - 6, 14, L.y1 - L.y0 + 12, 7); g.fill();
    g.strokeStyle = C.soft; g.lineWidth = 1; g.stroke();
    g.font = '600 11px system-ui'; g.textAlign = 'left';
    let from = 0;
    for (const lv of LEVELS) {
      const to = Math.min(1, lv.upTo), y = L.y1 - (L.y1 - L.y0) * (from + to) / 2, on = S.res.level === lv.id;
      g.fillStyle = on ? C.hi : C.dim; g.fillText(lv.name, L.x + 27, y + 4);
      g.strokeStyle = C.soft; g.beginPath(); g.moveTo(L.x + 9, L.y1 - (L.y1 - L.y0) * to); g.lineTo(L.x + 17, L.y1 - (L.y1 - L.y0) * to); g.stroke();
      from = to;
    }
    g.fillStyle = '#6b7280'; g.fillRect(L.x - 3, L.ky, 6, L.y1 - L.ky + 4);
    g.fillStyle = S.grab === 'lever' ? C.hi : C.metal; g.beginPath(); g.roundRect(L.x - 20, L.ky - 8, 40, 16, 6); g.fill();
    g.fillStyle = C.dim; g.textAlign = 'center'; g.fillText('태양 바람', L.x, L.y1 + 22); g.textAlign = 'left';
    // 고도 다이얼: 둥근 손잡이 + 가리킴 + 눈금
    g.textAlign = 'center';
    for (let i = 0; i <= 12; i++) {
      const alt = ALT_MIN + i / 12 * (ALT_MAX - ALT_MIN), a = dialAngle(alt), c = colorAt(alt);
      g.strokeStyle = rgba(c, 0.8); g.lineWidth = 3; g.beginPath(); g.moveTo(D.x + Math.sin(a) * (D.r + 4), D.y - Math.cos(a) * (D.r + 4)); g.lineTo(D.x + Math.sin(a) * (D.r + 10), D.y - Math.cos(a) * (D.r + 10)); g.stroke();
    }
    g.fillStyle = C.dim; g.font = '600 10px system-ui';
    g.fillText('낮게', D.x + Math.sin(A0) * (D.r + 18), D.y - Math.cos(A0) * (D.r + 18) + 12);
    g.fillText('높게', D.x + Math.sin(A1) * (D.r + 18), D.y - Math.cos(A1) * (D.r + 18) + 12);
    const gr = g.createRadialGradient(D.x - D.r * 0.3, D.y - D.r * 0.3, 2, D.x, D.y, D.r);
    gr.addColorStop(0, S.grab === 'dial' ? '#e4e7ec' : '#bfc4cd'); gr.addColorStop(1, '#5b6270');
    g.fillStyle = gr; g.beginPath(); g.arc(D.x, D.y, D.r, 0, 7); g.fill();
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(D.x + Math.cos(a) * D.r * 0.82, D.y + Math.sin(a) * D.r * 0.82); g.lineTo(D.x + Math.cos(a) * D.r, D.y + Math.sin(a) * D.r); g.stroke(); }
    g.strokeStyle = '#111'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(D.x, D.y); g.lineTo(D.x + Math.sin(D.a) * D.r * 0.8, D.y - Math.cos(D.a) * D.r * 0.8); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = C.ink; g.font = '700 11px system-ui'; g.fillText('고도 ' + Math.round(S.alt) + 'km', D.x, D.y - D.r - 16);
    // 컷 스위치: 위·아래로 젖히는 손잡이
    g.fillStyle = '#12151c'; g.beginPath(); g.roundRect(Sw.x - Sw.w / 2, Sw.y - Sw.h / 2, Sw.w, Sw.h, 10); g.fill(); g.strokeStyle = C.soft; g.stroke();
    const up = S.cut === 'ground', ty = Sw.y + (up ? -1 : 1) * Sw.h * 0.28;
    g.strokeStyle = C.line; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(Sw.x, Sw.y); g.lineTo(Sw.x, ty); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = S.grab === 'switch' ? C.hi : C.metal; g.beginPath(); g.arc(Sw.x, ty, 10, 0, 7); g.fill();
    g.fillStyle = C.dim; g.font = '600 11px system-ui';
    g.fillStyle = up ? C.hi : C.dim; g.fillText('망원경', Sw.x, Sw.y - Sw.h / 2 - 6);
    g.fillStyle = !up ? C.hi : C.dim; g.fillText('위성 창', Sw.x, Sw.y + Sw.h / 2 + 15);
    g.textAlign = 'left';
  }

  addEventListener('resize', layout); layout(); update(false);
  return { S, step, draw, showMission, set, update, judge, handles, layout, res: () => S.res };
}
