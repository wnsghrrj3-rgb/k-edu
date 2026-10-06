/* genre/claim_judge.js — 맞다·아니다·알 수 없다 장르 엔진 v1.0.0 (설계 v4 §4, 전과목 · 과학·사회)
 * 친구가 한 말(진술)을 판정하고, 그다음 까닭 한 줄을 고른다. 판정과 까닭은 한 쌍이다 —
 * 「아니에요」를 찍어 맞혀도 까닭을 못 고르면 오개념은 그대로 남는다.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도 정답 수 — 판정 1점 + 까닭 1점, 문항당 2점(분모 judged×2)
 *  byType = 문항 단위 1번 — 판정·까닭을 둘 다 첫 시도에 맞혀야 ok (하나라도 놓치면 miss)
 *  §6-8 [넘기기] = 판정 단계에서만, 판정 없이 다음
 *  class = 판정은 선점제(stream 과 같음: 오답 팀 잠금, 두 팀 다 틀리면 공개·무득점),
 *          까닭은 판정을 맞힌 팀만 한 번 — 맞히면 +1, 틀리면 바른 까닭 공개
 *  solo·assign = 판정·까닭 모두 재도전 가능 (첫 시도 실패는 byType miss 로 남는다)
 *  답 미노출 — 판정 전에는 까닭 보기를 DOM 에 그리지도 않는다 (까닭이 곧 답이다)
 *
 * gen.next() → { say, who, face, scene, judge:'o'|'x'|'q', reasons:[{label, ok}], type, explain }
 */
(function () {
  'use strict';

  var JUDGE = [
    { pick: 'o', label: '⭕ 맞아요' },
    { pick: 'x', label: '❌ 아니에요' },
    { pick: 'q', label: '🤔 알 수 없어요' }
  ];
  var JLABEL = { o: '⭕ 맞아요', x: '❌ 아니에요', q: '🤔 알 수 없어요' };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function run(app, gen, spec) {
    spec = spec || {};
    var waits = spec.waits || {};
    var W_OK = waits.correct != null ? waits.correct : (app.mode === 'class' ? 2600 : 2000);
    var W_ALL = waits.wrongAll != null ? waits.wrongAll : 3000;
    var W_TURN = 650;
    var N = app.settings.n || 5;
    var i = 0, S = null;

    app.onSkip(function () { if (S && S.phase === 'judge' && !S.lock) next(); });

    function step(text, team) {
      var el = app.el('#cj-step');
      el.textContent = text;
      el.className = team == null ? '' : ('turn t' + team);
    }

    function render() {
      var q = S.q;
      app.el('#cj-face').textContent = q.face || '🙂';
      app.el('#cj-who').textContent = q.who || '친구';
      app.el('#cj-scene').textContent = q.scene || '';
      app.el('#cj-say').textContent = q.say;
      app.el('#cj-verdict').textContent = '';
      app.el('#cj-verdict').className = '';
      var w = app.el('#cj-why'); w.innerHTML = ''; w.style.display = 'none';
      step(app.mode === 'class' ? '① 맞는 말일까요? 먼저 맞히는 팀!' : '① 맞는 말일까요?');
    }

    function next() {
      if (i >= N) return app.finish({});
      var q = gen.next();
      S = { q: q, phase: 'judge', lock: false, firstJ: true, firstR: true, teamLocked: [false, false], winner: null, t0: Date.now() };
      i++;
      app.setProg(i, N);
      app.clearExplain();
      app.hideWhy();
      render();
      app.answers(JUDGE, onJudge);
      app.unlockAnswers();
    }

    function verdict(ok) {
      var v = app.el('#cj-verdict');
      v.textContent = JLABEL[S.q.judge];
      v.className = 'show ' + (ok ? 'ok' : 'ng');
    }

    function onJudge(pick, teamIdx, btn) {
      if (!S || S.lock || S.phase !== 'judge') return;
      var q = S.q, ok = (pick === q.judge);
      if (app.mode === 'assign') app.detail.push({ q: q.say, a: q.judge, pick: pick, ok: ok, type: q.type, ms: Date.now() - S.t0 });
      if (ok) {
        S.lock = true;
        if (app.mode === 'class' && teamIdx != null) { S.winner = teamIdx; app.teamScore(teamIdx, 1); }
        else if (S.firstJ) app.addScore(1);
        app.sfx.good();
        verdict(true);
        app.hideAnswers();
        setTimeout(startWhy, W_TURN);
        return;
      }
      S.firstJ = false;
      app.sfx.bad();
      if (app.mode === 'class' && teamIdx != null) {
        S.teamLocked[teamIdx] = true;
        app.lockTeam(teamIdx);
        if (S.teamLocked[0] && S.teamLocked[1]) {            // 두 팀 다 틀림 → 공개·무득점
          S.lock = true;
          app.markJudged();
          app.tally(q.type, false);
          verdict(false);
          app.hideAnswers();
          app.explain(rightReason(q) + ' ' + q.explain, false);
          setTimeout(next, W_ALL);
        }
      } else {
        app.shake(btn);
      }
    }

    function rightReason(q) {
      for (var k = 0; k < q.reasons.length; k++) if (q.reasons[k].ok) return q.reasons[k].label;
      return '';
    }

    function startWhy() {
      if (!S) return;
      S.phase = 'why'; S.tw = Date.now();
      var q = S.q, w = app.el('#cj-why');
      step(app.mode === 'class' ? ('② 왜 그럴까요? — ' + app.teams[S.winner].name + ' 차례!') : '② 왜 그럴까요? 알맞은 까닭을 골라요',
           app.mode === 'class' ? S.winner : null);
      w.innerHTML = q.reasons.map(function (r, k) {
        return '<button class="cj-r" data-k="' + k + '"><span class="cj-n">' + (k + 1) + '</span>' + esc(r.label) + '</button>';
      }).join('');
      w.style.display = 'flex';
      app.els('#cj-why .cj-r').forEach(function (b) {
        b.addEventListener('click', function () { onReason(b); });
      });
    }

    function onReason(b) {
      if (!S || S.phase !== 'why' || b.disabled) return;
      var q = S.q, r = q.reasons[+b.dataset.k], ok = !!r.ok;
      if (app.mode === 'assign') app.detail.push({ q: 'why:' + q.say, a: rightReason(q), pick: r.label, ok: ok, type: q.type, ms: Date.now() - S.tw });
      if (ok) {
        S.phase = 'done';
        app.markJudged();
        app.tally(q.type, S.firstJ && S.firstR);
        if (app.mode === 'class') app.teamScore(S.winner, 1);
        else if (S.firstR) app.addScore(1);
        b.classList.add('ok');
        lockReasons();
        app.sfx.good();
        app.explain(q.explain, true);
        setTimeout(next, W_OK);
        return;
      }
      S.firstR = false;
      app.sfx.bad();
      b.classList.add('bad'); b.disabled = true;
      app.shake(b);
      if (app.mode === 'class') {                            // 까닭은 한 번 — 바른 까닭 공개
        S.phase = 'done';
        app.markJudged();
        app.tally(q.type, false);
        app.els('#cj-why .cj-r').forEach(function (x) { if (q.reasons[+x.dataset.k].ok) x.classList.add('ok'); });
        lockReasons();
        app.explain(q.explain, false);
        setTimeout(next, W_ALL);
      }
    }

    function lockReasons() { app.els('#cj-why .cj-r').forEach(function (x) { x.disabled = true; }); }

    // 판정 1 + 까닭 1 — 문항당 2점. 분모도 2배 (core finish 기본 분모를 덮어쓴다)
    var coreFinish = app.finish;
    app.finish = function (o) {
      o = o || {};
      if (o.total == null) o.total = app.judged * 2;
      return coreFinish(o);
    };

    next();
  }

  window.ClaimJudge = { run: run, version: '1.0.0', JUDGE: JUDGE };
})();
