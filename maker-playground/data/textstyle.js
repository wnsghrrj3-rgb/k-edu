/* =====================================================================
   MK_TEXTSTYLE — 텍스트 스타일 엔진 (R56)
   · 글꼴 8종(웹폰트) · 프리셋 12종(글꼴+색+배경+외곽선+그림자 조합)
   · apply(el, style) 요소 1개 / applyAll(doc, style) 전 씬 텍스트
   · 스타일 속성만 만진다 — text·x·y·w·size(크기)·기하는 무손상
   · 표시 규약: bg pad는 em 기준(BG_PAD) — DOM·SVG·canvas 세 계층 동률
   ===================================================================== */
window.MK_TEXTSTYLE = (() => {
  /* ---- 글꼴 — index.html에서 로드되는 웹폰트와 1:1 ---- */
  const FONTS = [
    { id: 'pretendard', name: '프리텐다드 (기본)', family: 'Pretendard' },
    { id: 'jua', name: '주아 — 둥글둥글', family: 'Jua' },
    { id: 'dohyeon', name: '도현 — 포스터', family: 'Do Hyeon' },
    { id: 'blackhan', name: '검은고딕 — 임팩트', family: 'Black Han Sans' },
    { id: 'gowundodum', name: '고운돋움 — 단정', family: 'Gowun Dodum' },
    { id: 'gowunbatang', name: '고운바탕 — 책같이', family: 'Gowun Batang' },
    { id: 'nanumpen', name: '나눔 손글씨 펜', family: 'Nanum Pen Script' },
    { id: 'gaegu', name: '개구쟁이 — 아이 글씨', family: 'Gaegu' },
  ];

  /* ---- 배경 패딩 규약 (em) — 모든 표시 계층이 이 수치를 쓴다 ---- */
  const BG_PAD = { x: 0.5, y: 0.22 };

  /* ---- 스타일 속성 집합 — apply가 만지는 전부 ---- */
  const KEYS = ['font', 'color', 'weight', 'bg', 'outline', 'shadow', 'letterSpacing', 'lineHeight'];

  /* ---- 프리셋 12종 ---- */
  const PRESETS = [
    { id: 'ts-basic', name: '기본', hint: '프리텐다드 · 배경 없음',
      style: { font: 'Pretendard', color: null, weight: 700, bg: null, outline: null, shadow: null, letterSpacing: null, lineHeight: null } },
    { id: 'ts-poster', name: '포스터 팝', hint: '검은고딕 · 흰 글자 + 진한 외곽선',
      style: { font: 'Black Han Sans', color: '#FFFFFF', weight: 400, bg: null, outline: { color: '#1F2733', w: 0.055 }, shadow: null, letterSpacing: 0.01, lineHeight: 1.2 } },
    { id: 'ts-neon', name: '네온', hint: '주아 · 민트 글로우',
      style: { font: 'Jua', color: '#4DFFDB', weight: 400, bg: null, outline: null, shadow: { color: '#22D3A5', x: 0, y: 0, blur: 0.45 }, letterSpacing: 0.02, lineHeight: 1.25 } },
    { id: 'ts-caption', name: '자막 바', hint: '반투명 검정 배경 · 흰 글자',
      style: { font: 'Pretendard', color: '#FFFFFF', weight: 600, bg: { color: 'rgba(17,24,39,.72)', radius: 0.25 }, outline: null, shadow: null, letterSpacing: null, lineHeight: 1.35 } },
    { id: 'ts-highlight', name: '형광펜', hint: '노란 하이라이트 배경',
      style: { font: 'Pretendard', color: '#1F2733', weight: 700, bg: { color: '#FFE86B', radius: 0.18 }, outline: null, shadow: null, letterSpacing: null, lineHeight: 1.35 } },
    { id: 'ts-sticker', name: '스티커', hint: '주아 · 흰 글자 + 코랄 외곽선',
      style: { font: 'Jua', color: '#FFFFFF', weight: 400, bg: null, outline: { color: '#FF7A59', w: 0.07 }, shadow: { color: 'rgba(31,39,51,.35)', x: 0.03, y: 0.05, blur: 0.08 }, letterSpacing: 0.01, lineHeight: 1.25 } },
    { id: 'ts-news', name: '뉴스 속보', hint: '도현 · 빨간 배경 흰 글자',
      style: { font: 'Do Hyeon', color: '#FFFFFF', weight: 400, bg: { color: '#C0392B', radius: 0.12 }, outline: null, shadow: null, letterSpacing: 0.02, lineHeight: 1.3 } },
    { id: 'ts-shadowpop', name: '그림자 팝', hint: '도현 · 또렷한 낙하 그림자',
      style: { font: 'Do Hyeon', color: '#FFFFFF', weight: 400, bg: null, outline: null, shadow: { color: 'rgba(0,0,0,.4)', x: 0.06, y: 0.06, blur: 0.02 }, letterSpacing: 0.01, lineHeight: 1.25 } },
    { id: 'ts-hand', name: '손글씨', hint: '나눔 펜 · 잉크색',
      style: { font: 'Nanum Pen Script', color: '#3A4454', weight: 400, bg: null, outline: null, shadow: null, letterSpacing: 0.01, lineHeight: 1.3 } },
    { id: 'ts-kids', name: '아이 글씨', hint: '개구쟁이 · 코랄',
      style: { font: 'Gaegu', color: '#FF7A59', weight: 700, bg: null, outline: null, shadow: null, letterSpacing: 0.02, lineHeight: 1.3 } },
    { id: 'ts-story', name: '동화책', hint: '고운바탕 · 잔잔한 남색',
      style: { font: 'Gowun Batang', color: '#2C3E50', weight: 700, bg: null, outline: null, shadow: null, letterSpacing: 0.01, lineHeight: 1.5 } },
    { id: 'ts-mint', name: '민트 카드', hint: '고운돋움 · 민트 배경',
      style: { font: 'Gowun Dodum', color: '#0E7C6B', weight: 700, bg: { color: '#DFF7F0', radius: 0.3 }, outline: null, shadow: null, letterSpacing: null, lineHeight: 1.4 } },
  ];

  /* ---- 색 팔레트 (직접 컨트롤용) ---- */
  const COLORS = ['#1F2733', '#FFFFFF', '#FF7A59', '#FFD93D', '#22D3A5', '#4DA3FF', '#8B6BD9', '#E84393', '#C0392B', '#0E7C6B'];
  const BGS = [null, 'rgba(17,24,39,.72)', 'rgba(255,255,255,.85)', '#FFE86B', '#FFD9CE', '#DFF7F0', '#E3EEFF'];

  const clone = (v) => v == null ? v : JSON.parse(JSON.stringify(v));

  /* ---- 적용 — 스타일 속성만, 기하·내용 무손상 ---- */
  function apply(el, style) {
    if (!el || el.kind !== 'text' || !style) return el;
    KEYS.forEach((k) => {
      if (!(k in style)) return;
      if (style[k] == null) delete el[k];
      else el[k] = clone(style[k]);
    });
    return el;
  }

  function applyPreset(el, presetId) {
    const p = PRESETS.find((x) => x.id === presetId);
    return p ? apply(el, p.style) : el;
  }

  /* ---- 전 씬 텍스트에 적용 — 개수 정직 반환 ---- */
  function applyAll(doc, style) {
    if (!doc || !doc.scenes || !style) return { ok: false, count: 0 };
    let count = 0;
    doc.scenes.forEach((sc) => (sc.elements || []).forEach((el) => {
      if (el.kind === 'text') { apply(el, style); count++; }
    }));
    return { ok: true, count };
  }

  /* ---- 현재 요소의 스타일 스냅샷 (applyAll에 넘길 형태) ---- */
  function styleOf(el) {
    const o = {};
    KEYS.forEach((k) => { o[k] = el && el[k] != null ? clone(el[k]) : null; });
    return o;
  }

  /* ---- CSS 조각 — Workspace·플레이어가 동일 규약으로 그린다 ---- */
  function css(el) {
    if (!el || el.kind !== 'text') return '';
    let s = '';
    if (el.font) s += `;font-family:'${el.font}',Pretendard,sans-serif`;
    if (el.letterSpacing) s += `;letter-spacing:${el.letterSpacing}em`;
    if (el.lineHeight) s += `;line-height:${el.lineHeight}`;
    if (el.bg && el.bg.color) s += `;background:${el.bg.color};padding:${BG_PAD.y}em ${BG_PAD.x}em;border-radius:${el.bg.radius || 0}em;box-decoration-break:clone;-webkit-box-decoration-break:clone`;
    if (el.outline && el.outline.color) s += `;-webkit-text-stroke:${el.outline.w || 0.05}em ${el.outline.color};paint-order:stroke fill`;
    if (el.shadow && el.shadow.color) s += `;text-shadow:${el.shadow.x || 0}em ${el.shadow.y || 0}em ${el.shadow.blur || 0}em ${el.shadow.color}`;
    return s;
  }

  /* ---- 감사 — 프리셋 무결·apply 무손상·결정론 ---- */
  function audit() {
    const violations = [];
    if (FONTS.length < 8) violations.push('fonts<8');
    if (PRESETS.length < 12) violations.push('presets<12');
    PRESETS.forEach((p) => {
      if (!p.id || !p.name || !p.style) violations.push('preset-shape:' + (p.id || '?'));
      if (p.style.font && !FONTS.some((f) => f.family === p.style.font)) violations.push('preset-font-miss:' + p.id);
    });
    const el = { kind: 'text', text: '검사', x: 10, y: 20, w: 60, size: 5 };
    applyPreset(el, 'ts-caption');
    if (el.text !== '검사' || el.x !== 10 || el.size !== 5) violations.push('apply-geometry-damage');
    if (!el.bg || !el.font) violations.push('apply-noop');
    const a = JSON.stringify(styleOf(el)); applyPreset(el, 'ts-caption');
    if (JSON.stringify(styleOf(el)) !== a) violations.push('non-deterministic');
    applyPreset(el, 'ts-basic');
    if (el.bg || el.outline || el.shadow) violations.push('null-clear-fail');
    return { ok: !violations.length, fonts: FONTS.length, presets: PRESETS.length, violations };
  }

  return { FONTS, PRESETS, COLORS, BGS, BG_PAD, KEYS, apply, applyPreset, applyAll, styleOf, css, audit };
})();
