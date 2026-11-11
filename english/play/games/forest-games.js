/* ============================================================
 * 영어 놀이터 — 글자 숲의 뼈대 놀이 셋 (한 해 길 v1 §3·§6 · W13 — 화면은 2D, 입체 방은 W15~)
 *   #39 낱말 기차(word-train)   말하기 — 칸마다 그림 하나. 기차가 지나갈 때 이름을 말하면 칸에 불. 한 바퀴마다 조금 빨라지고,
 *                                놓친 칸은 다음 바퀴에 다시(손해 0). 끝까지 못 켠 칸은 주인이 이름을 들려주며 켠다.
 *                                마이크가 없으면 지나가는 칸을 누른다(골라서 = 도움 받은 것으로).
 *   #38 첫소리 바구니(first-basket) 듣기 — 낱말을 듣고 첫소리가 같은 글자 바구니에(x 는 끝소리 바구니 — 길 자료의 letter).
 *                                다르면 첫소리만 늘여서 다시.
 *   #45 글자 열매(letter-fruit)  읽기 — 나무에 달린 글자를 보고 그 소리를 고른다(소리 단추 셋 — 누르면 들리고, 「이 소리!」로 고른다).
 *   공통 인터페이스: start(ctx). 증거 — 기차 = 말하기(say) · 바구니 = 듣기(listen) · 열매 = 읽기(read · unit letter)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    train: { cars: 8, laps: 3, carMs: 2600, faster: 0.85, minMs: 1500 },
    basket: { rounds: 6, nextMs: 500 },
    fruit: { rounds: 4, options: 3, nextMs: 500 }
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function common(ctx, cls) {
    var host = ctx.host; host.innerHTML = ''; var root = h('div', cls); host.appendChild(root);
    return { root: root, alive: function () { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); } };
  }
  function nameable(x) { return !!x && x.path !== 'sentence' && x.path !== 'text' && x.path !== 'letter' && !!x.pic && x.drawn !== false && x.path !== 'sight'; }      /* 그림으로 이름을 댈 수 있는 낱말 */

  /* ── #39 낱말 기차 ── */
  function train(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, G = g.PlayGame, tts = S.tts, speech = S.speech, audio = S.audio || { play: function () {} }, C = CONF.train;
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; }, off: function () {}, prime: function () {} };
    var cars = (ctx.targets || []).filter(nameable).slice(0, C.cars), u = common(ctx, 'wt'), track = h('div', 'wt-track'), hint = h('div', 'hint', '');
    u.root.appendChild(track); u.root.appendChild(hint);
    var lit = {}, els = {};
    cars.forEach(function (x) { var b = h('button', 'wt-car', '<span class="wt-pic">' + x.pic + '</span>'); b.type = 'button'; b.setAttribute('data-w', x.w); els[x.w] = b; track.appendChild(b); });
    return new Promise(function (resolve) {
      var lap = 0;
      function light(x, by, tries) { if (lit[x.w]) return; lit[x.w] = 1; els[x.w].classList.add('lit'); audio.play('ok'); ctx.emit(E.say(x.w, { by: by, tries: tries || 0, mic: mic.ok() })); ctx.good(by === 'speech', { at: els[x.w] }); }
      function pass(x, ms) {
        return new Promise(function (res) {
          if (!u.alive() || lit[x.w]) return res();
          var b = els[x.w], over = false, fin = function () { if (over) return; over = true; b.classList.remove('now'); b.onclick = null; res(); };
          b.classList.add('now');
          if (mic.ok() && speech) {
            hint.textContent = '이름을 말해 봐!';
            speech.tryOnce(x.w, { kind: 'word', others: cars.map(function (y) { return y.w; }).filter(function (y) { return y !== x.w; }), timeout: ms }).then(function (r) {
              if (r && (r.error === 'unavailable' || r.error === 'not-allowed' || r.error === 'service-not-allowed')) mic.off();
              else if (r && r.ok) { mic.prime(); light(x, 'speech', lap); }
              fin();
            });
          } else {
            hint.textContent = '지나가는 칸을 누르고 이름을 들어 봐';
            b.onclick = function () { G.soon(tts ? tts.word(x.w) : null).then(function () { light(x, 'chosen', lap); fin(); }); };
            setTimeout(fin, ms);
          }
        });
      }
      function run() {
        if (!u.alive()) return;
        var left = cars.filter(function (x) { return !lit[x.w]; });
        if (!left.length) return resolve({ completed: true });
        if (lap >= C.laps) {          /* 못 켠 칸 — 주인이 이름을 들려주며 켠다(듣기 증거) */
          return left.reduce(function (p, x) { return p.then(function () { if (!u.alive()) return; els[x.w].classList.add('lit'); lit[x.w] = 1; ctx.emit(E.act(x.w, 'listen', 'touch', false)); return G.soon(tts ? tts.word(x.w) : null); }); }, Promise.resolve()).then(function () { resolve({ completed: true }); });
        }
        var ms = Math.max(C.minMs, C.carMs * Math.pow(C.faster, lap)); u.root.setAttribute('data-lap', lap + 1);
        left.reduce(function (p, x) { return p.then(function () { return pass(x, ms); }); }, Promise.resolve()).then(function () { lap++; run(); });
      }
      if (!cars.length) return resolve({ completed: true });
      G.soon(ctx.intro, null).then(run);
    });
  }

  /* ── #38 첫소리 바구니 ── */
  function basket(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, G = g.PlayGame, tts = S.tts, Z = ctx.zone || {}, C = CONF.basket;
    var letters = (Z.letterItems || []).map(function (x) { return x.w; });
    var list = shuffle((ctx.targets || []).filter(function (x) { return nameable(x) && letters.indexOf(x.letter || x.w.charAt(0)) >= 0; })).slice(0, C.rounds);
    var u = common(ctx, 'fb'), dots = h('div', 'dots'), pic = h('div', 'fb-pic'), row = h('div', 'fb-baskets'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    u.root.appendChild(dots); u.root.appendChild(pic); u.root.appendChild(row); u.root.appendChild(rep);
    var i = 0, cur = null;
    function say(x, slow) { return G.soon(tts ? tts.word(x.w, slow ? { rate: 0.5 } : undefined) : null); }
    rep.onclick = function () { if (cur) say(cur); };
    return new Promise(function (resolve) {
      function round() {
        if (!u.alive()) return;
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        var x = cur = list[i], want = x.letter || x.w.charAt(0), tries = 1, clean = true, over = false;
        pic.innerHTML = x.pic; row.innerHTML = '';
        letters.forEach(function (k) {
          var b = h('button', 'fb-basket', g.PlayIcon.html('basket') + '<span class="ph-chip">' + k + '</span>'); b.type = 'button'; b.setAttribute('data-u', k);
          b.onclick = function () {
            if (over) return;
            if (k !== want) { clean = false; tries++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); ctx.oops(); return say(x, true); }
            over = true; b.classList.add('ok'); ctx.emit(E.act(x.w, 'listen', 'touch', clean, tries)); ctx.good(clean, { at: b });
            i++; setTimeout(round, C.nextMs);
          };
          row.appendChild(b);
        });
        say(x);
      }
      if (list.length < 1 || letters.length < 2) return resolve({ completed: true });
      G.soon(ctx.intro, null).then(round);
    });
  }

  /* ── #45 글자 열매 ── */
  function fruit(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, G = g.PlayGame, P = g.PlayPhonics, tts = S.tts, Z = ctx.zone || {}, C = CONF.fruit;
    var letters = (Z.letterItems || []).map(function (x) { return x.w; }), list = [];
    while (letters.length && list.length < C.rounds) list = list.concat(shuffle(letters)); list = list.slice(0, C.rounds);
    var u = common(ctx, 'lf'), dots = h('div', 'dots'), tree = h('div', 'lf-tree'), row = h('div', 'lf-sounds'), okBtn = h('button', 'btn lf-ok', '이 소리!'); okBtn.type = 'button';
    u.root.appendChild(dots); u.root.appendChild(tree); u.root.appendChild(row); u.root.appendChild(okBtn);
    var i = 0;
    function sound(k) { return G.soon(P && tts ? P.say(tts, k) : tts && tts.sound ? tts.sound(k) : null, 2000); }
    function alts(k) { var v = 'aeiou', pool = (v.indexOf(k) >= 0 ? v : 'bcdfghjklmnprstvwyz').split('').filter(function (c) { return c !== k; }); return shuffle(pool).slice(0, C.options - 1); }
    return new Promise(function (resolve) {
      function round() {
        if (!u.alive()) return;
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        var k = list[i], tries = 1, clean = true, over = false, sel = null;
        tree.innerHTML = '<span class="lf-fruit">' + k + '</span>'; row.innerHTML = ''; okBtn.disabled = true;
        shuffle([k].concat(alts(k))).forEach(function (c) {
          var b = h('button', 'lf-sound', g.PlayIcon.html('speaker')); b.type = 'button'; b.setAttribute('data-u', c);
          b.onclick = function () { if (over || b.disabled) return; sel = b; Array.prototype.forEach.call(row.children, function (y) { y.classList.toggle('sel', y === b); }); okBtn.disabled = false; sound(c); };
          row.appendChild(b);
        });
        okBtn.onclick = function () {
          if (over || !sel) return;
          if (sel.getAttribute('data-u') !== k) { clean = false; tries++; sel.disabled = true; sel.classList.remove('sel'); sel.classList.add('dim'); sel = null; okBtn.disabled = true; ctx.oops(); return; }
          over = true; sel.classList.add('ok');
          ctx.emit(E.make({ targetId: k, skill: 'read', outcome: clean ? 'independent' : 'assisted', inputMode: 'touch', attempts: tries, unit: 'letter' })); ctx.good(clean, { at: tree });
          i++; setTimeout(round, C.nextMs);
        };
      }
      if (!list.length) return resolve({ completed: true });
      G.soon(ctx.intro, null).then(round);
    });
  }

  g.PlayForest = { CONF: CONF, train: train, basket: basket, fruit: fruit };
  if (g.PlayGame) {
    g.PlayGame.register({ id: 'word-train', no: 39, name: '낱말 기차', icon: 'train', channels: ['say'], axis: 'flow', need: {}, skills: ['S'], unit: 'word', serves: [0, 1], plants: true,
      fits: function (zone) { return (zone.words || []).filter(nameable).length >= 3; },
      count: function (c) { return Math.min(CONF.train.cars, (c.targets || []).filter(nameable).length); },
      intro: { en: 'Go! Go!', ko: '기차가 지나갈 때 그 칸의 이름을 말해 줘!' }, intro1: { en: 'Go! Go!', ko: '기차가 지나갈 때 그 칸의 이름을 말해 줘!' }, start: train });
    g.PlayGame.register({ id: 'first-basket', no: 38, name: '첫소리 바구니', icon: 'basket', channels: ['ear'], axis: 'find', need: {}, skills: ['L'], unit: 'word', serves: [1],
      fits: function (zone) { return (zone.letterItems || []).length >= 2 && (zone.words || []).some(function (x) { return x.path === 'oral'; }); },
      count: function (c) { return Math.min(CONF.basket.rounds, (c.targets || []).filter(nameable).length); },
      intro: { en: 'Listen!', ko: '낱말을 듣고 첫소리가 같은 바구니에 담아 줘!' }, intro1: { en: 'Listen!', ko: '낱말을 듣고 첫소리가 같은 바구니에 담아 줘!' }, start: basket });
    g.PlayGame.register({ id: 'letter-fruit', no: 45, name: '글자 열매', icon: 'fruit', channels: ['read', 'sound'], axis: 'find', need: {}, skills: ['R'], unit: 'letter', serves: [1],
      fits: function (zone) { return (zone.letterItems || []).length >= 1; },
      count: function () { return CONF.fruit.rounds; },
      intro: { en: 'I see it!', ko: '열매의 글자를 보고 그 소리를 골라 줘!' }, intro1: { en: 'I see it!', ko: '열매의 글자를 보고 그 소리를 골라 줘!' }, start: fruit });
  }
})(window);
