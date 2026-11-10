/* ============================================================
 * 영어 놀이터 — 「읽어 주기」(소리 공방의 말하기 놀이) + 단어 한 장 읽기 공통(PlayReader)
 *   소리 기계가 단어 카드를 찍어 낸다 → 아이가 소리 내어 읽는다(먼저 들려주지 않는다 — 읽기) → 읽으면 그림이 나타난다.
 *   🔊 를 누르면 한 조각씩 천천히 들려준다(도움 — 그 뒤에 읽으면 「도움 받고 읽음」으로 적힌다).
 *   못 알아들었을 때: 한 번 더 → 천천히 조각으로 들려줌 → 글자 둘 중 고르기(그때는 큰 글자를 가리고, 들려준 소리에 맞는 글자를 찾는다).
 *   씨앗은 말로 읽어 낸 단어에만(PlayGame.run 이 정한다) — 이 무대에서 단어를 심는 놀이.
 *   공통 인터페이스: start(ctx) — 증거 = 말하기(say)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    words: 6,          /* 한 번에 읽는 단어 수 */
    showMs: 900        /* 읽은 뒤 그림을 보여 주는 시간 */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* 단어 한 장 — host 에 카드를 그리고 읽기를 기다린다. → Promise({ word, by, tries, hinted, mic }) */
  function one(ctx, host, x, o) {
    o = o || {};
    var S = ctx.services || {}, P = g.PlayPhonics, tts = S.tts, helped = false;
    host.innerHTML = '';
    var card = h('div', 'rd-card', P ? P.html(x) : x.w), help = h('button', 'btn w pp-rep', '🔊'), act = h('div', 'oq-act'); help.type = 'button';
    host.appendChild(card); host.appendChild(help); host.appendChild(act);
    var model = function (slowly) { helped = true; return tts && tts.blend && P ? tts.blend(P.sounds(x), { passes: slowly ? 1 : 2, word: x.w }) : (tts ? tts.word(x.w) : null); };
    help.onclick = function () { model(true); };
    return g.PlayTutor.ask(ctx, {
      host: act, target: x.w, kind: 'word', hint0: true, offerText: true, model: model,
      onOffer: function () { card.innerHTML = '<span class="rd-ear">🔊</span>'; card.classList.add('ear'); help.style.display = 'none'; }     /* 고르기로 넘어가면 큰 글자를 가린다 */
    }).then(function (r) {
      if (!r) return r;
      if (helped) r.hinted = true;
      card.classList.remove('ear'); card.classList.add('done');
      card.innerHTML = (x.pic ? '<span class="rd-pic">' + x.pic + '</span>' : '') + (P ? P.html(x) : x.w); help.style.display = 'none';
      return r;
    });
  }

  function start(ctx) {
    var E = g.PlayEvidence, words = (ctx.targets || []).slice(0, CONF.words);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'rd'), dots = h('div', 'dots'), stage = h('div', 'rd-stage');
    root.appendChild(dots); root.appendChild(stage); host.appendChild(root);
    var i = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    return new Promise(function (resolve) {
      function next() {
        if (!alive()) return;
        dots.innerHTML = words.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= words.length) return resolve({ completed: true });
        var x = words[i];
        one(ctx, stage, x).then(function (r) {
          if (!r || !alive()) return;
          ctx.emit(E.say(x.w, r));
          ctx.good(r.by === 'speech' && !r.hinted && r.tries === 0);
          i++; setTimeout(next, CONF.showMs);
        });
      }
      g.PlayGame.soon(ctx.intro, null).then(next);
    });
  }

  g.PlayReader = { CONF: CONF, one: one, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'read-aloud', no: 0, name: '읽어 주기', icon: '🗣️', channels: ['say', 'read'], axis: 'talk', need: { lv1: 8 }, plants: true,
    count: function (c) { return Math.min(CONF.words, (c.targets || []).length); },
    intro: { en: 'Read it!', ko: '기계가 찍어 낸 단어를 소리 내어 읽어 줘!' },
    start: start
  });
})(window);
