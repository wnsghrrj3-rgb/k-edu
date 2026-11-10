/* ============================================================
 * 영어 놀이터 — 놀이 #21 「친구와 대화」(PlayTalk) (게임설계 v1 §4-21 · 말 · 관계)
 *   친구(Ben)가 무언가를 보여 주며 한마디(Lv1 #1·#2 낱말만) → 아이가 두 문장 중 하나로 답한다 → 고른 문장에 따라 대화가 갈라진다
 *   (「I like it.」 → 선물을 받는다 · 「I like you.」 → 둘이 마주 보고 웃는다 · 「I like a cat.」 → 고양이가 나에게 온다).
 *   시험이 아니라 대화 — 두 문장 모두 답이다. 말풍선 카드를 누르면 그 문장을 들려준다(그 뒤에 말하면 「도움 받고 말함」).
 *   아직 씨앗이 없는 문장이 있으면 끝에 한 장면 더(그 문장 카드를 앞에) — 고른 것만 말하다가 한 문장이 영영 안 심기는 일이 없게.
 *   특별 손님(Amy)도 이 모듈을 쓴다: run(ctx, { who:'amy', hint0:true, guest:true }) — 새 차례 · 카드에 글자·소리 없이 그림만(힌트 0).
 *   공통 인터페이스: start(ctx) → Promise({ completed, passed, by }) · 증거 = 말하기(say) · 대상 = 문장(씨앗도 문장째로)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    who: 'ben',        /* 대화 친구 */
    maxTurns: 4,       /* 한 번에 나누는 장면 수(덧붙는 장면 포함) */
    reactMs: 1300,     /* 갈라진 반응을 보여 주는 시간 */
    nextMs: 500
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 오늘 나눌 장면 — 차례대로(손님은 섞어서) */
  function plan(scenes, o) { o = o || {}; return (o.guest ? shuffle(scenes) : scenes.slice()).map(function (s) { return { scene: s, prefer: null }; }); }
  /* 덧붙는 장면 — 아직 씨앗도 없고 오늘 말하지도 않은 문장이 든 장면(그 카드를 앞에). 없으면 null */
  function extra(scenes, planted, said) {
    for (var k = 0; k < scenes.length; k++) for (var j = 0; j < scenes[k].pick.length; j++) { var w = scenes[k].pick[j]; if (!planted[w] && !said[w]) return { scene: scenes[k], prefer: w }; }     /* planted·said 는 문장으로 묻는다(대상이 낱말인 칸은 run 이 문장으로 옮겨 준다) */
    return null;
  }

  function run(ctx, o) {
    o = o || {};
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, A = g.PlayArt, npc = S.npc || g.PlayNpc, tts = S.tts, audio = S.audio || { play: function () {} };
    var who = o.who || (ctx.opt && ctx.opt.who) || CONF.who, scenes = Z.talk || [];
    /* 문장 ↔ 열쇠·그림·증거 대상. 음성 판정은 낱말 열쇠로(문장틀 like 류 + 끝 낱말 — PlaySpeech.matchSentence).
       I like 칸(Lv1)은 문장이 곧 칸의 단어(씨앗 = 문장째로) · 교실처럼 낱말 칸이면 증거 대상 = 그 낱말(book), 칸에 없는 문장(I am here.)은 문장째로 */
    var byW = {}; (Z.words || []).forEach(function (x) { byW[x.w] = x; });
    function keyFor(sn) { var x = byW[sn]; return x && x.art ? x.art : sn.replace(/[.!?]$/, '').split(' ').pop(); }
    function targetFor(sn) { if (byW[sn]) return sn; var k = keyFor(sn); return byW[k] ? k : sn; }
    function picFor(sn) { var x = byW[sn] || byW[keyFor(sn)]; return x ? x.pic : (A.has(keyFor(sn)) ? A.html(keyFor(sn)) : ''); }
    var planted = {}; if (S.seed && S.seed.all) { var all = S.seed.all(); scenes.forEach(function (sc) { sc.pick.forEach(function (sn) { if (all[targetFor(sn)]) planted[sn] = 1; }); }); }
    var turns = plan(scenes, { guest: !!o.guest, planted: planted });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'tk' + (o.guest ? ' tk-guest' : '')), dots = h('div', 'dots'), scene = h('div', 'tk-scene'), line = h('div', 'sg-ask'), cards = h('div', 'tk-cards'), act = h('div', 'oq-act');
    scene.innerHTML = '<div class="tk-me">' + A.html('I') + '</div><div class="tk-mid" id="tkMid"></div><div class="tk-friend"></div>';
    root.appendChild(dots); root.appendChild(scene); root.appendChild(line); root.appendChild(cards); root.appendChild(act); host.appendChild(root);
    var mid = scene.querySelector('.tk-mid'), fr = scene.querySelector('.tk-friend');
    npc.render(fr, who, { face: 'idle' });
    var i = 0, bys = [], said = {};
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function speak(en) { return G.soon(tts ? tts.sentence(en) : null); }

    return new Promise(function (resolve) {
      function turn() {
        dots.innerHTML = turns.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= turns.length && !o.guest && turns.length < CONF.maxTurns) { var x = extra(scenes, planted, said); if (x) turns.push(x); }
        if (i >= turns.length) return resolve({ completed: true, passed: true, by: bys.indexOf('speech') >= 0 ? 'speech' : 'chosen' });
        var t = turns[i], sc = t.scene, helped = false, sentOf = {};
        var pick = t.prefer ? [t.prefer].concat(sc.pick.filter(function (w) { return w !== t.prefer; })) : (o.guest ? shuffle(sc.pick) : sc.pick.slice());
        mid.className = 'tk-mid'; mid.innerHTML = sc.show.map(function (a) { return '<span class="tk-thing">' + A.html(a) + '</span>'; }).join('');
        npc.react(fr, 'wait'); act.innerHTML = '';
        line.innerHTML = '<b>' + sc.line.en + '</b><small>' + sc.line.ko + '</small>';
        /* 대답 카드 — 그림 + (손님 판이 아니면) 문장 글자. 누르면 들려준다 */
        cards.innerHTML = '';
        pick.forEach(function (w) {
          var c = h('button', 'tk-card' + (t.prefer === w ? ' new' : ''), '<span class="tk-pic">' + picFor(w) + '</span>' + (o.guest ? '' : '<span class="tk-say">' + w + '</span>')); c.type = 'button'; c.setAttribute('data-w', w);
          c.onclick = function () { if (o.guest) return; helped = true; speak(w); };
          cards.appendChild(c);
        });
        audio.play('enter');
        speak(sc.line.en).then(function () {
          if (!alive()) return;
          var keys = pick.map(function (w) { var k = keyFor(w); sentOf[k] = w; return k; }), tctx = {};
          Object.keys(ctx).forEach(function (k) { tctx[k] = ctx[k]; });
          tctx.pool = keys.map(function (k) { return { w: k, pic: picFor(sentOf[k]) }; });          /* 헷갈림 비교는 이 장면의 두 열쇠끼리 */
          return g.PlayTutor.ask(tctx, { host: act, cands: keys, kind: 'sentence', sentence: function (k) { return sentOf[k] || k; }, hint0: !!o.hint0 });     /* 문장틀 판정 = 기본(like 와 비슷한 소리) */
        }).then(function (r) {
          if (!r || !alive()) return;
          r.word = sentOf[r.word] || r.word;                                                    /* 고른 문장 */
          if (helped) r.hinted = true;
          bys.push(r.by); said[r.word] = 1;
          ctx.emit(E.say(targetFor(r.word), r));                                                /* 증거·씨앗 대상(문장 칸 = 문장 · 낱말 칸 = 낱말) */
          ctx.good(r.by === 'speech' && !r.hinted, { at: fr });
          /* 갈라진 반응 — 고른 문장에 따라 */
          var then = (sc.then || {})[r.word] || { face: 'ok' };
          Array.prototype.forEach.call(cards.children, function (c) { c.classList.toggle('chosen', c.getAttribute('data-w') === r.word); c.disabled = true; });
          npc.react(fr, then.face || 'ok', { stay: true });
          if (then.art) { mid.innerHTML = '<span class="tk-thing">' + A.html(then.art) + '</span>'; mid.className = 'tk-mid tk-give'; }
          line.innerHTML = '<b>' + r.word + '</b><small>' + (then.ko || '') + '</small>';
          later(CONF.reactMs, function () { i++; later(CONF.nextMs, turn); });
        });
      }
      G.soon(ctx.intro, null).then(function () { if (alive()) turn(); });
    });
  }

  g.PlayTalk = { CONF: CONF, plan: plan, extra: extra, run: run };
  if (g.PlayGame) g.PlayGame.register({
    id: 'talk', no: 21, name: '친구와 대화', icon: 'speech', channels: ['talk', 'say'], axis: 'talk', need: { lv1: 2 }, plants: true,
    fits: function (zone) { return !!(zone.talk && zone.talk.length); },
    count: function (c) { return ((c.zone || {}).talk || []).length; },
    intro: { en: 'Hi!', ko: '친구가 놀러 왔어 — 친구 말에 문장으로 대답해 줘!' },
    start: function (ctx) { return run(ctx, {}); }
  });
})(window);
