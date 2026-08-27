/* ============================================================
   케이무비 UI (kmovie.js) — 설계서 v1 §1·§2-1·§6
   ------------------------------------------------------------
   · 타임라인은 캔버스 하나에 5레인(P·S·V·A1·A2). 정적 층(클립·파형·썸네일)은
     오프스크린에 그려 두고 플레이헤드·드래그만 매 프레임 덧그린다.
   · 컷 도구: 클릭 선택 / 끌어서 순서 / 가장자리 끌어서 리플 트림(경계 프레임 미리보기)
     / Alt+소리띠 가장자리 = J/L 컷 / S 분할 / F 프리즈 / Q·W / Del / ↑↓ 편집점 / 스냅.
   · 4단계: 부품 P 레인(목록에서 끌어 놓기·필드 편집·홀드 늘이기·인물 뒤 컷아웃) · 음악 A2 레인
     (페이드·덕킹·비트 마커 스냅). 카드(S·P·A2)는 같은 손맛 — 끌어 이동·가장자리 트림·스냅·Del.
   · 저장: 프로젝트 JSON + 원본 blob → IndexedDB. 새로고침해도 그대로.
   ============================================================ */
(function () {
  'use strict';
  const P = window.KMV_PROJECT, M = window.KMV_MEDIA, A = window.KMV_AUDIO, R = window.KMV_RENDER, LK = window.KMV_LOOK, TR = window.KMV_TRANSITION, SB = window.KMV_SUBTITLE, PT = window.KMV_PARTS, SG = window.KMV_SEG;
  const FPS = P.FPS, PW = P.W, PH = P.H;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const GOLD = '#D9B65C';

  if (!M.supported()) { $('nosup').classList.remove('hidden'); return; }

  /* ---------- 상태 ---------- */
  let ph = 0, sel = null, selS = null, selP = null, selA2 = null, playing = false, snap = true, beatSnap = true, playStart = 0;
  let pxf = 2, scrollF = 0;
  let drag = null, hover = null, dirty = true, previewJob = 0, rafId = 0;
  let partDrag = null;                       // 부품 목록에서 끌어오는 중 {part, dur, x, y, moved, overTL, f}
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
  let segToast = 0;
  function renderPreview() {
    const r = R.draw(pctx, PW, PH, ph);
    if (!r.exact && r.src) {
      const want = ph, job = ++previewJob;
      if (r.segPending && !playing) {
        if (SG && SG.status() !== 'ready' && !segToast) { segToast = 1; toast('인물 컷아웃 모델을 처음 한 번 불러와요 (12MB)', 3500); }
        r.src.getFrame(r.idx, true).then(f => f && SG.mask(r.media, r.idx, f)).then(() => { if (job === previewJob && ph === want && !playing && !drag) renderPreview(); }).catch(() => {});
      } else r.src.getFrame(r.idx, true).then(f => { if (f && job === previewJob && ph === want && !playing && !drag) renderPreview(); }).catch(() => {});
    }
    if (r.src && playing) r.src.prefetch(r.idx + 45);
    $('empty').classList.toggle('hidden', P.total() > 0 || P.data.P.length > 0);
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
  const LANES = [{ k: 'P', h: 30, label: '부품' }, { k: 'S', h: 30, label: '자막' }, { k: 'V', h: 88, label: '영상' }, { k: 'A1', h: 48, label: '현장음' }, { k: 'A2', h: 36, label: '음악' }];
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
    // 전환 표시 (클립 시작에 작은 겹침 표)
    for (const c of D.V) if (c.transIn) { const x0 = xOf(c.at), w = Math.max(6, TR.durFrames(c.transIn) * pxf); if (x0 + w < HEAD || x0 > TW) continue; ctx.fillStyle = 'rgba(217,182,92,.28)'; ctx.fillRect(x0, V.y + 4, w, V.h - 8); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(x0, V.y + 4); ctx.lineTo(x0 + w, V.y + 4); ctx.lineTo(x0, V.y + 4 + Math.min(14, w)); ctx.closePath(); ctx.fill(); }
    // 자막 카드
    const SL = LY.S;
    for (const sc2 of D.S) { const x0 = xOf(sc2.at), x1 = xOf(sc2.at + sc2.dur); if (x1 < HEAD || x0 > TW) continue; drawSub(ctx, sc2, x0, x1, SL.y + 4, SL.h - 8, sc2.id === selS); }
    // 부품 카드 (겹치면 뒤 카드가 위에)
    const PL = LY.P;
    for (const pt of D.P) { const x0 = xOf(pt.at), x1 = xOf(pt.at + pt.dur); if (x1 < HEAD || x0 > TW) continue; drawPart(ctx, pt, x0, x1, PL.y + 4, PL.h - 8, pt.id === selP); }
    // 음악 카드 + 비트 마커
    const A2L = LY.A2, tot0 = P.total();
    for (const a of D.A2) { const x0 = xOf(a.at), x1 = xOf(a.at + a.out - a.in); if (x1 < HEAD || x0 > TW) continue; drawMusic(ctx, a, x0, x1, A2L.y + 4, A2L.h - 8, a.id === selA2, tot0); }
    if (beatSnap && pxf >= 0.6) { const bts = beatFrames(); ctx.strokeStyle = 'rgba(217,182,92,.22)'; ctx.lineWidth = 1; for (const b of bts) { const x = Math.round(xOf(b)) + .5; if (x < HEAD || x > TW) continue; ctx.beginPath(); ctx.moveTo(x, V.y + 4); ctx.lineTo(x, V.y + V.h - 4); ctx.stroke(); } }
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

  function drawSub(ctx, sc2, x0, x1, y, h, selected) {
    const vx0 = Math.max(x0, HEAD), vx1 = Math.min(x1, TW); if (vx1 - vx0 < 1) return;
    const w = x1 - x0;
    ctx.save(); rr(ctx, x0, y, w, h, 4); ctx.clip();
    ctx.fillStyle = selected ? '#3a3054' : '#2b2542'; ctx.fillRect(x0, y, w, h);
    ctx.fillStyle = selected ? GOLD : '#d9d2ea'; ctx.font = '600 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText(SB.plain(sc2.text || ''), vx0 + 6, y + h / 2 + 0.5, Math.max(10, vx1 - vx0 - 10));
    ctx.restore();
    rr(ctx, x0 + 0.5, y + 0.5, w - 1, h - 1, 4); ctx.strokeStyle = selected ? GOLD : '#5a4f86'; ctx.lineWidth = selected ? 2 : 1; ctx.stroke();
  }

  function drawPart(ctx, pt, x0, x1, y, h, selected) {
    const vx0 = Math.max(x0, HEAD), vx1 = Math.min(x1, TW); if (vx1 - vx0 < 1) return;
    const w = x1 - x0, behind = PT.behind(pt);
    ctx.save(); rr(ctx, x0, y, w, h, 4); ctx.clip();
    ctx.fillStyle = selected ? '#4a3d1f' : (behind ? '#2f3a2c' : '#3a3220'); ctx.fillRect(x0, y, w, h);
    // 홀드 구간 표시: 등장·퇴장은 진하게, 늘어난 가운데는 옅게
    const m = PT.meta(pt.part), d = PT.def(pt.part);
    if (m.hold && d && pt.dur / FPS > d.dur + 0.05) { const ia = m.hold[0] * FPS, ob = (d.dur - m.hold[1]) * FPS; ctx.fillStyle = 'rgba(217,182,92,.12)'; ctx.fillRect(x0 + ia * pxf, y, Math.max(0, w - (ia + ob) * pxf), h); }
    ctx.fillStyle = selected ? GOLD : (behind ? '#cfe3c8' : '#f0dfa8'); ctx.font = '600 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText((behind ? '↩ ' : '✦ ') + PT.label(pt), vx0 + 6, y + h / 2 + 0.5, Math.max(10, vx1 - vx0 - 10));
    ctx.restore();
    rr(ctx, x0 + 0.5, y + 0.5, w - 1, h - 1, 4); ctx.strokeStyle = selected ? GOLD : (behind ? '#6f8f62' : '#8a6f2e'); ctx.lineWidth = selected ? 2 : 1; ctx.stroke();
  }

  function drawMusic(ctx, a, x0, x1, y, h, selected, tot) {
    const m = P.media(a.media), src = M.get(a.media);
    const vx0 = Math.max(x0, HEAD), vx1 = Math.min(x1, TW); if (vx1 - vx0 < 1) return;
    const w = x1 - x0, len = a.out - a.in;
    ctx.save(); rr(ctx, x0, y, w, h, 4); ctx.clip();
    ctx.fillStyle = selected ? '#1f3a4a' : '#1a2f3d'; ctx.fillRect(x0, y, w, h);
    const vol = a.vol == null ? 1 : a.vol, mid = y + h / 2, amp = (h - 6) / 2;
    const gainAt = f => { let v = 1; if (a.fadeIn && f < a.fadeIn) v *= f / a.fadeIn; if (a.fadeOut && f > len - a.fadeOut) v *= Math.max(0, (len - f) / a.fadeOut); return v; };
    if (src && src.peaks) {
      ctx.fillStyle = '#6fb7d9';
      for (let px = vx0; px < vx1; px += 2) {
        const f = (px - x0) / pxf, sf = clamp(a.in + Math.floor(f), 0, m.dur - 1);
        const v = Math.min(1, (src.peaks[sf] || 0) * 4 * vol * gainAt(f)), bh = Math.max(1, v * amp);
        ctx.fillRect(px, mid - bh, 1.5, bh * 2);
      }
    } else { ctx.fillStyle = '#5c6884'; ctx.font = '11px Pretendard, sans-serif'; ctx.fillText('분석 중…', vx0 + 8, mid + 4); }
    // 페이드 램프
    ctx.strokeStyle = 'rgba(217,182,92,.8)'; ctx.lineWidth = 1;
    if (a.fadeIn) { ctx.beginPath(); ctx.moveTo(x0, y + h - 1); ctx.lineTo(x0 + a.fadeIn * pxf, y + 1); ctx.stroke(); }
    if (a.fadeOut) { ctx.beginPath(); ctx.moveTo(x1 - a.fadeOut * pxf, y + 1); ctx.lineTo(x1, y + h - 1); ctx.stroke(); }
    // 비트 마커 (작은 눈금)
    if (src && src.beats && pxf >= 0.6) { ctx.fillStyle = 'rgba(217,182,92,.75)'; for (const b of src.beats) { const bf = Math.round(b * FPS); if (bf < a.in || bf >= a.out) continue; const x = x0 + (bf - a.in) * pxf; if (x < vx0 || x > vx1) continue; ctx.fillRect(x, y, 1, 4); } }
    // 영상 끝 너머는 흐리게
    if (tot && x1 > xOf(tot)) { ctx.fillStyle = 'rgba(12,17,28,.6)'; ctx.fillRect(xOf(tot), y, x1 - xOf(tot), h); }
    ctx.fillStyle = 'rgba(8,14,30,.7)'; ctx.fillRect(vx0, y, Math.min(160, vx1 - vx0), 13);
    ctx.fillStyle = selected ? GOLD : '#cfe6f3'; ctx.font = '600 10px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('♪ ' + m.name + (vol !== 1 ? ' · ' + Math.round(vol * 100) + '%' : ''), vx0 + 5, y + 7, Math.min(150, vx1 - vx0 - 10));
    ctx.restore();
    rr(ctx, x0 + 0.5, y + 0.5, w - 1, h - 1, 4); ctx.strokeStyle = selected ? GOLD : '#3f6f8a'; ctx.lineWidth = selected ? 2 : 1; ctx.stroke();
  }

  /* A2 비트 마커 → 타임라인 프레임 목록 (스냅 후보) */
  function beatFrames() {
    const out = [];
    for (const a of P.data.A2) { const src = M.get(a.media); if (!src || !src.beats) continue; for (const b of src.beats) { const bf = Math.round(b * FPS); if (bf >= a.in && bf < a.out) out.push(a.at + bf - a.in); } }
    return out;
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
    const hv = (drag && /^(trim|atrim|strim|ptrim|mtrim)$/.test(drag.type)) ? { kind: { trim: 'V', atrim: 'A1', strim: 'S', ptrim: 'P', mtrim: 'A2' }[drag.type], clip: drag.clip, s: drag.s, pt: drag.pt, a2: drag.a2, edge: drag.side } : hover;
    if (hv && hv.edge && /^(V|A1|S|P|A2)$/.test(hv.kind)) {
      const L = LY[hv.kind]; let x0, x1;
      if (hv.kind === 'V') { x0 = xOf(hv.clip.at); x1 = xOf(hv.clip.at + hv.clip.dur); }
      else if (hv.kind === 'S') { x0 = xOf(hv.s.at); x1 = xOf(hv.s.at + hv.s.dur); }
      else if (hv.kind === 'P') { x0 = xOf(hv.pt.at); x1 = xOf(hv.pt.at + hv.pt.dur); }
      else if (hv.kind === 'A2') { x0 = xOf(hv.a2.at); x1 = xOf(hv.a2.at + hv.a2.out - hv.a2.in); }
      else { const a = P.audioOf(hv.clip.id); if (!a) x0 = x1 = -99; else { x0 = xOf(a.at); x1 = xOf(a.at + a.dur); } }
      const x = hv.edge === 'in' ? x0 : x1 - 6;
      ctx.fillStyle = GOLD; rr(ctx, x, L.y + 4, 6, L.h - 8, 2); ctx.fill();
      ctx.fillStyle = '#1a1408'; ctx.fillRect(x + 2.5, L.y + L.h / 2 - 6, 1, 12);
    }
    // 부품 목록에서 끌어오는 중: P 레인 삽입 위치
    if (partDrag && partDrag.overTL) { const x = Math.round(xOf(partDrag.f)) + .5; ctx.fillStyle = 'rgba(217,182,92,.35)'; rr(ctx, x, LY.P.y + 4, Math.max(8, partDrag.dur * pxf), LY.P.h - 8, 4); ctx.fill(); ctx.fillStyle = GOLD; ctx.fillRect(x - 1, LY.P.y, 3, LY.P.h); }
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
    if (lane === 'S') for (const sc2 of P.data.S) { const x0 = xOf(sc2.at), x1 = xOf(sc2.at + sc2.dur); if (x >= x0 && x < x1) { const ez = Math.min(9, (x1 - x0) / 3); return { kind: 'S', s: sc2, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } }
    if (lane === 'P') { const arr = P.data.P; for (let i = arr.length - 1; i >= 0; i--) { const pt = arr[i], x0 = xOf(pt.at), x1 = xOf(pt.at + pt.dur); if (x >= x0 && x < x1) { const ez = Math.min(9, (x1 - x0) / 3); return { kind: 'P', pt, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } } }
    if (lane === 'A2') { const arr = P.data.A2; for (let i = arr.length - 1; i >= 0; i--) { const a = arr[i], x0 = xOf(a.at), x1 = xOf(a.at + a.out - a.in); if (x >= x0 && x < x1) { const ez = Math.min(9, (x1 - x0) / 3); return { kind: 'A2', a2: a, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } } }
    if (lane === 'A1') for (const a of P.data.A1) { const x0 = xOf(a.at), x1 = xOf(a.at + a.dur); if (x >= x0 && x < x1) { const ez = Math.min(9, (x1 - x0) / 3); return { kind: 'A1', clip: P.clip(a.clip), a, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } }
    return { kind: 'lane', lane };
  }
  function pos(e) { const r = tl.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  /* 스냅: 타임라인 프레임 f 를 후보(플레이헤드·편집점)에 7px 안이면 붙인다 */
  function snapFrame(f, extra) {
    if (!snap) return { f, x: null };
    const cands = [ph].concat(P.edges()).concat(extra || []).concat(beatSnap ? beatFrames() : []);
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
    if (h.kind === 'ruler' || h.kind === 'lane') { if (h.kind === 'lane') { select(null); selectS(null); selectP(null); selectA2(null); } drag = { type: 'scrub' }; setPH(frameOf(x), { noScroll: true }); return; }
    if (h.kind === 'P') {
      selectP(h.pt.id); P.commit();
      if (h.edge) drag = { type: 'ptrim', pt: h.pt, side: h.edge, x0: x, orig: { at: h.pt.at, dur: h.pt.dur } };
      else drag = { type: 'pmove', pt: h.pt, x0: x, orig: { at: h.pt.at } };
      return;
    }
    if (h.kind === 'A2') {
      selectA2(h.a2.id); P.commit();
      if (h.edge) drag = { type: 'mtrim', a2: h.a2, side: h.edge, x0: x, orig: { at: h.a2.at, in: h.a2.in, out: h.a2.out } };
      else drag = { type: 'mmove', a2: h.a2, x0: x, orig: { at: h.a2.at } };
      return;
    }
    if (h.kind === 'S') {
      selectS(h.s.id); P.commit();
      if (h.edge) drag = { type: 'strim', s: h.s, side: h.edge, x0: x, orig: { at: h.s.at, dur: h.s.dur } };
      else drag = { type: 'smove', s: h.s, x0: x, orig: { at: h.s.at } };
      return;
    }
    select(h.clip.id); selectS(null); selectP(null); selectA2(null);
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
      const hid = hv => hv ? (hv.kind === 'S' ? hv.s.id : hv.kind === 'P' ? hv.pt.id : hv.kind === 'A2' ? hv.a2.id : hv.clip.id) : undefined;
      const hname = hv => hv.kind === 'S' ? SB.plain(hv.s.text) : hv.kind === 'P' ? PT.label(hv.pt) : hv.kind === 'A2' ? '♪ ' + P.media(hv.a2.media).name : P.media(hv.clip.media).name;
      const prevEdge = hover && hover.edge, prevClip = hid(hover);
      hover = /^(V|A1|S|P|A2)$/.test(h.kind) ? h : null;
      tl.style.cursor = hover && hover.edge ? 'ew-resize' : hover ? 'grab' : (x >= HEAD ? 'text' : 'default');
      if (x >= HEAD && y >= 0 && y <= TH) $('hover').textContent = tc(Math.max(0, frameOf(x))) + (hover ? ' · ' + hname(hover) : ''); else $('hover').textContent = '';
      const curId = hid(hover);
      if ((hover && hover.edge) !== prevEdge || curId !== prevClip) draw();
      return;
    }
    if (drag.type === 'scrub') { setPH(frameOf(x), { noScroll: true }); return; }
    if (drag.type === 'pmove' || drag.type === 'ptrim') {
      const d = drag.pt, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'pmove') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; P.updateP(d.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else if (drag.side === 'in') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; const at = clamp(sn.f, 0, drag.orig.at + drag.orig.dur - 10); P.updateP(d.id, { at, dur: drag.orig.at + drag.orig.dur - at }, { commit: false }); }
      else { const sn = snapFrame(drag.orig.at + drag.orig.dur + dtl); drag.snapX = sn.x; P.updateP(d.id, { dur: Math.max(10, sn.f - drag.orig.at) }, { commit: false }); }
      renderPreview(); return;
    }
    if (drag.type === 'mmove' || drag.type === 'mtrim') {
      const d = drag.a2, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'mmove') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; P.updateA2(d.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else if (drag.side === 'in') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; P.updateA2(d.id, { at: drag.orig.at, in: drag.orig.in, out: drag.orig.out }, { commit: false }); P.trimA2(d.id, 'in', sn.f, { commit: false }); }
      else { const sn = snapFrame(drag.orig.at + (drag.orig.out - drag.orig.in) + dtl); drag.snapX = sn.x; P.updateA2(d.id, { out: drag.orig.out }, { commit: false }); P.trimA2(d.id, 'out', sn.f, { commit: false }); }
      return;
    }
    if (drag.type === 'smove' || drag.type === 'strim') {
      const d = drag.s, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'smove') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; P.updateS(d.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else if (drag.side === 'in') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; const at = clamp(sn.f, 0, drag.orig.at + drag.orig.dur - 5); P.updateS(d.id, { at, dur: drag.orig.at + drag.orig.dur - at }, { commit: false }); }
      else { const sn = snapFrame(drag.orig.at + drag.orig.dur + dtl); drag.snapX = sn.x; P.updateS(d.id, { dur: Math.max(5, sn.f - drag.orig.at) }, { commit: false }); }
      renderPreview(); return;
    }
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
    if (/^(trim|atrim|strim|smove|ptrim|pmove|mtrim|mmove)$/.test(d.type)) { dirty = true; setPH(ph); if (d.type === 'strim' || d.type === 'smove') refreshSubPanel(); if (d.type === 'ptrim' || d.type === 'pmove') refreshPartPanel(); if (d.type === 'mtrim' || d.type === 'mmove') refreshMusicPanel(); }
    draw();
  });
  tl.addEventListener('mouseleave', () => { if (!drag) { hover = null; $('hover').textContent = ''; draw(); } });
  tl.addEventListener('wheel', e => {
    e.preventDefault(); const { x } = pos(e);
    if (e.ctrlKey || e.metaKey) setZoom(pxf * (e.deltaY < 0 ? 1.18 : 1 / 1.18), x);
    else { scrollF += (e.deltaX || e.deltaY) / pxf * 0.8; clampScroll(); dirty = true; draw(); }
  }, { passive: false });
  tl.addEventListener('dblclick', e => { const { x, y } = pos(e); const h = hitTest(x, y); if (h.kind === 'V' || h.kind === 'A1') { setPH(h.clip.at); } if (h.kind === 'S') { setPH(h.s.at); $('subEditText').focus(); } if (h.kind === 'P') { setPH(h.pt.at + Math.min(h.pt.dur - 1, Math.round(PT.meta(h.pt.part).thumbT * FPS))); const f = $('partFields').querySelector('input'); if (f) f.focus(); } if (h.kind === 'A2') setPH(h.a2.at); });

  /* ---------- 선택·편집 동작 ---------- */
  function select(id) { if (sel === id) return; sel = id; dirty = true; draw(); refreshPanel(); }
  function selectS(id) { if (selS === id) return; selS = id; dirty = true; draw(); refreshSubPanel(); }
  function selectP(id) { if (selP === id) return; selP = id; dirty = true; draw(); refreshPartPanel(); }
  function selectA2(id) { if (selA2 === id) return; selA2 = id; dirty = true; draw(); refreshMusicPanel(); }
  function selClip() { return sel ? P.clip(sel) : null; }
  function doSplit() { stop(); const c2 = P.split(ph); if (c2) select(c2.id); else toast('여기선 나눌 게 없어요 — 플레이헤드를 클립 안쪽으로'); }
  function doDelete() {
    stop();
    if (selS) { P.removeS(selS); selectS(null); setPH(ph); return; }
    if (selP) { P.removeP(selP); selectP(null); setPH(ph); return; }
    if (selA2) { P.removeA2(selA2); selectA2(null); setPH(ph); return; }
    const c = selClip() || P.clipAt(ph); if (!c) return; P.removeClip(c.id); select(null); setPH(ph);
  }
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
      case 'Escape': select(null); selectS(null); selectP(null); selectA2(null); break;
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
    // 룩 (클립)
    const cl = c.look || {};
    const lutKey = cl.lut === undefined ? 'inherit' : (cl.lut === null ? 'none' : cl.lut);
    Array.from($('clipLutSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === lutKey));
    $('cBright').value = Math.round((cl.bright || 0) * 100); $('cBrightV').textContent = $('cBright').value;
    $('cContrast').value = Math.round((cl.contrast == null ? 1 : cl.contrast) * 100); $('cContrastV').textContent = $('cContrast').value;
    $('cSat').value = Math.round((cl.sat == null ? 1 : cl.sat) * 100); $('cSatV').textContent = $('cSat').value;
    Array.from($('kbSeg').children).forEach(b => b.classList.toggle('on', (b.dataset.k || null) === (c.kenburns || null)));
    // 전환
    const tr = c.transIn || { type: 'cut' };
    $('trType').value = tr.type;
    const def = TR.TYPES.find(t => t.id === tr.type) || TR.TYPES[0];
    $('rowTrDur').classList.toggle('hidden', tr.type === 'cut');
    $('rowTrDir').classList.toggle('hidden', !def.dirs);
    Array.from($('trDurSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === (tr.dur || 'normal')));
    Array.from($('trDirSeg').children).forEach(b => { const ok = def.dirs && def.dirs.includes(b.dataset.k); b.classList.toggle('hidden', !ok); b.classList.toggle('on', b.dataset.k === (tr.dir || (def.dirs && def.dirs[0]))); });
  }
  function refreshProject() { $('pTot').textContent = secStr(P.total()); $('pCnt').textContent = P.data.V.length; $('tcTot').textContent = tc(P.total()); }

  /* ---------- 3단계 패널: 룩·켄 번즈·전환·자막 ---------- */
  function segBtn(parent, k, label, fn, title) { const b = document.createElement('button'); b.textContent = label; b.dataset.k = k; if (title) b.title = title; b.onclick = fn; parent.appendChild(b); return b; }
  // 클립 LUT
  segBtn($('clipLutSeg'), 'inherit', '프로젝트', () => { const c = selClip(); if (c) P.setLook(c.id, { lut: undefined, strength: undefined }); });
  segBtn($('clipLutSeg'), 'none', '없음', () => { const c = selClip(); if (c) P.setLook(c.id, { lut: null }); });
  LK.LUTS.forEach(l => segBtn($('clipLutSeg'), l.id, l.name.replace(/ /g, ''), () => { const c = selClip(); if (c) P.setLook(c.id, { lut: l.id }); }, l.hint));
  function sliderLook(id, key, scale, vEl, fmt) {
    let start = null;
    $(id).oninput = e => { const c = selClip(); if (!c) return; if (start == null) { start = c.look ? c.look[key] : undefined; } const v = +e.target.value / scale; $(vEl).textContent = fmt ? fmt(e.target.value) : e.target.value; c.look = Object.assign({}, c.look || {}, { [key]: v }); renderPreview(); };
    $(id).onchange = e => { const c = selClip(); if (!c) return; const v = +e.target.value / scale; if (c.look) { if (start === undefined) delete c.look[key]; else c.look[key] = start; if (!Object.keys(c.look).length) c.look = null; } start = null; P.setLook(c.id, { [key]: v }); };
  }
  sliderLook('cBright', 'bright', 100, 'cBrightV'); sliderLook('cContrast', 'contrast', 100, 'cContrastV'); sliderLook('cSat', 'sat', 100, 'cSatV');
  // 켄 번즈
  segBtn($('kbSeg'), '', '없음', () => { const c = selClip(); if (c) P.setKenburns(c.id, null); });
  LK.KENBURNS.forEach(k => segBtn($('kbSeg'), k.id, k.name, () => { const c = selClip(); if (c) P.setKenburns(c.id, k.id); }));
  // 전환
  TR.TYPES.forEach(t => { const o = document.createElement('option'); o.value = t.id; o.textContent = t.name; $('trType').appendChild(o); });
  $('trType').onchange = e => { const c = selClip(); if (!c) return; stop(); const type = e.target.value, def = TR.TYPES.find(t => t.id === type); const cur = c.transIn || {}; P.setTransition(c.id, type === 'cut' ? null : { type, dur: cur.dur || 'normal', dir: def.dirs ? (def.dirs.includes(cur.dir) ? cur.dir : def.dirs[0]) : undefined }); if (type !== 'cut') setPH(c.at + Math.round(TR.durFrames({ dur: cur.dur || 'normal' }) / 2)); };
  TR.DURS.forEach(d => segBtn($('trDurSeg'), d.id, d.name + ' ' + (d.f / FPS).toFixed(1) + 's', () => { const c = selClip(); if (c && c.transIn) P.setTransition(c.id, Object.assign({}, c.transIn, { dur: d.id })); }));
  [['ltr', '→'], ['rtl', '←'], ['ttb', '↓'], ['btt', '↑']].forEach(([k, l]) => segBtn($('trDirSeg'), k, l, () => { const c = selClip(); if (c && c.transIn) P.setTransition(c.id, Object.assign({}, c.transIn, { dir: k })); }));
  // 프로젝트 룩
  const THEME_LIST = window.KM_PARTS ? Object.values(window.KM_PARTS.THEMES) : [{ id: 'geumseong', name: '금성초 네이비' }];
  THEME_LIST.forEach(t => segBtn($('themeSeg'), t.id, t.name.replace(/ 네이비| 초록/, ''), () => P.setTheme(t.id)));
  segBtn($('lutSeg'), 'none', '없음', () => P.setProjectLook({ lut: null }));
  LK.LUTS.forEach(l => segBtn($('lutSeg'), l.id, l.name.replace(/ /g, ''), () => P.setProjectLook({ lut: l.id }), l.hint));
  let lutStrStart = null;
  $('lutStr').oninput = e => { if (lutStrStart == null) lutStrStart = P.data.look.strength; P.data.look.strength = +e.target.value / 100; $('lutStrV').textContent = e.target.value + '%'; renderPreview(); };
  $('lutStr').onchange = e => { const v = +e.target.value / 100; P.data.look.strength = lutStrStart == null ? 0.6 : lutStrStart; lutStrStart = null; P.setProjectLook({ strength: v }); };
  let vigStart = null;
  $('vig').oninput = e => { if (vigStart == null) vigStart = P.data.look.vignette || 0; P.data.look.vignette = +e.target.value / 100; $('vigV').textContent = e.target.value + '%'; renderPreview(); };
  $('vig').onchange = e => { const v = +e.target.value / 100; P.data.look.vignette = vigStart == null ? 0 : vigStart; vigStart = null; P.setProjectLook({ vignette: v }); };
  $('tgExpose').onclick = () => P.setProjectLook({ autoExpose: !P.data.look.autoExpose });
  $('tgBar').onclick = () => P.setProjectLook({ cinemaBar: !P.data.look.cinemaBar });
  function refreshLookPanel() {
    const L = P.data.look;
    Array.from($('themeSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === P.data.theme));
    Array.from($('lutSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === (L.lut || 'none')));
    $('lutStr').value = Math.round((L.strength == null ? 0.6 : L.strength) * 100); $('lutStrV').textContent = $('lutStr').value + '%';
    $('vig').value = Math.round((L.vignette || 0) * 100); $('vigV').textContent = $('vig').value + '%';
    $('tgExpose').classList.toggle('on', !!L.autoExpose); $('tgBar').classList.toggle('on', !!L.cinemaBar);
  }
  // 자막
  let subStyle = 'basic';
  SB.STYLES.forEach(st => segBtn($('subStyleSeg'), st.id, st.name, () => { subStyle = st.id; const s2 = selS && P.subtitle(selS); if (s2) P.updateS(s2.id, { style: st.id }); else refreshSubPanel(); }, st.hint));
  $('btnSubAuto').onclick = () => {
    stop();
    const lines = $('subText').value.split(/\n/).map(x => x.trim()).filter(Boolean);
    if (!lines.length) return toast('먼저 문장을 한 줄에 하나씩 넣어 주세요');
    if (!P.total()) return toast('타임라인이 비어 있어요');
    const voice = A.voice();
    const cards = SB.distribute(lines, voice, P.total(), FPS).map(c => Object.assign(c, { style: subStyle }));
    P.setS(cards); $('subText').value = '';
    toast(voice.length ? '말하는 구간 ' + voice.length + '곳에 나눠 놓았어요 — 카드를 끌어서 손보세요' : '음성 구간을 못 찾아 전체 길이에 고르게 놓았어요', 3000);
    if (cards.length) { selectS(cards[0].id); setPH(cards[0].at); }
  };
  $('btnSubAdd').onclick = () => { stop(); const text = $('subText').value.split(/\n/).map(x => x.trim()).filter(Boolean)[0] || '자막'; const s2 = P.addS({ text, at: ph, dur: 2 * FPS, style: subStyle }); selectS(s2.id); setPH(ph); };
  $('btnSubClear').onclick = () => { if (!P.data.S.length) return; if (!confirm('자막을 전부 지울까요?')) return; P.clearS(); selectS(null); setPH(ph); };
  let subEditStart = null;
  $('subEditText').oninput = e => { const s2 = selS && P.subtitle(selS); if (s2) { if (subEditStart == null) subEditStart = s2.text; s2.text = e.target.value; dirty = true; renderPreview(); draw(); } };
  $('subEditText').onchange = e => { const s2 = selS && P.subtitle(selS); if (s2) { const v = e.target.value; if (subEditStart != null) s2.text = subEditStart; subEditStart = null; P.updateS(s2.id, { text: v }); } };
  $('subEditText').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
  $('btnSubDel').onclick = () => { if (selS) { P.removeS(selS); selectS(null); setPH(ph); } };
  function refreshSubPanel() {
    const s2 = selS && P.subtitle(selS);
    $('subEdit').classList.toggle('hidden', !s2);
    Array.from($('subStyleSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === (s2 ? s2.style : subStyle)));
    if (s2) { if (document.activeElement !== $('subEditText')) $('subEditText').value = s2.text; $('subEditTime').textContent = tc(s2.at) + ' → ' + tc(s2.at + s2.dur) + ' · ' + secStr(s2.dur); }
    const list = $('subList'); list.innerHTML = '';
    P.data.S.forEach(c => {
      const el = document.createElement('div'); el.className = 'sc' + (c.id === selS ? ' on' : '');
      const t = document.createElement('span'); t.className = 't'; t.textContent = SB.plain(c.text) || '(빈 자막)';
      const tm = document.createElement('span'); tm.className = 'tm'; tm.textContent = tc(c.at);
      const x = document.createElement('span'); x.className = 'x'; x.textContent = '✕'; x.onclick = ev => { ev.stopPropagation(); P.removeS(c.id); if (selS === c.id) selectS(null); setPH(ph); };
      el.append(t, tm, x); el.onclick = () => { selectS(c.id); setPH(c.at); };
      list.appendChild(el);
    });
  }

  /* ---------- 4단계 패널: 부품 P ---------- */
  const partThumbs = new Map();              // partId → canvas 요소 (목록)
  function buildPartGrid() {
    const grid = $('partGrid'); grid.innerHTML = ''; partThumbs.clear();
    if (!PT || !PT.ready()) { grid.innerHTML = '<div class="note">부품(kmake/parts)을 불러오지 못했어요 — 네트워크를 확인해 주세요.</div>'; return; }
    let cat = null;
    PT.list().forEach(({ def, meta }) => {
      if (meta.cat !== cat) { cat = meta.cat; const h = document.createElement('div'); h.className = 'cat'; h.textContent = (PT.CATS.find(c => c.id === cat) || {}).name || cat; grid.appendChild(h); }
      const el = document.createElement('div'); el.className = 'pc'; el.dataset.id = def.id; el.title = def.name + ' · ' + def.dur + '초 — 클릭: 플레이헤드에 놓기 / 끌기: P 레인에 놓기';
      const cv = document.createElement('canvas'); cv.width = 240; cv.height = 135; el.appendChild(cv); partThumbs.set(def.id, cv);
      const b = document.createElement('b'); b.textContent = def.name; el.appendChild(b);
      const sm = document.createElement('small'); sm.textContent = def.dur + '초' + (meta.behind ? ' · 인물 뒤' : ''); el.appendChild(sm);
      el.onmousedown = e => { if (e.button !== 0) return; e.preventDefault(); partDrag = { part: def.id, dur: P.partDefault(def.id).dur, x: e.clientX, y: e.clientY, moved: false, overTL: false, f: 0 }; };
      grid.appendChild(el);
    });
    paintPartThumbs();
  }
  function paintPartThumbs() {
    if (!PT || !PT.ready()) return;
    partThumbs.forEach((cv, id) => { const th = PT.thumb(id, null, P.data.theme, 240, 135); if (th) { const c = cv.getContext('2d'); c.clearRect(0, 0, 240, 135); c.drawImage(th, 0, 0); } });
  }
  function placePart(partId, at) {
    stop();
    const pt = P.addP({ part: partId, at: Math.max(0, Math.round(at)) });
    if (!pt) return;
    selectP(pt.id); select(null); selectS(null); selectA2(null);
    setPH(pt.at + Math.min(pt.dur - 1, Math.round(PT.meta(partId).thumbT * FPS)));
    if (PT.behind(pt) && SG) SG.load().then(ok => { if (!ok) toast('인물 컷아웃 모델을 못 불러와 부품이 그냥 앞에 그려져요', 4000); });
    toast(PT.def(partId).name + ' 을 놓았어요 — 오른쪽에서 문구를 바꾸세요', 1800);
  }
  window.addEventListener('mousemove', e => {
    if (!partDrag) return;
    if (!partDrag.moved && Math.hypot(e.clientX - partDrag.x, e.clientY - partDrag.y) < 6) return;
    partDrag.moved = true;
    const gh = $('partGhost'); gh.classList.remove('hidden'); gh.textContent = '✦ ' + PT.def(partDrag.part).name; gh.style.left = e.clientX + 'px'; gh.style.top = e.clientY + 'px';
    const r = tl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const over = x >= HEAD && x <= r.width && y >= 0 && y <= r.height;
    partDrag.overTL = over;
    if (over) { const sn = snapFrame(frameOf(x)); partDrag.f = Math.max(0, sn.f); }
    tl.style.cursor = over ? 'copy' : 'default';
    draw();
  });
  window.addEventListener('mouseup', () => {
    if (!partDrag) return;
    const d = partDrag; partDrag = null; $('partGhost').classList.add('hidden'); tl.style.cursor = 'default';
    if (!d.moved) placePart(d.part, ph);
    else if (d.overTL) placePart(d.part, d.f);
    else draw();
  });
  function selPart() { return selP ? P.part(selP) : null; }
  let partFieldStart = null;
  function buildPartFields(pt) {
    const box = $('partFields'); box.innerHTML = '';
    const def = PT.def(pt.part); if (!def) return;
    def.fields.forEach(f => {
      const row = document.createElement('div'); row.className = 'row';
      const lb = document.createElement('label'); lb.textContent = f.label; row.appendChild(lb);
      if (f.opts) {
        const seg = document.createElement('div'); seg.className = 'seg' + (f.opts.length >= 3 ? ' c' + Math.min(f.opts.length, 4) : '');
        f.opts.forEach(o => { const b = document.createElement('button'); b.textContent = OPT_KO[o] || o; b.dataset.k = o; b.classList.toggle('on', pt.p[f.k] === o); b.onclick = () => { const cur = selPart(); if (cur) P.updateP(cur.id, { p: { [f.k]: o } }); }; seg.appendChild(b); });
        row.appendChild(seg);
      } else {
        const inp = document.createElement('input'); inp.type = 'text'; inp.value = pt.p[f.k] == null ? '' : pt.p[f.k]; inp.dataset.k = f.k;
        inp.oninput = e => { const cur = selPart(); if (!cur) return; if (partFieldStart == null) partFieldStart = cur.p[f.k]; cur.p[f.k] = e.target.value; dirty = true; renderPreview(); draw(); };
        inp.onchange = e => { const cur = selPart(); if (!cur) return; const v = e.target.value; if (partFieldStart != null) cur.p[f.k] = partFieldStart; partFieldStart = null; P.updateP(cur.id, { p: { [f.k]: v } }); };
        inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
        row.appendChild(inp);
      }
      box.appendChild(row);
    });
  }
  const OPT_KO = { none: '없음', bottom: '아래', left: '왼쪽', center: '가운데', right: '오른쪽', navy: '네이비', black: '검정', white: '흰색', zoom: '줌', fade: '페이드', solid: '채움', outline: '윤곽', accent: '금색', top: '위', middle: '중간', slow: '느리게', normal: '보통', warm: '따뜻', gold: '금', cool: '차가움', ltr: '→', rtl: '←', topleft: '왼쪽 위', topright: '오른쪽 위', bottomright: '오른쪽 아래' };
  let partPanelFor = null;
  function refreshPartPanel() {
    const pt = selPart();
    $('partEdit').classList.toggle('hidden', !pt);
    Array.from($('partGrid').querySelectorAll('.pc')).forEach(el => el.classList.toggle('on', !!pt && el.dataset.id === pt.part));
    if (!pt) { partPanelFor = null; return; }
    const def = PT.def(pt.part), m = PT.meta(pt.part);
    if (partPanelFor !== pt.id) { buildPartFields(pt); partPanelFor = pt.id; }
    else { // 값만 갱신 (입력 중인 칸은 건드리지 않음)
      $('partFields').querySelectorAll('input[type=text]').forEach(inp => { if (document.activeElement !== inp) inp.value = pt.p[inp.dataset.k] == null ? '' : pt.p[inp.dataset.k]; });
      $('partFields').querySelectorAll('.seg').forEach(seg => { const f = def.fields.find(x => x.opts && x.opts.includes(seg.firstChild.dataset.k)); Array.from(seg.children).forEach(b => b.classList.toggle('on', f && pt.p[f.k] === b.dataset.k)); });
    }
    $('partEditName').textContent = def ? def.name : pt.part;
    if (document.activeElement !== $('partDur')) $('partDur').value = (pt.dur / FPS).toFixed(1);
    $('partHoldNote').textContent = def ? (m.hold ? (pt.dur / FPS > def.dur + 0.05 ? '가운데가 ' + ((pt.dur / FPS) - def.dur).toFixed(1) + '초 늘어나요' : pt.dur / FPS < def.dur - 0.05 ? '기본 ' + def.dur + '초보다 빨리 돌아요' : '기본 ' + def.dur + '초') : '전체가 비례로 늘고 줄어요') : '';
    $('rowPartCut').classList.toggle('hidden', !m.behind);
    $('tgPartCut').classList.toggle('on', PT.behind(pt));
    $('partEditTime').textContent = tc(pt.at) + ' → ' + tc(pt.at + pt.dur);
  }
  $('partDur').onchange = e => { const pt = selPart(); if (pt) { stop(); P.updateP(pt.id, { dur: Math.round(clamp(+e.target.value, 0.5, 120) * FPS) }); } };
  $('tgPartCut').onclick = () => { const pt = selPart(); if (!pt) return; const next = !PT.behind(pt); P.updateP(pt.id, { cut: next }); if (next && SG) SG.load(); };
  $('btnPartDel').onclick = () => { if (selP) { stop(); P.removeP(selP); selectP(null); setPH(ph); } };
  $('btnPartDup').onclick = () => { const pt = selPart(); if (!pt) return; stop(); const n = P.addP({ part: pt.part, at: pt.at + pt.dur, dur: pt.dur, p: Object.assign({}, pt.p), cut: pt.cut }); if (n) { selectP(n.id); setPH(n.at); } };

  /* ---------- 4단계 패널: 음악 A2 ---------- */
  function selMusic() { return selA2 ? P.a2(selA2) : null; }
  const FADES = [[0, '없음'], [FPS, '1초'], [2 * FPS, '2초'], [3 * FPS, '3초']];
  FADES.forEach(([f, l]) => segBtn($('fadeInSeg'), String(f), l, () => { const a = selMusic(); if (a) P.updateA2(a.id, { fadeIn: f }); }));
  FADES.forEach(([f, l]) => segBtn($('fadeOutSeg'), String(f), l, () => { const a = selMusic(); if (a) P.updateA2(a.id, { fadeOut: f }); }));
  let mVolStart = null;
  $('mVol').oninput = e => { const a = selMusic(); if (!a) return; if (mVolStart == null) mVolStart = a.vol == null ? 1 : a.vol; a.vol = +e.target.value / 100; $('mVolV').textContent = e.target.value + '%'; dirty = true; draw(); };
  $('mVol').onchange = e => { const a = selMusic(); if (!a) return; const v = +e.target.value / 100; a.vol = mVolStart == null ? 1 : mVolStart; mVolStart = null; P.updateA2(a.id, { vol: v }); };
  $('btnMusicDel').onclick = () => { if (selA2) { stop(); P.removeA2(selA2); selectA2(null); setPH(ph); } };
  $('btnMusicFit').onclick = () => { const a = selMusic(); if (!a) return; stop(); const tot = P.total(); if (!tot) return toast('영상이 없어요'); if (tot <= a.at) return toast('음악이 영상 끝보다 뒤에서 시작해요 — 앞으로 끌어 주세요'); const out = Math.min(P.media(a.media).dur, a.in + (tot - a.at)); P.updateA2(a.id, { out, fadeOut: Math.min(2 * FPS, out - a.in) }); toast('음악을 영상 끝에 맞췄어요 (페이드 아웃 2초)', 2000); };
  $('btnMusicImport').onclick = () => $('fileIn').click();
  $('tgDuck').onclick = () => P.setDucking({ on: !P.data.audio.ducking.on });
  let duckStart = null;
  $('duckDepth').oninput = e => { if (duckStart == null) duckStart = P.data.audio.ducking.depth; P.data.audio.ducking.depth = +e.target.value; $('duckDepthV').textContent = '-' + e.target.value + 'dB'; };
  $('duckDepth').onchange = e => { const v = +e.target.value; P.data.audio.ducking.depth = duckStart == null ? 12 : duckStart; duckStart = null; P.setDucking({ depth: v }); };
  $('tgBeat').onclick = () => { beatSnap = !beatSnap; $('tgBeat').classList.toggle('on', beatSnap); dirty = true; draw(); toast(beatSnap ? '박자 스냅 켬 — 클립 경계가 비트 마커에 붙어요' : '박자 스냅 끔', 1600); };
  function refreshMusicPanel() {
    const a = selMusic();
    $('musicBody').classList.toggle('hidden', !a); $('musicNone').classList.toggle('hidden', !!a || P.data.A2.length > 0);
    const D = P.data.audio.ducking; $('tgDuck').classList.toggle('on', !!D.on); $('rowDuck').classList.toggle('hidden', !D.on);
    if (document.activeElement !== $('duckDepth')) { $('duckDepth').value = D.depth == null ? 12 : D.depth; $('duckDepthV').textContent = '-' + $('duckDepth').value + 'dB'; }
    $('tgBeat').classList.toggle('on', beatSnap);
    if (!a) return;
    const m = P.media(a.media), src = M.get(a.media);
    $('mName').textContent = m.name; $('mName').title = m.name;
    $('mRange').textContent = tc(a.at) + ' → ' + tc(a.at + a.out - a.in) + ' · ' + secStr(a.out - a.in) + (src && src.beats ? ' · 비트 ' + src.beats.filter(b => { const f = Math.round(b * FPS); return f >= a.in && f < a.out; }).length + '개' : '');
    if (document.activeElement !== $('mVol')) { $('mVol').value = Math.round((a.vol == null ? 1 : a.vol) * 100); $('mVolV').textContent = $('mVol').value + '%'; }
    Array.from($('fadeInSeg').children).forEach(b => b.classList.toggle('on', +b.dataset.k === (a.fadeIn || 0)));
    Array.from($('fadeOutSeg').children).forEach(b => b.classList.toggle('on', +b.dataset.k === (a.fadeOut || 0)));
  }

  /* ---------- 우측 패널: 미디어 ---------- */
  function refreshBin() {
    const bin = $('bin'); bin.innerHTML = '';
    if (!P.data.media.length) { bin.innerHTML = '<div class="bin-empty">아직 없어요.<br>영상·사진을 끌어다 놓으면 타임라인 끝에 붙어요.</div>'; return; }
    P.data.media.forEach(m => {
      const src = M.get(m.id);
      const isAud = m.kind === 'audio';
      const el = document.createElement('div'); el.className = 'mi' + (isAud ? ' audio' : ''); el.title = isAud ? '클릭: 플레이헤드에 음악 놓기' : '클릭: 타임라인 끝에 추가';
      const th = src && src.thumbs && src.thumbs[0];
      if (isAud && src && src.peaks) { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 72; const c = cv.getContext('2d'); c.fillStyle = '#6fb7d9'; const n = src.peaks.length; for (let x = 0; x < 128; x += 2) { const v = Math.min(1, (src.peaks[Math.floor(x / 128 * n)] || 0) * 4), h2 = Math.max(1, v * 32); c.fillRect(x, 36 - h2, 1.5, h2 * 2); } el.appendChild(cv); }
      else if (th) { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 72; cv.getContext('2d').drawImage(th, 0, 0, 128, 72); el.appendChild(cv); }
      else { const ph2 = document.createElement('div'); ph2.className = 'ph'; ph2.textContent = m.kind === 'image' ? '사진' : isAud ? '♪' : '…'; el.appendChild(ph2); }
      const nm = document.createElement('div'); nm.className = 'nm';
      const used = isAud ? P.data.A2.filter(a => a.media === m.id).length : P.data.V.filter(c => c.media === m.id).length;
      nm.innerHTML = '<b></b><span></span>';
      nm.querySelector('b').textContent = m.name;
      nm.querySelector('span').textContent = (m.kind === 'image' ? m.w + '×' + m.h : isAud ? '음악 · ' + Math.round(m.dur / m.fps) + '초' + (src && src.beats ? ' · 비트 ' + src.beats.length : '') : Math.round(m.dur / m.fps) + '초 · ' + m.w + '×' + m.h + ' ' + m.fps + 'fps' + (m.audio ? '' : ' · 무음')) + (used ? ' · 사용 ' + used : '');
      if (src && src.kind === 'video' && !src.analyzed) { const bar = document.createElement('div'); bar.className = 'bar'; bar.innerHTML = '<i></i>'; bar.querySelector('i').style.width = Math.round((binProg[m.id] || 0) * 100) + '%'; bar.dataset.id = m.id; nm.appendChild(bar); }
      el.appendChild(nm);
      const x = document.createElement('span'); x.className = 'x'; x.textContent = '✕'; x.title = '미디어 제거 (타임라인에서도 빠져요)';
      x.onclick = ev => { ev.stopPropagation(); if (!confirm('"' + m.name + '" 을 지울까요? 타임라인의 클립도 함께 빠져요.')) return; stop(); P.removeMedia(m.id); M.remove(m.id); DB.delMedia(m.id); if (sel && !P.clip(sel)) select(null); if (selA2 && !P.a2(selA2)) selectA2(null); setPH(ph); refreshBin(); };
      el.appendChild(x);
      if (isAud) el.onclick = () => { stop(); const a = P.addA2(m.id, ph); if (a) { selectA2(a.id); select(null); selectS(null); selectP(null); setPH(a.at); toast(m.name + ' 을 ' + tc(a.at) + ' 에 놓았어요', 1500); } };
      else el.onclick = () => { stop(); const c = P.addClip(m.id); select(c.id); setPH(c.at); toast(m.name + ' 을 끝에 붙였어요', 1500); };
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
    const n = P.data.media.filter(m => { const s = M.get(m.id); return s && (s.kind === 'video' || s.kind === 'audio') && !s.analyzed; }).length;
    status(n ? '썸네일·모션·파형 분석 중 ' + n + '개' : '');
  }

  /* ---------- 가져오기 ---------- */
  let importing = false; const importQueue = [];
  async function importFiles(files) {
    files = files.filter(f => /^(video|image|audio)\//.test(f.type) || /\.(mp4|mov|m4v|png|jpe?g|webp|mp3|wav|m4a|aac|ogg)$/i.test(f.name));
    if (!files.length) return toast('mp4·mov 영상, jpg·png 사진, mp3·wav·m4a 음악만 넣을 수 있어요');
    if (importing) { importQueue.push(...files); toast('앞 파일 다음에 이어서 넣을게요 (' + importQueue.length + '개 대기)', 1500); return; }
    importing = true; stop();
    const first = !P.total();
    while (files.length) {
      const f = files.shift();
      status('가져오는 중: ' + f.name);
      try {
        const meta = await M.open(f, null, s => status(s + ' — ' + f.name));
        P.addMedia(meta);
        DB.putMedia(meta.id, f, f.name).catch(e => console.warn('db', e));
        if (meta.kind === 'audio') {
          const a = P.addA2(meta.id, P.data.A2.length ? ph : 0);
          refreshBin(); analyzeBg(meta.id); refreshStatus();
          if (a) { selectA2(a.id); select(null); toast(f.name + ' → 음악 레인 ' + tc(a.at) + ' · 말하는 동안은 자동으로 낮아져요', 3000); }
          continue;
        }
        const c = P.addClip(meta.id);
        refreshBin(); analyzeBg(meta.id); refreshStatus();
        if (files.length === 1) { select(c.id); setPH(c.at); }
      } catch (e) { console.error(e); toast(f.name + ' — ' + (e.message || e), 5000); }
      if (!files.length && importQueue.length) files.push(...importQueue.splice(0));  // 읽는 중 들어온 파일 이어서
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
    if (!drag) {
      refreshLookPanel(); refreshSubPanel(); refreshPartPanel(); refreshMusicPanel();
      if (selS && !P.subtitle(selS)) { selS = null; refreshSubPanel(); }
      if (selP && !P.part(selP)) { selP = null; refreshPartPanel(); }
      if (selA2 && !P.a2(selA2)) { selA2 = null; refreshMusicPanel(); }
      if (kind === 'look' || kind === 'load') paintPartThumbs();
      if (!playing && (kind === 'look' || kind === 'S' || kind === 'P' || kind === 'change' || kind === 'load' || kind === 'undo' || kind === 'redo')) renderPreview();
    }
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

  window.KMV_UI = { importFiles, setPH: f => setPH(f), get ph() { return ph; }, select, selectP, selectA2, placePart, play, stop, zoomFit, get pxf() { return pxf; }, get scrollF() { return scrollF; }, get selP() { return selP; }, get selA2() { return selA2; }, beatFrames };

  /* ---------- 시작 ---------- */
  resize();
  refreshBin(); refreshPanel(); refreshProject(); refreshLookPanel(); refreshSubPanel(); buildPartGrid(); refreshPartPanel(); refreshMusicPanel();
  document.fonts && document.fonts.ready.then(() => { paintPartThumbs(); if (!playing) renderPreview(); });
  LK.ready().then(() => { if (P.total()) renderPreview(); });
  $('zoom').value = Math.round(1000 * Math.log(pxf / MIN_PXF) / Math.log(MAX_PXF / MIN_PXF));
  restore().then(() => { zoomFit(); setPH(0); });
})();
