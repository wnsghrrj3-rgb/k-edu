/* src/g2m_u1_compare.js — 세 자리 수 저울 (2학년 수학 1단원)
 * 장르: balance(stream) · 생성기: compare999
 * §10-2 확장 검증 3회차 — 저울 무대·루프 무수정, 생성기만 교체.
 * 1학년 저울(50까지) → 2학년 저울(999까지)이 파일 하나 없이 성립한다.
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
        '<g id="pan-left">' +
          '<line x1="110" y1="90" x2="70" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<line x1="110" y1="90" x2="150" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<rect x="40" y="196" width="140" height="14" rx="7" fill="#f59e0b"/>' +
          '<rect x="34" y="104" width="152" height="88" rx="16" fill="#ffffff" stroke="#d97706" stroke-width="4"/>' +
          '<text x="110" y="170" text-anchor="middle" class="pan-num" id="numL">?</text>' +
        '</g>' +
        '<g id="pan-right">' +
          '<line x1="530" y1="90" x2="490" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<line x1="530" y1="90" x2="570" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<rect x="460" y="196" width="140" height="14" rx="7" fill="#f59e0b"/>' +
          '<rect x="454" y="104" width="152" height="88" rx="16" fill="#ffffff" stroke="#d97706" stroke-width="4"/>' +
          '<text x="530" y="170" text-anchor="middle" class="pan-num" id="numR">?</text>' +
        '</g>' +
      '</g>' +
    '</svg>';

  ACore.create({
    activityId: 'g2m_u1_compare',
    title: '⚖️ 세 자리 수 저울',
    subtitle: '백의 자리부터 차례로 — 어느 수가 더 클까?',
    defaults: { range: 999, n: 10, why: 0 },
    settings: [
      { key: 'range', label: '수 범위', options: [{ v: 500, label: '500까지' }, { v: 999, label: '999까지' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['compare999'].create({ range: app.settings.range }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#numL').textContent = q.a;
          app.el('#numR').textContent = q.b;
        },
        reset: function (app) { app.el('#beam-g').style.transform = 'rotate(0deg)'; },
        options: function () {
          return [{ pick: 'L', label: '⬅ 왼쪽' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '오른쪽 ➡' }];
        },
        reveal: function (app, q) {
          var deg = q.answer === 'E' ? 0 : (q.answer === 'L' ? -9 : 9);
          app.el('#beam-g').style.transform = 'rotate(' + deg + 'deg)';
        }
      });
    }
  });
})();
