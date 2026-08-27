/* ============================================================
   케이무비 UI (kmovie.js) — 설계서 v1 §1·§2-1·§6
   ------------------------------------------------------------
   · 타임라인은 캔버스 하나에 5레인(P·S·V·A1·A2). 정적 층(클립·파형·썸네일)은
     오프스크린에 그려 두고 플레이헤드·드래그만 매 프레임 덧그린다.
   · 컷 도구: 클릭 선택 / 끌어서 순서 / 가장자리 끌어서 리플 트림(경계 프레임 미리보기)
     / Alt+소리띠 가장자리 = J/L 컷 / S 분할 / F 프리즈 / Q·W / Del / ↑↓ 편집점 / 스냅.
   · 저장: 프로젝트 JSON + 원본 blob → IndexedDB. 새로고침해도 그대로.
   ============================================================ */
(function () {
  'use strict';
  const P = window.KMV_PROJECT, M = window.KMV_MEDIA, A = window.KMV_AUDIO, R = window.KMV_RENDER;
  const FPS = P.FPS, PW = P.W, PH = P.H;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const GOLD = '#D9B65C';

  if (!M.supported()) { $('nosup').classList.remove('hidden'); return; }

  /* ---------- 상태 ---------- */
  let ph = 0, sel = null, playing = false, snap = true, playStart = 0;
  let pxf = 2, scrollF = 0;
  let drag = null, hover = null, dirty = true, previewJob = 0, rafId = 0;
  const binProg = {};

  /* ---------- 유틸 ---------- */
  const pad = n => (n < 10 ? '0' : '') + n;
  function tc(f) { f = Math.max(0, Math.round(f)); const s = Math.floor(f / FPS); return pad(Math.floor(s / 60)) + ':' + pad(s % 60) + ':' + pad(f % FPS); }
  function secStr(f) { const s = f / FPS; return (s >= 10 ? s.toFixed(1) : s.toFixed(2)) + '초'; }
  let toastT = 0;
  function toast(msg, ms) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms || 2600); }
  function status(s) { $('status').textContent = s || ''; }
  const OV = { show(title) { $('ovTitle').textContent = title; $('overlay').classList.remove('hidden'); this.set(0, ''); }, set(p, l) { $('ovBar').style.width = Math.round(p * 100) + '%'; $('ovPct').textContent = Math.round(p * 100) + '%'; $('ovLabel').textContent = l || ''; }, hide() { $('overlay').classList.add('hidden'); } };

  /* ---------- IndexedDB ---------- */
  const DB = {
    db: null,
    open() {
      return new Promise((res, rej) => {
        const r = indexedDB.open('kmovie', 1);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('media')) d.createObjectStore('media', { keyPath: 'id' }); if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); };
        r.onsuccess = () => { this.db = r.result; res(); }; r.onerror = () => rej(r.error);
      });
    },
    tx(store, mode, fn) { return new Promise((res, rej) => { if (!this.db) return res(null); const t = this.db.transaction(store, mode); const q = fn(t.objectStore(store)); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); },
    putMedia(id, blob, name) { return this.tx('media', 'readwrite', s => s.put({ id, blob, name })); },
    getMedia(id) { return this.tx('media', 'readonly', s => s.get(id)); },
    delMedia(id) { return this.tx('media', 'readwrite', s => s.delete(id)); },
    putKV(k, v) { return this.tx('kv', 'readwrite', s => s.put(v, k)); },
    getKV(k) { return this.tx('kv', 'readonly', s => s.get(k)); },
    clearAll() { return Promise.all([this.tx('media', 'readwrite', s => s.clear()), this.tx('kv', 'readwrite', s => s.clear())]); },
  };
  let saveT = 0;
  function scheduleSave() { clearTimeout(saveT); saveT = setTimeout(() => DB.putKV('project', P.toJSON()).catch(e => console.warn('save', e)), 400); }

  /* ---------- 미리보기 ---------- */
  const pv = $('preview'), pctx = pv.getContext('2d');
  function renderPreview() {
    const r = R.draw(pctx, PW, PH, ph);
    if (!r.exact && r.src) {
      const want = ph, job = ++previewJob;
      r.src.getFrame(r.idx, true).then(f => { if (f && job === previewJob && ph === want && !playing && !drag) renderPreview(); }).catch(() => {});
    }
    if (r.src && playing) r.src.prefetch(r.idx + 45);
    $('empty').classList.toggle('hidden', P.total() > 0);
  }
  function setPH(f, opts) {
    const tot = P.total();
    ph = clamp(Math.round(f), 0, Math.max(0, tot - 1));
    $('tcCur').textContent = tc(ph);
    if (!(opts && opts.noPreview)) renderPreview();
    if (!(opts && opts.noScroll)) ensureVisible(ph);
    draw();
  }

  /* ---------- 재생 (오디오 시계가 마스터) ---------- */
  function play() {
    const tot = P.total(); if (!tot || playing) return;
    if (ph >= tot - 1) ph = 0;
    playStart = ph; playing = true; $('tPlay').textContent = '❚❚ 정지';
    A.play(ph).then(() => { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(loop); });
  }
  function stop() {
    if (!playing) return;
    playing = false; A.stop(); cancelAnimationFrame(rafId);
    $('tPlay').textContent = '▶ 재생';
    setPH(ph);
  }
  function loop() {
    if (!playing) return;
    const now = A.now(); if (now == null) return;
    const f = Math.max(playStart, Math.floor(now)), tot = P.total();
    if (f >= tot) { ph = tot - 1; stop(); return; }
    if (f !== ph) { ph = Math.max(0, f); $('tcCur').textContent = tc(ph); renderPreview(); ensureVisible(ph); draw(); }
    rafId = requestAnimationFrame(loop);
  }
  function togglePlay() { playing ? stop() : play(); }

  /* ---------- 타임라인 캔버스 ---------- */
  const tl = $('timeline'), tctx = tl.getContext('2d');
  const sc = document.createElement('canvas'), sctx = sc.getContext('2d');
  let TW = 0, TH = 0, DPR = 1;
  const HEAD = 56, RULER = 24;
  const LANES = [{ k: 'P', h: 30, label: '부품', off: true }, { k: 'S', h: 30, label: '자막', off: true }, { k: 'V', h: 88, label: '영상' }, { k: 'A1', h: 52, label: '현장음' }, { k: 'A2', h: 30, label: '음악', off: true }];
  const LY = {}; { let y = RULER; LANES.forEach(l => { LY[l.k] = { y, h: l.h }; y += l.h; }); }
  const xOf = f => HEAD + (f - scrollF) * pxf;
  const frameOf = x => scrollF + (x - HEAD) / pxf;
  const MIN_PXF = 0.02, MAX_PXF = 40;

  function resize() {
    const r = tl.parentElement.getBoundingClientRect();
    const barH = tl.previousElementSibling.getBoundingClientRect().height;
    DPR = window.devicePixelRatio || 1;
    TW = Math.max(300, Math.floor(r.width)); TH = Math.max(120, Math.floor(r.height - barH));
    tl.style.height = TH + 'px'; tl.width = TW * DPR; tl.height = TH * DPR;
    sc.width = tl.width; sc.height = tl.height;
    dirty = true; draw();
  }
  new ResizeObserver(resize).observe(tl.parentElement);

  function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function tickStep() {
    const steps = [1, 2, 5, 10, 15, 30, 60, 150, 300, 600, 900, 1800, 3600, 9000, 18000];
    for (const s of steps) if (s * pxf >= 90) return s;
    return 36000;
  }

  function drawStatic() {
    const ctx = sctx; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#0f1524'; ctx.fillRect(0, 0, TW, TH);
    // 레인 바닥
    LANES.forEach(l => { const L = LY[l.k]; ctx.fillStyle = l.off ? '#111726' : (l.k === 'V' ? '#141c30' : '#12192b'); ctx.fillRect(HEAD, L.y, TW - HEAD, L.h); ctx.fillStyle = '#1e2740'; ctx.fillRect(HEAD, L.y + L.h - 1, TW - HEAD, 1); });
    // 눈금
    const step = tickStep(), sub = step / 5;
    const f0 = Math.max(0, Math.floor(frameOf(HEAD) / sub) * sub), f1 = frameOf(TW);
    ctx.font = '11px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
    for (let f = f0; f <= f1; f += sub) {
      const x = Math.round(xOf(f)) + 0.5; if (x < HEAD) continue;
      const major = Math.abs(f / step - Math.round(f / step)) < 1e-6;
      ctx.strokeStyle = major ? '#3a4a70' : '#232d48'; ctx.beginPath(); ctx.moveTo(x, major ? 10 : RULER - 6); ctx.lineTo(x, RULER); ctx.stroke();
      if (major) { ctx.fillStyle = '#8f9bb7'; ctx.fillText(tc(f), x + 4, 9); }
      if (major) { ctx.strokeStyle = 'rgba(58,74,112,.35)'; ctx.beginPath(); ctx.moveTo(x, RULER); ctx.lineTo(x, TH); ctx.stroke(); }
    }
    // 클립
    const D = P.data, V = LY.V, A1 = LY.A1;
    for (const c of D.V) { const x0 = xOf(c.at), x1 = xOf(c.at + c.dur); if (x1 < HEAD || x0 > TW) continue; drawClip(ctx, c, x0, x1, V.y + 4, V.h - 8, c.id === sel); }
    for (const a of D.A1) { const c = P.clip(a.clip); const x0 = xOf(a.at), x1 = xOf(a.at + a.dur); if (x1 < HEAD || x0 > TW) continue; drawAudio(ctx, a, c, x0, x1, A1.y + 4, A1.h - 8, a.clip === sel); }
    // 끝 표시
    const tot = P.total();
    if (tot) { const xe = Math.round(xOf(tot)) + 0.5; if (xe > HEAD && xe < TW) { ctx.strokeStyle = '#3a4a70'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xe, RULER); ctx.lineTo(xe, TH); ctx.stroke(); ctx.setLineDash([]); } }
    // 머리(레인 이름)
    ctx.fillStyle = '#0c111c'; ctx.fillRect(0, 0, HEAD, TH); ctx.fillStyle = '#1e2740'; ctx.fillRect(HEAD - 1, 0, 1, TH); ctx.fillRect(0, RULER - 1, HEAD, 1);
    ctx.textAlign = 'left';
    LANES.forEach(l => { const L = LY[l.k]; ctx.fillStyle = l.off ? '#3f4a66' : (l.k === 'V' ? GOLD : '#aab5cf'); ctx.font = (l.k === 'V' ? '700 ' : '600 ') + '11px Pretendard, sans-serif'; ctx.fillText(l.k, 8, L.y + L.h / 2 - (l.off ? 0 : 6)); if (!l.off) { ctx.fillStyle = '#5c6884'; ctx.font = '10px Pretendard, sans-serif'; ctx.fillText(l.label, 8, L.y + L.h / 2 + 7); } });
    dirty = false;
  }

  function drawClip(ctx, c, x0, x1, y, h, selected) {
    const m = P.media(c.media), src = M.get(c.media);
    const vx0 = Math.max(x0, HEAD), vx1 = Math.min(x1, TW); if (vx1 - vx0 < 1) return;
    const w = x1 - x0, band = 16, fy = y + band, fh = h - band;
    ctx.save(); rr(ctx, x0, y, w, h, 5); ctx.clip();
    ctx.fillStyle = selected ? '#24395f' : '#1a2a4c'; ctx.fillRect(x0, y, w, h);
    if (src && src.thumbs && src.thumbs.length) {
      const tw = Math.max(6, fh * 16 / 9);
      const k0 = Math.max(0, Math.floor((vx0 - x0) / tw));
      for (let k = k0; ; k++) {
        const tx = x0 + k * tw; if (tx >= vx1) break;
        const t = clamp(c.at + (tx - x0) / pxf, c.at, c.at + c.dur - 1);
        const sf = P.srcFrame(c, t);
        const th = src.thumbs[Math.floor(sf / src.thumbEvery)] || src.thumbs[0];
        if (th) { try { ctx.drawImage(th, tx, fy, tw, fh); } catch (e) {} }
      }
      if (c.freeze) { ctx.fillStyle = 'rgba(217,182,92,.12)'; ctx.fillRect(x0, fy, w, fh); }
    } else if (src && src.kind === 'video' && !src.analyzed) {
      ctx.fillStyle = '#5c6884'; ctx.font = '11px Pretendard, sans-serif'; ctx.fillText('분석 중…', vx0 + 8, fy + fh / 2 + 4);
    }
    // 액션 컷 도우미: 모션량 그래프 (자동 컷 없음 — 눈으로 자르는 자리 찾기)
    if (src && src.motion && !c.freeze && m.kind === 'video' && w > 30) {
      const gh = fh * 0.5, base = y + h - 2;
      ctx.beginPath(); ctx.moveTo(vx0, base);
      for (let px = vx0; px <= vx1; px += 2) { const t = clamp(c.at + (px - x0) / pxf, c.at, c.at + c.dur - 1); const v = src.motion[P.srcFrame(c, t)] || 0; ctx.lineTo(px, base - v * gh); }
      ctx.lineTo(vx1, base); ctx.closePath();
      ctx.fillStyle = 'rgba(217,182,92,.16)'; ctx.fill();
      ctx.beginPath();
      for (let px = vx0; px <= vx1; px += 2) { const t = clamp(c.at + (px - x0) / pxf, c.at, c.at + c.dur - 1); const v = src.motion[P.srcFrame(c, t)] || 0; px === vx0 ? ctx.moveTo(px, base - v * gh) : ctx.lineTo(px, base - v * gh); }
      ctx.strokeStyle = 'rgba(217,182,92,.7)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // 이름 띠
    ctx.fillStyle = 'rgba(8,14,30,.78)'; ctx.fillRect(x0, y, w, band);
    const sp = P.SPEED[c.speed];
    let label = (c.freeze ? '❚❚ 정지 · ' : m.kind === 'image' ? '사진 · ' : '') + m.name;
    if (sp.badge) label = sp.badge + ' · ' + label;
    ctx.fillStyle = selected ? GOLD : '#dfe6f3'; ctx.font = (c.freeze || sp.badge ? '700 ' : '600 ') + '11px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText(label, vx0 + 6, y + band / 2 + 0.5, Math.max(10, vx1 - vx0 - 10));
    ctx.restore();
    rr(ctx, x0 + 0.5, y + 0.5, w - 1, h - 1, 5); ctx.strokeStyle = selected ? GOLD : '#3b5185'; ctx.lineWidth = selected ? 2 : 1; ctx.stroke();
  }

  function drawAudio(ctx, a, c, x0, x1, y, h, selected) {
    const m = P.media(c.media), src = M.get(c.media);
    const vx0 = Math.max(x0, HEAD), vx1 = Math.min(x1, TW); if (vx1 - vx0 < 1) return;
    const w = x1 - x0;
    ctx.save(); rr(ctx, x0, y, w, h, 4); ctx.clip();
    ctx.fillStyle = selected ? '#214135' : '#1b352c'; ctx.fillRect(x0, y, w, h);
    if (src && src.peaks) {
      const vol = a.vol == null ? 1 : a.vol, mid = y + h / 2, amp = (h - 6) / 2;
      ctx.fillStyle = a.linked ? '#7fcfa4' : '#dcc07a';
      for (let px = vx0; px < vx1; px += 2) {
        const f = a.at + (px - x0) / pxf;
        const sf = a.linked ? P.srcFrame(c, clamp(f, c.at, c.at + c.dur - 1)) : clamp(a.in + Math.floor((f - a.at) * m.fps / FPS), 0, m.dur - 1);
        const v = Math.min(1, (src.peaks[sf] || 0) * 4 * vol);
        const bh = Math.max(1, v * amp);
        ctx.fillRect(px, mid - bh, 1.5, bh * 2);
      }
    }
    if (!a.linked || (a.vol != null && a.vol !== 1)) {
      ctx.fillStyle = 'rgba(8,14,30,.7)'; ctx.fillRect(vx0, y, 70, 14);
      ctx.fillStyle = a.linked ? '#cfe8da' : GOLD; ctx.font = '600 10px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
      ctx.fillText((a.linked ? '' : 'J/L · ') + Math.round((a.vol == null ? 1 : a.vol) * 100) + '%', vx0 + 5, y + 7.5);
    }
    ctx.restore();
    rr(ctx, x0 + 0.5, y + 0.5, w - 1, h - 1, 4); ctx.strokeStyle = selected ? GOLD : (a.linked ? '#2f5a48' : GOLD); ctx.lineWidth = selected ? 2 : 1;
    if (!a.linked) ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
  }

  function draw() {
    if (!TW) return;
    if (dirty) drawStatic();
    const ctx = tctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(sc, 0, 0); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // 드래그 안내
    if (drag && drag.type === 'move' && drag.moved) {
      const ins = drag.insert, D = P.data;
      const xi = ins < D.V.length ? xOf(D.V[ins].at) : xOf(P.total());
      ctx.fillStyle = GOLD; ctx.fillRect(Math.round(xi) - 1.5, LY.V.y, 3, LY.V.h);
      const c = drag.clip, gw = c.dur * pxf; ctx.globalAlpha = .35; ctx.fillStyle = '#6f8fd0'; rr(ctx, drag.x - drag.grab, LY.V.y + 4, Math.max(8, gw), LY.V.h - 8, 5); ctx.fill(); ctx.globalAlpha = 1;
    }
    // 호버 트림 손잡이
    const hv = (drag && (drag.type === 'trim' || drag.type === 'atrim')) ? { kind: drag.type === 'trim' ? 'V' : 'A1', clip: drag.clip, edge: drag.side } : hover;
    if (hv && hv.edge && (hv.kind === 'V' || hv.kind === 'A1')) {
      const L = LY[hv.kind]; let x0, x1;
      if (hv.kind === 'V') { x0 = xOf(hv.clip.at); x1 = xOf(hv.clip.at + hv.clip.dur); } else { const a = P.audioOf(hv.clip.id); if (!a) x0 = x1 = -99; else { x0 = xOf(a.at); x1 = xOf(a.at + a.dur); } }
      const x = hv.edge === 'in' ? x0 : x1 - 6;
      ctx.fillStyle = GOLD; rr(ctx, x, L.y + 4, 6, L.h - 8, 2); ctx.fill();
      ctx.fillStyle = '#1a1408'; ctx.fillRect(x + 2.5, L.y + L.h / 2 - 6, 1, 12);
    }
    // 스냅 표시
    if (drag && drag.snapX != null) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(Math.round(drag.snapX) + .5, RULER); ctx.lineTo(Math.round(drag.snapX) + .5, TH); ctx.stroke(); ctx.setLineDash([]); }
    // 플레이헤드
    const x = Math.round(xOf(ph)) + 0.5;
    if (x >= HEAD && x <= TW) {
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TH); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(x - 6, 2); ctx.lineTo(x + 6, 2); ctx.lineTo(x + 6, 9); ctx.lineTo(x, 15); ctx.lineTo(x - 6, 9); ctx.closePath(); ctx.fill();
    }
  }

  function ensureVisible(f) {
    const x = xOf(f), vw = TW - HEAD;
    const before = scrollF;
    if (x > TW - 16) scrollF = f - vw * 0.12 / pxf;
    else if (x < HEAD) scrollF = Math.max(0, f - vw * 0.88 / pxf);
    scrollF = Math.max(0, scrollF); if (scrollF !== before) dirty = true;
  }
  function clampScroll() { const tot = P.total(); scrollF = clamp(scrollF, 0, Math.max(0, tot - (TW - HEAD) * 0.5 / pxf)); }
  function setZoom(np, anchorX) {
    np = clamp(np, MIN_PXF, MAX_PXF);
    const ax = anchorX == null ? clamp(xOf(ph), HEAD, TW) : anchorX, fa = frameOf(ax);
    pxf = np; scrollF = fa - (ax - HEAD) / pxf;
    clampScroll(); dirty = true; $('zoom').value = Math.round(1000 * Math.log(pxf / MIN_PXF) / Math.log(MAX_PXF / MIN_PXF)); draw();
  }
  function zoomFit() { const tot = Math.max(P.total(), FPS * 5); setZoom((TW - HEAD - 24) / tot, HEAD); scrollF = 0; dirty = true; draw(); }

  /* ---------- 히트 테스트 ---------- */
  function laneAt(y) { for (const l of LANES) { const L = LY[l.k]; if (y >= L.y && y < L.y + L.h) return l.k; } return null; }
  function hitTest(x, y) {
    if (y < RULER) return { kind: 'ruler' };
    const lane = laneAt(y);
    if (lane === 'V') for (const c of P.data.V) { const x0 = xOf(c.at), x1 = xOf(c.at + c.dur); if (x >= x0 && x < x1) { const ez = Math.min(9, (x1 - x0) / 3); return { kind: 'V', clip: c, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } }
    if (lane === 'A1') for (const a of P.data.A1) { const x0 = xOf(a.at), x1 = xOf(a.at + a.dur); if (x >= x0 && x < x1) { const ez = Math.min(9, (x1 - x0) / 3); return { kind: 'A1', clip: P.clip(a.clip), a, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } }
    return { kind: 'lane', lane };
  }
  function pos(e) { const r = tl.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  /* 스냅: 타임라인 프레임 f 를 후보(플레이헤드·편집점)에 7px 안이면 붙인다 */
  function snapFrame(f, extra) {
    if (!snap) return { f, x: null };
    const cands = [ph].concat(P.edges()).concat(extra || []);
    let best = f, bd = 7 / pxf, sx = null;
    for (const c of cands) { const d = Math.abs(c - f); if (d < bd) { bd = d; best = c; sx = xOf(c); } }
    return { f: best, x: sx };
  }

  /* ---------- 마우스 ---------- */
  tl.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    const { x, y } = pos(e); if (x < HEAD) return;
    stop();
    const h = hitTest(x, y);
    if (h.kind === 'ruler' || h.kind === 'lane') { if (h.kind === 'lane') select(null); drag = { type: 'scrub' }; setPH(frameOf(x), { noScroll: true }); return; }
    select(h.clip.id);
    if (h.edge) {
      const a = h.kind === 'A1' ? h.a : null;
      const audioOnly = h.kind === 'A1' && (e.altKey || !a.linked) && h.clip.speed === 'normal' && !h.clip.freeze;
      P.commit();
      if (audioOnly) drag = { type: 'atrim', clip: h.clip, side: h.edge, x0: x, orig: { in: a.in, out: a.out } };
      else drag = { type: 'trim', clip: h.clip, side: h.edge, x0: x, orig: { in: h.clip.in, out: h.clip.out, dur: h.clip.dur } };
      previewJob++;
      return;
    }
    drag = { type: 'move', clip: h.clip, x0: x, x, grab: x - xOf(h.clip.at), moved: false, insert: P.clipIndex(h.clip.id) };
  });
  window.addEventListener('mousemove', e => {
    const { x, y } = pos(e);
    if (!drag) {
      const h = hitTest(x, y);
      const prevEdge = hover && hover.edge, prevClip = hover && hover.clip && hover.clip.id;
      hover = (h.kind === 'V' || h.kind === 'A1') ? h : null;
      tl.style.cursor = hover && hover.edge ? 'ew-resize' : hover ? 'grab' : (x >= HEAD ? 'text' : 'default');
      if (x >= HEAD && y >= 0 && y <= TH) $('hover').textContent = tc(Math.max(0, frameOf(x))) + (hover ? ' · ' + P.media(hover.clip.media).name : ''); else $('hover').textContent = '';
      if ((hover && hover.edge) !== prevEdge || (hover && hover.clip.id) !== prevClip) draw();
      return;
    }
    if (drag.type === 'scrub') { setPH(frameOf(x), { noScroll: true }); return; }
    const c = drag.clip, m = P.media(c.media);
    if (drag.type === 'move') {
      drag.x = x; if (!drag.moved && Math.abs(x - drag.x0) < 5) return;
      drag.moved = true; tl.style.cursor = 'grabbing';
      let ins = 0; for (const o of P.data.V) { if (xOf(o.at + o.dur / 2) < x) ins++; }
      drag.insert = ins; draw(); return;
    }
    const dtl = (x - drag.x0) / pxf;                         // 타임라인 프레임 변화량
    if (drag.type === 'trim') {
      if (c.freeze) {
        const nd = drag.side === 'in' ? drag.orig.dur - dtl : drag.orig.dur + dtl;
        P.trim(c.id, drag.side, Math.max(1, Math.round(nd)), { commit: false });
      } else {
        const k = m.fps / FPS * P.SPEED[c.speed].f;         // 타임라인 1프레임 = 원본 k 프레임
        let v = (drag.side === 'in' ? drag.orig.in : drag.orig.out) + dtl * k;
        drag.snapX = null;
        if (snap && drag.side === 'out' && ph > c.at && ph < c.at + c.dur) {   // out 점을 플레이헤드에 스냅 (W 와 같은 결과)
          const cand = P.srcFrame(c, ph);
          if (Math.abs(v - cand) / k * pxf < 7) { v = cand; drag.snapX = xOf(ph); }
        }
        P.trim(c.id, drag.side, v, { commit: false });
        const idx = drag.side === 'in' ? c.in : c.out - 1;   // 경계 프레임 미리보기 (프리미어처럼)
        R.drawSource(pctx, PW, PH, c.media, idx);
      }
      return;
    }
    if (drag.type === 'atrim') {
      const a = P.audioOf(c.id); if (!a) return;
      const k = m.fps / FPS;
      let v = (drag.side === 'in' ? drag.orig.in : drag.orig.out) + dtl * k;
      // 스냅: 이 소리 띠 가장자리의 타임라인 위치를 플레이헤드·편집점에
      const tlPos = c.at + (v - c.in) / k;
      const sn = snapFrame(tlPos); drag.snapX = sn.x;
      if (sn.x != null) v = c.in + (sn.f - c.at) * k;
      P.audioTrim(c.id, drag.side, v, { commit: false });
    }
  });
  window.addEventListener('mouseup', () => {
    if (!drag) return;
    const d = drag; drag = null; tl.style.cursor = 'default';
    if (d.type === 'move' && d.moved) P.move(d.clip.id, d.insert);
    if (d.type === 'trim' || d.type === 'atrim') { dirty = true; setPH(ph); }
    draw();
  });
  tl.addEventListener('mouseleave', () => { if (!drag) { hover = null; $('hover').textContent = ''; draw(); } });
  tl.addEventListener('wheel', e => {
    e.preventDefault(); const { x } = pos(e);
    if (e.ctrlKey || e.metaKey) setZoom(pxf * (e.deltaY < 0 ? 1.18 : 1 / 1.18), x);
    else { scrollF += (e.deltaX || e.deltaY) / pxf * 0.8; clampScroll(); dirty = true; draw(); }
  }, { passive: false });
  tl.addEventListener('dblclick', e => { const { x, y } = pos(e); const h = hitTest(x, y); if (h.kind === 'V' || h.kind === 'A1') { setPH(h.clip.at); } });

  /* ---------- 선택·편집 동작 ---------- */
  function select(id) { if (sel === id) return; sel = id; dirty = true; draw(); refreshPanel(); }
  function selClip() { return sel ? P.clip(sel) : null; }
  function doSplit() { stop(); const c2 = P.split(ph); if (c2) select(c2.id); else toast('여기선 나눌 게 없어요 — 플레이헤드를 클립 안쪽으로'); }
  function doDelete() { stop(); const c = selClip() || P.clipAt(ph); if (!c) return; P.removeClip(c.id); select(null); setPH(ph); }
  function doFreeze() { stop(); const fz = P.freeze(ph); if (fz) { select(fz.id); toast('프리즈 프레임 ' + secStr(fz.dur) + ' — 오른쪽 패널에서 길이 조절'); } else toast('영상 클립 위에 플레이헤드를 두고 F'); }
  function jumpEdge(dir) { const e = P.edges(); if (dir > 0) { const n = e.find(v => v > ph); setPH(n == null ? P.total() - 1 : Math.min(n, P.total() - 1)); } else { const prev = e.filter(v => v < ph); setPH(prev.length ? prev[prev.length - 1] : 0); } }

  window.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const k = e.key, ctrl = e.ctrlKey || e.metaKey;
    if (k === ' ') { e.preventDefault(); togglePlay(); return; }
    if (ctrl && (k === 'z' || k === 'Z')) { e.preventDefault(); stop(); if (e.shiftKey ? P.redo() : P.undo()) setPH(ph); return; }
    if (ctrl && (k === 'y' || k === 'Y')) { e.preventDefault(); stop(); if (P.redo()) setPH(ph); return; }
    if (ctrl) return;
    switch (k) {
      case 's': case 'S': case 'ㄴ': e.preventDefault(); doSplit(); break;
      case 'f': case 'F': case 'ㄹ': e.preventDefault(); doFreeze(); break;
      case 'q': case 'Q': case 'ㅂ': e.preventDefault(); stop(); P.trimToPlayhead(ph, 'in'); setPH(ph); break;
      case 'w': case 'W': case 'ㅈ': e.preventDefault(); stop(); P.trimToPlayhead(ph, 'out'); setPH(ph); break;
      case 'n': case 'N': case 'ㅜ': toggleSnap(); break;
      case 'Delete': case 'Backspace': e.preventDefault(); doDelete(); break;
      case 'ArrowLeft': e.preventDefault(); stop(); setPH(ph - (e.shiftKey ? 10 : 1)); break;
      case 'ArrowRight': e.preventDefault(); stop(); setPH(ph + (e.shiftKey ? 10 : 1)); break;
      case 'ArrowUp': e.preventDefault(); stop(); jumpEdge(-1); break;
      case 'ArrowDown': e.preventDefault(); stop(); jumpEdge(1); break;
      case 'Home': e.preventDefault(); stop(); setPH(0); break;
      case 'End': e.preventDefault(); stop(); setPH(P.total() - 1); break;
      case '=': case '+': setZoom(pxf * 1.3); break;
      case '-': case '_': setZoom(pxf / 1.3); break;
      case '\\': zoomFit(); break;
      case 'Escape': select(null); break;
    }
  });
  // 버튼·슬라이더에 포커스가 남으면 Space·화살표가 거기로 가므로 놓는 즉시 풀어 준다
  document.addEventListener('mouseup', () => { const a = document.activeElement; if (a && (a.tagName === 'BUTTON' || a.type === 'range')) a.blur(); });
  function toggleSnap() { snap = !snap; $('btnSnap').classList.toggle('on', snap); toast(snap ? '스냅 켬' : '스냅 끔', 1200); }

  /* ---------- 트랜스포트·상단 버튼 ---------- */
  $('tPlay').onclick = togglePlay;
  $('tStart').onclick = () => { stop(); setPH(0); };
  $('tEnd').onclick = () => { stop(); setPH(P.total() - 1); };
  $('tPrev').onclick = () => { stop(); setPH(ph - 1); };
  $('tNext').onclick = () => { stop(); setPH(ph + 1); };
  $('tPrevEdit').onclick = () => { stop(); jumpEdge(-1); };
  $('tNextEdit').onclick = () => { stop(); jumpEdge(1); };
  $('btnUndo').onclick = () => { stop(); if (P.undo()) setPH(ph); };
  $('btnRedo').onclick = () => { stop(); if (P.redo()) setPH(ph); };
  $('btnSnap').onclick = toggleSnap;
  $('btnImport').onclick = $('btnImport2').onclick = () => $('fileIn').click();
  $('fileIn').onchange = e => { importFiles(Array.from(e.target.files)); e.target.value = ''; };
  $('btnNew').onclick = async () => { if (!confirm('타임라인과 미디어를 모두 비울까요? (되돌릴 수 없어요)')) return; stop(); P.data.media.forEach(m => M.remove(m.id)); P.reset(); await DB.clearAll(); select(null); setPH(0); refreshBin(); zoomFit(); };
  $('btnExport').onclick = async () => {
    stop();
    if (!P.total()) return toast('타임라인이 비어 있어요');
    const analyzing = P.data.media.some(m => { const s = M.get(m.id); return s && s.kind === 'video' && !s.analyzed; });
    if (analyzing) toast('분석이 끝나기 전에도 내보낼 수 있어요 — 결과물은 같아요', 3000);
    OV.show('MP4 내보내는 중');
    try {
      const r = await window.KMV_EXPORT.exportMP4({ onProgress: (p, l) => OV.set(p, l) });
      if (r) toast('저장 완료 · ' + Math.round(r.seconds) + '초 · 1920×1080' + (r.toDisk ? ' · ' + r.name : '') + (/^avc/.test(r.codec) ? '' : ' · 이 브라우저엔 H.264 인코더가 없어 VP9 로 저장했어요'), 6000);
    } catch (e) { console.error(e); toast('내보내기 실패: ' + (e.message || e), 5000); }
    OV.hide();
  };
  $('zoom').oninput = e => { const v = +e.target.value / 1000; pxf = MIN_PXF * Math.pow(MAX_PXF / MIN_PXF, v); clampScroll(); dirty = true; draw(); };
  $('zoomIn').onclick = () => setZoom(pxf * 1.3); $('zoomOut').onclick = () => setZoom(pxf / 1.3); $('zoomFit').onclick = zoomFit;

  /* ---------- 우측 패널: 클립 ---------- */
  const speedSeg = $('speedSeg');
  Object.keys(P.SPEED).forEach(k => { const b = document.createElement('button'); b.textContent = P.SPEED[k].label; b.dataset.k = k; b.onclick = () => { const c = selClip(); if (c) { stop(); P.setSpeed(c.id, k); } }; speedSeg.appendChild(b); });
  let volStart = null;
  $('vol').oninput = e => { const c = selClip(); if (!c) return; const a = P.audioOf(c.id); if (a) { if (volStart == null) volStart = a.vol == null ? 1 : a.vol; a.vol = +e.target.value / 100; $('volV').textContent = e.target.value + '%'; dirty = true; draw(); } };
  $('vol').onchange = e => { const c = selClip(); if (!c) return; const a = P.audioOf(c.id); if (a) { const v = +e.target.value / 100; a.vol = volStart == null ? 1 : volStart; volStart = null; P.setVol(c.id, v); } };
  $('freezeSec').onchange = e => { const c = selClip(); if (c && c.freeze) { stop(); P.trim(c.id, 'out', Math.round(clamp(+e.target.value, 0.5, 60) * FPS)); setPH(ph); } };
  $('btnRelink').onclick = () => { const c = selClip(); if (c) { stop(); P.relink(c.id); } };
  $('btnFreeze').onclick = doFreeze; $('btnSplit').onclick = doSplit; $('btnDel').onclick = doDelete;

  function refreshPanel() {
    const c = selClip();
    $('clipNone').classList.toggle('hidden', !!c); $('clipBody').classList.toggle('hidden', !c);
    $('btnUndo').disabled = !P.canUndo(); $('btnRedo').disabled = !P.canRedo();
    if (!c) return;
    const m = P.media(c.media), a = P.audioOf(c.id);
    $('cName').textContent = m.name; $('cName').title = m.name;
    $('cRange').textContent = c.freeze ? '원본 ' + tc(Math.round(c.in * FPS / m.fps)) + ' 정지' : tc(Math.round(c.in * FPS / m.fps)) + ' → ' + tc(Math.round(c.out * FPS / m.fps));
    $('cDur').textContent = secStr(c.dur) + ' · ' + tc(c.at) + ' 부터';
    $('rowSpeed').classList.toggle('hidden', c.freeze || m.kind === 'image');
    Array.from(speedSeg.children).forEach(b => b.classList.toggle('on', b.dataset.k === c.speed));
    $('rowFreeze').classList.toggle('hidden', !c.freeze); if (c.freeze) $('freezeSec').value = (c.dur / FPS).toFixed(1);
    $('rowVol').classList.toggle('hidden', !a); if (a) { $('vol').value = Math.round((a.vol == null ? 1 : a.vol) * 100); $('volV').textContent = $('vol').value + '%'; }
    $('rowLink').classList.toggle('hidden', !a || a.linked);
    if (a && !a.linked) $('linkState').textContent = 'J/L 컷 (' + (a.in < c.in ? '소리 먼저' : '') + (a.out > c.out ? (a.in < c.in ? '·' : '') + '소리 나중' : '') + ')';
    $('btnFreeze').disabled = c.freeze || m.kind === 'image';
  }
  function refreshProject() { $('pTot').textContent = secStr(P.total()); $('pCnt').textContent = P.data.V.length; $('tcTot').textContent = tc(P.total()); }

  /* ---------- 우측 패널: 미디어 ---------- */
  function refreshBin() {
    const bin = $('bin'); bin.innerHTML = '';
    if (!P.data.media.length) { bin.innerHTML = '<div class="bin-empty">아직 없어요.<br>영상·사진을 끌어다 놓으면 타임라인 끝에 붙어요.</div>'; return; }
    P.data.media.forEach(m => {
      const src = M.get(m.id);
      const el = document.createElement('div'); el.className = 'mi'; el.title = '클릭: 타임라인 끝에 추가';
      const th = src && src.thumbs && src.thumbs[0];
      if (th) { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 72; cv.getContext('2d').drawImage(th, 0, 0, 128, 72); el.appendChild(cv); }
      else { const ph2 = document.createElement('div'); ph2.className = 'ph'; ph2.textContent = m.kind === 'image' ? '사진' : '…'; el.appendChild(ph2); }
      const nm = document.createElement('div'); nm.className = 'nm';
      const used = P.data.V.filter(c => c.media === m.id).length;
      nm.innerHTML = '<b></b><span></span>';
      nm.querySelector('b').textContent = m.name;
      nm.querySelector('span').textContent = (m.kind === 'image' ? m.w + '×' + m.h : Math.round(m.dur / m.fps) + '초 · ' + m.w + '×' + m.h + ' ' + m.fps + 'fps' + (m.audio ? '' : ' · 무음')) + (used ? ' · 사용 ' + used : '');
      if (src && src.kind === 'video' && !src.analyzed) { const bar = document.createElement('div'); bar.className = 'bar'; bar.innerHTML = '<i></i>'; bar.querySelector('i').style.width = Math.round((binProg[m.id] || 0) * 100) + '%'; bar.dataset.id = m.id; nm.appendChild(bar); }
      el.appendChild(nm);
      const x = document.createElement('span'); x.className = 'x'; x.textContent = '✕'; x.title = '미디어 제거 (타임라인에서도 빠져요)';
      x.onclick = ev => { ev.stopPropagation(); if (!confirm('"' + m.name + '" 을 지울까요? 타임라인의 클립도 함께 빠져요.')) return; stop(); P.removeMedia(m.id); M.remove(m.id); DB.delMedia(m.id); if (sel && !P.clip(sel)) select(null); setPH(ph); refreshBin(); };
      el.appendChild(x);
      el.onclick = () => { stop(); const c = P.addClip(m.id); select(c.id); setPH(c.at); toast(m.name + ' 을 끝에 붙였어요', 1500); };
      bin.appendChild(el);
    });
  }
  let thumbTick = 0;
  function analyzeBg(id) {
    M.analyze(id, p => {
      binProg[id] = p;
      const bar = document.querySelector('#bin .bar[data-id="' + id + '"] i'); if (bar) bar.style.width = Math.round(p * 100) + '%';
      const now = performance.now();
      if (p >= 1 || now - thumbTick > 700) { thumbTick = now; dirty = true; draw(); if (p >= 1) { refreshBin(); refreshStatus(); } }
    }).catch(e => console.warn('analyze', e));
  }
  function refreshStatus() {
    const n = P.data.media.filter(m => { const s = M.get(m.id); return s && s.kind === 'video' && !s.analyzed; }).length;
    status(n ? '썸네일·모션·파형 분석 중 ' + n + '개' : '');
  }

  /* ---------- 가져오기 ---------- */
  let importing = false;
  async function importFiles(files) {
    files = files.filter(f => /^(video|image)\//.test(f.type) || /\.(mp4|mov|m4v|png|jpe?g|webp)$/i.test(f.name));
    if (!files.length) return toast('mp4·mov 영상이나 jpg·png 사진만 넣을 수 있어요');
    if (importing) return toast('앞의 파일을 아직 읽는 중이에요');
    importing = true; stop();
    const first = !P.total();
    for (const f of files) {
      status('가져오는 중: ' + f.name);
      try {
        const meta = await M.open(f, null, s => status(s + ' — ' + f.name));
        P.addMedia(meta);
        DB.putMedia(meta.id, f, f.name).catch(e => console.warn('db', e));
        const c = P.addClip(meta.id);
        refreshBin(); analyzeBg(meta.id); refreshStatus();
        if (files.length === 1) { select(c.id); setPH(c.at); }
      } catch (e) { console.error(e); toast(f.name + ' — ' + (e.message || e), 5000); }
    }
    status(''); refreshStatus(); importing = false;
    if (first) zoomFit(); else { dirty = true; draw(); }
    setPH(ph);
  }
  document.addEventListener('dragover', e => { e.preventDefault(); document.body.classList.add('dragover'); });
  document.addEventListener('dragleave', e => { if (!e.relatedTarget) document.body.classList.remove('dragover'); });
  document.addEventListener('drop', e => { e.preventDefault(); document.body.classList.remove('dragover'); if (e.dataTransfer && e.dataTransfer.files.length) importFiles(Array.from(e.dataTransfer.files)); });

  /* ---------- 프로젝트 변경 반응 ---------- */
  P.on(kind => {
    dirty = true;
    if (sel && !P.clip(sel)) sel = null;
    refreshPanel(); refreshProject();
    scheduleSave(); if (!drag) refreshBin();
    if (!drag) { const tot = P.total(); if (ph > Math.max(0, tot - 1)) ph = Math.max(0, tot - 1); }
    draw();
  });

  /* ---------- 복구 ---------- */
  async function restore() {
    try { await DB.open(); } catch (e) { console.warn('idb', e); }
    let json = null; try { json = await DB.getKV('project'); } catch (e) {}
    if (!json || !json.media || !json.media.length) return;
    OV.show('지난 작업 불러오는 중');
    const ok = [];
    for (let i = 0; i < json.media.length; i++) {
      const m = json.media[i]; OV.set(i / json.media.length, m.name);
      try { const rec = await DB.getMedia(m.blobKey || m.id); if (!rec) continue; const meta = await M.open(rec.blob, m.id, s => OV.set(i / json.media.length, s + ' — ' + m.name)); ok.push(meta); }
      catch (e) { console.warn('restore', m.name, e); }
    }
    const wanted = json.media.length; json.media = ok;
    P.load(json);
    ok.forEach(m => analyzeBg(m.id));
    refreshBin(); refreshStatus();
    OV.hide();
    if (ok.length < wanted) toast('일부 원본을 다시 찾지 못해 빠졌어요');
  }

  window.KMV_UI = { importFiles, setPH: f => setPH(f), get ph() { return ph; }, select, play, stop, zoomFit, get pxf() { return pxf; }, get scrollF() { return scrollF; } };

  /* ---------- 시작 ---------- */
  resize();
  refreshBin(); refreshPanel(); refreshProject();
  $('zoom').value = Math.round(1000 * Math.log(pxf / MIN_PXF) / Math.log(MAX_PXF / MIN_PXF));
  restore().then(() => { zoomFit(); setPH(0); });
})();
