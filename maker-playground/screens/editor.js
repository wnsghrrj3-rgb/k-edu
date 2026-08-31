/* ============================================================
   화면: Editor v1 — "가장 편하고 직관적인 제작 경험"
   구역 역할 고정: 좌 = 추가 · 중앙 = 편집 · 우 = 속성
   6구역 = 독립 렌더 함수 (Toolbar/MainMenu/DetailPanel/CanvasArea/
   PropsPanel/BottomBar) — GPT 시안 교체 시 함수 단위로 갈아입힘.
   Design 모드: 하단 Scene Strip / Video 모드: 길이 타임라인.
   ⚠ 더미 편집 — Scene 선택·텍스트 입력·이미지 교체·씬 조작·줌만 동작.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.editor = (() => {
  const M = () => window.MK;
  const ed = () => PG.state.editor;

  /* ================= Toolbar (뒤로·프로젝트명·실행취소·다시실행·저장·미리보기·공유·내보내기) ================= */
  const Toolbar = (mode) => {
    const e = ed();
    return `<div class="ed-toolbar">
      ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14.5 5.5L8 12l6.5 6.5'/></svg>", tip: '나가기', attrs: 'data-ed="back"' })}
      <span class="ed-tb-file">
        <span class="fname">${M().esc(e.doc.title)}</span>
        <span class="savestate" id="edSave">${e.savedAt ? '저장됨 · ' + e.savedAt : '저장 안 함'}</span>
        ${M().Button({ label: '저장', kind: 'secondary', size: 'sm', attrs: 'data-ed="save"' })}
      </span>
      <span class="grow"></span>
      <span class="ed-tb-hist">
        ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M8 7L4.5 10.5 8 14'/><path d='M4.5 10.5H15a4.5 4.5 0 0 1 0 9h-3'/></svg>", tip: '실행 취소 (⌘Z)', attrs: 'data-ed="undo"' + (window.MK_HIST && MK_HIST.canUndo() ? '' : ' disabled') })}
        ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M16 7l3.5 3.5L16 14'/><path d='M19.5 10.5H9a4.5 4.5 0 0 0 0 9h-3'/></svg>", tip: '다시 실행 (⇧⌘Z)', attrs: 'data-ed="redo"' + (window.MK_HIST && MK_HIST.canRedo() ? '' : ' disabled') })}
      </span>
      ${M().Tabs({ items: ['Design', 'Video'], on: mode === 'video' ? 'Video' : 'Design', attrs: 'data-ed="mode"' })}
      <span class="grow"></span>
      ${window.MK_PLUGIN ? window.MK_PLUGIN.contributions('topToolbar').map((c) => M().IconButton({ icon: c.icon, tip: c.title + ' · ' + c.plugin, attrs: `data-plugcmd="${c.command}"` })).join('') : ''}
      ${M().Button({ label: '미리보기', kind: 'secondary', size: 'sm', attrs: 'data-ed="preview"' })}
      ${M().Button({ label: '공유', kind: 'secondary', size: 'sm', attrs: 'data-ed="share"' })}
      ${M().Button({ label: '내보내기', kind: 'accent', size: 'sm', attrs: 'data-ed="export"' })}
    </div>`;
  };

  /* ================= Left: Main Menu (추가) ================= */
  const MENUS = [['tpl', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='17' height='17' rx='2.5'/><path d='M3.5 9.5h17M9.5 9.5v11'/></svg>", '템플릿'], ['ai', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7-4.7-1.8 4.7-1.8zM18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z'/></svg>", 'AI'], ['text', '<span class="txtico">가</span>', '텍스트'], ['el', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='8' height='8' rx='1.5'/><circle cx='16.5' cy='16.5' r='4.2'/><path d='M12.5 7.5h4a3 3 0 0 1 3 3v1'/></svg>", '요소'],
    ['photo', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='4.5' width='17' height='15' rx='2.5'/><circle cx='9' cy='10' r='1.7'/><path d='M4.5 17l4.5-4.5 3.5 3.5 3-3 4 4'/></svg>", '사진'], ['video', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3' y='5.5' width='13' height='13' rx='2.5'/><path d='M16 10l5-2.8v9.6L16 14z'/></svg>", '영상'], ['audio', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M9.5 17.5V6.5l9-2v11'/><circle cx='7' cy='17.5' r='2.6'/><circle cx='16' cy='15.5' r='2.6'/></svg>", '오디오'], ['bg', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='17' height='17' rx='2.5'/><path d='M3.5 14.5l5-5 6 6M13 12l3-3 4.5 4.5'/></svg>", '배경'], ['up', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 15.5v-11M7.5 8.5L12 4l4.5 4.5M4.5 19.5h15'/></svg>", '업로드']];
  const MainMenu = () => `<div class="ed-mainmenu"><small class="ed-zone-cap">추가</small>` +
    MENUS.map(([k, i, n]) => `<button class="${ed().menu === k ? 'on' : ''}" data-menu="${k}"><span class="ico">${i}</span>${n}</button>`).join('') + `</div>`;

  /* ================= Left: Detail Panel ================= */
  const DETAIL = {
    tpl: ['이 문서와 같은 유형의 템플릿', '스타일 바꾸기'], ai: ['발표자료 만들어줘', '문장을 짧게 바꿔줘', '1학년 수준으로 바꿔줘', '제목 추천'],
    text: ['제목 추가', '부제목 추가', '본문 추가', '글꼴 스타일 목록'], el: ['도형', '아이콘', '스티커', '표'],
    photo: ['사진 검색', '내 사진'], video: ['영상 클립 검색', '배경 영상'], audio: ['배경음악', '효과음'],
    bg: ['단색 배경', '이미지 배경', '움직이는 배경'], up: ['파일 올리기', '업로드 목록'],
  };
  /* ---- AI Dock (STEP 1·10) — Context 배지 + 대화 로그 + 빠른 명령 + 입력 ---- */
  const QUICK = [['이 제목을 더 고급스럽게', '고급'], ['배경을 어둡게', '배경'], ['색상 통일', '색통일'], ['여백 늘려', '여백'],
    ['표를 차트로', '표→차트'], ['원형 그래프로', '원형'], ['FAQ 페이지 추가', 'FAQ'], ['고객 후기 추가', '후기'],
    ['슬라이드를 8장으로 줄여', '8장'], ['투자자용으로 수정', '투자자'], ['다크 모드', '다크'], ['Apple 스타일', 'Apple']];

  const AIDock = () => {
    const e = ed(), ctx = window.MK_AIED ? MK_AIED.context() : null;
    if (!ctx) return '<div class="ed-detail"><h3>AI</h3><p class="ed-note">문서를 먼저 열어 주세요.</p></div>';
    const sel = ctx.selected
      ? (ctx.selectedKind === 'text' ? `텍스트 "${M().esc(String(ctx.selected.text).split('\n')[0].slice(0, 10))}"` : ctx.selectedKind === 'chart' ? '차트' : ctx.selectedKind === 'table' ? '표' : '이미지')
      : '선택 없음';
    const log = (e.aiLog || []).map((m) =>
      `<div class="aid-msg ${m.role}${m.err ? ' err' : ''}">${m.role === 'ai' ? '<span class="aid-dot"></span>' : ''}<span>${M().esc(m.text)}</span></div>`).join('')
      || '<div class="aid-empty">캔버스를 이해하는 AI 편집기예요.<br>아래 명령을 눌러 보거나 직접 말해 주세요.</div>';
    const hist = window.MK_HIST ? MK_HIST.list() : [];
    return `<div class="ed-detail ed-aidock"><h3>AI 편집</h3>
      <div class="aid-ctx" data-ed="aictx">
        <span title="현재 프로젝트">${M().esc(ctx.project)}</span>
        <b>씬 ${ctx.sceneIdx + 1}/${ctx.sceneCount} · ${M().esc(ctx.sceneName)}</b>
        <em>선택: ${M().esc(sel)} · 테마 ${M().esc(ctx.theme.paletteName)}${ctx.theme.dark ? ' (다크)' : ''}</em>
      </div>
      <div class="aid-log" id="aidLog">${log}</div>
      <div class="aid-quick">${QUICK.map(([c, l]) => `<button class="aid-chip" data-cmd="${M().esc(c)}" title="${M().esc(c)}">${l}</button>`).join('')}</div>
      <div class="aid-input">
        <input class="mk-input" data-ed="ai-in" placeholder="예) 이 카드 3개를 정렬" aria-label="AI 명령 입력">
        <button class="mk-btn accent" data-ed="ai-run">실행</button>
      </div>
      ${hist.length ? `<details class="aid-hist"><summary>AI 작업 기록 (${hist.length})</summary><ol>${hist.map((h) => `<li>${M().esc(h)}</li>`).join('')}</ol></details>` : ''}
      <p class="ed-note">${window.MK_AILIVE && MK_AILIVE.hasKey()
        ? '실 AI 연결됨 · Claude — 못 알아듣는 명령은 진짜 AI가 이어받아요. <button class="mk-btn sm" data-ed="ai-key">관리</button>'
        : '규칙 파서로 동작 중 — 명령은 캔버스를 실변형(Undo 가능). <button class="mk-btn sm" data-ed="ai-key">실 AI 연결</button>'}</p></div>`;
  };

  /* R38 — 오디오 패널: 합성 3종 실재생 + 내 음악 파일 → 장면 배경음 */
  const AudioPanel = () => {
    const e = ed(), doc = e.doc;
    const sc = doc && doc.scenes[e.sceneIdx];
    const cur = sc && sc.music ? sc.music.name || '배경음' : null;
    const rows = (window.MK_AUDIO ? MK_AUDIO.SYNTHS : []).map((sy) =>
      `<div class="ph-item" style="display:flex;align-items:center;gap:6px"><span style="flex:1">🎵 ${M().esc(sy.name)} <em style="opacity:.6">· ${sy.mood}</em></span>
        <button class="mk-btn sm" data-au="pre" data-id="${sy.id}">듣기</button>
        <button class="mk-btn sm accent" data-au="set" data-id="${sy.id}">씬에 넣기</button></div>`).join('');
    return `<div class="ed-detail"><h3>오디오</h3>
      <p class="ed-note" style="margin-top:0">이 장면 배경음: <b>${cur ? '🎵 ' + M().esc(cur) : '없음'}</b>${cur ? ` <button class="mk-btn sm" data-au="clear">빼기</button>` : ''}</p>
      <div class="ph-list">${rows}
        <button class="ph-item" data-au="file">내 음악 파일 넣기 (mp3 등 · 8MB)</button>
        <button class="ph-item" data-au="stop">미리듣기 멈추기</button></div>
      <p class="ed-note">배경음은 미리보기·재생에서 실재생되고, MP4 내보내기에도 소리 트랙으로 실려요.</p></div>`;
  };
  /* ================= Left: Detail Panel — R41 실배선 =================
     실동작 버튼 = data-pane, 미연결 항목 = disabled + 정직 표기(가짜 버튼 0) */
  const offBtn = (label, why) => `<button class="ph-item" disabled style="opacity:.45;cursor:not-allowed" title="${why}">${label} <em style="opacity:.7">· ${why}</em></button>`;
  const stockGridHTML = (tag) => {
    if (!window.MK_STOCK) return '';
    const hits = MK_STOCK.search(ed().stockQ || '').slice(0, 12);
    return hits.map((h2) => `<button data-stock="${h2.id}" data-stocktag="${tag}" title="${h2.name} · ${h2.cat}" style="padding:0;border:1px solid var(--mk-border);border-radius:8px;overflow:hidden;cursor:pointer;background:none"><img src="${MK_STOCK.srcOf(h2.id)}" alt="${h2.name}" style="width:100%;aspect-ratio:16/9;display:block;object-fit:cover"></button>`).join('')
      || '<span class="ed-note">검색 결과 없음 — 예) 벚꽃·별밤·격자·노을</span>';
  };
  const stockBlock = (tag, label) => window.MK_STOCK ? `<div class="ph-item" style="display:block;cursor:default">
      <b style="display:block;margin-bottom:6px">${label}</b>
      <input class="mk-input" data-stockq="${tag}" value="${(ed().stockQ || '').replace(/"/g, '&quot;')}" placeholder="재료 검색 — 벚꽃·별밤·격자·노을·뱃지…" style="width:100%" aria-label="재료 검색">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px" data-stockgrid="${tag}">${stockGridHTML(tag)}</div>
      <p class="ed-note" style="margin:6px 0 0">내장 생성 그래픽 ${MK_STOCK.LIB.length}종 — 저작권 걱정 0</p></div>` : '';
  /* ---- 캐릭터 서랍 (MK_CHARS — 파일 자산) ----
     MK_STOCK 이 절차생성 SVG 라면 이쪽은 실제 이미지 팩이다. 톤이 달라
     같은 격자에 섞지 않고 서랍을 따로 둔다. */
  const charGridHTML = () => {
    if (!window.MK_CHARS) return '';
    const hits = MK_CHARS.search(ed().charQ || '', ed().charCat || '').slice(0, 24);
    return hits.map((c) => `<button data-char="${c.id}" title="${c.name} · ${c.cat}" style="padding:4px;border:1px solid var(--mk-border);border-radius:8px;cursor:pointer;background:var(--mk-surface,#fff);display:grid;place-items:center;aspect-ratio:1"><img src="${MK_CHARS.srcOf(c.id)}" alt="${c.name}" loading="lazy" style="max-width:100%;max-height:100%;display:block;object-fit:contain"></button>`).join('')
      || '<span class="ed-note">검색 결과 없음 — 예) 강아지·말풍선·모자·발자국</span>';
  };
  const charBlock = () => window.MK_CHARS ? `<div class="ph-item" style="display:block;cursor:default">
      <b style="display:block;margin-bottom:6px">🐶 캐릭터 (${MK_CHARS.PACKS[0].name})</b>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
        ${[['', '전체']].concat(MK_CHARS.CATS.map((c) => [c, c])).map(([k, n]) =>
          `<button data-charcat="${k}" class="pg-variant ${(ed().charCat || '') === k ? 'on' : ''}" style="padding:2px 8px;font-size:12px">${n}</button>`).join('')}
      </div>
      <input class="mk-input" data-charq value="${(ed().charQ || '').replace(/"/g, '&quot;')}" placeholder="캐릭터 검색 — 강아지·말풍선·모자·발자국…" style="width:100%" aria-label="캐릭터 검색">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px" data-chargrid>${charGridHTML()}</div>
      <p class="ed-note" style="margin:6px 0 0">캐릭터 자산 ${MK_CHARS.LIB.length}종 — 넣은 뒤 크기·회전·좌우반전 모두 됩니다</p></div>` : '';
  const DETAIL_R41 = {
    tpl: () => `<button class="ph-item" data-pane="go-templates">템플릿 둘러보기 → (Templates 화면)</button>
      <button class="ph-item" data-pane="go-ai">스타일 바꾸기 → AI 편집에서 (색·테마 명령)</button>`,
    text: () => `<button class="ph-item" data-pane="add-title">제목 추가</button>
      <button class="ph-item" data-pane="add-sub">부제목 추가</button>
      <button class="ph-item" data-pane="add-body">본문 추가</button>
      ${offBtn('글꼴 스타일 목록', '다음 몫')}`,
    el: () => `<button class="ph-item" data-pane="add-box">도형 넣기 (색 상자)</button>
      <button class="ph-item" data-pane="add-table">표 넣기</button>
      <button class="ph-item" data-pane="add-chart">차트 넣기 (막대)</button>
      ${charBlock()}
      ${offBtn('아이콘·스티커 (플랫 SVG)', '재료 미입고')}`,
    photo: () => `<button class="ph-item" data-pane="ins-image">내 사진 파일 넣기 (8MB)</button>
      ${window.MK_SEG ? `<button class="ph-item" data-pane="person-swap">🪄 인물 바꾸기 — 선택한 사진 속 사람을 오리고·지우고·바꿔요</button>` : ''}
      ${window.MK_TOON ? `<button class="ph-item" data-pane="toon">🎭 캐릭터 필터 — 선택한 사진을 만화·스케치·픽셀로 (6가지)</button>` : ''}
      ${window.MK_CHROMA ? `<button class="ph-item" data-pane="chroma">🟩 배경 지우기 — 초록 천·파란 도화지·흰 벽 앞 사진을 투명 배경으로</button>` : ''}
      ${stockBlock('P', '🎨 재료 검색 (내장 생성)')}
      ${offBtn('실사 스톡 사진', '외부 소스 미연결')}`,
    video: () => `<button class="ph-item" data-pane="ins-video">내 영상 파일 넣기 (8MB)</button>
      ${offBtn('영상 클립 검색·배경 영상', '소스 미연결')}`,
    bg: () => { const sc = ed().doc && ed().doc.scenes[ed().sceneIdx]; const cur = (sc && sc.background) || '#FFFFFF';
      return `<div class="ph-item" style="display:flex;align-items:center;gap:8px"><span style="flex:1">단색 배경</span>
        <input type="color" data-pane="bg-color" value="${/^#[0-9A-Fa-f]{6}$/.test(cur) ? cur : '#FFFFFF'}" aria-label="배경색"></div>
      <div class="ph-item" style="display:flex;gap:6px">${['#FFFFFF', '#1F2733', '#FFF7E8', '#EAF3F0'].map((c) =>
        `<button data-pane="bg-set" data-c="${c}" title="${c}" style="width:26px;height:26px;border-radius:6px;border:1px solid var(--mk-border);background:${c};cursor:pointer"></button>`).join('')}</div>
      ${stockBlock('B', '🖼 이미지 배경 (내장 생성 — 클릭 = 이 장면 배경으로)')}
      ${offBtn('움직이는 배경', '다음 몫')}`; },
    up: () => `<button class="ph-item" data-pane="ins-any">파일 올리기 (사진·영상 → 장면에 삽입)</button>
      <p class="ed-note" style="margin:6px 0 0">올린 파일은 요소로 장면에 들어가고, 저장 시 이 기기(localStorage)에 함께 저장돼요.</p>`,
  };
  const DetailPanel = () => {
    if (ed().menu === 'ai') return AIDock();
    if (ed().menu === 'audio' && window.MK_AUDIO && ed().doc) return AudioPanel();
    const name = (MENUS.find((m) => m[0] === ed().menu) || [])[2] || '';
    const body = DETAIL_R41[ed().menu];
    if (body && ed().doc) return `<div class="ed-detail"><h3>${name}</h3><div class="ph-list">${body()}</div></div>`;
    return `<div class="ed-detail"><h3>${name}</h3>
      <div class="ph-list">${(DETAIL[ed().menu] || []).map((d) => `<button class="ph-item">${d}</button>`).join('')}</div>
      <p class="ed-note">콘텐츠 연결 예정 — 외형 검토용</p></div>`;
  };


  /* ================= Chart / Table 렌더러 (Canvas·MiniScene 공용) ================= */
  const esc2 = (v) => window.MK.esc(String(v));
  const ChartSVG = (el, dark, mini) => {
    const S = el.series || [], ac = el.accent || '#2E8C7F';
    const muted = dark ? '#8A97A8' : '#8E97A3', grid = dark ? 'rgba(255,255,255,.14)' : 'rgba(31,39,51,.10)';
    const max = Math.max(1, ...S.map((d) => Math.abs(+d.v) || 0));
    const W = 100, H = 62, PADB = mini ? 6 : 11, TOP = el.title && !mini ? 12 : 4;
    let body = '';
    if (el.chartType === 'pie') {
      const total = S.reduce((a, d) => a + (+d.v || 0), 0) || 1;
      const cx = 30, cy = (H + TOP) / 2, r = Math.min(20, (H - TOP) / 2 - 2);
      let acc = -Math.PI / 2;
      body = S.map((d, i) => {
        const ang = (+d.v || 0) / total * Math.PI * 2, e2 = acc + ang;
        const x1 = cx + r * Math.cos(acc), y1 = cy + r * Math.sin(acc), x2 = cx + r * Math.cos(e2), y2 = cy + r * Math.sin(e2);
        const large = ang > Math.PI ? 1 : 0, op = (1 - i * 0.19).toFixed(2);
        acc = e2;
        return `<path d="M${cx} ${cy} L${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${ac}" opacity="${op}"/>`;
      }).join('');
      if (!mini) body += S.map((d, i) => `<rect x="60" y="${TOP + 3 + i * 11}" width="4" height="4" rx="1" fill="${ac}" opacity="${(1 - i * 0.19).toFixed(2)}"/><text x="67" y="${TOP + 6.6 + i * 11}" font-size="4.4" fill="${muted}">${esc2(d.k)} · ${esc2(d.v)}</text>`).join('');
    } else if (el.chartType === 'line') {
      const n = S.length || 1, step = 84 / Math.max(1, n - 1);
      const pts = S.map((d, i) => [8 + i * step, H - PADB - ((+d.v || 0) / max) * (H - PADB - TOP - 3)]);
      body = `<path d="M${pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L')}" fill="none" stroke="${ac}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
        + pts.map((p, i) => `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${i === pts.length - 1 ? 2.4 : 1.5}" fill="${ac}"/>`).join('')
        + (mini ? '' : S.map((d, i) => `<text x="${pts[i][0].toFixed(2)}" y="${H - 2}" font-size="3.8" fill="${muted}" text-anchor="middle">${esc2(d.k)}</text>`).join(''));
    } else {
      const n = S.length || 1, bw = Math.min(14, 84 / n - 3), gap = (84 - bw * n) / Math.max(1, n - 1);
      body = S.map((d, i) => {
        const h = ((+d.v || 0) / max) * (H - PADB - TOP - 3), x = 8 + i * (bw + gap), y = H - PADB - h;
        const last = i === S.length - 1;
        return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${bw.toFixed(2)}" height="${Math.max(0.6, h).toFixed(2)}" rx="0.8" fill="${ac}" opacity="${last ? 1 : 0.42}"/>`
          + (mini ? '' : `<text x="${(x + bw / 2).toFixed(2)}" y="${H - 2}" font-size="3.8" fill="${muted}" text-anchor="middle">${esc2(d.k)}</text>`
            + `<text x="${(x + bw / 2).toFixed(2)}" y="${(y - 1.6).toFixed(2)}" font-size="4" font-weight="700" fill="${last ? ac : muted}" text-anchor="middle">${esc2(d.v)}</text>`);
      }).join('');
    }
    const axis = el.chartType === 'pie' ? '' : `<path d="M6 ${H - PADB + 0.5}H94" stroke="${grid}" stroke-width="0.6"/>`;
    const title = (el.title && !mini) ? `<text x="6" y="7" font-size="5" font-weight="700" fill="${dark ? '#F2F5F9' : '#1F2733'}">${esc2(el.title)}</text>` : '';
    return `<svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="width:100%;height:100%;display:block">${title}${axis}${body}</svg>`;
  };
  const TableHTML = (el, dark, mini) => {
    const line = dark ? 'rgba(255,255,255,.16)' : '#E1E5EC', head = dark ? '#F2F5F9' : '#1F2733', mut = dark ? '#B7C0CD' : '#525C6A';
    const fs = mini ? 'font-size:3px' : 'font-size:inherit';
    const rows = (el.rows || []).map((r, ri) => `<tr>${r.map((c, ci) => `<td style="padding:${mini ? '1px 2px' : '4px 8px'};border-top:1px solid ${line};color:${ci === 0 ? head : mut};font-weight:${ci === 0 ? 600 : 400};text-align:${ci ? 'right' : 'left'}">${esc2(c)}</td>`).join('')}</tr>`).join('');
    const cols = (el.cols || []).map((c, ci) => `<th style="padding:${mini ? '1px 2px' : '4px 8px'};color:${mut};font-weight:600;text-align:${ci ? 'right' : 'left'}">${esc2(c)}</th>`).join('');
    return `<div class="ed-tbl" style="${fs}">${el.title && !mini ? `<b style="color:${head}">${esc2(el.title)}</b>` : ''}<table style="width:100%;border-collapse:collapse"><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const HANDLES = '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>';

  /* Round 35 — 선택 시 빠른동작 알약 4개 (MK_EASY) — 새 패널 아님, 캔버스 위 부유 */
  const QuickPill = (scene) => {
    const e = ed();
    if (!window.MK_EASY || e.selEl == null || !scene.elements[e.selEl]) return '';
    const el = scene.elements[e.selEl];
    const top = Math.max(0, el.y - 7);
    return `<div class="ed-quickpill" style="left:${Math.min(el.x, 78)}%;top:${top}%">${
      MK_EASY.quickFor(el).map((q) => `<button data-easyq="${q.id}" title="${q.label}">${q.icon} ${q.label}</button>`).join('')}</div>`;
  };

  /* R113 — export 배치 창구. 캔버스·씬 스트립·타임라인·Brand Preview 가 같이 쓴다.
     씬 자신의 px 공간(scene.width·height)으로 물어야 autoresize 의 절대 하한까지
     export 와 같은 값이 된다. 구버전 render.js 면 null → 종전 경로 유지. */
  const txtLay = (el, sc) => {
    const R = window.MK_RENDER;
    if (!R || !R.layoutOf || !sc || el.kind !== 'text') return null;
    try { return R.layoutOf(el, sc.width, sc.height); } catch (e) { return null; }
  };

  /* ================= Center: Canvas (편집) — 확대/축소 ================= */
  const BASE_W = 680;
  const CanvasArea = (scene) => {
    const e = ed(), CW = Math.round(BASE_W * e.zoom), CH = Math.round(CW * scene.height / scene.width);
    const dk = MK_SEC ? MK_SEC.isDark(scene.background) : scene.background === '#1F2733';
    const rotSty = (el) => el.rot ? `;transform:rotate(${el.rot}deg)` : '';   /* R36 회전 */
    const els = scene.elements.map((el, i) => {
      const sel = e.selEl === i ? 'sel' : '';
      if (el.kind === 'chart' || el.kind === 'table') {
        const inner = el.kind === 'chart' ? ChartSVG(el, dk, false) : TableHTML(el, dk, false);
        const hd3 = e.selEl === i ? HANDLES : '';
        return `<div class="ed-el ed-data ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;font-size:${(2.6 / 100 * CH).toFixed(1)}px${rotSty(el)}">${inner}${hd3}</div>`;
      }
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        const hd = e.selEl === i ? '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>' : '';
        const dark = MK_SEC ? MK_SEC.isDark(scene.background) : scene.background === '#1F2733';
        const col = el.color || (dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#B7C0CD') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A'));
        const al = el.align ? `;text-align:${el.align}` : '';
        /* R113 — 화면이 export 가 그리는 줄을 그린다 (창구 부재 시 종전 통짜 경로) */
        const T = txtLay(el, scene);
        /* R114 — 자간도 창구가 답한 값으로. 종전엔 el.tracking 을 제 손으로 읽어
           CSS 로 그리면서 줄바꿈은 그 이름을 모르는 창구에게 물었다 — 화면이
           자기가 그은 줄 안에서 자기 글자에 넘쳤다는 뜻이다. 창구 값은 씬 px 이니
           화면 px 로 환산해서 쓴다. 창구가 없으면 옛 경로(em)로 되돌아간다. */
        const tr = T ? (T.letterSpacingEm ? `;letter-spacing:${T.letterSpacingEm}em` : '')
                     : (el.tracking ? `;letter-spacing:${el.tracking}em` : '');
        const body = T ? T.lines.map((l) => M().esc(l)).join('<br>') : M().esc(el.text);
        const lay = T ? `;font-size:${(T.size / (scene.height || 720) * CH).toFixed(2)}px;line-height:${T.lineHeight};white-space:pre` : '';
        return `<div class="ed-el ${sel}" data-el="${i}" data-editable="1" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight};line-height:1.3;color:${col}${al}${tr};white-space:pre-wrap${lay}${rotSty(el)}"><span class="ed-txt">${body}</span>${hd}</div>`;
      }
      const hd2 = e.selEl === i ? '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>' : '';
      const fillCls = el.fill && el.fill !== 'none' ? 'has-fill' : '', fillSty = el.fill && el.fill !== 'none' ? `;background:${el.fill}` : '';
      const rad = el.radius ? `;border-radius:${el.radius > 100 ? '50%' : el.radius + 'px'}` : '';
      const cut = el.cutout ? ';background:none;border:1px dashed var(--mk-border)' : '';
      if (el.src) {                                    /* R36 실이미지 — dataURL 실표시, 라벨은 걷는다 */
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
          ? `<video class="ed-imgreal" src="${el.src}" muted autoplay loop playsinline style="object-fit:${fit}${window.MK_FOCAL ? window.MK_FOCAL.pos(el) : ''}${window.MK_PHOTO ? window.MK_PHOTO.cropCss(el) : ''}"></video>`   /* R39 — 영상 프레임 실표시 */
          : `<img class="ed-imgreal" src="${el.src}" alt="${M().esc(el.label || '')}" draggable="false" style="object-fit:${fit}${window.MK_FOCAL ? window.MK_FOCAL.pos(el) : ''}${window.MK_PHOTO ? window.MK_PHOTO.mediaStyle(el) + window.MK_PHOTO.cropCss(el) : ''}">`;
        return `<div class="ed-el img-ph has-src ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${rad}${rotSty(el)}">${media}${hd2}</div>`;
      }
      return `<div class="ed-el img-ph ${fillCls} ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${fillSty}${rad}${cut}${rotSty(el)}">${M().esc(el.label)}${hd2}</div>`;
    }).join('');
    return `<div class="ed-canvaswrap">
      <div class="ed-canvas" style="width:${CW}px;height:${CH}px;background:${scene.background}${e.doc.fontFamily ? `;font-family:'${e.doc.fontFamily}',Pretendard,sans-serif` : ''}">${els}${QuickPill(scene)}</div>
      <div class="ed-zoom">
        <button data-zoom="out" aria-label="축소"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' aria-hidden='true'><path d='M5.5 12h13'/></svg></button>
        <button data-zoom="fit">${Math.round(e.zoom * 100)}%</button>
        <button data-zoom="in" aria-label="확대"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' aria-hidden='true'><path d='M12 5.5v13M5.5 12h13'/></svg></button>
      </div>
    </div>`;
  };

  /* ================= Right: Properties (속성) ================= */
  const fld = (label, control) => `<div class="fld"><label>${label}</label>${control}</div>`;
  const num = (v, attrs = '') => `<input class="mk-input" value="${v}" ${attrs}>`;
  const sel2 = (opts, cur) => `<select class="mk-input">${opts.map((o) => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('')}</select>`;

  const PropsPanel = (scene, mode) => {
    const e = ed(), s = e.selEl != null ? scene.elements[e.selEl] : null;
    let body;
    if (s && (s.kind === 'chart' || s.kind === 'table')) {
      const isCh = s.kind === 'chart';
      body = `<h3>${isCh ? '차트' : '표'} 속성</h3>
        ${fld('제목', num(M().esc(s.title || ''), 'data-ed="data-title"'))}
        ${isCh ? fld('유형', `<select class="mk-input" data-ed="chart-type">${['bar', 'line', 'pie'].map((o) => `<option value="${o}" ${o === s.chartType ? 'selected' : ''}>${o === 'bar' ? '막대' : o === 'line' ? '라인' : '원형'}</option>`).join('')}</select>`) : fld('열', num(M().esc((s.cols || []).join(' · '))))}
        ${fld('데이터', `<textarea class="mk-input" style="height:64px;padding:8px" data-ed="data-edit">${M().esc((isCh ? s.series.map((d) => `${d.k}, ${d.v}`) : s.rows.map((r) => r.join(', '))).join('\n'))}</textarea>`)}
        ${fld('', M().Button({ label: isCh ? '표로 바꾸기' : '차트로 바꾸기', kind: 'secondary', attrs: `data-ed="data-conv" style="width:100%"` }))}
        <p class="hint">제목·유형·데이터 전부 실동작 — AI 명령("막대그래프로", "표를 차트로")과 같은 엔진</p>`;
    } else if (s && s.kind === 'text') {
      body = `<h3>텍스트 속성</h3>
        ${fld('내용', `<textarea class="mk-input" style="height:60px;padding:8px" data-ed="text-edit">${M().esc(s.text)}</textarea>`)}
        <div class="fld row2"><span><label>Font</label>${sel2(['기본 (임시)'], '기본 (임시)')}</span><span><label>Size</label>${num(s.size)}</span></div>
        <div class="fld row2"><span><label>Weight</label>${sel2(['보통', '굵게'], s.weight >= 700 ? '굵게' : '보통')}</span><span><label>Color</label>${num('자동')}</span></div>
        <div class="fld row2"><span><label>Align</label>${sel2(['왼쪽', '가운데', '오른쪽'], '왼쪽')}</span><span><label>Line Height</label>${num('1.25')}</span></div>
        ${fld('Letter Spacing', num('0'))}
        <details class="ed-adv"><summary>고급</summary>
          <div class="fld row2"><span><label>투명도</label>${num('100%')}</span><span><label>회전</label>${num('0°')}</span></div>
        </details>
        <p class="hint">내용 입력만 실동작 — 나머지는 외형 검토용</p>`;
    } else if (s) {
      body = `<h3>이미지 속성</h3>
        ${fld('', M().Button({ label: '이미지 교체', kind: 'secondary', attrs: 'data-ed="img-swap" style="width:100%"' }))}
        <div class="fld row2"><span><label>Crop</label>${sel2(['원본', '정방형', '원형'], '원본')}</span><span><label>Brightness</label>${num('0')}</span></div>
        <div class="fld row2"><span><label>Contrast</label>${num('0')}</span><span><label>Saturation</label>${num('0')}</span></div>
        <div class="fld row2"><span><label>Opacity</label>${num('100%')}</span><span><label>Border Radius</label>${num('0')}</span></div>
        ${fld('Shadow', sel2(['없음', '은은하게', '뚜렷하게'], '없음'))}
        <details class="ed-adv"><summary>고급</summary>
          <div class="fld row2"><span><label>필터</label>${sel2(['없음', '흑백', '따뜻하게'], '없음')}</span><span><label>회전</label>${num('0°')}</span></div>
        </details>
        <p class="hint">교체 버튼만 실동작(더미) — 나머지는 외형 검토용</p>`;
    } else {
      body = `<h3>Scene 속성</h3>
        <div class="fld row2"><span><label>배경</label>${num(scene.background)}</span><span><label>전환</label>${sel2(['fade', 'slide', 'none'], scene.transition)}</span></div>
        ${mode === 'video' ? fld('길이 (초)', num(scene.duration, 'data-ed="dur"')) : ''}
        <p class="hint">캔버스에서 요소를 클릭하면 해당 속성이 열립니다</p>`;
    }
    return `<div class="ed-props"><small class="ed-zone-cap">속성</small>${body}</div>`;
  };


  /* 실캔버스 축소 미리보기 — Strip·Timeline 공용 */
  const MiniScene = (scene, W = 108) => {
    const H = Math.round(W * scene.height / scene.width);
    const dark = window.MK_SEC ? MK_SEC.isDark(scene.background) : scene.background === '#1F2733';
    const els = scene.elements.map((el) => {
      if (el.kind === 'chart' || el.kind === 'table') {
        return `<span style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;overflow:hidden">${el.kind === 'chart' ? ChartSVG(el, dark, true) : TableHTML(el, dark, true)}</span>`;
      }
      if (el.kind === 'text') {
        /* R113 — 썸네일도 export 에게 묻는다. R112 가 「표시 전용이니 뒀다」고
           남긴 빚이 바로 여기다: 스트립·타임라인·Brand Preview 는 교사가 장면을
           고르는 화면이라, 여기서 다 보이던 글이 파일에선 잘려 있으면 고르는
           행위 자체가 틀린 정보 위에서 일어난다. */
        const T = txtLay(el, scene);
        const raw = el.size / 100 * H;
        const fs = Math.max(3, T ? T.size / (scene.height || 720) * H : raw);
        const col = el.color || (dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#B7C0CD') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A'));
        const al = el.align ? `;text-align:${el.align}` : '';
        const body = T ? T.lines.map((l) => M().esc(l)).join('<br>') : M().esc(el.text);
        /* R114 — 미니도 자간을 창구에서 받는다. em 이라야 3px 가독 하한으로
           크기가 export 와 달라진 썸네일에서도 글자 대비 비율이 유지된다. */
        const mls = T && T.letterSpacingEm ? `;letter-spacing:${T.letterSpacingEm}em` : (el.tracking ? `;letter-spacing:${el.tracking}em` : '');
        const lay = T ? `;line-height:${T.lineHeight};white-space:pre` : '';
        return `<span style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400};color:${col}${al}${mls}${lay}">${body}</span>`;
      }
      if (el.src && (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))) return `<video src="${el.src}" muted preload="metadata" aria-hidden="true" style="position:absolute;left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;object-fit:${el.fit === 'contain' ? 'contain' : 'cover'};pointer-events:none"></video>`;   /* R39 — 영상 첫 프레임 미니 */
      if (el.src) return `<i style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;background-image:url('${el.src}');background-size:${el.fit === 'contain' ? 'contain' : 'cover'};background-position:center;background-repeat:no-repeat;opacity:1"></i>`;   /* R36 실이미지 미니 */
      return `<i style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${el.fill ? ';background:' + el.fill + ';opacity:1' : ''}"></i>`;
    }).join('');
    return `<div class="ed-mini" style="background:${scene.background}" aria-hidden="true">${els}</div>`;
  };
  window.MK_MINI = MiniScene;   /* Round 13 — Brand Preview 등 외부 화면 공용 렌더러 */
  window.MK_EDPARTS = { ChartSVG, TableHTML };   /* R37 — 플레이어 공용 부품 */
  /* ================= Bottom: Scene Strip / Timeline ================= */
  const BottomBar = (mode) => {
    const e = ed(), doc = e.doc;
    if (mode === 'video') {
      const total = doc.scenes.reduce((a, s) => a + s.duration, 0);
      const done = doc.scenes.slice(0, e.sceneIdx).reduce((a, s) => a + s.duration, 0);
      const pct = total ? Math.round(done / total * 100) : 0;
      const blocks = doc.scenes.map((s, i) =>
        `<button class="ed-tl-block ${i === e.sceneIdx ? 'on' : ''}" data-scene="${i}" style="width:${Math.max(118, s.duration * 40)}px">${MiniScene(s, 132)}<span class="tx"><b>${i + 1}. ${M().esc(s.name)}</b><span class="dur">${s.duration}초</span></span></button>` +
        (i < doc.scenes.length - 1 ? `<span class="ed-tl-tr mk-tooltip" data-tip="전환: ${M().esc(s.transition)}" aria-label="전환 ${M().esc(s.transition)}"><svg viewBox='0 0 24 24' width='11' height='11' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 8.5h13M14 5l3.5 3.5L14 12M20 15.5H7M10 12l-3.5 3.5L10 19'/></svg></span>` : '')).join('');
      return `<div class="ed-bottom">
        <div class="ed-playbar"><span data-ed="play">${M().IconButton({ icon: "<svg viewBox='0 0 24 24' width='12' height='12' fill='currentColor' aria-hidden='true'><path d='M8 5.5v13l11-6.5z'/></svg>", tip: '재생' })}</span><div class="track"><i style="width:${pct}%"></i></div><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">0:${String(done).padStart(2, '0')} / 0:${String(total).padStart(2, '0')} · 총 ${doc.scenes.length}장면</span></div>
        <div class="ed-timeline">${blocks}<button class="ed-strip-add" data-ed="add" style="height:52px">＋</button></div></div>`;
    }
    return `<div class="ed-bottom"><div class="ed-strip-head"><span class="cap">장면</span><span class="prg"><b>${e.sceneIdx + 1}</b> / ${doc.scenes.length}</span></div><div class="ed-strip">
      ${doc.scenes.map((s, i) => `<div class="ed-sc ${i === e.sceneIdx ? 'on' : ''}">
        <button class="frame" data-scene="${i}" aria-label="장면 ${i + 1} ${M().esc(s.name)}">
          <span class="num">${i + 1}</span><span class="dur">${s.duration}초</span>${MiniScene(s, 148)}</button>
        <span class="nm">${M().esc(s.name)}</span>
        <div class="ed-sceneops">
          <button data-op="dup" data-i="${i}"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='8.5' y='8.5' width='12' height='12' rx='2'/><path d='M15.5 5.5h-10a2 2 0 0 0-2 2v10'/></svg> 복제</button>
          <button data-op="del" data-i="${i}"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l1 13h9l1-13M10 10.5v5.5M14 10.5v5.5'/></svg> 삭제</button>
        </div>
      </div>`).join('')}
      <button class="ed-strip-add" data-ed="add" aria-label="장면 추가">＋</button></div></div>`;
  };

  /* ================= 화면 ================= */
  return {
    title: 'Editor', variants: ['Design', 'Video'], flush: true,
    render(v) {
      const e = ed();
      if (!e.doc) PG.loadEditorDoc('smp-pres-01');
      if (e.zoom == null) e.zoom = 1;
      e.mode = v === 'Video' ? 'video' : 'design';
      const scene = e.doc.scenes[e.sceneIdx];
      return `<div class="ed">${Toolbar(e.mode)}
        <div class="ed-mid">${MainMenu()}${DetailPanel()}${CanvasArea(scene)}${PropsPanel(scene, e.mode)}</div>
        ${BottomBar(e.mode)}
        <div class="ed-mobile-guard" role="note">
          <b>K-MAKER Editor</b>
          <p>데스크톱 또는 태블릿 가로 화면에 최적화되어 있습니다.<br>PC에서 계속 작업해 주세요.</p>
          <button class="mk-btn accent" data-ed="guard-home">홈으로 이동</button>
        </div></div>`;
    },
    mount(root) {
      const e = ed(), doc = e.doc, M2 = window.MK;
      const H = window.MK_HIST;
      /* --- History --- */
      root.querySelectorAll('[data-plugcmd]').forEach((b) => b.onclick = () => {
        try { window.MK_PLUGIN.execCommand(b.dataset.plugcmd); } catch (err) { alert('플러그인: ' + err.message); }
        PG.render();
      });
      const undoBtn = root.querySelector('[data-ed="undo"]'), redoBtn = root.querySelector('[data-ed="redo"]');
      if (undoBtn) undoBtn.onclick = () => { if (H.undo()) PG.render(); };
      if (redoBtn) redoBtn.onclick = () => { if (H.redo()) PG.render(); };
      if (!root._kbd) {
        root._kbd = true;
        root.addEventListener('keydown', (ev) => {
          if (!(ev.metaKey || ev.ctrlKey) || ev.key.toLowerCase() !== 'z') return;
          ev.preventDefault();
          if (ev.shiftKey ? H.redo() : H.undo()) PG.render();
        });
      }
      /* --- R38 오디오 패널 배선 --- */
      root.querySelectorAll('[data-au]').forEach((b) => b.onclick = () => {
        const A = window.MK_AUDIO, sc = doc.scenes[e.sceneIdx];
        if (!A) return;
        const k = b.dataset.au;
        if (k === 'pre') { const sy = A.SYNTHS.find((x) => x.id === b.dataset.id); A.play({ name: sy.name, synth: sy.id }); }
        else if (k === 'set') {
          const sy = A.SYNTHS.find((x) => x.id === b.dataset.id);
          H.push('배경음 넣기'); sc.music = { name: sy.name, synth: sy.id }; A.stop(); PG.render();
        } else if (k === 'clear') { H.push('배경음 빼기'); delete sc.music; A.stop(); PG.render(); }
        else if (k === 'stop') A.stop();
        else if (k === 'file') {
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = 'audio/*';
          inp.onchange = () => A.fileToSrc(inp.files && inp.files[0], (src, err2) => {
            if (err2) return alert(err2);
            if (!src) return;
            H.push('배경음 넣기');
            sc.music = { name: inp.files[0].name.replace(/\.[^.]+$/, ''), src };
            PG.render();
          });
          inp.click();
        }
      });
      /* --- AI Dock --- */
      const say = (role, text, err) => { e.aiLog = (e.aiLog || []).concat([{ role, text, err: !!err }]).slice(-14); };
      const runAI = (cmd) => {
        const c = String(cmd || '').trim(); if (!c) return;
        say('me', c);
        const res = window.MK_AIED.run(c);
        /* Round 35 — 못 알아들으면 자연어 타임라인(MK_EASY)이 이어받는다: 같은 입력창, 패널 추가 0 */
        if (!res.ok && res.unknown && window.MK_EASY) {
          H.push('자연어 모션');
          const t = MK_EASY.timeline(c, doc, e.sceneIdx);
          if (t.ok) { say('ai', t.msg); PG.render(); const lg0 = document.getElementById('aidLog'); if (lg0) lg0.scrollTop = lg0.scrollHeight; return; }
          window.MK_HIST.undo();
        }
        /* R38 — 실 AI: 규칙 파서·타임라인이 못 알아들은 명령은 (키가 연결돼 있으면) 진짜 Claude가 이어받는다 */
        if (!res.ok && res.unknown && window.MK_AILIVE && MK_AILIVE.hasKey()) {
          say('ai', 'Claude 생각 중…');
          PG.render();
          const cp = MK_AILIVE.contextPrompt(doc, e.sceneIdx, e.selEl);
          MK_AILIVE.ask(`${cp.context}\n\n요청: ${c}`, { system: cp.system }).then((r2) => {
            e.aiLog = (e.aiLog || []).filter((m) => m.text !== 'Claude 생각 중…');
            if (r2.ok && cp.selText != null && /바꿔|다듬|고쳐|써\s*줘|줄여|늘려|번역/.test(c) && r2.text.length <= 400) {
              H.push('AI 글다듬기');                    /* 실교체 — Undo 가능 */
              doc.scenes[e.sceneIdx].elements[e.selEl].text = r2.text;
              say('ai', '고쳤어요 — "' + r2.text.split('\n')[0].slice(0, 40) + '"');
            } else say('ai', r2.ok ? r2.text : r2.msg, !r2.ok);
            PG.render();
            const lg2 = document.getElementById('aidLog'); if (lg2) lg2.scrollTop = lg2.scrollHeight;
          });
          return;
        }
        say('ai', res.msg, !res.ok);
        PG.render();
        const lg = document.getElementById('aidLog'); if (lg) lg.scrollTop = lg.scrollHeight;
      };
      root.querySelectorAll('[data-cmd]').forEach((b) => b.onclick = () => runAI(b.dataset.cmd));
      const aiIn = root.querySelector('[data-ed="ai-in"]'), aiRun = root.querySelector('[data-ed="ai-run"]');
      if (aiRun) aiRun.onclick = () => runAI(aiIn && aiIn.value);
      if (aiIn) { aiIn.onkeydown = (ev) => { if (ev.key === 'Enter') runAI(aiIn.value); }; }
      /* R38 — 실 AI 키 연결/해제 (키는 이 기기 브라우저에만 저장) */
      const aiKey = root.querySelector('[data-ed="ai-key"]');
      if (aiKey) aiKey.onclick = () => {
        const has = window.MK_AILIVE && MK_AILIVE.hasKey();
        M2.Modal.open(`<h2>실 AI 연결</h2>
          <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">Anthropic API 키를 넣으면 AI 편집 입력창이 진짜 Claude로 이어져요.<br>키는 <b>이 기기 브라우저에만</b> 저장되고 어디로도 전송되지 않아요 (호출은 브라우저 → Anthropic 직행).</p>
          <div style="display:flex;gap:8px;margin:12px 0"><input class="mk-input" id="aiKeyIn" type="password" placeholder="sk-ant-…" value=""></div>
          <div style="display:flex;justify-content:space-between">
            ${has ? M2.Button({ label: '연결 해제', kind: 'secondary', attrs: 'data-aik="clear"' }) : '<span></span>'}
            <span>${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })} ${M2.Button({ label: '저장', kind: 'accent', attrs: 'data-aik="save"' })}</span>
          </div>`);
        setTimeout(() => {
          const sv = document.querySelector('[data-aik="save"]');
          if (sv) sv.onclick = () => { const v = document.getElementById('aiKeyIn').value; if (MK_AILIVE.setKey(v)) { M2.Modal.close(); PG.render(); } };
          const clx = document.querySelector('[data-aik="clear"]');
          if (clx) clx.onclick = () => { MK_AILIVE.clearKey(); M2.Modal.close(); PG.render(); };
        }, 0);
      };
      /* --- Chart/Table 속성 실동작 --- */
      const ct = root.querySelector('[data-ed="chart-type"]');
      if (ct) ct.onchange = () => { H.push('차트 유형 변경'); doc.scenes[e.sceneIdx].elements[e.selEl].chartType = ct.value; PG.render(); };
      const dt = root.querySelector('[data-ed="data-title"]');
      if (dt) dt.onchange = () => { H.push('데이터 제목'); doc.scenes[e.sceneIdx].elements[e.selEl].title = dt.value; PG.render(); };
      const de = root.querySelector('[data-ed="data-edit"]');
      if (de) de.onchange = () => {
        H.push('데이터 수정');
        const el = doc.scenes[e.sceneIdx].elements[e.selEl];
        const rows = de.value.split('\n').map((l) => l.split(',').map((x) => x.trim())).filter((r) => r[0]);
        if (el.kind === 'chart') el.series = rows.map((r) => ({ k: r[0], v: parseFloat(r[1]) || 0 }));
        else el.rows = rows;
        PG.render();
      };
      const dc = root.querySelector('[data-ed="data-conv"]');
      if (dc) dc.onclick = () => {
        const el = doc.scenes[e.sceneIdx].elements[e.selEl];
        runAI(el.kind === 'chart' ? '차트를 표로' : '표를 차트로');
      };
      root.querySelector('[data-ed="back"]').onclick = () => PG.go(PG.state.create && PG.state.create.tpl ? 'create' : 'templates');
      const gh = root.querySelector('[data-ed="guard-home"]'); if (gh) gh.onclick = () => PG.go('home');
      root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { PG.state.variants[PG.state.screen] = b.dataset.tab; PG.render(); });
      root.querySelectorAll('[data-menu]').forEach((b) => b.onclick = () => { e.menu = b.dataset.menu; PG.render(); });
      /* ---- R41: 좌측 패널 실동작 ---- */
      const paneAddEl = (label, el) => { H.push(label); const s = doc.scenes[e.sceneIdx]; s.elements.push(el); e.selEl = s.elements.length - 1; PG.render(); };
      const paneStack = () => 18 + (doc.scenes[e.sceneIdx].elements.length * 7) % 55; /* 겹침 방지 계단 배치 */
      const paneFile = (accept, kindHint) => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = accept;
        inp.onchange = () => window.MK_LIVE.fileToSrc(inp.files && inp.files[0], (src, err) => {
          if (err) return alert(err);
          if (!src) return;
          const f = inp.files[0];
          const kind = /^video\//.test(f.type) ? 'video' : 'image';
          H.push((kind === 'video' ? '영상' : '사진') + ' 넣기');
          const r = window.MK_LIVE.insertWithSrc(doc, e.sceneIdx, { name: f.name.replace(/\.[^.]+$/, ''), kind, src });
          if (r && r.ok) e.selEl = doc.scenes[e.sceneIdx].elements.length - 1;
          PG.render();
          /* R126 — 클립 삽입 = 씬 길이 동행(늘리기만) */
          if (r && r.ok && kind === 'video') window.MK_LIVE.fitSceneToClipSrc(doc, e.sceneIdx, src, (fr) => { if (fr && fr.changed) PG.render(); });
        });
        inp.click();
      };
      /* ---- R44: 재료 검색 (내장 생성) ---- */
      const bindStock = (scope) => scope.querySelectorAll('[data-stock]').forEach((b) => b.onclick = () => {
        const it = window.MK_STOCK.get(b.dataset.stock); if (!it) return;
        const src = window.MK_STOCK.srcOf(it.id);
        if (b.dataset.stocktag === 'B') {                        /* 배경으로 — 맨 뒤 층 */
          H.push('이미지 배경 — ' + it.name);
          doc.scenes[e.sceneIdx].elements.unshift({ kind: 'image', x: 0, y: 0, w: 100, h: 100, label: it.name, src });
          e.selEl = 0;
        } else {                                                 /* 요소로 삽입 */
          H.push('재료 넣기 — ' + it.name);
          const r = window.MK_LIVE.insertWithSrc(doc, e.sceneIdx, { name: it.name, kind: 'image', src });
          if (r && r.ok) e.selEl = doc.scenes[e.sceneIdx].elements.length - 1;
        }
        PG.render();
      });
      bindStock(root);
      /* ---- 캐릭터 서랍 실배선 — 원본 비율 유지해서 삽입 ---- */
      const bindChars = (scope) => scope.querySelectorAll('[data-char]').forEach((b) => b.onclick = () => {
        const it = window.MK_CHARS.get(b.dataset.char); if (!it) return;
        const src = window.MK_CHARS.srcOf(it.id);
        const sc = doc.scenes[e.sceneIdx];
        const sw = +sc.width || 1280, sh = +sc.height || 720;
        const w = it.h > it.w ? 22 : 30;                          /* 세로 긴 캐릭터는 좁게 */
        const h = Math.min(92, w * (it.h / it.w) * (sw / sh));
        H.push('캐릭터 넣기 — ' + it.name);
        sc.elements.push({ kind: 'image', x: 34, y: Math.max(2, 50 - h / 2), w, h, fit: 'contain', label: it.name, src });
        e.selEl = sc.elements.length - 1;
        PG.render();
      });
      bindChars(root);
      const redrawChars = () => {
        const grid = root.querySelector('[data-chargrid]');
        if (grid) { grid.innerHTML = charGridHTML(); bindChars(grid); }
      };
      const cq = root.querySelector('[data-charq]');
      if (cq) cq.oninput = () => { e.charQ = cq.value; redrawChars(); };
      root.querySelectorAll('[data-charcat]').forEach((b) => b.onclick = () => { e.charCat = b.dataset.charcat; PG.render(); });
      root.querySelectorAll('[data-stockq]').forEach((inp) => inp.oninput = () => {
        e.stockQ = inp.value;                                    /* 그리드만 부분 갱신 — 입력 포커스 유지 */
        const grid = root.querySelector(`[data-stockgrid="${inp.dataset.stockq}"]`);
        if (grid) { grid.innerHTML = stockGridHTML(inp.dataset.stockq); bindStock(grid); }
      });
      root.querySelectorAll('[data-pane]').forEach((b) => {
        const act = b.dataset.pane;
        if (act === 'bg-color') { b.onchange = () => { H.push('배경색 변경'); doc.scenes[e.sceneIdx].background = b.value; PG.render(); }; return; }
        b.onclick = () => {
          if (act === 'go-templates') return PG.go('templates');
          if (act === 'go-ai') { e.menu = 'ai'; return PG.render(); }
          if (act === 'add-title') return paneAddEl('제목 추가', { kind: 'text', x: 10, y: paneStack(), w: 80, size: 8, text: '제목을 입력하세요', weight: 800 });
          if (act === 'add-sub') return paneAddEl('부제목 추가', { kind: 'text', x: 10, y: paneStack(), w: 80, size: 5, text: '부제목을 입력하세요', weight: 600 });
          if (act === 'add-body') return paneAddEl('본문 추가', { kind: 'text', x: 10, y: paneStack(), w: 80, size: 3.6, text: '내용을 입력하세요', weight: 400 });
          if (act === 'add-box') return paneAddEl('도형 넣기', { kind: 'image', x: 32, y: paneStack(), w: 30, h: 20, label: '', fill: '#2E8C7F' });
          if (act === 'add-table') return paneAddEl('표 넣기', { kind: 'table', x: 10, y: 24, w: 80, h: 46, title: '표', cols: ['구분', '값'], rows: [['항목 1', '10'], ['항목 2', '20'], ['항목 3', '30']] });
          if (act === 'add-chart') return paneAddEl('차트 넣기', { kind: 'chart', x: 10, y: 24, w: 80, h: 54, chartType: 'bar', title: '차트', accent: '#2E8C7F', series: [{ k: 'A', v: 3 }, { k: 'B', v: 5 }, { k: 'C', v: 4 }] });
          if (act === 'bg-set') { H.push('배경색 변경'); doc.scenes[e.sceneIdx].background = b.dataset.c; return PG.render(); }
          if (act === 'ins-image') return paneFile('image/*');
          /* R134 — 인물 바꾸기: 선택한 사진 요소를 MK_SEG 작업창으로.
             결과는 새 dataURL 하나 — 스키마 신설 0, el.src 교체가 전부라
             render·play·export 전 경로가 그대로 옳다. */
          if (act === 'person-swap') {
            if (!window.MK_SEG) return;
            const sc = doc.scenes[e.sceneIdx];
            const sel = e.selEl != null ? sc.elements[e.selEl] : null;
            if (!sel || sel.kind !== 'image' || !sel.src || sel.video) {
              return alert('사진 요소를 먼저 선택해 주세요 (영상·도형은 안 돼요)');
            }
            const target = sel;
            const others = [];
            doc.scenes.forEach((s2) => (s2.elements || []).forEach((el2) => {
              if (el2 && el2.kind === 'image' && el2.src && !el2.video && el2 !== target) {
                others.push({ src: el2.src, label: el2.label || '문서 사진' });
              }
            }));
            return window.MK_SEG.open({
              src: target.src, docImages: others,
              onApply: (url, label) => {
                H.push(label || '인물 바꾸기');
                target.src = url; delete target.fill;
                PG.render();
              },
              onCutout: (png, dim) => {
                H.push('인물 오리기');
                const sw = +sc.width || 1280, sh = +sc.height || 720;
                const w = 32;                                       /* 씬 % 좌표 */
                const h = Math.min(92, w * (dim.h / dim.w) * (sw / sh));
                sc.elements.push({ kind: 'image', x: 34, y: Math.max(2, 50 - h / 2), w, h, fit: 'contain', label: '오려낸 인물', src: png });
                e.selEl = sc.elements.length - 1;
                PG.render();
              },
            });
          }
          /* R135 — 캐릭터 필터: 같은 원칙(스키마 0, el.src 교체가 전부) */
          if (act === 'toon') {
            if (!window.MK_TOON) return;
            const sc2 = doc.scenes[e.sceneIdx];
            const sel2 = e.selEl != null ? sc2.elements[e.selEl] : null;
            if (!sel2 || sel2.kind !== 'image' || !sel2.src || sel2.video) {
              return alert('사진 요소를 먼저 선택해 주세요 (영상·도형은 안 돼요)');
            }
            const t2 = sel2;
            return window.MK_TOON.open({
              src: t2.src,
              onApply: (url, label) => {
                H.push(label || '캐릭터 필터');
                t2.src = url; delete t2.fill;
                PG.render();
              },
            });
          }
          /* R136 — 크로마키: 같은 원칙(스키마 0, el.src 교체가 전부).
             결과는 알파 PNG — 배경이 투명해진 인물이 어떤 장면 배경
             위에도 그대로 얹힌다. */
          if (act === 'chroma') {
            if (!window.MK_CHROMA) return;
            const sc3 = doc.scenes[e.sceneIdx];
            const sel3 = e.selEl != null ? sc3.elements[e.selEl] : null;
            if (!sel3 || sel3.kind !== 'image' || !sel3.src || sel3.video) {
              return alert('사진 요소를 먼저 선택해 주세요 (영상·도형은 안 돼요)');
            }
            const t3 = sel3;
            return window.MK_CHROMA.open({
              src: t3.src,
              onApply: (url, label) => {
                H.push(label || '크로마키');
                t3.src = url; delete t3.fill;
                PG.render();
              },
            });
          }
          if (act === 'ins-video') return paneFile('video/*');
          if (act === 'ins-any') return paneFile('image/*,video/*');
        };
      });
      root.querySelectorAll('[data-scene]').forEach((b) => b.onclick = () => { e.sceneIdx = +b.dataset.scene; e.selEl = null; PG.render(); });
      root.querySelectorAll('[data-el]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); e.selEl = +b.dataset.el; PG.render(); });
      root.querySelector('.ed-canvas').onclick = (ev) => { if (ev.target.classList.contains('ed-canvas')) { e.selEl = null; PG.render(); } };
      /* 줌 */
      root.querySelectorAll('[data-zoom]').forEach((b) => b.onclick = () => {
        if (b.dataset.zoom === 'in') e.zoom = Math.min(1.6, +(e.zoom + 0.1).toFixed(2));
        else if (b.dataset.zoom === 'out') e.zoom = Math.max(0.4, +(e.zoom - 0.1).toFixed(2));
        else e.zoom = 1;
        PG.render();
      });
      /* Toolbar 동작 */
      root.querySelector('[data-ed="save"]').onclick = () => {
        const cur = window.MK_PROJ && window.MK_PROJ.current(); if (cur) window.MK_PROJ.rename(cur.projectId, cur.name); /* rename=touch 겸용 — 수정일 갱신 */
        let real = false;
        if (window.MK_LIVE && !e.review) { real = MK_LIVE.saveDoc(doc); MK_LIVE.saveProjects(); }   /* R36 — 실저장 */
        e.savedAt = '방금'; document.getElementById('edSave').textContent = e.review ? '리뷰 모드 · 저장되지 않음' : (real ? '저장됨 · 방금' : '저장됨 · 방금(세션)');
      };
      /* R37 — 미리보기 = 실슬라이드쇼 (장면 순차·애니 실재생) */
      root.querySelector('[data-ed="preview"]').onclick = () => window.MK_PLAY.open(doc, { startIdx: 0 });
      const playBtn = root.querySelector('[data-ed="play"]');
      if (playBtn) playBtn.onclick = () => window.MK_PLAY.open(doc, { startIdx: e.sceneIdx });
      root.querySelector('[data-ed="share"]').onclick = () => M2.Modal.open(`<h2>공유</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">보기 전용 링크 (Placeholder)</p>
        <div style="display:flex;gap:8px;margin:12px 0"><input class="mk-input" value="kmaker.app/v/abc123" readonly>${M2.Button({ label: '복사', kind: 'secondary' })}</div>
        <div style="text-align:right">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      /* R37 — 내보내기 실동작: MK_RENDER 파이프라인 → PNG·SVG 실파일 다운로드 */
      const dl = (name, href) => { const a = document.createElement('a'); a.download = name; a.href = href; document.body.appendChild(a); a.click(); a.remove(); };
      const exName = (i, ext) => `${(doc.title || '케이메이커').replace(/[^\w가-힣 _-]/g, '')}-${i + 1}.${ext}`;
      const exMsg = (t) => { const m2 = document.getElementById('exMsg'); if (m2) m2.textContent = t; };
      const exportPng = async (si, scale) => {
        const dlist = window.MK_RENDER.renderScene(doc.scenes[si], {});
        const out = await window.MK_RENDER.toRaster(dlist, { format: 'png', scale });
        if (out && out.dataUrl) { dl(exName(si, 'png'), out.dataUrl); return true; }
        return false;
      };
      root.querySelector('[data-ed="export"]').onclick = () => M2.Modal.open(`<h2>내보내기</h2>
        <div class="ph-list" style="margin:12px 0">
          <button class="ph-item" data-ex="png1">PNG — 현재 장면</button>
          <button class="ph-item" data-ex="png2">PNG 2x — 현재 장면 (고해상도)</button>
          <button class="ph-item" data-ex="pngall">PNG — 전체 ${doc.scenes.length}장면</button>
          <button class="ph-item" data-ex="svg">SVG — 현재 장면 (벡터)</button>
          <button class="ph-item" data-ex="pptx">PPTX — 전체 장면 (파워포인트)</button>
          <button class="ph-item" data-ex="pdf">PDF — 전체 장면 (인쇄·문서, 한글 그대로)</button>
          <button class="ph-item" data-ex="mp4">MP4 영상 — 전체 장면 (애니 포함)</button>
        </div>
        <p id="exMsg" style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">MP4는 크롬·엣지에서 돼요. PDF는 인쇄용 고해상(장면 그대로)이에요.</p>
        <div style="text-align:right;margin-top:10px">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`,
      ) || setTimeout(() => {
        document.querySelectorAll('[data-ex]').forEach((b) => b.onclick = async () => {
          try {
            exMsg('만드는 중…');
            if (b.dataset.ex === 'pptx') {                       /* R38 — PPTX 실출력 (이미지 실임베드) */
              const pages = doc.scenes.map((sc2) => window.MK_RENDER.renderScene(sc2, {}));
              const r = window.MK_RENDER.toPPTX(pages, {});
              const blob = new Blob([r.bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
              const u = URL.createObjectURL(blob);
              dl(`${(doc.title || '케이메이커').replace(/[^\w가-힣 _-]/g, '')}.pptx`, u);
              setTimeout(() => URL.revokeObjectURL(u), 4000);
              exMsg(`PPTX 저장 완료 — 슬라이드 ${r.slides}장${r.media ? ' · 사진 ' + r.media + '장 포함' : ''}`);
            } else if (b.dataset.ex === 'pdf') {                  /* R40 — PDF 실출력 (래스터 — 한글 그대로) */
              const imgs = [];
              for (let i = 0; i < doc.scenes.length; i++) {
                exMsg(`장면 그리는 중… ${i + 1}/${doc.scenes.length}`);
                const dlist = window.MK_RENDER.renderScene(doc.scenes[i], {});
                const out = await window.MK_RENDER.toRaster(dlist, { format: 'jpg', scale: 2, quality: 0.92 });
                if (!out || !out.dataUrl) throw new Error('장면 래스터 실패 — 크롬·엣지에서 시도해 주세요');
                const jb = window.MK_RENDER.dataUrlBytes(out.dataUrl);
                if (!jb) throw new Error('JPEG 변환 실패');
                imgs.push({ bin: jb.bin, w: out.plan.width, h: out.plan.height });
              }
              const r = window.MK_RENDER.toPDFRaster(imgs, {});
              if (!r.pages) throw new Error('PDF 페이지 생성 실패');
              const u8 = new Uint8Array(r.bytes.length);
              for (let i = 0; i < r.bytes.length; i++) u8[i] = r.bytes.charCodeAt(i) & 255;
              const blob = new Blob([u8], { type: 'application/pdf' });
              const u = URL.createObjectURL(blob);
              dl(`${(doc.title || '케이메이커').replace(/[^\w가-힣 _-]/g, '')}.pdf`, u);
              setTimeout(() => URL.revokeObjectURL(u), 4000);
              exMsg(`PDF 저장 완료 — ${r.pages}쪽 (인쇄용 고해상)`);
            } else if (b.dataset.ex === 'mp4') {                  /* R38 — MP4 실출력 (WebCodecs) */
              const r = await window.MK_VIDEO.exportMP4(doc, { onProgress: exMsg });
              exMsg(r.ok ? `MP4 저장 완료 — ${r.sec}초 · ${r.w}×${r.h}${r.audio ? ' · 🎵 소리 포함' : (r.audioMsg ? ' · ' + r.audioMsg : '')}` : r.msg);
            } else if (b.dataset.ex === 'svg') {
              const svg = window.MK_RENDER.toSVG(window.MK_RENDER.renderScene(doc.scenes[e.sceneIdx], {}));
              dl(exName(e.sceneIdx, 'svg'), 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
              exMsg('SVG 저장 완료');
            } else if (b.dataset.ex === 'pngall') {
              for (let i = 0; i < doc.scenes.length; i++) { await exportPng(i, 2); exMsg(`저장 중… ${i + 1}/${doc.scenes.length}`); }
              exMsg(`전체 ${doc.scenes.length}장면 저장 완료`);
            } else {
              await exportPng(e.sceneIdx, b.dataset.ex === 'png2' ? 2 : 1);
              exMsg('PNG 저장 완료');
            }
          } catch (err) { exMsg('실패: ' + err.message); }
        });
      }, 0);
      /* Scene 조작 */
      root.querySelectorAll('[data-op]').forEach((b) => b.onclick = (ev) => {
        ev.stopPropagation();
        const i = +b.dataset.i, sc = doc.scenes;
        H.push(b.dataset.op === 'dup' ? '장면 복제' : '장면 삭제');
        if (b.dataset.op === 'dup') { const c = JSON.parse(JSON.stringify(sc[i])); c.name += ' 복제'; sc.splice(i + 1, 0, c); e.sceneIdx = i + 1; }
        else if (sc.length > 1) { sc.splice(i, 1); e.sceneIdx = Math.min(e.sceneIdx, sc.length - 1); }
        e.selEl = null; PG.render();
      });
      const add = root.querySelector('[data-ed="add"]');
      if (add) add.onclick = () => {
        H.push('장면 추가');
        const base = doc.scenes[doc.scenes.length - 1];
        doc.scenes.push({ ...JSON.parse(JSON.stringify(base)), name: '새 장면', elements: [{ kind: 'text', x: 10, y: 40, w: 80, size: 6, text: '내용을 입력하세요', weight: 700 }] });
        e.sceneIdx = doc.scenes.length - 1; e.selEl = null; PG.render();
      };
      /* 더미 편집 */
      const te = root.querySelector('[data-ed="text-edit"]');
      if (te) { te.onfocus = () => H.push('텍스트 편집'); te.oninput = () => {
        doc.scenes[e.sceneIdx].elements[e.selEl].text = te.value;
        const cv = root.querySelector(`.ed-el[data-el="${e.selEl}"] .ed-txt`) || root.querySelector(`.ed-el[data-el="${e.selEl}"]`);
        if (cv) cv.textContent = te.value;
      }; }
      const sw = root.querySelector('[data-ed="img-swap"]');
      if (sw) sw.onclick = () => {
        if (window.MK_LIVE) {                            /* R36 — 진짜 파일 선택 → 실이미지 교체 */
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = 'image/*,video/*';
          inp.onchange = () => MK_LIVE.fileToSrc(inp.files && inp.files[0], (src, err) => {
            if (err) return alert(err);
            if (!src) return;
            const f = inp.files[0];
            H.push('이미지 교체');
            const kind2 = /^video\//.test(f.type) ? 'video' : 'image';
            MK_LIVE.replaceWithSrc(doc, e.sceneIdx, e.selEl, { name: f.name.replace(/\.[^.]+$/, ''), kind: kind2, src });
            PG.render();
            /* R126 — 자리에 앉힌 게 클립이면 씬 길이 동행(늘리기만) */
            if (kind2 === 'video') MK_LIVE.fitSceneToClipSrc(doc, e.sceneIdx, src, (fr) => { if (fr && fr.changed) PG.render(); });
          });
          inp.click();
          return;
        }
        window.MK_AIED.run('이미지 교체'); PG.render();
      };
      const dur = root.querySelector('[data-ed="dur"]');
      if (dur) dur.onchange = () => { doc.scenes[e.sceneIdx].duration = Math.max(1, Math.min(30, +dur.value || 1)); PG.render(); };

      /* ================= Round 35 — MK_EASY 라이브 배선 (전부 가드·추가만) ================= */
      if (window.MK_EASY) {
        /* F2 — 빠른동작 알약 */
        /* 빠른동작 결과 알림 — 종전엔 r.msg 를 버려서, 바뀐 게 없는 동작(사진에
           스타일·개선)이 「눌러도 아무 반응 없음」으로 보였다. 삭제만 눈에 띈 까닭. */
        const quickToast = (msg) => {
          const wrap = root.querySelector('.ed-canvaswrap') || root;
          const old2 = wrap.querySelector('[data-easytoast]'); if (old2) old2.remove();
          const t = document.createElement('div');
          t.setAttribute('data-easytoast', '1');
          t.textContent = msg;
          t.style.cssText = 'position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:40;'
            + 'background:rgba(31,39,51,.92);color:#fff;font-size:13px;font-weight:600;padding:7px 14px;'
            + 'border-radius:999px;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.18)';
          if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
          wrap.appendChild(t);
          setTimeout(() => t.remove(), 2200);
        };
        /* 자리 그대로 새 파일 앉히기 — 실사진 교체 경로(img-swap 과 같은 처방) */
        const quickPickFile = () => {
          if (!window.MK_LIVE) return;
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = 'image/*,video/*';
          inp.onchange = () => MK_LIVE.fileToSrc(inp.files && inp.files[0], (src, err) => {
            if (err) return alert(err);
            if (!src) return;
            const f = inp.files[0];
            H.push('이미지 교체');
            const k2 = /^video\//.test(f.type) ? 'video' : 'image';
            MK_LIVE.replaceWithSrc(doc, e.sceneIdx, e.selEl, { name: f.name.replace(/\.[^.]+$/, ''), kind: k2, src });
            PG.render();
            if (k2 === 'video') MK_LIVE.fitSceneToClipSrc(doc, e.sceneIdx, src, (fr) => { if (fr && fr.changed) PG.render(); });
          });
          inp.click();
        };
        root.querySelectorAll('[data-easyq]').forEach((b) => b.onclick = (ev) => {
          ev.stopPropagation();
          H.push('빠른동작 — ' + b.dataset.easyq);
          const r = MK_EASY.quickRun(doc, e.sceneIdx, e.selEl, b.dataset.easyq);
          if (r.deselect) e.selEl = null;
          if (r.pickFile) return quickPickFile();
          PG.render();
          if (r.msg) quickToast(r.msg);
          if (r.edit) { const te2 = document.querySelector('[data-ed="text-edit"]'); if (te2) te2.focus(); }
        });
        /* F5 — 호버 칩 */
        const cv = root.querySelector('.ed-canvas');
        let chip = null;
        const hideChip = () => { if (chip) { chip.remove(); chip = null; } };
        root.querySelectorAll('.ed-el').forEach((elDom) => {
          elDom.addEventListener('mouseenter', () => {
            const i = +elDom.dataset.el;
            if (i === e.selEl) return;
            hideChip();
            const el = doc.scenes[e.sceneIdx].elements[i]; if (!el) return;
            chip = document.createElement('div');
            chip.className = 'ed-hoverchip';
            chip.innerHTML = MK_EASY.hoverFor(el).map((h2) => `<button data-easyh="${h2.id}" data-i="${i}">${h2.icon} ${h2.label}</button>`).join('');
            chip.style.left = el.x + '%'; chip.style.top = Math.max(0, el.y - 6) + '%';
            cv.appendChild(chip);
            chip.querySelectorAll('[data-easyh]').forEach((b) => b.onclick = (ev) => {
              ev.stopPropagation();
              const idx = +b.dataset.i;
              H.push('호버 — ' + b.dataset.easyh);
              if (b.dataset.easyh === 'edit') { e.selEl = idx; PG.render(); const te2 = document.querySelector('[data-ed="text-edit"]'); if (te2) te2.focus(); return; }
              MK_EASY.quickRun(doc, e.sceneIdx, idx, b.dataset.easyh === 'replace' ? 'replace' : 'delete');
              if (b.dataset.easyh === 'delete' && e.selEl === idx) e.selEl = null;
              PG.render();
            });
          });
          elDom.addEventListener('mouseleave', (ev) => {
            if (chip && ev.relatedTarget && chip.contains(ev.relatedTarget)) return;
            setTimeout(hideChip, 150);
          });
        });
        /* F1 — 캔버스 드롭 스마트 교체 (파일·자산 드래그 공용) */
        if (cv) {
          cv.addEventListener('dragover', (ev) => { ev.preventDefault(); cv.classList.add('ed-dropping'); });
          cv.addEventListener('dragleave', () => cv.classList.remove('ed-dropping'));
          cv.addEventListener('drop', (ev) => {
            ev.preventDefault(); cv.classList.remove('ed-dropping');
            const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
            const hit = ev.target.closest && ev.target.closest('[data-el]');
            const hitIdx = hit ? +hit.dataset.el : null;
            const apply = (media) => {
              H.push('드롭 교체');
              const rep = (window.MK_LIVE && media.src) ? MK_LIVE.replaceWithSrc : MK_EASY.replace;
              const ins = (window.MK_LIVE && media.src) ? MK_LIVE.insertWithSrc : MK_EASY.insertMedia;
              const r = hitIdx != null ? rep(doc, e.sceneIdx, hitIdx, media) : ins(doc, e.sceneIdx, media);
              if (!r.ok && hitIdx != null) ins(doc, e.sceneIdx, media);   /* 텍스트 위 드롭 → 옆에 삽입 */
              PG.render();
              /* R126 — 드롭한 게 클립이면 씬 길이 동행(늘리기만) */
              if (media.kind === 'video' && media.src && window.MK_LIVE) window.MK_LIVE.fitSceneToClipSrc(doc, e.sceneIdx, media.src, (fr) => { if (fr && fr.changed) PG.render(); });
            };
            if (f && window.MK_LIVE) {                    /* R36 — 실파일: dataURL로 읽어 실표시 */
              MK_LIVE.fileToSrc(f, (src, err) => {
                apply({ name: f.name.replace(/\.[^.]+$/, ''), kind: /^video\//.test(f.type) ? 'video' : 'image', src: src || undefined });
                if (err) alert(err);
              });
              return;
            }
            apply(f ? { name: f.name.replace(/\.[^.]+$/, ''), kind: /^video\//.test(f.type) ? 'video' : 'image' }
                    : { name: '드롭한 미디어', kind: 'image' });
          });
        }
      }

      /* ================= R36 이식 라운드 — 실편집·영속 (MK_LIVE, 전부 가드·추가만) ================= */
      if (window.MK_LIVE) {
        const L = window.MK_LIVE;
        const cv2 = root.querySelector('.ed-canvas');
        const scene2 = () => doc.scenes[e.sceneIdx];
        const nowStr = () => { const d2 = new Date(); return String(d2.getHours()).padStart(2, '0') + ':' + String(d2.getMinutes()).padStart(2, '0'); };
        const markSaved = (t) => { const n = document.getElementById('edSave'); if (n) n.textContent = t; };
        if (!doc.id) doc.id = doc.templateId || doc.projectId || 'local-doc';   /* 영속 키 보장 */

        /* --- 자동저장 훅: 모든 편집 경로(H.push·undo·redo)가 지나가는 길목 1곳 --- */
        if (!H._liveHook) {
          H._liveHook = true;
          ['push', 'undo', 'redo'].forEach((k) => {
            const orig = H[k].bind(H);
            H[k] = (...a) => {
              const r = orig(...a);
              const ee = PG.state.editor;
              if (ee && ee.doc && !ee.review) {
                markSaved('저장 중…');
                L.autosave(ee.doc, { review: false, onSaved: () => { ee.savedAt = nowStr(); markSaved('저장됨 · ' + ee.savedAt); } });
              }
              return r;
            };
          });
        }

        /* --- 복원: 같은 doc을 다시 열면 저장본에서 이어서 (리뷰·프로젝트 열람 제외, doc당 1회) --- */
        if (!e.review && doc.id && e._restoredFor !== doc.id && !(window.MK_PROJ && MK_PROJ.current())) {
          e._restoredFor = doc.id;
          const sv = L.loadDoc(doc.id);
          if (sv && sv.doc && sv.doc.scenes && JSON.stringify(sv.doc) !== JSON.stringify(doc)) {
            e.doc = sv.doc;
            e.sceneIdx = Math.min(e.sceneIdx, sv.doc.scenes.length - 1);
            e.selEl = null;
            e.savedAt = nowStr();
            PG.render();
            return;
          }
        }

        if (cv2 && !cv2._live) {
          cv2._live = true;

          /* --- 스냅 가이드 라인 --- */
          const gV = document.createElement('i'); gV.className = 'ed-guide gv';
          const gH = document.createElement('i'); gH.className = 'ed-guide gh';
          const showG = (g) => {
            if (g.v != null) { gV.style.left = g.v + '%'; if (!gV.parentNode) cv2.appendChild(gV); } else if (gV.parentNode) gV.remove();
            if (g.h != null) { gH.style.top = g.h + '%'; if (!gH.parentNode) cv2.appendChild(gH); } else if (gH.parentNode) gH.remove();
          };
          const hideG = () => { if (gV.parentNode) gV.remove(); if (gH.parentNode) gH.remove(); };

          const GEO = ['x', 'y', 'w', 'h', 'size', 'rot'];
          const pickGeo = (el) => { const o = {}; GEO.forEach((k) => { if (el[k] != null) o[k] = el[k]; }); return o; };
          const putGeo = (el, g) => { GEO.forEach((k) => { if (g[k] != null) el[k] = g[k]; else delete el[k]; }); };
          const paint = (n, el) => {
            n.style.left = el.x + '%'; n.style.top = el.y + '%'; n.style.width = el.w + '%';
            if (el.kind !== 'text' && el.h != null) n.style.height = el.h + '%';
            n.style.transform = el.rot ? `rotate(${el.rot}deg)` : '';
            if (el.kind === 'text' && el.size != null) n.style.fontSize = (el.size / 100 * cv2.clientHeight).toFixed(1) + 'px';
          };

          let ges = null;   /* {type, i, handle, start, sx, sy, rect, moved} */
          cv2.addEventListener('pointerdown', (ev) => {
            if (ev.button !== undefined && ev.button !== 0) return;
            const t = ev.target;
            if (t.isContentEditable || (t.closest && t.closest('[contenteditable]'))) return;
            const hd = t.closest && t.closest('.hd');
            const elDom = t.closest && t.closest('[data-el]');
            if (!elDom || (t.closest && t.closest('.ed-quickpill'))) return;
            const i = +elDom.dataset.el;
            const el = scene2().elements[i]; if (!el) return;
            e.selEl = i;
            const rect = cv2.getBoundingClientRect();
            const base = { type: 'move', i, start: pickGeo(el), sx: ev.clientX, sy: ev.clientY, rect, moved: false };
            if (hd) {
              const cls = [...hd.classList].find((c) => c !== 'hd');
              ges = { ...base, type: cls === 'rot' ? 'rotate' : 'resize', handle: cls };
            } else ges = base;
            if (cv2.setPointerCapture && ev.pointerId != null) { try { cv2.setPointerCapture(ev.pointerId); } catch (_) {} }
            ev.preventDefault();
          });

          const onMove = (ev) => {
            if (!ges) return;
            const el = scene2().elements[ges.i]; if (!el) { ges = null; return; }
            const rw = ges.rect.width || 1, rh = ges.rect.height || 1;
            const dx = (ev.clientX - ges.sx) / rw * 100;
            const dy = (ev.clientY - ges.sy) / rh * 100;
            if (Math.abs(dx) + Math.abs(dy) > 0.15) ges.moved = true;
            if (ges.type === 'move') {
              L.dragTo(el, ges.start.x, ges.start.y, dx, dy);
              showG(L.snap(el, scene2().elements.filter((_, j) => j !== ges.i), 1.2,
                (scene2().width || 16) / (scene2().height || 9)));  /* R108 */
            } else if (ges.type === 'resize') {
              L.resizeTo(el, ges.handle, ges.start, dx, dy, { aspect: ev.shiftKey });
            } else {
              const cx = ges.rect.left + (el.x + (el.w || 10) / 2) / 100 * rw;
              const cy = ges.rect.top + (el.y + (el.h || 8) / 2) / 100 * rh;
              L.rotateTo(el, cx, cy, ev.clientX, ev.clientY);
            }
            const n = cv2.querySelector(`[data-el="${ges.i}"]`);
            if (n) paint(n, el);
          };
          const onUp = () => {
            if (!ges) return;
            hideG();
            const g0 = ges; ges = null;
            const el = scene2().elements[g0.i];
            if (!el) { PG.render(); return; }
            if (g0.moved) {
              const post = pickGeo(el);
              putGeo(el, g0.start);                      /* 되돌릴 지점 = 제스처 시작 상태 */
              H.push(g0.type === 'move' ? '이동' : g0.type === 'resize' ? '크기 조절' : '회전');
              putGeo(el, post);
            }
            PG.render();                                  /* 선택 상태·핸들·알약 반영 */
          };
          cv2.addEventListener('pointermove', onMove);
          cv2.addEventListener('pointerup', onUp);
          cv2.addEventListener('pointercancel', onUp);
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);

          /* --- 더블클릭 = 인라인 텍스트 편집 (캔버스에서 바로) --- */
          cv2.addEventListener('dblclick', (ev) => {
            const n = ev.target.closest && ev.target.closest('[data-editable]');
            if (!n) return;
            const i = +n.dataset.el;
            const el = scene2().elements[i]; if (!el || el.kind !== 'text') return;
            const span = n.querySelector('.ed-txt'); if (!span) return;
            e.selEl = i;
            /* R113 — 화면은 이제 export 가 나눈 줄(+ '· ' 접두 · '…' 말줄임)을 그린다.
               커밋은 innerText 를 원문으로 삼으므로, 편집에 들어가는 순간 원문으로
               되돌려 놓지 않으면 그린 줄바꿈과 접두가 el.text 에 굳어버린다.
               같이 pre → pre-wrap 으로 풀어 편집 중엔 전체 글이 보이게 한다. */
            span.textContent = el.text == null ? '' : String(el.text);
            const wsBack = n.style.whiteSpace;
            n.style.whiteSpace = 'pre-wrap';
            try { span.contentEditable = 'plaintext-only'; } catch (_) {}
            if (span.contentEditable !== 'plaintext-only') { try { span.contentEditable = 'true'; } catch (_) {} }
            span.setAttribute('contenteditable', span.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true');   /* 속성 반영 보장 */
            span.focus();
            try { const r = document.createRange(); r.selectNodeContents(span); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (_) {}
            let done = false;
            const finish = (cancel) => {
              if (done) return; done = true;
              span.removeAttribute('contenteditable');
              n.style.whiteSpace = wsBack;   /* R113 — 그리는 규약으로 복귀 */
              const t2 = cancel ? el.text : (span.innerText != null ? span.innerText : span.textContent);
              if (!cancel && t2 !== el.text) { H.push('텍스트 편집'); L.editText(el, t2); }
              PG.render();
            };
            span.onblur = () => finish(false);
            span.onkeydown = (ke) => {
              ke.stopPropagation();
              if (ke.key === 'Enter' && !ke.shiftKey) { ke.preventDefault(); finish(false); }
              if (ke.key === 'Escape') { ke.preventDefault(); finish(true); }
            };
          });
        }

        /* --- 키보드: 화살표 이동(Shift=크게)·Delete 삭제·Ctrl/Cmd+D 복제 --- */
        if (!document._liveKbd) {
          document._liveKbd = true;
          document.addEventListener('keydown', (ev) => {
            if (PG.state.screen !== 'editor' && PG.state.screen !== 'review') return;
            const ee = PG.state.editor; if (!ee || !ee.doc || ee.selEl == null) return;
            const tg = ev.target;
            if (tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable)) return;
            const sc = ee.doc.scenes[ee.sceneIdx];
            const el = sc && sc.elements[ee.selEl]; if (!el) return;
            if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'd') {
              ev.preventDefault();
              H.push('복제');
              ee.selEl = L.dupEl(sc, ee.selEl);
              PG.render(); return;
            }
            if (ev.key === 'Delete' || ev.key === 'Backspace') {
              ev.preventDefault();
              H.push('삭제');
              L.removeEl(sc, ee.selEl); ee.selEl = null;
              PG.render(); return;
            }
            if (/^Arrow(Left|Right|Up|Down)$/.test(ev.key)) {
              ev.preventDefault();
              if (!ee._nudging) { H.push('이동'); ee._nudging = true; setTimeout(() => { ee._nudging = false; }, 900); }
              L.nudge(el, ev.key, ev.shiftKey);
              const n = document.querySelector(`.ed-canvas [data-el="${ee.selEl}"]`);
              if (n) { n.style.left = el.x + '%'; n.style.top = el.y + '%'; }
              const ee2 = PG.state.editor;
              L.autosave(ee2.doc, { review: !!ee2.review, onSaved: () => markSaved('저장됨 · ' + nowStr()) });
            }
          });
        }
      }
    },
  };
})();

/* ============================================================
   Review Mode — #/review (디자인 검수 전용)
   무로그인·더미 데이터·읽기 전용(세션 내 조작 가능, 저장만 차단).
   샘플 자동 로드 + 전 패널 노출 + 요소 선택 상태로 시작 + 고급 펼침.
   ============================================================ */
window.MK_SCREENS.review = (() => {
  const E = () => window.MK_SCREENS.editor;
  return {
    title: 'Editor — Review Mode', variants: ['Design', 'Video'], flush: true, chromeless: true,
    render(v) {
      const e = PG.state.editor;
      if (!e.doc || !e.review) {
        PG.loadEditorDoc('tpl-pr-presentation-01');
        e.review = true;
        const firstText = PG.state.editor.doc.scenes[0].elements.findIndex((el) => el.kind === 'text');
        e.selEl = firstText >= 0 ? firstText : 0;    /* 제목 선택 상태로 시작 — 우측 속성 폼 즉시 노출 */
        e.menu = e.menu || 'text';
      }
      return E().render(v);
    },
    mount(root) {
      E().mount(root);
      root.querySelector('.ed').classList.add('ed--review');
      /* 저장 차단 — 리뷰 모드의 유일한 제약 */
      const save = root.querySelector('[data-ed="save"]');
      const state = root.querySelector('#edSave');
      if (state) { state.textContent = '리뷰 모드 · 저장되지 않음'; state.style.color = 'var(--mk-coral)'; }
      if (save) save.onclick = () => { if (state) state.textContent = '리뷰 모드 — 저장하지 않습니다'; };
      /* 검수 편의 — 고급 섹션 펼침 */
      root.querySelectorAll('details.ed-adv').forEach((d) => { d.open = true; });
      /* 배지 */
      const tb = root.querySelector('.ed-toolbar');
      if (tb && !tb.querySelector('.ed-review-badge')) {
        const b = document.createElement('span');
        b.className = 'ed-review-badge';
        b.textContent = 'REVIEW';
        tb.insertBefore(b, tb.querySelector('.ed-tb-file'));
        const wm = document.createElement('span');
        wm.className = 'ed-brandmark';
        wm.textContent = 'K-MAKER';
        tb.insertBefore(wm, b);
      }
      /* 나가기 → 리뷰 홈이 아닌 Home으로 (검수 동선 단순화) */
      const back = root.querySelector('[data-ed="back"]');
      if (back) back.onclick = () => PG.go('home');
    },
  };
})();
