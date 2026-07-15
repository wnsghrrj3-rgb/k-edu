/* ============================================================
   화면: Templates (Template Browser)
   variant A: 상단 칩 필터 + 그리드
   variant B: 좌측 필터 사이드바 + 그리드
   카드 클릭 → 미리보기 모달 → "이 템플릿 사용" → Editor
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.templates = {
  title: 'Templates', variants: ['A', 'B'],
  render(v) {
    const S = window.MK_SAMPLE, M = window.MK, st = PG.state.browser;
    const typeName = (k) => (S.TYPES.find((t) => t.key === k) || {}).name || '전체';
    let list = S.TEMPLATES;
    if (st.type !== 'all') list = list.filter((t) => t.contentType === st.type);
    if (st.style !== '전체') list = list.filter((t) => t.style === st.style);

    const cards = list.length
      ? `<div class="br-grid">${list.map((t) => M.TemplateCard(t, `data-tpl="${t.templateId}"`)).join('')}</div>`
      : `<div class="br-empty">이 조건의 샘플 템플릿이 아직 없어요 (임시 데이터 6종)</div>`;
    const styleChips = S.STYLES.map((s) => M.Chip({ label: s, on: st.style === s, attrs: `data-style="${s}"` })).join('');

    if (v === 'B') {
      const side = [['all', '전체'], ...S.TYPES.filter((t) => t.key !== 'ai').map((t) => [t.key, t.name])]
        .map(([k, n]) => `<button class="${st.type === k ? 'on' : ''}" data-type="${k}">${n}</button>`).join('');
      return `<span class="pg-note">⚠ 샘플 템플릿 6종 — 실데이터(kmake 46종) 연결은 후속</span>
        <div class="br-layout"><div class="br-side">${side}</div>
        <div><div class="br-toolbar">${styleChips}</div>${cards}</div></div>`;
    }
    const typeChips = [['all', '전체'], ...S.TYPES.filter((t) => t.key !== 'ai').map((t) => [t.key, t.name])]
      .map(([k, n]) => M.Chip({ label: n, on: st.type === k, attrs: `data-type="${k}"` })).join('');
    return `<span class="pg-note">⚠ 샘플 템플릿 6종 — 실데이터(kmake 46종) 연결은 후속</span>
      <div class="br-toolbar">${typeChips}</div>
      <div class="br-toolbar" style="margin-top:-8px">${styleChips}</div>${cards}`;
  },
  mount(root) {
    const S = window.MK_SAMPLE, M = window.MK;
    root.querySelectorAll('[data-type]').forEach((b) => b.onclick = () => { PG.state.browser.type = b.dataset.type; PG.render(); });
    root.querySelectorAll('[data-style]').forEach((b) => b.onclick = () => { PG.state.browser.style = b.dataset.style; PG.render(); });
    root.querySelectorAll('[data-tpl]').forEach((b) => b.onclick = () => {
      const tpl = S.TEMPLATES.find((t) => t.templateId === b.dataset.tpl);
      const sc = tpl.scenes.map((s, i) => `<div style="width:96px;flex:none"><div style="border:1px solid var(--mk-border);border-radius:6px;overflow:hidden">${M.sceneThumb(s)}</div><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${i + 1}. ${M.esc(s.name)}</small></div>`).join('');
      M.Modal.open(`<h2>${M.esc(tpl.title)}</h2>
        <p style="color:var(--mk-text-secondary)">${M.esc(tpl.description)} · ${M.esc(tpl.style)} · ${M.esc(tpl.ratio)}${tpl.contentType === 'video' ? ' · ⏱ ' + tpl.scenes.reduce((a, s) => a + s.duration, 0) + '초' : ''}</p>
        <div style="display:flex;gap:10px;overflow-x:auto;margin:16px 0">${sc}</div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          ${M.Button({ label: '닫기', kind: 'secondary', attrs: 'onclick="MK.Modal.close()"' })}
          ${M.Button({ label: '이 템플릿 사용', kind: 'accent', attrs: `onclick="MK.Modal.close();PG.openEditor('${tpl.templateId}')"` })}
        </div>`);
    });
  },
};
