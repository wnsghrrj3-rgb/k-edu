/* ============================================================
   화면: Home Experience — 5초의 법칙 (Round 31)
   ------------------------------------------------------------
   개요/질문·Hero/Quick Start/시선 흐름/제거 감사/반응형/지표/산출물 8탭.
   전 버튼 실함수 — 질문 2개 스펙이 실제로 거부되고, 7칩 스펙이
   실제로 막히고, 역전 시선이 실제로 판정되고, 실화면(Home v2)이
   실DOM 재판정으로 전 감사를 통과하는 것을 화면에서 실연한다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.homex = (() => {
  const H = () => window.MK_HOMEX, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', out: null, out2: null, bp: 'desktop', meas: null, mlog: null };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const row = (l, r) => `<div class="dls-lm-row"><span>${l}</span><span>${r}</span></div>`;
  const vio = (a) => a.ok ? badge(true, '위반 0') : a.violations.map((v) => badge(false, v)).join(' ');

  const TABS = [['over', '개요'], ['q', '질문·Hero'], ['qs', 'Quick Start'], ['flow', '시선 흐름'],
                ['rm', '제거 감사'], ['rs', '반응형'], ['mt', '지표'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const h = H(), a = h.realHomeAudit(), t30 = h.first30();
    return `
      <div class="adm-stats">
        ${Stat('실화면 감사', a.ok ? '9/9 통과' : '위반 ' + a.violations.length, '실DOM 판정')}
        ${Stat('질문', a.parts.question.ok ? '정확히 1' : '위반', esc(a.parts.question.question || ''))}
        ${Stat('첫 30초', t30.ok ? t30.total + 's' : '실패', '가입 단계 ' + t30.authSteps)}
        ${Stat('완료 조건', h.complete() ? '충족' : '미달', '§16')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0·§1)</h4>
        <p class="dev-note">${esc(h.PHILOSOPHY.role)}</p>
        <p class="dev-note">${esc(h.PHILOSOPHY.purpose)}</p>
        <p class="dev-note"><b>${esc(h.PHILOSOPHY.stage)}</b></p></div>
      <div class="mk-card"><h4>실화면 재판정 — 스펙이 아니라 실제 Home v2 마크업</h4>
        <p class="dev-note">아래 버튼은 MK_SCREENS.home.render() 를 지금 다시 그려 9개 감사를 실행한다.</p>
        <button class="mk-btn" data-hx-real>실화면 9감사 재실행</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Before / After</h4>${(() => { const b = H().beforeAfter(); return `
        <div class="dls-lm">
          ${row('화면의 질문', `<b>${b.before.questions}</b> → <b>${b.after.questions}</b>`)}
          ${row('노출 메뉴', `<b>${b.before.menuExposed}</b> → <b>${b.after.menuExposed}</b>`)}
          ${row('초점', `${esc(b.before.focus)} → <b>${esc(b.after.focus)}</b>`)}
          ${row('첫 행동', `${esc(b.before.firstAction)} → <b>${esc(b.after.firstAction)}</b>`)}
        </div>`; })()}</div>`;
  }

  /* ---------- 질문 · Hero ---------- */
  function Q() {
    const h = H(), qa = h.questionAudit(), ha = h.heroAudit();
    return `
      <div class="mk-card"><h4>질문 감사 (§2) — 정확히 하나, "무엇을 만들…?" 계열</h4>
        <p>${badge(qa.ok, qa.ok ? '통과 — 「' + qa.question + '」' : qa.violations.join(' · '))}</p>
        <p class="dev-note">허용 계열: ${esc(String(h.Q_FAMILY))}</p>
        <button class="mk-btn" data-hx-badq>질문 2개 스펙 판정 시도</button>
        <button class="mk-btn" data-hx-offq>계열 밖 질문("기능을 살펴보세요") 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Hero 감사 (§3) — 가장 큰 영역 = AI 입력</h4>
        <p>${vio(ha)}</p>
        <div class="dls-lm">
          ${row('main 첫 섹션', 'hero')}${row('질문 → 입력', '순서 강제')}
          ${row('placeholder', '「예: …」 실례 문장')}${row('제출', '만들기 버튼 1')}
        </div></div>
      <div class="mk-card"><h4>AI 중심 (§7) — AI는 메뉴가 아니라 Home 자체</h4>
        <p>${vio(H().aiAudit())}</p>
        <p class="dev-note">homeSpec.primary = ai-make · 홈 표면 AI 단독 메뉴 0 · 목적을 말하는 form 실존</p></div>`;
  }

  /* ---------- Quick Start ---------- */
  function QS() {
    const h = H(), a = h.quickStartAudit();
    return `
      <div class="adm-stats">${Stat('칩', a.count + '개', h.QS_MIN + '~' + h.QS_MAX + ' 허용')}${Stat('기능어', '0', 'Job-Based 이름만')}</div>
      <div class="mk-card"><h4>Quick Start 감사 (§4) — 4~6개, 그 이상은 금지</h4>
        <p>${vio(a)}</p>
        <p>${a.labels.map((l) => `<span class="mk-badge">${esc(l)}</span>`).join(' ')}</p>
        <button class="mk-btn" data-hx-qs7>7개 스펙 판정 시도</button>
        <button class="mk-btn" data-hx-qs3>3개 스펙 판정 시도</button>
        <button class="mk-btn" data-hx-qsban>기능어(Export) 포함 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Recent (§5) · Template (§6)</h4>
        <p>${vio(H().recentAudit())} ${vio(H().templateAudit())}</p>
        <p class="dev-note">최근은 hero 뒤·h1 없음·≤5장. 추천은 ≤6 + "더 보기" 통로 — 첫 화면을 점령하지 않는다.</p></div>`;
  }

  /* ---------- 시선 흐름 ---------- */
  function Flow() {
    const h = H(), a = h.eyeFlowAudit();
    return `
      <div class="mk-card"><h4>시선 흐름 (§8) — 실DOM 순서 강제</h4>
        <p style="font-size:15px">${h.EYE_ORDER.map((k) => `<b>${esc(k)}</b>`).join(' ↓ ')} ↓ <b>reco</b></p>
        <p>${vio(a)}</p>
        <button class="mk-btn" data-hx-rev>역전 순서(recent 먼저) 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Visual Hierarchy (§13) — 실측 주입 판정</h4>
        <p class="dev-note">면적은 추정하지 않는다 — 실측 rect(px²)를 주입해야만 판정한다. 미실측 = 판정 거부.</p>
        <button class="mk-btn" data-hx-meas>정상 실측 주입 (hero 38% > qs > recent)</button>
        <button class="mk-btn" data-hx-measbad>역전 실측 주입 (recent 최대)</button>
        <button class="mk-btn" data-hx-measno>실측 없이 판정 시도</button>
        ${st.meas ? `<p>${st.meas}</p>` : ''}</div>
      <div class="mk-card"><h4>Emotion (§12)</h4>
        <p>${vio(H().emotionAudit())}</p>
        <p class="dev-note">기대감 신호 ≥2(예시 placeholder·계절 추천·초대 문장) · 기능 나열 0.</p></div>`;
  }

  /* ---------- 제거 감사 ---------- */
  function Rm() {
    const h = H(), a = h.removalAudit();
    return `
      <div class="mk-card"><h4>제거 대상 (§9) — 실마크업에서 0</h4>
        <p>${vio(a)} <span class="mk-badge">카드 ${a.cards} / 예산 ${h.CARD_BUDGET}</span></p>
        <div class="dls-lm">
          ${h.REMOVE_BANNED.map((b) => row(b.id, '금지 — ' + esc(String(b.re)))).join('')}
        </div>
        <button class="mk-btn" data-hx-ban>배너 포함 불량 홈 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>첫 30초 (§10) · First Success (§11)</h4>${(() => { const t = h.first30(), f = h.firstSuccess(); return `
        <p>${badge(t.ok, '30초: ' + t.total + 's · 가입 0 · 실생성 ' + (t.built ? '✓' : '✗'))}
           ${badge(f.ok, '5분: ' + f.total + 's / 300s = ' + f.share)}</p>
        <p class="dev-note">MK_AI.buildDoc 실호출 — 결과물이 실제로 생겨야 통과(MK_SIMPLE 브리지).</p>`; })()}</div>`;
  }

  /* ---------- 반응형 ---------- */
  function Rs() {
    const h = H(), s = h.responsiveSpec(st.bp);
    const rs = h.responsiveAudit(window.__H2CSS || '');
    return `
      <div class="mk-card"><h4>반응형 (산출물 4~6) — 실CSS 미디어쿼리 감사</h4>
        <p>${window.__H2CSS ? vio(rs) : '<span class="mk-badge warning">CSS 텍스트 미주입 — 테스트 하네스에서 실파일 주입 판정</span>'}</p>
        <p>${h.BREAKPOINTS.map((b) => `<button class="mk-btn ${st.bp === b.id ? '' : 'ghost'}" data-hx-bp="${b.id}">${b.id}${b.max ? ' ≤' + b.max : ''}</button>`).join(' ')}</p>
        <div class="dls-lm">
          ${row('시선 순서', s.order.join(' → ') + ' (전 bp 동일)')}
          ${row('질문', s.question + '개')}
          ${row('Quick Start', s.quickstart.min + '~' + s.quickstart.max)}
          ${row('레이아웃', esc(s.note))}
        </div></div>`;
  }

  /* ---------- 지표 ---------- */
  function Mt() {
    const h = H();
    return `
      <div class="mk-card"><h4>Home Metrics 5종 (§14) — record() 유일 경로, 미실측 = null</h4>
        <div class="dls-lm">
          ${h.METRICS.map((m) => { const r = h.read(m); return row(esc(h.M_LABEL[m]), r.measured ? '<b>' + r.value + '</b> (n=' + r.n + ')' : '<span class="mk-badge warning">미실측 — 숫자를 만들지 않는다</span>'); }).join('')}
        </div>
        <button class="mk-btn" data-hx-rec>ttfp 실측 3건 record</button>
        <button class="mk-btn" data-hx-recbad>미지 지표(nps) record 시도</button>
        ${st.mlog ? `<p>${st.mlog}</p>` : ''}</div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const h = H(), d = h.deliverables(), rp = h.uxReport();
    return `
      <div class="adm-stats">${Stat('Deliverables', d.filter((x) => x.ready).length + '/' + d.length, '§15')}${Stat('UX 보고서', rp.ok ? '위반 0' : '위반 ' + rp.violations.length, '감사 ' + rp.audited + '종')}${Stat('완료 조건', h.complete() ? '충족' : '미달', '§16')}</div>
      <div class="mk-card"><h4>Deliverables 8종</h4>
        <div class="dls-lm">${d.map((x) => row(esc(x.name), badge(x.ready, x.ready ? 'ready' : '미완'))).join('')}</div></div>
      <div class="mk-card"><h4>완료 조건 (§16)</h4>
        <p class="dev-note">처음 보는 사람도 3초 안에 "어디서 시작하는지" — 질문 하나·주 행동 ai-make·실DOM 9감사 위반 0.</p>
        <p class="dev-note">Home 은 기능 목록이 아니라 <b>창작을 시작하는 무대</b> — complete() 하나로 판정된다.</p>
        <p>${badge(h.complete(), h.complete() ? 'complete() = true' : '미달')}</p></div>`;
  }

  const BODY = { over: Over, q: Q, qs: QS, flow: Flow, rm: Rm, rs: Rs, mt: Mt, out: Out };

  return {
    title: 'Home Experience', variants: ['R31'],
    render() {
      return `<div class="adm">
        <div class="adm-tabs">${TABS.map(([k, n]) => `<button class="adm-tab ${st.tab === k ? 'on' : ''}" data-hx-tab="${k}">${n}</button>`).join('')}</div>
        <div class="adm-body">${BODY[st.tab]()}</div></div>`;
    },
    mount(root) {
      const rr = () => { root.innerHTML = this.render(); this.mount(root); };
      root.querySelectorAll('[data-hx-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.hxTab; st.out = null; rr(); });
      const H1 = H();
      const on = (sel, fn) => { const b = root.querySelector(sel); if (b) b.onclick = () => { fn(); rr(); }; };
      on('[data-hx-real]', () => { const a = H1.realHomeAudit(); st.out = a.ok ? badge(true, '실화면 9감사 전부 통과 — 위반 0') : vio(a); });
      on('[data-hx-badq]', () => { const a = H1.questionSpecAudit({ questions: ['무엇을 만들까요?', '어떤 기능이 필요하세요?'] }); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-offq]', () => { const a = H1.questionSpecAudit({ questions: ['기능을 살펴보세요'] }); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-qs7]', () => { const a = H1.quickStartSpecAudit(['발표', '포스터', '영상', 'SNS', '문서', '보드', '카드']); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-qs3]', () => { const a = H1.quickStartSpecAudit(['발표', '포스터', '영상']); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-qsban]', () => { const a = H1.quickStartSpecAudit(['발표', '포스터', 'Export', '문서']); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-rev]', () => { const a = H1.eyeFlowSpecAudit(['recent', 'question', 'input', 'quickstart']); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-ban]', () => { const div = document.createElement('div'); div.innerHTML = '<main><section class="h2-hero"><h1 class="h2-q">무엇을 만들까요?</h1></section><div>🎉 이벤트 안내 — 프리미엄 업그레이드 배너</div></main>'; const a = H1.removalAudit(div); st.out = badge(false, '거부: ' + a.violations.join(' · ')); });
      on('[data-hx-meas]', () => { const j = H1.hierarchyJudge({ viewport: 1440 * 900, hero: 1440 * 900 * 0.38, quickstart: 1440 * 60, recent: 1120 * 40 }); st.meas = badge(j.ok, j.ok ? '통과 — hero ' + Math.round(j.heroShare * 100) + '%' : j.violations.join(' · ')); });
      on('[data-hx-measbad]', () => { const j = H1.hierarchyJudge({ viewport: 1440 * 900, hero: 1440 * 90, quickstart: 1440 * 60, recent: 1440 * 500 }); st.meas = badge(false, '거부: ' + j.violations.join(' · ')); });
      on('[data-hx-measno]', () => { const j = H1.hierarchyJudge(null); st.meas = badge(false, '거부: ' + j.reason + ' — 숫자를 만들지 않는다'); });
      on('[data-hx-rec]', () => { [42, 55, 38].forEach((v) => H1.record('ttfp', v)); st.mlog = badge(true, 'ttfp 3건 기록 — 평균 ' + H1.read('ttfp').value + 's'); });
      on('[data-hx-recbad]', () => { const r = H1.record('nps', 50); st.mlog = badge(false, '거부: ' + r.reason); });
      root.querySelectorAll('[data-hx-bp]').forEach((b) => b.onclick = () => { st.bp = b.dataset.hxBp; rr(); });
    },
  };
})();
