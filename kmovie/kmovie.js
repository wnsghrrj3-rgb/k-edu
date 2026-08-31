/* ============================================================
   케이무비 UI (kmovie.js) — 설계서 v1 §1·§2-1·§6
   ------------------------------------------------------------
   · 타임라인은 캔버스 하나에 5레인(P·S·V·A1·A2). 정적 층(클립·파형·썸네일)은
     오프스크린에 그려 두고 플레이헤드·드래그만 매 프레임 덧그린다.
   · 컷 도구: 클릭 선택 / 끌어서 순서 / 가장자리 끌어서 리플 트림(경계 프레임 미리보기)
     / Alt+소리띠 가장자리 = J/L 컷 / S 분할 / F 프리즈 / Q·W / Del / ↑↓ 편집점 / 스냅.
   · 4단계: 부품 P 레인(목록에서 끌어 놓기·필드 편집·홀드 늘이기·인물 뒤 컷아웃) · 음악 A2 레인
     (페이드·덕킹·비트 마커 스냅). 카드(S·P·A2)는 같은 손맛 — 끌어 이동·가장자리 트림·스냅·Del.
     잔여: 앰비언스(룸톤 자동 채움, A1 빈틈에 띠) · 몽타주 깔기(선택 클립부터 박자 격자에 길이 맞춤, 움직임 큰 구간 고르기).
   · 6단계 컷 손맛: 소스 모니터(I/O → 삽입 , / 덮어쓰기 . / 끝에) · 슬립(Alt+몸통) · 롤(Ctrl+가장자리)
     · 다중 선택(Shift 범위·Ctrl 토글·Ctrl+A) 이동/삭제/복사/붙여넣기 · 마커(M) · JKL 셔틀 · 두 화면 트림 미리보기.
   · 저장: 프로젝트 JSON + 원본 blob → IndexedDB. 새로고침해도 그대로.
   ============================================================ */
(function () {
  'use strict';
  const P = window.KMV_PROJECT, M = window.KMV_MEDIA, A = window.KMV_AUDIO, R = window.KMV_RENDER, LK = window.KMV_LOOK, TR = window.KMV_TRANSITION, SB = window.KMV_SUBTITLE, PT = window.KMV_PARTS, SG = window.KMV_SEG, SH = window.KMV_SHELL;
  const FPS = P.FPS, PW = P.W, PH = P.H;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const GOLD = '#D9B65C';

  if (!M.supported()) { $('nosup').classList.remove('hidden'); return; }

  /* ---------- 상태 ---------- */
  let ph = 0, sel = null, selS = null, selP = null, selA2 = null, selV2 = null, playing = false, snap = true, beatSnap = true, playStart = 0;
  const selSet = new Set();                  // 다중 선택 (sel 은 패널 기준 클립)
  let selM = null;                           // 선택 마커
  let stage = 'tl';                          // 'tl' | 'src' — 스테이지가 무엇을 보여주는가
  let srcCur = null;                         // 소스 모니터 { media, ph, in, out }
  const srcMemo = new Map();                 // media → { ph, in, out } (원본마다 I/O 기억)
  let srcPlaying = false, srcRaf = 0;
  let shuttle = 0, shRaf = 0, shT = 0, shAcc = 0;   // JKL: ±1·±2·±4 (1× 은 소리 있는 재생, 나머지는 무음 스텝)
  let clipboard = [];
  let montRange = 'all', montEvery = 2, montPick = 'motion';   // 몽타주 깔기 설정(세션)
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
        const r = indexedDB.open('kmovie', 2);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('media')) d.createObjectStore('media', { keyPath: 'id' }); if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); if (!d.objectStoreNames.contains('projects')) d.createObjectStore('projects', { keyPath: 'id' }); };
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
  /* ---------- 작업 파일 (KMV_STORE) ----------
     현재 작업 = proj {id, name, degraded}. 변경 400ms 뒤 이 기기(IndexedDB)에, 4초 뒤 케이에듀 계정에 저장.
     degraded = 다른 기기에서 열어 원본 없는 클립을 뺀 상태 → 계정 저장을 멈춘다(PC 작업을 폰이 덮어쓰지 않게). */
  const ST = window.KMV_STORE;
  const proj = { id: null, name: '새 작업', degraded: false, cloudAt: 0, cloudErr: null, saving: false };
  let saveT = 0, cloudT = 0;
  function rec() { return { id: proj.id, name: proj.name, doc: P.toJSON(), updatedAt: Date.now() }; }
  function scheduleSave() {
    if (!proj.id) return;
    clearTimeout(saveT); saveT = setTimeout(() => { ST.save(rec(), { cloud: false }).catch(e => console.warn('save', e)); refreshSaveNote(); }, 400);
    if (!proj.degraded) { clearTimeout(cloudT); cloudT = setTimeout(saveCloud, 4000); }
  }
  async function saveCloud() {
    if (!proj.id || proj.degraded) return;
    proj.saving = true; refreshSaveNote();
    try { const r = await ST.save(rec()); proj.cloudErr = r.error || null; if (r.cloud) proj.cloudAt = Date.now(); }
    catch (e) { proj.cloudErr = e; }
    proj.saving = false; refreshSaveNote();
  }
  function refreshSaveNote() {
    const el = $('saveNote'); if (!el) return;
    const pn = $('projName'); if (pn) pn.textContent = proj.name || '새 작업';
    if (proj.degraded) { el.textContent = '원본이 빠진 채 열린 작업이라 계정에는 저장하지 않아요 — 「내 작업」에서 사본으로 저장할 수 있어요.'; return; }
    if (proj.saving) { el.textContent = '계정에 저장하는 중…'; return; }
    if (proj.cloudErr) { el.textContent = '이 브라우저엔 저장됐어요 · 계정 저장은 실패(연결 확인)'; return; }
    el.textContent = proj.cloudAt ? '이 브라우저 + 케이에듀 계정에 자동 저장돼요 · ' + new Date(proj.cloudAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '이 브라우저에 자동 저장돼요 · 로그인하면 계정에도 저장돼 다른 기기에서 열 수 있어요';
  }

  /* ---------- 미리보기 ----------
     재생·셔틀 중엔 ① 미리보기를 1/2 해상도로(멈추면 원본 화질로 복귀) ② GOP 통 디코드(getFrame) 대신
     재생 스트림(streamTo)이 캐시를 앞서 채우고 ③ 분석은 쉰다. 프리미어의 "재생 해상도 1/2"와 같은 원리. */
  const pv = $('preview'), pctx = pv.getContext('2d');
  let segToast = 0;
  const live = () => playing || srcPlaying || shuttle !== 0;      // 어떤 형태로든 굴러가는 중
  function setRScale(sc) {
    const w = Math.round(PW * sc), h = Math.round(PH * sc);
    if (pv.width !== w) { pv.width = w; pv.height = h; }
  }
  function liveMode(on) { setRScale(on ? 0.5 : 1); M.setAnalyzePaused(on); if (!on) M.stopStreams(); }
  function renderPreview() {
    if (stage === 'src') { renderSource(); return; }
    $('stageLbl').classList.add('hidden');
    const W = pv.width, H = pv.height;
    const r = R.draw(pctx, W, H, ph);
    if (!r.exact && r.src && !live()) {
      const want = ph, job = ++previewJob;
      if (r.segPending) {
        if (SG && SG.status() !== 'ready' && !segToast) { segToast = 1; toast('인물 컷아웃 모델을 처음 한 번 불러와요 (12MB)', 3500); }
        r.src.getFrame(r.idx, true).then(f => f && SG.mask(r.media, r.idx, f)).then(() => { if (job === previewJob && ph === want && !live() && !drag) renderPreview(); }).catch(() => {});
      } else r.src.getFrame(r.idx, true).then(f => { if (f && job === previewJob && ph === want && !live() && !drag) renderPreview(); }).catch(() => {});
    }
    $('empty').classList.toggle('hidden', P.total() > 0 || P.data.P.length > 0);
  }
  /* 재생 스트림 먹이기: 지금 클립 + 경계 1초 전부터 다음 클립 미리 */
  function feedStream(t) {
    const c = P.clipAt(t); if (!c) return;
    const src = M.get(c.media);
    if (src && src.streamTo && !c.freeze) src.streamTo(P.srcFrame(c, t));
    if (t >= c.at + c.dur - FPS) {
      const nx = P.data.V[P.clipIndex(c.id) + 1];
      if (nx && nx.media !== c.media && !nx.freeze) { const ns = M.get(nx.media); if (ns && ns.streamTo) ns.streamTo(nx.in); }
    }
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
    if (stage === 'src') { playSrc(); return; }
    const tot = P.total(); if (!tot || playing) return;
    stopShuttle(); stopSrc();
    if (ph >= tot - 1) ph = 0;
    playStart = ph; playing = true; shuttle = 1; $('tPlay').textContent = '❚❚ 정지';
    liveMode(true); renderPreview();
    // 소리 선디코드가 끝난 뒤에 영상 스트림을 켠다 — 같이 켜면 시작 몇 초를 영상 디코드가 소리를 굶긴다
    A.play(ph).then(() => { feedStream(ph); cancelAnimationFrame(rafId); rafId = requestAnimationFrame(loop); });
  }
  function stop() {
    stopShuttle(); stopSrc();
    if (!playing) { if (!live()) liveMode(false); return; }
    playing = false; shuttle = 0; A.stop(); cancelAnimationFrame(rafId);
    $('tPlay').textContent = '▶ 재생';
    liveMode(false);
    setPH(ph);
  }
  /* ---------- JKL 셔틀 ---------- 1× 는 소리 있는 재생(play/playSrc), ±2·±4·역방향은 무음 프레임 스텝 */
  function stopShuttle() { if (shRaf) cancelAnimationFrame(shRaf); shRaf = 0; if (shuttle !== 1 && shuttle !== 0) { shuttle = 0; $('tPlay').textContent = '▶ 재생'; if (!playing && !srcPlaying) { liveMode(false); renderPreview(); } } }
  function shuttleTo(rate) {
    if (rate === 0) { stop(); return; }
    if (rate === 1) { if (stage === 'src') { if (!srcPlaying) { stopShuttle(); playSrc(); } } else if (!playing) { stopShuttle(); play(); } shuttle = 1; return; }
    if (playing) { playing = false; A.stop(); cancelAnimationFrame(rafId); }
    if (srcPlaying) { srcPlaying = false; A.stop(); cancelAnimationFrame(srcRaf); }
    cancelAnimationFrame(shRaf);
    shuttle = rate; shT = performance.now(); shAcc = 0; $('tPlay').textContent = '❚❚ ' + (rate > 0 ? '▶' : '◀') + Math.abs(rate) + '×';
    liveMode(true); stage === 'src' ? renderSource() : renderPreview();
    const step = () => {
      if (shuttle !== rate) return;
      const now = performance.now(); shAcc += (now - shT) / 1000 * rate * (stage === 'src' && srcCur ? P.media(srcCur.media).fps : FPS); shT = now;
      const df = shAcc > 0 ? Math.floor(shAcc) : Math.ceil(shAcc); shAcc -= df;
      if (df) {
        if (stage === 'src' && srcCur) {
          const m = P.media(srcCur.media), src = M.get(m.id), nf = clamp(srcCur.ph + df, 0, m.dur - 1);
          if (nf === srcCur.ph) { stopShuttle(); $('tPlay').textContent = '▶ 재생'; return; }
          if (src) { if (rate > 0 && src.streamTo) src.streamTo(nf); else src.getFrame(nf, true).catch(() => {}); }
          setSrcPH(nf);
        }
        else {
          const tot = P.total(), nf = clamp(ph + df, 0, Math.max(0, tot - 1));
          if (nf === ph) { stopShuttle(); $('tPlay').textContent = '▶ 재생'; return; }
          setPH(nf);
          const c = P.clipAt(ph), s2 = c && M.get(c.media);
          if (s2) { if (rate > 0) feedStream(ph); else s2.getFrame(P.srcFrame(c, ph), true).catch(() => {}); }
        }
      }
      shRaf = requestAnimationFrame(step);
    };
    shRaf = requestAnimationFrame(step);
  }
  function shuttleKey(dir) {                  // L: +1→+2→+4, J: -1→-2→-4
    const cur = (playing || srcPlaying) ? 1 * Math.sign(shuttle || 1) : shuttle;
    let next;
    if (dir > 0) next = cur <= 0 ? 1 : cur === 1 ? 2 : 4; else next = cur >= 0 ? -1 : cur === -1 ? -2 : -4;
    shuttleTo(next);
  }
  function loop() {
    if (!playing) return;
    const now = A.now(); if (now == null) return;
    const f = Math.max(playStart, Math.floor(now)), tot = P.total();
    if (f >= tot) { ph = tot - 1; stop(); return; }
    if (f !== ph) { ph = Math.max(0, f); $('tcCur').textContent = tc(ph); feedStream(ph); renderPreview(); ensureVisible(ph); draw(); }
    rafId = requestAnimationFrame(loop);
  }
  let uiRaf = 0;
  function uiRefresh() {                                  // 드래그 중 화면 갱신은 프레임당 1회
    if (!drag) { setPH(ph); return; }
    if (uiRaf) return;
    uiRaf = requestAnimationFrame(() => { uiRaf = 0; setPH(ph, { noScroll: true }); });
  }
  function togglePlay() { if (stage === 'src') { srcPlaying || shuttle ? stop() : playSrc(); return; } (playing || shuttle) ? stop() : play(); }

  /* ---------- 타임라인 캔버스 ---------- */
  const tl = $('timeline'), tctx = tl.getContext('2d');
  const sc = document.createElement('canvas'), sctx = sc.getContext('2d');
  let TW = 0, TH = 0, DPR = 1;
  const HEAD = 56, RULER = 24;
  const LANES = [{ k: 'P', h: 40, label: '꾸미기' }, { k: 'S', h: 40, label: '자막' }, { k: 'V2', h: 32, label: '덧영상' }, { k: 'V', h: 88, label: '영상' }, { k: 'A1', h: 48, label: '현장음' }, { k: 'A2', h: 36, label: '음악' }];
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

  /* 겹침 줄 배치 — 정렬된 카드에 0/1 줄 부여 (겹치면 두 줄). 그리기·히트가 같은 결과를 쓴다 */
  function laneRows(cards, endOf) {
    const map = {}; let e0 = -1, e1 = -1, rows = 1;
    for (const c2 of cards) {
      const a = c2.at, b = endOf(c2);
      if (a >= e0) { map[c2.id] = 0; e0 = b; }
      else if (a >= e1) { map[c2.id] = 1; e1 = b; rows = 2; }
      else if (e0 <= e1) { map[c2.id] = 0; e0 = b; rows = 2; }
      else { map[c2.id] = 1; e1 = b; rows = 2; }
    }
    return { map, rows };
  }
  function rowGeom(L, rowsInfo, id) {
    if (rowsInfo.rows === 1) return { y: L.y + 4, h: L.h - 8 };
    const h = (L.h - 9) / 2, r = rowsInfo.map[id] || 0;
    return { y: L.y + 3 + r * (h + 3), h };
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
    for (const c of D.V) { const x0 = xOf(c.at), x1 = xOf(c.at + c.dur); if (x1 < HEAD || x0 > TW) continue; drawClip(ctx, c, x0, x1, V.y + 4, V.h - 8, selSet.has(c.id)); }
    for (const a of D.A1) { const c = P.clip(a.clip); const x0 = xOf(a.at), x1 = xOf(a.at + a.dur); if (x1 < HEAD || x0 > TW) continue; drawAudio(ctx, a, c, x0, x1, A1.y + 4, A1.h - 8, selSet.has(a.clip)); }
    // 앰비언스: A1 빈틈에 룸톤 루프 띠
    { const amb = D.audio && D.audio.ambience; if (amb && amb.on && amb.src) { const gaps = A.ambGaps(); for (const gp of gaps) { const x0 = Math.max(HEAD, xOf(gp.at)), x1 = Math.min(TW, xOf(gp.at + gp.dur)); if (x1 - x0 < 1) continue; const y = A1.y + 4, h = A1.h - 8; ctx.save(); rr(ctx, x0, y, x1 - x0, h, 4); ctx.clip(); ctx.fillStyle = 'rgba(111,183,217,.10)'; ctx.fillRect(x0, y, x1 - x0, h); ctx.strokeStyle = 'rgba(111,183,217,.28)'; ctx.lineWidth = 1; ctx.beginPath(); for (let xx = x0 - h; xx < x1; xx += 8) { ctx.moveTo(xx, y + h); ctx.lineTo(xx + h, y); } ctx.stroke(); ctx.beginPath(); ctx.moveTo(x0, y + h / 2 + .5); ctx.lineTo(x1, y + h / 2 + .5); ctx.strokeStyle = 'rgba(111,183,217,.45)'; ctx.stroke(); if (x1 - x0 > 46) { ctx.fillStyle = 'rgba(160,205,228,.8)'; ctx.font = '600 10px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('룸톤', x0 + 5, y + 8); } ctx.restore(); } } }
    // 전환 표시 (클립 시작에 작은 겹침 표)
    for (const c of D.V) if (c.transIn) { const x0 = xOf(c.at), w = Math.max(6, TR.durFrames(c.transIn) * pxf); if (x0 + w < HEAD || x0 > TW) continue; ctx.fillStyle = 'rgba(217,182,92,.28)'; ctx.fillRect(x0, V.y + 4, w, V.h - 8); ctx.fillStyle = GOLD; ctx.beginPath(); ctx.moveTo(x0, V.y + 4); ctx.lineTo(x0 + w, V.y + 4); ctx.lineTo(x0, V.y + 4 + Math.min(14, w)); ctx.closePath(); ctx.fill(); }
    // 자막 카드 (겹치면 자동 두 줄)
    const SL = LY.S, sRows = laneRows(D.S, c2 => c2.at + c2.dur);
    for (const sc2 of D.S) { const x0 = xOf(sc2.at), x1 = xOf(sc2.at + sc2.dur); if (x1 < HEAD || x0 > TW) continue; const g2 = rowGeom(SL, sRows, sc2.id); drawSub(ctx, sc2, x0, x1, g2.y, g2.h, sc2.id === selS); }
    // 부품 카드 (겹치면 자동 두 줄, 같은 줄에선 뒤 카드가 위)
    const PL = LY.P, pRows = laneRows(D.P, c2 => c2.at + c2.dur);
    for (const pt of D.P) { const x0 = xOf(pt.at), x1 = xOf(pt.at + pt.dur); if (x1 < HEAD || x0 > TW) continue; const g2 = rowGeom(PL, pRows, pt.id); drawPart(ctx, pt, x0, x1, g2.y, g2.h, pt.id === selP); }
    // 덧영상 카드
    { const OL = LY.V2;
      for (const o of (D.V2 || [])) {
        const x0 = Math.max(HEAD - 2, xOf(o.at)), x1 = Math.min(TW + 2, xOf(o.at + o.dur)); if (x1 < HEAD || x0 > TW) continue;
        const yy = OL.y + 3, hh = OL.h - 6, on = o.id === selV2;
        ctx.save(); rr(ctx, x0, yy, Math.max(6, x1 - x0), hh, 5); ctx.clip();
        ctx.fillStyle = on ? 'rgba(122,162,247,.34)' : 'rgba(122,162,247,.18)'; ctx.fillRect(x0, yy, x1 - x0, hh);
        const m2 = P.media(o.media), s2 = M.get(o.media);
        if (s2 && s2.thumbs && s2.thumbs.length) { const th = s2.thumbs[Math.min(s2.thumbs.length - 1, Math.floor(o.in / (s2.thumbEvery || 1)))]; if (th) { ctx.globalAlpha = .9; try { ctx.drawImage(th, x0 + 2, yy + 2, (hh - 4) * 16 / 9, hh - 4); } catch (e) {} ctx.globalAlpha = 1; } }
        ctx.fillStyle = on ? '#dfe8ff' : '#aebde0'; ctx.font = '600 10.5px Pretendard, sans-serif'; ctx.textBaseline = 'middle';
        ctx.fillText('⧉ ' + (m2 ? m2.name : '') , x0 + (hh - 4) * 16 / 9 + 8, yy + hh / 2 + .5);
        ctx.restore();
        if (on) { ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; rr(ctx, x0 + .75, yy + .75, Math.max(6, x1 - x0) - 1.5, hh - 1.5, 5); ctx.stroke(); }
      }
    }
    // 음악 카드 + 비트 마커
    const A2L = LY.A2, tot0 = P.total();
    for (const a of D.A2) { const x0 = xOf(a.at), x1 = xOf(a.at + a.out - a.in); if (x1 < HEAD || x0 > TW) continue; drawMusic(ctx, a, x0, x1, A2L.y + 4, A2L.h - 8, a.id === selA2, tot0); }
    if (beatSnap && pxf >= 0.6) { const bts = beatFrames(); ctx.strokeStyle = 'rgba(217,182,92,.22)'; ctx.lineWidth = 1; for (const b of bts) { const x = Math.round(xOf(b)) + .5; if (x < HEAD || x > TW) continue; ctx.beginPath(); ctx.moveTo(x, V.y + 4); ctx.lineTo(x, V.y + V.h - 4); ctx.stroke(); } }
    // 끝 표시
    const tot = P.total();
    if (tot) { const xe = Math.round(xOf(tot)) + 0.5; if (xe > HEAD && xe < TW) { ctx.strokeStyle = '#3a4a70'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(xe, RULER); ctx.lineTo(xe, TH); ctx.stroke(); ctx.setLineDash([]); } }
    // 마커 (눈금자 위 마름모 + 세로 점선)
    for (const mk of D.markers || []) {
      const x = Math.round(xOf(mk.at)) + .5; if (x < HEAD || x > TW) continue;
      const on = mk.id === selM;
      ctx.strokeStyle = on ? GOLD : 'rgba(217,182,92,.35)'; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(x, RULER); ctx.lineTo(x, TH); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = on ? '#fff' : GOLD; ctx.beginPath(); ctx.moveTo(x, RULER - 13); ctx.lineTo(x + 5, RULER - 8); ctx.lineTo(x, RULER - 3); ctx.lineTo(x - 5, RULER - 8); ctx.closePath(); ctx.fill();
      if (mk.text) { ctx.font = '600 10px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; const tw = Math.min(140, ctx.measureText(mk.text).width + 8); ctx.fillStyle = 'rgba(217,182,92,.85)'; rr(ctx, x + 7, RULER - 15, tw, 13, 3); ctx.fill(); ctx.fillStyle = '#1a1408'; ctx.fillText(mk.text, x + 11, RULER - 8.5, tw - 8); }
    }
    // 라쏘 상자
    if (drag && drag.type === 'lasso') {
      const rx0 = Math.min(drag.x0, drag.x), ry0 = Math.min(drag.y0, drag.y), rw2 = Math.abs(drag.x - drag.x0), rh2 = Math.abs(drag.y - drag.y0);
      ctx.fillStyle = 'rgba(217,182,92,.07)'; ctx.fillRect(rx0, ry0, rw2, rh2);
      ctx.strokeStyle = GOLD; ctx.setLineDash([4, 3]); ctx.strokeRect(rx0 + .5, ry0 + .5, rw2, rh2); ctx.setLineDash([]);
    }
    // 머리(레인 이름)
    ctx.fillStyle = '#0c111c'; ctx.fillRect(0, 0, HEAD, TH); ctx.fillStyle = '#1e2740'; ctx.fillRect(HEAD - 1, 0, 1, TH); ctx.fillRect(0, RULER - 1, HEAD, 1);
    ctx.textAlign = 'left';
    LANES.forEach(l => { const L = LY[l.k]; ctx.fillStyle = l.off ? '#3f4a66' : (l.k === 'V' ? GOLD : '#aab5cf'); ctx.font = (l.k === 'V' ? '700 ' : '600 ') + '11px Pretendard, sans-serif'; ctx.fillText(l.k, 8, L.y + L.h / 2 - (l.off ? 0 : 6)); if (!l.off) { ctx.fillStyle = '#5c6884'; ctx.font = '10px Pretendard, sans-serif'; ctx.fillText(l.label, 8, L.y + L.h / 2 + 7); } });
    dirty = false;
  }

  function drawClip(ctx, c, x0, x1, y, h, selected) {
    if (c.gap) {                                        // 빈 자리(리프트) — 어두운 빗금 + 라벨
      const vg0 = Math.max(x0, HEAD), vg1 = Math.min(x1, TW); if (vg1 - vg0 < 1) return;
      const w = x1 - x0;
      ctx.save(); rr(ctx, x0, y, w, h, 5); ctx.clip();
      ctx.fillStyle = selected ? '#161d30' : '#0f1524'; ctx.fillRect(x0, y, w, h);
      ctx.strokeStyle = 'rgba(143,155,183,.14)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let xx = vg0 - h; xx < vg1; xx += 10) { ctx.moveTo(xx, y + h); ctx.lineTo(xx + h, y); }
      ctx.stroke();
      if (vg1 - vg0 > 40) { ctx.fillStyle = selected ? GOLD : '#5c6884'; ctx.font = '600 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('빈 자리', vg0 + 6, y + h / 2 + .5, Math.max(10, vg1 - vg0 - 10)); }
      ctx.restore();
      rr(ctx, x0 + .5, y + .5, w - 1, h - 1, 5); ctx.setLineDash([4, 3]); ctx.strokeStyle = selected ? GOLD : '#2c3a5c'; ctx.lineWidth = selected ? 2 : 1; ctx.stroke(); ctx.setLineDash([]);
      return;
    }
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
    if (sp.badge) label = sp.badge + (c.ramp && c.ramp !== 'none' ? '↗' : '') + ' · ' + label;
    if (c.denoise) label = '🔇 ' + label;
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

  let delChip = null;                                     // 선택 카드의 ✕ 삭제 칩 {x,y,r,kind,id}
  function drawDelChip(ctx, x1, y0, kind, id) {
    const r = COARSE ? 11 : 8, cx2 = Math.min(TW - r - 2, Math.max(HEAD + r + 2, x1 - r - 3)), cy2 = y0 + r + 2;
    ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20,24,36,0.92)'; ctx.fill();
    ctx.strokeStyle = '#e5484d'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = '#ff8f95'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const a = r * 0.42; ctx.beginPath(); ctx.moveTo(cx2 - a, cy2 - a); ctx.lineTo(cx2 + a, cy2 + a); ctx.moveTo(cx2 + a, cy2 - a); ctx.lineTo(cx2 - a, cy2 + a); ctx.stroke();
    delChip = { x: cx2, y: cy2, r: r + (COARSE ? 6 : 3), kind, id };
  }
  function draw() {
    if (!TW) return;
    if (dirty) drawStatic();
    const ctx = tctx; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(sc, 0, 0); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // 선택 카드 삭제 칩 (터치엔 Del 키가 없다)
    delChip = null;
    if (!drag && !playing) {
      if (selP) { const pt = P.part(selP); if (pt) { const ri = laneRows(P.data.P, c2 => c2.at + c2.dur), g2 = rowGeom(LY.P, ri, pt.id); drawDelChip(ctx, xOf(pt.at + pt.dur), g2.y, 'P', pt.id); } }
      else if (selS) { const sc2 = P.subtitle(selS); if (sc2) { const ri = laneRows(P.data.S, c2 => c2.at + c2.dur), g2 = rowGeom(LY.S, ri, sc2.id); drawDelChip(ctx, xOf(sc2.at + sc2.dur), g2.y, 'S', sc2.id); } }
      else if (selV2) { const o = P.v2(selV2); if (o) drawDelChip(ctx, xOf(o.at + o.dur), LY.V2.y + 3, 'V2', o.id); }
      else if (selA2) { const a = P.a2(selA2); if (a) drawDelChip(ctx, xOf(a.at + a.out - a.in), LY.A2.y + 4, 'A2', a.id); }
    }
    // 드래그 안내
    if (drag && drag.type === 'move' && drag.moved) {
      const ins = drag.insert, D = P.data;
      const xi = ins < D.V.length ? xOf(D.V[ins].at) : xOf(P.total());
      ctx.fillStyle = GOLD; ctx.fillRect(Math.round(xi) - 1.5, LY.V.y, 3, LY.V.h);
      const gw = drag.ids.reduce((w, id) => { const c = P.clip(id); return w + (c ? c.dur : 0); }, 0) * pxf;
      ctx.globalAlpha = .35; ctx.fillStyle = '#6f8fd0'; rr(ctx, drag.x - drag.grab, LY.V.y + 4, Math.max(8, gw), LY.V.h - 8, 5); ctx.fill(); ctx.globalAlpha = 1;
      if (drag.ids.length > 1) { ctx.fillStyle = GOLD; ctx.font = '700 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText(drag.ids.length + '개', drag.x - drag.grab + 6, LY.V.y + 14); }
    }
    if (drag && drag.type === 'slip') { const c = drag.clip, x0 = xOf(c.at), x1 = xOf(c.at + c.dur); ctx.fillStyle = 'rgba(217,182,92,.14)'; ctx.fillRect(Math.max(HEAD, x0), LY.V.y + 4, Math.min(TW, x1) - Math.max(HEAD, x0), LY.V.h - 8); ctx.fillStyle = GOLD; ctx.font = '700 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('⇄ 슬립 ' + tc(Math.round(c.in * FPS / P.media(c.media).fps)) + ' → ' + tc(Math.round(c.out * FPS / P.media(c.media).fps)), Math.max(HEAD, x0) + 6, LY.V.y + LY.V.h - 12); }
    if (drag && drag.type === 'roll') { const c = P.clip(drag.prevId); if (c) { const x = Math.round(xOf(c.at + c.dur)) + .5; ctx.fillStyle = GOLD; rr(ctx, x - 4, LY.V.y + 4, 8, LY.V.h - 8, 3); ctx.fill(); ctx.fillStyle = '#1a1408'; ctx.fillRect(x - 1.5, LY.V.y + 12, 1, LY.V.h - 24); ctx.fillRect(x + .5, LY.V.y + 12, 1, LY.V.h - 24); ctx.fillStyle = GOLD; ctx.font = '700 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('⇹ 롤 ' + tc(c.at + c.dur), x + 8, LY.V.y + LY.V.h - 12); } }
    if (drag && drag.type === 'slide') { const c = drag.clip, x0 = xOf(c.at), x1 = xOf(c.at + c.dur); ctx.fillStyle = 'rgba(217,182,92,.14)'; ctx.fillRect(Math.max(HEAD, x0), LY.V.y + 4, Math.min(TW, x1) - Math.max(HEAD, x0), LY.V.h - 8); ctx.fillStyle = GOLD; ctx.font = '700 11px Pretendard, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillText('⇆ 슬라이드 ' + tc(c.at), Math.max(HEAD, x0) + 6, LY.V.y + LY.V.h - 12); }
    // 호버 트림 손잡이
    const hv = (drag && /^(trim|atrim|strim|ptrim|mtrim|v2trim)$/.test(drag.type)) ? { kind: { trim: 'V', atrim: 'A1', strim: 'S', ptrim: 'P', mtrim: 'A2', v2trim: 'V2' }[drag.type], clip: drag.clip, s: drag.s, pt: drag.pt, a2: drag.a2, o: drag.o, edge: drag.side } : hover;
    if (hv && hv.edge && /^(V|A1|S|P|A2|V2)$/.test(hv.kind)) {
      const L = LY[hv.kind]; let x0, x1;
      if (hv.kind === 'V') { x0 = xOf(hv.clip.at); x1 = xOf(hv.clip.at + hv.clip.dur); }
      else if (hv.kind === 'S') { x0 = xOf(hv.s.at); x1 = xOf(hv.s.at + hv.s.dur); }
      else if (hv.kind === 'P') { x0 = xOf(hv.pt.at); x1 = xOf(hv.pt.at + hv.pt.dur); }
      else if (hv.kind === 'A2') { x0 = xOf(hv.a2.at); x1 = xOf(hv.a2.at + hv.a2.out - hv.a2.in); }
      else if (hv.kind === 'V2') { x0 = xOf(hv.o.at); x1 = xOf(hv.o.at + hv.o.dur); }
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
    if (y < RULER) { const mks = P.data.markers || []; for (let i = mks.length - 1; i >= 0; i--) { if (Math.abs(xOf(mks[i].at) - x) <= 7) return { kind: 'marker', mk: mks[i] }; } return { kind: 'ruler' }; }
    const lane = laneAt(y);
    if (lane === 'V') for (const c of P.data.V) { const x0 = xOf(c.at), x1 = xOf(c.at + c.dur); if (x >= x0 && x < x1) { const ez = Math.min(COARSE ? 16 : 9, (x1 - x0) / 3); return { kind: 'V', clip: c, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } }
    const inRow = (L, ri, id) => { const g2 = rowGeom(L, ri, id); return y >= g2.y - 2 && y <= g2.y + g2.h + 2; };
    if (lane === 'S') { const ri = laneRows(P.data.S, c2 => c2.at + c2.dur); for (let i = P.data.S.length - 1; i >= 0; i--) { const sc2 = P.data.S[i], x0 = xOf(sc2.at), x1 = xOf(sc2.at + sc2.dur); if (x >= x0 && x < x1 && inRow(LY.S, ri, sc2.id)) { const ez = Math.min(COARSE ? 16 : 9, (x1 - x0) / 3); return { kind: 'S', s: sc2, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } } }
    if (lane === 'P') { const arr = P.data.P, ri = laneRows(arr, c2 => c2.at + c2.dur); for (let i = arr.length - 1; i >= 0; i--) { const pt = arr[i], x0 = xOf(pt.at), x1 = xOf(pt.at + pt.dur); if (x >= x0 && x < x1 && inRow(LY.P, ri, pt.id)) { const ez = Math.min(COARSE ? 16 : 9, (x1 - x0) / 3); return { kind: 'P', pt, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } } }
    if (lane === 'V2') { const arr = P.data.V2 || []; for (let i = arr.length - 1; i >= 0; i--) { const o = arr[i], x0 = xOf(o.at), x1 = xOf(o.at + o.dur); if (x >= x0 && x < x1) { const ez = Math.min(COARSE ? 16 : 9, (x1 - x0) / 3); return { kind: 'V2', o, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } } }
    if (lane === 'A2') { const arr = P.data.A2; for (let i = arr.length - 1; i >= 0; i--) { const a = arr[i], x0 = xOf(a.at), x1 = xOf(a.at + a.out - a.in); if (x >= x0 && x < x1) { const ez = Math.min(COARSE ? 16 : 9, (x1 - x0) / 3); return { kind: 'A2', a2: a, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } } }
    if (lane === 'A1') for (const a of P.data.A1) { const x0 = xOf(a.at), x1 = xOf(a.at + a.dur); if (x >= x0 && x < x1) { const ez = Math.min(COARSE ? 16 : 9, (x1 - x0) / 3); return { kind: 'A1', clip: P.clip(a.clip), a, edge: x - x0 < ez ? 'in' : x1 - x <= ez ? 'out' : null }; } }
    return { kind: 'lane', lane };
  }
  function pos(e) { const r = tl.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  /* 스냅: 타임라인 프레임 f 를 후보(플레이헤드·편집점)에 7px 안이면 붙인다 */
  function snapFrame(f, extra, noPH) {
    if (!snap) return { f, x: null };
    const cands = (noPH ? [] : [ph]).concat(P.edges()).concat(P.markerFrames()).concat(extra || []).concat(beatSnap ? beatFrames() : []);
    let best = f, bd = 7 / pxf, sx = null;
    for (const c of cands) { const d = Math.abs(c - f); if (d < bd) { bd = d; best = c; sx = xOf(c); } }
    return { f: best, x: sx };
  }

  /* 같은 레인의 다른 카드 가장자리 — 자석 스냅 후보 */
  function laneEdges(kind, exceptId) {
    const out = [];
    if (kind === 'P') for (const p of P.data.P) { if (p.id !== exceptId) out.push(p.at, p.at + p.dur); }
    else if (kind === 'S') for (const t of P.data.S) { if (t.id !== exceptId) out.push(t.at, t.at + t.dur); }
    else if (kind === 'A2') for (const a of P.data.A2) { if (a.id !== exceptId) out.push(a.at, a.at + a.out - a.in); }
    else if (kind === 'V2') for (const o of (P.data.V2 || [])) { if (o.id !== exceptId) out.push(o.at, o.at + o.dur); }
    return out;
  }
  /* 카드 이동 스냅 — 시작·끝 양쪽을 재서 더 가까운 쪽으로 붙는다 (앞 카드 뒤에 딱 맞춰 붙기) */
  function snapSpan(at, dur, extra) {
    const a = snapFrame(at, extra), b = snapFrame(at + dur, extra);
    const da = a.x == null ? Infinity : Math.abs(a.f - at), db = b.x == null ? Infinity : Math.abs(b.f - at - dur);
    return db < da ? { f: b.f - dur, x: b.x } : { f: a.f, x: a.x };
  }

  /* ---------- 마우스 ---------- */
  /* 태블릿·터치: 포인터 이벤트로 통일. 손가락 두 개는 핀치 줌 */
  const tlPtrs = new Map(); let pinch = null;
  const COARSE = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  tl.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    tlPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { tl.setPointerCapture(e.pointerId); } catch (e2) {}
    if (tlPtrs.size === 2) {                              // 두 손가락 → 진행 중 드래그 취소, 핀치 시작
      const [a, b] = [...tlPtrs.values()];
      if (drag && drag.type === 'scrub' && !playing && !shuttle) setRScale(1);   // 스크럽 중이던 반해상도 복귀
      drag = null; tl.style.cursor = 'default';
      const r = tl.getBoundingClientRect(), midX = (a.x + b.x) / 2 - r.left;
      pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y), pxf0: pxf, midX };
      return;
    }
    if (pinch) return;
    { const { x: cx3, y: cy3 } = pos(e);
      if (delChip && Math.hypot(cx3 - delChip.x, cy3 - delChip.y) <= delChip.r) {
        stop();
        const k = delChip.kind, id = delChip.id; delChip = null;
        if (k === 'P') { P.removeP(id); selectP(null); }
        else if (k === 'S') { P.removeS(id); selectS(null); }
        else if (k === 'V2') { P.removeV2(id); selectV2(null); }
        else if (k === 'A2') { P.removeA2(id); selectA2(null); }
        setPH(ph); toast('지웠어요 (Ctrl+Z / ↩︎ 로 되돌려요)', 1400);
        return;
      }
    }
    const { x, y } = pos(e); if (x < HEAD) return;
    stop(); showStage('tl');
    const h = hitTest(x, y);
    if (h.kind === 'marker') { selectMarker(h.mk.id); P.commit(); drag = { type: 'mkmove', mk: h.mk, x0: x, orig: { at: h.mk.at } }; setPH(h.mk.at, { noScroll: true }); return; }
    if (h.kind === 'lane' && e.shiftKey) {              // Shift+빈 곳 드래그 = 라쏘 (V 클립 다중 선택)
      selectS(null); selectP(null); selectA2(null); selectV2(null); selectMarker(null);
      drag = { type: 'lasso', x0: x, y0: y, x, y }; tl.style.cursor = 'crosshair'; dirty = true; draw(); return;
    }
    if (h.kind === 'ruler' || h.kind === 'lane') { if (h.kind === 'lane') { select(null); selectS(null); selectP(null); selectA2(null); selectV2(null); } selectMarker(null); drag = { type: 'scrub' }; setRScale(0.5); tl.style.cursor = 'grabbing'; setPH(frameOf(x), { noScroll: true }); return; }
    if (h.kind === 'V2') {
      selectV2(h.o.id); P.commit();
      if (h.edge) drag = { type: 'v2trim', o: h.o, side: h.edge, x0: x, orig: { at: h.o.at, in: h.o.in, out: h.o.out, dur: h.o.dur } };
      else drag = { type: 'v2move', o: h.o, x0: x, orig: { at: h.o.at, dur: h.o.dur } };
      return;
    }
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
    selectS(null); selectP(null); selectA2(null); selectMarker(null);
    const ctrl = e.ctrlKey || e.metaKey;
    if (h.edge && ctrl && h.kind === 'V') {                 // Ctrl+가장자리 = 롤 (편집점 이동). 양쪽에 클립이 있어야 한다
      const i = P.clipIndex(h.clip.id), prev = h.edge === 'out' ? h.clip : P.data.V[i - 1];
      if (prev && P.clipIndex(prev.id) + 1 < P.data.V.length) {
        select(prev.id); P.commit();
        drag = { type: 'roll', prevId: prev.id, x0: x, orig: { edge: prev.at + prev.dur } }; previewJob++; return;
      }
    }
    if (h.edge) {
      select(h.clip.id);
      const a = h.kind === 'A1' ? h.a : null;
      const audioOnly = h.kind === 'A1' && (e.altKey || !a.linked) && h.clip.speed === 'normal' && !h.clip.freeze;
      P.commit();
      if (audioOnly) drag = { type: 'atrim', clip: h.clip, side: h.edge, x0: x, orig: { in: a.in, out: a.out } };
      else drag = { type: 'trim', clip: h.clip, side: h.edge, x0: x, orig: { in: h.clip.in, out: h.clip.out, dur: h.clip.dur } };
      previewJob++;
      return;
    }
    if (ctrl && e.altKey && h.kind === 'V') {           // Ctrl+Alt+몸통 = 슬라이드 (자리만 밀기 — 양옆이 받는다)
      const i = P.clipIndex(h.clip.id);
      if (i > 0 && i + 1 < P.data.V.length) {
        select(h.clip.id); P.commit();
        drag = { type: 'slide', clip: h.clip, x0: x, orig: { at: h.clip.at } }; previewJob++; return;
      }
      toast('슬라이드는 양옆에 클립이 있어야 해요', 1600); return;
    }
    if (e.altKey && h.kind === 'V' && !h.clip.gap && P.media(h.clip.media).kind !== 'image') {   // Alt+몸통 = 슬립
      select(h.clip.id); P.commit();
      drag = { type: 'slip', clip: h.clip, x0: x, orig: { in: h.clip.in, out: h.clip.out } }; previewJob++; return;
    }
    if (e.shiftKey) select(h.clip.id, 'range'); else if (ctrl) select(h.clip.id, 'toggle'); else if (!selSet.has(h.clip.id)) select(h.clip.id); else { sel = h.clip.id; refreshPanel(); }
    if (!selSet.has(h.clip.id)) return;
    const ids = P.data.V.filter(c => selSet.has(c.id)).map(c => c.id);
    const first = P.clip(ids[0]);
    drag = { type: 'move', clip: h.clip, ids, x0: x, x, grab: x - xOf(first.at), moved: false, insert: P.clipIndex(ids[0]), shiftCtrl: e.shiftKey || ctrl };
  });
  window.addEventListener('pointermove', e => {
    if (tlPtrs.has(e.pointerId)) tlPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch) { if (tlPtrs.size >= 2) { const [a, b] = [...tlPtrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > 8) setZoom(pinch.pxf0 * d / pinch.d0, pinch.midX); } return; }
    const { x, y } = pos(e);
    if (!drag) {
      const h = hitTest(x, y);
      const hid = hv => hv ? (hv.kind === 'S' ? hv.s.id : hv.kind === 'P' ? hv.pt.id : hv.kind === 'A2' ? hv.a2.id : hv.kind === 'V2' ? hv.o.id : hv.clip.id) : undefined;
      const hname = hv => hv.kind === 'S' ? SB.plain(hv.s.text) : hv.kind === 'P' ? PT.label(hv.pt) : hv.kind === 'A2' ? '♪ ' + P.media(hv.a2.media).name : hv.kind === 'V2' ? '⧉ ' + P.media(hv.o.media).name : hv.clip.gap ? '빈 자리' : P.media(hv.clip.media).name;
      const prevEdge = hover && hover.edge, prevClip = hid(hover);
      hover = /^(V|A1|S|P|A2|V2)$/.test(h.kind) ? h : null;
      const phNear = Math.abs(x - xOf(ph)) <= (COARSE ? 11 : 5) && x >= HEAD;
      tl.style.cursor = h.kind === 'marker' ? 'pointer' : hover && hover.edge ? ((e.ctrlKey || e.metaKey) && hover.kind === 'V' ? 'col-resize' : 'ew-resize') : phNear ? 'grab' : hover ? (e.altKey && hover.kind === 'V' ? 'move' : 'grab') : (x >= HEAD ? (e.shiftKey ? 'crosshair' : 'text') : 'default');
      if (x >= HEAD && y >= 0 && y <= TH) $('hover').textContent = tc(Math.max(0, frameOf(x))) + (hover ? ' · ' + hname(hover) : ''); else $('hover').textContent = '';
      const curId = hid(hover);
      if ((hover && hover.edge) !== prevEdge || curId !== prevClip) draw();
      return;
    }
    if (drag.type === 'scrub') {
      drag.px = x;
      if (!drag.raf) drag.raf = requestAnimationFrame(() => { if (drag && drag.type === 'scrub') { drag.raf = 0; setPH(frameOf(drag.px), { noScroll: true }); } });
      return;
    }
    if (drag.type === 'mkmove') { const sn = snapFrame(drag.orig.at + (x - drag.x0) / pxf, [], true); drag.snapX = sn.x; P.updateMarker(drag.mk.id, { at: Math.max(0, sn.f) }); setPH(P.marker(drag.mk.id).at, { noScroll: true }); return; }
    if (drag.type === 'lasso') {
      drag.x = x; drag.y = y;
      const rx0 = Math.min(drag.x0, x), rx1 = Math.max(drag.x0, x), ry0 = Math.min(drag.y0, y), ry1 = Math.max(drag.y0, y);
      const VL = LY.V, hitV = ry0 <= VL.y + VL.h && ry1 >= VL.y;
      selSet.clear(); sel = null;
      if (hitV) for (const c2 of P.data.V) { const cx0 = xOf(c2.at), cx1 = xOf(c2.at + c2.dur); if (cx1 >= rx0 && cx0 <= rx1) { selSet.add(c2.id); if (!sel) sel = c2.id; } }
      dirty = true; draw(); return;
    }
    if (drag.type === 'slide') {
      const c2 = drag.clip, target = drag.orig.at + (x - drag.x0) / pxf;
      P.slide(c2.id, target - c2.at, { commit: false });
      const i = P.clipIndex(c2.id), pv = P.data.V[i - 1], nx = P.data.V[i + 1];
      if (pv && nx && !pv.gap && !nx.gap) drawTwoUp(pv.media, pv.freeze ? pv.in : pv.out - 1, nx.media, nx.in, '앞 클립 끝', '뒤 클립 시작');
      return;
    }
    if (drag.type === 'slip') {
      const c = drag.clip, m = P.media(c.media), k = m.fps / FPS * P.SPEED[c.speed].f;
      const target = drag.orig.in - (x - drag.x0) / pxf * k;      // 오른쪽으로 끌면 앞 내용이 보인다(프리미어)
      P.slip(c.id, target - c.in, { commit: false });
      drawTwoUp(c.media, c.in, c.media, c.out - 1, '시작', '끝');
      return;
    }
    if (drag.type === 'roll') {
      const prev = P.clip(drag.prevId); if (!prev) return;
      let target = drag.orig.edge + (x - drag.x0) / pxf;
      drag.snapX = null;
      if (snap) { const sn = snapFrame(target, [], true); if (sn.x != null) { target = sn.f; drag.snapX = sn.x; } }
      P.roll(prev.id, target - (prev.at + prev.dur), { commit: false });
      const nx = P.data.V[P.clipIndex(prev.id) + 1];
      if (nx) drawTwoUp(prev.media, prev.freeze ? prev.in : prev.out - 1, nx.media, nx.in, '앞 클립 끝', '뒤 클립 시작');
      return;
    }
    if (drag.type === 'v2move' || drag.type === 'v2trim') {
      const o = drag.o, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'v2move') { const sn = snapSpan(drag.orig.at + dtl, drag.orig.dur, laneEdges('V2', o.id)); drag.snapX = sn.x; P.updateV2(o.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else {
        const edge0 = drag.side === 'in' ? drag.orig.at : drag.orig.at + drag.orig.dur;
        const sn = snapFrame(edge0 + dtl, laneEdges('V2', o.id)); drag.snapX = sn.x;
        const cur = drag.side === 'in' ? o.at : o.at + o.dur;
        P.trimV2(o.id, drag.side, sn.f - cur, { commit: false });
      }
      dirty = true; uiRefresh(); return;
    }
    if (drag.type === 'pmove' || drag.type === 'ptrim') {
      const d = drag.pt, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'pmove') { const sn = snapSpan(drag.orig.at + dtl, drag.orig.dur, laneEdges('P', d.id)); drag.snapX = sn.x; P.updateP(d.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else if (drag.side === 'in') { const sn = snapFrame(drag.orig.at + dtl, laneEdges('P', d.id)); drag.snapX = sn.x; const at = clamp(sn.f, 0, drag.orig.at + drag.orig.dur - 10); P.updateP(d.id, { at, dur: drag.orig.at + drag.orig.dur - at }, { commit: false }); }
      else { const sn = snapFrame(drag.orig.at + drag.orig.dur + dtl, laneEdges('P', d.id)); drag.snapX = sn.x; P.updateP(d.id, { dur: Math.max(10, sn.f - drag.orig.at) }, { commit: false }); }
      renderPreview(); return;
    }
    if (drag.type === 'mmove' || drag.type === 'mtrim') {
      const d = drag.a2, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'mmove') { const sn = snapSpan(drag.orig.at + dtl, drag.orig.out - drag.orig.in, laneEdges('A2', d.id)); drag.snapX = sn.x; P.updateA2(d.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else if (drag.side === 'in') { const sn = snapFrame(drag.orig.at + dtl); drag.snapX = sn.x; P.updateA2(d.id, { at: drag.orig.at, in: drag.orig.in, out: drag.orig.out }, { commit: false }); P.trimA2(d.id, 'in', sn.f, { commit: false }); }
      else { const sn = snapFrame(drag.orig.at + (drag.orig.out - drag.orig.in) + dtl); drag.snapX = sn.x; P.updateA2(d.id, { out: drag.orig.out }, { commit: false }); P.trimA2(d.id, 'out', sn.f, { commit: false }); }
      return;
    }
    if (drag.type === 'smove' || drag.type === 'strim') {
      const d = drag.s, dtl = (x - drag.x0) / pxf;
      if (drag.type === 'smove') { const sn = snapSpan(drag.orig.at + dtl, drag.orig.dur, laneEdges('S', d.id)); drag.snapX = sn.x; P.updateS(d.id, { at: Math.max(0, sn.f) }, { commit: false }); }
      else if (drag.side === 'in') { const sn = snapFrame(drag.orig.at + dtl, laneEdges('S', d.id)); drag.snapX = sn.x; const at = clamp(sn.f, 0, drag.orig.at + drag.orig.dur - 5); P.updateS(d.id, { at, dur: drag.orig.at + drag.orig.dur - at }, { commit: false }); }
      else { const sn = snapFrame(drag.orig.at + drag.orig.dur + dtl, laneEdges('S', d.id)); drag.snapX = sn.x; P.updateS(d.id, { dur: Math.max(5, sn.f - drag.orig.at) }, { commit: false }); }
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
  const tlPtrUp = e => {
    if (e && e.pointerId != null) tlPtrs.delete(e.pointerId);
    if (pinch && tlPtrs.size < 2) pinch = null;
    if (!drag) return;
    const d = drag; drag = null; tl.style.cursor = 'default';
    if (d && d.type === 'scrub') { if (d.raf) { cancelAnimationFrame(d.raf); if (d.px != null) ph = clamp(Math.round(frameOf(d.px)), 0, Math.max(0, P.total() - 1)); } if (!playing && !shuttle) setRScale(1); setPH(ph, { noScroll: true }); }
    if (d.type === 'move' && d.moved) P.moveClips(d.ids, d.insert);
    else if (d.type === 'move' && d.ids.length > 1 && !d.shiftCtrl) select(d.clip.id);   // 여러 개 중 하나를 그냥 클릭 → 그것만
    if (d.type === 'mkmove') { dirty = true; refreshMarkerList(); }
    if (d.type === 'lasso') { dirty = true; refreshPanel(); uiRefresh(); }
    if (/^(trim|atrim|strim|smove|ptrim|pmove|mtrim|mmove|slip|roll|slide|v2move|v2trim)$/.test(d.type)) { dirty = true; uiRefresh(); if (d.type === 'strim' || d.type === 'smove') refreshSubPanel(); if (d.type === 'ptrim' || d.type === 'pmove') refreshPartPanel(); if (d.type === 'mtrim' || d.type === 'mmove') refreshMusicPanel(); if (d.type === 'v2move' || d.type === 'v2trim') refreshV2Panel(); }
    draw();
  };
  window.addEventListener('pointerup', tlPtrUp);
  window.addEventListener('pointercancel', tlPtrUp);
  tl.addEventListener('mouseleave', () => { if (!drag) { hover = null; $('hover').textContent = ''; draw(); } });
  tl.addEventListener('wheel', e => {
    e.preventDefault(); const { x } = pos(e);
    if (e.ctrlKey || e.metaKey) setZoom(pxf * (e.deltaY < 0 ? 1.18 : 1 / 1.18), x);
    else { scrollF += (e.deltaX || e.deltaY) / pxf * 0.8; clampScroll(); dirty = true; draw(); }
  }, { passive: false });
  tl.addEventListener('dblclick', e => { const { x, y } = pos(e); const h = hitTest(x, y); if (h.kind === 'marker') { renameMarker(h.mk.id); return; } if (h.kind === 'V' || h.kind === 'A1') { setPH(h.clip.at); } if (h.kind === 'S') { setPH(h.s.at); $('subEditText').focus(); } if (h.kind === 'P') { setPH(h.pt.at + Math.min(h.pt.dur - 1, Math.round(PT.meta(h.pt.part).thumbT * FPS))); const f = $('partFields').querySelector('input'); if (f) f.focus(); } if (h.kind === 'A2') setPH(h.a2.at); });

  /* ---------- 소스 모니터 (I/O · 3점 편집) ----------
     미디어 보관함의 원본을 스테이지에 띄워 훑고, I/O 로 구간을 잡아 플레이헤드에 삽입(,)·덮어쓰기(.)·끝에 붙인다.
     I/O 는 원본마다 기억. 소스 재생은 원본 소리 그대로(KMV_AUDIO.playSource). */
  const sb = $('srcBar'), sbctx = sb.getContext('2d');
  function showStage(mode) {
    if (mode === 'src' && !srcCur) mode = 'tl';
    if (stage === mode) { if (mode === 'src') renderSource(); return; }
    stop(); stage = mode;
    $('stage').classList.toggle('src', mode === 'src');
    $('srcBar').classList.toggle('hidden', mode !== 'src'); $('srcTools').classList.toggle('hidden', mode !== 'src');
    $('hintTL').classList.toggle('hidden', mode === 'src');
    $('tabTL').classList.toggle('on', mode === 'tl'); $('tabSrc').classList.toggle('on', mode === 'src');
    $('stageTabs').classList.toggle('hidden', !srcCur);
    if (mode === 'src') { resizeSrcBar(); renderSource(); } else { $('stageLbl').classList.add('hidden'); refreshProject(); setPH(ph); }
    refreshSrcTabs();
  }
  function openSource(mediaId) {
    const m = P.media(mediaId); if (!m || m.kind === 'audio') return;
    stop();
    const memo = srcMemo.get(mediaId) || { ph: 0, in: null, out: null };
    srcCur = { media: mediaId, ph: memo.ph, in: memo.in, out: memo.out };
    $('stageTabs').classList.remove('hidden');
    if (stage === 'src') { renderSource(); refreshSrcTabs(); drawSrcBar(); } else showStage('src');
    refreshBin();
  }
  function refreshSrcTabs() {
    if (!srcCur) { $('tabSrc').textContent = '소스'; $('srcIO').textContent = ''; return; }
    const m = P.media(srcCur.media); if (!m) { srcCur = null; return; }
    $('tabSrc').textContent = '소스 · ' + m.name;
    const io = srcRange();
    $('srcIO').textContent = (srcCur.in != null ? 'I ' + srcTc(srcCur.in) : 'I —') + ' · ' + (srcCur.out != null ? 'O ' + srcTc(srcCur.out) : 'O —') + ' · ' + secStr(Math.round((io.out - io.in) * FPS / m.fps)) + (srcCur.in == null && srcCur.out == null ? ' (전체)' : '');
    $('stageHint').textContent = stage === 'src' ? 'I/O 로 구간 · , 삽입 · . 덮어쓰기 · Esc 타임라인' : '';
  }
  function srcTc(f) { const m = P.media(srcCur.media); return tc(Math.round(f * FPS / m.fps)); }
  function srcRange() { const m = P.media(srcCur.media); const i = srcCur.in == null ? 0 : srcCur.in, o = srcCur.out == null ? m.dur : srcCur.out; return o > i ? { in: i, out: o } : { in: Math.min(i, m.dur - 1), out: Math.min(i, m.dur - 1) + 1 }; }
  function setSrcPH(f, opt) {
    if (!srcCur) return; const m = P.media(srcCur.media);
    srcCur.ph = clamp(Math.round(f), 0, m.dur - 1); srcMemo.set(srcCur.media, Object.assign({}, srcCur));
    $('tcCur').textContent = srcTc(srcCur.ph);
    if (!(opt && opt.noRender)) renderSource();
    drawSrcBar();
  }
  let srcJob = 0;
  function renderSource() {
    if (!srcCur) return; const m = P.media(srcCur.media), src = M.get(srcCur.media); if (!m) return;
    $('empty').classList.add('hidden');
    const lbl = $('stageLbl'); lbl.classList.remove('hidden'); lbl.textContent = '소스 · ' + m.name + ' · ' + srcTc(srcCur.ph) + ' / ' + tc(Math.round(m.dur * FPS / m.fps));
    $('tcCur').textContent = srcTc(srcCur.ph); $('tcTot').textContent = tc(Math.round(m.dur * FPS / m.fps));
    if (!src) return;
    const job = ++srcJob, idx = srcCur.ph, W = pv.width, H = pv.height;
    const paint = f => { pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.fillStyle = '#000'; pctx.fillRect(0, 0, W, H); M.drawFit(pctx, f, W, H, src.rot); };
    if (m.kind === 'image') { R.drawSource(pctx, W, H, m.id, 0); return; }
    const img = src.cached(idx);
    if (img) { paint(img); return; }
    const near = src.nearest(idx); if (near) paint(near);
    if (live()) return;                                       // 재생·셔틀 중엔 스트림이 채운다 — 통 디코드 금지
    src.getFrame(idx, true).then(f => { if (f && job === srcJob && stage === 'src' && srcCur && srcCur.ph === idx) paint(f); }).catch(() => {});
  }
  function playSrc() {
    if (!srcCur || srcPlaying) return; const m = P.media(srcCur.media); if (m.kind === 'image') return;
    stopShuttle();
    if (srcCur.ph >= m.dur - 1) srcCur.ph = 0;
    srcPlaying = true; shuttle = 1; $('tPlay').textContent = '❚❚ 정지';
    liveMode(true); renderSource();
    const from = srcCur.ph;
    A.playSource(m.id, from).then(() => {
      { const src = M.get(m.id); if (src && src.streamTo) src.streamTo(from); }
      cancelAnimationFrame(srcRaf);
      const loop = () => {
        if (!srcPlaying) return;
        const now = A.now(); if (now == null) { srcRaf = requestAnimationFrame(loop); return; }
        const f = Math.max(from, Math.floor(now));
        if (f >= m.dur) { srcCur.ph = m.dur - 1; stopSrc(); $('tPlay').textContent = '▶ 재생'; setSrcPH(srcCur.ph); return; }
        if (f !== srcCur.ph) { const src = M.get(m.id); if (src && src.streamTo) src.streamTo(f); setSrcPH(f); }
        srcRaf = requestAnimationFrame(loop);
      };
      srcRaf = requestAnimationFrame(loop);
    });
  }
  function stopSrc() { if (!srcPlaying) return; srcPlaying = false; shuttle = 0; A.stop(); cancelAnimationFrame(srcRaf); $('tPlay').textContent = '▶ 재생'; liveMode(false); if (srcCur) setSrcPH(srcCur.ph); }
  function srcMark(side) {
    if (stage !== 'src' || !srcCur) return toast('미디어 보관함에서 원본을 클릭해 소스 모니터를 먼저 열어요', 2000);
    const m = P.media(srcCur.media);
    if (side === 'in') { srcCur.in = srcCur.ph; if (srcCur.out != null && srcCur.out <= srcCur.in) srcCur.out = null; }
    else { srcCur.out = Math.min(m.dur, srcCur.ph + 1); if (srcCur.in != null && srcCur.in >= srcCur.out) srcCur.in = null; }
    srcMemo.set(srcCur.media, Object.assign({}, srcCur)); refreshSrcTabs(); drawSrcBar();
  }
  function srcPlace(mode) {
    if (!srcCur) return toast('미디어 보관함에서 원본을 클릭해 소스 모니터를 먼저 열어요', 2000);
    stop();
    const m = P.media(srcCur.media), r = m.kind === 'image' ? { dur: P.IMAGE_DEFAULT } : srcRange();
    const c = P.insertRange(m.id, r, mode === 'append' ? null : ph, mode);
    if (!c) return;
    select(c.id); setPH(c.at + c.dur);
    toast((mode === 'insert' ? '삽입' : mode === 'overwrite' ? '덮어쓰기' : '끝에 붙임') + ' · ' + m.name + ' ' + secStr(c.dur) + ' → ' + tc(c.at), 1800);
  }
  /* 소스 바: 필름스트립 + I/O 구간 + 플레이헤드 */
  function resizeSrcBar() { const r = sb.getBoundingClientRect(); const w = Math.max(100, Math.floor(r.width)); if (sb.width !== w * DPR) { sb.width = w * DPR; sb.height = 34 * DPR; } drawSrcBar(); }
  function drawSrcBar() {
    if (stage !== 'src' || !srcCur) return;
    const m = P.media(srcCur.media), src = M.get(srcCur.media); if (!m) return;
    const W = sb.width / DPR, H = 34, ctx = sbctx; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#0f1524'; ctx.fillRect(0, 0, W, H);
    const xf = f => f / m.dur * W;
    if (src && src.thumbs && src.thumbs.length) { const tw = Math.max(6, (H - 8) * 16 / 9); for (let x = 0; x < W; x += tw) { const th = src.thumbs[Math.floor(clamp(x / W * m.dur, 0, m.dur - 1) / src.thumbEvery)]; if (th) { try { ctx.globalAlpha = .7; ctx.drawImage(th, x, 4, tw, H - 8); ctx.globalAlpha = 1; } catch (e) {} } } }
    const r = srcRange();
    if (srcCur.in != null || srcCur.out != null) { ctx.fillStyle = 'rgba(217,182,92,.22)'; ctx.fillRect(xf(r.in), 0, Math.max(2, xf(r.out) - xf(r.in)), H); ctx.fillStyle = 'rgba(12,17,28,.55)'; ctx.fillRect(0, 0, xf(r.in), H); ctx.fillRect(xf(r.out), 0, W - xf(r.out), H); }
    ctx.fillStyle = GOLD;
    if (srcCur.in != null) { const x = xf(srcCur.in); ctx.fillRect(x, 0, 2, H); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 8, 0); ctx.lineTo(x, 8); ctx.fill(); }
    if (srcCur.out != null) { const x = xf(srcCur.out); ctx.fillRect(x - 2, 0, 2, H); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 8, 0); ctx.lineTo(x, 8); ctx.fill(); }
    const px = Math.round(xf(srcCur.ph)) + .5; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
  }
  let sbDrag = false;
  const sbFrame = e => { const r = sb.getBoundingClientRect(); const m = P.media(srcCur.media); return clamp((e.clientX - r.left) / r.width * m.dur, 0, m.dur - 1); };
  sb.addEventListener('pointerdown', e => { if (!srcCur) return; stop(); sbDrag = true; try { sb.setPointerCapture(e.pointerId); } catch (e2) {} setSrcPH(sbFrame(e)); });
  let sbRaf = 0, sbPx = 0;
  window.addEventListener('pointermove', e => { if (!sbDrag || !srcCur) return; sbPx = sbFrame(e); if (!sbRaf) sbRaf = requestAnimationFrame(() => { sbRaf = 0; if (sbDrag && srcCur) setSrcPH(sbPx); }); });
  window.addEventListener('pointerup', () => { sbDrag = false; }); window.addEventListener('pointercancel', () => { sbDrag = false; });
  new ResizeObserver(() => { if (stage === 'src') resizeSrcBar(); }).observe(sb.parentElement);

  /* 두 화면 미리보기 — 슬립(시작·끝)·롤(앞 끝·뒤 시작). 왼쪽·오른쪽 각각 원본 프레임 하나 */
  let twoJob = 0;
  function drawTwoUp(mediaA, idxA, mediaB, idxB, labelA, labelB) {
    const job = ++twoJob;
    pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.fillStyle = '#000'; pctx.fillRect(0, 0, PW, PH);
    const half = [[mediaA, idxA, 0, labelA], [mediaB, idxB, PW / 2, labelB]];
    const paint = (src, img, x) => { pctx.save(); pctx.setTransform(1, 0, 0, 1, x, PH / 4); M.drawFit(pctx, img, PW / 2, PH / 2, src.rot); pctx.restore(); };
    const label = (x, txt, f, m) => { pctx.setTransform(1, 0, 0, 1, 0, 0); pctx.fillStyle = 'rgba(8,14,30,.75)'; pctx.fillRect(x + 20, PH * 3 / 4 + 20, 420, 48); pctx.fillStyle = GOLD; pctx.font = '700 28px Pretendard, sans-serif'; pctx.textBaseline = 'middle'; pctx.fillText(txt + ' · ' + tc(Math.round(f * FPS / m.fps)), x + 36, PH * 3 / 4 + 44); };
    pctx.fillStyle = '#243050'; pctx.fillRect(PW / 2 - 2, 0, 4, PH);
    half.forEach(([mid, idx, x, lb]) => {
      const src = M.get(mid), m = P.media(mid); if (!src || !m) return;
      let img = src.cached(idx) || src.nearest(idx); if (img) paint(src, img, x); label(x, lb, idx, m);
      if (!src.cached(idx)) src.getFrame(idx, true).then(f => { if (f && job === twoJob && drag) { paint(src, f, x); label(x, lb, idx, m); } }).catch(() => {});
    });
  }

  /* ---------- 선택·편집 동작 ---------- */
  /* mode: 없음=단일 · 'toggle'=Ctrl · 'range'=Shift(기준 클립부터) · 'all' */
  function select(id, mode) {
    if (mode === 'all') { selSet.clear(); P.data.V.forEach(c => selSet.add(c.id)); sel = P.data.V.length ? P.data.V[0].id : null; }
    else if (mode === 'toggle' && id) { if (selSet.has(id)) { selSet.delete(id); if (sel === id) sel = selSet.size ? [...selSet][selSet.size - 1] : null; } else { selSet.add(id); sel = id; } }
    else if (mode === 'range' && id) { const V = P.data.V, i0 = sel ? P.clipIndex(sel) : -1, i1 = P.clipIndex(id); if (i0 < 0) { selSet.clear(); selSet.add(id); sel = id; } else { for (let i = Math.min(i0, i1); i <= Math.max(i0, i1); i++) selSet.add(V[i].id); } }
    else { if (sel === id && selSet.size === (id ? 1 : 0)) return; selSet.clear(); if (id) selSet.add(id); sel = id; }
    dirty = true; draw(); refreshPanel(); refreshMontPanel();
  }
  function selectMarker(id) { if (selM === id) return; selM = id; dirty = true; draw(); refreshMarkerList(); }
  function selectedIds() { return P.data.V.filter(c => selSet.has(c.id)).map(c => c.id); }
  function selectS(id) { if (selS === id) return; selS = id; dirty = true; draw(); refreshSubPanel(); }
  function selectP(id) { if (selP === id) return; selP = id; dirty = true; draw(); refreshPartPanel(); }
  function selectA2(id) { if (selA2 === id) return; selA2 = id; dirty = true; draw(); refreshMusicPanel(); }
  function selectV2(id) { if (selV2 === id) return; selV2 = id; if (id) { select(null); selectS(null); selectP(null); selectA2(null); } dirty = true; draw(); refreshV2Panel(); }
  function selClip() { return sel ? P.clip(sel) : null; }
  function doSplit() { stop(); const c2 = P.split(ph); if (c2) select(c2.id); else toast('여기선 나눌 게 없어요 — 플레이헤드를 클립 안쪽으로'); }
  function doDelete() {
    stop();
    if (selS) { P.removeS(selS); selectS(null); setPH(ph); return; }
    if (selP) { P.removeP(selP); selectP(null); setPH(ph); return; }
    if (selA2) { P.removeA2(selA2); selectA2(null); setPH(ph); return; }
    if (selV2) { P.removeV2(selV2); selectV2(null); setPH(ph); return; }
    if (selM) { P.removeMarker(selM); selectMarker(null); setPH(ph); return; }
    const ids = selectedIds();
    if (ids.length > 1) { P.removeClips(ids); select(null); setPH(ph); toast('클립 ' + ids.length + '개를 지웠어요 (Ctrl+Z 로 되돌려요)', 1800); return; }
    const c = selClip() || P.clipAt(ph); if (!c) return; P.removeClip(c.id); select(null); setPH(ph);
  }
  /* 리프트(;) — 선택 클립을 빈 자리(검은 화면)로, 뒤 클립은 밀리지 않는다. 익스트랙트(') — 당겨서 지우기(리플). */
  function doLift() {
    stop();
    const ids = selectedIds().length ? selectedIds() : (P.clipAt(ph) ? [P.clipAt(ph).id] : []);
    if (!ids.length) return toast('리프트할 클립을 먼저 고르세요 (또는 플레이헤드를 클립 위에)', 1800);
    const n = P.lift(ids);
    if (!n) return toast('빈 자리는 리프트할 게 없어요', 1400);
    select(null); setPH(ph);
    toast('빈 자리로 바꿨어요 — 뒤 클립은 그대로 (Ctrl+Z 로 되돌려요)', 2000);
  }
  function doExtract() {
    stop();
    const ids = selectedIds().length ? selectedIds() : (P.clipAt(ph) ? [P.clipAt(ph).id] : []);
    if (!ids.length) return toast('익스트랙트할 클립을 먼저 고르세요', 1600);
    P.removeClips(ids); select(null); setPH(ph);
    toast('당겨서 지웠어요 — 뒤 클립이 붙습니다 (Ctrl+Z 로 되돌려요)', 2000);
  }
  /* ---------- 복사·붙여넣기·마커 ---------- */
  function doCopy() { const ids = selectedIds(); if (!ids.length) return toast('복사할 클립을 먼저 고르세요', 1400); clipboard = P.copyClips(ids); toast('클립 ' + ids.length + '개 복사', 1200); }
  function doCut() { const ids = selectedIds(); if (!ids.length) return; clipboard = P.copyClips(ids); stop(); P.removeClips(ids); select(null); setPH(ph); toast('클립 ' + ids.length + '개 잘라냄', 1200); }
  function doPaste() { if (!clipboard.length) return toast('붙여넣을 클립이 없어요 (Ctrl+C 로 먼저 복사)', 1600); stop(); const made = P.pasteClips(clipboard, P.total() ? ph : null); if (!made.length) return; selSet.clear(); made.forEach(c => selSet.add(c.id)); sel = made[0].id; dirty = true; refreshPanel(); setPH(made[made.length - 1].at + made[made.length - 1].dur); toast('클립 ' + made.length + '개를 ' + tc(made[0].at) + ' 에 붙여넣었어요', 1600); }
  function doMarker() { stop(); const ex = P.markerAt(ph, 0); if (ex) { renameMarker(ex.id); return; } const mk = P.addMarker({ at: ph }); selectMarker(mk.id); toast('마커 ' + tc(mk.at) + ' — M 을 한 번 더 누르면 이름을 붙여요', 1800); }
  function renameMarker(id) { const mk = P.marker(id); if (!mk) return; selectMarker(id); const t = prompt('마커 이름', mk.text || ''); if (t == null) return; P.updateMarker(id, { text: t.trim() }); }
  function jumpMarker(dir) { const f = P.markerFrames(); if (!f.length) return toast('마커가 없어요 (M 으로 놓아요)', 1400); if (dir > 0) { const n = f.find(v => v > ph); if (n != null) { setPH(n); selectMarker(P.markerAt(n).id); } } else { const p = f.filter(v => v < ph); if (p.length) { setPH(p[p.length - 1]); selectMarker(P.markerAt(p[p.length - 1]).id); } } }
  function refreshMarkerList() {
    const list = $('markerList'); if (!list) return; list.innerHTML = '';
    (P.data.markers || []).forEach(mk => {
      const el = document.createElement('div'); el.className = 'mk' + (mk.id === selM ? ' on' : '');
      const i = document.createElement('i'); const inp = document.createElement('input'); inp.type = 'text'; inp.value = mk.text || ''; inp.placeholder = '이름'; inp.title = '마커 이름';
      inp.onchange = ev => P.updateMarker(mk.id, { text: ev.target.value.trim() }); inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); ev.target.blur(); } ev.stopPropagation(); }; inp.onclick = ev => ev.stopPropagation();
      const tm = document.createElement('span'); tm.className = 'tm'; tm.textContent = tc(mk.at);
      const x = document.createElement('span'); x.className = 'x'; x.textContent = '✕'; x.title = '마커 삭제'; x.onclick = ev => { ev.stopPropagation(); P.removeMarker(mk.id); if (selM === mk.id) selectMarker(null); };
      el.append(i, inp, tm, x); el.onclick = () => { stop(); showStage('tl'); selectMarker(mk.id); setPH(mk.at); };
      list.appendChild(el);
    });
  }
  function doFreeze() { stop(); const fz = P.freeze(ph); if (fz) { select(fz.id); toast('프리즈 프레임 ' + secStr(fz.dur) + ' — 오른쪽 패널에서 길이 조절'); } else toast('영상 클립 위에 플레이헤드를 두고 F'); }
  function jumpEdge(dir) { const e = P.edges(); if (dir > 0) { const n = e.find(v => v > ph); setPH(n == null ? P.total() - 1 : Math.min(n, P.total() - 1)); } else { const prev = e.filter(v => v < ph); setPH(prev.length ? prev[prev.length - 1] : 0); } }

  window.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    const k = e.key, ctrl = e.ctrlKey || e.metaKey;
    if (k === ' ') { e.preventDefault(); togglePlay(); return; }
    if (ctrl && (k === 'z' || k === 'Z')) { e.preventDefault(); stop(); if (e.shiftKey ? P.redo() : P.undo()) setPH(ph); return; }
    if (ctrl && (k === 'y' || k === 'Y')) { e.preventDefault(); stop(); if (P.redo()) setPH(ph); return; }
    if (ctrl && (k === 'a' || k === 'A' || k === 'ㅁ')) { e.preventDefault(); stop(); showStage('tl'); select(null, 'all'); return; }
    if (ctrl && (k === 'c' || k === 'C' || k === 'ㅊ')) { e.preventDefault(); doCopy(); return; }
    if (ctrl && (k === 'x' || k === 'X' || k === 'ㅌ')) { e.preventDefault(); doCut(); return; }
    if (ctrl && (k === 'v' || k === 'V' || k === 'ㅍ')) { e.preventDefault(); doPaste(); return; }
    if (ctrl && e.shiftKey && (k === 'm' || k === 'M' || k === 'ㅡ')) { e.preventDefault(); stop(); jumpMarker(-1); return; }
    if (ctrl) return;
    // 소스 모니터에서의 키
    if (stage === 'src' && srcCur) {
      const m = P.media(srcCur.media);
      switch (k) {
        case 'ArrowLeft': e.preventDefault(); stop(); setSrcPH(srcCur.ph - (e.shiftKey ? 10 : 1)); return;
        case 'ArrowRight': e.preventDefault(); stop(); setSrcPH(srcCur.ph + (e.shiftKey ? 10 : 1)); return;
        case 'Home': e.preventDefault(); stop(); setSrcPH(0); return;
        case 'End': e.preventDefault(); stop(); setSrcPH(m.dur - 1); return;
        case 'ArrowUp': e.preventDefault(); stop(); if (srcCur.in != null) setSrcPH(srcCur.in); return;
        case 'ArrowDown': e.preventDefault(); stop(); if (srcCur.out != null) setSrcPH(srcCur.out - 1); return;
        case 'Escape': showStage('tl'); return;
      }
    }
    switch (k) {
      case 'i': case 'I': case 'ㅑ': e.preventDefault(); srcMark('in'); break;
      case 'o': case 'O': case 'ㅐ': e.preventDefault(); srcMark('out'); break;
      case ',': case '<': e.preventDefault(); srcPlace('insert'); break;
      case '.': case '>': e.preventDefault(); srcPlace('overwrite'); break;
      case 'j': case 'J': case 'ㅓ': e.preventDefault(); shuttleKey(-1); break;
      case 'k': case 'K': case 'ㅏ': e.preventDefault(); stop(); break;
      case 'l': case 'L': case 'ㅣ': e.preventDefault(); shuttleKey(1); break;
      case 'm': case 'M': case 'ㅡ': e.preventDefault(); if (e.shiftKey || k === 'M') { stop(); jumpMarker(1); } else doMarker(); break;
      case 's': case 'S': case 'ㄴ': e.preventDefault(); doSplit(); break;
      case 'f': case 'F': case 'ㄹ': e.preventDefault(); doFreeze(); break;
      case 'q': case 'Q': case 'ㅂ': e.preventDefault(); stop(); P.trimToPlayhead(ph, 'in'); setPH(ph); break;
      case 'w': case 'W': case 'ㅈ': e.preventDefault(); stop(); P.trimToPlayhead(ph, 'out'); setPH(ph); break;
      case ';': case ':': e.preventDefault(); doLift(); break;
      case "'": case '"': e.preventDefault(); doExtract(); break;
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
      case 'Escape': select(null); selectS(null); selectP(null); selectA2(null); selectV2(null); selectMarker(null); break;
    }
  });
  // 버튼·슬라이더에 포커스가 남으면 Space·화살표가 거기로 가므로 놓는 즉시 풀어 준다
  document.addEventListener('pointerup', () => { const a = document.activeElement; if (a && (a.tagName === 'BUTTON' || a.type === 'range')) a.blur(); });
  function toggleSnap() { snap = !snap; $('btnSnap').classList.toggle('on', snap); toast(snap ? '스냅 켬' : '스냅 끔', 1200); }

  /* ---------- 트랜스포트·상단 버튼 ---------- */
  $('tPlay').onclick = togglePlay;
  const inSrc = () => stage === 'src' && srcCur;
  $('tStart').onclick = () => { stop(); inSrc() ? setSrcPH(0) : setPH(0); };
  $('tEnd').onclick = () => { stop(); inSrc() ? setSrcPH(P.media(srcCur.media).dur - 1) : setPH(P.total() - 1); };
  $('tPrev').onclick = () => { stop(); inSrc() ? setSrcPH(srcCur.ph - 1) : setPH(ph - 1); };
  $('tNext').onclick = () => { stop(); inSrc() ? setSrcPH(srcCur.ph + 1) : setPH(ph + 1); };
  $('btnMarker').onclick = doMarker;
  $('tabTL').onclick = () => showStage('tl'); $('tabSrc').onclick = () => { if (srcCur) showStage('src'); };
  $('srcIn').onclick = () => srcMark('in'); $('srcOut').onclick = () => srcMark('out');
  $('srcInsert').onclick = () => srcPlace('insert'); $('srcOver').onclick = () => srcPlace('overwrite'); $('srcAppend').onclick = () => srcPlace('append');
  $('tPrevEdit').onclick = () => { stop(); jumpEdge(-1); };
  $('tNextEdit').onclick = () => { stop(); jumpEdge(1); };
  $('btnUndo').onclick = () => { stop(); if (P.undo()) setPH(ph); };
  $('btnRedo').onclick = () => { stop(); if (P.redo()) setPH(ph); };
  $('btnSnap').onclick = toggleSnap;
  $('btnImport').onclick = $('btnImport2').onclick = () => { if (SH && SH.active) SH.pick().then(refs => { if (refs.length) importFiles(refs); }); else $('fileIn').click(); };
  $('fileIn').onchange = e => { importFiles(Array.from(e.target.files)); e.target.value = ''; };
  /* ---------- 창 크기 조절 — 손잡이 끌기 (설정 너비·도구상자 너비·미디어 띠 높이·타임라인 높이). 이 브라우저에 기억 ---------- */
  const LAYOUT_DEF = { tlH: 344, setW: 300, toolsW: 300, binH: 64 };
  const LAYOUT_LIM = { tlH: [160, 0.7], setW: [220, 520], toolsW: [220, 560], binH: [48, 160] };
  let layout = Object.assign({}, LAYOUT_DEF);
  try { Object.assign(layout, JSON.parse(localStorage.getItem('kmv.layout') || '{}')); } catch (e) {}
  function applyLayout() {
    const maxTl = Math.round(window.innerHeight * LAYOUT_LIM.tlH[1]);
    layout.tlH = clamp(layout.tlH, LAYOUT_LIM.tlH[0], Math.max(LAYOUT_LIM.tlH[0], maxTl));
    layout.setW = clamp(layout.setW, LAYOUT_LIM.setW[0], LAYOUT_LIM.setW[1]); layout.toolsW = clamp(layout.toolsW, LAYOUT_LIM.toolsW[0], LAYOUT_LIM.toolsW[1]); layout.binH = clamp(layout.binH, LAYOUT_LIM.binH[0], LAYOUT_LIM.binH[1]);
    const st = document.documentElement.style;
    st.setProperty('--tlH', layout.tlH + 'px'); st.setProperty('--setW', layout.setW + 'px'); st.setProperty('--toolsW', layout.toolsW + 'px'); st.setProperty('--binH', layout.binH + 'px');
    try { localStorage.setItem('kmv.layout', JSON.stringify(layout)); } catch (e) {}
    resize();
  }
  function splitter(id, key, axis, sign) {
    const el = $(id); if (!el) return;
    el.addEventListener('pointerdown', e => {
      e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('on');
      const x0 = e.clientX, y0 = e.clientY, v0 = layout[key];
      const move = ev => { const d = axis === 'x' ? ev.clientX - x0 : ev.clientY - y0; layout[key] = v0 + d * sign; applyLayout(); };
      const up = ev => { el.classList.remove('on'); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); try { el.releasePointerCapture(ev.pointerId); } catch (er) {} };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
    el.addEventListener('dblclick', () => { layout[key] = LAYOUT_DEF[key]; applyLayout(); });
  }
  splitter('splitTl', 'tlH', 'y', -1);         // 위로 끌면 타임라인이 커진다
  splitter('splitBin', 'binH', 'y', 1);        // 아래로 끌면 띠가 커진다
  splitter('splitSet', 'setW', 'x', -1);       // 왼쪽으로 끌면 설정 창이 넓어진다
  splitter('splitTools', 'toolsW', 'x', -1);
  applyLayout();
  window.addEventListener('resize', applyLayout);

  /* 도구상자 탭 — 타이틀·꾸미기 / 자막 / 음악 / 룩 / 프로젝트 중 하나만 (이 브라우저에 기억) */
  let toolTab = 'parts'; try { toolTab = localStorage.getItem('kmv.tab') || 'parts'; } catch (e) {}
  function setTab(id) {
    if (!document.querySelector('#toolTabs [data-tab="' + id + '"]')) id = 'parts';
    toolTab = id; try { localStorage.setItem('kmv.tab', id); } catch (e) {}
    document.querySelectorAll('#toolTabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === id));
    document.querySelectorAll('#colTools .panel[data-tab]').forEach(pn => pn.classList.toggle('tabOn', pn.dataset.tab === id));
    $('colTools').scrollTop = 0;
  }
  document.querySelectorAll('#toolTabs button').forEach(b => { b.onclick = () => setTab(b.dataset.tab); });
  setTab(toolTab);

  /* 미디어 띠 보이기/숨기기 — 이 브라우저에 기억 */
  let mediaOn = true; try { mediaOn = localStorage.getItem('kmv.media') !== '0'; } catch (e) {}
  function applyMedia() { document.body.classList.toggle('hide-media', !mediaOn); $('tgColMedia').classList.toggle('on', mediaOn); resize(); }
  $('tgColMedia').onclick = () => { mediaOn = !mediaOn; try { localStorage.setItem('kmv.media', mediaOn ? '1' : '0'); } catch (e) {} applyMedia(); };
  applyMedia();
  $('btnNew').onclick = () => openProjModal();
  $('projName').onclick = () => renameCurrent();
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
  [['none', '없음'], ['short', '짧게'], ['normal', '보통'], ['long', '길게']].forEach(([k, l]) => segBtn($('rampSeg'), k, l, () => { const c = selClip(); if (c) { stop(); P.setRamp(c.id, k); } }, '슬로·타임랩스로 부드럽게 들어가고 나오는 구간'));
  [['none', '없음'], ['light', '약하게'], ['strong', '강하게']].forEach(([k, l]) => segBtn($('denoiseSeg'), k, l, () => { const c = selClip(); if (c) { stop(); P.setDenoise(c.id, k); } }, '이 원본의 가장 조용한 구간을 잡음 지문으로 삼아 웅웅거림·히스를 줄여요'));
  let volStart = null;
  $('vol').oninput = e => { const c = selClip(); if (!c) return; const a = P.audioOf(c.id); if (a) { if (volStart == null) volStart = a.vol == null ? 1 : a.vol; a.vol = +e.target.value / 100; $('volV').textContent = e.target.value + '%'; dirty = true; draw(); } };
  $('vol').onchange = e => { const c = selClip(); if (!c) return; const a = P.audioOf(c.id); if (a) { const v = +e.target.value / 100; a.vol = volStart == null ? 1 : volStart; volStart = null; P.setVol(c.id, v); } };
  $('freezeSec').onchange = e => { const c = selClip(); if (c && c.freeze) { stop(); P.trim(c.id, 'out', Math.round(clamp(+e.target.value, 0.5, 60) * FPS)); setPH(ph); } };
  $('btnRelink').onclick = () => { const c = selClip(); if (c) { stop(); P.relink(c.id); } };
  $('btnFreeze').onclick = doFreeze; $('btnSplit').onclick = doSplit; $('btnDel').onclick = doDelete;

  function refreshPanel() {
    const c = selClip();
    $('clipNone').classList.toggle('hidden', !!c); $('clipBody').classList.toggle('hidden', !c);
    $('trNone').classList.toggle('hidden', !!c); $('trBody').classList.toggle('hidden', !c);
    $('btnUndo').disabled = !P.canUndo(); $('btnRedo').disabled = !P.canRedo();
    if (c) refreshClipFx();
    if (!c) return;
    if (c.gap) {                                        // 빈 자리 — 길이만 조절
      $('cName').textContent = '빈 자리'; $('cName').title = '리프트로 생긴 검은 화면';
      $('cRange').textContent = '검은 화면 (내용 없음)';
      $('cDur').textContent = secStr(c.dur) + ' · ' + tc(c.at) + ' 부터';
      $('rowSpeed').classList.add('hidden');
      $('rowFreeze').classList.remove('hidden'); $('freezeSec').value = (c.dur / FPS).toFixed(1);
      $('rowVol').classList.add('hidden'); $('rowLink').classList.add('hidden');
      $('btnFreeze').disabled = true;
      $('trBody').classList.add('hidden'); $('trNone').classList.remove('hidden');
      return;
    }
    const m = P.media(c.media), a = P.audioOf(c.id);
    $('cName').textContent = m.name; $('cName').title = m.name;
    $('cRange').textContent = c.freeze ? '원본 ' + tc(Math.round(c.in * FPS / m.fps)) + ' 정지' : tc(Math.round(c.in * FPS / m.fps)) + ' → ' + tc(Math.round(c.out * FPS / m.fps));
    $('cDur').textContent = secStr(c.dur) + ' · ' + tc(c.at) + ' 부터';
    $('rowSpeed').classList.toggle('hidden', c.freeze || m.kind === 'image');
    Array.from(speedSeg.children).forEach(b => b.classList.toggle('on', b.dataset.k === c.speed));
    const rampOK = !c.freeze && m.kind === 'video' && c.speed !== 'normal' && c.speed !== 'hit';
    $('rowRamp').classList.toggle('hidden', !rampOK); setOn($('rampSeg'), c.ramp || 'none');
    $('rowDenoise').classList.toggle('hidden', c.freeze || m.kind !== 'video' || !m.audio); setOn($('denoiseSeg'), c.denoise || 'none');
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
  function refreshProject() { $('pTot').textContent = secStr(P.total()); $('pCnt').textContent = P.data.V.length + (selSet.size > 1 ? ' (선택 ' + selSet.size + ')' : ''); if (stage !== 'src') $('tcTot').textContent = tc(P.total()); }

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
  (TR.CATS || [{ id: null }]).forEach(cat => {
    const items = TR.TYPES.filter(t => !cat.id || t.cat === cat.id); if (!items.length) return;
    const box = cat.id ? document.createElement('optgroup') : $('trType'); if (cat.id) { box.label = cat.name; $('trType').appendChild(box); }
    items.forEach(t => { const o = document.createElement('option'); o.value = t.id; o.textContent = t.name; box.appendChild(o); });
  });
  $('trType').onchange = e => { const c = selClip(); if (!c) return; stop(); const type = e.target.value, def = TR.TYPES.find(t => t.id === type); const cur = c.transIn || {}; P.setTransition(c.id, type === 'cut' ? null : { type, dur: cur.dur || 'normal', dir: def.dirs ? (def.dirs.includes(cur.dir) ? cur.dir : def.dirs[0]) : undefined }); if (type !== 'cut') setPH(c.at + Math.round(TR.durFrames({ dur: cur.dur || 'normal' }) / 2)); };
  TR.DURS.forEach(d => segBtn($('trDurSeg'), d.id, d.name + ' ' + (d.f / FPS).toFixed(1) + 's', () => { const c = selClip(); if (c && c.transIn) P.setTransition(c.id, Object.assign({}, c.transIn, { dur: d.id })); }));
  [['ltr', '→'], ['rtl', '←'], ['ttb', '↓'], ['btt', '↑'], ['in', '확대'], ['out', '축소']].forEach(([k, l]) => segBtn($('trDirSeg'), k, l, () => { const c = selClip(); if (c && c.transIn) P.setTransition(c.id, Object.assign({}, c.transIn, { dir: k })); }));
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
  $('tgMatch').onclick = () => P.setProjectLook({ colorMatch: !P.data.look.colorMatch });
  $('tgBar').onclick = () => P.setProjectLook({ cinemaBar: !P.data.look.cinemaBar });
  function refreshLookPanel() {
    const L = P.data.look;
    Array.from($('themeSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === P.data.theme));
    Array.from($('lutSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === (L.lut || 'none')));
    $('lutStr').value = Math.round((L.strength == null ? 0.6 : L.strength) * 100); $('lutStrV').textContent = $('lutStr').value + '%';
    $('vig').value = Math.round((L.vignette || 0) * 100); $('vigV').textContent = $('vig').value + '%';
    $('tgExpose').classList.toggle('on', !!L.autoExpose); $('tgMatch').classList.toggle('on', !!L.colorMatch); $('tgBar').classList.toggle('on', !!L.cinemaBar);
  }
  // 자막
  /* ---------- 14단계 패널: 덧영상 V2 ---------- */
  const V2_POS_L = [['tl', '↖ 좌상'], ['tr', '↗ 우상'], ['c', '중앙'], ['bl', '↙ 좌하'], ['br', '↘ 우하'], ['full', '꽉 채움']];
  V2_POS_L.forEach(([k, l]) => segBtn($('v2PosSeg'), k, l, () => { const o = selV2 && P.v2(selV2); if (o) { P.updateV2(o.id, { pos: k }); } }));
  [['sm', '작게'], ['md', '중간'], ['lg', '절반']].forEach(([k, l]) => segBtn($('v2SizeSeg'), k, l, () => { const o = selV2 && P.v2(selV2); if (o) P.updateV2(o.id, { size: k }); }));
  $('btnV2Del').onclick = () => { if (selV2) { stop(); P.removeV2(selV2); selectV2(null); setPH(ph); } };
  function refreshV2Panel() {
    const o = selV2 && P.v2(selV2);
    $('v2None').classList.toggle('hidden', !!o); $('v2Body').classList.toggle('hidden', !o);
    if (!o) return;
    const m = P.media(o.media);
    $('v2Name').textContent = m ? m.name : '';
    $('v2Range').textContent = tc(o.at) + ' → ' + tc(o.at + o.dur) + ' · ' + secStr(o.dur);
    Array.from($('v2PosSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === (o.pos || 'br')));
    Array.from($('v2SizeSeg').children).forEach(b => { b.classList.toggle('on', b.dataset.k === (o.size || 'md')); b.disabled = o.pos === 'full'; });
  }
  /* ---------- 설정 열 조절기 (KMV_FX) — 글꼴·크기·위치·색·등장/퇴장 ----------
     자막 카드 → P.updateS, 부품 카드 → P.updateP, 클립 → P.setFade. 슬라이더는 끄는 동안 commit 없이, 놓으면 한 커밋. */
  const FX = window.KMV_FX;
  function fillSelect(sel, list, none, byCat) {
    sel.innerHTML = '';
    if (none) { const o = document.createElement('option'); o.value = ''; o.textContent = none; sel.appendChild(o); }
    if (byCat) {
      const cats = []; list.forEach(x => { if (!cats.includes(x.cat)) cats.push(x.cat); });
      cats.forEach(c => { const og = document.createElement('optgroup'); og.label = c; list.filter(x => x.cat === c).forEach(x => { const o = document.createElement('option'); o.value = x.id; o.textContent = x.ko; og.appendChild(o); }); sel.appendChild(og); });
    } else list.forEach(x => { const o = document.createElement('option'); o.value = x.id; o.textContent = x.ko; sel.appendChild(o); });
  }
  function setOn(seg, k) { Array.from(seg.children).forEach(b => b.classList.toggle('on', b.dataset.k === String(k))); }
  /* 등장/퇴장 한 줄: select + 길이 seg. get() → 현재 spec, set(spec) → 저장 */
  function fxRow(selId, durId, list, get, set) {
    const sel = $(selId), seg = $(durId);
    fillSelect(sel, list, '없음', true);
    FX.DURS.forEach(d => segBtn(seg, d.id, d.ko, () => { const cur = get(); if (cur && cur.type) set({ type: cur.type, dur: d.id }); }));
    sel.onchange = () => { const cur = get(); set(sel.value ? { type: sel.value, dur: (cur && cur.dur) || 'normal' } : null); };
    return { refresh() { const cur = get(); sel.value = cur && cur.type ? cur.type : ''; seg.classList.toggle('hidden', !(cur && cur.type)); setOn(seg, cur && cur.dur || 'normal'); } };
  }
  /* 슬라이더: 끄는 동안 commit 없이 반영, 놓으면 한 커밋 */
  function slider(id, vId, fmt, getCard, apply) {
    let start = null;
    $(id).oninput = e => { const c = getCard(); if (!c) return; if (start == null) start = c; apply(+e.target.value, false); $(vId).textContent = fmt(+e.target.value); };
    $(id).onchange = e => { const c = getCard(); if (!c) return; start = null; apply(+e.target.value, true); };
  }
  if (FX) {
    // 자막 카드
    fillSelect($('subFont'), FX.FONTS, '기본 (프리텐다드)', true);
    $('subFont').onchange = () => { const s2 = selS && P.subtitle(selS); if (!s2) return; const id = $('subFont').value || null; FX.loadFont(id).then(() => { if (!playing) renderPreview(); }); P.updateS(s2.id, { font: id }); };
    slider('subSize', 'subSizeV', v => v + '%', () => selS && P.subtitle(selS), (v, done) => { const s2 = P.subtitle(selS); P.updateS(s2.id, { size: v }, { commit: done }); });
    slider('subY', 'subYV', v => String(v), () => selS && P.subtitle(selS), (v, done) => { const s2 = P.subtitle(selS); P.updateS(s2.id, { y: v }, { commit: done }); });
    [['', '자동'], ['top', '위'], ['mid', '가운데'], ['bottom', '아래']].forEach(([k, l]) => segBtn($('subPosSeg'), k, l, () => { const s2 = selS && P.subtitle(selS); if (s2) P.updateS(s2.id, { pos: k || null }); }));
    [['', '테마'], ['white', '흰'], ['gold', '금'], ['navy', '네이비'], ['black', '검정']].forEach(([k, l]) => segBtn($('subColorSeg'), k, l, () => { const s2 = selS && P.subtitle(selS); if (s2) P.updateS(s2.id, { color: k || null }); }));
    const subIn = fxRow('subFxIn', 'subFxInDur', FX.TEXT, () => { const s2 = selS && P.subtitle(selS); return s2 ? s2.fxIn : null; }, spec => { const s2 = selS && P.subtitle(selS); if (s2) P.updateS(s2.id, { fxIn: spec }); });
    const subOut = fxRow('subFxOut', 'subFxOutDur', FX.TEXT_OUT.map(x => Object.assign({ cat: '퇴장' }, x)), () => { const s2 = selS && P.subtitle(selS); return s2 ? s2.fxOut : null; }, spec => { const s2 = selS && P.subtitle(selS); if (s2) P.updateS(s2.id, { fxOut: spec }); });
    // 부품 카드
    fillSelect($('partFont'), FX.FONTS, '기본 (프리텐다드)', true);
    $('partFont').onchange = () => { const pt = selPart(); if (!pt) return; const id = $('partFont').value || null; FX.loadFont(id).then(() => { PT.invalidateThumbs && PT.invalidateThumbs(); if (!playing) renderPreview(); }); P.updateP(pt.id, { font: id }); };
    slider('partSize', 'partSizeV', v => v + '%', selPart, (v, done) => { P.updateP(selPart().id, { size: v }, { commit: done }); });
    slider('partY', 'partYV', v => String(v), selPart, (v, done) => { P.updateP(selPart().id, { y: v }, { commit: done }); });
    const partIn = fxRow('partFxIn', 'partFxInDur', FX.TEXT.filter(x => !['type', 'chars', 'words', 'lines', 'underline', 'maskUp', 'split', 'sweep', 'barFirst', 'ink', 'brush', 'countUp'].includes(x.id)), () => { const pt = selPart(); return pt ? pt.fxIn : null; }, spec => { const pt = selPart(); if (pt) P.updateP(pt.id, { fxIn: spec }); });
    const partOut = fxRow('partFxOut', 'partFxOutDur', FX.TEXT_OUT.map(x => Object.assign({ cat: '퇴장' }, x)), () => { const pt = selPart(); return pt ? pt.fxOut : null; }, spec => { const pt = selPart(); if (pt) P.updateP(pt.id, { fxOut: spec }); });
    // 클립 등장/퇴장
    const clipIn = fxRow('clipFadeIn', 'clipFadeInDur', FX.CLIP, () => { const c = selClip(); return c ? c.fadeIn : null; }, spec => { const c = selClip(); if (c) P.setFade(c.id, 'in', spec); });
    const clipOut = fxRow('clipFadeOut', 'clipFadeOutDur', FX.CLIP, () => { const c = selClip(); return c ? c.fadeOut : null; }, spec => { const c = selClip(); if (c) P.setFade(c.id, 'out', spec); });
    window.__kmvFxRows = { subIn, subOut, partIn, partOut, clipIn, clipOut };
  }
  function refreshSubFx(s2) {
    if (!FX || !s2) return;
    if (document.activeElement !== $('subFont')) $('subFont').value = s2.font || '';
    if (document.activeElement !== $('subSize')) { $('subSize').value = s2.size == null ? 100 : s2.size; $('subSizeV').textContent = $('subSize').value + '%'; }
    if (document.activeElement !== $('subY')) { $('subY').value = s2.y || 0; $('subYV').textContent = String(s2.y || 0); }
    setOn($('subPosSeg'), s2.pos || ''); setOn($('subColorSeg'), s2.color || '');
    window.__kmvFxRows.subIn.refresh(); window.__kmvFxRows.subOut.refresh();
    if (s2.font) FX.loadFont(s2.font);
  }
  function refreshPartFx(pt) {
    if (!FX || !pt) return;
    if (document.activeElement !== $('partFont')) $('partFont').value = pt.font || (PT.meta(pt.part) && PT.meta(pt.part).font) || '';
    if (document.activeElement !== $('partSize')) { $('partSize').value = pt.size == null ? 100 : pt.size; $('partSizeV').textContent = $('partSize').value + '%'; }
    if (document.activeElement !== $('partY')) { $('partY').value = pt.y || 0; $('partYV').textContent = String(pt.y || 0); }
    window.__kmvFxRows.partIn.refresh(); window.__kmvFxRows.partOut.refresh();
    if (pt.font) FX.loadFont(pt.font);
  }
  function refreshClipFx() { if (FX && window.__kmvFxRows) { window.__kmvFxRows.clipIn.refresh(); window.__kmvFxRows.clipOut.refresh(); } }

  let subStyle = 'basic';
  (SB.CATS || [{ id: null }]).forEach(cat => {
    const items = SB.STYLES.filter(st => !cat.id || st.cat === cat.id); if (!items.length) return;
    if (cat.id) { const h = document.createElement('div'); h.className = 'cat'; h.textContent = cat.name; $('subStyleSeg').appendChild(h); }
    const row = document.createElement('div'); row.className = 'seg c3'; $('subStyleSeg').appendChild(row);
    items.forEach(st => segBtn(row, st.id, st.name, () => { subStyle = st.id; const s2 = selS && P.subtitle(selS); if (s2) P.updateS(s2.id, { style: st.id }); else refreshSubPanel(); }, st.hint));
  });
  { const sel = $('subDefStyle'); SB.STYLES.forEach(st => { const o = document.createElement('option'); o.value = st.id; o.textContent = st.name + ' — ' + st.hint; sel.appendChild(o); }); sel.value = subStyle; sel.onchange = () => { subStyle = sel.value; }; }
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
  /* 받아쓰기 — 실제로 들리는 소리(A1, 소리 켠 카드)의 원본 구간만 whisper 로 받아써 자막 카드로 */
  let sttBusy = false;
  $('btnSubStt').onclick = async () => {
    if (sttBusy) return;
    stop();
    if (!(SH && SH.sttReady && SH.sttReady())) return toast('받아쓰기는 데스크톱 케이무비에서 할 수 있어요 — whisper 모델(models 폴더의 ggml-*.bin)이 필요해요', 4200);
    if (!P.total()) return toast('타임라인이 비어 있어요');
    const ranges = [];
    P.data.A1.forEach(a => {
      if (!a.vol) return;                                  // 소리 끈 클립은 자막도 없다
      const c = P.clip(a.clip); if (!c || c.freeze) return;
      const m = P.media(c.media); if (!m || m.kind !== 'video' || !m.audio) return;
      ranges.push({ media: m.id, mfps: m.fps || FPS, in: a.in, out: a.out, at: a.at, dur: a.dur });
    });
    if (!ranges.length) return toast('현장음이 있는 클립이 없어요');
    const ids = [...new Set(ranges.map(r => r.media))];
    const segsByMedia = {}; let skipped = 0;
    sttBusy = true; OV.show('받아쓰는 중');
    try {
      for (let i = 0; i < ids.length; i++) {
        const m = P.media(ids[i]);
        if (!(m.origin && m.origin.hash)) { skipped++; continue; }   // 브라우저로 넣은 파일 — 원본 연결 없음
        OV.set(i / ids.length, (m.name || '원본'));
        const segs = await SH.stt(m, { progress: (p, stage) => OV.set((i + p) / ids.length, (stage || '받아쓰는 중') + ' — ' + (m.name || '') + ' ' + Math.round(p * 100) + '%') });
        segsByMedia[ids[i]] = window.KMV_STT.tidy(segs || []);
      }
    } catch (e) { console.error(e); sttBusy = false; OV.hide(); return toast('받아쓰기 실패 — ' + (e.message || e), 5000); }
    sttBusy = false; OV.hide();
    const cards = window.KMV_STT.build(segsByMedia, ranges, FPS).map(c => Object.assign(c, { style: subStyle }));
    if (!cards.length) return toast(skipped ? '원본 연결이 있는 파일에서 말소리를 못 찾았어요 (' + skipped + '개는 데스크톱에서 다시 넣어야 받아쓸 수 있어요)' : '말소리를 못 찾았어요', 4200);
    const made = P.addManyS(cards);
    toast('자막 ' + made.length + '개를 받아썼어요 — 카드를 눌러 문구를 다듬어 주세요' + (skipped ? ' (' + skipped + '개 파일은 원본 연결이 없어 건너뜀)' : ''), 4200);
    selectS(made[0].id); setPH(made[0].at);
  };
  $('btnSubClear').onclick = () => { if (!P.data.S.length) return; if (!confirm('자막을 전부 지울까요?')) return; P.clearS(); selectS(null); setPH(ph); };
  let subEditStart = null;
  $('subEditText').oninput = e => { const s2 = selS && P.subtitle(selS); if (s2) { if (subEditStart == null) subEditStart = s2.text; s2.text = e.target.value; dirty = true; renderPreview(); draw(); } };
  $('subEditText').onchange = e => { const s2 = selS && P.subtitle(selS); if (s2) { const v = e.target.value; if (subEditStart != null) s2.text = subEditStart; subEditStart = null; P.updateS(s2.id, { text: v }); } };
  $('subEditText').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } };
  $('btnSubDel').onclick = () => { if (selS) { P.removeS(selS); selectS(null); setPH(ph); } };
  function refreshSubPanel() {
    const s2 = selS && P.subtitle(selS);
    $('subEdit').classList.toggle('hidden', !s2); const scn = $('subCardNone'); if (scn) scn.classList.toggle('hidden', !!s2);
    Array.from($('subStyleSeg').querySelectorAll('button')).forEach(b => b.classList.toggle('on', b.dataset.k === (s2 ? s2.style : subStyle)));
    if (s2) { if (document.activeElement !== $('subEditText')) $('subEditText').value = s2.text; $('subEditTime').textContent = tc(s2.at) + ' → ' + tc(s2.at + s2.dur) + ' · ' + secStr(s2.dur); refreshSubFx(s2); }
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
      el.onpointerdown = e => { if (e.pointerType === 'mouse' && e.button !== 0) return; e.preventDefault(); partDrag = { part: def.id, dur: P.partDefault(def.id).dur, x: e.clientX, y: e.clientY, moved: false, overTL: false, f: 0 }; };
      el.onpointerenter = e => { if (e.pointerType !== 'mouse') return; peekHover(def.id, el); };
      el.onpointerleave = e => { if (e.pointerType !== 'mouse') return; peekLeave(def.id); };
      el.ondblclick = () => { peekHide(true); placePart(def.id, ph); };
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
    selectP(pt.id); select(null); selectS(null); selectA2(null); selectV2(null);
    setPH(pt.at + Math.min(pt.dur - 1, Math.round(PT.meta(partId).thumbT * FPS)));
    if (PT.behind(pt) && SG) SG.load().then(ok => { if (!ok) toast('인물 컷아웃 모델을 못 불러와 부품이 그냥 앞에 그려져요', 4000); });
    toast(PT.def(partId).name + ' 을 놓았어요 — 오른쪽에서 문구를 바꾸세요', 1800);
  }
  window.addEventListener('pointermove', e => {
    if (!partDrag) return;
    if (!partDrag.moved && Math.hypot(e.clientX - partDrag.x, e.clientY - partDrag.y) < 6) return;
    partDrag.moved = true;
    const gh = $('partGhost'); gh.classList.remove('hidden'); gh.textContent = '✦ ' + PT.def(partDrag.part).name; gh.style.left = e.clientX + 'px'; gh.style.top = e.clientY + 'px';
    const r = tl.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const over = x >= HEAD && x <= r.width && y >= 0 && y <= r.height;
    partDrag.overTL = over;
    if (over) { const sn = snapSpan(frameOf(x), partDrag.dur, laneEdges('P')); partDrag.f = Math.max(0, sn.f); }
    tl.style.cursor = over ? 'copy' : 'default';
    draw();
  });
  window.addEventListener('pointerup', () => {
    if (!partDrag) return;
    const d = partDrag; partDrag = null; $('partGhost').classList.add('hidden'); tl.style.cursor = 'default';
    if (!d.moved) peekPin(d.part);
    else if (d.overTL) { peekHide(true); placePart(d.part, d.f); }
    else draw();
  });

  /* ---------- 부품 미리보기 (peek) — 타일에 올리면 움직임을 재생해 보여 주고, 클릭하면 고정 + 「넣기」 ----------
     큰 창은 지금 플레이헤드 화면 위에 부품을 얹어 재생(실제 넣었을 때와 같은 자리·같은 배경), 타일 자체도 같이 움직인다. */
  const peek = { id: null, el: null, pinned: false, raf: 0, t0: 0, timer: 0 };
  const pk = $('partPeek'), pkCv = pk.querySelector('canvas'), pkCtx = pkCv.getContext('2d'), pkProg = pk.querySelector('.pk-prog i');
  function peekPlace(el) {
    const r = el.getBoundingClientRect(), w = 400, h = 225 + 44;
    let x = r.left - w - 14, y = Math.min(window.innerHeight - h - 12, Math.max(12, r.top - 20));
    if (x < 12) x = Math.min(window.innerWidth - w - 12, r.right + 14);
    pk.style.left = x + 'px'; pk.style.top = y + 'px';
  }
  function peekStart(id, el) {
    const def = PT.def(id); if (!def) return;
    peek.id = id; peek.el = el; peek.t0 = performance.now();
    $('pkName').textContent = def.name; pk.classList.remove('hidden'); peekPlace(el);
    cancelAnimationFrame(peek.raf);
    const tile = partThumbs.get(id), tctx = tile && tile.getContext('2d');
    const loop = () => {
      if (peek.id !== id) return;
      const cyc = def.dur + 0.7, t = ((performance.now() - peek.t0) / 1000) % cyc, tt = Math.min(def.dur - 1 / FPS, t);
      const bg = P.total() ? pv : null;
      paintThumbInto(pkCtx, 480, 270, id, tt, bg);
      if (tctx) { tctx.clearRect(0, 0, 240, 135); PT.paintThumb(tctx, 240, 135, id, null, P.data.theme, tt, null); }
      pkProg.style.width = Math.round(tt / def.dur * 100) + '%'; $('pkTime').textContent = tt.toFixed(1) + ' / ' + def.dur + '초';
      peek.raf = requestAnimationFrame(loop);
    };
    loop();
  }
  function paintThumbInto(ctx, w, h, id, tt, bg) { ctx.clearRect(0, 0, w, h); PT.paintThumb(ctx, w, h, id, null, P.data.theme, tt, bg); }
  function peekHover(id, el) { if (peek.pinned) return; clearTimeout(peek.timer); peek.timer = setTimeout(() => peekStart(id, el), 180); }
  function peekLeave(id) { clearTimeout(peek.timer); if (peek.pinned) return; peekStop(); }
  function peekStop() {
    cancelAnimationFrame(peek.raf); const id = peek.id; peek.id = null; pk.classList.add('hidden');
    if (id) { const tile = partThumbs.get(id); const th = PT.thumb(id, null, P.data.theme, 240, 135); if (tile && th) { const c = tile.getContext('2d'); c.clearRect(0, 0, 240, 135); c.drawImage(th, 0, 0); } }
  }
  function peekPin(id) {
    const el = $('partGrid').querySelector('.pc[data-id="' + id + '"]'); if (!el) return;
    if (peek.pinned && peek.id === id) { peekHide(true); return; }
    peek.pinned = true; peekStart(id, el);
    $('partGrid').querySelectorAll('.pc.peek').forEach(x => x.classList.remove('peek')); el.classList.add('peek');
  }
  function peekHide(all) { peek.pinned = false; peekStop(); $('partGrid').querySelectorAll('.pc.peek').forEach(x => x.classList.remove('peek')); }
  $('pkPlace').onclick = () => { const id = peek.id; peekHide(true); if (id) placePart(id, ph); };
  $('pkClose').onclick = () => peekHide(true);
  pk.addEventListener('pointerenter', () => clearTimeout(peek.timer));
  pk.addEventListener('pointerleave', () => { if (!peek.pinned) peekStop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && peek.pinned) peekHide(true); });
  window.KMV_PEEK = { get id() { return peek.id; }, get pinned() { return peek.pinned; }, pin: peekPin, hide: peekHide };
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
    refreshPartFx(pt);
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
  /* ---------- 생성 배경음악 (설계 v1 §2) ----------
     케이무비가 직접 만드는 음악 — 파일이 없으니 미디어 메타에 스펙만 남고 새로고침 복원도 스펙으로 된다.
     비트 격자는 BPM 그대로라 몽타주·박자 스냅이 어긋나지 않는다. */
  const GEN = window.KMV_GEN, SFX = window.KMV_SFX;
  const genSpec = { mood: 'morning', bpm: 0, key: '', seed: 1, len: 'video' };
  let genPrev = null;
  function genMood() { return GEN.mood(genSpec.mood); }
  function genLenSec() {
    if (genSpec.len === 'video') { const t = P.total(); return t ? t / FPS : 0; }
    return +genSpec.len;
  }
  function genSpecNow() { const M = genMood(); return { mood: M.id, bpm: genSpec.bpm || M.bpm.def, key: genSpec.key || M.keys[0], seed: genSpec.seed, durSec: Math.max(8, genLenSec() || 60) }; }
  function stopGenPrev() { if (genPrev) { try { genPrev.stop(); } catch (e) {} genPrev = null; } }
  if (GEN) {
    GEN.MOODS.forEach(m => segBtn($('genMoodSeg'), m.id, m.ko, () => { genSpec.mood = m.id; genSpec.bpm = 0; genSpec.key = ''; refreshGenPanel(); }, m.desc));
    ['video', '60', '120'].forEach((k, i) => segBtn($('genLenSeg'), k, ['영상 길이', '1분', '2분'][i], () => { genSpec.len = k; refreshGenPanel(); }));
    $('genBpm').oninput = e => { genSpec.bpm = +e.target.value; $('genBpmV').textContent = e.target.value + ' BPM'; };
    $('btnGenShuffle').onclick = () => { genSpec.seed = (genSpec.seed + 1) % 9973; stopGenPrev(); toast('다시 섞었어요 — 미리듣기로 확인해 보세요', 1600); };
    $('btnGenPrev').onclick = async () => {
      stop(); stopGenPrev();
      const A = window.KMV_AUDIO, actx = A.ctx();
      if (actx.state !== 'running') { try { await actx.resume(); } catch (e) {} }
      const sp = genSpecNow(), src = GEN.source(sp), sec = Math.min(6, src.durSec);
      const n = Math.round(sec * src.sr), r = src.read(0, n);
      const buf = actx.createBuffer(2, n, src.sr);
      buf.copyToChannel(r.ch[0], 0); buf.copyToChannel(r.ch[1], 1);
      const node = actx.createBufferSource(); node.buffer = buf; node.connect(actx.destination); node.start();
      genPrev = node; node.onended = () => { if (genPrev === node) genPrev = null; };
      toast(genMood().ko + ' · ' + sp.bpm + 'BPM — 앞 ' + Math.round(sec) + '초', 1800);
    };
    $('btnGenPlace').onclick = () => {
      stop(); stopGenPrev();
      const sp = genSpecNow();
      if (genSpec.len === 'video' && !P.total()) return toast('영상이 없어요 — 길이를 1분·2분으로 골라 주세요');
      const id = 'gen' + Date.now().toString(36);
      const { meta } = GEN.mediaMeta(sp, id);
      M.addGen(meta); P.addMedia(meta);
      const a = P.addA2(id, 0);
      if (a) { const tot = P.total(); if (tot && meta.dur > tot) P.updateA2(a.id, { out: tot, fadeOut: Math.min(2 * FPS, tot) }, { commit: false }); selectA2(a.id); }
      refreshBin(); refreshMusicPanel(); dirty = true; draw();
      toast('배경음악을 만들어 놓았어요 — ' + genMood().ko + ' · ' + sp.bpm + 'BPM', 2400);
    };
  }
  function refreshGenPanel() {
    if (!GEN) return;
    const M0 = genMood();
    Array.from($('genMoodSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === genSpec.mood));
    Array.from($('genLenSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === genSpec.len));
    const bpmEl = $('genBpm'); bpmEl.min = M0.bpm.min; bpmEl.max = M0.bpm.max;
    if (document.activeElement !== bpmEl) { bpmEl.value = genSpec.bpm || M0.bpm.def; $('genBpmV').textContent = bpmEl.value + ' BPM'; }
    const ks = $('genKeySeg');
    if (ks.dataset.mood !== M0.id) {
      ks.innerHTML = ''; ks.dataset.mood = M0.id;
      M0.keys.forEach(k => { const K = GEN.KEYS.find(x => x.id === k); segBtn(ks, k, K ? K.ko : k, () => { genSpec.key = k; refreshGenPanel(); }); });
    }
    const cur = genSpec.key || M0.keys[0];
    Array.from(ks.children).forEach(b => b.classList.toggle('on', b.dataset.k === cur));
  }

  /* ---------- 효과음 (설계 v1 §3) ---------- */
  const SFX_GAINS = [[0.6, '조용히'], [1, '그대로'], [1.6, '크게']];
  if (SFX) {
    $('tgSfx').onclick = () => { const cfg = P.data.audio.sfx || { on: false }; P.setSfx({ on: !cfg.on }); toast(!cfg.on ? '자동 효과음 켬 — 전환·타이틀·자막에 소리가 붙어요' : '자동 효과음 끔', 1800); };
    SFX_GAINS.forEach(([v, l]) => segBtn($('sfxGainSeg'), String(v), l, () => P.setSfx({ gain: v })));
    SFX.LIST.forEach(d => segBtn($('sfxTrySeg'), d.id, d.ko, () => { stop(); SFX.preview(d.id); }, d.ko));
  }
  function refreshSfxPanel() {
    if (!SFX) return;
    const cfg = P.data.audio.sfx || { on: false, gain: 1 };
    $('tgSfx').classList.toggle('on', !!cfg.on);
    $('rowSfxGain').classList.toggle('hidden', !cfg.on);
    const n = cfg.on ? SFX.events().length : 0;
    Array.from($('sfxGainSeg').children).forEach(b => b.classList.toggle('on', Math.abs(+b.dataset.k - (cfg.gain == null ? 1 : cfg.gain)) < 0.01));
    const note = $('genNote'); if (note && cfg.on) note.dataset.n = n;
    $('rowSfxTry').title = cfg.on ? '지금 타임라인에 붙은 효과음 ' + n + '개' : '';
  }

  function refreshMusicPanel() {
    const a = selMusic();
    $('musicBody').classList.toggle('hidden', !a); $('musicNone').classList.toggle('hidden', P.data.A2.length > 0); const mcn = $('musicCardNone'); if (mcn) mcn.classList.toggle('hidden', !!a);
    const D = P.data.audio.ducking; $('tgDuck').classList.toggle('on', !!D.on); $('rowDuck').classList.toggle('hidden', !D.on);
    if (document.activeElement !== $('duckDepth')) { $('duckDepth').value = D.depth == null ? 12 : D.depth; $('duckDepthV').textContent = '-' + $('duckDepth').value + 'dB'; }
    $('tgBeat').classList.toggle('on', beatSnap);
    refreshAmbPanel(); refreshMontPanel(); refreshGenPanel(); refreshSfxPanel();
    if (!a) return;
    const m = P.media(a.media), src = M.get(a.media);
    $('mName').textContent = m.name; $('mName').title = m.name;
    $('mRange').textContent = tc(a.at) + ' → ' + tc(a.at + a.out - a.in) + ' · ' + secStr(a.out - a.in) + (src && src.beats ? ' · 비트 ' + src.beats.filter(b => { const f = Math.round(b * FPS); return f >= a.in && f < a.out; }).length + '개' : '');
    if (document.activeElement !== $('mVol')) { $('mVol').value = Math.round((a.vol == null ? 1 : a.vol) * 100); $('mVolV').textContent = $('mVol').value + '%'; }
    Array.from($('fadeInSeg').children).forEach(b => b.classList.toggle('on', +b.dataset.k === (a.fadeIn || 0)));
    Array.from($('fadeOutSeg').children).forEach(b => b.classList.toggle('on', +b.dataset.k === (a.fadeOut || 0)));
  }

  /* ---------- 4단계 잔여 패널: 앰비언스·몽타주 ---------- */
  function ambState() { return P.data.audio.ambience || { on: false, src: null, gain: 1 }; }
  function findRoomTone(silent) {
    const rt = A.findRoomTone();
    if (!rt) { if (!silent) toast(refreshStatusCount() ? '아직 현장음 분석 중이에요 — 잠시 후 다시 눌러 주세요' : '룸톤을 찾을 현장음이 없어요 (소리 있는 영상 클립이 타임라인에 있어야 해요)', 2600); return null; }
    return { media: rt.media, in: rt.in, out: rt.out };
  }
  function refreshStatusCount() { return P.data.media.filter(m => { const s = M.get(m.id); return s && s.kind === 'video' && !s.analyzed; }).length; }
  $('tgAmb').onclick = () => {
    stop(); const amb = ambState();
    if (amb.on) { P.setAmbience({ on: false }); return; }
    const src = amb.src || findRoomTone(); if (!src) return;
    P.setAmbience({ on: true, src });
    toast('룸톤을 찾아 빈 구간에 깔았어요 — 재생해서 들어 보세요', 2200);
  };
  $('btnAmbFind').onclick = () => { stop(); const src = findRoomTone(); if (src) { P.setAmbience({ src, on: true }); toast('가장 조용한 1.5초를 다시 골랐어요', 1600); } };
  [['0.5', '조용히'], ['1', '그대로'], ['1.8', '살짝 크게']].forEach(([k, l]) => segBtn($('ambGainSeg'), k, l, () => { stop(); P.setAmbience({ gain: +k }); }));
  function refreshAmbPanel() {
    const amb = ambState(); $('tgAmb').classList.toggle('on', !!amb.on);
    $('rowAmbSrc').classList.toggle('hidden', !amb.on); $('rowAmbGain').classList.toggle('hidden', !amb.on);
    if (amb.src) { const m = P.media(amb.src.media); $('ambSrc').textContent = m ? m.name + ' · ' + tc(Math.round(amb.src.in * FPS / m.fps)) + ' 부터 ' + (A.AMB_SEC) + '초' : '(원본 없음)'; $('ambSrc').title = $('ambSrc').textContent; }
    else $('ambSrc').textContent = '아직 못 찾음';
    const gk = String(amb.gain == null ? 1 : amb.gain);
    Array.from($('ambGainSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === gk));
  }
  // 몽타주 깔기
  [['all', '끝까지'], ['4', '4개'], ['8', '8개']].forEach(([k, l]) => segBtn($('montRangeSeg'), k, l, () => { montRange = k; refreshMontPanel(); }));
  [['1', '1박'], ['2', '2박'], ['4', '4박']].forEach(([k, l]) => segBtn($('montEverySeg'), k, l, () => { montEvery = +k; refreshMontPanel(); }));
  [['motion', '움직임 큰 곳'], ['keep', '지금 자리']].forEach(([k, l]) => segBtn($('montPickSeg'), k, l, () => { montPick = k; refreshMontPanel(); }));
  /* 원본 motion(프레임별 0..1) 에서 needSrc 길이 창의 평균이 가장 큰 시작점. 클립 구간 안에서 먼저 찾고, 구간이 짧으면 원본 전체에서. */
  function pickMotionIn(c, m, needSrc) {
    const src = M.get(m.id); if (!src || !src.motion) return c.in;
    const mo = src.motion, n = mo.length;
    let lo = c.in, hi = c.out; if (hi - lo < needSrc) { lo = 0; hi = n; }
    if (hi - lo <= needSrc) return lo;
    let sum = 0; for (let i = lo; i < lo + needSrc; i++) sum += mo[i];
    let best = sum, bi = lo;
    for (let i = lo + 1; i + needSrc <= hi; i++) { sum += mo[i + needSrc - 1] - mo[i - 1]; if (sum > best) { best = sum; bi = i; } }
    return bi;
  }
  function montageClips() {
    const c0 = selClip() || P.clipAt(ph); if (!c0) return [];
    const i = P.clipIndex(c0.id), V = P.data.V;
    return (montRange === 'all' ? V.slice(i) : V.slice(i, i + (+montRange))).map(c => c.id);
  }
  function refreshMontPanel() {
    Array.from($('montRangeSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === montRange));
    Array.from($('montEverySeg').children).forEach(b => b.classList.toggle('on', +b.dataset.k === montEvery));
    Array.from($('montPickSeg').children).forEach(b => b.classList.toggle('on', b.dataset.k === montPick));
    const ids = montageClips(), hasBeat = beatFrames().length >= 2;
    $('btnMontage').disabled = !ids.length || !hasBeat;
    $('montNote').textContent = !hasBeat ? '음악(A2)을 먼저 놓아 주세요 — 비트 마커가 있어야 해요' : !ids.length ? '기준이 될 클립을 선택하거나 플레이헤드를 클립 위에 두세요' : '클립 ' + ids.length + '개의 길이를 ' + montEvery + '박 간격에 맞춰요. 컷 순서는 그대로, 길이만 박자 위로 (Ctrl+Z 로 되돌려요)';
  }
  $('btnMontage').onclick = () => {
    stop();
    const ids = montageClips(); if (!ids.length) return toast('기준 클립을 먼저 선택해 주세요');
    const bts = beatFrames(); if (bts.length < 2) return toast('음악을 먼저 놓아 주세요 — 비트 마커가 있어야 해요');
    const c0 = P.clip(ids[0]);
    const r = P.montage(ids, bts, { every: montEvery, pickIn: montPick === 'motion' ? pickMotionIn : null });
    if (!r) return toast('이 클립 뒤로는 비트 마커가 없어요 — 음악을 더 길게 놓거나 앞 클립을 선택해 주세요', 2800);
    select(c0.id); setPH(c0.at);
    toast('몽타주 ' + r.done + '개를 ' + montEvery + '박 간격에 맞췄어요' + (r.short ? ' · 원본이 짧아 다 못 채운 클립 ' + r.short + '개' : '') + (r.done < ids.length ? ' · 비트가 끝나 ' + (ids.length - r.done) + '개는 그대로' : ''), 3200);
  };

  /* ---------- 우측 패널: 미디어 ---------- */
  function refreshBin() {
    const bin = $('bin'); bin.innerHTML = '';
    if (!P.data.media.length) { bin.innerHTML = '<div class="bin-empty">아직 없어요.<br>영상·사진을 끌어다 놓으면 타임라인 끝에 붙어요.</div>'; return; }
    P.data.media.forEach(m => {
      const src = M.get(m.id);
      const isAud = m.kind === 'audio';
      const el = document.createElement('div'); el.className = 'mi' + (isAud ? ' audio' : '') + (!isAud && srcCur && srcCur.media === m.id ? ' on' : ''); el.title = isAud ? '클릭: 플레이헤드에 음악 놓기' : '클릭: 소스 모니터에서 열기 (I/O 로 구간을 잡아 , 삽입 · . 덮어쓰기) · ＋: 통째로 끝에 붙이기';
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
      if (!isAud) { const add = document.createElement('span'); add.className = 'add'; add.textContent = '＋'; add.title = '통째로 타임라인 끝에 붙이기'; add.onclick = ev => { ev.stopPropagation(); stop(); showStage('tl'); const c = P.addClip(m.id); select(c.id); setPH(c.at); toast(m.name + ' 을 끝에 붙였어요', 1500); }; el.appendChild(add);
        const pip = document.createElement('span'); pip.className = 'add'; pip.textContent = '⧉'; pip.title = '덧영상으로 — 플레이헤드 자리, 영상 위 작은 화면'; pip.onclick = ev => { ev.stopPropagation(); stop(); showStage('tl'); const o = P.addV2(m.id, ph); if (o) { selectV2(o.id); setPH(o.at); toast(m.name + ' 을 덧영상으로 놓았어요 — 오른쪽에서 위치·크기', 2200); } }; el.appendChild(pip); }
      const x = document.createElement('span'); x.className = 'x'; x.textContent = '✕'; x.title = '미디어 제거 (타임라인에서도 빠져요)';
      x.onclick = ev => { ev.stopPropagation(); if (!confirm('"' + m.name + '" 을 지울까요? 타임라인의 클립도 함께 빠져요.')) return; stop(); if (srcCur && srcCur.media === m.id) { srcCur = null; srcMemo.delete(m.id); showStage('tl'); $('stageTabs').classList.add('hidden'); } P.removeMedia(m.id); M.remove(m.id); DB.delMedia(m.id); if (sel && !P.clip(sel)) select(null); if (selA2 && !P.a2(selA2)) selectA2(null); setPH(ph); refreshBin(); };
      el.appendChild(x);
      if (isAud) el.onclick = () => { stop(); const a = P.addA2(m.id, ph); if (a) { selectA2(a.id); select(null); selectS(null); selectP(null); selectV2(null); setPH(a.at); toast(m.name + ' 을 ' + tc(a.at) + ' 에 놓았어요', 1500); } };
      else el.onclick = () => openSource(m.id);
      bin.appendChild(el);
    });
  }
  let thumbTick = 0;
  function analyzeBg(id) {
    M.analyze(id, p => {
      binProg[id] = p;
      const bar = document.querySelector('#bin .bar[data-id="' + id + '"] i'); if (bar) bar.style.width = Math.round(p * 100) + '%';
      const now = performance.now();
      if (p >= 1 || now - thumbTick > 700) { thumbTick = now; dirty = true; draw(); if (p >= 1) { refreshBin(); refreshStatus(); const amb = ambState(); if (amb.on && !amb.src) { const src = findRoomTone(true); if (src) P.setAmbience({ src }, { commit: false }); } refreshMusicPanel(); } }
    }).catch(e => console.warn('analyze', e));
  }
  function refreshStatus() {
    const n = P.data.media.filter(m => { const s = M.get(m.id); return s && (s.kind === 'video' || s.kind === 'audio') && !s.analyzed; }).length;
    status(n ? '썸네일·모션·파형 분석 중 ' + n + '개' : '');
  }

  /* ---------- 가져오기 ---------- */
  let importing = false; const importQueue = [];
  async function importFiles(files) {
    // files: File 또는 KMV_SHELL.PathRef(데스크톱판, 경로만). 껍데기는 mkv·avi·mts 등도 프록시로 바꿔 준다.
    const shellRe = /\.(mp4|mov|m4v|mkv|avi|mts|m2ts|webm|3gp|wmv|png|jpe?g|webp|bmp|gif|mp3|wav|m4a|aac|ogg|oga|flac)$/i;
    files = files.filter(f => f.isPathRef ? shellRe.test(f.name) : (/^(video|image|audio)\//.test(f.type) || /\.(mp4|mov|m4v|png|jpe?g|webp|mp3|wav|m4a|aac|ogg)$/i.test(f.name)));
    if (!files.length) return toast('mp4·mov 영상, jpg·png 사진, mp3·wav·m4a 음악만 넣을 수 있어요');
    if (importing) { importQueue.push(...files); toast('앞 파일 다음에 이어서 넣을게요 (' + importQueue.length + '개 대기)', 1500); return; }
    importing = true; stop();
    const first = !P.total();
    while (files.length) {
      let f = files.shift();
      status('가져오는 중: ' + f.name);
      try {
        if (f.isPathRef) {
          // 데스크톱판: 껍데기가 프록시를 만들어 준다 (진행률은 덮개에)
          OV.show('원본 준비 중'); OV.set(0, f.name);
          try { f = await SH.file(f, { status: t => OV.set(0.9, t), progress: (p, l) => OV.set(p, l) }); } finally { OV.hide(); }
        }
        const meta = await M.open(f, null, s => status(s + ' — ' + f.name));
        if (f.kmvOrigin) meta.origin = f.kmvOrigin;   // 원본 경로·해시 — 복원은 디스크의 프록시에서
        P.addMedia(meta);
        if (!f.kmvOrigin) {
          if (f.size <= 1500 * 1024 * 1024) DB.putMedia(meta.id, f, f.name).catch(e => console.warn('db', e));
          else toast(f.name + ' — 원본이 커서 새로고침 복원 목록엔 못 넣어요. 새로고침하면 이 파일만 다시 넣어 주세요', 4500);
        }
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
  if (SH && SH.active) SH.listenDrop(refs => importFiles(refs), on => document.body.classList.toggle('dragover', !!on));

  /* ---------- 프로젝트 변경 반응 ---------- */
  P.on(kind => {
    dirty = true;
    for (const id of [...selSet]) if (!P.clip(id)) selSet.delete(id);
    if (sel && !P.clip(sel)) sel = selSet.size ? [...selSet][0] : null;
    if (selM && !P.marker(selM)) selM = null;
    if (srcCur && !P.media(srcCur.media)) { srcCur = null; if (stage === 'src') showStage('tl'); $('stageTabs').classList.add('hidden'); }
    refreshMarkerList();
    refreshPanel(); refreshProject();
    scheduleSave(); if (!drag) refreshBin();
    if (!drag) {
      refreshLookPanel(); refreshSubPanel(); refreshPartPanel(); refreshMusicPanel();
      if (selS && !P.subtitle(selS)) { selS = null; refreshSubPanel(); }
      if (selP && !P.part(selP)) { selP = null; refreshPartPanel(); }
      if (selA2 && !P.a2(selA2)) { selA2 = null; refreshMusicPanel(); }
      if (selV2 && !P.v2(selV2)) { selV2 = null; refreshV2Panel(); }
      if (kind === 'look' || kind === 'load') paintPartThumbs();
      if (!playing && (kind === 'look' || kind === 'S' || kind === 'P' || kind === 'V2' || kind === 'change' || kind === 'load' || kind === 'undo' || kind === 'redo')) renderPreview();
    }
    if (!drag) { const tot = P.total(); if (ph > Math.max(0, tot - 1)) ph = Math.max(0, tot - 1); }
    if (stage === 'src' && !playing && !drag) renderSource();
    draw();
  });

  /* ---------- 작업 열기·복구 ----------
     loadDoc(json): 미디어를 되살리고(원본은 이 기기 IndexedDB·껍데기 디스크에서, 생성 음악은 스펙만으로) P.load.
     원본이 없는 미디어는 뺀다(그 클립도 함께) — 준호 결정(2026-08-31). 빠진 이름을 돌려준다. */
  async function loadDoc(json, title) {
    stop();
    P.data.media.forEach(m => M.remove(m.id));
    P.reset(); select(null);
    if (!json || !json.media || !json.media.length) { refreshBin(); refreshStatus(); return { missing: [] }; }
    OV.show(title || '작업 불러오는 중');
    const ok = [], missing = [];
    for (let i = 0; i < json.media.length; i++) {
      const m = json.media[i]; OV.set(i / json.media.length, m.name);
      try {
        if (m.gen) { const r = M.addGen(m); if (r) { ok.push(m); continue; } }
        let blob = null;
        if (m.origin && SH && SH.active) blob = await SH.restoreFile(m.origin, { status: t => OV.set(i / json.media.length, t), progress: (p, l) => OV.set((i + p) / json.media.length, l) });
        else { const rec = await DB.getMedia(m.blobKey || m.id); blob = rec && rec.blob; }
        if (!blob) { missing.push(m.name); continue; }
        const meta = await M.open(blob, m.id, s => OV.set(i / json.media.length, s + ' — ' + m.name));
        if (m.origin) meta.origin = blob.kmvOrigin || m.origin;
        ok.push(meta);
      } catch (e) { console.warn('restore', m.name, e); missing.push(m.name); }
    }
    json.media = ok;
    P.load(json);
    ok.forEach(m => analyzeBg(m.id));
    refreshBin(); refreshStatus();
    OV.hide();
    return { missing };
  }
  /* 작업 레코드를 현재 작업으로 */
  async function openRecord(r) {
    proj.id = r.id; proj.name = r.name || '새 작업'; proj.degraded = false; proj.cloudAt = r.where === 'cloud' || r.where === 'both' ? (r.cloudAt || r.updatedAt || 0) : 0; proj.cloudErr = null;
    const { missing } = await loadDoc(r.doc ? JSON.parse(JSON.stringify(r.doc)) : null, '「' + proj.name + '」 여는 중');
    await ST.local.setCurrent(proj.id);
    zoomFit(); setPH(0);
    if (missing.length) {
      proj.degraded = true;
      toast('이 기기에 없는 원본 ' + missing.length + '개(' + missing.slice(0, 3).join(', ') + (missing.length > 3 ? ' 외' : '') + ')는 그 클립과 함께 뺐어요 — 계정 저장은 멈춰요', 6000);
    }
    if (r.doc) { ST.local.put(Object.assign({}, r, { updatedAt: r.updatedAt || Date.now() })).catch(() => {}); }   // 클라우드에서 연 것도 이 기기에 사본
    refreshSaveNote(); refreshProject();
    return missing;
  }
  async function newProject(name) {
    const r = ST.make({ media: [], V: [] }, name || ('새 작업 ' + new Date().toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })));
    await openRecord(r);
    await ST.save(rec(), { cloud: false });
    refreshSaveNote();
    return r;
  }
  function renameCurrent() {
    const v = prompt('작업 이름', proj.name); if (v == null) return;
    const name = v.trim() || proj.name; proj.name = name; ST.rename(proj.id, name).catch(() => {}); scheduleSave(); refreshSaveNote();
  }
  /* 시작: 현재 작업 id → 레코드. 없으면 옛 단일 저장(kv 'project')을 「이전 작업」으로 옮긴다. */
  async function restore() {
    try { await DB.open(); } catch (e) { console.warn('idb', e); }
    ST.init(DB);
    let cur = null; try { cur = await ST.local.current(); } catch (e) {}
    let r = cur ? await ST.local.get(cur).catch(() => null) : null;
    if (!r) {
      let legacy = null; try { legacy = await DB.getKV('project'); } catch (e) {}
      if (legacy && legacy.media && legacy.media.length) { r = ST.make(legacy, '이전 작업'); await ST.local.put(r); try { await DB.putKV('project', null); } catch (e) {} }
    }
    if (!r) { await newProject('새 작업'); return; }
    await openRecord(r);
    ST.cloud.ready().then(ok => { if (ok && !proj.degraded) saveCloud(); }).catch(() => {});
  }

  /* ---------- 「내 작업」 모달 ---------- */
  const fmtAgo = t => { if (!t) return ''; const d = Date.now() - t; if (d < 60e3) return '방금'; if (d < 3600e3) return Math.round(d / 60e3) + '분 전'; if (d < 86400e3) return Math.round(d / 3600e3) + '시간 전'; return new Date(t).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }); };
  async function openProjModal() {
    stop();
    const md = $('projModal'); md.classList.remove('hidden');
    const ul = $('projList'); ul.innerHTML = '<div class="note">불러오는 중…</div>';
    clearTimeout(saveT); await ST.save(rec(), { cloud: false }).catch(() => {});
    let items = []; try { items = await ST.list(); } catch (e) { console.warn('list', e); }
    const signed = await ST.cloud.ready().catch(() => false);
    $('projCloudNote').textContent = signed ? '케이에듀 계정에 저장된 작업은 어느 기기에서든 여기 보여요. 원본 영상은 그 기기에 있어야 해요.' : '로그인하면 작업이 계정에도 저장돼 다른 기기에서 열 수 있어요. 지금은 이 브라우저에만 저장돼요.';
    ul.innerHTML = '';
    if (!items.length) ul.innerHTML = '<div class="note">아직 저장된 작업이 없어요.</div>';
    for (const it of items) {
      const row = document.createElement('div'); row.className = 'prow' + (it.id === proj.id ? ' cur' : '');
      const where = it.where === 'both' ? '☁ 계정 · 이 기기' : it.where === 'cloud' ? '☁ 계정' : '💾 이 기기';
      row.innerHTML = '<div class="pmain"><b></b><small></small></div><div class="pact"><button data-a="open" class="gold">열기</button><button data-a="rename" title="이름 바꾸기">이름</button><button data-a="file" title=".kmv 파일로 내려받기">파일</button><button data-a="del" class="danger">삭제</button></div>';
      row.querySelector('b').textContent = it.name + (it.id === proj.id ? '  (지금 작업)' : '');
      row.querySelector('small').textContent = where + ' · ' + fmtAgo(it.updatedAt) + ' · ' + secStr(Math.round((it.durSec || 0) * FPS)) + ' · 클립 ' + (it.clips || 0);
      row.querySelector('[data-a="open"]').onclick = async () => { if (it.id === proj.id) { md.classList.add('hidden'); return; } const r = await ST.get(it.id); if (!r || !r.doc) return toast('이 작업을 불러오지 못했어요'); md.classList.add('hidden'); await openRecord(r); toast('「' + r.name + '」 열었어요', 1800); };
      row.querySelector('[data-a="rename"]').onclick = async () => { const v = prompt('작업 이름', it.name); if (v == null) return; const name = v.trim() || it.name; await ST.rename(it.id, name); if (it.id === proj.id) { proj.name = name; refreshSaveNote(); } openProjModal(); };
      row.querySelector('[data-a="file"]').onclick = async () => { const r = it.id === proj.id ? rec() : await ST.get(it.id); if (!r || !r.doc) return toast('파일로 만들지 못했어요'); ST.download(r); toast('.kmv 파일로 내려받아요 — 다른 기기에서 「파일 가져오기」', 2400); };
      row.querySelector('[data-a="del"]').onclick = async () => { if (!confirm('「' + it.name + '」을 지울까요? (이 기기와 계정 모두에서 지워져요)')) return; await ST.remove(it.id); if (it.id === proj.id) await newProject(); openProjModal(); };
      ul.appendChild(row);
    }
  }
  $('btnProjClose').onclick = () => $('projModal').classList.add('hidden');
  $('projModal').addEventListener('click', e => { if (e.target === $('projModal')) $('projModal').classList.add('hidden'); });
  $('btnProjNew').onclick = async () => { $('projModal').classList.add('hidden'); await newProject(); toast('새 작업을 열었어요 — 이름은 위 제목을 눌러 바꿔요', 2400); };
  $('btnProjCopy').onclick = async () => {
    const r = ST.make(P.toJSON(), proj.name + ' 사본'); proj.id = r.id; proj.name = r.name; proj.degraded = false; proj.cloudAt = 0; proj.cloudErr = null;
    await ST.save(rec()); await ST.local.setCurrent(r.id); refreshSaveNote(); $('projModal').classList.add('hidden'); toast('「' + r.name + '」으로 저장했어요', 2200);
  };
  $('btnProjImport').onclick = () => $('kmvIn').click();
  $('kmvIn').onchange = async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    try { const r = await ST.fromFile(f); $('projModal').classList.add('hidden'); await openRecord(r); await ST.save(rec()); refreshSaveNote(); toast('「' + r.name + '」 파일을 열었어요', 2200); }
    catch (err) { toast(err.message || '작업 파일을 읽지 못했어요', 3000); }
  };

  window.KMV_UI = { importFiles, setPH: f => setPH(f), get ph() { return ph; }, select, selectP, selectA2, selectS, placePart, play, stop, zoomFit, get pxf() { return pxf; }, get scrollF() { return scrollF; }, get selP() { return selP; }, get selA2() { return selA2; }, beatFrames,
    get sel() { return sel; }, selectedIds, openSource, showStage, get stage() { return stage; }, get src() { return srcCur; }, setSrcPH, srcMark, srcPlace, shuttleTo, get shuttle() { return shuttle; }, get playing() { return playing || srcPlaying; }, doMarker, doCopy, doCut, doPaste, get clipboard() { return clipboard; }, get selM() { return selM; }, layout: { HEAD, RULER, LY }, xOf, frameOf, laneRows, rowGeom, selectV2, get selV2() { return selV2; }, get delChip() { return delChip; }, get proj() { return proj; }, openRecord, newProject, loadDoc, saveCloud, openProjModal, tab: setTab, get toolTab() { return toolTab; } };

  /* ---------- 시작 ---------- */
  resize();
  refreshBin(); refreshPanel(); refreshProject(); refreshLookPanel(); refreshSubPanel(); buildPartGrid(); refreshPartPanel(); refreshMusicPanel(); refreshMarkerList();
  document.fonts && document.fonts.ready.then(() => { paintPartThumbs(); if (!playing) renderPreview(); });
  LK.ready().then(() => { if (P.total()) renderPreview(); });
  $('zoom').value = Math.round(1000 * Math.log(pxf / MIN_PXF) / Math.log(MAX_PXF / MIN_PXF));
  /* ---------- 데스크톱 껍데기 ---------- */
  async function refreshShellRow() {
    if (!SH || !SH.active) return;
    const row = $('shellRow'); if (!row) return;
    row.hidden = false; row.style.display = 'flex'; $('shellBadge').hidden = false;
    const ci = await SH.cacheInfo().catch(() => null);
    $('shellCache').textContent = ci ? '프록시 ' + ci.count + '개 · ' + SH.fmtBytes(ci.bytes) : '프록시 정보 없음';
    const note = $('saveNote'); if (note) note.textContent = '원본은 그 자리에 두고 프록시로 편집, 내보내기는 원본 화질로 렌더해요.';
  }
  if (SH && SH.active) {
    $('btnCacheClear').onclick = async () => { if (!confirm('보관된 프록시를 모두 지울까요? (열려 있는 작업은 새로고침 때 원본에서 다시 만들어요)')) return; await SH.cacheClear(); refreshShellRow(); toast('프록시를 비웠어요'); };
    $('btnCacheDir').onclick = () => SH.openCacheDir();
  }

  (SH && SH.active ? SH.init().then(refreshShellRow) : Promise.resolve())
    .then(() => { if (SH && SH.active && SH.info && SH.info.ffmpeg === false) toast('ffmpeg 를 찾지 못했어요 — 설치가 온전한지 확인해 주세요', 6000); })
    .then(restore).then(() => { refreshShellRow(); });
  window.addEventListener('pagehide', () => { if (proj.id) { clearTimeout(saveT); ST.save(rec(), { cloud: false }).catch(() => {}); } });
})();
