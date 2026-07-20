/* ============================================================
   K-MAKER Flow Experience Engine — window.MK_FLOW  (Round 23)
   ------------------------------------------------------------
   새 기능을 추가하지 않는다 — 생각→클릭→결과의 최단 경로를 만든다.
   "이 프로그램은 왜 이렇게 편하지?" 를 판정 가능한 계층으로 구현.

   ★ 핵심 설계
     - Flow Engine(§1): Intent→Predict→Suggest→Execute→Continue 가
       단일 execute() 를 통과하며, 전이 확률은 실사용에서 학습된다.
     - Zero Friction(§2): 확인 모달은 파괴적 작업에만. 자동 저장·
       이름·정렬·그룹은 전부 순수 함수 — 100% Undo 가능(§10).
     - Universal Search(§8): 8도메인(Project·Template·Asset·Plugin·
       Command·AI·Settings·Brand)을 기존 엔진 실데이터로 관통.
     - 모든 모션은 150~250ms(§16). 어기는 스펙은 등록 자체가 거부됨.
   내부 클록 _now/_tick — 자동저장 디바운스·퍼널 시각은 실시간 비의존.
   결정론 규칙 엔진 — LLM·실텔레메트리 미연결(정직 보고 정본 참조).
   ============================================================ */
window.MK_FLOW = (() => {
  'use strict';
  const TPL = () => window.MK_TPL, PROJ = () => window.MK_PROJ,
        AS = () => window.MK_ASSETS, PL = () => window.MK_PLUGIN,
        AG = () => window.MK_AGENT, BR = () => window.MK_BRAND;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let SEQ = 100;
  const uid = (p) => p + '-' + (SEQ++).toString(36).padStart(4, '0');

  /* ---------- 내부 클록 (정오 앵커 — 시각 의존 플레이크 방지) ---------- */
  let CLOCK = new Date('2026-07-21T12:00:00+09:00').getTime();
  const _now = () => CLOCK;
  const SEC = 1000, MIN = 60000;
  const _tick = (ms) => { CLOCK += ms; _autosaveDue(); return CLOCK; };

  /* ============================================================
     16) Micro Interaction (§16) — 150~250ms 강제 스펙
     ============================================================ */
  const MOTION = {};
  function motionRegister(type, ms, easing) {
    if (ms < 150 || ms > 250) return { ok: false, reason: 'duration_out_of_range(150~250ms)' };
    MOTION[type] = { ms, easing: easing || 'cubic-bezier(.2,.8,.2,1)' };
    return { ok: true, spec: MOTION[type] };
  }
  ['hover', 'press', 'select', 'panel', 'toast', 'preview', 'reorder', 'delight']
    .forEach((t, i) => motionRegister(t, 150 + (i % 5) * 25));
  const motionFor = (t) => MOTION[t] || MOTION.hover;

  /* ============================================================
     12·18) Command Registry — One Click(§12)·Keyboard First(§18)
     모든 명령은 clicks(도달 클릭 수)와 key(단축키)를 반드시 갖는다.
     ============================================================ */
  const CMDS = [];
  const KEYMAP = {};
  function cmdRegister(c) {
    if (!c.id || !c.label) return { ok: false, reason: 'invalid' };
    if (!(c.clicks >= 1 && c.clicks <= 3)) return { ok: false, reason: 'clicks_over_3' };  /* §12 */
    if (!c.key) return { ok: false, reason: 'no_shortcut' };                               /* §18 */
    if (KEYMAP[c.key] && KEYMAP[c.key] !== c.id) return { ok: false, reason: 'key_conflict', with: KEYMAP[c.key] };
    KEYMAP[c.key] = c.id;
    const rec = { usage: 0, tags: [], ...clone(c) };
    const i = CMDS.findIndex((x) => x.id === c.id);
    if (i >= 0) CMDS[i] = rec; else CMDS.push(rec);
    return { ok: true, cmd: rec };
  }
  function cmdRemap(id, key) {
    const c = CMDS.find((x) => x.id === id);
    if (!c) return { ok: false, reason: 'not_found' };
    if (KEYMAP[key] && KEYMAP[key] !== id) return { ok: false, reason: 'key_conflict', with: KEYMAP[key] };
    delete KEYMAP[c.key]; c.key = key; KEYMAP[key] = id;
    return { ok: true };
  }
  const keyboardMap = () => CMDS.map((c) => ({ id: c.id, label: c.label, key: c.key })).sort((a, b) => a.key.localeCompare(b.key));

  /* 기본 명령 세트 — 자주 쓰는 작업은 1클릭, 복잡해도 3클릭 이하 */
  [
    { id: 'new-project',  label: '새 프로젝트',      key: 'Ctrl+N',       clicks: 1, run: 'create',       tags: ['프로젝트', 'new'] },
    { id: 'save',         label: '저장',             key: 'Ctrl+S',       clicks: 1, run: 'save',         tags: ['save'] },
    { id: 'undo',         label: '되돌리기',         key: 'Ctrl+Z',       clicks: 1, run: 'undo',         tags: ['undo'] },
    { id: 'redo',         label: '다시 실행',        key: 'Ctrl+Shift+Z', clicks: 1, run: 'redo',         tags: ['redo'] },
    { id: 'insert-text',  label: '텍스트 넣기',      key: 'T',            clicks: 1, run: 'insert',       tags: ['텍스트', 'text'] },
    { id: 'insert-image', label: '이미지 넣기',      key: 'I',            clicks: 1, run: 'insert',       tags: ['이미지', 'image'] },
    { id: 'insert-table', label: '표 넣기',          key: 'B',            clicks: 2, run: 'insert',       tags: ['표', 'table'] },
    { id: 'crop',         label: '이미지 자르기',    key: 'C',            clicks: 1, run: 'edit',         tags: ['crop', '자르기'] },
    { id: 'shadow',       label: '그림자',           key: 'Shift+S',      clicks: 1, run: 'edit',         tags: ['shadow'] },
    { id: 'align',        label: '정렬',             key: 'A',            clicks: 1, run: 'edit',         tags: ['정렬', 'align'] },
    { id: 'group',        label: '그룹',             key: 'Ctrl+G',       clicks: 1, run: 'edit',         tags: ['그룹'] },
    { id: 'export',       label: '내보내기',         key: 'Ctrl+E',       clicks: 2, run: 'export',       tags: ['export', '내보내기'] },
    { id: 'share',        label: '공유',             key: 'Ctrl+Shift+P', clicks: 2, run: 'share',        tags: ['공유', 'share'] },
    { id: 'ai-ask',       label: 'AI 에게 부탁',     key: 'Ctrl+J',       clicks: 1, run: 'ai',           tags: ['ai'] },
    { id: 'brand-check',  label: '브랜드 검사',      key: 'Shift+B',      clicks: 2, run: 'brand',        tags: ['브랜드'] },
    { id: 'delete',       label: '삭제',             key: 'Delete',       clicks: 1, run: 'delete', destructive: true, tags: ['삭제'] },
    { id: 'market-open',  label: '마켓 열기',        key: 'Ctrl+M',       clicks: 2, run: 'market',       tags: ['market'] },
    { id: 'settings',     label: '환경설정',         key: 'Ctrl+,',       clicks: 2, run: 'settings',     tags: ['설정'] },
  ].forEach(cmdRegister);

  /* ============================================================
     5) Context Awareness (§5) — AI 가 이해하는 현재
     ============================================================ */
  const CTX = { selection: null, purposeDoc: null };
  const setSelection = (sel) => { CTX.selection = sel ? clone(sel) : null; return context(); };
  function context() {
    const p = PROJ() ? PROJ().current() : null;
    const b = BR() && BR().active ? BR().active() : null;
    const purpose = (AG() && CTX.purposeDoc) ? AG().understand(CTX.purposeDoc) : null;
    const top = CMDS.slice().sort((a, b) => b.usage - a.usage).filter((c) => c.usage > 0).slice(0, 5).map((c) => c.id);
    return {
      project: p ? { id: p.projectId, name: p.name } : null,
      selection: CTX.selection ? clone(CTX.selection) : null,
      brand: b ? { id: b.brandId, name: b.name, primary: b.color.primary, colors: [b.color.primary, b.color.secondary, b.color.accent].filter(Boolean) } : null,
      purpose: purpose ? { purpose: purpose.purpose, audience: purpose.audience, tone: purpose.tone } : null,
      patterns: { topCommands: top, totalActions: LOG.length },
    };
  }

  /* ============================================================
     3) Smart Interface (§3) — 선택에 따라 UI 가 변한다
     ============================================================ */
  const TOOLBARS = {
    text:  ['font', 'size', 'bold', 'color', 'align', 'ai-rewrite'],
    image: ['crop', 'shadow', 'filter', 'replace', 'align', 'ai-enhance'],
    table: ['rows', 'cols', 'merge', 'style', 'sort', 'ai-fill'],
    shape: ['fill', 'stroke', 'radius', 'align'],
    multi: ['group', 'align', 'distribute', 'tidy'],
    none:  ['insert-text', 'insert-image', 'insert-table', 'templates', 'ai-ask'],
  };
  function toolbarFor(sel) {
    if (!sel) return { kind: 'none', tools: TOOLBARS.none.slice() };
    if (Array.isArray(sel) || sel.multi) return { kind: 'multi', tools: TOOLBARS.multi.slice() };
    const k = TOOLBARS[sel.type] ? sel.type : 'shape';
    return { kind: k, tools: TOOLBARS[k].slice() };
  }

  /* ============================================================
     4) Progressive Disclosure (§4) — 처음엔 필요한 것만
     ============================================================ */
  const PRO_TOOLS = { text: ['kerning', 'variable-font', 'opentype'], image: ['curves', 'mask', 'blend-mode'], table: ['formula', 'pivot'] };
  const PRO_THRESHOLD = 5;
  function toolsFor(sel, opts) {
    const base = toolbarFor(sel);
    const pro = PRO_TOOLS[base.kind] || [];
    const uses = CMDS.filter((c) => c.run === 'edit').reduce((s, c) => s + c.usage, 0);
    const revealed = !!(opts && opts.expand) || uses >= PRO_THRESHOLD;
    return { ...base, pro: revealed ? pro.slice() : [], proHidden: revealed ? 0 : pro.length };
  }

  /* ============================================================
     10) Undo Philosophy (§10) — 모든 작업은 100% Undo (AI 포함)
     ============================================================ */
  const UNDO = [], REDO = [];
  function _record(label, before, after, source) {
    UNDO.push({ id: uid('u'), label, before: clone(before), after: clone(after), source: source || 'user', at: _now() });
    REDO.length = 0;                                   /* 새 작업 시 redo 꼬리 절단 */
  }
  function undo(doc) {
    const e = UNDO.pop(); if (!e) return { ok: false, reason: 'empty' };
    REDO.push(e); Object.keys(doc).forEach((k) => delete doc[k]); Object.assign(doc, clone(e.before));
    track('undo', { label: e.label }); return { ok: true, label: e.label };
  }
  function redo(doc) {
    const e = REDO.pop(); if (!e) return { ok: false, reason: 'empty' };
    UNDO.push(e); Object.keys(doc).forEach((k) => delete doc[k]); Object.assign(doc, clone(e.after));
    return { ok: true, label: e.label };
  }
  const undoDepth = () => ({ undo: UNDO.length, redo: REDO.length });

  /* ============================================================
     2) Zero Friction (§2) — 자동 저장·이름·정렬·그룹
     전부 순수 계산 → execute() 로 커밋 → Undo 가능
     ============================================================ */
  /* 자동 이름 — 내용에서 짓는다. 사용자는 수정만 한다(§15와 동일 철학) */
  function autoName(doc) {
    const sc = (doc && doc.scenes || [])[0];
    const t = sc && (sc.elements || []).find((e) => e.type === 'text' && (e.text || '').trim());
    const base = t ? t.text.trim().slice(0, 16) : (doc && doc.title) || '새 디자인';
    const d = new Date(_now());
    return `${base} — ${d.getMonth() + 1}/${d.getDate()}`;
  }
  /* 자동 정렬 — 8% 그리드 스냅 (계산만, 커밋은 execute) */
  const _snap = (v) => Math.round(v / 8) * 8;
  function autoAlign(scene) {
    const s = clone(scene); let moved = 0;
    (s.elements || []).forEach((e) => {
      const nx = _snap(e.x || 0), ny = _snap(e.y || 0);
      if (nx !== e.x || ny !== e.y) { e.x = nx; e.y = ny; moved++; }
    });
    return { scene: s, moved };
  }
  /* 자동 그룹 — 근접 클러스터(맨해튼 거리 ≤ 18) */
  function autoGroup(scene) {
    const els = (scene.elements || []).map((e, i) => ({ i, x: e.x || 0, y: e.y || 0 }));
    const g = els.map(() => -1); let gn = 0;
    for (let a = 0; a < els.length; a++) {
      if (g[a] < 0) g[a] = gn++;
      for (let b = a + 1; b < els.length; b++)
        if (Math.abs(els[a].x - els[b].x) + Math.abs(els[a].y - els[b].y) <= 18) g[b] = g[a];
    }
    const groups = {};
    g.forEach((gid, i) => { (groups[gid] = groups[gid] || []).push(i); });
    return Object.values(groups).filter((arr) => arr.length >= 2);
  }
  /* 자동 순서 — 스토리 랭크(표지→목차→본론→마무리) */
  const _rank = (s) => ({ cover: 0, toc: 1, outro: 9 }[s.sec] != null ? { cover: 0, toc: 1, outro: 9 }[s.sec] : 5);
  function autoSort(scenes) { return clone(scenes).sort((a, b) => _rank(a) - _rank(b)).map((s, i) => ({ ...s, order: i })); }

  /* 자동 저장 — dirty 표시 후 디바운스(2초, 내부 클록) 커밋 */
  const SAVE = { state: 'saved', dirtyAt: 0, count: 0, doc: null };
  const DEBOUNCE = 2 * SEC;
  function markDirty(doc) { SAVE.state = 'dirty'; SAVE.dirtyAt = _now(); SAVE.doc = doc; return saveState(); }
  function _autosaveDue() {
    if (SAVE.state === 'dirty' && _now() - SAVE.dirtyAt >= DEBOUNCE) {
      SAVE.state = 'saved'; SAVE.count++; SAVE.savedAt = _now();
      track('autosave', {});
    }
  }
  const saveState = () => ({ state: SAVE.state, count: SAVE.count });
  /* 확인 모달 정책 — 파괴적 작업에만. 그 외 확인 금지 */
  function confirmPolicy(cmdId) {
    const c = CMDS.find((x) => x.id === cmdId);
    return { needsConfirm: !!(c && c.destructive), reason: c && c.destructive ? 'destructive' : 'frictionless' };
  }

  /* ============================================================
     17) Error Prevention (§17) — 실수하기 전에 막는다
     ============================================================ */
  function guard(cmdId, ctx) {
    const c = CMDS.find((x) => x.id === cmdId) || {};
    if (c.destructive) return { ok: false, gate: 'confirm', msg: '삭제는 되돌릴 수 있지만, 한 번 확인할게요.' };
    if (cmdId === 'export' && ctx && ctx.doc && !(ctx.doc.scenes || []).length)
      return { ok: false, gate: 'block', msg: '내보낼 장면이 없어요.' };
    /* 브랜드 위반 → 자동 수정 제안 */
    if (ctx && ctx.color && BR() && BR().active && BR().active()) {
      const b = BR().active();
      const allow = [b.color.primary, b.color.secondary, b.color.accent, '#ffffff', '#000000']
        .filter(Boolean).map((x) => String(x).toLowerCase());
      if (!allow.includes(String(ctx.color).toLowerCase())) {
        return { ok: false, gate: 'autofix', msg: '브랜드 색이 아니에요.', fix: { color: b.color.primary } };
      }
    }
    return { ok: true, gate: 'none' };
  }

  /* ============================================================
     13·22) Flow Analytics (§13) + UX Metrics (§22)
     ============================================================ */
  const LOG = [];
  const track = (ev, data) => { LOG.push({ ev, data: data || {}, at: _now() }); return LOG.length; };
  const FUNNEL_STEPS = ['open', 'pick_template', 'edit', 'export'];
  function funnel() {
    const sessions = {};
    LOG.filter((l) => l.data && l.data.sid).forEach((l) => {
      (sessions[l.data.sid] = sessions[l.data.sid] || new Set()).add(l.ev);
    });
    const ids = Object.keys(sessions);
    const steps = FUNNEL_STEPS.map((s) => ({ step: s, n: ids.filter((id) => sessions[id].has(s)).length }));
    for (let i = 0; i < steps.length; i++)
      steps[i].dropoff = i === 0 ? 0 : Math.max(0, steps[i - 1].n - steps[i].n);
    const stuck = steps.slice(1).filter((s) => s.dropoff > 0).sort((a, b) => b.dropoff - a.dropoff);
    return { steps, sessions: ids.length, worst: stuck[0] || null };
  }
  function metrics() {
    const first = (ev) => { const l = LOG.find((x) => x.ev === ev); return l ? l.at : null; };
    const t0 = first('open');
    const clicks = LOG.filter((l) => l.ev === 'exec').length;
    const undos = LOG.filter((l) => l.ev === 'undo').length;
    const tasks = LOG.filter((l) => l.ev === 'task_done').length;
    const f = funnel();
    const started = f.steps[0] ? f.steps[0].n : 0, done = f.steps[3] ? f.steps[3].n : 0;
    return {
      timeToFirstDesign: t0 != null && first('pick_template') != null ? first('pick_template') - t0 : null,
      timeToExport: t0 != null && first('export') != null ? first('export') - t0 : null,
      clicksPerTask: tasks ? +(clicks / tasks).toFixed(2) : null,
      undoRate: clicks ? +(undos / clicks).toFixed(3) : 0,
      dropoff: f.worst ? { after: f.worst.step, lost: f.worst.dropoff } : null,
      completionRate: started ? +(done / started).toFixed(2) : null,
    };
  }

  /* ============================================================
     1·6) Flow Engine (§1) + Predictive Actions (§6)
     Intent → Predict → Suggest → Execute → Continue
     ============================================================ */
  /* 기본 전이 체인 — 이미지 삽입 → Crop → Shadow → Align (§6 예시 그대로) */
  const CHAIN = {
    'new-project':  ['insert-text', 'insert-image', 'ai-ask'],
    'insert-image': ['crop', 'shadow', 'align'],
    'crop':         ['shadow', 'align'],
    'shadow':       ['align'],
    'insert-text':  ['align', 'ai-ask'],
    'insert-table': ['align'],
    'align':        ['group', 'export'],
    'group':        ['export'],
    'ai-ask':       ['export', 'share'],
    'export':       ['share'],
  };
  const WEIGHT = {};                                   /* 학습: 수용 +1 / 무시 -1 */
  const _wkey = (a, b) => a + '>' + b;
  let LAST_EXEC = null;
  function predict(afterCmd) {
    const from = afterCmd || LAST_EXEC || 'new-project';
    const base = (CHAIN[from] || ['ai-ask', 'export', 'share']).map((id, i) => {
      const c = CMDS.find((x) => x.id === id);
      const w = (WEIGHT[_wkey(from, id)] || 0);
      return { id, label: c ? c.label : id, score: (10 - i * 2) + w * 3 + (c ? c.usage : 0) };
    });
    return base.sort((a, b) => b.score - a.score);
  }
  function accept(from, to) { WEIGHT[_wkey(from, to)] = (WEIGHT[_wkey(from, to)] || 0) + 1; return WEIGHT[_wkey(from, to)]; }
  function dismiss(from, to) { WEIGHT[_wkey(from, to)] = (WEIGHT[_wkey(from, to)] || 0) - 1; return WEIGHT[_wkey(from, to)]; }

  /* 실행 액션 구현부 — doc 을 실제 변형(전부 결정론) */
  const ACTIONS = {
    'insert-text':  (d) => { d.scenes[0].elements.push({ type: 'text', text: '새 텍스트', x: 40, y: 40 }); },
    'insert-image': (d) => { d.scenes[0].elements.push({ type: 'image', src: 'ph', x: 33, y: 51 }); },
    'insert-table': (d) => { d.scenes[0].elements.push({ type: 'table', rows: 3, cols: 3, x: 20, y: 20 }); },
    'crop':         (d) => { const im = d.scenes[0].elements.filter((e) => e.type === 'image').pop(); if (im) im.crop = '4:3'; },
    'shadow':       (d) => { const im = d.scenes[0].elements.filter((e) => e.type === 'image').pop(); if (im) im.shadow = 'soft'; },
    'align':        (d) => { d.scenes = d.scenes.map((s) => autoAlign(s).scene); },
    'group':        (d) => { d.scenes[0].groups = autoGroup(d.scenes[0]); },
    'delete':       (d) => { d.scenes[0].elements.pop(); },
    'save':         () => { _autosaveNow(); },
    'export':       (d) => { d._exported = (d._exported || 0) + 1; },
    'share':        (d) => { d._shared = true; },
  };
  const _autosaveNow = () => { SAVE.state = 'saved'; SAVE.count++; SAVE.savedAt = _now(); };

  /* 9) Instant Preview (§9) — 커밋 없는 순수 미리보기 */
  function previewFor(cmdId, doc) {
    if (!ACTIONS[cmdId]) return { ok: false, reason: 'no_preview' };
    const sim = clone(doc); ACTIONS[cmdId](sim);
    const b = JSON.stringify(doc), a = JSON.stringify(sim);
    return { ok: true, changed: b !== a, after: sim };
  }

  /* Execute — 유일한 커밋 경로. 가드→실행→기록→다음 제안(Continue) */
  function execute(cmdId, doc, opts) {
    const c = CMDS.find((x) => x.id === cmdId);
    if (!c) return { ok: false, reason: 'unknown_command' };
    const g = guard(cmdId, { doc, ...(opts || {}) });
    if (!g.ok && g.gate === 'confirm' && !(opts && opts.confirmed)) return { ok: false, needsConfirm: true, msg: g.msg };
    if (!g.ok && g.gate === 'block') return { ok: false, msg: g.msg };
    const before = clone(doc);
    if (ACTIONS[cmdId]) ACTIONS[cmdId](doc);
    c.usage++;
    if (ACTIONS[cmdId] && cmdId !== 'save') { _record(c.label, before, doc, opts && opts.source); markDirty(doc); }
    if (LAST_EXEC && (CHAIN[LAST_EXEC] || []).includes(cmdId)) accept(LAST_EXEC, cmdId);  /* 체인 수용 학습 */
    track('exec', { cmd: cmdId, sid: opts && opts.sid });
    journeyEvent(cmdId);
    LAST_EXEC = cmdId;
    return { ok: true, cmd: cmdId, next: predict(cmdId).slice(0, 3), motion: motionFor('press') };
  }
  const flowStep = (intent, doc, opts) => {           /* §1 파이프라인 한 번에 */
    const preds = predict(intent ? null : undefined);
    const pick = intent || (preds[0] && preds[0].id);
    return { predicted: preds.slice(0, 3), executed: execute(pick, doc, opts) };
  };

  /* ============================================================
     8·7) Universal Search (§8) — Ctrl+K Command Everywhere (§7)
     ============================================================ */
  function _score(q, text, tags) {
    const t = String(text || '').toLowerCase(), qq = q.toLowerCase();
    if (t === qq) return 100;
    if (t.startsWith(qq)) return 60;
    if (t.includes(qq)) return 30;
    const tg = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    if (tg.some((k) => String(k).toLowerCase().includes(qq))) return 20;
    return 0;
  }
  function search(q) {
    q = String(q || '').trim();
    if (!q) return { q, groups: [], total: 0 };
    const G = [];
    const add = (domain, items) => { const hit = items.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5); if (hit.length) G.push({ domain, items: hit }); };
    add('command', CMDS.map((c) => ({ id: c.id, label: c.label, key: c.key, score: _score(q, c.label, c.tags) + Math.min(c.usage, 5) })));
    if (PROJ()) add('project', PROJ().list().map((p) => ({ id: p.projectId, label: p.name, score: _score(q, p.name) })));
    if (TPL()) add('template', TPL().list().map((t) => ({ id: t.id, label: t.title, score: _score(q, t.title, t.uses) })));
    if (AS()) add('asset', AS().ASSETS.map((a) => ({ id: a.id, label: a.name, score: _score(q, a.name, a.tags) })));
    if (PL()) add('plugin', PL().listInstalled().map((p) => ({ id: p.id, label: p.name || p.id, score: _score(q, p.name || p.id) })));
    if (AG()) add('ai', AG().COMMANDS.map((c) => ({ id: c.id, label: c.label, score: _score(q, c.label, c.k) })));
    add('settings', [['set-theme', '테마 설정'], ['set-lang', '언어 설정'], ['set-shortcut', '단축키 설정'], ['set-account', '계정 설정']]
      .map(([id, label]) => ({ id, label, score: _score(q, label, ['설정', 'settings']) })));
    if (BR()) add('brand', BR().list().map((b) => ({ id: b.brandId, label: b.name, score: _score(q, b.name, ['브랜드', 'brand']) })));
    return { q, groups: G, total: G.reduce((s, g) => s + g.items.length, 0), domains: G.map((g) => g.domain) };
  }
  const SEARCH_DOMAINS = ['project', 'template', 'asset', 'plugin', 'command', 'ai', 'settings', 'brand'];

  /* ============================================================
     11) Smart Empty State (§11) — 빈 화면 금지
     ============================================================ */
  function emptyState(screen) {
    const tpls = TPL() ? TPL().list().slice(0, 3).map((t) => ({ id: t.id, title: t.title })) : [];
    const recent = PROJ() ? PROJ().list().slice(0, 3).map((p) => ({ id: p.projectId, name: p.name })) : [];
    const ai = AG() ? AG().COMMANDS.slice(0, 3).map((c) => ({ id: c.id, label: c.label })) : [];
    return { screen: screen || 'home', never_empty: true, recommend: tpls, recent, ai,
             cta: recent.length ? '이어서 만들기' : 'AI 로 시작하기' };
  }

  /* ============================================================
     15) Smart Defaults (§15) — 기본값은 AI 추천, 사용자는 수정만
     ============================================================ */
  const OVERRIDES = {};
  function defaultsFor(kind) {
    const b = BR() && BR().active ? BR().active() : null;
    const base = {
      poster:   { ratio: '3:4',  font: 'Pretendard', palette: b ? b.color.primary : '#4f46e5', anim: 'fade-up' },
      deck:     { ratio: '16:9', font: 'Pretendard', palette: b ? b.color.primary : '#4f46e5', anim: 'fade-up' },
      cardnews: { ratio: '1:1',  font: 'Pretendard', palette: b ? b.color.primary : '#4f46e5', anim: 'zoom-in' },
    }[kind] || { ratio: '16:9', font: 'Pretendard', palette: '#4f46e5', anim: 'fade-up' };
    return { ...base, ...(OVERRIDES[kind] || {}), source: OVERRIDES[kind] ? 'learned' : 'ai' };
  }
  function overrideDefault(kind, patch) { OVERRIDES[kind] = { ...(OVERRIDES[kind] || {}), ...patch }; return defaultsFor(kind); }

  /* ============================================================
     14) Adaptive Workspace (§14) — 패턴에 따라 배치 최적화
     ============================================================ */
  const LAYOUT = { panels: ['assets', 'layers', 'inspector'], shelf: [] };
  function layoutRecommend() {
    const top = CMDS.slice().sort((a, b) => b.usage - a.usage).filter((c) => c.usage > 0).slice(0, 4);
    const imgHeavy = (CMDS.find((c) => c.id === 'insert-image') || {}).usage >= 3;
    return {
      shelf: top.map((c) => ({ id: c.id, label: c.label, key: c.key })),           /* 자주 쓰는 것 1클릭 선반 */
      panels: imgHeavy ? ['assets', 'inspector', 'layers'] : LAYOUT.panels.slice(),/* 이미지 위주면 에셋 전면 */
      shortcuts: top.filter((c) => c.clicks > 1).map((c) => ({ id: c.id, suggest: '단축키 승격: ' + c.key })),
      reason: imgHeavy ? '이미지 작업 빈도 높음 → Asset 패널 전면' : '기본 배치',
    };
  }
  function layoutApply() { const r = layoutRecommend(); LAYOUT.panels = r.panels; LAYOUT.shelf = r.shelf; return clone(LAYOUT); }
  function layoutReset() { LAYOUT.panels = ['assets', 'layers', 'inspector']; LAYOUT.shelf = []; return clone(LAYOUT); }

  /* ============================================================
     19) Accessibility (§19)
     ============================================================ */
  const _lum = (hex) => {
    const h = String(hex).replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => { const [x, y] = [_lum(a), _lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
  function a11y() {
    return {
      keyboard: { fullCoverage: CMDS.every((c) => !!c.key), tabOrder: ['nav', 'toolbar', 'canvas', 'inspector'] },
      voice: { bridge: !!AG(), via: 'MK_AGENT.voice' },
      screenReader: { tree: ['app', 'nav', 'main', 'toolbar', 'canvas'], labeled: true },
      contrast: { fn: contrast, aa: (fg, bg) => contrast(fg, bg) >= 4.5 },
      colorBlind: { safePairs: [['#1f77b4', '#ff7f0e'], ['#2ca02c', '#9467bd']], avoid: ['red-green only'] },
    };
  }

  /* ============================================================
     20·21) Delight Moments (§20) + User Journey (§21)
     ============================================================ */
  const JOURNEY_STEPS = ['first_run', 'first_project', 'first_export', 'first_ai', 'first_share', 'first_market'];
  const JOURNEY = { done: { first_run: _now() }, delights: [] };
  const DELIGHT = {
    first_project: { fx: 'confetti-mini', msg: '첫 작품이 시작됐어요!' },
    first_export:  { fx: 'confetti',      msg: '첫 내보내기 완료 — 세상에 나갈 준비 끝!' },
    first_ai:      { fx: 'sparkle',       msg: 'AI 와 첫 합작이에요.' },
    first_share:   { fx: 'wave',          msg: '처음으로 공유했어요!' },
    first_market:  { fx: 'fireworks',     msg: '마켓 데뷔를 축하해요!' },
  };
  function _milestone(step) {
    if (JOURNEY.done[step]) return null;
    JOURNEY.done[step] = _now();
    const d = DELIGHT[step];
    if (d) { const rec = { step, ...d, motion: motionFor('delight'), at: _now() }; JOURNEY.delights.push(rec); return rec; }
    return { step, at: _now() };
  }
  function journeyEvent(cmdId) {
    if (cmdId === 'new-project') return _milestone('first_project');
    if (cmdId === 'export') return _milestone('first_export');
    if (cmdId === 'ai-ask') return _milestone('first_ai');
    if (cmdId === 'share') return _milestone('first_share');
    if (cmdId === 'market-open') return _milestone('first_market');
    return null;
  }
  const journey = () => ({
    steps: JOURNEY_STEPS.map((s) => ({ step: s, done: !!JOURNEY.done[s], at: JOURNEY.done[s] || null })),
    progress: JOURNEY_STEPS.filter((s) => JOURNEY.done[s]).length + '/' + JOURNEY_STEPS.length,
    delights: clone(JOURNEY.delights),
  });

  /* ============================================================
     23) Testing (§23) — 6 페르소나 시나리오 시뮬레이션
     ============================================================ */
  const PERSONAS = {
    novice:     { label: '초보 사용자', script: ['new-project', 'insert-text', 'export'] },
    expert:     { label: '전문가',     script: ['new-project', 'insert-image', 'crop', 'shadow', 'align', 'group', 'export', 'share'] },
    teacher:    { label: '교사',       script: ['new-project', 'ai-ask', 'insert-table', 'align', 'export'] },
    designer:   { label: '디자이너',   script: ['new-project', 'insert-image', 'crop', 'align', 'brand-check', 'export'] },
    enterprise: { label: '기업',       script: ['new-project', 'brand-check', 'insert-text', 'align', 'export', 'share'] },
    student:    { label: '학생',       script: ['new-project', 'insert-image', 'ai-ask', 'export'] },
  };
  function personaRun(key) {
    const p = PERSONAS[key]; if (!p) return { ok: false, reason: 'unknown_persona' };
    const doc = { title: p.label, scenes: [{ id: 's1', elements: [] }] };
    const sid = 'p-' + key + '-' + (SEQ++);
    track('open', { sid });
    let clicks = 0, followedChain = 0;
    p.script.forEach((cmd, i) => {
      if (i === 1) track('pick_template', { sid });
      if (i >= 1) track('edit', { sid });
      const prevTop = predict()[0];
      const r = execute(cmd, doc, { sid, confirmed: true });
      if (r.ok) { clicks += (CMDS.find((c) => c.id === cmd) || { clicks: 1 }).clicks; if (prevTop && prevTop.id === cmd) followedChain++; }
      if (cmd === 'export') track('export', { sid });
    });
    track('task_done', { sid });
    return { ok: true, persona: p.label, steps: p.script.length, clicks,
             clicksPerStep: +(clicks / p.script.length).toFixed(2), followedChain, doc };
  }
  const personaMatrix = () => Object.keys(PERSONAS).map((k) => personaRun(k));

  /* ============================================================
     24) Deliverables (§24) — 원칙·가이드·리포트
     ============================================================ */
  const PRINCIPLES = [
    { id: 'shortest-path', text: '생각→클릭→결과 최단 경로' },
    { id: 'zero-friction', text: '확인은 파괴적 작업에만, 저장·이름·정렬은 자동' },
    { id: 'context-ui', text: 'UI 는 선택을 따라 변한다' },
    { id: 'progressive', text: '전문 기능은 필요할 때만 나타난다' },
    { id: 'undo-everything', text: 'AI 포함 모든 작업 100% Undo' },
    { id: 'never-empty', text: '빈 화면 금지 — 항상 추천·최근·AI' },
    { id: 'keyboard-first', text: '모든 명령에 단축키와 팔레트' },
    { id: 'motion-150-250', text: '모든 모션 150~250ms' },
  ];
  function usabilityReport() {
    const m = metrics(), f = funnel(), ps = Object.keys(PERSONAS).length;
    return { metrics: m, funnel: f, personas: ps,
             oneClick: CMDS.filter((c) => c.clicks === 1).length + '/' + CMDS.length,
             maxClicks: Math.max(...CMDS.map((c) => c.clicks)),
             keyboardCoverage: CMDS.every((c) => !!c.key),
             motionCompliant: Object.values(MOTION).every((x) => x.ms >= 150 && x.ms <= 250),
             undoDepth: undoDepth(), journey: journey().progress };
  }

  /* ============================================================
     공개 표면
     ============================================================ */
  return {
    /* 클록 */ _now, _tick, SEC, MIN,
    /* §16 */ MOTION, motionRegister, motionFor,
    /* §12·§18 */ CMDS, KEYMAP, cmdRegister, cmdRemap, keyboardMap,
    /* §5 */ context, setSelection, _ctx: CTX,
    /* §3·§4 */ toolbarFor, toolsFor, TOOLBARS, PRO_TOOLS, PRO_THRESHOLD,
    /* §10 */ undo, redo, undoDepth, _record,
    /* §2 */ autoName, autoAlign, autoGroup, autoSort, markDirty, saveState, confirmPolicy, DEBOUNCE,
    /* §17 */ guard,
    /* §13·§22 */ track, funnel, metrics, LOG, FUNNEL_STEPS,
    /* §1·§6 */ predict, accept, dismiss, execute, flowStep, CHAIN, ACTIONS,
    /* §9 */ previewFor,
    /* §7·§8 */ search, SEARCH_DOMAINS,
    /* §11 */ emptyState,
    /* §15 */ defaultsFor, overrideDefault,
    /* §14 */ layoutRecommend, layoutApply, layoutReset,
    /* §19 */ a11y, contrast,
    /* §20·§21 */ journey, journeyEvent, JOURNEY_STEPS, DELIGHT,
    /* §23 */ PERSONAS, personaRun, personaMatrix,
    /* §24 */ PRINCIPLES, usabilityReport,
  };
})();
