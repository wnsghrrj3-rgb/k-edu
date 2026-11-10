/* ============================================================
 * 영어 놀이터 — 놀이 #22 「그림책 넘기기」 (게임설계 v1 §4-22 · 읽기 · 모험) — W06 은 단어 쪽(Lv1 #8 단어와 그림)
 *   그림책 한 쪽에 단어가 적혀 있고 그림 칸은 안개로 가려져 있다 → 아이가 소리 내어 읽는다(먼저 들려주지 않는다 — 읽기)
 *   → 그림이 나타나 움직이고 책장이 넘어간다. 「읽기 = 소리 + 뜻」의 첫 연결(펼침 8-1).
 *   못 알아들었을 때: 한 번 더 → 천천히 함께 → 그림 둘 중 그 단어의 그림 고르기(펼침 8-2 「단어 읽고 맞는 그림에」 — 그때는 도움 받은 것으로 적힘).
 *   문장 쪽(Lv1 #17 「I see a cat.」 — 읽으면 장면이 움직인다)은 그림책방(W10)에서 같은 모듈로.
 *   공통 인터페이스: start(ctx) — 증거 = 말하기(say) · 씨앗은 말로 읽어 낸 단어에만(PlayGame.run 이 정한다)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    pages: 6,          /* 한 번에 넘기는 쪽 수 */
    showMs: 1100,      /* 그림이 움직이는 시간 */
    turnMs: 420        /* 책장 넘기는 시간 */
  };
  function drawn(x) { return !!g.PlayArt && g.PlayArt.has(x.art || x.w); }     /* 그린 그림이 있는 단어만 — 그림이 나타나는 책이므로 */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function start(ctx) {
    var E = g.PlayEvidence, words = (ctx.targets || []).filter(drawn).slice(0, CONF.pages);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'pb'), dots = h('div', 'dots'), book = h('div', 'pb-book'), act = h('div', 'oq-act');
    root.appendChild(dots); root.appendChild(book); root.appendChild(act); host.appendChild(root);
    var i = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    return new Promise(function (resolve) {
      function page() {
        dots.innerHTML = words.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= words.length) return resolve({ completed: true });
        var x = words[i];
        book.className = 'pb-book'; act.innerHTML = '';
        book.innerHTML = '<div class="pb-page pb-l"><span class="pb-word">' + x.w + '</span></div><div class="pb-page pb-r"><span class="pb-fog">' + g.PlayIcon.html('cloud') + '</span><span class="pb-pic">' + x.pic + '</span></div>';
        book.setAttribute('data-w', x.w);
        g.PlayTutor.ask(ctx, { host: act, target: x.w, kind: 'word', hint0: true }).then(function (r) {
          if (!r || !alive()) return;
          ctx.emit(E.say(x.w, r));
          ctx.good(r.by === 'speech' && !r.hinted && r.tries === 0);
          book.classList.add('seen');          /* 안개가 걷히고 그림이 움직인다 */
          later(CONF.showMs, function () { book.classList.add('turn'); later(CONF.turnMs, function () { i++; page(); }); });
        });
      }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) page(); });
    });
  }

  g.PlayPictureBook = { CONF: CONF, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'picture-book', no: 22, name: '그림책', icon: 'book', channels: ['say', 'read'], axis: 'quest', need: { lv1: 8 }, plants: true,
    fits: function (zone) { return (zone.words || []).filter(drawn).length >= 4; },
    count: function (c) { return Math.min(CONF.pages, (c.targets || []).filter(drawn).length); },
    intro: { en: 'Oh!', ko: '그림책을 펼쳤어 — 단어를 읽으면 그림이 나타나!' },
    start: start
  });
})(window);
