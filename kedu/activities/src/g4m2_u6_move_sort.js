/* src/g4m2_u6_move_sort.js — 어떻게 움직였을까? (4학년 2학기 수학 6단원 「평면도형의 이동」) — 교과서판 2학기 대표 활동
 * 장르: sort(무대형) · 생성기: g4_2_move_sort
 * 원형: 도형 나누기 마당(g3m_u2_shape_sort). 엔진 구조를 그대로 물려받고 물건 그리기(svgOf)만 이 단원 것으로 갈아낀다.
 *
 * 카드 = 교과서 도형의 이동 전·후. 도형은 **생성기가 내보낸 칸 좌표로** 생성기 svgOf 가 그린다(그림 에셋 없음 · 🖨 활동지와 같은 그림) —
 * 이동 후 도형도 생성기가 칸 좌표를 변환해 만든 것이라, 아이가 보는 그림과 채점 기준이 같은 수에서 나온다.
 *  · 밀기 판(slide): 한 모눈에 밀기 전(점선)·민 후(색칠) — 교과서 138쪽 그림처럼
 *  · 뒤집기·돌리기·가리기 판: 「전」 모눈 → 「후」 모눈 — 교과서 142·146·151쪽 그림처럼(모눈은 그대로, 도형만 움직임)
 */
(function () {
  'use strict';

  var svgOf = GENS['g4_2_move_sort'].svgOf;   // 카드 그림은 생성기가 그린다(활동지와 같은 그림)

  ACore.create({
    activityId: 'g4m2_u6_move_sort',
    title: '🔄 어떻게 움직였을까?',
    subtitle: '전과 후를 보고 밀기·뒤집기·돌리기로 나눠요',
    defaults: { by: 'mix', per: 6, n: 4 },
    settings: [
      { key: 'by', label: '무엇으로', options: [
        { v: 'slide', label: '밀기 — 어느 쪽으로' }, { v: 'flip', label: '뒤집기 — 어떻게' },
        { v: 'turn', label: '돌리기 — 몇 도' }, { v: 'kind', label: '밀기·뒤집기·돌리기' }, { v: 'mix', label: '판마다 다르게' }] },
      { key: 'per', label: '한 판 카드 수', options: [{ v: 4, label: '4장' }, { v: 6, label: '6장' }] },
      { key: 'n', label: '판 수', options: [{ v: 2, label: '2' }, { v: 4, label: '4' }, { v: 6, label: '6' }] }
    ],
    stageHtml:
      '<div id="ms">' +
        '<div id="rule"></div>' +
        '<div id="hint"></div>' +
        '<div id="pool"></div>' +
        '<div id="baskets"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g4_2_move_sort'].create({ by: app.settings.by, per: app.settings.per }, app.rng);
      var N = app.settings.n, i = 0, S = null;

      function render() {
        app.el('#rule').textContent = '🔄 ' + S.round.prompt;
        app.el('#hint').innerHTML = (S.round.hint || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        app.el('#pool').innerHTML = S.round.items.map(function (it, k) {
          return '<button class="item" data-k="' + k + '" title="' + it.src + '">' + svgOf(it, S.round.type) + '</button>';
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
