// K-MOTION 거꾸로 나라 (UPSIDE DOWN WORLD) · 화면 흐름
// 시작 → 이야기 → 지도 → (자세 보정) → 미션 → 결과·생각 나누기 / 자유 체험 / 모둠 대항전 / 설정
import * as THREE from 'three';
import { World } from './world.js';
import { Hero } from './hero.js';
import { MotionInput, DIFF } from './motion.js';
import { transform, ALL_OFF, RULE_NAMES, randomRules } from './reverse.js';
import { UpsideAudio, say as speak } from './audio.js';
import { MISSIONS } from './missions.js';
import { picto } from './picto.js';

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const store = { get(k, d){ try { return Object.assign(d, JSON.parse(localStorage.getItem(k) || '{}')); } catch (e) { return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

// ───────── 설정·기록(기기에 기억 — 학생 영상·얼굴은 저장하지 않음)
const autoLow = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
const S = store.get('kmupside.set', { diff: 'normal', sens: 1, input: 'camera', mirror: true, freeSec: 20, limit: 0, voice: true, bgm: true, preview: true, groups: 7, quality: autoLow ? 'low' : 'high' });
if (Q.get('input') === 'keyboard' || Q.has('kb') || Q.has('mouse')) S.input = 'keyboard';
const saveS = () => store.set('kmupside.set', S);
const P = store.get('kmupside.progress', { pieces: [false, false, false, false, false], story: false });
const saveP = () => store.set('kmupside.progress', P);
const G = store.get('kmupside.groups', { list: [], order: [], cur: 0, stu: 1, mission: 0 });
const saveG = () => store.set('kmupside.groups', G);

const COLORS = MISSIONS.map(m => m.info.color);
const ICONS = ['🪞', '🌳', '🏃', '🧪', '🏰'];
const THINK = {
  mirror: ['평소와 반대로 움직이니 어떤 느낌이 들었나요?', '거울 속 캐릭터는 왜 반대로 움직였을까요?', '여러분이 새로운 거꾸로 마법을 만든다면 무엇을 만들고 싶나요?'],
  forest: ['하늘로 올라가는 폭포가 있다면 어떤 일이 생길까요?', '몸을 낮추면 올라가는 세상, 무엇이 재미있었나요?', '어떤 거꾸로 규칙이 가장 재미있었나요?'],
  town: ['움직이면 멈추고 멈추면 움직이는 세상에서는 어떻게 학교에 갈까요?', '평소와 반대로 움직이니 어떤 느낌이 들었나요?', '우리 학교가 거꾸로 나라가 된다면 어떤 일이 생길까요?'],
  lab: ['작은 것이 커지고 큰 것이 작아진다면 무엇을 크게 만들고 싶나요?', '크기 마법을 쓰려면 어떻게 생각해야 했나요?', '여러분이 새로운 거꾸로 마법을 만든다면 무엇을 만들고 싶나요?'],
  castle: ['어떤 거꾸로 규칙이 가장 재미있었나요?', '우리 학교가 거꾸로 나라가 된다면 어떤 일이 생길까요?', '여러분이 새로운 거꾸로 마법을 만든다면 무엇을 만들고 싶나요?', '평소와 반대로 생각하니 어떤 점이 새로웠나요?'],
};
// 규칙 카드 줄: [동작 그림, 내가 하면, 캐릭터는, 그림 글자]
const ROWS = {
  lr: ['moveR', '내가 오른쪽으로 가면', '캐릭터는 왼쪽으로!', '⬅️'],
  arms: ['armL', '내가 왼팔을 들면', '캐릭터는 오른팔을!', '🙋'],
  head: ['tiltL', '내 고개를 왼쪽으로', '캐릭터 고개는 오른쪽으로!', '🙂'],
  big: ['crouch', '내가 몸을 웅크리면', '캐릭터는 커져요!', '🔍'],
  small: ['spread', '내가 크게 펼치면', '캐릭터는 작아져요!', '🐭'],
  mid: ['stand', '평범하게 서면', '보통 크기!', '🧍'],
  up: ['crouch', '내가 몸을 낮추면', '캐릭터는 위로 올라가요!', '⬆️'],
  down: ['up', '내가 몸을 일으키면', '캐릭터는 아래로 내려가요!', '⬇️'],
  go: ['still', '내가 가만히 있으면', '캐릭터가 앞으로 가요!', '🏃'],
  stop: ['walk', '내가 제자리에서 걸으면', '캐릭터가 멈춰요!', '🛑'],
  climb: ['crouch', '상자 앞에서 몸을 낮추면', '캐릭터가 상자 위로!', '📦'],
  squash: ['spread', '납작해지면 크게 펼쳐요', '원래 크기로 돌아와요!', '✨'],
};
const CARDS = { mirror: ['lr', 'arms', 'big', 'small', 'head'], forest: ['up', 'down', 'lr'], town: ['go', 'stop', 'climb', 'squash'], lab: ['big', 'small', 'mid'], castle: ['lr', 'arms', 'small', 'go', 'up'] };
const STORY = [['🏰', '어느 날, 거꾸로 나라에 이상한 마법이 걸렸어요!'], ['🙃', '하늘과 땅이 뒤집히고, 물건이 거꾸로 움직여요.'], ['🧭', '여러분은 거꾸로 나라 탐험대원! 평소와 반대로 생각하고 움직여요.'], ['💎', '다섯 지역의 마법 조각을 모아 마법을 풀어 주세요!']];

// ───────── 핵심 객체
const loadBar = v => { $('loadBar').style.width = (v * 100 | 0) + '%'; };
loadBar(.2);
const world = new World($('gl'), { low: S.quality === 'low' || Q.get('q') === 'low' });
loadBar(.6);
const audio = new UpsideAudio(); audio.bgmOn = S.bgm; audio.voiceOn = S.voice;
const camCanvas = document.createElement('canvas'); camCanvas.width = 480; camCanvas.height = 360; camCanvas.id = 'c';
const motion = new MotionInput({ video: $('v'), canvas: camCanvas, settings: S });
let calibrated = false;
const say = t => speak(t, audio);

// 카메라 미리보기 그리기(거울/그대로). 포즈 좌표는 늘 거울 좌표라, 그대로 보기일 땐 그림 전체를 함께 뒤집는다(중복 반전 없음)
motion.onPreview = (fr, km) => { if (!camCanvas.isConnected) return; const ctx = fr.ctx; ctx.save(); if (!S.mirror) { ctx.translate(fr.W, 0); ctx.scale(-1, 1); }
  km.drawCamera(); if (fr.pose) km.drawSkeleton(fr.pose, km.POSE_BONES, 'rgba(255,211,90,.95)', 4); ctx.restore(); };
motion.on('status', s => setCamChip(s));
motion.on('calibrated', () => { if (state === 'calib') calibDone(); });

function setCamChip(s){ const c = $('camChip'); if (motion.mode === 'keyboard') { c.textContent = '⌨️ 키보드 테스트 모드'; c.className = 'chip ok'; return; }
  if (s) { c.textContent = s; c.className = 'chip'; c.dataset.msg = s; return; } if (!motion.km && c.dataset.msg) { c.textContent = c.dataset.msg; return; } c.dataset.msg = ''; c.textContent = motion.km ? '📷 카메라 켜짐' : '📷 카메라 꺼짐'; c.className = motion.km ? 'chip ok' : 'chip'; }
async function startInput(){ if (S.input === 'keyboard') { motion.startKeyboard(); setCamChip(); return; }
  try { await motion.startCamera(); setCamChip(''); } catch (e) { console.warn('[upside] camera', e); camErr = String(e && e.message || e); setCamChip('카메라를 켤 수 없어요 — ⌨️ 키보드 테스트를 눌러 보세요'); } }
let camErr = '';

// ───────── 화면 전환
const SCREENS = ['scr-title', 'scr-story', 'scr-map', 'scr-calib', 'hud', 'scr-result', 'scr-free', 'scr-group', 'scr-settings'];
let state = 'loading';
function show(id){ SCREENS.forEach(s => $(s).classList.toggle('hidden', s !== id)); $('pause').classList.add('hidden'); state = id.replace('scr-', ''); }
function mountCam(host){ if (!host) { camCanvas.remove(); return; } if (camCanvas.parentElement !== host) host.prepend(camCanvas); }
// 규칙 카드: 미션 시작 때 「내가 하면 → 캐릭터는」을 그림으로
let cardOpen = false, cardTO = 0, cardDone = null;
function ruleCard(id, title, done){ const keys = CARDS[id] || []; if (!keys.length) { done && done(); return; }
  cardOpen = true; cardDone = done; $('rcTitle').textContent = title || '이 지역의 거꾸로 규칙';
  $('rcRows').innerHTML = keys.map(k => { const [pk, me, hero, em] = ROWS[k]; return `<div class="rrow">${picto(pk, { size: 110 })}<span class="me">${me}</span><span class="arr">➜</span><span class="em">${em}</span><span class="hero">${hero}</span></div>`; }).join('');
  $('ruleCard').classList.remove('hidden'); audio.magic();
  say((title || '이 지역의 거꾸로 규칙') + '. ' + keys.map(k => ROWS[k][1] + ', ' + ROWS[k][2]).join(' '));
  clearTimeout(cardTO); cardTO = setTimeout(closeCard, 6000 + keys.length * 3500); }
function closeCard(){ if (!cardOpen) return; cardOpen = false; clearTimeout(cardTO); $('ruleCard').classList.add('hidden'); speechSynthesis && speechSynthesis.cancel(); const d = cardDone; cardDone = null; d && d(); }
$('btnRcOk').onclick = closeCard;
addEventListener('keydown', e => { if (cardOpen && e.key === 'Enter') closeCard(); });
// 인식 확인판: 카메라 위 상태 + 지금 잡힌 동작
function updateSense(st){ const f = motion.f, cam = motion.mode === 'camera';
  if (st) { if (!cam) st.textContent = '⌨️ 키보드'; else if (!motion.km) { st.textContent = '카메라 켜는 중…'; st.className = 'camst'; } else if (f.present) { st.textContent = '✓ 몸을 찾았어요'; st.className = 'camst ok'; } else { st.textContent = '몸이 안 보여요 — 뒤로 한 걸음'; st.className = 'camst no'; } }
  const A = $('acts'); if (!A || A.offsetParent === null) return; const th = motion.diff.lateral * motion.sens;
  const on = { armL: f.armLUp, armR: f.armRUp, spread: f.spreadOn, crouch: f.crouchOn, moving: f.present && f.moving, still: f.present && !f.moving, tilt: !!f.tiltDir };
  A.querySelectorAll('i[data-a]').forEach(i => { const k = i.dataset.a; if (k === 'pos') { const b = i.querySelectorAll('b'); b[0].classList.toggle('on', f.x < -th); b[1].classList.toggle('on', f.x > th); i.querySelector('span').style.transform = `translateX(${clamp(f.x, -2, 2) * 8}px)`; } else i.classList.toggle('on', !!on[k]); }); }
document.addEventListener('click', e => { if (e.target.closest('button')) { audio.ensure(); audio.click(); } }, true);

// ───────── HUD (미션이 부르는 화면 도구)
let toastTO = 0;
const ui = {
  task(text, icon){ $('taskTx').textContent = text; $('taskIc').textContent = icon || ''; const t = $('task'); t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); },
  progress(k, n){ $('prog').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < k ? 'on' : ''}"></i>`).join(''); },
  hold(fr){ $('holdFg').style.strokeDashoffset = 101 * (1 - clamp(fr, 0, 1)); $('holdSvg').classList.toggle('on', fr > .01); },
  hint(kind, text){ if (!kind) { $('hint').classList.add('hidden'); return; } $('hintPic').innerHTML = picto(kind, { size: 150 }); $('hintTx').textContent = text || ''; $('hint').classList.remove('hidden'); },
  command(kind, text){ if (!kind) { $('cmd').classList.add('hidden'); return; } $('cmdPic').innerHTML = picto(kind, { size: 140 }); $('cmdTx').textContent = '거꾸로 생각해요!'; $('cmd').classList.remove('hidden'); },
  toast(text){ const t = $('toast'); t.textContent = text; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show'); },
  timer(sec){ const t = $('timer'); if (sec == null) { t.classList.add('hidden'); return; } t.classList.remove('hidden'); const n = $('timerN'); if (n.textContent !== String(sec)) { n.textContent = sec; if (sec <= 5) audio.tick(); } },
  setRules(R){ const SHORT = { lr: '↔️ 내가 오른쪽 → 캐릭터 왼쪽', arms: '🙋 내 왼팔 → 캐릭터 오른팔', size: '🔍 웅크리면 커지고 펼치면 작아져요', move: '🛑 가만히 = 앞으로 · 걸으면 = 멈춤', gravity: '🎈 몸을 낮추면 위로', head: '🙂 고개도 반대로' }; $('rules').innerHTML = Object.keys(RULE_NAMES).filter(k => R && R[k]).map(k => `<span>${SHORT[k]}</span>`).join(''); },
  trip(fr){ const el = $('trip'); if (fr == null) { el.classList.add('hidden'); return; } el.classList.remove('hidden'); $('tripFill').style.width = clamp(fr, 0, 1) * 100 + '%'; $('tripKid').style.left = clamp(fr, 0, 1) * 100 + '%'; },
  ending(on){ $('ending').classList.toggle('hidden', !on); },
  flash(){ const f = $('flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); },
};
function renderPieces(el, arr, cur){ el.innerHTML = COLORS.map((c, i) => `<i style="--c:${c}" class="${arr[i] || i === cur ? 'on' : ''}" title="${MISSIONS[i].info.name}"></i>`).join(''); }

// ───────── 시작 화면(캐릭터가 따라 하다가 거꾸로!)
let titleHero = null, demo = { t: 0, rev: false, away: 0, flip: -1, flipWait: 3, x: 0 };
function enterTitle(){
  if (mission) endMission(); show('scr-title'); $('titleSense').classList.toggle('hidden', motion.mode !== 'camera'); mountCam(motion.mode === 'camera' ? $('titleCam') : null);
  world.setTheme('title'); audio.play('title'); world.setCam(new THREE.Vector3(-2.0, 2.0, 6.3), new THREE.Vector3(-2.0, 1.75, 0), { snap: true });
  titleHero = new Hero(); titleHero.faceNow('front'); titleHero.root.position.set(0, .02, 0); world.dyn.add(titleHero.root); demo = { t: 0, rev: false, away: 0, flip: -1, flipWait: 3, x: 0 };
  $('titleTip').textContent = motion.mode === 'keyboard' ? '키보드로 움직여 보세요(←→ Q E ↑ ↓). 캐릭터가 따라 해요!' : '카메라 앞에 서 보세요. 캐릭터가 여러분을 따라 해요!';
  syncSeg('inputSeg', S.input); setCamChip();
}
function updateTitle(dt){
  const f = motion.f, H = titleHero; if (!H) return;
  if (f.present && (motion.mode === 'keyboard' || motion.pose)) { demo.t += dt; demo.away = 0;
    if (!demo.rev && demo.t > 5) { demo.rev = true; audio.magic(); world.burst(new THREE.Vector3(0, 1.4, 0), 0xff9fc8, 120, 6); world.ring(new THREE.Vector3(0, 1.2, 0), 0xffd35a, 2.5); H.spinOnce(); H.setMood('wow', 1.5);
      $('titleTip').textContent = '✨ 어? 캐릭터가 거꾸로 움직여요! 무엇이 반대일까요?'; say('어? 거꾸로 마법이 걸렸어요!'); }
    const c = transform(f, demo.rev ? { ...ALL_OFF, lr: true, arms: true, size: true, head: true } : ALL_OFF);
    H.setDrive({ sl: c.sl, sr: c.sr, tilt: c.tilt }); demo.x = damp(demo.x, clamp(c.x, -1.6, 1.6) * 1.1, 6, dt); H.root.position.x = demo.x; H.setScale(1 + clamp(c.grow, -1, 1) * .3); H.set('idle'); }
  else { demo.away += dt; H.setDrive(null); H.setScale(1); demo.x = damp(demo.x, 0, 3, dt); H.root.position.x = demo.x; if (demo.away > 5 && demo.rev) { demo.rev = false; demo.t = 0; $('titleTip').textContent = '카메라 앞에 서 보세요. 캐릭터가 여러분을 따라 해요!'; }
    // 아무도 없을 땐 공중제비(거꾸로!)
    demo.flipWait -= dt; if (demo.flipWait < 0 && demo.flip < 0) { demo.flip = 0; audio.whoosh(); }
    if (demo.flip >= 0) { demo.flip += dt / 1.1; const u = Math.min(1, demo.flip); H.body.rotation.x = -Math.PI * 2 * (u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2); H.body.position.y = Math.sin(u * Math.PI) * 1.3; if (u >= 1) { demo.flip = -1; demo.flipWait = 4 + Math.random() * 3; H.body.rotation.x = 0; H.body.position.y = 0; world.burst(new THREE.Vector3(demo.x, .2, 0), 0xfff1a8, 25, 3); } }
    H.set('idle'); }
  H.update(dt);
}

// ───────── 이야기
let storyI = 0;
function enterStory(){ show('scr-story'); storyI = 0; renderStory(); }
function renderStory(){ const [art, tx] = STORY[storyI]; $('storyArt').textContent = art; $('storyText').textContent = tx; $('storyDots').innerHTML = STORY.map((_, i) => `<i class="${i === storyI ? 'on' : ''}"></i>`).join(''); say(tx); }
$('btnStoryNext').onclick = () => { storyI++; if (storyI >= STORY.length) { P.story = true; saveP(); enterMap('adventure'); } else renderStory(); };
$('btnStorySkip').onclick = () => { P.story = true; saveP(); enterMap('adventure'); };

// ───────── 지도
let playMode = 'adventure', mIdx = 0;
const NODE_POS = [[10, 72], [29, 28], [49, 72], [69, 28], [88, 72]];
function nextIdx(){ const i = P.pieces.findIndex(x => !x); return i < 0 ? 5 : i; }
function enterMap(mode){
  if (mission) endMission(); prevState = 'map'; playMode = mode || playMode; show('scr-map'); if (world.themeName !== 'title') { world.setTheme('title'); } audio.play('title');
  if (titleHero && !titleHero.root.parent) titleHero = null;
  world.setCam(new THREE.Vector3(0, 6, 14), new THREE.Vector3(0, 4, -4), { follow: 1.5 });
  $('mapTitle').textContent = playMode === 'adventure' ? '🗺️ 거꾸로 나라 지도' : '🎯 미션 선택';
  $('mapTip').textContent = playMode === 'adventure' ? (nextIdx() < 5 ? '빛나는 지역을 눌러 탐험을 시작해요' : '모든 조각을 모았어요! 어느 지역이든 다시 가 볼 수 있어요') : '해 보고 싶은 미션을 골라요';
  renderPieces($('mapPieces'), P.pieces);
  const map = $('map'); map.querySelectorAll('.node').forEach(n => n.remove()); const nx = nextIdx();
  MISSIONS.forEach((M, i) => { const b = document.createElement('button'); b.className = 'node'; const locked = playMode === 'adventure' && i > nx; if (locked) b.classList.add('locked'); if (playMode === 'adventure' && i === nx) b.classList.add('next');
    b.style.left = NODE_POS[i][0] + '%'; b.style.top = NODE_POS[i][1] + '%'; b.style.setProperty('--c', M.info.color);
    b.innerHTML = `<span class="orb">${ICONS[i]}</span><span class="no">${i + 1}</span>${P.pieces[i] ? '<span class="got">💎</span>' : ''}<b>${M.info.name}</b>`;
    b.onclick = () => { if (locked) { audio.boing(); ui.toast && $('mapTip').classList.add('shake'); $('mapTip').textContent = '앞 지역의 마법 조각을 먼저 모아요!'; return; } goMission(i); };
    map.appendChild(b); });
}
$('btnMapBack').onclick = () => enterTitle();

// ───────── 자세 보정
let calibNext = null;
function needCalib(){ return motion.mode === 'camera' && !calibrated; }
function goMission(i){ mIdx = i; if (needCalib()) enterCalib(() => startMission()); else startMission(); }
function enterCalib(next){ calibNext = next; show('scr-calib'); mountCam($('calibCam')); if (motion.mode !== 'camera') { calibDone(); return; }
  if (!motion.km) startInput(); motion.beginCalibration(); $('calibMsg').innerHTML = '가운데에 서서 차렷!<br>머리부터 손까지 보이게'; $('calibNum').textContent = '✋';
  $('calibTitle').textContent = playMode === 'group' ? `${groupName(G.cur)} ${G.stu}번 탐험대원, 카메라 앞에 서요!` : '탐험대원, 카메라 앞에 서요!'; say('카메라 앞 가운데에 서서 차렷 자세를 해요.'); }
function updateCalib(){ const p = motion.calibProgress(); $('ringFg').style.strokeDashoffset = 327 * (1 - p);
  $('calibMsg').innerHTML = !motion.km ? '카메라를 켜는 중…' : !motion.pose ? '카메라에 몸이 보이지 않아요<br>조금 뒤로 가 볼까요?' : p > 0 ? '좋아요! 그대로 가만히…' : '가운데에 서서 차렷!<br>머리부터 손까지 보이게'; }
function calibDone(){ calibrated = true; audio.success(); $('calibNum').textContent = '👍'; $('calibMsg').innerHTML = '준비 완료!'; $('calibState').textContent = '자세 보정 완료'; const n = calibNext; calibNext = null; setTimeout(() => { if (n) n(); }, 700); }
$('btnCalibSkip').onclick = () => { motion.calibrating = false; calibDone(); };
$('btnCalibBack').onclick = () => { motion.calibrating = false; calibNext = null; if (prevState === 'settings') enterSettings(); else if (playMode === 'group') enterGroup(); else enterMap(); };

// ───────── 미션
let mission = null, paused = false, away = { on: false, t: 0, back: 0 }, elapsed = 0, prevState = '';
const app = { world, motion, audio, ui, S, say: t => say(t), onMissionDone, ruleCard: (id, title, done) => ruleCard(id, title, done) };
function startMission(){
  if (mission) endMission();
  show('hud'); paused = false; away = { on: false, t: 0, back: 0 }; elapsed = 0; $('away').classList.add('hidden');
  const M = MISSIONS[mIdx]; $('mNo').textContent = M.info.no; $('mName').textContent = M.info.name; renderPieces($('hudPieces'), P.pieces, -1);
  ui.hint(null); ui.command(null); ui.timer(null); ui.trip(null); ui.hold(0); ui.ending(false);
  $('keyHelp').classList.toggle('hidden', motion.mode !== 'keyboard');
  const showCam = S.preview && motion.mode === 'camera'; $('camWrap').classList.toggle('hidden', !showCam); mountCam(showCam ? $('camWrap') : null); $('ruleCard').classList.add('hidden'); cardOpen = false;
  $('groupNow').classList.toggle('hidden', playMode !== 'group'); if (playMode === 'group') $('groupNow').textContent = `🏆 ${groupName(G.cur)} · ${G.stu}번 친구`;
  mission = new M(app, { short: playMode === 'group' }); mission.start();
  if (M.info.id !== 'mirror') ruleCard(M.info.id, `「${M.info.name}」 거꾸로 규칙`);
}
let lastHero = null;
function endMission(){ if (!mission) return; lastHero = mission.hero || null; try { mission.dispose(); } catch (e) {} mission = null; ui.ending(false); speechSynthesis && speechSynthesis.cancel(); }
function updateMission(dt){
  if (!mission || paused) return;
  const f = motion.f;
  if (motion.mode === 'camera') { if (!f.present) { away.t += dt; away.back = 0; if (away.t > 1.2 && !away.on) { away.on = true; $('away').classList.remove('hidden'); say('카메라 앞으로 돌아와요!'); } }
    else { away.back += dt; if (away.on && away.back > .8) { away.on = false; away.t = 0; $('away').classList.add('hidden'); } if (!away.on) away.t = 0; } }
  updateSense($('camSt'));
  if (away.on || cardOpen) return;
  mission.update(dt, f); elapsed += dt;
  if (S.limit > 0 && elapsed > S.limit && !mission.done) { ui.toast('시간이 다 됐어요!'); mission.timeUp(); }
}
function onMissionDone(m, res){
  const i = mIdx, M = MISSIONS[i], full = res.sub >= res.total;
  if (playMode !== 'group') { P.pieces[i] = true; saveP(); }
  let pts = 0; if (playMode === 'group') { const g = G.list[G.order[G.cur]]; g.rec[M.info.id] = (g.rec[M.info.id] || 0) + res.sub; g.subs = (g.subs || 0) + res.sub; if (full) g.comps = (g.comps || 0) + 1; g.turns = (g.turns || 0) + 1; pts = res.sub + (full ? 5 : 0) + 2; g.done = g.done || []; g.done[G.stu - 1] = true; saveG(); }
  setTimeout(() => showResult(i, res, pts), 300);
}
let thinkI = 0, thinkList = [];
function showResult(i, res, pts){
  const M = MISSIONS[i]; endMission(); show('scr-result'); mountCam(null); audio.piece();
  const full = res.sub >= res.total;
  $('resGem').style.filter = `drop-shadow(0 0 30px ${M.info.color})`; $('resTitle').textContent = i === 4 && playMode !== 'group' ? '거꾸로 나라를 구했어요!' : full ? '미션 성공!' : '잘했어요!';
  $('resSub').textContent = playMode === 'group' ? `${M.info.name} · 성공 ${res.sub}번` : `「${M.info.name}」의 마법 조각을 얻었어요`;
  renderPieces($('resPieces'), playMode === 'group' ? [false, false, false, false, false] : P.pieces, playMode === 'group' ? i : -1);
  thinkList = THINK[M.info.id]; thinkI = 0; $('thinkQ').textContent = thinkList[0]; setTimeout(() => say(($('resTitle').textContent) + ' 생각을 나눠 볼까요? ' + thinkList[0]), 600);
  $('groupPts').classList.toggle('hidden', playMode !== 'group'); if (playMode === 'group') $('groupPts').textContent = `${groupName(G.cur)} +${pts}점! (성공 ${res.sub} · ${full ? '완주 +5 · ' : ''}참여 +2)`;
  const B = $('resBtns'); B.innerHTML = '';
  const btn = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.onclick = fn; B.appendChild(b); };
  if (playMode === 'group') btn('모둠 보드로 ▶', 'big', () => enterGroup());
  else { if (playMode === 'adventure' && i < 4) btn('다음 지역으로 ▶', 'big', () => { mIdx = i + 1; startMission(); });
    btn('다시 하기', 'big ghost', () => { mIdx = i; startMission(); }); btn('지도로', 'big ghost', () => enterMap()); if (i === 4) btn('처음 화면', 'big ghost', () => enterTitle()); }
}
$('btnThinkNext').onclick = () => { thinkI = (thinkI + 1) % thinkList.length; $('thinkQ').textContent = thinkList[thinkI]; say(thinkList[thinkI]); };
// 일시 정지
function setPause(on){ if (state !== 'hud' || !mission) return; paused = on; $('pause').classList.toggle('hidden', !on); if (on) speechSynthesis && speechSynthesis.cancel(); }
$('btnPause').onclick = () => setPause(true); $('btnResume').onclick = () => setPause(false);
$('btnRestart').onclick = () => { setPause(false); startMission(); };
$('btnQuitMap').onclick = () => { setPause(false); playMode === 'group' ? enterGroup() : enterMap(); };
$('btnQuitHome').onclick = () => { setPause(false); enterTitle(); };
addEventListener('keydown', e => { if (e.key === 'Escape' || (e.key.toLowerCase() === 'p' && motion.mode !== 'keyboard')) { if (state === 'hud') setPause(!paused); } });

// ───────── 자유 체험
const FX = { vlr: false, vud: false, vrot: false, opp: false, size: false, move: false, grav: false, rand: false };
let freeHero = null, freeRand = null, freeRandT = 0, freeY = 0, freeX = 0;
function enterFree(){ if (mission) endMission(); show('scr-free'); mountCam(null); world.setTheme('title'); audio.play('title');
  world.setCam(new THREE.Vector3(-.9, 2.2, 6.8), new THREE.Vector3(-.9, 1.9, 0), { snap: true, sway: .4 });
  freeHero = new Hero(); freeHero.faceNow('front'); world.dyn.add(freeHero.root); freeY = 0; freeX = 0;
  $('freeKb').classList.toggle('hidden', motion.mode !== 'keyboard'); renderFx(); say('자유 체험이에요. 선생님이 마법을 골라 주세요!'); }
function renderFx(){ document.querySelectorAll('[data-fx]').forEach(b => b.classList.toggle('on', !!FX[b.dataset.fx])); const on = Object.keys(FX).filter(k => FX[k]);
  $('freeNow').textContent = on.length ? on.map(k => document.querySelector(`[data-fx=${k}]`).textContent).join(' · ') : '효과를 눌러 보세요'; }
document.querySelectorAll('[data-fx]').forEach(b => b.onclick = () => { const k = b.dataset.fx; FX[k] = !FX[k]; if (k === 'rand') { freeRand = FX.rand ? randomRules() : null; freeRandT = 0; if (FX.rand) announceRand(); } audio.magic();
  if (freeHero) world.burst(new THREE.Vector3(0, 1.3, 0), 0xff9fc8, 50, 4); renderFx(); });
$('btnFreeOff').onclick = () => { Object.keys(FX).forEach(k => FX[k] = false); freeRand = null; renderFx(); };
$('btnFreeBack').onclick = () => enterTitle();
function announceRand(){ const names = Object.keys(RULE_NAMES).filter(k => freeRand[k]).map(k => RULE_NAMES[k]).join(' + '); $('freeNow').textContent = '🎲 무작위 마법: ' + names; say('무작위 거꾸로 마법! ' + names); if (freeHero) { freeHero.spinOnce(); world.ring(new THREE.Vector3(0, 1.2, 0), 0xffd35a, 2); } }
function freeRules(){ if (FX.rand && freeRand) return freeRand; return { ...ALL_OFF, lr: FX.opp, arms: FX.opp, head: FX.opp, size: FX.size, move: FX.move, gravity: FX.grav }; }
function drawFreeCam(){ const cv = $('freeCam'), g = cv.getContext('2d'), v = $('v'); if (motion.mode !== 'camera' || !v.videoWidth) { g.fillStyle = '#0b0820'; g.fillRect(0, 0, cv.width, cv.height); return; }
  // 영상 자체 반전(표시만). 기본은 거울처럼. 몸 인식 좌표에는 영향 없음
  let sx = S.mirror ? -1 : 1, sy = 1; if (FX.vlr) sx *= -1; if (FX.vud) sy *= -1; if (FX.vrot) { sx *= -1; sy *= -1; }
  g.save(); g.translate(cv.width / 2, cv.height / 2); g.scale(sx, sy); g.drawImage(v, -cv.width / 2, -cv.height / 2, cv.width, cv.height); g.restore();
  $('freeLabel').textContent = '카메라 화면' + (FX.vlr ? ' · 좌우 반전' : '') + (FX.vud ? ' · 상하 반전' : '') + (FX.vrot ? ' · 180도' : ''); }
function updateFree(dt){ drawFreeCam(); const H = freeHero; if (!H) return; const f = motion.f;
  if (FX.rand) { freeRandT += dt; if (freeRandT > 8) { freeRandT = 0; freeRand = randomRules(freeRand); announceRand(); } }
  const R = freeRules(), c = transform(f, R);
  if (f.present) { H.setDrive({ sl: c.sl, sr: c.sr, tilt: c.tilt }); freeX = damp(freeX, clamp(c.x, -1.6, 1.6) * 1.2, 6, dt); H.setScale(1 + clamp(c.grow, -1, 1) * .4);
    freeY = damp(freeY, R.gravity ? clamp(c.lift, 0, 1) * 3 : 0, 5, dt); H.set(freeY > .25 ? 'float' : c.go ? 'walk' : 'idle'); }
  else { H.setDrive(null); H.set('idle'); }
  H.root.position.set(freeX, freeY + .02, 0); H.update(dt); }

// ───────── 모둠 대항전
const groupName = oi => { const g = G.list[G.order[oi]]; return g ? g.name : ''; };
function fixGroups(){ const n = clamp(S.groups | 0 || 7, 2, 10); while (G.list.length < n) G.list.push({ name: (G.list.length + 1) + '모둠', rec: {}, subs: 0, comps: 0, turns: 0, done: [] });
  G.list.length = n; G.order = (G.order || []).filter(i => i < n); for (let i = 0; i < n; i++) if (!G.order.includes(i)) G.order.push(i); if (G.cur >= n) G.cur = 0; G.stu = clamp(G.stu || 1, 1, 4); saveG(); }
const score = g => (g.subs || 0) + (g.comps || 0) * 5 + (g.turns || 0) * 2;
function enterGroup(){ if (mission) endMission(); prevState = 'group'; playMode = 'group'; fixGroups(); show('scr-group'); mountCam(null); if (world.themeName !== 'title') world.setTheme('title'); audio.play('title'); world.setCam(new THREE.Vector3(0, 7, 16), new THREE.Vector3(0, 5, -6), { follow: 1.5 }); renderGroup(); }
function renderGroup(){ fixGroups(); $('gCount').textContent = G.list.length + '모둠';
  const cg = G.list[G.order[G.cur]]; $('gNow').innerHTML = `지금 차례: <b style="color:var(--gold)">${cg.name}</b> <span class="stu">${[1, 2, 3, 4].map(k => `<i class="${k === G.stu ? 'on' : (cg.done || [])[k - 1] ? 'done' : ''}">${k}</i>`).join('')}</span>`;
  $('gBody').innerHTML = G.order.map((gi, oi) => { const g = G.list[gi]; return `<tr class="${oi === G.cur ? 'cur' : ''}"><td>${oi + 1}</td><td><input data-gi="${gi}" value="${g.name.replace(/"/g, '&quot;')}" maxlength="12"></td>${MISSIONS.map(M => `<td>${g.rec[M.info.id] || 0}</td>`).join('')}<td>${g.turns || 0}</td><td class="sc">${score(g)}</td>
    <td><button class="mv" data-up="${oi}">▲</button><button class="mv" data-down="${oi}">▼</button><button class="mv" data-pick="${oi}">👉</button></td></tr>`; }).join('');
  $('gBody').querySelectorAll('input').forEach(inp => inp.onchange = () => { G.list[+inp.dataset.gi].name = inp.value.trim() || G.list[+inp.dataset.gi].name; saveG(); renderGroup(); });
  $('gBody').querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [G.order[i - 1], G.order[i]] = [G.order[i], G.order[i - 1]]; if (G.cur === i) G.cur--; else if (G.cur === i - 1) G.cur++; saveG(); renderGroup(); } });
  $('gBody').querySelectorAll('[data-down]').forEach(b => b.onclick = () => { const i = +b.dataset.down; if (i < G.order.length - 1) { [G.order[i + 1], G.order[i]] = [G.order[i], G.order[i + 1]]; if (G.cur === i) G.cur++; else if (G.cur === i + 1) G.cur--; saveG(); renderGroup(); } });
  $('gBody').querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { G.cur = +b.dataset.pick; G.stu = 1; nextStudentReset(); saveG(); renderGroup(); });
  $('gMission').innerHTML = MISSIONS.map((M, i) => `<button data-v="${i}" class="${i === G.mission ? 'on' : ''}">${ICONS[i]} ${M.info.name.replace('거꾸로 ', '')}</button>`).join('');
  $('gMission').querySelectorAll('button').forEach(b => b.onclick = () => { G.mission = +b.dataset.v; saveG(); renderGroup(); }); }
function nextStudentReset(){ motion.resetStudent(); calibrated = false; }
$('btnGStart').onclick = () => { playMode = 'group'; goMission(G.mission || 0); };
$('btnNextStudent').onclick = () => { G.stu = G.stu >= 4 ? 1 : G.stu + 1; nextStudentReset(); saveG(); renderGroup(); say(`${groupName(G.cur)} ${G.stu}번 친구 차례예요!`); };
$('btnNextGroup').onclick = () => { G.cur = (G.cur + 1) % G.order.length; G.stu = 1; nextStudentReset(); saveG(); renderGroup(); say(`${groupName(G.cur)} 차례예요!`); };
let resetArm = 0; $('btnGReset').onclick = () => { if (Date.now() - resetArm > 3000) { resetArm = Date.now(); $('btnGReset').textContent = '한 번 더 누르면 초기화'; setTimeout(() => $('btnGReset').textContent = '전체 점수 초기화', 3000); return; }
  G.list.forEach(g => { g.rec = {}; g.subs = 0; g.comps = 0; g.turns = 0; g.done = []; }); G.cur = 0; G.stu = 1; saveG(); renderGroup(); $('btnGReset').textContent = '전체 점수 초기화'; };
$('btnGMinus').onclick = () => { S.groups = clamp(S.groups - 1, 2, 10); saveS(); renderGroup(); }; $('btnGPlus').onclick = () => { S.groups = clamp(S.groups + 1, 2, 10); saveS(); renderGroup(); };
$('btnGroupBack').onclick = () => enterTitle();

// ───────── 설정
function syncSeg(id, v){ document.querySelectorAll('#' + id + ' button').forEach(b => b.classList.toggle('on', b.dataset.v === String(v))); }
function bindSeg(id, key, conv, after){ document.querySelectorAll('#' + id + ' button').forEach(b => b.onclick = () => { S[key] = conv(b.dataset.v); saveS(); syncSeg(id, S[key]); after && after(); }); }
const bool = v => v === 'true';
function enterSettings(){ prevState = 'settings'; show('scr-settings'); mountCam(null); refreshSettings(); }
function refreshSettings(){ syncSeg('sDiff', S.diff); syncSeg('sInput', S.input); syncSeg('sMirror', S.mirror); syncSeg('sLimit', S.limit); syncSeg('sVoice', S.voice); syncSeg('sBgm', S.bgm); syncSeg('sPreview', S.preview); syncSeg('sQuality', S.quality);
  $('sSens').value = S.sens; $('sSensV').textContent = Math.round(S.sens * 100) + '%'; $('sFree').value = S.freeSec; $('sFreeV').textContent = S.freeSec + '초'; $('sGroups').value = S.groups; $('sGroupsV').textContent = S.groups + '모둠'; $('calibState').textContent = calibrated ? '자세 보정 완료' : '아직 안 함'; }
bindSeg('sDiff', 'diff', String); bindSeg('sMirror', 'mirror', bool); bindSeg('sLimit', 'limit', Number); bindSeg('sPreview', 'preview', bool);
bindSeg('sVoice', 'voice', bool, () => { audio.voiceOn = S.voice; if (S.voice) say('음성 안내를 켰어요'); else speechSynthesis && speechSynthesis.cancel(); });
bindSeg('sBgm', 'bgm', bool, () => { audio.ensure(); audio.setBgm(S.bgm); });
bindSeg('sInput', 'input', String, () => { calibrated = false; startInput(); });
bindSeg('sQuality', 'quality', String, () => { setTimeout(() => location.reload(), 200); });
$('sSens').oninput = () => { S.sens = +$('sSens').value; $('sSensV').textContent = Math.round(S.sens * 100) + '%'; saveS(); };
$('sFree').oninput = () => { S.freeSec = +$('sFree').value; $('sFreeV').textContent = S.freeSec + '초'; saveS(); };
$('sGroups').oninput = () => { S.groups = +$('sGroups').value; $('sGroupsV').textContent = S.groups + '모둠'; saveS(); };
$('btnCamRange').onclick = async () => { if (S.input !== 'camera') { S.input = 'camera'; saveS(); syncSeg('sInput', 'camera'); } if (!motion.km) await startInput(); if (motion.km) motion.km.openRangeUI(() => { calibrated = false; refreshSettings(); }); };
$('btnRecalib').onclick = () => { motion.resetStudent(); calibrated = false; if (S.input === 'keyboard') { calibrated = true; refreshSettings(); return; } prevState = 'settings'; enterCalib(() => enterSettings()); };
$('btnProgReset').onclick = () => { P.pieces = [false, false, false, false, false]; P.story = false; saveP(); $('btnProgReset').textContent = '지웠어요 ✓'; setTimeout(() => $('btnProgReset').textContent = '탐험 기록 지우기', 2000); };
$('btnSetClose').onclick = () => enterTitle();

// ───────── 시작 화면 버튼·전체 화면
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { audio.ensure(); const go = b.dataset.go; prevState = 'title';
  if (go === 'adventure') { playMode = 'adventure'; P.story ? enterMap('adventure') : enterStory(); }
  if (go === 'select') enterMap('select'); if (go === 'free') enterFree(); if (go === 'group') enterGroup(); if (go === 'settings') enterSettings(); });
document.querySelectorAll('#inputSeg button').forEach(b => b.onclick = () => { S.input = b.dataset.v; saveS(); syncSeg('inputSeg', S.input); calibrated = false; startInput().then(() => enterTitle()); });
const full = () => { const d = document; if (!d.fullscreenElement) d.documentElement.requestFullscreen && d.documentElement.requestFullscreen().catch(() => {}); else d.exitFullscreen && d.exitFullscreen(); };
['btnFull1', 'btnFull2', 'btnFull3'].forEach(id => $(id).onclick = full);
// 페이지를 떠나면 카메라 스트림·리소스 해제
addEventListener('pagehide', () => { motion.destroy(); audio.stopMusic(); });
document.querySelectorAll('a[href="../"]').forEach(a => a.addEventListener('click', () => motion.stop()));

// ───────── 루프
let last = performance.now();
function loop(now){ requestAnimationFrame(loop); const dt = Math.min(Q.has('test') ? .2 : .05, (now - last) / 1000); last = now;
  motion.update(dt);
  if (state === 'title') { updateTitle(dt); updateSense($('titleSt')); } else if (state === 'calib') updateCalib(); else if (state === 'hud') updateMission(dt); else if (state === 'free') updateFree(dt);
  else if (state === 'result') { if (lastHero && lastHero.root.parent) { lastHero.set('cheer'); lastHero.update(dt); } }
  else if (state === 'map' || state === 'group' || state === 'settings' || state === 'story') { if (titleHero && titleHero.root.parent) titleHero.update(dt); }
  world.update(dt);
  if (window.__kmTest) window.__kmTest.frame = (window.__kmTest.frame || 0) + 1;
}
// 시험용 손잡이(개발): window.__km
window.__km = { app, motion, world, S, P, G, get state(){ return state; }, get mission(){ return mission; }, goMission: i => { playMode = 'select'; goMission(i); }, enterFree, enterGroup, enterSettings, enterTitle, enterMap };

loadBar(.9);
enterTitle(); startInput();
requestAnimationFrame(loop);
setTimeout(() => { $('loading').style.opacity = 0; $('loading').style.transition = 'opacity .6s'; setTimeout(() => $('loading').classList.add('hidden'), 650); loadBar(1); }, 500);
