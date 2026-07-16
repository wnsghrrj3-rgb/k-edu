/* ============================================================
   K-MAKER Asset System v1 — Asset Browser (#/assets)
   3단: 좌 Category(13) / 중 Browser(검색·필터·정렬·Grid/List) / 우 Preview
   실제 업로드·API 없음 — Placeholder 데이터(MK_ASSETS) 사용.
   드래그: draggable + dataTransfer('application/x-mk-asset') 구조만.
   ============================================================ */
(() => {
  const M = window.MK;
  const D = () => window.MK_ASSETS;

  /* ---- 세션 상태 (메모리 한정 — 저장 없음) ---- */
  const S = {
    cat: 'templates',
    q: '',
    tag: '',           /* 태그 필터 */
    sort: 'recent',    /* recent | name | type */
    view: 'grid',      /* grid | list */
    sel: null,         /* 선택 asset id */
    favs: new Set(),
    recents: [],       /* asset id 최신순 */
  };

  const byId = (id) => D().ASSETS.find((x) => x.id === id);

  const touchRecent = (id) => {
    S.recents = [id, ...S.recents.filter((x) => x !== id)].slice(0, 12);
  };

  /* ---- 목록 산출 ---- */
  function items() {
    let list;
    if (S.cat === 'favorites') list = D().ASSETS.filter((x) => S.favs.has(x.id));
    else if (S.cat === 'recent') list = S.recents.map(byId).filter(Boolean);
    else list = D().ASSETS.filter((x) => x.category === S.cat);

    if (S.q) {
      const q = S.q.toLowerCase();
      list = list.filter((x) => x.name.toLowerCase().includes(q) || x.tags.some((t) => t.toLowerCase().includes(q)));
    }
    if (S.tag) list = list.filter((x) => x.tags.includes(S.tag));

    if (S.cat !== 'recent') {
      if (S.sort === 'recent') list = [...list].sort((a, b) => b.date - a.date);
      if (S.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      if (S.sort === 'type') list = [...list].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'ko'));
    }
    return list;
  }

  const tagsOf = (list) => [...new Set(list.flatMap((x) => x.tags))].slice(0, 8);

  /* ---- 렌더 조각 ---- */
  function renderCats() {
    return `<div class="as-cats">${D().CATEGORIES.map((c) => {
      const n = c.key === 'favorites' ? S.favs.size
        : c.key === 'recent' ? S.recents.length
        : D().ASSETS.filter((x) => x.category === c.key).length;
      return `<button class="as-cat ${S.cat === c.key ? 'on' : ''} ${c.virtual ? 'virtual' : ''}" data-cat="${c.key}">
        <span class="ic">${c.icon}</span><span class="nm">${c.name}</span><span class="ko">${c.ko}</span><span class="cnt">${n}</span></button>`;
    }).join('')}</div>`;
  }

  function renderBrowser() {
    const list = items();
    /* 태그 풀은 검색·태그 적용 전 카테고리 기준으로 */
    const base = (S.cat === 'favorites') ? D().ASSETS.filter((x) => S.favs.has(x.id))
      : (S.cat === 'recent') ? S.recents.map(byId).filter(Boolean)
      : D().ASSETS.filter((x) => x.category === S.cat);
    const tags = tagsOf(base);
    const catName = (D().CATEGORIES.find((c) => c.key === S.cat) || {}).name || '';
    return `
      <div class="as-toolbar">
        <div class="as-search"><span>🔍</span><input id="asQ" type="search" placeholder="${M.esc(catName)} 검색 — 이름·태그" value="${M.esc(S.q)}"></div>
        <select id="asSort" class="as-select" ${S.cat === 'recent' ? 'disabled' : ''}>
          <option value="recent" ${S.sort === 'recent' ? 'selected' : ''}>최신순</option>
          <option value="name" ${S.sort === 'name' ? 'selected' : ''}>이름순</option>
          <option value="type" ${S.sort === 'type' ? 'selected' : ''}>유형순</option>
        </select>
        <div class="as-viewtg">
          <button class="${S.view === 'grid' ? 'on' : ''}" data-view="grid" aria-label="Grid">▦</button>
          <button class="${S.view === 'list' ? 'on' : ''}" data-view="list" aria-label="List">☰</button>
        </div>
      </div>
      ${tags.length ? `<div class="as-tags">${M.Chip({ label: '전체', on: !S.tag, attrs: 'data-tag=""' })}${tags.map((t) => M.Chip({ label: t, on: S.tag === t, attrs: `data-tag="${M.esc(t)}"` })).join('')}</div>` : ''}
      <div class="as-grid ${S.view}">${list.length
        ? list.map((x) => M.AssetCard(x, S.view, { fav: S.favs.has(x.id), selected: S.sel === x.id })).join('')
        : `<div class="as-empty">${S.q || S.tag ? '검색 결과가 없어요 — 검색어·태그를 지워 보세요' : (S.cat === 'favorites' ? '♡를 눌러 즐겨찾기를 모아 보세요' : S.cat === 'recent' ? '아직 사용한 에셋이 없어요' : '이 카테고리는 비어 있어요')}</div>`}
      </div>`;
  }

  function renderPreview() {
    const x = S.sel ? byId(S.sel) : null;
    if (!x) return `<div class="as-prev empty"><span>◱</span><p>에셋을 선택하면<br>여기에 미리보기가 떠요</p></div>`;
    const metaRows = Object.entries({ 유형: x.type, 크기: x.size, 비율: x.ratio.replace('/', ':'), 태그: x.tags.join(', '), ...Object.fromEntries(Object.entries(x.meta).map(([k, v]) => [k, v])) });
    return `<div class="as-prev" draggable="true" data-drag="${x.id}">
      <div class="big">${M.assetThumb(x)}</div>
      <b class="ttl">${M.esc(x.name)}</b>
      <table class="info">${metaRows.map(([k, v]) => `<tr><th>${M.esc(k)}</th><td>${M.esc(String(v))}</td></tr>`).join('')}</table>
      <div class="acts">
        ${M.Button({ label: '캔버스에 사용', attrs: `data-use="${x.id}"` })}
        ${M.Button({ label: S.favs.has(x.id) ? '♥ 해제' : '♡ 즐겨찾기', kind: 'secondary', attrs: `data-fav="${x.id}"` })}
      </div>
      <p class="drag-hint">↖ 이 카드를 캔버스로 드래그할 수 있어요 (구조만 — 드롭 처리 후속)</p>
    </div>`;
  }

  /* ---- 화면 등록 ---- */
  window.MK_SCREENS.assets = {
    title: 'Assets', variants: ['v1'],
    render() {
      return `<span class="pg-note">Asset System v1 — Placeholder 데이터 · 업로드/API 미연결(의도)</span>
        <div class="as-shell">
          <aside class="as-left">${renderCats()}</aside>
          <section class="as-mid" id="asMid">${renderBrowser()}</section>
          <aside class="as-right" id="asRight">${renderPreview()}</aside>
        </div>`;
    },
    mount(root) {
      const rMid = () => { root.querySelector('#asMid').innerHTML = renderBrowser(); wireMid(); };
      const rRight = () => { root.querySelector('#asRight').innerHTML = renderPreview(); wireRight(); };
      const rAll = () => { root.querySelector('.as-left').innerHTML = renderCats(); wireCats(); rMid(); rRight(); };

      function wireCats() {
        root.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => {
          S.cat = b.dataset.cat; S.q = ''; S.tag = ''; S.sel = null; rAll();
        });
      }
      function wireMid() {
        const q = root.querySelector('#asQ');
        if (q) { q.oninput = () => { S.q = q.value; const pos = q.selectionStart; rMid(); const nq = root.querySelector('#asQ'); nq.focus(); nq.setSelectionRange(pos, pos); }; }
        const so = root.querySelector('#asSort');
        if (so) so.onchange = () => { S.sort = so.value; rMid(); };
        root.querySelectorAll('[data-view]').forEach((b) => b.onclick = () => { S.view = b.dataset.view; rMid(); });
        root.querySelectorAll('.as-tags [data-tag]').forEach((c) => c.onclick = () => { S.tag = c.dataset.tag; rMid(); });
        root.querySelectorAll('.mk-assetcard').forEach((card) => {
          card.onclick = (e) => {
            if (e.target.closest('[data-fav]') || e.target.closest('[data-more]')) return;
            S.sel = card.dataset.asset; touchRecent(S.sel); rMid(); rRight();
          };
          card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/x-mk-asset', card.dataset.asset);
            e.dataTransfer.effectAllowed = 'copy';
            card.classList.add('dragging');
          });
          card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });
        root.querySelectorAll('#asMid [data-fav]').forEach((b) => b.onclick = () => {
          const id = b.dataset.fav;
          S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id);
          rAll();
        });
        root.querySelectorAll('[data-more]').forEach((b) => b.onclick = () => {
          const x = byId(b.dataset.more);
          M.Modal.open(`<h2>${M.esc(x.name)}</h2>
            <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">더 보기 메뉴 — 이름 바꾸기 · 복제 · 다운로드 · 삭제 (전부 후속 단계 자리표시)</p>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${M.Button({ label: '닫기', kind: 'secondary', size: 'sm', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
        });
      }
      function wireRight() {
        const use = root.querySelector('[data-use]');
        if (use) use.onclick = () => {
          const x = byId(use.dataset.use); touchRecent(x.id);
          M.Modal.open(`<h2>캔버스에 추가</h2>
            <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">「${M.esc(x.name)}」 — Editor 캔버스 삽입은 후속 단계(Editor 연동)에서 연결돼요.</p>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${M.Button({ label: '확인', size: 'sm', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
        };
        const fav = root.querySelector('#asRight [data-fav]');
        if (fav) fav.onclick = () => {
          const id = fav.dataset.fav;
          S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id);
          rAll();
        };
        const drag = root.querySelector('[data-drag]');
        if (drag) {
          drag.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/x-mk-asset', drag.dataset.drag);
            e.dataTransfer.effectAllowed = 'copy';
          });
        }
      }
      wireCats(); wireMid(); wireRight();
    },
  };
})();
