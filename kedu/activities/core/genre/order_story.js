/* genre/order_story.js — 순서 맞추기 장르 엔진 v1.0.0 (설계 v4 §4 · D65, 국어·과학·사회)
 * 카드 3~4장을 알맞은 차례로 놓는다. 카드를 누르면 다음 빈자리로 들어가고, 놓은 카드를 누르면 빠진다(탭 하나 — 드래그 없음).
 * 자리가 다 차면 바로 판정한다(확인 단추 없음 — 1학년 손에 단계 하나를 덜어 준다).
 * byType 축 = 무엇을 보고 차례를 정하는가 — 생성기가 준다(국어 u7: 낱말 차례 · 시간 흐름 · 앞 일과 뒤 일).
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도에 바르게 놓은 문항 수 (문항당 1점)
 *  byType = 문항당 한 번 — 첫 시도에 맞혀야 ok
 *  §6-8 [넘기기] = 판정 전에만
 *  class = 팀 교대(홀수 문항 첫 팀, 짝수 문항 둘째 팀) — 틀리면 상대 팀 차례, 상대 팀이 맞히면 상대 +1, 둘 다 틀리면 공개·무득점
 *  solo·assign = 틀리면 카드가 돌아와 다시 놓는다(첫 시도 실패는 miss) — 세 번째도 틀리면 바른 차례를 보여 주고 넘어간다(막혀 멈추지 않게)
 *  답 미노출 — 카드에 차례 흔적 0(data-k = 섞인 자리), 틀린 판에서 어느 자리가 맞았는지도 알려 주지 않는다
 *
 * gen.next() → { prompt, icon, cards:[{t, e?}](섞인 차례), order:[카드 번호 — 바른 차례], answer:'2,0,1', layout:'row'|'col', type, explain }
 */
(function () {
  'use strict';

  var NUM = ['①', '②', '③', '④', '⑤', '⑥'];
  var TRIES = 3;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function run(app, gen, spec) {
    spec = spec || {};
    var waits = spec.waits || {};
    var W_OK = waits.correct != null ? waits.correct : (app.mode === 'class' ? 2600 : 2200);
    var W_ALL = waits.wrongAll != null ? waits.wrongAll : 3400;
    var W_BACK = waits.back != null ? waits.back : 750;
    var N = app.settings.n || 6;
    var i = 0, S = null;

    app.onSkip(function () { if (S && !S.lock) next(); });

    function cardHtml(c) { return (c.e ? '<span class="os-e">' + esc(c.e) + '</span>' : '') + '<span class="os-t">' + esc(c.t) + '</span>'; }
    function step(text) { app.el('#os-step').textContent = text; }
    function teamName() { return app.teams[S.turn].name; }

    function render() {
      var q = S.q;
      var pr = app.el('#os-prompt');
      pr.innerHTML = '<span class="os-icon">' + esc(q.icon || '') + '</span>' + esc(q.prompt);
      pr.className = app.mode === 'class' ? 'turn t' + S.turn : '';
      var box = app.el('#os');
      box.className = 'lay-' + (q.layout === 'row' ? 'row' : 'col');
      app.el('#os-slots').innerHTML = S.placed.map(function (k, s) {
        var cls = 'os-slot' + (k == null ? ' empty' : ' filled') + (S.mark ? ' ' + S.mark : '');
        return '<button class="' + cls + '" data-s="' + s + '"><span class="os-n">' + NUM[s] + '</span>' +
          (k == null ? '<span class="os-hole"></span>' : '<span class="os-c">' + cardHtml(q.cards[k]) + '</span>') + '</button>';
      }).join('');
      app.el('#os-pool').innerHTML = q.cards.map(function (c, k) {
        var used = S.placed.indexOf(k) >= 0;
        return '<button class="os-card' + (used ? ' used' : '') + '" data-k="' + k + '"' + (used ? ' disabled' : '') + '>' + cardHtml(c) + '</button>';
      }).join('');
      app.els('#os-pool .os-card').forEach(function (b) { b.addEventListener('click', function () { tapCard(+b.getAttribute('data-k'), b); }); });
      app.els('#os-slots .os-slot').forEach(function (b) { b.addEventListener('click', function () { tapSlot(+b.getAttribute('data-s')); }); });
    }

    function idle() { return S && !S.lock && !S.busy; }

    function tapCard(k) {
      if (!idle() || S.placed.indexOf(k) >= 0) return;
      var s = S.placed.indexOf(null);
      if (s < 0) return;
      S.placed[s] = k;
      app.sfx.tick();
      render();
      if (S.placed.indexOf(null) < 0) judge();
    }

    function tapSlot(s) {
      if (!idle() || S.placed[s] == null) return;
      S.placed[s] = null;
      app.sfx.tick();
      render();
    }

    function textOf(list) { return list.map(function (k) { return S.q.cards[k].t; }).join(' → '); }

    function judge() {
      var q = S.q;
      var ok = S.placed.join(',') === q.order.join(',');
      if (app.mode === 'assign') app.detail.push({ q: q.prompt, a: textOf(q.order), pick: textOf(S.placed), ok: ok, type: q.type, ms: Date.now() - S.t0 });
      if (ok) {
        S.lock = true;
        app.markJudged();
        app.tally(q.type, S.first);
        if (app.mode === 'class') app.teamScore(S.turn, 1);
        else if (S.first) app.addScore(1);
        app.sfx.good();
        S.mark = 'ok';
        render();
        step('맞아요! 바른 차례예요');
        app.explain(q.explain, true);
        setTimeout(next, W_OK);
        return;
      }
      S.first = false;
      S.tries++;
      app.sfx.bad();
      app.els('#os-slots .os-slot').forEach(function (b) { app.shake(b); });
      var giveUp = app.mode === 'class' ? S.passed : S.tries >= TRIES;
      if (giveUp) { reveal(); return; }
      S.busy = true;
      if (app.mode === 'class') {
        S.passed = true;
        S.turn = 1 - S.turn;
        step('차례가 달라요 — ' + teamName() + ' 차례로 넘어가요!');
      } else {
        step('차례가 달라요. 카드가 돌아와요 — 다시 놓아 봐요' + (TRIES - S.tries === 1 ? ' (마지막 기회)' : ''));
      }
      setTimeout(function () {
        if (!S || S.lock) return;
        S.busy = false;
        S.placed = S.q.order.map(function () { return null; });
        render();
        if (app.mode === 'class') step(teamName() + ' 차례! 카드를 눌러 차례대로 놓아요');
      }, W_BACK);
    }

    function reveal() {
      var q = S.q;
      S.lock = true;
      app.markJudged();
      app.tally(q.type, false);
      S.placed = q.order.slice();
      S.mark = 'show';
      render();
      step('바른 차례를 보아요');
      app.explain(q.explain, false);
      setTimeout(next, W_ALL);
    }

    function next() {
      if (i >= N) return app.finish({});
      var q = gen.next();
      S = { q: q, placed: q.order.map(function () { return null; }), first: true, tries: 0, passed: false,
            lock: false, busy: false, mark: '', turn: i % 2, t0: Date.now() };
      i++;
      app.setProg(i, N);
      app.clearExplain();
      app.hideWhy();
      app.hideAnswers();
      render();
      step(app.mode === 'class' ? teamName() + ' 차례! 카드를 눌러 차례대로 놓아요' : '카드를 눌러 차례대로 놓아요 · 놓은 카드를 누르면 빠져요');
    }

    next();
  }

  window.OrderStory = { run: run, version: '1.0.0', NUM: NUM, TRIES: TRIES };
})();
