/* 그림자 괴물 v2 · 시스템 층(상태·판정·흐름). 그리기는 render.js, 수식 physics.js, 모양 silhouette.js, 놀이 규칙 village.js, 소리 audio.js
 * 세 모드: village(마을을 지켜라) · match(괴물 만들기) · lab(그림자 실험실)
 * 입력은 케이모션 엔진의 사람 마스크(selfie segmenter) 하나 — 1~2명·상반신·멀리서도 안정
 * 마우스 모드(?mouse=1): 마우스 x=자리, y=거리(아래=가까이), 숫자 키 1~9 포즈
 */
import { DEF, maskStats, distanceFrom, wallDistance, shadowHeight, magnification, iou, binarize } from './physics.js?v=2';
import { drawFigure, MONSTERS, POSES } from './silhouette.js?v=2';
import { WALL, drawStage, drawShadow, drawMonsterFace, drawTarget, drawSideView, drawChart, banner, drawLampRail } from './render.js?v=2';
import { Village, ROUND } from './village.js?v=2';
import * as A from './audio.js?v=2';

const $ = id => document.getElementById(id);
const wall = $('wall'), wctx = wall.getContext('2d'); const W = WALL.W, H = WALL.H;
const q = new URLSearchParams(location.search);
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['motion'], segment: true, activity: 'shadow', inferEvery: 1 });
km.maskSmooth = .45;

// ── 상태
const S = { mode: 'village', body: 'auto', upper: false, y0: .1, Hb: DEF.Hb, d0: DEF.d0, s: DEF.s, h0: null, phase: 'start',
  mask: null, stat: null, shadowBox: null, projBin: null, d: null, L: null, Sh: null, mag: null, lamp: { x: .5, y: .5 },
  me: { present: false, size: 0, x0: 0, x1: 0, top: H, hx: W / 2, hw: 80 }, mood: { glow: 0, horn: 0, roar: 0, lookX: 0, blink: false }, prevSize: 0, blinkT: 0, growlT: 0,
  score: 0, t0: 0, timeLeft: 0, side: true, rows: [], sound: true,
  idx: 0, fit: 0, bestFit: 0, holdT: 0, stars: [], tTarget: 0, village: null, introT: 0 };
let raf = 0, lastT = 0; const pops = $('pops');

// ── 저해상 분석판(160×120)
const AW = 160, AH = 120;
const mk = () => { const c = document.createElement('canvas'); c.width = AW; c.height = AH; return c; };
const rawC = mk(), projC = mk(), tgtC = mk();
const rctx = rawC.getContext('2d', { willReadFrequently: true }), pctx = projC.getContext('2d', { willReadFrequently: true }), tctx = tgtC.getContext('2d', { willReadFrequently: true });
let tgtBin = null, tgtBox = null, tgtKey = '', tgtCut = AH;

function analyze(){
  const m = S.mask; if (!m || !m.width) { S.stat = null; S.shadowBox = null; S.projBin = null; S.me.present = false; return; }
  rctx.clearRect(0, 0, AW, AH); rctx.drawImage(m, 0, 0, AW, AH);
  S.stat = maskStats(rctx.getImageData(0, 0, AW, AH).data, AW, AH);
  const lamp = S.mode === 'village' && S.village ? S.village.lamp : S.lamp;
  pctx.clearRect(0, 0, AW, AH); pctx.save(); pctx.translate(lamp.x * AW, lamp.y * AH); pctx.scale(-S.s, S.s); pctx.translate(-AW / 2, -AH / 2); pctx.drawImage(m, 0, 0, AW, AH); pctx.restore();
  const pd = pctx.getImageData(0, 0, AW, AH).data; S.shadowBox = maskStats(pd, AW, AH); S.projBin = binarize(pd);
  if (S.stat && S.stat.area < 40) { S.stat = null; S.shadowBox = null; }
  const hFrac = S.stat ? S.stat.h / AH : null;
  S.d = hFrac && S.h0 ? distanceFrom(hFrac, S.h0, S.d0) : null; S.L = wallDistance(S.s); S.Sh = shadowHeight(S.Hb, S.L, S.d); S.mag = magnification(S.L, S.d);
  // 내 그림자(벽 px) — 머리 자리는 투영 마스크 맨 위 몇 줄의 평균 x
  const b = S.shadowBox, me = S.me; me.present = !!b;
  if (b) { me.size = b.h / AH; me.x0 = b.x0 / AW * W; me.x1 = b.x1 / AW * W; me.top = b.y0 / AH * H;
    let sx = 0, n = 0, minx = AW, maxx = 0; const rows = Math.max(2, Math.round(b.h * .1)); for (let y = b.y0; y < Math.min(AH, b.y0 + rows); y++) for (let x = b.x0; x < b.x1; x++) if (S.projBin[y * AW + x]) { sx += x; n++; if (x < minx) minx = x; if (x > maxx) maxx = x; }
    if (n) { me.hx = sx / n / AW * W; me.hw = Math.max(40, (maxx - minx + 1) / AW * W * 1.3); } }
}

// ── 마우스 모드 가짜 마스크
const fake = { x: .5, y: .55, pose: POSES.stand, c: null };
if (km.mouse) { fake.c = document.createElement('canvas'); fake.c.width = 480; fake.c.height = 360;
  const r = () => wall.getBoundingClientRect(); wall.addEventListener('mousemove', e => { const b = r(); fake.x = (e.clientX - b.left) / b.width; fake.y = (e.clientY - b.top) / b.height; });
  window.addEventListener('keydown', e => { const k = Object.keys(POSES)[+e.key - 1]; if (k) fake.pose = POSES[k]; }); }
function fakeMask(){ const c = fake.c, cx = c.getContext('2d'); cx.clearRect(0, 0, c.width, c.height); const hh = (.3 + fake.y * .65) * c.height; drawFigure(cx, fake.pose, (1 - fake.x) * c.width, c.height * .5 + hh * .5, hh, '#fff'); return c; }

km.onFrame = f => { if (km.mouse) S.mask = fakeMask(); else if (f.maskCanvas) S.mask = f.maskCanvas; km.drawCamera(); if (km.mouse) km.drawMouseHelp(); };
km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); };

function loop(t){ raf = requestAnimationFrame(loop); const dt = lastT ? Math.min(.1, (t - lastT) / 1000) : 0; lastT = t;
  if (S.phase === 'start') { drawStage(wctx, W, H, t, { x: .5, y: .5 }); drawLampRail(wctx, W, H, { x: .5, y: .5 }, t); return; }
  if (S.phase === 'calib') { stepCalib(t, dt); return; }
  if (S.phase !== 'play') return;
  analyze(); stepMood(dt, t);
  if (S.mode === 'village') stepVillage(t, dt); else if (S.mode === 'match') stepMatch(t, dt); else stepLab(t, dt);
  updateNums();
  if (q.has('dev')) { $('dev').classList.remove('hidden'); $('dev').textContent = `fps ${km.fps} mask ${!!S.mask} h ${S.stat ? (S.stat.h / AH).toFixed(2) : '-'} h0 ${S.h0 ? S.h0.toFixed(2) : '-'} size ${S.me.size.toFixed(2)} fit ${S.fit.toFixed(2)} s ${S.s} upper ${S.upper}`; }
}

// ── 보정
let calib = { acc: 0, n: 0, start: 0 };
function stepCalib(t, dt){
  const cv = $('calibView'), cc = cv.getContext('2d'); cc.drawImage($('c'), 0, 0, cv.width, cv.height);
  if (km.mouse) S.mask = fakeMask(); analyze();
  if (!S.stat) { calib.start = 0; $('calibMsg').textContent = km.segmentOn && !S.mask ? '사람 분리 모델 준비 중…' : '사람이 안 보여요 — 카메라 앞에 서 주세요'; $('calibNum').textContent = '3'; $('ringFg').style.strokeDashoffset = 327; return; }
  if (!calib.start) { calib.start = t; calib.acc = 0; calib.n = 0; }
  const el = (t - calib.start) / 1000; calib.acc += S.stat.h / AH; calib.n++;
  $('calibMsg').textContent = '좋아요, 그대로 있어요'; $('calibNum').textContent = Math.max(1, Math.ceil(3 - el)); $('ringFg').style.strokeDashoffset = 327 * (1 - Math.min(1, el / 3));
  if (el >= 3) { S.h0 = calib.acc / calib.n; S.y0 = S.stat.y0 / AH; if (S.body === 'auto') S.upper = S.stat.y1 >= AH - 2; else S.upper = S.body === 'upper'; beginPlay(); }
}

// ── 괴물 기분: 크기→눈빛·뿔, 급히 커지면 으르렁, 도둑 쪽을 본다
function stepMood(dt, t){ const m = S.mood, me = S.me; const size = me.present ? me.size : 0;
  m.glow += ((me.present ? .3 + size * .7 : 0) - m.glow) * Math.min(1, dt * 6);
  m.horn += (Math.max(0, Math.min(1, (size - .35) / .5)) - m.horn) * Math.min(1, dt * 4);
  const grow = (size - S.prevSize) / Math.max(dt, .016); S.prevSize = size;
  if (grow > .5 && t - S.growlT > 900 && me.present) { m.roar = 1; S.growlT = t; if (S.sound) A.growl(size); }
  m.roar = Math.max(0, m.roar - dt * 1.6);
  if (t > S.blinkT) { m.blink = !m.blink; S.blinkT = t + (m.blink ? 110 : 1800 + Math.random() * 2600); }
  let look = 0; if (S.village) { const th = S.village.thieves.find(x => x.state === 'sneak'); if (th) look = Math.max(-1, Math.min(1, (th.x - me.hx) / (W * .3))); } m.lookX += (look - m.lookX) * Math.min(1, dt * 5);
}
function drawMe(lamp){ drawShadow(wctx, S.mask, W, H, S.s, lamp || S.lamp); if (S.me.present && S.mode !== 'lab') { const hh = Math.max(80, S.me.size * H); drawMonsterFace(wctx, S.me.hx, S.me.top, S.me.hw, hh, S.mood, performance.now()); } }
function pop(text, cls = '', x = 50, y = 40){ const d = document.createElement('div'); d.className = 'pop ' + cls; d.textContent = text; d.style.left = x + '%'; d.style.top = y + '%'; pops.appendChild(d); setTimeout(() => d.remove(), 1100); }
function flash(){ const f = $('flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
function updateNums(){ $('hD').textContent = S.d ? Math.round(S.d) + 'cm' : '—'; $('hS').textContent = S.Sh ? Math.round(S.Sh) + 'cm' : '—'; $('hM').textContent = S.mag ? S.mag.toFixed(1) + '×' : '—'; }
const cmPerPx = () => (S.h0 ? S.Hb * DEF.L0 * (S.upper ? .55 : 1) / (S.d0 * S.h0 * H) : 0);

// ══ 마을을 지켜라 ══
function stepVillage(t, dt){
  const v = S.village; const me = S.me;
  if (S.introT > 0) { S.introT -= dt; drawStage(wctx, W, H, t, v.lamp); v.draw(wctx, t / 1000, me); drawMe(v.lamp);
    const k = 1 - Math.max(0, S.introT / 4); wctx.save(); wctx.fillStyle = `rgba(0,0,0,${.55 * (1 - k)})`; wctx.fillRect(0, 0, W, H); wctx.restore();
    banner(wctx, W, S.introT > 2 ? '어둠 속에서… 네 그림자가 눈을 떴어' : '너는 이제 그림자 괴물. 마을의 등불 5개를 지켜!', 150, '#ffe9b0', 34);
    banner(wctx, W, '도둑이 오면 그림자를 그 위로 크게 드리워요. 너무 크면 마을 사람들이 무서워해요', H * .2 + 48, '#fff', 22);
    if (S.introT <= 0) { v.t = 0; v.next = 2; } return; }
  v.update(dt, t / 1000, me);
  for (const e of v.events) { if (e.kind === 'scare') pop(e.text, 'good', e.x * 100, 60); else { pop(e.text, 'bad', e.x * 100, 60); flash(); } } v.events.length = 0;
  drawStage(wctx, W, H, t, v.lamp); v.draw(wctx, t / 1000, me); drawMe(v.lamp);
  $('hTime').textContent = Math.max(0, Math.ceil(ROUND - v.t)); $('hScore').textContent = v.score; $('hLife').textContent = '🏮'.repeat(v.lanterns) + '·'.repeat(5 - v.lanterns);
  if (!me.present) banner(wctx, W, '사람이 안 보여요', 150, '#ff5c7a', 30);
  if (v.over) { S.score = v.score; setTimeout(() => endGame(), 300); S.phase = 'ending'; }
}

// ══ 괴물 만들기 ══
const calibShadowH = () => Math.max(H * .15, S.h0 * S.s * H / (S.upper ? .55 : 1));
const calibTopY = () => (0.5 - (0.5 - S.y0) * S.s) * H;
const targetH = mon => Math.min(H * 1.3, mon.size / .6 * calibShadowH());
function targetFn(mon){ const Hpx = targetH(mon); return c => drawFigure(c, mon.pose, W / 2 + (mon.dx || 0) * W, S.upper ? Math.min(H * 1.4, calibTopY() + Hpx) : H * .86, Hpx); }
function cutY(mon){ if (!S.upper) return H; const Hpx = targetH(mon); return Math.min(H * 1.4, calibTopY() + Hpx) - Hpx * .45; }
function prepTarget(mon){ const key = mon.id + mon.size + (S.upper ? 'u' : 'f') + S.s.toFixed(2); if (tgtKey === key) return; tgtKey = key; tgtCut = Math.round(cutY(mon) / H * AH);
  tctx.clearRect(0, 0, AW, AH); tctx.save(); tctx.scale(AW / W, AH / H); targetFn(mon)(tctx); tctx.restore(); tctx.clearRect(0, tgtCut, AW, AH - tgtCut);
  const d = tctx.getImageData(0, 0, AW, AH).data; tgtBin = binarize(d); tgtBox = maskStats(d, AW, AH); }
function iouCut(a, b, cut){ if (cut >= AH) return iou(a, b); return iou(a.subarray(0, cut * AW), b.subarray(0, cut * AW)); }
function stepMatch(t, dt){
  if (S.idx >= MONSTERS.length) { drawStage(wctx, W, H, t, S.lamp); drawMe(); return; }
  const mon = MONSTERS[S.idx]; prepTarget(mon);
  S.fit = (S.projBin && tgtBin) ? iouCut(S.projBin, tgtBin, tgtCut) : 0; S.timeLeft = Math.max(0, 25 - (t - S.tTarget) / 1000);
  if (S.fit >= .55) { S.holdT += dt; S.bestFit = Math.max(S.bestFit, S.fit); } else S.holdT = Math.max(0, S.holdT - dt * 2);
  if (S.holdT >= 1) return finishTarget(t, S.bestFit >= .75 ? 3 : S.bestFit >= .65 ? 2 : 1);
  if (S.timeLeft <= 0) return finishTarget(t, 0);
  drawStage(wctx, W, H, t, S.lamp); const cy = cutY(mon);
  drawTarget(wctx, c => { c.save(); c.beginPath(); c.rect(0, 0, W, cy); c.clip(); targetFn(mon)(c); c.restore(); }, S.fit, t); drawMe(); drawLampRail(wctx, W, H, S.lamp, t);
  if (S.upper) { wctx.save(); wctx.strokeStyle = 'rgba(255,255,255,.35)'; wctx.setLineDash([10, 8]); wctx.beginPath(); wctx.moveTo(0, cy); wctx.lineTo(W, cy); wctx.stroke(); wctx.setLineDash([]); wctx.fillStyle = 'rgba(255,255,255,.55)'; wctx.font = '700 18px sans-serif'; wctx.textAlign = 'left'; wctx.fillText('상반신만 비교', 90, cy - 8); wctx.restore(); }
  banner(wctx, W, `${S.idx + 1}/${MONSTERS.length}  ${mon.name}`, 150, '#fff', 36);
  let hint = mon.tip, col = '#ffe9b0';
  if (S.shadowBox && tgtBox) { const myH = S.upper ? Math.max(1, Math.min(S.shadowBox.y1, tgtCut) - S.shadowBox.y0) : S.shadowBox.h; const r = tgtBox.h / myH; const dx = (tgtBox.cx - S.shadowBox.cx) / AW;
    if (r > 1.18) { hint = '더 크게! 빛(카메라)에 가까이 와요'; col = '#ffd35c'; } else if (r < .85) { hint = '더 작게! 빛에서 뒤로 물러나요'; col = '#4de1ff'; }
    else if (Math.abs(dx) > .12) { hint = dx > 0 ? '오른쪽으로 조금 →' : '← 왼쪽으로 조금'; } else if (S.fit >= .55) { hint = '좋아요! 그대로 멈춰요 ' + '●'.repeat(Math.ceil(S.holdT * 3)); col = '#5cf2a4'; } }
  else if (!S.stat) { hint = '사람이 안 보여요'; col = '#ff5c7a'; }
  banner(wctx, W, hint, H - 44, col, 30);
  $('hTime').textContent = Math.ceil(S.timeLeft); $('hFit').textContent = Math.round(S.fit * 100) + '%'; $('fitFill').style.width = Math.round(S.fit * 100) + '%';
}
function finishTarget(t, stars){ S.stars[S.idx] = stars; S.score += stars * 100 + (stars ? Math.round(S.timeLeft) * 4 : 0); $('hScore').textContent = S.score;
  pop(stars ? '★'.repeat(stars) + (stars === 3 ? ' 완벽!' : stars === 2 ? ' 잘했어요' : ' 성공') : '시간 끝', stars ? 'gold' : 'bad'); if (S.sound) { if (stars) A.bell(stars); else A.steal(); }
  S.idx++; S.holdT = 0; S.bestFit = 0; S.tTarget = t + 900; tgtKey = ''; if (S.idx >= MONSTERS.length) { S.phase = 'ending'; setTimeout(() => endGame(), 900); } }

// ══ 그림자 실험실 ══
function stepLab(t, dt){
  drawStage(wctx, W, H, t, S.lamp); drawMe(); drawLampRail(wctx, W, H, S.lamp, t);
  if (S.shadowBox) { const y = S.shadowBox.y0 / AH * H; wctx.save(); wctx.strokeStyle = 'rgba(77,225,255,.8)'; wctx.setLineDash([8, 6]); wctx.lineWidth = 2; wctx.beginPath(); wctx.moveTo(W * .08, y); wctx.lineTo(W * .92, y); wctx.stroke(); wctx.setLineDash([]);
    wctx.fillStyle = '#4de1ff'; wctx.font = '900 26px sans-serif'; wctx.textAlign = 'right'; wctx.fillText(S.Sh ? `그림자 키 ${Math.round(S.Sh)}cm` : '보정 자리에 서면 수치가 나와요', W * .92, y - 10); wctx.restore(); }
  if (S.side) drawSideView(wctx, { x: W - 330, y: H - 440, w: 310, h: 190 }, S.d, S.L, S.Hb, S.Sh);
  if (S.rows.length) drawChart(wctx, { x: W - 330, y: H - 240 - (S.side ? 0 : 200), w: 310, h: 180 }, S.rows, S.Hb, S.L);
  banner(wctx, W, S.d ? `광원까지 ${Math.round(S.d)}cm  →  그림자는 키의 ${S.mag.toFixed(1)}배` : '카메라가 전등이에요. 다가가 보세요', 150, '#fff', 34);
}
function labRecord(){ if (!S.d) return pop('사람이 안 보여요', 'bad'); const r = { d: Math.round(S.d), L: Math.round(S.L), S: Math.round(S.Sh), m: +S.mag.toFixed(2) }; S.rows.push(r);
  const tb = $('recTable').querySelector('tbody'); const tr = document.createElement('tr'); tr.innerHTML = `<td>${S.rows.length}</td><td>${r.d}</td><td>${r.L}</td><td>${r.S}</td><td>${r.m}×</td>`; tb.appendChild(tr); pop('기록 📏', 'gold', 28, 30); if (S.sound) A.bell(1);
  const qs = ['거리를 반으로 줄이면 그림자 키는 몇 배가 될까요?', '벽을 멀리 보내면 그림자는 어떻게 될까요? 거리는 그대로 두고 손잡이만 움직여 봐요', '배율이 2배인 자리를 찾아 서 볼까요?', '친구와 둘이 서면 그림자 두 개의 배율은 같을까요?'];
  $('labQ').textContent = qs[Math.min(qs.length - 1, Math.floor(S.rows.length / 2))]; }
function labClear(){ S.rows = []; $('recTable').querySelector('tbody').innerHTML = ''; }
function labCopy(){ const txt = ['번호\t광원까지(cm)\t벽까지(cm)\t그림자 키(cm)\t배율', ...S.rows.map((r, i) => `${i + 1}\t${r.d}\t${r.L}\t${r.S}\t${r.m}`)].join('\n'); navigator.clipboard?.writeText(txt).then(() => pop('복사됨', 'good', 28, 30), () => pop('복사 실패', 'bad', 28, 30)); }

// ── 흐름
function show(id){ for (const s of ['scr-start', 'scr-calib', 'scr-result']) $(s).classList.toggle('hidden', s !== id); $('hud').classList.toggle('hidden', id !== null); }
async function start(){ S.Hb = +$('inHb').value || DEF.Hb; S.d0 = +$('inD0').value || DEF.d0; $('inHb2').value = S.Hb; $('hbV').textContent = S.Hb + 'cm'; if (S.sound) A.audioOn();
  show('scr-calib'); S.phase = 'calib'; calib = { acc: 0, n: 0, start: 0 }; $('hud').classList.add('hidden');
  try { if (!km.running) await km.start(); if (!km.mouse) { $('calibMsg').textContent = '사람 분리 모델 준비 중…'; await km.setSegment(true); } }
  catch (e) { $('calibMsg').textContent = '카메라를 열 수 없어요: ' + e.message + ' — 카메라 없이 보려면 주소 뒤에 ?mouse=1'; } }
function beginPlay(){ S.phase = 'play'; show(null); $('hud').classList.remove('hidden'); const t = performance.now();
  S.score = 0; S.t0 = t; S.idx = 0; S.stars = []; S.holdT = 0; S.bestFit = 0; S.tTarget = t; tgtKey = ''; S.lamp = { x: .5, y: .5 }; S.village = null; S.prevSize = 0;
  if (S.mode === 'village') { S.village = new Village(W, H); S.introT = 4; if (S.sound) { A.ambience(true); A.growl(.4); } }
  $('hScore').textContent = 0; $('hLife').textContent = '🏮🏮🏮🏮🏮'; syncBody();
  const m = S.mode; $('stTime').classList.toggle('hidden', m === 'lab'); $('stScore').classList.toggle('hidden', m === 'lab'); $('stLife').classList.toggle('hidden', m !== 'village'); $('stFit').classList.toggle('hidden', m !== 'match'); $('fitbar').classList.toggle('hidden', m !== 'match'); $('labpanel').classList.toggle('hidden', m !== 'lab'); $('stNums').classList.toggle('hidden', m === 'village'); }
function endGame(){ S.phase = 'result'; show('scr-result'); A.ambience(false);
  if (S.mode === 'village') { const v = S.village; const st = v.lanterns === 5 ? 3 : v.lanterns >= 3 ? 2 : v.lanterns > 0 ? 1 : 0; if (S.sound) A.bell(st || 1);
    $('resTitle').textContent = st === 3 ? '등불 다섯 개, 전부 지켰어!' : st >= 1 ? '마을을 지켰어!' : '등불이 모두 꺼졌어…';
    $('resBody').innerHTML = `<div class="big-num">${v.score}</div><div class="stars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</div><p>남은 등불 ${v.lanterns} · 쫓아낸 도둑 ${v.scared} · 뺏긴 등불 ${v.stolen}</p><p class="note">빛에 가까이 가면 그림자가 커지고, 물러나면 작아져요. 전등이 옆으로 가면 그림자는 반대쪽으로 늘어나고, 전등이 낮으면 그림자가 길어져요 — 빛은 똑바로 가니까요.</p>`; }
  else if (S.mode === 'match') { const tot = S.stars.reduce((a, b) => a + (b || 0), 0); $('resTitle').textContent = tot >= 27 ? '그림자 괴물 마스터!' : tot >= 18 ? '멋진 그림자!' : '괴물 만들기 끝';
    $('resBody').innerHTML = `<div class="big-num">${S.score}</div><div class="stars">${MONSTERS.map((m, i) => (S.stars[i] ? '★'.repeat(S.stars[i]) : '☆')).join(' · ')}</div><p class="note">그림자 크기는 광원과 물체의 거리로 정해져요.</p>`; }
  else { $('resTitle').textContent = '실험 끝'; $('resBody').innerHTML = `<p>기록 ${S.rows.length}줄</p><p class="note">기록표는 「복사」로 가져갈 수 있어요.</p>`; } }

// ── 단추
$('modeSeg').querySelectorAll('button').forEach(b => b.onclick = () => { $('modeSeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.mode = b.dataset.v; });
const BODY_KEY = 'kmotion.shadow.body'; try { S.body = localStorage.getItem(BODY_KEY) || 'auto'; } catch (_) {}
$('bodySeg').querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === S.body); b.onclick = () => { $('bodySeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.body = b.dataset.v; try { localStorage.setItem(BODY_KEY, S.body); } catch (_) {} }; });
function syncBody(){ $('btnBody').textContent = S.upper ? '상반신' : '전신'; }
$('btnBody').onclick = () => { S.upper = !S.upper; tgtKey = ''; syncBody(); pop(S.upper ? '상반신만 비교' : '전신 비교', 'gold', 24, 70); };
$('btnSound').onclick = e => { S.sound = !S.sound; e.target.textContent = S.sound ? '🔊' : '🔇'; if (S.sound) { A.audioOn(); if (S.mode === 'village' && S.phase === 'play') A.ambience(true); } else A.ambience(false); };
$('btnStart').onclick = start; $('btnCalibCancel').onclick = () => { S.phase = 'start'; show('scr-start'); };
$('btnQuit').onclick = () => endGame();
$('btnAgain').onclick = () => { if (S.h0) beginPlay(); else start(); }; $('btnHome').onclick = () => { S.phase = 'start'; show('scr-start'); };
$('inWall').oninput = e => { S.s = +e.target.value; $('wallV').textContent = Math.round(wallDistance(S.s)) + 'cm'; };
$('inHb2').oninput = e => { S.Hb = +e.target.value; $('hbV').textContent = S.Hb + 'cm'; };
$('btnRec').onclick = labRecord; $('btnClear').onclick = labClear; $('btnCopy').onclick = labCopy; $('btnSide').onclick = e => { S.side = !S.side; e.target.classList.toggle('on', S.side); };
window.addEventListener('keydown', e => { if (S.phase !== 'play') return; if (e.key === 'r' && S.mode === 'lab') labRecord(); if (e.key === 'Escape') endGame(); });
$('wallV').textContent = Math.round(wallDistance(S.s)) + 'cm';
S.phase = 'start'; show('scr-start'); $('hud').classList.add('hidden');
raf = requestAnimationFrame(loop);
