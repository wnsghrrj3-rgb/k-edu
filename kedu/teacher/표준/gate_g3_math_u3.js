/* gate_g3_math_u3.js — g3 수학 u3 「나눗셈」 신규 제작 게이트 (8차시).
   40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀 + 근거(나눗셈 식) 검산 + 3학년 용어·선행 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_math_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_math_u3.js'), 'utf8');
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

const KEYS = ['u3_l01','u3_l02','u3_l03','u3_l04','u3_l05','u3_l06','u3_l07','u3_l08'];
const NO_OFFLINE = ['u3_l08'];            // 단원 마무리·평가 차시만 제외
const PREVIEW = 'u3_l01';                 // 단원 도입 = 네 걸음 예고 차시

/* 학생 노출 자리 = 슬라이드에서 tnote(교사 몫)를 걷어낸 텍스트.
   등분제·포함제 같은 교사 용어는 tnote에만 허용하므로 가드는 이 텍스트로 건다. */
function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT_ALL = KEYS.map(studentText).join('\n');

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u3 8차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(keys.length === 8, 'u3 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u3_l01~l08', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u3_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= 8; n++) {
  const key = 'u3_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 3, n);
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
for (let n = 1; n <= 8; n++) {
  T('회귀 u3_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('3', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 근거 정합 (학생 본차시 검증 값 계승 · 나눗셈 검산) ═══');
T('기본문제 정답 = 본차시 계승 값', () => {
  const FACTS = {
    'u3_l01:s09': '3',           'u3_l01:s10': '3',           'u3_l01:s11': '같다',
    'u3_l02:s08': '4',           'u3_l02:s09': '3',           'u3_l02:s10': '5',
    'u3_l03:s08': '3',           'u3_l03:s09': '4',           'u3_l03:s10': '5',
    'u3_l04:s08': '12 ÷ 4',      'u3_l04:s09': '4',           'u3_l04:s10': '3',
    'u3_l05:s08': '12 ÷ 3 = 4',  'u3_l05:s09': '4 × 3 = 12',  'u3_l05:s10': '5',
    'u3_l06:s08': '3 × ☐ = 12',  'u3_l06:s09': '3',           'u3_l06:s10': '6',
    'u3_l07:s08': '15 ÷ 5',      'u3_l07:s09': '4',           'u3_l07:s10': '7',
    'u3_l08:s08': '3',           'u3_l08:s09': '4',           'u3_l08:s10': '5', 'u3_l08:s11': '18 ÷ 3 = 6'
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
    'u3_l01': ['똑같이 나눈다','묶음마다 개수가 같','공평','들쭉날쭉'],
    'u3_l02': ['하나씩 번갈아','한 묶음 개수','12을 3묶음','8을 2묶음'],
    'u3_l03': ['묶어 덜어내','같은 수를 반복해 빼','12 − 3 − 3 − 3 − 3 = 0','4묶음'],
    'u3_l04': ['12 ÷ 4 = 3','12 나누기 4는 3','몫','전체','나누는 수','앞뒤 순서'],
    'u3_l05': ['3 × 4 = 12','4 × 3 = 12','12 ÷ 3 = 4','12 ÷ 4 = 3','한 가족','반대 관계'],
    'u3_l06': ['3 × ☐ = 12','곱셈구구','나누는 수 × 몫 = 전체','24 ÷ 4 = 6'],
    'u3_l07': ['12 ÷ 4 = 3','12 ÷ 3 = 4','2 × 6 = 12','6 × 2 = 12','무엇을 구하는지'],
    'u3_l08': ['전체 ÷ 나누는 수 = 몫','18 ÷ 3 = 6','한 가족','곱셈구구']
  };
  const bad = [];
  Object.keys(NEED).forEach(k => {
    const src = plain(L[k].slides);
    NEED[k].forEach(v => { if (src.indexOf(v) < 0) bad.push(k + '→' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(' / '));
});
T('나눗셈 식 전수 검산 (÷ 식은 나누어떨어지고 몫이 일치)', () => {
  const re = /(\d{1,4})\s*÷\s*(\d{1,4})\s*=\s*(\d{1,4})/g;
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    const a = +m[1], b = +m[2], c = +m[3];
    cnt++;
    if (b === 0 || a % b !== 0 || a / b !== c) bad.push(m[0].trim());
  }
  ok(cnt >= 25, '÷ 식이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 식(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · ÷ 식 ' + cnt + '건 전수 일치');
});
T('곱셈 식 전수 검산 (× 식이 곱셈구구와 일치)', () => {
  const re = /(\d{1,4})\s*×\s*(\d{1,4})\s*=\s*(\d{1,4})/g;
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    const a = +m[1], b = +m[2], c = +m[3];
    cnt++;
    if (a * b !== c) bad.push(m[0].trim());
  }
  ok(cnt >= 20, '× 식이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, '틀린 식(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · × 식 ' + cnt + '건 전수 일치');
});
T('반복해 빼기 줄 검산 (같은 수를 되풀이해 빼면 0)', () => {
  /* 12 − 3 − 3 − 3 − 3 = 0 처럼 이어진 빼기 줄은 두 항만 떼어 보면 틀리게 잡힌다 → 줄 전체로 검산한다. */
  const re = /(\d{1,4})((?:\s*−\s*\d{1,4})+)\s*=\s*(\d{1,4})/g;
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    const start = +m[1];
    const subs = m[2].split('−').map(x => x.trim()).filter(Boolean).map(Number);
    const end = +m[3];
    const got = subs.reduce((acc, x) => acc - x, start);
    cnt++;
    if (got !== end) bad.push(m[0].trim() + '(실제 ' + got + ')');
    if (end === 0 && new Set(subs).size !== 1) bad.push(m[0].trim() + '(같은 수를 빼지 않음)');
  }
  ok(cnt >= 3, '반복 빼기 줄이 너무 적다(' + cnt + ')');
  ok(bad.length === 0, bad.join(' / '));
  console.log('     · 반복 빼기 줄 ' + cnt + '건 일치');
});
T('leveled 정답 = 계승 값', () => {
  const WANT = {
    'u3_l01': ['공평해요', '4개씩'],
    'u3_l02': ['4장', '4개'],
    'u3_l03': ['4명', '6접시'],
    'u3_l04': ['18 ÷ 6 = 3', '24 ÷ 4'],
    'u3_l05': ['10 ÷ 2 = 5', '10 ÷ 5 = 2'],
    'u3_l06': ['4 × 4 = 16'],
    'u3_l07': ['4장', '6봉지'],
    'u3_l08': ['20 ÷ 4 = 5', '20 ÷ 5 = 4']
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
    'u3_l01': /대충|들쭉날쭉|같아야/,
    'u3_l02': /묶음 수|접시 수/,
    'u3_l03': /한 묶음의 개수|묶음이 5개/,
    'u3_l04': /앞뒤|순서/,
    'u3_l05': /가족|세 수/,
    'u3_l06': /나누는 수 × 몫|확인/,
    'u3_l07': /묶음 수와 개수|무엇을 구하는지/,
    'u3_l08': /앞뒤|순서/
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
  const banned = ['분수', '소수', '나머지', '약수', '배수', '밀리미터', '킬로미터', '㎝', '㎜'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '미도입 갈래 노출: ' + bad.join(','));
});
T('학생 노출 자리 어려운 용어 0 (교사 용어는 tnote에만)', () => {
  const banned = ['등분제', '포함제', '피제수', '제수', '교환법칙', '결합법칙', '분배법칙',
                  '최대공약수', '나누어떨어', '역연산'];
  const bad = banned.filter(x => STUDENT_ALL.indexOf(x) >= 0);
  ok(bad.length === 0, '학생 노출 어려운 용어: ' + bad.join(','));
});
T('교사 용어(등분제·포함제)는 tnote에 실존 = 의도적 배치', () => {
  const tn = KEYS.map(k => plain(L[k].slides.map(s => s.tnote || null))).join('\n');
  ok(tn.indexOf('등분제') >= 0 && tn.indexOf('포함제') >= 0, 'tnote에 교사 용어 없음');
});
T("나눗셈 기호 선행 노출 0 (l01~l03 · next_lesson 제외)", () => {
  const bad = [];
  ['u3_l01', 'u3_l02', 'u3_l03'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/÷/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, '나눗셈 기호 선행 노출: ' + bad.join(','));
});
T("'몫' 선행 노출 0 (l01~l03 · next_lesson 제외)", () => {
  const bad = [];
  ['u3_l01', 'u3_l02', 'u3_l03'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/몫/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'몫' 선행 노출: " + bad.join(','));
});
T("'식 가족' 선행 노출 0 (l01~l04 · next_lesson 제외)", () => {
  const bad = [];
  ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/한 가족|식 가족/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'식 가족' 선행 노출: " + bad.join(','));
});
T('l01 = 단원 예고 차시 = 네 걸음 이름 실존', () => {
  const src = plain(L[PREVIEW].slides);
  ['똑같이 나누기', '나눗셈식', '곱셈과의 관계', '곱셈구구'].forEach(v => ok(src.indexOf(v) >= 0, 'l01 예고 누락: ' + v));
});
T('도입 차시(l02·l03·l04·l05·l06)에 해당 개념 실존', () => {
  ok(/한 묶음 개수/.test(plain(L['u3_l02'].slides)), 'l02 한 묶음 개수 없음');
  ok(/묶음 수/.test(plain(L['u3_l03'].slides)), 'l03 묶음 수 없음');
  ok(/몫/.test(plain(L['u3_l04'].slides)) && /÷/.test(plain(L['u3_l04'].slides)), 'l04 기호·몫 없음');
  ok(/한 가족/.test(plain(L['u3_l05'].slides)), 'l05 식 가족 없음');
  ok(/곱셈구구/.test(plain(L['u3_l06'].slides)), 'l06 곱셈구구 없음');
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
  const want = {u3_l02:'u3_l01', u3_l03:'u3_l02', u3_l04:'u3_l03', u3_l05:'u3_l04',
                u3_l06:'u3_l05', u3_l07:'u3_l06', u3_l08:'u3_l07'};
  const bad = [];
  Object.keys(want).forEach(k => {
    const rv = L[k].slides.find(s => s.block === 'review');
    if (!rv || !rv.data.items || rv.data.items.length < 3 || rv.data.from !== want[k]) bad.push(k);
  });
  ok(bad.length === 0, bad.join(','));
});
T('l01 = review 블록 없음 (단원 첫 차시)', () => {
  ok(!L['u3_l01'].slides.some(s => s.block === 'review'), 'l01에 review 존재');
});
T('review items = 직전 차시 exit 문항 계승', () => {
  const bad = [];
  KEYS.forEach((k, i) => {
    if (i === 0) return;
    const prev = KEYS[i - 1];
    const et = L[prev].slides.find(s => s.block === 'exit_ticket');
    const rv = L[k].slides.find(s => s.block === 'review');
    const etq = (et.data.items || []).map(x => x.q).join('|');
    const rvq = (rv.data.items || []).map(x => x.q).join('|');
    if (etq !== rvq) bad.push(k + ' ← ' + prev);
  });
  ok(bad.length === 0, '계승 불일치: ' + bad.join(','));
});
T('offline 7차시 (l08 마무리 제외) · 필수 필드', () => {
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
    if (JSON.stringify(lk) !== JSON.stringify(['기본','도전','심화'])) bad.push(k + ':수준' + lk.join('/'));
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
    if (m.grade !== 3 || m.subject !== '수학' || m.unit !== 3 || m.n !== i + 1) bad.push(k + ':meta');
    if (!/나눔 장터/.test(m.theme || '')) bad.push(k + ':theme');
    if (!/4수01-0/.test(m.std || '')) bad.push(k + ':std');
    if (m.duration_min !== 40) bad.push(k + ':duration');
    if (!/grade3\/semester1\/math\/3단원/.test(m.live_url || '')) bad.push(k + ':live_url');
  });
  ok(bad.length === 0, bad.join(','));
});
T('CURRICULUM u3 ↔ LESSONS 정합 (8차시 ready)', () => {
  const W2 = boot();
  const u3 = W2.CURRICULUM.find(u => u.unit === 3);
  ok(u3 && u3.lesson_count === 8, 'lesson_count');
  ok(u3.lessons.length === 8 && u3.lessons.every(l => l.ready), 'ready 플래그');
  u3.lessons.forEach((l, i) => {
    const m = L['u3_l' + String(i + 1).padStart(2, '0')].meta;
    ok(l.title.replace(/\s*\(단원 도입\)/, '') === m.title.replace(/\s*\(단원 도입\)/, ''), 'title 불일치 l' + (i + 1) + ': ' + l.title + ' / ' + m.title);
  });
});
T('CURRICULUM u1·u2 회귀 (9차시·8차시 ready 무손상)', () => {
  const W2 = boot();
  const u1 = W2.CURRICULUM.find(u => u.unit === 1);
  const u2 = W2.CURRICULUM.find(u => u.unit === 2);
  ok(u1 && u1.lesson_count === 9 && u1.lessons.length === 9 && u1.lessons.every(l => l.ready), 'u1 손상');
  ok(u2 && u2.lesson_count === 8 && u2.lessons.length === 8 && u2.lessons.every(l => l.ready), 'u2 손상');
});
T('허브 index.html "3_math" 등재 정합 (units 3 · lessons 25)', () => {
  const hub = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
  const m = hub.match(/"3_math":\s*\{\s*file:\s*"g3_math\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '"3_math" 미등재');
  ok(+m[1] === 3 && +m[2] === 25, '허브 카운트 ' + m[1] + '/' + m[2]);
});
T('g3_math.html 배선 정합 (v3 3요소 · 데이터 · slug)', () => {
  ok(/teacher-v3\.css/.test(G3HTML), 'v3 css 미배선');
  ok(/<body class="kt3 subj-math">/.test(G3HTML), 'body kt3 없음');
  ok(/theme=classic/.test(G3HTML), 'classic 롤백 스니펫 없음');
  ok(/<script src="data\/g3_math_u1\.js"><\/script>/.test(G3HTML), 'u1 데이터 미배선');
  ok(/<script src="data\/g3_math_u2\.js"><\/script>/.test(G3HTML), 'u2 데이터 미배선');
  ok(/<script src="data\/g3_math_u3\.js"><\/script>/.test(G3HTML), 'u3 데이터 미배선');
  ok(/slug:\s*"g3_math"/.test(G3HTML), 'slug 불일치');
  ok(!/g2_math/.test(G3HTML), 'g2 잔재 존재');
});
T('케이랩 u3 매핑 없음 = 의도적 (실물로 나누는 편이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_math_klab.js')), 'g3 klab 매핑 파일이 생겼다 — 헤더 규약 재검토 필요');
  ok(!KEYS.some(k => L[k].slides.some(s => s.block === 'klab')), '데이터에 klab 블록 존재');
});

console.log('═══ G. 차단 어휘 ═══');
T('u3 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
