/* ============================================================
   K-MAKER Brand System v1  —  window.MK_BRAND        (Round 13)
   ------------------------------------------------------------
   Brand는 로고 저장소가 아니라 "조직의 디자인 시스템"이다.
   색·폰트·버튼·컴포넌트·아이콘·이미지·차트·문서·템플릿 기본값까지
   하나의 레코드로 정의하고, 그 레코드를 프로젝트에 "한 번" 적용한다.

   ★ 핵심 설계 (완료 조건 대응)
     개별 요소를 하나씩 고치지 않는다.
     Brand → Token → **MK_SEC.PALETTES 등재** → 기존 엔진 전 경로가
     그대로 브랜드를 쓴다. (buildTemplate · applyPalette · AI · Editor)
     브랜드를 바꾸면 = 팔레트 역할 재매핑 1회 = 프로젝트 전체 전환.

   계층
     1. Color   기준색 → 50~900 Token 자동 생성
     2. Theme   Token → MK_SEC 팔레트 역할 매핑(pl-bd-<id>)
     3. Apply   doc 전체 치환(배경·텍스트·도형·차트·폰트)
     4. Valid   브랜드 위반 자동 감지(색·폰트·대비·차트·버튼)
     5. IO      Export / Import / Version
   ============================================================ */
window.MK_BRAND = (() => {

  /* ============================================================
     0. 색 유틸
     ============================================================ */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hex2 = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');

  function norm(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let h = hex.trim();
    if (h[0] !== '#') return null;
    if (h.length === 4) h = '#' + h.slice(1).replace(/./g, (c) => c + c);
    return /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : null;
  }
  function rgb(hex) {
    const h = norm(hex); if (!h) return null;
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  const toHex = (r, g, b) => ('#' + hex2(r) + hex2(g) + hex2(b)).toUpperCase();

  function toHsl(hex) {
    const c = rgb(hex); if (!c) return null;
    const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    const l = (mx + mn) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    s = clamp(s, 0, 1); l = clamp(l, 0, 1);
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
    let t = [0, 0, 0];
    if (h < 60) t = [c, x, 0]; else if (h < 120) t = [x, c, 0]; else if (h < 180) t = [0, c, x];
    else if (h < 240) t = [0, x, c]; else if (h < 300) t = [x, 0, c]; else t = [c, 0, x];
    return toHex((t[0] + m) * 255, (t[1] + m) * 255, (t[2] + m) * 255);
  }

  /* WCAG 상대 휘도 · 대비비 */
  function lum(hex) {
    const c = rgb(hex); if (!c) return 0;
    const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  }
  function contrast(a, b) {
    const la = lum(a), lb = lum(b);
    return +(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05))).toFixed(2);
  }
  const isDark = (hex) => lum(hex) < 0.18;

  /* ============================================================
     1. Color Token — 기준색 → 50 … 900 (500 = 기준색 원본)
     ============================================================ */
  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const L_HI = 0.972, L_LO = 0.115;                       /* 램프 양 끝 */
  /* 500(기준색) 명도를 기준으로 위/아래로 보간 — 어떤 기준색이 와도 단조 하강 */
  const UP = { 50: 1, 100: 0.86, 200: 0.665, 300: 0.455, 400: 0.225 };
  const DN = { 600: 0.165, 700: 0.375, 800: 0.60, 900: 0.815 };
  const S_MUL = { 50: 0.42, 100: 0.58, 200: 0.76, 300: 0.90, 400: 0.98, 500: 1, 600: 1.00, 700: 0.96, 800: 0.88, 900: 0.78 };

  const rampL = (bl, s) => (s < 500 ? bl + (L_HI - bl) * UP[s] : bl - (bl - L_LO) * DN[s]);

  /** 기준 hex → { 50..900 } 스케일. 500은 원본 그대로 보존한다. */
  function scale(hex) {
    const base = norm(hex) || '#888888';
    const hsl = toHsl(base);
    const out = {};
    STEPS.forEach((s) => {
      if (s === 500) { out[500] = base; return; }
      out[s] = fromHsl(hsl[0], hsl[1] * S_MUL[s], rampL(hsl[2], s));
    });
    return out;
  }

  /** 회색 스케일 — 중립색의 색상(hue)만 미세 승계, 채도는 억제 */
  function grayScale(hex) {
    const base = norm(hex) || '#6B7280';
    const hsl = toHsl(base);
    const sat = Math.min(hsl[1], 0.10);
    const out = {};
    STEPS.forEach((s) => {
      out[s] = s === 500 ? fromHsl(hsl[0], sat, hsl[2]) : fromHsl(hsl[0], sat * (s <= 200 ? 0.55 : 1), rampL(hsl[2], s));
    });
    return out;
  }

  /** 임의 색을 브랜드 Gray 램프의 가장 가까운 단계로 스냅 (중립 계조 승계용) */
  function snapGray(hex, G) {
    const h = norm(hex); if (!h) return null;
    const l = toHsl(h)[2];
    let best = null, bd = 9;
    STEPS.forEach((s) => { const d = Math.abs(toHsl(G[s])[2] - l); if (d < bd) { bd = d; best = G[s]; } });
    return best;
  }

  const ROLES = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'neutral'];

  /** Brand → 전체 Token 트리 { primary:{50..900}, …, gray:{…} } */
  function tokens(b) {
    const T = {};
    ROLES.forEach((r) => { T[r] = scale(b.color[r]); });
    T.gray = grayScale(b.color.neutral);
    return T;
  }

  /** Token 트리 → CSS 변수 평면 맵 (--bd-primary-500 …) */
  function cssVars(b) {
    const T = tokens(b), out = {};
    Object.keys(T).forEach((r) => STEPS.forEach((s) => { out[`--bd-${r}-${s}`] = T[r][s]; }));
    out['--bd-font-heading'] = b.typography.roles.heading.family;
    out['--bd-font-body'] = b.typography.roles.body.family;
    out['--bd-radius-button'] = b.component.button.radius + 'px';
    out['--bd-radius-card'] = b.component.card.radius + 'px';
    out['--bd-radius-input'] = b.component.input.radius + 'px';
    out['--bd-icon-stroke'] = b.icon.stroke;
    return out;
  }

  /* ============================================================
     2. Theme Mapping — Brand → MK_SEC 팔레트(7역할)
        이 한 함수가 "브랜드가 템플릿·에디터·AI에 자동 적용"의 전부다.
     ============================================================ */
  function toPalette(b) {
    const T = tokens(b);
    const dk = b.templateDefaults.darkBase === 'primary' ? T.primary[900] : T.gray[900];
    return {
      name: b.name,
      dark: dk,
      light: b.templateDefaults.lightBase || '#FFFFFF',
      soft: T.primary[50],
      accent: T.primary[500],
      accent2: T.accent[500],
      mutedOnDark: T.gray[400],
      mutedOnLight: T.gray[600],
    };
  }

  const palId = (id) => 'pl-bd-' + id;

  /** MK_SEC.PALETTES에 등재/갱신 — 등재 즉시 엔진 전 경로에서 사용 가능 */
  function sync(b) {
    if (!window.MK_SEC) return null;
    const p = toPalette(b);
    window.MK_SEC.PALETTES[palId(b.brandId)] = p;
    return p;
  }
  function syncAll() { list(true).forEach(sync); }

  /* ============================================================
     3. Brand 레코드
     ============================================================ */
  const now = () => new Date().toISOString().slice(0, 10);

  const defTypography = (ko, en) => ({
    fontFamily: { korean: ko, english: en, japanese: 'Noto Sans JP', fallback: 'system-ui, -apple-system, sans-serif' },
    roles: {
      heading: { family: ko, size: 32, weight: 700, tracking: -0.02, lineHeight: 1.25 },
      body: { family: ko, size: 16, weight: 400, tracking: 0, lineHeight: 1.65 },
      caption: { family: ko, size: 12, weight: 500, tracking: 0.02, lineHeight: 1.4 },
      metric: { family: en, size: 40, weight: 700, tracking: -0.03, lineHeight: 1.1 },
      button: { family: ko, size: 14, weight: 600, tracking: 0, lineHeight: 1 },
    },
  });

  const defComponent = (r) => ({
    button: { radius: r, padX: 16, padY: 10, weight: 600, shadow: 'none', border: 0 },
    card: { radius: r + 4, padX: 20, padY: 18, shadow: 'soft', border: 1 },
    input: { radius: r, padX: 12, padY: 9, border: 1, focus: 'ring' },
    modal: { radius: r + 8, padX: 24, padY: 22, shadow: 'lift', overlay: 0.45 },
    badge: { radius: 999, padX: 8, padY: 3, weight: 700, size: 11 },
    chip: { radius: 999, padX: 12, padY: 6, weight: 500, border: 1 },
    tooltip: { radius: 6, padX: 8, padY: 6, size: 12 },
    accordion: { radius: r, divider: 1, padY: 14 },
    table: { radius: r, zebra: true, border: 1, headWeight: 700 },
    chart: { radius: 2, barWidth: 14, gridOpacity: 0.1 },
  });

  const defIcon = (style) => ({ style, stroke: style === 'filled' ? 0 : 1.7, radius: style === 'sharp' ? 0 : 2, pack: 'K-MAKER Line' });

  const IMG_PRESETS = {
    photography: '자연광 실사 사진, 얕은 심도, 과장 없는 색보정',
    illustration: '평면 일러스트, 굵은 면 구성, 외곽선 최소',
    '3d': '부드러운 3D 렌더, 소프트 섀도, 무광 재질',
    gradient: '추상 그라데이션 면, 텍스트 가독성 우선',
    outline: '단색 선화, 균일한 선 굵기',
    flat: '플랫 컬러, 그림자 없음, 기하 도형',
  };
  const defImage = (style) => ({ style, promptPrefix: IMG_PRESETS[style] || IMG_PRESETS.photography, ratio: '16:9' });

  const defChart = (b) => ({
    colors: [], /* 비우면 Token에서 자동 파생 */
    grid: 'horizontal', axis: 'bottom', legend: 'right', font: 'body', valueLabel: true,
  });

  /** 차트 시리즈 색 — 지정이 없으면 primary/accent/secondary 축으로 자동 생성 */
  function chartColors(b, n) {
    if (b.chart.colors && b.chart.colors.length) {
      const src = b.chart.colors;
      return Array.from({ length: n || src.length }, (_, i) => src[i % src.length]);
    }
    const T = tokens(b);
    const base = [T.primary[500], T.accent[500], T.secondary[500], T.primary[300], T.accent[300], T.secondary[300], T.primary[700], T.accent[700]];
    return Array.from({ length: n || 4 }, (_, i) => base[i % base.length]);
  }

  function blank(over) {
    const b = {
      brandId: 'bd-' + Math.random().toString(36).slice(2, 8),
      name: '새 브랜드', description: '', organization: '', owner: '나',
      created: now(), updated: now(), version: 1,
      logo: { primary: null, secondary: null, iconOnly: null, light: null, dark: null, mono: null },
      color: { primary: '#2E8C7F', secondary: '#3B5BDB', accent: '#E8735A', success: '#2F9E63', warning: '#D99A2B', error: '#D2453B', neutral: '#6B7280' },
      typography: defTypography('Pretendard', 'Inter'),
      component: defComponent(8),
      icon: defIcon('line'),
      image: defImage('photography'),
      chart: defChart(),
      templateDefaults: { ratio: '16:9', theme: 'mixed', darkBase: 'neutral', lightBase: '#FFFFFF', style: 'Modern' },
      sharing: { scope: 'private', team: '' },
    };
    return Object.assign(b, over || {});
  }

  /* ---------- 로고 (인라인 SVG · 워드마크 자동 생성) ---------- */
  function wordmark(b, variant) {
    const T = tokens(b);
    const on = variant === 'dark' ? '#FFFFFF' : (variant === 'mono' ? T.gray[800] : T.gray[900]);
    const dot = variant === 'mono' ? T.gray[500] : T.primary[500];
    const dot2 = variant === 'mono' ? T.gray[400] : T.accent[500];
    const txt = (b.name || 'BRAND').toUpperCase().slice(0, 16);
    return `<svg viewBox="0 0 220 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${txt} 로고">`
      + `<circle cx="12" cy="20" r="7" fill="${dot}"/><circle cx="26" cy="20" r="4" fill="${dot2}"/>`
      + `<text x="40" y="26" font-family="Pretendard,sans-serif" font-size="16" font-weight="700" letter-spacing="1.6" fill="${on}">${txt}</text></svg>`;
  }
  function iconMark(b, variant) {
    const T = tokens(b);
    const dot = variant === 'mono' ? T.gray[600] : T.primary[500];
    const dot2 = variant === 'mono' ? T.gray[400] : T.accent[500];
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="아이콘 로고">`
      + `<rect width="40" height="40" rx="${b.component.card.radius}" fill="${dot}"/>`
      + `<circle cx="26" cy="26" r="6" fill="${dot2}"/></svg>`;
  }

  /** 상황에 맞는 로고 버전 자동 선택 — AI/렌더 계층 공용 */
  function pickLogo(b, opts = {}) {
    const bg = opts.background || '#FFFFFF';
    const dark = isDark(bg);
    if (opts.iconOnly) return { key: 'iconOnly', svg: b.logo.iconOnly || iconMark(b, opts.mono ? 'mono' : 'color') };
    if (opts.mono) return { key: 'mono', svg: b.logo.mono || wordmark(b, 'mono') };
    if (dark) return { key: 'dark', svg: b.logo.dark || wordmark(b, 'dark') };
    return { key: 'light', svg: b.logo.primary || b.logo.light || wordmark(b, 'light') };
  }

  /* ============================================================
     4. Store (세션) — 실DB 연결 지점 = STORE 교체
     ============================================================ */
  const STORE = { brands: [], activeId: null, seeded: false };

  const SEEDS = [
    blank({
      brandId: 'bd-kmaker', name: 'K-MAKER', description: '제품 기본 브랜드 — Ink & Teal',
      organization: 'K-EDU', owner: '준호',
      color: { primary: '#2E8C7F', secondary: '#3B5BDB', accent: '#E8735A', success: '#2F9E63', warning: '#D99A2B', error: '#D2453B', neutral: '#6B7280' },
      templateDefaults: { ratio: '16:9', theme: 'mixed', darkBase: 'neutral', lightBase: '#FFFFFF', style: 'Modern' },
      sharing: { scope: 'org', team: '전체' },
    }),
    blank({
      brandId: 'bd-companya', name: 'Company A', description: '코발트 계열 기업 브랜드',
      organization: 'Company A', owner: '나',
      color: { primary: '#3B5BDB', secondary: '#5F3DC4', accent: '#F08C00', success: '#2F9E63', warning: '#D99A2B', error: '#D2453B', neutral: '#63708F' },
      typography: defTypography('Pretendard', 'Inter'),
      component: defComponent(4), icon: defIcon('sharp'), image: defImage('gradient'),
      templateDefaults: { ratio: '16:9', theme: 'light', darkBase: 'primary', lightBase: '#FFFFFF', style: 'Corporate' },
      sharing: { scope: 'team', team: 'Design' },
    }),
    blank({
      brandId: 'bd-companyb', name: 'Company B', description: '노아르 & 골드 — 프리미엄',
      organization: 'Company B', owner: '나',
      color: { primary: '#B99146', secondary: '#8A6B2F', accent: '#D6453A', success: '#5C8A4A', warning: '#C9902F', error: '#B23B32', neutral: '#79715F' },
      component: defComponent(2), icon: defIcon('rounded'), image: defImage('photography'),
      templateDefaults: { ratio: '16:9', theme: 'dark', darkBase: 'neutral', lightBase: '#FBF9F4', style: 'Luxury' },
      sharing: { scope: 'private', team: '' },
    }),
    blank({
      brandId: 'bd-school', name: 'School', description: '학교 브랜드 — 숲 계열, 부드러운 라운드',
      organization: '금성초등학교', owner: '준호',
      color: { primary: '#2F7D4F', secondary: '#2E7A8C', accent: '#E07A3F', success: '#2F9E63', warning: '#D99A2B', error: '#C4573F', neutral: '#5F7266' },
      component: defComponent(12), icon: defIcon('rounded'), image: defImage('illustration'),
      templateDefaults: { ratio: '16:9', theme: 'light', darkBase: 'neutral', lightBase: '#FCFDFB', style: 'Creative' },
      sharing: { scope: 'org', team: '교사' },
    }),
    blank({
      brandId: 'bd-personal', name: 'Personal', description: '개인 브랜드 — 미니멀',
      organization: '', owner: '나',
      color: { primary: '#1F2733', secondary: '#4C5C80', accent: '#12A594', success: '#2F9E63', warning: '#D99A2B', error: '#D2453B', neutral: '#6B7480' },
      component: defComponent(6), icon: defIcon('line'), image: defImage('flat'),
      templateDefaults: { ratio: '16:9', theme: 'mixed', darkBase: 'neutral', lightBase: '#FFFFFF', style: 'Minimal' },
      sharing: { scope: 'private', team: '' },
    }),
  ];

  function seed() {
    if (STORE.seeded) return;
    STORE.seeded = true;
    STORE.brands = SEEDS.map((s) => JSON.parse(JSON.stringify(s)));
    syncAll();
  }

  function list(noSeed) { if (!noSeed) seed(); return STORE.brands; }
  function get(id) { seed(); return STORE.brands.find((b) => b.brandId === id) || null; }
  function create(over) { seed(); const b = blank(over); STORE.brands.unshift(b); sync(b); return b; }
  function update(id, patch) {
    const b = get(id); if (!b) return null;
    /* 깊은 병합 1단계 — 색/타이포/컴포넌트 등 하위 객체 부분 갱신 허용 */
    Object.keys(patch || {}).forEach((k) => {
      if (patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k]) && b[k] && typeof b[k] === 'object') Object.assign(b[k], patch[k]);
      else b[k] = patch[k];
    });
    b.updated = now(); b.version = (b.version || 1) + 1;
    sync(b);
    return b;
  }
  function remove(id) {
    seed();
    const i = STORE.brands.findIndex((b) => b.brandId === id);
    if (i < 0) return false;
    STORE.brands.splice(i, 1);
    if (STORE.activeId === id) STORE.activeId = null;
    if (window.MK_SEC) delete window.MK_SEC.PALETTES[palId(id)];
    return true;
  }
  function duplicate(id) {
    const b = get(id); if (!b) return null;
    const c = JSON.parse(JSON.stringify(b));
    c.brandId = 'bd-' + Math.random().toString(36).slice(2, 8);
    c.name = b.name + ' 복사본'; c.created = now(); c.updated = now(); c.version = 1;
    STORE.brands.unshift(c); sync(c); return c;
  }
  function share(id, scope, team) { return update(id, { sharing: { scope, team: team || '' } }); }

  function setActive(id) { seed(); STORE.activeId = id && get(id) ? id : null; return STORE.activeId; }
  function active() { return STORE.activeId ? get(STORE.activeId) : null; }

  /* ============================================================
     5. Apply — 프로젝트/문서 전체에 브랜드 적용 (1회 호출)
     ============================================================ */
  /** 이미 브랜드 팔레트 역할값인가 (스냅 대상에서 제외) */
  function isRolePalette(v, b) {
    if (!v) return false;
    const P = toPalette(b), t = String(v).toLowerCase();
    return ['dark', 'light', 'soft', 'accent', 'accent2', 'mutedOnDark', 'mutedOnLight'].some((k) => String(P[k]).toLowerCase() === t);
  }

  function apply(doc, id) {
    const b = get(id); if (!b || !doc || !doc.scenes) return false;
    sync(b);
    const target = palId(b.brandId);

    /* 색 — 역할 단위 재매핑(엔진 공용 경로 재사용) */
    if (window.MK_AIED && window.MK_AIED.applyPalette) window.MK_AIED.applyPalette(doc, target);
    else {
      const P = window.MK_SEC.PALETTES[target];
      doc.scenes.forEach((s) => { s.background = window.MK_SEC.isDark(s.background) ? P.dark : P.light; });
      doc.paletteId = target;
    }

    /* 중립 계조 승계 — 엔진 내부 헤어라인·구분선·지브라 등 저채도 색은
       역할 매핑에 걸리지 않는다. 브랜드 Gray 램프의 최근접 단계로 스냅한다.
       (이것이 "개별 요소를 하나씩 고치지 않는다"의 마지막 구멍을 막는다) */
    const G = tokens(b).gray;
    const neutral = (v) => {
      const n2 = norm(v); if (!n2) return null;
      const c = rgb(n2), chroma = (Math.max.apply(null, c) - Math.min.apply(null, c)) / 255;
      return chroma < 0.07 ? snapGray(n2, G) : null;   /* 크로마 기준(흰색 근처 회색 오판 방지) */
    };
    doc.scenes.forEach((s) => {
      const bg = neutral(s.background);
      if (bg && !isRolePalette(s.background, b)) s.background = bg;
      (s.elements || []).forEach((el) => {
        ['color', 'fill'].forEach((k) => {
          if (!el[k] || typeof el[k] !== 'string' || el[k].indexOf('gradient') >= 0) return;
          if (isRolePalette(el[k], b)) return;
          const g = neutral(el[k]);
          if (g) el[k] = g;
        });
      });
    });

    /* 타이포 — 캔버스 전역 폰트 */
    doc.fontFamily = b.typography.fontFamily.korean;

    /* 차트 — 브랜드 차트 규칙 */
    const cc = chartColors(b, 8);
    doc.scenes.forEach((s) => (s.elements || []).forEach((el) => {
      if (el.kind === 'chart') { el.accent = cc[0]; el.chartGrid = b.chart.grid; el.chartLegend = b.chart.legend; }
    }));

    /* 브랜드 도장 — 이후 검증·재적용의 기준 */
    doc.brandId = b.brandId;
    doc.brandVersion = b.version;
    return true;
  }

  /** 활성 브랜드가 있으면 자동 적용 (템플릿 선택 훅에서 호출) */
  function applyActive(doc) {
    const b = active();
    return b ? apply(doc, b.brandId) : false;
  }

  /** Template JSON(엔진 스키마)에 브랜드 팔레트를 주입 — 조립 단계 적용 */
  function applyToTemplateJSON(json, id) {
    const b = get(id); if (!b) return json;
    sync(b);
    return Object.assign({}, json, { palette: palId(b.brandId) });
  }

  /* UI 계층(플레이그라운드 화면) 토큰 주입 */
  function applyCss(root, id) {
    const b = get(id); if (!b || !root || !root.style) return false;
    const V = cssVars(b);
    Object.keys(V).forEach((k) => root.style.setProperty(k, V[k]));
    return true;
  }

  /* ============================================================
     6. Validation — 브랜드 위반 자동 감지
     ============================================================ */
  const AA = 4.5, AA_LARGE = 3.0;

  /** 브랜드가 허용하는 색 집합 (Token 전량 + 팔레트 역할 + 이미지 그라데이션 제외) */
  function allowedColors(b) {
    const T = tokens(b), set = new Set();
    Object.keys(T).forEach((r) => STEPS.forEach((s) => set.add(T[r][s].toLowerCase())));
    const P = toPalette(b);
    ['dark', 'light', 'soft', 'accent', 'accent2', 'mutedOnDark', 'mutedOnLight'].forEach((k) => set.add(String(P[k]).toLowerCase()));
    set.add('#ffffff'); set.add('#000000');
    return set;
  }

  /** 문서 검사 → 위반 목록 (각 항목에 fix 가능 여부·대체값 포함) */
  function validate(doc, id) {
    const b = get(id) || (doc && get(doc.brandId));
    const out = [];
    if (!b || !doc || !doc.scenes) return out;
    const allow = allowedColors(b);
    const P = toPalette(b);
    const T = tokens(b);
    const cc = chartColors(b, 8);

    /* 폰트 */
    const fonts = [b.typography.fontFamily.korean, b.typography.fontFamily.english, b.typography.fontFamily.japanese];
    if (doc.fontFamily && !fonts.includes(doc.fontFamily)) {
      out.push({ type: 'font', level: 'error', sceneIdx: -1, elIdx: -1, msg: `폰트 "${doc.fontFamily}"는 브랜드 폰트가 아닙니다 (허용: ${fonts.join(' · ')})`, to: b.typography.fontFamily.korean });
    }

    doc.scenes.forEach((s, si) => {
      const bgDark = window.MK_SEC ? window.MK_SEC.isDark(s.background) : isDark(s.background);
      /* 배경 */
      if (s.background && !allow.has(String(s.background).toLowerCase())) {
        out.push({ type: 'color', level: 'error', sceneIdx: si, elIdx: -1, target: 'background', msg: `${si + 1}장 배경 ${s.background} — 브랜드 색상 아님`, to: bgDark ? P.dark : P.light });
      }
      (s.elements || []).forEach((el, ei) => {
        /* 색상 — 텍스트 color / 도형 fill (그라데이션 이미지 더미는 검사 제외) */
        ['color', 'fill'].forEach((k) => {
          const v = el[k];
          if (!v || typeof v !== 'string' || v.indexOf('gradient') >= 0) return;
          if (!allow.has(v.toLowerCase())) {
            out.push({ type: 'color', level: 'error', sceneIdx: si, elIdx: ei, target: k, msg: `${si + 1}장 · ${k === 'color' ? '텍스트' : '도형'} ${v} — 브랜드 색상 아님`, to: k === 'color' ? (bgDark ? P.mutedOnDark : P.mutedOnLight) : P.accent });
          }
        });
        /* 대비 — 텍스트가 배경 위에서 읽히는가 */
        if (el.kind === 'text') {
          const col = el.color || (bgDark ? '#F2F5F9' : '#1F2733');
          const need = (el.size >= 3.4 || (el.weight || 400) >= 700 && el.size >= 2.6) ? AA_LARGE : AA;
          const cr = contrast(col, s.background || '#FFFFFF');
          if (cr < need) {
            out.push({ type: 'contrast', level: cr < 3 ? 'error' : 'warn', sceneIdx: si, elIdx: ei, target: 'color', msg: `${si + 1}장 · 대비 ${cr}:1 (기준 ${need}:1) — "${String(el.text).split('\n')[0].slice(0, 14)}"`, to: bgDark ? '#FFFFFF' : T.gray[900], ratio: cr, need });
          }
        }
        /* 차트 색 */
        if (el.kind === 'chart' && el.accent && el.accent.toLowerCase() !== cc[0].toLowerCase()) {
          out.push({ type: 'chart', level: 'warn', sceneIdx: si, elIdx: ei, target: 'accent', msg: `${si + 1}장 · 차트 색 ${el.accent} — 브랜드 차트 색 아님`, to: cc[0] });
        }
      });
    });
    return out;
  }

  /** 브랜드 자체 검사 — 버튼 대비·필수 항목·폰트 폴백 */
  function validateBrand(id) {
    const b = get(id), out = [];
    if (!b) return out;
    const T = tokens(b);
    /* 브랜드 규약: Primary 버튼 = primary-600 배경 + 흰 글씨 */
    const btnBg = T.primary[600], cr = contrast('#FFFFFF', btnBg);
    if (cr < 3) out.push({ type: 'button', level: 'error', msg: `Primary 버튼(600) 대비 ${cr}:1 — 흰 글씨가 읽히지 않습니다`, ratio: cr });
    else if (cr < AA) out.push({ type: 'button', level: 'warn', msg: `Primary 버튼(600) 대비 ${cr}:1 — AA 기준 ${AA}:1 미달`, ratio: cr });
    if (!b.typography.fontFamily.fallback) out.push({ type: 'font', level: 'warn', msg: 'Fallback 폰트가 비어 있습니다' });
    if (!b.name || !b.name.trim()) out.push({ type: 'meta', level: 'error', msg: '브랜드 이름이 비어 있습니다' });
    ROLES.forEach((r) => { if (!norm(b.color[r])) out.push({ type: 'color', level: 'error', msg: `${r} 색상 값이 올바르지 않습니다` }); });
    /* Accent 구분 — 명도만이 아니라 색상환 거리까지 본다(teal↔coral은 명도가 비슷해도 다른 색) */
    const hA = toHsl(T.accent[500])[0], hP = toHsl(T.primary[500])[0];
    let hd = Math.abs(hA - hP); if (hd > 180) hd = 360 - hd;
    const acc = contrast(T.accent[500], T.primary[500]);
    if (hd < 25 && acc < 1.5) out.push({ type: 'color', level: 'warn', msg: `Accent가 Primary와 너무 비슷합니다 (색상차 ${hd.toFixed(0)}° · 대비 ${acc}:1)` });
    return out;
  }

  /** 위반 자동 수정 — 검사 결과의 to 값으로 일괄 치환 */
  function fix(doc, id) {
    const v = validate(doc, id);
    let n = 0;
    v.forEach((x) => {
      if (!x.to) return;
      if (x.sceneIdx < 0) { doc.fontFamily = x.to; n++; return; }
      const s = doc.scenes[x.sceneIdx]; if (!s) return;
      if (x.elIdx < 0) { s.background = x.to; n++; return; }
      const el = s.elements[x.elIdx]; if (!el) return;
      el[x.target] = x.to; n++;
    });
    return n;
  }

  /* ============================================================
     7. Export / Import
     ============================================================ */
  const PKG = 'kmaker.brand';
  const SCHEMA = 1;

  function exportJSON(id, pretty) {
    const b = get(id); if (!b) return null;
    const pkg = {
      _package: PKG, _schema: SCHEMA, exportedAt: new Date().toISOString(),
      brand: JSON.parse(JSON.stringify(b)),
      tokens: tokens(b),
      palette: toPalette(b),
    };
    return JSON.stringify(pkg, null, pretty === false ? 0 : 2);
  }

  function importJSON(text) {
    let pkg;
    try { pkg = typeof text === 'string' ? JSON.parse(text) : text; }
    catch (e) { return { ok: false, msg: 'JSON 형식이 아닙니다.' }; }
    if (!pkg || pkg._package !== PKG) return { ok: false, msg: 'K-MAKER 브랜드 패키지가 아닙니다.' };
    if (pkg._schema > SCHEMA) return { ok: false, msg: `상위 버전 스키마(${pkg._schema})입니다. 앱을 업데이트해 주세요.` };
    const src = pkg.brand;
    if (!src || !src.color || !src.typography) return { ok: false, msg: '브랜드 본문이 손상되었습니다.' };
    seed();
    const b = blank();
    /* 스키마 기본값 위에 덮어써서 누락 필드 자동 보정 */
    Object.keys(src).forEach((k) => {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && b[k] && typeof b[k] === 'object') Object.assign(b[k], src[k]);
      else b[k] = src[k];
    });
    const dup = !!get(b.brandId);
    if (dup) { b.brandId = 'bd-' + Math.random().toString(36).slice(2, 8); b.name = (b.name || '브랜드') + ' (가져옴)'; }
    b.updated = now();
    STORE.brands.unshift(b); sync(b);
    return { ok: true, brand: b, renamed: dup, msg: `"${b.name}" 가져오기 완료 (v${b.version})` };
  }

  /* ============================================================
     8. AI Integration — 자연어 → 브랜드 지정
     ============================================================ */
  /** "우리 회사 스타일로" / "학교 스타일로" / "브랜드 규칙 유지" 해석 */
  function resolve(phrase) {
    const p = String(phrase || '').toLowerCase();
    seed();
    if (/학교|school|교실|수업/.test(p)) return get('bd-school');
    if (/우리\s*회사|자사|사내|company\s*a|회사\s*a/.test(p)) return get('bd-companya') || get('bd-kmaker');
    if (/company\s*b|회사\s*b/.test(p)) return get('bd-companyb');
    if (/개인|personal|내\s*브랜드/.test(p)) return get('bd-personal');
    if (/k-?maker|케이메이커|제품/.test(p)) return get('bd-kmaker');
    /* 이름 직접 매칭 */
    const byName = STORE.brands.find((b) => b.name && p.indexOf(b.name.toLowerCase()) >= 0);
    if (byName) return byName;
    if (/브랜드/.test(p)) return active() || get('bd-kmaker');
    return null;
  }

  /* ============================================================
     9. 부팅 훅 — 템플릿 로드 시 활성 브랜드 자동 적용
        (활성 브랜드가 없으면 기존 동작과 100% 동일)
     ============================================================ */
  function hook() {
    if (hook._done || !window.PG) return;
    hook._done = true;
    ['loadEditorDoc', 'openEditorDoc'].forEach((fn) => {
      const orig = window.PG[fn];
      if (typeof orig !== 'function') return;
      window.PG[fn] = function () {
        const r = orig.apply(this, arguments);
        const b = active();
        if (b && window.PG.state.editor.doc) apply(window.PG.state.editor.doc, b.brandId);
        return r;
      };
    });
    if (window.MK_PROJ) {
      ['createFromDoc', 'createFromTemplate'].forEach((fn) => {
        const orig = window.MK_PROJ[fn];
        if (typeof orig !== 'function') return;
        window.MK_PROJ[fn] = function () {
          const p = orig.apply(this, arguments);
          const b = active();
          if (b && p && p.doc) apply(p.doc, b.brandId);
          return p;
        };
      });
    }
    if (window.MK_TPL && typeof window.MK_TPL.load === 'function') {
      const ol = window.MK_TPL.load;
      window.MK_TPL.load = function () {
        const r = ol.apply(this, arguments);
        const b = active();
        if (b && window.PG.state.editor.doc) apply(window.PG.state.editor.doc, b.brandId);
        return r;
      };
    }
  }
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', hook);

  seed();

  return {
    /* 색·토큰 */
    norm, rgb, toHsl, fromHsl, lum, contrast, isDark, scale, grayScale, snapGray, tokens, cssVars, STEPS, ROLES,
    /* 테마 */
    toPalette, palId, sync, syncAll,
    /* 레코드 */
    blank, list, get, create, update, remove, duplicate, share, setActive, active, STORE, seed,
    /* 로고 */
    wordmark, iconMark, pickLogo,
    /* 적용 */
    apply, applyActive, applyToTemplateJSON, applyCss, chartColors,
    /* 검증 */
    validate, validateBrand, fix, allowedColors,
    /* IO */
    exportJSON, importJSON, PKG, SCHEMA,
    /* AI */
    resolve, hook, IMG_PRESETS,
  };
})();
