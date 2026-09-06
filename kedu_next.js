/* =====================================================================
   kedu_next.js — 자기주도 단원 목록 「▶ 이어서 하기 — 다음 차시」 카드 (2026-09-04)

   한 줄: 지난번에 연 차시가 있으면, 그 *다음* 차시를 목록 맨 위에 자동으로 띄운다.

   어떻게 —
     · kedu_tracker.js 가 차시 화면에서 localStorage `kedu_last:{g}_{s}_{subject}` 에
       {file, title, at} 를 남긴다(이 기기 안, 서버 전송 없음).
     · 이 파일은 단원 목록(gradeN/semesterN/과목/index.html)에서 전역 `UNITS` 를 읽어
       마지막 차시의 위치를 찾고 바로 다음 차시를 가리킨다.
       단원 끝이면 다음 단원 첫 차시, 전체 끝이면 「모두 마쳤어요 — 처음부터」.
     · 목록의 그 카드에도 「다음」 표식을 붙인다. 주소에 #next 가 있으면 카드로 스크롤.
   정직 —
     · 마지막 차시가 목록에 없으면(파일 이름이 바뀐 경우) 카드를 띄우지 않는다.
     · 자동 점프는 하지 않는다 — 목록은 늘 목록으로 열린다.
   사용: 단원 목록 body 끝에 kedu_next.js 를 script 태그로 싣는다
   ===================================================================== */
(function () {
  'use strict';
  try {
    if (typeof UNITS === 'undefined' || !Array.isArray(UNITS)) return;
    var m = location.pathname.match(/^\/grade([1-6])\/semester([12])\/([a-z]+)\//);
    if (!m) return;
    var raw = localStorage.getItem('kedu_last:' + m[1] + '_' + m[2] + '_' + m[3]);
    if (!raw) return;
    var last = JSON.parse(raw);
    if (!last || !last.file) return;

    // 목록 순서대로 납작하게 (교과서 차시 우선, 나머지 트랙은 그 뒤에 그대로)
    var flat = [];
    UNITS.forEach(function (u, ui) {
      (u.lessons || []).forEach(function (l) {
        if (l && l.file) flat.push({ unit: u, ui: ui, lesson: l });
      });
    });
    var norm = function (f) { try { return decodeURIComponent(String(f)).replace(/^\.\//, ''); } catch (e) { return String(f); } };
    var lastFile = norm(last.file);
    var idx = -1;
    for (var i = 0; i < flat.length; i++) { if (norm(flat[i].lesson.file) === lastFile) { idx = i; break; } }
    if (idx < 0) return;

    var done = idx === flat.length - 1;
    var next = done ? flat[0] : flat[idx + 1];
    var cur = flat[idx];
    var unitName = function (u) { return (u.emoji ? u.emoji + ' ' : '') + (u.name || ''); };
    var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    var content = document.getElementById('content') || document.body;
    var card = document.createElement('a');
    card.id = 'kedu-next';
    card.href = next.lesson.file;
    card.style.cssText = 'display:flex;align-items:center;gap:14px;background:#fff;border:2px solid ' + (next.unit.color || '#1A202C') +
      ';border-radius:16px;padding:14px 18px;margin:0 0 18px;text-decoration:none;color:#1A202C;box-shadow:0 4px 16px rgba(0,0,0,.06)';
    card.innerHTML =
      '<div style="min-width:44px;height:44px;border-radius:12px;background:' + (next.unit.color || '#1A202C') + ';color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px">▶</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:12px;font-weight:700;letter-spacing:.06em;color:#718096">' + (done ? '모두 마쳤어요 — 처음부터 다시' : '이어서 하기 · 다음 차시') + '</div>' +
        '<div style="font-size:16px;font-weight:700;margin-top:2px">' + esc(unitName(next.unit)) + ' ' + esc(next.lesson.n) + '차시 — ' + esc(next.lesson.title) + '</div>' +
        '<div style="font-size:12.5px;color:#718096;margin-top:2px">마지막에 연 차시: ' + esc(unitName(cur.unit)) + ' ' + esc(cur.lesson.n) + '차시 ' + esc(cur.lesson.title) + '</div>' +
      '</div>' +
      '<div style="font-weight:700;white-space:nowrap;color:' + (next.unit.color || '#1A202C') + '">시작 →</div>';
    content.insertBefore(card, content.firstChild);

    // 목록 안의 그 카드에도 표식
    var links = document.querySelectorAll('a.lesson-card');
    for (var k = 0; k < links.length; k++) {
      var a = links[k];
      if (norm(a.getAttribute('href')) === norm(next.lesson.file)) {
        a.style.borderColor = next.unit.color || '#1A202C';
        var tag = document.createElement('span');
        tag.textContent = done ? '처음부터' : '다음';
        tag.style.cssText = 'font-size:11px;font-weight:700;color:#fff;background:' + (next.unit.color || '#1A202C') + ';padding:2px 8px;border-radius:999px;margin-left:6px';
        var t = a.querySelector('.lesson-title'); (t || a).appendChild(tag);
        break;
      }
    }
    if (location.hash === '#next') { try { card.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {} }
  } catch (e) {}
})();
