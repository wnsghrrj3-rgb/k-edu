/* ============================================================
 * 영어 놀이터 — 놀이 #8 「변신 거울」 (게임설계 v1 §4-8 · 손·말 · 웃음·창작) — W08 에서 완성(기분 칸 lv2-30)
 *   거울 옆에 얼굴 카드 셋 → 아이가 하나를 고르면 거울 속 내가 그 얼굴로 변신한다 → 「I am happy.」 로 말한다.
 *   고르는 것은 아이 — 정답이 없다. 문장틀 = Lv1 #10 「I am ~.」(펼침 30_1 「표정 카드를 틀에 바로 꽂아」).
 *   말은 PlayTutor 3단(모델 → 느리게 → 둘 중 고르기). 증거 = 만들기(build) + 말하기(say) — 씨앗은 말로 한 것(기분 낱말)에만.
 *   공통 인터페이스: start(ctx) → Promise({ completed })
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { rounds: 4, options: 3, showMs: 700, nextMs: 400 };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  /* 고를 거리 — 씨앗 없는 것·다시 볼 것(ctx.targets 앞쪽)부터 셋씩 */
  function plan(zone, n) { return ((zone && zone.words) || []).slice(0, n || CONF.rounds); }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, A = g.PlayArt, tts = S.tts, audio = S.audio || { play: function () {} };
    var left = (ctx.targets || Z.words || []).slice(), n = Math.min(CONF.rounds, left.length), sent = Z.sentence || function (w) { return 'I am ' + w + '.'; };
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'mr'), dots = h('div', 'dots'), glass = h('div', 'mr-glass', '<span class="mr-me">' + A.html('face') + '</span>'), cards = h('div', 'mr-cards'), frame = h('div', 'say', sent('___')), act = h('div', 'oq-act');
    root.appendChild(dots); root.appendChild(glass); root.appendChild(frame); root.appendChild(cards); root.appendChild(act); host.appendChild(root);
    var me = glass.querySelector('.mr-me'), i = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = new Array(n + 1).join('x').split('').map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= n) return resolve({ completed: true });
        cards.innerHTML = ''; act.innerHTML = ''; frame.textContent = sent('___'); frame.classList.remove('done'); glass.classList.remove('on');
        left.slice(0, CONF.options).forEach(function (x) {
          var b = h('button', 'mr-card', x.pic || x.w); b.type = 'button'; b.setAttribute('data-w', x.w);
          b.onclick = function () {
            if (cards.classList.contains('busy')) return; cards.classList.add('busy');
            b.classList.add('ok'); left = left.filter(function (y) { return y !== x; });
            me.innerHTML = x.pic || x.w; glass.classList.add('on'); audio.play('ok');       /* 거울 속 내가 변신 */
            ctx.emit(E.act(x.w, 'build', 'touch', true, 1));
            later(CONF.showMs, function () { say(x); });
          };
          cards.appendChild(b);
        });
        cards.classList.remove('busy');
      }
      function say(x) {
        G.soon(tts ? tts.sentence(sent(x.w)) : null).then(function () {
          if (!alive()) return;
          return g.PlayTutor.ask(ctx, { host: act, cands: [x.w], kind: 'sentence', sentence: sent, frame: ['am', 'i'] });
        }).then(function (r) {
          if (!r || !alive()) return;
          frame.textContent = sent(x.w); frame.classList.add('done');
          ctx.emit(E.say(x.w, r)); ctx.good(r.by === 'speech' && !r.hinted, { at: glass });
          i++; later(CONF.nextMs, round);
        });
      }
      G.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }
  g.PlayMirror = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'mirror', no: 8, name: '변신 거울', icon: 'mirror', channels: ['make', 'say'], axis: 'make', need: { lv1: 13, lv2: 15 }, plants: true,
    fits: function (zone) { return zone.kind === 'feeling' && plan(zone, 1).length > 0; },
    count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length) * 2; },
    intro: { en: 'I am ~.', ko: '거울 앞에서 얼굴을 골라 변신하고 「I am ~.」 로 말해 봐!' },
    start: start
  });
})(window);
