/* src/g1m_u4_heavier.js — 무엇이 더 무거울까? (1학년 수학 4단원, 비교하기)
 * 장르: balance(stream) · 생성기: compare_weight
 * §10-2 확장 검증: 저울 무대는 그대로, **생성기만 교체**해서 수 비교 → 무게 비교가 되는가. → 된다.
 * 달라진 것은 접시에 올라가는 것뿐(숫자 카드 → 물건). 루프·판정·수첩·제출은 손대지 않았다.
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
          '<text x="110" y="170" text-anchor="middle" class="thing-ico" id="icoL">?</text>' +
          '<text x="110" y="236" text-anchor="middle" class="thing-name" id="nameL"></text>' +
        '</g>' +
        '<g id="pan-right">' +
          '<line x1="530" y1="90" x2="490" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<line x1="530" y1="90" x2="570" y2="196" stroke="#92400e" stroke-width="5"/>' +
          '<rect x="460" y="196" width="140" height="14" rx="7" fill="#f59e0b"/>' +
          '<text x="530" y="170" text-anchor="middle" class="thing-ico" id="icoR">?</text>' +
          '<text x="530" y="236" text-anchor="middle" class="thing-name" id="nameR"></text>' +
        '</g>' +
      '</g>' +
    '</svg>';

  ACore.create({
    activityId: 'g1m_u4_heavier',
    title: '⚖️ 무엇이 더 무거울까?',
    subtitle: '커 보인다고 무거운 건 아니에요 — 저울에게 물어봐요',
    defaults: { n: 10, why: 0 },
    settings: [
      { key: 'n', label: '문제 수', options: [{ v: 5, label: '5' }, { v: 10, label: '10' }, { v: 15, label: '15' }] }
    ],
    stageHtml: STAGE,
    onStart: function (app) {
      var gen = GENS['compare_weight'].create({}, app.rng);
      Stream.run(app, gen, {
        render: function (app, q) {
          app.el('#icoL').textContent = q.L.i;
          app.el('#icoR').textContent = q.R.i;
          app.el('#nameL').textContent = q.L.n;
          app.el('#nameR').textContent = q.R.n;
          // 보이는 크기 — size_trap이 성립하려면 "커 보이는 것"이 실제로 커 보여야 한다
          app.el('#icoL').setAttribute('font-size', 26 + q.L.s * 9);
          app.el('#icoR').setAttribute('font-size', 26 + q.R.s * 9);
        },
        reset: function (app) { app.el('#beam-g').style.transform = 'rotate(0deg)'; },
        options: function () {
          return [{ pick: 'L', label: '⬅ 왼쪽' }, { pick: 'E', label: '🟰 같아요' }, { pick: 'R', label: '오른쪽 ➡' }];
        },
        reveal: function (app, q) {
          var deg = q.answer === 'E' ? 0 : (q.answer === 'L' ? -9 : 9);   // 무거운 쪽이 내려간다
          app.el('#beam-g').style.transform = 'rotate(' + deg + 'deg)';
        }
      });
    }
  });
})();
