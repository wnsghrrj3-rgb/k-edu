/* ============================================================
   K-MAKER Universal Render Engine v1  —  window.MK_RENDER
   ------------------------------------------------------------
   철학: Canvas는 하나뿐이다. 출력 포맷만 다르다.
   Scene → Scene Tree → Layout → Typography → Asset/Style →
   Effect → Animation → Render Pipeline(Display List) → Output Adapter.
   모든 Export는 동일한 Display List를 소비한다.
   Canvas 코드는 Export마다 절대 중복 구현하지 않는다.
   ------------------------------------------------------------
   · Display List = 순수 데이터(draw op 배열) — jsdom 검증 가능
   · Adapter 레지스트리: svg(기준) · html · json · png · jpg ·
     pdf(자체 벡터 라이터) · pptx(자체 ZIP/OOXML 라이터) · video(프레임 플랜)
   · 신규 포맷 = registerAdapter(fmt, fn) 하나로 확장
   ⚠ 정직 표기: PNG/JPG 실래스터·Video 실인코딩은 브라우저 전용
     (jsdom에서는 결정론 플랜 반환). PDF 한글은 폰트 임베드 미탑재로
     브라우저 래스터 폴백, 순수 모드는 라틴 Helvetica + 경고 수집.
   ============================================================ */
window.MK_RENDER = (() => {
  'use strict';

  /* ================================================================
     0. 공통 유틸
     ================================================================ */
  const R2 = (n) => Math.round(n * 100) / 100;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const escX = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  /* FNV-1a — DAM과 동일 계열 해시(캐시 키·증분 렌더 판정) */
  const fnv = (str) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  };

  /* ================================================================
     1. Font Resolver — Local · Google · Brand · Fallback · Missing
     ================================================================ */
  const FONT_SOURCES = {
    local: ['Pretendard', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
    google: ['Noto Sans KR', 'Nanum Gothic', 'Gowun Dodum', 'Jua', 'Black Han Sans', 'Gowun Batang', 'Nanum Pen Script', 'Gaegu', 'Do Hyeon'],
  };
  const FALLBACK_CHAIN = ['Pretendard', 'Noto Sans KR', 'sans-serif'];

  function brandFonts() {
    try {
      const B = window.MK_BRAND;
      if (!B || !B.list) return [];
      return B.list().flatMap((b) => (b.fonts ? Object.values(b.fonts) : []))
        .map((f) => (typeof f === 'string' ? f : f && f.family)).filter(Boolean);
    } catch (e) { return []; }
  }

  function resolveFont(family, warn) {
    const fam = family || FALLBACK_CHAIN[0];
    let source = null;
    if (FONT_SOURCES.local.includes(fam)) source = 'local';
    else if (FONT_SOURCES.google.includes(fam)) source = 'google';
    else if (brandFonts().includes(fam)) source = 'brand';
    if (!source) {
      if (warn) warn('missing-font', `폰트 없음: ${fam} → ${FALLBACK_CHAIN[0]} 폴백`);
      return { family: FALLBACK_CHAIN[0], requested: fam, source: 'fallback', missing: true, stack: FALLBACK_CHAIN.join(', ') };
    }
    return { family: fam, requested: fam, source, missing: false, stack: [fam].concat(FALLBACK_CHAIN.filter((f) => f !== fam)).join(', ') };
  }

  /* ================================================================
     2. Asset Resolver — Brand · Workspace · Project · Local · Cloud
     전부 Reference 기준(MK_DAM 경유). 파일 경로 직접 참조 없음.
     ================================================================ */
  function resolveAsset(ref, warn) {
    if (!ref) return null;
    const D = window.MK_DAM;
    if (D && D.get) {
      const a = D.get(ref);
      if (a) {
        const lowRes = a.meta && a.meta.width && a.meta.width < 640;
        if (lowRes && warn) warn('low-resolution', `저해상 자산: ${a.name} (${a.meta.width}px)`);
        return { id: a.id, name: a.name, kind: a.kind, fill: (a.render && a.render.fill) || '#E6ECF2', label: a.name, scope: a.scope || 'workspace' };
      }
      if (warn) warn('broken-reference', `자산 참조 끊김: ${ref}`);
      return { id: ref, broken: true, fill: '#F3D6D6', label: '⚠ 끊긴 참조' };
    }
    return { id: ref, fill: '#E6ECF2', label: ref };
  }

  /* ================================================================
     3. Typography Engine — 결정론 측정·줄바꿈·오버플로·자동 축소
     R115 — 문자폭은 글꼴별 실측표에서 온다 (종전엔 전 글꼴 공통 고정표)
     ================================================================ */

  /* R115 — 폭 모델이 글꼴을 모르고 있었다.
     종전 표는 한글/CJK 1.0em · 대문자 .66 · 소문자 .52 … 하나로, 프리텐다드든
     나눔 손글씨 펜이든 검은고딕이든 같은 수로 쟀다. layoutText 는 첫 줄에서
     resolveFont 로 글꼴을 해석해놓고 폭 계산엔 한 번도 쓰지 않았다.

     실측이 잔인했다 — 한글은 어떤 글꼴에서도 1.0em 이 아니다:
       나눔 손글씨 펜 0.624 · 도현 0.768 · 주아 0.819 · 개구쟁이 0.820 ·
       검은고딕 0.832 · 프리텐다드 0.864 · 고운돋움/고운바탕 0.914 ·
       Noto Sans KR 0.920 · 나눔고딕 0.940
     기본 글꼴 프리텐다드조차 모델이 15.7% 더 넓게 봤고, 나눔 손글씨 펜은
     60% 더 넓게 봤다. 결과는 두 갈래로 나타났다:
       · 줄바꿈이 실제보다 일찍 일어난다 (오른쪽에 안 쓴 자리가 남는다)
       · 배경 pill 폭(textW)이 글자보다 넓게 그려진다 — 손글씨 프리셋 34.2%

     그리고 이게 export 안에서 자기모순이 됐다. 같은 배경 pill 을
     SVG 는 op.textW(모델)로, canvas(PNG·MP4)는 cx.measureText(브라우저 실측)로
     그렸다 — 같은 문서가 형식에 따라 다른 폭으로 나왔다는 뜻이다.

     표의 출처: fontkit 으로 실폰트 파일의 hmtx advance 를 직접 읽어
     unitsPerEm 으로 정규화한 값. 문자군별 평균이고 표본은 한글 33·라틴 각 26·
     숫자 10·부호 8~9·기타 15 자다. 한글은 대부분 글꼴에서 고정폭이라
     평균이 곧 실값이고(min=max), 고운바탕만 가변(0.850~0.960)이라 평균을 쓴다.
     굵기는 한글 폭을 거의 안 바꾸고(고운바탕 400→700 에서 +0.6%)
     라틴만 최대 8% 넓힌다 — 이번 라운드는 글꼴 축만 갚는다. */
  const FONT_METRICS = {
    /*                    han    cjkp    sp     up     lo     di     pu     ot   */
    'Pretendard':       { han: .864, cjkp: .639, sp: .251, up: .641, lo: .506, di: .584, pu: .268, ot: .527 },
    'Noto Sans KR':     { han: .920, cjkp: .920, sp: .224, up: .636, lo: .530, di: .555, pu: .335, ot: .520 },
    'Nanum Gothic':     { han: .940, cjkp: .940, sp: .280, up: .651, lo: .520, di: .606, pu: .322, ot: .573 },
    'Jua':              { han: .819, cjkp: .819, sp: .300, up: .608, lo: .480, di: .576, pu: .303, ot: .578 },
    'Do Hyeon':         { han: .768, cjkp: .768, sp: .300, up: .548, lo: .456, di: .509, pu: .227, ot: .476 },
    'Black Han Sans':   { han: .832, cjkp: .832, sp: .300, up: .696, lo: .634, di: .600, pu: .310, ot: .561 },
    'Gowun Dodum':      { han: .914, cjkp: .914, sp: .310, up: .626, lo: .464, di: .531, pu: .321, ot: .583 },
    'Gowun Batang':     { han: .914, cjkp: .914, sp: .310, up: .632, lo: .485, di: .531, pu: .321, ot: .583 },
    'Nanum Pen Script': { han: .624, cjkp: .624, sp: .280, up: .436, lo: .385, di: .340, pu: .258, ot: .419 },
    'Gaegu':            { han: .820, cjkp: .820, sp: .420, up: .541, lo: .443, di: .509, pu: .372, ot: .609 },
  };

  /* R115 — 폭 읽기 정본. 표에 없는 글꼴(브랜드 커스텀·OS 글꼴)은 폴백 표를 쓴다.
     읽는 자리가 여기 하나뿐이라야 다음에 또 갈리지 않는다. */
  function metricsOf(family) {
    return FONT_METRICS[family || FALLBACK_CHAIN[0]] || FONT_METRICS[FALLBACK_CHAIN[0]];
  }
  const DEF_METRICS = FONT_METRICS[FALLBACK_CHAIN[0]];

  /* 문자군 판정 — 배수는 글꼴별 실측표에서 온다. 범위는 종전 그대로다
     (여기서 넓히면 글꼴 축 말고 다른 것까지 같이 움직인다) */
  const CH_G = (ch) => {
    const c = ch.codePointAt(0);
    if (c >= 0xAC00 && c <= 0xD7A3) return 'han';            /* 한글 음절 */
    if (c >= 0x4E00 && c <= 0x9FFF) return 'han';            /* 한자 */
    if (c >= 0x3000 && c <= 0x303F) return 'cjkp';           /* CJK 부호 */
    if (ch === ' ') return 'sp';
    if (/[A-Z]/.test(ch)) return 'up';
    if (/[a-z]/.test(ch)) return 'lo';
    if (/[0-9]/.test(ch)) return 'di';
    if (/[.,:;'"!|·]/.test(ch)) return 'pu';
    return 'ot';
  };
  const CH_W = (ch, m) => { const v = (m || DEF_METRICS)[CH_G(ch)]; return v == null ? (m || DEF_METRICS).ot : v; };
  /* 커닝 근사 — 글꼴별 kern/GPOS 까지는 재지 않았다. 라틴 3 쌍만 종전 그대로 */
  const KERN = { 'AV': -0.06, 'To': -0.05, 'Yo': -0.05, '가.': -0.03 };

  function measure(text, size, letterSpacing, m) {
    const ls = letterSpacing || 0;
    const mm = m || DEF_METRICS;
    let w = 0; const chars = Array.from(text);
    for (let i = 0; i < chars.length; i++) {
      w += CH_W(chars[i], mm) * size + ls;
      const pair = chars[i] + (chars[i + 1] || '');
      if (KERN[pair]) w += KERN[pair] * size;
    }
    return R2(w);
  }

  /* 단어 우선 줄바꿈 — 공백 단위, 단어가 폭 초과 시 음절 단위 강제 분할 */
  function wrap(text, maxW, size, letterSpacing, m) {
    const out = [];
    String(text == null ? '' : text).split('\n').forEach((para) => {
      if (!para) { out.push(''); return; }
      let line = '';
      para.split(' ').forEach((word) => {
        const tryLine = line ? line + ' ' + word : word;
        if (measure(tryLine, size, letterSpacing, m) <= maxW) { line = tryLine; return; }
        if (line) out.push(line);
        if (measure(word, size, letterSpacing, m) <= maxW) { line = word; return; }
        /* 음절 단위 강제 분할 */
        let seg = '';
        Array.from(word).forEach((ch) => {
          if (measure(seg + ch, size, letterSpacing, m) > maxW && seg) { out.push(seg); seg = ch; }
          else seg += ch;
        });
        line = seg;
      });
      if (line) out.push(line);
    });
    return out.length ? out : [''];
  }

  /* R111 — 텍스트가 실제로 차지하는 줄 수. 정본은 여기 하나다.
     layoutText 가 그리기 직전에 하는 것과 똑같은 준비(list 접두 → wrap)를 해서
     프레임을 재는 쪽과 글자를 그리는 쪽이 같은 숫자를 보게 한다.
     여태 프레임(frameOf)은 개행 문자만 셌고 그리는 쪽은 wrap 을 했다 —
     같은 파일 안에서 두 값이 갈라져 있었다. */
  /* R114 — 자간 읽기 정본. 같은 물리량이 두 이름으로 갈려 있었다:
       · el.letterSpacing — render 가 읽는 키. MK_TEXTSTYLE 프리셋이 심는다.
       · el.tracking      — 템플릿 t() 헬퍼·aiedit 이 심고 editor·play 가 CSS 로
                            그리던 키. render 는 이 이름을 몰랐다.
     결과는 이랬다: tracking 이 붙은 글자는 화면에선 벌어져 보이고 내려받은
     파일에선 자간 0 으로 붙어 나왔다. R113 이 「화면이 export 에게 배치를 묻는다」
     를 세운 뒤로는 더 나빠졌다 — 화면이 CSS 로는 자간을 그리면서 줄바꿈은
     자간을 모르는 창구에게 물으니, 화면 자신이 자기 줄 안에서 넘쳤다.
     정본은 letterSpacing 하나. tracking 은 옛 이름으로 읽기만 흡수한다.
     읽는 자리가 여기 하나뿐이라야 다음에 또 갈리지 않는다. */
  function lsOf(el) {
    if (!el) return 0;
    return +(el.letterSpacing != null ? el.letterSpacing : (el.tracking || 0)) || 0;
  }

  function listPrefixed(el) {
    let raw = String(el.text == null ? '' : el.text);
    if (el.list === 'bullet') raw = raw.split('\n').map((l) => (l ? '· ' + l : l)).join('\n');
    if (el.list === 'number') raw = raw.split('\n').map((l, i) => (l ? (i + 1) + '. ' + l : l)).join('\n');
    return raw;
  }
  function textLines(el, boxW, size) {
    /* R115 — 줄 수 정본도 글꼴을 본다. frameOf 가 이걸 부르므로, 여기서 표를
       안 넘기면 프레임만 옛 폭으로 남아 layoutText 와 다시 갈린다. */
    return wrap(listPrefixed(el), boxW, size, lsOf(el) * size, metricsOf(el && el.font)).length;
  }

  /* Paragraph 처리: bullet('· ')·number('1. ') 접두 + 오버플로 정책 */
  function layoutText(el, box, warn) {
    const font = resolveFont(el.font, warn);
    /* R115 — 여기서 해석한 글꼴을 드디어 폭 계산이 쓴다. 종전엔 이 줄이
       그리기용 stack 만 만들고 폭은 전 글꼴 공통표로 쟀다.
       font.family 는 폴백이 이미 반영된 값이라, 없는 글꼴을 지정한 원소는
       화면이 그리는 폴백 글꼴과 같은 표로 재게 된다. */
    const fm = metricsOf(font.family);
    let size = el.sizePx;
    const lh = el.lineHeight || 1.35;
    const ls = lsOf(el) * size;
    let raw = listPrefixed(el);                    /* R111 — 접두 규약은 정본 하나로 */

    let lines = wrap(raw, box.w, size, ls, fm);
    const fits = () => lines.length * size * lh <= box.h + size * 0.4;

    const overflow = el.overflow || 'visible';
    if (overflow === 'autoresize') {
      let guard = 24;
      while (!fits() && size > 6 && guard--) { size = R2(size * 0.92); lines = wrap(raw, box.w, size, lsOf(el) * size, fm); }
    } else if (overflow === 'clip' || overflow === 'ellipsis') {
      const maxLines = Math.max(1, Math.floor(box.h / (size * lh)));
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        if (overflow === 'ellipsis') lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1,2}$/, '') + '…';
      }
    }
    return { font, size, lineHeight: lh, letterSpacing: ls, lines, textW: Math.max(...lines.map((l) => measure(l, size, ls, fm)), 0) };
  }

  /* R113 — 화면이 export 에게 배치를 묻는 창구.
     여태 화면(workspace·editor·미니)은 el.text 를 통째로 div 에 넣고 브라우저에
     맡겼다. 그래서 overflow 정책이 화면엔 아예 존재하지 않았다:
       · ellipsis|clip  — export 는 잘라 그리는데 화면은 다 보여줬다
       · autoresize     — export 는 줄여 그리는데 화면은 원크기로 그렸다
       · list           — export 는 '· ' 접두를 그리는데 화면엔 없었다
     교사가 화면에서 읽은 문장이 내려받은 파일엔 없을 수 있었다는 뜻이다.

     두 번째 배치 엔진을 만들지 않는다. 이 함수는 renderScene 이 텍스트에 하는 일
     (frameOf → sizePx → layoutText)을 그대로 밟아 결과만 돌려준다. 새 계산이
     없으니 화면은 export 를 흉내내는 게 아니라 export 에게 묻는다 — 앞으로 정책이
     바뀌면 화면이 공짜로 따라온다.

     W·H 는 반드시 씬 자신의 px 공간(scene.width·height)이다. 화면 캔버스 픽셀이
     아니다: autoresize 의 6px 하한 같은 절대항은 ar 불변으로 못 잡히므로,
     같은 좌표계에서 물어야 export 와 같은 값이 나온다.
     캐시는 붙이지 않는다 — renderScene 의 텍스트 캐시 키는 letterSpacing 을
     안 봐서, 빌려 쓰면 자간을 만지는 동안 화면이 굳는다. */
  function layoutOf(el, W, H) {
    if (!el || el.kind !== 'text') return null;
    const w = +W > 0 ? +W : 1280, h = +H > 0 ? +H : 720;
    const f = frameOf(el, w, h);
    const sizePx = (el.size || 3) * h / 100;
    const T = layoutText({ ...el, sizePx }, f, () => {});
    /* R114 — 자간은 두 단위로 답한다. letterSpacing 은 px(export 와 같은 수),
       letterSpacingEm 은 배수. 플레이어처럼 cqh 로 크기를 잡는 화면은 px 을
       쓸 수 없으니, 거기서 자기 손으로 el 을 다시 읽는 일이 없게 여기서 준다. */
    return { frame: f, font: T.font, size: T.size, lineHeight: T.lineHeight,
      letterSpacing: T.letterSpacing, letterSpacingEm: lsOf(el), lines: T.lines, textW: T.textW, sizePx };
  }

  /* ================================================================
     4. Vector Engine — 도형→SVG path d (모든 어댑터가 공유하는 기하)
     ================================================================ */
  const VEC = {
    rect(x, y, w, h, rx) {
      if (!rx) return `M${R2(x)} ${R2(y)}H${R2(x + w)}V${R2(y + h)}H${R2(x)}Z`;
      rx = Math.min(rx, w / 2, h / 2);
      return `M${R2(x + rx)} ${R2(y)}H${R2(x + w - rx)}Q${R2(x + w)} ${R2(y)} ${R2(x + w)} ${R2(y + rx)}V${R2(y + h - rx)}Q${R2(x + w)} ${R2(y + h)} ${R2(x + w - rx)} ${R2(y + h)}H${R2(x + rx)}Q${R2(x)} ${R2(y + h)} ${R2(x)} ${R2(y + h - rx)}V${R2(y + rx)}Q${R2(x)} ${R2(y)} ${R2(x + rx)} ${R2(y)}Z`;
    },
    ellipse(x, y, w, h) {
      const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
      return `M${R2(cx - rx)} ${R2(cy)}A${R2(rx)} ${R2(ry)} 0 1 0 ${R2(cx + rx)} ${R2(cy)}A${R2(rx)} ${R2(ry)} 0 1 0 ${R2(cx - rx)} ${R2(cy)}Z`;
    },
    polygon(x, y, w, h, n) {
      n = clamp(n || 6, 3, 24);
      const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2, pts = [];
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        pts.push(`${R2(cx + rx * Math.cos(a))} ${R2(cy + ry * Math.sin(a))}`);
      }
      return 'M' + pts.join('L') + 'Z';
    },
    star(x, y, w, h, n, inner) {
      n = clamp(n || 5, 3, 12); inner = inner || 0.45;
      const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2, pts = [];
      for (let i = 0; i < n * 2; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / n;
        const k = i % 2 === 0 ? 1 : inner;
        pts.push(`${R2(cx + rx * k * Math.cos(a))} ${R2(cy + ry * k * Math.sin(a))}`);
      }
      return 'M' + pts.join('L') + 'Z';
    },
    line(x1, y1, x2, y2) { return `M${R2(x1)} ${R2(y1)}L${R2(x2)} ${R2(y2)}`; },
    bezier(pts) {
      if (!pts || pts.length < 2) return '';
      let d = `M${R2(pts[0][0])} ${R2(pts[0][1])}`;
      for (let i = 1; i < pts.length - 1; i += 2) {
        const c = pts[i], p = pts[i + 1] || pts[i];
        d += `Q${R2(c[0])} ${R2(c[1])} ${R2(p[0])} ${R2(p[1])}`;
      }
      return d;
    },
    /* Boolean union 근사 — 두 path를 동일 fill 하나의 d로 병합(evenodd 아님, 겹침 허용).
       진짜 CSG는 미탑재(정직 표기) — subtract/intersect 요청 시 unsupported 경고 */
    boolean(op, d1, d2, warn) {
      if (op === 'union') return d1 + ' ' + d2;
      if (warn) warn('unsupported-effect', `Boolean ${op} 미지원 — union만 지원`);
      return d1;
    },
  };

  function shapePath(el, f) {
    switch (el.shape) {
      case 'ellipse': return VEC.ellipse(f.x, f.y, f.w, f.h);
      case 'polygon': return VEC.polygon(f.x, f.y, f.w, f.h, el.sides);
      case 'star': return VEC.star(f.x, f.y, f.w, f.h, el.points, el.inner);
      case 'line': return VEC.line(f.x, f.y + f.h / 2, f.x + f.w, f.y + f.h / 2);
      case 'bezier': case 'pen': case 'path': return el.d || VEC.bezier(el.pts);
      default: return VEC.rect(f.x, f.y, f.w, f.h, el.radius || 0);
    }
  }

  /* ================================================================
     5. Style · Image · Effect Resolver
     ================================================================ */
  let defSeq = 0;
  function gradientDef(g, defs) {
    const id = 'g' + (++defSeq);
    const stops = (g.stops || [[0, g.from || '#fff'], [1, g.to || '#000']])
      .map(([o, c]) => `<stop offset="${R2(o * 100)}%" stop-color="${escX(c)}"/>`).join('');
    defs.push(g.type === 'radial'
      ? `<radialGradient id="${id}">${stops}</radialGradient>`
      : `<linearGradient id="${id}" x1="0" y1="0" x2="${g.angle === 90 ? 0 : 1}" y2="${g.angle === 90 ? 1 : 0}">${stops}</linearGradient>`);
    return `url(#${id})`;
  }

  function resolveEffects(el, defs, warn) {
    const fx = el.effects || {};
    const attrs = {}; const filters = [];
    if (fx.dropShadow) { const s = fx.dropShadow; filters.push(`<feDropShadow dx="${s.dx || 0}" dy="${s.dy || 3}" stdDeviation="${s.blur || 4}" flood-color="${escX(s.color || '#000')}" flood-opacity="${s.opacity != null ? s.opacity : 0.25}"/>`); }
    if (fx.glow) { const s = fx.glow; filters.push(`<feDropShadow dx="0" dy="0" stdDeviation="${s.blur || 6}" flood-color="${escX(s.color || '#FFD466')}" flood-opacity="${s.opacity != null ? s.opacity : 0.8}"/>`); }
    if (fx.blur) filters.push(`<feGaussianBlur stdDeviation="${fx.blur}"/>`);
    if (fx.innerShadow) { warn && warn('unsupported-effect', 'Inner Shadow — 근사(테두리 음영)로 대체'); attrs.stroke = fx.innerShadow.color || 'rgba(0,0,0,.18)'; attrs['stroke-width'] = fx.innerShadow.blur || 2; }
    if (fx.noise || fx.glass) warn && warn('unsupported-effect', (fx.noise ? 'Noise' : 'Glass') + ' — v2 예정(구조만)');
    if (fx.border) { attrs.stroke = fx.border.color || '#1F2733'; attrs['stroke-width'] = fx.border.width || 1; }
    if (fx.blend) attrs['mix-blend-mode'] = fx.blend;
    if (filters.length) {
      const id = 'f' + (++defSeq);
      defs.push(`<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">${filters.join('')}</filter>`);
      attrs.filter = `url(#${id})`;
    }
    return attrs;
  }

  function imageFilterCss(el) {
    /* R101 — 정의는 MK_PHOTO 한 곳(씬 좌표 blur 정본 · 기본값 미방출).
       SVG viewBox = 씬 좌표이므로 배율 1. 폴백은 단독 로드용 최소 구현. */
    if (window.MK_PHOTO) return window.MK_PHOTO.css(el, 1);
    const f = el.filters || {}; const parts = [];
    if (f.brightness != null) parts.push(`brightness(${f.brightness})`);
    if (f.contrast != null) parts.push(`contrast(${f.contrast})`);
    if (f.saturate != null) parts.push(`saturate(${f.saturate})`);
    if (f.grayscale != null) parts.push(`grayscale(${f.grayscale})`);
    if (f.sepia != null) parts.push(`sepia(${f.sepia})`);
    if (f.hueRotate != null) parts.push(`hue-rotate(${f.hueRotate}deg)`);
    if (f.blur != null) parts.push(`blur(${f.blur}px)`);
    return parts.join(' ');
  }

  /* ================================================================
     6. Layout Engine — Absolute(%) · AutoLayout · Flex · Grid ·
        Constraint · Padding — 전 요소 프레임(px) 확정
     ================================================================ */
  function frameOf(el, W, H) {
    /* 기본: 기존 샘플 스키마(% 좌표) 그대로 절대 배치 */
    const x = (el.x || 0) * W / 100, y = (el.y || 0) * H / 100;
    const w = (el.w || 10) * W / 100;
    /* R111 — 텍스트 높이가 자동 줄바꿈을 안다.
       종전엔 개행 문자만 세서, 폭을 넘겨 흐른 글자가 프레임 밖에 남았다.
       줄 수는 layoutText 가 쓰는 것과 같은 정본(textLines)에서 받는다 —
       그래야 프레임이 담는 줄과 실제로 그리는 줄이 같다. 이 높이는
       overflow=clip|ellipsis 의 maxLines 와 autoresize 의 축소 판정 기준이기도 해서,
       틀린 높이는 화면 미관이 아니라 결과물에서 사라지는 글자로 나타난다. */
    let h;
    if (el.h != null) h = el.h * H / 100;
    else if (el.kind === 'text') {
      const sz = (el.size || 3) * H / 100;
      let n = 1;
      try { n = textLines(el, w, sz) || 1; } catch (e) { n = String(el.text || '').split('\n').length; }
      h = Math.max(sz * 1.5, sz * 1.4 * n);
    } else h = 40;
    return { x: R2(x), y: R2(y), w: R2(w), h: R2(h) };
  }

  function applyConstraint(f, cons, W, H) {
    if (!cons) return f;
    const g = { ...f };
    if (cons.right != null) g.x = W - cons.right * W / 100 - f.w;
    if (cons.bottom != null) g.y = H - cons.bottom * H / 100 - f.h;
    if (cons.centerX) g.x = (W - f.w) / 2;
    if (cons.centerY) g.y = (H - f.h) / 2;
    return g;
  }

  /* AutoLayout 컨테이너: children을 flex/grid 규칙으로 재배치 */
  function autoLayout(container, children) {
    const al = container.layout; if (!al) return children;
    const f = container._frame;
    const pad = al.padding || 0, gap = al.gap || 0;
    const inner = { x: f.x + pad, y: f.y + pad, w: f.w - pad * 2, h: f.h - pad * 2 };
    if (al.mode === 'grid') {
      const cols = al.cols || 2;
      const cw = (inner.w - gap * (cols - 1)) / cols;
      const rows = Math.ceil(children.length / cols);
      const ch = (inner.h - gap * (rows - 1)) / rows;
      children.forEach((c, i) => {
        c._frame = { x: R2(inner.x + (i % cols) * (cw + gap)), y: R2(inner.y + Math.floor(i / cols) * (ch + gap)), w: R2(cw), h: R2(ch) };
      });
      return children;
    }
    /* flex row|col */
    const row = al.mode !== 'col';
    const main = row ? inner.w : inner.h;
    const fixed = children.reduce((s, c) => s + (row ? c._frame.w : c._frame.h), 0) + gap * (children.length - 1);
    let cursor = row ? inner.x : inner.y;
    if (al.justify === 'center') cursor += (main - fixed) / 2;
    if (al.justify === 'end') cursor += main - fixed;
    children.forEach((c) => {
      const cf = c._frame;
      if (row) {
        cf.x = R2(cursor);
        cf.y = al.align === 'end' ? R2(inner.y + inner.h - cf.h) : al.align === 'center' ? R2(inner.y + (inner.h - cf.h) / 2) : R2(inner.y);
        cursor += cf.w + gap;
      } else {
        cf.y = R2(cursor);
        cf.x = al.align === 'end' ? R2(inner.x + inner.w - cf.w) : al.align === 'center' ? R2(inner.x + (inner.w - cf.w) / 2) : R2(inner.x);
        cursor += cf.h + gap;
      }
    });
    return children;
  }

  /* ================================================================
     7. Animation Engine — Scene 타임라인 구성 + t 샘플링(영상 프레임용)
     ================================================================ */
  const EASE_FN = {
    'linear': (t) => t,
    'ease-out': (t) => 1 - Math.pow(1 - t, 2.2),
    'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  };
  function buildTimeline(scene, els) {
    const anim = scene.animation || {};
    const enter = (anim.enter && anim.enter.preset) || scene.animationPreset || 'fade';
    const stagger = (anim.enter && anim.enter.stagger) != null ? anim.enter.stagger : 0.12;
    const dur = (anim.enter && anim.enter.duration) || 0.6;
    return {
      duration: scene.duration || 4,
      tracks: els.map((el, i) => ({
        el: i, preset: (el.anim && el.anim.preset) || enter,
        t0: R2((el.anim && el.anim.delay) != null ? el.anim.delay : i * stagger),
        dur: (el.anim && el.anim.duration) || dur,
        ease: (el.anim && el.anim.ease) || 'ease-out',
        dir: (el.anim && el.anim.direction) || (anim.enter && anim.enter.direction) || 'up',
        loop: (el.anim && el.anim.repeat) || 1,
      })),
    };
  }
  function sampleTrack(tr, t) {
    const p = clamp((t - tr.t0) / tr.dur, 0, 1);
    const e = (EASE_FN[tr.ease] || EASE_FN['ease-out'])(p);
    const st = { opacity: 1, dx: 0, dy: 0, scale: 1, rotate: 0 };
    const D = 46;
    switch (tr.preset) {
      case 'fade': st.opacity = e; break;
      case 'slide': st.opacity = e; st.dx = tr.dir === 'left' ? (1 - e) * D : tr.dir === 'right' ? -(1 - e) * D : 0; st.dy = tr.dir === 'up' ? (1 - e) * D : tr.dir === 'down' ? -(1 - e) * D : 0; break;
      case 'scale': st.opacity = e; st.scale = 0.6 + 0.4 * e; break;
      case 'zoom': st.opacity = e; st.scale = 1.35 - 0.35 * e; break;
      case 'pop': st.opacity = Math.min(1, e * 1.4); st.scale = e < 0.7 ? 0.5 + e : 1.2 - (e - 0.7) * 0.66; break;
      case 'bounce': st.opacity = 1; st.dy = -Math.abs(Math.sin(p * Math.PI * 2)) * (1 - p) * D; break;
      case 'wipe': st.opacity = 1; st.clip = e; break;
      case 'blur': st.opacity = e; st.blur = (1 - e) * 8; break;
      case 'rotate': st.opacity = e; st.rotate = (1 - e) * -8; break;
      default: st.opacity = e;
    }
    return st;
  }

  /* ================================================================
     8. Render Pipeline — Scene → Display List (순수 데이터)
     op: { op:'shape'|'text'|'image', frame, d?, style, lines?, ... }
     ================================================================ */
  const CACHE = {
    scene: new Map(), text: new Map(), vector: new Map(), thumb: new Map(),
    stats: { hit: 0, miss: 0 },
    invalidate(sceneId) { for (const k of this.scene.keys()) if (k.startsWith(sceneId + '|')) this.scene.delete(k); },
    clear() { this.scene.clear(); this.text.clear(); this.vector.clear(); this.thumb.clear(); this.stats = { hit: 0, miss: 0 }; },
  };
  const sceneHash = (scene) => fnv(JSON.stringify(scene));

  function renderScene(scene, opts) {
    opts = opts || {};
    const key = (scene.id || 's') + '|' + sceneHash(scene) + '|' + fnv(JSON.stringify({ s: opts.scale, t: opts.time, th: opts.theme }));
    if (!opts.noCache && CACHE.scene.has(key)) { CACHE.stats.hit++; return CACHE.scene.get(key); }
    CACHE.stats.miss++;

    const warnings = [];
    const warn = (code, msg) => warnings.push({ code, msg });
    const W = scene.width || 1280, H = scene.height || 720;
    const defs = [];
    const ops = [];
    defSeq = 0;

    /* 배경 */
    const bg = scene.background || '#FFFFFF';
    ops.push({ op: 'shape', role: 'background', frame: { x: 0, y: 0, w: W, h: H }, d: VEC.rect(0, 0, W, H, 0), style: { fill: typeof bg === 'object' ? gradientDef(bg, defs) : bg } });

    /* Scene Tree 구성: 프레임 확정 → AutoLayout 그룹 재배치 → z(order) */
    const els = (scene.elements || []).map((el, i) => ({ ...el, _i: i, _frame: applyConstraint(frameOf(el, W, H), el.constraints, W, H) }));
    els.filter((e) => e.layout && e.children).forEach((cont) => autoLayout(cont, cont.children.map((ci) => els[ci]).filter(Boolean)));
    els.sort((a, b) => (a.z || 0) - (b.z || 0) || a._i - b._i);

    const timeline = buildTimeline(scene, els);

    els.forEach((el) => {
      if (el.visible === false) return;
      const f = el._frame;
      const fx = resolveEffects(el, defs, warn);
      const anim = opts.time != null ? sampleTrack(timeline.tracks[el._i] || { t0: 0, dur: 0.6, preset: 'fade', ease: 'ease-out' }, opts.time) : null;
      const base = { opacity: el.opacity != null ? el.opacity : 1, ...fx };
      if (anim) {
        base.opacity = R2(base.opacity * anim.opacity);
        if (anim.dx || anim.dy || anim.scale !== 1 || anim.rotate) base.transform = `translate(${R2(anim.dx || 0)} ${R2(anim.dy || 0)}) rotate(${R2(anim.rotate || 0)} ${R2(f.x + f.w / 2)} ${R2(f.y + f.h / 2)}) scale(${R2(anim.scale)})`;
      }
      if (el.rot) {                                    /* R37 — 편집 회전을 출력에도 동일 반영 */
        const rt = `rotate(${R2(el.rot)} ${R2(f.x + f.w / 2)} ${R2(f.y + f.h / 2)})`;
        base.transform = base.transform ? base.transform + ' ' + rt : rt;
      }
      if (window.MK_PHOTO && (el.flipH || el.flipV)) { /* R102 — 뒤집기를 출력에도 동일 반영 */
        const fp = window.MK_PHOTO.flipSvg(el, f);
        if (fp) base.transform = base.transform ? base.transform + ' ' + fp : fp;
      }
      if (el.rotate) base.transform = (base.transform || '') + ` rotate(${el.rotate} ${R2(f.x + f.w / 2)} ${R2(f.y + f.h / 2)})`;

      if (el.kind === 'text') {
        const sizePx = (el.size || 3) * H / 100;
        /* R113 — 키가 layoutText 의 입력을 모두 본다.
           종전 키엔 letterSpacing·lineHeight 가 없었다. 둘 다 wrap 결과를 바꾸는데도.
           프레임 높이가 우연히 같으면(자간이 줄 수를 안 바꾼 경우) 키가 충돌해서
           자간 다른 텍스트가 남의 배치를 물려받았다 — probe113 실측: 자간 0.08 요소가
           자간 0 의 줄바꿈으로 출력됐다. 화면이 export 에게 묻기 시작한 이상,
           export 가 틀리면 화면도 같이 틀린다. 여기서 막는다. */
        const tkey = fnv(JSON.stringify([el.text, sizePx, f.w, f.h, el.overflow, el.list, el.font, lsOf(el), el.lineHeight]));
        let T;
        if (CACHE.text.has(tkey)) { T = CACHE.text.get(tkey); CACHE.stats.hit++; }
        else { T = layoutText({ ...el, sizePx }, f, warn); CACHE.text.set(tkey, T); CACHE.stats.miss++; }
        const align = el.align || 'left';
        ops.push({ op: 'text', frame: f, lines: T.lines, size: R2(T.size), lineHeight: T.lineHeight, letterSpacing: R2(T.letterSpacing), align, weight: el.weight || 400, font: T.font, textW: R2(T.textW),
          bg: el.bg || null, outline: el.outline || null, shadow: el.shadow || null, /* R56 — 텍스트 배경·외곽선·그림자 */
          style: { fill: el.color || (isDark(bg) ? '#FFFFFF' : '#1F2733'), ...base } });
        return;
      }
      if (el.kind === 'image') {
        if (el.fill) { /* 컬러 박스(도형) — 기존 샘플 관례 */
          const d = shapePath(el, f);
          ops.push({ op: 'shape', frame: f, d, style: { fill: typeof el.fill === 'object' ? gradientDef(el.fill, defs) : el.fill, ...base } });
          return;
        }
        const asset = resolveAsset(el.assetId, warn);
        const filter = imageFilterCss(el);
        let clipId = null;
        /* R105 — 유효 crop 만 (문자열 '4:3' 유산·비수치는 무시 — NaN clipPath 차단) */
        const crv = (window.MK_PHOTO && window.MK_PHOTO.cropOf) ? window.MK_PHOTO.cropOf(el)
          : (el.crop && typeof el.crop === 'object' && isFinite(+el.crop.w) && +el.crop.w > 0 && isFinite(+el.crop.h) && +el.crop.h > 0 ? el.crop : null);
        if (el.mask || crv) {
          clipId = 'c' + (++defSeq);
          const mf = crv ? { x: f.x + f.w * crv.x, y: f.y + f.h * crv.y, w: f.w * crv.w, h: f.h * crv.h } : f;
          defs.push(`<clipPath id="${clipId}"><path d="${el.mask ? shapePath({ shape: el.mask }, f) : VEC.rect(mf.x, mf.y, mf.w, mf.h, 0)}"/></clipPath>`);
        }
        ops.push({ op: 'image', frame: f, asset, src: el.src || (asset && asset.src) || null, fit: el.fit || 'cover', focal: el.focal || null, nar: (isFinite(+el.nar) && +el.nar > 0) ? +el.nar : null, /* R106 — 원본 종횡비(연속 초점 export) */ radius: el.radius, label: el.label != null ? el.label : (asset && asset.label) || '', clip: clipId, cssFilter: filter, style: { fill: (asset && asset.fill) || '#E6ECF2', ...base } });
        return;
      }
      /* 순수 도형 */
      const d = shapePath(el, f);
      ops.push({ op: 'shape', frame: f, d, style: { fill: el.fill ? (typeof el.fill === 'object' ? gradientDef(el.fill, defs) : el.fill) : 'none', stroke: el.stroke, 'stroke-width': el.strokeWidth, ...base } });
    });

    const dl = { sceneId: scene.id, width: W, height: H, background: bg, defs, ops, timeline, warnings, hash: sceneHash(scene), stats: { ops: ops.length, defs: defs.length } };
    if (!opts.noCache) CACHE.scene.set(key, dl);
    return dl;
  }

  const isDark = (hex) => {
    if (typeof hex !== 'string' || hex[0] !== '#') return false;
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) < 120;
  };

  function renderProject(doc, opts) {
    const scenes = (doc.scenes || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    return { title: doc.title || doc.name || '무제', contentType: doc.contentType, pages: scenes.map((s) => renderScene(s, opts)) };
  }

  /* Tile Render 플랜 — GPU/워커 구조 대비(순수 계산) */
  function tilePlan(W, H, tile) {
    tile = tile || 512; const tiles = [];
    for (let y = 0; y < H; y += tile) for (let x = 0; x < W; x += tile)
      tiles.push({ x, y, w: Math.min(tile, W - x), h: Math.min(tile, H - y) });
    return tiles;
  }

  /* ================================================================
     9. Output Adapter — SVG (기준 시리얼라이저)
     ================================================================ */
  function toSVG(dl, o) {
    o = o || {};
    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dl.width} ${dl.height}"${o.size ? ` width="${o.size.w}" height="${o.size.h}"` : ''}>`];
    if (dl.defs.length) parts.push(`<defs>${dl.defs.join('')}</defs>`);
    dl.ops.forEach((op) => {
      const st = op.style || {};
      const attr = (k, v) => (v != null && v !== '' ? ` ${k}="${escX(v)}"` : '');
      const common = attr('opacity', st.opacity !== 1 ? st.opacity : null) + attr('transform', st.transform) + attr('filter', st.filter) + (st['mix-blend-mode'] ? ` style="mix-blend-mode:${st['mix-blend-mode']}"` : '');
      if (op.op === 'shape') {
        parts.push(`<path d="${op.d}"${attr('fill', st.fill)}${attr('stroke', st.stroke)}${attr('stroke-width', st['stroke-width'])}${common}/>`);
      } else if (op.op === 'image') {
        const f = op.frame;
        if (op.src) {                                  /* R37 — 실이미지 출력 */
          const rr = op.radius ? Math.min(op.radius, Math.min(f.w, f.h) / 2) : 0;
          const cid = 'ci' + Math.random().toString(36).slice(2, 8);
          /* R106 — 연속 초점: nar(원본 종횡비)를 알면 <image>를 실좌표(cover 넘침 수학)로
             놓는다 — CSS object-position 과 같은 그림. 모르면 종전 9칸 정렬 폴백(바이트 동일). */
          const cr = (op.fit !== 'contain' && window.MK_FOCAL && window.MK_FOCAL.coverRect)
            ? window.MK_FOCAL.coverRect(f, op.nar, op.focal) : null;
          const geo = cr
            ? `x="${R2(cr.x)}" y="${R2(cr.y)}" width="${R2(cr.w)}" height="${R2(cr.h)}" preserveAspectRatio="none"`
            : `x="${R2(f.x)}" y="${R2(f.y)}" width="${R2(f.w)}" height="${R2(f.h)}" preserveAspectRatio="${window.MK_FOCAL ? window.MK_FOCAL.svgPre(op.fit, op.focal) : (op.fit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice')}"`;
          /* R106 — crop·mask 클립 실배선: R45 유산 clipPath(op.clip)가 defs 에만 있고
             실이미지에 안 걸리던 갭 — 화면(clip-path:inset)과 같은 그림이 되도록 g 에 씌운다 */
          parts.push(`<g${common}${op.clip ? ` clip-path="url(#${op.clip})"` : ''}><clipPath id="${cid}"><rect x="${R2(f.x)}" y="${R2(f.y)}" width="${R2(f.w)}" height="${R2(f.h)}" rx="${R2(rr)}"/></clipPath>` +
            `<image href="${escX(op.src)}" ${geo} clip-path="url(#${cid})"${op.cssFilter ? ` style="filter:${escX(op.cssFilter)}"` : ''}/></g>`);
          return;
        }
        parts.push(`<g${op.clip ? ` clip-path="url(#${op.clip})"` : ''}${common}>` +
          `<path d="${VEC.rect(f.x, f.y, f.w, f.h, 10)}" fill="${escX(st.fill)}"${op.cssFilter ? ` style="filter:${escX(op.cssFilter)}"` : ''}/>` +
          (op.label ? `<text x="${R2(f.x + f.w / 2)}" y="${R2(f.y + f.h / 2)}" text-anchor="middle" dominant-baseline="middle" fill="#8895A5" font-size="${R2(Math.min(f.h * 0.16, 15))}" font-family="Pretendard, sans-serif">${escX(op.label)}</text>` : '') + `</g>`);
      } else if (op.op === 'text') {
        const f = op.frame;
        const anchor = op.align === 'center' ? 'middle' : op.align === 'right' ? 'end' : 'start';
        const tx = op.align === 'center' ? f.x + f.w / 2 : op.align === 'right' ? f.x + f.w : f.x;
        const lineH = op.size * op.lineHeight;
        /* R56 — 배경 pill: 실측 textW + em 패딩(BG_PAD 규약) */
        if (op.bg && op.bg.color) {
          const px2 = op.size * 0.5, py2 = op.size * 0.22;
          const bw = Math.min((op.textW || f.w) + px2 * 2, f.w + px2 * 2);
          const bx = op.align === 'center' ? f.x + f.w / 2 - bw / 2 : op.align === 'right' ? f.x + f.w - bw + px2 : f.x - px2;
          const bh = op.lines.length * lineH + py2 * 2 - (lineH - op.size);
          parts.push(`<rect x="${R2(bx)}" y="${R2(f.y - py2)}" width="${R2(bw)}" height="${R2(Math.max(bh, op.size + py2 * 2))}" rx="${R2((op.bg.radius || 0) * op.size)}" fill="${escX(op.bg.color)}"/>`);
        }
        let fdef = '';
        if (op.shadow && op.shadow.color) {
          const fid = 'tsh' + parts.length; /* toSVG 로컬 — 인라인 defs (SVG는 위치 무관) */
          parts.push(`<defs><filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${R2((op.shadow.x || 0) * op.size)}" dy="${R2((op.shadow.y || 0) * op.size)}" stdDeviation="${R2((op.shadow.blur || 0) * op.size / 2)}" flood-color="${escX(op.shadow.color)}"/></filter></defs>`);
          fdef = ` filter="url(#${fid})"`;
        }
        const stroke = op.outline && op.outline.color ? ` stroke="${escX(op.outline.color)}" stroke-width="${R2((op.outline.w || 0.05) * op.size * 2)}" paint-order="stroke fill"` : '';
        const spans = op.lines.map((l, i) => `<tspan x="${R2(tx)}" y="${R2(f.y + op.size * 0.9 + i * lineH)}">${escX(l)}</tspan>`).join('');
        parts.push(`<text text-anchor="${anchor}" font-family="${escX(op.font.stack)}" font-size="${op.size}" font-weight="${op.weight}"${op.letterSpacing ? ` letter-spacing="${op.letterSpacing}"` : ''} fill="${escX(st.fill)}"${stroke}${fdef}${common}>${spans}</text>`);
      }
    });
    parts.push('</svg>');
    return parts.join('');
  }

  /* ================================================================
     10. HTML Adapter — Interactive · Responsive · CSS/JS 내장 단일 파일
     ================================================================ */
  function toHTML(pages, o) {
    o = o || {};
    const svgs = pages.map((dl) => toSVG(dl));
    const nav = o.interactive !== false && pages.length > 1;
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>${escX(o.title || 'K-MAKER Export')}</title><meta name="description" content="K-MAKER로 제작된 문서">` +
      `<style>body{margin:0;background:#141A22;font-family:Pretendard,'Noto Sans KR',sans-serif;display:flex;flex-direction:column;align-items:center;gap:20px;padding:28px}` +
      `.pg{width:min(94vw,1080px);box-shadow:0 12px 40px rgba(0,0,0,.4);border-radius:10px;overflow:hidden}svg{display:block;width:100%;height:auto}` +
      `${nav ? '.pg{display:none}.pg.on{display:block}.bar{color:#B9C4D0;display:flex;gap:14px;align-items:center}button{background:#26303C;color:#E7EDF3;border:0;border-radius:8px;padding:8px 16px;font-size:14px;cursor:pointer}' : ''}</style></head><body>` +
      (nav ? `<div class="bar"><button id="pv">◀ 이전</button><span id="ct">1 / ${pages.length}</span><button id="nx">다음 ▶</button></div>` : '') +
      svgs.map((s, i) => `<div class="pg${!nav || i === 0 ? ' on' : ''}" data-pg="${i}">${s}</div>`).join('') +
      (nav ? `<script>let i=0,N=${pages.length};const go=d=>{i=(i+d+N)%N;document.querySelectorAll('.pg').forEach((p,k)=>p.classList.toggle('on',k===i));document.getElementById('ct').textContent=(i+1)+' / '+N};document.getElementById('pv').onclick=()=>go(-1);document.getElementById('nx').onclick=()=>go(1);document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});</script>` : '') +
      `</body></html>`;
  }

  /* ================================================================
     11. PNG / JPG Adapter — 브라우저: SVG→canvas 실래스터.
         jsdom: 결정론 래스터 플랜 반환(스케일·타일·투명도)
     ================================================================ */
  function toRaster(dl, o) {
    o = o || {};
    const scale = clamp(o.scale || 1, 1, 4);
    const plan = {
      format: o.format || 'png', scale,
      width: Math.round(dl.width * scale), height: Math.round(dl.height * scale),
      transparent: !!o.transparent && (o.format || 'png') === 'png',
      quality: o.format === 'jpg' ? clamp(o.quality || 0.92, 0.1, 1) : null,
      tiles: tilePlan(dl.width * scale, dl.height * scale, 1024).length,
    };
    if (typeof document === 'undefined' || !document.createElement('canvas').getContext || o.planOnly) return { plan, svg: toSVG(dl) };
    /* R56 — 텍스트 충실도: SVG-in-Image는 페이지 웹폰트를 못 쓴다 →
       텍스트 op는 SVG에서 빼고 canvas 2D로 직접 그린다(document.fonts 실적용).
       배경 pill·외곽선·그림자·자간까지 DOM과 동률. 폰트 로드 전이면 기존 경로 폴백. */
    const fontsReady = typeof document.fonts !== 'undefined';
    const textOps = fontsReady ? dl.ops.filter((op2) => op2.op === 'text') : [];
    const dlDraw = textOps.length ? { ...dl, ops: dl.ops.filter((op2) => op2.op !== 'text') } : dl;
    const drawTextOps = (cx, S) => {
      textOps.forEach((op2) => {
        const f = op2.frame, size = op2.size * S, lineH = op2.size * op2.lineHeight * S;
        const tx0 = op2.align === 'center' ? (f.x + f.w / 2) * S : op2.align === 'right' ? (f.x + f.w) * S : f.x * S;
        cx.save();
        cx.font = `${op2.weight || 400} ${size}px ${op2.font.stack}`;
        cx.textAlign = op2.align === 'center' ? 'center' : op2.align === 'right' ? 'right' : 'left';
        cx.textBaseline = 'alphabetic';
        try { cx.letterSpacing = (op2.letterSpacing || 0) * S + 'px'; } catch (_) {}
        if (op2.bg && op2.bg.color) {
          const px2 = size * 0.5, py2 = size * 0.22;
          /* R115 — 폭 정본은 op.textW 하나다. 종전엔 여기만 cx.measureText 로
             브라우저 실측을 썼다 — 같은 배경 pill 을 SVG 는 모델 폭으로,
             PNG·MP4 는 실측 폭으로 그렸다는 뜻이다. 같은 문서가 형식에 따라
             달라지는 건 export 안의 자기모순이라, 재는 자리를 하나로 모은다.
             (실측을 버리는 대신 모델이 실폰트 값을 쓰게 됐다 — 오차 9.7~34.2% → 0 수준) */
          const tw = op2.textW != null ? op2.textW * S : Math.max(...op2.lines.map((l) => cx.measureText(l).width), 0);
          const bw = Math.min(tw + px2 * 2, f.w * S + px2 * 2);
          const bx = op2.align === 'center' ? tx0 - bw / 2 : op2.align === 'right' ? tx0 - bw + px2 : tx0 - px2;
          const bh = Math.max(op2.lines.length * lineH + py2 * 2 - (lineH - size), size + py2 * 2);
          cx.fillStyle = op2.bg.color;
          const r2 = (op2.bg.radius || 0) * size;
          if (cx.roundRect) { cx.beginPath(); cx.roundRect(bx, f.y * S - py2, bw, bh, r2); cx.fill(); }
          else cx.fillRect(bx, f.y * S - py2, bw, bh);
        }
        if (op2.shadow && op2.shadow.color) {
          cx.shadowColor = op2.shadow.color;
          cx.shadowOffsetX = (op2.shadow.x || 0) * size; cx.shadowOffsetY = (op2.shadow.y || 0) * size;
          cx.shadowBlur = (op2.shadow.blur || 0) * size;
        }
        op2.lines.forEach((line, i) => {
          const ty = (f.y + op2.size * 0.9) * S + i * lineH;
          if (op2.outline && op2.outline.color) {
            cx.strokeStyle = op2.outline.color;
            cx.lineWidth = (op2.outline.w || 0.05) * size * 2;
            cx.lineJoin = 'round';
            cx.strokeText(line, tx0, ty);
          }
          cx.fillStyle = (op2.style && op2.style.fill) || '#1F2733';
          cx.fillText(line, tx0, ty);
        });
        cx.restore();
      });
    };
    return new Promise((resolve) => {
      const svg = toSVG(dlDraw, { size: { w: plan.width, h: plan.height } });
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas'); cv.width = plan.width; cv.height = plan.height;
        const cx = cv.getContext('2d');
        if (!plan.transparent) { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); }
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        if (textOps.length) drawTextOps(cx, plan.width / dl.width);
        resolve({ plan, dataUrl: cv.toDataURL(plan.format === 'jpg' ? 'image/jpeg' : 'image/png', plan.quality || undefined) });
      };
      img.onerror = () => resolve({ plan, svg, error: 'raster-failed' });
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }

  /* ================================================================
     12. PDF Adapter — 자체 벡터 라이터(외부 라이브러리 없음)
     · 도형: PDF path op(re/m/l/f) 벡터 그대로
     · 라틴 텍스트: Helvetica(WinAnsi) 벡터 텍스트
     · 한글: CID 폰트 임베드 미탑재(정직) → 브라우저 raster 모드에서
       JPEG XObject(DCTDecode) 전면 폴백, 순수 모드는 라틴만 + 경고
     · Print: A4/A3·Bleed·Crop Mark·CMYK 옵션(단순 변환 플래그)
     ================================================================ */
  const pdfEsc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const hexRGB = (c) => {
    if (typeof c !== 'string' || c[0] !== '#') return [0.12, 0.15, 0.2];
    const n = parseInt(c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  };
  const rgb2cmyk = ([r, g, b]) => { const k = 1 - Math.max(r, g, b); const d = 1 - k || 1; return [(1 - r - k) / d, (1 - g - k) / d, (1 - b - k) / d, k].map((v) => R2(v)); };

  function toPDF(pages, o) {
    o = o || {};
    const bleed = (o.bleed || 0) * 2.834646; /* mm → pt */
    const objs = []; const addObj = (body) => { objs.push(body); return objs.length; };
    const pageRefs = [];
    const warnAll = [];

    const fontObj = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const fontBObj = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

    pages.forEach((dl) => {
      const S = 595.28 / dl.width * (o.paper === 'a3' ? Math.SQRT2 : 1); /* A4 폭 기준 스케일 */
      const PW = dl.width * S + bleed * 2, PH = dl.height * S + bleed * 2;
      const px = (v) => R2(v * S + bleed), py = (v) => R2(PH - (v * S + bleed));
      const cmds = [];
      const setFill = (c) => {
        if (o.cmyk) { const k = rgb2cmyk(hexRGB(c)); cmds.push(`${k.join(' ')} k`); }
        else { const [r, g, b] = hexRGB(c); cmds.push(`${R2(r)} ${R2(g)} ${R2(b)} rg`); }
      };
      dl.ops.forEach((op) => {
        const f = op.frame;
        if (op.op === 'shape' || op.op === 'image') {
          const fill = (op.style && op.style.fill) || '#E6ECF2';
          if (typeof fill === 'string' && fill.startsWith('url(')) { warnAll.push({ code: 'unsupported-effect', msg: 'PDF 그라디언트 → 첫 색상 근사' }); setFill('#DDE6EE'); }
          else if (fill === 'none') return;
          else setFill(fill);
          cmds.push(`${px(f.x)} ${py(f.y + f.h)} ${R2(f.w * S)} ${R2(f.h * S)} re f`);
        } else if (op.op === 'text') {
          const latin = op.lines.every((l) => /^[\x20-\x7E]*$/.test(l));
          if (!latin) { warnAll.push({ code: 'missing-font', msg: `한글 텍스트 벡터 임베드 미탑재 — "${op.lines[0].slice(0, 10)}…" (브라우저 래스터 모드 사용 권장)` }); }
          setFill((op.style && op.style.fill) || '#1F2733');
          const size = R2(op.size * S);
          op.lines.forEach((line, i) => {
            const safe = latin ? line : line.replace(/[^\x20-\x7E]/g, '');
            if (!safe.trim()) return;
            const tx = op.align === 'center' ? px(f.x + f.w / 2) - size * safe.length * 0.27 : px(f.x);
            cmds.push(`BT /${op.weight >= 600 ? 'FB' : 'F1'} ${size} Tf ${tx} ${py(f.y + op.size * 0.9 + i * op.size * op.lineHeight)} Td (${pdfEsc(safe)}) Tj ET`);
          });
        }
      });
      /* Crop mark — bleed 있을 때 4모서리 */
      if (o.cropMarks && bleed) {
        cmds.push('0 0 0 RG 0.5 w');
        const m = bleed, L = 14;
        [[m, PH - m, 1, 0], [PW - m, PH - m, -1, 0], [m, m, 1, 0], [PW - m, m, -1, 0]].forEach(([x, y, sx]) => {
          cmds.push(`${R2(x - sx * L - 4 * sx)} ${R2(y)} m ${R2(x - 4 * sx)} ${R2(y)} l S`);
          cmds.push(`${R2(x)} ${R2(y > PH / 2 ? y + 4 : y - 4)} m ${R2(x)} ${R2(y > PH / 2 ? y + 4 + L : y - 4 - L)} l S`);
        });
      }
      const stream = cmds.join('\n');
      const cObj = addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      const pObj = addObj(`<< /Type /Page /Parent PAGES_REF /MediaBox [0 0 ${R2(PW)} ${R2(PH)}]${bleed ? ` /TrimBox [${R2(bleed)} ${R2(bleed)} ${R2(PW - bleed)} ${R2(PH - bleed)}]` : ''} /Contents ${cObj} 0 R /Resources << /Font << /F1 ${fontObj} 0 R /FB ${fontBObj} 0 R >> >> >>`);
      pageRefs.push(pObj);
    });

    const pagesObj = addObj(`<< /Type /Pages /Kids [${pageRefs.map((r) => r + ' 0 R').join(' ')}] /Count ${pageRefs.length} >>`);
    const catObj = addObj(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

    let out = '%PDF-1.4\n'; const offs = [0];
    objs.forEach((body, i) => {
      offs.push(out.length);
      out += `${i + 1} 0 obj\n${body.replace(/PAGES_REF/g, pagesObj + ' 0 R')}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
      offs.slice(1).map((of) => String(of).padStart(10, '0') + ' 00000 n \n').join('') +
      `trailer\n<< /Size ${objs.length + 1} /Root ${catObj} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return { bytes: out, pages: pageRefs.length, warnings: warnAll, vector: true, cmyk: !!o.cmyk };
  }

  /* ================================================================
     12b. PDF Raster Adapter (R40) — 한글 실출력
     · 장면을 JPEG로 실래스터한 뒤 DCTDecode XObject 전면 배치
       → 폰트 임베드 없이도 편집한 그대로(한글 포함) 인쇄용 PDF
     · jpegSize = SOF 마커 스캔 순수 파서(치수 자동 판독)
     · 벡터 텍스트(CID 폰트 임베드)는 여전히 미탑재(정직) — toPDF 몫
     ================================================================ */
  function jpegSize(u8) { /* SOFn(C0~CF, C4/C8/CC 제외) 스캔 — 순수 */
    if (!u8 || u8.length < 10 || u8[0] !== 0xFF || u8[1] !== 0xD8) return null;
    let i = 2;
    while (i + 9 <= u8.length) {
      if (u8[i] !== 0xFF) { i++; continue; }
      const m = u8[i + 1];
      if (m === 0xFF) { i++; continue; }
      if (m === 0x01 || (m >= 0xD0 && m <= 0xD9)) { i += 2; continue; } /* 독립 마커 */
      const len = (u8[i + 2] << 8) | u8[i + 3];
      if (len < 2) return null;
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        if (i + 9 > u8.length) return null;
        return { h: (u8[i + 5] << 8) | u8[i + 6], w: (u8[i + 7] << 8) | u8[i + 8], progressive: m === 0xC2 };
      }
      i += 2 + len;
    }
    return null;
  }
  const binStr = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + 8192, u8.length))); return s; };

  function toPDFRaster(images, o) { /* images: [{bin:Uint8Array(JPEG), w?, h?}] */
    o = o || {};
    const objs = []; const addObj = (body) => { objs.push(body); return objs.length; };
    const pageRefs = []; const warnAll = [];
    (images || []).forEach((im, idx) => {
      const size = (im && im.w > 0 && im.h > 0) ? { w: im.w, h: im.h } : jpegSize(im && im.bin);
      if (!im || !im.bin || !size || !size.w || !size.h) { warnAll.push({ code: 'bad-jpeg', msg: `페이지 ${idx + 1} JPEG 판독 실패 — 건너뜀` }); return; }
      const S = 595.28 / size.w; /* A4 폭 기준 — 장면 비율 그대로 */
      const PW = R2(size.w * S), PH = R2(size.h * S);
      const xObj = addObj(`<< /Type /XObject /Subtype /Image /Width ${size.w} /Height ${size.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bin.length} >>\nstream\n${binStr(im.bin)}\nendstream`);
      const stream = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
      const cObj = addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      const pObj = addObj(`<< /Type /Page /Parent PAGES_REF /MediaBox [0 0 ${PW} ${PH}] /Contents ${cObj} 0 R /Resources << /XObject << /Im0 ${xObj} 0 R >> >> >>`);
      pageRefs.push(pObj);
    });
    const pagesObj = addObj(`<< /Type /Pages /Kids [${pageRefs.map((r) => r + ' 0 R').join(' ')}] /Count ${pageRefs.length} >>`);
    const catObj = addObj(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);
    let out = '%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n'; const offs = [0]; /* 바이너리 힌트 주석 — 뷰어 호환 */
    objs.forEach((body, i) => {
      offs.push(out.length);
      out += `${i + 1} 0 obj\n${body.replace(/PAGES_REF/g, pagesObj + ' 0 R')}\nendobj\n`;
    });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
      offs.slice(1).map((of) => String(of).padStart(10, '0') + ' 00000 n \n').join('') +
      `trailer\n<< /Size ${objs.length + 1} /Root ${catObj} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return { bytes: out, pages: pageRefs.length, warnings: warnAll, raster: true };
  }

  /* ================================================================
     13. PPTX Adapter — 자체 ZIP(STORE)+OOXML 라이터. 실제 열리는 .pptx
     · 도형(prstGeom rect/ellipse) · 텍스트(txBody 멀티라인 run) ·
       그룹/테마/마스터 최소 구성 · 이미지 = 라벨 도형 폴백(정직)
     ================================================================ */
  const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (buf) => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const utf8 = (s) => { if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s); const a = []; for (const ch of s) { const c = ch.codePointAt(0); if (c < 128) a.push(c); else if (c < 2048) a.push(192 | c >> 6, 128 | c & 63); else if (c < 65536) a.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63); else a.push(240 | c >> 18, 128 | c >> 12 & 63, 128 | c >> 6 & 63, 128 | c & 63); } return new Uint8Array(a); };

  function zipStore(entries) { /* entries: [{name, text}] 또는 [{name, bin:Uint8Array}] — 무압축 ZIP */
    const chunks = []; const central = []; let offset = 0;
    const u16 = (n) => [n & 255, n >> 8 & 255];
    const u32 = (n) => [n & 255, n >> 8 & 255, n >> 16 & 255, n >>> 24 & 255];
    entries.forEach((e) => {
      const name = utf8(e.name), data = e.bin || utf8(e.text), crc = crc32(data);
      const local = new Uint8Array([0x50, 0x4B, 3, 4, ...u16(20), ...u16(0x800), ...u16(0), ...u16(0x21), ...u16(0x54), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)]);
      chunks.push(local, name, data);
      central.push(new Uint8Array([0x50, 0x4B, 1, 2, ...u16(20), ...u16(20), ...u16(0x800), ...u16(0), ...u16(0x21), ...u16(0x54), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name);
      offset += local.length + name.length + data.length;
    });
    let cdSize = 0; central.forEach((c) => cdSize += c.length);
    const end = new Uint8Array([0x50, 0x4B, 5, 6, 0, 0, 0, 0, ...u16(entries.length), ...u16(entries.length), ...u32(cdSize), ...u32(offset), 0, 0]);
    const total = offset + cdSize + end.length;
    const out = new Uint8Array(total); let p = 0;
    chunks.concat(central, [end]).forEach((c) => { out.set(c, p); p += c.length; });
    return out;
  }

  /* dataURL → {ext, bin} — R38 이미지 실임베드용 (자체 base64 디코더, atob 무의존) */
  const B64C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  function dataUrlBytes(src) {
    const m = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=\s]+)$/.exec(String(src || ''));
    if (!m) return null;
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const b = m[2].replace(/[=\s]/g, '');
    const out = new Uint8Array(Math.floor(b.length * 3 / 4));
    let o = 0;
    for (let i = 0; i + 1 < b.length; i += 4) {
      const n = (B64C.indexOf(b[i]) << 18) | (B64C.indexOf(b[i + 1]) << 12) |
        ((B64C.indexOf(b[i + 2]) & 63) << 6) | (B64C.indexOf(b[i + 3]) & 63);
      out[o++] = n >> 16 & 255;
      if (i + 2 < b.length) out[o++] = n >> 8 & 255;
      if (i + 3 < b.length) out[o++] = n & 255;
    }
    return { ext, bin: out.subarray(0, o), mime: ext === 'jpg' ? 'image/jpeg' : 'image/' + ext };
  }

  const EMU = 914400; /* per inch */
  function toPPTX(pages, o) {
    o = o || {};
    const first = pages[0] || { width: 1280, height: 720 };
    const CX = Math.round(first.width / 96 * EMU), CY = Math.round(first.height / 96 * EMU);
    const emuX = (px, dl) => Math.round(px / dl.width * CX), emuY = (px, dl) => Math.round(px / dl.height * CY);
    const hex6 = (c) => (typeof c === 'string' && c[0] === '#' ? (c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1)).toUpperCase() : '1F2733');
    const warnAll = [];
    let shapeId = 1;
    const media = [];                            /* R38 — 실이미지 실임베드: {name, bin, mime} */

    const slideXml = (dl, imgRels) => {
      const sps = [];
      dl.ops.forEach((op) => {
        const f = op.frame; const id = ++shapeId;
        const xfrm = `<a:xfrm><a:off x="${emuX(f.x, dl)}" y="${emuY(f.y, dl)}"/><a:ext cx="${Math.max(1, emuX(f.w, dl))}" cy="${Math.max(1, emuY(f.h, dl))}"/></a:xfrm>`;
        if (op.op === 'image' && op.src) {        /* R38 — dataURL 이미지 = 진짜 그림으로 */
          const db = dataUrlBytes(op.src);
          if (db) {
            const mName = `image${media.length + 1}.${db.ext}`;
            media.push({ name: mName, bin: db.bin, mime: db.mime });
            const rId = 'rIdImg' + (imgRels.length + 2);
            imgRels.push({ rId, target: '../media/' + mName });
            sps.push(`<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="p${id}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr>${xfrm}<a:prstGeom prst="${op.radius ? 'roundRect' : 'rect'}"><a:avLst/></a:prstGeom></p:spPr></p:pic>`);
            return;
          }
          warnAll.push({ code: 'unsupported-effect', msg: '이미지 원본 해석 불가 — 라벨 도형 폴백' });
        }
        if (op.op === 'shape' || op.op === 'image') {
          const fill = (op.style && op.style.fill) || '#E6ECF2';
          if (typeof fill === 'string' && fill.startsWith('url(')) warnAll.push({ code: 'unsupported-effect', msg: 'PPTX 그라디언트 → 단색 근사' });
          if (fill === 'none' && !op.label) return;
          const geom = op.op === 'image' ? 'roundRect' : (op.d && op.d.includes('A') ? 'ellipse' : 'rect');
          if (op.op === 'image') warnAll.push({ code: 'unsupported-effect', msg: `이미지 "${op.label || op.asset && op.asset.name || ''}" — 라벨 도형 폴백` });
          sps.push(`<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="s${id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm}<a:prstGeom prst="${geom}"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${hex6(fill.startsWith && fill.startsWith('url(') ? '#DDE6EE' : fill)}"/></a:solidFill></p:spPr>` +
            (op.label ? `<p:txBody><a:bodyPr anchor="ctr"/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="ko-KR" sz="1100"><a:solidFill><a:srgbClr val="8895A5"/></a:solidFill></a:rPr><a:t>${escX(op.label)}</a:t></a:r></a:p></p:txBody>` : '<p:txBody><a:bodyPr/><a:p/></p:txBody>') + `</p:sp>`);
        } else if (op.op === 'text') {
          if (op.bg || op.outline || op.shadow) warnAll.push({ code: 'unsupported-effect', msg: '텍스트 배경·외곽선·그림자 — PPTX 미지원(글꼴·색·정렬만 반영, 정직 표기)' }); /* R56 */
          const sz = Math.round(op.size * 0.75 * 100); /* px→pt→OOXML */
          const algn = op.align === 'center' ? 'ctr' : op.align === 'right' ? 'r' : 'l';
          const paras = op.lines.map((l) => `<a:p><a:pPr algn="${algn}"/><a:r><a:rPr lang="ko-KR" sz="${sz}" b="${op.weight >= 600 ? 1 : 0}"><a:solidFill><a:srgbClr val="${hex6((op.style && op.style.fill) || '#1F2733')}"/></a:solidFill><a:latin typeface="${escX(op.font.family)}"/></a:rPr><a:t>${escX(l)}</a:t></a:r></a:p>`).join('');
          sps.push(`<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="t${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr>${xfrm}<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"><a:noAutofit/></a:bodyPr>${paras}</p:txBody></p:sp>`);
        }
      });
      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>${sps.join('')}</p:spTree></p:cSld></p:sld>`;
    };

    const N = pages.length;
    const entries = [
      { name: '[Content_Types].xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${pages.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('')}</Types>` },
      { name: '_rels/.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>` },
      { name: 'ppt/presentation.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rIdM"/></p:sldMasterIdLst><p:sldIdLst>${pages.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`).join('')}</p:sldIdLst><p:sldSz cx="${CX}" cy="${CY}"/></p:presentation>` },
      { name: 'ppt/_rels/presentation.xml.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${pages.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join('')}<Relationship Id="rIdM" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/></Relationships>` },
      { name: 'ppt/slideMasters/slideMaster1.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>` },
      { name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>` },
      { name: 'ppt/slideLayouts/slideLayout1.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld></p:sldLayout>` },
      { name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>` },
      { name: 'ppt/theme/theme1.xml', text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="KMAKER"><a:themeElements><a:clrScheme name="KMAKER"><a:dk1><a:srgbClr val="1F2733"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="26303C"/></a:dk2><a:lt2><a:srgbClr val="F5F7FA"/></a:lt2><a:accent1><a:srgbClr val="2E8C7F"/></a:accent1><a:accent2><a:srgbClr val="E8735A"/></a:accent2><a:accent3><a:srgbClr val="5B7FDB"/></a:accent3><a:accent4><a:srgbClr val="F0B429"/></a:accent4><a:accent5><a:srgbClr val="8895A5"/></a:accent5><a:accent6><a:srgbClr val="B072D6"/></a:accent6><a:hlink><a:srgbClr val="2E8C7F"/></a:hlink><a:folHlink><a:srgbClr val="8895A5"/></a:folHlink></a:clrScheme><a:fontScheme name="KMAKER"><a:majorFont><a:latin typeface="Pretendard"/><a:ea typeface="Pretendard"/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Pretendard"/><a:ea typeface="Pretendard"/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>` },
    ];
    const slideRels = [];
    pages.forEach((dl, i) => {
      const imgRels = [];
      entries.push({ name: `ppt/slides/slide${i + 1}.xml`, text: slideXml(dl, imgRels) });
      slideRels.push(imgRels);
    });
    pages.forEach((_, i) => entries.push({ name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>${slideRels[i].map((r) => `<Relationship Id="${r.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${r.target}"/>`).join('')}</Relationships>` }));
    if (media.length) {                          /* R38 — 미디어 실엔트리 + 콘텐츠 타입 등재 */
      media.forEach((m) => entries.push({ name: 'ppt/media/' + m.name, bin: m.bin }));
      const exts = [...new Set(media.map((m) => m.name.split('.').pop()))];
      entries[0].text = entries[0].text.replace('<Default Extension="rels"',
        exts.map((x) => `<Default Extension="${x}" ContentType="${x === 'jpg' ? 'image/jpeg' : 'image/' + x}"/>`).join('') + '<Default Extension="rels"');
    }

    return { bytes: zipStore(entries), slides: N, media: media.length, entries: entries.map((e) => e.name), warnings: warnAll };
  }

  /* ================================================================
     14. Video Adapter — 타임라인 프레임 플랜(결정론).
     실인코딩(MP4/WebM)은 브라우저 MediaRecorder·GIF는 캡처 파이프라인
     연동 전용(정직 표기). 여기서는 프레임 상태를 완전 산출한다.
     ================================================================ */
  function toVideoPlan(pages, o) {
    o = o || {};
    const fps = o.fps === 60 ? 60 : 30;
    const frames = [];
    let t = 0;
    pages.forEach((dl, si) => {
      const dur = dl.timeline.duration || 4;
      const n = Math.round(dur * fps);
      for (let i = 0; i < n; i++) {
        frames.push({ t: R2(t + i / fps), scene: si, local: R2(i / fps) });
      }
      t += dur;
    });
    return { fps, container: o.container || 'webm', total: frames.length, duration: R2(t), frames: o.full ? frames : frames.slice(0, 12), note: '실인코딩은 브라우저 MediaRecorder/캡처 파이프라인 — 이 플랜이 프레임 기준' };
  }

  /* ================================================================
     15. Export Preset — 목적별 완성 옵션 세트
     ================================================================ */
  const PRESETS = [
    { key: 'presentation', name: '프레젠테이션', desc: '수업·발표용 PPTX', format: 'pptx', opts: {} },
    { key: 'print-a4', name: 'A4 인쇄', desc: '가정통신문·학습지 (재단 3mm)', format: 'pdf', opts: { paper: 'a4', bleed: 3, cropMarks: true } },
    { key: 'print-a3', name: 'A3 포스터', desc: '게시판 부착용 대형 인쇄', format: 'pdf', opts: { paper: 'a3', bleed: 3, cropMarks: true, cmyk: true } },
    { key: 'instagram', name: '인스타그램', desc: '1:1 피드 PNG 2x', format: 'png', opts: { scale: 2 } },
    { key: 'story', name: '스토리', desc: '9:16 세로 PNG 2x', format: 'png', opts: { scale: 2 } },
    { key: 'youtube', name: '유튜브 썸네일', desc: '1280×720 JPG 고품질', format: 'jpg', opts: { scale: 1, quality: 0.95 } },
    { key: 'thumbnail', name: '썸네일', desc: '목록용 경량 PNG', format: 'png', opts: { scale: 1 } },
    { key: 'web', name: '웹 페이지', desc: '인터랙티브 반응형 HTML', format: 'html', opts: { interactive: true } },
    { key: 'video', name: '영상', desc: '30fps WebM(브라우저)', format: 'video', opts: { fps: 30 } },
  ];

  /* ================================================================
     16. Adapter Registry — 신규 포맷은 여기 등록 하나로 동작
     ================================================================ */
  const ADAPTERS = {};
  function registerAdapter(fmt, fn) { ADAPTERS[fmt] = fn; }
  registerAdapter('svg', (pages, o) => ({ files: pages.map((dl, i) => ({ name: `scene-${i + 1}.svg`, text: toSVG(dl, o) })) }));
  registerAdapter('html', (pages, o) => ({ files: [{ name: 'export.html', text: toHTML(pages, o) }] }));
  registerAdapter('json', (pages, o) => ({ files: [{ name: 'export.json', text: JSON.stringify({ engine: 'MK_RENDER v1', pages }, null, o && o.pretty ? 2 : 0) }] }));
  registerAdapter('png', (pages, o) => ({ raster: pages.map((dl) => toRaster(dl, { ...o, format: 'png' })) }));
  registerAdapter('jpg', (pages, o) => ({ raster: pages.map((dl) => toRaster(dl, { ...o, format: 'jpg' })) }));
  registerAdapter('pdf', (pages, o) => { const r = toPDF(pages, o); return { files: [{ name: 'export.pdf', bytes: r.bytes }], meta: r }; });
  registerAdapter('pptx', (pages, o) => { const r = toPPTX(pages, o); return { files: [{ name: 'export.pptx', bin: r.bytes }], meta: r }; });
  registerAdapter('video', (pages, o) => ({ plan: toVideoPlan(pages, o) }));

  /* ================================================================
     17. Export Queue — 진행률·취소·재시도·우선순위·배치
     ================================================================ */
  const Q = { jobs: [], seq: 0, listeners: [] };
  const emit = () => Q.listeners.forEach((f) => { try { f(Q.jobs); } catch (e) {} });

  function enqueue(spec) {
    const job = { id: 'job-' + (++Q.seq), format: spec.format, presetKey: spec.presetKey || null, title: spec.title || '내보내기', priority: spec.priority || 5, status: 'queued', progress: 0, result: null, error: null, warnings: [], scenes: spec.scenes, opts: spec.opts || {}, at: Date.now() };
    Q.jobs.push(job);
    Q.jobs.sort((a, b) => b.priority - a.priority || a.at - b.at);
    emit();
    return job.id;
  }
  function step(jobId, chunk) { /* 결정론 단계 실행 — UI가 반복 호출 */
    const job = Q.jobs.find((j) => j.id === jobId);
    if (!job || job.status === 'cancelled' || job.status === 'done' || job.status === 'error') return job;
    job.status = 'running';
    job.progress = clamp(job.progress + (chunk || 34), 0, 100);
    if (job.progress >= 100) {
      try {
        const adapter = ADAPTERS[job.format];
        if (!adapter) throw new Error('어댑터 없음: ' + job.format);
        const pages = job.scenes.map((s) => renderScene(s, job.opts.renderOpts));
        job.warnings = pages.flatMap((p) => p.warnings);
        job.result = adapter(pages, job.opts);
        if (job.result.meta && job.result.meta.warnings) job.warnings = job.warnings.concat(job.result.meta.warnings);
        job.status = 'done'; job.progress = 100;
      } catch (e) { job.status = 'error'; job.error = String(e.message || e); }
    }
    emit();
    return job;
  }
  function runAll() { let guard = 400; while (guard-- && Q.jobs.some((j) => j.status === 'queued' || j.status === 'running')) { const j = Q.jobs.find((x) => x.status === 'queued' || x.status === 'running'); step(j.id, 50); } return Q.jobs; }
  function cancel(jobId) { const j = Q.jobs.find((x) => x.id === jobId); if (j && j.status !== 'done') { j.status = 'cancelled'; emit(); } return j; }
  function retry(jobId) { const j = Q.jobs.find((x) => x.id === jobId); if (j && (j.status === 'error' || j.status === 'cancelled')) { j.status = 'queued'; j.progress = 0; j.error = null; emit(); } return j; }
  function batch(docs, format, opts) { return docs.map((d) => enqueue({ format, title: d.title || d.name, scenes: d.scenes || [d], opts })); }

  /* ================================================================
     18. 공개 API
     ================================================================ */
  return {
    /* 파이프라인 */
    renderScene, renderProject, sceneHash, tilePlan,
    /* 서브엔진(테스트·확장용) */
    wrap, measure, layoutText, textLines, listPrefixed, frameOf,   /* R111 — 줄수 정본·프레임 (MK_LIVE 가 빌려 쓰고 하니스가 검사한다) */
    layoutOf,                                                      /* R113 — 화면이 export 에게 배치를 묻는 창구 (workspace·editor·미니 공용) */
    lsOf,                                                          /* R114 — 자간 읽기 정본 (letterSpacing 우선, tracking 은 옛 이름) */
    metricsOf,                                                     /* R115 — 글꼴별 문자폭 실측표 (폭 읽기 정본) */
    resolveFont, resolveAsset, VEC, buildTimeline, sampleTrack,
    /* 어댑터 */
    toSVG, toHTML, toPDF, toPDFRaster, jpegSize, dataUrlBytes, toPPTX, toRaster, toVideoPlan, registerAdapter, ADAPTERS,
    /* 프리셋·큐 */
    PRESETS, enqueue, step, runAll, cancel, retry, batch,
    queue: () => Q.jobs.map((j) => ({ ...j })), onQueue: (f) => Q.listeners.push(f), clearQueue: () => { Q.jobs = []; emit(); },
    /* 캐시 */
    cache: CACHE,
  };
})();
