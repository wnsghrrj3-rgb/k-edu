/* ============================================================
 * 영어 놀이터 — 놀이 #2 「엉뚱한 주문 대소동」 (게임설계 v1 §4-2 · 웃음 축)
 *   장난꾸러기 Ben 이 꾸미는 말을 붙여 주문한다 — 「Big fish!」 「Red jam!」
 *   아이가 둘 중 맞는 것을 고르면(듣기) 그대로 벌어진다: 큰 물고기는 Ben 을 가릴 만큼 커지고, 빨간 잼은 빨갛게 물든다.
 *   그다음 그 말을 따라 말하면(마이크가 있을 때) 쟁반이 나간다.
 *   꾸미는 말은 사다리에 나온 것만: big·small(Lv1 수·꾸밈말 칸) · red·blue(Lv1 색 칸) — 구역 데이터 zone.silly 가 정한다.
 *   실패 지원: 다른 것을 고르면 두 그림 아래에 글자(big / small)가 나타나 견주어 볼 수 있다.
 *   공통 인터페이스: start(ctx) — 증거 = 듣기(listen·touch) + 말하기(say)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 3,            /* 주문 수 */
    guest: 'ben',
    stepIn: 520,          /* Ben 이 앞으로 오는 시간(ms) */
    gagMs: 1500,          /* 웃긴 장면을 보여 주는 시간 */
    nextMs: 500
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 주문 짜기 — 첫 주문은 크기(거대화 개그), 그 뒤로 색·크기를 섞는다. 같은 재료는 두 번 쓰지 않는다 */
  function plan(silly, n, rng) {
    silly = silly || []; n = n || CONF.rounds;
    var out = [], used = {}, pool = [];
    silly.forEach(function (s) { (s.nouns || []).forEach(function (w) { pool.push({ attr: s.attr, vs: s.vs, kind: s.kind, noun: w }); }); });
    var first = shuffle(pool.filter(function (p) { return p.kind === 'size' && p.attr === 'big'; }))[0];
    if (first) { out.push(first); used[first.noun] = 1; }
    var kinds = ['color', 'size'], k = 0, guard = 0;
    while (out.length < n && guard++ < 40) {
      var want = kinds[k++ % 2];
      var c = shuffle(pool.filter(function (p) { return p.kind === want && !used[p.noun] && !(out.length === 1 && p.kind === 'size' && p.attr === 'big'); }))[0];
      if (c) { out.push(c); used[c.noun] = 1; }
    }
    return out;
  }
  function phrase(o) { return o.attr + ' ' + o.noun; }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, npc = S.npc || g.PlayNpc, scene = S.scene || g.PlayScene, fx = S.fx || g.PlayFx, tts = S.tts;
    var audio = S.audio || { play: function () {} };
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; } };
    var orders = (ctx.opt && ctx.opt.orders) || plan(Z.silly, CONF.rounds), pic = {};
    (ctx.pool || ctx.targets || []).forEach(function (x) { pic[x.w] = x.pic; });
    var who = CONF.guest, host = ctx.host; host.innerHTML = '';
    var root = h('div', 'oq so'); host.appendChild(root);
    var q = scene.queue(root, { guests: [who], npc: npc });
    var gag = h('div', 'so-gag'); q.el.appendChild(gag);
    var line = h('div', 'say so-say', ''), act = h('div', 'oq-act'), dots = h('div', 'dots');
    root.appendChild(line); root.appendChild(act); root.appendChild(dots);
    var i = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function speak(o, rate) { return G.soon(tts ? tts.sentence(phrase(o) + '!', rate ? { rate: rate } : undefined) : null); }
    /* 그림 한 장 — 크기는 글자 크기로, 색은 물들여서 */
    function art(o, attr) {
      var e = h('span', 'so-art', pic[o.noun]);
      if (o.kind === 'size') e.classList.add(attr === 'big' ? 'big' : 'small');
      else if (fx) fx.tint(e, attr);
      e.setAttribute('data-attr', attr);
      return e;
    }

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = orders.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= orders.length) return resolve({ completed: true });
        var o = orders[i], clean = true, tries = 1;
        npc.react(q.G[who], 'wait'); gag.innerHTML = ''; gag.className = 'so-gag';
        line.textContent = ''; act.innerHTML = '';
        q.say('🔊', true); q.bub.setAttribute('data-w', phrase(o));
        q.bub.onclick = function () { speak(o); };
        var box = h('div', 'oq-offer so-offer');
        shuffle([o.attr, o.vs]).forEach(function (attr) {
          var t = h('button', 'tile', ''); t.type = 'button'; t.setAttribute('data-attr', attr);
          t.appendChild(art(o, attr)); t.appendChild(h('small', 'so-lab', attr));
          t.onclick = function () {
            if (t.disabled || box.classList.contains('done')) return;
            if (attr !== o.attr) {
              clean = false; tries++; t.classList.add('no'); t.disabled = true; ctx.oops(); npc.react(q.G[who], 'no');
              box.classList.add('hint');                         /* 두 그림 아래에 글자가 나타난다 — 견주어 보기 */
              later(350, function () { t.classList.remove('no'); t.classList.add('dim'); });
              return speak(o, 0.6);
            }
            box.classList.add('done'); t.classList.add('ok');
            ctx.emit(E.act(o.noun, 'listen', 'touch', clean, tries));
            ctx.good(clean, { at: q.G[who] });
            line.textContent = phrase(o);
            play(o).then(function () { return sayIt(o); }).then(function () { i++; later(CONF.nextMs, round); });
          };
          box.appendChild(t);
        });
        act.appendChild(box);
        speak(o);
      }
      /* 벌어지는 일 — 큰 것은 Ben 을 가릴 만큼 커지고, 작은 것은 콩알만 해지고, 색은 물든 채 부푼다 */
      function play(o) {
        var a = art(o, o.attr); gag.appendChild(a); gag.classList.add('on');
        audio.play('tray');
        if (o.kind === 'size' && o.attr === 'big') { npc.react(q.G[who], 'wow', { stay: true }); if (fx) fx.giant(a, { ms: 700 }); }
        else if (o.kind === 'size') { npc.react(q.G[who], 'no', { stay: true }); gag.classList.add('tiny'); }
        else { npc.react(q.G[who], 'cheer', { stay: true }); if (fx) fx.puff(a); }
        return new Promise(function (r) { later(CONF.gagMs, r); });
      }
      /* 따라 말하기 — 마이크가 있을 때만. 말하면 쟁반이 나간다 */
      function sayIt(o) {
        if (!mic.ok()) return Promise.resolve();
        act.innerHTML = '';
        return g.PlayTutor.ask(ctx, { host: act, cands: [o.noun], kind: 'sentence', sentence: function (w) { return o.attr + ' ' + w; }, frame: [o.attr] }).then(function (r) {
          if (!r || !alive()) return;
          ctx.emit(E.say(o.noun, r));
          ctx.good(r.by === 'speech' && r.tries === 0, { at: q.G[who] });
          npc.react(q.G[who], 'ok', { stay: true });
        });
      }
      audio.play('enter'); q.place(who, 'front');
      G.soon(ctx.intro, null).then(function () { later(CONF.stepIn, round); });
    });
  }

  g.PlaySilly = { CONF: CONF, plan: plan, phrase: phrase, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'silly-order', no: 2, name: '엉뚱한 주문', icon: '🤪', channels: ['ear', 'say'], axis: 'laugh', need: { lv1: 15 },
    count: function (c) { var n = Math.min(CONF.rounds, plan((c.zone || {}).silly, CONF.rounds).length); return n * (c.learner && c.learner.mic && c.learner.mic.ok() ? 2 : 1); },
    intro: { en: 'Oh! Ben!', ko: '장난꾸러기 Ben 이 왔어 — 잘 듣고 골라 줘!' },
    start: start
  });
})(window);
