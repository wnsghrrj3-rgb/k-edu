// K-MOTION POSE HERO · AudioManager — 전부 Web Audio 합성(저작권 0). 음악/효과음 볼륨 분리, 자동재생 정책: 첫 클릭 뒤 ensure().
const LS = 'kmph.audio';
export class AudioManager {
  constructor(){ this.ctx = null; this.music = null; this.bpm = 100; const s = JSON.parse(localStorage.getItem(LS) || '{}'); this.volM = s.m ?? .5; this.volS = s.s ?? .8; this.muted = !!s.mute; this.loop = null; }
  ensure(){ if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; } const C = new (window.AudioContext || window.webkitAudioContext)(); this.ctx = C;
    this.master = C.createGain(); this.comp = C.createDynamicsCompressor(); this.master.connect(this.comp); this.comp.connect(C.destination);
    this.gM = C.createGain(); this.gS = C.createGain(); this.gM.connect(this.master); this.gS.connect(this.master); this.apply(); }
  apply(){ if (!this.ctx) return; this.gM.gain.value = this.muted ? 0 : this.volM; this.gS.gain.value = this.muted ? 0 : this.volS; localStorage.setItem(LS, JSON.stringify({ m: this.volM, s: this.volS, mute: this.muted })); }
  setMusic(v){ this.volM = v; this.apply(); } setSfx(v){ this.volS = v; this.apply(); } setMuted(m){ this.muted = m; this.apply(); }
  get now(){ return this.ctx ? this.ctx.currentTime : 0; }
  tone(f, t0, dur, { type = 'sine', vol = .3, out = this.gS, slide = 0, a = .005, d = null } = {}){ const C = this.ctx; if (!C) return; const o = C.createOscillator(), g = C.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + a); g.gain.exponentialRampToValueAtTime(.001, t0 + (d || dur)); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + (d || dur) + .02); }
  noise(t0, dur, vol = .2, hp = 1000, out = this.gS){ const C = this.ctx; if (!C) return; const n = C.sampleRate * dur | 0, b = C.createBuffer(1, n, C.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = C.createBufferSource(); s.buffer = b; const f = C.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = C.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(out); s.start(t0); }
  // 효과음
  appear(){ const t = this.now; this.tone(660, t, .08, { type: 'triangle', vol: .18 }); this.tone(990, t + .07, .1, { type: 'triangle', vol: .15 }); }
  success(grade){ const t = this.now, base = grade === 'PERFECT' ? 784 : grade === 'GREAT' ? 659 : 523; [0, .07, .14].forEach((o, i) => this.tone(base * [1, 1.25, 1.5][i], t + o, .16, { type: 'triangle', vol: .25 })); if (grade === 'PERFECT') this.tone(base * 2, t + .22, .3, { type: 'sine', vol: .2 }); this.noise(t, .12, .08, 3000); }
  combo(n){ const t = this.now; for (let i = 0; i < Math.min(5, 2 + (n / 5 | 0)); i++) this.tone(523 * Math.pow(1.19, i), t + i * .05, .12, { type: 'square', vol: .1 }); }
  fail(){ const t = this.now; this.tone(330, t, .18, { type: 'sine', vol: .18, slide: -100 }); this.tone(262, t + .12, .25, { type: 'sine', vol: .15, slide: -80 }); }
  tick(){ this.tone(1200, this.now, .04, { type: 'square', vol: .08 }); }
  count(go){ const t = this.now; this.tone(go ? 880 : 440, t, go ? .4 : .15, { type: 'triangle', vol: .25 }); }
  attack(big){ const t = this.now; this.tone(220, t, .3, { type: 'sawtooth', vol: .2, slide: 500 }); this.noise(t, .25, .15, 500); if (big) { this.tone(110, t + .1, .5, { type: 'sawtooth', vol: .25, slide: 800 }); this.noise(t + .1, .4, .25, 200); } }
  hurt(){ const t = this.now; this.tone(150, t, .35, { type: 'sawtooth', vol: .2, slide: -80 }); this.noise(t, .3, .2, 300); }
  bossRoar(){ const t = this.now; this.tone(80, t, .8, { type: 'sawtooth', vol: .3, slide: 40 }); this.tone(120, t + .05, .7, { type: 'square', vol: .12, slide: -30 }); this.noise(t, .6, .2, 150); }
  win(){ const t = this.now; [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, t + i * .12, .3, { type: 'triangle', vol: .25 })); this.noise(t + .8, .5, .12, 2000); }
  lose(){ const t = this.now; [392, 349, 330, 262].forEach((f, i) => this.tone(f, t + i * .22, .4, { type: 'triangle', vol: .2 })); }
  // 음악: 모드별 패턴 루프(스케줄러). onBeat(beatIndex, timeSec) 는 리듬 모드가 오디오 시각 기준으로 판정하는 데 쓴다.
  startMusic(kind = 'party', bpm = 100, onBeat = null){ this.stopMusic(); this.ensure(); const C = this.ctx; this.bpm = bpm; const beat = 60 / bpm; const t0 = C.currentTime + .1; this.loop = { kind, beat, t0, i: 0, onBeat, timer: 0 };
    const KICK = (t, v = .5) => { const o = C.createOscillator(), g = C.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.connect(g); g.connect(this.gM); o.start(t); o.stop(t + .3); };
    const HAT = (t, v = .12) => this.noise(t, .05, v, 6000, this.gM), SN = (t, v = .25) => { this.noise(t, .14, v, 1500, this.gM); this.tone(200, t, .1, { type: 'triangle', vol: .12, out: this.gM }); };
    const boss = kind === 'boss', rhythm = kind === 'rhythm', calm = kind === 'calm';
    const bass = boss ? [55, 55, 65.4, 58.3] : [65.4, 65.4, 87.3, 98], mel = boss ? [0, 3, 0, 5, 0, 3, 7, 5] : [0, 4, 7, 4, 9, 7, 4, 2], root = boss ? 220 : 261.6;
    const sched = () => { if (!this.loop || this.loop !== L) return; while (L.t0 + L.i * beat < C.currentTime + .4) { const i = L.i, t = L.t0 + i * beat, bar = i >> 2, q = i & 3;
        if (!calm) { KICK(t, boss ? .6 : .45); if (q === 2) SN(t, .22); HAT(t + beat / 2, .08); if (rhythm && q === 0) this.tone(1760, t, .06, { type: 'square', vol: .1, out: this.gM }); }
        if (!rhythm || true) { const b = bass[bar % 4]; this.tone(b, t, beat * .9, { type: boss ? 'sawtooth' : 'triangle', vol: calm ? .08 : .14, out: this.gM, a: .01 }); }
        if (q % 2 === 0 && !calm) { const n = mel[(i / 2 | 0) % 8]; this.tone(root * Math.pow(2, n / 12), t, beat * .6, { type: 'triangle', vol: .09, out: this.gM, a: .01 }); }
        if (calm && q === 0) { const n = mel[bar % 8]; this.tone(root * Math.pow(2, n / 12) / 2, t, beat * 3, { type: 'sine', vol: .07, out: this.gM, a: .05 }); }
        if (L.onBeat) L.onBeat(i, t); L.i++; } L.timer = setTimeout(sched, 120); };
    const L = this.loop; sched(); }
  stopMusic(){ if (this.loop) { clearTimeout(this.loop.timer); this.loop = null; } }
}
