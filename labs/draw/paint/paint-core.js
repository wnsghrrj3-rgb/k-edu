/* =========================================================================
 * 케이아트 물감 엔진 — paint-core.js  (CPU 참조 구현 · 검산 기준)
 * 상위 설계: draw/물감엔진_설계.md · 구현 SPEC: draw/SPEC_물감엔진_구현.md
 * 이 파일 = SPEC §1(시뮬)·§2(KM 혼색)·§3(붓·도구)·§6(공용 수식)의 CPU 이중화.
 * 셰이더(paint-gl.js)와 동일 수식을 담아 물리를 headless 검산한다(가짜 진척 금지).
 * 수치는 SPEC 고정 — 임의 변경 금지. 손맛 선택지는 ?파라미터 N안으로만 외부화.
 * ========================================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PaintCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * §6 공용 수식 부록 — 결정론 RNG + value noise
   * ------------------------------------------------------------------- */
  function mulberry32(seed) {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // 정수 격자 해시 (SPEC §6)
  function hash2(seed, x, y) {
    return mulberry32(seed ^ (x * 374761393 + y * 668265263));
  }

  // value noise 2D — 이중선형 보간, 옥타브 가중 0.6/0.3
  function valueNoise(seed, x, y, scale) {
    const gx = x / scale, gy = y / scale;
    const x0 = Math.floor(gx), y0 = Math.floor(gy);
    const fx = gx - x0, fy = gy - y0;
    const v00 = hash2(seed, x0, y0);
    const v10 = hash2(seed, x0 + 1, y0);
    const v01 = hash2(seed, x0, y0 + 1);
    const v11 = hash2(seed, x0 + 1, y0 + 1);
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); // smoothstep
    const a = v00 + (v10 - v00) * sx;
    const b = v01 + (v11 - v01) * sx;
    return a + (b - a) * sy;
  }
  // 2옥타브 (가중 0.6/0.3, 정규화)
  function fbm2(seed, x, y, scale) {
    const o1 = valueNoise(seed, x, y, scale);
    const o2 = valueNoise(seed ^ 0x9e3779b9, x, y, scale * 0.5);
    return (o1 * 0.6 + o2 * 0.3) / 0.9;
  }

  /* ---------------------------------------------------------------------
   * §2 KM 혼색 — 이 엔진의 헌법. 12색 K/S 표 + 반사율.
   * K/S 값(r,g,b) = 붓 적재 1회 기준.
   * ------------------------------------------------------------------- */
  const PIGMENTS = {
    yellow: [0.10, 0.14, 2.60],  // 노랑
    orange: [0.10, 1.10, 2.50],  // 주황
    red:    [0.18, 2.40, 2.20],  // 빨강
    lime:   [0.90, 0.12, 2.30],  // 연두
    green:  [1.90, 0.25, 2.00],  // 초록
    teal:   [2.20, 0.30, 0.90],  // 청록
    blue:   [2.30, 1.00, 0.15],  // 파랑
    navy:   [2.60, 1.90, 0.35],  // 남색
    violet: [1.20, 2.30, 0.50],  // 보라
    brown:  [0.70, 1.50, 2.00],  // 갈색
    black:  [2.80, 2.80, 2.80],  // 검정
    // white 은 특례 — PIGMENTS 에 두지 않고 mixWhite() 로 처리
  };

  // 반사율: R(ks) = 1 + ks − sqrt(ks² + 2·ks)  (채널별, 감소함수)
  function reflect(ks) {
    if (ks < 0) ks = 0;
    return 1 + ks - Math.sqrt(ks * ks + 2 * ks);
  }

  // 흰 특례: 기존 pig(누적 K/S) 3채널을 ×0.55 희석 후 +0.02 (SPEC §2, P-7: 가법 금지)
  function mixWhite(pig3) {
    return [
      pig3[0] * 0.55 + 0.02,
      pig3[1] * 0.55 + 0.02,
      pig3[2] * 0.55 + 0.02,
    ];
  }

  // 표시색: R(dry_c + 1.15·pig_c) → 종이 명암 ×(0.94+0.12·ph) → sRGB(γ=1/2.2)
  // dry3/pig3 = 누적 K/S 3채널. ph = 종이 요철 0..1. 반환 = [r,g,b] 0..255.
  function composite(dry3, pig3, ph) {
    const shade = 0.94 + 0.12 * (ph == null ? 0.5 : ph);
    const out = [0, 0, 0];
    for (let c = 0; c < 3; c++) {
      const ks = dry3[c] + 1.15 * pig3[c];
      let lin = reflect(ks) * shade;
      if (lin < 0) lin = 0; else if (lin > 1) lin = 1;
      out[c] = Math.round(Math.pow(lin, 1 / 2.2) * 255);
    }
    return out;
  }

  /* ---------------------------------------------------------------------
   * 매질 파라미터 (SPEC §1②·④·§3)
   * ------------------------------------------------------------------- */
  const MEDIA = {
    watercolor: { mobility: 0.85, gran: 1.0,  wet: 0.30 },
    ink:        { mobility: 0.98, gran: 0.25, wet: 0.34 }, // 수묵(먹)
    gouache:    { mobility: 0.25, gran: 0.15, wet: 0.10 }, // 과슈
    // 유화·아크릴은 §3 전용 경로(높이 필드) — W2. 여기선 §1 폴백 값만 참고.
    acrylic:    { mobility: 0.30, gran: 0.15, wet: 0.10 },
  };

  /* ---------------------------------------------------------------------
   * 종이 5지 (SPEC §4) — ph/pa/pd 필드 생성
   * ------------------------------------------------------------------- */
  const PAPERS = {
    watercolor: { hOct: 2, hScale: 22, hAmp: 1.0,  pa: 0.6,  aniso: 0 },
    hanji:      { hOct: 1, hScale: 36, hAmp: 0.4,  pa: 0.9,  aniso: 0.8 },
    kent:       { hOct: 1, hScale: 14, hAmp: 0.25, pa: 0.35, aniso: 0 },
    canvas:     { weave: true,          pa: 0.0,  aniso: 0 },
    black:      { hOct: 1, hScale: 14, hAmp: 0.25, pa: 0.35, aniso: 0, bg: '#14161a' },
  };

  function makePaper(w, h, kind, seed) {
    kind = kind || 'watercolor';
    seed = seed == null ? 1234 : seed;
    const spec = PAPERS[kind] || PAPERS.watercolor;
    const N = w * h;
    const ph = new Float32Array(N);
    const pa = new Float32Array(N);
    const pd = new Float32Array(N);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let hv;
        if (spec.weave) {
          // 캔버스 직조: 0.5 + 0.25(sin x/3 + sin y/3)
          hv = 0.5 + 0.25 * (Math.sin(x / 3) + Math.sin(y / 3)) * 0.5 + 0.25;
          hv = 0.5 + 0.25 * (Math.sin(x / 3) + Math.sin(y / 3)); // SPEC 원식
          if (hv < 0) hv = 0; else if (hv > 1) hv = 1;
        } else {
          let n;
          if (spec.hOct === 2) {
            n = fbm2(seed, x, y, spec.hScale);
          } else {
            n = valueNoise(seed, x, y, spec.hScale);
          }
          hv = n * spec.hAmp;
        }
        ph[i] = hv;
        pa[i] = spec.pa;
        // 한지 섬유 방향 = 노이즈각
        pd[i] = spec.aniso > 0
          ? (valueNoise(seed ^ 0x55aa55, x, y, spec.hScale) * Math.PI * 2)
          : 0;
      }
    }
    return { w, h, kind, ph, pa, pd, aniso: spec.aniso, bg: spec.bg || '#ffffff' };
  }

  /* ---------------------------------------------------------------------
   * Field — 시뮬 상태. wat / pig(3) / dry(3) / wax / hgt + 종이.
   * ------------------------------------------------------------------- */
  function Field(w, h, opts) {
    opts = opts || {};
    this.w = w; this.h = h;
    const N = w * h;
    this.N = N;
    this.wat = new Float32Array(N);
    this.pig = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
    this.dry = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
    this.wax = new Float32Array(N);
    this.hgt = new Float32Array(N);
    this.salt = new Float32Array(N); // 🧂 소금 잔여 활성 프레임(>0 = 활성)
    this.paper = opts.paper || makePaper(w, h, opts.paperKind || 'watercolor', opts.seed);
    // 손맛 N안 (검수가 고름) — SPEC 기본값
    this.diff = opts.diff === 8 ? 8 : 4;    // ?diff = 4|8
    this.edge = opts.edge != null ? opts.edge : 3.2; // ?edge = 2.2|3.2|4.5
    // 튜닝 상수 (SPEC §1)
    this.kd4 = 0.16; this.kd8 = 0.09;
    this.evap = 0.0012;
    // 커피링 물리 (2026-07-08 오퍼스 보완, SPEC §1-④ 취지 구현):
    //   증발을 테두리에 집중(evapBulk≪evapEdge) → 내부 물은 국소증발 대신 바깥으로 유동,
    //   외향 모세관 드리프트(Deegan)가 용질을 고정 접촉선으로 실어감 → dry 안료가 rim에 축적.
    this.evapBulk = 0.0004;   // 내부(벌크) 증발 — 작게
    this.evapEdge = 0.010;    // 테두리(마른 이웃 보유) 증발 — 크게
    this.stainHold = 5;       // dry 안료 축적 셀의 물붙듬(접촉선 핀) 계수
    this.drift = 1.0;         // 외향 모세관 드리프트 세기
    this.depBase = 0.020; this.depGranK = 0.05;
    this.wetKnee = 0.12;      // 이 수분 이하부터 침착 본격화
    this.frontPull = 0.35;    // 건조 전선 안료 흡인
    this.dryFrontTheta = 0.06;   // θ
    this.dryFrontNeigh = 0.09;
    this.clampMax = 6.0;
    this._local = new Float32Array(N); // 국소 증발(드라이어)
    // 스크래치 버퍼 (동시 갱신)
    this._dw = new Float32Array(N);
    this._dp = [new Float32Array(N), new Float32Array(N), new Float32Array(N)];
    this._prevWat = new Float32Array(N);
  }

  Field.prototype.idx = function (x, y) { return y * this.w + x; };

  Field.prototype.totalWater = function () {
    let s = 0; for (let i = 0; i < this.N; i++) s += this.wat[i]; return s;
  };
  Field.prototype.totalPigment = function () {
    let s = 0;
    for (let c = 0; c < 3; c++) { const p = this.pig[c]; for (let i = 0; i < this.N; i++) s += p[i]; }
    return s;
  };

  /* ---------------------------------------------------------------------
   * §1 시뮬 스텝 — dt=1/60 고정, 순서 ①→⑤ 불변.
   * flags: {diffuse, advect, evaporate, deposit, clamp} — 검산용 부분 활성화.
   * medium: MEDIA 키.
   * ------------------------------------------------------------------- */
  Field.prototype.step = function (medium, flags) {
    medium = medium || 'watercolor';
    const m = MEDIA[medium] || MEDIA.watercolor;
    flags = flags || {};
    const on = function (k) { return flags[k] !== false; };

    const w = this.w, h = this.h, N = this.N;
    const wat = this.wat, pig = this.pig, dry = this.dry, wax = this.wax;
    const ph = this.paper.ph, pd = this.paper.pd, aniso = this.paper.aniso;
    const kd = this.diff === 8 ? this.kd8 : this.kd4;

    const dw = this._dw, dp = this._dp;
    dw.fill(0); dp[0].fill(0); dp[1].fill(0); dp[2].fill(0);

    // 이번 프레임 시작 수분 스냅샷 (건조 전선 검출용)
    this._prevWat.set(wat);

    // 이웃 오프셋
    const off4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const off8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    const off = this.diff === 8 ? off8 : off4;

    // ① 수분 확산 + ② 안료 이류 (동시 — 나간 flow 만큼 안료 동반)
    if (on('diffuse') || on('advect')) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const wi = wat[i];
          if (wi <= 0) continue;
          for (let k = 0; k < off.length; k++) {
            const nx = x + off[k][0], ny = y + off[k][1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = ny * w + nx;
            const wj = wat[j];
            const dh = wi - wj;
            if (dh <= 0) continue;
            // wij = (1 − 0.85·wax[j]) · fiber · pin
            //   pin = 흡수 pinning: 마른 종이(wat[j]≈0)로의 유출을 종이 흡수(pa)만큼 억제.
            //   젖은 경계가 고정돼야 중심→가장자리 보충 유동이 성립(커피링). SPEC §1 wij + §4 pa 취지 구현.
            let fiber = 1;
            if (aniso > 0) {
              const dir = Math.atan2(off[k][1], off[k][0]);
              fiber = 1 + 0.8 * Math.abs(Math.cos(dir - pd[i]));
            }
            const jWet = Math.min(wj / 0.06, 1);
            const pin = 1 - this.paper.pa[j] * (1 - jWet) * 0.97; // 마른 종이 유출 강억제
            const wij = (1 - 0.85 * wax[j]) * fiber * pin;
            let flow = kd * wij * dh;
            if (this.diff === 8 && (off[k][0] !== 0 && off[k][1] !== 0)) {
              flow *= 0.7071; // 대각 거리 보정(안정성) — kd8이 이미 낮음
            }
            // 안정성: 한 셀에서 나가는 총 flow가 wi를 넘지 않도록 자연 감쇠 (kd·이웃수 < 1)
            if (on('diffuse')) { dw[i] -= flow; dw[j] += flow; }
            // ② 안료 이류: Δpig = pig_i · mobility · flow / max(wat_i, 0.02)
            if (on('advect')) {
              const denom = Math.max(wi, 0.02);
              for (let c = 0; c < 3; c++) {
                const pc = pig[c][i];
                if (pc <= 0) continue;
                const dpig = pc * m.mobility * flow / denom;
                dp[c][i] -= dpig; dp[c][j] += dpig;
              }
            }
          }
        }
      }
      // 적용 + [0,1] 클램프(수분)
      for (let i = 0; i < N; i++) {
        wat[i] += dw[i];
        if (wat[i] < 0) wat[i] = 0; else if (wat[i] > 1) wat[i] = 1;
        pig[0][i] += dp[0][i]; pig[1][i] += dp[1][i]; pig[2][i] += dp[2][i];
        if (pig[0][i] < 0) pig[0][i] = 0;
        if (pig[1][i] < 0) pig[1][i] = 0;
        if (pig[2][i] < 0) pig[2][i] = 0;
      }
    }

    // ②' 외향 모세관 드리프트 (Deegan) — 안료만 저수분(마르는) 이웃으로 이동, 물은 동반 안 함.
    //   증발이 테두리에 집중되면 모세관 유동이 용질을 고정 접촉선으로 실어감 = 커피링 핵심.
    //   질량 보존(셀 간 이동만) → 검산 ⑹에 영향 없음. on('advect') 게이트 하에서만 작동.
    if (on('advect') && this.drift > 0) {
      const driftK = this.drift;
      const dpd = this._dp;
      dpd[0].fill(0); dpd[1].fill(0); dpd[2].fill(0);
      const off4d = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const wi = wat[i];
          if (wi <= 0.02) continue; // 마른 셀은 드리프트 없음
          if (pig[0][i] + pig[1][i] + pig[2][i] <= 0) continue;
          let wsum = 0; const ws = [0, 0, 0, 0];
          for (let k = 0; k < 4; k++) {
            const nx = x + off4d[k][0], ny = y + off4d[k][1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const wj = wat[ny * w + nx];
            if (wj > 0.005 && wj < wi) { const dv = wi - wj; ws[k] = dv; wsum += dv; }
          }
          if (wsum <= 0) continue;
          const frac = Math.min(driftK * wsum, 0.5); // 프레임당 유출 비율 상한
          for (let k = 0; k < 4; k++) {
            if (ws[k] <= 0) continue;
            const j = (y + off4d[k][1]) * w + (x + off4d[k][0]);
            const share = frac * (ws[k] / wsum);
            for (let c = 0; c < 3; c++) {
              const mv = pig[c][i] * share;
              dpd[c][i] -= mv; dpd[c][j] += mv;
            }
          }
        }
      }
      for (let c = 0; c < 3; c++) {
        const pc = pig[c], d = dpd[c];
        for (let i = 0; i < N; i++) { pc[i] += d[i]; if (pc[i] < 0) pc[i] = 0; }
      }
    }

    // ③ 증발 — 테두리(마른 이웃 보유 셀)에 집중: 내부 물은 국소증발 대신 바깥으로 유동.
    //   stain 핀: dry 안료 축적 셀은 물을 붙잡아 접촉선을 고정(커피링 성립 조건).
    if (on('evaporate')) {
      const off4e = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const evapBulk = this.evapBulk, evapEdge = this.evapEdge, holdK = this.stainHold;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (wat[i] <= 0) continue;
          let dryN = 0;
          for (let k = 0; k < 4; k++) {
            const nx = x + off4e[k][0], ny = y + off4e[k][1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) { dryN++; continue; }
            if (wat[ny * w + nx] < 0.02) dryN++;
          }
          let ev = evapBulk + evapEdge * (dryN / 4);
          if (holdK > 0) {
            const dsum = dry[0][i] + dry[1][i] + dry[2][i];
            ev *= 1 / (1 + holdK * dsum);
          }
          wat[i] -= ev + this._local[i];
          if (wat[i] < 0) wat[i] = 0;
        }
      }
    }

    // ③' 🧂 소금 — 활성 소금 셀(wat>0.15)은 안료를 바깥으로 밀고(프레임당 0.12) 증발 ×3.
    //   물을 급히 빨아들여 마른 반점을 만들고 안료를 방사형으로 밀어냄 → 별무늬 창발(SPEC §도구·기법6).
    if (on('evaporate') && this._saltActive) {
      const salt = this.salt, off4s = off4;
      const dps = this._dp; dps[0].fill(0); dps[1].fill(0); dps[2].fill(0);
      let anyActive = false;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (salt[i] <= 0) continue;
          if (wat[i] > 0.15) {
            // 증발 ×3(추가분) — 소금이 물을 빨아들임
            wat[i] -= this.evap * 2; if (wat[i] < 0) wat[i] = 0;
            // 안료를 4방으로 밀어냄(총 0.12)
            let nb = 0; const js = [];
            for (let k = 0; k < 4; k++) {
              const nx = x + off4s[k][0], ny = y + off4s[k][1];
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
              js.push(ny * w + nx); nb++;
            }
            if (nb > 0) {
              const share = 0.12 / nb;
              for (let t = 0; t < js.length; t++) {
                const j = js[t];
                for (let c = 0; c < 3; c++) {
                  const mv = pig[c][i] * share;
                  dps[c][i] -= mv; dps[c][j] += mv;
                }
              }
            }
            salt[i] -= 1; // 활성 프레임 소진(젖은 동안만)
          }
          if (salt[i] > 0) anyActive = true;
        }
      }
      for (let c = 0; c < 3; c++) {
        const pc = pig[c], d = dps[c];
        for (let i = 0; i < N; i++) { pc[i] += d[i]; if (pc[i] < 0) pc[i] = 0; }
      }
      this._saltActive = anyActive;
    }

    // ④ 침착 + 건조 전선 에지
    //   젖음 게이팅: 흠뻑 젖은 셀(wat 높음)은 안료가 물에 떠 자유 이동 → 침착 억제.
    //   물이 얕아질수록(마를수록) 정착. 완전 마름(wat≈0)이면 잔여 안료 전량 정착.
    //   = SPEC ④ "건조 전선 검출 → 에지 침착"의 물리적 구현(커피링 성립 조건).
    if (on('deposit')) {
      const gran = m.gran;
      const wetKnee = this.wetKnee;
      const pullK = this.frontPull;
      for (let i = 0; i < N; i++) {
        const wi = wat[i];
        // 젖음 게이트: wi≥wetKnee → ~0.04(미소 상시), wi→0 → 1(전량 정착)
        let gate = 1 - wi / wetKnee;
        if (gate < 0.04) gate = 0.04;
        if (gate > 1) gate = 1;
        // 건조 전선 검출: 이번 프레임 wat이 θ 아래로 내려갔고 && 이웃 max wat > 0.09
        let edgeMul = 1;
        const crossed = (this._prevWat[i] >= this.dryFrontTheta && wi < this.dryFrontTheta);
        if (crossed) {
          const x = i % w, y = (i / w) | 0;
          let nmax = 0;
          const wetJ = [];
          for (let k = 0; k < off4.length; k++) {
            const nx = x + off4[k][0], ny = y + off4[k][1];
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = ny * w + nx;
            const wj = wat[j];
            if (wj > nmax) nmax = wj;
            if (wj > this.dryFrontNeigh) wetJ.push(j);
          }
          if (nmax > this.dryFrontNeigh) {
            edgeMul = this.edge;
            // 증발 흡인: 마르는 전선이 젖은 이웃의 안료를 끌어옴 → 테두리 축적(커피링)
            for (let t = 0; t < wetJ.length; t++) {
              const j = wetJ[t];
              for (let c = 0; c < 3; c++) {
                const draw = pig[c][j] * pullK;
                pig[c][i] += draw; pig[c][j] -= draw;
              }
            }
          }
        }
        const depFactor = (this.depBase + gran * ph[i] * this.depGranK) * edgeMul * gate;
        for (let c = 0; c < 3; c++) {
          const pc = pig[c][i];
          if (pc <= 0) continue;
          let dep = pc * depFactor;
          if (dep > pc) dep = pc;
          dry[c][i] += dep; pig[c][i] -= dep;
        }
      }
    }

    // ⑤ 총량 클램프: dry_c + pig_c ≤ 6.0
    if (on('clamp')) {
      const M = this.clampMax;
      for (let c = 0; c < 3; c++) {
        const dc = dry[c], pc = pig[c];
        for (let i = 0; i < N; i++) {
          const tot = dc[i] + pc[i];
          if (tot > M) {
            const k = M / tot;
            dc[i] *= k; pc[i] *= k;
          }
        }
      }
    }
    return this;
  };

  /* ---------------------------------------------------------------------
   * §3 붓·도구 — 입력 → 필드 연산. cos² 감쇠 주입.
   * ------------------------------------------------------------------- */
  // 원형 스탬프 헬퍼: (cx,cy) 반경 r, cos² 감쇠 콜백
  Field.prototype._stamp = function (cx, cy, r, cb) {
    const w = this.w, h = this.h;
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx, dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > r) continue;
        const t = Math.cos((d / r) * Math.PI * 0.5);
        cb(y * w + x, t * t);
      }
    }
  };

  // 물붓: wat += 0.35·p (안료 0)
  Field.prototype.waterBrush = function (cx, cy, r, p) {
    const self = this;
    this._stamp(cx, cy, r, function (i, f) {
      self.wat[i] = Math.min(1, self.wat[i] + 0.35 * p * f);
    });
    return this;
  };

  // 채색붓: wat += wet·p, pig += K/S·농도·p.
  // opts.dry === true (물0 붓/갈필) → wat 주입 0 + pig 를 종이 봉우리(ph) 가중으로 착색.
  //   (설계서 §3 기법4 갈필 물리 = "마른 붓은 h 봉우리에만 닿는다"의 구현.)
  Field.prototype.colorBrush = function (cx, cy, r, p, color, medium, opts) {
    opts = opts || {};
    const m = MEDIA[medium] || MEDIA.watercolor;
    const ks = PIGMENTS[color] || PIGMENTS.blue;
    const dens = opts.density != null ? opts.density : 1.0; // 붓 안료량 0.5~1.4
    const dryBrush = !!opts.dry;
    const wet = dryBrush ? 0 : m.wet;
    const self = this, ph = this.paper.ph;
    this._stamp(cx, cy, r, function (i, f) {
      if (wet > 0) self.wat[i] = Math.min(1, self.wat[i] + wet * p * f);
      // 갈필: 마른 붓은 종이 봉우리에만 닿음 → smoothstep(0.3,0.8) 봉우리 강조.
      let phw = 1;
      if (dryBrush) {
        const t = (ph[i] - 0.3) / 0.5;
        const s = t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
        phw = 0.08 + 0.92 * s; // 골에도 미소 착색(0 나눗셈 방지), 봉우리 강조
      }
      const amt = dens * p * f * phw;
      self.pig[0][i] += ks[0] * amt;
      self.pig[1][i] += ks[1] * amt;
      self.pig[2][i] += ks[2] * amt;
    });
    return this;
  };

  // 🧻 닦아내기: 반경 내 wat ×0.15, pig ×0.25
  Field.prototype.lift = function (cx, cy, r) {
    const self = this;
    this._stamp(cx, cy, r, function (i, f) {
      const k = 1 - f; // 중심일수록 강하게 흡수
      self.wat[i] *= (0.15 + 0.85 * k);
      for (let c = 0; c < 3; c++) self.pig[c][i] *= (0.25 + 0.75 * k);
    });
    return this;
  };

  // 국소 증발(드라이어): 반경 60px cos 감쇠, local=0.006
  Field.prototype.dryer = function (cx, cy) {
    const self = this;
    this._local.fill(0);
    this._stamp(cx, cy, 60, function (i, f) { self._local[i] = 0.006 * Math.sqrt(f); });
    return this;
  };
  Field.prototype.clearLocal = function () { this._local.fill(0); return this; };

  // 크레용: wax=1 획 + 표시엔 왁스색 dry 직접 기록(§2 우회, 불투명)
  Field.prototype.crayon = function (cx, cy, r, color) {
    const ks = PIGMENTS[color] || PIGMENTS.brown;
    const self = this;
    this._stamp(cx, cy, r, function (i, f) {
      if (f < 0.15) return;
      self.wax[i] = 1;
      // 종이 봉우리에만 닿는 왁스 특성 반영
      const w = self.paper.ph[i];
      self.dry[0][i] += ks[0] * 0.6 * w;
      self.dry[1][i] += ks[1] * 0.6 * w;
      self.dry[2][i] += ks[2] * 0.6 * w;
    });
    return this;
  };

  // 🦋 데칼코마니: 좌우 접기 — 양쪽 = (자기+거울)×0.55, mid 이중합산 금지(P-4)
  Field.prototype.fold = function () {
    const w = this.w, h = this.h;
    const half = (w >> 1);
    const doField = function (arr) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < half; x++) {
          const i = y * w + x;
          const jx = w - 1 - x;
          if (jx === x) continue; // 홀수 폭 중앙열 스킵
          const j = y * w + jx;
          const a = arr[i], b = arr[j];
          arr[i] = (a + b) * 0.55;
          arr[j] = (b + a) * 0.55;
        }
      }
    };
    doField(this.wat);
    for (let c = 0; c < 3; c++) doField(this.pig[c]);
    return this;
  };

  // 🧂 소금: 반경 내 입자 살포(희소). 활성 프레임=40. 젖은 동안 안료를 방사형으로 밀어 별무늬.
  //   (SPEC §도구: wat>0.15인 동안 40프레임 pig 바깥 이동 0.12/f + 증발 ×3 — 스텝 ③′에서 처리.)
  Field.prototype.saltBrush = function (cx, cy, r, seed) {
    const w = this.w, h = this.h;
    let s = (seed == null ? ((cx * 73856093) ^ (cy * 19349663)) >>> 0 : seed) >>> 0;
    const rnd = function () { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (Math.hypot(x - cx, y - cy) > r) continue;
        if (rnd() < 0.22) this.salt[y * w + x] = 40; // 희소 입자
      }
    }
    this._saltActive = true;
    return this;
  };

  // 🪥 스퍼터링(뿌리기): 획 방향 dir ±25° 원뿔로 방울 6~14개(r 2~5px) 산포. 방울=물+안료(시뮬 합류).
  Field.prototype.spatter = function (cx, cy, dir, color, medium, seed) {
    const m = MEDIA[medium] || MEDIA.watercolor;
    const ks = PIGMENTS[color] || PIGMENTS.blue;
    let s = (seed == null ? ((cx * 374761393) ^ (cy * 668265263)) >>> 0 : seed) >>> 0;
    const rnd = function () { s = (s + 0x6d2b79f5) >>> 0; let t = Math.imul(s ^ (s >>> 15), s | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const nDrop = 6 + Math.floor(rnd() * 9); // 6~14
    for (let d = 0; d < nDrop; d++) {
      const ang = dir + (rnd() - 0.5) * (50 * Math.PI / 180); // ±25°
      const dist = 6 + rnd() * 34;
      const dr = 2 + rnd() * 3; // r 2~5
      const dx = cx + Math.cos(ang) * dist, dy = cy + Math.sin(ang) * dist;
      const p = 0.6 + rnd() * 0.5;
      this.colorBrush(dx, dy, dr, p, color, medium, { density: 1.0 });
    }
    return this;
  };

  /* ---------------------------------------------------------------------
   * 렌더 — 필드 → RGBA (Uint8ClampedArray). 데모/검수용.
   * ------------------------------------------------------------------- */
  Field.prototype.render = function (out) {
    const N = this.N;
    const buf = out || new Uint8ClampedArray(N * 4);
    const ph = this.paper.ph;
    for (let i = 0; i < N; i++) {
      const rgb = composite(
        [this.dry[0][i], this.dry[1][i], this.dry[2][i]],
        [this.pig[0][i], this.pig[1][i], this.pig[2][i]],
        ph[i]
      );
      const o = i * 4;
      buf[o] = rgb[0]; buf[o + 1] = rgb[1]; buf[o + 2] = rgb[2]; buf[o + 3] = 255;
    }
    return buf;
  };

  /* ---------------------------------------------------------------------
   * 공개 API
   * ------------------------------------------------------------------- */
  return {
    mulberry32, valueNoise, fbm2,
    PIGMENTS, MEDIA, PAPERS,
    reflect, mixWhite, composite,
    makePaper, Field,
  };
});
