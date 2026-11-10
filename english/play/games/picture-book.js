/* ============================================================
 * 영어 놀이터 — 놀이 #22 「그림책 넘기기」 (게임설계 v1 §4-22 · 읽기 · 모험)
 *   단어 쪽(W06 · Lv1 #8 단어와 그림) — 그림책 한 쪽에 단어, 그림 칸은 안개 → 소리 내어 읽으면 그림이 나타나 움직이고 책장이 넘어간다.
 *     못 알아들었을 때: 한 번 더 → 천천히 함께 → 그림 둘 중 그 단어의 그림 고르기(펼침 8-2 — 그때는 도움 받은 것으로).
 *   문장 쪽(W08 · 그림책방 R칸 Lv2 #9·#17·#26·#33) — 한 쪽에 지문(한두 문장) → 소리 내어 읽으면 장면이 움직인다.
 *     먼저 들려주지 않는다(읽기). 판정 = 지문의 낱말 가운데 6할 이상이 들리면 통과(문장째 외우기가 아니라 읽기).
 *     못 알아들었을 때: 한 번 더 → 천천히 들려줌(도움) → 장면 둘 중 그 지문의 장면 고르기(읽고 그림 고르기 — 펼침 R칸 문항형).
 *     낱말을 누르면 그 낱말만 들려준다(짚어 읽기 — 도움).
 *     「하루」 칸(#33)은 다 읽은 뒤 세 장면을 아침·낮·저녁 차례로 짚는다(33 고유 장치).
 *   특별 손님(그림책방): run(ctx, { guest:true }) — 숙달 지문(③ — 처음 보는 글)부터, 힌트 0.
 *   공통 인터페이스: start(ctx) — 증거 = 말하기(say) · 차례 짚기 = 읽기(read) · 씨앗은 말로 읽어 낸 것에만(PlayGame.run 이 정한다)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    pages: 6,          /* 단어 쪽 — 한 번에 넘기는 쪽 수 */
    storyPages: 3,     /* 문장 쪽 — 한 번에 읽는 지문 수 */
    cover: 0.6,        /* 문장 쪽 통과 — 들린 낱말 비율 */
    listenMs: 9000,
    showMs: 1100,      /* 그림이 움직이는 시간 */
    turnMs: 420        /* 책장 넘기는 시간 */
  };
  function drawn(x) { return !!g.PlayArt && g.PlayArt.has(x.art || x.w); }     /* 그린 그림이 있는 단어만 — 그림이 나타나는 책이므로 */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function toks(s) { return String(s).toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean); }
  /* 들린 글이 지문의 낱말을 얼마나 덮나(0~1) */
  function cover(heard, passage, speech) {
    var want = toks(passage).filter(function (w, i, a) { return a.indexOf(w) === i; }), got = 0;
    want.forEach(function (w) { if (speech ? speech.matchWord(heard, w, []) : toks(heard).indexOf(w) >= 0) got++; });
    return want.length ? got / want.length : 0;
  }

  /* ── 단어 쪽 ── */
  function words(ctx) {
    var E = g.PlayEvidence, list = (ctx.targets || []).filter(drawn).slice(0, CONF.pages);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'pb'), dots = h('div', 'dots'), book = h('div', 'pb-book'), act = h('div', 'oq-act');
    root.appendChild(dots); root.appendChild(book); root.appendChild(act); host.appendChild(root);
    var i = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    return new Promise(function (resolve) {
      function page() {
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        var x = list[i];
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

  /* ── 문장 쪽(그림책방) ── */
  function story(ctx, o) {
    o = o || {};
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, tts = S.tts, speech = S.speech, audio = S.audio || { play: function () {} };
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; }, off: function () {}, primed: function () { return false; }, prime: function () {} };
    var all = (Z.words || []).slice(), list;
    if (o.guest) { var fresh = all.filter(function (x) { return x.role === 'apply'; }); list = fresh.concat(shuffle(all.filter(function (x) { return fresh.indexOf(x) < 0; }))).slice(0, 2); }
    else list = (ctx.targets && ctx.targets.length ? ctx.targets : all).slice(0, CONF.storyPages);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'pb pb-story'), dots = h('div', 'dots'), book = h('div', 'pb-book'), act = h('div', 'oq-act');
    root.appendChild(dots); root.appendChild(book); root.appendChild(act); host.appendChild(root);
    var i = 0, bys = [];
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    return new Promise(function (resolve) {
      function page() {
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return Z.dayOrder && !o.guest ? dayOrder() : resolve({ completed: true, passed: true, by: bys.indexOf('speech') >= 0 ? 'speech' : 'chosen' });
        var x = list[i], tries = 0, helped = false, over = false, listening = false;
        book.className = 'pb-book'; act.innerHTML = ''; book.setAttribute('data-w', x.w);
        book.innerHTML = '<div class="pb-page pb-l"><span class="pb-text">' + toks0(x.w) + '</span></div><div class="pb-page pb-r"><span class="pb-fog">' + g.PlayIcon.html('cloud') + '</span><span class="pb-pic">' + x.pic + '</span></div>';
        Array.prototype.forEach.call(book.querySelectorAll('.pb-tw'), function (s) { s.onclick = function () { if (o.guest) return; helped = true; s.classList.add('hit'); G.soon(tts ? tts.word(s.textContent.replace(/[^A-Za-z]/g, '')) : null).then(function () { s.classList.remove('hit'); }); }; });
        function pass(by) {
          if (over) return; over = true; listening = false;
          var r = { by: by, tries: tries, hinted: helped, mic: mic.ok() };
          bys.push(by); ctx.emit(E.say(x.w, r)); ctx.good(by === 'speech' && !helped && tries === 0, { at: book });
          book.classList.add('seen'); audio.play('ok');           /* 장면이 움직인다 */
          later(CONF.showMs, function () { book.classList.add('turn'); later(CONF.turnMs, function () { i++; page(); }); });
        }
        function offer() {
          act.innerHTML = '<div class="heard">어느 장면일까? 골라 봐</div>';
          var other = shuffle(all.filter(function (y) { return y !== x; }))[0], box = h('div', 'oq-offer pb-offer');
          shuffle([x, other]).forEach(function (y) {
            var t = h('button', 'tile pb-scene', y.pic); t.type = 'button'; t.setAttribute('data-w', y.w);
            t.onclick = function () { if (over || t.disabled) return; if (y === x) { t.classList.add('ok'); return pass('chosen'); } tries++; t.disabled = true; t.classList.add('dim'); ctx.oops(); };
            box.appendChild(t);
          });
          act.appendChild(box);
        }
        function listen(micEl, heardEl) {
          if (listening || over || !alive()) return; listening = true; micEl.classList.add('on'); heardEl.textContent = '듣고 있어요…';
          speech.tryOnce(x.w, { kind: 'sentence', others: [], timeout: CONF.listenMs, judge: function (t) { return cover(t, x.w, speech) >= CONF.cover; } }).then(function (r) {
            listening = false; if (over || !alive()) return; micEl.classList.remove('on');
            if (r.error === 'unavailable' || r.error === 'not-allowed' || r.error === 'service-not-allowed') { mic.off(); return offer(); }
            if (r.error === 'network' || r.error === 'audio-capture' || r.error === 'start') return offer();
            mic.prime();
            if (cover(r.heard, x.w, speech) >= CONF.cover) { heardEl.textContent = '좋아!'; return pass('speech'); }
            tries++; if (r.heard) ctx.oops();
            if (tries >= 3) return offer();
            if (tries === 1) { heardEl.textContent = '한 번 더!'; return later(550, function () { listen(micEl, heardEl); }); }
            helped = true; heardEl.textContent = '천천히 같이 읽어 봐';
            G.soon(tts ? tts.sentence(x.w, { rate: 0.6 }) : null, 9000).then(function () { later(300, function () { listen(micEl, heardEl); }); });
          });
        }
        if (!mic.ok()) return offer();
        var micEl = h('button', 'mic', g.PlayIcon.html('mic')), heardEl = h('div', 'heard', '소리 내어 읽어 봐'); micEl.type = 'button';
        act.appendChild(micEl); act.appendChild(heardEl);
        micEl.onclick = function () { listen(micEl, heardEl); };
        if (mic.primed() && G.canSound()) later(300, function () { listen(micEl, heardEl); });
      }
      /* 「하루」 칸 — 세 장면을 아침·낮·저녁 차례로 짚는다 */
      function dayOrder() {
        var seq = all.slice(), picked = [], tries = 1, clean = true;
        book.className = 'pb-book pb-day'; book.innerHTML = '<div class="pb-dayrow">' + seq.map(function (_, k) { return '<span class="pb-slot" data-k="' + k + '">' + g.PlayIcon.html(['sun-cloud', 'sun-cloud', 'lamp'][k] || 'clock') + '</span>'; }).join('') + '</div>';
        act.innerHTML = '<div class="heard">아침 → 낮 → 저녁, 차례로 짚어 봐</div>';
        var box = h('div', 'pb-days'); act.appendChild(box);
        shuffle(seq).forEach(function (y) {
          var t = h('button', 'tile pb-scene', y.pic); t.type = 'button'; t.setAttribute('data-w', y.w);
          t.onclick = function () {
            if (t.disabled) return;
            if (y !== seq[picked.length]) { clean = false; tries++; t.classList.remove('no'); void t.offsetWidth; t.classList.add('no'); ctx.oops(); G.soon(tts ? tts.sentence(seq[picked.length].w) : null); return; }
            picked.push(y); t.disabled = true; t.classList.add('ok');
            var sl = book.querySelector('.pb-slot[data-k="' + (picked.length - 1) + '"]'); if (sl) { sl.innerHTML = y.pic; sl.classList.add('full'); }
            if (picked.length === seq.length) { ctx.emit(E.act('day-order:' + Z.id, 'read', 'touch', clean, tries)); ctx.good(clean, { at: book }); later(CONF.showMs, function () { resolve({ completed: true }); }); }
          };
          box.appendChild(t);
        });
      }
      G.soon(ctx.intro, null).then(function () { if (alive()) page(); });
    });
  }
  /* 지문 → 낱말마다 누를 수 있는 글자(짚어 읽기) */
  function toks0(s) { return String(s).split(' ').map(function (w) { return '<span class="pb-tw">' + w + '</span>'; }).join(' '); }

  function start(ctx) { return (ctx.zone && ctx.zone.kind === 'story') ? story(ctx, {}) : words(ctx); }
  g.PlayPictureBook = { CONF: CONF, start: start, run: story, cover: cover };
  if (g.PlayGame) g.PlayGame.register({
    id: 'picture-book', no: 22, name: '그림책', icon: 'book', channels: ['say', 'read'], axis: 'quest', need: { lv1: 8 }, plants: true,
    fits: function (zone) { return zone.kind === 'story' ? (zone.words || []).length >= 2 : (zone.words || []).filter(drawn).length >= 4; },
    count: function (c) { var z = c.zone || {}; return z.kind === 'story' ? Math.min(CONF.storyPages, (c.targets || []).length) + (z.dayOrder ? 1 : 0) : Math.min(CONF.pages, (c.targets || []).filter(drawn).length); },
    intro: { en: 'Oh!', ko: '그림책을 펼쳤어 — 읽으면 그림이 나타나!' },
    start: start
  });
})(window);
