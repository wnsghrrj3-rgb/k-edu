/* gate_g3_math_u7.js — g3 수학 u7 「학기 마무리」 신규 제작 게이트 (1차시).
   40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀
   + 근거 종합 검산(덧셈·뺄셈 / 나눗셈 / 곱셈 / 시간의 합 초 환산 / 소수 부등호 / 단위분수 비교 / mm↔cm)
   + 2학기 소관 갈래 가드 + 소수 한 자리 정규화 가드.

   ⚠️ u7은 g3 유일한 1차시 단원 — 앞 단원 게이트와 다른 자리 세 곳:
   (1) u6 데이터도 함께 로드한다. u7_l01의 review.from = "u6_l11"이라 u7만 로드하면 계보 검사가 성립하지 않는다.
   (2) "l01 = review 없음" 규약을 뒤집는다 — 학기 마무리 차시라 되짚기가 차시의 본질이다.
   (3) offline은 마무리 차시인데도 유지 — 본차시 자체가 말판 놀이다(u5 l09 선례).

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_math_u7.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_math_u7.js'), 'utf8');
const DATA6 = fs.readFileSync(path.join(TDIR, 'data/g3_math_u6.js'), 'utf8');  // review 계보용
/* 용어 가드(E)는 본문만 대상 — 파일 머리 주석에 규약 설명을 위해 금지어 목록 자체가 적혀 있으므로
   자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다.
   ⚠️ 신규 게이트 복제 시 이 BODY 슬라이싱을 반드시 포함할 것 (u1~u6 선례 계승). */
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
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA6); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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

// 데이터 직접 로드 (node 컨텍스트) — u6도 함께 (review 계보)
global.window = { LESSONS: {} };
eval(DATA6);
eval(DATA);
const L = global.window.LESSONS;

const KEY = 'u7_l01';
const FROM = 'u6_l11';

/* 학생 노출 자리 = 슬라이드에서 tnote(교사 몫)를 걷어낸 텍스트. */
function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = studentText(KEY);
/* 갈래 가드는 next_lesson(2학기 예고 대목)을 제외한 본문으로 건다. */
const bodyNoPreview = plain(L[KEY].slides.filter(s => s.block !== 'next_lesson')
  .map(x => { const c = Object.assign({}, x); delete c.tnote; return c; }));
/* 소수 정규화 가드는 misconception(틀린 생각을 보여 주는 대목)을 제외한다. */
const normText = plain(L[KEY].slides.filter(x => x.block !== 'misconception')
  .map(x => { const c = Object.assign({}, x); delete c.tnote; return c; }));
const tnoteText = plain(L[KEY].slides.map(x => x.tnote).filter(Boolean));

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u7 1차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u7_'));
  ok(keys.length === 1, 'u7 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u7_l01', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u7_')).sort();
  ok(JSON.stringify(got) === JSON.stringify([KEY]), got.join(','));
});

console.log('═══ B. 7요소 실렌더 ═══');
T(KEY + ' 7요소 렌더', () => {
  const W2 = boot();
  const ALL = renderAll(W2, 7, 1);
  ok(!/교구 로드 오류|undefined<\//.test(ALL), '렌더 오류');
  ok(!/내용을 추가하세요/.test(ALL), '폴백(빈 내용) 렌더 잔존');
  ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
  ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
  ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
  ok(/kt-rv/.test(ALL), '① review items 미렌더 (u7은 마무리 차시라 l01에도 review가 있다)');
  ok(/kt-oa-steps/.test(ALL) && /kt-oa-timer/.test(ALL), '④ offline 미렌더');
  ok(/곰이|펭이/.test(ALL), '③ 서사 인물 없음');
});

console.log('═══ C. 회귀 (openShow 무손상) ═══');
T('회귀 u7_l01', () => {
  const W2 = boot();
  W2.Teacher.openShow('7', '1');
  const html = W2.document.getElementById('slide-content').innerHTML;
  ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
});
T('회귀 u6_l11 (직전 단원 무손상)', () => {
  const W2 = boot();
  W2.Teacher.openShow('6', '11');
  const html = W2.document.getElementById('slide-content').innerHTML;
  ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
});

console.log('═══ D. 근거 정합 (학생 본차시 QBANK·LINKS 계승 · 종합 전수 검산) ═══');
T('기본문제 정답 = 본차시 QBANK 계승', () => {
  const FACTS = { 's09': '1021', 's10': '직선', 's11': '3' };
  const bad = [];
  Object.keys(FACTS).forEach(sid => {
    const s = L[KEY].slides.find(x => x.id === sid);
    if (!s || String(s.data.answer) !== FACTS[sid]) bad.push(sid + '=' + (s && s.data.answer));
  });
  ok(bad.length === 0, bad.join(' '));
});
T('leveled 정답 = 본차시 QBANK 계승 (216 · 11시 35분 10초 · 심화 open)', () => {
  const lv = L[KEY].slides.find(x => x.block === 'leveled_problem').data.levels;
  ok(lv['기본'].a === '216', '기본 ' + lv['기본'].a);
  ok(lv['도전'].a === '11시 35분 10초', '도전 ' + lv['도전'].a);
  ok(lv['심화'].open === true, '심화 open 아님');
});
T('여섯 단원 이름 전수 실존 (마무리 차시의 뼈대)', () => {
  const NAMES = ['덧셈과 뺄셈', '평면도형', '나눗셈', '곱셈', '길이와 시간', '분수와 소수'];
  const miss = NAMES.filter(n => !NUMTXT.includes(n));
  ok(miss.length === 0, '누락 ' + miss.join(','));
});
T('말판 놀이 규칙 네 걸음 실존 (본차시 계승)', () => {
  ['주사위', '말을 옮', '한 바퀴', '이어'].forEach(k => ok(NUMTXT.includes(k), '누락 ' + k));
});
T('덧셈·뺄셈식 전수 검산 (줄 전체 계산)', () => {
  /* ⚠️ 두 항씩 짝지어 보면 안 된다 — 받아올림 풀이의 "2 + 9 + 1 = 12" 같은 세 항 줄에서
     뒤 두 항만 잘라 보게 되어 통째로 오탐이 난다(u3 반복 빼기 줄·u4 부분 곱 합산 줄과 같은 자리).
     항이 몇 개든 줄 전체를 왼쪽부터 계산해 우변과 견준다. */
  const bad = [];
  const re = /(\d{1,4}(?:\s*[+−-]\s*\d{1,4})+)\s*=\s*(\d{1,5})(?!\s*[.\d])/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    const toks = m[1].match(/\d+|[+−-]/g);
    let v = +toks[0];
    for (let i = 1; i < toks.length; i += 2) v = toks[i] === '+' ? v + +toks[i + 1] : v - +toks[i + 1];
    cnt++;
    if (v !== +m[2]) bad.push(m[0] + '=' + m[2]);
  }
  ok(cnt >= 2, '덧뺄식 ' + cnt + '건 (2건 이상이어야)');
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 덧뺄식 ' + cnt + '건 줄 전체 검산');
});
T('단위 붙은 덧셈 줄 검산 (N분 + M분 = R분)', () => {
  /* 시간 합 검산기는 초로 끝나는 식만 잡는다 — "30분 + 4분 + 1분 = 35분"처럼
     같은 단위끼리만 더한 풀이 줄은 여기서 따로 견준다. */
  const bad = [];
  const re = /(\d+)\s*(분|초|cm|mm|m)\s*(?:\+\s*(\d+)\s*\2\s*)+=\s*(\d+)\s*\2/g;
  const re2 = /((?:\d+\s*(분|초|cm|mm|m)\s*\+\s*)+\d+\s*\2)\s*=\s*(\d+)\s*\2/g;
  let m, cnt = 0;
  while ((m = re2.exec(NUMTXT))) {
    const nums = m[1].match(/\d+/g).map(Number);
    const sum = nums.reduce((a, b) => a + b, 0);
    cnt++;
    if (sum !== +m[3]) bad.push(m[0]);
  }
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 단위 덧셈 줄 ' + cnt + '건 검산');
});
T('나눗셈식 전수 검산 (나누어떨어짐만)', () => {
  const bad = [];
  const re = /(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    const a = +m[1], b = +m[2], r = +m[3];
    cnt++;
    if (b === 0 || a % b !== 0 || a / b !== r) bad.push(m[0]);
  }
  ok(cnt >= 2, '÷식 ' + cnt + '건');
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · ÷식 ' + cnt + '건 검산');
});
T('곱셈식 전수 검산', () => {
  const bad = [];
  const re = /(\d+)\s*×\s*(\d+)\s*=\s*(\d+)/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    if (+m[1] * +m[2] !== +m[3]) bad.push(m[0]);
  }
  ok(cnt >= 3, '×식 ' + cnt + '건');
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · ×식 ' + cnt + '건 검산');
});
T('시간의 합 전수 검산 (초로 환산해 좌우 비교 · u5 환산기 계승)', () => {
  const toSec = (s) => {
    let t = 0, m;
    if ((m = s.match(/(\d+)\s*시/))) t += +m[1] * 3600;
    if ((m = s.match(/(\d+)\s*분/))) t += +m[1] * 60;
    if ((m = s.match(/(\d+)\s*초/))) t += +m[1];
    return t;
  };
  const re = /((?:\d+\s*시\s*)?(?:\d+\s*분\s*)?(?:\d+\s*초))\s*\+\s*((?:\d+\s*시\s*)?(?:\d+\s*분\s*)?(?:\d+\s*초))\s*=\s*((?:\d+\s*시\s*)?(?:\d+\s*분\s*)?(?:\d+\s*초))/g;
  const bad = [];
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    if (toSec(m[1]) + toSec(m[2]) !== toSec(m[3])) bad.push(m[0]);
  }
  ok(cnt >= 1, '시간 합식 ' + cnt + '건');
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 시간 합식 ' + cnt + '건 초 환산 검산');
});
T('시간 환산 검산 (N초 = M분 K초)', () => {
  const bad = [];
  const re = /(\d+)\s*초는\s*(\d+)\s*분\s*(\d+)\s*초/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    if (+m[1] !== +m[2] * 60 + +m[3]) bad.push(m[0]);
  }
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 시간 환산 ' + cnt + '건 검산');
});
T('소수 부등호 전수 검산', () => {
  const bad = [];
  const re = /(\d\.\d)\s*([<>])\s*(\d\.\d)/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    const a = +m[1], b = +m[3];
    if ((m[2] === '>' && !(a > b)) || (m[2] === '<' && !(a < b))) bad.push(m[0]);
  }
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 소수 부등호 ' + cnt + '건 검산');
});
T('분수 → 소수 변환 검산 (10분의 N = 0.N · u6 계승)', () => {
  const bad = [];
  const re = /10분의\s*(\d)를?\s*소수로[^.]{0,20}?(\d\.\d)/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    if (Math.abs(+m[1] / 10 - +m[2]) > 1e-9) bad.push(m[0]);
  }
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 분수→소수 ' + cnt + '건 검산');
});
T('mm ↔ cm 소수 환산 검산 (1 mm = 0.1 cm)', () => {
  const bad = [];
  const re = /(\d+)\s*mm\s*=\s*(\d+\.\d)\s*cm/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    if (Math.abs(+m[1] / 10 - +m[2]) > 1e-9) bad.push(m[0]);
  }
  ok(cnt >= 1, 'mm↔cm 식 ' + cnt + '건 (단원 잇기의 근거)');
  ok(bad.length === 0, bad.join(' / '));
});
T('단위분수 비교 서술 검산 (분모가 클수록 작다)', () => {
  const bad = [];
  const re = /(\d+)분의\s*1은\s*(\d+)분의\s*1보다\s*(크|작)/g;
  let m, cnt = 0;
  while ((m = re.exec(NUMTXT))) {
    cnt++;
    const want = +m[1] > +m[2] ? '작' : '크';
    if (m[3] !== want) bad.push(m[0]);
  }
  ok(bad.length === 0, bad.join(' / '));
  console.log('      · 단위분수 비교 ' + cnt + '건 검산');
});
T('소수 한 자리 정규화 (0.1~0.9만 · 오개념 제외 · u6 계승)', () => {
  const bad = (normText.replace(/\*/g, '').match(/\d+\.\d+/g) || [])
    .filter(x => !/^0\.[1-9]$/.test(x));
  ok(bad.length === 0, '비정규 소수 ' + bad.join(','));
});
T('오개념 wrong에 등호식 0 (틀린 값은 등호로 쓰지 않는다 · u4~u6 계승)', () => {
  const mc = L[KEY].slides.filter(s => s.block === 'misconception');
  ok(mc.length >= 1, 'misconception 블록 없음');
  mc.forEach(s => ok(!/=/.test(String(s.data.wrong)), 'wrong에 등호: ' + s.data.wrong));
});
T('오개념 extras 실존 (단원은 남남 · 다 배웠으니 다 안다)', () => {
  const xs = L[KEY].extras.filter(e => e.type === 'misconception');
  ok(xs.length >= 2, 'misconception extras ' + xs.length);
});

console.log('═══ E. 2학기 소관 갈래·용어 가드 ═══');
T('2학기 이후 갈래 학생 노출 0 (next_lesson 제외)', () => {
  /* ⚠️ '원'과 '들이'는 단독으로 걸면 '단원·응원'·'아이들이'가 통째로 오탐이다.
     그래서 '들이와 무게' 묶음으로만 검사한다 (u5의 '들이' 제외 선례 계승). */
  const BAN = ['가분수', '대분수', '통분', '약분', '기약분수', '약수', '배수', '백분율',
    '자연수', '넓이', '부피', '각도', '둘레', '나머지', '무게', '분수의 덧셈'];
  const hit = BAN.filter(w => bodyNoPreview.includes(w));
  ok(hit.length === 0, '노출 ' + hit.join(','));
});
T('2학기 예고는 next_lesson 블록에만 실존 (원·들이와 무게·분수의 덧셈)', () => {
  const nx = plain(L[KEY].slides.filter(s => s.block === 'next_lesson'));
  ['원', '들이와 무게', '분수의 덧셈', '곱셈과 나눗셈'].forEach(w => ok(nx.includes(w), '예고 누락 ' + w));
});
T('학생 노출 어려운 용어 0 (교사 몫은 tnote)', () => {
  const HARD = ['등분할', '역연산', '60진법', '환산', '양감'];
  const hit = HARD.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, '노출 ' + hit.join(','));
});
T('tnote에 교사 용어 실존 (양감)', () => {
  ok(/양감/.test(tnoteText), 'tnote에 교사 용어 없음');
});
T('1학기 도입 용어는 해제 = 자유 사용 (분수·소수·mm·몫·직선)', () => {
  ['분수', '소수', 'mm', '몫', '직선'].forEach(w => ok(NUMTXT.includes(w), '마무리인데 ' + w + ' 미등장'));
});
T('차시 제목 정합 (데이터 meta.title ↔ CURRICULUM · 본차시 제목 계승)', () => {
  const cur = eval(CURRIC_SRC.replace(/^window\.CURRICULUM/, 'var __C')) || null;
  const C = (function () { let window = {}; eval(CURRIC_SRC); return window.CURRICULUM; })();
  const u7 = C.find(u => u.unit === 7);
  ok(u7, 'CURRICULUM u7 없음');
  ok(u7.lessons[0].title === L[KEY].meta.title, '제목 불일치 ' + u7.lessons[0].title);
  ok(/말판/.test(L[KEY].meta.title), '본차시 제목 계보 끊김');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 19슬 · extras 20~24', () => {
  ok(L[KEY].slides.length === 19, '슬 ' + L[KEY].slides.length);
  const n = L[KEY].extras.length;
  ok(n >= 20 && n <= 24, 'extras ' + n);
});
T('tnote 6슬 이상 (⑦)', () => {
  const n = L[KEY].slides.filter(s => s.tnote).length;
  ok(n >= 6, 'tnote ' + n);
  L[KEY].slides.filter(s => s.tnote).forEach(s => {
    ok(Array.isArray(s.tnote.ask) && s.tnote.ask.length >= 2, s.id + ' ask 부족');
    ok(s.tnote.watch && typeof s.tnote.min === 'number', s.id + ' watch/min 누락');
  });
});
T('img 폴백 1개 이상 (②)', () => {
  ok(/"img":\s*"assets\/photo\/math\//.test(JSON.stringify(L[KEY].slides)), 'img 없음');
});
T('review from 계보 = u6_l11 (⚠️ 단원을 넘는 계보 · u7 전용 규약)', () => {
  const rv = L[KEY].slides.find(s => s.block === 'review');
  ok(rv, 'review 블록 없음');
  ok(rv.data.from === FROM, 'from ' + rv.data.from);
  ok(L[FROM], '계보 대상 u6_l11 미로드');
});
T('review items = u6_l11 exit 문항 q·a 전수 계승', () => {
  const rv = L[KEY].slides.find(s => s.block === 'review').data.items;
  const ex = L[FROM].slides.find(s => s.block === 'exit_ticket').data.items;
  ok(rv.length === 3 && ex.length >= 3, '문항 수 ' + rv.length + '/' + ex.length);
  rv.forEach((it, i) => {
    ok(it.q === ex[i].q, 'q 불일치 #' + (i + 1) + ': ' + it.q);
    ok(it.a === ex[i].a, 'a 불일치 #' + (i + 1) + ': ' + it.a);
  });
});
T('offline 유지 (⚠️ 마무리 차시지만 본차시가 놀이 · u5 l09 선례) · 필수 필드', () => {
  const oa = L[KEY].slides.find(s => s.block === 'offline_activity');
  ok(oa, 'offline 없음');
  ok(oa.data.goal && Array.isArray(oa.data.steps) && oa.data.steps.length >= 3, 'steps 부족');
  ok(Array.isArray(oa.data.materials) && oa.data.materials.length >= 3, 'materials 부족');
  ok(typeof oa.data.minutes === 'number' && oa.data.minutes >= 5, 'minutes ' + oa.data.minutes);
});
T('4단계 이상 등장 · 정리에 exit·summary·next_lesson·self', () => {
  const st = new Set(L[KEY].slides.map(s => s.stage));
  ok(st.size >= 4, '단계 ' + st.size);
  ['exit_ticket', 'summary', 'next_lesson', 'self_assessment'].forEach(b => {
    const s = L[KEY].slides.find(x => x.block === b);
    ok(s && s.stage === '정리', b + ' 누락/단계 어긋남');
  });
});
T('슬라이드 id 0패딩 연속 (s01~s19)', () => {
  const ids = L[KEY].slides.map(s => s.id);
  const want = Array.from({ length: 19 }, (_, i) => 's' + String(i + 1).padStart(2, '0'));
  ok(JSON.stringify(ids) === JSON.stringify(want), ids.join(','));
});
T('extras 참조 무결성 (suggested_extras → extras 실존)', () => {
  const have = new Set(L[KEY].extras.map(e => e.id));
  const bad = [];
  L[KEY].slides.forEach(s => (s.suggested_extras || []).forEach(x => { if (!have.has(x)) bad.push(s.id + '→' + x); }));
  ok(bad.length === 0, bad.join(' '));
});
T('extras 필수 필드 · id 중복 0', () => {
  const seen = new Set();
  L[KEY].extras.forEach(e => {
    ok(e.id && e.type && e.icon && e.title, 'extras 필드 누락 ' + e.id);
    ok(e.content || e.url, 'extras 본문 없음 ' + e.id);
    ok(Array.isArray(e.fit_slides) && e.fit_slides.length >= 1, 'fit_slides 없음 ' + e.id);
    ok(!seen.has(e.id), 'id 중복 ' + e.id);
    seen.add(e.id);
  });
});
T('leveled 3수준 + 심화 open · exit 확인3+신호등3', () => {
  const lv = L[KEY].slides.find(s => s.block === 'leveled_problem').data.levels;
  ['기본', '도전', '심화'].forEach(k => ok(lv[k] && lv[k].q && lv[k].a, k + ' 누락'));
  ok(Array.isArray(lv['기본'].steps) && Array.isArray(lv['도전'].steps), 'steps 누락');
  ok(lv['심화'].open === true, '심화 open 아님');
  const et = L[KEY].slides.find(s => s.block === 'exit_ticket').data;
  ok(et.items.length === 3 && et.self.length === 3, 'exit 구성 ' + et.items.length + '/' + et.self.length);
  et.items.forEach(i => ok(i.q && i.a, 'exit 문항 결손'));
});
T('meta 정합 (grade·unit·n·theme·std·duration·live_url)', () => {
  const m = L[KEY].meta;
  ok(m.grade === 3 && m.subject === '수학' && m.unit === 7 && m.n === 1, 'meta 기본');
  ok(m.duration_min === 40, 'duration ' + m.duration_min);
  ok(m.std === '1학기 종합', 'std ' + m.std);   // ⚠️ 여섯 단원을 가로질러 단일 성취기준에 속하지 않는다
  ok(m.theme === '곰이·펭이 1학기 마무리 말판 여행', 'theme ' + m.theme);
  ok(/7단원_학기마무리/.test(m.live_url), 'live_url ' + m.live_url);
});
T('CURRICULUM u7 ↔ LESSONS 정합 (1차시 ready)', () => {
  const C = (function () { let window = {}; eval(CURRIC_SRC); return window.CURRICULUM; })();
  const u7 = C.find(u => u.unit === 7);
  ok(u7 && u7.lesson_count === 1 && u7.lessons.length === 1 && u7.lessons[0].ready, 'u7 손상');
});
T('CURRICULUM u1~u6 회귀 (9·8·8·8·10·11차시 ready 무손상)', () => {
  const C = (function () { let window = {}; eval(CURRIC_SRC); return window.CURRICULUM; })();
  const want = { 1: 9, 2: 8, 3: 8, 4: 8, 5: 10, 6: 11 };
  Object.keys(want).forEach(u => {
    const c = C.find(x => x.unit === +u);
    ok(c && c.lesson_count === want[u] && c.lessons.length === want[u] && c.lessons.every(l => l.ready), 'u' + u + ' 손상');
  });
});
T('허브 index.html "3_math" 등재 정합 (units 7 · lessons 55)', () => {
  /* ⚠️ 단원이 늘면 이 단언이 u1~u6 게이트에서 함께 깨진다 — 일곱 자리를 같이 올릴 것. */
  const hub = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
  const m = hub.match(/"3_math":\s*\{\s*file:\s*"g3_math\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '허브 미등재');
  ok(+m[1] === 7 && +m[2] === 55, '허브 ' + m[1] + '/' + m[2]);
});
T('g3_math.html 배선 정합 (데이터 u1~u7 · slug)', () => {
  for (let u = 1; u <= 7; u++) ok(G3HTML.includes('data/g3_math_u' + u + '.js'), 'u' + u + ' 배선 없음');
  ok(/slug:\s*"g3_math"/.test(G3HTML), 'slug 어긋남');
});
T('케이랩 u7 매핑 없음 = 의도적 (종이 말판·주사위 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_math_klab.js')), 'klab 파일 생김');
  ok(!/klab/i.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u7 차단 어휘 0', () => {
  const BAN = ['결로', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
