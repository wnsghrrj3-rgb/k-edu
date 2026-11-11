/* ============================================================
 * 영어 놀이터 — 놀이 #19 「마법 주문(말로 움직이기)」 (게임설계 v1 §4-19 · 말 · 관계)
 *   지시문 대신 「이름 부르기」 — 선반에 물건(또는 동작 카드)이 넷 놓여 있고, 아이가 그중 아무것이나 이름을 부르면
 *   교실: Mina 가 그 물건을 가져와 책상에 놓는다 · 운동장: Ben 이 그 동작을 한다(그림이 움직인다).
 *   아이가 고른다 — 정답이 하나가 아니다. 다 부르면 끝(대상 수만큼).
 *   못 알아들었을 때: 한 번 더 → 두 번째에 「이거?」(카드를 누르면 이름을 들려주고 그것을 해 준다 — 도움 받은 것으로 적힘).
 *   마이크가 없는 판은 카드를 눌러서(들려준 뒤 가져온다) — 증거는 assisted·touch, 씨앗은 말로 부른 것에만(PlayGame.run 이 정한다).
 *   PlayMagic.machine(words, o) — 화면 없는 흐름(선반·부르기·남은 것). 검사는 여기를 직접 본다.
 *   공통 인터페이스: start(ctx) → Promise({ completed, results:[{word, by, tries}] }) · 증거 = 말하기(say)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    shelf: 4,          /* 선반에 한 번에 놓이는 수 */
    rounds: 6,         /* 한 번에 부르는 수(대상이 적으면 그만큼) */
    maxTries: 2,       /* 이만큼 못 알아들으면 「이거?」 — 카드를 눌러도 된다 */
    fetchMs: 700,      /* 가져오기·동작 연출 길이 */
    nextMs: 400,
    listenGap: 250,
    listenMs: 7000
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* 화면 없는 흐름 — 선반(지금 놓인 것) · 부르기 · 남은 것 */
  function machine(words, o) {
    o = o || {};
    var n = Math.min(o.rounds || CONF.rounds, words.length), k = o.shelf || CONF.shelf, queue = words.slice(0, n), shelf = [], done = [];
    function fill() { while (shelf.length < k && queue.length) shelf.push(queue.shift()); }
    fill();
    return {
      total: n,
      shelf: function () { return shelf.slice(); },
      done: function () { return done.slice(); },
      left: function () { return n - done.length; },
      /* 아이가 w 를 불렀다(선반에 있어야 받는다) */
      call: function (w, by) {
        var i = shelf.indexOf(w); if (i < 0) return { type: 'ignored' };
        shelf.splice(i, 1); done.push({ word: w, by: by }); fill();
        return { type: 'fetch', word: w, by: by, finished: done.length >= n };
      }
    };
  }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, npc = S.npc || g.PlayNpc, tts = S.tts, speech = S.speech, audio = S.audio || { play: function () {} };
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; }, off: function () {}, primed: function () { return false; }, prime: function () {} };
    var act = Z.kind === 'action', who = act ? 'ben' : 'mina';
    var items = ctx.targets || [], pic = {}; (ctx.pool || items).concat(items).forEach(function (x) { pic[x.w] = x.pic; });
    var m = machine(items.map(function (x) { return x.w; }));
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'mg' + (act ? ' mg-act' : '')), dots = h('div', 'dots'), scene = h('div', 'mg-scene'), shelfEl = h('div', 'mg-shelf'), tray = h('div', 'mg-tray'), ctl = h('div', 'oq-act');
    scene.innerHTML = '<div class="mg-who"></div><div class="mg-stagebox"><span class="mg-show"></span></div>';
    root.appendChild(dots); root.appendChild(scene); root.appendChild(shelfEl); root.appendChild(tray); root.appendChild(ctl); host.appendChild(root);
    var whoEl = scene.querySelector('.mg-who'), show = scene.querySelector('.mg-show');
    npc.render(whoEl, who, { face: 'idle', wear: act ? 'whistle' : 'lanyard' });
    var tries = 0, listening = false, offerOn = false, busy = false, micEl = null, heardEl = null, done, results = [];
    var finished = new Promise(function (r) { done = r; });
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function say(w) { return G.soon(tts ? tts.word(w) : null); }
    function drawDots() { var n = m.done().length; dots.innerHTML = new Array(m.total + 1).join('x').split('').map(function (_, k) { return '<i class="' + (k < n ? 'ok' : k === n ? 'on' : '') + '"></i>'; }).join(''); }
    function drawShelf() {
      shelfEl.innerHTML = '';
      m.shelf().forEach(function (w) {
        var b = h('button', 'mg-card' + (offerOn ? ' tap' : ''), '<span class="mg-pic">' + (pic[w] || w) + '</span>'); b.type = 'button'; b.setAttribute('data-w', w);
        b.onclick = function () { if (busy) return; if (!mic.ok() || offerOn) { say(w).then(function () { bring(w, 'chosen'); }); } else say(w); };     /* 마이크가 있으면 누르면 이름만 들려준다(도움) */
        shelfEl.appendChild(b);
      });
    }
    /* 가져오기·동작하기 */
    function bring(w, by) {
      if (busy || !alive()) return;
      var e = m.call(w, by); if (e.type !== 'fetch') return;
      busy = true; listening = false; offerOn = false;
      var r = { word: w, by: by, tries: tries }; results.push(r);
      ctx.emit(E.say(w, { by: by, tries: tries, mic: mic.ok() }));
      ctx.good(by === 'speech' && tries === 0, { at: whoEl });
      npc.react(whoEl, 'ok', { stay: true }); audio.play('tray');
      show.innerHTML = pic[w] || w; show.setAttribute('data-w', w); show.className = 'mg-show act-go go';
      if (heardEl) heardEl.textContent = '';
      later(CONF.fetchMs, function () {
        if (!act) tray.insertAdjacentHTML('beforeend', '<span class="mg-got" data-w="' + w + '">' + (pic[w] || w) + '</span>');
        show.className = 'mg-show'; npc.react(whoEl, 'wait'); busy = false; tries = 0;
        drawDots();
        if (e.finished) return later(CONF.nextMs, function () { done({ completed: true, results: results }); });
        drawShelf(); later(CONF.nextMs, ready);
      });
    }
    function ready() {
      ctl.innerHTML = '';
      if (!mic.ok()) { ctl.appendChild(h('div', 'heard', '누르면 이름을 듣고 가져와요')); return; }
      micEl = h('button', 'mic', g.PlayIcon.html('mic')); micEl.type = 'button'; heardEl = h('div', 'heard', offerOn ? '이거? 눌러도 돼' : '하나를 골라 이름을 불러 봐');
      ctl.appendChild(micEl); ctl.appendChild(heardEl);
      micEl.onclick = function () { if (!listening && !busy) listen(); };
      if (mic.primed() && G.canSound()) later(CONF.listenGap, listen);
    }
    function listen() {
      if (listening || busy || !alive() || !micEl) return;
      var cands = m.shelf(); listening = true; micEl.classList.add('on'); heardEl.textContent = '듣고 있어요…';
      var others = function (c) { return cands.filter(function (x) { return x !== c; }); };
      speech.tryOnce(cands[0], { kind: 'word', others: others(cands[0]), timeout: CONF.listenMs, judge: function (t) { return cands.some(function (c) { return speech.matchWord(t, c, others(c)); }); } }).then(function (r) {
        listening = false; if (!alive() || busy) return;
        if (micEl) micEl.classList.remove('on');
        if (r.error === 'unavailable' || r.error === 'not-allowed' || r.error === 'service-not-allowed') { mic.off(); offerOn = true; drawShelf(); return ready(); }
        if (r.error === 'network' || r.error === 'audio-capture' || r.error === 'start') { offerOn = true; drawShelf(); return ready(); }
        mic.prime();
        var hit = cands.filter(function (c) { return speech.matchWord(r.heard, c, others(c)); })[0];
        if (hit) return bring(hit, 'speech');
        tries++; if (r.heard) { audio.play('soft'); npc.react(whoEl, 'no'); }
        if (tries >= CONF.maxTries) { offerOn = true; drawShelf(); heardEl.textContent = '이거? 눌러도 돼'; S.sam && S.sam.say && S.sam.say(cands[0] + '?', '이거?'); return; }
        heardEl.textContent = '한 번 더 크게!'; later(CONF.listenGap + 300, listen);
      });
    }
    drawDots(); drawShelf();
    G.soon(ctx.intro, null).then(function () { if (alive()) ready(); });
    return finished;
  }

  g.PlayMagic = { CONF: CONF, machine: machine, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'magic-call', no: 19, name: '마법 주문', icon: 'wand', channels: ['say'], axis: 'talk', need: { lv1: 5 }, plants: true,
    fits: function (zone) { return (zone.kind === 'things' || zone.kind === 'action' || zone.step) && (zone.words || []).filter(function (x) { return x.drawn !== false && g.PlayArt && g.PlayArt.has(x.art || x.w); }).length >= CONF.shelf; },
    count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length); },
    intro: { en: 'Call it!', ko: '하나를 골라 이름을 불러 봐 — 그대로 해 줄게!' },
    start: start
  });
})(window);
