/* =========================================================================
 * paint-integrate.js — 케이아트 본체 물감 엔진 통합 (W3, 2026-07-08 오퍼스)
 *   기존 draw/index.html 회귀 0 원칙:
 *   · 순수 그리기 도구(연필·펜·도형·네온…)는 건드리지 않는다.
 *   · 물감 도구(수채·유화)만 capture-phase에서 가로채 진짜 엔진으로 처리.
 *   · WebGL2 미지원/실패 시 아무것도 하지 않음 → 기존 2D 근사 브러시로 자연 폴백.
 *   · 물감 획은 WebGL 오버레이(#pv)에서 라이브 시뮬 → 마르면 #cv에 bake(합성) → pushUndo.
 *   host 전역(cv·ctx·color·tool·size·cssW·cssH·dpr·getXY·pres·pushUndo·hexToRgb·hasDrawn)은
 *   같은 classic-script 전역 렉시컬 스코프라 bare 이름으로 라이브 참조된다.
 * ========================================================================= */
(function () {
  'use strict';
  var PC = window.PaintCore, GL = window.PaintGL;
  console.log('[paint] integrate 로드 · PaintCore=' + !!PC + ' PaintGL=' + !!GL);
  if (!PC || !GL) { console.warn('[paint] 엔진 스크립트 미로드(경로/404 확인) → 기존 2D 유지'); return; }
  // host 감지 — 본체가 아니면(전역 없음) 조용히 종료.
  if (typeof cv === 'undefined' || typeof ctx === 'undefined' || typeof getXY === 'undefined') {
    console.warn('[paint] host 전역 미검출 → 통합 비활성'); return;
  }

  // 물감 도구 → {매질, 종이}. crayon은 기존 2D 유지(배틱은 W-later).
  var PAINT = {
    watercolor: { media: 'watercolor', paper: 'watercolor' },
    oil:        { media: 'oil',        paper: 'canvas' },
  };
  var MAXSIDE = 1000;   // 시뮬 그리드 장변 상한
  var DRY_MS = 1500;    // 획 후 이 시간 지나면 마른 것으로 보고 bake

  var paint = null, pv = null, pvw = 0, pvh = 0, curPaper = null;
  var drawing = false, dirty = false, lastUp = 0, looping = false, lx = 0, ly = 0;

  function isPaintTool() { return !!PAINT[tool]; }

  function ensurePV() {
    if (pv) return true;
    pv = document.createElement('canvas');
    pv.id = 'pv';
    pv.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;pointer-events:none';
    // #cv 바로 위, #ov(도형 미리보기) 아래에 삽입
    var paper = cv.parentElement;
    if (ov && ov.parentElement === paper) paper.insertBefore(pv, ov);
    else paper.appendChild(pv);
    return true;
  }

  // 캔버스 크기/도구에 맞춰 엔진 준비(필요 시 재생성). 실패=엔진 없음(기존 2D 폴백).
  function ensureEngine() {
    ensurePV();
    var scale = Math.min(1, MAXSIDE / Math.max(1, Math.max(cssW, cssH)));
    var W = Math.max(1, Math.round(cssW * scale));
    var H = Math.max(1, Math.round(cssH * scale));
    var paperKind = PAINT[tool].paper;
    if (paint && paint.supported && W === pvw && H === pvh && paperKind === curPaper) return true;
    pv.width = W; pv.height = H; pvw = W; pvh = H; curPaper = paperKind;
    try {
      paint = new GL.PaintGL(pv, { width: W, height: H, paperKind: paperKind, media: PAINT[tool].media, seed: 20260708 });
    } catch (err) {
      console.warn('[paint] 엔진 생성 실패 → 기존 2D 폴백:', err && err.message ? err.message : err);
      paint = null; return false;
    }
    if (!paint.supported) {
      console.warn('[paint] WebGL2 미지원(' + (paint._reason || '?') + ') → 기존 2D 폴백');
      paint = null; return false;
    }
    paint.inkAlpha = true;          // 잉크 있는 곳만 불투명(본체 위 합성)
    console.log('[paint] 엔진 활성 · ' + W + '×' + H + ' · ' + PAINT[tool].media + '/' + paperKind);
    return true;
  }

  function simXY(e) {
    var p = getXY(e);
    return { x: p.x * pvw / cssW, y: p.y * pvh / cssH, css: p };
  }
  function simR() { return Math.max(2, size * pvw / cssW); }

  function strokeAt(sx, sy, e, dirx, diry) {
    var ksArr = PC.ksFromRGB(hexToRgb(color));
    var pr = (typeof pres === 'function' && pres(e)) ? (0.5 + pres(e) * 0.5) : 0.9;
    if (tool === 'oil') paint.oilBrush(sx, sy, simR(), pr, ksArr);
    else paint.brush('color', sx, sy, simR(), pr, ksArr, { density: 1.0 });
  }

  function loop() {
    if (!paint) { looping = false; return; }
    paint.step();
    paint.render();
    var now = performance.now();
    if (!drawing && dirty && (now - lastUp) > DRY_MS) { bake(); }
    if (drawing || dirty) requestAnimationFrame(loop);
    else looping = false;
  }
  function kick() { if (!looping) { looping = true; requestAnimationFrame(loop); } }

  // 마른 물감을 #cv에 구워 합치고 오버레이 초기화 → 저장/undo/제출 루프는 기존 그대로.
  function bake() {
    if (!paint || !dirty) return;
    try {
      ctx.save();
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(pv, 0, 0, cssW, cssH);  // ctx는 dpr 변환 상태 → css 좌표로 합성
      ctx.restore();
    } catch (err) { /* 합성 실패 시 조용히 스킵 */ }
    paint.clearInk();
    paint.render();       // 오버레이 비우기
    dirty = false;
    if (typeof hasDrawn !== 'undefined') { try { hasDrawn = true; } catch (e) {} }
    if (typeof pushUndo === 'function') pushUndo();
  }

  // ── capture-phase 가로채기 (물감 도구 + 엔진 준비됐을 때만)
  cv.addEventListener('pointerdown', function (e) {
    if (!isPaintTool()) { if (dirty) bake(); return; }   // 다른 도구로 그리기 전 물감 flush
    if (!ensureEngine()) return;                          // 폴백: 기존 2D가 처리
    e.stopImmediatePropagation();                         // 기존 2D 핸들러 차단
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    e.preventDefault();
    drawing = true; dirty = true;
    var s = simXY(e); lx = s.x; ly = s.y;
    strokeAt(s.x, s.y, e);
    kick();
  }, true);

  cv.addEventListener('pointermove', function (e) {
    if (!drawing || !paint) return;
    e.stopImmediatePropagation(); e.preventDefault();
    var evs = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    for (var i = 0; i < evs.length; i++) {
      var s = simXY(evs[i]);
      var d = Math.hypot(s.x - lx, s.y - ly), n = Math.max(1, Math.floor(d / 2));
      for (var k = 1; k <= n; k++) strokeAt(lx + (s.x - lx) * k / n, ly + (s.y - ly) * k / n, evs[i]);
      lx = s.x; ly = s.y;
    }
  }, true);

  function endStroke(e) {
    if (!drawing) return;
    drawing = false; lastUp = performance.now();
    if (paint && paint.media && paint.media.height) {
      // 유화: 물 시뮬이 없어 마를 게 없음 → 바로 bake
      bake();
    } else {
      if (paint) paint.setDrying(true);  // 건조 가속 → DRY_MS 뒤 bake
      kick();
    }
  }
  cv.addEventListener('pointerup', function (e) {
    if (!drawing) return; e.stopImmediatePropagation(); endStroke(e);
  }, true);
  cv.addEventListener('pointercancel', function (e) { if (drawing) { e.stopImmediatePropagation(); endStroke(e); } }, true);
  cv.addEventListener('pointerleave', function (e) { if (drawing) { e.stopImmediatePropagation(); endStroke(e); } }, true);

  // 리사이즈: host fitCanvas(150ms) 이후 재생성 + 대기 중 물감 flush
  window.addEventListener('resize', function () {
    clearTimeout(window._pvrt);
    window._pvrt = setTimeout(function () { if (dirty) bake(); if (pv) { pvw = 0; pvh = 0; } }, 220);
  });

  // 탭 이탈/저장 직전 미건조 물감 보존
  window.addEventListener('visibilitychange', function () { if (document.hidden && dirty) bake(); });
})();
