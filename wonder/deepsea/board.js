/* 케이원더 · 깊은 바다 — 묶음 ㄱ 손잡이 판(회색 도형). 그림·생물·소리는 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 조종판: 깊이 기둥(다섯 층) · 내려가기 레버 · 탐조등 스위치 · 탐조등 방향 손잡이 · 사진 단추.
 * 오른쪽(아래) = 둥근 창: 물색, 햇빛 무늬, 창밖 것들, 매단 컵 · 계기 셋(깊이·누르는 힘·전지). 창을 누르면 톡톡.
 */
import { LAYERS, PLAIN, TRENCH, VENT_TOP, FAST, DIRS, THUMB, CUP_CM, createDive, step as stepDive, setLever, setLight, setDir, tapWindow, takePhoto,
  visible, waterColor, brightness, sunPattern, cupScale, pressure, thumbKg, layerAt, newDive, MISSIONS, WHY } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const D = createDive();
  const S = { mi: 0, free: false, waiting: false, D, lever: false, dial: false, lastSay: '', anim: 0, crackT: 0, fish: 0 };
  let W = 0, H = 0, dpr = 1, MAP = null, WIN = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 100);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', glow: '#bfe3ff', red: '#b4615b', warn: '#d0a070' };

  // ── 자리 셈
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    if (W >= H * 1.15) { MAP = { x: 8, y: top, w: W * 0.52 - 12, h: H - top - bottom }; WIN = { x: W * 0.52 + 4, y: top, w: W * 0.48 - 12, h: H - top - bottom }; }
    else { const h = H - top - bottom; MAP = { x: 8, y: top, w: W - 16, h: h * 0.55 }; WIN = { x: 8, y: top + h * 0.55 + 6, w: W - 16, h: h * 0.45 - 6 }; }
  }
  const COL = () => ({ x: MAP.x + 8, y: MAP.y + 28, w: Math.min(120, MAP.w * 0.27), h: MAP.h - 38 });
  /** 깊이 → 기둥 위 높이(다섯 층을 같은 높이로) */
  const depthY = d => {
    const c = COL(), band = c.h / LAYERS.length, i = LAYERS.findIndex(L => d < L.bottom), k = i < 0 ? LAYERS.length - 1 : i, L = LAYERS[k];
    return c.y + band * (k + Math.min(1, (d - L.top) / (L.bottom - L.top)));
  };
  const CTL = () => { const c = COL(), x = c.x + c.w + 10; return { x, y: MAP.y + 28, w: MAP.x + MAP.w - 8 - x, h: MAP.h - 38 }; };
  const LEV = () => { const r = CTL(); return { x: r.x + 30, y0: r.y + 26, y1: r.y + r.h - 30 }; };
  /** 스위치·방향 손잡이·사진 단추 자리 */
  const KNOBS = () => {
    const r = CTL(), x0 = r.x + 74, w = r.x + r.w - x0, rows = 3, rh = r.h / rows, cx = x0 + w / 2, sz = Math.max(18, Math.min(rh * 0.3, w * 0.24, 46));
    return { sw: { x: cx, y: r.y + rh * 0.5, s: sz }, dial: { x: cx, y: r.y + rh * 1.5, s: sz }, cam: { x: cx, y: r.y + rh * 2.5, s: sz } };
  };
  const winC = () => { const gw = Math.min(130, WIN.w * 0.32); return { x: WIN.x + (WIN.w - gw) / 2, y: WIN.y + WIN.h / 2 + 8, R: Math.max(30, Math.min((WIN.w - gw) / 2, (WIN.h - 34) / 2) - 8), gx: WIN.x + WIN.w - gw, gw }; };
  const DIR_A = { left: -0.9, ahead: 0, right: 0.9 };              // 방향 손잡이 바늘 각(위 = 0)

  // ── 의뢰
  let timer = null; const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  function showMission() {
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 내려가 보세요', '자유: 전지가 닳지 않아요');
    D.free = S.free; ui.freeMode && ui.freeMode(S.free);
  }
  /** 의뢰마다 처음부터 세도록 지운다 — 성공한 바로 그때(판정보다 먼저) 한다 */
  function prep(i) {
    if (i === 0) { D.photos = []; D.lastPhoto = null; }
    if (i === 1) { D.found.vent = false; D.ventHinted = false; }
  }
  function startMission(i) {
    clearTimeout(timer); S.waiting = false;
    S.mi = i; if (S.mi >= MISSIONS.length) S.free = true;
    prep(S.mi);
    if (S.mi === 2) { newDive(D); say('의뢰 3 — 물 위에서 새 전지·새 컵으로 출발해요. 레버를 내려요.'); }
    showMission();
  }
  function succeed(i, sub) {
    S.mi = i + 1; if (S.mi >= MISSIONS.length) S.free = true;
    S.waiting = S.mi < MISSIONS.length;                       // 다음 의뢰가 뜨기 전(8초)에는 판정하지 않는다
    prep(S.mi);
    ui.note('성공! ⭐', sub);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    later(() => startMission(S.mi), 8000);
  }
  function fail(sub) { const m = MISSIONS[S.mi]; ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, sub + ' · 귀띔: ' + m.hint); }
  function judge(ev) {
    if (S.mi >= MISSIONS.length || S.waiting) return;
    const mi = S.mi, m = MISSIONS[mi], ks = ev.map(e => e.k);
    if (mi === 0 && ks.includes('photo')) m.ok(D) ? succeed(0, '빛나는 것 셋! 불을 꺼야 보였어요.') : fail(m.tell(D));
    else if (mi === 1) {
      if (m.ok(D)) succeed(1, '뜨거운 물 굴뚝 마을 — 햇빛 없이도 생물이 모여 살아요.');
      else if (ks.some(k => k === 'land' || k === 'ventnear' || k === 'edge')) fail(m.tell(D));
    }
    else if (mi === 2 && ks.includes('surface')) m.ok(D) ? succeed(2, `컵이 처음의 ${D.lastDive.cup.toFixed(2)}배 — ${(D.lastDive.cup * CUP_CM).toFixed(1)}cm, 엄지만 해졌어요.`) : fail(m.tell(D));
  }
  /** 의뢰 2: 깊은 바닥 가까이서 탐조등을 만지면 무엇이 걸렸는지 바로 알려 준다 */
  function poke() { if (!S.waiting && S.mi === 1 && D.depth >= 4000 && !MISSIONS[1].ok(D)) fail(MISSIONS[1].tell(D)); }
  function say(t) { S.lastSay = t; ui.say(t); }
  function handle(ev) {
    if (!ev || !ev.length) return ev;
    say([...new Set(ev.map(e => e.say))].join(' '));
    if (ev.some(e => e.k === 'alarm')) S.crackT = 3;
    judge(ev);
    return ev;
  }

  // ── 손잡이(디버그 창과 손이 같은 길을 쓴다)
  const act = {
    lever(v, pressed) { const ok = setLever(D, v); if (!ok && pressed && D.lockT > 0) say(S.lastSay.includes('잠겼어요') ? S.lastSay : S.lastSay + ' 경보 뒤 잠깐 레버가 잠겼어요.'); return ok; },
    light(on) {
      if (D.emergency) { say('비상으로 떠오르는 중에는 탐조등을 못 켜요.'); return []; }
      const ev = setLight(D, on ?? !D.light); if (!ev.length) say(D.light ? '탐조등을 켰어요.' : '탐조등을 껐어요. 캄캄한 데서 기다려 봐요.'); handle(ev); poke(); return ev;
    },
    dir(d) { const ev = setDir(D, d); if (!ev.length) say('탐조등을 ' + DIRS[d] + '으로 돌렸어요.'); handle(ev); poke(); return ev; },
    tap() { return handle(tapWindow(D)); },
    photo() { return handle(takePhoto(D)); },
  };
  const cap = e => { try { cv.setPointerCapture(e.pointerId); } catch (_) { /* 손가락이 이미 떨어짐 */ } };
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const leverFromY = y => { const L = LEV(), mid = (L.y0 + L.y1) / 2; let v = (y - mid) / ((L.y1 - L.y0) / 2); v = Math.max(-1, Math.min(1, v)); if (Math.abs(v) < 0.06) v = 0; return v; };
  const dirFromXY = (x, y) => { const k = KNOBS().dial, a = Math.atan2(x - k.x, -(y - k.y)); return a < -0.45 ? 'left' : a > 0.45 ? 'right' : 'ahead'; };
  cv.addEventListener('pointerdown', e => {
    const [x, y] = P(e), L = LEV(), K = KNOBS(), c = winC();
    if (Math.abs(x - L.x) < 30 && y > L.y0 - 20 && y < L.y1 + 20) { S.lever = true; act.lever(leverFromY(y), true); cap(e); return; }
    if (Math.hypot(x - K.sw.x, y - K.sw.y) < K.sw.s * 1.3) { act.light(); return; }
    if (Math.hypot(x - K.dial.x, y - K.dial.y) < K.dial.s * 1.6) { S.dial = true; act.dir(dirFromXY(x, y)); cap(e); return; }
    if (Math.hypot(x - K.cam.x, y - K.cam.y) < K.cam.s * 1.2) { S.camDown = 0.25; act.photo(); return; }
    if (Math.hypot(x - c.x, y - c.y) < c.R) { S.tapT = 0.3; act.tap(); }
  });
  cv.addEventListener('pointermove', e => {
    const [x, y] = P(e);
    if (S.lever) act.lever(leverFromY(y));
    else if (S.dial) { const d = dirFromXY(x, y); if (d !== D.dir) act.dir(d); }
  });
  const up = () => { S.lever = false; S.dial = false; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  // ── 돌리기
  function step(dt) {
    S.anim += dt; S.fish += dt;
    for (const k of ['crackT', 'camDown', 'tapT']) if (S[k] > 0) S[k] = Math.max(0, S[k] - dt);
    return handle(stepDive(D, dt));
  }

  // ── 그리기(회색 도형)
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const SNOW = Array.from({ length: 90 }, () => ({ x: rnd() * 2 - 1, y: rnd(), v: 0.03 + rnd() * 0.06, s: 0.6 + rnd() * 1.4 }));
  const SPOTS = Array.from({ length: 40 }, () => ({ x: rnd() * 1.8 - 0.9, y: rnd() * 1.8 - 0.9, p: rnd() * 6.28, s: 1 + rnd() * 2 }));
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawPanel(); drawWindow();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.fillText(label, r.x + 10, r.y + 18); }
  const text = (t, x, y, o = {}) => { g.fillStyle = o.c || C.dim; g.font = `${o.w || 600} ${o.s || 11}px system-ui`; g.textAlign = o.a || 'left'; g.fillText(t, x, y); g.textAlign = 'left'; };
  function drawPanel() {
    frame(MAP, '조종판');
    // 깊이 기둥
    const c = COL(), band = c.h / LAYERS.length;
    LAYERS.forEach((L, i) => {
      const v = Math.round(150 * Math.pow(1 - i / LAYERS.length, 1.6)) + 14; g.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
      g.fillRect(c.x, c.y + band * i, c.w, band);
    });
    // 바닥: 깊은 바닥(왼쪽) · 골짜기(오른쪽)
    const yp = depthY(PLAIN), xt = c.x + c.w * 0.62;
    g.fillStyle = '#4a4f5a'; g.fillRect(c.x, yp, xt - c.x, c.y + c.h - yp);
    g.fillStyle = '#2b2f37'; g.fillRect(xt + 4, depthY(TRENCH), c.x + c.w - xt - 4, c.y + c.h - depthY(TRENCH));
    g.fillStyle = '#6a707c'; g.fillRect(c.x + c.w * 0.38, depthY(VENT_TOP), 5, yp - depthY(VENT_TOP));                   // 굴뚝 자리
    LAYERS.forEach((L, i) => {
      text(L.name, c.x + c.w - 4, c.y + band * i + 14, { c: i < 2 ? '#1a1d24' : C.ink, s: 10, w: 700, a: 'right' });
      text(L.bottom.toLocaleString('en-US') + 'm', c.x + c.w - 4, c.y + band * (i + 1) - 4, { c: i < 2 ? '#2a2e38' : C.dim, s: 9, a: 'right' });
    });
    // 잠수정
    const sx = D.stage === 'trench' ? xt + (c.x + c.w - xt) / 2 + 2 : c.x + c.w * 0.22, sy = Math.max(c.y + 7, Math.min(depthY(D.depth), D.stage === 'plain' ? yp - 6 : c.y + c.h - 6));
    g.fillStyle = C.hi; g.beginPath(); g.ellipse(sx, sy, 9, 6, 0, 0, 7); g.fill();
    if (D.light) { g.fillStyle = 'rgba(230,234,240,.25)'; g.beginPath(); const a = DIR_A[D.dir]; g.moveTo(sx, sy); g.lineTo(sx + 30 * Math.sin(a + 0.35) + 14, sy + 30 * Math.cos(a + .35)); g.lineTo(sx + 30 * Math.sin(a - 0.35) + 14, sy + 30 * Math.cos(a - .35)); g.fill(); }
    g.strokeStyle = C.soft; g.lineWidth = 1; g.strokeRect(c.x + .5, c.y + .5, c.w - 1, c.h - 1);
    // 레버
    const L = LEV(), mid = (L.y0 + L.y1) / 2, fastY = mid + (L.y1 - mid) * FAST;
    g.fillStyle = '#151820'; g.fillRect(L.x - 9, L.y0 - 6, 18, L.y1 - L.y0 + 12);
    g.fillStyle = 'rgba(208,160,112,.22)'; g.fillRect(L.x - 9, fastY, 18, L.y1 + 6 - fastY);
    g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(L.x - 9 + .5, L.y0 - 6 + .5, 17, L.y1 - L.y0 + 11);
    g.strokeStyle = C.dim; g.beginPath(); g.moveTo(L.x - 15, mid); g.lineTo(L.x + 15, mid); g.stroke();
    const ky = mid + D.lever * (L.y1 - L.y0) / 2;
    g.strokeStyle = '#9aa1ae'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(L.x, mid); g.lineTo(L.x, ky); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = S.lever ? C.hi : D.lockT > 0 || D.emergency ? '#6b5a4a' : '#aeb4bf'; g.beginPath(); g.roundRect(L.x - 18, ky - 9, 36, 18, 7); g.fill();
    text('위로', L.x, L.y0 - 12, { a: 'center', w: 700 }); text('멈춤', L.x + 20, mid + 4, { s: 10 });
    text('내려가기', L.x, L.y1 + 22, { a: 'center', w: 700 }); text('너무 빠름', L.x + 13, L.y1 + 2, { s: 9, c: C.warn });
    // 탐조등 스위치 · 방향 · 사진 단추
    const K = KNOBS(), sw = K.sw, s = sw.s;
    g.fillStyle = '#20242d'; g.strokeStyle = C.line; g.lineWidth = 1.5; g.beginPath(); g.roundRect(sw.x - s * 0.55, sw.y - s * 0.8, s * 1.1, s * 1.6, 6); g.fill(); g.stroke();
    g.strokeStyle = D.light ? C.hi : '#7d8493'; g.lineWidth = Math.max(4, s * 0.22); g.lineCap = 'round';
    g.beginPath(); g.moveTo(sw.x, sw.y); g.lineTo(sw.x, sw.y + (D.light ? -1 : 1) * s * 0.65); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = D.light ? C.hi : '#3a404c'; g.beginPath(); g.arc(sw.x + s * 0.85, sw.y - s * 0.55, 4, 0, 7); g.fill();
    text('탐조등 ' + (D.light ? '켜짐' : '꺼짐'), sw.x, sw.y + s * 0.8 + 14, { a: 'center', w: 700, c: D.light ? C.ink : C.dim });
    const dl = K.dial; g.fillStyle = '#20242d'; g.strokeStyle = C.line; g.beginPath(); g.arc(dl.x, dl.y, dl.s * 0.75, 0, 7); g.fill(); g.stroke();
    for (const [k, a] of Object.entries(DIR_A)) {
      const on = D.dir === k; text(DIRS[k], dl.x + Math.sin(a) * (dl.s * 0.75 + 22), dl.y - Math.cos(a) * (dl.s * 0.75 + 10) + 4, { a: 'center', s: 10, w: on ? 800 : 600, c: on ? C.hi : C.dim });
    }
    const a = DIR_A[D.dir]; g.strokeStyle = S.dial ? C.hi : '#aeb4bf'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(dl.x, dl.y); g.lineTo(dl.x + Math.sin(a) * dl.s * 0.7, dl.y - Math.cos(a) * dl.s * 0.7); g.stroke(); g.lineCap = 'butt';
    text('탐조등 방향', dl.x, dl.y + dl.s * 0.75 + 15, { a: 'center', w: 700 });
    const cm = K.cam, pr = S.camDown > 0 ? 0.88 : 1;
    g.fillStyle = '#20242d'; g.beginPath(); g.arc(cm.x, cm.y, cm.s * 0.78, 0, 7); g.fill();
    g.fillStyle = S.camDown > 0 ? C.hi : '#9aa1ae'; g.beginPath(); g.arc(cm.x, cm.y, cm.s * 0.55 * pr, 0, 7); g.fill();
    text('사진', cm.x, cm.y + cm.s * 0.78 + 15, { a: 'center', w: 700 });
    if (D.photos.length) text(`찍은 사진 ${D.photos.length}`, cm.x, cm.y + cm.s * 0.78 + 28, { a: 'center', s: 10 });
  }
  function drawWindow() {
    frame(WIN, '잠수정 창 — 창을 누르면 톡톡');
    const c = winC(), d = D.depth, vis = visible(D), ids = new Set(vis.map(v => v.id)), t = S.anim;
    g.save(); g.beginPath(); g.arc(c.x, c.y, c.R, 0, 7); g.clip();
    const b = brightness(d), v = Math.round(8 + 172 * b); g.fillStyle = `rgb(${v},${v + 3},${Math.min(255, v + 10)})`; g.fillRect(c.x - c.R, c.y - c.R, c.R * 2, c.R * 2);
    // 햇빛 무늬
    const sp = sunPattern(d);
    if (sp > 0) { g.strokeStyle = `rgba(255,255,255,${0.5 * sp})`; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); for (let x = -1; x <= 1.01; x += 0.1) { const yy = c.y - c.R * 0.8 + i * 7 + Math.sin(x * 6 + t * 2 + i) * 3; x === -1 ? g.moveTo(c.x + x * c.R, yy) : g.lineTo(c.x + x * c.R, yy); } g.stroke(); } }
    // 탐조등 빛 기둥 + 바다 눈
    if (D.light) {
      const a = DIR_A[D.dir], ox = c.x, oy = c.y + c.R, tx = c.x + Math.sin(a) * c.R * 1.1, ty = c.y - c.R * 0.9;
      g.fillStyle = 'rgba(220,226,236,.16)'; g.beginPath(); g.moveTo(ox - 10, oy); g.lineTo(tx - c.R * 0.5, ty); g.lineTo(tx + c.R * 0.5, ty); g.lineTo(ox + 10, oy); g.fill();
      if (ids.has('snow')) { g.fillStyle = '#e6e9ef'; for (const q of SNOW) { const yy = (q.y + t * q.v) % 1, f = 1 - yy, cx2 = ox + (tx - ox) * f, w = 10 + c.R * 0.5 * f; g.beginPath(); g.arc(cx2 + q.x * w, oy - (oy - ty) * f, q.s, 0, 7); g.fill(); } }
    }
    // 빨간 물고기
    if (ids.has('redfish_red') || ids.has('redfish_black')) {
      const fx = c.x + (((S.fish * 0.12) % 1) * 1.5 - 0.75) * c.R, fy = c.y - c.R * 0.1, red = ids.has('redfish_red');
      g.fillStyle = red ? C.red : '#0d0e11'; g.strokeStyle = red ? '#d9a09a' : '#3a404c'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(fx, fy, 22, 10, 0, 0, 7); g.moveTo(fx - 20, fy); g.lineTo(fx - 34, fy - 9); g.lineTo(fx - 34, fy + 9); g.closePath(); g.fill(); g.stroke();
      text(red ? '빨간 물고기' : '검게 보이는 물고기', fx, fy + 24, { a: 'center', s: 10, c: C.ink });
    }
    // 빛나는 것들
    const dot = (x, y, r, al = 1) => { g.fillStyle = `rgba(191,227,255,${al})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    if (ids.has('jelly')) for (let i = 0; i < 3; i++) { const x = c.x + (i - 1) * c.R * 0.5, y = c.y - c.R * 0.35 + Math.sin(t + i) * 6; g.strokeStyle = 'rgba(191,227,255,.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 9, Math.PI, 0); g.stroke(); for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * 5, y); g.lineTo(x + k * 5 + Math.sin(t * 2 + k) * 2, y + 14); g.stroke(); } dot(x, y - 3, 2); }
    if (ids.has('lantern')) for (let i = 0; i < 14; i++) { const x = c.x + ((i * 37 + t * 20) % (c.R * 1.6)) - c.R * 0.8, y = c.y + c.R * 0.25 + Math.sin(i * 1.7 + t) * 10; dot(x, y, 1.8, 0.6 + 0.4 * Math.sin(t * 3 + i)); }
    if (ids.has('angler')) { const k = Math.min(1, D.stillT / 9), x = c.x + Math.sin(t * 0.7) * 10, y = c.y + Math.cos(t) * 5; dot(x, y, 3 + 6 * k); g.strokeStyle = 'rgba(191,227,255,.35)'; g.beginPath(); g.arc(x, y, 10 + 14 * k, 0, 7); g.stroke(); }
    if (ids.has('teeth')) {
      const x = c.x, y = c.y + 6, w = c.R * 0.6; g.fillStyle = '#2c3038'; g.beginPath(); g.ellipse(x, y, w, w * 0.55, 0, 0, 7); g.fill();
      g.fillStyle = '#0a0b0e'; g.beginPath(); g.ellipse(x + w * 0.2, y + 8, w * 0.55, w * 0.25, 0, 0, 7); g.fill();
      g.fillStyle = '#e6e9ef'; for (let i = 0; i < 9; i++) { const tx = x + w * 0.2 - w * 0.45 + i * w * 0.11; g.beginPath(); g.moveTo(tx - 4, y + 2); g.lineTo(tx, y + 14); g.lineTo(tx + 4, y + 2); g.fill(); }
      text('이빨!', x, y - w * 0.6, { a: 'center', s: 14, w: 800, c: C.hi });
    }
    if (ids.has('flash')) { const al = Math.min(1, D.flashT / 0.8); for (const q of SPOTS) dot(c.x + q.x * c.R, c.y + q.y * c.R, q.s, al * (0.5 + 0.5 * Math.sin(q.p + t * 9))); }
    if (ids.has('whale') || ids.has('trenchfloor')) { g.fillStyle = '#3a3e47'; g.fillRect(c.x - c.R, c.y + c.R * 0.72, c.R * 2, c.R); }
    // 굴뚝 마을
    if (ids.has('vent')) {
      const x = c.x + c.R * 0.35, y = c.y + c.R * 0.9; g.fillStyle = '#4a4f5a'; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x - 7, y - 50); g.lineTo(x + 7, y - 50); g.lineTo(x + 14, y); g.fill();
      g.fillStyle = 'rgba(10,10,12,.85)'; for (let i = 0; i < 6; i++) { const yy = y - 55 - ((t * 25 + i * 18) % 100); g.beginPath(); g.arc(x + Math.sin(i + t) * 6, yy, 8 + (y - 55 - yy) * 0.12, 0, 7); g.fill(); }
      g.strokeStyle = C.red; g.lineWidth = 3; for (let i = 0; i < 7; i++) { const bx = x + 15 + i * 5; g.beginPath(); g.moveTo(bx, y); g.lineTo(bx + Math.sin(t + i) * 3, y - 22 - (i % 3) * 6); g.stroke(); }
      g.fillStyle = '#e6e9ef'; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(x - 19 - i * 8, y - 3 - (i % 2) * 4, 3.5, 2.2, 0, 0, 7); g.fill(); }
      if (c.R >= 130) text('검은 연기 굴뚝 · 하얀 게 · 붉은 관 벌레', c.x, c.y - c.R * 0.75, { a: 'center', s: 10, c: C.ink });
      else { text('검은 연기 굴뚝', c.x, c.y - c.R * 0.72, { a: 'center', s: 10, c: C.ink }); text('하얀 게 · 붉은 관 벌레', c.x, c.y - c.R * 0.72 + 13, { a: 'center', s: 10, c: C.ink }); }
    }
    // 바닥
    if (ids.has('whale') || ids.has('trenchfloor')) {
      if (ids.has('whale')) { g.strokeStyle = '#cfd3db'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(c.x - c.R * 0.85, c.y + c.R * 0.66); g.lineTo(c.x - c.R * 0.2, c.y + c.R * 0.63); g.stroke(); for (let i = 0; i < 8; i++) { const x = c.x - c.R * 0.78 + i * c.R * 0.075; g.beginPath(); g.arc(x, c.y + c.R * 0.66, 12 - Math.abs(i - 4), Math.PI * 1.05, Math.PI * 1.95); g.stroke(); } text('고래 뼈대', c.x - c.R * 0.5, c.y + c.R * 0.45, { a: 'center', s: 10, c: C.ink }); }
      else text('바다 골짜기 바닥', c.x, c.y + c.R * 0.6, { a: 'center', s: 10, c: C.ink });
      if (D.dustT > 0) { g.fillStyle = `rgba(160,164,172,${0.35 * D.dustT / 4})`; g.beginPath(); g.ellipse(c.x, c.y + c.R * 0.72, c.R * 0.9, c.R * 0.25 * (1.2 - D.dustT / 4), 0, 0, 7); g.fill(); }
    }
    if (S.tapT > 0) { g.strokeStyle = `rgba(242,244,248,${S.tapT})`; g.lineWidth = 2; g.beginPath(); g.arc(c.x, c.y, c.R * (1 - S.tapT), 0, 7); g.stroke(); }
    // 금 간 유리(경보)
    if (S.crackT > 0) { g.strokeStyle = `rgba(242,244,248,${Math.min(1, S.crackT)})`; g.lineWidth = 1.5; const o = [c.x + c.R * 0.3, c.y - c.R * 0.3]; for (let i = 0; i < 6; i++) { const a2 = i * 1.05 + 0.3; g.beginPath(); g.moveTo(...o); g.lineTo(o[0] + Math.cos(a2) * c.R * 0.35, o[1] + Math.sin(a2) * c.R * 0.35); g.lineTo(o[0] + Math.cos(a2 + .2) * c.R * 0.6, o[1] + Math.sin(a2 + .2) * c.R * 0.6); g.stroke(); } }
    g.restore();
    g.strokeStyle = S.crackT > 0 ? C.warn : C.line; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, c.R, 0, 7); g.stroke();
    // 매단 컵(창 왼쪽 위 바깥)
    const cup = cupScale(D.maxDepth), ch = Math.max(8, Math.min(46, c.R * 0.42)) * cup, cx = c.x - c.R * 0.72, cy = c.y - c.R * 0.72;
    g.strokeStyle = C.dim; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy - 18); g.lineTo(cx, cy - ch / 2); g.stroke();
    g.fillStyle = '#d4d8df'; g.beginPath(); g.moveTo(cx - ch * 0.4, cy - ch / 2); g.lineTo(cx + ch * 0.4, cy - ch / 2); g.lineTo(cx + ch * 0.28, cy + ch / 2); g.lineTo(cx - ch * 0.28, cy + ch / 2); g.closePath(); g.fill();
    const cupT = `컵 ${cup.toFixed(2)}배` + (cup <= THUMB ? ' · 엄지만!' : ''); g.font = '700 10px system-ui'; const tw = g.measureText(cupT).width;
    g.fillStyle = 'rgba(11,13,18,.8)'; g.beginPath(); g.roundRect(cx - tw / 2 - 4, cy + ch / 2 + 3, tw + 8, 14, 4); g.fill();
    text(cupT, cx, cy + ch / 2 + 13, { a: 'center', s: 10, c: C.ink, w: 700 });
    if (D.emergency) text('비상으로 떠오르는 중', c.x, c.y, { a: 'center', s: 16, w: 800, c: C.warn });
    // 계기 셋
    const gx = c.gx + c.gw / 2, gh = (WIN.h - 34) / 3, r = Math.max(12, Math.min(26, gh * 0.28, c.gw * 0.3));
    const dial = (i, f, big, small, warn) => {
      const y = WIN.y + 30 + gh * i + r + 2; g.fillStyle = '#151820'; g.strokeStyle = warn ? C.warn : C.line; g.lineWidth = 1.5; g.beginPath(); g.arc(gx, y, r, Math.PI * 0.75, Math.PI * 2.25); g.fill(); g.stroke();
      const a = Math.PI * 0.75 + Math.PI * 1.5 * Math.max(0, Math.min(1, f)); g.strokeStyle = C.hi; g.lineWidth = 2.5; g.beginPath(); g.moveTo(gx, y); g.lineTo(gx + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); g.stroke();
      text(big, gx, y + r + 12, { a: 'center', s: 12, w: 800, c: warn ? C.warn : C.ink }); text(small, gx, y + r + 25, { a: 'center', s: 10 });
    };
    dial(0, d / 11000, Math.round(d).toLocaleString('en-US') + 'm', '깊이 · ' + layerAt(d).name);
    dial(1, pressure(d) / 1100, Math.round(pressure(d)).toLocaleString('en-US') + '기압', `엄지손톱에 ${thumbKg(d).toLocaleString('en-US')}kg`);
    dial(2, D.battery / 100, '전지 ' + Math.ceil(D.battery) + '%', D.free ? '자유: 안 닳아요' : D.light ? '탐조등이 먹어요' : '물색 ' + waterColor(d).name, D.battery <= 20);
  }

  addEventListener('resize', layout); layout();
  return {
    S, D, step, draw, layout, showMission, startMission, act,
    /** 손잡이 자리(화면 좌표) — 시험이 진짜 손가락처럼 누를 수 있게 */
    geom() { const L = LEV(), K = KNOBS(), c = winC(), mid = (L.y0 + L.y1) / 2; return { lever: { x: L.x, y0: L.y0, y1: L.y1, mid }, sw: K.sw, dial: K.dial, cam: K.cam, win: c }; },
    newDive() { newDive(D); },
  };
}
