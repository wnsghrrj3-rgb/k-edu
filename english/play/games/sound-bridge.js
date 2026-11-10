/* ============================================================
 * 영어 놀이터 — 놀이 #14 「소리 다리」 + 조각 맞추기 공통(PlaySoundBuild) (게임설계 v1 §4-14·15 · 소리·손)
 *   단어를 들려준다 → 빈칸마다 맞는 소리 조각을 차례로 놓는다 → 다 놓이면 조각이 하나씩 울리며 합쳐지고(블렌딩) 다리를 건넌다.
 *   다리 = 조각 사이에 헷갈리는 조각이 섞여 있다(무엇을 놓을까) · 기차(#15, sound-train.js) = 섞인 칸을 차례대로 잇는다(어떤 차례일까).
 *   재료는 「조립할 수 있는 단어」만(PlayPhonics.buildable — 그 칸까지 배운 소리·묶음으로만 된 단어).
 *   실패 지원: 다른 조각을 누르면 그 조각만 흔들리고, 단어를 느리게 한 조각씩 다시 들려준다. 실패로 끝나는 길 없음.
 *   공통 인터페이스: start(ctx) — 증거 = 합치기(blend) · 대상은 단어
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    words: 4,          /* 한 번에 만드는 단어 수 */
    extra: 2,          /* 다리: 섞어 두는 헷갈리는 조각 수 */
    crossMs: 1100,     /* 건너가는(달리는) 연출 길이 */
    nextMs: 500
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 이번에 만들 단어들 — 조립할 수 있는 제 단어 중에서, 씨앗 없는 것·다시 볼 것(ctx.targets 의 앞쪽)을 먼저 */
  function pick(ctx, n) {
    var P = g.PlayPhonics, id = (ctx.zone && ctx.zone.id) || ctx.cell, okW = {};
    P.own(id).forEach(function (x) { if (P.buildable(x.w, id)) okW[x.w] = x; });
    var first = (ctx.targets || []).map(function (x) { return okW[x.w]; }).filter(Boolean), rest = shuffle(Object.keys(okW).map(function (k) { return okW[k]; }).filter(function (x) { return first.indexOf(x) < 0; }));
    return first.concat(rest).slice(0, n);
  }

  /* skin 'bridge' | 'train' */
  function run(ctx, skin) {
    var S = ctx.services || {}, P = g.PlayPhonics, E = g.PlayEvidence, tts = S.tts, cellId = (ctx.zone && ctx.zone.id) || ctx.cell;
    var words = (ctx.opt && ctx.opt.words) || pick(ctx, CONF.words);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sb sb-' + skin), dots = h('div', 'dots'), pic = h('div', 'sb-pic'), track = h('div', 'sb-track'), tray = h('div', 'sb-tray'), rep = h('button', 'btn w pp-rep', '🔊'); rep.type = 'button';
    root.appendChild(dots); root.appendChild(pic); root.appendChild(track); root.appendChild(tray); root.appendChild(rep); host.appendChild(root);
    var i = 0, cur = null;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function slow(x) { return g.PlayGame.soon(tts && tts.blend ? tts.blend(P.sounds(x), { passes: 1, word: x.w }) : null, 9000); }
    rep.onclick = function () { if (cur) slow(cur); };

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = words.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= words.length) return resolve({ completed: true });
        var x = words[i], t = x.t, snd = P.sounds(x), at = 0, clean = true, tries = 1, busy = false;
        cur = x;
        pic.innerHTML = (x.pic ? '<span class="sb-emoji">' + x.pic + '</span>' : '') + '<span class="sb-walker">' + (skin === 'train' ? '🚂' : '🧒') + '</span>';
        track.innerHTML = ''; tray.innerHTML = ''; track.className = 'sb-track';
        var slots = t.map(function () { var s = h('div', 'sb-slot'); track.appendChild(s); return s; });
        slots[0].classList.add('next');
        var extra = [];
        if (skin === 'bridge') t.forEach(function (k) { P.distract(k, cellId, 1).forEach(function (d) { if (extra.length < CONF.extra && t.indexOf(d) < 0 && extra.indexOf(d) < 0) extra.push(d); }); });
        shuffle(t.concat(extra)).forEach(function (k) {
          var b = h('button', 'sb-block', k); b.type = 'button'; b.setAttribute('data-u', k);
          b.onclick = function () {
            if (busy || b.classList.contains('used')) return;
            if (k !== t[at]) { clean = false; tries++; b.classList.add('no'); ctx.oops(); later(380, function () { b.classList.remove('no'); }); return slow(x); }
            b.classList.add('used'); slots[at].textContent = k; slots[at].classList.remove('next'); slots[at].classList.add('full');
            if (tts) P.say(tts, snd[at]);
            at++;
            if (at < t.length) return slots[at].classList.add('next');
            /* 다 놓았다 — 조각이 하나씩 울리며 합쳐진다 */
            busy = true;
            var blend = tts && tts.blend ? tts.blend(snd, { word: x.w, onPiece: function (n) { slots.forEach(function (s, q) { s.classList.toggle('ring', q === n); }); }, onWord: function () { slots.forEach(function (s) { s.classList.remove('ring'); }); track.classList.add('joined'); } }) : null;
            g.PlayGame.soon(blend, 12000).then(function () {
              if (!alive()) return;
              track.classList.add('joined', 'cross'); pic.classList.add('cross');
              ctx.good(clean); ctx.emit(E.act(x.w, 'blend', 'touch', clean, tries));
              later(CONF.crossMs, function () { pic.classList.remove('cross'); i++; later(CONF.nextMs, round); });
            });
          };
          tray.appendChild(b);
        });
        /* 다리는 단어를 통째로, 기차는 한 조각씩 천천히 들려준다(차례를 귀로 듣게) */
        if (skin === 'train') slow(x); else g.PlayGame.soon(tts ? tts.word(x.w) : null);
      }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlaySoundBuild = { CONF: CONF, pick: pick, run: run };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sound-bridge', no: 14, name: '소리 다리', icon: '🌉', channels: ['hand', 'sound'], axis: 'quest', need: { lv1: 4 },
    count: function (c) { return Math.min(CONF.words, pick(c, CONF.words).length); },
    intro: { en: 'Go! Go!', ko: '소리 조각을 차례로 놓아 다리를 이어 줘!' },
    start: function (ctx) { return run(ctx, 'bridge'); }
  });
})(window);
