/* src/g3m_u6_frac_balance.js — 분수 소수 저울 (3학년 수학 6단원 분수와 소수, l05·l06·l09)
 * 장르: balance(stream) · 생성기: frac_dec_compare
 * §10-2 확장 검증 4회차 — Stream 루프·판정·선택지·why 무수정. 무대 카드만 확장했다:
 *   숫자 한 개 → (분수 글리프 | 소수) + **길이가 같은 띠 모델** 병기 [D20].
 *   띠 길이가 양쪽 같은 것이 이 단원의 핵심이다 — 교과서 l05 "크기가 같은 전체에서 비교해요".
 */
(function () {
  'use strict';

  // 카드 한 장 = 분수 글리프 / 소수 글자 / 띠. 좌우가 완전히 같은 규격이라 길이 비교가 공정하다.
  function card(side, cx) {
    var x = cx - 84;                      // 카드 좌상단
    return '' +
      '<rect x="' + x + '" y="100" width="168" height="146" rx="16" fill="#ffffff" stroke="#d97706" stroke-width="4"/>' +
      '<g id="frac' + side + '">' +
        '<text x="' + cx + '" y="148" text-anchor="middle" class="pan-num" id="num' + side + '">1</text>' +
        '<line x1="' + (cx - 30) + '" y1="160" x2="' + (cx + 30) + '" y2="160" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>' +
        '<text x="' + cx + '" y="200" text-anchor="middle" class="pan-num" id="den' + side + '">2</text>' +
      '</g>' +
      '<text x="' + cx + '" y="186" text-anchor="middle" class="pan-dec" id="dec' + side + '" style="display:none">0.1</text>' +
      '<g id="bar' + side + '"></g>';
  }

  function pan(side, cx) {
    return '<g id="pan-' + (side === 'L' ? 'left' : 'right') + '">' +
      '<line x1="' + cx + '" y1="90" x2="' + (cx - 44) + '" y2="252" stroke="#92400e" stroke-width="5"/>' +
      '<line x1="' + cx + '" y1="90" x2="' + (cx + 44) + '" y2="252" stroke="#92400e" stroke-width="5"/>' +
      '<rect x="' + (cx - 74) + '" y="252" width="148" height="14" rx="7" fill="#f59e0b"/>' +
      card(side, cx) +
    '</g>';
  }

  var STAGE =
    '<svg id="scale" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" aria-label="저울">' +
      '<rect x="304" y="84" width="32" height="272" rx="10" fill="#b45309"/>' +
      '<rect x="225" y="350" width="190" height="26" rx="13" fill="#92400e"/>' +
      '<g id="beam-g">' +
        '<rect x="90" y="76" width="460" height="16" rx="8" fill="#d97706"/>' +
        '<circle cx="320" cy="84" r="15" fill="#78350f"/>' +
        pan('L', 110) +
        pan('R', 530) +
      '</g>' +
    '</svg>';

  var BAR_W = 140, BAR_H = 26, BAR_Y = 210;    // 띠는 양쪽 같은 길이 — 이게 이 단원의 전부다

  function drawBar(app, side, cx, s) {
    var x0 = cx - BAR_W / 2, w = BAR_W / s.den, out = '';
    for (var i = 0; i < s.den; i++) {
      out += '<rect x="' + (x0 + i * w).toFixed(2) + '" y="' + BAR_Y + '" width="' + w.toFixed(2) + '" height="' + BAR_H + '"' +
             ' fill="' + (i < s.num ? '#f59e0b' : '#fdf6e8') + '" stroke="#b45309" stroke-width="1.5"/>';
    }
    out += '<rect x="' + x0 + '" y="' + BAR_Y + '" width="' + BAR_W + '" height="' + BAR_H + '" rx="3" fill="none" stroke="#92400e" stroke-width="2.5"/>';
    app.el('#bar' + side).innerHTML = out;
  }

  function show(app, side, s, cx) {
    var isFrac = s.kind === 'frac';
    app.el('#frac' + side).style.display = isFrac ? '' : 'none';
    app.el('#dec' + side).style.display = isFrac ? 'none' : '';
    if (isFrac) {
      app.el('#num' + side).textContent = s.num;
      app.el('#den' + side).textContent = s.den;
    } else {
      app.el('#dec' + side).textContent = s.text;
    }
    drawBar(app, side, cx, s);
  }

  ACore.create({
    activityId: 'g3m_u6_frac_balance',
    title: '⚖️ 분수 소수 저울',
    subtitle: '길이가 같은 띠로 견주어요 — 어느 쪽이 더 클까?',
    defaults: { mix: 0, n: 10, why: 0 },
    settings: [
      { key: 'mix', label: '다루는 수', options: [{ v: 0, label: '분수·소수' }, { v: 1, label: '분수만' }, { v: 2, label: '소수만' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['frac_dec_compare'].create({ mix: app.settings.mix }, app.rng);
      Stream.run(app, gen, {
        render: function (app, p) {
          show(app, 'L', p.L, 110);
          show(app, 'R', p.R, 530);
        },
        reset: function (app) {
          app.el('#beam-g').style.transform = 'rotate(0deg)';   // 판정 전엔 수평 — 저울이 답을 흘리지 않는다
        },
        options: function () {
          return [{ pick: 'L', label: '⬅ 왼쪽' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '오른쪽 ➡' }];
        },
        reveal: function (app, p) {
          var deg = p.answer === 'E' ? 0 : (p.answer === 'L' ? -9 : 9);   // 큰 쪽이 내려간다
          app.el('#beam-g').style.transform = 'rotate(' + deg + 'deg)';
        },
        why: {
          question: '🦉 어떻게 알았어?',
          options: [
            { v: 'denom', label: '분모가 클수록 작아요' },
            { v: 'numer', label: '분모가 같아서 분자를 봤어요' },
            { v: 'tenths', label: '0.1이 몇 개인지 세었어요' },
            { v: 'equal', label: '두 수가 같아요' }
          ],
          answerOf: function (p) { return p.whyAns; }
        }
      });
    }
  });
})();
