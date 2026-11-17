/* 케이원더 · 불꽃놀이 소리 — 전부 WebAudio 로 만든다(파일 없음). 번쩍 뒤 「쾅」은 거리만큼 늦게 온다. */
export function createAudio() {
  let ctx = null, master = null, noiseBuf = null, on = true;
  function ensure() { if (ctx) return true; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = .9;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; master.connect(comp); comp.connect(ctx.destination);
    // 먼 산 메아리
    const d = ctx.createDelay(1.5); d.delayTime.value = .62; const fb = ctx.createGain(); fb.gain.value = .28; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    return true; }
  const noise = () => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; };
  function thump(at, vol) {                         // 통에서 나가는 「퉁」
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(120, at); o.frequency.exponentialRampToValueAtTime(38, at + .22);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .008); g.gain.exponentialRampToValueAtTime(.001, at + .35); o.connect(g); g.connect(master); o.start(at); o.stop(at + .4);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'lowpass'; f.frequency.value = 900; ng.gain.setValueAtTime(vol * .5, at); ng.gain.exponentialRampToValueAtTime(.001, at + .18);
    n.connect(f); f.connect(ng); ng.connect(master); n.start(at); n.stop(at + .2); }
  function whistle(at, dur, vol) {                  // 올라가는 「휘이익」
    const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.Q.value = 9; f.frequency.setValueAtTime(900, at); f.frequency.exponentialRampToValueAtTime(2600, at + dur);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + .15); g.gain.linearRampToValueAtTime(0, at + dur); n.connect(f); f.connect(g); g.connect(master); n.start(at); n.stop(at + dur + .05); }
  function boom(at, size) {                         // 「쾅」
    const v = size === 'l' ? 1 : size === 's' ? .5 : .75;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(size === 'l' ? 70 : 95, at); o.frequency.exponentialRampToValueAtTime(28, at + .7);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + .006); g.gain.exponentialRampToValueAtTime(.001, at + 1.3); o.connect(g); g.connect(master); o.start(at); o.stop(at + 1.4);
    const n = noise(), f = ctx.createBiquadFilter(), ng = ctx.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, at); f.frequency.exponentialRampToValueAtTime(180, at + 1.1);
    ng.gain.setValueAtTime(0, at); ng.gain.linearRampToValueAtTime(v * .9, at + .004); ng.gain.exponentialRampToValueAtTime(.001, at + 1.6); n.connect(f); f.connect(ng); ng.connect(master); n.start(at); n.stop(at + 1.7); }
  function crackle(at, dur, vol) {                  // 지지직 반짝임
    const count = Math.round(dur * 55);
    for (let i = 0; i < count; i++) { const t = at + Math.random() * dur, n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'highpass'; f.frequency.value = 2500 + Math.random() * 3000; g.gain.setValueAtTime(vol * (.3 + Math.random() * .7), t); g.gain.exponentialRampToValueAtTime(.001, t + .03);
      n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random()); n.stop(t + .04); } }
  function splash(at) { const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = .6;
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(.25, at + .03); g.gain.exponentialRampToValueAtTime(.001, at + .6); n.connect(f); f.connect(g); g.connect(master); n.start(at); n.stop(at + .7); }
  function chime() { if (!ready()) return; const t = ctx.currentTime; [880, 1320, 1760].forEach((fq, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = fq;
    g.gain.setValueAtTime(0, t + i * .09); g.gain.linearRampToValueAtTime(.12, t + i * .09 + .01); g.gain.exponentialRampToValueAtTime(.001, t + i * .09 + .7); o.connect(g); g.connect(master); o.start(t + i * .09); o.stop(t + i * .09 + .8); }); }
  const ready = () => on && ctx && ctx.state === 'running';
  return {
    unlock() { if (!ensure()) return; if (ctx.state !== 'running') ctx.resume(); },
    set(v) { on = v; }, get on() { return on; }, get running() { return !!ctx && ctx.state === 'running'; },
    launch(dist, rise) { if (!ready()) return; const t = ctx.currentTime + dist / 340; thump(t, .5); whistle(t + .1, Math.max(.6, rise - .5), .05); },
    burst(delay, spec) { if (!ready()) return; const t = ctx.currentTime + delay; boom(t, spec.size);
      if (spec.stars.some(s => s.glitter)) crackle(t + .7, 1.4, .16); if (spec.layout === 'willow') crackle(t + .5, 2.2, .05); },
    splash(dist) { if (!ready()) return; splash(ctx.currentTime + dist / 340); }, chime };
}
