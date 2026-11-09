/* ============================================================
 * 영어 놀이터 — 놀이 #1 「손님 주문 받기」(PlayOrder) (게임설계 v1 §4-1 · §6 실패 처리)
 *   손님 둘(Mina·Ben)이 번갈아 줄 선다 → 앞 손님 말풍선에 그림 → 아이가 그 단어를 말한다
 *   → 쟁반이 손님에게 가고 손님이 웃으며 나간다 → 뒤 손님이 앞으로.
 *   깔끔하게 3번 이어지면 손님들이 손뼉(화면에 숫자 없음).
 *   못 알아들었을 때: 손님이 갸웃하고 그대로 기다린다 — 1번째 모델 다시 · 2번째 느리게 · 3번째 Sam 이 「이거?」 하며 그림 둘.
 *   골라서 끝내도 주문은 끝난다(결정 §0-1) — 씨앗을 심을지는 by('speech'|'chosen')를 보고 무대 쪽이 정한다.
 *   마이크가 없는 판은 말풍선 그림을 가리고(🔊) 듣고 고른다.
 *
 *   PlayOrder.start({ host, words:[{w,pic}], confuse:[[a,b]], services:{tts,speech,audio,npc},
 *                     sam:{say(en,ko),react(kind)}, mic:{ok(),off(),primed(),prime()}, intro:Promise, onServe(r) })
 *     → Promise({ completed:true, results:[{word, by, tries, guest}] })
 *   PlayOrder.machine(words) — 화면 없는 흐름(줄·시도·연속). 검사는 여기를 직접 본다.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 보고 바꾼다 ── */
  var CONF = {
    guests: ['mina', 'ben'],   /* 줄 서는 손님(번갈아) */
    comboAt: 3,                /* 깔끔하게 몇 번 이어지면 손뼉 */
    maxTries: 3,               /* 이만큼 못 알아들으면 그림 둘 내밀기 */
    slowRate: 0.45,            /* 두 번째부터 모델을 느리게(말 빠르기) */
    stepIn: 520,               /* 손님이 앞으로 오는 시간(ms) */
    serve: 650,                /* 쟁반이 손님에게 가는 시간 */
    clap: 900,                 /* 손뼉 연출 길이 */
    leave: 560,                /* 손님이 나가는 시간 */
    listenGap: 250,            /* 모델이 끝난 뒤 듣기 시작까지 */
    listenMs: 7000,            /* 한 번 듣는 길이 — 화면에는 안 보인다 */
    sayMax: 4000,              /* 모델 음성이 끝났다는 신호가 안 와도 이만큼 뒤엔 넘어간다 */
    mutedWait: 350             /* 아직 화면을 안 눌러 소리가 안 나는 동안은 이만큼만 기다린다 */
  };

  /* 화면 없는 흐름 — 줄(누가 앞·뒤) · 시도 · 연속 */
  function machine(words, o) {
    o = o || {};
    var guests = o.guests || CONF.guests, comboAt = o.comboAt || CONF.comboAt, maxTries = o.maxTries || CONF.maxTries;
    var i = -1, tries = 0, streak = 0, slip = false, phase = 'idle', results = [];
    function serve(by) {
      phase = 'served';
      streak = slip ? 0 : streak + 1;
      var r = { word: words[i], by: by, tries: tries, guest: m.guest() };
      results.push(r);
      return { type: 'serve', by: by, word: r.word, guest: r.guest, combo: streak > 0 && streak % comboAt === 0 };
    }
    var m = {
      total: words.length,
      index: function () { return i; },
      phase: function () { return phase; },
      word: function () { return i >= 0 && i < words.length ? words[i] : null; },
      guest: function () { return i >= 0 && i < words.length ? guests[i % guests.length] : null; },
      /* 뒤에서 기다리는 손님(다음 주문이 있을 때만) */
      waiting: function () { return i + 1 < words.length ? guests[(i + 1) % guests.length] : null; },
      tries: function () { return tries; },
      streak: function () { return streak; },
      results: function () { return results.slice(); },
      /* 다음 손님 앞으로 */
      next: function () {
        if (phase === 'order' || phase === 'offer') return { type: 'busy' };
        if (i + 1 >= words.length) { i = words.length; phase = 'done'; return { type: 'done' }; }
        i++; tries = 0; slip = false; phase = 'order';
        return { type: 'enter', guest: m.guest(), word: words[i] };
      },
      /* 아이가 말했다 — ok 면 쟁반이 나간다. 아니면 같은 손님이 그대로 기다린다 */
      heard: function (ok) {
        if (phase !== 'order') return { type: 'ignored' };
        if (ok) return serve('speech');
        tries++; slip = true; streak = 0;
        if (tries >= maxTries) { phase = 'offer'; return { type: 'offer', tries: tries }; }
        return { type: 'wait', tries: tries, slow: tries >= 2 };
      },
      /* 말로 못 받는 판 — 바로 그림 둘 */
      offer: function () {
        if (phase === 'offer') return { type: 'offer', tries: tries };
        if (phase !== 'order') return { type: 'ignored' };
        phase = 'offer'; return { type: 'offer', tries: tries };
      },
      pick: function (w) {
        if (phase !== 'offer') return { type: 'ignored' };
        if (w === words[i]) return serve('chosen');
        slip = true; streak = 0;
        return { type: 'again' };
      }
    };
    return m;
  }

  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* 화면을 아직 한 번도 안 눌렀으면 브라우저가 소리를 막는다 — 그때는 눌러서 듣게 한다 */
  function canSound() { var ua = g.navigator && g.navigator.userActivation; return !ua || ua.hasBeenActive; }

  function start(opt) {
    var S = opt.services || {}, tts = S.tts, speech = S.speech, npc = S.npc || g.PlayNpc;
    var audio = S.audio || { play: function () {} };
    var sam = opt.sam || { say: function () { return Promise.resolve(); }, react: function () {} };
    var micOn = !!(speech && speech.available && speech.available()), primed = false;
    var mic = opt.mic || { ok: function () { return micOn; }, off: function () { micOn = false; }, primed: function () { return primed; }, prime: function () { primed = true; } };
    var pic = {}, W = opt.words.map(function (x) { pic[x.w] = x.pic; return x.w; });
    var confuse = opt.confuse || [];
    var m = machine(W, { guests: CONF.guests });
    var host = opt.host, POS = ['pre', 'back', 'front', 'out'];

    host.innerHTML = '';
    var root = h('div', 'oq'), line = h('div', 'oq-line'), act = h('div', 'oq-act'), dots = h('div', 'dots');
    var G = {};
    CONF.guests.forEach(function (who) { var e = h('div', 'oq-g pre'); npc.render(e, who, { face: 'idle' }); line.appendChild(e); G[who] = e; });
    var bub = h('button', 'oq-bub'); bub.type = 'button'; line.appendChild(bub);
    var tray = h('div', 'oq-tray'); line.appendChild(tray);
    line.appendChild(h('div', 'oq-clap c1', '👏')); line.appendChild(h('div', 'oq-clap c2', '👏'));
    root.appendChild(line); root.appendChild(act); root.appendChild(dots); host.appendChild(root);

    var listening = false, unheard = false, micEl = null, heardEl = null, offerBox = null, done;
    var finished = new Promise(function (r) { done = r; });

    function alive() { return root.parentNode === host && (root.isConnected !== false); }
    function later(ms, fn) { return setTimeout(function () { if (alive()) fn(); }, ms); }
    function say(w, rate) {
      var p = tts ? tts.word(w, rate ? { rate: rate } : undefined) : Promise.resolve();
      return Promise.race([p, new Promise(function (r) { setTimeout(r, canSound() ? CONF.sayMax : CONF.mutedWait); })]);
    }
    function place(el, pos) {
      if (el.classList.contains(pos)) return;
      /* 나갔던 손님이 다시 줄 설 때는 왼쪽 밖에서부터 들어온다 */
      if (pos === 'back' && el.classList.contains('out')) { POS.forEach(function (c) { el.classList.remove(c); }); el.classList.add('pre'); void el.offsetWidth; }
      POS.forEach(function (c) { el.classList.remove(c); }); el.classList.add(pos);
    }
    function drawDots() { var i = m.index(); dots.innerHTML = W.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join(''); }
    function showPic(w, hide) { bub.innerHTML = '<span>' + (hide ? '🔊' : pic[w]) + '</span>'; bub.classList.toggle('ear', !!hide); }
    /* 헷갈리는 짝(dish↔fish 등)은 내밀지 않는다 — 도와주는 자리라 쉽게 */
    function altFor(w) {
      var bad = {}; confuse.forEach(function (p) { if (p[0] === w) bad[p[1]] = 1; if (p[1] === w) bad[p[0]] = 1; });
      var pool = W.filter(function (x) { return x !== w && !bad[x]; });
      if (!pool.length) pool = W.filter(function (x) { return x !== w; });
      return shuffle(pool)[0];
    }

    function enter(e) {
      var who = e.guest, w = e.word, back = m.waiting();
      listening = false; micEl = heardEl = offerBox = null;
      CONF.guests.forEach(function (x) { if (x !== who) { if (back === x) { place(G[x], 'back'); npc.face(G[x], 'idle'); } else place(G[x], 'pre'); } });
      place(G[who], 'front'); npc.face(G[who], 'idle');
      bub.classList.remove('show'); bub.setAttribute('data-w', w);
      act.innerHTML = ''; drawDots();
      audio.play('enter');
      later(CONF.stepIn, function () {
        var hide = !mic.ok();
        showPic(w, hide); bub.classList.add('show');
        unheard = !canSound();
        say(w).then(function () { if (!alive() || m.word() !== w) return; if (mic.ok()) askSpeak(); else offer(true); });
      });
    }
    /* 말풍선을 누르면 다시 들려준다 */
    bub.onclick = function () {
      var w = m.word(); if (!w || listening || (m.phase() !== 'order' && m.phase() !== 'offer')) return;
      unheard = false; if (offerBox) offerBox.classList.remove('wait');
      say(w);
    };

    function askSpeak() {
      act.innerHTML = '';
      micEl = h('button', 'mic', '🎤'); micEl.type = 'button'; heardEl = h('div', 'heard', '');
      act.appendChild(micEl); act.appendChild(heardEl);
      micEl.onclick = function () {
        if (listening || m.phase() !== 'order') return;
        if (unheard) { unheard = false; heardEl.textContent = '🔊'; return say(m.word()).then(function () { later(CONF.listenGap, listen); }); }
        listen();
      };
      if (mic.primed() && !unheard) later(CONF.listenGap, listen);
      else heardEl.textContent = '🎤 누르고 말해 봐';
    }
    function listen() {
      if (listening || m.phase() !== 'order' || !alive() || !micEl) return;
      var w = m.word();
      listening = true; micEl.classList.add('on'); heardEl.textContent = '듣고 있어요…';
      speech.tryOnce(w, { kind: 'word', others: W.filter(function (x) { return x !== w; }), timeout: CONF.listenMs }).then(function (r) {
        listening = false;
        if (!alive() || m.word() !== w || m.phase() !== 'order') return;
        micEl.classList.remove('on');
        if (r.error === 'unavailable' || r.error === 'not-allowed' || r.error === 'service-not-allowed') { mic.off(); return offer(true); }
        if (r.error === 'network' || r.error === 'audio-capture' || r.error === 'start') return offer(false);   /* 이번 주문만 골라서 */
        mic.prime();
        var e = m.heard(!!r.ok);
        if (e.type === 'serve') return serve(e);
        if (r.heard) { audio.play('soft'); npc.react(G[m.guest()], 'no'); }   /* 조용했으면 손님은 그냥 기다린다 */
        sam.react('no');
        if (e.type === 'offer') return offer(false);
        heardEl.textContent = e.slow ? '천천히 같이 말해 봐' : '한 번 더 들어 봐';
        say(w, e.slow ? CONF.slowRate : 0).then(function () { later(CONF.listenGap, listen); });
      });
    }

    /* Sam 이 「이거?」 하며 그림 둘 — listenMode 면 말풍선 그림이 가려져 있어 듣고 고른다 */
    function offer(listenMode) {
      m.offer();
      var w = m.word(), pair = shuffle([w, altFor(w)]);
      micEl = heardEl = null; act.innerHTML = '';
      showPic(w, !!listenMode);
      offerBox = h('div', 'oq-offer');
      pair.forEach(function (x) {
        var t = h('button', 'tile', pic[x]); t.type = 'button'; t.setAttribute('data-w', x);
        t.onclick = function () {
          if (m.phase() !== 'offer' || t.disabled) return;
          if (unheard) { unheard = false; offerBox.classList.remove('wait'); return say(w); }   /* 아직 못 들었으면 먼저 들려준다 */
          var e = m.pick(x);
          if (e.type === 'serve') { t.classList.add('ok'); return serve(e); }
          if (e.type !== 'again') return;
          t.classList.add('no'); t.disabled = true;
          audio.play('soft'); npc.react(G[m.guest()], 'no'); sam.react('no');
          later(350, function () { t.classList.remove('no'); t.classList.add('dim'); });
          say(w);
        };
        offerBox.appendChild(t);
      });
      act.appendChild(offerBox);
      if (listenMode && unheard) { offerBox.classList.add('wait'); act.appendChild(h('div', 'heard', '🔊 눌러서 들어 봐')); }
      sam.react('wait');
      sam.say(w + '?', '이거?');
    }

    function serve(e) {
      var who = e.guest, el = G[who], w = e.word;
      audio.play('ok'); npc.face(el, 'smile'); sam.react('ok');
      showPic(w, false);
      if (micEl) { micEl.classList.add('off'); micEl.onclick = null; }
      if (heardEl) heardEl.textContent = '';
      var lw = line.offsetWidth || 0;
      tray.textContent = pic[w];
      tray.style.setProperty('--tx', (lw ? Math.round(150 - lw / 2) : -70) + 'px');
      tray.classList.remove('go'); void tray.offsetWidth; tray.classList.add('go');
      if (opt.onServe) { try { opt.onServe({ word: w, by: e.by, tries: m.tries(), guest: who }); } catch (err) {} }
      var hold = CONF.serve;
      if (e.combo) { later(Math.round(CONF.serve * 0.7), clap); hold += CONF.clap; }
      later(hold, function () {
        bub.classList.remove('show'); place(el, 'out');
        later(CONF.leave, advance);
      });
    }
    function clap() {
      line.classList.remove('clap'); void line.offsetWidth; line.classList.add('clap');
      audio.play('combo'); sam.react('ok');
      CONF.guests.forEach(function (x) { npc.face(G[x], 'smile'); });
      later(CONF.clap, function () { line.classList.remove('clap'); });
    }
    function advance() {
      var e = m.next();
      if (e.type === 'enter') return enter(e);
      if (e.type === 'done') { drawDots(); done({ completed: true, results: m.results() }); }
    }

    /* 손님은 먼저 줄 서 있고, Sam 의 첫 마디가 끝나면 첫 손님이 주문한다 */
    var first = m.next();
    if (first.type !== 'enter') { done({ completed: true, results: [] }); return finished; }
    place(G[first.guest], 'front'); var b0 = m.waiting(); if (b0) place(G[b0], 'back');
    drawDots();
    Promise.race([opt.intro || Promise.resolve(), new Promise(function (r) { setTimeout(r, canSound() ? CONF.sayMax : CONF.mutedWait); })]).then(function () { if (alive()) enter(first); });
    return finished;
  }

  g.PlayOrder = { CONF: CONF, machine: machine, start: start };
})(window);
