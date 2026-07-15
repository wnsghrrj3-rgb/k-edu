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
