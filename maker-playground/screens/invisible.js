/* ============================================================
   화면: Invisible — Invisible UX  (Round 28)
   ------------------------------------------------------------
   개요/UI 감사/결정·기본값/컨텍스트·툴바/동반자·자동화/검색·의도/
   마찰·감정/산출물 8탭. 전 버튼 실함수 —
   "AI 동반자는 기본 숨김" · "무알림 자동화가 저널에 남는다" ·
   "추가만 있는 UI 제안은 게이트가 거부한다" 를 화면에서 실연.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.invisible = (() => {
  const V = () => window.MK_INVIS, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', ctx: 'text', idle: 0, err: false, ask: false, q: '발표', qr: null, it: null, prop: null };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const chip = (t, cls) => `<span class="mk-badge ${cls || ''}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const VD_KO = { keep: '유지', remove: '제거', automate: '자동화', ai: 'AI 대체' };
  const VD_BD = { keep: 'success', remove: 'danger', automate: 'info', ai: 'warning' };

  const TABS = [['over', '개요'], ['audit', 'UI 감사'], ['dec', '결정·기본값'], ['ctx', '컨텍스트·툴바'],
                ['auto', '동반자·자동화'], ['sea', '검색·의도'], ['fri', '마찰·감정'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const d = V().deliverables(), ar = V().auditReport(), mc = V().masteryCurve();
    return `
      <div class="adm-stats">
        ${Stat('산출물', d.filter((x) => x.ready).length + '/7', '§20')}
        ${Stat('UI 감사', ar.total + '요소', '유지 ' + ar.keep.length + ' · 축소 ' + (ar.total - ar.keep.length))}
        ${Stat('결정 감축', Math.round(V().decisionReduction().rate * 100) + '%', '≥50% (§2)')}
        ${Stat('완료 조건', V().complete() ? '충족' : '미달', '§21')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0)</h4>
        <p class="dev-note"><b>${esc(V().PHILOSOPHY.best)}</b></p>
        <p class="dev-note">${esc(V().PHILOSOPHY.hero)}</p>
        <p class="dev-note">${esc(V().PHILOSOPHY.user)}</p></div>
      <div class="mk-card"><h4>Progressive Mastery (§15)</h4>
        <div class="dls-lm">${mc.points.map((p) => `<div class="dls-lm-row"><span><b>${esc(p.at)}</b></span><span class="dev-note">기능 ${p.features}개</span></div>`).join('')}</div>
        <p>${badge(mc.ok, '단조 증가 · 학습 이벤트 0 · 노출은 전부 수동적')} <span class="dev-note">기능 우주 ${mc.universe.total}개(메뉴 ${mc.universe.menu}·명령 ${mc.universe.cmds}·컨텍스트 ${mc.universe.ctx})</span></p></div>
      <div class="mk-card"><h4>Motion (§10) · Typography (§11)</h4>
        <p>${V().MOTIONS.map((m) => chip(m.id + ' ' + m.ms + 'ms', 'info')).join(' ')} ${badge(V().motionAudit().ok, '장식 0 · 전부 ≤300ms')}</p>
        <p>서체 ${V().TYPE.families.length}계열 · 장식 폰트 ${V().TYPE.decorative} ${badge(V().typeAudit().ok, '정보 전달 우선')}</p></div>`;
  }

  /* ---------- UI 감사 ---------- */
  function Audit() {
    const ar = V().auditReport();
    return `
      <div class="mk-card"><h4>Interface Audit (§1) — 4질문 전수</h4>
        <p class="dev-note">이 UI가 정말 필요한가? 없어도 되는가? 자동으로 할 수 있는가? AI가 대신할 수 있는가?</p>
        <div class="dls-lm">${V().AUDIT.map((a) => `<div class="dls-lm-row"><span>${chip(VD_KO[a.verdict], VD_BD[a.verdict])} <b>${esc(a.label)}</b> <span class="dev-note">${esc(a.screen)}</span></span><span class="dev-note">필요 ${a.q.needed ? 'O' : 'X'} · 제거가능 ${a.q.removable ? 'O' : 'X'} · 자동화 ${a.q.automatable ? 'O' : 'X'} · AI ${a.q.aiReplaceable ? 'O' : 'X'}</span></div>`).join('')}</div>
        <p>${badge(ar.allAnswered, '4질문 전답')} 유지 ${ar.keep.length} · 제거 ${ar.remove.length} · 자동화 ${ar.automate.length} · AI 대체 ${ar.ai.length} — 축소율 ${Math.round(ar.reducedRatio * 100)}%</p></div>
      <div class="mk-card"><h4>Design Review 게이트 (§18) — 추가 전에 삭제부터</h4>
        <div class="dls-row">
          <button class="mk-btn sm" data-iv-prop="add">추가만 제안(새 패널)</button>
          <button class="mk-btn sm" data-iv-prop="swap">교체 제안(추가 1·삭제 2)</button>
        </div>
        ${st.prop ? (() => { const r = V().designReview(st.prop); return `<p>${badge(r.ok, r.verdict)} <span class="dev-note">${esc(r.reason)}</span></p>`; })() : ''}</div>
      <div class="mk-card"><h4>기억 테스트 (§21)</h4>
        <p class="dev-note">사용자가 기억해야 하는 UI 요소 = 0. 기억에 남는 건 한 문장뿐.</p>
        <p>${badge(V().memoryTest().ok, '"' + V().memoryTest().takeaway + '"')}</p></div>`;
  }

  /* ---------- 결정·기본값 ---------- */
  function Dec() {
    const dr = V().decisionReduction(), da = V().defaultAudit();
    return `
      <div class="mk-card"><h4>Decision Reduction (§2) — ${dr.before}개 → ${dr.after}개</h4>
        <div class="adm-stats">${Stat('종전 결정', dr.before + '개')}${Stat('현재 결정', dr.after + '개', dr.kept.map((k) => k.label).join(' · '))}${Stat('감축률', Math.round(dr.rate * 100) + '%', '≥50%')}</div>
        <div class="dls-lm">${dr.resolved.map((d) => `<div class="dls-lm-row"><span><b>${esc(d.label)}</b></span><span>${chip(d.how === 'ai' ? 'AI가 결정' : '기본값', d.how === 'ai' ? 'warning' : 'info')}</span></div>`).join('')}</div>
        <p>${badge(dr.ok, dr.ok ? '감축 ' + Math.round(dr.rate * 100) + '% · 미처리 0' : '미처리: ' + dr.unresolved.map((u) => u.id).join(','))}</p></div>
      <div class="mk-card"><h4>Default First (§3) — 사용자는 수정만 하면 된다</h4>
        <div class="dls-lm">${Object.entries(V().DEFAULTS).map(([k, v]) => `<div class="dls-lm-row"><span><b>${esc(k)}</b> = ${esc(v.value)}</span><span class="dev-note">${esc(v.why)} ${v.editable ? '· 수정 가능' : ''}</span></div>`).join('')}</div>
        <p>${badge(da.ok, da.ok ? 'default 지정 전 항목 기본값 보유 · 전부 수정 가능' : '누락: ' + da.missing.join(','))}</p></div>
      <div class="mk-card"><h4>One Goal Screen (§5)</h4>
        <div class="dls-lm">${Object.entries(V().SCREEN_GOALS).map(([k, s]) => `<div class="dls-lm-row"><span><b>${esc(k)}</b> — ${esc(s.goals[0])}</span><span class="dev-note">주 행동 = ${esc(s.primary)}</span></div>`).join('')}</div>
        <p>${badge(V().oneGoalAudit().ok, '전 화면 목표 1개 · 주 행동 1개')}</p></div>
      <div class="mk-card"><h4>Natural Workflow (§6)</h4>
        <div class="dev-pipe">${V().workflowAudit().chain.map((c) => `<span class="dev-pipe-node on">${esc(c)}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">각 단계가 다음 행동을 예측해 필요한 것만 준비: ${Object.entries(V().WORKFLOW).map(([k, w]) => k + '→[' + w.prepare.join(',') + ']').join(' · ')}</p>
        <p>${badge(V().workflowAudit().ok, 'arrive→done ' + V().workflowAudit().hops + '홉 · 전 단계 준비물 보유')}</p></div>`;
  }

  /* ---------- 컨텍스트·툴바 ---------- */
  function Ctx() {
    const ca = V().contextAudit(), tb = V().smartToolbar(st.ctx === 'none' ? null : st.ctx);
    const sb = V().spaceBudget();
    return `
      <div class="mk-card"><h4>Context First (§4) — 무관한 기능은 절대 보이지 않는다</h4>
        <div class="dls-lm">${ca.rows.map((r) => `<div class="dls-lm-row"><span><b>${esc(r.type)}</b></span><span class="dev-note">${r.items.join(' · ')} (${r.n}개)</span></div>`).join('')}</div>
        <p>${badge(ca.ok, ca.ok ? '전 컨텍스트 ≤6항목 · 상시 전체 노출 0 · 전문 기능 누출 0' : '누출: ' + ca.leaked.join(','))}</p></div>
      <div class="mk-card"><h4>Smart Toolbar (§8) — 선택이 툴바를 결정한다</h4>
        <div class="dls-row">${['none', 'text', 'image', 'table'].map((k) => `<button class="mk-btn sm ${st.ctx === k ? 'primary' : ''}" data-iv-ctx="${k}">${k}</button>`).join('')}</div>
        ${tb ? `<p>선택 = <b>${esc(tb.selType)}</b> → 도구 ${tb.tools.length}개: ${tb.tools.map((t) => chip(t)).join(' ')}</p>` : ''}
        <p>${badge(V().toolbarAudit().ok, 'text≠image 실차이 · 무선택 시 최소')}</p></div>
      <div class="mk-card"><h4>Empty Space (§9) — 여백은 생각할 공간</h4>
        <p>홈 화면 밀도 유닛 ${sb.units}/12 → 여백 ${Math.round(sb.whitespace * 100)}% ${badge(sb.ok, '≥' + V().WHITESPACE_MIN * 100 + '%')}</p>
        <div style="height:14px;background:var(--mk-line,#E4E8EE);border-radius:7px;overflow:hidden"><div style="height:100%;width:${Math.round(sb.whitespace * 100)}%;background:var(--mk-teal,#2A9D8F)"></div></div></div>`;
  }

  /* ---------- 동반자·자동화 ---------- */
  function Auto() {
    const c = V().companion({ idleSec: st.idle, error: st.err, asked: st.ask });
    const sa = V().silentAudit();
    return `
      <div class="mk-card"><h4>AI Companion (§7) — 패널이 아니라 조용한 조력자</h4>
        <div class="dls-row">
          <button class="mk-btn sm" data-iv-idle>20초 멈춤 시뮬</button>
          <button class="mk-btn sm" data-iv-err>오류 발생 시뮬</button>
          <button class="mk-btn sm" data-iv-ask>직접 부르기</button>
          <button class="mk-btn sm" data-iv-calm>평상시로</button>
        </div>
        <div style="margin-top:10px;padding:16px;border:1px dashed var(--mk-line,#E4E8EE);border-radius:12px;min-height:56px;position:relative">
          <span class="dev-note">편집 캔버스 (시뮬)</span>
          ${c.visible ? `<div style="position:absolute;right:12px;bottom:10px;padding:9px 13px;background:var(--mk-surface,#fff);border:1.5px solid var(--mk-teal,#2A9D8F);border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.08)">🤝 ${esc(c.offer)}</div>` : ''}
        </div>
        <p>${badge(!V().companion({}).visible, '평상시 = 숨김')} ${badge(!c.isPanel, '고정 패널 아님')} ${c.visible ? chip('트리거: ' + c.triggers.join(','), 'warning') : chip('지금은 나타날 이유 없음', 'success')}</p></div>
      <div class="mk-card"><h4>Silent Automation (§14) — 알리지 않고 수행한다</h4>
        <div class="dls-row">${V().AUTOS.map((a) => `<button class="mk-btn sm" data-iv-auto="${a.id}">${esc(a.label)}</button>`).join('')}</div>
        <p class="dev-note">실행해도 토스트·알림이 없다. 대신 저널에 남는다 — 알리지 않되 감추지 않는다. 조용한 자동화는 전부 undoable 강제.</p>
        <div class="dls-lm">${V().journal.slice(-6).reverse().map((j) => `<div class="dls-lm-row"><span>#${j.t} ${esc(j.id)}</span><span>${chip('무알림', 'info')} ${chip('undo 가능', 'success')}</span></div>`).join('') || '<p class="dev-note">저널 비어 있음 — 위 버튼으로 실행</p>'}</div>
        <p>${badge(sa.ok, '5종 전부 silent ∧ undoable')}</p></div>`;
  }

  /* ---------- 검색·의도 ---------- */
  function Sea() {
    const r = st.qr, it = st.it;
    return `
      <div class="mk-card"><h4>Search Everything (§12) — 기능이 아니라 결과물을 검색한다</h4>
        <div class="dls-row">
          <input class="mk-input" data-iv-q value="${esc(st.q)}" placeholder="발표, 초대장…" style="width:240px">
          <button class="mk-btn sm primary" data-iv-search>검색</button>
        </div>
        ${r ? r.groups.map((g) => `<div class="mk-card" style="margin-top:8px"><h4>${esc(g.label)}${g.id === 'features' ? ' <span class="dev-note">(마지막 순서)</span>' : ''}</h4>
          ${g.items.length ? `<div class="dls-row" style="flex-wrap:wrap">${g.items.map((i) => chip(i.label, g.id === 'make' ? 'warning' : g.id === 'templates' ? 'info' : '')).join(' ')}</div>` : '<p class="dev-note">—</p>'}</div>`).join('') + `<p>${badge(r.featuresLast, '기능 그룹이 항상 마지막')}</p>` : ''}</div>
      <div class="mk-card"><h4>AI Intent (§13) — "발표" 한 단어로 전 과정 준비</h4>
        <button class="mk-btn sm primary" data-iv-intent>"발표" 실행</button>
        ${it ? `
        <div class="dev-pipe" style="margin-top:10px">${it.steps.map((s) => `<span class="dev-pipe-node on">${esc(s.label)}${s.auto ? '' : ' 👤'}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p>사용자 결정 <b>${it.userDecisions}회</b> ${badge(it.userDecisions === 1, '입력 한 번뿐')} ${badge(it.produced, 'MK_AI 실생성 ' + it.scenes + '씬 · type=' + (it.type || '—'))} ${badge(it.ok, it.ok ? '통과' : '실패')}</p>` : ''}</div>`;
  }

  /* ---------- 마찰·감정 ---------- */
  function Fri() {
    const f = V().friction();
    return `
      <div class="mk-card"><h4>Friction Report (§17) — 클릭·입력·대기 전수</h4>
        <div class="adm-stats">${Stat('최대 클릭', f.clicks.max + '회', '예산 ≤3')}${Stat('첫 결과물 입력', f.inputs.firstOutput + '회', f.inputs.note)}${Stat('대기 구간', f.waits.length + '곳', '전부 피드백 표시')}</div>
        <div class="dls-lm">${f.waits.map((w) => `<div class="dls-lm-row"><span>${esc(w.step)} ${w.sec}s</span><span>${chip(w.feedback, 'info')}</span></div>`).join('')}</div>
        <p class="dev-note">제거된 마찰: ${f.removed.join(' · ')}</p>
        <p>${badge(f.ok, f.ok ? '마찰 감사 통과' : '실패')}</p></div>
      <div class="mk-card"><h4>User Emotion (§16) — 불안·혼란·피로를 찾아 제거</h4>
        <div class="dls-lm">${V().EMOTIONS.map((e) => `<div class="dls-lm-row"><span>${chip(e.emotion, e.emotion === '불안' ? 'danger' : e.emotion === '혼란' ? 'warning' : 'info')} <b>${esc(e.moment)}</b></span><span class="dev-note">${esc(e.fix)}</span></div>`).join('')}</div>
        <p>${badge(V().emotionAudit().ok, '6개 순간 전부 해소책 실장')}</p></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const d = V().deliverables(), mt = V().metrics();
    return `
      <div class="mk-card"><h4>Deliverables 7종 (§20)</h4>
        <div class="dls-lm">${d.map((x) => `<div class="dls-lm-row"><span>${esc(x.name)}</span>${badge(x.ready, x.ready ? 'ready' : 'missing')}</div>`).join('')}</div></div>
      <div class="mk-card"><h4>Success Metrics 6종 (§19)</h4>
        <div class="dls-lm">${mt.map((m) => `<div class="dls-lm-row"><span><b>${esc(m.label)}</b> <span class="dev-note">목표 ${m.target == null ? '실측 전용' : (m.dir === 'down' ? '≤' : '≥') + m.target}</span></span><span>${m.pass == null ? chip('Alpha 실측 대기', 'warning') : badge(m.pass, '현재 ' + m.value)}</span></div>`).join('')}</div>
        <p class="dev-note">UX 만족도는 시뮬로 채우지 않는다 — 실사용자 실측 전까지 공란.</p></div>
      <div class="mk-card"><h4>완료 조건 (§21)</h4>
        <p class="dev-note">사용자는 UI를 기억하지 않는다. "사용하기 정말 편했다"만 기억한다. K-MAKER는 가장 강력한 프로그램이 아니라 가장 생각하지 않고 쓰는 프로그램이다.</p>
        <p>${badge(V().complete(), V().complete() ? 'complete() = true' : '미달')}</p></div>`;
  }

  const BODY = { over: Over, audit: Audit, dec: Dec, ctx: Ctx, auto: Auto, sea: Sea, fri: Fri, out: Out };

  function render() {
    return `
      <div class="dev-tabs">${TABS.map(([k, n]) => `<button class="dev-tab ${st.tab === k ? 'on' : ''}" data-iv-tab="${k}">${n}</button>`).join('')}</div>
      <div data-iv-body>${BODY[st.tab]()}</div>`;
  }

  function mount(root) {
    const RR = () => { root.innerHTML = render(); wire(root); };
    function wire(r) {
      r.querySelectorAll('[data-iv-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.ivTab; RR(); });
      r.querySelectorAll('[data-iv-ctx]').forEach((b) => b.onclick = () => { st.ctx = b.dataset.ivCtx; RR(); });
      r.querySelectorAll('[data-iv-auto]').forEach((b) => b.onclick = () => { V().runAuto(b.dataset.ivAuto); RR(); });
      r.querySelectorAll('[data-iv-prop]').forEach((b) => b.onclick = () => {
        st.prop = b.dataset.ivProp === 'add' ? { adds: ['새 패널'] } : { adds: ['스마트 툴바 확장'], removes: ['고정 툴바', '기능 투어 팝업'] }; RR(); });
      const on = (sel, fn) => { const el = r.querySelector(sel); if (el) el.onclick = fn; };
      on('[data-iv-idle]', () => { st.idle = 25; st.err = false; st.ask = false; RR(); });
      on('[data-iv-err]', () => { st.err = true; st.idle = 0; st.ask = false; RR(); });
      on('[data-iv-ask]', () => { st.ask = true; st.idle = 0; st.err = false; RR(); });
      on('[data-iv-calm]', () => { st.idle = 0; st.err = false; st.ask = false; RR(); });
      on('[data-iv-search]', () => { const i = r.querySelector('[data-iv-q]'); st.q = i ? i.value : st.q; st.qr = V().searchEverything(st.q); RR(); });
      const qi = r.querySelector('[data-iv-q]');
      if (qi) qi.onkeydown = (e) => { if (e.key === 'Enter') { st.q = qi.value; st.qr = V().searchEverything(st.q); RR(); } };
      on('[data-iv-intent]', () => { st.it = V().intent('발표'); RR(); });
    }
    wire(root);
  }

  return { title: 'Invisible — Invisible UX', variants: ['v1'], render, mount };
})();
