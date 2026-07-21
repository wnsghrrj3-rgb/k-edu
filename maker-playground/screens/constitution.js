/* ============================================================
   화면: Constitution — The K-MAKER Constitution  (Round 29)
   ------------------------------------------------------------
   전문·조문/금지·의무/단순성/철학/심사(6단계 실연)/최고규범/
   체크리스트/산출물 8탭. 전 버튼 실함수 —
   "매력도 100 기능도 헌법 충돌이면 기각된다" ·
   "add-only 제안은 심사대에 오르지도 못한다" 를 화면에서 실연.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.constitution = (() => {
  const C = () => window.MK_CONST, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', prop: null, jr: null, sup: null, del: null, rel: null };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const chip = (t, cls) => `<span class="mk-badge ${cls || ''}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const VD_KO = { reject: '기각', use_existing: '기존 기능 사용', delegate_ai: 'AI 위임', automate: '자동화', hide: '숨김(expert)', build: '제작 승인', unanswerable: '심사 불가', rejected: '기각' };
  const VD_BD = { reject: 'danger', rejected: 'danger', unanswerable: 'danger', use_existing: 'info', delegate_ai: 'warning', automate: 'info', hide: 'warning', build: 'success' };

  const TABS = [['over', '전문·조문'], ['rules', '금지·의무'], ['simp', '단순성'], ['phil', '철학'],
                ['jud', '심사'], ['sup', '최고규범'], ['chk', '체크리스트'], ['out', '산출물']];

  /* ---------- 전문·조문 ---------- */
  function Over() {
    const r = C().ratify();
    return `
      <div class="adm-stats">
        ${Stat('조문', r.total + '개조', '§0~§19')}
        ${Stat('비준', r.passed + '/' + r.total, r.ok ? '전조 통과' : '미달 ' + r.failed.join(','))}
        ${Stat('효력 기간', C().HORIZON.years + '년', '§21')}
        ${Stat('완료 조건', C().complete() ? '충족' : '미달', '§21')}
      </div>
      <div class="mk-card"><h4>전문</h4>
        <p class="dev-note"><b>Mission</b> — ${esc(C().MISSION)}</p>
        <p class="dev-note"><b>Ultimate Principle</b> — ${esc(C().ULTIMATE)}</p>
        <p class="dev-note">이 문서는 어떤 기능을 만들 것인가보다, 어떤 기능을 <b>만들지 않을 것인가</b>를 정의한다.</p></div>
      <div class="mk-card"><h4>조문 전문 — 비준 결과 (헌법이 현재 제품을 스스로 검증)</h4>
        <div class="dls-lm">${r.articles.map((a) => `<div class="dls-lm-row"><span>${badge(a.ok, '§' + a.n)} <b>${esc(a.title)}</b></span><span class="dev-note">${esc(a.text)}</span></div>`).join('')}</div>
        <p>${badge(r.ok, r.ok ? '20개조 전조 비준 — 선언이 아니라 실측정' : '비준 실패 조문: ' + r.failed.join(','))}</p></div>`;
  }

  /* ---------- 금지·의무 ---------- */
  function Rules() {
    const na = C().neverAudit(), aa = C().alwaysAudit(), ja = C().jargonAudit();
    return `
      <div class="mk-card"><h4>Never Do (§3) — 5금지 · 전부 실검증</h4>
        <div class="dls-lm">${na.rows.map((n) => `<div class="dls-lm-row"><span>${badge(n.ok, n.ok ? '준수' : '위반')} <b>${esc(n.text)}</b></span><span class="dev-note">${esc(n.how)}</span></div>`).join('')}</div>
        <p>${badge(na.ok, '설정 ' + C().countSettings() + '개 · 초보자 내비 상한 ' + C().CAPS.beginnerNav + ' · 전문 용어 노출 ' + ja.count + '건')}</p></div>
      <div class="mk-card"><h4>Always Do (§4) — 4의무 · 전부 실검증</h4>
        <div class="dls-lm">${aa.rows.map((n) => `<div class="dls-lm-row"><span>${badge(n.ok, n.ok ? '이행' : '불이행')} <b>${esc(n.text)}</b></span><span class="dev-note">${esc(n.how)}</span></div>`).join('')}</div></div>
      <div class="mk-card"><h4>용어 감사 표면 (§3 no-jargon)</h4>
        <p class="dev-note">초보자 노출 표면: ${ja.surface.map((s) => chip(s, 'info')).join(' ')}</p>
        <p>${badge(ja.count === 0, '금지 어휘 ' + C().JARGON.length + '종 검사 — 노출 ' + ja.count + '건')}</p></div>`;
  }

  /* ---------- 단순성 ---------- */
  function Simp() {
    const t = C().simplicityTest(), h = C().hierarchyAudit();
    return `
      <div class="mk-card"><h4>Simplicity Test (§6) — 초등학생 3분</h4>
        <div class="dev-pipe">${t.path.map((p) => `<span class="dev-pipe-node on">${esc(p.step)} ${p.sec}s</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <div class="adm-stats">${Stat('총 소요', t.totalSec + 's', '한도 ' + t.limitSec + 's')}${Stat('사용자 결정', t.userDecisions + '회', '입력 한 번')}${Stat('읽기 수준', t.readingLevel ? '통과' : '실패', '전문 용어 0')}</div>
        <p>${badge(t.ok, t.ok ? t.totalSec + 's ≤ ' + t.limitSec + 's — 통과' : '실패')}</p></div>
      <div class="mk-card"><h4>Information Hierarchy (§5) — 하나만 크게, 나머지는 단계적으로</h4>
        <div class="dls-lm">
          <div class="dls-lm-row"><span><b>첫 화면 최소 구성</b></span>${badge(h.firstScreen, h.firstScreen ? '통과' : '실패')}</div>
          <div class="dls-lm-row"><span><b>가장 큰 것 = 질문 하나</b></span>${badge(h.hero === 1, 'hero ' + h.hero + '개')}</div>
          <div class="dls-lm-row"><span><b>서체 스케일 단조</b></span>${badge(h.scaleMonotonic, h.scaleMonotonic ? '통과' : '실패')}</div>
          <div class="dls-lm-row"><span><b>단계적 공개(사용량 따라 증가)</b></span>${badge(h.progressive, h.progressive ? '통과' : '실패')}</div>
        </div>
        <p>${badge(h.ok, '§5 종합')}</p></div>`;
  }

  /* ---------- 철학 ---------- */
  function Phil() {
    const pa = C().philosophyAudit();
    return `
      <div class="mk-card"><h4>철학 조항 8종 (§7~§14) — 선언 + 라이브 검증</h4>
        <div class="dls-lm">${pa.rows.map((p) => `<div class="dls-lm-row"><span>${badge(p.ok, p.ok ? '실증' : '위반')} <b>${esc(p.title)}</b> — ${esc(p.text)}</span><span class="dev-note">${esc(p.how)}</span></div>`).join('')}</div>
        <p>${badge(pa.ok, '8개 철학 전부 현재 제품에서 실측 통과')}</p></div>
      <div class="mk-card"><h4>Success Definition (§18)</h4>
        <p class="dev-note">사용자가 기억하는 한 문장: <b>"${esc(C().successCheck().takeaway)}"</b> — "기능이 많다"가 아니다.</p>
        <p>${badge(C().successCheck().ok, 'UX 만족도는 실측 전 공란 유지 — 성공을 시뮬로 선언하지 않는다')}</p></div>`;
  }

  /* ---------- 심사 (Decision Framework 실연) ---------- */
  const PROPOSALS = {
    sticker: { label: '스티커 꾸미기 도구', answers: { needed: true, simpler: true, ai: false, auto: false, hide: false, existing: true, existingVia: '템플릿 요소 라이브러리' } },
    handwrite: { label: '손글씨 → 글자 인식', answers: { needed: true, simpler: true, ai: true, auto: false, hide: false } },
    backup: { label: '수동 백업 버튼', answers: { needed: true, simpler: true, ai: false, auto: true, hide: false } },
    batch: { label: '대량 내보내기(교사용)', answers: { needed: true, simpler: false, ai: false, auto: false, hide: true } },
    trend: { label: '유행 따라 만든 3D 배지', answers: { needed: false, simpler: false, ai: false, auto: false, hide: false } },
    incomplete: { label: '5질문 미답 제안', answers: { needed: true } },
  };
  function Jud() {
    const j = st.jr;
    return `
      <div class="mk-card"><h4>Decision Framework (§15) — 6단계 순차 심사</h4>
        <div class="dev-pipe">${C().FRAMEWORK_STEPS.map((s) => `<span class="dev-pipe-node on">${s.n}. ${esc(s.q)}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">먼저 걸리는 단계에서 심사가 끝난다 — 6단(제작)은 마지막 수단이다.</p>
        <div class="dls-row" style="flex-wrap:wrap">${Object.entries(PROPOSALS).map(([k, p]) => `<button class="mk-btn sm ${st.prop === k ? 'primary' : ''}" data-ct-prop="${k}">${esc(p.label)}</button>`).join('')}</div>
        ${j ? `
        <div class="mk-card" style="margin-top:10px"><h4>심사 경로 — ${esc(PROPOSALS[st.prop].label)}</h4>
          <div class="dls-lm">${j.trail.map((t) => `<div class="dls-lm-row"><span><b>${t.n}단</b> ${esc(t.q)}</span><span>${chip(t.answer ? '예' : '아니오', t.answer ? 'warning' : 'info')}</span></div>`).join('')}</div>
          <p>${chip(VD_KO[j.verdict] || j.verdict, VD_BD[j.verdict])} <span class="dev-note">${esc(j.reason)}${j.via ? ' — ' + esc(j.via) : ''}</span></p></div>` : '<p class="dev-note">제안을 눌러 심사 경로를 확인</p>'}</div>
      <div class="mk-card"><h4>Delete First (§16) — 추가 전에 삭제부터</h4>
        <div class="dls-row">
          <button class="mk-btn sm" data-ct-del="blind">삭제 탐색 없이 추가</button>
          <button class="mk-btn sm" data-ct-del="searched">탐색 완료·삭제 2 ≥ 추가 1</button>
        </div>
        ${st.del ? `<p>${badge(st.del.ok, st.del.ok ? '승인' : '기각')} <span class="dev-note">${esc(st.del.reason)}</span></p>` : ''}</div>
      <div class="mk-card"><h4>Release Rule (§17) — 기능 수보다 완성도</h4>
        <div class="dls-row">
          <button class="mk-btn sm" data-ct-rel="rush">회귀 없이 릴리스</button>
          <button class="mk-btn sm" data-ct-rel="full">테스트·회귀·정직 보고</button>
        </div>
        ${st.rel ? `<div class="dls-lm">${st.rel.checks.map((c) => `<div class="dls-lm-row"><span>${esc(c.label)}</span>${badge(c.ok, c.ok ? '충족' : '미달')}</div>`).join('')}</div><p>${badge(st.rel.ok, st.rel.ok ? '릴리스 가능' : '릴리스 불가')}</p>` : ''}</div>`;
  }

  /* ---------- 최고규범 ---------- */
  const SUPS = {
    hot: { label: '매력도 100 — 스티커 상점(초보자 메뉴 추가)', f: { appeal: 100, addsBeginnerMenu: true, answers: { needed: true, simpler: false, ai: false, auto: false, hide: false } } },
    panel: { label: '매력도 95 — AI 상시 도우미 패널', f: { appeal: 95, fixedAiPanel: true } },
    rank: { label: '매력도 90 — 반 친구 순위표', f: { appeal: 90, socialComparison: true } },
    clean: { label: '매력도 40 — 손글씨 인식(충돌 0)', f: { appeal: 40, answers: { needed: true, simpler: true, ai: true, auto: false, hide: false } } },
  };
  function Sup() {
    const r = st.sup;
    return `
      <div class="mk-card"><h4>Final Principle (§19) — 최고규범</h4>
        <p class="dev-note">이 원칙과 충돌하는 기능은 <b>아무리 좋아 보여도</b> 채택하지 않는다. 매력도는 심사에 어떤 영향도 주지 못한다.</p>
        <div class="dls-row" style="flex-wrap:wrap">${Object.entries(SUPS).map(([k, s]) => `<button class="mk-btn sm" data-ct-sup="${k}">${esc(s.label)}</button>`).join('')}</div>
        ${r ? `
        <div class="mk-card" style="margin-top:10px">
          <p>${chip(VD_KO[r.verdict] || r.verdict, VD_BD[r.verdict] || 'info')} <span class="dev-note">${esc(r.reason)}</span></p>
          ${r.conflicts && r.conflicts.length ? `<div class="dls-lm">${r.conflicts.map((c) => `<div class="dls-lm-row"><span>${chip('충돌', 'danger')} <b>${esc(c.article)}</b></span><span class="dev-note">${esc(c.why)}</span></div>`).join('')}</div>` : ''}
          ${r.appealIgnored ? `<p>${badge(true, '매력도 무시됨 — 헌법이 이겼다')}</p>` : ''}</div>` : '<p class="dev-note">기능을 눌러 최고규범 심사를 확인</p>'}</div>
      <div class="mk-card"><h4>효력 (§21)</h4>
        <p class="dev-note">앞으로 <b>${C().HORIZON.years}년</b> — ${esc(C().HORIZON.standard)}. K-MAKER는 기능이 가장 많은 제품이 아니라, 가장 배우기 쉽고 가장 오래 사랑받는 창작 플랫폼이 되어야 한다.</p></div>`;
  }

  /* ---------- 체크리스트 ---------- */
  function Chk() {
    const cl = C().reviewChecklist();
    return `
      <div class="mk-card"><h4>Review Checklist — 신규 제안 심사용 · 현재 제품 라이브 판정</h4>
        <div class="dls-lm">${cl.map((c) => `<div class="dls-lm-row"><span><b>${esc(c.label)}</b></span>${badge(c.pass, c.pass ? '통과' : '실패')}</div>`).join('')}</div>
        <p>${badge(cl.every((c) => c.pass), cl.filter((c) => c.pass).length + '/' + cl.length + ' 통과')}</p></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const d = C().deliverables();
    return `
      <div class="mk-card"><h4>Deliverables 8종 (§20)</h4>
        <div class="dls-lm">${d.map((x) => `<div class="dls-lm-row"><span>${esc(x.name)}</span>${badge(x.ready, x.ready ? 'ready' : 'missing')}</div>`).join('')}</div></div>
      <div class="mk-card"><h4>완료 조건 (§21)</h4>
        <p class="dev-note">기능이 많은 제품이 아니라 "정말 쉽다"는 말을 듣는 제품. 이 라운드는 기능을 추가하지 않았다 — 앞으로 기능을 거를 체를 만들었다.</p>
        <p>${badge(C().complete(), C().complete() ? 'complete() = true' : '미달')}</p></div>`;
  }

  const BODY = { over: Over, rules: Rules, simp: Simp, phil: Phil, jud: Jud, sup: Sup, chk: Chk, out: Out };

  function render() {
    return `
      <div class="dev-tabs">${TABS.map(([k, n]) => `<button class="dev-tab ${st.tab === k ? 'on' : ''}" data-ct-tab="${k}">${n}</button>`).join('')}</div>
      <div data-ct-body>${BODY[st.tab]()}</div>`;
  }

  function mount(root) {
    const RR = () => { root.innerHTML = render(); wire(root); };
    function wire(r) {
      r.querySelectorAll('[data-ct-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.ctTab; RR(); });
      r.querySelectorAll('[data-ct-prop]').forEach((b) => b.onclick = () => { st.prop = b.dataset.ctProp; st.jr = C().judge(PROPOSALS[st.prop]); RR(); });
      r.querySelectorAll('[data-ct-sup]').forEach((b) => b.onclick = () => { st.sup = C().adopt(SUPS[b.dataset.ctSup].f); RR(); });
      r.querySelectorAll('[data-ct-del]').forEach((b) => b.onclick = () => {
        st.del = C().deleteFirst(b.dataset.ctDel === 'blind' ? { adds: ['새 패널'] } : { adds: ['새 패널'], deletionSearched: true, removes: ['고정 툴바', '기능 투어 팝업'] }); RR(); });
      r.querySelectorAll('[data-ct-rel]').forEach((b) => b.onclick = () => {
        st.rel = C().releaseGate(b.dataset.ctRel === 'rush' ? { tests: true, regression: false, honest: false } : { tests: true, regression: true, honest: true }); RR(); });
    }
    wire(root);
  }

  return { title: 'Constitution — 최상위 규범', variants: ['v1'], render, mount };
})();
