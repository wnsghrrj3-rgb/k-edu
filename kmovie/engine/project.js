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
  /* 속도 램프 — 슬로·타임랩스로 "부드럽게 들어가고 나오는" 구간(클립 길이의 비율). 프리미어 타임 리맵의 베지어 램프와 같은 역할.
     클립 길이는 그대로 두고 안쪽 매핑만 굽힌다: 양 끝은 정속(1×), 가운데가 프리셋 속도 — 원본 소모량이 같도록 가운데 속도를 살짝 보정. */
  const RAMP = { none: 0, short: 0.15, normal: 0.25, long: 0.4 };
  const ss = x => x * x * (3 - 2 * x), ssInt = x => x * x * x - x * x * x * x / 2;          // smoothstep 과 그 적분
  /* w(u) 의 적분 — w 는 [0,R] 에서 0→1, 가운데 1, [1-R,1] 에서 1→0 */
  function rampW(u, R) {
    if (R <= 0) return u;
    if (u < R) return R * ssInt(u / R);
    if (u < 1 - R) return R * 0.5 + (u - R);
    const x = (u - (1 - R)) / R;
    return R * 0.5 + (1 - 2 * R) + R * (0.5 - ssInt(1 - x));
  }
  function rampCurve(f, R) { const S1 = R + f * (1 - R); return { S: u => (u - rampW(u, R) + f * rampW(u, R)) / S1, r: u => { const w = u < R ? ss(u / R) : u < 1 - R ? 1 : ss((1 - u) / R); return (1 - w + f * w) / S1 * f; } }; }
  function speedMap(speed, u, ramp) {
    if (speed === 'hit') {
      const x = u * 2.4;
      if (x < 0.2) return x;
      if (x < 2.2) return 0.2 + (x - 0.2) * 0.3;
      return 0.8 + (x - 2.2);
    }
    const R = RAMP[ramp] || 0, f = SPEED[speed] ? SPEED[speed].f : 1;
    if (R > 0 && f !== 1) return rampCurve(f, R).S(clamp(u, 0, 1));
    return u;
  }
  /* 타임라인 진행 u 에서의 원본 재생 배속(소리 playbackRate 용) — 램프 없으면 프리셋 배속 그대로 */
  function rateAt(c, u) {
    const R = RAMP[c.ramp] || 0, f = SPEED[c.speed] ? SPEED[c.speed].f : 1;
    if (c.speed === 'hit' || R <= 0 || f === 1) return f;
    return rampCurve(f, R).r(clamp(u, 0, 1));
  }

  function blank() {
    return {
      v: 1, fps: FPS, w: W, h: H, theme: 'geumseong',
      media: [], V: [], V2: [], A1: [], A2: [], P: [], S: [], markers: [],
      look: { lut: 'cinema-navy', strength: 0.6, autoExpose: false, target: { luma: 0.48, contrast: 1 }, cinemaBar: false, vignette: 0 },
      audio: { ducking: { on: true, depth: 12 }, ambience: { on: false, src: null, gain: 1 }, sfx: { on: false, gain: 1 } },
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
    const s = speedMap(c.speed, u, c.ramp);
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
    P.V2 = (P.V2 || []).filter(o => o.media !== id);
    P.A2 = (P.A2 || []).filter(a => a.media !== id);
    P.media = P.media.filter(m => m.id !== id);
    if (P.audio.ambience && P.audio.ambience.src && P.audio.ambience.src.media === id) P.audio.ambience.src = null;
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
    return splitCore(t);
  }
  /* 분할의 알맹이 (commit 없음) — 삽입·덮어쓰기·붙여넣기가 안에서 같이 쓴다 */
  function splitCore(t) {
    const c = clipAt(t); if (!c || t === c.at) return null;
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
  function setRamp(id, ramp) {
    const c = clip(id); if (!c || c.freeze || RAMP[ramp] == null || (c.ramp || 'none') === ramp) return;
    commit(); c.ramp = ramp === 'none' ? undefined : ramp; emit();
  }
  function setDenoise(id, level) { const c = clip(id); if (!c || c.freeze) return; const v = level === 'light' || level === 'strong' ? level : undefined; if ((c.denoise || undefined) === v) return; commit(); c.denoise = v; emit(); }
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

  /* ---------- 6단계: 프리미어급 컷 도구 ----------
     슬립: 클립의 자리·길이는 그대로, 원본 구간(in/out)만 같이 민다 (Alt+몸통 끌기).
     롤: 편집점 하나를 움직인다 — 앞 클립 out 과 뒤 클립 in 이 같이, 전체 길이는 그대로 (Ctrl+가장자리 끌기).
     3점 편집: 소스 모니터의 I/O 구간을 플레이헤드에 삽입(,) 또는 덮어쓰기(.).
     다중 선택: 여러 클립 한 번에 삭제·이동·복사·붙여넣기. 마커: 눈금자 위 메모, 스냅 후보. */
  function slip(id, deltaSrc, opt) {
    const c = clip(id); if (!c || c.gap) return;
    const m = media(c.media); if (!m || m.kind === 'image') return;
    if (!(opt && opt.commit === false)) commit();
    const len = c.out - c.in;
    let nin = Math.round(c.in + deltaSrc);
    if (c.freeze) { nin = clamp(nin, 0, m.dur - 1); c.in = nin; c.out = nin + 1; }
    else { nin = clamp(nin, 0, m.dur - len); c.in = nin; c.out = nin + len; }
    const a = audioOf(c.id); if (a && a.linked === false) { a.linked = true; }   // J/L 은 슬립하면 링크로 복귀(원본 위치가 바뀌었으니)
    relayout(); emit();
  }
  /* a 는 뒤(out)를 d 만큼 늘이고 b 는 앞(in)을 d 만큼 줄인다 — 롤·슬라이드 공용 수식.
     deltaTl: 타임라인 프레임(+ = a 가 늘어남). 한계로 잘린 실제 적용량을 돌려준다. */
  function pairShift(a, b, deltaTl) {
    const ma = media(a.media), mb = media(b.media);
    const ka = a.freeze ? 1 : ma.fps / FPS * SPEED[a.speed].f, kb = b.freeze ? 1 : mb.fps / FPS * SPEED[b.speed].f;
    // 앞 클립이 늘 수 있는 한도 / 뒤 클립이 줄 수 있는 한도 (각각 1프레임은 남긴다)
    const maxA = a.freeze ? IMAGE_MAX - a.dur : (ma.kind === 'image' ? IMAGE_MAX : ma.dur) - a.out;      // 원본 프레임 단위
    const minA = a.freeze ? -(a.dur - 1) : -(a.out - a.in - Math.max(1, Math.ceil(ka)));
    const maxB = b.freeze ? b.dur - 1 : (b.out - b.in - Math.max(1, Math.ceil(kb)));                       // b 가 줄 수 있는 양(원본) — d>0
    const minB = b.freeze ? -(IMAGE_MAX - b.dur) : -b.in;                                                    // b 가 늘 수 있는 양(원본, 음수) — d<0
    let d = deltaTl;
    d = clamp(d, Math.ceil(minA / ka), Math.floor(maxA / ka));
    d = clamp(d, Math.ceil(minB / kb), Math.floor(maxB / kb));
    if (a.freeze) a.dur += d; else a.out = Math.round(a.out + d * ka);
    if (b.freeze) b.dur -= d; else b.in = Math.round(b.in + d * kb);
    for (const x of [a, b]) { const au = audioOf(x.id); if (au && !au.linked) au.linked = true; }
    return d;
  }
  /* prevId 클립의 out 쪽 편집점을 deltaTl(타임라인 프레임) 만큼 민다. 다음 클립이 없으면 false */
  function roll(prevId, deltaTl, opt) {
    const i = clipIndex(prevId); if (i < 0 || i + 1 >= P.V.length) return false;
    deltaTl = Math.round(deltaTl); if (!deltaTl) return true;
    if (!(opt && opt.commit === false)) commit();
    pairShift(P.V[i], P.V[i + 1], deltaTl);
    relayout(); emit(); return true;
  }
  /* 슬라이드 — 클립의 내용·길이는 그대로, 타임라인 위 자리만 민다.
     앞 클립 out 이 늘고(줄고) 뒤 클립 in 이 줄어(늘어) 전체 길이 불변. 양옆에 클립이 있어야 한다. */
  function slide(id, deltaTl, opt) {
    const i = clipIndex(id); if (i <= 0 || i + 1 >= P.V.length) return false;
    deltaTl = Math.round(deltaTl); if (!deltaTl) return true;
    if (!(opt && opt.commit === false)) commit();
    pairShift(P.V[i - 1], P.V[i + 1], deltaTl);
    relayout(); emit(); return true;
  }
  /* 리프트 — 선택 클립을 같은 길이의 빈 자리(검은 화면)로 바꾼다. 뒤 클립은 밀리지 않는다.
     빈 자리도 V 의 클립이라 "빈틈 없음" 불변식은 그대로다. 잇닿은 빈 자리는 하나로 합친다. */
  function newGap(dur) {
    return { id: uid('c'), media: null, gap: true, freeze: true, in: 0, out: 1, at: 0,
      dur: Math.max(1, Math.round(dur)), speed: 'normal', look: null, kenburns: null, transIn: null };
  }
  function lift(ids) {
    const set = new Set(ids);
    let n = 0;
    for (const c of P.V) if (set.has(c.id) && !c.gap) n++;
    if (!n) return 0;
    commit();
    P.V = P.V.map(c => set.has(c.id) && !c.gap ? newGap(clipDur(c)) : c);
    for (let i = P.V.length - 1; i > 0; i--) if (P.V[i].gap && P.V[i - 1].gap) { P.V[i - 1].dur += P.V[i].dur; P.V.splice(i, 1); }
    relayout(); emit(); return n;
  }
  /* 소스 구간 → 타임라인. mode: 'insert'(플레이헤드에서 뒤를 밀며) | 'overwrite'(그 길이만큼 덮어씀) | 'append'(끝에) */
  function insertRange(mediaId, range, t, mode) {
    const m = media(mediaId); if (!m || m.kind === 'audio') return null;
    commit();
    const c = newClip(m);
    if (range && m.kind !== 'image') { c.in = clamp(Math.round(range.in), 0, m.dur - 1); c.out = clamp(Math.round(range.out), c.in + 1, m.dur); }
    else if (range && m.kind === 'image' && range.dur) c.out = clamp(Math.round(range.dur), 1, IMAGE_MAX);
    const placed = placeCore(c, t, mode);
    relayout(); emit(); return placed;
  }
  /* 클립 하나를 t 에 놓는 알맹이 (commit·relayout 없음). 반환: 놓인 클립 */
  function placeCore(c, t, mode) {
    const tot = total();
    if (mode === 'append' || t == null || t >= tot) { c.at = tot; P.V.push(c); return c; }
    t = Math.max(0, Math.round(t));
    if (mode === 'overwrite') {
      const L = clipDur(c), end = t + L;
      splitCore(t); if (end < tot) splitCore(end);
      relayout();
      P.V = P.V.filter(x => !(x.at >= t && x.at + x.dur <= end));
      let idx = P.V.findIndex(x => x.at >= t); if (idx < 0) idx = P.V.length;
      P.V.splice(idx, 0, c); return c;
    }
    splitCore(t); relayout();
    let idx = P.V.findIndex(x => x.at >= t); if (idx < 0) idx = P.V.length;
    P.V.splice(idx, 0, c); return c;
  }
  /* ---------- 자동 편집(KMV_AUTO) 이 쓰는 묶음 조작 ---------- */
  /* 타임라인 구간들 [{at,dur}] 을 한꺼번에 잘라낸다(리플) — undo 한 번.
     자막·부품·덧영상·마커는 시각이 따라오고(잘린 구간 안은 사라짐, 걸친 카드는 줄어듦), 음악은 시작만 따라온다(길이 유지).
     opt.follow === false 면 V 만. → 실제로 잘라낸 프레임 수 */
  function removeRanges(ranges, opt) {
    const AU = g.KMV_AUTO;
    const rs = (ranges || []).map(r => ({ at: Math.max(0, Math.round(r.at)), dur: Math.round(r.dur) })).filter(r => r.dur > 0 && r.at < total()).sort((a, b) => a.at - b.at);
    if (!rs.length) return 0;
    commit();
    const before = total();
    for (let i = rs.length - 1; i >= 0; i--) {                                // 뒤부터 — 앞 구간 시각이 안 흔들린다
      const a = rs[i].at, b = Math.min(total(), rs[i].at + rs[i].dur);
      if (b <= a) continue;
      if (clipAt(b) && clipAt(b).at !== b) splitCore(b);
      if (clipAt(a) && clipAt(a).at !== a) splitCore(a);
      P.V = P.V.filter(c => !(c.at >= a && c.at + c.dur <= b));
      relayout();
    }
    if (!(opt && opt.follow === false) && AU) {
      P.S = AU.remapCards(P.S, rs); P.P = AU.remapCards(P.P, rs); P.V2 = AU.remapCards(P.V2, rs);
      P.A2 = AU.remapCards(P.A2, rs, true); P.markers = AU.remapPoints(P.markers, rs);
    }
    emit();
    return before - total();
  }
  /* 여러 프레임에서 한 번에 분할(undo 한 번) — 장면 나누기. → 실제로 나뉜 수 */
  function splitMany(frames) {
    const fs = [...new Set((frames || []).map(t => Math.round(t)))].filter(t => t > 0 && t < total()).sort((a, b) => b - a);
    if (!fs.length) return 0;
    commit();
    let n = 0;
    for (const t of fs) { if (splitCore(t)) n++; }
    emit();
    return n;
  }
  function removeClips(ids) {
    const set = new Set(ids); if (!P.V.some(c => set.has(c.id))) return;
    commit(); P.V = P.V.filter(c => !set.has(c.id)); relayout(); emit();
  }
  /* 선택 클립들을 순서 유지한 채 toIndex(원래 배열 기준 삽입 위치) 로 */
  function moveClips(ids, toIndex) {
    const set = new Set(ids), picked = P.V.filter(c => set.has(c.id)); if (!picked.length) return;
    toIndex = clamp(toIndex, 0, P.V.length);
    const before = P.V.slice(0, toIndex).filter(c => !set.has(c.id)).length;
    const rest = P.V.filter(c => !set.has(c.id));
    if (picked.length === 1) { const i = clipIndex(picked[0].id); if (toIndex === i || toIndex === i + 1) return; }
    commit();
    rest.splice(before, 0, ...picked); P.V = rest; relayout(); emit();
  }
  /* 복사한 클립 JSON 들을 t 에 삽입(순서대로). A1 볼륨·J/L 은 같이 온다 */
  function pasteClips(items, t) {
    if (!items || !items.length) return [];
    commit();
    const made = [];
    let at = t == null ? total() : Math.max(0, Math.round(t));
    for (const it of items) {
      const m = media(it.clip.media); if (!m && !it.clip.gap) continue;
      const c = Object.assign({}, it.clip, { id: uid('c') });
      placeCore(c, at, at >= total() ? 'append' : 'insert'); relayout();
      if (it.audio) P.A1.push(Object.assign({}, it.audio, { clip: c.id }));
      at = c.at + c.dur; made.push(c);
    }
    relayout(); emit(); return made;
  }
  function copyClips(ids) { return ids.map(id => clip(id)).filter(Boolean).map(c => ({ clip: JSON.parse(JSON.stringify(c)), audio: audioOf(c.id) ? JSON.parse(JSON.stringify(audioOf(c.id))) : null })); }
  /* 마커 { id, at, text, color } */
  function sortM() { P.markers.sort((a, b) => a.at - b.at); }
  function marker(id) { return P.markers.find(x => x.id === id) || null; }
  function markerAt(t, tol) { tol = tol == null ? 0 : tol; for (const x of P.markers) if (Math.abs(x.at - t) <= tol) return x; return null; }
  function addMarker(card) { commit(); const x = Object.assign({ id: uid('m'), at: 0, text: '', color: 'gold' }, card); x.at = Math.max(0, Math.round(x.at)); P.markers.push(x); sortM(); emit('M'); return x; }
  function updateMarker(id, patch) { const x = marker(id); if (!x) return; commit(); Object.assign(x, patch); x.at = Math.max(0, Math.round(x.at)); sortM(); emit('M'); }
  function removeMarker(id) { const i = P.markers.findIndex(x => x.id === id); if (i < 0) return; commit(); P.markers.splice(i, 1); emit('M'); }
  function markerFrames() { return P.markers.map(x => x.at); }

  /* ---------- 3단계: 룩·켄 번즈·전환 ---------- */
  function setLook(clipId, patch, opt) {                // patch: {lut?, strength?, bright?, contrast?, sat?}. lut: undefined=프로젝트 따름, null=없음
    const c = clip(clipId); if (!c) return;
    if (!(opt && opt.commit === false)) commit();
    if (patch === null) c.look = null;
    else { c.look = Object.assign({}, c.look || {}); for (const k in patch) { if (patch[k] === undefined) delete c.look[k]; else c.look[k] = patch[k]; } if (!Object.keys(c.look).length) c.look = null; }
    emit('look');
  }
  function setProjectLook(patch, opt) {                 // {lut, strength, autoExpose, autoStrength, cinemaBar, vignette}
    if (!(opt && opt.commit === false)) commit();
    Object.assign(P.look, patch); emit('look');
  }
  /* 클립 등장/퇴장 페이드 (KMV_FX.CLIP) — side 'in'|'out', spec null | {type, dur:'short'|'normal'|'long'} */
  function setFade(clipId, side, spec) { const c = clip(clipId); if (!c) return; commit(); const key = side === 'out' ? 'fadeOut' : 'fadeIn'; c[key] = spec && spec.type ? Object.assign({ dur: 'normal' }, spec) : null; emit(); }
  function setKenburns(clipId, id) { const c = clip(clipId); if (!c) return; commit(); c.kenburns = id || null; emit(); }
  function setTransition(clipId, tr) {                  // tr: null | {type, dur:'short'|'normal'|'long', dir?}
    const c = clip(clipId); if (!c) return; commit();
    c.transIn = tr && tr.type && tr.type !== 'cut' ? Object.assign({ dur: 'normal' }, tr) : null; emit();
  }
  function setTheme(id) { commit(); P.theme = id; emit('look'); }

  /* ---------- 3단계: 자막 S ---------- */
  function sortS() { P.S.sort((a, b) => a.at - b.at); }
  function addS(card) { commit(); const s = Object.assign({ id: uid('s'), text: '', at: 0, dur: 2 * FPS, style: 'basic' }, card); P.S.push(s); sortS(); emit('S'); return s; }
  function setS(list) { commit(); P.S = list.map(c => Object.assign({ id: uid('s'), style: 'basic' }, c)); sortS(); emit('S'); }
  function addManyS(cards) {                            // 받아쓰기 등 — undo 한 번으로 여러 장
    if (!cards || !cards.length) return [];
    commit();
    const out = cards.map(c => {
      const s = Object.assign({ id: uid('s'), text: '', at: 0, dur: 2 * FPS, style: 'basic' }, c);
      s.at = Math.max(0, Math.round(s.at)); s.dur = Math.max(FPS / 3 | 0, Math.round(s.dur));
      P.S.push(s); return s;
    });
    sortS(); emit('S'); return out;
  }
  function subtitle(id) { return P.S.find(s => s.id === id) || null; }
  function updateS(id, patch, opt) {
    const s = subtitle(id); if (!s) return;
    if (!(opt && opt.commit === false)) commit();
    Object.assign(s, patch);
    s.at = Math.max(0, Math.round(s.at)); s.dur = Math.max(FPS / 3 | 0, Math.round(s.dur));
    sortS(); emit('S');
  }
  function removeS(id) { const i = P.S.findIndex(s => s.id === id); if (i < 0) return; commit(); P.S.splice(i, 1); emit('S'); }
  function clearS() { if (!P.S.length) return; commit(); P.S = []; emit('S'); }
  function subtitleAt(t) { for (const s of P.S) if (t >= s.at && t < s.at + s.dur) return s; return null; }

  /* ---------- 4단계: 부품 P ----------
     카드 { id, part, at, dur, p:{부품 필드}, cut?: true|false }  — cut: 인물 컷아웃(뒤에 놓기) 강제, 없으면 부품 메타가 정함.
     겹침 허용(광누출 위에 로워서드 등). 그리는 순서는 at 순. */
  function sortP() { P.P.sort((a, b) => a.at - b.at); }
  function part(id) { return P.P.find(x => x.id === id) || null; }
  function partDefault(partId) {
    const K = g.KM_PARTS, def = K && K.get(partId);
    return { dur: Math.round((def ? def.dur : 5) * FPS), p: def ? K.defaults(partId) : {} };
  }
  function addP(card) {
    if (!card || !card.part) return null;
    commit();
    const d = partDefault(card.part);
    const x = Object.assign({ id: uid('p'), at: 0, dur: d.dur, p: d.p }, card);
    x.p = Object.assign({}, d.p, card.p || {});
    x.at = Math.max(0, Math.round(x.at)); x.dur = Math.max(FPS / 3 | 0, Math.round(x.dur));
    P.P.push(x); sortP(); emit('P'); return x;
  }
  function updateP(id, patch, opt) {
    const x = part(id); if (!x) return;
    if (!(opt && opt.commit === false)) commit();
    if (patch.p) { x.p = Object.assign({}, x.p, patch.p); patch = Object.assign({}, patch); delete patch.p; }
    Object.assign(x, patch);
    x.at = Math.max(0, Math.round(x.at)); x.dur = Math.max(FPS / 3 | 0, Math.round(x.dur));
    sortP(); emit('P');
  }
  function removeP(id) { const i = P.P.findIndex(x => x.id === id); if (i < 0) return; commit(); P.P.splice(i, 1); emit('P'); }
  function clearP() { if (!P.P.length) return; commit(); P.P = []; emit('P'); }
  function partsAt(t) { return P.P.filter(x => t >= x.at && t < x.at + x.dur); }

  /* ---------- 14단계: 덧영상 V2 ----------
     항목 { id, media, in, out(원본 프레임), at, dur(타임라인 프레임 — in/out 에서 파생), speed:'normal', pos, size }.
     클립과 같은 모양이라 srcFrame·drawClip 을 그대로 쓴다. 소리는 없다(현장음·음악과 안 섞음).
     pos: tl/tr/bl/br(모서리)·c(중앙)·full(꽉) · size: sm 28% / md 38% / lg 50% (full 은 무시). 겹침 허용 — 배열 뒤가 위. */
  const V2_POS = ['tl', 'tr', 'bl', 'br', 'c', 'full'], V2_SIZE = { sm: 0.28, md: 0.38, lg: 0.5 };
  function sortV2() { P.V2.sort((a, b) => a.at - b.at); }
  function v2(id) { return (P.V2 || []).find(x => x.id === id) || null; }
  function v2Dur(o, m) { return Math.max(1, Math.round((o.out - o.in) / m.fps * FPS)); }
  function addV2(mediaId, at) {
    const m = media(mediaId); if (!m || (m.kind !== 'video' && m.kind !== 'image')) return null;
    commit();
    const out = m.kind === 'image' ? IMAGE_DEFAULT : Math.min(m.dur, Math.round(10 * m.fps));   // 영상 기본 10초 (트림으로 늘림)
    const x = { id: uid('o'), media: m.id, in: 0, out, at: Math.max(0, Math.round(at || 0)), speed: 'normal', freeze: false, pos: 'br', size: 'md' };
    x.dur = m.kind === 'image' ? out : v2Dur(x, m);
    P.V2.push(x); sortV2(); emit('V2'); return x;
  }
  function updateV2(id, patch, opt) {
    const x = v2(id); if (!x) return;
    if (!(opt && opt.commit === false)) commit();
    Object.assign(x, patch);
    x.at = Math.max(0, Math.round(x.at));
    sortV2(); emit('V2');
  }
  /* 가장자리 트림 — dTl(타임라인 프레임). in 쪽은 at 이 같이 움직인다. 사진은 dur 만. */
  function trimV2(id, side, dTl, opt) {
    const x = v2(id); if (!x) return;
    const m = media(x.media);
    if (!(opt && opt.commit === false)) commit();
    if (m.kind === 'image') {
      if (side === 'in') { const d = clamp(Math.round(dTl), -x.at, x.dur - 10); x.at += d; x.dur -= d; x.out = x.in + x.dur; }
      else { x.dur = Math.max(10, Math.round(x.dur + dTl)); x.out = x.in + x.dur; }
    } else {
      const dSrc = Math.round(dTl * m.fps / FPS);
      if (side === 'in') { const d = clamp(dSrc, -x.in, x.out - x.in - Math.ceil(m.fps / 3)); x.in += d; x.at = Math.max(0, x.at + Math.round(d * FPS / m.fps)); }
      else { x.out = clamp(x.out + dSrc, x.in + Math.ceil(m.fps / 3), m.dur); }
      x.dur = v2Dur(x, m);
    }
    sortV2(); emit('V2');
  }
  function removeV2(id) { const i = P.V2.findIndex(x => x.id === id); if (i < 0) return; commit(); P.V2.splice(i, 1); emit('V2'); }
  function v2At(t) { return (P.V2 || []).filter(x => t >= x.at && t < x.at + x.dur); }

  /* ---------- 4단계: 음악 A2 ----------
     항목 { id, media, in, out, at, vol, fadeIn, fadeOut } — in/out/at 전부 타임라인 프레임(음악 미디어 fps=30 고정). 길이 = out-in. */
  function sortA2() { P.A2.sort((a, b) => a.at - b.at); }
  function a2(id) { return P.A2.find(x => x.id === id) || null; }
  function addA2(mediaId, at) {
    const m = media(mediaId); if (!m || m.kind !== 'audio') return null;
    commit();
    const x = { id: uid('a'), media: m.id, in: 0, out: m.dur, at: Math.max(0, Math.round(at || 0)), vol: 1, fadeIn: FPS, fadeOut: 2 * FPS };
    P.A2.push(x); sortA2(); emit('A2'); return x;
  }
  function updateA2(id, patch, opt) {
    const x = a2(id); if (!x) return;
    const m = media(x.media);
    if (!(opt && opt.commit === false)) commit();
    Object.assign(x, patch);
    x.at = Math.max(0, Math.round(x.at));
    x.in = clamp(Math.round(x.in), 0, m.dur - 1); x.out = clamp(Math.round(x.out), x.in + 1, m.dur);
    x.vol = clamp(x.vol == null ? 1 : x.vol, 0, 2);
    const len = x.out - x.in;
    x.fadeIn = clamp(Math.round(x.fadeIn || 0), 0, len); x.fadeOut = clamp(Math.round(x.fadeOut || 0), 0, len - x.fadeIn);
    sortA2(); emit('A2');
  }
  /* 가장자리 트림 — side 'in': at 과 in 이 같이 움직임(소리는 제자리), 'out': out 만 */
  function trimA2(id, side, tlFrame, opt) {
    const x = a2(id); if (!x) return;
    tlFrame = Math.round(tlFrame);
    if (side === 'in') { const d = clamp(tlFrame - x.at, -x.in, x.out - x.in - 1); updateA2(id, { at: x.at + d, in: x.in + d }, opt); }
    else updateA2(id, { out: clamp(x.in + (tlFrame - x.at), x.in + 1, media(x.media).dur) }, opt);
  }
  function removeA2(id) { const i = P.A2.findIndex(x => x.id === id); if (i < 0) return; commit(); P.A2.splice(i, 1); emit('A2'); }
  function setDucking(patch) { commit(); Object.assign(P.audio.ducking, patch); emit('A2'); }
  /* audio.sfx { on, gain } — 전환·부품·자막에 붙는 효과음 전체 켜기/세기 (설계 v1 §3) */
  function setSfx(patch, opt) { if (!(opt && opt.commit === false)) commit(); if (!P.audio.sfx) P.audio.sfx = { on: false, gain: 1 }; Object.assign(P.audio.sfx, patch); emit('A2'); }
  function a2At(t) { for (const x of P.A2) if (t >= x.at && t < x.at + (x.out - x.in)) return x; return null; }


  /* ---------- 4단계 잔여: 앰비언스(룸톤) ----------
     audio.ambience { on, src:{media,in,out}|null (원본 프레임, 조용한 룸톤 구간), gain(선형) }
     A1 이 비는 구간(사진·프리즈·무음 클립)을 룸톤 루프로 채운다. 스케줄은 KMV_AUDIO.scheduleAmb. */
  function setAmbience(patch, opt) {
    if (!(opt && opt.commit === false)) commit();
    if (!P.audio.ambience) P.audio.ambience = { on: false, src: null, gain: 1 };
    Object.assign(P.audio.ambience, patch);
    if (P.audio.ambience.src && !media(P.audio.ambience.src.media)) P.audio.ambience.src = null;
    emit('amb');
  }

  /* ---------- 4단계 잔여: 몽타주 깔기 ----------
     clipIds(V 에서 연속·순서대로) 를 박자 격자 beatsAbs(타임라인 프레임, 오름차순) 에 맞춰 트림한다.
     every: 몇 박마다 컷인지. pickIn(c, m, needSrc) → 원본 in 프레임(움직임 큰 구간 고르기 — UI 가 준다). 없으면 지금 in 유지.
     규칙: 첫 클립 시작(at)은 그대로, 그 뒤 경계는 전부 비트 위. 원본이 모자라면 있는 만큼만 쓰고 다음 격자 비트로 넘어간다.
     자동 컷은 아니다 — 사용자가 고른 클립들의 길이만 박자에 맞춘다(헌법). 반환: { done, short } */
  function montage(clipIds, beatsAbs, opt) {
    opt = opt || {};
    const every = Math.max(1, opt.every | 0 || 1), minGap = Math.max(2, Math.round(FPS * 0.2));
    const clips = clipIds.map(id => clip(id)).filter(Boolean);
    if (!clips.length || !beatsAbs || beatsAbs.length < 2) return null;
    const beats = beatsAbs.slice().sort((a, b) => a - b);
    const at0 = clips[0].at;
    let i0 = 0; while (i0 < beats.length && beats[i0] < at0 - 1) i0++;
    if (i0 < beats.length && beats[i0] <= at0 + 1) i0 += every;                     // 시작이 비트 위면 그 비트가 격자 원점 → 첫 경계는 every 박 뒤
    else while (i0 < beats.length && beats[i0] < at0 + minGap) i0++;                 // 비트 사이에서 시작하면 다음 비트부터 격자
    if (i0 >= beats.length) return null;
    const grid = []; for (let i = i0; i < beats.length; i += every) grid.push(beats[i]);   // 격자(every 박마다)
    commit();
    let cur = at0, done = 0, short = 0;
    const nextBoundary = from => { for (const b of grid) if (b >= from + minGap) return b; return null; };
    for (const c of clips) {
      const target = nextBoundary(cur);
      if (target == null) break;
      const need = target - cur;                    // 타임라인 프레임
      const m = media(c.media);
      if (c.freeze) { c.dur = Math.max(1, need); }
      else {
        const isImg = m.kind === 'image';
        const needSrc = Math.max(1, Math.round(need * SPEED[c.speed].f * m.fps / FPS));
        const maxSrc = isImg ? IMAGE_MAX : m.dur;
        let nin = c.in;
        if (typeof opt.pickIn === 'function' && !isImg) { const v = opt.pickIn(c, m, needSrc); if (Number.isFinite(v)) nin = clamp(Math.round(v), 0, maxSrc - 1); }
        if (nin + needSrc > maxSrc) nin = Math.max(0, maxSrc - needSrc);
        c.in = nin; c.out = Math.min(maxSrc, nin + needSrc);
        const a = audioOf(c.id); if (a) a.linked = true;
        if (c.out - c.in < needSrc) short++;        // 원본이 모자람 — 격자는 유지, 다음 클립이 남은 자리를 채운다
      }
      relayout();
      cur = c.at + c.dur; done++;
    }
    relayout(); emit();
    return { done, short };
  }

  /* ---------- 저장/복구 ---------- */
  function toJSON() { return JSON.parse(snapshot()); }
  function load(json) {
    const b = blank();
    P = Object.assign(b, json || {});
    P.V = (P.V || []).filter(c => c.gap || media(c.media));   // 빈 자리(리프트)는 미디어가 없어도 산다
    P.A2 = (P.A2 || []).filter(a => media(a.media));
    P.V2 = (P.V2 || []).filter(o => media(o.media)).map(o => Object.assign({ pos: 'br', size: 'md', speed: 'normal' }, o));
    P.P = (P.P || []).map(x => Object.assign({ p: {} }, x));
    P.markers = (P.markers || []).map(x => Object.assign({ text: '', color: 'gold' }, x));
    if (!P.audio) P.audio = b.audio; if (!P.audio.ducking) P.audio.ducking = { on: true, depth: 12 };
    if (!P.audio.sfx) P.audio.sfx = { on: false, gain: 1 }; if (P.audio.sfx.gain == null) P.audio.sfx.gain = 1;
    if (!P.audio.ambience) P.audio.ambience = { on: false, src: null, gain: 1 }; if (P.audio.ambience.src && !media(P.audio.ambience.src.media)) P.audio.ambience.src = null; if (P.audio.ambience.gain == null) P.audio.ambience.gain = 1;
    relayout(); undoStack.length = 0; redoStack.length = 0; emit('load');
  }
  function reset() { P = blank(); undoStack.length = 0; redoStack.length = 0; emit('load'); }

  g.KMV_PROJECT = {
    FPS, W, H, SPEED, RAMP, IMAGE_DEFAULT, FREEZE_DEFAULT, rateAt,
    get data() { return P; },
    on: fn => listeners.push(fn),
    media, clip, clipIndex, audioOf, clipAt, total, edges, srcFrame, clipDur, speedMap,
    addMedia, removeMedia, addClip, removeClip, move, split, trim, trimToPlayhead, freeze, setSpeed, setRamp, setDenoise, setVol, audioTrim, relink,
    setLook, setProjectLook, setKenburns, setFade, setTransition, setTheme,
    addS, setS, addManyS, subtitle, updateS, removeS, clearS, subtitleAt,
    part, addP, updateP, removeP, clearP, partsAt, partDefault,
    a2, addA2, updateA2, trimA2, removeA2, setDucking, setSfx, a2At,
    v2, addV2, updateV2, trimV2, removeV2, v2At, V2_POS, V2_SIZE,
    setAmbience, montage,
    slip, roll, slide, lift, insertRange, removeClips, moveClips, pasteClips, copyClips, removeRanges, splitMany,
    marker, markerAt, addMarker, updateMarker, removeMarker, markerFrames,
    commit, undo, redo, canUndo: () => undoStack.length > 0, canRedo: () => redoStack.length > 0,
    toJSON, load, reset,
  };
})(typeof window !== 'undefined' ? window : globalThis);
