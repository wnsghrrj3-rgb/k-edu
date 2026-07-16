/* ============================================================
   화면: Templates — Template Browser v1 (Template Engine 기반)
   ------------------------------------------------------------
   좌: 카테고리 8 (지시서 순서 고정) + 즐겨찾기·최근 사용
   상단: 검색 · 스타일 필터 · 정렬
   중앙: Template Grid (썸네일·제목·스타일·Scene수·비율·추천대상·AI추천)
   Preview: 2단 대형 모달 — 좌 큰 Preview(씬 넘김) / 우 엔진 정보
            (Scene수·Asset·Animation·Font·Color·용도) + 액션 5종
   Scene Loader: "이 템플릿 사용" → MK_TPL.load → Editor
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

(() => {
  const M = () => window.MK, E = () => window.MK_TPL;

  /* 세션 상태 */
  const S = { cat: 'all', q: '', style: '전체', sort: 'recommend', favs: new Set(), recents: [], prevIdx: 0 };

  const touchRecent = (id) => { S.recents = [id, ...S.recents.filter((x) => x !== id)].slice(0, 8); };

  function items() {
    let list = E().list();
    if (S.cat === 'fav') list = list.filter((t) => S.favs.has(t.templateId));
    else if (S.cat === 'recent') list = S.recents.map((id) => E().get(id)).filter(Boolean);
    else if (S.cat !== 'all') list = list.filter((t) => t.contentType === S.cat);
    if (S.style !== '전체') list = list.filter((t) => t.style === S.style);
    if (S.q) {
      const q = S.q.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.ai.tags || []).some((x) => x.toLowerCase().includes(q)));
    }
    if (S.cat !== 'recent') {
      if (S.sort === 'recommend') list = [...list].sort((a, b) => (b.ai.recommended ? 1 : 0) - (a.ai.recommended ? 1 : 0));
      if (S.sort === 'name') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'ko'));
      if (S.sort === 'scenes') list = [...list].sort((a, b) => b.scenes.length - a.scenes.length);
    }
    return list;
  }

  /* ---------- Preview 모달 (2단) ---------- */
  function openPreview(id) {
    const m = M(), r = E().resolve(id);
    if (!r) return;
    S.prevIdx = 0;
    const t = r.template;
    const draw = () => {
      const sc = r.scenes[S.prevIdx];
      const info = [
        ['Scene 수', `${r.scenes.length}장${t.contentType === 'video' ? ' · ⏱ ' + r.scenes.reduce((a, s) => a + (s.duration || 0), 0) + '초' : ''}`],
        ['사용 Asset', r.assets.length ? r.assets.map((a) => a.name).join(', ') : '없음'],
        ['포함 Animation', `${r.animation.name} — ${r.animation.desc}`],
        ['사용 Font', `${r.style.fonts.heading} / ${r.style.fonts.body}`],
        ['추천 용도', r.meta.uses],
        ['추천 대상', `${r.meta.targetUser === 'teacher' ? '교사' : '학생'} · ${r.meta.gradeRange}`],
      ];
      return `<div class="te-prev">
        <div class="left">
          <div class="stage">${m.sceneThumb(sc)}</div>
          <div class="strip">${r.scenes.map((s, i) => `<button class="th ${i === S.prevIdx ? 'on' : ''}" data-te-sc="${i}">${m.sceneThumb(s)}</button>`).join('')}</div>
          <small class="scnm">${S.prevIdx + 1}/${r.scenes.length} · ${m.esc(sc.name)}</small>
        </div>
        <div class="right">
          <h2>${m.esc(t.title)} ${t.ai.recommended ? '<span class="airec">✦ AI 추천</span>' : ''}</h2>
          <p class="desc">${m.esc(t.description)} · ${m.esc(t.style)} · ${m.esc(t.ratio)}</p>
          <table class="info">${info.map(([k, v]) => `<tr><th>${k}</th><td>${m.esc(v)}</td></tr>`).join('')}</table>
          <div class="sg"><h4>사용 Color</h4><div class="swrow">${r.style.palette.map((c) => `<span class="sw" style="background:${c}" title="${c}"></span>`).join('')}</div></div>
          <div class="acts">
            ${m.Button({ label: '이 템플릿 사용', kind: 'accent', attrs: `data-te-use="${id}"` })}
            <div class="row">
              ${m.Button({ label: '▶ 미리보기', kind: 'secondary', size: 'sm', attrs: 'data-te-play' })}
              ${m.Button({ label: S.favs.has(id) ? '★ 해제' : '☆ 즐겨찾기', kind: 'secondary', size: 'sm', attrs: `data-te-fav="${id}"` })}
              ${m.Button({ label: '⧉ 복제', kind: 'secondary', size: 'sm', attrs: `data-te-dup="${id}"` })}
              ${m.Button({ label: '✦ AI 수정', kind: 'secondary', size: 'sm', attrs: `data-te-ai="${id}"` })}
            </div>
          </div>
        </div>
      </div>`;
    };
    m.Modal.open(draw());
    const back = document.getElementById('mkModal');
    back.querySelector('.mk-modal').classList.add('te-wide');
    let timer = null;
    const wire = () => {
      back.querySelectorAll('[data-te-sc]').forEach((b) => b.onclick = () => { S.prevIdx = +b.dataset.teSc; redraw(); });
      back.querySelector('[data-te-use]').onclick = () => { clearInterval(timer); m.Modal.close(); touchRecent(id); E().load(id); };
      back.querySelector('[data-te-play]').onclick = () => { /* 씬 순차 재생 시뮬레이션 */
        clearInterval(timer);
        timer = setInterval(() => { S.prevIdx = (S.prevIdx + 1) % r.scenes.length; redraw(); }, 900);
      };
      back.querySelector('[data-te-fav]').onclick = () => { S.favs.has(id) ? S.favs.delete(id) : S.favs.add(id); redraw(); PG.render(); };
      back.querySelector('[data-te-dup]').onclick = () => {
        const c = E().duplicate(id);
        clearInterval(timer); m.Modal.close(); PG.render();
        setTimeout(() => openPreview(c.templateId), 0);
      };
      back.querySelector('[data-te-ai]').onclick = () => { clearInterval(timer); m.Modal.close(); PG.go('ai'); };
    };
    const redraw = () => { back.querySelector('.mk-modal').innerHTML = draw(); wire(); };
    wire();
    back.addEventListener('click', (e) => { if (e.target === back) clearInterval(timer); });
  }

  window.MK_SCREENS.templates = {
    title: 'Templates', variants: ['v1'],
    render() {
      const m = M();
      const list = items();
      const cats = [['all', '전체'], ...E().CATEGORIES, ['fav', '☆ 즐겨찾기'], ['recent', '⟳ 최근 사용']];
      const counts = (k) => k === 'all' ? E().list().length
        : k === 'fav' ? S.favs.size : k === 'recent' ? S.recents.length
        : E().list().filter((t) => t.contentType === k).length;
      const styles = window.MK_SAMPLE.STYLES;
      return `<span class="pg-note">Template Engine v1 — 샘플 8종+α · 실API·실템플릿(kmake 46종) 연결은 후속</span>
        <div class="te-shell">
          <aside class="te-left">${cats.map(([k, n]) => `<button class="te-cat ${S.cat === k ? 'on' : ''}" data-te-cat="${k}"><span>${n}</span><span class="cnt">${counts(k)}</span></button>`).join('')}</aside>
          <div class="te-main">
            <div class="te-toolbar">
              <div class="as-search"><span>🔍</span><input id="teQ" type="search" placeholder="템플릿 검색 — 제목·태그" value="${m.esc(S.q)}"></div>
              <select id="teSort" class="as-select">
                <option value="recommend" ${S.sort === 'recommend' ? 'selected' : ''}>AI 추천순</option>
                <option value="name" ${S.sort === 'name' ? 'selected' : ''}>이름순</option>
                <option value="scenes" ${S.sort === 'scenes' ? 'selected' : ''}>장면 많은순</option>
              </select>
            </div>
            <div class="as-tags">${styles.map((s) => m.Chip({ label: s, on: S.style === s, attrs: `data-te-style="${s}"` })).join('')}</div>
            ${list.length
              ? `<div class="br-grid">${list.map((t) => m.TemplateCard(t, `data-tpl="${t.templateId}"`, { fav: S.favs.has(t.templateId), aiRec: t.ai.recommended, target: t.targetUser === 'teacher' ? '교사용' : '학생용' })).join('')}</div>`
              : `<div class="br-empty">${S.cat === 'fav' ? '카드의 ☆ 또는 미리보기에서 즐겨찾기를 모아 보세요' : S.cat === 'recent' ? '아직 사용한 템플릿이 없어요' : '이 조건의 템플릿이 없어요'}</div>`}
          </div>
        </div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-te-cat]').forEach((b) => b.onclick = () => { S.cat = b.dataset.teCat; PG.render(); });
      root.querySelectorAll('[data-te-style]').forEach((b) => b.onclick = () => { S.style = b.dataset.teStyle; PG.render(); });
      const q = root.querySelector('#teQ');
      if (q) q.oninput = () => { S.q = q.value; const pos = q.selectionStart; PG.render(); const nq = document.getElementById('teQ'); nq.focus(); nq.setSelectionRange(pos, pos); };
      const so = root.querySelector('#teSort');
      if (so) so.onchange = () => { S.sort = so.value; PG.render(); };
      root.querySelectorAll('[data-tpl]').forEach((b) => b.onclick = () => openPreview(b.dataset.tpl));
    },
  };
})();
