// K-MOTION RUN · 진입점: 모듈 연결 + 게임 루프
import { SceneManager } from './scene.js';
import { GameEngine, InputManager, GAME_TIME } from './game.js';
import { KeyboardInput, MotionController } from './input.js';
import { AudioManager } from './audio.js';
import { UIManager } from './ui.js';

const $ = id => document.getElementById(id);
const q = new URLSearchParams(location.search); const DEV = q.has('dev'); const quality = q.get('q') || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 'low' : 'high');
const ui = new UIManager(); if (DEV) ui.el.dev.classList.remove('hidden');
ui.loading(.1, '숲을 준비하는 중…');
const scene = new SceneManager($('gl'), quality); scene.fill(0);
ui.loading(.6, '캐릭터 준비 중…');
const audio = new AudioManager();
const input = new InputManager();
const keys = new KeyboardInput(input);
let motion = null, motionReady = false, countdownTimer = null, calibrating = false;

const hooks = {
  fx(kind, a){ const p = game.player, ch = scene.character;
    if (kind === 'lane') { audio.lane(); scene.dust(p.x, p.z + .4, 4, { size: .3 }); }
    else if (kind === 'jump') { audio.jump(); ch.set('jump'); scene.dust(p.x, p.z + .3, 6); scene.camKick = .35; }
    else if (kind === 'land') { audio.land(); ch.set('land'); scene.dust(p.x, p.z + .3, 10, { size: .5, grow: 2.6 }); scene.camKick = -.12; }
    else if (kind === 'slide') { audio.slide(); ch.set('slide'); scene.dust(p.x, p.z + .5, 8, { size: .4, vz: 2.5 }); }
    else if (kind === 'step') { audio.step(); if (Math.random() < .5) scene.dust(p.x + (Math.random() - .5) * .3, p.z + .4, 2, { size: .22, alpha: .3 }); }
    else if (kind === 'dodge') { audio.dodge(a.combo); ui.combo(a.combo); scene.sparkle(p.x, 1.4, p.z - 1, 6);
      if (a.combo === 5 || (a.combo >= 10 && a.combo % 5 === 0)) { ui.pop(`COMBO ×${a.combo}`, 'gold'); audio.combo(); } else if (a.combo >= 3 && a.combo % 3 === 0) ui.pop('PERFECT DODGE!', 'green'); else if (a.combo >= 2 && Math.random() < .5) ui.pop(a.combo % 2 ? 'GREAT!' : 'NICE!', 'small green'); }
    else if (kind === 'coin') { audio.coin(); scene.sparkle(a.x, a.y, a.z, 8); }
    else if (kind === 'hit') { audio.hit(); ui.flash(); ui.combo(0); ui.pop(game.life > 0 ? '아야!' : '', 'red'); ch.set('hit'); ch.flash(true); setTimeout(() => ch.flash(false), 160); setTimeout(() => ch.flash(true), 320); setTimeout(() => ch.flash(false), 460); scene.shake = 1; scene.dust(p.x, p.z, 12, { size: .55, grow: 3 }); }
  },
  pause(reason){ ui.pauseView(true, reason); ui.act(reason === 'lost' ? 'NO PLAYER' : 'PAUSED'); },
  resume(){ ui.pauseView(false); },
  end(r){ const key = 'kmrun.best.' + ui.diff; const best = Math.max(+(localStorage.getItem(key) || 0), r.score); localStorage.setItem(key, best);
    if (r.win) { audio.win(); scene.character.set('win'); } else { audio.lose(); }
    if (motion) motion.active = false; keys.enabled = false;
    setTimeout(() => { ui.result(r, best); ui.pauseView(false); }, r.win ? 1600 : 1100); }
};
const game = new GameEngine(scene.scene, input, hooks);
input.on('PAUSE_LOST', () => game.pause('lost'));
input.on('RESUME', () => { if (game.state === 'pause' && game.pauseReason === 'lost') game.resume(); });
input.on('*', e => { if (game.state !== 'play') return; if (e.type === 'MOVE_LEFT') ui.act('MOVE LEFT', true); else if (e.type === 'MOVE_RIGHT') ui.act('MOVE RIGHT', true); else if (e.type === 'JUMP') ui.act('JUMP', true); else if (e.type === 'SLIDE' && !e.hold) ui.act('SLIDE', true); });
let actCool = 0;

// ───────── 흐름
async function startFlow(){
  audio.ensure(); audio.startAmbient();
  if (ui.mode === 'camera') { ui.show('calib'); calibrating = true; ui.calib(0, false);
    try {
      if (!motion) motion = new MotionController(input, { video: $('v'), canvas: $('c'), getLane: () => game.player.lane, onStatus: s => { if (s.kind === 'error') { ui.camStatus('bad', s.text); } else { ui.camStatus(s.kind, s.text); if (game.state === 'play' && performance.now() > actCool) ui.act(s.text, s.text !== 'PLAYER DETECTED'); } }, onDebug: d => { if (DEV) ui.dev(`fps ${d.fps}  dx ${d.dx}  drop ${d.drop}  zone ${d.zone}\narmsUp ${d.armsUp}  squat ${d.squat}  knee ${d.knee}\nspeed ${game.speed.toFixed(1)}  obs ${game.obs.active.length}  draw ${scene.renderer.info.render.calls}`); } });
      if (!motion.started) { ui.calib(0, false); ui.el.calibMsg.textContent = '카메라를 켜는 중…'; await motion.start(); }
      motionReady = true; copyCalibView(true);
      await motion.calibrate(3, (p, vis) => { ui.calib(p, vis); if (p >= 1) audio.count(true); });
      if (!calibrating) return; copyCalibView(false); ui.camVisible(true);
    } catch (e) { ui.el.calibMsg.textContent = '카메라를 쓸 수 없어요: ' + (e.message || e) + ' → 키보드 모드로 시작해요'; await new Promise(r => setTimeout(r, 2200)); if (!calibrating) return; ui.mode = 'keyboard'; ui.camVisible(false); }
    calibrating = false;
  } else { ui.camVisible(false); }
  beginGame();
}
let calibCopy = null;
function copyCalibView(on){ if (calibCopy) { cancelAnimationFrame(calibCopy); calibCopy = null; } if (!on) return; const src = $('c'), dst = ui.el.calibView; dst.width = src.width; dst.height = src.height; const ctx = dst.getContext('2d'); const loop = () => { ctx.drawImage(src, 0, 0); calibCopy = requestAnimationFrame(loop); }; loop(); }
function beginGame(){
  ui.show('hud'); ui.pauseView(false); keys.enabled = true; ui.combo(0); ui.act('READY');
  game.player.reset(); scene.character.set('run'); game.state = 'idle'; game.obs.reset(game.player.z); game.score.reset(); game.life = 3; game.elapsed = 0; ui.hud(game);
  let n = 3; const tick = () => { if (n > 0) { ui.count(n); audio.count(false); n--; countdownTimer = setTimeout(tick, 900); } else { ui.count('GO!'); audio.count(true); game.start(ui.diff); if (motion && motionReady && ui.mode === 'camera') { motion.active = true; motion.paused = false; } ui.act('RUN!'); actCool = performance.now() + 600; } };
  tick();
}
function toStart(){ clearTimeout(countdownTimer); calibrating = false; copyCalibView(false); game.state = 'idle'; game.obs.reset(game.player.z); if (motion) motion.active = false; keys.enabled = true; ui.pauseView(false); ui.show('start'); scene.character.set('run'); }

$('btnStart').onclick = startFlow;
$('btnCalibCancel').onclick = toStart;
$('btnRetry').onclick = () => { audio.ensure(); if (ui.mode === 'camera' && motionReady) { ui.show('hud'); ui.camVisible(true); beginGame(); } else startFlow(); };
$('btnHome').onclick = toStart;
$('btnResume').onclick = () => game.resume();
$('btnQuit').onclick = toStart;
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') game.pause('manual'); });
addEventListener('keydown', e => { if (e.key === 'Enter' && !ui.el.start.classList.contains('hidden')) startFlow(); if ((e.key === 'm' || e.key === 'M')) audio.setMuted(!audio.muted); });

// ───────── 루프
let last = performance.now(), fpsAcc = 0, fpsN = 0, fpsShow = 0;
function loop(now){
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (game.state === 'idle') { game.player.z -= dt * 6; } // 시작 화면 뒤에서 천천히 달리는 숲
  game.update(dt);
  const p = game.player; scene.character.root.position.set(p.x, p.y, p.z); scene.character.root.visible = !(p.inv > 0 && game.state === 'play' && Math.floor(now / 90) % 2 === 0 && p.inv > .5);
  if (game.state === 'play' && p.state === 'run' && scene.character.state !== 'run' && !['jump', 'land', 'slide', 'hit'].includes(scene.character.state)) scene.character.set('run');
  if (p.state === 'run' && scene.character.state === 'slide') scene.character.set('run');
  if (p.state === 'run' && scene.character.state === 'jump' && !p.air) scene.character.set('land');
  scene.character.update(dt, game.state === 'play' ? game.speedNorm : .2, p.y, game.state === 'play' ? p.lanePush : 0);
  scene.update(dt, p, game.state === 'play' ? game : null);
  if (game.state === 'play' || game.state === 'pause') ui.hud(game);
  scene.render();
  if (DEV && !motion) { fpsAcc += dt; fpsN++; if (fpsAcc > .5) { fpsShow = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; ui.dev(`fps ${fpsShow}  speed ${game.speed.toFixed(1)}  obs ${game.obs.active.length}  draw ${scene.renderer.info.render.calls}  tri ${scene.renderer.info.render.triangles}`); } }
  requestAnimationFrame(loop);
}
ui.loading(1, '준비 완료'); ui.show('start'); requestAnimationFrame(loop);
