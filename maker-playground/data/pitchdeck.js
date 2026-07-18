/* ============================================================
   Round 10 — Signal Pitch Deck (pitch-deck-01)
   ------------------------------------------------------------
   Engine 실전 검증: 신규 섹션 12종을 Registry에 등록하고
   Template JSON 한 덩어리로 12씬을 조립한다.
   원칙: 카드 남발 금지 · 에디토리얼 · 비대칭 · 여백.
   ============================================================ */
(() => {
  const S = window.MK_SEC;
  const { t, box, isDark } = S;

  /* ---------- signal 테마 (지시 토큰 → 팔레트 역할 매핑) ---------- */
  S.PALETTES['pl-signal'] = {
    name: 'Signal', dark: '#111315', light: '#F5F4F0', soft: '#ECEBE6',
    accent: '#12A594', accent2: '#F26B5B', mutedOnDark: '#8C9198', mutedOnLight: '#5F646B',
    surface: '#FFFFFF', line: '#D8D9D5', darkSurface: '#1A1D20', accentDark: '#08786E',
  };

  /* ---------- 제품 대시보드 목업 (box 조합 — 실제처럼 보이는 UI 더미) ---------- */
  const mockup = (x, y, w, h, P) => {
    const u = (dx, dy, dw, dh, fill) => box(x + dx / 100 * w, y + dy / 100 * h, dw / 100 * w, dh / 100 * h, fill);
    return [
      box(x, y, w, h, P.darkSurface),                          /* 프레임 */
      u(0, 0, 100, 9, '#22262A'),                              /* 헤더바 */
      u(2.5, 3, 6, 3.4, P.accent),                             /* 브랜드 칩 */
      u(78, 3, 8, 3.4, '#33383D'), u(88, 3, 8, 3.4, '#33383D'),
      u(0, 9, 20, 91, '#17191C'),                              /* 사이드바 */
      u(3, 15, 14, 3, '#2B3036'), u(3, 22, 14, 3, P.accent), u(3, 29, 14, 3, '#2B3036'), u(3, 36, 14, 3, '#2B3036'),
      u(24, 15, 44, 5, '#2E3338'),                             /* 타이틀 로우 */
      u(24, 26, 33, 26, '#22262A'), u(60, 26, 36, 26, '#22262A'), /* 위젯 2 */
      u(27, 32, 20, 3, P.accent), u(27, 38, 26, 2.4, '#3A4046'), u(27, 43, 23, 2.4, '#3A4046'),
      u(63, 32, 12, 14, P.accentDark), u(77, 36, 8, 10, '#3A4046'), u(87, 30, 6, 16, '#2E8C7F'),
      u(24, 58, 72, 4, '#22262A'), u(24, 66, 72, 4, '#22262A'), u(24, 74, 56, 4, '#22262A'), /* 로우 */
      u(24, 84, 18, 6, P.accent),                              /* CTA */
    ];
  };

  /* ---------- 신규 섹션 12종 ---------- */

  /* 01 cover-product-hero — 좌 5col 텍스트 · 우 7col 목업(캔버스 밖 확장) */
  S.SECTIONS['cover-product-hero'] = { name: 'Cover', theme: 'light', variants: ['mockup-right'],
    build: (P, o) => [
      box(5, 8.5, 1.7, 3, P.accent),
      t(7.6, 8.6, 20, 2.6, o.brand, 750, P.textDark || '#15171A'),
      t(5, 22, 44, 7.6, o.headline, 700),
      t(5, 52, 42, 2.9, o.subline, 450, '#5F646B'),
      t(5, 87, 40, 2.2, o.meta, 550, '#8C9198'),
      ...mockup(52, 12, 56, 76, P),
    ] };

  /* 02 problem-editorial-list — 좌 55% 제목 · 우 스태거 번호 리스트 */
  S.SECTIONS['problem-editorial-list'] = { name: 'The Problem', theme: 'light', variants: ['stagger'],
    build: (P, o) => {
      const els = [
        t(5, 10, 30, 2.1, o.label, 700, P.accent),
        t(5, 17, 50, 6.2, o.headline, 700),
        t(5, 84, 48, 2.5, o.support, 450, '#5F646B'),
      ];
      (o.points || []).slice(0, 3).forEach((pt, i) => {
        const x = 60 + i * 2.2, y = 18 + i * 21;
        els.push(t(x, y, 6, 4.6, String(i + 1).padStart(2, '0'), 700, i === 0 ? P.accent2 : '#C9CBC6'));
        els.push(t(x + 8, y + 1.2, 30 - i * 2.2, 2.9, pt, i === 0 ? 650 : 500, i === 0 ? undefined : '#5F646B'));
        els.push(box(x, y + 12.5, 34 - i * 2.2, 0.28, '#D8D9D5'));
      });
      return els;
    } };

  /* 03 insight-metric-stage — 다크 · 좌 초대형 수치 · 우 설명 + 보조 + 인용 */
  S.SECTIONS['insight-metric-stage'] = { name: 'Insight', theme: 'dark', variants: ['stage'],
    build: (P, o) => [
      t(5, 10, 30, 2.1, o.label, 700, P.accent),
      t(5, 22, 44, 19, o.metric, 750, P.accent),
      t(5, 62, 40, 2.9, o.statement, 500),
      t(58, 26, 14, 7.5, o.metric2, 700),
      t(58, 41, 34, 2.5, o.statement2, 450, P.mutedOnDark),
      box(58, 55, 5, 0.55, P.accent2),
      t(58, 60, 36, 3.1, o.quote, 550),
      t(58, 78, 34, 1.9, o.source, 450, P.mutedOnDark),
    ] };

  /* 04 solution-connected-flow — 중앙 문장 · Plan→Build→Ship 연결 흐름 */
  S.SECTIONS['solution-connected-flow'] = { name: 'Solution', theme: 'light', variants: ['flow'],
    build: (P, o) => {
      const els = [
        t(5, 10, 30, 2.1, o.label, 700, P.accent),
        t(5, 17, 76, 6.2, o.headline, 700),
        box(8, 57.5, 78, 0.34, '#D8D9D5'),
      ];
      (o.steps || []).slice(0, 3).forEach((st, i) => {
        const x = 8 + i * 30;
        els.push(box(x, 55.6, 2.2, 4, i === 2 ? P.accent2 : P.accent));
        els.push(t(x, 44, 22, 3.6, st.title, 700, P.accent));
        els.push(t(x, 66, 24, 2.6, st.desc, 470, '#5F646B'));
        if (i < 2) els.push(t(x + 26.2, 55, 3, 3, '\u2192', 600, '#B9BBB5'));
      });
      return els;
    } };

  /* 05 product-annotated-showcase — 대형 목업 + annotation 3 */
  S.SECTIONS['product-annotated-showcase'] = { name: 'Product', theme: 'light', variants: ['annotated'],
    build: (P, o) => {
      const els = [
        t(5, 8, 40, 4.8, o.headline, 700),
        t(5, 19, 40, 2.4, o.support, 450, '#5F646B'),
        ...mockup(16, 28, 68, 62, P),
      ];
      const anns = (o.annotations || []).slice(0, 3);
      const pos = [[8, 38, 30, 42], [88, 33, 84.5, 40], [88, 72, 82, 76]]; /* [라벨x, 라벨y, 도트x, 도트y] */
      anns.forEach((a, i) => {
        const [lx, ly, dx, dy] = pos[i];
        els.push(box(dx, dy, 0.9, 1.6, P.accent2));
        els.push(box(Math.min(lx, dx) + 1, dy + 0.55, Math.abs(dx - lx) - 1, 0.22, '#B9BBB5'));
        els.push(t(lx - (i === 0 ? 3 : 0), ly, 11, 1.9, a, 650, i === 0 ? P.accent : '#15171A'));
      });
      return els;
    } };

  /* 06 feature-asymmetric-grid — 첫 기능 대형 · 나머지 3 세로 보조 */
  S.SECTIONS['feature-asymmetric-grid'] = { name: 'Key Features', theme: 'light', variants: ['asymmetric'],
    build: (P, o) => {
      const f = o.features || [], m = f[0] || {};
      const els = [
        t(5, 9, 30, 2.1, o.label, 700, P.accent),
        t(5, 16, 10, 4.2, '01', 700, P.accent2),
        t(5, 25, 40, 4.6, m.title, 700),
        t(5, 37, 38, 2.6, m.desc, 470, '#5F646B'),
        ...mockup(5, 52, 42, 38, P),
      ];
      f.slice(1, 4).forEach((ft, i) => {
        const y = 16 + i * 25;
        els.push(t(56, y, 6, 3.2, String(i + 2).padStart(2, '0'), 700, '#C9CBC6'));
        els.push(t(63, y + 0.3, 32, 3, ft.title, 650));
        els.push(t(63, y + 8, 32, 2.3, ft.desc, 450, '#5F646B'));
        els.push(box(56, y + 16.5, 39, 0.28, '#D8D9D5'));
      });
      return els;
    } };

  /* 07 market-editorial-scale — 수치 계층 스케일 바 + CAGR 블록 */
  S.SECTIONS['market-editorial-scale'] = { name: 'Market', theme: 'light', variants: ['scale'],
    build: (P, o) => {
      const els = [
        t(5, 9, 30, 2.1, o.label, 700, P.accent),
        t(5, 16, 62, 5.4, o.headline, 700),
      ];
      const rows = o.tiers || [];
      const maxW = 58;
      rows.slice(0, 3).forEach((r, i) => {
        const y = 34 + i * 17, w = maxW * (r.scale || 1);
        els.push(t(5, y + 1.2, 8, 2.2, r.k, 700, '#8C9198'));
        els.push(box(14, y, w, i === 0 ? 9 : 7, i === 0 ? P.accent : i === 1 ? '#BFE3DD' : '#ECEBE6'));
        els.push(t(15.6, y + (i === 0 ? 2.2 : 1.6), 20, i === 0 ? 4.2 : 3.2, r.v, 700, i === 0 ? '#FFFFFF' : '#15171A'));
      });
      els.push(box(76, 34, 19, 24, P.dark));
      els.push(t(77.8, 38, 15, 5, o.growth, 750, P.accent));
      els.push(t(77.8, 49, 15, 2, o.growthLabel, 550, '#8C9198'));
      els.push(t(5, 88, 60, 1.9, o.source, 450, '#8C9198'));
      return els;
    } };

  /* 08 business-model-focus-plan — 중앙 플랜 강조 · 좌우 보조 · 하단 수익원 */
  S.SECTIONS['business-model-focus-plan'] = { name: 'Business Model', theme: 'light', variants: ['focus'],
    build: (P, o) => {
      const pl = o.plans || [];
      const els = [t(5, 9, 30, 2.1, o.label, 700, P.accent), t(5, 15, 60, 5, o.headline, 700)];
      /* 좌·우 보조 (패널 없이 텍스트) */
      [[pl[0], 7], [pl[2], 72]].forEach(([p2, x]) => { if (!p2) return;
        els.push(t(x, 38, 20, 2.4, p2.name, 650, '#5F646B'));
        els.push(t(x, 44, 21, 4, p2.price, 700));
        els.push(t(x, 54, 21, 2.1, p2.desc, 450, '#8C9198'));
      });
      /* 중앙 강조 */
      const c = pl[1] || {};
      els.push(box(32, 30, 36, 46, P.dark));
      els.push(t(34.5, 34.5, 20, 2.4, c.name, 650, P.accent));
      els.push(t(34.5, 41, 31, 5, c.price, 750, '#FFFFFF'));
      els.push(t(34.5, 53, 30, 2.3, c.desc, 450, '#8C9198'));
      els.push(box(34.5, 62, 12, 6.5, P.accent));
      els.push(t(34.5, 64, 12, 2.2, o.cta || '시작하기', 700, '#FFFFFF', 'center'));
      /* 수익원 */
      els.push(box(5, 86, 90, 0.28, '#D8D9D5'));
      (o.streams || []).slice(0, 3).forEach((s2, i) => {
        els.push(box(7 + i * 22, 90.4, 1, 1.8, P.accent2));
        els.push(t(9.5 + i * 22, 90, 18, 2.1, s2, 600, '#5F646B'));
      });
      return els;
    } };

  /* 09 traction-chart-metrics — 좌 성장 차트 · 우 핵심 2대 + 보조 2소 */
  S.SECTIONS['traction-chart-metrics'] = { name: 'Traction', theme: 'light', variants: ['chart'],
    build: (P, o) => {
      const els = [t(5, 9, 30, 2.1, o.label, 700, P.accent), t(5, 15, 50, 5, o.headline, 700)];
      const bars = o.series || [], max = Math.max(...bars.map((b) => b.v));
      const X0 = 5, W = 6.2, G = 2.3, BASE = 84, HMAX = 44;
      els.push(box(X0, BASE - HMAX, (W + G) * bars.length - G, 0.22, '#E3E2DC'));
      bars.forEach((b, i) => {
        const h = Math.max(3, b.v / max * HMAX), x = X0 + i * (W + G), last = i === bars.length - 1;
        els.push(box(x, BASE - h, W, h, last ? P.accent : '#DDE9E6'));
        if (last) els.push(t(x - 2, BASE - h - 4.6, W + 4, 2.4, b.vLabel || String(b.v), 700, P.accent, 'center'));
        els.push(t(x, BASE + 2.4, W, 1.8, b.k, 500, '#8C9198', 'center'));
      });
      els.push(box(X0, BASE, (W + G) * bars.length - G, 0.32, '#C9CBC6'));
      const m = o.metrics || [];
      [[m[0], 60, 26, 7.2], [m[1], 60, 47, 7.2]].forEach(([mt, x, y, sz]) => { if (!mt) return;
        els.push(t(x, y, 24, sz, mt.v, 750, P.accent === '#12A594' && mt.hot ? P.accent2 : '#15171A'));
        els.push(t(x, y + sz * 2.05, 26, 2.2, mt.k, 550, '#8C9198'));
      });
      [[m[2], 84, 30], [m[3], 84, 51]].forEach(([mt, x, y]) => { if (!mt) return;
        els.push(t(x, y, 12, 3.4, mt.v, 700));
        els.push(t(x, y + 7.5, 12, 1.8, mt.k, 500, '#8C9198'));
      });
      return els;
    } };

  /* 10 roadmap-progress-line — 상태(now/next/plan) 마일스톤 */
  S.SECTIONS['roadmap-progress-line'] = { name: 'Roadmap', theme: 'light', variants: ['progress'],
    build: (P, o) => {
      const els = [
        t(5, 9, 30, 2.1, o.label, 700, P.accent),
        t(5, 15, 62, 5.4, o.headline, 700),
        box(5, 55.7, 90, 0.34, '#D8D9D5'),
      ];
      const ms = o.milestones || [], span = 90 / ms.length;
      /* 진행 구간 라인 */
      els.push(box(5, 55.7, span * 0.7, 0.34, P.accent));
      ms.slice(0, 4).forEach((m, i) => {
        const x = 5 + i * span, now = m.status === 'now';
        els.push(box(x, now ? 53.6 : 54.4, now ? 2.4 : 1.6, now ? 4.6 : 3, now ? P.accent2 : m.status === 'done' ? P.accent : '#C9CBC6'));
        els.push(t(x, 44, span - 4, 2.2, m.k, 700, now ? P.accent2 : P.accent));
        els.push(t(x, now ? 63 : 64, span - 4, now ? 3.1 : 2.7, m.title, now ? 700 : 600));
        els.push(t(x, 72, span - 4, 2, m.statusLabel, 550, '#8C9198'));
      });
      return els;
    } };

  /* 11 team-editorial-profiles — CEO 소강조 + 2인 + 공통 경험 문장 */
  S.SECTIONS['team-editorial-profiles'] = { name: 'Team', theme: 'light', variants: ['editorial'],
    build: (P, o) => {
      const els = [t(5, 9, 30, 2.1, o.label, 700, P.accent), t(5, 15, 60, 5, o.headline, 700)];
      const mem = o.members || [];
      const ph = [S.PH.d, S.PH.c, S.PH.b];
      mem.slice(0, 3).forEach((m, i) => {
        const lead = i === 0, x = lead ? 5 : 44 + (i - 1) * 27, y = lead ? 32 : 34, iw = lead ? 21 : 16, ih = lead ? 42 : 32;
        els.push(box(x, y, iw, ih, ph[i]));
        els.push(t(x + (lead ? 24 : 0), lead ? 40 : y + ih + 3, 24, lead ? 3.6 : 2.8, m.name, 700));
        els.push(t(x + (lead ? 24 : 0), lead ? 48 : y + ih + 9.5, 24, 2.2, m.role, 650, P.accent));
        els.push(t(x + (lead ? 24 : 0), lead ? 54 : y + ih + 14.5, lead ? 24 : 25, 2, m.exp, 450, '#8C9198'));
      });
      els.push(box(5, 86, 90, 0.28, '#D8D9D5'));
      els.push(t(5, 90, 80, 2.2, o.common, 500, '#5F646B'));
      return els;
    } };

  /* 12 closing-brand-statement — 다크 마무리 */
  S.SECTIONS['closing-brand-statement'] = { name: 'Closing', theme: 'dark', variants: ['statement'],
    build: (P, o) => [
      box(5, 12, 1.7, 3, P.accent),
      t(7.6, 12.1, 20, 2.4, o.brand, 750),
      t(5, 26, 74, 8.4, o.headline, 700),
      t(5, 58, 60, 2.7, o.subline, 450, P.mutedOnDark),
      t(5, 74, 40, 2.8, o.contact, 650, P.accent),
      t(5, 80.5, 40, 2.3, o.website, 550),
      box(5, 89, 90, 0.24, '#2A2E31'),
      t(5, 92, 60, 1.8, o.footer, 450, P.mutedOnDark),
    ] };

  /* ============================================================
     Template JSON — pitch-deck-01 "Signal"
     ============================================================ */
  const PITCH_DECK_JSON = {
    template: 'Pitch Deck', palette: 'pl-signal', version: '1.0.0',
    meta: {
      templateId: 'pitch-deck-01', styleEn: 'Premium', recent: true,
      uses: '투자 발표 · 신사업 제안 · 제품 소개', title: 'Signal — Modern Startup Pitch Deck',
      description: '12-page investor presentation · 16:9',
      contentType: 'presentation', category: '발표자료', style: '프리미엄', ratio: '16:9', difficulty: '보통',
      targetUser: 'all', gradeRange: '전체', tags: ['Startup', 'Pitch', 'Modern', 'Premium', 'New'],
      format: { ratio: '16:9', width: 1920, height: 1080 }, themeId: 'signal-light', pages: 12,
    },
    sections: [
      { id: 'cover-product-hero', name: '01 Cover', bg: '#F5F4F0', props: { brand: 'NOVA', headline: '팀의 업무 흐름을\n하나로 연결합니다', subline: 'One workspace for planning, building,\nand shipping together.', meta: 'Investor Presentation · 2026' } },
      { id: 'problem-editorial-list', name: '02 The Problem', bg: '#F5F4F0', props: { label: 'THE PROBLEM', headline: '일은 여러 도구에\n흩어지고, 중요한\n맥락은 사라집니다', points: ['계획은 문서에 있습니다', '업무는 별도 도구에서 움직입니다', '결정은 메시지 속에 묻힙니다'], support: '팀은 더 많은 도구를 사용하지만, 실제 협업 속도는 오히려 느려지고 있습니다.' } },
      { id: 'insight-metric-stage', name: '03 Insight', props: { label: 'INSIGHT', metric: '37%', statement: '팀원이 업무 정보를 찾는 데 쓰는 시간', metric2: '6.4개', statement2: '한 프로젝트에서 평균적으로 오가는 업무 도구', quote: '\u201C도구가 부족한 것이 아니라\n연결이 부족한 것입니다.\u201D', source: '출처: 2026 Team Productivity Survey (편집 가능)' } },
      { id: 'solution-connected-flow', name: '04 Solution', bg: '#F5F4F0', props: { label: 'SOLUTION', headline: '계획부터 실행까지, 하나의 흐름으로', steps: [{ title: 'Plan', desc: '목표와 우선순위를 정렬합니다' }, { title: 'Build', desc: '업무와 자산을 한곳에서 관리합니다' }, { title: 'Ship', desc: '진행 상황과 결과를 즉시 공유합니다' }] } },
      { id: 'product-annotated-showcase', name: '05 Product', bg: '#F5F4F0', props: { headline: '모든 프로젝트를 한눈에', support: '업무, 일정, 파일, 대화를 하나의 프로젝트 뷰에서 관리합니다.', annotations: ['Unified Timeline', 'Project Context', 'Live Progress'] } },
      { id: 'feature-asymmetric-grid', name: '06 Key Features', bg: '#F5F4F0', props: { label: 'KEY FEATURES', features: [{ title: 'Smart Planning', desc: '목표를 실행 가능한 업무로 자동 정리합니다.' }, { title: 'Unified Workspace', desc: '파일, 메시지, 일정을 프로젝트 안에서 연결합니다.' }, { title: 'Live Visibility', desc: '팀의 진행 상황과 병목을 실시간으로 확인합니다.' }, { title: 'AI Project Brief', desc: '프로젝트 전체 맥락을 바탕으로 요약과 다음 행동을 제안합니다.' }] } },
      { id: 'market-editorial-scale', name: '07 Market', bg: '#F5F4F0', props: { label: 'MARKET', headline: '빠르게 성장하는 협업 소프트웨어 시장', tiers: [{ k: 'TAM', v: '$48B', scale: 1 }, { k: 'SAM', v: '$12B', scale: 0.55 }, { k: 'SOM', v: '$1.8B', scale: 0.26 }], growth: '18.4%', growthLabel: 'CAGR · Market Growth', source: '출처: Global Collaboration Software Market Report 2026 (편집 가능)' } },
      { id: 'business-model-focus-plan', name: '08 Business Model', bg: '#F5F4F0', props: { label: 'BUSINESS MODEL', headline: '단순하고 확장 가능한 수익 구조', plans: [{ name: 'Starter', price: 'Free', desc: '개인 및 소규모 팀' }, { name: 'Team', price: '\u20A912,000', desc: '/ user / month · 성장하는 팀' }, { name: 'Business', price: 'Custom', desc: '보안과 관리가 필요한 조직' }], streams: ['Subscription', 'AI Usage', 'Enterprise Add-ons'], cta: '시작하기' } },
      { id: 'traction-chart-metrics', name: '09 Traction', bg: '#F5F4F0', props: { label: 'TRACTION', headline: '검증된 성장 속도', series: [{ k: 'Jan', v: 3.8 }, { k: 'Feb', v: 4.9 }, { k: 'Mar', v: 6.1 }, { k: 'Apr', v: 7.7 }, { k: 'May', v: 9.8 }, { k: 'Jun', v: 12.4, vLabel: '12.4K' }], metrics: [{ v: '12,400', k: 'Monthly Active Users' }, { v: '+23%', k: 'Monthly Growth', hot: true }, { v: '68%', k: '3-Month Retention' }, { v: '4.7/5', k: 'Customer Satisfaction' }] } },
      { id: 'roadmap-progress-line', name: '10 Roadmap', bg: '#F5F4F0', props: { label: 'ROADMAP', headline: '제품에서 플랫폼으로 확장합니다', milestones: [{ k: 'Q3 2026', title: 'Team Workspace 2.0', status: 'now', statusLabel: '진행 중' }, { k: 'Q4 2026', title: 'AI Project Brief', status: 'next', statusLabel: '예정' }, { k: 'Q1 2027', title: 'Enterprise Admin', status: 'plan', statusLabel: '예정' }, { k: 'Q2 2027', title: 'Global Expansion', status: 'plan', statusLabel: '예정' }] } },
      { id: 'team-editorial-profiles', name: '11 Team', bg: '#F5F4F0', props: { label: 'TEAM', headline: '제품과 기술을 함께 만들어 온 팀', members: [{ name: '김도윤', role: 'CEO', exp: 'Former Product Lead, Orbit' }, { name: '박서연', role: 'CTO', exp: 'Former Engineering Lead, Cloudbase' }, { name: '이현우', role: 'Head of Design', exp: 'Former Design Director, Frame' }], common: '세 사람은 같은 팀에서 제품을 출시해 본 경험을 공유합니다 — 실행 속도가 우리의 첫 번째 자산입니다.' } },
      { id: 'closing-brand-statement', name: '12 Closing', props: { brand: 'NOVA', headline: '더 적은 도구로,\n더 나은 일을 만듭니다', subline: 'We are building the operating system for modern teamwork.', contact: 'hello@nova.so', website: 'nova.so', footer: 'NOVA · Investor Presentation · 2026' } },
    ],
  };

  const tpl = S.registerTemplate(PITCH_DECK_JSON, {
    styleId: 'st-modern', animationId: 'an-seq', assetIds: [],
    ai: { recommended: true, tags: ['Startup', 'Pitch', 'Premium'], hints: ['NOVA 자리에 회사명만 바꿔도 완성', '수치는 전부 JSON에서 교체'] },
  });
  S.PITCH_DECK_JSON = PITCH_DECK_JSON;
})();
