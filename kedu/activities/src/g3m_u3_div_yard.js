/* src/g3m_u3_div_yard.js — 나눔 마당 (3학년 수학 3단원 나눗셈, l02·l03)
 * 장르: bundle — 무대형(자체 루프). g1m_u5_bundle의 골격을 물려받아 묶음 크기를 연다 (D23).
 * 교육 목적(§10-3): 나눗셈의 신체화. 계산이 아니라 조작이 본체다 —
 * 등분제는 "접시에 번갈아 담아 봐야", 포함제는 "몇 개씩 묶어 덜어내 봐야" 몸에 남는다.
 *
 * 세 문항 종류 (stage 설정):
 *  share  등분제 — 접시를 탭하면 더미에서 1개가 담긴다. 접시 안을 탭하면 되돌린다.
 *         [다 나눴어요] → 남았거나 접시가 다르면 share_uneven (등분 오개념의 실체),
 *         똑같으면 "한 접시에 몇 개씩?" 판정 (class는 팀 선점제).
 *  group  포함제 — 낱개를 per개 골라 [per개씩 묶기]. per 미달 묶기 = wrong_done,
 *         per 초과 고르기 = over_pick. 다 덜어내면 "몇 묶음?" 판정.
 *  which  구별 — 조작 없이 상황을 읽고 등분·포함을 가른다 (l03 정리의 비교 학습).
 *         두 계산을 다 맞히면서도 상황을 구별 못 하는 아이가 이 유형에서 보인다.
 */
(function () {
  'use strict';

  var app = ACore.create({
    activityId: 'g3m_u3_div_yard',
    title: '🍪 나눔 마당',
    subtitle: '똑같이 나누고, 묶어 덜어내요',
    defaults: { stage: 'mix', n: 5 },
    settings: [
      { key: 'stage', label: '나누기', options: [
        { v: 'share', label: '똑같이 나누기' }, { v: 'group', label: '묶어 덜어내기' }, { v: 'mix', label: '섞기' }] },
      { key: 'n', label: '문제 수', options: [{ v: 3, label: '3' }, { v: 5, label: '5' }, { v: 8, label: '8' }] }
    ],
    stageHtml:
      '<div id="yard">' +
        '<div id="task" class="num"></div>' +
        '<div id="plates"></div>' +
        '<div id="shelf"></div>' +
        '<div id="loose-wrap"><div id="loose"></div></div>' +
        '<div id="tools">' +
          '<div class="pill sel" id="sel-pill">고른 개수 <span class="num" id="sel-n">0</span> / <span class="num" id="per-n"></span></div>' +
          '<button class="btn" id="tie-btn">🎀 묶기</button>' +
          '<button class="btn" id="done-btn">✋ 다 나눴어요</button>' +
        '</div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['div_intro'].create({ stage: app.settings.stage }, app.rng);
      var N = app.settings.n, i = 0;
      var S = null;

      function itemHtml(emo, k) { return '<button class="cookie" data-k="' + k + '">' + emo + '</button>'; }
      var EMO = { '쿠키': '🍪', '딸기': '🍓', '연필': '✏️', '구슬': '🔮', '사탕': '🍬', '달걀': '🥚', '귤': '🍊', '색종이': '🟧' };
      function emo() { return EMO[S.p.item.thing] || '🍪'; }

      // ── 등분제 무대 ─────────────────────────────────────────
      function renderShare() {
        var html = '';
        for (var b = 0; b < S.p.plates; b++) {
          html += '<button class="plate" data-b="' + b + '"><div class="dish">🫙</div>' +
                  '<div class="in" id="pin-' + b + '"></div>' +
                  '<div class="cnt num" id="pcnt-' + b + '">0</div></button>';
        }
        app.el('#plates').innerHTML = html;
        Array.prototype.forEach.call(document.querySelectorAll('#plates .plate'), function (pl) {
          pl.addEventListener('click', function () { putOne(+pl.dataset.b); });
        });
        drawPile();
      }
      function drawPile() {
        var html = '';
        for (var k = 0; k < S.loose; k++) html += itemHtml(emo(), k);
        app.el('#loose').innerHTML = html;
        if (S.kind === 'share') {
          // 접시판에서는 더미를 탭할 일이 없다 — 접시가 버튼이다
          Array.prototype.forEach.call(document.querySelectorAll('#loose .cookie'), function (b) {
            b.disabled = true;
          });
        } else {
          Array.prototype.forEach.call(document.querySelectorAll('#loose .cookie'), function (b) {
            b.addEventListener('click', function () { toggle(b); });
          });
          updateSel();
        }
      }
      function putOne(b) {
        if (S.done || S.reading || S.kind !== 'share') return;
        if (S.loose <= 0) return;
        S.loose--; S.in[b]++;
        app.sfx.tick();
        app.el('#pin-' + b).innerHTML += '<span class="mini">' + emo() + '</span>';
        app.el('#pcnt-' + b).textContent = S.in[b];
        drawPile();
      }
      // 접시 안 탭 → 하나 되돌리기 (실수 복구 — 판정 아님)
      function backOne(b) {
        if (S.done || S.reading || S.in[b] <= 0) return;
        S.in[b]--; S.loose++;
        var box = app.el('#pin-' + b);
        box.removeChild(box.lastChild);
        app.el('#pcnt-' + b).textContent = S.in[b];
        drawPile();
      }

      // ── 포함제 무대 (bundle 골격 — 묶음 크기 = per) ─────────
      function renderShelf() {
        var html = '';
        for (var g = 0; g < S.groups; g++) {
          html += '<div class="bundle pop"><div class="rope">🎀</div>' +
                  '<div class="ten">' + Array(S.p.per + 1).join(emo()) + '</div>' +
                  '<div class="cap num">' + S.p.per + '</div></div>';
        }
        app.el('#shelf').innerHTML = html;
      }
      function selected() { return document.querySelectorAll('#loose .cookie.on'); }
      function updateSel() {
        var n = selected().length;
        app.el('#sel-n').textContent = n;
        app.el('#tie-btn').classList.toggle('ready', n === S.p.per);
      }
      function toggle(b) {
        if (S.done || S.reading) return;
        if (!b.classList.contains('on') && selected().length >= S.p.per) {
          app.tally('over_pick', false);          // §10-3 묶음 크기를 넘게 고름
          app.sfx.bad();
          app.el('#loose').classList.add('shake-box');
          setTimeout(function () { app.el('#loose').classList.remove('shake-box'); }, 450);
          app.explain('한 묶음은 딱 ' + S.p.per + '개예요. 더 담을 수 없어요!', false);
          return;
        }
        b.classList.toggle('on');
        app.sfx.tick();
        updateSel();
      }

      app.el('#tie-btn').addEventListener('click', function () {
        if (!S || S.done || S.reading || S.kind !== 'group') return;
        var sel = selected();
        if (sel.length !== S.p.per) {
          app.tally('wrong_done', false);         // §10-3 다 안 채우고 묶음 완성
          app.sfx.bad();
          app.explain(S.p.per + '개를 다 모아야 한 묶음이 돼요. 지금은 ' + sel.length + '개!', false);
          return;
        }
        app.clearExplain();
        app.sfx.good();
        S.groups++; S.loose -= S.p.per;
        renderShelf(); drawPile();
        if (S.loose < S.p.per) askRead();         // 더는 못 덜어낸다 → 읽기 판정
      });

      app.el('#done-btn').addEventListener('click', function () {
        if (!S || S.done || S.reading || S.kind !== 'share') return;
        var uneven = false;
        for (var b = 1; b < S.p.plates; b++) if (S.in[b] !== S.in[0]) uneven = true;
        if (S.loose > 0 || uneven) {
          app.tally('share_uneven', false);       // 등분 오개념 — 남기거나 다르게 담고 끝냄
          app.sfx.bad();
          app.explain(S.loose > 0
            ? '아직 ' + S.loose + '개가 남았어요 — 남김없이 똑같이 나눠요!'
            : '접시마다 개수가 달라요 — "똑같이" 나눠야 나눗셈이에요!', false);
          return;
        }
        askRead();
      });

      // ── 읽기 판정 (class는 팀 선점제 — bundle 그대로) ───────
      function askRead() {
        S.reading = true;
        app.el('#tools').style.display = 'none';
        app.explain(S.p.prompt, true);
        var labelOf = function (o) { return S.p.labels ? S.p.labels[o] : o + (S.kind === 'share' ? '개씩' : '묶음'); };
        app.answers(S.p.options.map(function (o) { return { pick: o, label: labelOf(o) }; }), onRead);
        app.unlockAnswers();
      }
      function onRead(pick, teamIdx, btn) {
        if (!S || S.done || !S.reading) return;
        var ok = (pick === S.p.answer);
        if (app.mode === 'assign') {
          app.detail.push({ q: S.p.task, a: S.p.answer, pick: pick, ok: ok, type: S.p.type, ms: Date.now() - S.t0 });
        }
        if (ok) {
          S.done = true;
          app.markJudged();                       // §6-8 문항 종결
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
          if (S.teamLocked[0] && S.teamLocked[1]) {   // 양팀 오답 → 정답 공개, 무득점
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
        S = { p: gen.next(), done: false, reading: false, firstTry: true,
              teamLocked: [false, false], t0: Date.now() };
        S.kind = S.p.kind;
        i++;
        app.setProg(i, N);
        app.clearExplain();
        app.hideAnswers();
        app.el('#task').textContent = S.p.task;
        app.el('#plates').innerHTML = '';
        app.el('#shelf').innerHTML = '';
        app.el('#loose').innerHTML = '';
        if (S.kind === 'share') {
          S.loose = S.p.total;
          S.in = []; for (var b = 0; b < S.p.plates; b++) S.in.push(0);
          renderShare();
          app.el('#tools').style.display = 'flex';
          app.el('#sel-pill').style.display = 'none';
          app.el('#tie-btn').style.display = 'none';
          app.el('#done-btn').style.display = '';
          // 접시 안 탭으로 되돌리기 — 위임 한 번만
          app.el('#plates').addEventListener('click', function (ev) {
            var mini = ev.target.closest && ev.target.closest('.mini');
            if (!mini) return;
            var pl = ev.target.closest('.plate');
            if (pl) { ev.stopPropagation(); backOne(+pl.dataset.b); }
          }, true);
        } else if (S.kind === 'group') {
          S.loose = S.p.total; S.groups = 0;
          app.el('#per-n').textContent = S.p.per;
          app.el('#tie-btn').textContent = '🎀 ' + S.p.per + '개씩 묶기';
          drawPile(); renderShelf();
          app.el('#tools').style.display = 'flex';
          app.el('#sel-pill').style.display = '';
          app.el('#tie-btn').style.display = '';
          app.el('#done-btn').style.display = 'none';
          updateSel();
        } else {                                  // which — 조작 없이 바로 판정
          S.loose = 0;
          app.el('#tools').style.display = 'none';
          askRead();
        }
      }

      app.onSkip(function () { if (S && !S.done) next(); });   // §6-8 넘기기 = 판정 없이 다음
      next();
    }
  });
})();
