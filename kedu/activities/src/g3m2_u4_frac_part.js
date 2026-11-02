/* src/g3m2_u4_frac_part.js — 분수 소수 배달부 (3학년 2학기 수학 4단원 「분수와 소수」 l02~l10)
 * 장르: duel_quiz(stream) · 생성기: frac_part
 *
 * 「반지름 지름 배달부」 다음 판. 이 단원에서 아이가 잃는 것은 **무엇과 견주는가**다 —
 * 정본 「이런 생각을 조심해요」가 모두 그 이야기(부분끼리 견줌 3/4 · 분자를 그대로 답 3 · 분모·분자 구실을 바꿈 ·
 * 2·3/4 → 7/4 · 분수 부분부터 견줌 · 2.9 → 0.1이 9개 · 소수점 오른쪽만 견줌 · 「분수와 소수는 견줄 수 없다」). 그 값이 그대로 선택지다.
 * 무대 = 식 한 장 + (분수만큼 판엔) 띠 한 줄 — 분모만큼 똑같이 나눈 띠만 그어 두고, 정답을 열면 분자만큼 칸이 초록으로 칠해진다.
 * 정답을 열면 덩이 줄(정본 말 「분모만큼 묶고 분자만큼 센다 · 자연수 1은 분모만큼 · 자연수 부분부터」)이 펴진다.
 * 범위(upto)는 2차시부터 그 차시까지 — 케이티처가 차시마다 알맞은 범위를 넣어 준다(map.paramsByLesson).
 */
(function () {
  'use strict';
  ACore.create({
    activityId: 'g3m2_u4_frac_part',
    title: '🍰 분수 소수 배달부',
    subtitle: '전체와 견주고 · 분모만큼 묶고 · 자연수 부분부터!',
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
        '<svg id="mb-fig" viewBox="0 0 240 46" aria-hidden="true"></svg>' +
        '<div id="mb-parts"></div>' +
      '</div>',
    onStart: function (app) {
      var gen = GENS['frac_part'].create({ upto: app.settings.upto }, app.rng);
      var TAG = {
        part_whole: '전체와 견주어요', group_frac: '묶어서 분수로', of_count: '분수만큼은 몇 개', of_len: '길이·시간의 분수만큼',
        whole_frac: '자연수를 분수로', improper_pick: '진분수 · 가분수', mix_to_imp: '대분수 → 가분수', imp_to_mix: '가분수 → 대분수',
        cmp_frac: '분수 크기 견주기', dec_count: '0.1이 몇 개', cm_mm: 'cm와 mm', cmp_dec: '소수 크기 견주기', cmp_fd: '분수와 소수 견주기'
      };
      var NS = 'http://www.w3.org/2000/svg';
      function el(tag, at, txt) {
        var e = document.createElementNS(NS, tag);
        for (var k in at) e.setAttribute(k, at[k]);
        if (txt != null) e.textContent = txt;
        return e;
      }
      /* 띠 — 분모만큼 똑같이 나눈 칸만 긋는다. 정답을 열면 분자만큼 칸을 칠하고 한 칸의 값을 적는다. */
      function drawStrip(q, open) {
        var F = app.el('#mb-fig');
        F.innerHTML = '';
        if (!q.strip) { F.style.display = 'none'; return; }
        F.style.display = '';
        var s = q.strip, W = 232, x0 = 4, w = W / s.b;
        for (var i = 0; i < s.b; i++) {
          F.appendChild(el('rect', { x: x0 + i * w, y: 4, width: w, height: 26, 'class': open && i < s.a ? 'on' : 'off' }));
          if (open && s.b <= 8) F.appendChild(el('text', { x: x0 + i * w + w / 2, y: 22, 'text-anchor': 'middle' }, s.per));
        }
        F.appendChild(el('rect', { x: x0, y: 4, width: W, height: 26, 'class': 'rim' }));
        F.appendChild(el('text', { x: x0 + W / 2, y: 44, 'text-anchor': 'middle', 'class': 'cap' }, '전체 ' + s.tot + (s.unit === '개' || s.unit === '장' || s.unit === '시간' ? s.unit : ' ' + s.unit)));
      }

      Stream.run(app, gen, {
        render: function (app, q) {
          var Q = app.el('#mb-q');
          Q.className = q.wordy ? 'word' : (q.cmp ? 'cmp' : 'calc');
          Q.textContent = q.prompt;
          app.el('#mb-tag').textContent = TAG[q.type] || '';
          drawStrip(q, false);
          var P = app.el('#mb-parts');
          P.innerHTML = ''; P.style.display = 'none';
        },
        reset: function (app) { app.el('#mb').classList.remove('ok'); },
        // 말 답(「두 수가 같아요」·「견줄 수 없어요」)은 폰 세로에서 두 덩이로 쌓는다(css) — 넷이 한 줄
        options: function (q) { return q.options.map(function (o) {
          var i = o.lastIndexOf(' ');
          if (i < 0) return { pick: o, label: o };
          return { pick: o, label: '<span class="r1">' + o.slice(0, i) + '</span><span class="r2"> ' + o.slice(i + 1) + '</span>' };
        }); },
        reveal: function (app, q) {
          app.el('#mb').classList.add('ok');
          drawStrip(q, true);
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
