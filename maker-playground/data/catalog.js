/* ============================================================
   K-MAKER Catalog Layer v1  —  window.MK_CAT   (Round 11)
   ------------------------------------------------------------
   Template Browser의 데이터 계층. 화면(screens/library.js)은
   여기 있는 질의 API만 호출한다 — 필터/정렬/검색/추천/썸네일.

   · CATEGORIES  최상위 9종 (아이콘 + 설명)
   · TYPES       Category → Project Type
   · FACETS      Style 6 · Color 5 · Theme 3 · Ratio · Pages
   · ENTRIES     실템플릿(엔진 산출물, live:true) + 카탈로그 목업
                 (성능 검증용 · live:false — 열면 실템플릿으로 폴백)
   · query()     cat/type/q/filters/sort → 결과 배열 (단일 통과)
   · poster()    엔트리 → 경량 SVG 썸네일 (아키타입 6종) + 캐시
   · use()       사용 기록 → recents + 타입 친화도 → recommend()

   ⚠ 실템플릿은 현재 2종(Presentation·Pitch Deck) + 샘플 8종.
     나머지는 "탐색 구조·성능"을 검증하기 위한 목업 카탈로그이며
     카드에 라벨로 명시된다. 실제 제작은 Round 12+에서 채운다.
   ============================================================ */
window.MK_CAT = (() => {

  /* ---------- STEP 2 Category ---------- */
  const CATEGORIES = [
    ['presentation', 'Presentation', '▤', '발표·피칭·강의 — 화면으로 말하는 자료'],
    ['document',     'Document',     '▧', '제안서·보고서·문서 — 읽히는 자료'],
    ['video',        'Video',        '▷', '영상·스토리보드 — 시간이 흐르는 자료'],
    ['social',       'Social',       '◎', 'SNS·카드뉴스 — 피드에서 멈추게 하는 자료'],
    ['website',      'Website',      '▭', '랜딩·프로필 페이지 — 스크롤되는 화면'],
    ['print',        'Print',        '▣', '포스터·브로슈어 — 인쇄되는 자료'],
    ['marketing',    'Marketing',    '◈', '캠페인·런칭 — 파는 자료'],
    ['business',     'Business',     '▦', '견적·인보이스·운영 — 일하는 서식'],
    ['personal',     'Personal',     '✦', '이력·초대·기록 — 나를 담는 자료'],
  ].map(([key, name, icon, desc]) => ({ key, name, icon, desc }));

  /* ---------- STEP 3 Project Type ---------- */
  const TYPES = {
    presentation: ['Pitch Deck', 'Company Profile', 'Proposal', 'Portfolio', 'Report', 'Presentation', 'Training', 'Seminar', 'Meeting'],
    document:     ['Business Proposal', 'Business Report', 'Whitepaper', 'Case Study', 'Manual', 'Contract', 'Meeting Notes'],
    video:        ['Shorts Storyboard', 'YouTube Presentation', 'Promo Video', 'Explainer', 'Event Recap'],
    social:       ['Instagram Carousel', 'Instagram Post', 'Story', 'Thumbnail', 'Card News'],
    website:      ['Landing Page', 'Product Page', 'Personal Site', 'Event Page', 'Coming Soon'],
    print:        ['Poster', 'Brochure', 'Flyer', 'Menu', 'Photo Book', 'Certificate'],
    marketing:    ['Product Launch', 'Campaign Deck', 'Newsletter', 'Brand Guide', 'Media Kit'],
    business:     ['Invoice', 'Quotation', 'Planner', 'Org Chart', 'Timesheet', 'Onboarding'],
    personal:     ['Resume', 'Invitation', 'Greeting Card', 'Wedding', 'Travel Log', 'Diary'],
  };

  /* ---------- STEP 7 Filter — 패싯 ---------- */
  const STYLES = ['Modern', 'Minimal', 'Luxury', 'Editorial', 'Corporate', 'Creative'];
  const COLORS = ['Blue', 'Dark', 'Green', 'Neutral', 'Orange'];
  const THEMES = ['Light', 'Dark', 'Mixed'];
  const RATIOS = ['16:9', '4:5', '1:1', '9:16', 'A4'];
  const PAGEBUCKETS = [['any', '전체'], ['s', '1–4장'], ['m', '5–12장'], ['l', '13장+']];

  /* 색 계열 → 실제 팔레트 (썸네일·칩 공용) */
  const COLORHEX = {
    Blue:    { a: '#3B5BDB', b: '#0E1B3A', s: '#EBEFF8' },
    Dark:    { a: '#B99146', b: '#14120E', s: '#F1EDE2' },
    Green:   { a: '#2E8C7F', b: '#12211B', s: '#E3F1EE' },
    Neutral: { a: '#6B7480', b: '#1F2733', s: '#EFF1F4' },
    Orange:  { a: '#E8735A', b: '#2A1A16', s: '#FBE9E4' },
  };

  const pageBucket = (n) => (n <= 4 ? 's' : n <= 12 ? 'm' : 'l');

  /* ============================================================
     ENTRIES — 실템플릿 매핑 + 카탈로그 목업
     ============================================================ */

  /* 실템플릿(MK_SAMPLE.TEMPLATES)을 카탈로그 스키마로 승격 */
  const LIVE_MAP = {
    'tpl-pr-presentation-01': { cat: 'presentation', type: 'Presentation', style: 'Editorial', color: 'Green',  theme: 'Mixed', premium: true },
    'pitch-deck-01':          { cat: 'presentation', type: 'Pitch Deck',   style: 'Modern',    color: 'Green',  theme: 'Mixed', premium: true },
    'smp-pres-01':            { cat: 'presentation', type: 'Training',     style: 'Corporate', color: 'Green',  theme: 'Light' },
    'smp-card-01':            { cat: 'social',       type: 'Card News',    style: 'Creative',  color: 'Orange', theme: 'Light' },
    'smp-vid-01':             { cat: 'video',        type: 'Promo Video',  style: 'Creative',  color: 'Dark',   theme: 'Mixed' },
    'smp-post-01':            { cat: 'print',        type: 'Poster',       style: 'Editorial', color: 'Neutral', theme: 'Light' },
    'smp-work-01':            { cat: 'document',     type: 'Manual',       style: 'Minimal',   color: 'Green',  theme: 'Light' },
    'smp-thumb-01':           { cat: 'social',       type: 'Thumbnail',    style: 'Modern',    color: 'Dark',   theme: 'Dark' },
    'smp-act-01':             { cat: 'business',     type: 'Onboarding',   style: 'Minimal',   color: 'Neutral', theme: 'Light' },
    'smp-sns-01':             { cat: 'social',       type: 'Instagram Post', style: 'Modern',  color: 'Blue',   theme: 'Light' },
  };

  /* 재현 가능한 난수 (같은 카탈로그가 매번 같게 나오도록) */
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  /* 목업 이름 생성 — 타입별 어휘 조합 (무의미 문자열 금지) */
  const NAMEA = ['Aurora', 'Meridian', 'Northline', 'Solstice', 'Cobalt', 'Atlas', 'Harbor', 'Quartz', 'Verse', 'Loop',
    'Fold', 'Prism', 'Anchor', 'Field', 'Studio', 'Signal', 'Slate', 'Grain', 'Orbit', 'Mono'];
  const NAMEB = ['Report', 'Story', 'Series', 'Suite', 'Kit', 'Set', 'Edition', 'System', 'Frame', 'Sheet'];

  const ARCH = ['cover', 'split', 'grid', 'editorial', 'statement', 'chart'];

  function buildEntries(total) {
    const out = [];

    /* 1) 실템플릿 */
    (window.MK_SAMPLE?.TEMPLATES || []).forEach((t) => {
      const m = LIVE_MAP[t.templateId];
      if (!m) return;
      out.push({
        id: t.templateId, tplId: t.templateId, live: true,
        name: t.title.replace(' (샘플)', ''),
        cat: m.cat, type: m.type, style: m.style, color: m.color, theme: m.theme,
        ratio: t.ratio, pages: t.scenes.length, premium: !!m.premium,
        isNew: !!m.premium, popularity: m.premium ? 98 : 60 + (t.scenes.length * 2),
        arch: m.premium ? 'editorial' : 'cover',
        tags: t.tags || [], desc: t.description || '',
      });
    });

    /* 2) 카탈로그 목업 — 탐색·성능 검증용 */
    const r = rng(20260719);
    let i = 0;
    while (out.length < total) {
      const c = CATEGORIES[Math.floor(r() * CATEGORIES.length)];
      const types = TYPES[c.key];
      const type = types[Math.floor(r() * types.length)];
      const style = STYLES[Math.floor(r() * STYLES.length)];
      const color = COLORS[Math.floor(r() * COLORS.length)];
      const theme = THEMES[Math.floor(r() * THEMES.length)];
      const pages = 1 + Math.floor(r() * 24);
      const ratio = c.key === 'social' ? (r() < 0.5 ? '4:5' : '1:1')
        : c.key === 'print' ? 'A4'
        : c.key === 'video' ? (r() < 0.35 ? '9:16' : '16:9') : '16:9';
      i += 1;
      out.push({
        id: 'cat-' + String(i).padStart(4, '0'), tplId: null, live: false,
        name: `${NAMEA[Math.floor(r() * NAMEA.length)]} ${type} ${NAMEB[Math.floor(r() * NAMEB.length)]}`,
        cat: c.key, type, style, color, theme, ratio, pages,
        premium: r() < 0.34, isNew: r() < 0.12,
        popularity: Math.floor(r() * 100),
        arch: ARCH[Math.floor(r() * ARCH.length)],
        tags: [type, style, color], desc: `${type} · ${style} · ${pages}장`,
      });
    }
    return out;
  }

  const ENTRIES = buildEntries(1000);

  /* 검색 인덱스 — 소문자 단일 문자열 (1회 생성) */
  ENTRIES.forEach((e) => {
    e._ix = [e.name, e.type, e.cat, e.style, e.color, e.theme, e.ratio, e.pages + '장', ...(e.tags || [])]
      .join(' ').toLowerCase();
    e._bucket = pageBucket(e.pages);
  });

  const byId = new Map(ENTRIES.map((e) => [e.id, e]));
  const get = (id) => byId.get(id) || null;

  /* ============================================================
     STEP 6/7 — 질의 (검색 · 필터 · 정렬) 단일 통과
     ============================================================ */
  const EMPTY = { style: '', color: '', theme: '', ratio: '', pages: 'any' };

  function query(st = {}) {
    const f = { ...EMPTY, ...(st.filters || {}) };
    const q = (st.q || '').trim().toLowerCase();
    const favs = st.favs || new Set();
    const out = [];
    for (let i = 0; i < ENTRIES.length; i++) {
      const e = ENTRIES[i];
      if (st.cat && st.cat !== 'all' && e.cat !== st.cat) continue;
      if (st.type && e.type !== st.type) continue;
      if (f.style && e.style !== f.style) continue;
      if (f.color && e.color !== f.color) continue;
      if (f.theme && e.theme !== f.theme) continue;
      if (f.ratio && e.ratio !== f.ratio) continue;
      if (f.pages && f.pages !== 'any' && e._bucket !== f.pages) continue;
      if (st.onlyFav && !favs.has(e.id)) continue;
      if (st.onlyLive && !e.live) continue;
      if (q && e._ix.indexOf(q) === -1) continue;
      out.push(e);
    }
    const sort = st.sort || 'recommend';
    const aff = affinity();
    const score = (e) => (e.live ? 400 : 0) + (aff[e.type] || 0) * 30 + e.popularity + (e.premium ? 20 : 0);
    if (sort === 'recommend') out.sort((a, b) => score(b) - score(a));
    else if (sort === 'popular') out.sort((a, b) => b.popularity - a.popularity);
    else if (sort === 'new') out.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.popularity - a.popularity);
    else if (sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'pages') out.sort((a, b) => b.pages - a.pages);
    return out;
  }

  const countBy = (key) => {
    const m = {};
    for (const e of ENTRIES) m[e[key]] = (m[e[key]] || 0) + 1;
    return m;
  };

  /* 검색 제안 — 타입/스타일/이름 앞부분 매칭 */
  function suggest(q, limit = 6) {
    const s = (q || '').trim().toLowerCase();
    if (!s) return [];
    const pool = new Set();
    Object.values(TYPES).forEach((a) => a.forEach((t) => pool.add(t)));
    STYLES.forEach((x) => pool.add(x)); COLORS.forEach((x) => pool.add(x));
    const hits = [...pool].filter((x) => x.toLowerCase().includes(s)).slice(0, limit);
    if (hits.length < limit) {
      for (const e of ENTRIES) {
        if (hits.length >= limit) break;
        if (e.name.toLowerCase().includes(s) && !hits.includes(e.name)) hits.push(e.name);
      }
    }
    return hits;
  }

  /* ---------- 최근 검색 ---------- */
  const recentQueries = [];
  function pushQuery(q) {
    const s = (q || '').trim();
    if (!s) return recentQueries;
    const i = recentQueries.indexOf(s);
    if (i > -1) recentQueries.splice(i, 1);
    recentQueries.unshift(s);
    if (recentQueries.length > 8) recentQueries.length = 8;
    return recentQueries;
  }

  /* ============================================================
     STEP 8 — 사용 기록 기반 추천
     ============================================================ */
  const recents = [];           /* 최근 사용 entry id */
  const usedTypes = {};         /* type → 사용 횟수 */

  /* 같이 쓰이는 자료 — 지시서 예시(Pitch Deck → Proposal·Company Profile·Business Report) 포함 */
  const NEIGHBORS = {
    'Pitch Deck': ['Proposal', 'Company Profile', 'Business Report'],
    'Presentation': ['Report', 'Seminar', 'Training'],
    'Proposal': ['Business Report', 'Quotation', 'Company Profile'],
    'Company Profile': ['Portfolio', 'Media Kit', 'Brand Guide'],
    'Card News': ['Instagram Carousel', 'Instagram Post', 'Newsletter'],
    'Poster': ['Flyer', 'Brochure', 'Certificate'],
    'Resume': ['Portfolio', 'Personal Site', 'Media Kit'],
    'Landing Page': ['Product Launch', 'Product Page', 'Campaign Deck'],
    'Invoice': ['Quotation', 'Contract', 'Timesheet'],
    'Promo Video': ['Shorts Storyboard', 'Explainer', 'Event Recap'],
  };

  function use(id) {
    const e = get(id);
    if (!e) return null;
    const i = recents.indexOf(id);
    if (i > -1) recents.splice(i, 1);
    recents.unshift(id);
    if (recents.length > 12) recents.length = 12;
    usedTypes[e.type] = (usedTypes[e.type] || 0) + 1;
    return e;
  }

  /* 타입 친화도 — 직접 사용 + 이웃 타입 파급 */
  function affinity() {
    const a = {};
    Object.keys(usedTypes).forEach((t) => {
      a[t] = (a[t] || 0) + usedTypes[t] * 2;
      (NEIGHBORS[t] || []).forEach((n) => { a[n] = (a[n] || 0) + usedTypes[t]; });
    });
    return a;
  }

  /* 추천 목록 — 사용 이력 없으면 프리미엄/인기 폴백 */
  function recommend(n = 6) {
    const a = affinity();
    const keys = Object.keys(a);
    if (!keys.length) {
      return ENTRIES.filter((e) => e.live || e.premium)
        .sort((x, y) => (y.live ? 1 : 0) - (x.live ? 1 : 0) || y.popularity - x.popularity).slice(0, n);
    }
    const used = new Set(recents);
    /* 이미 자주 만든 타입은 감점 — 추천의 목적은 "다음 자료"다 */
    const sc = (e) => a[e.type] * (usedTypes[e.type] ? 0.35 : 1) + (e.live ? 6 : 0) + e.popularity / 100;
    const pool = ENTRIES.filter((e) => a[e.type] && !used.has(e.id)).sort((x, y) => sc(y) - sc(x));
    const seen = {}, out = [];
    for (const e of pool) {                      /* 타입당 2개 상한 — 한 종류가 화면을 먹지 않게 */
      if ((seen[e.type] = (seen[e.type] || 0) + 1) > 2) continue;
      out.push(e);
      if (out.length >= n) break;
    }
    return out;
  }

  /* 추천 근거 한 줄 — 왜 이게 떴는지 숨기지 않는다 */
  function recommendReason() {
    const top = Object.keys(usedTypes).sort((a, b) => usedTypes[b] - usedTypes[a])[0];
    return top ? `${top}을(를) 자주 만들어서 이어지는 자료를 골랐어요` : '프리미엄 완성 템플릿부터 보여드려요';
  }

  /* ============================================================
     STEP 1 — Home Rails
     ============================================================ */
  function rails(favs = new Set()) {
    const pop = [...ENTRIES].sort((a, b) => b.popularity - a.popularity);
    return [
      { key: 'reco',   title: 'AI 추천',     note: recommendReason(),          items: recommend(8) },
      { key: 'recent', title: '최근 사용',   note: '이어서 만들기',            items: recents.map(get).filter(Boolean) },
      { key: 'fav',    title: '즐겨찾기',    note: '모아둔 템플릿',            items: ENTRIES.filter((e) => favs.has(e.id)) },
      { key: 'new',    title: '새 템플릿',   note: '이번 주 추가',             items: ENTRIES.filter((e) => e.isNew).slice(0, 8) },
      { key: 'pop',    title: '인기 템플릿', note: '많이 쓰인 순',             items: pop.slice(0, 8) },
      { key: 'prem',   title: '완성형 프리미엄', note: '실제 렌더되는 템플릿', items: ENTRIES.filter((e) => e.live).slice(0, 8) },
    ];
  }

  /* ============================================================
     STEP 9 — 썸네일: 경량 SVG 포스터 + 캐시
     ------------------------------------------------------------
     실템플릿은 Scene 렌더(MK.sceneThumb), 목업은 아키타입 포스터.
     캐시는 id → 문자열 Map (상한 600, 초과 시 오래된 것부터 폐기).
     ============================================================ */
  const cache = new Map();
  const CACHE_MAX = 600;
  const stats = { hit: 0, miss: 0 };

  function paint(e) {
    const c = COLORHEX[e.color] || COLORHEX.Neutral;
    const dark = e.theme === 'Dark';
    const bg = dark ? c.b : '#FFFFFF';
    const soft = dark ? 'rgba(255,255,255,.10)' : c.s;
    const ink = dark ? 'rgba(255,255,255,.86)' : '#2A3340';
    const mut = dark ? 'rgba(255,255,255,.34)' : 'rgba(42,51,64,.30)';
    const W = 160, H = e.ratio === '1:1' ? 160 : e.ratio === '4:5' ? 200 : e.ratio === '9:16' ? 284 : e.ratio === 'A4' ? 226 : 90;
    const bar = (x, y, w, h, f, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r == null ? 1.5 : r}" fill="${f}"/>`;
    const u = (p) => Math.round(H * p) / 100;
    let g = '';
    if (e.arch === 'cover') {
      g = bar(0, 0, W, u(2), c.a, 0) + bar(14, u(22), 60, u(3), c.a) + bar(14, u(34), 104, u(11), ink)
        + bar(14, u(50), 78, u(9), ink) + bar(14, u(72), 22, u(2.5), c.a) + bar(14, u(80), 60, u(3), mut);
    } else if (e.arch === 'split') {
      g = bar(88, 0, 72, H, soft, 0) + bar(96, u(26), 52, u(34), c.a, 3) + bar(14, u(24), 34, u(3), c.a)
        + bar(14, u(33), 62, u(8), ink) + bar(14, u(48), 58, u(3), mut) + bar(14, u(55), 50, u(3), mut) + bar(14, u(66), 20, u(2.5), c.a);
    } else if (e.arch === 'grid') {
      g = bar(14, u(14), 44, u(4), ink);
      for (let i = 0; i < 6; i++) g += bar(14 + (i % 3) * 46, u(28) + Math.floor(i / 3) * u(30), 40, u(24), i % 3 === 1 ? soft : (dark ? 'rgba(255,255,255,.07)' : '#F1F3F6'), 3)
        + bar(18 + (i % 3) * 46, u(34) + Math.floor(i / 3) * u(30), 24, u(3), i === 0 ? c.a : mut);
    } else if (e.arch === 'editorial') {
      g = bar(14, u(16), 26, u(3), c.a) + bar(14, u(26), 88, u(8.5), ink) + bar(14, u(40), 70, u(8.5), ink)
        + bar(112, u(26), 34, u(46), soft, 3) + bar(14, u(60), 74, u(2.6), mut) + bar(14, u(67), 62, u(2.6), mut)
        + bar(14, u(80), 132, 0.8, mut, 0);
    } else if (e.arch === 'statement') {
      g = bar(0, 0, W, H, dark ? bg : c.b, 0) + bar(26, u(38), 108, u(12), 'rgba(255,255,255,.88)')
        + bar(26, u(58), 62, u(4), c.a) + bar(26, u(72), 40, u(2.6), 'rgba(255,255,255,.35)');
    } else {
      const vals = [46, 62, 40, 76, 58];
      g = bar(14, u(14), 40, u(4), ink) + bar(14, u(78), 132, 0.8, mut, 0);
      vals.forEach((v, i) => { const h = u(v * 0.62); g += bar(20 + i * 26, u(78) - h, 16, h, i === 3 ? c.a : soft, 2); });
      g += bar(112, u(16), 34, u(3), c.a);
    }
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;background:${bg}">${g}</svg>`;
  }

  function poster(e) {
    if (cache.has(e.id)) { stats.hit++; return cache.get(e.id); }
    stats.miss++;
    let svg;
    if (e.live && window.MK && window.MK_SAMPLE) {
      const tpl = window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === e.tplId);
      svg = tpl ? window.MK.sceneThumb(tpl.scenes[0]) : paint(e);
    } else svg = paint(e);
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(e.id, svg);
    return svg;
  }

  /* 실템플릿 Preview용 씬 3장 — Cover · 대표 · 마지막 (STEP 5) */
  function previewScenes(e) {
    if (!e.live) return null;
    const tpl = window.MK_SAMPLE.TEMPLATES.find((t) => t.templateId === e.tplId);
    if (!tpl) return null;
    const s = tpl.scenes;
    const mid = s[Math.min(s.length - 1, Math.max(1, Math.round(s.length * 0.45)))];
    return [
      { label: 'Cover', scene: s[0] },
      { label: '대표 Scene', scene: mid },
      { label: '마지막 Scene', scene: s[s.length - 1] },
    ];
  }

  /* ============================================================
     STEP 9 — Virtual List 계산 (순수 함수 · 테스트 대상)
     ============================================================ */
  function windowRange({ scrollTop, viewH, rowH, cols, total, buffer = 2 }) {
    const rows = Math.ceil(total / cols);
    const first = Math.min(Math.max(0, rows - 1), Math.max(0, Math.floor(scrollTop / rowH) - buffer));
    const last = Math.min(rows - 1, Math.ceil((scrollTop + viewH) / rowH) + buffer);
    return {
      rows, firstRow: first, lastRow: Math.max(first, last),
      start: first * cols,
      end: Math.min(total, (Math.max(first, last) + 1) * cols),
      padTop: first * rowH,
      totalH: rows * rowH,
    };
  }

  return {
    CATEGORIES, TYPES, STYLES, COLORS, THEMES, RATIOS, PAGEBUCKETS, COLORHEX,
    ENTRIES, get, query, countBy, suggest, recentQueries, pushQuery,
    use, recents, usedTypes, affinity, recommend, recommendReason, NEIGHBORS, rails,
    poster, paint, previewScenes, windowRange,
    cache, cacheStats: stats, clearCache: () => { cache.clear(); stats.hit = 0; stats.miss = 0; },
  };
})();
