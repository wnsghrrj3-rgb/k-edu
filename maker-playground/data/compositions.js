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

  /* ================= Composition 1 · Photo Slideshow (R60 v2) ================= */
  /* 지시서 2단계 §8: 미디어 수별 구성(1/2/3~5/6~15/16+) · variant 8종 · 비율별 우선순위
     · 같은 레이아웃 3회 연속 금지 · 미디어별 캡션 · 캡션 없으면 빈 박스 미노출 */
  C.registerComposition({
    id: 'cx-slideshow', name: '포토 슬라이드쇼', category: '사진 영상',
    purpose: '여행·가족·행사·학교 활동 사진을 영상으로',
    recommendedMediaCount: { min: 3, max: 20, ideal: 8 },
    recommendedDuration: { min: 10, max: 90, default: 30 },
    defaultRatio: '16:9',
    audio: { synth: 'beat' },
    reserveTail: 1, /* 마지막 1장은 Highlight 몫 */

    /* ---- variant 8종 정의 (지시서 §8-4) — 프레임은 비율별 override ---- */
    variantDefs: {
      'full-bleed': { base: { m: [{ x: 0, y: 0, w: 100, h: 100 }] } },
      'framed-center': {
        base: { m: [{ x: 8, y: 8, w: 84, h: 66, radius: 12 }], cap: { x: 8, y: 80, w: 84, align: 'center', maxCh: 20, maxLines: 1 } },
        byRatio: {
          '9:16': { m: [{ x: 6, y: 14, w: 88, h: 54, radius: 12 }], cap: { x: 8, y: 72, w: 84, align: 'center', maxCh: 16, maxLines: 1 } },
          '1:1': { m: [{ x: 8, y: 8, w: 84, h: 62, radius: 12 }], cap: { x: 8, y: 76, w: 84, align: 'center', maxCh: 18, maxLines: 1 } },
          '4:5': { m: [{ x: 7, y: 8, w: 86, h: 60, radius: 12 }], cap: { x: 8, y: 73, w: 84, align: 'center', maxCh: 18, maxLines: 1 } },
        } },
      'media-left-caption-right': { needsCaption: true,
        base: { m: [{ x: 0, y: 0, w: 58, h: 100 }], cap: { x: 62, y: 42, w: 33, align: 'left', maxCh: 11, maxLines: 3 } } },
      'media-right-caption-left': { needsCaption: true,
        base: { m: [{ x: 42, y: 0, w: 58, h: 100 }], cap: { x: 5, y: 42, w: 33, align: 'left', maxCh: 11, maxLines: 3 } } },
      'highlight-zoom': { bg: 'dark',
        base: { m: [{ x: 10, y: 16, w: 80, h: 52, radius: 14 }], cap: { x: 8, y: 72, w: 84, align: 'center', maxCh: 16, maxLines: 1 } } },
      'split-two': { base: { m: [{ x: 0, y: 0, w: 49.5, h: 100 }, { x: 50.5, y: 0, w: 49.5, h: 100 }] } },
      'stacked-two': { base: { m: [{ x: 0, y: 0, w: 100, h: 49.5 }, { x: 0, y: 50.5, w: 100, h: 49.5 }] } },
      'collage-three': {
        base: { m: [{ x: 0, y: 0, w: 58, h: 100 }, { x: 59, y: 0, w: 41, h: 49 }, { x: 59, y: 51, w: 41, h: 49 }] },
        byRatio: {
          '9:16': { m: [{ x: 0, y: 0, w: 100, h: 49 }, { x: 0, y: 51, w: 49, h: 49 }, { x: 51, y: 51, w: 49, h: 49 }] },
          '4:5': { m: [{ x: 0, y: 0, w: 100, h: 49 }, { x: 0, y: 51, w: 49, h: 49 }, { x: 51, y: 51, w: 49, h: 49 }] },
        } },
    },

    /* ---- 배치 계획 (지시서 §8-3) — r장을 어떤 variant로 몇 장씩 ---- */
    mediaPlan(r, ratio, captions, start) {
      const cap = (k) => String((captions || [])[start + k] || '').trim();
      const singles = ({
        '16:9': ['full-bleed', 'media-left-caption-right', 'framed-center', 'media-right-caption-left'],
        '9:16': ['full-bleed', 'framed-center', 'highlight-zoom'],
        '1:1': ['framed-center', 'full-bleed'],
        '4:5': ['framed-center', 'full-bleed'],
      })[ratio] || ['full-bleed', 'framed-center'];
      const two = ({ '16:9': 'split-two', '1:1': 'split-two', '9:16': 'stacked-two', '4:5': 'stacked-two' })[ratio] || 'split-two';
      const seq = [];
      let used = 0, si = 0, lastV = null, run = 0;
      while (used < r) {
        const left = r - used;
        /* 16장 이상 = 2분할·3콜라주 리듬 섞기 — 미디어를 버리지 않고 흡수 (§8-3) */
        if (r >= 16) {
          const pos = seq.length % 6;
          if (pos === 2 && left >= 3) { seq.push({ variant: two, take: 2 }); used += 2; lastV = two; run = 1; continue; }
          if (pos === 5 && left >= 4) { seq.push({ variant: 'collage-three', take: 3 }); used += 3; lastV = 'collage-three'; run = 1; continue; }
        }
        /* 단일 — 순환 · 캡션형은 캡션 있을 때만 · 같은 레이아웃 3회 연속 금지 (§8-3·§8-4) */
        let v = singles[si % singles.length]; si++;
        const hasCap = !!cap(used);
        if (/caption/.test(v) && !hasCap) v = singles.find((x) => !/caption/.test(x)) || 'full-bleed';
        if (hasCap && v === 'full-bleed') /* 캡션 있는 사진 = 캡션 슬롯 있는 레이아웃으로 (§8-7) */
          v = singles.find((x) => /caption/.test(x)) || singles.find((x) => x !== 'full-bleed') || v;
        if (v === lastV && run >= 2) v = singles.find((x) => x !== lastV && (!/caption/.test(x) || cap(used))) || (lastV === 'full-bleed' ? 'framed-center' : 'full-bleed');
        if (v === lastV) run++; else { lastV = v; run = 1; }
        seq.push({ variant: v, take: 1 }); used++;
      }
      return seq;
    },

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
      { id: 'ss-photo', role: 'media', name: '사진', required: true, repeatable: true, usePlan: true,
        mediaPerScene: 1, mediaAnim: 'fade',
        duration: { default: 3, min: 2, max: 4, mode: 'media-aware' },
        singleFrame: { x: 0, y: 0, w: 100, h: 100 },
        mediaSlots: [{ id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }],
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
  /* ================= Composition 2 · Title + Media Story ================= */
  /* 항목 수만큼 미디어+설명 복제 · 사진 없는 항목=그래픽 중심 · CTA 없으면 생략 */
  C.registerComposition({
    id: 'cx-story', name: '소개 스토리', category: '홍보',
    purpose: '제품·기업·행사·수업 내용을 항목별로 소개',
    recommendedMediaCount: { min: 1, max: 12, ideal: 5 },
    recommendedDuration: { min: 15, max: 90, default: 40 },
    defaultRatio: '16:9', audio: { synth: 'calm' },
    sampleItems: [{ head: '특징 하나', body: '설명입니다' }, { head: '특징 둘', body: '설명입니다' }, { head: '특징 셋', body: '설명입니다' }],
    scenes: [
      { id: 'st-title', role: 'title', name: '메인 제목', required: true, bg: 'accent',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'content-aware' },
        textSlots: [
          { id: 't1', role: 'headline', bind: 'title', defaultText: '제목을 입력하세요', maxCh: 12, maxLines: 2, frame: { x: 8, y: 34, w: 84 }, align: 'center' },
          { id: 't2', role: 'body', bind: 'subtitle', required: false, maxCh: 22, maxLines: 1, frame: { x: 8, y: 62, w: 84 }, align: 'center' },
        ] },
      { id: 'st-item', role: 'media-text', name: '소개', required: true, repeatable: true, consumes: 'items',
        variants: ['base', 'mirror'], mediaAnim: 'slide',
        duration: { default: 3.5, min: 2.5, max: 6, mode: 'content-aware' },
        singleFrame: { x: 52, y: 10, w: 42, h: 80, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 52, y: 10, w: 42, h: 80, radius: 12 } }],
        layoutByRatio: { '9:16': {
          mediaSlots: [{ id: 'm1', required: false, frame: { x: 6, y: 8, w: 88, h: 42, radius: 12 } }],
          textSlots: [
            { id: 't1', role: 'subheadline', bind: 'head', maxCh: 12, maxLines: 2, frame: { x: 8, y: 56, w: 84 } },
            { id: 't2', role: 'body', bind: 'body', required: false, maxCh: 18, maxLines: 3, frame: { x: 8, y: 70, w: 84 } },
          ] } },
        textSlots: [
          { id: 't1', role: 'subheadline', bind: 'head', maxCh: 14, maxLines: 2, frame: { x: 7, y: 26, w: 40 } },
          { id: 't2', role: 'body', bind: 'body', required: false, maxCh: 20, maxLines: 4, frame: { x: 7, y: 46, w: 40 } },
        ] },
      { id: 'st-sum', role: 'section', name: '정리', required: false, needs: 'summary', bg: 'paper',
        duration: { default: 3, min: 2, max: 5, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'summary', maxCh: 18, maxLines: 3, frame: { x: 10, y: 38, w: 80 }, align: 'center' }] },
      { id: 'st-cta', role: 'call-to-action', name: 'CTA', required: false, needs: 'cta', bg: 'dark',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'cta', bind: 'cta', maxCh: 14, maxLines: 2, frame: { x: 8, y: 42, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 3 · Card News ================= */
  /* 항목당 카드 1장 · 긴 텍스트 자동 분할(엔진 overflow) · 진행 번호 표시 */
  C.registerComposition({
    id: 'cx-cardnews', name: '카드뉴스', category: 'SNS',
    purpose: '공지·정보·캠페인을 카드 단위로 전달',
    recommendedMediaCount: { min: 0, max: 8, ideal: 0 },
    recommendedDuration: { min: 15, max: 60, default: 30 },
    defaultRatio: '4:5', needsMedia: false, audio: { synth: 'calm' },
    sampleItems: [{ body: '첫 번째 소식' }, { body: '두 번째 소식' }, { body: '세 번째 소식' }],
    scenes: [
      { id: 'cn-cover', role: 'intro', name: '표지', required: true, bg: 'accent',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'content-aware' },
        textSlots: [
          { id: 't1', role: 'headline', bind: 'title', defaultText: '카드뉴스 제목', maxCh: 10, maxLines: 2, frame: { x: 8, y: 34, w: 84 }, align: 'center' },
          { id: 't2', role: 'caption', bind: 'subtitle', required: false, maxCh: 18, maxLines: 1, frame: { x: 8, y: 62, w: 84 }, align: 'center' },
        ] },
      { id: 'cn-card', role: 'list-item', name: '카드', required: true, repeatable: true, consumes: 'items',
        variants: ['base'], mediaAnim: 'fade',
        duration: { default: 3.5, min: 2.5, max: 6, mode: 'content-aware' },
        singleFrame: { x: 12, y: 8, w: 76, h: 38, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 12, y: 8, w: 76, h: 38, radius: 12 } }],
        textSlots: [
          { id: 'num', role: 'caption', autoNum: 'asc', maxCh: 4, maxLines: 1, frame: { x: 8, y: 6, w: 10 } },
          { id: 't1', role: 'body', bind: 'body', maxCh: 16, maxLines: 4, frame: { x: 10, y: 52, w: 80 }, align: 'center' },
        ] },
      { id: 'cn-emph', role: 'highlight', name: '강조', required: false, needs: 'emphasis', bg: 'dark',
        duration: { default: 3, min: 2.5, max: 4, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'emphasis', maxCh: 12, maxLines: 3, frame: { x: 10, y: 38, w: 80 }, align: 'center' }] },
      { id: 'cn-cta', role: 'call-to-action', name: '마무리', required: true, bg: 'accent',
        duration: { default: 2.5, min: 2, max: 3, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'cta', bind: 'cta', defaultText: '팔로우하고 소식 받아 보세요', maxCh: 14, maxLines: 2, frame: { x: 8, y: 42, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 4 · Before & After ================= */
  /* ================= Composition 4 · Before & After (R60 v2 — Pair 단위) ================= */
  /* 지시서 2단계 §9: 전후는 평면 배열이 아니라 쌍(ComparisonPair)으로 관리.
     비교 방식 = sequential·side-by-side·top-bottom·wipe-h/v·fade-between (비율별 지원표 — 엔진 METHODS_BY_RATIO).
     slider-reveal은 영상이 비대화형이라 정직 미지원(wipe가 그 역할). 누락 쌍 = 완성 비교로 위장 금지. */
  C.registerComposition({
    id: 'cx-beforeafter', name: '비포 & 애프터', category: '비교',
    purpose: '변화·개선·학습 결과를 전후로 비교',
    recommendedMediaCount: { min: 2, max: 12, ideal: 6 },
    recommendedDuration: { min: 10, max: 60, default: 25 },
    defaultRatio: '16:9', audio: { synth: 'beat' },
    pairMode: true,
    scenes: [
      { id: 'ba-intro', role: 'intro', name: '인트로', required: true, bg: 'dark',
        duration: { default: 2, min: 1.5, max: 2.5, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'headline', bind: 'title', defaultText: '변화의 순간', maxCh: 12, maxLines: 2, frame: { x: 8, y: 40, w: 84 }, align: 'center' }] },
      /* 전·후 단독 씬 — 동일 프레임·동일 라벨 위치 (§9-6 정렬) */
      { id: 'ba-solo', role: 'media', name: '장면', pairOnly: true, bg: 'dark',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'media-aware' },
        singleFrame: { x: 0, y: 0, w: 100, h: 100 },
        mediaSlots: [{ id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }],
        textSlots: [
          { id: 'lb', role: 'subheadline', bind: 'label', maxCh: 4, maxLines: 1, frame: { x: 5, y: 6, w: 20 } },
          { id: 'pt', role: 'caption', bind: 'pairTitle', required: false, maxCh: 16, maxLines: 1, frame: { x: 8, y: 84, w: 84 }, align: 'center' },
          { id: 'ic', role: 'caption', bind: 'incomplete', required: false, maxCh: 10, maxLines: 1, frame: { x: 66, y: 6, w: 29 }, align: 'right' },
        ] },
      /* 변신 씬 — 전 사진 위로 후 사진이 wipe/fade 리빌 (엔진이 슬롯별 anim 주입, KB 제외) */
      { id: 'ba-transform', role: 'transform', name: '변신', pairOnly: true, bg: 'dark',
        duration: { default: 3, min: 2.5, max: 4, mode: 'fixed' },
        mediaSlots: [
          { id: 'base', frame: { x: 0, y: 0, w: 100, h: 100 } },
          { id: 'reveal', required: false, frame: { x: 0, y: 0, w: 100, h: 100 } },
        ],
        textSlots: [{ id: 'la', role: 'subheadline', bind: 'label', maxCh: 4, maxLines: 1, frame: { x: 5, y: 6, w: 20 } }] },
      /* 좌우 비교 — 동일 크기·동일 fit·라벨 위치 통일 (§9-6) */
      { id: 'ba-split-h', role: 'comparison', name: '비교', pairOnly: true,
        duration: { default: 4, min: 3, max: 5, mode: 'fixed' },
        mediaSlots: [
          { id: 'before', frame: { x: 1.5, y: 8, w: 47.5, h: 74, radius: 10 } },
          { id: 'after', required: false, frame: { x: 51, y: 8, w: 47.5, h: 74, radius: 10 } },
        ],
        layoutByRatio: { '1:1': { mediaSlots: [
          { id: 'before', frame: { x: 2, y: 18, w: 47, h: 56, radius: 10 } },
          { id: 'after', required: false, frame: { x: 51, y: 18, w: 47, h: 56, radius: 10 } },
        ],
          textSlots: [
            { id: 'lb', role: 'caption', defaultText: '전', maxCh: 4, maxLines: 1, frame: { x: 4, y: 78, w: 20 } },
            { id: 'la', role: 'caption', defaultText: '후', maxCh: 4, maxLines: 1, frame: { x: 53, y: 78, w: 20 } },
            { id: 'rs', role: 'subheadline', bind: 'pairResult', required: false, maxCh: 16, maxLines: 1, frame: { x: 8, y: 6, w: 84 }, align: 'center' },
          ] } },
        textSlots: [
          { id: 'lb', role: 'caption', defaultText: '전', maxCh: 4, maxLines: 1, frame: { x: 4, y: 86, w: 20 } },
          { id: 'la', role: 'caption', defaultText: '후', maxCh: 4, maxLines: 1, frame: { x: 53, y: 86, w: 20 } },
          { id: 'rs', role: 'subheadline', bind: 'pairResult', required: false, maxCh: 16, maxLines: 1, frame: { x: 8, y: 1, w: 84 }, align: 'center' },
        ] },
      /* 상하 비교 — 9:16·4:5 (§9-5 비율별 기본) */
      { id: 'ba-split-v', role: 'comparison', name: '비교', pairOnly: true,
        duration: { default: 4, min: 3, max: 5, mode: 'fixed' },
        mediaSlots: [
          { id: 'before', frame: { x: 5, y: 4, w: 90, h: 44, radius: 10 } },
          { id: 'after', required: false, frame: { x: 5, y: 50, w: 90, h: 44, radius: 10 } },
        ],
        layoutByRatio: { '4:5': { mediaSlots: [
          { id: 'before', frame: { x: 4, y: 5, w: 92, h: 42, radius: 10 } },
          { id: 'after', required: false, frame: { x: 4, y: 52, w: 92, h: 42, radius: 10 } },
        ] } },
        textSlots: [
          { id: 'lb', role: 'caption', defaultText: '전', maxCh: 4, maxLines: 1, frame: { x: 8, y: 5.5, w: 12 } },
          { id: 'la', role: 'caption', defaultText: '후', maxCh: 4, maxLines: 1, frame: { x: 8, y: 51.5, w: 12 } },
        ] },
      { id: 'ba-result', role: 'highlight', name: '결과', required: false, needs: 'result', bg: 'accent',
        duration: { default: 3, min: 2, max: 4, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'result', maxCh: 14, maxLines: 2, frame: { x: 8, y: 42, w: 84 }, align: 'center' }] },
      { id: 'ba-outro', role: 'outro', name: '아웃트로', required: true, bg: 'dark',
        duration: { default: 2, min: 1.5, max: 2.5, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'caption', bind: 'credit', defaultText: 'K-MAKER로 만들었어요', maxCh: 20, maxLines: 1, frame: { x: 8, y: 46, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 5 · Ranking / List ================= */
  /* 항목 역순 카운트다운 · 1위 하이라이트 별도 씬 */
  C.registerComposition({
    id: 'cx-ranking', name: '랭킹 · 리스트', category: '리뷰',
    purpose: 'Top N·추천 목록·체크리스트',
    recommendedMediaCount: { min: 0, max: 10, ideal: 5 },
    recommendedDuration: { min: 15, max: 60, default: 35 },
    defaultRatio: '9:16', needsMedia: false, audio: { synth: 'beat' },
    sampleItems: [{ head: '삼위', body: '설명' }, { head: '이위', body: '설명' }, { head: '일위', body: '설명' }],
    scenes: [
      { id: 'rk-hook', role: 'intro', name: '훅', required: true, bg: 'dark',
        duration: { default: 2, min: 1.5, max: 3, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'headline', bind: 'title', defaultText: '오늘의 Top 리스트', maxCh: 10, maxLines: 2, frame: { x: 8, y: 38, w: 84 }, align: 'center' }] },
      { id: 'rk-item', role: 'list-item', name: '순위', required: true, repeatable: true, consumes: 'items',
        variants: ['base', 'mirror'], mediaAnim: 'slide',
        duration: { default: 3, min: 2.5, max: 5, mode: 'content-aware' },
        singleFrame: { x: 10, y: 26, w: 80, h: 40, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 10, y: 26, w: 80, h: 40, radius: 12 } }],
        textSlots: [
          { id: 'num', role: 'number', autoNum: 'desc', maxCh: 3, maxLines: 1, frame: { x: 6, y: 6, w: 20 } },
          { id: 't1', role: 'subheadline', bind: 'head', maxCh: 12, maxLines: 2, frame: { x: 8, y: 70, w: 84 } },
          { id: 't2', role: 'body', bind: 'body', required: false, maxCh: 16, maxLines: 2, frame: { x: 8, y: 82, w: 84 } },
        ] },
      { id: 'rk-top', role: 'highlight', name: '1위 하이라이트', required: false, needs: 'top', bg: 'accent',
        duration: { default: 4, min: 3, max: 5, mode: 'content-aware' },
        textSlots: [
          { id: 'n1', role: 'number', defaultText: '1', maxCh: 2, maxLines: 1, frame: { x: 8, y: 10, w: 20 } },
          { id: 't1', role: 'headline', bind: 'top', maxCh: 10, maxLines: 2, frame: { x: 8, y: 40, w: 84 }, align: 'center' },
        ] },
      { id: 'rk-out', role: 'outro', name: '마무리', required: true, bg: 'dark',
        duration: { default: 2, min: 1.5, max: 3, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'cta', bind: 'cta', defaultText: '여러분의 1위는?', maxCh: 12, maxLines: 2, frame: { x: 8, y: 42, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 6 · Timeline / Progress ================= */
  C.registerComposition({
    id: 'cx-timeline', name: '타임라인', category: '스토리',
    purpose: '과정·성장·일정·제작기를 순서대로',
    recommendedMediaCount: { min: 2, max: 15, ideal: 6 },
    recommendedDuration: { min: 15, max: 90, default: 40 },
    defaultRatio: '16:9', audio: { synth: 'calm' },
    scenes: [
      { id: 'tl-title', role: 'title', name: '제목', required: true, bg: 'accent',
        duration: { default: 2.5, min: 2, max: 3, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'headline', bind: 'title', defaultText: '우리의 여정', maxCh: 12, maxLines: 2, frame: { x: 8, y: 38, w: 84 }, align: 'center' }] },
      { id: 'tl-item', role: 'timeline-item', name: '단계', required: true, repeatable: true,
        mediaPerScene: 1, variants: ['base', 'mirror'], mediaAnim: 'slide',
        duration: { default: 3, min: 2.5, max: 4.5, mode: 'media-aware' },
        singleFrame: { x: 34, y: 8, w: 60, h: 80, radius: 12 },
        mediaSlots: [{ id: 'm1', frame: { x: 34, y: 8, w: 60, h: 80, radius: 12 } }],
        layoutByRatio: { '9:16': {
          mediaSlots: [{ id: 'm1', frame: { x: 6, y: 16, w: 88, h: 56, radius: 12 } }],
          textSlots: [
            { id: 'num', role: 'caption', autoNum: 'asc', maxCh: 3, maxLines: 1, frame: { x: 6, y: 5, w: 12 } },
            { id: 't1', role: 'subheadline', bind: 'step', defaultText: '이 단계의 이야기', maxCh: 14, maxLines: 2, frame: { x: 6, y: 76, w: 88 } },
          ] } },
        textSlots: [
          { id: 'num', role: 'number', autoNum: 'asc', maxCh: 3, maxLines: 1, frame: { x: 6, y: 8, w: 14 } },
          { id: 't1', role: 'subheadline', bind: 'step', defaultText: '이 단계의 이야기', maxCh: 10, maxLines: 3, frame: { x: 6, y: 42, w: 24 } },
        ] },
      { id: 'tl-final', role: 'highlight', name: '결실', required: false, needs: 'media', bg: 'dark',
        duration: { default: 4, min: 3, max: 5, mode: 'fixed' },
        mediaSlots: [{ id: 'm1', frame: { x: 10, y: 10, w: 80, h: 62, radius: 12 } }],
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'finale', defaultText: '그리고 지금', maxCh: 14, maxLines: 1, frame: { x: 8, y: 80, w: 84 }, align: 'center' }] },
    ],
    reserveTail: 1,
  });

  /* ================= Composition 7 · Interview / Q&A ================= */
  /* 질문·답변 = 1쌍 1씬 · 긴 답변은 엔진이 다음 씬으로 자동 분할 */
  C.registerComposition({
    id: 'cx-qa', name: '인터뷰 · Q&A', category: '교육',
    purpose: '인터뷰·후기·FAQ·교육 문답',
    recommendedMediaCount: { min: 0, max: 6, ideal: 1 },
    recommendedDuration: { min: 15, max: 90, default: 40 },
    defaultRatio: '16:9', needsMedia: false, audio: { synth: 'calm' },
    sampleItems: [{ q: '질문 하나?', a: '답변입니다' }, { q: '질문 둘?', a: '답변입니다' }],
    scenes: [
      { id: 'qa-intro', role: 'intro', name: '소개', required: true, bg: 'accent',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'content-aware' },
        singleFrame: { x: 62, y: 14, w: 30, h: 72, radius: 999 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 62, y: 14, w: 30, h: 72, radius: 999 } }],
        textSlots: [
          { id: 't1', role: 'headline', bind: 'title', defaultText: '인터뷰', maxCh: 10, maxLines: 2, frame: { x: 8, y: 34, w: 48 } },
          { id: 't2', role: 'caption', bind: 'guest', required: false, maxCh: 16, maxLines: 1, frame: { x: 8, y: 60, w: 48 } },
        ] },
      { id: 'qa-pair', role: 'media-text', name: '문답', required: true, repeatable: true, consumes: 'items',
        variants: ['base'], mediaAnim: 'fade',
        duration: { default: 4, min: 3, max: 7, mode: 'content-aware' },
        singleFrame: { x: 70, y: 60, w: 22, h: 34, radius: 999 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 70, y: 60, w: 22, h: 34, radius: 999 } }],
        textSlots: [
          { id: 'q', role: 'subheadline', bind: 'q', maxCh: 16, maxLines: 2, frame: { x: 8, y: 14, w: 84 } },
          { id: 'a', role: 'body', bind: 'a', maxCh: 20, maxLines: 4, frame: { x: 8, y: 40, w: 84 } },
        ] },
      { id: 'qa-quote', role: 'quote', name: '핵심 문장', required: false, needs: 'quote', bg: 'dark',
        duration: { default: 3.5, min: 3, max: 5, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'quote', maxCh: 14, maxLines: 3, frame: { x: 10, y: 36, w: 80 }, align: 'center' }] },
      { id: 'qa-out', role: 'outro', name: '마무리', required: true, bg: 'accent',
        duration: { default: 2, min: 1.5, max: 3, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'caption', bind: 'credit', defaultText: '함께해 주셔서 고마워요', maxCh: 18, maxLines: 1, frame: { x: 8, y: 46, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 8 · Problem → Solution ================= */
  /* 문제(어두움)→해결(밝음) 분위기 전환 · 없는 단계 자동 생략 */
  C.registerComposition({
    id: 'cx-problem', name: '문제 → 해결', category: '비즈니스',
    purpose: '광고·제안·수업 설명의 논리 흐름',
    recommendedMediaCount: { min: 0, max: 8, ideal: 2 },
    recommendedDuration: { min: 15, max: 60, default: 30 },
    defaultRatio: '16:9', needsMedia: false, audio: { synth: 'beat' },
    scenes: [
      { id: 'ps-hook', role: 'intro', name: '훅', required: true, bg: 'dark',
        duration: { default: 2, min: 1.5, max: 3, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'headline', bind: 'hook', defaultText: '이런 적 있나요?', maxCh: 12, maxLines: 2, frame: { x: 8, y: 40, w: 84 }, align: 'center' }] },
      { id: 'ps-problem', role: 'section', name: '문제', required: true, bg: 'dark',
        duration: { default: 3.5, min: 2.5, max: 6, mode: 'content-aware' },
        singleFrame: { x: 54, y: 12, w: 40, h: 76, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 54, y: 12, w: 40, h: 76, radius: 12 } }],
        textSlots: [
          { id: 'l', role: 'caption', defaultText: '문제', maxCh: 4, maxLines: 1, frame: { x: 8, y: 12, w: 20 } },
          { id: 't1', role: 'subheadline', bind: 'problem', defaultText: '무엇이 불편한가요', maxCh: 14, maxLines: 3, frame: { x: 8, y: 30, w: 42 } },
        ] },
      { id: 'ps-solution', role: 'section', name: '해결', required: true, bg: 'accent',
        duration: { default: 3.5, min: 2.5, max: 6, mode: 'content-aware' },
        singleFrame: { x: 54, y: 12, w: 40, h: 76, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 54, y: 12, w: 40, h: 76, radius: 12 } }],
        textSlots: [
          { id: 'l', role: 'caption', defaultText: '해결', maxCh: 4, maxLines: 1, frame: { x: 8, y: 12, w: 20 } },
          { id: 't1', role: 'subheadline', bind: 'solution', defaultText: '이렇게 해결해요', maxCh: 14, maxLines: 3, frame: { x: 8, y: 30, w: 42 } },
        ] },
      { id: 'ps-result', role: 'highlight', name: '결과 수치', required: false, needs: 'metric', bg: 'paper',
        duration: { default: 3, min: 2.5, max: 4, mode: 'fixed' },
        textSlots: [
          { id: 'n', role: 'number', bind: 'metric', maxCh: 6, maxLines: 1, frame: { x: 8, y: 26, w: 84 }, align: 'center' },
          { id: 't1', role: 'body', bind: 'metricDesc', required: false, maxCh: 18, maxLines: 2, frame: { x: 8, y: 58, w: 84 }, align: 'center' },
        ] },
      { id: 'ps-cta', role: 'call-to-action', name: 'CTA', required: false, needs: 'cta', bg: 'dark',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'fixed' },
        textSlots: [{ id: 't1', role: 'cta', bind: 'cta', maxCh: 14, maxLines: 2, frame: { x: 8, y: 42, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 9 · Review / Testimonial ================= */
  C.registerComposition({
    id: 'cx-review', name: '리뷰 · 후기', category: '리뷰',
    purpose: '제품·장소·서비스 경험 공유',
    recommendedMediaCount: { min: 1, max: 12, ideal: 6 },
    recommendedDuration: { min: 20, max: 90, default: 40 },
    defaultRatio: '9:16', audio: { synth: 'calm' },
    sampleItems: [{ head: '장점 하나', body: '좋았어요' }, { head: '장점 둘', body: '좋았어요' }],
    scenes: [
      { id: 'rv-intro', role: 'intro', name: '소개', required: true, bg: 'dark',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'content-aware' },
        singleFrame: { x: 0, y: 0, w: 100, h: 100 },
        mediaSlots: [{ id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }],
        textSlots: [{ id: 't1', role: 'headline', bind: 'title', defaultText: '오늘의 리뷰', maxCh: 12, maxLines: 2, frame: { x: 8, y: 74, w: 84 } }] },
      { id: 'rv-point', role: 'media-text', name: '장점', required: true, repeatable: true, consumes: 'items',
        variants: ['base', 'mirror'], mediaAnim: 'slide',
        duration: { default: 3, min: 2.5, max: 5, mode: 'content-aware' },
        singleFrame: { x: 8, y: 8, w: 84, h: 48, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 8, y: 8, w: 84, h: 48, radius: 12 } }],
        textSlots: [
          { id: 't1', role: 'subheadline', bind: 'head', maxCh: 12, maxLines: 2, frame: { x: 8, y: 62, w: 84 } },
          { id: 't2', role: 'body', bind: 'body', required: false, maxCh: 18, maxLines: 3, frame: { x: 8, y: 76, w: 84 } },
        ] },
      { id: 'rv-weak', role: 'section', name: '아쉬운 점', required: false, needs: 'weakness', bg: 'paper',
        duration: { default: 3, min: 2.5, max: 4.5, mode: 'content-aware' },
        textSlots: [
          { id: 'l', role: 'caption', defaultText: '아쉬운 점 · 팁', maxCh: 10, maxLines: 1, frame: { x: 8, y: 16, w: 60 } },
          { id: 't1', role: 'body', bind: 'weakness', maxCh: 18, maxLines: 4, frame: { x: 8, y: 32, w: 84 } },
        ] },
      { id: 'rv-rating', role: 'highlight', name: '평점', required: false, needs: 'rating', bg: 'accent',
        duration: { default: 3, min: 2.5, max: 4, mode: 'fixed' },
        textSlots: [
          { id: 'n', role: 'number', bind: 'rating', maxCh: 5, maxLines: 1, frame: { x: 8, y: 30, w: 84 }, align: 'center' },
          { id: 't1', role: 'caption', defaultText: '나의 평점', maxCh: 8, maxLines: 1, frame: { x: 8, y: 58, w: 84 }, align: 'center' },
        ] },
      { id: 'rv-out', role: 'call-to-action', name: '추천', required: true, bg: 'dark',
        duration: { default: 2.5, min: 2, max: 3.5, mode: 'content-aware' },
        textSlots: [{ id: 't1', role: 'cta', bind: 'recommend', defaultText: '이런 분께 추천해요', maxCh: 14, maxLines: 2, frame: { x: 8, y: 42, w: 84 }, align: 'center' }] },
    ],
  });

  /* ================= Composition 10 · Narrative Story ================= */
  /* 내용 적으면 3단 축소 · 많으면 전개 반복 · 전환점 강조 */
  C.registerComposition({
    id: 'cx-narrative', name: '이야기', category: '스토리',
    purpose: '시작·전개·전환·결말이 있는 짧은 이야기',
    recommendedMediaCount: { min: 2, max: 15, ideal: 7 },
    recommendedDuration: { min: 20, max: 120, default: 50 },
    defaultRatio: '16:9', audio: { synth: 'calm' },
    reserveTail: 2, /* 전환점 1 + 결말 1 */
    scenes: [
      { id: 'nr-open', role: 'intro', name: '시작', required: true,
        duration: { default: 3, min: 2, max: 4, mode: 'content-aware' },
        singleFrame: { x: 0, y: 0, w: 100, h: 100 },
        mediaSlots: [{ id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }],
        textSlots: [{ id: 't1', role: 'headline', bind: 'title', defaultText: '이야기의 시작', maxCh: 12, maxLines: 2, frame: { x: 8, y: 72, w: 84 } }] },
      { id: 'nr-dev', role: 'media', name: '전개', required: true, repeatable: true,
        mediaPerScene: 1, variants: ['base', 'mirror'], mediaAnim: 'fade',
        duration: { default: 3, min: 2, max: 4.5, mode: 'media-aware' },
        singleFrame: { x: 0, y: 0, w: 100, h: 100 },
        mediaSlots: [{ id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }] },
      { id: 'nr-turn', role: 'highlight', name: '전환점', required: false, needs: 'media', bg: 'dark',
        duration: { default: 4, min: 3, max: 5, mode: 'fixed' },
        mediaSlots: [{ id: 'm1', frame: { x: 8, y: 8, w: 84, h: 62, radius: 12 } }],
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'turning', defaultText: '그때, 모든 것이 달라졌다', maxCh: 16, maxLines: 2, frame: { x: 8, y: 78, w: 84 }, align: 'center' }] },
      { id: 'nr-end', role: 'outro', name: '결말', required: true, bg: 'dark',
        duration: { default: 3, min: 2, max: 4, mode: 'content-aware' },
        singleFrame: { x: 26, y: 10, w: 48, h: 56, radius: 12 },
        mediaSlots: [{ id: 'm1', required: false, frame: { x: 26, y: 10, w: 48, h: 56, radius: 12 } }],
        textSlots: [{ id: 't1', role: 'subheadline', bind: 'ending', defaultText: '이야기는 계속됩니다', maxCh: 14, maxLines: 2, frame: { x: 8, y: 76, w: 84 }, align: 'center' }] },
    ],
  });
})();
