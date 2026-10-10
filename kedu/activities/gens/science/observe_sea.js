/* gens/science/observe_sea.js — 「지구와 바다」 관찰 고르기 (3학년 2학기 과학 2단원 · l03~l06)
 * 순수 함수·DOM 무관 (§9-3). 장르 observe_pick(관찰 고르기)이 쓴다. 그림은 SVG 글자열로 돌려준다.
 *
 * 관찰 vs 추측(설계 v4 §4 observe_pick 의 byType 축):
 *   그림 두 장(가·나)을 보고 조건에 맞는 쪽을 고른다. 답은 셋 — 가 · 나 · 🤔 그림으로는 알 수 없어요.
 *   「알 수 없어요」는 cannot_see 에만 정답이다 —
 *     l03 공책에 가려 붙임쪽지를 다 셀 수 없는 지구본 · l04 가열하기 전 맑은 물 두 접시(정본 오개념 「맛을 보면 된다」 —
 *     겉으로는 같고 가열해 남는 물질로 구별) · l05 더 아름다운 지형(사람마다 달라요 — 정본 「친구 생각 존중」)
 *     · l06 높이가 같은 두 바닷가에서 「지금 밀려 들어오고 있는 쪽」(정본 오개념 「파도 = 밀물」 — 그림 한 장으로는
 *     들어오는 중인지 빠져나가는 중인지 모른다, 높이는 시간에 따라 달라진다).
 * 이름표 0 — 카드에 글자를 적지 않는다(지형 이름을 보고 아는 게 아니라 생김새를 보고 고른다). 그림 속성은 SVG 에 남기지 않는다.
 * 그림은 매번 rng 로 새로 그린다(색 · 높낮이 · 붙임쪽지 자리 · 파도 크기) — 외워서는 못 푼다.
 * 한 문항의 두 카드는 같은 틀 위에 선다(바닷가 단면은 땅 모양·표지판 자리가 같고 물 높이만 다르다).
 * 파도 크기는 물 높이와 따로 뽑는다 — 「파도가 크면 밀물」로는 못 푼다(정본 l06 오개념).
 * 낱말은 정본 data/g3s2_science_u2.js 에서만: 육지·바다·땅·물로 덮여·산·들·사막·강·호수·육지의 물·지구본·붙임쪽지·개수·공책(l03)
 *   · 증발 접시·가열·끓임쪽·물이 없어질·남는 물질·하얀·소금·겉으로·맛보지(l04) · 지형·절벽·동굴·모래사장·갯벌·바위·구멍·가파른·진흙·모래·흙·존중(l05)
 *   · 밀물·썰물·표지판·밀려 들어·빠져나가·높이·잠겨·드러나·파도·잠깐·시간에 따라(l06).
 *   범위 밖 낱말은 그 차시 문항에 나오지 않는다(스모크가 잰다). 차단 어휘(결) 0.
 *
 * params: { upto: 'l03'|'l04'|'l05'|'l06'|'all' } — 단원 처음부터 그 차시까지 누적, 이번 차시 문항 먼저.
 * next() → { id, l, type, ask, cards:[{svg},{svg}], answer:'a'|'b'|'q', explain, prompt }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['observe_sea'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l04', 'l05', 'l06'];
  var INK = '#3a2f28';
  var SKY = ['#e3f2ff', '#eaf6ff', '#e6f0fb'];
  var SEA = ['#5aa9d6', '#4f9fd0', '#62b0dc'];
  var GREEN = ['#7fbf5a', '#8cc66a', '#74b35a'];

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
  function rect(x, y, w, h, fill, extra) { return '<rect x="' + r2(x) + '" y="' + r2(y) + '" width="' + r2(w) + '" height="' + r2(h) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function path(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function wave(y, amp, col, w) {                     // 물결 한 줄 — amp 가 클수록 큰 파도
    var d = 'M0 ' + r2(y), step = 25;
    for (var x = 0; x < 200; x += step) d += ' q' + (step / 2) + ' ' + r2(-amp) + ' ' + step + ' 0';
    return '<path d="' + d + '" stroke="' + (col || '#2f78a8') + '" stroke-width="' + (w || 2.4) + '" fill="none" stroke-linecap="round"/>';
  }

  // ── l03 지구 표면의 모습 ────────────────────────────────────────────
  function drawLand(sp) {                              // 땅으로 이루어진 곳 — 산 · 들 · 사막 (물 0)
    var s = rect(0, 0, 200, 200, sp.sky);
    if (sp.form === 'mountain') {
      s += path('M-10 170 L' + r2(60 + sp.j) + ' ' + r2(58 + sp.j) + ' L130 170 Z', '#8a9a6a', ' stroke="' + INK + '" stroke-width="2.2"');
      s += path('M70 170 L' + r2(140 - sp.j) + ' ' + r2(76 - sp.j / 2) + ' L215 170 Z', '#a0a878', ' stroke="' + INK + '" stroke-width="2.2"');
      s += path('M' + r2(60 + sp.j - 14) + ' ' + r2(58 + sp.j + 22) + ' L' + r2(60 + sp.j) + ' ' + r2(58 + sp.j) + ' L' + r2(60 + sp.j + 14) + ' ' + r2(58 + sp.j + 22) + ' Z', '#fff');
      s += rect(0, 168, 200, 32, sp.green) + '<path d="M0 168 H200" stroke="#5f9a42" stroke-width="2.4"/>';
    } else if (sp.form === 'desert') {
      s += rect(0, 0, 200, 200, '#fff3d6');
      s += '<circle cx="' + r2(40 + sp.j) + '" cy="42" r="16" fill="#f6c84b"/>';
      s += path('M0 140 Q50 ' + r2(110 + sp.j / 2) + ' 100 140 T200 ' + r2(132 - sp.j / 3) + ' V200 H0 Z', '#e8c47a', ' stroke="' + INK + '" stroke-width="2"');
      s += path('M0 170 Q60 150 120 172 T200 166 V200 H0 Z', '#ddb466', ' stroke="' + INK + '" stroke-width="2"');
      var cx = r2(140 - sp.j);
      s += rect(cx - 6, 118, 12, 40, '#5f9a42', ' rx="6" stroke="' + INK + '" stroke-width="2"') + rect(cx - 20, 128, 10, 16, '#5f9a42', ' rx="5" stroke="' + INK + '" stroke-width="2"') + rect(cx + 10, 124, 10, 18, '#5f9a42', ' rx="5" stroke="' + INK + '" stroke-width="2"');
    } else {                                           // 들
      s += rect(0, 104, 200, 96, sp.green) + '<path d="M0 104 H200" stroke="#5f9a42" stroke-width="2.4"/>';
      for (var k = 0; k < 9; k++) {
        var x = 14 + k * 21 + (k % 2 ? sp.j / 3 : -sp.j / 3), y = 130 + (k % 3) * 20;
        s += '<path d="M' + r2(x) + ' ' + y + ' l-4 -10 M' + r2(x) + ' ' + y + ' l0 -12 M' + r2(x) + ' ' + y + ' l4 -10" stroke="#3f7a2a" stroke-width="2" stroke-linecap="round"/>';
      }
      s += '<circle cx="' + r2(150 + sp.j) + '" cy="44" r="15" fill="#f6c84b"/>';
    }
    return s;
  }
  function drawSea(sp) {                               // 물로 덮여 있는 곳 — 끝까지 물(땅 0)
    var s = rect(0, 0, 200, 200, sp.sky) + rect(0, 74, 200, 126, sp.sea);
    for (var k = 0; k < 5; k++) s += wave(92 + k * 24, 4 + (k % 2) * 2, '#e9f6ff', 2.2);
    s += '<circle cx="' + r2(40 + sp.j) + '" cy="38" r="14" fill="#f6c84b"/>';
    return s;
  }
  function drawLakeLand(sp) {                          // 땅 사이의 강·호수 — 육지의 물
    var s = rect(0, 0, 200, 200, sp.sky) + rect(0, 60, 200, 140, sp.green) + '<path d="M0 60 H200" stroke="#5f9a42" stroke-width="2.4"/>';
    if (sp.river) s += path('M' + r2(60 + sp.j) + ' 60 C 40 100, 150 120, ' + r2(110 - sp.j) + ' 200 L ' + r2(140 - sp.j) + ' 200 C 180 120, 70 100, ' + r2(80 + sp.j) + ' 60 Z', sp.sea, ' stroke="' + INK + '" stroke-width="2"');
    else s += '<ellipse cx="' + r2(100 + sp.j) + '" cy="130" rx="56" ry="30" fill="' + sp.sea + '" stroke="' + INK + '" stroke-width="2.2"/>' + '<path d="M' + r2(76 + sp.j) + ' 128 q8 -4 16 0 t16 0 M' + r2(96 + sp.j) + ' 140 q8 -4 16 0 t16 0" stroke="#e9f6ff" stroke-width="2" fill="none"/>';
    s += path('M' + r2(20 - sp.j / 2) + ' 60 L44 26 L68 60 Z', '#8a9a6a', ' stroke="' + INK + '" stroke-width="2"') + path('M150 60 L174 32 L198 60 Z', '#a0a878', ' stroke="' + INK + '" stroke-width="2"');
    return s;
  }
  // 지구본 + 붙임쪽지 12장(초록 = 육지 · 파랑 = 바다) · cover = 공책으로 가림
  function drawGlobe(sp) {
    var s = rect(0, 0, 200, 200, '#fbf7ee');
    s += rect(96, 168, 8, 14, '#9a7b62', ' stroke="' + INK + '" stroke-width="1.6"') + '<ellipse cx="100" cy="186" rx="34" ry="8" fill="#b7895c" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M28 96 A72 72 0 0 0 100 168" stroke="#9a7b62" stroke-width="4" fill="none"/>';
    s += '<circle cx="100" cy="94" r="72" fill="#dfeef8" stroke="' + INK + '" stroke-width="2.6"/>';
    var cells = [];
    [[60, 1], [36, 3], [12, 3], [-20, 3], [-44, 2]].forEach(function (row) {   // 둥근 판 안에 4줄 x 3장 꼴로 12장
      var y = 94 - row[0];
      for (var c = 0; c < row[1]; c++) cells.push([100 + (c - (row[1] - 1) / 2) * 36, y]);
    });
    cells = cells.slice(0, 12);
    cells.forEach(function (p, k) {
      var col = sp.notes[k] ? '#4a90d9' : '#5fae4a';
      s += '<rect x="' + r2(p[0] - 14 + sp.jx[k]) + '" y="' + r2(p[1] - 12) + '" width="28" height="24" rx="3" fill="' + col + '" stroke="' + INK + '" stroke-width="1.6" transform="rotate(' + r2(sp.rot[k]) + ' ' + r2(p[0]) + ' ' + r2(p[1]) + ')"/>';
    });
    if (sp.cover) {                                     // 공책 — 아래쪽 절반을 가린다
      s += '<g transform="rotate(' + r2(sp.cv) + ' 100 130)">' + rect(18, 96, 164, 84, '#f4d58a', ' rx="6" stroke="' + INK + '" stroke-width="2.4"');
      for (var k2 = 0; k2 < 5; k2++) s += '<path d="M30 ' + (112 + k2 * 14) + ' H170" stroke="#c9a65a" stroke-width="1.6"/>';
      s += rect(18, 96, 14, 84, '#e0a84a', ' stroke="' + INK + '" stroke-width="2"') + '</g>';
    }
    return s;
  }

  // ── l04 증발 접시 ────────────────────────────────────────────────
  function drawDish(sp) {                              // state: water(가열 전 맑은 물) · boil(가열 중, 물 남음) · empty · salt
    var s = rect(0, 0, 200, 200, '#f7f4ee') + rect(0, 150, 200, 50, '#e6dccb');
    s += rect(32, 130, 136, 26, '#8d949c', ' rx="6" stroke="' + INK + '" stroke-width="2.2"') + rect(44, 125, 112, 8, '#5b6268', ' rx="3"');
    s += '<circle cx="152" cy="143" r="5" fill="' + (sp.state === 'boil' ? '#e3583a' : '#cfd5da') + '" stroke="' + INK + '" stroke-width="1.4"/>';
    s += path('M40 92 Q100 150 160 92 Z', '#c9d2da', ' stroke="' + INK + '" stroke-width="2.6"');
    s += '<ellipse cx="100" cy="92" rx="60" ry="9" fill="#b9c4ce" stroke="' + INK + '" stroke-width="2.2"/>';
    if (sp.state === 'water' || sp.state === 'boil') {
      s += '<ellipse cx="100" cy="98" rx="50" ry="7" fill="#cfe8f6" stroke="#7fb4d6" stroke-width="1.6"/>';
      if (sp.state === 'boil') for (var b = 0; b < 4; b++) s += '<circle cx="' + r2(74 + b * 17 + sp.j) + '" cy="' + r2(98 - (b % 2) * 2) + '" r="2.6" fill="#fff" stroke="#7fb4d6" stroke-width="1"/>' +
        '<path d="M' + r2(78 + b * 16) + ' 80 q-5 -8 0 -16 q5 -8 0 -16" stroke="#b7c3cc" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    }
    s += '<circle cx="' + r2(88 + sp.j) + '" cy="104" r="3.4" fill="#9aa3ab"/><circle cx="' + r2(110 - sp.j) + '" cy="106" r="3" fill="#9aa3ab"/>';   // 끓임쪽
    if (sp.state === 'salt') {
      var g = '';
      for (var k = 0; k < 26; k++) {
        var a = sp.grain[k], x = 64 + a[0] * 72, y = 96 + a[1] * 14 + Math.abs(x - 100) * -0.03;
        g += '<rect x="' + r2(x) + '" y="' + r2(y) + '" width="' + r2(4 + a[2] * 3.4) + '" height="' + r2(3.6 + a[2] * 2.6) + '" fill="#ffffff" stroke="#8a96a0" stroke-width=".9" transform="rotate(' + r2(a[2] * 60) + ' ' + r2(x) + ' ' + r2(y) + ')"/>';
      }
      s += g;
    }
    return s;
  }

  // ── l05 바닷가 지형 ──────────────────────────────────────────────
  function drawCoast(sp) {                             // form: cliff · cave · beach · mudflat
    var s = rect(0, 0, 200, 200, sp.sky), f = sp.form;
    if (f === 'cliff') {
      s += rect(0, 140, 200, 60, sp.sea) + wave(146, 3, '#e9f6ff', 2) + wave(170, 3, '#e9f6ff', 2);
      var x0 = sp.flip ? 200 : 0, dir = sp.flip ? -1 : 1;
      s += path('M' + x0 + ' 30 L' + r2(x0 + dir * (96 + sp.j)) + ' 32 L' + r2(x0 + dir * (102 + sp.j)) + ' 96 L' + r2(x0 + dir * (98 + sp.j)) + ' 168 L' + x0 + ' 168 Z', '#9a9690', ' stroke="' + INK + '" stroke-width="2.4"');
      s += '<path d="M' + r2(x0 + dir * (60 + sp.j)) + ' 34 l' + (dir * 6) + ' 40 l' + (dir * -4) + ' 30 M' + r2(x0 + dir * (30)) + ' 40 l' + (dir * 4) + ' 50" stroke="#6f6a64" stroke-width="2" fill="none"/>';
      s += rect(sp.flip ? r2(200 - 96 - sp.j) : 0, 22, r2(96 + sp.j), 12, '#7fbf5a', ' stroke="' + INK + '" stroke-width="2"');
    } else if (f === 'cave') {
      s += rect(0, 150, 200, 50, sp.sea) + wave(158, 3, '#e9f6ff', 2) + wave(180, 3, '#e9f6ff', 2);
      s += path('M10 156 Q8 60 70 48 Q130 34 186 66 Q196 110 192 156 Z', '#9a9690', ' stroke="' + INK + '" stroke-width="2.4"');
      var cx = r2(98 + sp.j);
      s += path('M' + r2(cx - 30) + ' 156 Q' + r2(cx - 30) + ' 96 ' + cx + ' 94 Q' + r2(cx + 30) + ' 96 ' + r2(cx + 30) + ' 156 Z', '#2e2a28', ' stroke="' + INK + '" stroke-width="2.4"');
      s += '<path d="M40 80 l8 20 M150 76 l-6 24" stroke="#6f6a64" stroke-width="2"/>';
    } else if (f === 'beach') {
      s += rect(0, 64, 200, 46, sp.sea) + wave(80, 3, '#e9f6ff', 2);
      s += path('M0 104 Q50 ' + r2(96 + sp.j / 3) + ' 100 106 T200 102 V200 H0 Z', '#f1d68e', ' stroke="' + INK + '" stroke-width="2"');
      s += '<path d="M0 108 Q50 100 100 110 T200 106" stroke="#fff" stroke-width="3" fill="none"/>';
      for (var k = 0; k < 18; k++) s += '<circle cx="' + r2(10 + (k * 37) % 186) + '" cy="' + r2(126 + (k * 23) % 66) + '" r="1.6" fill="#c9a65a"/>';
    } else {                                           // 갯벌 — 진흙 · 어두운 색 · 물웅덩이 · 작은 구멍
      s += rect(0, 64, 200, 22, sp.sea) + wave(72, 2, '#e9f6ff', 1.8);
      s += path('M0 84 Q60 ' + r2(78 + sp.j / 3) + ' 120 86 T200 82 V200 H0 Z', '#6e5a48', ' stroke="' + INK + '" stroke-width="2"');
      [[40, 120, 22], [128, 142, 28], [74, 172, 18]].forEach(function (p, i) {
        s += '<ellipse cx="' + r2(p[0] + (i % 2 ? sp.j : -sp.j)) + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="6" fill="#8fb8cf" stroke="#4e4033" stroke-width="1.4"/>';
      });
      for (var h = 0; h < 10; h++) s += '<circle cx="' + r2(16 + (h * 41) % 176) + '" cy="' + r2(104 + (h * 29) % 88) + '" r="2.4" fill="#2e241c"/>';
    }
    return s;
  }

  // ── l06 바닷가 단면 — 왼쪽 육지가 오른쪽 바다로 비탈져 내려가고, 비탈에 표지판 ──
  var SLOPE = 84 / 130;
  function groundY(x) { return x < 40 ? 92 : (x > 170 ? 176 : 92 + (x - 40) * SLOPE); }
  function waveFrom(x0, y, amp, col, w) {
    var d = 'M' + r2(x0) + ' ' + r2(y), step = 20;
    for (var x = x0; x < 200; x += step) d += ' q' + (step / 2) + ' ' + r2(-amp) + ' ' + step + ' 0';
    return '<path d="' + d + '" stroke="' + col + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
  }
  function tideLevel(level, sx) {
    var gy = groundY(sx);
    return level === 'high' ? gy - 52 : (level === 'low' ? groundY(150) + 2 : gy - 22);
  }
  function drawTide(sp) {                              // level: 'high' | 'low' | 'mid' · surf: 0(잔잔)~2(큰 파도)
    var s = rect(0, 0, 200, 200, sp.sky);
    var sx = sp.sx, gy = groundY(sx);
    s += '<circle cx="' + r2(160 + sp.j) + '" cy="34" r="13" fill="#f6c84b"/>';
    // 땅(비탈) — 위는 모래빛, 아래로 갈수록 어두운 흙
    s += path('M0 92 L40 92 L170 176 L200 176 V200 H0 Z', '#a4845e', ' stroke="' + INK + '" stroke-width="2.2"');
    s += rect(0, 80, 40, 12, sp.green, ' stroke="' + INK + '" stroke-width="2"');
    // 표지판(물보다 먼저 — 잠기면 물 빛 아래로 비친다)
    s += rect(sx - 3, gy - 30, 6, 30, '#8a6a4a', ' stroke="' + INK + '" stroke-width="1.6"');
    s += rect(sx - 18, gy - 46, 36, 18, '#f2c94c', ' rx="3" stroke="' + INK + '" stroke-width="2"') + '<path d="M' + (sx - 10) + ' ' + r2(gy - 37) + ' h20" stroke="' + INK + '" stroke-width="2.4"/>';
    // 물 — 비탈과 수면 사이(땅 위로는 안 올라온다)
    var lv = tideLevel(sp.level, sx), x0 = 40 + (lv - 92) / SLOPE;
    s += path('M' + r2(x0) + ' ' + r2(lv) + ' L200 ' + r2(lv) + ' L200 176 L170 176 Z', sp.sea, ' opacity=".84"');
    // 파도 — 물 높이와 따로 뽑는다
    if (sp.surf > 0) {
      var amp = sp.surf === 2 ? 10 : 4;
      s += waveFrom(x0, lv, amp, '#ffffff', sp.surf === 2 ? 4 : 2.6);
      if (sp.surf === 2) for (var x = x0 + 10; x < 196; x += 20) s += '<circle cx="' + r2(x) + '" cy="' + r2(lv - amp + 1) + '" r="3" fill="#fff"/>';
    } else s += '<path d="M' + r2(x0) + ' ' + r2(lv) + ' H200" stroke="#2f78a8" stroke-width="2.2"/>';
    return s;
  }

  function draw(c) {
    if (c.k === 'land') return svg(drawLand(c));
    if (c.k === 'sea') return svg(drawSea(c));
    if (c.k === 'lake') return svg(drawLakeLand(c));
    if (c.k === 'globe') return svg(drawGlobe(c));
    if (c.k === 'dish') return svg(drawDish(c));
    if (c.k === 'coast') return svg(drawCoast(c));
    if (c.k === 'tide') return svg(drawTide(c));
    return svg('');
  }

  // 공통 꾸밈 — 색·흔들림은 rng
  function look(rng, c) {
    var o = {}; for (var k in c) o[k] = c[k];
    o.sky = pick(rng, SKY); o.sea = pick(rng, SEA); o.green = pick(rng, GREEN);
    o.j = Math.round(between(rng, -10, 10));
    if (c.k === 'globe') {
      o.jx = []; o.rot = [];
      for (var i = 0; i < 12; i++) { o.jx.push(between(rng, -2, 2)); o.rot.push(between(rng, -8, 8)); }
      o.cv = between(rng, -3, 3);
    }
    if (c.k === 'dish' && c.state === 'salt') { o.grain = []; for (var g = 0; g < 26; g++) o.grain.push([rng(), rng(), rng()]); }
    return o;
  }
  // 붙임쪽지 12장 — 파랑 n 장을 무작위 자리에
  function notes(rng, blue) {
    var a = []; for (var i = 0; i < 12; i++) a.push(i < blue);
    return shuffle(rng, a);
  }
  // 공책이 가리는 아래 두 줄(7~11번 자리)과 보이는 위 세 줄(0~6번)을 따로 섞는다 — 보이는 파랑 개수는 두 카드 같다
  function notesHidden(rng, topBlue, bottomBlue) {
    var top = [], bot = [];
    for (var i = 0; i < 7; i++) top.push(i < topBlue);
    for (var j = 0; j < 5; j++) bot.push(j < bottomBlue);
    return shuffle(rng, top).concat(shuffle(rng, bot));
  }

  var LAND_FORMS = ['mountain', 'field', 'desert'];
  var ROCK = ['cliff', 'cave'], SOFT = ['beach', 'mudflat'];

  // 틀 — l = 정본 차시, type = byType 축, make(rng) → { ask, yes, no } 또는 { ask, q:true, cards:[c,c] } + ex(Y,N)
  var T = [
    // l03 육지와 바다 — 땅으로 이루어진 곳 · 물로 덮여 있는 곳 · 바다가 더 넓다
    { l: 'l03', type: 'land_sea', make: function (rng) {
      return { ask: '땅으로 이루어진 곳(육지)은 어느 쪽일까요?', yes: { k: 'land', form: pick(rng, LAND_FORMS) }, no: { k: 'sea' },
        ex: function (Y, N) { return '「' + Y + '」는 땅으로 이루어진 곳이에요 — 육지예요. 「' + N + '」는 끝까지 물로 덮여 있어요 — 바다예요.'; } };
    } },
    { l: 'l03', type: 'land_sea', make: function (rng) {
      return { ask: '물로 덮여 있는 곳(바다)은 어느 쪽일까요?', yes: { k: 'sea' }, no: { k: 'land', form: pick(rng, LAND_FORMS) },
        ex: function (Y, N) { return '「' + Y + '」는 물로 덮여 있는 곳 — 바다예요. 「' + N + '」에는 산, 들, 사막처럼 땅이 보여요 — 육지예요.'; } };
    } },
    { l: 'l03', type: 'land_water', make: function (rng) {
      return { ask: '육지의 물을 찾을 수 있는 곳은 어느 쪽일까요?', yes: { k: 'lake', river: rng() < 0.5 }, no: { k: 'sea' },
        ex: function (Y, N) { return '「' + Y + '」는 땅 사이에 강이나 호수가 있어요 — 육지의 물이에요. 「' + N + '」는 끝까지 물로 덮여 있어요 — 바다예요.'; } };
    } },
    { l: 'l03', type: 'wider_sea', make: function (rng) {
      var more = 7 + Math.floor(rng() * 2);             // 파랑 7~8 : 4~5
      return { ask: '파랑 붙임쪽지가 바다예요. 바다가 육지보다 넓은 지구본은 어느 쪽일까요?',
        yes: { k: 'globe', notes: notes(rng, more) }, no: { k: 'globe', notes: notes(rng, 12 - more) },
        ex: function (Y, N) { return '붙임쪽지 개수를 세어 견주어요. 「' + Y + '」는 파랑이 ' + more + '개, 초록이 ' + (12 - more) + '개 — 바다가 더 넓어요. 「' + N + '」는 초록이 더 많아요.'; } };
    } },
    { l: 'l03', type: 'cannot_see', make: function (rng) {
      var tb = 3 + Math.floor(rng() * 2);               // 보이는 위 7장 중 파랑 3~4 — 두 카드 같게
      return { ask: '파랑 붙임쪽지가 바다예요. 바다가 육지보다 넓은 지구본은 어느 쪽일까요?', q: true,
        cards: [{ k: 'globe', cover: true, notes: notesHidden(rng, tb, 1 + Math.floor(rng() * 4)) }, { k: 'globe', cover: true, notes: notesHidden(rng, tb, 1 + Math.floor(rng() * 4)) }],
        ex: function () { return '두 지구본 모두 공책이 아래쪽을 덮고 있어요. 붙임쪽지 개수를 다 셀 수 없으니 그림으로는 알 수 없어요 — 보이는 것만 보고 짐작하지 않아요.'; } };
    } },
    // l04 바닷물의 특징 — 물이 없어질 때까지 가열하면 바닷물만 남는 물질이 있다
    { l: 'l04', type: 'heat_done', make: function (rng) {
      return { ask: '물이 없어질 때까지 가열한 증발 접시는 어느 쪽일까요?', yes: { k: 'dish', state: rng() < 0.5 ? 'empty' : 'salt' }, no: { k: 'dish', state: 'boil' },
        ex: function (Y, N) { return '「' + Y + '」 접시에는 물이 보이지 않아요 — 물이 없어질 때까지 가열했어요. 「' + N + '」 접시에는 아직 물이 끓고 있어요.'; } };
    } },
    { l: 'l04', type: 'heat_left', make: function (rng) {
      return { ask: '바닷물을 가열한 증발 접시는 어느 쪽일까요?', yes: { k: 'dish', state: 'salt' }, no: { k: 'dish', state: 'empty' },
        ex: function (Y, N) { return '물이 없어질 때까지 가열했더니 「' + Y + '」 접시에만 하얀 물질이 남았어요 — 바닷물이에요. 남는 물질의 대부분은 소금이에요.'; } };
    } },
    { l: 'l04', type: 'heat_left', make: function (rng) {
      return { ask: '육지의 물을 가열한 증발 접시는 어느 쪽일까요?', yes: { k: 'dish', state: 'empty' }, no: { k: 'dish', state: 'salt' },
        ex: function (Y, N) { return '「' + Y + '」 접시에는 남는 물질이 없어요 — 육지의 물이에요. 「' + N + '」 접시에 남은 하얀 물질은 바닷물에 녹아 있던 소금이에요.'; } };
    } },
    { l: 'l04', type: 'cannot_see', make: function (rng) {
      return { ask: '바닷물이 담긴 증발 접시는 어느 쪽일까요?', q: true, cards: [{ k: 'dish', state: 'water' }, { k: 'dish', state: 'water' }],
        ex: function () { return '가열하기 전이라 두 접시 모두 물이 담겨 있어 겉으로는 같아 보여요. 실험 재료는 맛보지 않아요 — 물이 없어질 때까지 가열해서 남는 물질로 구별해요.'; } };
    } },
    // l05 바닷가 지형 — 생김새로 알아보기 · 바위로 이루어졌나, 모래나 흙인가
    { l: 'l05', type: 'coast_look', make: function (rng) {
      return { ask: '모래가 펼쳐진 지형(모래사장)은 어느 쪽일까요?', yes: { k: 'coast', form: 'beach' }, no: { k: 'coast', form: rng() < 0.6 ? 'mudflat' : pick(rng, ROCK) },
        ex: function (Y, N) { return '「' + Y + '」는 밝은 색 모래가 넓게 펼쳐져 있어요 — 모래사장이에요.'; } };
    } },
    { l: 'l05', type: 'coast_look', make: function (rng) {
      return { ask: '진흙이 보이고 색이 어두운 지형(갯벌)은 어느 쪽일까요?', yes: { k: 'coast', form: 'mudflat' }, no: { k: 'coast', form: rng() < 0.6 ? 'beach' : pick(rng, ROCK) },
        ex: function (Y, N) { return '「' + Y + '」는 색이 어둡고 진흙이 보여요 — 갯벌이에요. 모래사장은 밝은 색 모래가 펼쳐져 있어요.'; } };
    } },
    { l: 'l05', type: 'coast_look', make: function (rng) {
      return { ask: '가파른 절벽은 어느 쪽일까요?', yes: { k: 'coast', form: 'cliff', flip: rng() < 0.5 }, no: { k: 'coast', form: rng() < 0.6 ? 'cave' : pick(rng, SOFT) },
        ex: function (Y, N) { return '「' + Y + '」는 바위가 바다 쪽으로 가파르게 서 있어요 — 절벽이에요.'; } };
    } },
    { l: 'l05', type: 'coast_look', make: function (rng) {
      return { ask: '바위에 구멍이 뚫린 지형(동굴)은 어느 쪽일까요?', yes: { k: 'coast', form: 'cave' }, no: { k: 'coast', form: rng() < 0.6 ? 'cliff' : pick(rng, SOFT), flip: rng() < 0.5 },
        ex: function (Y, N) { return '「' + Y + '」는 바위에 커다란 구멍이 뚫려 있어요 — 동굴이에요.'; } };
    } },
    { l: 'l05', type: 'rock_made', make: function (rng) {
      return { ask: '바위로 이루어진 지형은 어느 쪽일까요?', yes: { k: 'coast', form: pick(rng, ROCK), flip: rng() < 0.5 }, no: { k: 'coast', form: pick(rng, SOFT) },
        ex: function (Y, N) { return '「' + Y + '」는 바위로 이루어져 있어요. 「' + N + '」는 모래나 흙으로 이루어져 있어요.'; } };
    } },
    { l: 'l05', type: 'rock_made', make: function (rng) {
      return { ask: '모래나 흙으로 이루어진 지형은 어느 쪽일까요?', yes: { k: 'coast', form: pick(rng, SOFT) }, no: { k: 'coast', form: pick(rng, ROCK), flip: rng() < 0.5 },
        ex: function (Y, N) { return '「' + Y + '」는 모래나 흙으로 이루어져 있어요. 「' + N + '」는 바위로 이루어져 있어요.'; } };
    } },
    { l: 'l05', type: 'cannot_see', make: function (rng) {
      var fs = shuffle(rng, ROCK.concat(SOFT));
      return { ask: '더 아름다운 지형은 어느 쪽일까요?', q: true, cards: [{ k: 'coast', form: fs[0], flip: rng() < 0.5 }, { k: 'coast', form: fs[1], flip: rng() < 0.5 }],
        ex: function () { return '어느 지형이 더 아름다운지는 사람마다 달라요 — 그림으로 정할 수 없어요. 친구의 생각이 나와 달라도 존중해요.'; } };
    } },
    // l06 밀물과 썰물 — 표지판이 잠기면 밀물 때, 땅이 드러나면 썰물 때 · 파도와 달라요
    { l: 'l06', type: 'tide_in_out', make: function (rng) {
      return { ask: '밀물 때의 모습은 어느 쪽일까요?', tide: true, yes: 'high', no: 'low',
        ex: function (Y, N) { return '「' + Y + '」는 바닷물이 육지 쪽으로 밀려 들어와 표지판이 물에 잠겼어요 — 밀물 때예요. 「' + N + '」는 땅이 드러났어요 — 썰물 때예요.'; } };
    } },
    { l: 'l06', type: 'tide_in_out', make: function (rng) {
      return { ask: '썰물 때의 모습은 어느 쪽일까요?', tide: true, yes: 'low', no: 'high',
        ex: function (Y, N) { return '「' + Y + '」는 바닷물이 바다 쪽으로 빠져나가 땅이 드러났어요 — 썰물 때예요. 「' + N + '」는 표지판이 물에 잠겼어요 — 밀물 때예요.'; } };
    } },
    { l: 'l06', type: 'tide_level', make: function (rng) {
      return { ask: '바닷물의 높이가 더 높은 쪽은 어느 쪽일까요?', tide: true, yes: 'high', no: 'low',
        ex: function (Y, N) { return '표지판을 견주어 봐요. 「' + Y + '」는 표지판이 물에 잠겼어요 — 높이가 더 높아요. 파도가 크고 작은 것은 높이와 달라요 — 물의 높이를 봐요.'; } };
    } },
    { l: 'l06', type: 'cannot_see', make: function (rng) {
      return { ask: '바닷물이 지금 밀려 들어오고 있는 쪽은 어느 쪽일까요?', tide: true, q: true,
        ex: function () { return '두 그림은 바닷물의 높이가 같아요. 그림 한 장으로는 들어오는 중인지 빠져나가는 중인지 알 수 없어요. 파도가 크다고 밀물이 아니에요 — 파도는 잠깐 일어나는 일이고, 높이는 시간에 따라 달라져요.'; } };
    } }
  ];

  // 바닷가 단면 두 장 — 땅 모양·표지판 자리는 같고 물 높이만 다르다. 파도는 따로 뽑는다(파도 큰 쪽 = 정답이 반만).
  function tidePair(rng, m) {
    var base = { k: 'tide', sx: Math.round(between(rng, 118, 134)) };
    var sky = pick(rng, SKY), sea = pick(rng, SEA), green = pick(rng, GREEN);
    function one(level, surf) { var o = look(rng, base); o.level = level; o.surf = surf; o.sky = sky; o.sea = sea; o.green = green; return o; }
    if (m.q) {
      var lvl = pick(rng, ['mid', 'high', 'low']), big = rng() < 0.5;
      return [one(lvl, big ? 2 : 0), one(lvl, big ? 0 : 2)];
    }
    var s1 = Math.floor(rng() * 3), s2 = Math.floor(rng() * 3);
    return [one(m.yes, s1), one(m.no, s2)];
  }

  function build(t, k, rng) {
    var m = t.make(rng), cards, answer;
    if (m.tide) {
      var pr = tidePair(rng, m);
      if (m.q) { cards = pr; answer = 'q'; }
      else if (rng() < 0.5) { cards = pr; answer = 'a'; }
      else { cards = [pr[1], pr[0]]; answer = 'b'; }
      cards = cards.map(function (c) { return { svg: draw(c) }; });
    } else {
      var raw;
      if (m.q) { raw = m.cards; answer = 'q'; }
      else if (rng() < 0.5) { raw = [m.yes, m.no]; answer = 'a'; }
      else { raw = [m.no, m.yes]; answer = 'b'; }
      cards = raw.map(function (c) { return { svg: draw(look(rng, c)) }; });
    }
    var Y = answer === 'b' ? '나' : '가', N = answer === 'b' ? '가' : '나';
    return { id: 'os' + k, l: t.l, type: t.type, ask: m.ask, cards: cards, answer: answer, explain: m.ex(Y, N), prompt: m.ask };
  }

  return {
    id: 'observe_sea',
    title: '관찰 고르기 — 지구와 바다',
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
        check: function (pick2, q) { return pick2 === q.answer; }
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
