/* genre/category_race.js — 분류 릴레이 장르 엔진 v1.0.0 (설계 v4 §4, 전과목)
 * 반 전체가 순번대로 나와 한 항목씩 칸에 넣는다. relay(§10-5)의 형제 — 승패 없는 협력형.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도에 바르게 넣은 항목 수 · total = 항목 수(class 는 주자 수)
 *  §6-2 칸 버튼은 가로 일렬 (#cats) — 답 버튼 셸(app.answers)은 팀 그룹이라 쓰지 않는다
 *  §6-8 [넘기기] = 판정 없이 다음 주자(결석·자리 비움)
 *  D6  개인 시간은 표시도 저장도 없다. 틀리면 탈락이 아니라 힌트가 열리고 같은 주자가 다시 한다.
 *  class = 번호 순번(설정 runners·shuffle) · solo/assign = 혼자 n 문항
 *
 * spec = { categories:[{key,label}] (필수 — 보통 gen.categories), renderItem(q) → html (선택), waits:{correct} }
 */
(function () {
  'use strict';

  function run(app, gen, spec) {
    spec = spec || {};
    var cats = spec.categories || gen.categories || [];
    var W_OK = (spec.waits && spec.waits.correct) || (app.mode === 'class' ? 1500 : 1100);
    var isClass = app.mode === 'class';
    var runners = isClass ? (app.settings.runners || 20) : (app.settings.n || 10);
    var order = [];
    for (var k = 1; k <= runners; k++) order.push(k);
    if (isClass && +app.settings.shuffle === 1) {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(app.rng() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t;
      }
    }
    if (isClass) {                                   // 팀이 없다 — 반 전체가 한 팀 (D19)
      app.el('#teams').style.display = 'none';
      app.el('#score-pill').style.display = '';
    }

    var S = { at: 0, q: null, firstTry: true, lock: false };

    function paint() {
      app.el('#cr-runner').textContent = isClass ? order[S.at] + '번' : '';
      app.el('#cr-left').textContent = isClass ? '남은 주자 ' + (runners - S.at) + '명' : '';
      app.el('#cr-fill').style.width = Math.round(S.at / runners * 100) + '%';
      app.el('#cr-item').innerHTML = spec.renderItem ? spec.renderItem(S.q) : String(S.q.item);
      app.el('#cats').innerHTML = cats.map(function (c) {
        return '<button class="cat" data-cat="' + c.key + '">' + c.label + '</button>';
      }).join('');
      app.els('#cats .cat').forEach(function (b) {
        b.addEventListener('click', function () { pick(b); });
      });
    }

    function pick(b) {
      if (S.lock || !S.q) return;
      var okv = gen.check ? gen.check(b.dataset.cat, S.q) : (b.dataset.cat === S.q.cat);
      if (okv) {
        S.lock = true;
        app.markJudged();
        if (S.firstTry) { app.tally(S.q.type, true); app.addScore(1); }
        b.classList.add('got');
        app.sfx.good();
        app.explain(S.q.explain || '좋아요! 다음 주자!', true);
        setTimeout(function () { S.at++; next(); }, W_OK);
        return;
      }
      S.firstTry = false;
      app.tally(S.q.type, false);
      app.sfx.bad();
      app.shake(b);
      b.classList.add('bad');
      setTimeout(function () { b.classList.remove('bad'); }, 420);
      app.explain('💡 ' + (S.q.explain || '다시 한번!') + (isClass ? '  — 우리 반이 응원해요!' : ''), false);
    }

    function next() {
      if (S.at >= runners) return app.finish({ score: app.score, total: runners });
      S.q = gen.next();
      S.firstTry = true; S.lock = false;
      app.setProg(S.at + 1, runners);
      app.clearExplain();
      app.hideAnswers();
      paint();
    }

    app.onSkip(function () {             // 결석·자리 비움 — 판정 없이 건너뛴다
      if (S.lock) return;
      S.at++;
      next();
    });
    next();
  }

  window.CategoryRace = { run: run, version: '1.0.0' };
})();
