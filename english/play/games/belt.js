/* ============================================================
 * 영어 놀이터 — 놀이 #18 「배달 벨트」 (게임설계 v1 §4-18 · 읽기 채널)
 *   글자만 적힌 주문표가 벨트를 타고 흘러간다 → 맞는 음식을 주문표 위에 올린다(끌어다 놓기, 또는 음식을 누르고 주문표를 누르기).
 *   지나가 버린 주문표는 한 바퀴 돌아 다시 온다. 다른 음식을 올리면 벨트가 잠깐 멈추고 그 글자를 읽어 준다(조금 느려진다).
 *   실패로 끝나는 길 없음 — 숫자 시계 없음.
 *   공통 인터페이스: start(ctx) — 증거 = 읽기(read) · drag|touch
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    tickets: 6,          /* 주문표 수 */
    loop: 16000,         /* 주문표가 한 바퀴 도는 시간(ms) ← 벨트 속도 */
    loopMax: 26000,      /* 아무리 느려져도 */
    slower: 1.15,        /* 다른 음식을 올리면 한 바퀴 시간 × */
    pauseMs: 1600,       /* 그때 벨트가 멈춰 있는 시간 */
    doneMs: 700          /* 채운 주문표가 실려 나가는 시간 */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function start(ctx) {
    var S = ctx.services || {}, E = g.PlayEvidence, scene = S.scene || g.PlayScene, audio = S.audio || { play: function () {} };
    var items = (ctx.targets || []).slice(0, CONF.tickets), pic = {}; items.forEach(function (x) { pic[x.w] = x.pic; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'bt'); host.appendChild(root);
    var belt = scene.belt(root, { loop: CONF.loop });
    var foods = h('div', 'bl-foods'), hint = h('div', 'hint', '음식을 끌어서 글자 위에 올려요');
    root.appendChild(foods); root.appendChild(hint);
    var left = items.length, clean = {}, sel = null, done;
    items.forEach(function (x) { clean[x.w] = true; });
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }

    /* 음식 w 를 주문표 t 에 올린다 */
    function put(w, t, mode) {
      if (!t || t.classList.contains('full')) return false;
      var want = t.getAttribute('data-w'), food = foods.querySelector('.bl-food[data-w="' + w + '"]');
      if (want === w) {
        t.classList.add('full'); t.innerHTML = '<span class="got">' + pic[w] + '</span>' + w;
        if (food) food.classList.add('gone');
        ctx.good(clean[w]); ctx.emit(E.act(w, 'read', mode, clean[w]));
        if (S.tts) S.tts.word(w, { natural: true });
        left--;
        later(CONF.doneMs, function () { t.classList.add('out'); });
        if (!left) later(CONF.doneMs + 300, function () { done({ completed: true }); });
        return true;
      }
      clean[w] = false; clean[want] = false;
      t.classList.add('no'); later(400, function () { t.classList.remove('no'); });
      ctx.oops();
      belt.pause(CONF.pauseMs); belt.speed(Math.min(CONF.loopMax, Math.round(belt.loop * CONF.slower)));
      ctx.say(want);                                    /* 그 주문표의 글자를 읽어 준다 */
      return false;
    }
    function pick(food) { if (sel) sel.classList.remove('sel'); sel = food; if (sel) sel.classList.add('sel'); }

    items.forEach(function (x, i) {
      var t = belt.add(g.PlayWrite ? g.PlayWrite.face(x.w, x.w) : x.w, x.w, i, items.length);      /* 내가 쓴 낱말의 주문표는 내 글씨로(W14) */
      t.onclick = function () { if (sel && !sel.classList.contains('gone')) { var w = sel.getAttribute('data-w'); pick(null); put(w, t, 'touch'); } else ctx.say(x.w); };
    });
    shuffle(items).forEach(function (x) {
      var f = h('button', 'bl-food', pic[x.w]); f.type = 'button'; f.setAttribute('data-w', x.w); foods.appendChild(f);
      var ghost = null, hot = null, moved = false, sx = 0, sy = 0;
      f.onclick = function () { if (f.classList.contains('gone') || moved) { moved = false; return; } pick(sel === f ? null : f); if (S.tts) S.tts.word(x.w); };
      f.addEventListener('pointerdown', function (ev) {
        if (f.classList.contains('gone')) return;
        try { f.setPointerCapture(ev.pointerId); } catch (e) {}
        sx = ev.clientX; sy = ev.clientY; moved = false;
        ghost = f.cloneNode(true); ghost.classList.add('drag'); ghost.style.display = 'none'; document.body.appendChild(ghost);
      });
      f.addEventListener('pointermove', function (ev) {
        if (!ghost) return;
        if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 8) return;
        moved = true; ghost.style.display = ''; ghost.style.left = (ev.clientX - 32) + 'px'; ghost.style.top = (ev.clientY - 32) + 'px';
        var el = document.elementFromPoint(ev.clientX, ev.clientY), t = el && el.closest ? el.closest('.bl-ticket') : null;
        if (hot && hot !== t) hot.classList.remove('hot'); hot = t && !t.classList.contains('full') ? t : null; if (hot) hot.classList.add('hot');
      });
      function up() {
        if (!ghost) return; ghost.remove(); ghost = null;
        if (hot) { var t = hot; hot.classList.remove('hot'); hot = null; pick(null); put(x.w, t, 'drag'); }
      }
      f.addEventListener('pointerup', up); f.addEventListener('pointercancel', up);
    });
    audio.play('belt');
    var finished = new Promise(function (r) { done = r; });
    if (!left) done({ completed: true });
    return finished;
  }

  g.PlayBelt = { CONF: CONF, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'belt', no: 18, name: '배달 벨트', icon: 'box', channels: ['read', 'hand'], axis: 'flow', need: { lv1: 8 },
    count: function (c) { return Math.min(CONF.tickets, (c.targets || []).length || CONF.tickets); },
    intro: { en: 'Read and put!', ko: '글자만 보고 맞는 음식을 올려 줘!' },
    intro1: { en: 'Oh!', ko: '이름표를 읽고 맞는 그림을 올려 줘!' },     /* Lv1 무대에서 — 그때까지 배운 낱말·감탄만(W06) */
    start: start
  });
})(window);
