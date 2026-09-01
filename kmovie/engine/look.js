/* ============================================================
   케이무비 룩 (KMV_LOOK) — 설계서 v1 §2-2 / §4 3단계
   ------------------------------------------------------------
   프레임 하나에 대해: 노출 정규화 → LUT(클립 → 없으면 프로젝트) → 밝기·대비·채도 → 비네트 → 시네마 바
   · LUT 는 kmake/parts/lut/*.cube 를 그대로 fetch (복사 0). 3D 텍스처 trilinear.
   · WebGL2 한 패스. 결정적(같은 입력 → 같은 출력). 미리보기·내보내기 같은 함수.
   · WebGL2 가 없으면 CPU 경로(느리지만 같은 수식)로 떨어진다.
   · 켄 번즈는 룩 앞 단계 — kenburns(c, t) 가 변환(scale·dx·dy)만 준다. 그리기는 render.js.
   · 노출 자동 맞춤: 미디어 썸네일(1초 간격)로 평균 휘도·대비를 재고 프로젝트 목표값으로 정규화.
     휴리스틱이다 — "안 한 것보다 확실히 나은" 수준. 강도 슬라이더로 덮는다.
   ============================================================ */
(function (g) {
  'use strict';

  const LUT_BASE = '../kmake/parts/lut/';
  const LUTS = [
    { id: 'cinema-navy',      name: '시네마 네이비', hint: '금성초 브랜드 · 인터뷰·소개 컷' },
    { id: 'classroom-bright', name: '밝은 교실',     hint: '화사하고 깨끗 · 수업·활동 컷' },
    { id: 'warm-memory',      name: '따뜻한 회상',   hint: '행사 기록·추억 컷' },
  ];
  const KENBURNS = [
    { id: 'push', name: '푸시인' }, { id: 'pull', name: '풀아웃' }, { id: 'panL', name: '팬 좌→우' }, { id: 'panR', name: '팬 우→좌' },
  ];
  const KB_AMOUNT = 0.065;                              // 5~8% 이동 (설계서)
  function outCubic(u) { return 1 - Math.pow(1 - u, 3); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- .cube 파싱 ---------- */
  function parseCube(text) {
    const lines = text.split(/\r?\n/); let N = 33; const data = [];
    for (const ln of lines) {
      const s = ln.trim(); if (!s || s[0] === '#' || /^[A-Z_]/.test(s)) { const m = /^LUT_3D_SIZE\s+(\d+)/.exec(s); if (m) N = +m[1]; continue; }
      const p = s.split(/\s+/); if (p.length >= 3) data.push(+p[0], +p[1], +p[2]);
    }
    if (data.length !== N * N * N * 3) throw new Error('cube 크기 불일치');
    const u8 = new Uint8Array(N * N * N * 3);
    for (let i = 0; i < data.length; i++) u8[i] = Math.round(clamp(data[i], 0, 1) * 255);
    return { N, data: u8 };
  }
  const cubes = new Map();                              // id → {N,data}  (또는 Promise)
  let readyP = null;
  function ready() {
    if (readyP) return readyP;
    readyP = Promise.all(LUTS.map(l => fetch(LUT_BASE + l.id + '.cube').then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(t => { cubes.set(l.id, parseCube(t)); }).catch(e => { console.warn('LUT 못 읽음', l.id, e); })));
    return readyP;
  }

  /* ---------- 노출 통계 (미디어별, 썸네일 기반) ---------- */
  const statCache = new Map();                          // mediaId → {luma, contrast, n}
  const scv = (typeof OffscreenCanvas !== 'undefined') ? new OffscreenCanvas(64, 36) : null;
  const sctx = scv && scv.getContext('2d', { willReadFrequently: true });
  function stats(mediaId) {
    const M = g.KMV_MEDIA, src = M && M.get(mediaId); if (!src || !sctx) return null;
    const thumbs = (src.thumbs || []).filter(Boolean);
    const cached = statCache.get(mediaId);
    if (cached && cached.n === thumbs.length) return cached;
    if (!thumbs.length) return null;
    let sum = 0, sum2 = 0, cnt = 0, sr = 0, sg = 0, sb = 0;
    const step = Math.max(1, Math.floor(thumbs.length / 24));
    for (let i = 0; i < thumbs.length; i += step) {
      try { sctx.drawImage(thumbs[i], 0, 0, 64, 36); } catch (e) { continue; }
      const d = sctx.getImageData(0, 0, 64, 36).data;
      for (let j = 0; j < d.length; j += 4) { const l = (0.2126 * d[j] + 0.7152 * d[j + 1] + 0.0722 * d[j + 2]) / 255; sum += l; sum2 += l * l; cnt++; sr += d[j]; sg += d[j + 1]; sb += d[j + 2]; }
    }
    if (!cnt) return null;
    const mean = sum / cnt, sd = Math.sqrt(Math.max(0, sum2 / cnt - mean * mean));
    const st = { luma: mean, contrast: sd, n: thumbs.length, r: sr / cnt / 255, g: sg / cnt / 255, b: sb / cnt / 255 };
    statCache.set(mediaId, st); return st;
  }
  /* 노출 정규화 계수 — out = (in - luma) * gain + target.luma + offset 형태를 gain/offset 두 개로 */
  function exposure(c, look) {
    if (!look || !look.autoExpose) return { gain: 1, off: 0 };
    const st = stats(c.media); if (!st) return { gain: 1, off: 0 };
    const tg = look.target || { luma: 0.48, contrast: 1 };
    const tgSd = 0.19 * (tg.contrast || 1);              // 보통 영상의 표준편차 ≈ 0.19
    const k = clamp(look.autoStrength == null ? 1 : look.autoStrength, 0, 1);
    let gain = st.contrast > 0.02 ? tgSd / st.contrast : 1; gain = clamp(gain, 0.75, 1.35);
    gain = 1 + (gain - 1) * k;
    const off = ((tg.luma || 0.48) - st.luma) * k;
    return { gain, off: clamp(off, -0.18, 0.18) };
  }

  /* 색 맞춤(컬러 매치) — 그레이 월드: 원본의 채널 평균이 서로 같아지도록(색 온도가 다른 클립들을 한 작품처럼).
     리졸브 "Color Match"·프리미어 "Comparison View → Match" 의 자동 부분. 채널 게인 0.8~1.25 로 묶고 strength 로 섞는다. */
  function whiteBalance(c, look) {
    if (!look || !look.colorMatch) return [1, 1, 1];
    const st = stats(c.media); if (!st || st.r == null) return [1, 1, 1];
    const cl = c.look || {}; if (cl.colorMatch === false) return [1, 1, 1];
    const k = clamp(look.matchStrength == null ? 0.8 : look.matchStrength, 0, 1), m = (st.r + st.g + st.b) / 3; if (m < 0.02) return [1, 1, 1];
    return [st.r, st.g, st.b].map(v => 1 + (clamp(m / Math.max(0.02, v), 0.8, 1.25) - 1) * k);
  }

  /* ---------- 켄 번즈 ---------- */
  function kenburns(c, t) {
    if (!c.kenburns) return null;
    const u = outCubic(clamp((t - c.at) / Math.max(1, c.dur), 0, 1)), a = KB_AMOUNT;
    switch (c.kenburns) {
      case 'push': return { s: 1 + a * u, dx: 0, dy: 0 };
      case 'pull': return { s: 1 + a * (1 - u), dx: 0, dy: 0 };
      case 'panL': return { s: 1 + a, dx: -a / 2 + a * u, dy: 0 };   // 좌 → 우 (화면이 오른쪽 내용으로 이동)
      case 'panR': return { s: 1 + a, dx: a / 2 - a * u, dy: 0 };
    }
    return null;
  }

  /* ---------- WebGL2 ---------- */
  const VS = `#version 300 es
  in vec2 a; out vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`;
  const FS = `#version 300 es
  precision highp float; precision highp sampler3D;
  in vec2 v; out vec4 o;
  uniform sampler2D src; uniform sampler3D lut; uniform float lutN;
  uniform float uUseLut, uStrength, uGain, uOff, uBright, uContrast, uSat, uVig; uniform vec3 uWB;
  void main(){
    vec3 c = texture(src, v).rgb * uWB;
    // 1. 노출 정규화 (중간 회색 기준 대비 gain, 평균 이동 off)
    c = (c - 0.5) * uGain + 0.5 + uOff;
    c = clamp(c, 0.0, 1.0);
    // 2. LUT (trilinear, 격자 중심 보정)
    if (uUseLut > 0.5) {
      vec3 q = c * (lutN - 1.0) / lutN + 0.5 / lutN;
      vec3 l = texture(lut, q).rgb;
      c = mix(c, l, uStrength);
    }
    // 3. 밝기·대비·채도
    c = c + uBright;
    c = (c - 0.5) * uContrast + 0.5;
    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = mix(vec3(lum), c, uSat);
    // 4. 비네트 (가장자리 어둡게, 부드럽게)
    if (uVig > 0.001) {
      vec2 d = (v - 0.5) * vec2(1.0, 0.5625 * 1.0);
      float r = length(d) * 1.9;
      float vg = smoothstep(0.45, 1.25, r);
      c *= 1.0 - uVig * vg * 0.75;
    }
    o = vec4(clamp(c, 0.0, 1.0), 1.0);
  }`;
  let GL = null;                                        // {gl, canvas, prog, srcTex, lutTex:Map, u}
  function initGL(W, H) {
    if (GL === false) return null;
    if (GL) { if (GL.canvas.width !== W || GL.canvas.height !== H) { GL.canvas.width = W; GL.canvas.height = H; GL.gl.viewport(0, 0, W, H); } return GL; }
    try {
      const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
      const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false });
      if (!gl) { GL = false; return null; }
      const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
      const prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const srcTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const u = {}; ['src', 'lut', 'lutN', 'uUseLut', 'uStrength', 'uGain', 'uOff', 'uBright', 'uContrast', 'uSat', 'uVig', 'uWB'].forEach(n => { u[n] = gl.getUniformLocation(prog, n); });
      gl.uniform1i(u.src, 0); gl.uniform1i(u.lut, 1);
      gl.viewport(0, 0, W, H);
      GL = { gl, canvas, prog, srcTex, lutTex: new Map(), u };
      return GL;
    } catch (e) { console.warn('룩 WebGL 불가 → CPU 경로', e); GL = false; return null; }
  }
  function lutTexture(G, id) {
    if (G.lutTex.has(id)) return G.lutTex.get(id);
    const cube = cubes.get(id); if (!cube) return null;
    const gl = G.gl, tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_3D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGB8, cube.N, cube.N, cube.N, 0, gl.RGB, gl.UNSIGNED_BYTE, cube.data);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    G.lutTex.set(id, { tex, N: cube.N }); return G.lutTex.get(id);
  }

  /* 클립·프로젝트 룩 → 실제 파라미터 */
  function resolve(c, look) {
    look = look || {};
    const cl = c.look || {};
    const lut = cl.lut === undefined ? (look.lut || null) : cl.lut;        // 클립 lut: undefined=프로젝트 따름, null=없음
    const strength = cl.strength != null ? cl.strength : (look.strength == null ? 0.6 : look.strength);
    const ex = exposure(c, look);
    return {
      lut: lut && cubes.has(lut) ? lut : null, strength: clamp(strength, 0, 1),
      gain: ex.gain, off: ex.off, wb: whiteBalance(c, look),
      bright: clamp(cl.bright || 0, -0.3, 0.3), contrast: clamp(cl.contrast == null ? 1 : cl.contrast, 0.5, 1.6), sat: clamp(cl.sat == null ? 1 : cl.sat, 0, 1.8),
      vig: clamp(look.vignette || 0, 0, 1), cinemaBar: !!look.cinemaBar,
    };
  }
  function isIdentity(p) { return !p.lut && p.gain === 1 && p.off === 0 && p.wb[0] === 1 && p.wb[1] === 1 && p.wb[2] === 1 && p.bright === 0 && p.contrast === 1 && p.sat === 1 && p.vig === 0; }

  /* CPU 경로 — 같은 수식 (WebGL 없을 때만) */
  function applyCPU(ctx, W, H, p) {
    const im = ctx.getImageData(0, 0, W, H), d = im.data, cube = p.lut && cubes.get(p.lut), N = cube && cube.N;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] / 255 * p.wb[0], gg = d[i + 1] / 255 * p.wb[1], b = d[i + 2] / 255 * p.wb[2];
      r = clamp((r - 0.5) * p.gain + 0.5 + p.off, 0, 1); gg = clamp((gg - 0.5) * p.gain + 0.5 + p.off, 0, 1); b = clamp((b - 0.5) * p.gain + 0.5 + p.off, 0, 1);
      if (cube) { const ri = Math.round(r * (N - 1)), gi = Math.round(gg * (N - 1)), bi = Math.round(b * (N - 1)), k = ((bi * N + gi) * N + ri) * 3;
        r += (cube.data[k] / 255 - r) * p.strength; gg += (cube.data[k + 1] / 255 - gg) * p.strength; b += (cube.data[k + 2] / 255 - b) * p.strength; }
      r = (r + p.bright - 0.5) * p.contrast + 0.5; gg = (gg + p.bright - 0.5) * p.contrast + 0.5; b = (b + p.bright - 0.5) * p.contrast + 0.5;
      const l = 0.2126 * r + 0.7152 * gg + 0.0722 * b; r = l + (r - l) * p.sat; gg = l + (gg - l) * p.sat; b = l + (b - l) * p.sat;
      if (p.vig > 0.001) { const x = ((i / 4) % W) / W - 0.5, y = Math.floor(i / 4 / W) / H - 0.5, rr = Math.sqrt(x * x + y * y * 0.316) * 1.9, vg = clamp((rr - 0.45) / 0.8, 0, 1); const m = 1 - p.vig * vg * vg * (3 - 2 * vg) * 0.75; r *= m; gg *= m; b *= m; }
      d[i] = clamp(r, 0, 1) * 255; d[i + 1] = clamp(gg, 0, 1) * 255; d[i + 2] = clamp(b, 0, 1) * 255;
    }
    ctx.putImageData(im, 0, 0);
  }

  /* 핵심: ctx 에 그려진 프레임을 제자리에서 룩 처리 */
  function apply(ctx, W, H, t, c, look) {
    const p = resolve(c, look);
    if (!isIdentity(p)) {
      const G = initGL(W, H);
      if (G) {
        const gl = G.gl;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.srcTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        const L = p.lut ? lutTexture(G, p.lut) : null;
        if (L) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_3D, L.tex); gl.uniform1f(G.u.lutN, L.N); }
        gl.uniform1f(G.u.uUseLut, L ? 1 : 0); gl.uniform1f(G.u.uStrength, p.strength);
        gl.uniform1f(G.u.uGain, p.gain); gl.uniform1f(G.u.uOff, p.off); gl.uniform3f(G.u.uWB, p.wb[0], p.wb[1], p.wb[2]);
        gl.uniform1f(G.u.uBright, p.bright); gl.uniform1f(G.u.uContrast, p.contrast); gl.uniform1f(G.u.uSat, p.sat); gl.uniform1f(G.u.uVig, p.vig);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(G.canvas, 0, 0, W, H);
      } else applyCPU(ctx, W, H, p);
    }
    if (p.cinemaBar && W > H) {                         // 2.39:1 레터박스 (가로 화면에서만)
      const bh = Math.round((H - W / 2.39) / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    }
  }

  g.KMV_LOOK = { LUTS, KENBURNS, ready, apply, applyCPU, kenburns, stats, resolve, exposure, whiteBalance, hasLut: id => cubes.has(id), _parseCube: parseCube };
})(typeof window !== 'undefined' ? window : globalThis);
