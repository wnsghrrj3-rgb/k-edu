/* ============================================================
   케이메이크 (KMake) — K-edu 무료 교육용 디자인 도구 · 1차
   엔진: Fabric.js 5.3 / 내보내기: jsPDF
   모드: 자유편집(edit) ↔ 슬롯 채우기(fill)
   ============================================================ */

/* ---------- 0. 슬롯 커스텀 속성 직렬화 ---------- */
fabric.Object.prototype.toObject = (function (orig) {
  return function (extra) {
    return orig.call(this, ['kmSlot'].concat(extra || []));
  };
})(fabric.Object.prototype.toObject);

/* ---------- 1. 프리셋 ---------- */
const PRESETS = {
  teacher: [
    { name: 'A4 학습지 (세로)', w: 794, h: 1123, ratio: '1/1.41' },
    { name: 'A4 가로', w: 1123, h: 794, ratio: '1.41/1' },
    { name: '상장', w: 1123, h: 794, ratio: '1.41/1', cls: 'cert' },
    { name: '이름표', w: 640, h: 240, ratio: '8/3' },
    { name: '안내장', w: 794, h: 1123, ratio: '1/1.41' },
  ],
  student: [
    { name: '카드', w: 520, h: 720, ratio: '13/18' },
    { name: '포스터 (A4)', w: 794, h: 1123, ratio: '1/1.41' },
    { name: '발표 슬라이드', w: 1280, h: 720, ratio: '16/9' },
  ],
};

const KO_FONTS = [
  ['Jua', '주아 (둥근 제목)'],
  ['Noto Sans KR', '본문 고딕'],
  ['Black Han Sans', '굵은 제목'],
  ['Do Hyeon', '각진 제목'],
  ['Gowun Dodum', '단정 본문'],
  ['Hahmlet', '명조'],
  ['Gaegu', '개구 손글씨'],
  ['Nanum Pen Script', '펜 손글씨'],
];

/* ---------- 2. 상태 ---------- */
let canvas, baseW = 794, baseH = 1123, zoom = 1, audience = 'teacher', mode = 'edit';
let undoStack = [], redoStack = [], lockHistory = false;
let imgTarget = null; // 이미지 업로드가 '새로 추가'인지 '슬롯 교체'인지

/* ---------- 3. 시작 화면 ---------- */
const startEl = document.getElementById('start');
const grid = document.getElementById('presetGrid');

function renderPresets() {
  const list = PRESETS[audience].slice();
  let html = list.map((p, i) => {
    const tw = 70, th = Math.round(70 * (p.h / p.w));
    const W = p.h > p.w ? Math.round(th * (p.w / p.h)) : tw;
    const H = p.h > p.w ? th : Math.round(tw * (p.h / p.w));
    return `<button class="preset-card" data-i="${i}">
      <div class="preset-thumb"><div class="paper" style="width:${Math.min(W,80)}px;height:${Math.min(H,80)}px"></div></div>
      <div class="preset-name">${p.name}</div>
      <div class="preset-dim">${p.w} × ${p.h}</div>
    </button>`;
  }).join('');
  html += `<div class="preset-card preset-custom">
      <div class="preset-name">직접 입력</div>
      <div class="inline2" style="margin-top:8px"><input id="cw" type="text" value="800" inputmode="numeric"> <span style="align-self:center">×</span> <input id="ch" type="text" value="600" inputmode="numeric"></div>
      <button class="tb-btn primary" id="customGo" style="margin-top:10px;height:32px">시작</button>
    </div>`;
  grid.innerHTML = html;

  grid.querySelectorAll('.preset-card[data-i]').forEach(card => {
    card.onclick = () => {
      const p = list[+card.dataset.i];
      openEditor(p.w, p.h);
    };
  });
  const cg = document.getElementById('customGo');
  if (cg) cg.onclick = () => {
    const w = Math.max(100, Math.min(4000, parseInt(document.getElementById('cw').value) || 800));
    const h = Math.max(100, Math.min(4000, parseInt(document.getElementById('ch').value) || 600));
    openEditor(w, h);
  };
}

document.querySelectorAll('.start-tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.start-tab').forEach(x => x.classList.remove('on'));
    t.classList.add('on');
    audience = t.dataset.aud;
    renderPresets();
  };
});
renderPresets();

/* ---------- 4. 에디터 진입 ---------- */
function openEditor(w, h) {
  baseW = w; baseH = h;
  startEl.classList.add('hidden');
  document.getElementById('editor').classList.remove('hidden');
  initCanvas();
}

function initCanvas() {
  const el = document.getElementById('c');
  el.width = baseW; el.height = baseH;
  canvas = new fabric.Canvas('c', { backgroundColor: '#ffffff', preserveObjectStacking: true });
  canvas.setDimensions({ width: baseW, height: baseH });

  canvas.on('selection:created', refreshProps);
  canvas.on('selection:updated', refreshProps);
  canvas.on('selection:cleared', refreshProps);
  canvas.on('object:modified', () => pushHistory());
  canvas.on('object:added', () => { if (!lockHistory) pushHistory(); });
  canvas.on('object:removed', () => { if (!lockHistory) pushHistory(); });

  zoomFit();
  pushHistory();
  refreshProps();

  // 웹폰트가 늦게 로드되면 첫 텍스트 폭이 깨지므로 로드 완료 후 한 번 더 렌더
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => canvas && canvas.requestRenderAll());
  }
}

/* ---------- 5. 도구: 요소 추가 ---------- */
document.getElementById('toolbar').addEventListener('click', e => {
  const btn = e.target.closest('.tool');
  if (!btn || mode === 'fill') return;
  addElement(btn.dataset.tool);
});

function center() { return { left: baseW / 2, top: baseH / 2 }; }

function addElement(type) {
  let obj;
  const c = center();
  if (type === 'text') {
    obj = new fabric.Textbox('텍스트를 입력하세요', {
      left: c.left, top: c.top, width: Math.min(baseW * 0.6, 400),
      fontSize: Math.round(baseW / 18), fontFamily: 'Jua', fill: '#1A202C',
      textAlign: 'center', originX: 'center', originY: 'center',
    });
  } else if (type === 'rect') {
    obj = new fabric.Rect({ left: c.left, top: c.top, width: 200, height: 130, fill: '#EBF4FF', stroke: '#5B8EF8', strokeWidth: 2, rx: 8, ry: 8, originX: 'center', originY: 'center' });
  } else if (type === 'circle') {
    obj = new fabric.Circle({ left: c.left, top: c.top, radius: 80, fill: '#FEF3C7', stroke: '#F59E0B', strokeWidth: 2, originX: 'center', originY: 'center' });
  } else if (type === 'line') {
    obj = new fabric.Line([c.left - 110, c.top, c.left + 110, c.top], { stroke: '#1A202C', strokeWidth: 3 });
  } else if (type === 'arrow') {
    obj = makeArrow(c.left - 100, c.top, c.left + 100, c.top, '#1A202C', 3);
  } else if (type === 'image') {
    imgTarget = null;
    document.getElementById('imgInput').click();
    return;
  }
  if (obj) {
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }
}

function makeArrow(x1, y1, x2, y2, color, w) {
  const line = new fabric.Line([x1, y1, x2, y2], { stroke: color, strokeWidth: w });
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const head = new fabric.Triangle({
    left: x2, top: y2, originX: 'center', originY: 'center',
    width: w * 5, height: w * 5, fill: color, angle: angle + 90,
  });
  const g = new fabric.Group([line, head], { originX: 'center', originY: 'center' });
  g.kmType = 'arrow';
  return g;
}

/* 이미지 업로드 */
document.getElementById('imgInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    fabric.Image.fromURL(ev.target.result, img => {
      const max = Math.min(baseW * 0.7, baseH * 0.7);
      const s = Math.min(max / img.width, max / img.height, 1);
      if (imgTarget) {
        // 슬롯 교체: 기존 위치/크기 자리에 끼움
        const t = imgTarget;
        img.set({ left: t.left, top: t.top, originX: t.originX, originY: t.originY, angle: t.angle });
        img.scaleToWidth(t.getScaledWidth());
        img.kmSlot = t.kmSlot;
        const idx = canvas.getObjects().indexOf(t);
        canvas.remove(t); canvas.add(img); img.moveTo(idx);
        applyMode();
        imgTarget = null;
      } else {
        img.set({ left: center().left, top: center().top, originX: 'center', originY: 'center', scaleX: s, scaleY: s });
        canvas.add(img);
        canvas.setActiveObject(img);
      }
      canvas.requestRenderAll();
    }, { crossOrigin: 'anonymous' });
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

/* ---------- 6. 속성 패널 ---------- */
const propsEl = document.getElementById('props');

function refreshProps() {
  const o = canvas && canvas.getActiveObject();
  if (!o) {
    propsEl.innerHTML = `<div class="prop-empty">${mode === 'fill' ? '바꿀 칸을 클릭하세요' : '요소를 선택하거나<br>왼쪽에서 추가해 보세요'}</div>`;
    return;
  }
  const isText = o.type === 'textbox' || o.type === 'i-text' || o.type === 'text';
  const isShape = ['rect', 'circle', 'triangle', 'line'].includes(o.type);
  let h = '';

  // 슬롯 채우기 모드: 내용만
  if (mode === 'fill') {
    if (isText) {
      h += `<h3>📝 내용 바꾸기</h3>
        <div class="prop-row"><label>${(o.kmSlot && o.kmSlot.label) || '텍스트'}</label>
        <textarea id="pText">${escapeHtml(o.text)}</textarea></div>`;
    } else if (o.type === 'image') {
      h += `<h3>🖼 사진 바꾸기</h3>
        <div class="prop-row"><button class="tb-btn primary" id="pSwap" style="width:100%">📷 사진 교체</button></div>`;
    }
    propsEl.innerHTML = h;
    bindFillHandlers(o);
    return;
  }

  // 자유편집 모드
  if (isText) {
    h += `<h3>✏️ 텍스트</h3>
      <div class="prop-row"><label>내용</label><textarea id="pText">${escapeHtml(o.text)}</textarea></div>
      <div class="prop-row"><label>글꼴</label><select id="pFont">${KO_FONTS.map(f => `<option value="${f[0]}" ${o.fontFamily === f[0] ? 'selected' : ''}>${f[1]}</option>`).join('')}</select></div>
      <div class="prop-row inline2">
        <div><label>크기</label><input type="text" id="pSize" value="${Math.round(o.fontSize)}" inputmode="numeric"></div>
        <div><label>굵기</label><div class="btn-grp"><button id="pBold" class="${o.fontWeight === 'bold' ? 'on' : ''}">B</button></div></div>
      </div>
      <div class="prop-row"><label>정렬</label><div class="btn-grp">
        <button data-align="left" class="${o.textAlign === 'left' ? 'on' : ''}">⬅</button>
        <button data-align="center" class="${o.textAlign === 'center' ? 'on' : ''}">⬌</button>
        <button data-align="right" class="${o.textAlign === 'right' ? 'on' : ''}">➡</button>
      </div></div>
      <div class="prop-row"><label>글자 색</label><div class="color-row"><input type="color" id="pFill" value="${toHex(o.fill)}"><span style="font-size:12px;color:var(--gray)">${toHex(o.fill)}</span></div></div>`;
  } else if (isShape) {
    h += `<h3>🔷 도형</h3>`;
    if (o.type !== 'line') {
      h += `<div class="prop-row"><label>채움 색</label><div class="color-row"><input type="color" id="pFill" value="${toHex(o.fill)}"></div></div>`;
    }
    h += `<div class="prop-row"><label>테두리 색</label><div class="color-row"><input type="color" id="pStroke" value="${toHex(o.stroke || '#000000')}"></div></div>
      <div class="prop-row"><label>테두리 굵기</label><input type="text" id="pStrokeW" value="${o.strokeWidth || 0}" inputmode="numeric"></div>`;
  } else if (o.type === 'image' || o.type === 'group') {
    h += `<h3>${o.type === 'image' ? '🖼 이미지' : '➶ 묶음'}</h3>`;
  }

  // 투명도
  h += `<div class="prop-row"><label>투명도 ${Math.round((o.opacity ?? 1) * 100)}%</label><input type="range" id="pOpacity" min="10" max="100" value="${Math.round((o.opacity ?? 1) * 100)}" style="width:100%"></div>`;

  // 슬롯 지정
  const slotOn = !!(o.kmSlot && o.kmSlot.on);
  h += `<div class="slot-box">
    <div class="stitle">📌 슬롯 (바꿀 수 있는 칸)</div>
    <div class="slot-toggle"><span>이 요소를 슬롯으로</span>
      <label class="switch"><input type="checkbox" id="pSlot" ${slotOn ? 'checked' : ''}><span class="track"></span></label></div>
    ${slotOn ? `<div class="prop-row" style="margin-top:10px;margin-bottom:0"><label style="color:#92400E">칸 이름</label><input type="text" id="pSlotLabel" value="${escapeHtml((o.kmSlot && o.kmSlot.label) || '')}" placeholder="예: 이름, 날짜, 사진"></div>` : ''}
  </div>`;

  // 레이어/복사/삭제
  h += `<div class="divider"></div>
    <div class="prop-actions">
      <button id="pFront">⬆<br>맨 앞</button>
      <button id="pBack">⬇<br>맨 뒤</button>
      <button id="pDup">⧉<br>복사</button>
      <button id="pDel" class="del">🗑<br>삭제</button>
    </div>`;

  propsEl.innerHTML = h;
  bindEditHandlers(o, isText, isShape);
}

function bindEditHandlers(o, isText, isShape) {
  const $ = id => document.getElementById(id);
  const render = () => canvas.requestRenderAll();

  if ($('pText')) $('pText').oninput = e => { o.set('text', e.target.value); render(); };
  if ($('pFont')) $('pFont').onchange = e => { o.set('fontFamily', e.target.value); render(); pushHistory(); };
  if ($('pSize')) $('pSize').onchange = e => { o.set('fontSize', Math.max(6, parseInt(e.target.value) || 12)); render(); pushHistory(); };
  if ($('pBold')) $('pBold').onclick = () => { o.set('fontWeight', o.fontWeight === 'bold' ? 'normal' : 'bold'); render(); pushHistory(); refreshProps(); };
  propsEl.querySelectorAll('[data-align]').forEach(b => b.onclick = () => { o.set('textAlign', b.dataset.align); render(); pushHistory(); refreshProps(); });
  if ($('pFill')) $('pFill').oninput = e => { o.set('fill', e.target.value); render(); };
  if ($('pFill')) $('pFill').onchange = () => pushHistory();
  if ($('pStroke')) $('pStroke').oninput = e => { o.set('stroke', e.target.value); render(); };
  if ($('pStroke')) $('pStroke').onchange = () => pushHistory();
  if ($('pStrokeW')) $('pStrokeW').onchange = e => { o.set('strokeWidth', Math.max(0, parseInt(e.target.value) || 0)); render(); pushHistory(); };
  if ($('pOpacity')) $('pOpacity').oninput = e => { o.set('opacity', e.target.value / 100); render(); };
  if ($('pOpacity')) $('pOpacity').onchange = () => pushHistory();

  if ($('pSlot')) $('pSlot').onchange = e => {
    if (e.target.checked) o.kmSlot = { on: true, label: (o.kmSlot && o.kmSlot.label) || '' };
    else o.kmSlot = { on: false };
    pushHistory(); refreshProps();
  };
  if ($('pSlotLabel')) $('pSlotLabel').onchange = e => { o.kmSlot = { on: true, label: e.target.value }; pushHistory(); };

  if ($('pFront')) $('pFront').onclick = () => { o.bringToFront(); render(); pushHistory(); };
  if ($('pBack')) $('pBack').onclick = () => { o.sendToBack(); render(); pushHistory(); };
  if ($('pDup')) $('pDup').onclick = () => duplicate(o);
  if ($('pDel')) $('pDel').onclick = () => { canvas.remove(o); canvas.discardActiveObject(); render(); };
}

function bindFillHandlers(o) {
  const $ = id => document.getElementById(id);
  if ($('pText')) $('pText').oninput = e => { o.set('text', e.target.value); canvas.requestRenderAll(); };
  if ($('pSwap')) $('pSwap').onclick = () => { imgTarget = o; document.getElementById('imgInput').click(); };
}

function duplicate(o) {
  o.clone(cl => {
    cl.set({ left: o.left + 24, top: o.top + 24 });
    cl.kmSlot = o.kmSlot;
    canvas.add(cl); canvas.setActiveObject(cl); canvas.requestRenderAll();
  }, ['kmSlot']);
}

/* ---------- 7. 모드 토글 ---------- */
document.getElementById('modeToggle').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  setMode(b.dataset.mode);
});

function setMode(m) {
  mode = m;
  document.querySelectorAll('#modeToggle button').forEach(x => {
    x.classList.toggle('on', x.dataset.mode === m);
    x.classList.toggle('fill', x.dataset.mode === 'fill' && m === 'fill');
  });
  document.getElementById('modeBanner').classList.toggle('hidden', m !== 'fill');
  document.getElementById('toolbar').style.opacity = m === 'fill' ? '.35' : '1';
  document.getElementById('toolbar').style.pointerEvents = m === 'fill' ? 'none' : 'auto';
  canvas.discardActiveObject();
  applyMode();
  refreshProps();
}

function applyMode() {
  if (!canvas) return;
  canvas.forEachObject(o => {
    if (mode === 'fill') {
      const isSlot = !!(o.kmSlot && o.kmSlot.on);
      o.selectable = isSlot; o.evented = isSlot;
      o.lockMovementX = o.lockMovementY = true;
      o.lockScalingX = o.lockScalingY = o.lockRotation = true;
      o.hasControls = false;
      if (o.type === 'textbox') o.editable = isSlot;
    } else {
      o.selectable = true; o.evented = true;
      o.lockMovementX = o.lockMovementY = false;
      o.lockScalingX = o.lockScalingY = o.lockRotation = false;
      o.hasControls = true;
      if (o.type === 'textbox') o.editable = true;
    }
  });
  canvas.requestRenderAll();
}

/* ---------- 8. 줌 ---------- */
function applyZoom(z) {
  zoom = z;
  canvas.setZoom(z);
  canvas.setDimensions({ width: baseW * z, height: baseH * z });
  document.getElementById('zoomLabel').textContent = Math.round(z * 100) + '%';
}
function zoomFit() {
  const wrap = document.getElementById('canvasWrap');
  const pad = 64;
  const z = Math.min((wrap.clientWidth - pad) / baseW, (wrap.clientHeight - pad) / baseH, 1.5);
  applyZoom(Math.max(0.1, z));
}
document.getElementById('zoomIn').onclick = () => applyZoom(Math.min(3, zoom + 0.1));
document.getElementById('zoomOut').onclick = () => applyZoom(Math.max(0.1, zoom - 0.1));
document.getElementById('zoomFit').onclick = zoomFit;
window.addEventListener('resize', () => { if (canvas) zoomFit(); });

/* ---------- 9. Undo / Redo ---------- */
function pushHistory() {
  if (lockHistory || !canvas) return;
  redoStack = [];
  undoStack.push(JSON.stringify(canvas.toJSON(['kmSlot'])));
  if (undoStack.length > 60) undoStack.shift();
}
function loadState(json) {
  lockHistory = true;
  canvas.loadFromJSON(json, () => {
    applyMode(); canvas.requestRenderAll(); lockHistory = false; refreshProps();
  });
}
function undo() {
  if (undoStack.length <= 1) return;
  redoStack.push(undoStack.pop());
  loadState(undoStack[undoStack.length - 1]);
}
function redo() {
  if (!redoStack.length) return;
  const s = redoStack.pop(); undoStack.push(s); loadState(s);
}

/* ---------- 10. 내보내기 ---------- */
document.getElementById('btnExport').onclick = (e) => {
  e.stopPropagation();
  document.getElementById('exportMenu').classList.toggle('hidden');
};
document.addEventListener('click', (e) => {
  const m = document.getElementById('exportMenu');
  if (m && !m.classList.contains('hidden') && !e.target.closest('#exportMenu') && e.target.id !== 'btnExport') m.classList.add('hidden');
});
function hideExportMenu() { document.getElementById('exportMenu').classList.add('hidden'); }

function snapshot(scale) {
  const z = zoom;
  canvas.discardActiveObject();
  canvas.setZoom(1); canvas.setDimensions({ width: baseW, height: baseH });
  canvas.renderAll();
  const url = canvas.toDataURL({ format: 'png', multiplier: scale || 2 });
  applyZoom(z);
  return url;
}
function exportPNG() {
  hideExportMenu();
  const a = document.createElement('a');
  a.href = snapshot(2); a.download = '케이메이크.png'; a.click();
  toast('PNG 저장 완료');
}
function exportPDF() {
  hideExportMenu();
  const { jsPDF } = window.jspdf;
  const url = snapshot(2);
  const mmW = baseW / 96 * 25.4, mmH = baseH / 96 * 25.4;
  const pdf = new jsPDF({ orientation: mmW > mmH ? 'l' : 'p', unit: 'mm', format: [mmW, mmH] });
  pdf.addImage(url, 'PNG', 0, 0, mmW, mmH);
  pdf.save('케이메이크.pdf');
  toast('PDF 저장 완료');
}

/* ---------- 11. 저장 / 불러오기 (.kmake) ---------- */
document.getElementById('btnSave').onclick = () => {
  const data = { v: 1, baseW, baseH, audience, canvas: canvas.toJSON(['kmSlot']) };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = '케이메이크.kmake'; a.click();
  toast('작업파일 저장 완료');
};
document.getElementById('btnOpen').onclick = () => document.getElementById('jsonInput').click();
document.getElementById('jsonInput').addEventListener('change', function (e) {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      baseW = data.baseW; baseH = data.baseH; audience = data.audience || 'teacher';
      lockHistory = true;
      canvas.clear(); canvas.backgroundColor = '#ffffff';
      canvas.loadFromJSON(data.canvas, () => {
        zoomFit(); applyMode(); canvas.requestRenderAll();
        lockHistory = false; undoStack = []; redoStack = []; pushHistory();
        toast('불러오기 완료');
      });
    } catch (err) { toast('파일을 읽을 수 없어요'); }
  };
  r.readAsText(file); e.target.value = '';
});

/* ---------- 12. 키보드 ---------- */
document.addEventListener('keydown', e => {
  if (!canvas) return;
  const ae = document.activeElement;
  const typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || (canvas.getActiveObject() && canvas.getActiveObject().isEditing));
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); return; }
  if (typing) return;
  const o = canvas.getActiveObject();
  if (!o || mode === 'fill') return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); canvas.remove(o); canvas.discardActiveObject(); canvas.requestRenderAll(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicate(o); }
});

/* ---------- 13. 유틸 ---------- */
function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toHex(c) {
  if (!c) return '#000000';
  if (c[0] === '#') return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(0, 7);
  const m = c.match(/\d+/g); if (!m) return '#000000';
  return '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
}
let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900);
}
