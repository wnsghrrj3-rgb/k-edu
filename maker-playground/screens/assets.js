/* ============================================================
   K-MAKER Universal Asset Platform — Asset Browser v2 (#/assets)
   ------------------------------------------------------------
   좌: Smart Collection · Folder · Brand · Workspace · Cloud · Storage
   중: 검색 + 필터 + Grid/List/Large + Lazy Loading(커서)
   우: Inspector — Preview·Meta·Usage·Version·AI·Variant·Color·권한
   전 기능은 window.MK_DAM(Reference 기반)을 통해서만 동작.
   ============================================================ */
(() => {
  const M = () => window.MK;
  const D = () => window.MK_DAM;
  const esc = (s) => M().esc(String(s == null ? '' : s));

  const S = {
    src: 'all',          /* all | fav | recent | sc-* | fd-* | brand:* */
    q: '', kind: '', orient: '',
    view: 'grid',        /* grid | list | large */
    sort: 'recent',
    cursor: 0, pageSize: 12,
    sel: null, tab: 'meta',
    replTarget: '', preview: false, previewDark: false,
    lastSearchMs: null,
  };

  /* ---------- 목록 산출 (전부 MK_DAM 경유) ---------- */
  function pool() {
    const d = D();
    if (S.src === 'fav') return d.favorites();
    if (S.src === 'recent') return d.recents().map(d.get).filter(Boolean);
    if (S.src.startsWith('sc-')) return d.evalCollection(S.src);
    if (S.src.startsWith('fd-')) { const f = d.folderList().find((x) => x.folderId === S.src); return f ? f.assetIds.map(d.get).filter(Boolean) : []; }
    if (S.src.startsWith('brand:')) return d.brandAssets(S.src.slice(6));
    return d.list();
  }
  function items() {
    const d = D();
    const r = d.search(S.q, { kind: S.kind || undefined, orientation: S.orient || undefined }, pool());
    S.lastSearchMs = r.ms;
    let l = r.items;
    if (S.sort === 'name') l = l.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    else if (S.sort === 'used') l = l.slice().sort((a, b) => d.stats(b.id).count - d.stats(a.id).count);
    else l = l.slice().sort((a, b) => b.updated - a.updated);
    return l;
  }

  const toneBg = (e) => `background:linear-gradient(135deg, ${e.colors.palette[0]}, ${e.colors.palette[1] || e.colors.palette[0]}22)`;
  const KICON = { photo: '🖼', image: '🖼', svg: '✒', icon: '✦', illustration: '✎', video: '▶', audio: '♪', gif: '🎞', glb: '🧊', pdf: '📄', 'template-snippet': '▦', sticker: '✿', shape: '◆', texture: '▨', font: 'Aa' };

  /* ---------- 카드 ---------- */
  function card(e, mode) {
    const d = D();
    const star = d.isStar(e.id) ? '★' : '☆';
    const use = d.stats(e.id).count;
    const th = d.thumb(e.id);
    if (mode === 'list') {
      return `<div class="dm-row ${S.sel === e.id ? 'on' : ''}" data-dm-sel="${e.id}" draggable="true" data-dm-drag="${e.id}">
        <span class="dm-row-th" style="${toneBg(e)}">${KICON[e.kind] || '▦'}</span>
        <span class="dm-row-name">${esc(e.name)}</span>
        <span class="dm-row-kind">${esc(e.kind)}</span>
        <span class="dm-row-use">${use}회</span>
        <button class="dm-star" data-dm-star="${e.id}">${star}</button>
      </div>`;
    }
    const big = mode === 'large';
    return `<div class="dm-card ${big ? 'lg' : ''} ${S.sel === e.id ? 'on' : ''}" data-dm-sel="${e.id}" draggable="true" data-dm-drag="${e.id}" title="${esc(th.label)}">
      <div class="dm-th" style="${toneBg(e)}"><span class="dm-th-ic">${KICON[e.kind] || '▦'}</span>
        ${e.brandId ? '<span class="dm-th-brand">🏷</span>' : ''}
        ${d.isPin(e.id) ? '<span class="dm-th-pin">📌</span>' : ''}
        <button class="dm-star" data-dm-star="${e.id}">${star}</button>
      </div>
      <div class="dm-card-b"><div class="dm-card-n">${esc(e.name)}</div>
      <div class="dm-card-m">${esc(e.kind)} · ${use}회 사용</div></div>
    </div>`;
  }

  /* ---------- 좌측 패널 ---------- */
  function leftPanel() {
    const d = D();
    const li = (key, label, count, ico = '') =>
      `<button class="dm-nav ${S.src === key ? 'on' : ''}" data-dm-src="${key}">${ico} ${esc(label)}${count != null ? ` <span class="dm-nav-c">${count}</span>` : ''}</button>`;
    const st = d.storageStats();
    const brands = window.MK_BRAND ? window.MK_BRAND.list().slice(0, 4) : [];
    return `<aside class="dm-left">
      <div class="dm-sec">${li('all', '전체 자산', d.list().length, '▦')}${li('fav', '즐겨찾기', d.favorites().length, '★')}${li('recent', '최근 사용', d.recents().length, '⟳')}</div>
      <div class="dm-sec"><div class="dm-h">Smart Collection</div>
        ${d.collections().map((c) => li(c.colId, c.name, d.evalCollection(c.colId).length, '◈')).join('')}</div>
      <div class="dm-sec"><div class="dm-h">Folder</div>
        ${d.folderList().map((f) => li(f.folderId, f.name, f.count, '📁')).join('')}</div>
      <div class="dm-sec"><div class="dm-h">Brand</div>
        ${brands.map((b) => li('brand:' + b.brandId, b.name, d.brandAssets(b.brandId).length, '🏷')).join('')}</div>
      <div class="dm-sec"><div class="dm-h">Cloud</div>
        ${d.CLOUD.map((c) => `<button class="dm-nav dim" data-dm-cloud="${c.key}">☁ ${esc(c.name)} <span class="dm-nav-c">설계</span></button>`).join('')}</div>
      <div class="dm-store"><div class="dm-h">Storage</div>
        <div>Blob ${st.blobs} · Asset ${st.assets}</div>
        <div>Dedup 절약 ${st.dedupSaved}B</div>
        <div>캐시 hit ${st.cache.hit} / miss ${st.cache.miss}</div></div>
    </aside>`;
  }

  /* ---------- 인스펙터 (§19) ---------- */
  function inspector() {
    const d = D();
    const e = S.sel ? d.get(S.sel) : null;
    if (!e) return `<aside class="dm-ins"><div class="dm-ins-empty">자산을 선택하면<br>Inspector가 열립니다</div></aside>`;
    const tabs = [['meta', 'Meta'], ['usage', 'Usage'], ['ver', 'Version'], ['ai', 'AI'], ['var', 'Variant']];
    const u = d.usedBy(e.id), st = d.stats(e.id), vs = d.versions(e.id), vars = d.variants(e.id);
    const crop = d.cropMap(e.id);
    const body = {
      meta: () => `<dl class="dm-dl">
        <dt>종류</dt><dd>${esc(e.kind)}</dd><dt>설명</dt><dd>${esc(e.desc || '—')}</dd>
        <dt>제작자</dt><dd>${esc(e.creator)}</dd><dt>워크스페이스</dt><dd>${esc(e.workspaceId)}</dd>
        <dt>해상도</dt><dd>${esc(e.resolution || '—')}</dd><dt>비율</dt><dd>${esc(e.aspect)}</dd>
        <dt>라이선스</dt><dd>${esc(e.license)}</dd><dt>브랜드</dt><dd>${esc(e.brandId || '—')}</dd>
        <dt>태그</dt><dd>${e.tags.map((t) => `<span class="mk-badge">${esc(t)}</span>`).join(' ')}</dd>
        <dt>폴더</dt><dd>${esc(d.folderOf(e.id)?.name || '—')}</dd>
        <dt>Blob</dt><dd class="dm-mono">${esc(e.storage.blobId)}${e.storage.dedup ? ' · dedup' : ''}</dd></dl>
        <div class="dm-h">권한 (§17)</div>
        <select class="mk-input dm-scope" data-dm-scope="${e.id}">${d.SCOPES.map((s) => `<option ${d.scopeOf(e.id) === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <div class="dm-h">색 (§3)</div>
        <div class="dm-colors">${e.colors.palette.map((c) => `<span class="dm-sw" style="background:${c}" title="${c}"></span>`).join('')}<span class="dm-mono">${esc(e.colors.dominant)}</span></div>`,
      usage: () => `<div class="dm-h">사용 ${st.count}회 (§16)</div>
        <dl class="dm-dl"><dt>Template</dt><dd>${u.templates.length ? u.templates.map(esc).join('<br>') : '—'}</dd>
        <dt>Project</dt><dd>${u.projects.length ? u.projects.map(esc).join('<br>') : '—'}</dd>
        <dt>Scene/El</dt><dd>${u.scenes.length + u.elements.length || '—'}</dd></dl>
        <div class="dm-h">Crop Memory (§15)</div>
        ${Object.keys(crop).length ? Object.entries(crop).map(([a, c]) => `<div class="dm-mono">${esc(a)} → x${c.x} y${c.y} ${c.w}×${c.h}</div>`).join('') : '<div class="dm-dim">저장된 크롭 없음</div>'}
        <div class="dm-h">Replace Everywhere (§14)</div>
        <select class="mk-input" id="dmReplSel">${d.list().filter((x) => x.id !== e.id && x.kind === e.kind).slice(0, 8).map((x) => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>
        <button class="mk-btn primary dm-w100" data-dm-repl="${e.id}">이 자산을 모두 교체</button>
        <div id="dmReplOut" class="dm-out" hidden></div>`,
      ver: () => `<div class="dm-h">Version ${vs.length}개 (§4)</div>
        ${vs.map((v) => `<div class="dm-ver"><span>${esc(v.name)}</span>
          <span class="dm-mono">${v.contentHash.slice(0, 6)}</span>
          <button class="mk-btn sm" data-dm-vres="${v.verId}">복원</button></div>`).join('')}
        ${vs.length >= 2 ? `<button class="mk-btn dm-w100" data-dm-vcmp="1">최신 ↔ 직전 비교</button><div id="dmVcmp" class="dm-out" hidden></div>` : ''}`,
      ai: () => `<div class="dm-h">AI 자동 분석 (§11)</div>
        <dl class="dm-dl"><dt>Caption</dt><dd>${esc(e.ai.caption)}</dd>
        <dt>Objects</dt><dd>${e.ai.objects.map(esc).join(', ') || '—'}</dd>
        <dt>Scene</dt><dd>${esc(e.ai.scene)}</dd><dt>Style</dt><dd>${esc(e.ai.style)}</dd>
        <dt>Emotion</dt><dd>${esc(e.ai.emotion)}</dd><dt>OCR</dt><dd>${e.ai.ocr.map(esc).join(', ') || '—'}</dd>
        <dt>얼굴</dt><dd>${e.ai.faces}</dd><dt>색 키워드</dt><dd>${e.ai.colorWords.map(esc).join(', ')}</dd></dl>
        <div class="dm-h">비슷한 자산 (§13)</div>
        <div class="dm-simrow">${d.similar(e.id, 4).map(({ entity: x, score }) =>
          `<button class="dm-sim" data-dm-sel="${x.id}" title="${esc(x.name)} · ${score}" style="${toneBg(x)}">${KICON[x.kind] || '▦'}</button>`).join('') || '<span class="dm-dim">없음</span>'}</div>`,
      var: () => `<div class="dm-h">Variant ${vars.length}개 (§5)</div>
        ${vars.length ? vars.map((v) => `<div class="dm-ver"><span>${esc(v.label)}</span><span class="dm-mono">${esc(v.format)}</span>
          <button class="mk-btn sm" data-dm-dl="${e.id}:${v.key}">↓</button></div>`).join('') : '<div class="dm-dim">variant 없음</div>'}
        <button class="mk-btn dm-w100" data-dm-varadd="${e.id}">+ Dark variant 추가</button>`,
    };
    return `<aside class="dm-ins">
      <div class="dm-prev" style="${toneBg(e)}" data-dm-full="${e.id}"><span class="dm-prev-ic">${KICON[e.kind] || '▦'}</span>
        <span class="dm-prev-zoom">⛶ 크게 보기</span></div>
      <div class="dm-ins-name">${esc(e.name)}
        <button class="dm-star lg" data-dm-star="${e.id}">${d.isStar(e.id) ? '★' : '☆'}</button>
        <button class="dm-star lg" data-dm-pin="${e.id}">${d.isPin(e.id) ? '📌' : '📍'}</button></div>
      <div class="dm-tabs">${tabs.map(([k, n]) => `<button class="dm-tab ${S.tab === k ? 'on' : ''}" data-dm-tab="${k}">${n}</button>`).join('')}</div>
      <div class="dm-ins-body">${body[S.tab] ? body[S.tab]() : ''}</div>
      <button class="mk-btn dm-w100" data-dm-dl="${e.id}:origin">원본 다운로드</button>
    </aside>`;
  }

  /* ---------- 풀스크린 프리뷰 (§26) ---------- */
  function fullPreview() {
    const d = D(); const e = S.sel ? d.get(S.sel) : null;
    if (!S.preview || !e) return '';
    return `<div class="dm-fs ${S.previewDark ? 'dark' : ''}" data-dm-fsclose="1">
      <div class="dm-fs-stage" style="${toneBg(e)}"><span class="dm-fs-ic">${KICON[e.kind] || '▦'}</span><span>${esc(e.name)}</span></div>
      <div class="dm-fs-bar"><button class="mk-btn sm" data-dm-fsbg="1">배경 전환</button><button class="mk-btn sm" data-dm-fsclose="1">닫기 ✕</button></div>
    </div>`;
  }

  /* ---------- 렌더 ---------- */
  function render() {
    const l = items();
    const pg = D().page(l, 0, S.cursor + S.pageSize);
    const kinds = ['', ...new Set(D().list().map((e) => e.kind))];
    return `<div class="dm-wrap">
      ${leftPanel()}
      <section class="dm-mid">
        <div class="dm-bar">
          <input class="mk-input dm-q" id="dmQ" placeholder="이름·태그·캡션·OCR·색으로 검색 — 예) 푸른 하늘" value="${esc(S.q)}">
          <select class="mk-input" id="dmKind">${kinds.map((k) => `<option value="${k}" ${S.kind === k ? 'selected' : ''}>${k || '모든 종류'}</option>`).join('')}</select>
          <select class="mk-input" id="dmOrient">${[['', '방향'], ['landscape', '가로'], ['portrait', '세로'], ['square', '정방']].map(([v, n]) => `<option value="${v}" ${S.orient === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
          <select class="mk-input" id="dmSort">${[['recent', '최신'], ['name', '이름'], ['used', '많이 사용']].map(([v, n]) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${n}</option>`).join('')}</select>
          <span class="dm-views">${[['grid', '▦'], ['list', '☰'], ['large', '◻']].map(([v, i]) => `<button class="mk-iconbtn ${S.view === v ? 'on' : ''}" data-dm-view="${v}">${i}</button>`).join('')}</span>
          <button class="mk-btn" id="dmUp">⇧ 업로드 시뮬</button>
        </div>
        <div class="dm-meta-line">${pg.total}개 · 검색 ${S.lastSearchMs}ms ${S.q ? `· "${esc(S.q)}"` : ''}</div>
        <div class="dm-grid ${S.view}" id="dmGrid">${pg.items.map((e) => card(e, S.view)).join('') || '<div class="dm-dim" style="padding:40px">결과 없음</div>'}</div>
        ${pg.next != null && pg.items.length < pg.total ? `<button class="mk-btn dm-more" data-dm-more="1">더 불러오기 (${pg.items.length}/${pg.total})</button>` : ''}
        <div id="dmUpOut" class="dm-out" hidden></div>
      </section>
      ${inspector()}
      ${fullPreview()}
    </div>`;
  }

  /* ---------- 마운트 ---------- */
  function mount(host) {
    const d = D();
    const rerender = () => { host.innerHTML = render(); mount(host); };
    const on = (sel2, ev, fn) => host.querySelectorAll(sel2).forEach((el) => (el[ev] = fn(el)));

    on('#dmQ', 'oninput', (el) => () => { S.q = el.value; S.cursor = 0; const t = el.selectionStart; rerender(); const q = host.querySelector('#dmQ'); q.focus(); q.setSelectionRange(t, t); });
    on('#dmKind', 'onchange', (el) => () => { S.kind = el.value; S.cursor = 0; rerender(); });
    on('#dmOrient', 'onchange', (el) => () => { S.orient = el.value; S.cursor = 0; rerender(); });
    on('#dmSort', 'onchange', (el) => () => { S.sort = el.value; rerender(); });
    on('[data-dm-view]', 'onclick', (el) => () => { S.view = el.dataset.dmView; rerender(); });
    on('[data-dm-src]', 'onclick', (el) => () => { S.src = el.dataset.dmSrc; S.cursor = 0; rerender(); });
    on('[data-dm-more]', 'onclick', () => () => { S.cursor += S.pageSize; rerender(); });
    on('[data-dm-sel]', 'onclick', (el) => (ev) => {
      if (ev.target.closest('[data-dm-star],[data-dm-pin]')) return;
      S.sel = el.dataset.dmSel; d.touchRecent(S.sel); rerender();
    });
    on('[data-dm-star]', 'onclick', (el) => (ev) => { ev.stopPropagation(); d.star(el.dataset.dmStar); rerender(); });
    on('[data-dm-pin]', 'onclick', (el) => (ev) => { ev.stopPropagation(); d.pin(el.dataset.dmPin); rerender(); });
    on('[data-dm-tab]', 'onclick', (el) => () => { S.tab = el.dataset.dmTab; rerender(); });
    on('[data-dm-scope]', 'onchange', (el) => () => { d.setScope('me', el.dataset.dmScope, el.value); rerender(); });
    on('[data-dm-vres]', 'onclick', (el) => () => { d.restoreVersion('me', S.sel, el.dataset.dmVres); rerender(); });
    on('[data-dm-vcmp]', 'onclick', () => () => {
      const vs = d.versions(S.sel), r = d.compareVersions(S.sel, vs[vs.length - 2].verId, vs[vs.length - 1].verId);
      const o = host.querySelector('#dmVcmp'); o.hidden = false;
      o.textContent = r.same ? '동일 — 변경 없음' : r.diff.map((x) => `${x.field}: ${JSON.stringify(x.from)} → ${JSON.stringify(x.to)}`).join('\n');
    });
    on('[data-dm-varadd]', 'onclick', (el) => () => { d.addVariant(el.dataset.dmVaradd, 'dark', 'Dark', { format: 'png' }); rerender(); });
    on('[data-dm-repl]', 'onclick', (el) => () => {
      const to = host.querySelector('#dmReplSel')?.value; if (!to) return;
      const r = d.replaceEverywhere('me', el.dataset.dmRepl, to);
      const o = host.querySelector('#dmReplOut'); o.hidden = false;
      o.textContent = r.ok ? `교체 완료 — usage ${r.report.usage}건 · 템플릿 ${r.report.templates.length} · 프로젝트 ${r.report.projects.length}` : '거부: ' + r.why;
    });
    on('[data-dm-dl]', 'onclick', (el) => (ev) => { ev.stopPropagation(); el.textContent = '✓'; setTimeout(() => { el.textContent = el.dataset.dmDl.endsWith('origin') ? '원본 다운로드' : '↓'; }, 600); });
    on('[data-dm-full]', 'onclick', () => (ev) => { if (ev.target.closest('.dm-prev-zoom') || ev.currentTarget) { S.preview = true; rerender(); } });
    on('[data-dm-fsclose]', 'onclick', () => (ev) => { if (ev.target.dataset.dmFsclose || ev.target.closest('[data-dm-fsclose]') === ev.currentTarget) { S.preview = false; rerender(); } });
    on('[data-dm-fsbg]', 'onclick', () => (ev) => { ev.stopPropagation(); S.previewDark = !S.previewDark; rerender(); });
    on('#dmUp', 'onclick', () => () => {
      d.enqueueUpload('업로드 데모 ' + (Math.random() * 100 | 0) + '.jpg', 'photo', 700000, { tags: ['업로드'], tone: 'teal' });
      let r; do { r = d.stepUploads(2); } while (r.jobs.some((j) => j.state !== 'complete'));
      const o = host.querySelector('#dmUpOut'); o.hidden = false;
      o.textContent = r.jobs.map((j) => `${j.name} — ${j.done}/${j.chunks} 청크 ${j.state}${j.assetId ? ' → ' + j.assetId : ''}`).join('\n');
      setTimeout(rerender, 400);
    });
    /* 드래그 — dataTransfer에 Reference만 싣는다 (파일 복사 아님) */
    on('[data-dm-drag]', 'ondragstart', (el) => (ev) => {
      ev.dataTransfer.setData('application/x-mk-asset-ref', JSON.stringify(d.ref(el.dataset.dmDrag)));
    });
    on('[data-dm-cloud]', 'onclick', (el) => () => {
      const plan = d.cloudPlan(el.dataset.dmCloud);
      const o = host.querySelector('#dmUpOut'); o.hidden = false;
      o.textContent = `[${plan.connector}] state=${plan.state}\n` + JSON.stringify(plan.request, null, 1);
    });
  }

  window.MK_SCREENS.assets = { title: 'Assets', variants: ['DAM'], render: () => render(), mount, flush: true, _S: S };
})();
