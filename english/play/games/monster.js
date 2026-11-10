/* ============================================================
 * 영어 놀이터 — 놀이 #3 「배고픈 몬스터」 (게임설계 v1 §4-3 · 귀·손 · 웃음)
 *   몬스터가 먹고 싶은 것을 말한다 — 「Red jam!」 「Big fish!」 → 넷 중에서 그것을 먹인다(꾸미는 말 × 재료 = 넷).
 *   먹으면 몬스터가 그 색으로 물들거나(색) 부풀어 오른다(크기). 엉뚱한 주문은 꾸미는 말만 가르고, 여기는 꾸미는 말과 재료를 함께 듣는다.
 *   꾸미는 말은 사다리에 나온 것만 — 구역 자료 zone.silly(big·small·red·blue).
 *   실패 지원: 다른 것을 먹이려 하면 몬스터가 고개를 젓고, 조건을 둘로 쪼개어 천천히 들려준다(「red」 … 「jam」). 실패로 끝나는 길 없음.
 *   공통 인터페이스: start(ctx) — 증거 = 듣기(listen) · 대상은 재료 단어
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 4,
    eatMs: 1300,       /* 먹는 장면 길이 */
    nextMs: 400
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 한 판 = { attr, vs, kind, noun, other } — 같은 꾸밈 짝(big↔small)에 둘 다 어울리는 재료 둘 */
  function plan(silly, n) {
    var out = [], used = {};
    var sets = shuffle((silly || []).filter(function (s) { return (s.nouns || []).length >= 2; }));
    var guard = 0;
    while (out.length < n && sets.length && guard++ < 40) {
      var s = sets[out.length % sets.length], ns = shuffle(s.nouns), a = ns.filter(function (w) { return !used[w]; })[0] || ns[0];
      var b = ns.filter(function (w) { return w !== a; })[0];
      used[a] = 1;
      out.push({ attr: s.attr, vs: s.vs, kind: s.kind, noun: a, other: b });
    }
    return out;
  }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, fx = S.fx || g.PlayFx, tts = S.tts;
    var rounds = (ctx.opt && ctx.opt.rounds) || plan(Z.silly, CONF.rounds), pic = {};
    (ctx.pool || ctx.targets || []).forEach(function (x) { pic[x.w] = x.pic; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'mo'), dots = h('div', 'dots'), mon = h('button', 'mo-mon', '<span class="mo-face">👾</span><span class="mo-bub">🔊</span>'), tray = h('div', 'mo-tray');
    mon.type = 'button';
    root.appendChild(dots); root.appendChild(mon); root.appendChild(tray); host.appendChild(root);
    var i = 0, cur = null, face = mon.firstChild;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function speak(o) { return G.soon(tts ? tts.sentence(o.attr + ' ' + o.noun + '!') : null); }
    function split(o) { return G.soon(tts ? tts.word(o.attr, { rate: 0.5 }) : null).then(function () { return G.soon(tts ? tts.word(o.noun, { rate: 0.5 }) : null); }); }
    function art(noun, attr, kind) {
      var e = h('span', 'so-art', pic[noun]);
      if (kind === 'size') e.classList.add(attr === 'big' ? 'big' : 'small'); else if (fx) fx.tint(e, attr);
      return e;
    }
    mon.onclick = function () { if (cur) speak(cur); };

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = rounds.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= rounds.length) return resolve({ completed: true });
        var o = rounds[i], clean = true, tries = 1, done = false;
        cur = o; tray.innerHTML = ''; mon.className = 'mo-mon'; if (fx) fx.reset(face); face.textContent = '👾';
        var opts = [];
        [o.noun, o.other].forEach(function (n) { [o.attr, o.vs].forEach(function (a) { opts.push({ noun: n, attr: a }); }); });
        shuffle(opts).forEach(function (c) {
          var b = h('button', 'tile mo-food', ''); b.type = 'button'; b.setAttribute('data-w', c.noun); b.setAttribute('data-attr', c.attr);
          b.appendChild(art(c.noun, c.attr, o.kind));
          b.onclick = function () {
            if (done || b.disabled) return;
            if (c.noun !== o.noun || c.attr !== o.attr) {
              clean = false; tries++; b.classList.add('no'); b.disabled = true; mon.classList.add('nope'); ctx.oops();
              later(400, function () { b.classList.remove('no'); b.classList.add('dim'); mon.classList.remove('nope'); });
              return split(o);                                       /* 조건을 둘로 쪼개어 들려준다 */
            }
            done = true; b.classList.add('ok'); mon.classList.add('eat');
            ctx.good(clean); ctx.emit(E.act(o.noun, 'listen', 'touch', clean, tries));
            if (S.audio) S.audio.play('pop');
            /* 먹은 대로 변한다 — 색은 물들고, 큰 것은 부풀고, 작은 것은 작아진다 */
            if (o.kind === 'color') { if (fx) { fx.tint(face, o.attr); fx.puff(face); } }
            else if (o.attr === 'big') { if (fx) fx.giant(face, { scale: 1.7, ms: 600, back: false }); }
            else mon.classList.add('tiny');
            later(CONF.eatMs, function () { if (fx) fx.reset(face); mon.classList.remove('tiny'); i++; later(CONF.nextMs, round); });
          };
          tray.appendChild(b);
        });
        speak(o);
      }
      G.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlayMonster = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'monster', no: 3, name: '배고픈 몬스터', icon: '👾', channels: ['ear', 'hand'], axis: 'laugh', need: { lv1: 13 },
    fits: function (zone) { return plan(zone.silly, 1).length > 0; },
    count: function (c) { return Math.min(CONF.rounds, plan((c.zone || {}).silly, CONF.rounds).length); },
    intro: { en: 'Yum! Yum!', ko: '배고픈 몬스터가 왔어 — 먹고 싶다는 것을 골라 먹여 줘!' },
    start: start
  });
})(window);
