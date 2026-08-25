/* gate_g1_math_u3.js — L3 게이트 (g1 수학 u3 「덧셈과 뺄셈」 4요소 증보 11차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review items·leveled·exit) 실렌더 + 회귀 무손상.
   ⚠️ g1 u3 특수: ①묶음차시(l06_07·l09_10)는 lesson="6~7"/"9~10"로 openShow.
     ②l01~l03이 IIFE 밖(가드 없음) → eval 전 window.LESSONS 선초기화 필수. 커리큘럼=window.CURRICULUM.
   ⚠️ 학생 노출 자리 수학용어(교환법칙·결합법칙·항등원) 금지 — 일상 표현만.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_math_u3.js */
'use strict';
/* ⚠️ k-edu 라이브용 이식본(2026-08-25): 라이브 데이터는 bare `LESSONS[...]`, 홈은 `const CURRICULUM` — 선초기화·치환으로 맞춤. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_math_u3.js'), 'utf8');
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
  w.eval('var LESSONS = {}; window.LESSONS = LESSONS;');   // ⚠️ l01~l03 IIFE 밖 가드 대체
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:1,subject:"수학",title:"1학년 수학",brand:"케이티처",slug:"g1_math"}, curriculum:window.CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

// u3: 묶음차시 l06_07·l09_10 — [키, openShow lesson 인자]
const MAP = [
  ['u3_l01', '1'], ['u3_l02', '2'], ['u3_l03', '3'], ['u3_l04', '4'],
  ['u3_l05', '5'], ['u3_l06_07', '6~7'], ['u3_l08', '8'],
  ['u3_l09_10', '9~10'], ['u3_l11', '11'], ['u3_l12', '12'], ['u3_l13', '13']
];
const NO_REVIEW = ['u3_l01'];   // 첫 차시 review 항목 없음(블록만 유지)

// 한 차시를 열고 전 슬라이드 순회 렌더한 누적 HTML (u3 max 25슬 → 46클릭 여유)
function renderAll(w, lessonArg) {
  w.Teacher.openShow('3', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 46; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u3 11차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(keys.length === 11, 'u3 차시 ' + keys.length);
});

console.log('═══ B. 증보 11차시 삽입 요소 실렌더 ═══');
for (const [key, arg] of MAP) {
  T(key + ' 4요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, arg);
    ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (!NO_REVIEW.includes(key)) ok(/kt-rv/.test(ALL), '① review items 미렌더');
    ok(/＋|－|모으|가르|더하|빼|이어|거꾸로/.test(ALL), '③ 덧뺄 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 11차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('3', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 산수 정합 검산 ═══');
T('고정 사실 테이블 eval 일치', () => {
  const FACTS = [
    ['2+3', 5], ['4+3', 7], ['7-3', 4], ['8-6', 2], ['5+3', 8], ['4+2', 6], ['6+2', 8],
    ['2+5', 7], ['5+2', 7], ['6-2', 4], ['7-2', 5], ['8-3', 5], ['5+4', 9],
    ['3+0', 3], ['5-0', 5], ['4-4', 0], ['4+3-2', 5], ['8-5', 3], ['9-4', 5], ['6-0', 6]
  ];
  const bad = FACTS.filter(([e, v]) => eval(e) !== v).map(([e]) => e);
  ok(bad.length === 0, '식 불일치: ' + bad.join(','));
});
T('증보 leveled·exit 내부 식 무모순 (전각 정규화 후 전수 eval)', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_math_u3.js'))];
  require(path.join(TDIR, 'data/g1_math_u3.js'));
  const L = global.window.LESSONS;
  const norm = s => String(s).replace(/＋/g, '+').replace(/－/g, '-').replace(/＝/g, '=');
  const eqRe = /(?<![\d+\-＋－])(\d+)\s*([+\-＋－])\s*(\d+)\s*[=＝]\s*(\d+)(?![\d+\-＋－])/g;
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u3_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (!['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) return;
      const txt = norm(JSON.stringify(s.data));
      let m;
      while ((m = eqRe.exec(txt)) !== null) {
        const a = +m[1], op = m[2].replace('＋', '+').replace('－', '-'), b = +m[3], kk = +m[4];
        const v = op === '+' ? a + b : a - b;
        if (v !== kk) bad.push(k + ':' + a + op + b + '=' + v + '(표기' + kk + ')');
      }
    });
  });
  ok(bad.length === 0, '식 모순: ' + bad.join(','));
});
T('덧뺄 개념 데이터 정합 (기호·모으기·가르기 존재)', () => {
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('더하') || has('＋') || has('+'), '더하기 소재');
  ok(has('빼') || has('－') || has('-'), '빼기 소재');
  ok(has('모으') && has('가르'), '모으기/가르기 소재');
});

console.log('═══ E. 금지 수학용어 · 차단 어휘 ═══');
T('학생 노출 자리 수학용어(교환법칙·결합법칙·항등원) 0', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_math_u3.js'))];
  require(path.join(TDIR, 'data/g1_math_u3.js'));
  const L = global.window.LESSONS;
  const banned = ['교환법칙', '결합법칙', '항등원'];
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u3_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) {
        const txt = JSON.stringify(s.data);
        banned.forEach(t => { if (txt.includes(t)) bad.push(k + ':' + s.block + ':' + t); });
      }
    });
  });
  ok(bad.length === 0, '수학용어 노출: ' + bad.join(','));
});
T('u3 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
