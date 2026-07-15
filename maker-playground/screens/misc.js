/* ============================================================
   화면: Foundations / Components / Video·Photo·AI·Export 플레이스홀더
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

/* ---------- Components: 컴포넌트별 독립 관리 Gallery ---------- */
window.MK_SCREENS.components = (() => {
  const S = () => window.MK_SAMPLE, M = () => window.MK;
  const sec = (name, html) => `<div class="cmp-sec"><small>${name}</small><div class="cmp-row">${html}</div></div>`;

  /* 컴포넌트 레지스트리 — 항목별 독립 스펙 (전시·비교 전용, 신규 디자인 없음) */
  const CMP = {
    'Button': { file: 'components.js · MK.Button', body: () => sec('종류', `${M().Button({label:'기본'})}${M().Button({label:'보조',kind:'secondary'})}${M().Button({label:'강조',kind:'accent'})}${M().Button({label:'고스트',kind:'ghost'})}`)
      + sec('크기', `${M().Button({label:'기본 크기'})}${M().Button({label:'작게',size:'sm'})}`)
      + sec('상태', `${M().Button({label:'아이콘',icon:'▶'})}<button class="mk-btn" disabled>비활성</button>`) },
    'Icon Button': { file: 'components.js · MK.IconButton', body: () => sec('기본', `${M().IconButton({icon:'✏️',tip:'편집'})}${M().IconButton({icon:'🗑',tip:'삭제'})}${M().IconButton({icon:'⧉',tip:'복제'})}${M().IconButton({icon:'↺',tip:'실행 취소'})}`)
      + sec('활성 상태', M().IconButton({icon:'▶',tip:'재생',on:true})) },
    'Input': { file: 'playground.css · .mk-input', body: () => sec('기본', `<input class="mk-input" placeholder="파일 이름을 입력하세요" style="max-width:280px">`)
      + sec('값 입력됨', `<input class="mk-input" value="가을 독서 주간 포스터" style="max-width:280px">`)
      + sec('비활성', `<input class="mk-input" value="수정 불가" disabled style="max-width:280px;opacity:.5">`) },
    'Badge': { file: 'components.js · MK.Badge', body: () => sec('톤', `${M().Badge({label:'기본'})}${M().Badge({label:'코랄',tone:'coral'})}${M().Badge({label:'틸',tone:'teal'})}${M().Badge({label:'성공',tone:'success'})}${M().Badge({label:'위험',tone:'danger'})}`)
      + sec('사용 예', `<span style="font:var(--mk-t-h3)">운동회 안내 영상</span> ${M().Badge({label:'영상',tone:'coral'})} ${M().Badge({label:'샘플'})}`) },
    'Chip': { file: 'components.js · MK.Chip', body: () => sec('필터 칩', `${M().Chip({label:'전체',on:true})}${M().Chip({label:'행사'})}${M().Chip({label:'알림'})}${M().Chip({label:'수업'})}${M().Chip({label:'독서'})}`) },
    'Card': { file: 'playground.css · .mk-card', body: () => sec('기본', `<div class="mk-card" style="max-width:340px"><b style="font:var(--mk-t-h3)">카드 제목</b><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">정보 묶음 단위로만 사용 (카드 남발 금지 원칙).</p></div>`)
      + sec('강조 배경', `<div class="mk-card" style="max-width:340px;background:var(--mk-cream)"><b style="font:var(--mk-t-h3)">크림 카드</b><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">배경 변형.</p></div>`) },
    'Template Card': { file: 'components.js · MK.TemplateCard', body: () => sec('판형별', `<div style="display:grid;grid-template-columns:repeat(3,220px);gap:14px">${M().TemplateCard(S().TEMPLATES[0])}${M().TemplateCard(S().TEMPLATES[2])}${M().TemplateCard(S().TEMPLATES[3])}</div>`) },
    'Scene Card': { file: 'components.js · MK.SceneCard', body: () => sec('선택 상태 비교', `${M().SceneCard(S().TEMPLATES[0].scenes[0],0,true)}${M().SceneCard(S().TEMPLATES[0].scenes[1],1,false)}${M().SceneCard(S().TEMPLATES[0].scenes[2],2,false)}`) },
    'Toolbar': { file: 'screens/editor.js 상단부 조합', body: () => sec('편집기 상단', `<div style="display:flex;align-items:center;gap:8px;border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:8px 12px;background:var(--mk-surface);min-width:520px">
        ${M().IconButton({icon:'←'})}<b style="font:var(--mk-t-h3)">문서 이름</b><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">저장됨</span><span style="flex:1"></span>
        ${M().IconButton({icon:'↺'})}${M().IconButton({icon:'↻'})}${M().Tabs({items:['Design','Video'],on:'Design'})}${M().Button({label:'내보내기',kind:'accent',size:'sm'})}</div>`) },
    'Sidebar': { file: 'screens/editor.js 좌측부 조합', body: () => sec('편집기 메인 메뉴', `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:10px 8px">
        ${[['가','텍스트',1],['⬡','요소',0],['🖼','사진',0],['🎬','영상',0]].map(([i,n,on])=>`<span style="width:48px;height:46px;border-radius:var(--mk-r-small);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:var(--mk-t-caption);${on?'background:var(--mk-teal-soft);color:var(--mk-teal)':'color:var(--mk-text-secondary)'}"><span style="font-size:15px">${i}</span>${n}</span>`).join('')}</div>`) },
  };
  const KEYS = Object.keys(CMP);

  return {
    title: 'Components', variants: ['A'],
    render() {
      if (!PG.state.cmp) PG.state.cmp = 'Button';
      const sel = PG.state.cmp, c = CMP[sel];
      return `<div class="cmp-layout">
        <div class="cmp-nav">${KEYS.map((k) => `<button class="${k === sel ? 'on' : ''}" data-cmp="${k}">${k}</button>`).join('')}</div>
        <div class="cmp-stage"><div class="cmp-stage-h"><b>${sel}</b><small>${c.file}</small><span style="flex:1"></span>${window.MK.Badge({ label: '중립 임시 스타일', tone: '' })}</div>${c.body()}</div>
      </div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-cmp]').forEach((b) => b.onclick = () => { PG.state.cmp = b.dataset.cmp; PG.render(); });
    },
  };
})();

/* ---------- 후속 단계 플레이스홀더 ---------- */
const ph = (title, blocks) => ({
  title, variants: ['A'],
  render: () => `<span class="pg-note">⚠ 후속 단계 화면 — 구조 자리만 잡아둔 상태 (미구현)</span>
    <div class="ph-screen">` + blocks.map(([b, d]) => `<div class="ph-block"><b>${b}</b>${d}</div>`).join('') + `</div>`,
});
window.MK_SCREENS.video = ph('Video', [
  ['영상 템플릿 목록', '멸치형 — 사진·문구 교체 영역이 명확한 템플릿 (Editor의 Video 모드에서 골격 확인 가능)'],
  ['재생 미리보기', 'Scene 순차 재생 UI. 실제 렌더링은 kmake video.js(WebCodecs) 이식 예정'],
  ['배경음악 선택', 'musicPreset 데이터 자리만 확보됨'],
]);
window.MK_SCREENS.photo = ph('Photo', [
  ['사진 편집 모드', '자르기·회전·밝기·대비·채도·필터 — kmake photo.js(마스크 9종·보정 7종) 이식 예정'],
  ['배경 제거', '클라이언트 사이드 누끼 — 미구현 (단독 과제)'],
  ['프레임·그림자', '속성 패널 확장 자리'],
]);
window.MK_SCREENS.ai = ph('AI', [
  ['AI 제작 시작', '"발표자료 만들어줘" 류 프롬프트 → Scene 구성 생성. UI·상태 구조만 선행, API 연결은 후속'],
  ['문장 다듬기', '짧게 / 1학년 수준으로 / 교사용·학생용 전환'],
  ['추천', '제목·이미지·색상 조합·스타일 변경·애니메이션·Scene 추가'],
]);
window.MK_SCREENS.export = ph('Export', [
  ['내보내기 대상', 'PNG · PDF · PPT · MP4 — kmake 기존 내보내기 엔진 이식 예정'],
  ['공유 링크', '뷰어 링크(라이프 카드 방식) 확장 자리'],
]);

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
      ['Home', 'home', ['A','B','C'], '목적 우선 시작 화면'],
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
