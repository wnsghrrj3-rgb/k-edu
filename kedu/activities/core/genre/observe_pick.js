/* genre/observe_pick.js — 관찰 고르기 장르 엔진 v1.0.0 (설계 v4 §4 · D62, 과학)
 * 그림 두 장(가·나)을 보고 조건에 맞는 쪽을 고른다. 답은 셋 — 가 · 나 · 🤔 그림으로는 알 수 없어요.
 * byType 축 = 관찰 vs 추측: 그림에 보이는 것은 보고 고르고, 안 보이는 것(가려진 줄기 · 땅속 뿌리)이나
 * 사람마다 다른 것(예쁜가)은 짐작하지 않고 「알 수 없어요」를 고른다.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도 정답 수 (문항당 1점)
 *  byType = 문항당 한 번 — 첫 시도에 맞혀야 ok
 *  §6-8 [넘기기] = 판정 전에만
 *  class = 선점제(stream 과 같음): 오답 팀 잠금, 두 팀 다 틀리면 정답 공개·무득점
 *  solo·assign = 다시 고를 수 있다(첫 시도 실패는 miss 로 남는다). 그림 카드를 눌러도 고른다(답 버튼과 같은 길)
 *  답 미노출 — 판정 전 카드·버튼 어디에도 정답 표시가 없다(그림 속성은 생성기가 SVG 에 남기지 않는다)
 *
 * gen.next() → { ask, cards:[{svg},{svg}], answer:'a'|'b'|'q', type, explain }
 */
(function () {
  'use strict';

  var PICKS = [
    { pick: 'a', label: '가' },
    { pick: 'b', label: '나' },
    { pick: 'q', label: '🤔 알 수 없어요' }
  ];

  function run(app, gen, spec) {
    spec = spec || {};
    var waits = spec.waits || {};
    var W_OK = waits.correct != null ? waits.correct : (app.mode === 'class' ? 2600 : 2200);
    var W_ALL = waits.wrongAll != null ? waits.wrongAll : 3200;
    var N = app.settings.n || 8;
    var i = 0, S = null;

    app.onSkip(function () { if (S && !S.lock) next(); });

    // 그림 카드 누르기 — 혼자·과제만 (교실은 팀 버튼으로 선점)
    ['a', 'b'].forEach(function (side) {
      var card = app.el('#op-' + side);
      card.addEventListener('click', function () {
        if (app.mode === 'class') return;
        onPick(side, null, card);
      });
    });

    function step(text) { app.el('#op-step').textContent = text; }

    function render() {
      var q = S.q;
      app.el('#op-ask').textContent = q.ask;
      ['a', 'b'].forEach(function (side, k) {
        var c = app.el('#op-' + side);
        c.className = 'op-card';
        app.el('#op-' + side + ' .op-pic').innerHTML = q.cards[k].svg;
      });
      step(app.mode === 'class' ? '자세히 보고, 먼저 맞히는 팀!' : (app.mode === 'assign' ? '자세히 보고 골라요' : '자세히 보고 골라요 — 그림을 눌러도 돼요'));
    }

    function next() {
      if (i >= N) return app.finish({});
      var q = gen.next();
      S = { q: q, lock: false, first: true, teamLocked: [false, false], t0: Date.now() };
      i++;
      app.setProg(i, N);
      app.clearExplain();
      app.hideWhy();
      render();
      app.answers(PICKS, onPick);
      app.unlockAnswers();
    }

    function reveal(ok) {
      var q = S.q;
      if (q.answer === 'q') { app.el('#op-a').classList.add('unk'); app.el('#op-b').classList.add('unk'); }
      else {
        app.el('#op-' + q.answer).classList.add(ok ? 'ok' : 'show');
        app.el('#op-' + (q.answer === 'a' ? 'b' : 'a')).classList.add('dim');
      }
      step(q.answer === 'q' ? '🤔 그림으로는 알 수 없어요' : ('정답은 「' + (q.answer === 'a' ? '가' : '나') + '」'));
    }

    function onPick(pick, teamIdx, btn) {
      if (!S || S.lock) return;
      var q = S.q, ok = (pick === q.answer);
      if (app.mode === 'assign') app.detail.push({ q: q.ask, a: q.answer, pick: pick, ok: ok, type: q.type, ms: Date.now() - S.t0 });
      if (ok) {
        S.lock = true;
        app.markJudged();
        app.tally(q.type, S.first);
        if (app.mode === 'class' && teamIdx != null) app.teamScore(teamIdx, 1);
        else if (S.first) app.addScore(1);
        app.sfx.good();
        app.hideAnswers();
        reveal(true);
        app.explain(q.explain, true);
        setTimeout(next, W_OK);
        return;
      }
      S.first = false;
      app.sfx.bad();
      if (app.mode === 'class' && teamIdx != null) {
        S.teamLocked[teamIdx] = true;
        app.lockTeam(teamIdx);
        if (S.teamLocked[0] && S.teamLocked[1]) {            // 두 팀 다 틀림 → 공개·무득점
          S.lock = true;
          app.markJudged();
          app.tally(q.type, false);
          app.hideAnswers();
          reveal(false);
          app.explain(q.explain, false);
          setTimeout(next, W_ALL);
        }
      } else {
        app.shake(btn);
        if (btn && btn.classList && btn.classList.contains('op-card')) {
          btn.classList.add('no');
          setTimeout(function () { btn.classList.remove('no'); }, 500);
        }
      }
    }

    next();
  }

  window.ObservePick = { run: run, version: '1.0.0', PICKS: PICKS };
})();
