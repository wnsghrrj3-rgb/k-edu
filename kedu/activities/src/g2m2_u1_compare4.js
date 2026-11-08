/* src/g2m2_u1_compare4.js — 네 자리 수 카드 대결 (2학년 2학기 수학 1단원 7·8차시)
 * 장르: balance(stream) · 생성기: compare9999 — 2학년 1학기 「세 자리 수 저울」 무대를 그대로 쓰고 접시에 「나」·「짝」 이름만 붙였다.
 * 교과서판(2026-11-09): 『수학』 27쪽 「수의 크기를 비교하는 놀이」 — 나와 짝이 만든 네 자리 수를 저울에 올려 더 큰 수 쪽을 고른다.
 * 1인(solo)·수업(class)·과제(assign) 모두 같은 흐름(D58) — 혼자 해도 「나 ↔ 짝」 두 수를 견주는 판.
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
          '<text x="110" y="236" text-anchor="middle" class="pan-who">🙋 나</text>' +
        '</g>' +
        '<g id="pan-right">' +
          '<line x1="530" y1="90" x2="490" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<line x1="530" y1="90" x2="570" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<rect x="460" y="196" width="140" height="14" rx="7" fill="#f59e0b"/>' +
          '<rect x="454" y="104" width="152" height="88" rx="16" fill="#ffffff" stroke="#d97706" stroke-width="4"/>' +
          '<text x="530" y="170" text-anchor="middle" class="pan-num" id="numR">?</text>' +
          '<text x="530" y="236" text-anchor="middle" class="pan-who">🧑‍🤝‍🧑 짝</text>' +
        '</g>' +
      '</g>' +
    '</svg>';

  ACore.create({
    activityId: 'g2m2_u1_compare4',
    title: '⚖️ 네 자리 수 카드 대결',
    subtitle: '천의 자리부터 차례로 — 나와 짝 가운데 누가 더 큰 수를 만들었을까?',
    defaults: { book: 1, n: 10, why: 0 },
    settings: [
      { key: 'book', label: '첫 판', options: [{ v: 1, label: '교과서 수로 시작' }, { v: 0, label: '바로 수 카드' }] },
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['compare9999'].create({ book: app.settings.book }, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#numL').textContent = q.a;
          app.el('#numR').textContent = q.b;
        },
        reset: function (app) { app.el('#beam-g').style.transform = 'rotate(0deg)'; },
        options: function () {
          return [{ pick: 'L', label: '⬅ 내가 커요' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '짝이 커요 ➡' }];
        },
        reveal: function (app, q) {
          var deg = q.answer === 'E' ? 0 : (q.answer === 'L' ? -9 : 9);
          app.el('#beam-g').style.transform = 'rotate(' + deg + 'deg)';
        }
      });
    }
  });
})();
