/* src/g2m_u5_classify.js — 기준을 정해 분류하기 (2학년 수학 5단원)
 * 장르: sort(무대형) — 1학년 모양 분류와 같은 엔진 구조를 활동 안에서 재사용.
 * 이 단원의 핵심은 "무엇으로 나눌지"다. 같은 물건이 색으로도, 모양으로도, 크기로도 나뉜다.
 * 그래서 판마다 기준이 바뀌고, 바구니 이름도 함께 바뀐다.
 */
(function () {
  'use strict';

  function svgOf(it) {
    var c = it.color.hex;
    var s = it.size.k === 'big' ? 34 : 22;
    var inner;
    if (it.shape.k === 'circle') inner = '<circle cx="24" cy="24" r="' + (s / 2) + '" fill="' + c + '"/>';
    else if (it.shape.k === 'square') inner = '<rect x="' + (24 - s / 2) + '" y="' + (24 - s / 2) + '" width="' + s + '" height="' + s + '" rx="3" fill="' + c + '"/>';
    else {
      var h = s * 0.92;
      inner = '<polygon points="24,' + (24 - h / 2) + ' ' + (24 + s / 2) + ',' + (24 + h / 2) + ' ' + (24 - s / 2) + ',' + (24 + h / 2) + '" fill="' + c + '"/>';
    }
    return '<svg viewBox="0 0 48 48" width="44" height="44">' + inner + '</svg>';
  }

  ACore.create({
    activityId: 'g2m_u5_classify',
    title: '🗂️ 기준을 정해 분류하기',
    subtitle: '같은 물건도 기준이 바뀌면 다른 칸으로!',
    defaults: { by: 'mix', per: 6, n: 3 },
    settings: [
      { key: 'by', label: '분류 기준', options: [
        { v: 'color', label: '색깔' }, { v: 'shape', label: '모양' },
        { v: 'size', label: '크기' }, { v: 'mix', label: '판마다 다르게' }] },
      { key: 'per', label: '한 판 물건 수', options: [{ v: 4, label: '4개' }, { v: 6, label: '6개' }, { v: 9, label: '9개' }] },
      { key: 'n', label: '판 수', options: [{ v: 2, label: '2' }, { v: 3, label: '3' }, { v: 5, label: '5' }] }
    ],
    stageHtml:
      '<div id="cy">' +
        '<div id="rule"></div>' +
        '<div id="pool"></div>' +
        '<div id="baskets"></div>' +
      '</div>',
    onStart: function (app) {
      var G = GENS['classify'];
      var gen = G.create({ by: app.settings.by, per: app.settings.per }, app.rng);
      var N = app.settings.n, i = 0, S = null;

      function render() {
        app.el('#rule').textContent = '📏 ' + S.round.prompt;
        app.el('#pool').innerHTML = S.round.items.map(function (it, k) {
          return '<button class="item" data-k="' + k + '">' + svgOf(it) + '</button>';
        }).join('');
        app.el('#baskets').innerHTML = S.round.bins.map(function (b) {
          return '<button class="basket" data-b="' + b.k + '"><div class="bn">' + b.ko + '</div><div class="cnt num">0</div></button>';
        }).join('');
        app.els('#pool .item').forEach(function (b) {
          b.addEventListener('click', function () {
            if (S.done) return;
            app.els('#pool .item').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on');
            S.sel = +b.dataset.k;
            app.sfx.tick();
          });
        });
        app.els('#baskets .basket').forEach(function (bk) {
          bk.addEventListener('click', function () { drop(bk); });
        });
      }

      function drop(bk) {
        if (!S || S.done) return;
        if (S.sel == null) { app.explain('먼저 담을 물건을 골라요!', false); return; }
        var it = S.round.items[S.sel];
        var want = gen.binOf(it, S.round.by);
        var el = app.el('#pool .item[data-k="' + S.sel + '"]');
        if (bk.dataset.b === want) {
          if (S.firstTry[S.sel] !== false) app.tally(S.round.type, true);
          app.sfx.good();
          el.classList.add('gone');
          bk.querySelector('.cnt').textContent = (+bk.querySelector('.cnt').textContent + 1);
          S.left--; S.sel = null;
          app.clearExplain();
          if (S.left === 0) endRound();
        } else {
          S.firstTry[S.sel] = false;
          S.miss++;
          app.tally(S.round.type, false);
          app.sfx.bad();
          app.shake(bk);
          var binKo = S.round.bins.filter(function (b) { return b.k === want; })[0].ko;
          app.explain('이건 ' + S.round.byKo + '(으)로 보면 「' + binKo + '」이에요', false);
          if (app.mode === 'class' && S.miss % 2 === 0) {
            S.turn = 1 - S.turn;
            app.explain(app.teams[S.turn].name + ' 차례로 넘어갑니다!', false);
          }
        }
      }

      function endRound() {
        S.done = true;
        app.markJudged();
        var clean = S.firstTry.every(function (v) { return v !== false; });
        if (clean && app.mode !== 'class') app.addScore(1);
        if (app.mode === 'class') app.teamScore(S.turn, 1);
        app.sfx.win();
        app.explain('다 나눴어요! ' + (clean ? '한 번에 성공! 🎉' : '잘했어요 👏'), true);
        setTimeout(next, app.mode === 'class' ? 2000 : 1500);
      }

      function next() {
        if (i >= N) return app.finish({});
        var round = gen.deal();
        S = { round: round, left: round.items.length, sel: null, done: false,
              firstTry: round.items.map(function () { return true; }), miss: 0, turn: (i % 2) };
        i++;
        app.setProg(i, N);
        app.clearExplain();
        app.hideAnswers();
        render();
        if (app.mode === 'class') app.explain(app.teams[S.turn].name + ' 차례예요!', true);
      }

      app.onSkip(function () { if (S && !S.done) next(); });
      next();
    }
  });
})();
