/* proj_switch.js — 자기주도 바꿔치기 스위치 (48차 · 52차 배정 링크, 베프)
   한 줄: 단원 목록(gradeN/semesterN/과목/index.html)의 차시 카드 주소를, 켜 둔 단원만 투영 무대(learn.html)로 돌린다.
   · 원문 파일은 그대로 — 되돌리기 = 아래 ON 에서 단원을 빼면 끝.
   · 켜는 단위 = 단원('g3s2_math:u1'). 지도(projmap.js)에 없는 차시는 원문 그대로.
   · 「▶ 이어서 하기」 카드(kedu_next.js)도 같이 돌린다 → 목록에서 projmap.js 뒤, kedu_next.js 뒤에 싣는다.
   · 끄고 보기: 목록 주소에 ?proj=off (점검용)
   · 52차: window.KT2_PROJ.to(원문 주소) — 같은 ON 표로 투영 주소를 돌려준다(없으면 null).
     케이박스 받은 박스(classwork/inbox.html)가 선생님이 담은 자기주도 차시를 열 때 이것으로 돌린다
     (DB 에 담긴 주소는 원문 그대로 · 켠 단원만 · 끄면 곧바로 원문).                                        */
(function () {
  'use strict';
  var ON = ['g3s2_math:u1', 'g1s2_math:u1', 'g1s2_korean:u1', 'g1s2_math:u2', 'g1s2_math:u3', 'g1s2_korean:u2', 'g1s2_math:u4', 'g1s2_korean:u3', 'g1s2_math:u5', 'g1s2_korean:u4', 'g1s2_math:u6']; // 130차(수학) — 수학 6단원 켬 · 131차(국어) — 국어 4단원 켬 · 123차 — 1학년 2학기 수학 1단원 켬(우리 반) · 124차 — 국어 1단원 켬 · 125차 — 수학 2단원 켬 · 126차 — 수학 3단원 켬 · 126차(국어) — 국어 2단원 켬 · 127차 — 수학 4단원 켬 · 129차(국어) — 국어 3단원 켬 · 130차 — 수학 5단원 켬
  var byUrl = {};
  try {
    var MAP = window.KT2_PROJMAP;
    if (MAP && ON.length) Object.keys(MAP).forEach(function (k) {
      var i = k.indexOf(':'), slug = k.slice(0, i), key = k.slice(i + 1), unit = key.split('_')[0];
      if (ON.indexOf(slug + ':' + unit) < 0) return;
      var m = slug.match(/^g(\d)(?:s(\d))?_([a-z]+)$/); if (!m) return;
      if (byUrl[MAP[k].url]) return; // 121차 — 묶음 원문(두 시간 한 파일)은 앞 키로 연다
      byUrl[MAP[k].url] = '/kedu/teacher/stage2/learn.html?g=' + m[1] + '&t=' + (m[2] || 1) + '&s=' + m[3] + '&u=' + unit.slice(1) + '&l=' + key;
    });
  } catch (e) { }
  var pathOf = function (u) { try { return decodeURIComponent(new URL(u, location.href).pathname); } catch (e) { return ''; } };
  window.KT2_PROJ = { ON: ON.slice(), to: function (u) { if (!u) return null; var p = pathOf(u); return (p && byUrl[p]) || null; } };
  try {
    if (/[?&]proj=off\b/.test(location.search)) return;
    var links = document.querySelectorAll('a.lesson-card, a#kedu-next');
    for (var i = 0; i < links.length; i++) { var to = byUrl[pathOf(links[i].getAttribute('href'))]; if (to) { links[i].setAttribute('href', to); links[i].setAttribute('data-kt2', '1'); } }
  } catch (e) { }
})();
