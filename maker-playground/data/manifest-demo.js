/* ============================================================
   Manifest Demo (R63) — 「추억 매거진」
   ------------------------------------------------------------
   완료 조건 시연: 이 파일에는 코드가 없다 — Manifest 데이터 하나와
   registerTemplate 호출 하나뿐이다. 이 파일을 추가하는 것만으로:
   · Video 허브 갤러리에 카드 자동 등록 (listCompositions 경유)
   · 카드 선택 → 테마 → 미디어 → buildProject → 에디터/재생/MP4 전부 동작
   · Scene 은 Layout Registry, 등장은 Animation Registry,
     배치 규칙은 rules(데이터), 시각은 Theme Registry 참조
   · Smart Variant: default / compact / magazine — 같은 Manifest 에서
     씬 구성과 레이아웃 순환이 달라진다
   ============================================================ */
(() => {
  'use strict';
  const M = window.MK_MANIFEST;
  if (!M) return;

  const r = M.registerTemplate({
    id: 'tm-magazine',
    version: '1.0.0',
    meta: {
      name: '추억 매거진', category: '매거진',
      purpose: '사진을 잡지 화보처럼 — 표지·화보 페이지·한 줄 문장·뒷표지',
      tags: ['매거진', '화보', '앨범', '기록'],
      recommendedMediaCount: { min: 2, max: 24, ideal: 10 },
      recommendedDuration: { min: 12, max: 90, default: 35 },
      thumbnail: 'framed-center', preview: '#/video',
    },
    theme: 'th-minimal',
    supportedRatios: ['16:9', '9:16', '1:1', '4:5'],
    defaultRatio: '16:9',
    audio: { synth: 'beat' },
    defaults: { texts: { credit: 'K-MAKER 매거진' } },

    /* ---- Scenes — Layout·Animation 은 Registry 참조만 ---- */
    scenes: [
      { id: 'mg-cover', role: 'intro', name: '표지', required: true, bg: 'dark', animation: 'pop',
        duration: { default: 3.2, min: 2, max: 5, mode: 'fixed' },
        texts: [
          { id: 't1', role: 'headline', bind: 'title', defaultText: '추억 매거진', maxCh: 10, maxLines: 2, frame: { x: 8, y: 34, w: 84 }, align: 'center' },
          { id: 't2', role: 'caption', bind: 'subtitle', required: false, maxCh: 18, maxLines: 1, frame: { x: 8, y: 62, w: 84 }, align: 'center' },
        ] },
      { id: 'mg-page', role: 'media', name: '화보', required: true, repeatable: true, usePlan: true, animation: 'fade',
        duration: { default: 3.4, min: 2.5, max: 6, mode: 'media-aware' } },
      { id: 'mg-quote', role: 'section', name: '한 줄 문장', required: false, needs: 'quote', bg: 'paper', animation: 'mask',
        duration: { default: 3, min: 2, max: 5, mode: 'content-aware' },
        texts: [
          { id: 't1', role: 'subheadline', bind: 'quote', maxCh: 16, maxLines: 2, frame: { x: 10, y: 40, w: 80 }, align: 'center' },
        ] },
      { id: 'mg-back', role: 'outro', name: '뒷표지', required: true, bg: 'accent', animation: 'fade',
        duration: { default: 2.8, min: 2, max: 4, mode: 'fixed' },
        texts: [
          { id: 't1', role: 'headline', bind: 'outro', defaultText: '다음 호에 계속', maxCh: 10, maxLines: 1, frame: { x: 8, y: 42, w: 84 }, align: 'center' },
          { id: 't2', role: 'caption', bind: 'credit', maxCh: 20, maxLines: 1, frame: { x: 8, y: 60, w: 84 }, align: 'center' },
        ] },
    ],

    /* ---- Rules — 미디어 수·비율·캡션 규칙 전부 데이터 ---- */
    rules: [
      { when: { ratio: '16:9' }, cycle: ['media-left', 'media-right', 'full-media', 'framed-center'] },
      { when: { ratio: '9:16' }, cycle: ['framed-center', 'full-media', 'hero'] },
      { when: { ratio: '1:1' }, cycle: ['framed-center', 'full-media'] },
      { when: { ratio: '4:5' }, cycle: ['framed-center', 'full-media'] },
      { when: {}, cycle: ['media-left', 'full-media'] },
      { when: { minMedia: 12 }, cycleLen: 6, mix: [{ slot: 3, layout: 'gallery', take: 4, minLeft: 5 }] },
      { pairByRatio: { '9:16': 'stack', '4:5': 'stack' }, default: 'split' },
      { caption: { demoteWithout: true, promoteWith: true } },
      { noRepeatRun: 2 },
    ],

    /* ---- Smart Variants — 씬 구성·레이아웃 순환이 달라진다 ---- */
    variants: {
      compact: {
        name: '컴팩트', skipScenes: ['mg-quote'],
        rules: [
          { when: {}, cycle: ['full-media'] },
          { caption: { demoteWithout: true, promoteWith: false } },
          { noRepeatRun: 99 },
        ],
      },
      magazine: {
        name: '화보 강조',
        rules: [
          { when: {}, cycle: ['media-left', 'media-right', 'framed-center'] },
          { when: { minMedia: 6 }, cycleLen: 4, mix: [{ slot: 2, layout: 'gallery', take: 4, minLeft: 5 }] },
          { caption: { demoteWithout: true, promoteWith: true } },
          { noRepeatRun: 2 },
        ],
      },
    },
  });
  if (!r.ok) console.error('tm-magazine 등록 실패', r.errors);
})();
