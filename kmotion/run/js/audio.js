// K-MOTION RUN · AudioManager — Web Audio 합성(저작권 없음). 사용자 조작(게임 시작) 뒤에만 켠다.
export class AudioManager {
  constructor(){ this.ac = null; this.master = null; this.muted = false; this.ambient = null; this.vol = .8; }
  ensure(){ if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ac = new AC(); this.master = this.ac.createGain(); this.master.gain.value = this.vol;
    const comp = this.ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; this.master.connect(comp).connect(this.ac.destination); }
  setMuted(m){ this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : this.vol, this.ac.currentTime, .05); }
  // 기본 톤
  tone(f, dur, { type = 'sine', g = .2, slide, delay = 0, attack = .005 } = {}){ if (!this.ac) return; const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), gn = this.ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(g, t + attack); gn.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(gn).connect(this.master); o.start(t); o.stop(t + dur + .05); }
  noise(dur, { g = .2, hp = 200, lp = 4000, delay = 0, q = 1 } = {}){ if (!this.ac) return; const t = this.ac.currentTime + delay, n = this.ac.sampleRate * dur | 0, buf = this.ac.createBuffer(1, n, this.ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ac.createBufferSource(); s.buffer = buf; const h = this.ac.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; const l = this.ac.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp; l.Q.value = q; const gn = this.ac.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(h).connect(l).connect(gn).connect(this.master); s.start(t); s.stop(t + dur + .02); }
  // 효과음
  step(){ this.noise(.07, { g: .07, hp: 120, lp: 900 }); }
  jump(){ this.tone(320, .22, { type: 'triangle', g: .14, slide: 720 }); this.noise(.08, { g: .05, hp: 800, lp: 3000 }); }
  land(){ this.noise(.12, { g: .12, hp: 80, lp: 600 }); this.tone(120, .1, { type: 'sine', g: .12, slide: 60 }); }
  slide(){ this.noise(.35, { g: .1, hp: 300, lp: 1800, q: 2 }); }
  lane(){ this.noise(.09, { g: .05, hp: 1200, lp: 5000 }); this.tone(600, .08, { type: 'sine', g: .05, slide: 900 }); }
  coin(){ this.tone(1318, .09, { type: 'square', g: .07 }); this.tone(1760, .18, { type: 'square', g: .07, delay: .07 }); }
  dodge(combo){ const base = 660 + Math.min(combo, 10) * 40; this.tone(base, .1, { type: 'triangle', g: .09 }); if (combo >= 3) this.tone(base * 1.5, .14, { type: 'triangle', g: .07, delay: .06 }); }
  combo(){ [0, .07, .14].forEach((d, i) => this.tone(880 * Math.pow(1.26, i), .14, { type: 'triangle', g: .1, delay: d })); }
  hit(){ this.noise(.25, { g: .3, hp: 60, lp: 500 }); this.tone(180, .3, { type: 'sawtooth', g: .14, slide: 70 }); }
  win(){ [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, .5, { type: 'triangle', g: .12, delay: i * .11 })); this.tone(1568, 1.2, { type: 'sine', g: .1, delay: .6 }); }
  lose(){ [392, 349, 311, 262].forEach((f, i) => this.tone(f, .45, { type: 'triangle', g: .12, delay: i * .22 })); }
  count(final){ this.tone(final ? 880 : 560, final ? .4 : .12, { type: 'square', g: .08 }); }
  // 숲 배경음: 바람(필터 노이즈 흔들림) + 새소리 무작위
  startAmbient(){ if (!this.ac || this.ambient) return; const t = this.ac.currentTime; const n = this.ac.sampleRate * 4 | 0, buf = this.ac.createBuffer(1, n, this.ac.sampleRate), d = buf.getChannelData(0); let v = 0; for (let i = 0; i < n; i++) { v = v * .98 + (Math.random() * 2 - 1) * .02; d[i] = v * 6; }
    const s = this.ac.createBufferSource(); s.buffer = buf; s.loop = true; const lp = this.ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; const lfo = this.ac.createOscillator(); lfo.frequency.value = .11; const lg = this.ac.createGain(); lg.gain.value = 260; lfo.connect(lg).connect(lp.frequency); lfo.start();
    const g = this.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.11, t + 2); s.connect(lp).connect(g).connect(this.master); s.start(); this.ambient = { s, g, lfo, birds: setInterval(() => this.bird(), 1800) }; }
  bird(){ if (!this.ac || this.muted || Math.random() < .35) return; const f = 1800 + Math.random() * 1400; for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) this.tone(f, .09, { type: 'sine', g: .025, slide: f * (1.15 + Math.random() * .3), delay: i * .13 }); }
  stopAmbient(){ if (!this.ambient) return; const a = this.ambient; a.g.gain.setTargetAtTime(0, this.ac.currentTime, .3); clearInterval(a.birds); setTimeout(() => { try { a.s.stop(); a.lfo.stop(); } catch (e) {} }, 1200); this.ambient = null; }
}
