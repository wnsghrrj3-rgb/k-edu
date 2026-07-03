/* ============================================================
   케이메이커 씬 엔진 (KM_SCENE) — 영상 확장 1단계 (2026-07-03)
   ------------------------------------------------------------
   작업파일을 다중 씬(장면)으로 확장한다. 씬 = 캔버스 한 장 +
   모션 배경 + 길이(dur) + 전환(transition). 뷰어·MP4(2단계)가
   이 시퀀스를 재생·렌더한다.

   구조 원칙 — 의존성 주입:
   kmake.js의 파일 스코프(canvas·undoStack·lockHistory)에 직접
   접근하지 않는다. kmake.js가 init()으로 훅 3개를 준다:
     snapshot() → {json, motionBg, thumb}   현재 캔버스 직렬화
     load(scene, done)                       씬을 캔버스에 적재
     blankJson() → json                      빈 씬의 캔버스
   씬 배열·메타·스트립 UI는 여기 소관, fabric·히스토리는 kmake 소관.

   v1 결정사항:
   - 활성 씬 = 라이브 캔버스, 비활성 씬 = 스냅숏(+ 썸네일)
   - 씬 전환 시 undo 히스토리 리셋 (씬별 스택은 메모리 대가 → 보류)
   - 순서 드래그 이동은 2단계로 보류
   - 최소 1씬 보장. 채우기 모드에선 탐색만(편집 버튼 숨김)
   ============================================================ */
(function () {
  'use strict';

  var H = null;                 // 훅 (kmake.js 주입)
  var scenes = [], cur = 0;
  var editable = true;

  var TRANSITIONS = [['fade', '페이드'], ['none', '바로'], ['slideL', '슬라이드'], ['zoom', '줌']];
  var DUR_DEF = 3.5;

  function blankScene() { return { json: null, motionBg: null, dur: DUR_DEF, transition: 'fade', thumb: null }; }
  function stripEl() { return document.getElementById('sceneStrip'); }

  /* ---------- 수명 ---------- */
  function init(hooks) { H = hooks; }
  function boot() { // 새 문서 — 씬 1장으로 시작
    scenes = [blankScene()]; cur = 0;
    snapshotCur(); render(); show(true);
  }
  function teardown() { scenes = []; cur = 0; show(false); }
  function show(on) { var el = stripEl(); if (el) el.classList.toggle('hidden', !on); }

  /* ---------- 핵심 연산 ---------- */
  function snapshotCur() {
    if (!H || !scenes[cur]) return;
    var s = H.snapshot();
    scenes[cur].json = s.json; scenes[cur].motionBg = s.motionBg; scenes[cur].thumb = s.thumb;
  }

  function switchTo(i, opts) {
    opts = opts || {};
    return new Promise(function (res) {
      if (i === cur && !opts.force) { res(); return; }
      snapshotCur();
      cur = i;
      H.load(scenes[i], function () { render(); res(); });
    });
  }

  function add(kind) { // 'blank' | 'dup' — 현재 씬 뒤에 삽입 후 이동
    snapshotCur();
    var base = scenes[cur], ns = blankScene();
    if (kind === 'dup') {
      ns.json = JSON.parse(JSON.stringify(base.json));
      ns.motionBg = base.motionBg; ns.dur = base.dur; ns.transition = base.transition; ns.thumb = base.thumb;
    } else {
      ns.json = H.blankJson();
    }
    scenes.splice(cur + 1, 0, ns);
    cur = cur + 1;
    H.load(scenes[cur], render);
  }

  function del(i) {
    if (scenes.length <= 1) return;
    var wasCur = i === cur;
    scenes.splice(i, 1);
    if (wasCur) {
      cur = Math.min(i, scenes.length - 1);
      H.load(scenes[cur], render);
    } else {
      if (i < cur) cur--;
      render();
    }
  }

  function setDur(v) { var s = scenes[cur]; if (s) s.dur = Math.max(0.5, Math.min(30, +v || DUR_DEF)); }
  function setTransition(v) { var s = scenes[cur]; if (s) s.transition = v; }
  function setEditable(b) { editable = !!b; if (scenes.length) render(); }
  function count() { return scenes.length; }
  function curIndex() { return cur; }
  function get(i) { return scenes[i]; }

  /* ---------- 직렬화 ---------- */
  function serializeDoc(meta) {
    snapshotCur();
    return Object.assign({}, meta, {
      v: 4, cur: cur,
      scenes: scenes.map(function (s) {
        return { canvas: s.json, motionBg: s.motionBg, dur: s.dur, transition: s.transition };
      }),
    });
  }

  function loadDoc(d, done) { // v4 + 레거시(v3 이하 단일 canvas) 겸용
    if (d.scenes && d.scenes.length) {
      scenes = d.scenes.map(function (s) {
        return Object.assign(blankScene(), {
          json: s.canvas, motionBg: s.motionBg || null,
          dur: Math.max(0.5, Math.min(30, +s.dur || DUR_DEF)),
          transition: (s.transition && TRANSITIONS.some(function (t) { return t[0] === s.transition; })) ? s.transition : 'fade',
        });
      });
      cur = Math.min(Math.max(0, d.cur || 0), scenes.length - 1);
    } else { // 레거시 → 씬 1장으로 감싼다
      scenes = [Object.assign(blankScene(), { json: d.canvas, motionBg: d.motionBg || null })];
      cur = 0;
    }
    H.load(scenes[cur], function () { render(); show(true); if (done) done(); });
  }

  // 내보내기용 순회 — 각 씬을 실제 캔버스에 적재하고 fn 실행, 끝나면 원래 씬 복귀
  function eachScene(fn) {
    var orig = cur;
    var p = Promise.resolve();
    scenes.forEach(function (_, i) {
      p = p.then(function () { return switchTo(i, { force: true }); })
           .then(function () { return fn(i, scenes[i]); });
    });
    return p.then(function () { return switchTo(orig, { force: true }); });
  }

  /* ---------- 스트립 UI ---------- */
  function render() {
    var el = stripEl(); if (!el) return;
    var multi = scenes.length > 1;
    var html = '<div class="sc-thumbs">' + scenes.map(function (s, i) {
      return '<button class="sc-item' + (i === cur ? ' on' : '') + '" data-i="' + i + '" title="씬 ' + (i + 1) + '">' +
        (s.thumb ? '<img src="' + s.thumb + '" alt="">' : '<span class="sc-blank"></span>') +
        '<span class="sc-num">' + (i + 1) + '</span>' +
        (editable && multi ? '<span class="sc-x" data-del="' + i + '" title="씬 삭제">✕</span>' : '') +
        '</button>';
    }).join('') + '</div>';
    if (editable) {
      html += '<div class="sc-actions">' +
        '<button class="sc-btn" id="scAdd" title="빈 씬 추가">＋ 씬</button>' +
        '<button class="sc-btn" id="scDup" title="현재 씬 복제">⧉</button>' +
        (multi ? '<span class="sc-meta">⏱ <input id="scDur" type="number" min="0.5" max="30" step="0.5" value="' + scenes[cur].dur + '">초 ' +
          '<select id="scTr">' + TRANSITIONS.map(function (t) {
            return '<option value="' + t[0] + '"' + (scenes[cur].transition === t[0] ? ' selected' : '') + '>' + t[1] + '</option>';
          }).join('') + '</select></span>' : '') +
        '</div>';
    }
    el.innerHTML = html;

    el.querySelectorAll('.sc-item').forEach(function (b) {
      b.onclick = function (e) {
        if (e.target.dataset && e.target.dataset.del !== undefined) return; // ✕는 아래에서
        switchTo(+b.dataset.i);
      };
    });
    el.querySelectorAll('.sc-x').forEach(function (x) {
      x.onclick = function (e) {
        e.stopPropagation();
        if (confirm('씬 ' + (+x.dataset.del + 1) + '을(를) 삭제할까요?')) del(+x.dataset.del);
      };
    });
    var $ = function (id) { return document.getElementById(id); };
    if ($('scAdd')) $('scAdd').onclick = function () { add('blank'); };
    if ($('scDup')) $('scDup').onclick = function () { add('dup'); };
    if ($('scDur')) $('scDur').onchange = function (e) { setDur(e.target.value); e.target.value = scenes[cur].dur; };
    if ($('scTr')) $('scTr').onchange = function (e) { setTransition(e.target.value); };
  }

  window.KM_SCENE = {
    init: init, boot: boot, teardown: teardown,
    switchTo: switchTo, add: add, del: del,
    setDur: setDur, setTransition: setTransition, setEditable: setEditable,
    serializeDoc: serializeDoc, loadDoc: loadDoc, eachScene: eachScene,
    count: count, curIndex: curIndex, get: get,
    snapshotCur: snapshotCur, render: render,
    TRANSITIONS: TRANSITIONS,
  };
})();
