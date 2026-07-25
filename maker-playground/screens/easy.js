/* ============================================================
   화면: Easy — The Easiest AI Creative Platform (Round 35)
   ------------------------------------------------------------
   개요/교체·드롭/빠른동작·호버/리사이즈·테마/타임라인·자동모션/
   통합검색/팔레트/코치·산출물 8탭. 전 버튼 실함수 — 드롭 교체가
   애니를 실제로 지키고, 자연어가 doc을 실제로 바꾸고, 코치 fix가
   실제로 고치고, 나쁜 스펙이 실제로 거부된다. 에디터(#/editor)에는
   빠른동작 알약·호버 칩·드롭·자연어 브리지가 라이브로 실린다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.easy = (() => {
  const E = () => window.MK_EASY, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', out: null, doc: null, search: null };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const row = (l, r) => `<div class="dls-lm-row"><span>${l}</span><span>${r}</span></div>`;
  const vio = (a) => a.ok ? badge(true, '위반 0') : a.violations.map((v) => badge(false, v)).join(' ');
  const doc = () => { if (!st.doc) st.doc = E().demoDoc(); return st.doc; };
  const mini = (s) => window.MK_MINI ? window.MK_MINI(s, 128) : '';

  const TABS = [['over', '개요'], ['drop', '교체·드롭'], ['quick', '빠른동작·호버'], ['fit', '리사이즈·테마'],
                ['tl', '타임라인·자동모션'], ['find', '통합검색'], ['pal', '팔레트'], ['coach', '코치·산출물']];

  function Over() {
    const e = E(), p0 = e.p0Audit();
    return `
      <div class="adm-stats">
        ${Stat('P0 기능', p0.passed + '/' + p0.total, '전수 실동작 판정')}
        ${Stat('새 메뉴', 0, '기준 ' + e.SURFACE_BASELINE.menus + ' 동결')}
        ${Stat('새 패널', 0, '구역 ' + e.SURFACE_BASELINE.zones + ' 동결')}
        ${Stat('완료 조건', e.complete() ? '충족' : '미달', 'P0 전수')}
      </div>
      <div class="mk-card"><h4>철학</h4>
        <p class="dev-note"><b>${esc(e.PHILOSOPHY.rule)}</b></p>
        <p class="dev-note">${esc(e.PHILOSOPHY.how)}</p></div>
      <div class="mk-card"><h4>규칙 8</h4>
        <div class="dls-lm">${e.RULES.map((r) => row(esc(r.rule), badge(true, r.id))).join('')}</div></div>
      <div class="mk-card"><h4>P0 전수 판정</h4>
        <div class="dls-lm">${p0.rows.map((r) => row(`${r.id} · ${esc(r.name)}`, badge(r.ok, r.ok ? '실동작' : r.violations[0] || '위반'))).join('')}</div></div>
      <p class="dev-note">라이브 위치: 에디터(#/editor) — 선택 알약·호버 칩·캔버스 드롭·AI 입력창 자연어 모션이 실장돼 있어요.</p>`;
  }

  function Drop() {
    const a = E().replaceAudit();
    return `
      <div class="mk-card"><h4>F1 — Smart Replace</h4>
        <p class="dev-note">이미지·영상을 자리에 드롭 → 틀 그대로(자동 맞춤) · 애니 유지 · 크롭 유지. 에디터 캔버스에 실장.</p>
        <p>${vio(a)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${M().Button({ label: '데모: 사진 드롭 교체', size: 'sm', attrs: 'data-ez="rep-img"' })}
          ${M().Button({ label: '데모: 영상 드롭 교체', size: 'sm', attrs: 'data-ez="rep-vid"' })}
          ${M().Button({ label: '실거부: 애니 잃는 교체 스펙', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-anim"' })}
          ${M().Button({ label: '실거부: 수동 맞춤 다이얼로그', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-fit"' })}
        </div>
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>지금 데모 문서 — 1장면</h4>${mini(doc().scenes[0])}</div>`;
  }

  function Quick() {
    const e = E(), qa = e.quickAudit(), ha = e.hoverAudit();
    const el = doc().scenes[0].elements.find((x) => e.kindOf(x) === 'text');
    return `
      <div class="mk-card"><h4>F2 — AI Quick Action (선택 시 4개만)</h4>
        <p>${e.quickFor(el).map((q) => `<span class="mk-badge">${q.icon} ${esc(q.label)}</span>`).join(' ')}</p>
        <p>${vio(qa)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${M().Button({ label: '✨ 개선 실행', size: 'sm', attrs: 'data-ez="q-improve"' })}
          ${M().Button({ label: '🎨 스타일 순환', size: 'sm', attrs: 'data-ez="q-style"' })}
          ${M().Button({ label: '실거부: 액션 6개 스펙', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-q6"' })}
          ${M().Button({ label: '실거부: 실행 없는 액션', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-qrun"' })}
        </div>
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>F5 — Hover Editing (호버 즉시 동작 ≤3)</h4>
        <p class="dev-note">에디터 캔버스에서 요소에 마우스를 올리면 떠있는 칩이 나와요 — 텍스트 ✏️고치기·🗑, 미디어 🖼교체·🗑.</p>
        <p>${vio(ha)}</p></div>
      <div class="mk-card">${mini(doc().scenes[0])}</div>`;
  }

  function Fit() {
    const e = E(), ra = e.resizeAudit(), ta = e.themeAudit();
    return `
      <div class="mk-card"><h4>F3 — Magic Resize (원클릭 · 전 씬 재배치)</h4>
        <p>${vio(ra)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${e.RATIOS.map((r) =>
          M().Button({ label: r.name, size: 'sm', attrs: `data-ez-ratio="${r.id}"` })).join('')}
          ${M().Button({ label: '실거부: 씬별 수동 보정 스펙', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-manual"' })}
        </div>
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>F8 — One Click Theme (전 씬 즉시)</h4>
        <p>${vio(ta)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${e.THEMES().map((t) =>
          M().Button({ label: t.name, size: 'sm', attrs: `data-ez-theme="${t.id}"` })).join('')}
          ${M().Button({ label: '실거부: 씬마다 반복 스펙', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-perscene"' })}
        </div></div>
      <div class="mk-card"><h4>데모 문서 — 전 장면</h4>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${doc().scenes.map((s) => mini(s)).join('')}</div>
        <p class="dev-note">비율 ${esc(doc().ratio || '16:9')} · 팔레트 ${esc(doc().palette || '원본')}</p></div>`;
  }

  function Tl() {
    const e = E(), ta = e.timelineAudit(), aa = e.autoAnimAudit();
    return `
      <div class="mk-card"><h4>F4 — AI Timeline (자연어가 타임라인을 대신한다)</h4>
        <p>${vio(ta)}</p>
        <div class="aid-input" style="display:flex;gap:8px">
          <input class="mk-input" data-ez-tl placeholder='예) 제목 팝으로 · 두 번째 장면 8초로 · 사진 전부 순서대로'>
          ${M().Button({ label: '실행', attrs: 'data-ez="tl-run"' })}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${['제목 팝으로', '두 번째 장면 8초로', '사진 전부 순서대로', '둥둥 떠다니게'].map((c) =>
          `<button class="aid-chip" data-ez-cmd="${esc(c)}">${esc(c)}</button>`).join('')}
          ${M().Button({ label: '실거부: 가짜 성공 파서', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-fake"' })}
        </div>
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>F6 — Auto Animation (삽입 = 애니 자동 · 수동 설정 0)</h4>
        <p>${vio(aa)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${M().Button({ label: '사진 넣기 → 자동 fade', size: 'sm', attrs: 'data-ez="ins-img"' })}
          ${M().Button({ label: '영상 넣기 → 자동 zoom', size: 'sm', attrs: 'data-ez="ins-vid"' })}
          ${M().Button({ label: '실거부: 삽입 설정 다이얼로그', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-dialog"' })}
        </div></div>`;
  }

  function Find() {
    const e = E(), sa = e.searchAudit();
    const r = st.search || e.searchAll('');
    return `
      <div class="mk-card"><h4>F7 — Universal Asset Search (입구 하나 · 5종)</h4>
        <p>${e.SEARCH_KINDS.map((k) => `<span class="mk-badge">${esc(k.ko)}</span>`).join(' ')} ${vio(sa)}</p>
        <div class="aid-input" style="display:flex;gap:8px">
          <input class="mk-input" data-ez-find placeholder="한 곳에서 검색 — 피아노, 아이콘, 배경…" value="${esc(r.q)}">
          ${M().Button({ label: '검색', attrs: 'data-ez="find-run"' })}
        </div>
        ${r.groups.map((g) => `<div style="margin-top:10px"><b style="font:var(--mk-t-body-sm)">${esc(g.ko)}</b>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:5px">${g.items.map((it) =>
            `<button class="aid-chip" data-ez-pick="${esc(it.id)}" data-ez-pick-name="${esc(it.name)}" data-ez-pick-kind="${esc(g.kind)}">${esc(it.name)} ＋</button>`).join('')}</div></div>`).join('') || '<p class="dev-note">결과 없음</p>'}
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}
        <p class="dev-note">＋ 를 누르면 데모 문서에 실삽입 — 애니 자동(F6 체인). 음악은 씬 배경음으로.</p></div>`;
  }

  function Pal() {
    const e = E(), pa = e.paletteAudit();
    return `
      <div class="mk-card"><h4>F9 — Command Palette (${esc(e.SHORTCUT)})</h4>
        <p>명령 ${e.CMDS.length}개 — 전 P0 진입점 검색 실행 ${vio(pa)}</p>
        <div class="dls-lm">${e.CMDS.map((c) => row(`<span class="mk-badge">${c.f}</span> ${esc(c.label)}`,
          M().Button({ label: '실행', size: 'sm', attrs: `data-ez-cmd-run="${c.id}"` }))).join('')}</div>
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}</div>`;
  }

  function Coach() {
    const e = E(), ca = e.coachAudit(), sug = e.coach(doc());
    const p0 = e.p0Audit();
    return `
      <div class="mk-card"><h4>F10 — AI Coach (진단→실행 가능한 fix→수렴)</h4>
        <p>${vio(ca)}</p>
        ${sug.length ? `<div class="dls-lm">${sug.map((s2, i) => row(esc(s2.msg),
          M().Button({ label: '바로 고치기', size: 'sm', attrs: `data-ez-fix="${i}"` }))).join('')}</div>`
          : '<p class="dev-note">지금 데모 문서: 지적 0 — 깨끗해요.</p>'}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          ${M().Button({ label: '결함 심고 진단', size: 'sm', attrs: 'data-ez="coach-seed"' })}
          ${M().Button({ label: 'selfHeal — 전부 고치기', size: 'sm', attrs: 'data-ez="coach-heal"' })}
          ${M().Button({ label: '실거부: fix 없는 지적 스펙', kind: 'secondary', size: 'sm', attrs: 'data-ez="rej-nofix"' })}
        </div>
        ${st.out ? `<p style="margin-top:10px">${st.out}</p>` : ''}</div>
      <div class="mk-card"><h4>산출물 · 완료 조건</h4>
        <div class="dls-lm">
          ${row('엔진', 'data/easy.js — MK_EASY (10기능 실변형 + 판정 + 실거부)')}
          ${row('라이브', '에디터 — 선택 알약 4 · 호버 칩 · 캔버스 드롭 · AI 입력 자연어 모션')}
          ${row('검증', 'test-round35.mjs + R11~R34 회귀')}
        </div>
        <p style="margin-top:8px">${badge(p0.ok, p0.ok ? 'P0 ' + p0.passed + '/' + p0.total + ' — the easiest AI creative platform' : '미달 ' + p0.passed + '/' + p0.total)}</p></div>`;
  }

  const BODY = { over: Over, drop: Drop, quick: Quick, fit: Fit, tl: Tl, find: Find, pal: Pal, coach: Coach };

  function render() {
    return `
      <div class="mk-tabs">${TABS.map(([id, l]) => `<button class="mk-tab ${st.tab === id ? 'active' : ''}" data-ez-tab="${id}">${esc(l)}</button>`).join('')}</div>
      <div class="mk-tab-body">${BODY[st.tab]()}</div>`;
  }

  function mount(root) {
    const e = E();
    const rerender = () => { root.innerHTML = render(); mount(root); };
    const say = (html) => { st.out = html; rerender(); };
    const okOut = (r) => say(r.ok ? badge(true, r.msg || '실행') : badge(false, r.msg || '실패'));
    const rej = (r) => say(badge(false, '거부 — ' + r.reason));
    root.querySelectorAll('[data-ez-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.ezTab; st.out = null; rerender(); });
    const on = (sel, fn) => { const b = root.querySelector(sel); if (b) b.onclick = fn; };

    /* F1 */
    const mediaIdx = () => doc().scenes[0].elements.findIndex((x) => e.kindOf(x) !== 'text');
    on('[data-ez="rep-img"]', () => okOut(e.replace(doc(), 0, mediaIdx(), { name: '운동회 사진', kind: 'image' })));
    on('[data-ez="rep-vid"]', () => okOut(e.replace(doc(), 0, mediaIdx(), { name: '실험 영상', kind: 'video' })));
    on('[data-ez="rej-anim"]', () => rej(e.replaceSpecAudit({ losesAnim: true })));
    on('[data-ez="rej-fit"]', () => rej(e.replaceSpecAudit({ manualFit: true })));
    /* F2 */
    const textIdx = () => doc().scenes[0].elements.findIndex((x) => e.kindOf(x) === 'text');
    on('[data-ez="q-improve"]', () => okOut(e.quickRun(doc(), 0, textIdx(), 'improve')));
    on('[data-ez="q-style"]', () => okOut(e.quickRun(doc(), 0, textIdx(), 'style')));
    on('[data-ez="rej-q6"]', () => rej(e.quickSpecAudit({ actions: [{ run: 1 }, { run: 1 }, { run: 1 }, { run: 1 }, { run: 1 }, { run: 1 }] })));
    on('[data-ez="rej-qrun"]', () => rej(e.quickSpecAudit({ actions: [{ id: 'x' }] })));
    /* F3·F8 */
    root.querySelectorAll('[data-ez-ratio]').forEach((b) => b.onclick = () => okOut(e.magicResize(doc(), b.dataset.ezRatio)));
    on('[data-ez="rej-manual"]', () => rej(e.resizeSpecAudit({ perElementManual: true })));
    root.querySelectorAll('[data-ez-theme]').forEach((b) => b.onclick = () => okOut(e.applyTheme(doc(), b.dataset.ezTheme)));
    on('[data-ez="rej-perscene"]', () => rej(e.themeSpecAudit({ perScene: true })));
    /* F4·F6 */
    const tlin = root.querySelector('[data-ez-tl]');
    const runTl = (c) => okOut(e.timeline(c, doc(), 0));
    on('[data-ez="tl-run"]', () => runTl(tlin && tlin.value));
    if (tlin) tlin.onkeydown = (ev) => { if (ev.key === 'Enter') runTl(tlin.value); };
    root.querySelectorAll('[data-ez-cmd]').forEach((b) => b.onclick = () => runTl(b.dataset.ezCmd));
    on('[data-ez="rej-fake"]', () => rej(e.timelineSpecAudit({ fakeSuccess: true })));
    on('[data-ez="ins-img"]', () => okOut(e.insertMedia(doc(), 0, { name: '현장체험 사진', kind: 'image' })));
    on('[data-ez="ins-vid"]', () => okOut(e.insertMedia(doc(), 0, { name: '증발 실험', kind: 'video' })));
    on('[data-ez="rej-dialog"]', () => rej(e.autoAnimSpecAudit({ settingsDialog: true })));
    /* F7 */
    const fin = root.querySelector('[data-ez-find]');
    on('[data-ez="find-run"]', () => { st.search = e.searchAll(fin && fin.value); st.out = null; rerender(); });
    if (fin) fin.onkeydown = (ev) => { if (ev.key === 'Enter') { st.search = e.searchAll(fin.value); st.out = null; rerender(); } };
    root.querySelectorAll('[data-ez-pick]').forEach((b) => b.onclick = () =>
      okOut(e.pickResult(doc(), 0, { id: b.dataset.ezPick, name: b.dataset.ezPickName, kind: b.dataset.ezPickKind })));
    /* F9 */
    root.querySelectorAll('[data-ez-cmd-run]').forEach((b) => b.onclick = () => {
      const r = e.paletteRun(b.dataset.ezCmdRun, doc());
      say(badge(r.ok !== false, r.msg || (r.total != null ? '검색 ' + r.total + '건' : r.suggestions != null ? '진단 ' + r.suggestions + '건' : '실행')));
    });
    /* F10 */
    root.querySelectorAll('[data-ez-fix]').forEach((b) => b.onclick = () => {
      const sug = e.coach(doc()); const s2 = sug[+b.dataset.ezFix];
      if (s2) { s2.fix(doc()); say(badge(true, '고침 — ' + s2.msg)); }
    });
    on('[data-ez="coach-seed"]', () => {
      doc().scenes[0].elements.push({ kind: 'text', x: 40, y: 30, w: 30, size: 1.1, text: '깨알 글자', weight: 400 });
      say(badge(true, '결함을 심었어요 — 진단이 잡아냅니다'));
    });
    on('[data-ez="coach-heal"]', () => { const h = e.selfHeal(doc()); say(badge(h.ok, h.ok ? `selfHeal — ${h.rounds}회 만에 지적 0` : '미수렴')); });
    on('[data-ez="rej-nofix"]', () => rej(e.coachSpecAudit({ suggestions: [{ msg: '별로예요' }] })));
  }

  return { title: 'Easy — Easiest AI Platform', variants: ['R35'], render, mount };
})();
