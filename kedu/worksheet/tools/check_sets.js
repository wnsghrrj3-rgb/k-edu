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
  take_row:       ['item', 'n', 'cross']
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

  if (q.mis !== undefined && !MIS.has(q.mis)) bad(where, '문항 기본 오개념(mis) 사전에 없는 코드 ' + q.mis);
  /* 선긋기·OX 의 「O/X 자체 오답」은 보기가 없어 오개념을 못 단다 — 새 단원(국어부터)은 문항에 mis 를 직접 단다 */
  if (!opt.variant && (q.kind === 'match' || q.kind === 'ox') && !q.mis && opt.requireMis) bad(where, q.kind + ' 문항에 기본 오개념(mis) 없음 — 틀렸을 때 리포트가 읽을 코드가 없다');
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
