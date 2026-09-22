/* genre/text_hunt.js — 글 속 찾기 장르 엔진 v1.0.0 (설계 v4 §4, 전과목 · 무대형)
 * 짧은 글에서 조건에 맞는 글자·낱말·문장을 탭한다. 무대가 곧 답이다 — 답 버튼 없음.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도(오탭 0)로 전부 찾은 문항 수
 *  byType = 문항 단위 (gen 이 준 type)
 *  §6-8 [넘기기] = 판정 없이 다음
 *  class = 팀 교대(홀수 문항 A, 짝수 B). 오탭 2회면 상대 팀 차례
 *  답 미노출 — 찾기 전엔 어떤 토큰도 다르게 그리지 않는다 (v4 §5 원칙을 카탈로그 활동에도 적용)
 *
 * gen.next() → { prompt, tokens:[{t, hit:bool} | {t:' ', sep:true}], type, explain }
 * spec = { tokenLabel(tok) (선택) · waits:{correct} }
 */
(function () {
  'use strict';

  function run(app, gen, spec) {
    spec = spec || {};
    var W_OK = (spec.waits && spec.waits.correct) || (app.mode === 'class' ? 1800 : 1200);
    var N = app.settings.n || 5;
    var i = 0, S = null;

    function render() {
      app.el('#hunt-prompt').textContent = S.q.prompt + (app.mode === 'class' ? ' — ' + app.teams[S.turn].name + ' 차례!' : '');
      app.el('#hunt-prompt').className = app.mode === 'class' ? ('turn t' + S.turn) : '';
      app.el('#hunt-text').innerHTML = S.q.tokens.map(function (tok, k) {
        if (tok.sep) return '<span class="tsep"></span>';
        return '<button class="tok" data-k="' + k + '">' + (spec.tokenLabel ? spec.tokenLabel(tok) : tok.t) + '</button>';
      }).join('');
      app.els('#hunt-text .tok').forEach(function (b) {
        b.addEventListener('click', function () { tap(b); });
      });
    }

    function tap(b) {
      if (!S || S.done || b.disabled) return;
      var tok = S.q.tokens[+b.dataset.k];
      if (tok.hit) {
        b.classList.add('got'); b.disabled = true;
        S.found++;
        app.sfx.tick();
        if (S.found >= S.need) {
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
      S.firstTry = false;
      S.miss++;
      app.tally(S.q.type, false);
      app.sfx.bad();
      app.shake(b);
      b.classList.add('bad');
      setTimeout(function () { b.classList.remove('bad'); }, 420);
      if (app.mode === 'class' && S.miss % 2 === 0) {
        S.turn = 1 - S.turn;
        app.el('#hunt-prompt').textContent = app.teams[S.turn].name + ' 차례로 넘어갑니다!';
        app.el('#hunt-prompt').className = 'turn t' + S.turn;
      }
    }

    function next() {
      if (i >= N) return app.finish({});
      var q = gen.next();
      S = { q: q, found: 0, need: q.tokens.filter(function (t) { return t.hit; }).length,
            miss: 0, done: false, firstTry: true, turn: (i % 2) };
      i++;
      app.setProg(i, N);
      app.clearExplain();
      app.hideAnswers();
      render();
    }

    app.onSkip(function () { if (S && !S.done) next(); });
    next();
  }

  window.TextHunt = { run: run, version: '1.0.0' };
})();
