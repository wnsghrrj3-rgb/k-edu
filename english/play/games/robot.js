/* ============================================================
 * 영어 놀이터 — 거울 실험실 셋 (게임설계 v1 §4-9·24·25 · 귀·손 · 창작) — W08 변신 거울 무대(몸·얼굴 칸 lv2-15)
 *   #9  로봇 공장  : 몸 이름을 듣고(「Nose!」) 그 부품을 골라 붙인다 → 다 붙이면 로봇이 춤춘다.
 *   #25 크기 연구소: 「Big hand!」 — 큰 것·작은 것 중에서(꾸밈말 big·small = Lv1 #15).
 *   #24 색깔 실험실: 「Red hair!」 — 같은 부품을 여러 색으로 칠해 두고 그 색을(색 = Lv1 #13 red·blue + Lv2 #6 black — 몸 칸 #15 보다 앞에 배운 색만).
 *   ※ 설계 v0 의 「two hands」 는 복수 -s 가 Lv2 사다리 밖이라(펼침 29 판정) 수는 빼고 크기·색으로 — 몸 단어는 그대로.
 *   공통: 듣기 → 셋 중 고르기 · 다르면 그 카드만 흐려지고 천천히 다시 · 증거 = 듣기(listen·touch) · 씨앗과는 무관
 *   PlayLab.plan(kind, words, o) — 화면 없는 판 짜기(검사는 여기를 직접 본다)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { rounds: 6, options: 3, nextMs: 500, sizes: ['big', 'small'], colors: ['red', 'blue', 'black'] };
  var TINT = { red: 'var(--word-red)', blue: 'var(--word-blue)', black: 'var(--ink)' };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 판 — { say, answer, options:[{ key, part, attr }] } */
  function plan(kind, words, o) {
    o = o || {};
    var parts = words.filter(function (x) { return !g.PlayArt || g.PlayArt.has(x); }), out = [], n = Math.min(o.rounds || CONF.rounds, parts.length * (kind === 'robot' ? 1 : 2));
    var list = shuffle(parts);
    for (var i = 0; i < n; i++) {
      var p = list[i % list.length], others = shuffle(parts.filter(function (x) { return x !== p; }));
      if (kind === 'robot') { out.push({ say: p, answer: p, options: shuffle([p].concat(others.slice(0, CONF.options - 1))).map(function (x) { return { key: x, part: x }; }) }); continue; }
      var attrs = kind === 'size' ? CONF.sizes : CONF.colors, a = attrs[i % attrs.length], b = shuffle(attrs.filter(function (x) { return x !== a; }))[0];
      var opts = [{ key: a + ' ' + p, part: p, attr: a }, { key: b + ' ' + p, part: p, attr: b }, { key: a + ' ' + others[0], part: others[0], attr: a }];   /* 꾸밈말만 다른 것 + 이름만 다른 것 */
      out.push({ say: a + ' ' + p, answer: a + ' ' + p, options: shuffle(opts) });
    }
    return out;
  }
  function cardHtml(kind, op) {
    var A = g.PlayArt, art = A.html(op.part);
    if (kind === 'size') return '<span class="lb-sz ' + op.attr + '">' + art + '</span>';
    if (kind === 'color') return '<span class="lb-col" style="--art-main:' + TINT[op.attr] + '">' + art + '</span>';
    return art;
  }

  function lab(kind) {
    return function (ctx) {
      var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, A = g.PlayArt, tts = S.tts, audio = S.audio || { play: function () {} };
      var parts = ((Z.lab && Z.lab.parts) || (Z.words || []).map(function (x) { return x.w; }));
      var rounds = plan(kind, parts);
      var host = ctx.host; host.innerHTML = '';
      var root = h('div', 'lb lb-' + kind), dots = h('div', 'dots'), stage = h('div', 'lb-stage'), cards = h('div', 'lb-cards'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
      stage.innerHTML = kind === 'robot' ? '<div class="lb-robot">' + A.html('robot-body') + '<div class="lb-parts"></div></div>' : '<div class="lb-glass">' + A.html('face') + '</div>';
      root.appendChild(dots); root.appendChild(stage); root.appendChild(cards); root.appendChild(rep); host.appendChild(root);
      var i = 0, cur = null;
      function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
      function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
      function say(s, slow) { return g.PlayGame.soon(tts ? tts.word(s, slow ? { rate: 0.6 } : undefined) : null); }
      rep.onclick = function () { if (cur) say(cur.say); };
      return new Promise(function (resolve) {
        function round() {
          dots.innerHTML = rounds.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
          if (i >= rounds.length) { stage.classList.add('done'); audio.play('done'); return later(CONF.nextMs * 2, function () { resolve({ completed: true }); }); }
          var r = rounds[i], tries = 1, clean = true, over = false; cur = r; cards.innerHTML = '';
          r.options.forEach(function (op) {
            var b = h('button', 'lb-card', cardHtml(kind, op)); b.type = 'button'; b.setAttribute('data-k', op.key);
            b.onclick = function () {
              if (over || b.disabled) return;
              if (op.key !== r.answer) { clean = false; tries++; b.disabled = true; b.classList.add('dim'); ctx.oops(); return say(r.say, true); }
              over = true; b.classList.add('ok'); ctx.good(clean, { at: b }); ctx.emit(E.act(r.answer, 'listen', 'touch', clean, tries));
              if (kind === 'robot') stage.querySelector('.lb-parts').insertAdjacentHTML('beforeend', '<span class="lb-part" data-k="' + op.part + '">' + A.html(op.part) + '</span>');
              else { var gl = stage.querySelector('.lb-glass'); gl.innerHTML = cardHtml(kind, op); gl.classList.remove('pop'); void gl.offsetWidth; gl.classList.add('pop'); }
              i++; later(CONF.nextMs, round);
            };
            cards.appendChild(b);
          });
          say(r.say);
        }
        g.PlayGame.soon(ctx.intro, null).then(function () { if (alive()) round(); });
      });
    };
  }

  g.PlayLab = { CONF: CONF, plan: plan };
  g.PlayRobot = { CONF: CONF, plan: function (zone, n) { return plan('robot', ((zone && zone.words) || []).map(function (x) { return x.w; }), { rounds: n }); } };
  if (g.PlayGame) {
    var body = function (zone) { return zone.kind === 'body' && (zone.words || []).filter(function (x) { return g.PlayArt && g.PlayArt.has(x.w); }).length >= CONF.options; };
    g.PlayGame.register({ id: 'robot', no: 9, name: '로봇 공장', icon: 'robot', channels: ['hand', 'ear'], axis: 'make', need: { lv1: 15, lv2: 15 },
      fits: body, count: function () { return CONF.rounds; }, intro: { en: 'Nose!', ko: '들은 부품을 골라 로봇에 붙여 줘!' }, start: lab('robot') });
    g.PlayGame.register({ id: 'size-lab', no: 25, name: '크기 연구소', icon: 'magnet', channels: ['ear', 'hand'], axis: 'laugh', need: { lv1: 15, lv2: 15 },
      fits: body, count: function () { return CONF.rounds; }, intro: { en: 'Big? Small?', ko: '크게? 작게? 들은 대로 골라 줘!' }, start: lab('size') });
    g.PlayGame.register({ id: 'color-lab', no: 24, name: '색깔 실험실', icon: 'bulb', channels: ['make', 'ear'], axis: 'find', need: { lv1: 13, lv2: 6 },
      fits: body, count: function () { return CONF.rounds; }, intro: { en: 'Red? Blue?', ko: '들은 색으로 칠한 것을 골라 줘!' }, start: lab('color') });
  }
})(window);
