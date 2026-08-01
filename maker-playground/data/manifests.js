/* ============================================================
   Manifests (R63) — 기존 템플릿의 Manifest Migration
   ------------------------------------------------------------
   · tm-slideshow  — cx-slideshow 의 mediaPlan(코드)을 rules(데이터)로 이관.
     원본 함수는 _legacyMediaPlan 으로 보존되어 audit·테스트가
     "컴파일된 플랜 = 기존 플랜" 동일성을 전 비율×전 수량으로 검증한다.
   · tm-beforeafter — cx-beforeafter 를 Manifest 로 등재. 쌍 조립 순서는
     엔진 공통 로직(planPairs — 이미 씬 스펙·METHODS_BY_RATIO 데이터로
     매개변수화됨)이며, 구조·기본값·메타는 Manifest 가 소유한다(정직 표기).
   기존 기능 무손상: comp id·씬 스펙·갤러리 카드·buildProject 경로 그대로.
   ============================================================ */
(() => {
  'use strict';
  const M = window.MK_MANIFEST;
  if (!M) return;

  /* ---------- Photo Slideshow — rules 데이터가 유일한 배치 규칙 원천 ---------- */
  const r1 = M.takeover({
    id: 'tm-slideshow', version: '2.0.0', composition: 'cx-slideshow',
    meta: { name: '포토 슬라이드쇼', category: '사진 영상',
      purpose: '여행·가족·행사·학교 활동 사진을 영상으로', tags: ['사진', '슬라이드쇼', '앨범'] },
    theme: 'th-minimal', supportedRatios: ['16:9', '9:16', '1:1', '4:5'], defaultRatio: '16:9',
    rules: [
      /* 미디어 수별 구성 — "사진 16장 이상 = 2분할·3콜라주 리듬" 은 이제 데이터다 */
      { when: { minMedia: 16 }, cycleLen: 6,
        mix: [{ slot: 2, layout: 'pair', take: 2, minLeft: 3 }, { slot: 5, layout: 'collage', take: 3, minLeft: 4 }] },
      /* 비율별 단일 레이아웃 순환 */
      { when: { ratio: '16:9' }, cycle: ['full-media', 'media-left', 'framed-center', 'media-right'] },
      { when: { ratio: '9:16' }, cycle: ['full-media', 'framed-center', 'hero'] },
      { when: { ratio: '1:1' }, cycle: ['framed-center', 'full-media'] },
      { when: { ratio: '4:5' }, cycle: ['framed-center', 'full-media'] },
      { when: {}, cycle: ['full-media', 'framed-center'] },
      /* 2장 묶음 레이아웃 — 가로형=좌우, 세로형=상하 */
      { pairByRatio: { '16:9': 'split', '1:1': 'split', '9:16': 'stack', '4:5': 'stack' }, default: 'split' },
      /* 캡션 규칙 — 없으면 캡션형 회피, 있으면 캡션 슬롯 레이아웃 승격 */
      { caption: { demoteWithout: true, promoteWith: true } },
      /* 같은 레이아웃 3회 연속 금지 */
      { noRepeatRun: 2 },
    ],
  });
  if (!r1.ok) console.error('tm-slideshow migration 실패', r1.errors);

  /* ---------- Before & After — 쌍 구조 Manifest 등재 ---------- */
  const r2 = M.takeover({
    id: 'tm-beforeafter', version: '2.0.0', composition: 'cx-beforeafter',
    meta: { name: '비포 & 애프터', category: '비교',
      purpose: '전·후 쌍 비교 — 청소·공부·만들기·성장 기록', tags: ['비교', '전후', '변화'] },
    theme: 'th-bold', supportedRatios: ['16:9', '9:16', '1:1', '4:5'], defaultRatio: '16:9',
    defaults: { texts: {} },
    /* 쌍 조립(전 → 변신/후 → 나란히)은 엔진 공통 planPairs — 씬 스펙과
       METHODS_BY_RATIO 데이터로 구동. 배치 rules 는 해당 없음(정직). */
    rules: [],
  });
  if (!r2.ok) console.error('tm-beforeafter migration 실패', r2.errors);
})();
