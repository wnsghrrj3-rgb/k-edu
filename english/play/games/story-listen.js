/* ============================================================
 * 영어 놀이터 — 놀이 #34 「이야기 듣기」 (설계 v2 §4-34 · 듣기 · 지문(text) 길의 꽃)
 *   짧은 이야기를 귀로만 듣고(글자 없이) 장면 카드를 들은 차례로 놓는다.
 *   지문 둘~셋을 섞은 차례로 들려준다 → 장면 카드를 그 차례대로 누른다. 다 놓으면 처음부터 한 번 더 들려준다.
 *   실패 지원: 차례가 아닌 카드 → 그 카드만 내려앉고, 지금 놓을 자리의 이야기를 한 문장씩 다시.
 *   공통 인터페이스: start(ctx) — 증거 = 듣기(listen · touch · unit text) — 대상은 지문
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { cards: 3, gapMs: 500, doneMs: 900 };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function texts(zone) { return ((zone && zone.words) || []).filter(function (x) { return x.path === 'text' && x.pic; }); }

  function start(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, G = g.PlayGame, tts = S.tts;
    var pool = (ctx.targets && ctx.targets.length ? ctx.targets.filter(function (x) { return x.path === 'text'; }) : texts(ctx.zone)), order = shuffle(pool).slice(0, CONF.cards);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sl'), slots = h('div', 'sl-slots'), cards = h('div', 'sl-cards'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(slots); root.appendChild(cards); root.appendChild(rep); host.appendChild(root);
    var at = 0, miss = {}, over = false;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function tell(x, slow) { return G.soon(tts ? tts.sentence(x.w, slow ? { rate: 0.7 } : undefined) : null, 12000); }
    function tellAll() { return order.reduce(function (p, x, k) { return p.then(function () { if (!alive()) return; mark(k); return tell(x); }).then(function () { return new Promise(function (r) { setTimeout(r, CONF.gapMs); }); }); }, Promise.resolve()).then(function () { mark(-1); }); }
    function mark(k) { Array.prototype.forEach.call(slots.children, function (s, n) { s.classList.toggle('now', n === k); }); }
    rep.onclick = function () { if (!over && order[at]) tell(order[at], true); };
    return new Promise(function (resolve) {
      if (order.length < 2) return resolve({ completed: true });
      slots.innerHTML = order.map(function (_, k) { return '<span class="sl-slot" data-k="' + k + '">' + (k + 1) + '</span>'; }).join('');
      shuffle(order).forEach(function (x) {
        var b = h('button', 'tile sl-card', x.pic); b.type = 'button'; b.setAttribute('data-w', x.w);
        b.onclick = function () {
          if (over || b.disabled) return;
          if (x !== order[at]) { miss[order[at].w] = (miss[order[at].w] || 0) + 1; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); ctx.oops(); return tell(order[at], true); }
          b.disabled = true; b.classList.add('ok');
          var sl = slots.children[at]; sl.innerHTML = x.pic; sl.classList.add('full');
          var n = miss[x.w] || 0; ctx.emit(E.make({ targetId: x.w, skill: 'listen', outcome: n ? 'assisted' : 'independent', inputMode: 'touch', attempts: n + 1, unit: 'text', support: n ? 'slow' : 'none' })); ctx.good(!n, { at: b });
          at++;
          if (at >= order.length) { over = true; tellAll().then(function () { setTimeout(function () { if (alive()) resolve({ completed: true }); }, CONF.doneMs); }); }
        };
        cards.appendChild(b);
      });
      G.soon(ctx.intro, null).then(function () { if (alive()) tellAll(); });
    });
  }

  g.PlayStoryListen = { CONF: CONF, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'story-listen', no: 34, name: '이야기 듣기', icon: 'ear', channels: ['ear'], axis: 'quest', need: {},
    skills: ['L'], unit: 'text', serves: [2],
    fits: function (zone) { return texts(zone).length >= 2; },
    count: function (c) { return Math.min(CONF.cards, texts(c.zone).length); },
    intro: { en: 'Listen!', ko: '이야기를 듣고 장면을 들은 차례대로 놓아 줘!' },
    start: start
  });
})(window);
