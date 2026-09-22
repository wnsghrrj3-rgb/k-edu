/* genre/map_pin.js — 자리에 놓기 장르 엔진 v1.0.0 (설계 v4 §4, 전과목 · 무대형)
 * 이름표(타일)를 골라 판 위의 자리(슬롯)에 놓는다. 탭·탭 조작 — 드래그는 전자칠판에서 손에 안 붙는다.
 *
 * 규칙(헌법):
 *  §9-4 score = 첫 시도에 모든 자리를 바르게 채운 문항 수 (되짚어 맞춘 건 득점 아님)
 *  byType = 문항 단위 (gen 이 준 type) — 자리 하나가 아니라 판 하나가 진단 단위
 *  §6-8 [넘기기] = 판정 없이 다음
 *  class = 팀 교대(홀수 문항 A, 짝수 B). 오탭 2회면 상대 팀 차례
 *
 * gen.next() → { prompt, slots:[{key,label}], tiles:[{v,label?,slot|null}], type, explain }
 * spec = { board(q) → html (필수: .pslot[data-slot=key] 를 포함) · tileLabel(t) · reveal(app,q) (선택) · waits:{correct} }
 */
(function () {
  'use strict';

  function run(app, gen, spec) {
    spec = spec || {};
    var W_OK = (spec.waits && spec.waits.correct) || (app.mode === 'class' ? 1800 : 1200);
    var N = app.settings.n || 5;
    var i = 0, S = null;

    function render() {
      app.el('#pin-prompt').textContent = S.q.prompt + (app.mode === 'class' ? ' — ' + app.teams[S.turn].name + ' 차례!' : '');
      app.el('#pin-prompt').className = app.mode === 'class' ? ('turn t' + S.turn) : '';
      app.el('#pin-board').innerHTML = spec.board(S.q);
      app.el('#pin-tiles').innerHTML = S.q.tiles.map(function (t, k) {
        return '<button class="ptile" data-k="' + k + '" data-v="' + t.v + '">' + (spec.tileLabel ? spec.tileLabel(t) : (t.label || t.v)) + '</button>';
      }).join('');
      app.els('#pin-tiles .ptile').forEach(function (b) {
        b.addEventListener('click', function () { selectTile(b); });
      });
      app.els('#pin-board .pslot').forEach(function (s) {
        s.addEventListener('click', function () { dropOn(s); });
      });
    }

    function selectTile(b) {
      if (!S || S.done || b.disabled) return;
      app.els('#pin-tiles .ptile.sel').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      S.sel = b;
      app.sfx.tick();
    }

    function dropOn(slotEl) {
      if (!S || S.done) return;
      if (!S.sel) { app.explain('먼저 놓을 것을 골라요', false); return; }
      if (slotEl.classList.contains('filled')) return;
      var tile = S.q.tiles[+S.sel.dataset.k];
      if (tile.slot === slotEl.dataset.slot) {           // 제자리
        slotEl.classList.add('filled');
        slotEl.innerHTML = '<span class="pv">' + (tile.label || tile.v) + '</span>';
        S.sel.disabled = true; S.sel.classList.remove('sel'); S.sel.classList.add('used');
        S.sel = null;
        S.filled++;
        app.sfx.tick();
        if (S.filled >= S.q.slots.length) {               // 완성
          S.done = true;
          app.markJudged();
          if (S.firstTry) {
            app.tally(S.q.type, true);
            if (app.mode !== 'class') app.addScore(1);
          }
          if (app.mode === 'class') app.teamScore(S.turn, 1);
          app.sfx.win();
          if (typeof spec.reveal === 'function') spec.reveal(app, S.q);
          app.explain(S.q.explain, true);
          setTimeout(next, W_OK);
        }
        return;
      }
      // 엉뚱한 자리
      S.firstTry = false;
      S.miss++;
      app.tally(S.q.type, false);
      app.sfx.bad();
      app.shake(S.sel);
      slotEl.classList.add('bad');
      setTimeout(function () { slotEl.classList.remove('bad'); }, 420);
      if (app.mode === 'class' && S.miss % 2 === 0) {
        S.turn = 1 - S.turn;
        app.el('#pin-prompt').textContent = app.teams[S.turn].name + ' 차례로 넘어갑니다!';
        app.el('#pin-prompt').className = 'turn t' + S.turn;
      }
    }

    function next() {
      if (i >= N) return app.finish({});
      S = { q: gen.next(), filled: 0, miss: 0, done: false, firstTry: true, sel: null, turn: (i % 2) };
      i++;
      app.setProg(i, N);
      app.clearExplain();
      app.hideAnswers();
      render();
    }

    app.onSkip(function () { if (S && !S.done) next(); });
    next();
  }

  window.MapPin = { run: run, version: '1.0.0' };
})();
