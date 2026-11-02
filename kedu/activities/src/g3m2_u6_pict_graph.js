/* src/g3m2_u6_pict_graph.js — 그림그래프 배달부 (3학년 2학기 수학 6단원 「그림그래프」 l01~l07)
 * 장르: duel_quiz(stream) · 생성기: pict_graph
 *
 * 「들이 무게 배달부」 다음 판. 이 단원에서 아이가 잃는 것은 **그림의 크기**다 —
 * 정본 「이런 생각을 조심해요」가 모두 그 이야기(합계 25 = 가장 많은 수 · ㉠ ㉡ 그림 3개씩이니 같다 ·
 * 작은 그림부터 · 큰 그림을 10회로(22회) · 그림 개수(1 + 2 + 1 + 4 + 9 = 17) · 나가 그림이 적으니 산불도 적다).
 * 그 값이 그대로 선택지다.
 * 무대 = 묻는 글 한 장 + 표 또는 그림그래프 한 장(큰·작은 그림은 크기로만 다르고 수는 쓰지 않는다 — 그림 옆 단위는 아래 줄에).
 * 그릴 줄(?)은 정답을 열면 그림이 그려지고, 묻는 줄은 초록이 된다. 덩이 줄(정본 말 「큰 그림부터 · 단위를 먼저」)이 펴진다.
 * 범위(upto)는 1차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m2_u6_pict_graph',
    title: '📊 그림그래프 배달부',
    subtitle: '그림의 크기부터 · 큰 그림부터 · 합계로 확인!',
    defaults: { upto: 'all', n: 10 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l01', label: '1차시까지' },
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="mb">' +
        '<div id="mb-tag"></div>' +
        '<div id="mb-q"></div>' +
        '<div id="mb-fig" aria-hidden="true"></div>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var G = GENS['pict_graph'];
      var gen = G.create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        tbl_total: '표의 합계', tbl_miss: '합계로 모르는 수', pg_read10: '그림그래프 읽기', pg_read5: '5와 1로 읽기',
        pg_cmp3: '그림 수가 같아도', pg_most: '가장 많은 것', pg_diff: '몇 더 많을까', draw_big: '큰 그림 몇 개',
        draw_small: '작은 그림 몇 개', draw_3u: '세 가지 그림', pg_sum2: '두 줄 더하기', sv_more: '표에서 견주기',
        sv_double: '합계로 확인', sv_absent: '빠진 사람', sv_method: '조사 방법', draw5: '5와 1로 그리기',
        check_miss: '합계와 견주기', u_two: '단위가 다른 두 그래프', pic_gap: '그림 수의 차이', same_data: '같은 자료일까',
        big_sum: '건수 더하기'
      };
      function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
      /* 그림 줄 — 큰 그림(u0)부터. 크기만 다르고 수는 쓰지 않는다 */
      function icons(v, units, icon) {
        var c = G.pics(v, units), out = '';
        c.forEach(function (n, i) { for (var k = 0; k < n; k++) out += '<i class="u' + (units.length - 1 - i) + '">' + icon + '</i>'; });
        return out;
      }
      function legend(units, unit, icon) {
        return '<div class="pg-leg">' + units.map(function (u, i) {
          return '<span><i class="u' + (units.length - 1 - i) + '">' + icon + '</i> ' + u + unit + '</span>';
        }).join('') + '</div>';
      }
      function drawFig(q, open) {
        var F = app.el('#mb-fig'), f = q.fig, h = '';
        if (!f) { F.style.display = 'none'; F.innerHTML = ''; return; }
        F.style.display = '';
        if (f.k === 'tbl') {
          h += '<div class="pg-t">' + esc(f.title) + '</div><div class="tw"><table class="pt"><tr><th>' + esc(f.head) + '</th>';
          f.rows.forEach(function (r) { h += '<th>' + esc(r.name) + '</th>'; });
          if (f.total != null) h += '<th>합계</th>';
          h += '</tr><tr><th>' + f.unit + '</th>';
          f.rows.forEach(function (r) { h += '<td' + (r.v === '?' ? ' class="ask"' : '') + '>' + (r.v === '?' && open ? q.answer : r.v) + '</td>'; });
          if (f.total != null) h += '<td' + (f.total === '?' ? ' class="ask"' : '') + '>' + (f.total === '?' && open ? q.answer : f.total) + '</td>';
          h += '</tr></table></div>';
        } else if (f.k === 'pg2') {
          h += '<div class="pg-t">' + esc(f.title) + '</div><div class="pg2">';
          [['가', f.a], ['나', f.b]].forEach(function (s) {
            h += '<div class="pg-box"><div class="pg-lab">' + s[0] + '</div><div class="pg-row ask"><span class="pg-n">' + esc(f.name) + '</span><span class="pg-i">' +
                 icons(f.v, s[1], f.icon) + '</span></div>' + legend(s[1], f.unit, f.icon) + '</div>';
          });
          h += '</div>';
        } else {
          h += '<div class="pg-t">' + esc(f.title) + (f.label ? ' · ' + esc(f.label) : '') + '</div><div class="pg">';
          f.rows.forEach(function (r) {
            var body = r.hide && !open ? '<b class="qm">?</b>' : icons(r.v, f.units, f.icon);
            h += '<div class="pg-row' + (r.ask ? ' ask' : '') + '"><span class="pg-n">' + esc(r.name) + '</span><span class="pg-i">' + body + '</span></div>';
          });
          h += '</div>' + legend(f.units, f.unit, f.icon) + (f.note ? '<div class="pg-note">' + esc(f.note) + '</div>' : '');
        }
        F.innerHTML = h;
        F.classList.toggle('ok', !!open);
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = 'word';
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          drawFig(q, false);
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { var M = app.el('#mb'); if (M) M.classList.remove('ok'); },
        // 말 답(「㉡이 많아요」·「붙임딱지 붙이기」)은 끝 낱말 앞에서 두 덩이 — 폰 세로·두 팀 줄에서 위아래로
        options: function (q) { return q.options.map(function (o) {
          var i = o.lastIndexOf(' ');
          if (i < 0) return { pick: o, label: o };
          return { pick: o, label: '<span class="r1">' + o.slice(0, i) + '</span><span class="r2"> ' + o.slice(i + 1) + '</span>' };
        }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          drawFig(q, true);
          var P = app.el('#mb-parts');
          P.innerHTML = '';
          (q.parts || []).forEach(function (line, i, arr) {
            var d = document.createElement('div');
            d.className = 'prow' + (i === arr.length - 1 ? ' sum' : '');
            d.textContent = line;
            P.appendChild(d);
          });
          P.style.display = 'flex';
        }
      });
    }
  });
})();
