/* 케이원더 · 토성 고리 속 — 묶음 ㄱ 손잡이 판(회색 도형). 그림은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 조종석 창: 토성과 고리(거리에 따라 띠 → 줄무늬 → 알갱이 → 덩어리), 고리 속이면 집게 팔.
 * 오른쪽(아래) = 조종판: ① 조종 손잡이(놓으면 가운데로 돌아옴) ② 다가가기 레버.
 */
import { look, stageAt, distKm, regionAt, aimR, SATURN_AIM, RING_IN, RING_OUT, GAP, GAP_AIM, EDGE, ELEV_MAX, ELEV_FREE, STAGE_AT, COURSE, WRAP, LAYER, SHIP_R, START_Y, END_Y, chunkAt, crossStart, crossStep, grab, push, gapMoon, moonHit, floatTest, MISSIONS, WHY, SAYS, REJOIN_SEC } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = {
    lever: 0, aim: 0.45, elev: 18, joy: { x: 0, y: 0 }, joyHeld: false, mi: 0, free: false, drags: new Map(), waiting: false, lastTell: '', lastKey: '',
    cross: null, ct: 0, gt: 0, hitT: 0, crossT: 0, skip: new Map(), sample: null, frags: [], nudge: null, tub: null, claw: null, said: {},
  };
  let W = 0, H = 0, dpr = 1, VW = null, PN = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', knob: '#aeb4bf', ice: '#c9d0da', sat: '#9c968a' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const elevMax = () => (S.free ? ELEV_FREE : ELEV_MAX);
  const L = () => look({ lever: S.lever, aim: S.aim, elev: S.elev });
  const stage = () => stageAt(S.lever);

  // ── 자리 셈
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12, h = H - top - bottom;
    if (W >= H * 1.15) { VW = { x: 8, y: top, w: W * 0.64 - 12, h }; PN = { x: W * 0.64 + 4, y: top, w: W * 0.36 - 12, h, tall: true }; }
    else { VW = { x: 8, y: top, w: W - 16, h: h * 0.62 }; PN = { x: 8, y: top + h * 0.62 + 6, w: W - 16, h: h * 0.38 - 6, tall: false }; }
  }
  const cellAt = i => PN.tall ? { x: PN.x, y: PN.y + i * PN.h / 2, w: PN.w, h: PN.h / 2 } : { x: PN.x + i * PN.w / 2, y: PN.y, w: PN.w / 2, h: PN.h };
  const joyB = () => { const c = cellAt(0), r = Math.max(24, Math.min(c.w * 0.2, c.h * 0.26)); return { x: c.x + c.w / 2, y: c.y + c.h / 2 - 4, r }; };
  const lev = () => { const c = cellAt(1), half = Math.min(c.h * 0.32, 110); return { x: c.x + c.w / 2, y0: c.y + c.h / 2 - half - 6, y1: c.y + c.h / 2 + half - 6 }; };
  const vc = () => ({ x: VW.x + VW.w / 2, y: VW.y + VW.h / 2 + 6 });
  // 고리 속 판: 흐르는 쪽 x(0~WRAP m) · 높이 y(m)
  const ck = () => Math.min(VW.w / WRAP, (VW.h - 60) / 40);
  const cs = (x, y) => { const k = ck(), c = vc(); return [c.x + (x - WRAP / 2) * k, c.y - y * k]; };
  const clawBase = () => ({ x: VW.x + VW.w * 0.5, y: VW.y + VW.h - 4 });
  const clawRest = () => { const b = clawBase(); return { x: b.x - 26, y: b.y - 34 }; };
  const clawTip = () => S.claw ? { x: S.claw.x, y: S.claw.y } : clawRest();
  const clawOn = () => stage() === 'inside' && regionAt(S.aim) === 'ring';
  function chunksNow() { return COURSE.filter(c => !S.skip.has(c.id)).map(c => { const q = chunkAt(c, S.ct), [x, y] = cs(q.x, q.y); return { id: c.id, x, y, r: c.r * ck(), m: q }; }); }
  const geom = () => ({ joy: joyB(), lever: lev(), view: VW, claw: clawTip(), clawBase: clawBase(), chunks: chunksNow(), center: vc() });

  // ── 의뢰
  function showMission() {
    S.waiting = false; S.lastTell = '';
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 날아 보세요', '토성을 큰 물통에 넣어 볼 수도 있어요');
    ui.freeMode(S.free);
  }
  function succeed(i, sub) {
    S.waiting = true; S.mi = i + 1; if (S.mi >= MISSIONS.length) S.free = true;
    ui.note('성공! ⭐', sub);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    setTimeout(showMission, 8000);
  }
  function tell(i, t) { if (t !== S.lastTell) { S.lastTell = t; ui.note('의뢰 ' + (i + 1) + ' · ' + MISSIONS[i].say, t + ' · 귀띔: ' + MISSIONS[i].hint); } }
  function judge(quiet) {
    if (S.waiting || S.mi >= MISSIONS.length) return;
    const v = L();
    if (S.mi === 0) { if (MISSIONS[0].ok(v)) succeed(0, '고리 판과 같은 높이에서 보면 고리가 선 하나로 사라져요.'); else if (!quiet) tell(0, MISSIONS[0].tell(v)); }
    else if (S.mi === 1) {
      const st = { ...(S.cross || crossStart()), stage: v.stage, region: v.region };
      if (MISSIONS[1].ok(st)) succeed(1, '얼음 덩어리 사이로 고리를 뚫고 나왔어요.');
      else if (!quiet || st.hit) tell(1, MISSIONS[1].tell(st));
    }
  }

  // ── 손잡이 바꾸기
  function setLever(f) {
    const before = stage(); S.lever = clamp(f, 0, 1);
    if (stage() === 'inside' && before !== 'inside') enterInside();
    if (stage() !== 'inside') { S.cross = null; S.claw = null; }
    update();
  }
  function enterInside() { S.ct = 0; S.cross = crossStart(); S.hitT = 0; S.crossT = 0; S.skip.clear(); S.frags = []; S.nudge = null; }
  function setAim(a) { S.aim = clamp(a, 0, 1); update(); }
  function setElev(e) { S.elev = clamp(e, -elevMax(), elevMax()); update(); }
  function update() {
    const v = L(), key = v.stage === 'inside' && v.region === 'ring' ? 'inside' : v.key;
    if (key !== S.lastKey) {
      S.lastKey = key; S.said[key] = true;
      let t = SAYS[key];
      if (key === 'lines') t += ' (줄무늬 3,000줄쯤)';
      if (key === 'inside') t += ' 조종 손잡이를 아래로 내리면 고리를 뚫고 내려가요. 집게 팔로 덩어리를 집거나 밀어 봐요.';
      if (key === 'gap' && S.mi === 2) t += ' 지나가는 것을 눌러 봐요.';
      ui.say(t);
    }
    judge(true);
  }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    const [x, y] = P(e), J = joyB(), V = lev();
    let d = null;
    if (Math.hypot(x - J.x, y - J.y) < J.r * 1.5) d = { k: 'joy' };
    else if (Math.abs(x - V.x) < 34 && y > V.y0 - 24 && y < V.y1 + 24) d = { k: 'lever' };
    else if (clawOn() && x > VW.x && x < VW.x + VW.w && y > VW.y && y < VW.y + VW.h && (Math.hypot(x - clawTip().x, y - clawTip().y) < 40 || y > VW.y + VW.h * 0.6)) d = { k: 'claw', t: performance.now(), px: x, py: y, sp: 0 };
    else if (x > VW.x && x < VW.x + VW.w && y > VW.y && y < VW.y + VW.h) { tapView((x - VW.x) / VW.w, (y - VW.y) / VW.h); return; }
    if (!d) return;
    for (const [id, o] of S.drags) if (o.k === d.k) S.drags.delete(id);            // 같은 손잡이를 다른 손가락이 잡으면 새 손가락이 이긴다
    d.id = e.pointerId; S.drags.set(e.pointerId, d); try { cv.setPointerCapture(e.pointerId); } catch {} move(x, y, d);
  });
  cv.addEventListener('pointermove', e => { const d = S.drags.get(e.pointerId); if (d) { const [x, y] = P(e); move(x, y, d); } });
  const up = e => {
    const d = S.drags.get(e.pointerId); S.drags.delete(e.pointerId);
    if (d) {
      if (d.k === 'lever') judge();
      if (d.k === 'claw' && e.type === 'pointerup') { const hit = chunkUnderClaw(); if (hit) grabChunk(hit.id); }
      if (d.k === 'claw') S.claw = null;
    }
    if (!dragging('joy') && (S.joy.x || S.joy.y) && !S.joyHeld) { S.joy = { x: 0, y: 0 }; judge(); }   // 조종 손잡이를 쥔 손가락이 없으면 가운데로
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  function dragging(k) { for (const d of S.drags.values()) if (d.k === k) return true; return false; }
  function move(x, y, d) {
    if (d.k === 'joy') { const J = joyB(); let dx = (x - J.x) / J.r, dy = -(y - J.y) / J.r; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } S.joy = { x: dx, y: dy }; }
    else if (d.k === 'lever') { const V = lev(); setLever(clamp((y - V.y0) / (V.y1 - V.y0), 0, 1)); }
    else if (d.k === 'claw') {
      const b = clawBase(), reach = VW.h * 0.62; let dx = x - b.x, dy = y - b.y; const m = Math.hypot(dx, dy); if (m > reach) { dx *= reach / m; dy *= reach / m; }
      const now = performance.now(), dt = Math.max(1, now - d.t), sp = Math.hypot(x - d.px, y - d.py) / dt * 1000;
      d.t = now; d.px = x; d.py = y; d.sp = sp; S.claw = { x: b.x + dx, y: b.y + dy };
      const hit = chunkUnderClaw();
      if (hit && sp > 700) { pushChunk(hit.id, clamp(sp / 2400, 0, 1), Math.sign(dx) || 1); S.drags.delete(d.id); S.claw = null; }
    }
  }
  function chunkUnderClaw() { const t = clawTip(); return chunksNow().find(c => Math.hypot(c.x - t.x, c.y - t.y) < c.r + 10) || null; }
  function grabChunk(id) {
    if (!clawOn()) return null;
    const c = COURSE.find(q => q.id === (id ?? nearestChunk()));
    S.skip.set(c.id, S.ct + 14); S.sample = { t: 0, r: c.r };
    const res = grab(); ui.say(res.says); S.said.grab = true; return res;
  }
  function nearestChunk() { const t = clawTip(); return chunksNow().sort((a, b) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y))[0].id; }
  function pushChunk(id, strength, dir = 1) {
    if (!clawOn()) return null;
    id = id ?? nearestChunk();
    const res = push(strength), c = chunksNow().find(q => q.id === id);
    if (res.breaks) {
      S.skip.set(id, S.ct + REJOIN_SEC + 1.5);
      for (let i = 0; i < 12; i++) { const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 60; S.frags.push({ x: c.x, y: c.y, vx: dir * 140 + Math.cos(a) * s, vy: Math.sin(a) * s - 30, t: 0, r: Math.max(1.5, c.r * 0.25 * Math.random() + 1) }); }
      S.said.pushHard = true;
    } else { S.nudge = { id, t: 0, dir }; S.said.pushSoft = true; }
    ui.say(res.says); return res;
  }
  function tapView(u, v) {
    const lk = L();
    if (lk.key !== 'gap') { if (S.mi === 2) tell(2, MISSIONS[2].tell({ key: lk.key, tap: [u, v], t: S.gt })); return; }
    const q = { key: 'gap', tap: [u, v], t: S.gt };
    if (S.mi === 2 && !S.waiting) { if (MISSIONS[2].ok(q)) succeed(2, '작은 달이 틈을 따라 돌며 얼음을 쓸어 내 틈이 생겨요.'); else tell(2, MISSIONS[2].tell(q)); }
    else if (moonHit(q).hit) ui.say('작은 달이에요. 이 달이 지나가며 얼음을 쓸어 내서 틈이 비어 있어요.');
  }
  function floatIt(name) { const r = floatTest(name); S.tub = { ...r, t: 0 }; ui.say((name === 'saturn' ? '토성을 큰 물통에 넣었어요 — ' : '지구를 큰 물통에 넣었어요 — ') + r.says); S.said.float = r.floats || S.said.float; return r; }

  // ── 돌리기
  function step(dt) {
    S.gt += dt;
    const j = S.joy;
    if (stage() !== 'inside') {
      if (j.x || j.y) { S.aim = clamp(S.aim + j.x * Math.abs(j.x) * 0.2 * dt, 0, 1); S.elev = clamp(S.elev + j.y * Math.abs(j.y) * 14 * dt, -elevMax(), elevMax()); update(); }
    } else {
      const c = S.cross;
      if (c && !c.hit && !c.crossed && regionAt(S.aim) === 'ring') {
        S.cross = crossStep(c, j, dt, new Set(S.skip.keys()));
        S.ct = S.cross.t;
        if (S.cross.hit) { S.hitT = 0; ui.say(SAYS.hit); judge(); }
        else if (S.cross.crossed) { S.crossT = 0; ui.say(SAYS.crossed); judge(); }
      } else {
        S.ct += dt;
        if (c && c.hit && (S.hitT += dt) > 2.5) { S.cross = { ...crossStart(), t: S.ct }; ui.say('다시 고리 위에서 시작해요. 사이가 열릴 때 내려가요.'); }
        if (c && c.crossed && (S.crossT += dt) > 5) { S.cross = { ...crossStart(), t: S.ct }; }
      }
      for (const [id, until] of S.skip) if (S.ct >= until) { S.skip.delete(id); }
    }
    if (S.sample) S.sample.t += dt;
    if (S.nudge && (S.nudge.t += dt) > 1.6) S.nudge = null;
    for (const f of S.frags) { f.t += dt; const drag = Math.exp(-dt * 0.9); f.vx = f.vx * drag + (1 - drag) * 8; f.vy *= drag; f.x += f.vx * dt; f.y += f.vy * dt; }
    S.frags = S.frags.filter(f => f.t < REJOIN_SEC);
    if (S.tub && (S.tub.t += dt) > 7) S.tub = null;
  }

  // ── 그리기(회색 도형)
  let seedS = 9; const rnd = () => (seedS = (seedS * 16807) % 2147483647) / 2147483647;
  const STARS = Array.from({ length: 110 }, () => [rnd(), rnd(), 0.4 + rnd()]);
  const LINES = Array.from({ length: 360 }, () => [rnd(), 0.25 + rnd() * 0.6]);
  const GRAINS = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd() * 6.28, 0.6 + rnd() * 1.6]);
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawView(); drawPanel();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(label, r.x + 10, r.y + 18); }
  const ringShade = r => (r >= GAP[0] && r <= GAP[1]) ? null : r < 1.53 ? 0.28 : r < 1.95 ? 0.62 : r < 2.21 ? 0.45 : r < 2.23 ? null : 0.4;   // 안쪽 고리 흐림 · 가운데 고리 밝음 · 틈 · 바깥 고리
  function drawView() {
    const lk = L(), st = lk.stage;
    frame(VW, '조종석 창');
    g.save(); g.beginPath(); g.rect(VW.x, VW.y + 24, VW.w, VW.h - 24); g.clip();
    g.fillStyle = '#4a505c'; for (const [u, v, s] of STARS) g.fillRect(VW.x + u * VW.w, VW.y + v * VW.h, s, s);
    if (lk.key === 'saturn') drawSaturnClose();
    else if (lk.key === 'gap') drawGap(st);
    else if (st === 'far') drawFar();
    else if (st === 'lines' || st === 'grains') drawPatch(st);
    else drawInside();
    if (S.tub) drawTub();
    g.restore();
    // 읽는 판
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'right';
    const where = lk.region === 'saturn' ? '토성' : lk.region === 'gap' ? '검은 틈' : '고리';
    g.fillText(`${st === 'inside' ? '고리 속' : '거리 ' + Math.round(lk.distKm).toLocaleString('ko-KR') + ' km'} · 기울기 ${S.elev.toFixed(1)}° · 겨눈 곳 ${where}`, VW.x + VW.w - 10, VW.y + 18); g.textAlign = 'left';
  }
  function ringEllipse(cx, cy, Rs, tilt) {
    const minor = Math.max(0.0015, Math.abs(Math.sin(tilt * Math.PI / 180)));
    const band = (r0, r1, a0, a1, shade) => { g.fillStyle = `rgba(200,204,212,${shade})`; g.beginPath(); g.ellipse(cx, cy, r1 * Rs, r1 * Rs * minor, 0, a0, a1); g.ellipse(cx, cy, r0 * Rs, r0 * Rs * minor, 0, a1, a0, true); g.closePath(); g.fill(); };
    const steps = [];
    for (let r = RING_IN; r < RING_OUT; r += 0.01) { const s = ringShade(r + 0.005); if (s != null) steps.push([r, r + 0.0105, s]); }
    return { minor, back: () => steps.forEach(([a, b, s]) => band(a, b, Math.PI, Math.PI * 2, s)), front: () => steps.forEach(([a, b, s]) => band(a, b, 0, Math.PI, s)) };
  }
  function saturnBall(cx, cy, Rs, minor) {
    g.fillStyle = C.sat; g.beginPath(); g.ellipse(cx, cy, Rs, Rs * 0.9, 0, 0, 7); g.fill();
    g.save(); g.beginPath(); g.ellipse(cx, cy, Rs, Rs * 0.9, 0, 0, 7); g.clip();
    g.fillStyle = 'rgba(60,58,54,.25)'; for (let i = -4; i <= 4; i += 2) g.fillRect(cx - Rs, cy + i * Rs * 0.1, Rs * 2, Rs * 0.07);
    if (minor > 0.01) { g.fillStyle = 'rgba(20,20,24,.5)'; g.beginPath(); g.ellipse(cx, cy - Rs * 0.25 * Math.sign(S.elev || 1), Rs * 1.6, Rs * 1.6 * minor * 0.5, 0, 0, 7); g.ellipse(cx, cy - Rs * 0.25 * Math.sign(S.elev || 1), Rs * 1.25, Rs * 1.25 * minor * 0.5, 0, 0, 7, true); g.fill('evenodd'); }
    g.restore();
  }
  function reticle(x, y, s = 9) { g.strokeStyle = C.hi; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, s, 0, 7); g.moveTo(x - s - 6, y); g.lineTo(x - s + 3, y); g.moveTo(x + s - 3, y); g.lineTo(x + s + 6, y); g.moveTo(x, y - s - 6); g.lineTo(x, y - s + 3); g.moveTo(x, y + s - 3); g.lineTo(x, y + s + 6); g.stroke(); }
  function drawFar() {
    const c = vc(), Rs = Math.min(VW.w / (2 * RING_OUT + 0.3), VW.h * 0.42) * (1 + S.lever * 1.2);
    const R = ringEllipse(c.x, c.y, Rs, S.elev);
    R.back(); saturnBall(c.x, c.y, Rs, R.minor); R.front();
    if (Math.abs(S.elev) < 3) { g.strokeStyle = 'rgba(200,204,212,.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(c.x - RING_OUT * Rs, c.y); g.lineTo(c.x + RING_OUT * Rs, c.y); g.stroke(); }   // 옆에서 보면 선 하나
    const ax = S.aim < SATURN_AIM ? c.x + (S.aim / SATURN_AIM) * Rs * 0.85 : c.x + aimR(S.aim) * Rs;
    reticle(ax, c.y);
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center';
    if (Math.abs(S.elev) > 4) g.fillText('검은 틈', c.x + (GAP[0] + GAP[1]) / 2 * Rs, c.y - Rs * R.minor * 2.05 - 8);
    g.textAlign = 'left';
  }
  function drawPatch(st) {                                              // 겨눈 자리 둘레의 고리 한 조각(가로 = 토성에서 멀어지는 쪽)
    const c = vc(), r0 = aimR(S.aim), span = st === 'lines' ? 0.16 : 0.03, minor = Math.max(0.004, Math.abs(Math.sin(S.elev * Math.PI / 180)));
    const hh = Math.max(1, VW.h * 0.42 * minor / Math.sin(30 * Math.PI / 180) * 0.9);
    const toX = r => c.x + (r - r0) / span * VW.w * 0.5;
    if (st === 'lines') {
      for (const [u, s] of LINES) { const r = r0 - span + u * 2 * span, sh = ringShade(r); if (sh == null || r < RING_IN || r > RING_OUT) continue; g.fillStyle = `rgba(205,209,216,${sh * s})`; g.fillRect(toX(r), c.y - hh, Math.max(1, VW.w / 360), hh * 2); }
    } else {
      const now = S.gt;
      for (const [u, v, ph, sz] of GRAINS) {
        const x = VW.x + ((u + now * 0.01) % 1) * VW.w, r = r0 + (x - c.x) / (VW.w * 0.5) * span; if (ringShade(r) == null) continue;
        const y = c.y + (v * 2 - 1) * hh, tw = 0.45 + 0.55 * Math.abs(Math.sin(now * 2 + ph));
        g.fillStyle = `rgba(236,239,244,${tw})`; g.fillRect(x, y, sz, sz);
      }
    }
    reticle(c.x, c.y, 12);
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText(st === 'lines' ? '고리 한 조각 — 줄무늬' : '고리 한 조각 — 알갱이', c.x, VW.y + VW.h - 12); g.textAlign = 'left';
  }
  function drawGap(st) {
    const c = vc(), band = VW.h * 0.16;
    if (st === 'grains') { for (const [u, v, ph, sz] of GRAINS) { const y = VW.y + 30 + v * (VW.h - 40); if (Math.abs(y - c.y) < band) continue; const x = VW.x + ((u + S.gt * 0.01) % 1) * VW.w; g.fillStyle = `rgba(236,239,244,${0.4 + 0.5 * Math.abs(Math.sin(S.gt * 2 + ph))})`; g.fillRect(x, y, sz, sz); } }
    else { g.fillStyle = 'rgba(160,166,178,.35)'; for (const [u, v, , sz] of GRAINS) { const y = VW.y + 30 + v * (VW.h - 40); if (Math.abs(y - c.y) < band * 1.4) continue; g.beginPath(); g.arc(VW.x + ((u + S.gt * 0.006) % 1) * VW.w, y, sz * 2.2, 0, 7); g.fill(); } }
    g.setLineDash([4, 6]); g.strokeStyle = C.soft; g.beginPath(); g.moveTo(VW.x, c.y - band); g.lineTo(VW.x + VW.w, c.y - band); g.moveTo(VW.x, c.y + band); g.lineTo(VW.x + VW.w, c.y + band); g.stroke(); g.setLineDash([]);
    const m = gapMoon(S.gt), mx = VW.x + m.u * VW.w, my = VW.y + m.v * VW.h;
    g.fillStyle = '#b9bfca'; g.beginPath(); g.arc(mx, my, Math.max(5, m.r * VW.h), 0, 7); g.fill();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('검은 틈 — 텅 비었어요', c.x, c.y - band + 16); g.textAlign = 'left';
  }
  function drawSaturnClose() {
    const c = vc(), Rs = Math.min(VW.w, VW.h) * (0.34 + S.lever * 0.25);
    g.fillStyle = C.sat; g.beginPath(); g.arc(c.x, c.y + Rs * 0.2, Rs, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(c.x, c.y + Rs * 0.2, Rs, 0, 7); g.clip();
    g.fillStyle = 'rgba(60,58,54,.22)'; for (let i = -5; i <= 5; i++) g.fillRect(c.x - Rs, c.y + Rs * 0.2 + i * Rs * 0.17, Rs * 2, Rs * 0.06);
    g.strokeStyle = 'rgba(20,20,24,.55)'; for (let i = 0; i < 6; i++) { g.lineWidth = 3 + (i % 3) * 3; g.beginPath(); g.ellipse(c.x, c.y + Rs * (0.62 + i * 0.1), Rs * 1.5, Rs * 0.3, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke(); }   // 고리 그림자 줄무늬
    const hx = c.x, hy = c.y + Rs * 0.2 - Rs * 0.8, hr = Rs * 0.2;
    g.strokeStyle = '#e1ddd2'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI * 2; const px = hx + Math.cos(a) * hr, py = hy + Math.sin(a) * hr * 0.45; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
    g.restore();
    g.fillStyle = C.ink; g.font = '700 11px system-ui'; g.textAlign = 'center'; g.fillText('육각형 구름', hx, Math.max(VW.y + 40, hy - hr * 0.6 - 8)); g.fillText('고리의 그림자', c.x, c.y + Rs * 0.2 + Rs * 0.05); g.textAlign = 'left';
  }
  function drawInside() {
    const k = ck(), c = vc();
    const [, ytop] = cs(0, LAYER), [, ybot] = cs(0, -LAYER);
    g.fillStyle = 'rgba(120,126,138,.06)'; g.fillRect(VW.x, ytop, VW.w, ybot - ytop);
    g.setLineDash([3, 5]); g.strokeStyle = C.soft; g.beginPath(); g.moveTo(VW.x, ytop); g.lineTo(VW.x + VW.w, ytop); g.moveTo(VW.x, ybot); g.lineTo(VW.x + VW.w, ybot); g.stroke(); g.setLineDash([]);
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('고리 두께 약 20 m', c.x, ytop - 6); g.textAlign = 'left'; g.fillText('흐르는 쪽 →', VW.x + VW.w - 84, ybot + 16);
    for (const q of chunksNow()) {
      let x = q.x; if (S.nudge && S.nudge.id === q.id) x += Math.sin(S.nudge.t / 1.6 * Math.PI) * 14 * S.nudge.dir;
      for (const dx of [-WRAP * k, 0, WRAP * k]) {
        const X = x + dx; if (X < VW.x - 60 || X > VW.x + VW.w + 60) continue;
        g.fillStyle = C.ice; g.beginPath(); g.arc(X, q.y, Math.max(1.5, q.r), 0, 7); g.fill();
        g.fillStyle = 'rgba(11,13,18,.55)'; g.beginPath(); g.arc(X + q.r * 0.25, q.y + q.r * 0.2, Math.max(1, q.r * 0.8), 0, 7); g.fill();   // 햇빛 반대쪽은 어둡다
      }
    }
    for (const f of S.frags) { g.fillStyle = `rgba(201,208,218,${1 - f.t / REJOIN_SEC * 0.6})`; g.fillRect(f.x, f.y, f.r, f.r); }
    // 우주선
    const sh = S.cross;
    if (sh) {
      const [sx, sy] = cs(sh.x, sh.y), sr = SHIP_R * k + 3;
      g.fillStyle = sh.hit ? '#e0a0a0' : C.hi; g.beginPath(); g.moveTo(sx, sy + sr); g.lineTo(sx - sr, sy - sr); g.lineTo(sx + sr, sy - sr); g.closePath(); g.fill();
      if (sh.hit && Math.floor(S.hitT * 6) % 2 === 0) { g.strokeStyle = '#e0a0a0'; g.lineWidth = 3; g.strokeRect(VW.x + 3, VW.y + 3, VW.w - 6, VW.h - 6); g.fillStyle = '#e0a0a0'; g.font = '800 14px system-ui'; g.textAlign = 'center'; g.fillText('경보! 선체 긁힘', c.x, VW.y + 44); g.textAlign = 'left'; }
      g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText(`높이 ${sh.y >= 0 ? '+' : ''}${sh.y.toFixed(0)} m`, sx + sr + 4, sy + 4);
      const [, yEnd] = cs(0, END_Y); g.setLineDash([2, 4]); g.strokeStyle = 'rgba(217,221,230,.3)'; g.beginPath(); g.moveTo(VW.x, yEnd); g.lineTo(VW.x + VW.w, yEnd); g.stroke(); g.setLineDash([]);
      g.fillStyle = C.dim; g.fillText('반대편', VW.x + 10, yEnd + 14);
    }
    // 집게 팔
    const b = clawBase(), t = clawTip(), mx = (b.x + t.x) / 2 - (t.y - b.y) * 0.18, my = (b.y + t.y) / 2 + (t.x - b.x) * 0.18;
    g.strokeStyle = '#7d8492'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(mx, my); g.lineTo(t.x, t.y); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = '#5b6270'; g.beginPath(); g.arc(mx, my, 6, 0, 7); g.fill();
    g.strokeStyle = dragging('claw') ? C.hi : C.knob; g.lineWidth = 3; g.beginPath(); g.arc(t.x, t.y, 9, Math.PI * 1.15, Math.PI * 1.85, true); g.stroke();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('집게 팔', b.x - 50, b.y - 8); g.textAlign = 'left';
    // 표본 통
    if (S.sample) {
      const x = VW.x + VW.w - 46, y = VW.y + 48, w = 30, h = 60, f = clamp(S.sample.t / 6, 0, 1);
      g.strokeStyle = C.line; g.lineWidth = 2; g.strokeRect(x, y, w, h);
      g.fillStyle = 'rgba(143,166,191,.55)'; g.fillRect(x + 2, y + h - 2 - f * 22, w - 4, f * 22);
      if (f < 1) { g.fillStyle = C.ice; g.beginPath(); g.arc(x + w / 2, y + h - 14 - f * 10, 10 * (1 - f) + 1, 0, 7); g.fill(); }
      g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText(f < 1 ? '녹는 중' : '물', x + w / 2, y + h + 13); g.fillText('표본 통', x + w / 2, y - 4); g.textAlign = 'left';
    }
  }
  function drawTub() {
    const c = vc(), w = Math.min(VW.w * 0.7, 360), h = Math.min(VW.h * 0.5, 200), x = c.x - w / 2, y = c.y - h / 2 + 20, water = y + h * 0.35;
    g.fillStyle = 'rgba(11,13,18,.85)'; g.fillRect(VW.x, VW.y + 24, VW.w, VW.h - 24);
    g.fillStyle = 'rgba(98,119,142,.45)'; g.fillRect(x, water, w, y + h - water);
    g.strokeStyle = C.line; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y); g.stroke();
    const r = h * 0.26, f = clamp(S.tub.t / 1.5, 0, 1), py = S.tub.floats ? (y - r) + (water + r * 0.3 - (y - r)) * f : (y - r) + (y + h - r - 3 - (y - r)) * f;
    g.fillStyle = S.tub.name === 'saturn' ? C.sat : '#62778e'; g.beginPath(); g.arc(c.x, py, r, 0, 7); g.fill();
    if (S.tub.name === 'saturn') { g.strokeStyle = 'rgba(200,204,212,.6)'; g.lineWidth = 3; g.beginPath(); g.ellipse(c.x, py, r * 1.9, r * 0.3, 0, 0, 7); g.stroke(); }
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText(`${S.tub.name === 'saturn' ? '토성' : '지구'} · 물의 ${S.tub.density}배 무게 → ${S.tub.floats ? '뜬다' : '가라앉는다'}`, c.x, y + h + 20); g.textAlign = 'left';
  }
  function drawPanel() {
    frame(PN, '조종판');
    const J = joyB(), ins = stage() === 'inside';
    g.fillStyle = '#20242d'; g.beginPath(); g.arc(J.x, J.y, J.r * 1.25, 0, 7); g.fill(); g.strokeStyle = C.soft; g.lineWidth = 2; g.stroke();
    const kx = J.x + S.joy.x * J.r, ky = J.y - S.joy.y * J.r;
    g.strokeStyle = '#7d8492'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(J.x, J.y); g.lineTo(kx, ky); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = dragging('joy') ? C.hi : C.knob; g.beginPath(); g.arc(kx, ky, J.r * 0.42, 0, 7); g.fill();
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center';
    g.fillText(ins ? '위' : '위로', J.x, J.y - J.r * 1.25 - 6); g.fillText(ins ? '아래(뚫고 내려가기)' : '아래로', J.x, J.y + J.r * 1.25 + 13);
    g.textAlign = 'right'; g.fillText(ins ? '뒤' : '토성 쪽', J.x - J.r * 1.25 - 4, J.y + 4); g.textAlign = 'left'; g.fillText(ins ? '앞' : '바깥', J.x + J.r * 1.25 + 4, J.y + 4);
    g.textAlign = 'center'; g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('조종 손잡이', J.x, J.y + J.r * 1.25 + 30); g.textAlign = 'left';
    // 다가가기 레버
    const V = lev(), ly = V.y0 + S.lever * (V.y1 - V.y0);
    g.strokeStyle = C.line; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(V.x, V.y0); g.lineTo(V.x, V.y1); g.stroke(); g.lineCap = 'butt';
    g.strokeStyle = C.soft; g.lineWidth = 1;
    for (const f of [STAGE_AT.lines, STAGE_AT.grains, STAGE_AT.inside]) { const y = V.y0 + f * (V.y1 - V.y0); g.beginPath(); g.moveTo(V.x - 14, y); g.lineTo(V.x + 14, y); g.stroke(); }
    g.fillStyle = dragging('lever') ? C.hi : C.knob; g.beginPath(); g.roundRect(V.x - 16, ly - 10, 32, 20, 6); g.fill();
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText('멀리', V.x, V.y0 - 14); g.fillText('고리 속', V.x, V.y1 + 24);
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('다가가기', V.x, V.y1 + 40); g.textAlign = 'left';
  }

  addEventListener('resize', layout); layout();
  return { S, step, draw, layout, showMission, setLever, setAim, setElev, enterInside, geom, floatIt, tapView, look: L,
    grab: id => grabChunk(id), push: (s, id) => pushChunk(id, s),
    joy(x, y) { S.joy = { x, y }; S.joyHeld = !!(x || y); },          // 시험용: 손가락 없이 쥔 채로
    run(sec) { for (let t = 0; t < sec; t += 1 / 30) step(1 / 30); } };
}
