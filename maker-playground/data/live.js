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

  /* R95 — 터치 근접 핸들: 요소 rect와 포인터로 반경 안 가장 가까운 핸들.
     8px 시각 핸들을 손가락이 정확히 못 짚는 문제의 수학 절반 — 나머지 절반은
     CSS 히트 패드. rect 폭 0(jsdom·미배치)이면 판정하지 않는다. */
  /* R109 — 이름표 붙은 점들 중 반경 내 최근접. 회전한 요소의 손잡이는
     외접 박스 모서리가 아니라 브라우저가 돌려놓은 실좌표에 있으므로,
     호출자가 실측한 점들을 그대로 받는 일반형이 정본이다. */
  function handleAtPts(pts, px, py, radius) {
    const r = radius == null ? 22 : radius;
    let best = null, bd = r + 1e-9;
    for (const k in pts) {
      const p = pts[k];
      if (!p || !isFinite(+p[0]) || !isFinite(+p[1])) continue;
      const d = Math.hypot(px - p[0], py - p[1]);
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  }

  /* 무회전 특수형 — 외접 박스 모서리 6점. R95 이래 결과 동일 (handleAtPts 위임) */
  function handleAt(rect, px, py, radius) {
    if (!rect || !(rect.width > 0) || !(rect.height > 0)) return null;
    return handleAtPts({
      tl: [rect.left, rect.top], tr: [rect.right, rect.top],
      bl: [rect.left, rect.bottom], br: [rect.right, rect.bottom],
      ml: [rect.left, rect.top + rect.height / 2], mr: [rect.right, rect.top + rect.height / 2],
    }, px, py, radius);
  }

  /* R95 — 리사이즈 비율 기본값: 사진·영상(src 보유)의 모서리 = 기본 비율 고정
     (shift = 자유). 그 외는 종전 그대로 shift = 고정. 터치엔 shift가 없다 —
     사진이 일그러지는 길 자체를 기본값에서 없앤다. */
  function aspectDefault(el, handle, shiftKey) {
    const corner = /^(tl|tr|bl|br)$/.test(handle || '');
    if (el && el.src && corner) return !shiftKey;
    return !!shiftKey;
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

  /* ===== R107 — 회전 기하 정본 =====
     el.rot 은 CSS transform:rotate(deg) 와 같은 그림(중심 기준, 시계 방향).
     workspace 가 회전을 표시하기 시작하면 제스처 수학도 회전을 알아야 한다:
     화면에서 끈 거리를 요소의 제 축으로 돌려놓고(unrotVec), 리사이즈로 중심이
     움직인 만큼 화면 기준 앵커가 어긋나는 것을 되돌린다(recenter). */

  /* 유효 각도만 통과 — 0~359 정규화. 무효·0 은 0 (= 회전 없음) */
  function rotOf(el) {
    const v = el && el.rot;
    if (!isFinite(+v)) return 0;
    return ((Math.round(+v) % 360) + 360) % 360;
  }

  /* 각도 기록 — 0 이면 키 삭제(§23 기본값=키 없음 규약) */
  function setRot(el, deg) {
    if (!el) return el;
    const d = isFinite(+deg) ? ((Math.round(+deg) % 360) + 360) % 360 : 0;
    if (d === 0) delete el.rot; else el.rot = d;
    return el;
  }

  /* 벡터 회전 — R(deg)·v (px 공간. % 는 축마다 배율이 달라 회전 불가) */
  function rotVec(x, y, deg) {
    const t = (+deg || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    return { x: x * c - y * s, y: x * s + y * c };
  }
  /* 역회전 — 화면 델타를 요소의 제 축으로 */
  function unrotVec(x, y, deg) { return rotVec(x, y, -(+deg || 0)); }

  /* 리사이즈 보정 — 중심이 c→c' 로 움직였을 때 화면 기준 앵커(반대 모서리)를
     제자리에 두는 평행이동 Δ = (I − R)(c − c'). 어느 모서리를 잡았든 동일하다. */
  function recenter(cx, cy, nx, ny, deg) {
    const dx = cx - nx, dy = cy - ny, r = rotVec(dx, dy, deg);
    return { x: dx - r.x, y: dy - r.y };
  }

  /* 화면 좌표 → 프레임 내 0~1 (object-position 과 같은 좌표계).
     cx·cy = 요소 중심(회전해도 불변), w·h = 회전 전 레이아웃 크기(px) */
  function framePos(cx, cy, w, h, px, py, deg) {
    const v = unrotVec(px - cx, py - cy, deg);
    return { x: clamp(0.5 + v.x / (w || 1), 0, 1), y: clamp(0.5 + v.y / (h || 1), 0, 1) };
  }

  /* ===== R108 — 회전이 스냅에까지 닿는다 =====
     R107 이 회전을 그리기 시작하자 스냅만 옛 세계에 남았다: 45° 돌린 사진의
     「왼쪽 변」은 화면에서 기울어진 선이라 다른 요소의 수직 변과 맞출 수 없고,
     사람이 실제로 맞추는 것은 그 요소가 차지하는 자리 = 외접 박스다.
     % 좌표계는 축마다 배율이 다르므로(x=씬너비%, y=씬높이%) 외접 계산에는
     씬 종횡비 ar=W/H 가 필요하다 — ar 을 받지 않으면 옛 길 그대로 간다. */

  /* 텍스트의 모델 높이(% of 씬 높이). 모델에 h 가 없는 유일한 종류라
     render.js frameOf 가 쓰는 추정식이 사실상 정본 — 같은 값임은 하니스가 기계 검증한다. */
  function textH(el) {
    const s = (el && +el.size) || 3;
    const lines = String((el && el.text) || '').split('\n').length;
    return Math.max(s * 1.5, s * 1.4 * lines);
  }

  /* 회전 전 % 박스 — 텍스트만 textH 로 높이를 얻는다 */
  function boxOf(el) {
    const w = (el && el.w) || 10;
    const h = (el && el.h != null) ? el.h : (el && el.kind === 'text' ? textH(el) : 8);
    return { x: (el && el.x) || 0, y: (el && el.y) || 0, w, h };
  }

  /* 외접 박스 — 회전한 요소가 화면에서 차지하는 자리.
     W' = w|cos| + h|sin|/ar, H' = w·ar·|sin| + h|cos| (px 로 환산 후 되돌린 식).
     중심은 회전 불변이므로 거기서 반씩 물린다. rot=0·ar 없음이면 boxOf 그대로. */
  function aabb(el, ar) {
    const b = boxOf(el), d = rotOf(el);
    if (!d || !(+ar > 0)) return b;
    const t = d * Math.PI / 180, c = Math.abs(Math.cos(t)), s = Math.abs(Math.sin(t));
    const W = b.w * c + b.h * s / ar;
    const H = b.w * s * ar + b.h * c;
    return { x: b.x + b.w / 2 - W / 2, y: b.y + b.h / 2 - H / 2, w: W, h: H };
  }

  /* 스냅 — 씬 중앙(50)·다른 요소의 변/중앙에 1.2% 이내면 흡착. 가이드 좌표 반환.
     ar>0 이면 회전을 아는 자(외접 박스·텍스트 실높이)로 잰다 — 흡착 결과는 어느 쪽이든
     평행이동(el.x/el.y 가감)이라 중심 기준 회전과 어긋나지 않는다. */
  function snap(el, others, thr = 1.2, ar = 0) {
    const B = (+ar > 0) ? (e) => aabb(e, ar) : (e) => ({ x: e.x, y: e.y, w: e.w || 10, h: e.h || 8 });
    const b = B(el);
    const mineX = [b.x, b.x + b.w / 2, b.x + b.w];
    const mineY = [b.y, b.y + b.h / 2, b.y + b.h];
    const tX = [50], tY = [50];
    (others || []).forEach((o) => {
      const ob = B(o);
      tX.push(ob.x, ob.x + ob.w / 2, ob.x + ob.w);
      tY.push(ob.y, ob.y + ob.h / 2, ob.y + ob.h);
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
  /* R89 — 큰 사진은 거부하지 않고 줄여서 받는다. 요즘 폰·카메라 사진은
     8MB를 예사로 넘는다 — 「8MB 이하만」은 선생님의 실사진 대부분을 문전에서
     돌려보내는 규칙이었다(준호 실기기: 사진 넣었는데 안 뜸). 장변 1920px로
     줄이면 영상·내보내기 품질은 그대로고 용량은 수백 KB로 준다.
     영상 파일은 재인코딩이 불가하므로 종전 8MB 규칙·안내 그대로. */
  /* R89 — 사진 입구 표준화. 요즘 폰·카메라 사진은 8MB를 예사로 넘고(종전
     규칙은 문전 거부 = 준호 실기기 「사진이 안 떠」), 8MB 「이하」 원본도
     dataURL로는 장당 수 MB라 localStorage 영속(5MB)이 조용히 실패함을
     실크롬으로 실측했다(7.7MB PNG 3장 → 저장 0바이트). 그래서 크기가 아니라
     쓰임에 맞춘다: 장면·내보내기 기준은 1280×720(썸네일 동일) — 장변
     1920px JPEG면 화질은 남고 장당 수백 KB로 줄어 영속도 산다.
     · 8MB 이하 & 장변 1920 이하 = 원본 무변형(스크린샷·그림 보호)
     · 그 외 래스터 사진 = 장변 1920 JPEG 재인코딩
     · GIF·SVG = 재인코딩이 애니·벡터를 죽이므로 종전 경로(8MB 규칙) 그대로
     · 영상 = 재인코딩 불가 — 종전 8MB 규칙·안내 그대로
     · 판독 불가 환경(구형·jsdom) = 짧은 대기 후 원본 통과(구세계 동작) */
  function shrinkImage(src, cb) {
    try {
      const img = new window.Image();
      img.onload = () => {
        try {
          const MAX = 1920;
          const ow = img.naturalWidth || img.width || 1, oh = img.naturalHeight || img.height || 1;
          const sc = Math.min(1, MAX / Math.max(ow, oh));
          const w = Math.max(1, Math.round(ow * sc)), h = Math.max(1, Math.round(oh * sc));
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          cb(cv.toDataURL('image/jpeg', 0.85));
        } catch (_) { cb(null, '사진이 너무 커서 줄이지 못했어요'); }
      };
      img.onerror = () => cb(null, '이 형식의 사진은 열 수 없어요');
      img.src = src;
    } catch (_) { cb(null, '사진이 너무 커서 줄이지 못했어요'); }
  }
  function normalizeImage(src, file, cb) {
    /* 능력 판별 — 캔버스 2d 가 없는 환경(구형·jsdom)은 축소 자체가 불가하므로
       즉시 원본 통과(구세계 동작). 타이머로 로드와 경주하면 큰 사진 디코드가
       느린 기기에서 축소가 새는 것을 실크롬로 확인했다(12MP 3장 중 2장 원본). */
    let can = false;
    try { const cv = document.createElement('canvas'); can = !!(cv.getContext && cv.getContext('2d')); } catch (_) {}
    if (!can) return cb(src);
    let done = false;
    const once = (s, e) => { if (done) return; done = true; cb(s, e); };
    try {
      const img = new window.Image();
      img.onload = () => {
        const long = Math.max(img.naturalWidth || img.width || 1, img.naturalHeight || img.height || 1);
        if ((file && file.size || 0) <= 8 * 1024 * 1024 && long <= 1920) return once(src);
        api.shrinkImage(src, once);
      };
      img.onerror = () => once(null, '이 형식의 사진은 열 수 없어요');
      img.src = src;
      setTimeout(() => once(src), 15000);   /* 극단 지연 안전망 — 경주가 아니라 최후 보루 */
    } catch (_) { once(src); }
  }

  function fileToSrc(file, cb, ReaderCls) {
    if (!file) return cb(null);
    const type = file.type || '';
    if (!/^(image|video)\//.test(type)) return cb(null);
    const raster = /^image\//.test(type) && !/gif|svg/.test(type);
    if (!raster && file.size > 8 * 1024 * 1024) return cb(null, '8MB 이하만 넣을 수 있어요');
    const R = ReaderCls || window.FileReader;
    const rd = new R();
    rd.onload = () => {
      const src = String(rd.result || '');
      if (raster) return api.normalizeImage(src, file, cb);
      cb(src);
    };
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
    /* R107 — 회전 기하 */
    /* R109 — handleAtPts: 최근접·반경 밖 null·무효점 건너뜀·handleAt 위임 동률 */
    const hp = { tl: [0, 0], tr: [100, 0], bad: [NaN, 5] };
    if (handleAtPts(hp, 3, 4, 22) !== 'tl') v.push('handleAtPts 최근접 오류');
    if (handleAtPts(hp, 50, 50, 22) !== null) v.push('handleAtPts 반경 밖이 잡힘');
    if (handleAtPts({ bad: [NaN, 0] }, 0, 0, 22) !== null) v.push('handleAtPts 무효점 미건너뜀');
    const hr = { left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50 };
    if (handleAt(hr, 98, 26, 22) !== 'mr') v.push('handleAt 위임 후 결과 변형');
    if (rotOf({ rot: -90 }) !== 270 || rotOf({ rot: 370 }) !== 10 || rotOf({}) !== 0 || rotOf({ rot: 'x' }) !== 0) v.push('rotOf 정규화 오류');
    const rz = { rot: 12 }; setRot(rz, 0);
    if ('rot' in rz) v.push('setRot 0° 키 미삭제');
    setRot(rz, -45); if (rz.rot !== 315) v.push('setRot 음수 정규화 오류');
    const rv = rotVec(10, 0, 90);
    if (Math.abs(rv.x) > 1e-9 || Math.abs(rv.y - 10) > 1e-9) v.push('rotVec 90° 오류');
    const uv = unrotVec(rv.x, rv.y, 90);
    if (Math.abs(uv.x - 10) > 1e-9 || Math.abs(uv.y) > 1e-9) v.push('unrotVec 왕복 실패');
    if (Math.abs(recenter(10, 10, 4, 4, 0).x) > 1e-9) v.push('회전 0° 보정이 0 이 아님');
    const rc = recenter(0, 0, 10, 0, 180);              /* (I−R180)=2I → Δ=2·(c−c') */
    if (Math.abs(rc.x + 20) > 1e-9) v.push('recenter 180° 오류');
    const fp = framePos(100, 100, 40, 20, 100, 100, 33);
    if (Math.abs(fp.x - 0.5) > 1e-9 || Math.abs(fp.y - 0.5) > 1e-9) v.push('framePos 중심 오류');
    const fp2 = framePos(100, 100, 40, 20, 100, 120, 90);  /* 90° 회전: 화면 아래 = 요소의 오른쪽(+x) */
    if (Math.abs(fp2.x - 1) > 1e-9 || Math.abs(fp2.y - 0.5) > 1e-9) v.push('framePos 회전 좌표 오류');
    /* R108 — 외접 박스·텍스트 높이 */
    if (Math.abs(textH({ size: 4, text: 'a\nb' }) - 11.2) > 1e-9) v.push('textH 2줄 오류');
    if (Math.abs(textH({ size: 4, text: '한 줄' }) - 6) > 1e-9) v.push('textH 1줄 하한 오류');
    const ab0 = aabb({ x: 10, y: 10, w: 20, h: 10 }, 16 / 9);
    if (ab0.w !== 20 || ab0.h !== 10 || ab0.x !== 10) v.push('aabb 무회전 항등 실패');
    const ab9 = aabb({ x: 0, y: 0, w: 20, h: 10, rot: 90 }, 1);
    if (Math.abs(ab9.w - 10) > 1e-9 || Math.abs(ab9.h - 20) > 1e-9) v.push('aabb 90° 축 교환 실패');
    if (Math.abs((ab9.x + ab9.w / 2) - 10) > 1e-9 || Math.abs((ab9.y + ab9.h / 2) - 5) > 1e-9) v.push('aabb 중심 이동');
    const abr = aabb({ x: 0, y: 0, w: 20, h: 10, rot: 90 }, 2);   /* ar 이 축 배율을 가른다 */
    if (Math.abs(abr.w - 5) > 1e-9 || Math.abs(abr.h - 40) > 1e-9) v.push('aabb 종횡비 미반영');
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

  const api = {
    dragTo, resizeTo, rotateTo, handleAt, handleAtPts, aspectDefault, snap, nudge, removeEl, dupEl, editText,
    rotOf, setRot, rotVec, unrotVec, recenter, framePos,          /* R107 — 회전 기하 */
    textH, boxOf, aabb,                                           /* R108 — 외접 박스·텍스트 모델 높이 */
    replaceWithSrc, insertWithSrc, fileToSrc, shrinkImage, normalizeImage,
    useBackend, saveDoc, loadDoc, clearDoc, saveProjects, restoreProjects, autosave, flush,
    liveAudit,
  };
  return api;
})();

/* 부팅 복원 — 저장된 프로젝트가 있으면 시드 대신 이어서 (실브라우저 전용, 실패 무해) */
try { if (window.MK_PROJ && window.localStorage) window.MK_LIVE.restoreProjects(); } catch (_) {}
