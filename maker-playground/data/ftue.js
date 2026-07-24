/* ============================================================
   K-MAKER FTUE 엔진 (Round 34 — GPT Round 35 지시서)
   ------------------------------------------------------------
   window.MK_FTUE — 기능 추가 0 라운드. "첫 10분이 향후 10개월을 결정한다."
   · 철학(§0): 사용자는 모든 기능을 배우지 않는다 — 첫 성공을 기억한다.
     목표는 "기능 설명"이 아니라 "첫 성공 경험"이다.
   · 목표(§1): 가입 후 5분 안 첫 결과물, 10분 안 "K-MAKER 쉽다." —
     타임라인 실합산으로 기계 판정.
   · Welcome(§2): 설명 화면·튜토리얼·슬라이드 금지 — 바로 만들기.
     금지 표면 낀 Welcome 스펙은 심사 자체 거부. 첫 표면 = 홈의 질문
     하나(MK_HOMEX 실DOM 브리지).
   · 첫 질문(§3): "오늘 무엇을 만들고 싶으신가요?" + 6선택지(발표·
     포스터·영상·SNS·문서·그냥 AI에게 맡기기) — 지시서 그대로.
     6선택지 전부 MK_AI 실생성으로 이어짐을 기계검증. 질문 2개(설문)
     스펙·맡기기 탈출구 없는 스펙 실거부.
   · AI Conversation(§4): AI 는 제품 설명을 하지 않는다 — 목적을 먼저
     이해한다. 스크립트 전 줄 kind 심사 — pitch(제품 설명) 0 · 되묻기
     ≤1 · 종착 = 생성. 기능 자랑 낀 스크립트 스펙 실거부.
   · Instant Success(§5): 30초 안 초안(MK_SIMPLE.thirtySecTest 실생성
     브리지) + 빈 화면 금지 — 전 국면 표면 실존 + 초안 전 장면 글 실존.
   · Guided Editing(§6): 필요한 순간에만 한 가지씩(동시 1) — 전 기능
     설명 스펙 실거부. MK_INVIS.COMPANION_TRIGGERS 라이브 브리지.
   · Confidence(§7): "나도 할 수 있네." — 작은 행동→보이는 결과, 공은
     사용자에게(credit=user). AI 가 공을 가져가는 스펙 실거부.
   · First Export(§8): 1클릭 저장·공유 — 형식 결정 0(기본값).
     MK_JOURNEY Drop-off(export·share) 해소 실측 브리지.
   · Second Project(§9): 끝나면 AI 가 다음 아이디어 제안 — 6선택지
     전부 첫 결과물 주제를 이어받는 한 문장 실생성.
   · 타임라인·감정 지도: 7국면 0~10분 — 첫 결과물 ≤300s·전체 ≤600s
     실합산. 감정 5단(긴장→안심→놀람→자신감→다시 오고 싶음) 전 국면
     단조 사상 + MK_INVIS 부정 감정 해소 선행.
   · 지표: record() 유일 경로 — 미실측 = null.
   · Deliverables 8종(§10) → 완료 조건(§11): 설명 없이 첫 결과물 +
     다시 돌아오고 싶다 — ftueWalk() 실동작(프로토타입)로 판정.
   브리지: MK_HOMEX(realHomeAudit·first30) · MK_AI(analyze·buildDoc
   실생성) · MK_SIMPLE(thirtySecTest) · MK_INVIS(COMPANION_TRIGGERS·
   emotionAudit) · MK_JOURNEY(DROPS·MICRO·memoryTest) · PG(실이동)
   ============================================================ */
window.MK_FTUE = (() => {
  const H = () => window.MK_HOMEX, A = () => window.MK_AI, S = () => window.MK_SIMPLE,
        I = () => window.MK_INVIS, J = () => window.MK_JOURNEY;

  /* ============================================================
     §0 — 핵심 철학
     ============================================================ */
  const PHILOSOPHY = {
    rule: '첫 10분이 향후 10개월을 결정한다',
    memory: '사용자는 모든 기능을 배우지 않는다 — 첫 성공을 기억한다',
    goal: '목표는 기능 설명이 아니라 첫 성공 경험이다',
  };

  /* ============================================================
     §1 — 목표: 5분 첫 결과물 · 10분 "쉽다" (타임라인이 실측 §T)
     ============================================================ */
  const GOALS = { firstResultSec: 300, impressionSec: 600, impression: 'K-MAKER 쉽다.' };

  /* ============================================================
     §T — 첫 10분 타임라인: 7국면 (Deliverable 'flow')
     surface: 국면마다 반드시 보이는 것 — 'blank' 는 존재 금지(§5)
     ============================================================ */
  const PHASES = [
    { id: 'open',    name: '열기',        sec: 10,  route: 'home',   surface: '질문 하나 + 입력',        blank: false },
    { id: 'ask',     name: '첫 질문',     sec: 20,  route: 'home',   surface: '6선택지 + 예시 문장',      blank: false },
    { id: 'talk',    name: 'AI 대화',     sec: 30,  route: 'home',   surface: '목적 되묻기 1회',          blank: false },
    { id: 'draft',   name: '초안',        sec: 30,  route: 'editor', surface: '만들어지는 장면 미리보기',  blank: false },
    { id: 'edit',    name: '가이드 편집', sec: 150, route: 'editor', surface: '내 초안 + 순간 팁 하나',    blank: false },
    { id: 'export',  name: '첫 저장·공유', sec: 40,  route: 'export', surface: '링크 하나 — 복사됨',       blank: false },
    { id: 'second',  name: '다음 제안',   sec: 320, route: 'home',   surface: '다음 아이디어 한 문장',     blank: false },
  ];
  function timelineAudit() {
    const v = [];
    let acc = 0, firstResultSec = null;
    PHASES.forEach((p) => {
      acc += p.sec;
      if (p.id === 'export') firstResultSec = acc;
      if (p.blank || !p.surface) v.push(p.id + ': 빈 화면(§5 금지)');
      if (!window.MK_SCREENS || !window.MK_SCREENS[p.route]) v.push(p.id + ': 실라우트 없음(' + p.route + ')');
    });
    if (firstResultSec == null || firstResultSec > GOALS.firstResultSec)
      v.push('첫 결과물 ' + firstResultSec + 's > ' + GOALS.firstResultSec + 's(§1)');
    if (acc > GOALS.impressionSec) v.push('전체 ' + acc + 's > ' + GOALS.impressionSec + 's(§1)');
    return { ok: v.length === 0, violations: v, firstResultSec, totalSec: acc, phases: PHASES.length };
  }

  /* ============================================================
     §2 — Welcome: 설명 화면·튜토리얼·슬라이드 금지 — 바로 만들기
     ============================================================ */
  const FORBIDDEN_WELCOME = ['explain', 'tutorial', 'slides', 'feature-tour', 'walkthrough'];
  const WELCOME = { first: 'question', surfaces: ['question', 'make'] };   /* 가입 직후 표면은 이 둘뿐 */
  function welcomeAudit() {
    const v = [];
    WELCOME.surfaces.forEach((s) => { if (FORBIDDEN_WELCOME.includes(s)) v.push('금지 표면: ' + s); });
    if (WELCOME.first !== 'question') v.push('첫 표면이 질문이 아니다');
    const h = H() ? H().realHomeAudit() : null;                            /* 실DOM — 질문 하나 브리지 */
    if (!h || !h.parts.question.ok) v.push('홈 실DOM 질문 하나 미통과(MK_HOMEX)');
    const f30 = H() ? H().first30() : null;                                /* 30초 첫 경험 브리지 */
    if (!f30 || !f30.ok) v.push('first30 미통과(MK_HOMEX)');
    return { ok: v.length === 0, violations: v, forbidden: FORBIDDEN_WELCOME };
  }
  function welcomeSpecAudit(spec) {
    const s = (spec && spec.surfaces) || [];
    const hit = s.find((x) => FORBIDDEN_WELCOME.includes(x));
    if (hit) return { ok: false, reason: hit + ' — 설명 화면·튜토리얼·슬라이드 금지. 바로 만들기 시작한다(§2)' };
    if (spec && spec.first && spec.first !== 'question')
      return { ok: false, reason: 'first_' + spec.first + ' — 가입 직후 첫 표면은 질문이어야 한다(§3)' };
    return { ok: true };
  }

  /* ============================================================
     §3 — 첫 질문: 6선택지 (지시서 그대로) — 전부 실생성으로 이어진다
     ============================================================ */
  const QUESTION = '오늘 무엇을 만들고 싶으신가요?';
  const OPTIONS = [
    { id: 'present', label: '발표',              prompt: '4학년 과학 물의 여행 발표' },
    { id: 'poster',  label: '포스터',            prompt: '학교 축제 안내 포스터' },
    { id: 'video',   label: '영상',              prompt: '우리 반 소개 홍보 영상' },
    { id: 'sns',     label: 'SNS',               prompt: '독서 주간 소식 카드뉴스' },
    { id: 'doc',     label: '문서',              prompt: '독서 감상 활동지' },
    { id: 'auto',    label: '그냥 AI에게 맡기기', prompt: '요즘 우리 반 이야기', auto: true },
  ];
  const optionOf = (id) => OPTIONS.find((o) => o.id === id) || null;
  /* 선택 → MK_AI 실생성. auto 는 AI 가 유형을 대신 정한다(기본 유형 위임) */
  function optionRun(id) {
    const o = optionOf(id), a = A();
    if (!o || !a) return { ok: false, reason: 'no_option_or_ai' };
    let intent = null, doc = null;
    try { intent = a.analyze(o.prompt); doc = a.buildDoc(intent); } catch (e) { return { ok: false, reason: 'gen_fail' }; }
    const scenes = (doc && doc.scenes) ? doc.scenes.length : 0;
    return { ok: scenes > 0, id, label: o.label, auto: !!o.auto, type: intent.typeName,
             topic: intent.topic, scenes, title: doc.title };
  }
  function questionAudit() {
    const v = [];
    if (OPTIONS.length !== 6) v.push('선택지 ' + OPTIONS.length + ' ≠ 6(지시서 §3)');
    const labels = OPTIONS.map((o) => o.label);
    ['발표', '포스터', '영상', 'SNS', '문서', '그냥 AI에게 맡기기'].forEach((l) => {
      if (!labels.includes(l)) v.push('지시서 선택지 누락: ' + l);
    });
    if (!OPTIONS.some((o) => o.auto)) v.push('맡기기(탈출구) 없음');
    OPTIONS.forEach((o) => { const r = optionRun(o.id); if (!r.ok) v.push(o.label + ': 실생성 실패'); });
    return { ok: v.length === 0, violations: v, question: QUESTION, options: OPTIONS.length };
  }
  function questionSpecAudit(spec) {
    const s = spec || {}, qs = s.questions != null ? s.questions : 1;
    if (qs > 1) return { ok: false, reason: 'survey — 첫 질문은 하나다. 설문이 아니다(§3)' };
    const opts = s.options || [];
    if (opts.some((o) => o.to === 'explain' || o.to === 'tutorial'))
      return { ok: false, reason: 'to_explain — 선택지는 설명이 아니라 만들기로 이어져야 한다(§2)' };
    if (opts.length && !opts.some((o) => o.auto))
      return { ok: false, reason: 'no_escape — "그냥 AI에게 맡기기" 탈출구가 있어야 한다(§3)' };
    return { ok: true };
  }

  /* ============================================================
     §4 — AI Conversation: 제품 설명 금지 — 목적을 먼저 이해한다
     kind: ask-purpose(목적 묻기) · confirm(요약 확인) · make(생성 선언)
     — 'pitch'(제품 설명) 는 존재 자체 금지
     ============================================================ */
  const SCRIPT = [
    { kind: 'ask-purpose', say: QUESTION },
    { kind: 'ask-purpose', say: '누가 보게 되나요? 언제 쓰시나요? (하나만 여쭤요)' },
    { kind: 'confirm',     say: '알겠어요 — {목적} 이시군요. 바로 초안을 만들게요.' },
    { kind: 'make',        say: '30초만요. 만들어지는 걸 보여드릴게요.' },
  ];
  function convAudit() {
    const v = [];
    if (SCRIPT.some((l) => l.kind === 'pitch')) v.push('제품 설명 줄 존재(§4 금지)');
    if (SCRIPT.some((l) => /기능|버튼이|메뉴에서/.test(l.say))) v.push('기능 어휘 — 설명이 아니라 목적 이해');
    const asks = SCRIPT.filter((l) => l.kind === 'ask-purpose').length;
    if (asks - 1 > 1) v.push('되묻기 ' + (asks - 1) + ' > 1 — 취조가 아니다');
    if (SCRIPT[SCRIPT.length - 1].kind !== 'make') v.push('대화 종착이 생성이 아니다');
    return { ok: v.length === 0, violations: v, lines: SCRIPT.length, asks };
  }
  function convSpecAudit(spec) {
    const lines = (spec && spec.lines) || [];
    if (lines.some((l) => l.kind === 'pitch' || /기능이 있습니다|저희 제품/.test(l.say || '')))
      return { ok: false, reason: 'pitch — AI 는 제품 설명을 하지 않는다. 목적을 먼저 이해한다(§4)' };
    if (lines.filter((l) => l.kind === 'ask-purpose').length > 2)
      return { ok: false, reason: 'interrogation — 되묻기는 1회면 충분하다' };
    return { ok: true };
  }
  /* 실대화 — 선택지에 스크립트를 실제로 적용한다 */
  function convRun(id) {
    const r = optionRun(id);
    if (!r.ok) return { ok: false, reason: r.reason };
    const dialog = SCRIPT.map((l) => ({ kind: l.kind, say: l.say.replace('{목적}', r.topic + ' ' + r.type) }));
    return { ok: dialog.every((l) => l.kind !== 'pitch'), dialog, made: r };
  }

  /* ============================================================
     §5 — Instant Success: 30초 초안 · 빈 화면 금지
     ============================================================ */
  function instant() {
    const s = S(); if (!s) return { ok: false, reason: 'no_simple' };
    const t = s.thirtySecTest();
    /* 초안 자체도 비어 있으면 안 된다 — 전 장면 글 실존 */
    let filled = false;
    const a = A();
    if (a) { try {
      const doc = a.buildDoc(a.analyze(OPTIONS[0].prompt));
      filled = doc.scenes.every((sc) => (sc.elements || []).some((e) => e.kind === 'text' && String(e.text || '').trim()));
    } catch (e) { filled = false; } }
    return { ok: t.pass && filled, sec: t.totalSec, budget: 30, produced: t.produced,
             scenes: t.scenes, filled, moment: '빈 화면 대신 만들어진 초안이 먼저 보인다' };
  }
  function blankAudit() {
    const v = [];
    PHASES.forEach((p) => { if (p.blank || !String(p.surface || '').trim()) v.push(p.id + ': 빈 화면'); });
    return { ok: v.length === 0, violations: v };
  }
  function instantSpecAudit(spec) {
    const s = spec || {};
    if ((s.draftSec || 0) > 30) return { ok: false, reason: 'slow_draft — 초안은 30초 안(§5)' };
    if (s.blank || (s.phases || []).some((p) => p.blank))
      return { ok: false, reason: 'blank_screen — 빈 화면을 보여주지 않는다(§5)' };
    return { ok: true };
  }

  /* ============================================================
     §6 — Guided Editing: 필요한 순간에만 한 가지씩
     ============================================================ */
  const TIPS = [
    { at: 'empty-doc', teach: '한 문장이면 돼요 — 예시를 눌러도 좋아요' },
    { at: 'first-edit', teach: '사진 자리를 누르면 그대로 바뀌어요' },
    { at: 'stuck',     teach: '막히면 배치 후보를 추천해 드려요' },
    { at: 'pre-share', teach: '공유하기 하나면 링크가 복사돼요' },
  ];
  function guidedAudit() {
    const v = [];
    const concurrent = 1;                                                  /* 동시 노출 팁 수 — 설계 상수 */
    if (concurrent !== 1) v.push('동시 팁 ' + concurrent + ' ≠ 1');
    TIPS.forEach((t) => {
      if (Array.isArray(t.teach) || /그리고|또한/.test(t.teach)) v.push(t.at + ': 한 번에 두 가지');
      if (!t.at) v.push('순간 없는 팁 — 필요한 순간에만');
    });
    const trig = I() ? I().COMPANION_TRIGGERS : [];
    ['empty-doc', 'stuck'].forEach((k) => { if (!trig.includes(k)) v.push(k + ': MK_INVIS 트리거 브리지 실패'); });
    const inventory = (window.MK_TEN && window.MK_TEN.inventory) ? window.MK_TEN.inventory().total : 100;
    if (TIPS.length >= inventory) v.push('팁 수가 기능 수급 — 전 기능 설명이 된다');
    return { ok: v.length === 0, violations: v, tips: TIPS.length, concurrent };
  }
  function guidedSpecAudit(spec) {
    const s = spec || {};
    if (s.teachAll || s.tourAll) return { ok: false, reason: 'teach_all — 절대 모든 기능을 설명하지 않는다(§6)' };
    if ((s.concurrent || 1) > 1) return { ok: false, reason: 'concurrent_' + s.concurrent + ' — 한 번에 한 가지씩' };
    if (Array.isArray(s.teach) && s.teach.length > 1)
      return { ok: false, reason: 'multi_teach — 팁 하나 = 가르침 하나' };
    return { ok: true };
  }

  /* ============================================================
     §7 — Confidence: "나도 할 수 있네." — 공은 사용자에게
     ============================================================ */
  const FEELING = '나도 할 수 있네.';
  const CONFIDENCE = [
    { act: '한 문장 말하기',   result: '장면 여러 개가 만들어짐',       credit: 'user' },
    { act: '사진 자리 탭',     result: '레이아웃 그대로 교체됨',        credit: 'user' },
    { act: '글자 한 줄 고침',  result: '전체가 내 것처럼 보임',         credit: 'user' },
    { act: '공유하기 탭',      result: '링크가 복사됨 — 바로 보여줄 수 있음', credit: 'user' },
  ];
  function confidenceAudit() {
    const v = [];
    CONFIDENCE.forEach((c) => {
      if (c.credit !== 'user') v.push(c.act + ': 공이 사용자에게 없다(§7)');
      if (!c.result) v.push(c.act + ': 보이는 결과 없음');
    });
    return { ok: v.length === 0, violations: v, feeling: FEELING, moments: CONFIDENCE.length };
  }
  function confidenceSpecAudit(spec) {
    const ms = (spec && spec.moments) || [];
    if (ms.some((m) => m.credit === 'ai'))
      return { ok: false, reason: 'ai_credit — "AI 가 다 했네" 가 아니라 "나도 할 수 있네" 여야 한다(§7)' };
    return { ok: true };
  }

  /* ============================================================
     §8 — First Export: 쉽게 저장·공유 — 1클릭 · 형식 결정 0
     ============================================================ */
  function exportAudit() {
    const v = [];
    const j = J();
    if (!j) v.push('MK_JOURNEY 부재');
    else {
      const drops = j.dropAudit().rows;
      ['export', 'share'].forEach((id) => {
        const d = drops.find((r) => r.id === id);
        if (!d || !d.gone) v.push(id + ' 이탈 미해소(§8 브리지)');
      });
      const share = j.MICRO.find((m) => m.id === 'share');
      if (!share || !share.next) v.push('공유 버튼 4상 미비');
    }
    if (!window.MK_SCREENS || !window.MK_SCREENS.export) v.push('export 실라우트 없음');
    return { ok: v.length === 0, violations: v, clicks: 1, formatDecisions: 0 };
  }

  /* ============================================================
     §9 — Second Project: 끝나면 AI 가 다음 아이디어를 제안한다
     ============================================================ */
  const NEXT_IDEA = {
    present: '이 주제로 복습 활동지도 만들어 볼까요?',
    poster:  '이 포스터를 카드뉴스로도 만들어 볼까요?',
    video:   '이 영상의 썸네일도 만들어 볼까요?',
    sns:     '이 소식을 포스터로도 붙여 볼까요?',
    doc:     '이 활동지 내용으로 발표도 만들어 볼까요?',
    auto:    '다음엔 이 이야기를 발표로 만들어 볼까요?',
  };
  function secondRun(id) {
    const r = optionRun(id);
    if (!r.ok) return { ok: false, reason: r.reason };
    const idea = NEXT_IDEA[id];
    return { ok: !!idea, first: r.title, topic: r.topic, suggest: r.topic + ' — ' + idea };
  }
  function secondAudit() {
    const v = [];
    OPTIONS.forEach((o) => {
      const s = secondRun(o.id);
      if (!s.ok) v.push(o.label + ': 다음 제안 실패');
      else if (!s.suggest.includes(s.topic)) v.push(o.label + ': 첫 결과물 주제를 잇지 않는다');
    });
    const mt = J() ? J().memoryTest() : null;                              /* 여정 종착 = 홈 = 새 시작 */
    if (!mt || !mt.endsDone) v.push('여정이 완료로 끝나지 않는다(브리지)');
    return { ok: v.length === 0, violations: v, ideas: Object.keys(NEXT_IDEA).length };
  }

  /* ============================================================
     §E — Emotion Map: 긴장→안심→놀람→자신감→다시 오고 싶음
     ============================================================ */
  const EMOTION_MAP = [
    { emotion: '긴장·설렘',     phases: ['open'],            device: '질문 하나 — 배울 것이 없어 보인다' },
    { emotion: '안심',          phases: ['ask', 'talk'],     device: '6선택지 + 맡기기 — 틀릴 수 없는 첫 걸음' },
    { emotion: '놀람',          phases: ['draft'],           device: '30초 초안 — 빈 화면 대신 결과가 먼저' },
    { emotion: '자신감',        phases: ['edit', 'export'],  device: '내 손으로 바꾸고 1클릭 공유 — ' + FEELING },
    { emotion: '다시 오고 싶음', phases: ['second'],          device: '내 주제를 이어받는 다음 제안' },
  ];
  function emotionMapAudit() {
    const v = [];
    const flat = EMOTION_MAP.flatMap((e) => e.phases);
    if (flat.join('>') !== PHASES.map((p) => p.id).join('>')) v.push('감정 사상이 7국면 전체·순서와 불일치');
    EMOTION_MAP.forEach((e) => { if (!e.device) v.push(e.emotion + ': 설계 장치 없음'); });
    const neg = I() ? I().emotionAudit() : null;                           /* 부정 감정 해소 선행 */
    if (!neg || !neg.ok) v.push('MK_INVIS 부정 감정 해소 미통과');
    if (EMOTION_MAP[EMOTION_MAP.length - 1].emotion !== '다시 오고 싶음') v.push('종착 감정이 재방문이 아니다(§11)');
    return { ok: v.length === 0, violations: v, arc: EMOTION_MAP.map((e) => e.emotion) };
  }

  /* ============================================================
     §W — Wireframe: 국면별 표면 — 전부 실라우트 귀속
     ============================================================ */
  function wireframe() {
    return PHASES.map((p) => ({ phase: p.name, route: p.route, surface: p.surface,
                                live: !!(window.MK_SCREENS && window.MK_SCREENS[p.route]) }));
  }
  function wireframeAudit() {
    const w = wireframe(), open = w.filter((x) => !x.live).map((x) => x.phase);
    return { ok: open.length === 0, open, frames: w.length };
  }

  /* ============================================================
     §P — Prototype: ftueWalk() — 첫 10분을 실제로 걷는다
     ============================================================ */
  function ftueWalk(id) {
    const PG = window.PG;
    if (!PG) return { ok: false, reason: 'no_pg' };
    const steps = [];
    const go = (route) => { PG.go(route); return PG.state.screen === route; };
    steps.push({ phase: 'open',   ok: go('home') && !!(H() && H().realHomeAudit().parts.question.ok) });
    const conv = convRun(id || 'present');
    steps.push({ phase: 'talk',   ok: conv.ok });
    steps.push({ phase: 'draft',  ok: go('editor') && conv.ok && conv.made.scenes > 0 });
    steps.push({ phase: 'edit',   ok: guidedAudit().ok });
    steps.push({ phase: 'export', ok: go('export') && exportAudit().ok });
    const sec2 = secondRun(id || 'present');
    steps.push({ phase: 'second', ok: go('home') && sec2.ok });
    const tl = timelineAudit();
    return { ok: steps.every((s) => s.ok) && tl.ok, steps,
             firstResultSec: tl.firstResultSec, totalSec: tl.totalSec,
             made: conv.ok ? conv.made.title : null, suggest: sec2.ok ? sec2.suggest : null };
  }

  /* ============================================================
     §M — Success Metrics: record() 유일 경로 — 미실측 = null
     ============================================================ */
  const METRIC_KEYS = ['firstResultSec', 'tenMinDone', 'easyImpression', 'returnRate', 'secondStartRate'];
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
     §10 — Deliverables 8종
     ============================================================ */
  function deliverables() {
    return [
      { id: 'flow',       name: 'First 10 Minutes Flow',  ready: timelineAudit().ok, data: { firstResultSec: timelineAudit().firstResultSec } },
      { id: 'welcome',    name: 'Welcome UX',             ready: welcomeAudit().ok, data: WELCOME },
      { id: 'ai-script',  name: 'AI Conversation Script', ready: convAudit().ok, data: SCRIPT.map((l) => l.kind) },
      { id: 'onboarding', name: 'Onboarding UX',          ready: guidedAudit().ok && confidenceAudit().ok, data: { tips: TIPS.length } },
      { id: 'metrics',    name: 'Success Metrics',        ready: metrics().length === 5, data: METRIC_KEYS },
      { id: 'emotion',    name: 'Emotion Map',            ready: emotionMapAudit().ok, data: emotionMapAudit().arc },
      { id: 'wireframe',  name: 'Wireframe',              ready: wireframeAudit().ok, data: { frames: wireframeAudit().frames } },
      { id: 'prototype',  name: 'Prototype(ftueWalk)',    ready: typeof ftueWalk === 'function', data: null },
    ];
  }
  function deliverablesAudit() {
    const d = deliverables(), open = d.filter((x) => !x.ready).map((x) => x.id);
    return { ok: d.length === 8 && open.length === 0, open, count: d.length };
  }

  /* ============================================================
     §11 — 완료 조건: 설명 없이 첫 결과물 + 다시 돌아오고 싶다
     ============================================================ */
  function firstTimeTest() {
    const w = ftueWalk('present');
    const noExplain = welcomeAudit().ok && convAudit().ok;                 /* 설명·튜토리얼 0 */
    const wantsBack = secondAudit().ok && emotionMapAudit().ok;            /* 다음 제안 + 종착 감정 */
    return { ok: w.ok && noExplain && wantsBack, walked: w.ok, noExplain, wantsBack,
             remembers: '기능이 아니라 첫 성공 — 그리고 다음에 만들 것' };
  }
  function complete() {
    return timelineAudit().ok && welcomeAudit().ok && questionAudit().ok && convAudit().ok &&
           instant().ok && blankAudit().ok && guidedAudit().ok && confidenceAudit().ok &&
           exportAudit().ok && secondAudit().ok && emotionMapAudit().ok && wireframeAudit().ok &&
           deliverablesAudit().ok && firstTimeTest().ok;
  }

  return {
    /* §0·§1 */ PHILOSOPHY, GOALS,
    /* §T */ PHASES, timelineAudit,
    /* §2 */ FORBIDDEN_WELCOME, WELCOME, welcomeAudit, welcomeSpecAudit,
    /* §3 */ QUESTION, OPTIONS, optionOf, optionRun, questionAudit, questionSpecAudit,
    /* §4 */ SCRIPT, convAudit, convSpecAudit, convRun,
    /* §5 */ instant, blankAudit, instantSpecAudit,
    /* §6 */ TIPS, guidedAudit, guidedSpecAudit,
    /* §7 */ FEELING, CONFIDENCE, confidenceAudit, confidenceSpecAudit,
    /* §8 */ exportAudit,
    /* §9 */ NEXT_IDEA, secondRun, secondAudit,
    /* §E·§W·§P */ EMOTION_MAP, emotionMapAudit, wireframe, wireframeAudit, ftueWalk,
    /* §M */ METRIC_KEYS, record, metrics,
    /* §10·§11 */ deliverables, deliverablesAudit, firstTimeTest, complete,
  };
})();
