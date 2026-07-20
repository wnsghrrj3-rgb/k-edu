/* ============================================================
   화면: Dev — Public API & Automation Platform  (Round 20)
   ------------------------------------------------------------
   개요/탐색기/인증/웹훅/자동화/워크플로/모니터링/문서 8탭.
   탐색기의 Live Test 는 실제 Gateway(request)를 부르고
   상태코드·헤더·본문을 그대로 보여준다. 실패(401·403·429·400)
   도 실판정 그대로 표시.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.dev = (() => {
  const M = () => window.MK, A = () => window.MK_API, S = () => window.MK_API_SEED || {};
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', msg: null,
    exRoute: 0, exVer: 'v2', exAuth: 'geum', exParams: '', exBody: '', exResp: null,
    docLang: 'curl', docRoute: 0, cliLine: 'mk projects list', cliOut: null, flowRunSel: null };
  const say = (ok, text) => { st.msg = { ok, text: String(text) }; };
  const ts = (t) => new Date(t).toISOString().slice(5, 19).replace('T', ' ');
  const jf = (o) => esc(JSON.stringify(o, null, 2));
  const Stat = (label, val, sub) => `<div class="adm-stat"><small>${esc(label)}</small><b>${val}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const authToken = () => ({ geum: { 'x-api-key': S().geumKey }, hanbit: { 'x-api-key': S().hanbitKey }, pat: { authorization: 'Bearer ' + S().pat }, svc: { authorization: 'Bearer ' + S().svcAccess }, none: {} })[st.exAuth] || {};

  /* ---------- 개요 ---------- */
  function Over() {
    const mon = A().monitor(); const routes = A().routes();
    return `
      <div class="adm-stats">
        ${Stat('공개 라우트', routes.length)}${Stat('총 API 호출', mon.totals.count)}${Stat('오류', mon.totals.errors)}
        ${Stat('활성 키', A()._keys().filter((k) => !k.revoked).length)}${Stat('웹훅', mon.hooks.length)}${Stat('DLQ', mon.dlq)}
        ${Stat('자동화 규칙', A().rules().length)}${Stat('워크플로', A().flows().length)}${Stat('발신함', mon.outbox)}
      </div>
      <div class="mk-card"><h4>파이프라인</h4>
        <div class="dev-pipe">${['UI', 'Internal Service', 'Public API', 'SDK', 'Automation'].map((x) => `<span class="dev-pipe-node">${x}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">모든 기능이 동일한 Gateway 를 통과한다 — Auth → 스코프 → RateLimit → Service → Response. UI 는 API 위의 클라이언트 하나다.</p>
      </div>
      <div class="mk-card"><h4>버전</h4>
        <table class="adm-tbl"><tr><th>버전</th><th>상태</th><th>비고</th></tr>
          <tr><td>v1</td><td>${badge(false, 'deprecated')}</td><td>Sunset 2026-12-31 · title→name 하위호환 매핑 · Deprecation/Sunset 헤더 자동</td></tr>
          <tr><td>v2</td><td>${badge(true, 'current')}</td><td>정본</td></tr>
          <tr><td>v3</td><td><span class="mk-badge">beta</span></td><td>베타 플래그 앱·서비스 계정만 — /beta/insights</td></tr></table></div>`;
  }

  /* ---------- 탐색기 ---------- */
  function Explorer() {
    const routes = A().routes(); const r = routes[st.exRoute];
    const resp = st.exResp;
    return `
      <div class="dev-cols">
        <div class="mk-card"><h4>Live Test — 실제 Gateway 호출</h4>
          <label class="dev-f">라우트 <select data-dev="exRoute">${routes.map((x, i) => `<option value="${i}" ${i === st.exRoute ? 'selected' : ''}>${x.method} ${x.path}</option>`).join('')}</select></label>
          <div class="dev-row">
            <label class="dev-f">버전 <select data-dev="exVer">${A().VERSIONS.map((v) => `<option ${v === st.exVer ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
            <label class="dev-f">자격 <select data-dev="exAuth">${[['geum', '금성초 API Key'], ['hanbit', '한빛 API Key(beta)'], ['pat', '준호 PAT'], ['svc', '서비스 JWT'], ['none', '(없음 → 401)']].map(([v, l]) => `<option value="${v}" ${v === st.exAuth ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
          </div>
          ${(r.path.match(/:\w+/g) || []).length ? `<label class="dev-f">경로 파라미터(콤마 순서대로: ${(r.path.match(/:\w+/g) || []).join(' ')}) <input data-dev="exParams" value="${esc(st.exParams)}" placeholder="prj_xx,scn_yy"></label>` : ''}
          ${r.schema || r.method !== 'GET' ? `<label class="dev-f">본문(JSON) <textarea data-dev="exBody" rows="3" placeholder='${r.schema ? esc(JSON.stringify(Object.fromEntries(Object.entries(r.schema).map(([k, v]) => [k, v.enum ? v.enum[0] : '…'])))) : '{}'}'>${esc(st.exBody)}</textarea></label>` : ''}
          ${r.method === 'GET' && (r.path === '/search' || r.path === '/assets') ? `<label class="dev-f">쿼리 q <input data-dev="exBody" value="${esc(st.exBody)}" placeholder="검색어"></label>` : ''}
          <div class="dev-row"><button class="mk-btn primary" data-dev="exec">요청 보내기</button>
            <span class="dev-note">스코프 · 검증 · 레이트 리밋 실판정 — 요구 스코프: <code>${esc(r.scope || '공개')}</code></span></div>
        </div>
        <div class="mk-card"><h4>Response Preview</h4>
          ${resp ? `<div class="dev-status ${resp.status < 400 ? 'ok' : 'no'}">HTTP ${resp.status}</div>
            <details open><summary>헤더</summary><pre class="dev-pre">${jf(resp.headers)}</pre></details>
            <pre class="dev-pre">${resp.body === null ? '(본문 없음)' : jf(resp.body)}</pre>` : '<p class="dev-note">요청을 보내면 상태코드·헤더·본문이 여기에 표시된다.</p>'}
        </div>
      </div>
      <div class="mk-card"><h4>Sample Code</h4>
        <div class="dev-row">${['curl', 'javascript', 'python'].map((l) => `<button class="mk-btn sm ${st.docLang === l ? 'primary' : ''}" data-dev="lang:${l}">${l}</button>`).join('')}</div>
        <pre class="dev-pre">${esc(A().sdkSnippet(st.docLang, { method: r.method, path: r.path, schema: r.schema }))}</pre></div>`;
  }
  function execExplorer() {
    const r = A().routes()[st.exRoute];
    let path = '/' + st.exVer + r.path;
    const params = st.exParams.split(',').map((x) => x.trim()).filter(Boolean);
    (r.path.match(/:\w+/g) || []).forEach((seg, i) => { path = path.replace(seg, params[i] || (i === 0 ? (S().projects || {}).p1 || 'x' : 'x')); });
    let body = null, query = {};
    if (r.method === 'GET' && (r.path === '/search' || r.path === '/assets')) query = { q: st.exBody || '과학' };
    else if (st.exBody) { try { body = JSON.parse(st.exBody); } catch (e) { st.exResp = { status: 0, headers: {}, body: { error: 'JSON 파싱 실패: ' + e.message } }; return; } }
    st.exResp = A().request({ method: r.method, path, headers: authToken(), body, query });
  }

  /* ---------- 인증 ---------- */
  function Auth() {
    return `
      <div class="mk-card"><h4>앱 (OAuth · 서비스 계정)</h4>
        <table class="adm-tbl"><tr><th>이름</th><th>유형</th><th>조직</th><th>client_id</th><th>beta</th></tr>
        ${A()._apps().map((a) => `<tr><td>${esc(a.name)}</td><td>${a.type}</td><td>${esc(a.orgId || '—')}</td><td><code>${esc(a.clientId)}</code></td><td>${a.beta ? '✓' : ''}</td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>API Key</h4>
        <table class="adm-tbl"><tr><th>레이블</th><th>토큰</th><th>티어(분당)</th><th>스코프</th><th>상태</th><th></th></tr>
        ${A()._keys().map((k) => `<tr><td>${esc(k.label)}</td><td><code>${esc(k.token)}</code></td><td>${k.tier} (${A().RATE_TIERS[k.tier]})</td><td>${k.scopes.length}종</td><td>${badge(!k.revoked, k.revoked ? '폐기' : '활성')}</td><td>${k.revoked ? '' : `<button class="mk-btn sm" data-dev="revoke:${esc(k._full)}">폐기</button>`}</td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>Personal Access Token</h4>
        <table class="adm-tbl"><tr><th>사용자</th><th>토큰</th><th>만료</th><th>상태</th></tr>
        ${A()._pats().map((p) => `<tr><td>${esc(p.userId)}</td><td><code>${esc(p.token)}</code></td><td>${ts(p.expiresAt)}</td><td>${badge(!p.revoked && p.expiresAt > Date.now(), '유효')}</td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>OAuth2 플로 실연</h4>
        <div class="dev-row">
          <button class="mk-btn" data-dev="oauthCode">① 인가 코드 발급</button>
          <button class="mk-btn" data-dev="oauthToken">② 코드 → 토큰 교환</button>
          <button class="mk-btn" data-dev="oauthRefresh">③ 리프레시 회전</button>
          <button class="mk-btn" data-dev="oauthReuse">④ 코드 재사용(거부 확인)</button>
        </div>
        <p class="dev-note">회전: 리프레시 사용 시 이전 access·refresh 쌍이 즉시 폐기된다. 코드 재사용은 invalid — 실판정 메시지로 확인.</p></div>`;
  }

  /* ---------- 웹훅 ---------- */
  function Hooks() {
    const hooks = A().hooks(); const dlv = A().deliveries(14).reverse(); const dlq = A().dlq();
    return `
      <div class="mk-card"><h4>엔드포인트</h4>
        <table class="adm-tbl"><tr><th>URL</th><th>이벤트</th><th>성공</th><th>실패</th><th>secret</th></tr>
        ${hooks.map((h) => `<tr><td><code>${esc(h.url)}</code></td><td>${h.events.map(esc).join(', ')}</td><td>${h.delivered}</td><td>${h.failed}</td><td><code>${esc(h.secret.slice(0, 14))}…</code></td></tr>`).join('')}</table></div>
      <div class="dev-cols">
        <div class="mk-card"><h4>배달 로그 (서명 포함)</h4>
          <table class="adm-tbl"><tr><th>시각</th><th>이벤트</th><th>시도</th><th>결과</th></tr>
          ${dlv.map((d) => `<tr><td>${ts(d.at)}</td><td>${esc(d.event)}</td><td>${d.attempt}/${A().RETRY_SCHEDULE.length}</td><td>${badge(d.ok, d.ok ? '200' : esc(d.resp))}</td></tr>`).join('') || '<tr><td colspan="4">없음</td></tr>'}</table>
          <p class="dev-note">재시도 백오프: ${A().RETRY_SCHEDULE.map((x) => x / 1000 + 's').join(' → ')} · 소진 시 DLQ</p></div>
        <div class="mk-card"><h4>Dead Letter Queue (${dlq.length})</h4>
          ${dlq.map((d) => `<div class="dev-dlq"><code>${esc(d.event)}</code> → 훅 ${esc(d.hookId)} <button class="mk-btn sm" data-dev="redeliver:${d.id}">재배달</button></div>`).join('') || '<p class="dev-note">비어 있음</p>'}
          <div class="dev-row" style="margin-top:8px">
            <button class="mk-btn" data-dev="fixFlaky">불안정 엔드포인트 복구</button>
            <button class="mk-btn" data-dev="fireExport">export.completed 발화</button>
            <button class="mk-btn" data-dev="tick40">⏩ 40초 진행(재시도 소화)</button></div>
          <p class="dev-note">복구 전 재배달 → 다시 DLQ. 복구 후 재배달 → 성공. 서명 검증은 secret 기반 결정론 해시.</p></div>
      </div>`;
  }

  /* ---------- 자동화 ---------- */
  function Auto() {
    const rules = A().rules(); const runs = A().runsLog(12).reverse(); const out = A().outbox().slice(-6).reverse();
    return `
      <div class="mk-card"><h4>규칙 — Trigger → Condition → Action</h4>
        <table class="adm-tbl"><tr><th>이름</th><th>트리거</th><th>조건</th><th>액션</th><th>실행</th><th></th></tr>
        ${rules.map((r) => `<tr><td>${esc(r.name)}</td><td>${r.trigger.type === 'event' ? esc(r.trigger.event) : '매 ' + r.trigger.everyMs / 86400e3 + '일'}</td><td>${r.conditions.length ? r.conditions.map((c) => esc(c.path + ' ' + c.op + ' ' + c.value)).join('<br>') : '—'}</td><td>${r.actions.map((a) => esc(a.type)).join(' → ')}</td><td>${r.runs}</td>
          <td><button class="mk-btn sm" data-dev="ruleToggle:${r.id}:${r.enabled ? 0 : 1}">${r.enabled ? '끄기' : '켜기'}</button> <button class="mk-btn sm" data-dev="ruleRun:${r.id}">수동 실행</button></td></tr>`).join('')}</table></div>
      <div class="dev-cols">
        <div class="mk-card"><h4>실행 로그</h4>
          <table class="adm-tbl"><tr><th>시각</th><th>규칙</th><th>매치</th><th>결과</th></tr>
          ${runs.map((r) => `<tr><td>${ts(r.at)}</td><td>${esc((rules.find((x) => x.id === r.ruleId) || {}).name || r.ruleId)}</td><td>${badge(r.matched, r.matched ? '매치' : '조건 불일치')}</td><td>${r.results.map((x) => esc(x.type) + (x.ok ? '✓' : '✗')).join(' ') || '—'}</td></tr>`).join('')}</table></div>
        <div class="mk-card"><h4>발신함 (email·slack·discord 시뮬레이션)</h4>
          ${out.map((m) => `<div class="dev-msg"><b>[${m.channel}]</b> ${esc(m.to)} — ${esc(m.text)}</div>`).join('') || '<p class="dev-note">비어 있음</p>'}
          <div class="dev-row" style="margin-top:8px">
            <button class="mk-btn" data-dev="fireSave1">발표자료 저장 발화(매치)</button>
            <button class="mk-btn" data-dev="fireSave2">통신문 저장 발화(불일치)</button>
            <button class="mk-btn" data-dev="tickWeek">⏩ 7일 진행(스케줄 발화)</button></div></div>
      </div>`;
  }

  /* ---------- 워크플로 ---------- */
  function Flow() {
    const flows = A().flows(); const f = flows[0]; const runs = A().flowRuns().slice(-8).reverse();
    const sel = st.flowRunSel ? A().flowRun(st.flowRunSel) : runs[0];
    const nodeChip = (n) => `<span class="dev-node t-${n.type}">${n.type === 'trigger' ? '⚡' : n.type === 'branch' || n.type === 'condition' ? '◇' : n.type === 'loop' ? '↻' : n.type === 'delay' ? '⏱' : n.type === 'variable' ? '𝑥' : '▶'} ${esc(n.id)}<small>${esc(n.config && (n.config.event || n.config.type || n.config.name || (n.config.ms ? n.config.ms + 'ms' : '') || ''))}</small></span>`;
    return `
      ${f ? `<div class="mk-card"><h4>${esc(f.name)} — 노드 그래프</h4>
        <div class="dev-flow">${f.nodes.map(nodeChip).join('')}</div>
        <table class="adm-tbl" style="margin-top:8px"><tr><th>from</th><th>port</th><th>to</th></tr>
        ${f.edges.map((e) => `<tr><td>${esc(e.from)}</td><td>${esc(e.port || 'out')}</td><td>${esc(e.to)}</td></tr>`).join('')}</table>
        <div class="dev-row" style="margin-top:8px">
          <button class="mk-btn primary" data-dev="flowPdf">실행(PDF 경로 — true 분기)</button>
          <button class="mk-btn" data-dev="flowPng">실행(PNG 경로 — false 분기)</button>
          <button class="mk-btn" data-dev="tickFlow">⏩ 5초 진행(delay 재개)</button></div></div>` : ''}
      <div class="dev-cols">
        <div class="mk-card"><h4>실행 이력</h4>
          <table class="adm-tbl"><tr><th>run</th><th>상태</th><th>로그 수</th><th></th></tr>
          ${runs.map((r) => `<tr><td>${esc(r.id)}</td><td>${r.status === 'completed' ? badge(true, '완료') : r.status === 'waiting' ? '<span class="mk-badge">대기(delay)</span>' : esc(r.status)}</td><td>${r.log.length}</td><td><button class="mk-btn sm" data-dev="flowSel:${r.id}">보기</button></td></tr>`).join('') || '<tr><td colspan="4">없음</td></tr>'}</table></div>
        <div class="mk-card"><h4>노드별 실행 로그</h4>
          ${sel ? `<p class="dev-note">${esc(sel.id)} · ${esc(sel.status)}</p><ol class="dev-log">${sel.log.map((l) => `<li><code>${esc(l.node)}</code> [${esc(l.type)}] ${esc(l.msg)}</li>`).join('')}</ol>` : '<p class="dev-note">실행을 선택하면 노드별 로그가 표시된다.</p>'}</div>
      </div>`;
  }

  /* ---------- 모니터링 ---------- */
  function Mon() {
    const m = A().monitor();
    return `
      <div class="adm-stats">${Stat('총 호출', m.totals.count)}${Stat('오류', m.totals.errors)}${Stat('오류율', m.totals.count ? (m.totals.errors / m.totals.count * 100).toFixed(1) + '%' : '0%')}${Stat('배달 대기', m.pending)}${Stat('DLQ', m.dlq)}</div>
      <div class="mk-card"><h4>키별 사용량 · 지연 · 상태코드</h4>
        <table class="adm-tbl"><tr><th>키</th><th>호출</th><th>오류</th><th>평균ms</th><th>최대ms</th><th>상태코드</th><th>상위 라우트</th></tr>
        ${m.keys.map((k) => `<tr><td><code>${esc(k.key)}</code></td><td>${k.count}</td><td>${k.errors}</td><td>${k.avgMs}</td><td>${k.maxMs}</td><td>${Object.entries(k.byStatus).map(([s, c]) => s + '×' + c).join(' ')}</td><td>${k.topRoutes.map(([r, c]) => esc(r.split(' ')[1]) + '×' + c).join('<br>')}</td></tr>`).join('') || '<tr><td colspan="7">없음</td></tr>'}</table></div>
      <div class="mk-card"><h4>쿼터 실연 — 레이트 리밋 실판정</h4>
        <div class="dev-row"><button class="mk-btn" data-dev="burst">금성초 키로 70연타(1200/min 내 — 통과)</button>
        <button class="mk-btn" data-dev="burstFree">free 티어 키 생성 후 70연타(60/min → 429)</button></div>
        <p class="dev-note">429 응답에는 Retry-After · X-RateLimit-* 헤더가 실린다 — 탐색기 Response 로 확인 가능.</p></div>
      <div class="mk-card"><h4>웹훅 상태</h4>
        <table class="adm-tbl"><tr><th>URL</th><th>성공</th><th>실패</th></tr>
        ${m.hooks.map((h) => `<tr><td><code>${esc(h.url)}</code></td><td>${h.delivered}</td><td>${h.failed}</td></tr>`).join('')}</table></div>`;
  }

  /* ---------- 문서 ---------- */
  function Docs() {
    const spec = A().openapi('v2'); const routes = A().routes(); const r = routes[st.docRoute];
    return `
      <div class="mk-card"><h4>OpenAPI 3.1 — /v2/openapi.json (${Object.keys(spec.paths).length} paths)</h4>
        <details><summary>명세 미리보기(요약)</summary><pre class="dev-pre">${jf({ openapi: spec.openapi, info: spec.info, servers: spec.servers, paths: Object.keys(spec.paths) })}</pre></details></div>
      <div class="dev-cols">
        <div class="mk-card"><h4>API Docs</h4>
          <label class="dev-f">라우트 <select data-dev="docRoute">${routes.map((x, i) => `<option value="${i}" ${i === st.docRoute ? 'selected' : ''}>${x.method} ${x.path}</option>`).join('')}</select></label>
          <p><b>${esc(r.summary)}</b> · 스코프 <code>${esc(r.scope || '공개')}</code> · 버전 ${r.versions.map((v) => 'v' + v).join('/')}</p>
          ${r.schema ? `<table class="adm-tbl"><tr><th>필드</th><th>타입</th><th>필수</th><th>제약</th></tr>${Object.entries(r.schema).map(([k, v]) => `<tr><td>${k}</td><td>${v.type || 'string'}</td><td>${v.required ? '✓' : ''}</td><td>${v.enum ? v.enum.join('|') : v.max ? '≤' + v.max : ''}</td></tr>`).join('')}</table>` : '<p class="dev-note">본문 없음</p>'}</div>
        <div class="mk-card"><h4>SDK — ${A().SDK_LANGS.join(' · ')}</h4>
          <p class="dev-note">JS SDK 는 실동작(전 호출 Gateway 통과). 나머지는 스니펫 생성기.</p>
          <pre class="dev-pre">${esc(A().sdkSnippet('javascript', { method: r.method, path: r.path, schema: r.schema }))}</pre>
          <pre class="dev-pre">${esc(A().sdkSnippet('python', { method: r.method, path: r.path, schema: r.schema }))}</pre></div>
      </div>
      <div class="mk-card"><h4>CLI</h4>
        <div class="dev-row"><input data-dev="cliLine" value="${esc(st.cliLine)}" style="flex:1"><button class="mk-btn primary" data-dev="cliRun">실행</button></div>
        ${st.cliOut ? `<pre class="dev-pre ${st.cliOut.ok ? '' : 'err'}">${esc(st.cliOut.out)}</pre>` : '<p class="dev-note">mk projects list · mk projects create --name X · mk export --project ID --format pdf · mk generate text --prompt Y · mk deploy</p>'}</div>`;
  }

  /* ---------- 조립 ---------- */
  const TABS = [['over', '개요'], ['explorer', '탐색기'], ['auth', '인증'], ['hooks', '웹훅'], ['auto', '자동화'], ['flow', '워크플로'], ['mon', '모니터링'], ['docs', '문서']];
  function render() {
    const body = { over: Over, explorer: Explorer, auth: Auth, hooks: Hooks, auto: Auto, flow: Flow, mon: Mon, docs: Docs }[st.tab]();
    return `<div class="mkt-wrap adm-wrap">
      <div class="mkt-tabs">${TABS.map(([k, l]) => `<button class="mkt-tab ${st.tab === k ? 'on' : ''}" data-dev="tab:${k}">${l}</button>`).join('')}</div>
      ${st.msg ? `<div class="adm-msg ${st.msg.ok ? 'ok' : 'no'}">${esc(st.msg.text)}</div>` : ''}
      ${body}</div>`;
  }

  function mount(root) {
    const re = () => window.PG.render();
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((el) => el[ev] = fn(el));
    on('button[data-dev]', 'onclick', (el) => () => {
      const [cmd, a, b] = el.dataset.dev.split(':');
      const R = (r, okMsg) => { say(r.ok !== false, r.ok !== false ? okMsg : r.why); re(); };
      if (cmd === 'tab') { st.tab = a; st.msg = null; re(); }
      else if (cmd === 'exec') { execExplorer(); re(); }
      else if (cmd === 'lang') { st.docLang = a; re(); }
      else if (cmd === 'revoke') R(A().revokeKey(a), '키 폐기 완료 — 다음 호출부터 401');
      else if (cmd === 'oauthCode') { const app = A()._apps()[0]; const r = A().authorize(app.clientId, 'teacher-kim', ['project:read'], app.redirectUris[0]); st._code = r.code; R(r, '코드: ' + (r.code || '').slice(0, 22) + '…'); }
      else if (cmd === 'oauthToken') { const app = A()._apps()[0]; const r = A().token({ grant_type: 'authorization_code', code: st._code, client_id: app.clientId, client_secret: app.clientSecret }); st._rt = r.refresh_token; R(r.ok === false ? r : { ok: true }, r.ok === false ? '' : 'access ' + (r.access_token || '').slice(0, 16) + '… + refresh 발급'); }
      else if (cmd === 'oauthRefresh') { const app = A()._apps()[0]; const r = A().token({ grant_type: 'refresh_token', refresh_token: st._rt, client_id: app.clientId, client_secret: app.clientSecret }); const old = st._rt; st._rt = r.refresh_token; R(r.ok === false ? r : { ok: true }, r.ok === false ? '' : '회전 완료 — 이전 refresh(' + (old || '').slice(0, 14) + '…)는 폐기됨'); }
      else if (cmd === 'oauthReuse') { const app = A()._apps()[0]; const r = A().token({ grant_type: 'authorization_code', code: st._code, client_id: app.clientId, client_secret: app.clientSecret }); R({ ok: false, why: '재사용 거부 확인: ' + r.why }); }
      else if (cmd === 'redeliver') R(A().redeliver(a), '재배달 예약 — ⏩ 진행으로 소화');
      else if (cmd === 'fixFlaky') { (S().unflaky || (() => {}))(); R({ ok: true }, '엔드포인트 복구 — 이후 재배달은 성공'); }
      else if (cmd === 'fireExport') { const s = A().sdk({ apiKey: S().geumKey }); s.exports.run(S().projects.p1, 'pdf'); R({ ok: true }, 'export.completed 발화 — 웹훅·워크플로 트리거'); }
      else if (cmd === 'tick40') { A()._tick(40000); R({ ok: true }, '40초 진행 — 재시도 스케줄 소화'); }
      else if (cmd === 'ruleToggle') R(A().setRuleEnabled(a, b === '1'), b === '1' ? '켜짐' : '꺼짐');
      else if (cmd === 'ruleRun') { const r = A().runRule(a); R({ ok: true }, r.matched ? '실행: ' + r.results.map((x) => x.type + (x.ok ? '✓' : '✗')).join(' ') : '조건 불일치 — 액션 미실행'); }
      else if (cmd === 'fireSave1') { const s = A().sdk({ apiKey: S().geumKey }); s.projects.save(S().projects.p1); R({ ok: true }, 'project.saved(발표자료) — 조건 매치 → 액션 실행'); }
      else if (cmd === 'fireSave2') { const s = A().sdk({ apiKey: S().geumKey }); s.projects.save(S().projects.p2); R({ ok: true }, 'project.saved(통신문) — 조건 불일치 → 기록만'); }
      else if (cmd === 'tickWeek') { A()._tick(7 * 86400e3); R({ ok: true }, '7일 진행 — 주간 스케줄 규칙 발화(발신함 확인)'); }
      else if (cmd === 'flowPdf' || cmd === 'flowPng') { const s = A().sdk({ apiKey: S().geumKey }); s.exports.run(S().projects.p1, cmd === 'flowPdf' ? 'pdf' : 'png'); R({ ok: true }, (cmd === 'flowPdf' ? 'PDF' : 'PNG') + ' 내보내기 → 워크플로 시작(delay 대기까지 진행)'); }
      else if (cmd === 'tickFlow') { A()._tick(5000); R({ ok: true }, '5초 진행 — delay 재개 → 완료'); }
      else if (cmd === 'flowSel') { st.flowRunSel = a; re(); }
      else if (cmd === 'burst') { const s = { 'x-api-key': S().geumKey }; let last; for (let i = 0; i < 70; i++) last = A().request({ method: 'GET', path: '/v2/projects', headers: s }); R({ ok: last.status < 400 }, last.status < 400 ? '70연타 전부 통과(잔여 ' + last.headers['x-ratelimit-remaining'] + ')' : 'HTTP ' + last.status); }
      else if (cmd === 'burstFree') { const app = A()._apps()[0]; const k = A().createKey(app.id, { tier: 'free', label: '실연용 free' }).key; let last; for (let i = 0; i < 70; i++) last = A().request({ method: 'GET', path: '/v2/projects', headers: { 'x-api-key': k.token } }); R({ ok: false, why: 'HTTP ' + last.status + ' rate_limited · Retry-After ' + last.headers['retry-after'] + 's (한도 60/min)' }); }
      else if (cmd === 'cliRun') { st.cliOut = A().cli(st.cliLine, { apiKey: S().geumKey }); re(); }
    });
    on('select[data-dev]', 'onchange', (el) => () => {
      const k = el.dataset.dev;
      if (k === 'exRoute') { st.exRoute = +el.value; st.exParams = ''; st.exBody = ''; st.exResp = null; }
      else if (k === 'exVer') st.exVer = el.value;
      else if (k === 'exAuth') st.exAuth = el.value;
      else if (k === 'docRoute') st.docRoute = +el.value;
      re();
    });
    on('input[data-dev],textarea[data-dev]', 'oninput', (el) => () => {
      const k = el.dataset.dev;
      if (k === 'exParams') st.exParams = el.value;
      else if (k === 'exBody') st.exBody = el.value;
      else if (k === 'cliLine') st.cliLine = el.value;
    });
  }

  return { title: 'Dev', variants: ['Portal'], flush: true, render: () => render(), mount, _st: st };
})();
