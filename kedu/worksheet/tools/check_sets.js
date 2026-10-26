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
    '\nthis.API = { makeVariant, prep, drawAsset, paperAsset, rng, FIG, TAN7, CUTS, CUBE_LIB, cubeFaces, cubeOrder, FTAG, spCols, spH, spFront, spSide, spTopRows, spLayerCount, spSolutions, spHidden, picgPieces };', sandbox);
  return sandbox.API;
}
const ENG = loadEngine();

/* ── 에셋 규격 — drawAsset 이 아는 종류와 필수 칸 ─────────────────────────────── */
const ASSETS = {
  /* v3.6 — 3학년 1학기 「평면도형」 (2026-10-19): 점·선분·반직선·직선·각·직각 표시·도형 */
  geo:            ['items'],
  prot:           ['from'],
  /* v3.7 — 3학년 1학기 「길이와 시간」 (2026-10-19): mm 눈금 자 · 초바늘 시계 */
  mmruler:        ['len', 'label'],
  clock3:         ['h', 'm', 's'],
  /* v3.9 — 3학년 2학기 「나눗셈」 (2026-10-19): 나눗셈 세로셈 — 줄은 play.html 이 a·b 에서 직접 만든다 */
  ldiv:           ['a', 'b'],
  /* v3.12 — 3학년 2학기 「그림그래프」 (2026-10-20): 큰·(가운데)·작은 그림 그림그래프 */
  picg:           ['cols', 'counts', 'head'],
  /* v3.13 — 4학년 2학기 「꺾은선그래프」 (2026-10-20): 꺾은선그래프·막대그래프 */
  lgraph:         ['xs', 'series', 'step', 'ymax'],
  /* v3.16 — 6학년 1학기 「여러 가지 그래프」 (2026-10-26): 띠그래프·원그래프 */
  pgr:            ['kind', 'items'],
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
  shape_art:      ['parts'],
  /* v0.6 — 1학년 2학기 「덧셈과 뺄셈(2)」 */
  count_on:       ['start', 'steps'],
  ten_frames2:    ['top', 'bottom'],
  split_tree:     ['left', 'right', 'parts'],
  beads:          ['moved'],
  expr_grid:      ['rows'],
  /* v0.7 — 1학년 2학기 「규칙 찾기」 */
  pattern_row:    ['items'],
  pattern_grid:   ['rows'],
  /* v0.8 — 1학년 2학기 「덧셈과 뺄셈(3)」 */
  vert:           ['top', 'bottom'],
  bundle_pair:    ['left', 'right'],
  /* v0.9 — 국어 (2026-09-29): 짧은 글 · 말풍선 · 장면 */
  passage:        ['lines'],
  speech:         ['turns'],
  scene:          ['icon'],
  /* v1.0 — 국어 「그림일기를 써요」 (2026-10-06): 그림일기 틀 — 필수 칸 없음(비운 자리를 보여 주는 에셋이라), 규격은 checkAsset 에서 */
  diary:          [],
  /* v1.1 — 1학년 1학기 「여러 가지 모양」 (2026-10-06): 입체 모양 줄 · 입체로 만든 것 */
  solid_row:      ['items'],
  solid_art:      ['parts'],
  /* v1.2 — 1학년 1학기 「덧셈과 뺄셈」 (2026-10-06): 덜어 내기 줄 */
  take_row:       ['item', 'n', 'cross'],
  /* v1.3 — 1학년 1학기 「비교하기」 (2026-10-07): 길이 막대 · 양팔저울 · 넓이 모양 · 그릇 */
  len_bars:       ['rows'],
  /* v2.5 — 2학년 1학기 「길이 재기」 (2026-10-11): 자·1 cm 칸·단위 몇 번 */
  ruler:          ['len', 'label'],
  balance:        ['scales'],
  area_shapes:    ['shapes'],
  cups:           ['items'],
  /* v1.5 — 1학년 1학기 국어 「글자를 만들어요」 (2026-10-07): 글자 짜임 상자 · 음절표 */
  jamo:           [],
  syl_table:      ['cons', 'vows'],
  /* v1.6 — 1학년 1학기 국어 「받침이 있는 글자를 읽어요」 (2026-10-07): 받침 글자 상자 · 그림 낱말 */
  bat:            [],
  bat_word:       ['w', 'at'],
  /* v1.8 — 1학년 1학기 국어 「여러 가지 낱말을 익혀요」 (2026-10-10): 글자판 */
  word_grid:      ['rows'],
  /* v2.2 — 2학년 1학기 수학 「세 자리 수」 (2026-10-10): 수 모형·동전 · 자릿값 표 · 뛰어 세기 줄 */
  blocks3:        ['h', 't', 'o'],
  /* v2.3 — 2학년 1학기 「여러 가지 도형」 */
  figs:           ['items'],
  tiles:          ['pieces'],
  cubes:          [],
  place_table:    ['digits'],
  jump_row:       ['cells'],
  /* v2.4 — 2학년 1학기 「덧셈과 뺄셈」: 세로셈 판 · 전체-부분 막대 */
  vert2:          ['top', 'bottom', 'op'],
  bar2:           ['parts'],
  /* v2.6 — 2학년 1학기 「분류하기」: 섞인 바구니 · 나누어 담은 칸 · 분류한 결과 표 */
  sort_pile:      ['items'],
  sort_bins:      ['bins'],
  sort_table:     ['crit', 'cols', 'counts'],
  /* v2.7 — 2학년 1학기 「곱셈」: 묶음 그림 · 몇 배 막대(그림 줄) */
  mul_groups:     ['item'],
  times_bars:     ['base', 'times', 'a', 'b'],
  /* v2.8 — 2학년 2학기 「네 자리 수」: 천 모형·천 원 지폐가 더해진 수 모형·돈 */
  blocks4:        ['th', 'h', 't', 'o'],
  /* v2.9 — 2학년 2학기 「곱셈구구」: 곱셈표 */
  gugu_table:     ['rows', 'cols'],
  /* v3.0 — 2학년 2학기 「길이 재기」: 줄자 · m·cm 세로셈 · 이은/자른 띠 · 어림 간격 */
  tape:           ['len', 'label'],
  mcm_calc:       ['a', 'b', 'op'],
  mbar:           ['parts', 'op'],
  est_row:        ['seg', 'n'],
  /* v3.1 — 2학년 2학기 「시각과 시간」: 바늘 시계(분 눈금) · 디지털시계 · 시작·끝 디지털시계 · 시간 띠 · 하루 계획표 · 달력 */
  clock2:         ['h', 'm'],
  digital:        ['h', 'm'],
  dpair:          ['a', 'b'],
  tbar:           ['from', 'to'],
  dbar:           ['acts'],
  cal:            ['mon', 'start', 'days'],
  /* v3.2 — 2학년 2학기 「표와 그래프」: 조사 표 · ◯×／ 그래프 · 낱장 자료 */
  ftable:         ['head', 'cols', 'counts'],
  pgraph:         ['head', 'cols', 'counts'],
  cards:          ['items'],
  /* v3.3 — 2학년 2학기 「규칙 찾기」: 무늬 줄 · 돌아가는 판 · 쌓은 모양 단계 · 덧셈표·곱셈표 · 생활 속 수 배열 */
  ptile:          ['rows'],
  spin:           ['n', 'boards'],
  stack:          ['stages'],
  optab:          ['op', 'rows', 'cols'],
  numgrid:        ['rows'],
  fbar:           ['bars'],
  spv:            ['cells']
};
const KINDS = ['mc', 'sa', 'ox', 'match', 'essay', 'error', 'blank', 'data'];

/* ── 검사 ────────────────────────────────────────────────────────────────────── */
const CONCEPTS = JSON.parse(fs.readFileSync(path.join(DATA, '_concepts.json'), 'utf8'));
const CODES = new Set(Object.keys(CONCEPTS.concepts || {}));
const MIS   = new Set(Object.keys(CONCEPTS.misconceptions || {}));

/* v1.5 한글 자모 — 엔진(play.html hgJoin)과 따로 셈해 서로 검산한다 */
const HC = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', HV = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const hj = (c, v) => (HC.indexOf(c) < 0 || HV.indexOf(v) < 0 || !c || !v || c.length !== 1 || v.length !== 1) ? null : String.fromCharCode(0xAC00 + (HC.indexOf(c) * 21 + HV.indexOf(v)) * 28);
const hs = s => { s = String(s || ''); if (s.length !== 1) return null; const k = s.charCodeAt(0) - 0xAC00; if (!(k >= 0 && k < 11172) || k % 28) return null; return { c: HC[Math.floor(k / 588)], v: HV[Math.floor((k % 588) / 28)] }; };
const hl = v => 'ㅏㅐㅑㅒㅓㅔㅕㅖㅣ'.indexOf(v) >= 0 ? 'side' : 'ㅗㅛㅜㅠㅡ'.indexOf(v) >= 0 ? 'stack' : 'mix';
/* v1.6 받침 — 종성 표를 엔진과 따로 들고 서로 검산 */
const HB = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const hj3 = (c, v, b) => (HC.indexOf(c) < 0 || HV.indexOf(v) < 0 || HB.indexOf(b || '') < 0 || !c || !v || c.length !== 1 || v.length !== 1) ? null : String.fromCharCode(0xAC00 + (HC.indexOf(c) * 21 + HV.indexOf(v)) * 28 + HB.indexOf(b || ''));
const hs3 = s => { s = String(s || ''); if (s.length !== 1) return null; const k = s.charCodeAt(0) - 0xAC00; if (!(k >= 0 && k < 11172)) return null; return { c: HC[Math.floor(k / 588)], v: HV[Math.floor((k % 588) / 28)], b: HB[k % 28] }; };
/* 정답으로 나와도 되는 받침 글자(엔진 BAT_BANK 와 같은 생각, 따로 적음) */
const BAT_FAMILIAR = '각국낙막박북떡목약죽책학악속먹벽간눈문산손안신돈반전천한만논연곧돋닫믿받묻걷달별물발말길굴실일날불칼살줄곰감잠봄밤몸섬꿈힘땀김남솜점밥집입법컵탑십삽답겁강콩공빵방상장병종창양성동용빗옷맛붓낫곳';

let fails = [];
function bad(where, msg) { fails.push(where + ' — ' + msg); }

/* v3.6 geo — 판마다 가리키는 점이 실재하는가 · 직각 표시는 정말 직각인가 · 같은 길이 표시는 정말 같은가 */
function checkGeoAsset(where, a) {
  if (!Array.isArray(a.items) || !a.items.length) return bad(where, 'geo items 비었음');
  a.items.forEach((g, i) => {
    const P = g.pts || {}; const R = r => Array.isArray(r) ? r : (P[r] ? P[r] : null);
    for (const k of ['seg', 'dash', 'ray', 'line', 'curve', 'poly', 'right', 'arc', 'tick'])
      (g[k] || []).forEach((x, j) => { if (!Array.isArray(x)) return bad(where, `geo[${i}].${k}[${j}] 배열 아님`);
        x.forEach((r, m) => { if (k === 'tick' && m === 2) return; if (!R(r)) bad(where, `geo[${i}].${k}[${j}] 점 ${JSON.stringify(r)} 없음`); }); });
    (g.show || []).forEach(k => { if (!P[k]) bad(where, `geo[${i}].show 점 ${k} 없음`); });
    /* v3.11 점선 — 같은 두 점을 실선(seg)과 점선(dash)으로 함께 그리면 모순, 길이 0 금지 */
    { const key = (A, B) => { const p = R(A), q = R(B); return p && q ? [p.join(','), q.join(',')].sort().join('|') : null; };
      const sk = new Set((g.seg || []).map(([A, B]) => key(A, B)));
      (g.dash || []).forEach(([A, B], j) => { const p = R(A), q = R(B); if (!(p && q)) return;
        if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6) bad(where, `geo[${i}].dash[${j}] 길이 0`);
        if (sk.has(key(A, B))) bad(where, `geo[${i}].dash[${j}] ${A}${B} 가 실선 seg 에도 있음`); }); }
    /* v3.10 원·타원·글 */
    (g.circle || []).forEach(([O, r], j) => { const o = R(O); if (!o) return bad(where, `geo[${i}].circle[${j}] 중심 ${JSON.stringify(O)} 없음`);
      const q = typeof r === 'number' ? null : R(r); const rr = q ? Math.hypot(q[0] - o[0], q[1] - o[1]) : Number(r);
      if (!(rr > 0)) bad(where, `geo[${i}].circle[${j}] 반지름이 0 이하이거나 점 ${JSON.stringify(r)} 없음`); });
    (g.oval || []).forEach((v, j) => { if (!Array.isArray(v) || v.length !== 4 || v.some(x => typeof x !== 'number')) return bad(where, `geo[${i}].oval[${j}] 은 [cx,cy,rx,ry] 수`);
      if (!(v[2] > 0 && v[3] > 0)) bad(where, `geo[${i}].oval[${j}] 반지름 0 이하`); if (Math.abs(v[2] - v[3]) < 1e-6) bad(where, `geo[${i}].oval[${j}] rx=ry 면 원 — circle 로 그릴 것`); });
    (g.lab || []).forEach(([A, tx], j) => { if (!R(A)) bad(where, `geo[${i}].lab[${j}] 점 ${JSON.stringify(A)} 없음`); if (!tx) bad(where, `geo[${i}].lab[${j}] 글 없음`); });
    (g.right || []).forEach(([A, B, C]) => { const p = R(A), q = R(B), r = R(C); if (!(p && q && r)) return;
      const d = (p[0] - q[0]) * (r[0] - q[0]) + (p[1] - q[1]) * (r[1] - q[1]); if (Math.abs(d) > 1e-6) bad(where, `geo[${i}] 직각 표시 ${A}${B}${C} 가 직각이 아님`); });
    const ticks = {}; (g.tick || []).forEach(([A, B, n]) => { const p = R(A), q = R(B); if (!(p && q)) return; const k = Number(n) || 1; (ticks[k] = ticks[k] || []).push(Math.hypot(p[0] - q[0], p[1] - q[1])); });
    Object.keys(ticks).forEach(k => { const v = ticks[k]; if (Math.max(...v) - Math.min(...v) > 1e-6) bad(where, `geo[${i}] 같은 길이 표시(${k})의 변 길이가 다름`); });
  });
}
function checkAsset(where, a) {
  if (!a) return;
  if (typeof a === 'string') return;                     /* 글자 에셋은 그대로 그린다 */
  if (!ASSETS[a.type]) return bad(where, '모르는 에셋 종류 ' + a.type + ' (play.html drawAsset 에 없다)');
  for (const f of ASSETS[a.type]) if (a[f] === undefined || a[f] === null) bad(where, `에셋 ${a.type} 에 ${f} 없음`);
  if (a.type === 'ftable' || a.type === 'pgraph' || a.type === 'cards') checkTgAsset(where, a);
  if (['ptile', 'spin', 'stack', 'optab', 'numgrid', 'cal'].indexOf(a.type) >= 0) checkKrAsset(where, a);
  if (a.type === 'fbar') checkFdAsset(where, a);
  if (a.type === 'geo') checkGeoAsset(where, a);
  if (a.type === 'prot') {   /* v3.14 — 각도기: deg 1~179 정수(또는 null = 각도기만, parts 필요) · from right|left */
    if (['right', 'left'].indexOf(a.from) < 0) bad(where, "prot from 은 'right'|'left'");
    if (a.deg === null) { if (!a.parts) bad(where, 'prot 각 없는 각도기는 parts 로 부분 이름을 보여야'); }
    else if (!(Number.isInteger(a.deg) && a.deg >= 1 && a.deg <= 179)) bad(where, 'prot deg 는 1~179 정수: ' + a.deg);
  }
  if (a.type === 'spv') checkSpAsset(where, a);
  if (a.type === 'picto_table' || a.type === 'compare_groups') {
    if (!Array.isArray(a.rows) || !a.rows.length) bad(where, `${a.type} rows 비었음`);
    else a.rows.forEach((rw, i) => { if (rw.n === undefined || !rw.item) bad(where, `${a.type} rows[${i}] item/n 없음`); });
  }
  if (a.type === 'number_line' && (!Array.isArray(a.cells) || a.cells.length < 3)) bad(where, 'number_line cells 3칸 미만');
  if (a.type === 'hidden_group' && a.total !== undefined && a.visible >= a.total) bad(where, 'hidden_group visible ≥ total');
  if (a.type === 'figs') {
    if (!Array.isArray(a.items) || !a.items.length || a.items.length > 8) bad(where, 'figs items 는 1~8개');
    else a.items.forEach(k => { const f = ENG.FIG[k]; if (!f) bad(where, 'figs 도감에 없는 도형 ' + k); else { const c = figClass(f); const dk = f.k === 'tri' || f.k === 'quad' || f.k === 'circle' ? f.k : 'other'; if (c !== dk) bad(where, `figs ${k} 의 이름(${f.k})과 모양(${c})이 다르다`); } });
    if (new Set(a.items || []).size !== (a.items || []).length) bad(where, 'figs 같은 도형이 둘');
  }
  if (a.type === 'tiles') {
    (a.pieces || []).forEach((pc, i) => { if (!Array.isArray(pc.p) || pc.p.length < 3) bad(where, `tiles 조각 ${i + 1} 꼭짓점이 3개 미만`); else if (corners(pc.p) !== pc.p.length) bad(where, `tiles 조각 ${i + 1} 에 한 줄 위 점이 있다(꼭짓점만 적을 것)`); });
  }
  if (a.type === 'cubes') {
    if (Array.isArray(a.rows)) { if (a.rows.length < 2 || a.rows.length > 4) bad(where, 'cubes rows 는 2~4개'); a.rows.forEach((cs, i) => checkCubeCells(where + ' ' + '㉮㉯㉰㉱'[i], cs)); }
    else checkCubeCells(where, a.cells);
  }
  if (a.type === 'vert2') {
    if (!(a.top >= 10 && a.top <= 99) || !(a.bottom >= 1 && a.bottom <= 99)) bad(where, 'vert2 top 은 두 자리·bottom 은 1~99');
    if (a.op !== '+' && a.op !== '-') bad(where, "vert2 op 는 '+'|'-'");
    if (a.op === '-' && a.bottom >= a.top) bad(where, 'vert2 빼는 수가 더 크다');
    if (a.ans !== null && a.ans !== undefined && a.ans !== 'hide' && !(a.ans >= 0 && a.ans <= 1999)) bad(where, 'vert2 ans 는 null·hide·수');
  }
  if (a.type === 'ruler') {
    const s = Number(a.s) || 0, len = Number(a.len), mode = a.mode || 'ruler';
    if (['ruler', 'cells', 'unit'].indexOf(mode) < 0) bad(where, "ruler mode 는 ruler·cells·unit");
    if (!(len > 0 && len <= 14)) bad(where, 'ruler len 은 0~14: ' + a.len);
    if (!Number.isInteger(s) || s < 0 || s > 10) bad(where, 'ruler s 는 0~10 정수');
    const n = Number(a.n) || Math.ceil(s + len) + 1; if (n > 15) bad(where, 'ruler 자가 15 cm 를 넘는다');
    if (s + len > n) bad(where, 'ruler 물건 끝이 자 밖');
    const fr = Math.round((len - Math.floor(len)) * 10) / 10;
    if (mode !== 'ruler' && fr) bad(where, 'ruler ' + mode + ' 는 정수 길이만');
    if (fr && (fr < 0.15 || fr > 0.85 || (fr > 0.35 && fr < 0.65))) bad(where, 'ruler 눈금 사이 길이가 애매하다(가까운 눈금이 눈에 안 갈린다): ' + len);
    if (mode === 'unit') { const sz = Number(a.size) || 1; if (!a.unit) bad(where, 'ruler unit 그림 없음'); if (Math.abs(len / sz - Math.round(len / sz)) > 1e-9) bad(where, 'ruler unit — 길이가 단위의 몇 배가 아니다(빈틈이 생긴다)'); if (len / sz > 12) bad(where, 'ruler unit 12번 넘음'); }
  }
  if (a.type === 'bar2') {
    const p = a.parts || []; const nul = [a.whole, p[0], p[1]].filter(x => x === null || x === undefined).length;
    if (p.length !== 2) bad(where, 'bar2 parts 는 둘'); if (nul > 1) bad(where, 'bar2 빈칸(□)이 둘 이상');
    if (nul === 0 && a.whole !== p[0] + p[1]) bad(where, 'bar2 전체 ≠ 부분의 합');
    [a.whole, p[0], p[1]].forEach(x => { if (x !== null && x !== undefined && !(x > 0)) bad(where, 'bar2 수는 양수'); });
  }
  if (a.type === 'blocks3') {
    if (!(a.h >= 0 && a.h <= 9)) bad(where, 'blocks3 h 는 0~9: ' + a.h);
    ['t', 'o'].forEach(k => { if (!(a[k] >= 0 && a[k] <= 19)) bad(where, `blocks3 ${k} 는 0~19: ` + a[k]); });
    if (a.h + a.t + a.o === 0) bad(where, 'blocks3 가 비었다');
    if (a.unit !== undefined && a.unit !== 'coin') bad(where, "blocks3 unit 은 'coin' 만");
  }
  if (a.type === 'blocks4') {
    if (!(a.th >= 0 && a.th <= 9)) bad(where, 'blocks4 th 는 0~9: ' + a.th);
    if (a.th + a.h + a.t + a.o === 0) bad(where, 'blocks4 가 비었다');
    ['h', 't', 'o'].forEach(k => { if (!(a[k] >= 0 && a[k] <= 19)) bad(where, `blocks4 ${k} 는 0~19: ` + a[k]); });
    if (a.unit !== undefined && a.unit !== 'coin') bad(where, "blocks4 unit 은 'coin' 만");
    if (a.unit === 'coin' && a.o > 9) bad(where, 'blocks4 돈 그림에 1원짜리가 10개 넘다(바꾸기는 100원·10원만)');
  }
  if (a.type === 'place_table') {
    const nd = Array.isArray(a.digits) ? a.digits.length : 0;   /* v2.8 — [천,백,십,일] 넷도 된다 */
    if (nd !== 3 && nd !== 4) bad(where, 'place_table digits 는 [백,십,일] 셋 또는 [천,백,십,일] 넷');
    if (a.values !== undefined && (!Array.isArray(a.values) || a.values.length !== nd)) bad(where, 'place_table values 는 digits 와 같은 수');
    if (a.mark !== undefined && (nd === 4 ? ['th', 'h', 't', 'o'] : ['h', 't', 'o']).indexOf(a.mark) < 0) bad(where, 'place_table mark 가 자리 밖: ' + a.mark);
    if (Array.isArray(a.digits) && Array.isArray(a.values)) (nd === 4 ? [1000, 100, 10, 1] : [100, 10, 1]).forEach((u, i) => { const d = a.digits[i], v = a.values[i]; if (d !== null && v !== null && d !== undefined && v !== undefined && Number(d) * u !== Number(v)) bad(where, `place_table ${i}번째 자리 값 ${v} ≠ ${d}×${u}`); });
  }
  if (a.type === 'jump_row') {
    const cs = a.cells || []; if (cs.length < 3 || cs.length > 6) bad(where, 'jump_row 칸은 3~6');
    const st = a.step; const mulJ = Number(st) >= 2 && Number(st) <= 9;   /* v2.7 곱셈 — 2~9씩 뛰어 세기(0에서 출발, 칸 수 1~100) */
    if (st !== null && st !== undefined && [1, 10, 100, 1000].indexOf(Number(st)) < 0 && !mulJ) bad(where, 'jump_row step 은 1·10·100·1000 (곱셈은 2~9)');
    const sg = a.dir === 'down' ? -1 : 1; const k = cs.findIndex(c => c !== null && c !== '?');
    if (st !== null && st !== undefined && k >= 0) cs.forEach((c, i) => { if (c !== null && c !== '?' && Number(c) !== Number(cs[k]) + sg * st * (i - k)) bad(where, `jump_row ${i}번째 칸 ${c} 가 ${sg > 0 ? '+' : '−'}${st} 규칙에 안 맞다`); });
    const big4 = cs.some(c => c !== null && c !== '?' && Number(c) > 1000) || Number(st) === 1000;   /* v2.8 — 네 자리 수 줄은 1000~9999 */
    cs.forEach(c => { if (c !== null && c !== '?' && !(mulJ ? Number(c) >= 1 && Number(c) <= 100 : big4 ? Number(c) >= 1000 && Number(c) <= 9999 : Number(c) >= 100 && Number(c) <= 1000)) bad(where, 'jump_row 칸 수가 범위 밖: ' + c); });
  }
  if (a.type === 'tape') {   /* v3.0 — 줄자: 물건 끝 둘레 눈금 다섯을 그리므로 len 은 cm 정수 100~999, 한끝 s 는 0~3 */
    const len = Number(a.len), s0 = a.s === undefined ? 0 : Number(a.s);
    if (!Number.isInteger(len) || len < 100 || len > 999) bad(where, 'tape len 은 100~999 정수: ' + a.len);
    if (!Number.isInteger(s0) || s0 < 0 || s0 > 3) bad(where, 'tape s 는 0~3 정수');
    if (len % 100 === 0) bad(where, 'tape len 이 몇 m 로 딱 떨어진다(몇 m 몇 cm 꼴이 아님)');
  }
  if (a.type === 'mcm_calc' || a.type === 'mbar') {   /* v3.0 — m·cm 두 길이: 받아올림·받아내림 없는 범위 */
    const P = a.type === 'mcm_calc' ? [a.a, a.b] : a.parts, okp = p => Array.isArray(p) && p.length === 2 && p.every(x => Number.isInteger(x) && x >= 0) && p[1] < 100 && (p[0] > 0 || p[1] > 0);
    if (!Array.isArray(P) || P.length !== 2 || !P.every(okp)) return bad(where, a.type + ' 두 길이는 [m, cm] 정수(cm 0~99)');
    if (['+', '-'].indexOf(a.op) < 0) bad(where, a.type + ' op 는 + 또는 -');
    if (a.op === '+' && P[0][1] + P[1][1] > 99) bad(where, a.type + ' cm 끼리 더해 100 이 넘는다(받아올림은 2학년 범위 밖)');
    if (a.op === '-' && (P[0][1] < P[1][1] || P[0][0] < P[1][0] || P[0][0] * 100 + P[0][1] <= P[1][0] * 100 + P[1][1])) bad(where, a.type + ' 빼는 길이가 더 길거나 cm 받아내림이 필요하다');
    if (a.type === 'mcm_calc' && a.ask !== undefined && ['both', 'm', 'cm', 'show'].indexOf(a.ask) < 0) bad(where, 'mcm_calc ask 는 both·m·cm·show');
    if (a.type === 'mcm_calc' && a.said !== undefined && !okp(a.said)) bad(where, 'mcm_calc said 는 [m, cm]');
  }
  if (a.type === 'mmruler') {   /* v3.7 — mm 눈금 자: len 은 mm 정수, s 는 cm 정수, 자는 12 cm 까지 */
    const len = Number(a.len), s0 = a.s === undefined ? 0 : Number(a.s), n = Number(a.n) || Math.ceil(s0 + len / 10) + 1;
    if (!Number.isInteger(len) || len < 3 || len > 110) bad(where, 'mmruler len 은 3~110 mm 정수: ' + a.len);
    if (!Number.isInteger(s0) || s0 < 0 || s0 > 5) bad(where, 'mmruler s 는 0~5 cm 정수');
    if (n > 12) bad(where, 'mmruler 자가 12 cm 를 넘는다');
    if (s0 * 10 + len > n * 10) bad(where, 'mmruler 물건 끝이 자 밖');
  }
  if (a.type === 'picg') {   /* v3.12 — 그림그래프: units 2~3개 내림·나누어떨어짐, 줄 2~8, 수는 작은 단위의 배수, 줄마다 그림 48개 이하 */
    const u = (a.units || []).map(Number), cols = a.cols || [], cn = a.counts || [], bl = a.blank || [];
    const TBL = a.only === 'table';
    if (!TBL && !a.icon) bad(where, 'picg icon 없음');
    if (TBL) {} else if (!(u.length >= 2 && u.length <= 3) || u.some(x => !Number.isInteger(x) || x < 1)) bad(where, 'picg units 는 2~3개 자연수: ' + JSON.stringify(a.units));
    else for (let j = 0; j + 1 < u.length; j++) if (!(u[j] > u[j + 1] && u[j] % u[j + 1] === 0)) bad(where, 'picg units 는 큰 수부터, 앞 수는 뒤 수의 배수: ' + JSON.stringify(a.units));
    if (!(cols.length >= 2 && cols.length <= 8)) bad(where, 'picg 줄은 2~8개');
    if (new Set(cols).size !== cols.length) bad(where, 'picg 같은 항목 이름이 둘');
    if (cn.length !== cols.length) bad(where, 'picg cols·counts 길이가 다르다');
    bl.forEach(i => { if (!(Number.isInteger(i) && i >= 0 && i < cols.length)) bad(where, 'picg blank 줄 번호 밖: ' + i); });
    cn.forEach((n, i) => { if (n === null) { if (bl.indexOf(i) < 0 && a.only !== 'table') bad(where, 'picg 수가 null 인데 빈 줄이 아니다(그림 줄은 blank 로)'); return; }
      if (!(Number.isInteger(n) && n >= 0)) bad(where, 'picg counts 는 0 이상 정수: ' + n);
      else if (!TBL && u.length && n % u[u.length - 1] !== 0) bad(where, `picg ${cols[i]} ${n} 은 작은 그림(${u[u.length - 1]})으로 나타낼 수 없다`); });
    if (a.drawn !== undefined && (!Array.isArray(a.drawn) || a.drawn.length !== cols.length)) bad(where, 'picg drawn 길이가 cols 와 다르다');
    if (a.pieces !== undefined) { if (!Array.isArray(a.pieces) || a.pieces.length !== cols.length) bad(where, 'picg pieces 길이가 cols 와 다르다');
      else a.pieces.forEach((pc, i) => { if (!Array.isArray(pc) || pc.length !== u.length || pc.some(k => !Number.isInteger(k) || k < 0)) bad(where, 'picg pieces[' + i + '] 는 units 와 같은 길이의 0 이상 정수'); }); }
    if (a.only !== undefined && a.only !== 'table') bad(where, "picg only 는 'table' 만");
    if (a.only === 'table') { const nn = cn.filter(x => x === null).length, sum = cn.reduce((x, y) => x + (Number(y) || 0), 0);
      if (nn > 1) bad(where, 'picg 표 빈칸이 둘 넘다'); if (nn === 1 && typeof a.total !== 'number') bad(where, 'picg 표 빈칸인데 합계가 없다(구할 길이 없다)');
      if (typeof a.total === 'number' && nn === 0 && a.total !== sum) bad(where, 'picg 표 합계가 칸의 합과 다르다');
      if (typeof a.total === 'number' && nn === 1 && a.total < sum) bad(where, 'picg 표 빈칸이 음수가 된다');
      if (a.total === null && nn) bad(where, 'picg 표 빈칸과 합계 ? 가 같이 있다'); }
    if (a.table && cn.some(x => x === null)) bad(where, 'picg table:true 는 수가 모두 있어야 한다');
    const draw = Array.isArray(a.drawn) ? a.drawn : cn;
    if (!TBL) cols.forEach((c, i) => { if (bl.indexOf(i) >= 0) return; const pc = Array.isArray(a.pieces) && Array.isArray(a.pieces[i]) ? a.pieces[i] : ENG.picgPieces(draw[i], u);
      const tot = pc.reduce((x, y) => x + y, 0); if (tot > 48) bad(where, `picg ${c} 그림이 ${tot}개 — 48개 이하로`); });
    if (a.units2 !== undefined) { const u2 = (a.units2 || []).map(Number);
      if (TBL) bad(where, 'picg 표만에 units2');
      if (!(u2.length >= 2 && u2.length <= 3) || u2.some(x => !Number.isInteger(x) || x < 1)) bad(where, 'picg units2 는 2~3개 자연수');
      else { for (let j = 0; j + 1 < u2.length; j++) if (!(u2[j] > u2[j + 1] && u2[j] % u2[j + 1] === 0)) bad(where, 'picg units2 는 큰 수부터·배수');
        if (JSON.stringify(u2) === JSON.stringify(u)) bad(where, 'picg units2 가 units 와 같다');
        cn.forEach((n, i) => { if (Number.isInteger(n) && n % u2[u2.length - 1] !== 0) bad(where, `picg ${cols[i]} 은 units2 로 나타낼 수 없다`); });
        cols.forEach((c, i) => { if (bl.indexOf(i) >= 0) return; const tot = ENG.picgPieces(draw[i], u2).reduce((x, y) => x + y, 0); if (tot > 48) bad(where, `picg units2 ${c} 그림이 ${tot}개 — 48개 이하로`); }); }
      if (a.names !== undefined && (!Array.isArray(a.names) || a.names.length !== 2 || a.names[0] === a.names[1])) bad(where, 'picg names 는 서로 다른 두 이름'); }
  }
  if (a.type === 'pgr') {   /* v3.16 — 비율그래프: 항목 2~6, 이름 겹침 없음·짧게, 백분율 0~100 정수(0.5 단위까지), 합 100(bad 면 100 미만) */
    const it = Array.isArray(a.items) ? a.items : [];
    if (a.kind !== 'band' && a.kind !== 'pie') bad(where, "pgr kind 는 'band'|'pie'");
    if (!(it.length >= 2 && it.length <= 6)) bad(where, 'pgr 항목은 2~6개');
    if (new Set(it.map(p => String(p[0]))).size !== it.length) bad(where, 'pgr 항목 이름이 겹친다');
    let sum = 0;
    it.forEach(p => { if (!(Array.isArray(p) && p.length === 2 && String(p[0]).length >= 1 && String(p[0]).length <= 8)) { bad(where, 'pgr 항목은 [이름(1~8자), 백분율]: ' + JSON.stringify(p)); return; }
      const v = p[1]; if (!(typeof v === 'number' && v > 0 && v <= 100 && Number.isInteger(v * 2))) bad(where, `pgr ${p[0]} 백분율 ${v} 은 0 초과 100 이하·0.5 단위`); sum += Number(v) || 0; });
    if (!a.blank) { if (a.bad) { if (!(sum < 100)) bad(where, 'pgr bad(잘못 그린 그래프)인데 합이 100 미만이 아니다: ' + sum); }
      else if (Math.abs(sum - 100) > 1e-9) bad(where, 'pgr 백분율 합이 100 이 아니다: ' + sum); }
    (a.hide || []).forEach(i => { if (!(Number.isInteger(i) && i >= 0 && i < it.length)) bad(where, 'pgr hide 자리 밖: ' + i); });
    (a.tag || []).forEach(x => { if (!(Array.isArray(x) && x.length === 2 && Number.isInteger(x[0]) && x[0] >= 0 && x[0] < it.length && String(x[1]).length >= 1 && String(x[1]).length <= 4)) bad(where, 'pgr tag 는 [자리, 짧은 글]: ' + JSON.stringify(x)); });
  }
  if (a.type === 'lgraph') {   /* v3.13 — 꺾은선그래프: 값은 y0~ymax 안·눈금 위, 칸 수 2~40, 물결선은 y0>0 일 때만(그리고 꼭), 계열 1~2(v3.15 막대도 2 — 묶음 막대) */
    const xs = a.xs || [], S = a.series || [], st = a.step, y0 = a.y0 === undefined ? 0 : a.y0, ym = a.ymax;
    const near = (x) => Math.abs(x - Math.round(x)) < 1e-9;
    if (!(xs.length >= 2 && xs.length <= 12)) bad(where, 'lgraph 가로 눈금은 2~12개');
    if (new Set(xs.map(String)).size !== xs.length) bad(where, 'lgraph 가로 눈금 이름이 겹친다');
    if (!(typeof st === 'number' && st > 0)) bad(where, 'lgraph step 은 양수');
    if (!(typeof y0 === 'number' && y0 >= 0 && near(y0 / st))) bad(where, 'lgraph y0 는 0 이상·step 의 배수');
    if (!(typeof ym === 'number' && ym > y0 && near((ym - y0) / st))) bad(where, 'lgraph ymax 는 y0 보다 크고 step 칸에 맞아야');
    else { const c = Math.round((ym - y0) / st); if (c < 2 || c > 40) bad(where, 'lgraph 세로 칸 수 2~40: ' + c); }
    if (y0 > 0 && !a.wave) bad(where, 'lgraph y0 > 0 인데 물결선이 없다');
    if (a.wave && !(y0 > 0)) bad(where, 'lgraph 물결선인데 y0 가 0');
    if (a.mode !== undefined && a.mode !== 'line' && a.mode !== 'bar') bad(where, "lgraph mode 는 'line'|'bar'");
    if (!(S.length >= 1 && S.length <= 2)) bad(where, 'lgraph 계열은 1~2');
    if (S.length === 2 && !(S[0].name && S[1].name && S[0].name !== S[1].name)) bad(where, 'lgraph 두 계열은 서로 다른 이름이 있어야');
    S.forEach((se, si) => { const vs = se.vals || [];
      if (vs.length !== xs.length) bad(where, `lgraph 계열 ${si} 값 수가 가로 눈금 수와 다르다`);
      vs.forEach((v, i) => { if (v === null) return;
        if (typeof v !== 'number') { bad(where, `lgraph 값 ${v} 은 수가 아님`); return; }
        if (v < y0 || v > ym) bad(where, `lgraph ${xs[i]} 값 ${v} 이 세로 범위 ${y0}~${ym} 밖`);
        if (!near((v - y0) / st)) bad(where, `lgraph ${xs[i]} 값 ${v} 이 눈금(${st}) 위에 있지 않다`); });
      if (vs.filter(v => v !== null).length < 1 && !a.blank) bad(where, 'lgraph 값이 하나도 없다'); });
    (a.hide || []).forEach(h => { if (!(Array.isArray(h) && S[h[0]] && Number.isInteger(h[1]) && h[1] >= 0 && h[1] < xs.length)) bad(where, 'lgraph hide 자리 밖: ' + JSON.stringify(h)); });
    (a.mark || []).forEach(m => { if (!(Array.isArray(m) && m.length === 3 && S[m[0]] && Number.isInteger(m[1]) && m[1] >= 0 && m[1] < xs.length && String(m[2]).length <= 4)) bad(where, 'lgraph mark 는 [계열, 자리, 짧은 글]: ' + JSON.stringify(m)); });
    if (a.order !== undefined) { const o = a.order; if (!Array.isArray(o) || o.length !== xs.length || new Set(o).size !== o.length || o.some(i => !(Number.isInteger(i) && i >= 0 && i < xs.length))) bad(where, 'lgraph order 는 가로 자리의 순열');
      else if (o.every((x, k) => x === k)) bad(where, 'lgraph order 가 차례 그대로다(잘못 이은 그래프가 아님)'); }
    if ([a.order !== undefined, !!a.curve, !!a.dots].filter(Boolean).length > 1) bad(where, 'lgraph order·curve·dots 는 하나만');
    if (a.mode === 'bar' && (a.order !== undefined || a.curve || a.dots)) bad(where, 'lgraph 막대에 order·curve·dots');
  }
  if (a.type === 'ldiv') {   /* v3.9 — 나눗셈 세로셈: a 10~9999 · b 2~99 · a ≥ b 정수, hide 는 q·[q,i]·[r,k]·rem, upto 0~줄 수 */
    const A = a.a, B = a.b;
    if (!(Number.isInteger(A) && A >= 10 && A <= 9999)) bad(where, 'ldiv a 는 10~9999 정수: ' + A);
    if (!(Number.isInteger(B) && B >= 2 && B <= 99)) bad(where, 'ldiv b 는 2~99 정수: ' + B);
    if (Number.isInteger(A) && Number.isInteger(B) && A < B) bad(where, 'ldiv a 가 b 보다 작다');
    if (Number.isInteger(A) && Number.isInteger(B) && A >= B && B >= 2) {
      const ds = String(A).split('').map(Number); let cur = 0, started = false, first = true, nr = 0; const qcols = [];
      for (let i = 0; i < ds.length; i++) { cur = cur * 10 + ds[i]; if (!started && cur < B) continue; started = true; const qd = Math.floor(cur / B); qcols.push(i);
        if (qd === 0 && i < ds.length - 1) continue; if (!first || qd === 0) nr++; first = false; if (qd > 0) { nr++; cur -= qd * B; if (i === ds.length - 1) nr++; } }
      if (cur !== A % B) bad(where, 'ldiv 나머지 검산 실패');
      (a.hide || []).forEach(h => { const H = Array.isArray(h) ? h : [h];
        if (['q', 'r', 'rem'].indexOf(H[0]) < 0) bad(where, 'ldiv hide 는 q·r·rem: ' + JSON.stringify(h));
        if (H[0] === 'q' && H.length > 1 && qcols.indexOf(H[1]) < 0) bad(where, 'ldiv hide q 자리에 몫이 없다: ' + H[1]);
        if (H[0] === 'r' && !(Number.isInteger(H[1]) && H[1] >= 0 && H[1] < nr)) bad(where, 'ldiv hide r 줄 번호 밖: ' + H[1]); });
      if (a.upto !== undefined && !(Number.isInteger(a.upto) && a.upto >= 0 && a.upto <= nr)) bad(where, 'ldiv upto 는 0~' + nr);
    }
  }
  if (a.type === 'clock3') {   /* v3.7 — 초바늘 시계: h 1~12 · m·s 0~59 정수 */
    if (!(Number.isInteger(a.h) && a.h >= 1 && a.h <= 12)) bad(where, 'clock3 h 는 1~12 정수: ' + a.h);
    ['m', 's'].forEach(k => { if (!(Number.isInteger(a[k]) && a[k] >= 0 && a[k] <= 59)) bad(where, `clock3 ${k} 는 0~59 정수: ` + a[k]); });
  }
  if (a.type === 'clock2' || a.type === 'digital') {   /* v3.1 — 시각: h 1~12 · m 0~59 정수 */
    if (!(Number.isInteger(a.h) && a.h >= 1 && a.h <= 12)) bad(where, a.type + ' h 는 1~12 정수: ' + a.h);
    if (!(Number.isInteger(a.m) && a.m >= 0 && a.m <= 59)) bad(where, a.type + ' m 은 0~59 정수: ' + a.m);
    if (a.ampm !== undefined && ['오전', '오후'].indexOf(a.ampm) < 0) bad(where, 'digital ampm 은 오전·오후');
  }
  const TMok = p => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && p[0] >= 1 && p[0] <= 12 && Number.isInteger(p[1]) && p[1] >= 0 && p[1] <= 59;
  if (a.type === 'dpair') {
    if (!TMok(a.a) || !TMok(a.b)) bad(where, 'dpair a·b 는 [시 1~12, 분 0~59]');
    else if (a.b[0] * 60 + a.b[1] <= a.a[0] * 60 + a.a[1]) bad(where, 'dpair 끝난 시각이 시작한 시각보다 앞선다');
  }
  if (a.type === 'tbar') {   /* 시간 띠: 한 칸 10분 · 3시간 안 */
    if (!TMok(a.from) || !TMok(a.to)) bad(where, 'tbar from·to 는 [시 1~12, 분 0~59]');
    else { if (a.from[1] % 10 || a.to[1] % 10) bad(where, 'tbar 분은 10의 배수(한 칸 10분)');
      if (a.to[0] * 60 + a.to[1] <= a.from[0] * 60 + a.from[1]) bad(where, 'tbar 끝이 시작보다 앞선다');
      if ((a.to[1] ? a.to[0] + 1 : a.to[0]) - a.from[0] > 3) bad(where, 'tbar 는 3시간 안'); }
  }
  if (a.type === 'dbar') {   /* 하루 계획표: [이름, 시작 시, 끝 시, 그림] 0~24 겹치지 않게 */
    const A = a.acts; if (!Array.isArray(A) || !A.length) bad(where, 'dbar acts 비었음');
    else { let last = 0; A.forEach(x => { if (!Array.isArray(x) || typeof x[0] !== 'string' || !Number.isInteger(x[1]) || !Number.isInteger(x[2]) || x[1] < last || x[2] <= x[1] || x[2] > 24) bad(where, 'dbar 칸이 0~24 안에서 차례로 겹치지 않아야: ' + JSON.stringify(x)); else last = x[2]; }); }
  }
  if (a.type === 'cal') {   /* 달력: 달마다 날수 · 1일 요일 */
    const MD = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (!(Number.isInteger(a.mon) && a.mon >= 1 && a.mon <= 12)) bad(where, 'cal mon 은 1~12');
    else if (!(a.days === MD[a.mon] || (a.mon === 2 && a.days === 29))) bad(where, `cal ${a.mon}월 날수 ${a.days} 가 틀림`);
    if (!(Number.isInteger(a.start) && a.start >= 0 && a.start <= 6)) bad(where, 'cal start 는 0~6');
    Object.keys(a.marks || {}).concat((a.hi || []).map(String)).forEach(k => { if (!(+k >= 1 && +k <= a.days)) bad(where, 'cal 표시 날짜가 달 밖: ' + k); });
  }
  if (a.type === 'est_row') {
    const seg = Number(a.seg), n = Number(a.n);
    if (!Number.isInteger(seg) || seg < 1 || seg > 10) bad(where, 'est_row seg 는 1~10 정수');
    if (!Number.isInteger(n) || n < 2 || n > 8) bad(where, 'est_row n 은 2~8');
  }
  if (a.type === 'gugu_table') {   /* v2.9 — 곱셈표: 칸 값은 엔진이 r×c 로 셈하므로 줄·칸 머리 수와 ?·빈칸 자리만 본다 */
    const R = a.rows || [], C = a.cols || [], ok = x => Number.isInteger(x) && x >= 0 && x <= 9;
    if (!Array.isArray(R) || R.length < 1 || R.length > 9 || !R.every(ok)) bad(where, 'gugu_table rows 는 0~9 정수 1~9개');
    if (!Array.isArray(C) || C.length < 2 || C.length > 10 || !C.every(ok)) bad(where, 'gugu_table cols 는 0~9 정수 2~10개');
    if (new Set(R).size !== R.length || new Set(C).size !== C.length) bad(where, 'gugu_table 줄·칸 머리 수가 겹친다');
    const inT = x => Array.isArray(x) && x.length === 2 && R.indexOf(x[0]) >= 0 && C.indexOf(x[1]) >= 0;
    if (a.q !== undefined && !inT(a.q)) bad(where, 'gugu_table q 칸이 표 밖');
    (a.blank || []).forEach(x => { if (!inT(x)) bad(where, 'gugu_table blank 칸이 표 밖'); if (a.q && x[0] === a.q[0] && x[1] === a.q[1]) bad(where, 'gugu_table blank 가 q 칸과 겹친다'); });
    if (a.hrow !== undefined && R.indexOf(a.hrow) < 0) bad(where, 'gugu_table hrow 가 줄 머리에 없다');
  }
  if (a.type === 'mul_groups') {
    const look = a.look || 'groups'; if (['groups', 'rows', 'loose'].indexOf(look) < 0) bad(where, 'mul_groups look 은 groups·rows·loose');
    if (look === 'loose') { const t = Number(a.total); if (!(t >= 2 && t <= 40)) bad(where, 'mul_groups loose total 2~40 밖: ' + a.total); if (a.k !== undefined || a.n !== undefined) bad(where, 'mul_groups loose 에 k·n 이 있다(묶기 전 그림)'); }
    else { const k = Number(a.k), n = Number(a.n); if (!(k >= 1 && k <= 9 && n >= 1 && n <= 9)) bad(where, `mul_groups k·n 1~9 밖: ${a.k}·${a.n}`); if (k * n > 45) bad(where, 'mul_groups 모두 45개 넘음'); }
  }
  if (a.type === 'times_bars') {
    const b = Number(a.base), t = Number(a.times); if (!(b >= 1 && b <= 6 && t >= 1 && t <= 9)) bad(where, `times_bars base·times 범위 밖: ${a.base}·${a.times}`);
    if (b * t > (a.item ? 24 : 18)) bad(where, 'times_bars 견줄 것이 너무 길다'); if (a.a === a.b) bad(where, 'times_bars 두 이름이 같다');
    if (a.grid && a.item) bad(where, 'times_bars grid 는 색 막대만');
  }
  if (a.type === 'bundle_ones') {
    if (!(a.tens >= 0 && a.tens <= 10)) bad(where, 'bundle_ones tens 가 0~10 밖: ' + a.tens);
    if (!(a.ones >= 0 && a.ones <= 9)) bad(where, 'bundle_ones ones 는 0~9 여야 한다(10이면 묶어야 함): ' + a.ones);
  }
  if (a.type === 'hundred_chart') {
    if (!Array.isArray(a.cells) || a.cells.length < 3) bad(where, 'hundred_chart cells 3칸 미만');
    else {
      const nums = a.cells.filter(c => c !== null && c !== '?').map(Number);
      if (nums.some(n => !(n >= 1 && n <= 100))) bad(where, 'hundred_chart 에 1~100 밖의 수');
      if (!a.cells.some(c => c === null || c === '?') && !(Array.isArray(a.hi) && a.hi.length)) bad(where, 'hundred_chart 에 빈칸도 색칠한 수(hi)도 없다 — 물을 것이 없음');
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
  if (a.type === 'count_on') {
    const st = Number(a.start), k = Number(a.steps);
    if (!(st >= 0 && st <= 20)) bad(where, 'count_on start 는 0~20: ' + a.start);
    if (!(k >= 1 && k <= 9)) bad(where, 'count_on steps 는 1~9: ' + a.steps);
    if (a.dir !== undefined && a.dir !== 'up' && a.dir !== 'down') bad(where, "count_on dir 는 'up' 또는 'down'");
    const end = a.dir === 'down' ? st - k : st + k;
    if (end < 0 || end > 20) bad(where, 'count_on 끝 수가 0~20 을 벗어남: ' + end);
  }
  if (a.type === 'ten_frames2') {
    const t = Number(a.top), ad = Number(a.add || 0), b = Number(a.bottom), cr = Number(a.cross || 0);
    if (!(t >= 0 && t <= 10)) bad(where, 'ten_frames2 top 은 0~10: ' + a.top);
    if (!(ad >= 0 && t + ad <= 10)) bad(where, 'ten_frames2 top+add 가 10을 넘음');
    if (!(b >= 0 && b <= 10)) bad(where, 'ten_frames2 bottom 은 0~10: ' + a.bottom);
    if (t + ad < 10 && b > 0) bad(where, 'ten_frames2 윗판이 안 찼는데 아랫판에 놓였다 — 10을 먼저 채워야 한다');
    if (!(cr >= 0 && cr <= t + ad + b)) bad(where, 'ten_frames2 cross 가 놓인 수보다 많음');
    if (a.cross_from !== undefined && a.cross_from !== 'top' && a.cross_from !== 'bottom') bad(where, "ten_frames2 cross_from 은 'top'|'bottom'");
  }
  if (a.type === 'split_tree') {
    const blank = x => x === null || x === undefined || x === '?';
    if (a.op !== undefined && a.op !== '+' && a.op !== '-') bad(where, "split_tree op 는 '+' 또는 '-'");
    if (a.split !== undefined && a.split !== 'left' && a.split !== 'right') bad(where, "split_tree split 은 'left'|'right'");
    if (!Array.isArray(a.parts) || a.parts.length !== 2) bad(where, 'split_tree parts 는 두 칸');
    else {
      const sp = Number(a.split === 'left' ? a.left : a.right);
      if (!blank(a.parts[0]) && !blank(a.parts[1]) && Number(a.parts[0]) + Number(a.parts[1]) !== sp) bad(where, `split_tree 가른 두 수의 합 ≠ 가른 수 ${sp}`);
      const known = a.parts.filter(x => !blank(x));
      known.forEach(x => { if (!(Number(x) >= 0 && Number(x) <= sp)) bad(where, 'split_tree 부분이 가른 수보다 큼'); });
    }
    [a.left, a.right].forEach(x => { if (!(Number(x) >= 0 && Number(x) <= 20)) bad(where, 'split_tree left/right 는 0~20'); });
  }
  if (a.type === 'beads') {
    const m = Number(a.moved), x = Number(a.cross || 0);
    if (!(m >= 0 && m <= 20)) bad(where, 'beads moved 는 0~20: ' + a.moved);
    if (!(x >= 0 && x <= m)) bad(where, 'beads cross 가 옮긴 수보다 많음');
  }
  if (a.type === 'expr_grid') {
    if (!Array.isArray(a.rows) || !a.rows.length) bad(where, 'expr_grid rows 비었음');
    else a.rows.forEach((rw, i) => { if (!Array.isArray(rw) || rw.length < 2) bad(where, `expr_grid rows[${i}] 는 2칸 이상`); });
  }
  if (a.type === 'vert') {
    const T = Number(a.top), Bt = Number(a.bottom);
    if (!(T >= 0 && T <= 99) || !(Bt >= 0 && Bt <= 99)) bad(where, 'vert top/bottom 은 0~99');
    if (a.op !== undefined && a.op !== '+' && a.op !== '-') bad(where, "vert op 는 '+' 또는 '-'");
    const op = a.op === '-' ? '-' : '+';
    if (op === '+' && (T % 10 + Bt % 10 > 9 || Math.floor(T / 10) + Math.floor(Bt / 10) > 9)) bad(where, 'vert 덧셈에 받아올림이 있다 — 1학년 2학기 범위 밖');
    if (op === '-' && (T % 10 < Bt % 10 || T < Bt)) bad(where, 'vert 뺄셈에 받아내림이 있거나 큰 수에서 작은 수를 빼지 않는다');
    if (a.ans !== undefined && a.ans !== null && a.ans !== 'hide' && Number(a.ans) !== (op === '+' ? T + Bt : T - Bt)) bad(where, 'vert ans 가 계산과 다름');
  }
  if (a.type === 'bundle_pair') {
    ['left', 'right'].forEach(k => { const b = a[k] || {}; if (!(b.tens >= 0 && b.tens <= 9)) bad(where, `bundle_pair ${k}.tens 는 0~9`); if (!(b.ones >= 0 && b.ones <= 9)) bad(where, `bundle_pair ${k}.ones 는 0~9`); });
    if (a.op !== undefined && a.op !== '+' && a.op !== '-') bad(where, "bundle_pair op 는 '+' 또는 '-'");
  }
  if (a.type === 'pattern_row') {
    if (!Array.isArray(a.items) || a.items.length < 3) bad(where, 'pattern_row items 3개 미만');
    else {
      if (a.items.length > 12) bad(where, 'pattern_row 는 12개까지');
      const shown = a.items.filter(x => x !== null && x !== '?');
      if (!shown.length) bad(where, 'pattern_row 가 전부 빈칸');
      if (a.mark !== undefined && !(a.mark >= 1 && a.mark <= a.items.length)) bad(where, 'pattern_row mark 가 줄 밖: ' + a.mark);
    }
  }
  if (a.type === 'pattern_grid') {
    if (!Array.isArray(a.rows) || a.rows.length < 2) bad(where, 'pattern_grid 는 2줄 이상');
    else a.rows.forEach((rw, i) => { if (!Array.isArray(rw) || rw.length < 2 || rw.length > 8) bad(where, `pattern_grid rows[${i}] 는 2~8칸`); });
  }
  if (a.type === 'hundred_chart' && a.hi !== undefined) {
    if (!Array.isArray(a.hi) || a.hi.length < 2) bad(where, 'hundred_chart hi 는 2개 이상');
    else { const cs = (a.cells || []).map(c => Number(c)); a.hi.forEach(h => { if (cs.indexOf(Number(h)) < 0 && !(a.cells || []).some(c => c === null || c === '?')) bad(where, 'hundred_chart hi 에 표에 없는 수 ' + h); }); }
  }
  if (a.type === 'passage') {
    if (!Array.isArray(a.lines) || !a.lines.length) bad(where, 'passage lines 비었음');
    else {
      if (a.lines.length > 8) bad(where, 'passage 는 8줄까지 (1학년이 한 화면에서 읽을 만큼)');
      a.lines.forEach((ln, i) => { if (!ln || !String(ln).trim()) bad(where, `passage lines[${i}] 비었음`); if (String(ln).length > 60) bad(where, `passage lines[${i}] 60자 초과`); });
      if (a.hi !== undefined) { if (!Array.isArray(a.hi)) bad(where, 'passage hi 는 배열'); else a.hi.forEach(h => { if (!a.lines.some(ln => String(ln).indexOf(String(h)) >= 0)) bad(where, 'passage hi 에 글에 없는 말 ' + h); }); }
    }
  }
  if (a.type === 'speech') {
    if (!Array.isArray(a.turns) || !a.turns.length) bad(where, 'speech turns 비었음');
    else { if (a.turns.length > 6) bad(where, 'speech 는 6마디까지'); a.turns.forEach((t, i) => { if (!t || !t.who || !t.text) bad(where, `speech turns[${i}] who/text 없음`); }); }
  }
  if (a.type === 'scene') {
    if (!a.icon || !String(a.icon).trim()) bad(where, 'scene icon 비었음');
    if (a.text !== undefined && String(a.text).length > 80) bad(where, 'scene text 80자 초과');
  }
  if (a.type === 'diary') {
    const filled = ['date', 'weather', 'picture', 'lines'].filter(k => a[k] !== null && a[k] !== undefined && a[k] !== '' && !(Array.isArray(a[k]) && !a[k].length));
    if (filled.length < 2) bad(where, 'diary 는 date·weather·picture·lines 가운데 둘 이상 채워야(전부 빈 틀은 문항이 안 된다)');
    if (a.lines !== null && a.lines !== undefined) {
      if (!Array.isArray(a.lines)) bad(where, 'diary lines 는 배열 또는 null');
      else { if (a.lines.length > 5) bad(where, 'diary lines 는 5줄까지'); a.lines.forEach((ln, i) => { if (!ln || !String(ln).trim()) bad(where, `diary lines[${i}] 비었음`); if (String(ln).length > 40) bad(where, `diary lines[${i}] 40자 초과`); }); }
    }
    if (a.date && String(a.date).length > 20) bad(where, 'diary date 20자 초과');
    if (a.weather && String(a.weather).length > 20) bad(where, 'diary weather 20자 초과');
    if (a.picture && String(a.picture).length > 12) bad(where, 'diary picture 는 그림 글자 몇 개까지(12자)');
    if (a.hi !== undefined) { if (!Array.isArray(a.hi)) bad(where, 'diary hi 는 배열'); else a.hi.forEach(h => { const pool = [a.date, a.weather].concat(Array.isArray(a.lines) ? a.lines : []).filter(Boolean).map(String); if (!pool.some(t => t.indexOf(String(h)) >= 0)) bad(where, 'diary hi 에 틀에 없는 말 ' + h); }); }
  }
  if (a.type === 'solid_row') {
    const SOL = ['box', 'cyl', 'cyl_lay', 'ball'];
    if (!Array.isArray(a.items) || !a.items.length) bad(where, 'solid_row items 비었음');
    else {
      if (a.items.length > 8) bad(where, 'solid_row 는 8개까지');
      a.items.forEach((x, i) => {
        if (typeof x === 'string') { if (SOL.indexOf(x) < 0) bad(where, `solid_row items[${i}] 는 box·cyl·cyl_lay·ball 또는 {icon,name}·{solid,peek}`); }
        else if (!x || typeof x !== 'object') bad(where, `solid_row items[${i}] 이 비었음`);
        else if (x.solid !== undefined) { if (SOL.indexOf(x.solid) < 0) bad(where, `solid_row items[${i}].solid 모르는 모양 ${x.solid}`); }
        else if (!x.icon || !x.name) bad(where, `solid_row items[${i}] 물건 카드에 icon·name 둘 다 있어야`);
      });
      if (a.mark !== undefined && !(a.mark >= 1 && a.mark <= a.items.length)) bad(where, 'solid_row mark 가 줄 밖: ' + a.mark);
    }
  }
  if (a.type === 'take_row') {
    if (!(a.n >= 1 && a.n <= 9)) bad(where, 'take_row n 은 1~9: ' + a.n);
    if (!(a.cross >= 0 && a.cross <= a.n)) bad(where, 'take_row cross 는 0~n: ' + a.cross);
  }
  if (a.type === 'solid_art') {
    if (!Array.isArray(a.parts) || !a.parts.length) bad(where, 'solid_art parts 비었음');
    else {
      let tot = 0;
      a.parts.forEach((pp, i) => { if (['box', 'cyl', 'ball'].indexOf(pp.solid) < 0) bad(where, `solid_art parts[${i}] solid 는 box·cyl·ball`); if (!(pp.n >= 0 && pp.n <= 8)) bad(where, `solid_art parts[${i}] n 은 0~8`); tot += Number(pp.n) || 0; });
      const kinds = a.parts.map(pp => pp.solid); if (new Set(kinds).size !== kinds.length) bad(where, 'solid_art 에 같은 모양이 두 줄');
      if (tot < 3 || tot > 15) bad(where, 'solid_art 전체 모양 수는 3~15 (실제 ' + tot + ')');
    }
  }
  if (a.type === 'len_bars') {
    if (!Array.isArray(a.rows) || a.rows.length < 2 || a.rows.length > 4) bad(where, 'len_bars rows 는 2~4줄');
    else {
      a.rows.forEach((rw, i) => {
        if (!rw.label) bad(where, `len_bars rows[${i}] label 없음`);
        if (!(Number.isInteger(rw.len) && rw.len >= 1 && rw.len <= 12)) bad(where, `len_bars rows[${i}] len 은 1~12 정수`);
        if (rw.off !== undefined && !(Number.isInteger(rw.off) && rw.off >= 0 && rw.off <= 4)) bad(where, `len_bars rows[${i}] off 는 0~4 정수`);
      });
      const L = a.rows.map(rw => rw.label); if (new Set(L).size !== L.length) bad(where, 'len_bars 이름표 중복');
      if (a.line && a.rows.some(rw => Number(rw.off) > 0)) bad(where, 'len_bars 기준선(line)을 켰는데 끝이 안 맞은 줄이 있다 — 그림이 거짓말');
    }
  }
  if (a.type === 'balance') {
    if (!Array.isArray(a.scales) || !a.scales.length || a.scales.length > 3) bad(where, 'balance scales 는 1~3개');
    else a.scales.forEach((sc, i) => {
      if (!sc.l || !sc.r || !sc.l.name || !sc.r.name) bad(where, `balance scales[${i}] l·r 에 name 이 있어야`);
      else if (sc.l.name === sc.r.name) bad(where, `balance scales[${i}] 양쪽이 같은 물건`);
      if (['l', 'r', 'eq'].indexOf(sc.down) < 0) bad(where, `balance scales[${i}] down 은 l·r·eq`);
    });
  }
  if (a.type === 'area_shapes') {
    if (['overlap', 'grid', 'side'].indexOf(a.mode || 'grid') < 0) bad(where, 'area_shapes mode 는 overlap·grid·side');
    if (!Array.isArray(a.shapes) || a.shapes.length < 2 || a.shapes.length > 3) bad(where, 'area_shapes shapes 는 2~3개');
    else {
      a.shapes.forEach((sh, i) => {
        if (!sh.label) bad(where, `area_shapes shapes[${i}] label 없음`);
        if (sh.cells) { if (!Array.isArray(sh.cells) || !sh.cells.length || sh.cells.length > 30) bad(where, `area_shapes shapes[${i}] cells 1~30칸`);
          else { const k = sh.cells.map(c => c.join(',')); if (new Set(k).size !== k.length) bad(where, `area_shapes shapes[${i}] 같은 칸 두 번`);
            if (sh.cells.some(c => !(c[0] >= 0 && c[0] <= 7 && c[1] >= 0 && c[1] <= 7))) bad(where, `area_shapes shapes[${i}] 칸 자리는 0~7`); } }
        else if (!(Number.isInteger(sh.w) && Number.isInteger(sh.h) && sh.w >= 1 && sh.h >= 1 && sh.w <= 8 && sh.h <= 8)) bad(where, `area_shapes shapes[${i}] w·h 는 1~8 정수`);
      });
      if (a.mode === 'overlap') {
        if (a.shapes.length !== 2 || a.shapes.some(sh => sh.cells)) bad(where, 'area_shapes overlap 은 w·h 모양 둘');
        else { const [p, q] = a.shapes; if (!(p.w >= q.w && p.h >= q.h) || (p.w === q.w && p.h === q.h)) bad(where, 'area_shapes overlap — 아래(첫째) 모양이 위(둘째) 모양을 다 덮어야 한다(아니면 겹쳐 보기로 못 가린다)'); }
      }
      if (a.mode === 'side' && a.shapes.some(sh => sh.cells)) bad(where, 'area_shapes side 는 w·h 모양만(칸 모양은 grid)');
    }
  }
  if (a.type === 'cups') {
    if (!Array.isArray(a.items) || a.items.length < 2 || a.items.length > 4) bad(where, 'cups items 는 2~4개');
    else {
      a.items.forEach((c, i) => {
        if (!c.label) bad(where, `cups items[${i}] label 없음`);
        if (!(Number.isInteger(c.w) && c.w >= 1 && c.w <= 5)) bad(where, `cups items[${i}] w 는 1~5`);
        if (!(Number.isInteger(c.h) && c.h >= 1 && c.h <= 6)) bad(where, `cups items[${i}] h 는 1~6`);
        if (c.fill !== undefined && !(c.fill >= 0 && c.fill <= 1)) bad(where, `cups items[${i}] fill 은 0~1`);
      });
      if (a.same && a.items.some(c => c.w !== a.items[0].w || c.h !== a.items[0].h)) bad(where, 'cups same 인데 그릇 크기가 다르다');
      if (a.pour) { const n = a.items.length; if (!(a.pour.from >= 0 && a.pour.from < n && a.pour.to >= 0 && a.pour.to < n && a.pour.from !== a.pour.to)) bad(where, 'cups pour from/to 가 그릇 밖이거나 같다');
        else if (a.items[a.pour.from].w * a.items[a.pour.from].h === a.items[a.pour.to].w * a.items[a.pour.to].h) bad(where, 'cups pour 두 그릇 크기가 같다 — 넘침/남음을 말할 수 없다'); }
    }
  }
  if (a.type === 'jamo') {
    const isC = x => typeof x === 'string' && x.length === 1 && HC.indexOf(x) >= 0, isV = x => typeof x === 'string' && x.length === 1 && HV.indexOf(x) >= 0;
    if (a.c !== undefined && a.c !== null && !isC(a.c)) bad(where, 'jamo c 가 자음자가 아니다: ' + a.c);
    if (a.v !== undefined && a.v !== null && !isV(a.v)) bad(where, 'jamo v 가 모음자가 아니다: ' + a.v);
    if (a.s !== undefined && a.s !== null && !hs(a.s)) bad(where, 'jamo s 는 받침 없는 한 글자여야 한다: ' + a.s);
    if (a.c && a.v && a.s && hj(a.c, a.v) !== a.s) bad(where, `jamo ${a.c}+${a.v} 는 ${hj(a.c, a.v)} 인데 s 가 ${a.s}`);
    if (a.eq === false && !a.s) bad(where, 'jamo eq:false 면 글자 s 가 있어야 한다(아니면 그림이 빈다)');
    if (a.eq !== false && a.c === undefined && a.v === undefined) bad(where, 'jamo 식 줄에 c·v 가 없다');
    if (a.lay !== undefined && [true, 'blank', 'c', 'v'].indexOf(a.lay) < 0) bad(where, "jamo lay 는 true·'blank'·'c'·'v'");
    if (a.lay && !(a.v || (a.s && hs(a.s)))) bad(where, 'jamo lay 를 그리려면 모음자(v 또는 s)가 있어야 짜임을 안다');
  }
  if (a.type === 'bat') {
    const isC = x => typeof x === 'string' && x.length === 1 && HC.indexOf(x) >= 0, isV = x => typeof x === 'string' && x.length === 1 && HV.indexOf(x) >= 0;
    const isB = x => typeof x === 'string' && x.length === 1 && HB.indexOf(x) > 0;
    if (a.base !== undefined && a.base !== null && !hs(a.base)) bad(where, 'bat base 는 받침 없는 한 글자여야 한다: ' + a.base);
    if (a.c !== undefined && a.c !== null && !isC(a.c)) bad(where, 'bat c 가 자음자가 아니다: ' + a.c);
    if (a.v !== undefined && a.v !== null && !isV(a.v)) bad(where, 'bat v 가 모음자가 아니다: ' + a.v);
    if (a.b !== undefined && a.b !== null && !isB(a.b)) bad(where, 'bat b 가 받침이 아니다: ' + a.b);
    const s3 = a.s ? hs3(a.s) : null;
    if (a.s !== undefined && a.s !== null && !(s3 && s3.b)) bad(where, 'bat s 는 받침 있는 한 글자여야 한다: ' + a.s);
    if (a.base && a.b && a.s) { const p = hs(a.base); if (p && hj3(p.c, p.v, a.b) !== a.s) bad(where, `bat ${a.base}+${a.b} 는 ${hj3(p.c, p.v, a.b)} 인데 s 가 ${a.s}`); }
    if (a.c && a.v && a.b && a.s && hj3(a.c, a.v, a.b) !== a.s) bad(where, `bat ${a.c}+${a.v}+${a.b} 는 ${hj3(a.c, a.v, a.b)} 인데 s 가 ${a.s}`);
    if (a.base !== undefined && (a.c !== undefined || a.v !== undefined)) bad(where, 'bat 은 base 와 c·v 를 함께 쓰지 않는다');
    if (a.eq === false && !a.s) bad(where, 'bat eq:false 면 글자 s 가 있어야 한다(아니면 그림이 빈다)');
    if (a.eq !== false && a.base === undefined && a.c === undefined) bad(where, 'bat 식 줄에 base 나 c 가 없다');
    if (a.lay !== undefined && [true, 'blank', 'b', 'c', 'v'].indexOf(a.lay) < 0) bad(where, "bat lay 는 true·'blank'·'b'·'c'·'v'");
    if (a.lay && !(a.v || s3 || (a.base && hs(a.base)))) bad(where, 'bat lay 를 그리려면 모음자를 알아야 한다');
  }
  if (a.type === 'bat_word') {
    const ws = [...String(a.w || '')];
    if (!ws.length || ws.some(x => !hs3(x))) bad(where, 'bat_word w 는 한글 글자로만: ' + a.w);
    if (!(Number.isInteger(a.at) && a.at >= 0 && a.at < ws.length)) bad(where, 'bat_word at 이 낱말 밖');
    else if (!(hs3(ws[a.at]) || {}).b) bad(where, `bat_word ${a.w} 의 ${a.at} 번째 글자에 받침이 없다`);
  }
  if (a.type === 'word_grid') {
    const R = Array.isArray(a.rows) ? a.rows.map(x => [...String(x)]) : [];
    if (!(R.length >= 2 && R.length <= 5)) bad(where, 'word_grid rows 는 2~5줄');
    else { const L = R[0].length; if (!(L >= 2 && L <= 5)) bad(where, 'word_grid 한 줄은 2~5글자');
      R.forEach((rw, i) => { if (rw.length !== L) bad(where, `word_grid rows[${i}] 길이가 다르다`); if (rw.some(ch => !hs3(ch))) bad(where, `word_grid rows[${i}] 에 한글 글자 아닌 것`); }); }
    if (a.ask !== undefined && a.ask !== 'find') bad(where, "word_grid ask 는 'find' 만");
  }
  if (a.type === 'syl_table') {
    const C2 = a.cons || [], V2 = a.vows || [];
    if (!(C2.length >= 2 && C2.length <= 5)) bad(where, 'syl_table cons 는 2~5줄');
    if (!(V2.length >= 2 && V2.length <= 5)) bad(where, 'syl_table vows 는 2~5칸');
    C2.forEach(x => { if (HC.indexOf(x) < 0 || String(x).length !== 1) bad(where, 'syl_table cons 에 자음자 아닌 것 ' + x); });
    V2.forEach(x => { if (HV.indexOf(x) < 0 || String(x).length !== 1) bad(where, 'syl_table vows 에 모음자 아닌 것 ' + x); });
    if (new Set(C2).size !== C2.length || new Set(V2).size !== V2.length) bad(where, 'syl_table 줄·칸 이름 중복');
    if (a.q !== undefined && !(Array.isArray(a.q) && a.q[0] >= 0 && a.q[0] < C2.length && a.q[1] >= 0 && a.q[1] < V2.length)) bad(where, 'syl_table q 가 표 밖');
  }
  if (a.type === 'group_row') {
    if (!Array.isArray(a.groups) || a.groups.length < 2) bad(where, 'group_row groups 가 2무리 미만');
    else a.groups.forEach((g, i) => { if (!g.item || !(Number(g.n) >= 0)) bad(where, `group_row groups[${i}] item/n 없음`); });
    if (a.op !== undefined && a.op !== '+' && a.op !== '-') bad(where, "group_row op 는 '+' 또는 '-'");
  }
}

/* v1.3 cmp4 — 그림에서 정답을 다시 계산해 보기·답과 맞는지 (원본·변형 모두)
   ask most|least|mid · by len|weight|area|cap|fill (없으면 그림 종류로) */
function cmp4Truth(a, by) {
  if (!a || typeof a !== 'object') return null;
  if (a.type === 'balance') {
    const names = []; a.scales.forEach(sc => [sc.l, sc.r].forEach(it => { if (names.indexOf(it.name) < 0) names.push(it.name); }));
    const gt = {}; names.forEach(n => { gt[n] = new Set(); });
    a.scales.forEach(sc => { if (sc.down === 'l') gt[sc.l.name].add(sc.r.name); else if (sc.down === 'r') gt[sc.r.name].add(sc.l.name); });
    for (let k = 0; k < names.length; k++) names.forEach(x => [...gt[x]].forEach(y => gt[y].forEach(z => gt[x].add(z))));
    if (names.some(n => gt[n].has(n))) return { err: '저울끼리 서로 어긋난다(순환)' };
    return { names, rank: n => gt[n].size, lt: n => names.filter(m => gt[m].has(n)).length, total: names.length, kind: 'order' };
  }
  const key = { len_bars: 'rows', cups: 'items', area_shapes: 'shapes' }[a.type]; if (!key) return null;
  const rows = a[key];
  const val = x => a.type === 'len_bars' ? x.len : a.type === 'area_shapes' ? (x.cells ? x.cells.length : x.w * x.h)
    : (by === 'fill' ? x.w * x.h * (x.fill || 0) : x.w * x.h);
  return { names: rows.map(x => x.label), v: rows.map(val), kind: 'value' };
}
function checkCmp4(where, q) {
  const S = (q.variant_rule || {}).cmp4; if (!S || !S.ask) return;
  const T = cmp4Truth(q.asset, S.by); if (!T) return;
  if (T.err) return bad(where, 'cmp4 ' + T.err);
  let ans = null;
  if (T.kind === 'value') {
    const sorted = T.v.slice().sort((x, y) => x - y); const want = S.ask === 'most' ? sorted[sorted.length - 1] : S.ask === 'least' ? sorted[0] : sorted[1];
    if (S.ask === 'mid' && T.v.length !== 3) return bad(where, "cmp4 ask:'mid' 는 셋일 때만");
    if (T.v.filter(x => x === want).length !== 1) return bad(where, `cmp4 ${S.ask} 정답이 하나로 안 정해진다 (${T.v.join(',')})`);
    ans = T.names[T.v.indexOf(want)];
  } else {
    const pickN = T.names.filter(n => S.ask === 'most' ? T.rank(n) === T.total - 1 : S.ask === 'least' ? T.lt(n) === T.total - 1 : (T.rank(n) === 1 && T.lt(n) === 1));
    if (pickN.length !== 1) return bad(where, `cmp4 저울로 ${S.ask} 가 하나로 안 정해진다`);
    ans = pickN[0];
  }
  if (q.kind === 'sa') { if (!Array.isArray(q.answer) || String(q.answer[0]).trim() !== ans) bad(where, `cmp4 단답 정답 ${q.answer} ≠ 그림이 말하는 ${ans}`); return; }
  if (!Array.isArray(q.options)) return;
  const cor = q.options.find(o => o.correct); if (!cor || typeof cor.t !== 'string') return;
  const has = t => String(t).split(/[\s,·]+/).some(w => w.replace(/(이에요|예요|이|가|은|는|을|를|과|와|에|의)$/, '') === ans) || String(t) === ans;
  if (!has(cor.t)) bad(where, `cmp4 정답 보기 「${cor.t}」 에 그림이 말하는 ${ans} 가 없다`);
  q.options.filter(o => !o.correct).forEach(o => { if (typeof o.t === 'string' && has(o.t)) bad(where, `cmp4 오답 보기 「${o.t}」 가 그림의 정답 ${ans} 를 가리킨다`); });
}


/* v1.4 — 50까지의 수: 발문(과 그림)에서 정답을 다시 계산해 정답 보기·단답과 대조한다 */
const SN = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'], NA1 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'], NA10 = ['', '열', '스물', '서른', '마흔', '쉰'];
const sinoOf = n => { const t = Math.floor(n / 10), o = n % 10; return (t > 1 ? SN[t] : '') + (t ? '십' : '') + SN[o]; };
const natOf = n => NA10[Math.floor(n / 10)] + NA1[n % 10];
function checkNum50(where, q) {
  const vr = q.variant_rule || {};
  if (!vr.read2 && !vr.seq50 && !vr.cmp3) return;
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const st = String(q.stem); let want = null, m;
  if (vr.read2) {
    if ((m = st.match(/^(\d+)[을를] 바르게 읽은/))) {
      const n = +m[1]; const ok = [sinoOf(n), natOf(n)];
      if (ok.indexOf(cor) < 0) bad(where, `read2 정답 「${cor}」 이 ${n} 의 읽기(${ok.join('/')})가 아니다`);
      wr.forEach(w => { if (ok.indexOf(w) >= 0) bad(where, `read2 오답 「${w}」 도 ${n} 의 바른 읽기다`); });
      return;
    }
    if ((m = st.match(/「([^」]+)」/))) { for (let n = 1; n <= 50; n++) if (sinoOf(n) === m[1] || natOf(n) === m[1]) want = n; }
    if (want === null) return bad(where, 'read2 발문에서 수를 못 읽었다: ' + st);
    /* 종류 검사 (2026-10-07 눈검사) — 「자리 바꿈」(X04) 꼬리를 단 오답은 정말 묶음·낱개를 바꾼 수여야 한다 (29 → 39 를 X04 로 달던 것) */
    const swp = String(want % 10) + String(Math.floor(want / 10));
    (q.options || []).filter(o => !o.correct && /-X04$/.test(o.mis || '')).forEach(o => { if (String(o.t) !== swp) bad(where, `read2 오답 ${o.t} 에 「자리 바꿈」 코드 — ${want} 를 바꾸면 ${swp}`); });
  } else if (vr.seq50) {
    if ((m = st.match(/(\d+)보다 1만큼 더 (큰|작은)/))) want = +m[1] + (m[2] === '큰' ? 1 : -1);
    else if ((m = st.match(/(\d+)[과와] (\d+) 사이/))) { if (+m[2] - +m[1] !== 2) bad(where, 'seq50 사이 문항의 두 수가 2 차이가 아니다'); want = +m[1] + 1; }
    else if ((m = st.match(/(\d+) 바로 (뒤|앞)의 수/))) want = +m[1] + (m[2] === '뒤' ? 1 : -1);
    else if ((m = st.match(/(\d+)의 바로 (아래|위) 칸/))) {
      want = +m[1] + (m[2] === '아래' ? 10 : -10);
      const a = q.asset || {}; const cs = a.cells || []; const cols = a.cols || 10;
      const i = cs.findIndex(c => Number(c) === +m[1]); const j = i + (m[2] === '아래' ? cols : -cols);
      if (i < 0 || j < 0 || j >= cs.length || (cs[j] !== null && cs[j] !== '?')) bad(where, 'seq50 배열표에서 물은 칸이 빈칸이 아니다');
      else { const k = cs.findIndex(c => c !== null && c !== '?'); const base = Number(cs[k]) - k; if (base + j !== want) bad(where, 'seq50 배열표 칸 수가 이어지지 않는다'); }
    }
    else return bad(where, 'seq50 발문 꼴을 모른다: ' + st);
  } else if (vr.cmp3) {
    if (!(m = st.match(/^([\d, ]+) 가운데 가장 (큰|작은)/))) return bad(where, 'cmp3 발문 꼴을 모른다: ' + st);
    const ns = m[1].split(',').map(x => +x.trim());
    if (new Set(ns).size !== 3) bad(where, 'cmp3 세 수가 서로 다르지 않다');
    want = m[2] === '큰' ? Math.max(...ns) : Math.min(...ns);
  }
  if (String(want) !== cor) bad(where, `${Object.keys(vr)[0]} 정답 ${cor} ≠ 다시 계산한 ${want}`);
  if (wr.indexOf(String(want)) >= 0) bad(where, `${Object.keys(vr)[0]} 오답 보기에 정답 ${want} 가 섞였다`);
}
/* v1.5 — 글자를 만들어요: 그림에서 정답을 다시 계산해 정답 보기·단답과 대조 (원본·변형 모두)
   build: c+v · cons/vow: s 를 나눈 것 · place: 짜임 자리 · table: ? 칸 */
function checkJamo(where, q) {
  const J = (q.variant_rule || {}).jamo; if (!J) return;
  const a = q.asset || {}; const ask = J.ask || 'build'; let ans = null;
  if (ask === 'build') { if (a.type !== 'jamo') return bad(where, 'jamo build 는 jamo 그림이 있어야'); ans = hj(a.c, a.v); }
  else if (ask === 'cons' || ask === 'vow' || ask === 'place') {
    if (a.type !== 'jamo' || !hs(a.s)) return bad(where, 'jamo ' + ask + ' 는 글자(s)가 있는 jamo 그림이 있어야');
    const sp = hs(a.s);
    if (ask === 'cons') ans = sp.c; else if (ask === 'vow') ans = sp.v;
    else { const L = hl(sp.v); if (L === 'mix') return bad(where, 'jamo place 는 옆으로·위아래로 짜임만(둘러싸는 모음자 제외)');
      const role = J.role === 'v' ? 'v' : 'c'; ans = L === 'side' ? (role === 'c' ? '왼쪽' : '오른쪽') : (role === 'c' ? '위쪽' : '아래쪽'); }
  } else if (ask === 'table') {
    if (a.type !== 'syl_table' || !a.q) return bad(where, 'jamo table 은 ? 칸이 있는 syl_table 그림이 있어야');
    ans = hj(a.cons[a.q[0]], a.vows[a.q[1]]);
  } else return bad(where, 'jamo ask 를 모른다: ' + ask);
  if (!ans) return bad(where, 'jamo 정답을 그림에서 못 셈했다');
  { const OK = {'ㅑ':'ㄱㄴㅅㅇ','ㅕ':'ㄱㄴㄹㅁㅂㅅㅇㅈㅊㅍㅎ','ㅛ':'ㄱㄴㄹㅁㅅㅇㅈㅊㅍㅎ','ㅠ':'ㄱㄴㄹㅁㅂㅅㅇㅈㅊㅍㅎ','ㅒ':'ㅇㄱㅈ','ㅖ':'ㅇㄱㅎ','ㅘ':'ㄱㄴㅇㅈㅎ','ㅙ':'ㄱㄷㅅㅇ','ㅝ':'ㄱㅁㅇㅈㅎ','ㅞ':'ㄱㅇㅎ','ㅢ':'ㅇㅎ'};
    const sp = hs(ask === 'table' || ask === 'build' ? ans : a.s); if (sp && OK[sp.v] && OK[sp.v].indexOf(sp.c) < 0) bad(where, `jamo 낯선 글자 「${hj(sp.c, sp.v)}」 — 1학년 눈에 익은 짝만 정답으로`); }
  if (q.kind === 'sa') { if (!Array.isArray(q.answer) || String(q.answer[0]) !== ans) bad(where, `jamo 단답 정답 ${q.answer} ≠ 그림이 말하는 ${ans}`); return; }
  const cor = (q.options || []).find(o => o.correct);
  if (!cor || String(cor.t) !== ans) bad(where, `jamo 정답 보기 「${cor && cor.t}」 ≠ 그림이 말하는 ${ans}`);
  (q.options || []).filter(o => !o.correct).forEach(o => { if (String(o.t) === ans) bad(where, `jamo 오답 보기에 정답 ${ans} 가 섞였다`); });
  /* 그림이 정답을 그대로 보여 주면 문제가 아니다 */
  if (ask === 'build' && a.s) bad(where, 'jamo build 인데 그림에 답 글자 s 가 보인다');
  if (ask === 'table' && hj(a.cons[a.q[0]], a.vows[a.q[1]]) && a.q[0] < 0) bad(where, 'jamo table ? 칸이 없다');
  if ((ask === 'cons' || ask === 'vow') && a.lay && a.lay !== 'blank') bad(where, 'jamo ' + ask + ' 인데 짜임 칸에 답이 보인다(lay 는 blank 만)');
}
/* v1.6 — 받침이 있는 글자: 그림·발문에서 정답을 다시 셈해 정답 보기·단답과 대조 (원본·변형 모두)
   add: base+b · find: s 의 받침 · has: 받침 있는(neg 면 없는) 보기가 하나뿐 · swap: 발문의 바꿀 받침 · word: 낱말 at 글자의 받침 */
/* 「낱말」 뒤 조사 — 받침 따라 은/는·이/가·을/를·과/와·이에요/예요·이라고/라고·으로/로 (2026-10-07, 1-1 국어 u2 눈검사에서 80곳) */
const JO_RE = /「([^」]*)」(이에요|예요|이라고|라고|으로|로|은|는|이|가|을|를|과|와)(?![가-힣])/g;
const JO_PAIR = {'이에요':['이에요','예요'],'예요':['이에요','예요'],'이라고':['이라고','라고'],'라고':['이라고','라고'],'은':['은','는'],'는':['은','는'],'이':['이','가'],'가':['이','가'],'을':['을','를'],'를':['을','를'],'과':['과','와'],'와':['과','와']};
function joWant(w, j){ const last = [...w.replace(/[.!?…\s]+$/, '')].pop() || ''; if (!(last >= '가' && last <= '힣')) return null;   /* 숫자·괄호로 끝나면 읽는 소리를 몰라 건너뜀 */
  const t = (last.charCodeAt(0) - 0xAC00) % 28;
  if (j === '으로' || j === '로') return (t === 0 || t === 8) ? '로' : '으로';
  return JO_PAIR[j][t ? 0 : 1]; }
function checkJosa(where, q){
  const texts = [q.stem].concat(q.explanation || [], (q.options || []).map(o => typeof o.t === 'string' ? o.t : ''));
  texts.forEach(s => { if (typeof s !== 'string') return; let m; JO_RE.lastIndex = 0;
    while ((m = JO_RE.exec(s))){ const want = joWant(m[1], m[2]); if (want && want !== m[2]) bad(where, `조사 「${m[1]}」${m[2]} → ${want}`); } });
}
/* v1.7 된소리 — 엔진 TW_* 표와 따로 들고 정답을 발문·그림에서 다시 셈한다 (2026-10-07) */
const TW_P = {'ㄲ':'ㄱ','ㄸ':'ㄷ','ㅃ':'ㅂ','ㅆ':'ㅅ','ㅉ':'ㅈ'}; const TW_U = {'ㄱ':'ㄲ','ㄷ':'ㄸ','ㅂ':'ㅃ','ㅅ':'ㅆ','ㅈ':'ㅉ'};
const TW_FAMILIAR = ['굴','꿀','달','딸','살','쌀','방','빵','불','뿔','담','땀','개','깨','시','씨'];
const TW_PIC = {'🍓':'딸기','🍯':'꿀','🍞':'빵','🍡':'떡','🐦':'까치','🐘':'코끼리','🦏':'코뿔소','🥜':'땅콩','📿':'팔찌','🐰':'토끼','🍚':'쌀','🌱':'씨앗','🛷':'썰매'};
const twFirsts = w => [...String(w)].map(ch => (hs3(ch) || {}).c).filter(Boolean);
function checkTwin(where, q) {
  const R = (q.variant_rule || {}).twin; if (!R) return;
  const ask = R.ask || 'shape'; let ans = null; const st = String(q.stem || '');
  if (ask === 'shape') { let m;
    if (R.dir === 'split') { m = st.match(/^(ㄲ|ㄸ|ㅃ|ㅆ|ㅉ)은 어떤 자음자를 두 번 쓴/); if (!m) return bad(where, 'twin shape split 발문은 「ㄲ은 어떤 자음자를 두 번 쓴…」 꼴'); ans = TW_P[m[1]]; }
    else { m = st.match(/^(ㄱ|ㄷ|ㅂ|ㅅ|ㅈ)을 두 번 나란히 쓰/); if (!m) return bad(where, 'twin shape make 발문은 「ㄱ을 두 번 나란히 쓰…」 꼴'); ans = TW_U[m[1]]; } }
  else if (ask === 'swap') { const m = st.match(/^「(.)」의 (.)을 (.)으로 바/); if (!m) return bad(where, 'twin swap 발문은 「「방」의 ㅂ을 ㅃ으로 바…」 꼴');
    const p = hs3(m[1]); if (!p || p.c !== m[2]) return bad(where, `twin swap 발문의 ${m[2]} ≠ 「${m[1]}」의 첫 자음자`);
    if (!(TW_P[m[3]] === m[2] || TW_U[m[3]] === m[2])) bad(where, `twin swap ${m[2]}→${m[3]} 는 예사소리·된소리 짝이 아니다`);
    ans = hj3(m[3], p.v, p.b); if (TW_FAMILIAR.indexOf(m[1]) < 0 || TW_FAMILIAR.indexOf(ans) < 0) bad(where, `twin swap 낯선 글자 「${m[1]}」→「${ans}」`); }
  else if (ask === 'pick') { const m = st.match(/^된소리 (ㄲ|ㄸ|ㅃ|ㅆ|ㅉ)이 들어간 낱말/); if (!m) return bad(where, 'twin pick 발문은 「된소리 ㄲ이 들어간 낱말…」 꼴');
    const os = (q.options || []).filter(o => twFirsts(o.t).indexOf(m[1]) >= 0); if (os.length !== 1) return bad(where, `twin pick 보기 가운데 ${m[1]} 낱말이 ${os.length}개(하나여야)`); ans = String(os[0].t); }
  else if (ask === 'word') { const a = q.asset || {}; if (a.type !== 'scene' || !TW_PIC[a.icon]) return bad(where, 'twin word 는 된소리 그림 낱말 scene 그림이 있어야: ' + a.icon); ans = TW_PIC[a.icon]; }
  else return bad(where, 'twin ask 를 모른다: ' + ask);
  if (!ans) return bad(where, 'twin 정답을 발문·그림에서 못 셈했다');
  if (q.kind === 'sa') { if (!Array.isArray(q.answer) || String(q.answer[0]) !== ans) bad(where, `twin 단답 정답 ${q.answer} ≠ ${ans}`); return; }
  const cor = (q.options || []).find(o => o.correct);
  if (!cor || String(cor.t) !== ans) bad(where, `twin 정답 보기 「${cor && cor.t}」 ≠ 발문·그림이 말하는 ${ans}`);
  (q.options || []).filter(o => !o.correct).forEach(o => { if (String(o.t) === ans) bad(where, `twin 오답 보기에 정답 ${ans} 가 섞였다`); });
}
function checkBat(where, q) {
  const R = (q.variant_rule || {}).bat; if (!R) return;
  const a = q.asset || {}; const ask = R.ask || 'add'; let ans = null;
  if (ask === 'add') { if (a.type !== 'bat') return bad(where, 'bat add 는 bat 그림이 있어야');
    const p = a.base ? hs(a.base) : (a.c && a.v ? { c: a.c, v: a.v } : null); if (!p || !a.b) return bad(where, 'bat add 그림에 base(또는 c·v)와 b 가 있어야');
    ans = hj3(p.c, p.v, a.b); if (a.s) bad(where, 'bat add 인데 그림에 답 글자 s 가 보인다'); }
  else if (ask === 'find') { const p = hs3(a.s); if (a.type !== 'bat' || !p || !p.b) return bad(where, 'bat find 는 받침 있는 글자(s)가 있는 bat 그림이 있어야');
    ans = p.b; if (a.b) bad(where, 'bat find 인데 그림에 받침 b 가 보인다'); if (a.lay && a.lay !== 'blank' && a.lay !== 'b') bad(where, "bat find 인데 짜임 칸에 받침이 보인다(lay 는 'blank'·'b' 만)"); }
  else if (ask === 'has') { if (q.asset) bad(where, 'bat has 는 그림 없는 문항 전용');
    const os = (q.options || []).filter(o => { const p = hs3(o.t); return R.neg ? (p && !p.b) : (p && p.b); });
    if (os.length !== 1) return bad(where, `bat has 보기 가운데 받침이 ${R.neg ? '없는' : '있는'} 글자가 ${os.length}개(하나여야)`); ans = String(os[0].t);
    if ((q.options || []).some(o => !hs3(o.t))) bad(where, 'bat has 보기는 한 글자씩'); }
  else if (ask === 'swap') { const p = hs3(a.s); const m = String(q.stem).match(/받침 (\S)을 (\S)(?:으로|로) (?:바꾸면|바꾼)/);
    if (a.type !== 'bat' || !p || !p.b || !m) return bad(where, 'bat swap 은 받침 있는 s 그림과 「받침 ㄱ을 ㄴ으로 바꾸면」 발문이 있어야');
    if (m[1] !== p.b) bad(where, `bat swap 발문의 받침 ${m[1]} ≠ 그림 글자의 받침 ${p.b}`);
    if (m[2] === p.b) bad(where, 'bat swap 바꿀 받침이 원래와 같다'); ans = hj3(p.c, p.v, m[2]);
    if (!/^[ㄹ]$/.test(m[2]) && !/으로 바(?:꾸면|꾼)/.test(q.stem)) bad(where, 'bat swap 조사 — ㄹ 아니면 「으로」'); if (m[2] === 'ㄹ' && !/ㄹ로 바(?:꾸면|꾼)/.test(q.stem)) bad(where, 'bat swap 조사 — ㄹ 은 「로」'); }
  else if (ask === 'word') { if (a.type !== 'bat_word') return bad(where, 'bat word 는 bat_word 그림이 있어야'); const p = hs3([...String(a.w)][a.at]); if (!p || !p.b) return; ans = p.b; }
  else return bad(where, 'bat ask 를 모른다: ' + ask);
  if (!ans) return bad(where, 'bat 정답을 그림에서 못 셈했다');
  if ((ask === 'add' || ask === 'swap') && BAT_FAMILIAR.indexOf(ans) < 0) bad(where, `bat 낯선 정답 글자 「${ans}」 — 1학년 눈에 익은 글자만 정답으로`);
  if (q.kind === 'sa') { if (!Array.isArray(q.answer) || String(q.answer[0]) !== ans) bad(where, `bat 단답 정답 ${q.answer} ≠ 그림이 말하는 ${ans}`); return; }
  const cor = (q.options || []).find(o => o.correct);
  if (!cor || String(cor.t) !== ans) bad(where, `bat 정답 보기 「${cor && cor.t}」 ≠ 그림이 말하는 ${ans}`);
  (q.options || []).filter(o => !o.correct).forEach(o => { if (String(o.t) === ans) bad(where, `bat 오답 보기에 정답 ${ans} 가 섞였다`); });
}
/* v1.8 낱말 묶음·짝·글자판 — 엔진 WC·WL 표와 따로 들고 정답을 발문·그림에서 다시 셈한다 (2026-10-10) */
const WCX = {
  body:['눈','코','입','귀','손','발','머리','팔','다리','어깨','무릎','이마','목'],
  family:['엄마','아빠','할머니','할아버지','언니','오빠','누나','형','동생','이모','삼촌','고모'],
  food:['국수','김치','김밥','피자','사과','떡','빵','우유','라면','두부','감자','수박'],
  school:['칠판','교실','급식실','사물함','교과서','보건실','교문','강당','교탁'],
  town:['빵집','은행','소방서','병원','우체국','꽃집','치과','시장','약국','경찰서','가구점','미용실']};
const WCX_NEAR = ['옷','모자','양말','장갑','신발','친구','선생님','의사','이웃','경찰관','접시','숟가락','젓가락','냄비','컵','침대','소파','냉장고','이불','거실','부엌','안방','욕실'];
const WCX_STEM = {'몸을 나타내는':'body','가족을 부르는':'family','음식을 나타내는':'food','학교에서 볼 수 있는':'school','동네에서 볼 수 있는':'town'};
const WCX_ALL = new Set([].concat(...Object.values(WCX), WCX_NEAR));
function checkWcat(where, q) {
  const R = (q.variant_rule || {}).wcat; if (!R) return;
  const m = String(q.stem).match(/^(몸을 나타내는|가족을 부르는|음식을 나타내는|학교에서 볼 수 있는|동네에서 볼 수 있는) 낱말(이 아닌 것)?은 어느 것인가요\?$/);
  if (!m) return bad(where, 'wcat 발문은 「몸을 나타내는 낱말은(이 아닌 것은) 어느 것인가요?」 꼴');
  const cat = WCX[WCX_STEM[m[1]]], neg = !!m[2]; const os = q.options || [];
  os.forEach(o => { if (!WCX_ALL.has(String(o.t))) bad(where, `wcat 보기 「${o.t}」 는 묶음 표에 없는 낱말 — 맞고 틀림을 검사기가 셀 수 없다`); });
  const hit = os.filter(o => neg ? cat.indexOf(String(o.t)) < 0 : cat.indexOf(String(o.t)) >= 0);
  if (hit.length !== 1) return bad(where, `wcat 보기 가운데 ${neg ? '묶음 밖' : '묶음 안'} 낱말이 ${hit.length}개(하나여야)`);
  if (!hit[0].correct) bad(where, `wcat 정답 보기가 발문이 말하는 「${hit[0].t}」 가 아니다`);
  /* 학교·동네 묶음은 사람·음식·몸 낱말을 「아닌 것」으로 쓰면 답이 둘이 된다(그 사람도 학교에서 볼 수 있다) — 곁 낱말·맞은편 장소 묶음만 */
  const cat0 = WCX_STEM[m[1]];
  if (cat0 === 'school' || cat0 === 'town') os.forEach(o => { const t = String(o.t); if (cat.indexOf(t) < 0 && WCX[cat0 === 'school' ? 'town' : 'school'].indexOf(t) < 0 && WCX_NEAR.indexOf(t) < 0) bad(where, `wcat ${cat0} 묶음 보기 「${t}」 — 사람·음식·몸 낱말은 학교·동네에서도 볼 수 있어 답이 흐려진다`);
    else if (cat.indexOf(t) < 0 && ['친구','선생님','의사','이웃','경찰관','접시','숟가락','젓가락','냄비','컵','옷','모자','양말','장갑','신발'].indexOf(t) >= 0) bad(where, `wcat ${cat0} 묶음 보기 「${t}」 — 학교·동네에서도 볼 수 있는 곁 낱말`); });
}
const WLX_BODY = {'눈':'보다','귀':'듣다','코':'냄새를 맡다','입':'먹다','손':'잡다','발':'걷다'};
const WLX_PLACE = {'병원':'아픈 곳을 치료받아요','치과':'이를 치료받아요','우체국':'편지를 보내요','도서관':'책을 빌려요','빵집':'빵을 사요','소방서':'불을 끄러 출동해요','은행':'돈을 맡겨요','꽃집':'꽃을 사요','급식실':'점심을 먹어요','약국':'약을 사요'};
const WLX_APART = [['병원','치과'],['병원','약국'],['치과','약국']];
const inv = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [v, k]));
function checkWlink(where, q) {
  const R = (q.variant_rule || {}).wlink; if (!R) return;
  const st = String(q.stem); let m, ans, T, back;
  if ((m = st.match(/^「(.+)」(?:으로|로) 하는 일을 나타내는 말은/))) { ans = WLX_BODY[m[1]]; T = WLX_BODY; back = false; }
  else if ((m = st.match(/^「(.+)」는 몸의 어느 곳으로 하는 일인가요/))) { ans = inv(WLX_BODY)[m[1]]; T = WLX_BODY; back = true; }
  else if ((m = st.match(/^「(.+)」에서 하는 일은/))) { ans = WLX_PLACE[m[1]]; T = WLX_PLACE; back = false; }
  else if ((m = st.match(/^「(.+)」 — 이 일을 하는 곳은/))) { ans = inv(WLX_PLACE)[m[1]]; T = WLX_PLACE; back = true; }
  else return bad(where, 'wlink 발문 꼴을 모른다');
  if (!ans) return bad(where, `wlink 발문의 「${m[1]}」 이 짝 표에 없다`);
  const os = q.options || []; const keys = os.map(o => back ? String(o.t) : inv(T)[String(o.t)]);
  if (keys.some(k => !k || !T[k])) bad(where, 'wlink 보기에 짝 표 밖 말이 섞였다');
  const cor = os.find(o => o.correct); if (!cor || String(cor.t) !== ans) bad(where, `wlink 정답 보기 「${cor && cor.t}」 ≠ ${ans}`);
  const places = back ? keys : keys.concat(T === WLX_PLACE ? [m[1]] : []);
  if (T === WLX_PLACE) WLX_APART.forEach(([x, y]) => { if (places.indexOf(x) >= 0 && places.indexOf(y) >= 0) bad(where, `wlink 한 문항에 「${x}」·「${y}」 가 함께 — 헷갈리는 짝`); });
}
function gridFind(rows, w) {
  const R = rows.map(x => [...String(x)]); const W = String(w);
  for (const rw of R) if (rw.join('').indexOf(W) >= 0) return true;
  for (let j = 0; j < R[0].length; j++) if (R.map(rw => rw[j]).join('').indexOf(W) >= 0) return true;
  return false;
}
function checkGrid(where, q) {
  const a = q.asset; if (!a || a.type !== 'word_grid' || !Array.isArray(a.rows)) return;
  const st = String(q.stem);
  if (q.kind === 'sa') { if (/숨어 있는 낱말/.test(st) && Array.isArray(q.answer)) q.answer.forEach(x => { if (!gridFind(a.rows, x)) bad(where, `word_grid 단답 정답 「${x}」 이 글자판에 없다`); }); return; }
  const os = q.options || []; if (!os.length) return;
  const neg = /숨어 있지 않은/.test(st); if (!neg && !/숨어 있는/.test(st)) return;
  const hit = os.filter(o => neg ? !gridFind(a.rows, o.t) : gridFind(a.rows, o.t));
  if (hit.length !== 1) return bad(where, `word_grid 보기 가운데 ${neg ? '숨어 있지 않은' : '숨어 있는'} 낱말이 ${hit.length}개(하나여야)`);
  if (!hit[0].correct) bad(where, `word_grid 정답 보기가 글자판이 말하는 「${hit[0].t}」 가 아니다`);
}
/* v1.9 인사말·글자와 소리 — 엔진 GR·YN 표와 따로 들고 정답을 발문에서 다시 셈한다 (2026-10-10) */
const YNX_WORDS = ['악어','걸음','국어','목요일','먹이','울음','월요일','금요일','일요일','음악','발음','웃음','얼음','놀이','낙엽','길이','목욕','연어','문어','할아버지','놀이터','나들이'];
const YNX_SAME = ['우산','가방','바다','나무','다리미','토끼','사과','기차','강아지','고양이','포도','모자','구름','오이','우유','사자','거미','자동차'];
function ynx(w) { const a = [...String(w)].map(hs3); if (a.some(x => !x)) return null;
  for (let i = 0; i < a.length - 1; i++) if (a[i].b && a[i].b !== 'ㅇ' && a[i].b !== 'ㅎ' && a[i + 1].c === 'ㅇ') { a[i + 1].c = a[i].b; a[i].b = ''; }
  return a.map(x => hj3(x.c, x.v, x.b)).join(''); }
function checkYeon(where, q) {
  const R = (q.variant_rule || {}).yeon; if (!R) return;
  YNX_WORDS.forEach(w => { if (ynx(w) === w) bad(where, `yeon 표 「${w}」 가 소리가 안 바뀐다`); });
  YNX_SAME.forEach(w => { if (ynx(w) !== w) bad(where, `yeon 같은 소리 표 「${w}」 가 바뀐다`); });
  const st = String(q.stem), os = q.options || []; let m;
  if ((m = st.match(/^「(.+)」(?:은|는) 어떻게 소리 나나요\?$/))) {
    const p = '[' + ynx(m[1]) + ']'; if (YNX_WORDS.indexOf(m[1]) < 0) bad(where, `yeon 「${m[1]}」 은 표 밖 낱말`);
    const c = os.filter(o => o.correct); if (c.length !== 1 || String(c[0].t) !== p) bad(where, `yeon 정답 ≠ ${p}`);
    os.filter(o => !o.correct).forEach(o => { if (String(o.t) === p) bad(where, 'yeon 오답에 정답 소리'); });
  } else if ((m = st.match(/^글자와 소리가 (다른|같은) 낱말은 어느 것인가요\?$/))) {
    const diff = m[1] === '다른'; const hit = os.filter(o => { const t = String(o.t); if (YNX_WORDS.indexOf(t) < 0 && YNX_SAME.indexOf(t) < 0) bad(where, `yeon 보기 「${t}」 는 표 밖`); return diff ? ynx(t) !== t : ynx(t) === t; });
    if (hit.length !== 1) return bad(where, `yeon 보기 가운데 ${m[1]} 낱말이 ${hit.length}개(하나여야)`);
    if (!hit[0].correct) bad(where, `yeon 정답 보기가 「${hit[0].t}」 가 아니다`);
  } else bad(where, 'yeon 발문 꼴을 모른다');
}
const GRX = [['meet','만났을 때','안녕?','안녕하세요?'],['bye','헤어질 때','잘 가.','안녕히 가세요.'],['thank','도움을 받았을 때','고마워.','고맙습니다.'],
  ['sorry','잘못했을 때','미안해.','죄송합니다.'],['congr','좋은 일을 축하할 때','축하해.','축하드립니다.'],['out','집을 나설 때',null,'다녀오겠습니다.'],
  ['home','집에 돌아왔을 때',null,'다녀왔습니다.'],['eatb','밥을 먹기 전에',null,'잘 먹겠습니다.'],['eata','밥을 다 먹은 뒤에',null,'잘 먹었습니다.'],
  ['night','잠자기 전에','잘 자.','안녕히 주무세요.'],['morn','아침에 일어났을 때','잘 잤어?','안녕히 주무셨어요?']];
const GRX_APART = [['meet','morn'],['meet','bye'],['meet','home'],['thank','eatb'],['thank','eata'],['bye','out']];
const grApart = (x, y) => GRX_APART.some(([a, b]) => (a === x && b === y) || (a === y && b === x));
function checkGreet(where, q) {
  const R = (q.variant_rule || {}).greet; if (!R) return;
  const st = String(q.stem), os = q.options || []; let m;
  if ((m = st.match(/^(.+) (친구에게|웃어른께) 하는 인사말로 알맞은 것은 어느 것인가요\?$/))) {
    const s0 = GRX.find(x => x[1] === m[1]); if (!s0) return bad(where, `greet 때 「${m[1]}」 가 표에 없다`);
    const col = m[2] === '친구에게' ? 2 : 3; if (!s0[col]) return bad(where, 'greet 그 상대에게 하는 인사말이 표에 없다');
    const c = os.filter(o => o.correct); if (c.length !== 1 || String(c[0].t) !== s0[col]) bad(where, `greet 정답 ≠ ${s0[col]}`);
    os.filter(o => !o.correct).forEach(o => { const t = String(o.t); const row = GRX.find(x => x[2] === t || x[3] === t);
      if (!row) return bad(where, `greet 오답 「${t}」 표 밖`); if (row === s0 && col === 2) bad(where, 'greet 친구에게 묻는데 같은 때 웃어른 말이 오답');
      if (row !== s0 && grApart(row[0], s0[0])) bad(where, `greet 「${t}」 는 ${m[1]}에도 맞을 수 있다`); });
  } else if ((m = st.match(/^「(.+)」(?:은|는) 언제 하는 인사말인가요\?$/))) {
    const s0 = GRX.find(x => x[2] === m[1] || x[3] === m[1]); if (!s0) return bad(where, `greet 인사말 「${m[1]}」 표 밖`);
    if (m[1] === '안녕?') bad(where, 'greet 「안녕?」 은 만날 때·헤어질 때 다 써서 때를 물을 수 없다');
    const c = os.filter(o => o.correct); if (c.length !== 1 || String(c[0].t) !== s0[1]) bad(where, `greet 정답 ≠ ${s0[1]}`);
    os.filter(o => !o.correct).forEach(o => { const row = GRX.find(x => x[1] === String(o.t)); if (!row) return bad(where, `greet 오답 때 「${o.t}」 표 밖`); if (row === s0 || grApart(row[0], s0[0])) bad(where, `greet 오답 때 「${o.t}」 도 맞을 수 있다`); });
  } else bad(where, 'greet 발문 꼴을 모른다');
}
/* v2.0 문장 부호 — 엔진 PN 표와 따로 들고 정답을 발문에서 다시 셈한다 (2026-10-10) */
const PN_Q = ["너는 어디에 가니", "이 꽃 이름이 뭐예요", "누가 창문을 열었어", "언제 우리 집에 올래", "무슨 노래를 좋아하니", "점심에 뭐 먹었어", "몇 시에 일어났니", "왜 울고 있어", "어떤 색을 제일 좋아해", "공원에 누구랑 갔어"];
const PN_EX = ["우아, 정말 크구나", "와, 별이 참 많구나", "야호, 우리 반이 이겼다", "어머나, 꽃이 활짝 피었구나", "아이고, 깜짝이야", "와, 바다가 정말 넓구나", "만세, 드디어 다 만들었다", "우아, 진짜 맛있다"];
const PN_ST = ["나는 아침마다 이를 닦아요", "우리 집 강아지는 하얀색이에요", "동생은 그림을 그려요", "오늘은 수요일이에요", "형이 공을 차요", "고양이가 소파에서 자요", "나는 학교에 걸어가요", "할머니 댁은 시골에 있어요", "교실에 꽃병이 있어요", "아빠가 설거지를 해요"];
const PN_CALL = [["민지야", "이리 와."], ["선생님", "책을 다 읽었어요."], ["엄마", "물 좀 주세요."], ["하람아", "같이 놀자."], ["아빠", "저 왔어요."], ["누나", "이것 좀 봐."], ["서아야", "밥 먹자."], ["할아버지", "감사합니다."]];
const PNX_NAME = {',':'쉼표', '.':'마침표', '?':'물음표', '!':'느낌표'};
const PNX_LAB = m => `${PNX_NAME[m]}( ${m} )`;
const PNX_TYPE = {q:'묻는 문장', ex:'느낌을 나타내는 문장', st:'설명하는 문장'};
const PNX_READ = {q:'끝을 살짝 올려 묻듯이 읽어요', ex:'느낌을 살려 힘 있게 읽어요', st:'끝을 내려 차분하게 읽어요'};
const PNX_MARK = {q:'?', ex:'!', st:'.'};
const pnxType = s => (PN_Q.indexOf(s) >= 0 ? 'q' : PN_EX.indexOf(s) >= 0 ? 'ex' : PN_ST.indexOf(s) >= 0 ? 'st' : null);
/* 쉬어 읽기 표시 정답 — 엔진 pnPause 를 베끼지 않고 부호 하나씩 따로 센다 */
function pnxPause(line){ let out = ''; const a = [...String(line)];
  a.forEach((ch, i) => { out += ch; if (',.?!'.indexOf(ch) >= 0 && a[i + 1] === ' ') out += ch === ',' ? '∨' : '≫'; });
  return out; }
function checkPunct(where, q) {
  const R = (q.variant_rule || {}).punct; if (!R) return;
  [PN_Q, PN_EX, PN_ST].forEach((B, bi) => B.forEach(s => { if (/[.?!]$/.test(s)) bad(where, `punct 표 「${s}」 끝에 부호가 붙어 있다`); if (bi !== 1 && s.indexOf(',') >= 0) bad(where, `punct 표 「${s}」 묻는·설명 문장에 쉼표`); }));
  PN_EX.forEach(s => { if (s.indexOf(', ') < 0) bad(where, `punct 느낌 문장 「${s}」 은 감탄하는 말 + 쉼표로 시작해야`); });
  PN_CALL.forEach(c => { if (!/[.?!]$/.test(c[1])) bad(where, `punct 부르는 말 뒤 「${c[1]}」 끝 부호 없음`); });
  const st = String(q.stem), os = q.options || []; let m, ans = null;
  const cor = os.filter(o => o.correct); if (cor.length !== 1) return bad(where, 'punct 정답 보기가 하나가 아니다');
  if ((m = st.match(/^다음 문장의 ◯에 알맞은 문장 부호는 어느 것인가요\?\n「(.+)」$/))) {
    const body = m[1];
    if (/◯$/.test(body)) { const ty = pnxType(body.slice(0, -1)); if (!ty) return bad(where, `punct 문장 「${body}」 표 밖`); ans = PNX_LAB(PNX_MARK[ty]); }
    else { const k = body.indexOf('◯ '); const c = PN_CALL.find(x => x[0] === body.slice(0, k) && x[1] === body.slice(k + 2)); if (!c) return bad(where, `punct 부르는 말 「${body}」 표 밖`); ans = PNX_LAB(','); }
    os.forEach(o => { if (!Object.keys(PNX_NAME).some(x => PNX_LAB(x) === String(o.t))) bad(where, `punct 보기 「${o.t}」 는 부호 이름표가 아니다`); });
  } else if ((m = st.match(/^「(.+)([.?!])」(?:은|는|을|를) (어떤 문장인가요|어떻게 읽으면 좋을까요)\?$/))) {
    const ty = pnxType(m[1]); if (!ty) return bad(where, `punct 문장 「${m[1]}」 표 밖`);
    if (PNX_MARK[ty] !== m[2]) bad(where, `punct 「${m[1]}」 은 ${PNX_MARK[ty]} 로 끝나야`);
    const T = m[3] === '어떤 문장인가요' ? PNX_TYPE : PNX_READ; ans = T[ty];
    os.forEach(o => { if (Object.values(T).indexOf(String(o.t)) < 0) bad(where, `punct 보기 「${o.t}」 표 밖`); });
  } else if ((m = st.match(/^「(.+)」에 쉬어 읽기 표시를 알맞게 한 것은 어느 것인가요\?$/))) {
    ans = pnxPause(m[1]);
    os.forEach(o => { if (String(o.t).replace(/[∨≫]/g, '') !== m[1]) bad(where, `punct 쉬어 읽기 보기 「${o.t}」 가 원래 문장과 글자가 다르다`); });
  } else if ((m = st.match(/^「([.,?!])」의 이름은 무엇인가요\?$/))) {
    ans = PNX_NAME[m[1]];
    os.forEach(o => { if (Object.values(PNX_NAME).indexOf(String(o.t)) < 0) bad(where, `punct 보기 「${o.t}」 는 부호 이름이 아니다`); });
  } else return bad(where, 'punct 발문 꼴을 모른다');
  if (String(cor[0].t) !== ans) bad(where, `punct 정답 「${cor[0].t}」 ≠ ${ans}`);
  os.filter(o => !o.correct).forEach(o => { if (String(o.t) === ans) bad(where, 'punct 오답 보기에 정답이 섞였다'); });
}
/* v2.1 무엇을↔어찌하다 짝 — 엔진 CL_PAIRS 와 따로 들고 정답을 발문에서 다시 셈한다 (2026-10-10) */
const CLX = [
  ["모자를", "쓰다", "wear", ["입다", "신다", "끼다"]], ["옷을", "입다", "wear", ["신다", "끼다", "차다"]], ["바지를", "입다", "wear", ["쓰다", "신다", "끼다"]],
  ["양말을", "신다", "wear", ["입다", "쓰다", "끼다"]], ["신발을", "신다", "wear", ["입다", "쓰다", "끼다"]], ["장화를", "신다", "wear", ["입다", "쓰다", "끼다"]],
  ["장갑을", "끼다", "wear", ["신다", "입다", "차다"]], ["반지를", "끼다", "wear", ["신다", "입다", "차다"]], ["시계를", "차다", "wear", ["신다", "입다", "쓰다"]],
  ["연을", "날리다", "do", ["마시다", "부르다", "깎다"]], ["물을", "마시다", "do", ["날리다", "부르다", "깎다"]], ["노래를", "부르다", "do", ["마시다", "깎다", "날리다"]],
  ["피아노를", "치다", "do", ["마시다", "깎다", "날리다"]], ["피리를", "불다", "do", ["마시다", "깎다", "날리다"]], ["이를", "닦다", "do", ["마시다", "날리다", "부르다"]],
  ["손톱을", "깎다", "do", ["마시다", "부르다", "날리다"]], ["책을", "읽다", "do", ["마시다", "깎다", "부르다"]], ["신발 끈을", "묶다", "do", ["마시다", "부르다", "깎다"]],
  ["그림을", "그리다", "do", ["마시다", "깎다", "부르다"]], ["차를", "마시다", "do", ["부르다", "깎다", "날리다"]]
];
/* 「무엇을 + 말」이 어울리나: 표의 짝이면 true, 표의 「어울리지 않는 말」이면 false, 그 밖은 null(판단 못 함 = 표 밖) */
function clxFits(o, w) { const row = CLX.find(x => x[0] === o); if (!row) return null; if (row[1] === w) return true; if (row[3].indexOf(w) >= 0) return false; return null; }
function checkColloc(where, q) {
  const R = (q.variant_rule || {}).colloc; if (!R) return;
  CLX.forEach(x => { if (x[3].indexOf(x[1]) >= 0) bad(where, `colloc 표 「${x[0]}」 의 짝이 오답 칸에도 있다`); if (!/[을를]$/.test(x[0])) bad(where, `colloc 표 「${x[0]}」 은 을·를로 끝나야`); });
  const st = String(q.stem), os = q.options || []; let m;
  const cor = os.filter(o => o.correct); if (cor.length !== 1) return bad(where, 'colloc 정답 보기가 하나가 아니다');
  const wrong = os.filter(o => !o.correct);
  if ((m = st.match(/^「(.+) \(     \)」에 들어갈 알맞은 말은 어느 것인가요\?$/))) {
    const o = m[1]; if (clxFits(o, String(cor[0].t)) !== true) bad(where, `colloc 「${o} ${cor[0].t}」 는 표의 짝이 아니다`);
    wrong.forEach(w => { if (clxFits(o, String(w.t)) !== false) bad(where, `colloc 오답 「${o} ${w.t}」 가 표의 「어울리지 않는 말」이 아니다(맞을 수도 있다)`); });
  } else if ((m = st.match(/^「\(     \) (.+)」에 들어갈 알맞은 말은 어느 것인가요\?$/))) {
    const vb = m[1]; if (clxFits(String(cor[0].t), vb) !== true) bad(where, `colloc 「${cor[0].t} ${vb}」 는 표의 짝이 아니다`);
    wrong.forEach(w => { if (clxFits(String(w.t), vb) !== false) bad(where, `colloc 오답 「${w.t} ${vb}」 가 표의 「어울리지 않는 말」이 아니다(맞을 수도 있다)`); });
  } else if (st === '「무엇을」과 「어찌하다」가 어울리지 않는 것은 어느 것인가요?') {
    const sp = t => { const s = String(t); const k = s.lastIndexOf(' '); return [s.slice(0, k), s.slice(k + 1)]; };
    { const [o, w] = sp(cor[0].t); if (clxFits(o, w) !== false) bad(where, `colloc 정답 「${cor[0].t}」 이 어울리지 않는 짝이 아니다`); }
    wrong.forEach(x => { const [o, w] = sp(x.t); if (clxFits(o, w) !== true) bad(where, `colloc 오답 「${x.t}」 이 표의 어울리는 짝이 아니다`); });
  } else return bad(where, 'colloc 발문 꼴을 모른다');
}
/* v2.2 — 세 자리 수: 엔진과 따로 셈해 정답·오답을 다시 확인 (원본·변형 모두) */
const S3X = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const read3x = n => { if (n === 1000) return '천'; const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10; return (h ? (h > 1 ? S3X[h] : '') + '백' : '') + (t ? (t > 1 ? S3X[t] : '') + '십' : '') + S3X[o]; };
function check3(where, q) {
  const vr = q.variant_rule || {}; const key = ['n3', 'pv3', 'skip3', 'cmp3d', 'cards3'].find(k => vr[k]); if (!key) return;
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const st = String(q.stem).replace(/^이번에는 다른 보기예요\. /, ''); const a = q.asset && typeof q.asset === 'object' ? q.asset : null; let want = null, m;
  if (key === 'n3') {
    if (/^수 모형이 나타내는 수는/.test(st) || /^동전은 모두 얼마/.test(st)) { if (!a || a.type !== 'blocks3') return bad(where, 'n3 그림 문항인데 blocks3 가 없다'); want = String(a.h * 100 + a.t * 10 + a.o) + (/^동전/.test(st) ? '원' : ''); if (/^동전/.test(st) !== (a.unit === 'coin')) bad(where, 'n3 동전 발문과 그림 unit 이 어긋난다'); }
    else if ((m = st.match(/^((?:(?:100|10|1)이 \d+개(?:, )?)+)인 수는/))) { let n = 0; m[1].split(', ').forEach(p => { const z = p.match(/^(\d+)이 (\d+)개$/); n += Number(z[1]) * Number(z[2]); }); want = String(n); }
    else if ((m = st.match(/^(\d+)[을를] 바르게 읽은/))) { want = read3x(+m[1]); wr.forEach(w => { if (w === want) bad(where, 'n3 오답이 바른 읽기와 같다'); }); }
    else if ((m = st.match(/^「([^」]+)」[을를] 수로 쓰면/))) { for (let n = 100; n <= 1000; n++) if (read3x(n) === m[1]) want = String(n); if (want === null) return bad(where, 'n3 읽기를 수로 못 돌렸다: ' + m[1]); }
    else if ((m = st.match(/^100이 (\d+)개이면 얼마/))) want = String(100 * m[1]);
    else if ((m = st.match(/^(\d+)[은는] 100이 (?:몇 개|\(\s*\)개)/))) { if (+m[1] % 100) bad(where, 'n3 hcount 수가 몇백이 아니다'); want = String(+m[1] / 100); }
    else if ((m = st.match(/^10이 (\d+)개인 수는/))) want = String(10 * m[1]);
    else if ((m = st.match(/^(\d+)[은는] 10이 몇 개/))) { if (+m[1] % 10) bad(where, 'n3 tcount 수가 몇십이 아니다'); want = String(+m[1] / 10); }
    else return bad(where, 'n3 발문 꼴을 모른다: ' + st);
  } else if (key === 'pv3') {
    const PV = {'백': [0, 100], '십': [1, 10], '일': [2, 1]};
    if ((m = st.match(/^(\d+)에서 (백|십|일)의 자리 숫자는/))) want = String(m[1]).padStart(3, '0')[PV[m[2]][0]];
    else if ((m = st.match(/^(\d+)에서 숫자 (\d)[이가] 나타내는 값/))) { const ds = String(m[1]).split(''); if (ds.filter(x => x === m[2]).length !== 1) return bad(where, 'pv3 숫자가 한 번만 나오지 않는다: ' + st); want = String(+m[2] * Math.pow(10, ds.length - 1 - ds.indexOf(m[2]))); }
    else if ((m = st.match(/^(\d+)[을를] 각 자리의 값의 합으로/))) { const d = String(m[1]).split('').map(Number); want = `${d[0] * 100} + ${d[1] * 10} + ${d[2]}`; wr.forEach(w => { const sum = w.split(' + ').reduce((x, y) => x + Number(y), 0); if (sum === +m[1] && w.split(' + ').every((y, i) => +y % [100, 10, 1][i] === 0)) bad(where, 'pv3 펼친 식 오답이 바른 식이다: ' + w); }); }
    else if ((m = st.match(/^숫자 (\d)[이가] (\d+)[을를] 나타내는 수는/))) { const dd = m[1], val = +m[2]; const ok = x => { const s3 = String(x); const i = s3.length - 1 - Math.round(Math.log10(val / +dd)); return s3[i] === dd && s3.split('').filter(c => c === dd).length === 1; };
      if (!ok(cor)) bad(where, `pv3 which 정답 ${cor} 에서 ${dd} 가 ${val} 를 나타내지 않는다`); wr.forEach(w => { if (ok(w)) bad(where, `pv3 which 오답 ${w} 도 맞다`); }); return; }
    else if ((m = st.match(/^(\d+)의 자릿값 표예요/))) { if (!a || a.type !== 'place_table') return bad(where, 'pv3 table 인데 place_table 이 없다'); const d = String(m[1]).split('').map(Number); if (a.digits.join() !== d.join()) bad(where, 'pv3 표 숫자와 발문 수가 다르다'); const i = (a.values || []).findIndex(x => x === null || x === '?'); if (i < 0) return bad(where, 'pv3 표에 빈칸이 없다'); want = String(d[i] * [100, 10, 1][i]); }
    else return bad(where, 'pv3 발문 꼴을 모른다: ' + st);
  } else if (key === 'skip3') {
    if (!a || a.type !== 'jump_row') return bad(where, 'skip3 은 jump_row 그림이 있어야 한다');
    const cs = a.cells; const down = /거꾸로/.test(st);
    if (/^얼마씩/.test(st)) { if (cs.some(c => c === null)) bad(where, 'skip3 step 문항에 빈칸이 있다'); if (a.step !== null && a.step !== undefined) bad(where, 'skip3 step 문항인데 화살표에 뛴 수가 보인다'); const d = cs[1] - cs[0]; if (cs.some((c, i) => i && c - cs[i - 1] !== d)) bad(where, 'skip3 칸이 일정하게 뛰지 않는다'); if ((d < 0) !== down) bad(where, 'skip3 거꾸로 발문과 칸 방향이 다르다'); want = Math.abs(d) + '씩'; }
    else if ((m = st.match(/^(\d+)씩 (거꾸로 )?뛰어 세었어요\. 빈칸/))) { const s2 = +m[1]; if (+a.step !== s2) bad(where, 'skip3 발문과 화살표 뛴 수가 다르다'); if ((a.dir === 'down') !== down) bad(where, 'skip3 거꾸로 발문과 그림 dir 이 다르다');
      const i = cs.findIndex(c => c === null); const k = cs.findIndex(c => c !== null); if (i < 0) return bad(where, 'skip3 빈칸이 없다'); want = String(cs[k] + (down ? -1 : 1) * s2 * (i - k)); }
    else return bad(where, 'skip3 발문 꼴을 모른다: ' + st);
  } else if (key === 'cmp3d') {
    if ((m = st.match(/^(\d+)[과와] (\d+) 중에서 더 (큰|작은)/))) want = String(m[3] === '큰' ? Math.max(+m[1], +m[2]) : Math.min(+m[1], +m[2]));
    else if (/^두 수의 크기를 바르게 비교한/.test(st)) { const tr = x => { const z = String(x).match(/^(\d+) ([<>]) (\d+)$/); return z && (z[2] === '>' ? +z[1] > +z[3] : +z[1] < +z[3]); }; if (!tr(cor)) bad(where, 'cmp3d sign 정답 식이 거짓: ' + cor); wr.forEach(w => { if (tr(w)) bad(where, 'cmp3d sign 오답 식이 참: ' + w); }); return; }
    else if ((m = st.match(/^([\d, ]+) 가운데 가장 (큰|작은)/))) { const ns = m[1].split(',').map(x => +x.trim()); if (new Set(ns).size !== ns.length) bad(where, 'cmp3d 수가 겹친다'); want = String(m[2] === '큰' ? Math.max(...ns) : Math.min(...ns)); }
    else return bad(where, 'cmp3d 발문 꼴을 모른다: ' + st);
  } else {
    if (!(m = st.match(/^수 카드 (\d), (\d), (\d)[을를] 한 번씩 모두 써서 만들 수 있는 가장 (큰|작은) 세 자리 수/))) return bad(where, 'cards3 발문 꼴을 모른다: ' + st);
    const c = [+m[1], +m[2], +m[3]]; if (new Set(c).size !== 3) bad(where, 'cards3 카드가 겹친다'); const all = [];
    [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].forEach(p => { if (c[p[0]]) all.push(100 * c[p[0]] + 10 * c[p[1]] + c[p[2]]); });
    want = String(m[4] === '큰' ? Math.max(...all) : Math.min(...all));
  }
  if (String(want) !== cor && !(q.kind === 'sa' && (q.answer || []).map(String).indexOf(String(want)) >= 0)) bad(where, `${key} 정답 ${cor} ≠ 다시 계산한 ${want}`);
  if (wr.indexOf(String(want)) >= 0) bad(where, `${key} 오답 보기에 정답 ${want} 가 섞였다`);
}

/* v2.8 — 네 자리 수: 엔진과 따로 셈해 정답·오답을 다시 확인 (원본·변형 모두) */
const read4x = n => { const d = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]; return ['천', '백', '십', ''].map((u, i) => d[i] ? ((d[i] > 1 || !u) ? S3X[d[i]] : '') + u : '').join(''); };
function check4(where, q) {
  const vr = q.variant_rule || {}; const key = ['n4', 'pv4', 'skip4', 'cmp4d', 'cards4'].find(k => vr[k]); if (!key) return;
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const st = String(q.stem).replace(/^이번에는 다른 보기예요\. /, ''); const a = q.asset && typeof q.asset === 'object' ? q.asset : null; let want = null, m;
  const PL = {'천': 0, '백': 1, '십': 2, '일': 3}, UV = [1000, 100, 10, 1];
  if (key === 'n4') {
    if (/^수 모형이 나타내는 수는/.test(st) || /^돈은 모두 얼마/.test(st)) { if (!a || a.type !== 'blocks4') return bad(where, 'n4 그림 문항인데 blocks4 가 없다'); want = String(a.th * 1000 + a.h * 100 + a.t * 10 + a.o) + (/^돈/.test(st) ? '원' : ''); if (/^돈/.test(st) !== (a.unit === 'coin')) bad(where, 'n4 돈 발문과 그림 unit 이 어긋난다'); }
    else if ((m = st.match(/^((?:(?:1000|100|10|1)이 \d+개(?:, )?)+)인 수는/))) { let n = 0; m[1].split(', ').forEach(p => { const z = p.match(/^(\d+)이 (\d+)개$/); n += Number(z[1]) * Number(z[2]); }); want = String(n); }
    else if ((m = st.match(/^(\d+)[을를] 바르게 읽은/))) { want = read4x(+m[1]); }
    else if ((m = st.match(/^「([^」]+)」[을를] 수로 쓰면/))) { for (let n = 1000; n <= 9999; n++) if (read4x(n) === m[1]) want = String(n); if (want === null) return bad(where, 'n4 읽기를 수로 못 돌렸다: ' + m[1]); }
    else if ((m = st.match(/^1000이 (\d+)개이면 얼마/))) want = String(1000 * m[1]);
    else if ((m = st.match(/^(\d+)[은는] 1000이 (?:몇 개|\(\s*\)개)/))) { if (+m[1] % 1000) bad(where, 'n4 tcount 수가 몇천이 아니다'); want = String(+m[1] / 1000); }
    else if ((m = st.match(/^100이 (\d+)개인 수는/))) want = String(100 * m[1]);
    else if ((m = st.match(/^(\d+)[은는] 100이 몇 개/))) { if (+m[1] % 100) bad(where, 'n4 hcount 수가 몇천몇백이 아니다'); want = String(+m[1] / 100); }
    else return bad(where, 'n4 발문 꼴을 모른다: ' + st);
  } else if (key === 'pv4') {
    if ((m = st.match(/^(\d{4})에서 (천|백|십|일)의 자리 숫자는/))) want = String(m[1])[PL[m[2]]];
    else if ((m = st.match(/^(\d{4})에서 숫자 (\d)[이가] 나타내는 값/))) { const ds = String(m[1]).split(''); if (ds.filter(x => x === m[2]).length !== 1) return bad(where, 'pv4 숫자가 한 번만 나오지 않는다: ' + st); want = String(+m[2] * UV[ds.indexOf(m[2])]); }
    else if ((m = st.match(/^(\d{4})[을를] 각 자리의 값의 합으로/))) { const d = String(m[1]).split('').map(Number); want = d.map((x, i) => x * UV[i]).join(' + '); wr.forEach(w => { const ps = w.split(' + '); const sum = ps.reduce((x, y) => x + Number(y), 0); if (sum === +m[1] && ps.length === 4 && ps.every((y, i) => +y % UV[i] === 0 && +y < UV[i] * 10)) bad(where, 'pv4 펼친 식 오답이 바른 식이다: ' + w); }); }
    else if ((m = st.match(/^숫자 (\d)[이가] (\d+)[을를] 나타내는 수는/))) { const dd = m[1], val = +m[2]; const i = 3 - Math.round(Math.log10(val / +dd)); const ok = x => { const s4 = String(x); return s4.length === 4 && s4[i] === dd && s4.split('').filter(c => c === dd).length === 1; };
      if (!ok(cor)) bad(where, `pv4 which 정답 ${cor} 에서 ${dd} 가 ${val} 를 나타내지 않는다`); wr.forEach(w => { if (ok(w)) bad(where, `pv4 which 오답 ${w} 도 맞다`); }); return; }
    else if ((m = st.match(/^(\d{4})의 자릿값 표예요/))) { if (!a || a.type !== 'place_table') return bad(where, 'pv4 table 인데 place_table 이 없다'); const d = String(m[1]).split('').map(Number); if (a.digits.join() !== d.join()) bad(where, 'pv4 표 숫자와 발문 수가 다르다'); const i = (a.values || []).findIndex(x => x === null || x === '?'); if (i < 0) return bad(where, 'pv4 표에 빈칸이 없다'); want = String(d[i] * UV[i]); }
    else return bad(where, 'pv4 발문 꼴을 모른다: ' + st);
  } else if (key === 'skip4') {
    if (!a || a.type !== 'jump_row') return bad(where, 'skip4 는 jump_row 그림이 있어야 한다');
    const cs = a.cells; const down = /거꾸로/.test(st);
    if (cs.some(c => c !== null && (c < 1000 || c > 9999))) bad(where, 'skip4 칸이 네 자리 수 밖');
    if (/^얼마씩/.test(st)) { if (cs.some(c => c === null)) bad(where, 'skip4 step 문항에 빈칸이 있다'); if (a.step !== null && a.step !== undefined) bad(where, 'skip4 step 문항인데 화살표에 뛴 수가 보인다'); const d = cs[1] - cs[0]; if (cs.some((c, i) => i && c - cs[i - 1] !== d)) bad(where, 'skip4 칸이 일정하게 뛰지 않는다'); if ((d < 0) !== down) bad(where, 'skip4 거꾸로 발문과 칸 방향이 다르다'); want = Math.abs(d) + '씩'; }
    else if ((m = st.match(/^(\d+)씩 (거꾸로 )?뛰어 세었어요\. 빈칸/))) { const s2 = +m[1]; if (+a.step !== s2) bad(where, 'skip4 발문과 화살표 뛴 수가 다르다'); if ((a.dir === 'down') !== down) bad(where, 'skip4 거꾸로 발문과 그림 dir 이 다르다');
      const i = cs.findIndex(c => c === null); const k = cs.findIndex(c => c !== null); if (i < 0) return bad(where, 'skip4 빈칸이 없다'); want = String(cs[k] + (down ? -1 : 1) * s2 * (i - k)); }
    else return bad(where, 'skip4 발문 꼴을 모른다: ' + st);
  } else if (key === 'cmp4d') {
    if ((m = st.match(/^(\d+)[과와] (\d+) 중에서 더 (큰|작은)/))) want = String(m[3] === '큰' ? Math.max(+m[1], +m[2]) : Math.min(+m[1], +m[2]));
    else if (/^두 수의 크기를 바르게 비교한/.test(st)) { const tr = x => { const z = String(x).match(/^(\d+) ([<>]) (\d+)$/); return z && (z[2] === '>' ? +z[1] > +z[3] : +z[1] < +z[3]); }; if (!tr(cor)) bad(where, 'cmp4d sign 정답 식이 거짓: ' + cor); wr.forEach(w => { if (tr(w)) bad(where, 'cmp4d sign 오답 식이 참: ' + w); }); return; }
    else if ((m = st.match(/^([\d, ]+) 가운데 가장 (큰|작은)/))) { const ns = m[1].split(',').map(x => +x.trim()); if (new Set(ns).size !== ns.length) bad(where, 'cmp4d 수가 겹친다'); if (ns.some(x => x < 1000 || x > 9999)) bad(where, 'cmp4d 네 자리 수가 아니다'); want = String(m[2] === '큰' ? Math.max(...ns) : Math.min(...ns)); }
    else return bad(where, 'cmp4d 발문 꼴을 모른다: ' + st);
  } else {
    if (!(m = st.match(/^수 카드 (\d), (\d), (\d), (\d)[을를] 한 번씩 모두 써서 만들 수 있는 가장 (큰|작은) 네 자리 수/))) return bad(where, 'cards4 발문 꼴을 모른다: ' + st);
    const c = [+m[1], +m[2], +m[3], +m[4]]; if (new Set(c).size !== 4) bad(where, 'cards4 카드가 겹친다'); const all = [];
    const perm = (arr, pre) => { if (!arr.length) { if (pre[0]) all.push(+pre.join('')); return; } arr.forEach((x, i) => perm(arr.filter((_, j) => j !== i), pre.concat(x))); };
    perm(c, []); want = String(m[5] === '큰' ? Math.max(...all) : Math.min(...all));
  }
  if (String(want) !== cor && !(q.kind === 'sa' && (q.answer || []).map(String).indexOf(String(want)) >= 0)) bad(where, `${key} 정답 ${cor} ≠ 다시 계산한 ${want}`);
  if (wr.indexOf(String(want)) >= 0) bad(where, `${key} 오답 보기에 정답 ${want} 가 섞였다`);
}
/* v2.4 — 덧셈과 뺄셈: 발문에서 식을 다시 읽어 엔진과 따로 셈한다 (원본·변형 모두) */
const AR_EV = (x, s, y) => s === '+' ? x + y : x - y;
const AR_EQ = t => { const z = String(t).match(/^(\d+) ([+−]) (\d+) = (\d+)$/); return z ? { x: +z[1], s: z[2], y: +z[3], z: +z[4], ok: AR_EV(+z[1], z[2] === '+' ? '+' : '-', +z[3]) === +z[4] } : null; };
/* v2.6 — 분류하기: 물건 특징 표를 엔진(SORT_LIB)과 따로 적어 들고, 그림이 말하는 답과 정답이 같은지 다시 센다 */
const CL_A = {   /* 열쇠: [이름, 무리, {특징}] — 엔진 표와 서로 검산 */
  '🔴':['빨간 동그라미','tok',{color:'빨간색',shape:'동그라미'}], '🔵':['파란 동그라미','tok',{color:'파란색',shape:'동그라미'}], '🟡':['노란 동그라미','tok',{color:'노란색',shape:'동그라미'}], '🟢':['초록 동그라미','tok',{color:'초록색',shape:'동그라미'}],
  '🟥':['빨간 네모','tok',{color:'빨간색',shape:'네모'}], '🟦':['파란 네모','tok',{color:'파란색',shape:'네모'}], '🟨':['노란 네모','tok',{color:'노란색',shape:'네모'}], '🟩':['초록 네모','tok',{color:'초록색',shape:'네모'}],
  '❤️':['빨간 하트','tok',{color:'빨간색',shape:'하트'}], '💙':['파란 하트','tok',{color:'파란색',shape:'하트'}], '💛':['노란 하트','tok',{color:'노란색',shape:'하트'}], '💚':['초록 하트','tok',{color:'초록색',shape:'하트'}],
  '🐶':['강아지','ani',{legs:'4개'}], '🐱':['고양이','ani',{legs:'4개'}], '🐷':['돼지','ani',{legs:'4개'}], '🐮':['소','ani',{legs:'4개'}], '🐔':['닭','ani',{legs:'2개'}], '🐦':['새','ani',{legs:'2개'}],
  '🦆':['오리','ani',{legs:'2개'}], '🐧':['펭귄','ani',{legs:'2개'}], '🐟':['물고기','ani',{legs:'0개'}], '🐍':['뱀','ani',{legs:'0개'}], '🐬':['돌고래','ani',{legs:'0개'}],
  '🚗':['자동차','veh',{where:'땅',wheels:'4개'}], '🚌':['버스','veh',{where:'땅',wheels:'4개'}], '🚕':['택시','veh',{where:'땅',wheels:'4개'}], '🚲':['자전거','veh',{where:'땅',wheels:'2개'}], '🛵':['오토바이','veh',{where:'땅',wheels:'2개'}],
  '✈️':['비행기','veh',{where:'하늘'}], '🚁':['헬리콥터','veh',{where:'하늘'}], '⛵':['돛단배','veh',{where:'물'}], '🚢':['배','veh',{where:'물'}], '🚤':['모터보트','veh',{where:'물'}],
  '🍎':['사과','fruit',{kind:'사과'}], '🍌':['바나나','fruit',{kind:'바나나'}], '🍇':['포도','fruit',{kind:'포도'}], '🍊':['귤','fruit',{kind:'귤'}], '🍓':['딸기','fruit',{kind:'딸기'}],
  '✏️':['연필','sup',{kind:'연필'}], '📏':['자','sup',{kind:'자'}], '📓':['공책','sup',{kind:'공책'}], '✂️':['가위','sup',{kind:'가위'}], '🖍️':['크레파스','sup',{kind:'크레파스'}],
  '👕':['티셔츠','cloth',{part:'윗옷'}], '🧥':['외투','cloth',{part:'윗옷'}], '👚':['블라우스','cloth',{part:'윗옷'}], '👖':['바지','cloth',{part:'아래옷'}], '🩳':['반바지','cloth',{part:'아래옷'}],
  '📕':['빨간 책','book',{color:'빨간색'}], '📗':['초록 책','book',{color:'초록색'}], '📘':['파란 책','book',{color:'파란색'}],
  '🥫':['캔','recy',{kind:'캔'}], '🧴':['플라스틱 통','recy',{kind:'플라스틱'}], '🥤':['플라스틱 컵','recy',{kind:'플라스틱'}], '📰':['신문지','recy',{kind:'종이'}], '📦':['종이 상자','recy',{kind:'종이'}]
};
const CL_CN = {'색깔':'color', '모양':'shape', '다리 수':'legs', '움직이는 곳':'where', '바퀴 수':'wheels', '종류':'kind', '윗옷과 아래옷':'part'};
const CL_KEY = Object.fromEntries(Object.entries(CL_CN).map(([k, v]) => [v, k]));
const CL_UNIT = {tok:'개', ani:'마리', veh:'대', fruit:'개', sup:'개', cloth:'벌', book:'권', recy:'개'};
const CL_SUBJ = /예쁜|좋아하는|싫어하는|멋진|빨라 보이는|느려 보이는|맛있는|재미있는|갖고 싶은|귀여운/;
const clLab = (c, v) => c === 'legs' ? '다리 ' + v : c === 'wheels' ? '바퀴 ' + v : v;
/* 「○○은 몇 개」의 ○○ → [기준, 값] (무리 안에서) */
function clPhrase(ph, fam) {
  const m = ph.match(/^(빨간색|파란색|노란색|초록색)인 (것|책)$/); if (m) return ['color', m[1]];
  let x; if ((x = ph.match(/^(동그라미|네모|하트) 모양인 것$/))) return ['shape', x[1]];
  if ((x = ph.match(/^다리가 (\d)개인 동물$/))) return ['legs', x[1] + '개'];
  if ((x = ph.match(/^(땅|하늘|물)에서 움직이는 탈것$/))) return ['where', x[1]];
  if ((x = ph.match(/^바퀴가 (\d)개인 탈것$/))) return ['wheels', x[1] + '개'];
  if (fam === 'cloth' && (ph === '윗옷' || ph === '아래옷')) return ['part', ph];
  return ['kind', ph];
}
/* 그림 → {fam, cnt(기준, 값), labs(기준) → {칸이름: 수}} */
function clFacts(a) {
  if (a.type === 'sort_pile') { const fam = (CL_A[a.items[0]] || [])[1];
    return {fam, cnt: (c, v) => a.items.filter(k => CL_A[k] && CL_A[k][2][c] === v).length,
      by: c => { const o = {}; a.items.forEach(k => { const x = CL_A[k][2][c]; if (x === undefined) return; const l = clLab(c, x); o[l] = (o[l] || 0) + 1; }); return o; }, total: a.items.length}; }
  if (a.type === 'sort_table') { const vals = a.cols.map((c, i) => a.counts[i] === null || a.counts[i] === undefined ? (Array.isArray(a.tally) ? a.tally[i] : null) : a.counts[i]);
    const o = {}; a.cols.forEach((c, i) => { o[c] = vals[i]; });
    return {fam: null, table: true, cnt: (c, v) => o[clLab(c, v)], by: c => (c === a.crit ? o : null), total: vals.every(x => x !== null) ? vals.reduce((s, x) => s + x, 0) : null}; }
  return null;
}
function checkSortAsset(where, a) {
  if (a.type === 'sort_pile') {
    if (!Array.isArray(a.items) || a.items.length < 2 || a.items.length > 16) return bad(where, 'sort_pile items 는 2~16개');
    a.items.forEach(k => { if (!CL_A[k]) bad(where, 'sort_pile 표에 없는 그림 ' + k); });
    if (new Set(a.items.map(k => (CL_A[k] || [])[1])).size > 1) bad(where, 'sort_pile 무리가 섞였다(한 바구니엔 한 무리)');
  }
  if (a.type === 'sort_bins') {
    if (!Array.isArray(a.bins) || a.bins.length < 2 || a.bins.length > 4) return bad(where, 'sort_bins 칸은 2~4개');
    a.bins.forEach((b, i) => { if (!b.label) bad(where, `sort_bins 칸 ${i + 1} 이름 없음`); if (!Array.isArray(b.items) || !b.items.length || b.items.length > 6) bad(where, `sort_bins 칸 ${i + 1} 물건은 1~6개`);
      (b.items || []).forEach(k => { if (!CL_A[k]) bad(where, 'sort_bins 표에 없는 그림 ' + k); }); });
    if (a.crit && !CL_KEY[a.crit]) bad(where, 'sort_bins crit 모름 ' + a.crit);
  }
  if (a.type === 'sort_table') {
    if (!CL_KEY[a.crit]) bad(where, 'sort_table crit 모름 ' + a.crit);
    if (!Array.isArray(a.cols) || a.cols.length < 2 || a.cols.length > 5) return bad(where, 'sort_table 칸은 2~5개');
    if (!Array.isArray(a.counts) || a.counts.length !== a.cols.length) return bad(where, 'sort_table counts 수가 칸 수와 다르다');
    a.counts.forEach(x => { if (x !== null && !(Number.isInteger(x) && x >= 0 && x <= 20)) bad(where, 'sort_table 수는 0~20 정수·null'); });
    const nulls = a.counts.filter(x => x === null).length; if (nulls > 1) bad(where, 'sort_table 빈칸이 둘 넘다');
    if (nulls && a.total === undefined && !Array.isArray(a.tally)) bad(where, 'sort_table 빈칸인데 합계도 ／ 표시도 없다(구할 길이 없다)');
    if (Array.isArray(a.tally)) { if (a.tally.length !== a.cols.length) bad(where, 'sort_table tally 수가 칸 수와 다르다'); a.counts.forEach((x, i) => { if (x !== null && x !== a.tally[i]) bad(where, `sort_table ／ 표시 ${a.tally[i]} 와 수 ${x} 가 다르다`); }); }
    if (a.total !== undefined && a.total !== null && nulls === 0 && a.total !== a.counts.reduce((s, x) => s + x, 0)) bad(where, 'sort_table 합계가 칸의 합과 다르다');
    if (a.total !== undefined && a.total !== null && nulls === 1 && a.total - a.counts.reduce((s, x) => s + (x || 0), 0) < 0) bad(where, 'sort_table 빈칸이 음수가 된다');
    if (new Set(a.cols).size !== a.cols.length) bad(where, 'sort_table 칸 이름이 겹친다');
  }
}
function checkCls(where, q) {
  const a = q.asset; const vr = q.variant_rule || {};
  if (!a || typeof a !== 'object' || ['sort_pile', 'sort_bins', 'sort_table'].indexOf(a.type) < 0) { if (vr.cls) bad(where, 'cls 갈래인데 분류 그림이 없다'); return; }
  checkSortAsset(where, a);
  if (!vr.cls) return;   /* 손 문항은 그림 규격만 */
  const st = String(q.stem).replace(/^이번에는 다른 보기예요\. /, '').replace(/ 숫자로 쓰세요\.$/, ''); let want = null, m, unit = '';
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const F = clFacts(a);
  const famOf = F && F.fam ? F.fam : null;
  if ((m = st.match(/^표의 빈칸에 알맞은 수는 얼마일까요\?$/)) || (m = st.match(/^／ 표시를 세어 보세요\. 표의 빈칸에 알맞은 수는 얼마일까요\?$/))) {
    if (a.type !== 'sort_table') return bad(where, 'cls 빈칸인데 표가 아니다'); const i = a.counts.indexOf(null); if (i < 0) return bad(where, 'cls 표에 빈칸이 없다');
    if (/／/.test(st)) { if (!Array.isArray(a.tally)) return bad(where, 'cls ／ 표시로 구하라는데 세기 줄이 없다'); want = a.tally[i]; }
    else { if (a.total === undefined) return bad(where, 'cls 합계 없이 빈칸'); want = a.total - a.counts.reduce((s, x) => s + (x || 0), 0); }
  }
  else if ((m = st.match(/^(?:표를 보세요\. 분류한 |그림의 )(.+?)[은는] 모두 몇 (개|마리|대|벌|권)일까요\?$/))) { want = F.total; unit = m[2]; }
  else if ((m = st.match(/^(.+?)에 따라 분류했을 때 가장 (많은|적은) 것은 무엇일까요\?$/))) {
    const c = CL_CN[m[1]]; if (!c) return bad(where, 'cls 기준 이름 모름 ' + m[1]); const o = F.by(c); if (!o) return bad(where, 'cls 표의 기준과 발문 기준이 다르다');
    const ks = Object.keys(o), vs = ks.map(k => o[k]); const t = m[2] === '많은' ? Math.max(...vs) : Math.min(...vs);
    if (vs.filter(x => x === t).length !== 1) return bad(where, `cls 가장 ${m[2]} 것이 둘 이상`); want = ks[vs.indexOf(t)];
  }
  else if ((m = st.match(/^그림의 (.+?)[을를] (.+?)에 따라 분류하면 몇 가지로 나눌 수 있을까요\?$/))) { const c = CL_CN[m[2]]; if (!c) return bad(where, 'cls 기준 이름 모름 ' + m[2]); want = Object.keys(F.by(c)).length; unit = '가지'; }
  else if ((m = st.match(/^(.+?)[은는] (.+?)보다 몇 (개|마리|대|벌|권) 더 많을까요\?$/))) {
    const famT = famOf; const [c1, v1] = clPhrase(m[1], famT || (a.type === 'sort_table' && a.crit === 'part' ? 'cloth' : null)), [c2, v2] = clPhrase(m[2], famT || (a.type === 'sort_table' && a.crit === 'part' ? 'cloth' : null));
    const n1 = F.cnt(c1, v1), n2 = F.cnt(c2, v2); if (n1 === undefined || n2 === undefined || n1 === null || n2 === null) return bad(where, 'cls 두 칸을 그림에서 못 찾았다');
    if (n1 <= n2) bad(where, 'cls 「더 많을까요」인데 앞의 것이 더 많지 않다'); want = n1 - n2; unit = m[3];
  }
  else if ((m = st.match(/^(.+?)[은는] 몇 (개|마리|대|벌|권)일까요\?$/))) {
    const famT = famOf || (a.type === 'sort_table' && a.crit === 'part' ? 'cloth' : null); const [c, v] = clPhrase(m[1], famT);
    if (a.type === 'sort_table' && c !== a.crit) return bad(where, `cls 발문 기준(${c})과 표 기준(${a.crit})이 다르다`);
    want = F.cnt(c, v); if (want === undefined || want === null) return bad(where, 'cls 묻는 칸이 그림에 없다: ' + m[1]); unit = m[2];
    if (famOf && CL_UNIT[famOf] !== m[2]) bad(where, `cls 세는 말 ${m[2]} 가 무리(${famOf})와 다르다`);
  }
  else if ((m = st.match(/^(.+?)에 따라 분류했어요\. 잘못 분류된 것은 어느 것인가요\?$/))) {
    if (a.type !== 'sort_bins') return bad(where, 'cls 잘못 분류인데 칸 그림이 아니다'); const c = CL_CN[m[1]]; if (!c) return bad(where, 'cls 기준 모름');
    const wrongs = []; a.bins.forEach(b => b.items.forEach(k => { if (clLab(c, CL_A[k][2][c]) !== b.label) wrongs.push(k); }));
    if (wrongs.length !== 1) return bad(where, `cls 잘못 놓인 물건이 ${wrongs.length}개 (1개여야 함)`);
    const vals = new Set(a.bins.map(b => b.label)); a.bins.forEach(b => { if (!b.items.some(k => clLab(c, CL_A[k][2][c]) === b.label)) bad(where, 'cls 칸 「' + b.label + '」에 제대로 든 물건이 없다'); });
    if (vals.size !== a.bins.length) bad(where, 'cls 칸 이름이 겹친다');
    want = wrongs[0] + ' ' + CL_A[wrongs[0]][0];
    wr.forEach(t => { const k = t.split(' ')[0]; if (!CL_A[k]) bad(where, 'cls 오답 보기 그림 모름 ' + t); else if (t !== k + ' ' + CL_A[k][0]) bad(where, 'cls 보기 이름이 그림과 다르다 ' + t); });
  }
  else if (/^물건을 칸에 나누어 담았어요\. 어떤 기준으로 분류했을까요\?$/.test(st)) {
    if (a.type !== 'sort_bins') return bad(where, 'cls 기준 찾기인데 칸 그림이 아니다');
    const fits = c => { const per = a.bins.map(b => new Set(b.items.map(k => CL_A[k][2][c]))); if (per.some(s => s.size !== 1 || s.has(undefined))) return false; const all = per.map(s => [...s][0]); return new Set(all).size === all.length; };
    const ok = Object.keys(CL_KEY).filter(fits); if (ok.length !== 1) return bad(where, `cls 들어맞는 기준이 ${ok.length}개 (1개여야 함): ${ok.join(',')}`);
    want = CL_KEY[ok[0]];
    wr.forEach(t => { if (CL_CN[t]) { if (fits(CL_CN[t])) bad(where, 'cls 오답 기준도 들어맞는다 ' + t); } else if (!CL_SUBJ.test(t)) bad(where, 'cls 오답 기준이 사람마다 다른 기준도 아니고 아는 기준도 아니다 ' + t); });
  }
  else return bad(where, 'cls 발문 꼴을 모른다: ' + st);
  if (want === null || want === undefined) return bad(where, 'cls 답을 다시 셀 수 없다');
  const W = String(want); const okSa = q.kind === 'sa' && (q.answer || []).map(String).some(x => x === W || x === W + unit);
  if (cor !== W && cor !== W + unit && !okSa) bad(where, `cls 정답 ${cor} ≠ 다시 센 ${W}${unit}`);
  if (wr.indexOf(W) >= 0 || wr.indexOf(W + unit) >= 0) bad(where, `cls 오답 보기에 정답 ${W}${unit} 가 섞였다`);
}
/* v3.2 — 표와 그래프: 그림 3종 규격(ftable·pgraph·cards) + tg 갈래 정답 다시 세기. 주제 표 TG_A 는 play.html TG_LIB 와 따로 적어 서로 검산한다. */
const TG_A = {
  act:     {unit:'명', noun:'활동', vp:{'현장체험학습':'현장체험학습이 즐거웠던 학생', '안전 체험':'안전 체험이 즐거웠던 학생', '놀이 한마당':'놀이 한마당이 즐거웠던 학생', '신나는 무용':'신나는 무용이 즐거웠던 학생', '텃밭 가꾸기':'텃밭 가꾸기가 즐거웠던 학생'}, most:'가장 {M} 학생이 즐거워한 활동', total:'슬기네 반 학생은 모두 몇 명인가요?'},
  season:  {unit:'명', noun:'계절', vp:{'봄':'봄에 태어난 학생', '여름':'여름에 태어난 학생', '가을':'가을에 태어난 학생', '겨울':'겨울에 태어난 학생'}, most:'가장 {M} 학생이 태어난 계절', total:'우리 반 학생은 모두 몇 명인가요?'},
  animal:  {unit:'명', noun:'동물', vp:{'개':'개를 좋아하는 학생', '앵무새':'앵무새를 좋아하는 학생', '고양이':'고양이를 좋아하는 학생', '토끼':'토끼를 좋아하는 학생', '금붕어':'금붕어를 좋아하는 학생'}, most:'가장 {M} 학생이 좋아하는 동물', total:'수찬이네 반 학생은 모두 몇 명인가요?'},
  play:    {unit:'명', noun:'전통 놀이', vp:{'비사치기':'비사치기를 좋아하는 학생', '투호 놀이':'투호 놀이를 좋아하는 학생', '제기차기':'제기차기를 좋아하는 학생', '공기놀이':'공기놀이를 좋아하는 학생'}, most:'가장 {M} 학생이 좋아하는 전통 놀이', total:'동호네 반 학생은 모두 몇 명인가요?'},
  snack:   {unit:'명', noun:'간식', vp:{'햄버거':'햄버거를 좋아하는 학생', '떡볶이':'떡볶이를 좋아하는 학생', '김밥':'김밥을 좋아하는 학생', '라면':'라면을 좋아하는 학생', '만두':'만두를 좋아하는 학생'}, most:'가장 {M} 학생이 좋아하는 간식', total:'우리 반 학생은 모두 몇 명인가요?'},
  game:    {unit:'명', noun:'교실 놀이', vp:{'땅따먹기':'땅따먹기를 원하는 학생', '공기놀이':'공기놀이를 원하는 학생', '보드게임':'보드게임을 원하는 학생', '딱지치기':'딱지치기를 원하는 학생'}, most:'가장 {M} 학생이 원하는 교실 놀이', total:'우리 반 학생은 모두 몇 명인가요?'},
  gift:    {unit:'명', noun:'선물', vp:{'로봇':'로봇을 받고 싶은 학생', '인형':'인형을 받고 싶은 학생', '모자':'모자를 받고 싶은 학생', '신발':'신발을 받고 싶은 학생', '그림책':'그림책을 받고 싶은 학생'}, most:'가장 {M} 학생이 받고 싶은 선물', total:'조사한 학생은 모두 몇 명인가요?'},
  fruit:   {unit:'명', noun:'과일', vp:{'자두':'자두를 좋아하는 학생', '포도':'포도를 좋아하는 학생', '키위':'키위를 좋아하는 학생', '감':'감을 좋아하는 학생', '복숭아':'복숭아를 좋아하는 학생'}, most:'가장 {M} 학생이 좋아하는 과일', total:'우리 반 학생은 모두 몇 명인가요?'},
  bread:   {unit:'명', noun:'붕어빵', vp:{'팥':'팥 붕어빵을 좋아하는 학생', '슈크림':'슈크림 붕어빵을 좋아하는 학생', '고구마':'고구마 붕어빵을 좋아하는 학생', '치즈':'치즈 붕어빵을 좋아하는 학생', '초코':'초코 붕어빵을 좋아하는 학생'}, most:'가장 {M} 학생이 좋아하는 붕어빵', total:'재우네 반 학생은 모두 몇 명인가요?'},
  sport:   {unit:'명', noun:'운동', vp:{'축구':'축구를 좋아하는 학생', '줄넘기':'줄넘기를 좋아하는 학생', '달리기':'달리기를 좋아하는 학생', '피구':'피구를 좋아하는 학생', '수영':'수영을 좋아하는 학생'}, most:'가장 {M} 학생이 좋아하는 운동', total:'우리 반 학생은 모두 몇 명인가요?'},
  weather: {unit:'일', noun:'날씨', vp:{'맑음':'맑은 날', '흐림':'흐린 날', '비':'비가 온 날', '눈':'눈이 온 날'}, most:'12월에 날수가 가장 {M} 날씨', total:'12월은 모두 며칠인가요?', sum:31},
  block:   {unit:'개', noun:'색깔', vp:{'주황색':'주황색 연결 모형', '파란색':'파란색 연결 모형', '노란색':'노란색 연결 모형', '초록색':'초록색 연결 모형'}, most:'연결 모형이 가장 {M} 색깔', total:'슬기네 모둠의 연결 모형은 모두 몇 개인가요?'},
  jegi:    {unit:'회', noun:'모둠', vp:{'1모둠':'1모둠의 제기차기 횟수', '2모둠':'2모둠의 제기차기 횟수', '3모둠':'3모둠의 제기차기 횟수', '4모둠':'4모둠의 제기차기 횟수', '5모둠':'5모둠의 제기차기 횟수'}, most:'제기차기를 가장 {M2} 한 모둠', total:'지수네 반 모둠들의 제기차기 횟수는 모두 몇 회인가요?'},
};
const TG_MARKS = ['◯', '×', '／'];
function tgTopicOf(where, a) {
  const key = a.topic || Object.keys(TG_A).find(k => (a.cols || a.items.map(x => x[1])).every(c => TG_A[k].vp[c]));
  if (!key || !TG_A[key]) { bad(where, `${a.type} 주제를 모른다 ${a.topic || ''}`); return null; }
  const T = TG_A[key]; const cs = a.cols || [...new Set(a.items.map(x => x[1]))];
  cs.forEach(c => { if (!T.vp[c]) bad(where, `${a.type} 항목 「${c}」${a.topic ? ` 이 주제 ${key} 에 없다` : ''}`); });
  if (a.unit && a.unit !== T.unit) bad(where, `${a.type} 단위 ${a.unit} ≠ 주제 단위 ${T.unit}`);
  return T;
}
function checkTgAsset(where, a) {
  if (a.type === 'cards') {
    if (!Array.isArray(a.items) || a.items.length < 2 || a.items.length > 20) return bad(where, 'cards 는 2~20장');
    a.items.forEach(it => { if (!Array.isArray(it) || it.length !== 2 || !it[0] || !it[1]) bad(where, 'cards 낱장은 [이름, 고른 것]'); });
    if (new Set(a.items.map(x => x[0])).size !== a.items.length) bad(where, 'cards 이름이 겹친다');
    tgTopicOf(where, a); return;
  }
  if (!Array.isArray(a.cols) || a.cols.length < 2 || a.cols.length > 5) return bad(where, a.type + ' 항목은 2~5개');
  if (!Array.isArray(a.counts) || a.counts.length !== a.cols.length) return bad(where, a.type + ' counts 수가 항목 수와 다르다');
  if (new Set(a.cols).size !== a.cols.length) bad(where, a.type + ' 항목 이름이 겹친다');
  if (!a.head) bad(where, a.type + ' 항목 머리말(head)이 없다');
  const T = tgTopicOf(where, a);
  if (a.type === 'ftable') {
    a.counts.forEach(x => { if (x !== null && !(Number.isInteger(x) && x >= 0 && x <= 20)) bad(where, 'ftable 수는 0~20 정수·null'); });
    const nulls = a.counts.filter(x => x === null).length; if (nulls > 1) bad(where, 'ftable 빈칸이 둘 넘다');
    if (nulls && (a.total === undefined || a.total === null) && !Array.isArray(a.tally)) bad(where, 'ftable 빈칸인데 합계도 ／ 표시도 없다(구할 길이 없다)');
    if (Array.isArray(a.tally)) { if (a.tally.length !== a.cols.length) bad(where, 'ftable tally 수가 항목 수와 다르다'); a.counts.forEach((x, i) => { if (x !== null && x !== a.tally[i]) bad(where, `ftable ／ 표시 ${a.tally[i]} 와 수 ${x} 가 다르다`); }); }
    if (typeof a.total === 'number' && nulls === 0 && a.total !== a.counts.reduce((s, x) => s + x, 0)) bad(where, 'ftable 합계가 칸의 합과 다르다');
    if (typeof a.total === 'number' && nulls === 1 && a.total - a.counts.reduce((s, x) => s + (x || 0), 0) < 0) bad(where, 'ftable 빈칸이 음수가 된다');
    if (T && T.sum && nulls === 0 && a.counts.reduce((s, x) => s + x, 0) !== T.sum) bad(where, `ftable 이 주제의 합계는 ${T.sum}(12월 날수)`);
    if (T && T.sum && typeof a.total === 'number' && a.total !== T.sum) bad(where, `ftable 합계 ${a.total} ≠ ${T.sum}`);
    return;
  }
  /* pgraph */
  a.counts.forEach(x => { if (!(Number.isInteger(x) && x >= 1 && x <= 15)) bad(where, 'pgraph 수는 1~15 정수(그래프는 빈칸 없음)'); });
  if (a.mark !== undefined && TG_MARKS.indexOf(a.mark) < 0) bad(where, 'pgraph 기호는 ◯·×·／');
  if (a.dir !== undefined && a.dir !== 'v' && a.dir !== 'h') bad(where, 'pgraph dir 는 v|h');
  const drawn = Array.isArray(a.drawn) ? a.drawn : a.counts;
  if (Array.isArray(a.drawn)) { if (a.drawn.length !== a.cols.length) bad(where, 'pgraph drawn 수가 항목 수와 다르다'); a.drawn.forEach(x => { if (!(Number.isInteger(x) && x >= 1 && x <= 15)) bad(where, 'pgraph drawn 은 1~15 정수'); });
    if (a.drawn.filter((x, i) => x !== a.counts[i]).length !== 1) bad(where, 'pgraph drawn 은 딱 한 칸만 표와 달라야'); if (!a.table) bad(where, 'pgraph drawn 은 표를 같이 보여야 찾을 수 있다'); }
  const mx = Math.max(...drawn, ...(a.bad && a.bad.how === 'skip' ? [a.counts[a.bad.col] + 1] : []));
  if (a.rows !== undefined && !(Number.isInteger(a.rows) && a.rows >= mx && a.rows <= 15)) bad(where, `pgraph rows ${a.rows} 는 가장 큰 수(${mx}) 이상 15 이하`);
  if (Array.isArray(a.blank)) { if (!a.blank.length || a.blank.some(i => !(Number.isInteger(i) && i >= 0 && i < a.cols.length))) bad(where, 'pgraph blank 칸 번호가 범위 밖'); if (!a.table) bad(where, 'pgraph blank 는 표를 같이 보여야 채울 수 있다'); }
  if (a.bad) { if (!(Number.isInteger(a.bad.col) && a.bad.col >= 0 && a.bad.col < a.cols.length)) bad(where, 'pgraph bad.col 범위 밖');
    if (['top', 'skip', 'mix'].indexOf(a.bad.how) < 0) bad(where, 'pgraph bad.how 는 top|skip|mix');
    if (a.counts[a.bad.col] < 3) bad(where, 'pgraph 잘못 그린 칸은 3개 이상이어야 눈에 보인다');
    if (a.bad.how === 'top' && !(a.rows > a.counts[a.bad.col])) bad(where, 'pgraph 위에서부터 그린 칸은 rows 가 그 수보다 커야 보인다');
    if (a.bad.how === 'skip' && !(a.rows >= a.counts[a.bad.col] + 1)) bad(where, 'pgraph 건너뛴 칸은 rows 가 그 수 + 1 이상이어야');
    if (Array.isArray(a.drawn) || Array.isArray(a.blank)) bad(where, 'pgraph bad 는 drawn·blank 와 같이 못 쓴다'); }
  if (T && T.sum && a.table && a.counts.reduce((s, x) => s + x, 0) !== T.sum) bad(where, `pgraph 표를 같이 보이는 이 주제의 합계는 ${T.sum}`);
}
function tgCols(a) { return a.type === 'cards' ? [...new Set(a.items.map(x => x[1]))] : a.cols; }
function tgCount(a, c) { return a.type === 'cards' ? a.items.filter(x => x[1] === c).length : a.counts[a.cols.indexOf(c)]; }
function checkTg(where, q) {
  const vr = q.variant_rule || {}, a = q.asset;
  if (!a || typeof a !== 'object' || ['ftable', 'pgraph', 'cards'].indexOf(a.type) < 0) { if (vr.tg) bad(where, 'tg 갈래인데 표·그래프·자료 그림이 없다'); return; }
  if (!vr.tg) return;   /* 손 문항은 그림 규격만(checkAsset 에서) */
  const T = tgTopicOf(where, a); if (!T) return;
  const st = String(q.stem).replace(/^이번에는 다른 보기예요\. /, '').replace(/ 숫자로 쓰세요\.$/, '').replace(/^자료를 보세요\. /, '');
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const cols = tgCols(a), U = T.unit, cnt = c => tgCount(a, c), tot = cols.reduce((s, c) => s + cnt(c), 0);
  const inStem = cols.filter(c => st.indexOf(T.vp[c]) >= 0).sort((x, y) => st.indexOf(T.vp[x]) - st.indexOf(T.vp[y]));
  const dirNm = a.type === 'pgraph' && a.dir === 'h' ? '가로' : '세로';
  let want = null, unit = '', m;
  if ((m = st.match(/^(.+?)[은는] 몇 (명|일|개|회)인가요\?$/)) && inStem.length === 1 && !/모두/.test(st)) { if (m[2] !== U) bad(where, 'tg 단위 다름'); if (a.type === 'ftable' && a.counts[cols.indexOf(inStem[0])] === null) bad(where, 'tg 묻는 칸이 빈칸'); want = cnt(inStem[0]); unit = U; }
  else if (st === T.total && inStem.length === 0) { if (a.type === 'ftable' && a.counts.some(x => x === null)) bad(where, 'tg 합계 묻는데 빈칸 있음'); if (a.type === 'ftable' && typeof a.total === 'number') bad(where, 'tg 합계가 표에 이미 보인다'); want = tot; unit = U; }
  else if ((m = st.match(/^(.+?)[과와] (.+?)[은는] 모두 몇 (명|일|개|회)인가요\?$/)) && inStem.length === 2) { if (m[3] !== U) bad(where, 'tg 단위 다름'); want = cnt(inStem[0]) + cnt(inStem[1]); unit = U; }
  else if ((m = st.match(/^(.+?)[은는] (.+?)보다 몇 (명|일|개|회) 더 많은가요\?$/)) && inStem.length === 2) { if (m[3] !== U) bad(where, 'tg 단위 다름');
    const i1 = cols.indexOf(inStem[0]), i2 = cols.indexOf(inStem[1]); if (cnt(cols[i1]) <= cnt(cols[i2])) return bad(where, 'tg 「더 많은」 앞 항목이 더 많지 않다'); want = cnt(cols[i1]) - cnt(cols[i2]); unit = U; }
  else if ((m = st.match(/^(.+?)[은는] 무엇인가요\?$/)) && /가장 (많은|적은|많이|적게)/.test(st)) {
    const mm = st.match(/가장 (많은|적은|많이|적게)/)[1], big = mm === '많은' || mm === '많이';
    if (m[1] !== T.most.replace('{M}', mm).replace('{M2}', mm)) return bad(where, 'tg 「가장」 발문 틀이 주제와 다르다: ' + st);
    const vs = cols.map(cnt), t = big ? Math.max(...vs) : Math.min(...vs); if (vs.filter(x => x === t).length !== 1) return bad(where, `tg 가장 ${mm} 것이 둘 이상`); want = cols[vs.indexOf(t)]; }
  else if ((m = st.match(/^(／ 표시를 세어 보세요\. )?표의 빈칸에 알맞은 수는 얼마인가요\?$/))) {
    if (a.type !== 'ftable') return bad(where, 'tg 빈칸인데 표가 아니다'); const i = a.counts.indexOf(null); if (i < 0) return bad(where, 'tg 표에 빈칸이 없다');
    if (m[1]) { if (!Array.isArray(a.tally)) return bad(where, 'tg ／ 표시로 구하라는데 세기 줄이 없다'); want = a.tally[i]; }
    else { if (typeof a.total !== 'number') return bad(where, 'tg 합계 없이 빈칸'); want = a.total - a.counts.reduce((s, x) => s + (x || 0), 0); } }
  else if ((m = st.match(/^표를 보고 그래프로 나타내려고 해요\. (세로|가로)는 적어도 몇 칸으로 나누어야 하나요\?$/))) { if (a.type !== 'ftable') return bad(where, 'tg rows 는 표 그림'); want = Math.max(...a.counts); unit = '칸'; }
  else if ((m = st.match(/^표를 보고 그래프를 완성하려고 해요\. (.+?) 칸에는 (◯|×|／)[을를] 몇 개 그려야 하나요\?$/))) {
    if (a.type !== 'pgraph' || !Array.isArray(a.blank) || !a.table) return bad(where, 'tg gblank 는 표 붙은 그래프에 빈 칸'); const i = cols.indexOf(m[1]); if (i < 0 || a.blank.indexOf(i) < 0) return bad(where, 'tg 묻는 칸이 빈 칸이 아니다'); if (m[2] !== (a.mark || '◯')) bad(where, 'tg 발문 기호가 그래프 기호와 다르다'); want = a.counts[i]; unit = '개'; }
  else if (st === '표를 보고 그래프로 나타냈어요. 잘못 옮긴 곳은 어디인가요?') {
    if (a.type !== 'pgraph' || !Array.isArray(a.drawn)) return bad(where, 'tg wrong 은 drawn 그래프'); const i = a.drawn.findIndex((x, j) => x !== a.counts[j]); const mk = a.mark || '◯';
    want = `${cols[i]} — 표는 ${a.counts[i]}${U}인데 ${mk}${mk === '／' ? '을' : '를'} ${a.drawn[i]}개 그렸다`;
    wr.forEach(t => { const w = t.match(/^(.+?) — 표는 (\d+)(?:명|일|개|회)인데 .+? (\d+)개 그렸다$/); if (w) { const j = cols.indexOf(w[1]); if (j < 0) bad(where, 'tg 오답 항목 모름 ' + t); else if (+w[2] === a.counts[j] && +w[3] === a.drawn[j]) bad(where, 'tg 오답 보기가 참말이다 ' + t); } }); }
  else if (st === '그래프를 보세요. 잘못 그린 까닭은 무엇인가요?') {
    if (a.type !== 'pgraph' || !a.bad) return bad(where, 'tg bad 는 bad 그래프'); const V = a.dir !== 'h';
    want = {top: `맨 ${V ? '아래' : '왼쪽'} 칸부터 채우지 않고 ${V ? '위' : '오른쪽'}에서부터 그렸다`, skip: '중간 칸을 건너뛰고 그렸다', mix: '기호를 섞어서 그렸다'}[a.bad.how]; }
  else if ((m = st.match(/^(\d+)(명|일|개|회)보다 많은 (.+?)[은는] 모두 몇 가지인가요\?$/))) {
    if (a.type !== 'pgraph') return bad(where, 'tg more 는 그래프 그림'); if (m[2] !== U || m[3] !== T.noun) bad(where, 'tg more 단위·이름이 주제와 다르다'); const n = +m[1];
    if (a.counts.indexOf(n) < 0) bad(where, 'tg more 경곗값이 그래프에 없다(딱 n 인 칸이 있어야 함정이 선다)'); want = a.counts.filter(x => x > n).length; unit = '가지'; }
  else return bad(where, 'tg 발문 꼴을 모른다: ' + st);
  if (want === null || want === undefined) return bad(where, 'tg 답을 다시 셀 수 없다');
  const W = String(want); const okSa = q.kind === 'sa' && (q.answer || []).map(String).some(x => x === W || x === W + unit);
  if (cor !== W && cor !== W + unit && !okSa) bad(where, `tg 정답 ${cor} ≠ 다시 센 ${W}${unit}`);
  if (wr.indexOf(W) >= 0 || wr.indexOf(W + unit) >= 0) bad(where, `tg 오답 보기에 정답 ${W}${unit} 가 섞였다`);
}
/* v2.5 — cm 갈래: 그림(ruler)이 말하는 길이와 정답이 같은가, 오답에 정답이 섞이지 않았나 */
function checkCm(where, q) {
  const vr = q.variant_rule || {}; const a = q.asset; const CM = vr.cm;
  if (!a || a.type !== 'ruler') { if (CM) bad(where, 'cm 갈래인데 ruler 그림이 없다'); return; }
  const mode = a.mode || 'ruler', len = Number(a.len), s = Number(a.s) || 0, fr = len - Math.floor(len);
  let want, approx = false;
  if (mode === 'unit') want = String(Math.round(len / (Number(a.size) || 1)));
  else { want = String(Math.round(len)); approx = Math.abs(fr) > 1e-9; }
  const st = String(q.stem);
  if (approx && !/약/.test(st) && q.kind !== 'error') bad(where, 'ruler 길이가 눈금 사이인데 발문에 「약」이 없다');
  if (!approx && mode === 'ruler' && /약 몇/.test(st)) bad(where, 'ruler 길이가 눈금에 딱 맞는데 「약 몇 cm」를 묻는다');
  if (!CM) return;   /* 손 문항은 그림 규격만 */
  const norm = x => String(x).replace(/\s/g, '').replace(/cm$|번$/, '');
  if (q.kind === 'sa') { if (norm((q.answer || [])[0]) !== want) bad(where, `cm 단답 정답 ${q.answer} ≠ 그림이 말하는 ${want}`); return; }
  const cor = (q.options || []).find(o => o.correct); if (!cor) return bad(where, 'cm 정답 보기 없음');
  const ct = String(cor.t).replace(/\s/g, '');
  if (norm(ct.replace(/^약/, '')) !== want) bad(where, `cm 정답 보기 「${cor.t}」 ≠ 그림이 말하는 ${want}`);
  if (approx && !/^약/.test(ct)) bad(where, 'cm 눈금 사이인데 정답에 「약」이 없다');
  (q.options || []).filter(o => !o.correct).forEach(o => { const t2 = String(o.t).replace(/\s/g, ''); if (t2 === ct) bad(where, `cm 오답 보기에 정답 「${o.t}」가 섞였다`); });
  if (s === 0 && CM.ask === 'off') bad(where, 'cm off 인데 물건이 0에 있다');
  if (s !== 0 && CM.ask === 'read') bad(where, 'cm read 인데 물건이 0에서 시작하지 않는다(해설 「0에 맞춰져 있어요」가 거짓)');
}
/* v3.0 — 길이 재기(m·cm): 발문·그림이 말하는 답을 엔진과 따로 다시 셈한다 */
const MCMf = T => { const m = Math.floor(T / 100), c = T % 100; return (m && c) ? `${m} m ${c} cm` : m ? `${m} m` : `${c} cm`; };
const MCMtoks = s => [...String(s).matchAll(/(\d+) m(?: (\d+) cm)?(?![a-z])|(\d+) cm/g)].map(m => m[3] !== undefined ? +m[3] : +m[1] * 100 + (m[2] ? +m[2] : 0));
function checkMcm(where, q) {
  const G = (q.variant_rule || {}).mcm; if (!G) return;
  const ask = G.ask || 'tocm', a = q.asset && typeof q.asset === 'object' ? q.asset : null, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, '');
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t)), sa = q.kind === 'sa';
  let want = null, m;
  if (ask === 'm100') {
    if ((m = st.match(/^(\d+) cm는 몇 m인가요/))) { if (+m[1] % 100) return bad(where, 'mcm m100 몇백 cm 가 아니다'); want = sa ? String(+m[1] / 100) : `${+m[1] / 100} m`; }
    else if ((m = st.match(/^(\d+) m는 몇 cm인가요/))) want = sa ? String(+m[1] * 100) : `${+m[1] * 100} cm`;
    else return bad(where, 'mcm m100 발문 꼴: ' + st); }
  else if (ask === 'tocm') { m = st.match(/^(\d+) m (\d+) cm는 몇 cm인가요/); if (!m) return bad(where, 'mcm tocm 발문 꼴: ' + st);
    if (+m[2] < 1 || +m[2] > 99) bad(where, 'mcm tocm cm 는 1~99'); const T = +m[1] * 100 + +m[2]; want = sa ? String(T) : T + ' cm'; }
  else if (ask === 'tomcm') { m = st.match(/^(\d+) cm를 몇 m 몇 cm로 나타내면/); if (!m) return bad(where, 'mcm tomcm 발문 꼴: ' + st);
    if (+m[1] % 100 === 0 || +m[1] < 101) bad(where, 'mcm tomcm 몇 m 몇 cm 꼴이 아니다'); want = MCMf(+m[1]); }
  else if (ask === 'read' || ask === 'off') { if (!a || a.type !== 'tape') return bad(where, 'mcm ' + ask + ' 은 tape 그림이 있어야');
    const s0 = Number(a.s) || 0, len = Number(a.len);
    if (ask === 'off' && (!s0 || !/맞추지 않고/.test(st))) bad(where, 'mcm off — 한끝이 0 이 아니어야 하고 발문이 그 사실을 말해야');
    if (ask === 'read' && s0) bad(where, 'mcm read 인데 한끝이 0 이 아니다(해설 「0에 맞춰져 있어요」가 거짓)');
    if (/몇 m 몇 cm로/.test(st)) want = MCMf(len); else if (/몇 cm인가요/.test(st)) want = sa ? String(len) : len + ' cm'; else return bad(where, 'mcm read 발문 꼴: ' + st);
    if (!st.startsWith(String(a.label))) bad(where, 'mcm read 발문의 물건과 그림 이름표가 다르다'); }
  else if (ask === 'add' || ask === 'sub') { const add = ask === 'add'; let T1, T2;
    if (a && a.type === 'mcm_calc') { if ((a.op === '+') !== add) bad(where, 'mcm 세로셈 기호가 갈래와 다르다'); T1 = a.a[0] * 100 + a.a[1]; T2 = a.b[0] * 100 + a.b[1]; }
    else if (a && a.type === 'mbar') { if ((a.op === '+') !== add) bad(where, 'mcm 띠 그림 op 가 갈래와 다르다'); T1 = a.parts[0][0] * 100 + a.parts[0][1]; T2 = a.parts[1][0] * 100 + a.parts[1][1];
      const tk = MCMtoks(st); if (tk.length && (tk[0] !== T1 || (tk.length > 1 && tk[1] !== T2))) bad(where, 'mcm 발문의 길이와 띠 그림이 다르다'); }
    else { const tk = MCMtoks(st); if (tk.length !== 2) return bad(where, `mcm ${ask} 발문에서 길이 둘을 못 찾았다: ` + st); T1 = tk[0]; T2 = tk[1]; }
    if (add && (T1 % 100) + (T2 % 100) > 99) bad(where, 'mcm add 받아올림이 생긴다');
    if (!add && (T1 <= T2 || T1 % 100 < T2 % 100)) bad(where, 'mcm sub 빼는 길이가 더 길거나 받아내림이 생긴다');
    if (/더해|이어|모두|합/.test(st) && !add && !/잘라/.test(st)) bad(where, 'mcm sub 발문이 합을 묻는 꼴');
    if (/차는|남은|다른 도막/.test(st) && add) bad(where, 'mcm add 발문이 차를 묻는 꼴');
    const R = add ? T1 + T2 : T1 - T2, Rm = add ? Math.floor(T1 / 100) + Math.floor(T2 / 100) : Math.floor(T1 / 100) - Math.floor(T2 / 100), Rc = add ? T1 % 100 + T2 % 100 : T1 % 100 - T2 % 100;
    if (a && a.type === 'mcm_calc' && (a.ask === 'm' || a.ask === 'cm')) { if (!new RegExp(`세로셈에서 ${a.ask} 자리의 \\?`).test(st)) bad(where, 'mcm 세로셈 발문 자리와 ? 칸이 다르다'); want = String(a.ask === 'm' ? Rm : Rc); }
    else want = MCMf(R); }
  else if (ask === 'cmp') { m = st.match(/\n(.+) ○ (.+)$/); if (!m) return bad(where, 'mcm cmp 발문 꼴: ' + st);
    const l = MCMtoks(m[1]), r2 = MCMtoks(m[2]); if (l.length !== 1 || r2.length !== 1) return bad(where, 'mcm cmp 양쪽 길이를 못 읽었다');
    if (/ m/.test(m[1]) === / m/.test(m[2])) bad(where, 'mcm cmp 두 쪽 단위가 같다(m·cm 바꾸기 문제가 아니다)');
    want = l[0] > r2[0] ? '>' : l[0] < r2[0] ? '<' : '='; }
  else if (ask === 'est') { if (!a || a.type !== 'est_row') return bad(where, 'mcm est 는 est_row 그림'); const ppl = !!a.people, tot = ppl ? a.seg * (a.n - 1) : a.seg * a.n;
    if (ppl) { m = st.match(/^학생 (\d+)명이 앞 사람과 약 (\d+) m씩/); if (!m || +m[1] !== a.n || +m[2] !== a.seg) bad(where, 'mcm est 발문의 사람 수·간격이 그림과 다르다'); }
    else { m = st.match(/^한 칸이 약 (\d+) m인 간격이 (\d+)개/); if (!m || +m[1] !== a.seg || +m[2] !== a.n) bad(where, 'mcm est 발문의 칸 수·간격이 그림과 다르다'); }
    want = sa ? String(tot) : `약 ${tot} m`; }
  else if (ask === 'pace') { m = st.match(/^1 m가 약 (\d+)걸음인 친구가 있어요\. 이 친구가 약 (\d+) m를 걸으면/); if (!m) return bad(where, 'mcm pace 발문 꼴: ' + st);
    want = sa ? String(+m[1] * +m[2]) : `약 ${+m[1] * +m[2]}걸음`; }
  else return bad(where, 'mcm ask 를 모른다: ' + ask);
  if (cor !== String(want)) bad(where, `mcm ${ask} 정답 「${cor}」 ≠ 다시 셈한 ${want}`);
  if (wr.some(w => w === String(want))) bad(where, `mcm ${ask} 오답에 정답 ${want} 이 섞였다`);
  if (!sa && ['read', 'off', 'add', 'sub', 'tocm', 'tomcm', 'm100'].indexOf(ask) >= 0) { const cv = MCMtoks(cor); if (cv.length === 1) wr.forEach(w => { const wv = MCMtoks(w); if (wv.length === 1 && wv[0] === cv[0] && /cm|m$/.test(w)) bad(where, `mcm ${ask} 오답 「${w}」 이 정답과 같은 길이`); }); }
}
/* v3.1 — 시각과 시간: 그림·발문이 말하는 답을 엔진과 따로 다시 셈한다 */
const TMf = (h, m) => (m ? `${h}시 ${m}분` : `${h}시`);
const TMd = n => { const q = Math.floor(n / 60), r = n % 60; return q && r ? `${q}시간 ${r}분` : q ? `${q}시간` : `${r}분`; };
const TMwd = ['일', '월', '화', '수', '목', '금', '토'];
const TMsino = n => { const D = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']; return (Math.floor(n / 10) > 1 ? D[Math.floor(n / 10)] : '') + (n >= 10 ? '십' : '') + D[n % 10]; };
const TMnat = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두'];
const TMdur = s => { const m = String(s).match(/^(?:(\d+)시간)? ?(?:(\d+)분)?$/); return m && (m[1] || m[2]) ? (+(m[1] || 0)) * 60 + (+(m[2] || 0)) : null; };
function checkTm(where, q) {
  const G = (q.variant_rule || {}).tm; if (!G) return;
  const ask = G.ask || 'read', a = q.asset && typeof q.asset === 'object' ? q.asset : null, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, '');
  const sa = q.kind === 'sa', cor = sa ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const nx = h => h === 12 ? 1 : h + 1, pv = h => h === 1 ? 12 : h - 1;
  let want = null, m;
  if (ask === 'read') { if (!a || a.type !== 'clock2') return bad(where, 'tm read 는 clock2 그림');
    if ((G.step || 5) === 5 && a.m % 5) bad(where, 'tm read 5분 단위인데 분이 5의 배수가 아니다');
    if (sa) { if (!st.startsWith(`시계가 나타내는 시각은 ${a.h}시 몇 분`)) bad(where, 'tm read 단답 발문의 시가 그림과 다르다'); want = String(a.m); }
    else want = TMf(a.h, a.m); }
  else if (ask === 'numm') { m = st.match(/^긴바늘이 숫자 (\d+)[을를] 가리키면 몇 분/); if (!m || +m[1] < 1 || +m[1] > 11) return bad(where, 'tm numm 발문 꼴: ' + st); want = sa ? String(+m[1] * 5) : `${+m[1] * 5}분`; }
  else if (ask === 'dig') { if (!a || a.type !== 'digital') return bad(where, 'tm dig 는 digital 그림'); want = `${TMnat[a.h]} 시${a.m ? ` ${TMsino(a.m)} 분` : ''}`; }
  else if (ask === 'before') { let h, mm;
    if (a && a.type === 'clock2') { h = a.h; mm = a.m; } else { m = st.match(/^(\d+)시 (\d+)분[은는] /); if (!m) return bad(where, 'tm before 발문 꼴: ' + st); h = +m[1]; mm = +m[2]; }
    if (mm < 30 || mm % 5) bad(where, 'tm before 는 30분 넘고 5분 단위');
    if (sa) { if (!new RegExp(` ${nx(h)}시 몇 분 전인가요`).test(st)) bad(where, 'tm before 단답 발문의 정각이 틀림'); want = String(60 - mm); } else want = `${nx(h)}시 ${60 - mm}분 전`; }
  else if (ask === 'beforer') { m = st.match(/^(\d+)시 (\d+)분 전은 몇 시 몇 분/); if (!m) return bad(where, 'tm beforer 발문 꼴: ' + st); want = TMf(pv(+m[1]), 60 - +m[2]); }
  else if (ask === 'h60') {
    if ((m = st.match(/^(\d+)분은 몇 시간 몇 분/))) { if (+m[1] % 60 === 0 || +m[1] < 61) bad(where, 'tm h60 몇 시간 몇 분 꼴이 아니다'); want = TMd(+m[1]); }
    else if ((m = st.match(/^((?:\d+시간)(?: \d+분)?)[은는] 몇 분인가요/))) { const N = TMdur(m[1]); want = sa ? String(N) : N + '분'; }
    else return bad(where, 'tm h60 발문 꼴: ' + st); }
  else if (ask === 'laps') { m = st.match(/^(\d+)시(?: (\d+)분)?에서 (\d+)시(?: (\d+)분)?[이가] 될 때까지 긴바늘은 몇 바퀴/); if (!m) return bad(where, 'tm laps 발문 꼴: ' + st);
    if ((m[2] || '0') !== (m[4] || '0') || +m[3] <= +m[1]) bad(where, 'tm laps 분이 같고 뒤 시가 커야'); const n = +m[3] - +m[1]; want = sa ? String(n) : n + '바퀴'; }
  else if (ask === 'elapsed') { let F, T;
    if (a && a.type === 'tbar') { F = a.from; T = a.to; if (!st.startsWith(String(a.label))) bad(where, 'tm 시간 띠 이름표와 발문이 다르다'); }
    else if (a && a.type === 'dpair') { F = a.a; T = a.b; }
    else { m = st.match(/^(\d+)시(?: (\d+)분)?에 .+ 시작해서 (\d+)시(?: (\d+)분)?에 끝냈어요/); if (!m) return bad(where, 'tm elapsed 발문 꼴: ' + st); F = [+m[1], +(m[2] || 0)]; T = [+m[3], +(m[4] || 0)]; }
    const D = T[0] * 60 + T[1] - F[0] * 60 - F[1]; if (D <= 0) return bad(where, 'tm elapsed 걸린 시간이 0 이하');
    if (/몇 시간 몇 분인가요/.test(st)) { if (sa) bad(where, 'tm elapsed 몇 시간 몇 분은 단답으로 못 받는다'); want = TMd(D); }
    else if (/몇 분인가요/.test(st)) want = sa ? String(D) : D + '분'; else return bad(where, 'tm elapsed 묻는 단위를 못 찾았다'); }
  else if (ask === 'after') { m = st.match(/^(\d+)시(?: (\d+)분)?에 .+ 시작해서 ((?:\d+시간)?(?: ?\d+분)?) 동안 했어요\. 끝난 시각은 몇 시 몇 분/); if (!m) return bad(where, 'tm after 발문 꼴: ' + st);
    const e = +m[1] * 60 + +(m[2] || 0) + TMdur(m[3].trim()); if (e >= 13 * 60) bad(where, 'tm after 끝난 시각이 12시 59분을 넘는다'); want = TMf(Math.floor(e / 60), e % 60); }
  else if (ask === 'ampm') { m = st.match(/^오전 (\d+)시에 .+ 시작해서 (\d+)시간 동안 했어요/); if (!m) return bad(where, 'tm ampm 발문 꼴: ' + st);
    const e = +m[1] + +m[2]; if (e === 12 || e >= 24) return bad(where, 'tm ampm 끝이 낮 12시이거나 하루를 넘는다'); want = e > 12 ? `오후 ${e - 12}시` : `오전 ${e}시`; }
  else if (ask === 'day') {
    if ((m = st.match(/^(\d+)시간은 며칠 몇 시간/))) { const N = +m[1]; if (N % 24 === 0 || N < 25) bad(where, 'tm day 며칠 몇 시간 꼴이 아니다'); want = `${Math.floor(N / 24)}일 ${N % 24}시간`; }
    else if ((m = st.match(/^(\d+)일(?: (\d+)시간)?[은는] 몇 시간/))) { const N = 24 * +m[1] + +(m[2] || 0); want = sa ? String(N) : N + '시간'; }
    else return bad(where, 'tm day 발문 꼴: ' + st); }
  else if (ask === 'cal') { if (!a || a.type !== 'cal') return bad(where, 'tm cal 은 cal 그림'); const wd = d => (a.start + d - 1) % 7;
    if ((m = st.match(/^(\d+)월 (\d+)일은 무슨 요일/))) { if (+m[1] !== a.mon || +m[2] > a.days) bad(where, 'tm cal 달·날짜가 그림과 다르다'); want = TMwd[wd(+m[2])] + '요일'; }
    else if ((m = st.match(/^(\d+)월의 (첫째|둘째|셋째|넷째) (.)요일은 며칠/))) { const w = TMwd.indexOf(m[3]), n = ['첫째', '둘째', '셋째', '넷째'].indexOf(m[2]) + 1; let D = 0, c = 0; for (let d = 1; d <= a.days; d++) if (wd(d) === w && ++c === n) { D = d; break; }
      if (+m[1] !== a.mon || !D) bad(where, 'tm cal nth 날짜를 못 찾았다'); want = sa ? String(D) : D + '일'; }
    else if ((m = st.match(/^(\d+)월 (\d+)일에서 (?:(\d+)주일|(\d+)일) (후는|전은) 며칠/))) { const k = m[3] ? 7 * +m[3] : +m[4], D = m[5] === '후는' ? +m[2] + k : +m[2] - k;
      if (+m[1] !== a.mon || D < 1 || D > a.days) bad(where, 'tm cal 날짜 셈이 달 밖으로 나간다'); want = sa ? String(D) : D + '일'; }
    else if ((m = st.match(/^(\d+)월에 (.)요일은 모두 몇 번/))) { const w = TMwd.indexOf(m[2]); let c = 0; for (let d = 1; d <= a.days; d++) if (wd(d) === w) c++; want = sa ? String(c) : c + '번'; }
    else return bad(where, 'tm cal 발문 꼴: ' + st); }
  else if (ask === 'units') {
    if ((m = st.match(/^(\d+)주일 (\d+)일은 며칠/))) { const N = 7 * +m[1] + +m[2]; want = sa ? String(N) : N + '일'; }
    else if ((m = st.match(/^(\d+)주일은 며칠/))) { const N = 7 * +m[1]; want = sa ? String(N) : N + '일'; }
    else if ((m = st.match(/^(\d+)일은 몇 주일/))) { if (+m[1] % 7) bad(where, 'tm units 7의 배수가 아니다'); want = sa ? String(+m[1] / 7) : `${+m[1] / 7}주일`; }
    else if ((m = st.match(/^(\d+)년(?: (\d+)개월)?[은는] 몇 개월/))) { const N = 12 * +m[1] + +(m[2] || 0); want = sa ? String(N) : N + '개월'; }
    else if ((m = st.match(/^(\d+)개월은 몇 년 몇 개월/))) { const N = +m[1]; if (N % 12 === 0 || N < 13) bad(where, 'tm units 몇 년 몇 개월 꼴이 아니다'); want = `${Math.floor(N / 12)}년 ${N % 12}개월`; }
    else if ((m = st.match(/^(\d+)월은 며칠까지/))) { const N = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][+m[1]]; if (+m[1] === 2) bad(where, 'tm units 2월은 28일·29일 두 가지라 묻지 않는다'); want = sa ? String(N) : N + '일'; }
    else return bad(where, 'tm units 발문 꼴: ' + st); }
  else return bad(where, 'tm ask 를 모른다: ' + ask);
  if (cor !== String(want)) bad(where, `tm ${ask} 정답 「${cor}」 ≠ 다시 셈한 ${want}`);
  if (wr.some(w => w === String(want))) bad(where, `tm ${ask} 오답에 정답 ${want} 이 섞였다`);
  if (['elapsed', 'h60'].indexOf(ask) >= 0 && !sa) { const cv = TMdur(cor); if (cv !== null) wr.forEach(w => { if (TMdur(w) === cv) bad(where, `tm ${ask} 오답 「${w}」 이 정답과 같은 시간`); }); }
}
/* v2.9 — 곱셈구구: 곱셈표·발문이 말하는 답을 엔진과 따로 다시 셈한다 */
/* v3.3 — 규칙 찾기: 그림(ptile·spin·stack·optab·numgrid·cal)에서 규칙을 따로 다시 찾아 발문이 묻는 답을 셈한다 */
const KRC_COL = ['빨강', '주황', '노랑', '연두', '초록', '하늘', '파랑', '보라', '분홍', '회색'];
const KRC_CN = {'빨강':'빨간색', '주황':'주황색', '노랑':'노란색', '연두':'연두색', '초록':'초록색', '하늘':'하늘색', '파랑':'파란색', '보라':'보라색', '분홍':'분홍색', '회색':'회색'};
const KRC_SH = ['원', '삼각형', '사각형', '별', '마름모', '칸'];
const KRC_ORD = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
function krcItem(it){ if (it === null) return null; if (typeof it === 'number') return {n:it}; const p = String(it).split(':'); return {c:p[0], s:p[1]}; }
function krcName(it){ const x = krcItem(it); if (!x) return '?'; if (x.n !== undefined) return String(x.n); return x.s === '칸' ? KRC_CN[x.c] : KRC_CN[x.c] + ' ' + x.s; }
function krcPer(arr){ for (let p = 1; p * 2 <= arr.length; p++){ let ok = true;
    for (let i = 0; i < arr.length && ok; i++) if (arr[i] !== null) for (let j = i + p; j < arr.length; j += p) if (arr[j] !== null && String(arr[j]) !== String(arr[i])){ ok = false; break; }
    if (ok) return p; } return 0; }
function krcFill(arr, i, p){ for (let j = i % p; j < arr.length; j += p) if (arr[j] !== null) return arr[j]; return undefined; }
/* v3.4 분수의 나눗셈 (6학년 2학기 1단원, 2026-10-13) — 엔진과 따로 셈한다.
   글 속 분수 ⟨a/b⟩·⟨n a/b⟩ 를 발문에서 읽어 나누는 식을 다시 세우고, 정답(단답·정답 보기)이 그 값과 같은지 · 오답 보기가 정답과 값이 다른지 · 정답 꼴이 약분한 대분수(또는 발문이 가분수를 물으면 가분수)인지 본다. */
const fdG = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b){ const t = a % b; a = b; b = t; } return a || 1; };
const fdRe = /⟨(?:(\d+) )?(\d+)\/(\d+)⟩|(\d+)(?![\d\/])/g;
function fdToks(s){ const out = []; let m; const re = new RegExp(fdRe.source, 'g'); const t = String(s).replace(/⟨□\/\d+⟩|□/g, ' ');
  while ((m = re.exec(t))){ if (m[4] !== undefined) out.push({n: Number(m[4]), d: 1, raw: m[0], i: m.index}); else out.push({n: Number(m[1] || 0) * Number(m[3]) + Number(m[2]), d: Number(m[3]), w: m[1] !== undefined, raw: m[0], i: m.index}); } return out; }
const fdVal = s => { const p = fdParse1(s); return p ? p.n / p.d : NaN; };
function fdParse1(s){ s = String(s).trim().replace(/\s*(개|컵|병|장|명|배|kg|m²|m|L|cm|km)\s*$/, ''); const m = s.match(/^⟨(?:(\d+) )?(\d+)\/(\d+)⟩$/); if (m) return {n: Number(m[1] || 0) * Number(m[3]) + Number(m[2]), d: Number(m[3]), w: m[1] !== undefined, pn: Number(m[2]), pd: Number(m[3])}; if (/^\d+$/.test(s)) return {n: Number(s), d: 1}; return null; }
function fdExprVal(s){ /* 「A × B」·「A ÷ B」·「A ÷ b × c」 */ const parts = String(s).split(/\s*([×÷])\s*/); let v = fdVal(parts[0]); if (isNaN(v)) return NaN;
  for (let i = 1; i < parts.length; i += 2){ const x = fdVal(parts[i + 1]); if (isNaN(x)) return NaN; v = parts[i] === '×' ? v * x : v / x; } return v; }
function checkFdAsset(where, a){ if (!Array.isArray(a.bars) || !a.bars.length || a.bars.length > 3) return bad(where, 'fbar bars 는 1~3개');
  a.bars.forEach((b, i) => { if (!(b.den >= 2 && b.den <= 24)) bad(where, `fbar ${i + 1} den 2~24`); if (!(b.num >= 0 && b.num <= b.den)) bad(where, `fbar ${i + 1} num 0~den`); if (b.grp && !(b.grp >= 1 && b.grp <= b.den)) bad(where, `fbar ${i + 1} grp 범위`); }); }
function checkFd(where, q){
  const K = (q.variant_rule || {}).fd; if (!K) return;
  const ask = K.ask, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, ''), B = m => bad(where, 'fd ' + ask + ' ' + m);
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t), wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const near = (x, y) => Math.abs(x - y) < 1e-9; let want = null, exprMode = false, tongMode = false;
  const toks = fdToks(st.replace(/(\d+)\s*(개|번|시간|줄|m²|kg|km|cm|m|L)(?![가-힣])/g, (mm, n, u) => (u === '시간' || u === 'm²' || u === 'kg' || u === 'km' || u === 'cm' || u === 'm' || u === 'L') ? mm : n + ' ' + u));
  const frs = toks.filter(t => t.d > 1), ints = toks.filter(t => t.d === 1), first2 = toks.slice(0, 2);
  const divOf = (x, y) => x.n * y.d / (x.d * y.n);
  if (ask === 'same' || ask === 'diff' || ask === 'mul' || (ask === 'mixed' && !/가분수로 (고칠|바르게 고친)/.test(st))){
    if (/곱셈으로 바르게/.test(st)){ const [x, y] = frs; if (!x || !y) return B('식 없음'); const val = divOf(x, y);
      if (!near(fdExprVal(cor), val)) B(`곱셈 식 정답 값 ${cor} ≠ ${val}`); wr.forEach(w => { if (near(fdExprVal(w), val)) B('오답 식 값이 정답과 같다: ' + w); }); return; }
    if (/통분한 것은/.test(st)){ tongMode = true; if (frs.length < 2) return B('분수 둘이 없다'); const [x, y] = frs; const cp = String(cor).split(/\s*÷\s*/); if (cp.length !== 2) return B('통분 정답 꼴');
      const p1 = fdParse1(cp[0]), p2 = fdParse1(cp[1]); if (!p1 || !p2) return B('통분 정답 파싱'); if (p1.pd !== p2.pd) B('통분 정답 분모가 다르다'); if (!near(p1.n / p1.d, x.n / x.d) || !near(p2.n / p2.d, y.n / y.d)) B('통분 정답 값이 원래와 다르다');
      wr.forEach(w => { const wp = w.split(/\s*÷\s*/).map(fdParse1); if (wp.length === 2 && wp[0] && wp[1] && wp[0].pd === wp[1].pd && near(wp[0].n / wp[0].d, x.n / x.d) && near(wp[1].n / wp[1].d, y.n / y.d)) B('오답 보기가 바른 통분이다: ' + w); }); return; }
    if (ask === 'same' && /□는 어느/.test(st)){ const x = frs[0]; if (!x) return B('분수 없음'); const c = Number(cor); if (!(x.n % c === 0 && c >= 1)) B(`□=${c} 가 ${x.n}의 약수가 아니다`); wr.forEach(w => { if (x.n % Number(w) === 0) B('오답 □ 도 약수: ' + w); }); return; }
    if (/배인가요/.test(st) || /몫은 얼마|몫을 (가분수|기약분수)로|분자에 오는 수|나누어 (담|쓰)|무게는 몇|필요한가요|세로는 몇|가로는 몇|1 m의 무게|1 kg은 몇 m/.test(st)){
      let x, y;
      if (/무게가 .* kg인 천/.test(st)){ y = frs.find(t => /m/.test(st.slice(t.i + t.raw.length, t.i + t.raw.length + 3))); x = frs.find(t => t !== y); }
      else if (/넓이는/.test(st)){ x = frs[0]; y = frs[1]; }
      else { x = frs.length >= 2 ? frs[0] : null; y = frs.length >= 2 ? frs[1] : null; }
      if (!x || !y) return B('나누는 식을 못 세웠다');
      let val = divOf(x, y);
      if (/분자에 오는 수/.test(st)){ const m = st.match(/⟨□\/(\d+)⟩/); if (m){ want = val * Number(m[1]); if (!near(want, Math.round(want))) B('몫 분자가 정수가 아니다'); } else { const g = fdG(x.n * y.d, x.d * y.n); want = x.n * y.d / g; } }
      else if (/분자와 분모의 합/.test(st)){ const g = fdG(x.n * y.d, x.d * y.n); want = x.n * y.d / g + x.d * y.n / g; }
      else if (/때 분모[은는]/.test(st)){ const g = fdG(x.n * y.d, x.d * y.n); want = x.d * y.n / g; }
      else if (/때 분자[은는]/.test(st)){ const g = fdG(x.n * y.d, x.d * y.n); want = x.n * y.d / g; }
      else want = val; }
  }
  else if (ask === 'mixed'){ const x = frs[0]; if (!x) return B('대분수 없음'); if (q.kind === 'sa') want = x.n; else { const p = fdParse1(cor); if (!p || p.w || p.pn !== x.n || p.pd !== x.d) B(`가분수 정답 ${cor} ≠ ⟨${x.n}/${x.d}⟩`); wr.forEach(w => { if (near(fdVal(w), x.n / x.d)) B('오답이 같은 값: ' + w); }); return; } }
  else if (ask === 'nunit' || ask === 'nfrac'){
    if (/곱셈으로 바르게/.test(st)){ exprMode = true; const n = ints[0], f = frs[0]; if (!n || !f) return B('식 없음'); const val = n.n * f.d / f.n;
      if (!near(fdExprVal(cor), val)) B(`곱셈 식 정답 값 ${cor} ≠ ${val}`); wr.forEach(w => { if (near(fdExprVal(w), val)) B('오답 식 값이 정답과 같다: ' + w); }); return; }
    const n = ints.find(t => t.i < (frs[0] || {i: 1e9}).i), f = frs[0]; if (!n || !f) return B('자연수·분수를 못 찾았다'); want = n.n * f.d / f.n; }
  else if (ask === 'tile'){
    if (/몇 개를 붙일 수/.test(st)){ const f = frs[0], L = toks.find(t => f && t.i > f.i); if (!f || !L) return B('타일 식 없음'); want = (L.n / L.d) * f.d / f.n; }
    else if (/모두 몇 개 필요/.test(st)){ const [p, qn] = ints; want = p.n * qn.n; }
    else { const [p, qn, have] = ints; const need = p.n * qn.n; const ok = have.n >= need; if (!(new RegExp(`^${need}개`).test(cor)) || (ok ? !/붙일 수 있어요/.test(cor) : !/모자라요/.test(cor))) B(`fit 정답 ${cor} (필요 ${need}, 가진 ${have.n})`); return; } }
  else if (ask === 'cmp'){ const big = /가장 큰/.test(st); const all = [cor].concat(wr).map(t => [t, fdExprVal(t)]); if (all.some(([t, v]) => isNaN(v))) return B('식 값 파싱 실패');
    const best = all.slice().sort((a, b) => big ? b[1] - a[1] : a[1] - b[1])[0]; if (best[0] !== cor) B(`가장 ${big ? '큰' : '작은'} 것은 ${best[0]} 인데 정답이 ${cor}`); if (new Set(all.map(x => x[1].toFixed(6))).size !== all.length) B('몫이 같은 식이 둘'); return; }
  else if (ask === 'maxmin'){ if (frs.length < 2) return B('분수 묶음 없음'); const mx = frs.reduce((a, b) => a.n / a.d > b.n / b.d ? a : b), mn = frs.reduce((a, b) => a.n / a.d < b.n / b.d ? a : b); want = divOf(mx, mn); }
  else if (ask === 'back'){ const d = frs[0], p = toks.find(t => d && t.i > d.i); if (!d || !p) return B('어떤 수 식 없음'); const x = p.n * d.d / (p.d * d.n); want = /바르게 계산한 값/.test(st) ? x * d.d / d.n : x; }
  else return B('모르는 ask');
  if (want === null) return B('정답을 발문에서 못 셈했다: ' + st);
  const cv = fdVal(cor); if (isNaN(cv)) return B('정답을 수로 못 읽었다: ' + cor);
  if (!near(cv, want)) B(`정답 ${cor}(${cv}) ≠ ${want}`);
  if (q.kind === 'sa'){ if (!/^\d+$/.test(String(q.answer[0]))) B('단답 정답은 숫자'); if (Number(q.answer[0]) >= 100) B('단답 숫자판은 두 자리까지'); }
  else { const p = fdParse1(cor); const impAsk = /가분수로 나타낼/.test(st);
    if (p && p.d > 1){ const g = fdG(p.pn, p.pd); if (g !== 1) B('정답 분수가 약분되지 않았다: ' + cor); if (!impAsk && !p.w && p.pn > p.pd) B('정답이 가분수 꼴(대분수로): ' + cor); }
    wr.forEach(w => { const wv = fdVal(w); if (!isNaN(wv) && near(wv, want)) B('오답 보기가 정답과 같은 값: ' + w); }); }
}
/* v3.5 — 공간과 입체: 그림 spv 에서 쌓은 모양을 다시 읽어 개수·앞·옆·위 판·층별·세 판의 해를 따로 셈한다 */
function checkSpAsset(where, a){
  const B = m => bad(where, 'spv ' + m); const cells = a.cells;
  if (!Array.isArray(cells) || !cells.length || cells.length > 27) return B('cells 는 1~27개');
  const key = c => c.slice(0, 3).join(','); const S = new Set(cells.map(key)); if (S.size !== cells.length) B('같은 자리에 쌓기나무가 둘');
  cells.forEach(c => { if (!Array.isArray(c) || c.length < 3 || c.slice(0, 3).some(v => !Number.isInteger(v) || v < 0 || v > 3)) B('좌표는 0~3 정수: ' + JSON.stringify(c)); if (c[2] > 0 && !S.has([c[0], c[1], c[2] - 1].join(','))) B('공중에 뜬 쌓기나무 ' + c); });
  const C = ENG.spCols(cells); if (C.top > 3) B('4층 이상');
  { const ps = C.pos || [], K = p => p[0] + ',' + p[1], S = new Set(ps.map(K)); if (ps.length){ const seen = new Set([K(ps[0])]), st = [ps[0]];
      while (st.length){ const [x, y] = st.pop(); [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => { const k = (x + dx) + ',' + (y + dy); if (S.has(k) && !seen.has(k)){ seen.add(k); st.push([x + dx, y + dy]); } }); }
      if (seen.size !== ps.length) B('자리가 면으로 이어지지 않았다(떨어진 자리)'); } }
  const SHOW = ['3d', 'top', 'num', 'front', 'side', 'layers']; (a.show || []).forEach(k => { if (SHOW.indexOf(k) < 0) B('show 를 모른다: ' + k); });
  if (!a.show || !a.show.length) { if (!a.cand) B('show 가 비었다'); }
  if (a.q){ if (!(Array.isArray(a.q) && ENG.spH(C, a.q[0], a.q[1]) > 0)) B('q 자리에 쌓기나무가 없다'); if ((a.show || []).indexOf('num') < 0) B('q 는 num 그림에서만'); }
  if (a.qlayer !== undefined){ if (!(Number.isInteger(a.qlayer) && a.qlayer >= 1 && a.qlayer < C.top)) B('qlayer 는 1~(꼭대기 층−1)'); if ((a.show || []).indexOf('layers') < 0) B('qlayer 는 layers 그림에서만'); }
  if (a.marks){ Object.keys(a.marks).forEach(k => { const [x, y] = k.split(',').map(Number); if (!(ENG.spH(C, x, y) > 0)) B('marks 자리에 쌓기나무가 없다: ' + k); }); if ((a.show || []).indexOf('num') < 0) B('marks 는 num 그림에서만'); }
  if (a.cand){ const g = a.cand.grids; if (['front', 'side', 'top'].indexOf(a.cand.kind) < 0) B('cand kind'); if (!Array.isArray(g) || g.length !== 4) return B('cand 는 4개');
    const keys = g.map(x => JSON.stringify(x)); if (new Set(keys).size !== 4) B('cand 에 같은 그림이 둘');
    g.forEach((x, i) => { if (a.cand.kind === 'top'){ if (!Array.isArray(x) || !x.length || x.some(r => !Array.isArray(r) || r.some(v => v !== 0 && v !== 1)) || !x.some(r => r.some(v => v))) B(`cand ${i + 1} top 그림 꼴`); }
      else if (!Array.isArray(x) || !x.length || x.some(v => !(Number.isInteger(v) && v >= 1 && v <= 4))) B(`cand ${i + 1} 높이 줄 꼴`); }); }
  /* 가려진 자리는 위에서 본 모양(또는 수·층별)이 같이 있어야 하고 1개뿐이다 */
  const show = a.show || []; if (show.indexOf('3d') >= 0 && !a.cand){ const hid = ENG.spHidden(cells);
    if (hid.length && show.indexOf('top') < 0 && show.indexOf('num') < 0 && show.indexOf('layers') < 0) B(`가려진 자리 ${JSON.stringify(hid)}가 있는데 위에서 본 모양이 없다 — 개수가 정해지지 않는다`);
    hid.forEach(p => { if (ENG.spH(C, p[0], p[1]) !== 1) B(`가려진 자리 ${p} 에 쌓기나무가 ${ENG.spH(C, p[0], p[1])}개 — 가려진 자리는 1개(교과서 약속)`); }); }
}
function checkSp(where, q){
  const K = (q.variant_rule || {}).sp; if (!K) return;
  const ask = K.ask, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, ''), B = m => bad(where, 'sp ' + ask + ' ' + m);
  const a = q.asset; if (!a || a.type !== 'spv') return B('그림이 spv 아님');
  const cells = a.cells, C = ENG.spCols(cells), n = C.n, P = C.pos.length, F = ENG.spFront(C), S = ENG.spSide(C), show = a.show || [];
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t), wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const num = s => Number(String(s).replace(/[^\d]/g, '')); const sum = arr => arr.reduce((t, x) => t + x, 0);
  let want = null;
  if (ask === 'count'){ want = n; const hid = ENG.spHidden(cells); if (show.indexOf('3d') < 0) B('쌓은 모양이 없다'); if (hid.length && show.indexOf('top') < 0) B('가려진 자리가 있는데 위에서 본 모양이 없다'); if (/한 줄로/.test(st) && C.ny !== 1) B('한 줄이라는데 두 줄 이상'); }
  else if (ask === 'numsum'){ want = n; if (show.indexOf('num') < 0 || a.q) B('num 그림(? 없이)이어야'); }
  else if (ask === 'numq'){ if (!a.q) return B('? 자리가 없다'); want = ENG.spH(C, a.q[0], a.q[1]); const m = st.match(/모두 (\d+)개/); if (!m || Number(m[1]) !== n) B(`발문의 전체 개수 ${m && m[1]} ≠ ${n}`); }
  else if (ask === 'lay'){ want = n; if (show.indexOf('layers') < 0 || a.qlayer !== undefined) B('layers 그림(? 없이)이어야'); }
  else if (ask === 'layq'){ if (a.qlayer === undefined) return B('가려진 층이 없다'); want = ENG.spLayerCount(C, a.qlayer); const m = st.match(/모두 (\d+)개/); if (!m || Number(m[1]) !== n) B('발문의 전체 개수가 다르다'); const l = st.match(/(\d)층 그림이 가려졌/); if (!l || Number(l[1]) !== a.qlayer + 1) B('발문의 층과 qlayer 가 다르다'); }
  else if (ask === 'l2'){ const l = st.match(/(\d)층에 놓이는/); if (!l) return B('발문에 층이 없다'); const L = Number(l[1]); want = C.pos.filter(p => ENG.spH(C, p[0], p[1]) >= L).length; if (show.indexOf('num') < 0) B('num 그림이어야'); }
  else if (ask === 'view' || ask === 'tri'){ if (!a.cand) return B('보기 그림이 없다'); const kind = a.cand.kind; const dn = {front:'앞', side:'옆', top:'위'}[kind]; if (st.indexOf(dn + '에서 본 모양') < 0) B('발문의 방향과 cand kind 가 다르다');
    if (ask === 'view' && show.indexOf('3d') < 0) B('쌓은 모양이 없다'); if (ask === 'tri' && show.indexOf('num') < 0) B('수 쓴 그림이 없다');
    if (ask === 'view' && ENG.spHidden(cells).length) B('가려진 자리가 있는 모양 — 보고 그릴 수 없다');
    const right = kind === 'front' ? F : kind === 'side' ? S : ENG.spTopRows(C); const ci = ENG.FTAG.indexOf(cor); if (ci < 0 || ci > 3) return B('정답 보기 이름이 ㉮~㉱ 아님');
    if (JSON.stringify(a.cand.grids[ci]) !== JSON.stringify(right)) B(`정답 보기 ${cor} 가 실제 ${dn}에서 본 모양(${JSON.stringify(right)})과 다르다: ${JSON.stringify(a.cand.grids[ci])}`);
    a.cand.grids.forEach((g, i) => { if (i !== ci && JSON.stringify(g) === JSON.stringify(right)) B(`오답 보기 ${ENG.FTAG[i]} 도 바른 모양`); });
    wr.forEach(w => { if (ENG.FTAG.indexOf(w) < 0) B('오답 보기 이름이 ㉮~㉱ 아님: ' + w); }); return; }
  else if (ask === 'cols'){ const kind = /앞에서/.test(st) ? 'front' : 'side'; const L = (kind === 'front' ? F : S).map(x => x + '층').join(', '); if (cor !== L) B(`정답 「${cor}」 ≠ 실제 「${L}」`); if (ENG.spHidden(cells).length) B('가려진 자리가 있는 모양'); wr.forEach(w => { if (w === L) B('오답이 정답과 같다'); }); return; }
  else if (ask === 'cellsv'){ const kind = /앞에서/.test(st) ? 'front' : /옆에서/.test(st) ? 'side' : 'top'; want = kind === 'front' ? sum(F) : kind === 'side' ? sum(S) : P; if (ENG.spHidden(cells).length) B('가려진 자리가 있는 모양'); }
  else if (ask === 'three' || ask === 'minmax' || ask === 'cases'){ if (['top', 'front', 'side'].some(k => show.indexOf(k) < 0)) B('세 판이 다 있어야'); const sols = ENG.spSolutions(C); const cnt = sols.map(sum);
    if (ask === 'three'){ if (sols.length !== 1) B(`세 판으로 모양이 ${sols.length}가지 — 하나로 정해지지 않는다`); want = n; }
    else if (ask === 'cases'){ if (sols.length < 2) B('가짓수 문제인데 하나로 정해진다'); want = sols.length; }
    else { if (sols.length < 2) B('가장 적을·많을 때 문제인데 하나로 정해진다'); want = /많을/.test(st) ? Math.max.apply(null, cnt) : Math.min.apply(null, cnt); } }
  else return B('ask 를 모른다');
  if (want === null) return;
  if (num(cor) !== want) B(`정답 ${cor} ≠ 그림에서 셈한 ${want}`);
  wr.forEach(w => { if (num(w) === want) B('오답 보기가 정답과 같은 값: ' + w); });
  if (q.kind === 'sa' && want > 9999) B('단답 정답이 네 자리를 넘는다');
}
function checkKrAsset(where, a){
  const B = m => bad(where, a.type + ' ' + m);
  if (a.type === 'ptile'){ if (!Array.isArray(a.rows) || !a.rows.length || a.rows.length > 3) return B('rows 는 1~3줄'); let nul = 0;
    a.rows.forEach(row => { if (!Array.isArray(row) || row.length < 3 || row.length > 16) B('한 줄은 3~16칸');
      (row || []).forEach(it => { if (it === null){ nul++; return; } if (typeof it === 'number'){ if (!(Number.isInteger(it) && it >= 0 && it <= 99)) B('수 칸은 0~99'); return; }
        const x = krcItem(it); if (KRC_COL.indexOf(x.c) < 0 || KRC_SH.indexOf(x.s) < 0) B('모르는 칸 ' + it); }); });
    if (nul > 1) B('? 칸이 둘 이상'); if (a.grp !== undefined && !(a.grp >= 2 && a.grp <= a.rows[0].length)) B('grp 범위'); }
  if (a.type === 'spin'){ const n = a.n; if (!(Number.isInteger(n) && n >= 3 && n <= 8)) return B('n 은 3~8'); if (!Array.isArray(a.boards) || a.boards.length < 2 || a.boards.length > 6) return B('판은 2~6개');
    if (a.boards.filter(b => b === null).length > 1) B('? 판이 둘 이상'); a.boards.forEach(b => { if (b !== null && [].concat(b).some(x => !(Number.isInteger(x) && x >= 0 && x < n))) B('칸 번호 범위'); }); }
  if (a.type === 'stack'){ if (!Array.isArray(a.stages) || a.stages.length < 2 || a.stages.length > 5) return B('단계는 2~5개'); if (a.stages.filter(s => s === null).length > 1) B('? 단계가 둘 이상');
    a.stages.forEach((cells, k) => { if (cells === null) return; if (!Array.isArray(cells) || !cells.length) return B(`${k + 1}단계 비었음`);
      const S = new Set(cells.map(c => c.slice(0, 3).join(','))); if (S.size !== cells.length) B(`${k + 1}단계 같은 자리에 둘`);
      cells.forEach(c => { if (c.slice(0, 3).some(v => !Number.isInteger(v) || v < 0 || v > 7)) B('좌표 0~7'); if (c[3] !== 0 && ['r', 'y', 'b', 'g'].indexOf(c[3]) < 0) B('색 r·y·b·g·0');
        if (c[2] > 0 && !S.has([c[0], c[1], c[2] - 1].join(','))) B('공중에 뜬 쌓기나무'); if (c[1] !== 0) B('쌓은 모양은 한 줄(y=0) — 뒤에 가려지는 것이 없게'); }); }); }
  if (a.type === 'optab'){ if (a.op !== '+' && a.op !== '×') B("op 는 '+'|'×'"); const R = a.rows || [], C = a.cols || [];
    if (R.length < 2 || R.length > 9 || C.length < 2 || C.length > 9) B('줄·칸 2~9'); if ([...R, ...C].some(x => !(Number.isInteger(x) && x >= 0 && x <= 20))) B('머리 수 0~20');
    const inr = p => Array.isArray(p) && p[0] >= 0 && p[0] < R.length && p[1] >= 0 && p[1] < C.length;
    if (a.q && !inr(a.q)) B('q 범위'); (a.blank || []).forEach(p => { if (!inr(p)) B('blank 범위'); if (a.q && p[0] === a.q[0] && p[1] === a.q[1]) B('q 가 blank 에도'); }); (a.hi || []).forEach(p => { if (!inr(p)) B('hi 범위'); });
    if (a.hrow !== undefined && !(a.hrow >= 0 && a.hrow < R.length)) B('hrow 범위'); if (a.hcol !== undefined && !(a.hcol >= 0 && a.hcol < C.length)) B('hcol 범위'); }
  if (a.type === 'numgrid'){ const R = a.rows || []; if (R.length < 2 || R.length > 8) return B('줄 2~8'); const w = R[0].length; if (R.some(r => r.length !== w) || w < 2 || w > 8) B('칸 수가 고르지 않다');
    if (a.q && !(a.q[0] < R.length && a.q[1] < w && R[a.q[0]][a.q[1]] === null)) B('q 칸은 비어 있어야(null)'); }
  if (a.type === 'cal' && a.q !== undefined && !(a.q >= 1 && a.q <= a.days)) B('q 날짜 범위');
}
function checkKr(where, q){
  const K = (q.variant_rule || {}).kr; if (!K) return;
  const ask = K.ask, a = q.asset && typeof q.asset === 'object' ? q.asset : null, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, '');
  const strip = x => String(x).replace(/\s*(칸|가지|개|일)$/, '');
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const B = m => bad(where, 'kr ' + ask + ' ' + m); let want = null, m;
  const T = x => x === 0 ? '모두 같아요' : x > 0 ? `${x}씩 커져요` : `${-x}씩 작아져요`;
  if (ask === 'rnext'){ if (!a || a.type !== 'ptile') return B('그림이 ptile 아님'); const row = a.rows[0], qi = row.indexOf(null); if (qi < 0) return B('? 칸 없음');
    const its = row.map(krcItem), shapes = its.map(x => x && x.s !== undefined ? x.s : x && x.n !== undefined ? '#' : null), cols = its.map(x => x && x.c !== undefined ? x.c : x && x.n !== undefined ? '#' : null);
    const combo = new Set(shapes.filter(Boolean)).size > 1 && new Set(cols.filter(Boolean)).size > 1;
    if (combo){ const pS = krcPer(shapes), pC = krcPer(cols); if (!pS || !pC) return B('모양·색 규칙이 두 번 넘게 보이지 않는다');
      const s = krcFill(shapes, qi, pS), c = krcFill(cols, qi, pC); if (s === undefined || c === undefined) return B('? 자리의 모양·색이 정해지지 않는다'); want = krcName(c + ':' + s);
      if (!/모양과 색이 함께/.test(st)) B('모양과 색이 함께 바뀌는데 발문이 말하지 않는다'); }
    else { const p = krcPer(row); if (!p) return B('되풀이가 두 번 넘게 보이지 않는다'); const x = krcFill(row, qi, p); if (x === undefined) return B('? 자리가 정해지지 않는다'); want = krcName(x); }
    if (!/\?에 알맞은/.test(st)) B('발문 꼴: ' + st); }
  else if (ask === 'runit'){ if (!a || a.type !== 'ptile') return B('그림이 ptile 아님'); const row = a.rows[0]; if (row.indexOf(null) >= 0) return B('runit 에 ? 칸');
    const p = krcPer(row); if (!p) return B('되풀이가 두 번 넘게 보이지 않는다');
    if (/몇 칸인가요/.test(st)) want = p; else if ((m = st.match(/몇 가지 (색|모양|수)/))) { want = new Set(row.slice(0, p).map(String)).size; if (m[1] === '색' && new Set(row.map(x => krcItem(x).s)).size > 1) B('「몇 가지 색」인데 모양도 바뀐다'); }
    else return B('발문 꼴: ' + st); }
  else if (ask === 'rnum'){ if (!a || a.type !== 'ptile' || a.rows.length !== 2) return B('두 줄 ptile 아님'); const mp = {}; const re = /(원|삼각형|사각형|별|마름모)[은는] (\d)/g; while ((m = re.exec(st))) mp[m[1]] = +m[2];
    const r0 = a.rows[0], r1 = a.rows[1]; if (r0.length !== r1.length) return B('두 줄 길이 다름'); const qi = r1.indexOf(null); if (qi < 0) return B('? 칸 없음');
    r0.forEach((it, i) => { const s = krcItem(it).s; if (mp[s] === undefined) B('발문에 없는 모양 ' + s); else if (i !== qi && r1[i] !== mp[s]) B(`${i + 1}번째 수 ${r1[i]} 가 바꾸는 약속(${mp[s]})과 다르다`); });
    if (new Set(Object.values(mp)).size !== Object.keys(mp).length) B('다른 모양에 같은 수'); want = mp[krcItem(r0[qi]).s]; }
  else if (ask === 'spin'){ if (!a || a.type !== 'spin') return B('그림이 spin 아님'); const bs = a.boards, n = a.n; let d = null;
    for (let i = 1; i < bs.length; i++) if (bs[i] !== null && bs[i - 1] !== null){ const x = ((bs[i] - bs[i - 1]) % n + n) % n; if (d === null) d = x; else if (d !== x) return B('판마다 도는 칸 수가 다르다'); }
    if (!d || d * 2 === n) return B('돌지 않거나 방향을 알 수 없다(반 바퀴)'); const cw = d * 2 < n;
    if (/어디인가요/.test(st)){ if (n !== 4 || bs[bs.length - 1] !== null) return B('next 는 4칸 판·마지막이 ?'); want = ['위', '오른쪽', '아래', '왼쪽'][(bs[bs.length - 2] + d) % 4]; }
    else if (/어느 쪽으로/.test(st)) want = cw ? '시계 방향' : '시계 반대 방향';
    else if (/몇 칸씩/.test(st)) want = cw ? d : n - d; else return B('발문 꼴: ' + st); }
  else if (ask === 'grow'){ if (!a || a.type !== 'ptile' || !a.runs) return B('runs ptile 아님'); const row = a.rows[0].slice(); const tail = row[row.length - 1] === null; if (tail) row.pop(); if (row.indexOf(null) >= 0) return B('? 가 끝이 아닌 곳에');
    const runs = []; row.forEach(it => { if (runs.length && runs[runs.length - 1][0] === it) runs[runs.length - 1][1]++; else runs.push([it, 1]); });
    const A = runs[0][0], Bi = runs[1] && runs[1][0]; if (runs.some((x, i) => x[0] !== (i % 2 ? Bi : A))) return B('두 가지가 번갈아 나오지 않는다');
    const ca = runs.filter((_, i) => i % 2 === 0).map(x => x[1]); const d = ca[1] - ca[0]; if (ca.length < 3 || ca.some((x, i) => i && x - ca[i - 1] !== d) || d <= 0) return B('묶음이 고르게 늘지 않는다');
    const cn = KRC_CN[krcItem(A).c]; if (st.indexOf(cn + ' 묶음') < 0) B('발문의 색이 늘어나는 묶음과 다르다');
    if (/\?에 올/.test(st)){ if (!tail || runs.length % 2) return B('? 자리가 다음 ' + cn + ' 묶음이 아니다'); want = ca[ca.length - 1] + d; }
    else if ((m = st.match(/(\S+째) 묶음까지/))){ const k = KRC_ORD.indexOf(m[1]); if (k < 1) return B('서수'); want = 0; for (let i = 0; i < k; i++) want += ca[0] + i * d; }
    else return B('발문 꼴: ' + st); }
  else if (ask === 'stk'){ if (!a || a.type !== 'stack') return B('그림이 stack 아님'); const S = a.stages, c = S.filter(x => x !== null).map(x => x.length); if (c.length < 3) return B('보이는 단계가 셋 미만');
    const d1 = c[1] - c[0], d2 = c[2] - c[1], e = d2 - d1; if (e !== 0 && e !== 1) return B('늘어나는 규칙을 하나로 정할 수 없다');
    const f = t => { let x = c[0], d = d1; for (let k = 1; k < t; k++){ x += d; if (k >= 1) d += e; } return x; };
    if (f(2) !== c[1] || f(3) !== c[2]) return B('규칙 재계산 어긋남');
    if (/\?에 쌓을/.test(st)){ if (S[S.length - 1] !== null) return B('마지막이 ? 가 아니다'); want = f(S.length); }
    else if ((m = st.match(/(\S+째) 모양/))){ const k = KRC_ORD.indexOf(m[1]); if (k < 4) return B('서수가 보이는 단계 안'); want = f(k); }
    else if (/몇 개씩 늘어나/.test(st)){ if (e) return B('늘어나는 수가 달라지는데 몇 개씩을 묻는다'); want = d1; } else return B('발문 꼴: ' + st); }
  else if (ask === 'addt' || ask === 'mult'){ if (!a || a.type !== 'optab') return B('그림이 optab 아님'); const op = a.op, val = (i, j) => op === '×' ? a.rows[i] * a.cols[j] : a.rows[i] + a.cols[j];
    if ((op === '×') !== /곱셈표/.test(st)) B('표 이름과 셈이 다르다');
    if (/\?에 알맞은/.test(st)){ if (!a.q) return B('? 칸 없음'); want = val(a.q[0], a.q[1]); }
    else if ((m = st.match(/색칠한 칸의 수는 (→|↓|↘|↙) 방향/))){ const vec = {'→':[0, 1], '↓':[1, 0], '↘':[1, 1], '↙':[1, -1]}[m[1]], H = a.hi || []; if (H.length < 3) return B('색칠한 칸 셋 미만');
      for (let k = 1; k < H.length; k++) if (H[k][0] - H[k - 1][0] !== vec[0] || H[k][1] - H[k - 1][1] !== vec[1]) return B('색칠한 칸이 말한 방향으로 놓이지 않았다');
      const vs = H.map(([i, j]) => val(i, j)), dl = vs[1] - vs[0]; if (vs.some((x, k) => k && x - vs[k - 1] !== dl)) return B('색칠한 칸 수가 고르게 변하지 않는다'); want = T(dl); }
    else if ((m = st.match(/색칠한 줄의 수는 (→|↓) 방향/))){ let vs; if (m[1] === '→'){ if (a.hrow === undefined) return B('→ 인데 가로줄 색칠 없음'); vs = a.cols.map((_, j) => val(a.hrow, j)); }
      else { if (a.hcol === undefined) return B('↓ 인데 세로줄 색칠 없음'); vs = a.rows.map((_, i) => val(i, a.hcol)); }
      const dl = vs[1] - vs[0]; if (vs.some((x, k) => k && x - vs[k - 1] !== dl)) return B('색칠한 줄 수가 고르게 변하지 않는다'); want = T(dl); }
    else if (/어떤 수인가요/.test(st)){ const all = []; a.rows.forEach((_, i) => a.cols.forEach((_, j) => all.push(val(i, j)))); const ev = all.filter(x => x % 2 === 0).length;
      want = ev === 0 ? '모두 홀수예요' : ev === all.length ? '모두 짝수예요' : '짝수와 홀수가 섞여 있어요'; }
    else return B('발문 꼴: ' + st); }
  else if (ask === 'calr'){ if (!a || a.type !== 'cal') return B('그림이 cal 아님'); const pos = d => [Math.floor((a.start + d - 1) / 7), (a.start + d - 1) % 7];
    const VEC = {'↓':[1, 0], '↘':[1, 1], '↙':[1, -1], '→':[0, 1]};
    if ((m = st.match(/동그라미 친 (\d+)일에서 (↓|↘|↙) 방향으로 한 칸/))){ const b = +m[1], v = VEC[m[2]]; if ((a.hi || [])[0] !== b) B('동그라미 날짜가 발문과 다르다'); if (!a.q) return B('? 날짜 없음');
      const p0 = pos(b), p1 = pos(a.q); if (p1[0] - p0[0] !== v[0] || p1[1] - p0[1] !== v[1]) return B('? 가 말한 방향 한 칸이 아니다'); want = a.q; }
    else if ((m = st.match(/동그라미 친 날짜는 (↓|↘|↙|→) 방향으로/))){ const H = a.hi || [], v = VEC[m[1]]; if (H.length < 3) return B('동그라미 셋 미만');
      for (let k = 1; k < H.length; k++){ const p0 = pos(H[k - 1]), p1 = pos(H[k]); if (p1[0] - p0[0] !== v[0] || p1[1] - p0[1] !== v[1]) return B('동그라미가 말한 방향으로 놓이지 않았다'); }
      if (H.some(x => x < 1 || x > a.days)) B('달력 밖 날짜'); want = `${H[1] - H[0]}씩 커져요`; }
    else if (/같은 요일인 날짜/.test(st)){ const d0 = (a.hi || [])[0]; const L = t => (String(t).match(/\d+/g) || []).map(Number);
      const c = L(cor); if (c[0] !== d0 || c.some(x => x > a.days || pos(x)[1] !== pos(d0)[1]) || c.some((x, k) => k && x - c[k - 1] !== 7)) B('같은 요일 정답이 어긋난다: ' + cor);
      wr.forEach(w => { const x = L(w); if (x.every(y => pos(y)[1] === pos(d0)[1])) B('오답도 같은 요일: ' + w); }); return; }
    else return B('발문 꼴: ' + st); }
  else if (ask === 'grid'){ if (!a || a.type !== 'numgrid' || !a.q) return B('? 있는 numgrid 아님'); const K2 = []; a.rows.forEach((row, i) => row.forEach((x, j) => { if (x !== null) K2.push([i, j, x]); }));
    let di = null, dj = null; for (const p of K2) for (const o of K2){ if (p[1] === o[1] && p[0] !== o[0] && di === null) di = (o[2] - p[2]) / (o[0] - p[0]); if (p[0] === o[0] && p[1] !== o[1] && dj === null) dj = (o[2] - p[2]) / (o[1] - p[1]); }
    if (di === null || dj === null) return B('규칙을 정할 만큼 수가 보이지 않는다'); const v0 = K2[0][2] - K2[0][0] * di - K2[0][1] * dj;
    if (K2.some(([i, j, x]) => v0 + i * di + j * dj !== x)) return B('보이는 수가 한 규칙으로 늘어서지 않는다'); want = v0 + a.q[0] * di + a.q[1] * dj; }
  else return B('ask 를 모른다');
  if (String(strip(cor)) !== String(want)) bad(where, `kr ${ask} 정답 「${cor}」 ≠ 다시 찾은 ${want}`);
  if (wr.some(w => strip(w) === String(want))) bad(where, `kr ${ask} 오답에 정답 ${want} 이 섞였다`);
}
function checkGugu(where, q) {
  const G = (q.variant_rule || {}).gugu; if (!G) return;
  const ask = G.ask || 'cell', a = q.asset && typeof q.asset === 'object' ? q.asset : null, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, '');
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : q.kind === 'ox' ? q.answer : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  let want = null, m;
  if (ask === 'cell') { if (!a || a.type !== 'gugu_table' || !a.q) return bad(where, 'gugu cell 은 ? 칸이 있는 곱셈표'); if (!/곱셈표의 \?에 알맞은 수/.test(st)) bad(where, 'gugu cell 발문 꼴: ' + st);
    want = a.q[0] * a.q[1]; if (a.q[1] < 2) bad(where, 'gugu cell ? 칸이 1의 칸(해설 「한 칸 앞에 더하기」가 0을 말한다)'); }
  else if (ask === 'step') { if (!a || a.type !== 'gugu_table' || a.hrow === undefined) return bad(where, 'gugu step 은 색칠한 줄이 있는 곱셈표');
    m = st.match(/색칠한 (\d)단 곱셈구구의 곱은/); if (!m || +m[1] !== a.hrow) return bad(where, 'gugu step 발문의 단이 색칠한 줄과 다르다');
    const c = a.cols; for (let i = 1; i < c.length; i++) if (c[i] !== c[i - 1] + 1) bad(where, 'gugu step 칸 머리가 1씩 이어지지 않는다'); want = a.hrow; }
  else if (ask === 'next') { m = st.match(/^(\d) × (\d)[은는] (\d) × (\d)보다 얼마 더 큰가요/); if (!m) return bad(where, 'gugu next 발문 꼴: ' + st);
    if (+m[1] !== +m[3] || +m[2] !== +m[4] + 1) bad(where, 'gugu next 두 곱셈식이 한 단·이웃이 아니다'); want = +m[1] * +m[2] - +m[3] * +m[4]; }
  else if (ask === 'build') { m = st.match(/^(\d) × (\d) = (\d+)(?:이에요|예요)\. 이것을 이용하면 (\d) × (\d)[은는] 얼마/); if (!m) return bad(where, 'gugu build 발문 꼴: ' + st);
    if (+m[1] * +m[2] !== +m[3]) bad(where, `gugu build 주어진 식 ${m[1]} × ${m[2]} ≠ ${m[3]}`); if (+m[4] !== +m[1] || +m[5] !== +m[2] + 1) bad(where, 'gugu build 이웃 곱셈식이 아니다'); want = +m[4] * +m[5]; }
  else if (ask === 'miss') { m = st.match(/^(\d|□) × (\d|□) = (\d+)에서 □/); if (!m || (m[1] === '□') === (m[2] === '□')) return bad(where, 'gugu miss 발문 꼴: ' + st);
    const kn = +m[3], kk = m[1] === '□' ? +m[2] : +m[1]; if (kn % kk) return bad(where, 'gugu miss 나누어떨어지지 않는다'); want = kn / kk; if (want < 1 || want > 9) bad(where, 'gugu miss □ 가 한 자리 수가 아니다');
    wr.forEach(w => { if (+w * kk === kn) bad(where, `gugu miss 오답 ${w} 도 맞다`); }); }
  else if (ask === 'cmpx') { m = st.match(/\n(\d) × (\d) ○ (\d) × (\d)$/); if (!m) return bad(where, 'gugu cmpx 발문 꼴: ' + st);
    const p1 = +m[1] * +m[2], p2 = +m[3] * +m[4]; want = p1 > p2 ? '>' : p1 < p2 ? '<' : '=';
    if ((q.options || []).length !== 3 || !['>', '<', '='].every(x => (q.options || []).some(o => o.t === x))) bad(where, 'gugu cmpx 보기는 >·<·= 셋'); }
  else if (ask === 'zero') { const okF = x => /^[01]$/.test(x);
    if (q.kind === 'ox') { m = st.match(/^(\d) × (\d) = (\d+)입니다\.$/); if (!m) return bad(where, 'gugu zero OX 발문 꼴: ' + st); if (!okF(m[1]) && !okF(m[2])) bad(where, 'gugu zero 에 0·1 이 없다');
      if (((+m[1] * +m[2] === +m[3]) ? 'O' : 'X') !== cor) bad(where, `gugu zero OX 답 ${cor} 이 어긋난다`); return; }
    m = st.match(/^(\d) × (\d)[은는] 얼마/); if (!m) return bad(where, 'gugu zero 발문 꼴: ' + st); if (!okF(m[1]) && !okF(m[2])) bad(where, 'gugu zero 에 0·1 이 없다'); want = +m[1] * +m[2]; }
  else if (ask === 'tfind') { m = st.match(/곱이 (\d+)인 것은 모두 몇 개/); if (!m) return bad(where, 'gugu tfind 발문 꼴: ' + st); const T = +m[1]; want = 0;
    for (let x = 1; x <= 9; x++) for (let y = 1; y <= 9; y++) if (x * y === T) want++; }
  else return bad(where, 'gugu ask 를 모른다: ' + ask);
  if (q.kind === 'ox') return;
  if (String(cor) !== String(want)) bad(where, `gugu ${ask} 정답 「${cor}」 ≠ 다시 셈한 ${want}`);
  if (wr.some(w => w === String(want))) bad(where, `gugu ${ask} 오답에 정답 ${want} 이 섞였다`);
  if (ask === 'cell' && a) wr.forEach(w => { if (w === String(a.q[0] * a.q[1])) bad(where, 'gugu cell 오답이 정답'); });
}
/* v2.7 — 곱셈: 그림(mul_groups·times_bars·jump_row)·발문이 말하는 답을 엔진과 따로 다시 센다 */
function checkMul(where, q) {
  const M = (q.variant_rule || {}).mul; if (!M) return;
  const ask = M.ask || 'total', a = q.asset && typeof q.asset === 'object' ? q.asset : null, st = String(q.stem || '').replace(/^이번에는 다른 보기예요\. /, '');
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : q.kind === 'ox' ? q.answer : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const num = x => { const m = String(x).match(/^(\d+)/); return m ? +m[1] : NaN; };
  const prodOf = x => { const m = String(x).match(/^(\d+) × (\d+)$/); return m ? +m[1] * +m[2] : null; };
  let want = null, m;
  const need = (t, f) => { if (!a || a.type !== t) { bad(where, `mul ${ask} 은 ${t} 그림이 있어야`); return false; } return f ? f() : true; };
  const KN = () => { const k = +a.k, n = +a.n; if (!(k >= 1 && n >= 1)) { bad(where, 'mul_groups k·n 없음'); return null; } return [k, n]; };
  const oxSaid = re => { const mm = st.match(re); if (!mm) { bad(where, `mul ${ask} OX 발문 꼴을 모른다: ` + st); return; } return mm; };
  if (ask === 'total') { if (!need('mul_groups') || a.look === 'loose') return bad(where, 'mul total 은 묶음·줄 그림'); const kn = KN(); if (!kn) return; want = kn[0] * kn[1];
    if (!/모두 몇/.test(st)) bad(where, 'mul total 발문에 「모두 몇」이 없다'); }
  else if (ask === 'groups') { if (!need('mul_groups') || a.look !== 'loose') return bad(where, 'mul groups 는 loose 그림');
    m = st.match(/(\d+)\S*씩 묶으면 몇 묶음/); if (!m) return bad(where, 'mul groups 발문 꼴: ' + st); const k = +m[1], T = +a.total;
    if (T % k) return bad(where, `mul groups ${T}개를 ${k}씩 묶으면 남는다`); want = T / k; if (want < 2) bad(where, 'mul groups 묶음이 1개'); }
  else if (ask === 'name' || ask === 'times' || ask === 'expr') { if (!need('mul_groups') || a.look === 'loose') return bad(where, `mul ${ask} 은 묶음·줄 그림`); const kn = KN(); if (!kn) return;
    want = ask === 'name' ? `${kn[0]}씩 ${kn[1]}묶음` : ask === 'times' ? `${kn[0]}의 ${kn[1]}배` : `${kn[0]} × ${kn[1]}`;
    if (ask === 'name' && a.look === 'rows') bad(where, 'mul name 은 묶음 그림(줄 그림은 「몇씩 몇 줄」)');
    if (ask === 'expr') wr.forEach(w => { if (prodOf(w) === kn[0] * kn[1] && /×/.test(w)) bad(where, `mul expr 오답 「${w}」의 곱이 정답과 같다(뒤바꾼 식은 오답으로 쓰지 않는다)`); }); }
  else if (ask === 'skip') { if (!need('jump_row')) return; const cs = a.cells || [], s = +a.step;
    if (cs[cs.length - 1] !== null) return bad(where, 'mul skip 은 마지막 칸이 ?'); m = st.match(/^(\d+)씩 뛰어 세었어요/); if (!m || +m[1] !== s) bad(where, 'mul skip 발문의 수와 step 이 다르다');
    if (cs[0] !== s) bad(where, 'mul skip 첫 칸은 step(0에서 한 번 뛴 수)'); want = Number(cs[cs.length - 2]) + s; }
  else if (ask === 'tval') { if (q.kind === 'ox') { const mm = oxSaid(/^(\d+)의 (\d+)배는 (\d+)입니다\.$/); if (!mm) return; const t = +mm[1] * +mm[2] === +mm[3];
      if ((t ? 'O' : 'X') !== cor) bad(where, `mul tval OX 답 ${cor} — ${mm[1]}의 ${mm[2]}배 = ${+mm[1] * +mm[2]}`); return; }
    m = st.match(/^(\d+)의 (\d+)배는 얼마/); if (!m) return bad(where, 'mul tval 발문 꼴: ' + st); want = +m[1] * +m[2]; if (a) bad(where, 'mul tval 은 그림 없음'); }
  else if (ask === 'regroup') { if (!need('mul_groups') || a.look !== 'loose') return bad(where, 'mul regroup 은 loose 그림');
    m = st.match(/ (\d+)\S+ (\d+)\S*씩 묶으면 (\d+)의 (\d+)배예요\. 같은 \S+ (\d+)\S*씩 묶으면 (\d+)의 몇 배/); if (!m) return bad(where, 'mul regroup 발문 꼴: ' + st);
    const T = +m[1], k1 = +m[2], n1 = +m[4], k2 = +m[5]; if (T !== +a.total) bad(where, 'mul regroup 발문 수와 그림 수가 다르다'); if (+m[3] !== k1 || +m[6] !== k2) bad(where, 'mul regroup 몇의 「몇」이 묶는 수와 다르다');
    if (k1 * n1 !== T) bad(where, `mul regroup ${k1}의 ${n1}배 ≠ ${T}`); if (T % k2) return bad(where, 'mul regroup 두 번째 묶음이 남는다'); if (k1 === k2) bad(where, 'mul regroup 두 묶는 수가 같다'); want = T / k2; }
  else if (ask === 'bars' || ask === 'cmp') { if (!need('times_bars')) return; want = +a.times;
    if (ask === 'cmp') { if (!a.item) bad(where, 'mul cmp 는 그림 줄(item)'); m = st.match(/ (\d+)개, \S+ (\d+)개예요/); if (!m || +m[1] !== +a.base || +m[2] !== +a.base * +a.times) bad(where, 'mul cmp 발문 수가 그림과 다르다'); }
    else { if (a.item) bad(where, 'mul bars 는 색 막대'); if (!!M.grid !== !!a.grid) bad(where, 'mul bars grid 가 규칙과 다르다'); if (want < 2) bad(where, 'mul bars 1배'); } }
  else if (ask === 'add') { m = st.match(/^((?:\d+ \+ )+\d+)(?:[을를] 곱셈식으로| = (\d+) × (\d+)입니다\.$)/); if (!m) return bad(where, 'mul add 발문 꼴: ' + st);
    const ps = m[1].split(' + ').map(Number); if (ps.some(x => x !== ps[0])) return bad(where, 'mul add 같은 수의 덧셈이 아니다'); if (ps.length < 3) bad(where, 'mul add 는 세 번 이상 더한 식');
    if (q.kind === 'ox') { const t = +m[2] === ps[0] && +m[3] === ps.length; if ((t ? 'O' : 'X') !== cor) bad(where, `mul add OX 답 ${cor} — 실제 ${ps[0]} × ${ps.length}`); return; }
    want = `${ps[0]} × ${ps.length}`; wr.forEach(w => { if (w === `${ps.length} × ${ps[0]}`) bad(where, 'mul add 오답에 뒤바꾼 식'); }); }
  else if (ask === 'value' || ask === 'prod') { if (q.kind === 'ox') { const mm = oxSaid(/^(\d+) × (\d+) = (\d+)입니다\.$/); if (!mm) return;
      if (((+mm[1] * +mm[2] === +mm[3]) ? 'O' : 'X') !== cor) bad(where, `mul value OX 답 ${cor} 이 어긋난다`); return; }
    m = ask === 'prod' ? st.match(/^(\d+)[와과] (\d+)의 곱은 얼마/) : st.match(/^(\d+) × (\d+)[은는] 얼마/); if (!m) return bad(where, `mul ${ask} 발문 꼴: ` + st); want = +m[1] * +m[2]; }
  else if (ask === 'read') { m = st.match(/^(\d+) × (\d+)[을를] 바르게 읽은/); if (!m) return bad(where, 'mul read 발문 꼴: ' + st); want = `${m[1]} 곱하기 ${m[2]}`; }
  else if (ask === 'story' || ask === 'sexpr') { m = st.match(/한 \S+에 \S+ (\d+)\S+씩 있어요\. \S+ (\d+)\S+의 /); if (!m) return bad(where, `mul ${ask} 발문 꼴: ` + st);
    want = ask === 'story' ? +m[1] * +m[2] : `${m[1]} × ${m[2]}`; if (ask === 'sexpr') wr.forEach(w => { if (prodOf(w) === +m[1] * +m[2]) bad(where, `mul sexpr 오답 「${w}」의 곱이 정답과 같다`); }); }
  else if (ask === 'notx') { m = st.match(/^곱이 (\d+)인 곱셈식이 아닌 것/); if (!m) return bad(where, 'mul notx 발문 꼴: ' + st); const T = +m[1];
    if (prodOf(cor) === null || prodOf(cor) === T) bad(where, `mul notx 정답 「${cor}」의 곱이 ${T}`); wr.forEach(w => { if (prodOf(w) !== T) bad(where, `mul notx 오답 「${w}」의 곱이 ${T} 가 아니다`); }); return; }
  else if (ask === 'same') { m = st.match(/^(\d+) × (\d+)[와과] 곱이 같은/); if (!m) return bad(where, 'mul same 발문 꼴: ' + st); const P = +m[1] * +m[2];
    if (prodOf(cor) !== P || cor === `${m[1]} × ${m[2]}`) bad(where, `mul same 정답 「${cor}」`); wr.forEach(w => { const pw = prodOf(w); const sw = (w.match(/^(\d+) \+ (\d+)$/) || []); if (pw === P || (sw.length && +sw[1] + +sw[2] === P)) bad(where, `mul same 오답 「${w}」 값이 ${P}`); }); return; }
  else return bad(where, 'mul ask 를 모른다: ' + ask);
  if (q.kind === 'ox') return;
  const W = String(want);
  if (typeof want === 'number') { const ok = q.kind === 'sa' ? (q.answer || []).map(String).indexOf(W) >= 0 : num(cor) === want && String(cor).replace(/^\d+/, '').length <= 3;
    if (!ok) bad(where, `mul ${ask} 정답 ${cor} ≠ 다시 센 ${W}`); wr.forEach(w => { if (num(w) === want) bad(where, `mul ${ask} 오답 「${w}」에 정답 수가 섞였다`); }); }
  else { if (cor !== W) bad(where, `mul ${ask} 정답 「${cor}」 ≠ 「${W}」`); if (wr.indexOf(W) >= 0) bad(where, `mul ${ask} 오답에 정답이 섞였다`); }
}
function checkAr2(where, q) {
  const vr = q.variant_rule || {}; if (!vr.ar2) return;
  const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String(((q.options || []).find(o => o.correct) || {}).t);
  const wr = (q.options || []).filter(o => !o.correct).map(o => String(o.t));
  const st = String(q.stem).replace(/^이번에는 다른 보기예요\. /, ''); const a = q.asset && typeof q.asset === 'object' ? q.asset : null; let want = null, m;
  const sg = c => c === '+' ? '+' : '-';
  const vertOk = (x, s, y) => { if (a && a.type === 'vert2' && (a.top !== x || a.bottom !== y || a.op !== sg(s))) bad(where, `ar2 세로셈 판(${a.top} ${a.op} ${a.bottom})이 발문 식과 다르다`); };
  const carryOf = (x, s, y) => s === '+' ? (x % 10 + y % 10 >= 10 || Math.floor(x / 10) + Math.floor(y / 10) >= 10) : (x % 10 < y % 10);
  if ((m = st.match(/^(\d+) ([+−]) (\d+)(?: ([+−]) (\d+))? = (\d+) 입니다\.$/))) {
    let v = AR_EV(+m[1], sg(m[2]), +m[3]); if (m[4]) v = AR_EV(v, sg(m[4]), +m[5]); vertOk(+m[1], m[2], +m[3]);
    if ((v === +m[6] ? 'O' : 'X') !== q.answer) bad(where, `ar2 OX 답 ${q.answer} — 실제 ${v} 와 ${m[6]}`); return; }
  if ((m = st.match(/^(\d+) ([+−]) (\d+)(?: ([+−]) (\d+))?[은는을를] (?:얼마인가요|세로셈으로 계산하면 얼마|앞에서부터 차례로 계산하면 얼마)/))) {
    let v = AR_EV(+m[1], sg(m[2]), +m[3]); if (m[4]) { const mid = v; if (mid < 0) bad(where, 'ar2 세 수 중간값이 음수'); v = AR_EV(v, sg(m[4]), +m[5]); } else if (!carryOf(+m[1], m[2], +m[3])) bad(where, 'ar2 받아올림·받아내림이 없는 식: ' + st);
    if (v < 0) bad(where, 'ar2 답이 음수'); vertOk(+m[1], m[2], +m[3]); want = String(v); }
  else if ((m = st.match(/^(\d+) ([+−]) (\d+)[을를] 세로셈으로 계산할 때, (십|일)의 자리에서 계산할 식은/))) {
    const x = +m[1], y = +m[3], t1 = Math.floor(x / 10) % 10, o1 = x % 10, t2 = Math.floor(y / 10), o2 = y % 10; vertOk(x, m[2], y);
    if (m[2] === '+') { if (m[4] !== '십' || o1 + o2 < 10) return bad(where, 'ar2 carry 꼴이 어긋난다'); want = `${t1} + ${t2} + 1`; }
    else if (m[4] === '일') { if (o1 >= o2) return bad(where, 'ar2 borrow 인데 받아내림이 없다'); want = `${10 + o1} − ${o2}`; }
    else { if (o1 >= o2 || !t2) return bad(where, 'ar2 btens 꼴이 어긋난다'); want = `${t1 - 1} − ${t2}`; } }
  else if ((m = st.match(/^(\d+) ([+−]) (\d+)[을를] 계산할 때, (\d+)에(서)? 얼마를 (더하|빼)면 (\d+)이 되나요/))) {
    const x = +m[1], tg = +m[7]; if (+m[4] !== x) bad(where, 'ar2 fill 수가 어긋난다'); if (tg % 10) bad(where, 'ar2 fill 목표가 몇십이 아니다');
    if ((m[2] === '+') !== (m[6] === '더하')) bad(where, 'ar2 fill 더하기/빼기가 식과 다르다'); if (Math.abs(tg - x) >= 10 || tg === x) bad(where, 'ar2 fill 목표가 이웃 몇십이 아니다');
    want = String(Math.abs(tg - x)); }
  else if ((m = st.match(/^(\d+) ([+−]) (\d+)[을를] 계산하려고 (\d+)[을를] (\d+)[과와] □로 갈랐어요/))) {
    const x = +m[1], y = +m[3], tg = +m[4], b = +m[5]; if (tg !== (y < 10 ? y : y % 10)) bad(where, 'ar2 split 가르는 수가 더하는/빼는 수의 일의 자리가 아니다');
    if (m[2] === '+' ? (x + b) % 10 : (x - b) % 10) bad(where, `ar2 split ${b} 로 몇십이 되지 않는다`); want = String(tg - b); if (tg - b <= 0) bad(where, 'ar2 split □ 가 0 이하'); }
  else if ((m = st.match(/^([\d□]+) ([+−]) ([\d□]+) = ([\d□]+)에서 □에 알맞은/))) {
    const p = [m[1], m[3], m[4]]; const k = p.indexOf('□'); if (p.filter(x => x === '□').length !== 1) return bad(where, 'ar2 □ 가 하나가 아니다');
    const n = p.map(Number); let v; if (m[2] === '+') v = k === 2 ? n[0] + n[1] : n[2] - n[1 - k]; else v = k === 0 ? n[1] + n[2] : k === 1 ? n[0] - n[2] : n[0] - n[1];
    if (!(v > 0)) bad(where, 'ar2 □ 값이 0 이하'); want = String(v);
    if (a && a.type === 'bar2') { const W = m[2] === '+' ? p[2] : p[0], P = m[2] === '+' ? [p[0], p[1]] : [p[1], p[2]]; const S = x => x === '□' ? null : +x;
      const ws = S(W), ps = P.map(S), ap = (a.parts || []).map(x => x === undefined ? null : x);
      const okP = (ap[0] === ps[0] && ap[1] === ps[1]) || (ap[0] === ps[1] && ap[1] === ps[0]);
      if ((a.whole === undefined ? null : a.whole) !== ws || !okP) bad(where, 'ar2 막대 그림이 식과 다르다'); } }
  else if ((m = st.match(/^덧셈식 (\d+) \+ (\d+) = (\d+)[을를] 뺄셈식으로/)) || (m = st.match(/^뺄셈식 (\d+) − (\d+) = (\d+)[을를] 덧셈식으로/))) {
    const sub = /^덧셈식/.test(st); const fam = sub ? [+m[1], +m[2], +m[3]] : [+m[2], +m[3], +m[1]]; if (fam[0] + fam[1] !== fam[2]) return bad(where, 'ar2 rel 주어진 식이 거짓');
    const good = t => { const e = AR_EQ(t); if (!e || !e.ok) return false; if (sub) return e.s === '−' && e.x === fam[2] && [e.y, e.z].sort().join() === [fam[0], fam[1]].sort().join();
      return e.s === '+' && e.z === fam[2] && [e.x, e.y].sort().join() === [fam[0], fam[1]].sort().join(); };
    if (!good(cor)) bad(where, 'ar2 rel 정답이 같은 식 가족이 아니다: ' + cor); wr.forEach(w => { if (good(w)) bad(where, 'ar2 rel 오답도 맞다: ' + w); }); return; }
  else if ((m = st.match(/^(\d+) − (\d+) = (\d+)[을를] 덧셈으로 확인하는 식/))) {
    if (+m[1] - +m[2] !== +m[3]) return bad(where, 'ar2 verify 뺄셈식이 거짓'); const good = t => { const e = AR_EQ(t); return e && e.ok && e.s === '+' && e.z === +m[1] && [e.x, e.y].sort().join() === [+m[2], +m[3]].sort().join(); };
    if (!good(cor)) bad(where, 'ar2 verify 정답이 틀렸다: ' + cor); wr.forEach(w => { if (good(w)) bad(where, 'ar2 verify 오답도 맞다: ' + w); }); return; }
  else if ((m = st.match(/^(\d+) ([+−]) (\d+) ([+−]) (\d+)에서 먼저 계산할 것은/))) { want = `${m[1]} ${m[2]} ${m[3]}`; }
  else if (/로 하여 식을 바르게 나타낸/.test(st)) {
    const ns = (st.match(/(\d+)(?=개|장|자루)/g) || []).map(Number); if (ns.length !== 2) return bad(where, 'ar2 boxmake 수가 둘이 아니다');
    let truth; if (/더 받았더니/.test(st)) truth = ns[1] - ns[0]; else if (/주었더니/.test(st)) truth = ns[0] + ns[1]; else return bad(where, 'ar2 boxmake 이야기 꼴을 모른다');
    const solve = t => { const z = String(t).match(/^([\d□]+) ([+−]) ([\d□]+) = ([\d□]+)$/); if (!z) return null; const p = [z[1], z[3], z[4]]; const k = p.indexOf('□'); if (k < 0) return null; const n = p.map(Number);
      const v = z[2] === '+' ? (k === 2 ? n[0] + n[1] : n[2] - n[1 - k]) : (k === 0 ? n[1] + n[2] : k === 1 ? n[0] - n[2] : n[0] - n[1]); return v; };
    const nums = t => (String(t).match(/\d+/g) || []).map(Number).sort().join();
    if (solve(cor) !== truth || nums(cor) !== ns.slice().sort().join()) bad(where, 'ar2 boxmake 정답 식이 이야기와 맞지 않는다: ' + cor);
    wr.forEach(w => { if (solve(w) === truth && nums(w) === ns.slice().sort().join()) bad(where, 'ar2 boxmake 오답도 맞다: ' + w); }); return; }
  else if (/(개|장|자루)/.test(st) && /(모두 몇|남은 .*몇|더 많이 모았나요)/.test(st)) {
    const ns = (st.match(/(\d+)(?=개|장|자루)/g) || []).map(Number); if (ns.length !== 2) return bad(where, 'ar2 story 수가 둘이 아니다');
    if (/모두 몇/.test(st)) want = String(ns[0] + ns[1]); else { if (ns[0] <= ns[1]) bad(where, 'ar2 story 큰 수에서 빼지 않는다'); want = String(ns[0] - ns[1]); }
    if (!carryOf(ns[0], /모두 몇/.test(st) ? '+' : '−', ns[1])) bad(where, 'ar2 story 받아올림·받아내림이 없다'); }
  else return bad(where, 'ar2 발문 꼴을 모른다: ' + st);
  if (q.kind === 'sa') { if ((q.answer || []).map(String).indexOf(String(want)) < 0) bad(where, `ar2 단답 ${q.answer} ≠ 다시 계산한 ${want}`); }
  else if (String(want) !== cor) bad(where, `ar2 정답 ${cor} ≠ 다시 계산한 ${want}`);
  if (wr.indexOf(String(want)) >= 0) bad(where, `ar2 오답 보기에 정답 ${want} 가 섞였다`);
}
/* v2.3 — 여러 가지 도형: 꼭짓점·열림·굽음으로 도형을 다시 가르고, 칠교·자른 도형·쌓기나무 답을 엔진과 따로 셈 (원본·변형 모두) */
const SHP_NM = {tri:'삼각형', quad:'사각형', circle:'원'}, SHP_OF = {'삼각형':'tri', '사각형':'quad', '원':'circle'};
const corners = pts => { const n = pts.length; let c = 0; for (let i = 0; i < n; i++){ const a = pts[(i + n - 1) % n], b = pts[i], d = pts[(i + 1) % n];
  if ((b[0] - a[0]) * (d[1] - b[1]) - (b[1] - a[1]) * (d[0] - b[0]) !== 0) c++; } return c; };
const polyArea = pts => Math.abs(pts.reduce((t, p, i) => { const q2 = pts[(i + 1) % pts.length]; return t + p[0] * q2[1] - q2[0] * p[1]; }, 0)) / 2;
function figClass(f){
  if (!f) return null; if (f.c) return 'circle'; if (f.e) return f.e[0] === f.e[1] ? 'circle' : 'other'; if (f.semi || f.open || f.bend !== undefined) return 'other';
  const c = corners(f.p); return c === 3 ? 'tri' : c === 4 ? 'quad' : 'other'; }
const pieceClass = pc => { const c = corners(pc.p); return c === 3 ? 'tri' : c === 4 ? 'quad' : 'other'; };
function hullArea(P){ const pts = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = []; pts.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
  pts.slice().reverse().forEach(p => { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); });
  return polyArea(lo.slice(0, -1).concat(up.slice(0, -1))); }
/* 쌓기나무 — 받침·겹침 + 그림에서 보이는 몫(래스터로 칠해 본다): 종이에선 돌려 볼 수 없으니 다 가려진 쌓기나무가 있으면 안 된다 */
function cubeVis(cells){
  const ord = ENG.cubeOrder(cells); const polys = []; ord.forEach(({c, i}) => { const F = ENG.cubeFaces(c[0], c[1], c[2]); ['left', 'front', 'top'].forEach(k => polys.push([F[k], i])); });
  const all = [].concat(...polys.map(p => p[0])); const mnx = Math.min(...all.map(p => p[0])), mxx = Math.max(...all.map(p => p[0])), mny = Math.min(...all.map(p => p[1])), mxy = Math.max(...all.map(p => p[1]));
  const inside = (pt, poly) => { let o = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){ const a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) o = !o; } return o; };
  const own = {}, tot = {}; const h = 0.04;
  for (let x = mnx + h / 2; x < mxx; x += h) for (let y = mny + h / 2; y < mxy; y += h){ let who = -1; polys.forEach(([pp, i]) => { if (inside([x, y], pp)){ who = i; tot[i] = (tot[i] || 0) + 1; } }); if (who >= 0) own[who] = (own[who] || 0) + 1; }
  /* tot 는 겹칠 때 여러 번 셀 수 있어 면 셋의 넓이 합으로 다시 잡는다 */
  return cells.map((c, i) => { const F = ENG.cubeFaces(c[0], c[1], c[2]); const area = ['left', 'front', 'top'].reduce((t, k) => t + polyArea(F[k]), 0); return (own[i] || 0) * h * h / area; });
}
function checkCubeCells(where, cells){
  if (!Array.isArray(cells) || !cells.length) return bad(where, 'cubes 칸이 비었다');
  const key = c => c.slice(0, 3).join(','); const S = new Set(cells.map(key)); if (S.size !== cells.length) bad(where, 'cubes 같은 자리에 쌓기나무가 둘');
  cells.forEach(c => { if (c.slice(0, 3).some(v => !Number.isInteger(v) || v < 0 || v > 5)) bad(where, 'cubes 좌표는 0~5 정수: ' + c);
    if (c[3] !== undefined && c[3] !== 0 && ['r', 'y', 'b', 'g'].indexOf(c[3]) < 0) bad(where, 'cubes 색은 r·y·b·g·0: ' + c[3]);
    if (c[2] > 0 && !S.has([c[0], c[1], c[2] - 1].join(','))) bad(where, 'cubes 공중에 뜬 쌓기나무: ' + c); });
  const vis = cubeVis(cells); vis.forEach((v, i) => { if (v < 0.2) bad(where, `cubes ${cells[i]} 가 그림에서 거의 가려진다(${Math.round(v * 100)}%) — 종이에선 셀 수 없다`); });
  const cols = cells.map(c => c[3]).filter(x => x && x !== 0); if (new Set(cols).size !== cols.length) bad(where, 'cubes 같은 색이 둘 — 색으로 가리킬 수 없다');
}
function checkShape(where, q){
  const vr = q.variant_rule || {}; const key = ['fig', 'fnum', 'tan', 'cut', 'cube'].find(k => vr[k]); if (!key) return;
  const opts = q.options || []; const cor = q.kind === 'sa' ? String((q.answer || [])[0]) : String((opts.find(o => o.correct) || {}).t);
  const wr = opts.filter(o => !o.correct).map(o => String(o.t)); const st = String(q.stem).replace(/^이번에는 다른 보기예요\. /, '');
  const a = q.asset && typeof q.asset === 'object' ? q.asset : null; let want = null, m;
  if (key === 'fig' || (key === 'fnum' && a)){
    if (!a || a.type !== 'figs') return bad(where, key + ' 는 figs 그림이 있어야 한다');
    const cls = a.items.map(k => figClass(ENG.FIG[k]));
    if ((m = st.match(/^(삼각형|사각형|원)은 어느 것인가요/))){ const t = SHP_OF[m[1]]; const hits = cls.map((c, i) => c === t ? i : -1).filter(i => i >= 0);
      if (hits.length !== 1) return bad(where, `fig which 에 ${m[1]}이 ${hits.length}개`); want = '㉮㉯㉰㉱㉲㉳'[hits[0]];
      if (opts.length !== a.items.length) bad(where, 'fig which 보기 수와 그림 수가 다르다'); }
    else if ((m = st.match(/^(삼각형|사각형|원)이 아닌 것은 어느 것인가요/))){ const t = SHP_OF[m[1]]; const hits = cls.map((c, i) => c !== t ? i : -1).filter(i => i >= 0);
      if (hits.length !== 1) return bad(where, `fig not 에 ${m[1]} 아닌 것이 ${hits.length}개`); want = '㉮㉯㉰㉱㉲㉳'[hits[0]]; }
    else if ((m = st.match(/^그림에서 (삼각형|사각형|원)은 모두 몇 개/))) want = String(cls.filter(c => c === SHP_OF[m[1]]).length);
    else if ((m = st.match(/^이 도형의 (변|꼭짓점)은 모두 몇 개/))){ if (a.items.length !== 1) return bad(where, 'fnum 그림은 도형 하나'); want = cls[0] === 'tri' ? '3' : cls[0] === 'quad' ? '4' : null; if (!want) return bad(where, 'fnum 도형이 삼각형·사각형이 아니다'); }
    else return bad(where, key + ' 발문 꼴을 모른다: ' + st);
  } else if (key === 'fnum'){
    if (!(m = st.match(/^삼각형 (\d)개와 사각형 (\d)개가 있어요\. (변|꼭짓점)은 모두 몇 개/))) return bad(where, 'fnum 발문 꼴을 모른다: ' + st);
    want = String(3 * m[1] + 4 * m[2]);
  } else if (key === 'tan' || key === 'cut'){
    if (!a || a.type !== 'tiles') return bad(where, key + ' 는 tiles 그림이 있어야 한다');
    if ((m = st.match(/^([①②③④⑤⑥⑦])번 조각은 어떤 도형인가요/))){ const pc = a.pieces.find(p => p.n === m[1]); if (!pc) return bad(where, 'tan 조각 번호가 그림에 없다'); want = SHP_NM[pieceClass(pc)]; }
    else if ((m = st.match(/^색칠한 조각 가운데 (삼각형|사각형)은 모두 몇 개/))){ const hi = a.pieces.filter(p => p.hi); if (!hi.length) return bad(where, 'tan 색칠한 조각이 없다'); want = String(hi.filter(p => pieceClass(p) === SHP_OF[m[1]]).length); }
    else if ((m = st.match(/^선을 따라 모두 자르면 (삼각형|사각형)은 몇 개 생기나요/))){ if (!a.cut) bad(where, 'cut 그림에 cut:true 가 없다');
      const sum = a.pieces.reduce((t, p) => t + polyArea(p.p), 0), hull = hullArea([].concat(...a.pieces.map(p => p.p))); if (Math.abs(sum - hull) > 1e-9) bad(where, `cut 조각 넓이 합 ${sum} ≠ 전체 ${hull} — 조각이 겹치거나 빈다`);
      want = String(a.pieces.filter(p => pieceClass(p) === SHP_OF[m[1]]).length); }
    else return bad(where, key + ' 발문 꼴을 모른다: ' + st);
    if (key === 'tan'){ const T7 = ENG.TAN7; if (a.pieces.length !== 7 || a.pieces.some((p, i) => JSON.stringify(p.p) !== JSON.stringify(T7[i].p))) bad(where, 'tan 그림이 칠교판 7조각과 다르다'); }
  } else {
    if (!a || a.type !== 'cubes' || !a.cells) return bad(where, 'cube 는 cubes(cells) 그림이 있어야 한다'); const C = a.cells;
    const CN = {r:'빨간색', y:'노란색', b:'파란색', g:'초록색'}, NC = {'빨간색':'r', '노란색':'y', '파란색':'b', '초록색':'g'};
    const D = {'오른쪽':[1,0,0], '왼쪽':[-1,0,0], '앞':[0,-1,0], '뒤':[0,1,0], '위':[0,0,1], '아래':[0,0,-1]};
    if (/^쌓기나무는 모두 몇 개/.test(st)) want = String(C.length);
    else if (/^몇 층으로 쌓은 모양/.test(st)) want = (1 + Math.max(...C.map(c => c[2]))) + '층';
    else if (/^1층에 놓인 쌓기나무는 몇 개/.test(st)) want = String(C.filter(c => c[2] === 0).length);
    else if ((m = st.match(/^빨간색 쌓기나무의 (오른쪽|왼쪽|앞|뒤|위)에 있는 쌓기나무는 무슨 색/))){ const red = C.find(c => c[3] === 'r'); if (!red) return bad(where, 'cube 빨간색이 없다'); const d = D[m[1]];
      const nb = C.find(c => c[0] === red[0] + d[0] && c[1] === red[1] + d[1] && c[2] === red[2] + d[2]); if (!nb || !CN[nb[3]]) return bad(where, `cube 빨간색 ${m[1]}에 색 쌓기나무가 없다`); want = CN[nb[3]]; }
    else if ((m = st.match(/^(노란색|파란색|초록색) 쌓기나무는 빨간색 쌓기나무의 어느 쪽/))){ const red = C.find(c => c[3] === 'r'), x = C.find(c => c[3] === NC[m[1]]); if (!red || !x) return bad(where, 'cube 가리킨 색이 그림에 없다');
      const dd = [x[0] - red[0], x[1] - red[1], x[2] - red[2]].join(','); want = Object.keys(D).find(k => D[k].join(',') === dd) || null; if (!want) return bad(where, 'cube 두 쌓기나무가 맞닿아 있지 않다'); }
    else return bad(where, 'cube 발문 꼴을 모른다: ' + st);
  }
  const okSa = q.kind === 'sa' && (q.answer || []).map(String).some(x => x === want || x === want + '개');
  if (String(want) !== cor && !okSa) bad(where, `${key} 정답 ${cor} ≠ 다시 계산한 ${want}`);
  if (wr.indexOf(String(want)) >= 0) bad(where, `${key} 오답 보기에 정답 ${want} 가 섞였다`);
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

  if (q.mis !== undefined && !MIS.has(q.mis)) bad(where, '문항 기본 오개념(mis) 사전에 없는 코드 ' + q.mis);
  /* 선긋기·OX 의 「O/X 자체 오답」은 보기가 없어 오개념을 못 단다 — 새 단원(국어부터)은 문항에 mis 를 직접 단다 */
  if (!opt.variant && (q.kind === 'match' || q.kind === 'ox') && !q.mis && opt.requireMis) bad(where, q.kind + ' 문항에 기본 오개념(mis) 없음 — 틀렸을 때 리포트가 읽을 코드가 없다');
  checkAsset(where, q.asset);
  checkCmp4(where, q);
  checkNum50(where, q);
  check3(where, q);
  check4(where, q);
  checkAr2(where, q);
  checkCm(where, q);
  checkCls(where, q);
  checkMul(where, q);
  checkGugu(where, q);
  checkKr(where, q);
  checkFd(where, q);
  checkSp(where, q);
  checkMcm(where, q);
  checkTm(where, q);
  checkTg(where, q);
  checkShape(where, q);
  checkJamo(where, q);
  checkBat(where, q);
  checkTwin(where, q);
  checkWcat(where, q);
  checkWlink(where, q);
  checkGrid(where, q);
  checkYeon(where, q);
  checkGreet(where, q);
  checkPunct(where, q);
  checkColloc(where, q);
  checkJosa(where, q);
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
      else if (q.answer.every(a => /^\d+$/.test(String(a))) && q.answer.some(a => String(a).length > 4)) bad(where, '숫자 단답 정답이 네 자리를 넘는다(숫자판은 네 자리까지)');
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
  const requireMis = d.subject !== 'math';   /* 수학 옛 세트는 엔진 misFor 폴백으로, 국어부터는 명시 */
  d.questions.forEach(q => {
    const where = `${name} #${q.seq}`;
    checkQ(where, q, { requireMis });
    /* v0.9 alt 갈래 — 조각 하나하나가 문항 규격을 지키는지, 원본과 정말 다른지 */
    if (q.variant_rule && q.variant_rule.alt !== undefined) {
      const alts = q.variant_rule.alt;
      if (!Array.isArray(alts) || !alts.length) bad(where, 'alt 가 비었다');
      else alts.forEach((pc, i) => {
        if (!pc || typeof pc !== 'object') return bad(where, `alt[${i}] 가 객체가 아님`);
        const ok = ['stem', 'asset', 'options', 'answer', 'pairs', 'reason_options', 'explanation', 'answer_guide', 'kind'];
        Object.keys(pc).forEach(k => { if (ok.indexOf(k) < 0) bad(where, `alt[${i}] 에 모르는 칸 ${k}`); });
        if (!pc.stem) bad(where, `alt[${i}] 에 stem 없음 — 다른 문제여야 한다`);
        const kind = pc.kind || q.kind;
        if (kind === 'sa' && !pc.answer && !q.answer) bad(where, `alt[${i}] 단답에 answer 없음`);
        if (kind === 'sa' && Array.isArray(pc.answer) && pc.answer.every(a => /^\d+$/.test(String(a))) && pc.answer.some(a => String(a).length > 4)) bad(where, `alt[${i}] 숫자 단답 정답이 네 자리를 넘는다`);
        if ((kind === 'mc' || kind === 'blank' || kind === 'error') && !pc.options) bad(where, `alt[${i}] 객관식에 options 없음 — 발문이 바뀌면 보기도 함께`);
        if (kind === 'ox' && (!pc.answer || !pc.reason_options)) bad(where, `alt[${i}] OX 에 answer·reason_options 없음`);
        if (kind === 'match' && !pc.pairs) bad(where, `alt[${i}] 선긋기에 pairs 없음`);
        if (!pc.explanation) bad(where, `alt[${i}] 에 해설 없음 — 다른 문제엔 다른 해설`);
      });
    }

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
    /* v0.6 갈래 — 그림은 갈래가 고쳐 주는 종류만 허용(그 밖의 그림은 변형 뒤 수와 어긋난다) */
    const at = q.asset && typeof q.asset === 'object' ? q.asset.type : null;
    if (q.variant_rule.ar2 && at && ['vert2', 'bar2'].indexOf(at) < 0) bad(where, 'ar2 변형은 그림 없음·vert2·bar2 만');
    if (q.variant_rule.ar2 && at === 'bar2' && q.variant_rule.ar2.ask !== 'box') bad(where, 'ar2 bar2 그림은 box 문항만');
    if (q.variant_rule.counton && at !== 'count_on') bad(where, 'counton 변형은 count_on 그림이 있어야 한다');
    if (q.variant_rule.maketen2 && at && ['split_tree', 'ten_frames2'].indexOf(at) < 0) bad(where, 'maketen2 변형은 그림 없음·split_tree·ten_frames2 만');
    if (q.variant_rule.takeaway && at && ['split_tree', 'ten_frames2', 'compare_groups'].indexOf(at) < 0) bad(where, 'takeaway 변형은 그림 없음·split_tree·ten_frames2·compare_groups 만');
    if (q.variant_rule.takeaway && q.variant_rule.takeaway.ask === 'more' && at !== 'compare_groups') bad(where, "takeaway ask:'more' 는 compare_groups 그림이 있어야 한다");
    if (q.variant_rule.pattern && at && at !== 'expr_grid') bad(where, 'pattern 변형은 그림 없음·expr_grid 만');
    /* v0.7 갈래 */
    if (q.variant_rule.repeat && at !== 'pattern_row') bad(where, 'repeat 변형은 pattern_row 그림이 있어야 한다');
    if (q.variant_rule.numrule && at && at !== 'number_line') bad(where, 'numrule 변형은 그림 없음·number_line 만');
    if (q.variant_rule.chartrule && at !== 'hundred_chart') bad(where, 'chartrule 변형은 hundred_chart 그림이 있어야 한다');
    if (q.variant_rule.twodigit && at && ['vert', 'bundle_pair', 'compare_groups'].indexOf(at) < 0) bad(where, 'twodigit 변형은 그림 없음·vert·bundle_pair·compare_groups 만');
    if (q.variant_rule.twodigit && (q.variant_rule.twodigit.ask === 'story' || q.variant_rule.twodigit.ask === 'expr') && at && at !== 'compare_groups') bad(where, "twodigit ask:'story'|'expr' 는 그림 없음·compare_groups 만");
    /* v1.1 갈래 — 입체 모양 */
    if (q.variant_rule.solids && at !== 'solid_row') bad(where, 'solids 변형은 solid_row 그림이 있어야 한다');
    if (q.variant_rule.solidart && at !== 'solid_art') bad(where, 'solidart 변형은 solid_art 그림이 있어야 한다');
    if (q.variant_rule.trait && at) bad(where, 'trait 변형은 그림 없는 문항 전용(설명 글만 바꾼다)');
    /* v1.2 갈래 — 9까지 덧셈·뺄셈 */
    if (q.variant_rule.addsub) {
      const AS = q.variant_rule.addsub;
      if (at && ['group_row', 'take_row', 'compare_groups'].indexOf(at) < 0) bad(where, 'addsub 변형은 그림 없음·group_row(두 무리)·take_row·compare_groups 만');
      if (at === 'group_row' && (q.asset.groups || []).length !== 2) bad(where, 'addsub 의 group_row 는 두 무리여야 한다');
      if (at === 'compare_groups' && (q.asset.rows || []).length !== 2) bad(where, 'addsub 의 compare_groups 는 두 줄이어야 한다');
      if ((AS.ask === 'missing' || AS.ask === 'story') && at) bad(where, "addsub ask:'missing'|'story' 는 그림 없는 문항 전용");
      if (AS.ask === 'expr' && q.kind !== 'mc') bad(where, "addsub ask:'expr' 는 mc 만");
      if (q.kind === 'ox' && !(q.reason_options || []).some(o => !o.correct && o.mis)) bad(where, 'addsub OX 는 오답 까닭에 mis 가 있어야 변형이 물려받는다');
    }
    if ((q.variant_rule.solids || q.variant_rule.trait) && q.kind === 'ox' && !(q.reason_options || []).some(o => !o.correct && o.mis)) bad(where, 'solids·trait OX 는 오답 까닭에 mis 가 있어야 변형이 물려받는다');
    /* v1.3 갈래 — 비교하기 */
    if (q.variant_rule.cmp4) {
      if (['len_bars', 'balance', 'area_shapes', 'cups'].indexOf(at) < 0) bad(where, 'cmp4 변형은 len_bars·balance·area_shapes·cups 그림이 있어야 한다');
      const C4 = q.variant_rule.cmp4;
      if (C4.ask !== undefined && ['most', 'least', 'mid'].indexOf(C4.ask) < 0) bad(where, "cmp4 ask 는 most·least·mid");
      if (C4.by !== undefined && ['cap', 'fill'].indexOf(C4.by) < 0) bad(where, "cmp4 by 는 cap·fill(그릇만)");
      if (at === 'cups' && C4.ask && !C4.by) bad(where, 'cups 의 cmp4 ask 는 by(cap 담을 수 있는 양 | fill 담긴 양)를 밝혀야 한다');
    }
    /* v1.4 갈래 — 50까지의 수 */
    if (q.variant_rule.read2 && at) bad(where, 'read2 변형은 그림 없는 문항 전용(읽기 글만 바꾼다)');
    if (q.variant_rule.cmp3 && at) bad(where, 'cmp3 변형은 그림 없는 문항 전용');
    if (q.variant_rule.seq50) {
      const sk = q.variant_rule.seq50.ask || 'plus1';
      if (['plus1', 'minus1', 'between', 'cross_up', 'cross_down', 'down', 'up'].indexOf(sk) < 0) bad(where, 'seq50 ask 를 모른다: ' + sk);
      if ((sk === 'down' || sk === 'up') && at !== 'hundred_chart') bad(where, 'seq50 down|up 은 hundred_chart 그림이 있어야 한다');
      if (!(sk === 'down' || sk === 'up') && at) bad(where, 'seq50 ' + sk + ' 는 그림 없는 문항 전용');
    }
    /* v2.2 갈래 — 세 자리 수 */
    if (q.variant_rule.n3) { const N = q.variant_rule.n3; const ask = N.ask || 'build';
      if (['build', 'read', 'write', 'hund', 'hcount', 'tens', 'tcount'].indexOf(ask) < 0) bad(where, 'n3 ask 를 모른다: ' + ask);
      if (at && !(ask === 'build' && at === 'blocks3')) bad(where, 'n3 그림은 build 의 blocks3 만');
      if (N.carry && at !== 'blocks3') bad(where, 'n3 carry 는 blocks3 그림이 있어야 한다');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'n3 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.pv3) { const ask = q.variant_rule.pv3.ask || 'digit';
      if (['digit', 'value', 'expand', 'which', 'table'].indexOf(ask) < 0) bad(where, 'pv3 ask 를 모른다: ' + ask);
      if (ask === 'table' ? at !== 'place_table' : at) bad(where, 'pv3 ' + ask + ' 그림 종류가 맞지 않다(table 만 place_table)');
      if ((ask === 'expand' || ask === 'which') && q.kind === 'sa') bad(where, 'pv3 ' + ask + ' 는 보기 문항만');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'pv3 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.skip3) { const K = q.variant_rule.skip3;
      if (at !== 'jump_row') bad(where, 'skip3 은 jump_row 그림이 있어야 한다');
      if (['next', 'blank', 'step'].indexOf(K.ask || 'next') < 0) bad(where, 'skip3 ask 를 모른다');
      [].concat(K.step || []).forEach(x => { if ([1, 10, 100].indexOf(x) < 0) bad(where, 'skip3 step 은 1·10·100'); });
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'skip3 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.cmp3d) { const ask = q.variant_rule.cmp3d.ask || 'big';
      if (['big', 'small', 'sign', 'max3', 'min3'].indexOf(ask) < 0) bad(where, 'cmp3d ask 를 모른다: ' + ask);
      if (at) bad(where, 'cmp3d 는 그림 없는 문항 전용'); if (ask === 'sign' && q.kind !== 'mc') bad(where, 'cmp3d sign 은 mc 만');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'cmp3d 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.cards3) { if (at) bad(where, 'cards3 는 그림 없는 문항 전용'); if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'cards3 변형은 mc·blank·sa 만'); }
    /* v2.8 갈래 — 네 자리 수 */
    if (q.variant_rule.n4) { const N = q.variant_rule.n4; const ask = N.ask || 'build';
      if (['build', 'read', 'write', 'thou', 'tcount', 'hund', 'hcount'].indexOf(ask) < 0) bad(where, 'n4 ask 를 모른다: ' + ask);
      if (at && !(ask === 'build' && at === 'blocks4')) bad(where, 'n4 그림은 build 의 blocks4 만');
      if (N.carry && at !== 'blocks4') bad(where, 'n4 carry 는 blocks4 그림이 있어야 한다');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'n4 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.pv4) { const P = q.variant_rule.pv4; const ask = P.ask || 'digit';
      if (['digit', 'value', 'expand', 'which', 'table'].indexOf(ask) < 0) bad(where, 'pv4 ask 를 모른다: ' + ask);
      if (ask === 'table' ? at !== 'place_table' : at) bad(where, 'pv4 ' + ask + ' 그림 종류가 맞지 않다(table 만 place_table)');
      if (P.zero && (ask !== 'digit' || P.place === 'th' || !P.place)) bad(where, 'pv4 zero 는 digit 의 백·십·일 자리만');
      if ((ask === 'expand' || ask === 'which') && q.kind === 'sa') bad(where, 'pv4 ' + ask + ' 는 보기 문항만');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'pv4 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.skip4) { const K = q.variant_rule.skip4;
      if (at !== 'jump_row') bad(where, 'skip4 는 jump_row 그림이 있어야 한다');
      if (['next', 'blank', 'step'].indexOf(K.ask || 'next') < 0) bad(where, 'skip4 ask 를 모른다');
      [].concat(K.step || []).forEach(x => { if ([1, 10, 100, 1000].indexOf(x) < 0) bad(where, 'skip4 step 은 1·10·100·1000'); });
      if (K.cross && [].concat(K.step || []).indexOf(1000) >= 0) bad(where, 'skip4 cross 에 1000씩은 못 쓴다(10000 은 범위 밖)');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'skip4 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.cmp4d) { const ask = q.variant_rule.cmp4d.ask || 'big';
      if (['big', 'small', 'sign', 'max3', 'min3'].indexOf(ask) < 0) bad(where, 'cmp4d ask 를 모른다: ' + ask);
      if (['th', 'thh', 'thht', 'none', undefined].indexOf(q.variant_rule.cmp4d.same) < 0) bad(where, 'cmp4d same 은 th·thh·thht·none');
      if (at) bad(where, 'cmp4d 는 그림 없는 문항 전용'); if (ask === 'sign' && q.kind !== 'mc') bad(where, 'cmp4d sign 은 mc 만');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'cmp4d 변형은 mc·blank·sa 만'); }
    if (q.variant_rule.cards4) { if (at) bad(where, 'cards4 는 그림 없는 문항 전용'); if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'cards4 변형은 mc·blank·sa 만'); }
    /* v2.3 갈래 — 여러 가지 도형 */
    if (q.variant_rule.fig) { const F = q.variant_rule.fig; if (['which', 'not', 'count'].indexOf(F.ask || 'which') < 0) bad(where, 'fig ask 를 모른다');
      if (['tri', 'quad', 'circle'].indexOf(F.target || 'tri') < 0) bad(where, 'fig target 은 tri·quad·circle'); if (at !== 'figs') bad(where, 'fig 는 figs 그림이 있어야 한다');
      Object.keys(F.mis || {}).forEach(k => { if (['open', 'curve', 'near', 'ellipse', 'atyp'].indexOf(k) < 0) bad(where, 'fig mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + F.mis[k])) bad(where, `fig mis.${k} 꼬리가 사전에 없다`); });
      if ((F.ask || 'which') === 'not' && !(F.mis || {}).atyp) bad(where, 'fig not 은 mis.atyp 가 있어야');
      if ((F.ask || 'which') !== 'count' && ['mc', 'blank'].indexOf(q.kind) < 0) bad(where, 'fig which·not 은 mc·blank 만'); }
    if (q.variant_rule.fnum) { const F = q.variant_rule.fnum; const ask = F.ask || 'side'; if (['side', 'vertex', 'sum'].indexOf(ask) < 0) bad(where, 'fnum ask 를 모른다');
      if (ask === 'sum' ? at : at !== 'figs') bad(where, 'fnum 그림 종류가 맞지 않다(sum 은 그림 없음, 나머지는 figs)'); if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'fnum 은 mc·blank·sa 만'); }
    if (q.variant_rule.tan) { const T = q.variant_rule.tan; if (['kind', 'hicount'].indexOf(T.ask || 'kind') < 0) bad(where, 'tan ask 를 모른다'); if (at !== 'tiles') bad(where, 'tan 은 tiles 그림이 있어야');
      if ((T.ask || 'kind') === 'kind' && q.kind !== 'mc') bad(where, 'tan kind 는 mc 만'); if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'tan 은 mc·blank·sa 만'); }
    if (q.variant_rule.cut) { if (at !== 'tiles') bad(where, 'cut 은 tiles 그림이 있어야'); if (['tri', 'quad'].indexOf(q.variant_rule.cut.target || 'tri') < 0) bad(where, 'cut target 은 tri·quad'); if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'cut 은 mc·blank·sa 만'); }
    if (q.variant_rule.cube) { const K = q.variant_rule.cube; const ask = K.ask || 'count'; if (['count', 'layer', 'floor', 'color', 'dir'].indexOf(ask) < 0) bad(where, 'cube ask 를 모른다');
      if (at !== 'cubes' || (q.asset && q.asset.rows)) bad(where, 'cube 는 cubes(cells) 그림이 있어야'); if ((ask === 'layer' || ask === 'color' || ask === 'dir') && q.kind !== 'mc') bad(where, 'cube ' + ask + ' 는 mc 만');
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'cube 는 mc·blank·sa 만');
      Object.keys(K.mis || {}).forEach(k => { if (['count', 'layer', 'lr', 'fb'].indexOf(k) < 0) bad(where, 'cube mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + K.mis[k])) bad(where, `cube mis.${k} 꼬리가 사전에 없다`); }); }
    /* v2.9 갈래 — 곱셈구구 */
    if (q.variant_rule.gugu) { const G = q.variant_rule.gugu, ask = G.ask || 'cell';
      if (['cell', 'step', 'next', 'build', 'miss', 'cmpx', 'zero', 'tfind'].indexOf(ask) < 0) bad(where, 'gugu ask 를 모른다: ' + ask);
      if (['cell', 'step'].indexOf(ask) >= 0 ? at !== 'gugu_table' : at) bad(where, `gugu ${ask} 그림 종류가 맞지 않다(${['cell', 'step'].indexOf(ask) >= 0 ? 'gugu_table' : '그림 없음'})`);
      if (q.kind === 'ox' && ask !== 'zero') bad(where, 'gugu OX 는 zero 만');
      if (ask === 'cmpx' && q.kind !== 'mc') bad(where, 'gugu cmpx 는 mc 만');
      (G.ks || []).forEach(x => { if (!(Number.isInteger(x) && x >= 1 && x <= 9)) bad(where, 'gugu ks 는 1~9'); });
      if (['mc', 'blank', 'sa', 'ox'].indexOf(q.kind) < 0) bad(where, 'gugu 변형은 mc·blank·sa·ox 만'); }
    /* v2.7 갈래 — 곱셈 */
    if (q.variant_rule.mul) { const M = q.variant_rule.mul, ask = M.ask || 'total';
      const PIC = {total:'mul_groups', groups:'mul_groups', name:'mul_groups', times:'mul_groups', expr:'mul_groups', regroup:'mul_groups', skip:'jump_row', bars:'times_bars', cmp:'times_bars'};
      if (['total', 'groups', 'name', 'skip', 'times', 'tval', 'regroup', 'bars', 'cmp', 'expr', 'add', 'value', 'prod', 'read', 'story', 'sexpr', 'notx', 'same'].indexOf(ask) < 0) bad(where, 'mul ask 를 모른다: ' + ask);
      if (PIC[ask] ? at !== PIC[ask] : at) bad(where, `mul ${ask} 그림 종류가 맞지 않다(${PIC[ask] || '그림 없음'})`);
      if (q.kind === 'ox' && ['tval', 'add', 'value'].indexOf(ask) < 0) bad(where, 'mul OX 는 tval·add·value 만');
      if (q.kind === 'sa' && ['name', 'times', 'expr', 'add', 'read', 'sexpr', 'notx', 'same'].indexOf(ask) >= 0) bad(where, 'mul ' + ask + ' 는 보기 문항만');
      if (['mc', 'blank', 'sa', 'ox'].indexOf(q.kind) < 0) bad(where, 'mul 변형은 mc·blank·sa·ox 만'); }
    /* v1.5 갈래 — 글자를 만들어요 */
    if (q.variant_rule.jamo) {
      const J = q.variant_rule.jamo; const ask = J.ask || 'build';
      if (['build', 'cons', 'vow', 'place', 'table'].indexOf(ask) < 0) bad(where, 'jamo ask 를 모른다: ' + ask);
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'jamo 변형은 mc·blank·sa 만(보기에 mis_target 을 다는 error·OX 는 엔진이 다루지 않는다)');
      if (ask === 'table' ? at !== 'syl_table' : at !== 'jamo') bad(where, 'jamo ' + ask + ' 변형 그림 종류가 맞지 않다');
      const KEYS = ['flip', 'stroke', 'rot', 'ae', 'comb', 'cons', 'role', 'place', 'grid'];
      Object.keys(J.mis || {}).forEach(k => { if (KEYS.indexOf(k) < 0) bad(where, 'jamo mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + J.mis[k])) bad(where, `jamo mis.${k} 꼬리 ${J.mis[k]} 가 사전에 없다`); });
      (J.cons || []).forEach(x => { if (HC.indexOf(x) < 0) bad(where, 'jamo cons 후보에 자음자 아닌 것 ' + x); });
      (J.vows || []).forEach(x => { if (HV.indexOf(x) < 0) bad(where, 'jamo vows 후보에 모음자 아닌 것 ' + x); });
      if (ask === 'place' && (J.vows || []).some(x => hl(x) === 'mix')) bad(where, 'jamo place 의 vows 후보에 둘러싸는 모음자');
    }
    /* v1.6 갈래 — 받침이 있는 글자 */
    if (q.variant_rule.bat) {
      const R = q.variant_rule.bat; const ask = R.ask || 'add';
      if (['add', 'find', 'has', 'swap', 'word'].indexOf(ask) < 0) bad(where, 'bat ask 를 모른다: ' + ask);
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'bat 변형은 mc·blank·sa 만');
      if (ask === 'has' && q.kind === 'sa') bad(where, 'bat has 는 보기 문항만');
      const want = ask === 'has' ? null : ask === 'word' ? 'bat_word' : 'bat'; if (want ? at !== want : at) bad(where, 'bat ' + ask + ' 변형 그림 종류가 맞지 않다');
      const KEYS = ['drop', 'near', 'side', 'flip', 'cons', 'role', 'vow', 'none', 'keep', 'any'];
      Object.keys(R.mis || {}).forEach(k => { if (KEYS.indexOf(k) < 0) bad(where, 'bat mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + R.mis[k])) bad(where, `bat mis.${k} 꼬리 ${R.mis[k]} 가 사전에 없다`); });
      (R.bats || []).forEach(x => { if (['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅇ','ㅅ'].indexOf(x) < 0) bad(where, 'bat bats 후보는 ㄱㄴㄷㄹㅁㅂㅇㅅ 만: ' + x); });
    }
    /* v1.7 갈래 — 된소리 */
    if (q.variant_rule.twin) {
      const R = q.variant_rule.twin; const ask = R.ask || 'shape';
      if (['shape', 'swap', 'pick', 'word'].indexOf(ask) < 0) bad(where, 'twin ask 를 모른다: ' + ask);
      if (['mc', 'blank', 'sa'].indexOf(q.kind) < 0) bad(where, 'twin 변형은 mc·blank·sa 만');
      if ((ask === 'pick' || ask === 'word') && q.kind === 'sa') bad(where, 'twin ' + ask + ' 는 보기 문항만');
      if (ask === 'word' ? at !== 'scene' : at) bad(where, 'twin ' + ask + ' 변형 그림 종류가 맞지 않다(word 는 scene, 나머지는 그림 없음)');
      const KEYS = ['asp', 'one', 'other', 'keep', 'plain', 'soft'];
      Object.keys(R.mis || {}).forEach(k => { if (KEYS.indexOf(k) < 0) bad(where, 'twin mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + R.mis[k])) bad(where, `twin mis.${k} 꼬리 ${R.mis[k]} 가 사전에 없다`); });
      (R.tw || []).forEach(x => { if (!TW_P[x]) bad(where, 'twin tw 후보는 ㄲㄸㅃㅆㅉ 만: ' + x); });
      if (R.dir !== undefined && ['make', 'split', 'up', 'down'].indexOf(R.dir) < 0) bad(where, 'twin dir 는 make·split·up·down');
    }
    /* v1.8 갈래 — 낱말 묶음·짝 */
    if (q.variant_rule.wcat) {
      const R = q.variant_rule.wcat; const ask = R.ask || 'pick';
      if (['pick', 'odd'].indexOf(ask) < 0) bad(where, 'wcat ask 를 모른다: ' + ask);
      if (['mc', 'blank'].indexOf(q.kind) < 0) bad(where, 'wcat 변형은 mc·blank 만');
      if (at) bad(where, 'wcat 은 그림 없는 문항 전용');
      Object.keys(R.mis || {}).forEach(k => { if (['other', 'near', 'in'].indexOf(k) < 0) bad(where, 'wcat mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + R.mis[k])) bad(where, `wcat mis.${k} 꼬리 ${R.mis[k]} 가 사전에 없다`); });
      if (ask === 'pick' && !(R.mis || {}).other) bad(where, 'wcat pick 은 mis.other 가 있어야(오답이 모자란다)');
      if (ask === 'odd' && !(R.mis || {}).in) bad(where, 'wcat odd 는 mis.in 이 있어야');
      (R.cats || []).forEach(c => { if (!WCX[c]) bad(where, 'wcat cats 후보는 body·family·food·school·town 만: ' + c); });
    }
    if (q.variant_rule.wlink) {
      const R = q.variant_rule.wlink; const ask = R.ask || 'body';
      if (['body', 'bodyr', 'place', 'placer'].indexOf(ask) < 0) bad(where, 'wlink ask 를 모른다: ' + ask);
      if (['mc', 'blank'].indexOf(q.kind) < 0) bad(where, 'wlink 변형은 mc·blank 만');
      if (at) bad(where, 'wlink 은 그림 없는 문항 전용');
      Object.keys(R.mis || {}).forEach(k => { if (k !== 'link') bad(where, 'wlink mis 갈래는 link 뿐: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + R.mis[k])) bad(where, `wlink mis.link 꼬리 ${R.mis[k]} 가 사전에 없다`); });
    }
    if (q.variant_rule.punct) {
      const R = q.variant_rule.punct; const ask = R.ask || 'mark';
      if (['mark', 'type', 'read', 'pause', 'name'].indexOf(ask) < 0) bad(where, 'punct ask 를 모른다: ' + ask);
      if (q.kind !== 'mc') bad(where, 'punct 변형은 mc 만');
      if (at) bad(where, 'punct 는 그림 없는 문항 전용');
      const KEYS = ['mark', 'call', 'type', 'read', 'up', 'name', 'swap', 'same', 'split'];
      Object.keys(R.mis || {}).forEach(k => { if (KEYS.indexOf(k) < 0) bad(where, 'punct mis 갈래를 모른다: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + R.mis[k])) bad(where, `punct mis.${k} 꼬리 ${R.mis[k]} 가 사전에 없다`); });
      (R.types || []).forEach(t => { if (['q', 'ex', 'st', 'call'].indexOf(t) < 0) bad(where, 'punct types 는 q·ex·st·call: ' + t); });
      const need = {mark:(R.types || ['q']).indexOf('call') >= 0 ? ['call'] : ['mark'], type:['type'], read:['read'], pause:['swap', 'same', 'split'], name:['name']}[ask] || [];
      const have = need.filter(k => (R.mis || {})[k]).length;
      if (ask === 'pause' ? have < (q.options || []).length - 1 : !have) bad(where, `punct ${ask} 오답을 만들 mis 가 모자란다(${need.join('·')})`);
      if (ask === 'mark' && (R.types || []).indexOf('call') >= 0 && (R.types || []).some(t => t !== 'call') && !(R.mis || {}).mark) bad(where, 'punct mark 에 문장 종류가 섞이면 mis.mark 도 있어야');
      if (ask === 'read' && (R.types || []).indexOf('ex') < 0 && !(R.mis || {}).read && (R.types || ['q','ex','st']).length) {}
    }
    if (q.variant_rule.colloc) {
      const R = q.variant_rule.colloc; const ask = R.ask || 'fill';
      if (['fill', 'back', 'odd'].indexOf(ask) < 0) bad(where, 'colloc ask 를 모른다: ' + ask);
      if (['mc', 'blank'].indexOf(q.kind) < 0) bad(where, 'colloc 변형은 mc·blank 만');
      if (at) bad(where, 'colloc 은 그림 없는 문항 전용');
      (R.kinds || []).forEach(k => { if (['wear', 'do'].indexOf(k) < 0) bad(where, 'colloc kinds 는 wear·do: ' + k); });
      Object.keys(R.mis || {}).forEach(k => { if (['wear', 'do'].indexOf(k) < 0) bad(where, 'colloc mis 갈래는 wear·do: ' + k); else if (!MIS.has(String(q.concept).replace(/C\d+$/, '') + R.mis[k])) bad(where, `colloc mis.${k} 꼬리 ${R.mis[k]} 가 사전에 없다`); });
      (R.kinds || ['wear', 'do']).forEach(k => { if (!(R.mis || {})[k]) bad(where, `colloc kinds ${k} 에 mis 꼬리가 없다`); });
    }
    if (q.variant_rule.bond && q.variant_rule.bond.part_max && at !== 'number_bond') bad(where, 'bond 는 number_bond 그림이 있어야 한다');
    /* play.html 과 같은 순서·같은 난수 씀씀이: 틀린 문항들이 난수 하나를 이어 쓰고, prep 은 변형 뒤에 온다.
       (덧: 씨앗을 1씩 늘리면 LCG 특성상 첫 값이 거의 안 변해 「안 변한다」는 가짜 실패가 난다 — 씨앗을 넓게 흩는다) */
    const face = x => JSON.stringify([x.stem, x.asset || null, x.options || null, x.answer || null, x.pairs || null]);
    const origin = face(ENG.prep(q));
    let varied = false, same = 0;
    for (let i = 0; i < FUZZ; i++) {
      let v;
      const r = ENG.rng((q.seq * 2654435761 + (i + 1) * 40503) >>> 0);
      r(); r();
      try { v = ENG.prep(ENG.makeVariant(q, r)); }
      catch (e) { bad(where, `변형 ${i} 예외: ` + e.message); break; }
      checkQ(where + ` 변형${i}`, v, { variant: true });
      if (face(v) !== origin) varied = true; else same++;
      try { ENG.drawAsset(v.asset, r); }
      catch (e) { bad(where + ` 변형${i}`, '화면 그리기 예외: ' + e.message); }
      try { if (v.asset && !ENG.paperAsset(v.asset)) bad(where + ` 변형${i}`, '종이 문제지에서 에셋이 빈칸으로 나옴'); }
      catch (e) { bad(where + ` 변형${i}`, '종이 그리기 예외: ' + e.message); }
      fuzzed++;
    }
    /* 한 번도 안 변했다 = 변형 규칙이 있는데 엔진에 그 갈래가 없다 → 「다시 해볼까?」가 같은 문제 재탕 */
    /* 재탕 막이(2026-10-07) 뒤로는 원본과 같은 변형이 한 번도 나오면 안 된다 — 나오면 그 갈래가 낼 수 있는 문제가 원본 하나뿐이다 */
    if (varied && same) bad(where, `변형 ${FUZZ}회 중 ${same}회가 원본과 같음 — 재탕 막이를 넘었다(갈래의 고를 거리가 너무 적다)`);
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
