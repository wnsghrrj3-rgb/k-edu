/* 케이원더 · 혈관 속 — 묶음 ㄱ 손잡이 판(회색 도형). 그림·소리는 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 몸 지도(심장 두 방 · 허파 고리 · 몸 고리와 갈림길 스위치) + 조종판(흐름 레버 · 쉬기/달리기 단추 · 탐조등 스위치).
 * 오른쪽(아래) = 잠수정 창: 굴 벽(맥박마다 불룩), 함께 떠가는 적혈구(산소에 따라 선홍 ↔ 검붉음), 문·공기주머니·상처·세균 · 계기(맥박·전지·피 색).
 */
import { ORDER, SEG, BRANCHES, SAYS, createRide, step as stepRide, setLever, setFork, setRun, setLight, markHere, answerLap, resetLapMission, view, segName, MISSIONS, WHY } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  let R = createRide({ parked: true });                     // 처음 손대기 전까지 심장 안에서 기다린다
  const S = { mi: 0, free: false, waiting: false, lever: null, markT: 0, anim: 0, travel: 0, rel: 0, hit: 0, lastSay: '' };
  let W = 0, H = 0, dpr = 1, MAP = null, WIN = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 100);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', warn: '#d0a070', red: '#c46a63', dark: '#6a3434' };

  // ── 자리 셈
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    if (W >= H * 1.15) { MAP = { x: 8, y: top, w: W * 0.54 - 12, h: H - top - bottom }; WIN = { x: W * 0.54 + 4, y: top, w: W * 0.46 - 12, h: H - top - bottom }; }
    else { const h = H - top - bottom; MAP = { x: 8, y: top, w: W - 16, h: h * 0.55 }; WIN = { x: 8, y: top + h * 0.55 + 6, w: W - 16, h: h * 0.45 - 6 }; }
  }
  const CTLW = () => Math.max(96, Math.min(150, MAP.w * 0.3));
  const BODY = () => ({ x: MAP.x + 8, y: MAP.y + 26, w: MAP.w - CTLW() - 16, h: MAP.h - 34 });
  const CTL = () => { const b = BODY(); return { x: b.x + b.w + 4, y: MAP.y + 26, w: CTLW(), h: MAP.h - 34 }; };
  // 몸 지도: 길마다 꺾은선(0~1 자리). 갈림길 셋(머리·손·발)
  const P0 = { heartR: [0.36, 0.42], heartL: [0.64, 0.42], F: [0.86, 0.6], J: [0.14, 0.6] };
  const ROWS = { 머리: 0.68, 손: 0.8, 발: 0.92 };
  function line(id, b) {
    const br = b || R.branch || R.fork, y = ROWS[br];
    switch (id) {
      case 'aorta': return [[0.64, 0.5], [0.8, 0.52], P0.F];
      case 'artery': return [P0.F, [0.8, y]];
      case 'cap': return [[0.8, y], [0.22, y]];
      case 'vein': return [[0.22, y], P0.J, [0.36, 0.5]];
      case 'pa': return [[0.36, 0.34], [0.26, 0.2], [0.38, 0.08]];
      case 'lungcap': return [[0.38, 0.08], [0.62, 0.08]];
      case 'pv': return [[0.62, 0.08], [0.74, 0.2], [0.64, 0.34]];
      default: return [P0[id], P0[id]];
    }
  }
  const toS = ([x, y]) => { const b = BODY(); return [b.x + x * b.w, b.y + y * b.h]; };
  function along(pts, f) {
    const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let want = f * tot; for (let i = 0; i < L.length; i++) { if (want <= L[i] || i === L.length - 1) { const k = L[i] ? Math.min(1, want / L[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } want -= L[i]; }
    return pts[pts.length - 1];
  }
  const forkPill = b => { const [x, y] = toS([0.8, ROWS[b]]); return { x: x + 26, y, r: 18 }; };
  const LEV = () => { const c = CTL(); return { x: c.x + 26, y0: c.y + 24, y1: c.y + c.h - 30 }; };
  const KN = () => {
    const c = CTL(), x = c.x + 26 + 36, w = c.x + c.w - x, cx = x + w / 2, s = Math.max(14, Math.min(28, w * 0.34, c.h * 0.075));
    return { rest: { x: cx, y: c.y + c.h * 0.1, s }, run: { x: cx, y: c.y + c.h * 0.33, s }, sw: { x: cx, y: c.y + c.h * 0.57, s }, mark: { x: cx, y: c.y + c.h * 0.82, s } };
  };
  const winC = () => { const gw = Math.min(130, WIN.w * 0.32); return { x: WIN.x + (WIN.w - gw) / 2, y: WIN.y + WIN.h / 2 + 10, R: Math.max(30, Math.min((WIN.w - gw) / 2, (WIN.h - 40) / 2) - 8), gx: WIN.x + WIN.w - gw, gw }; };

  // ── 의뢰
  let timer = null;
  function showMission() {
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 돌아다녀 보세요', '자유: 전지가 닳지 않아요. 발 쪽 길에는 상처와 세균이 있어요');
    R.free = S.free;
  }
  /** 의뢰마다 처음부터 세도록 지운다 — 성공한 바로 그때(판정보다 먼저) 한다 */
  function prep(i) {
    if (i === 1) R.marked = null;
    if (i === 2) resetLapMission(R);
    ui.askHide && ui.askHide();
  }
  function startMission(i) {
    clearTimeout(timer); S.waiting = false; S.mi = i; if (S.mi >= MISSIONS.length) S.free = true;
    prep(S.mi);
    showMission();
  }
  function succeed(i, sub) {
    S.mi = i + 1; if (S.mi >= MISSIONS.length) S.free = true;
    S.waiting = S.mi < MISSIONS.length;                       // 다음 의뢰가 뜨기 전(8초)에는 판정하지 않는다
    prep(S.mi);
    ui.note('성공! ⭐', sub);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    clearTimeout(timer); timer = setTimeout(() => startMission(S.mi), 8000);
  }
  function fail(sub) { const m = MISSIONS[S.mi]; ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, sub + ' · 귀띔: ' + m.hint); }
  function judge(ev) {
    if (S.mi >= MISSIONS.length || S.waiting) return;
    const mi = S.mi, m = MISSIONS[mi], ks = ev.map(e => e.k);
    if (mi === 0 && ks.includes('cap')) m.ok(R) ? succeed(0, '손끝 실핏줄에 왔어요. 심장이 여기까지 밀어 보냈어요.') : fail(m.tell(R));
    else if (mi === 1) { if (ks.includes('mark')) m.ok(R) ? succeed(1, '허파! 숨 쉬며 들어온 산소를 다시 실었어요.') : fail(m.tell(R)); else if (ks.includes('capdark') || ks.includes('heartR')) fail(m.tell(R)); }
    else if (mi === 2) {
      if (ks.includes('lap')) { fail(m.tell(R)); ui.ask && ui.ask('심장을 몇 번 지났나요?', [1, 2, 3], n => act.answer(n)); }
      else if (ks.includes('answer')) m.ok(R) ? succeed(2, `한 바퀴 ${Math.round(R.lastLap.time)}초 — ${SAYS.lapwhy}`) : fail(m.tell(R));
      else if (ks.includes('heartR') && R.lap.started) fail(m.tell(R));
    }
  }
  function say(t) { S.lastSay = t; ui.say(t); }
  function handle(ev) { if (ev && ev.length) { say([...new Set(ev.map(e => e.say))].join(' ')); judge(ev); } return ev; }

  // ── 손잡이
  const touch = () => { if (R.parked) R.parked = false; };
  const act = {
    mark() { touch(); S.markT = 0.25; return handle(markHere(R)); },
    answer(n) { return handle(answerLap(R, n)); },
    lever(v) { touch(); const ok = setLever(R, v); if (!ok) say('전지가 조금 찰 때까지 흐름에 맡겨요.'); return ok; },
    fork(b) { touch(); setFork(R, b); say(`갈림길 스위치를 ${b} 쪽으로 놓았어요.` + (R.branch && R.branch !== b ? ' (지금 길을 다 지나면 다음 바퀴부터)' : '')); return []; },
    run(on) { touch(); return handle(setRun(R, on)); },
    light(on) { touch(); const ev = setLight(R, on ?? !R.light); if (!ev.length) say(R.light ? '탐조등을 켰어요.' : '탐조등을 껐어요.'); return handle(ev); },
  };
  const cap = e => { try { cv.setPointerCapture(e.pointerId); } catch (_) { /* 손가락이 이미 떨어짐 */ } };
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const leverFromY = y => { const L = LEV(), mid = (L.y0 + L.y1) / 2; let v = -(y - mid) / ((L.y1 - L.y0) / 2); v = Math.max(-1, Math.min(1, v)); if (Math.abs(v) < 0.08) v = 0; return v; };
  cv.addEventListener('pointerdown', e => {
    const [x, y] = P(e), L = LEV(), K = KN();
    if (S.lever != null) return;                             // 레버를 끄는 중이면 다른 손가락은 무시
    if (Math.abs(x - L.x) < 28 && y > L.y0 - 20 && y < L.y1 + 20) { S.lever = e.pointerId; act.lever(leverFromY(y)); cap(e); return; }
    let near = null, nd = Infinity;                          // 가장 가까운 갈래 칩
    for (const b of Object.keys(BRANCHES)) { const p = forkPill(b), d = Math.hypot(x - p.x, y - p.y); if (d < p.r + 6 && d < nd) { near = b; nd = d; } }
    if (near) { act.fork(near); return; }
    if (Math.hypot(x - K.mark.x, y - K.mark.y) < K.mark.s * 1.2) { act.mark(); return; }
    if (Math.hypot(x - K.rest.x, y - K.rest.y) < K.rest.s * 1.2) { act.run(false); return; }
    if (Math.hypot(x - K.run.x, y - K.run.y) < K.run.s * 1.2) { act.run(true); return; }
    if (Math.hypot(x - K.sw.x, y - K.sw.y) < K.sw.s * 1.3) { act.light(); return; }
  });
  cv.addEventListener('pointermove', e => { if (S.lever != null && e.pointerId === S.lever) act.lever(leverFromY(P(e)[1])); });
  const up = e => { if (e.pointerId === S.lever) S.lever = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  // ── 돌리기
  function step(dt) {
    S.anim += dt; if (S.markT > 0) S.markT = Math.max(0, S.markT - dt);
    const ev = stepRide(R, dt);
    S.travel += R.speed * dt; S.rel += (R.flow - R.speed) * dt;
    if (R.lever < -0.3) S.hit = Math.min(1, S.hit + dt * 3); else S.hit = Math.max(0, S.hit - dt * 2);
    return handle(ev);
  }

  // ── 그리기(회색 도형)
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const CELLS = Array.from({ length: 60 }, () => ({ a: rnd() * 6.283, r: Math.sqrt(rnd()), z: rnd(), spin: rnd() * 6.283 }));
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawMap(); drawWindow();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.fillText(label, r.x + 10, r.y + 18); }
  const text = (t, x, y, o = {}) => { g.fillStyle = o.c || C.dim; g.font = `${o.w || 600} ${o.s || 11}px system-ui`; g.textAlign = o.a || 'left'; g.fillText(t, x, y); g.textAlign = 'left'; };
  const poly = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); pts.map(toS).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.lineCap = 'butt'; };
  const o2col = o2 => { const k = Math.max(0, Math.min(1, (o2 - 0.5) / 0.48)); return `rgb(${Math.round(106 + 90 * k)},${Math.round(52 + 54 * k)},${Math.round(52 + 47 * k)})`; };
  function drawMap() {
    frame(MAP, '몸 지도 · 조종판');
    const cur = ORDER[R.seg], vw = view(R);
    // 길들
    const wOf = id => (id === 'aorta' || id === 'pa' ? 8 : id === 'artery' ? 5 : id === 'vein' || id === 'pv' ? 5 : 2);
    for (const id of ['pa', 'lungcap', 'pv', 'aorta']) poly(line(id), wOf(id), id === cur ? '#8b919d' : C.soft);
    for (const b of Object.keys(BRANCHES)) for (const id of ['artery', 'cap', 'vein']) poly(line(id, b), wOf(id), id === cur && (R.branch || R.fork) === b ? '#8b919d' : b === R.fork ? '#474d59' : '#2a2f38');
    // 심장 두 방
    for (const [id, nm] of [['heartR', '오른쪽 방'], ['heartL', '왼쪽 방']]) {
      const [x, y] = toS(P0[id]), b = BODY(), w = Math.min(64, b.w * 0.2), h = Math.min(44, b.h * 0.16), beat = vw.heartOpen ? 1.06 : 1;
      g.fillStyle = cur === id ? '#4a505c' : '#2b3039'; g.strokeStyle = C.line; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect(x - w / 2 * beat, y - h / 2 * beat, w * beat, h * beat, 10); g.fill(); g.stroke();
      text(nm, x, y + 4, { a: 'center', s: 10, w: 700, c: C.ink });
    }
    { const [x, y] = toS([0.5, 0.42]); text('심장', x, y - 26, { a: 'center', s: 11, w: 800, c: C.ink }); }
    { const [x, y] = toS([0.5, 0.08]); text('허파', x, y - 9, { a: 'center', s: 11, w: 800, c: C.ink }); }
    { const [x, y] = toS([0.5, 0.6]); text('몸', x, y, { a: 'center', s: 11, w: 800, c: C.ink }); }
    // 갈림길 스위치(세 갈래 가운데 하나에 팔이 붙는다)
    const [fx, fy] = toS(P0.F), [tx, ty] = toS([0.8, ROWS[R.fork]]);
    g.strokeStyle = C.hi; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + (tx - fx) * 0.55, fy + (ty - fy) * 0.55); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#aeb4bf'; g.beginPath(); g.arc(fx, fy, 6, 0, 7); g.fill();
    text('갈림길', fx + 9, fy + 4, { s: 10, w: 700 });
    for (const b of Object.keys(BRANCHES)) {
      const p = forkPill(b), on = R.fork === b; g.fillStyle = on ? '#3a404c' : '#161a22'; g.strokeStyle = on ? C.hi : C.line; g.lineWidth = on ? 2 : 1;
      g.beginPath(); g.roundRect(p.x - p.r, p.y - 11, p.r * 2, 22, 11); g.fill(); g.stroke(); text(b, p.x, p.y + 4, { a: 'center', s: 11, w: 800, c: on ? C.hi : C.dim });
    }
    // 잠수정
    const pts = line(cur), [sx, sy] = toS(SEG[cur].kind === 'heart' ? P0[cur] : along(pts, vw.fr)), hy = SEG[cur].kind === 'heart' ? Math.min(24, BODY().h * 0.08) * 0.62 : 0;
    g.fillStyle = C.hi; g.beginPath(); g.arc(sx, sy + hy, 6, 0, 7); g.fill(); g.strokeStyle = C.bg; g.lineWidth = 2; g.stroke();
    // 흐름 레버
    const L = LEV(), mid = (L.y0 + L.y1) / 2, ky = mid - R.lever * (L.y1 - L.y0) / 2;
    g.fillStyle = '#151820'; g.fillRect(L.x - 9, L.y0 - 6, 18, L.y1 - L.y0 + 12); g.strokeStyle = C.line; g.lineWidth = 1; g.strokeRect(L.x - 8.5, L.y0 - 5.5, 17, L.y1 - L.y0 + 11);
    g.strokeStyle = C.dim; g.beginPath(); g.moveTo(L.x - 14, mid); g.lineTo(L.x + 14, mid); g.stroke();
    g.strokeStyle = '#9aa1ae'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(L.x, mid); g.lineTo(L.x, ky); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = S.lever != null ? C.hi : R.outLock ? '#6b5a4a' : '#aeb4bf'; g.beginPath(); g.roundRect(L.x - 17, ky - 9, 34, 18, 7); g.fill();
    text('밀기', L.x, L.y0 - 12, { a: 'center', w: 700 }); text('버티기', L.x, L.y1 + 22, { a: 'center', w: 700 });
    text('흐름', L.x + 17, mid - 4, { s: 9 }); text('타기', L.x + 17, mid + 8, { s: 9 });
    // 쉬기 · 달리기 · 탐조등
    const K = KN();
    for (const [k, on, nm] of [['rest', !R.run, '쉬기'], ['run', R.run, '달리기']]) {
      const b = K[k]; g.fillStyle = '#20242d'; g.beginPath(); g.arc(b.x, b.y, b.s, 0, 7); g.fill();
      g.fillStyle = on ? C.hi : '#5b6270'; g.beginPath(); g.arc(b.x, b.y + (on ? 2 : 0), b.s * 0.68, 0, 7); g.fill();
      text(nm, b.x, b.y + b.s + 14, { a: 'center', w: 700, c: on ? C.ink : C.dim });
    }
    const sw = K.sw, s = sw.s;
    g.fillStyle = '#20242d'; g.strokeStyle = C.line; g.lineWidth = 1.5; g.beginPath(); g.roundRect(sw.x - s * 0.55, sw.y - s * 0.8, s * 1.1, s * 1.6, 6); g.fill(); g.stroke();
    g.strokeStyle = R.light ? C.hi : '#7d8493'; g.lineWidth = Math.max(4, s * 0.22); g.lineCap = 'round'; g.beginPath(); g.moveTo(sw.x, sw.y); g.lineTo(sw.x, sw.y + (R.light ? -1 : 1) * s * 0.65); g.stroke(); g.lineCap = 'butt';
    text('탐조등', sw.x, sw.y + s * 0.8 + 14, { a: 'center', w: 700, c: R.light ? C.ink : C.dim });
    const mk = K.mark; g.fillStyle = '#20242d'; g.beginPath(); g.arc(mk.x, mk.y, mk.s, 0, 7); g.fill();
    g.fillStyle = S.markT > 0 ? C.hi : '#9aa1ae'; g.beginPath(); g.arc(mk.x, mk.y, mk.s * 0.68 * (S.markT > 0 ? 0.88 : 1), 0, 7); g.fill();
    text('여기!', mk.x, mk.y + mk.s + 14, { a: 'center', w: 700, c: C.ink });
  }
  function drawWindow() {
    const vw = view(R), c = winC(), t = S.anim;
    frame(WIN, '잠수정 창 — ' + vw.name);
    g.save(); g.beginPath(); g.arc(c.x, c.y, c.R, 0, 7); g.clip();
    const lit = R.light ? 1.25 : 1;
    g.fillStyle = `rgb(${Math.round(46 * lit)},${Math.round(36 * lit)},${Math.round(38 * lit)})`; g.fillRect(c.x - c.R, c.y - c.R, c.R * 2, c.R * 2);
    const tube = c.R * (0.34 + 0.6 * Math.min(1, vw.width / 1.4));
    // 굴 벽: 다가오는 고리(지나가는 만큼 밖으로 퍼진다)
    for (let i = 0; i < 6; i++) {
      const z = ((i / 6) + S.travel * 0.25) % 1, rr = tube * (0.15 + 0.85 * z * z) * (1 + 0.1 * vw.bulge);
      g.strokeStyle = `rgba(190,170,172,${0.08 + 0.3 * z * lit})`; g.lineWidth = 1 + 3 * z; g.beginPath(); g.arc(c.x, c.y, rr, 0, 7); g.stroke();
    }
    g.fillStyle = 'rgba(12,10,12,.55)'; g.beginPath(); g.rect(c.x - c.R, c.y - c.R, c.R * 2, c.R * 2); g.moveTo(c.x + tube * (1 + 0.1 * vw.bulge), c.y); g.arc(c.x, c.y, tube * (1 + 0.1 * vw.bulge), 0, Math.PI * 2, true); g.fill();
    g.strokeStyle = R.light ? '#b9a5a7' : '#7a6a6c'; g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, tube * (1 + 0.1 * vw.bulge), 0, 7); g.stroke();
    if (R.light) { g.strokeStyle = 'rgba(200,180,182,.35)'; g.lineWidth = 1; for (let i = 0; i < 8; i++) { const a = i * 0.8 + 0.3; g.beginPath(); g.moveTo(c.x + Math.cos(a) * tube * 1.02, c.y + Math.sin(a) * tube * 1.02); g.lineTo(c.x + Math.cos(a + 0.15) * tube * 1.3, c.y + Math.sin(a + 0.15) * tube * 1.3); g.stroke(); } }
    // 허파: 벽 너머 공기주머니
    if (vw.id === 'lungcap') for (let i = 0; i < 10; i++) { const a = i * 0.628, rr = tube * (0.32 + 0.22 * vw.alveoli); g.strokeStyle = '#9aa1ae'; g.lineWidth = 1.5; g.beginPath(); g.arc(c.x + Math.cos(a) * (tube + rr + 3), c.y + Math.sin(a) * (tube + rr + 3), rr, 0, 7); g.stroke(); }
    // 상처: 벽의 틈과 그물
    if (vw.wound > 0 || (R.woundSeen && ORDER[R.seg] === 'artery')) {
      const k = vw.wound > 0 ? vw.wound : 1, a0 = -0.6, x = c.x + Math.cos(a0) * tube, y = c.y + Math.sin(a0) * tube;
      g.fillStyle = '#0b0d12'; g.beginPath(); g.ellipse(x, y, 16, 7, a0 + Math.PI / 2, 0, 7); g.fill();
      g.strokeStyle = `rgba(230,232,238,${0.3 + 0.6 * k})`; g.lineWidth = 1; for (let i = 0; i < 6 * k; i++) { g.beginPath(); g.moveTo(x - 16 + i * 5, y - 10); g.lineTo(x - 6 + i * 3, y + 10); g.stroke(); }
      g.fillStyle = '#cfd3db'; for (let i = 0; i < 10; i++) { const d = (1 - k) * 60 + 6; g.beginPath(); g.arc(x - Math.cos(i) * d * 0.7 - 10, y + Math.sin(i * 1.7) * d * 0.4 + 10, 2, 0, 7); g.fill(); }
      text('혈소판 그물', x - 10, y - 16, { a: 'center', s: 10, c: C.ink, w: 700 });
    }
    // 세균과 백혈구
    if (vw.germ > 0) {
      const k = vw.germ, x = c.x - tube * 0.4, y = c.y + tube * 0.45;
      if (k < 0.8) { g.strokeStyle = '#8fa27a'; g.lineWidth = 4; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + i * 9, y - i * 4); g.lineTo(x + i * 9 + 8, y - i * 4 + 3); g.stroke(); } g.lineCap = 'butt'; }
      const bx = x - 50 * (1 - Math.min(1, k * 1.4)) + 8, br = 14 + 6 * Math.sin(t * 4);
      g.fillStyle = 'rgba(232,234,240,.9)'; g.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.283, r2 = br * (1 + 0.15 * Math.sin(a * 3 + t * 5)); i ? g.lineTo(bx + Math.cos(a) * r2, y + Math.sin(a) * r2) : g.moveTo(bx + Math.cos(a) * r2, y + Math.sin(a) * r2); } g.fill();
      text(k < 0.8 ? '세균 · 백혈구' : '꿀꺽!', bx, y - br - 6, { a: 'center', s: 10, c: C.ink, w: 700 });
    }
    // 적혈구(가운데 오목한 원반) — 실핏줄에서는 한 줄로, 접혀서
    const col = o2col(vw.o2);
    if (vw.singleFile) {
      for (let i = 0; i < 5; i++) { const z = ((i / 5) + S.rel * 0.3 + S.travel * 0.02) % 1, rr = 6 + 26 * z * z; g.fillStyle = col; g.beginPath(); g.ellipse(c.x, c.y + (z - 0.5) * 4, rr, rr * 0.55, 0, Math.PI * 0.05, Math.PI * 1.95); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(c.x - rr * 0.8, c.y); g.quadraticCurveTo(c.x, c.y + rr * 0.4, c.x + rr * 0.8, c.y); g.stroke(); }
    } else {
      for (const q of CELLS) {
        const z = (q.z + S.rel * 0.12) % 1, zz = z < 0 ? z + 1 : z, rr = 3 + 14 * zz * zz, d = q.r * tube * (0.2 + 0.8 * zz);
        const x = c.x + Math.cos(q.a + t * 0.05) * d, y = c.y + Math.sin(q.a + t * 0.05) * d, tilt = Math.abs(Math.cos(q.spin + t * 0.6));
        g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rr, rr * (0.35 + 0.65 * tilt), q.spin, 0, 7); g.fill();
        if (tilt > 0.5) { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x, y, rr * 0.45, rr * 0.45 * tilt, q.spin, 0, 7); g.fill(); }
      }
    }
    // 문(판막): 심장 문 · 돌아오는 길의 문
    if (vw.kind === 'heart' || vw.valveNear) {
      const open = vw.kind === 'heart' ? (vw.heartOpen && !R.parked ? 1 : 0) : 0.75, rr = tube * 0.95;
      g.fillStyle = 'rgba(180,170,172,.75)';
      for (const sgn of [-1, 1]) { g.beginPath(); g.moveTo(c.x + sgn * rr, c.y - rr * 0.2); g.lineTo(c.x + sgn * rr * (0.08 + 0.85 * open), c.y); g.lineTo(c.x + sgn * rr, c.y + rr * 0.2); g.fill(); }
      if (R.parked) text('손잡이를 만지면 출발해요', c.x, c.y - tube * 0.7 + 16, { a: 'center', s: 11, w: 700, c: C.ink });
      text(vw.kind === 'heart' ? (R.parked ? '문이 닫혀 있어요' : vw.heartOpen ? '쿵! 문이 열렸어요' : '문이 닫혀 있어요') : '한쪽으로만 열리는 문', c.x, c.y - tube * 0.7, { a: 'center', s: 11, w: 800, c: C.hi });
    }
    // 버티기: 창에 부딪치는 적혈구
    if (S.hit > 0) { g.fillStyle = col; for (let i = 0; i < 6; i++) { const a = i * 1.1 + t * 3, rr = 18 * S.hit; g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 9 + i); g.beginPath(); g.ellipse(c.x + Math.cos(a) * c.R * 0.55, c.y + Math.sin(a) * c.R * 0.55, rr, rr * 0.6, a, 0, 7); g.fill(); } g.globalAlpha = 1; }
    g.restore();
    // 맥박마다 창틀이 살짝 밀린다
    const push = vw.kind === 'heart' ? 0 : vw.bulge * 2.5;
    g.strokeStyle = C.line; g.lineWidth = 3 + push; g.beginPath(); g.arc(c.x, c.y, c.R, 0, 7); g.stroke();
    // 계기 셋: 맥박 · 전지 · 피 색
    const gx = c.gx + c.gw / 2, gh = (WIN.h - 34) / 3, r = Math.max(12, Math.min(24, gh * 0.26, c.gw * 0.28));
    const y0 = i => WIN.y + 32 + gh * i + r;
    { const y = y0(0), k = 1 + 0.18 * (vw.phi < 0.35 ? Math.sin(Math.PI * vw.phi / 0.35) : 0); g.fillStyle = '#aeb4bf'; g.beginPath(); g.moveTo(gx, y + r * 0.7 * k); g.bezierCurveTo(gx - r * 1.2 * k, y - r * 0.1 * k, gx - r * 0.5 * k, y - r * 0.9 * k, gx, y - r * 0.35 * k); g.bezierCurveTo(gx + r * 0.5 * k, y - r * 0.9 * k, gx + r * 1.2 * k, y - r * 0.1 * k, gx, y + r * 0.7 * k); g.fill();
      text('맥박 ' + vw.bpm, gx, y + r + 12, { a: 'center', s: 12, w: 800, c: C.ink }); text(R.run ? '달리는 중' : '쉬는 중', gx, y + r + 25, { a: 'center', s: 10 }); }
    { const y = y0(1), warn = R.battery < 20; g.fillStyle = '#151820'; g.strokeStyle = warn ? C.warn : C.line; g.lineWidth = 1.5; g.beginPath(); g.arc(gx, y, r, Math.PI * 0.75, Math.PI * 2.25); g.fill(); g.stroke();
      const a = Math.PI * 0.75 + Math.PI * 1.5 * R.battery / 100; g.strokeStyle = C.hi; g.lineWidth = 2.5; g.beginPath(); g.moveTo(gx, y); g.lineTo(gx + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); g.stroke();
      text('전지 ' + Math.ceil(R.battery) + '%', gx, y + r + 12, { a: 'center', s: 12, w: 800, c: warn ? C.warn : C.ink }); text(R.free ? '자유: 안 닳아요' : R.lever < -0.05 ? '버티느라 닳아요' : R.lever > 0.05 ? '미느라 닳아요' : '흐름 타며 차요', gx, y + r + 25, { a: 'center', s: 10 }); }
    { const y = y0(2); g.fillStyle = col; g.beginPath(); g.ellipse(gx, y, r, r * 0.6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(gx, y, r * 0.45, r * 0.27, 0, 0, 7); g.fill();
      text(vw.color, gx, y + r + 4, { a: 'center', s: 12, w: 800, c: C.ink }); text('산소 ' + Math.round(vw.o2 * 100), gx, y + r + 17, { a: 'center', s: 10 }); }
  }

  addEventListener('resize', layout); layout();
  return {
    S, get R() { return R; }, step, draw, layout, showMission, startMission, act,
    reset() { R = createRide({ free: S.free }); },
    geom() { const L = LEV(), K = KN(), mid = (L.y0 + L.y1) / 2, f = {}; for (const b of Object.keys(BRANCHES)) f[b] = forkPill(b); return { lever: { x: L.x, y0: L.y0, y1: L.y1, mid }, rest: K.rest, run: K.run, sw: K.sw, mark: K.mark, fork: f, win: winC() }; },
    segName: () => segName(R),
  };
}
