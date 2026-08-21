/* gate_g3_math_u6.js — g3 수학 u6 「분수와 소수」 신규 제작 게이트 (11차시).
   40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀
   + 근거(분수 사실·분수↔소수·크기 비교) 전수 검산 + 3학년 용어·선행 가드 + 소수 한 자리 정규화 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_math_u6.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_math_u6.js'), 'utf8');
/* 용어 가드(E)는 본문만 대상 — 파일 머리 주석에는 규약 설명을 위해 금지어 목록 자체가 적혀 있으므로
   자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다.
   ⚠️ 신규 게이트 복제 시 이 BODY 슬라이싱을 반드시 포함할 것 (u1~u5 선례 계승). */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
/* 사실 검산은 굵게 표시(**)가 섞여 있어도 잡히도록 별표를 걷어낸 텍스트로 한다. */
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

const N = 11;
const KEYS = Array.from({ length: N }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const NO_OFFLINE = ['u6_l11'];            // 단원 마무리·평가 차시만 제외
const PREVIEW = 'u6_l01';                 // 단원 도입 = 예고 차시

/* 학생 노출 자리 = 슬라이드에서 tnote(교사 몫)를 걷어낸 텍스트.
   등분할·진분수·십진법 같은 교사 용어는 tnote에만 허용하므로 가드는 이 텍스트로 건다. */
function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT_ALL = KEYS.map(studentText).join('\n');
/* 선행 가드는 next_lesson(다음 차시 예고 대목)을 제외한 본문으로 건다. */
const bodyOf = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson'));
/* 소수 정규화 가드는 misconception.wrong(틀린 표기를 보여 주는 대목)을 제외한다.
   u4·u5의 "틀린 값은 등호로 쓰지 않는다" 규약과 짝을 이룬다. */
function normText(k) {
  const s = L[k].slides.filter(x => x.block !== 'misconception')
    .map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u6 11차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u6_'));
  ok(keys.length === N, 'u6 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u6_l01~l11', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u6_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= N; n++) {
  const key = 'u6_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 6, n);
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
  T('회귀 u6_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('6', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 근거 정합 (학생 본차시 검증 값 계승 · 분수/소수 전수 검산) ═══');
T('기본문제 정답 = 본차시 계승 값', () => {
  const FACTS = {
    'u6_l01:s09': '넷으로 똑같이 나눈 도형', 'u6_l01:s10': '1보다 작아요', 'u6_l01:s11': '분수와 소수',
    'u6_l02:s08': '넷',           'u6_l02:s09': '처음 전체',   'u6_l02:s10': '서로 같아요',
    'u6_l03:s08': '4분의 3',      'u6_l03:s09': '오분의 삼',   'u6_l03:s10': '6분의 1',
    'u6_l04:s08': '4분의 1',      'u6_l04:s09': '5분의 3',     'u6_l04:s10': '4개',
    'u6_l05:s08': '5분의 4',      'u6_l05:s09': '3개',         'u6_l05:s10': '6분의 5',
    'u6_l06:s08': '2분의 1',      'u6_l06:s09': '4분의 1',     'u6_l06:s10': '분모가 작을수록 큰 분수예요',
    'u6_l07:s08': '1',            'u6_l07:s09': '10분의 3',    'u6_l07:s10': '10',
    'u6_l08:s08': '0.1',          'u6_l08:s09': '7개',         'u6_l08:s10': '영 점 육',
    'u6_l09:s08': '0.6',          'u6_l09:s09': '3개',         'u6_l09:s10': '0.7',
    'u6_l10:s08': '다를 수 있어요', 'u6_l10:s09': '전체',      'u6_l10:s10': '4개',
    'u6_l11:s08': '4분의 3',      'u6_l11:s09': '6분의 1',     'u6_l11:s10': '5분의 4', 'u6_l11:s11': '3분의 1'
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
T('leveled 정답 = 본차시 계승 값', () => {
  const LV = {
    'u6_l03': { 기본: '2개', 도전: '8분의 5' },
    'u6_l04': { 기본: '2개', 도전: '3개' },
    'u6_l05': { 기본: '도윤', 도전: '10분의 7 > 10분의 3' },
    'u6_l06': { 기본: '3분의 1', 도전: '7분의 1 > 9분의 1' },
    'u6_l07': { 기본: '7개', 도전: '100' },
    'u6_l08': { 기본: '0.7', 도전: '1' },
    'u6_l09': { 기본: '0.9', 도전: '0.2 < 0.5' },
    'u6_l10': { 기본: '1개', 도전: '2개' },
    'u6_l11': { 기본: '0.7', 도전: '0.9' }
  };
  const bad = [];
  Object.keys(LV).forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    Object.keys(LV[k]).forEach(lev => {
      const got = lv.data.levels[lev].a;
      if (got !== LV[k][lev]) bad.push(k + ':' + lev + '=' + got + '(기대 ' + LV[k][lev] + ')');
    });
  });
  ok(bad.length === 0, bad.join(' / '));
});
T('차시별 필수 사실 실존 (본차시 계승)', () => {
  const NEED = {
    'u6_l01': ['모양과 크기', '1보다 작', '분수', '소수'],
    'u6_l02': ['겹쳐', '다시 모으', '모양과 크기가 같게'],
    'u6_l03': ['분모', '분자', '단위분수', '4분의 3'],
    'u6_l04': ['남은 부분', '분모만큼', '전체'],
    'u6_l05': ['분자가 클수록', '단위분수', '크기가 같은 전체'],
    'u6_l06': ['분모가 클수록', '수직선', '한 칸'],
    'u6_l07': ['10분의 1', '10개', '자리'],
    'u6_l08': ['소수점', '0.1', '영 점 일'],
    'u6_l09': ['0.1의 개수', '수직선', '10분의'],
    'u6_l10': ['전체', '분모만큼', '크기가 달라'],
    'u6_l11': ['분모가 같', '단위분수', '소수']
  };
  const bad = [];
  Object.keys(NEED).forEach(k => {
    const src = plain(L[k].slides);
    NEED[k].forEach(v => { if (src.indexOf(v) < 0) bad.push(k + ':' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(' / '));
});
T('단위분수 개수 전수 검산 (N분의 M = N분의 1이 M개)', () => {
  const re = /(\d+)분의 (\d+)[은는] \1분의 1이 (\d+)개/g;
  let m, cnt = 0; const bad = [];
  while ((m = re.exec(NUMTXT)) !== null) {
    cnt++;
    if (+m[2] !== +m[3]) bad.push(m[0]);
  }
  ok(cnt >= 6, '단위분수 개수 문장이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 개수(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
});
T('분수 부등호 전수 검산 (분모 같음 / 단위분수)', () => {
  const re = /(\d+)분의 (\d+)\s*([<>])\s*(\d+)분의 (\d+)/g;
  let m, cnt = 0; const bad = [];
  while ((m = re.exec(NUMTXT)) !== null) {
    const [d1, n1, sign, d2, n2] = [+m[1], +m[2], m[3], +m[4], +m[5]];
    let want = null;
    if (d1 === d2) want = n1 > n2 ? '>' : (n1 < n2 ? '<' : '=');
    else if (n1 === 1 && n2 === 1) want = d1 < d2 ? '>' : (d1 > d2 ? '<' : '=');   // 단위분수는 분모가 클수록 작다
    if (want === null) { bad.push('견줄 수 없는 짝: ' + m[0]); continue; }
    cnt++;
    if (want !== sign) bad.push(m[0] + '(기대 ' + want + ')');
  }
  ok(cnt >= 6, '분수 부등호가 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 비교(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
});
T('분수 → 소수 변환 전수 검산 (10분의 N = 0.N)', () => {
  const re = /10분의 (\d)\s*=\s*0\.(\d)/g;
  const re2 = /0\.(\d)\s*=\s*10분의 (\d)/g;
  let m, cnt = 0; const bad = [];
  while ((m = re.exec(NUMTXT)) !== null) { cnt++; if (m[1] !== m[2]) bad.push(m[0]); }
  while ((m = re2.exec(NUMTXT)) !== null) { cnt++; if (m[1] !== m[2]) bad.push(m[0]); }
  ok(cnt >= 4, '분수↔소수 변환식이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 변환(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
});
T('소수 개수 전수 검산 (0.N = 0.1이 N개)', () => {
  const re = /0\.(\d)[은는] 0\.1이 (\d+)개/g;
  let m, cnt = 0; const bad = [];
  while ((m = re.exec(NUMTXT)) !== null) { cnt++; if (+m[1] !== +m[2]) bad.push(m[0]); }
  ok(cnt >= 3, '소수 개수 문장이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 개수(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
});
T('소수 부등호 전수 검산', () => {
  const re = /0\.(\d)\s*([<>])\s*0\.(\d)/g;
  let m, cnt = 0; const bad = [];
  while ((m = re.exec(NUMTXT)) !== null) {
    cnt++;
    const want = +m[1] > +m[3] ? '>' : (+m[1] < +m[3] ? '<' : '=');
    if (want !== m[2]) bad.push(m[0] + '(기대 ' + want + ')');
  }
  ok(cnt >= 3, '소수 부등호가 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 비교(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
});
T('소수 한 자리 정규화 가드 (0.1~0.9만 · 오개념 wrong 제외)', () => {
  const bad = [];
  KEYS.forEach(k => {
    const re = /\d*\.\d+/g;
    let m;
    const src = normText(k).replace(/\*/g, '');
    while ((m = re.exec(src)) !== null) {
      if (!/^0\.[1-9]$/.test(m[0])) bad.push(k + ':' + m[0]);
    }
  });
  ok(bad.length === 0, '정규화 안 된 소수 표기: ' + bad.slice(0, 8).join(' / '));
});
T('오개념 wrong에 등호식 0 (틀린 값은 등호로 쓰지 않는다)', () => {
  const bad = [];
  KEYS.forEach(k => {
    L[k].slides.filter(s => s.block === 'misconception').forEach(s => {
      const w = String((s.data && s.data.wrong) || '').replace(/\*/g, '');
      if (/=/.test(w)) bad.push(k + ':' + w.slice(0, 40));
    });
  });
  ok(bad.length === 0, bad.join(' / '));
});
T('오개념 블록 전 차시 실존 · 11종', () => {
  const bad = KEYS.filter(k => !L[k].slides.some(s => s.block === 'misconception'));
  ok(bad.length === 0, '오개념 없음: ' + bad.join(','));
  const kinds = new Set(KEYS.map(k => L[k].slides.find(s => s.block === 'misconception').data.wrong));
  ok(kinds.size === N, '오개념 중복 (' + kinds.size + '종)');
});

console.log('═══ E. 3학년 용어·선행 가드 ═══');
T('미도입 갈래 학생 노출 0', () => {
  const NG = ['가분수', '대분수', '통분', '약분', '기약분수', '약수', '배수', '백분율',
              '자연수', '무게', '넓이', '부피', '각도', '소수 둘째', '소수 첫째'];
  const bad = NG.filter(x => STUDENT_ALL.indexOf(x) >= 0);
  ok(bad.length === 0, '미도입 갈래 노출: ' + bad.join(','));
});
T('학생 노출 어려운 용어 0 (교사 몫은 tnote)', () => {
  const NG = ['등분할', '진분수', '십진법', '연속량', '이산량'];
  const bad = NG.filter(x => STUDENT_ALL.indexOf(x) >= 0);
  ok(bad.length === 0, '학생 노출 어려운 용어: ' + bad.join(','));
});
T('tnote에 교사 용어 실존 (등분할·진분수·십진법)', () => {
  const tn = KEYS.map(k => JSON.stringify(L[k].slides.map(s => s.tnote || null))).join('\n');
  ['등분할', '진분수', '십진법'].forEach(v => ok(tn.indexOf(v) >= 0, 'tnote에 ' + v + ' 없음'));
});
T("'분모·분자·단위분수' 선행 노출 0 (l01·l02 · next_lesson 제외)", () => {
  const bad = [];
  KEYS.slice(0, 2).forEach(k => {
    ['분모', '분자', '단위분수'].forEach(v => { if (bodyOf(k).indexOf(v) >= 0) bad.push(k + ':' + v); });
  });
  ok(bad.length === 0, '선행 노출: ' + bad.join(','));
});
T("분수 표기 'N분의 M' 선행 노출 0 (l01·l02 · next_lesson 제외)", () => {
  const bad = KEYS.slice(0, 2).filter(k => /\d분의/.test(bodyOf(k)));
  ok(bad.length === 0, '분수 표기 선행 노출: ' + bad.join(','));
});
T("'소수' 낱말 선행 노출 0 (l02~l07 · next_lesson 제외 · l01은 단원 예고 차시)", () => {
  const bad = KEYS.slice(1, 7).filter(k => /소수/.test(bodyOf(k)));
  ok(bad.length === 0, "'소수' 선행 노출: " + bad.join(','));
});
T("소수 표기(0.N)·'소수점' 선행 노출 0 (l01~l07 · next_lesson 제외)", () => {
  const bad = [];
  KEYS.slice(0, 7).forEach(k => {
    const b = bodyOf(k);
    if (/0\.\d/.test(b)) bad.push(k + ':0.N');
    if (/소수점/.test(b)) bad.push(k + ':소수점');
  });
  ok(bad.length === 0, '선행 노출: ' + bad.join(','));
});
T('차시 제목에 선행 용어 없음 (데이터 meta.title · CURRICULUM 양쪽)', () => {
  const W2 = boot();
  const u6 = W2.CURRICULUM.find(u => u.unit === 6);
  const title = (i) => [L[KEYS[i]].meta.title, u6.lessons[i].title];
  const bad = [];
  [0, 1].forEach(i => title(i).forEach(t => {
    ['분모', '분자', '단위분수'].forEach(v => { if (t.indexOf(v) >= 0) bad.push('l' + (i + 1) + ' 제목에 ' + v); });
  }));
  [1, 2, 3, 4, 5, 6].forEach(i => title(i).forEach(t => { if (/소수/.test(t)) bad.push('l' + (i + 1) + ' 제목에 소수'); }));
  ok(bad.length === 0, bad.join(','));
});
T('l01 = 단원 예고 차시 = 다섯 걸음 이름 실존', () => {
  const src = plain(L[PREVIEW].slides);
  ['똑같이 나누', '분수', '크기를 비교', '소수'].forEach(v => ok(src.indexOf(v) >= 0, 'l01 예고 누락: ' + v));
});
T('도입 차시(l02~l10)에 해당 개념 실존', () => {
  ok(/모양과 크기가 같게/.test(plain(L['u6_l02'].slides)), 'l02 등분 뜻 없음');
  ok(/단위분수/.test(plain(L['u6_l03'].slides)), 'l03 단위분수 없음');
  ok(/분모만큼/.test(plain(L['u6_l04'].slides)), 'l04 분모만큼 없음');
  ok(/분자가 클수록 큰 분수/.test(plain(L['u6_l05'].slides)), 'l05 비교 규칙 없음');
  ok(/분모가 클수록 작은 수/.test(plain(L['u6_l06'].slides)), 'l06 단위분수 규칙 없음');
  ok(/10분의 1/.test(plain(L['u6_l07'].slides)), 'l07 10분의 1 없음');
  ok(/소수점/.test(plain(L['u6_l08'].slides)), 'l08 소수점 없음');
  ok(/0\.1의 개수/.test(plain(L['u6_l09'].slides)), 'l09 0.1의 개수 없음');
  ok(/전체의 크기가 다르면/.test(plain(L['u6_l10'].slides)), 'l10 전체 크기 없음');
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
  ok(!L['u6_l01'].slides.some(s => s.block === 'review'), 'l01에 review 존재');
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
T('offline 10차시 (l11 마무리 제외) · 필수 필드', () => {
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
    if (m.grade !== 3 || m.subject !== '수학' || m.unit !== 6 || m.n !== i + 1) bad.push(k + ':meta');
    if (!/다문화 축제 나눔 한마당/.test(m.theme || '')) bad.push(k + ':theme');
    if (!/4수01-1/.test(m.std || '')) bad.push(k + ':std');
    if (m.duration_min !== 40) bad.push(k + ':duration');
    if (!/grade3\/semester1\/math\/6단원/.test(m.live_url || '')) bad.push(k + ':live_url');
  });
  ok(bad.length === 0, bad.join(','));
});
T('CURRICULUM u6 ↔ LESSONS 정합 (11차시 ready)', () => {
  const W2 = boot();
  const u6 = W2.CURRICULUM.find(u => u.unit === 6);
  ok(u6 && u6.lesson_count === 11, 'lesson_count');
  ok(u6.lessons.length === 11 && u6.lessons.every(l => l.ready), 'ready 플래그');
  u6.lessons.forEach((l, i) => {
    const m = L['u6_l' + String(i + 1).padStart(2, '0')].meta;
    ok(l.title === m.title, 'title 불일치 l' + (i + 1) + ': ' + l.title + ' / ' + m.title);
  });
});
T('CURRICULUM u1·u2·u3·u4·u5 회귀 (9·8·8·8·10차시 ready 무손상)', () => {
  const W2 = boot();
  const want = { 1: 9, 2: 8, 3: 8, 4: 8, 5: 10 };
  Object.keys(want).forEach(u => {
    const c = W2.CURRICULUM.find(x => x.unit === +u);
    ok(c && c.lesson_count === want[u] && c.lessons.length === want[u] && c.lessons.every(l => l.ready), 'u' + u + ' 손상');
  });
});
T('허브 index.html "3_math" 등재 정합 (units 6 · lessons 54)', () => {
  const hub = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
  const m = hub.match(/"3_math":\s*\{\s*file:\s*"g3_math\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '"3_math" 미등재');
  ok(+m[1] === 6 && +m[2] === 54, '허브 카운트 ' + m[1] + '/' + m[2]);
});
T('g3_math.html 배선 정합 (v3 3요소 · 데이터 · slug)', () => {
  ok(/teacher-v3\.css/.test(G3HTML), 'v3 css 미배선');
  ok(/<body class="kt3 subj-math">/.test(G3HTML), 'body kt3 없음');
  ok(/theme=classic/.test(G3HTML), 'classic 롤백 스니펫 없음');
  for (let u = 1; u <= 6; u++) {
    ok(new RegExp('<script src="data/g3_math_u' + u + '\\.js"></script>').test(G3HTML), 'u' + u + ' 데이터 미배선');
  }
  ok(/slug:\s*"g3_math"/.test(G3HTML), 'slug 불일치');
  ok(!/g2_math/.test(G3HTML), 'g2 잔재 존재');
});
T('케이랩 u6 매핑 없음 = 의도적 (색종이·종이띠·조각 카드 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_math_klab.js')), 'g3 klab 매핑 파일이 생겼다 — 헤더 규약 재검토 필요');
  ok(!KEYS.some(k => L[k].slides.some(s => s.block === 'klab')), '데이터에 klab 블록 존재');
});

console.log('═══ G. 차단 어휘 ═══');
T('u6 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
