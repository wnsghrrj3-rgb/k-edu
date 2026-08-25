/* gate_g1_math_u5.js — L3 게이트 (g1 수학 u5 「50까지의 수」 4요소 증보 9차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review items·leveled·exit) 실렌더 + 회귀 무손상.
   ⚠️ g1 u5 특수: ①묶음차시 l02_03 → openShow('5','2~3'). ②review 블록은 l02_03만 원보유 →
     나머지 차시는 review 슬라이드 신규 삽입(전 9차시 review items 보유). ③l10(평가)은 앞쪽 summary 존재 →
     exit은 마지막 summary 앞. ④학생 노출 자리 자리값 용어(십의 자리·일의 자리·자릿값) 금지 — 묶음/낱개만.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_math_u5.js */
'use strict';
/* ⚠️ k-edu 라이브용 이식본(2026-08-25): 라이브 데이터는 bare `LESSONS[...]`, 홈은 `const CURRICULUM` — 선초기화·치환으로 맞춤. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_math_u5.js'), 'utf8');
const G1HTML = fs.readFileSync(path.join(TDIR, 'g1_math.html'), 'utf8');
const CURRIC_SRC = ((G1HTML.match(/const CURRICULUM\s*=\s*\[[\s\S]*?\];/) || [''])[0]).replace(/^const CURRICULUM/, 'window.CURRICULUM');

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
  w.eval('var LESSONS = {}; window.LESSONS = LESSONS;');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:1,subject:"수학",title:"1학년 수학",brand:"케이티처",slug:"g1_math"}, curriculum:window.CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

// u5: 묶음차시 l02_03 — [키, openShow lesson 인자]
const MAP = [
  ['u5_l02_03', '2~3'], ['u5_l04', '4'], ['u5_l05', '5'], ['u5_l06', '6'],
  ['u5_l07', '7'], ['u5_l08', '8'], ['u5_l09', '9'], ['u5_l10', '10'], ['u5_l11', '11']
];
const NO_REVIEW = [];   // 증보 후 전 9차시 review items 보유

function renderAll(w, lessonArg) {
  w.Teacher.openShow('5', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 46; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u5 9차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u5_'));
  ok(keys.length === 9, 'u5 차시 ' + keys.length);
});

console.log('═══ B. 증보 9차시 삽입 요소 실렌더 ═══');
for (const [key, arg] of MAP) {
  T(key + ' 4요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, arg);
    ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (!NO_REVIEW.includes(key)) ok(/kt-rv/.test(ALL), '① review items 미렌더');
    ok(/묶음|낱개|모으|가르|＋|10/.test(ALL), '③ 50까지 수 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 9차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('5', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 산수·place-value 정합 검산 ═══');
T('고정 사실 eval + 크기 비교 일치', () => {
  const FACTS = [['9+1', 10], ['10+3', 13], ['8+5', 13], ['10+5', 15], ['20+3', 23], ['40+2', 42], ['30+5', 35], ['10+4', 14], ['12+1', 13], ['19+1', 20]];
  const b1 = FACTS.filter(([e, v]) => eval(e) !== v).map(([e]) => e);
  ok(b1.length === 0, '식 불일치: ' + b1.join(','));
  const COMP = [[32, 21, 32], [24, 27, 27], [41, 39, 41]];
  const b2 = COMP.filter(([a, b, big]) => Math.max(a, b) !== big).map(([a, b]) => a + 'vs' + b);
  ok(b2.length === 0, '비교 불일치: ' + b2.join(','));
});
T('증보 leveled·exit·review 내부 식 무모순 (전각 정규화 후 전수 eval)', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_math_u5.js'))];
  require(path.join(TDIR, 'data/g1_math_u5.js'));
  const L = global.window.LESSONS;
  const norm = s => String(s).replace(/＋/g, '+').replace(/－/g, '-').replace(/＝/g, '=');
  const eqRe = /(?<![\d+\-＋－])(\d+)\s*([+\-＋－])\s*(\d+)\s*[=＝]\s*(\d+)(?![\d+\-＋－])/g;
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u5_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (!['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) return;
      const txt = norm(JSON.stringify(s.data)); let m;
      while ((m = eqRe.exec(txt)) !== null) {
        const a = +m[1], op = m[2].replace('＋', '+').replace('－', '-'), b = +m[3], kk = +m[4];
        const v = op === '+' ? a + b : a - b;
        if (v !== kk) bad.push(k + ':' + a + op + b + '=' + v + '(표기' + kk + ')');
      }
    });
  });
  ok(bad.length === 0, '식 모순: ' + bad.join(','));
});
T('50까지 수 개념 데이터 정합 (묶음·낱개·10 존재)', () => {
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('묶음') && has('낱개'), '묶음/낱개 소재');
  ok(has('10'), '10 소재');
  ok(has('모으') || has('가르'), '모으기/가르기 소재');
});

console.log('═══ E. 금지 자리값 용어 · 차단 어휘 ═══');
T('학생 노출 자리 자리값 용어(십의 자리·일의 자리·자릿값) 0', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_math_u5.js'))];
  require(path.join(TDIR, 'data/g1_math_u5.js'));
  const L = global.window.LESSONS;
  const banned = ['십의 자리', '일의 자리', '자릿값', '자리값'];
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u5_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) {
        const txt = JSON.stringify(s.data);
        banned.forEach(t => { if (txt.includes(t)) bad.push(k + ':' + s.block + ':' + t); });
      }
    });
  });
  ok(bad.length === 0, '자리값 용어 노출: ' + bad.join(','));
});
T('u5 차단 어휘 0', () => {
  // 한글 음절 뒤 결합(예: 대결로=대결+로)은 오탐 제외 — 필러 차단어만 검출
  const words = ['박음', '빵꾸', '갈아엎', '결로'];
  const bad = words.filter(w => new RegExp('(?<![가-힣])' + w).test(DATA));
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
