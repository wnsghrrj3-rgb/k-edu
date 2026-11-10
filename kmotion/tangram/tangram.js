/* 모양 칠교 — 먹보가 오기 전에! (1학년 수학 · 여러 가지 모양 · 모양 만들기/꾸미기)
 * ○△□ 조각을 옮겨 그림자를 채우면 그림이 완성된다. 커다란 칠교놀이.
 * 긴장 층: 위쪽 길을 따라 「먹보」가 걸어온다(= 남은 시간). 조각을 맞힐 때마다 먹보가 뒤로 밀리고,
 *          끝까지 오면 남은 조각을 먹고 하트 1 감소. 그림이 넘어갈수록 먹보가 빨라진다.
 * 입력: 화면 터치(전자칠판 · 여러 손가락 동시) / 카메라 손(주먹·집게 = 잡기, 양손).
 * 조각은 돌리지 않는다(1학년) — 같은 모양·같은 크기 자리 가까이 가면 저절로 붙는다.
 * 영상은 기기 안에서만 처리(케이모션 공통). 저장 없음.
 */
(function(){
const $ = id => document.getElementById(id);
const stage = $('stage'), ctx = stage.getContext('2d'); const W = stage.width, H = stage.height;
const CW = $('c').width, CH = $('c').height;
let km = null;
const OPT = { input: 'touch', level: 'easy', speed: 'normal' };

// ── 소리
let ac = null; function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
function tone(f, dur = .2, type = 'triangle', vol = .18, at = 0, f2){ if (!ac || !S.sound) return; const t = ac.currentTime + at; const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + .05); }
const SND = {
  grab(){ tone(520, .06, 'triangle', .1); },
  snap(n){ tone(660 + Math.min(8, n) * 60, .1, 'triangle', .18); tone(990 + Math.min(8, n) * 60, .14, 'sine', .14, .07); },
  nope(){ tone(300, .18, 'sawtooth', .09, 0, 200); },
  done(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .3, 'sine', .16, i * .08)); },
  tick(){ tone(1100, .035, 'square', .07); },
  step(){ tone(120, .06, 'sine', .1); },
  eat(){ tone(400, .5, 'sawtooth', .16, 0, 90); tone(140, .3, 'square', .12, .45); },
  whoosh(){ tone(900, .45, 'sine', .12, 0, 180); },
  close(){ [880, 1175, 1568].forEach((f, i) => tone(f, .16, 'triangle', .16, i * .06)); }
};
function say(txt){ try { if (!S.sound || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'ko-KR'; u.rate = 1.1; u.pitch = 1.3; speechSynthesis.speak(u); } catch (_) {} }

// ── 그림(단위 좌표, y 아래로). 조각 = 동그라미·세모·네모
const IN = { inner: true };   // 다른 조각 위에 얹는 조각(그림자만 모드에서도 자리가 보임)
const Ci = (x, y, r, o) => Object.assign({ k: 'circle', x, y, r }, o);
const Re = (x, y, w, h, o) => Object.assign({ k: 'rect', pts: [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]] }, o);
const TU = (cx, by, w, h, o) => Object.assign({ k: 'tri', pts: [[cx, by - h], [cx + w / 2, by], [cx - w / 2, by]] }, o);
const TD = (cx, ty, w, h, o) => Object.assign({ k: 'tri', pts: [[cx - w / 2, ty], [cx + w / 2, ty], [cx, ty + h]] }, o);
const TP = (a, b, c, o) => Object.assign({ k: 'tri', pts: [a, b, c] }, o);
const PICS = [
  { id: 'icecream', name: '아이스크림', icon: '🍦', parts: [ TD(0, 0, 3, 4.5), Ci(0, -1.3, 1.6), Ci(0, -3.7, 1.25), Ci(0, -5.35, .55) ] },
  { id: 'house', name: '집', icon: '🏠', parts: [ Re(0, 2, 5, 4), TU(0, 0, 6.4, 3), Re(.9, 3, 1.3, 2, IN), Re(-1.2, 1.5, 1.2, 1.2, IN), Ci(4.4, -2.4, 1) ] },
  { id: 'fish', name: '물고기', icon: '🐟', parts: [ Ci(0, 0, 2.2), TP([1.9, 0], [4.5, -1.9], [4.5, 1.9]), TU(-.2, -1.9, 2.2, 1.4), Ci(-1.1, -.5, .45, IN), Ci(-3.4, -1.7, .5) ] },
  { id: 'rocket', name: '로켓', icon: '🚀', parts: [ Re(0, 0, 2.4, 5), TU(0, -2.5, 2.4, 2.2), TP([-1.2, .6], [-1.2, 2.5], [-2.9, 2.5]), TP([1.2, .6], [2.9, 2.5], [1.2, 2.5]), TD(0, 2.5, 1.6, 1.8), Ci(0, -.9, .7, IN) ] },
  { id: 'car', name: '자동차', icon: '🚗', parts: [ Re(0, 0, 7, 1.8), Re(-.6, -1.65, 3.2, 1.5), TP([1, -.9], [1, -2.4], [2.5, -.9]), Ci(-2.1, 1.2, .95), Ci(2.1, 1.2, .95) ] },
  { id: 'tree', name: '나무', icon: '🌲', parts: [ Re(0, 3.6, 1.2, 1.8), TU(0, 2.7, 5.4, 2.6), TU(0, .9, 4.2, 2.3), TU(0, -.7, 3, 2) ] },
  { id: 'cat', name: '고양이', icon: '🐱', parts: [ TU(-1.6, -1.6, 2, 2), TU(1.6, -1.6, 2, 2), Ci(0, 0, 2.6), Ci(-.95, -.4, .48, IN), Ci(.95, -.4, .48, IN), TD(0, .4, 1, .8, IN) ] },
  { id: 'boat', name: '돛단배', icon: '⛵', parts: [ Re(0, 2.2, 4.4, 1.3), TP([2.2, 1.55], [3.7, 1.55], [2.2, 2.85]), TP([-2.2, 1.55], [-2.2, 2.85], [-3.7, 1.55]), TP([.15, 1.3], [.15, -3.4], [3, 1.3]), TP([-.15, 1.3], [-2.3, 1.3], [-.15, -2.2]), Ci(-3.5, -2.6, .9) ] },
  { id: 'castle', name: '성', icon: '🏰', parts: [ Re(0, 1.2, 4.2, 3.2), Re(-3, .4, 1.8, 4.8), Re(3, .4, 1.8, 4.8), TU(-3, -2, 2.4, 2), TU(3, -2, 2.4, 2), TU(0, -.4, 3, 2.2), Re(0, 1.9, 1.2, 1.8, IN), Ci(-3, -.6, .48, IN), Ci(3, -.6, .48, IN) ] },
  { id: 'robot', name: '로봇', icon: '🤖', parts: [ Re(0, -2.6, 2.6, 2), Re(0, .2, 3.4, 3.2), Re(-2.4, 0, 1, 2.6), Re(2.4, 0, 1, 2.6), Re(-.9, 2.9, 1.1, 2), Re(.9, 2.9, 1.1, 2), TU(0, -3.6, 1, 1), Ci(-.6, -2.7, .45, IN), Ci(.6, -2.7, .45, IN), Ci(0, .2, .65, IN) ] },
  { id: 'train', name: '기차', icon: '🚂', parts: [ Re(-3.2, 0, 2.8, 2.2), Re(-3.9, -2, 1.4, 1.8), TU(-2.4, -1.1, 1.1, 1.1), Re(.4, .25, 3, 1.7), Re(3.9, .25, 3, 1.7), Ci(-4, 1.5, .6), Ci(-2.4, 1.5, .6), Ci(-.4, 1.5, .6), Ci(1.2, 1.5, .6), Ci(3.1, 1.5, .6), Ci(4.7, 1.5, .6) ] }
];
const KNAME = { circle: '동그라미', tri: '세모', rect: '네모' }, KSYM = { circle: '●', tri: '▲', rect: '■' };
const PAL = { circle: ['#ff6b8b', '#ff9d5c', '#ffc94d', '#f06292'], tri: ['#2bb673', '#8bd450', '#26c6a6', '#5cc96b'], rect: ['#3a7bd5', '#7a6cf0', '#29a8e0', '#5c8dff'] };
const BOARD = { x: 340, y: 160, w: 600, h: 500 }, TRAY = [{ x: 20, y: 160, w: 300, h: 500 }, { x: 960, y: 160, w: 300, h: 500 }];
const TRACK = { x0: 250, x1: 1010, y: 84 };
const HEARTS = 3;

const S = { state: 'menu', round: 0, pic: null, slots: [], pieces: [], grabs: new Map(), cursors: new Map(), T: 0, left: 0, hearts: HEARTS, score: 0, combo: 0, lastPlace: 0, doneN: 0, used: { circle: 0, tri: 0, rect: 0 }, bits: [], msg: null, stT: 0, tickT: 0, stepT: 0, sound: true, banner: null, monFly: 0, close: false };
const timed = () => OPT.speed !== 'off';
const isCam = () => OPT.input === 'cam';

// ── 그림 → 자리·조각
function build(pic){
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const ext = p => p.k === 'circle' ? [[p.x - p.r, p.y - p.r], [p.x + p.r, p.y + p.r]] : p.pts;
  pic.parts.forEach(p => ext(p).forEach(q => { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }));
  let mw = 0; pic.parts.forEach(p => { const e = ext(p).map(q => q[0]); mw = Math.max(mw, Math.max(...e) - Math.min(...e)); });   // 가장 넓은 조각도 조각 놓는 곳 안에
  const u = Math.min(500 / (x1 - x0), 410 / (y1 - y0), 64, 286 / mw);
  const ox = BOARD.x + BOARD.w / 2 - (x0 + x1) / 2 * u, oy = BOARD.y + BOARD.h / 2 + 8 - (y0 + y1) / 2 * u;
  const cnt = { circle: 0, tri: 0, rect: 0 };
  const slots = pic.parts.map((p, i) => {
    let s;
    if (p.k === 'circle') { const r = Math.round(p.r * u); s = { k: 'circle', cx: ox + p.x * u, cy: oy + p.y * u, r, hw: r, hh: r, sig: 'c' + r }; }
    else { const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]); const bx = (Math.min(...xs) + Math.max(...xs)) / 2, by = (Math.min(...ys) + Math.max(...ys)) / 2;
      const pts = p.pts.map(q => ({ x: Math.round((q[0] - bx) * u), y: Math.round((q[1] - by) * u) }));
      s = { k: p.k, cx: ox + bx * u, cy: oy + by * u, pts, hw: Math.max(...pts.map(q => Math.abs(q.x))), hh: Math.max(...pts.map(q => Math.abs(q.y))), sig: p.k[0] + pts.map(q => q.x + ',' + q.y).join(';') }; }
    s.i = i; s.inner = !!p.inner; s.filled = false; s.glow = 0; return s; });
  const pieces = slots.map((s, i) => ({ id: i, k: s.k, r: s.r, pts: s.pts, hw: s.hw, hh: s.hh, sig: s.sig, area: s.hw * s.hh, col: PAL[s.k][cnt[s.k]++ % 4], x: BOARD.x + BOARD.w / 2, y: BOARD.y + BOARD.h / 2, hx: 0, hy: 0, state: 'tray', slot: null, pop: 0, wrong: 0, heldT: 0, sc: 0, ph: Math.random() * 6.28 }));
  layoutTray(pieces);
  return { slots, pieces, u };
}
function layoutTray(pieces){
  const sh = pieces.slice().sort(() => Math.random() - .5); const sides = [[], []];
  sh.sort((a, b) => b.area - a.area).forEach((p, i) => sides[i % 2 ^ (S.round % 2)].push(p));
  sides.forEach((list, si) => { const t = TRAY[si]; const rows = []; let pend = null;
    list.forEach(p => { if (p.hw * 2 > 130) rows.push([p]); else if (pend) { pend.push(p); pend = null; } else { pend = [p]; rows.push(pend); } });
    rows.sort(() => Math.random() - .5);
    const hs = rows.map(r => Math.max(...r.map(p => p.hh * 2))); const total = hs.reduce((a, b) => a + b, 0); const gap = (t.h - total) / (rows.length + 1);
    let y = t.y + gap;
    rows.forEach((r, ri) => { const cy = y + hs[ri] / 2; y += hs[ri] + gap;
      r.forEach((p, j) => { let x = r.length === 1 ? t.x + t.w / 2 : t.x + t.w * (j ? .73 : .27); x += (Math.random() - .5) * 16;
        x = Math.max(p.hw + 8, Math.min(W - p.hw - 8, x)); p.hx = x; p.hy = Math.max(t.y + p.hh, Math.min(t.y + t.h - p.hh, cy)); }); }); });
}

// ── 판 흐름
function startGame(){ S.round = 0; S.hearts = HEARTS; S.score = 0; S.combo = 0; S.doneN = 0; S.used = { circle: 0, tri: 0, rect: 0 }; S.bits = []; $('ovEnd').classList.add('hidden'); loadPic(); }
function loadPic(){
  if (S.round >= PICS.length) return endGame(true);
  const pic = PICS[S.round]; const b = build(pic); S.pic = pic; S.slots = b.slots; S.pieces = b.pieces; S.grabs.clear(); S.msg = null; S.banner = null; S.close = false; S.monFly = 0;
  const n = S.pieces.length; const per = isCam() ? 5 : 2.4; const mul = { slow: 1.6, normal: 1, fast: .7, off: 1 }[OPT.speed];
  S.T = (6 + n * per) * mul * Math.max(.7, Math.pow(.95, S.round)); S.left = S.T;
  S.state = 'intro'; S.stT = 0; say(pic.name + '! 만들어 봐요');
}
function place(p, s){
  p.state = 'placed'; p.slot = s; s.filled = true; p.pop = 1; for (const [id, g] of S.grabs) if (g.piece === p) S.grabs.delete(id);
  const now = performance.now(); S.combo = now - S.lastPlace < 3000 ? S.combo + 1 : 1; S.lastPlace = now;
  S.score += 10 + (S.combo - 1) * 2; S.used[p.k]++; SND.snap(S.combo); say(KNAME[p.k]);
  burst(s.cx, s.cy, p.col, 14);
  if (timed()) S.left = Math.min(S.T, S.left + (isCam() ? 1.6 : .9));
  if (S.slots.every(q => q.filled)) complete();
}
function complete(){
  S.state = 'done'; S.stT = 0; S.doneN++; const c = { circle: 0, tri: 0, rect: 0 }; S.pieces.forEach(p => c[p.k]++);
  let bonus = 0; if (timed()) { bonus = Math.round(S.left * 5); S.close = S.left / S.T < .15; if (S.close) bonus += 30; S.monFly = .001; SND.whoosh(); }
  S.score += bonus; S.banner = { txt: `${S.pic.icon} ${S.pic.name} 완성!`, sub: ['circle', 'tri', 'rect'].filter(k => c[k]).map(k => `${KSYM[k]} ${KNAME[k]} ${c[k]}개`).join('   '), bonus };
  if (S.close) SND.close(); SND.done(); say(S.close ? '아슬아슬! ' + S.pic.name + ' 완성!' : S.pic.name + ' 완성!');
  for (let i = 0; i < 5; i++) burst(BOARD.x + 80 + Math.random() * (BOARD.w - 160), BOARD.y + 80 + Math.random() * (BOARD.h - 160), ['#ffd35c', '#ff6b8b', '#4de1ff', '#8bd450'][i % 4], 18);
}
function eaten(){
  S.state = 'eaten'; S.stT = 0; S.hearts--; S.combo = 0; S.grabs.clear(); SND.eat(); say('앗! 먹보가 먹어 버렸어');
  S.pieces.forEach(p => { if (p.state !== 'placed') p.state = 'eaten'; });
  S.banner = { txt: '😋 먹보가 조각을 먹어 버렸어!', sub: S.hearts > 0 ? '괜찮아, 다음 그림은 더 빨리!' : '', bonus: 0, bad: true };
}
function nextPic(){ S.round++; loadPic(); }
function endGame(all){
  S.state = 'end'; S.grabs.clear(); const el = $('ovEnd'); $('tools').style.display = 'none';
  el.innerHTML = `<span class="k">K-MOTION · 모양 칠교</span><h1>${all ? '🏆 그림을 전부 완성했어요!' : '끝! 잘했어요'}</h1>
    <div class="res"><span>완성한 그림 ${S.doneN}개</span>${timed() ? `<span>점수 ${S.score}</span>` : ''}</div>
    <p>우리가 쓴 모양</p><div class="res"><span style="color:#ff6b8b">● 동그라미 ${S.used.circle}개</span><span style="color:#2bb673">▲ 세모 ${S.used.tri}개</span><span style="color:#3a7bd5">■ 네모 ${S.used.rect}개</span></div>
    <div class="row"><button class="big" id="bAgain">다시 하기</button><button class="big" id="bHome" style="background:#fff;border:3px solid #ffd35c">처음으로</button></div>`;
  el.classList.remove('hidden'); $('bAgain').onclick = () => { audio(); $('tools').style.display = 'flex'; startGame(); }; $('bHome').onclick = toMenu;
  if (all) SND.done();
}
function toMenu(){ S.state = 'menu'; $('ovEnd').classList.add('hidden'); $('ov').classList.remove('hidden'); $('tools').style.display = 'none'; if (km && km.running) km.stop(); $('camBox').classList.add('off'); S.cursors.clear(); S.grabs.clear(); }
function burst(x, y, col, n){ for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = 120 + Math.random() * 380; S.bits.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, a: 1.1, c: Math.random() < .6 ? col : '#fff', r: 3 + Math.random() * 5 }); } }

// ── 잡기·놓기(터치·카메라 공통)
function pick(pt, pad){ let best = null, bd = 1e9; for (const p of S.pieces) { if (p.state !== 'tray' || held(p)) continue; if (Math.abs(pt.x - p.x) < p.hw + pad && Math.abs(pt.y - p.y) < p.hh + pad) { const d = Math.hypot(pt.x - p.x, pt.y - p.y) - (p.hw + p.hh) * .15; if (d < bd) { bd = d; best = p; } } } return best; }
function held(p){ for (const g of S.grabs.values()) if (g.piece === p) return true; return false; }
function grab(id, pt, pad){ if (S.state !== 'play' || S.grabs.has(id)) return false; const p = pick(pt, pad); if (!p) return false; S.grabs.set(id, { piece: p, ox: p.x - pt.x, oy: p.y - pt.y }); p.heldT = 0; p.pop = .6; SND.grab(); return true; }
function drag(id, pt){ const g = S.grabs.get(id); if (!g || S.state !== 'play') return; const p = g.piece; p.x = Math.max(p.hw * .3, Math.min(W - p.hw * .3, pt.x + g.ox)); p.y = Math.max(130, Math.min(H - p.hh * .3, pt.y + g.oy)); trySnap(p, isCam() ? 62 : 40); }
function trySnap(p, rad){ let best = null, bd = rad; for (const s of S.slots) { if (s.filled || s.sig !== p.sig) continue; const d = Math.hypot(p.x - s.cx, p.y - s.cy); if (d < bd) { bd = d; best = s; } } if (best) { place(p, best); return true; } return false; }
function release(id){ const g = S.grabs.get(id); if (!g) return; S.grabs.delete(id); const p = g.piece; if (p.state !== 'tray' || S.state !== 'play') return;
  if (trySnap(p, isCam() ? 80 : 54)) return;
  const onBoard = p.x > BOARD.x + 20 && p.x < BOARD.x + BOARD.w - 20 && p.y > BOARD.y && p.y < BOARD.y + BOARD.h;
  if (onBoard) { p.wrong++; SND.nope(); const same = S.slots.some(s => !s.filled && s.k === p.k); S.msg = { txt: same ? `크기가 꼭 맞는 ${KNAME[p.k]} 자리를 찾아봐요!` : `${KNAME[p.k]} 자리가 아니에요`, t: 2 }; }
}

// ── 입력: 터치·마우스(여러 손가락 동시)
function toStage(e){ const r = stage.getBoundingClientRect(); const s = Math.min(r.width / W, r.height / H); const ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2; return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s }; }
stage.addEventListener('pointerdown', e => { if (isCam()) return; audio(); if (grab('p' + e.pointerId, toStage(e), 16)) { try { stage.setPointerCapture(e.pointerId); } catch (_) {} } });
stage.addEventListener('pointermove', e => { if (isCam()) return; drag('p' + e.pointerId, toStage(e)); });
const pUp = e => { if (isCam()) return; release('p' + e.pointerId); };
stage.addEventListener('pointerup', pUp); stage.addEventListener('pointercancel', pUp);

// ── 입력: 카메라 손(주먹·집게 = 잡기)
function readCam(f){
  const acts = (f.actions && f.actions.hands) || []; const now = performance.now(); const seen = new Set();
  acts.forEach((a, i) => { const id = 'h' + i; seen.add(id); const src = a.center || a.pointer; if (!src) return;
    const tx = Math.max(10, Math.min(W - 10, ((src.x / CW - .5) * 1.3 + .5) * W)), ty = Math.max(10, Math.min(H - 10, ((src.y / CH - .5) * 1.3 + .5) * H));
    let c = S.cursors.get(id); if (!c) { c = { x: tx, y: ty, grab: false, offT: 0 }; S.cursors.set(id, c); }
    c.x += (tx - c.x) * .55; c.y += (ty - c.y) * .55; c.seen = now;
    const g = !!(a.pinched || a.pose === 'fist' || a.pose === 'pinch');
    if (g) { c.offT = 0; if (!c.grab) { c.grab = true; grab(id, c, 34); } else if (!S.grabs.has(id) && S.state === 'play') grab(id, c, 34); drag(id, c); }
    else if (c.grab) { if (!c.offT) c.offT = now; drag(id, c); if (now - c.offT > 180) { c.grab = false; c.offT = 0; release(id); } }
  });
  for (const [id, c] of S.cursors) if (!seen.has(id) && now - c.seen > 350) { release(id); S.cursors.delete(id); }
}

// ── 갱신
function update(dt, t){
  for (const p of S.pieces) { p.pop = Math.max(0, p.pop - dt * 3); p.sc += (1 - p.sc) * Math.min(1, dt * 8);
    if (p.state === 'placed') { p.x += (p.slot.cx - p.x) * Math.min(1, dt * 18); p.y += (p.slot.cy - p.y) * Math.min(1, dt * 18); }
    else if (p.state === 'eaten') { const m = monPos(); p.x += (m.x - p.x) * Math.min(1, dt * 5); p.y += (m.y - p.y) * Math.min(1, dt * 5); p.sc = Math.max(0, p.sc - dt * 1.4); }
    else if (held(p)) p.heldT += dt;
    else { p.x += (p.hx - p.x) * Math.min(1, dt * 9); p.y += (p.hy - p.y) * Math.min(1, dt * 9); } }
  // 자리 도움 빛: 쉬움 = 3초 들고 있으면 / 도전 = 두 번 틀리면
  for (const s of S.slots) { let on = 0; if (!s.filled) for (const g of S.grabs.values()) { const p = g.piece; if (p.sig === s.sig && (OPT.level === 'easy' ? p.heldT > 3 || p.wrong >= 1 : p.wrong >= 2)) on = 1; } s.glow += (on - s.glow) * Math.min(1, dt * 6); }
  S.stT += dt;
  if (S.state === 'intro' && S.stT > 1.2) { S.state = 'play'; S.stT = 0; }
  else if (S.state === 'play' && timed()) { S.left -= dt; const pr = 1 - S.left / S.T;
    S.stepT -= dt; if (S.stepT <= 0) { S.stepT = .5; SND.step(); }
    if (pr > .7) { S.tickT -= dt; if (S.tickT <= 0) { S.tickT = .55 - (pr - .7) / .3 * .4; SND.tick(); } }
    if (S.left <= 0) eaten(); }
  else if (S.state === 'done') { if (S.monFly) S.monFly += dt; if (S.stT > 2.6) nextPic(); }
  else if (S.state === 'eaten' && S.stT > 2.2) { if (S.hearts <= 0) endGame(false); else nextPic(); }
  for (const b of S.bits) { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 700 * dt; b.a -= dt * 1.3; } S.bits = S.bits.filter(b => b.a > 0);
  if (S.msg) { S.msg.t -= dt; if (S.msg.t <= 0) S.msg = null; }
}
function prog(){ return timed() ? Math.max(0, Math.min(1, 1 - S.left / S.T)) : 0; }
function monPos(){ if (S.state === 'eaten') { const k = Math.min(1, S.stT / .5); return { x: TRACK.x1 + (BOARD.x + BOARD.w / 2 - TRACK.x1) * k, y: TRACK.y + (BOARD.y + 150 - TRACK.y) * k - Math.sin(k * Math.PI) * 60 }; } return { x: TRACK.x0 + (TRACK.x1 - TRACK.x0) * prog(), y: TRACK.y }; }

// ── 그리기
function rr(x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function shapePath(o, x, y){ ctx.beginPath(); if (o.k === 'circle') ctx.arc(x, y, o.r, 0, 6.2832); else { o.pts.forEach((q, i) => i ? ctx.lineTo(x + q.x, y + q.y) : ctx.moveTo(x + q.x, y + q.y)); ctx.closePath(); } }
function shade(hex, f){ const n = parseInt(hex.slice(1), 16); const c = [n >> 16, n >> 8 & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f)))); return `rgb(${c[0]},${c[1]},${c[2]})`; }
function drawPiece(p, t, lift){
  const idle = p.state === 'tray' && !lift ? Math.sin(t / 600 + p.ph) * 2 : 0; const sc = p.sc * (1 + p.pop * .18 + (lift ? .06 : 0)); if (sc <= .02) return;
  ctx.save(); ctx.translate(p.x, p.y + idle); ctx.scale(sc, sc); ctx.lineJoin = 'round';
  if (lift) { ctx.shadowColor = 'rgba(20,40,90,.35)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10; } else if (p.state === 'tray') { ctx.shadowColor = 'rgba(20,40,90,.18)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; }
  shapePath(p, 0, 0); ctx.fillStyle = p.col; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineWidth = 5; ctx.strokeStyle = shade(p.col, .72); ctx.stroke();
  ctx.save(); shapePath(p, 0, 0); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(-p.hw, -p.hh, p.hw * 2, p.hh * .7); ctx.restore();
  ctx.restore();
}
function drawMonster(t){
  const y = TRACK.y; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(29,42,68,.25)'; ctx.lineWidth = 6; ctx.setLineDash([2, 16]); ctx.beginPath(); ctx.moveTo(TRACK.x0, y + 30); ctx.lineTo(TRACK.x1, y + 30); ctx.stroke(); ctx.setLineDash([]);
  // 길 끝: 조각 접시
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(TRACK.x1 + 6, y + 30, 40, 9, 0, 0, 6.2832); ctx.fill(); ctx.strokeStyle = '#c9d8ea'; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = '900 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ff6b8b'; ctx.fillText('●', TRACK.x1 - 14, y + 16); ctx.fillStyle = '#2bb673'; ctx.fillText('▲', TRACK.x1 + 6, y + 14); ctx.fillStyle = '#3a7bd5'; ctx.fillText('■', TRACK.x1 + 26, y + 16);
  if (!timed()) return;
  const pr = prog(); let m = monPos(), rot = 0, s = 1;
  if (S.monFly) { const k = Math.min(1, S.monFly / .9); m = { x: m.x - k * 520, y: m.y - Math.sin(k * Math.PI) * 90 }; rot = -k * 9; s = 1 - k * .4; if (k >= 1) return; }
  const walk = S.state === 'play'; const bob = walk ? Math.abs(Math.sin(t / 130)) * 5 : 0; const ang = pr > .7 && walk;
  if (S.state === 'eaten') s = 1 + Math.min(1, S.stT / .5) * .9;
  ctx.save(); ctx.translate(m.x, m.y - bob); ctx.rotate(rot); ctx.scale(s, s);
  // 다리
  ctx.strokeStyle = '#4a2c8a'; ctx.lineWidth = 7; const lg = walk ? Math.sin(t / 130) * 9 : 0; ctx.beginPath(); ctx.moveTo(-10, 20); ctx.lineTo(-10 + lg, 32 + bob); ctx.moveTo(10, 20); ctx.lineTo(10 - lg, 32 + bob); ctx.stroke();
  // 몸
  ctx.fillStyle = ang ? '#b0306e' : '#7a4fd6'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 27, 0, 0, 6.2832); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#3d2278'; ctx.stroke();
  // 뿔
  ctx.fillStyle = '#ffd35c'; ctx.beginPath(); ctx.moveTo(-18, -20); ctx.lineTo(-12, -36); ctx.lineTo(-6, -24); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(18, -20); ctx.lineTo(12, -36); ctx.lineTo(6, -24); ctx.closePath(); ctx.fill();
  // 눈
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(4, -8, 8, 0, 6.2832); ctx.arc(20, -6, 7, 0, 6.2832); ctx.fill(); ctx.fillStyle = '#1d2a44'; ctx.beginPath(); ctx.arc(7, -7, 3.5, 0, 6.2832); ctx.arc(23, -5, 3, 0, 6.2832); ctx.fill();
  // 입(가까울수록 크게)
  const mo = S.state === 'eaten' ? 14 : 3 + pr * 9 + (walk ? Math.abs(Math.sin(t / 160)) * 3 : 0); ctx.fillStyle = '#2a0d3d'; ctx.beginPath(); ctx.ellipse(10, 10, 14, mo, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(1 + i * 7, 10 - mo + 1); ctx.lineTo(4.5 + i * 7, 10 - mo + 7); ctx.lineTo(8 + i * 7, 10 - mo + 1); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  if (S.monFly) { ctx.font = '900 24px sans-serif'; ctx.fillStyle = '#7a4fd6'; ctx.fillText('으악~!', m.x, m.y - 48); }
  else if (ang) { ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#e8475f'; ctx.fillText('냠냠… 거의 다 왔다!', Math.min(m.x, TRACK.x1 - 150), y - 46); }
}
function draw(t){
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#bfe8ff'); g.addColorStop(1, '#e3f5ff'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // 조각 놓는 곳·판
  TRAY.forEach(tr => { rr(tr.x, tr.y, tr.w, tr.h, 26); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fill(); });
  ctx.save(); ctx.shadowColor = 'rgba(30,60,120,.2)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; rr(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 30); ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.restore();
  const done = S.state === 'done'; const bounce = done ? 1 + Math.sin(Math.min(1, S.stT / .6) * Math.PI) * .06 : 1;
  ctx.save(); ctx.translate(BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h / 2); ctx.scale(bounce, bounce); ctx.translate(-(BOARD.x + BOARD.w / 2), -(BOARD.y + BOARD.h / 2));
  // 그림자
  const DARK = '#2b3a67'; ctx.lineJoin = 'round';
  if (!done) {
    for (const s of S.slots) if (!s.inner) { shapePath(s, s.cx, s.cy); ctx.fillStyle = DARK; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = DARK; ctx.stroke(); }
    for (const s of S.slots) { if (s.filled) continue;
      if (s.inner) { shapePath(s, s.cx, s.cy); ctx.fillStyle = '#56679f'; ctx.fill(); }
      if (OPT.level === 'easy' || s.inner) { shapePath(s, s.cx, s.cy); ctx.setLineDash([9, 8]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke(); ctx.setLineDash([]); }
      if (s.glow > .02) { shapePath(s, s.cx, s.cy); ctx.lineWidth = 7 + Math.sin(t / 140) * 2; ctx.strokeStyle = `rgba(255,211,92,${s.glow})`; ctx.stroke(); ctx.fillStyle = `rgba(255,211,92,${s.glow * .25})`; ctx.fill(); } }
  }
  S.pieces.filter(p => p.state === 'placed').sort((a, b) => a.slot.i - b.slot.i).forEach(p => drawPiece(p, t, false));
  ctx.restore();
  // 그림 이름
  if (S.pic && S.state !== 'end') { ctx.font = '900 26px sans-serif'; ctx.fillStyle = '#3b4a66'; ctx.fillText(`${S.pic.icon} ${S.pic.name}`, BOARD.x + BOARD.w / 2, BOARD.y + 30); ctx.font = '800 15px sans-serif'; ctx.fillStyle = '#8a97b3'; ctx.fillText(`그림 ${S.round + 1} / ${PICS.length}`, BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h - 18); }
  // 먹보·하트·점수
  drawMonster(t);
  if (timed()) { ctx.font = '30px sans-serif'; for (let i = 0; i < HEARTS; i++) { ctx.globalAlpha = i < S.hearts ? 1 : .2; ctx.fillText('❤️', 1090 + i * 40, 56); } ctx.globalAlpha = 1;
    ctx.font = '900 30px sans-serif'; ctx.fillStyle = '#1d2a44'; ctx.fillText(S.score + '점', 1130, 104); if (S.combo > 1 && performance.now() - S.lastPlace < 3000) { ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#e8475f'; ctx.fillText(`${S.combo}연속!`, 1215, 104); } }
  else { ctx.font = '900 22px sans-serif'; ctx.fillStyle = '#3b4a66'; ctx.fillText('연습 — 천천히 해요', 1130, 80); }
  // 조각(놓인 곳 → 든 것)
  const heldSet = new Set([...S.grabs.values()].map(q => q.piece));
  S.pieces.filter(p => (p.state === 'tray' && !heldSet.has(p)) || p.state === 'eaten').sort((a, b) => b.area - a.area).forEach(p => drawPiece(p, t, false));
  heldSet.forEach(p => drawPiece(p, t, true));
  // 손 커서
  if (isCam()) { for (const [id, c] of S.cursors) { ctx.beginPath(); ctx.arc(c.x, c.y, c.grab ? 18 : 24, 0, 6.2832); ctx.fillStyle = c.grab ? 'rgba(255,179,0,.9)' : 'rgba(255,255,255,.55)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = c.grab ? '#fff' : '#ffb300'; ctx.stroke(); ctx.font = '26px sans-serif'; ctx.fillText(c.grab ? '✊' : '🖐', c.x, c.y + 1); }
    if (!S.cursors.size && S.state === 'play') { ctx.font = '800 22px sans-serif'; ctx.fillStyle = 'rgba(29,42,68,.7)'; ctx.fillText('손을 카메라에 보여 주세요 — 주먹을 쥐면 잡아요', W / 2, H - 46); } }
  for (const b of S.bits) { ctx.globalAlpha = Math.min(1, b.a); ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.fill(); } ctx.globalAlpha = 1;
  // 알림
  if (S.state === 'intro') { const k = Math.min(1, S.stT / .25); ctx.font = `900 ${Math.round(50 * k + 10)}px sans-serif`; ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.strokeText(`${S.pic.icon} ${S.pic.name}`, W / 2, 360); ctx.fillStyle = '#1d2a44'; ctx.fillText(`${S.pic.icon} ${S.pic.name}`, W / 2, 360); }
  if (S.banner && (S.state === 'done' || S.state === 'eaten')) { const b = S.banner; const k = Math.min(1, S.stT / .3); const bh = 62 + (b.sub ? 36 : 0) + (b.bonus ? 28 : 0), by = 12 - 20 * (1 - k);   // 위쪽 띠에 — 완성된 그림을 가리지 않게
    ctx.globalAlpha = k; rr(W / 2 - 330, by, 660, bh, 26); ctx.fillStyle = b.bad ? 'rgba(74,44,138,.95)' : 'rgba(255,255,255,.97)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = b.bad ? '#7a4fd6' : '#ffd35c'; ctx.stroke();
    ctx.font = '900 36px sans-serif'; ctx.fillStyle = b.bad ? '#fff' : '#1d2a44'; ctx.fillText(b.txt, W / 2, by + 34); let yy = by + 62;
    if (b.sub) { ctx.font = '800 22px sans-serif'; ctx.fillStyle = b.bad ? '#e6dcff' : '#3b4a66'; ctx.fillText(b.sub, W / 2, yy + 10); yy += 36; }
    if (b.bonus) { ctx.font = '900 20px sans-serif'; ctx.fillStyle = '#e8475f'; ctx.fillText((S.close ? '아슬아슬! ' : '') + `남은 시간 +${b.bonus}점`, W / 2, yy + 6); } ctx.globalAlpha = 1; }
  if (S.msg) { ctx.font = '900 26px sans-serif'; const w = ctx.measureText(S.msg.txt).width + 50; rr(W / 2 - w / 2, 612, w, 46, 23); ctx.fillStyle = 'rgba(29,42,68,.88)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(S.msg.txt, W / 2, 636); }
  // 조여 오는 빨간 테두리
  if (S.state === 'play' && timed()) { const pr = prog(); if (pr > .7) { const a = (pr - .7) / .3 * (.22 + .14 * Math.sin(t / (160 - (pr - .7) * 250))); const vg = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * .8); vg.addColorStop(0, 'rgba(232,71,95,0)'); vg.addColorStop(1, `rgba(232,71,95,${Math.max(0, a)})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); } }
}

// ── 돌리기
let last = 0;
function loop(t){ requestAnimationFrame(loop); const dt = last ? Math.min(.05, (t - last) / 1000) : 0; last = t; if (S.state === 'menu') return; if (S.state !== 'end') update(dt, t); draw(t); }
async function start(){
  audio(); $('msg').textContent = '';
  if (isCam()) { $('camBox').classList.remove('off'); $('msg').textContent = '카메라 여는 중…';
    try { if (!km) { km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['hands'], numHands: 2, activity: 'tangram', inferEvery: 1 });
        km.onFrame = f => { km.drawCamera(); f.hands.forEach(h => km.drawSkeleton(h, km.HAND_BONES, 'rgba(255,211,92,.9)', 3)); if (S.state !== 'menu') readCam(f); };
        km.onStatus = s => { $('camSt').textContent = s || (km.mouse ? '마우스 모드' : '카메라 연결됨'); }; }
      if (!km.running) await km.start(); }
    catch (e) { $('camBox').classList.add('off'); $('msg').textContent = '카메라를 열 수 없어요(' + e.message + ') — 「화면 터치」로 해 보세요.'; return; }
  } else { $('camBox').classList.add('off'); if (km && km.running) km.stop(); S.cursors.clear(); }
  $('ov').classList.add('hidden'); $('tools').style.display = 'flex'; startGame();
}
function opt(rowId, key){ const row = $(rowId); row.querySelectorAll('button').forEach(b => b.onclick = () => { OPT[key] = b.dataset.v; row.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); }); }
opt('optI', 'input'); opt('optL', 'level'); opt('optS', 'speed');
$('bStart').onclick = start;
$('bSkip').onclick = () => { if (S.state === 'play' || S.state === 'intro') nextPic(); };
$('bSnd').onclick = () => { S.sound = !S.sound; $('bSnd').textContent = S.sound ? '🔊 소리' : '🔇 소리'; if (!S.sound && window.speechSynthesis) speechSynthesis.cancel(); };
$('bFs').onclick = () => { const el = $('app'); document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen(); };
$('bMenu').onclick = toMenu;
window.__tangram = { S, OPT, PICS, build, startGame, loadPic, place, grab, drag, release, update, draw, readCam, eaten };
requestAnimationFrame(loop);
})();
