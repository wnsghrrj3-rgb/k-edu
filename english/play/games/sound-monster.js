/* ============================================================
 * 영어 놀이터 — 놀이 #13 「소리 몬스터」 (게임설계 v1 §4-13 · 소리·귀)
 *   소리를 들려주면 → 그 소리 글자를 달고 있는 몬스터를 찾는다(몬스터 셋). 찾으면 몬스터가 좋아하며 부푼다.
 *   소리는 그 칸에서 새로 배운 것(글자 둘 한 소리·자음 묶음·매직 e) — 보기는 같은 종류에서, 소리가 같은 짝(ai·ay)은 함께 내지 않는다.
 *   실패 지원: 다른 몬스터를 누르면 그 몬스터만 흔들리고, 소리를 닻 단어와 함께 다시 들려준다. 실패로 끝나는 길 없음.
 *   공통 인터페이스: start(ctx) — ctx.zone.id 의 재료(PlayPhonics). 증거 = 듣기(listen) · 대상은 소리(sh·a_e…) — 씨앗과는 무관
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    rounds: 6,
    options: 3,        /* 몬스터 수 */
    nextMs: 900,
    faces: ['monster', 'monster2', 'monster3']     /* 그린 그림(content/art/art.js) */
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 한 판씩의 목표 소리 — 새로 배운 것을 고루, 모자라면 되풀이 */
  function plan(cellId, n) {
    var P = g.PlayPhonics, u = P.units(cellId), out = [];
    if (!u.length) return out;
    while (out.length < n) out = out.concat(shuffle(u));
    return out.slice(0, n);
  }

  function start(ctx) {
    var S = ctx.services || {}, P = g.PlayPhonics, E = g.PlayEvidence, tts = S.tts, cellId = (ctx.zone && ctx.zone.id) || ctx.cell;
    var targets = (ctx.opt && ctx.opt.units) || plan(cellId, CONF.rounds);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sm'), dots = h('div', 'dots'), field = h('div', 'sm-field'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(dots); root.appendChild(field); root.appendChild(rep); host.appendChild(root);
    var i = 0, cur = null;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function sound(u, anchor) { return g.PlayGame.soon(P.say(tts, u, anchor ? { anchor: true } : undefined)); }
    rep.onclick = function () { if (cur) sound(cur); };

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = targets.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= targets.length) return resolve({ completed: true });
        var u = targets[i], opts = shuffle([u].concat(P.distract(u, cellId, CONF.options - 1))), clean = true, tries = 1, done = false;
        cur = u; field.innerHTML = '';
        var faces = shuffle(CONF.faces);
        opts.forEach(function (k, n) {
          var b = h('button', 'sm-mon', '<span class="sm-face">' + g.PlayArt.html(faces[n % faces.length]) + '</span>' + P.chip(k)); b.type = 'button'; b.setAttribute('data-u', k);
          b.onclick = function () {
            if (done || b.disabled) return;
            if (k !== u) { clean = false; tries++; b.classList.add('no'); b.disabled = true; ctx.oops(); later(380, function () { b.classList.remove('no'); b.classList.add('dim'); }); return sound(u, true); }
            done = true; b.classList.add('ok'); if (S.fx) S.fx.puff(b.firstChild);
            ctx.good(clean); ctx.emit(E.act(u, 'listen', 'touch', clean, tries));
            i++; later(CONF.nextMs, round);
          };
          field.appendChild(b);
        });
        sound(u);
      }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlaySoundMonster = { CONF: CONF, plan: plan, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sound-monster', no: 13, name: '소리 몬스터', icon: 'monster', channels: ['ear', 'sound'], axis: 'find', need: { lv1: 3 },
    count: function () { return CONF.rounds; },
    intro: { en: 'Listen!', ko: '들린 소리를 달고 있는 몬스터를 찾아 줘!' },
    start: start
  });
})(window);
