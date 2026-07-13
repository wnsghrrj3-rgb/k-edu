/* genre/relay.js — 반 전체 릴레이 장르 엔진 v1.0.0 (§10-5, class 전용)
 * 승패가 없는 유일한 대결 장르. 상대는 다른 팀이 아니라 **우리 반의 지난 기록**이다.
 *
 * 교육적 계약 [D6 — 설계로 강제한다]
 *   개인 번호별 소요 시간을 표시하지도 저장하지도 않는다. 기록은 언제나 반의 것이다.
 *   느린 학생에게 낙인을 찍는 순간 이 장르는 존재 이유를 잃는다.
 *   탈락도 없다. 틀리면 힌트가 열리고 같은 주자가 다시 한다 — 그 구간이 응원 구간이다.
 *
 * score = 첫 시도에 맞힌 주자 수 (D19) · total = 주자 수 · durationSec = 반 완주 시간
 * spec = { render(app,p), options(p), reveal(app,p,ok), reset(app) }   (Stream과 같은 계약)
 */
(function () {
  'use strict';

  function run(app, gen, spec) {
    spec = spec || {};
    var runners = app.settings.runners || 20;
    var shuffle = +app.settings.shuffle === 1;

    var order = [];
    for (var k = 1; k <= runners; k++) order.push(k);
    if (shuffle) {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(app.rng() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t;
      }
    }

    var BEST = 'kedu_relay_best_' + app.activityId;   // 반 기록 (개인 기록 아님 — D6)
    var S = { at: 0, cur: null, firstTry: true, lock: false, t0: Date.now() };

    function best() { try { return JSON.parse(localStorage.getItem(BEST) || 'null'); } catch (e) { return null; } }
    function saveBest(sec) { try { localStorage.setItem(BEST, JSON.stringify({ sec: sec, runners: runners })); } catch (e) {} }

    function paintBaton() {
      var b = best();
      app.el('#runner').textContent = order[S.at] + '번';
      app.el('#relay-left').textContent = '남은 주자 ' + (runners - S.at) + '명';
      app.el('#relay-best').textContent = (b && b.runners === runners)
        ? '우리 반 최고 기록 ' + b.sec + '초' : '첫 도전! 기록을 만들어요';
      // 트랙: 지나온 주자만 채운다 (누가 오래 걸렸는지는 어디에도 남기지 않는다 — D6)
      var pct = Math.round(S.at / runners * 100);
      app.el('#track-fill').style.width = pct + '%';
    }

    function nextRunner() {
      if (S.at >= runners) return done();
      S.cur = gen.next();
      S.firstTry = true; S.lock = false;
      app.setProg(S.at + 1, runners);
      app.clearExplain();
      paintBaton();
      if (typeof spec.reset === 'function') spec.reset(app);
      spec.render(app, S.cur);
      app.answers(spec.options(S.cur), onPick);
      app.unlockAnswers();
    }

    function onPick(pick, teamIdx, btn) {
      if (S.lock) return;
      var p = S.cur;
      var ok = gen.check ? gen.check(pick, p) : (pick === p.answer);
      if (ok) {
        S.lock = true;
        app.markJudged();
        if (S.firstTry) { app.tally(p.type, true); app.addScore(1); }
        app.sfx.good();
        if (typeof spec.reveal === 'function') spec.reveal(app, p, true);
        app.explain(p.explain || '좋아요! 바통을 넘겨요 🏃', true);
        app.hideAnswers();
        app.el('#baton').classList.add('pass');
        setTimeout(function () {
          app.el('#baton').classList.remove('pass');
          S.at++;
          nextRunner();
        }, 1400);
        return;
      }
      // 오답 = 탈락이 아니라 응원 구간. 힌트를 열고 같은 주자가 다시.
      S.firstTry = false;
      app.tally(p.type, false);
      app.sfx.bad();
      app.shake(btn);
      app.explain('💡 ' + (p.explain || '다시 한번!') + '  — 우리 반이 응원해요!', false);
    }

    function done() {
      var sec = Math.round((Date.now() - S.t0) / 1000);
      var b = best();
      var isNew = !b || b.runners !== runners || sec < b.sec;
      if (isNew) saveBest(sec);
      app.el('#relay-result').style.display = 'block';
      app.el('#relay-result').innerHTML = isNew
        ? '🎉 우리 반 최고 기록! <span class="num">' + sec + '초</span>'
        : '완주! <span class="num">' + sec + '초</span>  (최고 기록 ' + b.sec + '초)';
      // class 모드지만 팀이 없다 — core의 팀 합산 기본값을 쓰지 않고 직접 넘긴다 (D19)
      app.finish({ score: app.score, total: runners });   // 개인 시간은 어디에도 넘기지 않는다 (D6)
    }

    app.onSkip(function () {             // 결석·자리 비움 — 그 주자를 건너뛴다 (판정 없음)
      if (S.lock) return;
      S.at++;
      if (S.at >= runners) return done();
      nextRunner();
    });

    nextRunner();
  }

  window.Relay = { run: run, version: '1.0.0' };
})();
