/* ============================================================
   MK_CHROMA — R136 크로마키: 초록 천 뒤의 나를 어디든 데려간다
   ------------------------------------------------------------
   준호: 「케이메이커에 크로마키 기능 — 사진 같은 거 활용할 수 있도록」.
   교실 크로마키 3대장(초록 천·파란 도화지·흰 벽)을 API 0 으로 처리한다.
   사진은 기기 밖으로 한 바이트도 안 나간다 (R134·R135 원칙 유지).

   층은 R134·R135 와 동일한 둘:
   ① 순수 로직 (DOM 무의존 — 하니스가 실실행)
      · 색 공간: YCbCr — RGB 거리보다 조명 변화에 강하다.
        키색 채도에 따라 밝기 가중을 자동 조절: 초록/파랑(유채색)은
        밝기를 거의 무시(그늘진 천도 잡힘), 흰 벽(무채색)은 밝기가
        곧 신호라 가중을 올린다. 공식 하나로 3대장 전부 처리.
      · 알파: 문턱(tol) ± 부드러움(soft) 2단 램프 — 계단 경계 0.
        기존 알파와 곱 — 이미 투명한 PNG 를 다시 키잉해도 안전.
      · 스필 제거: 키 우세 채널을 나머지 둘 평균으로 클램프
        (g = min(g, (r+b)/2) 계열) — 인물 테두리의 초록 물듦 제거.
        무채색 키(흰 벽)는 스필이 없으므로 자동 생략.
      · 자동 키색: 네 모서리 패치 → 서로 가까운 다수파 평균.
      전부 결정적 — 같은 입력 = 같은 바이트.
   ② 작업창 (open 으로만 생성 — 로드 시 DOM 접촉 0)
      체커보드 위 실시간 미리보기 + 키색 칩(자동·초록·파랑·흰색) +
      🎯 콕 찍기(미리보기를 눌러 그 색을 키로) + 범위·부드러움
      슬라이더 + 테두리 색 빼기 토글.
      결과 = 원본 해상도 **PNG** dataURL (알파 필수) → el.src 교체가
      전부 (스키마 0 — render·play·export 전 경로 공짜로 옳음).

   학생 화면(workspace) 무접촉 — 진입은 에디터 사진 패널 한 곳.
   ============================================================ */
window.MK_CHROMA = (() => {
  'use strict';

  var WORK_MAX = 420;      /* 미리보기 작업 해상도(긴 변) — R135 동일 */
  var FULL_MAX = 2560;     /* 적용 상한 — intake(1920) 여유 */

  /* ================================================================
     ① 순수 로직 — 여기부터 sampleAuto 끝까지 DOM 무의존
     ================================================================ */

  /* RGB → YCbCr (BT.601, 풀레인지). Cb/Cr 은 0 중심(-128..127). */
  function toYCC(r, g, b) {
    return [
      0.299 * r + 0.587 * g + 0.114 * b,
      -0.169 * r - 0.331 * g + 0.5 * b,
      0.5 * r - 0.419 * g - 0.081 * b,
    ];
  }

  /* 키색 → 판정 파라미터 한 번만 계산 */
  function keyParams(color) {
    var k = toYCC(color[0], color[1], color[2]);
    var sat = Math.min(1, Math.sqrt(k[1] * k[1] + k[2] * k[2]) / 64);
    /* 유채색 키(초록·파랑): 밝기 거의 무시(0.18) — 그늘도 같은 색.
       무채색 키(흰 벽): 밝기가 곧 신호 — 가중 1.0. 사이는 보간. */
    var wY = 1.0 - 0.82 * sat;
    /* 스필 우세 채널: 키가 충분히 유채색일 때만 (dom=-1 이면 생략) */
    var dom = -1, mx = Math.max(color[0], color[1], color[2]);
    if (sat > 0.25) dom = color.indexOf(mx);
    return { y: k[0], cb: k[1], cr: k[2], wY: wY, dom: dom };
  }

  /* 한 픽셀의 키 거리 */
  function pxDist(r, g, b, P) {
    var c = toYCC(r, g, b);
    var dy = (c[0] - P.y) * P.wY, db = c[1] - P.cb, dr = c[2] - P.cr;
    return Math.sqrt(dy * dy + db * db + dr * dr);
  }

  /* 거리 → 알파(0..1). t0 이하 = 0, t0+band 이상 = 1, 사이 = 램프 */
  function alphaOf(d, t0, band) {
    if (d <= t0) return 0;
    if (d >= t0 + band) return 1;
    var t = (d - t0) / band;
    return t * t * (3 - 2 * t); /* smoothstep — 경계 부드럽게 */
  }

  /* 본체. opts = { color:[r,g,b], tol:0..100, soft:0..100, spill:bool }
     rgba 원본은 훼손하지 않는다 — 새 버퍼 반환. */
  function keyOut(rgba, w, h, opts) {
    var color = (opts && opts.color) || [0, 200, 60];
    var tol = opts && isFinite(opts.tol) ? +opts.tol : 35;
    var soft = opts && isFinite(opts.soft) ? +opts.soft : 30;
    var spill = !opts || opts.spill !== false;
    var P = keyParams(color);
    var t0 = tol * 1.15;             /* 슬라이더 → YCC 거리 눈금 */
    var band = 4 + soft * 0.9;
    var out = new Uint8ClampedArray(rgba.length);
    var n = w * h;
    for (var i = 0; i < n; i++) {
      var p = i * 4;
      var r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
      var a = alphaOf(pxDist(r, g, b, P), t0, band);
      if (spill && P.dom >= 0 && a > 0) {
        /* 우세 채널을 나머지 둘 평균으로 클램프 — 초록 테두리 소멸 */
        var o1 = P.dom === 0 ? g : r, o2 = P.dom === 2 ? g : b;
        var lim = (o1 + o2) / 2;
        var v = P.dom === 0 ? r : P.dom === 1 ? g : b;
        if (v > lim) { if (P.dom === 0) r = lim; else if (P.dom === 1) g = lim; else b = lim; }
      }
      out[p] = r; out[p + 1] = g; out[p + 2] = b;
      out[p + 3] = Math.round(rgba[p + 3] * a); /* 기존 알파와 곱 */
    }
    return out;
  }

  /* 자동 키색 — 네 모서리 패치 평균 → 서로 가까운 다수파의 평균 */
  function sampleAuto(rgba, w, h) {
    var pw = Math.max(2, Math.round(w * 0.06));
    var ph = Math.max(2, Math.round(h * 0.06));
    var corners = [[0, 0], [w - pw, 0], [0, h - ph], [w - pw, h - ph]];
    var avgs = corners.map(function (c) {
      var sr = 0, sg = 0, sb = 0, cnt = 0;
      for (var y = c[1]; y < c[1] + ph; y++) for (var x = c[0]; x < c[0] + pw; x++) {
        var p = (y * w + x) * 4;
        sr += rgba[p]; sg += rgba[p + 1]; sb += rgba[p + 2]; cnt++;
      }
      return [sr / cnt, sg / cnt, sb / cnt];
    });
    var d2 = function (a, b2) {
      var dr = a[0] - b2[0], dg = a[1] - b2[1], db = a[2] - b2[2];
      return dr * dr + dg * dg + db * db;
    };
    var best = 0, bestPeers = -1;
    var peersOf = avgs.map(function (a, i) {
      var peers = [];
      avgs.forEach(function (b2, j) { if (i !== j && d2(a, b2) < 60 * 60) peers.push(j); });
      return peers;
    });
    peersOf.forEach(function (ps, i) { if (ps.length > bestPeers) { bestPeers = ps.length; best = i; } });
    var members = [best].concat(peersOf[best]);
    var mr = 0, mg = 0, mb = 0;
    members.forEach(function (i) { mr += avgs[i][0]; mg += avgs[i][1]; mb += avgs[i][2]; });
    var m = members.length;
    return [Math.round(mr / m), Math.round(mg / m), Math.round(mb / m)];
  }

  function fitWork(w, h, max) {
    var long = Math.max(w, h);
    if (long <= max) return { w: w, h: h };
    var s = max / long;
    return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
  }

  /* 키색 프리셋 — 교실 3대장 + 자동 */
  var CHIPS = [
    { id: 'auto',  emoji: '🪄', name: '자동',  color: null },
    { id: 'green', emoji: '🟩', name: '초록',  color: [40, 190, 70] },
    { id: 'blue',  emoji: '🟦', name: '파랑',  color: [40, 90, 210] },
    { id: 'white', emoji: '⬜', name: '흰색',  color: [245, 245, 245] },
  ];

  /* ================================================================
     ② 작업창 — open() 으로만 생성 (R135 규약 계승)
     ================================================================ */
  var BTN = 'padding:7px 11px;border:1px solid var(--mk-border,#E3E8EF);border-radius:9px;background:var(--mk-surface,#fff);font-size:12.5px;cursor:pointer;';
  var CHECKER = 'background:repeating-conic-gradient(#CBD5E1 0 25%,#F1F5F9 0 50%) 0 0/16px 16px;';

  function open(opts) {
    if (!opts || !opts.src) return;
    var doc = document;
    var st = {
      color: null,        /* 확정 전엔 null — 자동이 첫 진입에서 채운다 */
      chip: 'auto',
      tol: 35, soft: 30, spill: true,
      picking: false, showOrig: false,
      work: null, ww: 0, wh: 0, busy: false,
    };

    var root = doc.createElement('div');
    root.setAttribute('data-mkchroma', '1');
    root.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(15,23,32,.88);display:flex;align-items:center;justify-content:center;padding:14px;';
    root.innerHTML =
      '<div style="background:var(--mk-surface,#fff);border-radius:16px;max-width:min(96vw,880px);max-height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.4)">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--mk-border,#E3E8EF)">' +
        '<strong style="font-size:15px">🟩 배경 지우기 (크로마키)</strong>' +
        '<span data-ck="msg" style="flex:1;font-size:12.5px;color:var(--mk-muted,#6B7280)">배경색을 찾는 중… — 사진은 이 기기 밖으로 나가지 않아요</span>' +
        '<button data-ck="close" style="border:none;background:none;font-size:18px;cursor:pointer;line-height:1">✕</button></div>' +
      '<div style="position:relative;flex:1;min-height:200px;display:flex;align-items:center;justify-content:center;background:#0F1720">' +
        '<canvas data-ck="cv" style="max-width:100%;max-height:min(56vh,520px);' + CHECKER + '"></canvas>' +
        '<div data-ck="busy" style="display:none;position:absolute;inset:0;background:rgba(15,23,32,.55);color:#fff;align-items:center;justify-content:center;font-size:14px">지우는 중…</div></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--mk-border,#E3E8EF)">' +
        CHIPS.map(function (C) {
          return '<button data-ckchip="' + C.id + '" style="' + BTN + '">' + C.emoji + ' ' + C.name + '</button>';
        }).join('') +
        '<button data-ck="pick" style="' + BTN + '">🎯 콕 찍기</button>' +
        '<span style="font-size:12px;color:var(--mk-muted,#6B7280);display:flex;align-items:center;gap:5px">지울 색' +
        '<i data-ck="swatch" style="width:20px;height:20px;border-radius:6px;border:1px solid var(--mk-border,#E3E8EF);display:inline-block"></i></span></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 14px">' +
        '<label style="font-size:12.5px;display:flex;align-items:center;gap:6px">범위 <input data-ck="tol" type="range" min="5" max="100" value="35" style="width:130px"></label>' +
        '<label style="font-size:12.5px;display:flex;align-items:center;gap:6px">부드럽게 <input data-ck="soft" type="range" min="0" max="100" value="30" style="width:130px"></label>' +
        '<label style="font-size:12.5px;display:flex;align-items:center;gap:5px;cursor:pointer"><input data-ck="spill" type="checkbox" checked> 테두리 색 빼기</label>' +
        '<span style="flex:1"></span>' +
        '<button data-ck="orig" style="' + BTN + '">↺ 원본 보기</button>' +
        '<button data-ck="apply" style="' + BTN + 'background:#14B8A6;color:#fff;border-color:#14B8A6;" disabled>✔ 투명하게 적용</button></div>' +
      '</div>';
    doc.body.appendChild(root);

    var $ = function (k) { return root.querySelector('[data-ck="' + k + '"]'); };
    var cv = $('cv'), ctx = cv.getContext && cv.getContext('2d');
    var setMsg = function (t) { $('msg').textContent = t; };
    var setBusy = function (b) { st.busy = b; $('busy').style.display = b ? 'flex' : 'none'; };
    function close() { try { root.remove(); } catch (_) { if (root.parentNode) root.parentNode.removeChild(root); } }
    $('close').onclick = close;

    function refreshChips() {
      root.querySelectorAll('[data-ckchip]').forEach(function (b) {
        var on = b.dataset.ckchip === st.chip;
        b.style.background = on ? '#E6FAF7' : '';
        b.style.borderColor = on ? '#14B8A6' : 'var(--mk-border,#E3E8EF)';
      });
      var pk = $('pick');
      pk.style.background = st.picking ? '#FEF3C7' : '';
      pk.style.borderColor = st.picking ? '#F59E0B' : 'var(--mk-border,#E3E8EF)';
      if (st.color) $('swatch').style.background = 'rgb(' + st.color.join(',') + ')';
      $('apply').disabled = !st.color;
    }

    function paint() {
      if (!ctx || !st.work) return;
      cv.width = st.ww; cv.height = st.wh;
      if (st.showOrig || !st.color) {
        ctx.putImageData(new window.ImageData(new Uint8ClampedArray(st.work), st.ww, st.wh), 0, 0);
        return;
      }
      var out = keyOut(st.work, st.ww, st.wh, { color: st.color, tol: st.tol, soft: st.soft, spill: st.spill });
      ctx.putImageData(new window.ImageData(out, st.ww, st.wh), 0, 0);
    }

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
      /* 첫 진입 = 자동 키색 — 바로 결과를 보여준다 (빈 화면 0) */
      st.color = sampleAuto(st.work, st.ww, st.wh);
      setMsg('모서리에서 배경색을 찾았어요 — 범위를 조절하거나 🎯로 직접 찍어 보세요');
      refreshChips(); paint();
    };
    img.onerror = function () { setMsg('사진을 열 수 없어요'); };
    img.src = opts.src;

    root.querySelectorAll('[data-ckchip]').forEach(function (b) {
      b.onclick = function () {
        if (st.busy || !st.work) return;
        var C = CHIPS.filter(function (c) { return c.id === b.dataset.ckchip; })[0];
        st.chip = C.id; st.picking = false; st.showOrig = false;
        st.color = C.color ? C.color.slice() : sampleAuto(st.work, st.ww, st.wh);
        setMsg(C.emoji + ' ' + C.name + ' 배경을 지워요 — 남은 자국은 범위를 올려 보세요');
        refreshChips(); paint();
      };
    });

    $('pick').onclick = function () {
      if (st.busy || !st.work) return;
      st.picking = !st.picking;
      setMsg(st.picking ? '사진에서 지우고 싶은 색을 눌러 주세요' : '콕 찍기를 껐어요');
      refreshChips();
    };

    cv.onclick = function (ev) {
      if (!st.picking || !st.work) return;
      var r = cv.getBoundingClientRect();
      var x = Math.round((ev.clientX - r.left) / r.width * st.ww);
      var y = Math.round((ev.clientY - r.top) / r.height * st.wh);
      x = Math.max(1, Math.min(st.ww - 2, x)); y = Math.max(1, Math.min(st.wh - 2, y));
      var sr = 0, sg = 0, sb = 0; /* 3×3 평균 — 노이즈 한 픽셀에 안 속게 */
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var p = ((y + dy) * st.ww + (x + dx)) * 4;
        sr += st.work[p]; sg += st.work[p + 1]; sb += st.work[p + 2];
      }
      st.color = [Math.round(sr / 9), Math.round(sg / 9), Math.round(sb / 9)];
      st.chip = ''; st.picking = false; st.showOrig = false;
      setMsg('찍은 색을 지워요 — 범위·부드럽게로 다듬어 보세요');
      refreshChips(); paint();
    };

    $('tol').oninput = function () { st.tol = +this.value; st.showOrig = false; paint(); };
    $('soft').oninput = function () { st.soft = +this.value; st.showOrig = false; paint(); };
    $('spill').onchange = function () { st.spill = this.checked; st.showOrig = false; paint(); };
    $('orig').onclick = function () {
      st.showOrig = !st.showOrig; paint();
      setMsg(st.showOrig ? '원본이에요 — 다시 누르면 결과로 돌아가요' : '결과 미리보기예요');
    };

    $('apply').onclick = function () {
      if (!st.color || st.busy || !ctx) return;
      setBusy(true);
      setTimeout(function () {
        try {
          var fw = fitWork(img.naturalWidth || img.width, img.naturalHeight || img.height, FULL_MAX);
          var fc = doc.createElement('canvas');
          fc.width = fw.w; fc.height = fw.h;
          var fx = fc.getContext('2d', { willReadFrequently: true });
          fx.drawImage(img, 0, 0, fw.w, fw.h);
          var full = fx.getImageData(0, 0, fw.w, fw.h).data;
          var out = keyOut(full, fw.w, fw.h, { color: st.color, tol: st.tol, soft: st.soft, spill: st.spill });
          fx.putImageData(new window.ImageData(out, fw.w, fw.h), 0, 0);
          var url = fc.toDataURL('image/png'); /* 알파 필수 — 무조건 PNG */
          setBusy(false); close();
          if (opts.onApply) opts.onApply(url, '크로마키 — 배경 투명');
        } catch (_) { setBusy(false); setMsg('지우다가 문제가 생겼어요 — 다시 시도해 주세요'); }
      }, 30);
    };
  }

  /* ---- 계약 자기 검증 ---- */
  function verify() {
    var v = [];
    ['toYCC', 'keyParams', 'pxDist', 'alphaOf', 'keyOut', 'sampleAuto', 'fitWork', 'open'].forEach(function (k) {
      if (typeof api[k] !== 'function') v.push('missing:' + k);
    });
    if (!Array.isArray(CHIPS) || CHIPS.length < 4) v.push('chips<4');
    var ids = {};
    CHIPS.forEach(function (C) { if (ids[C.id]) v.push('dup:' + C.id); ids[C.id] = 1; });
    return { ok: !v.length, violations: v };
  }

  var api = {
    WORK_MAX: WORK_MAX, CHIPS: CHIPS,
    toYCC: toYCC, keyParams: keyParams, pxDist: pxDist, alphaOf: alphaOf,
    keyOut: keyOut, sampleAuto: sampleAuto, fitWork: fitWork,
    open: open, verify: verify,
  };
  return api;
})();
