/* ============================================================
 * 영어 놀이터 — 놀이 #30 「글자 길」 (설계 v2 §4-30 · 씨앗 letter 길의 꽃·열매 · W14)
 *   흙길 위에 손가락으로 글자를 쓴다. 그날 묶음 글자만(알파벳 칸 = 오늘의 소리 묶음 · 한 해 길의 걸음 = 그 걸음의 글자).
 *     꽃(따라 쓰기)   — 글자와 소리를 보여 주고, 시작 점에서 출발해 획을 차례대로 따라간다. 시작 점을 눌러야 잉크가 나온다(획 차례는 여기서만 요구).
 *     열매(소리 듣고 쓰기) — 글자는 감추고 소리만. 혼자 쓴다. 안 되면 옅은 유령 → 따라 쓰기(한 획씩)로 내려간다.
 *   어느 쪽인지는 그 글자의 씨앗이 정한다(꽃까지 자란 글자 = 소리 듣고 쓰기 · 그 전 = 따라 쓰기). 자라는 것은 씨앗 엔진이 간격을 보고 정한다.
 *   지나간 자리에는 발자국(획이 길로 남는다). 틀렸다는 말 0 — 안 된 획은 사라지고 시범이 다시 나온다.
 *   공통 인터페이스: start(ctx) — ctx.targets 에 글자(path 'letter')가 있으면 그것, 없으면 구역의 오늘 글자. 증거 = 쓰기(write · pen · unit letter)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    letters: 4,       /* 한 판에 쓰는 글자 수 */
    nextMs: 500       /* 다 쓴 글자를 보여 주고 다음으로 */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  /* 그 구역에서 오늘 쓸 글자 */
  function lettersOf(zone, cellId) {
    var P = g.PlayPhonics, W = g.PlayWrite, list = [];
    if (zone && zone.step) list = (zone.letterItems || []).map(function (x) { return x.w; });
    else if (zone && zone.letters && P && P.units) list = P.units(cellId || zone.id);
    return list.filter(function (k) { return k.length === 1 && W && W.isLetter(k); });
  }

  function start(ctx) {
    var S = ctx.services || {}, seed = S.seed, E = g.PlayEvidence, G = g.PlayGame, W = g.PlayWrite, P = g.PlayPhonics, tts = S.tts;
    var list = (ctx.targets || []).filter(function (x) { return x && x.path === 'letter'; }).map(function (x) { return x.w; });
    if (!list.length) list = lettersOf(ctx.zone, ctx.cell);
    list = list.slice(0, CONF.letters);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'lp'), dots = h('div', 'dots'), head = h('div', 'lp-head'), sheet = h('div', 'lp-sheet');
    root.appendChild(dots); root.appendChild(head); root.appendChild(sheet); host.appendChild(root);
    var i = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function sound(ch) { return G.soon(P && P.say && tts ? P.say(tts, ch) : (tts ? tts.word(ch) : null)); }
    return new Promise(function (resolve) {
      function next() {
        if (!alive()) return;
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        var ch = list[i], s = seed && seed.get ? seed.get(seed.key ? seed.key(ch, 'letter') : ch) : null, hand = (ctx.opt && ctx.opt.hand) || '', hear = hand === 'free' || (!hand && !!(s && s.stage >= 2));      /* hand = 점검용 모드 */
        head.innerHTML = (hear ? '<span class="lp-letter lp-hid">' + g.PlayIcon.html('ear') + '</span>' : '<span class="lp-letter">' + ch + '</span>') + '<button type="button" class="btn w pp-rep lp-ear">' + g.PlayIcon.html('speaker') + '</button>';
        head.setAttribute('data-letter', ch); head.setAttribute('data-kind', hear ? 'hear' : 'trace');
        head.querySelector('.lp-ear').onclick = function () { sound(ch); };
        sheet.innerHTML = '';
        sound(ch);
        W.write(sheet, { text: ch, mode: hear ? 'free' : hand === 'faint' ? 'faint' : 'trace', strict: true, key: ch, onMiss: function () { ctx.oops(); sound(ch); } }).then(function (res) {
          if (!alive()) return;
          ctx.emit(E.write(ch, { skill: 'write', support: res.support, clean: res.clean, attempts: res.attempts, inputMode: 'pen', unit: 'letter' }));
          ctx.good(res.clean, { at: sheet });
          head.querySelector('.lp-letter').className = 'lp-letter'; head.querySelector('.lp-letter').textContent = ch;
          sound(ch);
          i++; setTimeout(next, CONF.nextMs);
        });
      }
      if (!list.length || !W) return resolve({ completed: true });
      G.soon(ctx.intro, null).then(function () { if (alive()) next(); });
    });
  }

  g.PlayLetterPath = { CONF: CONF, lettersOf: lettersOf, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'letter-path', no: 30, name: '글자 길', icon: 'pencil', channels: ['hand'], axis: 'make', need: {},
    skills: ['W'], unit: 'letter', serves: [2, 3],
    fits: function (zone) { return !!(g.PlayWrite && g.PlayWrite.available()) && lettersOf(zone).length > 0; },
    count: function (c) { var n = (c.targets || []).filter(function (x) { return x && x.path === 'letter'; }).length || lettersOf(c.zone, c.cell).length; return Math.min(CONF.letters, n); },
    intro: { en: 'Look!', ko: '점에서 출발해 손가락으로 글자 길을 따라가 줘!' },
    intro1: { en: 'Oh!', ko: '점에서 출발해 손가락으로 글자 길을 따라가 줘!' },
    start: start
  });
})(window);
