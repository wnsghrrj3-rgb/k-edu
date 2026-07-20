/* ============================================================
   K-MAKER Creator Marketplace v1  —  window.MK_MARKET  (Round 18)
   ------------------------------------------------------------
   철학: Marketplace는 다운로드 사이트가 아니다.
   Creator → Content → Review → Install → Update → Analytics →
   Revenue → Community 까지 이어지는 Creator Economy 전체 구조.
   ------------------------------------------------------------
   구성:
   · Item 19종 · Version(semver·changelog) · Publishing FSM(8상태)
   · Creator(프로필·팔로우·인증·랭킹)     · Review(별점·스샷·helpful·신고·답글)
   · Search(키워드·AI 의도·필터·정렬)      · Recommendation(유사·함께 사용·크리에이터)
   · Collections(큐레이션 11 + 자동)       · Monetization(무료·유료·구독·조직/교육/엔터)
   · Coupon 5종(할인·번들·프로모션·캠페인·추천인)
   · Revenue(수수료·세금·정산·인보이스)    · Analytics(다운로드·설치율·리텐션·전환)
   · License 6종                          · Moderation(자동·AI·관리자·신고·저작권)
   · Enterprise 비공개 마켓(학교·사내)     · Community(좋아요·북마크·댓글·컬렉션·공유)
   · Install 엔진 — 타입별 브리지: plugin→MK_PLUGIN · template→MK_TPL ·
     asset pack→MK_DAM · brand kit/기타→레코드 설치
   ⚠ 정직 표기: 전부 인메모리 — 실결제·실정산·원격 스토어 없음.
   AI 검색/심사/추천은 규칙 기반 결정론(LLM 미연결).
   리텐션·활성 사용자는 이벤트 로그 기반 결정론 산출(실측 아님).
   ============================================================ */
window.MK_MARKET = (() => {
  'use strict';

  const clone = (o) => JSON.parse(JSON.stringify(o));
  let SEQ = 1000;
  const nid = (p) => p + '-' + (++SEQ);
  let CLOCK = Date.parse('2026-07-01T09:00:00Z');
  const tick = () => (CLOCK += 60000);                 /* 결정론 시계 — 호출마다 1분 */
  const now = () => new Date(CLOCK).toISOString();

  /* ================================================================
     1. 상수 — Item 19종 · 라이선스 · 가격 · 컬렉션 · FSM
     ================================================================ */
  const ITEM_TYPES = [
    'presentation-template', 'document-template', 'poster', 'sns', 'resume', 'portfolio',
    'landing-page', 'education-template', 'chart-pack', 'icon-pack', 'illustration-pack',
    'brand-kit', 'plugin', 'animation-preset', 'section-pack', 'prompt-pack',
    'ai-workflow', 'mockup', 'component-library',
  ];
  const TYPE_KO = {
    'presentation-template': '프레젠테이션', 'document-template': '문서', poster: '포스터', sns: 'SNS',
    resume: '이력서', portfolio: '포트폴리오', 'landing-page': '랜딩 페이지', 'education-template': '교육',
    'chart-pack': '차트 팩', 'icon-pack': '아이콘 팩', 'illustration-pack': '일러스트 팩', 'brand-kit': '브랜드 킷',
    plugin: '플러그인', 'animation-preset': '애니 프리셋', 'section-pack': '섹션 팩', 'prompt-pack': '프롬프트 팩',
    'ai-workflow': 'AI 워크플로우', mockup: '목업', 'component-library': '컴포넌트 라이브러리',
  };
  const LICENSES = ['personal', 'commercial', 'education', 'enterprise', 'lifetime', 'subscription'];
  const PRICE_MODELS = ['free', 'paid', 'subscription'];
  const CURATED = ["Editor's Choice", 'Trending', 'New', 'Popular', 'Education', 'Business',
    'Startup', 'Marketing', 'School', 'Minimal', 'Premium'];

  /* Publishing Workflow FSM — 화이트리스트 전이만 허용 */
  const PUB_STATES = ['draft', 'private', 'review', 'approved', 'published', 'rejected', 'deprecated', 'archived'];
  const PUB_FSM = {
    draft: ['private', 'review', 'archived'],
    private: ['review', 'draft', 'archived'],
    review: ['approved', 'rejected'],
    rejected: ['draft', 'archived'],
    approved: ['published'],
    published: ['deprecated'],
    deprecated: ['archived', 'published'],                 /* 복구 허용 */
    archived: [],
  };

  const FEE_RATE = 0.20;                                   /* 플랫폼 수수료 20% */
  const TAX_RATE = 0.033;                                  /* 원천세 3.3% (net 기준) */

  /* ================================================================
     2. 저장소 (전부 인메모리)
     ================================================================ */
  const CREATORS = new Map();   /* id → creator */
  const ITEMS = new Map();      /* id → item */
  const ORDERS = new Map();     /* id → order */
  const COUPONS = new Map();    /* code → coupon */
  const INSTALLS = new Map();   /* userId → Map(itemId → install record) */
  const REVIEWS = new Map();    /* id → review */
  const LEDGER = [];            /* revenue 원장 */
  const SETTLEMENTS = [];       /* 정산 내역 */
  const EVENTS = [];            /* analytics 이벤트 로그 */
  const COMMENTS = new Map();   /* itemId → [comment] */
  const INQUIRIES = new Map();  /* creatorId → [inquiry] */
  const USER_COLLECTIONS = new Map(); /* userId → [{id,name,items}] */
  const SOCIAL = { likes: new Map(), bookmarks: new Map(), shares: new Map(), follows: new Map() };
  const MARKETS = new Map();    /* 조직 전용 마켓: id → {id,org,type,name} */
  const REPORTS = [];           /* 신고·저작권 접수 */
  const MOD_LOG = [];           /* 심사 로그 */

  /* ================================================================
     3. Analytics 이벤트 (§17 — 모든 흐름이 여기로 흘러든다)
     ================================================================ */
  const EV_KINDS = ['view', 'download', 'install', 'uninstall', 'purchase', 'refund', 'favorite', 'share', 'usage'];
  function track(kind, itemId, user, meta) {
    if (!EV_KINDS.includes(kind)) throw new Error('unknown event: ' + kind);
    EVENTS.push({ kind, itemId, user: user || 'anon', at: now(), ...(meta || {}) });
    tick();
  }
  const evCount = (itemId, kind) => EVENTS.filter((e) => e.itemId === itemId && e.kind === kind).length;

  /* ================================================================
     4. Creator (§3·§23)
     ================================================================ */
  function registerCreator(c) {
    if (!c || !c.id || !c.name) throw new Error('creator: id·name 필수');
    if (CREATORS.has(c.id)) throw new Error('creator 중복: ' + c.id);
    CREATORS.set(c.id, {
      id: c.id, name: c.name, avatar: c.avatar || '👤', bio: c.bio || '',
      portfolio: c.portfolio || [], verified: !!c.verified, org: c.org || null,
      joinedAt: now(),
    });
    tick();
    return creator(c.id);
  }
  function creator(id) {
    const c = CREATORS.get(id);
    if (!c) return null;
    const items = [...ITEMS.values()].filter((i) => i.creator === id);
    const followers = [...SOCIAL.follows.entries()].filter(([, set]) => set.has(id)).map(([u]) => u);
    const following = [...(SOCIAL.follows.get(id) || [])];
    const downloads = items.reduce((s, i) => s + evCount(i.id, 'download'), 0);
    const ratings = items.map((i) => itemRating(i.id)).filter((r) => r > 0);
    const revenue = LEDGER.filter((l) => l.creator === id && !l.reversed).reduce((s, l) => s + l.net, 0);
    return {
      ...clone(c), items: items.length, followers: followers.length, following: following.length,
      downloads, rating: ratings.length ? +(ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(2) : 0,
      revenue: Math.round(revenue),
    };
  }
  const verifyCreator = (id) => { CREATORS.get(id).verified = true; };
  function follow(user, creatorId) {
    if (!CREATORS.has(creatorId)) throw new Error('없는 creator');
    if (!SOCIAL.follows.has(user)) SOCIAL.follows.set(user, new Set());
    SOCIAL.follows.get(user).add(creatorId);
  }
  const unfollow = (user, creatorId) => { (SOCIAL.follows.get(user) || new Set()).delete(creatorId); };
  function creatorRanking() {
    return [...CREATORS.keys()].map((id) => {
      const c = creator(id);
      return { id, name: c.name, verified: c.verified, score: c.downloads + Math.round(c.rating * 20) + c.followers * 5 };
    }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }

  /* ================================================================
     5. Item · Version (§1·§2)
     ================================================================ */
  const SEMVER = /^\d+\.\d+\.\d+$/;
  function semverCmp(a, b) {
    const A = a.split('.').map(Number), B = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i];
    return 0;
  }
  function createItem(spec) {
    const errs = [];
    if (!spec.name) errs.push('name 필수');
    if (!ITEM_TYPES.includes(spec.type)) errs.push('type 불명: ' + spec.type);
    if (!CREATORS.has(spec.creator)) errs.push('creator 미등록');
    if (!spec.license || !LICENSES.includes(spec.license)) errs.push('license 6종 중 하나 필수');
    if (!PRICE_MODELS.includes(spec.priceModel || 'free')) errs.push('priceModel 불명');
    if ((spec.priceModel === 'paid' || spec.priceModel === 'subscription') && !(spec.price > 0)) errs.push('유료는 price 필수');
    if (errs.length) return { ok: false, errors: errs };
    const id = spec.id || nid('itm');
    if (ITEMS.has(id)) return { ok: false, errors: ['id 중복'] };
    ITEMS.set(id, {
      id, name: spec.name, type: spec.type, creator: spec.creator,
      description: spec.description || '', tags: spec.tags || [], lang: spec.lang || 'ko',
      icon: spec.icon || '📦', screenshots: spec.screenshots || [], video: spec.video || null,
      features: spec.features || [], compatibility: spec.compatibility || 'K-MAKER 1.x',
      license: spec.license, priceModel: spec.priceModel || 'free', price: spec.price || 0,
      orgPrice: spec.orgPrice || 0, eduPrice: spec.eduPrice == null ? null : spec.eduPrice,
      visibility: spec.visibility || 'public',             /* public | market(조직 전용) */
      market: spec.market || null,                          /* 조직 전용 마켓 id */
      state: 'draft', versions: [], support: spec.support || 'market@keduclass.com',
      collections: spec.collections || [], createdAt: now(),
    });
    tick();
    return { ok: true, id };
  }
  function submitVersion(itemId, v) {
    const it = ITEMS.get(itemId);
    if (!it) throw new Error('없는 item');
    if (!SEMVER.test(v.version)) return { ok: false, error: 'semver 형식 아님' };
    const last = it.versions[it.versions.length - 1];
    if (last && semverCmp(v.version, last.version) <= 0) return { ok: false, error: '버전 후퇴/중복 거부' };
    it.versions.push({ version: v.version, changelog: v.changelog || '', payload: v.payload || {}, at: now() });
    tick();
    return { ok: true };
  }
  const latestVersion = (itemId) => { const it = ITEMS.get(itemId); return it.versions[it.versions.length - 1] || null; };

  /* ---- Publishing FSM (§5) ---- */
  function transition(itemId, to, actor) {
    const it = ITEMS.get(itemId);
    if (!it) throw new Error('없는 item');
    if (!PUB_STATES.includes(to)) throw new Error('불명 상태: ' + to);
    if (!PUB_FSM[it.state].includes(to)) throw new Error(`불법 전이 ${it.state}→${to}`);
    if (to === 'review' && !it.versions.length) throw new Error('버전 없이 심사 제출 불가');
    if ((to === 'approved' || to === 'rejected') && actor !== 'admin' && actor !== 'auto')
      throw new Error('심사 결정은 관리자만');
    it.state = to;
    tick();
    return it.state;
  }
  /* 제출 → 자동 심사 파이프라인 (§24·§25) */
  function submitForReview(itemId) {
    transition(itemId, 'review');
    const checks = autoChecks(itemId);
    const ai = aiReview(itemId);
    MOD_LOG.push({ itemId, checks, ai, at: now() });
    if (!checks.ok) { transition(itemId, 'rejected', 'auto'); return { ok: false, checks, ai, state: 'rejected' }; }
    if (ai.score >= 60) { transition(itemId, 'approved', 'auto'); return { ok: true, checks, ai, state: 'approved' }; }
    return { ok: true, checks, ai, state: 'review' };       /* 경계 — 관리자 대기 */
  }
  const adminDecide = (itemId, approve) => { transition(itemId, approve ? 'approved' : 'rejected', 'admin'); return ITEMS.get(itemId).state; };
  function publishItem(itemId) { transition(itemId, 'published'); return 'published'; }

  /* ---- Moderation (§24·§25) ---- */
  const MAL_PATTERNS = [/document\.cookie/, /localStorage\./, /eval\s*\(/, /new\s+Function/, /window\.location\s*=/, /<script/i];
  const POLICY_WORDS = [/사행성/, /도박/, /혐오/, /개인정보 수집/];
  function autoChecks(itemId) {
    const it = ITEMS.get(itemId);
    const v = latestVersion(itemId);
    const src = v && v.payload && v.payload.source ? String(v.payload.source) : '';
    const security = it.type === 'plugin' ? MAL_PATTERNS.filter((re) => re.test(src)).map(String) : [];
    const licenseOk = LICENSES.includes(it.license);
    const hay = it.name + ' ' + it.description;
    const policy = POLICY_WORDS.filter((re) => re.test(hay)).map(String);
    return { ok: !security.length && licenseOk && !policy.length, security, licenseOk, policy };
  }
  function aiReview(itemId) {                               /* 규칙 기반 — LLM 아님 */
    const it = ITEMS.get(itemId);
    let score = 40;
    const notes = [];
    if (it.description.length >= 20) { score += 15; } else notes.push('설명이 짧음');
    if (it.screenshots.length) { score += 15; } else notes.push('스크린샷 없음');
    if (it.tags.length >= 3) { score += 10; } else notes.push('태그 3개 미만');
    if (it.features.length) { score += 10; } else notes.push('기능 목록 없음');
    if (latestVersion(itemId) && latestVersion(itemId).changelog) score += 10;
    return { score: Math.min(score, 100), notes };
  }
  function report(kind, targetId, user, reason) {           /* 신고·저작권 */
    if (!['item', 'review', 'copyright'].includes(kind)) throw new Error('신고 유형 불명');
    const r = { id: nid('rep'), kind, targetId, user, reason, at: now(), status: 'open' };
    REPORTS.push(r);
    return r.id;
  }
  function resolveReport(id, action) {
    const r = REPORTS.find((x) => x.id === id);
    if (!r) throw new Error('없는 신고');
    r.status = 'resolved'; r.action = action;
    if (action === 'takedown' && r.kind !== 'review') {
      const it = ITEMS.get(r.targetId);
      if (it && it.state === 'published') transition(r.targetId, 'deprecated');
    }
    return r;
  }

  /* ================================================================
     6. Detail · Store 목록 (§6·§11 필터·정렬 / §22 조직 필터)
     ================================================================ */
  function detail(itemId, org) {
    const it = ITEMS.get(itemId);
    if (!it) return null;
    if (it.visibility === 'market') {                        /* Enterprise 비공개 */
      const m = MARKETS.get(it.market);
      if (!m || m.org !== org) return null;
    }
    const v = latestVersion(itemId);
    return {
      ...clone(it), version: v ? v.version : null, changelog: v ? v.changelog : '',
      versionCount: it.versions.length,
      rating: itemRating(itemId), reviewCount: reviewsFor(itemId).length,
      downloads: evCount(itemId, 'download'), installs: evCount(itemId, 'install'),
      likes: (SOCIAL.likes.get(itemId) || new Set()).size,
      creatorName: (CREATORS.get(it.creator) || {}).name,
      preview: v && v.payload ? previewOf(it, v.payload) : null,
    };
  }
  /* Preview Engine (§7) — payload 타입별 미리보기 서술자 (실렌더는 화면에서) */
  function previewOf(it, payload) {
    if (it.type === 'plugin') return { kind: 'plugin', commands: (payload.commands || []).length };
    if (payload.template) return { kind: 'scene', scenes: (payload.template.scenes || []).length };
    if (payload.assets) return { kind: 'assets', count: payload.assets.length };
    if (payload.prompts) return { kind: 'prompts', count: payload.prompts.length };
    if (payload.tokens) return { kind: 'brand', tokens: Object.keys(payload.tokens).length };
    return { kind: 'generic' };
  }
  function storeList(opts) {
    const o = opts || {};
    let list = [...ITEMS.values()].filter((it) => it.state === 'published');
    list = list.filter((it) => it.visibility === 'public' ||
      (o.org && MARKETS.get(it.market) && MARKETS.get(it.market).org === o.org));
    if (o.type) list = list.filter((it) => it.type === o.type);
    if (o.creator) list = list.filter((it) => it.creator === o.creator);
    if (o.tag) list = list.filter((it) => it.tags.includes(o.tag));
    if (o.lang) list = list.filter((it) => it.lang === o.lang);
    if (o.price === 'free') list = list.filter((it) => it.priceModel === 'free');
    if (o.price === 'paid') list = list.filter((it) => it.priceModel !== 'free');
    const KEY = {
      popularity: (it) => evCount(it.id, 'view') + evCount(it.id, 'install') * 3,
      downloads: (it) => evCount(it.id, 'download'),
      updated: (it) => { const v = latestVersion(it.id); return v ? Date.parse(v.at) : 0; },
      rating: (it) => itemRating(it.id),
      price: (it) => -it.price,                              /* 낮은 가격 우선 */
    };
    const k = KEY[o.sort || 'popularity'];
    list.sort((a, b) => k(b) - k(a) || a.id.localeCompare(b.id));
    return list.map((it) => detail(it.id, o.org));
  }

  /* ================================================================
     7. Search (§11) — 키워드 + AI 의도 (규칙 기반)
     ================================================================ */
  const INTENT = [
    [/발표|프레젠|피티|ppt/i, ['presentation-template']],
    [/수업|교육|학습|교사|학교/, ['education-template', 'prompt-pack', 'ai-workflow']],
    [/아이콘/, ['icon-pack']], [/차트|그래프/, ['chart-pack']],
    [/브랜드|로고/, ['brand-kit']], [/이력서|취업/, ['resume']],
    [/포스터|홍보/, ['poster', 'sns']], [/자동화|워크플로/, ['ai-workflow', 'plugin']],
  ];
  function search(q, opts) {
    const o = opts || {};
    const tokens = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    const intents = INTENT.filter(([re]) => re.test(q || '')).flatMap(([, t]) => t);
    return storeList(o).map((d) => {
      const hay = (d.name + ' ' + d.description + ' ' + d.tags.join(' ') + ' ' + (d.creatorName || '')).toLowerCase();
      let score = 0;
      for (const t of tokens) if (hay.includes(t)) score += 10;
      if (intents.includes(d.type)) score += 6;              /* AI 의도 가점 */
      if (score > 0 && d.rating >= 4) score += 2;            /* 관련 있을 때만 품질 가점 */
      return { ...d, score };
    }).filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  }

  /* ================================================================
     8. Recommendation (§12) — 유사·함께 사용·크리에이터
     ================================================================ */
  function similar(itemId, n) {
    const base = ITEMS.get(itemId);
    if (!base) return [];
    return storeList({}).filter((d) => d.id !== itemId).map((d) => {
      let s = 0;
      if (d.type === base.type) s += 10;
      s += d.tags.filter((t) => base.tags.includes(t)).length * 4;
      if (d.creator === base.creator) s += 2;
      return { ...d, score: s };
    }).filter((d) => d.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, n || 4);
  }
  function coUsed(itemId, n) {                               /* 설치 동시출현 */
    const co = new Map();
    for (const inst of INSTALLS.values()) {
      if (!inst.has(itemId)) continue;
      for (const other of inst.keys()) if (other !== itemId) co.set(other, (co.get(other) || 0) + 1);
    }
    return [...co.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, n || 4).map(([id, count]) => ({ ...detail(id), coCount: count }));
  }
  function creatorsFor(user, n) {                            /* 설치 이력 기반 크리에이터 추천 */
    const mine = INSTALLS.get(user) || new Map();
    const owned = new Set([...mine.keys()].map((id) => (ITEMS.get(id) || {}).creator));
    return creatorRanking().filter((c) => !owned.has(c.id) && !(SOCIAL.follows.get(user) || new Set()).has(c.id))
      .slice(0, n || 3);
  }

  /* ================================================================
     9. Collections (§13) — 큐레이션 + 자동
     ================================================================ */
  function collection(name, org) {
    if (name === 'New') return storeList({ org, sort: 'updated' }).slice(0, 6);
    if (name === 'Popular') return storeList({ org, sort: 'downloads' }).slice(0, 6);
    if (name === 'Trending') {                               /* 최근 이벤트 절반 구간의 설치 수 */
      const cut = EVENTS.length >> 1;
      const cnt = new Map();
      EVENTS.slice(cut).filter((e) => e.kind === 'install').forEach((e) => cnt.set(e.itemId, (cnt.get(e.itemId) || 0) + 1));
      return [...cnt.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([id]) => detail(id, org)).filter(Boolean).slice(0, 6);
    }
    return storeList({ org }).filter((d) => d.collections.includes(name)).slice(0, 6);
  }

  /* ================================================================
     10. Monetization — 구매·쿠폰·환불 (§14·§15)
     ================================================================ */
  const COUPON_TYPES = ['discount', 'bundle', 'promotion', 'campaign', 'referral'];
  function createCoupon(c) {
    if (!COUPON_TYPES.includes(c.type)) throw new Error('쿠폰 유형 불명');
    if (COUPONS.has(c.code)) throw new Error('쿠폰 코드 중복');
    COUPONS.set(c.code, { code: c.code, type: c.type, pct: c.pct || 0, amount: c.amount || 0,
      items: c.items || null, referrer: c.referrer || null, uses: 0, maxUses: c.maxUses || 999 });
    return COUPONS.get(c.code);
  }
  function priceFor(it, license) {
    if (it.priceModel === 'free') return 0;
    if (license === 'education' && it.eduPrice != null) return it.eduPrice;  /* 명시 교육가 최우선 */
    if (!license || license === it.license) return it.price;   /* 기본 포함 라이선스 = 기본가 */
    if (license === 'enterprise' || license === 'commercial') return it.orgPrice || it.price * 3;
    if (license === 'education') return Math.round(it.price * 0.5);
    return it.price;
  }
  function purchase(user, itemId, opts) {
    const o = opts || {};
    const it = ITEMS.get(itemId);
    if (!it || it.state !== 'published') throw new Error('구매 불가 상태');
    const license = o.license || it.license;
    let price = priceFor(it, license);
    let discount = 0, couponUsed = null;
    if (o.coupon) {
      const c = COUPONS.get(o.coupon);
      if (!c) throw new Error('없는 쿠폰');
      if (c.uses >= c.maxUses) throw new Error('쿠폰 소진');
      if (c.items && !c.items.includes(itemId)) throw new Error('이 상품에 못 쓰는 쿠폰');
      discount = c.pct ? Math.round(price * c.pct / 100) : Math.min(c.amount, price);
      c.uses++; couponUsed = c.code;
      if (c.type === 'referral' && c.referrer) track('share', itemId, c.referrer, { referral: true });
    }
    const paid = Math.max(price - discount, 0);
    const order = { id: nid('ord'), user, itemId, license, price, discount, paid,
      coupon: couponUsed, at: now(), refunded: false,
      subscription: it.priceModel === 'subscription' };
    ORDERS.set(order.id, order);
    track('purchase', itemId, user);
    if (paid > 0) ledgerAdd(it.creator, itemId, order.id, paid);
    return order;
  }
  function refund(orderId) {
    const ord = ORDERS.get(orderId);
    if (!ord) throw new Error('없는 주문');
    if (ord.refunded) throw new Error('이미 환불됨');
    ord.refunded = true;
    track('refund', ord.itemId, ord.user);
    const entry = LEDGER.find((l) => l.order === orderId);
    if (entry) entry.reversed = true;
    return ord;
  }

  /* ================================================================
     11. Revenue — 원장·정산·세금·인보이스 (§16)
     ================================================================ */
  function ledgerAdd(creatorId, itemId, orderId, gross) {
    const fee = Math.round(gross * FEE_RATE);
    const preTax = gross - fee;
    const tax = Math.round(preTax * TAX_RATE);
    LEDGER.push({ id: nid('led'), creator: creatorId, item: itemId, order: orderId,
      gross, fee, tax, net: preTax - tax, at: now(), reversed: false, settled: false });
  }
  function settle(creatorId) {
    const rows = LEDGER.filter((l) => l.creator === creatorId && !l.reversed && !l.settled);
    if (!rows.length) return { ok: false, reason: '정산 대상 없음' };
    rows.forEach((r) => { r.settled = true; });
    const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
    const st = { id: nid('set'), creator: creatorId, count: rows.length,
      gross: sum('gross'), fee: sum('fee'), tax: sum('tax'), net: sum('net'), at: now() };
    SETTLEMENTS.push(st);
    return { ok: true, settlement: st, invoice: invoiceOf(st) };
  }
  function invoiceOf(st) {
    const c = CREATORS.get(st.creator);
    return [
      `INVOICE ${st.id}`, `수취인: ${c ? c.name : st.creator}`, `일자: ${st.at.slice(0, 10)}`,
      `총매출  ₩${st.gross.toLocaleString()}`, `수수료(20%)  -₩${st.fee.toLocaleString()}`,
      `원천세(3.3%)  -₩${st.tax.toLocaleString()}`, `지급액  ₩${st.net.toLocaleString()}`,
    ];
  }

  /* ================================================================
     12. Install 엔진 — 타입별 브리지 (§8·§9)
     ================================================================ */
  const INSTALL_SCOPES = ['personal', 'workspace', 'organization'];
  function install(user, itemId, opts) {
    const o = opts || {};
    const scope = o.scope || 'personal';
    if (!INSTALL_SCOPES.includes(scope)) throw new Error('scope 불명');
    const it = ITEMS.get(itemId);
    if (!it || it.state !== 'published') throw new Error('설치 불가 상태');
    if (it.priceModel !== 'free') {
      const owned = [...ORDERS.values()].some((ord) => ord.user === user && ord.itemId === itemId && !ord.refunded);
      if (!owned) throw new Error('구매 필요');
    }
    const v = latestVersion(itemId);
    if (!v) throw new Error('버전 없음');
    const bridge = bridgeInstall(it, v.payload);             /* 타입별 실브리지 */
    if (!INSTALLS.has(user)) INSTALLS.set(user, new Map());
    INSTALLS.get(user).set(itemId, { version: v.version, scope, at: now(), bridge: bridge.kind });
    track('download', itemId, user);
    track('install', itemId, user, { scope });
    return { ok: true, version: v.version, scope, bridge };
  }
  function bridgeInstall(it, payload) {
    const P = window.MK_PLUGIN, T = window.MK_TPL, D = window.MK_DAM;
    if (it.type === 'plugin' && payload.manifest && payload.factory && P) {
      if (!P._reg.has(payload.manifest.id)) {
        P.publish({ manifest: payload.manifest, factory: payload.factory, visibility: 'public' });
        P.installFromStore(payload.manifest.id);
      }
      return { kind: 'plugin', pluginId: payload.manifest.id, state: P.stateOf(payload.manifest.id) };
    }
    if (payload.template && T && T.register) {
      const ov = payload.overlay || {};
      const reg = T.register(clone(payload.template), {
        styleId: ov.styleId || 'st-modern', animationId: ov.animationId || 'an-none',
        assetIds: ov.assetIds || [],
        ai: ov.ai || { recommended: false, tags: it.tags || [], hints: [] },
      });
      return { kind: 'template', templateId: reg.templateId };
    }
    if (payload.assets && D && D.create) {
      const made = payload.assets.map((a) =>
        D.create({ name: a.name, kind: a.kind || 'image', tags: a.tags || [], workspaceId: 'ws-market' }, a.name));
      return { kind: 'assets', count: made.length, ids: made.map((e) => e.id) };
    }
    return { kind: 'record', keys: Object.keys(payload) };   /* brand kit·prompt·workflow 등 — 레코드 설치 */
  }
  function uninstall(user, itemId) {
    const m = INSTALLS.get(user);
    if (!m || !m.has(itemId)) throw new Error('설치 안 됨');
    m.delete(itemId);
    track('uninstall', itemId, user);
  }
  const installedOf = (user) => [...(INSTALLS.get(user) || new Map()).entries()]
    .map(([id, rec]) => ({ ...detail(id), ...rec, itemId: id }));

  /* ---- Update (§9) — 버전 비교·changelog·수동/자동·롤백 ---- */
  function checkUpdates(user) {
    const m = INSTALLS.get(user) || new Map();
    const out = [];
    for (const [id, rec] of m) {
      const v = latestVersion(id);
      if (v && semverCmp(v.version, rec.version) > 0) {
        const it = ITEMS.get(id);
        const from = it.versions.findIndex((x) => x.version === rec.version);
        out.push({ itemId: id, from: rec.version, to: v.version,
          changelogs: it.versions.slice(from + 1).map((x) => `${x.version}: ${x.changelog}`) });
      }
    }
    return out;
  }
  function updateInstall(user, itemId) {
    const m = INSTALLS.get(user);
    if (!m || !m.has(itemId)) throw new Error('설치 안 됨');
    const rec = m.get(itemId);
    const v = latestVersion(itemId);
    if (semverCmp(v.version, rec.version) <= 0) return { ok: false, reason: '이미 최신' };
    rec.prev = rec.version; rec.version = v.version; rec.at = now();
    track('download', itemId, user);
    return { ok: true, version: v.version };
  }
  function rollbackInstall(user, itemId) {
    const rec = (INSTALLS.get(user) || new Map()).get(itemId);
    if (!rec || !rec.prev) throw new Error('롤백할 이전 버전 없음');
    const cur = rec.version;
    rec.version = rec.prev; rec.prev = null;
    return { ok: true, from: cur, to: rec.version };
  }
  function autoUpdateAll(user) {
    return checkUpdates(user).map((u) => ({ itemId: u.itemId, ...updateInstall(user, u.itemId) }));
  }

  /* ================================================================
     13. Review (§10)
     ================================================================ */
  function addReview(itemId, r) {
    if (!ITEMS.has(itemId)) throw new Error('없는 item');
    if (!(r.stars >= 1 && r.stars <= 5)) throw new Error('별점 1~5');
    const rv = { id: nid('rev'), itemId, user: r.user, stars: r.stars, text: r.text || '',
      screenshot: r.screenshot || null, helpful: new Set(), at: now(), reply: null, reported: false };
    REVIEWS.set(rv.id, rv);
    tick();
    return rv.id;
  }
  const reviewsFor = (itemId) => [...REVIEWS.values()].filter((r) => r.itemId === itemId)
    .map((r) => ({ ...r, helpful: r.helpful.size }));
  function itemRating(itemId) {
    const rs = [...REVIEWS.values()].filter((r) => r.itemId === itemId);
    return rs.length ? +(rs.reduce((s, r) => s + r.stars, 0) / rs.length).toFixed(2) : 0;
  }
  const helpful = (reviewId, user) => { REVIEWS.get(reviewId).helpful.add(user); };
  function replyReview(reviewId, creatorId, text) {
    const rv = REVIEWS.get(reviewId);
    if (ITEMS.get(rv.itemId).creator !== creatorId) throw new Error('본인 상품 리뷰에만 답글 가능');
    rv.reply = { creator: creatorId, text, at: now() };
  }
  const reportReview = (reviewId, user, reason) => { REVIEWS.get(reviewId).reported = true; return report('review', reviewId, user, reason); };

  /* ================================================================
     14. Community (§23) — 좋아요·북마크·댓글·컬렉션·공유·문의
     ================================================================ */
  const setOf = (map, key) => { if (!map.has(key)) map.set(key, new Set()); return map.get(key); };
  const like = (user, itemId) => { setOf(SOCIAL.likes, itemId).add(user); track('favorite', itemId, user); };
  const unlike = (user, itemId) => { setOf(SOCIAL.likes, itemId).delete(user); };
  const bookmark = (user, itemId) => { setOf(SOCIAL.bookmarks, user).add(itemId); };
  const bookmarksOf = (user) => [...(SOCIAL.bookmarks.get(user) || new Set())].map((id) => detail(id)).filter(Boolean);
  const share = (user, itemId) => { setOf(SOCIAL.shares, itemId).add(user); track('share', itemId, user); };
  function comment(itemId, user, text) {
    if (!COMMENTS.has(itemId)) COMMENTS.set(itemId, []);
    const c = { id: nid('cmt'), user, text, at: now(), replies: [] };
    COMMENTS.get(itemId).push(c);
    return c.id;
  }
  const commentsFor = (itemId) => clone(COMMENTS.get(itemId) || []);
  function userCollection(user, name) {
    if (!USER_COLLECTIONS.has(user)) USER_COLLECTIONS.set(user, []);
    const col = { id: nid('col'), name, items: [] };
    USER_COLLECTIONS.get(user).push(col);
    return col.id;
  }
  function addToCollection(user, colId, itemId) {
    const col = (USER_COLLECTIONS.get(user) || []).find((c) => c.id === colId);
    if (!col) throw new Error('없는 컬렉션');
    if (!col.items.includes(itemId)) col.items.push(itemId);
  }
  const collectionsOf = (user) => clone(USER_COLLECTIONS.get(user) || []);
  function inquire(creatorId, user, text) {
    if (!INQUIRIES.has(creatorId)) INQUIRIES.set(creatorId, []);
    INQUIRIES.get(creatorId).push({ id: nid('inq'), user, text, at: now(), answered: false });
  }

  /* ================================================================
     15. Analytics (§17) — 상품·대시보드
     ================================================================ */
  function itemAnalytics(itemId) {
    const views = evCount(itemId, 'view'), dls = evCount(itemId, 'download'),
      ins = evCount(itemId, 'install'), uns = evCount(itemId, 'uninstall'),
      buys = evCount(itemId, 'purchase'), favs = evCount(itemId, 'favorite'),
      shares = evCount(itemId, 'share'), usage = evCount(itemId, 'usage');
    const pct = (a, b) => (b ? +((a / b) * 100).toFixed(1) : 0);
    return {
      views, downloads: dls, installs: ins, usage, favorites: favs, shares,
      installRate: pct(ins, views), conversion: pct(buys, views),
      retention: pct(Math.max(ins - uns, 0), ins),           /* 결정론: 잔존 설치 비율 */
      activeUsers: Math.max(ins - uns, 0),
    };
  }
  function creatorDashboard(creatorId) {
    const items = [...ITEMS.values()].filter((i) => i.creator === creatorId);
    const ids = items.map((i) => i.id);
    const sum = (k) => ids.reduce((s, id) => s + itemAnalytics(id)[k], 0);
    const orders = [...ORDERS.values()].filter((o) => ids.includes(o.itemId));
    const pendingUpdates = items.filter((i) => i.state === 'published' && i.versions.length > 1).length;
    return {
      uploads: items.length, published: items.filter((i) => i.state === 'published').length,
      downloads: sum('downloads'), activeUsers: sum('activeUsers'), favorites: sum('favorites'),
      rating: creator(creatorId).rating,
      revenue: creator(creatorId).revenue,
      refunds: orders.filter((o) => o.refunded).length,
      comments: ids.reduce((s, id) => s + commentsFor(id).length, 0),
      inquiries: (INQUIRIES.get(creatorId) || []).length,
      updateStatus: { versioned: pendingUpdates, total: items.length },
      unsettled: LEDGER.filter((l) => l.creator === creatorId && !l.reversed && !l.settled).reduce((s, l) => s + l.net, 0),
    };
  }

  /* ================================================================
     16. Enterprise 비공개 마켓 (§22)
     ================================================================ */
  function createMarket(m) {
    if (!['school', 'company'].includes(m.type)) throw new Error('마켓 유형: school|company');
    const id = m.id || nid('mkt');
    MARKETS.set(id, { id, org: m.org, type: m.type, name: m.name });
    return id;
  }
  const marketsOf = (org) => [...MARKETS.values()].filter((m) => m.org === org);

  /* ================================================================
     17. API 표면 (§26) — 외부 연동용 이름 고정 래퍼
     ================================================================ */
  const api = {
    publish: (itemId) => publishItem(itemId),
    install: (user, itemId, opts) => install(user, itemId, opts),
    search: (q, opts) => search(q, opts),
    review: (itemId, r) => addReview(itemId, r),
    analytics: (itemId) => itemAnalytics(itemId),
    revenue: (creatorId) => ({ creator: creatorId, ledger: LEDGER.filter((l) => l.creator === creatorId).map(clone) }),
  };

  /* ================================================================
     공개
     ================================================================ */
  return {
    /* 상수 */
    ITEM_TYPES, TYPE_KO, LICENSES, PRICE_MODELS, CURATED, PUB_STATES, PUB_FSM,
    COUPON_TYPES, INSTALL_SCOPES, FEE_RATE, TAX_RATE,
    /* Creator */
    registerCreator, creator, verifyCreator, follow, unfollow, creatorRanking,
    /* Item · Version · FSM */
    createItem, submitVersion, latestVersion, semverCmp, transition,
    submitForReview, adminDecide, publishItem,
    /* Moderation */
    autoChecks, aiReview, report, resolveReport,
    /* 목록 · 상세 · 검색 · 추천 · 컬렉션 */
    storeList, detail, search, similar, coUsed, creatorsFor, collection,
    /* 결제 · 쿠폰 · 환불 · 수익 */
    createCoupon, priceFor, purchase, refund, settle, invoiceOf,
    /* 설치 · 업데이트 */
    install, uninstall, installedOf, checkUpdates, updateInstall, rollbackInstall, autoUpdateAll,
    /* 리뷰 */
    addReview, reviewsFor, itemRating, helpful, replyReview, reportReview,
    /* 커뮤니티 */
    like, unlike, bookmark, bookmarksOf, share, comment, commentsFor,
    userCollection, addToCollection, collectionsOf, inquire,
    /* 분석 */
    track, itemAnalytics, creatorDashboard,
    /* Enterprise */
    createMarket, marketsOf,
    /* API */
    api,
    /* 내부 조회(화면·테스트) */
    _items: ITEMS, _orders: ORDERS, _ledger: LEDGER, _settlements: SETTLEMENTS,
    _reports: REPORTS, _modlog: MOD_LOG, _events: EVENTS, _markets: MARKETS,
  };
})();
