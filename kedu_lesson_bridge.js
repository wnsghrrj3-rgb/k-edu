/* =============================================================
 * kedu_lesson_bridge.js — 차시 완료를 회수 채널로 흘린다
 * 명세: handoff/생태계설계_v1.md §2(순환 고리 「모이다」) · 세계층 KEDU_COLLECT/KEDU_MAP
 *
 * 한 줄: 차시가 이미 하고 있는 일(진도 저장)을 낚아채서, 교사에게 돌아가게 한다.
 *
 * 왜 필요했나 —
 *   차시 엔진이 3계열로 갈라져 있다:
 *     ① 과학·사회: saveProgress(completed) + kedu.recordLessonEnd  (회수 O)
 *     ② 국어:      kedu.recordLessonEnd만                          (회수 O)
 *     ③ 수학:      saveProgress(done)만, tracker 미탑재            (회수 X ← 147차시)
 *   ③이 케이에듀 주력인데 결과가 서버로 한 톨도 안 갔다.
 *   차시 428개를 하나씩 뜯어고치는 대신, 이 브리지가 세 계열을 전부 흡수한다.
 *
 * 차시 로직은 건드리지 않는다. 이 파일은 이미 있는 것만 읽고 감싼다:
 *   - <meta name="kedu-lesson-id">        ← 회수 키. 없으면 파일명(kedu_tracker와 같은 규칙).
 *   - window.saveProgress(done)           ← function 선언이면 전역에 붙는다
 *   - localStorage["kedu_progress_" + …]  ← 점수·완료가 여기 이미 쓰인다 (let score는 못 읽으므로)
 *
 * ⚠️ 회수 키는 새로 발행하지 않는다. 이미 scores.lesson_id로 쌓인 값을 그대로 쓴다.
 *    (지도의 KEDU_LINK 슬롯 키와는 다른 키다 — 역할이 다르므로 통일하지 않는다.)
 *
 * 회수 3채널 (하나가 죽어도 나머지가 산다):
 *   1) scores          — 학급 코드로 들어온 학생 (kedu_tracker.js)
 *   2) cw_submissions  — 케이박스로 보낸 것 (kedu_kbox_adapter.js, ?cwb=&cwi=)
 *   3) KEDU.collect    — 내 기기 1층 기록 (kedu_collect.js, 「내 전시실」)
 * 셋 다 없으면 조용히 아무 일도 안 한다 — 학생 활동 방해 0, 네트워크 0.
 *
 * 로드 위치: body 끝, 차시 스크립트 **뒤**. (tracker·kbox_adapter보다도 뒤)
 * ============================================================= */
(function () {
  'use strict';
  if (window.__keduLessonBridge) return;
  window.__keduLessonBridge = true;

  // 회수 키 — kedu_tracker.js resolveLessonId()와 같은 규칙 (meta → 파일명)
  function resolveId() {
    var meta = document.querySelector('meta[name="kedu-lesson-id"]');
    if (meta && meta.content) return meta.content.trim();
    var m = location.pathname.match(/\/([^\/]+)\.html?$/i);
    return m ? decodeURIComponent(m[1]) : null;
  }
  var LESSON = resolveId();
  if (!LESSON) return;

  var sent = false;                        // 회수 1회 가드
  var trackerFired = false;                // 차시가 스스로 recordLessonEnd를 불렀나(국어·과학)

  // ── 진도 읽기 — 엔진마다 필드명이 다르다. 둘 다 흡수. ──────────────────
  //   수학: { cur, score, done, startedAt, finishedAt, qState }
  //   과학·사회: { score, max_score, completed, completed_at, duration_sec, ... }
  // 주의: 진도 저장 키는 차시 내부 const LESSON_ID 기준이라 회수 키와 다를 수 있다
  //   (수학 파일명 g3_math_u1_01… / meta g1_math_u1_l01_v1 / 내부 LESSON_ID g3_math_u1_l01)
  //   → kedu_progress_* 중 이 페이지 것을 찾는다. 하나뿐이면 그것, 여럿이면 회수 키 우선.
  function readProgress() {
    try {
      var direct = localStorage.getItem('kedu_progress_' + LESSON);
      if (direct) return JSON.parse(direct) || {};
      var hits = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('kedu_progress_') === 0) hits.push(k);
      }
      if (hits.length === 1) return JSON.parse(localStorage.getItem(hits[0])) || {};
      // 여럿이면 이 페이지의 차시로 보이는 것 (파일명·회수키와 겹치는 조각이 가장 많은 것)
      var stem = LESSON.replace(/_v\d+$/, '');
      var best = hits.filter(function (k) { return k.indexOf(stem) > -1; })[0];
      return best ? (JSON.parse(localStorage.getItem(best)) || {}) : {};
    } catch (e) { return {}; }
  }
  function snapshot() {
    var d = readProgress();
    return {
      score: (typeof d.score === 'number') ? d.score : null,
      max:   (typeof d.max_score === 'number') ? d.max_score : null,
      done:  !!(d.done || d.completed),
      sec:   (typeof d.duration_sec === 'number') ? d.duration_sec : null
    };
  }

  // ── 부가 회수 (케이박스·1층) — tracker와 무관하게 항상 실행 ────────────
  function harvestExtras(s) {
    // 2) 케이박스로 보낸 것이면 결과봉투 제출 (밖이면 어댑터가 조용히 무시)
    try {
      if (window.KBox && window.KBox.active) {
        window.KBox.submit({
          tool: 'lesson', kind: 'auto',
          score: s.score, max: s.max,
          detail: { lesson: LESSON, spent_sec: s.sec }
        });
      }
    } catch (e) {}

    // 3) 내 기기 1층 기록 (「내 전시실」 — 서버 0)
    try {
      if (window.KEDU && typeof window.KEDU.collect === 'function') {
        window.KEDU.collect({
          kind: 'record', app: 'lesson', id: LESSON,
          title: (document.title || LESSON).replace(/\s*\|.*$/, '').trim(),
          meta: { score: s.score, max: s.max, sec: s.sec }
        });
      }
    } catch (e) {}
  }

  // ── 완료 회수 ──────────────────────────────────────────────────────────
  function harvest() {
    if (sent) return;
    sent = true;
    var s = snapshot();

    // 1) 학급 코드 학생이면 서버로 (차시가 스스로 안 불렀을 때만 — 이중 기록 금지)
    try {
      if (!trackerFired && window.kedu && typeof window.kedu.recordLessonEnd === 'function') {
        window.kedu.recordLessonEnd(s.score || 0, s.max || 0);
      }
    } catch (e) {}

    harvestExtras(s);
  }

  // ── 후킹 ───────────────────────────────────────────────────────────────
  // ③ 수학·과학: saveProgress(done=true)가 완료 신호
  function hookSave() {
    if (typeof window.saveProgress !== 'function' || window.saveProgress.__bridged) return;
    var orig = window.saveProgress;
    var wrapped = function (done) {
      var r = orig.apply(this, arguments);
      if (done) { try { harvest(); } catch (e) {} }
      return r;
    };
    wrapped.__bridged = true;
    window.saveProgress = wrapped;
  }

  // ② 국어·과학: 차시가 스스로 recordLessonEnd를 부른다 → 그 순간이 완료
  function hookTracker() {
    if (!window.kedu || typeof window.kedu.recordLessonEnd !== 'function') return;
    if (window.kedu.recordLessonEnd.__bridged) return;
    var orig = window.kedu.recordLessonEnd;
    var wrapped = function () {
      trackerFired = true;
      var r = orig.apply(this, arguments);
      if (!sent) { sent = true; try { harvestExtras(snapshot()); } catch (e) {} }
      return r;
    };
    wrapped.__bridged = true;
    window.kedu.recordLessonEnd = wrapped;
  }

  function wire() { hookSave(); hookTracker(); }

  wire();
  // tracker가 DOMContentLoaded에서 init하므로 한 박자 뒤에 한 번 더 (로드 순서 방어)
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  setTimeout(wire, 0);

  // 하니스·도구용
  window.KEDU_LESSON = {
    id: LESSON,
    snapshot: snapshot,
    harvest: harvest,
    _state: function () { return { sent: sent, trackerFired: trackerFired }; }
  };
})();
