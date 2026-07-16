/* ============================================================
   K-MAKER Playground 앱 셸 — 내비 · variant 전환 · 해시 라우팅
   ============================================================ */
window.PG = (() => {
  const NAV = [
    ['foundations', '🎨', 'Foundations'], ['components', '🧩', 'Components'],
    ['patterns', '📐', 'Patterns'], ['screens', '🖥', 'Screens'],
    ['--div'], 
    ['home', '🏠', 'Home'], ['templates', '📂', 'Templates'], ['editor', '✏️', 'Editor'],
    ['video', '🎬', 'Video'], ['photo', '🖼', 'Photo'], ['ai', '🤖', 'AI'],
    ['--div'],
    ['export', '📤', 'Export'],
  ];

  const state = {
    screen: 'foundations',
    variants: { home: 'A', templates: 'A', editor: 'Design' },
    browser: { type: 'all', style: '전체' },
    editor: { doc: null, sceneIdx: 0, selEl: null, menu: 'text', mode: 'design' },
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

  function render() {
    const scr = window.MK_SCREENS[state.screen];
    /* 내비 */
    document.getElementById('pgNav').innerHTML = NAV.map(([k, ico, n]) =>
      k === '--div' ? `<div class="pg-nav-div"></div>` :
      `<button class="pg-nav-item ${state.screen === k ? 'on' : ''}" data-nav="${k}"><span class="ico">${ico}</span><span class="txt">${n}</span></button>`).join('');
    document.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => go(b.dataset.nav));
    /* 헤더 + variant 전환 */
    const v = state.variants[state.screen] || scr.variants[0];
    document.getElementById('pgTitle').textContent = scr.title;
    document.getElementById('pgVariants').innerHTML = scr.variants.length > 1
      ? scr.variants.map((x) => `<button class="pg-variant ${x === v ? 'on' : ''}" data-var="${x}">${x}</button>`).join('') : '';
    document.querySelectorAll('[data-var]').forEach((b) => b.onclick = () => { state.variants[state.screen] = b.dataset.var; render(); });
    /* 본문 */
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
    window.addEventListener('hashchange', () => {
      const k = (location.hash || '').replace('#/', '');
      if (window.MK_SCREENS[k] && k !== state.screen) { state.screen = k; render(); }
    });
    render();
  }

  return { state, go, render, boot, openEditor, openEditorDoc, loadEditorDoc };
})();
document.addEventListener('DOMContentLoaded', () => PG.boot());
