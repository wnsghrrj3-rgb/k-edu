/* ============================================================
   화면: Ruthless Audit — 100 → 10  (Round 30)
   ------------------------------------------------------------
   개요/전수 100/판정·삭제/10경험/메뉴·이름/레벨/테스트/산출물 8탭.
   전 버튼 실함수 — "이미 있으니까 유지"가 실제로 거부되고,
   6질문 미답 등재가 실제로 막히고, 레벨을 올리면 UI가 실제로
   넓어지는 것을 화면에서 실연한다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.audit = (() => {
  const T = () => window.MK_TEN, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', lv: 1, tryOut: null, badSpec: false };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const chip = (t, cls) => `<span class="mk-badge ${cls || ''}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const V_KO = { keep: '유지', hide: '숨김', delete: '삭제', ai: 'AI 위임', auto: '자동 실행' };
  const V_BD = { keep: 'success', hide: 'warning', delete: 'danger', ai: 'info', auto: 'info' };

  const TABS = [['over', '개요'], ['inv', '전수 100'], ['del', '판정·삭제'], ['exp', '10경험'],
                ['menu', '메뉴·이름'], ['lv', '레벨'], ['test', '테스트'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const t = T(), inv = t.inventoryAudit(), dr = t.deleteReport(), ba = t.beforeAfter();
    return `
      <div class="adm-stats">
        ${Stat('전수 등재', inv.total + '개', inv.ok ? '누락 0 — 라이브 검증' : '누락 ' + inv.missing.length)}
        ${Stat('경험', t.EXPERIENCES.length + '개', '100 → 10')}
        ${Stat('삭제', dr.count + '개', Math.round(dr.share * 100) + '% (목표 ≥30%)')}
        ${Stat('완료 조건', t.complete() ? '충족' : '미달', '§20')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0)</h4>
        <p class="dev-note">${esc(t.PHILOSOPHY.cause)}</p>
        <p class="dev-note">${esc(t.PHILOSOPHY.user)}</p>
        <p class="dev-note"><b>${esc(t.PHILOSOPHY.goal)}</b></p></div>
      <div class="mk-card"><h4>Before / After</h4>
        <div class="dls-lm">
          <div class="dls-lm-row"><span>내비 메뉴</span><span><b>${ba.menus.before}</b> → <b>${ba.menus.after}</b></span></div>
          <div class="dls-lm-row"><span>첫날 보이는 기능</span><span><b>${ba.visibleDay1.before}</b> → <b>${ba.visibleDay1.after}</b></span></div>
          <div class="dls-lm-row"><span>사용자 결정</span><span><b>${ba.decisions.before}</b> → <b>${ba.decisions.after}</b></span></div>
          <div class="dls-lm-row"><span>삭제 · 숨김 · 통합</span><span>${ba.deleted} · ${ba.hidden} · ${ba.merged}그룹</span></div>
        </div></div>
      <div class="mk-card"><h4>Zero-based 규칙 (§1) — 실거부 실연</h4>
        <p class="dev-note">"이미 있으니까 유지"는 등재 사유가 될 수 없다. 6질문 미답도 등재 자체가 불가.</p>
        <button class="mk-btn" data-au-try="legacy">"이미 있으니까 유지"로 등재 시도</button>
        <button class="mk-btn" data-au-try="six">6질문 3개만 답하고 등재 시도</button>
        ${st.tryOut ? `<p>${badge(false, st.tryOut)}</p>` : ''}</div>`;
  }

  /* ---------- 전수 100 ---------- */
  function Inv() {
    const t = T(), inv = t.inventoryAudit();
    const src = { menu: '화면', cmd: '명령', ctx: '문맥', cap: '엔진' };
    const bySrc = {}; t.FEATURES.forEach((f) => { bySrc[f.src] = (bySrc[f.src] || 0) + 1; });
    return `
      <div class="adm-stats">${Object.entries(bySrc).map(([k, n]) => Stat(src[k] || k, n + '개')).join('')}</div>
      <div class="mk-card"><h4>전 기능 전수 목록 — 6질문 답과 유도된 평결</h4>
        <p>${badge(inv.ok, inv.ok ? '라이브 엔진(MENU·CMDS·CTX) 대비 누락 0 · 총 ' + inv.total : '누락: ' + inv.missing.join(','))}</p>
        <div class="dls-lm" style="max-height:420px;overflow:auto">${t.FEATURES.map((f) => `
          <div class="dls-lm-row"><span>${chip(V_KO[f.verdict], V_BD[f.verdict])} <b>${esc(f.label)}</b> <small class="dev-note">${esc(f.id)}</small></span>
          <span class="dev-note">${esc(f.a.freq)}${f.a.beginner ? ' · 초보자' : ''}${f.exp ? ' → ' + esc(f.exp) : ''}</span></div>`).join('')}
        </div></div>`;
  }

  /* ---------- 판정·삭제 ---------- */
  function Del() {
    const t = T(), dr = t.deleteReport(), hr = t.hideReport(), mr = t.mergeReport();
    const counts = ['keep', 'hide', 'delete', 'ai', 'auto'].map((v) => ({ v, n: t.byVerdict(v).length }));
    return `
      <div class="adm-stats">${counts.map((c) => Stat(V_KO[c.v], c.n + '개')).join('')}</div>
      <div class="mk-card"><h4>Delete Report (§8) — ${dr.count}개 · ${Math.round(dr.share * 100)}%</h4>
        <p>${badge(dr.ok, '목표 ≥30% ' + (dr.ok ? '달성' : '미달') + ' · 전건 사유 문서화')} <small class="dev-note">${esc(dr.note)}</small></p>
        <div class="dls-lm" style="max-height:260px;overflow:auto">${dr.rows.map((r) => `<div class="dls-lm-row"><span><b>${esc(r.label)}</b></span><span class="dev-note">${esc(r.reason)}</span></div>`).join('')}</div></div>
      <div class="mk-card"><h4>Hide Report (§9) — ${hr.count}개</h4>
        <p class="dev-note">기본 UI에서 제거 — 팔레트·숙련 노출로만 도달(전문가 테스트에서 검증)</p></div>
      <div class="mk-card"><h4>Merge Report (§10) — ${mr.groups.length}그룹</h4>
        <div class="dls-lm">${mr.groups.map((g) => `<div class="dls-lm-row"><span><b>${esc(g.into)}</b> ← ${g.from.map((x) => esc(x)).join(', ')}</span><span class="dev-note">${esc(g.saves)}</span></div>`).join('')}</div>
        <p>${badge(mr.ok, mr.ok ? '참조 무결 — 전 항목 인벤토리 실존' : '깨진 참조: ' + mr.badRef.join(','))}</p></div>`;
  }

  /* ---------- 10경험 ---------- */
  function Exp() {
    const t = T(), ea = t.experienceAudit(), iaData = t.ia();
    return `
      <div class="mk-card"><h4>정보 구조 — 뿌리는 질문 하나</h4>
        <p class="dev-note" style="font-size:1.05em"><b>${esc(iaData.root)}</b></p>
        <div class="dls-lm">${iaData.branches.map((b) => `<div class="dls-lm-row"><span>${chip(b.menu ? '메뉴' : '숨김·문맥', b.menu ? 'success' : 'warning')} <b>${esc(b.label)}</b></span><span class="dev-note">기능 ${b.features}개 귀속</span></div>`).join('')}</div>
        <p>${badge(ea.ok, ea.ok ? '경험 10개 · 빈 경험 0 · 생존 기능 전부 정확히 1개 경험에 귀속' : '빈 경험: ' + ea.empty.join(','))}</p></div>
      <div class="mk-card"><h4>사용자 여정 (§19)</h4>
        <div class="dls-lm">${t.journey().steps.map((s) => `<div class="dls-lm-row"><span><b>${esc(s.at)}</b></span><span>${esc(s.do)}</span></div>`).join('')}</div></div>`;
  }

  /* ---------- 메뉴·이름 ---------- */
  function Menu() {
    const t = T(), da = t.dietAudit(), na = t.nameAudit(), ga = t.gazeAudit(), ha = t.homeAudit();
    return `
      <div class="adm-stats">
        ${Stat('현행 내비', da.current + '개')}${Stat('허용(절반)', '≤' + da.allowed)}${Stat('새 메뉴', da.next + '개', da.ok ? '통과' : '초과')}</div>
      <div class="mk-card"><h4>새 메뉴 구조 (§3) — 5초 안에 전체 이해</h4>
        <div class="dls-lm">${da.menu.map((m) => `<div class="dls-lm-row"><span><b>${esc(m.label)}</b></span><span class="dev-note">${esc(m.id)}</span></div>`).join('')}</div>
        <p>${badge(da.ok, da.fiveSecRule)}</p></div>
      <div class="mk-card"><h4>Job-Based Naming (§5·§11) — 기능 언어 → 목적 언어</h4>
        <div class="dls-lm">${Object.entries(t.RENAMES).map(([k, v]) => `<div class="dls-lm-row"><span>❌ ${esc(k)}</span><span>⭕ <b>${esc(v)}</b></span></div>`).join('')}</div>
        <p>${badge(na.ok, na.ok ? '새 표면에 금지 용어 0' : '위반: ' + na.hits.map((h) => h.text + '(' + h.banned + ')').join(', '))}</p></div>
      <div class="mk-card"><h4>시선 흐름 (§12) + 홈 (§4)</h4>
        <div class="dls-lm">${Object.entries(t.GAZE).map(([k, g]) => `<div class="dls-lm-row"><span><b>${esc(k)}</b></span><span class="dev-note">1번 시선 = ${esc(g.first)} → ${g.order.map(esc).join(' → ')}</span></div>`).join('')}</div>
        <p>${badge(ga.ok, ga.rule)} ${badge(ha.ok, '홈 = 질문 하나 · 메뉴 0')}</p></div>`;
  }

  /* ---------- 레벨 ---------- */
  function Lv() {
    const t = T(), ma = t.masteryAudit(), ui = t.uiFor(st.lv);
    return `
      <div class="mk-card"><h4>Progressive Mastery (§6) — 5레벨</h4>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">${t.LEVELS.map((L) => `<button class="mk-btn ${st.lv === L.n ? 'primary' : ''}" data-au-lv="${L.n}">L${L.n} ${esc(L.label)}</button>`).join('')}</div>
        <div class="adm-stats">${Stat('현재 레벨', 'L' + ui.level.n, ui.level.label)}${Stat('열린 경험', ui.experiences.length + '/10')}${Stat('보이는 기능', ui.features.length + '개')}</div>
        <div class="dls-lm">${ui.experiences.map((e) => { const x = t.EXPERIENCES.find((q) => q.id === e); return `<div class="dls-lm-row"><span><b>${esc(x.label)}</b></span><span class="dev-note">${esc(e)}</span></div>`; }).join('')}</div>
        <p>${badge(ma.ok, '단조 확장 · L1 노출 ' + ma.l1Count + '개(≤10) · 편집 9999회도 L5 자동 승격 없음(옵트인만)')}</p></div>
      <div class="mk-card"><h4>AI 용해 (§7) — AI는 메뉴가 아니다</h4>
        ${(() => { const a = t.aiAudit(); return `<p>${badge(!a.menuHasAI, '새 메뉴에 AI 단독 항목 없음')} ${badge(a.ctxAI, '글·사진·장면 문맥마다 AI 실존')} ${badge(a.homeAI, '홈 1번 시선 = AI 입력')} ${badge(a.companionTriggered, '동반자 = 트리거 기반(상시 패널 아님)')}</p>`; })()}</div>`;
  }

  /* ---------- 테스트 ---------- */
  function Test() {
    const t = T();
    const fs5 = st.badSpec ? t.fiveSecTest({ question: '시작할까요?', items: ['ai-make'], menuCount: 12, primary: null }) : t.fiveSecTest();
    const fm = t.fiveMinTest(), ex = t.expertTest(), dc = t.decisionAudit(), sp = t.spaceAudit(), ck = t.clickAudit();
    return `
      <div class="mk-card"><h4>First Impression — 5초 3질문 (§16)</h4>
        <button class="mk-btn" data-au-bad>${st.badSpec ? '정상 스펙으로' : '불량 스펙(메뉴 12개)으로 실패 실연'}</button>
        <div class="dls-lm">
          <div class="dls-lm-row"><span>무슨 프로그램인가?</span><span>${fs5.answers && fs5.answers.what ? esc(fs5.answers.what) : badge(false, '답 불가')}</span></div>
          <div class="dls-lm-row"><span>무엇을 만들 수 있는가?</span><span>${fs5.answers && fs5.answers.canMake ? esc(fs5.answers.canMake) : badge(false, '답 불가')}</span></div>
          <div class="dls-lm-row"><span>어디부터 시작하는가?</span><span>${fs5.answers && fs5.answers.start ? esc(fs5.answers.start) : badge(false, '답 불가')}</span></div></div>
        <p>${badge(fs5.ok, fs5.ok ? '5초 테스트 통과' : '실패 — 첫 화면이 답하지 못한다')}</p></div>
      <div class="mk-card"><h4>Five-Minute Test (§17) · Expert Test (§18)</h4>
        <p>${badge(fm.ok, '설명 0 · 가입 0 · 첫 결과물 ' + fm.actualSec + 's / 300s — ' + fm.note)}</p>
        <p>${badge(ex.ok, '팔레트 도달 ' + ex.paletteReach + ' · 전 명령 단축키 ' + ex.shortcuts + ' · 옵트인 시 내비 확장')}</p></div>
      <div class="mk-card"><h4>결정 (§13) · 여백 (§14) · 클릭 (§15)</h4>
        <p>${badge(dc.ok, '사용자 결정 ' + dc.before + ' → ' + dc.after)} ${badge(sp.ok, '여백 예산 준수 · "빈 공간 채우기" 추가는 리뷰가 거부')} ${badge(ck.ok, '전 명령 ≤3클릭')}</p></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const t = T(), ds = t.deliverables();
    return `
      <div class="mk-card"><h4>Deliverables 8종 (§19)</h4>
        <div class="dls-lm">${ds.map((d) => `<div class="dls-lm-row"><span>${badge(d.ready, d.ready ? 'ready' : '미달')} <b>${esc(d.name)}</b></span><span class="dev-note">${esc(d.id)}</span></div>`).join('')}</div>
        <p>${badge(t.complete(), t.complete() ? '완료 조건(§20) 충족 — "너무 쉽다" + "이런 기능도 있었네?"' : '완료 조건 미달')}</p></div>
      <div class="mk-card"><h4>완료 조건 (§20)</h4>
        <p class="dev-note">처음 보는 사람은 "너무 쉽다" — 질문 하나·5초 3답·5분 첫 결과물·메뉴 절반 이하.</p>
        <p class="dev-note">6개월 사용자는 "이런 기능도 있었네?" — 레벨마다 경험이 열리고, 숨긴 것은 팔레트로 전부 도달.</p>
        <p class="dev-note">K-MAKER는 배우는 프로그램이 아니라 자연스럽게 익숙해지는 프로그램이다.</p></div>`;
  }

  const BODY = { over: Over, inv: Inv, del: Del, exp: Exp, menu: Menu, lv: Lv, test: Test, out: Out };

  function render() {
    return `
      <div class="dev-tabs">${TABS.map(([k, n]) => `<button class="dev-tab ${st.tab === k ? 'on' : ''}" data-au-tab="${k}">${n}</button>`).join('')}</div>
      <div class="dev-body">${BODY[st.tab]()}</div>`;
  }
  function mount(root) {
    root.querySelectorAll('[data-au-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.auTab; window.PG.render(); });
    root.querySelectorAll('[data-au-lv]').forEach((b) => b.onclick = () => { st.lv = Number(b.dataset.auLv); window.PG.render(); });
    root.querySelectorAll('[data-au-try]').forEach((b) => b.onclick = () => {
      const t = T();
      const r = b.dataset.auTry === 'legacy'
        ? t.take('demo-legacy-' + Date.now(), { label: '데모', src: 'cap', exp: 'edit', reason: '이미 있으니까 유지', a: { freq: 'rare', beginner: false, ai: false, auto: false, hide: true, del: false } })
        : t.take('demo-six-' + Date.now(), { label: '데모', src: 'cap', exp: 'edit', a: { freq: 'rare', beginner: false, ai: false } });
      st.tryOut = r.ok ? '통과(오류!)' : '등재 거부 — ' + r.reason + (r.missing ? ' [' + r.missing.join(',') + ']' : '');
      window.PG.render();
    });
    const bad = root.querySelector('[data-au-bad]'); if (bad) bad.onclick = () => { st.badSpec = !st.badSpec; window.PG.render(); };
  }

  return { title: 'Ruthless Audit — 100 → 10', variants: ['Audit'], render, mount };
})();
