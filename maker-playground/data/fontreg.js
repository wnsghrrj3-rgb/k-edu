/* ============================================================
   MK_FONTREG — K-Maker Font Registry & Typography System (R155)
   ------------------------------------------------------------
   케이메이커가 아는 글꼴을 한 곳에서 관리한다. 요소·템플릿은 글꼴 이름 대신
   fontId 를 참조할 수 있고(옛 요소의 el.font 이름도 그대로 읽힌다), 렌더는
   다음 순서를 지킨다:

     Template Load → 필요한 글꼴 수집(requiredOf) → Registry 조회(resolve)
     → 글꼴 로드(ensure: document.fonts.load) → Font Ready → 배치 계산 → 그림

   원칙
   · Exact 우선 — 같은 이름의 글꼴이 있으면 반드시 그 글꼴. 별칭(ALIASES)·
     사이드카 fontMap 은 같은 글꼴의 다른 표기(Noto Sans CJK KR = Noto Sans KR).
   · Compatible → Fallback 은 케이메이커에 없는 글꼴일 때만. 대체가 일어나면
     SUBS 에 남겨 내부에서 확인한다(substitutions()).
   · 로드 실패는 감춰지지 않는다 — STATUS 가 'failed' 로 남고 onChange 로 알린다.
     실패했다고 마음대로 다른 글꼴로 바꾸지 않는다(브라우저 폴백은 화면이
     비지 않게 하는 안전망일 뿐, 문서의 fontId/font 는 그대로다).
   · metrics — 글꼴별 실측 문자폭·ascent/descent(fontkit 으로 실폰트에서 읽음).
     브라우저에서 글꼴이 실제로 로드되면 canvas measureText 로 다시 재서
     LIVE 표를 덮는다(measureLive). 렌더의 폭 계산이 이 표를 쓴다.
   · 특정 템플릿 하드코딩 없음. 패키지가 동봉한 글꼴(pkg.fonts)은
     addPackageFonts 로 등록되어 같은 문을 통과한다.
   ============================================================ */
window.MK_FONTREG = (() => {
  'use strict';

  /* ---------------- 등록부 ----------------
     metrics: han 한글 · cjkp CJK 부호 · sp 공백 · up 대문자 · lo 소문자 · di 숫자 · pu 부호 · ot 기타 (em)
              asc/desc = hhea ascent/descent (em, 브라우저 줄상자 계산과 같은 값) */
  const G = (fam, w) => ({ type: 'google', family: fam, weights: w });
  const FONTS = [
    { id: 'pretendard', family: 'Pretendard', displayName: '프리텐다드', category: 'sans', language: ['ko', 'en'],
      weights: [300, 400, 500, 600, 700, 800, 900], styles: ['normal'], source: { type: 'local', href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css' },
      fallback: null, license: { name: 'SIL OFL 1.1', url: 'https://github.com/orioncactus/pretendard' },
      metrics: { asc: .952, desc: .241, han: .864, cjkp: .639, sp: .251, up: .641, lo: .506, di: .584, pu: .268, ot: .527 } },
    { id: 'noto-sans-kr', family: 'Noto Sans KR', displayName: '노토 산스', category: 'sans', language: ['ko', 'en'],
      weights: [300, 400, 500, 700], styles: ['normal'], source: G('Noto Sans KR', [300, 400, 500, 700]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/noto/specimen/Noto+Sans+KR' },
      metrics: { asc: 1.16, desc: .288, han: .920, cjkp: .920, sp: .224, up: .636, lo: .530, di: .555, pu: .335, ot: .520 } },
    { id: 'nanum-gothic', family: 'Nanum Gothic', displayName: '나눔고딕', category: 'sans', language: ['ko', 'en'],
      weights: [400, 700, 800], styles: ['normal'], source: G('Nanum Gothic', [400, 700]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Nanum+Gothic' },
      metrics: { asc: .92, desc: .23, han: .940, cjkp: .940, sp: .280, up: .651, lo: .520, di: .606, pu: .322, ot: .573 } },
    { id: 'jua', family: 'Jua', displayName: '주아', category: 'display', language: ['ko', 'en'],
      weights: [400], styles: ['normal'], source: G('Jua', [400]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Jua' },
      metrics: { asc: .95, desc: .25, han: .819, cjkp: .819, sp: .300, up: .608, lo: .480, di: .576, pu: .303, ot: .578 } },
    { id: 'do-hyeon', family: 'Do Hyeon', displayName: '도현', category: 'display', language: ['ko', 'en'],
      weights: [400], styles: ['normal'], source: G('Do Hyeon', [400]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Do+Hyeon' },
      metrics: { asc: .95, desc: .25, han: .768, cjkp: .768, sp: .300, up: .548, lo: .456, di: .509, pu: .227, ot: .476 } },
    { id: 'black-han-sans', family: 'Black Han Sans', displayName: '검은고딕', category: 'display', language: ['ko', 'en'],
      weights: [400], styles: ['normal'], source: G('Black Han Sans', [400]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Black+Han+Sans' },
      metrics: { asc: .95, desc: .25, han: .832, cjkp: .832, sp: .300, up: .696, lo: .634, di: .600, pu: .310, ot: .561 } },
    { id: 'gowun-dodum', family: 'Gowun Dodum', displayName: '고운돋움', category: 'sans', language: ['ko', 'en'],
      weights: [400], styles: ['normal'], source: G('Gowun Dodum', [400]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Gowun+Dodum' },
      metrics: { asc: .93, desc: .25, han: .914, cjkp: .914, sp: .310, up: .626, lo: .464, di: .531, pu: .321, ot: .583 } },
    { id: 'gowun-batang', family: 'Gowun Batang', displayName: '고운바탕', category: 'serif', language: ['ko', 'en'],
      weights: [400, 700], styles: ['normal'], source: G('Gowun Batang', [400, 700]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Gowun+Batang' },
      metrics: { asc: .93, desc: .25, han: .914, cjkp: .914, sp: .310, up: .632, lo: .485, di: .531, pu: .321, ot: .583 } },
    { id: 'nanum-pen-script', family: 'Nanum Pen Script', displayName: '나눔 손글씨 펜', category: 'handwriting', language: ['ko', 'en'],
      weights: [400], styles: ['normal'], source: G('Nanum Pen Script', [400]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Nanum+Pen+Script' },
      metrics: { asc: .93, desc: .25, han: .624, cjkp: .624, sp: .280, up: .436, lo: .385, di: .340, pu: .258, ot: .419 } },
    { id: 'gaegu', family: 'Gaegu', displayName: '개구쟁이', category: 'handwriting', language: ['ko', 'en'],
      weights: [300, 400, 700], styles: ['normal'], source: G('Gaegu', [400, 700]),
      fallback: 'pretendard', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Gaegu' },
      metrics: { asc: .93, desc: .25, han: .820, cjkp: .820, sp: .420, up: .541, lo: .443, di: .509, pu: .372, ot: .609 } },
    { id: 'cormorant-garamond', family: 'Cormorant Garamond', displayName: '코모런트 가라몬드', category: 'serif', language: ['en'],
      weights: [300, 400, 500, 600, 700], styles: ['normal', 'italic'], source: G('Cormorant Garamond', [300, 400, 500, 600, 700]),
      fallback: 'gowun-batang', license: { name: 'SIL OFL 1.1', url: 'https://fonts.google.com/specimen/Cormorant+Garamond' },
      metrics: { asc: .924, desc: .287, han: .914, cjkp: .914, sp: .234, up: .638, lo: .441, di: .431, pu: .208, ot: .454 } },
  ];

  /* 같은 글꼴의 다른 표기 — 대체가 아니라 동일 글꼴 (Exact 로 친다) */
  const ALIASES = {
    'Noto Sans CJK KR': 'noto-sans-kr', 'Noto Sans CJK': 'noto-sans-kr', 'Noto Sans KR Variable': 'noto-sans-kr', 'NotoSansKR': 'noto-sans-kr', 'NotoSansCJKkr': 'noto-sans-kr',
    'Pretendard Variable': 'pretendard', 'Pretendard JP': 'pretendard', 'PretendardVariable': 'pretendard',
    'NanumGothic': 'nanum-gothic', '나눔고딕': 'nanum-gothic', 'Nanum Gothic Bold': 'nanum-gothic',
    'NanumPen': 'nanum-pen-script', 'Nanum Pen': 'nanum-pen-script', '나눔손글씨 펜': 'nanum-pen-script',
    'BlackHanSans': 'black-han-sans', 'DoHyeon': 'do-hyeon', 'GowunBatang': 'gowun-batang', 'GowunDodum': 'gowun-dodum',
    'CormorantGaramond': 'cormorant-garamond', 'Cormorant': 'cormorant-garamond',
  };
  /* 케이메이커에 없는 글꼴 → 성격이 가까운 글꼴 (Compatible). 이름 그대로 있으면 여긴 안 온다 */
  const COMPAT = {
    'Noto Serif CJK KR': 'gowun-batang', 'Noto Serif KR': 'gowun-batang', 'Nanum Myeongjo': 'gowun-batang', 'NanumMyeongjo': 'gowun-batang',
    'Georgia': 'cormorant-garamond', 'Times New Roman': 'cormorant-garamond', 'Times': 'cormorant-garamond', 'EB Garamond': 'cormorant-garamond', 'Playfair Display': 'cormorant-garamond', 'Libre Baskerville': 'cormorant-garamond',
    'Arial': 'pretendard', 'Helvetica': 'pretendard', 'Inter': 'pretendard', 'Roboto': 'pretendard', 'Apple SD Gothic Neo': 'pretendard', 'Malgun Gothic': 'pretendard', 'sans-serif': 'pretendard', 'system-ui': 'pretendard',
    'Nanum Brush Script': 'nanum-pen-script', 'Caveat': 'nanum-pen-script', 'Dancing Script': 'nanum-pen-script',
  };
  const FALLBACK_ID = 'pretendard';

  const byId = {}; const byFamily = {};
  const index = () => { FONTS.forEach((f) => { byId[f.id] = f; byFamily[f.family.toLowerCase()] = f; }); };
  index();

  const norm = (s) => String(s || '').trim().replace(/^['"]|['"]$/g, '');
  const get = (id) => byId[id] || null;
  const list = () => FONTS.slice();

  /* 성격으로 짚기 — COMPAT 표에도 없는 낯선 이름을 카테고리로만 대체 */
  const guessCategory = (fam) => {
    const s = fam.toLowerCase();
    if (/serif|batang|myeongjo|garamond|times|georgia|playfair|baskerville|didot|bodoni/.test(s) && !/sans/.test(s)) return 'serif';
    if (/script|pen|brush|hand|caveat|dancing|손글씨/.test(s)) return 'handwriting';
    if (/black|display|poster|impact|bebas|anton/.test(s)) return 'display';
    return 'sans';
  };
  const byCategory = (cat) => FONTS.find((f) => f.category === cat && f.language.includes('ko')) || byId[FALLBACK_ID];

  /* 대체 기록 — 내부 확인용 */
  const SUBS = [];
  const seenSub = new Set();
  const noteSub = (rec) => { const k = rec.requested + '→' + rec.family + ':' + rec.match; if (seenSub.has(k)) return; seenSub.add(k); SUBS.push(rec); };

  /* ---------------- 해석: Exact → Alias → (사이드카 map) → Compatible → Fallback ---------------- */
  function resolve(name, opts) {
    opts = opts || {};
    const req = norm(name);
    if (!req) { const f = byId[FALLBACK_ID]; return { fontId: f.id, family: f.family, requested: '', match: 'default', substituted: false, entry: f }; }
    let e = byId[req] || byFamily[req.toLowerCase()];
    if (e) return { fontId: e.id, family: e.family, requested: req, match: 'exact', substituted: false, entry: e };
    /* 패키지 사이드카 map: 값이 등록부 글꼴이면 그것으로(원래 이름과 같은 글꼴로 선언된 것이라 exact 취급하지 않고 alias 로 남긴다) */
    if (opts.map && opts.map[req]) { const m = resolve(opts.map[req]); if (m.entry && m.match === 'exact') return { ...m, requested: req, match: 'alias', substituted: false }; }
    const a = ALIASES[req]; if (a && byId[a]) { e = byId[a]; return { fontId: e.id, family: e.family, requested: req, match: 'alias', substituted: false, entry: e }; }
    const c = COMPAT[req]; if (c && byId[c]) { e = byId[c]; const r = { fontId: e.id, family: e.family, requested: req, match: 'compatible', substituted: true, entry: e }; noteSub({ requested: req, family: e.family, match: 'compatible', where: opts.where || '' }); return r; }
    e = byCategory(guessCategory(req));
    const r = { fontId: e.id, family: e.family, requested: req, match: e.id === FALLBACK_ID ? 'fallback' : 'compatible', substituted: true, entry: e };
    noteSub({ requested: req, family: e.family, match: r.match, where: opts.where || '' });
    return r;
  }
  /* 요소 하나의 글꼴 해석 — fontId 가 있으면 우선, 없으면 옛 이름(el.font) */
  function resolveEl(el) { return resolve(el && (el.fontId || el.font), { where: el && (el.aid || el.label) }); }

  /* 굵기 스냅 — 그 글꼴이 가진 굵기 중 가장 가까운 것. 문서 값은 안 바꾼다(표시·로드용) */
  function nearestWeight(entry, w) {
    w = +w || 400; const ws = (entry && entry.weights && entry.weights.length) ? entry.weights : [400, 700];
    if (ws.includes(w)) return w;
    return ws.slice().sort((a, b) => Math.abs(a - w) - Math.abs(b - w) || a - b)[0];
  }

  /* ---------------- 로드 보장 ---------------- */
  const STATUS = {};            /* 'family|weight|style' → unloaded|loading|loaded|failed */
  const listeners = [];
  const key = (fam, w, st) => `${fam}|${w || 400}|${st || 'normal'}`;
  const emit = (ev) => listeners.forEach((f) => { try { f(ev); } catch (_) {} });
  const onChange = (f) => { listeners.push(f); return () => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; };
  const hasFonts = () => typeof document !== 'undefined' && document.fonts && typeof document.fonts.load === 'function';
  /* 그 family 로 선언된 face 가 페이지에 하나라도 있는가 — document.fonts.check 는 face 가 없는 family 에도 true 를
     돌려주므로(스펙: 로드할 것이 없음 = true) 「없는 글꼴」을 loaded 로 오판하지 않으려면 이걸 먼저 본다 */
  const hasFace = (fam) => { try { const f = norm(fam).toLowerCase(); for (const face of document.fonts) { if (norm(face.family).toLowerCase() === f) return true; } } catch (_) {} return false; };

  /* 등록부의 출처(구글 CSS 등)가 페이지에 아직 없으면 붙인다 — 런타임에 새 글꼴을 등록했을 때 */
  function ensureSource(entry) {
    if (typeof document === 'undefined' || !entry || !entry.source) return false;
    const s = entry.source;
    if (s.type === 'google') {
      const has = [...document.querySelectorAll('link[href*="fonts.googleapis.com"]')].some((l) => l.href.indexOf(encodeURIComponent(s.family).replace(/%20/g, '+')) >= 0 || l.href.indexOf(s.family.replace(/ /g, '+')) >= 0);
      if (has) return false;
      const l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?family=${s.family.replace(/ /g, '+')}${s.weights && s.weights.length > 1 ? ':wght@' + s.weights.join(';') : ''}&display=block`;
      document.head.appendChild(l); return true;
    }
    if (s.type === 'local' && s.href) {
      if ([...document.querySelectorAll('link[rel=stylesheet]')].some((l) => l.href === s.href)) return false;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = s.href; document.head.appendChild(l); return true;
    }
    return false;
  }

  /* 한 글꼴(굵기·기울임)을 실제로 쓸 수 있을 때까지 기다린다. 실패는 failed 로 남긴다 */
  function ensureOne(fam, w, st, sample, timeoutMs) {
    const k = key(fam, w, st);
    if (STATUS[k] === 'loaded') return Promise.resolve({ key: k, ok: true, status: 'loaded' });
    if (!hasFonts()) { STATUS[k] = 'unknown'; return Promise.resolve({ key: k, ok: false, status: 'unknown' }); }
    STATUS[k] = 'loading'; emit({ type: 'loading', key: k });
    const spec = `${st === 'italic' ? 'italic ' : ''}${w || 400} 16px "${fam}"`;
    const txt = sample || '가나다 Abc 09';
    const limit = timeoutMs || 6000; const t0 = Date.now();
    const timer = new Promise((res) => setTimeout(() => res('timeout'), limit));
    const load1 = () => document.fonts.load(spec, txt).then((faces) => (faces && faces.length ? 'loaded' : 'none')).catch(() => 'error');
    /* face 가 아직 없으면(구글 CSS 가 늦게 오거나 막힘) 시간 안에서 face 가 생기길 기다렸다가 다시 load — 그래도 없으면 failed */
    const attempt = () => load1().then((r) => {
      if (r === 'loaded') return r;
      if (hasFace(fam)) return r;
      if (Date.now() - t0 >= limit) return 'no-face';
      return new Promise((res) => setTimeout(res, 250)).then(attempt);
    });
    return Promise.race([attempt(), timer])
      .then((r) => {
        /* load 가 빈 배열이어도 face 가 있고 check 가 참이면(이미 있는 face) 로드된 것. face 자체가 없으면 실패 */
        let ok = r === 'loaded';
        if (!ok && r !== 'no-face' && hasFace(fam)) { try { ok = document.fonts.check(spec, txt); } catch (_) { ok = false; } }
        STATUS[k] = ok ? 'loaded' : 'failed';
        emit({ type: ok ? 'loaded' : 'failed', key: k, reason: r });
        if (ok) measureLive(fam, w, st);
        return { key: k, ok, status: STATUS[k], reason: r };
      });
  }

  /* specs: [{family|fontId, weight, style, text}] → {ok, loaded, failed, unknown} */
  function ensure(specs, opts) {
    opts = opts || {};
    const seen = new Set(); const jobs = [];
    (specs || []).forEach((s) => {
      const r = resolve(s.family || s.fontId || s.font, { where: s.where });
      const w = nearestWeight(r.entry, s.weight); const st = s.style === 'italic' && r.entry.styles.includes('italic') ? 'italic' : 'normal';
      const k = key(r.family, w, st); if (seen.has(k)) return; seen.add(k);
      ensureSource(r.entry);
      jobs.push(ensureOne(r.family, w, st, s.text, opts.timeout));
    });
    return Promise.all(jobs).then((rs) => ({ ok: rs.every((x) => x.ok), loaded: rs.filter((x) => x.ok).map((x) => x.key), failed: rs.filter((x) => x.status === 'failed').map((x) => x.key), unknown: rs.filter((x) => x.status === 'unknown').map((x) => x.key) }));
  }

  /* 장면·문서에서 필요한 글꼴 수집 */
  function requiredOf(target) {
    const out = []; const seen = new Set();
    const push = (el) => { if (!el || el.kind !== 'text') return; const r = resolveEl(el); const w = nearestWeight(r.entry, el.weight); const st = el.fontStyle === 'italic' ? 'italic' : 'normal'; const k = key(r.family, w, st); if (seen.has(k)) return; seen.add(k); out.push({ family: r.family, fontId: r.fontId, weight: w, style: st, text: String(el.text || '').slice(0, 40), where: el.aid || el.label || '' }); };
    if (!target) return out;
    if (Array.isArray(target.scenes)) target.scenes.forEach((s) => (s.elements || []).forEach(push));
    else if (Array.isArray(target.elements)) target.elements.forEach(push);
    else if (Array.isArray(target)) target.forEach(push);
    return out;
  }
  const ensureScene = (scene, opts) => ensure(requiredOf(scene), opts);
  const ensureDoc = (doc, opts) => ensure(requiredOf(doc), opts);
  const statusOf = (el) => { const r = resolveEl(el); return STATUS[key(r.family, nearestWeight(r.entry, el && el.weight), el && el.fontStyle === 'italic' ? 'italic' : 'normal')] || 'unloaded'; };
  const failed = () => Object.keys(STATUS).filter((k) => STATUS[k] === 'failed');

  /* ---------------- 패키지 동봉 글꼴 ---------------- */
  /* pkgFonts: [{family, src, weight:'300 700'|400, style}] · base: 패키지 폴더 절대 주소.
     등록부에 이미 있는 글꼴(구글·로컬)은 그쪽을 쓴다 — 같은 family 에 face 를 겹쳐 실패 face 가
     이기는 일을 막는다. 없는 글꼴만 FontFace 로 올리고 등록부에 source:package 로 얹는다. */
  function addPackageFonts(pkgFonts, base) {
    const added = [];
    (pkgFonts || []).forEach((f) => {
      if (!f || !f.family) return;
      const r = resolve(f.family);
      if (r.match === 'exact' || r.match === 'alias') return;          /* 이미 아는 글꼴 */
      const id = String(f.family).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const ws = String(f.weight || 400).split(/\s+/).map(Number).filter(Boolean);
      const weights = ws.length === 2 && ws[1] > ws[0] ? [300, 400, 500, 600, 700, 800, 900].filter((w) => w >= ws[0] && w <= ws[1]) : (ws.length ? ws : [400]);
      if (!byId[id]) {
        FONTS.push({ id, family: f.family, displayName: f.displayName || f.family, category: guessCategory(f.family), language: f.language || ['ko', 'en'], weights, styles: [f.style || 'normal'],
          source: { type: 'package', src: f.src, base }, fallback: FALLBACK_ID, license: f.license || { name: '패키지 동봉', url: '' }, metrics: null });
        index();
      }
      if (typeof FontFace !== 'undefined' && hasFonts() && f.src) {
        try {
          const url = /^(data:|https?:|\/)/.test(f.src) ? f.src : (base || '') + f.src;
          const face = new FontFace(f.family, `url(${url})`, { weight: ws.length === 2 ? `${ws[0]} ${ws[1]}` : String(ws[0] || 400), style: f.style || 'normal' });
          document.fonts.add(face); added.push(f.family);
        } catch (_) {}
      }
    });
    return added;
  }
  /* 등록부에 글꼴 추가(브랜드·교사 업로드) — 같은 문 */
  function register(entry) { if (!entry || !entry.id || !entry.family) return false; if (byId[entry.id]) return false; FONTS.push({ language: ['ko', 'en'], weights: [400], styles: ['normal'], fallback: FALLBACK_ID, metrics: null, ...entry }); index(); return true; }

  /* ---------------- 폭·높이 실측 ---------------- */
  const LIVE = {};              /* family → metrics (브라우저 실측, 로드 뒤) */
  const SAMPLE = { han: '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호', cjkp: '。、「」『』', sp: ' ', up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lo: 'abcdefghijklmnopqrstuvwxyz', di: '0123456789', pu: '.,:;\'"!|·', ot: '-–—()[]/&%+=?@*' };
  let _cx = null;
  function measureLive(fam, w, st) {
    if (typeof document === 'undefined' || LIVE[fam]) return LIVE[fam] || null;
    try {
      if (!_cx) { _cx = document.createElement('canvas').getContext('2d'); }
      if (!_cx) return null;
      const S = 100;
      _cx.font = `${st === 'italic' ? 'italic ' : ''}${w || 400} ${S}px "${fam}"`;
      try { _cx.letterSpacing = '0px'; } catch (_) {}
      /* 실제로 그 글꼴로 그려졌는지(폴백이 아닌지) 확인 — check 가 거짓이면 재지 않는다 */
      try { if (!hasFace(fam) || !document.fonts.check(`${w || 400} 16px "${fam}"`, '가A')) return null; } catch (_) {}
      const m = {};
      Object.keys(SAMPLE).forEach((g) => { const s = SAMPLE[g]; const chars = Array.from(s); let tot = 0, n = 0; chars.forEach((ch) => { const ww = _cx.measureText(ch).width; if (ww > 0) { tot += ww; n++; } }); m[g] = n ? Math.round(tot / n / S * 1000) / 1000 : null; });
      const tm = _cx.measureText('가Ag');
      if (tm.fontBoundingBoxAscent != null) { m.asc = Math.round(tm.fontBoundingBoxAscent / S * 1000) / 1000; m.desc = Math.round(tm.fontBoundingBoxDescent / S * 1000) / 1000; }
      const e = byFamily[fam.toLowerCase()];
      const base = (e && e.metrics) || byId[FALLBACK_ID].metrics;
      Object.keys(base).forEach((k2) => { if (m[k2] == null) m[k2] = base[k2]; });
      LIVE[fam] = m; emit({ type: 'metrics', family: fam });
      return m;
    } catch (_) { return null; }
  }
  /* 폭 표 읽기 정본 — LIVE(실측) > 등록부 정적표 > 기본 글꼴 */
  function metricsOf(family) {
    const r = resolve(family); const fam = r.family;
    return LIVE[fam] || (r.entry && r.entry.metrics) || byId[FALLBACK_ID].metrics;
  }
  /* CSS 줄상자에서 첫 줄 기준선 위치(em) — 브라우저와 같은 계산: 반행간 + ascent */
  function cssBaseline(family, lineHeight) {
    const m = metricsOf(family); const lh = +lineHeight || 1.35;
    const asc = m.asc != null ? m.asc : .95, desc = m.desc != null ? m.desc : .25;
    return (lh - (asc + desc)) / 2 + asc;
  }
  /* 요소가 원하는 첫 줄 기준선(em) — 패키지가 준 baseline 이 있으면 그 값, 없으면 렌더 규약(0.9) */
  const BASELINE_DEFAULT = 0.9;
  const baselineOf = (el) => (el && el.baseline != null && +el.baseline > 0 ? +el.baseline : BASELINE_DEFAULT);
  /* DOM 글자 상자를 얼마나 내려/올려야 export 와 같은 기준선이 되는가(px) */
  function domShiftPx(el, fontPx) {
    if (!el || el.baseline == null) return 0;
    const fam = resolveEl(el).family; const lh = el.lineHeight || 1.35;
    return Math.round((baselineOf(el) - cssBaseline(fam, lh)) * fontPx * 100) / 100;
  }

  /* ---------------- 문자 변형 ---------------- */
  function transformText(s, mode) {
    s = String(s == null ? '' : s);
    if (mode === 'uppercase') return s.toUpperCase();
    if (mode === 'lowercase') return s.toLowerCase();
    if (mode === 'capitalize') return s.replace(/(^|\s)(\S)/g, (m0, a, b) => a + b.toUpperCase());
    return s;
  }

  /* ---------------- Typography Preset (데이터 구조 — UI 는 다음) ----------------
     fontSizeRatio = 장면 높이 대비 %(요소 size 와 같은 단위) */
  const PRESETS = [
    { id: 'tp-premium-serif-hero', name: 'Premium Serif Hero', ko: '프리미엄 세리프 제목', fontId: 'cormorant-garamond', fontWeight: 400, fontSizeRatio: 18, lineHeight: 1.04, letterSpacing: 0, textTransform: 'uppercase' },
    { id: 'tp-modern-bold-banner', name: 'Modern Bold Banner', ko: '모던 굵은 배너', fontId: 'pretendard', fontWeight: 800, fontSizeRatio: 14, lineHeight: 1.1, letterSpacing: -0.02, textTransform: 'none' },
    { id: 'tp-warm-korean-title', name: 'Warm Korean Title', ko: '따뜻한 한글 제목', fontId: 'gowun-batang', fontWeight: 700, fontSizeRatio: 12, lineHeight: 1.25, letterSpacing: -0.01, textTransform: 'none' },
    { id: 'tp-minimal-subtitle', name: 'Minimal Subtitle', ko: '미니멀 부제', fontId: 'noto-sans-kr', fontWeight: 400, fontSizeRatio: 6, lineHeight: 1.4, letterSpacing: 0, textTransform: 'none' },
    { id: 'tp-editorial-headline', name: 'Editorial Headline', ko: '에디토리얼 헤드라인', fontId: 'cormorant-garamond', fontWeight: 600, fontSizeRatio: 15, lineHeight: 1.0, letterSpacing: -0.01, textTransform: 'none' },
    { id: 'tp-elegant-caption', name: 'Elegant Caption', ko: '우아한 캡션', fontId: 'noto-sans-kr', fontWeight: 400, fontSizeRatio: 3, lineHeight: 1.3, letterSpacing: 0.16, textTransform: 'uppercase' },
  ];
  function applyPreset(el, id) {
    const p = PRESETS.find((x) => x.id === id); if (!p || !el || el.kind !== 'text') return false;
    const e = byId[p.fontId] || byId[FALLBACK_ID];
    el.fontId = e.id; el.font = e.family; el.weight = nearestWeight(e, p.fontWeight);
    if (p.fontSizeRatio != null) el.size = p.fontSizeRatio;
    el.lineHeight = p.lineHeight; el.letterSpacing = p.letterSpacing;
    if (p.textTransform && p.textTransform !== 'none') el.textTransform = p.textTransform; else delete el.textTransform;
    return true;
  }

  /* 요소의 글꼴 필드를 등록부 기준으로 정규화 — 이름만 있으면 fontId 를 채우고, 값은 안 바꾼다 */
  function normalizeEl(el) {
    if (!el || el.kind !== 'text') return el;
    const r = resolveEl(el);
    if (!el.fontId) el.fontId = r.fontId;
    if (!el.font && r.family !== byId[FALLBACK_ID].family) el.font = r.family;
    return el;
  }

  function audit() {
    const v = [];
    const ids = new Set(); FONTS.forEach((f) => { if (ids.has(f.id)) v.push('dup:' + f.id); ids.add(f.id); ['family', 'displayName', 'category', 'language', 'weights', 'styles', 'source', 'license'].forEach((k) => { if (f[k] == null) v.push(f.id + ':' + k); }); if (f.fallback && !byId[f.fallback]) v.push(f.id + ':fallback'); });
    Object.keys(ALIASES).forEach((a) => { if (!byId[ALIASES[a]]) v.push('alias:' + a); });
    Object.keys(COMPAT).forEach((a) => { if (!byId[COMPAT[a]]) v.push('compat:' + a); });
    PRESETS.forEach((p) => { if (!byId[p.fontId]) v.push('preset:' + p.id); });
    if (resolve('Cormorant Garamond').match !== 'exact') v.push('exact-fail');
    if (resolve('Noto Sans CJK KR').substituted) v.push('alias-as-sub');
    return { ok: !v.length, fonts: FONTS.length, presets: PRESETS.length, violations: v };
  }

  return { FONTS, ALIASES, COMPAT, PRESETS, FALLBACK_ID, BASELINE_DEFAULT,
    get, list, resolve, resolveEl, nearestWeight, normalizeEl, transformText,
    ensure, ensureOne, ensureScene, ensureDoc, requiredOf, statusOf, failed, STATUS, onChange, ensureSource, hasFace,
    addPackageFonts, register,
    metricsOf, measureLive, LIVE, cssBaseline, baselineOf, domShiftPx,
    substitutions: () => SUBS.slice(), applyPreset, audit };
})();
