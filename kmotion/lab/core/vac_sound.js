// 케이모션 과학실 — 실험 2 「공기를 빼면」 소리. 이 실험의 주인공은 소리다(설계 2장 「그림·소리의 급소」).
//  · 자명종: 망치가 두 종을 번갈아 치는 금속 울림(초당 18번). 한 번만 합성한 1초짜리 고리 버퍼를 계속 돌리고, 소리 크기 = view().sound 를 그대로 쓴다.
//    공기가 빠질수록 정말 작아져서 사라진다. 종을 덮으면 살짝 먹먹해진다(높은 소리가 먼저 줄어든다).
//  · 펌프: 내려 누를 때마다 「훅—」. 안의 공기가 묽을수록 가볍고 높고 작게(설계: 펌프 소리가 공기가 빠질수록 가벼워진다).
//  · 밸브: 쉬익(열린 정도 × 안팎 압력 차) · 미끄러짐: 끽 · 금: 쩍
// 소리를 끄면(🔊 단추·?mute=1) 아무 소리도 내지 않는다. 매 프레임 새 노드를 만들지 않는다(고리 소리는 처음 한 번만 만든다).
export function createVacSound(audio){
  let built = null;
  function build(){
    const c = audio.ctx, out = audio.out; if (!c || !out) return null;
    const sr = c.sampleRate, N = sr;                                               // 1초 = 18번 침(짝수라 왼쪽·오른쪽 종이 이음매 없이 이어진다)
    const buf = c.createBuffer(1, N, sr), d = buf.getChannelData(0);
    // 두 종: 둥근 금속 판의 떨림 비율(1, 2.76, 5.40, 8.93 …) — 조화음이 아니라 「쨍」한 쇳소리
    const bells = [{ f: 2093, part: [[1, 1, .5], [2.76, .55, .18], [5.4, .3, .09], [8.93, .14, .05], [1.003, .5, .45]] }, { f: 2349, part: [[1, 1, .45], [2.76, .5, .16], [5.4, .28, .08], [8.93, .12, .05], [.997, .45, .42]] }];
    const hits = 18, step = N / hits; let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let h = 0; h < hits; h++) { const b = bells[h & 1], t0 = Math.round(h * step + (rnd() - .5) * 60), amp = .75 + rnd() * .35;
      for (const [ratio, a, tau] of b.part) { const w = 2 * Math.PI * b.f * ratio / sr, L = Math.min(N, Math.round(tau * 5 * sr)), ph = rnd() * 6.28;
        for (let i = 0; i < L; i++) { const k = (t0 + i) % N, j = k < 0 ? k + N : k; d[j] += amp * a * Math.exp(-i / (tau * sr)) * Math.sin(w * i + ph) * .12; } }
      for (let i = 0; i < 160; i++) { const k = (t0 + i + N) % N; d[k] += (rnd() * 2 - 1) * .22 * Math.exp(-i / 30); } }   /* 망치가 닿는 딸깍 */
    let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(d[i])); if (mx > 0) for (let i = 0; i < N; i++) d[i] *= .9 / mx;
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 12000; lp.Q.value = .5;
    const ring = c.createGain(); ring.gain.value = 0; src.connect(lp); lp.connect(ring); ring.connect(out); src.start();
    // 쉬익(밸브) — 흰 소리 고리
    const nb = c.createBuffer(1, sr, sr), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = c.createBufferSource(); ns.buffer = nb; ns.loop = true; const hf = c.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 3200; hf.Q.value = .7;
    const hiss = c.createGain(); hiss.gain.value = 0; ns.connect(hf); hf.connect(hiss); hiss.connect(out); ns.start();
    built = { c, out, ring, lp, hiss, hf, nb };
    return built;
  }
  const ok = () => audio.on && (built || build());
  let duckUntil = 0;
  return {
    /** 매 프레임: level = 자명종 소리 크기(0~1, null = 안 울림), covered = 종에 덮였나, hiss = 0~1 */
    update(level, covered, hiss, now){
      if (!audio.on) { if (built) { built.ring.gain.value = 0; built.hiss.gain.value = 0; } return; }
      const b = ok(); if (!b) return; const t = b.c.currentTime, duck = now < duckUntil ? 0 : 1;
      const lv = level == null ? 0 : Math.max(0, Math.min(1, level));
      b.ring.gain.setTargetAtTime(lv * lv * .55 * duck, t, .06);                     // 귀는 로그로 듣는다 → 제곱이면 「점점 작아지다 사라지는」 느낌이 바늘과 맞는다
      b.lp.frequency.setTargetAtTime(covered ? 2500 + 7500 * lv : 12000, t, .1);
      b.hiss.gain.setTargetAtTime(Math.max(0, Math.min(1, hiss)) * .3 * duck, t, .05);
    },
    /** 극적인 순간에 방 소리를 잠깐 멈춤(자명종이 조용해진 순간) */
    hush(sec, now){ duckUntil = now + sec * 1000; },
    /** 펌프 한 번: p = 그때 종 안 압력, s = 세기 */
    pump(p, s = 1){ const b = ok(); if (!b) return; const c = b.c, t = c.currentTime;
      const src = c.createBufferSource(); src.buffer = b.nb; const f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'bandpass'; f.frequency.value = 260 + (1 - p) * 1700; f.Q.value = .9 + (1 - p) * 2.5;          // 묽을수록 높고 가늘게
      const v = (.18 + .5 * p) * (.5 + .5 * s); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .04); g.gain.exponentialRampToValueAtTime(.001, t + .16 + .3 * p);
      src.connect(f); f.connect(g); g.connect(b.out); src.start(t, Math.random() * .5); src.stop(t + .6);
      const o = c.createOscillator(), og = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(90 + (1 - p) * 220, t); o.frequency.exponentialRampToValueAtTime(60 + (1 - p) * 160, t + .15);
      og.gain.setValueAtTime(.12 * p * s, t); og.gain.exponentialRampToValueAtTime(.001, t + .18); o.connect(og); og.connect(b.out); o.start(t); o.stop(t + .2); },
    /** 손잡이를 끝까지 올릴 때 작은 「틱」 */
    tick(){ const b = ok(); if (!b) return; const c = b.c, t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = 1400; g.gain.setValueAtTime(.025, t); g.gain.exponentialRampToValueAtTime(.001, t + .03); o.connect(g); g.connect(b.out); o.start(t); o.stop(t + .04); },
    /** 종이 안 들림: 손이 미끄러지는 끽 */
    squeak(){ const b = ok(); if (!b) return; const c = b.c, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), lf = c.createOscillator(), lg = c.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(820, t + .32); lf.frequency.value = 38; lg.gain.value = 60; lf.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.14, t + .03); g.gain.exponentialRampToValueAtTime(.001, t + .36); o.connect(g); g.connect(b.out); o.start(t); lf.start(t); o.stop(t + .4); lf.stop(t + .4); },
    /** 금 간 종: 쩍 */
    crack(big = false){ const b = ok(); if (!b) return; const c = b.c, t = c.currentTime;
      for (let k = 0; k < (big ? 3 : 1); k++) { const src = c.createBufferSource(); src.buffer = b.nb; const f = c.createBiquadFilter(), g = c.createGain(); f.type = 'highpass'; f.frequency.value = 2500; const at = t + k * .07;
        g.gain.setValueAtTime(.5, at); g.gain.exponentialRampToValueAtTime(.001, at + .09); src.connect(f); f.connect(g); g.connect(b.out); src.start(at, Math.random() * .5); src.stop(at + .12); }
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(3100, t); o.frequency.exponentialRampToValueAtTime(2400, t + .5); g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(g); g.connect(b.out); o.start(t); o.stop(t + .62); },
    /** 공기가 한꺼번에: 푸슉 */
    rush(){ const b = ok(); if (!b) return; const c = b.c, t = c.currentTime, src = c.createBufferSource(); src.buffer = b.nb; const f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'bandpass'; f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(600, t + .7); f.Q.value = .6; g.gain.setValueAtTime(.6, t); g.gain.exponentialRampToValueAtTime(.001, t + .9);
      src.connect(f); f.connect(g); g.connect(b.out); src.start(t); src.stop(t + 1); },
  };
}
