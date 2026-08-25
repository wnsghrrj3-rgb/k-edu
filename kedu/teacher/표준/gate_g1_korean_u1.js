/* gate_g1_korean_u1.js — L3 게이트 (g1 국어 u1 「글자를 만들어요」 국어 §7 증보 14차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review·활동층·offline·exit) 실렌더 + 회귀 무손상.
   ⚠️ 국어 §7: ⑤leveled=활동층(읽기·쓰기·말하기 라벨) · ④offline 짝 활동 필수 · review/exit/tnote 동일.
     커리큘럼=window.CURRICULUM · subject.slug=g1_korean · 근거=한글 결합(자음＋모음＝글자) 검산.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_korean_u1.js */
'use strict';
/* ⚠️ k-edu 라이브용 이식본(2026-08-25): 라이브 데이터는 bare `LESSONS[...]`, 홈은 `const CURRICULUM` — 선초기화·치환으로 맞춤. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_korean_u1.js'), 'utf8');
const KHTML = fs.readFileSync(path.join(TDIR, 'g1_korean.html'), 'utf8');
const CURRIC_SRC = ((KHTML.match(/const CURRICULUM\s*=\s*\[[\s\S]*?\];/) || [''])[0]).replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

// 한글 결합 유틸
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
function compose(cho, jung) { const ci = CHO.indexOf(cho), ji = JUNG.indexOf(jung); if (ci < 0 || ji < 0) return null; return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28); }

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-korean">${extractBody(KHTML)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('var LESSONS = {}; window.LESSONS = LESSONS;');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{ slug:'g1_korean', label:'1학년 국어' }, curriculum:window.CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

const MAP = Array.from({ length: 14 }, (_, i) => ['u1_l' + String(i + 1).padStart(2, '0'), String(i + 1)]);
const NO_REVIEW = ['u1_l01'];

function renderAll(w, lessonArg) {
  w.Teacher.openShow('1', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 24; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u1 14차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(keys.length === 14, 'u1 차시 ' + keys.length);
});

console.log('═══ B. 증보 14차시 삽입 요소 실렌더 (활동층·offline·exit·review) ═══');
for (const [key, arg] of MAP) {
  T(key + ' 요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, arg);
    ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
    ok(/kt-lv-tab/.test(ALL), '⑤ 활동층 미렌더');
    ok(/읽기/.test(ALL) && /쓰기/.test(ALL) && /말하기/.test(ALL), '활동 3층 라벨 누락');
    ok(/i-offline-card/.test(ALL), '④ offline 짝 활동 미렌더');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (!NO_REVIEW.includes(key)) ok(/kt-rv/.test(ALL), '① review 미렌더');
    ok(/글자|자음자|모음자|낱말/.test(ALL), '③ 한글 서사 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 14차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('1', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 한글 결합 정합 검산 ═══');
T('결합 사실 테이블(자음＋모음＝글자) 일치', () => {
  const FACTS = [['ㄱ', 'ㅏ', '가'], ['ㄴ', 'ㅏ', '나'], ['ㄷ', 'ㅏ', '다'], ['ㅇ', 'ㅗ', '오'], ['ㅇ', 'ㅣ', '이'], ['ㅍ', 'ㅗ', '포'], ['ㄷ', 'ㅗ', '도'], ['ㄱ', 'ㅐ', '개'], ['ㅇ', 'ㅑ', '야'], ['ㅇ', 'ㅛ', '요']];
  const bad = FACTS.filter(([c, j, e]) => compose(c, j) !== e).map(([c, j]) => c + '＋' + j);
  ok(bad.length === 0, '결합 불일치: ' + bad.join(','));
});
T('증보 leveled·exit·review 내부 결합 무모순 (전수 검산)', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_korean_u1.js'))];
  require(path.join(TDIR, 'data/g1_korean_u1.js'));
  const L = global.window.LESSONS;
  const combRe = /([ㄱ-ㅎ])\s*[+＋]\s*([ㅏ-ㅣ])\s*[=＝]\s*([가-힣])/g;
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u1_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (!['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) return;
      const txt = JSON.stringify(s.data); let m;
      while ((m = combRe.exec(txt)) !== null) { const g = compose(m[1], m[2]); if (g !== m[3]) bad.push(k + ':' + m[1] + '＋' + m[2] + '＝' + g + '(표기' + m[3] + ')'); }
    });
  });
  ok(bad.length === 0, '결합 모순: ' + bad.join(','));
});
T('활동 층 라벨(읽기·쓰기·말하기) 전 차시 정합', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_korean_u1.js'))];
  require(path.join(TDIR, 'data/g1_korean_u1.js'));
  const L = global.window.LESSONS;
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u1_')).forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    if (!lv) { bad.push(k + ':활동층없음'); return; }
    const ks = Object.keys(lv.data.levels || {});
    if (!(ks.includes('읽기') && ks.includes('쓰기') && ks.includes('말하기'))) bad.push(k + ':라벨');
  });
  ok(bad.length === 0, '활동층 라벨 오류: ' + bad.join(','));
});
T('offline 짝 활동 전 차시 존재(국어 필수 1)', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_korean_u1.js'))];
  require(path.join(TDIR, 'data/g1_korean_u1.js'));
  const L = global.window.LESSONS;
  const bad = Object.keys(L).filter(k => k.startsWith('u1_')).filter(k => !L[k].slides.some(s => s.block === 'offline_activity'));
  ok(bad.length === 0, 'offline 누락: ' + bad.join(','));
});

console.log('═══ E. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const words = ['박음', '빵꾸', '갈아엎', '결로'];
  const bad = words.filter(w => new RegExp('(?<![가-힣])' + w).test(DATA));
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
