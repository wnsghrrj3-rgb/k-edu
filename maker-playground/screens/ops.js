/* ============================================================
   화면: Ops — K-MAKER Product Operating System  (Round 26)
   ------------------------------------------------------------
   개요/라이프사이클/지표/리뷰·게이트/릴리즈·실험/인시던트/피드백·CS/거버넌스 8탭.
   전 버튼 실함수 — MK_OPS 판정을 실제 실행해 "근거 없는 결정·게이트
   우회·포스트모템 없는 종결이 불가능하다" 를 화면으로 실연.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.ops = (() => {
  const O = () => window.MK_OPS, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', msg: null, decTitle: '', decBasis: 'data', decEv: '', mFg: 'export_count', mVal: '60', out: null, expUser: 't01' };
  const say = (ok, t) => { st.msg = { ok, text: String(t) }; };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const jf = (o) => `<pre class="dev-json">${esc(JSON.stringify(o, null, 1))}</pre>`;
  const pipe = (arr, cur) => `<div class="dev-pipe">${arr.map((s) => `<span class="dev-pipe-node${s === cur ? ' on' : ''}">${esc(s)}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>`;

  const TABS = [['over', '개요'], ['cycle', '라이프사이클'], ['metric', '지표·대시보드'], ['review', '리뷰·게이트'], ['ship', '릴리즈·실험'], ['inc', '인시던트'], ['voice', '피드백·CS'], ['gov', '거버넌스']];

  /* ---------- 개요 ---------- */
  function Over() {
    const del = O().deliverables(), db = O().dashboard();
    return `
      <div class="adm-stats">
        ${Stat('산출물', del.filter((d) => d.ready).length + '/8', '§20')}
        ${Stat('품질 게이트', db.gates.results.filter((r) => r.ok).length + '/6', '§17')}
        ${Stat('열린 인시던트', db.incidents.open, 'SLA 위반 ' + db.incidents.breached)}
        ${Stat('완료 조건', O().complete() ? '충족' : '미달', '§21')}
      </div>
      <div class="mk-card"><h4>핵심 목표 (§0)</h4>
        <p class="dev-note">좋은 제품을 만드는 것이 아니라 — <b>계속 좋아지는 제품</b>을 만든다.</p>
        <p class="dev-note">모든 의사결정 근거: ${O().BASIS.map((b) => `<code>${b}</code>`).join(' · ')} — 근거 없는 결정은 decide() 가 거부한다.</p></div>
      <div class="mk-card"><h4>결정 등록기 — 거부 실연</h4>
        <div class="dls-row">
          <input class="mk-input" data-ops-dt placeholder="결정 제목" value="${esc(st.decTitle)}" style="width:200px">
          <select class="mk-input" data-ops-db style="width:130px">${['data', 'user', 'philosophy', '감(느낌)'].map((b) => `<option ${st.decBasis === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
          <input class="mk-input" data-ops-de placeholder="근거(evidence)" value="${esc(st.decEv)}" style="width:220px">
          <button class="mk-btn primary sm" data-ops-decide>등록</button>
        </div>
        ${st.msg ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} <span class="dev-note">${esc(st.msg.text)}</span></p>` : ''}
        <p class="dev-note">Decision Log ${O().decisionLog().length}건 — 채택된 결정은 KB(§15) decision 분류로 자동 유입.</p></div>
      <div class="mk-card"><h4>산출물 (§20)</h4>
        <div class="dls-lm">${del.map((d) => `<div class="dls-lm-row"><span>${esc(d.name)}</span>${badge(d.ready, d.ready ? 'ready' : 'missing')}</div>`).join('')}</div></div>`;
  }

  /* ---------- 라이프사이클 ---------- */
  function Cycle() {
    const p = O().productState();
    const feats = O().FEATURES;
    return `
      <div class="mk-card"><h4>Product Lifecycle (§1) — ${p.laps}바퀴째</h4>
        ${pipe(O().PRODUCT_CYCLE, p.stage)}
        <button class="mk-btn sm" data-ops-cyc>다음 단계로</button>
        <span class="dev-note">improve → idea 로 되감기며 laps 증가 — Repeat 이 구조.</span></div>
      <div class="mk-card"><h4>Feature Lifecycle (§2·§3) — 게이트 실연</h4>
        <table class="mk-table"><thead><tr><th>기능</th><th>상태</th><th>리뷰</th><th>동작</th></tr></thead><tbody>
        ${feats.slice(0, 8).map((f) => `<tr><td>${esc(f.name)}</td><td><code>${f.state}</code></td><td>${badge(!!(f.review && f.review.ok), f.review ? f.review.metric : '없음')}</td>
          <td><button class="mk-btn sm" data-ops-fdev="${f.id}">→development</button> <button class="mk-btn sm" data-ops-frel="${f.id}">→release</button></td></tr>`).join('')}
        </tbody></table>
        ${st.out ? jf(st.out) : ''}
        <p class="dev-note">리뷰 4문항(왜·누가·문제·지표) 없이 development 불가 / 게이트 6종 실패 시 release 불가 — 우회 경로 없음.</p></div>`;
  }

  /* ---------- 지표·대시보드 ---------- */
  function Metric() {
    const db = O().dashboard();
    const grp = (g, name) => `
      <div class="mk-card"><h4>${name}</h4><table class="mk-table"><thead><tr><th>지표</th><th>최근값</th><th>포인트</th></tr></thead><tbody>
        ${db.metrics[g].map((m) => `<tr><td>${esc(m.name)}</td><td><b>${m.latest == null ? '<span class="dev-note">미실측</span>' : esc(m.latest + ' ' + m.unit)}</b></td><td>${m.points}</td></tr>`).join('')}
      </tbody></table></div>`;
    return `
      <div class="adm-stats">
        ${Stat('DAU/MAU', db.users.stickiness == null ? '—' : db.users.stickiness + '%', 'Stickiness')}
        ${Stat('North Star', O().latest('export_count') == null ? '미실측' : O().latest('export_count'), '주간 Export')}
        ${Stat('미분류 피드백', db.feedback.untriaged, '/' + db.feedback.total)}
      </div>
      <div class="mk-card"><h4>기록기 — record() 단일 경로</h4>
        <div class="dls-row">
          <select class="mk-input" data-ops-mid style="width:200px">${Object.values(O().METRICS).map((m) => `<option value="${m.id}" ${st.mFg === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}</select>
          <input class="mk-input" data-ops-mv value="${esc(st.mVal)}" style="width:90px">
          <button class="mk-btn primary sm" data-ops-mrec>기록</button>
          <button class="mk-btn sm" data-ops-mbr>UX 브리지(MK_FLOW)</button>
        </div>
        ${st.msg ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} <span class="dev-note">${esc(st.msg.text)}</span></p>` : ''}
        <p class="dev-note">미실측 지표는 대시보드에 "미실측" 으로 정직 표기 — 숫자를 만들지 않는다(Bible §14 규약).</p></div>
      ${grp('product', 'Product Metrics (§4)')}${grp('ux', 'UX Metrics (§5)')}${grp('ai', 'AI Metrics (§6)')}`;
  }

  /* ---------- 리뷰·게이트 ---------- */
  function Review() {
    const g = O().gatesAll();
    const dr = O().designReview({ spacings: [16, 24], durations: [180, 220], contrastPairs: [['#3A3F8F', '#FFFFFF']], maxClicks: 3, renderMs: 40 });
    const drBad = O().designReview({ spacings: [14], durations: [300], contrastPairs: [['#AAAAAA', '#FFFFFF']], maxClicks: 5, renderMs: 200 });
    const er = O().engineeringReview({ singleEntry: true, hotPathMs: 9, authPath: 'rls', testedScale: 100000, targetScale: 100000, tests: 116, honestyNote: '실텔레메트리 미연결' });
    return `
      <div class="mk-card"><h4>Quality Gates (§17) — 릴리즈·기능 전이의 관문</h4>
        <table class="mk-table"><thead><tr><th>게이트</th><th>판정</th><th>근거</th></tr></thead><tbody>
        ${g.results.map((r) => `<tr><td><code>${r.name}</code></td><td>${badge(r.ok, r.ok ? 'PASS' : 'FAIL')}</td><td class="dev-note">${esc(r.note)}</td></tr>`).join('')}
        </tbody></table></div>
      <div class="mk-card"><h4>Design Review (§7) — K-DLS·Flow·A11y·Perf 실판정</h4>
        <p>정합 시안 ${badge(dr.ok, dr.ok ? '전축 통과' : '실패')} <span class="dev-note">간격 16·24 / 모션 180·220 / 대비 인디고 / 3클릭 / 40ms</span></p>
        <p>위반 시안 ${badge(drBad.ok, drBad.ok ? '통과' : '거부')} <span class="dev-note">14px off-grid·300ms 밴드 밖·회색 대비 미달·5클릭 — 축별 자동 검출</span></p>
        ${jf(drBad.axes)}</div>
      <div class="mk-card"><h4>Engineering Review (§8) — 5축</h4>${jf(er)}</div>`;
  }

  /* ---------- 릴리즈·실험 ---------- */
  function Ship() {
    const rel = O().RELEASES[0];
    const er = O().expResult('home_hero');
    return `
      <div class="mk-card"><h4>Release Process (§9) — ${esc(rel ? rel.ver : '')}</h4>
        ${pipe(O().RELEASE_STAGES, rel ? rel.stage : null)}
        <button class="mk-btn primary sm" data-ops-radv>단계 졸업 시도</button>
        ${st.msg ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '차단')} <span class="dev-note">${esc(st.msg.text)}</span></p>` : ''}
        <p class="dev-note">졸업마다 게이트 6종 재판정 + 열린 P1 = 0 조건. "일정 밀려서 그냥 진행" 은 코드가 차단.</p></div>
      <div class="mk-card"><h4>Experiment (§12) — 결정적 배정·표본 판정</h4>
        <div class="dls-row"><input class="mk-input" data-ops-eu value="${esc(st.expUser)}" style="width:110px">
          <button class="mk-btn sm" data-ops-eassign>배정 확인</button>
          <button class="mk-btn sm" data-ops-esim>60명 시뮬 주입</button></div>
        ${st.out ? jf(st.out) : ''}
        <p class="dev-note">현재: ${er && er.decided === false ? `표본 미달(min ${er.minN}) — 승자 판정 거부` : er ? `판정 ${er.decided ? '승자 ' + er.winner : '동률'}` : '실험 없음'}</p></div>
      <div class="mk-card"><h4>Feature Flag — Rollout·Rollback</h4>
        <div class="dls-row">
          <button class="mk-btn sm" data-ops-f25>new_editor 25%</button>
          <button class="mk-btn sm" data-ops-f100>100%</button>
          <button class="mk-btn danger sm" data-ops-frb>Rollback</button>
        </div>
        <p class="dev-note">${(() => { const f = O().FLAGS.new_editor; if (!f) return '플래그 미설정'; const on = ['t01', 't02', 't03', 't04', 't05', 't06', 't07', 't08'].filter((u) => O().flagFor('new_editor', u)); return `on=${f.on} rollout=${f.rollout}% — 표본 8인 중 ${on.length}인 노출(해시 결정적)`; })()}</p></div>`;
  }

  /* ---------- 인시던트 ---------- */
  function Inc() {
    return `
      <div class="mk-card"><h4>Incident Management (§13)</h4>
        <div class="dls-row"><button class="mk-btn danger sm" data-ops-ip1>P1 발생시키기</button>
          <button class="mk-btn sm" data-ops-iclose>포스트모템 없이 close 시도</button>
          <button class="mk-btn primary sm" data-ops-ipm>포스트모템 첨부 close</button></div>
        ${st.msg ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} <span class="dev-note">${esc(st.msg.text)}</span></p>` : ''}
        <table class="mk-table"><thead><tr><th>제목</th><th>심각도</th><th>상태</th><th>담당</th><th>SLA</th><th>포스트모템</th></tr></thead><tbody>
        ${O().INCIDENTS.map((i) => { const s = O().slaOf(i.id); return `<tr><td>${esc(i.title)}</td><td><code>${i.sev}</code></td><td><code>${i.state}</code></td><td>${esc(i.owner || '—')}</td><td>${badge(!s.breached, s.breached ? '위반' : '내')}</td><td>${i.postmortem ? esc(i.postmortem.action) : '<span class="dev-note">—</span>'}</td></tr>`; }).join('')}
        </tbody></table>
        <p class="dev-note">P1/P2 는 cause+action 포스트모템 없이 종결 불가 — 종결 즉시 KB(§15) 로 자동 축적.</p></div>`;
  }

  /* ---------- 피드백·CS ---------- */
  function Voice() {
    const cov = O().csCoverage();
    return `
      <div class="mk-card"><h4>User Feedback (§10) — 채널 7종·투표·트리아지</h4>
        <table class="mk-table"><thead><tr><th>유형</th><th>내용</th><th>투표</th><th>트리아지</th><th></th></tr></thead><tbody>
        ${O().fbTop(6).map((f) => `<tr><td><code>${f.type}</code></td><td>${esc(f.text)}</td><td><b>${f.votes}</b></td><td>${f.triage ? `<code>${f.triage.to}</code>` : '<span class="dev-note">대기</span>'}</td>
          <td><button class="mk-btn sm" data-ops-fv="${f.id}">+1</button> <button class="mk-btn sm" data-ops-ftr="${f.id}">트리아지</button></td></tr>`).join('')}
        </tbody></table>
        <p class="dev-note">동일 텍스트는 새 항목이 아니라 기존 투표로 병합 — bug 는 인시던트로, 나머지는 기능 idea 로 라우팅.</p></div>
      <div class="mk-card"><h4>Customer Success (§14) — 온보딩 여정</h4>
        ${pipe(O().ONBOARD_STEPS, null)}
        <p class="dev-note">t01: ${O().onboardOf('t01').steps.join(' → ') || '없음'} (${O().onboardOf('t01').done ? '완주' : '진행 중'}) · 문서 커버리지 ${cov.pct}% (${cov.covered}/${cov.total})</p></div>
      <div class="mk-card"><h4>Knowledge Base (§15) — 6분류</h4>
        <p class="dev-note">${O().KB_CATS.map((c) => `${c} ${O().kbByCat(c).length}`).join(' · ')} — decision 분류는 decide()·RFC 채택에서만 자동 유입.</p></div>`;
  }

  /* ---------- 거버넌스 ---------- */
  function Gov() {
    const rank = O().priorityRank([
      { name: 'PDF 한글', reach: 5, impact: 3, confidence: 0.9, effort: 2 },
      { name: '다크 모드', reach: 3, impact: 1, confidence: 0.7, effort: 3 },
      { name: 'Supabase 이식', reach: 5, impact: 3, confidence: 0.8, effort: 5 },
    ]);
    const lp = O().loopState();
    return `
      <div class="mk-card"><h4>Decision Matrix (§19)</h4>
        <table class="mk-table"><thead><tr><th>영역</th><th>결정</th><th>협의</th><th>비고</th></tr></thead><tbody>
        ${O().DECISION_MATRIX.map((d) => `<tr><td><code>${d.area}</code></td><td><b>${esc(d.decides)}</b></td><td>${esc(d.consults)}</td><td class="dev-note">${esc(d.note)}</td></tr>`).join('')}
        </tbody></table></div>
      <div class="mk-card"><h4>Priority Rules — RICE</h4>
        <table class="mk-table"><thead><tr><th>항목</th><th>점수</th></tr></thead><tbody>
        ${rank.map((r) => `<tr><td>${esc(r.name)}</td><td><b>${r.score}</b></td></tr>`).join('')}
        </tbody></table></div>
      <div class="mk-card"><h4>Continuous Improvement (§18) — 순서 강제 루프</h4>
        ${pipe(['measure', 'analyze', 'improve'], lp.open ? (lp.cycle.analysis ? 'improve' : lp.cycle.measured ? 'analyze' : 'measure') : null)}
        <div class="dls-row"><button class="mk-btn sm" data-ops-l1>사이클 시작</button>
          <button class="mk-btn sm" data-ops-l2>측정 없이 분석 시도</button>
          <button class="mk-btn primary sm" data-ops-l3>측정→분석→개선 완주</button></div>
        ${st.msg ? `<p>${badge(st.msg.ok, st.msg.ok ? 'OK' : '거부')} <span class="dev-note">${esc(st.msg.text)}</span></p>` : ''}
        <p class="dev-note">완료 반복 ${lp.iterations}회 — Measure 없는 Analyze, Analyze 없는 Improve 는 거부. 무한 반복이 구조.</p></div>`;
  }

  const BODY = { over: Over, cycle: Cycle, metric: Metric, review: Review, ship: Ship, inc: Inc, voice: Voice, gov: Gov };

  function render() {
    return `
      <div class="adm-wrap">
        <div class="mk-tabs">${TABS.map(([k, n]) => `<button class="mk-tab ${st.tab === k ? 'on' : ''}" data-ops-tab="${k}">${n}</button>`).join('')}</div>
        <div class="adm-body">${BODY[st.tab]()}</div>
      </div>`;
  }

  let ROOT = null;
  function RR() {
    if (!ROOT) return;
    ROOT.innerHTML = render();
    mount(ROOT);
  }

  function mount(root) {
    ROOT = root;
    const q = (s) => root.querySelector(s), qa = (s) => [...root.querySelectorAll(s)];
    qa('[data-ops-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.opsTab; st.msg = null; st.out = null; RR(); });
    const bind = (sel, fn) => { const el = q(sel); if (el) el.onclick = () => { fn(); RR(); }; };
    const val = (sel) => { const el = q(sel); return el ? el.value : ''; };

    /* 개요 */
    bind('[data-ops-decide]', () => {
      st.decTitle = val('[data-ops-dt]'); st.decBasis = val('[data-ops-db]'); st.decEv = val('[data-ops-de]');
      const r = O().decide({ title: st.decTitle, basis: st.decBasis, evidence: st.decEv });
      say(r.ok, r.ok ? `등록 — Decision Log ${O().decisionLog().length}건` : `reason=${r.reason}${r.allowed ? ' (허용: ' + r.allowed.join('/') + ')' : ''}`);
    });
    /* 라이프사이클 */
    bind('[data-ops-cyc]', () => { const r = O().cycleAdvance(); say(true, `${r.from} → ${r.to} (${r.laps}바퀴)`); });
    qa('[data-ops-fdev]').forEach((b) => b.onclick = () => { st.out = O().featureAdvance(b.dataset.opsFdev, 'development'); RR(); });
    qa('[data-ops-frel]').forEach((b) => b.onclick = () => { st.out = O().featureAdvance(b.dataset.opsFrel, 'release'); RR(); });
    /* 지표 */
    bind('[data-ops-mrec]', () => {
      st.mFg = val('[data-ops-mid]'); st.mVal = val('[data-ops-mv]');
      const r = O().record(st.mFg, Number(st.mVal));
      say(r.ok, r.ok ? `기록 — 포인트 ${r.n}` : r.reason);
    });
    bind('[data-ops-mbr]', () => { const r = O().bridgeUx(); say(r.ok, r.ok ? r.source + ' 유입 완료' : r.reason); });
    /* 릴리즈·실험 */
    bind('[data-ops-radv]', () => {
      const rel = O().RELEASES[0]; const r = O().releaseAdvance(rel.ver);
      say(r.ok, r.ok ? `${r.from} → ${r.to}` : `reason=${r.reason}${r.failed ? ' 실패 게이트: ' + r.failed.join(',') : ''}`);
    });
    bind('[data-ops-eassign]', () => { st.expUser = val('[data-ops-eu]'); st.out = { user: st.expUser, variant: O().expAssign('home_hero', st.expUser) }; });
    bind('[data-ops-esim]', () => {
      for (let i = 0; i < 60; i++) { const u = 'sim' + i, v = O().expAssign('home_hero', u); O().expRecord('home_hero', v, (i * 7) % 10 < (v === 'A' ? 6 : 4)); }
      st.out = O().expResult('home_hero');
    });
    bind('[data-ops-f25]', () => { O().flagSet('new_editor', true, 25); say(true, 'rollout 25%'); });
    bind('[data-ops-f100]', () => { O().flagSet('new_editor', true, 100); say(true, 'rollout 100%'); });
    bind('[data-ops-frb]', () => { const r = O().flagRollback('new_editor'); say(r.ok, r.ok ? `복원 — rollout ${r.flag.rollout}%` : r.reason); });
    /* 인시던트 */
    bind('[data-ops-ip1]', () => {
      const r = O().incCreate({ title: 'Export 전면 실패', sev: 'P1' });
      O().incAdvance(r.incident.id, 'triaged', { owner: '베프' });
      say(true, `P1 등록 — 릴리즈 졸업이 즉시 차단됨 (§9 조건)`);
    });
    bind('[data-ops-iclose]', () => {
      const i = O().INCIDENTS.find((x) => x.sev === 'P1' && x.state !== 'closed');
      if (!i) { say(false, '열린 P1 없음 — 먼저 발생시키기'); return; }
      O().incAdvance(i.id, 'fixing'); O().incAdvance(i.id, 'verifying');
      const r = O().incAdvance(i.id, 'closed', { verified: true });
      say(r.ok, r.ok ? '종결' : `거부 — reason=${r.reason} (필요: ${(r.need || []).join('+')})`);
    });
    bind('[data-ops-ipm]', () => {
      const i = O().INCIDENTS.find((x) => x.sev === 'P1' && x.state === 'verifying');
      if (!i) { say(false, 'verifying 상태 P1 없음'); return; }
      const r = O().incAdvance(i.id, 'closed', { verified: true, postmortem: { cause: '렌더 어댑터 계약 위반', action: '어댑터 등록 시 계약 검사 추가' } });
      say(r.ok, r.ok ? '포스트모템 축적 후 종결 — KB 자동 유입' : r.reason);
    });
    /* 피드백 */
    qa('[data-ops-fv]').forEach((b) => b.onclick = () => { O().fbVote(b.dataset.opsFv); RR(); });
    qa('[data-ops-ftr]').forEach((b) => b.onclick = () => { const r = O().fbTriage(b.dataset.opsFtr); st.msg = { ok: r.ok, text: r.ok ? `→ ${r.triage.to}` : r.reason }; RR(); });
    /* 루프 */
    bind('[data-ops-l1]', () => { const r = O().loopStart(); say(r.ok, r.ok ? '사이클 열림 — Measure 부터' : r.reason); });
    bind('[data-ops-l2]', () => { const r = O().loopAnalyze('임의 분석'); say(r.ok, r.ok ? '분석' : `거부 — reason=${r.reason}`); });
    bind('[data-ops-l3]', () => {
      if (!O().loopState().open) O().loopStart();
      O().record('export_count', (O().latest('export_count') || 0) + 3);
      O().loopAnalyze('Export 증가 — 템플릿 진입 경로가 유효');
      const r = O().loopImprove('큐레이션 상단 고정 유지');
      say(r.ok, r.ok ? `완주 — 반복 ${r.iterations}회` : r.reason);
    });
  }

  return { title: 'Ops — Product Operating System', variants: ['A'], render, mount };
})();
