/* ============================================================
 * 영어 놀이터 — 놀이 #4 「마법 자판기」 (게임설계 v1 §4-4 · 창작·말)
 *   꾸미는 말 카드 하나 + 재료 카드 하나를 아이가 마음대로 고른다 → 자판기에 「big cake」 가 뜬다 → 그 말을 하면 그대로 나온다
 *   (큰 것은 커다랗게, 작은 것은 콩알만 하게, 색은 물들어서). 정답이 없다 — 무엇을 만들지는 아이가 정한다.
 *   꾸미는 말은 사다리에 나온 것만(구역 자료 zone.silly — big·small·red·blue). 「It is a ~」 꼴은 그 칸(Lv2 관사 종합)을 지난 뒤에 붙인다.
 *   마이크가 없으면 자판기가 대신 말해 주고 나온다. 같은 조합은 다시 못 고른다(새것을 만들게).
 *   공통 인터페이스: start(ctx) — 증거 = 만들기(build · touch) + 말하기(say). 대상은 재료 단어
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    makes: 3,          /* 한 번에 만드는 것 수 */
    outMs: 1500,       /* 나온 것을 보여 주는 시간 */
    nextMs: 400
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 고를 수 있는 카드 — 꾸미는 말(어느 재료와 어울리는지 포함) · 재료 */
  function cards(silly) {
    var attrs = [], nouns = [];
    (silly || []).forEach(function (s) { if (!attrs.some(function (a) { return a.attr === s.attr; })) attrs.push({ attr: s.attr, kind: s.kind, nouns: s.nouns.slice() }); s.nouns.forEach(function (w) { if (nouns.indexOf(w) < 0) nouns.push(w); }); });
    return { attrs: attrs, nouns: nouns };
  }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, fx = S.fx || g.PlayFx, tts = S.tts;
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; } };
    var C = cards(Z.silly), pic = {};
    (ctx.pool || ctx.targets || []).forEach(function (x) { pic[x.w] = x.pic; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'vd'), dots = h('div', 'dots'), box = h('div', 'vd-box', '<div class="vd-screen say"></div><div class="vd-out"></div>');
    var rowA = h('div', 'vd-row'), rowN = h('div', 'vd-row'), act = h('div', 'oq-act');
    root.appendChild(dots); root.appendChild(box); root.appendChild(rowA); root.appendChild(rowN); root.appendChild(act); host.appendChild(root);
    var screen = box.firstChild, out = box.lastChild, made = [], i = 0, selA = null, selN = null, busy = false;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function fitsA(a, n) { return a.nouns.indexOf(n) >= 0; }
    function draw() {
      dots.innerHTML = new Array(CONF.makes + 1).join('x').split('').map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
      rowA.innerHTML = ''; rowN.innerHTML = '';
      C.attrs.forEach(function (a) {
        var b = h('button', 'vd-card' + (selA === a ? ' sel' : ''), a.attr); b.type = 'button'; b.setAttribute('data-attr', a.attr);
        b.disabled = busy || (!!selN && !fitsA(a, selN));
        b.onclick = function () { if (busy) return; selA = selA === a ? null : a; if (tts) tts.word(a.attr); ready(); };
        rowA.appendChild(b);
      });
      C.nouns.forEach(function (n) {
        var b = h('button', 'vd-card pic' + (selN === n ? ' sel' : ''), '<span>' + pic[n] + '</span><small>' + n + '</small>'); b.type = 'button'; b.setAttribute('data-w', n);
        b.disabled = busy || (!!selA && !fitsA(selA, n)) || (!!selA && made.indexOf(selA.attr + ' ' + n) >= 0);
        b.onclick = function () { if (busy) return; selN = selN === n ? null : n; if (tts) tts.word(n); ready(); };
        rowN.appendChild(b);
      });
      screen.textContent = (selA ? selA.attr : '___') + ' ' + (selN || '___');
    }
    /* 둘 다 골랐으면 — 말하면 나온다 */
    function ready() {
      draw();
      if (!selA || !selN || made.indexOf(selA.attr + ' ' + selN) >= 0) return;
      var a = selA, n = selN, phrase = a.attr + ' ' + n;
      busy = true; draw(); act.innerHTML = '';
      ctx.emit(E.act(n, 'build', 'touch', true));
      var said = mic.ok()
        ? g.PlayTutor.ask(ctx, { host: act, cands: [n], kind: 'sentence', sentence: function (w) { return a.attr + ' ' + w; }, frame: [a.attr] })
        : G.soon(tts ? tts.sentence(phrase + '!') : null).then(function () { return null; });
      said.then(function (r) {
        if (!alive()) return;
        act.innerHTML = '';
        if (r) { ctx.emit(E.say(n, r)); }
        ctx.good(!r || (r.by === 'speech' && r.tries === 0));
        /* 나온다 — 고른 대로 */
        out.innerHTML = ''; var e = h('span', 'so-art', pic[n]); out.appendChild(e); out.className = 'vd-out on';
        if (S.audio) S.audio.play('tray');
        if (a.kind === 'color') { if (fx) { fx.tint(e, a.attr); fx.puff(e); } }
        else if (a.attr === 'big') { if (fx) fx.giant(e, { scale: 2.4, ms: 600 }); }
        else out.classList.add('tiny');
        made.push(phrase); i++;
        later(CONF.outMs, function () {
          out.className = 'vd-out'; out.innerHTML = ''; selA = selN = null;
          if (i >= CONF.makes) { draw(); return done({ completed: true, results: made.slice() }); }     /* 다 만들었으면 카드는 잠근 채로 끝 */
          busy = false; later(CONF.nextMs, draw);
        });
      });
    }
    var done, finished = new Promise(function (r) { done = r; });
    G.soon(ctx.intro, null).then(function () { if (alive()) draw(); });
    draw();
    return finished;
  }

  g.PlayVending = { CONF: CONF, cards: cards, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'vending', no: 4, name: '마법 자판기', icon: 'vending', channels: ['make', 'say'], axis: 'make', need: { lv1: 15 },
    fits: function (zone) { var c = cards(zone.silly); return c.attrs.length >= 2 && c.nouns.length >= 2; },
    count: function (c) { return CONF.makes * (c.learner && c.learner.mic && c.learner.mic.ok() ? 2 : 1); },
    intro: { en: 'Big? Small?', ko: '마법 자판기야 — 카드 둘을 골라서 네 마음대로 만들어 봐!' },
    start: start
  });
})(window);
