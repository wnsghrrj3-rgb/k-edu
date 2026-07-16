/* ============================================================
   화면: Home v1 — "오늘 무엇을 만들어 볼까요?" 목적 우선 UX (§4)
   구조: Header / Hero(+AI 입력창) / 제작 시작 8카드 /
         추천 템플릿(가로 스크롤) / 최근 작업 / AI 추천
   원칙: Canva Home 비복제 · 교육청st 금지 · 카드 남발 금지 ·
         화이트 여백 적극 · "무엇을 만들까"가 첫 시선.
   ⚠ 전부 Placeholder 데이터 — 시안 도착 시 스타일 교체.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.home = (() => {
  const M = () => window.MK, S = () => window.MK_SAMPLE;

  /* 제작 시작 8종 — 지시 순서 고정 */
  const START_ORDER = ['presentation', 'video', 'poster', 'cardnews', 'worksheet', 'activity', 'sns', 'thumbnail'];

  /* Placeholder — 최근 작업 · AI 추천 */
  const RECENT = [
    { name: '가을 독서 주간 포스터', when: '어제', type: '포스터' },
    { name: '2단원 식물의 한살이 발표', when: '3일 전', type: '발표자료' },
    { name: '운동회 안내 영상', when: '지난주', type: '영상' },
    { name: '받아쓰기 5회 학습지', when: '지난주', type: '학습지' },
  ];
  const AI_PICKS = [
    { reason: '지난주 과학 발표를 만들었어요', title: '식물의 한살이 · 관찰일지 학습지', type: 'worksheet', ico: '📝' },
    { reason: '운동회 영상을 완성했어요', title: '운동회 하이라이트 · 학급 SNS 카드', type: 'sns', ico: '💬' },
    { reason: '포스터를 자주 만들어요', title: '독서 주간 · 짝꿍 카드뉴스', type: 'cardnews', ico: '🗂' },
  ];
  const AI_EXAMPLES = ['환경 보호 발표자료 만들어줘', '학교 축제 영상 만들어줘', '1학년 학습지 만들어줘'];

  const secHead = (title, moreType) =>
    `<div class="hv-sec-t"><b>${title}</b>${moreType ? `<button class="hv-more" data-go-type="${moreType}">모두 보기 →</button>` : ''}</div>`;

  return {
    title: 'Home', variants: ['v1'],
    render() {
      const T = S().TYPES;
      const typeOf = (k) => T.find((t) => t.key === k);

      /* ---- Header ---- */
      const header = `<div class="hv-header">
        <span class="hv-logo">K-MAKER</span>
        <div class="hv-search"><input class="mk-input" placeholder="템플릿·내 작품 검색"></div>
        <nav class="hv-nav"><a data-hv-proj>최근 작업</a><a data-hv-proj>내 프로젝트</a></nav>
        <button class="mk-iconbtn mk-tooltip hv-bell" data-tip="알림">🔔<i></i></button>
        <span class="mk-avatar sm">준</span>
      </div>`;

      /* ---- Hero + AI 입력창 ---- */
      const hero = `<div class="hv-hero">
        <h2>오늘 무엇을 만들어 볼까요?</h2>
        <p>발표부터 영상까지, AI와 함께 쉽고 빠르게 만들어보세요.</p>
        <div class="mk-aibox hv-aibox">
          <textarea id="hvAi" rows="1" placeholder="${AI_EXAMPLES[0]}"></textarea>
          <div class="foot">${AI_EXAMPLES.map((e) => M().Chip({ label: e, attrs: `data-hv-ex="${e}"` })).join('')}
            <span style="flex:1"></span>${M().Button({ label: '만들기', kind: 'accent', size: 'sm', attrs: 'data-hv="ai"' })}</div>
        </div>
      </div>`;

      /* ---- 제작 시작 ---- */
      const start = secHead('제작 시작') + `<div class="hv-start">` + START_ORDER.map((k) => {
        const t = typeOf(k);
        return `<button class="hv-type" data-go-type="${t.key}"><span class="ico">${t.ico}</span><b>${t.name}</b><small>${t.desc}</small></button>`;
      }).join('') + `</div>`;

      /* ---- 추천 템플릿 (가로 스크롤) ---- */
      const reco = secHead('추천 템플릿', 'all') + `<div class="hv-scroll">` +
        S().TEMPLATES.map((t, i) => `<div class="hv-scroll-item">${M().TemplateCard(t, `data-hv-tpl="${t.templateId}"`, { fav: i % 3 === 0 })}</div>`).join('') + `</div>`;

      /* ---- 최근 작업 ---- */
      const recent = secHead('최근 작업') + `<div class="hv-recent">` + RECENT.map((r) =>
        `<button class="hv-recent-item"><span class="mini"></span>
          <span class="tx"><b>${r.name}</b><small>${r.type} · ${r.when}</small></span></button>`).join('') + `</div>`;

      /* ---- AI 추천 ---- */
      const picks = secHead('AI 추천') + `<div class="hv-picks">` + AI_PICKS.map((p) =>
        `<button class="hv-pick" data-go-type="${p.type}">
          <small class="why">${p.reason}</small>
          <span class="what"><span class="ico">${p.ico}</span><b>${p.title}</b></span>
          <small class="cta">바로 만들기 →</small>
        </button>`).join('') + `</div>
        <p class="hv-foot-note">⚠ 최근 작업·AI 추천은 Placeholder 데이터 — 사용 패턴 연결은 후속 단계</p>`;

      return `<div class="hv">${header}${hero}${start}${reco}${recent}${picks}</div>`;
    },

    mount(root) {
      root.querySelectorAll('[data-hv-proj]').forEach((a) => a.onclick = () => PG.go('projects'));
      const M2 = window.MK, S2 = window.MK_SAMPLE;
      /* 유형 → Create Flow (종류 선택 완료 상태로 Step 2 진입) */
      root.querySelectorAll('[data-go-type]').forEach((b) => b.onclick = () => {
        if (b.dataset.goType === 'all') { window.MK_SCREENS.create.enter(null); return; }
        window.MK_SCREENS.create.enter(b.dataset.goType);
      });
      /* 추천 템플릿 → 미리보기 모달 → 편집 */
      root.querySelectorAll('[data-hv-tpl]').forEach((b) => b.onclick = () => {
        const tpl = S2.TEMPLATES.find((t) => t.templateId === b.dataset.hvTpl);
        const sc = tpl.scenes.map((s, i) => `<div style="width:92px;flex:none"><div style="border:1px solid var(--mk-border);border-radius:6px;overflow:hidden">${M2.sceneThumb(s)}</div><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${i + 1}. ${M2.esc(s.name)}</small></div>`).join('');
        M2.Modal.open(`<h2>${M2.esc(tpl.title)}</h2>
          <p style="color:var(--mk-text-secondary);font:var(--mk-t-body-sm)">${M2.esc(tpl.description)} · ${M2.esc(tpl.style)} · ${M2.esc(tpl.ratio)}</p>
          <div style="display:flex;gap:10px;overflow-x:auto;margin:16px 0">${sc}</div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            ${M2.Button({ label: '닫기', kind: 'secondary', attrs: 'onclick="MK.Modal.close()"' })}
            ${M2.Button({ label: '이 템플릿 사용', kind: 'accent', attrs: `onclick="MK.Modal.close();PG.openEditor('${tpl.templateId}')"` })}
          </div>`);
      });
      /* AI 입력 — 예시 칩 채우기 + 만들기(후속 단계 안내) */
      const ta = root.querySelector('#hvAi');
      root.querySelectorAll('[data-hv-ex]').forEach((c) => c.onclick = () => { ta.value = c.dataset.hvEx; ta.focus(); });
      root.querySelector('[data-hv="ai"]').onclick = () => {
        const v = (ta.value || '').trim();
        M2.Modal.open(`<h2>AI로 만들기</h2>
          <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">${v ? `"${M2.esc(v)}"` : '요청'} → Scene 구성 생성은 후속 단계에서 연결돼요.<br>지금은 흐름과 UI만 검토하는 단계입니다.</p>
          <div style="text-align:right;margin-top:14px">${M2.Button({ label: '확인', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      };
    },
  };
})();
