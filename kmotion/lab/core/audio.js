// 케이모션 과학실 — 소리(L01 임시: WebAudio 로 만든 소리). L08 에서 CC0 녹음으로 바꾼다.
// 손으로 한 모든 행동에 1초 안에 귀로 결과가 온다.
export function createAudio({ muted = false } = {}){
  let ctx = null, master = null, on = !muted;
  const ensure = () => { if (!on) return null; if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = .55; master.connect(ctx.destination); } catch (_) { on = false; return null; } } if (ctx.state === 'suspended') ctx.resume(); return ctx; };
  let noiseBuf = null; const noise = c => { if (noiseBuf) return noiseBuf; noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return noiseBuf; };
  function tone(f, dur, { type = 'sine', vol = .3, f2 = null, at = 0 } = {}){ const c = ensure(); if (!c) return; const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02); }
  function burst(dur, { vol = .3, freq = 1200, q = 1, type = 'bandpass', at = 0 } = {}){ const c = ensure(); if (!c) return; const t = c.currentTime + at, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = noise(c); f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .02); }
  // 이어지는 소리(붓기·끓기): 세기 0~1 을 매 프레임 넣는다
  const loops = {};
  function loop(name, level, { freq = 900, q = .8 } = {}){ const c = ensure(); if (!c) return; let L = loops[name];
    if (!L) { const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = noise(c); s.loop = true; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(master); s.start(); L = loops[name] = { g, f }; }
    L.g.gain.setTargetAtTime(Math.max(0, level) * .35, c.currentTime, .05); L.f.frequency.setTargetAtTime(freq, c.currentTime, .08); }
  const MAT = { glass: [2400, 3200], metal: [1500, 2100], rubber: [320, 260], wood: [520, 380], cloth: [700, 500], plastic: [1100, 900] };
  return {
    get on(){ return on; }, set on(v){ on = v; if (!v) Object.values(loops).forEach(L => L.g.gain.value = 0); },
    unlock: ensure,
    grab(mat = 'glass'){ const [a, b] = MAT[mat] || MAT.glass; tone(a, .06, { type: 'triangle', vol: .18, f2: b }); },
    place(mat = 'glass', hard = .6){ const [a] = MAT[mat] || MAT.glass; burst(.08, { vol: .12 + hard * .25, freq: a * .5, q: 2 }); tone(a * .35, .09, { vol: .1 + hard * .1 }); },
    whoosh(){ burst(.25, { vol: .1, freq: 600, q: .6 }); },
    wear(){ tone(660, .12, { vol: .12 }); tone(990, .18, { vol: .1, at: .08 }); },
    strike(level, onTarget = true){ const v = [0, .25, .45, .8][level]; burst(.12 + level * .06, { vol: v, freq: onTarget ? 700 - level * 120 : 300, q: 1.2 }); tone(onTarget ? 180 - level * 30 : 110, .15 + level * .05, { type: 'triangle', vol: v * .6, f2: 60 }); },
    pump(){ tone(420, .05, { type: 'square', vol: .06 }); burst(.06, { vol: .12, freq: 1800, q: 3 }); },
    clink(){ tone(2600, .09, { type: 'triangle', vol: .12, f2: 2300 }); },
    sizzle(v = 1){ burst(.35 + v * .3, { vol: .18 + v * .2, freq: 3800, q: .7, type: 'highpass' }); },
    pour(level){ loop('pour', level, { freq: 1200 + level * 900 }); },
    boil(level){ loop('boil', level * .7, { freq: 4200, q: .5 }); },
    ok(){ tone(880, .1, { vol: .1 }); tone(1320, .2, { vol: .08, at: .09 }); },
  };
}
