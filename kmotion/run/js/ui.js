// K-MOTION RUN · UIManager
const $ = id => document.getElementById(id);
export class UIManager {
  constructor(){
    this.el = { start: $('scr-start'), calib: $('scr-calib'), hud: $('hud'), result: $('scr-result'), count: $('count'), time: $('hTime'), score: $('hScore'), life: $('hLife'), act: $('hAct'), combo: $('hCombo'), pops: $('pops'), flash: $('flash'), pause: $('pause'), pauseTitle: $('pauseTitle'), pauseMsg: $('pauseMsg'), cam: $('camBox'), camSt: $('camSt'), dev: $('dev'), loading: $('loading'), loadBar: $('loadBar'), loadTxt: $('loadTxt'), howto: $('howto'), calibView: $('calibView'), ringFg: $('ringFg'), calibNum: $('calibNum'), calibMsg: $('calibMsg') };
    this.mode = localStorage.getItem('kmrun.mode') || 'camera'; this.diff = localStorage.getItem('kmrun.diff') || 'normal';
    this.seg('modeSeg', v => { this.mode = v; localStorage.setItem('kmrun.mode', v); this.renderHowto(); }, this.mode);
    this.seg('diffSeg', v => { this.diff = v; localStorage.setItem('kmrun.diff', v); }, this.diff);
    this.renderHowto(); this.lastScore = -1; this.lastTime = -1; this.lastLife = -1;
  }
  seg(id, fn, init){ const box = $(id); box.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === init); b.onclick = () => { box.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); fn(b.dataset.v); }; }); }
  renderHowto(){ this.el.howto.innerHTML = this.mode === 'camera'
    ? '<span>↔ 몸을 옆으로 옮기면 <b>차선 이동</b></span><span>👐 양손 들기 = <b>점프</b></span><span>🦵 무릎 살짝 굽히기 = <b>슬라이드</b></span><span>🪨 바위는 피하고 🪵 통나무는 뛰어넘고 🌿 나뭇가지는 숙여요</span>'
    : '<span><kbd>←</kbd><kbd>→</kbd> 차선 이동</span><span><kbd>↑</kbd>/<kbd>Space</kbd> 점프</span><span><kbd>↓</kbd> 슬라이드</span><span><kbd>ESC</kbd> 일시 정지</span>'; }
  show(name){ for (const k of ['start', 'calib', 'result']) this.el[k].classList.toggle('hidden', k !== name); this.el.hud.classList.toggle('hidden', name !== 'hud'); }
  loading(p, txt){ this.el.loadBar.style.width = (p * 100) + '%'; if (txt) this.el.loadTxt.textContent = txt; if (p >= 1) setTimeout(() => this.el.loading.classList.add('off'), 250); }
  hud(g){ const t = Math.ceil(g.timeLeft); if (t !== this.lastTime) { this.lastTime = t; this.el.time.textContent = t; this.el.time.parentElement.classList.toggle('warn', t <= 10 && g.state === 'play'); }
    if (g.score.score !== this.lastScore) { this.lastScore = g.score.score; this.el.score.textContent = g.score.score.toLocaleString(); }
    if (g.life !== this.lastLife) { this.lastLife = g.life; this.el.life.innerHTML = '❤'.repeat(Math.max(0, g.life)) + '<span style="opacity:.22">' + '❤'.repeat(Math.max(0, 3 - g.life)) + '</span>'; } }
  act(text, hot){ this.el.act.textContent = text; this.el.act.classList.toggle('hot', !!hot); }
  combo(n){ this.el.combo.textContent = n >= 2 ? `COMBO ×${n}` : ''; if (n >= 2) { this.el.combo.classList.remove('bump'); void this.el.combo.offsetWidth; this.el.combo.classList.add('bump'); } }
  pop(text, cls = ''){ const d = document.createElement('div'); d.className = 'pop ' + cls; d.textContent = text; this.el.pops.appendChild(d); setTimeout(() => d.remove(), 1000); }
  flash(){ this.el.flash.classList.add('on'); setTimeout(() => this.el.flash.classList.remove('on'), 80); }
  count(n){ const c = this.el.count; c.classList.remove('hidden'); c.textContent = n; c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; if (n === 'GO!') setTimeout(() => c.classList.add('hidden'), 900); }
  pauseView(on, reason){ this.el.pause.classList.toggle('hidden', !on); if (!on) return; const lost = reason === 'lost'; this.el.pauseTitle.textContent = lost ? '친구가 안 보여요' : '일시 정지'; this.el.pauseMsg.textContent = lost ? '카메라 앞 가운데로 다시 서면 이어서 달려요' : 'ESC 또는 계속하기를 누르면 이어서 해요'; }
  camStatus(kind, text){ this.el.cam.classList.toggle('ok', kind === 'ok'); this.el.cam.classList.toggle('bad', kind !== 'ok'); this.el.camSt.textContent = text; }
  camVisible(v){ this.el.cam.classList.toggle('off', !v); }
  calib(p, visible){ this.el.ringFg.style.strokeDashoffset = 327 * (1 - p); this.el.calibNum.textContent = Math.max(1, Math.ceil(3 - p * 3)); this.el.calibMsg.textContent = visible ? (p < .99 ? '좋아요! 그대로 서 있어요' : '준비 완료!') : '머리와 어깨, 양손이 보이게 서요'; this.el.calibView.parentElement.classList.toggle('ok', visible); }
  result(r, best){ this.show('result'); const h = document.getElementById('resTitle'); h.textContent = r.win ? '🏁 스테이지 성공!' : '💥 다시 도전!'; h.classList.toggle('fail', !r.win);
    $('rScore').textContent = r.score.toLocaleString(); $('rTime').textContent = r.time.toFixed(1) + '초'; $('rDodge').textContent = r.dodges; $('rCombo').textContent = r.maxCombo; $('rCoin').textContent = r.coins; $('rBest').textContent = best.toLocaleString() + (r.score >= best && r.score > 0 ? ' 🆕' : ''); }
  dev(txt){ this.el.dev.textContent = txt; }
}
