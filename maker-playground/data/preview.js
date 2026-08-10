/* ============================================================
   MK_PREVIEW — R99 구조 카드 호버 미리보기: 목업이 아니라 진짜 빌드
   ------------------------------------------------------------
   준호: 「마우스를 올리면 어떤 디자인인지 미리보기처럼」.
   목업 이미지를 만들 필요가 없다 — 컴포지션마다 진짜 엔진
   (buildProject)으로 샘플을 지어 진짜 렌더러(MK_PLAY.sceneHTML,
   still)로 그리면, R98 장식·테마 토큰·레이아웃까지 실물 그대로
   나온다. 미리보기가 곧 제품의 정직한 자기소개가 된다.

   구성:
   · PLACEHOLDER 사진 = 인라인 SVG data URI 3색조 (외부 자산 0,
     분할·콜라주 레이아웃이 읽히도록 색이 번갈아 다름)
   · sampleInput(comp) — sampleItems 있으면 그것, 미디어 권장치
     (ideal, 6장 상한)만큼 자리 사진, 대표 텍스트
   · build(compId, themeId) — 캐시된 {ok, scenes, ratio}. 장면은
     대표 4장까지(표지 → 반복 1·2 → 마지막) 골라 담는다
   · 순수: 결정적 캐시 키, DOM 없음 — 팝오버·타이머는 화면 몫
   ============================================================ */
window.MK_PREVIEW = (() => {
  'use strict';
  const CACHE = new Map();

  /* 자리 사진 — 소프트 3색조 SVG (조명 그라디언트 + 원 글리프) */
  const PH_TONES = [['#DDE7E1', '#B9CFC4'], ['#E7E2DA', '#D2C6B4'], ['#DEE3EC', '#BFC9DC']];
  const phSrc = (i) => {
    const [a, b] = PH_TONES[i % PH_TONES.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
      `<rect width="160" height="120" fill="url(#g)"/>` +
      `<circle cx="${46 + (i % 3) * 34}" cy="46" r="17" fill="rgba(255,255,255,.55)"/>` +
      `<path d="M0 96 L52 64 L88 88 L120 70 L160 92 L160 120 L0 120 Z" fill="rgba(255,255,255,.35)"/></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  /* 샘플 입력 — 구조가 제 문법대로 지어지도록 (R97 재료 명세와 한 몸) */
  function sampleInput(comp) {
    const rc = comp.recommendedMediaCount || {};
    const n = Math.max(rc.min || 0, Math.min(rc.ideal || rc.min || 0, 6));
    const medias = Array.from({ length: n }, (_, i) => ({ name: '보기 ' + (i + 1), kind: 'image', src: phSrc(i) }));
    const texts = { title: comp.name, subtitle: '이런 느낌이에요' };
    /* 텍스트 정체성 필드 — 미리보기용 짧은 대표값 */
    const t = {
      'cx-problem': { hook: '이런 적 있나요?', problem: '무엇이 불편한가요', solution: '이렇게 해결해요', metric: '3배' },
      'cx-narrative': { turning: '그때, 달라졌다', ending: '이야기는 계속' },
      'cx-qa': { guest: '함께한 사람' },
      'cx-beforeafter': { result: '이렇게 달라졌어요' },
      'cx-ranking': { top: '오늘의 1위' },
      'cx-slideshow': { highlight: '가장 빛난 순간' },
    }[comp.id];
    if (t) Object.assign(texts, t);
    return { medias, texts, items: comp.sampleItems || null };
  }

  /* 대표 장면 고르기 — 표지 → 반복 1·2 → 마지막 (최대 4장) */
  function pickScenes(scenes) {
    if (scenes.length <= 4) return scenes;
    const seen = new Set(), reps = [];
    for (const s of scenes) { if (!seen.has(s.specId)) { seen.add(s.specId); reps.push(s); } }
    const out = [scenes[0]];
    const mid = reps.filter((s) => s !== scenes[0] && s !== scenes[scenes.length - 1]).slice(0, 2);
    out.push(...mid, scenes[scenes.length - 1]);
    return out.slice(0, 4);
  }

  function build(compId, themeId) {
    const C = window.MK_COMPOSE;
    if (!C) return { ok: false };
    const key = compId + '|' + (themeId || '');
    if (CACHE.has(key)) return CACHE.get(key);
    const comp = (C.getComposition && C.getComposition(compId)) || C.listCompositions().find((c) => c.id === compId);
    if (!comp) return { ok: false }; /* getComposition = 전체 정의 (sampleItems 포함) — 요약 폴백은 이름·비율만 */
    const theme = themeId || (C.listThemes()[0] || {}).id;
    let out;
    try {
      const r = C.buildProject(compId, theme, sampleInput(comp));
      out = r.ok ? { ok: true, scenes: pickScenes(r.doc.scenes), ratio: comp.defaultRatio || '16:9' } : { ok: false };
    } catch (e) { out = { ok: false }; }
    CACHE.set(key, out);
    return out;
  }

  const clear = () => CACHE.clear(); /* 테마 전환 시 화면이 부른다 — 키에 테마가 있어 필수는 아님 */

  /* 자가 검증 */
  const audit = () => {
    const v = [];
    if (!/^data:image\/svg\+xml/.test(phSrc(0))) v.push('자리사진 위반');
    if (phSrc(0) === phSrc(1)) v.push('색조 교대 위반');
    const scenes = Array.from({ length: 9 }, (_, i) => ({ specId: 's' + (i % 3), n: i }));
    const p = pickScenes(scenes);
    if (p.length !== 4 || p[0].n !== 0 || p[3].n !== 8) v.push('대표 장면 선정 위반');
    return { ok: !v.length, violations: v };
  };

  return { build, sampleInput, pickScenes, phSrc, clear, audit };
})();
