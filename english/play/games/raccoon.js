/* ============================================================
 * 영어 놀이터 — 놀이 #6 「도둑 너구리」 (게임설계 v1 §4-6 · 귀 · 발견)
 *   너구리가 덤불 뒤에 동물·물건을 숨겼다 → 너구리가 그 이름을 영어로 흘린다(단서 = 이름만 — 전치사 0) → 아이가 그 덤불을 찾는다.
 *   다른 덤불을 열면 거기 숨어 있던 것이 나와 제 이름을 한 번 들려주고 빠진다(탐색 범위 축소) — 찾을 때까지, 실패로 끝나는 길 없음.
 *   Lv1 #13(색)·#15(크기) 칸에 오면 단서에 색·크기를 더한다(W10 — 지금은 이름만).
 *   PlayRaccoon.plan(targets, pool, o) — 화면 없는 판 짜기(검사는 여기를 직접 본다)
 *   공통 인터페이스: start(ctx) — 증거 = 듣기(listen) · 대상은 단어 — 씨앗과는 무관(입으로 한 것이 아니므로)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 5,         /* 한 번에 찾는 수 */
    bushes: 3,         /* 덤불 수(대상 하나 + 다른 것) */
    peekMs: 900,       /* 잘못 연 덤불에서 나온 것을 보여 주는 시간 */
    nextMs: 1000
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffler(rng) { return function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }; }

  /* 판마다 { target, hidden[] } — 숨긴 것은 대상 + 그림이 있는 다른 단어(헷갈리는 짝은 같은 판에 넣지 않는다) */
  function plan(targets, pool, o) {
    o = o || {};
    var shuffle = shuffler(o.rng || Math.random), n = Math.min(o.rounds || CONF.rounds, targets.length), k = o.bushes || CONF.bushes, confuse = o.confuse || [];
    var all = pool.map(function (x) { return x.w; });
    return targets.slice(0, n).map(function (x) {
      var bad = {}; confuse.forEach(function (p) { if (p[0] === x.w) bad[p[1]] = 1; if (p[1] === x.w) bad[p[0]] = 1; });
      var others = shuffle(all.filter(function (w) { return w !== x.w && !bad[w]; })).slice(0, k - 1);
      return { target: x.w, hidden: shuffle([x.w].concat(others)) };
    });
  }

  function start(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, A = g.PlayArt, tts = S.tts, audio = S.audio || { play: function () {} };
    var pool = ctx.pool || ctx.targets || [], pic = {}; pool.forEach(function (x) { pic[x.w] = x.pic; });
    var rounds = plan(ctx.targets || [], pool, { confuse: (ctx.zone && ctx.zone.confuse) || [] });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'rc'), dots = h('div', 'dots'), top = h('div', 'rc-top'), field = h('div', 'rc-field'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    top.innerHTML = '<span class="rc-thief">' + A.html('raccoon') + '</span><span class="rc-clue" id="rcClue"></span>';
    root.appendChild(dots); root.appendChild(top); root.appendChild(field); root.appendChild(rep); host.appendChild(root);
    var clue = top.querySelector('.rc-clue'), thief = top.querySelector('.rc-thief');
    var i = 0, cur = null;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function say(w) { return g.PlayGame.soon(tts ? tts.word(w) : null); }
    rep.onclick = function () { if (cur) { clue.classList.remove('pop'); void clue.offsetWidth; clue.classList.add('pop'); say(cur); } };

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = rounds.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= rounds.length) { thief.classList.add('gone'); return resolve({ completed: true }); }
        var r = rounds[i], tries = 1, clean = true, done = false;
        cur = r.target; field.innerHTML = ''; thief.classList.remove('caught');
        clue.innerHTML = g.PlayIcon.html('ear'); clue.classList.add('pop');
        r.hidden.forEach(function (w) {
          var b = h('button', 'rc-bush', '<span class="rc-leaf">' + A.html('bush') + '</span><span class="rc-in">' + (pic[w] || w) + '</span>'); b.type = 'button'; b.setAttribute('data-w', w);
          b.onclick = function () {
            if (done || b.disabled) return;
            b.classList.add('open');
            if (w !== r.target) {          /* 다른 것 — 나와서 제 이름을 한 번 말하고 빠진다 */
              clean = false; tries++; b.disabled = true; ctx.oops(); say(w);
              later(CONF.peekMs, function () { b.classList.add('out'); say(r.target); });
              return;
            }
            done = true; b.classList.add('ok'); thief.classList.add('caught'); audio.play('ok');
            ctx.good(clean, { at: b }); ctx.emit(E.act(w, 'listen', 'touch', clean, tries));
            i++; later(CONF.nextMs, round);
          };
          field.appendChild(b);
        });
        audio.play('enter'); say(r.target);
      }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlayRaccoon = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'raccoon', no: 6, name: '도둑 너구리', icon: 'paw', channels: ['ear'], axis: 'find', need: { lv1: 5 },
    fits: function (zone) { return (zone.words || []).filter(function (x) { return g.PlayArt && g.PlayArt.has(x.art || x.w); }).length >= CONF.bushes; },     /* 그린 그림이 있는 단어가 덤불 수만큼 */
    count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length); },
    intro: { en: 'Oh!', ko: '너구리가 무언가를 덤불에 숨겼어 — 이름을 듣고 찾아 줘!' },
    start: start
  });
})(window);
