/* ============================================================
   K-MAKER Section Library v1  —  window.MK_SEC
   ------------------------------------------------------------
   Round 07: Premium Template Library의 공통 부품 계층.
   페이지를 하나씩 그리지 않는다 — Section 빌더를 조합해
   Project Template을 만든다.
   · PALETTES     프리미엄 팔레트 (Pitch/Gamma/Keynote 기준)
   · 빌더 20종    (opts) → elements[] (1280×720 % 좌표)
   · compose()    섹션 배열 → Scene 배열
   · 조립 산출물  tpl-pr-presentation-01 (Presentation 10씬)
                  → MK_SAMPLE.TEMPLATES 등재 (_overlay 동봉)
   요소 스키마: t(text: x,y,w,size,text,weight,color?,align?)
               box(fill 컬러 영역) / img(이미지 영역)
   ============================================================ */
window.MK_SEC = (() => {

  /* ---------- 요소 헬퍼 ---------- */
  const t = (x, y, w, size, text, weight, color, align) => {
    const el = { kind: 'text', x, y, w, size, text, weight: weight || 400 };
    if (color) el.color = color;
    if (align) el.align = align;
    return el;
  };
  const box = (x, y, w, h, fill) => ({ kind: 'image', x, y, w, h, label: '', fill });
  const img = (x, y, w, h, label) => ({ kind: 'image', x, y, w, h, label: label || '' });

  /* ---------- 다크 판정 (렌더 계층 공용) ---------- */
  const isDark = (hex) => {
    if (!hex || hex[0] !== '#') return false;
    const n = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, (c) => c + c) : hex;
    const r = parseInt(n.slice(1, 3), 16), g = parseInt(n.slice(3, 5), 16), b = parseInt(n.slice(5, 7), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.45;
  };

  /* ---------- 프리미엄 팔레트 ---------- */
  const PALETTES = {
    'pl-ink':    { name: 'Ink & Teal',   dark: '#101827', light: '#FFFFFF', soft: '#EEF2F0', accent: '#2E8C7F', accent2: '#E8735A', mutedOnDark: '#8A97A8', mutedOnLight: '#6B7480' },
    'pl-noir':   { name: 'Noir & Gold',  dark: '#14120E', light: '#FBF9F4', soft: '#F1EDE2', accent: '#B99146', accent2: '#D6453A', mutedOnDark: '#9A927F', mutedOnLight: '#79715F' },
    'pl-cobalt': { name: 'Cobalt',       dark: '#0E1B3A', light: '#FFFFFF', soft: '#EBEFF8', accent: '#3B5BDB', accent2: '#E8735A', mutedOnDark: '#8C99BC', mutedOnLight: '#63708F' },
    'pl-forest': { name: 'Forest',       dark: '#12211B', light: '#FCFDFB', soft: '#EAF2EC', accent: '#2F7D4F', accent2: '#C4573F', mutedOnDark: '#8AA394', mutedOnLight: '#5F7266' },
  };

  /* ============================================================
     Section 빌더 — 모든 좌표는 12컬럼 그리드(좌우 여백 8%) 기준
     ============================================================ */

  /* 01 Cover — 다크 표지: 라벨 · 초대형 제목 · 메타 · 포인트 */
  const cover = (P, { label, title, subtitle, meta }) => [
    box(0, 0, 100, 1.1, P.accent),
    t(8, 16, 60, 2.4, label, 700, P.accent),
    t(8, 27, 84, 11, title, 700),
    box(8, 55, 6.5, 0.9, P.accent2),
    t(8, 61, 66, 3.4, subtitle, 400),
    t(8, 86, 60, 2.4, meta, 500, P.mutedOnDark),
  ];

  /* 02 Agenda — 좌 대제목 · 우 번호 리스트 */
  const agenda = (P, { title, items }) => {
    const els = [t(8, 14, 30, 6.5, title, 700), box(8, 30, 5, 0.9, P.accent)];
    items.slice(0, 5).forEach((it, i) => {
      const y = 18 + i * 15;
      els.push(t(46, y, 6, 4.2, String(i + 1).padStart(2, '0'), 700, P.accent));
      els.push(t(55, y + 0.8, 37, 3.2, it, 600));
      els.push(box(46, y + 9.5, 46, 0.28, P.soft));
    });
    return els;
  };

  /* 03 Section Divider — 초대형 번호 + 섹션명 (다크) */
  const sectionDivider = (P, { num, title, sub }) => [
    t(8, 20, 40, 22, num, 700, P.accent),
    box(8, 62, 6.5, 0.9, P.accent2),
    t(8, 68, 76, 6.5, title, 700),
    t(8, 82, 66, 2.8, sub, 400, P.mutedOnDark),
  ];

  /* 04 Content Split — 좌 텍스트 · 우 이미지 */
  const contentSplit = (P, { label, title, body, bullets, imgLabel }) => {
    const els = [
      t(8, 12, 40, 2.2, label, 700, P.accent),
      t(8, 18, 42, 5.5, title, 700),
      t(8, 34, 40, 2.9, body, 400),
    ];
    (bullets || []).slice(0, 3).forEach((b, i) => {
      const y = 54 + i * 10;
      els.push(box(8, y + 1.2, 1.4, 2.5, P.accent));
      els.push(t(11.5, y, 36, 2.7, b, 500));
    });
    els.push(img(56, 14, 36, 72, imgLabel || ''));
    return els;
  };

  /* 05 Gallery — 이미지 3그리드 + 캡션 */
  const gallery = (P, { title, captions }) => {
    const els = [t(8, 11, 50, 5.5, title, 700), box(8, 24, 5, 0.9, P.accent)];
    const W = 27, G = 2.5, X0 = 8;
    (captions || ['', '', '']).slice(0, 3).forEach((c, i) => {
      const x = X0 + i * (W + G);
      els.push(img(x, 32, W, 44, ''));
      els.push(t(x, 80, W, 2.3, c, 500, P.mutedOnLight));
    });
    return els;
  };

  /* 06 Chart — 바 차트(값 라벨·기준선) + 인사이트 */
  const chart = (P, { title, insight, bars }) => {
    const els = [t(8, 11, 60, 5.5, title, 700), t(8, 24, 52, 2.7, insight, 400, P.mutedOnLight)];
    const max = Math.max(...bars.map((b) => b.v));
    const X0 = 12, W = 12, G = 8.5, BASE = 82, HMAX = 40;
    bars.slice(0, 4).forEach((b, i) => {
      const h = Math.max(4, b.v / max * HMAX), x = X0 + i * (W + G);
      els.push(box(x, BASE - h, W, h, i === bars.length - 1 ? P.accent : P.soft));
      els.push(t(x, BASE - h - 5, W, 2.9, String(b.v), 700, i === bars.length - 1 ? P.accent : undefined, 'center'));
      els.push(t(x, BASE + 2.5, W, 2.2, b.k, 500, P.mutedOnLight, 'center'));
    });
    els.push(box(X0 - 1, BASE, (W + G) * 4 - G + 2, 0.32, '#DDE3EB'));
    return els;
  };

  /* 07 Timeline — 가로 라인 + 노드 4개 */
  const timeline = (P, { title, steps }) => {
    const els = [t(8, 11, 60, 5.5, title, 700), box(8, 24, 5, 0.9, P.accent), box(8, 52, 84, 0.4, '#DDE3EB')];
    const N = Math.min(steps.length, 4), span = 84 / N;
    steps.slice(0, 4).forEach((s2, i) => {
      const x = 8 + i * span;
      els.push(box(x, 50.4, 1.8, 3.4, i === 0 ? P.accent2 : P.accent));
      els.push(t(x, 40, span - 4, 2.4, s2.k, 700, P.accent));
      els.push(t(x, 60, span - 4, 2.9, s2.title, 700));
      els.push(t(x, 68, span - 4, 2.3, s2.desc, 400, P.mutedOnLight));
    });
    return els;
  };

  /* 08 Stats — 큰 숫자 3개 + 요약 */
  const stats = (P, { title, items, note }) => {
    const els = [t(8, 12, 60, 5.5, title, 700), box(8, 25, 5, 0.9, P.accent)];
    const W = 27, G = 2.5;
    items.slice(0, 3).forEach((s2, i) => {
      const x = 8 + i * (W + G);
      els.push(box(x, 34, W, 34, P.soft));
      els.push(t(x, 41, W, 8, s2.v, 700, P.accent, 'center'));
      els.push(t(x, 58, W, 2.5, s2.k, 600, undefined, 'center'));
    });
    els.push(t(8, 78, 84, 2.9, note, 400, P.mutedOnLight));
    return els;
  };

  /* 09 Quote — 대형 인용 */
  const quote = (P, { text, who }) => [
    t(8, 20, 10, 16, '\u201C', 700, P.accent),
    t(14, 34, 72, 5, text, 600),
    box(14, 66, 5, 0.9, P.accent2),
    t(14, 72, 60, 2.6, who, 500, P.mutedOnLight),
  ];

  /* 10 Team — 인물 카드 3 */
  const team = (P, { title, members }) => {
    const els = [t(8, 11, 50, 5.5, title, 700), box(8, 24, 5, 0.9, P.accent)];
    const W = 27, G = 2.5;
    members.slice(0, 3).forEach((m, i) => {
      const x = 8 + i * (W + G);
      els.push(img(x + 6.5, 32, 14, 25, ''));
      els.push(t(x, 61, W, 3, m.name, 700, undefined, 'center'));
      els.push(t(x, 69, W, 2.3, m.role, 500, P.accent, 'center'));
    });
    return els;
  };

  /* 11 Pricing — 플랜 3 (중앙 강조) */
  const pricing = (P, { title, plans }) => {
    const els = [t(8, 10, 50, 5.5, title, 700)];
    const W = 27, G = 2.5;
    plans.slice(0, 3).forEach((pl, i) => {
      const x = 8 + i * (W + G), hot = i === 1;
      els.push(box(x, 22, W, 60, hot ? P.dark : P.soft));
      els.push(t(x, 27, W, 2.6, pl.name, 700, hot ? '#FFFFFF' : undefined, 'center'));
      els.push(t(x, 35, W, 6.5, pl.price, 700, hot ? P.accent : P.dark, 'center'));
      els.push(t(x + 3, 52, W - 6, 2.3, pl.desc, 400, hot ? P.mutedOnDark : P.mutedOnLight, 'center'));
      els.push(box(x + 6, 70, W - 12, 6.5, hot ? P.accent : '#FFFFFF'));
      els.push(t(x + 6, 72, W - 12, 2.4, '시작하기', 700, hot ? '#FFFFFF' : P.accent, 'center'));
    });
    return els;
  };

  /* 12 FAQ — 질문·답 3 */
  const faq = (P, { title, items }) => {
    const els = [t(8, 11, 40, 5.5, title, 700), box(8, 24, 5, 0.9, P.accent)];
    items.slice(0, 3).forEach((q, i) => {
      const y = 32 + i * 20;
      els.push(t(8, y, 5, 3.4, 'Q', 700, P.accent));
      els.push(t(14, y + 0.4, 76, 2.9, q.q, 700));
      els.push(t(14, y + 7.5, 76, 2.5, q.a, 400, P.mutedOnLight));
      if (i < 2) els.push(box(8, y + 15.5, 84, 0.28, P.soft));
    });
    return els;
  };

  /* 13 CTA — 마무리 행동 유도 (다크) */
  const cta = (P, { title, sub, button }) => [
    t(8, 30, 84, 8, title, 700, undefined, 'center'),
    t(8, 48, 84, 3, sub, 400, P.mutedOnDark, 'center'),
    box(40, 60, 20, 9, P.accent),
    t(40, 62.8, 20, 2.9, button, 700, '#FFFFFF', 'center'),
  ];

  /* 14 Table — 헤더 + 3행 */
  const table = (P, { title, head, rows }) => {
    const els = [t(8, 10, 60, 5.5, title, 700), box(8, 24, 84, 7.5, P.dark)];
    const cw = 84 / head.length;
    head.forEach((h, i) => els.push(t(10 + i * cw, 26.4, cw - 3, 2.4, h, 700, '#FFFFFF')));
    rows.slice(0, 3).forEach((r, ri) => {
      const y = 34 + ri * 12;
      if (ri % 2 === 1) els.push(box(8, y - 1.6, 84, 10.5, '#F7F9FB'));
      r.forEach((c, ci) => els.push(t(10 + ci * cw, y + 1, cw - 3, 2.5, c, ci === 0 ? 600 : 400)));
    });
    return els;
  };

  /* 15 Logo Grid — 파트너/레퍼런스 6 */
  const logoGrid = (P, { title, names }) => {
    const els = [t(8, 12, 60, 5, title, 700, undefined, 'center'), t(8, 12, 84, 5, '', 400)];
    const W = 26, G = 3;
    names.slice(0, 6).forEach((n, i) => {
      const x = 8 + (i % 3) * (W + G), y = 30 + Math.floor(i / 3) * 26;
      els.push(box(x, y, W, 18, P.soft));
      els.push(t(x, y + 7, W, 2.6, n, 700, P.mutedOnLight, 'center'));
    });
    return els;
  };

  /* 16 Contact / Ending — 다크 마무리 */
  const ending = (P, { title, lines }) => {
    const els = [
      box(0, 0, 100, 1.1, P.accent),
      t(8, 28, 84, 10, title, 700),
      box(8, 52, 6.5, 0.9, P.accent2),
    ];
    (lines || []).slice(0, 3).forEach((l, i) => els.push(t(8, 60 + i * 7, 70, 2.7, l, 400, P.mutedOnDark)));
    return els;
  };

  /* 17 Big Statement (Q&A 등) — 초미니멀 초대형 */
  const statement = (P, { title, sub }) => [
    t(8, 32, 84, 14, title, 700, undefined, 'center'),
    t(8, 62, 84, 3, sub, 400, P.mutedOnLight, 'center'),
    box(46.5, 74, 7, 0.9, P.accent),
  ];

  /* 18 Hero (Landing) — 라이트 히어로 + CTA 버튼 */
  const hero = (P, { label, title, sub, button }) => [
    t(8, 16, 84, 2.4, label, 700, P.accent, 'center'),
    t(8, 24, 84, 9, title, 700, undefined, 'center'),
    t(16, 46, 68, 3, sub, 400, P.mutedOnLight, 'center'),
    box(40, 58, 20, 9, P.dark),
    t(40, 60.8, 20, 2.9, button, 700, '#FFFFFF', 'center'),
    img(24, 74, 52, 20, ''),
  ];

  /* 19 Features — 카드 3 (아이콘 자리 + 제목 + 설명) */
  const features = (P, { title, items }) => {
    const els = [t(8, 10, 60, 5.5, title, 700), box(8, 23, 5, 0.9, P.accent)];
    const W = 27, G = 2.5;
    items.slice(0, 3).forEach((f, i) => {
      const x = 8 + i * (W + G);
      els.push(box(x, 30, W, 52, '#FAFBFD'));
      els.push(box(x + 3, 36, 6, 10.5, P.soft));
      els.push(t(x + 3, 52, W - 6, 2.9, f.title, 700));
      els.push(t(x + 3, 60, W - 6, 2.4, f.desc, 400, P.mutedOnLight));
    });
    return els;
  };

  /* 20 Summary — 핵심 요약 리스트 (넘버) */
  const summary = (P, { title, points }) => {
    const els = [t(8, 12, 50, 6, title, 700), box(8, 26, 5, 0.9, P.accent)];
    points.slice(0, 3).forEach((pt, i) => {
      const y = 36 + i * 17;
      els.push(box(8, y - 1, 9, 12.5, P.soft));
      els.push(t(8, y + 2, 9, 4.5, String(i + 1), 700, P.accent, 'center'));
      els.push(t(21, y, 71, 3.1, pt.title, 700));
      els.push(t(21, y + 7, 71, 2.5, pt.desc, 400, P.mutedOnLight));
    });
    return els;
  };

  /* ---------- Scene 조립 ---------- */
  let SCN = 0;
  const scene = (name, background, elements, duration) =>
    ({ id: 'pr' + (++SCN), name, width: 1280, height: 720, duration: duration || 5, background, transition: 'fade', order: 0, elements });
  const compose = (defs) => defs.map((d, i) => { const s2 = scene(d.name, d.bg, d.els, d.duration); s2.order = i; return s2; });

  /* ============================================================
     첫 번째 Premium Project — Presentation (10씬)
     ============================================================ */
  const P = PALETTES['pl-ink'];
  const PRESENTATION = {
    templateId: 'tpl-pr-presentation-01', styleEn: 'Premium', recent: true,
    uses: '발표 전반 · 수업 · 세미나 · 보고', title: 'Presentation — Ink & Teal',
    description: '표지부터 엔딩까지 10장 완성형 프리미엄 발표 템플릿',
    contentType: 'presentation', category: '발표자료', style: '프리미엄', ratio: '16:9', difficulty: '쉬움',
    targetUser: 'all', gradeRange: '전체', tags: ['프리미엄', '발표', '완성형'],
    scenes: compose([
      { name: '01 Cover', bg: P.dark, els: cover(P, { label: 'PRESENTATION · 2026', title: '제목을 입력하세요\n두 줄까지 좋습니다', subtitle: '발표의 핵심 메시지를 한 문장으로 요약합니다', meta: '발표자 이름 · 소속 · 날짜' }) },
      { name: '02 Agenda', bg: P.light, els: agenda(P, { title: 'Agenda', items: ['배경과 문제 정의', '핵심 내용', '데이터로 보는 근거', '앞으로의 계획', '요약과 질의응답'] }) },
      { name: '03 Section', bg: P.dark, els: sectionDivider(P, { num: '01', title: '첫 번째 주제', sub: '이 장에서 다룰 내용을 한 줄로 소개합니다' }) },
      { name: '04 Content', bg: P.light, els: contentSplit(P, { label: 'KEY POINT', title: '핵심 내용을\n명확하게 전달합니다', body: '한 슬라이드에는 하나의 메시지만 담습니다.\n설명은 세 줄을 넘기지 않습니다.', bullets: ['첫 번째 근거를 짧게', '두 번째 근거를 짧게', '세 번째 근거를 짧게'], imgLabel: '핵심 이미지' }) },
      { name: '05 Gallery', bg: P.light, els: gallery(P, { title: '한눈에 보기', captions: ['현장 사진 · 캡션', '과정 사진 · 캡션', '결과 사진 · 캡션'] }) },
      { name: '06 Chart', bg: P.light, els: chart(P, { title: '데이터로 보는 변화', insight: '마지막 분기에 가장 큰 성장이 있었습니다 — 강조 막대가 핵심입니다.', bars: [{ k: '1분기', v: 32 }, { k: '2분기', v: 41 }, { k: '3분기', v: 56 }, { k: '4분기', v: 78 }] }) },
      { name: '07 Timeline', bg: P.light, els: timeline(P, { title: '앞으로의 계획', steps: [{ k: 'NOW', title: '준비', desc: '기반 정리' }, { k: 'Q3', title: '실행', desc: '핵심 과제 착수' }, { k: 'Q4', title: '확장', desc: '범위 확대' }, { k: '2027', title: '완성', desc: '목표 달성' }] }) },
      { name: '08 Summary', bg: P.light, els: stats(P, { title: '숫자로 요약', items: [{ v: '3×', k: '성장' }, { v: '92%', k: '만족도' }, { v: '10일', k: '단축' }], note: '핵심 수치 세 개면 충분합니다 — 나머지는 부록으로 보냅니다.' }) },
      { name: '09 Q&A', bg: P.light, els: statement(P, { title: 'Q&A', sub: '질문을 환영합니다' }) },
      { name: '10 Ending', bg: P.dark, els: ending(P, { title: '감사합니다', lines: ['이름 · 소속', 'email@example.com', '자료는 공유 링크로 전달됩니다'] }) },
    ]),
  };
  PRESENTATION._overlay = {
    styleId: 'st-modern', animationId: 'an-seq', assetIds: ['as-011', 'as-017'],
    ai: { recommended: true, tags: ['프리미엄', '발표', '완성형'], hints: ['표지 제목만 바꿔도 완성', '섹션 장 복제로 확장'] },
  };
  window.MK_SAMPLE.TEMPLATES.push(PRESENTATION);

  return { PALETTES, isDark, t, box, img, compose,
    cover, agenda, sectionDivider, contentSplit, gallery, chart, timeline, stats, quote,
    team, pricing, faq, cta, table, logoGrid, ending, statement, hero, features, summary };
})();
