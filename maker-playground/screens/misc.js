/* ============================================================
   화면: Foundations / Components / Video·Photo·AI·Export 플레이스홀더
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

/* ---------- Components: 컴포넌트 갤러리 ---------- */
window.MK_SCREENS.components = {
  title: 'Components', variants: ['A'],
  render() {
    const S = window.MK_SAMPLE, M = window.MK;
    return `<span class="pg-note">⚠ 전 컴포넌트 = components.js 함수 · 스타일 = 토큰 참조만</span>
      <div class="spec-grid">
        <div class="spec"><div class="spec-name">MakerButton</div>
          <div class="spec-row">${M.Button({label:'기본'})}${M.Button({label:'보조',kind:'secondary'})}${M.Button({label:'강조',kind:'accent'})}${M.Button({label:'고스트',kind:'ghost'})}</div>
          <div class="spec-row">${M.Button({label:'작게',size:'sm'})}${M.Button({label:'아이콘',icon:'▶'})}<button class="mk-btn" disabled>비활성</button></div></div>
        <div class="spec"><div class="spec-name">MakerIconButton</div>
          <div class="spec-row">${M.IconButton({icon:'✏️',tip:'편집'})}${M.IconButton({icon:'🗑',tip:'삭제'})}${M.IconButton({icon:'⧉',tip:'복제'})}${M.IconButton({icon:'▶',tip:'재생',on:true})}</div></div>
        <div class="spec"><div class="spec-name">MakerInput / Dropdown</div>
          <div class="fld" style="margin-bottom:10px"><input class="mk-input" placeholder="파일 이름을 입력하세요"></div>
          <div class="mk-dropdown" id="specDrop"><button class="mk-btn secondary" onclick="document.getElementById('specDrop').classList.toggle('open')">내보내기 ▾</button>
            <div class="mk-dropdown-menu"><button>PNG 이미지</button><button>PDF 문서</button><button>PPT 파일</button><button>MP4 영상</button></div></div></div>
        <div class="spec"><div class="spec-name">MakerTabs / Chip</div>
          ${M.Tabs({items:['Design','Video'],on:'Design'})}
          <div class="spec-row" style="margin-top:12px">${M.Chip({label:'전체',on:true})}${M.Chip({label:'행사'})}${M.Chip({label:'알림'})}${M.Chip({label:'수업'})}</div></div>
        <div class="spec"><div class="spec-name">MakerTemplateCard</div>${M.TemplateCard(S.TEMPLATES[0])}</div>
        <div class="spec"><div class="spec-name">MakerSceneCard</div><div style="display:flex;gap:12px">${M.SceneCard(S.TEMPLATES[0].scenes[0],0,true)}${M.SceneCard(S.TEMPLATES[0].scenes[1],1,false)}</div></div>
        <div class="spec"><div class="spec-name">MakerModal / Tooltip</div>
          <div class="spec-row">${M.Button({label:'모달 열기',kind:'secondary',attrs:`onclick="MK.Modal.open('<h2>모달 제목</h2><p style=color:var(--mk-text-secondary)>모달 본문 영역입니다.</p><div style=margin-top:16px;display:flex;gap:8px;justify-content:flex-end>'+MK.Button({label:'닫기',kind:'secondary',attrs:'onclick=MK.Modal.close()'})+MK.Button({label:'확인',attrs:'onclick=MK.Modal.close()'})+'</div>')"`})}
          <span class="mk-tooltip" data-tip="툴팁 문구" style="color:var(--mk-text-secondary);font:var(--mk-t-body-sm)">툴팁 (호버)</span></div></div>
        <div class="spec"><div class="spec-name">MakerCard</div><div class="mk-card"><b style="font:var(--mk-t-h3)">카드 제목</b><p style="color:var(--mk-text-secondary);margin-top:6px">카드 본문. 카드 남발 금지 원칙에 따라 정보 묶음 단위로만 사용.</p></div></div>
      </div>`;
  },
};

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
