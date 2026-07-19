/* ============================================================
   K-MAKER Template Engine v1  —  window.MK_TPL
   ------------------------------------------------------------
   Template는 단순 디자인 파일이 아니라 K-MAKER 콘텐츠 생성의
   핵심 엔진이다. 구조(지시서):
     Template → Scene Collection → Assets → Animation → Style → Metadata
   각 컬렉션은 독립 관리되고, resolve()에서 하나로 조립된다.
   ------------------------------------------------------------
   · STYLES / ANIMATIONS  독립 사전 (id 참조)
   · Assets               MK_ASSETS의 id 참조 (assetIds)
   · AI Metadata          ai: { recommended, tags, hints }
   · REGISTRY             Scene 소스는 MK_SAMPLE.TEMPLATES (무삭제),
                          엔진 메타를 오버레이. register()로 확장.
   · resolve(id)          전 컬렉션 통합 로드 → { template, scenes,
                          style, animation, assets, ai, meta }
   · load(id)             Scene Loader — resolve 결과를 Editor doc에
                          실어 PG.openEditorDoc()로 전달
   ⚠ 전부 샘플 데이터 — 실API·실템플릿(kmake 46종) 연결은 후속.
   ============================================================ */
window.MK_TPL = (() => {

  /* ---------- 독립 컬렉션 1: Style (Color + Typography) ---------- */
  const STYLES = {
    'st-modern':  { name: '모던',     palette: ['#4A54A8', '#E8EAF6', '#1F2733', '#FFFFFF'], fonts: { heading: 'Pretendard 700', body: 'Pretendard 400' }, tone: '차분·신뢰' },
    'st-soft':    { name: '소프트',   palette: ['#E8735A', '#FBE9E4', '#2E8C7F', '#FFF7F2'], fonts: { heading: 'Pretendard 700', body: 'Pretendard 400' }, tone: '따뜻·친근' },
    'st-edu':     { name: '에듀',     palette: ['#2E8C7F', '#E3F1EE', '#1F2733', '#FFFFFF'], fonts: { heading: 'Pretendard 700', body: 'Pretendard 400' }, tone: '명료·학습' },
    'st-paper':   { name: '페이퍼',   palette: ['#8A7A55', '#F8F3E9', '#1F2733', '#C4573F'], fonts: { heading: 'Noto Serif KR 700', body: 'Pretendard 400' }, tone: '아날로그·질감' },
    'st-bold':    { name: '볼드',     palette: ['#1F2733', '#FFD166', '#FFFFFF', '#D6453A'], fonts: { heading: 'Pretendard 800', body: 'Pretendard 500' }, tone: '강조·시선' },
    'st-event':   { name: '행사',     palette: ['#8E4A97', '#F3E8F4', '#FFD166', '#1F2733'], fonts: { heading: 'Pretendard 800', body: 'Pretendard 400' }, tone: '축제·설렘' },
  };

  /* ---------- 독립 컬렉션 2: Animation ---------- */
  const ANIMATIONS = {
    'an-none':    { name: '없음',            entrance: null,       transition: 'none',  desc: '인쇄·정적 매체용' },
    'an-calm':    { name: '차분한 등장',     entrance: 'fade-up',  transition: 'fade',  desc: '요소 페이드업 · 장면 페이드' },
    'an-seq':     { name: '순차 등장',       entrance: 'stagger',  transition: 'fade',  desc: '요소가 순서대로 · 발표용' },
    'an-slide':   { name: '슬라이드 넘김',   entrance: 'fade',     transition: 'slide', desc: '카드뉴스식 좌우 넘김' },
    'an-pop':     { name: '팝 & 자막',       entrance: 'pop',      transition: 'slide', desc: '자막 팝 · 영상용 리듬' },
  };

  /* ---------- 엔진 메타 오버레이 (templateId → 확장 필드) ----------
     Scene 소스는 MK_SAMPLE.TEMPLATES — 여기엔 엔진 계층 정보만. */
  const OVERLAY = {
    'smp-pres-01':  { styleId: 'st-modern', animationId: 'an-seq',   assetIds: ['as-011', 'as-017'], ai: { recommended: true,  tags: ['수업', '발표', '단원'], hints: ['제목을 주제로 교체', '본문 장 복제로 확장'] } },
    'smp-card-01':  { styleId: 'st-soft',   animationId: 'an-slide', assetIds: ['as-009', 'as-031'], ai: { recommended: true,  tags: ['알림', '소식'], hints: ['장 수는 3~5장이 적당'] } },
    'smp-vid-01': { styleId: 'st-event',  animationId: 'an-pop',   assetIds: ['as-013', 'as-015', 'as-046'], ai: { recommended: true,  tags: ['행사', '홍보'], hints: ['씬당 4~6초 유지'] } },
    'smp-post-01':  { styleId: 'st-paper',  animationId: 'an-none',  assetIds: ['as-040', 'as-026'], ai: { recommended: false, tags: ['안내', '포스터'], hints: ['인쇄면 여백 확보'] } },
    'smp-work-01':  { styleId: 'st-edu',    animationId: 'an-none',  assetIds: ['as-038', 'as-017'], ai: { recommended: false, tags: ['학습지', '평가'], hints: ['문항 수보다 여백 우선'] } },
    'smp-thumb-01': { styleId: 'st-bold',   animationId: 'an-none',  assetIds: ['as-012'], ai: { recommended: false, tags: ['썸네일'], hints: ['글자 수 8자 이내'] } },
    'smp-act-01':   { styleId: 'st-edu',    animationId: 'an-none',  assetIds: ['as-018', 'as-030'], ai: { recommended: false, tags: ['이름표', '학급운영'], hints: ['한 판에 여러 장 배치 예정'] } },
    'smp-sns-01':   { styleId: 'st-modern', animationId: 'an-calm',  assetIds: ['as-008', 'as-051'], ai: { recommended: true,  tags: ['SNS', '공지'], hints: ['첫 장 한 문장 원칙'] } },
  };

  /* ---------- 카테고리 (Browser 좌측 — 지시서 순서 고정) ---------- */
  const CATEGORIES = [
    ['presentation', '발표자료'], ['video', '영상'], ['cardnews', '카드뉴스'], ['poster', '포스터'],
    ['worksheet', '학습지'], ['activity', '활동자료'], ['thumbnail', '썸네일'], ['sns', 'SNS'],
  ];

  /* ---------- 레지스트리 ---------- */
  /* 동적 등록분(복제 등) — MK_SAMPLE 원본은 건드리지 않는다 */
  const EXTRA = [];

  const sources = () => [...window.MK_SAMPLE.TEMPLATES, ...EXTRA];

  const get = (id) => {
    const src = sources().find((t) => t.templateId === id);
    if (!src) return null;
    const ov = OVERLAY[src.templateId] || src._overlay || { styleId: 'st-modern', animationId: 'an-none', assetIds: [], ai: { recommended: false, tags: src.tags || [], hints: [] } };
    return { ...src, ...ov };
  };

  const list = () => sources().map((t) => get(t.templateId));

  /* register — 확장점: 새 템플릿(scene 소스 + 오버레이 동시) 등록 */
  function register(template, overlay) {
    template._overlay = overlay;
    EXTRA.push(template);
    return get(template.templateId);
  }

  /* duplicate — 복제본을 레지스트리에 등록 */
  function duplicate(id) {
    const t = get(id);
    if (!t) return null;
    const copy = JSON.parse(JSON.stringify(sources().find((x) => x.templateId === id)));
    copy.templateId = id + '-copy-' + Date.now();
    copy.title = t.title.replace(' (샘플)', '') + ' (사본)';
    copy.duplicated = true;
    return register(copy, { styleId: t.styleId, animationId: t.animationId, assetIds: [...t.assetIds], ai: JSON.parse(JSON.stringify(t.ai)) });
  }

  /* ---------- resolve — 전 컬렉션 통합 로드 ---------- */
  function resolve(id) {
    const t = get(id);
    if (!t) return null;
    return {
      template: t,
      scenes: t.scenes,
      style: STYLES[t.styleId] || null,
      animation: ANIMATIONS[t.animationId] || null,
      assets: (t.assetIds || []).map((aid) => window.MK_ASSETS.ASSETS.find((a) => a.id === aid)).filter(Boolean),
      ai: t.ai,
      meta: { targetUser: t.targetUser, gradeRange: t.gradeRange, uses: t.uses, ratio: t.ratio, difficulty: t.difficulty || '보통', category: t.category },
    };
  }

  /* ---------- Scene Loader — Editor로 전달 ----------
     Scene·Asset·Color·Typography·Animation을 doc.engine에 실어
     PG.openEditorDoc으로 탑재. Editor의 engine 활용(팔레트 패널 등)은 후속. */
  function load(id) {
    const r = resolve(id);
    if (!r) return null;
    const doc = JSON.parse(JSON.stringify(sources().find((x) => x.templateId === id)));
    doc.engine = {
      styleId: r.template.styleId, style: r.style,
      animationId: r.template.animationId, animation: r.animation,
      assetIds: r.template.assetIds, ai: r.ai,
    };
    /* Project System 연동 — 템플릿 사용 = 새 프로젝트 생성 후 열기 */
    if (window.MK_PROJ) {
      const p = window.MK_PROJ.createFromDoc(doc, doc.title.replace(' (샘플)', ''));
      window.MK_PROJ.open(p.projectId);
      return p.doc;
    }
    PG.openEditorDoc(doc);
    return doc;
  }

  /* Round 15 — Asset Reference 수정 경로 (DAM Replace Everywhere용).
     템플릿은 파일이 아니라 assetIds Reference만 가진다. */
  function setAssetIds(templateId, ids) {
    if (OVERLAY[templateId]) { OVERLAY[templateId].assetIds = ids.slice(); return true; }
    const ex = EXTRA.find((t) => t.templateId === templateId);
    if (ex && ex._overlay) { ex._overlay.assetIds = ids.slice(); return true; }
    return false;
  }

  return { STYLES, ANIMATIONS, CATEGORIES, get, list, register, duplicate, resolve, load, setAssetIds };
})();
