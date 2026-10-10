/* gens/science/observe_sound.js — 「소리의 성질」 관찰 고르기 (3학년 2학기 과학 3단원 · l01~l03)
 * 순수 함수·DOM 무관 (§9-3). 장르 observe_pick(관찰 고르기)이 쓴다. 그림은 SVG 글자열로 돌려준다.
 *
 * 관찰 vs 추측(설계 v4 §4 observe_pick 의 byType 축):
 *   그림 두 장(가·나)을 보고 조건에 맞는 쪽을 고른다. 답은 셋 — 가 · 나 · 🤔 그림으로는 알 수 없어요.
 *   「알 수 없어요」는 cannot_see 에만 정답이다 —
 *     l01 두 친구가 물체를 등 뒤에 숨기고 소리를 낸다(정본 s13 「등 뒤에서 낸 소리」 — 보이지 않으니 들어서 맞혀야 한다)
 *     · l02 두 소리굽쇠 끝이 종이컵 속 물에 들어가 있다(컵 속이 안 보이면 물이 튀는지 모른다 — 손을 대 보거나 들여다봐야)
 *     · l03 북채를 들고 아직 치지 않은 두 작은북(얼마나 세게 칠지는 그림으로 모른다 — 쳐 보고 쌀알 높이로).
 * 오개념 축(정본 그대로):
 *   l01 「한 물체에서는 한 가지 소리만」(s15) → same_thing: 같은 페트병, 방법만 다르다.
 *   l02 「소리 나는 물체도 가만히 있다」(s08) · 「딱딱한 스피커는 안 떨린다」(s15) → 떨림은 탁구공·물·줄·막으로 보인다.
 *   l03 「세게 쳐도 떨림은 똑같다」(s08) · 「작은 소리는 안 떨려서」(s15) → soft_vib: 작은 소리 쪽도 늘 작게 떨린다(떨림 0 그림 없음).
 * 이름표 0 — 카드에 글자를 적지 않는다. 그림 속성·정답은 SVG 에 남기지 않는다. 그림은 매번 rng 로 새로(색·자리·기울기·쌀알).
 * 떨림 자국은 한 가지 색(#ff7a59)으로만 그린다 — 「떨림이 있다/없다 · 크다/작다」를 그림이 실제로 담는지 스모크가 잰다.
 * 낱말은 정본 data/g3s2_science_u3.js 에서만: 두드려·불어·흔들어·비벼·문질러·풍선·병 입구·나무판·자·비닐봉지·페트병·쌀·연필·등 뒤·눈을 감고(l01)
 *   · 소리굽쇠·떨림·탁구공·물 표면·튀어·기타 줄·고무줄·스피커 막·트라이앵글·손으로 잡·멈춰·종이컵·손을 대(l02)
 *   · 작은북·심벌즈·쌀알·세게·약하게·크게 떨려·작게 떨려·큰 소리·작은 소리·귓속말·멀리 있는 친구·응원·북채·소리의 세기(l03).
 *   높낮이·높은 소리·낮은 소리(l04) · 전달(l05) · 소음(l06) 0. 차단 어휘(결) 0.
 *
 * params: { upto: 'l01'|'l02'|'l03'|'all' } — 단원 처음부터 그 차시까지 누적, 이번 차시 문항 먼저.
 * next() → { id, l, type, ask, cards:[{svg},{svg}], answer:'a'|'b'|'q', explain, prompt }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['observe_sound'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l03'];
  var INK = '#3a2f28';
  var VIB = '#ff7a59';                                  // 떨림 자국 — 이 색은 떨림에만 쓴다
  var BG = ['#fbf7ee', '#f4f8fc', '#f8f4fb'];
  var TABLE = ['#e6dccb', '#e2d6c2', '#eadfcf'];
  var SKIN = ['#f6d2b0', '#eec39d', '#f3c9a6'];
  var SHIRT = ['#5b8def', '#ef6f6c', '#56b97a', '#f2a93b', '#9b7be8'];
  var BALLOON = ['#ef5a5a', '#f2a93b', '#5b8def', '#56b97a'];
  var DRUM = ['#d9534f', '#3f7fd1', '#3aa27a'];

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
  function line(x1, y1, x2, y2, col, w, extra) { return '<path d="M' + r2(x1) + ' ' + r2(y1) + ' L' + r2(x2) + ' ' + r2(y2) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" fill="none"' + (extra || '') + '/>'; }
  function circ(cx, cy, r, fill, extra) { return '<circle cx="' + r2(cx) + '" cy="' + r2(cy) + '" r="' + r2(r) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function vib(d, w) { return '<path d="' + d + '" stroke="' + VIB + '" stroke-width="' + (w || 3) + '" fill="none" stroke-linecap="round"/>'; }
  // 떨림 자국 — (cx,cy) 둘레 양옆으로 활 n 개. 크게 떨리면 n 이 크고 활이 길다.
  function vibArcs(cx, cy, n, gap, h) {
    var s = '';
    for (var i = 1; i <= n; i++) {
      var dx = gap + i * 9, hh = h + i * 5;
      s += vib('M' + r2(cx - dx) + ' ' + r2(cy - hh) + ' q-7 ' + r2(hh) + ' 0 ' + r2(hh * 2));
      s += vib('M' + r2(cx + dx) + ' ' + r2(cy - hh) + ' q7 ' + r2(hh) + ' 0 ' + r2(hh * 2));
    }
    return s;
  }
  function hand(x, y, rot, skin) {                     // 벙어리장갑 꼴 손
    return '<g transform="rotate(' + r2(rot) + ' ' + r2(x) + ' ' + r2(y) + ')">' +
      '<ellipse cx="' + r2(x) + '" cy="' + r2(y) + '" rx="13" ry="10" fill="' + skin + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<ellipse cx="' + r2(x - 9) + '" cy="' + r2(y - 7) + '" rx="5" ry="4" fill="' + skin + '" stroke="' + INK + '" stroke-width="1.8"/></g>';
  }
  function bang(x, y) {                                // 두드림 — 부딪힌 자리의 짧은 빗금
    var s = '';
    [[-14, -10], [0, -16], [14, -10], [-16, 4], [16, 4]].forEach(function (d) { s += line(x + d[0] * 0.55, y + d[1] * 0.55, x + d[0], y + d[1], '#f2a93b', 2.6); });
    return s;
  }
  function note(x, y, col) {                           // 음표 꼴(글자 아님)
    return '<ellipse cx="' + r2(x) + '" cy="' + r2(y) + '" rx="5" ry="4" fill="' + col + '" transform="rotate(-20 ' + r2(x) + ' ' + r2(y) + ')"/>' + line(x + 4.5, y - 1, x + 4.5, y - 18, col, 2);
  }
  function table(c) { return rect(0, 160, 200, 40, c.table) + line(0, 160, 200, 160, '#b8a888', 2); }

  // ── l01 소리 내는 방법 ────────────────────────────────────────────
  function petBottle(cx, cy, rot, rice, c) {           // 페트병(투명) — rice 면 안에 쌀
    var s = '<g transform="rotate(' + r2(rot) + ' ' + r2(cx) + ' ' + r2(cy) + ')">';
    s += rect(cx - 18, cy - 34, 36, 72, '#dff0fa', ' rx="10" stroke="' + INK + '" stroke-width="2.2"');
    s += rect(cx - 9, cy - 48, 18, 16, '#dff0fa', ' rx="4" stroke="' + INK + '" stroke-width="2"') + rect(cx - 10, cy - 54, 20, 8, '#5b8def', ' rx="2" stroke="' + INK + '" stroke-width="1.8"');
    s += line(cx - 18, cy - 6, cx + 18, cy - 6, '#9cc8e4', 1.6) + line(cx - 18, cy + 14, cx + 18, cy + 14, '#9cc8e4', 1.6);
    if (rice) for (var k = 0; k < 16; k++) s += '<ellipse cx="' + r2(cx - 12 + c.rx[k] * 24) + '" cy="' + r2(cy + 18 + c.ry[k] * 16) + '" rx="2.6" ry="1.6" fill="#fffbe8" stroke="#b59a5a" stroke-width=".8"/>';
    return s + '</g>';
  }
  function drawWay(c) {                                 // how: tap · blow · shake · rub · pencil
    var s = rect(0, 0, 200, 200, c.bg) + table(c), sk = c.skin;
    if (c.how === 'tap') {
      if (c.obj === 'balloon') {
        s += path('M' + r2(96 + c.j) + ' 150 q-6 6 0 12', 'none', ' stroke="' + INK + '" stroke-width="1.6"');
        s += '<ellipse cx="' + r2(96 + c.j) + '" cy="104" rx="38" ry="44" fill="' + c.balloon + '" stroke="' + INK + '" stroke-width="2.4"/>' + path('M' + r2(90 + c.j) + ' 147 l6 6 l6 -6 Z', c.balloon, ' stroke="' + INK + '" stroke-width="1.6"');
        s += '<ellipse cx="' + r2(82 + c.j) + '" cy="86" rx="8" ry="12" fill="#fff" opacity=".45"/>';
        s += hand(r2(130 + c.j), 46, 30, sk) + bang(r2(122 + c.j), 64);
      } else {                                         // 나무판을 자로
        s += rect(36, 132, 128, 22, '#c99a62', ' rx="3" stroke="' + INK + '" stroke-width="2.2"') + line(46, 140, 150, 138, '#a87a44', 1.6) + line(52, 147, 156, 146, '#a87a44', 1.6);
        var tx = r2(98 + c.j);
        s += '<g transform="rotate(-28 ' + tx + ' 132)">' + rect(tx - 5, 52, 10, 80, '#9fd3f0', ' rx="2" stroke="' + INK + '" stroke-width="2"') + '</g>';
        s += hand(r2(tx - 36), 58, 20, sk) + bang(tx, 130);
      }
    } else if (c.how === 'blow') {                      // 병 입구를 입으로
      var bx = r2(124 + c.j);
      s += path('M' + (bx - 22) + ' 158 V102 Q' + (bx - 22) + ' 88 ' + (bx - 8) + ' 80 V54 H' + (bx + 8) + ' V80 Q' + (bx + 22) + ' 88 ' + (bx + 22) + ' 102 V158 Z', '#bfe3c8', ' stroke="' + INK + '" stroke-width="2.2" opacity=".95"');
      s += circ(58, 58, 28, sk, ' stroke="' + INK + '" stroke-width="2.2"') + path('M30 52 Q36 26 64 30 Q84 34 86 50 Z', c.hair) + circ(68, 52, 2.6, INK);
      s += '<ellipse cx="86" cy="64" rx="5" ry="4" fill="#d9534f" stroke="' + INK + '" stroke-width="1.4"/>';
      for (var w = 0; w < 3; w++) s += path('M' + (92) + ' ' + (58 + w * 5) + ' q' + r2((bx - 100) / 2) + ' ' + (-6 + w * 2) + ' ' + r2(bx - 100) + ' ' + (-8 + w * 2), 'none', ' stroke="#8fb8cf" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round"');
    } else if (c.how === 'shake') {                     // 쌀 넣은 페트병을 흔들어
      var sx = r2(100 + c.j);
      s += petBottle(sx, 104, c.rot, true, c) + hand(sx + 4, 100, c.rot, sk);
      s += path('M' + (sx - 46) + ' 70 q-12 30 0 60', 'none', ' stroke="#8a96a0" stroke-width="2.6" stroke-linecap="round"') + path('M' + (sx + 46) + ' 70 q12 30 0 60', 'none', ' stroke="#8a96a0" stroke-width="2.6" stroke-linecap="round"');
      s += path('M' + (sx - 56) + ' 82 q-8 18 0 36', 'none', ' stroke="#8a96a0" stroke-width="2" stroke-linecap="round"') + path('M' + (sx + 56) + ' 82 q8 18 0 36', 'none', ' stroke="#8a96a0" stroke-width="2" stroke-linecap="round"');
    } else if (c.how === 'pencil') {                    // 연필 옆면으로 페트병을 위아래로 문질러
      var px = r2(96 + c.j);
      s += petBottle(px, 104, c.rot / 3, false, c);
      s += '<g transform="rotate(62 ' + (px + 30) + ' 100)">' + rect(px + 2, 96, 64, 9, '#f2c94c', ' stroke="' + INK + '" stroke-width="1.8"') + path('M' + (px + 66) + ' 96 l10 4.5 l-10 4.5 Z', '#f1d6b0', ' stroke="' + INK + '" stroke-width="1.6"') + '</g>';
      s += path('M' + (px + 52) + ' 66 v-14 l-5 6 M' + (px + 52) + ' 52 l5 6 M' + (px + 52) + ' 132 v14 l-5 -6 M' + (px + 52) + ' 146 l5 -6', 'none', ' stroke="#8a96a0" stroke-width="2.4" stroke-linecap="round"');
      s += hand(px + 62, 84, -40, sk);
    } else {                                            // rub — 비닐봉지를 두 손으로 비벼
      var vx = r2(100 + c.j);
      s += path('M' + (vx - 34) + ' 74 L' + (vx - 10) + ' 66 L' + (vx + 8) + ' 78 L' + (vx + 34) + ' 70 L' + (vx + 30) + ' 104 L' + (vx + 36) + ' 132 L' + (vx + 6) + ' 140 L' + (vx - 16) + ' 128 L' + (vx - 36) + ' 136 L' + (vx - 30) + ' 104 Z', '#f3f6f8', ' stroke="' + INK + '" stroke-width="2" opacity=".95"');
      s += line(vx - 20, 88, vx + 4, 112, '#c4ccd3', 1.6) + line(vx + 14, 90, vx - 2, 120, '#c4ccd3', 1.6);
      s += hand(vx - 36, 100, 70, sk) + hand(vx + 36, 108, -110, sk);
      s += path('M' + (vx - 12) + ' 52 l6 -6 l6 6 l6 -6 l6 6', 'none', ' stroke="#8a96a0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"');
      s += path('M' + (vx - 12) + ' 156 l6 -6 l6 6 l6 -6 l6 6', 'none', ' stroke="#8a96a0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"');
    }
    return s;
  }
  function drawBack(c) {                                // 물체를 등 뒤로 숨기고 소리를 내는 친구(앞모습 · 팔은 등 뒤)
    var s = rect(0, 0, 200, 200, c.bg) + rect(0, 176, 200, 24, c.table);
    var x = r2(100 + c.j);
    s += path('M' + (x - 40) + ' 178 L' + (x - 32) + ' 108 Q' + x + ' 96 ' + (x + 32) + ' 108 L' + (x + 40) + ' 178 Z', c.shirt, ' stroke="' + INK + '" stroke-width="2.4"');
    s += path('M' + (x - 32) + ' 112 Q' + (x - 48) + ' 130 ' + (x - 30) + ' 150', 'none', ' stroke="' + INK + '" stroke-width="2.2"') + path('M' + (x + 32) + ' 112 Q' + (x + 48) + ' 130 ' + (x + 30) + ' 150', 'none', ' stroke="' + INK + '" stroke-width="2.2"');
    s += circ(x, 70, 30, c.skin, ' stroke="' + INK + '" stroke-width="2.4"') + path('M' + (x - 30) + ' 64 Q' + (x - 26) + ' 34 ' + x + ' 38 Q' + (x + 26) + ' 34 ' + (x + 30) + ' 64 Q' + (x + 14) + ' 50 ' + x + ' 52 Q' + (x - 14) + ' 50 ' + (x - 30) + ' 64 Z', c.hair);
    s += circ(x - 11, 72, 2.6, INK) + circ(x + 11, 72, 2.6, INK) + path('M' + (x - 7) + ' 84 q7 5 14 0', 'none', ' stroke="' + INK + '" stroke-width="2" stroke-linecap="round"');
    s += note(x - 62, 120 + c.j / 2, '#8a96a0') + note(x + 58, 112 - c.j / 2, '#8a96a0');
    return s;
  }

  // ── l02 소리가 나는 물체의 떨림 ──────────────────────────────────────
  function fork(x, y, rot) {                            // 소리굽쇠 — (x,y) = 두 갈래 끝, 위로 손잡이
    return '<g transform="rotate(' + r2(rot) + ' ' + r2(x) + ' ' + r2(y) + ')">' +
      path('M' + r2(x - 9) + ' ' + r2(y) + ' V' + r2(y - 46) + ' Q' + r2(x - 9) + ' ' + r2(y - 58) + ' ' + r2(x) + ' ' + r2(y - 58) + ' Q' + r2(x + 9) + ' ' + r2(y - 58) + ' ' + r2(x + 9) + ' ' + r2(y - 46) + ' V' + r2(y), 'none', ' stroke="#8d949c" stroke-width="6" stroke-linecap="round"') +
      line(x, y - 58, x, y - 92, '#6b7279', 7) + '</g>';
  }
  function drawWater(c) {                               // 물 표면에 댄 소리굽쇠 · on = 물이 튄다
    var s = rect(0, 0, 200, 200, c.bg) + table(c);
    s += path('M30 112 L46 168 H154 L170 112 Z', '#dce7ee', ' stroke="' + INK + '" stroke-width="2.4"') + '<ellipse cx="100" cy="112" rx="70" ry="10" fill="#cfe8f6" stroke="' + INK + '" stroke-width="2.2"/>';
    var fx = r2(100 + c.j);
    s += fork(fx, 112, c.rot);
    if (c.on) {
      for (var k = 0; k < 6; k++) s += circ(fx - 26 + k * 10 + c.dx[k] * 4, 92 - c.dy[k] * 22, 2.4 + c.dy[k] * 1.6, '#7cc4ec', ' stroke="' + VIB + '" stroke-width="1.2"');
      s += vib('M' + (fx - 30) + ' 116 q30 10 60 0', 2.6) + vib('M' + (fx - 46) + ' 120 q46 14 92 0', 2.2);
    } else s += line(40, 112, 160, 112, '#7fb4d6', 1.8);
    return s;
  }
  function drawBall(c) {                                // 실에 매단 탁구공에 댄 소리굽쇠 · on = 공이 튀어 오른다
    var s = rect(0, 0, 200, 200, c.bg) + rect(54, 14, 92, 8, '#9a7b62', ' rx="3" stroke="' + INK + '" stroke-width="1.8"');
    var top = 100, len = 104, ang = c.on ? c.swing : 0, bx = top + Math.sin(ang * Math.PI / 180) * len, by = 22 + Math.cos(ang * Math.PI / 180) * len;
    s += line(top, 22, bx, by - 13, '#6b5b4b', 1.6) + circ(bx, by, 13, c.ball, ' stroke="' + INK + '" stroke-width="2"');
    s += fork(top - 14, 124, -90);                      // 갈래 끝이 공의 왼쪽(늘 같은 자리)
    if (c.on) s += vib('M' + r2(bx + 18) + ' ' + r2(by - 14) + ' q8 14 0 28', 2.6) + vib('M' + r2(bx + 28) + ' ' + r2(by - 18) + ' q10 18 0 36', 2.2) + line(top - 2, by, bx - 16, by, VIB, 2, ' stroke-dasharray="4 4"');
    return s + rect(0, 186, 200, 14, c.table);
  }
  function drawString(c) {                              // 기타 줄 · 고무줄 · on = 줄이 떨린다(부푼 줄)
    var s = rect(0, 0, 200, 200, c.bg), y0 = 100;
    if (c.obj === 'guitar') {
      s += rect(10, 62, 180, 76, '#c98e52', ' rx="14" stroke="' + INK + '" stroke-width="2.4"') + circ(100, 100, 22, '#5a3d24', ' stroke="' + INK + '" stroke-width="2"');
      s += rect(18, 70, 8, 60, '#7a5a3a') + rect(174, 70, 8, 60, '#7a5a3a');
    } else {
      s += rect(16, 68, 168, 64, '#e8d3a8', ' rx="6" stroke="' + INK + '" stroke-width="2.4"') + rect(30, 82, 140, 36, '#cbb48a', ' rx="4"');
    }
    var col = c.obj === 'guitar' ? '#e9e2d0' : '#e56b8a';
    [-16, 0, 16].forEach(function (dy, i) {
      var y = y0 + dy;
      if (c.on && i === c.which) {
        s += path('M26 ' + y + ' Q100 ' + r2(y - 13) + ' 174 ' + y, 'none', ' stroke="' + col + '" stroke-width="2.4" opacity=".7"') + path('M26 ' + y + ' Q100 ' + r2(y + 13) + ' 174 ' + y, 'none', ' stroke="' + col + '" stroke-width="2.4" opacity=".7"');
        s += vib('M70 ' + r2(y - 18) + ' q30 -8 60 0', 2.4) + vib('M70 ' + r2(y + 18) + ' q30 8 60 0', 2.4);
      } else s += line(26, y, 174, y, col, 2.6);
    });
    return s;
  }
  function drawSpeaker(c) {                             // 스피커 · on = 스피커 막이 떨린다
    var s = rect(0, 0, 200, 200, c.bg) + table(c), x = r2(100 + c.j);
    s += rect(x - 46, 34, 92, 126, c.box, ' rx="10" stroke="' + INK + '" stroke-width="2.6"');
    s += circ(x, 70, 14, '#3a3a3a', ' stroke="' + INK + '" stroke-width="2"') + circ(x, 70, 5, '#888');
    s += circ(x, 120, 30, '#3a3a3a', ' stroke="' + INK + '" stroke-width="2.4"') + circ(x, 120, 18, '#5a5a5a') + circ(x, 120, 7, '#999');
    if (c.on) s += vib('M' + r2(x - 36) + ' 102 q-8 18 0 36', 2.8) + vib('M' + r2(x + 36) + ' 102 q8 18 0 36', 2.8) + '<circle cx="' + x + '" cy="120" r="24" fill="none" stroke="' + VIB + '" stroke-width="2" stroke-dasharray="4 4"/>';
    return s;
  }
  function drawTriangle(c) {                            // 트라이앵글 · held = 손으로 잡아 떨림을 멈춤 · 아니면 떨림 + 음표
    var s = rect(0, 0, 200, 200, c.bg) + rect(64, 16, 72, 8, '#9a7b62', ' rx="3"');
    var x = r2(100 + c.j);
    s += line(x, 24, x, 52, '#6b5b4b', 1.6);
    s += path('M' + x + ' 52 L' + (x + 46) + ' 140 L' + (x - 42) + ' 140 L' + (x - 6) + ' 64', 'none', ' stroke="#9aa3ab" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"');
    if (c.held) s += hand(x + 30, 112, -60, c.skin);
    else s += vib('M' + (x - 58) + ' 96 q-8 18 0 36', 2.8) + vib('M' + (x + 62) + ' 96 q8 18 0 36', 2.8) + note(x + 64, 62, '#f2a93b') + note(x - 66, 70, '#f2a93b');
    return s + line(x - 40, 168, x + 10, 152, '#9a7b62', 4);   // 채
  }
  function drawCups(c) {                                // 종이컵 속 물에 소리굽쇠 끝을 넣음 — 컵 속은 안 보인다
    var s = rect(0, 0, 200, 200, c.bg) + table(c), x = r2(100 + c.j);
    s += fork(x, 128, c.rot);
    s += path('M' + (x - 36) + ' 104 L' + (x - 28) + ' 164 H' + (x + 28) + ' L' + (x + 36) + ' 104 Z', '#fafafa', ' stroke="' + INK + '" stroke-width="2.4"');
    s += '<ellipse cx="' + x + '" cy="104" rx="36" ry="7" fill="#f0f0f0" stroke="' + INK + '" stroke-width="2.2"/>' + rect(x - 33, 126, 66, 10, c.stripe);
    return s;
  }

  // ── l03 큰 소리와 작은 소리 ─────────────────────────────────────────
  function drum(x, c) {                                 // 작은북 — 북면 y = 112
    return '<ellipse cx="' + x + '" cy="152" rx="52" ry="12" fill="' + c.drum + '" stroke="' + INK + '" stroke-width="2.2"/>' +
      rect(x - 52, 112, 104, 40, c.drum, ' stroke="' + INK + '" stroke-width="2.2"') +
      path('M' + (x - 52) + ' 120 l17 24 l17 -24 l17 24 l17 -24 l17 24 l17 -24', 'none', ' stroke="#fff" stroke-width="2" opacity=".8"') +
      '<ellipse cx="' + x + '" cy="112" rx="52" ry="12" fill="#f6f1e6" stroke="' + INK + '" stroke-width="2.4"/>';
  }
  function grains(x, c, lift) {                         // 북면 위 쌀알 · lift = 튀어 오른 높이(0 = 가만히)
    var s = '';
    for (var k = 0; k < 9; k++) {
      var gx = x - 34 + k * 8.5 + c.gx[k] * 3, gy = 110 - (lift ? lift * (0.55 + c.gy[k] * 0.45) : 0);
      s += '<ellipse cx="' + r2(gx) + '" cy="' + r2(gy) + '" rx="2.8" ry="1.8" fill="#fffbe8" stroke="#b59a5a" stroke-width=".9"/>';
    }
    return s;
  }
  function drawDrum(c) {                                // power: 'loud'(세게 — 쌀알 높이 · 북면 크게 떨림) · 'soft'(약하게 — 낮게 · 작게 떨림) · 'wait'(아직 안 침)
    var s = rect(0, 0, 200, 200, c.bg) + rect(0, 164, 200, 36, c.table), x = r2(100 + c.j);
    s += drum(x, c);
    if (c.power === 'wait') {
      s += grains(x, c, 0);
      s += '<g transform="rotate(-34 ' + (x + 40) + ' 60)">' + rect(x + 36, 22, 7, 70, '#c99a62', ' rx="3" stroke="' + INK + '" stroke-width="1.6"') + circ(x + 39.5, 92, 6, '#f2e6cf', ' stroke="' + INK + '" stroke-width="1.6"') + '</g>';
      s += hand(x + 52, 44, -20, c.skin);
    } else {
      var loud = c.power === 'loud';
      s += grains(x, c, loud ? c.hi : c.lo);
      s += vibArcs(x, 114, loud ? 3 : 1, 50, 4);
      s += line(x + 70, 92, x + 30, 106, '#c99a62', 6) + circ(x + 28, 107, 5.5, '#f2e6cf', ' stroke="' + INK + '" stroke-width="1.4"');
    }
    return s;
  }
  function drawCymbal(c) {                              // 심벌즈 · loud = 크게 떨림(활 셋) · soft = 작게 떨림(활 하나 — 떨림 0 아님)
    var s = rect(0, 0, 200, 200, c.bg) + rect(0, 176, 200, 24, c.table), x = r2(100 + c.j);
    s += line(x, 92, x, 176, '#6b7279', 5) + line(x, 176, x - 30, 190, '#6b7279', 4) + line(x, 176, x + 30, 190, '#6b7279', 4);
    s += '<g transform="rotate(' + r2(c.tilt) + ' ' + x + ' 86)"><ellipse cx="' + x + '" cy="86" rx="62" ry="13" fill="#e8c35a" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<ellipse cx="' + x + '" cy="84" rx="14" ry="5" fill="#d4a93a" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<ellipse cx="' + x + '" cy="86" rx="40" ry="7" fill="none" stroke="#c99a2e" stroke-width="1.2"/></g>';
    s += vibArcs(x, 86, c.power === 'loud' ? 3 : 1, 60, 6);
    s += line(x - 76, 40, x - 44, 70, '#c99a62', 5);
    return s;
  }
  function drawVoice(c) {                               // who: 'call'(멀리 있는 친구를 부름 — 큰 소리) · 'whisper'(귓속말 — 작은 소리)
    var s = rect(0, 0, 200, 200, c.bg) + rect(0, 176, 200, 24, c.table);
    function kid(x, y, skin, shirt, hair, mouth) {
      var k = path('M' + (x - 26) + ' 178 L' + (x - 20) + ' ' + (y + 34) + ' Q' + x + ' ' + (y + 26) + ' ' + (x + 20) + ' ' + (y + 34) + ' L' + (x + 26) + ' 178 Z', shirt, ' stroke="' + INK + '" stroke-width="2.2"');
      k += circ(x, y, 22, skin, ' stroke="' + INK + '" stroke-width="2.2"') + path('M' + (x - 22) + ' ' + (y - 4) + ' Q' + x + ' ' + (y - 34) + ' ' + (x + 22) + ' ' + (y - 4) + ' Q' + x + ' ' + (y - 14) + ' ' + (x - 22) + ' ' + (y - 4) + ' Z', hair);
      k += circ(x - 7, y, 2.2, INK) + circ(x + 7, y, 2.2, INK);
      if (mouth === 'big') k += '<ellipse cx="' + (x + 4) + '" cy="' + (y + 11) + '" rx="7" ry="6" fill="#7a2e2e" stroke="' + INK + '" stroke-width="1.6"/>';
      else if (mouth === 'small') k += '<ellipse cx="' + (x + 6) + '" cy="' + (y + 11) + '" rx="2.4" ry="2" fill="#7a2e2e"/>';
      else k += path('M' + (x - 5) + ' ' + (y + 10) + ' q5 4 10 0', 'none', ' stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"');
      return k;
    }
    if (c.who === 'call') {
      s += kid(60, 92, c.skin, c.shirt, c.hair, 'big') + hand(84, 104, 80, c.skin);
      for (var i = 1; i <= 3; i++) s += path('M' + (92 + i * 16) + ' ' + (102 - i * 12) + ' q' + (8 + i * 2) + ' ' + (i * 12) + ' 0 ' + (i * 24), 'none', ' stroke="#f59e0b" stroke-width="3" stroke-linecap="round"');
    } else {
      s += kid(78, 96, c.skin, c.shirt, c.hair, 'small') + kid(128, 96, c.skin2, c.shirt2, c.hair2, 'calm') + hand(100, 104, 90, c.skin);
      s += path('M100 92 q4 4 0 8', 'none', ' stroke="#f59e0b" stroke-width="2" stroke-linecap="round"');
    }
    return s;
  }

  function draw(c) {
    if (c.k === 'way') return svg(drawWay(c));
    if (c.k === 'back') return svg(drawBack(c));
    if (c.k === 'water') return svg(drawWater(c));
    if (c.k === 'ball') return svg(drawBall(c));
    if (c.k === 'string') return svg(drawString(c));
    if (c.k === 'speaker') return svg(drawSpeaker(c));
    if (c.k === 'tri') return svg(drawTriangle(c));
    if (c.k === 'cups') return svg(drawCups(c));
    if (c.k === 'drum') return svg(drawDrum(c));
    if (c.k === 'cymbal') return svg(drawCymbal(c));
    if (c.k === 'voice') return svg(drawVoice(c));
    return svg('');
  }

  // 공통 꾸밈 — 색·자리·흔들림은 rng
  function look(rng, c) {
    var o = {}; for (var k in c) o[k] = c[k];
    o.bg = pick(rng, BG); o.table = pick(rng, TABLE); o.skin = pick(rng, SKIN); o.skin2 = pick(rng, SKIN);
    o.shirt = pick(rng, SHIRT); o.shirt2 = pick(rng, SHIRT); o.hair = pick(rng, ['#3a2f28', '#5a3d24', '#2b2b2b']); o.hair2 = pick(rng, ['#3a2f28', '#6b4a2a', '#2b2b2b']);
    o.balloon = pick(rng, BALLOON); o.drum = pick(rng, DRUM); o.box = pick(rng, ['#4b5563', '#6b4a2a', '#374151']);
    o.ball = pick(rng, ['#ffffff', '#ffb35c']); o.stripe = pick(rng, ['#5b8def', '#ef6f6c', '#56b97a']);
    o.j = Math.round(between(rng, -10, 10)); o.rot = between(rng, -12, 12); o.tilt = between(rng, -5, 5);
    o.swing = between(rng, 22, 34); o.which = Math.floor(rng() * 3);
    o.hi = between(rng, 56, 76); o.lo = between(rng, 14, 22);
    o.rx = []; o.ry = []; o.dx = []; o.dy = []; o.gx = []; o.gy = [];
    for (var i = 0; i < 16; i++) { o.rx.push(rng()); o.ry.push(rng()); o.dx.push(rng()); o.dy.push(rng()); o.gx.push(between(rng, -1, 1)); o.gy.push(rng()); }
    return o;
  }

  var WAYS = ['tap', 'blow', 'shake', 'rub'];
  var WAY_ASK = { tap: '두드려서 소리를 내는 쪽은 어느 쪽일까요?', blow: '불어서 소리를 내는 쪽은 어느 쪽일까요?', shake: '흔들어서 소리를 내는 쪽은 어느 쪽일까요?', rub: '비벼서 소리를 내는 쪽은 어느 쪽일까요?' };
  var WAY_SAY = { tap: '두드려서', blow: '입으로 불어서', shake: '흔들어서', rub: '두 손으로 비벼서', pencil: '연필로 문질러서' };
  function wayCard(rng, how) { var c = { k: 'way', how: how }; if (how === 'tap') c.obj = rng() < 0.5 ? 'balloon' : 'board'; return c; }
  function wayT(how) {
    return { l: 'l01', type: 'way_pick', make: function (rng) {
      var other = pick(rng, WAYS.filter(function (w) { return w !== how; }));
      return { ask: WAY_ASK[how], yes: wayCard(rng, how), no: wayCard(rng, other),
        ex: function (Y, N) { return '「' + Y + '」는 ' + WAY_SAY[how] + ' 소리를 내요. 「' + N + '」는 ' + WAY_SAY[other] + ' 소리를 내요 — 손과 물체가 어떻게 움직이는지 봐요.'; } };
    } };
  }

  // 틀 — l = 정본 차시, type = byType 축, make(rng) → { ask, yes, no, ex } 또는 { ask, q:true, cards:[c,c], ex }
  var T = [
    // l01 여러 가지 물체로 소리 내기 — 두드리기·불기·흔들기·비비기 · 한 물체로도 여러 방법
    wayT('tap'), wayT('blow'), wayT('shake'), wayT('rub'),
    { l: 'l01', type: 'same_thing', make: function (rng) {
      var shake = rng() < 0.5;
      return { ask: shake ? '같은 페트병이에요. 흔들어서 소리를 내는 쪽은 어느 쪽일까요?' : '같은 페트병이에요. 연필로 문질러서 소리를 내는 쪽은 어느 쪽일까요?',
        yes: { k: 'way', how: shake ? 'shake' : 'pencil' }, no: { k: 'way', how: shake ? 'pencil' : 'shake' },
        ex: function (Y, N) { return '둘 다 페트병이지만 방법이 달라요. 「' + Y + '」는 ' + WAY_SAY[shake ? 'shake' : 'pencil'] + ', 「' + N + '」는 ' + WAY_SAY[shake ? 'pencil' : 'shake'] + ' 소리를 내요. 한 물체로도 여러 가지 방법으로 소리를 낼 수 있어요.'; } };
    } },
    { l: 'l01', type: 'cannot_see', make: function (rng) {
      return { ask: '두 친구가 물체를 등 뒤에 숨기고 소리를 내요. 쌀 넣은 페트병을 흔드는 쪽은 어느 쪽일까요?', q: true, cards: [{ k: 'back' }, { k: 'back' }],
        ex: function () { return '물체가 등 뒤에 있어서 그림으로는 알 수 없어요. 눈을 감고 소리를 끝까지 듣고, 무엇으로 어떻게 냈는지 짐작해 말해요.'; } };
    } },
    // l02 소리가 나는 물체의 특징 — 떨림은 손으로 느끼고 눈으로도 본다 · 떨림을 멈추면 소리도 멈춘다
    { l: 'l02', type: 'vib_see', make: function (rng) {
      return { ask: '소리가 나는 소리굽쇠를 물 표면에 댄 쪽은 어느 쪽일까요?', yes: { k: 'water', on: true }, no: { k: 'water', on: false },
        ex: function (Y, N) { return '「' + Y + '」는 주변의 물이 튀어 올라요 — 소리굽쇠가 떨리고 있어요. 「' + N + '」는 물이 잔잔해요.'; } };
    } },
    { l: 'l02', type: 'vib_see', make: function (rng) {
      return { ask: '소리가 나는 소리굽쇠를 탁구공에 댄 쪽은 어느 쪽일까요?', yes: { k: 'ball', on: true }, no: { k: 'ball', on: false },
        ex: function (Y, N) { return '「' + Y + '」는 탁구공이 튀어 올랐어요 — 소리가 나는 소리굽쇠는 떨림이 있어요. 「' + N + '」는 공이 가만히 매달려 있어요.'; } };
    } },
    { l: 'l02', type: 'vib_shape', make: function (rng) {
      var obj = rng() < 0.5 ? 'guitar' : 'band', nm = obj === 'guitar' ? '기타 줄' : '고무줄';
      return { ask: '소리가 나고 있는 ' + nm + '은 어느 쪽일까요?', yes: { k: 'string', obj: obj, on: true }, no: { k: 'string', obj: obj, on: false },
        ex: function (Y, N) { return '「' + Y + '」는 줄 하나가 떨리고 있어요 — 줄이 떨리면서 소리가 나요. 「' + N + '」는 줄이 모두 곧게 가만히 있어요.'; } };
    } },
    { l: 'l02', type: 'vib_shape', make: function (rng) {
      return { ask: '소리가 나고 있는 스피커는 어느 쪽일까요?', yes: { k: 'speaker', on: true }, no: { k: 'speaker', on: false },
        ex: function (Y, N) { return '「' + Y + '」는 스피커 막이 떨리고 있어요. 딱딱한 상자여도 소리가 나는 물체는 떨림이 있어요. 「' + N + '」는 막이 가만히 있어요.'; } };
    } },
    { l: 'l02', type: 'vib_stop', make: function (rng) {
      var stop = rng() < 0.5;
      return { ask: stop ? '소리가 멈춘 트라이앵글은 어느 쪽일까요?' : '소리가 나고 있는 트라이앵글은 어느 쪽일까요?', yes: { k: 'tri', held: stop }, no: { k: 'tri', held: !stop },
        ex: function (Y, N) { return stop ? '「' + Y + '」는 트라이앵글을 손으로 잡았어요 — 떨림을 멈추면 소리도 멈춰요. 「' + N + '」는 아직 떨리고 있어요.'
          : '「' + Y + '」는 트라이앵글이 떨리고 있어요 — 소리가 나요. 「' + N + '」는 손으로 잡아 떨림을 멈췄어요 — 소리도 멈춰요.'; } };
    } },
    { l: 'l02', type: 'cannot_see', make: function (rng) {
      return { ask: '두 소리굽쇠의 끝을 종이컵 속 물에 댔어요. 소리가 나는 소리굽쇠는 어느 쪽일까요?', q: true, cards: [{ k: 'cups' }, { k: 'cups' }],
        ex: function () { return '컵 속이 보이지 않아 물이 튀어 오르는지 그림으로는 알 수 없어요. 컵 속을 들여다보거나, 소리굽쇠에 손을 대 떨림을 느껴 봐야 해요.'; } };
    } },
    // l03 큰 소리와 작은 소리 — 크게 떨리면 큰 소리 · 작게 떨리면 작은 소리(떨림이 없는 게 아니다)
    { l: 'l03', type: 'loud_vib', make: function (rng) {
      return { ask: '작은북을 세게 친 쪽은 어느 쪽일까요?', yes: { k: 'drum', power: 'loud' }, no: { k: 'drum', power: 'soft' },
        ex: function (Y, N) { return '「' + Y + '」는 쌀알이 높이 튀어 올랐어요 — 북면이 크게 떨려 큰 소리가 나요. 「' + N + '」는 쌀알이 조금만 튀었어요 — 약하게 쳤어요.'; } };
    } },
    { l: 'l03', type: 'soft_vib', make: function (rng) {
      return { ask: '작은북을 약하게 친 쪽은 어느 쪽일까요?', yes: { k: 'drum', power: 'soft' }, no: { k: 'drum', power: 'loud' },
        ex: function (Y, N) { return '「' + Y + '」는 쌀알이 조금만 튀었어요 — 북면이 작게 떨리면서 작은 소리가 나요. 작은 소리일 때도 북면은 떨려요.'; } };
    } },
    { l: 'l03', type: 'loud_vib', make: function (rng) {
      return { ask: '큰 소리가 나는 심벌즈는 어느 쪽일까요?', yes: { k: 'cymbal', power: 'loud' }, no: { k: 'cymbal', power: 'soft' },
        ex: function (Y, N) { return '「' + Y + '」는 심벌즈가 크게 떨리고 있어요 — 큰 소리가 나요. 「' + N + '」는 작게 떨려요 — 작은 소리가 나요.'; } };
    } },
    { l: 'l03', type: 'soft_vib', make: function (rng) {
      return { ask: '작은 소리가 나는 심벌즈는 어느 쪽일까요?', yes: { k: 'cymbal', power: 'soft' }, no: { k: 'cymbal', power: 'loud' },
        ex: function (Y, N) { return '「' + Y + '」는 심벌즈가 작게 떨리면서 작은 소리가 나요. 떨리지 않는 게 아니에요 — 떨리지 않으면 소리가 아예 나지 않아요.'; } };
    } },
    { l: 'l03', type: 'loud_life', make: function (rng) {
      var call = rng() < 0.5;
      return { ask: call ? '멀리 있는 친구를 부를 때는 어느 쪽일까요?' : '친구에게 귓속말을 할 때는 어느 쪽일까요?', yes: { k: 'voice', who: call ? 'call' : 'whisper' }, no: { k: 'voice', who: call ? 'whisper' : 'call' },
        ex: function (Y, N) { return call ? '「' + Y + '」는 입을 크게 벌리고 큰 소리를 내요 — 멀리까지 들려야 해요. 「' + N + '」는 귓속말이에요 — 작은 소리예요.'
          : '「' + Y + '」는 친구 귀에 대고 작은 소리로 말해요 — 귓속말이에요. 「' + N + '」는 멀리 있는 친구를 부르는 큰 소리예요.'; } };
    } },
    { l: 'l03', type: 'cannot_see', make: function (rng) {
      return { ask: '두 친구가 북채를 들었어요. 더 큰 소리가 날 작은북은 어느 쪽일까요?', q: true, cards: [{ k: 'drum', power: 'wait' }, { k: 'drum', power: 'wait' }],
        ex: function () { return '아직 치지 않았어요. 얼마나 세게 칠지는 그림으로는 알 수 없어요 — 쳐 보고 쌀알이 튀어 오르는 높이로 견주어요.'; } };
    } }
  ];

  function build(t, k, rng) {
    var m = t.make(rng), raw, answer;
    if (m.q) { raw = m.cards; answer = 'q'; }
    else if (rng() < 0.5) { raw = [m.yes, m.no]; answer = 'a'; }
    else { raw = [m.no, m.yes]; answer = 'b'; }
    // 한 문항의 두 카드는 같은 배경 · 같은 물체(같은 북·스피커·탁구공·풍선) 위에 — 색으로는 못 가른다
    var same = { bg: pick(rng, BG), table: pick(rng, TABLE), drum: pick(rng, DRUM), box: pick(rng, ['#4b5563', '#6b4a2a', '#374151']),
      ball: pick(rng, ['#ffffff', '#ffb35c']), balloon: pick(rng, BALLOON) };
    var cards = raw.map(function (c) { var o = look(rng, c); for (var key in same) o[key] = same[key]; return { svg: draw(o) }; });
    var Y = answer === 'b' ? '나' : '가', N = answer === 'b' ? '가' : '나';
    return { id: 'ob' + k, l: t.l, type: t.type, ask: m.ask, cards: cards, answer: answer, explain: m.ex(Y, N), prompt: m.ask };
  }

  return {
    id: 'observe_sound',
    title: '관찰 고르기 — 소리의 성질',
    T: T,
    ORDER: ORDER,
    VIB: VIB,
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
