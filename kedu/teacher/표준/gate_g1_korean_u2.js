/* gate_g1_korean_u2.js — L3 게이트 (g1 국어 u2 「받침이 있는 글자를 읽어요」 국어 §7 증보 13차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review·활동층·offline·exit) 실렌더 + 회귀 무손상.
   ⚠️ 국어 §7: ⑤leveled=활동층(읽기·쓰기·말하기 라벨) · ④offline 짝 활동 필수 · review/exit/tnote 동일.
     커리큘럼=window.CURRICULUM · subject.slug=g1_korean · 근거=받침 결합([글자]＋[받침]＝[받침 글자]) 종성 검산.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_korean_u2.js */
'use strict';
/* ⚠️ k-edu 라이브용 이식본(2026-08-25): 라이브 데이터는 bare `LESSONS[...]`, 홈은 `const CURRICULUM` — 선초기화·치환으로 맞춤. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_korean_u2.js'), 'utf8');
const KHTML = fs.readFileSync(path.join(TDIR, 'g1_korean.html'), 'utf8');
const CURRIC_SRC = ((KHTML.match(/const CURRICULUM\s*=\s*\[[\s\S]*?\];/) || [''])[0]).replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

// 한글 결합 유틸
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
function addJong(base, jong) { const code = base.charCodeAt(0) - 0xAC00; if (code < 0 || code > 11171 || code % 28 !== 0) return null; const ji = JONG.indexOf(jong); if (ji <= 0) return null; return String.fromCharCode(0xAC00 + code + ji); }

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

const MAP = Array.from({ length: 13 }, (_, i) => ['u2_l' + String(i + 1).padStart(2, '0'), String(i + 1)]);
const NO_REVIEW = ['u2_l01'];

function renderAll(w, lessonArg) {
  w.Teacher.openShow('2', String(lessonArg));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < 24; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u2 13차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(keys.length === 13, 'u2 차시 ' + keys.length);
});

console.log('═══ B. 증보 13차시 삽입 요소 실렌더 (활동층·offline·exit·review) ═══');
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
    ok(/받침|글자|낱말|자세|또박또박/.test(ALL), '③ 단원 서사(받침 트랙·바른 자세 트랙) 흔적 없음');
  });
}

console.log('═══ C. 회귀 (전 13차시 openShow 무손상) ═══');
for (const [key, arg] of MAP) {
  T('회귀 ' + key, () => {
    const W2 = boot();
    W2.Teacher.openShow('2', String(arg));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 받침 결합 정합 검산(종성) ═══');
T('결합 사실 테이블([글자]＋[받침]＝[받침 글자]) 일치', () => {
  const FACTS = [['사', 'ㄴ', '산'], ['소', 'ㅁ', '솜'], ['무', 'ㄹ', '물'], ['바', 'ㄴ', '반'], ['꼬', 'ㅊ', '꽃'], ['다', 'ㄹ', '달'], ['지', 'ㅂ', '집'], ['고', 'ㅁ', '곰'], ['가', 'ㅇ', '강'], ['바', 'ㄹ', '발'], ['고', 'ㅇ', '공'], ['리', 'ㄴ', '린']];
  const bad = FACTS.filter(([b, j, e]) => addJong(b, j) !== e).map(([b, j]) => b + '＋' + j);
  ok(bad.length === 0, '결합 불일치: ' + bad.join(','));
});
T('증보 leveled·exit·review 내부 결합 무모순 (전수 검산)', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_korean_u2.js'))];
  require(path.join(TDIR, 'data/g1_korean_u2.js'));
  const L = global.window.LESSONS;
  const combRe = /([가-힣])\s*[+＋]\s*([ㄱ-ㅎ])\s*[=＝]\s*([가-힣])/g;
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u2_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (!['leveled_problem', 'exit_ticket', 'review'].includes(s.block)) return;
      const txt = JSON.stringify(s.data); let m;
      while ((m = combRe.exec(txt)) !== null) { const g = addJong(m[1], m[2]); if (g !== m[3]) bad.push(k + ':' + m[1] + '＋' + m[2] + '＝' + g + '(표기' + m[3] + ')'); }
    });
  });
  ok(bad.length === 0, '결합 모순: ' + bad.join(','));
});
T('활동 층 라벨(읽기·쓰기·말하기) 전 차시 정합', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_korean_u2.js'))];
  require(path.join(TDIR, 'data/g1_korean_u2.js'));
  const L = global.window.LESSONS;
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u2_')).forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    if (!lv) { bad.push(k + ':활동층없음'); return; }
    const ks = Object.keys(lv.data.levels || {});
    if (!(ks.includes('읽기') && ks.includes('쓰기') && ks.includes('말하기'))) bad.push(k + ':라벨');
  });
  ok(bad.length === 0, '활동층 라벨 오류: ' + bad.join(','));
});
T('offline 짝 활동 전 차시 존재(국어 필수 1)', () => {
  global.window = { LESSONS: {} }; global.LESSONS = global.window.LESSONS;
  delete require.cache[require.resolve(path.join(TDIR, 'data/g1_korean_u2.js'))];
  require(path.join(TDIR, 'data/g1_korean_u2.js'));
  const L = global.window.LESSONS;
  const bad = Object.keys(L).filter(k => k.startsWith('u2_')).filter(k => !L[k].slides.some(s => s.block === 'offline_activity'));
  ok(bad.length === 0, 'offline 누락: ' + bad.join(','));
});

console.log('═══ E. 차단 어휘 ═══');
T('u2 차단 어휘 0', () => {
  const words = ['박음', '빵꾸', '갈아엎', '결로'];
  const bad = words.filter(w => new RegExp('(?<![가-힣])' + w).test(DATA));
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
