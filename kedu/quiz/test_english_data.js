/* =============================================================
 * test_english_data.js — 아침영어 원장 불변식 검산 (node)
 *   설계 정본: handoff/설계-아침영어-v1.md §3(사다리 헌법)·§6(스키마)·§8(검사 계획)
 *   ⓪ 학년 규약(GRADE_RULES): 규약 학년 집합 = 원장 학년 집합 · 학년별 newMax·tileMax 전수 강제
 *   ① 구조: 학년별 일수 정확(전 학년 40) · d 연번 1..N
 *   ② 패턴 계획: PAT_PLAN 구간과 pat 필드 전수 일치 · 10패턴 전부 존재 · 구간 연속 피복
 *   ③ 필드: sent·ko·tiles·words 존재, ko 에 한국어 포함
 *   ④ tiles 왕복: tiles.join(' ') === sent (구두점 포함)
 *   ⑤ 토큰 대조: tokenize(sent) === words (순서까지)
 *   ⑥ 어휘 사다리 전수(헌법): 전 일차 × 전 단어 — 미배운 단어 노출 0.
 *      new ≤ 3 · new ⊆ 그날 words · new 에 기배운·화이트리스트 금지 · new 내 중복 금지
 *   ⑦ expand: 사다리 준수(그날 누적 기준) · 본문·타 expand 와 문장 중복 금지 · ko 존재
 *   ⑧ 문장 전역 중복 금지(본문 40문장 상호)
 *   ⑨ gloss(새 낱말 뜻): 전 학년·전 일차의 new 가 빠짐없이 뜻을 갖는다(공백 0) ·
 *      뜻에 한국어 포함 · 길이 상한(배지 폭) · day.gloss 는 그날 new 안의 키만(고아 0) ·
 *      기본값과 같은 덮어쓰기 금지(무의미 예외 0) · GLOSS 죽은 항목 0 · 화이트리스트 금지 ·
 *      glossesOf 왕복(순서·개수가 new 와 1:1)
 *   ⓪ 틀 단일 통로(patOf·patGroups, D8-Ⓔ): 전 학년 전 일차가 틀을 알고 있다 ·
 *      틀 표기(이름·구간·틀 안 진행·연번)가 PAT_PLAN 원본과 전수 일치 ·
 *      구간 밖·없는 학년은 지어내지 않고 null · patGroups 가 원장을 구멍·겹침 없이 덮는다
 * 실행: node kedu/quiz/test_english_data.js [원장경로]
 *   경로 인자는 역검증용(변조 사본 검사) — git 원복 함정(9.7차 기록)을 피한다.
 * ============================================================= */
const P = require('path');
const argPath = process.argv[2] || './templates/english_data.js';
/* 절대경로면 그대로, 상대경로면 __dirname 기준. 로드 실패는 조용히 넘기지 않는다
 * (경로가 안 풀려 원본을 읽으면 역검증이 거짓 그린을 낸다 — 2026-08-16 실측 함정) */
const target = P.isAbsolute(argPath) ? argPath : P.resolve(__dirname, argPath);
let D;
try { D = require(target); }
catch (e) { console.log('  ✗ 원장 로드 실패: ' + target + ' — ' + e.message); console.log('english_data: 0 PASS / 1 FAIL'); process.exit(1); }
console.log('  · 대상: ' + target);
let fail = 0, pass = 0;
const T = (c, m) => { if (c) { pass++; } else { fail++; console.log('  ✗ ' + m); } };

const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* ★학년 규약은 원장이 상수로 들고 있다(GRADE_RULES) — 검사기는 그 표를 강제한다.
 *   기대 학년 집합도 여기서 온다: 규약에 있는 학년은 원장에 있어야 하고 그 역도 성립. */
const RULES = D.GRADE_RULES;
const EXPECT_GRADES = Object.keys(RULES).map(Number).sort((a, b) => a - b);
const ACTUAL_GRADES = D.grades().sort((a, b) => a - b);
T(deepEq(EXPECT_GRADES, ACTUAL_GRADES),
  `학년 집합 불일치: 규약 ${JSON.stringify(EXPECT_GRADES)} ≠ 원장 ${JSON.stringify(ACTUAL_GRADES)}`);

D.grades().forEach(g => {
  const days = D.days(g);
  const plan = D.plan(g);

  const R = RULES[g];

  /* ① 구조 */
  T(!!R, `g${g} 학년 규약(GRADE_RULES) 없음`);
  T(days.length === (R ? R.days : -1), `g${g} 일수 ${days.length} ≠ ${R ? R.days : '?'}`);
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
    T(r.tiles.length <= R.tileMax, `g${g} d${r.d} 타일 ${r.tiles.length}개 > 학년 상한 ${R.tileMax} ("${r.sent}")`);
    if (r.expand) T(D.tokenize(r.expand.sent).length <= R.tileMax,
      `g${g} d${r.d} expand 길이 초과 > ${R.tileMax} ("${r.expand.sent}")`);
    T(deepEq(D.tokenize(r.sent), r.words), `g${g} d${r.d} 토큰 대조 실패: ${JSON.stringify(D.tokenize(r.sent))} ≠ ${JSON.stringify(r.words)}`);
  });

  /* ⑥ 어휘 사다리 전수(헌법) + ⑦ expand */
  const learned = {};
  days.forEach(r => {
    const nw = r.new || [];
    T(nw.length <= R.newMax, `g${g} d${r.d} 새 단어 ${nw.length}개 > 학년 상한 ${R.newMax} (헌법 위반)`);
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
  const maxTile = days.reduce((m, r) => Math.max(m, r.tiles.length), 0);
  const avgTile = (days.reduce((n, r) => n + r.tiles.length, 0) / days.length).toFixed(2);
  const maxNew = days.reduce((m, r) => Math.max(m, (r.new || []).length), 0);
  console.log(`  g${g}: ${days.length}일 · 새 어휘 ${units} · expand ${expands}/${days.length} · 타일 평균 ${avgTile} 최대 ${maxTile}/${R.tileMax} · 최대new ${maxNew}/${R.newMax} · ${plan.map(p => p.pat + ':' + (p.to - p.from + 1)).join(' ')}`);
});

/* ══════════════ ⑨ gloss — 새 낱말 뜻 ══════════════
 * 2026-08-16 D8-ⓐ. 라이브 4개 학년이 매일 만나는 배지에 뜻이 비어 있던 구멍을 막는다.
 * 뜻은 "있으면 좋은 것"이 아니라 새 낱말의 짝이다 — new 가 늘면 뜻도 함께 늘어야 한다.
 * 이 절이 없으면 다음 사람이 문장을 한 줄 더 쓰는 순간 조용히 뜻 0 짜리 낱말이 생긴다. */
const KO = s => /[가-힣]/.test(String(s || ''));
const GLOSS_MAX = 24;              /* 배지 한 줄에 들어가는 폭 — 넘으면 화면에서 접힌다 */
const usedUnits = new Set();

T(D.GLOSS && typeof D.GLOSS === 'object', 'GLOSS 사전 없음');
T(typeof D.glossOf === 'function', 'glossOf 없음');
T(typeof D.glossesOf === 'function', 'glossesOf 없음');

D.grades().forEach(g => {
  D.days(g).forEach(r => {
    const nw = r['new'] || [];
    nw.forEach(u => {
      usedUnits.add(u);
      const k = D.glossOf(g, r.d, u);
      T(!!k, `g${g} d${r.d} 새 낱말 "${u}" 뜻 없음 (배지·인쇄물이 빈칸으로 나간다)`);
      T(KO(k), `g${g} d${r.d} "${u}" 뜻에 한국어 없음: "${k}"`);
      T(String(k).length <= GLOSS_MAX, `g${g} d${r.d} "${u}" 뜻 ${String(k).length}자 > ${GLOSS_MAX} ("${k}")`);
      T(String(k).trim() === String(k), `g${g} d${r.d} "${u}" 뜻 앞뒤 공백`);
    });

    /* 그날 덮어쓰기 — 고아·무의미 금지 */
    if (r.gloss) {
      T(typeof r.gloss === 'object' && !Array.isArray(r.gloss), `g${g} d${r.d} gloss 가 객체가 아님`);
      Object.keys(r.gloss).forEach(u => {
        T(nw.indexOf(u) >= 0, `g${g} d${r.d} gloss 고아 키 "${u}" — 그날 new 에 없다`);
        T(KO(r.gloss[u]), `g${g} d${r.d} gloss["${u}"] 에 한국어 없음`);
        T(r.gloss[u] !== D.GLOSS[u], `g${g} d${r.d} gloss["${u}"] 가 공용 뜻과 같음 — 예외가 아니다`);
      });
    }

    /* glossesOf 왕복: 개수·순서가 new 와 1:1 이어야 화면이 배지와 뜻을 짝지을 수 있다 */
    const list = D.glossesOf(g, r.d);
    T(list.length === nw.length, `g${g} d${r.d} glossesOf 개수 ${list.length} ≠ new ${nw.length}`);
    list.forEach((it, i) => {
      T(it.unit === nw[i], `g${g} d${r.d} glossesOf 순서 어긋남: ${i} 번째 ${it.unit} ≠ ${nw[i]}`);
      T(it.ko === D.glossOf(g, r.d, nw[i]), `g${g} d${r.d} glossesOf 뜻 불일치: ${it.unit}`);
    });
  });
});

/* ── ⓺ 틀 단일 통로 (patOf · patGroups) ★D8-ⓔ ─────────────────────────
 *  화면·인쇄물이 「몇 주 · 무슨 요일」을 지어내던 자리를 전부 이 두 통로로 갈아탔다.
 *  그래서 이 통로가 틀리면 이제 4개 학년의 학생 화면·둘러보기·인쇄물이 한꺼번에 틀린다.
 *  ★기대값을 patOf 로 뽑으면 안 된다 — 해석 함수가 망가지면 양쪽이 같이 흘러가 통과한다
 *    (9.15차에 실제로 낸 구멍). 기대값은 PAT_PLAN·GRADES 원본에서 직접 만든다. */
D.grades().forEach(g => {
  const plan = D.plan(g), days = D.days(g), N = days.length;

  /* (a) 전 일차 전수 — 원본 계획에서 직접 기대값을 만들어 대조 */
  days.forEach((row, i) => {
    const d = i + 1;
    const want = plan.findIndex(p => d >= p.from && d <= p.to);
    const wp = plan[want];
    const got = D.patOf(g, d);
    T(!!got, `g${g} d${d} patOf 가 null — 화면이 오늘의 틀을 말할 수 없다`);
    if (!got || !wp) return;
    T(got.pat === wp.pat, `g${g} d${d} patOf.pat ${got.pat} ≠ 계획 ${wp.pat}`);
    T(got.pat === row.pat, `g${g} d${d} patOf.pat 이 원장 행 pat(${row.pat})과 다름`);
    T(got.ko === wp.ko, `g${g} d${d} patOf.ko "${got.ko}" ≠ 계획 "${wp.ko}"`);
    T(got.from === wp.from && got.to === wp.to, `g${g} d${d} patOf 구간 ${got.from}~${got.to} ≠ ${wp.from}~${wp.to}`);
    T(got.len === wp.to - wp.from + 1, `g${g} d${d} patOf.len ${got.len} 이 구간 길이와 다름`);
    T(got.idx === d - wp.from + 1, `g${g} d${d} patOf.idx ${got.idx} ≠ ${d - wp.from + 1}`);
    T(got.idx >= 1 && got.idx <= got.len, `g${g} d${d} patOf.idx 가 1..len 밖: ${got.idx}/${got.len}`);
    T(got.no === want + 1, `g${g} d${d} patOf.no ${got.no} ≠ 계획 순번 ${want + 1}`);
  });

  /* (b) 구간 밖·없는 학년은 지어내지 않는다 — 이게 없으면 41일째에 첫 틀이 뜬다 */
  T(D.patOf(g, 0) === null, `g${g} patOf(0) 이 null 이 아님`);
  T(D.patOf(g, N + 1) === null, `g${g} patOf(${N + 1}) 이 null 이 아님 — 원장 끝을 넘어 틀을 지어냄`);
  T(D.patOf(g, -3) === null, `g${g} patOf(-3) 이 null 이 아님`);

  /* (c) patGroups — 둘러보기·인쇄물이 이 경계로만 나눈다 */
  const gs = D.patGroups(g);
  T(gs.length === plan.filter(p => p.from <= N).length, `g${g} patGroups 수 ${gs.length} ≠ 원장 안에 든 계획 수`);
  let cur = 1, sum = 0;
  gs.forEach((p, i) => {
    T(p.no === i + 1, `g${g} patGroups[${i}].no ${p.no} ≠ ${i + 1} (연번 아님)`);
    T(p.pat === plan[i].pat && p.ko === plan[i].ko, `g${g} patGroups[${i}] 이름이 계획과 다름`);
    T(p.from === cur, `g${g} patGroups[${i}] 시작 ${p.from} ≠ ${cur} — 구멍 또는 겹침`);
    T(p.to >= p.from, `g${g} patGroups[${i}] 구간 역전`);
    T(p.to <= N, `g${g} patGroups[${i}] 끝 ${p.to} 이 원장 일수 ${N} 을 넘음`);
    sum += p.to - p.from + 1;
    cur = p.to + 1;
  });
  T(sum === N, `g${g} patGroups 일수 합 ${sum} ≠ 원장 일수 ${N}`);
  T(cur - 1 === N, `g${g} patGroups 가 마지막 날 ${N} 까지 덮지 못함`);

  /* (d) 두 통로가 서로 어긋나지 않는가 — 화면은 머리(patOf)와 둘러보기(patGroups)를
         동시에 쓴다. 둘이 다르면 같은 날이 두 이름으로 불린다. */
  days.forEach((row, i) => {
    const d = i + 1, got = D.patOf(g, d);
    const grp = gs.filter(p => d >= p.from && d <= p.to)[0];
    T(!!grp, `g${g} d${d} 가 어느 patGroups 묶음에도 안 듦`);
    if (got && grp) T(got.no === grp.no && got.ko === grp.ko,
      `g${g} d${d} patOf(${got.no}.${got.ko}) 와 patGroups(${grp.no}.${grp.ko}) 가 다름`);
  });
});
T(D.patOf(9, 1) === null, 'patOf 가 원장 없는 9학년에 틀을 지어냄');
T(D.patGroups(9).length === 0, 'patGroups 가 원장 없는 9학년에 묶음을 지어냄');
console.log(`  틀: ${D.grades().map(g => `g${g} ${D.patGroups(g).length}묶음/${D.days(g).length}일`).join(' · ')}`);

/* 사전 부패 방지: 어느 날에도 안 쓰이는 뜻은 남겨 두지 않는다(문장을 고칠 때 같이 썩는다) */
Object.keys(D.GLOSS).forEach(u => {
  T(usedUnits.has(u), `GLOSS 죽은 항목 "${u}" — 어느 학년·일차의 new 에도 없다`);
  T(D.WHITELIST.indexOf(u) < 0, `GLOSS 에 화이트리스트 단어 "${u}" — 새 낱말이 아니므로 뜻 대상이 아니다`);
});
T(usedUnits.size === Object.keys(D.GLOSS).length,
  `뜻 사전 ${Object.keys(D.GLOSS).length} ≠ 원장 고유 단위 ${usedUnits.size}`);
console.log(`  gloss: 사전 ${Object.keys(D.GLOSS).length} 단위 · 그날 예외 ${
  D.grades().reduce((n, g) => n + D.days(g).filter(r => r.gloss).length, 0)} 건`);

console.log(`english_data: ${pass} PASS / ${fail} FAIL`);
process.exit(fail ? 1 : 0);
