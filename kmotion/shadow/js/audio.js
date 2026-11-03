/* 그림자 괴물 · 소리 층 — 파일 없이 WebAudio 로 합성(으르렁·도망·도둑맞음·마을 종·바람) */
let ac = null, master = null, wind = null, growlN = null;
export function audioOn(){ if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .6; master.connect(ac.destination); } catch (_) { ac = null; } }
export function setVolume(v){ if (master) master.gain.value = v; }
const now = () => ac.currentTime;
function noise(sec){ const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; }

/** 바람·극장 웅웅거림(배경) */
export function ambience(on){ if (!ac) return; if (!on) { if (wind) { wind.g.gain.setTargetAtTime(0, now(), .4); setTimeout(() => { try { wind.s.stop(); } catch (_) {} }, 1200); wind = null; } return; }
  if (wind) return; const s = noise(4); s.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240; const g = ac.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start();
  g.gain.setTargetAtTime(.08, now(), 1.5); const lfo = ac.createOscillator(); lfo.frequency.value = .13; const lg = ac.createGain(); lg.gain.value = 90; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); wind = { s, g }; }

/** 으르렁 — 크기(0~1)에 따라 낮고 길게 */
export function growl(size = .5){ if (!ac) return; const t = now(); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70 - size * 25, t); o.frequency.exponentialRampToValueAtTime(45 - size * 15, t + .5);
  const n = noise(.7); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(150, t + .6);
  const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25 + size * .25, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + .7);
  const tr = ac.createWaveShaper(); const c = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; c[i] = Math.tanh(x * 3); } tr.curve = c;
  o.connect(tr); n.connect(f); f.connect(tr); tr.connect(g); g.connect(master); o.start(t); n.start(t); o.stop(t + .75); n.stop(t + .75); }

/** 도둑 도망(올라가는 삑삑) */
export function flee(){ if (!ac) return; const t = now(); for (let i = 0; i < 3; i++) { const o = ac.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(500 + i * 220, t + i * .07); o.frequency.exponentialRampToValueAtTime(900 + i * 300, t + i * .07 + .09);
    const g = ac.createGain(); g.gain.setValueAtTime(.12, t + i * .07); g.gain.exponentialRampToValueAtTime(.001, t + i * .07 + .1); o.connect(g); g.connect(master); o.start(t + i * .07); o.stop(t + i * .07 + .12); } }

/** 등불 뺏김(둔탁한 쿵 + 유리 깨짐) */
export function steal(){ if (!ac) return; const t = now(); const o = ac.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + .35); const g = ac.createGain(); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .4); o.connect(g); g.connect(master); o.start(t); o.stop(t + .4);
  const n = noise(.3); const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000; const g2 = ac.createGain(); g2.gain.setValueAtTime(.18, t); g2.gain.exponentialRampToValueAtTime(.001, t + .3); n.connect(f); f.connect(g2); g2.connect(master); n.start(t); n.stop(t + .3); }

/** 마을 종(승리·웨이브) */
export function bell(n = 1){ if (!ac) return; const t = now(); const fs = [523, 659, 784, 1047]; for (let i = 0; i < n; i++) { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = fs[i % 4]; const g = ac.createGain(); g.gain.setValueAtTime(0, t + i * .18); g.gain.linearRampToValueAtTime(.2, t + i * .18 + .02); g.gain.exponentialRampToValueAtTime(.001, t + i * .18 + 1.2); o.connect(g); g.connect(master); o.start(t + i * .18); o.stop(t + i * .18 + 1.3); } }

/** 마을 사람 비명(너무 커졌을 때) */
export function scream(){ if (!ac) return; const t = now(); const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(900, t); o.frequency.linearRampToValueAtTime(1300, t + .12); o.frequency.exponentialRampToValueAtTime(500, t + .4); const g = ac.createGain(); g.gain.setValueAtTime(.1, t); g.gain.exponentialRampToValueAtTime(.001, t + .45); o.connect(g); g.connect(master); o.start(t); o.stop(t + .5); }

/** 전등이 옮겨가는 소리(끼익 + 딸깍) */
export function lampMove(){ if (!ac) return; const t = now(); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.linearRampToValueAtTime(330, t + .6); const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 8; const g = ac.createGain(); g.gain.setValueAtTime(.05, t); g.gain.linearRampToValueAtTime(.08, t + .5); g.gain.exponentialRampToValueAtTime(.001, t + .8); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + .85);
  const c = ac.createOscillator(); c.type = 'square'; c.frequency.value = 1800; const cg = ac.createGain(); cg.gain.setValueAtTime(.15, t + .85); cg.gain.exponentialRampToValueAtTime(.001, t + .92); c.connect(cg); cg.connect(master); c.start(t + .85); c.stop(t + .95); }
