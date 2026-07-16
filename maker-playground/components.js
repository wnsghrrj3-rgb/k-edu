/* ============================================================
   K-MAKER 공통 컴포넌트  (문자열 템플릿 함수 — 현 스택: 바닐라 JS)
   화면(screens/*)은 반드시 이 함수들로 UI를 조립한다.
   ============================================================ */
window.MK = (() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* MakerButton */
  /* 서비스급 Button — kind: ''(primary)|secondary|outline|ghost|danger|success|accent
     sim: hover|pressed|focus|disabled (갤러리 상태 고정용) */
  const Button = ({ label = '', kind = '', size = '', icon = '', iconRight = '', iconOnly = false, loading = false, disabled = false, sim = '', attrs = '' }) =>
    `<button class="mk-btn ${kind} ${size} ${iconOnly ? 'icon-only' : ''} ${loading ? 'is-loading' : ''} ${sim ? 'is-' + sim : ''}"` +
    `${disabled || sim === 'disabled' ? ' disabled' : ''}${iconOnly ? ` aria-label="${esc(label)}"` : ''} ${attrs}>` +
    `${loading ? '<span class="mk-spin"></span>' : ''}${icon && !loading ? `<span class="ic">${icon}</span>` : ''}` +
    `${iconOnly ? '' : esc(label)}${iconRight && !iconOnly ? `<span class="ic">${iconRight}</span>` : ''}</button>`;

  /* MakerIconButton */
  const IconButton = ({ icon, tip = '', on = false, attrs = '' }) =>
    `<button class="mk-iconbtn ${on ? 'on' : ''} ${tip ? 'mk-tooltip' : ''}" ${tip ? `data-tip="${esc(tip)}"` : ''} ${attrs}>${icon}</button>`;

  /* MakerBadge */
  const Badge = ({ label, tone = '' }) => `<span class="mk-badge ${tone}">${esc(label)}</span>`;

  /* MakerChip */
  const Chip = ({ label, on = false, attrs = '' }) =>
    `<button class="mk-chip ${on ? 'on' : ''}" ${attrs}>${esc(label)}</button>`;

  /* MakerTabs */
  const Tabs = ({ items, on, attrs = '' }) =>
    `<div class="mk-tabs" style="max-width:260px">` + items.map((it) =>
      `<button class="mk-tab ${it === on ? 'on' : ''}" ${attrs} data-tab="${esc(it)}">${esc(it)}</button>`).join('') + `</div>`;

  /* 씬 축약 썸네일 (Scene 요소를 미니 SVG로) */
  const sceneThumb = (scene) => {
    const W = 160, H = Math.round(160 * scene.height / scene.width);
    let out = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%;background:${scene.background}">`;
    for (const el of scene.elements) {
      const x = el.x / 100 * W, y = el.y / 100 * H, w = el.w / 100 * W;
      if (el.kind === 'text') {
        const lines = String(el.text).split('\n');
        lines.forEach((ln, i) => {
          const fh = Math.max(2, el.size / 100 * H * 0.9);
          out += `<rect x="${x}" y="${y + i * fh * 1.3}" width="${Math.min(w, ln.length * fh * 0.55)}" height="${fh}" rx="${fh / 2}" fill="${scene.background === '#1F2733' ? '#E7EAEF' : '#3A4454'}" opacity="${el.weight >= 700 ? 0.85 : 0.4}"/>`;
        });
      } else {
        out += `<rect x="${x}" y="${y}" width="${w}" height="${el.h / 100 * H}" rx="3" fill="#C9D2DE" opacity=".55"/>`;
      }
    }
    return out + `</svg>`;
  };

  /* MakerTemplateCard — opts: { fav: 즐겨찾기 여부 } */
  const TemplateCard = (tpl, attrs = '', opts = {}) =>
    `<button class="mk-tplcard" ${attrs}>
      <div class="thumb"><span class="type">${esc(tpl.category)}</span>
        <span class="fav ${opts.fav ? 'on' : ''}">${opts.fav ? '★' : '☆'}</span>
        <svg viewBox="0 0 160 ${Math.round(160 * tpl.scenes[0].height / tpl.scenes[0].width)}" style="aspect-ratio:${tpl.scenes[0].width}/${tpl.scenes[0].height};background:#fff">${sceneThumb(tpl.scenes[0]).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>
      </div>
      <div class="meta"><b>${esc(tpl.title)}</b><small>${esc(tpl.style)} · ${esc(tpl.ratio)} · 장면 ${tpl.scenes.length}${tpl.difficulty ? '</small><span class="diff">' + esc(tpl.difficulty) + '</span><small>' : ''}</small></div>
    </button>`;

  /* MakerSceneCard — opts: { active: 재생 중 표시 } */
  const SceneCard = (scene, i, on, attrs = '', opts = {}) =>
    `<div class="mk-scenecard ${on ? 'on' : ''} ${opts.active ? 'active' : ''}">
      <button class="frame" ${attrs}><span class="num">${i + 1}</span>${opts.active ? '<span class="playing">▶</span>' : ''}${scene.duration ? `<span class="dur">⏱ ${scene.duration}초</span>` : ''}${sceneThumb(scene)}</button>
      <span class="nm">${esc(scene.name)}</span>
      <div class="ed-sceneops">
        <button data-op="dup" data-i="${i}">⧉ 복제</button>
        <button data-op="del" data-i="${i}">✕ 삭제</button>
      </div>
    </div>`;

  /* Asset placeholder 썸네일 — tone 색면 + 유형 심볼 (실이미지 자리표시) */
  const assetThumb = (asset) => {
    const [bg, fg] = (window.MK_ASSETS?.TONES[asset.tone]) || ['#E7EAEF', '#5B6472'];
    const icon = (window.MK_ASSETS?.CATEGORIES.find((c) => c.key === asset.category) || {}).icon || '▦';
    return `<div class="mk-assetthumb" style="aspect-ratio:${asset.ratio};background:${bg};color:${fg}">
      <span class="sym">${icon}</span><span class="tp">${esc(asset.type)}</span></div>`;
  };

  /* MakerAssetCard — mode: grid|list / opts: { fav, selected } */
  const AssetCard = (asset, mode = 'grid', opts = {}, attrs = '') =>
    `<div class="mk-assetcard ${mode} ${opts.selected ? 'on' : ''}" draggable="true" data-asset="${asset.id}" ${attrs}>
      ${assetThumb(asset)}
      <div class="meta">
        <b title="${esc(asset.name)}">${esc(asset.name)}</b>
        <small>${esc(asset.type)} · ${esc(asset.size)}</small>
      </div>
      <button class="fav ${opts.fav ? 'on' : ''}" data-fav="${asset.id}" aria-label="즐겨찾기">${opts.fav ? '♥' : '♡'}</button>
      <button class="more" data-more="${asset.id}" aria-label="더 보기">⋯</button>
    </div>`;

  /* MakerModal — open(내용) / close() */
  const Modal = {
    open(html) {
      this.close();
      const back = document.createElement('div');
      back.className = 'mk-modal-back'; back.id = 'mkModal';
      back.innerHTML = `<div class="mk-modal">${html}</div>`;
      back.onclick = (e) => { if (e.target === back) Modal.close(); };
      document.body.appendChild(back);
    },
    close() { document.getElementById('mkModal')?.remove(); },
  };

  return { esc, Button, IconButton, Badge, Chip, Tabs, sceneThumb, TemplateCard, SceneCard, Modal, assetThumb, AssetCard };
})();
