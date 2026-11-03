/* 그림자 괴물 · 시스템 층(상태·판정·흐름). 그리기는 render.js, 수식은 physics.js, 모양은 silhouette.js
 * 세 모드: match(괴물 만들기) · chase(괴물 쫓기) · lab(그림자 실험실)
 * 입력은 케이모션 엔진의 사람 마스크(selfie segmenter) 하나뿐 — 관절 인식이 필요 없어 1~2명·멀리서도 안정적
 * 마우스 모드(?mouse=1): 마우스 x=자리, y=거리(아래=가까이), 키 1~9 = 포즈
 */
import { DEF, maskStats, distanceFrom, wallDistance, shadowHeight, magnification, iou, binarize } from './physics.js';
import { drawFigure, MONSTERS, CHASERS, drawBat, POSES } from './silhouette.js';
import { WALL, drawWall, drawShadow, drawTarget, drawSideView, drawChart, banner } from './render.js';

const $ = id => document.getElementById(id);
const wall = $('wall'), wctx = wall.getContext('2d'); const W = WALL.W, H = WALL.H;
const q = new URLSearchParams(location.search);
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['motion'], segment: true, activity: 'shadow', inferEvery: 1 });
km.maskSmooth = .45;

// ── 상태
const S = { mode: 'match', Hb: DEF.Hb, d0: DEF.d0, s: DEF.s, h0: null, phase: 'start',   // phase: start|calib|play|result
  mask: null, stat: null, shadowBox: null, d: null, L: null, Sh: null, mag: null,
  score: 0, life: 3, combo: 0, t0: 0, timeLeft: 0, result: null, side: true, rows: [],
  // match
  idx: 0, fit: 0, bestFit: 0, holdT: 0, stars: [], tTarget: 0,
  // chase
  mobs: [], nextSpawn: 0, spawnGap: 3400, judged: 0, dodged: 0, scared: 0 };
let raf = 0, lastT = 0, pops = $('pops');

// ── 저해상 분석판(160×120): 원본 마스크(거리 추정)·투영 그림자(IoU·그림자 상자)·목표
const AW = 160, AH = 120;
const mk = () => { const c = document.createElement('canvas'); c.width = AW; c.height = AH; return c; };
const rawC = mk(), projC = mk(), tgtC = mk();
const rctx = rawC.getContext('2d', { willReadFrequently: true }), pctx = projC.getContext('2d', { willReadFrequently: true }), tctx = tgtC.getContext('2d', { willReadFrequently: true });
let tgtBin = null, tgtBox = null, tgtKey = '', tgtCut = AH;   // tgtCut: 상반신 모드일 때 판정 아래 경계(분석판 y)

function analyze(){
  const m = S.mask; if (!m || !m.width) { S.stat = null; S.shadowBox = null; S.projBin = null; return; }
  rctx.clearRect(0, 0, AW, AH); rctx.drawImage(m, 0, 0, AW, AH);
  S.stat = maskStats(rctx.getImageData(0, 0, AW, AH).data, AW, AH);
  pctx.clearRect(0, 0, AW, AH); pctx.save(); pctx.translate(AW / 2, AH / 2); pctx.scale(-S.s, S.s); pctx.translate(-AW / 2, -AH / 2); pctx.drawImage(m, 0, 0, AW, AH); pctx.restore();
  const pd = pctx.getImageData(0, 0, AW, AH).data; S.shadowBox = maskStats(pd, AW, AH); S.projBin = binarize(pd);
  if (S.stat && S.stat.area < 40) { S.stat = null; S.shadowBox = null; }
  // 물리 수치
  const hFrac = S.stat ? S.stat.h / AH : null;
  S.d = hFrac && S.h0 ? distanceFrom(hFrac, S.h0, S.d0) : null; S.L = wallDistance(S.s); S.Sh = shadowHeight(S.Hb, S.L, S.d); S.mag = magnification(S.L, S.d);
}

// ── 마우스 모드 가짜 마스크(카메라 없이 개발·시연)
const fake = { x: .5, y: .55, pose: POSES.stand, c: null };
if (km.mouse) { fake.c = document.createElement('canvas'); fake.c.width = 480; fake.c.height = 360;
  const r = () => wall.getBoundingClientRect();
  wall.addEventListener('mousemove', e => { const b = r(); fake.x = (e.clientX - b.left) / b.width; fake.y = (e.clientY - b.top) / b.height; });
  window.addEventListener('keydown', e => { const k = Object.keys(POSES)[+e.key - 1]; if (k) fake.pose = POSES[k]; });
}
function fakeMask(){ const c = fake.c, cx = c.getContext('2d'); cx.clearRect(0, 0, c.width, c.height);
  const hh = (.3 + fake.y * .65) * c.height; drawFigure(cx, fake.pose, (1 - fake.x) * c.width, c.height * .5 + hh * .5, hh, '#fff'); return c; }

// ── 프레임
km.onFrame = f => { if (km.mouse) S.mask = fakeMask(); else if (f.maskCanvas) S.mask = f.maskCanvas; km.drawCamera(); if (km.mouse) km.drawMouseHelp(); };
km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); };

function loop(t){ raf = requestAnimationFrame(loop); const dt = lastT ? Math.min(.1, (t - lastT) / 1000) : 0; lastT = t;
  if (S.phase === 'calib') { stepCalib(t, dt); return; }
  if (S.phase !== 'play') return;
  analyze();
  if (S.mode === 'match') stepMatch(t, dt); else if (S.mode === 'chase') stepChase(t, dt); else stepLab(t, dt);
  updateNums();
  if (q.has('dev')) { $('dev').classList.remove('hidden'); $('dev').textContent = `fps ${km.fps} mask ${!!S.mask} h ${S.stat ? (S.stat.h / AH).toFixed(2) : '-'} h0 ${S.h0 ? S.h0.toFixed(2) : '-'} fit ${S.fit.toFixed(2)} s ${S.s}`; }
}

// ── 보정: 3초 동안 키 비율 평균 → h0
let calib = { acc: 0, n: 0, start: 0 };
function stepCalib(t, dt){
  const cv = $('calibView'), cc = cv.getContext('2d'); cc.drawImage($('c'), 0, 0, cv.width, cv.height);
  if (km.mouse) S.mask = fakeMask(); analyze();
  if (!S.stat) { calib.start = 0; $('calibMsg').textContent = km.segmentOn && !S.mask ? '사람 분리 모델 준비 중…' : '사람이 안 보여요 — 카메라 앞에 서 주세요'; $('calibNum').textContent = '3'; $('ringFg').style.strokeDashoffset = 327; return; }
  if (!calib.start) { calib.start = t; calib.acc = 0; calib.n = 0; }
  const el = (t - calib.start) / 1000; calib.acc += S.stat.h / AH; calib.n++;
  $('calibMsg').textContent = '좋아요, 그대로 서 있어요'; $('calibNum').textContent = Math.max(1, Math.ceil(3 - el)); $('ringFg').style.strokeDashoffset = 327 * (1 - Math.min(1, el / 3));
  if (el >= 3) { S.h0 = calib.acc / calib.n; S.y0 = S.stat.y0 / AH; if (S.body === 'auto') S.upper = S.stat.y1 >= AH - 2; else S.upper = S.body === 'upper'; beginPlay(); }
}

// ── 공통 그리기
function drawBase(t){ drawWall(wctx, W, H, t); }
function drawMe(){ drawShadow(wctx, S.mask, W, H, S.s, { mirror: true }); }
function pop(text, cls = '', x = 50, y = 40){ const d = document.createElement('div'); d.className = 'pop ' + cls; d.textContent = text; d.style.left = x + '%'; d.style.top = y + '%'; pops.appendChild(d); setTimeout(() => d.remove(), 1100); }
function flash(){ const f = $('flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
function updateNums(){ $('hD').textContent = S.d ? Math.round(S.d) + 'cm' : '—'; $('hS').textContent = S.Sh ? Math.round(S.Sh) + 'cm' : '—'; $('hM').textContent = S.mag ? S.mag.toFixed(1) + '×' : '—'; }

// 보정 자리에서의 내 그림자(벽 px): 목표·괴물 크기는 전부 이 값의 배수 — 앉아서 웹캠 앞이든, 서서 전자칠판 앞이든 같은 난이도
const calibShadowH = () => Math.max(H * .15, S.h0 * S.s * H / (S.upper ? .55 : 1));      // 상반신이면 보이는 건 키의 55%(머리~허리)
const calibTopY = () => (0.5 - (0.5 - S.y0) * S.s) * H;                                    // 보정 때 그림자 머리 꼭대기 y
const targetH = mon => Math.min(H * 1.3, mon.size / .6 * calibShadowH());

// ══ 괴물 만들기 ══
function targetFn(mon){ const Hpx = targetH(mon); return c => drawFigure(c, mon.pose, W / 2 + (mon.dx || 0) * W, S.upper ? Math.min(H * 1.4, calibTopY() + Hpx) : H * .97, Hpx); }
/** 상반신 모드: 목표 허리선(발에서 키의 45% 위) 아래는 그리지도 재지도 않는다 */
function cutY(mon){ if (!S.upper) return H; const Hpx = targetH(mon); return Math.min(H * 1.4, calibTopY() + Hpx) - Hpx * .45; }
function prepTarget(mon){ const key = mon.id + mon.size + (S.upper ? 'u' : 'f') + S.s.toFixed(2); if (tgtKey === key) return; tgtKey = key;
  tgtCut = Math.round(cutY(mon) / H * AH);
  tctx.clearRect(0, 0, AW, AH); tctx.save(); tctx.scale(AW / W, AH / H); targetFn(mon)(tctx); tctx.restore();
  tctx.clearRect(0, tgtCut, AW, AH - tgtCut);
  const d = tctx.getImageData(0, 0, AW, AH).data; tgtBin = binarize(d); tgtBox = maskStats(d, AW, AH); }
/** 상반신 모드 IoU: 허리선 아래 픽셀은 둘 다 무시 */
function iouCut(a, b, cut){ if (cut >= AH) return iou(a, b); return iou(a.subarray(0, cut * AW), b.subarray(0, cut * AW)); }
function stepMatch(t, dt){
  if (S.idx >= MONSTERS.length) { drawBase(t); drawMe(); return; }
  const mon = MONSTERS[S.idx]; prepTarget(mon);
  S.fit = (S.projBin && tgtBin) ? iouCut(S.projBin, tgtBin, tgtCut) : 0;
  S.timeLeft = Math.max(0, 25 - (t - S.tTarget) / 1000);
  // 판정: 0.55 이상을 1초 유지하면 성공. 별은 그동안의 최고치
  if (S.fit >= .55) { S.holdT += dt; S.bestFit = Math.max(S.bestFit, S.fit); } else S.holdT = Math.max(0, S.holdT - dt * 2);
  if (S.holdT >= 1) return finishTarget(t, S.bestFit >= .75 ? 3 : S.bestFit >= .65 ? 2 : 1);
  if (S.timeLeft <= 0) return finishTarget(t, 0);
  // 그리기
  drawBase(t); const cy = cutY(mon); drawTarget(wctx, c => { c.save(); c.beginPath(); c.rect(0, 0, W, cy); c.clip(); targetFn(mon)(c); c.restore(); }, S.fit, t); drawMe();
  if (S.upper) { wctx.save(); wctx.strokeStyle = 'rgba(255,255,255,.35)'; wctx.setLineDash([10, 8]); wctx.beginPath(); wctx.moveTo(0, cy); wctx.lineTo(W, cy); wctx.stroke(); wctx.setLineDash([]); wctx.fillStyle = 'rgba(255,255,255,.55)'; wctx.font = '700 18px sans-serif'; wctx.textAlign = 'left'; wctx.fillText('상반신만 비교', 16, cy - 8); wctx.restore(); }
  banner(wctx, W, `${S.idx + 1}/${MONSTERS.length}  ${mon.name}`, 150, '#fff', 36);
  // 크기 힌트: 목표 상자 vs 내 그림자 상자(투영 후)
  let hint = mon.tip, col = '#ffe9b0';
  if (S.shadowBox && tgtBox) { const myH = S.upper ? Math.max(1, Math.min(S.shadowBox.y1, tgtCut) - S.shadowBox.y0) : S.shadowBox.h; const r = tgtBox.h / myH; const dx = (tgtBox.cx - S.shadowBox.cx) / AW;
    if (r > 1.18) { hint = '더 크게! 빛(카메라)에 가까이 와요'; col = '#ffd35c'; } else if (r < .85) { hint = '더 작게! 빛에서 뒤로 물러나요'; col = '#4de1ff'; }
    else if (Math.abs(dx) > .12) { hint = dx > 0 ? '오른쪽으로 조금 →' : '← 왼쪽으로 조금'; } else if (S.fit >= .55) { hint = '좋아요! 그대로 멈춰요 ' + '●'.repeat(Math.ceil(S.holdT * 3)); col = '#5cf2a4'; } }
  else if (!S.stat) { hint = '사람이 안 보여요'; col = '#ff5c7a'; }
  banner(wctx, W, hint, H - 44, col, 30);
  $('hTime').textContent = Math.ceil(S.timeLeft); $('hFit').textContent = Math.round(S.fit * 100) + '%'; $('fitFill').style.width = Math.round(S.fit * 100) + '%';
}
function finishTarget(t, stars){ S.stars[S.idx] = stars; S.score += stars * 100 + (stars ? Math.round(S.timeLeft) * 4 : 0); $('hScore').textContent = S.score;
  pop(stars ? '★'.repeat(stars) + (stars === 3 ? ' 완벽!' : stars === 2 ? ' 잘했어요' : ' 성공') : '시간 끝', stars ? 'gold' : 'bad');
  S.idx++; S.holdT = 0; S.bestFit = 0; S.tTarget = t + 900; tgtKey = '';
  if (S.idx >= MONSTERS.length) setTimeout(() => endGame(), 900); }

// 벽 1px = 몇 cm (보정값으로 정해짐: 그림자 키 S = Hb·L/d 와 화면 높이 h·H·s 를 맞춘 것)
const cmPerPx = () => (S.h0 ? S.Hb * DEF.L0 * (S.upper ? .55 : 1) / (S.d0 * S.h0 * H) : 0);

// ══ 괴물 쫓기 ══
function spawnMob(t){ const kinds = Object.keys(CHASERS); const k = kinds[Math.random() < .35 ? 2 : Math.random() < .5 ? 0 : 1]; const c = CHASERS[k];
  const side = Math.random() < .5 ? -1 : 1, speed = 2600 - Math.min(1200, S.judged * 70);
  const mob = { k, ...c, side, t0: t, dur: speed, x: side < 0 ? -W * .15 : W * 1.15, state: 'in' };
  if (c.kind === 'scare') mob.hpx = Math.min(H * .95, (.8 + Math.random() * .7) * calibShadowH()); else { mob.w = W * .22; mob.bottomY = Math.min(H * .85, calibTopY() + (.08 + Math.random() * .25) * H); }
  S.mobs.push(mob); }
function stepChase(t, dt){
  S.timeLeft = Math.max(0, 60 - (t - S.t0) / 1000); $('hTime').textContent = Math.ceil(S.timeLeft);
  if (S.timeLeft <= 0 || S.life <= 0) return endGame();
  if (t >= S.nextSpawn) { spawnMob(t); S.nextSpawn = t + S.spawnGap - Math.min(1600, S.judged * 90); }
  drawBase(t); drawMe();
  const myTop = S.shadowBox ? S.shadowBox.y0 / AH * H : H, myH = S.shadowBox ? S.shadowBox.h / AH * H : 0;
  for (const m of S.mobs) {
    const p = Math.min(1, (t - m.t0) / m.dur);
    if (m.state === 'in') { m.x = m.side < 0 ? -W * .15 + (W * .5 + W * .15) * p : W * 1.15 - (W * .65) * p;
      if (p >= 1) { S.judged++; m.state = 'judge'; m.tj = t;
        if (m.kind === 'scare') { const mTop = (S.upper ? Math.min(H * 1.4, calibTopY() + m.hpx) : H * .97) - m.hpx; const win = S.stat && (S.upper ? myTop <= mTop - 6 : myH >= m.hpx * 1.02); m.win = win; if (win) { S.combo++; S.scared++; S.score += 100 + S.combo * 20; pop(`${m.name} 도망! +${100 + S.combo * 20}`, 'good'); } else { S.combo = 0; S.life--; flash(); pop(S.stat ? '더 크게 — 빛에 가까이!' : '사람이 안 보여요', 'bad'); } }
        else { const win = S.stat && myTop > m.bottomY + 8; m.win = win; if (win) { S.combo++; S.dodged++; S.score += 100 + S.combo * 20; pop(`박쥐 통과! +${100 + S.combo * 20}`, 'good'); } else { S.combo = 0; S.life--; flash(); pop('그림자를 낮춰요 — 뒤로 물러나거나 앉아요', 'bad'); } }
        $('hScore').textContent = S.score; $('hLife').textContent = '❤'.repeat(S.life) + '♡'.repeat(3 - S.life); } }
    else if (m.state === 'judge') { const e = (t - m.tj) / 900; if (m.win) m.x += m.side * W * .9 * dt; if (e >= 1) m.state = 'out'; }
    // 그리기
    if (m.kind === 'scare') { const col = m.state === 'judge' ? (m.win ? '#5cf2a4' : '#ff5c7a') : m.color; drawFigure(wctx, m.pose, m.x, S.upper ? Math.min(H * 1.4, calibTopY() + m.hpx) : H * .97, m.hpx, col);
      // 키 눈금
      wctx.save(); wctx.strokeStyle = 'rgba(255,255,255,.55)'; wctx.setLineDash([6, 6]); const ty = (S.upper ? Math.min(H * 1.4, calibTopY() + m.hpx) : H * .97) - m.hpx; wctx.beginPath(); wctx.moveTo(m.x - 120, ty); wctx.lineTo(m.x + 120, ty); wctx.stroke(); wctx.setLineDash([]);
      wctx.fillStyle = '#fff'; wctx.font = '800 20px sans-serif'; wctx.textAlign = 'center'; wctx.fillText(`${m.name} ${Math.round(m.hpx * cmPerPx())}cm`, m.x, ty - 10); wctx.restore(); }
    else { const col = m.state === 'judge' ? (m.win ? '#5cf2a4' : '#ff5c7a') : m.color; drawBat(wctx, m.x, m.bottomY - m.w * .1, m.w, col, t / 90);
      wctx.save(); wctx.strokeStyle = 'rgba(255,255,255,.55)'; wctx.setLineDash([6, 6]); wctx.beginPath(); wctx.moveTo(m.x - 140, m.bottomY); wctx.lineTo(m.x + 140, m.bottomY); wctx.stroke(); wctx.setLineDash([]);
      wctx.fillStyle = '#fff'; wctx.font = '800 20px sans-serif'; wctx.textAlign = 'center'; wctx.fillText('이 선 아래로 숨어요', m.x, m.bottomY + 26); wctx.restore(); }
  }
  S.mobs = S.mobs.filter(m => m.state !== 'out');
  const nxt = S.mobs.find(m => m.state === 'in');
  banner(wctx, W, nxt ? (nxt.kind === 'scare' ? `${nxt.name}가 와요 — 그림자를 더 크게!` : '박쥐! 그림자를 낮춰 피해요') : '다음 괴물을 기다려요', H - 44, '#ffe9b0', 30);
}

// ══ 그림자 실험실 ══
function stepLab(t, dt){
  drawBase(t); drawMe();
  // 그림자 키 눈금선
  if (S.shadowBox) { const y = S.shadowBox.y0 / AH * H, yb = Math.min(H, S.shadowBox.y1 / AH * H); wctx.save(); wctx.strokeStyle = 'rgba(77,225,255,.8)'; wctx.setLineDash([8, 6]); wctx.lineWidth = 2; wctx.beginPath(); wctx.moveTo(W * .08, y); wctx.lineTo(W * .92, y); wctx.stroke(); wctx.setLineDash([]);
    wctx.fillStyle = '#4de1ff'; wctx.font = '900 26px sans-serif'; wctx.textAlign = 'right'; wctx.fillText(S.Sh ? `그림자 키 ${Math.round(S.Sh)}cm` : '보정 자리에 서면 수치가 나와요', W * .92, y - 10); wctx.restore(); }
  if (S.side) drawSideView(wctx, { x: W - 330, y: H - 440, w: 310, h: 190 }, S.d, S.L, S.Hb, S.Sh);
  if (S.rows.length) drawChart(wctx, { x: W - 330, y: H - 240 - (S.side ? 0 : 200), w: 310, h: 180 }, S.rows, S.Hb, S.L);
  banner(wctx, W, S.d ? `광원까지 ${Math.round(S.d)}cm  →  그림자는 키의 ${S.mag.toFixed(1)}배` : '카메라가 전등이에요. 다가가 보세요', 150, '#fff', 34);
}
function labRecord(){ if (!S.d) return pop('사람이 안 보여요', 'bad'); const r = { d: Math.round(S.d), L: Math.round(S.L), S: Math.round(S.Sh), m: +S.mag.toFixed(2) }; S.rows.push(r);
  const tb = $('recTable').querySelector('tbody'); const tr = document.createElement('tr'); tr.innerHTML = `<td>${S.rows.length}</td><td>${r.d}</td><td>${r.L}</td><td>${r.S}</td><td>${r.m}×</td>`; tb.appendChild(tr); pop('기록 📏', 'gold', 28, 30);
  const qs = ['거리를 반으로 줄이면 그림자 키는 몇 배가 될까요?', '벽을 멀리 보내면 그림자는 어떻게 될까요? 거리는 그대로 두고 손잡이만 움직여 봐요', '배율이 2배인 자리를 찾아 서 볼까요?', '친구와 둘이 서면 그림자 두 개의 배율은 같을까요?'];
  $('labQ').textContent = qs[Math.min(qs.length - 1, Math.floor(S.rows.length / 2))]; }
function labClear(){ S.rows = []; $('recTable').querySelector('tbody').innerHTML = ''; }
function labCopy(){ const txt = ['번호\t광원까지(cm)\t벽까지(cm)\t그림자 키(cm)\t배율', ...S.rows.map((r, i) => `${i + 1}\t${r.d}\t${r.L}\t${r.S}\t${r.m}`)].join('\n'); navigator.clipboard?.writeText(txt).then(() => pop('복사됨', 'good', 28, 30), () => pop('복사 실패', 'bad', 28, 30)); }

// ── 흐름
function show(id){ for (const s of ['scr-start', 'scr-calib', 'scr-result']) $(s).classList.toggle('hidden', s !== id); $('hud').classList.toggle('hidden', id !== null); }
async function start(){ S.Hb = +$('inHb').value || DEF.Hb; S.d0 = +$('inD0').value || DEF.d0; $('inHb2').value = S.Hb; $('hbV').textContent = S.Hb + 'cm';
  show('scr-calib'); S.phase = 'calib'; calib = { acc: 0, n: 0, start: 0 }; $('hud').classList.add('hidden');
  try { if (!km.running) await km.start(); if (!km.mouse) { $('calibMsg').textContent = '사람 분리 모델 준비 중…'; await km.setSegment(true); } } /* 엔진은 hands/pose 없는 modes 면 모델 로드를 건너뛰어 segment 옵션만으론 세그멘터가 안 올라온다 → 시작 뒤 직접 켠다 */ catch (e) { $('calibMsg').textContent = '카메라를 열 수 없어요: ' + e.message + ' — 카메라 없이 보려면 주소 뒤에 ?mouse=1'; } }
function beginPlay(){ S.phase = 'play'; show(null); $('hud').classList.remove('hidden'); const t = performance.now();
  S.score = 0; S.life = 3; S.combo = 0; S.t0 = t; S.idx = 0; S.stars = []; S.holdT = 0; S.bestFit = 0; S.tTarget = t; S.mobs = []; S.nextSpawn = t + 1500; S.judged = 0; S.scared = 0; S.dodged = 0; tgtKey = '';
  $('hScore').textContent = 0; $('hLife').textContent = '❤❤❤'; syncBody();
  const m = S.mode; $('stTime').classList.toggle('hidden', m === 'lab'); $('stScore').classList.toggle('hidden', m === 'lab'); $('stLife').classList.toggle('hidden', m !== 'chase'); $('stFit').classList.toggle('hidden', m !== 'match'); $('fitbar').classList.toggle('hidden', m !== 'match'); $('labpanel').classList.toggle('hidden', m !== 'lab'); $('stNums').classList.toggle('hidden', false); }
function endGame(){ S.phase = 'result'; show('scr-result');
  if (S.mode === 'match') { const tot = S.stars.reduce((a, b) => a + (b || 0), 0); $('resTitle').textContent = tot >= 27 ? '그림자 괴물 마스터!' : tot >= 18 ? '멋진 그림자!' : '괴물 만들기 끝';
    $('resBody').innerHTML = `<div class="big-num">${S.score}</div><div class="stars">${MONSTERS.map((m, i) => (S.stars[i] ? '★'.repeat(S.stars[i]) : '☆')).join(' · ')}</div><p class="note">빛에 가까우면 커지고 멀어지면 작아진다 — 그림자 크기는 광원과 물체의 거리로 정해져요.</p>`; }
  else if (S.mode === 'chase') { $('resTitle').textContent = S.life > 0 ? '괴물들을 쫓아냈어요!' : '괴물에게 잡혔어요…';
    $('resBody').innerHTML = `<div class="big-num">${S.score}</div><p>도망간 괴물 ${S.scared} · 피한 박쥐 ${S.dodged} · 판정 ${S.judged}</p><p class="note">큰 그림자가 필요하면 빛으로 다가가고, 작은 그림자가 필요하면 물러나요. 빛은 똑바로 가니까 거리 하나로 크기가 정해져요.</p>`; }
  else { $('resTitle').textContent = '실험 끝'; $('resBody').innerHTML = `<p>기록 ${S.rows.length}줄</p><p class="note">기록표는 「복사」로 가져갈 수 있어요.</p>`; } }

// ── 단추
$('modeSeg').querySelectorAll('button').forEach(b => b.onclick = () => { $('modeSeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.mode = b.dataset.v; });
const BODY_KEY = 'kmotion.shadow.body'; try { S.body = localStorage.getItem(BODY_KEY) || 'auto'; } catch (_) {}
$('bodySeg').querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === S.body); b.onclick = () => { $('bodySeg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); S.body = b.dataset.v; try { localStorage.setItem(BODY_KEY, S.body); } catch (_) {} }; });
const syncBody = () => { $('btnBody').textContent = S.upper ? '상반신' : '전신'; };
$('btnBody').onclick = () => { S.upper = !S.upper; tgtKey = ''; syncBody(); pop(S.upper ? '상반신만 비교' : '전신 비교', 'gold', 24, 70); };
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
// 시작 전 벽 미리보기
drawWall(wctx, W, H, 0);
