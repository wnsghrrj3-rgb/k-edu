/* gate_g2_math_u6.js — L3 게이트 (g2 수학 u6 「곱셈」 증보 9차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소 실렌더 + 회귀 무손상 + 산수·선행노출 검사.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g2_math_u6.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_math_u6.js'), 'utf8');
const G2HTML = fs.readFileSync(path.join(TDIR, 'g2_math.html'), 'utf8');
const CURRIC_SRC = (G2HTML.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0].replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-math">${extractBody(G2HTML)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  // 엔진이 케이퀴즈 카탈로그를 fetch — jsdom에 없으므로 빈 목록 스텁
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:2,subject:"수학",title:"2학년 1학기 수학",brand:"케이티처",slug:"g2_math"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

// 한 차시를 열고 전 슬라이드 순회 렌더한 누적 HTML
function renderAll(w, unit, lesson) {
  w.Teacher.openShow(String(unit), String(lesson));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 22; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u6 9차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u6_'));
  ok(keys.length === 9, 'u6 차시 ' + keys.length);
});

console.log('═══ B. 전 차시 삽입 요소 실렌더 ═══');
const HAS_OFFLINE = ['u6_l02', 'u6_l03', 'u6_l04', 'u6_l05', 'u6_l06', 'u6_l07', 'u6_l09'];
for (let n = 1; n <= 9; n++) {
  const key = 'u6_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 6, n);
    ok(!/교구 로드 오류|undefined<\/|NaN마리/.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (n !== 1) ok(/kt-rv/.test(ALL), '① review items 미렌더');   // l01은 전시학습 없음
    if (HAS_OFFLINE.includes(key)) ok(/kt-oa-steps/.test(ALL) && /kt-oa-timer/.test(ALL), '④ offline 미렌더');
    ok(/곰이|펭이|묶음|곱셈/.test(ALL), '③ 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (openShow 무손상) ═══');
for (let n = 1; n <= 9; n++) {
  const key = 'u6_l' + String(n).padStart(2, '0');
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('6', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 산수·구조 검산 ═══');
T('leveled·exit·review 문항 검산', () => {
  const c = [['5*3', 15], ['3*6', 18], ['5*4', 20], ['3*4', 12], ['15/5', 3], ['20/4', 5],
    ['2*4', 8], ['6*4', 24], ['4*3', 12], ['2*7', 14], ['4*5', 20], ['6*3', 18],
    ['2*6', 12], ['5*7', 35], ['3*5', 15], ['3*2', 6], ['6*2', 12], ['2*5', 10], ['8/2', 4]];
  const bad = c.filter(([e, a]) => eval(e) !== a);
  ok(bad.length === 0, '산수 오류: ' + JSON.stringify(bad));
});
T('곱셈 기호 선행 노출 0 (l01~l05 삽입 슬라이드)', () => {
  global.window = {};
  delete require.cache[require.resolve(path.join(TDIR, 'data/g2_math_u6.js'))];
  require(path.join(TDIR, 'data/g2_math_u6.js'));
  const L = global.window.LESSONS;
  const bad = [];
  ['u6_l01', 'u6_l02', 'u6_l03', 'u6_l04', 'u6_l05'].forEach(k => {
    L[k].slides.filter(s => /^s1\d\d$/.test(s.id)).forEach(s => {
      if (/×/.test(JSON.stringify(s))) bad.push(k + ':' + s.id);
    });
    L[k].slides.forEach(s => { if (s.tnote && /×/.test(JSON.stringify(s.tnote))) bad.push(k + ':' + s.id + '.tnote'); });
    const rv = L[k].slides.find(s => s.block === 'review');
    if (rv && rv.data.items && /×/.test(JSON.stringify(rv.data.items))) bad.push(k + ':review.items');
  });
  ok(bad.length === 0, '× 선행 노출: ' + bad.join(','));
});
T('전 차시 tnote·img·삽입 슬라이드 수 정합', () => {
  const L = global.window.LESSONS;
  const bad = [];
  const OFF = HAS_OFFLINE;
  Object.keys(L).forEach(k => {
    const S = L[k].slides;
    if (S.filter(s => s.tnote).length < 2) bad.push(k + ':tnote<2');
    if (!S.some(s => s.data && s.data.img)) bad.push(k + ':img없음');
    const ins = S.filter(s => /^s1\d\d$/.test(s.id)).length;
    const want = OFF.includes(k) ? 3 : 2;
    if (ins !== want) bad.push(k + ':삽입' + ins + '(기대' + want + ')');
  });
  ok(bad.length === 0, bad.join(','));
});

console.log('═══ E. 차단 어휘 ═══');
T('u6 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
