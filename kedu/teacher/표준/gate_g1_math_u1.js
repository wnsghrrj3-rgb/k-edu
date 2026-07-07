/* gate_g1_math_u1.js — L3 게이트 (g1 수학 u1 「9까지의 수」 4요소 증보 10차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review items·leveled·exit) 실렌더 + 회귀 무손상.
   ⚠️ g1 특수: 묶음차시(l02_03·l04_05)는 lesson="2~3"/"4~5"로 openShow · 커리큘럼=window.CURRICULUM_G1_MATH.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_math_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_math_u1.js'), 'utf8');
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

// 묶음차시 대응: [키, openShow lesson 인자]
const MAP = [
  ['u1_l01', '1'], ['u1_l02_03', '2~3'], ['u1_l04_05', '4~5'],
  ['u1_l06', '6'], ['u1_l07', '7'], ['u1_l08', '8'],
  ['u1_l09', '9'], ['u1_l10', '10'], ['u1_l11', '11'], ['u1_l12', '12']
];
const NO_REVIEW = ['u1_l01'];

// 한 차시를 열고 전 슬라이드 순회 렌더한 누적 HTML (l08=40슬 대비 42클릭)
function renderAll(w, lessonArg) {
  w.Teacher.openShow('1', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 42; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u1 10차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(keys.length === 10, 'u1 차시 ' + keys.length);
});

console.log('═══ B. 증보 10차시 삽입 요소 실렌더 ═══');
for (const [key, arg] of MAP) {
  T(key + ' 4요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, arg);
    ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (!NO_REVIEW.includes(key)) ok(/kt-rv/.test(ALL), '① review items 미렌더');
    ok(/곰이|펭이/.test(ALL), '③ 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 10차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('1', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 산수 검산 ═══');
T('leveled·exit·review 수치 검산 (1만큼 크/작·0)', () => {
  const c = [['6+1', 7], ['8-1', 7], ['4+1', 5], ['7-1', 6], ['1-1', 0], ['6-1', 5]];
  const bad = c.filter(([e, a]) => eval(e) !== a);
  ok(bad.length === 0, '산수 오류: ' + JSON.stringify(bad));
});
T('개념 데이터 정합', () => {
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('넷째') && has('셋째'), '서수(순서) 표현');
  ok(has('1만큼 큰') || has('1만큼 더 큰'), '1만큼 큰/작은');
  ok(has('"0"') || has('0(') || has('아무것도 없'), '0 개념');
  ok(has('짝지어') || has('짝을 지어'), '비교=짝짓기');
});

console.log('═══ E. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
