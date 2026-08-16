/* =============================================================
 * test_english_data.js — 아침영어 원장 불변식 검산 (node)
 *   설계 정본: handoff/설계-아침영어-v1.md §3(사다리 헌법)·§6(스키마)·§8(검사 계획)
 *   ① 구조: 학년별 일수 정확(g3=40) · d 연번 1..N
 *   ② 패턴 계획: PAT_PLAN 구간과 pat 필드 전수 일치 · 10패턴 전부 존재 · 구간 연속 피복
 *   ③ 필드: sent·ko·tiles·words 존재, ko 에 한국어 포함
 *   ④ tiles 왕복: tiles.join(' ') === sent (구두점 포함)
 *   ⑤ 토큰 대조: tokenize(sent) === words (순서까지)
 *   ⑥ 어휘 사다리 전수(헌법): 전 일차 × 전 단어 — 미배운 단어 노출 0.
 *      new ≤ 3 · new ⊆ 그날 words · new 에 기배운·화이트리스트 금지 · new 내 중복 금지
 *   ⑦ expand: 사다리 준수(그날 누적 기준) · 본문·타 expand 와 문장 중복 금지 · ko 존재
 *   ⑧ 문장 전역 중복 금지(본문 40문장 상호)
 * 실행: node kedu/quiz/test_english_data.js [원장경로]
 *   경로 인자는 역검증용(변조 사본 검사) — git 원복 함정(9.7차 기록)을 피한다.
 * ============================================================= */
const path = process.argv[2] || './templates/english_data.js';
const D = require(require('path').resolve(__dirname, path.startsWith('.') ? path : path));
let fail = 0, pass = 0;
const T = (c, m) => { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } };

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const EXPECT_DAYS = { 3: 40 };

D.grades().forEach(g => {
  const days = D.days(g);
  const plan = D.plan(g);

  /* ① 구조 */
  T(days.length === EXPECT_DAYS[g], `g${g} 일수 ${days.length} ≠ ${EXPECT_DAYS[g]}`);
  days.forEach((r, i) => T(r.d === i + 1, `g${g} d 연번 어긋남: index ${i} 에 d=${r.d}`));

  /* ② 패턴 계획 */
  T(plan.length === 10, `g${g} 패턴 수 ${plan.length} ≠ 10`);
  let cursor = 1;
  plan.forEach(p => {
    T(p.from === cursor, `g${g} ${p.pat} 시작 ${p.from} ≠ ${cursor} (구간 불연속)`);
    T(p.to >= p.from, `g${g} ${p.pat} 구간 역전`);
    cursor = p.to + 1;
  });
  T(cursor - 1 === days.length, `g${g} 패턴 구간 합 ${cursor - 1} ≠ 일수 ${days.length}`);
  days.forEach(r => {
    const p = plan.find(p => r.d >= p.from && r.d <= p.to);
    T(!!p && r.pat === p.pat, `g${g} d${r.d} pat=${r.pat} 이 계획(${p ? p.pat : '없음'})과 불일치`);
  });

  /* ③~⑤ 필드·왕복·토큰 */
  const hasKo = s => /[가-힣]/.test(String(s || ''));
  days.forEach(r => {
    T(typeof r.sent === 'string' && r.sent.length > 0, `g${g} d${r.d} sent 없음`);
    T(hasKo(r.ko), `g${g} d${r.d} ko 없음/한국어 아님`);
    T(Array.isArray(r.tiles) && r.tiles.length > 0 && r.tiles.every(t => t.length > 0), `g${g} d${r.d} tiles 불량`);
    T(r.tiles.join(' ') === r.sent, `g${g} d${r.d} tiles 왕복 실패: "${r.tiles.join(' ')}" ≠ "${r.sent}"`);
    T(deepEq(D.tokenize(r.sent), r.words), `g${g} d${r.d} 토큰 대조 실패: ${JSON.stringify(D.tokenize(r.sent))} ≠ ${JSON.stringify(r.words)}`);
  });

  /* ⑥ 어휘 사다리 전수(헌법) + ⑦ expand */
  const learned = {};
  days.forEach(r => {
    const nw = r.new || [];
    T(nw.length <= 3, `g${g} d${r.d} 새 단어 ${nw.length}개 > 3 (헌법 위반)`);
    T(new Set(nw).size === nw.length, `g${g} d${r.d} new 내 중복`);
    nw.forEach(w => {
      T(r.words.indexOf(w) >= 0, `g${g} d${r.d} new "${w}" 가 그날 문장에 없음`);
      T(!D.covered(learned, w), `g${g} d${r.d} new "${w}" 는 이미 배운/화이트리스트 단어 (덧셈 금지)`);
    });
    /* 오늘 배움을 편입한 뒤 그날 전 단어를 검사(new 는 오늘부터 사용 가능) */
    nw.forEach(w => D.learn(learned, w));
    r.words.forEach(w => T(D.covered(learned, w), `g${g} d${r.d} 미배운 단어 노출: "${w}" (문장 "${r.sent}")`));

    if (r.expand !== null && r.expand !== undefined) {
      T(typeof r.expand.sent === 'string' && r.expand.sent.length > 0, `g${g} d${r.d} expand.sent 없음`);
      T(hasKo(r.expand.ko), `g${g} d${r.d} expand.ko 없음`);
      D.tokenize(r.expand.sent).forEach(w =>
        T(D.covered(learned, w), `g${g} d${r.d} expand 미배운 단어: "${w}" ("${r.expand.sent}")`));
      T(r.expand.sent !== r.sent, `g${g} d${r.d} expand 가 본문과 동일`);
    }
  });

  /* ⑧ 문장 전역 중복 */
  const seen = {};
  days.forEach(r => {
    T(!seen[r.sent], `g${g} 본문 중복: d${r.d} "${r.sent}"`);
    seen[r.sent] = 'd' + r.d;
  });
  days.forEach(r => {
    if (!r.expand) return;
    T(!seen[r.expand.sent], `g${g} d${r.d} expand 가 다른 문장과 중복: "${r.expand.sent}" (${seen[r.expand.sent]})`);
    seen[r.expand.sent] = 'd' + r.d + '-expand';
  });

  /* 통계 */
  const units = days.reduce((n, r) => n + (r.new || []).length, 0);
  const expands = days.filter(r => r.expand).length;
  console.log(`  g${g}: ${days.length}일 · 새 어휘 단위 ${units} · expand ${expands}/${days.length} · 패턴 ${plan.map(p => p.pat + ':' + (p.to - p.from + 1)).join(' ')}`);
});

console.log(`english_data: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
