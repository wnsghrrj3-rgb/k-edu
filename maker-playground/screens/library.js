/* ============================================================
   화면: Library — Premium Template Browser (Round 11)
   ------------------------------------------------------------
   "무엇을 만들까요?"에 가장 빠르게 답하는 화면.
     home   : 검색 · Category 9 · Rails 6줄
     browse : Breadcrumb · Project Type · Filter · Virtual Grid
   원칙(STEP 10): 카드를 꾸미지 않는다. 템플릿이 주인공.
   - 카드에 남기는 정보는 6개(이름·타입·스타일·장수·비율·Premium)뿐
   - 나머지 액션은 hover 시에만 나타난다
   - 리렌더는 이 화면 안에서만 수행(PG.render 미사용) — 스크롤 보존
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

(() => {
  const M = () => window.MK, C = () => window.MK_CAT;

  const S = {
    mode: 'home', cat: 'all', type: '', q: '',
    filters: { style: '', color: '', theme: '', ratio: '', pages: 'any' },
    sort: 'recommend', favs: new Set(), onlyLive: false,
    scrollTop: 0, cols: 4, lastCount: 0, lastMs: 0,
  };
  let ROOT = null;

  const esc = (s) => M().esc(s);
  const catName = (k) => (C().CATEGORIES.find((c) => c.key === k) || {}).name || '전체';

  /* ---------- Card (STEP 4) ---------- */
  function card(e) {
    const badge = e.premium ? '<span class="prem">PREMIUM</span>' : '';
    const live = e.live ? '<span class="livedot" title="실제 렌더되는 완성 템플릿">●</span>' : '';
    const fav = S.favs.has(e.id);
    return `<article class="lb-card" data-e="${e.id}">
      <div class="th">${C().poster(e)}${badge}${live}
        <button class="fav ${fav ? 'on' : ''}" data-fav="${e.id}" aria-label="즐겨찾기">${fav ? '★' : '☆'}</button>
        <div class="hov">
          <button class="mk-btn accent sm" data-create="${e.id}">만들기</button>
          <button class="mk-btn secondary sm" data-prev="${e.id}">미리보기</button>
        </div>
      </div>
      <div class="mt"><b title="${esc(e.name)}">${esc(e.name)}</b>
        <small>${esc(e.type)} · ${esc(e.style)} · ${e.pages}장 · ${esc(e.ratio)}</small></div>
    </article>`;
  }

  /* ---------- Preview (STEP 5) — Cover · 대표 · 마지막 자동 순환 ---------- */
  let ptimer = null;
  function openPreview(id) {
    const m = M(), e = C().get(id);
    if (!e) return;
    const shots = C().previewScenes(e);
    let idx = 0;
    const frames = shots
      ? shots.map((s) => ({ label: s.label, html: m.sceneThumb(s.scene) }))
      : [{ label: 'Cover', html: C().paint({ ...e, arch: 'cover' }) },
         { label: '대표 Scene', html: C().paint({ ...e, arch: e.arch === 'cover' ? 'split' : e.arch }) },
         { label: '마지막 Scene', html: C().paint({ ...e, arch: 'statement' }) }];
    const draw = () => `<div class="lb-prev">
      <div class="left">
        <div class="stage">${frames[idx].html}</div>
        <div class="dots">${frames.map((f, i) => `<button class="${i === idx ? 'on' : ''}" data-d="${i}">${esc(f.label)}</button>`).join('')}</div>
      </div>
      <div class="right">
        <h2>${esc(e.name)}${e.premium ? '<span class="prem">PREMIUM</span>' : ''}</h2>
        <p class="desc">${esc(e.desc || '')}</p>
        <table class="info">
          ${[['Category', catName(e.cat)], ['Project Type', e.type], ['Style', e.style],
             ['Color / Theme', `${e.color} · ${e.theme}`], ['Ratio', e.ratio], ['Pages', e.pages + '장']]
            .map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('')}
        </table>
        ${e.live ? '' : '<p class="warn">카탈로그 목업 — 탐색·성능 검증용 항목입니다. 만들기를 누르면 완성형 프리미엄 템플릿으로 시작합니다.</p>'}
        <div class="acts">
          ${m.Button({ label: '이 템플릿으로 시작', kind: 'accent', attrs: `data-create="${e.id}"` })}
          <div class="row">
            ${m.Button({ label: S.favs.has(e.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기', kind: 'secondary', size: 'sm', attrs: `data-fav="${e.id}"` })}
            ${m.Button({ label: '비슷한 템플릿', kind: 'secondary', size: 'sm', attrs: `data-sim="${e.type}"` })}
          </div>
        </div>
      </div></div>`;
    m.Modal.open(draw());
    const back = document.getElementById('mkModal');
    back.querySelector('.mk-modal').classList.add('lb-wide');
    const wire = () => {
      back.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => { idx = +b.dataset.d; hold(); redraw(); });
      back.querySelector('[data-create]').onclick = () => { stop(); m.Modal.close(); create(e.id); };
      back.querySelector('[data-fav]').onclick = () => { toggleFav(e.id); redraw(); paint(); };
      back.querySelector('[data-sim]').onclick = () => { stop(); m.Modal.close(); S.mode = 'browse'; S.cat = e.cat; S.type = e.type; S.q = ''; paint(); };
    };
    const redraw = () => { back.querySelector('.mk-modal').innerHTML = draw(); wire(); };
    const stop = () => { clearInterval(ptimer); ptimer = null; };
    const hold = () => { stop(); ptimer = setTimeout(run, 3200); };
    const run = () => { stop(); ptimer = setInterval(() => { idx = (idx + 1) % frames.length; redraw(); }, 1800); };
    wire(); run();
    back.addEventListener('click', (ev) => { if (ev.target === back) stop(); });
  }

  function toggleFav(id) { S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); }

  /* 만들기 — 실템플릿은 엔진 로드, 목업은 프리미엄 완성본으로 폴백(정직하게 안내) */
  function create(id) {
    const e = C().get(id);
    if (!e) return;
    C().use(id);
    const target = e.live ? e.tplId : 'tpl-pr-presentation-01';
    if (window.MK_TPL) window.MK_TPL.load(target);
  }

  /* ============================================================
     Home (STEP 1 · 2)
     ============================================================ */
  function railRow(r) {
    if (!r.items.length) return '';
    return `<section class="lb-rail">
      <header><h3>${esc(r.title)}</h3><small>${esc(r.note)}</small>
        <button class="more" data-rail="${r.key}">전체 보기 →</button></header>
      <div class="track">${r.items.map(card).join('')}</div>
    </section>`;
  }

  function homeHTML() {
    const cats = C().CATEGORIES, cnt = C().countBy('cat');
    return `<div class="lb-hero">
        <h2>무엇을 만들까요?</h2>
        <div class="lb-search big">
          <span>🔍</span>
          <input id="lbQ" type="search" placeholder="템플릿 · 카테고리 · 스타일 · 색 · 비율 · 장수로 검색" value="${esc(S.q)}" autocomplete="off">
        </div>
        ${C().recentQueries.length ? `<div class="lb-recentq"><small>최근 검색</small>${C().recentQueries.map((q) => `<button data-rq="${esc(q)}">${esc(q)}</button>`).join('')}</div>` : ''}
      </div>
      <div class="lb-cats">${cats.map((c) => `<button class="lb-cat" data-cat="${c.key}">
        <span class="ico">${c.icon}</span><b>${c.name}</b><small>${esc(c.desc)}</small><em>${cnt[c.key] || 0}</em></button>`).join('')}</div>
      ${C().rails(S.favs).map(railRow).join('')}`;
  }

  /* ============================================================
     Browse (STEP 3 · 6 · 7 · 9)
     ============================================================ */
  function filterBar() {
    const f = S.filters, chip = (k, v, label) =>
      `<button class="lb-chip ${f[k] === v ? 'on' : ''}" data-f="${k}" data-v="${v}">${esc(label)}</button>`;
    return `<div class="lb-filters">
      <div class="grp"><span>Style</span>${C().STYLES.map((s) => chip('style', s, s)).join('')}</div>
      <div class="grp"><span>Color</span>${C().COLORS.map((s) => `<button class="lb-chip sw ${f.color === s ? 'on' : ''}" data-f="color" data-v="${s}"><i style="background:${C().COLORHEX[s].a}"></i>${s}</button>`).join('')}</div>
      <div class="grp"><span>Theme</span>${C().THEMES.map((s) => chip('theme', s, s)).join('')}</div>
      <div class="grp"><span>Ratio</span>${C().RATIOS.map((s) => chip('ratio', s, s)).join('')}</div>
      <div class="grp"><span>Pages</span>${C().PAGEBUCKETS.map(([k, n]) => `<button class="lb-chip ${f.pages === k ? 'on' : ''}" data-f="pages" data-v="${k}">${n}</button>`).join('')}</div>
    </div>`;
  }

  function browseHTML(list) {
    const types = S.cat !== 'all' ? (C().TYPES[S.cat] || []) : [];
    const active = Object.entries(S.filters).filter(([k, v]) => v && v !== 'any').length + (S.type ? 1 : 0);
    return `<div class="lb-bar">
        <button class="lb-back" data-home>← 처음으로</button>
        <b>${S.q ? `“${esc(S.q)}” 검색 결과` : catName(S.cat)}</b>
        ${S.type ? `<span class="crumb">${esc(S.type)}</span>` : ''}
        <div class="lb-search"><span>🔍</span><input id="lbQ" type="search" placeholder="검색" value="${esc(S.q)}" autocomplete="off"></div>
        <select id="lbSort" class="as-select">
          ${[['recommend', '추천순'], ['popular', '인기순'], ['new', '새 템플릿순'], ['name', '이름순'], ['pages', '장수순']]
            .map(([k, n]) => `<option value="${k}" ${S.sort === k ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      </div>
      ${types.length ? `<div class="lb-types"><button class="lb-chip ${!S.type ? 'on' : ''}" data-t="">전체</button>${types.map((t) => `<button class="lb-chip ${S.type === t ? 'on' : ''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
      ${filterBar()}
      <div class="lb-count"><b>${list.length.toLocaleString()}</b>개 · ${S.lastMs.toFixed(1)}ms
        <button class="lb-chip ${S.onlyLive ? 'on' : ''}" data-live>완성 템플릿만</button>
        ${active ? `<button class="lb-reset" data-reset>필터 초기화 (${active})</button>` : ''}</div>
      <div class="lb-vp" id="lbVP"><div class="sizer" id="lbSizer"><div class="layer" id="lbLayer"></div></div></div>`;
  }

  /* ---------- Virtual Grid (STEP 9) ---------- */
  let LIST = [];
  let LASTW = null;         /* 직전 렌더 창 — 같은 창이면 DOM을 건드리지 않는다 */
  const POOL = new Map();   /* entryId → 카드 DOM (가상 리스트 재활용 풀) */
  const CARD_W = 232, ROW_H = 214;

  let VP = { w: 0, h: 0, cols: 4, cellW: 216 };
  const GAP = 16;

  /* 뷰포트 측정 — 스크롤 중에는 읽지 않는다(강제 레이아웃 방지) */
  function measure() {
    const vp = document.getElementById('lbVP');
    if (!vp) return;
    const w = vp.clientWidth || 960, h = vp.clientHeight || 640;
    const cols = Math.max(1, Math.floor(w / CARD_W));
    VP = { w, h, cols, cellW: (w - GAP * (cols - 1)) / cols };
    S.cols = cols;
  }

  /* 카드는 그리드가 아니라 절대 좌표에 놓는다 —
     창이 밀려도 남은 카드의 위치가 변하지 않아 재배치·재레이아웃이 없다 */
  function place(el, i) {
    const r = Math.floor(i / VP.cols), c = i % VP.cols;
    el.style.width = VP.cellW + 'px';
    el.style.transform = `translate3d(${c * (VP.cellW + GAP)}px, ${r * ROW_H}px, 0)`;
  }

  function drawWindow(force) {
    const vp = document.getElementById('lbVP');
    if (!vp) return;
    const w = C().windowRange({ scrollTop: vp.scrollTop, viewH: VP.h, rowH: ROW_H, cols: VP.cols, total: LIST.length });
    const key = w.start + ':' + w.end + ':' + VP.cols;
    if (!force && LASTW === key) return;
    LASTW = key;
    const layer = document.getElementById('lbLayer');
    document.getElementById('lbSizer').style.height = w.totalH + 'px';

    if (!LIST.length) { POOL.clear(); layer.innerHTML = `<div class="lb-empty">조건에 맞는 템플릿이 없어요 — 필터를 하나 풀어보세요</div>`; return; }

    /* 창을 벗어난 카드만 버리고, 새로 들어온 카드만 만든다 (남는 카드는 손대지 않음) */
    const need = new Set();
    for (let i = w.start; i < w.end; i++) need.add(LIST[i].id);
    POOL.forEach((el, id) => { if (!need.has(id)) { el.remove(); POOL.delete(id); } });
    const frag = document.createDocumentFragment();
    for (let i = w.start; i < w.end; i++) {
      const e = LIST[i];
      if (POOL.has(e.id)) continue;
      const d = document.createElement('div');
      d.innerHTML = card(e);
      const el = d.firstElementChild;
      place(el, i); wireCard(el); POOL.set(e.id, el);
      frag.appendChild(el);
    }
    if (frag.childNodes.length) layer.appendChild(frag);
  }

  /* 카드 1장 배선 (재활용 노드는 1회만 배선된다) */
  function wireCard(el) {
    const id = el.dataset.e;
    el.onclick = () => openPreview(id);
    el.querySelector('[data-prev]').onclick = (ev) => { ev.stopPropagation(); openPreview(id); };
    el.querySelector('[data-create]').onclick = (ev) => { ev.stopPropagation(); create(id); };
    const f = el.querySelector('[data-fav]');
    f.onclick = (ev) => { ev.stopPropagation(); toggleFav(id); f.classList.toggle('on'); f.textContent = S.favs.has(id) ? '★' : '☆'; };
  }

  /* ---------- 렌더 · 배선 ---------- */
  function paint() {
    if (!ROOT) return;
    if (S.mode === 'browse') {
      const t0 = (performance || Date).now();
      LIST = C().query({ cat: S.cat, type: S.type, q: S.q, filters: S.filters, sort: S.sort, favs: S.favs, onlyLive: S.onlyLive });
      S.lastMs = (performance || Date).now() - t0;
      S.lastCount = LIST.length;
      ROOT.innerHTML = browseHTML(LIST);
      const vp = document.getElementById('lbVP');
      measure();
      let raf = 0;
      vp.onscroll = () => {                 /* rAF 코얼레싱 — 스크롤 이벤트당 1프레임 1회 */
        S.scrollTop = vp.scrollTop;
        if (raf) return;
        raf = requestAnimationFrame(() => { raf = 0; drawWindow(); });
      };
      LASTW = null; POOL.clear(); drawWindow(true);
      if (!window._lbResize) { window._lbResize = true; window.addEventListener('resize', () => { measure(); LASTW = null; POOL.forEach((el) => el.remove()); POOL.clear(); drawWindow(true); }); }
    } else {
      ROOT.innerHTML = homeHTML();
      wireCards(ROOT);
    }
    wireShell();
  }

  function wireCards(scope) {
    scope.querySelectorAll('[data-prev]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); openPreview(b.dataset.prev); });
    scope.querySelectorAll('[data-create]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); create(b.dataset.create); });
    scope.querySelectorAll('[data-fav]').forEach((b) => b.onclick = (ev) => {
      ev.stopPropagation(); toggleFav(b.dataset.fav);
      b.classList.toggle('on'); b.textContent = S.favs.has(b.dataset.fav) ? '★' : '☆';
    });
    scope.querySelectorAll('.lb-card').forEach((c) => c.onclick = () => openPreview(c.dataset.e));
  }

  function wireShell() {
    const R = ROOT;
    R.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => { S.cat = b.dataset.cat; S.type = ''; S.mode = 'browse'; paint(); });
    R.querySelectorAll('[data-rail]').forEach((b) => b.onclick = () => {
      const k = b.dataset.rail;
      S.mode = 'browse'; S.cat = 'all'; S.type = ''; S.onlyFav = false;
      if (k === 'pop') S.sort = 'popular'; else if (k === 'new') S.sort = 'new'; else if (k === 'prem') S.onlyLive = true;
      paint();
    });
    R.querySelectorAll('[data-rq]').forEach((b) => b.onclick = () => { S.q = b.dataset.rq; S.mode = 'browse'; paint(); });
    R.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { S.type = b.dataset.t; paint(); });
    R.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => {
      const k = b.dataset.f, v = b.dataset.v;
      S.filters[k] = (S.filters[k] === v) ? (k === 'pages' ? 'any' : '') : v;
      paint();
    });
    const home = R.querySelector('[data-home]');
    if (home) home.onclick = () => { S.mode = 'home'; S.q = ''; paint(); };
    const rs = R.querySelector('[data-reset]');
    if (rs) rs.onclick = () => { S.filters = { style: '', color: '', theme: '', ratio: '', pages: 'any' }; S.type = ''; paint(); };
    const lv = R.querySelector('[data-live]');
    if (lv) lv.onclick = () => { S.onlyLive = !S.onlyLive; paint(); };
    const so = R.querySelector('#lbSort');
    if (so) so.onchange = () => { S.sort = so.value; paint(); };
    const q = R.querySelector('#lbQ');
    if (q) {
      q.oninput = () => {
        S.q = q.value;
        if (S.mode === 'home' && S.q) S.mode = 'browse';
        const pos = q.selectionStart; paint();
        const nq = document.getElementById('lbQ');
        if (nq) { nq.focus(); nq.setSelectionRange(pos, pos); }
      };
      q.onchange = () => { C().pushQuery(q.value); };
      q.onkeydown = (ev) => { if (ev.key === 'Enter') C().pushQuery(q.value); };
    }
  }

  window.MK_SCREENS.library = {
    title: 'Library', variants: ['v1'],
    render() {
      return `<span class="pg-note">Premium Template Browser — 카탈로그 ${C().ENTRIES.length.toLocaleString()}개(완성형 ${C().ENTRIES.filter((e) => e.live).length}종 + 탐색·성능 검증용 목업) · Virtual List</span>
        <div class="lb-shell" id="lbRoot"></div>`;
    },
    mount(root) { ROOT = root.querySelector('#lbRoot'); paint(); },
    /* 테스트·캡처 훅 */
    _S: S, _paint: () => paint(), _openPreview: openPreview,
  };
})();
