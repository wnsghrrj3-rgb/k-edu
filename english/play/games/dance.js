/* ============================================================
 * 영어 놀이터 — 놀이 #10 「동물 댄스」 (게임설계 v1 §4-10 · 몸 · 운동장 — 카메라 비중은 이 무대에 모은다 §10)
 *   강아지 댄서가 동작 이름을 외친다(「Jump!」) → 움직이는 동작 카드 둘 중 그 동작을 고른다 → 강아지와 함께 그 동작을 한다.
 *   카메라가 있으면: 고른 뒤 「같이!」 — 아이가 몸을 움직이면(화면 안 움직임만 본다 · 저장·전송 0) 움직임 증거(cam)가 하나 더 남는다.
 *   카메라가 없으면: 카드를 눌러 고르는 것으로 끝(듣기 증거 · touch) — 탭만으로 전부 끝난다(W07 끝 조건).
 *   실패 지원: 다른 카드를 누르면 그 카드만 흐려지고, 동작 이름을 천천히 다시. 실패로 끝나는 길 없음.
 *   공통 인터페이스: start(ctx) — 증거 = 듣기(listen·touch) + 움직임(move·cam, 카메라가 있을 때만)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 6,
    dancer: 'dog',     /* 댄서 그림(content/art/farm.js) — 없으면 아이 그림 */
    danceMs: 900,      /* 함께 추는 시간(카메라 없음) */
    moveMs: 4000,      /* 카메라: 움직임을 기다리는 시간 */
    nextMs: 400
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 판마다 { target, pair[2] } — 헷갈리는 짝(spin·swim 등)은 일부러 같은 판에 둔다(귀로 가르는 놀이) */
  function plan(targets, pool, confuse, n) {
    var all = pool.map(function (x) { return x.w; });
    return targets.slice(0, n || CONF.rounds).map(function (x) {
      var c = (confuse || []).filter(function (p) { return p.indexOf(x.w) >= 0; })[0], alt = c ? (c[0] === x.w ? c[1] : c[0]) : null;
      if (!alt || all.indexOf(alt) < 0) alt = shuffle(all.filter(function (w) { return w !== x.w; }))[0];
      return { target: x.w, pair: shuffle([x.w, alt]) };
    });
  }

  function start(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, A = g.PlayArt, tts = S.tts, cam = S.cam, audio = S.audio || { play: function () {} };
    var pool = ctx.pool || ctx.targets || [], pic = {}; pool.forEach(function (x) { pic[x.w] = x.pic; });
    var rounds = plan(ctx.targets || [], pool, (ctx.zone && ctx.zone.confuse) || []);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'dc'), dots = h('div', 'dots'), floor = h('div', 'dc-floor'), cards = h('div', 'dc-cards'), hint = h('div', 'hint', ''), camw = h('div', 'camwrap dc-cam', '<video class="cam" playsinline muted></video>');
    floor.innerHTML = '<span class="dc-dancer">' + (A.html(CONF.dancer) || A.html('kid')) + '</span><span class="dc-move"></span>';
    root.appendChild(dots); root.appendChild(floor); root.appendChild(cards); root.appendChild(hint); root.appendChild(camw); host.appendChild(root);
    var dancer = floor.querySelector('.dc-dancer'), move = floor.querySelector('.dc-move');
    var i = 0, useCam = false;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function say(w, slow) { return g.PlayGame.soon(tts ? tts.word(w, slow ? { rate: 0.6 } : undefined) : null); }

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = rounds.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= rounds.length) { if (useCam && cam && cam.stop) cam.stop(); return resolve({ completed: true }); }
        var r = rounds[i], tries = 1, clean = true, over = false;
        cards.innerHTML = ''; move.innerHTML = ''; move.className = 'dc-move'; dancer.classList.remove('go');
        hint.textContent = '들린 동작을 골라 줘';
        r.pair.forEach(function (w) {
          var b = h('button', 'dc-card act-go', '<span class="dc-pic">' + (pic[w] || w) + '</span>'); b.type = 'button'; b.setAttribute('data-w', w);
          b.onclick = function () {
            if (over || b.disabled) return;
            if (w !== r.target) { clean = false; tries++; b.disabled = true; b.classList.add('dim'); ctx.oops(); return say(r.target, true); }
            over = true; b.classList.add('ok');
            ctx.emit(E.act(w, 'listen', 'touch', clean, tries)); ctx.good(clean, { at: b });
            dance(w);
          };
          cards.appendChild(b);
        });
        audio.play('enter'); say(r.target);
      }
      /* 함께 추기 — 카메라가 있으면 아이의 움직임을 기다린다 */
      function dance(w) {
        move.innerHTML = pic[w] || w; move.setAttribute('data-w', w); move.className = 'dc-move act-go go'; dancer.classList.add('go');
        if (!useCam || !cam || !cam.move) { hint.textContent = '같이 해 봐!'; return later(CONF.danceMs, next); }
        hint.textContent = '같이! 몸으로 해 봐';
        cam.move({ timeout: CONF.moveMs }).then(function (ok) {
          if (!alive()) return;
          if (ok) { ctx.emit(E.act(w, 'move', 'cam', true, 1)); audio.play('ok'); hint.textContent = '좋아!'; }
          later(CONF.nextMs, next);
        });
      }
      function next() { i++; later(CONF.nextMs, round); }
      var camReady = cam && cam.available && cam.available() ? cam.start(camw.querySelector('video')) : Promise.resolve(false);
      Promise.all([g.PlayGame.soon(ctx.intro, null), g.PlayGame.soon(camReady, 2500)]).then(function (v) {
        useCam = v[1] === true; if (!useCam) camw.style.display = 'none';
        if (alive()) round();
      });
    });
  }

  g.PlayDance = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'dance', no: 10, name: '동물 댄스', icon: 'jump', channels: ['body', 'ear'], axis: 'body', need: { lv2: 7 }, cam: true,
    fits: function (zone) { return zone.kind === 'action' && (zone.words || []).filter(function (x) { return g.PlayArt && g.PlayArt.has(x.w); }).length >= 4; },
    count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length); },
    intro: { en: 'Dance!', ko: '강아지가 외치는 동작을 골라서 같이 춰 봐!' },
    start: start
  });
})(window);
