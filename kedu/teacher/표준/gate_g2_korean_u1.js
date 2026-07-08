/* gate_g2_korean_u1.js — L4 게이트 (g2 국어 u1 「만나서 반가워요!」 국어 §7 증보 14차시).
   실엔진(jsdom) 부팅 → 전 차시 openShow → 삽입 요소(review·활동층·offline·exit) 실렌더 + 회귀 무손상.
   ⚠️ 국어 §7: ⑤leveled=활동층(읽기·쓰기·말하기 라벨) · ④offline 짝 활동 필수 · review/exit/tnote 동일.
     커리큘럼=window.CURRICULUM_G2_KOR · subject.slug=g2_korean · 근거=저작권 가드(지도서 제재 미노출) 자체검증.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g2_korean_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_korean_u1.js'), 'utf8');
const KHTML = fs.readFileSync(path.join(TDIR, 'g2_korean.html'), 'utf8');
const CURRIC_SRC = (KHTML.match(/window\.CURRICULUM_G2_KOR\s*=\s*\[[\s\S]*?\];/) || [''])[0];

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

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
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{ slug:'g2_korean', label:'2학년 국어' }, curriculum:window.CURRICULUM_G2_KOR, lessons:window.LESSONS });`);
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
    ok(/소개|인사|말차례|대화|친구/.test(ALL), '③ 소개·대화 서사 흔적 없음');
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

console.log('═══ D. 저작권 가드 + 요소 정합 (증보 전수 검산) ═══');
T('저작권 가드 — 지도서 제재 미노출', () => {
  global.window = { LESSONS: {} };
  delete require.cache[require.resolve(path.join(TDIR, 'data/g2_korean_u1.js'))];
  require(path.join(TDIR, 'data/g2_korean_u1.js'));
  const L = global.window.LESSONS;
  const BANNED_SRC = ['용기를 내', '비닐장갑'];
  const bad = [];
  Object.keys(L).filter(k => k.startsWith('u1_')).forEach(k => {
    L[k].slides.forEach(s => {
      if (!['leveled_problem', 'exit_ticket', 'review', 'offline_activity'].includes(s.block)) return;
      const txt = JSON.stringify(s.data);
      BANNED_SRC.forEach(t => { if (txt.includes(t)) bad.push(k + ':' + t); });
    });
  });
  ok(bad.length === 0, '지도서 제재 노출: ' + bad.join(','));
});
T('활동 층 라벨(읽기·쓰기·말하기) 전 차시 정합', () => {
  global.window = { LESSONS: {} };
  delete require.cache[require.resolve(path.join(TDIR, 'data/g2_korean_u1.js'))];
  require(path.join(TDIR, 'data/g2_korean_u1.js'));
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
  global.window = { LESSONS: {} };
  delete require.cache[require.resolve(path.join(TDIR, 'data/g2_korean_u1.js'))];
  require(path.join(TDIR, 'data/g2_korean_u1.js'));
  const L = global.window.LESSONS;
  const bad = Object.keys(L).filter(k => k.startsWith('u1_')).filter(k => !L[k].slides.some(s => s.block === 'offline_activity'));
  ok(bad.length === 0, 'offline 누락: ' + bad.join(','));
});
T('review 존재(l01 제외 13차시)·exit 전 차시 존재', () => {
  global.window = { LESSONS: {} };
  delete require.cache[require.resolve(path.join(TDIR, 'data/g2_korean_u1.js'))];
  require(path.join(TDIR, 'data/g2_korean_u1.js'));
  const L = global.window.LESSONS;
  const badRv = Object.keys(L).filter(k => k.startsWith('u1_') && !NO_REVIEW.includes(k)).filter(k => !L[k].slides.some(s => s.block === 'review' && s.data.items));
  const badEx = Object.keys(L).filter(k => k.startsWith('u1_')).filter(k => !L[k].slides.some(s => s.block === 'exit_ticket'));
  ok(badRv.length === 0, 'review 누락: ' + badRv.join(','));
  ok(badEx.length === 0, 'exit 누락: ' + badEx.join(','));
});

console.log('═══ E. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const words = ['박음', '빵꾸', '갈아엎', '결로'];
  const bad = words.filter(w => new RegExp('(?<![가-힣])' + w).test(DATA));
  ok(bad.length === 0, '차단 어휘: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
