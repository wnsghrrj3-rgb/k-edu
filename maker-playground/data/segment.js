/* ============================================================
   MK_SEG — R134 인물 바꾸기: 사진 속 사람을 골라 오리고·지우고·바꾼다
   ------------------------------------------------------------
   준호: 「어떤 이미지에서 특정한 인물을 선택하면 다른 이미지와
   대체할 수 있는 기능」. 답은 3층이다:

   ① 순수 로직 (이 파일 상단 — DOM·canvas API 무의존, 하니스가 직접 실행)
      마스크는 작업 해상도(긴 변 512)의 Uint8Array 하나가 정본이다.
      탭 성분 추출(tapComponent) · 번짐 선택(magicSelect) · 브러시 ·
      팽창/침식/페더 · 배경 메꿈(inpaint: 다중 시드 BFS 최근접색 + 마스크
      내부 한정 블러) · 합성 3종(cutout/fillSilhouette/replaceRegion).
      전부 결정적 — 같은 입력 = 같은 바이트.

   ② AI 층 (지연 로드 · 자체 호스팅)
      MediaPipe Selfie Segmentation 을 vendor/selfie-seg/ 에서 로드한다
      (R124 muxer 선례 — 학교망 CDN 차단 + 사진 외부 반출 0). AI 는
      「사람 전부」 확률 지도만 주고, 특정 인물은 ①의 tapComponent 가
      탭 지점의 연결 성분으로 골라낸다. AI 가 못 뜨면(구형 기기·wasm
      실패) 번짐 선택 + 브러시로 같은 작업창이 그대로 성립한다 —
      기능이 죽는 게 아니라 손이 조금 더 갈 뿐이다.

   ③ 작업창 (오버레이 UI — open 으로만 생성, 로드 시 DOM 접촉 0)
      탭 → 청록 실루엣 → 브러시 보정 → 동작 4종:
      ✂️ 오려서 요소로(투명 PNG 새 요소) · 🫥 지우기(배경 메꿈) ·
      🖼 실루엣에 채우기(사람 모양 안에 다른 사진) · 🔁 자리 바꾸기
      (사람을 지우고 그 자리에 다른 사진 — 아래 기준 맞춤).
      결과는 원본 해상도 dataURL — 문서 스키마 신설 0, el.src 만
      바뀌므로 render·play·export·워크스페이스 전 경로가 공짜로 옳다.

   학생 화면(workspace) 무접촉 — 진입은 에디터 사진 패널 한 곳뿐.
   ============================================================ */
window.MK_SEG = (() => {
  'use strict';

  var VENDOR = '../maker-playground/vendor/selfie-seg/';
  var WORK_MAX = 512;         /* 마스크 작업 해상도 상한(긴 변) */
  var FULL_MAX = 2560;        /* 합성 안전 상한 — intake(1920)보다 넉넉히 */
  var THR = 128;              /* 마스크 이진 문턱 */

  /* ================================================================
     ① 순수 로직 — 여기부터 runAI 이전까지 DOM 무의존
     ================================================================ */

  function fitWork(w, h, max) {
    max = max || WORK_MAX;
    var long = Math.max(w, h);
    if (long <= max) return { w: w, h: h, scale: 1 };
    var s = max / long;
    return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)), scale: s };
  }

  /* ---- 탭 성분: 확률 지도에서 탭 지점이 속한 연결 덩어리 하나 ----
     탭이 살짝 빗나가도 되도록 snapR 반경 안에서 가장 가까운 사람
     픽셀로 끌어당긴다. 못 찾으면 null — 「사람이 아닌 곳」의 정직. */
  function tapComponent(prob, w, h, tx, ty, thr, snapR) {
    thr = thr == null ? THR : thr; snapR = snapR == null ? 14 : snapR;
    tx = Math.round(tx); ty = Math.round(ty);
    if (tx < 0 || ty < 0 || tx >= w || ty >= h) return null;
    var seed = -1;
    if (prob[ty * w + tx] >= thr) seed = ty * w + tx;
    else {                                    /* 가까운 링부터 — 최근접 스냅 */
      for (var r = 1; r <= snapR && seed < 0; r++) {
        for (var dy = -r; dy <= r && seed < 0; dy++) {
          for (var dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            var x = tx + dx, y = ty + dy;
            if (x < 0 || y < 0 || x >= w || y >= h) continue;
            if (prob[y * w + x] >= thr) { seed = y * w + x; break; }
          }
        }
      }
    }
    if (seed < 0) return null;
    var out = new Uint8Array(w * h);
    var stack = new Int32Array(w * h); var top = 0;
    stack[top++] = seed; out[seed] = 255;
    var area = 0;
    while (top > 0) {
      var p = stack[--top]; area++;
      var px = p % w, py = (p - px) / w;
      if (px > 0 && !out[p - 1] && prob[p - 1] >= thr) { out[p - 1] = 255; stack[top++] = p - 1; }
      if (px < w - 1 && !out[p + 1] && prob[p + 1] >= thr) { out[p + 1] = 255; stack[top++] = p + 1; }
      if (py > 0 && !out[p - w] && prob[p - w] >= thr) { out[p - w] = 255; stack[top++] = p - w; }
      if (py < h - 1 && !out[p + w] && prob[p + w] >= thr) { out[p + w] = 255; stack[top++] = p + w; }
    }
    return { mask: out, area: area };
  }

  /* ---- 번짐 선택(폴백 완드): 탭 색과의 가중 RGB 거리 ≤ tol 인
     연결 영역. 시드색은 3×3 평균 — 노이즈 한 픽셀에 안 흔들리게. */
  function colorDist(r1, g1, b1, r2, g2, b2) {
    var dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    return Math.sqrt((2 * dr * dr + 4 * dg * dg + 3 * db * db) / 9);
  }
  function magicSelect(rgba, w, h, tx, ty, tol) {
    tol = tol == null ? 32 : tol;
    tx = Math.round(tx); ty = Math.round(ty);
    if (tx < 0 || ty < 0 || tx >= w || ty >= h) return null;
    var sr = 0, sg = 0, sb = 0, sn = 0;
    for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
      var x = tx + dx, y = ty + dy;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      var q = (y * w + x) * 4;
      sr += rgba[q]; sg += rgba[q + 1]; sb += rgba[q + 2]; sn++;
    }
    sr /= sn; sg /= sn; sb /= sn;
    var out = new Uint8Array(w * h);
    var stack = new Int32Array(w * h); var top = 0;
    var seed = ty * w + tx;
    stack[top++] = seed; out[seed] = 255;
    var area = 0;
    while (top > 0) {
      var p = stack[--top]; area++;
      var px = p % w, py = (p - px) / w;
      var cand = [];
      if (px > 0) cand.push(p - 1);
      if (px < w - 1) cand.push(p + 1);
      if (py > 0) cand.push(p - w);
      if (py < h - 1) cand.push(p + w);
      for (var i = 0; i < cand.length; i++) {
        var n = cand[i];
        if (out[n]) continue;
        var q2 = n * 4;
        if (colorDist(rgba[q2], rgba[q2 + 1], rgba[q2 + 2], sr, sg, sb) <= tol) {
          out[n] = 255; stack[top++] = n;
        }
      }
    }
    return { mask: out, area: area };
  }

  /* ---- 형태 연산: 분리형 최대/최소 필터(팽창·침식), 이중 박스
     블러(페더). 전부 새 배열 반환 — 입력 불훼손. ---- */
  function runMinMax(src, w, h, r, isMax) {
    var tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
    var x, y, k, v, best;
    for (y = 0; y < h; y++) {                       /* 가로 */
      var row = y * w;
      for (x = 0; x < w; x++) {
        best = isMax ? 0 : 255;
        for (k = -r; k <= r; k++) {
          var xx = x + k; if (xx < 0 || xx >= w) continue;
          v = src[row + xx];
          if (isMax ? v > best : v < best) best = v;
        }
        tmp[row + x] = best;
      }
    }
    for (x = 0; x < w; x++) {                       /* 세로 */
      for (y = 0; y < h; y++) {
        best = isMax ? 0 : 255;
        for (k = -r; k <= r; k++) {
          var yy = y + k; if (yy < 0 || yy >= h) continue;
          v = tmp[yy * w + x];
          if (isMax ? v > best : v < best) best = v;
        }
        out[y * w + x] = best;
      }
    }
    return out;
  }
  function growMask(m, w, h, r) { return r > 0 ? runMinMax(m, w, h, r, true) : m.slice(); }
  function shrinkMask(m, w, h, r) { return r > 0 ? runMinMax(m, w, h, r, false) : m.slice(); }
  function boxBlurMask(src, w, h, r) {
    var tmp = new Float32Array(w * h), out = new Uint8Array(w * h);
    var x, y, sum, cnt;
    for (y = 0; y < h; y++) {
      var row = y * w; sum = 0; cnt = 0;
      for (x = -r; x <= r; x++) { if (x >= 0 && x < w) { sum += src[row + x]; cnt++; } }
      for (x = 0; x < w; x++) {
        tmp[row + x] = sum / cnt;
        var add = x + r + 1, del = x - r;
        if (add < w) { sum += src[row + add]; cnt++; }
        if (del >= 0) { sum -= src[row + del]; cnt--; }
      }
    }
    for (x = 0; x < w; x++) {
      sum = 0; cnt = 0;
      for (y = -r; y <= r; y++) { if (y >= 0 && y < h) { sum += tmp[y * w + x]; cnt++; } }
      for (y = 0; y < h; y++) {
        out[y * w + x] = Math.round(sum / cnt);
        var add2 = y + r + 1, del2 = y - r;
        if (add2 < h) { sum += tmp[add2 * w + x]; cnt++; }
        if (del2 >= 0) { sum -= tmp[del2 * w + x]; cnt--; }
      }
    }
    return out;
  }
  function featherMask(m, w, h, r) {
    if (r <= 0) return m.slice();
    return boxBlurMask(boxBlurMask(m, w, h, r), w, h, r);
  }

  /* ---- 브러시: 선분을 반지름 절반 간격으로 밟으며 원 도장 ---- */
  function brushStroke(mask, w, h, x0, y0, x1, y1, r, add) {
    var val = add ? 255 : 0;
    var dx = x1 - x0, dy = y1 - y0;
    var len = Math.sqrt(dx * dx + dy * dy);
    var steps = Math.max(1, Math.ceil(len / Math.max(1, r * 0.5)));
    var r2 = r * r;
    for (var s = 0; s <= steps; s++) {
      var cx = x0 + dx * (s / steps), cy = y0 + dy * (s / steps);
      var ix0 = Math.max(0, Math.floor(cx - r)), ix1 = Math.min(w - 1, Math.ceil(cx + r));
      var iy0 = Math.max(0, Math.floor(cy - r)), iy1 = Math.min(h - 1, Math.ceil(cy + r));
      for (var y = iy0; y <= iy1; y++) for (var x = ix0; x <= ix1; x++) {
        var ddx = x - cx, ddy = y - cy;
        if (ddx * ddx + ddy * ddy <= r2) mask[y * w + x] = val;
      }
    }
    return mask;
  }

  function maskArea(m, thr) {
    thr = thr == null ? THR : thr;
    var a = 0;
    for (var i = 0; i < m.length; i++) if (m[i] >= thr) a++;
    return a;
  }
  function maskBounds(m, w, h, thr) {
    thr = thr == null ? 1 : thr;
    var x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      if (m[y * w + x] >= thr) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) return null;
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  /* ---- 마스크 배율 변환(작업 해상도 → 원본 해상도): 쌍선형 ---- */
  function scaleMask(src, sw, sh, dw, dh) {
    if (sw === dw && sh === dh) return src.slice();
    var out = new Uint8Array(dw * dh);
    var rx = sw / dw, ry = sh / dh;
    for (var y = 0; y < dh; y++) {
      var fy = Math.min(sh - 1, (y + 0.5) * ry - 0.5);
      var y0 = Math.max(0, Math.floor(fy)), y1 = Math.min(sh - 1, y0 + 1);
      var wy = fy - y0;
      for (var x = 0; x < dw; x++) {
        var fx = Math.min(sw - 1, (x + 0.5) * rx - 0.5);
        var x0 = Math.max(0, Math.floor(fx)), x1 = Math.min(sw - 1, x0 + 1);
        var wx = fx - x0;
        var v = src[y0 * sw + x0] * (1 - wx) * (1 - wy) + src[y0 * sw + x1] * wx * (1 - wy)
              + src[y1 * sw + x0] * (1 - wx) * wy + src[y1 * sw + x1] * wx * wy;
        out[y * dw + x] = Math.round(v);
      }
    }
    return out;
  }

  /* ---- 배치 수학: 커버(빈틈 없이 덮기)·컨테인(안에 다 들어가기) ---- */
  function coverFit(sw, sh, dw, dh) {
    var s = Math.max(dw / sw, dh / sh);
    return { s: s, ox: (dw - sw * s) / 2, oy: (dh - sh * s) / 2 };
  }
  function containFit(sw, sh, dw, dh, anchorBottom) {
    var s = Math.min(dw / sw, dh / sh);
    return { s: s, ox: (dw - sw * s) / 2, oy: anchorBottom ? (dh - sh * s) : (dh - sh * s) / 2 };
  }

  function bilinearRGBA(rgba, w, h, fx, fy, out) {
    if (fx < 0) fx = 0; if (fy < 0) fy = 0;
    if (fx > w - 1) fx = w - 1; if (fy > h - 1) fy = h - 1;
    var x0 = Math.floor(fx), y0 = Math.floor(fy);
    var x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
    var wx = fx - x0, wy = fy - y0;
    var p00 = (y0 * w + x0) * 4, p01 = (y0 * w + x1) * 4, p10 = (y1 * w + x0) * 4, p11 = (y1 * w + x1) * 4;
    for (var c = 0; c < 4; c++) {
      out[c] = rgba[p00 + c] * (1 - wx) * (1 - wy) + rgba[p01 + c] * wx * (1 - wy)
             + rgba[p10 + c] * (1 - wx) * wy + rgba[p11 + c] * wx * wy;
    }
    return out;
  }

  /* ---- 배경 메꿈(inpaint):
     1) 다중 시드 BFS — 구멍 밖 경계 픽셀들에서 동시에 출발해,
        각 구멍 픽셀이 「자신을 발견한 이웃」의 색을 물려받는다
        (= 최근접 유효색 전파, 결정적: 큐 순서가 순회 순서를 고정).
     2) 구멍 내부 한정 3×3 평균을 3회 — 전파 줄무늬를 지운다.
        구멍 밖 픽셀은 한 바이트도 안 건드린다. ---- */
  function inpaint(rgba, w, h, mask, thr) {
    thr = thr == null ? THR : thr;
    var out = new Uint8ClampedArray(rgba);
    var n = w * h;
    var filled = new Uint8Array(n);
    var i, x, y, p;
    var holes = 0;
    for (i = 0; i < n; i++) { if (mask[i] < thr) filled[i] = 1; else holes++; }
    if (!holes) return out;
    if (holes === n) return out;                     /* 시드 0 — 못 메꾼다, 원본 반환 */
    var queue = new Int32Array(n); var qh = 0, qt = 0;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {  /* 시드: 구멍과 맞닿은 바깥 픽셀 */
      p = y * w + x;
      if (!filled[p]) continue;
      if ((x > 0 && !filled[p - 1]) || (x < w - 1 && !filled[p + 1]) ||
          (y > 0 && !filled[p - w]) || (y < h - 1 && !filled[p + w])) queue[qt++] = p;
    }
    while (qh < qt) {
      p = queue[qh++];
      x = p % w; y = (p - x) / w;
      var q4 = p * 4;
      var nb = [];
      if (x > 0) nb.push(p - 1);
      if (x < w - 1) nb.push(p + 1);
      if (y > 0) nb.push(p - w);
      if (y < h - 1) nb.push(p + w);
      for (i = 0; i < nb.length; i++) {
        var np = nb[i];
        if (filled[np]) continue;
        var n4 = np * 4;
        out[n4] = out[q4]; out[n4 + 1] = out[q4 + 1]; out[n4 + 2] = out[q4 + 2]; out[n4 + 3] = 255;
        filled[np] = 1; queue[qt++] = np;
      }
    }
    var holeIdx = new Int32Array(holes); var hn = 0;
    for (i = 0; i < n; i++) if (mask[i] >= thr) holeIdx[hn++] = i;
    var buf = new Float32Array(holes * 3);
    for (var pass = 0; pass < 3; pass++) {
      for (i = 0; i < hn; i++) {
        p = holeIdx[i]; x = p % w; y = (p - x) / w;
        var sr = 0, sg = 0, sb = 0, sc = 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          var q = (yy * w + xx) * 4;
          sr += out[q]; sg += out[q + 1]; sb += out[q + 2]; sc++;
        }
        buf[i * 3] = sr / sc; buf[i * 3 + 1] = sg / sc; buf[i * 3 + 2] = sb / sc;
      }
      for (i = 0; i < hn; i++) {
        var q3 = holeIdx[i] * 4;
        out[q3] = buf[i * 3]; out[q3 + 1] = buf[i * 3 + 1]; out[q3 + 2] = buf[i * 3 + 2];
      }
    }
    return out;
  }

  /* ---- ✂️ 오리기: 마스크가 알파가 된다. 여백 pad 포함 bbox 크롭 ---- */
  function cutout(rgba, w, h, mask, pad) {
    pad = pad == null ? 2 : pad;
    var b = maskBounds(mask, w, h, 1);
    if (!b) return null;
    var x0 = Math.max(0, b.x - pad), y0 = Math.max(0, b.y - pad);
    var x1 = Math.min(w - 1, b.x + b.w - 1 + pad), y1 = Math.min(h - 1, b.y + b.h - 1 + pad);
    var cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    var out = new Uint8ClampedArray(cw * ch * 4);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var sp = (y * w + x) * 4, dp = ((y - y0) * cw + (x - x0)) * 4;
      out[dp] = rgba[sp]; out[dp + 1] = rgba[sp + 1]; out[dp + 2] = rgba[sp + 2];
      out[dp + 3] = mask[y * w + x];
    }
    return { data: out, w: cw, h: ch, x: x0, y: y0 };
  }

  /* ---- 🖼 실루엣에 채우기: 사람 모양 안에만 다른 사진(커버핏).
     혼합 가중 = 마스크값 × 대체 사진 알파 — 페더 경계가 그대로
     부드러운 경계가 된다. 마스크 밖은 무접촉. ---- */
  function fillSilhouette(base, w, h, mask, rep, rw, rh) {
    var b = maskBounds(mask, w, h, 1);
    if (!b) return null;
    var out = new Uint8ClampedArray(base);
    var f = coverFit(rw, rh, b.w, b.h);
    var smp = [0, 0, 0, 0];
    for (var y = b.y; y < b.y + b.h; y++) for (var x = b.x; x < b.x + b.w; x++) {
      var m = mask[y * w + x];
      if (!m) continue;
      bilinearRGBA(rep, rw, rh, (x - b.x - f.ox) / f.s, (y - b.y - f.oy) / f.s, smp);
      var a = (m / 255) * (smp[3] / 255);
      var p = (y * w + x) * 4;
      out[p] = out[p] * (1 - a) + smp[0] * a;
      out[p + 1] = out[p + 1] * (1 - a) + smp[1] * a;
      out[p + 2] = out[p + 2] * (1 - a) + smp[2] * a;
    }
    return out;
  }

  /* ---- 🔁 자리 바꾸기: ① 마스크를 2px 불려 배경 메꿈(사람 지움)
     ② 그 자리(bbox)에 대체 사진을 컨테인핏·아래 기준으로 앉힌다
     — 사람은 바닥을 딛고 선다. 대체가 투명 PNG(오려낸 인물)면
     실루엣이 자연스럽고, 불투명 사진이면 bbox 명함처럼 앉는다. ---- */
  function replaceRegion(base, w, h, mask, rep, rw, rh) {
    var b = maskBounds(mask, w, h, 1);
    if (!b) return null;
    var grown = growMask(mask, w, h, 2);
    var out = inpaint(base, w, h, grown);
    var f = containFit(rw, rh, b.w, b.h, true);
    var smp = [0, 0, 0, 0];
    var x0 = b.x + Math.floor(f.ox), x1 = b.x + Math.ceil(f.ox + rw * f.s);
    var y0 = b.y + Math.floor(f.oy), y1 = b.y + Math.ceil(f.oy + rh * f.s);
    x0 = Math.max(0, x0); y0 = Math.max(0, y0);
    x1 = Math.min(w, x1); y1 = Math.min(h, y1);
    for (var y = y0; y < y1; y++) for (var x = x0; x < x1; x++) {
      bilinearRGBA(rep, rw, rh, (x - b.x - f.ox) / f.s, (y - b.y - f.oy) / f.s, smp);
      var a = smp[3] / 255;
      if (a <= 0) continue;
      var p = (y * w + x) * 4;
      out[p] = out[p] * (1 - a) + smp[0] * a;
      out[p + 1] = out[p + 1] * (1 - a) + smp[1] * a;
      out[p + 2] = out[p + 2] * (1 - a) + smp[2] * a;
    }
    return out;
  }

  /* ================================================================
     ② AI 층 — MediaPipe Selfie Segmentation (자체 호스팅 · 지연 로드)
     ================================================================ */
  var aiState = { status: 'idle', inst: null };   /* idle | loading | ready | fail */

  function loadAI(cb) {
    if (aiState.status === 'ready') return cb(true);
    if (aiState.status === 'fail') return cb(false);
    if (aiState.status === 'loading') {           /* 동시 호출 합류 */
      var t = setInterval(function () {
        if (aiState.status === 'loading') return;
        clearInterval(t); cb(aiState.status === 'ready');
      }, 120);
      return;
    }
    aiState.status = 'loading';
    var fail = function () { aiState.status = 'fail'; cb(false); };
    var boot = function () {
      try {
        if (!window.SelfieSegmentation) return fail();
        var inst = new window.SelfieSegmentation({ locateFile: function (f) { return VENDOR + f; } });
        inst.setOptions({ modelSelection: 1, selfieMode: false });
        aiState.inst = inst;
        /* initialize 가 있으면 wasm 까지 미리 세운다 — 첫 탭 지연 흡수 */
        var p = inst.initialize ? inst.initialize() : Promise.resolve();
        p.then(function () { aiState.status = 'ready'; cb(true); }).catch(fail);
      } catch (_) { fail(); }
    };
    if (window.SelfieSegmentation) return boot();
    var s = document.createElement('script');
    s.src = VENDOR + 'selfie_segmentation.js';
    s.onload = boot; s.onerror = fail;
    document.head.appendChild(s);
  }

  /* 이미지(canvas) → 사람 확률 지도(Uint8Array, 작업 해상도) */
  function runAI(canvas, ww, wh, cb) {
    var inst = aiState.inst;
    if (!inst) return cb(null);
    var done = false;
    var finish = function (prob) { if (done) return; done = true; cb(prob); };
    try {
      inst.onResults(function (res) {
        try {
          var mc = document.createElement('canvas');
          mc.width = ww; mc.height = wh;
          var mx = mc.getContext('2d', { willReadFrequently: true });
          mx.drawImage(res.segmentationMask, 0, 0, ww, wh);
          var d = mx.getImageData(0, 0, ww, wh).data;
          var prob = new Uint8Array(ww * wh);
          for (var i = 0; i < prob.length; i++) prob[i] = d[i * 4];   /* R 채널 = 사람 확률 */
          finish(prob);
        } catch (_) { finish(null); }
      });
      var sent = inst.send({ image: canvas });
      if (sent && sent.catch) sent.catch(function () { finish(null); });
      setTimeout(function () { finish(null); }, 12000);   /* 최후 보루 */
    } catch (_) { finish(null); }
  }

  /* ================================================================
     ③ 작업창 — open() 으로만 생성. 로드 시 DOM 접촉 0.
     ================================================================ */
  var TEAL = [20, 184, 166];

  function open(opts) {
    if (!opts || !opts.src) return;
    var doc = document;
    var st = {
      mode: 'pick',              /* pick | brushAdd | brushDel */
      tol: 32, brushR: 14,
      W: 0, H: 0, ww: 0, wh: 0,  /* 원본·작업 해상도 */
      full: null,                /* 원본 ImageData.data */
      workRGBA: null,            /* 작업 해상도 픽셀(완드용) */
      prob: null,                /* AI 사람 확률 지도 */
      mask: null,                /* 활성 마스크(작업 해상도) — 정본 */
      rep: null,                 /* 대체 사진 {data,w,h} */
      pending: null,             /* 대체가 필요한 동작 대기: 'fill' | 'swap' */
      preview: null,             /* 합성 결과 {data,w,h,dataUrl,label} */
      busy: false, aiTried: false,
      lastPt: null, drawing: false,
    };

    /* ---- 원본 적재 ---- */
    var img = new window.Image();
    var root = doc.createElement('div');
    root.setAttribute('data-mkseg', '1');
    root.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(15,23,32,.88);display:flex;align-items:center;justify-content:center;padding:14px;';
    root.innerHTML =
      '<div style="background:var(--mk-surface,#fff);border-radius:16px;max-width:min(96vw,980px);max-height:94vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.4)">' +
      '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--mk-border,#E3E8EF)">' +
        '<strong style="font-size:15px">🪄 인물 바꾸기</strong>' +
        '<span data-seg="msg" style="flex:1;font-size:12.5px;color:var(--mk-muted,#6B7280)">사진을 준비하고 있어요…</span>' +
        '<button data-seg="close" style="border:none;background:none;font-size:18px;cursor:pointer;line-height:1">✕</button></div>' +
      '<div style="position:relative;flex:1;min-height:220px;display:flex;align-items:center;justify-content:center;background:#0F1720">' +
        '<canvas data-seg="cv" style="max-width:100%;max-height:min(58vh,560px);touch-action:none;cursor:crosshair"></canvas>' +
        '<div data-seg="busy" style="display:none;position:absolute;inset:0;background:rgba(15,23,32,.55);color:#fff;align-items:center;justify-content:center;font-size:14px">잠시만요…</div></div>' +
      '<div data-seg="tools" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--mk-border,#E3E8EF)">' +
        '<button data-seg="m-pick" style="' + BTN + '">👆 사람 선택</button>' +
        '<button data-seg="m-add" style="' + BTN + '">🖌 더하기</button>' +
        '<button data-seg="m-del" style="' + BTN + '">🧽 빼기</button>' +
        '<label style="font-size:12px;display:flex;align-items:center;gap:4px">굵기 <input data-seg="brushr" type="range" min="4" max="40" value="14" style="width:76px"></label>' +
        '<label data-seg="tolwrap" style="font-size:12px;display:none;align-items:center;gap:4px">번짐 <input data-seg="tol" type="range" min="8" max="90" value="32" style="width:76px"></label>' +
        '<button data-seg="reset" style="' + BTN + '">↺ 처음부터</button></div>' +
      '<div data-seg="actions" style="display:flex;flex-wrap:wrap;gap:6px;padding:10px 14px">' +
        '<button data-seg="a-cut" style="' + BTN + '" disabled>✂️ 오려서 요소로</button>' +
        '<button data-seg="a-erase" style="' + BTN + '" disabled>🫥 지우기 (배경 메꿈)</button>' +
        '<button data-seg="a-fill" style="' + BTN + '" disabled>🖼 실루엣에 채우기</button>' +
        '<button data-seg="a-swap" style="' + BTN + '" disabled>🔁 자리 바꾸기</button></div>' +
      '<div data-seg="repwrap" style="display:none;padding:0 14px 10px">' +
        '<p style="margin:0 0 6px;font-size:12.5px;color:var(--mk-muted,#6B7280)">바꿔 넣을 사진을 골라 주세요</p>' +
        '<div data-seg="repgrid" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"></div></div>' +
      '<div data-seg="previewbar" style="display:none;gap:8px;padding:10px 14px;border-top:1px solid var(--mk-border,#E3E8EF)">' +
        '<span data-seg="pvlabel" style="flex:1;font-size:12.5px;align-self:center"></span>' +
        '<button data-seg="pv-back" style="' + BTN + '">↩ 다시 고르기</button>' +
        '<button data-seg="pv-apply" style="' + BTN + 'background:#14B8A6;color:#fff;border-color:#14B8A6;">✔ 이대로 적용</button></div>' +
      '</div>';
    doc.body.appendChild(root);

    var $ = function (k) { return root.querySelector('[data-seg="' + k + '"]'); };
    var cv = $('cv'), ctx = cv.getContext('2d');
    var maskCv = doc.createElement('canvas'), maskCtx = maskCv.getContext('2d');
    var setMsg = function (t) { $('msg').textContent = t; };
    var setBusy = function (b, t) {
      st.busy = b;
      var el = $('busy'); el.style.display = b ? 'flex' : 'none';
      if (t) el.textContent = t;
    };
    function close() { try { root.remove(); } catch (_) { if (root.parentNode) root.parentNode.removeChild(root); } }
    $('close').onclick = close;

    /* ---- 렌더: 원본 + 청록 실루엣 (미리보기 중엔 결과만) ---- */
    function paint() {
      if (st.preview) {
        cv.width = st.preview.w; cv.height = st.preview.h;
        ctx.putImageData(new window.ImageData(st.preview.data, st.preview.w, st.preview.h), 0, 0);
        return;
      }
      cv.width = st.W; cv.height = st.H;
      ctx.drawImage(img, 0, 0, st.W, st.H);
      if (st.mask) {
        var id = maskCtx.createImageData(st.ww, st.wh);
        for (var i = 0; i < st.mask.length; i++) {
          var m = st.mask[i];
          if (!m) continue;
          var p = i * 4;
          id.data[p] = TEAL[0]; id.data[p + 1] = TEAL[1]; id.data[p + 2] = TEAL[2];
          id.data[p + 3] = Math.round(m * 0.5);
        }
        maskCtx.putImageData(id, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(maskCv, 0, 0, st.W, st.H);
      }
    }

    function maskReady() { return !!(st.mask && maskArea(st.mask, 1) > 0); }
    function refreshActions() {
      var ok = maskReady() && !st.preview;
      ['a-cut', 'a-erase', 'a-fill', 'a-swap'].forEach(function (k) { $(k).disabled = !ok; });
      var modes = { 'm-pick': 'pick', 'm-add': 'brushAdd', 'm-del': 'brushDel' };
      Object.keys(modes).forEach(function (k) {
        $(k).style.background = st.mode === modes[k] ? '#E6FAF7' : '';
        $(k).style.borderColor = st.mode === modes[k] ? '#14B8A6' : 'var(--mk-border,#E3E8EF)';
      });
      $('tolwrap').style.display = (st.mode === 'pick' && st.aiTried && aiState.status !== 'ready') ? 'flex' : 'none';
    }

    img.onload = function () {
      var fw = fitWork(img.naturalWidth || img.width, img.naturalHeight || img.height, FULL_MAX);
      st.W = fw.w; st.H = fw.h;
      var wk = fitWork(st.W, st.H, WORK_MAX);
      st.ww = wk.w; st.wh = wk.h;
      maskCv.width = st.ww; maskCv.height = st.wh;
      var wc = doc.createElement('canvas');
      wc.width = st.ww; wc.height = st.wh;
      var wx = wc.getContext('2d', { willReadFrequently: true });
      wx.drawImage(img, 0, 0, st.ww, st.wh);
      st.workRGBA = wx.getImageData(0, 0, st.ww, st.wh).data;
      st.workCv = wc;
      paint(); refreshActions();
      setMsg('AI 를 준비하고 있어요… (사진은 이 기기 밖으로 나가지 않아요)');
      loadAI(function (ok) {
        st.aiTried = true;
        if (ok) {
          setMsg('사진 속 사람을 톡 눌러 주세요');
          runAI(st.workCv, st.ww, st.wh, function (prob) {
            st.prob = prob;
            if (!prob) setMsg('AI 인식이 어려워요 — 눌러서 번짐 선택 + 브러시로 칠해 주세요');
          });
        } else {
          setMsg('이 기기에선 AI 를 못 써요 — 눌러서 번짐 선택 + 브러시로 칠해 주세요');
        }
        refreshActions();
      });
    };
    img.onerror = function () { setMsg('사진을 열 수 없어요'); };
    img.src = opts.src;

    /* ---- 포인터: 탭 = 선택, 드래그 = 브러시 ---- */
    function toWork(ev) {
      var r = cv.getBoundingClientRect();
      var cx = (ev.clientX - r.left) / r.width, cy = (ev.clientY - r.top) / r.height;
      return { x: cx * st.ww, y: cy * st.wh };
    }
    cv.addEventListener('pointerdown', function (ev) {
      if (st.busy || st.preview || !st.workRGBA) return;
      ev.preventDefault();
      var p = toWork(ev);
      if (st.mode === 'pick') {
        var r = null;
        if (st.prob) {
          r = tapComponent(st.prob, st.ww, st.wh, p.x, p.y);
          if (!r) setMsg('여기엔 사람이 없는 것 같아요 — 사람 위를 눌러 보세요');
        } else {
          r = magicSelect(st.workRGBA, st.ww, st.wh, p.x, p.y, st.tol);
        }
        if (r) {
          st.mask = r.mask;
          setMsg(st.prob ? '골랐어요! 브러시로 다듬거나 아래에서 동작을 고르세요'
                         : '번짐으로 골랐어요 — 🖌/🧽 브러시로 다듬어 주세요');
        }
        paint(); refreshActions();
      } else {
        st.drawing = true;
        if (!st.mask) st.mask = new Uint8Array(st.ww * st.wh);
        cv.setPointerCapture && cv.setPointerCapture(ev.pointerId);
        brushStroke(st.mask, st.ww, st.wh, p.x, p.y, p.x, p.y, st.brushR, st.mode === 'brushAdd');
        st.lastPt = p; paint(); refreshActions();
      }
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!st.drawing || !st.mask) return;
      var p = toWork(ev);
      brushStroke(st.mask, st.ww, st.wh, st.lastPt.x, st.lastPt.y, p.x, p.y, st.brushR, st.mode === 'brushAdd');
      st.lastPt = p; paint();
    });
    var endStroke = function () { if (st.drawing) { st.drawing = false; refreshActions(); } };
    cv.addEventListener('pointerup', endStroke);
    cv.addEventListener('pointercancel', endStroke);

    $('m-pick').onclick = function () { st.mode = 'pick'; refreshActions(); };
    $('m-add').onclick = function () { st.mode = 'brushAdd'; refreshActions(); };
    $('m-del').onclick = function () { st.mode = 'brushDel'; refreshActions(); };
    $('brushr').oninput = function () { st.brushR = +this.value; };
    $('tol').oninput = function () { st.tol = +this.value; };
    $('reset').onclick = function () {
      st.mask = null; st.preview = null; st.pending = null; st.rep = null;
      $('repwrap').style.display = 'none'; $('previewbar').style.display = 'none';
      setMsg('사진 속 사람을 톡 눌러 주세요'); paint(); refreshActions();
    };

    /* ---- 원본 해상도 재료 준비 ---- */
    function fullData() {
      if (st.full) return st.full;
      var fc = doc.createElement('canvas');
      fc.width = st.W; fc.height = st.H;
      var fx = fc.getContext('2d', { willReadFrequently: true });
      fx.drawImage(img, 0, 0, st.W, st.H);
      st.full = fx.getImageData(0, 0, st.W, st.H).data;
      st.fullCv = fc;
      return st.full;
    }
    function fullMask() {
      var scale = st.W / st.ww;
      var m = scaleMask(st.mask, st.ww, st.wh, st.W, st.H);
      return featherMask(m, st.W, st.H, Math.max(1, Math.round(scale)));
    }
    function toDataUrl(data, w, h, wantAlpha) {
      var c = doc.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').putImageData(new window.ImageData(data, w, h), 0, 0);
      var srcIsPng = /^data:image\/png/.test(opts.src || '');
      return wantAlpha || srcIsPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.92);
    }
    function imgToRGBA(src, cb) {
      var im = new window.Image();
      im.onload = function () {
        var f = fitWork(im.naturalWidth || im.width, im.naturalHeight || im.height, FULL_MAX);
        var c = doc.createElement('canvas');
        c.width = f.w; c.height = f.h;
        var x2 = c.getContext('2d', { willReadFrequently: true });
        x2.drawImage(im, 0, 0, f.w, f.h);
        cb({ data: x2.getImageData(0, 0, f.w, f.h).data, w: f.w, h: f.h });
      };
      im.onerror = function () { cb(null); };
      im.src = src;
    }

    function showPreview(data, label, wantAlpha) {
      st.preview = { data: data, w: st.W, h: st.H, label: label, wantAlpha: !!wantAlpha };
      $('previewbar').style.display = 'flex';
      $('pvlabel').textContent = label + ' — 마음에 들면 적용을 눌러 주세요';
      $('repwrap').style.display = 'none';
      paint(); refreshActions();
    }
    $('pv-back').onclick = function () {
      st.preview = null;
      $('previewbar').style.display = 'none';
      if (st.pending) $('repwrap').style.display = 'block';
      paint(); refreshActions();
    };
    $('pv-apply').onclick = function () {
      if (!st.preview) return;
      var url = toDataUrl(st.preview.data, st.preview.w, st.preview.h, st.preview.wantAlpha);
      close();
      if (opts.onApply) opts.onApply(url, st.preview.label);
    };

    /* ---- 동작 4종 ---- */
    $('a-cut').onclick = function () {
      if (!maskReady() || st.busy) return;
      setBusy(true, '오리는 중…');
      setTimeout(function () {
        try {
          var m = fullMask();
          var c = cutout(fullData(), st.W, st.H, m, 4);
          if (!c) { setBusy(false); return setMsg('오릴 영역이 없어요'); }
          var cc = doc.createElement('canvas');
          cc.width = c.w; cc.height = c.h;
          cc.getContext('2d').putImageData(new window.ImageData(c.data, c.w, c.h), 0, 0);
          var long = Math.max(c.w, c.h), out = cc;
          if (long > 1024) {                       /* 요소용 PNG 상한 — 문서 비대 방지 */
            var s = 1024 / long;
            out = doc.createElement('canvas');
            out.width = Math.round(c.w * s); out.height = Math.round(c.h * s);
            out.getContext('2d').drawImage(cc, 0, 0, out.width, out.height);
          }
          var url = out.toDataURL('image/png');
          setBusy(false); close();
          if (opts.onCutout) opts.onCutout(url, { w: out.width, h: out.height });
        } catch (_) { setBusy(false); setMsg('오리다가 문제가 생겼어요 — 다시 시도해 주세요'); }
      }, 30);
    };

    $('a-erase').onclick = function () {
      if (!maskReady() || st.busy) return;
      setBusy(true, '배경을 메꾸는 중…');
      setTimeout(function () {
        try {
          var m = growMask(fullMask(), st.W, st.H, 2);
          var out = inpaint(fullData(), st.W, st.H, m);
          setBusy(false);
          showPreview(out, '🫥 인물 지우기');
        } catch (_) { setBusy(false); setMsg('메꾸다가 문제가 생겼어요 — 다시 시도해 주세요'); }
      }, 30);
    };

    function needRep(kind) {
      st.pending = kind;
      var grid = $('repgrid');
      var items = (opts.docImages || []).slice(0, 12);
      grid.innerHTML = items.map(function (it, i) {
        return '<button data-segrep="' + i + '" title="' + (it.label || '문서 사진') + '" style="padding:0;border:1px solid var(--mk-border,#E3E8EF);border-radius:8px;overflow:hidden;cursor:pointer;background:none;width:64px;height:48px"><img src="' + it.src + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></button>';
      }).join('') + '<button data-segrep="file" style="' + BTN + '">📁 파일에서</button>';
      grid.querySelectorAll('[data-segrep]').forEach(function (b) {
        b.onclick = function () {
          if (b.dataset.segrep === 'file') {
            var inp = doc.createElement('input');
            inp.type = 'file'; inp.accept = 'image/*';
            inp.onchange = function () {
              var f = inp.files && inp.files[0];
              if (!f) return;
              if (window.MK_LIVE && window.MK_LIVE.fileToSrc) {
                window.MK_LIVE.fileToSrc(f, function (src, err) {
                  if (!src) return setMsg(err || '사진을 읽지 못했어요');
                  pickRep(src);
                });
              } else {
                var rd = new window.FileReader();
                rd.onload = function () { pickRep(String(rd.result || '')); };
                rd.readAsDataURL(f);
              }
            };
            inp.click();
            return;
          }
          pickRep(items[+b.dataset.segrep].src);
        };
      });
      $('repwrap').style.display = 'block';
      setMsg(kind === 'fill' ? '실루엣 안에 채울 사진을 골라 주세요' : '그 자리에 세울 사진을 골라 주세요 (오려낸 인물 PNG 면 제일 자연스러워요)');
    }
    function pickRep(src) {
      setBusy(true, '사진을 준비하는 중…');
      imgToRGBA(src, function (rep) {
        if (!rep) { setBusy(false); return setMsg('이 사진은 열 수 없어요'); }
        st.rep = rep;
        setBusy(true, st.pending === 'fill' ? '실루엣에 채우는 중…' : '자리를 바꾸는 중…');
        setTimeout(function () {
          try {
            var m = fullMask();
            var out = st.pending === 'fill'
              ? fillSilhouette(fullData(), st.W, st.H, m, rep.data, rep.w, rep.h)
              : replaceRegion(fullData(), st.W, st.H, m, rep.data, rep.w, rep.h);
            setBusy(false);
            if (!out) return setMsg('합성할 영역이 없어요');
            showPreview(out, st.pending === 'fill' ? '🖼 실루엣에 채우기' : '🔁 자리 바꾸기');
          } catch (_) { setBusy(false); setMsg('합성하다가 문제가 생겼어요 — 다시 시도해 주세요'); }
        }, 30);
      });
    }
    $('a-fill').onclick = function () { if (maskReady() && !st.busy) needRep('fill'); };
    $('a-swap').onclick = function () { if (maskReady() && !st.busy) needRep('swap'); };

    refreshActions();
  }

  var BTN = 'padding:7px 11px;border:1px solid var(--mk-border,#E3E8EF);border-radius:9px;background:var(--mk-surface,#fff);font-size:12.5px;cursor:pointer;';

  /* ---- 계약 자기 검증(하니스·디버그 공용): 순수 로직 실존 ---- */
  function verify() {
    var v = [];
    ['fitWork', 'tapComponent', 'magicSelect', 'growMask', 'shrinkMask', 'featherMask',
      'brushStroke', 'maskArea', 'maskBounds', 'scaleMask', 'coverFit', 'containFit',
      'inpaint', 'cutout', 'fillSilhouette', 'replaceRegion', 'open', 'loadAI'].forEach(function (k) {
      if (typeof api[k] !== 'function') v.push('missing:' + k);
    });
    return { ok: !v.length, violations: v };
  }

  var api = {
    VENDOR: VENDOR, WORK_MAX: WORK_MAX, THR: THR,
    fitWork: fitWork, tapComponent: tapComponent, magicSelect: magicSelect,
    growMask: growMask, shrinkMask: shrinkMask, featherMask: featherMask,
    brushStroke: brushStroke, maskArea: maskArea, maskBounds: maskBounds,
    scaleMask: scaleMask, coverFit: coverFit, containFit: containFit,
    bilinearRGBA: bilinearRGBA, inpaint: inpaint, cutout: cutout,
    fillSilhouette: fillSilhouette, replaceRegion: replaceRegion,
    loadAI: loadAI, runAI: runAI, open: open, verify: verify,
    _ai: aiState,
  };
  return api;
})();
