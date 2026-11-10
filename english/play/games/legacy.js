/* ============================================================
 * 영어 놀이터 — 첫 구역 때부터 있던 활동 셋(무대 페이지에서 옮겨 옴 — 새 놀이로 바뀔 때까지 둔다)
 *   lean   몸으로 고르기  : 들린 것 쪽으로 몸을 기울인다(카메라) / 누른다          → 뒤에 #10·#11 이 맡는다
 *   plates 접시 채우기    : 글자만 보고 그림을 끌어다 놓는다                       → 뒤에 #5 샌드위치 탑이 맡는다
 *   chant  챈트(#20)      : 키네틱 타이포로 두 번 듣고, 한 줄을 혼자 외친다
 *   공통 인터페이스: start(ctx) — 증거는 ctx.emit, 성공·실패 반응은 ctx.good·ctx.oops
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    leanRounds: 6,
    chantTimeout: 7000,     /* 혼자 외치기 한 번 듣는 길이(ms) */
    chantTries: 2           /* 이만큼 못 알아들으면 그만하면 됐다 하고 넘어간다 */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function setup(ctx, cls) {
    var pic = {}, W = (ctx.pool || ctx.targets || []).map(function (x) { pic[x.w] = x.pic; return x.w; });
    (ctx.targets || []).forEach(function (x) { if (x && x.w) pic[x.w] = x.pic; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', cls); host.appendChild(root);
    return { pic: pic, W: W, root: root, alive: function () { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); } };
  }

  /* ── 몸으로 고르기 ── */
  function lean(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, cam = S.cam, tts = S.tts, u = setup(ctx, 'lg'), pic = u.pic, W = u.W;
    var camw = h('div', 'camwrap', '<video class="cam" playsinline muted></video><div class="lv"><i><b></b></i><i><b></b></i></div>');
    var sides = h('div', 'sides'), hint = h('div', 'hint', '카메라 켜는 중…');
    u.root.appendChild(camw); u.root.appendChild(sides); u.root.appendChild(hint);
    var bars = camw.querySelectorAll('.lv b');
    var rounds = (ctx.targets || []).map(function (x) { return x.w; }).slice(0, CONF.leanRounds), i = 0, useCam = false, O = ctx.opt || {};
    function sayW(w, natural) { if (O.sayItem) return O.sayItem(w) || Promise.resolve(); return tts ? tts.word(w, natural ? { natural: true } : undefined) : Promise.resolve(); }
    return new Promise(function (resolve) {
      function round() {
        if (!u.alive()) return;
        if (i >= rounds.length) { if (useCam && cam.stop) cam.stop(); return setTimeout(function () { resolve({ completed: true }); }, 400); }
        var w = rounds[i], alt = (O.altFor && O.altFor(w)) || shuffle(W.filter(function (x) { return x !== w; }))[0], pair = shuffle([w, alt]);
        sides.innerHTML = '';
        var tiles = pair.map(function (p, k) { var t = h('button', 'tile', pic[p] + '<small>' + (k === 0 ? '← 왼쪽' : '오른쪽 →') + '</small>'); t.type = 'button'; t.setAttribute('data-w', p); sides.appendChild(t); return t; });
        var picked = false, tries = 0, viaCam = false;
        function judge(side, byCam) {
          if (picked) return; var k = side === 'left' ? 0 : 1, p = pair[k];
          if (byCam) viaCam = true;
          if (p === w) {
            picked = true; ctx.good(tries === 0); tiles[k].classList.add('ok'); tiles[1 - k].classList.add('dim');
            ctx.emit(E.act(w, 'move', viaCam ? 'cam' : 'touch', tries === 0, tries + 1));
            sayW(w, true); i++; setTimeout(round, 900);
          } else {
            ctx.oops(); tiles[k].classList.add('no'); tries++; setTimeout(function () { tiles[k].classList.remove('no'); }, 400); sayW(w);
            if (tries >= 2) { picked = true; tiles[1 - k].classList.add('ok'); tiles[k].classList.add('dim'); ctx.emit(E.act(w, 'move', viaCam ? 'cam' : 'touch', false, tries + 1)); i++; setTimeout(round, 1100); }
            else if (useCam) camPick();
          }
        }
        tiles.forEach(function (t, k) { t.onclick = function () { judge(k === 0 ? 'left' : 'right', false); }; });
        function camPick() {
          cam.pick({ onLevel: function (e) { if (bars[0]) bars[0].style.right = Math.max(0, 100 - e.l) + '%'; if (bars[1]) bars[1].style.right = Math.max(0, 100 - e.r) + '%'; } }).then(function (side) {
            if (picked || !u.alive()) return;
            if (side) judge(side, true); else { hint.textContent = '안 보이면 눌러도 돼요'; camPick(); }
          });
        }
        hint.textContent = useCam ? '잘 듣고 몸을 기울여!' : '잘 듣고 눌러!';
        g.PlayGame.soon(sayW(w)).then(function () { if (useCam && !picked) camPick(); });
      }
      var camOK = cam && cam.available && cam.available() && !(ctx.learner && ctx.learner.cam === false);
      (camOK ? cam.start(camw.querySelector('video')) : Promise.resolve(false)).then(function (ok) {
        useCam = !!ok;
        if (!ok) { camw.style.display = 'none'; hint.textContent = '카메라가 없어서 눌러서 골라요'; } else hint.textContent = '화면에 내 모습이 보이면 시작!';
        setTimeout(round, 600);
      });
    });
  }

  /* ── 접시 채우기 ── */
  function plates(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, tts = S.tts, u = setup(ctx, 'lg'), pic = u.pic;
    var W = (ctx.targets || []).map(function (x) { return x.w; });
    var box = h('div', 'plates'), tray = h('div', 'tray'), hint = h('div', 'hint', '그림을 끌어서 글자 위에 놓아요');
    u.root.appendChild(box); u.root.appendChild(tray); u.root.appendChild(hint);
    var left = W.length, clean = {};
    return new Promise(function (resolve) {
      shuffle(W).forEach(function (w) { var p = h('div', 'plate', w); p.setAttribute('data-w', w); box.appendChild(p); clean[w] = true; });
      shuffle(W).forEach(function (w) {
        var it = h('div', 'item', pic[w]); it.setAttribute('data-w', w); tray.appendChild(it);
        var ghost = null, hot = null;
        function move(ev) {
          if (!ghost) return; ghost.style.left = (ev.clientX - 30) + 'px'; ghost.style.top = (ev.clientY - 30) + 'px';
          var el = document.elementFromPoint(ev.clientX, ev.clientY), pl = el && el.closest ? el.closest('.plate') : null;
          if (hot && hot !== pl) hot.classList.remove('hot'); hot = pl && !pl.classList.contains('full') ? pl : null; if (hot) hot.classList.add('hot');
        }
        it.addEventListener('pointerdown', function (ev) {
          if (it.classList.contains('gone')) return;
          try { it.setPointerCapture(ev.pointerId); } catch (e) {}
          ghost = it.cloneNode(true); ghost.classList.add('drag'); document.body.appendChild(ghost); move(ev); if (tts) tts.word(w);
        });
        it.addEventListener('pointermove', move);
        function up() {
          if (!ghost) return; ghost.remove(); ghost = null;
          if (!hot) return; var pl = hot; hot.classList.remove('hot'); hot = null;
          if (pl.getAttribute('data-w') === w) {
            ctx.good(clean[w]); pl.classList.add('full'); pl.innerHTML = '<div class="got">' + pic[w] + '</div>' + w; it.classList.add('gone');
            ctx.emit(E.act(w, 'read', 'drag', clean[w])); if (tts) tts.word(w, { natural: true });
            left--; if (!left) setTimeout(function () { resolve({ completed: true }); }, 700);
          } else {
            clean[w] = false; ctx.oops(); pl.classList.add('no'); setTimeout(function () { pl.classList.remove('no'); }, 400); if (tts) tts.word(pl.getAttribute('data-w'));
          }
        }
        it.addEventListener('pointerup', up); it.addEventListener('pointercancel', up);
      });
      if (!left) resolve({ completed: true });
    });
  }

  /* ── 챈트 ── */
  function chant(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, tts = S.tts, speech = S.speech, u = setup(ctx, 'lg');
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; }, prime: function () {} };
    var lines = (ctx.zone && ctx.zone.chant) || [], line = lines[0] || [];
    var ch = h('div', 'chant'), btn = h('button', 'btn w', g.PlayIcon.html('play') + ' 한 번 더'), hint = h('div', 'hint', ''); btn.type = 'button'; btn.style.display = 'none';
    u.root.appendChild(ch); u.root.appendChild(btn); u.root.appendChild(hint);
    var spans = [];
    function build() { ch.innerHTML = ''; spans = []; lines.forEach(function (l) { var row = h('div', 'chant-row'); l.forEach(function (w) { var s = h('span', '', w); row.appendChild(s); spans.push({ s: s, w: w }); }); ch.appendChild(row); }); }
    function play() {
      build(); btn.style.display = 'none'; var chain = Promise.resolve();
      spans.forEach(function (o, k) { chain = chain.then(function () { o.s.classList.add('hit'); return g.PlayGame.soon(tts ? tts.word(o.w, { natural: true }) : null); }).then(function () { o.s.classList.remove('hit'); o.s.classList.add('done'); return wait(k % 3 === 2 ? 320 : 90); }); });
      return chain;
    }
    return new Promise(function (resolve) {
      /* heard = 들린 글(없으면 말로 못 한 것). 씨앗은 실제로 들린 낱말에만 */
      function end(heard) {
        line.forEach(function (w) { var said = !!heard && speech.matchWord(heard, w, []); ctx.emit(said ? E.say(w, { by: 'speech', tries: 0 }) : E.act(w, 'listen', 'touch', false)); });
        setTimeout(function () { resolve({ completed: true }); }, heard ? 1200 : 600);
      }
      play().then(play).then(function () {
        if (!u.alive()) return;
        btn.style.display = ''; btn.onclick = play;
        if (!mic.ok()) { hint.textContent = '다 외쳤어? 다음으로!'; var nx = h('button', 'btn g', '다음 →'); nx.type = 'button'; nx.onclick = function () { end(''); }; u.root.appendChild(nx); return; }
        hint.textContent = '이번엔 혼자! 한 줄을 크게 외쳐 봐';
        var m = h('button', 'mic', g.PlayIcon.html('mic')), heard = h('div', 'heard', ''); m.type = 'button'; u.root.appendChild(m); u.root.appendChild(heard);
        var tries = 0, busy = false;
        m.onclick = function () {
          if (busy) return; busy = true; m.classList.add('on'); heard.textContent = '듣고 있어요…';
          speech.tryOnce(line[0], { kind: 'word', others: [], timeout: CONF.chantTimeout }).then(function (r) {
            busy = false; m.classList.remove('on'); if (!u.alive()) return;
            var hit = 0; line.forEach(function (w) { if (speech.matchWord(r.heard, w, [])) hit++; });
            if (r.ok || hit >= 2) { mic.prime(); ctx.good(); heard.textContent = '좋아!'; if (S.fx) S.fx.confetti(); m.onclick = null; return end(r.heard || line.join(' ')); }
            tries++; heard.textContent = tries >= CONF.chantTries ? '좋아, 그만하면 됐어!' : '다시 크게!';
            if (tries >= CONF.chantTries) { m.onclick = null; end(''); }
          });
        };
      });
    });
  }

  g.PlayLegacy = { CONF: CONF, lean: lean, plates: plates, chant: chant };
  if (g.PlayGame) {
    g.PlayGame.register({ id: 'lean', no: 0, name: '몸으로 고르기', icon: 'body', channels: ['body'], axis: 'flow', need: { lv1: 5 }, cam: true,
      count: function (c) { return Math.min(CONF.leanRounds, (c.targets || []).length || CONF.leanRounds); },
      intro: { en: 'Listen! Lean left or right.', ko: '들어 봐 — 몸을 그쪽으로 기울여!' }, start: lean });
    g.PlayGame.register({ id: 'plates', no: 0, name: '접시 채우기', icon: 'plate', channels: ['read', 'hand'], axis: 'make', need: { lv1: 8 },
      count: function (c) { return (c.targets || []).length; },
      intro: { en: 'Put them on the right plate.', ko: '글자만 보고 맞는 자리에 올려!' }, start: plates });
    g.PlayGame.register({ id: 'chant', no: 20, name: '챈트', icon: 'note', channels: ['say', 'ear'], axis: 'body', need: { lv1: 5 },
      count: function (c) { return (((c.zone || {}).chant || [])[0] || []).length; },
      intro: { en: 'Sing with me!', ko: '같이 외쳐 봐!' }, start: chant });
  }
})(window);
