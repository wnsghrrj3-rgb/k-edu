// K-MOTION POSE HERO · UIManager — DOM 만 다룬다
import { MODES } from './game.js';
import { POSES } from './poses.js';
const $ = id => document.getElementById(id);
export class UIManager {
  constructor(){ this.el = {}; for (const id of ['scr-start', 'scr-calib', 'hud', 'scr-result', 'modes', 'camStart', 'calibView', 'ringFg', 'calibNum', 'calibMsg', 'calibTitle', 'hScore', 'hCombo', 'hTime', 'timeLbl', 'timeWrap', 'levelWrap', 'hLevel', 'lifeWrap', 'hLife', 'bossBar', 'bossHpFill', 'poseCard', 'pcEmoji', 'pcName', 'pcHint', 'pcN', 'memSlots', 'rhythm', 'beatFill', 'beatLbl', 'bpmLbl', 'camBox', 'camSt', 'simFill', 'simPct', 'holdFg', 'holdLbl', 'judge', 'count', 'pops', 'flash', 'banner', 'pause', 'pauseTitle', 'pauseMsg', 'dev', 'rRank', 'rTitle', 'rScore', 'rHits', 'rCombo', 'rAvg', 'rBest', 'rGrades', 'rNote', 'volM', 'volS', 'testWrap', 'testMode']) this.el[id] = $(id);
    this.mode = localStorage.getItem('kmph.mode') || 'speed'; this.diff = localStorage.getItem('kmph.diff') || 'normal';
    const M = this.el.modes; for (const [id, m] of Object.entries(MODES)) { const b = document.createElement('button'); b.className = 'mode' + (id === this.mode ? ' on' : ''); b.style.setProperty('--mc', m.color); b.dataset.id = id; b.innerHTML = `<div class="ic">${m.icon}</div><b>${m.title}</b><span>${m.ko}</span><p>${m.desc}</p><small></small>`; b.onclick = () => { this.mode = id; localStorage.setItem('kmph.mode', id); M.querySelectorAll('.mode').forEach(x => x.classList.toggle('on', x === b)); }; M.appendChild(b); }
    this.refreshBest();
    document.querySelectorAll('#diffSeg button').forEach(b => { b.classList.toggle('on', b.dataset.v === this.diff); b.onclick = () => { this.diff = b.dataset.v; localStorage.setItem('kmph.diff', this.diff); document.querySelectorAll('#diffSeg button').forEach(x => x.classList.toggle('on', x === b)); this.refreshBest(); }; });
    this.el.poseCard.classList.add('hidden'); this.judgeTimer = 0; }
  best(mode, diff){ return +(localStorage.getItem(`kmph.best.${mode}.${diff}`) || 0); }
  saveBest(mode, diff, score){ const b = Math.max(this.best(mode, diff), score); localStorage.setItem(`kmph.best.${mode}.${diff}`, b); const r = JSON.parse(localStorage.getItem('kmph.recent') || '[]'); r.unshift({ mode, diff, score, at: Date.now() }); localStorage.setItem('kmph.recent', JSON.stringify(r.slice(0, 20))); this.refreshBest(); return b; }
  refreshBest(){ this.el.modes.querySelectorAll('.mode').forEach(b => { const v = this.best(b.dataset.id, this.diff); b.querySelector('small').textContent = v ? `최고 ${v.toLocaleString()}점` : '아직 기록 없음'; }); }
  show(name){ for (const k of ['scr-start', 'scr-calib', 'hud', 'scr-result']) this.el[k].classList.toggle('hidden', k !== name); }
  camStart(kind, text){ const e = this.el.camStart; e.className = 'camst ' + kind; e.querySelector('span').textContent = '카메라: ' + text; }
  calib(p, ok, msg){ this.el.ringFg.style.strokeDashoffset = 327 * (1 - p); this.el.calibNum.textContent = Math.max(1, Math.ceil(3 - p * 3)); if (msg) this.el.calibMsg.textContent = msg; this.el.calibView.parentElement.classList.toggle('ok', !!ok); }
  camStatus(kind, text){ this.el.camBox.className = 'cam ' + kind; this.el.camSt.textContent = text; }
  // HUD
  setup(mode){ const e = this.el; e.timeWrap.classList.toggle('hidden', !(mode === 'speed')); e.levelWrap.classList.toggle('hidden', mode !== 'mirror'); e.lifeWrap.classList.toggle('hidden', mode !== 'boss'); e.bossBar.classList.toggle('hidden', mode !== 'boss'); e.poseCard.classList.toggle('boss-on', mode === 'boss'); e.memSlots.classList.toggle('hidden', mode !== 'memory'); e.rhythm.classList.toggle('hidden', mode !== 'rhythm'); e.poseCard.classList.remove('hidden', 'hide-pose'); e.pcN.textContent = ''; this.hud(0, 0); this.meter(0, 0, [], {}); this.judge(''); e.bossHpFill.style.width = '100%'; e.hLife.textContent = '❤❤❤'; e.hLevel.textContent = '1'; e.banner.classList.add('hidden'); }
  hud(score, combo){ this.el.hScore.textContent = score.toLocaleString(); this.el.hCombo.textContent = combo; this.el.hCombo.parentElement.classList.toggle('hot', combo >= 5); }
  time(ms){ this.el.hTime.textContent = Math.max(0, Math.ceil(ms / 1000)); }
  level(n){ this.el.hLevel.textContent = n; if (n > 1) this.pop(`LEVEL ${n}`, 'violet small'); }
  life(n){ this.el.hLife.textContent = '❤'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, 3 - n)); }
  pose(p, n, { hide = false, label = '' } = {}){ const e = this.el; e.pcEmoji.textContent = p.emoji; e.pcName.textContent = p.name; e.pcHint.textContent = p.hint; e.pcN.textContent = label; e.poseCard.classList.toggle('hide-pose', hide); e.poseCard.classList.remove('pop'); void e.poseCard.offsetWidth; e.poseCard.classList.add('pop'); }
  poseText(name, hint, emoji = '🎯'){ const e = this.el; e.pcEmoji.textContent = emoji; e.pcName.textContent = name; e.pcHint.textContent = hint; e.poseCard.classList.remove('hide-pose'); }
  meter(sim, prog, missing, detail){ const e = this.el, pct = Math.round(Math.max(0, sim) * 100); e.simFill.style.width = pct + '%'; e.simPct.textContent = pct + '%'; e.holdFg.style.strokeDashoffset = 214 * (1 - prog); e.holdLbl.textContent = prog > 0 ? Math.round(prog * 100) + '%' : '유지';
    if (missing && missing.length && !this.judgeTimer) { e.judge.className = 'judge hint'; e.judge.textContent = missing.includes('body') ? '몸이 안 보여요' : '양팔이 보이게 해요'; } else if (!this.judgeTimer && e.judge.classList.contains('hint')) { e.judge.textContent = ''; } }
  judge(text, cls = ''){ const e = this.el; e.judge.className = 'judge ' + cls; e.judge.textContent = text; clearTimeout(this.judgeTimer); this.judgeTimer = text ? setTimeout(() => { this.judgeTimer = 0; e.judge.textContent = ''; }, 1100) : 0; }
  pop(text, cls = 'gold'){ const d = document.createElement('div'); d.className = 'pop ' + cls; d.textContent = text; this.el.pops.appendChild(d); setTimeout(() => d.remove(), 1000); }
  flash(cls = 'on'){ const f = this.el.flash; f.className = 'flash ' + cls; setTimeout(() => f.className = 'flash', 60); }
  count(n){ const c = this.el.count; c.textContent = n; c.classList.remove('hidden'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; clearTimeout(this.countT); this.countT = setTimeout(() => c.classList.add('hidden'), 900); }
  banner(big, small, ms = 1500){ const b = this.el.banner; b.innerHTML = `<b>${big}</b>${small ? `<span>${small}</span>` : ''}`; b.classList.remove('hidden'); clearTimeout(this.bannerT); if (ms) this.bannerT = setTimeout(() => b.classList.add('hidden'), ms); }
  memSlots(n){ this.el.memSlots.innerHTML = Array.from({ length: n }, () => '<i>?</i>').join(''); }
  memSlotState(i, cls, emoji){ const s = this.el.memSlots.children; for (let k = 0; k < s.length; k++) { if (k === i) { s[k].className = cls; if (emoji) s[k].textContent = emoji; } else if (cls === 'cur') { s[k].className = k < i ? 'done' : ''; if (k >= i) s[k].textContent = '?'; } } }
  rhythm(bpm){ this.el.bpmLbl.textContent = bpm + ' BPM'; }
  beat(){ const r = this.el.beatFill.parentElement; r.classList.remove('hit'); void r.offsetWidth; r.classList.add('hit'); }
  rhythmRing(u){ this.el.beatFill.style.transform = `scale(${u})`; this.el.beatFill.style.opacity = .3 + u * .7; }
  pauseView(on, reason){ this.el.pause.classList.toggle('hidden', !on); if (on) { this.el.pauseTitle.textContent = reason === 'lost' ? '카메라에 사람이 안 보여요' : '일시 정지'; this.el.pauseMsg.textContent = reason === 'lost' ? '화면 안으로 들어오면 자동으로 이어서 해요' : 'ESC 또는 계속하기를 누르면 이어서 해요'; } }
  camVisible(on){ this.el.camBox.classList.toggle('hidden', !on); }
  dev(t){ this.el.dev.textContent = t; }
  result(r, best){ const e = this.el; this.show('scr-result'); e.rRank.textContent = r.rank; e.rRank.className = 'rank ' + r.rank; e.rTitle.textContent = (r.win ? '' : 'GAME OVER · ') + MODES[r.mode].title; e.rScore.textContent = r.score.toLocaleString(); e.rHits.textContent = `${r.hits} / ${r.tries}`; e.rCombo.textContent = r.maxCombo; e.rAvg.textContent = Math.round(r.avg * 100) + '%'; e.rBest.textContent = best.toLocaleString() + (r.score >= best && r.score > 0 ? ' 🏆' : '');
    e.rGrades.innerHTML = ['PERFECT', 'GREAT', 'GOOD', 'MISS'].map(g => `<span class="${g}">${g} ${r.grades[g]}</span>`).join('');
    let note = ''; if (r.mode === 'memory' && r.extra) note = r.win ? '4라운드 모두 기억했어요!' : `${r.extra.round}라운드에서 멈췄어요`; if (r.mode === 'boss' && r.extra) note = r.win ? 'SHADOW KING 을 물리쳤어요!' : `보스 체력 ${r.extra.bossHp} 남음`; if (r.mode === 'rhythm' && r.extra && r.extra.timing.length) { const t = r.extra.timing; const avg = t.reduce((a, b) => a + b, 0) / t.length * 1000; note = `평균 타이밍 ${avg >= 0 ? '+' : ''}${Math.round(avg)}ms (${avg > 60 ? '조금 늦어요' : avg < -60 ? '조금 빨라요' : '딱 맞아요'})`; }
    if (r.forced) note += (note ? ' · ' : '') + '⚠ 테스트 모드 결과(동작인식 아님)'; e.rNote.textContent = note; e.rNote.classList.toggle('hidden', !note); }
}
