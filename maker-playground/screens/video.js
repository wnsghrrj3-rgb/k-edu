/* ============================================================
   screens/video.js (R53) — Video 허브
   ------------------------------------------------------------
   · 구조 템플릿(MK_COMPOSE Composition) 카드: 권장 미디어 수·
     예상 길이·기본 비율을 정직하게 표시
   · 카드 선택 → 테마 칩 + 제목/부제(선택) → 파일 선택 →
     MK_COMPOSE.buildProject → 에디터 (MK_START.open 동일 경로)
   · R43 「빠른 시작」(MK_START)·기존 템플릿 진입은 그대로 존속
   · misc.js의 video 화면을 로드 순서로 승격 대체 (add-only 파일)
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_VIDHUB = (() => {
  const st = { comp: null, theme: null, title: '', sub: '', msg: '' };

  const comps = () => (window.MK_COMPOSE ? window.MK_COMPOSE.listCompositions() : []);
  const themes = () => (window.MK_COMPOSE ? window.MK_COMPOSE.listThemes() : []);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 카드 메타 문구 — 지시서 §R53: 권장 미디어 수·예상 길이·비율 */
  const mediaText = (c) => {
    const m = c.recommendedMediaCount || {};
    if (!m.min && !m.max) return '사진 없이도 가능';
    const range = m.min === m.max ? `${m.min}장` : `${m.min}~${m.max}장`;
    return `사진·영상 ${range}` + (m.ideal ? ` (딱 좋아요: ${m.ideal}장)` : '');
  };
  const durText = (c) => {
    const d = c.recommendedDuration || {};
    return d.default ? `약 ${d.default}초` : '길이 자동';
  };

  /* 선택 초기화 — 테마 기본값은 첫 번째 */
  function select(compId) {
    st.comp = st.comp === compId ? null : compId;
    st.msg = '';
    if (st.comp && !st.theme) { const t = themes(); st.theme = t.length ? t[0].id : null; }
  }

  /* 본체 — 미디어 배열로 프로젝트 생성 후 에디터 진입 (테스트 시임) */
  function startBuild(medias) {
    if (!window.MK_COMPOSE || !st.comp) return { ok: false, why: 'no-selection' };
    const texts = {};
    if (st.title.trim()) texts.title = st.title.trim();
    if (st.sub.trim()) texts.subtitle = st.sub.trim();
    const r = window.MK_COMPOSE.buildProject(st.comp, st.theme, { medias: medias || [], texts });
    if (!r.ok) { st.msg = r.guide || '만들 수 없어요 — 입력을 확인해 주세요.'; return r; }
    /* 정직 안내 — 남은 미디어·자동 조정 내역을 열기 전에 알린다 */
    const notes = (r.notes || []).slice();
    if (r.unusedMedia > 0 && !notes.some((n) => /남/.test(n))) notes.push(`사진 ${r.unusedMedia}장은 이 구조에 자리가 없어 쓰이지 않았어요.`);
    if (notes.length && typeof window.alert === 'function') window.alert(notes.join('\n'));
    window.MK_START.open(r.doc);
    return r;
  }

  /* 파일 선택 → dataURL → startBuild (MK_START.readFiles 재사용) */
  function pick(onMsg) {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*,video/*';
    inp.onchange = () => {
      if (!inp.files || !inp.files.length) return;
      if (onMsg) onMsg('여는 중… ' + inp.files.length + '개');
      window.MK_START.readFiles(inp.files, (medias, skipped) => {
        if (!medias.length) { if (onMsg) onMsg('열 수 있는 파일이 없어요' + (skipped.length ? ' — ' + skipped[0] : '')); return; }
        const r = startBuild(medias);
        if (!r.ok && onMsg) onMsg(st.msg);
        if (skipped.length && typeof window.alert === 'function') window.alert('건너뜀: ' + skipped.join(', '));
      });
    };
    inp.click();
  }

  return { st, select, startBuild, pick, mediaText, durText, esc };
})();

window.MK_SCREENS.video = {
  title: 'Video', variants: ['A'],
  render() {
    const H = window.MK_VIDHUB; const esc = H.esc;
    const cards = H.st && window.MK_COMPOSE ? window.MK_COMPOSE.listCompositions() : [];
    const cardHtml = cards.map((c) => `
      <button class="vh-card${H.st.comp === c.id ? ' on' : ''}" data-vh-comp="${c.id}">
        <b>${esc(c.name)}</b>
        <span class="vh-purpose">${esc(c.purpose || '')}</span>
        <span class="vh-meta">
          <span class="vh-badge">📷 ${esc(H.mediaText(c))}</span>
          <span class="vh-badge">⏱ ${esc(H.durText(c))}</span>
          <span class="vh-badge">${esc(c.defaultRatio)}</span>
        </span>
      </button>`).join('');

    let panel = '';
    if (H.st.comp) {
      const c = cards.find((x) => x.id === H.st.comp);
      const chips = (window.MK_COMPOSE.listThemes()).map((t) =>
        `<button class="vh-chip${H.st.theme === t.id ? ' on' : ''}" data-vh-theme="${t.id}">${esc(t.name)}</button>`).join('');
      panel = `<div class="vh-panel" id="vhPanel">
        <b style="font:var(--mk-t-h3)">${esc(c ? c.name : '')} 만들기</b>
        <div style="margin-top:10px"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">분위기</small><div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">${chips}</div></div>
        <input class="vh-input" id="vhTitle" placeholder="제목 (비우면 제목 장면이 자동으로 빠져요)" value="${esc(H.st.title)}" maxlength="24">
        <input class="vh-input" id="vhSub" placeholder="부제 (선택)" value="${esc(H.st.sub)}" maxlength="30">
        <button class="vh-go" data-vh-pick>📁 사진·영상 고르고 만들기</button>
        <em id="vhMsg" style="display:block;margin-top:8px;font:var(--mk-t-body-sm);color:var(--mk-danger)">${esc(H.st.msg)}</em>
        <p class="ed-note" style="margin-top:8px">고른 사진 수에 맞춰 장면이 자동으로 늘고 줄어요 — 만들고 나서 글자·사진 전부 바꿀 수 있어요.</p>
      </div>`;
    }

    return `<span class="pg-note">구조를 고르면 사진 수에 맞춰 영상이 자동으로 짜여요 — 켄번즈·배경음까지 포함</span>
      <div class="vh-quick">
        <button class="ph-block st-act" data-st="vid-files" style="text-align:left;cursor:pointer">
          <b>⚡ 빠른 시작 — 내 사진·영상으로 15초</b>
          구조 없이 장당 1장면. 지금까지 방식 그대로.
          <em id="stMsgV" style="display:block;margin-top:6px;color:var(--mk-text-secondary)"></em></button>
        <button class="ph-block st-act" data-st="vid-tpl" style="text-align:left;cursor:pointer">
          <b>🎬 완성형 템플릿 — 행사 하이라이트 15초</b>
          사진 2장 + 문구 4개만 바꾸는 고정 구성.</button>
        <button class="ph-block st-act" data-st="go-projects" style="text-align:left;cursor:pointer">
          <b>▶ 하던 작업 이어서</b>
          내 프로젝트 목록에서 열어요.</button>
      </div>
      <h2 style="font:var(--mk-t-h2);margin:0 0 10px">구조 템플릿으로 만들기</h2>
      <div class="vh-grid">${cardHtml}</div>
      ${panel}
      <p class="ed-note" style="margin-top:12px">MP4 내보내기는 크롬·엣지에서 돼요 (소리 포함). 박자 맞춤(beatSync)은 아직 없어요 — 음악 길이 자동 맞춤·페이드아웃까지 돼요.</p>`;
  },
  mount(root) {
    const H = window.MK_VIDHUB;
    const redraw = () => { root.innerHTML = this.render(); this.mount(root); };
    root.querySelectorAll('[data-st]').forEach((b) => b.onclick = () => {
      if (b.dataset.st === 'vid-files') return window.MK_START.pickAndStart('video', (m) => { const el = root.querySelector('#stMsgV'); if (el) el.textContent = m; });
      if (b.dataset.st === 'vid-tpl') return window.MK_TPL.load('pk-vid-01');
      if (b.dataset.st === 'go-projects') return window.PG.go('projects');
    });
    root.querySelectorAll('[data-vh-comp]').forEach((b) => b.onclick = () => { H.select(b.dataset.vhComp); redraw(); });
    root.querySelectorAll('[data-vh-theme]').forEach((b) => b.onclick = () => { H.st.theme = b.dataset.vhTheme; redraw(); });
    const ti = root.querySelector('#vhTitle'); if (ti) ti.oninput = () => { H.st.title = ti.value; };
    const su = root.querySelector('#vhSub'); if (su) su.oninput = () => { H.st.sub = su.value; };
    const go = root.querySelector('[data-vh-pick]'); if (go) go.onclick = () => H.pick((m) => { const el = root.querySelector('#vhMsg'); if (el) el.textContent = m; });
  },
};
