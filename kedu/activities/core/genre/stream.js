/* genre/stream.js — 문제 스트림형 장르 엔진 v1.0.0 (§9-3)
 * 대상 장르: balance · duel_quiz · relay (한 문제씩 흘러가는 형태 전부)
 * 이 파일이 게임 루프의 전부다. 활동은 "무대를 어떻게 그리는가"만 쓰면 된다.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도 정답 수 (재도전으로 맞춘 건 득점 아님 — "처음에 아는가"가 신호)
 *  §6-8 [넘기기]는 판정 없이 다음 문항. 채점 분모(judged)에 안 들어간다.
 *  §6-8 중도 종료 시 판정분으로 마감 (core가 처리)
 *  class 선점제: 먼저 맞힌 팀 득점. 오답 팀은 잠금. 양팀 오답 → 정답 공개·무득점 진행.
 *  solo/assign: 오답이면 재도전 가능 (첫 시도 실패는 byType.miss로 남는다)
 *
 * spec = {
 *   render(app, p)            무대에 문제 반영 (필수)
 *   options(p)                답 버튼 [{pick, label}] (필수)
 *   reveal(app, p, ok)        정답 공개 연출 (선택)
 *   reset(app)                문항 시작 시 초기화 (선택)
 *   waits: { correct, wrongAll }   기본 class 2000/2200, solo 1500
 *   why: { question, options, answerOf(p) }   왜 그럴까 보너스 (선택, class 제외)
 * }
 */
(function () {
  'use strict';

  function run(app, gen, spec) {
    spec = spec || {};
    var waits = spec.waits || {};
    var W_OK = waits.correct != null ? waits.correct : (app.mode === 'class' ? 2000 : 1500);
    var W_ALL = waits.wrongAll != null ? waits.wrongAll : 2200;
    var whyOn = !!(spec.why && app.settings.why === 1 && app.mode !== 'class');

    var S = { i: 0, n: app.settings.n || 10, cur: null, phase: 'main',
              firstTry: true, lockAll: false, teamLocked: [false, false], t0: 0 };

    app.onSkip(function () {      // §6-8 넘기기 = 판정 없이 다음
      if (S.lockAll || S.phase !== 'main') return;
      next();
    });

    function next() {
      if (S.i >= S.n) return app.finish({});
      S.cur = gen.next();
      S.i++; S.t0 = Date.now(); S.firstTry = true;
      S.lockAll = false; S.teamLocked = [false, false]; S.phase = 'main';
      app.setProg(S.i, S.n);
      app.clearExplain();
      app.hideWhy();
      if (typeof spec.reset === 'function') spec.reset(app);
      spec.render(app, S.cur);
      app.answers(spec.options(S.cur), onPick);
      app.unlockAnswers();
    }

    function onPick(pick, teamIdx, btn) {
      if (S.lockAll || S.phase !== 'main') return;
      var p = S.cur;
      var ok = gen.check ? gen.check(pick, p) : (pick === p.answer);
      if (app.mode === 'assign') {
        app.detail.push({ q: p.prompt, a: p.answer, pick: pick, ok: ok, type: p.type, ms: Date.now() - S.t0 });
      }

      if (ok) {
        S.lockAll = true;
        app.markJudged();                              // §6-8 문항 종결 = 분모 +1
        if (S.firstTry) { app.tally(p.type, true); if (app.mode !== 'class') app.addScore(1); }
        if (app.mode === 'class' && teamIdx != null) app.teamScore(teamIdx, 1);
        app.sfx.good();
        if (typeof spec.reveal === 'function') spec.reveal(app, p, true);
        if (p.explain) app.explain(p.explain, true);
        app.hideAnswers();
        setTimeout(function () {
          if (whyOn) startWhy();
          else next();
        }, W_OK);
        return;
      }

      // 오답
      S.firstTry = false;
      app.tally(p.type, false);
      app.sfx.bad();
      if (app.mode === 'class' && teamIdx != null) {
        S.teamLocked[teamIdx] = true;
        app.lockTeam(teamIdx);
        if (S.teamLocked[0] && S.teamLocked[1]) {      // 양팀 오답 → 정답 공개, 무득점 진행
          S.lockAll = true;
          app.markJudged();
          if (typeof spec.reveal === 'function') spec.reveal(app, p, false);
          if (p.explain) app.explain(p.explain, false);
          app.hideAnswers();
          setTimeout(next, W_ALL);
        }
      } else {
        app.shake(btn);                                 // solo/assign — 재도전 허용
      }
    }

    // ── 왜 그럴까 보너스 (§10-2, solo·assign 전용 — D12)
    function startWhy() {
      S.phase = 'why';
      var wt0 = Date.now(), whyFirst = true;
      var ansKey = spec.why.answerOf(S.cur);
      app.why(spec.why.question, spec.why.options, function (pick, btn) {
        if (S.phase !== 'why') return;
        var ok = (pick === ansKey);
        if (app.mode === 'assign') {
          app.detail.push({ q: 'why:' + S.cur.prompt, a: ansKey, pick: pick, ok: ok,
                            type: ok ? 'reason_ok' : 'reason_miss', ms: Date.now() - wt0 });
        }
        if (ok) {
          if (whyFirst) { app.tally('reason_ok', true); app.addScore(1); }
          app.sfx.good();
          S.phase = 'done';
          app.hideWhy();
          setTimeout(next, 300);
        } else {
          whyFirst = false;
          app.tally('reason_miss', false);
          app.sfx.bad();
          btn.classList.add('locked');
          app.shake(btn);
        }
      });
    }

    // 왜 그럴까가 켜지면 만점이 문항당 2점 — 분모도 2배 (core finish의 기본 분모를 덮어쓴다)
    var coreFinish = app.finish;
    app.finish = function (o) {
      o = o || {};
      if (o.total == null && whyOn) o.total = app.judged * 2;
      return coreFinish(o);
    };

    next();
  }

  window.Stream = { run: run, version: '1.0.0' };
})();
