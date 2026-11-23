/* 케이원더 · 달 만들기 — 묶음 ㄱ 손잡이 판(회색 도형). 그림은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 우주: 가운데 어린 지구, 왼쪽 레일 위의 던질 행성(위아래로 끌어 방향), 구석의 「땅에서 본 하늘」.
 * 오른쪽(아래) = 조종판: ① 크기 다이얼 ② 빠르기 레버 ③ 던지기 단추 ④ 시간 감기 다이얼.
 */
import { collide, timeline, dialYears, yearsText, skyDeg, SKY_NOW, MISSIONS, WHY, SIZE_MIN, SIZE_MAX, SIZE_FREE, SPEED_MIN, SPEED_MAX, SPEED_FREE, ANGLE_MAX, KMS_PER_V, FORM_YEARS, rng, moonRadiusKm, EARTH_KM, OUR_MOON, sizeName } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = {
    size: 0.3, angle: 20, speed: 1.1, what: 'rock', mi: 0, free: false, seed: null,
    phase: 'aim', T: 0, res: null, turns: 0, drag: null, waiting: false, lastTell: '', parts: [], dent: null, done: {},
  };
  const TURNS = 3;                                                   // 시간 다이얼 세 바퀴 = 9시간 → 45억 년
  let W = 0, H = 0, dpr = 1, ST = null, PN = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', knob: '#aeb4bf', hot: '#9a6e5e', crust: '#55585f', blue: '#62778e' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sizeMax = () => (S.free ? SIZE_FREE : SIZE_MAX), speedMax = () => (S.free ? SPEED_FREE : SPEED_MAX);
  const years = () => dialYears(S.turns / TURNS);

  // ── 자리 셈
  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12, h = H - top - bottom;
    if (W >= H * 1.15) { ST = { x: 8, y: top, w: W * 0.62 - 12, h }; PN = { x: W * 0.62 + 4, y: top, w: W * 0.38 - 12, h }; }
    else { ST = { x: 8, y: top, w: W - 16, h: h * 0.56 }; PN = { x: 8, y: top + h * 0.56 + 6, w: W - 16, h: h * 0.44 - 6 }; }
  }
  const earth = () => ({ x: ST.x + ST.w * 0.6, y: ST.y + ST.h * 0.55, R: Math.min(ST.w, ST.h) * 0.12 });
  const impR = () => earth().R * clamp(Math.cbrt(S.size), 0.2, 1.6);
  const railX = () => ST.x + Math.max(34, ST.w * 0.13);
  const reach = () => earth().R + impR();
  const railLen = () => Math.max(reach(), ST.h * 0.55 - 48 - 2 * impR());                      // 레일은 각도에 고르게(곧게) 눈금 — 폰에서도 길게
  const impHome = () => { const e = earth(); return { x: railX(), y: e.y - (S.angle / ANGLE_MAX) * railLen() }; };
  const railTop = () => earth().y - railLen();
  const pathY = () => earth().y - Math.sin(S.angle * Math.PI / 180) * reach();             // 실제로 날아가 부딪치는 줄
  const cell = (i, j) => { const cw = PN.w / 2, ch = PN.h / 2; return { x: PN.x + i * cw, y: PN.y + j * ch, w: cw, h: ch, cx: PN.x + i * cw + cw / 2, cy: PN.y + j * ch + ch / 2 - 6 }; };
  const knobR = () => Math.max(18, Math.min(PN.w / 2, PN.h / 2) * 0.27);
  const sizeDial = () => { const c = cell(0, 0); return { x: c.cx, y: c.cy, r: knobR() }; };
  const timeDial = () => { const c = cell(1, 1); return { x: c.cx, y: c.cy, r: knobR() }; };
  const fireBtn = () => { const c = cell(0, 1); return { x: c.cx, y: c.cy, r: knobR() * 0.95 }; };
  const lever = () => { const c = cell(1, 0); return { x: c.x + c.w * 0.36, y0: c.y + 22, y1: c.y + c.h - 16 }; };
  const SPEED_POW = 1.6;                                              // 레버 아래쪽(알맞은 빠르기)을 더 넓게
  const leverF = v => Math.pow((v - SPEED_MIN) / (speedMax() - SPEED_MIN), 1 / SPEED_POW);
  const leverV = f => SPEED_MIN + Math.pow(clamp(f, 0, 1), SPEED_POW) * (speedMax() - SPEED_MIN);
  const SWEEP = Math.PI * 0.75;                                       // 크기 다이얼: −135° ~ +135°
  const sizeF = () => (Math.log(S.size) - Math.log(SIZE_MIN)) / (Math.log(sizeMax()) - Math.log(SIZE_MIN));
  const geom = () => ({ sizeDial: sizeDial(), timeDial: timeDial(), fireBtn: fireBtn(), lever: lever(), imp: impHome(), railTop: railTop(), railLen: railLen(), earth: earth(), leverF });

  // ── 의뢰
  function showMission() {
    S.waiting = false; S.lastTell = '';
    if (S.res && S.res.mi !== S.mi) { S.phase = S.phase === 'done' ? 'aim' : S.phase; if (S.phase === 'aim') { S.res = null; S.parts = []; S.dent = null; S.turns = 0; } }
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 부딪쳐 보세요', '얼음 행성도 던질 수 있고, 지구보다 큰 행성도 돼요');
    ui.freeMode(S.free);
  }
  function succeed(i) {
    S.waiting = true; S.mi = i + 1; if (S.mi >= MISSIONS.length) S.free = true;
    const subs = ['빛나는 고리가 뭉쳐 달이 됐어요.', `우리 달의 ${S.res.ratio.toFixed(2)}배 — 거의 똑같아요.`, '두 달이 멀리 떨어져 있어서 둘 다 살아남았어요.'];
    ui.note('성공! ⭐', subs[i]);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    setTimeout(showMission, 8000);
  }
  function judge() {
    if (S.mi >= MISSIONS.length || S.waiting || !S.res || S.phase !== 'done' || S.res.mi !== S.mi) return;   // 지금 의뢰에서 던진 것만
    const m = MISSIONS[S.mi], st = { res: S.res, years: years() };
    if (m.ok(st)) return succeed(S.mi);
    const tell = m.tell(st);
    if (tell !== S.lastTell) { S.lastTell = tell; ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, tell + ' · 귀띔: ' + m.hint); }
  }

  // ── 던지기
  function fire() {
    if (S.phase === 'fly' || S.phase === 'after') return null;
    const seed = S.seed ?? (Date.now() % 1000003) + 1;
    const res = collide({ size: S.size, angle: S.angle, speed: S.speed, what: S.what, seed, free: S.free, jitter: S.mi >= MISSIONS.length });   // 의뢰 중에는 흔들지 않는다
    res.mi = S.mi; S.res = res; S.phase = 'fly'; S.T = 0; S.turns = 0; S.parts = []; S.dent = null; S.lastTell = '';
    S.r = rng(seed + 7); S.hitAt = null;
    ui.say((S.what === 'ice' ? '얼음 행성' : sizeName(res.size)) + `을 초속 ${res.kms} km 로 던졌어요…`);
    return res;
  }
  function resetAim() { if (S.phase === 'done') { S.phase = 'aim'; S.res = null; S.parts = []; S.dent = null; S.turns = 0; } }
  const FLY = 1.1;
  function afterLen() { return S.res.outcome === 'graze' ? 3.4 : S.res.outcome === 'runaway' ? 2.2 : 2.4; }
  function spawn() {
    const res = S.res, r = S.r, e = earth(), hy = -Math.sin(res.angleHit * Math.PI / 180);     // 부딪친 자리(지구 반지름 단위)
    const hx = -Math.sqrt(Math.max(0, 1 - hy * hy));
    S.hitAt = { x: hx, y: hy };
    const N = { crater: 26, moon: 160, twomoons: 160, merge: 30, shatter: 260, graze: 40, runaway: 60 }[res.outcome];
    for (let i = 0; i < N; i++) {
      const p = { x: hx, y: hy, life: 1 };
      if (res.outcome === 'crater') { const a = Math.atan2(hy, hx) + (r() - .5) * 1.2, s = 0.6 + r() * 0.8; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.kind = 'fall'; }
      else if (res.outcome === 'moon' || res.outcome === 'twomoons') { p.kind = 'ring'; p.ang = Math.atan2(hy, hx) + r() * 0.6; p.rad = 1.5 + r() * 1.3; p.w = 0.9 / Math.pow(p.rad, 1.5) * (0.9 + r() * 0.2); p.k = 0; p.jit = r(); }
      else if (res.outcome === 'shatter') { const a = r() * Math.PI * 2, s = 0.3 + r() * 1.6; p.x = (r() - .5) * 0.8; p.y = (r() - .5) * 0.8; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.kind = 'drift'; }
      else { const a = Math.atan2(hy, hx) + (r() - .5) * 1.6, s = 0.4 + r() * 1.2; p.vx = Math.cos(a) * s + (res.outcome === 'runaway' ? 1.2 : 0); p.vy = Math.sin(a) * s; p.kind = 'fall'; }
      S.parts.push(p);
    }
    if (res.outcome === 'crater') S.dent = { x: hx, y: hy };
  }
  function finish() {
    S.phase = 'done'; S.T = 0;
    const res = S.res;
    let t = res.says;
    if (res.outcome === 'moon') t += ` (될 달의 무게: 우리 달의 ${res.ratio.toFixed(2)}배)`;
    if (res.outcome === 'twomoons') t += ` (두 달을 합친 무게: 우리 달의 ${res.ratio.toFixed(2)}배)`;
    ui.say(t); S.done[res.outcome] = true; if (res.ocean) S.done.ocean = true;
    judge();
  }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const near = (x, y, o, extra = 14) => Math.hypot(x - o.x, y - o.y) < o.r + extra;
  cv.addEventListener('pointerdown', e => {
    const [x, y] = P(e), L = lever(), im = impHome();
    let d = null;
    if (near(x, y, sizeDial())) d = { k: 'size' };
    else if (Math.abs(x - L.x) < 34 && y > L.y0 - 14 && y < L.y1 + 14) d = { k: 'speed' };
    else if (near(x, y, fireBtn(), 6)) { fire(); return; }
    else if (near(x, y, timeDial())) d = { k: 'time', a: Math.atan2(y - timeDial().y, x - timeDial().x) };
    else if (Math.hypot(x - im.x, y - im.y) < Math.max(impR(), 22) + 12 && S.phase !== 'fly' && S.phase !== 'after') d = { k: 'aim' };
    if (!d) return;
    S.drag = d; try { cv.setPointerCapture(e.pointerId); } catch {} move(x, y);
  });
  cv.addEventListener('pointermove', e => { if (S.drag) { const [x, y] = P(e); move(x, y); } });
  const up = () => { S.drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  function move(x, y) {
    const d = S.drag;
    if (d.k === 'size') {
      const D = sizeDial(); let a = Math.atan2(x - D.x, -(y - D.y));                       // 위 = 0, 시계 방향 +
      a = clamp(a, -SWEEP, SWEEP); const f = (a + SWEEP) / (2 * SWEEP);
      setSize(Math.exp(Math.log(SIZE_MIN) + f * (Math.log(sizeMax()) - Math.log(SIZE_MIN))));
    } else if (d.k === 'speed') {
      const L = lever(), f = clamp(1 - (y - L.y0) / (L.y1 - L.y0), 0, 1);
      setSpeed(leverV(f));
    } else if (d.k === 'aim') {
      const e = earth(); setAim(clamp((e.y - y) / railLen(), 0, 1) * ANGLE_MAX);
    } else if (d.k === 'time') {
      const D = timeDial(), a = Math.atan2(y - D.y, x - D.x); let da = a - d.a;
      if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; d.a = a;
      turnTime(da / (2 * Math.PI));
    }
  }
  const flying = () => S.phase === 'fly' || S.phase === 'after';
  function setSize(m) { if (flying()) return; resetAim(); S.size = clamp(m, SIZE_MIN, sizeMax()); if (S.phase === 'aim') ui.say(`던질 행성: ${sizeName(S.size)} (지구 무게의 ${S.size < 0.1 ? S.size.toFixed(3) : S.size.toFixed(2)}배)`); }
  function setSpeed(v) { if (flying()) return; resetAim(); S.speed = clamp(v, SPEED_MIN, speedMax()); if (S.phase === 'aim') ui.say(`빠르기: 초속 ${Math.round(S.speed * KMS_PER_V)} km`); }
  function setAim(deg) { if (flying()) return; resetAim(); S.angle = clamp(deg, 0, ANGLE_MAX); if (S.phase === 'aim') ui.say(`방향: ${Math.round(S.angle)}° — ${S.angle < 25 ? '정면' : S.angle >= 70 ? '아주 스치듯' : '비스듬히'}`); }
  function turnTime(dTurns) {
    if (S.phase !== 'done') { if (S.phase === 'aim') ui.say('먼저 행성을 던져요. 부딪친 뒤에 시간을 감을 수 있어요.'); return; }
    const before = S.turns; S.turns = clamp(S.turns + dTurns, 0, TURNS);
    if (S.turns !== before) tellTime();
  }
  function setYears(y) { if (S.phase !== 'done') return; S.turns = clamp((Math.log10(y) + 3) / (Math.log10(4.5e9) + 3) * TURNS, 0, TURNS); tellTime(); }
  function tellTime() { const tl = timeline(S.res, years()); ui.say(yearsText(years()) + ' 뒤 · ' + tl.says); if (tl.formed && tl.moons.length > 0 && years() >= 1000) S.done.recede = true; if (tl.earth === 'blue') S.done.blue = true; judge(); }

  // ── 돌리기
  function step(dt) {
    if (S.phase === 'fly') {
      S.T += dt;
      const e = earth(), h = impHome(), f = S.T / FLY, x = h.x + (e.x - h.x) * f, y = h.y + (pathY() - h.y) * Math.min(1, f * 1.6);
      const dx = x - e.x, dy = y - e.y;
      if (Math.hypot(dx, dy) <= e.R + impR() || S.T >= FLY) { S.phase = 'after'; S.T = 0; spawn(); ui.say('쾅!'); }
    } else if (S.phase === 'after') {
      S.T += dt; stepParts(dt);
      if (S.T >= afterLen()) finish();
    } else if (S.phase === 'done') { S.T += dt; stepParts(dt); }
  }
  function stepParts(dt) {
    for (const p of S.parts) {
      if (p.kind === 'fall') {                                          // 지구 끌림을 받아 다시 떨어진다
        const r2 = p.x * p.x + p.y * p.y, r = Math.sqrt(r2), k = -1.2 / (r2 * r);
        if (r <= 1 && p.t > 0.1) { p.life = 0; continue; }
        p.vx += k * p.x * dt; p.vy += k * p.y * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.t = (p.t || 0) + dt;
      } else if (p.kind === 'ring') { p.ang += p.w * dt * 2.2; p.k = Math.min(1, p.k + dt * 1.2); }
      else if (p.kind === 'drift') { p.x += p.vx * dt * 0.6; p.y += p.vy * dt * 0.6; }
    }
  }

  // ── 그리기(회색 도형)
  let seedS = 5; const rnd = () => (seedS = (seedS * 16807) % 2147483647) / 2147483647;
  const BG = Array.from({ length: 120 }, () => [rnd(), rnd(), 0.4 + rnd()]);
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawStage(); drawPanel();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'left'; g.fillText(label, r.x + 10, r.y + 18); }
  const orbitPx = a => { const e = earth(), max = Math.min(ST.w * 0.4, ST.h * 0.45); return e.R + (max - e.R) * Math.log(a) / Math.log(110); };
  function earthColor() {
    if (!S.res || S.phase !== 'done') return C.hot;
    const tl = timeline(S.res, years()); return tl.earth === 'blue' ? C.blue : tl.earth === 'crust' ? C.crust : C.hot;
  }
  function drawStage() {
    frame(ST, ST.w < 420 ? '우주 — 행성을 위아래로 끌어 방향' : '우주 — 왼쪽 행성을 위아래로 끌어 방향을 정해요');
    g.save(); g.beginPath(); g.rect(ST.x, ST.y, ST.w, ST.h); g.clip();
    g.fillStyle = '#4a505c'; for (const [u, v, s] of BG) g.fillRect(ST.x + u * ST.w, ST.y + v * ST.h, s, s);
    const e = earth(), res = S.res, ph = S.phase, out = res && res.outcome;
    // 레일과 방향 눈금
    const rx = railX(), rt = railTop();
    g.strokeStyle = C.soft; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(rx, e.y); g.lineTo(rx, rt); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center';
    g.fillText('정면', rx, e.y + impR() + 16); g.fillText('스치듯', rx, rt - impR() - 8); g.textAlign = 'left';
    // 지구(합쳐지면 커진다 · 박살 나면 없다)
    let R = e.R;
    const grown = (out === 'merge' || out === 'graze') && (ph === 'done' || (ph === 'after' && S.T > (out === 'graze' ? 2.6 : 0.6)));
    if (grown) R = e.R * Math.cbrt(1 + res.size);
    const gone = out === 'shatter' && (ph === 'after' || ph === 'done');
    if (!gone) {
      g.fillStyle = earthColor(); g.beginPath(); g.arc(e.x, e.y, R, 0, 7); g.fill();
      g.strokeStyle = C.line; g.lineWidth = 1.5; g.stroke();
      if (S.dent) { g.fillStyle = '#2b2e35'; g.beginPath(); g.arc(e.x + S.dent.x * R, e.y + S.dent.y * R, R * 0.22, 0, 7); g.fill(); }
      if (res && res.ocean && ph === 'done') { g.strokeStyle = '#8fa6bf'; g.lineWidth = 3; g.beginPath(); g.arc(e.x, e.y, R - 3, 0.3, 2.6); g.stroke(); }
      g.fillStyle = C.ink; g.font = '700 11px system-ui'; g.textAlign = 'center'; g.fillText('어린 지구', e.x, e.y + R + 15); g.textAlign = 'left';
    }
    // 번쩍
    if (ph === 'after' && S.T < 0.5 && S.hitAt) { const a = (0.5 - S.T) / 0.5; g.fillStyle = `rgba(242,244,248,${a * 0.8})`; g.beginPath(); g.arc(e.x + S.hitAt.x * e.R, e.y + S.hitAt.y * e.R, e.R * (0.4 + res.flash * 0.5) * (1 + S.T * 2), 0, 7); g.fill(); }
    // 던질 행성
    const im = impHome(), ir = impR();
    let ix = im.x, iy = im.y, show = true, ia = 1;
    const py = pathY();
    if (ph === 'fly') { const f = S.T / FLY; ix = im.x + (e.x - im.x) * f; iy = im.y + (py - im.y) * Math.min(1, f * 1.6); }
    else if (ph === 'after' || ph === 'done') {
      show = false;
      if (out === 'graze' && ph === 'after' && S.T < 2.6) {                      // 스치고 나가 크게 돌아 다시 온다
        const f = S.T / 2.6, a = -Math.PI * 0.55 + f * Math.PI * 1.75, rr = e.R + ir + Math.sin(f * Math.PI) * e.R * 2.2;
        ix = e.x + Math.cos(a) * rr; iy = e.y + Math.sin(a) * rr * 0.8; show = true;
      }
      if (out === 'runaway' && ph === 'after') { ix = e.x + ir + S.T * ST.w * 0.35; iy = py - S.T * 20; show = true; ia = 0.8; }
      if (out === 'crater' && ph === 'after' && S.T < 0.2) { show = true; ix = e.x - Math.sqrt(Math.max(0, (e.R) ** 2 - (py - e.y) ** 2)); iy = py; }
      if (out === 'merge' && ph === 'after' && S.T < 0.6) { const f = S.T / 0.6; show = true; ix = e.x - (e.R + ir) * (1 - f) * Math.cos(Math.asin(clamp((e.y - py) / reach(), -1, 1))); iy = py + (e.y - py) * f; ia = 1 - f; }
    }
    if (!show && ph === 'done') { show = true; ia = 0.35; ix = im.x; iy = im.y; }                 // 다음에 던질 것이 레일에 다시
    if (show) {
      g.globalAlpha = ia; g.fillStyle = S.what === 'ice' ? '#c9d3dd' : '#9aa1ae'; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
      g.strokeStyle = S.drag && S.drag.k === 'aim' ? C.hi : C.line; g.lineWidth = 1.5; g.stroke(); g.globalAlpha = 1;
    }
    if (ph === 'aim') {
      g.setLineDash([4, 5]); g.strokeStyle = 'rgba(217,221,230,.45)'; g.lineWidth = 1.5; g.beginPath(); const hx = e.x - Math.sqrt(Math.max(0, reach() ** 2 - (py - e.y) ** 2)); g.moveTo(im.x + ir, im.y); g.lineTo(im.x + ir + Math.min(40, (hx - im.x) * 0.25), py); g.lineTo(hx, py); g.stroke(); g.setLineDash([]);
      g.strokeStyle = 'rgba(242,244,248,' + (0.35 + 0.25 * Math.sin(performance.now() / 300)) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(im.x, im.y, ir + 7, 0, 7); g.stroke();
      g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText(`방향 ${Math.round(S.angle)}°`, im.x + ir + 8, im.y - ir - 4);
    }
    // 조각
    const k = e.R;
    for (const p of S.parts) {
      if (p.life <= 0) continue;
      if (p.kind === 'ring') {
        if (ph === 'done' && timeline(res, years()).formed) continue;
        const rr = (1 + (p.rad - 1) * p.k), x = e.x + Math.cos(p.ang) * rr * k, y = e.y + Math.sin(p.ang) * rr * k * 0.35;
        if (Math.sin(p.ang) < 0 && Math.hypot(x - e.x, (y - e.y) / 0.35 * 1) < R) continue;
        g.fillStyle = `rgba(232,226,214,${0.5 + 0.5 * p.jit})`; g.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
      } else { const x = e.x + p.x * k, y = e.y + p.y * k; g.fillStyle = 'rgba(205,200,190,.85)'; g.fillRect(x - 1.5, y - 1.5, 3, 3); }
    }
    // 달(시간을 감은 뒤)
    if (res && ph === 'done') {
      const tl = timeline(res, years()), now = performance.now() / 1000;
      tl.moons.forEach((o, i) => {
        const rr = orbitPx(o.a), w = 0.6 / Math.pow(o.a / 3.5, 1.5), a = now * w + i * 2.6;
        g.strokeStyle = 'rgba(138,145,160,.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(e.x, e.y, rr, rr * 0.35, 0, 0, 7); g.stroke();
        if (!o.alive) return;
        const mr = Math.max(3, e.R * moonRadiusKm(o.mass) / EARTH_KM), x = e.x + Math.cos(a) * rr, y = e.y + Math.sin(a) * rr * 0.35;
        g.fillStyle = '#c3c8d2'; g.beginPath(); g.arc(x, y, mr, 0, 7); g.fill();
      });
      if (tl.formed) { g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText(`달 ${tl.alive}개` + (tl.moons[0] ? ` · 거리 지구 반지름의 ${Math.round(tl.moons.find(o => o.alive)?.a ?? tl.moons[0].a)}배` : ''), ST.x + 10, ST.y + ST.h - 12); }
    }
    g.restore();
    drawSky();
  }
  function drawSky() {                                                  // 구석: 땅에서 올려다본 하늘(지금 달 크기 그림자)
    const r = clamp(Math.min(ST.w, ST.h) * 0.13, 26, 48), x = ST.x + ST.w - r - 12, y = ST.y + r + 28, FOVD = 30;
    g.fillStyle = '#07080b'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = C.line; g.lineWidth = 1.5; g.stroke();
    const k = (2 * r) / FOVD;
    g.setLineDash([2, 2]); g.strokeStyle = C.dim; g.beginPath(); g.arc(x - r * 0.45, y + r * 0.45, Math.max(1.5, SKY_NOW * k / 2), 0, 7); g.stroke(); g.setLineDash([]);
    let label = '땅에서 본 하늘';
    if (S.res && S.phase === 'done') {
      const tl = timeline(S.res, years()), m = tl.moons.filter(o => o.alive).sort((a, b) => b.mass - a.mass)[0];
      if (m) { g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.fillStyle = '#c3c8d2'; g.beginPath(); g.arc(x + r * 0.15, y - r * 0.1, m.sky * k / 2, 0, 7); g.fill(); g.restore(); label = `달 ${m.sky.toFixed(1)}° · 오늘의 ${(m.sky / SKY_NOW).toFixed(0)}배`; }
    }
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText(label, x, y + r + 13); g.fillText('점선 = 오늘 달', x, y - r - 5); g.textAlign = 'left';
  }
  function knob(D, ang, label, sub, hot) {
    g.fillStyle = '#20242d'; g.beginPath(); g.arc(D.x, D.y, D.r + 6, 0, 7); g.fill();
    g.fillStyle = hot ? C.hi : C.knob; g.beginPath(); g.arc(D.x, D.y, D.r, 0, 7); g.fill();
    g.strokeStyle = '#3a404c'; g.lineWidth = 4; g.beginPath(); g.moveTo(D.x, D.y); g.lineTo(D.x + Math.sin(ang) * D.r * 0.85, D.y - Math.cos(ang) * D.r * 0.85); g.stroke();
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText(label, D.x, D.y + D.r + 22);
    if (sub) { g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText(sub, D.x, D.y + D.r + 36); }
    g.textAlign = 'left';
  }
  function drawPanel() {
    frame(PN, '조종판');
    // ① 크기 다이얼
    const D = sizeDial(), a = -SWEEP + sizeF() * 2 * SWEEP;
    g.strokeStyle = C.soft; g.lineWidth = 2; g.beginPath(); g.arc(D.x, D.y, D.r + 10, -Math.PI / 2 - SWEEP, -Math.PI / 2 + SWEEP); g.stroke();
    g.font = '600 10px system-ui'; g.textAlign = 'center';
    for (const [m, nm] of [[0.012, '달'], [0.107, '화성'], [1, '지구']].concat(S.free ? [[10, '×10']] : [])) {
      if (m > sizeMax()) continue;
      const f = (Math.log(m) - Math.log(SIZE_MIN)) / (Math.log(sizeMax()) - Math.log(SIZE_MIN)), t = -SWEEP + f * 2 * SWEEP;
      const tx = D.x + Math.sin(t) * (D.r + 20), ty = D.y - Math.cos(t) * (D.r + 20);
      g.fillStyle = C.dim; g.fillText(nm, tx, ty + 4);
    }
    knob(D, a, '크기', sizeName(S.size), S.drag && S.drag.k === 'size');
    // ② 빠르기 레버
    const L = lever(), f = leverF(S.speed), ky = L.y1 - f * (L.y1 - L.y0);
    g.strokeStyle = C.line; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(L.x, L.y0); g.lineTo(L.x, L.y1); g.stroke(); g.lineCap = 'butt';
    g.strokeStyle = '#8a91a0'; g.lineWidth = 3; g.beginPath(); g.moveTo(L.x, ky); g.lineTo(L.x + 18, ky - 10); g.stroke();
    g.fillStyle = S.drag && S.drag.k === 'speed' ? C.hi : C.knob; g.beginPath(); g.roundRect(L.x - 16, ky - 9, 32, 18, 6); g.fill();
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'left'; g.fillText('빠르게', L.x + 30, L.y0 + 4); g.fillText('느리게', L.x + 30, L.y1 + 4);
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText('빠르기', L.x + 30, (L.y0 + L.y1) / 2 - 4);
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText(`초속 ${Math.round(S.speed * KMS_PER_V)} km`, L.x + 30, (L.y0 + L.y1) / 2 + 12);
    // ③ 던지기 단추
    const B = fireBtn(), ready = S.phase === 'aim' || S.phase === 'done';
    g.fillStyle = '#20242d'; g.beginPath(); g.arc(B.x, B.y, B.r + 6, 0, 7); g.fill();
    g.fillStyle = ready ? '#c9b8b0' : '#5b6270'; g.beginPath(); g.arc(B.x, B.y, B.r, 0, 7); g.fill();
    g.fillStyle = '#1a1d24'; g.font = '800 14px system-ui'; g.textAlign = 'center'; g.fillText('던지기', B.x, B.y + 5);
    g.fillStyle = C.ink; g.font = '700 12px system-ui'; g.fillText(S.what === 'ice' ? '얼음 행성' : '바위 행성', B.x, B.y + B.r + 22); g.textAlign = 'left';
    // ④ 시간 감기 다이얼
    const T = timeDial(), on = S.phase === 'done';
    g.strokeStyle = C.soft; g.lineWidth = 2; g.beginPath(); g.arc(T.x, T.y, T.r + 10, -Math.PI / 2, -Math.PI / 2 + (S.turns / TURNS) * Math.PI * 2 * 0.999); g.stroke();
    g.globalAlpha = on ? 1 : 0.45; knob(T, S.turns * Math.PI * 2, '시간 감기', on ? yearsText(years()) + ' 뒤' : '던진 뒤에', S.drag && S.drag.k === 'time'); g.globalAlpha = 1;
  }

  addEventListener('resize', layout); layout();
  return { S, step, draw, layout, showMission, fire, finish, setSize, setSpeed, setAim, turnTime, setYears, geom, years,
    pick(w) { S.what = w === 'ice' && S.free ? 'ice' : 'rock'; resetAim(); },
    /** 던진 뒤 끝날 때까지 돌린다(시험용) */
    run(sec = 6) { for (let t = 0; t < sec && S.phase !== 'done'; t += 1 / 30) step(1 / 30); } };
}
