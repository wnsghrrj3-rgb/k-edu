/* ============================================================
 * 영어 놀이터 — 손 쓰기 엔진(PlayWrite) (설계 v2 §8-4 · W14)
 *   입력 = 포인터(손가락·펜·마우스)의 획. 영어 공책 네 줄 위, 글자마다 한 칸. 한 화면에 한 낱말.
 *   세 모드: 따라(trace — 유령 진하게 + 시작 점 + 획 차례 시범) → 옅게(faint — 유령 옅게) → 혼자(free — 칸만).
 *   판정은 모양 맞춤이지 글씨체 평가가 아니다 — 글씨 점수 노출 0 · 「틀렸다」 0.
 *     따라·옅게: 본(글자 자료의 길)을 따라 찍은 표본 점 중 잉크가 가까운 비율 ≥ cover 이고, 잉크 중 길에서 먼 비율 ≤ stray.
 *     혼자: 칸 안 잉크를 크기 맞춘 점 구름으로 바꿔 그 글자 본과의 평균 거리 ≤ free 이고, 같은 크기 글자 26 가운데 그 글자가 가장 가깝다(gap 안).
 *           어디에 얼마나 크게 썼는지는 안 본다. 헷갈리는 글자(b·d·p·q · n·h · a·o) 쪽이 더 가까우면 실패가 아니라 시범(글자가 돌아서 제자리로) 뒤 다시.
 *     두 번 안 되면 옅게, 세 번째는 따라, 따라에서도 두 번 안 되면 같이 쓴다 — 끝은 반드시 난다(assisted).
 *   쓰는 도중에 끊기지 않게: 획마다 따로 덮였는지 본다(f·t 의 가로 획, i·j 의 점을 안 쓰고는 통과 안 됨) · 손을 뗄 때 저절로 통과되는 것은 거의 다 썼을 때만(coverAuto),
 *     「다 썼어요」를 누르면 설계 문턱(cover)으로 본다 · 이미 된 칸에도 잉크는 계속 나온다(마저 쓰는 획 — 낱말이 끝날 때까지) · 한 번에 한 손가락.
 *   잘 쓴 글자는 바뀐다: 칸이 초록으로 · 잉크가 또렷해지고 · 귀퉁이에 인쇄 글자 도장이 찍힌다(쓰기 전에는 화면에 그 글자가 없다).
 *   차례 요구(strict)는 글자 길(#30)에서만: 시작 점을 눌러야 잉크가 나오고, 획을 차례대로 하나씩 따라간다.
 *   통과한 글씨는 획으로 남긴다: localStorage 'kedu-en-play-ink'(kedu_scope 규칙 그대로 — 동의 전에는 이 화면 동안만).
 *     낱말마다 처음 것 + 가장 최근 것, 모두 keep 건까지. 서버 전송 0.
 *   남긴 획은 어디에나 다시 그린다: PlayWrite.draw(ink, ctx, box)(캔버스) · PlayWrite.svg(ink)(화면 조각) · PlayWrite.face(낱말, 인쇄 글씨)(읽기 카드).
 *   움직임 줄이기 설정이면 획 시범은 멈춘 그림(차례 숫자만).
 *   문턱 값은 CONF 한 곳 — 준호가 태블릿에서 아이 글씨로 맞춘다.
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    cell: { w: 90, h: 120 },      /* 글자 한 칸(그림 단위 — 너비 : 높이 = 글자 자료의 ASPECT). 화면에서는 높이 96px 이상(play.css .pw-svg) */
    space: { word: 0.45, mark: 0.3 },  /* 낱말 사이 · 문장 부호 자리(칸 너비의 몫) */
    /* 따라·옅게 — 길 덮임 */
    samples: 40,                  /* 본에서 찍는 표본 점 수 */
    near: 0.065,                  /* 표본 점에서 잉크가 이 안이면 「덮였다」(칸 높이 = 1 — 작은 글자의 키가 0.3) */
    far: 0.11,                    /* 잉크가 길에서 이보다 멀면 「벗어났다」 */
    cover: 0.8, stray: 0.25,
    coverEach: 0.7,               /* 획마다 따로 이만큼은 덮여야 한다(세로 획만 쓴 f·t, 점을 안 찍은 i·j 가 통과되지 않게) */
    coverAuto: 0.92,              /* 손을 뗄 때 저절로 통과되는 덮임 — 쓰는 도중에 끊기지 않게 높다(「다 썼어요」는 cover) */
    extra: 0.5,                   /* 이미 된 칸에 더 쓴 획 — 길에서 벗어난 몫이 이보다 크면 지운다 */
    edge: 0.15,                   /* 칸 경계에서 이만큼(칸 너비의 몫) 안에서 시작했고 그 칸은 이미 됐으면, 옆의 아직 안 된 칸의 획으로 */
    /* 혼자 — 점 구름 거리 */
    cloudN: 48,                   /* 점 구름의 점 수 */
    free: 0.12,                   /* 본과의 평균 거리 문턱(글자의 긴 변 = 1) */
    gap: 0.015,                   /* 다른 글자가 이만큼 넘게 더 가까우면 그 글자로 본다(같은 크기 글자 26 과 견준다) */
    minSize: 0.14,                /* 이보다 작은 잉크는 아직 글자가 아니다(칸 높이 = 1) */
    /* 도움 단계 */
    faintAfter: 2,                /* 혼자에서 이만큼 안 되면 옅게 */
    traceAfter: 1,                /* 옅게에서 이만큼 안 되면 따라 */
    giveAfter: 2,                 /* 따라에서 이만큼 안 되면 같이 쓴다(끝) */
    strokeMiss: 2,                /* 차례 요구에서 한 획이 이만큼 안 되면 시범을 다시 */
    startR: 0.2,                  /* 시작 점을 눌렀다고 보는 거리(칸 높이 = 1) */
    ghost: { trace: 0.4, faint: 0.15 },   /* 유령 글씨 진하기 */
    /* 저장 */
    keep: 300,                    /* 남기는 글씨 건수(처음 + 최근을 따로 센다) */
    maxPts: 16,                   /* 획마다 남기는 점 수 */
    /* 움직임(ms) */
    demoMs: 650, flipMs: 600, okMs: 350
  };
  var KEY = 'kedu-en-play-ink', PREF = 'kedu-en-play-pref';
  var LV = ['free', 'faint', 'trace'];
  function LT() { return g.PLAY_LETTERS || { glyphs: {}, LINES: { top: 0.16, mid: 0.4, base: 0.7, low: 0.94 }, ASPECT: 0.75, CONFUSE: {} }; }
  function glyph(ch) { var G = LT().glyphs; return Object.prototype.hasOwnProperty.call(G, ch) ? G[ch] : null; }
  function isLetter(ch) { return !!glyph(ch); }
  function dayStr(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  /* ── 모양 재기 — 칸 좌표(0~1)를 높이 기준 좌표로 바꿔서 잰다(칸이 세로로 길다) ── */
  function px(p) { return [p[0] * LT().ASPECT, p[1]]; }
  function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return Math.sqrt(dx * dx + dy * dy); }
  function minDist(p, pts) { var m = Infinity, i, d; for (i = 0; i < pts.length; i++) { d = dist(p, pts[i]); if (d < m) m = d; } return m; }
  /* 획들을 길 따라 고르게 n 점쯤으로(높이 기준 좌표) */
  function sample(strokes, n) {
    var segs = (strokes || []).filter(function (s) { return s && s.length; }).map(function (s) { return s.map(px); }), total = 0, out = [];
    var lens = segs.map(function (s) { var l = 0, i; for (i = 1; i < s.length; i++) l += dist(s[i - 1], s[i]); total += l; return l; });
    segs.forEach(function (s, k) {
      out.push(s[0].slice());
      if (lens[k] <= 1e-6 || total <= 1e-6) return;
      var m = Math.max(1, Math.round(n * lens[k] / total)), step = lens[k] / m, need = step, i, a, b, d, pos, t;
      for (i = 1; i < s.length; i++) {
        a = s[i - 1]; b = s[i]; d = dist(a, b); pos = 0;
        while (d > 0 && d - pos >= need - 1e-9) { pos += need; t = pos / d; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); need = step; }
        need -= (d - pos);
      }
    });
    return out;
  }
  function box(pts) { var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; pts.forEach(function (p) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
  /* 점 구름 — 가운데로 옮기고 긴 변을 1 로 */
  function norm(pts) { var b = box(pts), s = Math.max(b.w, b.h) || 1, cx = b.x + b.w / 2, cy = b.y + b.h / 2; return pts.map(function (p) { return [(p[0] - cx) / s, (p[1] - cy) / s]; }); }
  function cloudDist(A, B) { var a = 0, b = 0; A.forEach(function (p) { a += minDist(p, B); }); B.forEach(function (p) { b += minDist(p, A); }); return (a / A.length + b / B.length) / 2; }
  var CLOUD = {};
  function cloudOf(ch) { if (!CLOUD[ch]) CLOUD[ch] = norm(sample(glyph(ch), CONF.cloudN)); return CLOUD[ch]; }

  /* 따라·옅게 — 길 덮임. ink = 칸 좌표의 획들. only = 그 획 하나만 볼 때(차례 요구) */
  function judgeTrace(ch, ink, only) {
    var gl = glyph(ch); if (!gl) return { ok: false };
    if (only != null) gl = [gl[only]];
    var tm = sample(gl, CONF.samples), dense = sample(gl, CONF.samples * 2), ik = sample(ink, CONF.samples * 2);
    if (!ik.length) return { ok: false, empty: true, cover: 0, stray: 0 };
    var cover = tm.filter(function (p) { return minDist(p, ik) <= CONF.near; }).length / tm.length;
    var stray = ik.filter(function (p) { return minDist(p, dense) > CONF.far; }).length / ik.length;
    var each = 1;
    if (gl.length > 1) gl.forEach(function (s) { var sm = sample([s], Math.max(4, Math.round(CONF.samples / gl.length))), c = sm.filter(function (p) { return minDist(p, ik) <= CONF.near; }).length / sm.length; if (c < each) each = c; });
    return { ok: cover >= CONF.cover && each >= CONF.coverEach && stray <= CONF.stray, cover: cover, each: each, stray: stray };
  }
  /* 혼자 — 점 구름 거리. 헷갈리는 글자 쪽이 더 가까우면 confused 에 그 글자 */
  function judgeFree(ch, ink) {
    if (!glyph(ch)) return { ok: false };
    var ik = sample(ink, CONF.cloudN); if (ik.length < 2) return { ok: false, empty: true };
    var b = box(ik); if (Math.max(b.w, b.h) < CONF.minSize) return { ok: false, small: true };
    var A = norm(ik), dT = cloudDist(A, cloudOf(ch)), best = ch, dB = dT;
    sameCase(ch).forEach(function (c) { if (c === ch) return; var d = cloudDist(A, cloudOf(c)); if (d < dB) { dB = d; best = c; } });
    var near = dT <= dB + CONF.gap;                                   /* 그 글자가 가장 가깝거나, 가장 가까운 것과 거의 같다 */
    var confused = !near && dB <= CONF.free && (LT().CONFUSE[ch] || []).indexOf(best) >= 0 ? best : null;
    return { ok: dT <= CONF.free && near, dist: dT, best: best, confused: confused };
  }
  /* 견줄 글자들 — 같은 크기(소문자끼리·대문자끼리) */
  var CASES = null;
  function sameCase(ch) {
    if (!CASES) { CASES = { low: [], up: [] }; Object.keys(LT().glyphs).forEach(function (k) { CASES[k === k.toLowerCase() ? 'low' : 'up'].push(k); }); }
    return CASES[ch === ch.toLowerCase() ? 'low' : 'up'];
  }

  /* ── 낱말·문장의 자리 — 글자는 한 칸씩, 띄어쓰기·문장 부호는 좁은 자리 ── */
  function layout(text) {
    var CW = CONF.cell.w, x = 0, n = 0, items = [];
    String(text == null ? '' : text).split('').forEach(function (ch) {
      var letter = isLetter(ch), w = letter ? CW : CW * (ch === ' ' ? CONF.space.word : CONF.space.mark);
      items.push({ ch: ch, letter: letter, x: x, w: w, i: letter ? n++ : -1 }); x += w;
    });
    return { items: items, width: x || CW, letters: n };
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function pathD(strokes, ox) {
    var CW = CONF.cell.w, CH = CONF.cell.h;
    return (strokes || []).map(function (s) { if (!s.length) return ''; var one = s.length === 1 ? s.concat([s[0]]) : s; return one.map(function (p, i) { return (i ? 'L' : 'M') + r1(ox + p[0] * CW) + ' ' + r1(p[1] * CH); }).join(''); }).join('');
  }
  function linesHtml(W) {
    var CH = CONF.cell.h, L = LT().LINES;
    return ['top', 'mid', 'base', 'low'].map(function (k) { return '<line class="pw-line pw-' + k + '" x1="0" x2="' + r1(W) + '" y1="' + r1(L[k] * CH) + '" y2="' + r1(L[k] * CH) + '"/>'; }).join('');
  }
  function markHtml(it) { return it.ch === ' ' ? '' : '<text class="pw-mark" x="' + r1(it.x + it.w / 2) + '" y="' + r1(LT().LINES.base * CONF.cell.h) + '" text-anchor="middle">' + esc(it.ch) + '</text>'; }

  /* ── 저장 — 낱말마다 처음 것(f) + 가장 최근 것(l) ── */
  function load() { try { var d = JSON.parse(g.localStorage.getItem(KEY)); if (d && d.items) return d; } catch (e) {} return { v: 1, items: {} }; }
  function save(d) { try { g.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function thin(st) { var n = CONF.maxPts, out = [], i, k, last = -1; if (st.length <= n) return st; for (i = 0; i < n; i++) { k = Math.round(i * (st.length - 1) / (n - 1)); if (k !== last) out.push(st[k]); last = k; } return out; }
  function clampN(v) { return Math.round(Math.max(-0.3, Math.min(1.3, v)) * 100); }
  function pack(cells) { return cells.map(function (c) { return (c || []).map(function (st) { var f = []; thin(st).forEach(function (p) { f.push(clampN(p[0]), clampN(p[1])); }); return f; }); }); }
  function unpack(c) { return (c || []).map(function (cell) { return (cell || []).map(function (f) { var st = [], i; for (i = 0; i + 1 < f.length; i += 2) st.push([f[i] / 100, f[i + 1] / 100]); return st; }); }); }
  function count(d) { var n = 0; Object.keys(d.items).forEach(function (k) { n += d.items[k].l ? 2 : 1; }); return n; }
  function trim(d) {
    while (count(d) > CONF.keep) {
      var ks = Object.keys(d.items), old = ks[0];
      ks.forEach(function (k) { var a = d.items[k], b = d.items[old]; if ((a.l || a.f).d < (b.l || b.f).d) old = k; });
      delete d.items[old];
    }
  }
  function view(it) { return { text: it.t, cells: unpack((it.l || it.f).c), first: unpack(it.f.c), day: (it.l || it.f).d, firstDay: it.f.d, n: it.n || 1, again: !!it.l }; }

  /* ── 손 쓰는 판 ── */
  function reduced() { try { return !!(g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
  function pad(host, o) {
    o = o || {};
    var doc = g.document, text = String(o.text || ''), lay = layout(text), CW = CONF.cell.w, CH = CONF.cell.h, NS = 'http://www.w3.org/2000/svg';
    var start = Math.max(0, LV.indexOf(o.mode || 'free')), strict = !!o.strict, IC = function (n) { return g.PlayIcon ? g.PlayIcon.html(n) : ''; };
    var root = doc.createElement('div'); root.className = 'pw' + (strict ? ' strict' : ''); root.setAttribute('data-text', text);
    root.style.setProperty('--pw-trace', CONF.ghost.trace); root.style.setProperty('--pw-faint', CONF.ghost.faint);
    root.innerHTML = '<div class="pw-sheet"><svg class="pw-svg" viewBox="0 0 ' + r1(lay.width) + ' ' + CH + '" role="img" aria-label="글씨 쓰는 자리">' + linesHtml(lay.width) +
      lay.items.map(function (it) {
        if (!it.letter) return markHtml(it);
        var gl = glyph(it.ch);
        return '<g class="pw-cell" data-i="' + it.i + '" data-ch="' + it.ch + '"><rect class="pw-box" x="' + r1(it.x + 3) + '" y="3" width="' + (CW - 6) + '" height="' + (CH - 6) + '" rx="10"/>' +
          '<path class="pw-ghost" d="' + pathD(gl, it.x) + '"/><g class="pw-inks"></g><g class="pw-demos"></g>' +
          gl.map(function (s, k) { return '<circle class="pw-start" data-k="' + k + '" cx="' + r1(it.x + s[0][0] * CW) + '" cy="' + r1(s[0][1] * CH) + '" r="6"/>' + (gl.length > 1 ? '<text class="pw-num" data-k="' + k + '" x="' + r1(it.x + s[0][0] * CW) + '" y="' + r1(s[0][1] * CH - 9) + '" text-anchor="middle">' + (k + 1) + '</text>' : ''); }).join('') + '</g>';
      }).join('') + '</svg></div>' +
      '<div class="pw-bar"><button type="button" class="btn w pw-demo" title="시범 보기">' + IC('eye') + '</button><button type="button" class="btn w pw-clear" title="지우기">' + IC('eraser') + '</button><button type="button" class="btn pw-ok" title="다 썼어요">' + IC('check') + '</button></div>';
    host.appendChild(root);
    var svgEl = root.querySelector('.pw-svg'), finished = false, resolveDone, done = new Promise(function (r) { resolveDone = r; }), cur = null, timers = [];
    var cells = lay.items.filter(function (it) { return it.letter; }).map(function (it) {
      var el = root.querySelector('.pw-cell[data-i="' + it.i + '"]');
      return { i: it.i, ch: it.ch, x: it.x, el: el, inks: el.querySelector('.pw-inks'), demos: el.querySelector('.pw-demos'), level: start, at: 0, fails: 0, miss: 0, k: 0, conf: 0, helped: false, given: false, ok: false, strokes: [], lines: [] };
    });
    function later(ms, fn) { var t = setTimeout(function () { if (root.parentNode) fn(); }, ms); timers.push(t); return t; }
    function paint(c) {
      c.el.setAttribute('data-level', LV[c.level]); c.el.classList.toggle('ok', c.ok); c.el.classList.toggle('given', c.given);
      Array.prototype.forEach.call(c.el.querySelectorAll('.pw-start,.pw-num'), function (e) { var k = +e.getAttribute('data-k'); e.classList.toggle('now', !c.ok && (strict ? k === c.k : true)); e.classList.toggle('done', strict && k < c.k); });
      root.setAttribute('data-mode', LV[Math.max.apply(null, cells.map(function (x) { return x.level; }))]);
    }
    function line(c, st, cls) { var e = doc.createElementNS(NS, 'path'); e.setAttribute('class', 'pw-ink' + (cls ? ' ' + cls : '')); e.setAttribute('d', pathD([st], c.x)); c.inks.appendChild(e); return e; }
    function clearInk(c) { c.strokes = []; c.lines = []; c.k = 0; c.miss = 0; c.inks.innerHTML = ''; }
    function wobble(c) { c.el.classList.remove('no'); try { void c.el.getBoundingClientRect(); } catch (e) {} c.el.classList.add('no'); }
    /* 획 차례 시범 — 움직임 줄이기면 멈춘 그림 */
    function demo(c) {
      var gl = glyph(c.ch), still = reduced();
      c.demos.innerHTML = gl.map(function (s, k) { return '<path class="pw-demo-line' + (still ? ' still' : '') + '" pathLength="1" style="animation-delay:' + (k * CONF.demoMs) + 'ms;animation-duration:' + CONF.demoMs + 'ms" d="' + pathD([s], c.x) + '"/>'; }).join('');
      c.el.classList.add('demo'); if (o.onDemo) o.onDemo(c.i, c.ch);
      return new Promise(function (r) { later(still ? 0 : gl.length * CONF.demoMs + 120, function () { if (!still) { c.demos.innerHTML = ''; c.el.classList.remove('demo'); } r(); }); });
    }
    function finish() {
      if (finished) return; finished = true; root.classList.add('done');
      var clean = cells.every(function (c) { return start === 0 && c.level === 0 && !c.fails && !c.conf && !c.helped && !c.given; });
      var ghost = cells.some(function (c) { return c.level > 0 || c.given; }), given = cells.filter(function (c) { return c.given; }).length;
      var res = { ok: true, text: text, cells: cells.map(function (c) { return c.strokes.map(function (s) { return s.slice(); }); }), clean: clean, support: ghost ? 'ghost' : cells.some(function (c) { return c.helped || c.conf; }) ? 'model' : 'none',      /* 받은 도움 — 유령 글씨 > 시범 > 없음(다시 써서 된 것은 도움 없이 여러 번) */
        attempts: 1 + Math.max.apply(null, cells.map(function (c) { return c.fails; }).concat([0])), given: given, allGiven: cells.length > 0 && given === cells.length, modes: cells.map(function (c) { return LV[c.level]; }) };
      later(CONF.okMs, function () { resolveDone(res); });
    }
    /* 잘 쓴 글자의 도장 — 귀퉁이에 인쇄 글자(통과한 뒤에만 생긴다) */
    function stamp(c) { var t = doc.createElementNS(NS, 'text'); t.setAttribute('class', 'pw-got'); t.setAttribute('x', r1(c.x + CW - 15)); t.setAttribute('y', 24); t.setAttribute('text-anchor', 'middle'); t.textContent = c.ch; c.el.appendChild(t); }
    function pass(c) { c.ok = true; paint(c); stamp(c); if (o.onLetter) o.onLetter(c.i, c.ch, { mode: LV[c.level], fails: c.fails, given: c.given }); if (cells.every(function (x) { return x.ok; })) finish(); }
    function give(c) { clearInk(c); c.given = true; c.strokes = glyph(c.ch).map(function (s) { return s.map(function (p) { return p.slice(); }); }); c.strokes.forEach(function (s) { c.lines.push(line(c, s, 'given')); }); pass(c); }
    function failCell(c, why) {
      c.fails++; c.at++; wobble(c); clearInk(c);
      var up = false;
      if (c.level === 0 && c.at >= CONF.faintAfter) { c.level = 1; c.at = 0; up = true; }
      else if (c.level === 1 && c.at >= CONF.traceAfter) { c.level = 2; c.at = 0; up = true; }
      else if (c.level === 2 && c.at >= CONF.giveAfter) { paint(c); if (o.onMiss) o.onMiss(c.i, c.ch, { fails: c.fails, mode: 'give', why: why }); return demo(c).then(function () { if (!c.ok) give(c); }); }
      paint(c); if (o.onMiss) o.onMiss(c.i, c.ch, { fails: c.fails, mode: LV[c.level], why: why });
      if (c.level === 2 && (up || why === 'stroke')) demo(c);
    }
    /* 헷갈린 글자 — 처음엔 실패로 세지 않고, 쓴 글씨가 돌아서 제자리로 가는 것을 보여 준 뒤 다시 */
    function confused(c, other) {
      if (c.conf) return failCell(c, 'confused');
      c.conf = 1; c.helped = true; c.el.classList.add('flip'); if (o.onConfuse) o.onConfuse(c.i, c.ch, other);
      later(reduced() ? 0 : CONF.flipMs, function () { c.el.classList.remove('flip'); clearInk(c); paint(c); demo(c); });
    }
    function strictNow(c) { return strict && c.level > 0; }
    function endStroke(c, st, ln, extra) {
      var gl = glyph(c.ch), r;
      if (extra || c.ok || finished) {       /* 이미 된 칸·이미 된 획에 마저 쓴 획 — 길 근처면 남기고(저장되는 글씨에도 든다), 벗어났으면 조용히 지운다 */
        var ex = sample([st], 12), dn = sample(gl, CONF.samples * 2);
        if (!finished && !c.given && ex.filter(function (p) { return minDist(p, dn) > CONF.far; }).length / ex.length <= CONF.extra) { c.strokes.push(st); c.lines.push(ln); }
        else if (ln.parentNode) ln.parentNode.removeChild(ln);
        return;
      }
      if (strictNow(c)) {
        r = judgeTrace(c.ch, [st], c.k);
        if (r.ok) { c.strokes.push(st); c.lines.push(ln); ln.setAttribute('class', 'pw-ink done'); c.k++; c.miss = 0; if (c.k >= gl.length) return pass(c); return paint(c); }
        if (ln.parentNode) ln.parentNode.removeChild(ln); c.miss++;
        if (c.miss >= CONF.strokeMiss) { c.miss = 0; failCell(c, 'stroke'); }
        return;
      }
      c.strokes.push(st); c.lines.push(ln);
      if (c.level === 0) { if (c.strokes.length >= gl.length) { r = judgeFree(c.ch, c.strokes); if (r.ok) return pass(c); if (r.confused) return confused(c, r.confused); } }
      else { r = judgeTrace(c.ch, c.strokes); if (r.ok && r.cover >= CONF.coverAuto) pass(c); }      /* 덜 썼으면 기다린다 — 「다 썼어요」를 누르면 그때 본다 */
    }
    /* 「다 썼어요」 — 아직 안 된 칸을 지금 본다 */
    function check() {
      if (finished) return;
      cells.filter(function (c) { return !c.ok; }).forEach(function (c) {
        if (strictNow(c) || !c.strokes.length) return wobble(c);
        var r = c.level === 0 ? judgeFree(c.ch, c.strokes) : judgeTrace(c.ch, c.strokes);
        if (r.ok) pass(c); else if (r.confused) confused(c, r.confused); else failCell(c, 'shape');
      });
    }
    /* 포인터 → 그림 좌표. 크기를 모르는 자리(검사 환경)에서는 그림 단위 그대로 */
    function toVB(ev) { var r = svgEl.getBoundingClientRect ? svgEl.getBoundingClientRect() : null; if (!r || !r.width) return [ev.clientX || 0, ev.clientY || 0]; return [(ev.clientX - r.left) * lay.width / r.width, (ev.clientY - r.top) * CH / r.height]; }
    function cellAt(x) {
      var hit = null, i, f, nb;
      for (i = 0; i < cells.length; i++) if (x >= cells[i].x && x < cells[i].x + CW) hit = cells[i];
      if (hit && hit.ok) {       /* 옆 칸 글자의 획을 경계 너머에서 시작한 것(가로 획이 긴 f·t) */
        f = (x - hit.x) / CW; nb = f < CONF.edge ? cells[hit.i - 1] : f > 1 - CONF.edge ? cells[hit.i + 1] : null;
        if (nb && !nb.ok && Math.abs(nb.x - hit.x) <= CW + 1) hit = nb;
      }
      return hit;
    }
    function begin(c, q) {
      if (finished || !c || c.given) return false;
      if (c.ok) { cur = { c: c, pts: [q], ln: line(c, [q]), extra: true }; return true; }       /* 마저 쓰는 획 */
      if (strictNow(c)) { var s0 = glyph(c.ch)[c.k][0]; if (dist(px(q), px(s0)) > CONF.startR) {
          /* 앞 획을 조금 남기고 손을 뗐다가 마저 쓰는 것 — 이미 지나간 길 위에서 시작하면 잉크가 나온다 */
          if (c.k > 0 && minDist(px(q), sample(glyph(c.ch).slice(0, c.k), CONF.samples)) <= CONF.near * 1.5) { cur = { c: c, pts: [q], ln: line(c, [q], 'done'), extra: true }; return true; }
          var dot = c.el.querySelector('.pw-start.now'); if (dot) { dot.classList.remove('pulse'); try { void dot.getBoundingClientRect(); } catch (e) {} dot.classList.add('pulse'); } return false; } }
      cur = { c: c, pts: [q], ln: line(c, [q]) }; return true;
    }
    function extend(q) { if (!cur) return; var p = cur.pts[cur.pts.length - 1]; if (dist(px(p), px(q)) < 0.012) return; cur.pts.push(q); cur.ln.setAttribute('d', pathD([cur.pts], cur.c.x)); }
    function end() { if (!cur) return; var x = cur; cur = null; endStroke(x.c, x.pts, x.ln, x.extra); }
    var same = function (ev) { return !cur || cur.id == null || ev.pointerId == null || ev.pointerId === cur.id; };      /* 한 번에 한 손가락 — 다른 손가락·손바닥은 지금 획을 끊지 않는다 */
    svgEl.addEventListener('pointerdown', function (ev) { if (cur) return; var p = toVB(ev), c = cellAt(p[0]); if (!c) return; if (begin(c, [(p[0] - c.x) / CW, p[1] / CH])) { cur.id = ev.pointerId; if (ev.preventDefault) ev.preventDefault(); try { svgEl.setPointerCapture(ev.pointerId); } catch (e) {} } });
    svgEl.addEventListener('pointermove', function (ev) { if (!cur || !same(ev)) return; var p = toVB(ev); extend([(p[0] - cur.c.x) / CW, p[1] / CH]); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { svgEl.addEventListener(n, function (ev) { if (same(ev)) end(); }); });
    root.querySelector('.pw-ok').onclick = check;
    root.querySelector('.pw-clear').onclick = function () { if (finished) return; cells.forEach(function (c) { if (!c.ok) { clearInk(c); paint(c); } }); };
    root.querySelector('.pw-demo').onclick = function () { if (finished) return; var c = cells.filter(function (x) { return !x.ok; })[0]; if (c) { c.helped = true; demo(c); } };
    cells.forEach(paint);
    if (!cells.length) finish();
    else if (start === 2 && o.demo !== false) demo(cells[0]);
    root.style.setProperty('--pw-n', r1(lay.width / CW));
    var api = {
      el: root, done: done, cells: cells, check: check,
      /* 한 획을 넣는다(칸 좌표의 점들) — 포인터가 하는 일과 같다. 하네스가 쓴다 */
      stroke: function (i, pts) { var c = cells[i]; if (!c || !pts || !pts.length) return false; if (!begin(c, pts[0].slice())) return false; pts.slice(1).forEach(function (p) { extend(p.slice()); }); end(); return true; },
      demo: function (i) { return cells[i] ? demo(cells[i]) : Promise.resolve(); },
      mode: function (i) { return cells[i] ? LV[cells[i].level] : null; },
      destroy: function () { timers.forEach(clearTimeout); if (root.parentNode) root.parentNode.removeChild(root); }
    };
    root.__pad = api;      /* 화면의 판에서 바로 닿게(점검·하네스) */
    return api;
  }

  var PlayWrite = {
    CONF: CONF, KEY: KEY, MODES: LV.slice(),
    available: function () { return !!(g.PLAY_LETTERS && g.document); },
    reduced: reduced,
    glyph: glyph, isLetter: isLetter, layout: layout, sample: sample, norm: norm, cloudDist: cloudDist,
    judgeTrace: judgeTrace, judgeFree: judgeFree,
    /* 그 글에서 손으로 쓸 글자 수(하루 상한을 셀 때) */
    letters: function (text) { return layout(text).letters; },
    /* 어른 메뉴 「손 쓰기 대신 조각으로」 — 화면 설정(kedu-en-play-pref 의 tiles · PlayGame.pref 와 같은 자리). 홈·공책이 여기로 켜고 끈다 */
    tiles: function () { try { return !!(JSON.parse(g.localStorage.getItem(PREF)) || {}).tiles; } catch (e) { return false; } },
    setTiles: function (v) { try { var d = JSON.parse(g.localStorage.getItem(PREF)) || {}; d.tiles = !!v; g.localStorage.setItem(PREF, JSON.stringify(d)); } catch (e) {} },
    pad: pad,
    /* 한 낱말을 쓴다 → Promise({ ok, clean, support, attempts, cells, saved }). 통과한 글씨는 남긴다(전부 같이 쓴 것은 안 남긴다) */
    write: function (host, o) {
      o = o || {};
      var p = pad(host, o);
      return p.done.then(function (res) { res.saved = !res.allGiven && o.keep !== false ? !!PlayWrite.keep(o.key || res.text, res.cells, { text: res.text }) : false; res.pad = p; return res; });
    },
    /* ── 남긴 글씨 ── */
    keep: function (key, cells, o) {
      o = o || {};
      var d = load(), rec = { d: o.day || dayStr(), c: pack(cells) }, it = d.items[key];
      if (!it) d.items[key] = { t: o.text || key, f: rec, l: null, n: 1 }; else { it.l = rec; it.n = (it.n || 1) + 1; }
      trim(d); save(d); return rec;
    },
    ink: function (key) { var it = load().items[key]; return it ? view(it) : null; },
    all: function () { var d = load(); return Object.keys(d.items).map(function (k) { var v = view(d.items[k]); v.key = k; return v; }).sort(function (a, b) { return a.day < b.day ? 1 : a.day > b.day ? -1 : 0; }); },
    count: function () { return count(load()); },
    _reset: function () { try { g.localStorage.removeItem(KEY); } catch (e) {} },
    /* 화면 조각 — o.first 면 처음 글씨, o.lines 면 공책 줄도 */
    svg: function (ink, o) {
      o = o || {};
      var it = typeof ink === 'string' ? PlayWrite.ink(ink) : ink; if (!it) return '';
      var lay = layout(it.text), cells = o.first ? it.first : it.cells;
      return '<svg class="pw-face' + (o.cls ? ' ' + o.cls : '') + '" viewBox="0 0 ' + r1(lay.width) + ' ' + CONF.cell.h + '" role="img" aria-label="' + esc(it.text) + '">' + (o.lines ? linesHtml(lay.width) : '') +
        lay.items.map(function (x) { return x.letter ? '<path class="pw-ink" d="' + pathD(cells[x.i] || [], x.x) + '"/>' : markHtml(x); }).join('') + '</svg>';
    },
    /* 읽기 카드의 얼굴 — 그 낱말을 아이가 쓴 적이 있으면 아이 글씨로, 없으면 인쇄 글씨(fallback) 그대로 */
    face: function (word, fallback) {
      var it = PlayWrite.ink(word);
      if (!it || it.cells.length !== layout(word).letters || !it.cells.every(function (c) { return c && c.length; })) return fallback == null ? esc(word) : fallback;
      return '<span class="pw-mine" data-w="' + esc(word) + '">' + PlayWrite.svg(it) + '<span class="pw-sr">' + esc(word) + '</span></span>';
    },
    /* 캔버스에 그린다 — box = { x, y, w, h } 안에 맞춰서 */
    draw: function (ink, ctx, bx, o) {
      o = o || {};
      var it = typeof ink === 'string' ? PlayWrite.ink(ink) : ink; if (!it || !ctx) return false;
      var lay = layout(it.text), cells = o.first ? it.first : it.cells, CW = CONF.cell.w, CH = CONF.cell.h;
      bx = bx || { x: 0, y: 0, w: lay.width, h: CH };
      var s = Math.min(bx.w / lay.width, bx.h / CH), ox = bx.x + (bx.w - lay.width * s) / 2, oy = bx.y + (bx.h - CH * s) / 2;
      if (ctx.save) ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(1.5, CH * s * 0.055); ctx.beginPath();
      lay.items.forEach(function (x) {
        if (!x.letter) return;
        (cells[x.i] || []).forEach(function (st) {
          st.forEach(function (p, i) { var X = ox + (x.x + p[0] * CW) * s, Y = oy + p[1] * CH * s; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
          if (st.length === 1) ctx.lineTo(ox + (x.x + st[0][0] * CW) * s + 0.1, oy + st[0][1] * CH * s);
        });
      });
      ctx.stroke(); if (ctx.restore) ctx.restore();
      return true;
    }
  };
  g.PlayWrite = PlayWrite;
})(window);
