/* ============================================================
   K-MAKER Mobile & Tablet Touch First Editor — window.MK_TOUCH  (Round 21)
   ------------------------------------------------------------
   Desktop 축소판 금지 — 손가락·펜·제스처 중심의 새 Editor 계층.
   Platform → Layout → Adaptive UI → Gesture FSM → Pencil →
   Selection → Viewport → Sheet/Toolbar → Voice → Offline/Sync →
   Performance → Export/Camera/Gallery → Widget → A11y → Battery.
   ------------------------------------------------------------
   ⚠ 정직 표기: 전부 인메모리 결정론. 실 터치 하드웨어·실 센서·
   실 카메라·실 음성 인식·실 네트워크 없음 — 포인터 이벤트를
   합성 주입해 FSM 판정만 실규격(임계값·시간창·속도 산식).
   시간은 명시 타임스탬프 + 내부 클록 _tick 으로 결정론 검증.
   ============================================================ */
window.MK_TOUCH = (() => {
  'use strict';

  /* ============ 0. 유틸 ============ */
  let CLOCK = 0;
  const now = () => 1700000000000 + CLOCK;
  const _tick = (ms) => { CLOCK += ms; _drain(); };
  let seq = 0;
  const id = (p) => p + '_' + (++seq).toString(36);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  const R2 = (v) => Math.round(v * 100) / 100;

  /* ============ 1. 상수 — 임계값(실규격) ============ */
  const T = {
    TAP_MS: 250,        // 탭 최대 유지 시간
    DBL_MS: 300,        // 더블탭 간격
    DBL_DIST: 30,       // 더블탭 위치 허용
    LONG_MS: 500,       // 롱프레스
    SLOP: 10,           // 이동 허용(px) — 초과 시 드래그
    SWIPE_V: 0.5,       // 스와이프 최소 속도(px/ms)
    SWIPE_DIST: 60,     // 스와이프 최소 거리
    PINCH_MIN: 0.03,    // 스케일 변화 최소(비율)
    ROT_MIN: 8,         // 회전 최소(도)
    PALM_AREA: 400,     // 접촉 면적 초과 시 손바닥 후보
    PALM_PEN_MS: 800,   // 펜 접촉 전후 손바닥 거부 창
    HIT_MIN: 44,        // 최소 터치 타깃(pt) — Apple HIG
    HIT_MIN_ANDROID: 48,
    ZOOM_MIN: 0.1, ZOOM_MAX: 8,
  };

  const LAYOUTS = ['desktop', 'tablet-landscape', 'tablet-portrait', 'phone-landscape', 'phone-portrait'];
  const GESTURES = ['tap', 'double_tap', 'long_press', 'drag', 'pinch', 'rotate', 'two_finger_pan', 'three_finger_swipe', 'swipe', 'pen_double_tap'];
  const SHEET_STATES = ['collapsed', 'peek', 'half', 'full'];
  const REFRESH_TIERS = [120, 60, 30];

  /* ============ 2. Platform — 장치 프로필(§1·§24) ============ */
  const DEVICES = [
    { id: 'ipad-mini', name: 'iPad Mini', os: 'ipados', w: 744, h: 1133, dpr: 2, pen: 'apple-pencil', hover: true, hit: T.HIT_MIN },
    { id: 'ipad-pro', name: 'iPad Pro 12.9', os: 'ipados', w: 1024, h: 1366, dpr: 2, pen: 'apple-pencil', hover: true, hit: T.HIT_MIN },
    { id: 'galaxy-tab', name: 'Galaxy Tab S9', os: 'android', w: 800, h: 1280, dpr: 2, pen: 's-pen', hover: true, hit: T.HIT_MIN_ANDROID },
    { id: 'pixel-tablet', name: 'Pixel Tablet', os: 'android', w: 840, h: 1344, dpr: 2, pen: null, hover: false, hit: T.HIT_MIN_ANDROID },
    { id: 'iphone', name: 'iPhone 15', os: 'ios', w: 393, h: 852, dpr: 3, pen: null, hover: false, hit: T.HIT_MIN },
    { id: 'android-phone', name: 'Galaxy S24', os: 'android', w: 384, h: 832, dpr: 3, pen: 's-pen', hover: false, hit: T.HIT_MIN_ANDROID },
    { id: 'fold', name: 'Galaxy Z Fold', os: 'android', w: 344, h: 882, dpr: 3, pen: 's-pen', hover: false, hit: T.HIT_MIN_ANDROID, unfolded: { w: 673, h: 841 } },
    { id: 'chromeos-tab', name: 'ChromeOS Tablet', os: 'chromeos', w: 1080, h: 675, dpr: 1.6, pen: 'usi', hover: true, hit: T.HIT_MIN_ANDROID },
  ];
  const device = (did) => DEVICES.find((d) => d.id === did) || null;

  /* ============ 3. Responsive Layout(§2) ============ */
  function classify(w, h, opts = {}) {
    if (opts.fold === 'unfolded' && opts.deviceId) {
      const d = device(opts.deviceId);
      if (d && d.unfolded) { w = d.unfolded.w; h = d.unfolded.h; }
    }
    const land = w > h;
    if (w >= 1200 && opts.pointer !== 'coarse') return 'desktop';
    if (Math.min(w, h) >= 600) return land ? 'tablet-landscape' : 'tablet-portrait';
    return land ? 'phone-landscape' : 'phone-portrait';
  }

  /* ============ 4. Adaptive UI(§3·§8~§10) ============ */
  function uiFor(layout, os = 'ios') {
    const hit = os === 'android' || os === 'chromeos' ? T.HIT_MIN_ANDROID : T.HIT_MIN;
    const base = { layout, hitTarget: hit, gestureBar: true };
    switch (layout) {
      case 'desktop':
        return { ...base, toolbar: 'top-rail', panels: 'sidebar', inspector: 'sidebar', assetBrowser: 'sidebar', minimap: true, floatingToolbar: false, contextMenu: 'pointer', columns: 3, gestureBar: false };
      case 'tablet-landscape':
        return { ...base, toolbar: 'edge-rail', panels: 'floating', inspector: 'floating', assetBrowser: 'floating', minimap: true, floatingToolbar: true, contextMenu: 'touch-large', columns: 2 };
      case 'tablet-portrait':
        return { ...base, toolbar: 'edge-rail', panels: 'sheet', inspector: 'bottomsheet', assetBrowser: 'sheet', minimap: true, floatingToolbar: true, contextMenu: 'touch-large', columns: 2 };
      case 'phone-landscape':
        return { ...base, toolbar: 'floating', panels: 'sheet', inspector: 'bottomsheet', assetBrowser: 'sheet', minimap: false, floatingToolbar: true, contextMenu: 'touch-large', columns: 1 };
      default: /* phone-portrait */
        return { ...base, toolbar: 'bottom-bar', panels: 'sheet', inspector: 'bottomsheet', assetBrowser: 'fullsheet', minimap: false, floatingToolbar: true, contextMenu: 'touch-large', columns: 1 };
    }
  }

  /* ============ 5. Gesture FSM(§4) ============ */
  /* 합성 포인터 이벤트 주입: down/move/up/hover + poll(장시간 판정).
     상태: idle → pressed → (tap|long|drag) / multi(2·3지) 분기.   */
  function recognizer(opts = {}) {
    const R = {
      pts: new Map(),           // pointerId → {x,y,t0,x0,y0,type,area,moved,path:[]}
      log: [],                  // 인식 이벤트 로그
      lastTap: null,            // {x,y,t}
      penActiveAt: -1e12,       // 팜 리젝션 창
      tool: 'brush',            // 펜 더블탭 토글
      rejected: [],
    };
    const emit = (g, d = {}) => { const e = { g, t: now(), ...d }; R.log.push(e); if (opts.onGesture) opts.onGesture(e); return e; };
    const centroid = (arr) => ({ x: arr.reduce((s, p) => s + p.x, 0) / arr.length, y: arr.reduce((s, p) => s + p.y, 0) / arr.length });

    function down(pid, x, y, t, type = 'touch', ex = {}) {
      /* 팜 리젝션(§5): 펜 활동 창 내 대면적 터치 거부 */
      if (type === 'touch' && (ex.area || 0) > T.PALM_AREA && Math.abs(t - R.penActiveAt) < T.PALM_PEN_MS) {
        R.rejected.push({ pid, t, why: 'palm' }); emit('palm_rejected', { pid }); return { rejected: true };
      }
      if (type === 'pen') R.penActiveAt = t;
      R.pts.set(pid, { pid, x, y, t0: t, x0: x, y0: y, type, area: ex.area || 0, moved: false, longFired: false, path: [{ x, y, t }], pressure: ex.pressure || 0.5, tiltX: ex.tiltX || 0, tiltY: ex.tiltY || 0 });
      if (R.pts.size === 2) { const [a, b] = [...R.pts.values()]; R.multi0 = { d: dist(a, b), ang: angle(a, b), c: centroid([a, b]), scaled: false, rotated: false, panned: false }; }
      if (R.pts.size === 3) R.tri0 = { c: centroid([...R.pts.values()]), t };
      return { rejected: false };
    }

    function _movePt(pid, x, y, t, ex = {}) {
      const p = R.pts.get(pid); if (!p) return null;
      p.x = x; p.y = y; p.path.push({ x, y, t });
      if (ex.pressure != null) p.pressure = ex.pressure;
      if (ex.tiltX != null) p.tiltX = ex.tiltX; if (ex.tiltY != null) p.tiltY = ex.tiltY;
      const d0 = Math.hypot(x - p.x0, y - p.y0);
      if (d0 > T.SLOP && !p.moved) { p.moved = true; if (R.pts.size === 1) emit('drag_start', { pid, x: p.x0, y: p.y0, pointerType: p.type }); }
      if (p.moved && R.pts.size === 1) emit('drag_move', { pid, x, y, dx: R2(x - p.x0), dy: R2(y - p.y0), pointerType: p.type, pressure: p.pressure });
      return p;
    }
    function _evalMulti() {
      if (R.pts.size !== 2 || !R.multi0) return;
      const [a, b] = [...R.pts.values()];
      const d = dist(a, b), ang = angle(a, b), c = centroid([a, b]);
      const scale = d / R.multi0.d, dAng = ang - R.multi0.ang;
      if (Math.abs(scale - 1) > T.PINCH_MIN) { R.multi0.scaled = true; emit('pinch', { scale: R2(scale), cx: R2(c.x), cy: R2(c.y) }); }
      if (Math.abs(dAng) > T.ROT_MIN) { R.multi0.rotated = true; emit('rotate', { deg: R2(dAng), cx: R2(c.x), cy: R2(c.y) }); }
      if (!R.multi0.scaled && !R.multi0.rotated) {
        const pan = { dx: R2(c.x - R.multi0.c.x), dy: R2(c.y - R.multi0.c.y) };
        if (Math.hypot(pan.dx, pan.dy) > T.SLOP) { R.multi0.panned = true; emit('two_finger_pan', pan); }
      }
    }
    function move(pid, x, y, t, ex = {}) { _movePt(pid, x, y, t, ex); _evalMulti(); poll(t); }
    /* 하드웨어 프레임처럼 여러 포인터 좌표를 한 번에 반영 후 1회 판정 */
    function moveMulti(list, t) { for (const m of list) _movePt(m.pid, m.x, m.y, t, m); _evalMulti(); poll(t); }

    function up(pid, x, y, t) {
      const p = R.pts.get(pid); if (!p) return null;
      R.pts.delete(pid);
      let out = null;
      if (R.tri0 && R.pts.size === 2) {
        /* 3지 스와이프 → undo/redo(§4) */
        const dx = x - R.tri0.c.x, dt = t - R.tri0.t;
        if (Math.abs(dx) > T.SWIPE_DIST && dt < 600) out = emit('three_finger_swipe', { dir: dx < 0 ? 'left' : 'right', action: dx < 0 ? 'undo' : 'redo' });
        R.tri0 = null;
      } else if (p.moved) {
        const last = p.path[p.path.length - 1], span = t - p.t0, d = Math.hypot(x - p.x0, y - p.y0), v = span > 0 ? d / span : 0;
        if (v >= T.SWIPE_V && d >= T.SWIPE_DIST) {
          const dx = x - p.x0, dy = y - p.y0;
          const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          out = emit('swipe', { dir, v: R2(v), pointerType: p.type });
        } else out = emit('drag_end', { pid, dx: R2(x - p.x0), dy: R2(y - p.y0), pointerType: p.type });
      } else if (!p.longFired && t - p.t0 <= T.TAP_MS) {
        if (R.lastTap && t - R.lastTap.t <= T.DBL_MS && Math.hypot(x - R.lastTap.x, y - R.lastTap.y) <= T.DBL_DIST) {
          out = emit('double_tap', { x, y, pointerType: p.type }); R.lastTap = null;
        } else { out = emit('tap', { x, y, pointerType: p.type }); R.lastTap = { x, y, t }; }
      }
      if (R.pts.size < 2) R.multi0 = null;
      return out;
    }

    /* 롱프레스 판정 — 명시 시각 폴링(결정론) */
    function poll(t) {
      for (const p of R.pts.values())
        if (!p.moved && !p.longFired && R.pts.size === 1 && t - p.t0 >= T.LONG_MS) { p.longFired = true; emit('long_press', { x: p.x, y: p.y, pointerType: p.type }); }
    }

    /* 펜 전용(§5) */
    const hover = (x, y, t, ex = {}) => emit('pen_hover', { x, y, h: ex.height != null ? ex.height : 1 });
    const penDoubleTap = () => { R.tool = R.tool === 'brush' ? 'eraser' : 'brush'; emit('pen_double_tap', { tool: R.tool }); return R.tool; };
    const strokeWidth = (pressure, base = 4) => R2(base * (0.4 + 1.6 * clamp(pressure, 0, 1)));         // 압력 → 굵기
    const brushAngle = (tiltX, tiltY) => R2(Math.atan2(tiltY, tiltX) * 180 / Math.PI);                  // 기울기 → 브러시 각
    const tiltShade = (tiltX, tiltY) => R2(clamp(Math.hypot(tiltX, tiltY) / 90, 0, 1));                 // 기울기 → 음영 폭

    return { down, move, moveMulti, up, poll, hover, penDoubleTap, strokeWidth, brushAngle, tiltShade, log: R.log, rejected: R.rejected, state: R };
  }

  /* 제스처 → 명령 바인딩(§4) — 충돌 검사 포함 */
  const DEFAULT_BINDINGS = {
    tap: 'select', double_tap: 'quick_zoom', long_press: 'context_menu', drag: 'move_element',
    pinch: 'zoom_canvas', rotate: 'rotate_selection', two_finger_pan: 'pan_canvas',
    'three_finger_swipe:left': 'undo', 'three_finger_swipe:right': 'redo',
    'swipe:left': 'next_scene', 'swipe:right': 'prev_scene', pen_double_tap: 'toggle_eraser',
  };
  const BINDINGS = { ...DEFAULT_BINDINGS };
  function bind(gesture, command) {
    if (!GESTURES.includes(gesture.split(':')[0])) return { ok: false, why: 'unknown_gesture' };
    const holder = Object.entries(BINDINGS).find(([g, c]) => c === command && g !== gesture);
    if (holder) return { ok: false, why: 'command_conflict', conflictWith: holder[0] };
    BINDINGS[gesture] = command; return { ok: true };
  }
  const commandFor = (g, dir) => BINDINGS[dir ? `${g}:${dir}` : g] || BINDINGS[g] || null;
  const resetBindings = () => { for (const k of Object.keys(BINDINGS)) delete BINDINGS[k]; Object.assign(BINDINGS, DEFAULT_BINDINGS); };

  /* ============ 6. Touch Selection(§6) ============ */
  function handlesFor(rect, zoom = 1, hit = T.HIT_MIN) {
    const hs = Math.max(hit, 24 / zoom); // 화면상 최소 44pt 보장
    const { x, y, w, h } = rect;
    const pts = [['nw', x, y], ['n', x + w / 2, y], ['ne', x + w, y], ['e', x + w, y + h / 2], ['se', x + w, y + h], ['s', x + w / 2, y + h], ['sw', x, y + h], ['w', x, y + h / 2], ['rot', x + w / 2, y - 36 / zoom]];
    return pts.map(([k, px, py]) => ({ k, x: R2(px), y: R2(py), size: R2(hs) }));
  }
  function hitTest(rect, px, py, zoom = 1) {
    const slop = T.SLOP * 2 / zoom; // 터치 여유
    const inBox = px >= rect.x - slop && px <= rect.x + rect.w + slop && py >= rect.y - slop && py <= rect.y + rect.h + slop;
    if (!inBox) return { hit: false };
    for (const hd of handlesFor(rect, zoom)) {
      const r = hd.size / 2 / zoom;
      if (Math.abs(px - hd.x) <= r && Math.abs(py - hd.y) <= r) return { hit: true, part: 'handle', handle: hd.k };
    }
    return { hit: true, part: 'body' };
  }
  function snap(pos, guides, zoom = 1) { // 마그넷(§6)
    const th = 8 / zoom; let out = { ...pos, snappedX: null, snappedY: null };
    for (const g of guides) {
      if (g.axis === 'x' && Math.abs(pos.x - g.at) <= th) { out.x = g.at; out.snappedX = g.at; }
      if (g.axis === 'y' && Math.abs(pos.y - g.at) <= th) { out.y = g.at; out.snappedY = g.at; }
    }
    return out;
  }
  const BUBBLE = {
    text: ['편집', '스타일', 'AI 다듬기', '복제', '삭제'],
    image: ['바꾸기', '자르기', '배경 제거', '복제', '삭제'],
    shape: ['채우기', '테두리', '복제', '삭제'],
    animation: ['재생', '타이밍', '복제', '삭제'],
    default: ['복제', '삭제'],
  };
  const bubbleFor = (type) => BUBBLE[type] || BUBBLE.default;

  /* ============ 7. Canvas Navigation(§7) ============ */
  function viewport(w = 1280, h = 720) {
    const V = { x: 0, y: 0, scale: 1, rotation: 0, canvasW: w, canvasH: h, viewW: 800, viewH: 600 };
    function pinchZoom(cx, cy, factor) {
      const s0 = V.scale, s1 = clamp(s0 * factor, T.ZOOM_MIN, T.ZOOM_MAX);
      /* 초점 고정: 화면점(cx,cy)이 가리키는 캔버스점 불변 */
      const wx = (cx - V.x) / s0, wy = (cy - V.y) / s0;
      V.scale = s1; V.x = cx - wx * s1; V.y = cy - wy * s1;
      return { scale: R2(s1), x: R2(V.x), y: R2(V.y) };
    }
    function quickZoom(mode, sel) { // 더블탭(§7)
      if (mode === 'fit') { V.scale = R2(Math.min(V.viewW / V.canvasW, V.viewH / V.canvasH)); V.x = (V.viewW - V.canvasW * V.scale) / 2; V.y = (V.viewH - V.canvasH * V.scale) / 2; }
      else if (mode === '100') { V.scale = 1; }
      else if (mode === 'selection' && sel) { const s = clamp(Math.min(V.viewW / sel.w, V.viewH / sel.h) * 0.8, T.ZOOM_MIN, T.ZOOM_MAX); V.scale = R2(s); V.x = V.viewW / 2 - (sel.x + sel.w / 2) * s; V.y = V.viewH / 2 - (sel.y + sel.h / 2) * s; }
      return { scale: V.scale };
    }
    const pan = (dx, dy) => { V.x = R2(V.x + dx); V.y = R2(V.y + dy); return { x: V.x, y: V.y }; };
    const rotateCanvas = (deg) => { V.rotation = ((Math.round((V.rotation + deg) / 90) * 90) % 360 + 360) % 360; return V.rotation; }; // 90° 스냅
    const resetView = () => { V.x = 0; V.y = 0; V.scale = 1; V.rotation = 0; return { ...V }; };
    function minimap(mw = 160, mh = 90) { // 현재 보이는 영역 투영(§7)
      const k = Math.min(mw / V.canvasW, mh / V.canvasH);
      return { k: R2(k), viewRect: { x: R2(-V.x / V.scale * k), y: R2(-V.y / V.scale * k), w: R2(V.viewW / V.scale * k), h: R2(V.viewH / V.scale * k) } };
    }
    return { V, pinchZoom, quickZoom, pan, rotateCanvas, resetView, minimap };
  }

  /* ============ 8. Floating Toolbar(§8) · Context Menu(§9) ============ */
  const TOOLBARS = {
    none: { kind: 'canvas', items: ['추가', '템플릿', 'AI', '실행 취소'] },
    text: { kind: 'text', items: ['글꼴', '크기', '굵게', '색', '정렬', 'AI 다듬기'] },
    image: { kind: 'image', items: ['바꾸기', '자르기', '필터', '배경 제거', '투명도'] },
    shape: { kind: 'shape', items: ['채우기', '테두리', '모서리', '그림자'] },
    animation: { kind: 'animation', items: ['프리셋', '길이', '지연', '미리보기'] },
  };
  const toolbarFor = (selType) => TOOLBARS[selType || 'none'] || TOOLBARS.none;
  const contextMenuFor = (selType, hit = T.HIT_MIN) => ({
    hitTarget: hit, large: true,
    items: (selType ? bubbleFor(selType) : ['붙여넣기', '전체 선택', '장면 추가']).map((label, i) => ({ id: 'cm' + i, label, icon: '•' })),
  });

  /* ============ 9. Mobile Inspector — Bottom Sheet FSM(§10) ============ */
  function sheet() {
    const S = { state: 'collapsed', snaps: { collapsed: 0.08, peek: 0.25, half: 0.5, full: 0.92 }, history: ['collapsed'] };
    const to = (st) => { if (!SHEET_STATES.includes(st)) return { ok: false, why: 'unknown_state' }; S.state = st; S.history.push(st); return { ok: true, state: st }; };
    const dragTo = (ratio) => { // 드래그 종료 위치 → 근접 스냅
      let best = 'collapsed', bd = 1e9;
      for (const [k, v] of Object.entries(S.snaps)) { const d = Math.abs(ratio - v); if (d < bd) { bd = d; best = k; } }
      return to(best);
    };
    const expand = () => to(SHEET_STATES[Math.min(SHEET_STATES.indexOf(S.state) + 1, 3)]);
    const collapse = () => to(SHEET_STATES[Math.max(SHEET_STATES.indexOf(S.state) - 1, 0)]);
    return { S, to, dragTo, expand, collapse };
  }

  /* ============ 10. Mobile Asset Browser(§11) ============ */
  const AB = { recent: [], fav: new Set() };
  function assetBrowse(q, o = {}) {
    const D = window.MK_DAM; if (!D) return { items: [], total: 0 };
    let items = q ? D.search(q, {}).items || D.search(q, {}) : D.list();
    if (Array.isArray(items) === false && items.items) items = items.items;
    if (o.category) items = items.filter((e) => e.kind === o.category);
    if (o.brand) items = items.filter((e) => e.brandId === o.brand);
    if (o.favorites) items = items.filter((e) => AB.fav.has(e.id));
    return { items: items.slice(0, o.limit || 24), total: items.length };
  }
  const assetOpen = (aid) => { AB.recent = [aid, ...AB.recent.filter((x) => x !== aid)].slice(0, 12); return AB.recent; };
  const assetFav = (aid) => { AB.fav.has(aid) ? AB.fav.delete(aid) : AB.fav.add(aid); return AB.fav.has(aid); };
  const assetRecent = () => AB.recent.map((aid) => (window.MK_DAM ? window.MK_DAM.get(aid) : null)).filter(Boolean);
  function assetAiSearch(prompt) { // 의도어 → 필터 (§11 AI Search, 규칙 기반)
    const tone = /따뜻|포근/.test(prompt) ? 'warm' : /차분|시원/.test(prompt) ? 'cool' : null;
    const kind = /사진|photo/.test(prompt) ? 'photo' : /아이콘|icon/.test(prompt) ? 'icon' : null;
    const q = prompt.replace(/따뜻한|포근한|차분한|시원한|사진|아이콘|찾아줘|보여줘/g, '').trim();
    const r = assetBrowse(q, { category: kind || undefined });
    return { intent: { tone, kind, q }, ...r };
  }

  /* ============ 11. 모바일 편집 세션 — undo 스택 + 문서 ============ */
  function editorSession(doc) {
    const E = { doc: clone(doc || { title: '무제', scenes: [{ id: 's1', elements: [] }] }), sceneIdx: 0, sel: null, undo: [], redo: [] };
    const scene = () => E.doc.scenes[E.sceneIdx];
    const snap2 = () => E.undo.push(JSON.stringify(E.doc));
    const apply = (fn) => { snap2(); E.redo = []; fn(); return true; };
    const addElement = (el) => { const e = { id: id('el'), type: 'shape', x: 100, y: 100, w: 200, h: 120, ...el }; apply(() => scene().elements.push(e)); return e; };
    const removeSel = () => { if (!E.sel) return false; apply(() => { scene().elements = scene().elements.filter((e) => e.id !== E.sel); }); E.sel = null; return true; };
    const moveSel = (dx, dy) => { const e = scene().elements.find((x) => x.id === E.sel); if (!e) return false; apply(() => { e.x += dx; e.y += dy; }); return true; };
    const setField = (elId, k, v) => { const e = scene().elements.find((x) => x.id === elId); if (!e) return false; apply(() => { e[k] = v; }); return true; };
    const undo = () => { if (!E.undo.length) return false; E.redo.push(JSON.stringify(E.doc)); E.doc = JSON.parse(E.undo.pop()); return true; };
    const redo = () => { if (!E.redo.length) return false; E.undo.push(JSON.stringify(E.doc)); E.doc = JSON.parse(E.redo.pop()); return true; };
    const select = (elId) => { E.sel = elId; return elId; };
    const nextScene = () => { E.sceneIdx = Math.min(E.sceneIdx + 1, E.doc.scenes.length - 1); return E.sceneIdx; };
    const prevScene = () => { E.sceneIdx = Math.max(E.sceneIdx - 1, 0); return E.sceneIdx; };
    return { E, scene, addElement, removeSel, moveSel, setField, undo, redo, select, nextScene, prevScene };
  }

  /* ============ 12. Voice(§12·§13) — 규칙 기반 결정론 파서 ============ */
  const V_COLORS = { 빨간: '#E5484D', 빨강: '#E5484D', 파란: '#3E63DD', 파랑: '#3E63DD', 노란: '#F5D90A', 초록: '#30A46C', 검은: '#1A1A1A', 흰: '#FFFFFF', 보라: '#8E4EC6' };
  const V_SHAPES = { 원: 'circle', 동그라미: 'circle', 사각형: 'rect', 네모: 'rect', 별: 'star', 화살표: 'arrow', 선: 'line', 삼각형: 'triangle' };
  function voiceParse(text) {
    const s = String(text || '').trim();
    if (/실행\s*취소|되돌려/.test(s)) return { intent: 'undo' };
    if (/다시\s*실행/.test(s)) return { intent: 'redo' };
    if (/저장/.test(s)) return { intent: 'save' };
    if (/(내보내|익스포트)/.test(s)) { const m = s.match(/pdf|png|pptx|mp4|gif/i); return { intent: 'export', format: m ? m[0].toLowerCase() : 'png' }; }
    if (/다음\s*장면|다음\s*슬라이드/.test(s)) return { intent: 'next_scene' };
    if (/이전\s*장면|이전\s*슬라이드/.test(s)) return { intent: 'prev_scene' };
    if (/검색|찾아/.test(s)) return { intent: 'search', q: s.replace(/을|를|검색해?줘?|찾아줘?/g, '').trim() };
    const del = s.match(/(제목|텍스트|이미지|선택)\s*(삭제|지워)/); if (del) return { intent: 'delete', target: del[1] };
    const size = s.match(/(제목|텍스트|글자)\s*(크게|작게)/); if (size) return { intent: 'resize_text', target: size[1], dir: size[2] === '크게' ? 'up' : 'down' };
    const add = s.match(/추가|넣어|만들어/);
    if (add) {
      let color = null, shape = null;
      for (const k of Object.keys(V_COLORS)) if (s.includes(k)) color = V_COLORS[k];
      for (const k of Object.keys(V_SHAPES)) if (s.includes(k)) shape = V_SHAPES[k];
      if (/텍스트|글자|제목/.test(s)) return { intent: 'add', type: 'text', color };
      return { intent: 'add', type: 'shape', shape: shape || 'rect', color };
    }
    const bg = s.match(/배경(을|은)?\s*(.+?)(으로|로)?\s*(바꿔|변경)/);
    if (bg) { let color = null; for (const k of Object.keys(V_COLORS)) if (s.includes(k)) color = V_COLORS[k]; return { intent: 'background', color }; }
    return { intent: 'unknown', raw: s };
  }
  function voiceExec(ses, text) { // 음성 편집(§13) — 파스 → 세션 실행
    const p = voiceParse(text);
    switch (p.intent) {
      case 'undo': return { ...p, ok: ses.undo() };
      case 'redo': return { ...p, ok: ses.redo() };
      case 'add': { const el = ses.addElement(p.type === 'text' ? { type: 'text', text: '새 텍스트', color: p.color || '#1A1A1A' } : { type: 'shape', shape: p.shape, fill: p.color || '#3E63DD' }); return { ...p, ok: true, el }; }
      case 'delete': return { ...p, ok: ses.removeSel() };
      case 'resize_text': { const el = ses.scene().elements.find((e) => e.type === 'text'); if (!el) return { ...p, ok: false }; const nv = (el.size || 24) + (p.dir === 'up' ? 8 : -8); return { ...p, ok: ses.setField(el.id, 'size', nv), size: nv }; }
      case 'background': return { ...p, ok: p.color ? (ses.scene().background = p.color, true) : false };
      case 'next_scene': return { ...p, ok: true, idx: ses.nextScene() };
      case 'prev_scene': return { ...p, ok: true, idx: ses.prevScene() };
      case 'search': return { ...p, ok: true, result: assetBrowse(p.q) };
      case 'export': return { ...p, ok: true, job: quickExport(ses.E.doc, p.format) };
      case 'save': return { ...p, ok: true };
      default: return { ...p, ok: false };
    }
  }

  /* ============ 13. Mobile AI(§12) ============ */
  const AI_QUICK = ['배경 제거', '글 다듬기', '번역', '레이아웃 제안', '이미지 생성', '요약'];
  function aiPrompt(mode, payload) {
    if (mode === 'voice') return { mode, parsed: voiceParse(payload), routed: 'voice' };
    if (mode === 'image') return { mode, ref: payload, actions: ['비슷한 이미지', '배경 제거', '스타일 추출'] };
    return { mode: 'text', prompt: payload, plan: ['의도 분석', '요소 매핑', '적용'], deterministic: true };
  }

  /* ============ 14. Offline(§14) + Sync(§15) ============ */
  const NET = { online: true };
  const SERVER = { docs: new Map(), rev: new Map() }; // 결정론 "서버"
  const OFF = { projectCache: new Map(), assetCache: new Set(), queue: [], conflicts: [], synced: 0, autosaveAt: -1, saved: 0, log: [] };

  const setOnline = (on) => { NET.online = !!on; if (NET.online) _drain(); return NET.online; };
  function serverPut(docId, doc) { SERVER.docs.set(docId, clone(doc)); SERVER.rev.set(docId, (SERVER.rev.get(docId) || 0) + 1); return SERVER.rev.get(docId); }
  const serverGet = (docId) => ({ doc: SERVER.docs.get(docId) ? clone(SERVER.docs.get(docId)) : null, rev: SERVER.rev.get(docId) || 0 });

  function cacheProject(docId, doc) { OFF.projectCache.set(docId, { doc: clone(doc), baseline: clone(doc), rev: SERVER.rev.get(docId) || 0, at: now() }); return true; }
  const cacheAssets = (ids) => { ids.forEach((a) => OFF.assetCache.add(a)); return OFF.assetCache.size; };
  const cachedAsset = (aid) => OFF.assetCache.has(aid);

  function editField(docId, field, value) { // 오프라인 편집 → 저널
    const c = OFF.projectCache.get(docId); if (!c) return { ok: false, why: 'not_cached' };
    c.doc[field] = value;
    const op = { id: id('op'), docId, field, value, baseRev: c.rev, t: now() };
    if (NET.online) { _applyOp(op); return { ok: true, queued: false }; }
    OFF.queue.push(op); return { ok: true, queued: true, queueLen: OFF.queue.length };
  }
  function _applyOp(op) {
    const srvRev = SERVER.rev.get(op.docId) || 0;
    const srv = SERVER.docs.get(op.docId) || {};
    /* 3자 비교(§14 Conflict Detection): 서버 rev 가 앞섰고, 같은 필드가
       베이스라인과 다르게 서버에서 먼저 변했고, 내 값과도 다르면 충돌 */
    const base = OFF.projectCache.get(op.docId);
    const baseVal = base && base.baseline ? base.baseline[op.field] : undefined;
    if (srvRev > op.baseRev && JSON.stringify(srv[op.field]) !== JSON.stringify(baseVal) && JSON.stringify(srv[op.field]) !== JSON.stringify(op.value)) {
      OFF.conflicts.push({ id: id('cf'), op, local: op.value, remote: srv[op.field], field: op.field, docId: op.docId, resolved: false });
      return { ok: false, conflict: true };
    }
    srv[op.field] = op.value; const rev = serverPut(op.docId, srv);
    const c = OFF.projectCache.get(op.docId); if (c) c.rev = rev;
    OFF.synced++; OFF.log.push({ t: now(), what: 'sync', op: op.id });
    return { ok: true };
  }
  function _drain() { // 온라인 복귀·틱 시 큐 배출(§15 Background Sync)
    if (!NET.online) return;
    const q = OFF.queue.splice(0);
    for (const op of q) _applyOp(op);
    /* 자동 저장 디바운스 */
    if (OFF.autosaveAt >= 0 && now() >= OFF.autosaveAt) { OFF.saved++; OFF.autosaveAt = -1; OFF.log.push({ t: now(), what: 'autosave' }); }
  }
  const scheduleAutosave = (delay = 2000) => { OFF.autosaveAt = now() + delay; return OFF.autosaveAt; };
  function resolveConflict(cfId, strategy) { // local | remote | merge(§14)
    const cf = OFF.conflicts.find((c) => c.id === cfId && !c.resolved); if (!cf) return { ok: false, why: '없음' };
    const srv = SERVER.docs.get(cf.docId) || {};
    if (strategy === 'local') srv[cf.field] = cf.local;
    else if (strategy === 'remote') { /* 서버값 유지 */ }
    else if (strategy === 'merge') srv[cf.field] = typeof cf.local === 'string' && typeof cf.remote === 'string' ? cf.remote + ' / ' + cf.local : cf.local;
    else return { ok: false, why: 'unknown_strategy' };
    const rev = serverPut(cf.docId, srv); cf.resolved = true; cf.strategy = strategy;
    const c = OFF.projectCache.get(cf.docId); if (c) { c.doc[cf.field] = srv[cf.field]; c.rev = rev; }
    return { ok: true, value: srv[cf.field], rev };
  }
  const syncStatus = () => ({ online: NET.online, queued: OFF.queue.length, conflicts: OFF.conflicts.filter((c) => !c.resolved).length, synced: OFF.synced, saved: OFF.saved, cachedProjects: OFF.projectCache.size, cachedAssets: OFF.assetCache.size });

  /* ============ 15. Performance(§16) + Battery(§23) ============ */
  const PERF = { refresh: 60, lowPower: false, bgPaused: false, gpuLayers: 0, lazyQ: [], loaded: [] };
  function frameCost(nElements, o = {}) { // 결정론 산식 — 프레임 예산(ms)
    let c = 1.2 + nElements * 0.08;
    if (o.dirtyRegion) c *= 0.35;           // 더티 영역만 다시 그림
    if (o.gpu) c *= 0.6;                    // GPU 레이어 승격
    if (PERF.lowPower) c *= 1.15;           // 절전 시 효과 축소로 상쇄 전 원가
    return R2(c);
  }
  function fpsFor(nElements, o = {}) {
    const budget = 1000 / PERF.refresh;
    const cost = frameCost(nElements, o);
    const fps = cost <= budget ? PERF.refresh : Math.floor(1000 / cost);
    return { fps: Math.min(fps, PERF.refresh), cost, budget: R2(budget), ok60: fps >= 60 };
  }
  const lazyEnqueue = (ids) => { PERF.lazyQ.push(...ids); return PERF.lazyQ.length; };
  const lazyStep = (k = 4) => { const got = PERF.lazyQ.splice(0, k); PERF.loaded.push(...got); return { loaded: got, remain: PERF.lazyQ.length }; };
  const promoteGpu = (n = 1) => { PERF.gpuLayers += n; return PERF.gpuLayers; };
  function setLowPower(on) { PERF.lowPower = !!on; PERF.refresh = on ? 30 : 60; return { lowPower: PERF.lowPower, refresh: PERF.refresh, effects: on ? 'reduced' : 'full' }; }
  function adaptiveRefresh(batteryPct, interacting) { // §23 Adaptive Refresh
    let r = 120; if (batteryPct < 20) r = 30; else if (batteryPct < 50 || !interacting) r = 60;
    if (PERF.lowPower) r = Math.min(r, 30);
    PERF.refresh = r; return r;
  }
  const backgroundPause = (paused) => { PERF.bgPaused = !!paused; return PERF.bgPaused; };

  /* ============ 16. Mobile Export(§17) ============ */
  const SHARE_TARGETS = { ios: ['메시지', 'AirDrop', '메일', '사진에 저장', '파일에 저장'], android: ['공유', 'Nearby Share', 'Gmail', '갤러리에 저장', 'Drive'], chromeos: ['공유', '파일', 'Drive'] };
  const EXPORTS = [];
  function quickExport(doc, format = 'png') {
    const RD = window.MK_RENDER;
    let payload = null;
    if (RD && (format === 'png' || format === 'svg')) { const pr = RD.renderProject(doc || { scenes: [] }); payload = { pages: pr.pages.length }; }
    const job = { id: id('exp'), format, at: now(), state: NET.online ? 'done' : 'queued', cloud: false, payload };
    EXPORTS.push(job); return job;
  }
  function cloudUpload(jobId) { const j = EXPORTS.find((x) => x.id === jobId); if (!j) return { ok: false }; if (!NET.online) { j.state = 'queued'; return { ok: true, queued: true }; } j.cloud = true; j.state = 'uploaded'; return { ok: true, queued: false }; }
  const shareSheet = (os = 'ios') => SHARE_TARGETS[os] || SHARE_TARGETS.ios;

  /* ============ 17. Camera(§18) · Gallery(§19) ============ */
  function takePhoto(meta = {}) {
    const D = window.MK_DAM; if (!D) return { ok: false, why: 'no_dam' };
    const e = D.create({ name: meta.name || '카메라 촬영', kind: 'photo', tags: ['camera'], tone: meta.tone || 'warm' });
    OFF.assetCache.add(e.id);
    return { ok: true, asset: e };
  }
  function scanDocument(corners) { // 문서 스캔 — 원근 보정 메타(결정론)
    const c = corners || [{ x: 40, y: 30 }, { x: 620, y: 44 }, { x: 610, y: 860 }, { x: 30, y: 848 }];
    const w = Math.round((dist(c[0], c[1]) + dist(c[3], c[2])) / 2), h = Math.round((dist(c[0], c[3]) + dist(c[1], c[2])) / 2);
    const ph = takePhoto({ name: '문서 스캔' });
    return { ok: true, asset: ph.asset, corrected: { w, h }, corners: c, enhanced: true };
  }
  function removeBackground(assetId) { // 규칙 기반 마스크
    const D = window.MK_DAM; const e = D && D.get(assetId); if (!e) return { ok: false, why: '없음' };
    return { ok: true, assetId, variant: assetId + '@nobg', mask: 'center-subject', edges: 'feather-2px' };
  }
  function qrScan(payload) { // 스캔 시뮬레이션 — 형식 판정만 실규격
    const s = String(payload || '');
    if (/^https?:\/\//.test(s)) return { ok: true, type: 'url', value: s, action: 'open' };
    if (/^WIFI:/.test(s)) { const m = s.match(/S:([^;]+)/); return { ok: true, type: 'wifi', ssid: m ? m[1] : '', action: 'join' }; }
    if (/^mkproj:/.test(s)) return { ok: true, type: 'project', projectId: s.slice(7), action: 'open_project' };
    if (!s) return { ok: false, why: 'empty' };
    return { ok: true, type: 'text', value: s, action: 'insert_text' };
  }
  const GALLERY = {
    local: { name: '내 앨범', albums: ['최근 항목', '즐겨찾기', '스크린샷'], items: 128 },
    google: { name: 'Google Photos', albums: ['전체', '공유됨'], items: 2431, cloud: true },
    apple: { name: 'Apple 사진', albums: ['라이브러리', '즐겨찾기'], items: 1876, cloud: true },
  };
  const galleryProviders = () => Object.entries(GALLERY).map(([k, v]) => ({ id: k, ...v }));
  function galleryImport(provider, name) {
    const p = GALLERY[provider]; if (!p) return { ok: false, why: 'unknown_provider' };
    const D = window.MK_DAM; if (!D) return { ok: false, why: 'no_dam' };
    const e = D.create({ name: name || p.name + ' 가져오기', kind: 'photo', tags: ['gallery', provider] });
    return { ok: true, asset: e, from: provider };
  }

  /* ============ 18. Drag & Drop(§20) ============ */
  const DND = { split: false, windows: 1 };
  const setSplitScreen = (on, windows = 2) => { DND.split = !!on; DND.windows = on ? windows : 1; return { ...DND }; };
  function dropFiles(files) { // 시스템 드롭 → mime 분류 → DAM 인제스트
    const D = window.MK_DAM;
    const ok = [], rejectedF = [];
    for (const f of files || []) {
      const kind = /^image\//.test(f.mime) ? 'photo' : /^video\//.test(f.mime) ? 'video' : /svg/.test(f.mime) ? 'icon' : /pdf|ppt|doc/.test(f.mime) ? 'doc' : null;
      if (!kind || (f.size || 0) > 50e6) { rejectedF.push({ name: f.name, why: !kind ? 'unsupported_mime' : 'too_large' }); continue; }
      const e = D ? D.create({ name: f.name, kind: kind === 'doc' ? 'photo' : kind, tags: ['drop'] }) : { id: id('a'), name: f.name };
      ok.push({ name: f.name, kind, assetId: e.id });
    }
    return { ok, rejected: rejectedF, split: DND.split };
  }

  /* ============ 19. Widget(§21) ============ */
  function widgetData(kind) {
    const P = window.MK_PROJ, TP = window.MK_TPL;
    if (kind === 'recent') { const l = P && P.list ? P.list().slice(0, 3) : []; return { kind, title: '최근 프로젝트', items: l.map((p) => ({ id: p.id, name: p.name || p.title })) }; }
    if (kind === 'quickCreate') return { kind, title: '빠른 만들기', items: [{ id: 'pres', name: '발표자료' }, { id: 'card', name: '카드뉴스' }, { id: 'poster', name: '포스터' }] };
    if (kind === 'aiGenerate') return { kind, title: 'AI 생성', items: [{ id: 'ai', name: '한 줄로 디자인 만들기' }], deeplink: '#/ai' };
    if (kind === 'favTemplates') { const l = TP && TP.list ? TP.list().slice(0, 4) : []; return { kind, title: '즐겨찾는 템플릿', items: l.map((t) => ({ id: t.templateId || t.id, name: t.title || t.name })) }; }
    return { kind: 'unknown' };
  }

  /* ============ 20. Accessibility(§22) ============ */
  const A11Y = { textScale: 1, highContrast: false };
  const setTextScale = (s) => { A11Y.textScale = clamp(s, 1, 2); return A11Y.textScale; };
  const scaledFont = (base) => R2(base * A11Y.textScale);
  const setHighContrast = (on) => { A11Y.highContrast = !!on; return { on: A11Y.highContrast, tokens: on ? { '--pg-text': '#000000', '--pg-bg': '#FFFFFF', '--pg-border': '#000000' } : null }; };
  function a11yTree(doc) { // VoiceOver·TalkBack 낭독 트리
    const nodes = [];
    (doc.scenes || []).forEach((sc, si) => {
      nodes.push({ role: 'group', label: `장면 ${si + 1}${sc.name ? ' ' + sc.name : ''}`, depth: 0 });
      (sc.elements || []).forEach((el) => nodes.push({
        role: el.type === 'text' ? 'text' : el.type === 'image' ? 'image' : 'button',
        label: el.type === 'text' ? String(el.text || '텍스트') : el.type === 'image' ? (el.alt || '이미지') : (el.shape || el.type),
        depth: 1, actions: ['활성화', '이동', '삭제'],
      }));
    });
    return nodes;
  }
  const keyboardOrder = (doc) => a11yTree(doc).filter((n) => n.depth === 1).map((n, i) => ({ ...n, tabIndex: i + 1 }));

  /* ============ 21. Testing Matrix(§24) ============ */
  function testMatrix() {
    const rows = [];
    for (const d of DEVICES) {
      for (const orient of ['portrait', 'landscape']) {
        const [w, h] = orient === 'portrait' ? [d.w, d.h] : [d.h, d.w];
        const layout = classify(w, h, { pointer: 'coarse' });
        const ui = uiFor(layout, d.os);
        rows.push({ device: d.name, os: d.os, orient, w, h, layout, hitOk: ui.hitTarget >= 44, pen: !!d.pen, sheetUsed: /sheet/.test(ui.inspector) });
        if (d.unfolded && orient === 'portrait') {
          const lo = classify(d.unfolded.w, d.unfolded.h, { pointer: 'coarse' });
          rows.push({ device: d.name + ' (펼침)', os: d.os, orient: 'unfolded', w: d.unfolded.w, h: d.unfolded.h, layout: lo, hitOk: true, pen: !!d.pen, sheetUsed: /sheet/.test(uiFor(lo, d.os).inspector) });
        }
      }
    }
    return { rows, pass: rows.every((r) => r.hitOk && LAYOUTS.includes(r.layout) || r.orient === 'unfolded'), total: rows.length };
  }

  /* ============ 공개 표면 ============ */
  return {
    T, LAYOUTS, GESTURES, SHEET_STATES, DEVICES, REFRESH_TIERS, AI_QUICK,
    _tick, _now: now,
    device, classify, uiFor,
    recognizer, bind, commandFor, resetBindings, BINDINGS, DEFAULT_BINDINGS,
    handlesFor, hitTest, snap, bubbleFor,
    viewport, toolbarFor, contextMenuFor, sheet,
    assetBrowse, assetOpen, assetFav, assetRecent, assetAiSearch,
    editorSession, voiceParse, voiceExec, aiPrompt,
    setOnline, serverPut, serverGet, cacheProject, cacheAssets, cachedAsset, editField, scheduleAutosave, resolveConflict, syncStatus,
    _conflicts: () => OFF.conflicts, _queue: () => OFF.queue,
    frameCost, fpsFor, lazyEnqueue, lazyStep, promoteGpu, setLowPower, adaptiveRefresh, backgroundPause, _perf: PERF,
    quickExport, cloudUpload, shareSheet, _exports: () => EXPORTS,
    takePhoto, scanDocument, removeBackground, qrScan, galleryProviders, galleryImport,
    setSplitScreen, dropFiles,
    widgetData,
    setTextScale, scaledFont, setHighContrast, a11yTree, keyboardOrder, _a11y: A11Y,
    testMatrix,
  };
})();
