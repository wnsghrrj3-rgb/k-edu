// 소리층 — 파일 없이 브라우저가 합성하는 환경음(바람·불·비·강물·발소리·심장) + 있으면 트는 샘플(assets/sfx/<name>.mp3).
// 첫 터치 뒤에만 켜진다(브라우저 정책). ?sound=0 이면 끔, 🔈 단추로 토글. 시대 이름 없음. 구조 설계 v1 §7.
export class Sound {
  constructor(g) {
    this.g = g; this.on = new URLSearchParams(location.search).get('sound') !== '0' && localStorage.getItem('kworld_sound') !== '0';
    this.ctx = null; this.layers = {}; this.level = { wind: 0.35, fire: 0, rain: 0, river: 0 }; this.stepT = 0; this.heartT = 0; this.samples = {};
    const start = () => { if (!this.ctx && this.on) this.init(); window.removeEventListener('pointerdown', start); window.removeEventListener('keydown', start); };
    window.addEventListener('pointerdown', start); window.addEventListener('keydown', start);
    this.button();
  }
  button() {
    const b = document.createElement('button'); b.id = 'sndbtn'; b.textContent = this.on ? '🔈' : '🔇'; b.title = '소리';
    b.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:30;background:rgba(0,0,0,.45);color:#e9dfc7;border:1px solid rgba(255,255,255,.25);border-radius:999px;width:38px;height:38px;font-size:17px;cursor:pointer';
    b.onclick = () => { this.on = !this.on; localStorage.setItem('kworld_sound', this.on ? '1' : '0'); b.textContent = this.on ? '🔈' : '🔇'; if (this.on && !this.ctx) this.init(); if (this.master) this.master.gain.setTargetAtTime(this.on ? 0.5 : 0, this.ctx.currentTime, 0.2); };
    document.body.appendChild(b);
  }
  init() {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; const ctx = this.ctx = new C();
    this.master = ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(ctx.destination);
    const noise = () => { const n = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, n, ctx.sampleRate); const d = buf.getChannelData(0); let b = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = b * 3.5; } const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
    const layer = (name, type, freq, q = 0.7) => { const src = noise(); const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const gn = ctx.createGain(); gn.gain.value = 0; src.connect(f); f.connect(gn); gn.connect(this.master); this.layers[name] = { gain: gn, filter: f }; };
    layer('wind', 'lowpass', 380); layer('fire', 'bandpass', 900, 0.5); layer('rain', 'highpass', 1800); layer('river', 'bandpass', 600, 0.4);
    // 바람 숨결(느린 흔들림)
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13; const lg = ctx.createGain(); lg.gain.value = 0.12; lfo.connect(lg); lg.connect(this.layers.wind.gain.gain); lfo.start();
    // 시대 분위기 층(world.json ambience) — 바다(느린 파도)·사람 소리(장터·마을)·벌레(밤)·기계(공장·정거장)
    const slowLfo = (gainNode, hz, depth) => { const o = ctx.createOscillator(); o.frequency.value = hz; const gg = ctx.createGain(); gg.gain.value = depth; o.connect(gg); gg.connect(gainNode.gain); o.start(); };
    layer('sea', 'lowpass', 520, 0.3); slowLfo(this.layers.sea.gain, 0.09, 0.16);
    layer('crowd', 'bandpass', 480, 0.9); slowLfo(this.layers.crowd.gain, 0.7, 0.05);
    layer('insects', 'bandpass', 4200, 6); slowLfo(this.layers.insects.gain, 24, 0.5);
    layer('machines', 'lowpass', 160, 2); slowLfo(this.layers.machines.gain, 1.6, 0.6);
    for (const k of ['sea', 'crowd', 'insects', 'machines']) this.level[k] = 0;
    for (const k of ['wind', 'fire', 'rain', 'river']) this.set(k, this.level[k]);
    this.g.e.onFrame.push((dt) => this.tick(dt));
  }
  set(name, v) { this.level[name] = v; const L = this.layers[name]; if (L && this.ctx) L.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 1.2); }
  /** 짧은 잡음 한 번(발소리·돌 부딪힘) */
  blip(freq = 300, dur = 0.08, vol = 0.25, type = 'lowpass') {
    if (!this.ctx || !this.on) return; const ctx = this.ctx; const n = ctx.sampleRate * dur; const buf = ctx.createBuffer(1, n, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; const gn = ctx.createGain(); gn.gain.value = vol; s.connect(f); f.connect(gn); gn.connect(this.master); s.start();
  }
  thump(vol = 0.3) { if (!this.ctx || !this.on) return; const ctx = this.ctx; const o = ctx.createOscillator(); o.frequency.setValueAtTime(70, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18); const gn = ctx.createGain(); gn.gain.setValueAtTime(vol, ctx.currentTime); gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22); o.connect(gn); gn.connect(this.master); o.start(); o.stop(ctx.currentTime + 0.25); }
  /** 둘레 물 비율(0~0.34) — hm 없으면 'river' 구역 거리, 둘 다 없으면 null */
  static waterLevel(e, x, z) {
    const m = e?.hm;
    if (m) { let n = 0, w = 0; for (const r of [4, 10, 18]) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; n++; if (e.groundY(x + Math.cos(a) * r, z + Math.sin(a) * r) < 0) w += r === 4 ? 1.6 : r === 10 ? 1 : 0.5; } return Math.min(0.34, w / n * 0.42); }
    const river = e?.areas?.get('river'); if (!river) return null; return Math.max(0, 0.32 - Math.hypot(river.x - x, river.z - z) * 0.012);
  }
  /** 샘플 없을 때 이름으로 합성 — growl·rustle·wolf·card·good·bad·drum·bell. 반환 true 면 합성함 */
  synth(name, gain = 0.6) {
    if (!this.ctx || !this.on) return false; const ctx = this.ctx, t = ctx.currentTime; const osc = (type, f0, f1, dur, vol) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur); const gn = ctx.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol * gain, t + 0.03); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(this.master); o.start(t); o.stop(t + dur + 0.05); };
    if (/growl/.test(name)) { this.blip(140, 0.6, 0.5 * gain, 'lowpass'); osc('sawtooth', 62, 48, 0.7, 0.08); return true; }
    if (/rustle/.test(name)) { this.blip(2400, 0.22, 0.12 * gain, 'highpass'); return true; }
    if (/wolf|howl/.test(name)) { osc('sine', 330, 520, 0.9, 0.12); setTimeout(() => osc('sine', 500, 300, 1.1, 0.1), 850); return true; }
    if (name === 'card') { this.blip(1200, 0.05, 0.1 * gain, 'bandpass'); return true; }
    if (name === 'good') { osc('triangle', 523, 0, 0.18, 0.12); setTimeout(() => osc('triangle', 784, 0, 0.26, 0.12), 140); return true; }
    if (name === 'bad') { this.thump(0.28 * gain); osc('triangle', 196, 150, 0.5, 0.1); return true; }
    if (/drum/.test(name)) { this.thump(0.5 * gain); setTimeout(() => this.thump(0.4 * gain), 420); return true; }
    if (name === 'bird') { const f = 1800 + Math.random() * 1400; osc('sine', f, f * 1.4, 0.12, 0.05); setTimeout(() => osc('sine', f * 1.2, f * 0.9, 0.14, 0.04), 160); return true; }
    if (name === 'owl') { osc('sine', 420, 400, 0.35, 0.07); setTimeout(() => osc('sine', 380, 340, 0.5, 0.06), 420); return true; }
    if (name === 'dog') { for (let i = 0; i < 2; i++) setTimeout(() => { osc('sawtooth', 320, 220, 0.14, 0.05); this.blip(900, 0.08, 0.08 * gain, 'bandpass'); }, i * 260); return true; }
    if (name === 'rooster') { osc('sawtooth', 500, 900, 0.3, 0.05); setTimeout(() => osc('sawtooth', 800, 450, 0.7, 0.05), 320); return true; }
    if (name === 'hammer') { for (let i = 0; i < 3; i++) setTimeout(() => this.blip(2600, 0.04, 0.18 * gain, 'bandpass'), i * 480); return true; }
    if (name === 'horse') { for (let i = 0; i < 4; i++) setTimeout(() => this.thump(0.12 * gain), i * 160); return true; }
    if (name === 'train') { osc('sawtooth', 220, 215, 1.4, 0.07); osc('sawtooth', 277, 270, 1.4, 0.06); return true; }
    if (name === 'car') { this.blip(300, 1.6, 0.14 * gain, 'lowpass'); return true; }
    if (/bell/.test(name)) { osc('sine', 660, 640, 2.2, 0.16); osc('sine', 1320, 1300, 1.2, 0.05); return true; }
    return false;
  }
  /** 샘플: assets/sfx/<name>.mp3 — 없으면 이름으로 합성, 그것도 없으면 조용히 */
  async play(name, gain = 0.6) {
    if (!this.ctx || !this.on) return;
    if (this.samples[name] === null) { this.synth(name, gain); return; }
    try {
      if (!this.samples[name]) this.samples[name] = fetch(`/kworld/assets/sfx/${name}.mp3`).then((r) => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then((b) => this.ctx.decodeAudioData(b));
      const buf = await this.samples[name]; const s = this.ctx.createBufferSource(); s.buffer = buf; const gn = this.ctx.createGain(); gn.gain.value = gain; s.connect(gn); gn.connect(this.master); s.start();
    } catch { this.samples[name] = null; this.synth(name, gain); }
  }
  tick(dt) {
    if (!this.ctx || !this.on) return; const g = this.g;
    // 강물: 높이맵이 있으면 둘레 24칸(반지름 4·10·18 × 8방향) 중 물(h<0) 비율로 — 열두 시대 공통 · 없으면 'river' 구역과의 거리
    if (g.p?.pos) { this.waterT = (this.waterT || 0) + dt; if (this.waterT > 0.5) { this.waterT = 0; const v = Sound.waterLevel(g.e, g.p.pos.x, g.p.pos.z); if (v != null && Math.abs(v - this.level.river) > 0.01) this.set('river', v); } }
    // 시대 분위기 — world.json ambience: {base:{sea,crowd,insects,machines,wind}, near:{<area>:<layer>}, day:[...], night:[...], gap}
    const amb = g.world?.ambience; if (amb && g.p?.pos) { this.ambT = (this.ambT || 0) + dt; if (this.ambT > 0.6) { this.ambT = 0; const night = !!g.story?.isNight; const base = amb.base || {}; const want = { sea: base.sea || 0, crowd: night ? 0 : base.crowd || 0, insects: night ? base.insects ?? 0.3 : 0, machines: base.machines || 0 };
      for (const [id, lay] of Object.entries(amb.near || {})) { const a = g.e.areas?.get(id); if (!a) continue; const d = Math.hypot(a.x - g.p.pos.x, a.z - g.p.pos.z); const v = Math.max(0, 1 - d / (amb.nearRadius || 36)); if (lay === 'crowd' && night) continue; want[lay] = Math.max(want[lay] || 0, v * (amb.nearLevel?.[lay] ?? { sea: 0.3, crowd: 0.22, machines: 0.2, insects: 0.3 }[lay] ?? 0.2)); }
      for (const k of ['sea', 'crowd', 'insects', 'machines']) if (Math.abs((want[k] || 0) - (this.level[k] || 0)) > 0.01) this.set(k, want[k] || 0);
      const list = night ? amb.night : amb.day; if (list?.length && !g.ui?.isOpen?.()) { this.oneT = (this.oneT || 0) + 0.6; const gap = amb.gap || 14; if (this.oneT > gap * (0.6 + Math.random() * 0.8)) { this.oneT = 0; this.play(list[Math.floor(Math.random() * list.length)], 0.5); } } } }
    // 발소리
    if (g.p?.moving) { this.stepT += dt * (g.p.keys.ShiftLeft || g.p.keys.ShiftRight ? 3.4 : 2.0); if (this.stepT >= 1) { this.stepT = 0; this.blip(g.p.inWater ? 700 : 260, g.p.inWater ? 0.12 : 0.07, g.p.inWater ? 0.18 : 0.14, g.p.inWater ? 'bandpass' : 'lowpass'); } }
    // 심장: 배가 너무 고플 때
    if (g.hunger != null && g.hunger < 18) { this.heartT += dt; if (this.heartT > 0.9) { this.heartT = 0; this.thump(0.22); setTimeout(() => this.thump(0.14), 180); } }
  }
}
