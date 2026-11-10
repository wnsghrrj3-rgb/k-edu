/* ============================================================
 * 영어 놀이터 — 놀이 #17 「톡톡 듣기(두더지)」(PlayPop) (게임설계 v1 §4-17)
 *   카운터 구멍 넷에서 음식이 톡톡 올라온다 → 들린 것을 누른다.
 *   판마다 조금 빨라지고, 놓치거나 다른 걸 누르면 조금 느려진다. 놓친 것은 곧 다시 올라온다.
 *   실패로 끝나는 길이 없다 — 숫자 시계·점수·목숨 없음. 긴장은 톡톡 올라오는 흐름으로만.
 *
 *   공통 인터페이스(core/game.js): start(ctx) → Promise({ completed, results:[{word, clean}] })   clean = 다른 것을 한 번도 안 누르고 맞힘
 *     증거 = 듣기(listen) · touch · clean 이면 independent, 아니면 assisted
 *   PlayPop.machine(targets, pool) — 화면 없는 흐름(빠르기·무엇이 올라올지). 검사는 여기를 직접 본다.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 보고 바꾼다 ── */
  var CONF = {
    holes: 4,            /* 구멍 수 */
    rounds: 6,           /* 판 수 */
    upStart: 2000,       /* 첫 판에서 음식이 올라와 있는 시간(ms) ← 「두더지 첫 속도」 */
    upMin: 1100,         /* 아무리 빨라져도 이보다 짧게는 안 머문다 */
    upMax: 2800,         /* 아무리 느려져도 이보다 길게는 안 머문다 */
    faster: 0.9,         /* 판이 바뀔 때마다 머무는 시간 × 이 값 */
    easier: 1.2,         /* 놓치거나 다른 걸 누르면 머무는 시간 × 이 값 */
    overlap: 0.62,       /* 다음 것이 올라오는 간격 = 머무는 시간 × 이 값 (둘쯤 같이 보인다) */
    targetWithin: 3,     /* 들린 것은 적어도 이 횟수 안에 한 번은 올라온다 */
    firstDelay: 450,     /* 단어를 들려준 뒤 첫 음식이 올라오기까지 */
    nextRound: 800,      /* 맞힌 뒤 다음 판까지 */
    sayMax: 4000         /* 음성이 끝났다는 신호가 안 와도 이만큼 뒤엔 넘어간다 */
  };

  function shuffle(a, rng) { rng = rng || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clamp(v) { return Math.max(CONF.upMin, Math.min(CONF.upMax, Math.round(v))); }

  /* 화면 없는 흐름 */
  function machine(targets, pool, o) {
    o = o || {};
    var rng = o.rng || Math.random, r = -1, up = clamp(CONF.upStart), since = 0, clean = true, alts = [], phase = 'idle', results = [];
    return {
      total: targets.length,
      round: function () { return r; },
      phase: function () { return phase; },
      target: function () { return r >= 0 && r < targets.length ? targets[r] : null; },
      up: function () { return up; },
      results: function () { return results.slice(); },
      /* 다음 판 — 둘째 판부터 조금 빨라진다 */
      start: function () {
        if (r + 1 >= targets.length) { r = targets.length; phase = 'done'; return { type: 'done' }; }
        r++; if (r > 0) up = clamp(up * CONF.faster);
        since = 0; clean = true; phase = 'play';
        alts = shuffle(pool.filter(function (x) { return x !== targets[r]; }), rng).slice(0, Math.max(1, CONF.holes - 1));
        return { type: 'round', target: targets[r], up: up };
      },
      /* 빈 구멍(free) 중 하나에 무엇을 올릴지. showing = 지금 올라와 있는 단어들 */
      nextPop: function (free, showing) {
        var t = targets[r], shown = (showing || []).indexOf(t) >= 0;
        var isT = !shown && (since >= CONF.targetWithin - 1 || rng() < 1 / CONF.targetWithin);
        if (isT) since = 0; else if (!shown) since++;
        return { hole: free[Math.floor(rng() * free.length)], word: isT ? t : alts[Math.floor(rng() * alts.length)] };
      },
      hit: function (w) {
        if (phase !== 'play') return { type: 'ignored' };
        if (w === targets[r]) { phase = 'between'; var res = { word: w, clean: clean }; results.push(res); return { type: 'ok', word: w, clean: clean }; }
        clean = false; up = clamp(up * CONF.easier);
        return { type: 'no' };
      },
      /* 안 눌린 채 내려갔다 — 들린 것이었으면 느려지고, 바로 다음에 다시 올라온다 */
      sunk: function (w) {
        if (phase !== 'play' || w !== targets[r]) return { type: 'none' };
        up = clamp(up * CONF.easier); since = CONF.targetWithin;
        return { type: 'again' };
      }
    };
  }

  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function start(opt) {
    var S = opt.services || {}, tts = S.tts, audio = S.audio || { play: function () {} }, scene = S.scene || g.PlayScene, E = g.PlayEvidence;
    var sam = S.sam || opt.sam || { say: function () { return Promise.resolve(); }, react: function () {} };
    var poolItems = opt.pool || opt.words || opt.targets || [];
    var pic = {}, W = poolItems.map(function (x) { pic[x.w] = x.pic; return x.w; });
    var targets = (opt.targets || shuffle(W).slice(0, CONF.rounds)).map(function (x) { return typeof x === 'string' ? x : x.w; });
    var m = machine(targets, W, { rng: opt.rng });
    var host = opt.host;
    function good(clean) { if (opt.good) opt.good(clean); else { audio.play('ok'); sam.react('ok'); } }
    function oops() { if (opt.oops) opt.oops(); else { audio.play('soft'); sam.react('no'); } }

    host.innerHTML = '';
    var root = h('div', 'pp'), dots = h('div', 'dots');
    root.appendChild(dots);
    var board = scene.holes(root, CONF.holes), holes = board.list;
    holes.forEach(function (hl) { hl.el.onclick = function () { tap(hl); }; });
    var rep = h('button', 'btn w pp-rep', '🔊'); rep.type = 'button';
    rep.onclick = function () { var t = m.target(); if (t) say(t); };
    root.appendChild(rep); host.appendChild(root);

    var loopT = null, lock = true, done;
    var finished = new Promise(function (r) { done = r; });

    function alive() { return root.parentNode === host && (root.isConnected !== false) && !(opt.signal && opt.signal.aborted); }
    function later(ms, fn) { return setTimeout(function () { if (alive()) fn(); }, ms); }
    function say(w) {
      var p = tts ? tts.word(w) : Promise.resolve();
      return Promise.race([p, new Promise(function (r) { setTimeout(r, CONF.sayMax); })]);
    }
    function drawDots() { var i = m.round(); dots.innerHTML = targets.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join(''); }

    function round() {
      var e = m.start(); drawDots();
      if (e.type === 'done') return done({ completed: true, results: m.results() });
      sam.react('wait');
      say(e.target).then(function () { if (!alive()) return; lock = false; loopT = later(CONF.firstDelay, popOne); });
    }
    function popOne() {
      if (lock) return;
      var free = holes.filter(function (o) { return !o.up && !o.el.classList.contains('up'); });
      if (free.length) {
        var p = m.nextPop(free.map(function (o) { return o.i; }), holes.filter(function (o) { return o.up; }).map(function (o) { return o.w; }));
        var hl = holes[p.hole];
        board.raise(hl, pic[p.word], p.word);
        audio.play('pop');
        hl.t = later(m.up(), function () { sink(hl, true); });
      }
      loopT = later(Math.round(m.up() * CONF.overlap), popOne);
    }
    function sink(hl, untouched) {
      var was = hl.up, w = hl.w;
      board.sink(hl);
      if (was && untouched && !lock && m.sunk(w).type === 'again') say(m.target());   /* 놓쳤다 — 다시 들려주고, 곧 다시 올라온다 */
    }
    function tap(hl) {
      if (lock || !hl.up) return;
      var e = m.hit(hl.w);
      if (e.type === 'ok') {
        lock = true; clearTimeout(loopT); clearTimeout(hl.t);
        hl.up = false; hl.el.classList.add('hit');
        good(e.clean);
        holes.forEach(function (o) { if (o !== hl) sink(o, false); });
        if (opt.emit && E) opt.emit(E.act(e.word, 'listen', 'touch', e.clean));
        if (opt.onRound) { try { opt.onRound({ word: e.word, clean: e.clean }); } catch (err) {} }
        later(CONF.nextRound, function () { sink(hl, false); round(); });
      } else if (e.type === 'no') {
        clearTimeout(hl.t); hl.up = false;
        hl.el.classList.add('no');
        oops();
        later(350, function () { sink(hl, false); });
        say(m.target());
      }
    }

    drawDots();
    Promise.race([opt.intro || Promise.resolve(), new Promise(function (r) { setTimeout(r, CONF.sayMax); })]).then(function () { if (alive()) round(); });
    return finished;
  }

  g.PlayPop = { CONF: CONF, machine: machine, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'pop', no: 17, name: '톡톡 듣기', icon: '👂', channels: ['ear'], axis: 'flow', need: { lv1: 5 },
    count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length || CONF.rounds); },
    intro: { en: 'Quick! Which one?', ko: '톡톡 — 들린 것을 눌러!' },
    start: start
  });
})(window);
