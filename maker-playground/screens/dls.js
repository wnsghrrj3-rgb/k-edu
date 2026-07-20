/* ============================================================
   화면: DLS — K-MAKER Design Language Studio  (Round 24)
   ------------------------------------------------------------
   개요/컬러/타이포/형태/모션·아이콘/컴포넌트/적응/산출물 8탭.
   전 버튼 실함수 — MK_DLS 감사·파생·내보내기를 실제 실행해
   "디자인 일관성이 절대 깨지지 않는다" 를 판정 화면으로 실연.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.dls = (() => {
  const D = () => window.MK_DLS, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', msg: null, cFg: '#2E8C7F', cBg: '#FFFFFF', spV: '14', dark: false, lintOut: null, cssOut: null, audOut: null, iconOut: null };
  const say = (ok, t) => { st.msg = { ok, text: String(t) }; };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const jf = (o) => esc(JSON.stringify(o, null, 1));
  const sw = (hex, label) => `<div class="dls-sw"><span class="dls-chip" style="background:${esc(hex)}"></span><code>${esc(hex)}</code>${label ? `<small>${esc(label)}</small>` : ''}</div>`;

  const TABS = [['over', '개요'], ['color', '컬러'], ['type', '타이포'], ['shape', '간격·형태'], ['motion', '모션·아이콘'], ['comp', '컴포넌트'], ['adapt', '다크·반응형'], ['ship', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const del = D().deliverables();
    const ok = D().complete();
    return `
      <div class="adm-stats">
        ${Stat('산출물', del.filter((d) => d.ready).length + '/9', '§25')}
        ${Stat('컴포넌트 린트', Object.values(D().componentAudit()).filter((r) => r.ok).length + '/10', '§12')}
        ${Stat('접근성 감사', D().a11yAudit().ok ? 'PASS' : 'FAIL', 'WCAG 실계산')}
        ${Stat('완료 조건', ok ? '충족' : '미달', '§26')}
      </div>
      <div class="mk-card"><h4>Design Philosophy (§1)</h4>
        <div class="dev-pipe">${D().PHILOSOPHY.map((p) => `<span class="dev-pipe-node">${p}</span>`).join('')}</div></div>
      <div class="mk-card"><h4>Core Principles (§2) — Less / More</h4>
        <div class="dls-lm">${D().PRINCIPLES.map((p) => `<div class="dls-lm-row"><span class="dls-less">Less ${p.less}</span><span class="dev-pipe-arrow">→</span><span class="dls-more">More ${p.more}</span></div>`).join('')}</div></div>
      <div class="mk-card"><h4>Visual Language (§3)</h4>
        <p class="dev-note">${D().VISUAL.join(' · ')}</p>
        <p class="dev-note">디자인은 예쁘게 만드는 것이 아니다 — 모든 화면이 같은 원칙으로 설계되고, 위반은 코드가 거부한다.</p></div>`;
  }

  /* ---------- 컬러 ---------- */
  function Color() {
    const S = D().SEMANTIC, r = D().contrast(st.cFg, st.cBg);
    return `
      <div class="mk-card"><h4>대비 검사기 — WCAG 실계산 (§4·§18)</h4>
        <div class="dls-row">
          <input class="mk-input" data-dls-fg value="${esc(st.cFg)}" style="width:110px">
          <span>on</span>
          <input class="mk-input" data-dls-bg value="${esc(st.cBg)}" style="width:110px">
          <button class="mk-btn primary" data-dls-contrast>계산</button>
          ${r ? `<b>${r.toFixed(2)}:1</b> ${badge(r >= 4.5, r >= 4.5 ? 'AA 텍스트' : r >= 3 ? 'AA UI만' : '부적합')}` : ''}
        </div></div>
      <div class="mk-card"><h4>Semantic — text-safe(≥4.5)·ui-safe(≥3.0) 알고리즘 파생 보장</h4>
        <table class="mk-table"><tr><th>역할</th><th>base</th><th>text</th><th>ui</th><th>파생</th></tr>
        ${Object.entries(S).map(([k, v]) => `<tr><td><b>${k}</b><br><small>${esc(v.role)}</small></td>
          <td>${sw(v.base)}</td><td>${sw(v.text)} <small>${D().contrast(v.text, '#FFFFFF').toFixed(2)}:1</small></td>
          <td>${sw(v.ui)} <small>${D().contrast(v.ui, '#FFFFFF').toFixed(2)}:1</small></td>
          <td>${badge(v.derived.textOk && v.derived.uiOk, v.derived.textSteps + '·' + v.derived.uiSteps + '스텝')}</td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>Neutral Scale · Surface</h4>
        <div class="dls-swrow">${D().COLOR.neutral.map((h) => sw(h)).join('')}</div>
        <div class="dls-swrow">${sw(D().COLOR.background, 'background')}${sw(D().COLOR.surface, 'surface')}${sw(D().COLOR.surfaceMuted, 'muted')}${sw(D().COLOR.border, 'border')}</div></div>`;
  }

  /* ---------- 타이포 ---------- */
  function Type() {
    const a = D().typeAudit();
    return `
      <div class="mk-card"><h4>Typography Scale (§5) ${badge(a.ok, a.ok ? '단조 감소·행간 규격' : '위반')}</h4>
        ${Object.entries(D().TYPE).map(([k, t]) => `
          <div class="dls-type-row"><code style="width:70px">${k}</code>
            <span style="font:${t.weight} ${t.size}px/${t.lh} ${t.mono ? 'ui-monospace, monospace' : 'var(--mk-font)'}">디자인은 언어다 K-MAKER Aa 123</span>
            <small>${t.size}px · ${t.weight} · lh ${t.lh}</small></div>`).join('')}
        <p class="dev-note">button 행간 1 고정 · body 행간 ≥1.5(가독) · 크기 단조 감소 — typeAudit() 이 강제.</p></div>`;
  }

  /* ---------- 간격·형태 ---------- */
  function Shape() {
    const el = D().elevationAudit();
    return `
      <div class="mk-card"><h4>Spacing (§6) — 4px Grid · 8px Rhythm · 16px Base</h4>
        <div class="dls-row">
          <input class="mk-input" data-dls-sp value="${esc(st.spV)}" style="width:90px"><span>px</span>
          <button class="mk-btn primary" data-dls-splint>린트</button>
          ${st.lintOut ? (st.lintOut.ok ? badge(true, '통과' + (st.lintOut.inScale ? '·스케일' : '') + (st.lintOut.rhythm ? '·리듬' : '')) : badge(false, st.lintOut.reason + (st.lintOut.nearest != null ? ' → ' + st.lintOut.nearest + 'px' : ''))) : ''}
        </div>
        <div class="dls-swrow">${D().SPACING.scale.map((v) => `<div class="dls-sp" style="width:${v}px" title="${v}px"></div>`).join('')}</div>
        <small>${D().SPACING.scale.join(' · ')}px — 전부 4px 그리드 위</small></div>
      <div class="mk-card"><h4>Radius (§7)</h4>
        <div class="dls-swrow">${Object.entries(D().RADIUS).map(([k, v]) => `<div class="dls-r" style="border-radius:${Math.min(v, 24)}px"><small>${k}<br>${v === 999 ? 'pill' : v + 'px'}</small></div>`).join('')}</div></div>
      <div class="mk-card"><h4>Elevation (§8) ${badge(el.ok, '5단 단조 증가')}</h4>
        <div class="dls-swrow">${Object.keys(D().ELEVATION).map((k) => `<div class="dls-el" style="box-shadow:${D().shadowCss(k)}"><small>${k}</small></div>`).join('')}</div></div>`;
  }

  /* ---------- 모션·아이콘 ---------- */
  function Motion() {
    const a = D().motionAudit();
    return `
      <div class="mk-card"><h4>Motion Duration (§10) ${badge(a.ok, a.ok ? '150~250ms 밴드·Flow 정합' : '위반')}</h4>
        <table class="mk-table"><tr><th>토큰</th><th>지속</th><th>이징</th></tr>
        ${Object.entries(D().MOTION).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v.ms}ms</td><td><code>${esc(v.easing)}</code></td></tr>`).join('')}</table>
        <div class="dls-row">
          <button class="mk-btn" data-dls-mo-bad>300ms 등록 시도</button>
          <button class="mk-btn" data-dls-mo-ok>200ms 등록 시도</button>
        </div>
        <p class="dev-note">원칙(§9): ${D().MOTION_PRINCIPLES.join(' · ')} — 밴드 밖 스펙은 등록 자체가 거부된다.</p></div>
      <div class="mk-card"><h4>Icon System (§11) — 24 그리드 · stroke 1.75 · 광학 정렬</h4>
        <div class="dls-row">
          <button class="mk-btn primary" data-dls-icon-ok>정합 아이콘 검증</button>
          <button class="mk-btn" data-dls-icon-bad>비정합 아이콘 검증</button>
        </div>
        ${st.iconOut ? `<pre class="dev-json">${jf(st.iconOut)}</pre>` : ''}</div>`;
  }

  /* ---------- 컴포넌트 ---------- */
  function Comp() {
    const audit = D().componentAudit();
    return `
      <div class="mk-card"><h4>Component Rules (§12) — 10종 전 린트</h4>
        <table class="mk-table"><tr><th>컴포넌트</th><th>높이</th><th>radius</th><th>type</th><th>motion</th><th>린트</th></tr>
        ${Object.entries(D().COMPONENTS).map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v.fluid ? 'fluid' : v.height + 'px'}</td><td>${v.radius}</td><td>${v.type}</td><td>${v.motion}</td><td>${badge(audit[k].ok, audit[k].ok ? 'PASS' : audit[k].errors.join(','))}</td></tr>`).join('')}</table>
        <div class="dls-row"><button class="mk-btn" data-dls-lint-bad>위반 스펙 린트(높이 37px·포커스 링 없음)</button></div></div>
      <div class="mk-card"><h4>Card (§13) · Navigation (§14)</h4>
        <div class="dls-swrow">${Object.entries(D().CARDS).map(([k, c]) => `<div class="dls-cardspec"><b>${k}</b><small>${c.slots.join(' · ')}</small></div>`).join('')}</div>
        <p class="dev-note">내비 5종: ${Object.keys(D().NAVIGATION).join(' · ')} — Command Palette 는 MK_FLOW.search 브리지(Ctrl+K).</p></div>
      <div class="mk-card"><h4>Empty (§15) · Loading (§16) · Feedback (§17)</h4>
        <div class="dls-swrow">${['projects', 'assets', 'templates', 'search'].map((c) => { const e = D().emptyFor(c); return `<div class="dls-cardspec"><b>${c}</b><small>${esc(e.title)}</small><small>🤖 ${esc(e.ai)} · [${esc(e.action)}]</small></div>`; }).join('')}</div>
        <p class="dev-note">피드백 라우팅: danger+blocking→${D().feedbackRoute('danger', true)} · info→${D().feedbackRoute('info', false)} · warning→${D().feedbackRoute('warning', false)} — 결정 매트릭스.</p></div>`;
  }

  /* ---------- 다크·반응형 ---------- */
  function Adapt() {
    const da = D().darkAudit(), ds = D().darkSemantic();
    const th = st.dark ? D().DARK : { background: D().COLOR.background, surface: D().COLOR.surface, textPrimary: D().COLOR.textPrimary, textSecondary: D().COLOR.textSecondary, border: D().COLOR.border };
    return `
      <div class="mk-card"><h4>Dark Mode (§19) ${badge(da.ok, da.ok ? '전 쌍 AA·5단 밝아짐' : '위반')}</h4>
        <div class="dls-row"><button class="mk-btn primary" data-dls-dark>${st.dark ? '라이트로' : '다크로'} 전환</button></div>
        <div class="dls-preview" style="background:${th.background};border:1px solid ${th.border}">
          <div style="background:${th.surface};color:${th.textPrimary};border-radius:12px;padding:14px;border:1px solid ${th.border}">
            <b>미리보기 카드</b>
            <p style="color:${th.textSecondary};margin:6px 0 8px">semantic 매핑 — 값이 아니라 역할이 전환된다.</p>
            ${Object.entries(st.dark ? ds : D().SEMANTIC).map(([k, v]) => `<span style="color:${st.dark ? v.text : v.text};font-weight:600;margin-right:10px">${k}</span>`).join('')}
          </div></div>
        <pre class="dev-json">${jf(da.pairs)}</pre></div>
      <div class="mk-card"><h4>Responsive (§20) — 4분기 판정</h4>
        <table class="mk-table"><tr><th>입력</th><th>장치</th><th>레이아웃</th></tr>
        ${[[1440], [900], [390], [390, 'open'], [390, 'closed']].map(([w, f]) => { const r = D().layoutFor(w, f); return `<tr><td>${w}px${f ? ' · fold ' + f : ''}</td><td>${r.device}</td><td>${r.layout}</td></tr>`; }).join('')}</table></div>
      <div class="mk-card"><h4>Accessibility (§18)</h4>
        <pre class="dev-json">${jf(D().a11yAudit())}</pre></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Ship() {
    const del = D().deliverables(), cov = D().docsCoverage();
    return `
      <div class="mk-card"><h4>Deliverables (§25) ${badge(D().complete(), D().complete() ? '9/9 완료' : '미달')}</h4>
        <table class="mk-table"><tr><th>산출물</th><th>상태</th></tr>
        ${del.map((d) => `<tr><td>${d.name}</td><td>${badge(d.ready, d.ready ? 'READY' : 'MISSING')}</td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>Design Token 내보내기 (§21) · 실 CSS 감사</h4>
        <div class="dls-row">
          <button class="mk-btn primary" data-dls-css>CSS 생성</button>
          <button class="mk-btn" data-dls-json>JSON 생성</button>
          <button class="mk-btn" data-dls-audit>일관성 감사 실행(오프토큰 샘플)</button>
        </div>
        ${st.cssOut ? `<pre class="dev-json" style="max-height:220px;overflow:auto">${esc(st.cssOut)}</pre>` : ''}
        ${st.audOut ? `<pre class="dev-json">${jf(st.audOut)}</pre>` : ''}</div>
      <div class="mk-card"><h4>Component Library (§22) — Atomic · Figma 구조</h4>
        <pre class="dev-json">${jf(D().libraryTree())}</pre>
        <pre class="dev-json">${jf(D().figmaStructure().pages.map((p) => p.name))}</pre>
        <p class="dev-note">Documentation (§23) 커버리지: ${cov.covered}/${cov.total} (${cov.pct}%) — Do/Don't/예시/접근성 전 컴포넌트.</p></div>`;
  }

  const BODY = { over: Over, color: Color, type: Type, shape: Shape, motion: Motion, comp: Comp, adapt: Adapt, ship: Ship };

  function render() {
    return `<div class="pg-screen dls-screen">
      <div class="pg-screen-head"><h2>🧭 Design Language</h2>
        <p>기능 추가 없음 — K-DLS 를 판정 가능한 계층으로 (Round 24 · 위반은 코드가 거부한다)</p></div>
      ${st.msg ? `<div class="mk-banner ${st.msg.ok ? 'ok' : 'warn'}">${esc(st.msg.text)}</div>` : ''}
      <div class="mk-tabs">${TABS.map(([k, n]) => `<button class="mk-tab ${st.tab === k ? 'active' : ''}" data-dls-tab="${k}">${n}</button>`).join('')}</div>
      <div class="dls-body">${BODY[st.tab]()}</div></div>`;
  }

  const RR = () => { const r = document.querySelector('.dls-screen'); if (r) { r.outerHTML = render(); bind(document, RR); } };

  function bind(root, R) {
    root.querySelectorAll('[data-dls-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.dlsTab; st.msg = null; R(); });
    const gv = (sel) => { const el = root.querySelector(sel); return el ? el.value : ''; };
    const on = (sel, fn) => { const el = root.querySelector(sel); if (el) el.onclick = () => { fn(); R(); }; };

    on('[data-dls-contrast]', () => {
      st.cFg = gv('[data-dls-fg]').trim(); st.cBg = gv('[data-dls-bg]').trim();
      const r = D().contrast(st.cFg, st.cBg);
      say(!!r, r ? `${r.toFixed(2)}:1 — ${r >= 4.5 ? 'AA 텍스트 통과' : r >= 3 ? 'UI(3:1)만 통과 — 본문 텍스트 사용 금지' : '부적합'}` : 'hex 형식(#RRGGBB)이 아니에요');
    });
    on('[data-dls-splint]', () => { st.lintOut = D().spacingLint(parseFloat(gv('[data-dls-sp]'))); say(st.lintOut.ok, st.lintOut.ok ? '4px 그리드 통과' : '거부 — ' + st.lintOut.reason); });
    on('[data-dls-mo-bad]', () => { const r = D().motionRegister('too-slow', 300); say(r.ok, r.ok ? '등록됨(?)' : '거부 — ' + r.reason); });
    on('[data-dls-mo-ok]', () => { const r = D().motionRegister('demo200', 200); say(r.ok, '등록됨 — 200ms (밴드 내)'); });
    on('[data-dls-icon-ok]', () => { st.iconOut = D().iconValidate({ grid: 24, stroke: 1.75, variant: 'outlined', points: [[4, 4], [20, 4], [20, 20], [4, 20]] }); say(st.iconOut.ok, '정합 — 24그리드·중심 정렬'); });
    on('[data-dls-icon-bad]', () => { st.iconOut = D().iconValidate({ grid: 20, stroke: 3, variant: 'duotone', points: [[2, 2], [6, 6]] }); say(st.iconOut.ok, '거부 — ' + st.iconOut.errors.join(', ')); });
    on('[data-dls-lint-bad]', () => { const r = D().lintComponent({ height: 37, radius: 'small', type: 'button', motion: 'hover', states: ['default'], focusRing: false }); say(r.ok, '거부 — ' + r.errors.join(', ')); });
    on('[data-dls-dark]', () => { st.dark = !st.dark; say(true, st.dark ? '다크 모드 — semantic 재파생·대비 재검증' : '라이트 모드'); });
    on('[data-dls-css]', () => { st.cssOut = D().exportCss(); st.audOut = null; say(true, 'CSS 토큰 생성 — ' + st.cssOut.split('\n').length + '줄'); });
    on('[data-dls-json]', () => { st.cssOut = D().exportJson(); st.audOut = null; say(true, 'JSON 토큰 생성'); });
    on('[data-dls-audit]', () => {
      st.audOut = D().consistencyAudit([
        { prop: 'color', value: '#FF00AA', where: 'demo.css:12' },
        { prop: 'padding', value: '13px', where: 'demo.css:20' },
        { prop: 'border-radius', value: '7px', where: 'demo.css:31' },
        { prop: 'transition-duration', value: '400ms', where: 'demo.css:44' },
        { prop: 'color', value: D().COLOR.textPrimary, where: 'ok.css:1' },
        { prop: 'padding', value: '16px', where: 'ok.css:2' },
      ]);
      say(st.audOut.violations.length === 4, '감사 완료 — 위반 ' + st.audOut.violations.length + '건 검출(오프토큰 색·13px·7px·400ms)');
    });
  }

  function mount(root) { bind(root, RR); }

  return { title: 'Design Language', variants: ['Studio'], render, mount };
})();
