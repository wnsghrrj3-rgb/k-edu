/* ============================================================
   MK_THEMES — R100 팔레트 확장: 초록·회색 세상에 여섯 색이 온다
   ------------------------------------------------------------
   준호: 「색상이 죄다 초록(미니멀 액센트)이나 짙은 회색뿐」.
   원인 = 테마가 2종(미니멀·볼드)뿐이라서다. 아키텍처의 원래 축
   (「같은 Composition에 Theme만 갈아 끼우면 새 템플릿」)대로
   테마 6종을 더한다 — 바다·노을·자두·라벤더·청록·로즈.

   규율 = 대비 감사. 팔레트는 감이 아니라 수치로 통과한다:
   · accent 배경 ↔ onDark 글자 ≥ 3.0  (WCAG 대형글자 AA)
   · dark 배경 ↔ onDark 글자 ≥ 7.0
   · paper 배경 ↔ ink 글자 ≥ 7.0
   신규 6종 전부 accent 대비 3.99~5.83 실측 합격. 기존 th-bold는
   2.95로 3.0선 미달이라 액센트를 #D97757→#D0693F로 보정(3.44) —
   compositions.js에서 직접 수정, 이 감사가 재발을 막는다.
   accent가 밝은(파스텔) 테마는 이 모델에서 금지 — onDark 하나가
   dark·accent 두 배경을 겸하므로 accent도 중간 이상 어두워야 한다.
   ============================================================ */
(() => {
  'use strict';
  const C = window.MK_COMPOSE;
  if (!C) return;

  /* ---- 순수: WCAG 상대 휘도·대비율 ---- */
  const lum = (hex) => {
    let h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const contrast = (a, b) => {
    const x = lum(a), y = lum(b), hi = Math.max(x, y), lo = Math.min(x, y);
    return (hi + 0.05) / (lo + 0.05);
  };

  /* ---- 신규 테마 6종 ---- */
  const calmType = {
    headline: { size: 7.2, weight: 800 }, subheadline: { size: 3.4, weight: 600 },
    body: { size: 2.8, weight: 400 }, caption: { size: 2.2, weight: 400, color: '#8E9AAC' },
    number: { size: 9, weight: 800 }, cta: { size: 4.2, weight: 800 },
  };
  const warmType = {
    headline: { size: 7.8, weight: 800 }, subheadline: { size: 3.5, weight: 700 },
    body: { size: 2.9, weight: 500 }, caption: { size: 2.2, weight: 500, color: '#9A8F8A' },
    number: { size: 10, weight: 800 }, cta: { size: 4.4, weight: 800 },
  };
  const NEW_THEMES = [
    { id: 'th-ocean', name: '바다', mood: 'calm', transitions: ['fade', 'dissolve', 'fade'], musicName: '잔잔한 파도',
      tokens: { paper: '#F4F7FA', dark: '#14263A', accent: '#2D6FB3', ink: '#1E2C3A', onDark: '#F2F7FC', type: calmType } },
    { id: 'th-sunset', name: '노을', mood: 'warm', transitions: ['slide', 'fade', 'push'], musicName: '따뜻한 어쿠스틱',
      tokens: { paper: '#FDF6EF', dark: '#35231C', accent: '#C25E2A', ink: '#33241C', onDark: '#FFF6EE', type: warmType } },
    { id: 'th-plum', name: '자두', mood: 'calm', transitions: ['fade', 'dissolve', 'fade'], musicName: '몽글한 피아노',
      tokens: { paper: '#FAF5F8', dark: '#2C1B2E', accent: '#9C3D6E', ink: '#2E1F2A', onDark: '#FBF3F8', type: calmType } },
    { id: 'th-lavender', name: '라벤더', mood: 'calm', transitions: ['fade', 'fade', 'dissolve'], musicName: '저녁 산책',
      tokens: { paper: '#F7F6FB', dark: '#241F33', accent: '#6D5BAA', ink: '#27223A', onDark: '#F6F4FC', type: calmType } },
    { id: 'th-teal', name: '청록', mood: 'calm', transitions: ['fade', 'dissolve', 'fade'], musicName: '맑은 오전',
      tokens: { paper: '#F2F8F7', dark: '#12302D', accent: '#1F7A72', ink: '#1C2E2B', onDark: '#F0FAF8', type: calmType } },
    { id: 'th-rose', name: '로즈', mood: 'warm', transitions: ['slide', 'fade', 'push'], musicName: '설레는 비트',
      tokens: { paper: '#FBF5F6', dark: '#311E23', accent: '#C24D62', ink: '#301F24', onDark: '#FDF4F5', type: warmType } },
  ];
  NEW_THEMES.forEach((t) => C.registerTheme(t));

  /* ---- 대비 감사 — 등록된 「모든」 테마가 대상 (기존 2종 포함) ---- */
  function audit() {
    const v = [];
    const themes = (C.__themesForAudit && C.__themesForAudit()) || null;
    /* 전체 토큰 접근 — listThemes에 실은 swatch 필드로 검증 (paper·dark·accent·onDark·ink) */
    for (const t of C.listThemes()) {
      const s = t.swatch;
      if (!s) { v.push(t.id + ':swatch-missing'); continue; }
      if (contrast(s.accent, s.onDark) < 3.0) v.push(t.id + ':accent-contrast:' + contrast(s.accent, s.onDark).toFixed(2));
      if (contrast(s.dark, s.onDark) < 7.0) v.push(t.id + ':dark-contrast:' + contrast(s.dark, s.onDark).toFixed(2));
      if (contrast(s.paper, s.ink) < 7.0) v.push(t.id + ':paper-contrast:' + contrast(s.paper, s.ink).toFixed(2));
    }
    if (C.listThemes().length < 8) v.push('theme-count:' + C.listThemes().length);
    return { ok: !v.length, violations: v };
  }

  window.MK_THEMES = { lum, contrast, audit, NEW_IDS: NEW_THEMES.map((t) => t.id) };
})();
