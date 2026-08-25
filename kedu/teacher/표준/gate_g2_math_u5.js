/* gate_g2_math_u5.js — L3 게이트 (g2 수학 u5 「분류하기」 4요소 증보 7차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review items·leveled·exit) 실렌더 + 회귀 무손상.
   ⚠️ g2 u5: 묶음차시 없음(l01~l07 단일) · openShow('5', n) · 커리큘럼=CURRICULUM(g2_math.html).
     분류 단원 — leveled는 기준·분류·세기 판단형. 세기 합·최다/최소 정합 검산.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g2_math_u5.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_math_u5.js'), 'utf8');
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
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:2,subject:"수학",title:"2학년 1학기 수학",brand:"케이티처",slug:"g2_math"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

const MAP = [
  ['u5_l01', '1'], ['u5_l02', '2'], ['u5_l03', '3'], ['u5_l04', '4'],
  ['u5_l05', '5'], ['u5_l06', '6'], ['u5_l07', '7']
];
const NO_REVIEW = ['u5_l01'];   // 첫 차시 review items 없음(블록만 유지)

function renderAll(w, lessonArg) {
  w.Teacher.openShow('5', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 28; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u5 7차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u5_'));
  ok(keys.length === 7, 'u5 차시 ' + keys.length);
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
    ok(/분류|기준|모으|칸|세|귤|빨강/.test(ALL), '③ 분류 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 7차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('5', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 분류·세기 정합 검산 ═══');
T('세기 합 eval + 최다/최소 정합', () => {
  const FACTS = [['4+6+3', 13], ['6+3+4+2', 15], ['6-3', 3]];
  const b1 = FACTS.filter(([e, v]) => eval(e) !== v).map(([e]) => e);
  ok(b1.length === 0, '합 불일치: ' + b1.join(','));
  const FRUIT = { 사과: 4, 귤: 6, 바나나: 3 };
  ok(Object.keys(FRUIT).reduce((a, b) => FRUIT[a] >= FRUIT[b] ? a : b) === '귤', '과일 최다 오류');
  ok(Object.keys(FRUIT).reduce((a, b) => FRUIT[a] <= FRUIT[b] ? a : b) === '바나나', '과일 최소 오류');
  const QUILT = { 빨강: 6, 노랑: 3, 파랑: 4, 흰색: 2 };
  ok(Object.keys(QUILT).reduce((a, b) => QUILT[a] >= QUILT[b] ? a : b) === '빨강', '조각보 최다 오류');
});
T('증보 leveled·exit·review 내부 식 무모순 (전각 정규화 후 전수 eval)', () => {
  global.window = { LESSONS: {} };
  delete require.cache[require.resolve(path.join(TDIR, 'data/g2_math_u5.js'))];
  require(path.join(TDIR, 'data/g2_math_u5.js'));
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
T('분류 개념 데이터 정합 (기준·분류·세기 존재)', () => {
  const has = s => DATA.indexOf(s) >= 0;
  ok(has('기준'), '기준 소재');
  ok(has('분류'), '분류 소재');
  ok(has('세') || has('칸'), '세기 소재');
});

console.log('═══ E. 차단 어휘 ═══');
T('u5 차단 어휘 0', () => {
  const words = ['박음', '빵꾸', '갈아엎', '결로'];
  const bad = words.filter(w => new RegExp('(?<![가-힣])' + w).test(DATA));
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
