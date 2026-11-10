/* ============================================================
 * 영어 놀이터 — 놀이 #27 「특별 손님」 (게임설계 v1 §4-27 · §9) — 예전 가게 주인 Sam 3턴(보스)을 이어받음
 *   처음 보는 손님(Amy)이 새 순서·새 배치로 같은 재료를 묻는다 → 아이가 「I like ___.」 로 답한다.
 *   모델을 먼저 들려주지 않는다(힌트 0). 힌트 없이 말로 답하면 independent, 도움(모델·고르기)을 받으면 assisted.
 *   시험이 아니라 대화 — 아이가 고른 것이 답이고, 손님은 무엇을 골라도 반가워한다. 못 알아들어도 손님은 기다린다.
 *   소리 공방(구역 kind 'phonics')에서는 대화 대신 「처음 보는 단어 읽기」 — 손님이 단어 카드를 내밀고 아이가 소리 내어 읽는다(응용 단어 먼저).
 *   Lv1(W06): 알파벳 칸(letters) = 손님이 소리를 내면 그 소리 글자를 찾는다(묶음마다 하나 — 다섯 묶음을 한 바퀴) ·
 *             대화 칸(talk — I like) = 손님(Amy)이 친구와 대화의 장면을 새 차례로, 모델 없이(PlayTalk) ·
 *             첫 단어 칸(sight)·단어와 그림 칸 = 단어 카드 읽기(통째로 보는 단어는 쪼개지 않는다).
 *   공통 인터페이스: start(ctx) → Promise({ completed, passed:true, by:'speech'|'chosen' }) · ctx.zone.boss.turns 사용
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    guest: 'amy',       /* 특별 손님 */
    stepIn: 520,        /* 손님이 앞으로 오는 시간(ms) */
    replyGap: 400,      /* 손님 대답 뒤 다음 질문까지 */
    show: 3             /* 열린 질문(What do you like?)에서 보여 줄 그림 수 */
  };
  var REPLY = [['Yum! Good choice.', '냠! 잘 골랐어.'], ['Me too!', '나도!'], ['Great! Thank you!', '고마워!']];
  var READ_ASK = ['Read it!', '이게 뭐라고 적혀 있을까? 읽어 줘.'];
  /* Lv1 무대 — 손님의 대답·부탁도 Lv1 #1·#2 낱말만 */
  var REPLY2 = [['Good choice!', '잘 골랐어!'], ['Me too!', '나도!'], ['Great! Thank you!', '고마워!']];
  var REPLY1 = [['I like it!', '좋아!'], ['I like you!', '네가 좋아!'], ['I see it!', '그렇구나!']], READ_ASK1 = ['Hi!', '이게 뭐라고 적혀 있을까? 읽어 줘.'];
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 새 순서·새 배치 — 둘 중 고르는 질문들은 섞고, 열린 질문은 맨 뒤 */
  function plan(turns) {
    var closed = turns.filter(function (t) { return t.pick.length <= 2; }), open = turns.filter(function (t) { return t.pick.length > 2; });
    return shuffle(closed).concat(open).map(function (t) { return { ask: t.ask, ko: t.ko, pick: t.pick.length > 2 ? shuffle(t.pick).slice(0, CONF.show) : shuffle(t.pick) }; });
  }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, npc = S.npc || g.PlayNpc, scene = S.scene || g.PlayScene, tts = S.tts;
    var audio = S.audio || { play: function () {} };
    var turns = plan((Z.boss && Z.boss.turns) || []), sent = Z.sentence || function (w) { return 'I like ' + w + '.'; };
    var pic = {}; (ctx.pool || ctx.targets || []).forEach(function (x) { pic[x.w] = x.pic; });
    var who = (ctx.opt && ctx.opt.guest) || CONF.guest, L1 = Z.world === 'lv1', REP = L1 ? REPLY1 : Z.foods ? REPLY : REPLY2, ASK = L1 ? READ_ASK1 : READ_ASK;     /* 「Yum!」은 먹는 무대에서만 */
    if (Z.talk && g.PlayTalk) return g.PlayTalk.run(ctx, { who: who, hint0: true, guest: true });      /* 대화 칸 — 손님과 대화(힌트 0) */
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'oq sg'); host.appendChild(root);
    var q = scene.queue(root, { guests: [who], npc: npc });
    var ask = h('div', 'sg-ask'), frame = h('div', 'say', sent('___')), act = h('div', 'oq-act'), dots = h('div', 'dots');
    root.appendChild(ask); root.appendChild(frame); root.appendChild(act); root.appendChild(dots);
    var i = 0, bys = [];
    /* 읽기 판 — 응용 단어(처음 보는 단어)부터 셋 */
    var letters = !!(Z.letters && Z.bundles && g.PlayPhonics), reading = !letters && (Z.kind === 'phonics' || !turns.length), cards = [];
    if (letters) { cards = Z.bundles.map(function (b) { return shuffle(b)[0]; }); frame.style.display = 'none'; }        /* 묶음마다 소리 하나 */
    if (reading) {
      var ws = (Z.words || []).slice(), ap = shuffle(ws.filter(function (x) { return x.role === 'apply'; })), rest = shuffle(ws.filter(function (x) { return x.role !== 'apply'; }));
      cards = ap.concat(rest).slice(0, CONF.show);
      frame.style.display = 'none';
    }
    var total = reading || letters ? cards.length : turns.length;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function speak(en) { return G.soon(tts ? tts.sentence(en) : null); }

    return new Promise(function (resolve) {
      function turn() {
        dots.innerHTML = new Array(total + 1).join('x').split('').map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= total) return resolve({ completed: true, passed: true, by: bys.indexOf('speech') >= 0 ? 'speech' : 'chosen' });
        if (letters) return soundTurn();
        if (reading) return readTurn();
        var t = turns[i];
        npc.react(q.G[who], 'wait'); act.innerHTML = '';
        frame.textContent = sent('___'); frame.classList.remove('done');
        q.say(t.pick.map(function (w) { return pic[w]; }).join(' '), false); q.bub.classList.add('multi');
        ask.innerHTML = '<b>' + t.ask + '</b><small>' + t.ko + '</small>';
        speak(t.ask).then(function () {
          if (!alive()) return;
          /* 아이가 고른 것이 답 — 보여 준 것 중 무엇이든 「I like X.」 */
          return g.PlayTutor.ask(ctx, { host: act, cands: t.pick, kind: 'sentence', sentence: sent, hint0: true });
        }).then(function (r) {
          if (!r || !alive()) return;
          bys.push(r.by);
          frame.textContent = sent(r.word); frame.classList.add('done');
          ctx.emit(E.say(r.word, r));
          ctx.good(r.by === 'speech' && !r.hinted, { at: q.G[who] });
          npc.react(q.G[who], 'ok', { stay: true });
          var rep = REP[i % REP.length];
          ask.innerHTML = '<b>' + rep[0] + '</b><small>' + rep[1] + '</small>';
          speak(rep[0]).then(function () { i++; later(CONF.replyGap, turn); });
        });
      }
      /* 알파벳 판의 한 소리 — 손님이 소리를 내면 글자 셋 중에서 찾는다(지금까지 익힌 글자에서). 다르면 그 글자만 흐려지고 소리를 다시 */
      function soundTurn() {
        var P = g.PlayPhonics, u = cards[i], opts = shuffle([u].concat(P.distract(u, Z.id, 2))), tries = 1, clean = true, over = false;
        npc.react(q.G[who], 'wait'); q.say(g.PlayIcon.html('ear'), false);
        ask.innerHTML = '<b>Listen!</b><small>손님이 낸 소리의 글자를 찾아 줘.</small>'; act.innerHTML = '';
        var box = h('div', 'oq-offer sg-letters');
        opts.forEach(function (k) {
          var b = h('button', 'tile', P.chip(k)); b.type = 'button'; b.setAttribute('data-u', k);
          b.onclick = function () {
            if (over || b.disabled) return;
            if (k !== u) { clean = false; tries++; b.disabled = true; b.classList.add('dim'); ctx.oops(); return G.soon(P.say(tts, u, { anchor: true })); }
            over = true; b.classList.add('ok'); bys.push('chosen');
            ctx.emit(E.act(u, 'listen', 'touch', clean, tries)); ctx.good(clean, { at: q.G[who] });
            npc.react(q.G[who], 'ok', { stay: true }); q.say(P.chip(u), false);
            var rep = REP[i % REP.length]; ask.innerHTML = '<b>' + rep[0] + '</b><small>' + rep[1] + '</small>';
            speak(rep[0]).then(function () { i++; later(CONF.replyGap, turn); });
          };
          box.appendChild(b);
        });
        act.appendChild(box);
        G.soon(P.say(tts, u));
      }
      /* 읽기 판의 한 장 — 손님이 카드를 내민다(먼저 들려주지 않는다) */
      function readTurn() {
        var x = cards[i];
        npc.react(q.G[who], 'wait'); q.say(g.PlayIcon.html('speech'), false);
        ask.innerHTML = '<b>' + ASK[0] + '</b><small>' + ASK[1] + '</small>';
        g.PlayReader.one(ctx, act, x).then(function (r) {
          if (!r || !alive()) return;
          bys.push(r.by); q.say(x.pic || g.PlayIcon.html('check'), false);
          ctx.emit(E.say(x.w, r));
          ctx.good(r.by === 'speech' && !r.hinted, { at: q.G[who] });
          npc.react(q.G[who], 'ok', { stay: true });
          var rep = REP[(i + 1) % REP.length];
          ask.innerHTML = '<b>' + rep[0] + '</b><small>' + rep[1] + '</small>';
          speak(rep[0]).then(function () { i++; later(CONF.replyGap, turn); });
        });
      }
      audio.play('enter'); q.place(who, 'front');
      G.soon(ctx.intro, null).then(function () { later(CONF.stepIn, turn); });
    });
  }

  g.PlaySpecialGuest = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'special-guest', no: 27, name: '특별 손님', icon: 'crown', channels: ['say', 'talk'], axis: 'quest', need: {}, last: true,
    count: function (c) { var z = c.zone || {};
      if (z.letters && z.bundles) return z.bundles.length;
      if (z.talk) return z.talk.length;
      return z.kind === 'phonics' || !(z.boss && z.boss.turns && z.boss.turns.length) ? Math.min(CONF.show, (z.words || []).length) : z.boss.turns.length; },
    intro: { en: 'Oh! A friend!', ko: '처음 보는 손님이야 — 물어보면 대답해 줘!' },
    intro1: { en: 'Oh! Hi!', ko: '처음 보는 손님이야 — 손님 말에 대답해 줘!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
