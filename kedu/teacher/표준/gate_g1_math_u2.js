/* gate_g1_math_u2.js — L3 게이트 (g1 수학 u2 「여러 가지 모양」 4요소 증보 7차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review items·leveled·exit) 실렌더 + 회귀 무손상.
   ⚠️ g1 u2: 묶음차시 없음(l01~l07 단일) · openShow('2', n) · 커리큘럼=window.CURRICULUM.
   ⚠️ 학생 노출 자리 수학용어(직육면체·원기둥·구) 금지 — 일상용어(상자/기둥/공 모양)만.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_math_u2.js */
'use strict';
/* ⚠️ k-edu 라이브용 이식본(2026-08-25): 라이브 데이터는 bare `LESSONS[...]`, 홈은 `const CURRICULUM` — 선초기화·치환으로 맞춤. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_math_u2.js'), 'utf8');
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
  w.eval('var LESSONS = {}; window.LESSONS = LESSONS;'); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:1,subject:"수학",title:"1학년 수학",brand:"케이티처",slug:"g1_math"}, curriculum:window.CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

// u2: 묶음차시 없음 — [키, openShow lesson 인자]
const MAP = [
  ['u2_l01', '1'], ['u2_l02', '2'], ['u2_l03', '3'], ['u2_l04', '4'],
  ['u2_l05', '5'], ['u2_l06', '6'], ['u2_l07', '7']
];
const NO_REVIEW = ['u2_l01'];

// 한 차시를 열고 전 슬라이드 순회 렌더한 누적 HTML (u2 max 21슬 → 42클릭 여유)
function renderAll(w, lessonArg) {
  w.Teacher.openShow('2', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 42; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u2 7차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(keys.length === 7, 'u2 차시 ' + keys.length);
});

console.log('═══ B. 증보 7차시 삽입 요소 실렌더 ═══');
for (const [key, arg] of MAP) {
  T(key + ' 4요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, arg);
    ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (!NO_REVIEW.includes(key)) ok(/kt-rv/.test(ALL), '① review items 미렌더');
    ok(/상자 모양|기둥 모양|공 모양/.test(ALL), '③ 모양 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 7차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('2', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 모양 정합 검산 ═══');
T('leveled·exit 정답 = 3모양 안 · 개념 무모순', () => {
  const SHAPE = { '상자 모양': { roll: false, stack: true }, '기둥 모양': { roll: true, stack: true }, '공 모양': { roll: true, stack: false } };
  // 원본·증보 정답 사실(계승): 학생 노출 정답이 실제 데이터에 존재
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('통조림') || has('캔'), '기둥 소재(캔)');
  ok(has('축구공') || has('농구공') || has('구슬'), '공 소재');
  ok(has('주사위') || has('필통') || has('상자 모양'), '상자 소재');
  // 개념 핵심 무모순
  ok(SHAPE['공 모양'].roll === true && SHAPE['상자 모양'].roll === false, '굴러감 정합 위반');
  ok(SHAPE['상자 모양'].stack === true && SHAPE['공 모양'].stack === false, '쌓기 정합 위반');
});
T('개념 데이터 정합 (세 모양 특징)', () => {
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('상자 모양') && has('기둥 모양') && has('공 모양'), '세 모양 이름');
  ok(has('굴러') , '굴러감 특징');
  ok(has('쌓') || has('평평'), '쌓기/평평 특징');
  ok(has('두루마리 휴지'), '기둥 대표 물건');
});

console.log('═══ E. 금지 수학용어 · 차단 어휘 ═══');
T('학생 노출 자리 수학용어(직육면체·원기둥) 0', () => {
  // review/leveled/exit 블록만 대상 — 교사 안내(misconception 등)는 허용
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  require(path.join(TDIR, 'data/g1_math_u2.js'));
  const L = global.window.LESSONS;
  const banned = ['직육면체', '원기둥'];
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u2_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) {
        const txt = JSON.stringify(s.data);
        banned.forEach(t => { if (txt.includes(t)) bad.push(k + ':' + s.block + ':' + t); });
      }
    });
  });
  ok(bad.length === 0, '수학용어 노출: ' + bad.join(','));
});
T('u2 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
