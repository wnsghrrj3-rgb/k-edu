/* ============================================================
   화면: Home v2 — Sprint 01(UX)·02(UI)·03(구현 명세) 프로덕션 구현
   ------------------------------------------------------------
   구조: Header / Hero(질문+AI 입력) / Quick Create 6칩 /
         [Continue Editing + Recent ≤5 | Empty State] / Recommended ≤6
   데이터: MK_PROJ(실) · MK_TPL(실) · MK_AI(초안 생성) — Placeholder 아님.
   오버레이: 검색 팔레트(`/`·헤더 아이콘) — Hero=만들기 / 검색=찾기.
   원칙: teal 강조 ≤3 · 그리드 카드 무보더 · 정적 그림자 0 ·
         모션 120~260ms·이동 ≤8px · Home에 관리 기능 없음(열기 전용).
   스타일 = playground.css `h2-*` (구 hv-*는 create.js 공유로 유지).
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.home = (() => {
  const M = () => window.MK;

  /* ---- 상수 (지시 순서 고정) ---- */
  const CHIPS = [
    ['presentation', '발표'], ['cardnews', '카드뉴스'], ['video', '영상'],
    ['poster', '포스터'], ['worksheet', '학습지'], ['activity', '활동자료'],
  ];
  const PLACEHOLDERS = [
    '예: 학교폭력 예방 발표자료 만들어줘',
    '예: 여름 방학 안전 안내 카드뉴스 만들어줘',
    '예: 4학년 화산 학습지 만들어줘',
    '예: 알뜰시장 홍보 포스터 만들어줘',
  ];
  const EMPTY_PROMPTS = [
    '우리 반 규칙 포스터 만들어줘',
    '2학기 첫 수업 발표자료 만들어줘',
    '가정통신문 카드뉴스 만들어줘',
  ];
  const SEASON = { 3: '새 학기', 4: '봄 행사', 5: '가정의 달', 6: '학기 마무리', 7: '방학 안내', 8: '개학 준비', 9: '2학기', 10: '가을 행사', 11: '학예회', 12: '겨울 방학', 1: '새해', 2: '학년 마무리' };

  /* ---- 데이터 (섹션별 격리 — 한 소스 실패가 Home 전체를 막지 않음) ---- */
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { console.warn('[home]', e.message); return fallback; } };
  const recentAll = () => safe(() => window.MK_PROJ.list('recent'), []);
  const typeName = (key) => safe(() => window.MK_SAMPLE.TYPES.find((t) => t.key === key).name, key);
  const recoTpls = () => safe(() => {
    const l = window.MK_TPL.list();
    return [...l].sort((a, b) => (b.ai.recommended ? 1 : 0) - (a.ai.recommended ? 1 : 0)).slice(0, 5);
  }, []);

  /* ---- 조각 렌더러 ---- */
  const esc = (s) => window.MK.esc(s);

  const thumb = (doc, ratioBox) => {
    const s = doc && doc.scenes && doc.scenes[0];
    if (!s) return `<span class="h2-thumb-empty" aria-hidden="true">${esc((doc && doc.title || '·').slice(0, 1))}</span>`;
    const svg = M().sceneThumb(s).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ');
    return `<span class="h2-thumb-fit${ratioBox ? ' box' : ''}" aria-hidden="true">${svg}</span>`;
  };

  const rHeader = () => `<header class="h2-header" id="h2Header">
    <button class="h2-logo" data-h2-logo aria-label="K-MAKER 홈">K-MAKER</button>
    <nav class="h2-nav" aria-label="주 메뉴">
      <button class="h2-link" data-h2-go="projects">최근 작업</button>
      <button class="h2-link" data-h2-go="projects">내 프로젝트</button>
      <button class="h2-icon mk-tooltip" data-h2-search data-tip="검색 ( / )" aria-label="프로젝트·템플릿 검색">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      </button>
      <span class="h2-avatar" aria-label="사용자: 준호">준</span>
    </nav>
  </header>`;

  const rHero = () => `<section class="h2-hero" aria-label="새로 만들기">
    <h1 class="h2-q">무엇을 만들까요?</h1>
    <form class="h2-input" id="h2Form">
      <input id="h2Ai" type="text" autocomplete="off" enterkeyhint="go"
             aria-label="무엇을 만들까요" placeholder="${esc(PLACEHOLDERS[0])}">
      <button type="submit" class="h2-make" id="h2Make" aria-label="만들기">
        <span class="tx">만들기</span><span class="ic" aria-hidden="true">↑</span>
      </button>
    </form>
    <div class="h2-flow" id="h2Flow" aria-live="polite"></div>
    <div class="h2-chips" role="list" aria-label="유형으로 시작">
      ${CHIPS.map(([k, nm]) => `<button class="h2-chip" role="listitem" data-h2-chip="${k}">${nm}</button>`).join('')}
    </div>
  </section>`;

  const rContinue = (p) => `<section class="h2-sec h2-continue-wrap" aria-label="이어서 만들기">
    <button class="h2-continue" data-h2-open="${p.projectId}"
      aria-label="이어서 만들기, ${esc(p.name)}, ${esc(typeName(p.contentType))}, ${esc(window.MK_PROJ.ago(p.updatedAt))}">
      <span class="h2-cthumb">${thumb(p.doc)}</span>
      <span class="h2-cbody">
        <small class="h2-cap">이어서 만들기</small>
        <b class="h2-ctitle">${esc(p.name)}</b>
        <small class="h2-meta">${esc(typeName(p.contentType))} · 장면 ${p.doc.scenes.length} · ${esc(window.MK_PROJ.ago(p.updatedAt))}</small>
      </span>
      <span class="h2-arrow" aria-hidden="true">→</span>
    </button>
  </section>`;

  const rRecent = (list) => `<section class="h2-sec" aria-labelledby="h2RecentT">
    <div class="h2-sec-head">
      <h2 id="h2RecentT">최근 작업</h2>
      <button class="h2-link" data-h2-go="projects">전체 보기 →</button>
    </div>
    <div class="h2-row cards5">
      ${list.map((p) => `<button class="h2-card" data-h2-open="${p.projectId}"
          aria-label="${esc(p.name)}, ${esc(typeName(p.contentType))}, ${esc(window.MK_PROJ.ago(p.updatedAt))}">
        <span class="h2-cardthumb">${thumb(p.doc, true)}</span>
        <b class="h2-cardtitle">${esc(p.name)}</b>
        <small class="h2-meta">${esc(typeName(p.contentType))} · ${esc(window.MK_PROJ.ago(p.updatedAt))}</small>
      </button>`).join('')}
    </div>
  </section>`;

  const rEmpty = () => `<section class="h2-sec h2-empty" aria-label="시작하기">
    <h2 class="h2-empty-t">첫 작품을 1분 안에 만들어 볼까요?</h2>
    <div class="h2-empty-list">
      ${EMPTY_PROMPTS.map((p) => `<button class="h2-empty-row" data-h2-prompt="${esc(p)}">
        <span class="glyph" aria-hidden="true">✦</span>${esc(p)}</button>`).join('')}
    </div>
  </section>`;

  const rReco = (list) => {
    const m = new Date().getMonth() + 1;
    return `<section class="h2-sec" aria-labelledby="h2RecoT">
    <div class="h2-sec-head">
      <h2 id="h2RecoT">이런 걸 만들어 보세요 <small class="h2-season">${m}월 · ${SEASON[m] || '추천'}</small></h2>
      <button class="h2-link" data-h2-go="templates">템플릿 더 보기 →</button>
    </div>
    <div class="h2-row cards5">
      ${list.map((t) => `<button class="h2-card" data-h2-tpl="${t.templateId}"
          aria-label="${esc(t.title)}, ${esc(t.ratio)}${t.ai.recommended ? ', AI 추천' : ''}">
        <span class="h2-cardthumb">${thumb(t, true)}
          ${t.ai.recommended ? '<span class="h2-badge-ai">✦ AI 추천</span>' : ''}
          <span class="h2-badge-ratio">${esc(t.ratio)}</span>
        </span>
        <b class="h2-cardtitle">${esc(t.title)}</b>
        <small class="h2-meta">${esc(t.style)} · 장면 ${t.scenes.length}</small>
      </button>`).join('')}
    </div>
  </section>`;
  };

  /* ============================================================
     AI 제작 흐름 — Hero 인라인 (분석 단계 = 로딩 UI, 단독 스피너 없음)
     ============================================================ */
  function runAi(root, prompt) {
    const flow = root.querySelector('#h2Flow');
    const hero = root.querySelector('.h2-hero');
    const AI = window.MK_AI;
    if (!AI) { console.warn('[home] MK_AI 미로드'); return; }
    hero.classList.add('composing');
    const intent = AI.analyze(prompt);
    flow.innerHTML = `<ol class="h2-steps"></ol>`;
    const ol = flow.querySelector('.h2-steps');
    const steps = [
      `목적 분석 — 「${esc(intent.topic)}」`,
      `종류 판별 — ${esc(intent.typeName)}${intent.grade ? ` · ${esc(intent.grade)}` : ''}`,
      `템플릿 매칭 — 「${esc(AI.matchTemplate(intent).title)}」 기반`,
      `Scene 구성 생성`,
    ];
    let i = 0;
    const tick = () => {
      if (i < steps.length) {
        const li = document.createElement('li'); li.innerHTML = steps[i++];
        ol.appendChild(li);
        root._h2Timer = setTimeout(tick, 240);
        return;
      }
      const doc = AI.buildDoc(intent);
      const done = document.createElement('li');
      done.innerHTML = `Scene ${doc.scenes.length}장 완성 ✓`;
      ol.appendChild(done);
      const card = document.createElement('div');
      card.className = 'h2-result';
      card.innerHTML = `
        <span class="h2-cthumb">${thumb(doc)}</span>
        <span class="h2-cbody">
          <b class="h2-ctitle">${esc(doc.title)}</b>
          <small class="h2-meta">${esc(intent.typeName)} · 장면 ${doc.scenes.length} · AI 초안</small>
          <span class="h2-result-row">
            ${M().Button({ label: '열기', size: 'sm', attrs: 'data-h2-ai-open' })}
            ${M().Button({ label: '다시 만들기', kind: 'secondary', size: 'sm', attrs: 'data-h2-ai-redo' })}
          </span>
        </span>`;
      flow.appendChild(card);
      card.querySelector('[data-h2-ai-open]').onclick = () => {
        const p = window.MK_PROJ.createFromDoc(doc, doc.title, { prompt, action: '초안 생성' });
        openProject(p.projectId);
      };
      card.querySelector('[data-h2-ai-redo]').onclick = () => {
        flow.innerHTML = ''; hero.classList.remove('composing');
        const inp = root.querySelector('#h2Ai'); inp.focus(); inp.select();
      };
    };
    tick();
  }

  /* ---- 열기: Workspace 우선(MK_PROJ.open 내부 라우팅), 전환 플래시 0 ---- */
  function openProject(pid) { window.MK_PROJ.open(pid); }

  /* ============================================================
     검색 팔레트 — 오버레이 (`/` · 헤더 아이콘) — 찾기 전용
     ============================================================ */
  function openPalette() {
    if (document.getElementById('h2Pal')) return;
    const wrap = document.createElement('div');
    wrap.id = 'h2Pal';
    wrap.innerHTML = `<div class="h2-pal-dim"></div>
      <div class="h2-pal" role="dialog" aria-modal="true" aria-label="검색">
        <input id="h2PalIn" type="text" autocomplete="off" placeholder="프로젝트·템플릿 찾기" aria-label="프로젝트·템플릿 찾기">
        <div class="h2-pal-list" id="h2PalList" role="listbox" aria-label="검색 결과"></div>
        <small class="h2-pal-hint">↑↓ 이동 · Enter 열기 · Esc 닫기</small>
      </div>`;
    document.body.appendChild(wrap);
    const scroller = document.querySelector('#pgBody') || document.body;
    const prevOv = scroller.style.overflow; scroller.style.overflow = 'hidden';
    const inp = wrap.querySelector('#h2PalIn');
    const list = wrap.querySelector('#h2PalList');
    const prevFocus = document.activeElement;
    let rows = [], active = 0, deb = null;

    const collect = (q) => {
      const ql = q.toLowerCase();
      const pr = recentAll().filter((p) => p.name.toLowerCase().includes(ql)).slice(0, 5)
        .map((p) => ({ kind: 'project', id: p.projectId, name: p.name, meta: `${typeName(p.contentType)} · ${window.MK_PROJ.ago(p.updatedAt)}` }));
      const tp = safe(() => window.MK_TPL.list(), []).filter((t) => t.title.toLowerCase().includes(ql)).slice(0, 5)
        .map((t) => ({ kind: 'template', id: t.templateId, name: t.title, meta: `${t.style} · ${t.ratio}` }));
      return [...pr, ...tp].slice(0, 8);
    };
    const paint = () => {
      if (!rows.length) {
        list.innerHTML = `<div class="h2-pal-none">${inp.value.trim() ? '결과가 없어요 — 다른 이름으로 찾아보세요' : '프로젝트나 템플릿 이름을 입력하세요'}</div>`;
        return;
      }
      let html = '', lastKind = '';
      rows.forEach((r, i) => {
        if (r.kind !== lastKind) { html += `<small class="h2-pal-g">${r.kind === 'project' ? '프로젝트' : '템플릿'}</small>`; lastKind = r.kind; }
        html += `<button class="h2-pal-row${i === active ? ' on' : ''}" role="option" aria-selected="${i === active}" data-i="${i}">
          <span class="ic" aria-hidden="true">${r.kind === 'project' ? '▤' : '✦'}</span>
          <b>${esc(r.name)}</b><small>${esc(r.meta)}</small></button>`;
      });
      list.innerHTML = html;
      list.querySelectorAll('.h2-pal-row').forEach((b) => {
        b.onclick = () => pick(+b.dataset.i);
        b.onmousemove = () => { if (active !== +b.dataset.i) { active = +b.dataset.i; paint(); } };
      });
      const on = list.querySelector('.h2-pal-row.on');
      if (on) on.scrollIntoView({ block: 'nearest' });
    };
    const refresh = () => { rows = collect(inp.value.trim()); active = 0; paint(); };
    const close = () => {
      wrap.remove();
      scroller.style.overflow = prevOv;
      document.removeEventListener('keydown', keys, true);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
    const pick = (i) => {
      const r = rows[i]; if (!r) return;
      close();
      if (r.kind === 'project') openProject(r.id);
      else previewTemplate(r.id);
    };
    const keys = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (active < rows.length - 1) { active++; paint(); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (active > 0) { active--; paint(); } }
      else if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); pick(active); }
    };
    document.addEventListener('keydown', keys, true);
    wrap.querySelector('.h2-pal-dim').onclick = close;
    inp.oninput = () => { clearTimeout(deb); deb = setTimeout(refresh, 150); };
    refresh(); inp.focus();
  }

  /* ---- 템플릿 Preview 모달 (열람→사용, Home 이탈 없음) ---- */
  function previewTemplate(id) {
    const r = safe(() => window.MK_TPL.resolve(id), null);
    if (!r) return;
    const t = r.template;
    const strip = r.scenes.map((s, i) => `<div class="h2-pv-sc"><span class="h2-thumb-fit box">${M().sceneThumb(s)}</span><small>${i + 1}. ${esc(s.name)}</small></div>`).join('');
    M().Modal.open(`<div class="h2-pv">
      <h2>${esc(t.title)}${r.ai.recommended ? ' <span class="h2-badge-ai in">✦ AI 추천</span>' : ''}</h2>
      <p class="h2-meta">${esc(t.description)} · ${esc(r.style.name)} · ${esc(t.ratio)} · 장면 ${r.scenes.length}</p>
      <div class="h2-pv-strip">${strip}</div>
      <div class="h2-pv-act">
        ${M().Button({ label: '닫기', kind: 'secondary', attrs: 'onclick="MK.Modal.close()"' })}
        ${M().Button({ label: '이 템플릿 사용', kind: 'accent', attrs: `data-h2-use="${esc(id)}"` })}
      </div></div>`);
    const use = document.querySelector('[data-h2-use]');
    if (use) use.onclick = () => { M().Modal.close(); window.MK_TPL.load(id); };
  }

  /* ============================================================ */
  return {
    title: 'Home', variants: ['v2'],

    render() {
      const all = recentAll();
      const cont = all[0] || null;
      const rest = all.slice(1, 6);
      const middle = cont
        ? rContinue(cont) + (rest.length ? rRecent(rest) : '')
        : rEmpty();
      return `<div class="h2">${rHeader()}<main class="h2-main">${rHero()}${middle}${rReco(recoTpls())}</main></div>`;
    },

    mount(root) {
      /* 헤더 — 스크롤 보더 · 이동 · 검색 */
      const shell = document.querySelector('#pgBody') || window;
      const hd = root.querySelector('#h2Header');
      const onScroll = () => hd && hd.classList.toggle('elev', (shell.scrollTop || window.scrollY || 0) > 4);
      (shell.addEventListener ? shell : window).addEventListener('scroll', onScroll, { passive: true });
      root.querySelector('[data-h2-logo]').onclick = () => PG.go('home');
      root.querySelectorAll('[data-h2-go]').forEach((b) => b.onclick = () => PG.go(b.dataset.h2Go));
      root.querySelector('[data-h2-search]').onclick = openPalette;

      /* Hero — 자동 포커스·로테이션·제출(IME 가드) */
      const inp = root.querySelector('#h2Ai');
      setTimeout(() => inp.focus(), 0);
      let phi = 0;
      root._h2Rot = setInterval(() => {
        if (document.activeElement === inp && inp.value) return;
        phi = (phi + 1) % PLACEHOLDERS.length;
        inp.classList.add('ph-swap');
        setTimeout(() => { inp.placeholder = PLACEHOLDERS[phi]; inp.classList.remove('ph-swap'); }, 180);
      }, 4000);
      root.querySelector('#h2Form').onsubmit = (e) => {
        e.preventDefault();
        if (e.isComposing) return;
        const v = inp.value.trim();
        if (v) runAi(root, v);
      };

      /* Quick Create → 기존 깔때기 */
      root.querySelectorAll('[data-h2-chip]').forEach((b) => b.onclick = () => window.MK_SCREENS.create.enter(b.dataset.h2Chip));

      /* Continue · Recent → 열기 전용 */
      root.querySelectorAll('[data-h2-open]').forEach((b) => b.onclick = () => openProject(b.dataset.h2Open));

      /* Recommended → Preview 모달 */
      root.querySelectorAll('[data-h2-tpl]').forEach((b) => b.onclick = () => previewTemplate(b.dataset.h2Tpl));

      /* Empty — 예시 프롬프트 즉시 실행 */
      root.querySelectorAll('[data-h2-prompt]').forEach((b) => b.onclick = () => {
        inp.value = b.dataset.h2Prompt; runAi(root, b.dataset.h2Prompt);
      });

      /* Home 단축키 3종 — `/` 검색 · Esc 닫기 (Enter는 form 기본) */
      if (window._h2Keys) document.removeEventListener('keydown', window._h2Keys);
      window._h2Keys = (e) => {
        if (!document.querySelector('.h2')) return;             /* 화면 이탈 시 무동작 */
        const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
        if (e.key === '/' && !typing && !document.getElementById('h2Pal')) { e.preventDefault(); openPalette(); }
      };
      document.addEventListener('keydown', window._h2Keys);
    },
  };
})();
