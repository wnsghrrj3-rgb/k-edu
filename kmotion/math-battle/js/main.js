// K-MOTION MATH BATTLE · 진입점(UIManager 포함)
import { BattleEngine, MONSTERS } from './battle.js';
import { GameStateManager } from './game.js';
import { InputManager, MouseSelector, GestureSelector } from './select.js';
import { AudioManager } from './audio.js';

const $ = id => document.getElementById(id), qs = new URLSearchParams(location.search), DEV = qs.has('dev');
const quality = qs.get('q') || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 'low' : 'high');
const S = { mode: localStorage.getItem('kmmb.mode') || 'adventure', type: localStorage.getItem('kmmb.type') || 'mix', diff: localStorage.getItem('kmmb.diff') || 'normal', limit: +(localStorage.getItem('kmmb.limit') || 0), input: localStorage.getItem('kmmb.input') || 'camera', teams: +(localStorage.getItem('kmmb.teams') || 4) };
const orbEls = [...document.querySelectorAll('#orbs .orb')];
const battle = new BattleEngine($('gl'), quality); const audio = new AudioManager(); const input = new InputManager(); new MouseSelector(input, orbEls);
let gesture = null, gestureReady = false, calibrating = false, hovered = -1, pendingTimer = null;

// ───────── 설정 UI
function seg(id, key, cb){ const box = $(id); box.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === String(S[key])); b.onclick = () => { box.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); S[key] = isNaN(+b.dataset.v) ? b.dataset.v : +b.dataset.v; localStorage.setItem('kmmb.' + key, S[key]); cb && cb(); }; }); }
seg('modeSeg', 'mode', refreshStart); seg('diffSeg', 'diff'); seg('limitSeg', 'limit'); seg('inputSeg', 'input'); seg('teamSeg', 'teams', renderTeams);
$('qtype').value = S.type; $('qtype').onchange = e => { S.type = e.target.value; localStorage.setItem('kmmb.type', S.type); refreshStart(); };
function renderTeams(){ const box = $('teamNames'); const saved = JSON.parse(localStorage.getItem('kmmb.teamNames') || '[]'); box.innerHTML = ''; for (let i = 0; i < S.teams; i++) { const inp = document.createElement('input'); inp.value = saved[i] || `${i + 1}모둠`; inp.maxLength = 8; inp.onchange = () => localStorage.setItem('kmmb.teamNames', JSON.stringify([...box.querySelectorAll('input')].map(x => x.value))); box.appendChild(inp); } }
function refreshStart(){ const cls = S.mode === 'class'; document.querySelectorAll('.class-only').forEach(e => e.classList.toggle('hidden', !cls)); $('rowLimit').classList.toggle('hidden', S.mode !== 'adventure'); if (cls) renderTeams(); const best = +(localStorage.getItem(bestKey()) || 0); $('bestLine').textContent = best ? `최고 기록 ${best.toLocaleString()}점 · 최근 정답률 ${localStorage.getItem('kmmb.lastRate') || '-'}%` : ''; }
function bestKey(){ return `kmmb.best.${S.mode}.${S.type}.${S.diff}`; }
refreshStart();
$('btnSound').onclick = () => $('soundBox').classList.toggle('hidden'); $('volM').value = audio.volM * 100; $('volS').value = audio.volS * 100;
const volChange = () => { audio.ensure(); audio.setVol($('volM').value / 100, $('volS').value / 100); audio.hover(); }; $('volM').oninput = volChange; $('volS').oninput = volChange;

// ───────── 화면
const ui = {
  show(name){ for (const k of ['start', 'calib', 'result']) $('scr-' + k).classList.toggle('hidden', k !== name); $('hud').classList.toggle('hidden', name !== 'hud'); },
  pop(text, cls = ''){ const d = document.createElement('div'); d.className = 'pop ' + cls; d.textContent = text; $('pops').appendChild(d); setTimeout(() => d.remove(), 1000); },
  banner(text, sub, boss){ const b = $('banner'); b.innerHTML = `${text}${sub ? `<small>${sub}</small>` : ''}`; b.classList.toggle('boss', !!boss); b.classList.remove('hidden'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; clearTimeout(b._t); b._t = setTimeout(() => b.classList.add('hidden'), 1500); },
  flash(){ $('flash').classList.add('on'); setTimeout(() => $('flash').classList.remove('on'), 80); },
  life(n){ $('hLife').innerHTML = '💚'.repeat(n) + '<span style="opacity:.25">💚</span>'.repeat(3 - n); },
  orbs(vals){ orbEls.forEach((el, i) => { el.className = 'orb'; el.querySelector('b').textContent = vals[i]; el.querySelector('.ring').style.strokeDashoffset = 289; }); $('orbs').classList.remove('locked'); },
  hover(slot, p){ orbEls.forEach((el, i) => { el.classList.toggle('hover', i === slot); el.querySelector('.ring').style.strokeDashoffset = i === slot ? 289 * (1 - p) : 289; }); },
  camStatus(kind, text){ $('camBox').classList.toggle('ok', kind === 'ok'); $('camBox').classList.toggle('bad', kind !== 'ok'); $('camSt').textContent = text; },
  pause(on, title, msg){ $('pause').classList.toggle('hidden', !on); if (on) { $('pauseTitle').textContent = title; $('pauseMsg').textContent = msg || ''; } },
};
ui.show('start'); $('loading').classList.add('off'); if (DEV) $('dev').classList.remove('hidden');

// ───────── 게임 상태 ↔ 연출
const game = new GameStateManager({
  monsterNext(def, idx){ const m = MONSTERS[def.key]; $('hMon').textContent = m.icon + ' ' + m.name; $('hMonHp').style.width = '100%'; $('hMonHp').style.background = m.hpColor; battle.spawn(def.key);
    if (m.boss) { audio.boss(); ui.banner('BOSS', m.name, true); } else ui.banner(m.name, S.mode === 'adventure' ? `${idx + 1}번째 몬스터` : '');
    $('orbs').classList.add('locked'); setTimeout(() => game.ask(), m.boss ? 1900 : 1300); },
  question(q, info){ $('hQ').textContent = q.text; ui.orbs(q.choices.values); $('hProg').textContent = info.total ? `${info.index} / ${info.total}` : `${info.index}`; input.lock(false); if (gesture) gesture.active = true; },
  result(r){ input.lock(true); $('orbs').classList.add('locked'); orbEls.forEach((el, i) => el.classList.toggle('dim', i !== r.slot));
    audio.cast(); battle.cast(r.ok, r.slot, () => {
      if (r.ok) { audio.hit(); battle.hit(); $('hMonHp').style.width = (game.monHp / game.monMax * 100) + '%'; orbEls[r.slot].classList.add('ok'); ui.pop(r.bonus ? `+${100 + r.bonus}` : '+100', 'mint'); if (r.combo >= 2) { $('hCombo').textContent = r.combo; if (r.combo % 3 === 0) { ui.pop(`COMBO ×${r.combo}`, 'gold'); audio.combo(r.combo); } } else $('hCombo').textContent = r.combo; $('hScore').textContent = game.score.score.toLocaleString(); }
      else { audio.ng(); orbEls[r.slot].classList.add('ng'); orbEls[r.q.choices.correct].classList.remove('dim'); orbEls[r.q.choices.correct].classList.add('ok'); $('hQ').textContent = r.q.text.replace('?', String(r.q.ans)); $('hQ').classList.add('shake'); setTimeout(() => $('hQ').classList.remove('shake'), 400); $('hCombo').textContent = 0; battle.attack(); setTimeout(() => { audio.attack(); ui.flash(); }, 380); }
      setTimeout(() => game.proceed(r), r.ok ? 900 : 1500); }); },
  monsterDown(){ audio.die(); battle.die(); ui.pop('몬스터 처치!', 'gold'); setTimeout(() => game.afterMonsterDown(), 1300); },
  life(n){ ui.life(n); },
  timer(sec){ const el = $('hTime'); el.textContent = Math.ceil(sec); el.parentElement.classList.toggle('warn', sec <= 5); },
  retry(){ audio.lose(); ui.pause(true, '체력이 다 떨어졌어요', '같은 몬스터부터 다시 도전해요'); $('btnResume').textContent = '재도전'; },
  turn(team, idx){ $('hTeam').textContent = team.name; $('hScore').textContent = 0; $('hCombo').textContent = 0; $('hTime').textContent = 30; battle.despawn(); ui.pause(true, `${team.name} 차례`, idx === 0 ? '준비되면 시작을 눌러요 (30초)' : '다음 모둠 친구가 카메라 앞에 서요 (30초)'); $('btnResume').textContent = '시작'; },
  end(sum){ audio.stopMusic(); if (sum.win) audio.win(); else audio.lose(); if (gesture) gesture.active = false; input.lock(true);
    const key = bestKey(); const best = Math.max(+(localStorage.getItem(key) || 0), sum.score); localStorage.setItem(key, best); localStorage.setItem('kmmb.lastRate', sum.rate); localStorage.setItem('kmmb.last', JSON.stringify({ at: Date.now(), mode: sum.mode, type: S.type, score: sum.score, rate: sum.rate }));
    setTimeout(() => { ui.show('result'); const h = $('resTitle'); h.textContent = sum.mode === 'class' ? '🏆 모둠 배틀 결과' : sum.win ? '🏆 승리!' : '다시 도전!'; h.classList.toggle('fail', !sum.win && sum.mode !== 'class');
      $('rScore').textContent = sum.score.toLocaleString(); $('rOk').textContent = sum.ok; $('rNg').textContent = sum.ng; $('rRate').textContent = sum.rate + '%'; $('rCombo').textContent = sum.maxCombo; $('rBest').textContent = best.toLocaleString() + (sum.score >= best && sum.score > 0 ? ' 🆕' : '');
      const rk = $('rank'); rk.classList.toggle('hidden', !sum.teams); if (sum.teams) rk.innerHTML = sum.teams.map((t, i) => `<div><span>${['🥇', '🥈', '🥉'][i] || (i + 1) + '위'} ${t.name}</span><span>${t.score.toLocaleString()}점 · ${t.ok}문제</span></div>`).join('');
      $('wrongs').innerHTML = sum.wrongs.length ? '<span style="background:none;border:0;font-family:inherit;color:#b3a9d6">틀린 문제</span>' + sum.wrongs.map(w => `<span>${w.text}</span>`).join('') : ''; }, 1400); },
});

// ───────── 입력 이벤트
input.on('hover', e => { if (e.slot !== hovered) { hovered = e.slot; if (e.slot >= 0) audio.hover(); } ui.hover(e.slot, e.progress || 0); });
input.on('select', e => { if (game.state === 'play') game.answer(e.slot); });
input.on('lost', () => ui.camStatus('lost', '손이 안 보여요')); input.on('found', () => ui.camStatus('ok', '손 인식 중'));

// ───────── 흐름
async function startFlow(){
  audio.ensure(); audio.startMusic(); const teams = [...document.querySelectorAll('#teamNames input')].map(x => x.value.trim() || '모둠'); $('camBox').classList.toggle('off', S.input !== 'camera');
  if (S.input === 'camera') { ui.show('calib'); calibrating = true; $('calibMsg').textContent = '카메라를 켜는 중…'; document.querySelectorAll('.corb').forEach(c => c.className = 'corb');
    try { if (!gesture) gesture = new GestureSelector(input, { video: $('v'), canvas: $('c'), orbEls, cursorEl: $('cursor'), onStatus: s => ui.camStatus(s.kind === 'error' ? 'bad' : s.kind, s.text), onDebug: d => DEV && ($('dev').textContent = `fps ${d.fps} hands ${d.hands} pose ${d.pose} nx ${d.nx} ny ${d.ny} state ${game.state} draw ${battle.renderer.info.render.calls}`) });
      if (!gesture.started) await gesture.start(); gestureReady = true; copyCalib(true); $('calibMsg').textContent = '카메라에 손바닥을 보여 주세요. 빛나는 구슬 3개를 차례로 만져요.';
      const targets = [...document.querySelectorAll('.corb')]; await gesture.calibrate(targets, (i, p) => { targets.forEach((t, k) => { t.classList.toggle('done', k < i); t.classList.toggle('hot', k === i && p > 0); }); if (p >= 1 && i < 3) audio.tick(); });
      if (!calibrating) return; copyCalib(false); audio.ok(); await new Promise(r => setTimeout(r, 500)); }
    catch (e) { $('calibMsg').textContent = '카메라를 쓸 수 없어요: ' + (e.message || e) + ' → 마우스 모드로 시작해요'; await new Promise(r => setTimeout(r, 2200)); if (!calibrating) return; S.input = 'mouse'; $('camBox').classList.add('off'); $('cursor').classList.add('hidden'); }
    calibrating = false; }
  ui.show('hud'); ui.life(3); $('hScore').textContent = 0; $('hCombo').textContent = 0; $('hTimeLbl').textContent = S.mode === 'adventure' ? (S.limit ? '문제 시간' : '시간') : '남은 시간'; $('hTime').textContent = S.mode === 'time' ? 60 : S.mode === 'class' ? 30 : (S.limit || '∞'); $('hProg').textContent = ''; $('hQ').textContent = '준비!'; orbEls.forEach(el => { el.className = 'orb'; el.querySelector('b').textContent = '?'; }); $('orbs').classList.add('locked'); ui.pause(false);
  game.start({ mode: S.mode, type: S.type, diff: S.diff, limit: S.limit, teams });
}
let calibRaf = null; function copyCalib(on){ if (calibRaf) { cancelAnimationFrame(calibRaf); calibRaf = null; } if (!on) return; const src = $('c'), dst = $('calibView'); dst.width = src.width; dst.height = src.height; const ctx = dst.getContext('2d'); const loop = () => { ctx.drawImage(src, 0, 0); calibRaf = requestAnimationFrame(loop); }; loop(); }
function toStart(){ calibrating = false; copyCalib(false); game.state = 'idle'; battle.despawn(); if (gesture) gesture.active = false; $('cursor').classList.add('hidden'); ui.pause(false); audio.stopMusic(); ui.show('start'); refreshStart(); }
$('btnStart').onclick = startFlow; $('btnCalibCancel').onclick = toStart; $('btnHome').onclick = toStart;
$('btnRetry').onclick = () => { if (S.input === 'camera' && gestureReady) { audio.ensure(); audio.startMusic(); ui.show('hud'); ui.life(3); $('hScore').textContent = 0; $('hCombo').textContent = 0; $('orbs').classList.add('locked'); const teams = [...document.querySelectorAll('#teamNames input')].map(x => x.value.trim() || '모둠'); game.start({ mode: S.mode, type: S.type, diff: S.diff, limit: S.limit, teams }); } else startFlow(); };
$('btnResume').onclick = () => { ui.pause(false); if (game.state === 'dead') game.retry(); else if (game.state === 'turn') game.beginTurn(); else if (game.state === 'paused') { game.state = 'play'; } $('btnResume').textContent = '계속하기'; };
$('btnQuit').onclick = toStart;
addEventListener('keydown', e => { if (e.key === 'Escape' && game.state === 'play') { game.state = 'paused'; ui.pause(true, '일시 정지', 'ESC 또는 계속하기'); } else if (e.key === 'Escape' && game.state === 'paused') { game.state = 'play'; ui.pause(false); }
  if (['1', '2', '3'].includes(e.key) && !input.locked) input.emit('select', { slot: +e.key - 1, via: 'key' }); if (e.key === 'Enter' && !$('scr-start').classList.contains('hidden') && document.activeElement.tagName !== 'INPUT') startFlow(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') { game.state = 'paused'; ui.pause(true, '일시 정지', ''); } });

// ───────── 루프
let last = performance.now();
function loop(now){ const dt = Math.min(.05, (now - last) / 1000); last = now; game.tick(dt); battle.update(dt); battle.render(); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
