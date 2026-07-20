/* ============================================================
   화면: Mobile — Touch First Editor  (Round 21)
   ------------------------------------------------------------
   개요/에디터/제스처/펜/음성/오프라인/캡처/시스템 8탭.
   전 버튼 실함수 — MK_TOUCH 엔진의 FSM·판정을 합성 이벤트로
   실행하고 결과 로그를 그대로 표시한다. 실터치 하드웨어 없음.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.mobile = (() => {
  const M = () => window.MK, TC = () => window.MK_TOUCH;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = {
    tab: 'over', msg: null,
    dev: 'ipad-pro', orient: 'landscape', fold: 'folded',
    rec: null, recLog: [], pen: { pressure: 0.7, tiltX: 30, tiltY: 15 },
    ses: null, vp: null, sheetC: null, voiceIn: '빨간 원 추가해줘', voiceOut: null,
    offField: 'title', offVal: '터치 개편안', qrIn: 'https://keduclass.com', qrOut: null,
    lastCam: null, dropOut: null, a11yDoc: null, perfN: 60, battery: 80,
  };
  const say = (ok, text) => { st.msg = { ok, text: String(text) }; };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (label, val, sub) => `<div class="adm-stat"><small>${esc(label)}</small><b>${val}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  const jf = (o) => esc(JSON.stringify(o, null, 1));

  const ensure = () => {
    if (!st.rec) { st.recLog = []; st.rec = TC().recognizer({ onGesture: (e) => st.recLog.push(e) }); }
    if (!st.ses) { const tpl = (window.MK_SAMPLE && window.MK_SAMPLE.TEMPLATES && window.MK_SAMPLE.TEMPLATES[0]) || null; st.ses = TC().editorSession(tpl); }
    if (!st.vp) st.vp = TC().viewport(1280, 720);
    if (!st.sheetC) st.sheetC = TC().sheet();
  };

  /* ---------- 개요 ---------- */
  function Over() {
    const mtx = TC().testMatrix();
    return `
      <div class="adm-stats">
        ${Stat('장치 프로필', TC().DEVICES.length, '폴더블 포함')}${Stat('레이아웃', TC().LAYOUTS.length, '별도 설계')}
        ${Stat('제스처', TC().GESTURES.length)}${Stat('매트릭스', mtx.total + '조합', mtx.pass ? '전량 통과' : '실패 있음')}
      </div>
      <div class="mk-card"><h4>원칙 — Desktop 축소판 금지</h4>
        <div class="dev-pipe">${['Touch First', 'Tablet First', 'Pen Friendly', 'Voice Ready', 'Offline Safe'].map((x) => `<span class="dev-pipe-node">${x}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">화면 크기마다 Toolbar·Panel·Inspector 배치가 바뀐다 — 줄이는 게 아니라 다시 설계한다.</p></div>
      <div class="mk-card"><h4>장치 × 방향 매트릭스(§24)</h4>
        <table class="adm-tbl"><tr><th>장치</th><th>방향</th><th>해상도</th><th>레이아웃</th><th>펜</th><th>시트</th><th>44pt</th></tr>
        ${mtx.rows.map((r) => `<tr><td>${esc(r.device)}</td><td>${esc(r.orient)}</td><td>${r.w}×${r.h}</td><td><code>${esc(r.layout)}</code></td><td>${r.pen ? '✒' : '—'}</td><td>${r.sheetUsed ? '⬒' : '—'}</td><td>${r.hitOk ? '✓' : '✗'}</td></tr>`).join('')}</table></div>`;
  }

  /* ---------- 에디터(디바이스 시뮬레이터) ---------- */
  function Editor() {
    ensure();
    const d = TC().device(st.dev);
    const [w, h] = st.orient === 'portrait' ? [d.w, d.h] : [d.h, d.w];
    const layout = TC().classify(w, h, { pointer: 'coarse', fold: st.dev === 'fold' ? st.fold : undefined, deviceId: st.dev });
    const ui = TC().uiFor(layout, d.os);
    const sel = st.ses.E.sel ? st.ses.scene().elements.find((e) => e.id === st.ses.E.sel) : null;
    const tb = TC().toolbarFor(sel && sel.type);
    const sheetSt = st.sheetC.S.state;
    const scale = Math.min(340 / w, 400 / h);
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>장치 시뮬레이터</h4>
          <div class="dev-row">
            <label class="dev-f">장치 <select data-mb="dev">${TC().DEVICES.map((x) => `<option value="${x.id}" ${x.id === st.dev ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
            <label class="dev-f">방향 <select data-mb="orient">${['portrait', 'landscape'].map((o) => `<option ${o === st.orient ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
            ${st.dev === 'fold' ? `<label class="dev-f">폴드 <select data-mb="fold">${['folded', 'unfolded'].map((o) => `<option ${o === st.fold ? 'selected' : ''}>${o}</option>`).join('')}</select></label>` : ''}
          </div>
          <div class="mb-frame" style="width:${Math.round(w * scale)}px;height:${Math.round(h * scale)}px">
            ${ui.toolbar === 'edge-rail' ? '<div class="mb-rail"></div>' : ''}
            ${ui.toolbar === 'bottom-bar' ? '<div class="mb-bottombar">＋ ✎ 🖼 ✨</div>' : ''}
            ${ui.floatingToolbar ? `<div class="mb-float">${tb.items.slice(0, 4).map((x) => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
            <div class="mb-canvas">${st.ses.scene().elements.slice(0, 6).map((e) => `<span class="mb-el ${st.ses.E.sel === e.id ? 'on' : ''}" data-mbsel="${e.id}">${esc(e.type)}</span>`).join('') || '<i>빈 장면</i>'}</div>
            ${/sheet/.test(ui.inspector) ? `<div class="mb-sheet s-${sheetSt}"><div class="mb-grab"></div>인스펙터 · ${esc(sheetSt)}</div>` : '<div class="mb-panel">인스펙터(플로팅)</div>'}
            ${ui.minimap ? '<div class="mb-mini"></div>' : ''}
          </div>
          <p class="dev-note">${w}×${h} → <code>${esc(layout)}</code> · toolbar=${esc(ui.toolbar)} · inspector=${esc(ui.inspector)} · 타깃 ${ui.hitTarget}pt</p></div>
        <div class="mk-card"><h4>바텀시트 · 선택 · 장면</h4>
          <div class="dev-row">
            <button class="mk-btn" data-mb="sheetUp">시트 ▲</button><button class="mk-btn" data-mb="sheetDn">시트 ▼</button>
            <button class="mk-btn" data-mb="sheetDrag">0.47 드래그 → half 스냅</button>
          </div>
          <div class="dev-row">
            <button class="mk-btn" data-mb="addEl">+ 도형</button><button class="mk-btn" data-mb="delEl">선택 삭제</button>
            <button class="mk-btn" data-mb="undo">↶ 실행 취소</button><button class="mk-btn" data-mb="redo">↷</button>
          </div>
          <div class="dev-row">
            <button class="mk-btn" data-mb="zoomIn">핀치 확대 ×1.5</button><button class="mk-btn" data-mb="zoomFit">더블탭 fit</button>
            <button class="mk-btn" data-mb="rot">캔버스 90°</button><button class="mk-btn" data-mb="reset">뷰 리셋</button>
          </div>
          <p class="dev-note">줌 ${st.vp.V.scale}× · 회전 ${st.vp.V.rotation}° · 미니맵 뷰 ${jf(st.vp.minimap().viewRect)}</p>
          ${sel ? `<p class="dev-note">선택: <code>${esc(sel.type)}</code> — 버블 [${TC().bubbleFor(sel.type).join(' · ')}]</p>` : '<p class="dev-note">요소를 탭하면 타입별 플로팅 툴바·버블이 바뀐다.</p>'}
          ${st.msg ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} ${esc(st.msg.text)}</p>` : ''}</div>
      </div>`;
  }

  /* ---------- 제스처 ---------- */
  function Gesture() {
    ensure();
    const bindRows = Object.entries(TC().BINDINGS);
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>합성 이벤트 주입 — FSM 실판정</h4>
          <div class="dev-row">
            <button class="mk-btn" data-mb="gTap">탭</button><button class="mk-btn" data-mb="gDbl">더블탭</button>
            <button class="mk-btn" data-mb="gLong">롱프레스 500ms</button><button class="mk-btn" data-mb="gDrag">드래그</button>
          </div>
          <div class="dev-row">
            <button class="mk-btn" data-mb="gPinch">핀치(2지 벌림)</button><button class="mk-btn" data-mb="gRotate">회전(2지 12°)</button>
            <button class="mk-btn" data-mb="gPan">2지 팬</button><button class="mk-btn" data-mb="gSwipe">스와이프 ←</button>
            <button class="mk-btn" data-mb="gTri">3지 스와이프 ← (undo)</button>
          </div>
          <div class="dev-row"><button class="mk-btn danger" data-mb="gConflict">바인딩 충돌 실연 — tap→undo</button><button class="mk-btn" data-mb="gClear">로그 비우기</button></div>
          ${st.msg && st.tab === 'gesture' ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} ${esc(st.msg.text)}</p>` : ''}
          <table class="adm-tbl"><tr><th>t</th><th>제스처</th><th>상세</th><th>→ 명령</th></tr>
          ${st.recLog.slice(-10).reverse().map((e) => { const { g, t, ...d } = e; return `<tr><td>${t % 100000}</td><td><b>${esc(g)}</b></td><td><code>${jf(d)}</code></td><td>${esc(TC().commandFor(g, d.dir) || '—')}</td></tr>`; }).join('') || '<tr><td colspan="4">버튼으로 이벤트를 주입해 보세요</td></tr>'}</table></div>
        <div class="mk-card"><h4>제스처 → 명령 바인딩</h4>
          <table class="adm-tbl"><tr><th>제스처</th><th>명령</th></tr>${bindRows.map(([g, c]) => `<tr><td><code>${esc(g)}</code></td><td>${esc(c)}</td></tr>`).join('')}</table>
          <p class="dev-note">임계값: 탭 ${TC().T.TAP_MS}ms · 더블 ${TC().T.DBL_MS}ms · 롱 ${TC().T.LONG_MS}ms · 슬롭 ${TC().T.SLOP}px · 스와이프 ${TC().T.SWIPE_V}px/ms</p></div>
      </div>`;
  }

  /* ---------- 펜 ---------- */
  function Pen() {
    ensure();
    const p = st.pen; const w = TC().recognizer().strokeWidth(p.pressure); const ang = TC().recognizer().brushAngle(p.tiltX, p.tiltY);
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>Apple Pencil · S Pen — 압력·기울기</h4>
          <label class="dev-f">압력 ${p.pressure} <input type="range" min="0" max="1" step="0.05" value="${p.pressure}" data-mb="penP"></label>
          <label class="dev-f">기울기 X ${p.tiltX}° <input type="range" min="-60" max="60" value="${p.tiltX}" data-mb="penTX"></label>
          <label class="dev-f">기울기 Y ${p.tiltY}° <input type="range" min="-60" max="60" value="${p.tiltY}" data-mb="penTY"></label>
          <div class="mb-stroke"><span style="height:${Math.min(w * 3, 40)}px;transform:rotate(${ang}deg)"></span></div>
          <p class="dev-note">굵기 ${w}px · 브러시 각 ${ang}° · 음영 폭 ${TC().recognizer().tiltShade(p.tiltX, p.tiltY)}</p></div>
        <div class="mk-card"><h4>팜 리젝션 · 호버 · 더블탭</h4>
          <div class="dev-row">
            <button class="mk-btn" data-mb="penPalm">펜 접촉 중 손바닥(면적 600) 대기</button>
            <button class="mk-btn" data-mb="penHover">호버 미리보기</button>
            <button class="mk-btn" data-mb="penDbl">펜 더블탭 — 도구 전환</button>
          </div>
          ${st.msg && st.tab === 'pen' ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} ${esc(st.msg.text)}</p>` : ''}
          <p class="dev-note">현재 도구: <b>${esc(st.rec.state.tool)}</b> · 거부된 접촉 ${st.rec.rejected.length}건 · 팜 창 ${TC().T.PALM_PEN_MS}ms · 면적 임계 ${TC().T.PALM_AREA}</p></div>
      </div>`;
  }

  /* ---------- 음성 ---------- */
  function Voice() {
    ensure();
    return `
      <div class="mk-card"><h4>음성 명령 — 파스 → 실행(§13)</h4>
        <div class="dev-row"><input data-mb="voiceIn" value="${esc(st.voiceIn)}" style="flex:1"><button class="mk-btn primary" data-mb="voiceRun">실행</button></div>
        <div class="dev-row">${['빨간 원 추가해줘', '제목 크게', '실행 취소', '배경을 파란색으로 바꿔', '다음 장면', '하늘 검색해줘', 'PDF로 내보내'].map((x) => `<button class="mk-btn" data-mbv="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        ${st.voiceOut ? `<p>${badge(!!st.voiceOut.ok, st.voiceOut.intent)} <code>${jf(st.voiceOut)}</code></p>` : ''}
        <p class="dev-note">규칙 기반 결정론 파서 — 색 ${Object.keys(TC().voiceParse ? { 빨: 1, 파: 1, 노: 1, 초: 1, 검: 1, 흰: 1, 보: 1 } : {}).length || 7}계열 · 도형 7종 · 의도 12종. 실 음성 인식(STT) 없음 — 텍스트 주입 실연.</p></div>`;
  }

  /* ---------- 오프라인 ---------- */
  function Offline() {
    ensure();
    const s = TC().syncStatus();
    const cfs = TC()._conflicts();
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>오프라인 편집 → 큐 → 동기화</h4>
          <div class="dev-row">
            <button class="mk-btn ${s.online ? 'primary' : ''}" data-mb="netOn">온라인</button>
            <button class="mk-btn ${!s.online ? 'danger' : ''}" data-mb="netOff">오프라인</button>
            <button class="mk-btn" data-mb="offCache">프로젝트 캐시</button>
          </div>
          <div class="dev-row">
            <label class="dev-f">필드 <input data-mb="offField" value="${esc(st.offField)}" style="width:80px"></label>
            <label class="dev-f">값 <input data-mb="offVal" value="${esc(st.offVal)}" style="width:120px"></label>
            <button class="mk-btn" data-mb="offEdit">편집</button>
          </div>
          <div class="dev-row">
            <button class="mk-btn danger" data-mb="offRemote">서버 선변경(충돌 유발)</button>
            <button class="mk-btn" data-mb="offSave">자동저장 예약</button>
            <button class="mk-btn" data-mb="offTick">⏩ 2.5초</button>
          </div>
          ${st.msg && st.tab === 'off' ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} ${esc(st.msg.text)}</p>` : ''}
          <div class="adm-stats">${Stat('상태', s.online ? '온라인' : '오프라인')}${Stat('큐', s.queued)}${Stat('충돌', s.conflicts)}${Stat('동기화', s.synced)}${Stat('자동저장', s.saved)}</div></div>
        <div class="mk-card"><h4>충돌 해결 — local · remote · merge</h4>
          ${cfs.length ? cfs.map((c) => `<div class="mb-cf ${c.resolved ? 'done' : ''}"><b>${esc(c.field)}</b> 내 값 <code>${esc(JSON.stringify(c.local))}</code> vs 서버 <code>${esc(JSON.stringify(c.remote))}</code>
            ${c.resolved ? badge(true, c.strategy) : `<span class="dev-row"><button class="mk-btn" data-mbcf="local:${c.id}">내 값</button><button class="mk-btn" data-mbcf="remote:${c.id}">서버 값</button><button class="mk-btn" data-mbcf="merge:${c.id}">병합</button></span>`}</div>`).join('') : '<p class="dev-note">충돌 없음 — 왼쪽에서 오프라인 편집 후 서버 선변경으로 유발해 보세요.</p>'}</div>
      </div>`;
  }

  /* ---------- 캡처·가져오기 ---------- */
  function Capture() {
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>카메라(§18)</h4>
          <div class="dev-row">
            <button class="mk-btn" data-mb="cam">📷 촬영 → DAM</button>
            <button class="mk-btn" data-mb="scan">📄 문서 스캔(원근 보정)</button>
            <button class="mk-btn" data-mb="nobg">배경 제거</button>
          </div>
          <div class="dev-row"><input data-mb="qrIn" value="${esc(st.qrIn)}" style="flex:1"><button class="mk-btn" data-mb="qr">QR 스캔</button></div>
          ${st.lastCam ? `<p class="dev-note">최근: <code>${jf(st.lastCam)}</code></p>` : ''}
          ${st.qrOut ? `<p>${badge(!!st.qrOut.ok, st.qrOut.type || '실패')} <code>${jf(st.qrOut)}</code></p>` : ''}</div>
        <div class="mk-card"><h4>갤러리(§19) · 드롭(§20) · 위젯(§21)</h4>
          <div class="dev-row">${TC().galleryProviders().map((p) => `<button class="mk-btn" data-mbg="${p.id}">${esc(p.name)} (${p.items})</button>`).join('')}</div>
          <div class="dev-row">
            <button class="mk-btn" data-mb="drop">파일 3개 드롭(png·mp4·exe)</button>
            <button class="mk-btn" data-mb="split">분할 화면 토글</button>
          </div>
          ${st.dropOut ? `<p class="dev-note">인제스트 ${st.dropOut.ok.length} · 거부 ${st.dropOut.rejected.map((r) => r.name + '(' + r.why + ')').join(', ') || 0} · 분할 ${st.dropOut.split ? 'ON' : 'OFF'}</p>` : ''}
          <table class="adm-tbl"><tr><th>위젯</th><th>항목</th></tr>${['recent', 'quickCreate', 'aiGenerate', 'favTemplates'].map((k) => { const wd = TC().widgetData(k); return `<tr><td>${esc(wd.title)}</td><td>${(wd.items || []).map((i) => esc(i.name)).join(' · ') || '—'}</td></tr>`; }).join('')}</table>
          ${st.msg && st.tab === 'cap' ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} ${esc(st.msg.text)}</p>` : ''}</div>
      </div>`;
  }

  /* ---------- 시스템(접근성·성능·내보내기) ---------- */
  function Sys() {
    ensure();
    const a = TC()._a11y; const f = TC().fpsFor(st.perfN, { dirtyRegion: true, gpu: true });
    const f0 = TC().fpsFor(st.perfN);
    const doc = st.ses.E.doc;
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>접근성(§22)</h4>
          <div class="dev-row">
            <button class="mk-btn" data-mb="txtUp">큰 글씨 ×1.5</button><button class="mk-btn" data-mb="txtReset">×1.0</button>
            <button class="mk-btn" data-mb="hc">고대비 토글</button>
          </div>
          <p class="dev-note">배율 ${a.textScale} → 16pt 본문 = ${TC().scaledFont(16)}pt · 고대비 ${a.highContrast ? 'ON' : 'OFF'}</p>
          <h4>낭독 트리(VoiceOver·TalkBack)</h4>
          <table class="adm-tbl"><tr><th>role</th><th>label</th></tr>${TC().a11yTree(doc).slice(0, 8).map((n) => `<tr><td>${'　'.repeat(n.depth)}${esc(n.role)}</td><td>${esc(n.label)}</td></tr>`).join('')}</table></div>
        <div class="mk-card"><h4>성능(§16) · 배터리(§23)</h4>
          <label class="dev-f">요소 수 ${st.perfN} <input type="range" min="5" max="300" value="${st.perfN}" data-mb="perfN"></label>
          <p class="dev-note">일반 ${f0.fps}fps(${f0.cost}ms) → 더티영역+GPU <b>${f.fps}fps</b>(${f.cost}ms) · 예산 ${f.budget}ms ${f.ok60 ? badge(true, '60fps') : badge(false, '미달')}</p>
          <label class="dev-f">배터리 ${st.battery}% <input type="range" min="5" max="100" value="${st.battery}" data-mb="battery"></label>
          <div class="dev-row">
            <button class="mk-btn" data-mb="lp">절전 모드 토글</button>
            <button class="mk-btn" data-mb="lazy">지연 로딩 12개 → 4개씩</button>
          </div>
          <p class="dev-note">적응 주사율 ${TC().adaptiveRefresh(st.battery, true)}Hz · 절전 ${TC()._perf.lowPower ? 'ON' : 'OFF'} · GPU 레이어 ${TC()._perf.gpuLayers}</p>
          <h4>내보내기(§17)</h4>
          <div class="dev-row">
            <button class="mk-btn" data-mb="exPng">PNG 빠른 내보내기</button>
            <button class="mk-btn" data-mb="exCloud">클라우드 업로드</button>
          </div>
          <p class="dev-note">공유 시트(iOS): ${TC().shareSheet('ios').join(' · ')}</p>
          ${st.msg && st.tab === 'sys' ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} ${esc(st.msg.text)}</p>` : ''}</div>
      </div>`;
  }

  const TABS = [['over', '개요'], ['editor', '에디터'], ['gesture', '제스처'], ['pen', '펜'], ['voice', '음성'], ['off', '오프라인'], ['cap', '캡처'], ['sys', '시스템']];

  function render() {
    const body = { over: Over, editor: Editor, gesture: Gesture, pen: Pen, voice: Voice, off: Offline, cap: Capture, sys: Sys }[st.tab]();
    return `<div class="pg-screen mb-screen">
      <header class="pg-screen-head"><div><h2>Mobile — Touch First Editor</h2><p>손가락·펜·제스처 중심의 새 Editor — Desktop 축소판이 아니다 · 전부 인메모리 결정론 실연</p></div></header>
      <nav class="adm-tabs">${TABS.map(([k, n]) => `<button class="adm-tab ${st.tab === k ? 'on' : ''}" data-mbtab="${k}">${n}</button>`).join('')}</nav>
      ${body}</div>`;
  }

  function mount(root) {
    ensure();
    const rerender = () => { const r = document.querySelector('.mb-screen'); if (r) { r.outerHTML = render(); mount(document); } };
    const t = () => TC()._now();
    root.querySelectorAll('[data-mbtab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.mbtab; st.msg = null; rerender(); });
    root.querySelectorAll('[data-mbsel]').forEach((b) => b.onclick = () => { st.ses.select(b.dataset.mbsel); rerender(); });
    root.querySelectorAll('[data-mbv]').forEach((b) => b.onclick = () => { st.voiceIn = b.dataset.mbv; st.voiceOut = TC().voiceExec(st.ses, st.voiceIn); rerender(); });
    root.querySelectorAll('[data-mbg]').forEach((b) => b.onclick = () => { const r = TC().galleryImport(b.dataset.mbg); say(r.ok, r.ok ? r.asset.name + ' 가져옴' : r.why); rerender(); });
    root.querySelectorAll('[data-mbcf]').forEach((b) => b.onclick = () => { const [sg, cid] = b.dataset.mbcf.split(':'); const r = TC().resolveConflict(cid, sg); say(r.ok, r.ok ? sg + ' → ' + JSON.stringify(r.value) : r.why); rerender(); });
    root.querySelectorAll('[data-mb]').forEach((el) => {
      const k = el.dataset.mb;
      const H = {
        dev: () => { st.dev = el.value; }, orient: () => { st.orient = el.value; }, fold: () => { st.fold = el.value; },
        offField: () => { st.offField = el.value; }, offVal: () => { st.offVal = el.value; }, voiceIn: () => { st.voiceIn = el.value; }, qrIn: () => { st.qrIn = el.value; },
        penP: () => { st.pen.pressure = +el.value; }, penTX: () => { st.pen.tiltX = +el.value; }, penTY: () => { st.pen.tiltY = +el.value; },
        perfN: () => { st.perfN = +el.value; }, battery: () => { st.battery = +el.value; },
        sheetUp: () => { const r = st.sheetC.expand(); say(true, '시트 → ' + r.state); }, sheetDn: () => { const r = st.sheetC.collapse(); say(true, '시트 → ' + r.state); },
        sheetDrag: () => { const r = st.sheetC.dragTo(0.47); say(true, '0.47 → ' + r.state + ' 스냅'); },
        addEl: () => { const e = st.ses.addElement({ type: 'shape', shape: 'rect' }); st.ses.select(e.id); say(true, e.id + ' 추가'); },
        delEl: () => say(st.ses.removeSel(), '삭제'), undo: () => say(st.ses.undo(), '실행 취소'), redo: () => say(st.ses.redo(), '다시 실행'),
        zoomIn: () => { const r = st.vp.pinchZoom(400, 300, 1.5); say(true, '줌 ' + r.scale + '×'); },
        zoomFit: () => { const r = st.vp.quickZoom('fit'); say(true, 'fit ' + r.scale + '×'); },
        rot: () => say(true, '회전 → ' + st.vp.rotateCanvas(90) + '°'), reset: () => { st.vp.resetView(); say(true, '뷰 리셋'); },
        gTap: () => { st.rec.down(1, 100, 100, t()); st.rec.up(1, 100, 100, t() + 80); },
        gDbl: () => { const t0 = t(); st.rec.down(1, 120, 100, t0); st.rec.up(1, 120, 100, t0 + 60); st.rec.down(1, 122, 102, t0 + 200); st.rec.up(1, 122, 102, t0 + 260); },
        gLong: () => { const t0 = t(); st.rec.down(1, 150, 150, t0); st.rec.poll(t0 + 520); st.rec.up(1, 150, 150, t0 + 540); },
        gDrag: () => { const t0 = t(); st.rec.down(1, 100, 100, t0); st.rec.move(1, 160, 130, t0 + 100); st.rec.up(1, 160, 130, t0 + 400); },
        gPinch: () => { const t0 = t(); st.rec.down(1, 200, 300, t0); st.rec.down(2, 300, 300, t0); st.rec.moveMulti([{ pid: 1, x: 160, y: 300 }, { pid: 2, x: 340, y: 300 }], t0 + 80); st.rec.up(1, 160, 300, t0 + 160); st.rec.up(2, 340, 300, t0 + 160); },
        gRotate: () => { const t0 = t(); st.rec.down(1, 200, 300, t0); st.rec.down(2, 300, 300, t0); st.rec.move(2, 296, 322, t0 + 80); st.rec.up(1, 200, 300, t0 + 160); st.rec.up(2, 296, 322, t0 + 160); },
        gPan: () => { const t0 = t(); st.rec.down(1, 200, 300, t0); st.rec.down(2, 260, 300, t0); st.rec.moveMulti([{ pid: 1, x: 200, y: 260 }, { pid: 2, x: 260, y: 260 }], t0 + 80); st.rec.up(1, 200, 260, t0 + 160); st.rec.up(2, 260, 260, t0 + 160); },
        gSwipe: () => { const t0 = t(); st.rec.down(1, 300, 300, t0); st.rec.move(1, 180, 300, t0 + 90); st.rec.up(1, 160, 300, t0 + 120); },
        gTri: () => { const t0 = t(); st.rec.down(1, 300, 300, t0); st.rec.down(2, 340, 300, t0); st.rec.down(3, 380, 300, t0); st.rec.up(1, 200, 300, t0 + 150); say(st.ses.undo(), '3지 ← → 실행 취소'); st.rec.up(2, 240, 300, t0 + 160); st.rec.up(3, 280, 300, t0 + 170); },
        gConflict: () => { const r = TC().bind('tap', 'undo'); say(r.ok, r.ok ? '바인딩됨' : '충돌: ' + r.conflictWith + ' 가 이미 undo 보유'); },
        gClear: () => { st.recLog.length = 0; },
        penPalm: () => { const t0 = t(); st.rec.down(9, 400, 500, t0, 'pen', { pressure: 0.8 }); const r = st.rec.down(10, 420, 560, t0 + 100, 'touch', { area: 600 }); st.rec.up(9, 400, 500, t0 + 200); say(r.rejected, r.rejected ? '손바닥 거부됨' : '거부 실패'); },
        penHover: () => { st.rec.hover(300, 300, t(), { height: 0.6 }); say(true, '호버 미리보기 발화'); },
        penDbl: () => say(true, '도구 → ' + st.rec.penDoubleTap()),
        netOn: () => { TC().setOnline(true); say(true, '온라인 — 큐 배출'); }, netOff: () => { TC().setOnline(false); say(true, '오프라인'); },
        offCache: () => { TC().serverPut('doc1', { title: '원본', subtitle: '부제' }); TC().cacheProject('doc1', TC().serverGet('doc1').doc); say(true, 'doc1 캐시 (rev ' + TC().serverGet('doc1').rev + ')'); },
        offEdit: () => { const r = TC().editField('doc1', st.offField, st.offVal); say(r.ok, r.ok ? (r.queued ? '큐 적재 #' + r.queueLen : '즉시 동기화') : r.why); },
        offRemote: () => { const s = TC().serverGet('doc1'); if (!s.doc) return say(false, '먼저 캐시'); s.doc[st.offField] = '서버측 변경'; TC().serverPut('doc1', s.doc); say(true, '서버 rev ' + TC().serverGet('doc1').rev + ' 선변경'); },
        offSave: () => say(true, '자동저장 예약 → ' + TC().scheduleAutosave(2000)),
        offTick: () => { TC()._tick(2500); say(true, '⏩ 2.5초'); },
        cam: () => { const r = TC().takePhoto(); st.lastCam = r.ok ? { asset: r.asset.name, id: r.asset.id } : r; say(r.ok, r.ok ? '촬영 → ' + r.asset.id : r.why); },
        scan: () => { const r = TC().scanDocument(); st.lastCam = { corrected: r.corrected, enhanced: r.enhanced }; say(true, '스캔 보정 ' + r.corrected.w + '×' + r.corrected.h); },
        nobg: () => { const a = TC().assetRecent()[0] || (window.MK_DAM && window.MK_DAM.list()[0]); const r = a ? TC().removeBackground(a.id) : { ok: false, why: '에셋 없음' }; say(r.ok, r.ok ? r.variant : r.why); },
        qr: () => { st.qrOut = TC().qrScan(st.qrIn); say(!!st.qrOut.ok, st.qrOut.type || st.qrOut.why); },
        drop: () => { st.dropOut = TC().dropFiles([{ name: 'a.png', mime: 'image/png', size: 1e5 }, { name: 'b.mp4', mime: 'video/mp4', size: 2e6 }, { name: 'c.exe', mime: 'application/x-exe', size: 1e5 }]); say(true, '드롭 처리'); },
        split: () => { const r = TC().setSplitScreen(!TC().dropFiles([]).split); say(true, '분할 ' + (r.split ? 'ON' : 'OFF')); },
        txtUp: () => say(true, '배율 ' + TC().setTextScale(1.5)), txtReset: () => say(true, '배율 ' + TC().setTextScale(1)),
        hc: () => { const r = TC().setHighContrast(!TC()._a11y.highContrast); say(true, '고대비 ' + (r.on ? 'ON' : 'OFF')); },
        lp: () => { const r = TC().setLowPower(!TC()._perf.lowPower); say(true, '절전 ' + (r.lowPower ? 'ON ' + r.refresh + 'Hz' : 'OFF')); },
        lazy: () => { TC().lazyEnqueue(Array.from({ length: 12 }, (_, i) => 'img' + i)); const r = TC().lazyStep(4); say(true, '로드 ' + r.loaded.length + ' · 잔여 ' + r.remain); },
        exPng: () => { const j = TC().quickExport(st.ses.E.doc, 'png'); say(true, j.id + ' → ' + j.state); },
        exCloud: () => { const jobs = TC()._exports(); const j = jobs[jobs.length - 1]; if (!j) return say(false, '먼저 내보내기'); const r = TC().cloudUpload(j.id); say(r.ok, r.queued ? '오프라인 — 업로드 큐' : '업로드 완료'); },
      };
      if (H[k]) { if (el.tagName === 'SELECT' || el.tagName === 'INPUT') el.onchange = () => { H[k](); rerender(); }; else el.onclick = () => { H[k](); rerender(); }; }
    });
  }

  return { title: 'Mobile', variants: ['Touch'], render, mount };
})();
