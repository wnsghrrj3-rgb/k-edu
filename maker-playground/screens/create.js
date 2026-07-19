/* ============================================================
   화면: Create Flow — K-MAKER 핵심 UX (Home → Editor 최단 경로)
   Step 1 종류 → Step 2 스타일 → Step 3 템플릿 → Step 4 미리보기 → Editor
   원칙: 긴 리스트를 먼저 보여주지 않는다. 한 단계 = 한 결정.
   내비에는 없음(고정 구조 유지) — Home·Screens에서 진입, #/create.
   ⚠ Placeholder 데이터 — 실제 편집 기능 없음, 클릭 흐름만.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.create = (() => {
  const M = () => window.MK, S = () => window.MK_SAMPLE;

  const TYPE_ORDER = ['presentation', 'video', 'cardnews', 'poster', 'worksheet', 'activity', 'thumbnail', 'sns'];
  const STYLES = [
    ['Modern', '깔끔한 직선과 대비'], ['Minimal', '여백 중심, 요소 최소'], ['Premium', '딥톤·차분한 고급감'],
    ['Kids', '밝고 동글동글'], ['Magazine', '잡지식 편집 조판'], ['Science', '탐구·도식 중심'], ['Creative', '자유로운 발상'],
  ];

  const st = () => {
    if (!PG.state.create) PG.state.create = { step: 1, type: null, style: null, tpl: null, brand: '' };
    return PG.state.create;
  };
  /* 외부 진입점: Home 제작 시작 카드 → 종류 선택 완료 상태로 Step 2 */
  const enter = (type) => { PG.state.create = { step: type ? 2 : 1, type: type || null, style: null, tpl: null }; PG.go('create'); };

  /* ---- 단계 표시줄 ---- */
  const stepbar = () => {
    const s = st(), T = S().TYPES.find((t) => t.key === s.type);
    const items = [
      [1, '종류', T ? T.name : null], [2, '스타일', s.style], [3, '템플릿', s.tpl ? '선택됨' : null], [4, '미리보기', null],
    ];
    return `<div class="cf-steps">` + items.map(([n, name, val]) =>
      `<button class="cf-step ${s.step === n ? 'on' : ''} ${s.step > n ? 'done' : ''}" data-cf-step="${n}" ${s.step <= n ? 'disabled' : ''}>
        <i>${s.step > n ? '✓' : n}</i>${name}${val && s.step > n ? `<small>${val}</small>` : ''}</button>`).join('<span class="cf-arrow">→</span>')
      + `<span style="flex:1"></span><button class="hv-more" data-cf-reset>처음부터</button></div>`;
  };

  /* ---- Step 1: 무엇을 만들까요? ---- */
  const step1 = () => {
    const T = S().TYPES, of = (k) => T.find((t) => t.key === k);
    return `<div class="cf-head"><h2>무엇을 만들까요?</h2><p>만들 것을 고르면 나머지는 K-MAKER가 도와요</p></div>
      <div class="hv-start cf-types">` + TYPE_ORDER.map((k) => { const t = of(k);
        return `<button class="hv-type" data-cf-type="${t.key}"><span class="ico">${t.ico}</span><b>${t.name}</b><small>${t.desc}</small></button>`; }).join('')
      + `<button class="hv-type ai" data-cf-ai style="border:1.5px dashed var(--mk-teal);background:var(--mk-teal-soft)"><span class="ico">✨</span><b>AI로 시작하기</b><small>설명하면 AI가 구성</small></button></div>`;
  };

  /* ---- Step 2: 스타일 선택 ---- */
  const step2 = () => {
    const T = S().TYPES.find((t) => t.key === st().type);
    return `<div class="cf-head"><h2>${T ? T.name + ', ' : ''}어떤 분위기로 만들까요?</h2><p>스타일은 나중에 편집기에서도 바꿀 수 있어요</p></div>
      <div class="cf-styles">` + STYLES.map(([n, d]) =>
        `<button class="cf-style" data-cf-style="${n}"><span class="sw sw-${n.toLowerCase()}"></span><b>${n}</b><small>${d}</small></button>`).join('') + `</div>`;
  };

  /* ---- Step 3: 템플릿 선택 ---- */
  const step3 = () => {
    const s = st();
    let list = S().TEMPLATES.filter((t) => t.contentType === s.type);
    let note = '';
    let styled = list.filter((t) => t.styleEn === s.style);
    if (styled.length) list = styled;
    else if (list.length) note = `<p class="hv-foot-note">"${s.style}" 스타일 샘플이 아직 없어 ${'같은 종류의 다른 스타일'}을 보여드려요 (Placeholder 6종)</p>`;
    const cards = list.length
      ? `<div class="br-grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">` + list.map((t) =>
          `<span class="cf-tplwrap">${t.recent ? `<span class="cf-recent">최근 사용</span>` : ''}${M().TemplateCard(t, `data-cf-tpl="${t.templateId}"`, { fav: t.recent })}</span>`).join('') + `</div>`
      : `<div class="br-empty">이 조합의 샘플이 아직 없어요<br><br>${M().Button({ label: '다른 스타일 보기', kind: 'secondary', size: 'sm', attrs: 'data-cf-back="2"' })}</div>`;
    return `<div class="cf-head"><h2>템플릿을 고르세요</h2><p>글자와 사진만 바꾸면 완성돼요</p></div>${note}${cards}`;
  };

  /* ---- Step 4: 미리보기 ---- */
  const step4 = () => {
    const tpl = S().TEMPLATES.find((t) => t.templateId === st().tpl);
    const sc0 = tpl.scenes[0];
    const els = tpl.scenes.reduce((a, s) => { s.elements.forEach((e) => a[e.kind] = (a[e.kind] || 0) + 1); return a; }, {});
    const use = `텍스트 ${els.text || 0} · 이미지 슬롯 ${els.image || 0}`;
    const strip = tpl.scenes.map((s, i) => `<div style="width:104px;flex:none"><div style="border:1.5px solid var(--mk-border);border-radius:6px;overflow:hidden">${M().sceneThumb(s)}</div><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${i + 1}. ${M().esc(s.name)}${s.duration ? ' · ' + s.duration + 's' : ''}</small></div>`).join('');
    return `<div class="cf-pv">
      <div class="cf-pv-main">
        <div class="cf-pv-big" style="aspect-ratio:${sc0.width}/${sc0.height}">${M().sceneThumb(sc0)}</div>
        <div class="cf-pv-strip">${strip}</div>
      </div>
      <div class="cf-pv-side">
        <h2>${M().esc(tpl.title)}</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin:8px 0 4px">${M().esc(tpl.description)}</p>
        <div class="kvs">
          <div class="kv"><small>Scene 수</small><b>${tpl.scenes.length}장${tpl.contentType === 'video' ? ' · 총 ' + tpl.scenes.reduce((a, s) => a + s.duration, 0) + '초' : ''}</b></div>
          <div class="kv"><small>사용 요소</small><b>${use}</b></div>
          <div class="kv"><small>비율</small><b>${tpl.ratio} · ${tpl.styleEn}</b></div>
          <div class="kv"><small>추천 용도</small><b>${tpl.uses}</b></div>
        </div>
        ${window.MK_BRAND ? `<small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">브랜드 — 고르면 시작과 동시에 전체가 브랜드 토큰으로</small>
        <div class="cf-brands">
          <button class="cf-brand ${!st().brand ? 'on' : ''}" data-cf-brand="">템플릿 원본</button>
          ${MK_BRAND.list().map((b) => `<button class="cf-brand ${st().brand === b.id ? 'on' : ''}" data-cf-brand="${b.id}"><span class="bw-dot" style="background:${b.colors.primary}"></span>${M().esc(b.name)}</button>`).join('')}
        </div>` : ''}
        <div class="cf-pv-cta">
          ${M().Button({ label: '이 템플릿 사용', kind: 'accent', size: 'lg', attrs: `data-cf-use="${tpl.templateId}" style="width:100%"` })}
          ${M().Button({ label: '다른 템플릿 보기', kind: 'ghost', size: 'sm', attrs: 'data-cf-back="3" style="width:100%;margin-top:8px"' })}
        </div>
      </div>
    </div>`;
  };

  return {
    title: 'Create', variants: ['Flow'], enter,
    render() {
      const s = st();
      const body = s.step === 1 ? step1() : s.step === 2 ? step2() : s.step === 3 ? step3() : step4();
      return `<div class="cf">${stepbar()}${body}</div>`;
    },
    mount(root) {
      const s = st(), M2 = window.MK;
      root.querySelectorAll('[data-cf-step]').forEach((b) => b.onclick = () => { if (!b.disabled) { s.step = +b.dataset.cfStep; PG.render(); } });
      const rs = root.querySelector('[data-cf-reset]'); if (rs) rs.onclick = () => { PG.state.create = { step: 1, type: null, style: null, tpl: null }; PG.render(); };
      root.querySelectorAll('[data-cf-type]').forEach((b) => b.onclick = () => { s.type = b.dataset.cfType; s.step = 2; PG.render(); });
      const ai = root.querySelector('[data-cf-ai]'); if (ai) ai.onclick = () => M2.Modal.open(`<h2>AI로 시작하기</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">요청 → Scene 구성 생성은 후속 단계에서 연결돼요. Home의 AI 입력창과 같은 흐름입니다.</p>
        <div style="text-align:right;margin-top:14px">${M2.Button({ label: '확인', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      root.querySelectorAll('[data-cf-style]').forEach((b) => b.onclick = () => { s.style = b.dataset.cfStyle; s.step = 3; PG.render(); });
      root.querySelectorAll('[data-cf-tpl]').forEach((b) => b.onclick = () => { s.tpl = b.dataset.cfTpl; s.step = 4; PG.render(); });
      root.querySelectorAll('[data-cf-back]').forEach((b) => b.onclick = () => { s.step = +b.dataset.cfBack; PG.render(); });
      root.querySelectorAll('[data-cf-brand]').forEach((b) => b.onclick = () => { s.brand = b.dataset.cfBrand; PG.render(); });
      const use = root.querySelector('[data-cf-use]'); if (use) use.onclick = () => {
        PG.openEditor(use.dataset.cfUse);
        if (s.brand && window.MK_BRAND) { MK_BRAND.apply(PG.state.editor.doc, s.brand); PG.render(); }
      };
    },
  };
})();
