/* src/g6m2_u4_ratio_sort.js — 비율이 같은 비끼리 (6학년 2학기 수학 4단원 「비례식과 비례배분」) — 교과서판 2학기 대표 활동
 * 장르: sort(무대형) · 생성기: g6_2_ratio_sort
 * 원형: g4m2_u6_move_sort(도형 나누기 마당 → 이동 카드). 엔진 구조를 그대로 물려받고 카드만 비 글자로 갈아낀다.
 *
 * 카드 = 교과서·『수학익힘』·지도서의 비와 비례식(생성기 표 · 줄마다 쪽). 들어갈 바구니는 생성기가 분수 셈으로 정한다.
 *  · 비율이 같은 비 판(same) · 간단한 자연수의 비 판(simple): 바구니 = 가장 간단한 자연수의 비 셋
 *  · 비례식 판(prop): 바구니 = 「비례식이에요」·「비례식이 아니에요」 — 틀리면 외항의 곱·내항의 곱을 셈해 보여 줌
 */
(function () {
  'use strict';

  
  ACore.create({
    activityId: 'g6m2_u4_ratio_sort',
    title: '⚖️ 비율이 같은 비끼리',
    subtitle: '비 카드를 비율이 같은 바구니로 나눠요',
    defaults: { by: 'mix', per: 6, n: 3 },
    settings: [
      { key: 'by', label: '무엇으로', options: [
        { v: 'same', label: '2차시 — 비율이 같은 비' }, { v: 'simple', label: '3차시 — 간단한 자연수의 비' },
        { v: 'prop', label: '4·5차시 — 비례식일까' }, { v: 'mix', label: '판마다 다르게' }] },
      { key: 'per', label: '한 판 카드 수', options: [{ v: 4, label: '4장' }, { v: 6, label: '6장' }] },
      { key: 'n', label: '판 수', options: [{ v: 2, label: '2' }, { v: 3, label: '3' }, { v: 6, label: '6' }] }
    ],
    stageHtml:
      '<div id="ms">' +
        '<div id="rule"></div>' +
        '<div id="hint"></div>' +
        '<div id="pool"></div>' +
        '<div id="baskets"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g6_2_ratio_sort'].create({ by: app.settings.by, per: app.settings.per }, app.rng);
      var N = app.settings.n, i = 0, S = null;

      function render() {
        app.el('#rule').textContent = '⚖️ ' + S.round.prompt;
        app.el('#hint').innerHTML = (S.round.hint || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        app.el('#pool').innerHTML = S.round.items.map(function (it, k) {
          return '<button class="item" data-k="' + k + '" title="' + it.src + '"><span class="rs-t">' + it.text + '</span></button>';
        }).join('');
        app.el('#baskets').innerHTML = S.round.bins.map(function (b) {
          return '<button class="basket" data-b="' + b.k + '"><div class="bn">' + b.ko + '</div><div class="cnt num">0</div></button>';
        }).join('');
        app.els('#pool .item').forEach(function (b) {
          b.addEventListener('click', function () {
            if (S.done) return;
            app.els('#pool .item').forEach(function (x) { x.classList.remove('on'); });
            b.classList.add('on'); S.sel = +b.dataset.k; app.sfx.tick();
          });
        });
        app.els('#baskets .basket').forEach(function (bk) { bk.addEventListener('click', function () { drop(bk); }); });
      }

      function drop(bk) {
        if (!S || S.done) return;
        if (S.sel == null) { app.explain('먼저 담을 카드를 골라요!', false); return; }
        var it = S.round.items[S.sel], want = gen.binOf(it, S.round.by);
        var el = app.el('#pool .item[data-k="' + S.sel + '"]');
        if (bk.dataset.b === want) {
          if (S.firstTry[S.sel] !== false) app.tally(S.round.type, true);
          app.sfx.good(); el.classList.add('gone');
          bk.querySelector('.cnt').textContent = (+bk.querySelector('.cnt').textContent + 1);
          S.left--; S.sel = null; app.clearExplain();
          if (S.left === 0) endRound();
        } else {
          S.firstTry[S.sel] = false; S.miss++;
          app.tally(S.round.type, false); app.sfx.bad(); app.shake(bk);
          var wantKo = S.round.bins.filter(function (b) { return b.k === want; })[0].ko;
          app.explain(gen.reasonOf(it, S.round.by, wantKo).replace(/\*\*/g, ''), false);
          if (app.mode === 'class' && S.miss % 2 === 0) { S.turn = 1 - S.turn; app.explain(app.teams[S.turn].name + ' 차례로 넘어갑니다!', false); }
        }
      }

      function endRound() {
        S.done = true; app.markJudged();
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
        S = { round: round, left: round.items.length, sel: null, done: false, firstTry: round.items.map(function () { return true; }), miss: 0, turn: (i % 2) };
        i++; app.setProg(i, N); app.clearExplain(); app.hideAnswers(); render();
        if (app.mode === 'class') app.explain(app.teams[S.turn].name + ' 차례예요!', true);
      }

      app.onSkip(function () { if (S && !S.done) next(); });
      next();
    }
  });
})();
