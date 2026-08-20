/* gate_g3_math_u5.js — g3 수학 u5 「길이와 시간」 신규 제작 게이트 (10차시).
   40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀
   + 근거(단위 환산·시간의 덧셈과 뺄셈) 전수 검산 + 3학년 용어·선행 가드 + 시간/길이 정규화 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_math_u5.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_math_u5.js'), 'utf8');
/* 용어 가드(E)는 본문만 대상 — 파일 머리 주석에는 규약 설명을 위해 금지어 목록 자체가 적혀 있으므로
   자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다.
   ⚠️ 신규 게이트 복제 시 이 BODY 슬라이싱을 반드시 포함할 것. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
/* 식 검산은 굵게 표시(**)가 섞여 있어도 잡히도록 별표를 걷어낸 텍스트로 한다. */
const NUMTXT = BODY.replace(/\*/g, '');
const G3HTML = fs.readFileSync(path.join(TDIR, 'g3_math.html'), 'utf8');
const CURRIC_SRC = (G3HTML.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0].replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-math">${extractBody(G3HTML)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  // 엔진이 케이퀴즈 카탈로그를 fetch — jsdom에 없으므로 빈 목록 스텁
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:3,subject:"수학",title:"3학년 1학기 수학",brand:"케이티처",slug:"g3_math"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
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

// 데이터 직접 로드 (node 컨텍스트)
global.window = { LESSONS: {} };
eval(DATA);
const L = global.window.LESSONS;

const N = 10;
const KEYS = Array.from({ length: N }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const NO_OFFLINE = ['u5_l10'];            // 단원 마무리·평가 차시만 제외
const PREVIEW = 'u5_l01';                 // 단원 도입 = 네 걸음 예고 차시

/* 학생 노출 자리 = 슬라이드에서 tnote(교사 몫)를 걷어낸 텍스트.
   환산·양감·60진법 같은 교사 용어는 tnote에만 허용하므로 가드는 이 텍스트로 건다. */
function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT_ALL = KEYS.map(studentText).join('\n');
/* 선행 가드는 next_lesson(다음 차시 예고 자리)을 제외한 본문으로 건다. */
const bodyOf = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson'));

/* ── 시간식 파서 ────────────────────────────────────────────────
   TU = 한 덩어리(3시간·3시·20분·15초). 시각(시)과 걸린 시간(시간) 모두 초 단위로 환산해
   같은 자로 견준다(하루를 넘지 않는 범위에서만 쓴다). */
const TU = '(?:\\d+\\s*시간|\\d+\\s*시|\\d+\\s*분|\\d+\\s*초)';
const TTERM = `(?:${TU}(?:\\s*${TU})*)`;
function tsec(s) {
  let v = 0, m;
  const re = /(\d+)\s*(시간|시|분|초)/g;
  while ((m = re.exec(s)) !== null) v += +m[1] * ({ '시간': 3600, '시': 3600, '분': 60, '초': 1 })[m[2]];
  return v;
}
/* ── 길이식 파서 ──────────────────────────────────────────────── */
const LU = '(?:\\d+\\s*km|\\d+\\s*cm|\\d+\\s*mm|\\d+\\s*m)\\b';
const LTERM = `(?:${LU}(?:\\s*${LU})*)`;
function lmm(s) {
  let v = 0, m;
  const re = /(\d+)\s*(km|cm|mm|m)\b/g;
  while ((m = re.exec(s)) !== null) v += +m[1] * ({ 'mm': 1, 'cm': 10, 'm': 1000, 'km': 1000000 })[m[2]];
  return v;
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u5 10차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u5_'));
  ok(keys.length === N, 'u5 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u5_l01~l10', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u5_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= N; n++) {
  const key = 'u5_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 5, n);
    ok(!/교구 로드 오류|undefined<\/|NaN/.test(ALL), '렌더 오류');
    ok(!/내용을 추가하세요/.test(ALL), '폴백(빈 내용) 렌더 잔존');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (n !== 1) ok(/kt-rv/.test(ALL), '① review items 미렌더');   // l01 = 단원 첫 차시
    if (!NO_OFFLINE.includes(key)) ok(/kt-oa-steps/.test(ALL) && /kt-oa-timer/.test(ALL), '④ offline 미렌더');
    ok(/곰이|펭이/.test(ALL), '③ 서사 인물 없음');
  });
}

console.log('═══ C. 회귀 (openShow 무손상) ═══');
for (let n = 1; n <= N; n++) {
  T('회귀 u5_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('5', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 근거 정합 (학생 본차시 검증 값 계승 · 환산/시간 검산) ═══');
T('기본문제 정답 = 본차시 계승 값', () => {
  const FACTS = {
    'u5_l01:s09': '100 cm',       'u5_l01:s10': '60분',        'u5_l01:s11': 'm',
    'u5_l02:s08': '10 mm',        'u5_l02:s09': '67 mm',       'u5_l02:s10': '7 cm 1 mm',
    'u5_l03:s08': '약 6 cm',      'u5_l03:s09': '약 15 cm',    'u5_l03:s10': '약 10 cm',
    'u5_l04:s08': '1000 m',       'u5_l04:s09': '1300 m',      'u5_l04:s10': '3 km 750 m',
    'u5_l05:s08': '약 1 km',      'u5_l05:s09': '약 1 km 500 m', 'u5_l05:s10': 'm',
    'u5_l06:s08': '60초',         'u5_l06:s09': '90초',        'u5_l06:s10': '3분 5초',
    'u5_l07:s08': '10시 31분 50초', 'u5_l07:s09': '1분 10초',  'u5_l07:s10': '2시간 10분',
    'u5_l08:s08': '2시간 30분',   'u5_l08:s09': '30초',        'u5_l08:s10': '1시간 40분',
    'u5_l09:s08': '3시 20분 15초', 'u5_l09:s09': '45분',       'u5_l09:s10': '태민',
    'u5_l10:s08': '8 cm 5 mm',    'u5_l10:s09': '150초',       'u5_l10:s10': '3070 m', 'u5_l10:s11': '3시 15분'
  };
  const bad = [];
  Object.keys(FACTS).forEach(ref => {
    const [k, sid] = ref.split(':');
    const s = L[k].slides.find(x => x.id === sid);
    if (!s) { bad.push(ref + ' 슬라이드 없음'); return; }
    if (String(s.data.answer) !== FACTS[ref]) bad.push(ref + '=' + s.data.answer + '(기대 ' + FACTS[ref] + ')');
  });
  ok(bad.length === 0, bad.join(' / '));
});
T('차시별 필수 사실 실존 (본차시 계승)', () => {
  const NEED = {
    'u5_l01': ['1 m = 100 cm', '1시간 = 60분', '24시간', '새 단위', '알맞은 단위'],
    'u5_l02': ['1 cm = 10 mm', '8 cm 3 mm = 83 mm', '2 cm 5 mm = 25 mm', '47 mm = 4 cm 7 mm', '밀리미터', '10칸'],
    'u5_l03': ['어림', '엄지', '15 cm 5 mm', '이어 붙여', '짐작'],
    'u5_l04': ['1 km = 1000 m', '1 km 300 m = 1300 m', '3750 m = 3 km 750 m', '6 km 927 m = 6927 m', '킬로미터', '표지판'],
    'u5_l05': ['단위 거리', '약 1 km 500 m', '1950 m', '460 km', '20바퀴'],
    'u5_l06': ['초바늘', '1분 = 60초', '4시 10분 30초', '2분 = 120초', '185초 = 3분 5초', '60칸', '5초'],
    'u5_l07': ['10시 20분 25초 + 11분 25초 = 10시 31분 50초', '받아올림', '50초 + 30초 = 1분 20초',
               '3시 20분 + 30분 = 3시 50분', '시작 시각 + 걸린 시간 = 끝난 시각'],
    'u5_l08': ['받아내림', '3시간 50분 − 1시간 20분 = 2시간 30분', '1분 10초 − 40초 = 30초',
               '끝난 시각 − 시작 시각 = 걸린 시간', '4시 − 1시 = 3시간', '빌려'],
    'u5_l09': ['220 mm', '3시 20분 15초', '50분 15초', '태민', '단서'],
    'u5_l10': ['1 cm = 10 mm', '1 km = 1000 m', '1분 = 60초', '1시간 = 60분', '받아올림', '받아내림']
  };
  const bad = [];
  Object.keys(NEED).forEach(k => {
    const src = plain(L[k].slides);
    NEED[k].forEach(v => { if (src.indexOf(v) < 0) bad.push(k + '→' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(' / '));
});
T('시간의 덧셈·뺄셈 식 전수 검산 (초 단위로 환산해 일치)', () => {
  const re = new RegExp(`(${TTERM})\\s*([+\\-−])\\s*(${TTERM})\\s*=\\s*(${TTERM})`, 'g');
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    const a = tsec(m[1]), b = tsec(m[3]), c = tsec(m[4]);
    const got = (m[2] === '+') ? a + b : a - b;
    cnt++;
    if (got !== c) bad.push(m[0].trim() + '(실제 ' + got + '초)');
  }
  ok(cnt >= 20, '시간 계산식이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 식(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · 시간 계산식 ' + cnt + '건 전수 일치');
});
T('시간 환산식 전수 검산 (1분 = 60초 · 185초 = 3분 5초 …)', () => {
  /* 덧셈·뺄셈식 안의 우변을 다시 환산식으로 잡으면 오탐이므로 먼저 지운 사본으로 검사한다. */
  const eq = new RegExp(`(${TTERM})\\s*([+\\-−])\\s*(${TTERM})\\s*=\\s*(${TTERM})`, 'g');
  const work = NUMTXT.replace(eq, (s) => ' '.repeat(s.length));
  const re = new RegExp(`(${TTERM})\\s*=\\s*(${TTERM})`, 'g');
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(work)) !== null) {
    cnt++;
    if (tsec(m[1]) !== tsec(m[2])) bad.push(m[0].trim());
  }
  ok(cnt >= 12, '시간 환산식이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 환산(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · 시간 환산식 ' + cnt + '건 전수 일치');
});
T('길이 환산식 전수 검산 (mm 단위로 환산해 일치)', () => {
  const re = new RegExp(`(${LTERM})\\s*=\\s*(${LTERM})`, 'g');
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    cnt++;
    if (lmm(m[1]) !== lmm(m[2])) bad.push(m[0].trim());
  }
  ok(cnt >= 20, '길이 환산식이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 환산(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · 길이 환산식 ' + cnt + '건 전수 일치');
});
T('시간·길이 정규화 가드 (학생 노출 자리에 60↑ 분·초, 10↑ mm, 1000↑ m 없음)', () => {
  /* ⚠️ 이 단원의 핵심 규약. 2분 80초·9시간 27분 80초 같은 표기는 답 자리에 남기지 않는다.
     오개념 자리(misconception.wrong)는 잘못된 표기를 일부러 보여 주는 곳이라 제외한다.
     tnote(교사 몫)와 extras(교사용 자료 카드)도 학생 노출 자리가 아니므로 제외한다. */
  const src = KEYS.map(k => {
    const s = L[k].slides.map(x => {
      const c = JSON.parse(JSON.stringify(x));
      delete c.tnote;
      if (c.block === 'misconception' && c.data) delete c.data.wrong;
      return c;
    });
    return plain(s);
  }).join('\n');
  const bad = [];
  let m;
  const r1 = /(\d+)\s*시간\s*(\d+)\s*분/g;
  while ((m = r1.exec(src)) !== null) if (+m[2] >= 60) bad.push(m[0]);
  const r2 = /(\d+)\s*시\s*(\d+)\s*분/g;
  while ((m = r2.exec(src)) !== null) if (+m[2] >= 60) bad.push(m[0]);
  const r3 = /(\d+)\s*분\s*(\d+)\s*초/g;
  while ((m = r3.exec(src)) !== null) if (+m[2] >= 60) bad.push(m[0]);
  const r4 = /(\d+)\s*cm\s*(\d+)\s*mm/g;
  while ((m = r4.exec(src)) !== null) if (+m[2] >= 10) bad.push(m[0]);
  const r5 = /(\d+)\s*km\s*(\d+)\s*m\b/g;
  while ((m = r5.exec(src)) !== null) if (+m[2] >= 1000) bad.push(m[0]);
  ok(bad.length === 0, '정규화 안 된 표기: ' + bad.slice(0, 8).join(' / '));
});
T('오개념 자리의 틀린 값은 등호로 쓰지 않는다', () => {
  /* 잘못된 답을 등호로 적으면 위 검산이 먼저 깨진다 → 규약을 기계로 못 박는다.
     틀린 값은 "답을 2분 80초라고 쓴다"처럼 등호 없이 서술한다.
     ⚠️ 맞는 식을 인용하는 등호는 허용 — 여기서 거르는 것은 틀린 등호뿐이다. */
  const bad = [];
  const teq = new RegExp(`(${TTERM})\\s*([+\\-−])\\s*(${TTERM})\\s*=\\s*(${TTERM})`, 'g');
  const tcv = new RegExp(`(${TTERM})\\s*=\\s*(${TTERM})`, 'g');
  const lcv = new RegExp(`(${LTERM})\\s*=\\s*(${LTERM})`, 'g');
  KEYS.forEach(k => {
    const mc = L[k].slides.find(s => s.block === 'misconception');
    if (!mc) return;
    const w = String(mc.data.wrong || '').replace(/\*/g, '');
    let m; teq.lastIndex = 0; tcv.lastIndex = 0; lcv.lastIndex = 0;
    while ((m = teq.exec(w)) !== null) {
      const got = (m[2] === '+') ? tsec(m[1]) + tsec(m[3]) : tsec(m[1]) - tsec(m[3]);
      if (got !== tsec(m[4])) bad.push(k + ':wrong에 틀린 시간식 ' + m[0]);
    }
    const rest = w.replace(teq, (s) => ' '.repeat(s.length));
    while ((m = tcv.exec(rest)) !== null) if (tsec(m[1]) !== tsec(m[2])) bad.push(k + ':wrong에 틀린 시간 환산 ' + m[0]);
    while ((m = lcv.exec(w)) !== null) if (lmm(m[1]) !== lmm(m[2])) bad.push(k + ':wrong에 틀린 길이 환산 ' + m[0]);
  });
  ok(bad.length === 0, bad.join(','));
});
T('leveled 정답 = 계승 값', () => {
  const WANT = {
    'u5_l01': ['100 cm', '300 cm'],
    'u5_l02': ['46 mm', '9 cm 3 mm'],
    'u5_l03': ['약 9 cm', '약 15 cm'],
    'u5_l04': ['2000 m', '4 km 820 m'],
    'u5_l05': ['약 2 km', '약 2 km 500 m'],
    'u5_l06': ['180초', '4분 10초'],
    'u5_l07': ['3시간 30분', '3분 20초'],
    'u5_l08': ['2시간 20분', '40분'],
    'u5_l09': ['40분', '수빈'],
    'u5_l10': ['83 mm', '1시간 55분']
  };
  const bad = [];
  Object.keys(WANT).forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    const src = plain(lv.data.levels);
    WANT[k].forEach(v => { if (src.indexOf(v) < 0) bad.push(k + '→' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(','));
});
T('차시별 오개념 실존 (단원 오답 계보)', () => {
  const need = {
    'u5_l01': /알맞은 단위|무엇이든/,
    'u5_l02': /83 cm|이어 붙/,
    'u5_l03': /220 cm|신발/,
    'u5_l04': /263 m|이어 붙/,
    'u5_l05': /1950 km|큰 단위/,
    'u5_l06': /125초|100초/,
    'u5_l07': /2분 80초|60을 넘/,
    'u5_l08': /5시간|세고/,
    'u5_l09': /단서 하나|수빈/,
    'u5_l10': /뒤집어|받아내림/
  };
  const bad = [];
  Object.keys(need).forEach(k => {
    const mc = L[k].slides.find(s => s.block === 'misconception');
    if (!mc) { bad.push(k + ':misconception 없음'); return; }
    if (!need[k].test(JSON.stringify(mc.data))) bad.push(k + ':오개념 내용 불일치');
  });
  ok(bad.length === 0, bad.join(','));
});

console.log('═══ E. 3학년 용어 가드 · 선행 노출 가드 ═══');
T('미도입 갈래 노출 0 (뒤 단원·뒤 학기 소관)', () => {
  /* ⚠️ u1~u4에서 금지였던 길이 단위(mm·km·밀리미터·킬로미터)는 이 단원의 정식 도입 대상이라 제외한다.
     대신 6단원 소관인 분수·소수와 3-2 소관인 무게 등을 막는다. */
  const banned = ['분수', '소수', '약수', '배수', '무게', '넓이', '둘레', '부피', '각도'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '미도입 갈래 노출: ' + bad.join(','));
});
T('학생 노출 자리 어려운 용어 0 (교사 용어는 tnote에만)', () => {
  const banned = ['환산', '양감', '60진법', '십진법', '유효숫자', '오차', '근사값', '측정값', '단위계', '알고리즘'];
  const bad = banned.filter(x => STUDENT_ALL.indexOf(x) >= 0);
  ok(bad.length === 0, '학생 노출 어려운 용어: ' + bad.join(','));
});
T('교사 용어(60진법·양감)는 tnote에 실존 = 의도적 배치', () => {
  const tn = KEYS.map(k => plain(L[k].slides.map(s => s.tnote || null))).join('\n');
  ok(tn.indexOf('60진법') >= 0 && tn.indexOf('양감') >= 0, 'tnote에 교사 용어 없음');
});
T("'어림' 선행 노출 0 (l01·l02 · next_lesson 제외)", () => {
  const bad = ['u5_l01', 'u5_l02'].filter(k => /어림/.test(bodyOf(k)));
  ok(bad.length === 0, "'어림' 선행 노출: " + bad.join(','));
});
T("'km' 선행 노출 0 (l02·l03 · l01 예고·next_lesson 제외)", () => {
  const bad = ['u5_l02', 'u5_l03'].filter(k => /\bkm\b|킬로미터/.test(bodyOf(k)));
  ok(bad.length === 0, "'km' 선행 노출: " + bad.join(','));
});
T("'초' 선행 노출 0 (l02~l05 · l01 예고·next_lesson 제외)", () => {
  /* ⚠️ '초'는 초등·초록·기초처럼 흔한 글자라 단독 검사는 오탐 천지다.
     수와 붙은 자리(3초)와 초바늘로만 잡는다. */
  const bad = ['u5_l02', 'u5_l03', 'u5_l04', 'u5_l05'].filter(k => /\d\s*초|초바늘/.test(bodyOf(k)));
  ok(bad.length === 0, "'초' 선행 노출: " + bad.join(','));
});
T("'받아올림' 선행 노출 0 (l01~l06 · next_lesson 제외)", () => {
  const bad = KEYS.slice(0, 6).filter(k => /받아올림/.test(bodyOf(k)));
  ok(bad.length === 0, "'받아올림' 선행 노출: " + bad.join(','));
});
T("'받아내림' 선행 노출 0 (l01~l07 · next_lesson 제외)", () => {
  const bad = KEYS.slice(0, 7).filter(k => /받아내림/.test(bodyOf(k)));
  ok(bad.length === 0, "'받아내림' 선행 노출: " + bad.join(','));
});
T('차시 제목에 선행 용어 없음 (데이터 meta.title · CURRICULUM 양쪽)', () => {
  const W2 = boot();
  const u5 = W2.CURRICULUM.find(u => u.unit === 5);
  const title = (i) => [L[KEYS[i]].meta.title, u5.lessons[i].title];
  const bad = [];
  [0, 1].forEach(i => title(i).forEach(t => { if (/어림/.test(t)) bad.push('l' + (i + 1) + ' 제목에 어림'); }));
  [1, 2].forEach(i => title(i).forEach(t => { if (/\bkm\b|킬로미터/.test(t)) bad.push('l' + (i + 1) + ' 제목에 km'); }));
  [1, 2, 3, 4].forEach(i => title(i).forEach(t => { if (/\d\s*초|초바늘/.test(t)) bad.push('l' + (i + 1) + ' 제목에 초'); }));
  [0, 1, 2, 3, 4, 5].forEach(i => title(i).forEach(t => { if (/받아올림/.test(t)) bad.push('l' + (i + 1) + ' 제목에 받아올림'); }));
  ok(bad.length === 0, bad.join(','));
});
T('l01 = 단원 예고 차시 = 네 걸음 이름 실존', () => {
  const src = plain(L[PREVIEW].slides);
  ['cm보다 작은 단위', 'm보다 큰 단위', '분보다 작은 단위', '시간의 덧셈과 뺄셈'].forEach(v => ok(src.indexOf(v) >= 0, 'l01 예고 누락: ' + v));
});
T('도입 차시(l02~l09)에 해당 개념 실존', () => {
  ok(/1 cm = 10 mm/.test(plain(L['u5_l02'].slides)), 'l02 1 cm = 10 mm 없음');
  ok(/어림/.test(plain(L['u5_l03'].slides)), 'l03 어림 없음');
  ok(/1 km = 1000 m/.test(plain(L['u5_l04'].slides)), 'l04 1 km = 1000 m 없음');
  ok(/단위 거리/.test(plain(L['u5_l05'].slides)), 'l05 단위 거리 없음');
  ok(/초바늘/.test(plain(L['u5_l06'].slides)), 'l06 초바늘 없음');
  ok(/받아올림/.test(plain(L['u5_l07'].slides)), 'l07 받아올림 없음');
  ok(/받아내림/.test(plain(L['u5_l08'].slides)), 'l08 받아내림 없음');
  ok(/단서/.test(plain(L['u5_l09'].slides)), 'l09 단서 없음');
});

console.log('═══ F. 구조 정합 ═══');
T('전 차시 슬라이드 18~19슬 · extras 20~24', () => {
  const bad = [];
  KEYS.forEach(k => {
    const n = L[k].slides.length, e = L[k].extras.length;
    if (n < 18 || n > 19) bad.push(k + ':슬' + n);
    if (e < 20 || e > 24) bad.push(k + ':extras' + e);
  });
  ok(bad.length === 0, bad.join(','));
});
T('전 차시 tnote 6슬 이상 (⑦)', () => {
  const bad = KEYS.filter(k => L[k].slides.filter(s => s.tnote).length < 6)
    .map(k => k + ':' + L[k].slides.filter(s => s.tnote).length);
  ok(bad.length === 0, bad.join(','));
});
T('전 차시 img 폴백 1개 이상 (②)', () => {
  const bad = KEYS.filter(k => !L[k].slides.some(s => s.data && s.data.img));
  ok(bad.length === 0, bad.join(','));
});
T('review from 계보 정합 (①)', () => {
  const bad = [];
  KEYS.forEach((k, i) => {
    if (i === 0) return;
    const rv = L[k].slides.find(s => s.block === 'review');
    if (!rv || !rv.data.items || rv.data.items.length < 3 || rv.data.from !== KEYS[i - 1]) bad.push(k);
  });
  ok(bad.length === 0, bad.join(','));
});
T('l01 = review 블록 없음 (단원 첫 차시)', () => {
  ok(!L['u5_l01'].slides.some(s => s.block === 'review'), 'l01에 review 존재');
});
T('review items = 직전 차시 exit 문항 q·a 계승', () => {
  const bad = [];
  KEYS.forEach((k, i) => {
    if (i === 0) return;
    const prev = KEYS[i - 1];
    const et = L[prev].slides.find(s => s.block === 'exit_ticket');
    const rv = L[k].slides.find(s => s.block === 'review');
    const etq = (et.data.items || []).map(x => x.q + '§' + x.a).join('|');
    const rvq = (rv.data.items || []).map(x => x.q + '§' + x.a).join('|');
    if (etq !== rvq) bad.push(k + ' ← ' + prev);
  });
  ok(bad.length === 0, '계승 불일치: ' + bad.join(','));
});
T('offline 9차시 (l10 마무리 제외) · 필수 필드', () => {
  const bad = [];
  KEYS.forEach(k => {
    const oa = L[k].slides.find(s => s.block === 'offline_activity');
    if (NO_OFFLINE.includes(k)) { if (oa) bad.push(k + ':마무리차시에 offline'); return; }
    if (!oa) { bad.push(k + ':offline없음'); return; }
    const d = oa.data;
    if (!d.type || !d.goal || !Array.isArray(d.steps) || !d.steps.length || !Array.isArray(d.materials) || !d.minutes) bad.push(k + ':offline 필드');
  });
  ok(bad.length === 0, bad.join(','));
});
T('4단계 이상 등장 · 정리에 exit·summary·next_lesson·self', () => {
  const bad = [];
  KEYS.forEach(k => {
    const S = L[k].slides;
    const stages = [...new Set(S.map(s => s.stage))];
    if (stages.length < 4) bad.push(k + ':단계' + stages.length);
    ['exit_ticket', 'summary', 'next_lesson', 'self_assessment', 'cover'].forEach(b => {
      if (!S.some(s => s.block === b)) bad.push(k + ':' + b + '없음');
    });
  });
  ok(bad.length === 0, bad.join(','));
});
T('슬라이드 id 0패딩 연속 (s01~)', () => {
  const bad = [];
  KEYS.forEach(k => {
    L[k].slides.forEach((s, i) => {
      const want = 's' + String(i + 1).padStart(2, '0');
      if (s.id !== want) bad.push(k + ':' + s.id + '(기대 ' + want + ')');
    });
  });
  ok(bad.length === 0, bad.join(','));
});
T('extras 참조 무결성 (suggested_extras → extras 실존)', () => {
  const bad = [];
  KEYS.forEach(k => {
    const ids = new Set(L[k].extras.map(e => e.id));
    L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => {
      if (!ids.has(id)) bad.push(k + ':' + s.id + '→' + id);
    }));
  });
  ok(bad.length === 0, bad.join(','));
});
T('extras 필수 필드 · id 중복 0', () => {
  const bad = [];
  KEYS.forEach(k => {
    const seen = new Set();
    L[k].extras.forEach(e => {
      if (!e.id || !e.type || !e.icon || !e.title) bad.push(k + ':' + (e.id || '?') + ' 필드누락');
      if (!e.content && !e.url) bad.push(k + ':' + e.id + ' 본문없음');
      if (!Array.isArray(e.fit_slides) || !e.fit_slides.length) bad.push(k + ':' + e.id + ' fit_slides');
      if (seen.has(e.id)) bad.push(k + ':' + e.id + ' 중복'); seen.add(e.id);
    });
  });
  ok(bad.length === 0, bad.join(','));
});
T('leveled 3수준 + 심화 open · exit 확인3+신호등3', () => {
  const bad = [];
  KEYS.forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    if (!lv) { bad.push(k + ':leveled없음'); return; }
    const lk = Object.keys(lv.data.levels || {});
    if (JSON.stringify(lk) !== JSON.stringify(['기본', '도전', '심화'])) bad.push(k + ':수준' + lk.join('/'));
    if (!lv.data.levels['심화'].open) bad.push(k + ':심화 open아님');
    const et = L[k].slides.find(s => s.block === 'exit_ticket');
    if (!et || (et.data.items || []).length !== 3 || (et.data.self || []).length !== 3) bad.push(k + ':exit 구성');
  });
  ok(bad.length === 0, bad.join(','));
});
T('meta 정합 (grade·unit·n·theme·std·duration·live_url)', () => {
  const bad = [];
  KEYS.forEach((k, i) => {
    const m = L[k].meta;
    if (m.grade !== 3 || m.subject !== '수학' || m.unit !== 5 || m.n !== i + 1) bad.push(k + ':meta');
    if (!/수목원 환경 지킴이/.test(m.theme || '')) bad.push(k + ':theme');
    if (!/4수03-0/.test(m.std || '')) bad.push(k + ':std');
    if (m.duration_min !== 40) bad.push(k + ':duration');
    if (!/grade3\/semester1\/math\/5단원/.test(m.live_url || '')) bad.push(k + ':live_url');
  });
  ok(bad.length === 0, bad.join(','));
});
T('CURRICULUM u5 ↔ LESSONS 정합 (10차시 ready)', () => {
  const W2 = boot();
  const u5 = W2.CURRICULUM.find(u => u.unit === 5);
  ok(u5 && u5.lesson_count === 10, 'lesson_count');
  ok(u5.lessons.length === 10 && u5.lessons.every(l => l.ready), 'ready 플래그');
  u5.lessons.forEach((l, i) => {
    const m = L['u5_l' + String(i + 1).padStart(2, '0')].meta;
    ok(l.title === m.title, 'title 불일치 l' + (i + 1) + ': ' + l.title + ' / ' + m.title);
  });
});
T('CURRICULUM u1·u2·u3·u4 회귀 (9·8·8·8차시 ready 무손상)', () => {
  const W2 = boot();
  const want = { 1: 9, 2: 8, 3: 8, 4: 8 };
  Object.keys(want).forEach(u => {
    const c = W2.CURRICULUM.find(x => x.unit === +u);
    ok(c && c.lesson_count === want[u] && c.lessons.length === want[u] && c.lessons.every(l => l.ready), 'u' + u + ' 손상');
  });
});
T('허브 index.html "3_math" 등재 정합 (units 5 · lessons 43)', () => {
  const hub = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
  const m = hub.match(/"3_math":\s*\{\s*file:\s*"g3_math\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '"3_math" 미등재');
  ok(+m[1] === 5 && +m[2] === 43, '허브 카운트 ' + m[1] + '/' + m[2]);
});
T('g3_math.html 배선 정합 (v3 3요소 · 데이터 · slug)', () => {
  ok(/teacher-v3\.css/.test(G3HTML), 'v3 css 미배선');
  ok(/<body class="kt3 subj-math">/.test(G3HTML), 'body kt3 없음');
  ok(/theme=classic/.test(G3HTML), 'classic 롤백 스니펫 없음');
  for (let u = 1; u <= 5; u++) {
    ok(new RegExp('<script src="data/g3_math_u' + u + '\\.js"></script>').test(G3HTML), 'u' + u + ' 데이터 미배선');
  }
  ok(/slug:\s*"g3_math"/.test(G3HTML), 'slug 불일치');
  ok(!/g2_math/.test(G3HTML), 'g2 잔재 존재');
});
T('케이랩 u5 매핑 없음 = 의도적 (자·모형 시계 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_math_klab.js')), 'g3 klab 매핑 파일이 생겼다 — 헤더 규약 재검토 필요');
  ok(!KEYS.some(k => L[k].slides.some(s => s.block === 'klab')), '데이터에 klab 블록 존재');
});

console.log('═══ G. 차단 어휘 ═══');
T('u5 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
