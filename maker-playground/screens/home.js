/* ============================================================
   화면: Home  — §4 "오늘 무엇을 만들어 볼까요?" 목적 우선 흐름
   variant A: 중앙 질문 + 유형 그리드
   variant B: 질문·그리드 + 우측 최근 작업
   variant C: 검색 중심 + 유형 칩
   유형 클릭 → Templates 화면(해당 유형 필터)으로 이동
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.home = {
  title: 'Home', variants: ['A', 'B', 'C'],
  render(v) {
    const S = window.MK_SAMPLE;
    const typeCard = (t) =>
      `<button class="home-type ${t.key === 'ai' ? 'ai' : ''}" data-go-type="${t.key}">
        <span class="ico">${t.ico}</span><b>${t.name}</b><small>${t.desc}</small>
      </button>`;
    const grid = `<div class="home-grid">${S.TYPES.map(typeCard).join('')}</div>`;
    const hero = (sub) => `<div class="home-hero"><h2>오늘 무엇을 만들어 볼까요?</h2><p>${sub}</p></div>`;

    if (v === 'B') {
      const recent = [
        ['가을 독서 주간 포스터', '어제'], ['2단원 발표자료', '3일 전'], ['운동회 안내 영상', '지난주'],
      ].map(([n, d]) => `<button class="home-recent-item"><span class="mini"></span><span style="flex:1"><b style="font:var(--mk-t-h3)">${n}</b><small style="display:block;color:var(--mk-text-secondary);font:var(--mk-t-caption)">${d} · 샘플</small></span></button>`).join('');
      return `${hero('만들 것을 고르면 템플릿과 AI가 나머지를 도와요')}
        <div class="home-split">
          <div>${grid}</div>
          <div><h3 style="font:var(--mk-t-h3);margin-bottom:var(--mk-sp-3)">최근 작업 <small style="color:var(--mk-text-secondary);font-weight:400">(임시 데이터)</small></h3>
            <div class="home-recent">${recent}</div></div>
        </div>`;
    }
    if (v === 'C') {
      return `${hero('찾고 싶은 것을 검색하거나 유형을 고르세요')}
        <div class="home-searchwrap"><input class="mk-input" style="height:46px;font-size:15px" placeholder="예: 운동회 포스터, 받아쓰기 학습지, 행사 안내 영상"></div>
        <div class="home-chips">${S.TYPES.map((t) => `<button class="mk-chip" data-go-type="${t.key}">${t.ico} ${t.name}</button>`).join('')}</div>`;
    }
    return `${hero('만들 것을 고르면 템플릿과 AI가 나머지를 도와요')}${grid}`;
  },
  mount(root) {
    root.querySelectorAll('[data-go-type]').forEach((b) => b.onclick = () => {
      const k = b.dataset.goType;
      if (k === 'ai') { PG.go('ai'); return; }
      PG.state.browser.type = k;
      PG.go('templates');
    });
  },
};
