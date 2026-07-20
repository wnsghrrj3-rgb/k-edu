/* ============================================================
   화면: Agent — AI Agent Studio  (Round 22)
   ------------------------------------------------------------
   개요/스튜디오/에이전트/타임라인/리뷰/작업/팔레트/인스펙터 8탭.
   전 버튼 실함수 — MK_AGENT 오케스트레이터를 실제 실행하고
   Job·설명·전후 diff 를 그대로 표시한다. LLM 미연결(규칙 엔진).
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.agent = (() => {
  const AG = () => window.MK_AGENT, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = {
    tab: 'over', msg: null,
    doc: null, prompt: '회사 소개서 「금성초 이야기」 만들어줘',
    voiceIn: '레이아웃 정리해줘', palQ: '', selJobs: [],
    preview: null, lastRec: null, lastPlan: null, cmp: null,
  };
  const say = (ok, t) => { st.msg = { ok, text: String(t) }; };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const jf = (o) => esc(JSON.stringify(o, null, 1));

  const ensure = () => {
    if (!st.doc) {
      const tpl = window.MK_SAMPLE.TEMPLATES[0];
      st.doc = { title: tpl.title, scenes: JSON.parse(JSON.stringify(tpl.scenes)) };
      /* 브랜드는 건드리지 않는다 — 활성 브랜드가 있으면 쓰고, 없으면 없는 대로(Agent 는 graceful) */
      AG().bind(st.doc);
    }
  };
  const run = (prompt, opts) => {
    ensure();
    const r = AG().request(st.doc, prompt, { previewShown: true, ...(opts || {}) });
    say(r.ok, (r.msg || '') + (r.needsConfirm ? ' (확인 필요)' : ''));
    if (r.rec) st.lastRec = r.rec;
    if (r.plan) st.lastPlan = r.plan;
    return r;
  };

  /* ---------- 개요 ---------- */
  function Over() {
    ensure();
    const s = AG().state(), und = AG().understand(st.doc);
    return `
      <div class="adm-stats">
        ${Stat('Agents', s.agents, '독립 동작')}${Stat('Job 기록', s.jobs, '설명 포함')}
        ${Stat('예약 작업', s.scheduled)}${Stat('검사 점수', AG().review(st.doc).score, '6종 검사')}
      </div>
      <div class="mk-card"><h4>원칙 — Canvas 를 이해하는 AI</h4>
        <div class="dev-pipe">${['이해', '계획', '디자인', '수정', '협업'].map((x) => `<span class="dev-pipe-node">${x}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">챗봇이 아니라 디지털 팀원 — 모든 변경은 Job 을 통과하고, 왜 그렇게 했는지 항상 설명한다.</p></div>
      <div class="mk-card"><h4>Project Understanding (§4) — 현재 doc 자동 분석</h4>
        <table class="adm-tbl"><tr><th>목적</th><th>대상</th><th>스타일</th><th>레이아웃</th><th>톤</th><th>씬/요소</th></tr>
        <tr><td>${esc(und.purpose)}</td><td>${esc(und.audience)}</td><td>${esc(und.style)}</td><td>${esc(und.layout)}</td><td><code>${esc(und.tone)}</code></td><td>${und.stats.scenes} / ${und.stats.elements}</td></tr></table></div>
      <div class="mk-card"><h4>Workspace Memory (§3)</h4><pre class="dev-pre">${jf(AG().mem())}</pre></div>`;
  }

  /* ---------- 스튜디오 (대화·플래닝·제안) ---------- */
  function Studio() {
    ensure();
    const c = AG().convo('pg');
    const sugg = AG().suggestions(st.doc);
    return `
      <div class="mk-card"><h4>요청 (§1 Orchestrator · §5 Planning · §14 대화 기억)</h4>
        <div class="dev-row"><input class="mk-input" style="flex:1" data-ag-prompt value="${esc(st.prompt)}" placeholder='예: 피치덱 만들어줘 / 그거 검사해줘'>
        <button class="mk-btn primary" data-ag-run>실행</button>
        <button class="mk-btn" data-ag-preview>Preview</button></div>
        ${st.preview ? `<pre class="dev-pre">Preview — 변경 ${st.preview.wouldChange}곳\n${jf(st.preview.diff)}${st.preview.plan ? '\n목차: ' + st.preview.plan.outline.map((o) => o.name).join(' → ') : ''}</pre>` : ''}
      </div>
      ${st.lastPlan ? `<div class="mk-card"><h4>Design Plan — ${esc(st.lastPlan.kind)} 「${esc(st.lastPlan.title)}」</h4>
        <div class="dev-pipe">${st.lastPlan.outline.map((o) => `<span class="dev-pipe-node">${esc(o.name)}</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p class="dev-note">${esc(st.lastPlan.layoutNote)} · 팔레트 <code>${esc(st.lastPlan.palette)}</code></p></div>` : ''}
      <div class="mk-card"><h4>AI Suggestions (§16) — 실시간 추천</h4>
        ${sugg.length ? sugg.map((s, i) => `<div class="dev-row"><span style="flex:1">"${esc(s.msg)}"</span><button class="mk-btn sm" data-ag-fix="${esc(s.fix)}">적용</button></div>`).join('') : '<p class="dev-note">지금은 추천할 게 없어요 — 문서가 깨끗합니다.</p>'}
      </div>
      <div class="mk-card"><h4>대화 기록 — 매번 처음부터 설명하지 않는다</h4>
        <div class="dev-log">${c.msgs.slice(-8).reverse().map((m2) => `<div class="msg"><b>${m2.role === 'user' ? '준호' : 'AI'}</b> <span>${esc(m2.text)}</span></div>`).join('') || '<p class="dev-note">아직 대화가 없어요.</p>'}</div></div>
      <div class="mk-card"><h4>현재 doc — ${esc(st.doc.title)} · ${st.doc.scenes.length}장</h4>
        <div class="ag-scenes">${st.doc.scenes.map((s, i) => `<span class="dev-pipe-node" title="${esc(s.name)}">${i + 1}. ${esc(s.name)}</span>`).join(' ')}</div></div>`;
  }

  /* ---------- 에이전트 ---------- */
  function Agents() {
    ensure();
    const DEMO = { planner: '보고서 만들어줘', designer: '레이아웃 정리해줘', writer: '오탈자 교정해줘',
      translator: '영어로 번역해줘', illustrator: '이미지 추천해줘', presenter: '순서 정리해줘',
      animator: '애니메이션 넣어줘', developer: '검사해줘', reviewer: '검사해줘', publisher: 'SNS 버전 만들어줘' };
    return `
      <div class="mk-card"><h4>Multi Agent System (§2) — 각 Agent 는 독립 동작</h4>
        <table class="adm-tbl"><tr><th></th><th>Agent</th><th>역할</th><th>대표 실행</th><th></th></tr>
        ${AG().AGENTS.map((a) => `<tr><td>${a.icon}</td><td><b>${esc(a.name)}</b></td><td>${esc(a.desc)}</td><td><code>${esc(DEMO[a.id])}</code></td>
          <td><button class="mk-btn sm" data-ag-agent="${a.id}">invoke</button></td></tr>`).join('')}</table>
        <p class="dev-note">§24 AI API — 위 버튼은 Plugin 과 동일한 <code>MK_AGENT.invoke(agentId, doc, prompt)</code> 공개 경로를 부른다.</p></div>
      ${st.lastRec ? `<div class="mk-card"><h4>Asset Agent 추천 (§9)</h4>
        <table class="adm-tbl"><tr><th>이름</th><th>종류</th><th>태그</th><th>즐겨찾기</th></tr>
        ${st.lastRec.map((a) => `<tr><td>${esc(a.name)}</td><td>${esc(a.type)}</td><td>${(a.tags || []).map(esc).join(' · ')}</td>
          <td><button class="mk-btn sm" data-ag-fav="${a.id}">★</button></td></tr>`).join('')}</table></div>` : ''}`;
  }

  /* ---------- 타임라인 ---------- */
  function Timeline() {
    ensure();
    const js = AG().jobs().slice().reverse();
    return `
      <div class="mk-card"><h4>AI Timeline (§15·§20·§21)</h4>
        <div class="dev-row"><button class="mk-btn" data-ag-undo>← Undo</button><button class="mk-btn" data-ag-redo>Redo →</button>
        ${st.selJobs.length === 2 ? `<button class="mk-btn primary" data-ag-cmp>선택 2건 Compare</button>` : `<span class="dev-note">행 2개를 선택하면 Compare</span>`}</div>
        ${st.cmp ? `<pre class="dev-pre">Compare\n${jf(st.cmp)}</pre>` : ''}
        <table class="adm-tbl"><tr><th></th><th>Agent</th><th>의도</th><th>요청</th><th>설명(§20)</th><th>상태</th><th></th></tr>
        ${js.map((j) => `<tr>
          <td><input type="checkbox" data-ag-sel="${j.id}" ${st.selJobs.includes(j.id) ? 'checked' : ''}></td>
          <td>${esc(j.agent)}</td><td><code>${esc(j.intent)}</code></td><td>${esc((j.prompt || '').slice(0, 18))}</td>
          <td class="ag-explain">${esc(j.explain)}</td><td>${badge(j.status === 'done', j.status)}</td>
          <td><button class="mk-btn sm" data-ag-restore="${j.id}">Restore</button>
              <button class="mk-btn sm danger" data-ag-rollback="${j.id}">Rollback</button></td></tr>`).join('') || '<tr><td colspan="7">아직 Job 이 없어요 — 스튜디오에서 실행해 보세요.</td></tr>'}</table></div>`;
  }

  /* ---------- 리뷰 ---------- */
  function Review() {
    ensure();
    const r = AG().review(st.doc), bc = AG().brandCheck(st.doc);
    return `
      <div class="adm-stats">${Stat('점수', r.score, '/100')}${Stat('오류', r.issues.filter((i) => i.level === 'error').length)}${Stat('경고', r.issues.filter((i) => i.level === 'warn').length)}${Stat('브랜드', bc.ok ? 'OK' : bc.issues.length + '건')}</div>
      <div class="mk-card"><h4>Review Agent (§12) — 6종 자동 검사</h4>
        <div class="dev-row"><button class="mk-btn primary" data-ag-fix="오탈자 교정해줘">오탈자 일괄 교정</button>
          <button class="mk-btn" data-ag-fix="레이아웃 정리해줘">레이아웃 정리</button>
          <button class="mk-btn" data-ag-fix="브랜드 정렬해줘">브랜드 정렬</button></div>
        <table class="adm-tbl"><tr><th>씬</th><th>분류</th><th>수준</th><th>내용</th></tr>
        ${r.issues.map((i) => `<tr><td>${i.scene}</td><td>${esc(i.cat)}</td><td>${badge(i.level !== 'error', i.level)}</td><td>${esc(i.msg)}</td></tr>`).join('') || '<tr><td colspan="4">이슈 없음 — 깨끗합니다.</td></tr>'}</table></div>
      <div class="mk-card"><h4>Collaboration Agent (§13) — 변경 요약·충돌 시뮬</h4>
        <div class="dev-row"><button class="mk-btn" data-ag-collab>팀원 편집 시뮬레이션 → 요약</button><button class="mk-btn" data-ag-conflict>3-way 충돌 해결 시뮬</button></div>
        ${st.collabOut ? `<pre class="dev-pre">${jf(st.collabOut)}</pre>` : ''}</div>`;
  }

  /* ---------- 작업·자동화 ---------- */
  function Tasks() {
    ensure();
    const ts = AG().tasks();
    return `
      <div class="mk-card"><h4>AI Tasks (§17) — 할 일·예약·백그라운드</h4>
        <div class="dev-row"><button class="mk-btn primary" data-ag-task-now>즉시 작업 생성(브랜드 검사)</button>
          <button class="mk-btn" data-ag-task-later>1시간 뒤 예약(오탈자 교정)</button>
          <button class="mk-btn" data-ag-tick-h>⏩ +1시간</button><button class="mk-btn" data-ag-tick-d>⏩ +1일</button>
          <button class="mk-btn" data-ag-tick-w>⏩ +7일</button></div>
        <table class="adm-tbl"><tr><th>제목</th><th>주기</th><th>실행</th><th>상태</th><th>마지막 로그</th></tr>
        ${ts.map((t) => `<tr><td>${esc(t.title)}</td><td>${t.everyMs ? (t.everyMs / 86400000) + '일' : t.at ? '예약' : '즉시'}</td><td>${t.runs}회</td>
          <td>${badge(t.status !== 'failed', t.status)}</td><td>${t.log.length ? esc(t.log[t.log.length - 1].msg || '').slice(0, 30) : '—'}</td></tr>`).join('') || '<tr><td colspan="5">작업 없음</td></tr>'}</table></div>
      <div class="mk-card"><h4>AI Automation (§23) — 반복 자동 실행</h4>
        <div class="dev-row">${AG().AUTOMATIONS.map((a) => `<button class="mk-btn" data-ag-auto="${a.id}">${esc(a.name)} 켜기</button>`).join('')}</div>
        <p class="dev-note">내부 클록(_tick) 기준 — ⏩ 버튼으로 시간을 감아 실행을 실측한다.</p></div>`;
  }

  /* ---------- 팔레트·음성 ---------- */
  function Palette() {
    ensure();
    const list = AG().palette(st.palQ);
    return `
      <div class="mk-card"><h4>AI Command Palette (§18) — Ctrl+K</h4>
        <input class="mk-input" data-ag-palq value="${esc(st.palQ)}" placeholder="명령 검색…">
        <table class="adm-tbl">${list.map((c) => `<tr><td><b>${esc(c.label)}</b></td><td><code>${esc(c.prompt)}</code></td>
          <td><button class="mk-btn sm" data-ag-cmd="${c.id}">실행</button></td></tr>`).join('')}</table></div>
      <div class="mk-card"><h4>AI Voice (§19) — 음성 → 같은 판정 계층</h4>
        <div class="dev-row"><input class="mk-input" style="flex:1" data-ag-voice value="${esc(st.voiceIn)}">
        <button class="mk-btn primary" data-ag-voice-run>🎙 음성 실행</button></div>
        <p class="dev-note">음성 인식 하드웨어 없음 — 인식 결과 텍스트가 동일한 Orchestrator 를 통과한다.</p></div>
      <div class="mk-card"><h4>AI Learning (§22) — 마지막 Job 피드백</h4>
        <div class="dev-row"><button class="mk-btn" data-ag-fb="1">👍 좋아요</button><button class="mk-btn" data-ag-fb="0">👎 별로예요</button></div>
        <pre class="dev-pre">${jf(AG().prefs())}</pre></div>`;
  }

  /* ---------- 인스펙터 ---------- */
  function Inspector() {
    ensure();
    return `
      <div class="mk-card"><h4>AI Inspector (§25) — 현재 AI 상태</h4><pre class="dev-pre">${jf(AG().state())}</pre></div>
      <div class="mk-card"><h4>정직 보고 — 미구현 경계</h4>
        <table class="adm-tbl">
          <tr><td>LLM</td><td>미연결 — 규칙 엔진. Agent 계약이 {action,args,explain} 이라 판정부만 API 교체 가능</td></tr>
          <tr><td>번역</td><td>핵심 용어 사전 매칭 — 전문 번역은 API 연결 시</td></tr>
          <tr><td>음성</td><td>인식 하드웨어 없음 — 텍스트 파이프 동일 경로 검증</td></tr>
          <tr><td>영속화</td><td>세션 메모리 — localStorage/서버 저장 없음</td></tr>
        </table></div>`;
  }

  const TABS = [['over', '개요'], ['studio', '스튜디오'], ['agents', '에이전트'], ['timeline', '타임라인'], ['review', '리뷰'], ['tasks', '작업'], ['palette', '팔레트'], ['inspector', '인스펙터']];
  const BODY = { over: Over, studio: Studio, agents: Agents, timeline: Timeline, review: Review, tasks: Tasks, palette: Palette, inspector: Inspector };

  function mount(root) {
    const rerender = () => { const r = document.querySelector('.ag-screen'); if (r) { r.outerHTML = render(); mount(document); } };
    bind(root, rerender);
  }

  function render() {
      ensure();
      return `<div class="pg-screen ag-screen">
        <div class="pg-screen-head"><h2>🧠 AI Agent Studio</h2>
          <p>Canvas 를 이해하는 AI — 계획·디자인·수정·협업하는 디지털 팀원 (Round 22 · 규칙 엔진, LLM 미연결)</p></div>
        ${st.msg ? `<div class="mk-banner ${st.msg.ok ? 'ok' : 'warn'}">${esc(st.msg.text)}</div>` : ''}
        <div class="mk-tabs">${TABS.map(([k, n]) => `<button class="mk-tab ${st.tab === k ? 'active' : ''}" data-ag-tab="${k}">${n}</button>`).join('')}</div>
        <div class="ag-body">${BODY[st.tab]()}</div></div>`;
  }

  function bind(root, R) {
      root.querySelectorAll('[data-ag-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.agTab; st.msg = null; R(); });
      const gv = (sel) => { const el = root.querySelector(sel); return el ? el.value : ''; };
      const on = (sel, fn) => { const el = root.querySelector(sel); if (el) el.onclick = () => { fn(); R(); }; };

      /* 스튜디오 */
      on('[data-ag-run]', () => { st.prompt = gv('[data-ag-prompt]'); st.preview = null; run(st.prompt); });
      on('[data-ag-preview]', () => { ensure(); st.prompt = gv('[data-ag-prompt]'); st.preview = AG().preview(st.doc, st.prompt); say(true, `Preview — 변경 ${st.preview.wouldChange}곳 (커밋 안 됨)`); });
      root.querySelectorAll('[data-ag-fix]').forEach((b) => b.onclick = () => { run(b.dataset.agFix); R(); });

      /* 에이전트 */
      root.querySelectorAll('[data-ag-agent]').forEach((b) => b.onclick = () => {
        ensure();
        const DEMO = { planner: '보고서 만들어줘', designer: '레이아웃 정리해줘', writer: '오탈자 교정해줘',
          translator: '영어로 번역해줘', illustrator: '이미지 추천해줘', presenter: '순서 정리해줘',
          animator: '애니메이션 넣어줘', developer: '검사해줘', reviewer: '검사해줘', publisher: 'SNS 버전 만들어줘' };
        const r = AG().invoke(b.dataset.agAgent, st.doc, DEMO[b.dataset.agAgent], { previewShown: true });
        if (r.rec) st.lastRec = r.rec; say(r.ok, `invoke(${b.dataset.agAgent}) → ${r.msg || ''}`); R();
      });
      root.querySelectorAll('[data-ag-fav]').forEach((b) => b.onclick = () => { AG().favAsset(b.dataset.agFav); say(true, '즐겨찾기 반영 — 다음 추천에 가산'); R(); });

      /* 타임라인 */
      on('[data-ag-undo]', () => { const j = AG().undo(st.doc); say(!!j, j ? '되돌림 ' + j : '되돌릴 Job 없음'); });
      on('[data-ag-redo]', () => { const j = AG().redo(st.doc); say(!!j, j ? '다시 실행 ' + j : '다시 실행할 Job 없음'); });
      root.querySelectorAll('[data-ag-sel]').forEach((c) => c.onclick = () => {
        const id = c.dataset.agSel;
        st.selJobs = c.checked ? [...st.selJobs, id].slice(-2) : st.selJobs.filter((x) => x !== id);
        st.cmp = null; R();
      });
      on('[data-ag-cmp]', () => { st.cmp = AG().compare(st.selJobs[0], st.selJobs[1]); });
      root.querySelectorAll('[data-ag-restore]').forEach((b) => b.onclick = () => { AG().restore(st.doc, b.dataset.agRestore); say(true, 'Restore — ' + b.dataset.agRestore); R(); });
      root.querySelectorAll('[data-ag-rollback]').forEach((b) => b.onclick = () => { AG().rollback(st.doc, b.dataset.agRollback); say(true, 'Rollback — 변경 전으로 (§21)'); R(); });

      /* 리뷰·협업 */
      on('[data-ag-collab]', () => {
        ensure();
        const before = JSON.parse(JSON.stringify(st.doc));
        const after = JSON.parse(JSON.stringify(st.doc));
        if (after.scenes[0] && after.scenes[0].elements[0]) after.scenes[0].elements.push({ kind: 'text', x: 8, y: 88, w: 30, size: 2, text: '팀원이 덧붙인 메모' });
        st.collabOut = AG().summarizeEdits(before, after, '동학년 선생님');
      });
      on('[data-ag-conflict]', () => {
        ensure();
        const base = JSON.parse(JSON.stringify(st.doc));
        const mine = JSON.parse(JSON.stringify(st.doc)); mine.scenes[0].name = '표지(내 수정)';
        const theirs = JSON.parse(JSON.stringify(st.doc)); theirs.scenes[0].name = '표지(팀 수정)'; theirs.scenes[0].background = '#1F2733';
        st.collabOut = AG().resolveConflict(base, mine, theirs);
      });

      /* 작업·자동화 */
      on('[data-ag-task-now]', () => { ensure(); AG().taskCreate({ title: '브랜드 즉시 검사', prompt: '브랜드 검사해줘' }); AG()._runDue(); say(true, '즉시 작업 실행됨'); });
      on('[data-ag-task-later]', () => { ensure(); AG().taskCreate({ title: '오탈자 교정(예약)', prompt: '오탈자 교정해줘', at: AG()._now() + AG().HOUR }); say(true, '1시간 뒤 예약됨 — ⏩ 로 감아 실행'); });
      on('[data-ag-tick-h]', () => { AG()._tick(AG().HOUR + 1); say(true, '+1시간 경과'); });
      on('[data-ag-tick-d]', () => { AG()._tick(AG().DAY + 1); say(true, '+1일 경과'); });
      on('[data-ag-tick-w]', () => { AG()._tick(7 * AG().DAY + 1); say(true, '+7일 경과'); });
      root.querySelectorAll('[data-ag-auto]').forEach((b) => b.onclick = () => { ensure(); const t = AG().automationEnable(b.dataset.agAuto); say(!!t, t ? '자동화 켜짐 — ' + t.title : '이미 켜져 있어요'); R(); });

      /* 팔레트·음성·학습 */
      const pq = root.querySelector('[data-ag-palq]'); if (pq) pq.oninput = () => { st.palQ = pq.value; R(); };
      root.querySelectorAll('[data-ag-cmd]').forEach((b) => b.onclick = () => {
        const c = AG().COMMANDS.find((x) => x.id === b.dataset.agCmd);
        if (c.prompt === '@undo') { AG().undo(st.doc); say(true, '되돌림'); }
        else if (c.prompt === '@redo') { AG().redo(st.doc); say(true, '다시 실행'); }
        else run(c.prompt);
        R();
      });
      on('[data-ag-voice-run]', () => { ensure(); st.voiceIn = gv('[data-ag-voice]'); const r = AG().voice(st.doc, st.voiceIn, { previewShown: true }); say(r.ok, '🎙 ' + (r.msg || '')); });
      root.querySelectorAll('[data-ag-fb]').forEach((b) => b.onclick = () => {
        const js = AG().jobs(); if (!js.length) { say(false, '피드백할 Job 이 없어요.'); R(); return; }
        AG().feedback(js[js.length - 1].id, b.dataset.agFb === '1');
        say(true, '학습 반영 — 선호에 기록됨 (§22)'); R();
      });
  }

  return { title: 'AI Agent Studio', variants: ['Studio'], render, mount, bind };
})();
