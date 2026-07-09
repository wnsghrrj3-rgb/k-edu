/* ============================================================
   케이메이커 지능 편집 엔진 (KM_ALIGN) — 무기③ M3-1 (2026-07-09)
   ------------------------------------------------------------
   "끌면 자석처럼 붙고, 한 번에 정돈된다" — 캔바가 편한 실체.

   설계: kmake/KMAKE_3무기_설계.md M3-1. 오퍼스 몫.
   - 스냅: object:moving 훅 — 타 객체 좌/중/우·상/중/하 + 캔버스
     중앙·여백선 후보 캐시, 근접 6px 스냅 + 마젠타 1px 가이드(contextTop,
     포인터 통과). 간격 균등 가이드(좌우 이웃 등간격 스냅). Shift=해제.
   - 스케일: 모서리(우/하) 근접 스냅(origin=left/top일 때만 — 안전).
   - 정돈 팝오버(다중 선택): 정렬 6 · 균등 분배 2 · 크기 맞추기 2.
     그룹 좌표계 함정 → 그룹 해제→절대좌표 계산→재적용.

   구조 — 의존성 주입(엔진 코어 무수정):
     init({ getCanvas, getZoom, getBase, getMode, pushHistory, toast })
   순수 수학(alignRects·distributeRects·matchSize·snapValue)은
   node에서 module.exports로 스모크 검증한다.
   ⚠ 명시 상수: 스냅 6px · 가이드색 #EC4899. 임의 변경 금지.
   ============================================================ */
(function () {
  'use strict';

  var SNAP = 6;                 // 근접 임계(스크린 px) — 설계 명시값
  var GUIDE = '#EC4899';        // 마젠타

  /* ---------- 순수 수학(스모크) ---------- */
  // rects: [{left,top,width,height}] (절대좌표). op별 각 사각형 이동 델타.
  function alignRects(rects, op) {
    if (!rects.length) return [];
    var minL = Math.min.apply(null, rects.map(function (r) { return r.left; }));
    var maxR = Math.max.apply(null, rects.map(function (r) { return r.left + r.width; }));
    var minT = Math.min.apply(null, rects.map(function (r) { return r.top; }));
    var maxB = Math.max.apply(null, rects.map(function (r) { return r.top + r.height; }));
    var cX = (minL + maxR) / 2, cY = (minT + maxB) / 2;
    return rects.map(function (r) {
      var dx = 0, dy = 0;
      if (op === 'left') dx = minL - r.left;
      else if (op === 'right') dx = maxR - (r.left + r.width);
      else if (op === 'hcenter') dx = cX - (r.left + r.width / 2);
      else if (op === 'top') dy = minT - r.top;
      else if (op === 'bottom') dy = maxB - (r.top + r.height);
      else if (op === 'vcenter') dy = cY - (r.top + r.height / 2);
      return { dx: dx, dy: dy };
    });
  }

  // 균등 분배 — 중심을 양 끝 사이에 등간격 배치(원 순서 유지, ≥3에서 의미)
  function distributeRects(rects, axis) {
    var n = rects.length, out = rects.map(function () { return { dx: 0, dy: 0 }; });
    if (n < 3) return out;
    var horiz = axis === 'h';
    var idx = rects.map(function (r, i) {
      return { i: i, c: horiz ? r.left + r.width / 2 : r.top + r.height / 2 };
    }).sort(function (a, b) { return a.c - b.c; });
    var c0 = idx[0].c, cN = idx[n - 1].c, step = (cN - c0) / (n - 1);
    idx.forEach(function (o, k) {
      var target = c0 + k * step, d = target - o.c;
      if (horiz) out[o.i].dx = d; else out[o.i].dy = d;
    });
    return out;
  }

  // 크기 맞추기 — 최대 치수 기준 배율(적용: obj.scaleX *= f)
  function matchSize(rects, dim) {
    if (!rects.length) return [];
    var wKey = dim === 'w';
    var target = Math.max.apply(null, rects.map(function (r) { return wKey ? r.width : r.height; }));
    return rects.map(function (r) {
      var cur = wKey ? r.width : r.height;
      return { f: cur > 0 ? target / cur : 1 };
    });
  }

  // 근접 스냅: v가 후보 중 thr 이내면 {line,delta}
  function snapValue(v, cands, thr) {
    var best = null, bd = thr;
    for (var i = 0; i < cands.length; i++) {
      var d = Math.abs(v - cands[i]);
      if (d < bd) { bd = d; best = { line: cands[i], delta: cands[i] - v }; }
    }
    return best;
  }

  /* ============================================================
     브라우저 전용 (fabric·DOM). node 스모크는 위 순수 수학만 사용.
     ============================================================ */
  var H = null;
  function init(hooks) { H = hooks; ensureStyle(); }
  function C() { return H && H.getCanvas && H.getCanvas(); }
  function Z() { return (H && H.getZoom && H.getZoom()) || 1; }

  function absRect(o) {
    var r = o.getBoundingRect(true, true);
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }
  function edges(r) {
    return { l: r.left, cx: r.left + r.width / 2, right: r.left + r.width,
             t: r.top, cy: r.top + r.height / 2, b: r.top + r.height };
  }

  // 후보선 캐시(이동/스케일 시작 시 1회) — 성능 게이트(80객체)
  var cache = null;
  function buildCache(canvas, self) {
    var base = H.getBase(), vs = [0, base.w / 2, base.w], hs = [0, base.h / 2, base.h];
    var xs = [], ys = [];  // 등간격용 이웃 후보(중심)
    canvas.forEachObject(function (t) {
      if (t === self || t.group || t.kmType === 'background') return;
      var e = edges(absRect(t));
      vs.push(e.l, e.cx, e.right); hs.push(e.t, e.cy, e.b);
      xs.push({ e: e }); ys.push({ e: e });
    });
    cache = { vs: vs, hs: hs, objs: xs.map(function (o) { return o.e; }) };
  }

  function onMoving(e) {
    var canvas = C(); if (!canvas || (H.getMode && H.getMode() === 'fill')) return;
    var o = e.target; if (!o) return;
    var shift = e.e && e.e.shiftKey;
    if (!cache || e.__first) buildCache(canvas, o);
    if (!cache) buildCache(canvas, o);
    var thr = SNAP / Z();
    var er = edges(absRect(o));
    var gv = null, gh = null;

    if (!shift) {
      var sv = bestSnap([er.l, er.cx, er.right], cache.vs, thr);
      var sh = bestSnap([er.t, er.cy, er.b], cache.hs, thr);
      if (sv) { o.left += sv.delta; gv = sv.line; }
      if (sh) { o.top += sh.delta; gh = sh.line; }
      o.setCoords();
    }
    // 간격 균등 스냅(좌우/상하 이웃 등간격)
    var eq = shift ? null : equalSpacing(o);
    if (eq) { o.setCoords(); }
    drawGuides(gv, gh, eq);
  }
  function bestSnap(vals, cands, thr) {
    var best = null;
    vals.forEach(function (v) { var s = snapValue(v, cands, thr); if (s && (!best || Math.abs(s.delta) < Math.abs(best.delta))) best = s; });
    return best;
  }

  // 이동 객체 o가 같은 행/열의 좌우(상하) 이웃과 등간격이 되도록 스냅
  function equalSpacing(o) {
    if (!cache || !cache.objs.length) return null;
    var thr = SNAP / Z(), er = edges(absRect(o));
    // 가로: o와 세로 범위 겹치는 이웃
    var row = cache.objs.filter(function (e) { return e.b > er.t && e.t < er.b; });
    var eqx = spacingAxis(er.cx, row.map(function (e) { return e.cx; }), thr);
    if (eqx != null) { o.left += (eqx - er.cx); return { type: 'x', pos: [eqx], cy: er.cy }; }
    // 세로
    var col = cache.objs.filter(function (e) { return e.right > er.l && e.l < er.right; });
    var eqy = spacingAxis(er.cy, col.map(function (e) { return e.cy; }), thr);
    if (eqy != null) { o.top += (eqy - er.cy); return { type: 'y', pos: [eqy], cx: er.cx }; }
    return null;
  }
  // 중심 c의 양쪽 최근접 이웃 사이 중점에 스냅(등간격의 가장 흔한 경우)
  function spacingAxis(c, centers, thr) {
    var left = null, right = null;
    centers.forEach(function (p) {
      if (p < c) { if (left == null || p > left) left = p; }
      else if (p > c) { if (right == null || p < right) right = p; }
    });
    if (left == null || right == null) return null;
    var mid = (left + right) / 2;
    return Math.abs(c - mid) < thr ? mid : null;
  }

  function onScaling(e) {
    var canvas = C(); if (!canvas || (H.getMode && H.getMode() === 'fill')) return;
    var o = e.target; if (!o || (e.e && e.e.shiftKey)) { drawGuides(null, null, null); return; }
    // 안전: 기본 origin(left/top)에서만 모서리 스냅(다른 origin은 오배치 위험 → 생략)
    if (o.originX !== 'left' || o.originY !== 'top') return;
    if (!cache) buildCache(canvas, o);
    var thr = SNAP / Z(), er = edges(absRect(o));
    var gv = null, gh = null;
    var sr = snapValue(er.right, cache.vs, thr);
    if (sr && o.width * o.scaleX > 8) { o.scaleX = (sr.line - o.left) / o.width; gv = sr.line; }
    var sb = snapValue(er.b, cache.hs, thr);
    if (sb && o.height * o.scaleY > 8) { o.scaleY = (sb.line - o.top) / o.height; gh = sb.line; }
    o.setCoords(); drawGuides(gv, gh, null);
  }

  function drawGuides(gv, gh, eq) {
    var canvas = C(); if (!canvas) return;
    var ctx = canvas.contextTop, z = Z();
    canvas.clearContext(ctx); ctx.save();
    ctx.strokeStyle = GUIDE; ctx.fillStyle = GUIDE; ctx.lineWidth = 1;
    if (gv != null) { var x = gv * z; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.getHeight()); ctx.stroke(); }
    if (gh != null) { var y = gh * z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.getWidth(), y); ctx.stroke(); }
    if (gv != null && gh != null) { ctx.beginPath(); ctx.arc(gv * z, gh * z, 3, 0, 7); ctx.fill(); }
    if (eq) {  // 등간격 표식: 스냅 축에 짧은 마젠타 마커
      ctx.setLineDash([4, 3]);
      if (eq.type === 'x') { var ex = eq.pos[0] * z, ey = eq.cy * z; ctx.beginPath(); ctx.moveTo(ex, ey - 14); ctx.lineTo(ex, ey + 14); ctx.stroke(); }
      else { var qx = eq.cx * z, qy = eq.pos[0] * z; ctx.beginPath(); ctx.moveTo(qx - 14, qy); ctx.lineTo(qx + 14, qy); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
  function clear() { var canvas = C(); if (canvas) canvas.clearContext(canvas.contextTop); cache = null; }

  /* ---------- 정돈 팝오버(다중 선택) ---------- */
  function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById('kmAlignStyle')) return;
    var css = document.createElement('style'); css.id = 'kmAlignStyle';
    css.textContent =
      '#kmAlignBar{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:29;display:none;' +
      'gap:2px;align-items:center;background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:12px;' +
      'padding:5px 8px;box-shadow:0 6px 20px rgba(0,0,0,.14);font-family:"Gowun Dodum",sans-serif}' +
      '#kmAlignBar.show{display:flex}' +
      '#kmAlignBar .ab{width:34px;height:34px;border:none;background:transparent;border-radius:8px;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;color:#334155}' +
      '#kmAlignBar .ab:hover{background:#F3F7FF;color:#2563eb}' +
      '#kmAlignBar .sep{width:1px;height:22px;background:var(--line-2,#eef2f7);margin:0 3px}' +
      '#kmAlignBar .lb{font-size:12px;color:#94a3b8;padding:0 6px;font-weight:700}';
    document.head.appendChild(css);
  }
  var BTNS = [
    ['left', '왼쪽 정렬', 'M4 4v16M8 8h8v3H8zM8 15h5v3H8z'],
    ['hcenter', '가로 가운데', 'M12 4v16M7 8h10v3H7zM9 15h6v3H9z'],
    ['right', '오른쪽 정렬', 'M20 4v16M8 8h8v3H8zM11 15h5v3h-5z'],
    ['sep'],
    ['top', '위 정렬', 'M4 4h16M8 8v8h3V8zM15 8v5h3V8z'],
    ['vcenter', '세로 가운데', 'M4 12h16M8 7v10h3V7zM15 9v6h3V9z'],
    ['bottom', '아래 정렬', 'M4 20h16M8 8v8h3V8zM15 11v5h3v-5z'],
    ['sep'],
    ['disth', '가로 분배', 'M4 4v16M20 4v16M10 9h4v6h-4z'],
    ['distv', '세로 분배', 'M4 4h16M4 20h16M9 10h6v4H9z'],
    ['sep'],
    ['sizew', '너비 맞추기', 'M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3'],
    ['sizeh', '높이 맞추기', 'M12 4v16M9 7l3-3 3 3M9 17l3 3 3-3'],
  ];
  function bar() {
    if (typeof document === 'undefined') return null;
    var b = document.getElementById('kmAlignBar'); if (b) return b;
    var wrap = document.getElementById('canvasWrap') || document.querySelector('.canvas-wrap'); if (!wrap) return null;
    b = document.createElement('div'); b.id = 'kmAlignBar';
    b.innerHTML = '<span class="lb">정돈</span>' + BTNS.map(function (x) {
      if (x[0] === 'sep') return '<span class="sep"></span>';
      return '<button class="ab" data-op="' + x[0] + '" title="' + x[1] + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + x[2] + '"/></svg></button>';
    }).join('');
    wrap.appendChild(b);
    b.addEventListener('click', function (e) { var t = e.target.closest('.ab'); if (t) apply(t.dataset.op); });
    return b;
  }
  function onSelect(active) {
    var multi = active && active.type === 'activeSelection' && active._objects && active._objects.length >= 2 && (!H.getMode || H.getMode() !== 'fill');
    var b = bar(); if (b) b.classList.toggle('show', !!multi);
  }

  // 그룹 좌표계 함정 회피: 해제→절대좌표 델타 계산→적용→재선택
  function apply(op) {
    var canvas = C(); if (!canvas) return;
    var objs = canvas.getActiveObjects().slice();
    if (objs.length < 2) return;
    canvas.discardActiveObject();
    var rects = objs.map(absRect);
    if (op === 'disth' || op === 'distv') {
      var dd = distributeRects(rects, op === 'disth' ? 'h' : 'v');
      objs.forEach(function (o, i) { o.left += dd[i].dx; o.top += dd[i].dy; o.setCoords(); });
    } else if (op === 'sizew' || op === 'sizeh') {
      var ms = matchSize(rects, op === 'sizew' ? 'w' : 'h');
      objs.forEach(function (o, i) {
        if (op === 'sizew') o.scaleX *= ms[i].f; else o.scaleY *= ms[i].f;
        o.setCoords();
      });
    } else {
      var ad = alignRects(rects, op);
      objs.forEach(function (o, i) { o.left += ad[i].dx; o.top += ad[i].dy; o.setCoords(); });
    }
    var sel = new fabric.ActiveSelection(objs, { canvas: canvas });
    canvas.setActiveObject(sel); canvas.requestRenderAll();
    if (H.pushHistory) H.pushHistory();
  }

  function reset() { clear(); var b = document.getElementById('kmAlignBar'); if (b) b.classList.remove('show'); }

  var API = {
    alignRects: alignRects, distributeRects: distributeRects, matchSize: matchSize, snapValue: snapValue, SNAP: SNAP,
    init: init, onMoving: onMoving, onScaling: onScaling, onSelect: onSelect, clear: clear, reset: reset,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.KM_ALIGN = API;
})();
