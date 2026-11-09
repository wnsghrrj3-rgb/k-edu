/* src/g5m2_u2_mul_balance.js — 곱 저울 (5학년 2학기 수학 2단원 「분수의 곱셈」 l03 · l04 · l05 · l06 · l07 · l08 · l09 마무리) — 교과서판 2학기 대표 활동
 * 장르: balance(stream) · 생성기: g5_2_mul_balance · 무대 = g6m2_u3_div_balance 저울 그대로(접시 글만 곱셈)
 *
 * 저울의 두 접시에 교과서·익힘·지도서의 곱셈(또는 수)을 올리고 값이 더 큰 쪽을 고른다 — 『수학』 41쪽 ③ 「계산 결과가 5보다 큰 것」 · 수업 전 확인 「○ 안에 >, =, <」를 저울로.
 * 왼쪽 접시 = 파랑, 오른쪽 접시 = 주황. 판정 전 저울은 수평(답을 흘리지 않음). 정답을 열면 접시에 값이 뜨고 큰 쪽으로 기운다.
 * 갈래: 곱과 수(곱하는 수를 1과 견주기) · 두 식의 값 · 같은 값일까(곱하는 순서 바꾸기 · 문제로 마무리 ④) · 몇 배 한 양 · 진분수를 곱하면.
 * 범위(upto)는 3차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson). 5학년 = 인물 없이.
 */
(function () {
  'use strict';
  var COL = { L: '#1F5FA8', R: '#D35400' };
  function pan(side, x) {
    return '<g id="pan-' + side + '">' +
      '<line x1="' + x + '" y1="90" x2="' + (x - 40) + '" y2="186" stroke="#92400e" stroke-width="5"/>' +
      '<line x1="' + x + '" y1="90" x2="' + (x + 40) + '" y2="186" stroke="#92400e" stroke-width="5"/>' +
      '<rect x="' + (x - 70) + '" y="186" width="140" height="14" rx="7" fill="#f59e0b"/>' +
      '<rect x="' + (x - 92) + '" y="100" width="184" height="82" rx="16" fill="#ffffff" stroke="' + COL[side] + '" stroke-width="5"/>' +
      '<text x="' + x + '" y="134" text-anchor="middle" class="pan-a" id="t' + side + '1">?</text>' +
      '<text x="' + x + '" y="166" text-anchor="middle" class="pan-b" id="t' + side + '2"></text>' +
      '<text x="' + x + '" y="236" text-anchor="middle" class="pan-res" id="r' + side + '"></text>' +
    '</g>';
  }
  var STAGE =
    '<div id="cs">' +
      '<div id="cs-tag"></div>' +
      '<div id="cs-ask"></div>' +
      '<svg id="scale" viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg" aria-label="저울">' +
        '<rect x="304" y="84" width="32" height="150" rx="10" fill="#b45309"/>' +
        '<rect x="225" y="228" width="190" height="24" rx="12" fill="#92400e"/>' +
        '<g id="beam-g">' +
          '<rect x="90" y="76" width="460" height="16" rx="8" fill="#d97706"/>' +
          '<circle cx="320" cy="84" r="15" fill="#78350f"/>' +
          pan('L', 120) + pan('R', 520) +
        '</g>' +
      '</svg>' +
    '</div>';

  function fit(t, s, big) { t.textContent = s; t.style.fontSize = Math.min(big, Math.floor(172 / Math.max(1, String(s).length) * 1.15)) + 'px'; }   /* 접시 폭(184)에 글 맞추기 */

  ACore.create({
    activityId: 'g5m2_u2_mul_balance',
    title: '⚖️ 곱 저울',
    subtitle: '두 접시의 곱 — 값이 더 큰 쪽으로 기울어요. 곱하는 수가 1보다 작으면? 1보다 크면?',
    defaults: { upto: 'all', n: 10, why: 0 },
    settings: [
      { key: 'upto', label: '범위', options: [
        { v: 'l03', label: '3차시까지' },
        { v: 'l04', label: '4차시까지' },
        { v: 'l05', label: '5차시까지' },
        { v: 'l06', label: '6차시까지' },
        { v: 'l07', label: '7·8차시까지' },
        { v: 'l08', label: '9차시까지' },
        { v: 'all', label: '단원 전체' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['g5_2_mul_balance'].create({ upto: app.settings.upto }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#cs-tag').textContent = q.tag || '';
          app.el('#cs-ask').textContent = q.prompt;
          fit(app.el('#tL1'), q.sa[0], 28); fit(app.el('#tL2'), q.sa[1], 18);
          fit(app.el('#tR1'), q.sb[0], 28); fit(app.el('#tR2'), q.sb[1], 18);
          app.el('#rL').textContent = ''; app.el('#rR').textContent = '';
        },
        reset: function (app) { app.el('#beam-g').style.transform = 'rotate(0deg)'; app.el('#cs').classList.remove('ok'); },   // 판정 전엔 수평
        options: function () {
          return [{ pick: 'L', label: '⬅ 왼쪽이 더' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '오른쪽이 더 ➡' }];
        },
        reveal: function (app, q) {
          var deg = q.answer === 'E' ? 0 : (q.answer === 'L' ? -8 : 8);   // 큰 쪽이 내려간다
          app.el('#beam-g').style.transform = 'rotate(' + deg + 'deg)';
          fit(app.el('#rL'), q.ra, 26); fit(app.el('#rR'), q.rb, 26);
          app.el('#cs').classList.add('ok');
        },
        why: {
          question: '🦉 어떻게 견주었어?',
          options: [
            { v: 'calc', label: '두 값을 계산해서 견주었어요' },
            { v: 'one', label: '곱하는 수를 1과 견주어 보았어요' },
            { v: 'swap', label: '곱하는 순서만 바꾼 식인지 보았어요' }
          ],
          answerOf: function (q) { return q.whyAns; }
        }
      });
    }
  });
})();
