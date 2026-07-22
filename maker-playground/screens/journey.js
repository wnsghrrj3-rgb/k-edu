/* ============================================================
   화면: User Journey — Job First Design (Round 33)
   ------------------------------------------------------------
   개요/여정 지도/Pain·AI/Quick Win·성공/Micro·이탈/감정·최적화/
   기기·지표/산출물 8탭. 전 버튼 실함수 — 메뉴 전이 스펙이 실제로
   거부되고, "AI 상시 등장" 스펙이 실제로 기각되고, walk() 가 실제로
   화면을 7단계 이동시키고, 검토 AI 가 실생성 문서를 실제로 점검한다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.journey = (() => {
  const J = () => window.MK_JOURNEY, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', persona: 'teacher', out: null, walk: null, review: null };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const row = (l, r) => `<div class="dls-lm-row"><span>${l}</span><span>${r}</span></div>`;
  const vio = (a) => a.ok ? badge(true, '위반 0') : a.violations.map((v) => badge(false, v)).join(' ');

  const TABS = [['over', '개요'], ['map', '여정 지도'], ['pain', 'Pain·AI'], ['win', 'Quick Win·성공'],
                ['micro', 'Micro·이탈'], ['emo', '감정·최적화'], ['dev', '기기·지표'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const j = J(), ja = j.journeyAudit(), q = j.quickWin(), mt = j.memoryTest();
    return `
      <div class="adm-stats">
        ${Stat('여정', ja.personas + ' × ' + ja.stages, '= ' + ja.total + '단계 전수')}
        ${Stat('Quick Win', q.ok ? q.sec + 's' : '실패', '예산 ' + q.budget + 's (§6)')}
        ${Stat('메뉴 전이', mt.menuTransitions, '0 이어야 한다 (§16)')}
        ${Stat('완료 조건', j.complete() ? '충족' : '미달', '§16')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0)</h4>
        <p class="dev-note">${esc(j.PHILOSOPHY.role)}</p>
        <p class="dev-note">${esc(j.PHILOSOPHY.rule)}</p>
        <p class="dev-note"><b>${esc(j.PHILOSOPHY.design)}</b></p></div>
      <div class="mk-card"><h4>대표 사용자 → 대표 작업 (§1·§2)</h4>
        <div class="dls-lm">${j.PERSONAS.map((p) => row(esc(p.name), '<b>' + esc(p.job) + '</b> · 첫 성공: ' + esc(p.firstSuccess.moment))).join('')}</div></div>
      <div class="mk-card"><h4>완료 조건 (§16)</h4>
        <p>${badge(mt.ok, mt.ok ? '사용자는 메뉴를 기억하지 않는다' : '미달')}</p>
        <p class="dev-note">기억하는 것: ${esc(mt.remembers)}</p></div>`;
  }

  /* ---------- 여정 지도 ---------- */
  function Map_() {
    const j = J(), ja = j.journeyAudit(), p = j.personaOf(st.persona), jr = j.journeyOf(st.persona);
    return `
      <div class="mk-card"><h4>7단계 (§3) — 전 단계 실라우트 · 메뉴 전이 0</h4>
        <p>${vio(ja)}</p>
        <p>${j.PERSONAS.map((x) => `<button class="mk-btn ${x.id === st.persona ? 'primary' : ''}" data-jr-p="${x.id}">${esc(x.name)}</button>`).join(' ')}</p></div>
      <div class="mk-card"><h4>${esc(p.name)} — ${esc(p.job)}</h4>
        <div class="dls-lm">${jr.map((s) => row(
          `<b>${esc(s.name)}</b> <small>${esc(s.trigger)}</small>`,
          `${esc(s.act)} <small>→ #/${esc(s.route)} · ${s.clicks}클릭 · ${s.decisions}결정</small>`)).join('')}</div></div>
      <div class="mk-card"><h4>실이동 · 불량 스펙 실거부</h4>
        <button class="mk-btn" data-jr-walk>walk('${esc(st.persona)}') — 7단계 실이동</button>
        <button class="mk-btn" data-jr-menu>메뉴 전이 스펙 판정 시도</button>
        <button class="mk-btn" data-jr-order>단계 누락 스펙 판정 시도</button>
        ${st.walk ? `<p>${st.walk}</p>` : ''}${st.out ? `<p>${st.out}</p>` : ''}</div>`;
  }

  /* ---------- Pain·AI ---------- */
  function Pain() {
    const j = J(), pa = j.painAudit(), aa = j.aiAudit();
    const qn = { hard: '어렵다', decide: '고민한다', tedious: '귀찮다' };
    return `
      <div class="adm-stats">${j.PAIN_Q.map((q) => Stat(qn[q], pa.byQ[q])).join('')}${Stat('AI 순간', aa.moments + '/' + aa.stages, '항상 아님 (§5)')}</div>
      <div class="mk-card"><h4>Pain Point (§4) — ${pa.total}단계 전수 · 미답 스펙 거부</h4>
        <p>${vio(pa)}</p>
        <button class="mk-btn" data-jr-pain>해소 없는 Pain 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}
        <div class="dls-lm">${pa.rows.slice(0, 10).map((r) => row(esc(r.persona + ' · ' + r.stage), `${esc(qn[r.q])} — ${esc(r.fix)} <small>${esc(r.by)}</small>`)).join('')}
        ${row('…', '외 ' + (pa.rows.length - 10) + '개')}</div></div>
      <div class="mk-card"><h4>AI 개입 시점 (§5) — 3순간만</h4>
        <p>${vio(aa)}</p>
        <div class="dls-lm">${j.AI_MOMENTS.map((m) => row(esc(m.at), esc(m.does))).join('')}</div>
        <button class="mk-btn" data-jr-always>AI 상시 등장 스펙 판정 시도</button>
        <button class="mk-btn" data-jr-review>검토 AI 실행 — 실생성 문서 점검</button>
        ${st.review ? `<p>${st.review}</p>` : ''}</div>`;
  }

  /* ---------- Quick Win·성공 ---------- */
  function Win() {
    const j = J(), q = j.quickWin(), sa = j.successAudit();
    return `
      <div class="mk-card"><h4>Quick Win (§6) — 30초 안에 "오, 쉽네."</h4>
        <p>${badge(q.ok, q.ok ? q.sec + 's / ' + q.budget + 's · 실생성 ' + q.scenes + '장 · 가입 0' : '실패')}</p>
        <div class="dls-lm">${(q.steps || []).map((s) => row(esc(s.label || s.id || ''), (s.sec || 0) + 's')).join('')}</div>
        <p class="dev-note">${esc(q.moment || '')}</p></div>
      <div class="mk-card"><h4>Success Moment (§7) — 첫 Export · 첫 발표 · 첫 공유</h4>
        <p>${vio(sa)}</p>
        <div class="dls-lm">${j.PERSONAS.map((p) => row(esc(p.name), `<b>${esc(p.firstSuccess.moment)}</b> <small>${esc(p.firstSuccess.kind)} · #/${esc(p.firstSuccess.route)}</small>`)).join('')}</div></div>`;
  }

  /* ---------- Micro·이탈 ---------- */
  function Micro() {
    const j = J(), ma = j.microAudit(), da = j.dropAudit();
    return `
      <div class="mk-card"><h4>Micro Journey (§8) — 클릭→피드백→완료→다음 추천</h4>
        <p>${vio(ma)}</p>
        <div class="dls-lm">${j.MICRO.map((m) => row(esc(m.btn), `${esc(m.feedback)} → ${esc(m.done)} → <b>${esc(m.next)}</b>`)).join('')}</div>
        <button class="mk-btn" data-jr-micro>다음 추천 없는 버튼 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Drop-off (§9) — 5지점 해소 실측</h4>
        <p>${badge(da.ok, da.ok ? '5/5 해소 실측 통과' : '미해소 ' + da.open.join(','))}</p>
        <div class="dls-lm">${da.rows.map((r) => row(esc(r.where), `${esc(r.why)} → ${esc(r.fix)} ${badge(r.gone, r.gone ? '해소' : '잔존')}`)).join('')}</div></div>`;
  }

  /* ---------- 감정·최적화 ---------- */
  function Emo() {
    const j = J(), ea = j.emotionAudit(), oa = j.optimizeAudit(), ha = j.hiddenAudit();
    return `
      <div class="mk-card"><h4>Emotional Journey (§11)</h4>
        <p>${vio(ea)}</p>
        <div class="dls-lm">${j.EMOTION_ARC.map((e) => row(`<b>${esc(e.emotion)}</b>`, `${e.stages.map((s) => esc(j.STAGE_NAMES[s])).join('·')} — ${esc(e.device)}`)).join('')}</div></div>
      <div class="mk-card"><h4>Hidden Complexity (§10) — 설정 0 · 결정 ≤${ha.cap}</h4>
        <p>${vio(ha)}</p>
        <button class="mk-btn" data-jr-hidden>설정 단계 낀 여정 스펙 판정 시도</button>
        <button class="mk-btn" data-jr-dec3>결정 3 여정 스펙 판정 시도</button>
        ${st.out ? `<p>${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>Optimization (§12) — 클릭 ≤${j.CLICK_BUDGET} · 결정 ≤2 · 설정 0</h4>
        <p>${vio(oa)}</p>
        <div class="dls-lm">${oa.rows.map((r) => row(esc(r.persona), `${r.clicks}클릭 · ${r.decisions}결정 · ${r.settings}설정 · ${r.sec}s`)).join('')}</div></div>`;
  }

  /* ---------- 기기·지표 ---------- */
  function Dev() {
    const j = J(), da = j.deviceAudit(), mts = j.metrics();
    return `
      <div class="mk-card"><h4>Cross Device (§13) — PC → 태블릿 → 모바일 · 같은 프로젝트</h4>
        <p>${badge(da.ok, da.ok ? '한 흐름 · 연속성 통과' : '미달')}</p>
        <div class="dls-lm">${da.walk.hops.map((h) => row(esc(h.dev), `${esc(h.act)} <small>${esc(h.docId)}</small> ${badge(h.live, h.live ? '라이브' : '실패')}`)).join('')}</div></div>
      <div class="mk-card"><h4>Journey Metrics (§14) — record() 유일 경로 · 미실측 = null</h4>
        <div class="dls-lm">${mts.map((m) => row(esc(m.key), m.measured ? '<b>' + m.value + '</b>' : '<small>null (미실측)</small>')).join('')}</div>
        <p class="dev-note">실사용 텔레메트리 연결 전까지 시뮬 값 주입 금지 — 정직 원칙.</p></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const j = J(), d = j.deliverables(), a = j.deliverablesAudit();
    return `
      <div class="mk-card"><h4>Deliverables (§15) — 8종</h4>
        <p>${badge(a.ok, a.ok ? '8/8 실존' : '미비 ' + a.open.join(','))}</p>
        <div class="dls-lm">${d.map((x) => row(esc(x.name), badge(x.ready, x.ready ? '준비' : '미비'))).join('')}</div></div>
      <div class="mk-card"><h4>판정 한 줄</h4>
        <p>${badge(j.complete(), j.complete() ? 'complete() — 모든 화면은 Journey 를 위해 존재한다' : '미달')}</p></div>`;
  }

  const BODY = { over: Over, map: Map_, pain: Pain, win: Win, micro: Micro, emo: Emo, dev: Dev, out: Out };

  function render() {
    return `
      <div class="mk-tabs">${TABS.map(([id, l]) => `<button class="mk-tab ${st.tab === id ? 'active' : ''}" data-jr-tab="${id}">${esc(l)}</button>`).join('')}</div>
      <div class="mk-tab-body">${BODY[st.tab]()}</div>`;
  }

  function mount(root) {
    const rerender = () => { root.innerHTML = render(); mount(root); };
    root.querySelectorAll('[data-jr-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.jrTab; st.out = null; st.walk = null; st.review = null; rerender(); });
    root.querySelectorAll('[data-jr-p]').forEach((b) => b.onclick = () => { st.persona = b.dataset.jrP; st.walk = null; rerender(); });
    const on = (sel, fn) => { const b = root.querySelector(sel); if (b) b.onclick = () => { fn(window.MK_JOURNEY); rerender(); }; };
    const rej = (r) => { st.out = `<span class="mk-badge danger">거부 — ${esc(r.reason)}</span>`; };
    on('[data-jr-menu]', (j) => rej(j.journeySpecAudit({ stages: j.STAGES.map((s) => ({ stage: s, trigger: s === 'edit' ? 'menu' : 'action' })) })));
    on('[data-jr-order]', (j) => rej(j.journeySpecAudit({ stages: [{ stage: 'start', trigger: 'action' }, { stage: 'edit', trigger: 'action' }] })));
    on('[data-jr-walk]', (j) => {
      const w = j.walk(st.persona);
      st.walk = w.ok ? `<span class="mk-badge success">실이동 ${w.visited.length}단계 — 종착 홈(다음 프로젝트)</span>`
                     : `<span class="mk-badge danger">이동 실패</span>`;
      window.PG.go('journey');                                   /* 검수 화면으로 복귀 */
    });
    on('[data-jr-pain]', (j) => rej(j.painSpecAudit({ q: 'hard', what: '어렵다' })));
    on('[data-jr-always]', (j) => rej(j.aiSpecAudit({ always: true })));
    on('[data-jr-review]', (j) => {
      const r = j.reviewRun();
      st.review = r.ok ? `<span class="mk-badge ${r.clean ? 'success' : 'danger'}">실생성 ${r.scenes}장 점검 — ${r.clean ? '깨끗함' : '고칠 곳 ' + r.findings.length}</span>`
                       : `<span class="mk-badge danger">생성 실패</span>`;
    });
    on('[data-jr-micro]', (j) => rej(j.microSpecAudit({ click: '클릭', feedback: '반짝', done: '완료' })));
    on('[data-jr-hidden]', (j) => rej(j.hiddenSpecAudit({ stages: [{ settings: true }] })));
    on('[data-jr-dec3]', (j) => rej(j.hiddenSpecAudit({ stages: [{ decisions: 2 }, { decisions: 1 }] })));
  }

  return { title: 'User Journey — Job First Design', variants: ['R33'], render, mount };
})();
