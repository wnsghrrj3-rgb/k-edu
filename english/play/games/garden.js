/* ============================================================
 * 영어 놀이터 — 놀이 #26 「말하는 정원(물 주기)」 + #28 「이름표」 (게임설계 v1 §4-26 · 설계 v2 §3·§4-28 · 한 해 길 §4)
 *   오늘 차례가 된 씨앗(심은 지 1·3·7일)마다, 다음 단계로 자라는 데 아직 남은 조건만 한 가지씩 한다(조건표 = 씨앗 엔진의 PATHS — engine/play-seed.js).
 *     새싹(+1일) — 입으로: 이름표를 읽고(말하기) 그 식물에 꽂는다(읽기 — 글자만 보고 고르기)
 *     꽃(+3일)   — 손으로: 이름표 글자를 맞춘다(소리 상자를 부른다 — games/sound-box.js)
 *     열매(+7일) — 손으로: 이름표를 내가 쓴다(손 쓰기 엔진 — engine/play-write.js). 열매에 내 글씨 이름표가 달린다.
 *                  어른 메뉴 「손 쓰기 대신 조각으로」가 켜져 있으면 글자 조각 놓기로(증거 support tiles)
 *   길마다 꼴: 글자(letter) 새싹 = 글자 보고 소리 고르기 · 입말(oral) 새싹 = 그림 보고 말하기 + 첫소리 글자 고르기 ·
 *             문장(sentence) 새싹 = 낱말 칩 차례 맞추기 + 그림 고르기 · 꽃 = 그림 보고 문장 말하기.
 *   간격이 된 뒤 며칠에 나눠 채워도 된다 — 오늘 못 한 조건은 내일 정원에 다시 나온다. 틀려도 내려가지 않는다.
 *   마이크가 없으면 말하기 조건은 골라서 넘어가고(그 조건은 안 찬다 — 입으로 해야 새싹), 손으로 하는 조건은 그대로 찬다.
 *   공통 인터페이스: start(ctx) — ctx.targets = 오늘 돌볼 것들({ w, pic, path }). 증거 = 말하기·읽기·듣기·조각 쓰기
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    showMs: 1100,     /* 자란 모습을 보여 주는 시간(ms) */
    endMs: 1500,      /* 끝 화면에서 다음으로 넘어가기까지(이어지는 놀이가 있을 때) */
    options: 3        /* 꽂기·고르기의 보기 수 */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 그 씨앗이 오늘 할 일 — 남은 조건을 화면 한 가지씩으로. → ['say','stick','first','sounds','spell','chips','write'] 중 */
  function jobs(x, seed, o) {
    o = o || {};
    var api = o.api, path = (seed && seed.path) || x.path || 'word', miss = seed && api ? api.needs(path, seed.stage + 1).filter(function (p) { return !(seed.need || {})[p]; }) : [], out = [];
    var next = seed ? seed.stage + 1 : 0;
    miss.forEach(function (p) {
      if (p === 'S') out.push('say');
      else if (p === 'R') out.push(path === 'letter' ? 'sounds' : 'stick');
      else if (p === 'L') { if (path === 'oral') out.push('first'); }                      /* 지문의 꽃(이야기 듣기)은 그림책방에서 */
      else if (p === 'W') { if (next === 3 || path === 'letter' || (path === 'oral' && next === 2)) { if (o.tiles || (o.pen && (!(path === 'sentence' || path === 'text') || o.sent))) out.push('write'); } else out.push(path === 'sentence' ? 'chips' : 'spell'); }
    });
    return out;
  }

  function start(ctx) {
    var S = ctx.services || {}, seed = S.seed, E = g.PlayEvidence, G = g.PlayGame, A = g.PlayArt, tts = S.tts, sam = S.sam || { say: function () { return Promise.resolve(); }, react: function () {} };
    var STAGE = (seed && seed.STAGE) || [{ icon: 'seed', name: '씨앗' }, { icon: 'sprout', name: '새싹' }, { icon: 'flower', name: '꽃' }, { icon: 'fruit', name: '열매' }];
    var IC = function (st) { return g.PlayIcon.html(STAGE[st].icon); };
    var due = (ctx.targets || []).slice(), pool = (ctx.pool || []).concat(due), tiles = !!(ctx.opt && ctx.opt.tiles), W = g.PlayWrite, pen = !tiles && !!(W && W.available());
    var keyOf = function (x) { return seed && seed.key ? seed.key(x.w, x.path) : x.w; };
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'gd'), dots = h('div', 'dots'), counter = h('div', 'counter');
    root.appendChild(dots); root.appendChild(counter); host.appendChild(root);
    var i = 0, grown = 0;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function others(x, n) { return shuffle(pool.filter(function (y, k, a) { return y.w !== x.w && y.pic && a.findIndex(function (z) { return z.w === y.w; }) === k; })).slice(0, n); }
    function tag(x) { return '<div class="gd-tag">' + (x.path === 'oral' ? '<b>' + x.w.charAt(0) + '</b>' + x.w.slice(1) : x.w) + '</div>'; }

    return new Promise(function (resolve) {
      function end() {
        dots.innerHTML = due.map(function () { return '<i class="ok"></i>'; }).join('');
        counter.innerHTML = '<div class="gd-ch" id="ch"></div><div class="word gd-end">오늘 돌보기 끝!</div><div class="hint">' + (grown ? new Array(grown + 1).join(g.PlayIcon.html('sprout')) + ' 자랐어요' : '내일 또 와요') + '</div>';
        if (S.char && seed) S.char.render(counter.querySelector('#ch'), { parts: seed.parts(), mood: 'cheer' });
        if (S.audio) S.audio.play('done');
        if (grown && S.fx) S.fx.confetti();
        setTimeout(function () { resolve({ completed: true }); }, ctx.opt && ctx.opt.last ? 0 : CONF.endMs);
      }
      /* ── 한 가지씩 ── */
      var DO = {
        /* 이름표를 읽는다(말하기) — 읽기 낱말은 글자만, 입말·뜻 낱말은 그림 */
        say: function (x, st) {
          var showPic = x.path === 'oral' || x.path === 'word' || x.path === 'sentence';
          counter.innerHTML = '<div class="seed s' + st + ' gd-seed">' + IC(st) + '</div>' + (showPic ? '<div class="pic big">' + (x.pic || '') + '</div>' : '') + tag(x);
          var sentence = x.path === 'sentence' || x.path === 'text', key = sentence ? x.w.replace(/[.!?]$/, '').split(' ').pop().toLowerCase() : x.w;
          var before = showPic && !sentence ? ctx.say(x.w) : Promise.resolve();        /* 읽기 낱말은 먼저 들려주지 않는다 */
          return before.then(function () {
            if (!alive()) return null;
            return g.PlayTutor.ask(ctx, sentence ? { host: counter, cands: [key], kind: 'sentence', sentence: function () { return x.w; }, frame: x.w.toLowerCase().replace(/[^a-z ]/g, '').split(' ').slice(0, 2) } : { host: counter, target: x.w, kind: 'word', hint0: !showPic, offerText: !showPic });
          }).then(function (r) { if (!r) return null; var ev = ctx.emit(E.say(x.w, r)); ctx.good(r.by === 'speech' && r.tries === 0); return ev; });
        },
        /* 이름표를 그 식물에 꽂는다(읽기) — 글자만 보고 그림 고르기 */
        stick: function (x, st) {
          return pickOne(x, st, tag(x), [x].concat(others(x, CONF.options - 1)), function (y) { return y.pic || y.w; }, function (clean, tries) { return E.act(x.w, 'read', 'touch', clean, tries); }, null);
        },
        /* 글자 보고 소리 고르기(글자 길의 새싹) */
        sounds: function (x, st) {
          var P = g.PlayPhonics, alts = P ? P.distract(x.w, ctx.zone && ctx.zone.id, CONF.options - 1) : [];
          var opts = [x].concat(alts.map(function (k) { return { w: k }; }));
          return pickOne(x, st, '<div class="gd-tag gd-letter">' + x.w + '</div>', opts, function () { return g.PlayIcon.html('speaker'); }, function (clean, tries) { return E.make({ targetId: x.w, skill: 'read', outcome: clean ? 'independent' : 'assisted', inputMode: 'touch', attempts: tries, unit: 'letter' }); },
            function (y) { return G.soon(P && tts ? P.say(tts, y.w) : null); });
        },
        /* 첫소리 글자 고르기(입말 길의 새싹) */
        first: function (x, st) {
          var c = x.w.charAt(0), v = 'aeiou', poolL = (v.indexOf(c) >= 0 ? v : 'bcdfghjklmnprstvwyz').split('').filter(function (k) { return k !== c; });
          var opts = [{ w: c }].concat(shuffle(poolL).slice(0, CONF.options - 1).map(function (k) { return { w: k }; }));
          ctx.say(x.w);
          return pickOne({ w: c }, st, '<div class="pic big">' + (x.pic || '') + '</div>', opts, function (y) { return '<span class="ph-chip">' + y.w + '</span>'; }, function (clean, tries) { return E.act(x.w, 'listen', 'touch', clean, tries); }, null, function () { return ctx.say(x.w, 0.6); });
        },
        /* 이름표 글자 맞추기(꽃) — 소리 상자 */
        spell: function (x) {
          return g.PlaySoundBox.one(ctx, counter, x, {}).then(function (r) { return ctx.emit(E.write(x.w, { skill: 'spell', support: r.support, clean: r.clean, attempts: r.tries + 1, inputMode: 'touch' })); });
        },
        /* 문장 칩 차례 맞추기(문장 길의 새싹) */
        chips: function (x) {
          var words = x.w.replace(/[.!?]$/, '').split(' '), at = 0, tries = 0;
          counter.innerHTML = '<div class="pic big">' + (x.pic || '') + '</div><div class="gd-line"></div><div class="gd-chips"></div>';
          var line = counter.querySelector('.gd-line'), tray = counter.querySelector('.gd-chips');
          G.soon(tts ? tts.sentence(x.w) : null);
          return new Promise(function (res) {
            shuffle(words.map(function (w2, k) { return { w: w2, k: k }; })).forEach(function (c) {
              var b = h('button', 'gv-chip', c.w); b.type = 'button'; b.setAttribute('data-c', c.w);
              b.onclick = function () {
                if (b.disabled) return;
                if (c.w !== words[at]) { tries++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); ctx.oops(); return G.soon(tts ? tts.sentence(x.w, { rate: 0.6 }) : null); }
                b.disabled = true; b.classList.add('used'); line.textContent = words.slice(0, ++at).join(' ') + (at === words.length ? '.' : '');
                if (at === words.length) res(ctx.emit(E.write(x.w, { skill: 'spell', support: tries ? 'slow' : 'none', clean: !tries, attempts: tries + 1, inputMode: 'touch', unit: 'sentence' })));
              };
              tray.appendChild(b);
            });
          });
        },
        /* 이름표 쓰기(열매 · 글자와 입말은 꽃부터) — 손으로. 어른 메뉴 「조각으로」면 글자 조각 놓기 */
        write: function (x, st) {
          var unit = x.path === 'letter' || x.path === 'oral' ? 'letter' : x.path === 'sentence' ? 'sentence' : x.path === 'text' ? 'text' : 'word';
          if (!pen) return g.PlaySoundBox.one(ctx, counter, x, { asWrite: true }).then(function () { return ctx.emit(E.write(x.w, { skill: 'write', support: 'tiles', inputMode: 'touch', unit: unit })); });
          if (unit === 'sentence' || unit === 'text') return g.PlaySentenceWrite.one(ctx, counter, x, { blank: g.PlaySentenceWrite.blankZone(ctx.zone), chips: false });
          if (unit === 'word') return g.PlayWriteJob.one(ctx, counter, x, { mode: 'free' });
          /* 글자·입말 — 꽃(st 1 → 2)은 따라 쓰기, 열매는 소리 듣고 혼자. 입말은 첫 글자만 */
          var ch = x.w.charAt(0), hear = st >= 2, P = g.PlayPhonics, snd = function () { return x.path === 'letter' ? G.soon(P && P.say && tts ? P.say(tts, ch) : null) : ctx.say(x.w); };
          counter.innerHTML = '<div class="gd-wr">' + (x.path === 'oral' ? '<span class="pic">' + (x.pic || '') + '</span>' : '') + (hear ? '' : '<span class="gd-tag gd-letter">' + ch + '</span>') + '<button type="button" class="btn w pp-rep gd-ear">' + g.PlayIcon.html('speaker') + '</button></div><div class="gd-sheet"></div>';
          counter.querySelector('.gd-ear').onclick = snd; snd();
          return W.write(counter.querySelector('.gd-sheet'), { text: ch, mode: hear ? 'free' : 'trace', key: ch, onMiss: function () { ctx.oops(); snd(); } }).then(function (res) {
            return ctx.emit(E.write(x.w, { skill: 'write', support: res.support, clean: res.clean, attempts: res.attempts, inputMode: 'pen', unit: 'letter' }));
          });
        }
      };
      /* 보기 셋 중 하나 — 다르면 그 보기만 흐려지고 다시 */
      function pickOne(x, st, head, opts, face, evOf, onTap, again) {
        counter.innerHTML = '<div class="seed s' + st + ' gd-seed">' + IC(st) + '</div>' + head + '<div class="gd-plants"></div>';
        var box = counter.querySelector('.gd-plants'), tries = 1, clean = true, over = false, picked = null;
        return new Promise(function (res) {
          shuffle(opts).forEach(function (y) {
            var b = h('button', 'tile', face(y)); b.type = 'button'; b.setAttribute('data-w', y.w);
            b.onclick = function () {
              if (over || b.disabled) return;
              if (onTap && picked !== y) { picked = y; Array.prototype.forEach.call(box.children, function (c) { c.classList.toggle('sel', c === b); }); return onTap(y); }      /* 소리 단추 — 한 번 누르면 듣기, 한 번 더 누르면 고르기 */
              if (y.w !== x.w) { clean = false; tries++; b.disabled = true; b.classList.add('dim'); ctx.oops(); picked = null; if (again) again(); return; }
              over = true; b.classList.add('ok'); var ev = ctx.emit(evOf(clean, tries)); ctx.good(clean, { at: b });
              later(350, function () { res(ev); });
            };
            box.appendChild(b);
          });
        });
      }
      function next() {
        if (!alive()) return;
        dots.innerHTML = due.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= due.length) return end();
        var x = due[i], k = keyOf(x), s0 = seed ? seed.get(k) : null, st = s0 ? s0.stage : 0, todo = jobs(x, s0, { tiles: tiles, pen: pen, sent: !!g.PlaySentenceWrite, api: seed }), grew = false, spoke = false;
        function step() {
          if (!alive()) return;
          var job = todo.shift();
          if (!job) return shown();
          Promise.resolve(DO[job](x, st)).then(function (ev) { if (!alive()) return; if (ev && ev.seed && ev.seed.grew) grew = true; if (ev && E.spoken(ev)) spoke = true; step(); });
        }
        function shown() {
          var s2 = seed && seed.get(k) ? seed.get(k) : { stage: st };
          if (grew) grown++;
          var mine = W && W.ink(x.path === 'letter' || x.path === 'oral' ? x.w.charAt(0) : x.w) && s2.stage >= 2 ? W.svg(x.path === 'letter' || x.path === 'oral' ? x.w.charAt(0) : x.w) : '';      /* 내 글씨 이름표 */
          counter.innerHTML = '<div class="seed s' + s2.stage + ' grow gd-seed big">' + IC(s2.stage) + '</div>' + (mine ? '<div class="gd-ink" data-w="' + x.w + '">' + mine + '</div>' : '') + '<div class="word">' + x.w + '</div><div class="hint">' + (grew ? STAGE[s2.stage].name + '이 됐어요!' : spoke ? '잘 자라고 있어요' : '내일 말해 주면 자라요') + '</div>';
          i++; setTimeout(next, CONF.showMs);
        }
        step();
      }
      if (!due.length) {
        sam.say('Nothing to water today.', '오늘 돌볼 씨앗은 없어요');
        counter.innerHTML = '<div class="hint">내일 또 와요</div>';
        return resolve({ completed: true });
      }
      next();
    });
  }

  g.PlayGarden = { CONF: CONF, jobs: jobs, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'garden', no: 26, name: '씨앗 돌보기', icon: 'plant', channels: ['say'], axis: 'grow', need: {},
    skills: ['S', 'R', 'W'], unit: 'word', serves: [1, 2, 3],
    count: function (c) { return (c.targets || []).length; },
    intro: { en: 'Water your seeds!', ko: '씨앗을 돌봐 줘 — 이름표를 읽고 꽂아 주면 자라!' },
    intro1: { en: 'Hi!', ko: '어제 심은 씨앗에게 이름표를 읽어 주자!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
