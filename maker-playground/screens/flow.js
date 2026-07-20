/* ============================================================
   화면: Flow — Flow Experience Studio  (Round 23)
   ------------------------------------------------------------
   개요/팔레트/예측/스마트UI/마찰제로/여정/분석/가드 8탭.
   전 버튼 실함수 — MK_FLOW 를 실제 실행하고 예측·지표·여정을
   그대로 표시한다. "왜 이렇게 편하지?" 를 판정 화면으로 실연.
   Ctrl+K 는 이 화면에서 실제 keydown 으로 팔레트를 연다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.flow = (() => {
  const FL = () => window.MK_FLOW, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = {
    tab: 'over', msg: null, doc: null,
    q: '메이커', palOpen: false, sel: null, expand: false,
    lastExec: null, lastPreview: null, lastPersona: null, lastLayout: null,
  };
  const say = (ok, t) => { st.msg = { ok, text: String(t) }; };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const jf = (o) => esc(JSON.stringify(o, null, 1));
  const fmt = (ms) => ms == null ? '—' : (ms / 1000).toFixed(1) + 's';

  const ensure = () => {
    if (!st.doc) st.doc = { title: 'Flow 데모', scenes: [{ id: 's1', sec: 'cover', elements: [{ type: 'text', text: '금성초 발표자료', x: 11, y: 13 }] }] };
  };
  const exec = (id, opts) => {
    ensure();
    const r = FL().execute(id, st.doc, { confirmed: true, sid: 'live', ...(opts || {}) });
    st.lastExec = r;
    say(r.ok, r.ok ? `${id} 실행 — 다음 추천: ${(r.next || []).map((n) => n.label).join(' · ')}` : (r.msg || r.reason || '실패'));
    return r;
  };

  /* ---------- 개요 ---------- */
  function Over() {
    ensure();
    const rep = FL().usabilityReport();
    return `
      <div class="adm-stats">
        ${Stat('1클릭 명령', rep.oneClick, '최대 ' + rep.maxClicks + '클릭')}
        ${Stat('단축키 커버', rep.keyboardCoverage ? '100%' : '미달', '§18')}
        ${Stat('모션 규격', rep.motionCompliant ? '150~250ms' : '위반', '§16')}
        ${Stat('여정', rep.journey, '§21')}
      </div>
      <div class="mk-card"><h4>Flow Engine (§1) — 생각→클릭→결과 최단 경로</h4>
        <div class="dev-pipe">${['Intent', 'Predict', 'Suggest', 'Execute', 'Continue'].map((x) => `<span class="dev-pipe-node">${x}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">새 기능을 추가하지 않는다 — 모든 UX 는 Flow 를 방해하지 않는다.</p></div>
      <div class="mk-card"><h4>UX Principles (§24)</h4>
        <table class="adm-tbl"><tr><th>원칙</th><th>내용</th></tr>
        ${FL().PRINCIPLES.map((p) => `<tr><td><code>${esc(p.id)}</code></td><td>${esc(p.text)}</td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>Context Awareness (§5) — AI 가 아는 현재</h4>
        <pre class="dev-pre">${jf(FL().context())}</pre></div>`;
  }

  /* ---------- 팔레트 (Ctrl+K · Universal Search) ---------- */
  function Palette() {
    const r = FL().search(st.q);
    return `
      <div class="mk-card"><h4>Command Everywhere (§7) — Ctrl + K</h4>
        <p class="dev-note">이 화면에서 <b>실제 Ctrl+K</b> 를 누르면 팔레트가 열린다 — 메뉴 탐색보다 검색이 빠르다. ${st.palOpen ? badge(true, '팔레트 열림') : badge(false, '닫힘')}</p>
        <div class="dev-row"><input class="mk-input" style="flex:1" data-fl-q value="${esc(st.q)}" placeholder="Project · Template · Asset · Plugin · Command · AI · Settings · Brand 모두 검색">
        <button class="mk-btn primary" data-fl-search>검색</button></div></div>
      <div class="mk-card"><h4>Universal Search (§8) — ${r.total}건 · ${r.groups.length}도메인</h4>
        ${r.groups.length ? r.groups.map((g) => `
          <p class="dev-note"><b>${esc(g.domain)}</b></p>
          <table class="adm-tbl">${g.items.map((it) => `<tr><td>${esc(it.label)}</td><td><code>${esc(it.key || it.id)}</code></td><td>score ${it.score}</td>
            ${g.domain === 'command' ? `<td><button class="mk-btn sm" data-fl-run="${esc(it.id)}">실행</button></td>` : '<td></td>'}</tr>`).join('')}</table>`).join('')
        : '<p class="dev-note">검색 결과 없음 — 다른 키워드로.</p>'}
      </div>
      <div class="mk-card"><h4>Keyboard Map (§18·§24)</h4>
        <table class="adm-tbl"><tr><th>단축키</th><th>명령</th></tr>
        ${FL().keyboardMap().slice(0, 10).map((k) => `<tr><td><code>${esc(k.key)}</code></td><td>${esc(k.label)}</td></tr>`).join('')}</table>
        <p class="dev-note">전 ${FL().CMDS.length}개 명령 단축키 100% — 충돌은 등록 자체가 거부된다.</p></div>`;
  }

  /* ---------- 예측 흐름 ---------- */
  function Predict() {
    ensure();
    const preds = FL().predict();
    return `
      <div class="mk-card"><h4>Predictive Actions (§6) — 이미지 삽입 → Crop → Shadow → Align</h4>
        <div class="dev-row">
          <button class="mk-btn" data-fl-x="insert-image">이미지 삽입</button>
          <button class="mk-btn" data-fl-x="crop">Crop</button>
          <button class="mk-btn" data-fl-x="shadow">Shadow</button>
          <button class="mk-btn" data-fl-x="align">Align</button>
          <button class="mk-btn" data-fl-x="export">Export</button></div>
        ${st.lastExec && st.lastExec.ok ? `<p class="dev-note">방금: <code>${esc(st.lastExec.cmd)}</code> → 다음 추천 ${st.lastExec.next.map((n) => `<b>${esc(n.label)}</b>(${n.score})`).join(' · ')}</p>` : '<p class="dev-note">버튼을 누르면 다음 행동이 예측된다.</p>'}
      </div>
      <div class="mk-card"><h4>지금 예측 (학습 반영)</h4>
        <table class="adm-tbl"><tr><th>추천</th><th>score</th><th>수용/무시 학습</th></tr>
        ${preds.map((p) => `<tr><td><b>${esc(p.label)}</b></td><td>${p.score}</td>
          <td><button class="mk-btn sm" data-fl-acc="${esc(p.id)}">수용 +</button> <button class="mk-btn sm" data-fl-dis="${esc(p.id)}">무시 −</button></td></tr>`).join('')}</table>
        <p class="dev-note">수용하면 다음부터 그 체인이 위로 올라온다 — Adaptive.</p></div>
      <div class="mk-card"><h4>Instant Preview (§9) — Hover 만 해도, 클릭 없이</h4>
        <div class="dev-row">${['insert-text', 'crop', 'align', 'group'].map((c) => `<button class="mk-btn" data-fl-pv="${c}">${c} 미리보기</button>`).join('')}</div>
        ${st.lastPreview ? `<pre class="dev-pre">Preview(커밋 안 됨) — 변경 ${st.lastPreview.changed ? '있음' : '없음'}\n요소 수: ${st.doc.scenes[0].elements.length} → ${st.lastPreview.after.scenes[0].elements.length}</pre>` : ''}</div>`;
  }

  /* ---------- 스마트 UI ---------- */
  function Smart() {
    ensure();
    const tb = FL().toolsFor(st.sel, { expand: st.expand });
    const es = FL().emptyState('home');
    const df = FL().defaultsFor('poster');
    return `
      <div class="mk-card"><h4>Smart Interface (§3) — 선택하면 UI 가 바뀐다</h4>
        <div class="dev-row">
          <button class="mk-btn ${!st.sel ? 'primary' : ''}" data-fl-sel="none">선택 없음</button>
          <button class="mk-btn ${st.sel && st.sel.type === 'text' ? 'primary' : ''}" data-fl-sel="text">텍스트 선택</button>
          <button class="mk-btn ${st.sel && st.sel.type === 'image' ? 'primary' : ''}" data-fl-sel="image">이미지 선택</button>
          <button class="mk-btn ${st.sel && st.sel.type === 'table' ? 'primary' : ''}" data-fl-sel="table">표 선택</button>
          <button class="mk-btn ${st.sel && st.sel.multi ? 'primary' : ''}" data-fl-sel="multi">다중 선택</button></div>
        <p class="dev-note"><b>${esc(tb.kind)} Toolbar</b> → ${tb.tools.map((t) => `<code>${esc(t)}</code>`).join(' ')}</p></div>
      <div class="mk-card"><h4>Progressive Disclosure (§4) — 전문 기능은 필요할 때만</h4>
        <p class="dev-note">${tb.proHidden ? `숨은 전문 도구 ${tb.proHidden}개 — 편집 5회 이상 또는 펼치기` : (tb.pro.length ? '전문 도구 노출: ' + tb.pro.map((t) => `<code>${esc(t)}</code>`).join(' ') : '이 선택에는 전문 도구가 없어요')}</p>
        <button class="mk-btn sm" data-fl-expand>${st.expand ? '접기' : '전문 기능 펼치기'}</button></div>
      <div class="mk-card"><h4>Smart Empty State (§11) — 빈 화면 금지</h4>
        <pre class="dev-pre">${jf(es)}</pre></div>
      <div class="mk-card"><h4>Smart Defaults (§15) — 기본값은 AI 추천, 사용자는 수정만</h4>
        <p class="dev-note">poster 기본값(${esc(df.source)}): 비율 <code>${esc(df.ratio)}</code> · 폰트 <code>${esc(df.font)}</code> · 팔레트 <code>${esc(df.palette)}</code> · 애니메이션 <code>${esc(df.anim)}</code></p>
        <button class="mk-btn sm" data-fl-override>비율 1:1 로 수정 → 다음부터 기본값</button></div>`;
  }

  /* ---------- 마찰 제로 ---------- */
  function Friction() {
    ensure();
    const sv = FL().saveState();
    const dep = FL().undoDepth();
    return `
      <div class="mk-card"><h4>Zero Friction (§2) — 자동 저장</h4>
        <p class="dev-note">상태: ${badge(sv.state === 'saved', sv.state)} · 누적 자동저장 ${sv.count}회 — dirty 후 2초(내부 클록) 지나면 자동 커밋</p>
        <div class="dev-row"><button class="mk-btn" data-fl-dirty>문서 수정(더럽히기)</button>
        <button class="mk-btn" data-fl-tick>⏩ +3초 경과</button></div></div>
      <div class="mk-card"><h4>자동 이름·정렬·그룹 — 사용자는 생각만</h4>
        <div class="dev-row"><button class="mk-btn" data-fl-autoname>자동 이름 짓기</button>
        <button class="mk-btn" data-fl-x="align">자동 정렬(8% 그리드)</button>
        <button class="mk-btn" data-fl-x="group">자동 그룹(근접)</button></div>
        <p class="dev-note">현재 제목: <b>${esc(st.doc.title)}</b> · 1장 요소 ${st.doc.scenes[0].elements.length}개 ${st.doc.scenes[0].groups ? '· 그룹 ' + st.doc.scenes[0].groups.length : ''}</p></div>
      <div class="mk-card"><h4>Undo Philosophy (§10) — AI 포함 100% Undo</h4>
        <div class="dev-row"><button class="mk-btn" data-fl-undo>← Undo</button><button class="mk-btn" data-fl-redo>Redo →</button></div>
        <p class="dev-note">스택: undo ${dep.undo} · redo ${dep.redo} — 모든 변경은 execute() 단일 경로로만 커밋된다.</p></div>
      <div class="mk-card"><h4>확인 모달 정책 — 파괴적 작업에만</h4>
        <table class="adm-tbl"><tr><th>명령</th><th>확인 필요?</th></tr>
        ${['save', 'align', 'export', 'delete'].map((c) => { const p = FL().confirmPolicy(c); return `<tr><td><code>${c}</code></td><td>${p.needsConfirm ? badge(false, '확인 1회') : badge(true, '무확인')}</td></tr>`; }).join('')}</table>
        <button class="mk-btn sm danger" data-fl-del>삭제 실행(게이트 실연)</button></div>`;
  }

  /* ---------- 여정 ---------- */
  function Journey() {
    const j = FL().journey();
    return `
      <div class="mk-card"><h4>User Journey (§21) — 모든 단계 최적화</h4>
        <div class="dev-pipe">${j.steps.map((s) => `<span class="dev-pipe-node" style="${s.done ? '' : 'opacity:.4'}">${s.done ? '✓ ' : ''}${esc(s.step)}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">진행 ${j.progress}</p>
        <div class="dev-row"><button class="mk-btn" data-fl-x="new-project">첫 프로젝트</button>
        <button class="mk-btn" data-fl-x="export">첫 Export</button>
        <button class="mk-btn" data-fl-x="ai-ask">첫 AI</button>
        <button class="mk-btn" data-fl-x="share">첫 공유</button>
        <button class="mk-btn" data-fl-x="market-open">첫 Marketplace</button></div></div>
      <div class="mk-card"><h4>Delight Moments (§20) — "오!" 를 설계한다</h4>
        ${j.delights.length ? `<table class="adm-tbl"><tr><th>단계</th><th>연출</th><th>메시지</th><th>모션</th></tr>
          ${j.delights.map((d) => `<tr><td><code>${esc(d.step)}</code></td><td>${esc(d.fx)}</td><td>${esc(d.msg)}</td><td>${d.motion.ms}ms</td></tr>`).join('')}</table>`
        : '<p class="dev-note">아직 없음 — 위 여정 버튼으로 첫 순간을 만들어 보세요.</p>'}</div>
      <div class="mk-card"><h4>Testing (§23) — 6 페르소나 시나리오</h4>
        <div class="dev-row">${Object.keys(FL().PERSONAS).map((k) => `<button class="mk-btn sm" data-fl-persona="${k}">${esc(FL().PERSONAS[k].label)}</button>`).join('')}
        <button class="mk-btn primary sm" data-fl-matrix>전원 실행</button></div>
        ${st.lastPersona ? `<pre class="dev-pre">${jf(st.lastPersona)}</pre>` : ''}</div>`;
  }

  /* ---------- 분석 ---------- */
  function Analytics() {
    const m = FL().metrics(), f = FL().funnel();
    const lay = st.lastLayout || FL().layoutRecommend();
    return `
      <div class="adm-stats">
        ${Stat('첫 디자인까지', fmt(m.timeToFirstDesign))}${Stat('Export 까지', fmt(m.timeToExport))}
        ${Stat('클릭/작업', m.clicksPerTask == null ? '—' : m.clicksPerTask)}${Stat('Undo 율', m.undoRate)}</div>
      <div class="mk-card"><h4>Flow Analytics (§13) — 어디서 멈추는가</h4>
        <table class="adm-tbl"><tr><th>단계</th><th>도달</th><th>이탈</th></tr>
        ${f.steps.map((s) => `<tr><td><code>${esc(s.step)}</code></td><td>${s.n}</td><td>${s.dropoff ? badge(false, '-' + s.dropoff) : '0'}</td></tr>`).join('')}</table>
        <p class="dev-note">${f.worst ? `최대 이탈 지점: <b>${esc(f.worst.step)}</b> 직전 — UX 개선 대상` : '세션 데이터 없음 — 여정 탭에서 페르소나를 돌리면 채워진다.'} · 완주율 ${m.completionRate == null ? '—' : m.completionRate}</p></div>
      <div class="mk-card"><h4>Adaptive Workspace (§14) — 패턴이 배치를 바꾼다</h4>
        <p class="dev-note">${esc(lay.reason)} · 패널 순서: ${lay.panels.map((p) => `<code>${esc(p)}</code>`).join(' → ')}</p>
        ${lay.shelf.length ? `<p class="dev-note">1클릭 선반: ${lay.shelf.map((s) => `<b>${esc(s.label)}</b>(${esc(s.key)})`).join(' · ')}</p>` : ''}
        <div class="dev-row"><button class="mk-btn" data-fl-lay-apply>추천 적용</button><button class="mk-btn" data-fl-lay-reset>초기화</button></div></div>
      <div class="mk-card"><h4>Usability Report (§24)</h4><pre class="dev-pre">${jf(FL().usabilityReport())}</pre></div>`;
  }

  /* ---------- 가드 ---------- */
  function Guard() {
    ensure();
    const a = FL().a11y();
    return `
      <div class="mk-card"><h4>Error Prevention (§17) — 실수하기 전에 막는다</h4>
        <table class="adm-tbl"><tr><th>상황</th><th>게이트</th><th>결과</th></tr>
        <tr><td>삭제</td><td>confirm</td><td>${esc(FL().guard('delete').msg)}</td></tr>
        <tr><td>빈 문서 Export</td><td>block</td><td>${esc(FL().guard('export', { doc: { scenes: [] } }).msg)}</td></tr>
        <tr><td>브랜드 외 색 <code>#ff00aa</code></td><td>autofix</td><td>${(() => { const g = FL().guard('align', { color: '#ff00aa' }); return g.gate === 'autofix' ? esc(g.msg) + ' → ' + esc(g.fix.color) + ' 제안' : '활성 브랜드 없음(통과)'; })()}</td></tr></table></div>
      <div class="mk-card"><h4>Micro Interaction (§16) — 모든 움직임 150~250ms</h4>
        <table class="adm-tbl"><tr><th>모션</th><th>길이</th><th>이징</th></tr>
        ${Object.entries(FL().MOTION).map(([k, v]) => `<tr><td><code>${esc(k)}</code></td><td>${v.ms}ms</td><td><code>${esc(v.easing)}</code></td></tr>`).join('')}</table>
        <button class="mk-btn sm" data-fl-motion-bad>300ms 등록 시도(거부 실연)</button></div>
      <div class="mk-card"><h4>Accessibility (§19)</h4>
        <p class="dev-note">키보드 커버 ${a.keyboard.fullCoverage ? '100%' : '미달'} · 음성 브리지 <code>${esc(a.voice.via)}</code> · 낭독 트리 ${a.screenReader.tree.length}노드</p>
        <p class="dev-note">대비 검사: 흰 바탕 위 <code>#4f46e5</code> = ${FL().contrast('#4f46e5', '#ffffff')}:1 ${badge(FL().contrast('#4f46e5', '#ffffff') >= 4.5, 'AA')}</p></div>`;
  }

  const TABS = [['over', '개요'], ['palette', '팔레트'], ['predict', '예측'], ['smart', '스마트UI'],
                ['friction', '마찰제로'], ['journey', '여정'], ['analytics', '분석'], ['guard', '가드']];
  const BODY = { over: Over, palette: Palette, predict: Predict, smart: Smart,
                 friction: Friction, journey: Journey, analytics: Analytics, guard: Guard };

  function render() {
    ensure();
    return `<div class="pg-screen fl-screen">
      <div class="pg-screen-head"><h2>🌊 Flow Experience</h2>
        <p>새 기능 없음 — 생각→클릭→결과 최단 경로 (Round 23 · 결정론 규칙 엔진, 실텔레메트리 미연결)</p></div>
      ${st.msg ? `<div class="mk-banner ${st.msg.ok ? 'ok' : 'warn'}">${esc(st.msg.text)}</div>` : ''}
      <div class="mk-tabs">${TABS.map(([k, n]) => `<button class="mk-tab ${st.tab === k ? 'active' : ''}" data-fl-tab="${k}">${n}</button>`).join('')}</div>
      <div class="fl-body">${BODY[st.tab]()}</div></div>`;
  }

  const RR = () => { const r = document.querySelector('.fl-screen'); if (r) { r.outerHTML = render(); bind(document, RR); } };

  function bind(root, R) {
    root.querySelectorAll('[data-fl-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.flTab; st.msg = null; R(); });
    const gv = (sel) => { const el = root.querySelector(sel); return el ? el.value : ''; };
    const on = (sel, fn) => { const el = root.querySelector(sel); if (el) el.onclick = () => { fn(); R(); }; };

    /* Ctrl+K — 실제 keydown 으로 팔레트 오픈(§7) */
    if (!window.__flKey) {
      window.__flKey = true;
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'k') {
          e.preventDefault(); st.tab = 'palette'; st.palOpen = true; RR();
        }
      });
    }

    /* 팔레트 */
    on('[data-fl-search]', () => { st.q = gv('[data-fl-q]'); st.palOpen = true; });
    const qi = root.querySelector('[data-fl-q]');
    if (qi) qi.onkeydown = (e) => { if (e.key === 'Enter') { st.q = qi.value; st.palOpen = true; RR(); } };
    root.querySelectorAll('[data-fl-run]').forEach((b) => b.onclick = () => { exec(b.dataset.flRun); R(); });

    /* 실행·예측·학습 */
    root.querySelectorAll('[data-fl-x]').forEach((b) => b.onclick = () => { exec(b.dataset.flX); R(); });
    root.querySelectorAll('[data-fl-acc]').forEach((b) => b.onclick = () => { FL().accept('insert-image', b.dataset.flAcc); say(true, '수용 학습됨 — 다음 예측에 반영'); R(); });
    root.querySelectorAll('[data-fl-dis]').forEach((b) => b.onclick = () => { FL().dismiss('insert-image', b.dataset.flDis); say(true, '무시 학습됨'); R(); });
    root.querySelectorAll('[data-fl-pv]').forEach((b) => b.onclick = () => { ensure(); st.lastPreview = FL().previewFor(b.dataset.flPv, st.doc); say(true, 'Preview — 커밋되지 않음'); R(); });

    /* 스마트 UI */
    root.querySelectorAll('[data-fl-sel]').forEach((b) => b.onclick = () => {
      const k = b.dataset.flSel;
      st.sel = k === 'none' ? null : (k === 'multi' ? { multi: true } : { type: k });
      FL().setSelection(st.sel); R();
    });
    on('[data-fl-expand]', () => { st.expand = !st.expand; });
    on('[data-fl-override]', () => { FL().overrideDefault('poster', { ratio: '1:1' }); say(true, '수정됨 — 이제 poster 기본 비율은 1:1 (learned)'); });

    /* 마찰 제로 */
    on('[data-fl-dirty]', () => { ensure(); FL().markDirty(st.doc); say(true, 'dirty — 2초 뒤 자동 저장'); });
    on('[data-fl-tick]', () => { FL()._tick(3 * FL().SEC); say(true, '+3초 — 자동저장 판정 실행'); });
    on('[data-fl-autoname]', () => { ensure(); st.doc.title = FL().autoName(st.doc); say(true, '자동 이름: ' + st.doc.title); });
    on('[data-fl-undo]', () => { const r = FL().undo(st.doc); say(r.ok, r.ok ? '되돌림: ' + r.label : '더 되돌릴 게 없어요'); });
    on('[data-fl-redo]', () => { const r = FL().redo(st.doc); say(r.ok, r.ok ? '다시 실행: ' + r.label : '다시 실행할 게 없어요'); });
    on('[data-fl-del]', () => {
      ensure();
      const first = FL().execute('delete', st.doc);
      if (first.needsConfirm) { const r = FL().execute('delete', st.doc, { confirmed: true }); say(r.ok, '확인 1회 → 삭제됨(Undo 가능)'); }
    });

    /* 여정·페르소나 */
    root.querySelectorAll('[data-fl-persona]').forEach((b) => b.onclick = () => { st.lastPersona = FL().personaRun(b.dataset.flPersona); say(true, st.lastPersona.persona + ' 완주 — ' + st.lastPersona.clicks + '클릭'); R(); });
    on('[data-fl-matrix]', () => { const rs = FL().personaMatrix(); st.lastPersona = { matrix: rs.map((r) => ({ persona: r.persona, clicks: r.clicks, perStep: r.clicksPerStep })) }; say(true, '6 페르소나 전원 완주'); });

    /* 분석·적응형 */
    on('[data-fl-lay-apply]', () => { st.lastLayout = null; FL().layoutApply(); say(true, '추천 배치 적용됨'); });
    on('[data-fl-lay-reset]', () => { st.lastLayout = FL().layoutReset() && FL().layoutRecommend(); say(true, '기본 배치로 초기화'); });

    /* 가드 */
    on('[data-fl-motion-bad]', () => { const r = FL().motionRegister('too-slow', 300); say(r.ok, r.ok ? '등록됨(?)' : '거부 — ' + r.reason); });
  }

  function mount(root) { bind(root, RR); }

  return { title: 'Flow Experience', variants: ['Studio'], render, mount };
})();
