/* 케이원더 · 점점 작아지기 — 묶음 ㄱ 손잡이 판(회색 도형). 그림은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 둥근 들여다보기 창: 줄어든 만큼 보인다. 오른쪽 가장자리 = 줄어들기·커지기 휠(위로 굴리면 작아짐).
 *   창 테두리의 손전등 = 끌면 비추는 각이 바뀌고, 톡 누르면 켜고 끈다. 창 안을 누르면 나비 비늘을 뒤집거나 벨크로를 붙였다 뗀다.
 * 오른쪽(아래) = 책상 위: 들어갈 곳을 고른다.
 */
import { OBJECTS, DESK, SAYS, MISSIONS, WHY, view, stageAt, velcro, tardiStep, tardiNew, tardiSays, zMax, sheen, field, TARDI_Z } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = {
    obj: 'butterfly', z: 0, intro: true, light: true, lightA: -0.25, flipped: false, velcro: 'apart', tardi: tardiNew(),
    mi: 0, free: false, waiting: false, found: new Set(), msg: null, drag: null, flash: 0, t: 0, v: null,
  };
  let W = 0, H = 0, dpr = 1, VW = null, DK = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    if (W >= H * 1.15) { VW = { x: 8, y: top, w: W * 0.62 - 12, h: H - top - bottom }; DK = { x: W * 0.62 + 4, y: top, w: W * 0.38 - 12, h: H - top - bottom }; }
    else { const h = H - top - bottom; VW = { x: 8, y: top, w: W - 16, h: h * 0.64 }; DK = { x: 8, y: top + h * 0.64 + 6, w: W - 16, h: h * 0.36 - 6 }; }
  }
  /** 자리: 창(동그라미) · 휠 · 손전등 · 책상 위 물건 */
  function geom() {
    const cx = VW.x + (VW.w - 56) / 2, cy = VW.y + VW.h / 2 + 14, R = Math.max(40, Math.min((VW.w - 56) / 2 - 30, VW.h / 2 - 54));
    const wheel = { x: VW.x + VW.w - 44, y: cy - R * 0.85, w: 32, h: R * 1.7 };
    const lamp = { x: cx + Math.sin(S.lightA) * (R + 18), y: cy - Math.cos(S.lightA) * (R + 18) };
    const list = DESK.filter(o => !OBJECTS[o].free || S.free), cols = DK.w > DK.h ? 4 : 2, rows = Math.ceil(list.length / cols);
    const cw = (DK.w - 16) / cols, ch = (DK.h - 30) / rows;
    const desk = list.map((o, i) => ({ obj: o, x: DK.x + 8 + (i % cols) * cw, y: DK.y + 24 + Math.floor(i / cols) * ch, w: cw, h: ch }));
    return { cx, cy, R, wheel, lamp, desk };
  }

  // ── 상태 → 글
  const state = (photo = false) => ({ obj: S.obj, z: S.z, light: S.light, flipped: S.flipped, photo });
  const tell = (text, sec = 4) => { S.msg = { text, until: S.t + sec }; ui.say(text); lastSay = text; };
  let lastSay = '';
  function refresh() {
    S.v = view(S.obj, S.z, { light: S.light, lightA: S.lightA, flipped: S.flipped, free: S.free });
    if (!S.v.dark && S.v.key) S.found.add(S.obj + ':' + S.v.key);
    let t = S.v.says;
    if (S.obj === 'moss' && S.v.stage === 3 && !S.v.dark && !S.v.deep && S.z <= TARDI_Z[1] + 0.5 && (S.tardi.form !== 'walk' || !S.tardi.wet || S.tardi.revived)) t = tardiSays(S.tardi);
    if (S.msg && S.t < S.msg.until) t = S.msg.text;
    if (t !== lastSay) { lastSay = t; ui.say(t); }
    ui.tools && ui.tools({ velcro: S.obj === 'velcro', tardi: S.free && S.obj === 'moss', wet: S.tardi.wet });
  }

  // ── 손잡이
  function setZ(z) { S.intro = false; const old = S.z; S.z = clamp(z, 0, zMax(S.free)); if (S.flipped && stageAt(S.obj, S.z) < 2) S.flipped = false; if (S.z !== old) S.msg = null; refresh(); if (S.mi === 1 && S.flipped && MISSIONS[1].ok(state())) judge(state()); }
  const wheel = dz => setZ(S.z + dz);
  function enter(o) {
    if (!OBJECTS[o] || (OBJECTS[o].free && !S.free)) return;
    S.intro = false; S.obj = o; S.z = 0; S.flipped = false; S.velcro = 'apart'; S.tardi = tardiNew(); S.msg = null;
    refresh(); tell(OBJECTS[o].place + josaRo(OBJECTS[o].place) + ' 들어가요. 휠을 위로 굴려 작아져요.', 2.5);
  }
  /** 「로/으로」: 받침이 없거나 ㄹ 받침이면 「로」 */
  const josaRo = w => { const c = w.charCodeAt(w.length - 1) - 0xAC00, j = c >= 0 && c < 11172 ? c % 28 : 0; return j === 0 || j === 8 ? '로' : '으로'; };
  function setLight(on, angle) {
    const was = S.light;
    if (on !== undefined) S.light = !!on; if (angle !== undefined) S.lightA = clamp(angle, -1.4, 1.4); S.msg = null; refresh();
    if (S.mi === 1 && S.flipped && S.light && !was) judge(state());       // 뒤집어 두고 손전등을 켜도 밝혀진 것
  }
  function flip() {
    if (S.obj !== 'butterfly') return;
    if (stageAt('butterfly', S.z) < 2) { tell(SAYS.flipEarly); return; }
    S.flipped = !S.flipped; S.msg = null; refresh();
    if (S.flipped) judge(state(false));
  }
  function velcroAct() {
    if (S.obj !== 'velcro') return;
    const r = velcro(S.velcro, stageAt('velcro', S.z)); S.velcro = r.state; tell(r.says);
  }
  function dry() { if (S.obj === 'moss') { S.tardi = { ...S.tardi, wet: false, revived: false }; refresh(); } }
  function wet() { if (S.obj === 'moss') { S.tardi = { ...S.tardi, wet: true }; refresh(); } }
  function photo() {
    S.flash = 1;
    const v = S.v, s = state(true);
    tell(v.dark ? '찰칵! 너무 어두워서 까맣게 찍혔어요.' : '찰칵! ' + v.find);
    judge(s);
  }

  // ── 의뢰
  function showMission() {
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 작아져 보세요', '더 작아질 수 있어요 · 꽃가루도 열렸어요 · 물곰을 말려 볼 수도 있어요');
    ui.freeMode(S.free);
  }
  function succeed(i, sub) {
    S.mi = i + 1; S.waiting = true; if (S.mi >= MISSIONS.length) { S.free = true; ui.freeMode(true); }
    ui.note('성공! ⭐', sub);
    const w = MISSIONS[i].why;
    setTimeout(() => ui.why(w === 'all' ? WHY.join('<br>') : WHY[w]), 1200);
    setTimeout(() => { S.waiting = false; showMission(); }, 8000);         // 8초 동안은 「성공!」을 다른 글이 덮지 않는다
  }
  function judge(s) {
    if (S.mi >= MISSIONS.length || S.waiting) return;
    const m = MISSIONS[S.mi];
    if (S.mi === 1 && s.photo && !s.flipped) { ui.note('의뢰 2 · ' + m.say, m.tell(s) + ' · 귀띔: ' + m.hint); return; }
    if (S.mi !== 1 && !s.photo) return;
    if (m.ok(s)) succeed(S.mi, S.mi === 0 ? '물곰 찰칵! 0.3mm — 깨알보다 작아요.' : S.mi === 1 ? '뒤집으니 갈색 — 파랑은 비늘의 가는 골이 만든 빛이에요.' : '소금 알갱이 하나하나가 주사위 — 누가 깎지 않았어요.');
    else ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, m.tell(s) + ' · 귀띔: ' + m.hint);
  }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => {
    if (S.drag) return;                                  // 손가락 하나가 휠·손전등을 잡고 있으면 다른 손가락은 무시
    S.intro = false;
    const [x, y] = P(e), G = geom(), cap = () => { try { cv.setPointerCapture(e.pointerId); } catch {} };
    const wh = G.wheel;
    if (x > wh.x - 14 && x < wh.x + wh.w + 14 && y > wh.y - 10 && y < wh.y + wh.h + 10) { S.drag = { kind: 'wheel', id: e.pointerId, y }; cap(); return; }
    if (Math.hypot(x - G.lamp.x, y - G.lamp.y) < 30) { S.drag = { kind: 'lamp', id: e.pointerId, x, y, moved: 0 }; cap(); return; }
    const d = G.desk.find(q => x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h);
    if (d) { enter(d.obj); return; }
    if (Math.hypot(x - G.cx, y - G.cy) < G.R) { if (S.obj === 'butterfly') flip(); else if (S.obj === 'velcro') velcroAct(); }
  });
  cv.addEventListener('pointermove', e => {
    if (!S.drag || e.pointerId !== S.drag.id) return;
    const [x, y] = P(e), G = geom();
    if (S.drag.kind === 'wheel') { wheel(-(y - S.drag.y) / 110); S.drag.y = y; }
    else { S.drag.moved += Math.hypot(x - S.drag.x, y - S.drag.y); S.drag.x = x; S.drag.y = y; if (S.drag.moved > 6) setLight(undefined, Math.atan2(x - G.cx, -(y - G.cy))); }
  });
  const up = e => { if (!S.drag || e.pointerId !== S.drag.id) return; if (S.drag.kind === 'lamp' && S.drag.moved <= 6) setLight(!S.light); S.drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', e => { if (S.drag && e.pointerId === S.drag.id) S.drag = null; });
  cv.addEventListener('wheel', e => { e.preventDefault(); wheel(-e.deltaY / 600); }, { passive: false });

  function step(dt) {
    S.t += dt; S.flash = Math.max(0, S.flash - dt * 3);
    if (S.intro) { S.z = Math.min(1.3, S.z + dt * 0.3); if (S.z >= 1.3) S.intro = false; }   // 들어오면 손대지 않아도 나비 날개 속으로 천천히
    if (S.obj === 'moss') S.tardi = tardiStep(S.tardi, dt);
    refresh();
  }

  // ── 그리기(회색 도형)
  const rnd = seed => { let a = seed; return () => (a = (a * 16807) % 2147483647) / 2147483647; };
  const PTS = {}; const pts = (key, n) => PTS[key] || (PTS[key] = (() => { const r = rnd(key.length * 977 + n); return Array.from({ length: n }, () => [r() * 2 - 1, r() * 2 - 1, r(), r()]); })());
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawView(); drawDesk();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.fillText(label, r.x + 10, r.y + 18); }
  const fmtField = mm => (mm >= 10 ? (mm / 10).toFixed(mm >= 100 ? 0 : 1) + 'cm' : mm >= 1 ? mm.toFixed(1) + 'mm' : mm >= 0.01 ? mm.toFixed(2) + 'mm' : (mm * 1000).toFixed(mm >= 0.001 ? 1 : 2) + '마이크로미터');
  function drawView() {
    const v = S.v || view(S.obj, S.z, {}); frame(VW, OBJECTS[S.obj].place + ' — 보이는 너비 ' + fmtField(v.field));
    const G = geom(), { cx, cy, R } = G;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); g.fillStyle = '#14171e'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    const st = OBJECTS[S.obj].stages;
    for (const b of v.blend) { g.save(); g.globalAlpha = b.a; const s = 10 ** (v.z - st[b.i].z); drawStage(S.obj, b.i, s, cx, cy, R); g.restore(); }
    // 빛: 손전등 쪽이 밝고 반대쪽이 어둡다. 꺼져 있으면 작아질수록 캄캄
    const lx = cx + Math.sin(S.lightA) * R, ly = cy - Math.cos(S.lightA) * R;
    if (S.light) { const gr = g.createLinearGradient(lx, ly, 2 * cx - lx, 2 * cy - ly); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gr; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    else { g.fillStyle = `rgba(0,0,0,${clamp(0.35 + 0.3 * v.z, 0, 0.94)})`; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    if (v.deep) { g.fillStyle = 'rgba(20,23,30,.55)'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    if (S.flash > 0) { g.fillStyle = `rgba(255,255,255,${S.flash * 0.7})`; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    g.restore();
    g.strokeStyle = C.line; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
    // 크기 자
    const ru = v.ruler, len = clamp(ru.frac * 2 * R, 4, R * 1.6), rx = cx - R * 0.8, ry = cy + R - 26;
    const rt = ru.name + (ru.frac * 2 * R > R * 1.6 ? '(화면보다 커요)' : ''); g.font = '700 11px system-ui';
    g.fillStyle = 'rgba(11,13,18,.75)'; g.fillRect(rx - 6, ry - 18, Math.max(len, g.measureText(rt).width) + 12, 32);
    g.fillStyle = C.hi; g.fillRect(rx, ry, len, 4); g.fillRect(rx, ry - 4, 2, 12); g.fillRect(rx + len - 2, ry - 4, 2, 12);
    g.fillText(rt, rx, ry - 6);
    drawWheel(G.wheel); drawLamp(G);
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'right'; g.fillText('찾은 것 ' + S.found.size + '/' + (S.free ? 24 : 21), VW.x + VW.w - 10, VW.y + 18); g.textAlign = 'left';
  }
  function drawWheel(w) {                               // 현미경 초점 바퀴처럼 홈이 난 휠 — 돌린 만큼 홈이 흐른다
    g.fillStyle = '#20242c'; g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.roundRect(w.x, w.y, w.w, w.h, 12); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.roundRect(w.x, w.y, w.w, w.h, 12); g.clip();
    const off = (S.z * 90) % 14;
    for (let y = w.y - 14 + off; y < w.y + w.h + 14; y += 14) { const f = Math.sin(Math.PI * clamp((y - w.y) / w.h, 0, 1)); g.strokeStyle = `rgba(174,180,191,${0.25 + 0.6 * f})`; g.lineWidth = 2; g.beginPath(); g.moveTo(w.x + 5, y); g.lineTo(w.x + w.w - 5, y); g.stroke(); }
    g.restore();
    const fz = S.z / zMax(S.free), my = w.y + w.h * (1 - fz);
    g.fillStyle = S.drag && S.drag.kind === 'wheel' ? C.hi : '#aeb4bf'; g.beginPath(); g.moveTo(w.x - 4, my); g.lineTo(w.x - 12, my - 6); g.lineTo(w.x - 12, my + 6); g.closePath(); g.fill();
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('작게', w.x + w.w / 2, w.y - 6); g.fillText('크게', w.x + w.w / 2, w.y + w.h + 14);
    g.fillText('×' + fmtMag(10 ** S.z), w.x + w.w / 2, w.y + w.h + 28); g.textAlign = 'left';
  }
  const fmtMag = m => (m >= 10000 ? Math.round(m / 10000) + '만' : m >= 1000 ? (m / 1000).toFixed(1).replace('.0', '') + '천' : Math.round(m) + '');
  function drawLamp(G) {                                // 손전등: 창 테두리 밖에서 가운데를 겨눈다
    const { lamp, cx, cy } = G, a = Math.atan2(cy - lamp.y, cx - lamp.x);
    g.save(); g.translate(lamp.x, lamp.y); g.rotate(a);
    g.fillStyle = S.light ? '#c9ced8' : '#5b6270'; g.beginPath(); g.roundRect(-20, -6, 24, 12, 3); g.fill();
    g.fillStyle = S.light ? '#eceff4' : '#4a505c'; g.beginPath(); g.moveTo(4, -9); g.lineTo(12, -9); g.lineTo(12, 9); g.lineTo(4, 9); g.closePath(); g.fill();
    if (S.light) { g.fillStyle = 'rgba(242,244,248,.18)'; g.beginPath(); g.moveTo(12, -9); g.lineTo(46, -24); g.lineTo(46, 24); g.lineTo(12, 9); g.closePath(); g.fill(); }
    g.restore();
    g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.textAlign = 'center'; g.fillText(S.light ? '손전등 켬' : '손전등 끔', lamp.x, lamp.y - 16); g.textAlign = 'left';
  }

  // 단계 그림 — s 는 그 단계 안에서 더 줄어든 배수(1 = 막 보이기 시작)
  const BLUE = () => { const f = sheen(S.lightA); return `rgb(${Math.round(70 + 60 * f)},${Math.round(112 - 30 * f)},${Math.round(172 - 4 * f)})`; };
  function grid(cx, cy, R, step, fn) {                  // 줄어들수록 칸이 커지는 무늬(가운데 기준)
    const n = Math.ceil(R / step) + 1;
    for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) fn(cx + i * step, cy + j * step, i, j);
  }
  function drawStage(obj, i, s, cx, cy, R) {
    const k = Math.min(s, 12);
    g.lineCap = 'round';
    if (obj === 'butterfly') {
      if (i === 0) { g.fillStyle = BLUE(); for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(cx + sx * R * 0.3 * k, cy - R * 0.1 * k, R * 0.32 * k, R * 0.24 * k, sx * 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx + sx * R * 0.22 * k, cy + R * 0.25 * k, R * 0.2 * k, R * 0.16 * k, -sx * 0.5, 0, 7); g.fill(); } g.fillStyle = '#2a2f39'; g.fillRect(cx - 3 * k, cy - R * 0.35 * k, 6 * k, R * 0.7 * k); }
      else if (i === 1) { g.fillStyle = BLUE(); g.fillRect(cx - R, cy - R, 2 * R, 2 * R); g.strokeStyle = 'rgba(20,24,34,.5)'; g.lineWidth = 2; for (let x = -3; x <= 3; x++) { g.beginPath(); g.moveTo(cx + x * 70 * k, cy - R); g.lineTo(cx + x * 70 * k + 30, cy + R); g.stroke(); } }
      else if (i === 2) {
        const sw = 46 * k, sh = 30 * k;
        for (let j = -Math.ceil(R / sh) - 1; j <= Math.ceil(R / sh) + 1; j++) for (let q = -Math.ceil(R / sw) - 1; q <= Math.ceil(R / sw) + 1; q++) {
          const x = cx + q * sw + (j % 2 ? sw / 2 : 0), y = cy + j * sh * 0.8, centre = q === 0 && j === 0;
          g.fillStyle = centre && S.flipped ? '#7a5f45' : BLUE(); g.strokeStyle = 'rgba(15,18,26,.7)'; g.lineWidth = 1.5;
          g.beginPath(); g.roundRect(x - sw * 0.48, y - sh * 0.5, sw * 0.96, sh * 1.1, [2, 2, sh * 0.5, sh * 0.5]); g.fill(); g.stroke();
        }
        g.strokeStyle = C.hi; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.roundRect(cx - sw * 0.5, cy - sh * 0.55, sw, sh * 1.2, 6); g.stroke(); g.setLineDash([]);
        g.fillStyle = C.hi; g.font = '700 11px system-ui'; g.textAlign = 'center'; g.fillText(S.flipped ? '뒤집은 비늘: 갈색' : '이 비늘을 눌러 뒤집기', cx, cy + sh * 0.9 + 12); g.textAlign = 'left';
      } else {
        g.fillStyle = S.flipped ? '#7a5f45' : BLUE(); g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        g.strokeStyle = 'rgba(220,226,240,.55)'; g.lineWidth = Math.max(1.5, 3 * k / 3);
        for (let x = cx - R - ((cx - R) % (14 * k)); x < cx + R; x += 14 * k) { g.beginPath(); g.moveTo(x, cy - R); g.lineTo(x, cy + R); g.stroke(); }
        g.strokeStyle = 'rgba(15,18,26,.5)'; g.lineWidth = 1; for (let y = cy - R; y < cy + R; y += 22 * k) { g.beginPath(); g.moveTo(cx - R, y); g.lineTo(cx + R, y); g.stroke(); }
      }
    } else if (obj === 'salt') {
      if (i === 0) { g.strokeStyle = '#6b7280'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, cy + 10 * k, R * 0.45 * k, R * 0.18 * k, 0, 0, 7); g.stroke(); g.fillStyle = '#e6e9ef'; g.beginPath(); g.ellipse(cx, cy + 4 * k, R * 0.35 * k, R * 0.12 * k, 0, Math.PI, 0); g.fill(); }
      else if (i === 1) { g.fillStyle = '#e6e9ef'; for (const [a, b, c] of pts('salt1', 500)) { g.beginPath(); g.arc(cx + a * R * 1.2 / Math.sqrt(k) * k, cy + b * R * 1.2 / Math.sqrt(k) * k, 1 + c * 1.5 * k, 0, 7); g.fill(); } }
      else if (i === 2) { for (const [a, b, c] of pts('salt2', 40)) cube(cx + a * R * 1.1 * k, cy + b * R * 1.1 * k, (26 + 20 * c) * k); }
      else { cube(cx - 150 * k, cy - 60 * k, 300 * k); g.strokeStyle = 'rgba(80,86,98,.8)'; g.lineWidth = 1.5;   // 윗면의 네모 계단
        g.save(); g.translate(cx, cy - 135 * k); g.scale(1, 0.5); g.rotate(Math.PI / 4); for (let q = 1; q < 6; q++) { const h = 212 * k * (1 - q / 6); g.strokeRect(-h / 2, -h / 2, h, h); } g.restore(); }
    } else if (obj === 'moss') {
      if (i === 0) { g.fillStyle = '#4a505c'; g.beginPath(); g.ellipse(cx, cy + 30 * k, R * 0.5 * k, R * 0.28 * k, 0, 0, 7); g.fill(); g.fillStyle = '#5d7360'; g.beginPath(); g.ellipse(cx - 10 * k, cy + 2 * k, R * 0.3 * k, R * 0.14 * k, 0, 0, 7); g.fill(); }
      else if (i === 1) { g.fillStyle = '#5d7360'; for (const [a, b, c] of pts('moss1', 60)) { g.beginPath(); g.arc(cx + a * R * k, cy + b * R * 0.8 * k, (10 + 16 * c) * k, 0, 7); g.fill(); } }
      else if (i === 2) {
        for (const [a, b, c] of pts('moss2', 40)) { const x = cx + a * R * 1.2 * k, y = cy + b * R * 0.6 * k + 60 * k; g.strokeStyle = '#6f8a72'; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (c - 0.5) * 30 * k, y - (60 + 50 * c) * k); g.stroke(); g.fillStyle = '#7d9a80'; g.beginPath(); g.ellipse(x + (c - 0.5) * 30 * k, y - (60 + 50 * c) * k, 6 * k, 12 * k, c, 0, 7); g.fill(); }
        g.strokeStyle = 'rgba(220,226,236,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(cx + 30 * k, cy - 30 * k, 26 * k, 0, 7); g.stroke();
      } else drawDrop(cx, cy, R);
    } else if (obj === 'velcro') {
      if (i === 0) { g.fillStyle = '#4a505c'; g.beginPath(); g.ellipse(cx, cy + 20 * k, R * 0.55 * k, R * 0.22 * k, 0, 0, 7); g.fill(); g.fillStyle = '#6b7280'; g.fillRect(cx - R * 0.25 * k, cy - 10 * k, R * 0.5 * k, 18 * k); }
      else if (i === 1) { g.fillStyle = '#6b7280'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); g.strokeStyle = '#9aa1ae'; g.lineWidth = 1.5; for (const [a, b, c] of pts('velcro1', 300)) { const x = cx + a * R * k, y = cy + b * R * k; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (c - 0.5) * 8 * k, y - 6 * k); g.stroke(); } }
      else if (i === 2) {
        const stuck = S.velcro === 'stuck', gap = stuck ? 0 : 40 * k, sp = 34 * k;
        g.fillStyle = '#3a404c'; g.fillRect(cx - R, cy + 50 * k, 2 * R, R); g.fillRect(cx - R, cy - R, 2 * R, R - 50 * k - gap);
        g.strokeStyle = '#c9ced8'; g.lineWidth = 3 * Math.min(k, 3);
        for (let x = cx - R - ((cx - R) % sp); x < cx + R; x += sp) { g.beginPath(); g.moveTo(x, cy + 50 * k); g.lineTo(x, cy - 10 * k); g.arc(x + 8 * k, cy - 10 * k, 8 * k, Math.PI, 0); g.lineTo(x + 16 * k, cy - 2 * k); g.stroke(); }
        g.strokeStyle = '#8a91a0';
        for (let x = cx - R - ((cx - R) % sp) + sp / 2; x < cx + R; x += sp) { g.beginPath(); g.ellipse(x, cy - 50 * k - gap + 34 * k, 13 * k, 34 * k, 0, 0, Math.PI); g.stroke(); }
        g.fillStyle = C.hi; g.font = '700 11px system-ui'; g.textAlign = 'center'; g.fillText(stuck ? '걸렸어요 — 누르면 떼요' : '누르면 붙여요', cx, cy - R * 0.6); g.textAlign = 'left';
      } else { g.strokeStyle = '#c9ced8'; g.lineWidth = 18 * Math.min(k, 3); g.beginPath(); g.moveTo(cx - 40 * k, cy + R); g.lineTo(cx - 40 * k, cy - 20 * k); g.arc(cx + 20 * k, cy - 20 * k, 60 * k, Math.PI, 0.2); g.stroke(); }
    } else if (obj === 'hair') {
      if (i === 0 || i === 1) { g.strokeStyle = '#8a7a66'; g.lineWidth = i === 0 ? 1.2 : 2 + 2 * k; g.beginPath(); g.moveTo(cx - R, cy + 20); g.bezierCurveTo(cx - R * 0.3, cy - 40 * k, cx + R * 0.3, cy + 60 * k, cx + R, cy - 10); g.stroke(); }
      else { const wd = (i === 2 ? 70 : 260) * k; g.save(); g.translate(cx, cy); g.rotate(-0.25);
        const gr = g.createLinearGradient(0, -wd / 2, 0, wd / 2); gr.addColorStop(0, '#5a4f43'); gr.addColorStop(0.5, '#9a8a74'); gr.addColorStop(1, '#4a4136'); g.fillStyle = gr; g.fillRect(-R * 2, -wd / 2, R * 4, wd);
        if (i === 3) { g.strokeStyle = 'rgba(30,26,20,.7)'; g.lineWidth = 2; for (let x = -R * 2; x < R * 2; x += 30 * k) { g.beginPath(); g.moveTo(x, -wd / 2); g.quadraticCurveTo(x + 18 * k, 0, x + 4 * k, wd / 2); g.stroke(); } }
        g.restore(); }
    } else if (obj === 'pencil') {
      if (i === 0) { g.fillStyle = '#d9dde6'; g.fillRect(cx - R * 0.6 * k, cy - R * 0.4 * k, R * 1.2 * k, R * 0.8 * k); g.strokeStyle = '#2a2f39'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - R * 0.4 * k, cy); g.bezierCurveTo(cx - R * 0.2 * k, cy - 30 * k, cx, cy + 30 * k, cx + R * 0.3 * k, cy - 10 * k); g.stroke(); }
      else { g.fillStyle = '#c9ced8'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        if (i === 1) { g.fillStyle = '#23272f'; g.fillRect(cx - R, cy - 18 * k, 2 * R, 36 * k); }
        else { g.strokeStyle = '#9aa1ae'; g.lineWidth = 6 * Math.min(k, 3); for (const [a, b, c, d] of pts('pencil2', 34)) { g.beginPath(); g.moveTo(cx + a * R * 1.5 * k, cy + b * R * 1.5 * k); g.quadraticCurveTo(cx + c * R - R / 2, cy + d * R - R / 2, cx - a * R * 1.5 * k, cy - b * R * 0.8 * k); g.stroke(); }
          if (i === 3) for (const [a, b, c] of pts('pencil3', 26)) { const x = cx + a * R * 0.9, y = cy + b * R * 0.9, r = (8 + 10 * c) * k; g.fillStyle = '#1b1e25'; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x, y - r * 0.6); g.lineTo(x + r, y - r * 0.1); g.lineTo(x + r * 0.3, y + r * 0.6); g.closePath(); g.fill(); g.strokeStyle = 'rgba(240,242,246,.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - r * 0.6, y - r * 0.1); g.lineTo(x, y - r * 0.45); g.stroke(); } } }
    } else if (obj === 'sand') {
      if (i === 0) { g.fillStyle = '#8a8070'; g.beginPath(); g.ellipse(cx, cy + 20 * k, R * 0.45 * k, R * 0.2 * k, 0, Math.PI, 0); g.fill(); }
      else if (i === 1) { g.fillStyle = '#8a8070'; for (const [a, b] of pts('sand1', 600)) { g.beginPath(); g.arc(cx + a * R * k, cy + b * R * k, 1.2 * k, 0, 7); g.fill(); } }
      else { for (const [a, b, c, d] of pts('sand2', 46)) { const x = cx + a * R * 1.3 * k / Math.max(1, k * 0.6), y = cy + b * R * 1.3 * k / Math.max(1, k * 0.6), r = (14 + 14 * c) * k, L = Math.round(90 + 120 * d);
          g.fillStyle = `rgb(${L},${L - 8},${L - 20})`; g.beginPath(); for (let q = 0; q < 6; q++) { const aa = q / 6 * Math.PI * 2 + c * 3, rr = r * (0.7 + 0.4 * ((q * 7 + Math.round(d * 10)) % 5) / 4); g[q ? 'lineTo' : 'moveTo'](x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } g.closePath(); g.fill(); }
        if (i === 3) { const r = 50 * k; g.fillStyle = '#d9d2c4'; g.beginPath(); g.moveTo(cx, cy + r * 0.4); g.arc(cx, cy + r * 0.4, r, Math.PI * 1.15, Math.PI * 1.85); g.closePath(); g.fill(); g.strokeStyle = '#9a9284'; g.lineWidth = 1.5; for (let q = 1; q < 6; q++) { const a = Math.PI * (1.15 + 0.7 * q / 6); g.beginPath(); g.moveTo(cx, cy + r * 0.4); g.lineTo(cx + Math.cos(a) * r, cy + r * 0.4 + Math.sin(a) * r); g.stroke(); } } }
    } else if (obj === 'pollen') {
      if (i === 0) { g.fillStyle = '#b8ad7a'; for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2; g.beginPath(); g.ellipse(cx + Math.cos(a) * 26 * k, cy + Math.sin(a) * 26 * k, 18 * k, 10 * k, a, 0, 7); g.fill(); } g.fillStyle = '#d6c98a'; g.beginPath(); g.arc(cx, cy, 12 * k, 0, 7); g.fill(); }
      else if (i === 1) { g.fillStyle = '#d6c98a'; for (const [a, b] of pts('pollen1', 400)) { g.beginPath(); g.arc(cx + a * R * k, cy + b * R * k, 1.4 * k, 0, 7); g.fill(); } }
      else { const balls = i === 2 ? pts('pollen2', 9) : [[0, 0, 0.6, 0]];
        for (const [a, b, c] of balls) { const x = cx + a * R * 0.8 * k, y = cy + b * R * 0.8 * k, r = (i === 2 ? 26 + 12 * c : 160) * k; g.fillStyle = '#c9bd84'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#e8dca4'; g.lineWidth = Math.max(1.5, r * 0.04);
          for (let q = 0; q < 18; q++) { const aa = q / 18 * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(aa) * r, y + Math.sin(aa) * r); g.lineTo(x + Math.cos(aa) * r * 1.22, y + Math.sin(aa) * r * 1.22); g.stroke(); }
          if (i === 3) { g.fillStyle = '#6f6644'; for (let q = 0; q < 3; q++) { const aa = q / 3 * Math.PI * 2 + 0.4; g.beginPath(); g.arc(x + Math.cos(aa) * r * 0.5, y + Math.sin(aa) * r * 0.5, r * 0.12, 0, 7); g.fill(); } } } }
    }
    g.lineCap = 'butt';
  }
  function cube(x, y, s) {
    const h = s / 2;
    g.fillStyle = '#e6e9ef'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + h, y - h * 0.5); g.lineTo(x + s, y); g.lineTo(x + h, y + h * 0.5); g.closePath(); g.fill();
    g.fillStyle = '#aeb4bf'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + h, y + h * 0.5); g.lineTo(x + h, y + s * 1.1); g.lineTo(x, y + s * 0.85); g.closePath(); g.fill();
    g.fillStyle = '#8a91a0'; g.beginPath(); g.moveTo(x + h, y + h * 0.5); g.lineTo(x + s, y); g.lineTo(x + s, y + s * 0.85); g.lineTo(x + h, y + s * 1.1); g.closePath(); g.fill();
  }
  function drawDrop(cx, cy, R) {                        // 물방울(지름 약 2mm) 속 물곰(0.3mm)과 짚신벌레(0.2mm) — 실제 크기 비율로
    const T = S.tardi, ppm = 2 * R / field(S.z), wr = (0.25 + 0.75 * T.water) * 1.0 * ppm;
    g.fillStyle = 'rgba(150,170,190,.16)'; g.strokeStyle = 'rgba(220,226,236,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, wr, 0, 7); g.fill(); g.stroke();
    const L = 0.3 * ppm * (T.form === 'tun' ? 0.55 : 1), walk = T.form === 'walk' && T.wet;
    const room = Math.max(0, Math.min(wr, R) - L * 0.6), px = cx + (walk ? Math.sin(S.t * 0.35) * room * 0.5 : 0), py = cy + (walk ? Math.cos(S.t * 0.27) * room * 0.25 : 0);
    g.save(); g.translate(px, py);
    if (T.form === 'tun') {                             // 오그라든 통
      g.fillStyle = '#8a8170'; g.beginPath(); g.roundRect(-L / 2, -L * 0.32, L, L * 0.64, L * 0.3); g.fill();
      g.strokeStyle = 'rgba(40,36,30,.6)'; g.lineWidth = Math.max(1, L * 0.03); for (let q = -1; q <= 1; q++) { g.beginPath(); g.moveTo(q * L * 0.2, -L * 0.28); g.lineTo(q * L * 0.2, L * 0.28); g.stroke(); }
    } else {                                            // 옆에서 본 물곰: 통통한 몸, 짧은 다리 넷씩 두 줄(앞줄 밝게, 뒷줄 어둡게) = 여덟
      const sw = T.form === 'waking' ? 0.6 + 0.4 * Math.min(1, T.wake / 3) : 1, len = L * sw;
      for (const [row, col] of [[-1, '#8f8676'], [1, '#c2b8a2']]) for (let q = 0; q < 4; q++) {
        const x = (-0.36 + q * 0.24) * len + row * len * 0.03, ph = walk ? Math.sin(S.t * 5 + q * 1.6 + (row > 0 ? Math.PI : 0)) * 0.05 : 0;
        g.fillStyle = col; g.beginPath(); g.roundRect(x - len * 0.05 + ph * len, len * 0.08, len * 0.1, len * (T.form === 'walk' ? 0.2 : 0.1), len * 0.04); g.fill();
      }
      g.fillStyle = '#d3c9b2'; g.beginPath(); g.ellipse(0, 0, len * 0.5, len * 0.2, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(90,82,68,.5)'; g.lineWidth = Math.max(1, len * 0.012); for (let q = 1; q < 5; q++) { const x = (-0.5 + q * 0.2) * len; g.beginPath(); g.moveTo(x, -len * 0.18); g.quadraticCurveTo(x + len * 0.03, 0, x, len * 0.18); g.stroke(); }
      g.fillStyle = '#2a2f39'; g.beginPath(); g.arc(len * 0.42, -len * 0.05, Math.max(1.2, len * 0.02), 0, 7); g.fill();
    }
    g.restore();
    if (T.wet) {                                        // 휙 지나가는 짚신벌레
      const pl = 0.2 * ppm, span = Math.min(wr, R) * 2 + pl, x = cx - span / 2 + ((S.t * 0.6 * ppm) % span), y = cy + Math.min(wr, R) * 0.55;
      g.fillStyle = 'rgba(200,206,216,.55)'; g.beginPath(); g.ellipse(x, y, pl / 2, pl * 0.18, 0.15, 0, 7); g.fill();
    }
  }

  function drawDesk() {
    frame(DK, '책상 위 — 들어갈 곳 고르기');
    const G = geom();
    for (const d of G.desk) {
      const on = d.obj === S.obj, x = d.x + d.w / 2, y = d.y + d.h / 2 - 6, s = Math.min(d.w, d.h) * 0.28;
      g.strokeStyle = on ? C.hi : C.soft; g.lineWidth = on ? 2 : 1; g.beginPath(); g.roundRect(d.x + 3, d.y + 3, d.w - 6, d.h - 6, 10); g.stroke();
      deskIcon(d.obj, x, y, s);
      g.fillStyle = on ? C.hi : C.dim; g.font = (on ? '800 ' : '600 ') + '11px system-ui'; g.textAlign = 'center'; g.fillText(OBJECTS[d.obj].place, x, d.y + d.h - 9); g.textAlign = 'left';
    }
  }
  function deskIcon(o, x, y, s) {
    g.lineCap = 'round';
    if (o === 'butterfly') { g.fillStyle = '#6a7a96'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(x + sx * s * 0.45, y - s * 0.1, s * 0.45, s * 0.32, sx * 0.5, 0, 7); g.fill(); } g.fillStyle = '#2a2f39'; g.fillRect(x - 2, y - s * 0.4, 4, s * 0.8); }
    else if (o === 'salt') { g.strokeStyle = '#8a91a0'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y + s * 0.2, s * 0.7, s * 0.28, 0, 0, Math.PI); g.stroke(); g.fillStyle = '#e6e9ef'; g.beginPath(); g.ellipse(x, y + s * 0.15, s * 0.55, s * 0.25, 0, Math.PI, 0); g.fill(); }
    else if (o === 'moss') { g.fillStyle = '#4a505c'; g.beginPath(); g.ellipse(x, y + s * 0.2, s * 0.75, s * 0.4, 0, 0, 7); g.fill(); g.fillStyle = '#5d7360'; g.beginPath(); g.ellipse(x - s * 0.1, y - s * 0.12, s * 0.5, s * 0.2, 0, 0, 7); g.fill(); }
    else if (o === 'velcro') { g.fillStyle = '#5b6270'; g.beginPath(); g.ellipse(x, y + s * 0.2, s * 0.85, s * 0.32, 0, 0, 7); g.fill(); g.fillStyle = '#8a91a0'; g.fillRect(x - s * 0.4, y - s * 0.1, s * 0.8, s * 0.22); }
    else if (o === 'hair') { g.strokeStyle = '#9a8a74'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - s, y + s * 0.3); g.bezierCurveTo(x - s * 0.3, y - s * 0.6, x + s * 0.2, y + s * 0.6, x + s, y - s * 0.3); g.stroke(); }
    else if (o === 'pencil') { g.fillStyle = '#c9ced8'; g.fillRect(x - s * 0.8, y - s * 0.55, s * 1.6, s * 1.1); g.strokeStyle = '#23272f'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - s * 0.5, y); g.bezierCurveTo(x - s * 0.2, y - s * 0.4, x + s * 0.1, y + s * 0.4, x + s * 0.5, y - s * 0.1); g.stroke(); }
    else if (o === 'sand') { g.fillStyle = '#8a8070'; g.beginPath(); g.ellipse(x, y + s * 0.3, s * 0.8, s * 0.55, 0, Math.PI, 0); g.fill(); }
    else if (o === 'pollen') { g.fillStyle = '#b8ad7a'; for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4, s * 0.3, s * 0.16, a, 0, 7); g.fill(); } g.fillStyle = '#d6c98a'; g.beginPath(); g.arc(x, y, s * 0.2, 0, 7); g.fill(); }
    g.lineCap = 'butt';
  }

  addEventListener('resize', layout); layout(); refresh();
  return { S, step, draw, showMission, layout, geom, enter, setZ, wheel, setLight, flip, photo, velcroAct, dry, wet, refresh,
    view: () => S.v, run(sec) { for (let t = 0; t < sec; t += 1 / 30) step(1 / 30); } };
}
