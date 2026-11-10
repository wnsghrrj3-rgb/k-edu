/* ============================================================
 * 영어 놀이터 — 놀이 #11 「날아오는 음식 받기」 (게임설계 v1 §4-11 · 몸 채널)
 *   두 레인으로 음식이 하나씩 떨어진다 → 들린 것만 받는다. 몸을 그쪽으로 기울이면(카메라) 쟁반이 옮겨 간다.
 *   카메라가 없거나 안 잡히면 레인을 눌러 옮긴다 — 같은 장면을 끝까지 할 수 있다.
 *   들린 게 아닌 것을 받으면 쟁반만 흔들린다. 들린 것을 놓치면 조금 느려지고 곧 다시 떨어진다. 실패로 끝나는 길 없음.
 *   카메라 영상은 화면 안에서 움직임만 본다 — 저장·전송 0(engine/play-cam.js).
 *   공통 인터페이스: start(ctx) — 증거 = 움직임(move) · cam|touch
 *   PlayCatch.machine(targets, pool) — 화면 없는 흐름. 검사는 여기를 본다.
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 6,
    fallStart: 3200,     /* 첫 판에서 위에서 바닥까지 떨어지는 시간(ms) */
    fallMin: 2000, fallMax: 4400,
    faster: 0.92,        /* 판마다 × */
    easier: 1.15,        /* 놓치거나 아닌 걸 받으면 × */
    gap: 450,            /* 하나가 끝나고 다음이 떨어지기까지 */
    targetWithin: 3,     /* 들린 것은 적어도 이 횟수 안에 한 번 */
    nextRound: 800,
    camWait: 5000        /* 한 번 기울임을 기다리는 길이 — 못 잡으면 다시 기다린다 */
  };
  function shuffle(a, rng) { rng = rng || Math.random; a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clamp(v) { return Math.max(CONF.fallMin, Math.min(CONF.fallMax, Math.round(v))); }

  function machine(targets, pool, o) {
    o = o || {};
    var rng = o.rng || Math.random, lanes = o.lanes || 2, r = -1, fall = clamp(CONF.fallStart), since = 0, clean = true, alts = [], phase = 'idle', results = [];
    return {
      total: targets.length,
      round: function () { return r; }, phase: function () { return phase; }, fall: function () { return fall; },
      target: function () { return r >= 0 && r < targets.length ? targets[r] : null; },
      results: function () { return results.slice(); },
      start: function () {
        if (r + 1 >= targets.length) { r = targets.length; phase = 'done'; return { type: 'done' }; }
        r++; if (r > 0) fall = clamp(fall * CONF.faster);
        since = 0; clean = true; phase = 'play';
        alts = shuffle(pool.filter(function (x) { return x !== targets[r]; }), rng).slice(0, 3);
        return { type: 'round', target: targets[r], fall: fall };
      },
      next: function () {
        var isT = since >= CONF.targetWithin - 1 || rng() < 0.45;
        since = isT ? 0 : since + 1;
        return { lane: Math.floor(rng() * lanes), word: isT ? targets[r] : alts[Math.floor(rng() * alts.length)] };
      },
      /* 쟁반에 들어왔다 */
      caught: function (w) {
        if (phase !== 'play') return { type: 'ignored' };
        if (w === targets[r]) { phase = 'between'; var res = { word: w, clean: clean }; results.push(res); return { type: 'ok', word: w, clean: clean }; }
        clean = false; fall = clamp(fall * CONF.easier);
        return { type: 'no' };
      },
      /* 쟁반을 비켜 떨어졌다 — 들린 것이었으면 느려지고 바로 다시 */
      passed: function (w) {
        if (phase !== 'play' || w !== targets[r]) return { type: 'none' };
        fall = clamp(fall * CONF.easier); since = CONF.targetWithin;
        return { type: 'again' };
      }
    };
  }

  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function start(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, scene = S.scene || g.PlayScene, cam = S.cam, sam = S.sam || { react: function () {} };
    var pic = {}, W = (ctx.pool || ctx.targets || []).map(function (x) { pic[x.w] = x.pic; return x.w; });
    var targets = (ctx.targets || []).map(function (x) { return typeof x === 'string' ? x : x.w; }).slice(0, CONF.rounds);
    var m = machine(targets, W, { rng: ctx.rng });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'ct'), dots = h('div', 'dots');
    var camw = h('div', 'camwrap', '<video class="cam" playsinline muted></video>');
    root.appendChild(dots); root.appendChild(camw);
    var ln = scene.lanes(root, 2);
    var hint = h('div', 'hint', ''), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(hint); root.appendChild(rep); host.appendChild(root);
    var useCam = false, usedCam = false, lock = true, cur = null, done;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { return setTimeout(function () { if (alive()) fn(); }, ms); }
    function drawDots() { var i = m.round(); dots.innerHTML = targets.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join(''); }
    rep.onclick = function () { var t = m.target(); if (t) ctx.say(t); };
    ln.list.forEach(function (l, k) { l.onclick = function () { ln.move(k); }; });

    /* 몸 기울임을 계속 본다 — 잡히면 그쪽 레인으로 */
    function watch() {
      if (!useCam || !alive()) return;
      cam.pick({ timeout: CONF.camWait }).then(function (side) {
        if (!alive()) return;
        if (side) { usedCam = true; ln.move(side === 'left' ? 0 : 1); }
        watch();
      });
    }
    function round() {
      var e = m.start(); drawDots();
      if (e.type === 'done') { if (useCam && cam.stop) cam.stop(); return done({ completed: true, results: m.results() }); }
      sam.react('wait');
      ctx.say(e.target).then(function () { if (!alive()) return; lock = false; later(CONF.gap, drop); });
    }
    function drop() {
      if (lock || !alive()) return;
      var p = m.next();
      cur = ln.drop(p.lane, pic[p.word], p.word, m.fall(), function () {
        if (lock || ln.at !== p.lane) return false;
        var e = m.caught(p.word);
        if (e.type === 'ok') {
          lock = true; ln.got(pic[p.word]); ctx.good(e.clean);
          ctx.emit(E.act(e.word, 'move', usedCam ? 'cam' : 'touch', e.clean));
          later(CONF.nextRound, function () { ln.got(''); round(); });
          return true;
        }
        if (e.type === 'no') { ln.shake(); ctx.oops(); ctx.say(m.target()); later(CONF.gap, drop); return true; }   /* 아닌 걸 받았다 — 쟁반만 흔들 */
        return false;
      }, function () {
        if (lock) return;
        if (m.passed(p.word).type === 'again') ctx.say(m.target());      /* 놓쳤다 — 다시 들려주고 곧 다시 떨어진다 */
        later(CONF.gap, drop);
      });
    }

    var finished = new Promise(function (r) { done = r; });
    drawDots();
    var camOK = cam && cam.available && cam.available() && !(ctx.learner && ctx.learner.cam === false);
    (camOK ? cam.start(camw.querySelector('video')) : Promise.resolve(false)).then(function (ok) {
      if (!alive()) return;
      useCam = !!ok;
      if (!ok) { camw.style.display = 'none'; hint.textContent = '받을 쪽을 눌러요'; } else { hint.textContent = '몸을 기울이면 쟁반이 움직여요 (눌러도 돼요)'; watch(); }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
    return finished;
  }

  g.PlayCatch = { CONF: CONF, machine: machine, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'catch', no: 11, name: '받기', icon: 'body', channels: ['body'], axis: 'flow', need: { lv1: 5 }, cam: true,
    count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length || CONF.rounds); },
    intro: { en: 'Listen! Left or right?', ko: '들린 것만 받아 — 몸을 그쪽으로 기울여!' },
    intro1: { en: 'Listen!', ko: '들린 쪽으로 몸을 기울여 받아 줘!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
