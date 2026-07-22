/* ============================================================
   K-MAKER Playground 앱 셸 — 내비 · variant 전환 · 해시 라우팅
   ============================================================ */
window.PG = (() => {
  const NAV = [
    ['foundations', '🎨', 'Foundations'], ['components', '🧩', 'Components'],
    ['patterns', '📐', 'Patterns'], ['screens', '🖥', 'Screens'],
    ['--div'], 
    ['home', '🏠', 'Home'], ['library', '🗂', 'Library'], ['templates', '📂', 'Templates'], ['assets', '🗄', 'Assets'], ['brand', '🏷', 'Brand'], ['team', '👥', 'Team'], ['editor', '✏️', 'Editor'],
    ['video', '🎬', 'Video'], ['photo', '🖼', 'Photo'], ['ai', '🤖', 'AI'],
    ['--div'],
    ['export', '📤', 'Export'], ['plugins', '🔌', 'Plugins'], ['market', '🛒', 'Market'], ['admin', '🛡', 'Admin'], ['dev', '📡', 'Dev'], ['mobile', '📱', 'Mobile'], ['agent', '🧠', 'Agent'], ['flow', '🌊', 'Flow'], ['dls', '🧭', 'DLS'], ['ops', '⚙️', 'Ops'], ['simple', '🌱', 'Simple'], ['invisible', '🫥', 'Invisible'], ['constitution', '📜', 'Const'], ['audit', '🔟', 'Audit'], ['homex', '🎪', 'HomeX'], ['nav', '🗺', 'Nav'],
  ];

  const state = {
    screen: 'foundations',
    variants: { home: 'A', templates: 'A', editor: 'Design' },
    browser: { type: 'all', style: '전체' },
    editor: { doc: null, sceneIdx: 0, selEl: null, menu: 'text', mode: 'design' },
    navMode: 'full',
  };

  function loadEditorDoc(templateId) {
    const tpl = window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === templateId) || window.MK_SAMPLE.TEMPLATES[0];
    state.editor.doc = JSON.parse(JSON.stringify(tpl)); // 원본 보호 — 샘플 편집은 메모리에서만
    state.editor.sceneIdx = 0; state.editor.selEl = null;
    state.editor.mode = tpl.contentType === 'video' ? 'video' : 'design';
  }

  /* AI 등 외부에서 만든 doc 객체를 그대로 실어 Editor 진입 */
  function openEditorDoc(doc) {
    state.editor.doc = doc;
    state.editor.sceneIdx = 0; state.editor.selEl = null;
    state.editor.mode = doc.contentType === 'video' ? 'video' : 'design';
    state.variants.editor = state.editor.mode === 'video' ? 'Video' : 'Design';
    go('editor');
  }

  function openEditor(templateId) {
    loadEditorDoc(templateId);
    state.variants.editor = state.editor.mode === 'video' ? 'Video' : 'Design'; // 템플릿 유형이 모드 결정
    go('editor');
  }

  function go(screen) {
    state.screen = screen;
    location.hash = '#/' + screen;
    render();
  }

  /* Round 27 — 🌱 단순 모드: MK_SIMPLE 판정으로 내비를 초보자 시야로 필터.
     검수 환경 기본값은 'full' — 기존 화면·테스트 무영향. */
  function toggleNavMode() { state.navMode = state.navMode === 'simple' ? 'full' : 'simple'; render(); }
  function navList() {
    if (state.navMode !== 'simple' || !window.MK_SIMPLE) return NAV;
    const vis = window.MK_SIMPLE.navFor({ edits: 0 });
    return NAV.filter(([k]) => k !== '--div' && (vis.includes(k) || k === 'simple'));
  }

  function render() {
    const scr = window.MK_SCREENS[state.screen];
    /* 내비 */
    const modeBtn = window.MK_SIMPLE ? `<div class="pg-nav-div"></div><button class="pg-nav-item" data-navmode><span class="ico">${state.navMode === 'simple' ? '🗂' : '🌱'}</span><span class="txt">${state.navMode === 'simple' ? '전체 보기' : '단순 모드'}</span></button>` : '';
    document.getElementById('pgNav').innerHTML = navList().map(([k, ico, n]) =>
      k === '--div' ? `<div class="pg-nav-div"></div>` :
      `<button class="pg-nav-item ${state.screen === k ? 'on' : ''}" data-nav="${k}"><span class="ico">${ico}</span><span class="txt">${n}</span></button>`).join('') + modeBtn;
    document.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => go(b.dataset.nav));
    const mb = document.querySelector('[data-navmode]'); if (mb) mb.onclick = toggleNavMode;
    /* 헤더 + variant 전환 */
    const v = state.variants[state.screen] || scr.variants[0];
    document.getElementById('pgTitle').textContent = scr.title;
    document.getElementById('pgVariants').innerHTML = scr.variants.length > 1
      ? scr.variants.map((x) => `<button class="pg-variant ${x === v ? 'on' : ''}" data-var="${x}">${x}</button>`).join('') : '';
    document.querySelectorAll('[data-var]').forEach((b) => b.onclick = () => { state.variants[state.screen] = b.dataset.var; render(); });
    /* 본문 */
    document.body.classList.toggle('pg-chromeless', !!scr.chromeless);
    const body = document.getElementById('pgBody');
    body.className = 'pg-body' + (scr.flush ? ' flush' : '');
    body.innerHTML = scr.render(v);
    if (scr.mount) scr.mount(body);
  }

  function boot() {
    if (boot._done) return;                      /* 이중 발화 방어 */
    boot._done = true;
    const h = (location.hash || '').replace('#/', '');
    if (window.MK_SCREENS[h]) state.screen = h;
    if (/[?&]review=true/.test(location.search)) state.screen = 'review';   /* 쿼리 진입 지원 */
    window.addEventListener('hashchange', () => {
      const k = (location.hash || '').replace('#/', '');
      if (window.MK_SCREENS[k] && k !== state.screen) { state.screen = k; render(); }
    });
    render();
  }

  return { state, go, render, boot, openEditor, openEditorDoc, loadEditorDoc, toggleNavMode };
})();
document.addEventListener('DOMContentLoaded', () => PG.boot());
