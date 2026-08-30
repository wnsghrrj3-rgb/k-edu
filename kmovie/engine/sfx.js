/* ============================================================
   케이무비 효과음 (KMV_SFX) — 음원·폰트·효과 설계 v1 §3
   ------------------------------------------------------------
   · 합성 18종 — Web Audio 수식만(샘플 없음) → 라이선스 0·결정적.
   · 실음원 슬롯: sfx/index.json 에 같은 이름의 CC0 음원이 있으면 그쪽이 이긴다.
     (없으면 합성. 나중에 좋은 음원을 넣으면 코드 수정 없이 자동 승격.)
   · 전환·부품·자막 카드에 자동으로 붙는다 — 프로젝트 audio.sfx {on, gain} 로 전체 켜고 끔.
     카드가 sfx:false 면 그 카드만 조용히. 자동 컷과 달리 소리는 되돌릴 수 있으니 헌법 밖이 아님.
   ============================================================ */
(function (g) {
  'use strict';

  const SR = 48000, TAU = Math.PI * 2;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  function rnd(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* 공통 조각 */
  function noise(n, seed) { const R = rnd(seed), x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = R() * 2 - 1; return x; }
  function bp(x, sr, f0, f1, q) {          // 시간에 따라 중심이 움직이는 간이 밴드패스(2극 상태변수)
    const n = x.length, out = new Float32Array(n); let lo = 0, ba = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n, fc = f0 + (f1 - f0) * t, f = 2 * Math.sin(Math.PI * Math.min(0.45, fc / sr)), qq = 1 / (q || 1);
      lo += f * ba; const hi = x[i] - lo - qq * ba; ba += f * hi; out[i] = ba;
    }
    return out;
  }
  function lp(x, sr, fc) { const k = Math.exp(-TAU * fc / sr), out = new Float32Array(x.length); let y = 0; for (let i = 0; i < x.length; i++) { y = y * k + x[i] * (1 - k); out[i] = y; } return out; }
  function hp(x) { const out = new Float32Array(x.length); let p = 0; for (let i = 0; i < x.length; i++) { out[i] = x[i] - p; p = x[i]; } return out; }
  function decay(x, sr, tau, atk) { for (let i = 0; i < x.length; i++) { const t = i / sr; let e = Math.exp(-t / tau); if (atk && t < atk) e *= t / atk; x[i] *= e; } return x; }
  function rev(x, sr, wet) { const d = Math.round(0.031 * sr); for (let i = d; i < x.length; i++) x[i] += x[i - d] * 0.5 * wet; return x; }
  function norm(x, peak) { let mx = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > mx) mx = a; } if (mx > 1e-6) { const k = (peak || 0.7) / mx; for (let i = 0; i < x.length; i++) x[i] *= k; } return x; }

  /* ---------- 합성 18종 ---------- */
  const LIST = [
    { id: 'whooshShort', ko: '우시 짧게', cat: 'move', dur: 0.35, make: (sr, d) => { const n = d * sr | 0; let x = bp(noise(n, 11), sr, 400, 2600, 1.1); return norm(decay(x, sr, 0.14, 0.02), 0.55); } },
    { id: 'whooshLong', ko: '우시 길게', cat: 'move', dur: 0.75, make: (sr, d) => { const n = d * sr | 0; let x = bp(noise(n, 12), sr, 300, 3400, 1.0); for (let i = 0; i < n; i++) { const t = i / sr, e = t < 0.45 ? t / 0.45 : Math.exp(-(t - 0.45) / 0.16); x[i] *= e; } return norm(x, 0.55); } },
    { id: 'riser', ko: '라이저', cat: 'move', dur: 1.2, make: (sr, d) => { const n = d * sr | 0; let x = bp(noise(n, 13), sr, 260, 5200, 1.6); for (let i = 0; i < n; i++) x[i] *= Math.pow(i / n, 1.8); return norm(x, 0.5); } },
    { id: 'impactLow', ko: '임팩트 낮게', cat: 'impact', dur: 0.9, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n), R = rnd(21); for (let i = 0; i < n; i++) { const t = i / sr, f = 42 + 70 * Math.exp(-t / 0.05); x[i] = Math.sin(TAU * f * t) * Math.exp(-t / 0.22) + (t < 0.01 ? (R() - 0.5) * 0.8 * (1 - t / 0.01) : 0); } return norm(rev(x, sr, 0.5), 0.75); } },
    { id: 'impactSoft', ko: '임팩트 부드럽게', cat: 'impact', dur: 0.8, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr, f = 58 + 40 * Math.exp(-t / 0.07); x[i] = Math.sin(TAU * f * t) * Math.exp(-t / 0.2); } return norm(lp(rev(x, sr, 0.6), sr, 900), 0.5); } },
    { id: 'subBoom', ko: '서브 붐', cat: 'impact', dur: 1.0, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = Math.sin(TAU * 45 * t) * Math.exp(-t / 0.3) * (t < 0.008 ? t / 0.008 : 1); } return norm(x, 0.7); } },
    { id: 'lightSweep', ko: '빛 스윕', cat: 'light', dur: 0.8, make: (sr, d) => { const n = d * sr | 0, x = hp(noise(n, 31)); const y = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr, e = Math.sin(Math.PI * Math.min(1, t / d)); y[i] = x[i] * e * 0.5 + Math.sin(TAU * 2400 * t) * e * 0.12 * Math.exp(-t / 0.4); } return norm(rev(y, sr, 0.7), 0.42); } },
    { id: 'sparkle', ko: '반짝', cat: 'light', dur: 0.9, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); const f = [2093, 3136]; f.forEach((fq, k) => { const off = Math.round(k * 0.06 * sr); for (let i = off; i < n; i++) { const t = (i - off) / sr; x[i] += Math.sin(TAU * fq * t + 2.4 * Math.exp(-t / 0.1) * Math.sin(TAU * fq * 3.4 * t)) * Math.exp(-t / 0.24) * 0.5; } }); return norm(rev(x, sr, 0.8), 0.4); } },
    { id: 'ding', ko: '딩', cat: 'light', dur: 1.6, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = Math.sin(TAU * 1568 * t + 2.6 * Math.exp(-t / 0.18) * Math.sin(TAU * 1568 * 3.47 * t)) * Math.exp(-t / 0.55) * (t < 0.003 ? t / 0.003 : 1); } return norm(rev(x, sr, 0.9), 0.42); } },
    { id: 'typeTick', ko: '타자 틱', cat: 'ui', dur: 0.06, make: (sr, d) => { const n = d * sr | 0; return norm(decay(hp(noise(n, 41)), sr, 0.006, 0.0005), 0.3); } },
    { id: 'paper', ko: '종이 넘김', cat: 'ui', dur: 0.4, make: (sr, d) => { const n = d * sr | 0; let x = bp(noise(n, 42), sr, 1800, 700, 0.8); for (let i = 0; i < n; i++) { const t = i / sr; x[i] *= Math.exp(-t / 0.11) * (t < 0.01 ? t / 0.01 : 1); } return norm(x, 0.36); } },
    { id: 'click', ko: '클릭', cat: 'ui', dur: 0.05, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = Math.sin(TAU * 1800 * t) * Math.exp(-t / 0.004); } return norm(x, 0.3); } },
    { id: 'popSoft', ko: '팝 부드럽게', cat: 'ui', dur: 0.18, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr, f = 780 * Math.exp(-t / 0.03) + 180; x[i] = Math.sin(TAU * f * t) * Math.exp(-t / 0.035) * (t < 0.002 ? t / 0.002 : 1); } return norm(lp(x, sr, 3000), 0.34); } },
    { id: 'filmRoll', ko: '필름 롤', cat: 'texture', dur: 0.9, make: (sr, d) => { const n = d * sr | 0, nz = lp(noise(n, 51), sr, 240), x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr, pulse = 0.5 + 0.5 * Math.sin(TAU * 24 * t); x[i] = nz[i] * pulse * Math.exp(-t / 0.5); } return norm(x, 0.3); } },
    { id: 'breath', ko: '숨', cat: 'texture', dur: 1.1, make: (sr, d) => { const n = d * sr | 0, x = lp(noise(n, 52), sr, 700); for (let i = 0; i < n; i++) { const t = i / sr; x[i] *= Math.min(1, t / 0.6) * Math.exp(-Math.max(0, t - 0.7) / 0.25); } return norm(x, 0.24); } },
    { id: 'cadence', ko: '잔향 종지', cat: 'light', dur: 2.6, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n), f = [523.25, 659.25, 783.99]; f.forEach((fq, k) => { for (let i = 0; i < n; i++) { const t = i / sr; x[i] += Math.sin(TAU * fq * t + 1.8 * Math.exp(-t / 0.3) * Math.sin(TAU * fq * 2.01 * t)) * Math.exp(-t / (0.9 + k * 0.1)) * 0.33; } }); return norm(rev(rev(x, sr, 0.9), sr, 0.7), 0.4); } },
    { id: 'shutter', ko: '셔터', cat: 'ui', dur: 0.28, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n), nz = hp(noise(n, 61)); [0, 0.07].forEach(off => { const o = Math.round(off * sr); for (let i = o; i < n; i++) { const t = (i - o) / sr; x[i] += nz[i] * Math.exp(-t / 0.012); } }); return norm(x, 0.4); } },
    { id: 'countTick', ko: '카운트 틱', cat: 'ui', dur: 0.1, make: (sr, d) => { const n = d * sr | 0, x = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = Math.sin(TAU * 2600 * t) * Math.exp(-t / 0.012); } return norm(hp(x), 0.26); } },
  ];
  const CATS = [{ id: 'move', name: '움직임' }, { id: 'impact', name: '임팩트' }, { id: 'light', name: '빛·벨' }, { id: 'ui', name: '작은 소리' }, { id: 'texture', name: '질감' }];
  const byId = id => LIST.find(s => s.id === id) || null;

  /* ---------- 자동 매핑 ---------- */
  const TR_SFX = {                       // 전환 종류 → 효과음
    dissolve: null, cut: null,
    dipBlack: 'impactSoft', dipWhite: 'lightSweep',
    push: 'whooshShort', cover: 'whooshShort', wipe: 'whooshShort',
    zoom: 'whooshLong', whip: 'whooshLong',
    sweep: 'lightSweep', lightleak: 'lightSweep', blur: 'breath',
  };
  const PART_SFX = {                     // 부품 → 효과음
    opening: 'subBoom', section: 'impactSoft', knockout: 'impactLow', lower3rd: 'popSoft',
    counter: 'countTick', tag: 'popSoft', quote: 'ding', chapter: 'paper', credits: 'cadence',
    list: 'click', sweep: 'lightSweep', lightleak: 'filmRoll',
  };
  const SUB_SFX = { type: 'typeTick', gold: 'sparkle', bar: 'popSoft', caption: 'click' };
  const GAINS = { subBoom: 0.9, cadence: 0.8, riser: 0.7, typeTick: 0.5, countTick: 0.5, click: 0.5 };

  /* 프로젝트에서 효과음 이벤트 뽑기 → [{at(프레임), id, gain}] (시각순) */
  function events() {
    const P = g.KMV_PROJECT, D = P && P.data; if (!D) return [];
    const S = D.audio && D.audio.sfx;
    if (!S || !S.on) return [];
    const out = [];
    const add = (at, id, k) => { if (!id || !byId(id)) return; out.push({ at: Math.max(0, Math.round(at)), id, gain: (GAINS[id] || 1) * (k || 1) }); };
    for (const c of D.V) {
      if (c.gap || c.sfx === false) continue;
      const tr = c.transIn; if (!tr || tr.type === 'cut') continue;
      add(c.at, TR_SFX[tr.type], 1);
    }
    for (const p of (D.P || [])) { if (p.sfx === false) continue; add(p.at, PART_SFX[p.part], 1); }
    for (const s of (D.S || [])) { if (s.sfx === false) continue; add(s.at, SUB_SFX[s.style], 0.85); }
    out.sort((a, b) => a.at - b.at);
    // 같은 자리에 같은 소리가 겹치면 한 번만 (전환+부품이 같은 프레임에 몰릴 때)
    return out.filter((e, i) => !(i && out[i - 1].id === e.id && e.at - out[i - 1].at < 3));
  }

  /* ---------- 버퍼 ---------- */
  const bufCache = new Map();
  let real = null;                        // sfx/index.json (실음원) — 있으면 우선
  function loadReal(base) {
    if (real) return Promise.resolve(real);
    return fetch((base || 'sfx/') + 'index.json').then(r => r.ok ? r.json() : null).then(j => { real = j || {}; return real; }).catch(() => { real = {}; return real; });
  }
  function buffer(actx, id) {
    const def = byId(id); if (!def) return null;
    const key = id;
    if (bufCache.has(key)) return bufCache.get(key);
    const x = def.make(SR, def.dur);
    const buf = actx.createBuffer(1, x.length, SR);
    buf.copyToChannel(x, 0);
    bufCache.set(key, buf);
    return buf;
  }
  /* 미리듣기 한 방 */
  function preview(id) {
    const A = g.KMV_AUDIO, actx = A.ctx(), buf = buffer(actx, id); if (!buf) return;
    if (actx.state !== 'running') actx.resume().catch(() => {});
    const n = actx.createBufferSource(), gn = actx.createGain();
    n.buffer = buf; gn.gain.value = 0.9; n.connect(gn); gn.connect(actx.destination); n.start();
  }

  g.KMV_SFX = { LIST, CATS, SR, byId, events, buffer, preview, loadReal, TR_SFX, PART_SFX, SUB_SFX,
    _clearCache: () => bufCache.clear() };
})(typeof window !== 'undefined' ? window : globalThis);
