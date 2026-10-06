/* genre/fill_dialog.js — 대화 채우기 장르 엔진 v1.0.0 (설계 v4 §4 · D64, 국어·영어)
 * 상황 한 줄 + 말풍선 한두 개. 「나」의 말풍선이 비어 있고, 보기 셋(①②③) 가운데 알맞은 말을 고른다.
 * byType 축 = 무엇을 보고 말을 고르는가 — 상대(누구에게) · 상황(어떤 마음) · 때(언제) · 주고받기(받은 말에 답하기).
 * 보기는 무대에 줄로 놓고(긴 말도 한 줄), 답 버튼은 ①②③ 짧은 번호 — §6-2 가로 일렬 · D38 줄바꿈 없음을 지킨다.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도 정답 수 (문항당 1점)
 *  byType = 문항당 한 번 — 첫 시도에 맞혀야 ok
 *  §6-8 [넘기기] = 판정 전에만
 *  class = 선점제(stream·observe_pick 과 같음): 오답 팀 잠금, 두 팀 다 틀리면 정답 공개·무득점. 보기 줄을 눌러도 무반응
 *  solo·assign = 다시 고를 수 있다(첫 시도 실패는 miss 로 남는다). 보기 줄을 눌러도 고른다(번호 버튼과 같은 길)
 *  답 미노출 — 판정 전 빈 말풍선·보기 줄·버튼 어디에도 정답 표시가 없다
 *
 * gen.next() → { sit, icon, lines:[{who, face, me, say|null}], options:[말,말,말], answer:'0'|'1'|'2', type, explain }
 *   lines 에서 say 가 null 인 줄 하나가 빈칸(「나」)이다. 상대 줄의 say 가 '' 이면 말풍선 없이 얼굴만 선다.
 */
(function () {
  'use strict';

  var NUM = ['①', '②', '③', '④'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function run(app, gen, spec) {
    spec = spec || {};
    var waits = spec.waits || {};
    var W_OK = waits.correct != null ? waits.correct : (app.mode === 'class' ? 2600 : 2200);
    var W_ALL = waits.wrongAll != null ? waits.wrongAll : 3200;
    var N = app.settings.n || 8;
    var i = 0, S = null;

    app.onSkip(function () { if (S && !S.lock) next(); });

    function step(text) { app.el('#fd-step').textContent = text; }

    function lineHtml(ln) {
      var face = '<div class="fd-who"><span class="fd-face">' + esc(ln.face) + '</span><span class="fd-name">' + esc(ln.who) + '</span></div>';
      var bub;
      if (ln.say === null) bub = '<div class="fd-bub fd-blank" id="fd-blank"><span class="fd-q">?</span></div>';
      else if (ln.say === '') bub = '';
      else bub = '<div class="fd-bub">' + esc(ln.say) + '</div>';
      return '<div class="fd-line' + (ln.me ? ' me' : '') + '">' + (ln.me ? bub + face : face + bub) + '</div>';
    }

    function render() {
      var q = S.q;
      app.el('#fd-sit').innerHTML = '<span class="fd-icon">' + esc(q.icon || '') + '</span>' + esc(q.sit);
      app.el('#fd-talk').innerHTML = q.lines.map(lineHtml).join('');
      app.el('#fd-opts').innerHTML = q.options.map(function (o, k) {
        return '<button class="fd-o" data-i="' + k + '"><span class="fd-n">' + NUM[k] + '</span><span class="fd-t">' + esc(o) + '</span></button>';
      }).join('');
      Array.prototype.forEach.call(app.el('#fd-opts').querySelectorAll('.fd-o'), function (b) {
        b.addEventListener('click', function () {
          if (app.mode === 'class') return;
          onPick(b.getAttribute('data-i'), null, b);
        });
      });
      step(app.mode === 'class' ? '어떤 말이 알맞을까요? 먼저 맞히는 팀!' : '「나」는 뭐라고 말할까요? 골라요');
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
      app.answers(q.options.map(function (o, k) { return { pick: String(k), label: NUM[k] }; }), onPick);
      app.unlockAnswers();
    }

    function reveal(ok) {
      var q = S.q, k = +q.answer;
      var blank = app.el('#fd-blank');
      if (blank) { blank.className = 'fd-bub fd-blank ' + (ok ? 'ok' : 'show'); blank.textContent = q.options[k]; }
      Array.prototype.forEach.call(app.el('#fd-opts').querySelectorAll('.fd-o'), function (b) {
        b.disabled = true;
        b.classList.add(+b.getAttribute('data-i') === k ? (ok ? 'ok' : 'show') : 'dim');
      });
      step('알맞은 말은 ' + NUM[k] + ' 「' + q.options[k] + '」');
    }

    function onPick(pick, teamIdx, btn) {
      if (!S || S.lock) return;
      var q = S.q, ok = (String(pick) === String(q.answer));
      if (app.mode === 'assign') app.detail.push({ q: q.sit, a: q.options[+q.answer], pick: q.options[+pick], ok: ok, type: q.type, ms: Date.now() - S.t0 });
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
        var row = app.el('#fd-opts .fd-o[data-i="' + pick + '"]');
        if (row) { row.classList.add('no'); setTimeout(function () { row.classList.remove('no'); }, 500); }
      }
    }

    next();
  }

  window.FillDialog = { run: run, version: '1.0.0', NUM: NUM };
})();
