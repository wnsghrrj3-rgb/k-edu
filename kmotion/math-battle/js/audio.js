// K-MOTION MATH BATTLE · AudioManager — 합성(저작권 0). 음악·효과음 볼륨 분리. 사용자 조작 뒤 ensure().
export class AudioManager {
  constructor(){ this.ac = null; this.music = null; this.volM = +(localStorage.getItem('kmmb.volM') ?? 50) / 100; this.volS = +(localStorage.getItem('kmmb.volS') ?? 80) / 100; }
  ensure(){ if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; } const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ac = new AC();
    this.gM = this.ac.createGain(); this.gM.gain.value = this.volM; this.gS = this.ac.createGain(); this.gS.gain.value = this.volS; const comp = this.ac.createDynamicsCompressor(); this.gM.connect(comp); this.gS.connect(comp); comp.connect(this.ac.destination); }
  setVol(m, s){ this.volM = m; this.volS = s; localStorage.setItem('kmmb.volM', m * 100 | 0); localStorage.setItem('kmmb.volS', s * 100 | 0); if (this.gM) { this.gM.gain.setTargetAtTime(m, this.ac.currentTime, .05); this.gS.gain.setTargetAtTime(s, this.ac.currentTime, .05); } }
  tone(f, dur, { type = 'sine', g = .2, slide, delay = 0, out } = {}){ if (!this.ac) return; const t = this.ac.currentTime + delay, o = this.ac.createOscillator(), gn = this.ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(g, t + .008); gn.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(gn).connect(out || this.gS); o.start(t); o.stop(t + dur + .05); }
  noise(dur, { g = .2, hp = 200, lp = 4000, delay = 0 } = {}){ if (!this.ac) return; const t = this.ac.currentTime + delay, n = this.ac.sampleRate * dur | 0, buf = this.ac.createBuffer(1, n, this.ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; const s = this.ac.createBufferSource(); s.buffer = buf; const h = this.ac.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; const l = this.ac.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp; const gn = this.ac.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(.0008, t + dur); s.connect(h).connect(l).connect(gn).connect(this.gS); s.start(t); s.stop(t + dur + .02); }
  ok(){ [659, 880, 1318].forEach((f, i) => this.tone(f, .22, { type: 'triangle', g: .12, delay: i * .07 })); }
  ng(){ this.tone(220, .35, { type: 'sawtooth', g: .09, slide: 110 }); this.tone(165, .4, { type: 'square', g: .05, delay: .08, slide: 90 }); }
  cast(){ this.tone(440, .4, { type: 'sine', g: .1, slide: 1760 }); this.noise(.3, { g: .06, hp: 1500, lp: 6000 }); }
  hit(){ this.noise(.22, { g: .25, hp: 80, lp: 700 }); this.tone(140, .25, { type: 'sawtooth', g: .12, slide: 60 }); this.tone(2200, .12, { type: 'sine', g: .06 }); }
  attack(){ this.noise(.5, { g: .3, hp: 40, lp: 300 }); this.tone(90, .5, { type: 'sawtooth', g: .16, slide: 40 }); }
  hover(){ this.tone(1200, .05, { type: 'sine', g: .03 }); }
  combo(n){ [0, .08, .16].forEach((d, i) => this.tone(660 * Math.pow(1.2, i + Math.min(n, 8) * .15), .15, { type: 'triangle', g: .1, delay: d })); }
  boss(){ [55, 58, 62].forEach((f, i) => this.tone(f, 1.6, { type: 'sawtooth', g: .18, delay: i * .5 })); this.noise(1.2, { g: .12, hp: 30, lp: 200 }); }
  die(){ this.tone(300, .5, { type: 'square', g: .08, slide: 60 }); [1046, 1318, 1568, 2093].forEach((f, i) => this.tone(f, .25, { type: 'triangle', g: .09, delay: .2 + i * .09 })); }
  win(){ [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, .5, { type: 'triangle', g: .12, delay: i * .11 })); this.tone(1568, 1.4, { type: 'sine', g: .1, delay: .6 }); }
  lose(){ [392, 349, 311, 262].forEach((f, i) => this.tone(f, .45, { type: 'triangle', g: .12, delay: i * .22 })); }
  tick(){ this.tone(900, .05, { type: 'square', g: .04 }); }
  // 배경 음악: 판타지 아르페지오 + 베이스, 스케줄러 루프
  startMusic(){ if (!this.ac || this.music) return; const bpm = 108, beat = 60 / bpm; const prog = [[0, 4, 7, 11], [5, 9, 12, 16], [3, 7, 10, 14], [7, 11, 14, 17]]; const base = 220; const st = { i: 0, next: this.ac.currentTime + .1, on: true };
    const step = () => { if (!st.on) return; while (st.next < this.ac.currentTime + .4) { const bar = Math.floor(st.i / 8) % prog.length, pos = st.i % 8; const ch = prog[bar]; const n = ch[[0, 1, 2, 3, 2, 1, 3, 1][pos]]; const f = base * Math.pow(2, n / 12); const delay = st.next - this.ac.currentTime;
        this.tone(f, beat * .9, { type: 'triangle', g: .07, delay, out: this.gM }); if (pos === 0 || pos === 4) this.tone(f / 4, beat * 1.8, { type: 'sine', g: .12, delay, out: this.gM }); if (pos % 2 === 0) this.tone(f * 2, beat * .3, { type: 'sine', g: .025, delay: delay + beat * .5, out: this.gM }); st.next += beat / 2; st.i++; } st.timer = setTimeout(step, 120); };
    step(); this.music = st; }
  stopMusic(){ if (!this.music) return; this.music.on = false; clearTimeout(this.music.timer); this.music = null; }
}
