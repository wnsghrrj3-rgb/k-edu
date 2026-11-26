// K-MOTION 가라사대 게임 — 혼자 또는 둘이
// 마법사가 명령을 한다. 「가라사대」가 붙으면 따라 하고, 없으면 꼼짝 마! 하트 3개, 한 판 16~20개 명령.
// 엔진 0.7.2 duo(두 사람 동시 추적: 1P 화면 왼쪽 · 2P 오른쪽)를 쓰고, 동작 판정은 거꾸로 나라의 motion.js(학생 기준 특징값·히스테리시스)를 사람마다 하나씩 쓴다.
import * as THREE from 'three';
import { World } from '../upside/js/world.js';
import { Hero } from '../upside/js/hero.js';
import { MotionInput } from '../upside/js/motion.js';
import { transform, ALL_OFF } from '../upside/js/reverse.js';
import { UpsideAudio, say as speak } from '../upside/js/audio.js';
import { picto } from '../upside/js/picto.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const store = { get(k, d){ try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || '{}')); } catch (e) { return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

const S = store.get('kmsimon', { diff: 'easy', players: 1, input: 'camera', mirror: true, voice: true, bgm: true, sens: 1, quality: (navigator.hardwareConcurrency || 8) <= 4 ? 'low' : 'high', best: 0 });
if (Q.has('kb') || Q.has('mouse')) S.input = 'keyboard';
const save = () => store.set('kmsimon', S);

// 명령: 학생 몸 기준(오른손 = 학생의 진짜 오른손)
const CMDS = {
  right:  { say: '오른손 들어', em: '🙋', picto: 'armR', ok: f => f.armRUp && !f.armLUp && !f.headOn },
  left:   { say: '왼손 들어', em: '🙋', picto: 'armL', ok: f => f.armLUp && !f.armRUp && !f.headOn },
  both:   { say: '만세', em: '🙌', picto: 'bothUp', ok: f => f.armLUp && f.armRUp && !f.headOn && !f.spreadOn },
  spread: { say: '팔 벌려', em: '🙆', picto: 'spread', ok: f => f.spreadOn },
  crouch: { say: '앉아', em: '🧎', picto: 'crouch', ok: f => f.crouchOn },
  head:   { say: '손 머리 위에', em: '🙆‍♂️', picto: 'head', ok: f => f.headOn },
  clap:   { say: '박수 쳐', em: '👏', picto: 'clap', ok: f => f.clapOn },
};
const LV = {
  easy:   { cmds: ['right', 'left', 'both', 'spread', 'crouch', 'head'], trap: .33, win: 3.4, rounds: 16, pic: true },
  normal: { cmds: Object.keys(CMDS), trap: .4, win: 2.8, rounds: 18, pic: true },
  hard:   { cmds: Object.keys(CMDS), trap: .47, win: 2.2, rounds: 20, pic: false },
};

// ───────── 바탕
const world = new World($('gl'), { low: S.quality === 'low' || Q.get('q') === 'low' });
world.setTheme('castle'); world.renderer.toneMappingExposure = .9;
{ const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ color: 0x463a7a, metalness: .4, roughness: .35 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, -.01, 10); fl.receiveShadow = true; world.theme.add(fl); }
const audio = new UpsideAudio(); audio.bgmOn = S.bgm; audio.voiceOn = S.voice;
const say = (t, o) => speak(t, audio, Object.assign({ rate: 1.05, pitch: .9 }, o || {}));
const camCanvas = $('c');
let km = null;
const P = [new MotionInput({ video: null, canvas: null, settings: S }),
  new MotionInput({ video: null, canvas: null, settings: S, keymap: { left: 'j', right: 'l', armL: 'u', armR: 'o', spread: 'i', crouch: 'k', head: 'y', clap: 'p', tiltL: 'n', tiltR: 'm', walk: 'b', center: ';' } })];
const NAME = ['1P', '2P'], COLOR = ['#5ef2c8', '#ff9fc8'];

async function startInput(){
  if (S.input === 'keyboard') { if (km) { km.stop(); km = null; } P.forEach(p => p.startKeyboard()); chip(); return; }
  P.forEach(p => { p.stop(); p.mode = 'camera'; });
  if (km) { chip(); return; }
  km = window.KMotion.create({ video: $('v'), canvas: camCanvas, modes: ['pose'], duo: true, numPoses: 3, activity: 'simon', rangeButton: false });
  km.onStatus = s => chip(s);
  km.onFrame = fr => { drawPreview(fr); if (!fr.fresh) return; const d = fr.duo || [null, null];
    if (S.players === 2) { P[0].onFrame({ fresh: true, t: fr.t, pose: d[0] }); P[1].onFrame({ fresh: true, t: fr.t, pose: d[1] }); }
    else { // 혼자: 보이는 사람 중 어깨가 넓은(가까운) 쪽
      const sw = p => p ? Math.abs(p[11].x - p[12].x) : 0; const one = sw(d[0]) >= sw(d[1]) ? d[0] : d[1]; P[0].onFrame({ fresh: true, t: fr.t, pose: one || fr.pose || null }); } };
  try { await km.start(); chip(); } catch (e) { console.warn('[simon] camera', e); km = null; chip('카메라를 켤 수 없어요 — ⌨️ 키보드로 해 볼 수 있어요'); }
}
function chip(msg){ const c = $('camChip'); if (msg) { c.textContent = msg; c.className = 'chip'; return; } c.textContent = S.input === 'keyboard' ? '⌨️ 키보드 테스트' : km ? '📷 카메라 켜짐' : '📷 카메라 준비 중'; c.className = (S.input === 'keyboard' || km) ? 'chip ok' : 'chip'; }
function drawPreview(fr){ if (!camCanvas.isConnected || !km) return; const g = fr.ctx; g.save(); if (!S.mirror) { g.translate(fr.W, 0); g.scale(-1, 1); }
  km.drawCamera(); const d = fr.duo || [];
  if (S.players === 2) { [0, 1].forEach(i => { if (d[i]) km.drawSkeleton(d[i], km.POSE_BONES, COLOR[i], 4); }); g.strokeStyle = 'rgba(255,255,255,.6)'; g.setLineDash([10, 10]); g.lineWidth = 3; g.beginPath(); g.moveTo(fr.W / 2, 0); g.lineTo(fr.W / 2, fr.H); g.stroke(); g.setLineDash([]); }
  else if (P[0].pose) km.drawSkeleton(P[0].pose, km.POSE_BONES, COLOR[0], 4);
  g.restore(); }

// ───────── 캐릭터(학생을 거울처럼 그대로 따라 함)
let heroes = [];
function makeHeroes(){ heroes.forEach(h => world.dyn.remove(h.root)); heroes = [];
  for (let i = 0; i < S.players; i++) { const h = new Hero(); h.faceNow('front'); h.root.scale.setScalar(1.25); if (i === 1) { h.M.jacket.color.set(0xff8fab); h.M.jacket2.color.set(0xd9607e); h.M.hat.color.set(0x9fe9ff); }
    h.root.position.set(S.players === 2 ? (i ? 2.6 : -2.6) : 0, 0, 2.4); world.dyn.add(h.root); heroes.push(h); }
  world.setCam(V3(0, 2.6, 10.5), V3(0, 2.4, 0), { snap: true, sway: .3 }); }
function driveHeroes(dt){ heroes.forEach((h, i) => { const f = P[i].f; if (f.present) { const c = transform(f, ALL_OFF); h.setDrive({ sl: c.sl, sr: c.sr, tilt: c.tilt }); h.set(f.crouchOn ? 'sit' : 'idle'); } else { h.setDrive(null); h.set('idle'); } h.update(dt); }); }

// ───────── 게임
let state = 'title', G = null;
function showScreen(id){ for (const s of ['scr-title', 'hud', 'scr-over']) $(s).classList.toggle('hidden', s !== id); state = id.replace('scr-', ''); }
function mountCam(host){ if (!host) { camCanvas.remove(); return; } if (camCanvas.parentElement !== host) host.prepend(camCanvas); }
function enterTitle(){ showScreen('scr-title'); makeHeroes(); audio.play('castle'); seg('pSeg', S.players); seg('dSeg', S.diff); seg('inputSeg', S.input); chip();
  $('bestT').textContent = S.best ? `혼자 최고 기록 ${S.best}점` : ''; mountCam(S.input === 'camera' ? $('titleCam') : null); $('titleSense').classList.toggle('hidden', S.input !== 'camera'); }

function startGame(){ const L = LV[S.diff]; G = { L, round: 0, phase: 'ready', t: 0, readyT: 3.2, first: true, last: null, pl: P.slice(0, S.players).map(() => ({ hearts: 3, score: 0, out: false, streak: 0, res: null, hold: 0, failed: false })) };
  P.forEach(p => { p.resetStudent(); if (p.mode === 'camera') p.beginCalibration(); });
  if (km && km.resetDuo) km.resetDuo();
  showScreen('hud'); makeHeroes(); audio.play('run'); mountCam(S.input === 'camera' ? $('camWrap') : null); $('camWrap').classList.toggle('hidden', S.input !== 'camera');
  $('kbHelp').classList.toggle('hidden', S.input !== 'keyboard'); $('kbHelp2').classList.toggle('hidden', S.input !== 'keyboard' || S.players !== 2);
  renderPanels(); bubble('🧙', '카메라 앞에 서서 차렷!', false); say(S.players === 2 ? '두 친구 모두 카메라 앞에 서서 차렷!' : '카메라 앞에 서서 차렷!'); }

function alive(){ return G.pl.map((p, i) => !p.out ? i : -1).filter(i => i >= 0); }
function nextCommand(){ const g = G, L = g.L; g.round++; if (g.round > L.rounds || !alive().length) return endGame();
  let id; do { id = pick(L.cmds); } while (id === g.last && L.cmds.length > 1); g.last = id;
  const trap = g.round > 1 && Math.random() < L.trap; const C = CMDS[id];
  g.cur = { id, trap, C }; g.phase = 'cmd'; g.t = 0; g.win = Math.max(1.4, L.win * (1 - (g.round - 1) / L.rounds * .3)) + (C.say.length > 4 ? .3 : 0);
  g.pl.forEach((p, i) => { p.res = null; p.hold = 0; p.failed = false; p.startOk = !p.out && C.ok(P[i].f); mark(i, ''); });
  const text = (trap ? '' : '가라사대, ') + C.say + '!'; bubble(C.em, text, !trap, L.pic ? C.picto : null);
  say(text, { pitch: trap ? 1.0 : .85 }); wizardCast(!trap);
  $('round').textContent = `${g.round} / ${L.rounds}`; }
function judge(dt){ const g = G, C = g.cur.C; g.t += dt; const W = g.win; $('timeFill').style.width = clamp(1 - g.t / W, 0, 1) * 100 + '%';
  g.pl.forEach((p, i) => { if (p.out || p.res) return; const f = P[i].f, ok = C.ok(f) && !(p.startOk && g.t < .4);
    if (!g.cur.trap) { p.hold = ok ? p.hold + dt : Math.max(0, p.hold - dt * .5); if (p.hold >= .25) win(i, pick(['딩동댕!', '잘했어요!', '정확해요!'])); }
    else { p.hold = ok ? p.hold + dt : 0; if (p.hold >= .2) lose(i, '가라사대 안 했어요!'); } });
  if (g.t >= W) { g.pl.forEach((p, i) => { if (p.out || p.res) return; if (g.cur.trap) win(i, pick(['안 속았다!', '꼼짝 안 했어요!'])); else lose(i, '늦었어요!'); });
    g.phase = 'result'; g.t = 0; } }
function win(i, msg){ const p = G.pl[i]; p.res = 'win'; p.streak++; p.score += 1 + (p.streak >= 5 ? 1 : 0); mark(i, '⭕', msg); audio.success(); burstAt(i, 0xffd35a); heroes[i]?.setMood('cheer', 1); renderPanels(); }
function lose(i, msg){ const p = G.pl[i]; p.res = 'lose'; p.streak = 0; p.hearts--; mark(i, '❌', msg); audio.boing(); heroes[i]?.spinOnce(); world.kick(.15);
  if (p.hearts <= 0) { p.out = true; setTimeout(() => { mark(i, '💤', `${S.players === 2 ? NAME[i] + ' ' : ''}하트가 다 떨어졌어요`); say((S.players === 2 ? NAME[i] + ', ' : '') + '하트가 다 떨어졌어요!'); }, 700); }
  renderPanels(); }
function endGame(){ const g = G; g.phase = 'end'; audio.stopMusic(); audio.fanfare();
  setTimeout(() => { showScreen('scr-over'); const pl = g.pl;
    if (S.players === 1) { const s = pl[0].score, best = s > (S.best || 0); if (best) { S.best = s; save(); } $('ovTitle').textContent = pl[0].out ? '하트가 다 떨어졌어요!' : '끝까지 해냈어요!';
      $('ovBody').innerHTML = `<div class="ovone"><b>${s}</b><span>점</span></div><p class="ressub">${'❤️'.repeat(Math.max(0, pl[0].hearts))}${'🤍'.repeat(3 - Math.max(0, pl[0].hearts))} · ${best ? '🎉 새 최고 기록!' : '최고 기록 ' + S.best + '점'}</p>`;
      say(`${s}점! ${pl[0].out ? '다시 도전해 볼까요?' : '대단해요!'}`); }
    else { const [a, b] = pl; const sa = a.score * 10 + a.hearts, sb = b.score * 10 + b.hearts; const w = sa === sb ? -1 : sa > sb ? 0 : 1;
      $('ovTitle').textContent = w < 0 ? '🤝 무승부!' : `🏆 ${NAME[w]} 승리!`;
      $('ovBody').innerHTML = `<div class="ovduo">${pl.map((p, i) => `<div class="pcol ${w === i ? 'winner' : ''}" style="--pc:${COLOR[i]}"><h3>${NAME[i]}${w === i ? ' 👑' : ''}</h3><b>${p.score}</b><span>${'❤️'.repeat(Math.max(0, p.hearts))}${'🤍'.repeat(3 - Math.max(0, p.hearts))}</span></div>`).join('')}</div>`;
      say(w < 0 ? '무승부! 둘 다 잘했어요!' : NAME[w] + ' 승리!'); }
    $('ovQ').textContent = pick(['어떤 명령에 가장 많이 속았나요?', '「가라사대」를 잘 들으려면 어떻게 해야 할까요?', '친구와 함께 하니 어땠나요?', '내가 마법사라면 어떤 명령을 내고 싶나요?']); }, 1200); }

// ───────── 화면 조각
function bubble(em, text, real, pk){ const b = $('cmdBox'); b.className = 'cmdbox2 pop ' + (real ? 'real' : 'plain');
  const html = real && text.startsWith('가라사대') ? `<em>가라사대,</em> ${text.replace('가라사대, ', '')}` : text;
  b.innerHTML = `<span class="ce">${em}</span><span class="ct">${html}</span>${pk ? `<span class="cp">${picto(pk, { size: 90, label: false })}</span>` : ''}`; void b.offsetWidth; }
function mark(i, sym, msg){ const m = $('mark' + i); if (!sym) { m.className = 'mark'; m.innerHTML = ''; return; } m.className = 'mark show ' + (sym === '⭕' ? 'ok' : sym === '❌' ? 'no' : 'zz'); m.innerHTML = `<b>${sym}</b><span>${msg || ''}</span>`; }
function renderPanels(){ [0, 1].forEach(i => { const el = $('pp' + i); if (i >= S.players) { el.classList.add('hidden'); $('mark' + i).classList.add('hidden'); return; } el.classList.remove('hidden'); $('mark' + i).classList.remove('hidden');
  const p = G.pl[i]; el.style.setProperty('--pc', COLOR[i]); el.classList.toggle('out', p.out);
  el.innerHTML = `<h3>${S.players === 2 ? NAME[i] : '나'}</h3><div class="hearts">${'❤️'.repeat(Math.max(0, p.hearts))}${'🤍'.repeat(3 - Math.max(0, p.hearts))}</div><b>${p.score}<small>점</small></b>${p.streak >= 3 ? `<i>🔥 ${p.streak}연속</i>` : ''}`; }); }
function placeMarks(){ heroes.forEach((h, i) => { const v = h.root.position.clone(); v.y += 3.3; v.project(world.camera); const m = $('mark' + i); m.style.left = ((v.x + 1) / 2 * 100) + '%'; m.style.top = ((1 - v.y) / 2 * 100) + '%'; }); }
function burstAt(i, col){ const h = heroes[i]; if (h) { const p = h.root.position.clone(); p.y += 2; world.burst(p, col, 60, 5); world.ring(p, col, 1.5); } }
function wizardCast(real){ const wz = world.wizard; if (!wz) return; const p = V3(.7, wz.position.y + 2.3, -7.3); world.burst(p, real ? 0xffd35a : 0xbff4ff, 40, 4); audio.magic(); }

// ───────── 루프 단계
function updateGame(dt){ const g = G; if (!g) return;
  // 카메라: 누가 안 보이면 잠깐 멈춤
  if (S.input === 'camera' && g.phase !== 'end') { const miss = g.pl.map((p, i) => !p.out && !P[i].f.present ? i : -1).filter(i => i >= 0);
    if (miss.length) { g.missT = (g.missT || 0) + dt; if (g.missT > 1.2 || g.first) { $('away').classList.remove('hidden'); $('awayTx').textContent = miss.map(i => S.players === 2 ? NAME[i] : '탐험대원').join(', ') + ' 친구가 카메라에 안 보여요!'; if (g.phase === 'cmd') { g.t = Math.max(0, g.t - dt); } if (g.first) return; return; } }
    else { g.missT = 0; $('away').classList.add('hidden'); } }
  if (g.phase === 'ready') { g.readyT -= dt; const still = alive().every(i => !Object.values(CMDS).some(C => C.ok(P[i].f)));
    if (g.readyT <= 1 && !still) { g.readyT = 1; bubble('🧙', '차렷! 손을 내려요', false); }
    else if (g.readyT <= 0) { g.first = false; nextCommand(); } else if (!g.first && g.readyT < 1.1) { bubble('🧙', '차렷…', false); } }
  else if (g.phase === 'cmd') judge(dt);
  else if (g.phase === 'result') { g.t += dt; if (g.t > 1.3) { g.phase = 'ready'; g.readyT = 1.2; if (!alive().length) endGame(); } }
  sense(); }
function sense(){ const st = state === 'title' ? $('camStT') : $('camSt'); if (S.input !== 'camera') { st.textContent = ''; return; } const seen = G ? G.pl.map((p, i) => P[i].f.present) : [P[0].f.present];
  st.textContent = S.players === 2 ? `1P ${seen[0] ? '✓' : '✗'} · 2P ${seen[1] ? '✓' : '✗'}` : (seen[0] ? '✓ 몸을 찾았어요' : '몸이 안 보여요'); st.className = 'camst ' + (seen.every(Boolean) ? 'ok' : 'no'); }

// ───────── 버튼
function seg(id, v){ document.querySelectorAll('#' + id + ' button').forEach(b => b.classList.toggle('on', b.dataset.v === String(v))); }
document.addEventListener('click', e => { if (e.target.closest('button')) { audio.ensure(); audio.click(); } }, true);
document.querySelectorAll('#pSeg button').forEach(b => b.onclick = () => { S.players = +b.dataset.v; save(); seg('pSeg', S.players); makeHeroes(); if (km && km.resetDuo) km.resetDuo(); });
document.querySelectorAll('#dSeg button').forEach(b => b.onclick = () => { S.diff = b.dataset.v; save(); seg('dSeg', S.diff); });
document.querySelectorAll('#inputSeg button').forEach(b => b.onclick = () => { S.input = b.dataset.v; save(); startInput().then(enterTitle); });
document.querySelectorAll('#sMirror button').forEach(b => b.onclick = () => { S.mirror = b.dataset.v === 'true'; save(); seg('sMirror', S.mirror); });
document.querySelectorAll('#sVoice button').forEach(b => b.onclick = () => { S.voice = b.dataset.v === 'true'; audio.voiceOn = S.voice; save(); seg('sVoice', S.voice); });
document.querySelectorAll('#sBgm button').forEach(b => b.onclick = () => { S.bgm = b.dataset.v === 'true'; audio.ensure(); audio.setBgm(S.bgm); save(); seg('sBgm', S.bgm); });
$('btnStart').onclick = () => { audio.ensure(); startGame(); };
$('btnAgain').onclick = () => startGame();
$('btnHome').onclick = () => enterTitle();
$('btnPause').onclick = () => togglePause(); $('btnResume').onclick = () => togglePause(); $('btnQuit').onclick = () => { paused = false; $('pause').classList.add('hidden'); enterTitle(); };
$('btnCam').onclick = async () => { if (S.input !== 'camera') { S.input = 'camera'; save(); seg('inputSeg', 'camera'); } await startInput(); if (km) km.openRangeUI(); };
let paused = false; function togglePause(){ if (state !== 'hud') return; paused = !paused; $('pause').classList.toggle('hidden', !paused); }
addEventListener('keydown', e => { if (e.key === 'Escape') togglePause(); if (e.key === 'Enter') { if (state === 'title') startGame(); else if (state === 'over') startGame(); } });
$('btnFull').onclick = () => { const d = document; if (!d.fullscreenElement) d.documentElement.requestFullscreen?.().catch(() => {}); else d.exitFullscreen?.(); };
addEventListener('pagehide', () => { if (km) km.stop(); P.forEach(p => p.destroy()); audio.stopMusic(); });

let last = performance.now();
function loop(now){ requestAnimationFrame(loop); const dt = Math.min(Q.has('test') ? .1 : .05, (now - last) / 1000); last = now;
  P.forEach(p => p.update(dt));
  if (state === 'hud' && !paused) updateGame(dt);
  if (state === 'title') sense();
  driveHeroes(dt); if (state === 'hud') placeMarks(); world.update(dt); }
window.__km = { get state(){ return state; }, get G(){ return G; }, P, S, startGame };
seg('sMirror', S.mirror); seg('sVoice', S.voice); seg('sBgm', S.bgm);
enterTitle(); startInput().then(() => { if (state === 'title') enterTitle(); });
requestAnimationFrame(loop);
setTimeout(() => { $('loading').style.transition = 'opacity .5s'; $('loading').style.opacity = 0; setTimeout(() => $('loading').classList.add('hidden'), 550); }, 400);
