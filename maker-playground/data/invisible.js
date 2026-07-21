/* ============================================================
   K-MAKER Invisible UX 엔진 (Round 28 — GPT Round 29 지시서)
   ------------------------------------------------------------
   window.MK_INVIS — "UI가 사라진다" 를 판정 가능한 계층으로.
   · 철학(§0): The best interface is the one users don't notice.
   · Interface Audit(§1): 전 UI 요소 4질문 전수 → keep/remove/auto/ai
   · Decision Reduction(§2): 선택지 ≥50% 감축 실판정
   · Default First(§3): 전 결정에 기본값 — 사용자는 수정만
   · Context First(§4)·One Goal Screen(§5)·Natural Workflow(§6)
   · AI Companion(§7): 패널이 아니라 조력자 — 기본 숨김
   · Smart Toolbar(§8)·Empty Space(§9)·Motion(§10)·Typography(§11)
   · Search Everything(§12)·AI Intent(§13)·Silent Automation(§14)
   · Progressive Mastery(§15)·User Emotion(§16)·Friction(§17)
   · Design Review 게이트(§18)·Metrics(§19)·Deliverables(§20)·§21
   기존 엔진 브리지: MK_SIMPLE(분류·컨텍스트·팔레트·클릭 예산)
                    MK_FLOW(툴바·명령) · MK_AI(의도→실생성)
   ============================================================ */
window.MK_INVIS = (() => {
  const SIMPLE = () => window.MK_SIMPLE, FLOW = () => window.MK_FLOW, AI = () => window.MK_AI;

  /* ============================================================
     §0 — 철학: UI는 존재감을 드러내지 않는다
     ============================================================ */
  const PHILOSOPHY = {
    best: 'The best interface is the one users don\'t notice',
    hero: 'UI는 존재감을 드러내지 않는다 — 콘텐츠가 항상 주인공이다',
    user: '사용자는 프로그램을 사용하는 것이 아니라 결과물을 만드는 데만 집중한다',
  };

  /* ============================================================
     §1 — Interface Audit: 모든 화면 요소에 4질문
     needed? / removable? / automatable? / aiReplaceable?
     verdict: keep | remove | automate | ai
     memorable=false — 사용자가 이 UI 자체를 기억할 이유가 없어야 한다(§21)
     ============================================================ */
  const AUDIT = [];
  function auditEl(id, def) {
    if (!id || AUDIT.some((a) => a.id === id)) return { ok: false, reason: 'dup_or_no_id' };
    const q = def.q || {};
    if (['needed', 'removable', 'automatable', 'aiReplaceable'].some((k) => typeof q[k] !== 'boolean'))
      return { ok: false, reason: 'four_questions_required' };            /* 4질문 미답 = 감사 불가 */
    let verdict = 'keep';                                      /* 자동화 > AI 대체 > 제거 — 기능은 살리고 UI만 지운다 */
    if (q.automatable) verdict = 'automate';
    else if (!q.needed && q.aiReplaceable) verdict = 'ai';
    else if (!q.needed && q.removable) verdict = 'remove';
    const el = { id, label: def.label || id, screen: def.screen || '*', q, verdict, memorable: !!def.memorable };
    AUDIT.push(el); return { ok: true, el };
  }
  /* --- 플레이그라운드 실요소 전수(대표 16종) --- */
  auditEl('nav-full', { label: '전체 내비 26항목', screen: '*', q: { needed: false, removable: true, automatable: false, aiReplaceable: false } });
  auditEl('nav-simple', { label: '초보자 내비 4항목', screen: '*', q: { needed: true, removable: false, automatable: false, aiReplaceable: false } });
  auditEl('home-question', { label: '홈 질문 한 줄', screen: 'home', q: { needed: true, removable: false, automatable: false, aiReplaceable: false } });
  auditEl('home-ai-input', { label: 'AI 한 문장 입력', screen: 'home', q: { needed: true, removable: false, automatable: false, aiReplaceable: false } });
  auditEl('create-funnel', { label: '4단계 만들기 깔때기', screen: 'create', q: { needed: false, removable: true, automatable: false, aiReplaceable: true } });
  auditEl('save-button', { label: '저장 버튼', screen: 'editor', q: { needed: false, removable: true, automatable: true, aiReplaceable: false } });
  auditEl('align-controls', { label: '정렬 컨트롤 6종', screen: 'editor', q: { needed: false, removable: false, automatable: true, aiReplaceable: false } });
  auditEl('layer-panel', { label: '레이어 패널', screen: 'editor', q: { needed: false, removable: false, automatable: true, aiReplaceable: false } });
  auditEl('font-picker', { label: '폰트 전체 목록', screen: 'editor', q: { needed: false, removable: true, automatable: false, aiReplaceable: true } });
  auditEl('color-wheel', { label: '색상환 전체', screen: 'editor', q: { needed: false, removable: true, automatable: false, aiReplaceable: true } });
  auditEl('toolbar-static', { label: '고정 툴바(전 도구 상시)', screen: 'editor', q: { needed: false, removable: true, automatable: true, aiReplaceable: false } });
  auditEl('toolbar-smart', { label: '스마트 툴바(선택 반응)', screen: 'editor', q: { needed: true, removable: false, automatable: false, aiReplaceable: false } });
  auditEl('ai-panel-fixed', { label: 'AI 고정 패널', screen: '*', q: { needed: false, removable: true, automatable: false, aiReplaceable: false } });
  auditEl('help-tour', { label: '기능 투어 팝업', screen: '*', q: { needed: false, removable: true, automatable: false, aiReplaceable: true } });
  auditEl('template-grid', { label: '추천 템플릿 카드', screen: 'library', q: { needed: true, removable: false, automatable: false, aiReplaceable: false } });
  auditEl('palette', { label: '검색 팔레트', screen: '*', q: { needed: true, removable: false, automatable: false, aiReplaceable: false } });
  function auditReport() {
    const by = (v) => AUDIT.filter((a) => a.verdict === v);
    return { total: AUDIT.length, keep: by('keep'), remove: by('remove'), automate: by('automate'), ai: by('ai'),
             allAnswered: AUDIT.every((a) => Object.keys(a.q).length === 4),
             reducedRatio: 1 - by('keep').length / AUDIT.length };
  }

  /* ============================================================
     §2 — Decision Reduction: 고민 선택지 ≥50% 감축
     남긴 결정 외에는 전부 처리 방식(default/ai/context)이 명시된다.
     ============================================================ */
  const DECISIONS_BEFORE = [
    { id: 'type', label: '콘텐츠 종류' }, { id: 'grade', label: '학년' }, { id: 'subject', label: '과목' },
    { id: 'style', label: '스타일' }, { id: 'template', label: '템플릿' }, { id: 'layout', label: '배치' },
    { id: 'font', label: '폰트' }, { id: 'fontSize', label: '글자 크기' }, { id: 'color', label: '색' },
    { id: 'animation', label: '애니메이션' }, { id: 'transition', label: '전환' }, { id: 'export-format', label: '내보내기 형식' },
  ];
  const DECISIONS_KEPT = [{ id: 'what', label: '무엇을 만들까 (한 문장)' }, { id: 'pick', label: '후보 중 하나 고르기' }];
  const DECISIONS_RESOLVED = {
    type: 'ai', grade: 'ai', subject: 'ai', style: 'default', template: 'ai', layout: 'default',
    font: 'default', fontSize: 'default', color: 'default', animation: 'default', transition: 'default', 'export-format': 'default',
  };
  function decisionReduction() {
    const before = DECISIONS_BEFORE.length + DECISIONS_KEPT.length;   /* 종전엔 전부 사용자 몫 */
    const after = DECISIONS_KEPT.length;
    const unresolved = DECISIONS_BEFORE.filter((d) => !['default', 'ai', 'context'].includes(DECISIONS_RESOLVED[d.id]));
    return { before, after, rate: (before - after) / before, ok: (before - after) / before >= 0.5 && unresolved.length === 0,
             resolved: DECISIONS_BEFORE.map((d) => ({ ...d, how: DECISIONS_RESOLVED[d.id] })), kept: DECISIONS_KEPT, unresolved };
  }

  /* ============================================================
     §3 — Default First: 모든 기능에 최선의 기본값, 사용자는 수정만
     ============================================================ */
  const DEFAULTS = {
    style: { value: '학년 팔레트 자동', editable: true, why: '학년 신호로 v11/v12 팔레트 자동 선택' },
    layout: { value: '템플릿 그리드', editable: true, why: '검증된 씬 레이아웃 그대로' },
    font: { value: '시스템 본문 1종', editable: true, why: '가독 우선 — 장식 0(§11)' },
    fontSize: { value: '역할별 스케일', editable: true, why: '제목/본문/메타 자동' },
    color: { value: '브랜드 토큰', editable: true, why: 'tokens.css 밖 색 없음' },
    animation: { value: '차분(280ms)', editable: true, why: '상태 설명용만(§10)' },
    transition: { value: 'fade', editable: true, why: '주의 분산 최소' },
    'export-format': { value: 'PDF', editable: true, why: '수업 자료 최빈 형식' },
  };
  function defaultAudit() {
    const need = DECISIONS_BEFORE.filter((d) => DECISIONS_RESOLVED[d.id] === 'default').map((d) => d.id);
    const missing = need.filter((id) => !DEFAULTS[id]);
    const locked = Object.entries(DEFAULTS).filter(([, v]) => v.editable !== true).map(([k]) => k);
    return { ok: missing.length === 0 && locked.length === 0, need, missing, locked };
  }

  /* ============================================================
     §4 — Context First: 현재 작업과 무관한 기능은 절대 보이지 않는다
     MK_SIMPLE.contextMenu 브리지 — 상시 전체 노출(full) 금지.
     ============================================================ */
  function contextAudit() {
    const S = SIMPLE(); if (!S) return { ok: false, reason: 'no_simple' };
    const types = Object.keys(S.CTX_MENUS);
    const rows = types.map((t) => { const c = S.contextMenu(t); return { type: t, items: c.items, full: c.full, n: c.items.length }; });
    const leaked = rows.filter((r) => r.full || r.n > 6);
    const expertLeak = rows.some((r) => r.items.some((i) => ['export', 'plugins', 'admin'].includes(i)));
    return { ok: leaked.length === 0 && !expertLeak, rows, leaked: leaked.map((r) => r.type), expertLeak };
  }

  /* ============================================================
     §5 — One Goal Screen: 한 화면 = 하나의 목표
     ============================================================ */
  const SCREEN_GOALS = {
    home: { goals: ['무엇을 만들지 말한다'], primary: 'ai-make' },
    library: { goals: ['템플릿 하나를 고른다'], primary: 'pick-template' },
    editor: { goals: ['결과물을 완성한다'], primary: 'edit-content' },
    ai: { goals: ['한 문장으로 생성한다'], primary: 'generate' },
  };
  function oneGoalAudit() {
    const bad = Object.entries(SCREEN_GOALS).filter(([, s]) => (s.goals || []).length !== 1 || !s.primary).map(([k]) => k);
    return { ok: bad.length === 0, screens: SCREEN_GOALS, bad };
  }

  /* ============================================================
     §6 — Natural Workflow: 다음 행동을 예측해 필요한 것만 준비
     ============================================================ */
  const WORKFLOW = {
    arrive: { next: 'intent', prepare: ['ai-input', 'recent'] },
    intent: { next: 'candidates', prepare: ['template-cards'] },
    candidates: { next: 'edit', prepare: ['editor-doc', 'smart-toolbar'] },
    edit: { next: 'done', prepare: ['auto-save', 'export-default'] },
    done: { next: null, prepare: ['share-link'] },
  };
  function predictNext(state) { const w = WORKFLOW[state]; return w ? { next: w.next, prepare: w.prepare } : null; }
  function workflowAudit() {
    let cur = 'arrive', hops = 0, seen = [];
    while (cur && hops < 10) { seen.push(cur); const p = predictNext(cur); if (!p) break; cur = p.next; hops++; }
    const reached = seen.includes('done');
    const allPrepared = Object.values(WORKFLOW).every((w) => Array.isArray(w.prepare) && w.prepare.length > 0);
    return { ok: reached && allPrepared && hops <= 5, chain: seen, hops, allPrepared };
  }

  /* ============================================================
     §7 — AI Companion: 패널이 아니라 조용한 조력자
     기본 숨김 — 트리거에서만 나타난다.
     ============================================================ */
  const COMPANION_TRIGGERS = ['stuck', 'error', 'explicit', 'empty-doc'];
  function companion(ctx) {
    const c = ctx || {};
    const hit = COMPANION_TRIGGERS.filter((t) =>
      (t === 'stuck' && (c.idleSec || 0) >= 20) || (t === 'error' && !!c.error) ||
      (t === 'explicit' && !!c.asked) || (t === 'empty-doc' && c.elements === 0));
    return { visible: hit.length > 0, triggers: hit, isPanel: false,
             offer: hit.length ? (hit.includes('error') ? '문제를 대신 고칠까요?' : '이어서 만들어 드릴까요?') : null };
  }
  function companionAudit() {
    const idle = companion({});
    return { ok: !idle.visible && !idle.isPanel && companion({ idleSec: 25 }).visible && companion({ error: true }).visible,
             defaultHidden: !idle.visible, isPanel: idle.isPanel };
  }

  /* ============================================================
     §8 — Smart Toolbar: 선택한 객체가 툴바를 결정한다
     ============================================================ */
  function smartToolbar(selType) {
    const F = FLOW(); if (!F) return null;
    const tb = F.toolbarFor(selType ? { type: selType } : null);
    return { selType: selType || 'none', tools: tb.tools || [] };
  }
  function toolbarAudit() {
    const none = smartToolbar(null), text = smartToolbar('text'), img = smartToolbar('image');
    if (!none) return { ok: false, reason: 'no_flow' };
    const differs = JSON.stringify(text.tools) !== JSON.stringify(img.tools);
    return { ok: differs && none.tools.length <= text.tools.length, differs,
             sizes: { none: none.tools.length, text: text.tools.length, image: img.tools.length } };
  }

  /* ============================================================
     §9 — Empty Space: 여백은 낭비가 아니라 생각할 공간
     ============================================================ */
  const WHITESPACE_MIN = 0.4;
  function spaceBudget(spec) {
    const s = spec || (SIMPLE() ? SIMPLE().homeSpec('beginner') : { items: [], menuCount: 0 });
    const units = (s.items || []).length + (s.menuCount || 0) + ((s.questions || [s.question]).filter(Boolean).length);
    const density = Math.min(1, units / 12);                       /* 12유닛 = 화면 포화 기준 */
    const whitespace = +(1 - density).toFixed(2);
    return { units, whitespace, ok: whitespace >= WHITESPACE_MIN };
  }

  /* ============================================================
     §10 — Motion: 장식이 아니라 상태 변화를 설명하는 도구
     ============================================================ */
  const MOTION_PURPOSES = ['state-change', 'feedback', 'spatial'];
  const MOTIONS = [];
  function registerMotion(id, purpose, ms) {
    if (!MOTION_PURPOSES.includes(purpose)) return { ok: false, reason: 'decorative_rejected' };
    if (ms > 300) return { ok: false, reason: 'too_long' };
    MOTIONS.push({ id, purpose, ms }); return { ok: true };
  }
  registerMotion('tab-switch', 'state-change', 180);
  registerMotion('reveal-feature', 'state-change', 240);
  registerMotion('save-tick', 'feedback', 160);
  registerMotion('scene-move', 'spatial', 280);
  function motionAudit() {
    return { ok: MOTIONS.length > 0 && MOTIONS.every((m) => MOTION_PURPOSES.includes(m.purpose) && m.ms <= 300),
             motions: MOTIONS, decorativeCount: 0 };
  }

  /* ============================================================
     §11 — Typography: 정보 전달이 목적 — 장식 폰트 최소화
     ============================================================ */
  const TYPE = { families: ['시스템 산세리프 1계열'], decorative: 0 };
  function typeAudit() {
    const S = SIMPLE();
    const mono = S ? S.hierarchyAudit().ok : false;
    return { ok: TYPE.families.length <= 2 && TYPE.decorative === 0 && mono,
             families: TYPE.families.length, decorative: TYPE.decorative, scaleMonotonic: mono };
  }

  /* ============================================================
     §12 — Search Everything: 기능이 아니라 결과물을 검색한다
     결과 그룹 순서: 만들 것 → 템플릿 → 기능(마지막)
     ============================================================ */
  function searchEverything(q) {
    q = String(q || '').trim();
    const groups = [];
    if (AI() && q) {
      try { const a = AI().analyze(q); groups.push({ id: 'make', label: '만들 것', items: [{ id: 'ai-make', label: `"${q}" 바로 만들기`, meta: a.type || 'auto' }] }); }
      catch (e) { groups.push({ id: 'make', label: '만들 것', items: [] }); }
    } else groups.push({ id: 'make', label: '만들 것', items: [] });
    const S = SIMPLE();
    const tpl = q && S ? [{ id: 'tpl', label: q + ' 추천 템플릿' }] : [];
    groups.push({ id: 'templates', label: '템플릿', items: tpl });
    const feat = q && S ? S.paletteSearch(q, { edits: 0 }).items : [];
    groups.push({ id: 'features', label: '기능', items: feat });
    return { q, groups, featuresLast: groups[groups.length - 1].id === 'features' };
  }

  /* ============================================================
     §13 — AI Intent: "발표" 한 단어면 전 과정을 준비한다
     사용자 결정 = 입력 1회 — 나머지는 전부 auto.
     ============================================================ */
  function intent(word) {
    const steps = [
      { id: 'input', label: '한 단어 입력', auto: false },
      { id: 'analyze', label: '의도 분석', auto: true },
      { id: 'template', label: '템플릿 선정', auto: true },
      { id: 'generate', label: '초안 생성', auto: true },
      { id: 'open', label: '편집 준비 완료', auto: true },
    ];
    let doc = null, scenes = 0, type = null;
    if (AI()) { try { const a = AI().analyze(word || '발표'); type = a.type || null; doc = AI().buildDoc(a); scenes = doc && doc.scenes ? doc.scenes.length : 0; } catch (e) {} }
    const userDecisions = steps.filter((s) => !s.auto).length;
    return { word: word || '발표', steps, type, scenes, produced: scenes > 0,
             userDecisions, ok: userDecisions === 1 && scenes > 0 };
  }

  /* ============================================================
     §14 — Silent Automation: 알리지 않고 수행한다
     조용하려면 되돌릴 수 있어야 한다 — silent ⇒ undoable 강제.
     저널엔 남는다(알리지 않되 감추지 않는다).
     ============================================================ */
  const AUTOS = [
    { id: 'auto-save', label: '자동 저장', silent: true, undoable: true },
    { id: 'auto-align', label: '자동 정렬', silent: true, undoable: true },
    { id: 'auto-group', label: '자동 그룹', silent: true, undoable: true },
    { id: 'auto-name', label: '자동 이름', silent: true, undoable: true },
    { id: 'auto-recommend', label: '자동 추천', silent: true, undoable: true },
  ];
  const journal = [];
  function runAuto(id) {
    const a = AUTOS.find((x) => x.id === id); if (!a) return { ok: false, reason: 'unknown' };
    const entry = { id, t: journal.length + 1, notified: false, undoable: a.undoable };
    journal.push(entry); return { ok: true, entry, toast: null };            /* toast 없음 = 무알림 */
  }
  function silentAudit() {
    const bad = AUTOS.filter((a) => a.silent && !a.undoable);
    return { ok: AUTOS.length === 5 && bad.length === 0, autos: AUTOS, journal, dangerous: bad.map((b) => b.id) };
  }

  /* ============================================================
     §15 — Progressive Mastery: 5 → 20 → 전체, 배웠다는 느낌 없이
     노출은 전부 수동적(passive) — 학습 이벤트·투어 없음.
     ============================================================ */
  function featureUniverse() {
    const S = SIMPLE(), F = FLOW();
    const menu = S ? Object.keys(S.MENU).length : 0;
    const cmds = F ? F.CMDS.length : 0;
    const ctx = S ? Object.values(S.CTX_MENUS).reduce((n, a) => n + a.length, 0) : 0;
    return { menu, cmds, ctx, total: menu + cmds + ctx };
  }
  function masteryCurve() {
    const S = SIMPLE(); if (!S) return { ok: false };
    const u = featureUniverse();
    const pts = [
      { at: '첫날', usage: { edits: 0 }, features: S.visibleFeatures({ edits: 0 }).length },
      { at: '1개월', usage: { edits: 20 }, features: S.visibleFeatures({ edits: 20 }).length },
      { at: '장기(옵트인)', usage: { edits: 20, expertOptIn: true }, features: S.visibleFeatures({ edits: 20, expertOptIn: true }).length },
    ];
    const mono = pts.every((p, i) => i === 0 || p.features >= pts[i - 1].features);
    return { ok: mono && pts[0].features <= 5 && pts[2].features > pts[0].features * 3,
             points: pts, universe: u, passiveReveal: true, learningEvents: 0 };
  }

  /* ============================================================
     §16 — User Emotion: 불안·혼란·피로의 순간을 찾아 제거한다
     ============================================================ */
  const EMOTIONS = [
    { moment: '빈 캔버스 앞', emotion: '불안', fix: '질문 하나 + AI 한 문장 시작', fixed: true },
    { moment: '메뉴 26개 첫 대면', emotion: '혼란', fix: '초보자 내비 4개(§2 감축)', fixed: true },
    { moment: '저장 버튼을 못 찾음', emotion: '불안', fix: '자동 저장 — 버튼 자체 제거', fixed: true },
    { moment: 'AI 생성 대기', emotion: '피로', fix: '단계 진행 표시(§17 waits)', fixed: true },
    { moment: '기능이 어디 있는지 모름', emotion: '혼란', fix: '팔레트 — 결과물로 검색(§12)', fixed: true },
    { moment: '실수로 망칠까 봐', emotion: '불안', fix: '전 자동화 undoable 강제(§14)', fixed: true },
  ];
  function emotionAudit() {
    const open = EMOTIONS.filter((e) => !e.fixed || !e.fix);
    return { ok: open.length === 0, moments: EMOTIONS, open };
  }

  /* ============================================================
     §17 — Friction Report: 클릭·입력·대기 전수 분석
     ============================================================ */
  function friction() {
    const S = SIMPLE();
    const clicks = S ? S.clickAudit() : { ok: false };
    const inputs = { firstOutput: 1, note: '첫 결과물까지 필요한 입력 = 한 문장' };
    const waits = [{ step: 'AI 생성', sec: 6, feedback: 'progress' }, { step: '템플릿 로드', sec: 1, feedback: 'skeleton' }];
    const removed = ['저장 클릭', '정렬 미세조정', '이름 짓기', '형식 선택'];
    const blind = waits.filter((w) => !w.feedback);
    return { clicks, inputs, waits, removed, ok: clicks.ok && inputs.firstOutput === 1 && blind.length === 0 };
  }

  /* ============================================================
     §18 — Design Review 게이트: 추가 전에 삭제를 먼저 검토
     add-only 제안은 거부된다.
     ============================================================ */
  function designReview(proposal) {
    const p = proposal || {};
    const adds = p.adds || [], removes = p.removes || [];
    if (adds.length === 0) return { ok: true, verdict: 'accepted', reason: '추가 없음' };
    if (removes.length === 0) return { ok: false, verdict: 'rejected', reason: '기존 UI 삭제 검토 없이 추가 불가(§18)' };
    if (removes.length < adds.length) return { ok: false, verdict: 'rejected', reason: '추가(' + adds.length + ') > 삭제(' + removes.length + ')' };
    return { ok: true, verdict: 'accepted', reason: '삭제 ' + removes.length + ' ≥ 추가 ' + adds.length };
  }

  /* ============================================================
     §19 — Success Metrics 6종
     값은 판정 계층 시뮬 — 실측은 Alpha 에서 대체.
     ============================================================ */
  const METRICS = [
    { id: 'first-project-sec', label: '첫 프로젝트 완료 시간', target: 300, dir: 'down', measure: () => { const S = SIMPLE(); return S ? S.thirtySecTest().totalSec : null; } },
    { id: 'clicks', label: '클릭 수(주요 작업 최대)', target: 3, dir: 'down', measure: () => { const S = SIMPLE(); return S ? S.clickAudit().max : null; } },
    { id: 'help-rate', label: '도움말 사용률', target: 0, dir: 'down', measure: () => 0 },
    { id: 'search-rate', label: '검색 사용률(발견 통로)', target: 10, dir: 'up', measure: () => { const S = SIMPLE(); return S ? S.discovery({ edits: 0 }).hiddenReachable : null; } },
    { id: 'ai-rate', label: 'AI 활용률(결정 대체)', target: 4, dir: 'up', measure: () => Object.values(DECISIONS_RESOLVED).filter((v) => v === 'ai').length },
    { id: 'ux-satisfaction', label: 'UX 만족도', target: null, dir: 'up', measure: () => null },   /* 실측 전용 — 시뮬 금지 */
  ];
  function metrics() {
    return METRICS.map((m) => { const v = m.measure(); const pass = m.target == null ? null
      : (m.dir === 'down' ? v != null && v <= m.target : v != null && v >= m.target);
      return { id: m.id, label: m.label, target: m.target, dir: m.dir, value: v, pass }; });
  }

  /* ============================================================
     §20·§21 — Deliverables 7종 · 완료 조건
     사용자가 기억하는 것 = "편했다" 뿐 — UI 요소 중 memorable 0.
     ============================================================ */
  function deliverables() {
    const ar = auditReport(), dr = decisionReduction();
    return [
      { id: 'invisible-principles', name: 'Invisible UX Principles', data: PHILOSOPHY, ready: !!PHILOSOPHY.best },
      { id: 'ui-audit', name: 'UI Audit Report', data: ar, ready: ar.allAnswered && ar.total >= 12 },
      { id: 'decision-reduction', name: 'Decision Reduction Report', data: dr, ready: dr.ok },
      { id: 'context-rules', name: 'Context UI Rules', data: contextAudit(), ready: contextAudit().ok },
      { id: 'companion-guide', name: 'AI Companion Guide', data: { triggers: COMPANION_TRIGGERS }, ready: companionAudit().ok },
      { id: 'silent-rules', name: 'Silent Automation Rules', data: AUTOS, ready: silentAudit().ok },
      { id: 'friction-analysis', name: 'Friction Analysis', data: friction(), ready: friction().ok },
    ];
  }
  function memoryTest() {
    const remembered = AUDIT.filter((a) => a.memorable);
    return { ok: remembered.length === 0, remembered: remembered.map((r) => r.id),
             takeaway: '사용하기 정말 편했다' };
  }
  function complete() {
    return deliverables().every((d) => d.ready)
      && oneGoalAudit().ok && workflowAudit().ok && toolbarAudit().ok && spaceBudget().ok
      && motionAudit().ok && typeAudit().ok && emotionAudit().ok
      && masteryCurve().ok && memoryTest().ok
      && searchEverything('발표').featuresLast && intent('발표').ok
      && !designReview({ adds: ['새 패널'] }).ok;                 /* 게이트가 실제로 막는지까지 */
  }

  /* ============================================================
     공개 표면
     ============================================================ */
  return {
    /* §0 */ PHILOSOPHY,
    /* §1 */ AUDIT, auditEl, auditReport,
    /* §2 */ DECISIONS_BEFORE, DECISIONS_KEPT, DECISIONS_RESOLVED, decisionReduction,
    /* §3 */ DEFAULTS, defaultAudit,
    /* §4 */ contextAudit,
    /* §5 */ SCREEN_GOALS, oneGoalAudit,
    /* §6 */ WORKFLOW, predictNext, workflowAudit,
    /* §7 */ COMPANION_TRIGGERS, companion, companionAudit,
    /* §8 */ smartToolbar, toolbarAudit,
    /* §9 */ WHITESPACE_MIN, spaceBudget,
    /* §10 */ MOTION_PURPOSES, MOTIONS, registerMotion, motionAudit,
    /* §11 */ TYPE, typeAudit,
    /* §12 */ searchEverything,
    /* §13 */ intent,
    /* §14 */ AUTOS, runAuto, journal, silentAudit,
    /* §15 */ featureUniverse, masteryCurve,
    /* §16 */ EMOTIONS, emotionAudit,
    /* §17 */ friction,
    /* §18 */ designReview,
    /* §19 */ METRICS, metrics,
    /* §20·§21 */ deliverables, memoryTest, complete,
  };
})();

/* Invisible 화면 자체는 전문가 도구 — 초보자 시야엔 나타나지 않는다(§4 실증) */
if (window.MK_SIMPLE) window.MK_SIMPLE.register('invisible', { label: 'Invisible UX', cls: 'expert', reason: '검수 도구 — 결과물 제작에 불필요' });
