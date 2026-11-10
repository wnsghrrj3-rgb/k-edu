/* ============================================================
 * 영어 놀이터 — 놀이 #26 「말하는 정원(씨앗 돌보기)」 (게임설계 v1 §4-26 · 기본 설계 §5)
 *   오늘 기한이 된 씨앗(심은 지 1·3·7일)을 다시 말해 주면 자란다 — 매일 첫 장면.
 *   말로 통과해야 자란다. 골라서 끝내면 그대로(내려가지도 않는다) — 내일 다시.
 *   공통 인터페이스: start(ctx) — ctx.targets = 오늘 돌볼 단어들. 증거 = 말하기(say)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    showMs: 1100,     /* 자란 모습을 보여 주는 시간(ms) */
    endMs: 1500       /* 끝 화면에서 다음으로 넘어가기까지(이어지는 놀이가 있을 때) */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function start(ctx) {
    var S = ctx.services || {}, seed = S.seed, E = g.PlayEvidence, sam = S.sam || { say: function () { return Promise.resolve(); }, react: function () {} };
    var STAGE = (seed && seed.STAGE) || [{ icon: 'seed', name: '씨앗' }, { icon: 'sprout', name: '새싹' }, { icon: 'flower', name: '꽃' }, { icon: 'fruit', name: '열매' }];
    var IC = function (st) { return g.PlayIcon.html(STAGE[st].icon); };
    var due = (ctx.targets || []).slice(), pic = {}; (ctx.pool || ctx.targets || []).forEach(function (x) { pic[x.w] = x.pic; }); due.forEach(function (x) { pic[x.w] = x.pic; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'gd'), dots = h('div', 'dots'), counter = h('div', 'counter');
    root.appendChild(dots); root.appendChild(counter); host.appendChild(root);
    var i = 0, grown = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }

    return new Promise(function (resolve) {
      function end() {
        dots.innerHTML = due.map(function () { return '<i class="ok"></i>'; }).join('');
        counter.innerHTML = '<div class="gd-ch" id="ch"></div><div class="word gd-end">오늘 돌보기 끝!</div><div class="hint">' + (grown ? new Array(grown + 1).join(g.PlayIcon.html('sprout')) + ' 자랐어요' : '내일 또 와요') + '</div>';
        if (S.char && seed) S.char.render(counter.querySelector('#ch'), { parts: seed.parts(), mood: 'cheer' });
        if (S.audio) S.audio.play('done');
        if (grown && S.fx) S.fx.confetti();
        setTimeout(function () { resolve({ completed: true }); }, ctx.opt && ctx.opt.last ? 0 : CONF.endMs);
      }
      function next() {
        if (!alive()) return;
        dots.innerHTML = due.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= due.length) return end();
        var w = due[i].w, st = seed && seed.get(w) ? seed.get(w).stage : 0;
        counter.innerHTML = '<div class="seed s' + st + ' gd-seed">' + IC(st) + '</div><div class="pic big">' + pic[w] + '</div><div class="word">' + w + '</div>';
        ctx.say(w).then(function () {
          if (!alive()) return;
          return g.PlayTutor.ask(ctx, { host: counter, target: w, kind: 'word' });
        }).then(function (r) {
          if (!r || !alive()) return;
          var ev = ctx.emit(E.say(w, r));
          ctx.good(r.by === 'speech' && r.tries === 0);
          var s2 = seed && seed.get(w) ? seed.get(w) : { stage: st }, grew = !!(ev && ev.seed && ev.seed.grew);
          if (grew) grown++;
          counter.innerHTML = '<div class="seed s' + s2.stage + ' grow gd-seed big">' + IC(s2.stage) + '</div><div class="word">' + w + '</div><div class="hint">' + (grew ? STAGE[s2.stage].name + '이 됐어요!' : r.by === 'speech' ? '잘 자라고 있어요' : '내일 말해 주면 자라요') + '</div>';
          i++; setTimeout(next, CONF.showMs);
        });
      }
      if (!due.length) {
        sam.say('Nothing to water today.', '오늘 돌볼 씨앗은 없어요');
        counter.innerHTML = '<div class="hint">내일 또 와요</div>';
        return resolve({ completed: true });
      }
      next();
    });
  }

  g.PlayGarden = { CONF: CONF, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'garden', no: 26, name: '씨앗 돌보기', icon: 'plant', channels: ['say'], axis: 'grow', need: {},
    count: function (c) { return (c.targets || []).length; },
    intro: { en: 'Water your seeds!', ko: '씨앗을 돌봐 줘 — 다시 말하면 자라!' },
    intro1: { en: 'Hi!', ko: '어제 심은 씨앗에게 다시 말해 주자!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
