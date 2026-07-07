/* gate_g1_math_u6.js — L3 게이트 (g1 수학 u6 「수학이랑 함께해요」·프로젝트 단원 3요소 증보 3차시).
   방식: leveled 제외, 3요소(①review items ⑥exit 성찰형 ⑦tnote). 서사=수학 보물 탐험(보물·전시).
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_math_u6.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_math_u6.js'), 'utf8');
const G1HTML = fs.readFileSync(path.join(TDIR, 'g1_math.html'), 'utf8');
const CURRIC_SRC = (G1HTML.match(/window\.CURRICULUM_G1_MATH\s*=\s*\[[\s\S]*?\];/) || [''])[0];

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-math">${extractBody(G1HTML)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:1,subject:"수학",title:"1학년 수학",brand:"케이티처",slug:"g1_math"}, curriculum:window.CURRICULUM_G1_MATH, lessons:window.LESSONS });`);
  return w;
}

// u6: 3차시(프로젝트) — [키, openShow lesson 인자]
const MAP = [['u6_l01', '1'], ['u6_l02', '2'], ['u6_l03', '3']];
const NO_REVIEW = ['u6_l01'];

function renderAll(w, lessonArg) {
  w.Teacher.openShow('6', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 18; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u6 3차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u6_'));
  ok(keys.length === 3, 'u6 차시 ' + keys.length);
});

console.log('═══ B. 증보 3차시 삽입 요소 실렌더 (3요소·leveled 없음) ═══');
for (const [key, arg] of MAP) {
  T(key + ' 3요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, arg);
    ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (!NO_REVIEW.includes(key)) ok(/kt-rv/.test(ALL), '① review items 미렌더');
    ok(!/kt-lv-tab/.test(ALL), '⑤ leveled 오삽입 (프로젝트 단원은 없어야)');
    ok(/보물|전시/.test(ALL), '③ 프로젝트 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 3차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('6', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 프로젝트 개념·tnote 정합 ═══');
T('프로젝트 개념 데이터 정합', () => {
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('보물'), '수학 보물');
  ok(has('타블로'), '몸 표현(타블로)');
  ok(has('전시'), '전시회');
});
T('3요소 데이터 정합 (exit·tnote·review items)', () => {
  global.window = {}; delete require.cache[require.resolve('../data/g1_math_u6.js')];
  require('../data/g1_math_u6.js'); const LS = global.window.LESSONS;
  const keys = Object.keys(LS).filter(k => k.startsWith('u6_'));
  ok(keys.length === 3, 'u6 차시 수');
  keys.forEach(k => {
    const S = LS[k].slides;
    ok(S.some(s => s.block === 'exit_ticket'), k + ' exit 없음');
    ok(S.filter(s => s.tnote).length >= 1, k + ' tnote 없음');
  });
  // review items: l02·l03 (l01 제외)
  ['u6_l02', 'u6_l03'].forEach(k => {
    const rv = LS[k].slides.find(s => s.block === 'review');
    ok(rv && rv.data && rv.data.items, k + ' review items 없음');
  });
});

console.log('═══ E. 차단 어휘 ═══');
T('u6 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
