/* =====================================================================
   kedu_practice.js — 자기주도 차시 → 「오늘 확인」 문제 풀기 문 (2026-09-07)

   한 줄: 차시 마지막(정리) 화면 끝에 그 차시의 케이학습지 세트로 가는 카드를 붙인다.
   어떻게 —
     · 차시 id = <meta name="kedu-lesson-id"> 의 _vN 을 뗀 값 (없으면 window.LESSON_ID)
     · /kedu/worksheet/data/_lesson_map.json 의 lessons[*].self 에서 그 id 를 찾는다.
     · 있으면 마지막 .slide 끝에 카드(기본 · 도전 / 단원 종합)를 붙인다.
       .slide 가 없는 가족(엔진형)은 kedu.recordLessonEnd 시점에 화면 아래 고정 패널로.
     · 세트로 갈 때 &back=<이 차시 경로> 를 붙여 play.html 이 「차시로 돌아가기」를 그린다.
   정직 —
     · 연결표에 없는 차시는 아무것도 그리지 않는다(있는 척 금지).
     · 기록은 play.html 쪽 kedu_tracker 가 남긴다(학급코드 학생만). 여기서는 기록 0.
   사용: 차시 body 끝 <script src="/kedu_practice.js"></script>
   ===================================================================== */
(function () {
  'use strict';
  var MAP_URL = '/kedu/worksheet/data/_lesson_map.json';
  var PLAY = '/kedu/worksheet/play.html';

  function lessonId() {
    try {
      var m = document.querySelector('meta[name="kedu-lesson-id"]');
      var v = m && m.getAttribute('content');
      if (!v && typeof window.LESSON_ID === 'string') v = window.LESSON_ID;
      if (!v) return null;
      return String(v).trim().replace(/_v\d+$/, '');
    } catch (e) { return null; }
  }

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function link(set, label, sub, primary) {
    var back = encodeURIComponent(location.pathname);
    return '<a href="' + PLAY + '?set=' + encodeURIComponent(set) + '&back=' + back + '" style="' +
      'flex:1;min-width:150px;display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;border-radius:14px;padding:14px 12px;' +
      (primary ? 'background:var(--c-primary,#2F855A);color:#fff;' : 'background:#fff;color:var(--c-text,#1A202C);border:2px solid var(--c-line,#E2E8F0);') +
      'font-weight:700;font-size:17px;line-height:1.2">' +
      '<span>' + esc(label) + '</span><span style="font-size:12.5px;font-weight:600;opacity:.8">' + esc(sub) + '</span></a>';
  }

  function cardHTML(entry) {
    var btns = '';
    if (entry.basic) btns += link(entry.basic, '✍ 문제 풀기', '기본 10문항', true);
    if (entry.challenge) btns += link(entry.challenge, '🔥 도전', '조금 더 어려워요', false);
    if (!btns && entry.review && entry.review.length) {
      btns += link(entry.review[0], '✍ 단원 종합 문제', '25문항', true);
      if (entry.review[1]) btns += link(entry.review[1], '한 번 더 (다른 문제)', '같은 내용 · 다른 수', false);
    }
    if (!btns) return '';
    return '<div id="kedu-practice" style="width:100%;max-width:720px;margin:18px auto 0;background:var(--c-card,#fff);border:2px solid var(--c-primary,#2F855A);border-radius:18px;padding:16px 18px;box-shadow:0 4px 16px rgba(0,0,0,.06);text-align:left">' +
      '<div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:#718096">오늘 확인</div>' +
      '<div style="font-size:16px;font-weight:700;margin:2px 0 10px">배운 것을 문제로 확인해요' + (entry.title ? ' — ' + esc(entry.title) : '') + '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' + btns + '</div></div>';
  }

  function mountInSlide(html) {
    var slides = document.querySelectorAll('.slide');
    if (!slides.length) return false;
    var last = slides[slides.length - 1];
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    last.appendChild(wrap.firstChild);
    return true;
  }

  function mountFixed(html) {
    var box = document.createElement('div');
    box.innerHTML = html;
    var card = box.firstChild;
    card.style.cssText += ';position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;width:calc(100% - 32px);margin:0';
    var x = document.createElement('button');
    x.textContent = '×'; x.setAttribute('aria-label', '닫기');
    x.style.cssText = 'position:absolute;right:8px;top:6px;border:0;background:none;font-size:20px;cursor:pointer;color:#718096';
    x.onclick = function () { card.remove(); };
    card.appendChild(x);
    document.body.appendChild(card);
  }

  function start(entry) {
    var html = cardHTML(entry);
    if (!html) return;
    if (mountInSlide(html)) return;
    // 엔진형 가족 — 차시 끝 기록 시점에 고정 패널
    var shown = false;
    var show = function () { if (shown) return; shown = true; mountFixed(html); };
    window.kedu = window.kedu || {};
    var orig = window.kedu.recordLessonEnd;
    window.kedu.recordLessonEnd = function () { try { show(); } catch (e) {} return typeof orig === 'function' ? orig.apply(this, arguments) : undefined; };
  }

  var id = lessonId();
  if (!id) return;
  fetch(MAP_URL, { cache: 'force-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (map) {
    if (!map || !map.lessons) return;
    var keys = Object.keys(map.lessons);
    for (var i = 0; i < keys.length; i++) {
      var e = map.lessons[keys[i]];
      if (e && Array.isArray(e.self) && e.self.indexOf(id) >= 0) { start(e); return; }
    }
  }).catch(function () {});
})();
