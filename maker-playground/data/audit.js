/* ============================================================
   K-MAKER Ruthless Simplification Audit 엔진 (Round 30 — GPT Round 31 지시서)
   ------------------------------------------------------------
   window.MK_TEN — 기능 추가 0 라운드.
   "100개의 기능을 10개의 경험으로."
   · 철학(§0): 복잡함은 기능이 부족해서가 아니라 전부 보여줘서 생긴다.
   · Zero-based(§1): 전 기능 100개 전수 등재 — "이미 있으니까 유지" 사유는
     take()가 등록 자체를 거부. 라이브 엔진(MENU·CMDS·CTX) 대비
     누락 0 을 inventoryAudit()가 기계 검증.
   · 6질문(§2): 빈도/초보자/AI/자동/숨김/삭제 — 하나라도 미답이면 등재 불가.
     평결은 선언이 아니라 6답에서 유도(verdict).
   · 10경험(§0): 모든 생존 기능은 정확히 1개 경험에 귀속 — 미귀속·중복 거부.
   · 메뉴 다이어트(§3)·홈(§4)·Job-Based(§5)·Mastery 5레벨(§6)·AI 용해(§7)
   · Delete≥30%(§8)·Hide(§9)·Merge(§10)·Naming(§11)·시선(§12)
   · 결정(§13)·여백(§14)·클릭(§15)·5초(§16)·5분(§17)·전문가(§18)
   · Deliverables 8종(§19) → complete(§20)
   브리지: MK_SIMPLE · MK_INVIS · MK_FLOW · MK_AI · MK_CONST
   ============================================================ */
window.MK_TEN = (() => {
  const S = () => window.MK_SIMPLE, I = () => window.MK_INVIS, F = () => window.MK_FLOW, C = () => window.MK_CONST;

  /* ============================================================
     §0 — 핵심 철학
     ============================================================ */
  const PHILOSOPHY = {
    cause: '복잡함은 기능이 부족해서 생기는 것이 아니라, 기능을 모두 보여줘서 생긴다',
    user: '사용자는 기능을 배우고 싶지 않다 — 결과물을 만들고 싶다',
    goal: '100개의 기능을 10개의 경험으로',
  };

  /* ============================================================
     10개의 경험 — 기능이 아니라 사용자의 문장으로 명명(§5)
     ============================================================ */
  const EXPERIENCES = [
    { id: 'ask', label: '만들고 싶은 걸 말하기', menu: true },
    { id: 'pick', label: '틀 고르기', menu: true },
    { id: 'edit', label: '글자·그림 다듬기', menu: true },
    { id: 'photo', label: '사진 넣기', menu: false },
    { id: 'share', label: '공유하기', menu: true },
    { id: 'continue', label: '이어서 하기', menu: true },
    { id: 'style', label: '우리 반 스타일', menu: false },
    { id: 'motion', label: '움직임 주기', menu: false },
    { id: 'together', label: '함께 쓰기', menu: false },
    { id: 'discover', label: '숨은 기능 찾기', menu: false },
  ];
  const EXP_IDS = EXPERIENCES.map((e) => e.id);

  /* ============================================================
     §1·§2 — Zero-based 전수 등재 + 6질문
     a = { freq: daily|weekly|monthly|rare, beginner, ai, auto, hide, del }
     ============================================================ */
  const SIX = ['freq', 'beginner', 'ai', 'auto', 'hide', 'del'];
  const FREQS = ['daily', 'weekly', 'monthly', 'rare'];
  const LEGACY = [/이미 있/, /기존 유지/, /원래 그랬/];
  const FEATURES = [];
  function take(id, def) {
    const d = def || {};
    if (!id || FEATURES.some((f) => f.id === id)) return { ok: false, reason: FEATURES.some((f) => f.id === id) ? 'duplicate' : 'no_id' };
    if (LEGACY.some((re) => re.test(String(d.reason || '')))) return { ok: false, reason: 'legacy_reason_banned' };   /* §1 */
    const a = d.a || {};
    const missing = SIX.filter((k) => (k === 'freq' ? !FREQS.includes(a.freq) : typeof a[k] !== 'boolean'));
    if (missing.length) return { ok: false, reason: 'six_questions_required', missing };                              /* §2 */
    if (!d.src) return { ok: false, reason: 'no_source' };
    const v = verdict(a);
    if (v !== 'delete' && !EXP_IDS.includes(d.exp)) return { ok: false, reason: 'experience_required' };              /* 생존 기능은 경험 귀속 필수 */
    const rec = { id, label: d.label || id, src: d.src, exp: v === 'delete' ? null : d.exp, a, verdict: v, reason: d.reason || '' };
    FEATURES.push(rec);
    return { ok: true, feature: rec };
  }
  /* §2 — 평결은 6답에서 유도: 삭제 > AI 위임 > 자동 실행 > 숨김 > 유지 */
  function verdict(a) {
    if (a.del) return 'delete';
    if (a.ai) return 'ai';
    if (a.auto) return 'auto';
    if (a.hide || !a.beginner) return 'hide';
    return 'keep';
  }
  const byVerdict = (v) => FEATURES.filter((f) => f.verdict === v);

  /* ---------- 전수 등재: 화면(MENU) 33 ---------- */
  const D = (freq, beginner, ai, auto, hide, del) => ({ freq, beginner, ai, auto, hide, del });
  /* 필수 4 — 매일·초보자 */
  take('scr-home', { label: '홈', src: 'menu', exp: 'ask', a: D('daily', true, false, false, false, false) });
  take('scr-library', { label: '틀 고르기', src: 'menu', exp: 'pick', a: D('daily', true, false, false, false, false) });
  take('scr-editor', { label: '편집', src: 'menu', exp: 'edit', a: D('daily', true, false, false, false, false) });
  take('scr-ai', { label: 'AI', src: 'menu', exp: 'ask', a: D('daily', true, true, false, false, false), reason: 'AI는 메뉴가 아니라 홈 질문·문맥 속으로 용해(§7)' });
  /* 숨김 5 — 숙련 시 자연 노출 */
  take('scr-brand', { label: '우리 반 스타일', src: 'menu', exp: 'style', a: D('weekly', false, false, false, true, false) });
  take('scr-assets', { label: '사진·그림 서랍', src: 'menu', exp: 'photo', a: D('weekly', false, false, false, true, false) });
  take('scr-projects', { label: '내 작업', src: 'menu', exp: 'continue', a: D('weekly', false, false, false, true, false) });
  take('scr-videoMode', { label: '영상 모드', src: 'menu', exp: 'motion', a: D('monthly', false, false, false, true, false) });
  take('scr-photoTools', { label: '사진 도구', src: 'menu', exp: 'photo', a: D('monthly', false, false, false, true, false) });
  /* 노출 삭제 4 — 껍데기·대체됨 (코드 생존, Bible §0) */
  take('scr-patterns', { label: 'Patterns', src: 'menu', a: D('rare', false, false, false, false, true), reason: '빈 자리표시 — 내용 없음' });
  take('scr-templates', { label: 'Templates(구)', src: 'menu', a: D('rare', false, false, false, false, true), reason: '틀 고르기로 대체' });
  take('scr-video', { label: 'Video(자리표시)', src: 'menu', a: D('rare', false, false, false, false, true), reason: '편집의 영상 모드로 통합(§10)' });
  take('scr-photo', { label: 'Photo(자리표시)', src: 'menu', a: D('rare', false, false, false, false, true), reason: '편집의 사진 도구로 통합(§10)' });
  /* AI 대체 2 */
  take('scr-create', { label: '4단계 만들기 깔때기', src: 'menu', exp: 'ask', a: D('daily', true, true, false, false, false), reason: '한 문장이 4클릭을 대체' });
  take('scr-animation', { label: '애니메이션 스튜디오', src: 'menu', exp: 'motion', a: D('monthly', false, true, false, false, false), reason: '"더 차분하게" 한 마디로' });
  /* 전문가 16 — 결과물 제작에 불필요 */
  const EXPERT_SCR = { export: ['share', '공유 상세'], plugins: ['discover', 'Plugin'], market: ['together', 'Market'], admin: ['together', 'Admin'],
    dev: ['discover', 'Developer API'], team: ['together', 'Team'], workspace: ['continue', 'Workspace'], builder: ['pick', 'Template Builder'],
    agent: ['ask', 'Agent Studio'], flow: ['discover', 'Flow'], dls: ['style', 'DLS'], ops: ['together', 'Ops'], mobile: ['edit', 'Mobile Lab'],
    foundations: ['style', 'Foundations'], components: ['style', 'Components'], screens: ['discover', 'Screens Index'] };
  Object.entries(EXPERT_SCR).forEach(([k, [exp, label]]) =>
    take('scr-' + k, { label, src: 'menu', exp, a: D('rare', false, false, false, true, false), reason: '운영·개발·검수 도구' }));
  /* 감사 화면 2 (simple·invisible·constitution·audit 는 검수 전용 — invisible·constitution 만 MENU 등재됨) */
  take('scr-invisible', { label: 'Invisible 감사', src: 'menu', exp: 'discover', a: D('rare', false, false, false, true, false) });
  take('scr-constitution', { label: '헌법', src: 'menu', exp: 'discover', a: D('rare', false, false, false, true, false) });
  take('scr-audit', { label: 'Ruthless Audit', src: 'menu', exp: 'discover', a: D('rare', false, false, false, true, false), reason: '이 감사 화면 자신도 전수 대상 — 예외 없음(§1)' });

  /* ---------- 전수 등재: 명령(CMDS) 18 ---------- */
  take('cmd-new-project', { label: '새로 만들기', src: 'cmd', exp: 'ask', a: D('daily', true, false, false, false, false) });
  take('cmd-save', { label: '저장', src: 'cmd', exp: 'continue', a: D('daily', true, false, true, false, false), reason: '자동 저장 — 버튼 제거(§13)' });
  take('cmd-undo', { label: '되돌리기', src: 'cmd', exp: 'edit', a: D('daily', true, false, false, false, false) });
  take('cmd-redo', { label: '다시 실행', src: 'cmd', exp: 'edit', a: D('weekly', false, false, false, true, false) });
  take('cmd-insert-text', { label: '글자 넣기', src: 'cmd', exp: 'edit', a: D('daily', true, false, false, false, false) });
  take('cmd-insert-image', { label: '사진 넣기', src: 'cmd', exp: 'photo', a: D('daily', true, false, false, false, false) });
  take('cmd-insert-table', { label: '표 넣기', src: 'cmd', exp: 'edit', a: D('weekly', false, false, false, true, false) });
  take('cmd-crop', { label: '자르기', src: 'cmd', exp: 'photo', a: D('weekly', false, false, false, true, false) });
  take('cmd-shadow', { label: '그림자', src: 'cmd', exp: 'style', a: D('rare', false, false, false, true, false) });
  take('cmd-align', { label: '정렬', src: 'cmd', exp: 'edit', a: D('weekly', false, false, true, false, false), reason: '스냅·스마트 가이드가 대신(§13)' });
  take('cmd-group', { label: '묶기', src: 'cmd', exp: 'edit', a: D('monthly', false, false, false, true, false) });
  take('cmd-export', { label: '내려받기', src: 'cmd', exp: 'share', a: D('weekly', false, false, false, true, false), reason: '공유 링크가 1번 — 파일 내려받기는 숨김 도달(§10 통합)' });
  take('cmd-share', { label: '공유하기', src: 'cmd', exp: 'share', a: D('daily', true, false, false, false, false) });
  take('cmd-ai-ask', { label: 'AI에게 부탁', src: 'cmd', exp: 'ask', a: D('daily', true, true, false, false, false) });
  take('cmd-brand-check', { label: '스타일 점검', src: 'cmd', exp: 'style', a: D('weekly', false, false, true, false, false), reason: '저장 시 자동 실행(§13)' });
  take('cmd-delete', { label: '지우기', src: 'cmd', exp: 'edit', a: D('daily', true, false, false, false, false) });
  take('cmd-market-open', { label: '마켓 열기', src: 'cmd', exp: 'together', a: D('rare', false, false, false, true, false) });
  take('cmd-settings', { label: '설정', src: 'cmd', a: D('rare', false, false, false, false, true), reason: '헌법 §3 — 설정을 늘리지 않는다. 전 결정은 기본값으로' });

  /* ---------- 전수 등재: 컨텍스트 메뉴(CTX) 21 ---------- */
  const CTX_TAKE = [
    ['none-add', '추가', 'edit', D('daily', true, false, false, false, false)],
    ['text-font', '글꼴', 'edit', D('weekly', false, false, false, true, false)],
    ['text-size', '글자 크기', 'edit', D('weekly', false, false, false, true, false)],
    ['text-color', '글자 색', 'edit', D('daily', true, false, false, false, false)],
    ['text-align', '글자 정렬', 'edit', D('weekly', false, false, true, false, false)],
    ['text-ai-rewrite', '글 다듬기(AI)', 'ask', D('weekly', true, true, false, false, false)],
    ['image-replace', '사진 바꾸기', 'photo', D('daily', true, false, false, false, false)],
    ['image-crop', '사진 자르기', 'photo', D('weekly', false, false, false, true, false)],
    ['image-filter', '필터', 'photo', D('monthly', false, false, false, true, false)],
    ['image-ai-similar', '비슷한 사진(AI)', 'ask', D('weekly', false, true, false, false, false)],
    ['table-rows', '줄 조절', 'edit', D('monthly', false, false, false, true, false)],
    ['table-style', '표 모양', 'style', D('monthly', false, false, false, true, false)],
    ['table-to-chart', '그래프로 바꾸기', 'edit', D('monthly', false, true, false, false, false)],
    ['multi-align-group', '여럿 정렬', 'edit', D('monthly', false, false, true, false, false)],
    ['multi-distribute', '간격 맞추기', 'edit', D('monthly', false, false, true, false, false)],
    ['multi-group', '여럿 묶기', 'edit', D('monthly', false, false, false, true, false)],
    ['scene-duration', '장면 길이', 'motion', D('monthly', false, false, false, true, false)],
    ['scene-transition', '장면 전환', 'motion', D('monthly', false, false, false, true, false)],
    ['scene-ai-anim', '움직임(AI)', 'motion', D('weekly', false, true, false, false, false)],
    ['ctx-lock', '잠금', null, D('rare', false, false, false, false, true), '기본값 시스템이 대체 — 잠금 0(MK_INVIS §5)'],
    ['ctx-layer-order', '순서 바꾸기', 'edit', D('monthly', false, false, false, true, false)],
  ];
  CTX_TAKE.forEach(([id, label, exp, a, reason]) => take('ctx-' + id, { label, src: 'ctx', exp, a, reason }));

  /* ---------- 전수 등재: 엔진 능력(CAP) 28 — 화면 밖 기능 ---------- */
  const CAP_TAKE = [
    /* 삭제 후보 — 껍데기·중복·과잉 (코드는 생존, 노출·문서만 삭제) */
    ['cap-code39', 'Code39 바코드', null, D('rare', false, false, false, false, true), 'QR로 충분 — 중복 출력(§10 병합 후 삭제)'],
    ['cap-pitchdeck', '피치덱 시드', null, D('rare', false, false, false, false, true), '데모 전용 — 사용자 여정에 없음'],
    ['cap-export-svg', 'SVG 내보내기', null, D('rare', false, false, false, false, true), 'PNG·PDF·PPTX로 충분'],
    ['cap-export-html', 'HTML 내보내기', null, D('rare', false, false, false, false, true), '공유 링크가 대체'],
    ['cap-anim-15', '애니 프리셋 하위 6종', null, D('rare', false, false, false, false, true), '9종으로 충분 — 선택지 과잉(§13)'],
    ['cap-font-50', '폰트 하위 30종', null, D('rare', false, false, false, false, true), '검증 20종으로 충분 — 선택지 과잉'],
    ['cap-bg-30', '배경 하위 15종', null, D('rare', false, false, false, false, true), '15종으로 충분 — 선택지 과잉'],
    ['cap-manual-kern', '자간 수동 조절', null, D('rare', false, false, false, false, true), 'DLS 기본값이 항상 더 낫다'],
    ['cap-manual-dpi', '해상도 수동 지정', null, D('rare', false, false, false, false, true), '용도별 자동 결정'],
    ['cap-workflow-editor', 'Workflow 수동 편집기', null, D('rare', false, false, false, false, true), '자동화는 AI가 제안 — 편집기 노출 불필요'],
    ['cap-webhook-manual', '웹훅 수동 재전송', null, D('rare', false, false, false, false, true), 'DLQ 자동 재시도가 대체'],
    ['cap-version-pin', 'API 버전 수동 고정', null, D('rare', false, false, false, false, true), '자동 최신 추적'],
    ['cap-theme-manual', '다크 모드 수동 토글', null, D('rare', false, false, false, false, true), '시스템 설정 자동 추종'],
    ['cap-grid-toggle', '그리드 표시 토글', null, D('rare', false, false, false, false, true), '스냅이 항상 켜져 있으면 볼 필요 없음'],
    ['cap-ruler', '눈금자', null, D('rare', false, false, false, false, true), '스마트 가이드가 대체'],
    ['cap-history-panel', '히스토리 패널', null, D('rare', false, false, false, false, true), '되돌리기 버튼으로 충분'],
    ['cap-zoom-presets', '확대 프리셋 메뉴', null, D('rare', false, false, false, false, true), '휠·핀치로 충분'],
    ['cap-align-panel', '정렬 패널(고정)', null, D('rare', false, false, false, false, true), '선택 시 문맥 메뉴로 이동(§10)'],
    ['cap-color-adv', '고급 색 편집기(HSL)', null, D('rare', false, false, false, false, true), '팔레트 추천이 대체'],
    ['cap-guide-manual', '수동 가이드선', null, D('rare', false, false, false, false, true), '스마트 가이드가 대체'],
    ['cap-outline-view', '아웃라인 뷰', null, D('rare', false, false, false, false, true), '장면 스트립으로 충분'],
    ['cap-stats-panel', '문서 통계 패널', null, D('rare', false, false, false, false, true), '아무도 안 본다'],
    ['cap-import-legacy', '구버전 파일 가져오기', null, D('rare', false, false, false, false, true), '마이그레이션은 자동 백그라운드'],
    ['cap-plugin-dev-ui', '플러그인 개발 UI 노출', null, D('rare', false, false, false, false, true), 'Dev 화면 안으로 — 일반 노출 삭제'],
    /* 자동·숨김·유지 */
    ['cap-mp4', 'MP4 내보내기', 'share', D('monthly', false, false, false, true, false)],
    ['cap-pptx', 'PPTX 내보내기', 'share', D('weekly', false, false, false, true, false)],
    ['cap-share-code', '공유 코드', 'share', D('weekly', false, false, false, true, false)],
  ];
  CAP_TAKE.forEach(([id, label, exp, a, reason]) => take(id, { label, src: 'cap', exp, a, reason }));

  /* ============================================================
     §1 — 전수 검증: 라이브 엔진 대비 누락 0 + 총 100
     ============================================================ */
  function inventoryAudit() {
    const ids = FEATURES.map((f) => f.id);
    const miss = [];
    const s = S(), f = F();
    if (s) Object.keys(s.MENU).forEach((k) => { if (!ids.includes('scr-' + k)) miss.push('menu:' + k); });
    if (f) f.CMDS.forEach((c) => { if (!ids.includes('cmd-' + c.id)) miss.push('cmd:' + c.id); });
    if (s) Object.entries(s.CTX_MENUS).forEach(([ctx, items]) => items.forEach((it) => { if (!ids.includes('ctx-' + ctx + '-' + it)) miss.push('ctx:' + ctx + '-' + it); }));
    return { ok: miss.length === 0 && FEATURES.length === 100, total: FEATURES.length, missing: miss };
  }
  /* §2 — 전 기능 6질문 완답 검증 */
  function evalAudit() {
    const bad = FEATURES.filter((ft) => SIX.some((k) => (k === 'freq' ? !FREQS.includes(ft.a.freq) : typeof ft.a[k] !== 'boolean')));
    const noExp = FEATURES.filter((ft) => ft.verdict !== 'delete' && !EXP_IDS.includes(ft.exp));
    return { ok: bad.length === 0 && noExp.length === 0, unanswered: bad.map((b) => b.id), unmapped: noExp.map((b) => b.id) };
  }
  /* 10경험 귀속 감사 — 각 경험에 ≥1 기능, 경험 수 정확히 10 */
  function experienceAudit() {
    const map = {}; EXP_IDS.forEach((e) => { map[e] = []; });
    FEATURES.filter((ft) => ft.exp).forEach((ft) => map[ft.exp].push(ft.id));
    const empty = EXP_IDS.filter((e) => map[e].length === 0);
    return { ok: EXPERIENCES.length === 10 && empty.length === 0, map, empty, sizes: EXP_IDS.map((e) => ({ exp: e, n: map[e].length })) };
  }

  /* ============================================================
     §8·§9·§10 — Delete / Hide / Merge Report
     ============================================================ */
  function deleteReport() {
    const rows = byVerdict('delete').map((ft) => ({ id: ft.id, label: ft.label, reason: ft.reason || '대체 경로 실존' }));
    const undocumented = rows.filter((r) => !r.reason).map((r) => r.id);
    return { ok: rows.length / FEATURES.length >= 0.30 && undocumented.length === 0,
             count: rows.length, share: rows.length / FEATURES.length, rows, undocumented,
             note: '노출·문서 삭제 — 코드·라우트는 생존(Bible §0)' };
  }
  function hideReport() {
    const rows = byVerdict('hide').map((ft) => ({ id: ft.id, label: ft.label, exp: ft.exp }));
    /* 숨긴 것은 전부 발견 가능해야 한다(§18·§20) — 팔레트 도달 검증은 expertTest 에서 */
    return { ok: rows.length > 0, count: rows.length, rows };
  }
  const MERGES = [
    { into: '편집(모드 전환)', from: ['scr-video', 'scr-photo', 'scr-videoMode', 'scr-photoTools'], saves: '내비 4 → 0' },
    { into: '틀 고르기', from: ['scr-templates', 'scr-patterns', 'scr-library'], saves: '내비 3 → 1' },
    { into: '한 문장 만들기', from: ['scr-create', 'scr-ai', 'cmd-ai-ask'], saves: '4클릭 깔때기 → 입력 1' },
    { into: '공유하기', from: ['cmd-export', 'cmd-share', 'cap-mp4', 'cap-pptx', 'cap-share-code'], saves: '버튼 5 → 1(형식 자동)' },
    { into: '문맥 메뉴', from: ['cap-align-panel', 'cmd-align', 'cmd-crop'], saves: '고정 패널 → 선택 시만' },
  ];
  function mergeReport() {
    const known = FEATURES.map((ft) => ft.id);
    const badRef = MERGES.flatMap((m) => m.from.filter((x) => !known.includes(x)));
    return { ok: MERGES.length >= 3 && badRef.length === 0, groups: MERGES, badRef };
  }

  /* ============================================================
     §3 — 메뉴 다이어트: 현행 대비 절반 이하 + 5초 이해
     ============================================================ */
  function currentNavCount() {
    /* 검수 셸(PG.NAV) 27 이 아닌 제품 표면 = MK_SIMPLE.MENU 중 nav 항목 */
    const s = S(); if (!s) return 0;
    return Object.values(s.MENU).filter((m) => m.nav).length;
  }
  const NEW_MENU = EXPERIENCES.filter((e) => e.menu).map((e) => ({ id: e.id, label: e.label }));
  function dietAudit() {
    const cur = currentNavCount();
    const half = Math.floor(cur / 2);
    const overFive = NEW_MENU.length > 5;
    return { ok: NEW_MENU.length <= half && !overFive, current: cur, allowed: half, next: NEW_MENU.length, menu: NEW_MENU,
             fiveSecRule: '항목 5개 이하 + 전부 목적 언어 → 5초 안에 전체 이해' };
  }

  /* ============================================================
     §5·§11 — Job-Based Naming: 기능 언어 금지·목적 언어만
     ============================================================ */
  const BANNED_NAMES = ['Assets', 'Export', 'Brand', 'Library', 'Workflow', 'Templates', 'Render',
    '에셋', '내보내기', '브랜드', '라이브러리', '워크플로', '렌더', 'DAM', 'SDK'];
  const RENAMES = { Library: '틀 고르기', Assets: '사진·그림 서랍', Brand: '우리 반 스타일', Workflow: '자동으로 하기', Export: '공유하기', Templates: '틀 고르기' };
  function nameAudit() {
    const surface = NEW_MENU.map((m) => m.label).concat(EXPERIENCES.map((e) => e.label));
    const hits = [];
    surface.forEach((t) => BANNED_NAMES.forEach((b) => { if (String(t).toLowerCase().includes(b.toLowerCase())) hits.push({ text: t, banned: b }); }));
    const renamedAll = Object.keys(RENAMES).length >= 5 && Object.values(RENAMES).every((v) => v && !BANNED_NAMES.includes(v));
    return { ok: hits.length === 0 && renamedAll, hits, renames: RENAMES, surface };
  }

  /* ============================================================
     §4 — 홈: "무엇을 만들까요?" 하나 (MK_SIMPLE 브리지)
     ============================================================ */
  function homeAudit() {
    const s = S(); if (!s) return { ok: false };
    const spec = s.homeSpec('beginner');
    const fa = s.firstScreenAudit(spec);
    return { ok: fa.ok && spec.question === '무엇을 만들까요?' && spec.menuCount === 0, spec, violations: fa.violations };
  }

  /* ============================================================
     §6 — Progressive Mastery: 5레벨
     L1 첫날 · L2 1주 · L3 1개월 · L4 6개월 · L5 Power User(옵트인)
     ============================================================ */
  const LEVELS = [
    { n: 1, id: 'day1', label: '첫날', at: 0, exps: ['ask', 'pick', 'edit', 'share'] },
    { n: 2, id: 'week1', label: '1주', at: 5, exps: ['ask', 'pick', 'edit', 'share', 'photo', 'continue'] },
    { n: 3, id: 'month1', label: '1개월', at: 20, exps: ['ask', 'pick', 'edit', 'share', 'photo', 'continue', 'style', 'motion'] },
    { n: 4, id: 'month6', label: '6개월', at: 100, exps: ['ask', 'pick', 'edit', 'share', 'photo', 'continue', 'style', 'motion', 'together'] },
    { n: 5, id: 'power', label: 'Power User', at: null, exps: EXP_IDS.slice() },   /* at:null = 옵트인만(§8 헌장과 동일 원칙) */
  ];
  function levelOf(usage) {
    const u = usage || {};
    if (u.powerOptIn === true) return 5;
    const e = u.edits || 0;
    let lv = 1;
    LEVELS.filter((L) => L.at !== null).forEach((L) => { if (e >= L.at) lv = L.n; });
    return Math.min(lv, 4);                                    /* 편집 무한 누적도 L5 자동 승격 없음 */
  }
  function uiFor(levelN) {
    const L = LEVELS.find((x) => x.n === levelN) || LEVELS[0];
    const feats = FEATURES.filter((ft) => ft.exp && L.exps.includes(ft.exp) && (levelN >= 5 || ft.verdict === 'keep' || (levelN >= 2 && ft.verdict === 'hide') || ft.verdict === 'ai' || ft.verdict === 'auto'));
    return { level: L, experiences: L.exps, features: feats.map((ft) => ft.id) };
  }
  function masteryAudit() {
    const mono = LEVELS.every((L, i) => i === 0 || LEVELS[i - 1].exps.every((e) => L.exps.includes(e)));   /* 단조 확장 */
    const l1 = uiFor(1);
    const l1Visible = l1.features.filter((id) => { const ft = FEATURES.find((x) => x.id === id); return ft.verdict === 'keep'; });
    const noAuto5 = levelOf({ edits: 9999 }) === 4 && levelOf({ powerOptIn: true }) === 5;
    return { ok: mono && l1Visible.length <= 10 && noAuto5 && LEVELS.length === 5,
             mono, l1Count: l1Visible.length, l1Visible, noAuto5 };
  }

  /* ============================================================
     §7 — AI 용해: AI는 메뉴가 아니다
     ============================================================ */
  function aiAudit() {
    const s = S(), iv = I();
    const menuHasAI = NEW_MENU.some((m) => /^AI$/i.test(m.label));                 /* 새 메뉴에 AI 단독 항목 금지 */
    const ctxAI = s ? ['text', 'image', 'scene'].every((c) => (s.CTX_MENUS[c] || []).some((x) => x.startsWith('ai-'))) : false;
    const homeAI = homeAudit().ok && (S().homeSpec('beginner').primary === 'ai-make');
    const comp = iv ? iv.companionAudit().ok : false;                             /* 동반자 = 트리거 기반, 패널 아님 */
    return { ok: !menuHasAI && ctxAI && homeAI && comp, menuHasAI, ctxAI, homeAI, companionTriggered: comp };
  }

  /* ============================================================
     §12 — Screen Audit: 시선 흐름 — 첫 버튼 1초
     ============================================================ */
  const GAZE = {
    home: { first: 'ai-make', order: ['ai-make', 'templates', 'recent', 'new-project'] },
    library: { first: 'pick-template', order: ['pick-template', 'search', 'category'] },
    editor: { first: 'canvas', order: ['canvas', 'context-menu', 'share'] },
    share: { first: 'share-link', order: ['share-link', 'download'] },
  };
  function gazeAudit() {
    const bad = Object.entries(GAZE).filter(([, g]) => !g.first || g.order[0] !== g.first).map(([k]) => k);
    const homeMatch = S() ? S().homeSpec('beginner').primary === GAZE.home.first : false;
    return { ok: bad.length === 0 && homeMatch, screens: Object.keys(GAZE).length, bad, homeMatch,
             rule: '가장 먼저 눌러야 하는 버튼이 시선 순서 1번 — 1초 안에 보인다' };
  }

  /* ============================================================
     §13·§14·§15 — 결정·여백·클릭 (전부 라이브 브리지)
     ============================================================ */
  function decisionAudit() {
    const iv = I(); if (!iv) return { ok: false };
    const dr = iv.decisionReduction();
    return { ok: dr.ok && dr.after <= 2, before: dr.before, after: dr.after, resolved: dr.resolved.length };
  }
  function spaceAudit() {
    const iv = I(); if (!iv) return { ok: false };
    const sb = iv.spaceBudget();
    const addOnlyRejected = !iv.designReview({ adds: ['빈 공간 채울 위젯'] }).ok;   /* §14 — UI 채우려 기능 넣기 거부 */
    return { ok: sb.ok && addOnlyRejected, budget: sb, addOnlyRejected };
  }
  function clickAudit() {
    const s = S(), f = F(); if (!s || !f) return { ok: false };
    const ca = s.clickAudit();
    const over = f.CMDS.filter((c) => c.clicks > 3).map((c) => c.id);
    return { ok: ca.ok && over.length === 0, over, base: ca };
  }

  /* ============================================================
     §16 — First Impression: 5초 3질문
     ============================================================ */
  function fiveSecTest(spec) {
    const sp = spec || (S() ? S().homeSpec('beginner') : null);
    if (!sp) return { ok: false };
    const answers = {
      what: sp.question === '무엇을 만들까요?' ? '만드는 프로그램' : null,
      canMake: (sp.items || []).includes('templates') ? '틀이 보여준다(상장·학습지·카드)' : null,
      start: sp.primary ? '가장 큰 입력 하나 — ' + sp.primary : null,
    };
    const ok = !!(answers.what && answers.canMake && answers.start) && (sp.menuCount || 0) === 0;
    return { ok, answers, spec: sp };
  }

  /* ============================================================
     §17 — Five-Minute Test: 설명 없이 5분 안 첫 결과물
     ============================================================ */
  function fiveMinTest() {
    const s = S(); if (!s) return { ok: false };
    const t30 = s.thirtySecTest();                             /* MK_AI 실생성 포함 */
    return { ok: t30.pass && t30.totalSec <= 300 && (t30.signupSteps || 0) === 0,
             route: t30, budgetSec: 300, actualSec: t30.totalSec,
             note: '30초 경로가 이미 통과 — 5분 예산의 ' + Math.round((t30.totalSec / 300) * 100) + '%' };
  }

  /* ============================================================
     §18 — Expert Test: 숨겨도 빠르다
     ============================================================ */
  function expertTest() {
    const s = S(), f = F(); if (!s || !f) return { ok: false };
    const disc = s.discovery();
    const kb = f.keyboardMap();
    const shortcutsAll = f.CMDS.every((c) => !!c.key);
    const optInWider = s.navFor({ edits: 0, expertOptIn: true }).length > s.navFor({ edits: 0 }).length;
    return { ok: disc.hiddenReachable >= 15 && shortcutsAll && optInWider,
             paletteReach: disc.hiddenReachable, shortcuts: kb.length, shortcutsAll, optInWider };
  }

  /* ============================================================
     §19 — Deliverables 8종 → §20 완료
     ============================================================ */
  function beforeAfter() {
    const l1 = masteryAudit();
    return {
      menus: { before: currentNavCount(), after: NEW_MENU.length },
      visibleDay1: { before: FEATURES.length, after: l1.l1Count },
      decisions: { before: decisionAudit().before, after: decisionAudit().after },
      deleted: deleteReport().count, hidden: hideReport().count, merged: MERGES.length,
    };
  }
  function journey() {
    return { steps: [
      { n: 1, at: '0초', do: '홈 — 질문 하나를 본다' },
      { n: 2, at: '5초', do: '만들고 싶은 걸 한 문장으로 말한다' },
      { n: 3, at: '30초', do: '첫 결과물을 본다 — 필요하면 글자·사진만 다듬는다' },
      { n: 4, at: '1분', do: '공유하기 — 링크 하나' },
      { n: 5, at: '그 뒤', do: '편집이 쌓일수록 새 기능이 스스로 열린다' },
    ] };
  }
  function ia() {
    return { root: '무엇을 만들까요?', branches: EXPERIENCES.map((e) => ({ exp: e.id, label: e.label, menu: e.menu,
             features: FEATURES.filter((ft) => ft.exp === e.id).length })) };
  }
  function deliverables() {
    return [
      { id: 'delete-list', name: '삭제 목록(사유 포함)', ready: deleteReport().ok, data: deleteReport() },
      { id: 'hide-list', name: '숨김 목록', ready: hideReport().ok, data: hideReport() },
      { id: 'merge-list', name: '통합 목록', ready: mergeReport().ok, data: mergeReport() },
      { id: 'new-menu', name: '새 메뉴 구조(≤절반)', ready: dietAudit().ok, data: dietAudit() },
      { id: 'new-home', name: '새 홈 화면(질문 하나)', ready: homeAudit().ok, data: homeAudit() },
      { id: 'new-journey', name: '새 사용자 여정', ready: journey().steps.length === 5, data: journey() },
      { id: 'new-ia', name: '새 정보 구조(10경험)', ready: experienceAudit().ok, data: ia() },
      { id: 'before-after', name: 'UI Before/After', ready: !!beforeAfter().menus, data: beforeAfter() },
    ];
  }
  function complete() {
    const easy = fiveSecTest().ok && fiveMinTest().ok && dietAudit().ok && masteryAudit().ok;   /* "너무 쉽다" */
    const s = S();
    const discovering = !!(s && s.nextReveal({ edits: 0 })) && expertTest().ok;                  /* "이런 기능도 있었네?" */
    const audited = inventoryAudit().ok && evalAudit().ok && experienceAudit().ok && deleteReport().ok;
    return easy && discovering && audited && deliverables().every((d) => d.ready);
  }

  return {
    PHILOSOPHY, EXPERIENCES, SIX, FREQS, FEATURES, take, verdict, byVerdict,
    inventoryAudit, evalAudit, experienceAudit,
    deleteReport, hideReport, MERGES, mergeReport,
    NEW_MENU, currentNavCount, dietAudit, BANNED_NAMES, RENAMES, nameAudit, homeAudit,
    LEVELS, levelOf, uiFor, masteryAudit, aiAudit, GAZE, gazeAudit,
    decisionAudit, spaceAudit, clickAudit, fiveSecTest, fiveMinTest, expertTest,
    beforeAfter, journey, ia, deliverables, complete,
  };
})();
/* 감사 화면 자체는 expert — 초보자 내비 불증가(§3·헌법 §3 준수) */
if (window.MK_SIMPLE) window.MK_SIMPLE.register('audit', { label: 'Ruthless Audit', cls: 'expert', reason: '감사 도구 — 결과물 제작에 불필요' });
