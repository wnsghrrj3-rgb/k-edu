/* ============================================================
   케이메이커 P0 배선 (MK_P0) — "가장 쉬운 AI 창작 도구" 라운드
   p0_core.js(순수 로직)를 캔버스·DOM에 연결한다. 새 메뉴·패널 없음:
   드롭 = 캔버스, 빠른동작 = 떠있는 알약, 나머지 전부 = Ctrl+K 팔레트.
   ------------------------------------------------------------
   ① 스마트 교체 (이미지·영상 드롭 → 자동 맞춤 · 모션·마스크 유지)
   ② AI 빠른 동작 (선택 시 ✨개선 🖼바꾸기 🎨스타일 🗑삭제 4개만)
   ③ 매직 리사이즈 (비율 원클릭 변환 — 전 씬 스마트 재배치)
   ④ AI 타임라인 (자연어로 모션·씬 편집 — 팔레트에 문장 입력)
   ⑤ 호버 편집 (캔버스 위 떠있는 즉시 동작)
   ⑥ 자동 애니메이션 (새 미디어 삽입 시 자동 모션)
   ⑦ 통합 검색 (스티커·일러스트·도형·실사·배경 한 곳에서)
   ⑧ 원클릭 테마 (글꼴·색·정렬 프로젝트 전체 일괄)
   ⑨ 커맨드 팔레트 (Ctrl+K — 모든 동작 검색 실행)
   ⑩ AI 코치 (편집 멈추면 디자인 진단 → 원클릭 수정)
   ============================================================ */
(function () {
  'use strict';
  var C = window.KM_P0_CORE;
  if (!C) return;
  var $ = function (id) { return document.getElementById(id); };
  var objSeq = 1;
  function oid(o) { if (!o.__p0id) o.__p0id = 'p' + (objSeq++); return o.__p0id; }
  function byId(id) { return canvas.getObjects().find(function (o) { return o.__p0id === id; }); }
  function kindOf(o) {
    if (!o) return 'etc';
    if (o.type === 'textbox') return 'text';
    if (o.kmType === 'video') return 'video';
    if (o.type === 'image') return 'image';
    if (o.kmType === 'icon' || o.kmType === 'sticker' || o.kmType === 'illust') return 'icon';
    if (['rect', 'circle', 'triangle', 'line', 'polygon', 'path'].indexOf(o.type) >= 0 || o.kmType === 'shape') return 'shape';
    return 'etc';
  }
  function snapObjs() { // core 입력 형태로 스냅샷
    return canvas.getObjects().map(function (o) {
      var b = o.getBoundingRect(true, true);
      return { id: oid(o), kind: kindOf(o), text: o.text, fontFamily: o.fontFamily, fontSize: o.fontSize ? o.fontSize * (o.scaleY || 1) : 0,
        fill: typeof o.fill === 'string' ? o.fill : null, cx: b.left + b.width / 2, cy: b.top + b.height / 2, w: b.width, h: b.height,
        isBg: b.width >= baseW * 0.98 && b.height >= baseH * 0.98 && kindOf(o) === 'shape' };
    });
  }
  function labelOf(o) {
    var k = kindOf(o);
    if (k === 'text') return (o.text || '글자').replace(/\n/g, ' ').slice(0, 10);
    return { image: '사진', video: '영상', icon: '아이콘', shape: '도형', etc: '요소' }[k];
  }

  /* ---------- 스타일 주입 (index.html 무변경 원칙 — script 태그 1줄만) ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.p0-pill{position:fixed;z-index:60;display:flex;gap:2px;background:#fff;border:1px solid var(--line);border-radius:50px;box-shadow:var(--sh-pop);padding:4px;transition:opacity .12s}' +
    '.p0-pill button{border:none;background:none;border-radius:50px;padding:7px 12px;font-size:13px;font-weight:700;color:var(--ink-2);display:flex;gap:5px;align-items:center;white-space:nowrap}' +
    '.p0-pill button:hover{background:var(--blue-l);color:var(--blue-d)}.p0-pill button.del:hover{background:#FEEBEB;color:var(--danger)}' +
    '.p0-hover{position:fixed;z-index:59;background:#2D3748;color:#fff;border-radius:9px;padding:5px 10px;font-size:12.5px;font-weight:700;display:flex;gap:8px;align-items:center;box-shadow:var(--sh-lg);cursor:pointer}' +
    '.p0-hover:hover{background:#1f2733}' +
    '.p0-drop{outline:3px dashed var(--blue);outline-offset:-3px}' +
    '#p0Palette{position:fixed;inset:0;z-index:120;background:rgba(20,24,34,.42);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh}' +
    '#p0Palette .pw{width:min(620px,92vw);background:#fff;border-radius:18px;box-shadow:var(--sh-lg);overflow:hidden}' +
    '#p0Palette input{width:100%;border:none;outline:none;font-size:17px;padding:18px 22px;font-family:inherit;border-bottom:1px solid var(--line)}' +
    '#p0List{max-height:52vh;overflow-y:auto;padding:8px}' +
    '#p0List .row{display:flex;gap:10px;align-items:center;width:100%;border:none;background:none;text-align:left;padding:10px 14px;border-radius:11px;font-size:14.5px;color:var(--ink)}' +
    '#p0List .row.sel,#p0List .row:hover{background:var(--blue-l)}' +
    '#p0List .badge{font-size:11px;font-weight:800;color:var(--gray);background:var(--bg);border-radius:6px;padding:3px 7px;flex:none}' +
    '#p0List .row.sel .badge{color:var(--blue-d);background:#fff}' +
    '#p0List .hint{margin-left:auto;font-size:12px;color:var(--gray-l)}' +
    '#p0List .prev{width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center}#p0List .prev svg,#p0List .prev img{max-width:100%;max-height:100%}' +
    '#p0Coach{position:fixed;right:18px;bottom:18px;z-index:58;max-width:340px;background:#fff;border:1px solid var(--line);border-left:4px solid var(--blue);border-radius:14px;box-shadow:var(--sh-lg);padding:13px 15px;font-size:13.5px;line-height:1.5}' +
    '#p0Coach .cf{display:flex;gap:8px;margin-top:9px}#p0Coach button{border:none;border-radius:8px;padding:7px 13px;font-size:12.5px;font-weight:800}' +
    '#p0Coach .go{background:var(--blue);color:#fff}#p0Coach .no{background:var(--bg);color:var(--gray)}' +
    '.p0-topbtn{display:flex;align-items:center;gap:5px}';
  document.head.appendChild(css);

  /* ============ ① 스마트 교체 — 드래그&드롭 ============ */
  var wrap = $('canvasWrap');
  function dtFile(e) { var f = e.dataTransfer && e.dataTransfer.files; return f && f[0]; }
  if (wrap) {
    wrap.addEventListener('dragover', function (e) { if (!canvas) return; e.preventDefault(); wrap.classList.add('p0-drop'); });
    wrap.addEventListener('dragleave', function () { wrap.classList.remove('p0-drop'); });
    wrap.addEventListener('drop', function (e) {
      e.preventDefault(); wrap.classList.remove('p0-drop');
      if (!canvas) return;
      var f = dtFile(e); if (!f) return;
      var target = canvas.findTarget(e, false);
      var isMedia = target && (target.type === 'image' || (target.kmSlot && target.kmSlot.on));
      if (/^video\//.test(f.type)) insertVideo(f, isMedia ? target : null, e);
      else if (/^image\//.test(f.type) || /\.heic$/i.test(f.name)) {
        KM_PHOTO.loadImageFile(f, function (url) {
          if (isMedia && target.type === 'image') replaceImage(target, url);
          else insertImageAt(url, e);
        }, function (m) { toast(m); });
      } else toast('이미지·영상 파일만 놓을 수 있어요');
    });
  }
  /* 자리 유지 교체 — 위치·각도·크기·마스크·보정·모션·슬롯 전부 승계 (kmake.js imgInput 흐름과 동일 코어) */
  function replaceImage(t, url) {
    fabric.Image.fromURL(url, function (img) {
      img.set({ left: t.left, top: t.top, originX: t.originX, originY: t.originY, angle: t.angle });
      img.scaleToWidth(t.getScaledWidth()); img.kmSlot = t.kmSlot;
      KM_PHOTO.inherit(img, t);
      var i = canvas.getObjects().indexOf(t); canvas.remove(t); canvas.add(img); img.moveTo(i);
      applyMode();
      if (mode === 'edit') { canvas.setActiveObject(img); onSelect(); }
      canvas.requestRenderAll(); toast('🖼 자리 그대로 바꿨어요 — 모션·자르기 유지');
    }, { crossOrigin: 'anonymous' });
  }
  function dropPoint(e) {
    var p = canvas.getPointer(e, false);
    return { left: p.x, top: p.y };
  }
  function insertImageAt(url, e) {
    fabric.Image.fromURL(url, function (img) {
      var max = Math.min(baseW * 0.6, baseH * 0.6), s = Math.min(max / img.width, max / img.height, 1);
      var p = dropPoint(e);
      img.set({ left: p.left, top: p.top, originX: 'center', originY: 'center', scaleX: s, scaleY: s });
      canvas.add(img); canvas.setActiveObject(img); canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  }
  /* 영상 — video 요소를 fabric.Image로 (교체 시 자리·모션 승계, 삽입 시 드롭 지점) */
  var videoLoop = false;
  function ensureVideoLoop() {
    if (videoLoop) return; videoLoop = true;
    (function tick() {
      if (canvas && canvas.getObjects().some(function (o) { return o.kmType === 'video'; })) canvas.requestRenderAll();
      requestAnimationFrame(tick);
    })();
  }
  function insertVideo(file, target, e) {
    var url = URL.createObjectURL(file);
    var v = document.createElement('video');
    v.src = url; v.muted = true; v.loop = true; v.playsInline = true; v.crossOrigin = 'anonymous';
    v.addEventListener('loadeddata', function () {
      v.width = v.videoWidth; v.height = v.videoHeight; v.play();
      var img = new fabric.Image(v, { objectCaching: false });
      img.kmType = 'video';
      if (target) {
        img.set({ left: target.left, top: target.top, originX: target.originX, originY: target.originY, angle: target.angle });
        img.scaleToWidth(target.getScaledWidth()); img.kmSlot = target.kmSlot;
        if (target.anim) img.anim = JSON.parse(JSON.stringify(target.anim));
        if (target.clipPath) img.clipPath = target.clipPath;
        var i = canvas.getObjects().indexOf(target); canvas.remove(target); canvas.add(img); img.moveTo(i);
        toast('🎬 영상으로 바꿨어요 — 캔버스에서 바로 재생돼요');
      } else {
        var max = Math.min(baseW * 0.6, baseH * 0.6), s = Math.min(max / v.videoWidth, max / v.videoHeight, 1);
        var p = dropPoint(e);
        img.set({ left: p.left, top: p.top, originX: 'center', originY: 'center', scaleX: s, scaleY: s });
        toast('🎬 영상을 놓았어요 — 캔버스에서 바로 재생돼요');
      }
      canvas.add(img); canvas.setActiveObject(img); ensureVideoLoop(); canvas.requestRenderAll(); pushHistory();
    }, { once: true });
    v.addEventListener('error', function () { toast('영상을 열 수 없어요'); });
  }

  /* ============ ② AI 빠른 동작 알약 ============ */
  var pill = document.createElement('div');
  pill.className = 'p0-pill hidden';
  pill.innerHTML = '<button data-a="improve">✨ 개선</button><button data-a="replace">🖼 바꾸기</button><button data-a="style">🎨 스타일</button><button data-a="del" class="del">🗑</button>';
  document.body.appendChild(pill);
  function placePill() {
    var o = canvas && canvas.getActiveObject();
    if (!o || mode !== 'edit' || (KM_MOTION.isPlaying && KM_MOTION.isPlaying())) { pill.classList.add('hidden'); return; }
    var b = o.getBoundingRect(), r = canvas.upperCanvasEl.getBoundingClientRect();
    pill.classList.remove('hidden');
    var x = r.left + b.left + b.width / 2 - pill.offsetWidth / 2;
    var y = r.top + b.top - pill.offsetHeight - 10;
    if (y < 52) y = r.top + b.top + b.height + 10;
    pill.style.left = Math.max(8, Math.min(x, innerWidth - pill.offsetWidth - 8)) + 'px';
    pill.style.top = y + 'px';
    var rep = pill.querySelector('[data-a=replace]');
    rep.textContent = { image: '🖼 바꾸기', video: '🎬 바꾸기', text: '✏️ 고치기', icon: '🔁 바꾸기', shape: '🔁 바꾸기', etc: '🔁 바꾸기' }[kindOf(o)];
  }
  /* canvas는 openEditor 이후 생성 — 이벤트 지연 바인딩 */
  var bindT = setInterval(function () {
    if (!canvas) return;
    clearInterval(bindT);
    canvas.on('selection:created', placePill); canvas.on('selection:updated', placePill);
    canvas.on('selection:cleared', placePill);
    canvas.on('object:moving', function () { pill.classList.add('hidden'); hideHover(); });
    canvas.on('object:scaling', function () { pill.classList.add('hidden'); });
    canvas.on('object:modified', function () { placePill(); scheduleCoach(); });
    canvas.on('object:added', onAdded);
    canvas.on('mouse:over', onHoverIn); canvas.on('mouse:out', onHoverOut);
    canvas.on('mouse:wheel', function () { placePill(); });
  }, 300);
  window.addEventListener('resize', function () { if (window.canvas || typeof canvas !== 'undefined') placePill(); });

  pill.onclick = function (ev) {
    var b = ev.target.closest('[data-a]'); if (!b) return;
    var o = canvas.getActiveObject(); if (!o) return;
    var a = b.dataset.a;
    if (a === 'del') { canvas.remove(o); canvas.discardActiveObject(); canvas.requestRenderAll(); onSelect(); placePill(); }
    if (a === 'replace') {
      var k = kindOf(o);
      if (k === 'image' || k === 'video') { imgTarget = o; $('imgInput').click(); }
      else if (k === 'text') { canvas.setActiveObject(o); o.enterEditing && o.enterEditing(); o.selectAll && o.selectAll(); canvas.requestRenderAll(); }
      else { toggleIconPanel(); }
    }
    if (a === 'improve') improveObj(o);
    if (a === 'style') cycleStyle(o);
  };

  /* ✨ 개선 — 코치 규칙을 이 요소에만 적용 + 타입별 다듬기 */
  function improveObj(o) {
    var did = [];
    var k = kindOf(o);
    if (k === 'text') {
      var t = (o.text || '');
      var trimmed = t.split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/^\n+|\n+$/g, '');
      if (trimmed !== t) { o.set('text', trimmed); did.push('공백 정리'); }
      var eff = o.fontSize * (o.scaleY || 1);
      if (eff < 13) { o.set('fontSize', Math.ceil(14 / (o.scaleY || 1))); did.push('읽기 좋은 크기'); }
      var bg = (canvas.backgroundColor && typeof canvas.backgroundColor === 'string') ? canvas.backgroundColor : '#FFFFFF';
      if (typeof o.fill === 'string' && o.fill[0] === '#' && C._contrast(o.fill, bg) < 2.2) {
        o.set('fill', C._lum(bg) > 0.5 ? '#2D3748' : '#FFFFFF'); did.push('대비 살리기');
      }
      if (!o.lineHeight || o.lineHeight < 1.15) { o.set('lineHeight', 1.25); did.push('줄간격'); }
    }
    if (k === 'image' || k === 'video') {
      if (k === 'image' && fabric.Image.filters && (!o.filters || !o.filters.length)) {
        o.filters = [new fabric.Image.filters.Brightness({ brightness: 0.03 }), new fabric.Image.filters.Contrast({ contrast: 0.07 })];
        o.applyFilters(); did.push('사진 보정');
      }
    }
    // 공통: 중앙·가장자리 근접 스냅
    var b = o.getBoundingRect(true, true), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    if (Math.abs(cx - baseW / 2) < 12 && Math.abs(cx - baseW / 2) > 0.5) { o.set('left', o.left + (baseW / 2 - cx)); did.push('가운데 맞춤'); }
    if (Math.abs(cy - baseH / 2) < 12 && Math.abs(cy - baseH / 2) > 0.5) { o.set('top', o.top + (baseH / 2 - cy)); }
    o.setCoords(); canvas.requestRenderAll();
    if (did.length) { pushHistory(); toast('✨ ' + did.join(' · ')); onSelect(); }
    else toast('✨ 이미 좋아요 — 고칠 게 없어요');
    placePill();
  }

  /* 🎨 스타일 순환 — 타입별 큐레이션 프리셋 */
  var TXT_STYLES = [
    { n: '기본', set: { fill: '#2D3748', stroke: null, strokeWidth: 0, shadow: null } },
    { n: '포인트 블루', set: { fill: '#4A7DE8', stroke: null, strokeWidth: 0, shadow: null } },
    { n: '스티커 흰테', set: { fill: '#2D3748', stroke: '#FFFFFF', strokeWidth: 4, paintFirst: 'stroke', shadow: null } },
    { n: '말랑 그림자', set: { fill: '#2D3748', stroke: null, strokeWidth: 0, shadow: 'rgba(45,55,72,.28) 3px 4px 0px' } },
    { n: '네온', set: { fill: '#8B7CFF', stroke: null, strokeWidth: 0, shadow: 'rgba(139,124,255,.8) 0px 0px 14px' } },
  ];
  var SHAPE_FILLS = ['#5B8EF8', '#F49CBB', '#5B8C4A', '#F59E0B', '#8B7CFF', '#2D3748'];
  function cycleStyle(o) {
    var k = kindOf(o);
    o.__p0s = ((o.__p0s || 0) + 1);
    if (k === 'text') {
      var st = TXT_STYLES[o.__p0s % TXT_STYLES.length];
      o.set(st.set); toast('🎨 ' + st.n);
    } else if (k === 'shape') {
      var f = SHAPE_FILLS[o.__p0s % SHAPE_FILLS.length];
      if (o.type === 'line') o.set('stroke', f); else o.set('fill', f); toast('🎨 색 바꿈');
    } else if (k === 'icon') {
      setIconColor(o, SHAPE_FILLS[o.__p0s % SHAPE_FILLS.length]); toast('🎨 색 바꿈');
    } else if (k === 'image') {
      var F = fabric.Image.filters;
      var sets = [[], [new F.Grayscale()], [new F.Sepia()], [new F.Brightness({ brightness: 0.06 }), new F.Contrast({ contrast: 0.12 }), new F.Saturation({ saturation: 0.25 })]];
      var names = ['원본', '흑백', '세피아', '쨍하게'];
      var i = o.__p0s % sets.length;
      o.filters = sets[i]; o.applyFilters(); toast('🎨 ' + names[i]);
    }
    canvas.requestRenderAll(); pushHistory(); onSelect(); placePill();
  }

  /* ============ ⑤ 호버 편집 칩 ============ */
  var hov = document.createElement('div');
  hov.className = 'p0-hover hidden'; document.body.appendChild(hov);
  var hovTarget = null, hovHide = null;
  function onHoverIn(e) {
    var o = e.target;
    if (!o || mode !== 'edit' || o === canvas.getActiveObject() || (KM_MOTION.isPlaying && KM_MOTION.isPlaying())) return;
    clearTimeout(hovHide); hovTarget = o;
    var k = kindOf(o);
    hov.textContent = { text: '✏️ ' + labelOf(o), image: '🖼 사진 — 눌러서 선택', video: '🎬 영상 — 눌러서 선택', icon: '🔁 아이콘', shape: '🔁 도형', etc: '요소' }[k];
    var b = o.getBoundingRect(), r = canvas.upperCanvasEl.getBoundingClientRect();
    hov.classList.remove('hidden');
    hov.style.left = Math.max(8, r.left + b.left + b.width - hov.offsetWidth) + 'px';
    hov.style.top = Math.max(52, r.top + b.top - hov.offsetHeight - 6) + 'px';
  }
  function onHoverOut() { hovHide = setTimeout(hideHover, 250); }
  function hideHover() { hov.classList.add('hidden'); hovTarget = null; }
  hov.onmouseenter = function () { clearTimeout(hovHide); };
  hov.onmouseleave = hideHover;
  hov.onclick = function () {
    var o = hovTarget; hideHover(); if (!o) return;
    canvas.setActiveObject(o); canvas.requestRenderAll(); onSelect(); placePill();
    if (kindOf(o) === 'text') { o.enterEditing && o.enterEditing(); }
  };

  /* ============ ⑥ 자동 애니메이션 ============ */
  var autoAnim = localStorage.getItem('km_p0_autoanim') !== 'off';
  var AUTO_IN = { image: 'fadeIn', video: 'fadeIn', icon: 'pop', etc: null };
  function onAdded(e) {
    var o = e.target;
    if (!autoAnim || !o || lockHistory || mode !== 'edit') return;
    var k = kindOf(o);
    var type = AUTO_IN[k];
    if (!type || o.anim) return;
    var order = canvas.getObjects().filter(function (x) { return x.anim && x.anim.in && x.anim.in.type !== 'none'; }).length;
    o.anim = { in: { type: type, delay: Math.min(2, order * 0.3) }, loop: { type: 'none' }, fx: { type: 'none' } };
    if (KM_MOTION.previewObj) setTimeout(function () { KM_MOTION.previewObj(o); }, 60);
  }

  /* ============ ⑨ 커맨드 팔레트 (④ 자연어 · ⑦ 통합 검색 포함) ============ */
  var pal = document.createElement('div');
  pal.id = 'p0Palette'; pal.className = 'hidden';
  pal.innerHTML = '<div class="pw"><input id="p0Input" placeholder="무엇이든 검색 — 동작·재료·배경, 또는 문장으로 명령 (예: 제목 3초 뒤에 팝으로)"><div id="p0List"></div></div>';
  document.body.appendChild(pal);
  var palInput = pal.querySelector('#p0Input'), palList = pal.querySelector('#p0List');
  var palSel = 0, palRows = [];

  function inEditor() { return !$('editor').classList.contains('hidden'); }
  function openPal() {
    if (!inEditor()) return;
    // 재료 전 카탈로그 지연 로드 (이미 로드됐으면 즉시) — 도착하면 열린 팔레트 갱신
    var rerender = function () { if (!pal.classList.contains('hidden')) renderPal(palInput.value); };
    loadAsset('stickers.js?v=20260704b', 'STICKERS', rerender);
    loadAsset('illust.js?v=20260704b', 'ILLUSTS', rerender);
    loadAsset('materials.js?v=20260704b', 'MATERIALS', rerender);
    pal.classList.remove('hidden'); palInput.value = ''; renderPal(''); palInput.focus();
  }
  function closePal() { pal.classList.add('hidden'); }
  pal.onclick = function (e) { if (e.target === pal) closePal(); };
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (pal.classList.contains('hidden')) openPal(); else closePal(); return; }
    if (pal.classList.contains('hidden')) return;
    if (e.key === 'Escape') { closePal(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); movePal(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); movePal(-1); }
    if (e.key === 'Enter') { e.preventDefault(); var r = palRows[palSel]; if (r) r.run(); }
  });
  palInput && (palInput.oninput = function () { renderPal(palInput.value); });
  function movePal(d) {
    palSel = Math.max(0, Math.min(palRows.length - 1, palSel + d));
    palList.querySelectorAll('.row').forEach(function (el, i) { el.classList.toggle('sel', i === palSel); });
    var el = palList.querySelectorAll('.row')[palSel]; if (el) el.scrollIntoView({ block: 'nearest' });
  }

  /* 동작 레지스트리 — 모든 기능이 여기서 실행 가능 */
  function actions() {
    var A = [
      { n: '텍스트 넣기', k: '글자,추가', run: function () { addElement('text'); } },
      { n: '사각형 넣기', k: '도형,네모', run: function () { addElement('rect'); } },
      { n: '원 넣기', k: '도형,동그라미', run: function () { addElement('circle'); } },
      { n: '선 넣기', k: '직선', run: function () { addElement('line'); } },
      { n: '화살표 넣기', k: '', run: function () { addElement('arrow'); } },
      { n: '내 사진 올리기', k: '이미지,업로드,사진', run: function () { addElement('image'); } },
      { n: '아이콘·재료창고 열기', k: '스티커,일러스트', run: function () { toggleIconPanel(); } },
      { n: '배경 고르기', k: '움직이는 배경', run: function () { toggleBgPanel(); } },
      { n: '실행취소', k: 'undo,되돌리기', run: function () { undo(); } },
      { n: '다시실행', k: 'redo', run: function () { redo(); } },
      { n: '재생 — 전체화면', k: 'play,tv', run: function () { KM_MOTION.enterPlay(); } },
      { n: 'PNG로 저장', k: '내보내기,이미지', run: function () { exportPNG(); } },
      { n: 'PDF로 저장', k: '내보내기,인쇄', run: function () { exportPDF(); } },
      { n: 'PPT로 저장', k: '파워포인트', run: function () { exportPPTX(); } },
      { n: 'MP4 영상으로 저장', k: '동영상,비디오', run: function () { KM_VIDEO.exportMP4(); } },
      { n: '씬 추가', k: '장면,페이지', run: function () { KM_SCENE.add('blank'); } },
      { n: '씬 복제', k: '장면 복사', run: function () { KM_SCENE.add('dup'); } },
      { n: 'AI 코치 실행 — 디자인 진단', k: '검사,추천', run: function () { runCoach(true); } },
      { n: (autoAnim ? '자동 애니메이션 끄기' : '자동 애니메이션 켜기'), k: '모션,자동', run: function () { autoAnim = !autoAnim; localStorage.setItem('km_p0_autoanim', autoAnim ? 'on' : 'off'); toast(autoAnim ? '✨ 새 미디어에 자동 모션이 붙어요' : '자동 애니메이션 끔'); } },
    ];
    // ③ 매직 리사이즈
    [['A4 세로', 794, 1123], ['A4 가로', 1123, 794], ['정사각 1:1', 1080, 1080], ['인스타 4:5', 1080, 1350], ['발표 16:9', 1280, 720], ['쇼츠 9:16', 720, 1280]].forEach(function (r) {
      A.push({ n: '매직 리사이즈 → ' + r[0], k: '비율,크기,변환,resize', run: function () { magicResize(r[1], r[2], r[0]); } });
    });
    // ⑧ 원클릭 테마
    C.THEMES.forEach(function (th) {
      A.push({ n: '테마 적용 → ' + th.n, k: '색,폰트,글꼴,일괄,theme', badge: '테마', run: function () { applyTheme(th); } });
    });
    return A;
  }

  function assetCatalog() {
    var out = [];
    (window.STICKERS || []).forEach(function (it) { out.push({ n: it.n, k: it.k || '', badge: '스티커', prev: '<svg viewBox="0 0 72 72">' + it.s + '</svg>', run: function () { addSticker(it.s); } }); });
    (window.ILLUSTS || []).forEach(function (it) { out.push({ n: it.n, k: it.k || '', badge: '일러스트', run: function () { addIllust(it); } }); });
    (window.SHAPES || []).forEach(function (it) { out.push({ n: it.n, k: it.k || '', badge: '꾸밈', prev: '<svg viewBox="' + (it.vb || '0 0 100 100') + '">' + it.s + '</svg>', run: function () { addShape(it); } }); });
    (window.MATERIALS || []).forEach(function (it) { out.push({ n: it.n, k: it.k || '', badge: '실사', prev: it.img ? '<img src="' + it.img + '">' : null, run: function () { addMaterial(it); } }); });
    (window.BACKGROUNDS || []).forEach(function (it) { out.push({ n: it.n, k: it.k || '', badge: '배경', prev: it.img ? '<img src="' + it.img + '">' : null, run: function () { applyBackground(it); } }); });
    return out;
  }

  function renderPal(q) {
    q = (q || '').trim();
    var rows = [];
    // ④ 자연어 명령 우선 판정
    if (q.length >= 4) {
      var ctx = {
        objects: canvas ? canvas.getObjects().map(function (o) { return { id: oid(o), kind: kindOf(o), label: labelOf(o), size: o.fontSize ? o.fontSize * (o.scaleY || 1) : 0 }; }) : [],
        sceneCount: KM_SCENE.count(), selectedId: canvas && canvas.getActiveObject() ? oid(canvas.getActiveObject()) : null,
      };
      var cmd = C.parseCommand(q, ctx);
      if (cmd.ok) rows.push({ n: '🎬 명령 실행 — ' + cmd.summary, badge: 'AI', hint: 'Enter', run: function () { execOps(cmd.ops); closePal(); } });
    }
    var acts = actions().map(function (a) { return { name: a.n, keys: a.k, _a: a }; });
    var hitA = q ? C.fuzzySearch(q, acts, 8) : acts.slice(0, 9);
    hitA.forEach(function (h) { rows.push({ n: h._a.n, badge: h._a.badge || '동작', run: function () { closePal(); h._a.run(); } }); });
    if (q) {
      var cat = assetCatalog().map(function (a) { return { name: a.n, keys: a.k, _a: a }; });
      C.fuzzySearch(q, cat, 10).forEach(function (h) {
        rows.push({ n: h._a.n, badge: h._a.badge, prev: h._a.prev, run: function () { closePal(); h._a.run(); } });
      });
    }
    palRows = rows; palSel = 0;
    palList.innerHTML = rows.length
      ? rows.map(function (r, i) {
        return '<button class="row' + (i === 0 ? ' sel' : '') + '" data-i="' + i + '">' +
          (r.prev ? '<span class="prev">' + r.prev + '</span>' : '') +
          '<span class="badge">' + (r.badge || '동작') + '</span><span>' + esc(r.n) + '</span>' +
          (r.hint ? '<span class="hint">' + r.hint + '</span>' : '') + '</button>';
      }).join('')
      : '<div style="padding:26px;text-align:center;color:var(--gray)">결과가 없어요 — 문장으로 명령해도 돼요<br><span style="font-size:12.5px;color:var(--gray-l)">예: "사진 전부 순서대로 등장" · "제목 반짝반짝" · "씬 5초로"</span></div>';
    palList.querySelectorAll('.row').forEach(function (el) {
      el.onclick = function () { var r = palRows[+el.dataset.i]; if (r) r.run(); };
      el.onmousemove = function () { palSel = +el.dataset.i; palList.querySelectorAll('.row').forEach(function (x, i) { x.classList.toggle('sel', i === palSel); }); };
    });
  }

  /* ④ 자연어 ops 실행 */
  function execOps(ops) {
    var previewed = null;
    ops.forEach(function (op) {
      if (op.op === 'setAnim') op.ids.forEach(function (id) {
        var o = byId(id); if (!o) return;
        var A = o.anim || { in: { type: 'none', delay: 0 }, loop: { type: 'none' }, fx: { type: 'none' } };
        o.anim = {
          in: op.patch.in ? { type: op.patch.in.type || A.in.type, delay: op.patch.in.delay != null ? op.patch.in.delay : A.in.delay } : A.in,
          loop: op.patch.loop || A.loop, fx: op.patch.fx || A.fx,
        };
        previewed = previewed || o;
      });
      if (op.op === 'stagger') op.ids.forEach(function (id, i) {
        var o = byId(id); if (o && o.anim && o.anim.in) o.anim.in.delay = +(i * op.step).toFixed(1);
      });
      if (op.op === 'clearAnim') op.ids.forEach(function (id) { var o = byId(id); if (o) delete o.anim; });
      if (op.op === 'sceneDur') {
        if (op.index < 0 || op.index === KM_SCENE.curIndex()) KM_SCENE.setDur(op.sec);
        else { var sc = KM_SCENE.get(op.index); if (sc) sc.dur = op.sec; }
        KM_SCENE.render && KM_SCENE.render();
      }
      if (op.op === 'addScene') KM_SCENE.add('blank');
    });
    pushHistory(); canvas.requestRenderAll(); onSelect();
    toast('🎬 적용 완료 — 재생 ▶으로 확인해요');
    if (previewed && KM_MOTION.previewObj) KM_MOTION.previewObj(previewed);
  }

  /* ============ ③ 매직 리사이즈 — 전 씬 스마트 재배치 ============ */
  var resizing = false;
  function magicResize(nw, nh, label) {
    if (resizing || !canvas) return; resizing = true;
    var ow = baseW, oh = baseH;
    if (ow === nw && oh === nh) { toast('이미 그 크기예요'); resizing = false; return; }
    var startIdx = KM_SCENE.curIndex(), n = KM_SCENE.count();
    baseW = nw; baseH = nh;
    canvas.setDimensions({ width: nw, height: nh });
    var step = function (i) {
      if (i >= n) {
        KM_SCENE.switchTo(startIdx).then(function () {
          zoomFit(); pushHistory(); resizing = false;
          toast('↔️ ' + label + '로 변환 — 전 씬 자동 재배치 완료');
        });
        return;
      }
      KM_SCENE.switchTo(i).then(function () {
        relayoutCanvas(ow, oh, nw, nh);
        KM_SCENE.snapshotCur();
        step(i + 1);
      });
    };
    step(0);
  }
  function relayoutCanvas(ow, oh, nw, nh) {
    var objs = canvas.getObjects().map(function (o) {
      var b = o.getBoundingRect(true, true);
      return { id: oid(o), cx: b.left + b.width / 2, cy: b.top + b.height / 2, w: b.width, h: b.height,
        isBg: b.width >= ow * 0.98 && b.height >= oh * 0.98 };
    });
    var plan = C.magicLayout(objs, ow, oh, nw, nh);
    plan.forEach(function (p) {
      var o = byId(p.id); if (!o) return;
      o.set({ scaleX: (o.scaleX || 1) * p.scale, scaleY: (o.scaleY || 1) * p.scale });
      var b = o.getBoundingRect(true, true), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      o.set({ left: o.left + (p.cx - cx), top: o.top + (p.cy - cy) }); o.setCoords();
    });
    // 배경 이미지 커버 리핏
    var bg = canvas.backgroundImage;
    if (bg && bg.width) {
      var s = Math.max(nw / bg.width, nh / bg.height);
      bg.set({ scaleX: s, scaleY: s, left: (nw - bg.width * s) / 2, top: (nh - bg.height * s) / 2, originX: 'left', originY: 'top' });
    }
    canvas.requestRenderAll();
  }

  /* ============ ⑧ 원클릭 테마 — 전 씬 일괄 ============ */
  var theming = false;
  function applyTheme(th) {
    if (theming || !canvas) return; theming = true;
    var startIdx = KM_SCENE.curIndex(), n = KM_SCENE.count();
    var one = function () {
      var plan = C.applyThemePlan(snapObjs(), th);
      plan.patches.forEach(function (p) {
        var o = byId(p.id); if (!o) return;
        if (p.set) {
          if (p.set.fontFamily && kindOf(o) !== 'text') delete p.set.fontFamily;
          o.set(p.set);
          if (p.set.fontFamily && document.fonts && document.fonts.load)
            document.fonts.load('20px "' + p.set.fontFamily + '"').then(function () { o.initDimensions && o.initDimensions(); canvas.requestRenderAll(); }).catch(function () {});
        }
        if (p.move) {
          var b = o.getBoundingRect(true, true), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
          o.set({ left: o.left + (p.move.cx - cx), top: o.top + (p.move.cy - cy) });
        }
        o.setCoords();
      });
      canvas.setBackgroundColor(plan.canvasBg, function () {});
      canvas.requestRenderAll();
    };
    var step = function (i) {
      if (i >= n) {
        KM_SCENE.switchTo(startIdx).then(function () { pushHistory(); theming = false; toast('🎨 테마 「' + th.n + '」 — 전 씬에 적용 완료'); });
        return;
      }
      KM_SCENE.switchTo(i).then(function () { one(); KM_SCENE.snapshotCur(); step(i + 1); });
    };
    step(0);
  }

  /* ============ ⑩ AI 코치 ============ */
  var coachBox = document.createElement('div');
  coachBox.id = 'p0Coach'; coachBox.className = 'hidden'; document.body.appendChild(coachBox);
  var coachT = null, coachMuted = {};
  function scheduleCoach() { clearTimeout(coachT); coachT = setTimeout(function () { runCoach(false); }, 3500); }
  function runCoach(manual) {
    if (!canvas || mode !== 'edit' || (KM_MOTION.isPlaying && KM_MOTION.isPlaying())) return;
    var bg = (typeof canvas.backgroundColor === 'string' && canvas.backgroundColor) || '#FFFFFF';
    var sug = C.coach(snapObjs(), { w: baseW, h: baseH, bg: bg })
      .filter(function (s) { return manual || !coachMuted[s.rule]; });
    if (!sug.length) { if (manual) toast('💡 코치: 지금 디자인 좋아요!'); coachBox.classList.add('hidden'); return; }
    var s = sug[0];
    coachBox.classList.remove('hidden');
    coachBox.innerHTML = '<b>💡 AI 코치</b><br>' + esc(s.msg) +
      '<div class="cf"><button class="go">바로 고치기</button><button class="no">괜찮아요</button></div>';
    coachBox.querySelector('.go').onclick = function () { applyFix(s.fix); coachBox.classList.add('hidden'); };
    coachBox.querySelector('.no').onclick = function () { coachMuted[s.rule] = 1; coachBox.classList.add('hidden'); };
  }
  function applyFix(fix) {
    if (!fix) return;
    if (fix.type === 'unifyFont') fix.ids.forEach(function (id) { var o = byId(id); if (o) o.set('fontFamily', fix.to); });
    if (fix.type === 'fontSize') fix.ids.forEach(function (id) { var o = byId(id); if (o) o.set('fontSize', Math.ceil(fix.to / (o.scaleY || 1))); });
    if (fix.type === 'fill') fix.ids.forEach(function (id) { var o = byId(id); if (o) o.set('fill', fix.to); });
    if (fix.type === 'pullIn') fix.ids.forEach(function (id) {
      var o = byId(id); if (!o) return;
      var b = o.getBoundingRect(true, true);
      var dx = Math.max(0, -b.left) - Math.max(0, b.left + b.width - baseW);
      var dy = Math.max(0, -b.top) - Math.max(0, b.top + b.height - baseH);
      o.set({ left: o.left + dx, top: o.top + dy });
    });
    if (fix.type === 'margin') fix.ids.forEach(function (id) {
      var o = byId(id); if (!o) return;
      var b = o.getBoundingRect(true, true), M = fix.to;
      var dx = b.left < M ? M - b.left : (baseW - b.left - b.width < M ? baseW - M - b.width - b.left : 0);
      var dy = b.top < M ? M - b.top : (baseH - b.top - b.height < M ? baseH - M - b.height - b.top : 0);
      o.set({ left: o.left + dx, top: o.top + dy });
    });
    if (fix.type === 'promoteTitle') {
      var texts = canvas.getObjects().filter(function (o) { return o.type === 'textbox'; });
      texts.sort(function (a, b) { return b.fontSize * (b.scaleY || 1) - a.fontSize * (a.scaleY || 1); });
      if (texts[0]) texts[0].set('fontSize', Math.max(36, texts[0].fontSize));
    }
    canvas.getObjects().forEach(function (o) { o.setCoords(); });
    canvas.requestRenderAll(); pushHistory(); onSelect();
    toast('💡 코치 수정 적용 완료');
  }

  /* ---------- 팔레트 진입점: 상단바 힌트 버튼 (새 메뉴 아님 — 기존 바에 1버튼) ---------- */
  var undoBtn = $('btnUndo');
  if (undoBtn) {
    var kbtn = document.createElement('button');
    kbtn.className = 'tb-btn p0-topbtn'; kbtn.title = '무엇이든 검색·실행 (Ctrl+K)';
    kbtn.innerHTML = '⌘ <b>Ctrl+K</b>';
    kbtn.onclick = openPal;
    undoBtn.parentNode.insertBefore(kbtn, undoBtn);
  }

  window.KM_P0 = { openPal: openPal, magicResize: magicResize, applyTheme: applyTheme, runCoach: runCoach, execOps: execOps, improveObj: improveObj };
})();
