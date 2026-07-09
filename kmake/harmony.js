/* ============================================================
   케이메이커 색 하모니 엔진 (KM_HARMONY) — 무기③ M3-2 (2026-07-09)
   ------------------------------------------------------------
   "배경에서 뽑은 어울림색" — 생성기와 편집이 한 색 세계관.

   설계: kmake/KMAKE_3무기_설계.md M3-2. 오퍼스 몫.
   - 주조색 추출: 배경(이미지/단색/합성) 32×32 다운샘플 → HSL 버킷
     최빈 hue(간이, k-means 불요).
   - 제안: 추출 hue → **KM_GEN.colorHarmony 공식 그대로 재사용**(복사 X)
     → 5역할 칩(배경·보조·주색·강조·잉크). 잉크 대비 4.5:1 게이트는
     colorHarmony 내부에서 이미 보장.
   - 칩 클릭 = 선택 객체(다중 포함) 색 적용.

   구조 — DI(엔진 코어 무수정): init({getCanvas,getBase,pushHistory,toast}).
   순수 로직(rgb2hsl·dominantHue·chips)은 node 스모크로 검증.
   ⚠ 색 공식은 generator.js 소유 — 여기서 재현하지 않는다.
   ============================================================ */
(function () {
  'use strict';

  var H = null;
  function init(hooks) { H = hooks; ensureStyle(); }
  function C() { return H && H.getCanvas && H.getCanvas(); }
  function gen() { return (typeof window !== 'undefined') ? window.KM_GEN : null; }

  /* ---------- 순수 로직(스모크) ---------- */
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var h = 0, s = 0, l = (max + min) / 2;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  // RGBA 배열(Uint8 유사) → 최빈 hue. 회색/극단 명도는 가중 낮춤. 유효색 없으면 null
  function dominantHue(data) {
    var BUCKETS = 12, sum = new Array(BUCKETS).fill(0), hacc = new Array(BUCKETS).fill(0), any = 0;
    for (var i = 0; i + 3 < data.length; i += 4) {
      var a = data[i + 3]; if (a !== undefined && a < 8) continue;   // 투명 픽셀 제외
      var hsl = rgb2hsl(data[i], data[i + 1], data[i + 2]);
      var hue = hsl[0], s = hsl[1], l = hsl[2];
      if (s < 0.12 || l > 0.94 || l < 0.06) continue;                // 무채·백·흑 제외
      var w = s * (1 - Math.abs(2 * l - 1));                         // 채도·중명도 가중
      var bi = Math.floor(((hue % 360) + 360) % 360 / (360 / BUCKETS)) % BUCKETS;
      sum[bi] += w; hacc[bi] += hue * w; any += w;
    }
    if (!any) return null;
    var top = 0; for (var k = 1; k < BUCKETS; k++) if (sum[k] > sum[top]) top = k;
    return sum[top] > 0 ? ((hacc[top] / sum[top]) % 360 + 360) % 360 : null;
  }

  // hue → 생성기 색 공식(재사용) → 5역할 칩. gen 미지정 시 window.KM_GEN
  function chips(hue, seed, g) {
    g = g || gen(); if (!g || typeof g.colorHarmony !== 'function') return [];
    var sd = (seed === undefined || seed === null) ? (Math.round(((hue || 0) * 7) + 1) >>> 0) : (seed >>> 0);
    var r = g.colorHarmony(sd, { h: hue || 0 });
    return [
      { k: 'bg', label: '배경', c: r.bg },
      { k: 'sub', label: '보조', c: r.sub },
      { k: 'primary', label: '주색', c: r.primary },
      { k: 'accent', label: '강조', c: r.accent },
      { k: 'ink', label: '잉크', c: r.ink },
    ];
  }

  /* ---------- 브라우저: 추출 ---------- */
  function bgImageEl(canvas) {
    var found = null;
    canvas.forEachObject(function (o) {
      if (found) return;
      if (o.type === 'image' && (o.kmType === 'background' || o._element)) {
        // 배경 지정 우선, 없으면 캔버스를 거의 덮는 첫 이미지
        var r = o.getBoundingRect(true, true), base = H.getBase();
        if (o.kmType === 'background' || (r.width >= base.w * 0.8 && r.height >= base.h * 0.8)) found = o._element;
      }
    });
    return found;
  }
  function parseColorHue(str) {
    if (!str || typeof str !== 'string') return null;
    var m = str.replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(m)) { var hsl = rgb2hsl(parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)); return hsl[1] < 0.12 ? null : hsl[0]; }
    var n = str.match(/\d+/g); if (n && n.length >= 3) { var h2 = rgb2hsl(+n[0], +n[1], +n[2]); return h2[1] < 0.12 ? null : h2[0]; }
    return null;
  }
  function extractHue(cb) {
    var canvas = C(); if (!canvas || typeof document === 'undefined') { cb(null); return; }
    var el = null;
    try { el = bgImageEl(canvas); } catch (e) {}
    if (!el) {
      var bh = parseColorHue(canvas.backgroundColor);
      if (bh != null) { cb(bh); return; }
    }
    try {
      var off = document.createElement('canvas'); off.width = 32; off.height = 32;
      var ctx = off.getContext('2d');
      if (el) ctx.drawImage(el, 0, 0, 32, 32);
      else ctx.drawImage(canvas.lowerCanvasEl, 0, 0, 32, 32);
      cb(dominantHue(ctx.getImageData(0, 0, 32, 32).data));
    } catch (e) { cb(null); }
  }

  /* ---------- 적용 ---------- */
  function setFill(o, color) {
    if (!o) return;
    if (o.type === 'group' && o.getObjects) o.getObjects().forEach(function (p) { p.set('fill', color); });
    else if (o.type === 'activeSelection' && o._objects) o._objects.forEach(function (p) { setFill(p, color); });
    else o.set('fill', color);
  }
  function applyColor(color) {
    var canvas = C(); if (!canvas) return;
    var objs = canvas.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(function (o) { setFill(o, color); });
    canvas.requestRenderAll();
    if (H.pushHistory) H.pushHistory();
  }

  /* ---------- 패널 접합 ---------- */
  function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById('kmHarmStyle')) return;
    var css = document.createElement('style'); css.id = 'kmHarmStyle';
    css.textContent =
      '.km-harm-chips{display:flex;gap:8px;margin-top:2px}' +
      '.km-harm-chips button{flex:1;height:auto;border:1px solid rgba(0,0,0,.08);border-radius:10px;padding:0;cursor:pointer;overflow:hidden;background:#fff}' +
      '.km-harm-chips .sw{display:block;height:34px}' +
      '.km-harm-chips .cl{display:block;font-size:10px;color:#64748b;padding:3px 0;font-weight:700;text-align:center;font-family:"Gowun Dodum",sans-serif}' +
      '.km-harm-chips button:hover{border-color:#5B8EF8;box-shadow:0 2px 8px rgba(91,142,248,.25)}' +
      '.km-harm-hint{font-size:11px;color:#94a3b8;margin-top:8px}';
    document.head.appendChild(css);
  }
  // 색 가능한 객체에만 노출
  function colorable(o) {
    if (!o) return false;
    return o.type === 'textbox' || o.type === 'i-text' ||
      ['rect', 'circle', 'triangle', 'line'].indexOf(o.type) >= 0 ||
      o.type === 'activeSelection' || o.kmType === 'icon' || o.kmType === 'shape';
  }
  function sectionHTML(o) {
    if (!colorable(o)) return '';
    var ph = '';
    for (var i = 0; i < 5; i++) ph += '<button disabled><span class="sw" style="background:#eef2f7"></span><span class="cl">…</span></button>';
    return '<div class="panel-sec" id="kmHarmSec"><h3>🎨 색 하모니</h3><div class="km-harm-chips" id="kmHarmChips">' + ph +
      '</div><div class="km-harm-hint">배경에서 뽑은 어울림색 — 칩을 누르면 선택한 요소에 칠해요</div></div>';
  }
  function bind(o) {
    if (typeof document === 'undefined') return;
    var box = document.getElementById('kmHarmChips'); if (!box || !colorable(o)) return;
    extractHue(function (hue) {
      if (hue == null) hue = 210;                 // 유효색 없으면 차분한 기본(생성기와 동일 체계)
      var cs = chips(hue, 0);
      if (!cs.length) { var sec = document.getElementById('kmHarmSec'); if (sec) sec.style.display = 'none'; return; }
      box.innerHTML = cs.map(function (c) {
        return '<button data-c="' + c.c + '" title="' + c.label + ' ' + c.c + '"><span class="sw" style="background:' + c.c + '"></span><span class="cl">' + c.label + '</span></button>';
      }).join('');
      box.querySelectorAll('button').forEach(function (b) { b.onclick = function () { applyColor(b.dataset.c); }; });
    });
  }

  var API = {
    rgb2hsl: rgb2hsl, dominantHue: dominantHue, chips: chips,
    init: init, sectionHTML: sectionHTML, bind: bind, applyColor: applyColor, colorable: colorable,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.KM_HARMONY = API;
})();
