/* src/g6m2_u5_circle_duel.js — 원의 둘레와 넓이 겨루기 (6학년 2학기 수학 5단원 「원의 둘레와 넓이」 l02~l10 · 교과서판 2학기 트랙 2026-11-09)
 * 장르: duel_quiz(stream) · 생성기: g6_2_circle_duel
 *
 * 6-2 수학 다섯째 대표 활동(1단원 relay · 2단원 claim_judge · 3단원 balance · 4단원 sort 와 장르 다름).
 * 이 단원에서 아이가 잃는 것은 **어느 길이로 셈하느냐**다 — 반지름에 바로 원주율 · 넓이를 원주 식으로 · 지름을 두 번 곱함 ·
 * 고리를 반지름의 차로 · 반지름 3배면 넓이 6배(지도서 320·336~339 오답 유형). 그 값이 그대로 선택지다.
 * 무대 = 갈래 띠 + 식 한 장. 정답을 열면 덩이 줄(정본 말 「(원주) = (지름) × (원주율)」 「(반지름) × (반지름) × (원주율)」)이 펴진다.
 * 수는 모두 교과서·『수학익힘』·지도서 수 · 원주율 3.14 · 범위(upto)는 2차시부터 그 차시까지(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g6m2_u5_circle_duel',
    title: '⭕ 원의 둘레와 넓이 겨루기',
    subtitle: '원주는 지름 × 3.14 · 넓이는 반지름 × 반지름 × 3.14 — 어느 길이인지 먼저!',
    defaults: { upto: 'all', n: 10 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l02', label: '2차시까지' },
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7차시까지' },
        { v: 'l08', label: '8차시까지' },
        { v: 'l09', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml:
      '<div id="mb">' +
        '<div id="mb-tag"></div>' +
        '<div id="mb-q"></div>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['g6_2_circle_duel'].create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        hex: '원 안 정육각형의 둘레', sq: '원 밖 정사각형의 둘레', ratio: '원주율', circ_d: '지름 → 원주', circ_r: '반지름 → 원주',
        dia: '원주 → 지름', est_in: '넓이 어림 — 원 안', est_out: '넓이 어림 — 원 밖', area_r: '반지름 → 넓이', area_d: '지름 → 넓이',
        ring: '고리 모양의 넓이', poly: '원 안쪽 정다각형', kk: '반지름이 몇 배면'
      };
      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = q.wordy ? 'word' : 'calc';
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { app.el('#mb').classList.remove('ok'); },
        options: function (q) { return q.options.map(function (o) { return { pick: o, label: o }; }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
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
