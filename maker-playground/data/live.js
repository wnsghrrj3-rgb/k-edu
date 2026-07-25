/* ============================================================
   MK_LIVE — 이식 라운드 R36 "심장"
   플레이그라운드 에디터에 실동작 계층을 심는다:
   ① 실편집 — 드래그 이동·8핸들 리사이즈·회전·스냅 가이드·키보드·인라인 텍스트
   ② 실이미지 — 파일 드롭/선택 → dataURL → 캔버스·미니씬 실표시 (틀·애니·크롭 유지)
   ③ 영속 — localStorage 자동저장(디바운스)·복원·프로젝트 저장 (리뷰 모드 제외)
   순수 로직 = 전부 인자 주입식 (DOM·storage·timer 주입 가능 → jsdom 완전 검증)
   ============================================================ */
window.MK_LIVE = (() => {
  'use strict';
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round1 = (v) => Math.round(v * 10) / 10;

  /* ================= ① 기하 — 전부 % 좌표계 (씬 = 100×100) ================= */

  /* 드래그 이동 — dx·dy(%)만큼. 씬 밖 완전 이탈 방지(요소가 최소 4%는 화면에 남는다) */
  function dragTo(el, startX, startY, dxPct, dyPct) {
    const w = el.w || 10, h = el.h || 8;
    el.x = round1(clamp(startX + dxPct, -w + 4, 96));
    el.y = round1(clamp(startY + dyPct, -h + 4, 96));
    return el;
  }

  /* 8핸들 리사이즈 — handle ∈ tl/tr/bl/br/tm/bm/ml/mr.
     모서리 4 = 폭·높이 동시(shift 시 비율 고정), 변 4 = 한 축.
     텍스트는 높이 개념이 없어 폭만 반응한다. */
  function resizeTo(el, handle, start, dxPct, dyPct, opts = {}) {
    const isText = el.kind === 'text';
    const minW = 4, minH = 3;
    let { x, y, w, h } = start;
    h = h || 8;
    const L = handle.includes('l'), R = handle.includes('r') && handle !== 'rot';
    const T = handle.includes('t'), B = handle.includes('b');
    const corner = (L || R) && (T || B);
    if (R) w = w + dxPct;
    if (L) { w = w - dxPct; x = start.x + dxPct; }
    if (!isText) {
      if (B) h = h + dyPct;
      if (T) { h = h - dyPct; y = start.y + dyPct; }
      if (corner && opts.aspect) {                       /* 비율 고정 — 폭 기준 */
        const ratio = (start.h || 8) / (start.w || 10);
        const nh = w * ratio;
        if (T) y = start.y + ((start.h || 8) - nh);
        h = nh;
      }
    }
    if (w < minW) { if (L) x = start.x + start.w - minW; w = minW; }
    if (!isText && h < minH) { if (T) y = start.y + start.h - minH; h = minH; }
    el.x = round1(x); el.y = round1(y); el.w = round1(w);
    if (!isText) el.h = round1(h);
    if (isText && corner) {                              /* 텍스트 모서리 = 글자 크기 스케일 */
      const scale = el.w / (start.w || 10);
      el.size = round1(clamp((start.size || 3) * scale, 1, 20));
    }
    return el;
  }

  /* 회전 — 중심(cx,cy)과 포인터(px,py)로 각도. 0·90·180·270 근처(±4°) 자석 */
  function rotateTo(el, cx, cy, px, py) {
    let deg = Math.atan2(py - cy, px - cx) * 180 / Math.PI + 90;
    deg = ((deg % 360) + 360) % 360;
    for (const s of [0, 90, 180, 270, 360]) if (Math.abs(deg - s) <= 4) deg = s % 360;
    el.rot = Math.round(deg);
    if (el.rot === 0) delete el.rot;
    return el;
  }

  /* 스냅 — 씬 중앙(50)·다른 요소의 변/중앙에 1.2% 이내면 흡착. 가이드 좌표 반환 */
  function snap(el, others, thr = 1.2) {
    const w = el.w || 10, h = el.h || 8;
    const mineX = [el.x, el.x + w / 2, el.x + w];
    const mineY = [el.y, el.y + h / 2, el.y + h];
    const tX = [50], tY = [50];
    (others || []).forEach((o) => {
      const ow = o.w || 10, oh = o.h || 8;
      tX.push(o.x, o.x + ow / 2, o.x + ow);
      tY.push(o.y, o.y + oh / 2, o.y + oh);
    });
    const guides = { v: null, h: null };
    let best = thr;
    tX.forEach((t) => mineX.forEach((m, i) => {
      const d = t - m;
      if (Math.abs(d) < Math.abs(best)) { best = d; guides.v = t; el.x = round1(el.x + d); }
    }));
    best = thr;
    tY.forEach((t) => mineY.forEach((m) => {
      const d = t - m;
      if (Math.abs(d) < Math.abs(best)) { best = d; guides.h = t; el.y = round1(el.y + d); }
    }));
    return guides;
  }

  /* ================= 키보드 ================= */
  const nudge = (el, key, big) => {
    const step = big ? 2 : 0.5;
    if (key === 'ArrowLeft') el.x = round1(el.x - step);
    if (key === 'ArrowRight') el.x = round1(el.x + step);
    if (key === 'ArrowUp') el.y = round1(el.y - step);
    if (key === 'ArrowDown') el.y = round1(el.y + step);
    return el;
  };
  const removeEl = (scene, i) => { if (scene.elements[i]) scene.elements.splice(i, 1); return scene; };
  const dupEl = (scene, i) => {
    const src = scene.elements[i]; if (!src) return null;
    const c = clone(src); c.x = round1(c.x + 3); c.y = round1(c.y + 3);
    scene.elements.splice(i + 1, 0, c);
    return i + 1;
  };
  const editText = (el, text) => {
    if (el.kind !== 'text') return { ok: false };
    el.text = String(text == null ? '' : text);
    return { ok: true };
  };

  /* ================= ② 실이미지 ================= */
  /* MK_EASY.replace/insertMedia 경로를 그대로 타되 src(dataURL)를 함께 싣는다 —
     스마트 교체 계약(틀 불변·애니 유지·크롭 유지)이 실이미지에도 동일 적용 */
  function replaceWithSrc(doc, si, ei, media) {
    const r = window.MK_EASY.replace(doc, si, ei, media);
    if (r.ok && media.src) { doc.scenes[si].elements[ei].src = media.src; }
    return r;
  }
  function insertWithSrc(doc, si, media) {
    const r = window.MK_EASY.insertMedia(doc, si, media);
    if (r.ok && media.src && media.kind !== 'audio') {
      const s = doc.scenes[si];
      s.elements[s.elements.length - 1].src = media.src;
    }
    return r;
  }
  /* File → dataURL. reader 주입 가능(jsdom 검증용). 이미지·영상만, 8MB 상한 */
  function fileToSrc(file, cb, ReaderCls) {
    if (!file) return cb(null);
    if (!/^(image|video)\//.test(file.type || '')) return cb(null);
    if (file.size > 8 * 1024 * 1024) return cb(null, '8MB 이하만 넣을 수 있어요');
    const R = ReaderCls || window.FileReader;
    const rd = new R();
    rd.onload = () => cb(String(rd.result || ''));
    rd.onerror = () => cb(null, '파일을 읽지 못했어요');
    rd.readAsDataURL(file);
  }

  /* ================= ③ 영속 ================= */
  let backend = null;                    /* {getItem,setItem,removeItem} — 기본 localStorage */
  const store = () => {
    if (backend) return backend;
    try { const t = window.localStorage; t.getItem('__mk'); return t; } catch (_) { return null; }
  };
  const useBackend = (b) => { backend = b; };
  const K_DOC = (id) => 'mklive:doc:' + id;
  const K_PROJ = 'mklive:projects';

  function saveDoc(doc) {
    const s = store(); if (!s || !doc || !doc.id) return false;
    try { s.setItem(K_DOC(doc.id), JSON.stringify({ savedAt: Date.now(), doc })); return true; } catch (_) { return false; }
  }
  function loadDoc(id) {
    const s = store(); if (!s || !id) return null;
    try { const raw = s.getItem(K_DOC(id)); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  }
  function clearDoc(id) { const s = store(); if (s) try { s.removeItem(K_DOC(id)); } catch (_) {} }

  /* 프로젝트 전체 영속 — MK_PROJ.serialize/hydrate 브리지 */
  function saveProjects() {
    const s = store(), P = window.MK_PROJ;
    if (!s || !P || !P.serialize) return false;
    try { s.setItem(K_PROJ, P.serialize()); return true; } catch (_) { return false; }
  }
  function restoreProjects() {
    const s = store(), P = window.MK_PROJ;
    if (!s || !P || !P.hydrate) return false;
    try { const raw = s.getItem(K_PROJ); if (!raw) return false; return P.hydrate(raw); } catch (_) { return false; }
  }

  /* 자동저장 — 디바운스 700ms, timer 주입 가능 */
  let tId = null, lastLabel = '';
  function autosave(doc, opts = {}) {
    if (opts.review) return { ok: false, why: 'review' };       /* 리뷰 모드 = 저장 차단 규약 유지 */
    const setT = opts.setTimeout || ((f, t) => setTimeout(f, t));
    const clearT = opts.clearTimeout || ((i) => clearTimeout(i));
    lastLabel = opts.label || '';
    if (tId != null) clearT(tId);
    tId = setT(() => {
      tId = null;
      saveDoc(doc);
      saveProjects();
      if (opts.onSaved) opts.onSaved(lastLabel);
    }, opts.delay != null ? opts.delay : 700);
    return { ok: true };
  }
  const flush = () => { tId = null; };

  /* ================= 판정 ================= */
  function liveAudit() {
    const v = [];
    /* 드래그 — 위치가 실제로 바뀌고 소수 1자리로 정돈 */
    const el = { kind: 'image', x: 10, y: 10, w: 20, h: 15, anim: { preset: 'fade' } };
    dragTo(el, 10, 10, 5.55, -2.22);
    if (el.x !== 15.6 || el.y !== 7.8) v.push('드래그 좌표 계산 오류');
    /* 리사이즈 — br 핸들·최소 크기·텍스트 폭 전용 */
    const box = { kind: 'image', x: 10, y: 10, w: 20, h: 10 };
    resizeTo(box, 'br', { x: 10, y: 10, w: 20, h: 10 }, 10, 5);
    if (box.w !== 30 || box.h !== 15) v.push('br 리사이즈 오류');
    resizeTo(box, 'ml', { x: 10, y: 10, w: 30, h: 15 }, 40, 0);
    if (box.w !== 4) v.push('최소 폭 미보장');
    const tx = { kind: 'text', x: 5, y: 5, w: 40, size: 4 };
    resizeTo(tx, 'br', { x: 5, y: 5, w: 40, size: 4 }, 20, 99);
    if (tx.h !== undefined || tx.w !== 60 || tx.size !== 6) v.push('텍스트 리사이즈 규약 위반');
    /* 회전 — 자석 스냅 */
    const r = { kind: 'image', x: 0, y: 0, w: 10, h: 10 };
    rotateTo(r, 50, 50, 50, 20);                       /* 정확히 위 = 0° → rot 삭제 */
    if (r.rot !== undefined) { if (r.rot !== 0) v.push('회전 0° 자석 실패'); }
    rotateTo(r, 50, 50, 80, 50);                       /* 오른쪽 = 90° */
    if (r.rot !== 90) v.push('회전 90° 오류');
    /* 스냅 — 중앙 흡착 */
    const s = { kind: 'image', x: 44.5, y: 30, w: 10, h: 10 };
    const g = snap(s, []);
    if (s.x !== 45 || g.v !== 50) v.push('중앙 스냅 실패');
    /* 실이미지 — 교체 후 src·애니·크롭 보존 */
    if (window.MK_EASY) {
      const d = window.MK_EASY.demoDoc();
      const si = d.scenes[0].elements.findIndex((e2) => e2.kind !== 'text');
      d.scenes[0].elements[si].anim = { preset: 'zoom' }; d.scenes[0].elements[si].radius = 8;
      const rr = replaceWithSrc(d, 0, si, { name: '실사진', kind: 'image', src: 'data:image/png;base64,AAA' });
      const e2 = d.scenes[0].elements[si];
      if (!rr.ok || e2.src !== 'data:image/png;base64,AAA') v.push('실이미지 src 미탑재');
      if (!e2.anim || e2.anim.preset !== 'zoom' || e2.radius !== 8) v.push('실이미지 교체가 애니·크롭을 잃음');
    }
    /* 영속 — 메모리 백엔드 왕복 */
    const mem = {}; const memB = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, x) => { mem[k] = x; }, removeItem: (k) => { delete mem[k]; } };
    const prevB = backend; backend = memB;
    const doc = { id: 'audit-doc', scenes: [{ id: 's1', elements: [] }] };
    saveDoc(doc);
    const back = loadDoc('audit-doc');
    if (!back || back.doc.id !== 'audit-doc' || !back.savedAt) v.push('영속 왕복 실패');
    backend = prevB;
    return { ok: v.length === 0, violations: v };
  }

  return {
    dragTo, resizeTo, rotateTo, snap, nudge, removeEl, dupEl, editText,
    replaceWithSrc, insertWithSrc, fileToSrc,
    useBackend, saveDoc, loadDoc, clearDoc, saveProjects, restoreProjects, autosave, flush,
    liveAudit,
  };
})();

/* 부팅 복원 — 저장된 프로젝트가 있으면 시드 대신 이어서 (실브라우저 전용, 실패 무해) */
try { if (window.MK_PROJ && window.localStorage) window.MK_LIVE.restoreProjects(); } catch (_) {}
