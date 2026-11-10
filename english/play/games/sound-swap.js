/* ============================================================
 * 영어 놀이터 — 놀이 #16 「소리 변신」 (게임설계 v1 §4-16 · 소리 · 웃음)
 *   단어 하나가 조각으로 놓여 있다 → 새 단어를 들려준다 → 한 조각만 바꾸면 그 단어가 된다. 바꿀 조각을 고르면 「뿅」 하고 변한다.
 *   cap → cape(끝에 조용한 e) · ship → shop · sip → ship … 짝은 재료에서 스스로 찾는다(PlayPhonics.pairs — 한 소리만 다른, 둘 다 조립할 수 있는 단어).
 *   실패 지원: 다른 조각을 고르면 「바뀐 소리」를 두 단어로 나란히 들려준다(앞 단어 → 새 단어). 실패로 끝나는 길 없음.
 *   공통 인터페이스: start(ctx) — 증거 = 합치기(blend) · 대상은 새 단어
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 4,
    options: 3,
    morphMs: 1300,     /* 변신 장면 길이 */
    nextMs: 500
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 이번 판들 — 새 단어(to)가 겹치지 않게, 새로 배운 소리가 바뀌는 짝을 먼저 */
  function plan(cellId, n) {
    var P = g.PlayPhonics, c = P.cell(cellId), fresh = c ? c.units.concat(c.known.filter(function (k) { return /_e$/.test(k) && c.review; })) : [];
    var all = shuffle(P.pairs(cellId)), hot = all.filter(function (p) { return fresh.indexOf(p.to.t[p.at]) >= 0; }), rest = all.filter(function (p) { return hot.indexOf(p) < 0; });
    var out = [], used = {};
    hot.concat(rest).forEach(function (p) { if (out.length < n && !used[p.to.w]) { used[p.to.w] = 1; out.push(p); } });
    return out;
  }

  function start(ctx) {
    var S = ctx.services || {}, P = g.PlayPhonics, E = g.PlayEvidence, tts = S.tts, cellId = (ctx.zone && ctx.zone.id) || ctx.cell;
    var rounds = (ctx.opt && ctx.opt.pairs) || plan(cellId, CONF.rounds);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sw'), dots = h('div', 'dots'), thing = h('div', 'sw-thing'), row = h('div', 'sb-track sw-row'), opts = h('div', 'sb-tray'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(dots); root.appendChild(thing); root.appendChild(row); root.appendChild(opts); root.appendChild(rep); host.appendChild(root);
    var i = 0, cur = null;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function word(w, rate) { return g.PlayGame.soon(tts ? tts.word(w, rate ? { rate: rate } : undefined) : null); }
    function show(x) { thing.innerHTML = x.pic ? '<span class="sw-emoji">' + x.pic + '</span>' : P.html(x); }
    rep.onclick = function () { if (cur) word(cur.to.w); };

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = rounds.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= rounds.length) return resolve({ completed: true });
        var p = rounds[i], a = p.from, b = p.to, want = b.t[p.at], clean = true, tries = 1, done = false;
        cur = p; show(a); row.innerHTML = ''; opts.innerHTML = '';
        var slots = a.t.map(function (k, n) { var s = h('div', 'sb-slot full' + (n === p.at ? ' swap' : ''), k); row.appendChild(s); return s; });
        var choices = shuffle([want].concat(P.distract(want, cellId, CONF.options).filter(function (k) { return k !== a.t[p.at]; }).slice(0, CONF.options - 1)));
        choices.forEach(function (k) {
          var btn = h('button', 'sb-block', k); btn.type = 'button'; btn.setAttribute('data-u', k);
          btn.onclick = function () {
            if (done || btn.disabled) return;
            if (k !== want) {
              clean = false; tries++; btn.classList.add('no'); btn.disabled = true; ctx.oops();
              later(380, function () { btn.classList.remove('no'); btn.classList.add('dim'); });
              return word(a.w, 0.5).then(function () { return word(b.w, 0.5); });       /* 바뀐 소리를 나란히 */
            }
            done = true; btn.classList.add('used');
            slots[p.at].textContent = k; slots[p.at].classList.add('ring');
            show(b); if (S.fx) S.fx.puff(thing.firstChild);
            if (S.audio) S.audio.play('pop');
            ctx.good(clean); ctx.emit(E.act(b.w, 'blend', 'touch', clean, tries));
            var bl = tts && tts.blend ? tts.blend(P.sounds(b), { passes: 1, word: b.w }) : null;
            g.PlayGame.soon(bl, 9000).then(function () { i++; later(CONF.nextMs, round); });
          };
          opts.appendChild(btn);
        });
        word(a.w).then(function () { if (alive()) return word(b.w); });
      }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlaySoundSwap = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sound-swap', no: 16, name: '소리 변신', icon: 'wand', channels: ['sound'], axis: 'laugh', need: { lv1: 14 },
    fits: function (zone) { return !!g.PlayPhonics && g.PlayPhonics.pairs(zone.id).length >= 2; },
    count: function (c) { return Math.min(CONF.rounds, plan((c.zone || {}).id, CONF.rounds).length); },
    intro: { en: 'One, two!', ko: '한 조각만 바꾸면 다른 단어가 돼 — 바꿀 조각을 골라 줘!' },
    start: start
  });
})(window);
