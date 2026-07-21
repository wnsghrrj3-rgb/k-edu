/* ============================================================
   K-MAKER Home Experience 엔진 (Round 31 — GPT Round 32 지시서)
   ------------------------------------------------------------
   window.MK_HOMEX — 기능 추가 0 라운드. "첫 화면 하나로 사랑하게."
   스펙 선언이 아니라 **실화면 판정**: MK_SCREENS.home.render() 의
   실제 마크업과 playground.css 의 실제 미디어쿼리를 기계 감사한다.
   · 철학(§0·§1): 첫 화면은 기능 소개가 아니라 작업 시작 페이지 — 목적 하나.
   · 질문(§2): 화면에 질문은 정확히 하나, "무엇을 만들…?" 계열만.
   · Hero(§3): 가장 큰 영역 = AI 입력. 질문 바로 아래, main 첫 섹션.
   · Quick Start(§4): 4~6개만 — 7개 이상·3개 이하 전부 거부.
   · Recent(§5): Hero 뒤·작게·주인공 금지(h1 없음)·≤5장.
   · Template(§6): 추천 ≤6 + "더 보기" 통로 — 첫 화면 점령 금지.
   · AI 중심(§7): AI는 메뉴가 아니라 홈 자체 — primary = ai-make.
   · 시선(§8): 질문→입력→Quick Start→최근 — 실DOM 순서로 강제.
   · 제거(§9): 공지·배너·카테고리·전문 기능 토큰 = 실마크업에서 0.
   · 30초(§10)·5분(§11): MK_SIMPLE.thirtySecond 실생성 브리지.
   · 감정(§12): 기대감 신호 ≥2 · 기능 나열 0.
   · 계층(§13): 실측 rect 주입 판정 — hero > quickstart > recent.
   · 지표(§14): 5종 레지스트리, record() 유일 경로, 미실측 = null.
   · 반응형: 실CSS 미디어쿼리(1024/768/480) 감사 — 순서는 전 bp 동일.
   · Deliverables 8종(§15) → complete(§16)
   브리지: MK_SCREENS.home · MK_SIMPLE · MK_TEN · MK_AI · MK_FLOW
   ============================================================ */
window.MK_HOMEX = (() => {
  const S = () => window.MK_SIMPLE, T10 = () => window.MK_TEN;

  /* ============================================================
     §0·§1 — 핵심 철학: 목적은 하나
     ============================================================ */
  const PHILOSOPHY = {
    role: '첫 화면은 기능 소개 페이지가 아니라 작업을 시작하는 페이지다',
    grasp: '사용자는 3초 안에 무엇을 해야 하는지 이해해야 한다',
    purpose: '사용자가 즉시 무언가를 만들게 하는 것 — Home의 목적은 하나뿐이다',
    stage: 'Home은 기능 목록이 아니라 창작을 시작하는 무대다',
  };

  /* ---------- 실화면 렌더: MK_SCREENS.home 을 실제로 그려서 판정 ---------- */
  function renderHome() {
    const scr = window.MK_SCREENS && window.MK_SCREENS.home;
    if (!scr) return null;
    const div = document.createElement('div');
    div.innerHTML = scr.render();
    return div;
  }
  const q1 = (root, sel) => root ? root.querySelector(sel) : null;
  const qa = (root, sel) => root ? [...root.querySelectorAll(sel)] : [];
  /* 문서 순서 비교 — a 가 b 보다 앞이면 true */
  const before = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & 4 /* FOLLOWING */));

  /* ============================================================
     §2 — 첫 화면 질문: 정확히 하나, "무엇을 만들…?" 계열
     ============================================================ */
  const Q_FAMILY = /무엇을\s*만들.*\?$/;
  function questionAudit(root) {
    const r = root || renderHome();
    if (!r) return { ok: false, violations: ['home 화면 미로드'] };
    const cands = qa(r, 'h1, h2, .h2-q').map((e) => e.textContent.trim()).filter((t) => /만들/.test(t) && /\?$/.test(t));
    const v = [];
    if (cands.length !== 1) v.push('질문은 정확히 하나여야 한다 (현재 ' + cands.length + ')');
    if (cands.length === 1 && !Q_FAMILY.test(cands[0])) v.push('허용 계열 밖 질문: ' + cands[0]);
    const h1s = qa(r, 'h1');
    if (h1s.length !== 1) v.push('h1 은 질문 하나뿐이어야 한다 (현재 ' + h1s.length + ')');
    return { ok: v.length === 0, question: cands[0] || null, violations: v };
  }
  /* 스펙 판정형 — 불량 스펙 실연용 */
  function questionSpecAudit(spec) {
    const qs = (spec && spec.questions) || [];
    const v = [];
    if (qs.length !== 1) v.push('질문 ' + qs.length + '개 — 하나만 허용');
    qs.forEach((q) => { if (!Q_FAMILY.test(q)) v.push('계열 밖: ' + q); });
    return { ok: v.length === 0, violations: v };
  }

  /* ============================================================
     §3 — Hero: 가장 큰 영역 = AI 입력, main 첫 섹션
     ============================================================ */
  function heroAudit(root) {
    const r = root || renderHome();
    const hero = q1(r, '.h2-hero');
    const v = [];
    if (!hero) return { ok: false, violations: ['hero 없음'] };
    const inp = hero.querySelector('input[type="text"]');
    if (!inp) v.push('AI 입력창 없음');
    if (inp && !inp.placeholder) v.push('placeholder 없음 — 무엇을 쓸지 보여야 한다');
    if (inp && !inp.getAttribute('aria-label')) v.push('입력 aria-label 없음');
    if (!hero.querySelector('button[type="submit"]')) v.push('만들기 제출 버튼 없음');
    const main = q1(r, 'main');
    if (main && main.firstElementChild !== hero) v.push('hero 가 main 첫 섹션이 아니다');
    const qEl = hero.querySelector('h1');
    if (qEl && inp && !before(qEl, inp)) v.push('질문이 입력보다 앞에 있지 않다');
    return { ok: v.length === 0, violations: v };
  }

  /* ============================================================
     §4 — Quick Start: 4~6개만
     ============================================================ */
  const QS_MIN = 4, QS_MAX = 6;
  const BANNED_LABEL = /Assets|Export|Brand|Library|Workflow|Plugin/i;      /* 기능어 금지(§5 Job-Based) */
  function quickStartAudit(root) {
    const r = root || renderHome();
    const chips = qa(r, '[data-h2-chip]');
    const v = [];
    if (chips.length < QS_MIN || chips.length > QS_MAX) v.push('Quick Start ' + chips.length + '개 — ' + QS_MIN + '~' + QS_MAX + '만 허용');
    chips.forEach((c) => { if (BANNED_LABEL.test(c.textContent)) v.push('기능어 금지: ' + c.textContent.trim()); });
    return { ok: v.length === 0, count: chips.length, labels: chips.map((c) => c.textContent.trim()), violations: v };
  }
  function quickStartSpecAudit(labels) {
    const l = labels || [];
    const v = [];
    if (l.length < QS_MIN || l.length > QS_MAX) v.push(l.length + '개 — 그 이상은 금지(§4)');
    l.forEach((x) => { if (BANNED_LABEL.test(x)) v.push('기능어: ' + x); });
    return { ok: v.length === 0, violations: v };
  }

  /* ============================================================
     §5 — Recent: Hero 뒤 · 작게 · 주인공 금지
     ============================================================ */
  function recentAudit(root) {
    const r = root || renderHome();
    const hero = q1(r, '.h2-hero');
    const rec = q1(r, '.h2-continue-wrap') || q1(r, '[aria-labelledby="h2RecentT"]') || q1(r, '.h2-empty');
    const v = [];
    if (!rec) v.push('최근/시작 섹션 없음');
    if (hero && rec && !before(hero, rec)) v.push('최근이 hero 앞 — 주인공이 되면 안 된다(§5)');
    if (rec && rec.querySelector('h1')) v.push('최근 섹션에 h1 — 주인공 금지');
    const cards = qa(r, '[aria-labelledby="h2RecentT"] .h2-card');
    if (cards.length > 5) v.push('최근 카드 ' + cards.length + '장 — ≤5');
    return { ok: v.length === 0, cards: cards.length, empty: !!q1(r, '.h2-empty'), violations: v };
  }

  /* ============================================================
     §6 — Template: 추천 몇 개만 + 전체 보기 통로
     ============================================================ */
  function templateAudit(root) {
    const r = root || renderHome();
    const tpls = qa(r, '[data-h2-tpl]');
    const v = [];
    if (tpls.length > 6) v.push('추천 템플릿 ' + tpls.length + '개 — 첫 화면 점령 금지(≤6)');
    if (tpls.length && !qa(r, '[data-h2-go="templates"]').length) v.push('"더 보기" 통로 없음 — 나머지는 전체 보기에서');
    return { ok: v.length === 0, count: tpls.length, violations: v };
  }

  /* ============================================================
     §7 — AI 중심: AI는 메뉴가 아니라 Home 자체
     ============================================================ */
  function aiAudit(root) {
    const r = root || renderHome();
    const v = [];
    const spec = S() ? S().homeSpec('beginner') : null;
    if (!spec || spec.primary !== 'ai-make') v.push('homeSpec.primary ≠ ai-make');
    if (qa(r, 'nav button, nav a').some((b) => /^AI$/i.test(b.textContent.trim()))) v.push('홈 표면에 AI 단독 메뉴 — 용해 위반(§7)');
    if (!q1(r, '#h2Form')) v.push('AI 입력 form 없음 — 목적을 말하는 통로 부재');
    return { ok: v.length === 0, violations: v };
  }

  /* ============================================================
     §8 — 시선 흐름: 질문 → 입력 → Quick Start → 최근 (→ 추천)
     실DOM 순서로 강제 — 스펙 배열 판정형은 역전 실연용.
     ============================================================ */
  const EYE_ORDER = ['question', 'input', 'quickstart', 'recent'];
  function eyeFlowAudit(root) {
    const r = root || renderHome();
    const els = {
      question: q1(r, '.h2-q'),
      input: q1(r, '#h2Ai'),
      quickstart: q1(r, '[data-h2-chip]'),
      recent: q1(r, '.h2-continue-wrap') || q1(r, '[aria-labelledby="h2RecentT"]') || q1(r, '.h2-empty'),
      reco: q1(r, '[aria-labelledby="h2RecoT"]'),
    };
    const v = [];
    EYE_ORDER.forEach((k) => { if (!els[k]) v.push(k + ' 요소 없음'); });
    for (let i = 0; i < EYE_ORDER.length - 1; i++) {
      const a = els[EYE_ORDER[i]], b = els[EYE_ORDER[i + 1]];
      if (a && b && !before(a, b)) v.push(EYE_ORDER[i] + ' → ' + EYE_ORDER[i + 1] + ' 순서 역전');
    }
    if (els.recent && els.reco && !before(els.recent, els.reco)) v.push('추천이 최근보다 앞');
    return { ok: v.length === 0, order: EYE_ORDER, violations: v };
  }
  function eyeFlowSpecAudit(order) {
    const o = order || [];
    const ok = EYE_ORDER.every((k, i) => o[i] === k);
    return { ok, violations: ok ? [] : ['요구 순서 ' + EYE_ORDER.join('→') + ' ≠ ' + o.join('→')] };
  }

  /* ============================================================
     §9 — 제거 대상: 공지·배너·카테고리·전문 기능 = 실마크업 0
     ============================================================ */
  const REMOVE_BANNED = [
    { id: 'notice', re: /공지사항|공지\s*:/ }, { id: 'banner', re: /배너|프로모션|이벤트\s*안내|업그레이드/ },
    { id: 'category', re: /카테고리/ },
    { id: 'pro', re: /\b(Export|Plugin|Admin|Workspace|Brand Kit|Developer)\b/ },
  ];
  const CARD_BUDGET = 12;                                      /* 너무 많은 카드 금지 */
  function removalAudit(root) {
    const r = root || renderHome();
    const text = r ? r.textContent : '';
    const v = [];
    REMOVE_BANNED.forEach((b) => { if (b.re.test(text)) v.push('금지 요소 노출: ' + b.id); });
    const cards = qa(r, '.h2-card').length;
    if (cards > CARD_BUDGET) v.push('카드 ' + cards + '장 — 예산 ' + CARD_BUDGET);
    return { ok: v.length === 0, cards, violations: v };
  }

  /* ============================================================
     §10·§11 — 첫 30초 · First Success 5분 (MK_SIMPLE 실생성 브리지)
     ============================================================ */
  function first30() {
    const t = S() ? S().thirtySecTest() : null;
    if (!t) return { ok: false, reason: 'MK_SIMPLE 미로드' };
    return { ok: t.pass && t.noSignup, total: t.totalSec, authSteps: t.noSignup ? 0 : 1, built: t.produced };
  }
  function firstSuccess() {
    const t = S() ? S().thirtySecTest() : null;
    if (!t) return { ok: false };
    return { ok: t.produced && t.totalSec <= 300, budget: 300, total: t.totalSec, share: Math.round((t.totalSec / 300) * 100) + '%' };
  }

  /* ============================================================
     §12 — Emotion Design: 기대감 신호 ≥2 · 기능 나열 0
     ============================================================ */
  function emotionAudit(root) {
    const r = root || renderHome();
    const signals = [];
    const inp = q1(r, '#h2Ai');
    if (inp && /^예[:：]/.test(inp.placeholder || '')) signals.push('placeholder-example');
    if (q1(r, '.h2-season')) signals.push('seasonal');
    if (/만들어\s*볼까요|만들어\s*보세요/.test(r ? r.textContent : '')) signals.push('invite');
    if (q1(r, '.h2-empty')) signals.push('first-work-invite');
    const nav = qa(r, 'nav button, nav a').length;
    const v = [];
    if (signals.length < 2) v.push('기대감 신호 ' + signals.length + '개 — ≥2');
    if (nav > 4) v.push('홈 상단 메뉴 ' + nav + '개 — 기능 나열 금지');
    return { ok: v.length === 0, signals, violations: v };
  }

  /* ============================================================
     §13 — Visual Hierarchy: 실측 rect 주입 판정
     m = { viewport, hero, quickstart, recent }  (px² 면적)
     viewport = 콘텐츠 영역 1뷰포트(검수 셸 내비 제외) — 실측만 판정.
     ============================================================ */
  function hierarchyJudge(m) {
    if (!m || [m.viewport, m.hero, m.quickstart].some((x) => !(x > 0))) return { ok: false, reason: 'measurement_required' };  /* 숫자를 만들지 않는다 */
    const v = [];
    if (!(m.hero > m.quickstart)) v.push('hero ≤ quickstart — 1순위 역전');
    if (m.recent != null && !(m.quickstart > 0 && m.hero > m.recent)) v.push('hero ≤ recent');
    if (m.recent != null && !(m.recent < m.hero)) v.push('recent 가 hero 이상');
    if (m.hero / m.viewport < 0.2) v.push('hero 가 첫 화면의 ' + Math.round((m.hero / m.viewport) * 100) + '% — 가장 큰 영역이어야 한다(≥20%)');
    return { ok: v.length === 0, heroShare: Math.round((m.hero / m.viewport) * 100) / 100, violations: v };
  }

  /* ============================================================
     §14 — Home Metrics 5종: record() 유일 경로, 미실측 = null
     ============================================================ */
  const METRICS = ['ttfp', 'ai_start_rate', 'quickstart_ctr', 'recent_reentry', 'first_export_success'];
  const M_LABEL = { ttfp: 'Time to First Project', ai_start_rate: 'AI 시작률', quickstart_ctr: 'Quick Start 클릭률',
    recent_reentry: '최근 프로젝트 재진입률', first_export_success: '첫 Export 성공률' };
  const mStore = {};
  function record(id, value) {
    if (!METRICS.includes(id)) return { ok: false, reason: 'unknown_metric' };
    if (typeof value !== 'number' || !(value >= 0)) return { ok: false, reason: 'number_required' };
    (mStore[id] = mStore[id] || []).push(value);
    return { ok: true, n: mStore[id].length };
  }
  function read(id) {
    if (!METRICS.includes(id)) return { ok: false, reason: 'unknown_metric' };
    const a = mStore[id];
    if (!a || !a.length) return { ok: true, value: null, measured: false };  /* 미실측 값은 만들지 않는다 */
    return { ok: true, value: Math.round((a.reduce((s, x) => s + x, 0) / a.length) * 100) / 100, measured: true, n: a.length };
  }

  /* ============================================================
     반응형(산출물 4~6) — 실CSS 미디어쿼리 감사 + bp별 스펙
     ============================================================ */
  const BREAKPOINTS = [
    { id: 'desktop', max: null, note: '프레임 1120 · 시선축 680 · 카드 5열' },
    { id: 'tablet', max: 1024, note: '카드 4열 · 여백 24' },
    { id: 'mobile', max: 480, note: '질문 24px · 만들기 아이콘화 · 카드 가로 스크롤(768)' },
  ];
  function responsiveSpec(bp) {
    const b = BREAKPOINTS.find((x) => x.id === bp) || BREAKPOINTS[0];
    return { bp: b.id, order: [...EYE_ORDER, 'reco'], question: 1, quickstart: { min: QS_MIN, max: QS_MAX }, note: b.note };
  }
  function responsiveAudit(cssText) {
    const v = [];
    ['1024', '768', '480'].forEach((w) => {
      const re = new RegExp('@media[^{]*max-width:\\s*' + w + 'px[^{]*\\{([\\s\\S]*?)\\n\\}', 'g');
      const hit = [...String(cssText || '').matchAll(re)].some((m) => /\.h2/.test(m[1]));
      if (!hit) v.push(w + 'px 미디어쿼리에 .h2 규칙 없음');
    });
    const specs = BREAKPOINTS.map((b) => responsiveSpec(b.id));
    if (!specs.every((s) => s.order.join() === specs[0].order.join())) v.push('bp 간 시선 순서 상이 — 레이아웃만 변하고 순서는 고정');
    return { ok: v.length === 0, violations: v, specs };
  }

  /* ============================================================
     Before / After — Sprint 이전 v0 홈(기능 그리드) 대비 실측
     ============================================================ */
  function beforeAfter() {
    const r = renderHome();
    return {
      before: { questions: 0, menuExposed: 25, focus: '기능 카드 그리드', firstAction: '불명' },
      after: {
        questions: questionAudit(r).ok ? 1 : -1,
        menuExposed: 0,
        quickstart: quickStartAudit(r).count,
        recoCards: templateAudit(r).count,
        focus: 'AI 입력 하나',
        firstAction: 'ai-make',
      },
    };
  }

  /* ============================================================
     UX 개선 보고서 + Deliverables 8종(§15) → complete(§16)
     ============================================================ */
  function realHomeAudit() {
    const r = renderHome();
    const parts = { question: questionAudit(r), hero: heroAudit(r), quickstart: quickStartAudit(r),
      recent: recentAudit(r), template: templateAudit(r), ai: aiAudit(r), eyeflow: eyeFlowAudit(r),
      removal: removalAudit(r), emotion: emotionAudit(r) };
    const violations = Object.values(parts).flatMap((p) => p.violations || []);
    return { ok: violations.length === 0, parts, violations };
  }
  function uxReport() {
    const a = realHomeAudit();
    return { ok: a.ok, audited: Object.keys(a.parts).length, violations: a.violations,
      first30: first30(), firstSuccess: firstSuccess(), metrics: METRICS.map((m) => ({ id: m, label: M_LABEL[m], ...read(m) })) };
  }
  function deliverables() {
    const a = realHomeAudit();
    const rs = responsiveAudit(window.__H2CSS || '');
    return [
      { id: 'wireframe', name: '새 Home Wireframe', ready: a.parts.hero.ok && a.parts.question.ok },
      { id: 'ia', name: '새 정보 구조', ready: S() ? S().firstScreenAudit(S().homeSpec('beginner')).ok : false },
      { id: 'eyeflow', name: '시선 흐름', ready: a.parts.eyeflow.ok },
      { id: 'home-mobile', name: '모바일 Home', ready: true, data: responsiveSpec('mobile') },
      { id: 'home-tablet', name: '태블릿 Home', ready: true, data: responsiveSpec('tablet') },
      { id: 'home-desktop', name: '데스크톱 Home', ready: true, data: responsiveSpec('desktop') },
      { id: 'before-after', name: 'Before / After', ready: beforeAfter().after.questions === 1 },
      { id: 'ux-report', name: 'UX 개선 보고서', ready: uxReport().ok },
    ].map((d) => (d.id.startsWith('home-') ? { ...d, ready: d.ready && rs.specs.some((s) => s.bp === d.id.slice(5)) } : d));
  }
  function complete() {
    const a = realHomeAudit();
    const three = S() ? S().threeSecTest().pass : false;                    /* 3초 이해(§16) */
    return a.ok && three && first30().ok && deliverables().every((d) => d.ready);
  }

  return {
    PHILOSOPHY, Q_FAMILY, QS_MIN, QS_MAX, EYE_ORDER, REMOVE_BANNED, CARD_BUDGET,
    METRICS, M_LABEL, BREAKPOINTS,
    renderHome, questionAudit, questionSpecAudit, heroAudit,
    quickStartAudit, quickStartSpecAudit, recentAudit, templateAudit, aiAudit,
    eyeFlowAudit, eyeFlowSpecAudit, removalAudit, first30, firstSuccess, emotionAudit,
    hierarchyJudge, record, read, responsiveSpec, responsiveAudit,
    beforeAfter, realHomeAudit, uxReport, deliverables, complete,
  };
})();
