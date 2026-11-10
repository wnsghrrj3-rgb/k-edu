/* ============================================================
 * 영어 놀이터 — 놀이 #1 「손님 주문 받기」(PlayOrder) (게임설계 v1 §4-1 · §6 실패 처리)
 *   손님 둘(Mina·Ben)이 번갈아 줄 선다 → 앞 손님 말풍선에 그림 → 아이가 그 단어를 말한다
 *   → 쟁반이 손님에게 가고 손님이 웃으며 나간다 → 뒤 손님이 앞으로.
 *   깔끔하게 3·5·8번 이어지면 손님들이 손뼉 — 불꽃·환호가 1·2·3단으로 커진다(화면에 숫자 없음, 단계는 core/fx.js).
 *   못 알아들었을 때: 손님이 갸웃하고 그대로 기다린다 — 1번째 모델 다시 · 2번째 느리게 · 3번째 Sam 이 「이거?」 하며 그림 둘.
 *   골라서 끝내도 주문은 끝난다(결정 §0-1) — 증거에는 assisted 로 남고, 씨앗은 말로 받은 주문에만(PlayGame.run 이 정한다).
 *   마이크가 없는 판은 말풍선 그림을 소리 표시로 가리고 듣고 고른다.
 *
 *   공통 인터페이스(core/game.js): start(ctx) → Promise({ completed, results:[{word, by, tries, guest}] }) · 증거는 ctx.emit 으로
 *   PlayOrder.machine(words) — 화면 없는 흐름(줄·시도·연속). 검사는 여기를 직접 본다.
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 — 준호가 태블릿에서 보고 바꾼다 ── */
  var CONF = {
    guests: ['mina', 'ben'],   /* 줄 서는 손님(번갈아) */
    maxTries: 3,               /* 이만큼 못 알아들으면 그림 둘 내밀기 */
    slowRate: 0.45,            /* 두 번째부터 모델을 느리게(말 빠르기) */
    stepIn: 520,               /* 손님이 앞으로 오는 시간(ms) ← 「손님 줄 속도」 */
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
    var guests = o.guests || CONF.guests, maxTries = o.maxTries || CONF.maxTries;
    var comboLevel = o.comboLevel || (g.PlayFx && g.PlayFx.comboLevel) || function () { return 0; };   /* 3·5·8 규칙은 core/fx.js 한 곳 */
    var i = -1, tries = 0, streak = 0, slip = false, phase = 'idle', results = [];
    function serve(by) {
      phase = 'served';
      streak = slip ? 0 : streak + 1;
      var r = { word: words[i], by: by, tries: tries, guest: m.guest() };
      results.push(r);
      var level = streak > 0 ? comboLevel(streak) : 0;
      return { type: 'serve', by: by, word: r.word, guest: r.guest, combo: level > 0, level: level };
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
    var S = opt.services || {}, tts = S.tts, speech = S.speech, npc = S.npc || g.PlayNpc, fx = S.fx || g.PlayFx, scene = S.scene || g.PlayScene, E = g.PlayEvidence;
    var audio = S.audio || { play: function () {} };
    var sam = S.sam || opt.sam || { say: function () { return Promise.resolve(); }, react: function () {} };
    var micOn = !!(speech && speech.available && speech.available()), primed = false;
    var mic = (opt.learner && opt.learner.mic) || opt.mic || { ok: function () { return micOn; }, off: function () { micOn = false; }, primed: function () { return primed; }, prime: function () { primed = true; } };
    var items = opt.targets || opt.words || [], poolItems = opt.pool || opt.words || items;
    var pic = {}, W = items.map(function (x) { return x.w; }), ALL = poolItems.map(function (x) { pic[x.w] = x.pic; return x.w; });
    items.forEach(function (x) { pic[x.w] = x.pic; });
    var confuse = opt.confuse || (opt.zone && opt.zone.confuse) || [];
    var GUESTS = (opt.opt && opt.opt.guests) || CONF.guests;      /* 사건(단체 손님)이 줄 서는 손님을 바꿀 수 있다 */
    var m = machine(W, { guests: GUESTS });
    var host = opt.host;

    host.innerHTML = '';
    var root = h('div', 'oq'); host.appendChild(root);
    var q = scene.queue(root, { guests: GUESTS, npc: npc });
    var line = q.el, G = q.G, bub = q.bub;
    var act = h('div', 'oq-act'), dots = h('div', 'dots');
    root.appendChild(act); root.appendChild(dots);

    var listening = false, unheard = false, micAtEnter = true, micEl = null, heardEl = null, offerBox = null, done;
    var finished = new Promise(function (r) { done = r; });

    function alive() { return root.parentNode === host && (root.isConnected !== false) && !(opt.signal && opt.signal.aborted); }
    function later(ms, fn) { return setTimeout(function () { if (alive()) fn(); }, ms); }
    function say(w, rate) {
      var p = tts ? tts.word(w, rate ? { rate: rate } : undefined) : Promise.resolve();
      return Promise.race([p, new Promise(function (r) { setTimeout(r, canSound() ? CONF.sayMax : CONF.mutedWait); })]);
    }
    function drawDots() { var i = m.index(); dots.innerHTML = W.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join(''); }
    function showPic(w, hide) { q.say(hide ? g.PlayIcon.html('speaker') : pic[w], !!hide); }
    /* 헷갈리는 짝(dish↔fish 등)은 내밀지 않는다 — 도와주는 자리라 쉽게 */
    function altFor(w) {
      var bad = {}; confuse.forEach(function (p) { if (p[0] === w) bad[p[1]] = 1; if (p[1] === w) bad[p[0]] = 1; });
      var pool = ALL.filter(function (x) { return x !== w && !bad[x]; });
      if (!pool.length) pool = ALL.filter(function (x) { return x !== w; });
      return shuffle(pool)[0];
    }

    function enter(e) {
      var who = e.guest, w = e.word;
      listening = false; micEl = heardEl = offerBox = null;
      q.step(who, m.waiting());
      q.hush(); bub.setAttribute('data-w', w);
      act.innerHTML = ''; drawDots();
      audio.play('enter');
      later(CONF.stepIn, function () {
        micAtEnter = mic.ok();
        showPic(w, !micAtEnter);
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
      micEl = h('button', 'mic', g.PlayIcon.html('mic')); micEl.type = 'button'; heardEl = h('div', 'heard', '');
      act.appendChild(micEl); act.appendChild(heardEl);
      micEl.onclick = function () {
        if (listening || m.phase() !== 'order') return;
        if (unheard) { unheard = false; heardEl.textContent = '잘 들어 봐'; return say(m.word()).then(function () { later(CONF.listenGap, listen); }); }
        listen();
      };
      if (mic.primed() && !unheard) later(CONF.listenGap, listen);
      else heardEl.textContent = '마이크를 누르고 말해 봐';
    }
    function listen() {
      if (listening || m.phase() !== 'order' || !alive() || !micEl) return;
      var w = m.word();
      listening = true; micEl.classList.add('on'); heardEl.textContent = '듣고 있어요…';
      speech.tryOnce(w, { kind: 'word', others: ALL.filter(function (x) { return x !== w; }), timeout: CONF.listenMs }).then(function (r) {
        listening = false;
        if (!alive() || m.word() !== w || m.phase() !== 'order') return;
        micEl.classList.remove('on');
        if (r.error === 'unavailable' || r.error === 'not-allowed' || r.error === 'service-not-allowed') { mic.off(); micAtEnter = false; return offer(true); }
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
      if (listenMode && unheard) { offerBox.classList.add('wait'); act.appendChild(h('div', 'heard', '말풍선을 눌러서 들어 봐')); }
      sam.react('wait');
      sam.say(w + '?', '이거?');
    }

    function serve(e) {
      var who = e.guest, el = G[who], w = e.word;
      audio.play('tray'); audio.play('ok'); npc.react(el, 'ok', { stay: true }); sam.react('ok');   /* 0.3초 안: 소리 + 손님·Sam 표정 */
      showPic(w, false);
      if (micEl) { micEl.classList.add('off'); micEl.onclick = null; }
      if (heardEl) heardEl.textContent = '';
      q.serve(pic[w], w);
      var r = { word: w, by: e.by, tries: m.tries(), guest: who };
      if (opt.emit && E) opt.emit(E.say(w, { by: e.by, tries: r.tries, mic: micAtEnter }));
      if (opt.onServe) { try { opt.onServe(r); } catch (err) {} }
      var hold = CONF.serve;
      if (e.combo) { later(fx ? fx.CONF.comboDelay : 180, function () { clap(e.level); }); hold += CONF.clap; }
      later(hold, function () {
        q.hush(); q.place(who, 'out');
        later(CONF.leave, advance);
      });
    }
    /* 손뼉 — 단계(1·2·3)가 오를수록 소리·불꽃·환호가 커진다 */
    function clap(level) {
      level = level || 1;
      q.clap(level, CONF.clap);
      audio.play(level >= 3 ? 'combo3' : level === 2 ? 'combo2' : 'combo');
      if (fx && fx.burst) fx.burst(level, line);
      sam.react(level >= 2 ? 'cheer' : 'ok');
      GUESTS.forEach(function (x) { npc.react(G[x], level >= 2 ? 'cheer' : 'ok', { stay: true }); });
    }
    function advance() {
      var e = m.next();
      if (e.type === 'enter') return enter(e);
      if (e.type === 'done') { drawDots(); done({ completed: true, results: m.results() }); }
    }

    /* 손님은 먼저 줄 서 있고, Sam 의 첫 마디가 끝나면 첫 손님이 주문한다 */
    var first = m.next();
    if (first.type !== 'enter') { done({ completed: true, results: [] }); return finished; }
    q.place(first.guest, 'front'); var b0 = m.waiting(); if (b0) q.place(b0, 'back');
    drawDots();
    Promise.race([opt.intro || Promise.resolve(), new Promise(function (r) { setTimeout(r, canSound() ? CONF.sayMax : CONF.mutedWait); })]).then(function () { if (alive()) enter(first); });
    return finished;
  }

  g.PlayOrder = { CONF: CONF, machine: machine, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'order-shop', no: 1, name: '주문 받기', icon: 'order', channels: ['say'], axis: 'talk', need: { lv1: 1 }, plants: true,   /* W06 — Lv1 첫 칸(사이트워드 그림판)부터 */
    fits: function (zone) { return !zone.talk; },     /* 문장 칸(I like)은 친구와 대화로 — 주문은 낱말 */   /* plants = 구역 단어를 전부 말하게 하는 놀이(씨앗 심기) */
    count: function (c) { return (c.targets || []).length; },
    intro: { en: 'This is my shop!', ko: '손님이 왔어 — 주문을 말로 받아 줘!' },
    intro1: { en: 'Hi!', ko: '손님이 왔어 — 그림을 보고 말로 받아 줘!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
