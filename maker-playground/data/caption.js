/* ============================================================
   MK_CAPTION (R49) — 장면별 자막 디자인
   ------------------------------------------------------------
   R43 자동 자막이 "박혀만 있던" 문제의 해법:
   · 프리셋 8종 — 어느 장면에든 넣고·바꾸고·지운다
   · 교체 시 기존 문구(제목·설명) 유지
   · 자막 요소는 el.cap='<presetId>'·el.capRole 마킹 → 기계 식별
   · R43 레거시(마킹 없음)는 시그니처로 인식·승계
   · 캔버스(R45)·MK_RENDER·전 내보내기 경로 호환: 문자열 fill만 사용
   ============================================================ */
window.MK_CAPTION = (() => {
  'use strict';

  const ANIM = (delay) => ({ preset: 'fade', delay, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 });
  const SLIDE = (delay) => ({ preset: 'slide', delay, duration: 0.5, direction: 'up', ease: 'ease-out', repeat: 1 });

  /* 프리셋 — build(title, sub) => elements[] (전 요소 cap·capRole 마킹) */
  const PRESETS = [
    { id: 'bar-bottom', name: '하단 바', hint: '기본 — 어두운 바 + 제목·설명',
      build: (t, s) => [
        { kind: 'image', x: 0, y: 74, w: 100, h: 26, label: '', fill: '#151B26', cap: 'bar-bottom', capRole: 'bg', anim: SLIDE(0.3) },
        { kind: 'text', x: 6, y: 79, w: 88, size: 5.2, text: t, weight: 800, color: '#F5F7FA', cap: 'bar-bottom', capRole: 'title', anim: ANIM(0.55) },
        { kind: 'text', x: 6, y: 89, w: 88, size: 2.6, text: s, weight: 400, color: '#8E9AAC', cap: 'bar-bottom', capRole: 'sub', anim: ANIM(0.7) },
      ] },
    { id: 'bar-top', name: '상단 바', hint: '위쪽에 어두운 바',
      build: (t, s) => [
        { kind: 'image', x: 0, y: 0, w: 100, h: 22, label: '', fill: '#151B26', cap: 'bar-top', capRole: 'bg', anim: SLIDE(0.3) },
        { kind: 'text', x: 6, y: 4, w: 88, size: 5, text: t, weight: 800, color: '#F5F7FA', cap: 'bar-top', capRole: 'title', anim: ANIM(0.55) },
        { kind: 'text', x: 6, y: 13.5, w: 88, size: 2.5, text: s, weight: 400, color: '#8E9AAC', cap: 'bar-top', capRole: 'sub', anim: ANIM(0.7) },
      ] },
    { id: 'scrim-bottom', name: '은은한 띠', hint: '반투명 띠 — 사진이 비쳐요',
      build: (t, s) => [
        { kind: 'image', x: 0, y: 72, w: 100, h: 28, label: '', fill: 'rgba(15,20,30,0.55)', cap: 'scrim-bottom', capRole: 'bg', anim: ANIM(0.3) },
        { kind: 'text', x: 6, y: 78, w: 88, size: 5.2, text: t, weight: 800, color: '#FFFFFF', cap: 'scrim-bottom', capRole: 'title', anim: ANIM(0.5) },
        { kind: 'text', x: 6, y: 88.5, w: 88, size: 2.6, text: s, weight: 400, color: 'rgba(255,255,255,0.85)', cap: 'scrim-bottom', capRole: 'sub', anim: ANIM(0.65) },
      ] },
    { id: 'center', name: '중앙 큰 제목', hint: '한가운데 크게 — 표지용',
      build: (t, s) => [
        { kind: 'image', x: 8, y: 36, w: 84, h: 30, label: '', fill: 'rgba(15,20,30,0.5)', radius: 18, cap: 'center', capRole: 'bg', anim: ANIM(0.25) },
        { kind: 'text', x: 10, y: 42, w: 80, size: 7.5, text: t, weight: 900, color: '#FFFFFF', align: 'center', cap: 'center', capRole: 'title', anim: ANIM(0.5) },
        { kind: 'text', x: 10, y: 55, w: 80, size: 3, text: s, weight: 400, color: 'rgba(255,255,255,0.85)', align: 'center', cap: 'center', capRole: 'sub', anim: ANIM(0.65) },
      ] },
    { id: 'news', name: '뉴스 자막', hint: '방송처럼 — 포인트 띠 + 흰 바',
      build: (t, s) => [
        { kind: 'image', x: 0, y: 76, w: 100, h: 24, label: '', fill: 'rgba(255,255,255,0.94)', cap: 'news', capRole: 'bg', anim: SLIDE(0.3) },
        { kind: 'image', x: 0, y: 76, w: 1.6, h: 24, label: '', fill: '#5B8EF8', cap: 'news', capRole: 'accent', anim: SLIDE(0.3) },
        { kind: 'text', x: 5, y: 80, w: 90, size: 4.8, text: t, weight: 800, color: '#151B26', cap: 'news', capRole: 'title', anim: ANIM(0.5) },
        { kind: 'text', x: 5, y: 90, w: 90, size: 2.5, text: s, weight: 400, color: '#5A6577', cap: 'news', capRole: 'sub', anim: ANIM(0.65) },
      ] },
    { id: 'badge', name: '라벨 뱃지', hint: '좌상단 작은 라벨 — 사진을 가리지 않아요',
      build: (t, s) => [
        { kind: 'image', x: 4, y: 6, w: 40, h: 11, label: '', fill: 'rgba(21,27,38,0.85)', radius: 22, cap: 'badge', capRole: 'bg', anim: ANIM(0.3) },
        { kind: 'text', x: 7, y: 8.6, w: 34, size: 3.6, text: t, weight: 800, color: '#F5F7FA', cap: 'badge', capRole: 'title', anim: ANIM(0.5) },
        { kind: 'text', x: 4, y: 20, w: 60, size: 2.4, text: s, weight: 600, color: '#FFFFFF', cap: 'badge', capRole: 'sub', anim: ANIM(0.65) },
      ] },
    { id: 'minimal', name: '글자만', hint: '바 없이 굵은 흰 글씨',
      build: (t, s) => [
        { kind: 'text', x: 6, y: 80, w: 88, size: 5.6, text: t, weight: 900, color: '#FFFFFF', cap: 'minimal', capRole: 'title', anim: ANIM(0.4) },
        { kind: 'text', x: 6, y: 91, w: 88, size: 2.6, text: s, weight: 600, color: 'rgba(255,255,255,0.9)', cap: 'minimal', capRole: 'sub', anim: ANIM(0.55) },
      ] },
    { id: 'none', name: '자막 없음', hint: '자막을 지워요', build: () => [] },
  ];

  const byId = (id) => PRESETS.find((p) => p.id === id) || null;

  /* R43 레거시 시그니처 (마킹 없던 시절 자동 자막) — 엄격 일치만 */
  const isLegacyBg = (el) => el.kind === 'image' && !el.src && el.fill === '#151B26' && el.x === 0 && el.y === 74 && el.w === 100 && el.h === 26;
  const isLegacyTitle = (el) => el.kind === 'text' && el.y === 79 && el.x === 6 && el.color === '#F5F7FA';
  const isLegacySub = (el) => el.kind === 'text' && el.y === 89 && el.x === 6 && el.color === '#8E9AAC';
  const isCap = (el) => !!el.cap || isLegacyBg(el) || isLegacyTitle(el) || isLegacySub(el);

  /* 현재 장면의 자막 상태 */
  function detect(scene) {
    if (!scene || !Array.isArray(scene.elements)) return { preset: 'none', title: '', sub: '' };
    const els = scene.elements;
    const marked = els.find((el) => el.cap);
    let preset = marked ? marked.cap : (els.some(isLegacyBg) ? 'bar-bottom' : 'none');
    let title = '', sub = '';
    for (const el of els) {
      if (el.capRole === 'title' || (!el.cap && isLegacyTitle(el))) title = el.text || '';
      if (el.capRole === 'sub' || (!el.cap && isLegacySub(el))) sub = el.text || '';
    }
    return { preset, title, sub };
  }

  /* 자막 교체 — 기존 문구 유지, 자막 외 요소는 건드리지 않음 */
  function apply(scene, presetId, texts) {
    const p = byId(presetId);
    if (!scene || !p) return { ok: false, why: '알 수 없는 프리셋' };
    const cur = detect(scene);
    const t = (texts && texts.title != null ? texts.title : cur.title) || '제목을 입력하세요';
    const s = (texts && texts.sub != null ? texts.sub : cur.sub) || '한 줄 설명을 쓰세요';
    scene.elements = scene.elements.filter((el) => !isCap(el));
    if (presetId !== 'none') scene.elements.push(...p.build(t, s));
    return { ok: true, preset: presetId, title: t, sub: s };
  }

  /* 결정론 감사 — 전 프리셋: id 유일·문자열 fill만·문구 왕복 보존 */
  function audit() {
    const ids = PRESETS.map((p) => p.id);
    if (new Set(ids).size !== ids.length) return { ok: false, why: 'id 중복' };
    for (const p of PRESETS) {
      const els = p.build('T', 'S');
      for (const el of els) {
        if (el.fill != null && typeof el.fill !== 'string') return { ok: false, why: p.id + ': fill 비문자열' };
        if (!el.cap || el.cap !== p.id) return { ok: false, why: p.id + ': cap 마킹 누락' };
      }
      const sc = { id: 'a', elements: els.map((e) => ({ ...e })) };
      const d = detect(sc);
      if (p.id !== 'none' && (d.preset !== p.id || d.title !== 'T' || d.sub !== 'S')) return { ok: false, why: p.id + ': 왕복 불일치' };
    }
    return { ok: true, presets: PRESETS.length };
  }

  return { PRESETS, byId, detect, apply, audit, isCap };
})();
