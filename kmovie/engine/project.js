/* ============================================================
   케이무비 프로젝트 모델 (KMV_PROJECT) — 설계서 v1 §1·§3
   ------------------------------------------------------------
   단일 정답 = 프로젝트 JSON. 시간은 전부 프레임 정수(30fps).
   불변식:  V 는 at 순 정렬 · 빈틈 없음 (at 은 relayout 이 항상 다시 센다)
            in < out · 0 ≤ in · out ≤ media.dur · 클립 길이 ≥ 1
   A1 은 V 와 1:1 링크. linked=false 면 J/L 컷(원본 in/out 이 V 와 다름).
   undo = 스냅샷 스택 (JSON 이 작다).
   ============================================================ */
(function (g) {
  'use strict';

  const FPS = 30, W = 1920, H = 1080;
  const IMAGE_DEFAULT = 5 * FPS;          // 사진 클립 기본 5초
  const IMAGE_MAX = 10 * 60 * FPS;        // 사진은 늘려도 10분까지
  const FREEZE_DEFAULT = 2 * FPS;         // 프리즈 프레임 기본 2초

  /* 속도 프리셋 4 — 커스텀 곡선 없음(헌법). f = 원본 1초가 타임라인에서 차지하는 비율의 역수 */
  const SPEED = {
    normal: { f: 1,       label: '정속',      badge: '' },
    slow:   { f: 0.5,     label: '슬로 0.5×', badge: '0.5×' },
    hit:    { f: 1 / 2.4, label: '히트 슬로', badge: '히트' },
    lapse:  { f: 4,       label: '타임랩스 4×', badge: '4×' },
  };
  /* 타임라인 진행 u(0..1) → 원본 진행 s(0..1). 히트 슬로: 앞 20% 정속 → 가운데 60% 를 0.3배 → 뒤 20% 정속 */
  function speedMap(speed, u) {
    if (speed === 'hit') {
      const x = u * 2.4;
      if (x < 0.2) return x;
      if (x < 2.2) return 0.2 + (x - 0.2) * 0.3;
      return 0.8 + (x - 2.2);
    }
    return u;
  }

  function blank() {
    return {
      v: 1, fps: FPS, w: W, h: H, theme: 'geumseong',
      media: [], V: [], A1: [], A2: [], P: [], S: [],
      look: { lut: 'cinema-navy', strength: 0.6, autoExpose: false, target: { luma: 0.48, contrast: 1 }, cinemaBar: false, vignette: 0 },
      audio: { ducking: { on: true, depth: 12 }, ambience: { on: false, src: null } },
    };
  }

  let P = blank();
  const listeners = [];
  const undoStack = [], redoStack = [];

  function uid(pre) { return pre + Math.random().toString(36).slice(2, 8); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function emit(kind) { listeners.forEach(fn => { try { fn(kind || 'change'); } catch (e) { console.error(e); } }); }

  /* ---------- 조회 ---------- */
  function media(id) { return P.media.find(m => m.id === id) || null; }
  function clip(id) { return P.V.find(c => c.id === id) || null; }
  function clipIndex(id) { return P.V.findIndex(c => c.id === id); }
  function audioOf(clipId) { return P.A1.find(a => a.clip === clipId) || null; }
  function total() { const l = P.V[P.V.length - 1]; return l ? l.at + l.dur : 0; }
  function clipAt(t) {
    for (let i = 0; i < P.V.length; i++) { const c = P.V[i]; if (t >= c.at && t < c.at + c.dur) return c; }
    return null;
  }
  /* 편집점(경계) 프레임 목록 — 스냅·↑↓ 이동용 */
  function edges() { const e = [0]; P.V.forEach(c => e.push(c.at + c.dur)); return e; }

  function clipDur(c) {
    if (c.freeze) return Math.max(1, c.dur | 0);
    const m = media(c.media);
    const sec = (c.out - c.in) / m.fps;
    return Math.max(1, Math.round(sec * FPS / SPEED[c.speed].f));
  }
  /* 타임라인 프레임 t → 원본 프레임 인덱스 */
  function srcFrame(c, t) {
    if (c.freeze) return c.in;
    const u = clamp((t - c.at) / c.dur, 0, 0.999999);
    const s = speedMap(c.speed, u);
    return c.in + Math.min(c.out - 1, Math.floor(s * (c.out - c.in)));
  }

  /* ---------- 불변식 복구 ---------- */
  function relayout() {
    let at = 0;
    P.V.forEach(c => { c.at = at; c.dur = clipDur(c); at += c.dur; });
    const keep = new Map(P.A1.map(a => [a.clip, a]));
    P.A1 = [];
    P.V.forEach(c => {
      const m = media(c.media);
      if (!m || m.kind !== 'video' || !m.audio || c.freeze) return;
      const a = keep.get(c.id) || { clip: c.id, in: c.in, out: c.out, at: c.at, dur: c.dur, vol: 1, linked: true };
      if (a.linked || c.speed !== 'normal') {           // 속도 클립은 항상 링크(J/L 은 정속에서만)
        a.linked = true; a.in = c.in; a.out = c.out; a.at = c.at; a.dur = c.dur;
      } else {
        a.in = clamp(a.in, 0, m.dur - 1); a.out = clamp(a.out, a.in + 1, m.dur);
        a.at = c.at + Math.round((a.in - c.in) * FPS / m.fps);
        a.dur = Math.max(1, Math.round((a.out - a.in) * FPS / m.fps));
      }
      P.A1.push(a);
    });
  }

  /* ---------- undo ---------- */
  function snapshot() { return JSON.stringify(P); }
  function commit() { undoStack.push(snapshot()); if (undoStack.length > 120) undoStack.shift(); redoStack.length = 0; }
  function undo() { if (!undoStack.length) return false; redoStack.push(snapshot()); P = JSON.parse(undoStack.pop()); relayout(); emit('undo'); return true; }
  function redo() { if (!redoStack.length) return false; undoStack.push(snapshot()); P = JSON.parse(redoStack.pop()); relayout(); emit('redo'); return true; }

  /* ---------- 미디어 ---------- */
  function addMedia(meta) {
    if (media(meta.id)) return meta;
    P.media.push(meta);
    emit('media');
    return meta;
  }
  function removeMedia(id) {
    commit();
    P.V = P.V.filter(c => c.media !== id);
    P.media = P.media.filter(m => m.id !== id);
    relayout(); emit('media');
  }

  /* ---------- 클립 편집 ---------- */
  function newClip(m) {
    const isImg = m.kind === 'image';
    return { id: uid('c'), media: m.id, in: 0, out: isImg ? IMAGE_DEFAULT : m.dur, at: 0, dur: 0,
      speed: 'normal', look: null, kenburns: null, transIn: null, freeze: false };
  }
  function addClip(mediaId, index) {
    const m = media(mediaId); if (!m) return null;
    commit();
    const c = newClip(m);
    if (index == null || index < 0 || index > P.V.length) index = P.V.length;
    P.V.splice(index, 0, c);
    relayout(); emit(); return c;
  }
  function removeClip(id, opt) {                        // 리플 삭제 — 빈틈은 존재할 수 없다
    const i = clipIndex(id); if (i < 0) return;
    if (!(opt && opt.commit === false)) commit();
    P.V.splice(i, 1);
    relayout(); emit();
  }
  function move(id, toIndex) {                          // 순서 바꾸기
    const i = clipIndex(id); if (i < 0) return;
    toIndex = clamp(toIndex, 0, P.V.length);
    if (toIndex === i || toIndex === i + 1) return;
    commit();
    const c = P.V.splice(i, 1)[0];
    if (toIndex > i) toIndex--;
    P.V.splice(toIndex, 0, c);
    relayout(); emit();
  }
  function split(t) {                                   // S — 플레이헤드에서 분할
    const c = clipAt(t); if (!c || t === c.at) return null;
    commit();
    const i = clipIndex(c.id);
    const c2 = Object.assign({}, c, { id: uid('c') });
    if (c.freeze) { const d1 = t - c.at; c2.dur = c.dur - d1; c.dur = d1; }
    else {
      const s = srcFrame(c, t);
      if (s <= c.in || s >= c.out) return null;
      c2.in = s; c.out = s;
      const a = audioOf(c.id); if (a) a.linked = true;  // J/L 은 분할하면 링크로 복귀
    }
    P.V.splice(i + 1, 0, c2);
    relayout(); emit(); return c2;
  }
  /* 트림 — side:'in'|'out', value: 원본 프레임(프리즈는 타임라인 길이 변경). 드래그 중엔 commit:false */
  function trim(id, side, value, opt) {
    const c = clip(id); if (!c) return;
    const m = media(c.media);
    if (!(opt && opt.commit === false)) commit();
    value = Math.round(value);
    if (c.freeze) { c.dur = clamp(value, 1, IMAGE_MAX); }
    else {
      const maxOut = m.kind === 'image' ? IMAGE_MAX : m.dur;
      const minLen = Math.max(1, Math.ceil(m.fps / FPS * SPEED[c.speed].f)); // 타임라인 1프레임 이상
      if (side === 'in') c.in = clamp(value, 0, c.out - minLen);
      else c.out = clamp(value, c.in + minLen, maxOut);
    }
    relayout(); emit();
  }
  /* Q/W — 플레이헤드까지 리플 트림 */
  function trimToPlayhead(t, side) {
    const c = clipAt(t); if (!c) return;
    if (side === 'in') {
      if (t === c.at) return;
      if (c.freeze) trim(c.id, 'in', c.dur - (t - c.at)); else trim(c.id, 'in', srcFrame(c, t));
    } else {
      if (t === c.at) { removeClip(c.id); return; }
      if (c.freeze) trim(c.id, 'out', t - c.at); else trim(c.id, 'out', srcFrame(c, t));
    }
  }
  function freeze(t, durFrames) {                       // F — 그 프레임을 N초 정지 클립으로
    const c = clipAt(t); if (!c || c.freeze) return null;
    const m = media(c.media); if (m.kind === 'image') return null;
    commit();
    const s = srcFrame(c, t);
    const fz = { id: uid('c'), media: c.media, in: s, out: s + 1, at: 0, dur: durFrames || FREEZE_DEFAULT,
      speed: 'normal', look: c.look, kenburns: null, transIn: null, freeze: true };
    let i = clipIndex(c.id);
    if (t > c.at && s > c.in && s < c.out) {              // 가운데면 분할 후 사이에
      const c2 = Object.assign({}, c, { id: uid('c'), in: s }); c.out = s;
      P.V.splice(i + 1, 0, fz, c2);
    } else if (t === c.at) P.V.splice(i, 0, fz);
    else P.V.splice(i + 1, 0, fz);
    relayout(); emit(); return fz;
  }
  function setSpeed(id, speed) {
    const c = clip(id); if (!c || c.freeze || !SPEED[speed] || c.speed === speed) return;
    commit(); c.speed = speed; relayout(); emit();
  }
  function setVol(clipId, vol) {
    const a = audioOf(clipId); if (!a) return;
    commit(); a.vol = clamp(vol, 0, 2); emit();
  }
  /* Alt+드래그 — 소리 띠만 늘이기/줄이기 = J/L 컷. value: 원본 프레임 */
  function audioTrim(clipId, side, value, opt) {
    const a = audioOf(clipId), c = clip(clipId); if (!a || !c || c.speed !== 'normal') return;
    const m = media(c.media);
    if (!(opt && opt.commit === false)) commit();
    a.linked = false; value = Math.round(value);
    if (side === 'in') a.in = clamp(value, 0, a.out - 1);
    else a.out = clamp(value, a.in + 1, m.dur);
    relayout(); emit();
  }
  function relink(clipId) { const a = audioOf(clipId); if (!a || a.linked) return; commit(); a.linked = true; relayout(); emit(); }

  /* ---------- 저장/복구 ---------- */
  function toJSON() { return JSON.parse(snapshot()); }
  function load(json) {
    const b = blank();
    P = Object.assign(b, json || {});
    P.V = (P.V || []).filter(c => media(c.media));
    relayout(); undoStack.length = 0; redoStack.length = 0; emit('load');
  }
  function reset() { P = blank(); undoStack.length = 0; redoStack.length = 0; emit('load'); }

  g.KMV_PROJECT = {
    FPS, W, H, SPEED, IMAGE_DEFAULT, FREEZE_DEFAULT,
    get data() { return P; },
    on: fn => listeners.push(fn),
    media, clip, clipIndex, audioOf, clipAt, total, edges, srcFrame, clipDur, speedMap,
    addMedia, removeMedia, addClip, removeClip, move, split, trim, trimToPlayhead, freeze, setSpeed, setVol, audioTrim, relink,
    commit, undo, redo, canUndo: () => undoStack.length > 0, canRedo: () => redoStack.length > 0,
    toJSON, load, reset,
  };
})(typeof window !== 'undefined' ? window : globalThis);
