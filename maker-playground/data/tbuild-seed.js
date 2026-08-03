/* ============================================================
   Template Builder Seed (R64 §22) — Builder 조작만으로 4종 제작
   ------------------------------------------------------------
   지시서 §22: 「이 4개 템플릿을 만들기 위해 렌더링 코드를 새로 작성하면
   안 된다. Builder 와 Registry 조합만 사용한다.」
   이 파일에는 렌더러·씬 코드가 없다 — MK_TBUILD API 호출(=Builder 조작의
   스크립트 기록)과 Registry id 선택뿐이다. 멱등: 이미 있으면 건너뛴다.
   A. 슬라이드쇼 · 미니멀 — 느린 감성 (full-media·framed-center, fade+KB)
   B. 슬라이드쇼 · 볼드   — 빠른 SNS (split·collage 포함, slide·wipe·zoom)
   C. 비포애프터 · 미니멀 — 정돈 비교 (side-by-side, fade-between)
   D. 비포애프터 · 볼드   — 강한 변화 (wipe-vertical, 큰 전/후 라벨)
   ============================================================ */
(() => {
  'use strict';
  const B = window.MK_TBUILD;
  if (!B) return;

  /* 부팅 재등록 — 저장돼 있던 Ready 템플릿을 갤러리에 복원 (§20) */
  B.restore();

  const has = (name) => B.list().some((t) => t.name === name);
  const byName = (name) => B.list().find((t) => t.name === name);

  function mkA() {
    if (has('느린 필름')) return;
    const id = B.create({ name: '느린 필름', composition: 'slideshow', theme: 'th-minimal', ratio: '16:9' });
    B.setInfo(id, { purpose: '감성적이고 느린 사진 영상', tags: ['감성', '느림', '앨범'], thumbnail: 'framed-center', gallery: true });
    B.setScene(id, 'sc-title', { animation: 'fade', duration: { default: 3.6, max: 5 } });
    B.setScene(id, 'sc-media', { animation: 'fade', duration: { default: 4, min: 3, max: 7 } });
    B.setScene(id, 'sc-outro', { animation: 'fade', duration: { default: 3 } });
    /* 느린 순환 — full-media·framed-center 중심 (KB idle 은 엔진 배정) */
    B.setRules(id, [
      { when: { ratio: '16:9' }, cycle: ['full-media', 'framed-center'] },
      { when: { ratio: '9:16' }, cycle: ['full-media', 'framed-center'] },
      { when: {}, cycle: ['full-media', 'framed-center'] },
      { caption: { demoteWithout: true, promoteWith: false } },
      { noRepeatRun: 3 },
    ]);
    B.publish(id);
  }

  function mkB() {
    if (has('스냅 비트')) return;
    const id = B.create({ name: '스냅 비트', composition: 'slideshow', theme: 'th-bold', ratio: '9:16' });
    B.setInfo(id, { purpose: '빠른 SNS 영상 — 분할·콜라주 리듬', tags: ['SNS', '빠름', '쇼츠'], thumbnail: 'collage', gallery: true,
      supportedRatios: ['16:9', '9:16', '1:1', '4:5'] });
    B.setScene(id, 'sc-title', { animation: 'zoom', duration: { default: 2, min: 1.5, max: 3 } });
    B.setScene(id, 'sc-media', { animation: 'slide', duration: { default: 2.2, min: 1.5, max: 4 } });
    B.setScene(id, 'sc-high', { animation: 'mask' });
    B.setScene(id, 'sc-outro', { animation: 'pop', duration: { default: 2 } });
    B.setRules(id, [
      { when: { ratio: '16:9' }, cycle: ['full-media', 'media-left', 'hero'] },
      { when: { ratio: '9:16' }, cycle: ['full-media', 'hero'] },
      { when: {}, cycle: ['full-media', 'hero'] },
      /* 분할(pair)·콜라주 리듬 — 빠른 SNS 감각 (§22-B) */
      { when: { minMedia: 6 }, cycleLen: 5, mix: [
        { slot: 1, layout: 'pair', take: 2, minLeft: 3 },
        { slot: 3, layout: 'collage', take: 3, minLeft: 4 },
      ] },
      { pairByRatio: { '9:16': 'stack', '4:5': 'stack' }, default: 'split' },
      { caption: { demoteWithout: true, promoteWith: true } },
      { noRepeatRun: 2 },
    ]);
    B.publish(id);
  }

  function mkC() {
    if (has('차분한 비교')) return;
    const id = B.create({ name: '차분한 비교', composition: 'beforeafter', theme: 'th-minimal', ratio: '16:9' });
    B.setInfo(id, { purpose: '정돈된 전후 비교 — 좌우 나란히·서서히 겹침', tags: ['비교', '차분'], thumbnail: 'split', gallery: true,
      defaults: { method: 'side-by-side' } });
    B.setScene(id, 'ba-intro', { animation: 'fade', duration: { default: 2.4 } });
    B.setScene(id, 'ba-solo', { duration: { default: 2.8, max: 4 } });
    B.setScene(id, 'ba-split-h', { duration: { default: 4.5, max: 6 } });
    B.publish(id);
  }

  function mkD() {
    if (has('임팩트 체인지')) return;
    const id = B.create({ name: '임팩트 체인지', composition: 'beforeafter', theme: 'th-bold', ratio: '9:16' });
    B.setInfo(id, { purpose: '강한 변화 강조 — 세로 닦아내기·큰 전/후 라벨', tags: ['비교', '임팩트', '쇼츠'], thumbnail: 'stack', gallery: true,
      defaults: { method: 'wipe-vertical' } });
    B.setScene(id, 'ba-intro', { animation: 'pop', duration: { default: 1.8, min: 1.5, max: 2.5 } });
    B.setScene(id, 'ba-solo', { duration: { default: 2, min: 1.5, max: 3 } });
    /* 큰 라벨 — 전/후 라벨 슬롯 크기를 볼드로 (§22-D) */
    B.setTextSlot(id, 'ba-solo', 'lb', { role: 'headline', maxCh: 4, frame: { x: 5, y: 6, w: 30 } });
    B.setTextSlot(id, 'ba-transform', 'la', { role: 'headline', maxCh: 4, frame: { x: 5, y: 6, w: 30 } });
    B.setScene(id, 'ba-transform', { duration: { default: 3.4, max: 4 } });
    B.publish(id);
  }

  try { mkA(); mkB(); mkC(); mkD(); } catch (e) { /* 시드 실패는 조용히 — audit 이 잡는다 */ }

  /* 시드 후 Ready 인데 미등록인 항목 복구 재시도 없음 — 정직 상태 유지 */
})();
