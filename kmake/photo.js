/* ============================================================
   케이메이커 사진 엔진 (KM_PHOTO) — 사진 1차 공사 (2026-07-03)
   ------------------------------------------------------------
   1) 입구 통일  loadImageFile(file, cb)
      - HEIC/HEIF → JPEG 자동 변환 (heic2any 지연 로드)
      - 대형 사진 자동 다운스케일 (최대 변 2560px — A4 300dpi 커버)
      - EXIF 회전: 최신 브라우저의 image-orientation:from-image가
        <img> 디코딩 단계에서 자동 적용 (fabric은 <img>를 쓴다)
   2) 셰이프 마스크  applyMask(img, key)
      - 고정 비율 모양(원·하트·아치…)은 cropX/Y로 중앙 크롭까지 수행
        → 선택 박스가 보이는 모양과 일치 (투명 여백 없는 캔바급 UX)
      - clipPath는 이미지 로컬 좌표(크롭 후 기준)로 정중앙 배치
      - 마스크 해제 시 원본 전체 복원 (원본 픽셀은 훼손 안 함)
   3) 보정·필터  rebuild(img)
      - 원터치 프리셋 7종 + 슬라이더 4종(밝기·대비·채도·흐림)
      - 상태는 img.kmPhoto = {mask, preset, b, c, s, blur}
        (kmake.js toObject extras에 'kmPhoto' 포함 — 직렬화 보존)
      - fabric 필터 배열 자체도 fabric이 직렬화·복원한다
   4) 슬롯 교체 상속: 사진을 바꿔도 마스크·보정·모션이 유지된다
      (kmake.js imgInput 핸들러에서 KM_PHOTO.inherit 호출)
   ============================================================ */
(function () {
  'use strict';

  // 큰 사진 필터링을 위한 WebGL 텍스처 상한 (기본 2048 → 4096)
  if (window.fabric) fabric.textureSize = 4096;

  var MAX_SIDE = 2560; // 업로드 다운스케일 상한

  /* ============ 1. 파일 입구 ============ */

  function loadHeicLib(cb, err) {
    if (window.heic2any) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
    s.onload = cb; s.onerror = err;
    document.head.appendChild(s);
  }

  function isHeic(file) {
    return /heic|heif/i.test(file.type || '') || /\.(heic|heif)$/i.test(file.name || '');
  }

  // file → 정규화된 dataURL (HEIC 변환 + 다운스케일). cb(dataURL) / fail(msg)
  function loadImageFile(file, cb, fail) {
    fail = fail || function (m) { if (window.toast) toast(m); };
    var next = function (blob, keepPng) {
      var r = new FileReader();
      r.onload = function (ev) { normalizeSize(ev.target.result, keepPng, cb, fail); };
      r.onerror = function () { fail('사진을 읽을 수 없어요'); };
      r.readAsDataURL(blob);
    };
    if (isHeic(file)) {
      loadHeicLib(function () {
        heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
          .then(function (out) { next(Array.isArray(out) ? out[0] : out, false); })
          .catch(function () { fail('아이폰 사진(HEIC) 변환에 실패했어요'); });
      }, function () { fail('HEIC 변환기를 불러올 수 없어요 — 네트워크를 확인해 주세요'); });
    } else {
      next(file, /png$/i.test(file.type || ''));
    }
  }

  // 최대 변 초과 시 캔버스 리샘플. PNG는 알파 보존을 위해 PNG 유지.
  function normalizeSize(dataURL, keepPng, cb, fail) {
    var im = new Image();
    im.onload = function () {
      var w = im.naturalWidth, h = im.naturalHeight;
      if (!w || !h) return fail('사진을 해석할 수 없어요');
      if (Math.max(w, h) <= MAX_SIDE) return cb(dataURL);
      var k = MAX_SIDE / Math.max(w, h);
      var c = document.createElement('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(keepPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.92));
    };
    im.onerror = function () { fail('사진을 열 수 없어요'); };
    im.src = dataURL;
  }

  /* ============ 2. 셰이프 마스크 ============ */
  // aspect: 고정 비율(w/h) — null이면 사진 비율 유지(크롭 없음)
  // make(W,H): 이미지 로컬 좌표(크롭 후 W×H) 기준 클립 도형

  function heartPath(W, H) {
    var x = W / 100, y = H / 100;
    return 'M' + 50 * x + ' ' + 90 * y +
      ' C' + 18 * x + ' ' + 64 * y + ' ' + 2 * x + ' ' + 45 * y + ' ' + 2 * x + ' ' + 28 * y +
      ' C' + 2 * x + ' ' + 12 * y + ' ' + 14 * x + ' ' + 3 * y + ' ' + 27 * x + ' ' + 3 * y +
      ' C' + 37 * x + ' ' + 3 * y + ' ' + 45 * x + ' ' + 9 * y + ' ' + 50 * x + ' ' + 19 * y +
      ' C' + 55 * x + ' ' + 9 * y + ' ' + 63 * x + ' ' + 3 * y + ' ' + 73 * x + ' ' + 3 * y +
      ' C' + 86 * x + ' ' + 3 * y + ' ' + 98 * x + ' ' + 12 * y + ' ' + 98 * x + ' ' + 28 * y +
      ' C' + 98 * x + ' ' + 45 * y + ' ' + 82 * x + ' ' + 64 * y + ' ' + 50 * x + ' ' + 90 * y + ' Z';
  }
  function archPath(W, H) { // 위 반원 + 직선 옆·바닥 (웨딩 아치)
    var r = W / 2;
    return 'M0 ' + H + ' L0 ' + r + ' A' + r + ' ' + r + ' 0 0 1 ' + W + ' ' + r + ' L' + W + ' ' + H + ' Z';
  }
  function polyPoints(n, W, H, rot) { // 정다각형
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2, pts = [];
    for (var i = 0; i < n; i++) {
      var a = rot + i * 2 * Math.PI / n;
      pts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
    }
    return pts;
  }
  function starPoints(W, H) {
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2, r = R * 0.45, pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      pts.push({ x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) });
    }
    return pts;
  }
  function scallopPath(W, H) { // 꽃 도장 — 12개 부채 호
    var n = 12, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2, inner = R * 0.88;
    var d = '', bump = R * 0.30;
    for (var i = 0; i < n; i++) {
      var a1 = i * 2 * Math.PI / n - Math.PI / 2, a2 = (i + 1) * 2 * Math.PI / n - Math.PI / 2;
      var x1 = cx + inner * Math.cos(a1), y1 = cy + inner * Math.sin(a1);
      var x2 = cx + inner * Math.cos(a2), y2 = cy + inner * Math.sin(a2);
      d += (i ? 'L' : 'M') + x1 + ' ' + y1 + ' A' + bump + ' ' + bump + ' 0 0 1 ' + x2 + ' ' + y2 + ' ';
    }
    return d + 'Z';
  }

  var MASKS = [
    { key: 'none',    n: '원본',     aspect: null,
      make: null,
      thumb: '<rect x="5" y="8" width="26" height="20" rx="2"/>' },
    { key: 'circle',  n: '원형',     aspect: 1,
      make: function (W, H) { return new fabric.Circle({ radius: W / 2 }); },
      thumb: '<circle cx="18" cy="18" r="12"/>' },
    { key: 'oval',    n: '타원',     aspect: null,
      make: function (W, H) { return new fabric.Ellipse({ rx: W / 2, ry: H / 2 }); },
      thumb: '<ellipse cx="18" cy="18" rx="13" ry="9"/>' },
    { key: 'arch',    n: '아치',     aspect: 3 / 4,
      make: function (W, H) { return new fabric.Path(archPath(W, H)); },
      thumb: '<path d="M9 30 L9 15 A9 9 0 0 1 27 15 L27 30 Z"/>' },
    { key: 'heart',   n: '하트',     aspect: 1,
      make: function (W, H) { return new fabric.Path(heartPath(W, H)); },
      thumb: '<path d="M18 29 C9 22 5 17 5 12 C5 8 8 5.5 11.5 5.5 C14 5.5 16.5 7 18 10 C19.5 7 22 5.5 24.5 5.5 C28 5.5 31 8 31 12 C31 17 27 22 18 29 Z"/>' },
    { key: 'squircle', n: '둥근',    aspect: null,
      make: function (W, H) { return new fabric.Rect({ width: W, height: H, rx: Math.min(W, H) * 0.16, ry: Math.min(W, H) * 0.16 }); },
      thumb: '<rect x="6" y="8" width="24" height="20" rx="6"/>' },
    { key: 'hex',     n: '육각',     aspect: 1,
      make: function (W, H) { return new fabric.Polygon(polyPoints(6, W, H, -Math.PI / 2)); },
      thumb: '<path d="M18 5 L29 11.5 L29 24.5 L18 31 L7 24.5 L7 11.5 Z"/>' },
    { key: 'star',    n: '별',       aspect: 1,
      make: function (W, H) { return new fabric.Polygon(starPoints(W, H)); },
      thumb: '<path d="M18 4 L21.3 13.2 L31 13.5 L23.4 19.6 L26 29 L18 23.5 L10 29 L12.6 19.6 L5 13.5 L14.7 13.2 Z"/>' },
    { key: 'flower',  n: '꽃도장',   aspect: 1,
      make: function (W, H) { return new fabric.Path(scallopPath(W, H)); },
      thumb: '<circle cx="18" cy="18" r="10"/><circle cx="18" cy="7" r="4"/><circle cx="28" cy="13" r="4"/><circle cx="28" cy="23" r="4"/><circle cx="18" cy="29" r="4"/><circle cx="8" cy="23" r="4"/><circle cx="8" cy="13" r="4"/>' },
  ];
  var MASK_OF = {}; MASKS.forEach(function (m) { MASK_OF[m.key] = m; });

  function naturalDims(img) {
    var el = img._originalElement || img._element;
    return { w: (el && (el.naturalWidth || el.width)) || img.width, h: (el && (el.naturalHeight || el.height)) || img.height };
  }

  // 마스크 적용. 화면상 크기(표시 폭)는 유지된다.
  function applyMask(img, key) {
    var m = MASK_OF[key] || MASK_OF.none;
    var keepW = img.getScaledWidth();
    var nat = naturalDims(img);

    if (m.aspect) { // 고정 비율 → 중앙 크롭
      var cw, ch;
      if (nat.w / nat.h > m.aspect) { ch = nat.h; cw = nat.h * m.aspect; }
      else { cw = nat.w; ch = nat.w / m.aspect; }
      img.set({ cropX: (nat.w - cw) / 2, cropY: (nat.h - ch) / 2, width: cw, height: ch });
    } else { // 사진 비율 유지 → 크롭 원복
      img.set({ cropX: 0, cropY: 0, width: nat.w, height: nat.h });
    }

    if (m.make) {
      var clip = m.make(img.width, img.height);
      clip.set({ originX: 'center', originY: 'center', left: 0, top: 0 });
      img.clipPath = clip;
    } else {
      img.clipPath = null;
    }

    img.kmPhoto = Object.assign({}, img.kmPhoto || {}, { mask: m.key });
    img.scaleToWidth(keepW);
    img.setCoords(); img.dirty = true;
  }

  /* ============ 3. 보정·필터 ============ */

  function F() { return fabric.Image.filters; }
  var PRESETS = [
    { key: 'none',  n: '원본',   build: function () { return []; } },
    { key: 'gray',  n: '흑백',   build: function () { return [new (F().Grayscale)()]; } },
    { key: 'sepia', n: '세피아', build: function () { return [new (F().Sepia)()]; } },
    { key: 'film',  n: '필름',   build: function () { // 바랜 웜톤 + 옅은 대비
        return [new (F().ColorMatrix)({ matrix: [1.05, 0, 0, 0, 0.02, 0, 1.0, 0, 0, 0.02, 0, 0, 0.92, 0, 0.035, 0, 0, 0, 1, 0] }),
                new (F().Contrast)({ contrast: 0.06 })]; } },
    { key: 'vivid', n: '화사',   build: function () {
        return [new (F().Saturation)({ saturation: 0.25 }), new (F().Brightness)({ brightness: 0.06 }), new (F().Contrast)({ contrast: 0.05 })]; } },
    { key: 'cinema', n: '시네마', build: function () { // 차분한 저채도 + 푸른 기
        return [new (F().Saturation)({ saturation: -0.25 }), new (F().Contrast)({ contrast: 0.12 }),
                new (F().ColorMatrix)({ matrix: [0.96, 0, 0, 0, 0, 0, 0.99, 0, 0, 0, 0, 0, 1.06, 0, 0.01, 0, 0, 0, 1, 0] })]; } },
    { key: 'warm',  n: '포근',   build: function () {
        return [new (F().ColorMatrix)({ matrix: [1.08, 0, 0, 0, 0.02, 0, 1.0, 0, 0, 0.01, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] }),
                new (F().Brightness)({ brightness: 0.03 })]; } },
  ];
  var PRESET_OF = {}; PRESETS.forEach(function (p) { PRESET_OF[p.key] = p; });

  function photoState(img) {
    return Object.assign({ mask: 'none', preset: 'none', b: 0, c: 0, s: 0, blur: 0 }, img.kmPhoto || {});
  }

  // kmPhoto 상태 → 필터 배열 재구성 (프리셋 먼저, 슬라이더 나중 — 순서 고정)
  function rebuild(img) {
    var st = photoState(img);
    var arr = (PRESET_OF[st.preset] || PRESET_OF.none).build();
    if (st.b) arr.push(new (F().Brightness)({ brightness: st.b / 100 }));
    if (st.c) arr.push(new (F().Contrast)({ contrast: st.c / 100 }));
    if (st.s) arr.push(new (F().Saturation)({ saturation: st.s / 100 }));
    if (st.blur) arr.push(new (F().Blur)({ blur: st.blur / 100 }));
    img.filters = arr;
    img.applyFilters();
    img.kmPhoto = st;
    img.dirty = true;
  }

  /* ============ 4. 슬롯 교체 상속 ============ */
  // 새 사진(img)에 이전 사진(t)의 마스크·보정·모션을 물려준다.
  function inherit(img, t) {
    if (t.anim) img.anim = JSON.parse(JSON.stringify(t.anim));
    if (t.kmPhoto) {
      img.kmPhoto = Object.assign({}, t.kmPhoto);
      applyMask(img, img.kmPhoto.mask || 'none'); // 새 원본 치수 기준 재계산
      img.scaleToWidth(t.getScaledWidth());       // 표시 크기 = 이전 것
      rebuild(img);
    }
  }

  /* ============ 5. 속성 패널 UI ============ */

  function panelHTML(o) {
    var st = photoState(o);
    var maskChips = MASKS.map(function (m) {
      return '<button class="pm-chip' + (st.mask === m.key ? ' on' : '') + '" data-mask="' + m.key + '" title="' + m.n + '">' +
        '<svg viewBox="0 0 36 36">' + m.thumb + '</svg><span>' + m.n + '</span></button>';
    }).join('');
    var presetChips = PRESETS.map(function (p) {
      return '<button class="pf-chip' + (st.preset === p.key ? ' on' : '') + '" data-preset="' + p.key + '">' + p.n + '</button>';
    }).join('');
    var slider = function (id, label, min, max, v, unit) {
      return '<div class="field"><label>' + label + '</label><div class="range-row">' +
        '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" value="' + v + '">' +
        '<span class="val" id="' + id + 'V">' + v + (unit || '') + '</span></div></div>';
    };
    return '<div class="panel-sec"><h3>📐 사진 모양</h3><div class="pm-grid">' + maskChips + '</div></div>' +
      '<div class="panel-sec"><h3>🎞 보정</h3><div class="pf-row">' + presetChips + '</div>' +
      slider('phB', '밝기', -30, 30, st.b) + slider('phC', '대비', -30, 30, st.c) +
      slider('phS', '채도', -50, 50, st.s) + slider('phBlur', '흐림', 0, 30, st.blur) +
      '<button class="tb-btn" id="phSwap" style="width:100%;justify-content:center;margin-top:4px">📷 사진 바꾸기</button></div>';
  }

  function bindPanel(o, hooks) {
    // hooks: { render, pushHistory, rebuildPanel, requestSwap }
    var $ = function (id) { return document.getElementById(id); };
    document.querySelectorAll('.pm-chip').forEach(function (b) {
      b.onclick = function () {
        applyMask(o, b.dataset.mask);
        hooks.render(); hooks.pushHistory(); hooks.rebuildPanel(o);
      };
    });
    document.querySelectorAll('.pf-chip').forEach(function (b) {
      b.onclick = function () {
        o.kmPhoto = Object.assign(photoState(o), { preset: b.dataset.preset });
        rebuild(o); hooks.render(); hooks.pushHistory(); hooks.rebuildPanel(o);
      };
    });
    [['phB', 'b'], ['phC', 'c'], ['phS', 's'], ['phBlur', 'blur']].forEach(function (pair) {
      var el = $(pair[0]); if (!el) return;
      el.oninput = function () {
        $(pair[0] + 'V').textContent = el.value;
        o.kmPhoto = Object.assign(photoState(o), (function (x) { var t = {}; t[pair[1]] = +el.value; return t; })());
        rebuild(o); hooks.render();
      };
      el.onchange = function () { hooks.pushHistory(); };
    });
    if ($('phSwap')) $('phSwap').onclick = function () { hooks.requestSwap(o); };
  }

  window.KM_PHOTO = {
    loadImageFile: loadImageFile,
    applyMask: applyMask,
    rebuild: rebuild,
    inherit: inherit,
    panelHTML: panelHTML,
    bindPanel: bindPanel,
    MASKS: MASKS,
    PRESETS: PRESETS,
  };
})();
