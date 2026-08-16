/* ============================================================
   K-MAKER Playground 앱 셸 — 내비 · variant 전환 · 해시 라우팅
   ============================================================ */
window.PG = (() => {
  const NAV = [
    ['foundations', '🎨', 'Foundations'], ['components', '🧩', 'Components'],
    ['patterns', '📐', 'Patterns'], ['screens', '🖥', 'Screens'],
    ['--div'], 
    ['home', '🏠', 'Home'], ['library', '🗂', 'Library'], ['templates', '📂', 'Templates'], ['assets', '🗄', 'Assets'], ['brand', '🏷', 'Brand'], ['team', '👥', 'Team'], ['editor', '✏️', 'Editor'],
    ['video', '🎬', 'Video'], ['tbuilder', '🏗', 'TplBuilder'], ['photo', '🖼', 'Photo'], ['ai', '🤖', 'AI'],
    ['--div'],
    ['export', '📤', 'Export'], ['plugins', '🔌', 'Plugins'], ['market', '🛒', 'Market'], ['admin', '🛡', 'Admin'], ['dev', '📡', 'Dev'], ['mobile', '📱', 'Mobile'], ['agent', '🧠', 'Agent'], ['flow', '🌊', 'Flow'], ['dls', '🧭', 'DLS'], ['ops', '⚙️', 'Ops'], ['simple', '🌱', 'Simple'], ['invisible', '🫥', 'Invisible'], ['constitution', '📜', 'Const'], ['audit', '🔟', 'Audit'], ['homex', '🎪', 'HomeX'], ['nav', '🗺', 'Nav'], ['journey', '🛤', 'Journey'], ['ftue', '⏱', 'FTUE'], ['easy', '⚡', 'Easy'],
  ];

  /* R77 — /maker 제품 진입: MK_PRODUCT 깃발이 있으면 검수 화면을
     내비와 라우팅 모두에서 차단한다. 깃발이 없으면(플레이그라운드
     직접 진입) 아래 어떤 분기도 타지 않아 검수 환경은 무영향. */
  const PRODUCT = () => !!window.MK_PRODUCT;
  const PRODUCT_NAV = ['home', 'library', 'templates', 'assets', 'brand', 'editor', 'video', 'photo', 'ai', 'export'];
  /* R87 — 내비 목록과 라우팅 허용은 다른 물음이다. create·workspace·projects·animation은
     내비에 없을 뿐 제품 동선의 본체(칩→create, 열기→workspace, 이어서→projects,
     워크스페이스→animation)인데, R77이 내비 목록으로 라우팅까지 재단해 홈의 모든
     제작 진입이 home으로 튕겼다 — 화면이 이미 home이라 「눌러도 아무 반응 없음」.
     검수 화면 차단(R77의 의도)은 그대로: 아래 4종 외 비내비 화면은 여전히 home. */
  /* R128 — studio: 준호 전용 제작대. 내비에는 안 올린다(학생 화면이 아니다) —
     직통 주소(#/studio)로만 들어간다. 제품 가드는 통과시켜야 keduclass.com
     /maker/#/studio 가 산다. */
  const PRODUCT_ROUTES = PRODUCT_NAV.concat(['create', 'workspace', 'projects', 'animation', 'studio']);
  const guard = (k) => (PRODUCT() && !PRODUCT_ROUTES.includes(k)) ? 'home' : k;

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
    state.screen = guard(screen);
    screen = state.screen;
    location.hash = '#/' + screen;
    render();
  }

  /* Round 27 — 🌱 단순 모드: MK_SIMPLE 판정으로 내비를 초보자 시야로 필터.
     검수 환경 기본값은 'full' — 기존 화면·테스트 무영향. */
  function toggleNavMode() { state.navMode = state.navMode === 'simple' ? 'full' : 'simple'; render(); }
  function navList() {
    const base = PRODUCT() ? NAV.filter(([k]) => PRODUCT_NAV.includes(k)) : NAV;
    if (state.navMode !== 'simple' || !window.MK_SIMPLE) return base;
    const vis = window.MK_SIMPLE.navFor({ edits: 0 });
    return base.filter(([k]) => k !== '--div' && (vis.includes(k) || (!PRODUCT() && k === 'simple')));
  }

  function render() {
    const scr = window.MK_SCREENS[state.screen];
    /* 내비 */
    const modeBtn = window.MK_SIMPLE ? `<div class="pg-nav-div"></div><button class="pg-nav-item" data-navmode><span class="ico">${state.navMode === 'simple' ? '🗂' : '🌱'}</span><span class="txt">${state.navMode === 'simple' ? '전체 보기' : '단순 모드'}</span></button>` : '';
    /* 생태계 접점(2026-08-10) — 케이에듀로 돌아가는 문. R92가 「자체 내비 보유」로
       context 모드를 걸었지만 정작 자체 출구가 이주에서 누락돼, 탈출 수단이 해시
       히스토리 뒤로가기 연타뿐이었다(준호 내비 전수 감사에서 발견). */
    const exitBtn = `<button class="pg-nav-item" data-navexit><span class="ico">🏠</span><span class="txt">케이에듀</span></button><div class="pg-nav-div"></div>`;
    document.getElementById('pgNav').innerHTML = exitBtn + navList().map(([k, ico, n]) =>
      k === '--div' ? `<div class="pg-nav-div"></div>` :
      `<button class="pg-nav-item ${state.screen === k ? 'on' : ''}" data-nav="${k}"><span class="ico">${ico}</span><span class="txt">${n}</span></button>`).join('') + modeBtn;
    document.querySelectorAll('[data-nav]').forEach((b) => b.onclick = () => go(b.dataset.nav));
    const xb = document.querySelector('[data-navexit]');
    if (xb) xb.onclick = () => { if (window.KEDU_BACK && window.KEDU_BACK.go) window.KEDU_BACK.go(); else location.href = '/'; };
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
    if (PRODUCT()) state.screen = 'home';                     /* 제품 기본 진입 = 홈 */
    const h = (location.hash || '').replace('#/', '');
    if (window.MK_SCREENS[h]) state.screen = guard(h);
    if (!PRODUCT() && /[?&]review=true/.test(location.search)) state.screen = 'review';   /* 쿼리 진입 지원(검수 전용) */
    window.addEventListener('hashchange', () => {
      const k = guard((location.hash || '').replace('#/', ''));
      if (window.MK_SCREENS[k] && k !== state.screen) { state.screen = k; render(); }
    });
    render();
  }

  return { state, go, render, boot, openEditor, openEditorDoc, loadEditorDoc, toggleNavMode };
})();
document.addEventListener('DOMContentLoaded', () => PG.boot());
