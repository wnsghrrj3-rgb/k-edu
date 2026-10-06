/* gens/science/observe_plant.js — 「식물의 생활」 관찰 고르기 (3학년 1학기 과학 3단원 · l01~l05)
 * 순수 함수·DOM 무관 (§9-3). 장르 observe_pick(관찰 고르기)이 쓴다. 그림은 SVG 글자열로 돌려준다.
 *
 * 관찰 vs 추측(설계 v4 §4 observe_pick 의 byType 축):
 *   그림 두 장(가·나)을 보고 조건에 맞는 쪽을 고른다. 답은 셋 — 가 · 나 · 🤔 그림으로는 알 수 없어요.
 *   「알 수 없어요」는 그림에 안 보이는 것을 묻는 문항(가려진 줄기 · 흐린 물속 · 땅속 뿌리)과
 *   사람마다 달라지는 것을 묻는 문항(예쁜가 · 마음에 드는가 — 정본 l02 오개념)에만 정답이다.
 * 이름표 0 — 카드에 식물 이름을 적지 않는다. 이름을 알면 보지 않고 아는 것으로 답하게 되기 때문(관찰을 재는 장르).
 * 그림은 매번 rng 로 새로 그린다(잎 갈래 수·톱니·기울기·색·키) — 외워서는 못 푼다. 그림 속성은 SVG 에 남기지 않는다(답 미노출).
 * 낱말은 정본 data/g3_science_u3.js 에서만: 넓적·뾰족·바늘(l01) · 톱니·매끈·갈라짐·길쭉·잎자루(l02) · 줄기·굵다·가늘다(l03)
 *   · 떠서·잠겨·솟아·뿌리·부레옥잠(l04) · 가시·저장(l05). 범위 밖 낱말은 그 차시 문항에 나오지 않는다(스모크가 잰다).
 *
 * params: { upto: 'l01'|'l02'|'l03'|'l04'|'l05'|'all' } — 단원 처음부터 그 차시까지 누적, 이번 차시 문항 먼저.
 * next() → { id, l, type, ask, cards:[{svg},{svg}], answer:'a'|'b'|'q', explain, prompt }
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['observe_plant'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l01', 'l02', 'l03', 'l04', 'l05'];
  var INK = '#2f4f2a', VEIN = '#3f7a35';
  var LEAF = ['#7cc46a', '#8fce5f', '#6fb86b', '#a3d45a', '#78c27f'];

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
  function poly(pts) { return pts.map(function (p) { return r2(p[0]) + ',' + r2(p[1]); }).join(' '); }

  // ── 잎 한 갈래(로컬 좌표: 밑동 (0,0) · 끝 (0,-h)) — 톱니면 가장자리를 들쭉날쭉하게
  function lobe(h, a, saw) {
    var pts = [], N = saw ? 46 : 40, tooth = Math.min(6, a * 0.4);
    for (var i = 0; i <= N; i++) {
      var f = i / N * Math.PI * 2, c = Math.cos(f), sn = Math.sin(f);
      var x = a * sn * (0.82 - 0.18 * c) * (c > 0.6 ? 1 - (c - 0.6) * 0.55 : 1), y = -h / 2 - (h / 2) * c;   // 아래쪽이 넓고 끝이 뾰족
      if (saw && i % 2 === 1 && Math.abs(sn) > 0.2) {                                                  // 톱니 — 바깥으로 일정한 깊이
        var dx = x, dy = y + h / 2, L = Math.sqrt(dx * dx + dy * dy) || 1;
        x += dx / L * tooth; y += dy / L * tooth;
      }
      pts.push([x, y]);
    }
    return pts;
  }
  function veins(h, a) {
    var s = '<line x1="0" y1="0" x2="0" y2="' + r2(-h * 0.9) + '"/>';
    [0.3, 0.5, 0.7].forEach(function (t) {
      var y = -h * t, dx = a * 0.62 * (1 - Math.abs(t - 0.45)), dy = -h * 0.12;
      s += '<line x1="0" y1="' + r2(y) + '" x2="' + r2(dx) + '" y2="' + r2(y + dy) + '"/><line x1="0" y1="' + r2(y) + '" x2="' + r2(-dx) + '" y2="' + r2(y + dy) + '"/>';
    });
    return s;
  }
  // spec: { k:'leaf', lobes:1|3|5, saw, long, stalk, tilt, hue }
  function drawLeaf(sp) {
    var lobes = sp.long ? 1 : sp.lobes, out = '', fill = '', vs = '';
    var hMain = sp.long ? 140 : (lobes === 1 ? 124 : 96);
    var aMain = sp.long ? 15 : (lobes === 1 ? 54 : 22);
    var stalk = sp.stalk, baseY = Math.min(186 - stalk, 22 + hMain + (lobes > 1 ? 6 : 0));
    var fan = lobes === 5 ? [-72, -36, 0, 36, 72] : (lobes === 3 ? [-46, 0, 46] : [0]);
    fan.forEach(function (deg) {
      var side = Math.abs(deg), h = hMain * (side > 50 ? 0.66 : side > 0 ? 0.84 : 1), a = aMain * (side > 50 ? 0.85 : 1);
      var p = poly(lobe(h, a, sp.saw)), tf = 'rotate(' + deg + ')';
      out += '<polygon points="' + p + '" transform="' + tf + '"/>';
      fill += '<polygon points="' + p + '" transform="' + tf + '"/>';
      vs += '<g transform="' + tf + '">' + veins(h, a) + '</g>';
    });
    return svg('<g transform="translate(100 ' + r2(baseY) + ') rotate(' + r2(sp.tilt) + ')">' +
      '<line x1="0" y1="0" x2="0" y2="' + r2(stalk) + '" stroke="' + VEIN + '" stroke-width="5" stroke-linecap="round"/>' +
      '<g fill="' + INK + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round">' + out + '</g>' +
      '<g fill="' + sp.hue + '">' + fill + '</g>' +
      '<g stroke="' + VEIN + '" stroke-width="1.8" stroke-linecap="round">' + vs + '</g></g>');
  }
  function drawNeedle(sp) {
    var s = '<line x1="30" y1="170" x2="176" y2="' + r2(150 + sp.tilt) + '" stroke="#8b5a2b" stroke-width="7" stroke-linecap="round"/>';
    [52, 84, 116, 148].forEach(function (x, i) {
      var y = 168 - (x - 30) * (20 - sp.tilt) / 146;
      [-14, 6].forEach(function (d) {
        var ang = (d - 8 + i * 3) * Math.PI / 180, L = 118 - i * 12;
        s += '<line x1="' + r2(x) + '" y1="' + r2(y) + '" x2="' + r2(x + Math.sin(ang) * L) + '" y2="' + r2(y - Math.cos(ang) * L) + '" stroke="#3f7d3a" stroke-width="3.4" stroke-linecap="round"/>';
      });
      s += '<rect x="' + r2(x - 3) + '" y="' + r2(y - 9) + '" width="6" height="9" rx="2" fill="#8b5a2b"/>';
    });
    return svg(s);
  }

  // ── 풀·나무 (l03) — spec { k:'plant', tree, tall, hide, hue }
  function drawPlant(sp) {
    var s = '<rect x="0" y="178" width="200" height="22" fill="#c9a36b"/>';
    if (sp.tree) {
      var tw = sp.tall ? 22 : 18, th = sp.tall ? 92 : 40, top = 178 - th, cr = sp.tall ? 32 : 22;
      s += '<rect x="' + r2(100 - tw / 2) + '" y="' + r2(top) + '" width="' + tw + '" height="' + th + '" rx="3" fill="#8b5a2b" stroke="#5e3b18" stroke-width="2"/>';
      s += '<path d="M' + r2(100 - tw / 4) + ' ' + r2(top + 10) + ' v' + r2(th - 18) + ' M' + r2(100 + tw / 5) + ' ' + r2(top + 18) + ' v' + r2(th - 30) + '" stroke="#5e3b18" stroke-width="2"/>';
      [[0, -cr * 0.9], [-cr * 0.9, -cr * 0.2], [cr * 0.9, -cr * 0.2], [-cr * 0.5, -cr * 1.4], [cr * 0.5, -cr * 1.4]].forEach(function (o) {
        s += '<circle cx="' + r2(100 + o[0]) + '" cy="' + r2(top + o[1]) + '" r="' + cr + '" fill="' + sp.hue + '" stroke="' + INK + '" stroke-width="2"/>';
      });
    } else if (sp.hide) {                                // 가려진 풀 — 잎 다발 끝만 언덕 위로 (줄기는 안 보인다)
      [-34, -24, -15, -6, 3, 12, 21, 30].forEach(function (d, k) {
        var tipX = 100 + d * 1.6, tipY = 34 + (k % 3) * 9;
        s += '<path d="M' + (100 + d * 0.3) + ' 178 Q ' + r2(100 + d * 0.9) + ' 110 ' + r2(tipX) + ' ' + tipY + '" stroke="' + sp.hue + '" stroke-width="7" stroke-linecap="round" fill="none"/>';
      });
    } else {
      var H = sp.tall ? 160 : 70, topY = 178 - H;
      s += '<path d="M100 178 C 98 ' + r2(178 - H * 0.4) + ' 102 ' + r2(178 - H * 0.7) + ' 100 ' + r2(topY) + '" stroke="#4f9a3c" stroke-width="3.6" fill="none"/>';
      [0.3, 0.55, 0.78].forEach(function (t, i) {
        var y = 178 - H * t, d = i % 2 ? 1 : -1;
        s += '<path d="M100 ' + r2(y) + ' q ' + 22 * d + ' -8 ' + 34 * d + ' -2 q -14 10 -34 2 z" fill="' + sp.hue + '" stroke="' + INK + '" stroke-width="1.6"/>';
      });
      if (sp.tall) s += '<circle cx="100" cy="' + r2(topY) + '" r="17" fill="#f5c518" stroke="#b8860b" stroke-width="2"/><circle cx="100" cy="' + r2(topY) + '" r="7" fill="#7a4a1c"/>';
      else s += '<ellipse cx="100" cy="' + r2(topY - 6) + '" rx="6" ry="13" fill="#b9c96a" stroke="' + INK + '" stroke-width="1.4"/>';
    }
    if (sp.hide) s += '<path d="M0 84 Q 50 66 100 78 T 200 74 V200 H0 Z" fill="#8fbf5f" stroke="#5c8a3a" stroke-width="2.4"/>';
    return svg(s);
  }

  // ── 물에 사는 식물 (l04) — spec { k:'water', way:'float'|'sink'|'emerge', murky }
  function drawWater(sp) {
    var s = '', W = 72;
    s += '<rect x="0" y="' + W + '" width="200" height="' + (186 - W) + '" fill="' + (sp.murky ? '#8c7a4e' : '#a7d8f0') + '"/>';
    s += '<path d="M0 ' + W + ' q 25 -5 50 0 t 50 0 t 50 0 t 50 0" stroke="#4a90b8" stroke-width="2.4" fill="none"/>';
    s += '<rect x="0" y="186" width="200" height="14" fill="#7a5a3a"/>';
    if (sp.way === 'float') {
      [62, 100, 138].forEach(function (x, i) {
        if (!sp.murky) [-6, 0, 6].forEach(function (d) { s += '<path d="M' + (x + d) + ' ' + (W + 4) + ' q ' + (d * 1.5) + ' 26 ' + d + ' ' + (44 + i * 6) + '" stroke="#6b4f2a" stroke-width="1.8" fill="none"/>'; });
        s += '<ellipse cx="' + x + '" cy="' + (W - 2) + '" rx="17" ry="6" fill="#6fbf5a" stroke="' + INK + '" stroke-width="1.8"/>';
      });
    } else if (sp.way === 'sink') {
      [70, 100, 130].forEach(function (x, i) {
        var top = W + 26 + i * 6;
        s += '<path d="M' + x + ' 186 C ' + (x - 12) + ' 150 ' + (x + 12) + ' 130 ' + x + ' ' + top + '" stroke="#3f8a3a" stroke-width="2.6" fill="none"/>';
        for (var y = 176; y > top + 6; y -= 13) s += '<path d="M' + x + ' ' + y + ' l -9 -5 M' + x + ' ' + y + ' l 9 -5" stroke="#3f8a3a" stroke-width="2"/>';
      });
    } else {
      [84, 112].forEach(function (x, i) {
        s += '<line x1="' + x + '" y1="186" x2="' + x + '" y2="' + (26 + i * 8) + '" stroke="#5a8f3a" stroke-width="3.2"/>';
        s += '<rect x="' + (x - 6) + '" y="' + (34 + i * 8) + '" width="12" height="30" rx="6" fill="#7a4a1c"/>';
      });
      s += '<path d="M98 186 Q 70 110 60 40 M98 186 Q 128 110 140 52" stroke="#6ea94a" stroke-width="3" fill="none"/>';
    }
    return svg(s);
  }

  // ── 사막 식물 (l05) — spec { k:'desert', kind:'cactus'|'rosette'|'leafy', soil }
  function drawDesert(sp) {
    var s = '<rect x="0" y="0" width="200" height="200" fill="#fff8e6"/>';
    var G = 176;
    if (sp.kind === 'cactus') {
      s += '<path d="M84 ' + G + ' V62 a16 16 0 0 1 32 0 V' + G + ' Z" fill="#5fa65a" stroke="' + INK + '" stroke-width="2.4"/>';
      s += '<path d="M84 120 h-14 a8 8 0 0 1 -8 -8 V88 a7 7 0 0 1 14 0 V104 h8 Z" fill="#5fa65a" stroke="' + INK + '" stroke-width="2.2"/>';
      s += '<path d="M116 104 h12 V80 a7 7 0 0 1 14 0 V100 a10 10 0 0 1 -10 10 h-16 Z" fill="#5fa65a" stroke="' + INK + '" stroke-width="2.2"/>';
      s += '<path d="M100 56 V' + G + ' M92 64 V' + G + ' M108 64 V' + G + '" stroke="#3f7d3a" stroke-width="1.4"/>';
      for (var y = 70; y < G - 4; y += 14) [[84, -1], [116, 1], [100, 0]].forEach(function (p) {
        var x = p[0];
        s += p[1] ? '<path d="M' + x + ' ' + y + ' l ' + (p[1] * 7) + ' -3 M' + x + ' ' + y + ' l ' + (p[1] * 7) + ' 3" stroke="#f3f0d0" stroke-width="1.6"/>' :
                    '<path d="M' + x + ' ' + (y + 6) + ' l -4 -5 M' + x + ' ' + (y + 6) + ' l 4 -5" stroke="#f3f0d0" stroke-width="1.4"/>';
      });
    } else if (sp.kind === 'rosette') {
      [-62, -38, -14, 12, 36, 60].forEach(function (deg, i) {
        var L = 92 - Math.abs(deg) * 0.45;
        s += '<g transform="translate(100 ' + G + ') rotate(' + deg + ')"><path d="M-11 0 Q -13 ' + r2(-L * 0.5) + ' 0 ' + r2(-L) + ' Q 13 ' + r2(-L * 0.5) + ' 11 0 Z" fill="' + (i % 2 ? '#7fae8a' : '#8cbc94') + '" stroke="' + INK + '" stroke-width="2"/>' +
             '<path d="M0 -6 V' + r2(-L * 0.8) + '" stroke="#5f8f6a" stroke-width="1.4"/></g>';
      });
    } else {
      s += '<path d="M100 ' + G + ' C 98 140 103 100 100 54" stroke="#6b8f3a" stroke-width="2.6" fill="none"/>';
      for (var k = 0; k < 7; k++) {
        var yy = 160 - k * 15, d = k % 2 ? 1 : -1;
        s += '<ellipse cx="' + (100 + d * 16) + '" cy="' + yy + '" rx="15" ry="4.6" transform="rotate(' + (d * -18) + ' ' + (100 + d * 16) + ' ' + yy + ')" fill="#86c95a" stroke="' + INK + '" stroke-width="1.4"/>';
      }
    }
    s += '<rect x="0" y="' + G + '" width="200" height="' + (200 - G) + '" fill="#e9c88a"/>';
    if (sp.soil) s += '<path d="M0 ' + G + ' H200" stroke="#c9a46a" stroke-width="3"/><text x="100" y="196" text-anchor="middle" font-size="11" fill="#8a6a3a">땅속</text>';
    return svg(s);
  }

  function draw(sp) {
    return sp.k === 'leaf' ? drawLeaf(sp) : sp.k === 'needle' ? drawNeedle(sp) : sp.k === 'plant' ? drawPlant(sp)
         : sp.k === 'water' ? drawWater(sp) : drawDesert(sp);
  }

  // ── 그림 재료 (rng 로 매번 다르게)
  function leaf(rng, o) {
    var sp = { k: 'leaf', lobes: 1, saw: rng() < 0.5, long: false, stalk: Math.round(between(rng, 16, 34)), tilt: r2(between(rng, -12, 12)), hue: pick(rng, LEAF) };
    for (var key in o) sp[key] = o[key];
    if (sp.long) sp.lobes = 1;
    return sp;
  }
  function lobed(rng) { return rng() < 0.5 ? 3 : 5; }

  // ── 문항 틀 — 차시 · 유형 · make(rng) → { ask, yes, no, ex(Y,N) } 또는 { ask, q:true, cards, ex }
  var T = [
    // l01 활짝! 과학 열기 — 잎의 생김새(넓적 · 뾰족)
    { l: 'l01', type: 'leaf_shape', make: function (rng) {
      return { ask: '바늘처럼 뾰족한 잎은 어느 쪽일까요?', yes: { k: 'needle', tilt: r2(between(rng, 0, 10)) },
        no: leaf(rng, { lobes: rng() < 0.5 ? 1 : lobed(rng), saw: false }),
        ex: function (Y, N) { return '「' + Y + '」 잎은 가늘고 뾰족한 바늘 모양이에요. 「' + N + '」 잎은 넓적해요.'; } };
    } },
    { l: 'l01', type: 'leaf_shape', make: function (rng) {
      return { ask: '넓적한 잎은 어느 쪽일까요?', yes: leaf(rng, { lobes: rng() < 0.5 ? 1 : lobed(rng), saw: false }), no: { k: 'needle', tilt: r2(between(rng, 0, 10)) },
        ex: function (Y, N) { return '「' + Y + '」 잎은 넓적해요. 「' + N + '」 잎은 가늘고 뾰족한 바늘 모양이에요.'; } };
    } },
    // l02 잎을 살펴봐요 — 톱니 · 갈라짐 · 길쭉함 · 잎자루
    { l: 'l02', type: 'leaf_edge', make: function (rng) {
      var conf = rng() < 0.5;                             // 헷갈림 짝: 매끈하지만 갈라진 잎
      return { ask: '가장자리가 톱니 모양인 잎은 어느 쪽일까요?', yes: leaf(rng, { saw: true, lobes: rng() < 0.5 ? 1 : lobed(rng) }),
        no: leaf(rng, { saw: false, lobes: conf ? lobed(rng) : 1 }),
        ex: function (Y, N) { return '「' + Y + '」 잎은 가장자리가 톱니처럼 들쭉날쭉해요. 「' + N + '」 잎은 가장자리가 매끈해요' + (conf ? ' — 갈라진 것과 톱니는 달라요.' : '.'); } };
    } },
    { l: 'l02', type: 'leaf_edge', make: function (rng) {
      return { ask: '가장자리가 매끈한 잎은 어느 쪽일까요?', yes: leaf(rng, { saw: false, lobes: 1, long: rng() < 0.4 }), no: leaf(rng, { saw: true, lobes: rng() < 0.5 ? 1 : lobed(rng) }),
        ex: function (Y, N) { return '「' + Y + '」 잎은 가장자리가 매끈해요. 「' + N + '」 잎은 톱니 모양이에요.'; } };
    } },
    { l: 'l02', type: 'leaf_lobe', make: function (rng) {
      var conf = rng() < 0.5;                             // 헷갈림 짝: 안 갈라졌지만 톱니인 잎
      return { ask: '잎이 갈라진 것은 어느 쪽일까요?', yes: leaf(rng, { lobes: lobed(rng) }), no: leaf(rng, { lobes: 1, saw: conf }),
        ex: function (Y, N) { return '「' + Y + '」 잎은 여러 갈래로 갈라졌어요. 「' + N + '」 잎은 한 장으로 붙어 있어요' + (conf ? ' — 톱니가 있어도 갈라진 건 아니에요.' : '.'); } };
    } },
    { l: 'l02', type: 'leaf_lobe', make: function (rng) {
      return { ask: '잎이 갈라지지 않은 것은 어느 쪽일까요?', yes: leaf(rng, { lobes: 1, long: rng() < 0.4 }), no: leaf(rng, { lobes: lobed(rng) }),
        ex: function (Y, N) { return '「' + Y + '」 잎은 한 장으로 붙어 있어요. 「' + N + '」 잎은 여러 갈래로 갈라졌어요.'; } };
    } },
    { l: 'l02', type: 'leaf_long', make: function (rng) {
      return { ask: '잎이 길쭉한 것은 어느 쪽일까요?', yes: leaf(rng, { long: true }), no: leaf(rng, { lobes: rng() < 0.6 ? 1 : lobed(rng) }),
        ex: function (Y, N) { return '「' + Y + '」 잎은 길이에 견주어 너비가 아주 좁아 길쭉해요. 「' + N + '」 잎은 넓적해요.'; } };
    } },
    { l: 'l02', type: 'leaf_part', make: function (rng) {
      var lb = rng() < 0.5 ? 1 : lobed(rng), sw = rng() < 0.5;
      var a = leaf(rng, { lobes: lb, saw: sw, stalk: 44 }), b = leaf(rng, { lobes: lb, saw: sw, stalk: 10 });
      return { ask: '잎자루가 더 긴 잎은 어느 쪽일까요?', yes: a, no: b,
        ex: function (Y, N) { return '잎몸 아래 줄기에 잇는 자루가 잎자루예요. 「' + Y + '」 잎의 잎자루가 더 길어요.'; } };
    } },
    { l: 'l02', type: 'cannot_see', make: function (rng) {
      var ask = rng() < 0.5 ? '더 예쁜 잎은 어느 쪽일까요?' : '더 마음에 드는 잎은 어느 쪽일까요?';
      return { ask: ask, q: true, cards: [leaf(rng, { lobes: lobed(rng) }), leaf(rng, { lobes: 1 })],
        ex: function () { return '예쁜지, 마음에 드는지는 사람마다 달라요. 그림을 아무리 자세히 봐도 정할 수 없어요 — 그래서 분류 기준이 될 수 없어요.'; } };
    } },
    // l03 풀과 나무 — 키가 아니라 줄기
    { l: 'l03', type: 'grass_tree', make: function (rng) {
      var trap = rng() < 0.6;                             // 키 큰 풀 · 키 작은 나무 (정본 오개념: 키가 크면 나무)
      return { ask: '나무는 어느 쪽일까요?', yes: { k: 'plant', tree: true, tall: !trap, hue: pick(rng, LEAF) }, no: { k: 'plant', tree: false, tall: trap, hue: pick(rng, LEAF) },
        ex: function (Y, N) { return '「' + Y + '」 식물은 줄기가 굵어요 — 나무예요. 「' + N + '」 식물은 줄기가 가늘어요' + (trap ? ' — 키가 커도 풀이에요.' : ' — 풀이에요.'); } };
    } },
    { l: 'l03', type: 'grass_tree', make: function (rng) {
      var trap = rng() < 0.6;
      return { ask: '풀은 어느 쪽일까요?', yes: { k: 'plant', tree: false, tall: trap, hue: pick(rng, LEAF) }, no: { k: 'plant', tree: true, tall: !trap, hue: pick(rng, LEAF) },
        ex: function (Y, N) { return '「' + Y + '」 식물은 줄기가 가늘어요 — 풀이에요' + (trap ? '. 키만 보면 틀리기 쉬워요.' : '.') + ' 「' + N + '」 식물은 줄기가 굵어요.'; } };
    } },
    { l: 'l03', type: 'cannot_see', make: function (rng) {
      var tallFirst = rng() < 0.5;                     // 둘 다 키가 크고 줄기는 언덕 뒤
      return { ask: '나무는 어느 쪽일까요?', q: true,
        cards: [{ k: 'plant', tree: !tallFirst, tall: true, hide: true, hue: pick(rng, LEAF) }, { k: 'plant', tree: tallFirst, tall: true, hide: true, hue: pick(rng, LEAF) }],
        ex: function () { return '언덕에 줄기가 가려졌어요. 풀과 나무를 가르는 것은 줄기인데 줄기가 안 보이니 알 수 없어요 — 키만 보고 정하면 틀리기 쉬워요.'; } };
    } },
    // l04 물에 사는 식물 — 떠서 · 잠겨서 · 솟아서
    { l: 'l04', type: 'water_way', make: function (rng) {
      return { ask: '물 위에 떠서 사는 식물은 어느 쪽일까요?', yes: { k: 'water', way: 'float' }, no: { k: 'water', way: pick(rng, ['sink', 'emerge']) },
        ex: function (Y, N) { return '「' + Y + '」 식물은 잎이 물 위에 떠 있고, 물속으로 뿌리가 늘어져 있어요.'; } };
    } },
    { l: 'l04', type: 'water_way', make: function (rng) {
      return { ask: '물속에 잠겨 사는 식물은 어느 쪽일까요?', yes: { k: 'water', way: 'sink' }, no: { k: 'water', way: pick(rng, ['float', 'emerge']) },
        ex: function (Y, N) { return '「' + Y + '」 식물은 물 밑바닥에 뿌리를 내리고 몸 전체가 물속에 잠겨 있어요.'; } };
    } },
    { l: 'l04', type: 'water_way', make: function (rng) {
      return { ask: '물 밖으로 높이 솟아 있는 식물은 어느 쪽일까요?', yes: { k: 'water', way: 'emerge' }, no: { k: 'water', way: pick(rng, ['float', 'sink']) },
        ex: function (Y, N) { return '「' + Y + '」 식물은 뿌리는 물 밑에 있고 줄기와 잎이 물 위로 높이 솟아 있어요.'; } };
    } },
    { l: 'l04', type: 'cannot_see', make: function () {
      return { ask: '뿌리가 있는 식물은 어느 쪽일까요?', q: true, cards: [{ k: 'water', way: 'float', murky: true }, { k: 'water', way: 'float', murky: true }],
        ex: function () { return '물이 흐려서 물속이 보이지 않아요. 보이지 않는다고 뿌리가 없는 것은 아니에요 — 부레옥잠처럼 떠서 사는 식물도 물속에 뿌리가 있어요.'; } };
    } },
    // l05 사막 식물 — 가시 · 줄기에 저장 · 잎에 저장
    { l: 'l05', type: 'desert_store', make: function (rng) {
      return { ask: '잎이 가시로 변한 식물은 어느 쪽일까요?', yes: { k: 'desert', kind: 'cactus' }, no: { k: 'desert', kind: pick(rng, ['leafy', 'rosette']) },
        ex: function (Y, N) { return '「' + Y + '」 식물은 넓은 잎 대신 가시가 나 있어요. 잎이 가시로 변해 물이 빠져나가는 것을 막아요.'; } };
    } },
    { l: 'l05', type: 'desert_store', make: function () {
      return { ask: '줄기에 물을 저장하는 식물은 어느 쪽일까요?', yes: { k: 'desert', kind: 'cactus' }, no: { k: 'desert', kind: 'rosette' },
        ex: function (Y, N) { return '「' + Y + '」 식물은 줄기가 굵고 통통해요 — 줄기에 물을 저장해요. 「' + N + '」 식물은 두툼한 잎에 저장해요.'; } };
    } },
    { l: 'l05', type: 'desert_store', make: function () {
      return { ask: '잎에 물을 저장하는 식물은 어느 쪽일까요?', yes: { k: 'desert', kind: 'rosette' }, no: { k: 'desert', kind: 'cactus' },
        ex: function (Y, N) { return '「' + Y + '」 식물은 잎이 두툼해요 — 잎에 물을 저장해요. 「' + N + '」 식물은 굵은 줄기에 저장해요.'; } };
    } },
    { l: 'l05', type: 'cannot_see', make: function (rng) {
      var c = rng() < 0.5;
      return { ask: '뿌리가 더 넓게 뻗은 식물은 어느 쪽일까요?', q: true, cards: [{ k: 'desert', kind: c ? 'cactus' : 'leafy', soil: true }, { k: 'desert', kind: c ? 'leafy' : 'cactus', soil: true }],
        ex: function () { return '뿌리는 땅속에 있어 그림에 보이지 않아요. 보이지 않는 것은 짐작하지 말고, 파 보거나 자료를 찾아 확인해요.'; } };
    } }
  ];

  function build(t, k, rng) {
    var m = t.make(rng), cards, answer;
    if (m.q) { cards = m.cards; answer = 'q'; }
    else if (rng() < 0.5) { cards = [m.yes, m.no]; answer = 'a'; }
    else { cards = [m.no, m.yes]; answer = 'b'; }
    var Y = answer === 'b' ? '나' : '가', N = answer === 'b' ? '가' : '나';
    return { id: 'op' + k, l: t.l, type: t.type, ask: m.ask, cards: cards.map(function (c) { return { svg: draw(c) }; }),
             answer: answer, explain: m.ex(Y, N), prompt: m.ask };
  }

  return {
    id: 'observe_plant',
    title: '관찰 고르기 — 식물의 생활',
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
