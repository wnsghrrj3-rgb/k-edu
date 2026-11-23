/* 케이원더 · 자라는 결정 — 묶음 ㄱ 손잡이 판(회색 도형). 그림은 묶음 ㄴ~ㄹ 에서 바뀐다.
 * 왼쪽(세로 화면이면 위) = 표본 상자: 결정이 가운데에서 자란다. 결정을 누르면 흠을 낸다. 아래에 크기 견줄 연필(동굴은 탐험가 인형).
 * 오른쪽(아래) = 손잡이 셋: 온도 다이얼 · 둘째 다이얼(물기/말리는·식히는 빠르기) · 시간 감기 바퀴(앞으로 = 빨리 감기, 뒤로 = 돌려 보기).
 */
import { BOXES, MELT, PERSON, FREE_CAP, FREE_SNOW_MIN, grow, twins, sliceSteps, snowCell, MISSIONS, WHY, BIG_RAINBOW } from './logic.js';

export function createBoard(cv, ui) {
  const g = cv.getContext('2d');
  const S = {
    box: 'snow', T: BOXES.snow.dial1.start, w: BOXES.snow.dial2.start, steps: [], total: 0, viewT: 0, seed: 1,
    mi: 0, free: false, shelf: [], twinRef: null, twinMsg: '', told: false, capBonus: 0, bonusGiven: false, waiting: false, res: null,
    drag: null, crankA: 0, dialA: [0, 0], cut: 0,
  };
  let W = 0, H = 0, dpr = 1, STG = null, PAN = null, barsAt = '';
  const bars = () => (ui.topH ? Math.round(ui.topH()) : 56) + ',' + (ui.bottomH ? Math.round(ui.bottomH()) : 140);
  const C = { bg: '#0b0d12', grid: '#1a1e27', line: '#5b6270', soft: '#3a404c', ink: '#d9dde6', dim: '#8a91a0', hi: '#f2f4f8', glass: '#11141b', ice: '#c9d0dc' };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function layout() {
    dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    barsAt = bars(); const [tb, bb] = barsAt.split(',').map(Number), top = tb + 8, bottom = bb + 12;
    if (W >= H * 1.15) { STG = { x: 8, y: top, w: W * 0.64 - 12, h: H - top - bottom }; PAN = { x: W * 0.64 + 4, y: top, w: W * 0.36 - 12, h: H - top - bottom }; }
    else { const h = H - top - bottom; STG = { x: 8, y: top, w: W - 16, h: h * 0.6 }; PAN = { x: 8, y: top + h * 0.6 + 6, w: W - 16, h: h * 0.4 - 6 }; }
  }
  /** 손잡이 셋의 자리: 0 = 온도, 1 = 둘째 다이얼, 2 = 시간 감기 */
  function knob(i) {
    if (PAN.w > PAN.h * 0.9) {                         // 가로로 셋
      const r = Math.max(18, Math.min(PAN.w / 6 - 16, PAN.h / 2 - 38));
      return { x: PAN.x + PAN.w * (1 + 2 * i) / 6, y: PAN.y + PAN.h / 2 + 4, r };
    }
    const r = Math.max(18, Math.min(PAN.w / 2 - 30, PAN.h / 6 - 30));
    return { x: PAN.x + PAN.w / 2, y: PAN.y + PAN.h * (1 + 2 * i) / 6 + 4, r };
  }
  const box = () => BOXES[S.box];
  /** 시간 한도. 비스무트는 녹아 있던 시간은 세지 않는다: 마지막으로 녹은 때부터(아직 안 녹였으면 지금부터) 센다 */
  const capOf = () => box().cap * (S.free ? FREE_CAP : 1) + S.capBonus + (S.box === 'bismuth' ? meltEnd() : 0);
  function meltEnd() {
    let acc = 0, end = -1;
    for (const st of S.steps) { if (st.notch) continue; acc += st.dt; if (st.T >= MELT) end = acc; }
    return end < 0 ? S.total : end;
  }
  const tMin = () => (S.free && S.box === 'snow' ? FREE_SNOW_MIN : box().dial1.min);
  const live = () => S.viewT >= S.total - 1e-9;

  // ── 역사
  function addTime(dt) {
    if (dt <= 0) return;
    const L = S.steps[S.steps.length - 1];
    if (L && !L.notch && L.T === S.T && L.w === S.w) L.dt += dt; else S.steps.push({ T: S.T, w: S.w, dt });
    S.total += dt; S.viewT = S.total;
  }
  function truncate() {                                  // 돌려 본 자리에서 손잡이를 바꾸면 그 뒤 역사는 지운다
    if (live()) return;
    S.steps = sliceSteps(S.steps, S.viewT); S.total = S.viewT; S.twinRef = null;
  }
  function changed() { S.twinMsg = ''; S.told = false; }
  function setT(v) { truncate(); const nv = clamp(v, tMin(), box().dial1.max); if (nv !== S.T) { S.T = nv; changed(); } }
  function setW(v) { truncate(); const nv = clamp(v, 0, 1); if (nv !== S.w) { S.w = nv; changed(); } }
  function crank(turns) {
    const amt = turns * box().flow * 10;                 // 한 바퀴 = 저절로 흐르는 시간 10초어치
    S.crankA += turns * Math.PI * 2;
    if (amt > 0) {
      const back = Math.min(amt, S.total - S.viewT); S.viewT += back;
      if (amt - back > 0) addTime(Math.min(amt - back, Math.max(0, capOf() - S.total)));
    } else S.viewT = Math.max(0, S.viewT + amt);
    refresh();
  }
  function reset(keepDials) {
    S.steps = []; S.total = 0; S.viewT = 0; S.seed++; S.twinRef = null; S.twinMsg = ''; S.told = false; S.capBonus = 0; S.bonusGiven = false;
    if (!keepDials) { S.T = box().dial1.start; S.w = box().dial2.start; }
    refresh();
  }
  function pick(b) { if (!BOXES[b] || (BOXES[b].free && !S.free)) return; S.box = b; reset(false); ui.boxChanged && ui.boxChanged(b); }
  function notch() {
    if (!S.res || S.res.size <= 0) { ui.say('아직 흠을 낼 결정이 없어요.'); return; }
    truncate(); S.steps.push({ notch: true }); S.cut = 1;
    if (S.total >= capOf() - 1e-9 && !S.bonusGiven) { S.capBonus += box().cap * 0.4; S.bonusGiven = true; }   // 다 자란 뒤라도 메울 시간을 한 번 더 준다(결정 하나에 한 번)
    S.told = false; refresh();
  }
  function twin() {                                      // 같은 역사, 다른 씨앗 → 처음부터 다시 자라는 걸 보여 준다
    if (!S.res || S.res.size <= 0) { ui.say('먼저 하나를 길러요.'); return; }
    S.twinRef = grow({ box: S.box, steps: S.steps, seed: S.seed });
    S.shelf.push({ res: S.twinRef }); if (S.shelf.length > 3) S.shelf.shift();
    S.seed++; S.viewT = 0; S.twinMsg = ''; refresh();
    ui.say('같은 조건으로 한 번 더 길러요…');
  }

  // ── 의뢰
  function showMission() {
    if (S.mi < MISSIONS.length) ui.note('의뢰 ' + (S.mi + 1) + ' · ' + MISSIONS[S.mi].say);
    else ui.note('자유롭게 길러 보세요', '시간 한도가 풀렸어요 · 거대 결정 동굴도 열렸어요');
    ui.freeMode(S.free);
  }
  function succeed(i, sub) {
    S.mi = i + 1; S.waiting = true; if (S.mi >= MISSIONS.length) { S.free = true; ui.freeMode(true); }
    ui.note('성공! ⭐', sub);
    setTimeout(() => ui.why(WHY[MISSIONS[i].why]), 1200);
    setTimeout(() => { S.waiting = false; S.told = false; showMission(); }, 8000);   // 8초 동안은 「성공!」을 다른 글이 덮지 않는다
  }
  const finished = r => (r.done !== undefined ? r.done : false) || S.total >= capOf() - 1e-9;
  function judge(r) {
    if (S.mi >= MISSIONS.length || !live() || S.waiting) return;
    const m = MISSIONS[S.mi];
    if (m.ok(r)) {
      succeed(S.mi, S.mi === 0 ? `「${r.label}」 ${r.size.toFixed(1)}mm — 아주 춥고 물기가 많으면 가지가 뻗어요.`
        : S.mi === 1 ? '가운데는 판, 끝은 가지 — 자라는 동안 겪은 온도가 모양에 남았어요.'
        : `무지개 계단 ${Math.round(r.size)}mm — 천천히 식힐수록 커요.`);
      S.told = true;
    } else if (!S.told && finished(r)) {
      S.told = true;
      const stuck = S.total >= capOf() - 1e-9 && S.box !== 'bismuth';      // 한도에 닿아 더 못 자란다 → 새 씨앗부터
      ui.note('의뢰 ' + (S.mi + 1) + ' · ' + m.say, m.tell(r) + (stuck ? ' 「새 씨앗」으로 다시 길러요.' : '') + ' · 귀띔: ' + m.hint);
    }
  }

  // ── 결과
  let lastSay = '';
  function refresh() {
    const steps = live() ? S.steps : sliceSteps(S.steps, S.viewT);
    S.res = grow({ box: S.box, steps, seed: S.seed });
    if (S.twinRef && live()) { S.twinMsg = twins(S.res, S.twinRef).says; S.twinRef = null; }
    const t = S.res.says + (S.twinMsg ? ' ' + S.twinMsg : '');
    if (t !== lastSay) { lastSay = t; ui.say(t); }
    judge(S.res);
  }
  function step(dt) {
    if (!live()) { if (!(S.drag && S.drag.i === 2)) S.viewT = Math.min(S.total, S.viewT + box().flow * dt * 2); }   // 바퀴를 잡고 있으면 돌려 본 자리에 멈춰 있다
    else if (S.total < capOf()) addTime(Math.min(box().flow * dt, capOf() - S.total));
    S.cut = Math.max(0, S.cut - dt * 2);
    refresh();
  }

  // ── 손
  const P = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const wrap = a => (a > Math.PI ? a - 2 * Math.PI : a < -Math.PI ? a + 2 * Math.PI : a);
  const SWEEP = Math.PI * 1.5;                          // 다이얼이 도는 범위 270°
  cv.addEventListener('pointerdown', e => {
    if (S.drag) return;                                  // 손가락 하나가 손잡이를 잡고 있으면 다른 손가락은 무시
    const [x, y] = P(e);
    for (let i = 0; i < 3; i++) {
      const k = knob(i);
      if (Math.hypot(x - k.x, y - k.y) < k.r + 18) { S.drag = { i, id: e.pointerId, a: Math.atan2(y - k.y, x - k.x) }; try { cv.setPointerCapture(e.pointerId); } catch {} return; }
    }
    const c = center();
    if (x > STG.x && x < STG.x + STG.w && y > STG.y && y < STG.y + STG.h && Math.hypot(x - c.x, y - c.y) < Math.min(STG.w, STG.h) * 0.42) notch();
  });
  cv.addEventListener('pointermove', e => {
    if (!S.drag || e.pointerId !== S.drag.id) return;
    const [x, y] = P(e), k = knob(S.drag.i), a = Math.atan2(y - k.y, x - k.x), da = wrap(a - S.drag.a); S.drag.a = a;
    turn(S.drag.i, da);
  });
  const up = e => { if (S.drag && e.pointerId === S.drag.id) S.drag = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  /** 손잡이 i 를 da 라디안 돌린다(시계 방향 +) */
  function turn(i, da) {
    if (i === 0) setT(S.T + da / SWEEP * (box().dial1.max - tMin()));
    else if (i === 1) setW(S.w + da / SWEEP);
    else crank(da / (Math.PI * 2));
  }

  // ── 그리기(회색 도형)
  const center = () => ({ x: STG.x + STG.w / 2, y: STG.y + 30 + (STG.h - 44 - 60) / 2 });   // 상자 안, 연필 띠 위의 가운데
  const viewSize = () => {                              // 상자 너비가 보여 주는 실제 길이(결정 단위)
    const base = { snow: 14, salt: 40, bismuth: 90, quartz: 30, cave: 12 }[S.box], sz = S.res ? S.res.size : 0;
    return Math.max(base, sz * (S.box === 'snow' ? 2.6 : S.box === 'cave' ? 1.6 : 1.8));
  };
  function draw() {
    if (innerWidth !== W || innerHeight !== H || bars() !== barsAt) layout();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
    drawStage(); drawPanel();
  }
  function frame(r, label) { g.strokeStyle = C.grid; g.lineWidth = 1; g.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1); g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.fillText(label, r.x + 10, r.y + 18); }
  const fmtTime = t => {
    const u = box().unit;
    if (u === '년') return t >= 10000 ? (t / 10000).toFixed(t >= 100000 ? 0 : 1) + '만 년' : Math.round(t).toLocaleString('ko-KR') + '년';
    return (t < 10 ? t.toFixed(1) : Math.round(t)) + u;
  };
  const fmtSize = (s, u) => (u === 'm' ? s.toFixed(1) + 'm' : s < 1 ? s.toFixed(2) + 'mm' : s.toFixed(1) + 'mm');
  function drawStage() {
    frame(STG, '표본 상자 · ' + box().name + ' — 결정을 누르면 흠을 내요');
    g.save(); g.beginPath(); g.rect(STG.x + 1, STG.y + 1, STG.w - 2, STG.h - 2); g.clip();
    // 유리 상자와 검은 바닥, 위에서 비추는 가는 빛
    const bx = STG.x + STG.w * 0.08, bw = STG.w * 0.84, by = STG.y + 30, bh = STG.h - 44;
    if (S.box !== 'cave') { g.fillStyle = C.glass; g.fillRect(bx, by, bw, bh); g.strokeStyle = C.soft; g.lineWidth = 1.5; g.strokeRect(bx, by, bw, bh); }
    const c = center(), grd = g.createRadialGradient(c.x, by, 4, c.x, c.y, bh * 0.8); grd.addColorStop(0, 'rgba(220,226,236,.10)'); grd.addColorStop(1, 'rgba(220,226,236,0)');
    g.fillStyle = grd; g.beginPath(); g.moveTo(c.x - 10, by); g.lineTo(c.x + 10, by); g.lineTo(c.x + bw * 0.4, by + bh); g.lineTo(c.x - bw * 0.4, by + bh); g.closePath(); g.fill();
    const k = Math.min(bw * 0.92, bh - 70) / viewSize(), r = S.res;
    if (r) {
      if (S.box === 'snow') drawSnow(r, c.x, c.y, k, 1);
      else if (S.box === 'salt') drawSalt(r, c.x, c.y, k);
      else if (S.box === 'bismuth') drawBismuth(r, c.x, c.y, k);
      else if (S.box === 'quartz') drawQuartz(r, c.x, c.y + 20, k);
      else drawCave(r, c.x, by + bh, k, bw);
      if (S.cut > 0) { g.fillStyle = `rgba(242,244,248,${S.cut * 0.4})`; g.beginPath(); g.arc(c.x, c.y, 30 * (2 - S.cut), 0, 7); g.fill(); }
    }
    if (S.box !== 'cave') drawPencil(bx, by + bh, bw, k);
    // 결정 이름·크기 · 시간
    g.fillStyle = C.ink; g.font = '800 13px system-ui'; g.textAlign = 'center';
    if (r && r.size > 0) {
      const txt = (r.label ? r.label + ' · ' : '') + fmtSize(r.size, r.sizeUnit), ly = S.box === 'cave' ? by + 16 : by + bh - 58, tw = g.measureText(txt).width;
      g.fillStyle = 'rgba(11,13,18,.8)'; g.fillRect(c.x - tw / 2 - 6, ly - 14, tw + 12, 19); g.fillStyle = C.ink; g.fillText(txt, c.x, ly);
    }
    g.textAlign = 'right'; g.fillStyle = live() ? C.dim : C.hi; g.font = '700 12px system-ui';
    g.fillText((live() ? '' : '돌려 보는 중 · ') + fmtTime(S.viewT) + (live() ? '' : ' / ' + fmtTime(S.total)), STG.x + STG.w - 10, STG.y + 18);
    g.textAlign = 'left';
    drawShelf(bx + 6, by + 6);
    g.restore();
  }
  function drawPencil(bx, floor, bw, k) {               // 실제 크기 연필: 굵기 7mm, 깎은 끝 18mm. 끝이 상자 오른쪽에 오게 눕힌다(띠 밖은 잘림)
    const th = 7 * k, tip = 18 * k, ay = floor - 24, x2 = bx + bw * 0.94, x1 = x2 - tip, lead = 0.3;
    g.save(); g.beginPath(); g.rect(bx + 1, floor - 48, bw - 2, 47); g.clip();
    g.fillStyle = '#4a505c'; g.fillRect(bx - 10, ay - th / 2, x1 - bx + 10, th);
    g.fillStyle = '#6b7280'; g.beginPath(); g.moveTo(x1, ay - th / 2); g.lineTo(x2, ay); g.lineTo(x1, ay + th / 2); g.closePath(); g.fill();
    g.fillStyle = '#20242c'; g.beginPath(); g.moveTo(x2 - tip * lead, ay - th / 2 * lead); g.lineTo(x2, ay); g.lineTo(x2 - tip * lead, ay + th / 2 * lead); g.closePath(); g.fill();
    g.fillStyle = C.ink; g.font = '600 11px system-ui'; g.fillText('연필(굵기 7mm)', bx + 8, floor - 8);
    g.restore();
  }
  function drawShelf(x, y) {
    if (!S.shelf.length) return;
    g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.fillText('표본 선반', x, y + 10);
    const tall = W < H * 1.15, b = tall ? 34 : 52, hb = b / 2;  // 세로 화면: 작은 칸을 왼쪽에 세로로(가운데 결정을 가리지 않게)
    S.shelf.forEach((s, i) => {
      const cx = tall ? x + hb : x + 28 + i * 58, cy = tall ? y + 16 + hb + i * (b + 4) : y + 44; g.strokeStyle = C.soft; g.lineWidth = 1; g.strokeRect(cx - hb, cy - hb, b, b);
      g.save(); g.beginPath(); g.rect(cx - hb, cy - hb, b, b); g.clip();
      const r = s.res, kk = (b - 8) / Math.max(r.size * 2.2, 1e-6);
      if (r.box === 'snow') drawSnow(r, cx, cy, kk, 0.8); else if (r.box === 'salt') drawSalt(r, cx, cy, kk * 0.7); else if (r.box === 'bismuth') drawBismuth(r, cx, cy, kk * 0.9, true);
      else if (r.box === 'quartz') drawQuartz(r, cx, cy + 10, kk * 0.9); else { g.fillStyle = C.ice; g.fillRect(cx - 3, cy - 20, 6, 40); }
      g.restore();
    });
  }

  // 눈: 위에서 본 육각(판·가지) · 기둥은 옆에서 본 육각 기둥
  const hexPath = (cx, cy, rad, rot = 0) => { g.beginPath(); for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); } g.closePath(); };
  function drawSnow(r, cx, cy, k, alpha) {
    if (r.kind === 'empty') { g.fillStyle = C.dim; g.beginPath(); g.arc(cx, cy, 2, 0, 7); g.fill(); return; }
    g.save(); g.globalAlpha = alpha;
    if (r.kind === 'column') {
      const L = r.size * k, needle = r.label === '가는 바늘', wd = Math.max(2, L * (needle ? 0.12 : 0.35));
      const one = rot => { g.save(); g.translate(cx, cy); g.rotate(rot); g.fillStyle = 'rgba(201,208,220,.25)'; g.strokeStyle = C.ice; g.lineWidth = 1.5;
        g.beginPath(); g.rect(-L, -wd / 2, 2 * L, wd); g.fill(); g.stroke(); g.globalAlpha *= 0.6; g.beginPath(); g.moveTo(-L, -wd / 6); g.lineTo(L, -wd / 6); g.moveTo(-L, wd / 6); g.lineTo(L, wd / 6); g.stroke(); g.restore(); };
      if (r.label === '총알 다발') [0, Math.PI / 3, -Math.PI / 3].forEach(one); else one(-0.35);
      g.restore(); drawNotch(r, cx, cy, k); return;
    }
    let tipsAt = 0, hadDendrite = false;
    for (const L of r.layers) {
      const r0 = L.r0 * k, r1 = L.r1 * k;
      if (L.family === 'plate' && !hadDendrite) {
        g.fillStyle = 'rgba(201,208,220,.16)'; g.strokeStyle = C.ice; g.lineWidth = 1.5; hexPath(cx, cy, r1); g.fill(); g.stroke();
        if (L.id === 'C1') { g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); } g.stroke(); }
        tipsAt = r1;
      } else if (L.family === 'plate') {                // 가지 끝에 붙은 작은 판
        g.fillStyle = 'rgba(201,208,220,.2)'; g.strokeStyle = C.ice; g.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; hexPath(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, Math.max(1.5, r1 - r0)); g.fill(); g.stroke(); }
      } else {                                          // 가지·기둥 마디: 팔 여섯
        if (L.family === 'dendrite') hadDendrite = true;
        g.strokeStyle = C.ice; g.lineWidth = L.family === 'column' ? Math.max(2, 0.18 * k) : Math.max(1.5, 0.07 * k); g.beginPath();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.moveTo(cx + Math.cos(a) * Math.max(r0, tipsAt * 0.9), cy + Math.sin(a) * Math.max(r0, tipsAt * 0.9)); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); }
        g.stroke();
      }
    }
    g.strokeStyle = C.ice; g.lineWidth = Math.max(1, 0.04 * k); g.beginPath();
    r.arms.forEach((arm, i) => {
      const a = i * Math.PI / 3;
      for (const b of arm) for (const s of [-1, 1]) {
        const px = cx + Math.cos(a) * b.at * k, py = cy + Math.sin(a) * b.at * k, aa = a + s * Math.PI / 3;
        g.moveTo(px, py); g.lineTo(px + Math.cos(aa) * b.len * k, py + Math.sin(aa) * b.len * k);
      }
    });
    g.stroke(); g.restore(); drawNotch(r, cx, cy, k, r.tip === 'dendrite');
  }
  function drawNotch(r, cx, cy, k, tipCut) {           // 흠: 오른쪽 위에 판 자국(바닥색으로 도려냄). 가지 눈은 팔 끝이 부러진 자리
    if (!(r.defect > 0)) return;
    const R = r.size * k, d = r.defect * k, a = -Math.PI / 3, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
    if (tipCut) {
      g.fillStyle = C.glass; g.beginPath(); g.arc(px, py, d, 0, 7); g.fill();
      g.setLineDash([3, 3]); g.strokeStyle = C.hi; g.lineWidth = 1.2; g.beginPath(); g.arc(px, py, d, 0, 7); g.stroke(); g.setLineDash([]); return;
    }
    const nx = -Math.cos(a), ny = -Math.sin(a), tx = -ny, ty = nx, wd = Math.max(4, d * 0.8);
    g.fillStyle = C.glass; g.strokeStyle = C.hi; g.lineWidth = 1.5; g.beginPath();
    g.moveTo(px + tx * wd + nx * -4, py + ty * wd + ny * -4); g.lineTo(px + nx * d, py + ny * d); g.lineTo(px - tx * wd + nx * -4, py - ty * wd + ny * -4); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(px + tx * wd, py + ty * wd); g.lineTo(px + nx * d, py + ny * d); g.lineTo(px - tx * wd, py - ty * wd); g.stroke();
  }
  function drawSalt(r, cx, cy, k) {
    // 접시와 남은 물
    g.strokeStyle = C.soft; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy + 22, 120, 26, 0, 0, 7); g.stroke();
    if ((r.dried ?? 0) < 1) { g.fillStyle = `rgba(150,160,176,${0.25 * (1 - (r.dried ?? 0))})`; g.beginPath(); g.ellipse(cx, cy + 22, 112 * (1 - 0.5 * (r.dried ?? 0)), 22 * (1 - 0.5 * (r.dried ?? 0)), 0, 0, 7); g.fill(); }
    if (r.kind === 'wet' || !(r.size > 0)) return;
    const R = (() => { let a = (r.seed * 9301 + 49297) % 233280; return () => (a = (a * 9301 + 49297) % 233280) / 233280; })();
    const n = Math.min(r.count, r.kind === 'powder' ? 260 : 60), s = Math.max(1.5, r.size * k);
    const hubs = Array.from({ length: 5 }, () => [cx + (R() - 0.5) * 120, cy + 14 + (R() - 0.5) * 22]);
    for (let i = 0; i < n; i++) {
      let x, y;
      if (r.kind === 'powder') { const h = hubs[i % 5]; x = h[0] + (R() - 0.5) * 26; y = h[1] + (R() - 0.5) * 12; }
      else if (n <= 6) { x = cx + (i - (n - 1) / 2) * s * 1.5 - s / 2; y = cy + 22 - s * 0.5; }
      else { x = cx + (R() - 0.5) * 190 - s / 2; y = cy + 20 + (R() - 0.5) * 26 - s * 0.5; }
      cube(x, y, s, r.defect > 0 && i === 0 ? r.defect / r.size : 0);
    }
    if (n <= 6) drawNotch(r, cx - ((n - 1) / 2) * s * 1.5, cy + 22 - s * 0.5, k * 0.5);
  }
  function cube(x, y, s, cut) {                         // 비스듬히 본 정육면체 세 면
    const h = s * 0.5;
    g.fillStyle = '#d4d9e2'; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + h, y - h * 1.5); g.lineTo(x + h * 2, y - h); g.lineTo(x + h, y - h * 0.5); g.closePath(); g.fill();
    g.fillStyle = '#9aa1ae'; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + h, y - h * 0.5); g.lineTo(x + h, y + h); g.lineTo(x, y + h * 0.5); g.closePath(); g.fill();
    g.fillStyle = '#7b828f'; g.beginPath(); g.moveTo(x + h, y - h * 0.5); g.lineTo(x + h * 2, y - h); g.lineTo(x + h * 2, y + h * 0.5); g.lineTo(x + h, y + h); g.closePath(); g.fill();
  }
  function drawBismuth(r, cx, cy, k, mini) {
    if (!mini) {                                        // 도가니
      g.strokeStyle = C.soft; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 130, cy - 30); g.lineTo(cx - 110, cy + 60); g.lineTo(cx + 110, cy + 60); g.lineTo(cx + 130, cy - 30); g.stroke();
    }
    if (r.kind === 'solid') { g.fillStyle = '#6b7280'; blob(cx, cy + 34, 60, 22, r.seed); return; }
    if (r.kind === 'melt') { g.fillStyle = '#8a91a0'; g.beginPath(); g.ellipse(cx, cy + 20, 118, 18, 0, 0, 7); g.fill(); g.fillStyle = C.dim; g.font = '600 11px system-ui'; g.textAlign = 'center'; g.fillText('녹은 비스무트', cx, cy + 50); g.textAlign = 'left'; return; }
    if (!mini) { g.fillStyle = 'rgba(138,145,160,.5)'; g.beginPath(); g.ellipse(cx, cy + 34, 118 * (1 - (r.solid ?? 1) * 0.6), 14, 0, 0, 7); g.fill(); }
    if (r.kind === 'lump') { g.fillStyle = '#b9bfca'; blob(cx, cy, r.size * k * 0.6, r.size * k * 0.45, r.seed); return; }
    const many = r.kind === 'smallhopper' ? [[-0.9, 0.2], [0.8, 0.3], [0, -0.5], [0.1, 0.6]] : [[0, 0]];
    for (const [ox, oy] of many) hopper(cx + ox * r.size * k, cy + oy * r.size * k, r.size * k / (many.length > 1 ? 1.8 : 1), r.stairs, r.spin);
    drawNotch(r, cx, cy, k * 0.7);
  }
  function hopper(cx, cy, side, n, spin) {              // 네모 계단이 소용돌이치며 안으로(무지개 겉 = 밝기가 바뀌는 띠)
    for (let i = 0; i < n; i++) {
      const f = 1 - i / n, s = side * f; g.save(); g.translate(cx, cy); g.rotate(spin * i * 0.11);
      const L = 120 + 110 * (0.5 + 0.5 * Math.sin(i * 1.3)); g.strokeStyle = `rgb(${L},${L},${Math.min(255, L + 10)})`; g.lineWidth = Math.max(1, side / n * 0.8);
      g.strokeRect(-s / 2, -s / 2, s, s); g.restore();
    }
  }
  function blob(cx, cy, rx, ry, seed) {
    g.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, j = 0.8 + 0.25 * Math.sin(i * 2.1 + seed); g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j); } g.closePath(); g.fill();
  }
  function drawQuartz(r, cx, cy, k) {
    g.fillStyle = '#3a404c'; g.fillRect(cx - 140, cy + 40, 280, 14);                 // 바위 바닥
    if (r.kind === 'grain') { g.fillStyle = C.ice; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(cx - 60 + i * 15, cy + 37, Math.max(1.5, r.size * k * 0.25), 0, 7); g.fill(); } return; }
    const prism = (x, y, h, wd, rot, a) => {
      g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
      g.fillStyle = 'rgba(201,208,220,.3)'; g.strokeStyle = C.ice; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-wd / 2, 0); g.lineTo(-wd / 2, -h); g.lineTo(0, -h - wd * 0.9); g.lineTo(wd / 2, -h); g.lineTo(wd / 2, 0); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h - wd * 0.9); g.moveTo(-wd / 2, -h); g.lineTo(wd / 2, -h); g.stroke(); g.restore();
    };
    if (r.kind === 'cluster') { for (let i = 0; i < 12; i++) prism(cx - 90 + i * 16, cy + 40, r.size * k * (0.3 + 0.2 * Math.sin(i * 1.7) ** 2), 6, (i - 5.5) * 0.06, 0.6); return; }
    prism(cx, cy + 40, r.size * k, r.size * k * 0.3, 0.12, 1);
    drawNotch(r, cx, cy + 40 - r.size * k * 0.5, k * 0.5);
  }
  function drawCave(r, cx, floor, k, bw) {
    g.fillStyle = '#20242c'; g.fillRect(cx - 400, floor - 10, 800, 10);
    if (r.kind === 'crust') { g.fillStyle = C.ice; for (let i = 0; i < 80; i++) g.fillRect(cx - 300 + i * 7.5, floor - 14 - (i % 3) * 2, 4, 4); }
    else for (let i = 0; i < 6; i++) {                  // 흰 기둥 결정 여섯(비스듬히 겹쳐)
      const L = r.size * k * (0.6 + 0.4 * ((i * 7) % 5) / 4), wd = Math.max(4, L * 0.09), x = cx + (i - 2.5) * bw * 0.15;
      g.save(); g.translate(x, floor - 10); g.rotate((i % 2 ? 1 : -1) * (0.35 + i * 0.07));
      g.fillStyle = 'rgba(214,220,230,.55)'; g.strokeStyle = '#e6e9ef'; g.lineWidth = 1.5; g.beginPath(); g.rect(-wd / 2, -L, wd, L); g.fill(); g.stroke(); g.restore();
    }
    // 탐험가 인형(키 1.7m)
    const h = PERSON * k, x = cx + bw * 0.05, y = floor - 10;
    g.strokeStyle = '#f2f4f8'; g.lineWidth = Math.max(1.5, h * 0.06); g.beginPath();
    g.arc(x, y - h * 0.9, h * 0.1, 0, 7); g.moveTo(x, y - h * 0.8); g.lineTo(x, y - h * 0.4); g.lineTo(x - h * 0.12, y); g.moveTo(x, y - h * 0.4); g.lineTo(x + h * 0.12, y); g.moveTo(x - h * 0.18, y - h * 0.65); g.lineTo(x + h * 0.18, y - h * 0.65); g.stroke();
    g.font = '700 11px system-ui'; const tw = g.measureText('탐험가 인형 1.7m').width; g.fillStyle = 'rgba(11,13,18,.85)'; g.fillRect(x - tw / 2 - 4, y - h - 22, tw + 8, 16); g.fillStyle = C.hi; g.textAlign = 'center'; g.fillText('탐험가 인형 1.7m', x, y - h - 10); g.textAlign = 'left';
  }

  function drawPanel() {
    frame(PAN, '손잡이');
    const B = box(), labels = [B.dial1.name, B.dial2.name, '시간 감기'];
    for (let i = 0; i < 3; i++) {
      const kn = knob(i);
      g.fillStyle = C.dim; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText(labels[i], kn.x, kn.y - kn.r - 12);
      if (i < 2) dial(kn, i); else wheel(kn);
      g.fillStyle = C.ink; g.font = '800 13px system-ui';
      const val = i === 0 ? Math.round(S.T) + B.dial1.unit : i === 1 ? (S.w < 1 / 3 ? B.dial2.lo : S.w < 2 / 3 ? '보통' : B.dial2.hi) + ' ' + Math.round(S.w * 100) : (live() ? '⟳ ' : '⟲ ') + fmtTime(S.viewT);
      g.fillText(val, kn.x, kn.y + kn.r + 20);
      if (i === 0 && S.box === 'bismuth') { g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.fillText('녹는 점 ' + MELT + '°C', kn.x, kn.y + kn.r + 33); }
      g.textAlign = 'left';
    }
  }
  function dial(kn, i) {
    const B = box(), lo = i === 0 ? tMin() : 0, hi = i === 0 ? B.dial1.max : 1, v = i === 0 ? S.T : S.w;
    const ang = f => Math.PI * 0.75 + f * SWEEP;       // 왼쪽 아래(7시 반)에서 시계 방향으로 오른쪽 아래(4시 반)까지
    g.strokeStyle = C.soft; g.lineWidth = 2;
    for (let j = 0; j <= 10; j++) { const a = ang(j / 10); g.beginPath(); g.moveTo(kn.x + Math.cos(a) * (kn.r + 4), kn.y + Math.sin(a) * (kn.r + 4)); g.lineTo(kn.x + Math.cos(a) * (kn.r + 9), kn.y + Math.sin(a) * (kn.r + 9)); g.stroke(); }
    const mark = (val, txt) => { const a = ang((val - lo) / (hi - lo)); g.strokeStyle = C.hi; g.lineWidth = 3; g.beginPath(); g.moveTo(kn.x + Math.cos(a) * (kn.r + 3), kn.y + Math.sin(a) * (kn.r + 3)); g.lineTo(kn.x + Math.cos(a) * (kn.r + 12), kn.y + Math.sin(a) * (kn.r + 12)); g.stroke();
      if (txt) { g.fillStyle = C.dim; g.font = '600 10px system-ui'; g.fillText(txt, kn.x + Math.cos(a) * (kn.r + 22), kn.y + Math.sin(a) * (kn.r + 22) + 3); } };
    if (i === 0 && S.box === 'bismuth') mark(MELT);
    if (i === 0 && S.box === 'snow') for (const b of [-4, -10, -22]) if (b > lo) mark(b);
    g.fillStyle = S.drag && S.drag.i === i ? '#3a404c' : '#2a2f39'; g.strokeStyle = C.line; g.lineWidth = 2;
    g.beginPath(); g.arc(kn.x, kn.y, kn.r, 0, 7); g.fill(); g.stroke();
    for (let j = 0; j < 18; j++) { const a = j / 18 * Math.PI * 2; g.strokeStyle = '#353b46'; g.lineWidth = 2; g.beginPath(); g.moveTo(kn.x + Math.cos(a) * kn.r * 0.82, kn.y + Math.sin(a) * kn.r * 0.82); g.lineTo(kn.x + Math.cos(a) * kn.r * 0.96, kn.y + Math.sin(a) * kn.r * 0.96); g.stroke(); }   // 돌림 홈
    const a = ang((v - lo) / (hi - lo));
    g.strokeStyle = C.hi; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(kn.x + Math.cos(a) * kn.r * 0.2, kn.y + Math.sin(a) * kn.r * 0.2); g.lineTo(kn.x + Math.cos(a) * kn.r * 0.78, kn.y + Math.sin(a) * kn.r * 0.78); g.stroke(); g.lineCap = 'butt';
  }
  function wheel(kn) {                                  // 손잡이 달린 바퀴
    g.fillStyle = '#20242c'; g.strokeStyle = C.line; g.lineWidth = 3; g.beginPath(); g.arc(kn.x, kn.y, kn.r, 0, 7); g.fill(); g.stroke();
    g.lineWidth = 2; g.strokeStyle = '#4a505c';
    for (let j = 0; j < 5; j++) { const a = S.crankA + j * Math.PI * 2 / 5; g.beginPath(); g.moveTo(kn.x, kn.y); g.lineTo(kn.x + Math.cos(a) * kn.r, kn.y + Math.sin(a) * kn.r); g.stroke(); }
    const a = S.crankA, hx = kn.x + Math.cos(a) * kn.r * 0.78, hy = kn.y + Math.sin(a) * kn.r * 0.78;
    g.fillStyle = S.drag && S.drag.i === 2 ? C.hi : '#aeb4bf'; g.beginPath(); g.arc(hx, hy, Math.max(6, kn.r * 0.18), 0, 7); g.fill();
    g.fillStyle = '#5b6270'; g.beginPath(); g.arc(kn.x, kn.y, 5, 0, 7); g.fill();
    if (live() && S.total < capOf()) S.crankA += 0.01;    // 저절로 흐르는 동안 천천히 돈다
  }

  addEventListener('resize', layout); layout(); addTime(box().cap * 0.25); refresh();   // 들어오자마자 이미 자라고 있는 판 하나
  return { S, step, draw, showMission, layout, knob, turn, setT, setW, crank, notch, twin, pick, reset, refresh,
    res: () => S.res, run(sec) { for (let t = 0; t < sec; t += 1 / 30) step(1 / 30); } };
}
