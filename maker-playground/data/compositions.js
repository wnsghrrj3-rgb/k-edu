/* ============================================================
   MK_COMPOSE 정의부 (R50 골든 샘플 → R51 10종 확장 예정)
   ------------------------------------------------------------
   Composition = 영상 구조 · Theme = 시각 디자인 (지시서 §2-1)
   같은 Composition에 Theme만 갈아 끼우면 새 템플릿.
   ============================================================ */
(() => {
  'use strict';
  const C = window.MK_COMPOSE;

  /* ================= Themes ================= */
  C.registerTheme({
    id: 'th-minimal', name: '미니멀', mood: 'calm',
    transitions: ['fade', 'fade', 'dissolve'],
    musicName: '잔잔한 아르페지오',
    tokens: {
      paper: '#F7F6F2', dark: '#1B2430', accent: '#2F6B54', ink: '#22302B', onDark: '#F5F7FA',
      type: {
        headline: { size: 7.2, weight: 800 }, subheadline: { size: 3.4, weight: 600 },
        body: { size: 2.8, weight: 400 }, caption: { size: 2.2, weight: 400, color: '#8E9AAC' },
        number: { size: 9, weight: 800 }, cta: { size: 4.2, weight: 800 },
      },
    },
  });
  C.registerTheme({
    id: 'th-bold', name: '볼드', mood: 'energetic',
    transitions: ['slide', 'fade', 'push'],
    musicName: '신나는 비트',
    tokens: {
      paper: '#FFFFFF', dark: '#141019', accent: '#D97757', ink: '#1C1C28', onDark: '#FFF7F2',
      type: {
        headline: { size: 8.4, weight: 800 }, subheadline: { size: 3.6, weight: 700 },
        body: { size: 3.0, weight: 500 }, caption: { size: 2.2, weight: 500, color: '#9A8F9E' },
        number: { size: 11, weight: 800 }, cta: { size: 4.6, weight: 800 },
      },
    },
  });

  /* ================= Composition 1 · Photo Slideshow ================= */
  /* 지시서 §5-1: Intro → Title → Photo 반복(분할 대응) → Highlight → Outro
     사진 1~2장=하이라이트 축소 · 16+ =2분할 · 제목 없으면 Title 생략 */
  C.registerComposition({
    id: 'cx-slideshow', name: '포토 슬라이드쇼', category: '사진 영상',
    purpose: '여행·가족·행사·학교 활동 사진을 영상으로',
    recommendedMediaCount: { min: 3, max: 20, ideal: 8 },
    recommendedDuration: { min: 10, max: 90, default: 30 },
    defaultRatio: '16:9',
    audio: { synth: 'beat' },
    reserveTail: 1, /* 마지막 1장은 Highlight 몫 */
    scenes: [
      { id: 'ss-intro', role: 'intro', name: '인트로', required: true, bg: 'dark',
        duration: { default: 2, min: 1.5, max: 2.5, mode: 'fixed' },
        textSlots: [
          { id: 't1', role: 'caption', bind: 'date', defaultText: '우리의 순간', maxCh: 14, maxLines: 1, frame: { x: 10, y: 42, w: 80 }, align: 'center' },
        ] },
      { id: 'ss-title', role: 'title', name: '제목', required: false, needs: 'title', bg: 'accent',
        duration: { default: 2.5, min: 2, max: 3, mode: 'content-aware' },
        textSlots: [
          { id: 't1', role: 'headline', bind: 'title', maxCh: 12, maxLines: 2, frame: { x: 8, y: 36, w: 84 }, align: 'center' },
          { id: 't2', role: 'body', bind: 'subtitle', defaultText: '', required: false, maxCh: 22, maxLines: 1, frame: { x: 8, y: 62, w: 84 }, align: 'center' },
        ] },
      { id: 'ss-photo', role: 'media', name: '사진', required: true, repeatable: true,
        mediaPerScene: 1, multiThreshold: 16, multiSlots: 2,
        variants: ['base', 'mirror'], mediaAnim: 'fade',
        duration: { default: 3, min: 2, max: 4, mode: 'media-aware' },
        singleFrame: { x: 0, y: 0, w: 100, h: 100 },
        mediaSlots: [
          { id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } },
          { id: 'm2', required: false, frame: { x: 51, y: 0, w: 49, h: 100 } },
        ],
        layoutByRatio: { '9:16': { mediaSlots: [ { id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }, { id: 'm2', required: false, frame: { x: 0, y: 51, w: 100, h: 49 } } ] } },
        textSlots: [] },
      { id: 'ss-high', role: 'highlight', name: '하이라이트', required: false, needs: 'media', bg: 'dark',
        duration: { default: 4, min: 3, max: 5, mode: 'fixed' },
        mediaSlots: [{ id: 'm1', frame: { x: 6, y: 8, w: 88, h: 66, radius: 12 } }],
        layoutByRatio: { '9:16': { mediaSlots: [{ id: 'm1', frame: { x: 6, y: 14, w: 88, h: 52, radius: 12 } }],
          textSlots: [{ id: 't1', role: 'subheadline', bind: 'highlight', defaultText: '가장 빛난 순간', maxCh: 14, maxLines: 1, frame: { x: 8, y: 72, w: 84 }, align: 'center' }] } },
        textSlots: [
          { id: 't1', role: 'subheadline', bind: 'highlight', defaultText: '가장 빛난 순간', maxCh: 16, maxLines: 1, frame: { x: 8, y: 80, w: 84 }, align: 'center' },
        ] },
      { id: 'ss-outro', role: 'outro', name: '아웃트로', required: true, bg: 'accent',
        duration: { default: 2, min: 1.5, max: 3, mode: 'fixed' },
        textSlots: [
          { id: 't1', role: 'headline', bind: 'outro', defaultText: '고마워요', maxCh: 10, maxLines: 1, frame: { x: 8, y: 40, w: 84 }, align: 'center' },
          { id: 't2', role: 'caption', bind: 'credit', defaultText: 'K-MAKER로 만들었어요', maxCh: 20, maxLines: 1, frame: { x: 8, y: 58, w: 84 }, align: 'center' },
        ] },
    ],
  });
})();
