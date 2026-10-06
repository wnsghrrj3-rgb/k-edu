/* gens/science/observe_animal.js — 「동물의 생활」 관찰 고르기 (3학년 1학기 과학 2단원 · l01~l06)
 * 순수 함수·DOM 무관 (§9-3). 장르 observe_pick(관찰 고르기)이 쓴다. 그림은 SVG 글자열로 돌려준다.
 *
 * 관찰 vs 추측(설계 v4 §4 observe_pick 의 byType 축):
 *   그림 두 장(가·나)을 보고 조건에 맞는 쪽을 고른다. 답은 셋 — 가 · 나 · 🤔 그림으로는 알 수 없어요.
 *   「알 수 없어요」는 그림에 안 보이는 것을 묻는 문항(굴 속 다리 · 구름 뒤 몸 · 바위 뒤 지느러미 · 몸 안 지방)과
 *   사람마다 달라지는 것을 묻는 문항(귀여운가 · 예쁜가 — 정본 l02 오개념)에만 정답이다.
 * 이름표 0 — 카드에도 물음에도 동물 이름을 적지 않는다. 그림 속 동물은 실제 종이 아니라 특징만 가진 지어낸 동물이다
 *   (이름을 알면 보지 않고 아는 것으로 답한다 — 관찰을 재는 장르). 다리는 셀 수 있게 따로따로 그린다.
 * 그림은 매번 rng 로 새로 그린다(색 · 방향 · 크기 · 자세) — 외워서는 못 푼다. 그림 속성은 SVG 에 남기지 않는다(답 미노출).
 * 한 문항의 두 카드는 같은 배경 위에 선다(배경으로 답을 짐작하지 못하게).
 * 낱말은 정본 data/g3_science_u2.js 에서만: 목·등딱지·귀(l01) · 날개·다리·귀여운·예쁜(l02) · 기어다녀·구부렸다·걷거나·굴(l03)
 *   · 곤충·새·다리 2개·6개·깃털·얇은(l04) · 지느러미·아가미·물고기·다리로(l05) · 털·지방·추위·혹(l06).
 *   범위 밖 낱말은 그 차시 문항에 나오지 않는다(스모크가 잰다). 「빨리·빠르」(l08)는 쓰지 않는다.
 *
 * params: { upto: 'l01'|…|'l06'|'all' } — 단원 처음부터 그 차시까지 누적, 이번 차시 문항 먼저.
 * next() → { id, l, type, ask, cards:[{svg},{svg}], answer:'a'|'b'|'q', explain, prompt }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['observe_animal'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l03', 'l04', 'l05', 'l06'];
  var INK = '#3a2f28';
  var FUR = ['#c98a4b', '#b7895c', '#9a7b62', '#d9a066', '#a8a29e', '#c4a57a'];
  var BIRD = ['#5b8fd6', '#e0794a', '#6aa86b', '#c4a23c', '#8f7ad0'];
  var BUG = ['#e2b03a', '#d9634a', '#7aa84d', '#4a8fd0', '#b06ab3'];
  var FISH = ['#f08a4b', '#5aa9d6', '#e3c04a', '#8bc06a', '#d97aa6'];
  var SEA = ['#d9634a', '#b06ab3', '#e08a5a', '#c76b8f'];
  var WORM = ['#c97a7a', '#a8885a', '#7f9b4a', '#b98a6a'];

  function r2(n) { return Math.round(n * 10) / 10; }
  function pick(rng, a) { return a[Math.floor(rng() * a.length)]; }
  function between(rng, a, b) { return a + (b - a) * rng(); }
  function shuffle(rng, a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function svg(inner) {
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="관찰 그림">' + inner + '</svg>';
  }
  function eye(x, y, r) {
    r = r || 3.6;
    return '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/><circle cx="' + r2(x + r * 0.25) + '" cy="' + r2(y) + '" r="' + r2(r * 0.55) + '" fill="' + INK + '"/>';
  }
  function circ(x, y, r, fill, sw) { return '<circle cx="' + r2(x) + '" cy="' + r2(y) + '" r="' + r2(r) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + (sw || 2.2) + '"/>'; }
  function ell(x, y, rx, ry, fill, extra) { return '<ellipse cx="' + r2(x) + '" cy="' + r2(y) + '" rx="' + r2(rx) + '" ry="' + r2(ry) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.2"' + (extra || '') + '/>'; }
  function line(x1, y1, x2, y2, w, col) { return '<line x1="' + r2(x1) + '" y1="' + r2(y1) + '" x2="' + r2(x2) + '" y2="' + r2(y2) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2.4) + '" stroke-linecap="round"/>'; }

  // ── 배경 — 한 문항의 두 카드는 같은 배경
  function bg(kind) {
    if (kind === 'sky') return '<rect x="0" y="0" width="200" height="200" fill="#e3f2ff"/><path d="M18 38 q10 -12 22 -2 q10 -8 18 2 q8 0 6 8 h-48 q-6 -6 2 -8z" fill="#fff"/>';
    if (kind === 'water') return '<rect x="0" y="0" width="200" height="200" fill="#a7d8f0"/><path d="M0 14 q25 -6 50 0 t50 0 t50 0 t50 0" stroke="#4a90b8" stroke-width="2.4" fill="none"/><rect x="0" y="182" width="200" height="18" fill="#d9c08a"/>';
    return '<rect x="0" y="0" width="200" height="200" fill="#eef7ff"/><rect x="0" y="168" width="200" height="32" fill="#c9e3a5"/><path d="M0 168 H200" stroke="#8fb86a" stroke-width="2.4"/>';
  }

  // ── 네발 동물(지어낸 동물) — spec { k:'beast', neck:'long'|'short', ears:'long'|'short', shell, fur, hump, hue }
  function drawBeast(sp) {
    var s = '', hue = sp.hue, by = 116, bx = 92, rx = 48, ry = sp.shell ? 22 : 25;
    // 다리 넷 — 따로따로 셀 수 있게 간격을 둔다
    var legTop = by + ry - 6, legBot = sp.shell ? 160 : 168, lw = sp.shell ? 12 : 9;
    [56, 74, 108, 126].forEach(function (x, i) {
      var jig = (i % 2 ? 1 : -1) * 1.5;
      s += '<rect x="' + r2(x - lw / 2 + jig) + '" y="' + r2(legTop) + '" width="' + lw + '" height="' + r2(legBot - legTop) + '" rx="3" fill="' + hue + '" stroke="' + INK + '" stroke-width="2"/>';
    });
    s += line(bx - rx + 4, by - 4, bx - rx - 14, by - 18 + (sp.fur ? 6 : 0), sp.fur ? 7 : 3.4, sp.fur ? hue : INK);   // 꼬리
    if (sp.hump) s += ell(bx - 6, by - ry - 6, 24, 24, hue) + '<path d="M' + (bx - 22) + ' ' + (by - ry - 14) + ' q 16 -14 32 0" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".35"/>';
    if (sp.fur) {                                       // 두꺼운 털 — 몸 둘레를 북슬북슬하게
      var fuzz = '';
      for (var a = 0; a < 360; a += 18) { var t = a * Math.PI / 180; fuzz += '<circle cx="' + r2(bx + Math.cos(t) * rx) + '" cy="' + r2(by + Math.sin(t) * ry) + '" r="9"/>'; }
      s += '<g fill="' + hue + '" stroke="' + INK + '" stroke-width="2.2">' + fuzz + '</g><g fill="' + hue + '">' + fuzz.replace(/r="9"/g, 'r="7.4"') + '</g>';
    }
    s += ell(bx, by, rx, ry, hue);
    if (sp.shell) {                                     // 등딱지 — 몸 위 둥근 지붕 + 무늬
      s += '<path d="M' + (bx - rx - 4) + ' ' + (by + 4) + ' Q ' + bx + ' ' + (by - 82) + ' ' + (bx + rx + 4) + ' ' + (by + 4) + ' Z" fill="#8a9a4a" stroke="' + INK + '" stroke-width="2.6"/>';
      s += '<path d="M' + (bx - 24) + ' ' + (by - 2) + ' l 12 -22 h 24 l 12 22 M' + (bx - 12) + ' ' + (by - 24) + ' l -10 -10 M' + (bx + 12) + ' ' + (by - 24) + ' l 10 -10 M' + (bx - 36) + ' ' + (by) + ' h -10 M' + (bx + 36) + ' ' + (by) + ' h 10" stroke="#5f6b2a" stroke-width="2" fill="none"/>';
    }
    // 목과 머리
    var hx, hy, hr = sp.shell ? 13 : 17;
    if (sp.neck === 'long') {
      hx = 162; hy = 40;
      s += '<path d="M' + (bx + rx - 22) + ' ' + (by - ry + 8) + ' L ' + (hx - 12) + ' ' + (hy + 6) + ' L ' + (hx + 4) + ' ' + (hy + 10) + ' L ' + (bx + rx - 2) + ' ' + (by - 6) + ' Z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    } else { hx = bx + rx + (sp.shell ? 12 : 10); hy = by - (sp.shell ? 6 : 22); }
    if (sp.ears === 'long') {
      s += ell(hx - 7, hy - hr - 14, 5, 18, hue, ' transform="rotate(-10 ' + r2(hx - 7) + ' ' + r2(hy - hr - 14) + ')"');
      s += ell(hx + 6, hy - hr - 13, 5, 18, hue, ' transform="rotate(12 ' + r2(hx + 6) + ' ' + r2(hy - hr - 13) + ')"');
    } else if (!sp.shell) {
      s += '<path d="M' + r2(hx - 12) + ' ' + r2(hy - hr + 6) + ' l 3 -11 l 8 7 Z M' + r2(hx + 4) + ' ' + r2(hy - hr + 4) + ' l 6 -10 l 5 10 Z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    }
    s += circ(hx, hy, hr, hue) + eye(hx + hr * 0.35, hy - hr * 0.2, sp.shell ? 3 : 3.6) + '<circle cx="' + r2(hx + hr * 0.85) + '" cy="' + r2(hy + hr * 0.3) + '" r="2" fill="' + INK + '"/>';
    return s;
  }

  // ── 새(지어낸 새) — spec { k:'bird', fly, hue } · 깃털 날개 · 다리 2개
  function drawBird(sp) {
    var s = '', hue = sp.hue, cx = 98, cy = sp.fly ? 96 : 104;
    s += '<path d="M' + (cx - 30) + ' ' + (cy - 2) + ' L ' + (cx - 58) + ' ' + (cy - 14) + ' L ' + (cx - 54) + ' ' + (cy + 4) + ' L ' + (cx - 60) + ' ' + (cy + 14) + ' Z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    if (!sp.fly) {
      [-8, 10].forEach(function (d) {
        var x = cx + d, y0 = cy + 20, y1 = 166;
        s += line(x, y0, x, y1, 3, '#c07a2a') + line(x, y1, x + 9, y1 + 2, 2.6, '#c07a2a') + line(x, y1, x - 7, y1 + 3, 2.6, '#c07a2a') + line(x, y1, x + 2, y1 + 6, 2.6, '#c07a2a');
      });
    } else {
      [-6, 8].forEach(function (d) { var x = cx + d, y0 = cy + 20; s += line(x, y0, x - 12, y0 + 20, 3, '#c07a2a') + line(x - 12, y0 + 20, x - 18, y0 + 22, 2.4, '#c07a2a'); });
    }
    s += ell(cx, cy, 36, 24, hue);
    var hx = cx + 34, hy = cy - 22;
    s += circ(hx, hy, 15, hue) + '<path d="M' + (hx + 12) + ' ' + (hy - 5) + ' L ' + (hx + 28) + ' ' + (hy + 1) + ' L ' + (hx + 12) + ' ' + (hy + 6) + ' Z" fill="#f2b33d" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' + eye(hx + 4, hy - 3, 3.4);
    // 깃털 날개 — 깃털 셋을 겹쳐 그린다
    var wy = sp.fly ? cy - 40 : cy - 4, rot = sp.fly ? -32 : 8;
    s += '<g transform="rotate(' + rot + ' ' + (cx - 4) + ' ' + cy + ')" fill="' + hue + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round">';
    [0, 1, 2].forEach(function (k) { s += '<path d="M' + (cx + 14 - k * 4) + ' ' + (wy - 6 + k * 2) + ' Q ' + (cx - 10 - k * 6) + ' ' + (wy - 12 + k * 8) + ' ' + (cx - 34 - k * 4) + ' ' + (wy + 8 + k * 7) + ' Q ' + (cx - 6) + ' ' + (wy + 14 + k * 4) + ' ' + (cx + 14 - k * 4) + ' ' + (wy + 8 + k * 2) + ' Z"/>'; });
    s += '</g>';
    return s;
  }

  // ── 곤충(지어낸 곤충) — spec { k:'insect', fly, hue } · 얇은 날개 · 다리 6개(부채꼴로 따로따로)
  function drawInsect(sp) {
    var s = '', hue = sp.hue, base = sp.fly ? 96 : 112;
    var ends = [60, 82, 104, 126, 148, 170];          // 끝을 넓게 벌려 폰 세로에서도 하나씩 셀 수 있게
    [98, 104, 110, 118, 124, 130].forEach(function (x, i) {
      var ex = ends[i], ey = sp.fly ? base + 42 : 164, kx = (x + ex) / 2 + (i < 3 ? -4 : 4), ky = base + (ey - base) * 0.45;
      s += '<polyline points="' + r2(x) + ',' + r2(base + 6) + ' ' + r2(kx) + ',' + r2(ky) + ' ' + r2(ex) + ',' + r2(ey) + '" fill="none" stroke="' + INK + '" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round"/>';
    });
    s += ell(78, base, 32, 15, hue);
    s += '<path d="M66 ' + (base - 13) + ' v26 M80 ' + (base - 15) + ' v30 M94 ' + (base - 12) + ' v24" stroke="' + INK + '" stroke-width="2" opacity=".55"/>';
    s += ell(116, base - 2, 15, 12, hue);
    s += circ(140, base - 8, 11, hue) + eye(144, base - 10, 3);
    s += '<path d="M144 ' + (base - 18) + ' Q 150 ' + (base - 36) + ' 162 ' + (base - 40) + ' M138 ' + (base - 19) + ' Q 140 ' + (base - 38) + ' 150 ' + (base - 46) + '" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    var lift = sp.fly ? -22 : -8;
    [[96, -28], [104, -14]].forEach(function (w) {
      s += '<ellipse cx="' + w[0] + '" cy="' + (base - 32 + lift / 2) + '" rx="30" ry="12" transform="rotate(' + (w[1] + lift) + ' 114 ' + (base - 12) + ')" fill="#ffffff" fill-opacity=".6" stroke="' + INK + '" stroke-width="1.8"/>';
    });
    return s;
  }

  // ── 다리 없는 동물 — spec { k:'worm', dots, hue } · 몸을 구부린 물결
  function drawWorm(sp) {
    var hue = sp.hue, d = 'M26 ' + sp.y0, s = '';
    for (var k = 0; k < 4; k++) { var x = 26 + k * 36; d += ' Q ' + (x + 18) + ' ' + (sp.y0 + (k % 2 ? 26 : -26)) + ' ' + (x + 36) + ' ' + sp.y0; }
    s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="22" fill="none" stroke-linecap="round"/><path d="' + d + '" stroke="' + hue + '" stroke-width="17" fill="none" stroke-linecap="round"/>';
    if (sp.dots) s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="4" fill="none" stroke-dasharray="2 12" opacity=".45"/>';
    else s += '<path d="' + d + '" stroke="' + INK + '" stroke-width="15" fill="none" stroke-dasharray="1.6 8" opacity=".35"/>';
    s += eye(166, sp.y0 - 3, 3);
    return s;
  }

  // ── 물속 동물 — 물고기(지느러미·아가미) · 다리로 움직이는 동물(지느러미 없음)
  function drawFish(sp) {
    var hue = sp.hue, y = sp.y0, s = '';
    s += '<path d="M48 ' + y + ' L 20 ' + (y - 24) + ' Q 30 ' + y + ' 20 ' + (y + 24) + ' Z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    s += '<path d="M84 ' + (y - 30) + ' Q 100 ' + (y - 54) + ' 124 ' + (y - 30) + ' Z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/>';
    s += '<path d="M44 ' + y + ' Q 96 ' + (y - 62) + ' 162 ' + y + ' Q 96 ' + (y + 62) + ' 44 ' + y + ' Z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2.4"/>';
    for (var x = 70; x < 128; x += 14) s += '<path d="M' + x + ' ' + (y - 10) + ' q 7 10 0 20" stroke="' + INK + '" stroke-width="1.4" fill="none" opacity=".4"/>';
    s += '<path d="M130 ' + (y - 18) + ' q -9 18 0 36" stroke="' + INK + '" stroke-width="2.2" fill="none"/>';
    s += '<path d="M112 ' + (y + 8) + ' q -12 16 -26 14 q 8 -10 26 -14 z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>';
    s += eye(144, y - 8, 4.4);
    return s;
  }
  function drawOcto(sp) {
    var hue = sp.hue, s = '';
    for (var k = 0; k < 8; k++) {
      var x0 = 72 + k * 8, sw = (k % 2 ? 1 : -1) * 12, x1 = 40 + k * 17;
      s += '<path d="M' + x0 + ' 100 C ' + (x0 + sw) + ' 130 ' + (x1 - sw) + ' 140 ' + x1 + ' 172" stroke="' + INK + '" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M' + x0 + ' 100 C ' + (x0 + sw) + ' 130 ' + (x1 - sw) + ' 140 ' + x1 + ' 172" stroke="' + hue + '" stroke-width="6.4" fill="none" stroke-linecap="round"/>';
    }
    s += ell(100, 72, 36, 36, hue) + eye(88, 84, 4.4) + eye(112, 84, 4.4);
    return s;
  }
  function drawCrab(sp) {
    var hue = sp.hue, s = '';
    [-1, 1].forEach(function (side) {
      [0, 1, 2, 3].forEach(function (k) {
        var x = 100 + side * (18 + k * 8), y = 138, kx = 100 + side * (52 + k * 10), ky = 126 + k * 6, ex = 100 + side * (62 + k * 9), ey = 176;
        s += '<polyline points="' + x + ',' + y + ' ' + kx + ',' + ky + ' ' + ex + ',' + ey + '" fill="none" stroke="' + INK + '" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>';
      });
      s += line(100 + side * 30, 126, 100 + side * 56, 98, 6, INK) + '<path d="M' + (100 + side * 50) + ' 100 q ' + (side * 12) + ' -26 ' + (side * 30) + ' -16 q ' + (side * -10) + ' 4 ' + (side * -12) + ' 12 q ' + (side * 10) + ' 2 ' + (side * 14) + ' 12 q ' + (side * -20) + ' 8 ' + (side * -32) + ' -8 z" fill="' + hue + '" stroke="' + INK + '" stroke-width="2"/>';
      s += line(100 + side * 10, 118, 100 + side * 12, 100, 2.4) + eye(100 + side * 12, 98, 3.4);
    });
    s += ell(100, 132, 40, 22, hue);
    return s;
  }

  // ── 숨은 장면(알 수 없어요 전용)
  function drawBurrow(sp) {   // 땅속 굴 — 머리만 보인다
    var s = '<rect x="0" y="108" width="200" height="92" fill="#b98a5a"/><path d="M0 108 H200" stroke="#7a5a3a" stroke-width="3"/>';
    s += '<ellipse cx="' + sp.x + '" cy="112" rx="40" ry="11" fill="#4a3424"/>';
    s += '<path d="M' + (sp.x - 26) + ' 112 a 26 30 0 0 1 52 0 Z" fill="' + sp.hue + '" stroke="' + INK + '" stroke-width="2.2"/>' + eye(sp.x - 9, 96, 4.2) + eye(sp.x + 9, 96, 4.2) + '<circle cx="' + sp.x + '" cy="106" r="2.2" fill="' + INK + '"/>';
    s += '<path d="M' + (sp.x - 40) + ' 112 q 40 16 80 0" stroke="#7a5a3a" stroke-width="3" fill="#b98a5a"/>';
    return s;
  }
  function drawCloud(sp) {    // 구름 뒤 — 같은 회색 끝자락만 구름 가장자리로 삐죽 보인다(어느 동물인지 단서 없음)
    var tx = sp.side ? 178 : 22, d = sp.side ? 1 : -1;
    var s = '<path d="M' + (tx - d * 14) + ' ' + sp.y + ' q ' + (d * 16) + ' -14 ' + (d * 24) + ' -4 q ' + (d * -6) + ' 8 ' + (d * -24) + ' 12 Z" fill="#8f99a3" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>';
    s += '<g fill="#ffffff" stroke="#b8c8d8" stroke-width="2.4"><circle cx="70" cy="110" r="34"/><circle cx="110" cy="92" r="40"/><circle cx="146" cy="114" r="30"/><circle cx="104" cy="128" r="32"/></g>';
    s += '<g fill="#ffffff"><circle cx="70" cy="110" r="31"/><circle cx="110" cy="92" r="37"/><circle cx="146" cy="114" r="27"/><circle cx="104" cy="128" r="29"/></g>';
    return s;
  }
  function drawRock(sp) {     // 바위 뒤 — 눈만 보인다
    var s = '<g>' + eye(sp.x - 8, 66, 5) + eye(sp.x + 8, 66, 5) + '</g>';
    s += '<path d="M24 184 Q 30 80 92 70 Q 168 66 178 184 Z" fill="#8c8c8c" stroke="' + INK + '" stroke-width="2.6"/><path d="M60 120 q 20 -10 40 0 M110 140 q 18 -6 32 4" stroke="#6e6e6e" stroke-width="2.2" fill="none"/>';
    [0, 1, 2].forEach(function (k) { s += '<circle cx="' + (sp.x + 16 + k * 6) + '" cy="' + (50 - k * 14) + '" r="' + (3 + k) + '" fill="none" stroke="#e8f6ff" stroke-width="1.6"/>'; });
    return s;
  }

  function body(sp) {
    switch (sp.k) {
      case 'beast': return drawBeast(sp);
      case 'bird': return drawBird(sp);
      case 'insect': return drawInsect(sp);
      case 'worm': return drawWorm(sp);
      case 'fish': return drawFish(sp);
      case 'octo': return drawOcto(sp);
      case 'crab': return drawCrab(sp);
      case 'burrow': return drawBurrow(sp);
      case 'cloud': return drawCloud(sp);
      default: return drawRock(sp);
    }
  }
  // 좌우 뒤집기·크기·기울기를 rng 로 — 같은 생김새도 매번 다르게 보인다
  function draw(sp) {
    var inner = body(sp), tf = '';
    if (sp.flip) tf += 'translate(200 0) scale(-1 1) ';
    if (sp.sc && sp.sc !== 1) tf += 'translate(100 ' + (sp.anchor || 168) + ') scale(' + sp.sc + ') translate(-100 -' + (sp.anchor || 168) + ') ';
    if (sp.tilt) tf += 'rotate(' + sp.tilt + ' 100 120)';
    return svg(bg(sp.bg) + (tf ? '<g transform="' + tf.trim() + '">' + inner + '</g>' : inner));
  }

  // ── 그림 재료
  function look(rng, sp, scene) {
    sp.bg = scene; sp.flip = rng() < 0.5;
    if (sp.k === 'burrow' || sp.k === 'cloud' || sp.k === 'rock') return sp;     // 숨은 장면은 제 땅·구름·바위가 화면을 채운다(줄이면 배경이 샌다)
    sp.sc = r2(between(rng, 0.9, 1.04));
    sp.anchor = scene === 'water' ? 182 : 168;
    if (sp.k === 'bird' && sp.fly || sp.k === 'insect' && sp.fly || sp.k === 'fish') sp.tilt = r2(between(rng, -6, 6));
    return sp;
  }
  function beast(rng, o) {
    var sp = { k: 'beast', neck: 'short', ears: rng() < 0.5 ? 'long' : 'short', shell: false, fur: false, hump: false, hue: pick(rng, FUR) };
    for (var key in o) sp[key] = o[key];
    if (sp.shell) { sp.ears = 'short'; sp.neck = 'short'; sp.fur = false; sp.hump = false; }
    return sp;
  }
  function bird(rng, fly) { return { k: 'bird', fly: !!fly, hue: pick(rng, BIRD) }; }
  function insect(rng, fly) { return { k: 'insect', fly: !!fly, hue: pick(rng, BUG) }; }
  function worm(rng) { return { k: 'worm', dots: rng() < 0.5, y0: Math.round(between(rng, 132, 146)), hue: pick(rng, WORM) }; }
  function fish(rng) { return { k: 'fish', y0: Math.round(between(rng, 90, 110)), hue: pick(rng, FISH) }; }
  function legged(rng) { return rng() < 0.5 ? { k: 'octo', hue: pick(rng, SEA) } : { k: 'crab', hue: pick(rng, SEA) }; }
  function walker(rng) { var r = rng(); return r < 0.5 ? beast(rng, {}) : r < 0.75 ? insect(rng, false) : bird(rng, false); }

  // ── 문항 틀 — 차시 · 유형 · make(rng) → { ask, yes, no, scene, ex(Y,N) } 또는 { ask, q:true, cards, scene, ex }
  var T = [
    // l01 활짝! 과학 열기 — 동물마다 다른 생김새(목 · 등딱지 · 귀)
    { l: 'l01', type: 'look_part', make: function (rng) {
      return { ask: '목이 긴 동물은 어느 쪽일까요?', scene: 'ground', yes: beast(rng, { neck: 'long' }), no: beast(rng, { neck: 'short', ears: 'long' }),
        ex: function (Y, N) { return '「' + Y + '」 동물은 목이 길어요. 「' + N + '」 동물은 귀가 길지만 목은 짧아요 — 어디가 긴지 자세히 봐요.'; } };
    } },
    { l: 'l01', type: 'look_part', make: function (rng) {
      return { ask: '등딱지가 있는 동물은 어느 쪽일까요?', scene: 'ground', yes: beast(rng, { shell: true }), no: beast(rng, {}),
        ex: function (Y, N) { return '「' + Y + '」 동물은 등에 단단한 등딱지가 있어요. 「' + N + '」 동물은 등딱지가 없어요.'; } };
    } },
    { l: 'l01', type: 'look_part', make: function (rng) {
      var conf = rng() < 0.5;                             // 헷갈림 짝: 목이 길고 귀는 짧은 동물
      return { ask: '귀가 긴 동물은 어느 쪽일까요?', scene: 'ground', yes: beast(rng, { ears: 'long' }), no: beast(rng, { ears: 'short', neck: conf ? 'long' : 'short' }),
        ex: function (Y, N) { return '「' + Y + '」 동물은 귀가 길어요.' + (conf ? ' 「' + N + '」 동물은 목이 길고 귀는 짧아요.' : ' 「' + N + '」 동물은 귀가 짧아요.'); } };
    } },
    // l02 특징에 따라 나누어요 — 날개가 있는가 · 다리가 있는가 (누가 봐도 같은 기준)
    { l: 'l02', type: 'has_part', make: function (rng) {
      return { ask: '날개가 있는 동물은 어느 쪽일까요?', scene: 'ground', yes: rng() < 0.5 ? bird(rng) : insect(rng), no: rng() < 0.7 ? beast(rng, {}) : worm(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 날개가 있어요. 「' + N + '」 동물은 날개가 없어요 — 날개가 있는가는 누가 봐도 같은 기준이에요.'; } };
    } },
    { l: 'l02', type: 'has_part', make: function (rng) {
      return { ask: '날개가 없는 동물은 어느 쪽일까요?', scene: 'ground', yes: beast(rng, {}), no: rng() < 0.5 ? bird(rng) : insect(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 날개가 없어요. 「' + N + '」 동물은 날개가 있어요.'; } };
    } },
    { l: 'l02', type: 'has_part', make: function (rng) {
      return { ask: '다리가 있는 동물은 어느 쪽일까요?', scene: 'ground', yes: walker(rng), no: worm(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 다리가 있어요. 「' + N + '」 동물은 다리가 없어요.'; } };
    } },
    { l: 'l02', type: 'cannot_see', make: function (rng) {
      var ask = rng() < 0.5 ? '더 귀여운 동물은 어느 쪽일까요?' : '더 예쁜 동물은 어느 쪽일까요?';
      return { ask: ask, q: true, scene: 'ground', cards: [walker(rng), walker(rng)],
        ex: function () { return '귀여운지, 예쁜지는 사람마다 달라요. 그림을 아무리 자세히 봐도 정할 수 없어요 — 그래서 분류 기준이 될 수 없어요.'; } };
    } },
    // l03 땅에 사는 동물 — 다리가 있으면 걷거나 뛰고, 없으면 기어다녀요
    { l: 'l03', type: 'move_legs', make: function (rng) {
      return { ask: '기어다니는 동물은 어느 쪽일까요?', scene: 'ground', yes: worm(rng), no: rng() < 0.6 ? beast(rng, {}) : insect(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 다리가 없어 몸을 구부렸다 폈다 하며 기어다녀요. 「' + N + '」 동물은 다리로 걷거나 뛰어요.'; } };
    } },
    { l: 'l03', type: 'move_legs', make: function (rng) {
      return { ask: '다리로 걷거나 뛰는 동물은 어느 쪽일까요?', scene: 'ground', yes: rng() < 0.6 ? beast(rng, {}) : insect(rng), no: worm(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 다리가 있어 걷거나 뛰어요. 「' + N + '」 동물은 다리가 없어 기어다녀요 — 다리가 없어도 잘 움직여요.'; } };
    } },
    { l: 'l03', type: 'cannot_see', make: function (rng) {
      return { ask: '다리가 있는 동물은 어느 쪽일까요?', q: true, scene: 'ground',
        cards: [{ k: 'burrow', x: Math.round(between(rng, 86, 114)), hue: pick(rng, FUR.concat(WORM)) }, { k: 'burrow', x: Math.round(between(rng, 86, 114)), hue: pick(rng, FUR.concat(WORM)) }],
        ex: function () { return '두 동물 모두 땅속 굴에 몸이 들어가 머리만 보여요. 다리가 있는지는 그림으로는 알 수 없어요 — 보이지 않는 것은 짐작하지 말아요.'; } };
    } },
    // l04 날 수 있는 동물 — 새냐 곤충이냐(다리를 세어 봐요)
    { l: 'l04', type: 'bird_insect', make: function (rng) {
      return { ask: '곤충은 어느 쪽일까요?', scene: 'sky', yes: insect(rng, true), no: bird(rng, true),
        ex: function (Y, N) { return '둘 다 날개가 있어요. 다리를 세어 보면 「' + Y + '」는 6개 — 곤충이에요. 「' + N + '」는 2개 — 새예요.'; } };
    } },
    { l: 'l04', type: 'bird_insect', make: function (rng) {
      return { ask: '새는 어느 쪽일까요?', scene: 'sky', yes: bird(rng, true), no: insect(rng, true),
        ex: function (Y, N) { return '날면 다 새는 아니에요. 「' + Y + '」는 깃털 날개와 다리 2개 — 새예요. 「' + N + '」는 얇은 날개와 다리 6개 — 곤충이에요.'; } };
    } },
    { l: 'l04', type: 'leg_count', make: function (rng) {
      return { ask: '다리가 6개인 동물은 어느 쪽일까요?', scene: 'ground', yes: insect(rng, false), no: rng() < 0.6 ? beast(rng, {}) : bird(rng, false),
        ex: function (Y, N) { return '하나씩 세어 봐요. 「' + Y + '」 동물은 다리가 6개예요 — 곤충이에요.'; } };
    } },
    { l: 'l04', type: 'leg_count', make: function (rng) {
      return { ask: '다리가 2개인 동물은 어느 쪽일까요?', scene: 'ground', yes: bird(rng, false), no: rng() < 0.5 ? beast(rng, {}) : insect(rng, false),
        ex: function (Y, N) { return '하나씩 세어 봐요. 「' + Y + '」 동물은 다리가 2개예요 — 새예요.'; } };
    } },
    { l: 'l04', type: 'cannot_see', make: function (rng) {
      return { ask: '곤충은 어느 쪽일까요?', q: true, scene: 'sky',
        cards: [{ k: 'cloud', side: rng() < 0.5, y: Math.round(between(rng, 96, 122)) }, { k: 'cloud', side: rng() < 0.5, y: Math.round(between(rng, 96, 122)) }],
        ex: function () { return '두 동물 모두 구름 뒤에 숨어 몸이 보이지 않아요. 다리를 셀 수 없으니 곤충인지 새인지 그림으로는 알 수 없어요.'; } };
    } },
    // l05 물에 사는 동물 — 물에 살아도 다 물고기는 아니에요(지느러미가 있는가)
    { l: 'l05', type: 'fin_fish', make: function (rng) {
      return { ask: '물고기는 어느 쪽일까요?', scene: 'water', yes: fish(rng), no: legged(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 지느러미로 헤엄치고 아가미로 숨 쉬어요 — 물고기예요. 「' + N + '」 동물은 물에 살지만 지느러미가 없어요.'; } };
    } },
    { l: 'l05', type: 'fin_fish', make: function (rng) {
      return { ask: '지느러미가 있는 동물은 어느 쪽일까요?', scene: 'water', yes: fish(rng), no: legged(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 몸에 지느러미가 붙어 있어요. 「' + N + '」 동물은 지느러미가 없고 다리로 움직여요.'; } };
    } },
    { l: 'l05', type: 'fin_fish', make: function (rng) {
      return { ask: '다리로 움직이는 물속 동물은 어느 쪽일까요?', scene: 'water', yes: legged(rng), no: fish(rng),
        ex: function (Y, N) { return '「' + Y + '」 동물은 지느러미가 없고 다리로 움직여요 — 물에 살아도 물고기가 아니에요. 「' + N + '」 동물은 지느러미로 헤엄쳐요.'; } };
    } },
    { l: 'l05', type: 'cannot_see', make: function (rng) {
      return { ask: '물고기는 어느 쪽일까요?', q: true, scene: 'water',
        cards: [{ k: 'rock', x: Math.round(between(rng, 84, 116)) }, { k: 'rock', x: Math.round(between(rng, 84, 116)) }],
        ex: function () { return '두 동물 모두 바위 뒤에 숨어 눈만 보여요. 지느러미가 있는지 볼 수 없으니 그림으로는 알 수 없어요.'; } };
    } },
    // l06 특별한 곳에 사는 동물 — 사는 곳에 알맞은 생김새(두꺼운 털 · 혹)
    { l: 'l06', type: 'fit_place', make: function (rng) {
      var conf = rng() < 0.5;                             // 헷갈림 짝: 혹이 있는 동물
      return { ask: '추운 곳에서 추위를 견디기 알맞은 생김새는 어느 쪽일까요?', scene: 'ground', yes: beast(rng, { fur: true }), no: beast(rng, { fur: false, hump: conf }),
        ex: function (Y, N) { return '「' + Y + '」 동물은 털이 두꺼워요 — 두꺼운 털이 옷처럼 추위를 막아 줘요.' + (conf ? ' 「' + N + '」 동물의 혹은 추위가 아니라 먹이가 적은 곳에서 오래 견디게 도와요.' : ''); } };
    } },
    { l: 'l06', type: 'fit_place', make: function (rng) {
      return { ask: '등에 혹이 있는 동물은 어느 쪽일까요?', scene: 'ground', yes: beast(rng, { hump: true, ears: 'short' }), no: beast(rng, { fur: rng() < 0.5 }),
        ex: function (Y, N) { return '「' + Y + '」 동물은 등에 혹이 있어요. 혹은 먹이가 적은 곳에서 오래 견디게 도와요.'; } };
    } },
    { l: 'l06', type: 'cannot_see', make: function (rng) {
      var f = rng() < 0.5;
      return { ask: '지방이 더 두꺼운 동물은 어느 쪽일까요?', q: true, scene: 'ground', cards: [beast(rng, { fur: f }), beast(rng, { fur: !f })],
        ex: function () { return '지방은 몸 안에 있어 그림에 보이지 않아요. 털이 두껍다고 지방까지 두껍다고 짐작하면 안 돼요 — 보이는 것만 말해요.'; } };
    } }
  ];

  function build(t, k, rng) {
    var m = t.make(rng), cards, answer;
    if (m.q) { cards = m.cards; answer = 'q'; }
    else if (rng() < 0.5) { cards = [m.yes, m.no]; answer = 'a'; }
    else { cards = [m.no, m.yes]; answer = 'b'; }
    var Y = answer === 'b' ? '나' : '가', N = answer === 'b' ? '가' : '나';
    return { id: 'oa' + k, l: t.l, type: t.type, ask: m.ask, cards: cards.map(function (c) { return { svg: draw(look(rng, c, m.scene)) }; }),
             answer: answer, explain: m.ex(Y, N), prompt: m.ask };
  }

  return {
    id: 'observe_animal',
    title: '관찰 고르기 — 동물의 생활',
    T: T,
    ORDER: ORDER,
    draw: draw,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t.l) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k].l === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 틀이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k + '_' + (n++), rng);
        },
        check: function (pick, q) { return pick === q.answer; }
      };
    },
    printRender: function (q) {
      var sm = function (s) { return s.replace('<svg ', '<svg width="88" height="88" '); };
      return q.ask + '<br><span style="display:inline-flex;gap:14px;align-items:center">가 ' + sm(q.cards[0].svg) + ' 나 ' + sm(q.cards[1].svg) + '</span><br>( 가 · 나 · 그림으로는 알 수 없어요 )';
    },
    printAnswer: function (q) { return ({ a: '가', b: '나', q: '그림으로는 알 수 없어요' })[q.answer]; },
    printHead: '두 그림을 자세히 보고 알맞은 쪽에 ○ 하세요. 그림만 봐서는 정할 수 없으면 「알 수 없어요」에 ○ 하세요.'
  };
}));
