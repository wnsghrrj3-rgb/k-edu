/* ============================================================
   K-MAKER AI Canvas Assistant — Round 12
   ------------------------------------------------------------
   ⚠ LLM API 미연결. 자연어 → 규칙 파서 → Action Engine.
   "채팅"이 아니라 "편집기"다. 모든 명령은 실제 doc을 변형한다.

   구조
   · MK_HIST  — 스냅샷 기반 Undo/Redo/History (AI·수동 편집 공용)
   · MK_AIED  — Canvas Context · Command Parser · Action Registry · run()

   Action 계약
     fn(doc, ctx, args) → { msg } | { msg, reselect } | null(실패)
     · doc 을 직접 변형한다. 스냅샷·리렌더는 run() 이 책임진다.
     · 실패(적용 대상 없음)는 null 을 던지지 않고 { err } 로 알린다.
   ============================================================ */

/* ============================================================
   1) History — 스냅샷 스택
   ============================================================ */
window.MK_HIST = (() => {
  const LIMIT = 50;
  let past = [], future = [];

  const ed = () => window.PG.state.editor;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const shot = (label) => ({ label, at: Date.now(), doc: clone(ed().doc), sceneIdx: ed().sceneIdx, selEl: ed().selEl });
  const restore = (s) => { const e = ed(); e.doc = clone(s.doc); e.sceneIdx = Math.min(s.sceneIdx, e.doc.scenes.length - 1); e.selEl = s.selEl; };

  /* 변경 직전에 호출 — 되돌릴 지점을 기록한다 */
  function push(label) {
    if (!ed().doc) return;
    past.push(shot(label));
    if (past.length > LIMIT) past.shift();
    future = [];
  }
  function undo() {
    if (!past.length) return null;
    const cur = shot(past[past.length - 1].label);
    const s = past.pop();
    future.push(cur);
    restore(s);
    return s.label;
  }
  function redo() {
    if (!future.length) return null;
    const s = future.pop();
    past.push(shot(s.label));
    restore(s);
    return s.label;
  }
  const canUndo = () => past.length > 0;
  const canRedo = () => future.length > 0;
  const list = () => past.map((s) => s.label).slice(-12).reverse();
  const reset = () => { past = []; future = []; };
  const depth = () => ({ past: past.length, future: future.length });

  return { push, undo, redo, canUndo, canRedo, list, reset, depth };
})();

/* ============================================================
   2) AI Canvas Assistant
   ============================================================ */
window.MK_AIED = (() => {
  const ed = () => window.PG.state.editor;
  const SEC = () => window.MK_SEC;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- STEP 1. Canvas Context ---------- */
  const PAL_KEYS = () => Object.keys(SEC().PALETTES);

  /* 팔레트 판정 — 명시 id 우선, 없으면 씬 배경 지문으로 역추적 */
  function paletteId(doc) {
    if (doc && doc.paletteId && SEC().PALETTES[doc.paletteId]) return doc.paletteId;
    if (!doc || !doc.scenes) return 'pl-ink';
    const bgs = new Set(doc.scenes.map((s) => String(s.background || '').toLowerCase()));
    const hit = Object.keys(SEC().PALETTES).find((k) => {
      const P = SEC().PALETTES[k];
      return bgs.has(P.dark.toLowerCase()) && (bgs.has(P.light.toLowerCase()) || bgs.has(P.soft.toLowerCase()));
    }) || Object.keys(SEC().PALETTES).find((k) => bgs.has(SEC().PALETTES[k].dark.toLowerCase()));
    return hit || 'pl-ink';
  }
  function paletteOf(doc) { return SEC().PALETTES[paletteId(doc)]; }

  function context() {
    const e = ed();
    if (!e || !e.doc) return null;
    const doc = e.doc;
    const scene = doc.scenes[e.sceneIdx] || doc.scenes[0];
    const els = scene.elements || [];
    const sel = e.selEl != null ? els[e.selEl] : null;
    const P = paletteOf(doc);
    const dark = SEC().isDark(scene.background);
    const texts = els.filter((x) => x.kind === 'text');
    const heading = texts.slice().sort((a, b) => b.size - a.size)[0] || null;
    return {
      project: doc.title || '제목 없음',
      templateId: doc.templateId || '(임시)',
      sceneId: scene.id, sceneName: scene.name, sceneIdx: e.sceneIdx, sceneCount: doc.scenes.length,
      selectedIdx: e.selEl, selected: sel, selectedKind: sel ? sel.kind : null,
      theme: { paletteId: paletteId(doc), paletteName: P.name, dark, background: scene.background, accent: P.accent, accent2: P.accent2 },
      brand: (() => { const b = window.MK_BRAND && MK_BRAND.of(doc); return b ? { id: b.id, name: b.name } : null; })(),
      typography: { font: doc.fontFamily || '기본 (Pretendard)', headingSize: heading ? heading.size : null, count: texts.length },
      colors: [...new Set(els.map((x) => x.color || x.fill).filter(Boolean))].slice(0, 8),
      layer: els.map((x, i) => ({ i, kind: x.kind, name: x.kind === 'text' ? String(x.text).split('\n')[0].slice(0, 18) : (x.label || (x.kind === 'chart' ? '차트' : x.kind === 'table' ? '표' : '도형')) })),
      assets: els.filter((x) => x.kind === 'image' && !x.fill).length,
      text: texts.length, images: els.filter((x) => x.kind === 'image').length,
      chart: els.filter((x) => x.kind === 'chart').length, table: els.filter((x) => x.kind === 'table').length,
      duration: doc.scenes.reduce((a, s) => a + (s.duration || 5), 0),
      palette: P,
    };
  }

  /* ---------- 공통 유틸 ---------- */
  const textEls = (scene) => scene.elements.filter((x) => x.kind === 'text');
  const headingOf = (scene) => textEls(scene).slice().sort((a, b) => b.size - a.size)[0] || null;
  const targetEl = (scene, ctx, kinds) => {
    if (ctx.selected && (!kinds || kinds.includes(ctx.selected.kind))) return ctx.selected;
    if (kinds && kinds.includes('text')) return headingOf(scene);
    if (kinds && kinds.includes('image')) return scene.elements.find((x) => x.kind === 'image' && !x.fill) || null;
    return null;
  };
  const curScene = (doc, ctx) => doc.scenes[ctx.sceneIdx];

  /* 씬 배경을 팔레트 기준 명/암으로 강제 */
  function setSceneTheme(scene, P, dark) { scene.background = dark ? P.dark : P.light; }

  /* 팔레트 전면 교체 — 배경·강조색·텍스트 컬러를 역할 단위로 재매핑 */
  function applyPalette(doc, toId) {
    const from = paletteOf(doc), to = SEC().PALETTES[toId];
    if (!to) return false;
    const map = {};
    ['dark', 'light', 'soft', 'accent', 'accent2', 'mutedOnDark', 'mutedOnLight'].forEach((k) => { map[from[k].toLowerCase()] = to[k]; });
    doc.scenes.forEach((s) => {
      const bg = String(s.background || '').toLowerCase();
      s.background = map[bg] || (SEC().isDark(s.background) ? to.dark : s.background);
      s.elements.forEach((el) => {
        if (el.color && map[el.color.toLowerCase()]) el.color = map[el.color.toLowerCase()];
        if (el.fill && map[String(el.fill).toLowerCase()]) el.fill = map[String(el.fill).toLowerCase()];
        if (el.kind === 'chart') el.accent = to.accent;
      });
    });
    doc.paletteId = toId;
    return true;
  }

  /* ---------- 한국어 어미 변환 — 종성/음성조화 계산 ---------- */
  const jung = (ch) => { const c = ch.charCodeAt(0) - 0xAC00; return (c < 0 || c > 11171) ? -1 : Math.floor(c / 28) % 21; };
  /* 격식(-습니다) → 친근(-아요/-어요/-해요) */
  function polite(str) {
    return String(str)
      .replace(/하습니다|합니다/g, '해요')
      .replace(/([가-힣])습니다/g, (m, ch) => ch + ([0, 8].includes(jung(ch)) ? '아요' : '어요'))
      .replace(/입니다/g, '이에요').replace(/됩니다/g, '돼요').replace(/십시오/g, '세요')
      .replace(/습니까/g, '나요');
  }
  /* 친근(-요) → 격식(-습니다) */
  function formal(str) {
    return String(str)
      .replace(/해요/g, '합니다').replace(/이에요|예요/g, '입니다').replace(/돼요/g, '됩니다').replace(/세요/g, '십시오')
      .replace(/([가-힣])아요/g, '$1습니다').replace(/([가-힣])어요/g, '$1습니다');
  }

  /* ---------- STEP 5. Rewrite 사전 ---------- */
  const TONES = {
    short: { name: '짧게', head: (x) => x.split(/[\n.·—]/)[0].trim().slice(0, 18), body: (x) => x.split(/[\n.]/)[0].trim().slice(0, 40) },
    long: { name: '길게', head: (x) => x, body: (x) => x.includes('구체적인 근거') ? x : x + '\n구체적인 근거와 사례를 덧붙여 설명합니다.' },
    pro: { name: '전문적으로', head: (x) => x.replace(/요$/, ''), body: (x) => formal(x).includes('별첨') ? formal(x) : formal(x) + ' 관련 지표는 별첨에 정리했습니다.' },
    friendly: { name: '친근하게', head: (x) => polite(x), body: (x) => polite(x) },
    investor: { name: '투자자용', head: (x) => x, body: (x) => x.startsWith('시장 기회') ? x : '시장 기회 관점에서 정리하면, ' + formal(x) },
    student: { name: '학생용', head: (x) => polite(x), body: (x) => polite(x).replace(/및/g, '그리고').replace(/따라서/g, '그래서') },
    corp: { name: '기업용', head: (x) => formal(x), body: (x) => formal(x) },
  };

  function rewriteScene(scene, tone) {
    const T = TONES[tone]; if (!T) return 0;
    const ts = textEls(scene); if (!ts.length) return 0;
    const head = headingOf(scene);
    let n = 0;
    ts.forEach((el) => {
      const before = el.text;
      el.text = (el === head ? T.head(String(el.text)) : T.body(String(el.text)));
      if (el.text !== before) n++;
    });
    return n;
  }

  /* ---------- STEP 4. Scene 생성기 ---------- */
  const GEN = {
    faq: { sec: 'faq', theme: 'light', props: { title: '자주 묻는 질문', items: [{ q: '도입에 얼마나 걸리나요?', a: '평균 2주면 실사용까지 도달합니다.' }, { q: '기존 자료를 옮길 수 있나요?', a: '기존 파일을 그대로 불러와 편집할 수 있습니다.' }, { q: '비용은 어떻게 되나요?', a: '사용 규모에 맞춘 3단계 요금제를 제공합니다.' }] }, name: 'FAQ' },
    roadmap: { sec: 'timeline', theme: 'light', props: { title: '로드맵', steps: [{ k: 'NOW', title: '기반', desc: '핵심 기능 완성' }, { k: 'Q3', title: '확장', desc: '사용자 확대' }, { k: 'Q4', title: '연동', desc: '외부 연결' }, { k: '2027', title: '규모', desc: '전국 확산' }] }, name: '로드맵' },
    review: { sec: 'quote', theme: 'light', props: { quote: '준비 시간이 절반으로 줄었습니다.\n이제 내용에만 집중합니다.', who: '김선생 · 초등 4학년 담임', role: '현장 사용자 인터뷰' }, name: '고객 후기' },
    cta: { sec: 'cta', theme: 'dark', props: { title: '지금 시작해 보세요', sub: '가입 없이 바로 만들어 볼 수 있습니다', button: '무료로 시작하기' }, name: 'CTA' },
    team: { sec: 'team', theme: 'light', props: { title: '팀', members: [{ name: '이름', role: '역할', desc: '한 줄 소개' }, { name: '이름', role: '역할', desc: '한 줄 소개' }, { name: '이름', role: '역할', desc: '한 줄 소개' }] }, name: '팀' },
    pricing: { sec: 'pricing', theme: 'light', props: { title: '요금제', plans: [{ name: 'Basic', price: '무료', items: ['기본 템플릿', '3개 프로젝트'] }, { name: 'Pro', price: '월 9,900원', items: ['전체 템플릿', '무제한 프로젝트', 'AI 편집'] }, { name: 'School', price: '문의', items: ['학교 단위 계정', '관리자 도구'] }] }, name: '요금제' },
    summary: { sec: 'summary', theme: 'light', props: { title: '요약', items: ['핵심 메시지를 한 줄로', '근거를 한 줄로', '다음 행동을 한 줄로'] }, name: '요약' },
    blank: null,
  };

  function makeScene(doc, key, ctx) {
    const P = paletteOf(doc);
    const def = GEN[key];
    if (!def) {
      return { id: 'ai' + Date.now(), name: '새 장면', width: 1280, height: 720, duration: 5, background: P.light, transition: 'fade', order: 0,
        elements: [SEC().t(8, 38, 84, 8, '제목을 입력하세요', 700), SEC().t(8, 56, 60, 3.2, '내용을 입력하세요', 400, P.mutedOnLight)] };
    }
    let built;
    try { built = SEC().buildSection(def.sec, P, def.props, { theme: def.theme }); }
    catch (err) { return null; }
    return { id: 'ai' + Date.now(), name: def.name, width: 1280, height: 720, duration: 5, background: built.bg, transition: 'fade', order: 0, elements: built.els };
  }

  /* ---------- STEP 7. Chart / Table ---------- */
  const DEMO_SERIES = [{ k: '1분기', v: 32 }, { k: '2분기', v: 41 }, { k: '3분기', v: 56 }, { k: '4분기', v: 78 }];

  const mkChart = (P, type, series, title) => ({ kind: 'chart', x: 10, y: 28, w: 80, h: 54, chartType: type, title: title || '데이터', accent: P.accent, series: clone(series || DEMO_SERIES) });
  const mkTable = (P, series, title) => ({ kind: 'table', x: 10, y: 28, w: 80, h: 46, title: title || '데이터', cols: ['구분', '값'], rows: (series || DEMO_SERIES).map((d) => [d.k, String(d.v)]) });

  const seriesFromTable = (tb) => tb.rows.map((r) => ({ k: r[0], v: parseFloat(String(r[1]).replace(/[^0-9.\-]/g, '')) || 0 }));

  /* ============================================================
     3) Action Registry
     ============================================================ */
  const A = {};

  /* ---- STEP 2. Selection AI ---- */
  A['text.premium'] = (doc, ctx) => {
    const s = curScene(doc, ctx), el = targetEl(s, ctx, ['text']);
    if (!el) return { err: '텍스트 요소가 없어요. 캔버스에서 글자를 선택해 주세요.' };
    el.weight = 700; el.size = +(el.size * 1.14).toFixed(2); el.tracking = -0.02; el.color = ctx.palette.accent;
    return { msg: `"${String(el.text).split('\n')[0].slice(0, 12)}" 를 고급 톤으로 — 굵기 700 · 크기 ${el.size} · 자간 좁힘 · 강조색 적용` };
  };
  A['el.bigger'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx), el = ctx.selected || headingOf(s);
    if (!el) return { err: '대상이 없어요.' };
    const r = args.ratio || 1.25;
    if (el.kind === 'text') el.size = +clamp(el.size * r, 1.5, 26).toFixed(2);
    else { el.w = +clamp(el.w * r, 5, 92).toFixed(1); if (el.h) el.h = +clamp(el.h * r, 5, 92).toFixed(1); }
    return { msg: `${el.kind === 'text' ? '텍스트' : '요소'} 크기 ${r > 1 ? '확대' : '축소'} (×${r})` };
  };
  A['scene.dark'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx);
    setSceneTheme(s, ctx.palette, args.dark !== false);
    s.elements.forEach((el) => { if (el.kind === 'text' && el.color && [ctx.palette.mutedOnDark, ctx.palette.mutedOnLight].includes(el.color)) el.color = args.dark !== false ? ctx.palette.mutedOnDark : ctx.palette.mutedOnLight; });
    return { msg: `배경을 ${args.dark !== false ? '어둡게' : '밝게'} — ${s.background}` };
  };
  A['align'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx);
    const map = { left: '왼쪽', center: '가운데', right: '오른쪽' };
    const ts = ctx.selected && ctx.selected.kind === 'text' ? [ctx.selected] : textEls(s);
    if (!ts.length) return { err: '정렬할 텍스트가 없어요.' };
    ts.forEach((el) => {
      el.align = args.align;
      if (args.align === 'center') { el.x = +((100 - el.w) / 2).toFixed(1); }
      else if (args.align === 'right') { el.x = +(92 - el.w).toFixed(1); }
      else el.x = 8;
    });
    return { msg: `${ts.length}개 텍스트 ${map[args.align]} 정렬` };
  };
  A['distribute'] = (doc, ctx) => {
    const s = curScene(doc, ctx);
    const imgs = s.elements.filter((el) => el.kind === 'image' && el.w > 8);
    if (imgs.length < 2) return { err: '정렬할 카드/이미지가 2개 이상 필요해요.' };
    const n = imgs.length, gap = 3, total = 84, w = +((total - gap * (n - 1)) / n).toFixed(1);
    const y = Math.round(imgs.reduce((a, e) => a + e.y, 0) / n);
    imgs.forEach((el, i) => { el.w = w; el.x = +(8 + i * (w + gap)).toFixed(1); el.y = y; });
    return { msg: `${n}개 요소 균등 배분 — 폭 ${w}% · 간격 ${gap}% · 상단 정렬` };
  };
  A['spacing'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx), r = args.more === false ? 0.92 : 1.08;
    s.elements.forEach((el) => {
      el.x = +clamp(50 + (el.x + (el.w || 0) / 2 - 50) * (args.more === false ? 1.05 : 0.94) - (el.w || 0) / 2, 2, 96).toFixed(1);
      el.y = +clamp(50 + (el.y - 50) * (args.more === false ? 1.05 : 0.94), 2, 94).toFixed(1);
      if (el.kind === 'text') el.size = +clamp(el.size * (args.more === false ? 1.04 : 0.96), 1.5, 24).toFixed(2);
    });
    return { msg: `여백 ${args.more === false ? '축소' : '확대'} — 콘텐츠 블록을 안쪽으로 ${args.more === false ? '펼침' : '모음'}` };
  };
  A['title.shorten'] = (doc, ctx) => {
    const s = curScene(doc, ctx), el = targetEl(s, ctx, ['text']);
    if (!el) return { err: '제목이 없어요.' };
    const before = String(el.text);
    el.text = before.split('\n')[0].split(/[·—]/)[0].trim().slice(0, 14);
    return { msg: `제목 축약 — "${before.slice(0, 16)}" → "${el.text}"` };
  };
  A['color.unify'] = (doc, ctx) => {
    const s = curScene(doc, ctx), P = ctx.palette, dark = SEC().isDark(s.background);
    let n = 0;
    s.elements.forEach((el) => {
      if (el.kind !== 'text') return;
      const strong = (el.weight || 400) >= 600;
      el.color = strong ? (dark ? P.light : P.dark) : (dark ? P.mutedOnDark : P.mutedOnLight);
      n++;
    });
    const h = headingOf(s); if (h) h.color = P.accent;
    return { msg: `색상 통일 — ${n}개 텍스트를 ${P.name} 역할 컬러로 재배정(제목만 강조색)` };
  };
  A['minimal'] = (doc, ctx) => {
    const s = curScene(doc, ctx);
    const before = s.elements.length;
    const keep = [];
    const ts = textEls(s).slice().sort((a, b) => b.size - a.size);
    if (ts[0]) keep.push(ts[0]);
    if (ts[1]) keep.push(ts[1]);
    s.elements.filter((el) => el.kind !== 'text' && (el.kind !== 'image' || el.w > 20)).slice(0, 1).forEach((el) => keep.push(el));
    s.elements = keep;
    keep.forEach((el, i) => { el.x = 8; el.y = 26 + i * 18; if (el.kind === 'text') el.align = 'left'; });
    return { msg: `미니멀 재구성 — 요소 ${before} → ${keep.length}개, 좌측 정렬 수직 리듬` };
  };

  /* ---- STEP 3. Project AI ---- */
  A['project.tone'] = (doc, ctx, args) => {
    const tone = args.tone || 'pro';
    let n = 0;
    doc.scenes.forEach((s) => { n += rewriteScene(s, tone); });
    if (args.premium) { doc.scenes.forEach((s) => { const h = headingOf(s); if (h) { h.weight = 700; h.tracking = -0.02; } }); }
    return { msg: `프로젝트 전체 ${TONES[tone].name} 톤 — ${doc.scenes.length}씬 · 텍스트 ${n}건 수정` };
  };
  A['project.scenes'] = (doc, ctx, args) => {
    const n = args.n;
    if (!n || n < 1) return { err: '몇 장으로 맞출지 알려 주세요. 예) 슬라이드를 8장으로 줄여' };
    const cur = doc.scenes.length;
    if (n === cur) return { err: `이미 ${n}장이에요.` };
    if (n < cur) {
      /* 표지·엔딩은 보존, 중간을 뒤에서부터 덜어냄 */
      const keep = doc.scenes.slice();
      while (keep.length > n) keep.splice(Math.max(1, keep.length - 2), 1);
      doc.scenes = keep;
    } else {
      while (doc.scenes.length < n) {
        const src = doc.scenes[Math.max(0, doc.scenes.length - 2)];
        const c = clone(src); c.id = 'ai' + Date.now() + doc.scenes.length; c.name = '추가 장면';
        doc.scenes.splice(doc.scenes.length - 1, 0, c);
      }
    }
    doc.scenes.forEach((s, i) => { s.order = i; });
    return { msg: `슬라이드 ${cur} → ${doc.scenes.length}장 (표지·마지막 장 보존)`, reselect: 0 };
  };
  A['project.duration'] = (doc, ctx, args) => {
    const target = args.minutes * 60;
    const cur = doc.scenes.reduce((a, s) => a + (s.duration || 5), 0);
    const r = target / cur;
    doc.scenes.forEach((s) => { s.duration = Math.max(2, Math.round((s.duration || 5) * r)); });
    const after = doc.scenes.reduce((a, s) => a + s.duration, 0);
    return { msg: `발표 길이 ${Math.round(cur / 60 * 10) / 10}분 → ${Math.round(after / 60 * 10) / 10}분 (씬별 비율 유지)` };
  };

  /* ---- STEP 4. Generate ---- */
  A['scene.add'] = (doc, ctx, args) => {
    const sc = makeScene(doc, args.kind || 'blank', ctx);
    if (!sc) return { err: '그 유형은 아직 섹션 부품이 없어요.' };
    const at = clamp(ctx.sceneIdx + 1, 1, doc.scenes.length);
    doc.scenes.splice(at, 0, sc);
    doc.scenes.forEach((s, i) => { s.order = i; });
    window.PG.state.editor.sceneIdx = at;
    return { msg: `"${sc.name}" 장면 생성 — ${at + 1}번째에 삽입 (요소 ${sc.elements.length}개)`, reselect: null };
  };
  A['scene.del'] = (doc, ctx) => {
    if (doc.scenes.length <= 1) return { err: '마지막 한 장은 지울 수 없어요.' };
    const name = doc.scenes[ctx.sceneIdx].name;
    doc.scenes.splice(ctx.sceneIdx, 1);
    doc.scenes.forEach((s, i) => { s.order = i; });
    window.PG.state.editor.sceneIdx = clamp(ctx.sceneIdx, 0, doc.scenes.length - 1);
    return { msg: `"${name}" 삭제 — 남은 ${doc.scenes.length}장`, reselect: null };
  };
  A['scene.dup'] = (doc, ctx) => {
    const c = clone(doc.scenes[ctx.sceneIdx]); c.id = 'ai' + Date.now(); c.name += ' 복제';
    doc.scenes.splice(ctx.sceneIdx + 1, 0, c);
    window.PG.state.editor.sceneIdx = ctx.sceneIdx + 1;
    return { msg: `"${c.name}" 생성`, reselect: null };
  };

  /* ---- STEP 5. Rewrite ---- */
  A['rewrite'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx);
    if (ctx.selected && ctx.selected.kind === 'text') {
      const T = TONES[args.tone], before = String(ctx.selected.text);
      ctx.selected.text = (ctx.selected === headingOf(s) ? T.head(before) : T.body(before));
      return { msg: `선택 텍스트 ${T.name} — "${before.slice(0, 14)}" → "${String(ctx.selected.text).slice(0, 22)}"` };
    }
    const n = rewriteScene(s, args.tone);
    if (!n) return { msg: `이미 ${TONES[args.tone].name} 톤이에요 — 바꿀 문장이 없었어요.`, noop: true };
    return { msg: `이 장면 ${TONES[args.tone].name} — 텍스트 ${n}건 수정` };
  };

  /* ---- STEP 6. Image ---- */
  const PH_KEYS = ['a', 'b', 'c', 'd'];
  A['img.swap'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx), el = targetEl(s, ctx, ['image']);
    if (!el) return { err: '이미지 요소가 없어요.' };
    const k = args.key || PH_KEYS[(PH_KEYS.indexOf(el._ph || 'a') + 1) % 4];
    el._ph = k; el.fill = SEC().PH[k]; el.label = '';
    return { msg: `이미지 교체 — 톤 ${k.toUpperCase()} (추천 4종 중 순환)` };
  };
  A['img.crop'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx), el = targetEl(s, ctx, ['image']);
    if (!el) return { err: '이미지 요소가 없어요.' };
    const R = { square: [1, 1], wide: [16, 9], portrait: [4, 5], circle: [1, 1] };
    const [rw, rh] = R[args.crop] || R.square;
    /* 캔버스 16:9 기준 — % 좌표계 보정 */
    const target = (rh / rw) * (1280 / 720);
    el.h = +clamp(el.w * target, 6, 84).toFixed(1);
    el.radius = args.crop === 'circle' ? 999 : (el.radius || 0);
    return { msg: `${args.crop === 'circle' ? '원형' : args.crop === 'wide' ? '16:9' : args.crop === 'portrait' ? '4:5' : '정방형'} 비율 적용 — ${el.w}% × ${el.h}%` };
  };
  A['img.bgremove'] = (doc, ctx) => {
    const s = curScene(doc, ctx), el = targetEl(s, ctx, ['image']);
    if (!el) return { err: '이미지 요소가 없어요.' };
    el.cutout = true; el.fill = 'none'; el.label = el.label || '누끼 적용됨';
    return { msg: '배경 제거(누끼) 적용 — 피사체만 남김. 실제 세그멘테이션은 엔진 이식 후 연결' };
  };
  A['img.recommend'] = (doc, ctx) => {
    const list = PH_KEYS.map((k, i) => `${i + 1}) 톤 ${k.toUpperCase()}`).join(' · ');
    return { msg: `이 장면 톤(${ctx.theme.paletteName})에 맞는 이미지 4종 — ${list}. "이미지 교체"로 순환 적용돼요.`, noop: true };
  };

  /* ---- STEP 7. Chart ---- */
  A['chart.insert'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx);
    s.elements.push(mkChart(ctx.palette, args.type || 'bar', null, '데이터로 보는 변화'));
    return { msg: `${args.type || 'bar'} 차트 삽입 — 4개 계열 샘플 데이터`, reselect: s.elements.length - 1 };
  };
  A['chart.type'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx);
    const ch = (ctx.selected && ctx.selected.kind === 'chart') ? ctx.selected : s.elements.find((el) => el.kind === 'chart');
    if (!ch) return A['chart.insert'](doc, ctx, args);
    const before = ch.chartType;
    ch.chartType = args.type;
    return { msg: `차트 유형 ${before} → ${args.type}` };
  };
  A['table.toChart'] = (doc, ctx, args) => {
    const s = curScene(doc, ctx);
    const tb = (ctx.selected && ctx.selected.kind === 'table') ? ctx.selected : s.elements.find((el) => el.kind === 'table');
    if (!tb) return { err: '변환할 표가 없어요. "표 추가" 후 다시 시도해 주세요.' };
    const i = s.elements.indexOf(tb);
    const ch = mkChart(ctx.palette, args.type || 'bar', seriesFromTable(tb), tb.title);
    ch.x = tb.x; ch.y = tb.y; ch.w = tb.w; ch.h = Math.max(tb.h, 44);
    s.elements[i] = ch;
    return { msg: `표 → ${ch.chartType} 차트 변환 (${ch.series.length}행)`, reselect: i };
  };
  A['chart.toTable'] = (doc, ctx) => {
    const s = curScene(doc, ctx);
    const ch = (ctx.selected && ctx.selected.kind === 'chart') ? ctx.selected : s.elements.find((el) => el.kind === 'chart');
    if (!ch) return { err: '변환할 차트가 없어요.' };
    const i = s.elements.indexOf(ch);
    const tb = mkTable(ctx.palette, ch.series, ch.title);
    tb.x = ch.x; tb.y = ch.y; tb.w = ch.w;
    s.elements[i] = tb;
    return { msg: `차트 → 표 변환 (${tb.rows.length}행)`, reselect: i };
  };
  A['table.insert'] = (doc, ctx) => {
    const s = curScene(doc, ctx);
    s.elements.push(mkTable(ctx.palette, null, '데이터 표'));
    return { msg: '표 삽입 — 2열 4행 샘플', reselect: s.elements.length - 1 };
  };

  /* ---- STEP 8. Theme ---- */
  A['theme.palette'] = (doc, ctx, args) => {
    const id = args.paletteId;
    if (!SEC().PALETTES[id]) return { err: `팔레트를 못 찾았어요. 사용 가능: ${PAL_KEYS().map((k) => SEC().PALETTES[k].name).join(' · ')}` };
    const before = ctx.theme.paletteName;
    applyPalette(doc, id);
    return { msg: `테마 ${before} → ${SEC().PALETTES[id].name} — 전 ${doc.scenes.length}씬 배경·강조·텍스트 재매핑` };
  };
  A['theme.accent'] = (doc, ctx, args) => {
    const from = ctx.palette.accent.toLowerCase(), to = args.hex;
    let n = 0;
    doc.scenes.forEach((s) => s.elements.forEach((el) => {
      if (el.color && el.color.toLowerCase() === from) { el.color = to; n++; }
      if (el.fill && String(el.fill).toLowerCase() === from) { el.fill = to; n++; }
      if (el.kind === 'chart') { el.accent = to; n++; }
    }));
    doc.accentOverride = to;
    return { msg: `강조색 ${ctx.palette.accent} → ${to} (${n}곳 반영)` };
  };
  A['theme.darkmode'] = (doc, ctx, args) => {
    const on = args.on !== false, P = ctx.palette;
    doc.scenes.forEach((s) => {
      const wasDark = SEC().isDark(s.background);
      if (on === wasDark) return;
      s.background = on ? P.dark : P.light;
      s.elements.forEach((el) => {
        if (el.kind !== 'text') return;
        const strong = (el.weight || 400) >= 600;
        if (el.color === P.accent || el.color === P.accent2) return;
        el.color = strong ? (on ? P.light : P.dark) : (on ? P.mutedOnDark : P.mutedOnLight);
      });
    });
    return { msg: `${on ? '다크' : '라이트'} 모드 — 전 씬 배경·텍스트 대비 재조정` };
  };
  A['theme.font'] = (doc, ctx, args) => {
    doc.fontFamily = args.font;
    return { msg: `폰트 ${args.font} 적용 — 캔버스 전체` };
  };
  A['theme.brand'] = (doc, ctx) => A['brand.apply'](doc, ctx, { brandId: 'br-kmaker' });
  /* ---------- Round 13: Brand System ---------- */
  A['brand.apply'] = (doc, ctx, args) => {
    const BR = window.MK_BRAND; if (!BR) return { err: '브랜드 시스템이 로드되지 않았어요' };
    const id = args && args.brandId, b = BR.get(id);
    if (!b) return { err: '해당 브랜드를 찾지 못했어요 — Brand 화면에서 목록을 확인해 주세요' };
    BR.apply(doc, id);
    return { msg: `브랜드 「${b.name}」 적용 — 색·폰트·컴포넌트·차트가 브랜드 토큰으로 치환됐어요` };
  };
  A['brand.validate'] = (doc, ctx, args) => {
    const BR = window.MK_BRAND; if (!BR) return { err: '브랜드 시스템이 로드되지 않았어요' };
    const r = BR.validate(doc);
    if (!r.brand) return { err: '문서에 브랜드가 지정되지 않았어요 — "우리 회사 스타일로" 등으로 먼저 적용해 주세요' };
    if (r.ok) return { msg: `브랜드 「${r.brand}」 규칙 위반 없음 — 색·폰트·차트·대비 모두 통과`, noop: true };
    if (args && args.fix) {
      const n = BR.fix(doc);
      const after = BR.validate(doc);
      return { msg: `위반 ${n}건을 브랜드 토큰으로 되돌렸어요${after.ok ? ' — 이제 전부 통과' : ` (남은 ${after.violations.length}건은 수동 확인 필요)`}` };
    }
    const top = r.violations.slice(0, 3).map((v) => `${v.type}: ${v.detail}`).join(' / ');
    return { msg: `위반 ${r.violations.length}건 — ${top}${r.violations.length > 3 ? ' 외' : ''}. "브랜드 규칙 유지"라고 하면 자동으로 되돌려요`, noop: true };
  };
  A['style.apple'] = (doc, ctx) => {
    const P = ctx.palette;
    doc.fontFamily = 'Pretendard';
    doc.scenes.forEach((s) => {
      s.elements = s.elements.filter((el) => el.kind !== 'image' || el.w > 15);
      const ts = textEls(s).slice().sort((a, b) => b.size - a.size);
      ts.forEach((el, i) => {
        el.align = 'center';
        el.w = i === 0 ? 76 : 60;
        el.x = +((100 - el.w) / 2).toFixed(1);
        el.y = i === 0 ? 34 : 34 + 16 + (i - 1) * 9;
        el.size = i === 0 ? +clamp(el.size * 1.35, 8, 16).toFixed(2) : +clamp(el.size * 0.92, 2, 6).toFixed(2);
        el.weight = i === 0 ? 700 : 400;
        el.tracking = i === 0 ? -0.03 : 0;
        el.color = i === 0 ? (SEC().isDark(s.background) ? P.light : P.dark) : (SEC().isDark(s.background) ? P.mutedOnDark : P.mutedOnLight);
      });
    });
    return { msg: 'Apple 스타일 — 중앙 정렬 · 초대형 제목 · 여백 최대 · 요소 최소화' };
  };

  /* ============================================================
     4) Command Parser — 자연어 → { action, args }
     ============================================================ */
  const has = (p, ...w) => w.some((x) => p.includes(x));

  function parse(raw) {
    const p = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!p) return null;

    /* 히스토리 */
    if (has(p, '되돌', '실행 취소', '실행취소', 'undo')) return { action: '@undo' };
    if (has(p, '다시 실행', '다시실행', 'redo')) return { action: '@redo' };

    /* Theme — 우선순위 상단(오해 소지 적음) */
    if (has(p, 'apple', '애플')) return { action: 'style.apple' };
    /* ---- Round 13: Brand ---- */
    if (has(p, '브랜드 규칙 유지', '브랜드 유지', '브랜드에 맞게 고쳐', '브랜드로 정리')) return { action: 'brand.validate', args: { fix: true } };
    if (has(p, '브랜드 검사', '브랜드 점검', '브랜드 위반')) return { action: 'brand.validate', args: {} };
    if (has(p, '회사 스타일', '우리 회사', '회사 브랜드')) return { action: 'brand.apply', args: { brandId: has(p, '시그널', 'signal', 'b사', '회사 b', '회사b') ? 'br-signal' : 'br-kmaker' } };
    if (has(p, '학교 스타일', '학교 브랜드', '금성초')) return { action: 'brand.apply', args: { brandId: 'br-school' } };
    if (has(p, '시그널 스타일', '시그널 브랜드', 'signal 스타일')) return { action: 'brand.apply', args: { brandId: 'br-signal' } };
    if (has(p, '퍼스널 브랜드', '개인 브랜드', '내 스타일로')) return { action: 'brand.apply', args: { brandId: 'br-personal' } };
    if (has(p, '브랜드 적용', '브랜드로')) {
      const hit = (window.MK_BRAND ? MK_BRAND.list() : []).find((b) => has(p, b.name.toLowerCase()));
      return { action: 'brand.apply', args: { brandId: hit ? hit.id : (window.MK_BRAND ? MK_BRAND.DEFAULT : 'br-kmaker') } };
    }
    if (has(p, '다크 모드', '다크모드', 'dark mode')) return { action: 'theme.darkmode', args: { on: !has(p, '끄', '해제') } };
    if (has(p, '라이트 모드', '라이트모드')) return { action: 'theme.darkmode', args: { on: false } };
    if (has(p, '브랜드')) {
      const hex = (p.match(/#[0-9a-f]{6}/) || [])[0];
      if (hex) return { action: 'theme.accent', args: { hex } };
      return { action: 'theme.brand' };
    }
    if (has(p, '폰트', 'font')) {
      const f = has(p, 'pretendard', '프리텐다드') ? 'Pretendard' : has(p, 'noto', '노토') ? 'Noto Sans KR' : has(p, 'serif', '명조', '세리프') ? 'Noto Serif KR' : 'Pretendard';
      return { action: 'theme.font', args: { font: f } };
    }
    if (has(p, '강조색', 'accent', '포인트 컬러')) {
      const hex = (p.match(/#[0-9a-f]{6}/) || [])[0];
      if (hex) return { action: 'theme.accent', args: { hex } };
    }
    if (has(p, '테마', '팔레트', 'theme', 'palette')) {
      const names = { 'ink': 'pl-ink', '잉크': 'pl-ink', 'teal': 'pl-ink', 'noir': 'pl-noir', '느와르': 'pl-noir', 'gold': 'pl-noir', '골드': 'pl-noir', 'cobalt': 'pl-cobalt', '코발트': 'pl-cobalt', '블루': 'pl-cobalt', 'forest': 'pl-forest', '포레스트': 'pl-forest', '그린': 'pl-forest', 'signal': 'pl-signal', '시그널': 'pl-signal' };
      const hit = Object.keys(names).find((k) => p.includes(k));
      if (hit) return { action: 'theme.palette', args: { paletteId: names[hit] } };
      return { action: 'theme.palette', args: { paletteId: '' } };
    }

    /* Chart / Table */
    if (has(p, '표를 차트', '표 → 차트', '표를 그래프')) return { action: 'table.toChart', args: { type: has(p, '원형', '파이', 'pie') ? 'pie' : has(p, '라인', '선', 'line') ? 'line' : 'bar' } };
    if (has(p, '차트를 표', '그래프를 표')) return { action: 'chart.toTable' };
    if (has(p, '표 추가', '표를 추가', '테이블 추가')) return { action: 'table.insert' };
    if (has(p, '막대')) return { action: 'chart.type', args: { type: 'bar' } };
    if (has(p, '원형', '파이', 'pie')) return { action: 'chart.type', args: { type: 'pie' } };
    if (has(p, '라인', '선 그래프', 'line')) return { action: 'chart.type', args: { type: 'line' } };
    if (has(p, '차트', '그래프')) return { action: 'chart.insert', args: { type: 'bar' } };

    /* Scene 생성/삭제 */
    if (has(p, '삭제', '지워', '없애')) {
      if (has(p, '페이지', '장면', '슬라이드', '씬', 'scene')) return { action: 'scene.del' };
    }
    if (has(p, '복제')) return { action: 'scene.dup' };
    const GENHIT = [['faq', 'faq', '질문'], ['roadmap', '로드맵', 'roadmap'], ['review', '후기', '리뷰', '인터뷰'], ['cta', 'cta', '행동 유도'],
      ['team', '팀 소개', 'team'], ['pricing', '요금', '가격', 'pricing'], ['summary', '요약 장', '요약 페이지']];
    const gen = GENHIT.find(([, ...kw]) => has(p, ...kw));
    if (gen && !has(p, '삭제', '지워', '빼')) return { action: 'scene.add', args: { kind: gen[0] } };
    if (has(p, '추가', '넣어', '만들어', '하나 더', '한 장 더')) {
      if (has(p, '장면', '슬라이드', '씬', 'scene', '페이지')) return { action: 'scene.add', args: { kind: 'blank' } };
    }

    /* Project */
    const nScene = p.match(/(\d+)\s*(장|페이지|슬라이드)/);
    if (nScene && has(p, '줄여', '늘려', '로', '으로', '맞춰')) return { action: 'project.scenes', args: { n: +nScene[1] } };
    const nMin = p.match(/(\d+)\s*분/);
    if (nMin) return { action: 'project.duration', args: { minutes: +nMin[1] } };
    if (has(p, '프리미엄', '고급스럽')) {
      if (has(p, '전체', '프로젝트', '톤')) return { action: 'project.tone', args: { tone: 'pro', premium: true } };
      return { action: 'text.premium' };
    }
    if (has(p, '투자자')) return { action: has(p, '전체', '프로젝트', '덱', 'deck') ? 'project.tone' : 'rewrite', args: { tone: 'investor' } };

    /* Rewrite */
    if (has(p, '짧게', '줄여 써', '간결')) return { action: 'rewrite', args: { tone: 'short' } };
    if (has(p, '길게', '자세히', '풀어')) return { action: 'rewrite', args: { tone: 'long' } };
    if (has(p, '전문적', '격식')) return { action: 'rewrite', args: { tone: 'pro' } };
    if (has(p, '친근', '부드럽게', '편하게')) return { action: 'rewrite', args: { tone: 'friendly' } };
    if (has(p, '학생용', '학생 수준', '쉽게')) return { action: 'rewrite', args: { tone: 'student' } };
    if (has(p, '기업용', '비즈니스')) return { action: 'rewrite', args: { tone: 'corp' } };

    /* Image */
    if (has(p, '누끼', '배경 제거', '배경제거')) return { action: 'img.bgremove' };
    if (has(p, '이미지 추천', '사진 추천')) return { action: 'img.recommend' };
    if (has(p, '이미지 교체', '사진 교체', '이미지 바꿔', '사진 바꿔')) return { action: 'img.swap' };
    if (has(p, '정방형', '1:1')) return { action: 'img.crop', args: { crop: 'square' } };
    if (has(p, '원형으로', '동그랗')) return { action: 'img.crop', args: { crop: 'circle' } };
    if (has(p, '16:9', '와이드')) return { action: 'img.crop', args: { crop: 'wide' } };
    if (has(p, '4:5', '세로로')) return { action: 'img.crop', args: { crop: 'portrait' } };
    if (has(p, 'crop', '자르기', '비율')) return { action: 'img.crop', args: { crop: 'square' } };

    /* Selection */
    if (has(p, '배경')) {
      if (has(p, '어둡', '검')) return { action: 'scene.dark', args: { dark: true } };
      if (has(p, '밝', '희')) return { action: 'scene.dark', args: { dark: false } };
    }
    if (has(p, '미니멀', '단순하게', '심플')) return { action: 'minimal' };
    if (has(p, '여백')) return { action: 'spacing', args: { more: !has(p, '줄여', '좁혀') } };
    if (has(p, '색상 통일', '색 통일', '컬러 통일')) return { action: 'color.unify' };
    if (has(p, '제목') && has(p, '줄여', '짧')) return { action: 'title.shorten' };
    if (has(p, '가운데 정렬', '중앙 정렬', '가운데로')) return { action: 'align', args: { align: 'center' } };
    if (has(p, '왼쪽 정렬', '좌측 정렬')) return { action: 'align', args: { align: 'left' } };
    if (has(p, '오른쪽 정렬', '우측 정렬')) return { action: 'align', args: { align: 'right' } };
    if (has(p, '정렬', '나란히', '균등')) return { action: 'distribute' };
    if (has(p, '크게', '키워')) return { action: 'el.bigger', args: { ratio: 1.25 } };
    if (has(p, '작게', '줄여')) return { action: 'el.bigger', args: { ratio: 0.8 } };

    return null;
  }

  /* ============================================================
     5) run() — 파싱 → 스냅샷 → 실행 → 결과
     ============================================================ */
  const HINTS = ['이 제목을 더 고급스럽게', '배경을 어둡게', '색상 통일', '여백 늘려', '표를 차트로', '막대그래프로', 'FAQ 페이지 추가', '슬라이드를 8장으로 줄여', '투자자용으로 수정', '다크 모드', '폰트 Pretendard', 'Apple 스타일'];

  function run(raw) {
    const ctx = context();
    if (!ctx) return { ok: false, msg: '편집할 문서가 없어요.' };
    const cmd = parse(raw);
    if (!cmd) return { ok: false, msg: `아직 못 알아듣는 명령이에요. 이렇게 말해 보세요 — ${HINTS.slice(0, 4).map((h) => `"${h}"`).join(' · ')}`, unknown: true };

    if (cmd.action === '@undo') { const l = window.MK_HIST.undo(); return { ok: !!l, msg: l ? `되돌림 — ${l}` : '되돌릴 작업이 없어요.', action: '@undo' }; }
    if (cmd.action === '@redo') { const l = window.MK_HIST.redo(); return { ok: !!l, msg: l ? `다시 실행 — ${l}` : '다시 실행할 작업이 없어요.', action: '@redo' }; }

    const fn = A[cmd.action];
    if (!fn) return { ok: false, msg: '아직 준비되지 않은 동작이에요.', unknown: true };

    const e = ed(), label = String(raw).trim().slice(0, 24);
    window.MK_HIST.push('AI · ' + label);
    let res;
    try { res = fn(e.doc, ctx, cmd.args || {}); }
    catch (err) { window.MK_HIST.undo(); return { ok: false, msg: '적용 중 오류가 났어요: ' + err.message, action: cmd.action }; }

    if (!res || res.err) { window.MK_HIST.undo(); window.MK_HIST.redo && window.MK_HIST.depth(); return { ok: false, msg: (res && res.err) || '적용 대상을 못 찾았어요.', action: cmd.action }; }
    if (res.noop) { window.MK_HIST.undo(); return { ok: true, msg: res.msg, action: cmd.action, noop: true }; }

    if ('reselect' in res) e.selEl = res.reselect;
    else if (e.selEl != null) {
      const sc = e.doc.scenes[e.sceneIdx];
      if (!sc || !sc.elements[e.selEl]) e.selEl = null;
    }
    return { ok: true, msg: res.msg, action: cmd.action };
  }

  return { context, parse, run, paletteId, ACTIONS: A, TONES, GEN, HINTS, applyPalette, mkChart, mkTable, seriesFromTable, paletteOf };
})();
