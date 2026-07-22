/* ============================================================
   화면: Left Navigation — 배우지 않아도 되는 길 (Round 32)
   ------------------------------------------------------------
   개요/메뉴 감사/기본 구조/AI·검색/문맥·기기/전문가 공방/지표·테스트/
   산출물 8탭. 전 버튼 실함수 — 7행 스펙이 실제로 거부되고,
   「브랜드」 개명이 실심사에서 실제로 기각되고, "영상 만들어줘"가
   실제로 화면을 이동시키고, 초보자 커스텀이 실제로 막힌다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.nav = (() => {
  const N = () => window.MK_NAV, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', out: null, q: '', route: '' };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const row = (l, r) => `<div class="dls-lm-row"><span>${l}</span><span>${r}</span></div>`;
  const vio = (a) => a.ok ? badge(true, '위반 0') : a.violations.map((v) => badge(false, v)).join(' ');

  const TABS = [['over', '개요'], ['audit', '메뉴 감사'], ['struct', '기본 구조'], ['ainav', 'AI·검색'],
                ['ctx', '문맥·기기'], ['ws', '전문가 공방'], ['mt', '지표·테스트'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const n = N(), a = n.menuAudit(), ba = n.beforeAfter();
    return `
      <div class="adm-stats">
        ${Stat('기본 행', n.rows().length + ' + 입구 1', '≤' + n.MAX_ROWS + ' (§3)')}
        ${Stat('전수 분류', a.ok ? a.total + '/' + a.total : '누락', '유지·통합·숨김·삭제·AI')}
        ${Stat('5초 테스트', n.fiveSecTest().ok ? '통과' : '실패', '혼란 메뉴 0')}
        ${Stat('완료 조건', n.complete() ? '충족' : '미달', '§18')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0·§1)</h4>
        <p class="dev-note">${esc(n.PHILOSOPHY.role)}</p>
        <p class="dev-note">${n.PHILOSOPHY.rules.map(esc).join(' · ')}</p>
        <p class="dev-note"><b>${esc(n.PHILOSOPHY.guide)}</b></p></div>
      <div class="mk-card"><h4>Before / After (§17)</h4>
        <div class="dls-lm">
          ${row('노출 행', `<b>${ba.before.rows}</b> → <b>${ba.after.rows} + 입구 ${ba.after.entrance}</b>`)}
          ${row('이름', `${esc(ba.before.naming)} → <b>${esc(ba.after.naming)}</b>`)}
          ${row('이해', `${esc(ba.before.grasp)} → <b>${esc(ba.after.grasp)}</b>`)}
          ${row('AI', `${esc(ba.before.ai)} → <b>${esc(ba.after.ai)}</b>`)}
        </div></div>
      <div class="mk-card"><h4>헌법 조정 기록</h4>
        <p class="dev-note">지시서 §4는 AI 를 다섯 번째 메뉴로 추천하지만, 헌법·MK_TEN 은 "AI 단독 메뉴 금지"를 이미 성문화했다. 지시서 §7 스스로도 AI 를 이동 방식이라 말한다 — 그래서 AI 는 행이 아니라 <b>입구(entrance)</b>다. 첫 화면 항목 수는 지시서 그대로 5(4행+입구).</p></div>`;
  }

  /* ---------- 메뉴 감사 ---------- */
  function Audit() {
    const n = N(), a = n.menuAudit();
    const cls = { keep: '유지', merge: '통합', hide: '숨김', delete: '삭제', ai: 'AI 대체' };
    return `
      <div class="adm-stats">${n.AUDIT_CLASSES.map((c) => Stat(cls[c], a.ok ? a.by[c].length : '—')).join('')}</div>
      <div class="mk-card"><h4>전수 분류 (§2) — 레거시 표면 ${a.total}개, 누락 0 기계검증</h4>
        <p>${vio(a)}</p>
        <button class="mk-btn" data-nv-partial>일부만 분류한 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      ${n.AUDIT_CLASSES.map((c) => a.ok && a.by[c].length ? `
        <div class="mk-card"><h4>${esc(cls[c])} — ${a.by[c].length}</h4>
          <div class="dls-lm">${a.by[c].slice(0, 12).map((r) => row(esc(r.id), esc(r.reason.slice(0, 46)))).join('')}
          ${a.by[c].length > 12 ? row('…', '외 ' + (a.by[c].length - 12) + '개') : ''}</div></div>` : '').join('')}`;
  }

  /* ---------- 기본 구조 ---------- */
  function Struct() {
    const n = N(), d = n.defaultAudit(), c = n.countAudit(), e = n.expertAudit(), p = n.progressiveAudit(), pr = n.priorityAudit();
    return `
      <div class="mk-card"><h4>기본 Navigation (§4) — 4행 + AI 입구 = 5</h4>
        <p>${vio(d)}</p>
        <div class="nv-preview">${n.rows().map((m) => `<div class="nv-row ${n.tierOf(m) === 1 ? 'lg' : ''}">${esc(m.label)}<small>${esc(m.why.split(' — ')[0])}</small></div>`).join('')}
          <div class="nv-row entrance">AI — 말하면 이동한다<small>메뉴가 아니라 입구</small></div></div></div>
      <div class="mk-card"><h4>수 제한 (§3) — 최대 ${n.MAX_ROWS}, 그 이상은 금지</h4>
        <p>${vio(c)}</p>
        <button class="mk-btn" data-nv-seven>7행 스펙 판정 시도</button>
        <button class="mk-btn" data-nv-two>2행 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>전문가 격리 (§5) — 8토큰 기본 표면 0</h4>
        <p>${vio(e)}</p>
        <p>${e.tokens.map((t) => `<span class="mk-badge">${esc(t)}</span>`).join(' ')}</p></div>
      <div class="mk-card"><h4>Progressive (§6) — 첫 가입 ${p.first.length}행 → 옵트인 ${p.power}행</h4>
        <p>${vio(p)}</p>
        <p class="dev-note">편집 9999회도 옵트인 없이는 전문가 미노출 — 자동 승격 없음</p></div>
      <div class="mk-card"><h4>Visual Priority (§11) — 빈도순 크기 단조</h4>
        <p>${vio(pr)}</p><p>${pr.order.map((o) => `<span class="mk-badge">${esc(o)}</span>`).join(' ')}</p></div>`;
  }

  /* ---------- AI · 검색 ---------- */
  function AiNav() {
    const n = N(), a = n.aiNavAudit(), s = n.searchAudit(), nm = n.nameAudit();
    const hits = st.q ? n.search(st.q) : [];
    return `
      <div class="mk-card"><h4>AI Navigation (§7) — 메뉴를 찾는 대신 말한다</h4>
        <p>${vio(a)}</p>
        <input type="text" class="mk-input" data-nv-intent placeholder="예: 영상 만들어줘 · 브랜드 색 바꿔줘" value="${esc(st.route)}" aria-label="AI 이동 명령">
        <button class="mk-btn" data-nv-go>말해서 이동</button>
        ${st.out ? `<p>${st.out}</p>` : ''}
        <p class="dev-note">이동 버튼은 PG.go 를 실제로 호출한다 — 화면이 정말 바뀐다.</p></div>
      <div class="mk-card"><h4>Search First (§8) — ${esc(n.SHORTCUT)} · 색인 ${n.searchIndex().length}</h4>
        <p>${vio(s)}</p>
        <input type="text" class="mk-input" data-nv-q placeholder="숨김·전문가 포함 전 메뉴 검색 (예: 에셋, admin)" value="${esc(st.q)}" aria-label="메뉴 검색">
        ${st.q ? `<p>${hits.length ? hits.map((h) => `<span class="mk-badge">${esc(h.label)}</span>`).join(' ') : badge(false, '결과 0')}</p>` : ''}</div>
      <div class="mk-card"><h4>Naming Audit (§10) — 개명 자체를 심사</h4>
        <p>${vio(nm)}</p>
        <div class="dls-lm">${Object.entries(nm.renames).map(([f, t]) => row(esc(f), '<b>' + esc(t) + '</b>')).join('')}
          ${row('Brand Kit → 브랜드', badge(false, '기각 — 금지어(§10)'))}</div>
        <button class="mk-btn" data-nv-badname>지시서 예시 「브랜드」 개명 심사 실행</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>`;
  }

  /* ---------- 문맥 · 기기 ---------- */
  function Ctx() {
    const n = N(), c = n.contextAudit(), mo = n.mobileAudit(), ta = n.tabletAudit();
    return `
      <div class="mk-card"><h4>Context Navigation (§9) — 프로젝트가 메뉴를 정한다</h4>
        <p>${vio(c)}</p>
        <div class="dls-lm">${Object.entries(n.CONTEXT_NAV).map(([t, items]) => row(esc(t), items.map(esc).join(' · '))).join('')}</div>
        <p class="dev-note">영상 문맥에 발표 전용 항목 0 — 교차 소음 기계검증</p></div>
      <div class="mk-card"><h4>Mobile (§12) — Bottom Navigation ≤5</h4>
        <p>${vio(mo)}</p>
        <div class="nv-bottom">${n.MOBILE_NAV.items.map((i) => `<span>${esc(i)}</span>`).join('')}</div>
        <p class="dev-note">숨김 메뉴는 검색으로 접근(§12)</p></div>
      <div class="mk-card"><h4>Tablet (§13) — 필요할 때만 확장</h4>
        <p>${vio(ta)}</p>
        <div class="dls-lm">${row('형태', 'Collapsible Sidebar')}${row('기본', '접힘')}${row('행', ta.nav.rows.map(esc).join(' · '))}</div></div>`;
  }

  /* ---------- 전문가 공방 ---------- */
  function Ws() {
    const n = N(), w = n.workspaceAudit();
    const cur = n.customRows();
    return `
      <div class="mk-card"><h4>Expert Workspace (§14) — 전문가만 추가·삭제·재배치</h4>
        <p>${vio(w)}</p>
        <p>${cur.map((id) => `<span class="mk-badge">${esc(id)}</span>`).join(' ')}</p>
        <button class="mk-btn" data-nv-begadd>초보자로 brand 추가 시도</button>
        <button class="mk-btn" data-nv-proadd>전문가로 brand 추가</button>
        <button class="mk-btn" data-nv-rmhome>홈 삭제 시도</button>
        <button class="mk-btn" data-nv-reset>기본 구조로</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>규칙</h4>
        <div class="dls-lm">${row('자격', '옵트인 전문가만')}${row('행 상한', '≤' + n.MAX_ROWS + ' — 커스텀에도 §3 적용')}${row('홈', '삭제 불가 — 길의 시작점')}${row('재배치', '같은 구성 안에서만')}</div></div>`;
  }

  /* ---------- 지표 · 테스트 ---------- */
  function Mt() {
    const n = N(), m = n.metrics(), t = n.fiveSecTest();
    return `
      <div class="mk-card"><h4>Navigation Metrics (§15) — record() 유일 경로 · 미실측 = null</h4>
        <div class="dls-lm">${n.METRIC_KEYS.map((k) => row(esc(k), m[k] == null ? '<i>미실측</i>' : esc(String(m[k])))).join('')}</div>
        <button class="mk-btn" data-nv-recbad>등록 밖 지표 기록 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>5초 사용자 테스트 (§16) — 답이 구조에서 유도된다</h4>
        <p>${badge(t.ok, t.ok ? '통과' : '실패')}</p>
        <div class="dls-lm">
          ${row(esc(t.questions[0]), '<b>' + esc(t.answers.firstClick) + '</b>')}
          ${row(esc(t.questions[1]), t.answers.canDo.map(esc).join(' · '))}
          ${row(esc(t.questions[2]), t.answers.confusing.length ? t.answers.confusing.map(esc).join(',') : '<b>없음</b>')}
        </div></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const n = N(), d = n.deliverablesAudit();
    return `
      <div class="mk-card"><h4>Deliverables 8종 (§17)</h4>
        <p>${badge(d.ok, d.ok ? '8/8 실존' : '빈 산출물: ' + d.empty.join(','))}</p>
        <div class="dls-lm">${d.keys.map((k) => row(esc(k), badge(!d.empty.includes(k), d.empty.includes(k) ? '빈' : '실존'))).join('')}</div></div>
      <div class="mk-card"><h4>완료 조건 (§18)</h4>
        <p>${badge(n.complete(), n.complete() ? '전 감사 통과 — 메뉴를 읽지 않아도 길이 보인다' : '미달')}</p>
        <p class="dev-note">${esc(n.PHILOSOPHY.guide)}</p></div>`;
  }

  const BODIES = { over: Over, audit: Audit, struct: Struct, ainav: AiNav, ctx: Ctx, ws: Ws, mt: Mt, out: Out };

  function render() {
    return `<div class="mk-wrap">
      <div class="mk-tabs">${TABS.map(([k, l]) => `<button class="mk-tab ${st.tab === k ? 'on' : ''}" data-nv-tab="${k}">${l}</button>`).join('')}</div>
      ${BODIES[st.tab]()}
    </div>`;
  }

  function mount(root) {
    const rerender = () => { root.innerHTML = render(); mount(root); };
    root.querySelectorAll('[data-nv-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.nvTab; st.out = null; rerender(); });
    const N_ = window.MK_NAV;
    const out = (html) => { st.out = html; rerender(); };
    const on = (sel, fn) => { const el = root.querySelector(sel); if (el) el.onclick = fn; };
    on('[data-nv-partial]', () => { const r = N_.menuSpecAudit({ classified: { home: 'keep' } });
      out(badge(false, '거부 — 미분류 ' + r.missing.length + '개 (누락 0 이어야 심사 가능)')); });
    on('[data-nv-seven]', () => { const r = N_.countSpecAudit(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
      out(badge(r.ok, r.ok ? '통과?' : r.violations[0])); });
    on('[data-nv-two]', () => { const r = N_.countSpecAudit(['a', 'b']);
      out(badge(r.ok, r.ok ? '통과?' : r.violations[0])); });
    on('[data-nv-badname]', () => { const j = N_.renameJudge('Brand Kit', '브랜드');
      out(badge(j.ok, j.ok ? '통과 — 고장' : '기각 — ' + j.reason)); });
    on('[data-nv-go]', () => { const i = root.querySelector('[data-nv-intent]'); st.route = i ? i.value : '';
      const r = N_.exec(st.route);
      if (r.ok && r.moved) return;                     /* 실제 화면 이동 — 재렌더 불필요 */
      out(badge(r.ok, r.ok ? r.label : '미인식 → 검색으로 낙하(§8)')); });
    on('[data-nv-begadd]', () => out((() => { const r = N_.customize({ edits: 0 }, { add: 'brand' });
      return badge(r.ok, r.ok ? '통과 — 고장' : '거부 — ' + r.reason); })()));
    on('[data-nv-proadd]', () => out((() => { const r = N_.customize({ edits: 20, expertOptIn: true }, { add: 'brand' });
      return badge(r.ok, r.ok ? '추가됨: ' + r.rows.join(' · ') : r.reason); })()));
    on('[data-nv-rmhome]', () => out((() => { const r = N_.customize({ edits: 20, expertOptIn: true }, { remove: 'home' });
      return badge(r.ok, r.ok ? '통과 — 고장' : '거부 — ' + r.reason); })()));
    on('[data-nv-reset]', () => { N_.resetCustom(); rerender(); });
    on('[data-nv-recbad]', () => out((() => { const r = N_.record('clicksPerDay', 3);
      return badge(r.ok, r.ok ? '통과 — 고장' : '거부 — ' + r.reason); })()));
    const q = root.querySelector('[data-nv-q]');
    if (q) q.oninput = () => { st.q = q.value; const pos = q.selectionStart; rerender();
      const nq = root.querySelector('[data-nv-q]'); if (nq) { nq.focus(); nq.setSelectionRange(pos, pos); } };
  }

  return { title: 'Left Navigation — 배우지 않아도 되는 길', variants: ['R32'], render, mount };
})();
