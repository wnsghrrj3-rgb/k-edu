/* genre/sequence.js — 순서 잇기 장르 엔진 v1.0.0 (§10-4, 무대형)
 * 흩어진 카드를 순서대로 탭한다. Stream(선다형)과 달리 답 버튼이 없고 무대가 곧 답이다.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도에 바르게 짚은 카드 수 (되짚어 맞춘 건 득점 아님)
 *  §10-4 byType = 카드 단위가 아니라 문항 단위 (decade_cross · skip · mid) — 경계 넘김 오개념 검출
 *  §6-8 [넘기기] = 판정 없이 다음. 중도 종료 시 판정분으로 마감
 *  class = 팀 교대(홀수 문항 A, 짝수 B). 오탭 2회면 턴이 상대 팀으로 넘어간다 (칠판 앞 교대의 현실)
 *  D18 시간은 점수가 아니라 durationSec로만 기록 (느린 아이에게 낙인을 찍지 않는다 — D6 정신)
 *
 * spec = { cardLabel(v), waits:{correct} }
 */
(function () {
  'use strict';

  function run(app, gen, spec) {
    spec = spec || {};
    var W_OK = (spec.waits && spec.waits.correct) || (app.mode === 'class' ? 1800 : 1200);
    var N = app.settings.n || 5;
    var i = 0, S = null;

    function render() {
      var html = S.q.cards.map(function (v) {
        return '<button class="ncard" data-v="' + v + '">' + (spec.cardLabel ? spec.cardLabel(v) : v) + '</button>';
      }).join('');
      app.el('#cards').innerHTML = html;
      app.els('#cards .ncard').forEach(function (b) {
        b.addEventListener('click', function () { tap(b); });
      });
      app.el('#hint').textContent = S.q.prompt + (app.mode === 'class' ? ' — ' + app.teams[S.turn].name + ' 차례!' : '');
      app.el('#hint').className = app.mode === 'class' ? ('turn t' + S.turn) : '';
    }

    function tap(b) {
      if (!S || S.done) return;
      var v = +b.dataset.v;
      if (v === S.q.seq[S.at]) {                       // 정답 카드
        b.classList.add('got');
        b.disabled = true;
        b.setAttribute('data-order', S.at + 1);
        app.sfx.tick();
        S.at++;
        if (S.at >= S.q.seq.length) {                  // 완주
          S.done = true;
          app.markJudged();
          if (S.firstTry) {
            app.tally(S.q.type, true);
            if (app.mode !== 'class') app.addScore(1);
          }
          if (app.mode === 'class') app.teamScore(S.turn, 1);
          app.sfx.win();
          app.explain(S.q.explain, true);
          setTimeout(next, W_OK);
        }
        return;
      }
      // 오탭
      S.firstTry = false;
      S.miss++;
      app.tally(S.q.type, false);
      app.sfx.bad();
      app.shake(b);
      b.classList.add('bad');
      setTimeout(function () { b.classList.remove('bad'); }, 420);
      if (app.mode === 'class' && S.miss % 2 === 0) {  // 오탭 2회 → 상대 팀으로 턴 이동
        S.turn = 1 - S.turn;
        app.el('#hint').textContent = app.teams[S.turn].name + ' 차례로 넘어갑니다!';
        app.el('#hint').className = 'turn t' + S.turn;
      }
    }

    function next() {
      if (i >= N) return app.finish({});
      S = { q: gen.next(), at: 0, miss: 0, done: false, firstTry: true, turn: (i % 2) };
      i++;
      app.setProg(i, N);
      app.clearExplain();
      app.hideAnswers();
      render();
    }

    app.onSkip(function () { if (S && !S.done) next(); });
    next();
  }

  window.Sequence = { run: run, version: '1.0.0' };
})();
