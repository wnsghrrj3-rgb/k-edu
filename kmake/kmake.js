/* ============================================================
   케이메이커 (KMaker) v2 — K-edu 무료 교육 디자인 도구
   엔진: Fabric.js 5.3 · 내보내기: jsPDF
   핵심: 스마트 정렬 가이드 / 컨텍스트 툴바 / 폰트·색 피커 / 슬롯 채우기
   ============================================================ */

/* 슬롯 커스텀 속성 직렬화 */
fabric.Object.prototype.toObject = (function (orig) {
  return function (extra) { return orig.call(this, ['kmSlot', 'kmType', 'anim', 'kmPhoto'].concat(extra || [])); };
})(fabric.Object.prototype.toObject);

/* ---------- 데이터 ---------- */
const KO_FONTS = [ // 총 50종 (2026-07-04 확장) — 신규는 index.html #kmake-palette-fonts에 @font-face
  ['—', '제목 · 임팩트'],
  ['Jua', '주아'], ['Black Han Sans', '검은고딕'], ['Do Hyeon', '도현'],
  ['Bagel Fat One', '베이글'], ['Dongle', '동글'],
  ['Hakgyoansim Moheomga', '모험가'], ['CookieRun', '쿠키런'],
  ['Cafe24 Ssurround', '써라운드'], ['ONE Mobile POP', '팝'],
  ['Gmarket Sans', '지마켓'], ['Paperlogy', '페이퍼로지'], ['NanumSquare Neo', '스퀘어네오'],
  ['—', '학교안심 시리즈'],
  ['Hakgyoansim Jeomsimsigan', '점심시간'], ['Hakgyoansim Mulgyeol', '물결'],
  ['Hakgyoansim Monggeul', '몽글몽글'], ['Hakgyoansim Mabeopsa', '마법사'],
  ['Hakgyoansim Gureum', '구름'], ['Hakgyoansim Eunhasu', '은하수'],
  ['Hakgyoansim Kkokkoma', '꼬꼬마'], ['Hakgyoansim Namu', '나무'],
  ['Hakgyoansim Sonagi', '소나기'], ['Hakgyoansim Yeohaeng', '여행'],
  ['Hakgyoansim Undongjang', '운동장'], ['Hakgyoansim Jiugae', '지우개'],
  ['—', '둥근 · 레트로'],
  ['NanumSquareRound', '스퀘어라운드'], ['DungGeunMo', '둥근모 픽셀'],
  ['BM EULJIRO', '을지로'], ['Binggrae Melona', '멜로나'], ['Cafe24 Dongdong', '동동'],
  ['—', '본문 · 고딕'],
  ['Pretendard', '프리텐다드'], ['Noto Sans KR', '본문고딕'],
  ['IBM Plex Sans KR', '플렉스 고딕'], ['Gowun Dodum', '고운돋움'],
  ['—', '명조 · 세리프'],
  ['Gowun Batang', '고운바탕'], ['Nanum Myeongjo', '나눔명조'],
  ['Song Myung', '송명'], ['Hahmlet', '함렛 명조'], ['Diphylleia', '디필리아 명조'],
  ['—', '손글씨 · 감성'],
  ['Nanum Pen Script', '나눔펜'], ['Nanum Brush Script', '나눔붓'],
  ['Gaegu', '개구'], ['Gamja Flower', '감자꽃'], ['Hi Melody', '하이멜로디'],
  ['Poor Story', '푸어스토리'], ['East Sea Dokdo', '동해독도'],
  ['Yeon Sung', '연성'], ['Cute Font', '귀여운체'],
  ['Cafe24 Shiningstar', '샤이닝스타'], ['Cafe24 Oneprettynight', '어느멋진밤'],
  ['BM KIRANGHAERANG', '기랑해랑'],
];
const FONT_OF = f => KO_FONTS.find(x => x[0] === f && x[0] !== '—');
const PALETTE = ['#2D3748', '#718096', '#CBD5E0', '#FFFFFF', '#000000', '#5B8EF8',
  '#2563EB', '#DC2626', '#F97316', '#F59E0B', '#FACC15', '#22C55E',
  '#14B8A6', '#06B6D4', '#8B5CF6', '#A855F7', '#EC4899', '#92400E'];

const SVG_THUMB = {
  doc: '<svg viewBox="0 0 80 110"><rect width="80" height="110" rx="3" fill="#fff"/><rect x="16" y="14" width="48" height="7" rx="2" fill="#5B8EF8"/><rect x="12" y="34" width="56" height="4" rx="2" fill="#E2E8F0"/><rect x="12" y="44" width="56" height="4" rx="2" fill="#E2E8F0"/><rect x="12" y="54" width="40" height="4" rx="2" fill="#E2E8F0"/><rect x="12" y="72" width="56" height="4" rx="2" fill="#E2E8F0"/><rect x="12" y="82" width="48" height="4" rx="2" fill="#E2E8F0"/></svg>',
  docLand: '<svg viewBox="0 0 110 80"><rect width="110" height="80" rx="3" fill="#fff"/><rect x="20" y="12" width="70" height="7" rx="2" fill="#5B8EF8"/><rect x="14" y="32" width="82" height="4" rx="2" fill="#E2E8F0"/><rect x="14" y="42" width="82" height="4" rx="2" fill="#E2E8F0"/><rect x="14" y="52" width="56" height="4" rx="2" fill="#E2E8F0"/></svg>',
  cert: '<svg viewBox="0 0 110 80"><rect width="110" height="80" rx="3" fill="#FFFDF5"/><rect x="6" y="6" width="98" height="68" rx="2" fill="none" stroke="#D4A537" stroke-width="2"/><rect x="10" y="10" width="90" height="60" rx="1" fill="none" stroke="#E8C870" stroke-width="1"/><rect x="34" y="20" width="42" height="6" rx="2" fill="#B8862A"/><rect x="26" y="36" width="58" height="3" rx="1.5" fill="#CBD5E0"/><rect x="32" y="44" width="46" height="3" rx="1.5" fill="#CBD5E0"/><circle cx="55" cy="60" r="7" fill="#F2D88A"/><path d="M55 67 l-4 8 4-3 4 3z" fill="#DC2626"/></svg>',
  tag: '<svg viewBox="0 0 110 42"><rect width="110" height="42" rx="5" fill="#fff"/><rect x="0" y="0" width="110" height="11" rx="5" fill="#5B8EF8"/><rect x="34" y="20" width="42" height="8" rx="2" fill="#2D3748"/></svg>',
  card: '<svg viewBox="0 0 76 105"><rect width="76" height="105" rx="4" fill="#fff"/><rect x="10" y="10" width="56" height="44" rx="3" fill="#EEF4FE"/><circle cx="38" cy="30" r="10" fill="#BBD3FB"/><rect x="14" y="64" width="48" height="5" rx="2" fill="#5B8EF8"/><rect x="14" y="76" width="48" height="3" rx="1.5" fill="#E2E8F0"/><rect x="14" y="84" width="34" height="3" rx="1.5" fill="#E2E8F0"/></svg>',
  slide: '<svg viewBox="0 0 110 62"><rect width="110" height="62" rx="3" fill="#fff"/><rect x="12" y="12" width="54" height="9" rx="2" fill="#5B8EF8"/><rect x="12" y="28" width="74" height="4" rx="2" fill="#E2E8F0"/><rect x="12" y="38" width="74" height="4" rx="2" fill="#E2E8F0"/><rect x="12" y="48" width="50" height="4" rx="2" fill="#E2E8F0"/></svg>',
};
const PRESETS = {
  teacher: [
    { name: 'A4 학습지', w: 794, h: 1123, t: 'doc' },
    { name: '상장', w: 1123, h: 794, t: 'cert' },
    { name: '이름표', w: 700, h: 260, t: 'tag' },
    { name: '안내장 (가로)', w: 1123, h: 794, t: 'docLand' },
  ],
  student: [
    { name: '카드', w: 540, h: 740, t: 'card' },
    { name: '포스터 (A4)', w: 794, h: 1123, t: 'doc' },
    { name: '발표 슬라이드', w: 1280, h: 720, t: 'slide' },
  ],
  life: [ // 라이프 확장 (설계서 층1)
    { name: '모바일 카드', w: 720, h: 1280, t: 'card' },
    { name: '정방형 카드', w: 1080, h: 1080, t: 'card' },
    { name: '포토카드', w: 650, h: 1004, t: 'card' },
    { name: '인화 4×6', w: 1200, h: 1800, t: 'doc' },
    { name: '포스터 3:4', w: 810, h: 1080, t: 'doc' },
  ],
};

/* ---------- 상태 ---------- */
let canvas, baseW = 794, baseH = 1123, zoom = 1, audience = 'teacher', mode = 'edit';
let undoStack = [], redoStack = [], lockHistory = false, imgTarget = null;

/* ============ 시작 화면 ============ */
const startEl = document.getElementById('start');
const grid = document.getElementById('presetGrid');
function renderTemplates() {
  const wrap = document.getElementById('tplWrap');
  const tpls = Object.entries(KM_TEMPLATES).filter(([k, t]) => t.aud === audience);
  if (!tpls.length) { wrap.classList.add('hidden'); return; }
  wrap.classList.remove('hidden');
  wrap.querySelector('.tpl-grid').innerHTML = tpls.map(([k, t]) =>
    `<button class="tpl-card" data-tpl="${k}">
      <div class="tpl-thumb">${t.svg}</div>
      <div class="tpl-name">${t.name}</div>
      <div class="tpl-badge">✨ 바로 쓰기</div>
    </button>`).join('');
  wrap.querySelectorAll('.tpl-card').forEach(c => c.onclick = () => openTemplate(c.dataset.tpl));
}
function renderPresets() {
  renderTemplates();
  const list = PRESETS[audience];
  let html = list.map((p, i) => `
    <button class="preset-card" data-i="${i}">
      <div class="preset-thumb">${SVG_THUMB[p.t]}</div>
      <div class="preset-name">${p.name}</div>
      <div class="preset-dim">${p.w} × ${p.h}</div>
    </button>`).join('');
  html += `<div class="preset-card preset-custom">
      <div class="ico">📐</div>
      <div class="preset-name">직접 입력</div>
      <div class="row"><input id="cw" type="text" value="800" inputmode="numeric"><span>×</span><input id="ch" type="text" value="600" inputmode="numeric"></div>
      <button class="tb-btn primary" id="customGo" style="height:34px">시작</button>
    </div>`;
  grid.innerHTML = html;
  grid.querySelectorAll('.preset-card[data-i]').forEach(c =>
    c.onclick = () => { const p = list[+c.dataset.i]; openEditor(p.w, p.h); });
  const cg = document.getElementById('customGo');
  if (cg) cg.onclick = () => {
    const w = clamp(parseInt(document.getElementById('cw').value) || 800, 100, 4000);
    const h = clamp(parseInt(document.getElementById('ch').value) || 600, 100, 4000);
    openEditor(w, h);
  };
}
document.querySelectorAll('.start-tab').forEach(t => t.onclick = () => {
  document.querySelectorAll('.start-tab').forEach(x => x.classList.remove('on'));
  t.classList.add('on'); audience = t.dataset.aud; renderPresets();
});
renderPresets();
renderGenGrid();

/* ============ 에디터 진입 ============ */
var editorOpen = false;
function openEditor(w, h) {
  baseW = w; baseH = h;
  startEl.classList.add('hidden');
  document.getElementById('editor').classList.remove('hidden');
  initCanvas();
  editorOpen = true;
  try { history.pushState({ kmake: 'editor' }, ''); } catch (e) {}
}
function openTemplate(key) {
  const t = KM_TEMPLATES[key]; if (!t) return;
  if (t.doc) { // v4 다중 씬 doc형 템플릿 (라이프 청첩장 등)
    const d = JSON.parse(JSON.stringify(t.doc)); // 원본 보호 깊은 복사
    openEditor(d.baseW, d.baseH);
    KM_SCENE.loadDoc(d, () => { zoomFit(); toast('템플릿 열림 — 글자를 눌러 내용만 바꾸면 완성! 재생 ▶으로 미리 봐요'); });
    return;
  }
  openEditor(t.w, t.h);
  loadSVGTemplate(t);
}

/* ============ 뚝딱 만들기 (M1 생성기 접합) ============ */
const GEN_KINDS = [
  { k: 'award',     ico: '🏆', n: '상장',     w: 1123, h: 794,  aud: 'teacher' },
  { k: 'card',      ico: '💌', n: '축하 카드', w: 540,  h: 740,  aud: 'student' },
  { k: 'worksheet', ico: '📝', n: '학습지',   w: 794,  h: 1123, aud: 'teacher' },
  { k: 'nametag',   ico: '🏷️', n: '이름표',   w: 700,  h: 260,  aud: 'teacher' },
  { k: 'notice',    ico: '📢', n: '안내장',   w: 1123, h: 794,  aud: 'teacher' },
  { k: 'poster',    ico: '🎨', n: '포스터',   w: 794,  h: 1123, aud: 'student' },
];
let lastGen = null;
function renderGenGrid() {
  const g = document.getElementById('genGrid'); if (!g || !window.KM_GEN) return;
  g.innerHTML = GEN_KINDS.map(s =>
    `<button class="gen-card" data-k="${s.k}"><div class="gi">${s.ico}</div><div class="gn">${s.n}</div></button>`).join('');
  g.querySelectorAll('.gen-card').forEach(c => c.onclick = () => generateTemplate(c.dataset.k));
}
function measureText(text, fontSize, fontFamily) {
  if (typeof fabric === 'undefined') return 0;
  let w = 0;
  String(text).split('\n').forEach(l => { const t = new fabric.Text(l || ' ', { fontSize, fontFamily }); w = Math.max(w, t.width); });
  return w;
}
function generateTemplate(kind) {
  const spec = GEN_KINDS.find(x => x.k === kind); if (!spec || !window.KM_GEN) return;
  lastGen = { kind: kind, seeds: KM_GEN.newSeeds(), spec: spec };
  buildGen();
}
function buildGen() {
  const { kind, seeds, spec } = lastGen;
  const doc = KM_GEN.generate(kind, seeds, { w: spec.w, h: spec.h, _aud: spec.aud }, { measure: measureText, kitColor: (window.KM_MERGE && KM_MERGE.kitColor()) || null });
  if (!editorOpen) openEditor(doc.baseW, doc.baseH);
  else { baseW = doc.baseW; baseH = doc.baseH; }
  KM_SCENE.loadDoc(doc, () => { zoomFit(); showReroll(); });
}
function doReroll(which) {
  if (!lastGen) return;
  lastGen.seeds = KM_GEN.rerollSeeds(lastGen.seeds, which);  // §0 전체 재실행
  buildGen();
}
function ensureRerollBar() {
  let bar = document.getElementById('rerollBar');
  if (bar) return bar;
  const wrap = document.querySelector('.canvas-wrap'); if (!wrap) return null;
  bar = document.createElement('div'); bar.id = 'rerollBar';
  bar.innerHTML =
    '<button class="rb primary" data-r="all">🎲 전부</button>' +
    '<button class="rb" data-r="color">🎨 색</button>' +
    '<button class="rb" data-r="font">🔤 글꼴</button>' +
    '<button class="rb" data-r="material">🖼 배경</button>' +
    '<div class="rb-div"></div>' +
    '<button class="rb fill" data-r="fill">✏️ 글자 채우기</button>';
  wrap.appendChild(bar);
  bar.addEventListener('click', e => {
    const b = e.target.closest('.rb'); if (!b) return;
    if (b.dataset.r === 'fill') { hideReroll(); enterFillMode(); }
    else doReroll(b.dataset.r);
  });
  return bar;
}
function showReroll() { const b = ensureRerollBar(); if (b) b.classList.add('show'); }
function hideReroll() { const b = document.getElementById('rerollBar'); if (b) b.classList.remove('show'); }
function enterFillMode() {
  const btn = document.querySelector('#modeToggle button[data-mode="fill"]');
  if (btn) btn.click();
}
// 홈 버튼/로고 → 브라우저 뒤로가기와 동일 경로(popstate)로 처리해 confirm·복원을 일원화
function goHome() {
  if (editorOpen) { history.back(); return; }
  doRestoreHome();
}
function doRestoreHome() {
  KM_MOTION.exitPlay(); KM_MOTION.setMotionBg(null); KM_SCENE.teardown();
  if (canvas) { canvas.dispose(); canvas = null; }
  undoStack = []; redoStack = []; mode = 'edit'; imgTarget = null; openPop = null;
  lastGen = null; hideReroll();
  if (window.KM_MERGE) KM_MERGE.reset();
  if (window.KM_ALIGN) KM_ALIGN.reset();
  document.querySelectorAll('#modeToggle button').forEach(x => x.classList.toggle('on', x.dataset.mode === 'edit'));
  document.getElementById('modeBanner').classList.add('hidden');
  document.getElementById('iconPanel').classList.add('hidden');
  document.getElementById('bgPanel').classList.add('hidden');
  document.getElementById('toolbar').classList.remove('locked');
  document.getElementById('editor').classList.add('hidden');
  startEl.classList.remove('hidden');
  renderPresets();
  editorOpen = false;
}
// 편집기에서 뒤로가기: 작업물 있으면 확인, 취소 시 편집기 유지(history 재push)
window.addEventListener('popstate', function () {
  if (!editorOpen) return;
  if (canvas && canvas.getObjects().length && !confirm('지금 만들던 내용이 사라져요. 템플릿 고르기로 돌아갈까요?')) {
    try { history.pushState({ kmake: 'editor' }, ''); } catch (e) {}
    return;
  }
  doRestoreHome();
});
function loadSVGTemplate(t) {
  fabric.loadSVGFromString(t.svg, (objects) => {
    lockHistory = true;
    let ti = 0;
    objects.forEach(o => {
      let obj = o;
      // SVG <text>는 static이라 편집 불가 → 편집·슬롯 가능한 IText로 변환 (위치/스타일 그대로 복사)
      if (o.type === 'text' || o.type === 'i-text') {
        obj = new fabric.IText(o.text, {
          left: o.left, top: o.top, originX: o.originX, originY: o.originY,
          fontSize: o.fontSize, fontFamily: o.fontFamily, fill: o.fill,
          fontWeight: o.fontWeight, fontStyle: o.fontStyle, textAlign: o.textAlign,
          charSpacing: o.charSpacing, angle: o.angle, opacity: o.opacity,
          editingBorderColor: '#5B8EF8',
        });
        const label = t.textSlots && t.textSlots[ti];
        if (label) obj.kmSlot = { on: true, label: label };
        ti++;
      }
      canvas.add(obj);
    });
    lockHistory = false;
    canvas.requestRenderAll();
    undoStack = []; redoStack = []; pushHistory();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => canvas && canvas.requestRenderAll());
  });
}
function initCanvas() {
  // 이전 fabric 래퍼 잔재 제거 후 깨끗한 캔버스 생성 (홈 복귀→재진입 대비)
  const stage = document.querySelector('.canvas-stage');
  stage.innerHTML = '<canvas id="c"></canvas>';
  const el = document.getElementById('c'); el.width = baseW; el.height = baseH;
  canvas = new fabric.Canvas('c', { backgroundColor: '#fff', preserveObjectStacking: true });
  canvas.setDimensions({ width: baseW, height: baseH });
  canvas.on('selection:created', onSelect);
  canvas.on('selection:updated', onSelect);
  canvas.on('selection:cleared', onSelect);
  canvas.on('object:moving', onMoving);
  canvas.on('object:scaling', onScaling);
  canvas.on('object:modified', () => { clearGuides(); pushHistory(); syncPanelDims(); hideReroll(); });
  canvas.on('object:added', () => { if (!lockHistory) pushHistory(); });
  canvas.on('object:removed', () => { if (!lockHistory) pushHistory(); });
  canvas.on('mouse:up', clearGuides);
  canvas.on('after:render', drawSlotHints);
  KM_MOTION.mountBg();
  // 씬 엔진 훅 주입 (scene.js) — fabric·히스토리 조작은 전부 이 훅 안에서만
  KM_SCENE.init({
    snapshot: () => ({ json: canvas.toJSON(['kmSlot']), motionBg: KM_MOTION.getBgKey(), thumb: sceneThumb() }),
    blankJson: () => ({ version: '5.3.0', objects: [], background: '#fff' }),
    load: (sc, done) => {
      lockHistory = true; canvas.discardActiveObject(); canvas.clear(); canvas.backgroundColor = '#fff';
      canvas.loadFromJSON(sc.json, () => {
        KM_MOTION.setMotionBg(sc.motionBg || null, { keepBgColor: !!sc.motionBg });
        applyMode(); canvas.requestRenderAll(); lockHistory = false;
        undoStack = []; redoStack = []; pushHistory(); onSelect();
        if (done) done();
      });
    },
  });
  KM_SCENE.boot();
  if (window.KM_MERGE) KM_MERGE.init({ meta: () => ({ baseW, baseH, audience }), toast });
  if (window.KM_ALIGN) KM_ALIGN.init({ getCanvas: () => canvas, getZoom: () => zoom, getBase: () => ({ w: baseW, h: baseH }), getMode: () => mode, pushHistory, toast });
  zoomFit(); pushHistory(); onSelect(); updateUndoBtns();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => canvas && canvas.requestRenderAll());
}

/* ============ 요소 추가 ============ */
document.getElementById('toolbar').addEventListener('click', e => {
  const b = e.target.closest('.tool'); if (!b || mode === 'fill') return;
  addElement(b.dataset.tool);
});
const ctr = () => ({ left: baseW / 2, top: baseH / 2 });
function addElement(type) {
  let o; const c = ctr();
  if (type === 'text') {
    o = new fabric.Textbox('내용을 입력하세요', { left: c.left, top: c.top, width: Math.min(baseW * 0.62, 460), fontSize: Math.max(20, Math.round(baseW / 16)), fontFamily: 'Jua', fill: '#2D3748', textAlign: 'center', originX: 'center', originY: 'center', editingBorderColor: '#5B8EF8' });
  } else if (type === 'rect') {
    o = new fabric.Rect({ left: c.left, top: c.top, width: 220, height: 140, fill: '#EEF4FE', stroke: '#5B8EF8', strokeWidth: 3, rx: 10, ry: 10, originX: 'center', originY: 'center' });
  } else if (type === 'circle') {
    o = new fabric.Circle({ left: c.left, top: c.top, radius: 90, fill: '#FEF6E3', stroke: '#F59E0B', strokeWidth: 3, originX: 'center', originY: 'center' });
  } else if (type === 'line') {
    o = new fabric.Line([c.left - 130, c.top, c.left + 130, c.top], { stroke: '#2D3748', strokeWidth: 4, strokeLineCap: 'round' });
  } else if (type === 'arrow') {
    o = makeArrow(c.left - 120, c.top, c.left + 120, c.top, '#2D3748', 4);
  } else if (type === 'image') { imgTarget = null; document.getElementById('imgInput').click(); return; }
  else if (type === 'icon') { toggleIconPanel(); return; }
  else if (type === 'bg') { toggleBgPanel(); return; }
  if (o) { canvas.add(o); canvas.setActiveObject(o); canvas.requestRenderAll(); }
}
function makeArrow(x1, y1, x2, y2, color, w) {
  const line = new fabric.Line([x1, y1, x2, y2], { stroke: color, strokeWidth: w, strokeLineCap: 'round' });
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const head = new fabric.Triangle({ left: x2, top: y2, originX: 'center', originY: 'center', width: w * 5, height: w * 5, fill: color, angle: ang + 90 });
  return new fabric.Group([line, head], { originX: 'center', originY: 'center' });
}

/* ---------- 카드 링크 (뷰어 공유) — 라이프 확장 v1: 해시 링크 ---------- */
function loadLZ() {
  return new Promise((res, rej) => {
    if (window.LZString) return res();
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js';
    sc.onload = res; sc.onerror = () => rej(new Error('압축 모듈 로드 실패'));
    document.head.appendChild(sc);
  });
}
async function makeCardLink() {
  closePops();
  try {
    const json = JSON.stringify(KM_SCENE.serializeDoc({ baseW, baseH, audience }));
    if (json.includes('data:image')) { toast('업로드한 사진이 든 카드는 링크 공유 준비 중 — 재료창고 실사·배경은 괜찮아요'); return; }
    await loadLZ();
    const c = LZString.compressToEncodedURIComponent(json);
    if (c.length > 8000) { toast('카드가 너무 커서 링크로 만들 수 없어요 — 씬이나 재료를 조금 줄여보세요'); return; }
    const url = location.origin + '/kmake/viewer.html#c=' + c;
    await navigator.clipboard.writeText(url);
    toast('💌 카드 링크 복사 완료! 카톡·문자에 붙여넣으면 움직이는 카드로 열려요');
  } catch (e) { toast(e.message || '링크 만들기에 실패했어요'); }
}

document.getElementById('imgInput').addEventListener('change', function (e) {
  const f = e.target.files[0]; if (!f) return;
  KM_PHOTO.loadImageFile(f, url => fabric.Image.fromURL(url, img => {
    if (imgTarget) {
      const t = imgTarget; img.set({ left: t.left, top: t.top, originX: t.originX, originY: t.originY, angle: t.angle });
      img.scaleToWidth(t.getScaledWidth()); img.kmSlot = t.kmSlot;
      KM_PHOTO.inherit(img, t); // 마스크·보정·모션 상속 (템플릿 사진 교체의 핵심)
      const i = canvas.getObjects().indexOf(t); canvas.remove(t); canvas.add(img); img.moveTo(i);
      applyMode(); imgTarget = null;
      if (mode === 'edit') { canvas.setActiveObject(img); onSelect(); }
    } else {
      const max = Math.min(baseW * 0.65, baseH * 0.65), s = Math.min(max / img.width, max / img.height, 1);
      img.set({ left: ctr().left, top: ctr().top, originX: 'center', originY: 'center', scaleX: s, scaleY: s });
      canvas.add(img); canvas.setActiveObject(img);
    }
    canvas.requestRenderAll();
  }, { crossOrigin: 'anonymous' }), m => toast(m));
  e.target.value = '';
});

/* ============ 지능 편집(스냅·정돈) → align.js 위임 ============ */
function onMoving(e) { if (window.KM_ALIGN) KM_ALIGN.onMoving(e); }
function onScaling(e) { if (window.KM_ALIGN) KM_ALIGN.onScaling(e); }
function clearGuides() { if (window.KM_ALIGN) KM_ALIGN.clear(); else if (canvas) canvas.clearContext(canvas.contextTop); }

/* ============ 배경 패널 ============ */
let bgCat = 'all';
function toggleBgPanel() {
  const p = document.getElementById('bgPanel');
  const open = !p.classList.contains('hidden');
  document.getElementById('iconPanel').classList.add('hidden');
  if (open) { p.classList.add('hidden'); return; }
  p.classList.remove('hidden');
  if (!p.dataset.init) { initBgPanel(); p.dataset.init = '1'; }
}
function initBgPanel() {
  const cats = document.getElementById('bgCats');
  cats.innerHTML = `<button class="ip-cat on" data-cat="all">전체</button>` +
    (window.BG_CATS || []).map(([cid, nm]) => `<button class="ip-cat" data-cat="${cid}">${nm}</button>`).join('');
  cats.querySelectorAll('.ip-cat').forEach(b => b.onclick = () => {
    cats.querySelectorAll('.ip-cat').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); bgCat = b.dataset.cat; renderBgGrid();
  });
  document.getElementById('bgClose').onclick = () => document.getElementById('bgPanel').classList.add('hidden');
  renderBgGrid();
}
function renderBgGrid() {
  let list = window.BACKGROUNDS || [];
  if (bgCat !== 'all') list = list.filter(b => b.c === bgCat);
  const grid = document.getElementById('bgGrid');
  let html = `<button class="ip-item bg-none" data-none="1"><span style="font-size:20px">⬜</span>배경 없음</button>`;
  html += KM_MOTION.bgItemsHTML();
  html += list.map((b, idx) => `<button class="ip-item" data-idx="${idx}" title="${b.n}">${b.img
    ? `<img src="${b.img}" alt="${b.n}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`
    : `<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">${b.s}</svg>`}</button>`).join('');
  if (!list.length) html += `<div class="ip-empty" style="grid-column:1/-1">정적 배경도 준비 중이에요 ✨</div>`;
  grid.innerHTML = html;
  grid.querySelector('[data-none]').onclick = () => { KM_MOTION.setMotionBg(null); clearBackground(); renderBgGrid(); };
  grid.querySelectorAll('.mbg-item').forEach(b => b.onclick = () => { KM_MOTION.setMotionBg(b.dataset.mbg); pushHistory(); renderBgGrid(); });
  grid.querySelectorAll('.ip-item[data-idx]').forEach(b => b.onclick = () => { KM_MOTION.setMotionBg(null); applyBackground(list[+b.dataset.idx]); renderBgGrid(); });
}
function applyBackground(bg) {
  canvas.getObjects().filter(o => o.kmType === 'background').forEach(o => canvas.remove(o));
  if (bg.img) { // v2 실사 이미지 배경 — 캔버스를 덮도록 커버핏, 중앙 정렬
    fabric.Image.fromURL(bg.img, img => {
      const s = Math.max(baseW / img.width, baseH / img.height) * 1.01; // 직렬화 반올림 틈 방지 여유
      img.set({ left: baseW / 2, top: baseH / 2, originX: 'center', originY: 'center', scaleX: s, scaleY: s, selectable: false, evented: false, kmType: 'background' });
      canvas.add(img); img.sendToBack(); canvas.requestRenderAll(); pushHistory();
    }, { crossOrigin: 'anonymous' });
    return;
  }
  const svg = `<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">${bg.s}</svg>`;
  fabric.loadSVGFromString(svg, (objs, opts) => {
    const g = fabric.util.groupSVGElements(objs, opts);
    g.set({ left: 0, top: 0, originX: 'left', originY: 'top', scaleX: baseW / 1200, scaleY: baseH / 800, selectable: false, evented: false, kmType: 'background' });
    canvas.add(g); g.sendToBack(); canvas.requestRenderAll(); pushHistory();
  });
}
function clearBackground() {
  canvas.getObjects().filter(o => o.kmType === 'background').forEach(o => canvas.remove(o));
  canvas.requestRenderAll(); pushHistory();
}

/* ============ 아이콘 패널 ============ */
let iconCat = 'all', iconMode = 'line';
function toggleIconPanel() {
  const p = document.getElementById('iconPanel');
  const open = !p.classList.contains('hidden');
  document.getElementById('bgPanel').classList.add('hidden');
  if (open) { p.classList.add('hidden'); return; }
  p.classList.remove('hidden');
  if (!p.dataset.init) { initIconPanel(); p.dataset.init = '1'; }
}
function initIconPanel() {
  document.querySelectorAll('.ip-mode').forEach(b => b.onclick = () => {
    document.querySelectorAll('.ip-mode').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); iconMode = b.dataset.im; iconCat = 'all';
    document.getElementById('ipSearch').value = '';
    const done = () => { buildCatChips(); renderIconGrid(); };
    if (iconMode === 'color') loadAsset('stickers.js', 'STICKERS', done);
    else if (iconMode === 'illust') loadAsset('illust.js', 'ILLUSTS', done);
    else if (iconMode === 'photo') loadAsset('materials.js', 'MATERIALS', done);
    else done();
  });
  document.getElementById('ipSearch').oninput = renderIconGrid;
  document.getElementById('ipClose').onclick = () => document.getElementById('iconPanel').classList.add('hidden');
  buildCatChips(); renderIconGrid();
}
function loadAsset(src, glob, cb) {
  if (window[glob]) return cb();
  const grid = document.getElementById('ipGrid');
  grid.innerHTML = `<div class="ip-empty">불러오는 중…</div>`;
  const s = document.createElement('script'); s.src = src; s.onload = cb;
  s.onerror = () => { grid.innerHTML = `<div class="ip-empty">불러오기 실패</div>`; };
  document.head.appendChild(s);
}
function curCats() {
  if (iconMode === 'color') return window.STICKER_CATS || [];
  if (iconMode === 'illust') return [];
  if (iconMode === 'shape') return window.SHAPE_CATS || [];
  if (iconMode === 'photo') return window.MATERIAL_CATS || [];
  return ICON_CATS;
}
function curList() {
  if (iconMode === 'color') return window.STICKERS || [];
  if (iconMode === 'illust') return window.ILLUSTS || [];
  if (iconMode === 'shape') return window.SHAPES || [];
  if (iconMode === 'photo') return window.MATERIALS || [];
  return ICONS;
}
function buildCatChips() {
  const cats = document.getElementById('ipCats');
  cats.innerHTML = `<button class="ip-cat on" data-cat="all">전체</button>` +
    curCats().map(([cid, nm]) => `<button class="ip-cat" data-cat="${cid}">${nm}</button>`).join('');
  cats.querySelectorAll('.ip-cat').forEach(b => b.onclick = () => {
    cats.querySelectorAll('.ip-cat').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); iconCat = b.dataset.cat; document.getElementById('ipSearch').value = ''; renderIconGrid();
  });
}
function renderIconGrid() {
  const q = document.getElementById('ipSearch').value.trim().toLowerCase();
  let list = curList();
  if (q) list = list.filter(i => i.n.includes(q) || (i.k && i.k.includes(q)));
  else if (iconCat !== 'all') list = list.filter(i => i.c === iconCat);
  const grid = document.getElementById('ipGrid');
  grid.classList.toggle('illust', iconMode === 'illust');
  grid.classList.toggle('photo', iconMode === 'photo');
  if (!list.length) {
    grid.innerHTML = (iconMode === 'photo' && !q && iconCat === 'all')
      ? `<div class="ip-empty">실사 재료 입고 준비 중이에요 ✨<br><span style="font-size:11.5px">금박·플로럴·시즌 장식이 곧 들어와요</span></div>`
      : `<div class="ip-empty">결과가 없어요</div>`;
    return;
  }
  const show = list.slice(0, 400);
  const lineAttr = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  grid.innerHTML = show.map((i, idx) => {
    if (iconMode === 'photo')
      return `<button class="ip-item" data-idx="${idx}" title="${i.n}"><img src="${i.img}" alt="${i.n}" loading="lazy" style="width:100%;height:100%;object-fit:contain;display:block"></button>`;
    const vb = iconMode === 'color' ? '0 0 72 72' : (iconMode === 'illust' || iconMode === 'shape') ? i.vb : '0 0 24 24';
    const attr = iconMode === 'line' ? lineAttr : '';
    return `<button class="ip-item" data-idx="${idx}" title="${i.n}"><svg viewBox="${vb}" ${attr}>${i.s}</svg></button>`;
  }).join('');
  grid.querySelectorAll('.ip-item').forEach(b => b.onclick = () => {
    const it = show[+b.dataset.idx];
    if (iconMode === 'photo') addMaterial(it);
    else if (iconMode === 'color') addSticker(it.s);
    else if (iconMode === 'illust') addIllust(it);
    else if (iconMode === 'shape') addShape(it);
    else addIcon(it.s);
  });
}
function addMaterial(it) { // v2 실사 PNG 재료 — 파일 참조, 직렬화 시 src 자동 보존
  fabric.Image.fromURL(it.img, img => {
    if (!img || !img.width) { toast('재료를 불러올 수 없어요'); return; }
    img.set({ left: baseW / 2, top: baseH / 2, originX: 'center', originY: 'center' });
    img.scaleToWidth(Math.min(baseW, baseH) * 0.35);
    img.kmType = 'material';
    canvas.add(img); canvas.setActiveObject(img); canvas.requestRenderAll();
  }, { crossOrigin: 'anonymous' });
}
function addShape(it) {
  insertSvg(`<svg viewBox="${it.vb}" xmlns="http://www.w3.org/2000/svg">${it.s}</svg>`, 'shape', Math.min(baseW, baseH) * 0.22);
}
function addIcon(inner) {
  insertSvg(`<svg viewBox="0 0 24 24" fill="none" stroke="#2D3748" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`, 'icon', Math.min(baseW, baseH) * 0.18);
}
function addSticker(inner) {
  insertSvg(`<svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`, 'sticker', Math.min(baseW, baseH) * 0.18);
}
function addIllust(it) {
  insertSvg(`<svg viewBox="${it.vb}" xmlns="http://www.w3.org/2000/svg">${it.s}</svg>`, 'illust', Math.min(baseW, baseH) * 0.45);
}
function insertSvg(svg, kind, size) {
  fabric.loadSVGFromString(svg, (objs, opts) => {
    const g = fabric.util.groupSVGElements(objs, opts);
    g.set({ left: baseW / 2, top: baseH / 2, originX: 'center', originY: 'center' });
    g.scaleToWidth(size);
    g.kmType = kind;
    canvas.add(g); canvas.setActiveObject(g); canvas.requestRenderAll();
  });
}
// 아이콘(라인) 색 일괄 변경
function setIconColor(g, color) {
  const apply = o => { if (o._objects) o._objects.forEach(apply); else { if (o.stroke) o.set('stroke', color); if (o.fill && o.fill !== '' && o.fill !== 'none') o.set('fill', color); } };
  apply(g);
  g.dirty = true; canvas.requestRenderAll();
}
const ctxbar = document.getElementById('ctxbar');
let openPop = null;
function onSelect() {
  const o = canvas && canvas.getActiveObject();
  buildCtxbar(o); buildPanel(o);
  if (window.KM_ALIGN) KM_ALIGN.onSelect(o);
}
function buildCtxbar(o) {
  closePops();
  if (!o || mode === 'fill') { ctxbar.classList.add('empty'); ctxbar.innerHTML = ''; return; }
  ctxbar.classList.remove('empty');
  const isText = o.type === 'textbox';
  const isShape = ['rect', 'circle', 'triangle', 'line'].includes(o.type);
  let g = '';
  if (isText) {
    g += `<div class="ctx-group">${fontDD(o)}</div><div class="ctx-sep"></div>
      <div class="ctx-group">${stepper('fs', Math.round(o.fontSize), '글자 크기')}</div>
      <div class="ctx-group">
        <button class="ctx-btn ${o.fontWeight === 'bold' ? 'on' : ''}" data-act="bold" title="굵게"><b>B</b></button>
        ${alignBtns(o.textAlign)}
      </div><div class="ctx-sep"></div>
      <div class="ctx-group">${colorBtn('fill', o.fill, '글자색')}</div>`;
  } else if (isShape) {
    if (o.type !== 'line') g += `<div class="ctx-group">${colorBtn('fill', o.fill, '채움')}</div>`;
    g += `<div class="ctx-group">${colorBtn('stroke', o.stroke || '#2D3748', '테두리')}</div>
      <div class="ctx-sep"></div><div class="ctx-group">${stepper('sw', o.strokeWidth || 0, '테두리 굵기')}</div>`;
  } else { g += (o.kmType === 'icon' || o.kmType === 'shape')
    ? `<div class="ctx-group">${colorBtn('iconcolor', '#5B8EF8', '색 바꾸기')}</div>`
    : `<div class="ctx-group" style="color:var(--gray-l);font-size:13px;padding:0 6px">${o.type === 'image' ? '🖼 이미지' : '➶ 묶음'} 선택됨</div>`; }
  g += `<div class="ctx-sep"></div><div class="ctx-group">
      <button class="ctx-btn" data-act="dup" title="복제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
      <button class="ctx-btn del" data-act="del" title="삭제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg></button>
    </div>`;
  ctxbar.innerHTML = g;
  bindCtx(o);
}
function fontDD(o) {
  const cur = FONT_OF(o.fontFamily) || FONT_OF('Jua');
  return `<div class="font-dd"><button data-pop="font"><span style="font-family:'${cur[0]}'">${cur[1]}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></button>
    <div class="font-list hidden">${KO_FONTS.map(f => f[0] === '—'
      ? `<div class="font-div">${f[1]}</div>`
      : `<button class="font-item ${f[0] === o.fontFamily ? 'sel' : ''}" data-font="${f[0]}">가나다 ABC<span class="fname">${f[1]}</span></button>`).join('')}</div></div>`;
}
function stepper(key, val, title) {
  return `<div class="stepper" title="${title}"><button data-step="${key}:-">−</button><input data-num="${key}" value="${val}" inputmode="numeric"><button data-step="${key}:+">+</button></div>`;
}
function alignBtns(cur) {
  const A = [['left', 'M4 6h16M4 12h10M4 18h13'], ['center', 'M4 6h16M7 12h10M5 18h14'], ['right', 'M4 6h16M10 12h10M7 18h13']];
  return A.map(([a, d]) => `<button class="ctx-btn ${cur === a ? 'on' : ''}" data-align="${a}" title="${a}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="${d}"/></svg></button>`).join('');
}
function colorBtn(key, val, label) {
  return `<div class="color-btn"><button data-pop="color:${key}"><span class="chip" style="background:${toHex(val)}"></span>${label}</button>
    <div class="color-pop hidden"><div class="swatches">${PALETTE.map(c => `<button data-color="${key}:${c}" class="${toHex(val) === c.toUpperCase() ? 'sel' : ''}" style="background:${c}"></button>`).join('')}</div>
    <div class="color-custom"><input type="color" data-colorpick="${key}" value="${toHex(val)}"><span>직접 고르기</span></div></div></div>`;
}
function bindCtx(o) {
  const render = () => canvas.requestRenderAll();
  ctxbar.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const a = b.dataset.act;
    if (a === 'bold') { o.set('fontWeight', o.fontWeight === 'bold' ? 'normal' : 'bold'); render(); pushHistory(); buildCtxbar(o); }
    if (a === 'dup') duplicate(o);
    if (a === 'del') { canvas.remove(o); canvas.discardActiveObject(); render(); onSelect(); }
  });
  ctxbar.querySelectorAll('[data-align]').forEach(b => b.onclick = () => { o.set('textAlign', b.dataset.align); render(); pushHistory(); buildCtxbar(o); });
  ctxbar.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
    const [k, d] = b.dataset.step.split(':'); stepVal(o, k, d === '+' ? 1 : -1); buildCtxbar(o);
  });
  ctxbar.querySelectorAll('[data-num]').forEach(inp => inp.onchange = () => { setNum(o, inp.dataset.num, parseInt(inp.value)); });
  // 폰트 피커 지연 로딩 — 팝업 열림·스크롤 시점에 보이는 항목만 해당 폰트로 렌더
  // (50종 원본 woff 일괄 다운로드 방지. IO는 숨김 루트에서 미발화 사례가 있어 rect 직접 계산)
  const flist = ctxbar.querySelector('.font-list');
  if (flist) {
    const applyVisible = () => {
      const r = flist.getBoundingClientRect();
      flist.querySelectorAll('.font-item:not(.ffed)').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.bottom >= r.top - 120 && b.top <= r.bottom + 120) {
          el.style.fontFamily = `'${el.dataset.font}'`; el.classList.add('ffed');
        }
      });
    };
    flist.addEventListener('scroll', applyVisible, { passive: true });
    flist.__lazyApply = applyVisible;
  }
  ctxbar.querySelectorAll('[data-font]').forEach(b => b.onclick = () => {
    const fam = b.dataset.font;
    o.set('fontFamily', fam); render(); pushHistory(); buildCtxbar(o);
    // 웹폰트가 아직 안 내려왔으면 로드 완료 후 캔버스 재렌더 (fabric 폰트 측정 갱신)
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`20px "${fam}"`).then(() => {
        if (!canvas) return;
        o.initDimensions && o.initDimensions();
        canvas.requestRenderAll();
      }).catch(() => {});
    }
  });
  // 팝오버 토글
  ctxbar.querySelectorAll('[data-pop]').forEach(b => b.onclick = ev => {
    ev.stopPropagation();
    const pop = b.nextElementSibling, wasOpen = !pop.classList.contains('hidden');
    closePops(); if (!wasOpen) {
      pop.classList.remove('hidden'); openPop = pop;
      // ctxbar는 overflow-x:auto(클리핑 컨테이너) — 팝업을 fixed로 승격해 잘림 탈출
      const r = b.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.top = (r.bottom + 6) + 'px';
      pop.style.left = Math.max(8, Math.min(r.left, window.innerWidth - pop.offsetWidth - 10)) + 'px';
      if (pop.__lazyApply) requestAnimationFrame(pop.__lazyApply); // 폰트 미리보기 지연 로딩 발화
    }
  });
  ctxbar.querySelectorAll('[data-color]').forEach(b => b.onclick = () => {
    const [k, c] = b.dataset.color.split(':');
    if (k === 'iconcolor') setIconColor(o, c); else o.set(k, c);
    render(); pushHistory(); buildCtxbar(o);
  });
  ctxbar.querySelectorAll('[data-colorpick]').forEach(inp => {
    inp.oninput = () => { const k = inp.dataset.colorpick; if (k === 'iconcolor') setIconColor(o, inp.value); else o.set(k, inp.value); render(); };
    inp.onchange = () => { pushHistory(); buildCtxbar(o); };
  });
}
function stepVal(o, k, dir) {
  if (k === 'fs') o.set('fontSize', clamp(Math.round(o.fontSize) + dir * 2, 6, 400));
  if (k === 'sw') o.set('strokeWidth', clamp((o.strokeWidth || 0) + dir, 0, 80));
  canvas.requestRenderAll(); pushHistory();
}
function setNum(o, k, v) {
  if (isNaN(v)) return;
  if (k === 'fs') o.set('fontSize', clamp(v, 6, 400));
  if (k === 'sw') o.set('strokeWidth', clamp(v, 0, 80));
  canvas.requestRenderAll(); pushHistory(); buildCtxbar(o);
}
function closePops() { if (openPop) { openPop.classList.add('hidden'); openPop = null; } document.getElementById('exportMenu').classList.add('hidden'); }
document.addEventListener('click', e => {
  if (!e.target.closest('.font-dd') && !e.target.closest('.color-btn') && !e.target.closest('#exportMenu') && e.target.id !== 'btnExport') closePops();
});

/* ============ 우측 패널 ============ */
const panel = document.getElementById('panel');
function buildPanel(o) {
  if (!o) {
    panel.innerHTML = `<div class="p-empty"><div class="big">✨</div><p>왼쪽에서 요소를 더하거나<br>캔버스에서 선택해 보세요</p></div>`;
    return;
  }
  if (mode === 'fill') { buildFillPanel(o); return; }
  const isText = o.type === 'textbox';
  let h = '';
  if (isText) h += `<div class="panel-sec"><h3>내용</h3><div class="field"><textarea id="pText">${esc(o.text)}</textarea></div></div>`;
  // 정렬 맞춤
  h += `<div class="panel-sec"><h3>캔버스 정렬</h3><div class="align-grid">
    ${alignTo('hl', '왼쪽', 'M5 4v16M9 8h8v3H9zM9 14h5v3H9z')}
    ${alignTo('hc', '가운데', 'M12 4v16M7 8h10v3H7zM9 14h6v3H9z')}
    ${alignTo('hr', '오른쪽', 'M19 4v16M7 8h8v3H7zM10 14h5v3h-5z')}
    ${alignTo('vt', '위', 'M4 5h16M8 9h3v8H8zM14 9h3v5h-3z')}
    ${alignTo('vc', '중앙', 'M4 12h16M8 7h3v10H8zM14 9h3v6h-3z')}
    ${alignTo('vb', '아래', 'M4 19h16M8 7h3v8H8zM14 12h3v5h-3z')}
  </div></div>`;
  // 레이어
  h += `<div class="panel-sec"><h3>순서</h3><div class="layer-row">
    <button data-layer="front"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4-8 4-8-4 8-4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/></svg>맨 앞</button>
    <button data-layer="fwd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4l8 4-8 4-8-4z"/><path d="M4 14l8 4 8-4"/></svg>앞으로</button>
    <button data-layer="bwd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10l8 4 8-4"/><path d="M12 4l8 4-8 4-8-4z"/></svg>뒤로</button>
    <button data-layer="back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7l8 4 8-4M4 12l8 4 8-4"/><path d="M12 16l8 4-8 4-8-4 8-4z" opacity=".5"/></svg>맨 뒤</button>
  </div></div>`;
  // 투명도 + 크기
  h += `<div class="panel-sec"><h3>속성</h3>
    <div class="field"><label>투명도</label><div class="range-row"><input type="range" id="pOp" min="10" max="100" value="${Math.round((o.opacity ?? 1) * 100)}"><span class="val" id="pOpV">${Math.round((o.opacity ?? 1) * 100)}%</span></div></div>
    <div class="dim-grid"><div class="field"><label>너비</label><input id="pW" value="${Math.round(o.getScaledWidth())}" inputmode="numeric"></div>
    <div class="field"><label>높이</label><input id="pH" value="${Math.round(o.getScaledHeight())}" inputmode="numeric"></div></div></div>`;
  // 📸 사진 (마스크·보정 — photo.js)
  if (o.type === 'image' && o.kmType !== 'background') h += KM_PHOTO.panelHTML(o);
  // ✨ 움직임 (모션 엔진)
  h += KM_MOTION.panelHTML(o);
  // 슬롯
  const on = !!(o.kmSlot && o.kmSlot.on);
  h += `<div class="panel-sec"><div class="slot-box">
    <div class="slot-head"><span class="t">📌 슬롯</span>
      <label class="switch"><input type="checkbox" id="pSlot" ${on ? 'checked' : ''}><span class="track"></span></label></div>
    ${on ? `<div class="slot-label"><label>칸 이름</label><input id="pSlotLabel" value="${esc((o.kmSlot && o.kmSlot.label) || '')}" placeholder="예: 이름 / 날짜 / 사진"></div>` : ''}
    <div class="slot-hint">슬롯으로 지정하면 '채우기 모드'에서 이 칸만 바꿀 수 있어요. 틀은 그대로 두고 내용만 교체!</div>
  </div></div>`;
  panel.innerHTML = h;
  bindPanel(o, isText);
}
function alignTo(k, t, d) { return `<button data-alignto="${k}" title="${t}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="${d}"/></svg></button>`; }
function bindPanel(o, isText) {
  const $ = id => document.getElementById(id), render = () => canvas.requestRenderAll();
  if ($('pText')) $('pText').oninput = e => { o.set('text', e.target.value); render(); };
  if ($('pText')) $('pText').onchange = () => pushHistory();
  panel.querySelectorAll('[data-alignto]').forEach(b => b.onclick = () => { alignObj(o, b.dataset.alignto); render(); pushHistory(); syncPanelDims(); });
  panel.querySelectorAll('[data-layer]').forEach(b => b.onclick = () => {
    const a = b.dataset.layer;
    if (a === 'front') o.bringToFront(); if (a === 'back') o.sendToBack();
    if (a === 'fwd') o.bringForward(); if (a === 'bwd') o.sendBackwards();
    render(); pushHistory();
  });
  if ($('pOp')) $('pOp').oninput = e => { o.set('opacity', e.target.value / 100); $('pOpV').textContent = e.target.value + '%'; render(); };
  if ($('pOp')) $('pOp').onchange = () => pushHistory();
  if ($('pW')) $('pW').onchange = e => { const v = parseInt(e.target.value); if (v > 0) { o.scaleToWidth(v); render(); pushHistory(); syncPanelDims(); } };
  if ($('pH')) $('pH').onchange = e => { const v = parseInt(e.target.value); if (v > 0) { o.scaleToHeight(v); render(); pushHistory(); syncPanelDims(); } };
  KM_MOTION.bindPanel(o);
  if (o.type === 'image' && o.kmType !== 'background') KM_PHOTO.bindPanel(o, {
    render, pushHistory,
    rebuildPanel: buildPanel,
    requestSwap: t => { imgTarget = t; document.getElementById('imgInput').click(); },
  });
  if ($('pSlot')) $('pSlot').onchange = e => { o.kmSlot = e.target.checked ? { on: true, label: (o.kmSlot && o.kmSlot.label) || '' } : { on: false }; pushHistory(); buildPanel(o); };
  if ($('pSlotLabel')) $('pSlotLabel').onchange = e => { o.kmSlot = { on: true, label: e.target.value }; pushHistory(); };
}
function alignObj(o, k) {
  const b = o.getBoundingRect(true, true);
  if (k === 'hl') o.left += 0 - b.left;
  if (k === 'hc') o.left += baseW / 2 - (b.left + b.width / 2);
  if (k === 'hr') o.left += baseW - (b.left + b.width);
  if (k === 'vt') o.top += 0 - b.top;
  if (k === 'vc') o.top += baseH / 2 - (b.top + b.height / 2);
  if (k === 'vb') o.top += baseH - (b.top + b.height);
  o.setCoords();
}
function syncPanelDims() {
  const o = canvas.getActiveObject(); if (!o || mode === 'fill') return;
  const w = document.getElementById('pW'), h = document.getElementById('pH');
  if (w) w.value = Math.round(o.getScaledWidth());
  if (h) h.value = Math.round(o.getScaledHeight());
}
function buildFillPanel(o) {
  let h = '';
  if (o.type === 'textbox') h = `<div class="fill-card"><div class="fill-tag">📝 ${esc((o.kmSlot && o.kmSlot.label) || '텍스트')}</div><div class="field"><label>여기를 바꾸세요</label><textarea id="fText" autofocus>${esc(o.text)}</textarea></div></div>`;
  else if (o.type === 'image') h = `<div class="fill-card"><div class="fill-tag">🖼 ${esc((o.kmSlot && o.kmSlot.label) || '사진')}</div><button class="tb-btn primary" id="fSwap" style="width:100%;justify-content:center">📷 사진 바꾸기</button></div>`;
  panel.innerHTML = h;
  const $ = id => document.getElementById(id);
  if ($('fText')) $('fText').oninput = e => { o.set('text', e.target.value); canvas.requestRenderAll(); };
  if ($('fSwap')) $('fSwap').onclick = () => { imgTarget = o; document.getElementById('imgInput').click(); };
}

function duplicate(o) {
  o.clone(cl => { cl.set({ left: o.left + 26, top: o.top + 26 }); cl.kmSlot = o.kmSlot; canvas.add(cl); canvas.setActiveObject(cl); canvas.requestRenderAll(); }, ['kmSlot']);
}

/* ============ 모드 ============ */
document.getElementById('modeToggle').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });
function setMode(m) {
  mode = m;
  document.querySelectorAll('#modeToggle button').forEach(x => x.classList.toggle('on', x.dataset.mode === m));
  document.getElementById('modeBanner').classList.toggle('hidden', m !== 'fill');
  document.getElementById('toolbar').classList.toggle('locked', m === 'fill');
  canvas.discardActiveObject(); applyMode(); onSelect();
  if (window.KM_MERGE) KM_MERGE.onMode(m);
}
/* 채우기 모드 — 슬롯 위치를 노란 점선과 라벨 칩으로 표시 */
function drawSlotHints() {
  if (mode !== 'fill' || !canvas) return;
  const ctx = canvas.contextContainer;
  const active = canvas.getActiveObject();
  canvas.forEachObject(o => {
    if (!(o.kmSlot && o.kmSlot.on) || o === active) return;
    const r = o.getBoundingRect();
    ctx.save();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(r.left - 4, r.top - 4, r.width + 8, r.height + 8);
    const label = '✏️ ' + (o.kmSlot.label || (o.type === 'image' ? '사진' : '글자'));
    ctx.font = '700 12px "Gowun Dodum", "Noto Sans KR", sans-serif';
    const tw = ctx.measureText(label).width;
    const cx = r.left - 4, cy = r.top - 4 - 20;
    ctx.setLineDash([]);
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(cx, Math.max(2, cy), tw + 14, 18, 5); } else { ctx.rect(cx, Math.max(2, cy), tw + 14, 18); }
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx + 7, Math.max(2, cy) + 9.5);
    ctx.restore();
  });
}

function applyMode() {
  if (!canvas) return;
  canvas.forEachObject(o => {
    if (o.kmType === 'background') { o.selectable = false; o.evented = false; return; }
    if (mode === 'fill') {
      const s = !!(o.kmSlot && o.kmSlot.on);
      o.selectable = s; o.evented = s; o.hasControls = false;
      o.lockMovementX = o.lockMovementY = o.lockScalingX = o.lockScalingY = o.lockRotation = true;
      if (o.type === 'textbox') o.editable = s;
    } else {
      o.selectable = o.evented = o.hasControls = true;
      o.lockMovementX = o.lockMovementY = o.lockScalingX = o.lockScalingY = o.lockRotation = false;
      if (o.type === 'textbox') o.editable = true;
    }
  });
  canvas.requestRenderAll();
  KM_SCENE.setEditable(mode !== 'fill');
}

/* ============ 줌 ============ */
function sceneThumb() { // 씬 스트립용 소형 JPEG — 줌 무관 폭 140px
  try { return canvas.toDataURL({ format: 'jpeg', quality: 0.55, multiplier: 140 / (baseW * zoom) }); }
  catch (e) { return null; }
}
function applyZoom(z) { zoom = z; canvas.setZoom(z); canvas.setDimensions({ width: baseW * z, height: baseH * z }); document.getElementById('zoomFit').textContent = Math.round(z * 100) + '%'; }
function zoomFit() { const w = document.getElementById('canvasWrap'), pad = 80; applyZoom(Math.max(0.1, Math.min((w.clientWidth - pad) / baseW, (w.clientHeight - pad) / baseH, 2))); }
document.getElementById('zoomIn').onclick = () => applyZoom(Math.min(4, zoom + 0.1));
document.getElementById('zoomOut').onclick = () => applyZoom(Math.max(0.1, zoom - 0.1));
document.getElementById('zoomFit').onclick = zoomFit;
window.addEventListener('resize', () => { if (canvas) zoomFit(); });

/* ============ Undo / Redo ============ */
function pushHistory() { if (lockHistory || !canvas) return; redoStack = []; undoStack.push(JSON.stringify(canvas.toJSON(['kmSlot']))); if (undoStack.length > 80) undoStack.shift(); updateUndoBtns(); }
function loadState(j) { lockHistory = true; canvas.loadFromJSON(j, () => { applyMode(); canvas.requestRenderAll(); lockHistory = false; onSelect(); updateUndoBtns(); }); }
function undo() { if (undoStack.length <= 1) return; redoStack.push(undoStack.pop()); loadState(undoStack[undoStack.length - 1]); }
function redo() { if (!redoStack.length) return; const s = redoStack.pop(); undoStack.push(s); loadState(s); }
function updateUndoBtns() { const u = document.getElementById('btnUndo'), r = document.getElementById('btnRedo'); if (u) u.disabled = undoStack.length <= 1; if (r) r.disabled = !redoStack.length; }
document.getElementById('btnUndo').onclick = undo;
document.getElementById('btnRedo').onclick = redo;

/* ============ 내보내기 ============ */
document.getElementById('btnExport').onclick = e => { e.stopPropagation(); const m = document.getElementById('exportMenu'); const open = !m.classList.contains('hidden'); closePops(); if (!open) m.classList.remove('hidden'); };
function snapshot(scale) {
  const z = zoom; canvas.discardActiveObject();
  const mb = KM_MOTION.bgBaseColor(), prevBg = canvas.backgroundColor;
  if (mb) canvas.backgroundColor = mb; // 모션 배경은 인쇄물에선 기본색으로
  canvas.setZoom(1); canvas.setDimensions({ width: baseW, height: baseH }); canvas.renderAll();
  const url = canvas.toDataURL({ format: 'png', multiplier: scale || 2 });
  if (mb) canvas.backgroundColor = prevBg;
  applyZoom(z); return url;
}
function exportPNG() { closePops(); const a = document.createElement('a'); a.href = snapshot(2.5); a.download = '케이메이커.png'; a.click(); toast('PNG 저장 완료'); }
function exportPDF() { // 씬 = 페이지 (scene.js eachScene 순회)
  closePops(); const { jsPDF } = window.jspdf;
  const mmW = baseW / 96 * 25.4, mmH = baseH / 96 * 25.4, ori = mmW > mmH ? 'l' : 'p';
  const pdf = new jsPDF({ orientation: ori, unit: 'mm', format: [mmW, mmH] });
  let first = true;
  KM_SCENE.eachScene(() => {
    if (!first) pdf.addPage([mmW, mmH], ori);
    first = false;
    pdf.addImage(snapshot(2.5), 'PNG', 0, 0, mmW, mmH);
  }).then(() => {
    pdf.save('케이메이커.pdf');
    toast(KM_SCENE.count() > 1 ? `PDF 저장 완료 (${KM_SCENE.count()}페이지)` : 'PDF 저장 완료');
  });
}
function exportPPTX() {
  closePops();
  if (!window.PptxGenJS) { toast('PPT 모듈 로딩 중… 잠시 후 다시'); return; }
  const inW = baseW / 96, inH = baseH / 96;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'KM', width: inW, height: inH });
  pptx.layout = 'KM';
  KM_SCENE.eachScene(() => { // 씬 = 슬라이드
    const s = pptx.addSlide();
    s.addImage({ data: snapshot(3), x: 0, y: 0, w: inW, h: inH });
  }).then(() => pptx.writeFile({ fileName: '케이메이커.pptx' }))
    .then(() => toast(KM_SCENE.count() > 1 ? `PPT 저장 완료 (${KM_SCENE.count()}슬라이드)` : 'PPT 저장 완료'));
}

/* ============ 저장 / 불러오기 ============ */
document.getElementById('btnSave').onclick = () => {
  const data = KM_SCENE.serializeDoc({ baseW, baseH, audience }); // v4 다중 씬 (scene.js)
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })); a.download = '케이메이커.kmake'; a.click(); toast('작업파일 저장 완료');
};
document.getElementById('btnOpen').onclick = () => document.getElementById('jsonInput').click();
document.getElementById('jsonInput').addEventListener('change', function (e) {
  const f = e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = ev => { try {
    const d = JSON.parse(ev.target.result); baseW = d.baseW; baseH = d.baseH; audience = d.audience || 'teacher';
    KM_SCENE.loadDoc(d, () => { zoomFit(); toast(KM_SCENE.count() > 1 ? `불러오기 완료 (씬 ${KM_SCENE.count()}개)` : '불러오기 완료'); });
  } catch (err) { toast('파일을 읽을 수 없어요'); } };
  r.readAsText(f); e.target.value = '';
});

/* ============ 키보드 ============ */
document.addEventListener('keydown', e => {
  if (!canvas) return;
  const ae = document.activeElement, ao = canvas.getActiveObject();
  const typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || (ao && ao.isEditing));
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
  if (typing) return;
  if (!ao || mode === 'fill') return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); canvas.remove(ao); canvas.discardActiveObject(); canvas.requestRenderAll(); onSelect(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(ao); }
  const nudge = e.shiftKey ? 10 : 1;
  if (e.key === 'ArrowLeft') { e.preventDefault(); ao.left -= nudge; ao.setCoords(); canvas.requestRenderAll(); }
  if (e.key === 'ArrowRight') { e.preventDefault(); ao.left += nudge; ao.setCoords(); canvas.requestRenderAll(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); ao.top -= nudge; ao.setCoords(); canvas.requestRenderAll(); }
  if (e.key === 'ArrowDown') { e.preventDefault(); ao.top += nudge; ao.setCoords(); canvas.requestRenderAll(); }
});

/* ============ 유틸 ============ */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toHex(c) { if (!c) return '#000000'; if (c[0] === '#') return (c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(0, 7)).toUpperCase(); const m = String(c).match(/\d+/g); if (!m) return '#000000'; return ('#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('')).toUpperCase(); }
let toastT;
function toast(m) { const t = document.getElementById('toast'); t.innerHTML = `<span class="tcheck">✓</span>${m}`; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900); }
