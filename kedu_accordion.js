/* ============================================================
   kedu_accordion.js — 자기주도 허브 단원 아코디언 (2026-08-10)
   ------------------------------------------------------------
   준호: 「단원만 보이고, 단원을 클릭하면 차시가 펼쳐지게 —
   모든 과목 모든 차시에」.

   설계: 18개 과목 허브는 UNITS.forEach 스탬프 패턴을 공유하지만
   세부(topics 계층·이모지·색)가 제각각이다. 렌더 코드를 18곳
   고치는 대신, 렌더가 끝난 DOM(.unit-section = .unit-header +
   본문)을 「후처리」로 개조한다 — 렌더 불가지라 허브별 편차에
   면역이고, UNITS 데이터가 무손이라 kedu_map 생성기
   (build_kedu_map.js)도 영향 0.

   동작:
   · 기본 = 전 단원 접힘 (단원 헤더의 「라이브 N차시」 배지가
     내용 예고 역할)
   · 헤더 클릭/Enter/Space = 펼침·접힘 (여러 단원 동시 펼침 허용)
   · 마지막으로 펼친 단원을 localStorage(kedu_acc_{경로})에 기억
     — 재방문 시 그 단원만 열려 이어하기 동선 유지
   · #u{N} 해시 딥링크 = 해당 단원 열고 스크롤
   · 애니메이션 = grid-template-rows 0fr→1fr (높이 측정 JS 없음)
   · 접근성 = role=button·tabindex·aria-expanded·회전 셰브런
   · .unit-section이 없는 페이지(잉글리시 레벨 사다리 등)에선
     아무것도 하지 않는다
   ============================================================ */
(function () {
  'use strict';

  var CSS = [
    '.unit-section .unit-header{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}',
    '.unit-section .unit-header:focus-visible{outline:2px solid #94A3B8;outline-offset:3px;border-radius:6px}',
    '.unit-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease}',
    '.unit-section.acc-open .unit-body{grid-template-rows:1fr}',
    '.unit-body-in{overflow:hidden;min-height:0}',
    '.unit-chev{flex:none;width:9px;height:9px;margin-left:6px;border-right:2px solid #94A3B8;border-bottom:2px solid #94A3B8;transform:rotate(45deg) translateY(-2px);transition:transform .3s ease}',
    '.unit-section.acc-open .unit-chev{transform:rotate(-135deg) translateY(-2px)}',
    '@media (prefers-reduced-motion: reduce){.unit-body,.unit-chev{transition:none}}',
  ].join('\n');

  function init() {
    var sections = document.querySelectorAll('.unit-section');
    if (!sections.length) return; /* 단원 구조가 아닌 페이지 — 무개입 */

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var KEY = 'kedu_acc_' + location.pathname;
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var hashU = (location.hash.match(/^#u(\d+)$/) || [])[1] || null;

    sections.forEach(function (sec, i) {
      var head = sec.querySelector('.unit-header');
      if (!head || sec.querySelector('.unit-body')) return; /* 중복 초기화 방지 */

      /* 헤더 뒤 형제 전부를 접힘 본문으로 이주 */
      var body = document.createElement('div');
      body.className = 'unit-body';
      var inner = document.createElement('div');
      inner.className = 'unit-body-in';
      var n = head.nextSibling;
      while (n) { var nx = n.nextSibling; inner.appendChild(n); n = nx; }
      body.appendChild(inner);
      sec.appendChild(body);

      var unitNo = ((sec.querySelector('.unit-num') || {}).textContent || String(i + 1)).trim();
      head.setAttribute('role', 'button');
      head.tabIndex = 0;
      var chev = document.createElement('span');
      chev.className = 'unit-chev';
      chev.setAttribute('aria-hidden', 'true');
      head.appendChild(chev);

      var open = hashU != null ? hashU === unitNo : (saved != null && saved === unitNo);
      apply(open);
      if (open && hashU != null) {
        setTimeout(function () { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
      }

      function apply(o) {
        sec.classList.toggle('acc-open', o);
        head.setAttribute('aria-expanded', o ? 'true' : 'false');
      }
      function toggle() {
        var willOpen = head.getAttribute('aria-expanded') !== 'true';
        apply(willOpen);
        try {
          if (willOpen) localStorage.setItem(KEY, unitNo);
          else if (localStorage.getItem(KEY) === unitNo) localStorage.removeItem(KEY);
        } catch (e) {}
      }
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
