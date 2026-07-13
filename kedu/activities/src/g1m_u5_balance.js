/* src/g1m_u5_balance.js — 도토리 저울 대결 (1학년 수학 5단원, 수130-131)
 * 장르: stream · 생성기: compare50
 * 이 파일에 있는 것은 무대(저울)와 연출뿐이다. 루프·점수·수첩·제출은 core/stream이 처리한다.
 */
(function () {
  'use strict';

  var STAGE =
    '<svg id="scale" viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" aria-label="저울">' +
      '<rect x="304" y="84" width="32" height="252" rx="10" fill="#b45309"/>' +
      '<rect x="225" y="330" width="190" height="26" rx="13" fill="#92400e"/>' +
      '<g id="beam-g">' +
        '<rect x="90" y="76" width="460" height="16" rx="8" fill="#d97706"/>' +
        '<circle cx="320" cy="84" r="15" fill="#78350f"/>' +
        /* 왼쪽: 줄 → 접시 → 접시 위 대형 숫자 카드 (§6-3 판독 우선) */
        '<g id="pan-left">' +
          '<line x1="110" y1="90" x2="70" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<line x1="110" y1="90" x2="150" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<rect x="40" y="196" width="140" height="14" rx="7" fill="#f59e0b"/>' +
          '<rect x="48" y="104" width="124" height="88" rx="16" fill="#ffffff" stroke="#d97706" stroke-width="4"/>' +
          '<text x="110" y="170" text-anchor="middle" class="pan-num" id="numL">?</text>' +
          '<text x="110" y="236" text-anchor="middle" font-size="24">🌰🌰🌰</text>' +
        '</g>' +
        '<g id="pan-right">' +
          '<line x1="530" y1="90" x2="490" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<line x1="530" y1="90" x2="570" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<rect x="460" y="196" width="140" height="14" rx="7" fill="#f59e0b"/>' +
          '<rect x="468" y="104" width="124" height="88" rx="16" fill="#ffffff" stroke="#d97706" stroke-width="4"/>' +
          '<text x="530" y="170" text-anchor="middle" class="pan-num" id="numR">?</text>' +
          '<text x="530" y="236" text-anchor="middle" font-size="24">🌰🌰🌰</text>' +
        '</g>' +
      '</g>' +
    '</svg>';

  var app = ACore.create({
    activityId: 'g1m_u5_balance',
    title: '🌰 도토리 저울 대결',
    subtitle: '어느 쪽 도토리 수가 더 클까? 저울로 판정해요!',
    defaults: { range: 50, n: 10, why: 0 },
    legacyRecordKeys: ['kedu_balance_best_v1'],   // 단일파일 시절 기록 승계
    settings: [
      { key: 'range', label: '수 범위', options: [{ v: 20, label: '20까지' }, { v: 50, label: '50까지' }, { v: 100, label: '100까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] },
      { key: 'why', label: '왜 그럴까 보너스', options: [{ v: 0, label: '끄기' }, { v: 1, label: '켜기' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['compare50'].create({ range: app.settings.range }, app.rng);
      Stream.run(app, gen, {
        render: function (app, p) {
          app.el('#numL').textContent = p.a;
          app.el('#numR').textContent = p.b;
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
            { v: 'tens', label: '십의 자리가 달라요' },
            { v: 'ones', label: '십의 자리가 같아서 낱개를 봤어요' },
            { v: 'equal', label: '두 수가 같아요' }
          ],
          answerOf: function (p) { return p.whyAns; }
        }
      });
    }
  });
})();
