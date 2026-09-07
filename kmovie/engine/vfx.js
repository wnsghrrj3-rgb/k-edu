/* ============================================================
   케이무비 화면 효과 (KMV_VFX) — 「타이틀·꾸미기」 의 「화면 효과」 분류 21종
   ------------------------------------------------------------
   프리미어·리졸브에서 늘 쓰는 것들을 "부품" 으로 — 카드를 P 레인에 놓기만.
   자유 노브 대신 프리셋(세기 3단 + 종류) — 헌법(키프레임·마스크·이펙트 목록 없음) 안.

   두 부류:
   · 덮는 효과(overlay) — 그레인·비네팅·플레어·빛줄기·먼지·꽃잎·보케·스포트라이트·레터박스 …
   · 화면을 다시 만드는 효과(frame) — 글로우·소프트포커스·틸트시프트·글리치·색 분리·줌 펀치·
     흔들림·오래된 필름·듀오톤·프레임: 지금까지 합성된 화면(ctx.canvas)을 찍어 두고 가공해 다시 그린다.
     (뒤에 그려지는 자막·부품보다 앞에 있는 카드는 그것까지 함께 가공 — 조정 레이어와 같은 자리)

   결정성: 같은 (t, p) 면 같은 그림 — 무작위는 전부 프레임 번호 해시. 미리보기 = 내보내기.
   시간: META.loop 부품은 카드를 늘여도 그대로 흐른다(재매핑 없음). 카드 길이는 p._len(초) 로 받는다.
   ============================================================ */
(function (g) {
  'use strict';
  var K = g.KM_PARTS; if (!K) return;
  var E = K.E, clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var FPS = 30;
  var AMT = { soft: 0.55, mid: 1, strong: 1.7 };
  function amt(p) { return AMT[p.amt] || 1; }
  function fi(t) { return Math.floor(t * FPS + 1e-4); }
  /* 정수 해시 → [0,1) */
  function h1(n) { n = (n | 0) + 0x9E3779B9; n = Math.imul(n ^ (n >>> 16), 0x85EBCA6B); n = Math.imul(n ^ (n >>> 13), 0xC2B2AE35); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
  function h2(a, b) { return h1(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)); }
  /* 부드러운 잡음(1D) — 해시 격자 사이 보간 */
  function snoise(x, seed) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (h2(i, seed) * (1 - u) + h2(i + 1, seed) * u) * 2 - 1; }
  /* 카드 길이(초) — 카드에서 왔으면 그것, 아니면 부품 기본 길이 */
  function len(p, d) { return p._len > 0 ? p._len : d; }
  /* 등장·퇴장 봉투 — 처음/끝 0.35초 */
  function env(t, p, d, e) { e = e || 0.35; var L = len(p, d); return clamp(Math.min(t / e, (L - t) / e), 0, 1); }
  var hasFilter = function (ctx) { return 'filter' in ctx; };

  /* ---------- 임시 캔버스(스냅샷·가공) ---------- */
  var scratch = [null, null];
  function cv(i, W, H) {
    var c = scratch[i];
    if (!c) c = scratch[i] = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
    var x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
    return c;
  }
  /* 지금까지 그려진 화면을 찍는다(0번 캔버스) — 호출 뒤 ctx 는 원래 그림 그대로 */
  function snap(ctx, W, H) {
    var s = cv(0, W, H), x = s.getContext('2d');
    x.clearRect(0, 0, W, H);
    try { x.drawImage(ctx.canvas, 0, 0, W, H, 0, 0, W, H); } catch (e) { return null; }
    return s;
  }
  function reset(ctx) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; }

  /* ---------- 그레인 타일(4장, 결정적) ---------- */
  var grainTiles = null;
  function grains() {
    if (grainTiles) return grainTiles;
    grainTiles = [];
    for (var k = 0; k < 4; k++) {
      var N = 256, c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(N, N) : Object.assign(document.createElement('canvas'), { width: N, height: N });
      var x = c.getContext('2d'), im = x.createImageData(N, N), d = im.data;
      for (var i = 0; i < N * N; i++) { var v = Math.round(h2(i, 101 + k) * 255); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
      x.putImageData(im, 0, 0); grainTiles.push(c);
    }
    return grainTiles;
  }
  function drawGrain(ctx, W, H, t, a, size) {
    var tiles = grains(), f = fi(t), tile = tiles[f & 3], ox = Math.floor(h2(f, 7) * 256), oy = Math.floor(h2(f, 8) * 256);
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = clamp(a, 0, 1);
    ctx.translate(-ox * size, -oy * size); ctx.scale(size, size);
    var pat = ctx.createPattern(tile, 'repeat'); ctx.fillStyle = pat; ctx.fillRect(0, 0, W / size + 256, H / size + 256);
    ctx.restore();
  }
  function vignette(ctx, W, H, a, inner) {
    var r = Math.hypot(W, H) * 0.5, gr = ctx.createRadialGradient(W / 2, H / 2, r * (inner == null ? 0.45 : inner), W / 2, H / 2, r * 1.02);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + clamp(a, 0, 1) + ')');
    ctx.save(); reset(ctx); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function hexRGB(hex) { hex = hex.replace('#', ''); var n = parseInt(hex, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + clamp(a, 0, 1) + ')'; }
  var AMT_FIELD = { k: 'amt', label: '세기', def: 'mid', opts: ['soft', 'mid', 'strong'] };
  var POS3 = { topleft: [0.14, 0.18], top: [0.5, 0.12], topright: [0.86, 0.18], center: [0.5, 0.5], left: [0.14, 0.5], right: [0.86, 0.5] };

  /* ============================================================
     1. 필름 그레인
     ============================================================ */
  K.register({
    id: 'vfxGrain', name: '필름 그레인', dur: 6,
    fields: [AMT_FIELD, { k: 'size', label: '입자', def: 'fine', opts: ['fine', 'coarse'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.25); if (e <= 0) return;
      drawGrain(ctx, W, H, t, 0.2 * a * e, (p.size === 'coarse' ? 2 : 1) * Math.max(1, W / 1280));
    },
  });

  /* ============================================================
     2. 비네팅
     ============================================================ */
  K.register({
    id: 'vfxVignette', name: '비네팅', dur: 6,
    fields: [AMT_FIELD, { k: 'shape', label: '모양', def: 'soft', opts: ['soft', 'tight', 'wide'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.4); if (e <= 0) return;
      var inner = p.shape === 'tight' ? 0.3 : p.shape === 'wide' ? 0.62 : 0.45;
      vignette(ctx, W, H, 0.5 * a * e, inner);
    },
  });

  /* ============================================================
     3. 렌즈 플레어 (아나모픽 줄기 + 고스트)
     ============================================================ */
  K.register({
    id: 'vfxFlare', name: '렌즈 플레어', dur: 6,
    fields: [AMT_FIELD, { k: 'pos', label: '위치', def: 'topright', opts: ['topleft', 'top', 'topright', 'center'] }, { k: 'tone', label: '색', def: 'cool', opts: ['cool', 'warm', 'gold'] }],
    draw: function (ctx, W, H, t, p, T) {
      var a = amt(p), e = env(t, p, 6, 0.5); if (e <= 0) return;
      var P0 = POS3[p.pos] || POS3.topright, drift = 0.012 * Math.sin(t * 0.7), dy = 0.008 * Math.cos(t * 0.53);
      var x = W * (P0[0] + drift), y = H * (P0[1] + dy);
      var col = p.tone === 'warm' ? [255, 196, 140] : p.tone === 'gold' ? hexRGB(T.accent) : [160, 200, 255];
      var flick = 0.92 + 0.08 * snoise(t * 3, 5);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // 중심 빛
      var r0 = H * 0.22 * a, g0 = ctx.createRadialGradient(x, y, 0, x, y, r0);
      g0.addColorStop(0, rgba([255, 255, 255], 0.9 * e * flick)); g0.addColorStop(0.18, rgba(col, 0.55 * e * flick)); g0.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g0; ctx.fillRect(x - r0, y - r0, r0 * 2, r0 * 2);
      // 아나모픽 가로 줄기
      var L = W * 0.75 * a, th = H * 0.012, g1 = ctx.createLinearGradient(x - L, y, x + L, y);
      g1.addColorStop(0, rgba(col, 0)); g1.addColorStop(0.45, rgba(col, 0.8 * e)); g1.addColorStop(0.5, rgba([235, 245, 255], 0.95 * e)); g1.addColorStop(0.55, rgba(col, 0.8 * e)); g1.addColorStop(1, rgba(col, 0));
      if (hasFilter(ctx)) ctx.filter = 'blur(' + Math.max(1, H * 0.006).toFixed(1) + 'px)';
      ctx.fillStyle = g1; ctx.fillRect(x - L, y - th / 2, L * 2, th);
      ctx.filter = 'none';
      // 고스트(광축 반대편으로 흩어짐)
      var cx = W / 2, cy = H / 2, vx = cx - x, vy = cy - y;
      for (var i = 0; i < 6; i++) {
        var k = [0.35, 0.6, 0.85, 1.15, 1.45, 1.8][i], gx = x + vx * k, gy = y + vy * k, gr = H * (0.03 + 0.035 * h2(i, 3)) * a;
        var gg = ctx.createRadialGradient(gx, gy, gr * 0.7, gx, gy, gr);
        gg.addColorStop(0, rgba(col, 0.05 * e)); gg.addColorStop(0.85, rgba(col, 0.22 * e)); gg.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    },
  });

  /* ============================================================
     4. 빛 스윕 (대각선 빛띠가 한 번 지나감 — 1.2초)
     ============================================================ */
  K.register({
    id: 'vfxSweep', name: '빛 스윕', dur: 1.2,
    fields: [AMT_FIELD, { k: 'tone', label: '색', def: 'white', opts: ['white', 'warm', 'gold'] }, { k: 'dir', label: '방향', def: 'ltr', opts: ['ltr', 'rtl'] }],
    draw: function (ctx, W, H, t, p, T) {
      var u = clamp(t / 1.2, 0, 1), a = amt(p), col = p.tone === 'warm' ? [255, 210, 160] : p.tone === 'gold' ? hexRGB(T.accent) : [255, 255, 255];
      var x = (p.dir === 'rtl' ? 1.35 - 1.7 * E.inOutCubic(u) : -0.35 + 1.7 * E.inOutCubic(u)) * W, bw = W * 0.16 * a;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.translate(x, H / 2); ctx.rotate(-0.42);
      var gr = ctx.createLinearGradient(-bw, 0, bw, 0);
      gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(0.42, rgba(col, 0.16 * a)); gr.addColorStop(0.5, rgba(col, 0.55 * a)); gr.addColorStop(0.58, rgba(col, 0.16 * a)); gr.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = gr; ctx.fillRect(-bw, -H * 1.5, bw * 2, H * 3);
      ctx.restore();
    },
  });

  /* ============================================================
     5. 빛줄기 (갓레이)
     ============================================================ */
  K.register({
    id: 'vfxRays', name: '빛줄기', dur: 6,
    fields: [AMT_FIELD, { k: 'pos', label: '위치', def: 'topright', opts: ['topleft', 'top', 'topright'] }, { k: 'tone', label: '색', def: 'warm', opts: ['warm', 'white', 'gold'] }],
    draw: function (ctx, W, H, t, p, T) {
      var a = amt(p), e = env(t, p, 6, 0.6); if (e <= 0) return;
      var P0 = POS3[p.pos] || POS3.topright, x = W * P0[0], y = H * (P0[1] - 0.1);
      var col = p.tone === 'white' ? [255, 255, 255] : p.tone === 'gold' ? hexRGB(T.accent) : [255, 226, 170];
      var R = Math.hypot(W, H) * 1.1, base = Math.atan2(H / 2 - y, W / 2 - x);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var gr = ctx.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, rgba(col, 0.55 * a * e)); gr.addColorStop(0.35, rgba(col, 0.22 * a * e)); gr.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = gr;
      for (var i = 0; i < 14; i++) {
        var ang = base + (h2(i, 21) - 0.5) * 1.25 + 0.06 * snoise(t * 0.35 + i, 9), w = (0.015 + 0.05 * h2(i, 22)) * (0.85 + 0.15 * snoise(t * 0.8 + i * 3, 10));
        ctx.globalAlpha = 0.5 + 0.5 * h2(i, 23);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - w) * R, y + Math.sin(ang - w) * R); ctx.lineTo(x + Math.cos(ang + w) * R, y + Math.sin(ang + w) * R); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    },
  });

  /* ============================================================
     6. 글로우 (블룸)
     ============================================================ */
  K.register({
    id: 'vfxGlow', name: '글로우', dur: 6,
    fields: [AMT_FIELD, { k: 'tone', label: '느낌', def: 'clean', opts: ['clean', 'dreamy'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.4); if (e <= 0) return;
      var s = snap(ctx, W, H); if (!s) return;
      var blur = W * (p.tone === 'dreamy' ? 0.014 : 0.008) * a;
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (p.tone === 'dreamy' ? 0.62 : 0.48) * clamp(a, 0.4, 1.2) * e;
      if (hasFilter(ctx)) ctx.filter = 'blur(' + blur.toFixed(1) + 'px) brightness(1.12) saturate(1.1)';
      ctx.drawImage(s, 0, 0);
      ctx.restore();
    },
  });

  /* ============================================================
     7. 소프트 포커스
     ============================================================ */
  K.register({
    id: 'vfxSoft', name: '소프트 포커스', dur: 6,
    fields: [AMT_FIELD],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.4); if (e <= 0) return;
      var s = snap(ctx, W, H); if (!s) return;
      ctx.save(); ctx.globalAlpha = 0.5 * clamp(a, 0.4, 1.4) * e;
      if (hasFilter(ctx)) ctx.filter = 'blur(' + (W * 0.006 * a).toFixed(1) + 'px) contrast(0.96) brightness(1.04)';
      ctx.drawImage(s, 0, 0);
      ctx.restore();
    },
  });

  /* ============================================================
     8. 틸트 시프트 (미니어처)
     ============================================================ */
  K.register({
    id: 'vfxTilt', name: '틸트 시프트', dur: 6,
    fields: [AMT_FIELD, { k: 'focus', label: '초점', def: 'middle', opts: ['top', 'middle', 'bottom'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.4); if (e <= 0 || !hasFilter(ctx)) return;
      var s = snap(ctx, W, H); if (!s) return;
      var b = cv(1, W, H), bx = b.getContext('2d');
      bx.clearRect(0, 0, W, H); bx.filter = 'blur(' + (W * 0.007 * a).toFixed(1) + 'px) saturate(1.25) contrast(1.06)'; bx.drawImage(s, 0, 0); bx.filter = 'none';
      var fy = p.focus === 'top' ? 0.3 : p.focus === 'bottom' ? 0.72 : 0.5, band = 0.16 / Math.sqrt(a);
      var m = bx.createLinearGradient(0, 0, 0, H);
      m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(clamp(fy - band * 1.8, 0, 1), 'rgba(0,0,0,1)'); m.addColorStop(clamp(fy - band * 0.55, 0, 1), 'rgba(0,0,0,0)');
      m.addColorStop(clamp(fy + band * 0.55, 0, 1), 'rgba(0,0,0,0)'); m.addColorStop(clamp(fy + band * 1.8, 0, 1), 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,1)');
      bx.globalCompositeOperation = 'destination-in'; bx.fillStyle = m; bx.fillRect(0, 0, W, H); bx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalAlpha = e; ctx.drawImage(b, 0, 0); ctx.restore();
    },
  });

  /* ============================================================
     9. 글리치 (짧은 폭발이 띄엄띄엄)
     ============================================================ */
  K.register({
    id: 'vfxGlitch', name: '글리치', dur: 6,
    fields: [AMT_FIELD, { k: 'rate', label: '빈도', def: 'normal', opts: ['rare', 'normal', 'busy'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), win = p.rate === 'rare' ? 1.4 : p.rate === 'busy' ? 0.45 : 0.8, k = Math.floor(t / win), ph = t - k * win;
      var on = h2(k, 31) < (p.rate === 'busy' ? 0.85 : 0.6) && ph < 0.18 + 0.1 * h2(k, 32);
      if (!on) return;
      var s = snap(ctx, W, H); if (!s) return;
      var f = fi(t), n = 5 + Math.floor(h2(f, 33) * 7);
      ctx.save();
      // 색 분리(색수차) — 화면 전체를 세 채널로 갈라 다시 합친다
      var d = W * 0.006 * a * (0.5 + h2(f, 37));
      channels(ctx, s, W, H, d, 1);
      ctx.globalCompositeOperation = 'source-over';
      // 가로 조각 밀기
      for (var i = 0; i < n; i++) {
        var y0 = Math.floor(h2(f * 31 + i, 34) * H), hh = Math.max(2, Math.floor(H * (0.01 + 0.06 * h2(f * 31 + i, 35))));
        var dx = (h2(f * 31 + i, 36) - 0.5) * W * 0.08 * a;
        ctx.drawImage(s, 0, y0, W, hh, dx, y0, W, hh);
      }
      // 블록 잡음
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.9;
      var nb = Math.floor(2 + 4 * a * h2(f, 38));
      for (var j = 0; j < nb; j++) {
        var bw = W * (0.04 + 0.2 * h2(f * 7 + j, 39)), bh = H * (0.01 + 0.04 * h2(f * 7 + j, 40)), bxp = h2(f * 7 + j, 41) * (W - bw), byp = h2(f * 7 + j, 42) * (H - bh);
        var sx = h2(f * 7 + j, 43) * (W - bw), sy = h2(f * 7 + j, 44) * (H - bh);
        ctx.drawImage(s, sx, sy, bw, bh, bxp, byp, bw, bh);
      }
      // 스캔라인
      ctx.globalAlpha = 0.18 * a; ctx.fillStyle = '#000';
      for (var y = (f % 4); y < H; y += 4) ctx.fillRect(0, y, W, 1);
      ctx.restore();
    },
  });

  /* ============================================================
     10. 색 분리 (색수차)
     ============================================================ */
  function channels(ctx, s, W, H, d, alpha) {
    var b = cv(1, W, H), bx = b.getContext('2d');
    var chans = [['#ff0000', -d, 0], ['#00ff00', 0, 0], ['#0000ff', d, 0]];
    ctx.save(); reset(ctx); ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var c = 0; c < 3; c++) {
      bx.clearRect(0, 0, W, H); bx.globalCompositeOperation = 'source-over'; bx.drawImage(s, 0, 0);
      bx.globalCompositeOperation = 'multiply'; bx.fillStyle = chans[c][0]; bx.fillRect(0, 0, W, H);
      bx.globalCompositeOperation = 'destination-in'; bx.drawImage(s, 0, 0);
      ctx.drawImage(b, chans[c][1], chans[c][2]);
    }
    ctx.restore();
  }
  K.register({
    id: 'vfxRgb', name: '색 분리', dur: 6,
    fields: [AMT_FIELD, { k: 'motion', label: '움직임', def: 'pulse', opts: ['still', 'pulse'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.3); if (e <= 0) return;
      var s = snap(ctx, W, H); if (!s) return;
      var d = W * 0.0045 * a * e * (p.motion === 'pulse' ? (0.7 + 0.3 * Math.sin(t * 6.1) + 0.25 * snoise(t * 5, 12)) : 1);
      channels(ctx, s, W, H, d, 1);
    },
  });

  /* ============================================================
     11. 줌 펀치 (임팩트 — 0.6초)
     ============================================================ */
  K.register({
    id: 'vfxPunch', name: '줌 펀치', dur: 0.6,
    fields: [AMT_FIELD, { k: 'dir', label: '방향', def: 'in', opts: ['in', 'out'] }],
    draw: function (ctx, W, H, t, p) {
      var u = clamp(t / 0.6, 0, 1), a = amt(p), s = snap(ctx, W, H); if (!s) return;
      var k = 1 - E.outExpo(u), sc = p.dir === 'out' ? 1 / (1 + 0.14 * a * k) : 1 + 0.14 * a * k;
      var shake = W * 0.006 * a * k;
      ctx.save(); reset(ctx);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      ctx.translate(W / 2 + snoise(t * 40, 13) * shake, H / 2 + snoise(t * 40, 14) * shake); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(s, 0, 0);
      ctx.restore();
      var fl = Math.pow(k, 5) * 0.35 * a;
      if (fl > 0.004) { ctx.save(); reset(ctx); ctx.fillStyle = 'rgba(255,255,255,' + clamp(fl, 0, 1) + ')'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    },
  });

  /* ============================================================
     12. 화면 흔들림
     ============================================================ */
  K.register({
    id: 'vfxShake', name: '화면 흔들림', dur: 6,
    fields: [AMT_FIELD, { k: 'kind', label: '종류', def: 'hand', opts: ['hand', 'impact', 'quake'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.3); if (e <= 0) return;
      var amp, dx, dy, rot;
      if (p.kind === 'impact') {
        var k = Math.exp(-t * 4.5); amp = W * 0.03 * a * k; if (amp < 0.3) return;
        dx = snoise(t * 30, 15) * amp; dy = snoise(t * 30, 16) * amp; rot = snoise(t * 22, 17) * 0.012 * a * k;
      } else if (p.kind === 'quake') {
        amp = W * 0.014 * a * e; dx = snoise(t * 26, 15) * amp; dy = snoise(t * 26, 16) * amp; rot = snoise(t * 14, 17) * 0.008 * a * e;
      } else {
        amp = W * 0.008 * a * e; dx = (snoise(t * 1.3, 15) * 0.7 + snoise(t * 5.5, 18) * 0.3) * amp; dy = (snoise(t * 1.1, 16) * 0.7 + snoise(t * 6.2, 19) * 0.3) * amp; rot = snoise(t * 0.9, 17) * 0.006 * a * e;
      }
      var s = snap(ctx, W, H); if (!s) return;
      var sc = 1 + (Math.abs(dx) + Math.abs(dy)) / W * 2.4 + Math.abs(rot) * 1.2;
      ctx.save(); reset(ctx);
      ctx.translate(W / 2 + dx, H / 2 + dy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(s, 0, 0);
      ctx.restore();
    },
  });

  /* ============================================================
     13. 플래시 (0.5초)
     ============================================================ */
  K.register({
    id: 'vfxFlash', name: '플래시', dur: 0.5,
    fields: [AMT_FIELD, { k: 'tone', label: '색', def: 'white', opts: ['white', 'black', 'gold'] }],
    draw: function (ctx, W, H, t, p, T) {
      var u = clamp(t / 0.5, 0, 1), a = amt(p), atk = 0.07;
      var v = u < atk ? u / atk : Math.pow(1 - (u - atk) / (1 - atk), 2.2);
      var col = p.tone === 'black' ? [0, 0, 0] : p.tone === 'gold' ? hexRGB(T.accent) : [255, 255, 255];
      ctx.save(); reset(ctx); ctx.fillStyle = rgba(col, clamp(v * a, 0, 1)); ctx.fillRect(0, 0, W, H); ctx.restore();
    },
  });

  /* ============================================================
     14. 오래된 필름
     ============================================================ */
  K.register({
    id: 'vfxOldFilm', name: '오래된 필름', dur: 6,
    fields: [AMT_FIELD, { k: 'tone', label: '색감', def: 'sepia', opts: ['sepia', 'bw', 'faded'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.3); if (e <= 0) return;
      var s = snap(ctx, W, H); if (!s) return;
      var f = fi(t), wob = W * 0.0025 * a, dx = snoise(t * 9, 41) * wob, dy = snoise(t * 11, 42) * wob;
      ctx.save(); reset(ctx);
      ctx.globalAlpha = e;
      if (hasFilter(ctx)) ctx.filter = p.tone === 'bw' ? 'grayscale(1) contrast(1.12) brightness(0.96)' : p.tone === 'faded' ? 'saturate(0.55) contrast(0.86) brightness(1.08) sepia(0.18)' : 'sepia(0.62) saturate(0.85) contrast(1.08)';
      ctx.translate(W / 2 + dx, H / 2 + dy); ctx.scale(1.012, 1.012); ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(s, 0, 0);
      ctx.restore();
      ctx.save(); reset(ctx);
      // 깜빡임
      var fl = snoise(t * 24, 43) * 0.05 * a; ctx.fillStyle = fl > 0 ? 'rgba(255,240,220,' + fl + ')' : 'rgba(0,0,0,' + (-fl) + ')'; ctx.fillRect(0, 0, W, H);
      // 스크래치 — 몇 프레임 머무는 세로 선
      var sk = Math.floor(t * 4), ns = Math.round(a * 2.2);
      for (var i = 0; i < ns; i++) {
        if (h2(sk + i * 77, 44) > 0.55) continue;
        var x = W * h2(sk + i * 77, 45) + snoise(t * 30 + i, 46) * 2, len2 = H * (0.3 + 0.7 * h2(sk + i * 77, 47)), y0 = h2(sk + i * 77, 48) * (H - len2);
        ctx.strokeStyle = 'rgba(255,250,235,' + (0.25 + 0.3 * h2(sk + i, 49)) + ')'; ctx.lineWidth = Math.max(1, W * 0.0007); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + snoise(t * 3 + i, 50) * 3, y0 + len2); ctx.stroke();
      }
      // 먼지·털
      var nd = Math.round(a * 5 * h2(f, 51));
      for (var j = 0; j < nd; j++) {
        var px = W * h2(f * 13 + j, 52), py = H * h2(f * 13 + j, 53), pr = Math.max(1, W * 0.0018 * h2(f * 13 + j, 54));
        ctx.fillStyle = 'rgba(20,14,8,' + (0.5 + 0.4 * h2(f * 13 + j, 55)) + ')';
        if (h2(f * 13 + j, 56) < 0.3) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = pr; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + pr * 6, py + pr * 4, px + pr * 3, py + pr * 12); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore();
      drawGrain(ctx, W, H, t, 0.16 * a * e, 1.5 * Math.max(1, W / 1280));
      vignette(ctx, W, H, 0.55 * e, 0.4);
    },
  });

  /* ============================================================
     15. 듀오톤
     ============================================================ */
  var DUO = { navygold: ['#0B2545', '#F2D98A'], tealorange: ['#0E3B4A', '#FFB070'], purplepink: ['#2A1240', '#FF9EC4'], greencream: ['#123B2A', '#F3EBCF'], mono: ['#101010', '#FFFFFF'] };
  K.register({
    id: 'vfxDuotone', name: '듀오톤', dur: 6,
    fields: [AMT_FIELD, { k: 'pal', label: '색', def: 'navygold', opts: ['navygold', 'tealorange', 'purplepink', 'greencream', 'mono'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.4); if (e <= 0 || !hasFilter(ctx)) return;
      var s = snap(ctx, W, H); if (!s) return;
      var pal = DUO[p.pal] || DUO.navygold, b = cv(1, W, H), bx = b.getContext('2d');
      ctx.save(); reset(ctx); ctx.globalAlpha = clamp(0.55 + 0.35 * a, 0, 1) * e;
      // 밝은 쪽: gray × B
      bx.clearRect(0, 0, W, H); bx.globalCompositeOperation = 'source-over'; bx.filter = 'grayscale(1) contrast(1.08)'; bx.drawImage(s, 0, 0); bx.filter = 'none';
      bx.globalCompositeOperation = 'multiply'; bx.fillStyle = pal[1]; bx.fillRect(0, 0, W, H);
      bx.globalCompositeOperation = 'destination-in'; bx.drawImage(s, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(b, 0, 0);
      // 어두운 쪽: (1-gray) × A 를 더한다
      bx.clearRect(0, 0, W, H); bx.globalCompositeOperation = 'source-over'; bx.filter = 'grayscale(1) contrast(1.08) invert(1)'; bx.drawImage(s, 0, 0); bx.filter = 'none';
      bx.globalCompositeOperation = 'multiply'; bx.fillStyle = pal[0]; bx.fillRect(0, 0, W, H);
      bx.globalCompositeOperation = 'destination-in'; bx.drawImage(s, 0, 0);
      ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(b, 0, 0);
      ctx.restore();
    },
  });

  /* ============================================================
     16. 시네마 레터박스
     ============================================================ */
  K.register({
    id: 'vfxLetterbox', name: '시네마 레터박스', dur: 6,
    fields: [{ k: 'ratio', label: '비율', def: 'r239', opts: ['r239', 'r200', 'r185'] }],
    draw: function (ctx, W, H, t, p) {
      var r = p.ratio === 'r200' ? 2.0 : p.ratio === 'r185' ? 1.85 : 2.39, L = len(p, 6);
      var bar = W > H ? Math.max(0, (H - W / r) / 2) : H * 0.09;
      var u = Math.min(E.outCubic(clamp(t / 0.45, 0, 1)), E.outCubic(clamp((L - t) / 0.45, 0, 1)));
      var b = bar * u; if (b < 0.5) return;
      ctx.save(); reset(ctx); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, b); ctx.fillRect(0, H - b, W, b); ctx.restore();
    },
  });

  /* ============================================================
     17. 프레임 (폴라로이드·필름·얇은 선·카드)
     ============================================================ */
  K.register({
    id: 'vfxFrame', name: '프레임', dur: 6,
    fields: [{ k: 'style', label: '종류', def: 'polaroid', opts: ['polaroid', 'film', 'line', 'card'] }, { k: 'bg', label: '바탕', def: 'white', opts: ['white', 'black', 'navy'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = snap(ctx, W, H); if (!s) return;
      var L = len(p, 6), u = Math.min(E.outBack(clamp(t / 0.55, 0, 1)), E.outCubic(clamp((L - t) / 0.4, 0, 1)));
      var bg = p.bg === 'black' ? '#0a0a0a' : p.bg === 'navy' ? T.primary : '#f6f3ec', st = p.style;
      ctx.save(); reset(ctx);
      if (st === 'line') {
        var m = W * 0.03 * u; ctx.strokeStyle = p.bg === 'black' ? 'rgba(0,0,0,0.9)' : p.bg === 'navy' ? T.primary : 'rgba(255,255,255,0.92)'; ctx.lineWidth = Math.max(1.5, W * 0.0022);
        ctx.strokeRect(m, m, W - 2 * m, H - 2 * m); ctx.restore(); return;
      }
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      var sc, pw, ph, px, py;
      if (st === 'polaroid') {
        sc = 0.78; pw = W * sc; ph = H * sc; px = (W - pw) / 2; py = H * 0.06;
        var bord = W * 0.022;
        ctx.translate(W / 2, H / 2); ctx.rotate(-0.025 * u); ctx.scale(0.85 + 0.15 * u, 0.85 + 0.15 * u); ctx.translate(-W / 2, -H / 2);
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = W * 0.02; ctx.shadowOffsetY = W * 0.006;
        ctx.fillStyle = '#fbfaf7'; ctx.fillRect(px - bord, py - bord, pw + 2 * bord, ph + 2 * bord + H * 0.11);
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.drawImage(s, px, py, pw, ph);
      } else if (st === 'film') {
        ctx.fillStyle = '#0c0c0c'; ctx.fillRect(0, 0, W, H);
        sc = 0.8; pw = W * sc; ph = H * sc; px = (W - pw) / 2; py = (H - ph) / 2;
        ctx.globalAlpha = u; ctx.drawImage(s, px, py, pw, ph); ctx.globalAlpha = 1;
        ctx.fillStyle = '#e8e4d8'; var hw = W * 0.028, hh = H * 0.05, gap = H * 0.085, off = (t * H * 0.12) % gap;
        for (var y = -gap + off; y < H + gap; y += gap) { ctx.fillRect(px * 0.5 - hw / 2, y, hw, hh); ctx.fillRect(W - px * 0.5 - hw / 2, y, hw, hh); }
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(px, py, pw, 1); ctx.fillRect(px, py + ph - 1, pw, 1);
      } else {
        sc = 0.86; pw = W * sc; ph = H * sc; px = (W - pw) / 2; py = (H - ph) / 2; var rad = W * 0.016;
        ctx.translate(W / 2, H / 2); ctx.scale(0.9 + 0.1 * u, 0.9 + 0.1 * u); ctx.translate(-W / 2, -H / 2);
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = W * 0.025; ctx.shadowOffsetY = W * 0.008;
        ctx.beginPath(); ctx.moveTo(px + rad, py); ctx.arcTo(px + pw, py, px + pw, py + ph, rad); ctx.arcTo(px + pw, py + ph, px, py + ph, rad); ctx.arcTo(px, py + ph, px, py, rad); ctx.arcTo(px, py, px + pw, py, rad); ctx.closePath();
        ctx.fillStyle = '#000'; ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; ctx.clip(); ctx.drawImage(s, px, py, pw, ph);
      }
      ctx.restore();
    },
  });

  /* ============================================================
     18. 먼지 파티클 (공중에 떠다니는 먼지·빛가루)
     ============================================================ */
  K.register({
    id: 'vfxDust', name: '먼지 파티클', dur: 6,
    fields: [AMT_FIELD, { k: 'tone', label: '색', def: 'warm', opts: ['warm', 'white', 'gold'] }],
    draw: function (ctx, W, H, t, p, T) {
      var a = amt(p), e = env(t, p, 6, 0.5); if (e <= 0) return;
      var col = p.tone === 'white' ? [255, 255, 255] : p.tone === 'gold' ? hexRGB(T.accent) : [255, 236, 200], N = Math.round(46 * a);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < N; i++) {
        var sp = 0.01 + 0.03 * h2(i, 61), x = ((h2(i, 62) + t * sp * (h2(i, 63) - 0.5) * 2 + 0.08 * snoise(t * 0.4 + i, 64)) % 1 + 1) % 1 * W;
        var y = ((h2(i, 65) - t * sp * 0.6 + 0.05 * snoise(t * 0.5 + i * 2, 66)) % 1 + 1) % 1 * H;
        var r = W * (0.0012 + 0.004 * h2(i, 67)) * (0.7 + 0.3 * h2(i, 68)), tw = 0.55 + 0.45 * Math.sin(t * (1.5 + 3 * h2(i, 69)) + i);
        var gr = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
        gr.addColorStop(0, rgba(col, 0.9 * tw * e)); gr.addColorStop(0.35, rgba(col, 0.35 * tw * e)); gr.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    },
  });

  /* ============================================================
     19. 꽃잎·눈·낙엽·반딧불
     ============================================================ */
  function petal(ctx, x, y, r, rot, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -r); ctx.bezierCurveTo(r * 0.9, -r * 0.6, r * 0.9, r * 0.6, 0, r); ctx.bezierCurveTo(-r * 0.9, r * 0.6, -r * 0.9, -r * 0.6, 0, -r); ctx.fill(); ctx.restore(); }
  function leaf(ctx, x, y, r, rot, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 1.1, -r * 0.2, 0, r); ctx.quadraticCurveTo(-r * 1.1, -r * 0.2, 0, -r); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = Math.max(0.5, r * 0.08); ctx.beginPath(); ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.8); ctx.stroke(); ctx.restore(); }
  K.register({
    id: 'vfxParticles', name: '꽃잎·눈·낙엽', dur: 6,
    fields: [AMT_FIELD, { k: 'kind', label: '종류', def: 'petal', opts: ['petal', 'snow', 'leaf', 'firefly'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.6); if (e <= 0) return;
      var kind = p.kind, N = Math.round((kind === 'firefly' ? 22 : kind === 'snow' ? 70 : 34) * a);
      ctx.save(); ctx.globalAlpha = e;
      if (kind === 'firefly') ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < N; i++) {
        var seedA = h2(i, 71), seedB = h2(i, 72), depth = 0.4 + 0.6 * h2(i, 73);
        var x, y, r, rot;
        if (kind === 'firefly') {
          x = (h2(i, 74) + 0.06 * snoise(t * 0.25 + i * 7, 75)) * W; y = (h2(i, 76) + 0.05 * snoise(t * 0.3 + i * 5, 77)) * H;
          var glow = Math.max(0, Math.sin(t * (0.8 + 1.6 * seedA) + i * 2.1)); r = W * 0.004 * depth * (0.6 + 0.6 * glow);
          var gr = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
          gr.addColorStop(0, 'rgba(255,245,170,' + (0.95 * glow) + ')'); gr.addColorStop(0.3, 'rgba(230,220,90,' + (0.35 * glow) + ')'); gr.addColorStop(1, 'rgba(200,220,60,0)');
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        var fall = kind === 'snow' ? 0.05 + 0.05 * seedA : kind === 'leaf' ? 0.07 + 0.05 * seedA : 0.06 + 0.06 * seedA;
        var sway = kind === 'snow' ? 0.02 : 0.045;
        y = (((seedB + t * fall * depth) % 1.15) - 0.075) * H;
        x = (seedA + sway * Math.sin(t * (0.9 + seedB) + i) + 0.02 * snoise(t * 0.7 + i * 3, 78)) * W;
        r = W * (kind === 'snow' ? 0.0045 : 0.013) * depth * (0.7 + 0.5 * h2(i, 79));
        rot = t * (0.8 + 1.4 * seedB) * (seedA > 0.5 ? 1 : -1) + i;
        if (kind === 'snow') { ctx.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.45 * depth) + ')'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
        else if (kind === 'leaf') leaf(ctx, x, y, r, rot, ['#d9822b', '#c2481f', '#e6a93a', '#8a5a1e'][i & 3]);
        else petal(ctx, x, y, r, rot, ['rgba(255,190,210,0.92)', 'rgba(255,214,228,0.92)', 'rgba(250,170,195,0.92)', 'rgba(255,235,240,0.9)'][i & 3]);
      }
      ctx.restore();
    },
  });

  /* ============================================================
     20. 보케 빛망울
     ============================================================ */
  K.register({
    id: 'vfxBokeh', name: '보케 빛망울', dur: 6,
    fields: [AMT_FIELD, { k: 'tone', label: '색', def: 'warm', opts: ['warm', 'cool', 'mix', 'gold'] }],
    draw: function (ctx, W, H, t, p, T) {
      var a = amt(p), e = env(t, p, 6, 0.6); if (e <= 0) return;
      var pal = p.tone === 'cool' ? [[150, 200, 255], [190, 170, 255], [120, 230, 240]] : p.tone === 'mix' ? [[255, 180, 120], [150, 200, 255], [255, 140, 200], [190, 255, 170]] : p.tone === 'gold' ? [hexRGB(T.accent), [255, 235, 180], [255, 214, 120]] : [[255, 200, 140], [255, 170, 110], [255, 230, 190]];
      var N = Math.round(16 * a);
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (var i = 0; i < N; i++) {
        var col = pal[i % pal.length], sp = 0.008 + 0.02 * h2(i, 81);
        var x = ((h2(i, 82) + t * sp * (h2(i, 83) - 0.5) + 0.04 * snoise(t * 0.3 + i, 84)) % 1 + 1) % 1 * W;
        var y = ((h2(i, 85) - t * sp * 0.5 + 0.03 * snoise(t * 0.35 + i * 2, 86)) % 1 + 1) % 1 * H;
        var r = H * (0.03 + 0.09 * h2(i, 87)) * (0.9 + 0.1 * Math.sin(t * 0.8 + i)), al = (0.18 + 0.22 * h2(i, 88)) * e;
        var gr = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
        gr.addColorStop(0, rgba(col, al * 0.55)); gr.addColorStop(0.82, rgba(col, al)); gr.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    },
  });

  /* ============================================================
     21. 스포트라이트
     ============================================================ */
  K.register({
    id: 'vfxSpot', name: '스포트라이트', dur: 6,
    fields: [AMT_FIELD, { k: 'pos', label: '위치', def: 'center', opts: ['center', 'left', 'right', 'top'] }, { k: 'size', label: '크기', def: 'mid', opts: ['small', 'mid', 'large'] }],
    draw: function (ctx, W, H, t, p) {
      var a = amt(p), e = env(t, p, 6, 0.5); if (e <= 0) return;
      var P0 = POS3[p.pos] || POS3.center, cx = W * (P0[0] + 0.01 * snoise(t * 0.5, 91)), cy = H * (p.pos === 'top' ? 0.3 : P0[1]) + H * 0.01 * snoise(t * 0.45, 92);
      var R = H * (p.size === 'small' ? 0.3 : p.size === 'large' ? 0.62 : 0.44) * (1 + 0.02 * snoise(t * 0.6, 93));
      var dark = clamp(0.45 + 0.3 * (a - 0.55), 0.3, 0.92) * e;
      var gr = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,' + dark + ')');   // R 바깥은 마지막 색으로 채워진다
      ctx.save(); reset(ctx); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
    },
  });

  g.KMV_VFX = { IDS: ['vfxGrain', 'vfxVignette', 'vfxFlare', 'vfxSweep', 'vfxRays', 'vfxGlow', 'vfxSoft', 'vfxTilt', 'vfxGlitch', 'vfxRgb', 'vfxPunch', 'vfxShake', 'vfxFlash', 'vfxOldFilm', 'vfxDuotone', 'vfxLetterbox', 'vfxFrame', 'vfxDust', 'vfxParticles', 'vfxBokeh', 'vfxSpot'],
    FRAME: ['vfxGlow', 'vfxSoft', 'vfxTilt', 'vfxGlitch', 'vfxRgb', 'vfxPunch', 'vfxShake', 'vfxOldFilm', 'vfxDuotone', 'vfxFrame'],
    ONESHOT: ['vfxSweep', 'vfxPunch', 'vfxFlash'], AMT, h1, h2, snoise };
})(typeof window !== 'undefined' ? window : globalThis);
