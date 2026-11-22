/* 케이원더 · 블랙홀 — 묶음 ㄱ 손잡이 판(회색 도형). 그림·셰이더는 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 위에서 내려다본 판: 우주선에서 끌었다 놓아 던지고, 오른쪽 거리 레버로 다가간다.
 * 오른쪽(아래) = 우주선 창밖: 검은 그림자, 원반, 휘는 뒤 별빛.
 */
import { OBJECTS, SAYS, SHIP_MIN, SHIP_MAX, DISK_IN, DISK_OUT, CAPTURE, simulate, horizon, stretchAt, farView, view, lensImages, MISSIONS, WHY, hiddenHit } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = {
    what: 'planet', shipBase: 20, mass: 1, mi: 0, free: false,
    drag: null, lever: false, flight: null, pass: null, hidden: null, lastRes: null,
    myHand: 0, probeHand: 0,
  };
  let W = 0, H = 0, dpr = 1, MAP = null, WIN = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', hole: '#000', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', warm: '#d8b48a' };

  // ── 자리 셈
  const rel = () => Math.max(SHIP_MIN, Math.min(SHIP_MAX, S.shipBase / S.mass));    // 검은 원의 배수
  const Dw = () => rel() * S.mass;                                                    // 실제 거리(기본 단위)
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    if (W >= H * 1.15) { MAP = { x: 8, y: top, w: W * 0.6 - 12, h: H - top - bottom }; WIN = { x: W * 0.6 + 4, y: top, w: W * 0.4 - 12, h: H - top - bottom }; }
    else { const h = (H - top - bottom); MAP = { x: 8, y: top, w: W - 16, h: h * 0.58 }; WIN = { x: 8, y: top + h * 0.58 + 6, w: W - 16, h: h * 0.42 - 6 }; }
  }
  const hole = () => ({ x: MAP.x + MAP.w * 0.36, y: MAP.y + MAP.h / 2 });
  const sc = () => Math.min(MAP.w * 0.5, MAP.h * 0.46) / Math.max(Dw(), 14);          // 화면 px / 기본 단위(가까이 와도 14 보다 확대하지 않아 블랙홀을 키우면 커 보인다)
  const toS = (x, y) => { const h = hole(), k = sc(); return [h.x + x * k, h.y - y * k]; };
  const shipS = () => toS(Dw(), 0);
  const leverX = () => MAP.x + MAP.w - 30, leverY = [() => MAP.y + MAP.h * 0.16, () => MAP.y + MAP.h * 0.84];
  const knobY = () => leverY[0]() + (leverY[1]() - leverY[0]()) * (1 - (S.shipBase - SHIP_MIN) / (SHIP_MAX - SHIP_MIN));
  const winC = () => ({ x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2 + 8, R: Math.min(WIN.w, WIN.h - 30) / 2 - 6 });
  const FOV = 0.85;                                                                   // 창 반지름이 보여 주는 각(라디안)

  // ── 의뢰
  function showMission() {
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 던져 보세요', '블랙홀을 키워 볼 수도 있어요');
    if (S.mi === 2 && !S.hidden) {
      const L = lensImages(0, rel(), S.mass);
      S.hidden = { beta: 0.06 * L.thetaE, dir: Math.random() * Math.PI * 2 };
    }
    ui.freeMode(S.free);
  }
  function succeed(i, sub) {
    S.mi = i + 1; if (S.mi >= MISSIONS.length) S.free = true;
    ui.note('성공! ⭐', sub);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    setTimeout(showMission, 8000);
  }
  function judge(res) {
    if (S.mi > 1) return;
    const m = MISSIONS[S.mi];
    if (m.ok(res)) succeed(S.mi, S.mi === 0 ? '세 바퀴! 옆으로, 알맞은 세기로 던지면 돌아요.' : `가장 가까울 때 탐사선 시계가 ${res.minClock.toFixed(2)}배 빠르기였어요.`);
    else ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, m.tell(res) + ' · 귀띔: ' + m.hint);
  }

  // ── 던지기
  function throwIt(aim, power) {
    const res = simulate({ what: S.what, aim, power, shipDist: rel(), mass: S.mass }, { maxTurns: S.what === 'probe' && S.mi === 1 ? 1.2 : 3 });
    S.lastRes = res; S.flight = { res, i: 0, f: 0, freeze: null, done: false, trail: [] };
    S.myHand = 0; S.probeHand = 0;
    ui.say(OBJECTS[S.what].name + '을 던졌어요…');
    return res;
  }
  function finishFlight() {
    const F = S.flight, res = F.res; F.done = true;
    let t = SAYS[res.outcome];
    if (res.outcome === 'orbit') t += ` (${res.turns.toFixed(1)}바퀴)`;
    if (res.freezes) t = SAYS.plunge.split('.')[0] + '. ' + SAYS.freeze;
    if (OBJECTS[res.what].clock && res.outcome === 'orbit') t += ` 탐사선 시계는 가장 가까울 때 내 시계의 ${res.minClock.toFixed(2)}배 빠르기.`;
    if (res.outcome === 'fling') t += ` (${Math.round(res.deflect * 180 / Math.PI)}° 꺾임)`;
    ui.say(t);
    judge(res);
  }

  // ── 뒤로 별 지나가게(표 9)
  function passBehind() { S.pass = { t: 0, T: 8 }; ui.say('블랙홀 뒤로 먼 별 하나가 지나가요…'); }
  function grow() {
    S.mass = S.mass === 1 ? 2 : S.mass === 2 ? 4 : 1;
    const m = S.mass, edge = stretchAt(horizon(m), m, OBJECTS.star.size), edge1 = stretchAt(horizon(1), 1, OBJECTS.star.size);
    ui.say(`블랙홀 ${m}배 — 검은 원이 ${m}배로 커졌어요. ` + (m > 1 ? `그런데 가장자리에서 늘어나는 건 ${edge.toFixed(1)}배로, 처음(${edge1.toFixed(0)}배)보다 순해요.` : '처음 크기로 돌아왔어요.'));
    ui.growLabel(m);
  }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    const [x, y] = P(e), [sx, sy] = shipS();
    if (Math.abs(x - leverX()) < 30 && y > leverY[0]() - 24 && y < leverY[1]() + 24) { S.lever = true; setLever(y); cv.setPointerCapture(e.pointerId); return; }
    if (Math.hypot(x - sx, y - sy) < 70) { S.drag = { x0: sx, y0: sy, x, y }; cv.setPointerCapture(e.pointerId); return; }
    const c = winC();
    if (S.mi === 2 && S.hidden && Math.hypot(x - c.x, y - c.y) < c.R) {
      const k = FOV / c.R, tap = [(x - c.x) * k, -(y - c.y) * k];
      if (hiddenHit({ tap, hidden: S.hidden, shipDist: rel(), mass: S.mass }).hit) { S.hidden.found = true; succeed(2, '휜 빛의 고리 — 그 뒤에 별이 숨어 있었어요.'); }
      else ui.note('의뢰 3 · ' + MISSIONS[2].say, MISSIONS[2].tell({ tap, hidden: S.hidden, shipDist: rel(), mass: S.mass }) + ' · 귀띔: ' + MISSIONS[2].hint);
    }
  });
  cv.addEventListener('pointermove', e => { const [x, y] = P(e); if (S.lever) setLever(y); else if (S.drag) { S.drag.x = x; S.drag.y = y; } });
  const up = () => {
    if (S.lever) { S.lever = false; }
    if (S.drag) { const d = dragAim(); S.drag = null; if (d.power > 0.03) throwIt(d.aim, d.power); }
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { S.drag = null; S.lever = false; });
  function dragAim() {
    const D = S.drag, wx = D.x - D.x0, wy = -(D.y - D.y0), len = Math.hypot(wx, wy);
    return { aim: Math.atan2(wy, -wx), power: Math.min(1, len / (Math.min(MAP.w, MAP.h) * 0.42)), len };
  }
  let leverSaid = 0;
  function setLever(y) {
    const f = 1 - (y - leverY[0]()) / (leverY[1]() - leverY[0]()), old = S.shipBase;
    S.shipBase = Math.round(SHIP_MIN + Math.max(0, Math.min(1, f)) * (SHIP_MAX - SHIP_MIN));
    if (S.shipBase < old && performance.now() - leverSaid > 1500) { leverSaid = performance.now(); ui.say('다가갈수록 뒤의 별들이 더 심하게 휘어요. 원반의 뒤쪽이 검은 원 위아래로 접혀 보여요.'); }
  }

  // ── 돌리기
  function step(dt) {
    const F = S.flight;
    if (F && !F.done) {
      const p = F.res.path;
      if (F.freeze) {                                                                   // 멀리서 본 가장자리: 끝없이 느려진다
        const z = F.freeze; z.t += dt;
        const v = farView(z.r, S.mass).crawl; z.r = Math.max(horizon(S.mass) * 1.0000001, z.r - v * dt * 2.2 * S.mass);
        if (z.t > 6) finishFlight();
      } else {
        const cur = p[Math.min(F.i, p.length - 1)];
        F.f += dt * (cur.spiral ? 40 : 600);
        while (F.f >= 1 && F.i < p.length - 1) { F.f -= 1; F.i++; F.trail.push(p[F.i]); if (F.trail.length > 900) F.trail.shift(); }
        const q = p[F.i];
        if (F.res.freezes && q.r < CAPTURE * horizon(S.mass)) F.freeze = { t: 0, r: q.r, a: Math.atan2(q.y, q.x) };
        else if (F.i >= p.length - 1) finishFlight();
      }
      const now = F.freeze ? farView(F.freeze.r, S.mass).clock / farView(Dw(), S.mass).clock : p[F.i].clock;
      S.myHand += dt; S.probeHand += dt * now; F.clockNow = now;
    }
    if (S.pass) { S.pass.t += dt; const b = passBeta(); const L = lensImages(b, rel(), S.mass); if (L.kind !== S.pass.kind) { S.pass.kind = L.kind; ui.say('블랙홀 뒤로 먼 별 하나가 지나가요 — ' + L.says); } if (S.pass.t > S.pass.T) S.pass = null; }
  }
  const passBeta = () => { const L = lensImages(0, rel(), S.mass), f = S.pass.t / S.pass.T; return (1 - 2 * f) * 2.6 * L.thetaE; };

  // ── 그리기(회색 도형)
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const STARS = Array.from({ length: 170 }, () => ({ beta: Math.sqrt(rnd()) * FOV * 1.35, dir: rnd() * Math.PI * 2, m: 0.6 + rnd() * 1.2 }));
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawMap(); drawWindow();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.fillText(label, r.x + 10, r.y + 18); }
  function drawMap() {
    frame(MAP, '위에서 본 판 — 우주선에서 끌었다 놓아 던지기');
    g.save(); g.beginPath(); g.rect(MAP.x, MAP.y, MAP.w, MAP.h); g.clip();
    const h = hole(), k = sc(), m = S.mass, RH = horizon(m) * k;
    // 원반(회색 띠) · 못 돌아오는 선 · 검은 원
    g.fillStyle = 'rgba(160,166,178,.12)'; g.beginPath(); g.arc(h.x, h.y, DISK_OUT * m * k, 0, Math.PI * 2); g.moveTo(h.x + DISK_IN * m * k, h.y); g.arc(h.x, h.y, DISK_IN * m * k, 0, Math.PI * 2, true); g.fill('evenodd');
    g.setLineDash([3, 4]); g.strokeStyle = C.soft; g.beginPath(); g.arc(h.x, h.y, CAPTURE * RH, 0, 7); g.stroke(); g.setLineDash([]);
    g.fillStyle = C.hole; g.strokeStyle = C.line; g.lineWidth = 1.5; g.beginPath(); g.arc(h.x, h.y, Math.max(2, RH), 0, 7); g.fill(); g.stroke();
    // 날아가는 것
    const F = S.flight;
    if (F) {
      const torn = F.res.outcome === 'torn', tearI = torn ? F.res.path.findIndex(p => p.r <= F.res.tearAt.r + 1e-9) : -1;
      g.lineWidth = 1.5; g.strokeStyle = C.soft; g.beginPath();
      F.trail.forEach((p, i) => { const [x, y] = toS(p.x, p.y); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      if (torn && F.i >= tearI) {                                                       // 찢긴 별: 긴 빛줄기
        g.lineWidth = 5; g.strokeStyle = 'rgba(220,224,232,.55)'; g.beginPath();
        const st = F.res.path.slice(Math.max(tearI, F.i - 160), F.i + 1); st.forEach((p, i) => { const [x, y] = toS(p.x, p.y); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      } else {
        let q = F.res.path[F.i], x, y, a, alpha = 1, red = 0;
        if (F.freeze) { const z = F.freeze, v = farView(z.r, m); [x, y] = toS(Math.cos(z.a) * z.r, Math.sin(z.a) * z.r); a = z.a; alpha = Math.max(0.04, Math.pow(v.dim, 0.25)); red = Math.min(1, (v.redden - 1) / 6); q = { stretch: 1 }; }
        else { [x, y] = toS(q.x, q.y); a = Math.atan2(q.y, q.x); }
        if (!(F.done && (F.res.outcome === 'plunge' || F.res.outcome === 'spiral') && !F.freeze)) drawThing(F.res.what, x, y, -a, q.stretch, alpha, red);
        if (!F.freeze && q.stretch > 1.3 && !F.done) { g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('늘어남 ×' + q.stretch.toFixed(1), x + 12, y - 12); }
      }
    }
    // 우주선 · 끌기 화살
    const [sx, sy] = shipS();
    g.fillStyle = '#9aa1ae'; g.beginPath(); g.moveTo(sx - 12, sy); g.lineTo(sx + 10, sy - 9); g.lineTo(sx + 10, sy + 9); g.closePath(); g.fill();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText('내 우주선', sx - 22, sy + 24);
    if (S.drag) {
      const d = dragAim(); g.strokeStyle = C.hi; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy); g.lineTo(S.drag.x, S.drag.y); g.stroke();
      g.fillStyle = C.hi; g.font = '800 13px system-ui'; g.fillText('세기 ' + Math.round(d.power * 100), S.drag.x + 10, S.drag.y - 8);
    } else if (!F) { g.strokeStyle = 'rgba(242,244,248,' + (0.35 + 0.25 * Math.sin(performance.now() / 300)) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.stroke(); }
    // 거리 레버
    const lx = leverX(), y0 = leverY[0](), y1 = leverY[1](), ky = knobY();
    g.strokeStyle = C.line; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx, y0); g.lineTo(lx, y1); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = S.lever ? C.hi : '#aeb4bf'; g.beginPath(); g.roundRect(lx - 16, ky - 10, 32, 20, 6); g.fill();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center';
    g.fillText('멀리', lx, y0 - 10); g.fillText('가까이', lx, y1 + 18); g.fillText('거리 ' + Math.round(rel()) + '배', lx, y1 + 32); g.textAlign = 'left';
    // 시계 둘(탐사선일 때)
    if (F && OBJECTS[F.res.what].clock) { clock(MAP.x + 46, MAP.y + MAP.h - 46, S.myHand, '내 시계'); clock(MAP.x + 128, MAP.y + MAP.h - 46, S.probeHand, '탐사선 ' + (F.clockNow ?? 1).toFixed(2) + '배'); }
    if (S.mass > 1) { g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText(`블랙홀 ${S.mass}배 · 가장자리 늘어남 ×${stretchAt(horizon(S.mass), S.mass, 1).toFixed(1)}`, h.x - 60, h.y + RH + 20); }
    g.restore();
  }
  function drawThing(what, x, y, a, stretch, alpha, red) {
    g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha = alpha;
    const s = Math.min(stretch, 12), base = what === 'star' ? 8 : what === 'planet' ? 6 : 4;
    g.scale(Math.sqrt(s), 1 / Math.sqrt(Math.sqrt(s)));
    const col = red ? `rgb(${200},${Math.round(200 - 150 * red)},${Math.round(205 - 170 * red)})` : what === 'star' ? '#eceff4' : '#b9bfca';
    g.fillStyle = col;
    if (what === 'ship') { g.beginPath(); g.moveTo(-base, -base); g.lineTo(base * 1.4, 0); g.lineTo(-base, base); g.closePath(); g.fill(); }
    else if (what === 'probe') { g.fillRect(-base, -base, base * 2, base * 2); }
    else { g.beginPath(); g.arc(0, 0, base, 0, 7); g.fill(); }
    g.restore();
  }
  function clock(x, y, t, label) {
    g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 26, 0, 7); g.stroke();
    const a = t * Math.PI * 2 / 4 - Math.PI / 2; g.strokeStyle = C.hi; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 21, y + Math.sin(a) * 21); g.stroke();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText(label, x, y + 42); g.textAlign = 'left';
  }
  function drawWindow() {
    frame(WIN, '우주선 창밖');
    const c = winC(), k = c.R / FOV, V = view(rel(), S.mass);
    g.save(); g.beginPath(); g.arc(c.x, c.y, c.R, 0, 7); g.clip(); g.fillStyle = '#050608'; g.fillRect(c.x - c.R, c.y - c.R, c.R * 2, c.R * 2);
    const dot = (th, dir, r) => { const x = c.x + Math.cos(dir) * th * k, y = c.y - Math.sin(dir) * th * k; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    // 뒤 별들(휘어 보인 자리)
    g.fillStyle = '#c9ced8';
    for (const s of STARS) {
      const L = lensImages(s.beta, rel(), S.mass);
      for (const [j, im] of L.images.entries()) {
        const th = Math.abs(im.at), dir = im.at >= 0 ? s.dir : s.dir + Math.PI;
        if (th <= V.shadow * 1.02 || th > FOV * 1.05 || (j === 1 && im.bright < 0.03)) continue;
        dot(th, dir, Math.min(3.2, s.m * Math.sqrt(Math.min(im.bright, 6)) * 0.9));
      }
    }
    // 원반: 납작한 띠 + 위아래로 접힌 뒤쪽
    const din = Math.atan(DISK_IN * S.mass / V.D), dout = Math.atan(DISK_OUT * S.mass / V.D), tilt = 0.16;
    const band = (fromA, toA) => { g.beginPath(); g.ellipse(c.x, c.y, dout * k, dout * k * tilt, 0, fromA, toA); g.ellipse(c.x, c.y, din * k, din * k * tilt, 0, toA, fromA, true); g.closePath(); g.fill(); };
    g.fillStyle = 'rgba(170,176,188,.45)'; band(Math.PI, Math.PI * 2);                    // 뒤쪽 반(그림자 뒤)
    g.strokeStyle = 'rgba(190,196,206,.55)'; g.lineWidth = Math.max(2, V.fold * k * 0.35);
    g.beginPath(); g.ellipse(c.x, c.y, (V.shadow * 1.15 + V.fold * 0.35) * k, (V.shadow * 1.04 + V.fold * 0.55) * k, 0, Math.PI, Math.PI * 2); g.stroke();   // 위로 접힘
    g.lineWidth = Math.max(1, V.fold * k * 0.18);
    g.beginPath(); g.ellipse(c.x, c.y, (V.shadow * 1.08 + V.fold * 0.2) * k, (V.shadow * 1.02 + V.fold * 0.25) * k, 0, 0, Math.PI); g.stroke();                 // 아래로 접힘
    g.fillStyle = '#000'; g.beginPath(); g.arc(c.x, c.y, V.shadow * k, 0, 7); g.fill();
    g.fillStyle = 'rgba(170,176,188,.55)'; band(0, Math.PI);                              // 앞쪽 반(그림자 앞)
    // 뒤로 지나가는 별(표 9)
    if (S.pass) {
      const L = lensImages(passBeta(), rel(), S.mass); g.fillStyle = C.hi; g.strokeStyle = C.hi;
      if (L.kind === 'ring') { g.lineWidth = 3; g.beginPath(); g.arc(c.x, c.y, L.thetaE * k, 0, 7); g.stroke(); }
      else for (const [j, im] of L.images.entries()) { if (j === 1 && L.kind === 'one') continue; const th = Math.abs(im.at); if (th > V.shadow) dot(th, im.at >= 0 ? 0 : Math.PI, Math.min(6, 2.5 + Math.sqrt(im.bright) * 2)); }
    }
    // 숨은 별(의뢰 3)
    if (S.mi === 2 && S.hidden) {
      const L = lensImages(S.hidden.beta, rel(), S.mass); g.strokeStyle = 'rgba(236,239,244,.8)';
      if (L.kind === 'ring') { g.lineWidth = 2; g.beginPath(); g.arc(c.x, c.y, L.thetaE * k, 0, 7); g.stroke(); }
      else for (const im of L.images) { const th = Math.abs(im.at), d = im.at >= 0 ? S.hidden.dir : S.hidden.dir + Math.PI; g.lineWidth = 2.5; g.beginPath(); g.arc(c.x, c.y, th * k, -d - 0.35, -d + 0.35); g.stroke(); }
    }
    g.restore();
    g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.arc(c.x, c.y, c.R, 0, 7); g.stroke();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center';
    g.fillText(`검은 그림자 ${(V.shadow * 2 * 180 / Math.PI).toFixed(0)}° · 접힌 원반 ${(V.fold * 180 / Math.PI).toFixed(0)}°`, c.x, WIN.y + WIN.h - 8); g.textAlign = 'left';
  }

  addEventListener('resize', layout); layout();
  return { S, step, draw, showMission, throwIt, passBehind, grow, finishFlight, rel, layout,
    pick(w) { S.what = w; }, setShip(d) { S.shipBase = d; } };
}
