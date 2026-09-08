#!/usr/bin/env node
/**
 * 케이학습지 세트 검사기 — 양산 게이트
 *  2026-09-08 신설. 8-31 양산 때 돌린 정적 검사·퍼즈가 스크립트로 남지 않아(기록만) 재현이 안 됐다.
 *  이제 클로드 코드가 세트를 쏟아내도 이 파일 하나로 같은 기준을 다시 걸 수 있다.
 *
 * 하는 일
 *   1) 정적 검사 — 필수 필드 · 정답 유일성 · 오답 오개념 태그 · 해설 3줄 · 에셋 유효성
 *                  · 개념/오개념 코드가 _concepts.json 에 있는가 · mix 와 실제 난이도 분포 일치
 *   2) 변형 퍼즈 — play.html 의 makeVariant/prep/drawAsset 을 **그대로 떼어다** 돌린다.
 *                  변형본도 같은 정적 검사를 통과해야 하고, 화면 그리기에서 예외가 나면 안 된다.
 *   3) 연결표 검사 — _lesson_map.json 이 가리키는 세트가 실재하는가(양산 때 제일 잘 틀리는 곳)
 *
 * 실행:  node kedu/worksheet/tools/check_sets.js            (전체)
 *        node kedu/worksheet/tools/check_sets.js g1_math_u1 (접두사만)
 *        FUZZ=30 node ...                                    (문항당 퍼즈 횟수, 기본 15)
 * 나가는 값: 실패 1건이라도 있으면 1
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.join(__dirname, '..');           /* kedu/worksheet */
const DATA = path.join(ROOT, 'data');
const FUZZ = Number(process.env.FUZZ) || 15;
const ONLY = process.argv[2] || '';

/* ── play.html 에서 렌더러 조각을 떼어 온다 (정본은 언제나 play.html 하나) ───────── */
function loadEngine() {
  const src = fs.readFileSync(path.join(ROOT, 'play.html'), 'utf8');
  const grab = (from, to) => {
    const a = src.indexOf(from); const b = src.indexOf(to, a);
    if (a < 0 || b < 0) throw new Error('play.html 에서 조각을 못 찾았다: ' + from);
    return src.slice(a, b);
  };
  const head = grab("const NUMWORD =", "const STORE =");          /* NUMWORD · ORD */
  const body = grab("function rng(seed)", "/* ---------- 상태 ---------- */");
  /* 종이 그리기도 같이 떼어 온다 — 화면엔 나오는데 종이엔 빈칸인 에셋을 잡기 위해 */
  const paper = grab("function paperAsset(a)", "function renderPaper()");
  const sandbox = { window: {}, console, Math, JSON, String, Number, Array, Object, RegExp };
  sandbox.window.speechSynthesis = undefined;
  vm.createContext(sandbox);
  vm.runInContext('const SEED = 1;\n' + head + body + paper +
    '\nthis.API = { makeVariant, prep, drawAsset, paperAsset, rng };', sandbox);
  return sandbox.API;
}
const ENG = loadEngine();

/* ── 에셋 규격 — drawAsset 이 아는 종류와 필수 칸 ─────────────────────────────── */
const ASSETS = {
  count_group:    ['item', 'n'],
  scatter_group:  ['item', 'n'],
  dots:           ['n'],
  hidden_group:   ['item', 'visible'],
  picto_table:    ['rows'],
  rule:           ['cells'],
  pair_boxes:     ['left', 'right'],
  number_line:    ['cells'],
  ordinal_row:    ['items'],
  compare_groups: ['rows'],
  plate:          ['n', 'item'],
  /* v0.3 — 1학년 2학기 「100까지의 수」 */
  bundle_ones:    ['tens', 'ones'],
  hundred_chart:  ['cells'],
  pair_row:       ['n'],
  /* v0.4 — 1학년 2학기 「덧셈과 뺄셈(1)」 */
  ten_frame:      ['filled'],
  number_bond:    ['parts'],
  group_row:      ['groups'],
  /* v0.5 — 1학년 2학기 「모양과 시각」 */
  clock:          ['h', 'm'],
  shape_row:      ['shapes'],
  shape_art:      ['parts']
};
const KINDS = ['mc', 'sa', 'ox', 'match', 'essay', 'error', 'blank', 'data'];

/* ── 검사 ────────────────────────────────────────────────────────────────────── */
const CONCEPTS = JSON.parse(fs.readFileSync(path.join(DATA, '_concepts.json'), 'utf8'));
const CODES = new Set(Object.keys(CONCEPTS.concepts || {}));
const MIS   = new Set(Object.keys(CONCEPTS.misconceptions || {}));

let fails = [];
function bad(where, msg) { fails.push(where + ' — ' + msg); }

function checkAsset(where, a) {
  if (!a) return;
  if (typeof a === 'string') return;                     /* 글자 에셋은 그대로 그린다 */
  if (!ASSETS[a.type]) return bad(where, '모르는 에셋 종류 ' + a.type + ' (play.html drawAsset 에 없다)');
  for (const f of ASSETS[a.type]) if (a[f] === undefined || a[f] === null) bad(where, `에셋 ${a.type} 에 ${f} 없음`);
  if (a.type === 'picto_table' || a.type === 'compare_groups') {
    if (!Array.isArray(a.rows) || !a.rows.length) bad(where, `${a.type} rows 비었음`);
    else a.rows.forEach((rw, i) => { if (rw.n === undefined || !rw.item) bad(where, `${a.type} rows[${i}] item/n 없음`); });
  }
  if (a.type === 'number_line' && (!Array.isArray(a.cells) || a.cells.length < 3)) bad(where, 'number_line cells 3칸 미만');
  if (a.type === 'hidden_group' && a.total !== undefined && a.visible >= a.total) bad(where, 'hidden_group visible ≥ total');
  if (a.type === 'bundle_ones') {
    if (!(a.tens >= 0 && a.tens <= 10)) bad(where, 'bundle_ones tens 가 0~10 밖: ' + a.tens);
    if (!(a.ones >= 0 && a.ones <= 9)) bad(where, 'bundle_ones ones 는 0~9 여야 한다(10이면 묶어야 함): ' + a.ones);
  }
  if (a.type === 'hundred_chart') {
    if (!Array.isArray(a.cells) || a.cells.length < 3) bad(where, 'hundred_chart cells 3칸 미만');
    else {
      const nums = a.cells.filter(c => c !== null && c !== '?').map(Number);
      if (nums.some(n => !(n >= 1 && n <= 100))) bad(where, 'hundred_chart 에 1~100 밖의 수');
      if (!a.cells.some(c => c === null || c === '?')) bad(where, 'hundred_chart 에 빈칸이 없다 — 물을 것이 없음');
    }
    if (a.cols !== undefined && !(a.cols >= 2 && a.cols <= 10)) bad(where, 'hundred_chart cols 는 2~10');
  }
  if (a.type === 'pair_row' && !(a.n >= 1 && a.n <= 30)) bad(where, 'pair_row n 이 1~30 밖: ' + a.n);
  if (a.type === 'clock') {
    const h = Number(a.h), m = Number(a.m);
    if (!(h >= 1 && h <= 12)) bad(where, 'clock h 는 1~12: ' + a.h);
    if (!(m === 0 || m === 30)) bad(where, 'clock m 은 0 또는 30만 (1학년 과정): ' + a.m);
    if (a.hands !== undefined && a.hands !== 'none') bad(where, "clock hands 는 'none' 만 쓴다");
  }
  if (a.type === 'shape_row') {
    if (!Array.isArray(a.shapes) || a.shapes.length < 2) bad(where, 'shape_row shapes 2개 미만');
    else {
      const okk = a.shapes.every(s => ['sq', 'tri', 'cir'].indexOf(s) >= 0);
      if (!okk) bad(where, "shape_row shapes 는 sq·tri·cir 만");
      if (a.shapes.length > 8) bad(where, 'shape_row 는 8개까지 (1학년 눈으로 셀 수 있는 만큼)');
      if (a.mark !== undefined && !(a.mark >= 1 && a.mark <= a.shapes.length)) bad(where, 'shape_row mark 가 줄 밖: ' + a.mark);
    }
  }
  if (a.type === 'shape_art') {
    if (!Array.isArray(a.parts) || !a.parts.length) bad(where, 'shape_art parts 비었음');
    else {
      let tot = 0;
      a.parts.forEach((pp, i) => {
        if (['sq', 'tri', 'cir'].indexOf(pp.shape) < 0) bad(where, `shape_art parts[${i}] shape 는 sq·tri·cir 만`);
        if (!(pp.n >= 0 && pp.n <= 12)) bad(where, `shape_art parts[${i}] n 은 0~12`);
        tot += Number(pp.n) || 0;
      });
      const kinds = a.parts.map(pp => pp.shape);
      if (new Set(kinds).size !== kinds.length) bad(where, 'shape_art 에 같은 모양이 두 줄');
      if (tot < 3 || tot > 15) bad(where, 'shape_art 전체 모양 수는 3~15 (실제 ' + tot + ')');
    }
  }
  if (a.type === 'ten_frame') {
    const f = Number(a.filled), ad = Number(a.add || 0);
    if (!(f >= 0 && f <= 10)) bad(where, 'ten_frame filled 가 0~10 밖: ' + a.filled);
    if (!(ad >= 0 && f + ad <= 10)) bad(where, 'ten_frame filled+add 가 10을 넘음');
  }
  if (a.type === 'number_bond') {
    if (!Array.isArray(a.parts) || a.parts.length !== 2) bad(where, 'number_bond parts 는 두 칸이어야 한다');
    else {
      const blank = x => x === null || x === undefined || x === '?';
      const known = [a.whole, a.parts[0], a.parts[1]].filter(x => !blank(x)).map(Number);
      if (known.length < 2) bad(where, 'number_bond 는 세 칸 중 둘 이상이 채워져야 물을 것이 생긴다');
      if (!blank(a.whole) && !blank(a.parts[0]) && !blank(a.parts[1])
          && Number(a.whole) !== Number(a.parts[0]) + Number(a.parts[1])) bad(where, 'number_bond 전체 ≠ 두 부분의 합');
    }
  }
  if (a.type === 'group_row') {
    if (!Array.isArray(a.groups) || a.groups.length < 2) bad(where, 'group_row groups 가 2무리 미만');
    else a.groups.forEach((g, i) => { if (!g.item || !(Number(g.n) >= 0)) bad(where, `group_row groups[${i}] item/n 없음`); });
    if (a.op !== undefined && a.op !== '+' && a.op !== '-') bad(where, "group_row op 는 '+' 또는 '-'");
  }
}

/* 한 문항(원본이든 변형본이든) 공통 검사 */
function checkQ(where, q, opt) {
  opt = opt || {};
  if (!q.stem || !String(q.stem).trim()) bad(where, '발문 비었음');
  if (KINDS.indexOf(q.kind) < 0) bad(where, '모르는 유형 ' + q.kind);
  if (!opt.variant) {
    if (!(q.difficulty >= 1 && q.difficulty <= 4)) bad(where, '난이도 1~4 아님: ' + q.difficulty);
    if (!q.concept) bad(where, '개념 코드 없음');
    else if (!CODES.has(q.concept)) bad(where, '개념 사전에 없는 코드 ' + q.concept);
  }
  /* 해설 3줄 — 품질 헌법 8조 */
  if (!Array.isArray(q.explanation) || q.explanation.length !== 3) bad(where, '해설이 3줄이 아님');
  else q.explanation.forEach((l, i) => { if (!l || !String(l).trim()) bad(where, `해설 ${i + 1}번째 줄 비었음`); });

  checkAsset(where, q.asset);
  if (q.asset && typeof q.asset === 'object' && ASSETS[q.asset.type]) {
    try { if (!ENG.drawAsset(q.asset, ENG.rng(7))) bad(where, '화면에서 에셋이 빈칸으로 나옴'); }
    catch (e) { bad(where, '화면 그리기 예외: ' + e.message); }
    try { if (!ENG.paperAsset(q.asset)) bad(where, '종이 문제지에서 에셋이 빈칸으로 나옴'); }
    catch (e) { bad(where, '종이 그리기 예외: ' + e.message); }
  }

  const optsOf = arr => (arr || []).map(o => (typeof o.t === 'object' ? JSON.stringify(o.t) : String(o.t)));
  function checkOptions(arr, label) {
    if (!Array.isArray(arr) || arr.length < 2) return bad(where, label + ' 보기가 2개 미만');
    const cor = arr.filter(o => o.correct);
    if (cor.length !== 1) return bad(where, label + ` 정답이 ${cor.length}개 (1개여야 함)`);
    const texts = optsOf(arr);
    if (new Set(texts).size !== texts.length) bad(where, label + ' 보기 중복: ' + texts.join(' / '));
    texts.forEach((t, i) => { if (!t || t === 'null' || t === 'undefined') bad(where, label + ` 보기 ${i + 1} 비었음`); });
    arr.filter(o => !o.correct).forEach((o, i) => {
      const code = o.mis || o.mis_target;
      if (!code) bad(where, label + ` 오답 ${i + 1} 에 오개념 태그 없음`);
      else if (!MIS.has(code)) bad(where, label + ' 오개념 사전에 없는 코드 ' + code);
    });
  }

  switch (q.kind) {
    case 'mc': case 'error': case 'blank': case 'data':
      if (q.options) checkOptions(q.options, '');
      else if (q.kind !== 'data') bad(where, '보기(options) 없음');
      if (q.kind === 'data' && !q.options && !q.answer) bad(where, 'data 문항에 보기도 답도 없음');
      break;
    case 'sa':
      if (!Array.isArray(q.answer) || !q.answer.length) bad(where, '단답 정답(answer 배열) 없음');
      else if (q.answer.some(a => a === '' || a === null || a === undefined)) bad(where, '단답 정답에 빈 값');
      break;
    case 'ox':
      if (q.answer !== 'O' && q.answer !== 'X') bad(where, 'OX 정답이 O/X 아님: ' + q.answer);
      if (q.reason_options) checkOptions(q.reason_options, '까닭');
      break;
    case 'match':
      if (!Array.isArray(q.pairs) || q.pairs.length < 2) bad(where, '선긋기 짝이 2개 미만');
      else {
        const L = q.pairs.map(p => JSON.stringify(p.l)), R = q.pairs.map(p => JSON.stringify(p.r));
        if (new Set(L).size !== L.length) bad(where, '선긋기 왼쪽 중복');
        if (new Set(R).size !== R.length) bad(where, '선긋기 오른쪽 중복');
      }
      break;
    case 'essay':
      if (!opt.variant && !q.answer_guide && !q.grading) bad(where, '서술 채점 기준(answer_guide) 없음');
      break;
  }
}

/* ── 세트 한 벌 ──────────────────────────────────────────────────────────────── */
function checkSet(file) {
  const name = path.basename(file);
  let d;
  try { d = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return bad(name, 'JSON 파싱 실패: ' + e.message); }

  ['set', 'kind', 'title', 'grade', 'subject', 'unit', 'questions'].forEach(k => {
    if (d[k] === undefined) bad(name, `세트 머리에 ${k} 없음`);
  });
  if (d.set && d.set !== name.replace(/\.json$/, '')) bad(name, `set id(${d.set}) 와 파일 이름이 다름`);
  if (!Array.isArray(d.questions) || !d.questions.length) return bad(name, '문항 없음');

  const seqs = d.questions.map(q => q.seq);
  if (new Set(seqs).size !== seqs.length) bad(name, 'seq 중복');
  seqs.forEach((s, i) => { if (s !== i + 1) bad(name, `seq 가 1부터 이어지지 않음 (${i + 1}번째가 ${s})`); });

  /* mix ↔ 실제 난이도 분포 */
  if (d.mix) {
    const got = {};
    d.questions.forEach(q => { const k = 'D' + q.difficulty; got[k] = (got[k] || 0) + 1; });
    Object.keys(d.mix).forEach(k => {
      if ((got[k] || 0) !== d.mix[k]) bad(name, `난이도 ${k}: 선언 ${d.mix[k]} · 실제 ${got[k] || 0}`);
    });
    const sum = Object.keys(d.mix).reduce((a, k) => a + d.mix[k], 0);
    if (sum !== d.questions.length) bad(name, `mix 합 ${sum} ≠ 문항 수 ${d.questions.length}`);
  }

  let fuzzed = 0, stale = [];
  d.questions.forEach(q => {
    const where = `${name} #${q.seq}`;
    checkQ(where, q);

    /* 변형 퍼즈 — 같은 문제 재탕 금지 규칙이 붙은 문항만 */
    if (!q.variant_rule) return;
    /* cmp2 는 수만 바꾼다 — 그림이 붙어 있으면 변형 뒤 수와 그림이 어긋난다 */
    if (q.variant_rule.cmp2 && q.asset && typeof q.asset === 'object')
      bad(where, 'cmp2 변형은 그림 없는 문항 전용 — 그림이 붙었다면 bundle 갈래를 쓸 것');
    /* add3·maketen 도 수만 바꾼다 — 그림이 붙으면 변형 뒤 수와 그림이 어긋난다(대신 groups 갈래) */
    ['add3', 'maketen'].forEach(k => {
      if (q.variant_rule[k] && q.asset && typeof q.asset === 'object')
        bad(where, k + ' 변형은 그림 없는 문항 전용 — 그림이 붙었다면 groups 갈래를 쓸 것');
    });
    /* play.html 과 같은 순서·같은 난수 씀씀이: 틀린 문항들이 난수 하나를 이어 쓰고, prep 은 변형 뒤에 온다.
       (덧: 씨앗을 1씩 늘리면 LCG 특성상 첫 값이 거의 안 변해 「안 변한다」는 가짜 실패가 난다 — 씨앗을 넓게 흩는다) */
    const face = x => JSON.stringify([x.stem, x.asset || null, x.options || null, x.answer || null, x.pairs || null]);
    const origin = face(ENG.prep(q));
    let varied = false;
    for (let i = 0; i < FUZZ; i++) {
      let v;
      const r = ENG.rng((q.seq * 2654435761 + (i + 1) * 40503) >>> 0);
      r(); r();
      try { v = ENG.prep(ENG.makeVariant(q, r)); }
      catch (e) { bad(where, `변형 ${i} 예외: ` + e.message); break; }
      checkQ(where + ` 변형${i}`, v, { variant: true });
      if (face(v) !== origin) varied = true;
      try { ENG.drawAsset(v.asset, r); }
      catch (e) { bad(where + ` 변형${i}`, '화면 그리기 예외: ' + e.message); }
      try { if (v.asset && !ENG.paperAsset(v.asset)) bad(where + ` 변형${i}`, '종이 문제지에서 에셋이 빈칸으로 나옴'); }
      catch (e) { bad(where + ` 변형${i}`, '종이 그리기 예외: ' + e.message); }
      fuzzed++;
    }
    /* 한 번도 안 변했다 = 변형 규칙이 있는데 엔진에 그 갈래가 없다 → 「다시 해볼까?」가 같은 문제 재탕 */
    if (!varied) { stale.push(q.seq); bad(where, `variant_rule(${Object.keys(q.variant_rule).join(',')}) 이 있는데 ${FUZZ}회 모두 원본과 같음 — 재탕`); }
  });
  return { name, n: d.questions.length, fuzzed, stale };
}

/* ── 연결표 ──────────────────────────────────────────────────────────────────── */
function checkLessonMap(setNames) {
  const p = path.join(DATA, '_lesson_map.json');
  if (!fs.existsSync(p)) return bad('_lesson_map.json', '연결표가 없다');
  let m; try { m = JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return bad('_lesson_map.json', 'JSON 파싱 실패: ' + e.message); }
  Object.keys(m.lessons || {}).forEach(k => {
    const L = m.lessons[k];
    ['basic', 'challenge'].forEach(slot => {
      if (L[slot] && setNames.indexOf(L[slot]) < 0) bad('_lesson_map.json ' + k, `${slot} 이 가리키는 세트 ${L[slot]} 가 없다`);
    });
    (L.review || []).forEach(s => { if (setNames.indexOf(s) < 0) bad('_lesson_map.json ' + k, `단원 종합 ${s} 가 없다`); });
    if (!L.self && !L.teacher) bad('_lesson_map.json ' + k, 'self·teacher 둘 다 없어 문이 안 열린다');
  });
}

/* ── 실행 ────────────────────────────────────────────────────────────────────── */
const allSets = fs.readdirSync(DATA)
  .filter(f => f.endsWith('.json') && f.charAt(0) !== '_')
  .map(f => f.replace(/\.json$/, '')).sort();
const files = fs.readdirSync(DATA)
  .filter(f => f.endsWith('.json') && f.charAt(0) !== '_')
  .filter(f => !ONLY || f.indexOf(ONLY) === 0)
  .sort();
if (!files.length) { console.log('검사할 세트가 없다' + (ONLY ? ` (접두사 ${ONLY})` : '')); process.exit(1); }

let nQ = 0, nF = 0;
files.forEach(f => { const r = checkSet(path.join(DATA, f)); if (r) { nQ += r.n; nF += r.fuzzed; } });
checkLessonMap(allSets);   /* 접두사로 걸러도 연결표는 전체 목록과 대조 — 아니면 가짜 실패가 난다 */

if (fails.length) {
  console.log('\n✗ 실패 ' + fails.length + '건');
  fails.slice(0, 60).forEach(m => console.log('  ' + m));
  if (fails.length > 60) console.log('  … 외 ' + (fails.length - 60) + '건');
  process.exit(1);
}
console.log(`케이학습지 세트 검사 — 세트 ${files.length} · 문항 ${nQ} · 변형 퍼즈 ${nF}회 · 실패 0`);
