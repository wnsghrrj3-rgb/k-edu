/* src/g1m_u2_sort.js — 모양 상자에 담기 (1학년 수학 2단원)
 * 장르: sort — 무대형(자체 루프). 물건을 탭해 세 바구니 중 하나에 담는다.
 * "고르는 것"이 아니라 "나누는 것" — 분류는 손으로 해야 몸에 남는다.
 * class는 팀 교대(홀수 A·짝수 B): 한 판을 끝낸 팀이 득점.
 */
(function () {
  'use strict';
  var KO = { box: '상자 모양', cylinder: '둥근기둥 모양', ball: '공 모양' };
  var ICON = { box: '📦', cylinder: '🥫', ball: '⚽' };

  ACore.create({
    activityId: 'g1m_u2_sort',
    title: '🧺 모양 상자에 담기',
    subtitle: '물건을 골라 알맞은 바구니에 담아요',
    defaults: { per: 6, n: 3 },
    settings: [
      { key: 'per', label: '한 판 물건 수', options: [{ v: 4, label: '4개' }, { v: 6, label: '6개' }, { v: 9, label: '9개' }] },
      { key: 'n', label: '판 수', options: [{ v: 2, label: '2' }, { v: 3, label: '3' }, { v: 5, label: '5' }] }
    ],
    stageHtml:
      '<div id="sortyard">' +
        '<div id="pool"></div>' +
        '<div id="baskets">' +
          '<button class="basket" data-s="box"><div class="bi">📦</div><div class="bn">상자 모양</div><div class="cnt num">0</div></button>' +
          '<button class="basket" data-s="cylinder"><div class="bi">🥫</div><div class="bn">둥근기둥 모양</div><div class="cnt num">0</div></button>' +
          '<button class="basket" data-s="ball"><div class="bi">⚽</div><div class="bn">공 모양</div><div class="cnt num">0</div></button>' +
        '</div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['shape3d'].create({ per: app.settings.per }, app.rng);
      var N = app.settings.n, i = 0, S = null;

      function render() {
        app.el('#pool').innerHTML = S.items.map(function (t, k) {
          return '<button class="item" data-k="' + k + '"><span class="ii">' + t.i + '</span><span class="in">' + t.n + '</span></button>';
        }).join('');
        app.els('#pool .item').forEach(function (b) {
          b.addEventListener('click', function () { select(b); });
        });
        app.els('#baskets .cnt').forEach(function (c) { c.textContent = '0'; });
        app.el('#hint2') && app.el('#hint2').remove();
      }
      function select(b) {
        if (S.done) return;
        app.els('#pool .item').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        S.sel = +b.dataset.k;
        app.sfx.tick();
      }

      app.els('#baskets .basket').forEach(function (bk) {
        bk.addEventListener('click', function () {
          if (!S || S.done || S.sel == null) {
            if (S && !S.done) app.explain('먼저 담을 물건을 골라요!', false);
            return;
          }
          var t = S.items[S.sel];
          var want = bk.dataset.s;
          var el = app.el('#pool .item[data-k="' + S.sel + '"]');
          if (t.s === want) {
            if (S.firstTry[S.sel] !== false) app.tally(t.t ? 'tricky' : t.s, true);
            app.sfx.good();
            el.classList.add('gone');
            bk.querySelector('.cnt').textContent = (+bk.querySelector('.cnt').textContent + 1);
            S.left--; S.sel = null;
            app.clearExplain();
            if (S.left === 0) finishRound();
          } else {
            S.firstTry[S.sel] = false;
            S.miss++;
            app.tally(t.t ? 'tricky' : t.s, false);
            app.sfx.bad();
            app.shake(bk);
            app.explain(t.n + '은(는) ' + KO[t.s] + '이에요' + (t.t ? ' — 겉모습에 속지 말아요!' : ''), false);
            if (app.mode === 'class' && S.miss % 2 === 0) {  // 오답 2회 → 팀 교대
              S.turn = 1 - S.turn;
              app.explain(app.teams[S.turn].name + ' 차례로 넘어갑니다!', false);
            }
          }
        });
      });

      function finishRound() {
        S.done = true;
        app.markJudged();                                   // §6-8 판 단위 분모
        var clean = S.firstTry.every(function (v) { return v !== false; });
        if (clean && app.mode !== 'class') app.addScore(1);
        if (app.mode === 'class') app.teamScore(S.turn, 1);
        app.sfx.win();
        app.explain('모두 담았어요! ' + (clean ? '한 번에 성공! 🎉' : '잘했어요 👏'), true);
        setTimeout(next, app.mode === 'class' ? 2000 : 1500);
      }

      function next() {
        if (i >= N) return app.finish({});
        var items = gen.deal();
        S = { items: items, left: items.length, sel: null, done: false,
              firstTry: items.map(function () { return true; }), miss: 0, turn: (i % 2) };
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
