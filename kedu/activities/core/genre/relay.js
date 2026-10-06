/* genre/relay.js — 반 전체 릴레이 장르 엔진 v1.1.0 (§10-5 · v4 D58 혼자 릴레이)
 * 승패가 없는 유일한 대결 장르. 상대는 다른 팀이 아니라 **우리 반의 지난 기록**이다.
 *
 * 혼자(solo) [D58 — 활동은 1인도 가능하게] — 같은 바통을 한 사람이 끝까지 잇는다.
 *   주자 대신 「바통」을 센다(「다음 주자 3번」이 아니라 「3번째 바통」). 반 기록(BEST)은 읽지도 쓰지도 않는다.
 *   시간은 solo 에서도 재지 않는다 — 혼자 할 때도 「빨리」가 아니라 「끝까지 이어서」가 이 장르의 약속(D6 그대로).
 *   기록은 core 의 solo 최고 기록(첫 시도에 맞힌 바통 수 / 바통 수) 하나뿐.
 *   바통 수 기본은 10 — 호스트·URL 이 runners 를 주지 않았을 때만(클래스 기본 20명을 혼자 20번 하진 않는다).
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
    var solo = app.mode !== 'class';                    // D58: solo·assign 은 혼자 잇는 흐름
    var runners = app.settings.runners || 20;
    var shuffle = !solo && +app.settings.shuffle === 1;   // 혼자는 순서가 의미 없다

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

    var runnerLabel = app.el('#runner-box .rl');
    if (solo && runnerLabel) runnerLabel.textContent = '바통';

    function paintBaton() {
      if (solo) {                                        // D58: 바통만 센다 — 반 기록·시간 없음
        app.el('#runner').textContent = (S.at + 1) + '번째';
        app.el('#relay-left').textContent = '남은 바통 ' + (runners - S.at) + '개';
        var r = app.record && app.record.get();
        app.el('#relay-best').textContent = r ? ('🏅 내 최고 기록 ' + r.score + ' / ' + r.total) : '첫 도전! 끝까지 이어 봐요';
      } else {
        var b = best();
        app.el('#runner').textContent = order[S.at] + '번';
        app.el('#relay-left').textContent = '남은 주자 ' + (runners - S.at) + '명';
        app.el('#relay-best').textContent = (b && b.runners === runners)
          ? '우리 반 최고 기록 ' + b.sec + '초' : '첫 도전! 기록을 만들어요';
      }
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
        app.explain(p.explain || (solo ? '좋아요! 다음 바통 🏃' : '좋아요! 바통을 넘겨요 🏃'), true);
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
      app.explain('💡 ' + (p.explain || '다시 한번!') + (solo ? '  — 틀려도 바통은 안 떨어져요!' : '  — 우리 반이 응원해요!'), false);
    }

    function done() {
      if (solo) {                                        // D58: 시간 없음 · 반 기록 안 건드림 · 기록은 core 최고 기록
        app.el('#relay-result').style.display = 'block';
        app.el('#relay-result').innerHTML = '🏁 혼자 완주! 바통 <span class="num">' + runners + '개</span>를 끝까지 이었어요';
        app.finish({ score: app.score, total: runners });
        return;
      }
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

  // D58 — 혼자 기본 바통 수. src 의 onConfig 에서 부른다(설정 칩이 그려진 뒤라 칩 표시도 같이 맞춘다).
  // 호스트 CONFIG 나 URL ?runners= 가 값을 준 경우는 그대로 둔다 — 혼자 20명분을 뛰게 하지 않으려는 기본값일 뿐 강제가 아니다.
  function soloDefault(app, cfg) {
    if (app.mode === 'class') return;
    if (cfg && cfg.hosted) return;
    if (new URLSearchParams(location.search).has('runners')) return;
    app.settings.runners = Math.min(app.settings.runners || 20, 10);
    var chips = app.els('.chip[data-set="runners"]');
    chips.forEach(function (c) { c.classList.toggle('on', +c.dataset.v === app.settings.runners); });
  }

  window.Relay = { run: run, soloDefault: soloDefault, version: '1.1.0' };
})();
