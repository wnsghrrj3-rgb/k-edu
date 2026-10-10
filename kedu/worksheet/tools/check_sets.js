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
  word_grid:      ['rows']
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
