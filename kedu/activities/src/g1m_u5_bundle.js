/* src/g1m_u5_bundle.js — 도토리 굴비 엮기 (1학년 수학 5단원, 수120-123)
 * 장르: bundle — 무대형(자체 루프). Stream을 쓰지 않고 ACore 부품 위에서 직접 굴린다.
 * 교육 목적(§10-3): 자릿값의 신체화. "10개를 손으로 묶어 봐야" 십의 자리가 몸에 남는다.
 *
 * 한 문항의 흐름
 *   ① 낱개 도토리 N개가 흩어져 있다 → 탭해서 10개를 고르고 [묶기]
 *   ② 10개 미만인데 묶기 = wrong_done · 10개를 넘겨 고르려 하면 over_pick (자릿값 오개념 두 신호)
 *   ③ 더 묶을 게 없으면 → "몇 묶음 몇 개?" 읽기 판정 (class는 팀 선점제)
 */
(function () {
  'use strict';

  var app = ACore.create({
    activityId: 'g1m_u5_bundle',
    title: '🌰 도토리 굴비 엮기',
    subtitle: '10개씩 묶어 세면 몇 묶음 몇 개?',
    defaults: { range: 50, n: 5 },
    settings: [
      { key: 'range', label: '수 범위', options: [{ v: 30, label: '30까지' }, { v: 50, label: '50까지' }, { v: 99, label: '99까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml:
      '<div id="yard">' +
        '<div id="bundles"></div>' +
        '<div id="loose-wrap"><div id="loose"></div></div>' +
        '<div id="tools">' +
          '<div class="pill sel">고른 개수 <span class="num" id="sel-n">0</span> / 10</div>' +
          '<button class="btn" id="tie-btn">🪢 10개 묶기</button>' +
        '</div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['count_bundle'].create({ range: app.settings.range }, app.rng);
      var N = app.settings.n, i = 0;
      var S = null;   // 문항 상태

      function dotHtml(k) { return '<button class="acorn" data-k="' + k + '">🌰</button>'; }

      function renderLoose() {
        var html = '';
        for (var k = 0; k < S.loose; k++) html += dotHtml(k);
        app.el('#loose').innerHTML = html;
        Array.prototype.forEach.call(document.querySelectorAll('#loose .acorn'), function (b) {
          b.addEventListener('click', function () { toggle(b); });
        });
        updateSel();
      }
      function renderBundles() {
        var html = '';
        for (var b = 0; b < S.bundles; b++) {
          html += '<div class="bundle pop"><div class="rope">🪢</div><div class="ten">🌰🌰🌰🌰🌰<br>🌰🌰🌰🌰🌰</div><div class="cap num">10</div></div>';
        }
        app.el('#bundles').innerHTML = html;
      }
      function selected() { return document.querySelectorAll('#loose .acorn.on'); }
      function updateSel() {
        var n = selected().length;
        app.el('#sel-n').textContent = n;
        app.el('#tie-btn').classList.toggle('ready', n === 10);
      }
      function toggle(b) {
        if (S.done) return;
        if (!b.classList.contains('on') && selected().length >= 10) {
          // §10-3 over_pick — 10개를 넘겨 담으려는 시도 = 자릿값 오개념 신호
          app.tally('over_pick', false);
          app.sfx.bad();
          app.el('#loose').classList.add('shake-box');
          setTimeout(function () { app.el('#loose').classList.remove('shake-box'); }, 450);
          app.explain('한 묶음은 딱 10개예요. 더 담을 수 없어요!', false);
          return;
        }
        b.classList.toggle('on');
        app.sfx.tick();
        updateSel();
      }

      app.el('#tie-btn').addEventListener('click', function () {
        if (!S || S.done) return;
        var sel = selected();
        if (sel.length !== 10) {
          // §10-3 wrong_done — 10개가 아닌데 묶으려는 시도
          app.tally('wrong_done', false);
          app.sfx.bad();
          app.explain('10개를 다 모아야 한 묶음이 돼요. 지금은 ' + sel.length + '개!', false);
          return;
        }
        app.clearExplain();
        app.sfx.good();
        S.bundles++; S.loose -= 10;
        renderBundles(); renderLoose();
        if (S.loose < 10) askRead();          // 더는 못 묶는다 → 읽기 판정으로
      });

      // ── 읽기 판정 (여기서 class는 팀 선점제)
      function askRead() {
        S.reading = true;
        app.explain('이제 세어 볼까요? ' + S.p.prompt, true);
        app.answers(S.p.options.map(function (o) {
          var t = o.split('-');
          return { pick: o, label: t[0] + '묶음 ' + t[1] + '개' };
        }), onRead);
        app.unlockAnswers();
      }
      function onRead(pick, teamIdx, btn) {
        if (!S || S.done || !S.reading) return;
        var ok = (pick === S.p.answer);
        if (app.mode === 'assign') {
          app.detail.push({ q: String(S.p.total), a: S.p.answer, pick: pick, ok: ok, type: S.p.type, ms: Date.now() - S.t0 });
        }
        if (ok) {
          S.done = true;
          app.markJudged();                                   // §6-8 문항 종결
          if (S.firstTry) { app.tally(S.p.type, true); if (app.mode !== 'class') app.addScore(1); }
          if (app.mode === 'class' && teamIdx != null) app.teamScore(teamIdx, 1);
          app.sfx.win();
          app.explain(S.p.explain, true);
          app.hideAnswers();
          setTimeout(next, app.mode === 'class' ? 2200 : 1600);
          return;
        }
        S.firstTry = false;
        app.tally(S.p.type, false);
        app.sfx.bad();
        if (app.mode === 'class' && teamIdx != null) {
          S.teamLocked[teamIdx] = true;
          app.lockTeam(teamIdx);
          if (S.teamLocked[0] && S.teamLocked[1]) {           // 양팀 오답 → 정답 공개, 무득점
            S.done = true;
            app.markJudged();
            app.explain(S.p.explain, false);
            app.hideAnswers();
            setTimeout(next, 2400);
          }
        } else {
          app.shake(btn);
        }
      }

      function next() {
        if (i >= N) return app.finish({});
        S = { p: gen.next(), bundles: 0, loose: 0, done: false, reading: false,
              firstTry: true, teamLocked: [false, false], t0: Date.now() };
        S.loose = S.p.total;
        i++;
        app.setProg(i, N);
        app.clearExplain();
        app.hideAnswers();
        renderBundles(); renderLoose();
        app.el('#tools').style.display = 'flex';
      }

      app.onSkip(function () { if (S && !S.done) next(); });   // §6-8 넘기기 = 판정 없이 다음
      next();
    }
  });
})();
