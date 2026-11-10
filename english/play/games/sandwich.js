/* ============================================================
 * 영어 놀이터 — 놀이 #5 「샌드위치 탑」 (게임설계 v1 §4-5 · 손·귀 · 웃음·창작)
 *   Sam 이 재료를 차례로 부른다(「ham … jam … fish」) → 들은 차례대로 재료를 눌러 빵 위에 쌓는다 → 쌓일수록 탑이 흔들흔들 → 다 쌓으면 손님이 한입.
 *   판이 갈수록 재료가 하나씩 늘어난다(둘 → 셋 → 넷). 재료는 그 구역의 먹을 것(zone.foods).
 *   실패 지원: 차례가 아닌 것을 누르면 탑만 휘청하고, 차례를 그림으로 한 줄 보여 주며 다시 불러 준다. 실패로 끝나는 길 없음.
 *   공통 인터페이스: start(ctx) — 증거 = 듣기(listen · touch). 대상은 쌓은 재료 단어
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    sizes: [2, 3, 3],    /* 판마다 쌓는 재료 수 */
    callGap: 350,        /* 재료를 하나씩 부르는 사이(ms) */
    biteMs: 1200,        /* 한입 장면 */
    nextMs: 400
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 판마다의 주문 — 한 판 안에서는 재료가 겹치지 않게 */
  function plan(foods, sizes) {
    foods = foods || []; sizes = sizes || CONF.sizes;
    return sizes.map(function (n) { return shuffle(foods).slice(0, Math.min(n, foods.length)); }).filter(function (o) { return o.length >= 2; });
  }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, tts = S.tts, npc = S.npc || g.PlayNpc;
    var foods = (Z.foods || []).slice(), orders = (ctx.opt && ctx.opt.orders) || g.PlaySandwich.plan(foods), pic = {};
    (ctx.pool || ctx.targets || []).forEach(function (x) { pic[x.w] = x.pic; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sd'), dots = h('div', 'dots'), top = h('div', 'sd-top', '<div class="sd-guest"></div><div class="sd-tower"><div class="sd-stack"></div><div class="sd-bread">' + g.PlayArt.html('bread') + '</div></div>');
    var hint = h('div', 'sd-hint'), tray = h('div', 'sd-tray'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(dots); root.appendChild(top); root.appendChild(hint); root.appendChild(tray); root.appendChild(rep); host.appendChild(root);
    var guest = top.querySelector('.sd-guest'), tower = top.querySelector('.sd-tower'), stack = top.querySelector('.sd-stack');
    if (npc) npc.render(guest, 'mina', { face: 'idle' });
    var i = 0, cur = null, calling = false;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    /* 재료를 하나씩 차례로 부른다 */
    function call(o, slow) {
      calling = true;
      var p = Promise.resolve();
      o.forEach(function (w) { p = p.then(function () { return G.soon(tts ? tts.word(w, slow ? { rate: 0.5 } : undefined) : null); }).then(function () { return new Promise(function (r) { setTimeout(r, CONF.callGap); }); }); });
      return p.then(function () { calling = false; });
    }
    rep.onclick = function () { if (cur && !calling) call(cur); };

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = orders.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= orders.length) return resolve({ completed: true });
        var o = orders[i], at = 0, clean = true, tries = 1, done = false;
        cur = o; stack.innerHTML = ''; hint.innerHTML = ''; tray.innerHTML = ''; tower.className = 'sd-tower'; tower.setAttribute('data-h', '0');
        if (npc) npc.react(guest, 'wait');
        shuffle(foods).forEach(function (w) {
          var b = h('button', 'tile sd-food', pic[w]); b.type = 'button'; b.setAttribute('data-w', w);
          b.onclick = function () {
            if (done || b.disabled) return;
            if (w !== o[at]) {
              clean = false; tries++; b.classList.add('no'); ctx.oops(); tower.classList.add('whoa');
              later(450, function () { b.classList.remove('no'); tower.classList.remove('whoa'); });
              /* 차례를 그림으로 보여 주고(쌓은 것은 진하게) 천천히 다시 부른다 */
              hint.innerHTML = o.map(function (x, k) { return '<span class="' + (k < at ? 'ok' : '') + '">' + pic[x] + '</span>'; }).join('<i>→</i>');
              if (!calling) call(o.slice(at), true);
              return;
            }
            b.disabled = true; b.classList.add('dim');
            stack.insertBefore(h('div', 'sd-layer', pic[w]), stack.firstChild);
            at++; tower.setAttribute('data-h', String(at));
            if (S.audio) S.audio.play('pop');
            if (tts) tts.word(w, { natural: true });
            if (at < o.length) return;
            /* 다 쌓았다 — 뚜껑 빵, 흔들흔들, 한입 */
            done = true; stack.insertBefore(h('div', 'sd-layer lid', g.PlayArt.html('bread')), stack.firstChild); tower.classList.add('wobble');
            ctx.good(clean, { at: guest });
            o.forEach(function (x) { ctx.emit(E.act(x, 'listen', 'touch', clean, tries)); });
            if (npc) npc.react(guest, 'cheer', { stay: true });
            later(CONF.biteMs, function () { tower.classList.add('bite'); i++; later(CONF.nextMs + 300, round); });
          };
          tray.appendChild(b);
        });
        call(o);
      }
      G.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlaySandwich = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sandwich', no: 5, name: '샌드위치 탑', icon: 'sandwich', channels: ['hand', 'ear'], axis: 'laugh', need: { lv2: 2 },
    fits: function (zone) { return (zone.foods || []).length >= 3; },
    count: function (c) { return g.PlaySandwich.plan((c.zone || {}).foods).reduce(function (n, o) { return n + o.length; }, 0); },
    intro: { en: 'Listen! One, two!', ko: '부르는 차례대로 재료를 쌓아 줘 — 탑이 흔들려도 괜찮아!' },
    start: start
  });
})(window);
