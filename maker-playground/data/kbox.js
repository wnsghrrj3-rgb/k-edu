/* =============================================================
 * maker-playground/data/kbox.js — 케이메이커 ↔ 케이박스 (2026-09-07, 설계 v2 §4-5 「2층」)
 *
 * ① 교사 문: 케이박스 항목 URL `/maker/?task=<templateId>` 로 들어오면 그 틀을 바로 연다
 *    (홈 → 템플릿 찾기 손 생략). 같은 박스 항목은 세션당 한 번만 새로 만든다(되돌아와도 새 프로젝트 안 생김).
 * ② 학생 문: 케이박스로 열린 화면(cwb/cwi)이면 kedu_artifact.js 에 캡처 함수를 등록 →
 *    하단 띠 「📤 선생님께 보내기」 한 번으로 지금 프로젝트의 모든 장면이 PNG 로 교사 케이박스에.
 * 학생 화면 무접촉 원칙: 케이박스 밖에서는 아무것도 하지 않는다.
 * ============================================================= */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  var task = q.get('task'), cwb = q.get('cwb'), cwi = q.get('cwi');

  /* ① 틀 바로 열기 */
  function openTask() {
    if (!task || !window.MK_TPL || !window.MK_TPL.get) return;
    if (!window.MK_TPL.get(task)) return;                 // 모르는 id 면 홈 그대로(있는 척 금지)
    var key = 'mk_task_opened:' + (cwb || 'x') + ':' + (cwi || 'x') + ':' + task;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch (e) {}
    try { window.MK_TPL.load(task); } catch (e) {}
  }

  /* ② 현재 프로젝트 → PNG dataURL 목록 */
  async function capture() {
    var pid = window.MK_WS && window.MK_WS.state && window.MK_WS.state.projectId;
    var p = pid && window.MK_PROJ ? window.MK_PROJ.get(pid) : null;
    if (!p && window.MK_PROJ && window.MK_PROJ.list) {          // 작업창을 나왔으면 가장 최근 프로젝트
      var l = window.MK_PROJ.list(); p = l && l.length ? l[0] : null;
    }
    var doc = p && p.doc; if (!doc || !doc.scenes || !doc.scenes.length) return null;
    var pages = [];
    for (var i = 0; i < Math.min(doc.scenes.length, 12); i++) {
      var dl = window.MK_RENDER.renderScene(doc.scenes[i], {});
      var out = await window.MK_RENDER.toRaster(dl, { format: 'png', scale: 1.5 });
      if (out && out.dataUrl) pages.push(out.dataUrl);
    }
    return pages.length ? { pages: pages, title: doc.title || p.name || '' } : null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(openTask, 0);                                   // PG.boot 뒤
    if (cwb && cwi && window.KeduArtifact) window.KeduArtifact.register({ tool: 'kmake', capture: capture });
  });
})();
