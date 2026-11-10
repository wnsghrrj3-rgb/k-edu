/* ============================================================
 * 영어 놀이터 — 말하기 도우미(PlayTutor) : 실패 처리 3단 (게임설계 v1 §6)
 *   못 알아들었을 때 1번째 = 모델 다시 · 2번째 = 느리게 + 같이 말하기 · 3번째 = Sam 「이거?」 하며 둘 중 고르기 → 끝(assisted).
 *   힌트 0 판(hint0 — 특별 손님)은 1번째에 모델 없이 「한 번 더」만, 2번째부터 모델(그때부터 도움 받은 것으로 적힌다).
 *   음성 인식 실패는 발음 실패가 아니다 — 화면에 「틀렸다」·들린 글자 없음.
 *
 *   PlayTutor.step(tries, hint0) → 'again'|'model'|'slow'|'offer'          (화면 없는 규칙 — 검사는 여기를 본다)
 *   PlayTutor.ask(ctx, { host, target | cands[], kind:'word'|'sentence', sentence(w), frame[틀 낱말], hint0,
 *                        model(slowly) — 모델 음성을 바꿔 끼움(소리 조각으로 들려주기) · offerText — 그림 대신 글자 둘 · onOffer() — 고르기로 넘어갈 때 })
 *     → Promise({ word, by:'speech'|'chosen', tries, hinted, mic })
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    maxTries: 3,          /* 이만큼 못 알아들으면 둘 중 고르기 */
    slowRate: 0.45,       /* 느린 모델(단어) */
    slowSentence: 0.55,   /* 느린 모델(문장) */
    listenGap: 250,       /* 모델이 끝난 뒤 듣기 시작까지(ms) */
    wordMs: 7000,         /* 단어 한 번 듣는 길이 — 화면에는 안 보인다 */
    sentenceMs: 8000      /* 문장 한 번 듣는 길이 */
  };

  function step(tries, hint0) {
    if (tries >= CONF.maxTries) return 'offer';
    if (tries <= 0) return 'again';
    if (hint0) return tries === 1 ? 'again' : 'slow';
    return tries === 1 ? 'model' : 'slow';
  }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function ask(ctx, o) {
    var S = ctx.services || {}, speech = S.speech, tts = S.tts, sam = S.sam || { say: function () { return Promise.resolve(); }, react: function () {} };
    var G = g.PlayGame, mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; }, off: function () {}, primed: function () { return false; }, prime: function () {} };
    var kind = o.kind || 'word', cands = o.cands && o.cands.length ? o.cands : [o.target], sent = o.sentence || function (w) { return w; };
    var pool = ctx.pool || ctx.targets || [], pic = {}, W = pool.map(function (x) { pic[x.w] = x.pic; return x.w; });
    var confuse = (ctx.zone && ctx.zone.confuse) || [];
    var wrap = h('div', 'tu'); o.host.appendChild(wrap);
    var tries = 0, hinted = false, wordOnly = 0, listening = false, micEl = null, heardEl = null, over = false;
    function othersOf(w) { return W.filter(function (x) { return x !== w; }); }
    function alive() { return wrap.parentNode === o.host && wrap.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive() && !over) fn(); }, ms); }
    function model(w, slow) {
      hinted = true;
      if (o.model) return G.soon(o.model(!!slow), 12000);
      if (kind === 'sentence') return G.soon(tts.sentence(sent(w), slow ? { rate: CONF.slowSentence } : undefined));
      return G.soon(tts.word(w, slow ? { rate: CONF.slowRate } : undefined));
    }
    function altFor(w) {
      var bad = {}; confuse.forEach(function (p) { if (p[0] === w) bad[p[1]] = 1; if (p[1] === w) bad[p[0]] = 1; });
      var ps = W.filter(function (x) { return x !== w && !bad[x]; }); if (!ps.length) ps = othersOf(w);
      return shuffle(ps)[0];
    }

    return new Promise(function (resolve) {
      function fin(word, by) { if (over) return; over = true; resolve({ word: word, by: by, tries: tries, hinted: hinted, mic: mic.ok() }); }

      /* 둘 중 고르기 — 단어는 그림 둘, 문장은 문장 둘(누르면 들려준다) */
      function offer() {
        micEl = heardEl = null; wrap.innerHTML = '';
        if (o.onOffer) { try { o.onOffer(); } catch (e) {} }
        var box = h('div', 'oq-offer');
        if (kind === 'sentence') {
          wrap.appendChild(h('div', 'heard', '눌러서 듣고 골라 봐'));
          cands.slice(0, 2).forEach(function (w) {
            var t = h('button', 'tile tu-sent', '<span>' + sent(w) + '</span>'); t.type = 'button'; t.setAttribute('data-w', w);
            t.onclick = function () { if (over || t.disabled) return; each(box, function (b) { b.disabled = true; }); t.classList.add('ok'); G.soon(tts.sentence(sent(w))).then(function () { fin(w, 'chosen'); }); };
            box.appendChild(t);
          });
          sam.react('wait');
        } else {
          var w = cands[0];
          shuffle([w, altFor(w)]).forEach(function (x) {
            var t = h('button', 'tile' + (o.offerText ? ' tu-sent' : ''), o.offerText ? '<span>' + x + '</span>' : (pic[x] || x)); t.type = 'button'; t.setAttribute('data-w', x);
            t.onclick = function () {
              if (over || t.disabled) return;
              if (x === w) { t.classList.add('ok'); return fin(w, 'chosen'); }
              t.classList.add('no'); t.disabled = true; tries++; ctx.oops();
              later(350, function () { t.classList.remove('no'); t.classList.add('dim'); });
              model(w);
            };
            box.appendChild(t);
          });
          sam.react('wait'); sam.say(w + '?', '이거?');
        }
        wrap.appendChild(box);
      }
      function each(box, fn) { Array.prototype.forEach.call(box.children, fn); }

      function pass(word) {
        listening = false;
        if (micEl) { micEl.classList.remove('on'); micEl.classList.add('off'); micEl.onclick = null; }
        if (heardEl) heardEl.textContent = '좋아!';
        later(350, function () { fin(word, 'speech'); });
      }
      function miss(heard) {
        tries++;
        if (heard) ctx.oops(); else sam.react('no');          /* 조용했으면 소리 없이 기다린다 */
        var st = step(tries, !!o.hint0), w = cands[0];
        if (st === 'offer') return offer();
        if (st === 'again') { heardEl.textContent = '한 번 더!'; return later(CONF.listenGap + 300, listen); }
        heardEl.textContent = st === 'slow' ? (kind === 'sentence' ? '천천히 같이 — 「' + sent('…') + '」' : '천천히 같이 말해 봐') : '한 번 더 들어 봐';
        model(w, st === 'slow').then(function () { later(CONF.listenGap, listen); });
      }
      function listen() {
        if (listening || over || !alive() || !micEl) return;
        listening = true; micEl.classList.add('on'); heardEl.textContent = '듣고 있어요…';
        var opt = kind === 'sentence'
          ? { kind: 'sentence', others: [], timeout: CONF.sentenceMs, judge: function (t) { return cands.some(function (c) { return speech.matchSentence(t, c, othersOf(c), o.frame) || (wordOnly > 0 && speech.matchWord(t, c, othersOf(c))); }); } }
          : { kind: 'word', others: othersOf(cands[0]), timeout: CONF.wordMs };
        speech.tryOnce(cands[0], opt).then(function (r) {
          listening = false;
          if (over || !alive()) return;
          micEl.classList.remove('on');
          if (r.error === 'unavailable' || r.error === 'not-allowed' || r.error === 'service-not-allowed') { mic.off(); return offer(); }
          if (r.error === 'network' || r.error === 'audio-capture' || r.error === 'start') return offer();
          mic.prime();
          if (kind !== 'sentence') return r.ok ? pass(cands[0]) : miss(r.heard);
          var hit = null, wd = null;
          cands.forEach(function (c) { if (!hit && speech.matchSentence(r.heard, c, othersOf(c), o.frame)) hit = c; });
          if (hit) return pass(hit);
          cands.forEach(function (c) { if (!wd && speech.matchWord(r.heard, c, othersOf(c))) wd = c; });
          if (wd) {
            if (wordOnly++ > 0) return pass(wd);                      /* 낱말만 두 번째 = 그만하면 됐다 */
            heardEl.textContent = '그래, ' + wd + '! 이번엔 「' + sent(wd) + '」';
            return model(wd).then(function () { later(CONF.listenGap, listen); });
          }
          miss(r.heard);
        });
      }

      if (!mic.ok()) return offer();
      micEl = h('button', 'mic', g.PlayIcon.html('mic')); micEl.type = 'button'; heardEl = h('div', 'heard', '');
      wrap.appendChild(micEl); wrap.appendChild(heardEl);
      micEl.onclick = function () { if (!listening && !over) listen(); };
      if (mic.primed() && G.canSound()) later(CONF.listenGap, listen); else heardEl.textContent = '마이크를 누르고 말해 봐';
    });
  }

  g.PlayTutor = { CONF: CONF, step: step, ask: ask };
})(window);
