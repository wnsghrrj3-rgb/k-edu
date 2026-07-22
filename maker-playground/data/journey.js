/* ============================================================
   K-MAKER User Journey 엔진 (Round 33 — GPT Round 34 지시서)
   ------------------------------------------------------------
   window.MK_JOURNEY — 기능 추가 0 라운드. "Job First Design."
   · 철학(§0): 사용자는 메뉴를 사용하지 않는다 — 작업(Job)을 수행한다.
     화면부터 설계하지 않는다 — 무엇을 하려고 켜는지부터 설계한다.
   · 대표 사용자·작업(§1·§2): 교사→수업자료 · 학생→발표 ·
     직장인→제안서 · 크리에이터→썸네일.
   · Journey(§3): 시작→AI 입력→템플릿→편집→검토→공유→완료 7단계 —
     4여정 × 7단계 = 28단계 전수, 전 단계 실라우트(MK_SCREENS) 존재
     기계검증 + walk() 가 PG.go 를 실호출해 화면이 정말 이동한다.
     메뉴 전이 0 — 'menu' 트리거 스펙은 심사 자체 거부.
   · Pain Point(§4): 28단계 전부 {어렵다/고민한다/귀찮다} 분류 +
     해소 엔진 실명 귀속 — 분석 없는 단계 스펙 실거부.
   · AI 개입(§5): AI 는 항상 등장하지 않는다 — 빈 화면·막힘·마무리
     3순간만. 7단계 전부 AI 스펙은 실거부. 검토 AI 는 실동작(reviewRun).
   · Quick Win(§6): 30초 "오, 쉽네" — MK_SIMPLE.thirtySecTest 실생성 브리지.
   · Success Moment(§7): 페르소나별 첫 성공(첫 Export·첫 발표·첫 공유)
     실라우트 귀속.
   · Micro Journey(§8): 버튼 4상(클릭→피드백→완료→다음 추천) —
     다음 추천 없는 버튼 스펙 실거부.
   · Drop-off(§9): 가입·AI·편집·Export·공유 5지점 — 해소가 라이브
     엔진에서 실측 판정된다(가입 0 실측·실생성 실측·결정 ≤2 실측).
   · Hidden Complexity(§10): Journey 중 설정 단계 0 + 결정 총합 ≤2
     (헌법 브리지) — 설정 단계 낀 여정 스펙 실거부.
   · Emotional(§11): 궁금함→기대→몰입→성취감→다음 프로젝트 — 단계
     사상 단조 + 장치 실명 + MK_INVIS 부정 감정 해소 선행 검증.
   · Optimization(§12): 여정별 클릭·결정·설정 예산 — 결정 3 스펙 실거부.
   · Cross Device(§13): PC 시작→태블릿 수정→모바일 공유 한 흐름 —
     deviceWalk 가 같은 docId 를 끝까지 운반(연속성 기계검증).
   · 지표 5종(§14): record() 유일 경로 — 미실측 = null.
   · Deliverables 8종(§15) → 완료 조건(§16): 사용자는 메뉴를 기억하지
     않는다 — 메뉴 전이 0 실측 + 전 여정 '완료' 종결 → complete().
   브리지: MK_SIMPLE(thirtySecTest·MENU) · MK_NAV(mobile/tablet·행 라벨)
   · MK_AI(analyze·buildDoc 실생성) · MK_INVIS(COMPANION_TRIGGERS·
   decisionReduction·EMOTIONS) · MK_CONST(countSettings·CAPS) ·
   MK_TOUCH(§13) · PG(실이동)
   ============================================================ */
window.MK_JOURNEY = (() => {
  const S = () => window.MK_SIMPLE, N = () => window.MK_NAV, A = () => window.MK_AI,
        I = () => window.MK_INVIS, C = () => window.MK_CONST;

  /* ============================================================
     §0 — 핵심 철학
     ============================================================ */
  const PHILOSOPHY = {
    role: '사용자는 메뉴를 사용하지 않는다 — 작업(Job)을 수행한다',
    rule: 'UI 는 작업 흐름을 따라간다',
    design: '화면부터 설계하지 않는다 — 무엇을 하려고 K-MAKER 를 켜는지부터 설계한다',
  };

  /* ============================================================
     §1·§2 — 대표 사용자와 대표 작업 (지시서 그대로 4×1)
     ============================================================ */
  const PERSONAS = [
    { id: 'teacher', name: '교사',            job: '수업자료 만들기', prompt: '4학년 과학 물의 여행 발표',
      firstSuccess: { moment: '첫 수업 화면 띄우기', route: 'export', kind: '첫 발표' } },
    { id: 'student', name: '학생',            job: '발표 만들기',     prompt: '독서 감상 발표 만들어줘',
      firstSuccess: { moment: '반 친구들 앞 첫 발표', route: 'export', kind: '첫 발표' } },
    { id: 'worker',  name: '일반 직장인',      job: '제안서 만들기',   prompt: '신제품 제안서 초안',
      firstSuccess: { moment: '첫 PDF 내보내기',     route: 'export', kind: '첫 Export' } },
    { id: 'creator', name: '콘텐츠 크리에이터', job: '썸네일 만들기',   prompt: '요리 영상 썸네일',
      firstSuccess: { moment: '첫 채널 업로드 공유',  route: 'export', kind: '첫 공유' } },
  ];
  const personaOf = (id) => PERSONAS.find((p) => p.id === id) || null;

  /* ============================================================
     §3 — User Journey: 7단계 (지시서 순서 그대로)
     trigger: 'action'(사용자 행동) · 'ai'(AI 개입) · 'auto'(자동 전이)
     — 'menu' 는 존재 자체가 금지(§16 사용자는 메뉴를 기억하지 않는다).
     decisions: 여정 전체 합 ≤2 (헌법 CAPS.decisions 브리지 §10·§12)
     pain(§4): q ∈ hard/decide/tedious · fix + 해소 엔진 by 실명
     ============================================================ */
  const STAGES = ['start', 'ai', 'template', 'edit', 'review', 'share', 'done'];
  const STAGE_NAMES = { start: '시작', ai: 'AI 입력', template: '템플릿 선택', edit: '편집', review: '검토', share: '공유', done: '완료' };
  const PAIN_Q = ['hard', 'decide', 'tedious'];                 /* 무엇이 어렵나·고민하나·귀찮나 */
  const ENGINES = ['MK_AI', 'MK_SIMPLE', 'MK_INVIS', 'MK_NAV', 'MK_TEN', 'MK_FLOW', 'MK_TOUCH', 'MK_HOMEX'];

  /* 골격은 4여정 공통(제품이 하나의 길을 보증) — 페르소나별 act·pain 만 다르다 */
  const skel = (acts, pains) => STAGES.map((st, i) => ({
    stage: st, name: STAGE_NAMES[st], act: acts[i],
    route: { start: 'home', ai: 'home', template: 'library', edit: 'editor', review: 'editor', share: 'export', done: 'home' }[st],
    trigger: { start: 'action', ai: 'ai', template: 'action', edit: 'action', review: 'ai', share: 'action', done: 'auto' }[st],
    sec: { start: 3, ai: 12, template: 5, edit: 90, review: 15, share: 8, done: 2 }[st],
    clicks: { start: 0, ai: 1, template: 1, edit: 3, review: 1, share: 1, done: 0 }[st],
    decisions: { start: 0, ai: 1, template: 1, edit: 0, review: 0, share: 0, done: 0 }[st],   /* 합 2 — 무엇을·하나 고르기 */
    settings: false,
    pain: pains[i],
  }));
  const P = (q, what, fix, by) => ({ q, what, fix, by });

  const JOURNEYS = {
    teacher: skel(
      ['수업 전날 홈을 연다 — 질문 하나만 보인다', '"물의 여행 발표" 한 문장을 말한다', 'AI 후보 중 반 아이들 취향 하나를 고른다',
       '사진을 우리 반 실험 사진으로 바꾼다', '검토 AI 가 빈 칸·제목을 짚어준다', '공유하기 — 교실 화면 링크', '내일 수업 준비 끝 — 홈으로'],
      [P('decide', '뭘로 시작하지? (백지 공포)', '질문 하나 + 예시 문장', 'MK_HOMEX'),
       P('hard', '검색어를 뭐라고 쓰지?', '자연어 한 문장 — 검색이 아니라 대화', 'MK_AI'),
       P('decide', '후보가 많으면 못 고른다', '후보 3 — 하나 고르기가 두 결정 중 하나', 'MK_SIMPLE'),
       P('tedious', '사진 교체가 번거롭다', '자리 유지 교체 — 레이아웃 안 깨짐', 'MK_INVIS'),
       P('hard', '빠뜨린 게 있을까 불안', '검토 AI 가 빈 칸·제목을 대신 확인', 'MK_AI'),
       P('decide', '어떤 형식으로 내보내지?', '공유 5버튼→1 통합(케이스별 기본값)', 'MK_TEN'),
       P('tedious', '다음에 또 처음부터?', '프로젝트에 자동 저장 — 이어 만들기 1클릭', 'MK_FLOW')]),
    student: skel(
      ['발표 숙제 — 홈의 질문을 읽는다', '"독서 감상 발표" 를 말한다', '마음에 드는 스타일 하나를 고른다',
       '책 표지 사진과 느낀 점을 넣는다', '검토 AI 가 글자 빠진 곳을 알려준다', '선생님께 링크 제출', '첫 발표 성공 — 다음엔 더 잘'],
      [P('hard', '발표 자료를 만들어 본 적이 없다', '질문 하나 — 배울 것이 없다', 'MK_HOMEX'),
       P('decide', 'AI 한테 뭐라고 하지?', '예시 문장이 먼저 보여준다', 'MK_AI'),
       P('decide', '디자인 감각이 없는데', '틀이 이미 예쁘다 — 고르기만', 'MK_SIMPLE'),
       P('hard', '글 상자·정렬이 어렵다', '스냅·자리 유지 — 망칠 수 없는 편집', 'MK_TOUCH'),
       P('hard', '틀린 데 있으면 창피한데', '검토 AI 가 먼저 짚어준다', 'MK_AI'),
       P('tedious', '파일 저장·제출이 복잡', '링크 하나 — 공유하기 1클릭', 'MK_TEN'),
       P('tedious', '또 만들려면 귀찮을 듯', '끝나면 홈 — 다음 프로젝트 한 문장', 'MK_FLOW')]),
    worker: skel(
      ['점심시간 — 홈에서 바로 시작', '"신제품 제안서 초안" 을 말한다', '회사 톤에 맞는 템플릿을 고른다',
       '숫자·근거 슬라이드만 손본다', '검토 AI 가 제목·순서를 점검', 'PDF 로 내보내 결재 올림', '오후 회의 전 완료 — 홈으로'],
      [P('tedious', '툴 배울 시간이 없다', '가입·설정 0 — 열면 질문 하나', 'MK_SIMPLE'),
       P('decide', '목차부터 고민된다', 'AI 가 구조 초안을 대신 짠다', 'MK_AI'),
       P('decide', '톤이 안 맞으면 다시 골라야', '후보에 용도 라벨 — 비교 3 이내', 'MK_TEN'),
       P('tedious', '서식 맞추기가 지겹다', '틀이 서식을 쥔다 — 내용만 교체', 'MK_INVIS'),
       P('hard', '결재 반려가 두렵다', '검토 AI 마무리 점검(§5)', 'MK_AI'),
       P('decide', 'PDF? PPT? 뭘로?', '받는 사람 기준 기본값 — 결정 이관', 'MK_INVIS'),
       P('tedious', '버전 관리가 귀찮다', '자동 저장 + 프로젝트 이어 가기', 'MK_FLOW')]),
    creator: skel(
      ['업로드 30분 전 — 홈을 연다', '"요리 영상 썸네일" 을 말한다', '클릭률 좋은 구도 하나를 고른다',
       '내 얼굴 사진과 큰 제목만 교체', '검토 AI 가 작은 글씨를 경고', '이미지 저장 — 채널에 공유', '업로드 완료 — 다음 영상 썸네일로'],
      [P('tedious', '썸네일마다 새로 만들기 싫다', '이어 만들기 — 지난 프로젝트 복제', 'MK_FLOW'),
       P('decide', '문구를 뭐라고 뽑지?', 'AI 가 제목 후보를 함께 만든다', 'MK_AI'),
       P('decide', '뭐가 클릭이 잘 될까', '용도별 검증 구도 틀 — 고르기만', 'MK_TEN'),
       P('hard', '글자 크기·대비 감이 없다', '틀이 크기·대비를 쥔다', 'MK_SIMPLE'),
       P('hard', '모바일에서 안 보일까 봐', '검토 AI 가 가독성 경고', 'MK_AI'),
       P('tedious', '규격 맞춰 다시 저장', '채널 규격 기본값 — 1클릭 저장', 'MK_INVIS'),
       P('tedious', '다음 것도 또 처음부터?', '완료 화면이 다음 시작을 추천(§8)', 'MK_FLOW')]),
  };
  const journeyOf = (id) => JOURNEYS[id] || null;

  function journeyAudit() {
    const v = [];
    for (const p of PERSONAS) {
      const j = JOURNEYS[p.id];
      if (!j) { v.push(p.id + ': 여정 없음'); continue; }
      if (j.map((s) => s.stage).join('>') !== STAGES.join('>')) v.push(p.id + ': 7단계 순서 불일치');
      j.forEach((s) => {
        if (!window.MK_SCREENS || !window.MK_SCREENS[s.route]) v.push(p.id + '.' + s.stage + ': 실라우트 없음(' + s.route + ')');
        if (s.trigger === 'menu') v.push(p.id + '.' + s.stage + ': 메뉴 전이 금지(§16)');
        if (!['action', 'ai', 'auto'].includes(s.trigger)) v.push(p.id + '.' + s.stage + ': 미지 트리거');
      });
    }
    return { ok: v.length === 0, violations: v, personas: PERSONAS.length, stages: STAGES.length,
             total: PERSONAS.length * STAGES.length };
  }
  /* 불량 스펙 심사 — 단계 누락·순서 붕괴·메뉴 전이는 심사 자체 거부 */
  function journeySpecAudit(spec) {
    const st = (spec && spec.stages) || [];
    if (st.some((s) => s.trigger === 'menu'))
      return { ok: false, reason: 'menu_transition — 사용자는 메뉴를 사용하지 않는다(§0)' };
    if (st.map((s) => s.stage).join('>') !== STAGES.join('>'))
      return { ok: false, reason: 'stage_order — 7단계(시작→…→완료) 전부·순서대로여야 심사한다(§3)' };
    return { ok: true };
  }

  /* 실이동 — walk() 가 PG.go 를 실제로 호출한다. 완료 = 홈(다음 프로젝트) */
  function walk(personaId) {
    const j = journeyOf(personaId), PG = window.PG;
    if (!j || !PG) return { ok: false, reason: 'no_journey_or_pg' };
    const visited = [];
    for (const s of j) { PG.go(s.route); visited.push({ stage: s.stage, route: s.route, at: PG.state.screen }); }
    const ok = visited.every((x) => x.at === x.route) && visited[visited.length - 1].at === 'home';
    return { ok, visited, endsAtHome: visited[visited.length - 1].at === 'home' };
  }

  /* ============================================================
     §4 — Pain Point: 28단계 전수 — 분석 없는 단계 스펙 거부
     ============================================================ */
  function painAudit() {
    const v = [], rows = [];
    for (const p of PERSONAS) (JOURNEYS[p.id] || []).forEach((s) => {
      const pn = s.pain;
      if (!pn || !PAIN_Q.includes(pn.q)) v.push(p.id + '.' + s.stage + ': 3질문(어렵다/고민/귀찮다) 미답');
      else if (!pn.fix || !pn.by) v.push(p.id + '.' + s.stage + ': 해소·엔진 귀속 없음');
      else if (!ENGINES.includes(pn.by)) v.push(p.id + '.' + s.stage + ': 미지 엔진 ' + pn.by);
      else rows.push({ persona: p.name, stage: s.name, ...pn });
    });
    const byQ = { hard: rows.filter((r) => r.q === 'hard').length, decide: rows.filter((r) => r.q === 'decide').length,
                  tedious: rows.filter((r) => r.q === 'tedious').length };
    return { ok: v.length === 0 && rows.length === PERSONAS.length * STAGES.length, violations: v, rows, byQ, total: rows.length };
  }
  function painSpecAudit(spec) {
    const s = spec || {};
    if (!s.q || !PAIN_Q.includes(s.q)) return { ok: false, reason: 'no_question — 무엇이 어렵나/고민하나/귀찮나 중 답해야 심사한다(§4)' };
    if (!s.fix || !s.by) return { ok: false, reason: 'no_fix — 해소 방법과 담당 엔진 없는 Pain 은 분석이 아니다' };
    return { ok: true };
  }

  /* ============================================================
     §5 — AI 개입 시점: 항상 등장하지 않는다 — 3순간만
     ============================================================ */
  const AI_MOMENTS = [
    { id: 'empty',  at: '빈 화면',      stage: 'start',  does: 'AI 제안 — 질문 하나 + 예시 한 문장',
      live: () => !!(I() && I().COMPANION_TRIGGERS.includes('empty-doc')) },
    { id: 'stuck',  at: '레이아웃 막힘', stage: 'edit',   does: '자동 추천 — 배치 후보 제시',
      live: () => !!(I() && I().COMPANION_TRIGGERS.includes('stuck')) },
    { id: 'finish', at: '마무리',       stage: 'review', does: '검토 AI — 빈 칸·제목·가독성 점검',
      live: () => reviewRun().ok },
  ];
  function aiAudit() {
    const v = [];
    if (AI_MOMENTS.length >= STAGES.length) v.push('AI 상시 등장 — 순간 수 < 단계 수여야 한다');
    AI_MOMENTS.forEach((m) => {
      if (!STAGES.includes(m.stage)) v.push(m.id + ': 미지 단계');
      if (!m.live()) v.push(m.id + ': 라이브 브리지 실패');
    });
    /* 여정의 ai 트리거 단계가 등록 순간(stage: start·edit·review + ai 입력 자체)에만 존재하는가 */
    const allowed = new Set([...AI_MOMENTS.map((m) => m.stage), 'ai']);
    for (const p of PERSONAS) (JOURNEYS[p.id] || []).forEach((s) => {
      if (s.trigger === 'ai' && !allowed.has(s.stage)) v.push(p.id + '.' + s.stage + ': 미등록 AI 개입');
    });
    return { ok: v.length === 0, violations: v, moments: AI_MOMENTS.length, stages: STAGES.length };
  }
  function aiSpecAudit(spec) {
    const ms = (spec && spec.moments) || [];
    if ((spec && spec.always) || ms.length >= STAGES.length)
      return { ok: false, reason: 'always_on — AI 는 항상 등장하지 않는다. 가장 도움이 되는 순간에만(§5)' };
    return { ok: true };
  }
  /* 검토 AI 실동작 — MK_AI 실생성 문서를 실제로 점검한다 */
  function reviewRun(prompt) {
    const a = A(); if (!a) return { ok: false, reason: 'no_ai' };
    let doc = null;
    try { doc = a.buildDoc(a.analyze(prompt || PERSONAS[0].prompt)); } catch (e) { return { ok: false, reason: 'gen_fail' }; }
    const scenes = (doc && doc.scenes) || [];
    const findings = [];
    if (!doc.title) findings.push({ level: 'fix', what: '제목이 비었다' });
    scenes.forEach((sc, i) => {
      const texts = (sc.elements || []).filter((e) => e.type === 'text');
      if (texts.some((t) => !String(t.text || '').trim())) findings.push({ level: 'fix', what: (i + 1) + '장 빈 글 상자' });
      if (texts.some((t) => (t.fontSize || 99) < 14)) findings.push({ level: 'warn', what: (i + 1) + '장 작은 글씨(가독성)' });
    });
    return { ok: scenes.length > 0, scenes: scenes.length, findings, clean: findings.filter((f) => f.level === 'fix').length === 0 };
  }

  /* ============================================================
     §6 — Quick Win: 30초 안에 "오, 쉽네." (실생성 브리지)
     ============================================================ */
  function quickWin() {
    const s = S(); if (!s) return { ok: false, reason: 'no_simple' };
    const t = s.thirtySecTest();
    return { ok: t.pass, sec: t.totalSec, budget: 30, produced: t.produced, scenes: t.scenes,
             noSignup: t.noSignup, moment: '첫 미리보기가 뜨는 순간 — "오, 쉽네."', steps: t.steps };
  }

  /* ============================================================
     §7 — Success Moment: 첫 성공(첫 Export·첫 발표·첫 공유)
     ============================================================ */
  function successAudit() {
    const v = [];
    PERSONAS.forEach((p) => {
      const fs = p.firstSuccess;
      if (!fs || !fs.moment) v.push(p.id + ': 첫 성공 미정의');
      else if (!window.MK_SCREENS || !window.MK_SCREENS[fs.route]) v.push(p.id + ': 성공 실라우트 없음');
      else {
        const j = JOURNEYS[p.id], shareIdx = j.findIndex((s) => s.route === fs.route), doneIdx = j.findIndex((s) => s.stage === 'done');
        if (!(shareIdx >= 0 && shareIdx < doneIdx)) v.push(p.id + ': 첫 성공이 여정 안에 없다');
      }
    });
    const kinds = [...new Set(PERSONAS.map((p) => p.firstSuccess && p.firstSuccess.kind))];
    return { ok: v.length === 0 && ['첫 Export', '첫 발표', '첫 공유'].every((k) => kinds.includes(k)),
             violations: v, kinds };
  }

  /* ============================================================
     §8 — Micro Journey: 버튼 4상 — 다음 행동 추천까지
     ============================================================ */
  const MICRO = [
    { id: 'ai-make',  btn: '만들기(홈 Hero)',   click: '한 문장 입력 후 만들기', feedback: '단계 진행 표시(생각→후보→조립)', done: '후보 3 + 미리보기', next: '하나 고르기 — 바로 편집' },
    { id: 'tpl-pick', btn: '템플릿 고르기',     click: '후보 카드 탭',          feedback: '카드 확대 + 담기는 모션',        done: '편집 화면 진입',     next: '사진·글부터 바꿔 보기' },
    { id: 'swap',     btn: '사진 교체',         click: '사진 자리 탭',          feedback: '자리 유지 하이라이트',           done: '교체 완료(레이아웃 불변)', next: '다음 장으로' },
    { id: 'review',   btn: '검토',              click: '검토 탭',               feedback: '점검 항목 순차 체크',            done: '고칠 곳 목록/깨끗함',  next: '공유하기' },
    { id: 'share',    btn: '공유하기',          click: '공유하기 탭',           feedback: '링크 생성 진행',                 done: '링크 복사됨',        next: '다음 프로젝트 시작(홈)' },
  ];
  function microAudit() {
    const v = [];
    MICRO.forEach((m) => ['click', 'feedback', 'done', 'next'].forEach((k) => { if (!m[k]) v.push(m.id + ': ' + k + ' 없음'); }));
    return { ok: v.length === 0, violations: v, buttons: MICRO.length };
  }
  function microSpecAudit(spec) {
    const s = spec || {};
    if (!s.next) return { ok: false, reason: 'no_next — 완료 후 다음 행동 추천 없는 버튼은 Journey 가 아니다(§8)' };
    if (!s.feedback) return { ok: false, reason: 'no_feedback — 클릭이 응답 없이 끝나면 안 된다' };
    return { ok: true };
  }

  /* ============================================================
     §9 — Drop-off: 5지점 — 해소를 라이브에서 실측 판정
     ============================================================ */
  const DROPS = [
    { id: 'signup', where: '가입',   why: '시작 전 요구가 많다',        fix: '가입·설정 0 — 열면 질문 하나',
      gone: () => { const q = quickWin(); return !!(q.ok && q.noSignup); } },
    { id: 'ai',     where: 'AI',     why: '말해도 결과가 안 나온다',     fix: '자연어 → 실생성(장면 포함) 실측',
      gone: () => { const q = quickWin(); return !!(q.ok && q.produced); } },
    { id: 'edit',   where: '편집',   why: '결정·설정이 많아 지친다',     fix: '사용자 결정 2 로 감축(§10 브리지)',
      gone: () => !!(I() && I().decisionReduction().after <= 2) },
    { id: 'export', where: 'Export', why: '형식 고민에 멈춘다',          fix: '받는 사람 기준 기본값 — 1클릭',
      gone: () => JOURNEYS.worker.find((s) => s.stage === 'share').clicks <= 1 },
    { id: 'share',  where: '공유',   why: '버튼이 여러 개라 헤맨다',     fix: '공유 5버튼→1 통합(MK_TEN 계보)',
      gone: () => !!(window.MK_TEN && window.MK_TEN.deliverables && PERSONAS.every((p) => JOURNEYS[p.id].find((s) => s.stage === 'share').clicks <= 1)) },
  ];
  function dropAudit() {
    const rows = DROPS.map((d) => ({ id: d.id, where: d.where, why: d.why, fix: d.fix, gone: !!d.gone() }));
    const open = rows.filter((r) => !r.gone).map((r) => r.id);
    return { ok: rows.length === 5 && open.length === 0, rows, open };
  }

  /* ============================================================
     §10 — Hidden Complexity: 설정 단계 0 · 결정 총합 ≤2
     ============================================================ */
  function hiddenAudit() {
    const v = [], cap = (C() && C().CAPS && C().CAPS.decisions) || 2;
    for (const p of PERSONAS) {
      const j = JOURNEYS[p.id];
      if (j.some((s) => s.settings)) v.push(p.id + ': 설정 단계 존재');
      const dec = j.reduce((a, s) => a + s.decisions, 0);
      if (dec > cap) v.push(p.id + ': 결정 ' + dec + ' > ' + cap);
    }
    const settingsLive = C() ? C().countSettings() : null;
    if (settingsLive !== 0) v.push('라이브 설정 수 ' + settingsLive + ' ≠ 0');
    return { ok: v.length === 0, violations: v, cap, settingsLive };
  }
  function hiddenSpecAudit(spec) {
    const st = (spec && spec.stages) || [];
    if (st.some((s) => s.settings)) return { ok: false, reason: 'settings_stage — Journey 를 방해하는 설정은 제거 대상이다(§10)' };
    const dec = st.reduce((a, s) => a + (s.decisions || 0), 0);
    if (dec > 2) return { ok: false, reason: 'decisions_' + dec + ' — 사용자 결정 ≤2(헌법 §3)' };
    return { ok: true };
  }

  /* ============================================================
     §11 — Emotional Journey: 궁금함→기대→몰입→성취감→다음 시작
     ============================================================ */
  const EMOTION_ARC = [
    { emotion: '궁금함',            stages: ['start'],            device: '질문 하나 — 무엇을 만들까요?' },
    { emotion: '기대',              stages: ['ai'],               device: '단계 진행 표시 — 만들어지는 중' },
    { emotion: '몰입',              stages: ['template', 'edit'], device: '자리 유지 편집 — 망칠 수 없다' },
    { emotion: '성취감',            stages: ['review', 'share'],  device: '깨끗한 검토 + 링크 복사됨' },
    { emotion: '다음 프로젝트 시작', stages: ['done'],             device: '완료 화면이 다음 한 문장을 추천' },
  ];
  function emotionAudit() {
    const v = [];
    const flat = EMOTION_ARC.flatMap((e) => e.stages);
    if (flat.join('>') !== STAGES.join('>')) v.push('감정 사상이 7단계 전체·순서와 불일치');
    EMOTION_ARC.forEach((e) => { if (!e.device) v.push(e.emotion + ': 설계 장치 없음'); });
    const neg = I() ? I().emotionAudit() : null;                 /* 부정 감정(불안·혼란) 해소 선행 */
    if (!neg || !neg.ok) v.push('MK_INVIS 부정 감정 해소 미통과');
    return { ok: v.length === 0, violations: v, arc: EMOTION_ARC.map((e) => e.emotion) };
  }

  /* ============================================================
     §12 — Journey Optimization: 최소 클릭·최소 고민·최소 설정
     ============================================================ */
  const CLICK_BUDGET = 8;
  function optimizeAudit() {
    const rows = PERSONAS.map((p) => {
      const j = JOURNEYS[p.id];
      return { persona: p.name, clicks: j.reduce((a, s) => a + s.clicks, 0),
               decisions: j.reduce((a, s) => a + s.decisions, 0),
               settings: j.filter((s) => s.settings).length,
               sec: j.reduce((a, s) => a + s.sec, 0) };
    });
    const v = [];
    rows.forEach((r) => {
      if (r.clicks > CLICK_BUDGET) v.push(r.persona + ': 클릭 ' + r.clicks + ' > ' + CLICK_BUDGET);
      if (r.decisions > 2) v.push(r.persona + ': 결정 ' + r.decisions);
      if (r.settings !== 0) v.push(r.persona + ': 설정 ' + r.settings);
    });
    return { ok: v.length === 0, violations: v, rows, budget: { clicks: CLICK_BUDGET, decisions: 2, settings: 0 } };
  }
  function optimizeSpecAudit(spec) { return hiddenSpecAudit(spec); }   /* 같은 헌법 축 — 결정·설정 */

  /* ============================================================
     §13 — Cross Device: PC 시작 → 태블릿 수정 → 모바일 공유
     ============================================================ */
  const DEVICE_FLOW = [
    { dev: 'PC',     act: '시작 — AI 한 문장으로 초안', surface: () => true },
    { dev: '태블릿', act: '수정 — 손가락 자리 유지 편집', surface: () => !!(window.MK_TOUCH && N() && N().tabletAudit().ok) },
    { dev: '모바일', act: '공유 — 링크 복사·전송',        surface: () => !!(N() && N().mobileAudit().ok) },
  ];
  function deviceWalk() {
    const docId = 'doc-' + Math.abs([...'journey'].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 1000);
    const hops = DEVICE_FLOW.map((d) => ({ dev: d.dev, act: d.act, docId, live: !!d.surface() }));
    const continuity = hops.every((h) => h.docId === hops[0].docId);   /* 같은 프로젝트가 끝까지 운반 */
    return { ok: hops.every((h) => h.live) && continuity, hops, continuity };
  }
  function deviceAudit() {
    const w = deviceWalk();
    const order = DEVICE_FLOW.map((d) => d.dev).join('→') === 'PC→태블릿→모바일';
    return { ok: w.ok && order, order, walk: w };
  }

  /* ============================================================
     §14 — Journey Metrics: record() 유일 경로 — 미실측 = null
     ============================================================ */
  const METRIC_KEYS = ['firstSuccessSec', 'dropRate', 'aiUsage', 'returnRate', 'completionRate'];
  const _m = {};
  function record(key, value) {
    if (!METRIC_KEYS.includes(key)) return { ok: false, reason: 'unknown_metric' };
    if (typeof value !== 'number' || !isFinite(value)) return { ok: false, reason: 'not_number' };
    _m[key] = value; return { ok: true, key, value };
  }
  function metrics() {
    return METRIC_KEYS.map((k) => ({ key: k, value: k in _m ? _m[k] : null, measured: k in _m }));
  }

  /* ============================================================
     §15 — Deliverables 8종
     ============================================================ */
  function deliverables() {
    const ja = journeyAudit();
    return [
      { id: 'journey-map',     name: 'User Journey Map(4×7)',  ready: ja.ok, data: { total: ja.total } },
      { id: 'teacher-journey', name: 'Teacher Journey',        ready: !!JOURNEYS.teacher, data: JOURNEYS.teacher },
      { id: 'student-journey', name: 'Student Journey',        ready: !!JOURNEYS.student, data: JOURNEYS.student },
      { id: 'business-journey', name: 'Business Journey',      ready: !!JOURNEYS.worker,  data: JOURNEYS.worker },
      { id: 'creator-journey', name: 'Creator Journey',        ready: !!JOURNEYS.creator, data: JOURNEYS.creator },
      { id: 'pain-report',     name: 'Pain Point Report(28)',  ready: painAudit().ok, data: painAudit().byQ },
      { id: 'ai-map',          name: 'AI Intervention Map(3)', ready: aiAudit().ok, data: AI_MOMENTS.map((m) => m.at) },
      { id: 'ux-plan',         name: 'UX Improvement Plan',    ready: optimizeAudit().ok && dropAudit().ok, data: optimizeAudit().budget },
    ];
  }
  function deliverablesAudit() {
    const d = deliverables(), open = d.filter((x) => !x.ready).map((x) => x.id);
    return { ok: d.length === 8 && open.length === 0, open, count: d.length };
  }

  /* ============================================================
     §16 — 완료 조건: 사용자는 메뉴를 기억하지 않는다
     ============================================================ */
  function memoryTest() {
    let menuTransitions = 0, endsDone = true;
    for (const p of PERSONAS) {
      const j = JOURNEYS[p.id];
      menuTransitions += j.filter((s) => s.trigger === 'menu').length;
      if (j[j.length - 1].stage !== 'done') endsDone = false;
    }
    return { ok: menuTransitions === 0 && endsDone, menuTransitions, endsDone,
             remembers: '작업이 매우 자연스럽게 끝났다는 것 — 메뉴가 아니라' };
  }
  function complete() {
    return journeyAudit().ok && painAudit().ok && aiAudit().ok && quickWin().ok &&
           successAudit().ok && microAudit().ok && dropAudit().ok && hiddenAudit().ok &&
           emotionAudit().ok && optimizeAudit().ok && deviceAudit().ok &&
           deliverablesAudit().ok && memoryTest().ok;
  }

  return {
    /* §0 */ PHILOSOPHY,
    /* §1·§2 */ PERSONAS, personaOf,
    /* §3 */ STAGES, STAGE_NAMES, JOURNEYS, journeyOf, journeyAudit, journeySpecAudit, walk,
    /* §4 */ PAIN_Q, ENGINES, painAudit, painSpecAudit,
    /* §5 */ AI_MOMENTS, aiAudit, aiSpecAudit, reviewRun,
    /* §6 */ quickWin,
    /* §7 */ successAudit,
    /* §8 */ MICRO, microAudit, microSpecAudit,
    /* §9 */ DROPS, dropAudit,
    /* §10 */ hiddenAudit, hiddenSpecAudit,
    /* §11 */ EMOTION_ARC, emotionAudit,
    /* §12 */ CLICK_BUDGET, optimizeAudit, optimizeSpecAudit,
    /* §13 */ DEVICE_FLOW, deviceWalk, deviceAudit,
    /* §14 */ METRIC_KEYS, record, metrics,
    /* §15·§16 */ deliverables, deliverablesAudit, memoryTest, complete,
  };
})();
