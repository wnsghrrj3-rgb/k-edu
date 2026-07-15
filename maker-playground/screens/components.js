/* ============================================================
   화면: Components — Figma Component 페이지형 3단
   좌: 카테고리 9 (Button·Input·Form·Card·Navigation·Feedback·Overlay·AI·Layout)
   중: Gallery — 선택 카테고리의 전 컴포넌트 × 전 Variant/State
   우: Component Inspector — Description·Usage·Do·Don't·Token·
       Radius·Shadow·Spacing·Typography
   상단: Variant·Size·Radius·Shadow·Theme → 스테이지 즉시 반영
   ⚠ 디자인 검토 화면 — 신규 디자인 창작 금지 (중립 임시·Placeholder 허용)
   카테고리/컴포넌트 추가 = CAT 레지스트리 등록 1건.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.components = (() => {
  const M = () => window.MK, S = () => window.MK_SAMPLE;
  const sec = (name, html) => `<div class="cg-sec"><small>${name}</small><div class="cg-row">${html}</div></div>`;
  const it = (label, html) => `<span class="cg-item"><small>${label}</small><span>${html}</span></span>`;
  const sub = (name, file) => `<div class="cmp-sub">${name}<small>${file}</small></div>`;

  const RADIUS_OVR = { '작게': [4, 6, 10], '기본': null, '크게': [10, 16, 26] };
  const SHADOW_OVR = {
    '없음': ['none', 'none', 'none'], '기본': null,
    '뚜렷': ['0 2px 4px rgba(20,28,40,.10)', '0 8px 26px rgba(20,28,40,.16)', '0 20px 60px rgba(20,28,40,.30)'],
  };
  const THEME_OVR = {
    'Light': null,
    'Dark': '--mk-background:#1B212B;--mk-surface:#232B37;--mk-surface-muted:#2C3543;--mk-text-primary:#F0F4F9;--mk-text-secondary:#9AA5B5;--mk-border:#3A4553;--mk-cream:#2E3340;',
  };

  /* ---------------- 카테고리 레지스트리 ---------------- */
  const CAT = {};
  const reg = (name, def) => { CAT[name] = def; };

  reg('Button', {
    variants: ['Primary', 'Secondary', 'Outline', 'Ghost', 'Danger', 'Success'],
    gallery(v) {
      const B = M().Button, I = M().IconButton;
      const VAR = [['Primary', ''], ['Secondary', 'secondary'], ['Outline', 'outline'], ['Ghost', 'ghost'], ['Danger', 'danger'], ['Success', 'success']];
      const rows = (v === '전체' ? VAR : VAR.filter(([n]) => n === v));
      const STATES = [['Default', {}], ['Hover', { sim: 'hover' }], ['Pressed', { sim: 'pressed' }], ['Focus', { sim: 'focus' }], ['Disabled', { disabled: true }], ['Loading', { loading: true }]];
      const matrix = `<div class="btn-matrix" style="--bm-cols:${STATES.length}">
        <span></span>${STATES.map(([n]) => `<small>${n}</small>`).join('')}
        ${rows.map(([name, kind]) => `<small class="rowh">${name}</small>` + STATES.map(([, o]) => `<span>${B(Object.assign({ label: name, kind }, o))}</span>`).join('')).join('')}</div>`;
      return `<div class="cg-sec"><small>Variant × State 매트릭스 — 전 조합 동시 비교</small>${matrix}</div>`
        + sec('Sizes', it('Small', B({ label: 'Small', size: 'sm' })) + it('Medium', B({ label: 'Medium' })) + it('Large', B({ label: 'Large', size: 'lg' })))
        + sec('Icon', it('Text Only', B({ label: '만들기' })) + it('Icon Left', B({ label: '재생', icon: '▶' })) + it('Icon Right', B({ label: '다음', iconRight: '→' })) + it('Icon Only', B({ label: '재생', icon: '▶', iconOnly: true })))
        + sec('실제 인터랙션 (마우스로 확인)', `${B({ label: 'Hover · Press 해보기' })}${B({ label: '보조', kind: 'secondary' })}${B({ label: '삭제', kind: 'danger' })}`)
        + sub('Icon Button', 'MK.IconButton')
        + sec('기본 · 상태', it('기본', I({ icon: '✏️', tip: '편집' })) + it('활성', I({ icon: '▶', on: true })) + it('Disabled', `<span class="sim-disabled">${I({ icon: '⧉' })}</span>`));
    },
    insp(g) {
      const cs = getComputedStyle(document.documentElement);
      const t = (n) => (cs.getPropertyValue(n) || '').trim() || '—';
      const sz = g.size === 'sm' ? 'sm' : g.size === 'lg' ? 'lg' : 'md';
      const radius = t('--mkb-radius').startsWith('var') || !t('--mkb-radius') ? t('--mk-r-small') : t('--mkb-radius');
      return {
        desc: '서비스 전 화면(Home·Template·Editor·AI·Export) 공통 버튼. 규격·색·모션 전부 --mkb-* 토큰 — 시안 확정 시 components/button.css 토큰만 교체. 상태 우선순위: Disabled/Loading > Pressed > Hover.',
        usage: `MK.Button({ label: '시작하기', kind: 'danger',\n  size: 'sm', icon: '▶', loading: true,\n  disabled: true, iconOnly: true })`,
        dos: ['화면당 강조 1개 원칙', '파괴적 행동엔 Danger', 'Loading 중 클릭 차단(자동)'],
        donts: ['한 줄에 Primary 2개', '아이콘만으로 주요 행동', '시안 반영 시 셀렉터 구조 수정'],
        colorTokens: ['--mkb-primary-bg/hover', '--mkb-secondary-bg/border', '--mkb-outline-border', '--mkb-ghost-hover', '--mkb-danger-bg/hover', '--mkb-success-bg/hover', '--mkb-focus-ring'],
        compTokens: ['--mkb-h-*', '--mkb-pad-*', '--mkb-fs-*', '--mkb-icon-*', '--mkb-radius', '--mkb-border-w', '--mkb-shadow', '--mkb-transition', '--mkb-hover-lift', '--mkb-pressed-scale'],
        metrics: [
          ['Height (' + sz + ')', t('--mkb-h-' + sz)], ['Radius', radius], ['Padding (' + sz + ')', t('--mkb-pad-' + sz)],
          ['Font Size (' + sz + ')', t('--mkb-fs-' + sz)], ['Weight', t('--mkb-weight')], ['Shadow', t('--mkb-shadow')],
          ['Border', t('--mkb-border-w') + ' solid'], ['Transition', t('--mkb-transition').split(',')[0] + ' 외'], ['Hover Lift', t('--mkb-hover-lift')],
        ],
      };
    },
  });

  reg('Input', {
    gallery() {
      const opts = `<option>Pretendard</option><option>시스템 고딕</option><option>명조</option>`;
      return sub('Input', '.mk-input')
        + sec('States', it('기본', `<input class="mk-input" placeholder="파일 이름" style="width:200px">`) + it('입력됨', `<input class="mk-input" value="가을 독서 주간" style="width:200px">`)
          + it('Focus', `<span class="sim-focus"><input class="mk-input" value="포커스" style="width:150px"></span>`) + it('Disabled', `<input class="mk-input" value="수정 불가" disabled style="width:150px;opacity:.5">`))
        + sec('오류 + 라벨', `<div class="mk-field" style="width:230px"><label>파일 이름</label><input class="mk-input error" value=""><span class="err">이름을 입력해 주세요</span></div>`)
        + sub('Textarea', 'textarea.mk-input')
        + sec('기본 · 입력됨', it('기본', `<textarea class="mk-input" placeholder="설명 입력" style="width:250px"></textarea>`) + it('입력됨', `<textarea class="mk-input" style="width:250px">이번 주 우리 반 소식.</textarea>`))
        + sub('Select', 'select.mk-input')
        + sec('기본 · 비활성', it('기본', `<select class="mk-input" style="width:170px">${opts}</select>`) + it('Disabled', `<select class="mk-input" disabled style="width:170px;opacity:.5">${opts}</select>`));
    },
    insp: { desc: '텍스트·선택 입력 컨트롤 묶음. 라벨은 위, 오류는 테두리+문구를 함께 쓴다.',
      usage: `<div class="mk-field"><label>이름</label>\n  <input class="mk-input"></div>`,
      dos: ['라벨은 캡션 크기로 위에', '오류는 색+문구 이중 표시'], donts: ['placeholder를 라벨 대용으로', '한 화면에 입력 높이 제각각'],
      tokens: ['--mk-border', '--mk-surface', '--mk-danger', '--mk-t-body-sm'],
      radius: 'r-small · 6px', shadow: '없음', spacing: '패딩 0 12px · 높이 36px · 라벨 아래 5px', typography: 't-body-sm · 400 13px' },
  });

  reg('Form', {
    gallery() {
      const C = M().Chip;
      return sub('Checkbox', '.mk-check')
        + sec('States', it('선택', `<label class="mk-check"><input type="checkbox" checked> 알림 받기</label>`) + it('해제', `<label class="mk-check"><input type="checkbox"> 자동 저장</label>`) + it('Disabled', `<label class="mk-check" style="opacity:.5"><input type="checkbox" disabled> 잠김</label>`))
        + sub('Radio', '.mk-radio')
        + sec('그룹', `<label class="mk-radio"><input type="radio" name="rg" checked> 교사용</label><label class="mk-radio"><input type="radio" name="rg"> 학생용</label><label class="mk-radio" style="opacity:.5"><input type="radio" name="rg" disabled> 잠김</label>`)
        + sub('Switch', '.mk-switch')
        + sec('States', it('켜짐', `<label class="mk-switch"><input type="checkbox" checked><i></i></label>`) + it('꺼짐', `<label class="mk-switch"><input type="checkbox"><i></i></label>`) + it('Disabled', `<label class="mk-switch" style="opacity:.5"><input type="checkbox" disabled><i></i></label>`))
        + sub('Chip', 'MK.Chip')
        + sec('필터 그룹', `${C({ label: '전체', on: true })}${C({ label: '행사' })}${C({ label: '알림' })}${C({ label: '수업' })}` )
        + sec('States', it('Hover', `<span class="sim-hover">${C({ label: '독서' })}</span>`) + it('Disabled', `<span class="sim-disabled">${C({ label: '잠김' })}</span>`));
    },
    insp: { desc: '선택 컨트롤 묶음. 다중 선택=Checkbox, 상호 배타=Radio, 즉시 켬/끔=Switch, 필터=Chip.',
      usage: `<label class="mk-switch">\n  <input type="checkbox"><i></i></label>`,
      dos: ['용도별 컨트롤 구분 유지', '라벨 클릭도 동작하게 label로 감싸기'], donts: ['상호 배타에 Checkbox', '저장이 따로 필요한 설정에 Switch'],
      tokens: ['--mk-teal (accent)', '--mk-border', '--mk-r-pill'],
      radius: 'pill (Switch·Chip) · 기본 (체크)', shadow: '없음', spacing: '컨트롤-라벨 간격 8px', typography: 't-body-sm · 400 13px' },
  });

  reg('Card', {
    variants: ['Basic', 'Outlined', 'Elevated', 'Interactive', 'Selected', 'Disabled'],
    gallery(v) {
      const T = M().TemplateCard, SC = M().SceneCard, s = S().TEMPLATES;
      const inner = `<b style="font:var(--mk-t-h3)">카드 제목</b><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">정보 묶음 단위.</p>`;
      const all = {
        Basic: `<div class="mk-card" style="width:210px">${inner}</div>`,
        Outlined: `<div class="mk-card outlined" style="width:210px">${inner}</div>`,
        Elevated: `<div class="mk-card elevated" style="width:210px">${inner}</div>`,
        Interactive: `<div class="mk-card interactive" style="width:210px">${inner}<div style="margin-top:10px;font:var(--mk-t-caption);color:var(--mk-teal)">클릭 가능 →</div></div>`,
        Selected: `<div class="mk-card selected" style="width:210px">${inner}</div>`,
        Disabled: `<div class="mk-card" style="width:210px;opacity:.45;pointer-events:none">${inner}</div>`,
      };
      const pick = v === '전체' ? Object.entries(all) : Object.entries(all).filter(([k]) => k === v);
      return sub('Card', '.mk-card')
        + sec('Variants', pick.map(([k, h]) => it(k, h)).join(''))
        + sec('Hover (Interactive)', `<span class="sim-hover" style="display:inline-block">${all.Interactive}</span>`)
        + sub('Template Card', 'MK.TemplateCard — 썸네일·제목·카테고리·비율·난이도·즐겨찾기')
        + sec('실전 사양', `<div style="display:grid;grid-template-columns:repeat(3,205px);gap:14px">${T(s[0], '', { fav: true })}${T(s[2], '', { fav: false })}<span class="sim-hover" style="display:block">${T(s[3], '', { fav: true })}</span></div>`)
        + sub('Scene Card', 'MK.SceneCard — 썸네일·번호·이름·Duration·선택·Active')
        + sec('상태 전수', `<div style="display:flex;gap:14px;align-items:flex-start">
            ${it('기본', SC(s[2].scenes[1], 1, false))}
            ${it('선택됨', SC(s[2].scenes[0], 0, true))}
            ${it('Active (재생)', SC(s[2].scenes[2], 2, false, '', { active: true }))}
            ${it('Hover', `<span class="sim-hover" style="display:inline-block">${SC(s[2].scenes[3], 3, false)}</span>`)}</div>`);
    },
    insp: { desc: '정보 컨테이너와 K-MAKER 고유 카드. Interactive만 커서·호버 부상을 가지며, 선택은 코랄 테두리+링으로 통일. Scene Card의 Active는 재생 중 표시(틸)로 선택(코랄)과 구분.',
      usage: `MK.TemplateCard(tpl, attrs, { fav: true })\nMK.SceneCard(scene, i, selected, attrs,\n  { active: true })`,
      dos: ['정보 묶음 1개 = 카드 1장', '선택=코랄 · 재생=틸 구분 유지', '난이도는 배지 하나로'], donts: ['카드 남발 (§20)', '카드 안 카드 중첩', 'Selected와 Active 동일 표현'],
      colorTokens: ['--mk-surface', '--mk-border', '--mk-coral (선택)', '--mk-teal (Active)', '--mk-coral-soft (링)'],
      compTokens: ['--mk-r-medium', '--mk-r-small (씬)', '--mk-sh-subtle', '--mk-sh-floating (부상)', '--mk-t-h3'],
      radius: 'r-medium 10px · 씬 r-small 6px', shadow: 'subtle → floating (부상)', padding: '카드 sp-5 (20px) · 메타 12-14px', typography: 't-h3 제목 · t-caption 메타·배지' },
  });

  reg('Navigation', {
    gallery() {
      const I = M().IconButton;
      return sub('Top Navigation', '.mk-topnav')
        + sec('기본', `<div class="mk-topnav" style="min-width:520px"><span class="brand">K-MAKER</span><a class="on">홈</a><a>템플릿</a><a>내 작품</a><span style="flex:1"></span>${M().Badge({ label: '샘플', tone: 'teal' })}<span class="mk-avatar sm">준</span></div>`)
        + sub('Toolbar', 'screens/editor.js 상단부')
        + sec('편집기 상단', `<div style="display:flex;align-items:center;gap:8px;border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:8px 12px;background:var(--mk-surface);min-width:520px">${I({ icon: '←' })}<b style="font:var(--mk-t-h3)">문서 이름</b><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">저장됨</span><span style="flex:1"></span>${I({ icon: '↺' })}${I({ icon: '↻' })}${M().Button({ label: '내보내기', kind: 'accent', size: 'sm' })}</div>`)
        + sub('Sidebar', 'screens/editor.js 좌측부')
        + sec('메인 메뉴', `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:4px;background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:10px 8px">${[['가', '텍스트', 1], ['⬡', '요소', 0], ['🖼', '사진', 0]].map(([i, n, on]) => `<span style="width:48px;height:46px;border-radius:var(--mk-r-small);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font:var(--mk-t-caption);${on ? 'background:var(--mk-teal-soft);color:var(--mk-teal)' : 'color:var(--mk-text-secondary)'}"><span style="font-size:15px">${i}</span>${n}</span>`).join('')}</div>`)
        + sub('Tabs', 'MK.Tabs')
        + sec('세그먼트', M().Tabs({ items: ['Design', 'Video'], on: 'Design' }));
    },
    insp: { desc: '이동·전환 컨트롤 묶음. 서비스 상단=TopNav, 편집기 상단=Toolbar, 편집기 좌측=Sidebar, 모드 전환=Tabs.',
      usage: `MK.Tabs({ items: ['Design','Video'],\n  on: 'Design' })`,
      dos: ['TopNav 메뉴 3~5개', 'Sidebar는 아이콘+라벨 세트'], donts: ['편집기 안에서 TopNav 사용', '아이콘 단독 메뉴 (초등 배려)'],
      tokens: ['--mk-surface', '--mk-teal-soft (활성)', '--mk-t-h3', '--mk-sh-subtle'],
      radius: 'r-medium (컨테이너) · r-small (항목)', shadow: 'subtle (Tabs 활성)', spacing: '항목 간 sp-5 · 패딩 10-20px', typography: 't-h3 브랜드 · t-body-sm 메뉴' },
  });

  reg('Feedback', {
    variants: ['기본', '성공', '오류'],
    gallery(v) {
      const B = M().Badge;
      const toasts = { '기본': `<span class="mk-toast">📋 링크를 복사했어요</span>`, '성공': `<span class="mk-toast success">✓ 저장했어요</span>`, '오류': `<span class="mk-toast danger">⚠ 내보내기 실패 <u style="cursor:pointer">다시 시도</u></span>` };
      const pick = v === '전체' ? Object.entries(toasts) : Object.entries(toasts).filter(([k]) => k === v);
      return sub('Toast', '.mk-toast')
        + sec('Tones', pick.map(([k, h]) => it(k, h)).join(''))
        + sub('Badge', 'MK.Badge')
        + sec('Tones', `${B({ label: '기본' })}${B({ label: '코랄', tone: 'coral' })}${B({ label: '틸', tone: 'teal' })}${B({ label: '성공', tone: 'success' })}${B({ label: '위험', tone: 'danger' })}`)
        + sub('Loading', '.mk-spin / .mk-skel')
        + sec('Spinner', it('Small', `<span class="mk-spin dark"></span>`) + it('Large', `<span class="mk-spin dark lg"></span>`) + it('버튼 내', `<button class="mk-btn"><span class="mk-spin"></span> 저장 중</button>`))
        + sec('Skeleton', `<div style="width:250px"><div class="mk-skel" style="height:13px;margin-bottom:8px"></div><div class="mk-skel" style="height:13px;width:70%;margin-bottom:8px"></div><div class="mk-skel" style="height:70px"></div></div>`)
        + sub('Empty State', '패턴')
        + sec('기본', `<div style="text-align:center;padding:var(--mk-sp-6);border:1.5px dashed var(--mk-border);border-radius:var(--mk-r-medium);width:300px"><div style="font-size:24px;margin-bottom:8px">🗂</div><b style="font:var(--mk-t-h3)">아직 템플릿이 없어요</b><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin:6px 0 12px">첫 템플릿을 만들어 볼까요?</p>${M().Button({ label: '만들기 시작', kind: 'accent', size: 'sm' })}</div>`);
    },
    insp: { desc: '상태·결과를 알리는 요소 묶음. 순간 알림=Toast, 지속 표식=Badge, 대기=Loading, 내용 없음=Empty State.',
      usage: `<span class="mk-toast success">✓ 저장했어요</span>`,
      dos: ['토스트는 3초 자동 소멸 + 행동 1개', '빈 상태엔 다음 행동 버튼', '1초 이상 대기만 로딩 표시'], donts: ['중요 결정을 토스트로 요구', '"데이터 없음" 문구만 표시', '전체 화면 스피너 남발'],
      tokens: ['--mk-success', '--mk-danger', '--mk-surface-muted', '--mk-sh-floating', '--mk-r-pill'],
      radius: 'r-medium (토스트) · pill (배지)', shadow: 'floating (토스트)', spacing: '패딩 11-16px · 아이콘 간격 10px', typography: 't-body-sm · t-caption (배지)' },
  });

  reg('Overlay', {
    gallery() {
      return sub('Modal', 'MK.Modal')
        + sec('정적 시안', `<div class="mk-modal" style="width:340px;box-shadow:var(--mk-sh-modal)"><h2>모달 제목</h2><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">본문 영역. 배경 딤과 중앙 표시.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">${M().Button({ label: '닫기', kind: 'secondary', size: 'sm' })}${M().Button({ label: '확인', size: 'sm' })}</div></div>`)
        + sec('실동작', M().Button({ label: '모달 열어보기', kind: 'secondary', size: 'sm', attrs: `onclick="MK.Modal.open('<h2>실동작 모달</h2><p style=color:var(--mk-text-secondary)>바깥 클릭으로 닫기.</p><div style=margin-top:14px;text-align:right>'+MK.Button({label:'닫기',attrs:'onclick=MK.Modal.close()'})+'</div>')"` }))
        + sub('Dialog', 'Modal 파생')
        + sec('확인 (파괴적)', `<div class="mk-modal" style="width:320px;box-shadow:var(--mk-sh-subtle);border:1px solid var(--mk-border)"><h2>장면을 삭제할까요?</h2><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">되돌릴 수 없어요.</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">${M().Button({ label: '취소', kind: 'secondary', size: 'sm' })}${M().Button({ label: '삭제', kind: 'danger', size: 'sm' })}</div></div>`)
        + sub('Tooltip', '.mk-tooltip')
        + sec('호버', `<span class="mk-tooltip" data-tip="편집" style="display:inline-block">${M().IconButton({ icon: '✏️' })}</span><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin-left:8px">← 마우스 올려보기</span>`)
        + sub('Dropdown', '.mk-dropdown')
        + sec('열림 상태', `<div class="mk-dropdown open" style="position:relative;display:inline-block;margin-bottom:130px"><button class="mk-btn secondary sm">내보내기 ▾</button><div class="mk-dropdown-menu"><button>PNG 이미지</button><button>PDF 문서</button><button>PPT 파일</button><button>MP4 영상</button></div></div>`);
    },
    insp: { desc: '화면 위에 뜨는 요소 묶음. 결정=Modal/Dialog, 보조 설명=Tooltip, 선택 목록=Dropdown.',
      usage: `MK.Modal.open(html)\nMK.Modal.close()`,
      dos: ['모달엔 결정 1개만', '파괴적 행동은 Danger + 결과 설명'], donts: ['모달 위 모달', '툴팁에 필수 정보 담기'],
      tokens: ['--mk-sh-modal', '--mk-z-modal', '--mk-r-large', '--mk-text-primary (툴팁)'],
      radius: 'r-large (모달) · r-small (드롭다운)', shadow: 'modal · floating (드롭다운)', spacing: '모달 패딩 sp-6 (24px)', typography: 't-h2 제목 · t-body-sm 본문' },
  });

  reg('AI', {
    gallery() {
      return sub('AI Prompt Box', '.mk-aibox')
        + sec('기본', `<div class="mk-aibox"><textarea placeholder="예: 3학년 과학 발표자료 만들어줘"></textarea><div class="foot">${M().Chip({ label: '발표자료 만들어줘' })}${M().Chip({ label: '문장 짧게' })}<span style="flex:1"></span>${M().Button({ label: '만들기', kind: 'accent', size: 'sm' })}</div></div>`)
        + sec('Loading', `<div class="mk-aibox" style="opacity:.85"><div style="display:flex;align-items:center;gap:10px;padding:8px 2px"><span class="mk-spin dark"></span><span style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">구성을 만들고 있어요…</span></div></div>`)
        + sec('결과 카드 (Placeholder)', `<div class="mk-card" style="max-width:520px"><div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">${M().Badge({ label: 'AI 제안', tone: 'teal' })}<b style="font:var(--mk-t-h3)">화산 발표자료 · 4장 구성</b></div><div style="display:flex;gap:8px">${['표지', '목차', '본문', '마무리'].map((n) => `<div style="flex:1;aspect-ratio:16/10;background:var(--mk-surface-muted);border-radius:var(--mk-r-small);display:flex;align-items:center;justify-content:center;font:var(--mk-t-caption);color:var(--mk-text-secondary)">${n}</div>`).join('')}</div><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px">${M().Button({ label: '다시 만들기', kind: 'ghost', size: 'sm' })}${M().Button({ label: '이 구성 사용', kind: 'accent', size: 'sm' })}</div></div>`);
    },
    insp: { desc: 'AI 제작 진입점(§10 — AI는 장식이 아니라 제작 파트너). 프롬프트 입력 → 구성 제안 → 사용 흐름.',
      usage: `<div class="mk-aibox">\n  <textarea></textarea>\n  <div class="foot">칩 + 만들기</div></div>`,
      dos: ['추천 프롬프트 칩 2~3개 동반', '결과는 수정 가능한 제안으로'], donts: ['AI를 구석 장식 기능으로 배치', '결과를 곧바로 확정 적용'],
      tokens: ['--mk-teal (테두리)', '--mk-teal-soft', '--mk-r-large', '--mk-t-body'],
      radius: 'r-large · 16px', shadow: 'subtle', spacing: '패딩 sp-4 · 칩 간격 8px', typography: 't-body 입력 · t-caption 칩' },
  });

  reg('Layout', {
    gallery() {
      return sub('Panel', '.mk-panel')
        + sec('기본', `<div class="mk-panel" style="width:280px"><div class="ph">패널 제목</div><div class="pb">보조 패널·속성 패널의 기본 골격.</div></div>`)
        + sub('Divider', '.mk-divider')
        + sec('기본', `<div style="width:280px"><p style="font:var(--mk-t-body-sm)">위 내용</p><hr class="mk-divider" style="margin:12px 0"><p style="font:var(--mk-t-body-sm)">아래 내용</p></div>`)
        + sub('Avatar', '.mk-avatar')
        + sec('Sizes · 그룹', it('S', `<span class="mk-avatar sm">김</span>`) + it('M', `<span class="mk-avatar">준</span>`) + it('L', `<span class="mk-avatar lg">호</span>`) + it('모둠', `<span class="mk-avatar-stack"><span class="mk-avatar">김</span><span class="mk-avatar coral">이</span><span class="mk-avatar">박</span><span class="mk-avatar coral">+2</span></span>`));
    },
    insp: { desc: '구조 요소 묶음. 영역 구획=Panel, 내용 분리=Divider, 사용자 표식=Avatar.',
      usage: `<div class="mk-panel">\n  <div class="ph">제목</div>\n  <div class="pb">내용</div></div>`,
      dos: ['패널 제목은 h3급 하나로', '이니셜 1~2자'], donts: ['패널 중첩 3단 이상', '구분선 남발'],
      tokens: ['--mk-surface', '--mk-border', '--mk-teal-soft', '--mk-r-medium'],
      radius: 'r-medium · 10px', shadow: '없음', spacing: '헤더 10-14px · 본문 14px', typography: 't-h3 제목 · t-body-sm 본문' },
  });

  const KEYS = ['Button', 'Input', 'Form', 'Card', 'Navigation', 'Feedback', 'Overlay', 'AI', 'Layout'];

  /* ---------------- 화면 ---------------- */
  const stg = () => {
    if (!PG.state.cg2) PG.state.cg2 = { sel: 'Button', variant: '전체', state: '기본', size: 'md', radius: '기본', shadow: '기본', theme: 'Light', density: '기본' };
    if (!PG.state.cg2.state) { PG.state.cg2.state = '기본'; PG.state.cg2.density = '기본'; }
    return PG.state.cg2;
  };
  const seg = (key, items, on) => `<span class="seg">${items.map((x) => `<button class="${x === on ? 'on' : ''}" data-cg-${key}="${x}">${x}</button>`).join('')}</span>`;

  return {
    title: 'Components', variants: ['A'],
    render() {
      const g = stg(), c = CAT[g.sel];
      if (c.variants && g.variant !== '전체' && !c.variants.includes(g.variant)) g.variant = '전체';
      const stageCls = ['cg-stage',
        g.state === 'Hover' && 'cg-hover', g.state === 'Focus' && 'cg-focus', g.state === 'Pressed' && 'cg-pressed', g.state === 'Disabled' && 'cg-disabled',
        g.size === 'sm' && 'cg-sm', g.size === 'lg' && 'cg-lg',
        g.density === '촘촘' && 'cg-dense', g.density === '여유' && 'cg-relax'].filter(Boolean).join(' ');
      const rOvr = RADIUS_OVR[g.radius], shOvr = SHADOW_OVR[g.shadow];
      const stageStyle = (rOvr ? `--mk-r-small:${rOvr[0]}px;--mk-r-medium:${rOvr[1]}px;--mk-r-large:${rOvr[2]}px;` : '')
        + (shOvr ? `--mk-sh-subtle:${shOvr[0]};--mk-sh-floating:${shOvr[1]};--mk-sh-modal:${shOvr[2]};` : '')
        + (THEME_OVR[g.theme] || '');
      const i = typeof c.insp === 'function' ? c.insp(g) : c.insp;
      return `<div class="cg2-layout">
        <div class="cg-nav">${KEYS.map((k) => `<button class="${k === g.sel ? 'on' : ''}" data-cg-sel="${k}">${k}</button>`).join('')}</div>
        <div class="cg2-mid">
          <div class="cg-controls">
            ${c.variants ? `<span class="cg-ctl"><small>Variant</small>${seg('variant', ['전체', ...c.variants], g.variant)}</span>` : ''}
            <span class="cg-ctl"><small>State</small>${seg('state', ['기본', 'Hover', 'Focus', 'Pressed', 'Disabled'], g.state)}</span>
            <span class="cg-ctl"><small>Size</small>${seg('size', ['sm', 'md', 'lg'], g.size)}</span>
            <span class="cg-ctl"><small>Theme</small>${seg('theme', Object.keys(THEME_OVR), g.theme)}</span>
            <span class="cg-ctl"><small>Radius</small>${seg('radius', Object.keys(RADIUS_OVR), g.radius)}</span>
            <span class="cg-ctl"><small>Shadow</small>${seg('shadow', Object.keys(SHADOW_OVR), g.shadow)}</span>
            <span class="cg-ctl"><small>Density</small>${seg('density', ['촘촘', '기본', '여유'], g.density)}</span>
          </div>
          <div class="${stageCls}" style="${stageStyle}${g.theme === 'Dark' ? 'background:var(--mk-background);' : ''}">
            <div class="cg-stage-h"><b>${g.sel}</b><small>디자인 검토용 · Figma Component 페이지형</small><span style="flex:1"></span>${window.MK.Badge({ label: '중립 임시 스타일' })}</div>
            ${c.gallery(g.variant)}
          </div>
        </div>
        <div class="cg-insp">
          <div class="cg-insp-h">Inspector <span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${g.sel}</span></div>
          <div class="cg-insp-b">
            <h4>Description</h4><p>${i.desc}</p>
            <h4>Usage</h4><pre>${window.MK.esc(i.usage)}</pre>
            <h4>Do / Don't</h4><div class="cg-dd">${i.dos.map((d) => `<span class="do">${d}</span>`).join('')}${i.donts.map((d) => `<span class="dont">${d}</span>`).join('')}</div>
            <h4>Color Token</h4>${(i.colorTokens || (i.tokens || []).filter((t) => !/-r-|-t-|-sh-|pill/.test(t))).map((t) => `<span class="tok">${t}</span>`).join('')}
            <h4>Component Token</h4>${(i.compTokens || (i.tokens || []).filter((t) => /-r-|-t-|-sh-|pill/.test(t))).map((t) => `<span class="tok">${t}</span>`).join('')}
            <h4>${typeof c.insp === 'function' ? 'Button Spec (라이브 계측)' : 'Metrics'}</h4>
            ${i.metrics ? i.metrics.map(([k2, v2]) => `<div class="kv"><small>${k2}</small><b>${v2}</b></div>`).join('') :
            `<div class="kv"><small>Radius</small><b>${i.radius}</b></div>
            <div class="kv"><small>Shadow</small><b>${i.shadow}</b></div>
            <div class="kv"><small>Padding</small><b>${i.padding || i.spacing}</b></div>
            <div class="kv"><small>Typography</small><b>${i.typography}</b></div>`}
          </div>
        </div>
      </div>`;
    },
    mount(root) {
      const g = stg();
      root.querySelectorAll('[data-cg-sel]').forEach((b) => b.onclick = () => { g.sel = b.dataset.cgSel; g.variant = '전체'; PG.render(); });
      for (const k of ['variant', 'state', 'size', 'radius', 'shadow', 'theme', 'density'])
        root.querySelectorAll(`[data-cg-${k}]`).forEach((b) => b.onclick = () => { g[k] = b.dataset['cg' + k[0].toUpperCase() + k.slice(1)]; PG.render(); });
    },
  };
})();
