// proto 스킨 — 소리(전부 합성, 파일 0). 소리는 표현 층 몫: 이벤트를 듣고 낸다. 첫 클릭·키 전엔 조용함(브라우저 규칙)
export function createAudio(){
  let ac = null, master = null, sfx = null, bgm = null, bgmOn = false, bgmTimer = 0, muted = false, step = 0;
  const vol = { sfx: .8, bgm: .25 };
  function ensure(){ if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
    ac = new C(); master = ac.createGain(); master.gain.value = muted ? 0 : 1;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; master.connect(comp); comp.connect(ac.destination);
    sfx = ac.createGain(); sfx.gain.value = vol.sfx; sfx.connect(master); bgm = ac.createGain(); bgm.gain.value = vol.bgm; bgm.connect(master); return true; }
  const now = () => ac.currentTime;
  function tone({ f = 440, f2 = null, type = 'sine', t = 0, d = .15, a = .005, g = .3, out = sfx, q = null, lp = null }){
    const o = ac.createOscillator(), e = ac.createGain(); o.type = type; const t0 = now() + t; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + d);
    e.gain.setValueAtTime(0, t0); e.gain.linearRampToValueAtTime(g, t0 + a); e.gain.exponentialRampToValueAtTime(.0008, t0 + d);
    let node = o; if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; if (q) fl.Q.value = q; o.connect(fl); node = fl; }
    node.connect(e); e.connect(out); o.start(t0); o.stop(t0 + d + .05); }
  let noiseBuf = null; function noise({ t = 0, d = .2, g = .3, lp = 1200, hp = 0, f2 = null }){
    if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), e = ac.createGain(), t0 = now() + t; s.buffer = noiseBuf; fl.type = 'lowpass'; fl.frequency.setValueAtTime(lp, t0); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + d);
    let last = fl; if (hp) { const h = ac.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; fl.connect(h); last = h; }
    e.gain.setValueAtTime(g, t0); e.gain.exponentialRampToValueAtTime(.0008, t0 + d); s.connect(fl); last.connect(e); e.connect(sfx); s.start(t0); s.stop(t0 + d + .05); }
  const SFX = {
    bolt(){ tone({ f: 1300, f2: 520, type: 'triangle', d: .12, g: .22 }); noise({ d: .06, g: .08, lp: 5000, hp: 2000 }); },
    charge(){ tone({ f: 180, f2: 520, type: 'sawtooth', d: .5, g: .08, lp: 900 }); },
    cast(){ tone({ f: 220, f2: 90, type: 'sawtooth', d: .35, g: .18, lp: 1400 }); noise({ d: .3, g: .2, lp: 2500, f2: 300 }); },
    boom(){ tone({ f: 120, f2: 38, type: 'sine', d: .45, g: .5 }); noise({ d: .5, g: .35, lp: 1800, f2: 120 }); },
    hit(crit){ tone({ f: crit ? 900 : 640, f2: 300, type: 'square', d: .08, g: .12, lp: 3000 }); noise({ d: .07, g: .15, lp: 3500 }); },
    hurt(){ tone({ f: 200, f2: 90, type: 'sawtooth', d: .25, g: .25, lp: 800 }); noise({ d: .15, g: .2, lp: 900 }); },
    block(){ tone({ f: 980, type: 'triangle', d: .25, g: .18 }); tone({ f: 1470, type: 'sine', d: .3, g: .1, t: .02 }); },
    dodge(){ noise({ d: .18, g: .18, lp: 4000, f2: 600, hp: 400 }); },
    die(){ [0, .06, .12].forEach((t, i) => tone({ f: 520 + i * 260, type: 'triangle', d: .15, g: .16, t })); noise({ d: .25, g: .12, lp: 3000, f2: 400 }); },
    spawn(){ tone({ f: 160, f2: 320, type: 'sine', d: .3, g: .12 }); },
    windup(){ tone({ f: 300, f2: 180, type: 'square', d: .2, g: .05, lp: 700 }); },
    fizzle(){ noise({ d: .35, g: .15, lp: 1200, f2: 200 }); },
    crystal(){ [0, .08].forEach((t, i) => tone({ f: 1568 * (i ? 1.5 : 1), type: 'sine', d: .4, g: .12, t })); },
    hint(){ [784, 988].forEach((f, i) => tone({ f, type: 'sine', d: .25, g: .1, t: i * .09 })); },   // 부엉이 「후-후」 대신 짧은 두 음
    qopen(){ [523, 659, 784].forEach((f, i) => tone({ f, type: 'sine', d: .35, g: .12, t: i * .06 })); },
    right(streak){ const base = 523 * Math.pow(2, Math.min(5, streak || 0) / 12); [0, 4, 7, 12].forEach((s, i) => tone({ f: base * Math.pow(2, s / 12), type: 'triangle', d: .3, g: .16, t: i * .07 })); },
    wrong(){ tone({ f: 233, f2: 196, type: 'sine', d: .4, g: .16 }); },
    gauge(){ tone({ f: 70, type: 'sine', d: .14, g: .4 }); tone({ f: 70, type: 'sine', d: .14, g: .3, t: .2 }); },
    tick(){ tone({ f: 1200, type: 'sine', d: .03, g: .04 }); },
    wave(){ tone({ f: 294, type: 'sawtooth', d: .5, g: .1, lp: 1200 }); tone({ f: 392, type: 'sawtooth', d: .6, g: .1, lp: 1200, t: .18 }); },
    feather(){ [784, 988, 1175, 1568].forEach((f, i) => tone({ f, type: 'sine', d: .5, g: .12, t: i * .08 })); },
    clear(){ [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone({ f, type: 'triangle', d: .35, g: .16, t: i * .12 })); },
    defeat(){ [392, 330, 262].forEach((f, i) => tone({ f, type: 'sine', d: .5, g: .14, t: i * .2 })); },
    roar(){ tone({ f: 110, f2: 60, type: 'sawtooth', d: .9, g: .35, lp: 700 }); tone({ f: 165, f2: 80, type: 'square', d: .8, g: .12, lp: 500, t: .05 }); noise({ d: .9, g: .25, lp: 600, f2: 150 }); },
    shield(){ [660, 990, 1320].forEach((f, i) => tone({ f, type: 'sine', d: .6, g: .1, t: i * .05 })); },
    glass(){ noise({ d: .5, g: .4, lp: 9000, hp: 2500 }); [2093, 2637, 3136, 2349].forEach((f, i) => tone({ f, type: 'triangle', d: .35, g: .1, t: i * .03 })); tone({ f: 90, f2: 40, d: .4, g: .4 }); },
    weak(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ f, type: 'square', d: .18, g: .08, lp: 3000, t: i * .07 })); },
    zap(){ for (let i = 0; i < 3; i++) { noise({ d: .08, g: .25, lp: 7000, hp: 1500, t: i * .07 }); tone({ f: 1800, f2: 600, type: 'square', d: .06, g: .08, t: i * .07 }); } },
    ice(){ noise({ d: 1.6, g: .18, lp: 3000, hp: 800, f2: 1200 }); for (let i = 0; i < 6; i++) tone({ f: 2400 + Math.random() * 1600, type: 'triangle', d: .15, g: .05, t: Math.random() * 1.2 }); },
    sky(){ tone({ f: 120, f2: 480, type: 'sawtooth', d: 1.1, g: .12, lp: 1200 }); tone({ f: 2400, f2: 300, type: 'sine', d: 1.0, g: .06, t: .3 }); },
    meteor(){ tone({ f: 60, f2: 30, type: 'sine', d: .9, g: .6 }); noise({ d: 1.0, g: .5, lp: 1600, f2: 80 }); },
    click(){ tone({ f: 880, type: 'sine', d: .06, g: .08 }); },
    calibOk(){ tone({ f: 880, type: 'triangle', d: .2, g: .14 }); tone({ f: 1320, type: 'triangle', d: .25, g: .1, t: .08 }); },
  };
  // 배경음 — 숲 전투: 펜타토닉 아르페지오 + 베이스, 문제 중엔 반으로 느리고 작게
  const SC = [0, 2, 4, 7, 9]; let slow = false;
  function beat(){ if (!bgmOn || !ac) return; const spb = slow ? .5 : .25, t = 0;
    const bar = Math.floor(step / 8) % 4, root = [57, 53, 55, 52][bar], n = SC[(step * 3 + (step >> 2)) % 5] + 12 + root;
    tone({ f: 440 * Math.pow(2, (n - 69) / 12), type: 'triangle', d: spb * 1.6, g: slow ? .05 : .08, out: bgm, t });
    if (step % 4 === 0) tone({ f: 440 * Math.pow(2, (root - 12 - 69) / 12), type: 'sine', d: spb * 3.5, g: .14, out: bgm, t });
    if (!slow && step % 8 === 4) noise({ d: .08, g: .05, lp: 6000, hp: 3000 });
    step++; bgmTimer = setTimeout(beat, spb * 1000); }
  return {
    unlock(){ ensure(); },
    play(name, arg){ if (!ensure() || muted) return; const f = SFX[name]; if (f) try { f(arg); } catch (_) {} },
    bgm(on){ if (on === bgmOn) return; bgmOn = on; clearTimeout(bgmTimer); if (on && ensure()) beat(); },
    slow(on){ slow = !!on; },
    mute(m){ muted = m == null ? !muted : !!m; if (master) master.gain.value = muted ? 0 : 1; return muted; },
    get muted(){ return muted; },
    dispose(){ bgmOn = false; clearTimeout(bgmTimer); if (ac) { try { ac.close(); } catch (_) {} } ac = null; },
  };
}
