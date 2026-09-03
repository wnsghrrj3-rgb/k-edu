/* ============================================================
   케이무비 소리 크기 재기 (KMV_LOUD) — ITU-R BS.1770-4 통합 라우드니스(LUFS) + 샘플 피크
   ------------------------------------------------------------
   · K-가중(고역 셸프 + RLB 고역 통과, 48kHz 계수) → 400ms 블록(100ms 간격) 평균 제곱
   · 게이트: 절대 -70 LUFS → 상대(통과 블록 평균 - 10 LU) → 통과 블록만 적분
   · 순수 계산(DOM·오디오 컨텍스트 0) — renderMix 가 15초 창을 넘길 때마다 push, 끝에 result.
   · 내보내기: gainDb = target - lufs, 피크 -1 dBFS 한도, ±24 dB 로 묶음 (export.js)
   ============================================================ */
(function (g) {
  'use strict';
  // BS.1770-4 §2 의 48 kHz 계수. 다른 샘플레이트면 같은 계수를 그대로 쓴다(케이무비 믹스는 항상 48k).
  const HS = { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [-1.69065929318241, 0.73248077421585] };
  const HP = { b: [1.0, -2.0, 1.0], a: [-1.99004745483398, 0.99007225036621] };
  function biq(c) { let x1 = 0, x2 = 0, y1 = 0, y2 = 0; return x => { const y = c.b[0] * x + c.b[1] * x1 + c.b[2] * x2 - c.a[0] * y1 - c.a[1] * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }; }
  const ABS_GATE = -70, REL_GATE = -10;
  function lufsOf(ms) { return ms > 0 ? -0.691 + 10 * Math.log10(ms) : -Infinity; }

  function meter(sr, channels) {
    sr = sr || 48000; channels = channels || 2;
    const blockN = Math.round(sr * 0.4), hopN = Math.round(sr * 0.1);
    const filt = []; for (let c = 0; c < channels; c++) filt.push([biq(HS), biq(HP)]);
    const blocks = [];                  // 블록마다 채널 합 평균 제곱
    const sq = new Float64Array(blockN); // 채널 합산 제곱의 순환 버퍼(400ms)
    let head = 0, fill = 0, run = 0, since = 0, peak = 0, samples = 0;
    function push(chs) {
      const n = chs[0].length;
      for (let i = 0; i < n; i++) {
        let s2 = 0;
        for (let c = 0; c < channels; c++) {
          const x = chs[Math.min(c, chs.length - 1)][i] || 0; const ax = Math.abs(x); if (ax > peak) peak = ax;
          const f = filt[c]; const y = f[1](f[0](x)); s2 += y * y;
        }
        run += s2 - sq[head]; sq[head] = s2; head = (head + 1) % blockN; if (fill < blockN) fill++;
        if (fill === blockN && ++since >= hopN) { since = 0; blocks.push(Math.max(0, run) / blockN); }
        samples++;
      }
    }
    function result() {
      const abs = blocks.filter(b => lufsOf(b) > ABS_GATE);
      if (!abs.length) return { lufs: -Infinity, peak, blocks: blocks.length, samples };
      const rel = lufsOf(abs.reduce((a, b) => a + b, 0) / abs.length) + REL_GATE;
      const gated = abs.filter(b => lufsOf(b) > rel);
      const use = gated.length ? gated : abs;
      return { lufs: lufsOf(use.reduce((a, b) => a + b, 0) / use.length), peak, blocks: blocks.length, samples };
    }
    return { push, result, sr, channels };
  }
  /* 내보내기 게인(dB) — target 에 맞추되 샘플 피크가 -1 dBFS 를 넘지 않게, ±24 dB 안에서 */
  function gainDb(lufs, peak, target) {
    if (!isFinite(lufs)) return 0;
    let gdb = (target == null ? -14 : target) - lufs;
    if (peak > 0) gdb = Math.min(gdb, -1 - 20 * Math.log10(peak));
    return Math.max(-24, Math.min(24, gdb));
  }
  g.KMV_LOUD = { meter, gainDb, lufsOf, ABS_GATE, REL_GATE };
})(typeof window !== 'undefined' ? window : globalThis);
