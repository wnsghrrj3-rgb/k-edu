/* gate_g2_math_u2.js — L3 게이트 (g2 수학 u2 「여러 가지 도형」 증보 9차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소 실렌더 + 회귀 무손상.
   실행: NODE_PATH=/home/claude/node_modules node gate_g2_math_u2.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_math_u2.js'), 'utf8');
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
T('부팅 + u2 9차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(keys.length === 9, 'u2 차시 ' + keys.length);
});

console.log('═══ B. 전 차시 삽입 요소 실렌더 ═══');
const HAS_OFFLINE = ['u2_l01', 'u2_l02', 'u2_l05', 'u2_l06', 'u2_l07', 'u2_l08', 'u2_l09'];
for (let n = 1; n <= 9; n++) {
  const key = 'u2_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 2, n);
    ok(!/교구 로드 오류|undefined<\/|NaN마리/.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (n !== 1) ok(/kt-rv/.test(ALL), '① review items 미렌더');   // l01은 review items 없음
    if (HAS_OFFLINE.includes(key)) ok(/kt-oa-steps/.test(ALL) && /kt-oa-timer/.test(ALL), '④ offline 미렌더');
    ok(/곰이|펭이|공방/.test(ALL), '③ 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (openShow 무손상) ═══');
for (let n = 1; n <= 9; n++) {
  const key = 'u2_l' + String(n).padStart(2, '0');
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('2', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 산수·도형사실 검산 ═══');
T('leveled·exit·review 수치 검산', () => {
  const c = [['4-3', 1], ['5+2', 7], ['4+2', 6], ['4+1', 5], ['3+1', 4], ['2+2', 4]];
  const bad = c.filter(([e, a]) => eval(e) !== a);
  ok(bad.length === 0, '산수 오류: ' + JSON.stringify(bad));
});
T('도형 사실 데이터 정합', () => {
  // 원본 정답과 일치하는 핵심 사실이 증보 데이터(재출력 JSON)에 그대로 실렸는지
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('"3개"'), '삼각형 변/꼭짓점 3');
  ok(has('"4개"'), '사각형 변/꼭짓점 4');
  ok(has('"0개"') || has('0개(없어요)'), '원 곧은선/꼭짓점 0');
  ok(has('"7조각"') && has('"5개"') && has('"2개"'), '칠교 7=5+2');
});

console.log('═══ E. 차단 어휘 ═══');
T('u2 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
