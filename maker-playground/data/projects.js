/* ============================================================
   K-MAKER Project System v1  —  window.MK_PROJ
   ------------------------------------------------------------
   Project는 K-MAKER의 **최상위 단위**. 구조(지시서):
     Project → Template → Scenes → Assets → AI History → Export History
   ------------------------------------------------------------
   스키마:
     projectId · name · templateId(원본 참조) · contentType ·
     doc(작업본 — scenes + engine, Editor가 그대로 탑재) ·
     createdAt · updatedAt · shared · fav · trashed ·
     aiHistory[{ at, prompt, action }] ·
     exportHistory[{ at, format }]
   ------------------------------------------------------------
   ⚠ 샘플 데이터 — 실DB·저장 없음(세션 메모리). 이 스키마가
   그대로 DB 레코드의 기준이 된다.
   ============================================================ */
window.MK_PROJ = (() => {

  const now = () => Date.now();
  const H = 3600e3, D = 24 * H;

  /* ---- 상대 시각 표기 ---- */
  function ago(ts) {
    const d = now() - ts;
    if (d < H) return Math.max(1, Math.round(d / 60e3)) + '분 전';
    if (d < D) return Math.round(d / H) + '시간 전';
    if (d < 30 * D) return Math.round(d / D) + '일 전';
    return new Date(ts).toISOString().slice(0, 10);
  }

  let seq = 0;
  const id = () => 'pj-' + (++seq) + '-' + now().toString(36);

  /* ---- 템플릿에서 작업본(doc) 생성 ---- */
  function docFrom(templateId) {
    const r = window.MK_TPL.resolve(templateId);
    if (!r) return null;
    const src = window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === templateId);
    const doc = JSON.parse(JSON.stringify(src || r.template));
    doc.engine = {
      styleId: r.template.styleId, style: r.style,
      animationId: r.template.animationId, animation: r.animation,
      assetIds: r.template.assetIds, ai: r.ai,
    };
    return doc;
  }

  /* ---- 저장소 (세션 메모리) + 샘플 시드 ---- */
  const STORE = [];

  function seed() {
    const mk = (tplId, name, opts = {}) => {
      const doc = docFrom(tplId);
      const p = {
        projectId: id(), name, templateId: tplId, contentType: doc.contentType, doc,
        createdAt: now() - (opts.age || D), updatedAt: now() - (opts.upd || H),
        shared: !!opts.shared, fav: !!opts.fav, trashed: !!opts.trashed,
        aiHistory: opts.ai || [], exportHistory: opts.ex || [],
      };
      STORE.push(p);
      return p;
    };
    mk('smp-pres-01', '4학년 과학 화산 발표', { age: 6 * D, upd: 2 * H, fav: true,
      ai: [{ at: now() - 5 * D, prompt: '화산 발표자료 만들어줘', action: '초안 생성' }, { at: now() - 2 * H, prompt: '제목 더 짧게', action: '텍스트 다시 작성' }],
      ex: [{ at: now() - 3 * D, format: 'PPT' }] });
    mk('smp-card-01', '7월 학급 소식', { age: 3 * D, upd: 5 * H, shared: true,
      ex: [{ at: now() - D, format: 'PNG' }] });
    mk('smp-vid-01', '여름 방학식 안내 영상', { age: 2 * D, upd: 26 * H, shared: true, fav: true,
      ai: [{ at: now() - 2 * D, prompt: '방학식 안내 영상 만들어줘', action: '초안 생성' }] });
    mk('smp-work-01', '수학 각도 복습 학습지', { age: 9 * D, upd: 4 * D,
      ex: [{ at: now() - 4 * D, format: 'PDF' }, { at: now() - 4 * D, format: 'PNG' }] });
    mk('smp-post-01', '알뜰시장 포스터 (지난 학기)', { age: 40 * D, upd: 35 * D, trashed: true });
  }
  let seeded = false;
  const ensure = () => { if (!seeded) { seeded = true; seed(); } };

  /* ---- 조회 ---- */
  const get = (pid) => { ensure(); return STORE.find((p) => p.projectId === pid) || null; };
  const live = () => STORE.filter((p) => !p.trashed);
  const list = (section = 'recent') => {
    ensure();
    if (section === 'trash') return STORE.filter((p) => p.trashed).sort((a, b) => b.updatedAt - a.updatedAt);
    let l = live();
    if (section === 'fav') l = l.filter((p) => p.fav);
    if (section === 'shared') l = l.filter((p) => p.shared);
    return [...l].sort((a, b) => b.updatedAt - a.updatedAt);
  };

  /* ---- 생성 ---- */
  function createFromTemplate(templateId, name) {
    ensure();
    const doc = docFrom(templateId);
    if (!doc) return null;
    const p = { projectId: id(), name: name || doc.title.replace(' (샘플)', ''), templateId, contentType: doc.contentType, doc,
      createdAt: now(), updatedAt: now(), shared: false, fav: false, trashed: false, aiHistory: [], exportHistory: [] };
    STORE.push(p);
    return p;
  }
  /* AI 등 이미 만들어진 doc으로 생성 */
  function createFromDoc(doc, name, aiEntry) {
    ensure();
    const p = { projectId: id(), name: name || doc.title, templateId: doc.templateId || null, contentType: doc.contentType, doc,
      createdAt: now(), updatedAt: now(), shared: false, fav: false, trashed: false,
      aiHistory: aiEntry ? [{ at: now(), ...aiEntry }] : [], exportHistory: [] };
    STORE.push(p);
    return p;
  }

  /* ---- 액션 ---- */
  const touch = (pid) => { const p = get(pid); if (p) p.updatedAt = now(); return p; };
  const rename = (pid, name) => { const p = get(pid); if (p && name.trim()) { p.name = name.trim(); touch(pid); } return p; };
  const toggleFav = (pid) => { const p = get(pid); if (p) p.fav = !p.fav; return p; };
  const toggleShare = (pid) => { const p = get(pid); if (p) { p.shared = !p.shared; touch(pid); } return p; };
  const trash = (pid) => { const p = get(pid); if (p) p.trashed = true; return p; };
  const restore = (pid) => { const p = get(pid); if (p) p.trashed = false; return p; };
  const purge = (pid) => { const i = STORE.findIndex((p) => p.projectId === pid); if (i >= 0) STORE.splice(i, 1); };
  function duplicate(pid) {
    const p = get(pid);
    if (!p) return null;
    const c = JSON.parse(JSON.stringify(p));
    c.projectId = id(); c.name = p.name + ' (사본)';
    c.createdAt = now(); c.updatedAt = now(); c.shared = false; c.trashed = false;
    STORE.push(c);
    return c;
  }

  /* ---- 기록 ---- */
  const logAI = (pid, prompt, action) => { const p = get(pid); if (p) { p.aiHistory.push({ at: now(), prompt, action }); touch(pid); } };
  const logExport = (pid, format) => { const p = get(pid); if (p) { p.exportHistory.push({ at: now(), format }); touch(pid); } };

  /* ---- Editor 연결 — 프로젝트 열기 ---- */
  let currentId = null;
  function open(pid) {
    const p = get(pid);
    if (!p) return null;
    currentId = pid;
    touch(pid);
    /* Workspace가 핵심 작업 공간 — Editor는 그 안의 기능 (미로드 시 폴백) */
    if (window.MK_WS) window.MK_WS.enter(pid);
    else PG.openEditorDoc(p.doc);
    return p;
  }
  const current = () => currentId ? get(currentId) : null;

  /* ---- R36 영속 브리지 — MK_LIVE가 localStorage 왕복에 사용 ---- */
  const serialize = () => { ensure(); return JSON.stringify(STORE); };
  const hydrate = (raw) => {
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr) || !arr.length) return false;
      seeded = true;                                   /* 시드 대신 저장본이 정답 */
      STORE.splice(0, STORE.length);
      arr.forEach((p) => { if (p && p.projectId && p.doc) STORE.push(p); });
      return STORE.length > 0;
    } catch (_) { return false; }
  };

  return { ago, list, get, createFromTemplate, createFromDoc, rename, toggleFav, toggleShare, trash, restore, purge, duplicate, logAI, logExport, open, current, serialize, hydrate };
})();
