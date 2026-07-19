/* ============================================================
   K-MAKER Brand System — Round 13  ·  window.MK_BRAND
   ------------------------------------------------------------
   원칙: "절대 개별 요소를 하나씩 수정하지 않는다."
   브랜드 적용은 딱 두 갈래로만 일어난다.
     ① 역할 토큰 치환 — 팔레트 역할(dark/light/soft/accent…) 단위의
        단일 치환 테이블 1회 패스. 요소별 분기 로직 없음.
     ② 렌더 시점 토큰 읽기 — 컴포넌트·차트 스타일은 doc.brandId 로
        렌더러가 브랜드 토큰을 라이브로 읽는다. doc 은 건드리지 않는다.
   따라서 브랜드를 바꾸면 ①로 색·폰트가, ②로 컴포넌트·차트가
   전부 동시에 갈아입는다.

   구조
   · 색 수학     hex↔hsl · ramp(50~900) · WCAG contrast
   · 스키마      SCHEMA (Brand JSON Schema — 제출물)
   · 레지스트리  붙박이 4종(회사A·회사B·학교·개인) + 커스텀
   · 파생        derivePalette(brand) → MK_SEC.PALETTES['pl-brand-*']
   · 적용        apply(doc, id) — 역할 치환 1회 패스
   · 검증        validate(doc) → 위반 목록 · fix(doc) → 재치환
   · 로고        pickLogo(brand, ctx) — AI 자동 버전 선택
   · 교환        exportJSON / importJSON (version · id 충돌 처리)
   ⚠ 로고 실아트는 GPT 영역 — 여기서는 타이포 워드마크 슬롯만 정의.
   ============================================================ */
window.MK_BRAND = (() => {
  const SEC = () => window.MK_SEC;

  /* ============================================================
     1) 색 수학
     ============================================================ */
  const hex2rgb = (h) => { const s = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };
  const rgb2hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  function hex2hsl(hex) {
    let [r, g, b] = hex2rgb(hex).map((v) => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
    const l = (mx + mn) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [h, s, l];
  }
  function hsl2hex(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return rgb2hex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }
  /* 50~900 램프 — 500 = 기준색. 밝은 쪽은 채도를 눌러 파스텔, 어두운 쪽은 살짝 올려 깊이. */
  const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  /* 기준색(500)의 실제 명도를 앵커로, 밝은 쪽은 0.97 어두운 쪽은 0.12 를 향해 보간
     — 기준색이 아무리 밝거나 어두워도 50→900 단조성이 항상 성립한다 */
  const LT = { 50: 0.94, 100: 0.82, 200: 0.62, 300: 0.42, 400: 0.20 };  /* base→0.97 진행률 */
  const DK = { 600: 0.24, 700: 0.46, 800: 0.68, 900: 0.88 };            /* base→0.12 진행률 */
  function ramp(hex) {
    const [h, s, l] = hex2hsl(hex), out = {};
    STEPS.forEach((k) => {
      if (k === 500) { out[500] = hex.toUpperCase(); return; }
      const tl = k < 500 ? l + (0.97 - l) * LT[k] : l - (l - 0.12) * DK[k];
      const ts = k < 500 ? s * (1 - 0.55 * LT[k]) : Math.min(1, s * (1 + 0.06 * DK[k]));
      out[k] = hsl2hex(h, Math.max(0, Math.min(1, ts)), Math.max(0, Math.min(1, tl)));
    });
    return out;
  }
  const lum = (hex) => {
    const [r, g, b] = hex2rgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +( (x + 0.05) / (y + 0.05) ).toFixed(2); };

  /* ============================================================
     2) Brand JSON Schema — 제출물 (검증에도 사용)
     ============================================================ */
  const SCHEMA = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'K-MAKER Brand', type: 'object',
    required: ['id', 'name', 'version', 'colors', 'type'],
    properties: {
      id: { type: 'string', pattern: '^br-[a-z0-9-]+$' },
      name: { type: 'string' }, desc: { type: 'string' },
      org: { type: 'string' }, owner: { type: 'string' },
      version: { type: 'string' }, createdAt: { type: 'string' }, updatedAt: { type: 'string' },
      sharing: { type: 'object', properties: { scope: { enum: ['private', 'team', 'organization', 'public'] }, team: { type: 'string' } } },
      logo: { type: 'object', description: 'primary·secondary·iconOnly 슬롯, 각각 light/dark/mono 파생 — 실아트는 GPT 산출물로 교체' },
      colors: {
        type: 'object', required: ['primary', 'secondary', 'neutral'],
        properties: ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'neutral'].reduce((a, k) => (a[k] = { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }, a), {}),
      },
      ramps: { type: 'object', description: '색상별 50~900 토큰 — normalize 시 자동 생성' },
      type: {
        type: 'object', required: ['heading', 'body'],
        properties: ['heading', 'body', 'caption', 'metric', 'button'].reduce((a, k) => (a[k] = {
          type: 'object', properties: { family: { type: 'string' }, weight: { type: 'number' }, tracking: { type: 'number' } },
        }, a), { fallback: { type: 'object', properties: { ko: { type: 'array' }, en: { type: 'array' }, ja: { type: 'array' } } } }),
      },
      components: { type: 'object', description: 'button·card·input·modal·badge·chip·tooltip·accordion·table·chart 기본 토큰' },
      icon: { type: 'object', properties: { style: { enum: ['line', 'filled', 'rounded', 'sharp'] }, strokeWidth: { type: 'number' }, cornerRadius: { type: 'number' }, pack: { type: 'string' } } },
      image: { type: 'object', properties: { styles: { type: 'array' }, promptPrefix: { type: 'string' } } },
      chart: { type: 'object', properties: { colors: { type: 'array' }, grid: { type: 'string' }, axis: { type: 'boolean' }, legend: { type: 'boolean' }, font: { type: 'string' } } },
    },
  };

  /* ============================================================
     3) 붙박이 브랜드 4종 — 회사A(K-MAKER) · 회사B(Signal) · 학교 · 개인
     ============================================================ */
  const B_KMAKER = {
    id: 'br-kmaker', name: 'K-MAKER', desc: '케이메이커 공식 브랜드 — 명료한 틸, 따뜻한 코랄 포인트',
    org: 'K-edu', owner: '준호', version: '1.0.0', createdAt: '2026-07-19', sharing: { scope: 'organization' },
    colors: { primary: '#2E8C7F', secondary: '#E8735A', accent: '#FFD166', success: '#2F7D4F', warning: '#E8A13A', error: '#D6453A', neutral: '#1F2733' },
    type: {
      heading: { family: 'Pretendard', weight: 800, tracking: -0.02 },
      body: { family: 'Pretendard', weight: 400, tracking: 0 },
      caption: { family: 'Pretendard', weight: 500, tracking: 0 },
      metric: { family: 'Pretendard', weight: 700, tracking: -0.01 },
      button: { family: 'Pretendard', weight: 700, tracking: 0 },
      fallback: { ko: ['Pretendard', 'Noto Sans KR', 'sans-serif'], en: ['Pretendard', 'Inter', 'sans-serif'], ja: ['Noto Sans JP', 'sans-serif'] },
    },
    components: {
      button: { radius: 10, weight: 700, padX: 18, padY: 10 }, card: { radius: 14, border: 'hairline', shadow: 'soft' },
      input: { radius: 10, border: 'solid' }, modal: { radius: 18, shadow: 'deep' }, badge: { radius: 999, weight: 700 },
      chip: { radius: 999, weight: 500 }, tooltip: { radius: 8, tone: 'dark' }, accordion: { divider: 'hairline' },
      table: { headWeight: 600, zebra: false, divider: 'hairline' }, chart: { corner: 1, barOpacity: 0.42 },
    },
    icon: { style: 'line', strokeWidth: 1.6, cornerRadius: 2, pack: 'K-Icons Line' },
    image: { styles: ['photography', 'flat'], promptPrefix: '깨끗한 자연광, 한국 교실·교육 현장, 티끌 없는 배경, 틸(#2E8C7F) 포인트, 과장 없는 실사' },
    logo: { wordmark: 'K-MAKER', sub: '케이메이커', tagline: '수업이 작품이 되는 곳' },
  };
  const B_SIGNAL = {
    id: 'br-signal', name: 'Signal', desc: '회사 B — Pitch Deck 검증용 프리미엄 프로덕트 브랜드',
    org: 'Signal Inc.', owner: '준호', version: '1.0.0', createdAt: '2026-07-19', sharing: { scope: 'team', team: 'Growth' },
    colors: { primary: '#12A594', secondary: '#F26B5B', accent: '#12A594', success: '#2F7D4F', warning: '#E8A13A', error: '#D6453A', neutral: '#111315' },
    type: {
      heading: { family: 'Pretendard', weight: 700, tracking: -0.02 },
      body: { family: 'Pretendard', weight: 400, tracking: 0 },
      caption: { family: 'Pretendard', weight: 500, tracking: 0.01 },
      metric: { family: 'Pretendard', weight: 800, tracking: -0.02 },
      button: { family: 'Pretendard', weight: 600, tracking: 0 },
      fallback: { ko: ['Pretendard', 'Noto Sans KR', 'sans-serif'], en: ['Inter', 'sans-serif'], ja: ['Noto Sans JP', 'sans-serif'] },
    },
    components: {
      button: { radius: 8, weight: 600, padX: 20, padY: 11 }, card: { radius: 12, border: 'none', shadow: 'flat' },
      input: { radius: 8, border: 'solid' }, modal: { radius: 14, shadow: 'deep' }, badge: { radius: 6, weight: 600 },
      chip: { radius: 6, weight: 500 }, tooltip: { radius: 6, tone: 'dark' }, accordion: { divider: 'line' },
      table: { headWeight: 600, zebra: true, divider: 'line' }, chart: { corner: 0.6, barOpacity: 0.5 },
    },
    icon: { style: 'sharp', strokeWidth: 1.4, cornerRadius: 0, pack: 'Signal Sharp' },
    image: { styles: ['photography', '3d'], promptPrefix: '차분한 스튜디오 광, 딥 그레이 배경, 프로덕트 클로즈업, #12A594 포인트 라이트' },
    logo: { wordmark: 'Signal', sub: '시그널', tagline: 'Cut the noise.' },
  };
  const B_SCHOOL = {
    id: 'br-school', name: '금성초등학교', desc: '학교 브랜드 — 숲의 초록과 들꽃 노랑, 또박또박한 고딕',
    org: '금성초', owner: '과학부', version: '1.0.0', createdAt: '2026-07-19', sharing: { scope: 'organization' },
    colors: { primary: '#2F7D4F', secondary: '#FFD166', accent: '#2F7D4F', success: '#2F7D4F', warning: '#E8A13A', error: '#C4573F', neutral: '#12211B' },
    type: {
      heading: { family: 'Noto Sans KR', weight: 800, tracking: -0.01 },
      body: { family: 'Noto Sans KR', weight: 400, tracking: 0 },
      caption: { family: 'Noto Sans KR', weight: 500, tracking: 0 },
      metric: { family: 'Noto Sans KR', weight: 700, tracking: 0 },
      button: { family: 'Noto Sans KR', weight: 700, tracking: 0 },
      fallback: { ko: ['Noto Sans KR', 'Pretendard', 'sans-serif'], en: ['Noto Sans', 'sans-serif'], ja: ['Noto Sans JP', 'sans-serif'] },
    },
    components: {
      button: { radius: 14, weight: 700, padX: 18, padY: 12 }, card: { radius: 18, border: 'solid', shadow: 'none' },
      input: { radius: 12, border: 'solid' }, modal: { radius: 20, shadow: 'soft' }, badge: { radius: 999, weight: 700 },
      chip: { radius: 999, weight: 600 }, tooltip: { radius: 10, tone: 'light' }, accordion: { divider: 'solid' },
      table: { headWeight: 700, zebra: true, divider: 'solid' }, chart: { corner: 2, barOpacity: 0.38 },
    },
    icon: { style: 'rounded', strokeWidth: 2, cornerRadius: 4, pack: 'K-Icons Rounded' },
    image: { styles: ['illustration', 'flat'], promptPrefix: '밝고 둥근 플랫 일러스트, 초등 눈높이, 초록·노랑 위주, 부드러운 외곽선' },
    logo: { wordmark: '금성초', sub: 'Geumseong Elementary', tagline: '스스로 배우고 함께 자라요' },
  };
  const B_PERSONAL = {
    id: 'br-personal', name: '준호 퍼스널', desc: '개인 브랜드 — 느와르 배경에 골드, 세리프 제목',
    org: 'Personal', owner: '준호', version: '1.0.0', createdAt: '2026-07-19', sharing: { scope: 'private' },
    colors: { primary: '#B99146', secondary: '#D6453A', accent: '#B99146', success: '#2F7D4F', warning: '#E8A13A', error: '#D6453A', neutral: '#14120E' },
    type: {
      heading: { family: 'Noto Serif KR', weight: 700, tracking: 0 },
      body: { family: 'Pretendard', weight: 400, tracking: 0 },
      caption: { family: 'Pretendard', weight: 500, tracking: 0.02 },
      metric: { family: 'Noto Serif KR', weight: 700, tracking: 0 },
      button: { family: 'Pretendard', weight: 600, tracking: 0.04 },
      fallback: { ko: ['Noto Serif KR', 'Pretendard', 'serif'], en: ['Georgia', 'serif'], ja: ['Noto Serif JP', 'serif'] },
    },
    components: {
      button: { radius: 4, weight: 600, padX: 22, padY: 11 }, card: { radius: 6, border: 'hairline', shadow: 'none' },
      input: { radius: 4, border: 'underline' }, modal: { radius: 8, shadow: 'deep' }, badge: { radius: 4, weight: 600 },
      chip: { radius: 4, weight: 500 }, tooltip: { radius: 4, tone: 'dark' }, accordion: { divider: 'hairline' },
      table: { headWeight: 700, zebra: false, divider: 'hairline' }, chart: { corner: 0, barOpacity: 0.5 },
    },
    icon: { style: 'line', strokeWidth: 1.2, cornerRadius: 0, pack: 'K-Icons Fine' },
    image: { styles: ['photography', 'gradient'], promptPrefix: '무드 있는 저조도, 필름 그레인, 골드 하이라이트, 미니멀 구도' },
    logo: { wordmark: 'JUNHO', sub: '준호', tagline: '' },
  };

  /* ============================================================
     4) normalize — 램프·차트색·팔레트 파생을 채워 완전한 브랜드로
     ============================================================ */
  const pickByContrast = (r, bg, target) =>
    STEPS.map((k) => r[k]).reduce((best, c) => Math.abs(contrast(c, bg) - target) < Math.abs(contrast(best, bg) - target) ? c : best);
  function derivePalette(b) {
    const nr = b.ramps.neutral, pr = b.ramps.primary;
    /* 역할별 hex 유일성 강제 — 치환 테이블이 전단사(왕복 무손실)이려면 역할끼리 색이 겹치면 안 된다 */
    const used = new Set();
    const uniq = (hex) => {
      let h = String(hex).toUpperCase();
      while (used.has(h)) { const [H, S, L] = hex2hsl(h); h = hsl2hex(H, S, Math.min(0.99, Math.max(0.01, L + (L > 0.5 ? -0.025 : 0.025)))); }
      used.add(h); return h;
    };
    return {
      name: b.name,
      dark: uniq(b.colors.neutral),
      light: uniq('#FFFFFF'),
      soft: uniq(pr[50]),
      accent: uniq(b.colors.primary),
      accent2: uniq(b.colors.secondary),
      /* muted 역할 — 램프 스텝 고정이 아니라 목표 대비(≈5:1)에 가장 가까운 스텝을 실측 선택 */
      mutedOnDark: uniq(pickByContrast(nr, b.colors.neutral, 5)),
      mutedOnLight: uniq(pickByContrast(nr, '#FFFFFF', 5)),
      /* 확장 역할 — 목업·구분선 등 (pl-signal 계열과 호환) */
      surface: uniq('#FEFEFE'),
      line: uniq(nr[200]),
      darkSurface: uniq(nr[800]),
      accentDark: uniq(pr[700]),
    };
  }
  function normalize(raw) {
    const b = JSON.parse(JSON.stringify(raw));
    b.version = b.version || '1.0.0';
    b.updatedAt = b.updatedAt || b.createdAt || new Date().toISOString().slice(0, 10);
    b.colors.accent = b.colors.accent || b.colors.primary;
    b.ramps = {};
    Object.keys(b.colors).forEach((k) => { b.ramps[k] = ramp(b.colors[k]); });
    b.chart = Object.assign({
      colors: [b.colors.primary, b.colors.secondary, b.ramps.primary[300], b.ramps.secondary[300], b.ramps.neutral[400]],
      grid: 'subtle', axis: true, legend: true, font: (b.type.caption || b.type.body).family,
    }, b.chart || {});
    /* 로고 파생 — 슬롯(primary·secondary·iconOnly) × 버전(light·dark·mono), 포맷 svg/png 예약 */
    const wm = (b.logo && b.logo.wordmark) || b.name;
    b.logo = Object.assign({ wordmark: wm, sub: '', tagline: '' }, b.logo || {});
    b.logo.variants = {};
    [['primary', wm], ['secondary', b.logo.sub || wm], ['iconOnly', wm.trim()[0]]].forEach(([slot, text]) => {
      b.logo.variants[slot] = {
        light: { text, fg: b.colors.neutral, bg: '#FFFFFF', formats: ['svg', 'png'] },
        dark: { text, fg: '#FFFFFF', bg: b.colors.neutral, formats: ['svg', 'png'] },
        mono: { text, fg: '#111111', bg: 'transparent', formats: ['svg', 'png'] },
      };
    });
    b.palette = derivePalette(b);
    return b;
  }

  /* ============================================================
     5) 레지스트리 — 다중 브랜드 · 등록 시 팔레트를 엔진에 이식
     ============================================================ */
  const BRANDS = {};
  const palId = (id) => 'pl-brand-' + id.replace(/^br-/, '');
  function register(raw) {
    const b = normalize(raw);
    BRANDS[b.id] = b;
    if (SEC()) SEC().PALETTES[palId(b.id)] = Object.assign({}, b.palette);
    return b;
  }
  const get = (id) => BRANDS[id] || null;
  const list = () => Object.values(BRANDS);
  const of = (doc) => (doc && doc.brandId && BRANDS[doc.brandId]) || null;
  function create(name) {
    let n = 1, id;
    do { id = 'br-custom-' + n++; } while (BRANDS[id]);
    const raw = JSON.parse(JSON.stringify(B_KMAKER));
    raw.id = id; raw.name = name || '새 브랜드'; raw.desc = 'K-MAKER 기본값에서 시작한 커스텀 브랜드';
    raw.sharing = { scope: 'private' }; raw.createdAt = new Date().toISOString().slice(0, 10);
    return register(raw);
  }
  function remove(id) {
    if (!BRANDS[id] || !/^br-custom-/.test(id)) return false;
    delete BRANDS[id];
    if (SEC()) delete SEC().PALETTES[palId(id)];
    return true;
  }
  function update(id, patch) {
    const cur = BRANDS[id]; if (!cur) return null;
    const raw = JSON.parse(JSON.stringify(cur));
    delete raw.ramps; delete raw.palette; delete raw.logo.variants;
    ['colors', 'type', 'components', 'icon', 'image', 'chart'].forEach((k) => {
      if (patch[k]) raw[k] = Object.assign({}, raw[k], JSON.parse(JSON.stringify(patch[k])));
    });
    ['name', 'desc', 'org', 'owner', 'sharing', 'version'].forEach((k) => { if (patch[k] !== undefined) raw[k] = patch[k]; });
    raw.updatedAt = new Date().toISOString().slice(0, 10);
    return register(raw);
  }

  /* ============================================================
     6) 적용 — 역할 토큰 치환 1회 패스 (요소별 분기 없음)
     ============================================================ */
  const ROLES = ['dark', 'light', 'soft', 'accent', 'accent2', 'mutedOnDark', 'mutedOnLight'];
  function curPalette(doc) {
    const P = SEC().PALETTES;
    if (doc.paletteId && P[doc.paletteId]) return P[doc.paletteId];
    /* 미기재 문서 — 배경 hex로 추정 */
    const bg = String((doc.scenes[0] || {}).background || '').toLowerCase();
    for (const k of Object.keys(P)) if ([P[k].dark, P[k].light].map((x) => x.toLowerCase()).includes(bg)) return P[k];
    return P['pl-ink'];
  }
  function apply(doc, id) {
    const b = get(id); if (!b || !doc) return false;
    const from = curPalette(doc), to = b.palette;
    const map = {};                                   /* ← 치환 테이블: 이것 하나가 색 변경의 전부 */
    Object.keys(from).forEach((k) => {
      if (k === 'name' || !/^#/.test(String(from[k]))) return;
      if (to[k]) map[String(from[k]).toLowerCase()] = to[k];
    });
    ROLES.forEach((k) => { map[String(from[k]).toLowerCase()] = to[k]; });
    const sub = (v) => (v && map[String(v).toLowerCase()]) || v;
    doc.scenes.forEach((s) => {
      s.background = map[String(s.background || '').toLowerCase()] || (SEC().isDark(s.background) ? to.dark : s.background);
      s.elements.forEach((el) => {                    /* 순회는 하되, 로직은 치환 테이블 적용뿐 */
        if (el.color) el.color = sub(el.color);
        if (el.fill) el.fill = sub(el.fill);
        if (el.accent) el.accent = to.accent;         /* accent 필드 = accent 역할 그 자체 */
      });
    });
    /* 타이포 역할 토큰 */
    doc.fontFamily = b.type.body.family;
    doc.headingFont = b.type.heading.family;
    doc.headingWeight = b.type.heading.weight;
    doc.headingTracking = b.type.heading.tracking;
    /* 바인딩 — 컴포넌트·차트는 렌더러가 이 id 로 라이브 참조 */
    doc.brandId = id;
    doc.paletteId = palId(id);
    delete doc.accentOverride;
    return true;
  }

  /* ============================================================
     7) 검증 — 브랜드 규칙 위반 감지 + fix
     ============================================================ */
  function allowedColors(b) {
    const set = new Set(['#ffffff', '#000000', 'transparent']);
    Object.values(b.palette).forEach((v) => { if (/^#/.test(String(v))) set.add(String(v).toLowerCase()); });
    Object.values(b.ramps).forEach((r) => Object.values(r).forEach((v) => set.add(String(v).toLowerCase())));
    return set;
  }
  /* 무채색(크로마<0.06)은 브랜드 중립 — 목업 회색·헤어라인 등 콘텐츠 색으로 허용 */
  const isNeutralHex = (hex) => { try { const [r, g, b] = hex2rgb(hex); return (Math.max(r, g, b) - Math.min(r, g, b)) / 255 < 0.06; } catch (e) { return false; } };
  function validate(doc) {
    const b = of(doc);
    if (!b) return { ok: false, brand: null, violations: [{ type: 'brand', detail: '문서에 브랜드가 지정되지 않았습니다' }] };
    const okSet = allowedColors(b), out = [];
    const okFonts = new Set([b.type.heading.family, b.type.body.family, b.type.caption.family, b.type.metric.family, b.type.button.family]);
    if (doc.fontFamily && !okFonts.has(doc.fontFamily)) out.push({ type: 'font', detail: `본문 폰트 ${doc.fontFamily} — 브랜드 폰트(${b.type.body.family}) 아님` });
    doc.scenes.forEach((s, si) => {
      const bg = String(s.background || '');
      if (/^#/.test(bg) && !okSet.has(bg.toLowerCase()) && !isNeutralHex(bg)) out.push({ type: 'color', sceneIdx: si, detail: `배경 ${bg} — 브랜드 토큰 밖` });
      s.elements.forEach((el, ei) => {
        ['color', 'fill'].forEach((k) => {
          const v = el[k];
          if (v && /^#/.test(String(v)) && !okSet.has(String(v).toLowerCase()) && !isNeutralHex(String(v)))
            out.push({ type: 'color', sceneIdx: si, elIdx: ei, detail: `${k} ${v} — 브랜드 토큰 밖` });
        });
        if (el.kind === 'chart' && el.accent && String(el.accent).toLowerCase() !== b.palette.accent.toLowerCase())
          out.push({ type: 'chart', sceneIdx: si, elIdx: ei, detail: `차트 강조색 ${el.accent} ≠ 브랜드 ${b.palette.accent}` });
        if (el.kind === 'text' && el.color && /^#/.test(bg)) {
          const cr = contrast(el.color, bg);
          if (cr < 3) out.push({ type: 'contrast', sceneIdx: si, elIdx: ei, detail: `대비 ${cr}:1 — 최소 3:1 미달 ("${String(el.text || '').split('\n')[0].slice(0, 12)}")` });
        }
      });
    });
    return { ok: out.length === 0, brand: b.name, violations: out };
  }
  function fix(doc) {
    const b = of(doc); if (!b) return false;
    let total = 0;
    for (let pass = 0; pass < 3; pass++) {
      const n = fixPass(doc, b); total += n;
      if (!n || validate(doc).ok) break;
    }
    return total;
  }
  function fixPass(doc, b) {
    const bad = validate(doc).violations;
    /* 재치환: 토큰 밖 색은 가장 가까운 브랜드 역할로 스냅 (개별 판단이 아니라 역할 사상) */
    const roles = ROLES.map((k) => b.palette[k]);
    const near = (hex) => roles.reduce((best, c) => {
      const d = hex2rgb(hex).reduce((a, v, i) => a + Math.abs(v - hex2rgb(c)[i]), 0);
      return d < best[0] ? [d, c] : best;
    }, [1e9, roles[0]])[1];
    bad.forEach((v) => {
      if (v.type === 'font') { doc.fontFamily = b.type.body.family; return; }
      if (v.sceneIdx === undefined) return;
      const s = doc.scenes[v.sceneIdx];
      if (v.elIdx === undefined) { s.background = near(s.background); return; }
      const el = s.elements[v.elIdx];
      if (v.type === 'chart') { el.accent = b.palette.accent; return; }
      if (v.type === 'contrast') { el.color = SEC().isDark(s.background) ? '#FFFFFF' : b.colors.neutral; return; }
      ['color', 'fill'].forEach((k) => { if (el[k] && /^#/.test(String(el[k])) && !allowedColors(b).has(String(el[k]).toLowerCase())) el[k] = near(el[k]); });
    });
    return bad.length;
  }

  /* ============================================================
     8) 로고 자동 선택 — AI가 문맥으로 버전을 고른다
     ============================================================ */
  function pickLogo(b, ctx) {
    ctx = ctx || {};
    const slot = ctx.space === 'tight' ? 'iconOnly' : ctx.slot || 'primary';
    const ver = ctx.mono || ctx.print ? 'mono' : ctx.dark ? 'dark' : 'light';
    const v = b.logo.variants[slot][ver];
    const why = [
      slot === 'iconOnly' ? '좁은 공간 → 아이콘 온리' : `기본 슬롯 → ${slot}`,
      ver === 'mono' ? '인쇄/단색 → 모노' : ver === 'dark' ? '어두운 배경 → 라이트 로고(다크 버전)' : '밝은 배경 → 기본',
      (ctx.format === 'print' ? 'SVG 권장' : '화면용 SVG/PNG 모두 가능'),
    ].join(' · ');
    return { slot, version: ver, variant: v, reason: why };
  }

  /* ============================================================
     9) Export / Import — Brand JSON · 버전 · id 충돌 처리
     ============================================================ */
  function exportJSON(id) {
    const b = get(id); if (!b) return null;
    const out = JSON.parse(JSON.stringify(b));
    out.$schema = 'k-maker/brand@1';
    return JSON.stringify(out, null, 2);
  }
  function importJSON(text) {
    let raw;
    try { raw = JSON.parse(text); } catch (e) { return { ok: false, err: 'JSON 파싱 실패: ' + e.message }; }
    for (const k of SCHEMA.required) if (!raw[k]) return { ok: false, err: `필수 필드 누락: ${k}` };
    if (!raw.colors.primary || !/^#[0-9A-Fa-f]{6}$/.test(raw.colors.primary)) return { ok: false, err: 'colors.primary 가 hex 색이 아닙니다' };
    if (!/^br-/.test(raw.id)) return { ok: false, err: 'id 는 br- 로 시작해야 합니다' };
    delete raw.ramps; delete raw.palette; if (raw.logo) delete raw.logo.variants;
    if (BRANDS[raw.id]) {                                 /* 충돌 — 버전 비교 후 사본 생성 */
      let n = 2, nid; do { nid = raw.id + '-' + n++; } while (BRANDS[nid]);
      raw.name = raw.name + ' (가져옴)'; raw.id = nid;
    }
    const b = register(raw);
    return { ok: true, id: b.id, name: b.name, version: b.version };
  }

  /* ---- 붙박이 등록 ---- */
  [B_KMAKER, B_SIGNAL, B_SCHOOL, B_PERSONAL].forEach(register);
  const DEFAULT = 'br-kmaker';

  return { SCHEMA, ramp, contrast, derivePalette, normalize, register, get, list, of, create, remove, update,
           apply, validate, fix, pickLogo, exportJSON, importJSON, palId, DEFAULT, allowedColors };
})();
