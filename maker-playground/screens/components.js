/* ============================================================
   화면: Components — Figma Component Gallery 방식
   구조: 좌 목록(23종 그룹) / 상단 전역 컨트롤(Variant·State·Size·
   Radius·Shadow → 갤러리 즉시 반영) / 우 Gallery / 하단 Spec.
   ⚠ 디자인 검토 화면 — 신규 디자인 창작 금지, 중립 임시 스타일.
   컴포넌트 추가 = CMP 레지스트리에 항목 1개 등록.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.components = (() => {
  const M = () => window.MK, S = () => window.MK_SAMPLE;
  const sec = (name, html) => `<div class="cg-sec"><small>${name}</small><div class="cg-row">${html}</div></div>`;
  const it = (label, html) => `<span class="cg-item"><small>${label}</small><span>${html}</span></span>`;
  const RADIUS_OVR = { '작게': [4, 6, 10], '기본': null, '크게': [10, 16, 26] };
  const SHADOW_OVR = {
    '없음': ['none', 'none', 'none'], '은은': ['0 1px 2px rgba(20,28,40,.05)', '0 4px 14px rgba(20,28,40,.07)', '0 12px 36px rgba(20,28,40,.16)'],
    '기본': null, '뚜렷': ['0 2px 4px rgba(20,28,40,.10)', '0 8px 26px rgba(20,28,40,.16)', '0 20px 60px rgba(20,28,40,.30)'],
  };

  /* ---------------- 컴포넌트 레지스트리 (23종) ---------------- */
  const CMP = {};
  const reg = (grp, name, file, def) => { CMP[name] = Object.assign({ grp, file }, def); };

  /* ===== Form ===== */
  reg('Form', 'Button', 'components.js · MK.Button', {
    variants: ['Primary', 'Secondary', 'Accent', 'Ghost', 'Outline', 'Danger', 'Success'],
    gallery(v) {
      const B = M().Button, all = { Primary: B({ label: 'Primary' }), Secondary: B({ label: 'Secondary', kind: 'secondary' }), Accent: B({ label: 'Accent', kind: 'accent' }), Ghost: B({ label: 'Ghost', kind: 'ghost' }), Outline: B({ label: 'Outline', kind: 'outline' }), Danger: B({ label: 'Danger', kind: 'danger' }), Success: B({ label: 'Success', kind: 'success' }) };
      const pick = v === '전체' ? Object.entries(all) : Object.entries(all).filter(([k]) => k === v);
      return sec('Variants', pick.map(([k, h]) => it(k, h)).join(''))
        + sec('Sizes', it('Small', B({ label: 'Small', size: 'sm' })) + it('Medium', B({ label: 'Medium' })) + it('Large', B({ label: 'Large', size: 'lg' })))
        + sec('States', it('Icon', B({ label: '재생', icon: '▶' })) + it('Icon Only', `<button class="mk-btn icon-only">▶</button>`)
          + it('Loading', `<button class="mk-btn"><span class="mk-spin"></span> 저장 중</button>`) + it('Disabled', `<button class="mk-btn" disabled>Disabled</button>`)
          + it('Hover', `<span class="sim-hover">${B({ label: 'Hover' })}</span>`) + it('Pressed', `<span class="sim-pressed">${B({ label: 'Pressed' })}</span>`) + it('Focus', `<span class="sim-focus">${B({ label: 'Focus' })}</span>`));
    },
    spec: { tokens: ['--mk-text-primary', '--mk-coral', '--mk-r-small', '--mk-t-button', '--mk-danger', '--mk-success'],
      usage: `MK.Button({ label: '시작하기', kind: 'accent', size: 'sm' })`,
      dos: ['화면당 강조(Accent) 버튼은 1개만', '동사로 시작하는 짧은 라벨'], donts: ['Danger를 일반 확인에 사용', '한 줄에 Primary 두 개 배치'] },
  });

  reg('Form', 'Icon Button', 'components.js · MK.IconButton', {
    gallery() {
      const I = M().IconButton;
      return sec('기본', it('편집', I({ icon: '✏️', tip: '편집' })) + it('삭제', I({ icon: '🗑', tip: '삭제' })) + it('복제', I({ icon: '⧉', tip: '복제' })) + it('실행 취소', I({ icon: '↺' })))
        + sec('States', it('활성', I({ icon: '▶', on: true })) + it('Hover', `<span class="sim-hover">${I({ icon: '✏️' })}</span>`) + it('Disabled', `<span class="sim-disabled">${I({ icon: '🗑' })}</span>`));
    },
    spec: { tokens: ['--mk-text-secondary', '--mk-surface-muted', '--mk-teal-soft', '--mk-r-small'],
      usage: `MK.IconButton({ icon: '✏️', tip: '편집', on: false })`,
      dos: ['툴팁(tip)으로 이름 제공', '툴바처럼 좁은 곳에 사용'], donts: ['의미 없는 장식 아이콘 남발', '주요 행동을 아이콘만으로 표기'] },
  });

  reg('Form', 'Input', 'playground.css · .mk-input', {
    gallery() {
      return sec('States', it('기본', `<input class="mk-input" placeholder="파일 이름" style="width:220px">`) + it('입력됨', `<input class="mk-input" value="가을 독서 주간" style="width:220px">`)
        + it('Focus', `<span class="sim-focus"><input class="mk-input" value="포커스" style="width:160px"></span>`) + it('Disabled', `<input class="mk-input" value="수정 불가" disabled style="width:160px;opacity:.5">`))
        + sec('오류 + 라벨', `<div class="mk-field" style="width:240px"><label>파일 이름</label><input class="mk-input error" value=""><span class="err">이름을 입력해 주세요</span></div>`);
    },
    spec: { tokens: ['--mk-border', '--mk-surface', '--mk-danger', '--mk-t-body-sm'],
      usage: `<div class="mk-field"><label>이름</label>\n  <input class="mk-input"></div>`,
      dos: ['라벨은 위에, 캡션 크기로', '오류는 테두리+문구 함께'], donts: ['placeholder를 라벨 대용으로만 사용', '높이 제각각 배치'] },
  });

  reg('Form', 'Textarea', 'playground.css · textarea.mk-input', {
    gallery() {
      return sec('States', it('기본', `<textarea class="mk-input" placeholder="설명을 입력하세요" style="width:280px"></textarea>`)
        + it('입력됨', `<textarea class="mk-input" style="width:280px">이번 주 우리 반 소식을 정리했어요.</textarea>`));
    },
    spec: { tokens: ['--mk-border', '--mk-t-body'], usage: `<textarea class="mk-input"></textarea>`,
      dos: ['세로 리사이즈 허용', '최소 높이 3줄 확보'], donts: ['한 줄 입력에 사용'] },
  });

  reg('Form', 'Select', 'playground.css · select.mk-input', {
    gallery() {
      const opts = `<option>Pretendard</option><option>시스템 고딕</option><option>명조</option>`;
      return sec('States', it('기본', `<select class="mk-input" style="width:190px">${opts}</select>`) + it('Disabled', `<select class="mk-input" disabled style="width:190px;opacity:.5">${opts}</select>`));
    },
    spec: { tokens: ['--mk-border', '--mk-r-small'], usage: `<select class="mk-input">…</select>`,
      dos: ['선택지 5개 이상일 때 사용'], donts: ['2~3개 선택지는 칩/세그먼트로'] },
  });

  reg('Form', 'Checkbox', 'playground.css · .mk-check', {
    gallery() {
      return sec('States', it('선택', `<label class="mk-check"><input type="checkbox" checked> 알림 받기</label>`) + it('해제', `<label class="mk-check"><input type="checkbox"> 자동 저장</label>`)
        + it('Disabled', `<label class="mk-check" style="opacity:.5"><input type="checkbox" disabled> 잠김</label>`));
    },
    spec: { tokens: ['--mk-teal (accent-color)', '--mk-t-body-sm'], usage: `<label class="mk-check"><input type="checkbox"> 라벨</label>`,
      dos: ['여러 개 동시 선택에 사용'], donts: ['상호 배타 선택에 사용 (→ Radio)'] },
  });

  reg('Form', 'Radio', 'playground.css · .mk-radio', {
    gallery() {
      return sec('그룹', `<label class="mk-radio"><input type="radio" name="rg" checked> 교사용</label><label class="mk-radio"><input type="radio" name="rg"> 학생용</label><label class="mk-radio" style="opacity:.5"><input type="radio" name="rg" disabled> 잠김</label>`);
    },
    spec: { tokens: ['--mk-teal (accent-color)'], usage: `<label class="mk-radio"><input type="radio" name="g"> 라벨</label>`,
      dos: ['2~5개 상호 배타 선택'], donts: ['선택지 6개 이상 (→ Select)'] },
  });

  reg('Form', 'Switch', 'playground.css · .mk-switch', {
    gallery() {
      return sec('States', it('켜짐', `<label class="mk-switch"><input type="checkbox" checked><i></i></label>`) + it('꺼짐', `<label class="mk-switch"><input type="checkbox"><i></i></label>`)
        + it('Disabled', `<label class="mk-switch" style="opacity:.5"><input type="checkbox" disabled><i></i></label>`));
    },
    spec: { tokens: ['--mk-teal', '--mk-border', '--mk-r-pill'], usage: `<label class="mk-switch"><input type="checkbox"><i></i></label>`,
      dos: ['즉시 적용되는 켬/끔에 사용'], donts: ['저장 버튼이 따로 필요한 설정에 사용 (→ Checkbox)'] },
  });

  /* ===== Display ===== */
  reg('Display', 'Badge', 'components.js · MK.Badge', {
    variants: ['기본', '코랄', '틸', '성공', '위험'],
    gallery(v) {
      const B = M().Badge, all = { '기본': B({ label: '기본' }), '코랄': B({ label: '코랄', tone: 'coral' }), '틸': B({ label: '틸', tone: 'teal' }), '성공': B({ label: '성공', tone: 'success' }), '위험': B({ label: '위험', tone: 'danger' }) };
      const pick = v === '전체' ? Object.entries(all) : Object.entries(all).filter(([k]) => k === v);
      return sec('Tones', pick.map(([k, h]) => it(k, h)).join(''))
        + sec('사용 예', `<span style="font:var(--mk-t-h3)">운동회 안내 영상</span> ${B({ label: '영상', tone: 'coral' })} ${B({ label: '샘플' })}`);
    },
    spec: { tokens: ['--mk-coral-soft', '--mk-teal-soft', '--mk-r-pill', '--mk-t-caption'],
      usage: `MK.Badge({ label: '영상', tone: 'coral' })`, dos: ['상태·분류 표시에만'], donts: ['클릭 대상으로 사용 (→ Chip)'] },
  });

  reg('Display', 'Chip', 'components.js · MK.Chip', {
    gallery() {
      const C = M().Chip;
      return sec('States', it('선택됨', C({ label: '전체', on: true })) + it('기본', C({ label: '행사' })) + it('Hover', `<span class="sim-hover">${C({ label: '알림' })}</span>`) + it('Disabled', `<span class="sim-disabled">${C({ label: '잠김' })}</span>`))
        + sec('필터 그룹', `${C({ label: '전체', on: true })}${C({ label: '행사' })}${C({ label: '알림' })}${C({ label: '수업' })}${C({ label: '독서' })}`);
    },
    spec: { tokens: ['--mk-border', '--mk-text-primary', '--mk-r-pill'], usage: `MK.Chip({ label: '행사', on: true })`,
      dos: ['필터·다중 토글에 사용'], donts: ['단독 실행 버튼으로 사용'] },
  });

  reg('Display', 'Avatar', 'playground.css · .mk-avatar', {
    gallery() {
      return sec('Sizes', it('Small', `<span class="mk-avatar sm">김</span>`) + it('Medium', `<span class="mk-avatar">준</span>`) + it('Large', `<span class="mk-avatar lg">호</span>`) + it('코랄 톤', `<span class="mk-avatar coral">하</span>`))
        + sec('그룹 (모둠)', `<span class="mk-avatar-stack"><span class="mk-avatar">김</span><span class="mk-avatar coral">이</span><span class="mk-avatar">박</span><span class="mk-avatar coral">+2</span></span>`);
    },
    spec: { tokens: ['--mk-teal-soft', '--mk-coral-soft', '--mk-t-button'], usage: `<span class="mk-avatar">김</span>`,
      dos: ['이니셜 1~2자', '모둠은 스택으로'], donts: ['사진 없이 빈 원만 두기'] },
  });

  reg('Display', 'Card', 'playground.css · .mk-card', {
    gallery() {
      return sec('Variants', it('기본', `<div class="mk-card" style="width:280px"><b style="font:var(--mk-t-h3)">카드 제목</b><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">정보 묶음 단위로만 사용.</p></div>`)
        + it('강조 배경', `<div class="mk-card" style="width:280px;background:var(--mk-cream)"><b style="font:var(--mk-t-h3)">크림 카드</b><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">배경 변형.</p></div>`)
        + it('통계', `<div class="mk-card" style="width:150px"><div style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">완성한 작품</div><div style="font:var(--mk-t-h1)">128</div><div style="font:var(--mk-t-body-sm);color:var(--mk-success)">▲ 12%</div></div>`));
    },
    spec: { tokens: ['--mk-surface', '--mk-border', '--mk-r-medium', '--mk-sh-subtle'],
      usage: `<div class="mk-card">…</div>`, dos: ['정보 묶음 1개 = 카드 1장'], donts: ['카드 남발 (지시서 §20 금지)', '카드 안에 카드 중첩'] },
  });

  /* ===== K-MAKER ===== */
  reg('K-MAKER', 'Template Card', 'components.js · MK.TemplateCard', {
    gallery() {
      const T = M().TemplateCard, s = S().TEMPLATES;
      return sec('판형별', `<div style="display:grid;grid-template-columns:repeat(3,210px);gap:14px">${T(s[0])}${T(s[2])}${T(s[3])}</div>`)
        + sec('States', it('Hover', `<span class="sim-hover" style="display:inline-block;width:210px">${T(s[1])}</span>`));
    },
    spec: { tokens: ['--mk-surface', '--mk-r-medium', '--mk-sh-floating', '--mk-t-h3'],
      usage: `MK.TemplateCard(tpl, 'data-tpl="…"')`, dos: ['썸네일은 실제 1장면 렌더', '판형 배지 좌상단 고정'], donts: ['색만 다른 카드 반복 노출'] },
  });

  reg('K-MAKER', 'Scene Card', 'components.js · MK.SceneCard', {
    gallery() {
      const C = M().SceneCard, sc = S().TEMPLATES[0].scenes;
      return sec('States', `<div style="display:flex;gap:12px">${C(sc[0], 0, true)}${C(sc[1], 1, false)}${C(sc[2], 2, false)}</div>`);
    },
    spec: { tokens: ['--mk-coral (선택 테두리)', '--mk-border', '--mk-r-small'],
      usage: `MK.SceneCard(scene, i, selected, attrs)`, dos: ['선택 상태는 코랄 테두리 하나로'], donts: ['카드마다 다른 선택 표현'] },
  });

  reg('K-MAKER', 'AI Prompt Box', 'playground.css · .mk-aibox', {
    gallery() {
      return sec('기본', `<div class="mk-aibox"><textarea placeholder="예: 3학년 과학 발표자료 만들어줘"></textarea>
        <div class="foot">${M().Chip({ label: '발표자료 만들어줘' })}${M().Chip({ label: '문장 짧게' })}<span style="flex:1"></span>${M().Button({ label: '만들기', kind: 'accent', size: 'sm' })}</div></div>`)
        + sec('Loading', `<div class="mk-aibox" style="opacity:.8"><div style="display:flex;align-items:center;gap:10px;padding:8px 2px"><span class="mk-spin dark"></span><span style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">구성을 만들고 있어요…</span></div></div>`);
    },
    spec: { tokens: ['--mk-teal (테두리)', '--mk-r-large', '--mk-t-body'],
      usage: `<div class="mk-aibox"><textarea></textarea>…</div>`, dos: ['추천 프롬프트 칩 2~3개 동반'], donts: ['AI를 장식 기능처럼 구석 배치 (§10)'] },
  });

  /* ===== Layout ===== */
  reg('Layout', 'Toolbar', 'screens/editor.js 상단부', {
    gallery() {
      return sec('편집기 상단', `<div style="display:flex;align-items:center;gap:8px;border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:8px 12px;background:var(--mk-surface);min-width:560px">
        ${M().IconButton({ icon: '←' })}<b style="font:var(--mk-t-h3)">문서 이름</b><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">저장됨</span><span style="flex:1"></span>
        ${M().IconButton({ icon: '↺' })}${M().IconButton({ icon: '↻' })}${M().Tabs({ items: ['Design', 'Video'], on: 'Design' })}${M().Button({ label: '내보내기', kind: 'accent', size: 'sm' })}</div>`);
    },
    spec: { tokens: ['--mk-surface', '--mk-border', '--mk-t-h3'], usage: `screens/editor.js render() 상단부 조합`,
      dos: ['좌: 문서 정보 / 우: 행동', '높이 52px 고정'], donts: ['버튼 6개 이상 나열'] },
  });

  reg('Layout', 'Sidebar', 'screens/editor.js 좌측부', {
    gallery() {
      return sec('편집기 메인 메뉴', `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:10px 8px">
        ${[['가', '텍스트', 1], ['⬡', '요소', 0], ['🖼', '사진', 0], ['🎬', '영상', 0], ['🎨', '배경', 0]].map(([i, n, on]) => `<span style="width:48px;height:46px;border-radius:var(--mk-r-small);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:var(--mk-t-caption);${on ? 'background:var(--mk-teal-soft);color:var(--mk-teal)' : 'color:var(--mk-text-secondary)'}"><span style="font-size:15px">${i}</span>${n}</span>`).join('')}</div>`);
    },
    spec: { tokens: ['--mk-teal-soft (활성)', '--mk-text-secondary', '--mk-r-small'], usage: `screens/editor.js .ed-mainmenu`,
      dos: ['아이콘+라벨 세트 유지'], donts: ['아이콘 단독 (초등 사용자 배려)'] },
  });

  reg('Layout', 'Top Navigation', 'playground.css · .mk-topnav', {
    gallery() {
      return sec('기본', `<div class="mk-topnav" style="min-width:560px"><span class="brand">K-MAKER</span>
        <a class="on">홈</a><a>템플릿</a><a>내 작품</a><span style="flex:1"></span>${M().Badge({ label: '샘플', tone: 'teal' })}<span class="mk-avatar sm">준</span></div>`);
    },
    spec: { tokens: ['--mk-surface', '--mk-t-h3', '--mk-t-body-sm'], usage: `<div class="mk-topnav">…</div>`,
      dos: ['메뉴 3~5개 유지'], donts: ['편집기 안에서 사용 (→ Toolbar)'] },
  });

  /* ===== Feedback ===== */
  reg('Feedback', 'Modal', 'components.js · MK.Modal', {
    gallery() {
      return sec('정적 시안', `<div class="mk-modal" style="width:380px;box-shadow:var(--mk-sh-modal)"><h2>모달 제목</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">본문 영역. 배경 딤과 함께 중앙 표시.</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">${M().Button({ label: '닫기', kind: 'secondary', size: 'sm' })}${M().Button({ label: '확인', size: 'sm' })}</div></div>`)
        + sec('실동작', M().Button({ label: '모달 열어보기', kind: 'secondary', size: 'sm', attrs: `onclick="MK.Modal.open('<h2>실동작 모달</h2><p style=color:var(--mk-text-secondary)>ESC 대신 바깥 클릭으로 닫기.</p><div style=margin-top:14px;text-align:right>'+MK.Button({label:'닫기',attrs:'onclick=MK.Modal.close()'})+'</div>')"` }));
    },
    spec: { tokens: ['--mk-sh-modal', '--mk-r-large', '--mk-z-modal'], usage: `MK.Modal.open(html) / MK.Modal.close()`,
      dos: ['하나의 결정만 담기'], donts: ['모달 위 모달'] },
  });

  reg('Feedback', 'Dialog', 'Modal 파생 패턴', {
    gallery() {
      return sec('확인 (파괴적 행동)', `<div class="mk-modal" style="width:360px;box-shadow:var(--mk-sh-subtle);border:1px solid var(--mk-border)"><h2>장면을 삭제할까요?</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">삭제한 장면은 되돌릴 수 없어요.</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${M().Button({ label: '취소', kind: 'secondary', size: 'sm' })}${M().Button({ label: '삭제', kind: 'danger', size: 'sm' })}</div></div>`);
    },
    spec: { tokens: ['--mk-danger', '--mk-sh-modal'], usage: `MK.Modal.open(확인 패턴 html)`,
      dos: ['파괴적 행동은 Danger 버튼 + 결과 설명'], donts: ['"확인/취소" 순서 뒤집기'] },
  });

  reg('Feedback', 'Toast', 'playground.css · .mk-toast', {
    variants: ['기본', '성공', '오류'],
    gallery(v) {
      const all = { '기본': `<span class="mk-toast">📋 링크를 복사했어요</span>`, '성공': `<span class="mk-toast success">✓ 저장했어요</span>`, '오류': `<span class="mk-toast danger">⚠ 내보내기에 실패했어요 <u style="cursor:pointer">다시 시도</u></span>` };
      const pick = v === '전체' ? Object.entries(all) : Object.entries(all).filter(([k]) => k === v);
      return sec('Tones', pick.map(([k, h]) => it(k, h)).join(''));
    },
    spec: { tokens: ['--mk-text-primary', '--mk-success', '--mk-danger', '--mk-sh-floating'],
      usage: `<span class="mk-toast success">✓ 저장했어요</span>`, dos: ['3초 자동 사라짐 + 행동 1개까지'], donts: ['중요 결정을 토스트로 요구'] },
  });

  reg('Feedback', 'Empty State', 'Patterns 공유', {
    gallery() {
      return sec('기본', `<div style="text-align:center;padding:var(--mk-sp-7);border:1.5px dashed var(--mk-border);border-radius:var(--mk-r-medium);width:340px">
        <div style="font-size:26px;margin-bottom:8px">🗂</div><b style="font:var(--mk-t-h3)">아직 템플릿이 없어요</b>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin:6px 0 14px">첫 템플릿을 만들어 볼까요?</p>${M().Button({ label: '만들기 시작', kind: 'accent', size: 'sm' })}</div>`);
    },
    spec: { tokens: ['--mk-border (dashed)', '--mk-t-h3'], usage: `아이콘 + 제목 + 한 줄 + 행동 1개`,
      dos: ['다음 행동 버튼 반드시 제공'], donts: ['"데이터 없음" 문구만 표시'] },
  });

  reg('Feedback', 'Loading', 'playground.css · .mk-spin/.mk-skel', {
    gallery() {
      return sec('Spinner', it('Small', `<span class="mk-spin dark"></span>`) + it('Large', `<span class="mk-spin dark lg"></span>`) + it('버튼 내', `<button class="mk-btn"><span class="mk-spin"></span> 저장 중</button>`))
        + sec('Skeleton', `<div style="width:280px"><div class="mk-skel" style="height:14px;margin-bottom:8px"></div><div class="mk-skel" style="height:14px;width:70%;margin-bottom:8px"></div><div class="mk-skel" style="height:80px"></div></div>`);
    },
    spec: { tokens: ['--mk-surface-muted', '--mk-border'], usage: `<span class="mk-spin dark"></span> / <div class="mk-skel">`,
      dos: ['1초 이상 대기 시에만 표시', '목록은 스켈레톤 우선'], donts: ['전체 화면 스피너 남발'] },
  });

  const GROUPS = ['Form', 'Display', 'K-MAKER', 'Layout', 'Feedback'];
  const KEYS = Object.keys(CMP);

  /* ---------------- 화면 ---------------- */
  const stg = () => {
    if (!PG.state.cg) PG.state.cg = { sel: 'Button', variant: '전체', state: '기본', size: 'md', radius: '기본', shadow: '기본' };
    return PG.state.cg;
  };
  const seg = (key, items, on) => `<span class="seg">${items.map((x) => `<button class="${x === on ? 'on' : ''}" data-cg-${key}="${x}">${x}</button>`).join('')}</span>`;

  return {
    title: 'Components', variants: ['A'],
    render() {
      const g = stg(), c = CMP[g.sel];
      if (c.variants && g.variant !== '전체' && !c.variants.includes(g.variant)) g.variant = '전체';
      const stageCls = ['cg-stage', g.state === 'Hover' && 'cg-hover', g.state === 'Pressed' && 'cg-pressed', g.state === 'Focus' && 'cg-focus', g.state === 'Disabled' && 'cg-disabled', g.size === 'sm' && 'cg-sm', g.size === 'lg' && 'cg-lg'].filter(Boolean).join(' ');
      const rOvr = RADIUS_OVR[g.radius], shOvr = SHADOW_OVR[g.shadow];
      const stageStyle = (rOvr ? `--mk-r-small:${rOvr[0]}px;--mk-r-medium:${rOvr[1]}px;--mk-r-large:${rOvr[2]}px;` : '')
        + (shOvr ? `--mk-sh-subtle:${shOvr[0]};--mk-sh-floating:${shOvr[1]};--mk-sh-modal:${shOvr[2]};` : '');
      const nav = GROUPS.map((grp) => `<div class="grp">${grp}</div>` + KEYS.filter((k) => CMP[k].grp === grp).map((k) => `<button class="${k === g.sel ? 'on' : ''}" data-cg-sel="${k}">${k}</button>`).join('')).join('');
      const sp = c.spec;
      return `<div class="cg-layout">
        <div class="cg-nav">${nav}</div>
        <div class="cg-main">
          <div class="cg-controls">
            ${c.variants ? `<span class="cg-ctl"><small>Variant</small>${seg('variant', ['전체', ...c.variants], g.variant)}</span>` : ''}
            <span class="cg-ctl"><small>State</small>${seg('state', ['기본', 'Hover', 'Pressed', 'Focus', 'Disabled'], g.state)}</span>
            <span class="cg-ctl"><small>Size</small>${seg('size', ['sm', 'md', 'lg'], g.size)}</span>
            <span class="cg-ctl"><small>Radius</small>${seg('radius', Object.keys(RADIUS_OVR), g.radius)}</span>
            <span class="cg-ctl"><small>Shadow</small>${seg('shadow', Object.keys(SHADOW_OVR), g.shadow)}</span>
          </div>
          <div class="${stageCls}" style="${stageStyle}">
            <div class="cg-stage-h"><b>${g.sel}</b><small>${c.file}</small><span style="flex:1"></span>${window.MK.Badge({ label: '중립 임시 스타일' })}</div>
            ${c.gallery(g.variant)}
          </div>
          <div class="cg-spec">
            <div><h4>토큰</h4>${sp.tokens.map((t) => `<span class="tok">${t}</span>`).join('')}</div>
            <div><h4>사용 예시</h4><pre>${window.MK.esc(sp.usage)}</pre></div>
            <div><h4>Do / Don't</h4><div class="cg-dd">${sp.dos.map((d) => `<span class="do">${d}</span>`).join('')}${sp.donts.map((d) => `<span class="dont">${d}</span>`).join('')}</div></div>
          </div>
        </div></div>`;
    },
    mount(root) {
      const g = stg();
      root.querySelectorAll('[data-cg-sel]').forEach((b) => b.onclick = () => { g.sel = b.dataset.cgSel; g.variant = '전체'; PG.render(); });
      for (const k of ['variant', 'state', 'size', 'radius', 'shadow'])
        root.querySelectorAll(`[data-cg-${k}]`).forEach((b) => b.onclick = () => { g[k] = b.dataset['cg' + k[0].toUpperCase() + k.slice(1)]; PG.render(); });
    },
  };
})();
