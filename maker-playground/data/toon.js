/* ============================================================
   MK_TOON — R135 캐릭터 필터: 내 사진이 만화가 된다 (스타일 6종)
   ------------------------------------------------------------
   준호: 「일반 사진을 캐릭터처럼」 + 「여러 버전으로」. R134 대화에서
   갈래를 셋으로 갈랐고, 이건 그 ① — **코드로 되는 만화 필터**다.
   생성 AI 캐릭터화(②)가 아니라는 걸 이름부터 정직하게 진다:
   비율은 그대로, 화장(색·선·질감)을 바꾼다. 사진은 기기 밖으로
   한 바이트도 안 나간다 (외부 API 0 — 무료·초상권 원칙 유지).

   층은 R134 와 동일한 둘:
   ① 순수 로직 (DOM 무의존 — 하니스가 실실행)
      RGBA 버퍼 위의 결정적 화소 연산만으로 6종 스타일:
      · 웹툰       — 부드럽게 뭉갠 색 + 또렷한 먹선
      · 진한 만화  — 더 적은 색 단계 + 굵은 선 + 진한 채도
      · 연필 스케치 — 회색 반전 블러 닷지 (종이 위 연필)
      · 수채화     — 큰 붓 뭉개기 + 옅은 색 단계 + 흐린 윤곽
      · 팝아트     — 3단 포스터라이즈 + 강한 채도 + 검은 윤곽
      · 픽셀 아트  — 블록 표본화 + 색 양자화 (도트)
      공용 부품: 회색 변환·분리형 박스 블러·소벨 윤곽·포스터라이즈·
      채도·픽셀화·닷지. stylize(원본, 프리셋, 세기) 한 창구 —
      세기 0 = 원본 바이트 그대로 (혼합이 마지막 한 곳에서만).
   ② 작업창 (open 으로만 생성 — 로드 시 DOM 접촉 0)
      스타일 6버튼(작업 해상도 미리보기) + 세기 슬라이더 + 적용.
      결과 = 원본 해상도 dataURL → el.src 교체가 전부 (스키마 0,
      R134 와 같은 이유로 render·play·export 전 경로 공짜로 옳음).

   학생 화면(workspace) 무접촉 — 진입은 에디터 사진 패널 한 곳.
   ============================================================ */
window.MK_TOON = (() => {
  'use strict';

  var WORK_MAX = 420;      /* 미리보기 작업 해상도(긴 변) */
  var FULL_MAX = 2560;     /* 적용 시 상한 — intake(1920) 여유 */

  /* ================================================================
     ① 순수 로직 — 여기부터 PRESETS 끝까지 DOM 무의존
     ================================================================ */

  function toGray(rgba, w, h) {
    var g = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) {
      var p = i * 4;
      g[i] = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2];
    }
    return g;
  }

  /* 분리형 박스 블러 — Float32 1채널. 슬라이딩 합이라 O(n) */
  function blurCh(src, w, h, r) {
    if (r <= 0) return src.slice();
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h);
    var x, y, sum, cnt;
    for (y = 0; y < h; y++) {
      var row = y * w; sum = 0; cnt = 0;
      for (x = -r; x <= r; x++) if (x >= 0 && x < w) { sum += src[row + x]; cnt++; }
      for (x = 0; x < w; x++) {
        tmp[row + x] = sum / cnt;
        var a = x + r + 1, d = x - r;
        if (a < w) { sum += src[row + a]; cnt++; }
        if (d >= 0) { sum -= src[row + d]; cnt--; }
      }
    }
    for (x = 0; x < w; x++) {
      sum = 0; cnt = 0;
      for (y = -r; y <= r; y++) if (y >= 0 && y < h) { sum += tmp[y * w + x]; cnt++; }
      for (y = 0; y < h; y++) {
        out[y * w + x] = sum / cnt;
        var a2 = y + r + 1, d2 = y - r;
        if (a2 < h) { sum += tmp[a2 * w + x]; cnt++; }
        if (d2 >= 0) { sum -= tmp[d2 * w + x]; cnt--; }
      }
    }
    return out;
  }

  /* RGB 3채널 블러 — 색 뭉개기(만화의 「면」) */
  function blurRGB(rgba, w, h, r) {
    var out = new Uint8ClampedArray(rgba);
    if (r <= 0) return out;
    for (var c = 0; c < 3; c++) {
      var ch = new Float32Array(w * h);
      for (var i = 0; i < w * h; i++) ch[i] = rgba[i * 4 + c];
      var b = blurCh(ch, w, h, r);
      for (var j = 0; j < w * h; j++) out[j * 4 + c] = Math.round(b[j]);
    }
    return out;
  }

  /* 소벨 윤곽 크기 지도 (0~255 근사) */
  function sobelMag(gray, w, h) {
    var out = new Float32Array(w * h);
    for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) {
      var p = y * w + x;
      var gx = -gray[p - w - 1] - 2 * gray[p - 1] - gray[p + w - 1]
             + gray[p - w + 1] + 2 * gray[p + 1] + gray[p + w + 1];
      var gy = -gray[p - w - 1] - 2 * gray[p - w] - gray[p - w + 1]
             + gray[p + w - 1] + 2 * gray[p + w] + gray[p + w + 1];
      out[p] = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 0.25);
    }
    return out;
  }

  /* 채널별 소벨 최대 — 밝기가 같아도 색이 다른 경계(빨강↔파랑)를
     잡는다. 회색 소벨만 쓰면 등휘도 색 경계에 먹선이 빠진다
     (하니스가 합성 이미지로 실제 잡아낸 구멍). */
  function sobelMaxRGB(rgba, w, h) {
    var out = new Float32Array(w * h);
    var ch = new Float32Array(w * h);
    for (var c = 0; c < 3; c++) {
      for (var i = 0; i < w * h; i++) ch[i] = rgba[i * 4 + c];
      var m = sobelMag(ch, w, h);
      for (var j = 0; j < w * h; j++) if (m[j] > out[j]) out[j] = m[j];
    }
    return out;
  }

  /* 윤곽 굵히기 — 3×3 최대 r회 (진한 만화의 굵은 먹선) */
  function dilateCh(src, w, h, r) {
    var cur = src;
    for (var it = 0; it < r; it++) {
      var out = new Float32Array(w * h);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var best = 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          var v = cur[yy * w + xx];
          if (v > best) best = v;
        }
        out[y * w + x] = best;
      }
      cur = out;
    }
    return cur;
  }

  /* 포스터라이즈 — 채널을 levels 단계로. 만화의 「셀 색」 */
  function posterize(rgba, w, h, levels) {
    var out = new Uint8ClampedArray(rgba);
    if (levels < 2) levels = 2;
    var step = 255 / (levels - 1);
    for (var i = 0; i < w * h; i++) {
      var p = i * 4;
      out[p] = Math.round(Math.round(rgba[p] / step) * step);
      out[p + 1] = Math.round(Math.round(rgba[p + 1] / step) * step);
      out[p + 2] = Math.round(Math.round(rgba[p + 2] / step) * step);
    }
    return out;
  }

  /* 채도 — 회색 기준 벌리기 (sat 1 = 무변화) */
  function saturate(rgba, w, h, sat) {
    var out = new Uint8ClampedArray(rgba);
    if (sat === 1) return out;
    for (var i = 0; i < w * h; i++) {
      var p = i * 4;
      var g = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2];
      out[p] = g + (rgba[p] - g) * sat;
      out[p + 1] = g + (rgba[p + 1] - g) * sat;
      out[p + 2] = g + (rgba[p + 2] - g) * sat;
    }
    return out;
  }

  /* 픽셀화 — block×block 평균 한 색 (도트) */
  function pixelate(rgba, w, h, block) {
    var out = new Uint8ClampedArray(rgba);
    if (block <= 1) return out;
    for (var by = 0; by < h; by += block) for (var bx = 0; bx < w; bx += block) {
      var sr = 0, sg = 0, sb = 0, n = 0;
      var y1 = Math.min(h, by + block), x1 = Math.min(w, bx + block);
      for (var y = by; y < y1; y++) for (var x = bx; x < x1; x++) {
        var p = (y * w + x) * 4;
        sr += rgba[p]; sg += rgba[p + 1]; sb += rgba[p + 2]; n++;
      }
      sr = Math.round(sr / n); sg = Math.round(sg / n); sb = Math.round(sb / n);
      for (var y2 = by; y2 < y1; y2++) for (var x2 = bx; x2 < x1; x2++) {
        var q = (y2 * w + x2) * 4;
        out[q] = sr; out[q + 1] = sg; out[q + 2] = sb;
      }
    }
    return out;
  }

  /* 연필 스케치 — 회색 ÷ (255−반전블러) 컬러 닷지. 종이=흰색 */
  function sketch(rgba, w, h, r) {
    var g = toGray(rgba, w, h);
    var inv = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) inv[i] = 255 - g[i];
    var b = blurCh(inv, w, h, r);
    var out = new Uint8ClampedArray(w * h * 4);
    for (var j = 0; j < w * h; j++) {
      var d = Math.min(255, g[j] * 255 / (255 - b[j] + 1));
      var p = j * 4;
      out[p] = d; out[p + 1] = d; out[p + 2] = d; out[p + 3] = rgba[p + 3];
    }
    return out;
  }

  /* 윤곽 먹선 얹기 — mag 가 thr 를 넘는 자리에 잉크색 혼합 */
  function inkEdges(rgba, w, h, mag, thr, strength, inkR, inkG, inkB) {
    var out = new Uint8ClampedArray(rgba);
    var band = 40;
    for (var i = 0; i < w * h; i++) {
      var m = mag[i];
      if (m <= thr) continue;
      var a = Math.min(1, (m - thr) / band) * strength;
      var p = i * 4;
      out[p] = out[p] * (1 - a) + inkR * a;
      out[p + 1] = out[p + 1] * (1 - a) + inkG * a;
      out[p + 2] = out[p + 2] * (1 - a) + inkB * a;
    }
    return out;
  }

  /* ---- 스타일 정본 — id·이름·파이프라인 파라미터 ---- */
  var PRESETS = [
    { id: 'webtoon', name: '웹툰', emoji: '🖊', smooth: 2, levels: 6, sat: 1.3, edge: { thr: 46, strength: 0.85, dilate: 0 } },
    { id: 'comic', name: '진한 만화', emoji: '💥', smooth: 1, levels: 4, sat: 1.5, edge: { thr: 38, strength: 1, dilate: 1 } },
    { id: 'sketch', name: '연필 스케치', emoji: '✏️', sketchR: 5 },
    { id: 'water', name: '수채화', emoji: '🎨', smooth: 5, levels: 8, sat: 1.1, edge: { thr: 70, strength: 0.35, dilate: 0 } },
    { id: 'popart', name: '팝아트', emoji: '🌈', smooth: 1, levels: 3, sat: 1.9, edge: { thr: 44, strength: 0.9, dilate: 0 } },
    { id: 'pixel', name: '픽셀 아트', emoji: '🕹', pixelDiv: 56, levels: 6 },
  ];
  var presetOf = function (id) {
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) return PRESETS[i];
    return null;
  };

  /* ---- 한 창구: stylize(원본, w, h, 프리셋 id, 세기 0~1) ----
     세기는 마지막 혼합 한 곳에서만 — 0 = 원본 바이트 그대로. */
  function stylize(rgba, w, h, id, strength) {
    var P = presetOf(id);
    if (!P) return null;
    strength = strength == null ? 1 : Math.max(0, Math.min(1, strength));
    var fx;
    if (P.sketchR) {
      fx = sketch(rgba, w, h, Math.max(2, Math.round(P.sketchR * w / 420)));
    } else if (P.pixelDiv) {
      var block = Math.max(2, Math.round(Math.max(w, h) / P.pixelDiv));
      fx = posterize(pixelate(rgba, w, h, block), w, h, P.levels);
    } else {
      var sm = Math.max(1, Math.round(P.smooth * w / 420));
      fx = blurRGB(rgba, w, h, sm);
      fx = posterize(fx, w, h, P.levels);
      fx = saturate(fx, w, h, P.sat);
      if (P.edge) {
        var mag = sobelMaxRGB(blurRGB(rgba, w, h, 1), w, h);
        if (P.edge.dilate) mag = dilateCh(mag, w, h, P.edge.dilate);
        fx = inkEdges(fx, w, h, mag, P.edge.thr, P.edge.strength, 31, 39, 51);
      }
    }
    if (strength >= 1) return fx;
    var out = new Uint8ClampedArray(rgba);
    if (strength <= 0) return out;
    for (var i = 0; i < w * h; i++) {
      var p = i * 4;
      out[p] = rgba[p] * (1 - strength) + fx[p] * strength;
      out[p + 1] = rgba[p + 1] * (1 - strength) + fx[p + 1] * strength;
      out[p + 2] = rgba[p + 2] * (1 - strength) + fx[p + 2] * strength;
    }
    return out;
  }

  function fitWork(w, h, max) {
    var long = Math.max(w, h);
    if (long <= max) return { w: w, h: h };
    var s = max / long;
    return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
  }

  /* ================================================================
     ② 작업창 — open() 으로만 생성
     ================================================================ */
  var BTN = 'padding:7px 11px;border:1px solid var(--mk-border,#E3E8EF);border-radius:9px;background:var(--mk-surface,#fff);font-size:12.5px;cursor:pointer;';

  function open(opts) {
    if (!opts || !opts.src) return;
    var doc = document;
    var st = { style: null, strength: 1, work: null, ww: 0, wh: 0, busy: false };

    var root = doc.createElement('div');
    root.setAttribute('data-mktoon', '1');
    root.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(15,23,32,.88);display:flex;align-items:center;justify-content:center;padding:14px;';
    root.innerHTML =
      '<div style="background:var(--mk-surface,#fff);border-radius:16px;max-width:min(96vw,880px);max-height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.4)">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--mk-border,#E3E8EF)">' +
        '<strong style="font-size:15px">🎭 캐릭터 필터</strong>' +
        '<span data-toon="msg" style="flex:1;font-size:12.5px;color:var(--mk-muted,#6B7280)">스타일을 골라 보세요 — 사진은 이 기기 밖으로 나가지 않아요</span>' +
        '<button data-toon="close" style="border:none;background:none;font-size:18px;cursor:pointer;line-height:1">✕</button></div>' +
      '<div style="position:relative;flex:1;min-height:200px;display:flex;align-items:center;justify-content:center;background:#0F1720">' +
        '<canvas data-toon="cv" style="max-width:100%;max-height:min(56vh,520px)"></canvas>' +
        '<div data-toon="busy" style="display:none;position:absolute;inset:0;background:rgba(15,23,32,.55);color:#fff;align-items:center;justify-content:center;font-size:14px">그리는 중…</div></div>' +
      '<div data-toon="styles" style="display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px;border-bottom:1px solid var(--mk-border,#E3E8EF)">' +
        PRESETS.map(function (P) {
          return '<button data-toonstyle="' + P.id + '" style="' + BTN + '">' + P.emoji + ' ' + P.name + '</button>';
        }).join('') + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center;padding:10px 14px">' +
        '<label style="font-size:12.5px;display:flex;align-items:center;gap:6px;flex:1">세기 <input data-toon="strength" type="range" min="20" max="100" value="100" style="flex:1;max-width:220px"></label>' +
        '<button data-toon="orig" style="' + BTN + '">↺ 원본 보기</button>' +
        '<button data-toon="apply" style="' + BTN + 'background:#14B8A6;color:#fff;border-color:#14B8A6;" disabled>✔ 이 스타일로 적용</button></div>' +
      '</div>';
    doc.body.appendChild(root);

    var $ = function (k) { return root.querySelector('[data-toon="' + k + '"]'); };
    var cv = $('cv'), ctx = cv.getContext && cv.getContext('2d');
    var setMsg = function (t) { $('msg').textContent = t; };
    var setBusy = function (b) { st.busy = b; $('busy').style.display = b ? 'flex' : 'none'; };
    function close() { try { root.remove(); } catch (_) { if (root.parentNode) root.parentNode.removeChild(root); } }
    $('close').onclick = close;

    var img = new window.Image();
    img.onload = function () {
      var fw = fitWork(img.naturalWidth || img.width, img.naturalHeight || img.height, WORK_MAX);
      st.ww = fw.w; st.wh = fw.h;
      if (!ctx) return;
      var wc = doc.createElement('canvas');
      wc.width = fw.w; wc.height = fw.h;
      var wx = wc.getContext('2d', { willReadFrequently: true });
      wx.drawImage(img, 0, 0, fw.w, fw.h);
      st.work = wx.getImageData(0, 0, fw.w, fw.h).data;
      paintOriginal();
    };
    img.onerror = function () { setMsg('사진을 열 수 없어요'); };
    img.src = opts.src;

    function paintOriginal() {
      if (!ctx || !st.work) return;
      cv.width = st.ww; cv.height = st.wh;
      ctx.putImageData(new window.ImageData(new Uint8ClampedArray(st.work), st.ww, st.wh), 0, 0);
    }
    function paintPreview() {
      if (!ctx || !st.work || !st.style) return;
      var out = stylize(st.work, st.ww, st.wh, st.style, st.strength);
      if (!out) return;
      cv.width = st.ww; cv.height = st.wh;
      ctx.putImageData(new window.ImageData(out, st.ww, st.wh), 0, 0);
    }
    function refreshStyles() {
      root.querySelectorAll('[data-toonstyle]').forEach(function (b) {
        var on = b.dataset.toonstyle === st.style;
        b.style.background = on ? '#E6FAF7' : '';
        b.style.borderColor = on ? '#14B8A6' : 'var(--mk-border,#E3E8EF)';
      });
      $('apply').disabled = !st.style;
    }

    root.querySelectorAll('[data-toonstyle]').forEach(function (b) {
      b.onclick = function () {
        if (st.busy) return;
        st.style = b.dataset.toonstyle;
        var P = presetOf(st.style);
        setMsg(P ? P.emoji + ' ' + P.name + ' — 세기를 조절하거나 다른 스타일을 눌러 비교해 보세요' : '');
        refreshStyles(); paintPreview();
      };
    });
    $('strength').oninput = function () { st.strength = +this.value / 100; paintPreview(); };
    $('orig').onclick = function () { st.style = null; refreshStyles(); paintOriginal(); setMsg('원본이에요 — 스타일을 골라 보세요'); };

    $('apply').onclick = function () {
      if (!st.style || st.busy || !ctx) return;
      setBusy(true);
      setTimeout(function () {
        try {
          var fw = fitWork(img.naturalWidth || img.width, img.naturalHeight || img.height, FULL_MAX);
          var fc = doc.createElement('canvas');
          fc.width = fw.w; fc.height = fw.h;
          var fx = fc.getContext('2d', { willReadFrequently: true });
          fx.drawImage(img, 0, 0, fw.w, fw.h);
          var full = fx.getImageData(0, 0, fw.w, fw.h).data;
          var out = stylize(full, fw.w, fw.h, st.style, st.strength);
          fx.putImageData(new window.ImageData(out, fw.w, fw.h), 0, 0);
          var srcIsPng = /^data:image\/png/.test(opts.src || '');
          var url = srcIsPng ? fc.toDataURL('image/png') : fc.toDataURL('image/jpeg', 0.92);
          var P = presetOf(st.style);
          setBusy(false); close();
          if (opts.onApply) opts.onApply(url, '캐릭터 필터 — ' + (P ? P.name : st.style));
        } catch (_) { setBusy(false); setMsg('그리다가 문제가 생겼어요 — 다시 시도해 주세요'); }
      }, 30);
    };
  }

  /* ---- 계약 자기 검증 ---- */
  function verify() {
    var v = [];
    ['toGray', 'blurRGB', 'sobelMag', 'sobelMaxRGB', 'posterize', 'saturate', 'pixelate', 'sketch',
      'inkEdges', 'stylize', 'fitWork', 'open'].forEach(function (k) {
      if (typeof api[k] !== 'function') v.push('missing:' + k);
    });
    if (!Array.isArray(PRESETS) || PRESETS.length < 6) v.push('presets<6');
    var ids = {};
    PRESETS.forEach(function (P) { if (ids[P.id]) v.push('dup:' + P.id); ids[P.id] = 1; });
    return { ok: !v.length, violations: v };
  }

  var api = {
    WORK_MAX: WORK_MAX, PRESETS: PRESETS, presetOf: presetOf,
    toGray: toGray, blurCh: blurCh, blurRGB: blurRGB, sobelMag: sobelMag, sobelMaxRGB: sobelMaxRGB,
    dilateCh: dilateCh, posterize: posterize, saturate: saturate,
    pixelate: pixelate, sketch: sketch, inkEdges: inkEdges,
    stylize: stylize, fitWork: fitWork, open: open, verify: verify,
  };
  return api;
})();
