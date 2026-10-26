// K-MOTION POSE HERO · 진입점: 카메라/판정/3D/UI/소리 연결 + 게임 루프 (렌더 루프와 포즈 추론 루프 분리)
import { SceneManager } from './character.js';
import { Game, MODES } from './game.js';
import { PoseTracker } from './tracker.js';
import { CalibrationManager } from './evaluator.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';
import { POSES } from './poses.js';
const $ = id => document.getElementById(id);
const q = new URLSearchParams(location.search); const DEV = q.has('dev'); const quality = q.get('q') || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 'low' : 'high');
const ui = new UIManager(); if (DEV) { ui.el.dev.classList.remove('hidden'); ui.el.testWrap.classList.remove('hidden'); }
const scene = new SceneManager($('gl'), quality); const ch = scene.character, boss = scene.boss, fx = scene.fx;
const audio = new AudioManager(); ui.el.volM.value = audio.volM; ui.el.volS.value = audio.volS; ui.el.volM.oninput = e => audio.setMusic(+e.target.value); ui.el.volS.oninput = e => { audio.setSfx(+e.target.value); audio.ensure(); audio.tick(); };
let tracker = null, latestPose = null, latestT = 0, calibrating = false, countdownTimer = null, forcedUsed = false, testMode = false;

// ───── 게임 → 화면·소리·3D
const hooks = {
  pose(p, n){ ui.pose(p, n, { label: game.mode === 'mirror' ? `${n}/${game.total}` : game.mode === 'boss' ? `${n}/${game.poses}` : '' }); ch.setRig(p.rig); ch.set('pose'); ch.face = 'smile'; audio.appear(); tracker && (tracker.colors = null); },
  meter(sim, prog, missing, detail){ ui.meter(sim, prog, missing, detail); if (tracker && detail) { const L = Math.max(detail.armL || 0, detail.elbL || 0, detail.wxL || 0, detail.wyL || 0), R = Math.max(detail.armR || 0, detail.elbR || 0, detail.wxR || 0, detail.wyR || 0), B = Math.max(detail.lean || 0, detail.drop || 0, detail.knee || 0); tracker.colors = game.cur ? { L, R, body: B } : null; } },
  success(r, took, pose, forced){ if (forced) forcedUsed = true; ui.hud(game.score.score, r.combo); ui.judge(r.grade.label, r.grade.id); const big = r.combo >= 5 && r.combo % 5 === 0; ui.pop(r.grade.id === 'PERFECT' ? 'PERFECT!' : r.grade.id === 'GREAT' ? 'GREAT!' : 'GOOD!', r.grade.id === 'PERFECT' ? 'gold' : r.grade.id === 'GREAT' ? 'cyan' : 'green');
    if (big) { setTimeout(() => ui.pop(`COMBO ×${r.combo}`, 'gold small'), 180); audio.combo(r.combo); ui.flash('gold'); } else if (r.combo >= 3 && r.combo % 3 === 0) setTimeout(() => ui.pop('AWESOME!', 'violet small'), 150);
    audio.success(r.grade.id); if (game.mode !== 'boss') { ch.set('success'); ch.face = 'big'; } fx.burst(ch.handPos('L'), 10 + (r.grade.id === 'PERFECT' ? 10 : 0)); fx.burst(ch.handPos('R'), 10 + (r.grade.id === 'PERFECT' ? 10 : 0)); scene.pulse(); if (r.grade.id === 'PERFECT') fx.burst(ch.hips.position.clone().setY(2.6), 16, { speed: 1.5, up: .6, grav: 2 }); },
  fail(reason, pose){ ui.hud(game.score.score, 0); const almost = game.ev.sim >= .55; ui.judge(almost ? 'ALMOST!' : 'TRY AGAIN!', 'MISS'); ui.pop(almost ? 'ALMOST!' : 'TRY AGAIN!', 'red small'); audio.fail(); ch.set('fail'); ch.face = 'oh'; },
  retry(pose){ ui.poseText(pose.name, '한 번 더! ' + pose.hint, pose.emoji); ch.setRig(pose.rig); ch.set('pose'); },
  time(ms){ ui.time(ms); },
  level(n){ ui.level(n); if (n > 1) audio.combo(3); },
  life(n){ ui.life(n); },
  pause(reason){ ui.pauseView(true, reason); ui.camStatus(reason === 'lost' ? 'lost' : 'ok', reason === 'lost' ? 'NO PLAYER' : 'PAUSED'); audio.stopMusic(); },
  resume(){ ui.pauseView(false); ui.camStatus('ok', 'PLAYER DETECTED'); startMusic(); },
  end(r){ r.forced = forcedUsed; const best = ui.saveBest(r.mode, r.diff || ui.diff, forcedUsed ? 0 : r.score); audio.stopMusic(); if (r.win) { audio.win(); ch.set('cheer'); ch.face = 'big'; fx.confetti(70); } else { audio.lose(); ch.set('fail'); } boss.visible(false);
    setTimeout(() => { ui.result(r, best); ui.pauseView(false); }, r.win ? 1800 : 1200); },
  // memory
  memRound(round, n, again){ ui.memSlots(n); ui.banner(again ? '다시 도전!' : `ROUND ${round}`, `포즈 ${n}개를 순서대로 기억해요`, 1300); ui.poseText(again ? '다시 봐요' : `ROUND ${round}`, '잘 보고 기억해요 👀', '🧠'); ch.setRig({}); ch.set('idle'); },
  memShow(p, i, n){ ui.pose(p, i + 1, { label: `${i + 1}/${n} 기억!` }); ui.memSlotState(i, 'show', p.emoji); ch.setRig(p.rig); ch.set('pose'); audio.appear(); },
  memDo(n){ ui.banner('이제 따라 해요!', '순서대로 포즈를 해요', 1200); ui.poseText('순서대로!', '첫 번째 포즈는?', '❓'); ch.setRig({}); ch.set('idle'); ui.memSlotState(0, 'cur'); },
  memSlot(i){ if (i > 0) ui.memSlotState(i - 1, 'done', game.seq[i - 1].emoji); if (i < game.seq.length) { ui.memSlotState(i, 'cur'); ui.poseText('순서대로!', `${i + 1}번째 포즈는?`, '❓'); } },
  memClear(round){ ui.banner('CLEAR!', `ROUND ${round} 성공`, 1500); audio.win(); ch.set('cheer'); ch.face = 'big'; fx.confetti(30); },
  memWrong(reason, i, did){ ui.banner(reason === 'wrong' ? '순서가 달라요!' : '시간이 지났어요', reason === 'wrong' && did ? `${i + 1}번째는 「${POSES.find(p => p.id === did).name}」이 아니에요` : '처음부터 다시 보여줄게요', 1400); },
  // rhythm
  rhythmStart(bpm){ ui.rhythm(bpm); ui.poseText('리듬 준비', '박자에 맞춰 딱!', '🎵'); ch.setRig({}); ch.set('idle'); },
  rhythmCount(){ ui.banner('READY', '박자를 들어요', 1000); },
  rhythmPose(p, i, n){ ui.pose(p, i, { label: `${i}/${n}` }); ch.setRig(p.rig); ch.set('pose'); audio.appear(); },
  rhythmRing(u){ ui.rhythmRing(u); },
  beat(i){ ui.beat(); scene.pulse(); },
  audioNow(){ return audio.now; },
  // boss
  bossIntro(){ boss.visible(true); boss.set('intro'); boss.hp = 1; audio.bossRoar(); ui.banner('👹 SHADOW KING', '포즈로 공격하라!', 1800); ui.poseText('보스 등장!', '포즈를 성공하면 공격!', '👹'); scene.shake = 1; },
  bossAttack(big, dmg, done){ ch.set('attack'); ch.face = 'big'; audio.attack(big); if (big) ui.pop('COMBO ATTACK!', 'gold small'); setTimeout(() => fx.shoot(ch.handPos('R'), boss.root.position.clone(), big, () => { boss.set('hit'); boss.flash = 1; fx.burst(boss.root.position.clone(), big ? 40 : 22, { speed: 2.6, colors: [0xffd23f, 0xff4d6d, 0xb388ff] }); scene.shake = big ? 1 : .5; done(); }), 220); },
  bossHp(hp, dmg){ ui.el.bossHpFill.style.width = hp + '%'; ui.pop(`-${dmg}`, 'red small'); },
  bossStrike(done){ boss.set('attack'); audio.bossRoar(); setTimeout(() => { ui.flash(); audio.hurt(); ch.set('hurt'); ch.face = 'oh'; scene.shake = 1; done(); }, 450); },
  bossWin(){ boss.set('die'); audio.win(); fx.burst(boss.root.position.clone(), 60, { speed: 3.5, life: 1.4 }); ui.banner('VICTORY!', 'SHADOW KING 격파!', 2200); scene.shake = 1; ui.el.poseCard.classList.add('hidden'); },
  bossLose(){ ui.banner('으악…', '다시 도전해 보자!', 1500); },
  bossEscape(){ ui.banner('보스가 도망갔어요!', '체력을 다 깎지 못했어요', 1500); },
};
const game = new Game(hooks);
function startMusic(){ if (game.state !== 'play') return; if (game.mode === 'rhythm') audio.startMusic('rhythm', game.bpm, (i, t) => game.onBeat(i, t)); else audio.startMusic(game.mode === 'boss' ? 'boss' : game.mode === 'memory' ? 'calm' : 'party', game.mode === 'speed' ? 120 : 104); }

// ───── 흐름
async function startFlow(){
  audio.ensure(); testMode = DEV && ui.el.testMode.checked; forcedUsed = false;
  if (!testMode) { ui.show('scr-calib'); calibrating = true; ui.calib(0, false, '카메라를 켜는 중…');
    try {
      if (!tracker) tracker = new PoseTracker({ video: $('v'), canvas: $('c'), onFrame: (f, ok) => { latestPose = f.pose; latestT = f.t; if (cm.c) cm.feed(f.pose, game.norm.read(f.pose), f.t, f.W, f.H); }, onStatus: s => { if (s.kind === 'error') { ui.camStatus('lost', s.text); ui.camStart('bad', s.text); } else if (s.kind === 'lost') { ui.camStatus('lost', 'NO PLAYER'); if (game.state === 'play' && !testMode) game.pause('lost'); } else if (s.kind === 'found') { ui.camStatus('ok', 'PLAYER DETECTED'); if (game.state === 'pause' && game.pauseReason === 'lost') game.resume(); } } });
      await tracker.start(); ui.camStart('ok', '연결됨'); copyCalibView(true);
      await cm.start(3000, (p, ok, msg) => { ui.calib(p, ok, msg); if (p >= 1) audio.count(true); });
      if (!calibrating) return; ui.calib(1, true, '준비가 완료되었습니다'); await wait(500); copyCalibView(false); ui.camVisible(true); ui.camStatus('ok', 'PLAYER DETECTED');
    } catch (e) { ui.calib(0, false, '카메라를 쓸 수 없어요: ' + (e.message || e)); ui.camStart('bad', '사용 불가'); await wait(2400); if (calibrating) toStart(); return; }
    calibrating = false;
  } else { ui.camVisible(false); game.norm.base = null; }
  beginGame();
}
const cm = new CalibrationManager(game.norm);
const wait = ms => new Promise(r => setTimeout(r, ms));
let calibCopy = null;
function copyCalibView(on){ if (calibCopy) { cancelAnimationFrame(calibCopy); calibCopy = null; } if (!on) return; const src = $('c'), dst = ui.el.calibView; dst.width = src.width; dst.height = src.height; const ctx = dst.getContext('2d'); const loop = () => { ctx.drawImage(src, 0, 0); calibCopy = requestAnimationFrame(loop); }; loop(); }
function beginGame(){
  ui.show('hud'); ui.setup(ui.mode); ui.pauseView(false); game.state = 'idle'; boss.visible(false); ch.setRig({}); ch.set('idle'); ch.face = 'smile'; ui.poseText('준비!', MODES[ui.mode].desc, MODES[ui.mode].icon);
  let n = 3; const tick = () => { if (n > 0) { ui.count(n); audio.count(false); n--; countdownTimer = setTimeout(tick, 900); } else { ui.count('GO!'); audio.count(true); game.start(ui.mode, ui.diff); startMusic(); } }; tick();
}
function toStart(){ clearTimeout(countdownTimer); calibrating = false; cm.cancel(); copyCalibView(false); game.state = 'idle'; game.ev.setTarget(null); audio.stopMusic(); ui.pauseView(false); ui.show('scr-start'); boss.visible(false); ch.setRig({}); ch.set('idle'); ch.face = 'smile'; }
$('btnStart').onclick = startFlow; $('btnCalibCancel').onclick = toStart;
$('btnRetry').onclick = () => { audio.ensure(); forcedUsed = false; if (tracker && tracker.started && game.norm.base && !testMode) { ui.camVisible(true); beginGame(); } else startFlow(); };
$('btnHome').onclick = toStart; $('btnResume').onclick = () => game.resume(); $('btnQuit').onclick = toStart;
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') game.pause('manual'); });
addEventListener('keydown', e => { const k = e.key; if (k === 'Enter' && !ui.el['scr-start'].classList.contains('hidden')) return startFlow();
  if (k === 'Escape') { if (game.state === 'play') game.pause('manual'); else if (game.state === 'pause' && game.pauseReason !== 'lost') game.resume(); return; }
  if (k === 'm' || k === 'M') audio.setMuted(!audio.muted);
  if (!DEV) return; // 개발자 테스트 모드(?dev=1): P 강제 성공 · F 강제 실패 · N 다음 · Space 일시 정지 · R 재시작
  if (k === 'p' || k === 'P') game.forceSuccess(); else if (k === 'f' || k === 'F') game.forceFail(); else if (k === 'n' || k === 'N') game.skip(); else if (k === ' ') { e.preventDefault(); game.state === 'play' ? game.pause('manual') : game.state === 'pause' ? game.resume() : 0; } else if (k === 'r' || k === 'R') { if (game.state !== 'idle') beginGame(); } });

// ───── 루프 (렌더 60fps 목표, 포즈 추론은 엔진 루프에서 별도)
let last = performance.now(), fpsAcc = 0, fpsN = 0, fpsShow = 0;
function loop(now){ const dt = Math.min(.05, (now - last) / 1000); last = now; fpsAcc += dt; fpsN++; if (fpsAcc >= 1) { fpsShow = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
  game.update(testMode ? null : latestPose, now, dt * 1000); scene.render(dt);
  if (DEV) { const f = game.ev.feat || {}; const F = k => f[k] === undefined ? '-' : (+f[k]).toFixed(k.startsWith('w') || k === 'drop' ? 2 : 0); ui.dev(`render ${fpsShow}fps · pose ${tracker ? tracker.fps : 0}fps · draw ${scene.renderer.info.render.calls}\nstate ${game.state} mode ${game.mode} target ${game.cur ? game.cur.id : '-'}\nsim ${(game.ev.sim * 100).toFixed(0)}% hold ${Math.round(game.ev.hold)}/${game.ev.holdMs}ms missing ${(game.ev.missing || []).join(',') || '-'}\narmL ${F('armL')} armR ${F('armR')} elbL ${F('elbL')} elbR ${F('elbR')} lean ${F('lean')} drop ${F('drop')} knee ${F('knee')} wd ${F('wd')}\nwxL ${F('wxL')} wyL ${F('wyL')} wxR ${F('wxR')} wyR ${F('wyR')}\nP 성공 · F 실패 · N 다음 · Space 멈춤 · R 재시작`); }
  requestAnimationFrame(loop); }
requestAnimationFrame(loop);
