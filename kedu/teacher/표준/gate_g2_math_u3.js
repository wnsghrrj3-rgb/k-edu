/* gate_g2_math_u3.js — L3 게이트 (g2 수학 u3 증보 10차시, l03·l05 골든 제외).
   실엔진(jsdom) 부팅 → 증보 차시 openShow → 삽입 요소 실렌더 + 회귀 무손상.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g2_math_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_math_u3.js'), 'utf8');
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

function renderAll(w, unit, lesson) {
  w.Teacher.openShow(String(unit), String(lesson));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 22; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

// 이번 사이클 증보 대상 (l03·l05 = 골든/기증보, 제외)
const AUG_NUMS = [1, 2, 4, 6, 7, 8, 9, 10, 11, 12];
const HAS_OFFLINE = ['u3_l01', 'u3_l02', 'u3_l04', 'u3_l06', 'u3_l07', 'u3_l08', 'u3_l09', 'u3_l10', 'u3_l12'];
const NARR = /곰이|펭이|물고기|구슬|책|딱지|색종이|도토리|사과|사탕|재활용|병뚜껑/;

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u3 12차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(keys.length === 12, 'u3 차시 ' + keys.length);
});

console.log('═══ B. 증보 10차시 삽입 요소 실렌더 ═══');
AUG_NUMS.forEach(n => {
  const key = 'u3_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 3, n);
    ok(!/교구 로드 오류|undefined<\/|NaN/.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (n !== 1) ok(/kt-rv/.test(ALL), '① review items 미렌더');   // l01은 단원 첫 차시 = review items 없음
    if (HAS_OFFLINE.includes(key)) ok(/kt-oa-steps/.test(ALL) && /kt-oa-timer/.test(ALL), '④ offline 미렌더');
    ok(NARR.test(ALL), '③ 서사 흔적 없음');
  });
});

console.log('═══ C. 회귀 (전 12차시 openShow 무손상 — l03·l05 포함) ═══');
for (let n = 1; n <= 12; n++) {
  const key = 'u3_l' + String(n).padStart(2, '0');
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('3', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 산수 검산 ═══');
T('leveled 기본·도전 문항 검산', () => {
  const c = [['12+6', 18], ['25-8', 17], ['17+6', 23], ['28+7', 35], ['47+38', 85], ['66+57', 123],
    ['51-24', 27], ['83-46', 37], ['52-7', 45], ['74-29', 45], ['30+15-20', 25], ['52-18+26', 60],
    ['6+7', 13], ['16-9', 7], ['14-6', 8], ['16+9', 25], ['54+38', 92], ['72-45+18', 45],
    ['26+18', 44], ['52-35', 17]];
  const bad = c.filter(([e, a]) => eval(e) !== a);
  ok(bad.length === 0, '산수 오류: ' + JSON.stringify(bad));
});

console.log('═══ E. 차단 어휘 ═══');
T('u3 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
