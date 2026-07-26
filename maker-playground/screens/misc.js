/* ============================================================
   화면: Foundations / Components / Video·Photo·AI·Export 플레이스홀더
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

/* ---------- 후속 단계 플레이스홀더 (ph 헬퍼는 R40 안내판 전환으로 소멸) ---------- */
/* ---------- Video: 즉시 시작 (R43) — 클릭 = 영상 프로젝트가 열린다 ---------- */
window.MK_SCREENS.video = {
  title: 'Video', variants: ['A'],
  render: () => `<span class="pg-note">클릭 한 번으로 시작 — 만든 뒤 상단 「미리보기」·「내보내기 → MP4」</span>
    <div class="ph-screen">
      <button class="ph-block st-act" data-st="vid-files" style="text-align:left;cursor:pointer">
        <b>📁 내 사진·영상으로 15초 영상 만들기</b>
        사진 여러 장을 고르면 장면·배경음·애니가 자동으로 붙어요. 글자만 바꾸면 끝.
        <em id="stMsgV" style="display:block;margin-top:6px;color:var(--mk-text-secondary)"></em></button>
      <button class="ph-block st-act" data-st="vid-tpl" style="text-align:left;cursor:pointer">
        <b>🎬 템플릿로 시작 — 행사 하이라이트 15초</b>
        사진 2장 + 문구 4개만 바꾸는 완성형. 배경음 포함.</button>
      <button class="ph-block st-act" data-st="go-projects" style="text-align:left;cursor:pointer">
        <b>▶ 하던 작업 이어서</b>
        내 프로젝트 목록에서 열어요.</button>
    </div>
    <p class="ed-note" style="margin-top:12px">MP4 내보내기는 크롬·엣지에서 돼요 (소리 포함).</p>`,
  mount(root) {
    root.querySelectorAll('[data-st]').forEach((b) => b.onclick = () => {
      if (b.dataset.st === 'vid-files') return window.MK_START.pickAndStart('video', (m) => { const el = root.querySelector('#stMsgV'); if (el) el.textContent = m; });
      if (b.dataset.st === 'vid-tpl') return window.MK_TPL.load('pk-vid-01');
      if (b.dataset.st === 'go-projects') return window.PG.go('projects');
    });
  },
};
/* ---------- Photo: 즉시 시작 (R43) — 사진을 고르면 편집이 열린다 ---------- */
window.MK_SCREENS.photo = {
  title: 'Photo', variants: ['A'],
  render: () => `<span class="pg-note">사진을 고르는 순간 편집 화면이 열려요 — 장당 1장면, 제목 자막 포함</span>
    <div class="ph-screen">
      <button class="ph-block st-act" data-st="ph-files" style="text-align:left;cursor:pointer">
        <b>🖼 사진 골라서 바로 시작</b>
        여러 장을 고르면 장면이 장수만큼 생겨요. 첫 장면엔 제목 자막이 붙어요.
        <em id="stMsgP" style="display:block;margin-top:6px;color:var(--mk-text-secondary)"></em></button>
      <button class="ph-block st-act" data-st="ph-sns" style="text-align:left;cursor:pointer">
        <b>📱 템플릿로 시작 — 학급 계정 소식 (4:5)</b>
        커버·사진·엔딩 3장 세트. 사진만 갈아 끼우세요.</button>
      <button class="ph-block st-act" data-st="go-projects" style="text-align:left;cursor:pointer">
        <b>▶ 하던 작업 이어서</b>
        내 프로젝트 목록에서 열어요.</button>
    </div>
    <p class="ed-note" style="margin-top:12px">자르기·필터 같은 사진 보정은 아직 이식 전이에요 — 배치·크기·교체는 편집에서 돼요.</p>`,
  mount(root) {
    root.querySelectorAll('[data-st]').forEach((b) => b.onclick = () => {
      if (b.dataset.st === 'ph-files') return window.MK_START.pickAndStart('photo', (m) => { const el = root.querySelector('#stMsgP'); if (el) el.textContent = m; });
      if (b.dataset.st === 'ph-sns') return window.MK_TPL.load('pk-sns-01');
      if (b.dataset.st === 'go-projects') return window.PG.go('projects');
    });
  },
};
/* AI 화면은 screens/ai.js (AI Studio v1)로 승격 */
/* Export 화면은 screens/export.js (Universal Render Engine 콘솔)로 승격 */

/* ---------- Patterns: 컴포넌트 조합 패턴 ---------- */
window.MK_SCREENS.patterns = {
  title: 'Patterns', variants: ['A'],
  render() {
    const M = window.MK;
    return `<span class="pg-note">컴포넌트를 조합한 반복 패턴 — 시안 반영 시 여기서 조합 규칙을 검토</span>
      <div class="spec-grid">
        <div class="spec"><div class="spec-name">검색 + 필터</div>
          <input class="mk-input" placeholder="템플릿 검색" style="margin-bottom:10px">
          <div class="spec-row">${M.Chip({label:'전체',on:true})}${M.Chip({label:'행사'})}${M.Chip({label:'알림'})}${M.Chip({label:'수업'})}</div></div>
        <div class="spec"><div class="spec-name">툴바</div>
          <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:8px 12px;background:var(--mk-surface)">
            ${M.IconButton({icon:'←'})}<b style="font:var(--mk-t-h3)">문서 이름</b><span style="flex:1"></span>${M.IconButton({icon:'↺'})}${M.IconButton({icon:'↻'})}${M.Button({label:'내보내기',kind:'accent',size:'sm'})}</div></div>
        <div class="spec"><div class="spec-name">속성 필드 그룹</div>
          <div class="ed-props" style="border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:14px">
            <div class="fld row2"><span><label>글꼴</label><select class="mk-input"><option>Pretendard</option></select></span><span><label>크기</label><input class="mk-input" value="24"></span></div>
            <div class="fld row2"><span><label>색상</label><input class="mk-input" value="#1F2733"></span><span><label>투명도</label><input class="mk-input" value="100%"></span></div></div></div>
        <div class="spec"><div class="spec-name">빈 상태</div>
          <div style="text-align:center;padding:var(--mk-sp-7);border:1.5px dashed var(--mk-border);border-radius:var(--mk-r-medium)">
            <div style="font-size:26px;margin-bottom:8px">🗂</div><b style="font:var(--mk-t-h3)">아직 템플릿이 없어요</b>
            <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin:6px 0 14px">첫 템플릿을 만들어 볼까요?</p>${M.Button({label:'만들기 시작',kind:'accent',size:'sm'})}</div></div>
        <div class="spec"><div class="spec-name">리스트 행</div>
          ${['가을 독서 주간 포스터','2단원 발표자료'].map(n=>`<button class="home-recent-item" style="width:100%;margin-bottom:8px"><span class="mini"></span><span style="flex:1;text-align:left"><b style="font:var(--mk-t-h3)">${n}</b><small style="display:block;font:var(--mk-t-caption);color:var(--mk-text-secondary)">샘플 · 어제</small></span>${M.IconButton({icon:'⋯'})}</button>`).join('')}</div>
        <div class="spec"><div class="spec-name">확인 다이얼로그 (정적)</div>
          <div class="mk-modal" style="width:100%;box-shadow:var(--mk-sh-subtle);border:1px solid var(--mk-border)"><h2>장면을 삭제할까요?</h2>
            <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">삭제한 장면은 되돌릴 수 없어요.</p>
            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${M.Button({label:'취소',kind:'secondary',size:'sm'})}${M.Button({label:'삭제',size:'sm',attrs:'style="background:var(--mk-danger)"'})}</div></div></div>
      </div>`;
  },
};

/* ---------- Screens: 화면 인덱스 ---------- */
window.MK_SCREENS.screens = {
  title: 'Screens', variants: ['A'],
  render() {
    const items = [
      ['Create Flow', 'create', ['Flow'], '종류→스타일→템플릿→미리보기→Editor 깔때기'],
      ['Animation Studio', 'animation', ['v1'], '프리셋 9종 교체·조절 — Scene 3슬롯·Element 5속성·Timeline·Play 실재생'],
      ['Template Builder', 'builder', ['운영자'], '운영자 도구 — Explorer·Editable/Lock 지정·Preview·Publish 파이프라인'],
      ['Workspace', 'workspace', ['v1'], '핵심 작업 공간 — 좌 내비 6·Canvas·Context Panel·AI Dock·모드 4종'],
      ['My Projects', 'projects', ['v1'], '최상위 단위 — 최근·즐겨찾기·공유·휴지통 / Detail·액션 6종'],
      ['Asset Browser', 'assets', ['v1'], '리소스 13 카테고리 · 검색·필터·정렬·Grid/List · Preview · 드래그 구조'],
      ['Home', 'home', ['v1'], '목적 우선 시작 화면 (Header·Hero·제작시작·추천·최근·AI추천)'],
      ['Templates', 'templates', ['A','B'], '템플릿 탐색'],
      ['Editor · Design', 'editor', ['Design'], '문서형 편집'],
      ['Editor · Video', 'editor', ['Video'], '영상형 편집 (타임라인)'],
    ];
    return `<span class="pg-note">화면 단위 인덱스 — variant를 골라 바로 이동</span>
      <div class="spec-grid">${items.map(([name,key,vars,desc])=>`
        <div class="spec"><div class="spec-name">${name}</div>
          <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-bottom:12px">${desc}</p>
          <div class="spec-row">${vars.map(v=>`<button class="mk-btn secondary sm" data-scr-go="${key}" data-scr-var="${v}">${v} 열기</button>`).join('')}</div></div>`).join('')}
      </div>`;
  },
  mount(root) {
    root.querySelectorAll('[data-scr-go]').forEach(b=>b.onclick=()=>{
      PG.state.variants[b.dataset.scrGo]=b.dataset.scrVar; PG.go(b.dataset.scrGo);
    });
  },
};
