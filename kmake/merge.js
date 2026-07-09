/* ============================================================
   케이메이커 대량 생성 엔진 (KM_MERGE) — 무기② (2026-07-09)
   ------------------------------------------------------------
   "상장 1장 + 반 명단 = 30장". 캔바 Bulk Create(유료)의 교실판.

   설계: kmake/KMAKE_3무기_설계.md M2. 순수 오퍼스 몫.
   원칙 — 엔진 코어(scene.js) 무수정. 현재 씬을 N개 씬으로 복제하며
   슬롯 텍스트만 주입 → KM_SCENE.loadDoc로 적재. 기존 내보내기가
   그대로 PDF N페이지·PPTX N슬라이드를 완성한다(새 렌더 코드 0).

   구조 — 의존성 주입: kmake.js가 init({meta,toast})로 앱 상태를 준다.
     meta() → {baseW, baseH, audience}
     toast(msg)
   나머지(KM_SCENE·fabric·localStorage·document)는 전역/브라우저 API.

   순수 로직(parseRoster·slotsOf·injectRow·buildScenes)은 node에서
   module.exports로 스모크 검증한다. DOM은 window 가드.
   ============================================================ */
(function () {
  'use strict';

  var CAP = 60;                       // 씬 상한(메모리 예산) — 설계 명시값
  var CLASSKIT_KEY = 'km_classkit';   // localStorage 네임스페이스(격리)
  var TEXT_TYPES = { textbox: 1, 'i-text': 1 };

  /* ---------- 순수 로직 ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // 붙여넣기 파싱 — 구분자(탭/쉼표) 자동 감지, 빈 줄 무시+카운트
  function parseRoster(text) {
    var raw = String(text == null ? '' : text).replace(/\r/g, '').replace(/\n+$/, '');
    var lines = raw.length ? raw.split('\n') : [];
    var hasTab = lines.some(function (l) { return l.indexOf('\t') >= 0; });
    var hasComma = lines.some(function (l) { return l.indexOf(',') >= 0; });
    var delim = hasTab ? '\t' : (hasComma ? ',' : null);
    var rows = [], ignored = 0;
    lines.forEach(function (l) {
      if (!l.trim()) { ignored++; return; }
      rows.push(delim ? l.split(delim).map(function (s) { return s.trim(); }) : [l.trim()]);
    });
    var cols = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 0);
    return { delim: delim, rows: rows, cols: cols, ignored: ignored };
  }

  // 캔버스 json에서 텍스트 슬롯 추출(오브젝트 배열 순서 = 안정 인덱스)
  function slotsOf(json) {
    var out = [];
    if (!json || !json.objects) return out;
    json.objects.forEach(function (o, i) {
      if (o && TEXT_TYPES[o.type] && o.kmSlot && o.kmSlot.on) {
        out.push({ objIndex: i, label: (o.kmSlot.label || ''), sample: (o.text || '') });
      }
    });
    return out;
  }

  // 슬롯명 자동 추천 매핑: slot k → column k (없으면 -1)
  function defaultMapping(slots, cols) {
    return slots.map(function (_, i) { return i < cols ? i : -1; });
  }

  // 한 행 주입 — 깊은 복사 후 매핑된 슬롯 텍스트만 교체(틀 불변)
  function injectRow(json, slots, mapping, row) {
    var j = clone(json);
    slots.forEach(function (sl, si) {
      var col = mapping[si];
      if (col == null || col < 0) return;                // '안 씀' → 템플릿 문구 유지
      var val = row[col] != null ? String(row[col]) : '';
      var o = j.objects[sl.objIndex];
      if (o && TEXT_TYPES[o.type]) o.text = val;
    });
    return j;
  }

  // N개 씬 빌드(상한 CAP). src = {json, motionBg, dur, transition}
  function buildScenes(src, slots, mapping, rows, cap) {
    cap = cap || CAP;
    var made = Math.min(rows.length, cap);
    var scenes = [];
    for (var i = 0; i < made; i++) {
      scenes.push({
        canvas: injectRow(src.json, slots, mapping, rows[i]),
        motionBg: src.motionBg || null,
        dur: src.dur || 3.5,
        transition: src.transition || 'fade',
      });
    }
    return { scenes: scenes, made: made, capped: rows.length > cap ? rows.length - cap : 0 };
  }

  /* ---------- 우리 반 킷(localStorage 격리) ---------- */
  function kitLoad() {
    try { var s = localStorage.getItem(CLASSKIT_KEY); return s ? JSON.parse(s) : null; }
    catch (e) { return null; }
  }
  function kitSave(obj) {
    try { localStorage.setItem(CLASSKIT_KEY, JSON.stringify(obj)); return true; } catch (e) { return false; }
  }
  function kitColor() { var k = kitLoad(); return (k && typeof k.colorH === 'number') ? { h: k.colorH } : null; }

  /* ============================================================
     여기서부터 브라우저 전용(DOM). node 스모크는 위 순수 로직만 사용.
     ============================================================ */
  var H = null, undoSnap = null;
  function init(hooks) { H = hooks; ensureStyle(); }

  function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById('kmMergeStyle')) return;
    var css = document.createElement('style'); css.id = 'kmMergeStyle';
    css.textContent =
      '#kmMergeBtn{position:absolute;top:14px;right:16px;z-index:31;display:none;align-items:center;gap:6px;' +
      'height:38px;padding:0 14px;border:none;border-radius:10px;background:#F0A500;color:#fff;font-weight:800;' +
      'font-family:"Gowun Dodum",sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(240,165,0,.35)}' +
      '#kmMergeBtn.show{display:inline-flex}#kmMergeBtn:hover{background:#dd9700}' +
      '#kmUndoBtn{position:absolute;bottom:96px;left:50%;transform:translateX(-50%);z-index:31;display:none;' +
      'align-items:center;gap:6px;height:38px;padding:0 16px;border:1px solid var(--line,#e5e7eb);border-radius:20px;' +
      'background:#fff;color:#334155;font-weight:700;font-family:"Gowun Dodum",sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.12)}' +
      '#kmUndoBtn.show{display:inline-flex}' +
      '.km-modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px}' +
      '.km-modal{background:#fff;border-radius:18px;width:min(760px,96vw);max-height:92vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.3)}' +
      '.km-mh{display:flex;align-items:center;gap:10px;padding:18px 22px;border-bottom:1px solid #eef2f7}' +
      '.km-mh .t{font-size:19px;font-weight:800;color:#1e293b;font-family:"Gowun Dodum",sans-serif}' +
      '.km-mh .x{margin-left:auto;border:none;background:#f1f5f9;width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:16px}' +
      '.km-mb{padding:18px 22px;display:flex;flex-direction:column;gap:14px;font-family:"Gowun Dodum",sans-serif}' +
      '.km-kit{display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#F7FAFF;border:1px solid #E4EDFB;border-radius:12px;padding:10px 12px}' +
      '.km-kit .kn{font-weight:800;color:#2563eb}.km-kit button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:6px 10px;cursor:pointer;font-weight:700;font-size:13px}' +
      '.km-ta{width:100%;min-height:120px;border:1px solid #d7dce3;border-radius:12px;padding:12px;font-size:14px;font-family:inherit;resize:vertical;box-sizing:border-box}' +
      '.km-stat{font-size:13px;color:#475569;font-weight:700}.km-stat b{color:#F0A500}.km-stat .warn{color:#dc2626}' +
      '.km-map{display:flex;flex-direction:column;gap:8px}.km-map .row{display:flex;align-items:center;gap:10px}' +
      '.km-map .sl{min-width:110px;font-weight:800;color:#334155}.km-map .sm{color:#94a3b8;font-size:12px}' +
      '.km-map select{border:1px solid #cbd5e1;border-radius:8px;padding:6px 8px;font-family:inherit;font-size:13px}' +
      '.km-prev{display:flex;gap:8px;flex-wrap:wrap}.km-prev img{width:110px;height:auto;border:1px solid #e2e8f0;border-radius:8px;background:#fff}' +
      '.km-prev .ph{width:110px;height:78px;border:1px dashed #cbd5e1;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:12px}' +
      '.km-foot{display:flex;gap:10px;justify-content:flex-end;padding:16px 22px;border-top:1px solid #eef2f7}' +
      '.km-foot button{height:42px;padding:0 20px;border-radius:11px;border:none;font-weight:800;cursor:pointer;font-family:"Gowun Dodum",sans-serif}' +
      '.km-foot .go{background:#F0A500;color:#fff}.km-foot .go:disabled{background:#e2e8f0;color:#94a3b8;cursor:default}' +
      '.km-foot .cancel{background:#f1f5f9;color:#475569}';
    document.head.appendChild(css);
  }

  // 현재(활성) 씬의 텍스트 슬롯 + 소스 씬 반환
  function currentSource() {
    if (!window.KM_SCENE) return null;
    KM_SCENE.snapshotCur();
    var sc = KM_SCENE.get(KM_SCENE.curIndex());
    if (!sc || !sc.json) return null;
    return { json: sc.json, motionBg: sc.motionBg || null, dur: sc.dur || 3.5, transition: sc.transition || 'fade' };
  }

  function thumb(json, motionBg, cb) {
    if (typeof fabric === 'undefined' || !H) { cb(null); return; }
    var m = H.meta(), w = m.baseW, h = m.baseH;
    try {
      var st = new fabric.StaticCanvas(null, { width: w, height: h, backgroundColor: '#fff' });
      st.loadFromJSON(json, function () {
        if (!st.backgroundColor || /rgba\(.*0\)/.test(st.backgroundColor)) st.backgroundColor = '#fff';
        st.renderAll();
        var url = null;
        try { url = st.toDataURL({ format: 'jpeg', quality: 0.6, multiplier: 150 / w }); } catch (e) {}
        st.dispose(); cb(url);
      });
    } catch (e) { cb(null); }
  }

  /* ---------- 모달 ---------- */
  function open() {
    if (typeof document === 'undefined') return;
    var src = currentSource();
    var slots = src ? slotsOf(src.json) : [];
    if (!slots.length) { H && H.toast && H.toast('이 템플릿엔 바꿀 칸(슬롯)이 없어요'); return; }
    close(); // 중복 방지

    var kit = kitLoad();
    var bg = document.createElement('div'); bg.className = 'km-modal-bg'; bg.id = 'kmMergeModal';
    bg.innerHTML =
      '<div class="km-modal" role="dialog">' +
        '<div class="km-mh"><span>📋</span><span class="t">명단으로 여러 장 만들기</span><button class="x" id="kmX">✕</button></div>' +
        '<div class="km-mb">' +
          '<div class="km-kit">👥 우리 반: <span class="kn" id="kmKitName">' + (kit && kit.name ? esc(kit.name) : '아직 없음') + '</span>' +
            '<button id="kmKitLoad"' + (kit && kit.rosterText ? '' : ' disabled style="opacity:.5"') + '>명단 불러오기</button>' +
            '<button id="kmKitSave">이 명단 저장</button></div>' +
          '<div><div style="font-weight:800;margin-bottom:6px">명단 붙여넣기 <span style="font-weight:500;color:#94a3b8;font-size:12px">(한 줄에 1명 · 엑셀/한셀에서 복사 그대로, 탭·쉼표 자동 인식)</span></div>' +
            '<textarea class="km-ta" id="kmTa" placeholder="홍길동\t1\n김하늘\t2\n이서준\t3"></textarea></div>' +
          '<div class="km-stat" id="kmStat">명단을 붙여넣어 주세요.</div>' +
          '<div class="km-map" id="kmMap"></div>' +
          '<div><div style="font-weight:800;margin-bottom:6px">미리보기 <span style="font-weight:500;color:#94a3b8;font-size:12px">(처음 3장)</span></div>' +
            '<div class="km-prev" id="kmPrev"><div class="ph">명단 입력 시 표시</div></div></div>' +
        '</div>' +
        '<div class="km-foot"><button class="cancel" id="kmClose">닫기</button>' +
          '<button class="go" id="kmGo" disabled>만들기</button></div>' +
      '</div>';
    document.body.appendChild(bg);

    var parsed = { rows: [], cols: 0, ignored: 0, delim: null };
    var mapping = defaultMapping(slots, 0);
    var previewT = null;

    function renderMap() {
      var map = document.getElementById('kmMap');
      map.innerHTML = slots.map(function (sl, si) {
        var opts = '<option value="-1">— 안 씀 —</option>';
        for (var c = 0; c < parsed.cols; c++) opts += '<option value="' + c + '"' + (mapping[si] === c ? ' selected' : '') + '>' + (c + 1) + '열</option>';
        return '<div class="row"><span class="sl">📝 ' + esc(sl.label || ('슬롯 ' + (si + 1))) + '</span>' +
          '<span class="sm">예: ' + esc((sl.sample || '').slice(0, 12)) + '</span>' +
          '<select data-si="' + si + '">' + opts + '</select></div>';
      }).join('');
      map.querySelectorAll('select').forEach(function (s) {
        s.onchange = function () { mapping[+s.dataset.si] = +s.value; schedulePreview(); updateGo(); };
      });
    }
    function updateGo() {
      var used = mapping.some(function (m) { return m >= 0; });
      document.getElementById('kmGo').disabled = !(parsed.rows.length && used);
    }
    function recompute() {
      var made = Math.min(parsed.rows.length, CAP);
      var st = document.getElementById('kmStat');
      if (!parsed.rows.length) { st.textContent = '명단을 붙여넣어 주세요.'; }
      else {
        var msg = '<b>' + made + '명</b> · ' + parsed.cols + '열 감지';
        if (parsed.ignored) msg += ' · 빈 줄 ' + parsed.ignored + '개 건너뜀';
        if (parsed.rows.length > CAP) msg += ' · <span class="warn">' + CAP + '장 초과: 처음 ' + CAP + '명만 (' + (parsed.rows.length - CAP) + '명은 명단을 나눠서 한 번 더)</span>';
        st.innerHTML = msg;
      }
      updateGo();
    }
    function schedulePreview() {
      clearTimeout(previewT);
      previewT = setTimeout(renderPreview, 220);
    }
    function renderPreview() {
      var box = document.getElementById('kmPrev'); if (!box) return;
      if (!parsed.rows.length) { box.innerHTML = '<div class="ph">명단 입력 시 표시</div>'; return; }
      var n = Math.min(3, parsed.rows.length);
      box.innerHTML = '';
      for (var i = 0; i < n; i++) {
        var ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = (i + 1) + '번째…'; box.appendChild(ph);
        (function (idx, phEl) {
          var j = injectRow(src.json, slots, mapping, parsed.rows[idx]);
          thumb(j, src.motionBg, function (url) {
            if (!document.body.contains(phEl)) return;
            if (url) { var im = new Image(); im.src = url; phEl.replaceWith(im); }
            else phEl.textContent = (idx + 1) + '번째';
          });
        })(i, ph);
      }
    }
    function onInput() {
      parsed = parseRoster(document.getElementById('kmTa').value);
      mapping = mapping.length === slots.length ? mapping.map(function (m, i) { return (m >= 0 && m < parsed.cols) ? m : (i < parsed.cols ? i : -1); }) : defaultMapping(slots, parsed.cols);
      renderMap(); recompute(); schedulePreview();
    }

    renderMap(); recompute();
    document.getElementById('kmTa').addEventListener('input', onInput);
    document.getElementById('kmX').onclick = close;
    document.getElementById('kmClose').onclick = close;
    bg.addEventListener('mousedown', function (e) { if (e.target === bg) close(); });

    document.getElementById('kmKitLoad').onclick = function () {
      var k = kitLoad(); if (!k || !k.rosterText) return;
      document.getElementById('kmTa').value = k.rosterText; onInput();
    };
    document.getElementById('kmKitSave').onclick = function () {
      var txt = document.getElementById('kmTa').value.trim();
      if (!txt) { H && H.toast && H.toast('먼저 명단을 붙여넣어 주세요'); return; }
      var prev = kitLoad() || {};
      var name = prompt('우리 반 이름을 적어 주세요 (예: 2-3반)', prev.name || '');
      if (name == null) return;
      var obj = { name: name.trim(), rosterText: txt, colorH: (typeof prev.colorH === 'number' ? prev.colorH : null), mascot: prev.mascot || null, savedAt: Date.now() };
      if (kitSave(obj)) { document.getElementById('kmKitName').textContent = obj.name || '(이름 없음)'; H && H.toast && H.toast('우리 반 명단 저장 완료 — 다음에 원탭으로 불러와요'); }
    };

    document.getElementById('kmGo').onclick = function () {
      if (!parsed.rows.length) return;
      var built = buildScenes(src, slots, mapping, parsed.rows, CAP);
      if (!built.made) return;
      undoSnap = window.KM_SCENE ? KM_SCENE.serializeDoc(H.meta()) : null;   // 병합 취소용 스냅샷 1회
      var doc = Object.assign({ v: 4, cur: 0, scenes: built.scenes }, H.meta());
      close();
      KM_SCENE.loadDoc(doc, function () {
        H && H.toast && H.toast('완성! ' + built.made + '장 만들었어요 — 내보내기로 PDF/PPT 한 번에');
        showUndo();
      });
    };
  }

  function close() {
    if (typeof document === 'undefined') return;
    var m = document.getElementById('kmMergeModal'); if (m) m.remove();
  }

  /* ---------- 진입 버튼 · 병합 취소 버튼 ---------- */
  function ensureEntryBtn() {
    if (typeof document === 'undefined') return null;
    var b = document.getElementById('kmMergeBtn'); if (b) return b;
    var wrap = document.getElementById('canvasWrap') || document.querySelector('.canvas-wrap'); if (!wrap) return null;
    b = document.createElement('button'); b.id = 'kmMergeBtn'; b.innerHTML = '📋 명단으로 여러 장';
    b.onclick = open; wrap.appendChild(b);
    return b;
  }
  function showEntry(on) { var b = ensureEntryBtn(); if (b) b.classList.toggle('show', !!on); }

  function ensureUndoBtn() {
    if (typeof document === 'undefined') return null;
    var b = document.getElementById('kmUndoBtn'); if (b) return b;
    var wrap = document.getElementById('canvasWrap') || document.querySelector('.canvas-wrap'); if (!wrap) return null;
    b = document.createElement('button'); b.id = 'kmUndoBtn'; b.innerHTML = '↩ 병합 취소';
    b.onclick = function () {
      if (!undoSnap || !window.KM_SCENE) { hideUndo(); return; }
      KM_SCENE.loadDoc(undoSnap, function () { undoSnap = null; hideUndo(); H && H.toast && H.toast('병합을 취소했어요'); });
    };
    wrap.appendChild(b); return b;
  }
  function showUndo() { var b = ensureUndoBtn(); if (b) b.classList.add('show'); }
  function hideUndo() { var b = document.getElementById('kmUndoBtn'); if (b) b.classList.remove('show'); }

  // kmake.js가 모드 전환 시 호출: 채우기 모드에서만 진입 버튼 노출
  function onMode(m) { showEntry(m === 'fill'); if (m !== 'fill') { /* keep undo until home */ } }
  function reset() { close(); hideUndo(); showEntry(false); undoSnap = null; }

  var API = {
    // 순수 로직(스모크)
    parseRoster: parseRoster, slotsOf: slotsOf, injectRow: injectRow,
    buildScenes: buildScenes, defaultMapping: defaultMapping,
    CAP: CAP, CLASSKIT_KEY: CLASSKIT_KEY,
    kitLoad: kitLoad, kitSave: kitSave, kitColor: kitColor,
    // 브라우저
    init: init, open: open, close: close, onMode: onMode, reset: reset,
  };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.KM_MERGE = API;
})();
