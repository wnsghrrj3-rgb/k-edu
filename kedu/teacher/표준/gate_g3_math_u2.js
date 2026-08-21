/* gate_g3_math_u2.js — g3 수학 u2 「평면도형」 신규 제작 게이트 (8차시).
   40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀 + 근거(도형 사실) 정합 + 3학년 용어·선행 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_math_u2.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_math_u2.js'), 'utf8');
/* 용어 가드(E)는 학생 노출 본문만 대상 — 파일 머리 주석에는 규약 설명을 위해
   금지어·선행 용어 목록 자체가 적혀 있으므로 자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다.
   ⚠️ 신규 게이트 복제 시 이 BODY 슬라이싱을 반드시 포함할 것. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
/* 수 검산·사실 검사는 굵게 표시(**)가 섞여 있어도 잡히도록 별표를 걷어낸 텍스트로 한다. */
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

const KEYS = ['u2_l01','u2_l02','u2_l03','u2_l04','u2_l05','u2_l06','u2_l07','u2_l08'];
const NO_OFFLINE = ['u2_l08'];            // 단원 마무리·평가 차시만 제외
const PREVIEW = 'u2_l01';                 // 단원 도입 = 네 걸음 예고 차시

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u2 8차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(keys.length === 8, 'u2 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u2_l01~l08', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u2_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= 8; n++) {
  const key = 'u2_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 2, n);
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
  T('회귀 u2_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('2', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 근거 정합 (학생 본차시 검증 사실 계승 · 도형 사실 검산) ═══');
T('기본문제 정답 = 본차시 계승 값', () => {
  const FACTS = {
    'u2_l01:s09': '3',            'u2_l01:s10': '3',            'u2_l01:s11': '4',
    'u2_l02:s08': '선분 ㄱㄴ',     'u2_l02:s09': '반직선 ㄱㄴ',   'u2_l02:s10': '직선 ㄱㄴ',
    'u2_l03:s08': '점 ㄴ',        'u2_l03:s09': '각 ㄱㄴㄷ',     'u2_l03:s10': '2',
    'u2_l04:s08': '직각',         'u2_l04:s09': '2',            'u2_l04:s10': '삼각자',
    'u2_l05:s08': '직각삼각형',    'u2_l05:s09': '1',            'u2_l05:s10': '3',
    'u2_l06:s08': '직사각형',      'u2_l06:s09': '정사각형',      'u2_l06:s10': '4',
    'u2_l07:s08': '정사각형',      'u2_l07:s09': '2',            'u2_l07:s10': '4',
    'u2_l08:s08': '선분 ㄱㄴ',     'u2_l08:s09': '직각',         'u2_l08:s10': '직각삼각형', 'u2_l08:s11': '정사각형'
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
T('도형 사실 정합 (차시별 필수 사실 실존)', () => {
  const NEED = {
    'u2_l01': ['변','꼭짓점','삼각형','사각형','곧은 선 3개','곧은 선 4개','변 3개 · 꼭짓점 3개','변 4개 · 꼭짓점 4개'],
    'u2_l02': ['선분','반직선','직선','시작점','양쪽으로 끝없이','한쪽으로 끝없이'],
    'u2_l03': ['두 반직선','각의 꼭짓점','각의 변','꼭짓점이 가운데','각 ㄱㄴㄷ','각 ㄷㄴㄱ','벌어진 정도'],
    'u2_l04': ['직각','반듯하게 두 번','ㄱ자','삼각자'],
    'u2_l05': ['직각삼각형','한 각이 직각','1개','방향'],
    'u2_l06': ['직사각형','정사각형','네 각이 모두 직각','네 변의 길이가 모두 같','4개'],
    'u2_l07': ['정사각형 1개 · 직각삼각형 2개 · 직사각형 2개 · 선분 4개','9개'],
    'u2_l08': ['선분','반직선','직선','직각','직각삼각형','직사각형','정사각형']
  };
  const bad = [];
  Object.keys(NEED).forEach(k => {
    const src = plain(L[k].slides);
    NEED[k].forEach(v => { if (src.indexOf(v) < 0) bad.push(k + '→' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(' / '));
});
T('l07 도형 개수 합 정합 (1+2+2+4=9)', () => {
  const s = L['u2_l07'].slides.find(x => x.id === 's09');
  const t = L['u2_l07'].slides.find(x => x.id === 's10');
  ok(Number(s.data.answer) === 2, '직각삼각형 개수');
  ok(Number(t.data.answer) === 4, '선분 개수');
  const sum = 1 + 2 + 2 + 4;
  ok(sum === 9, '합계 계산');
  ok(plain(L['u2_l07'].slides).indexOf('9개') >= 0, '본문에 합계 9개 없음');
});
T('본문 수 검산 (덧셈·뺄셈 식이 있으면 eval 일치)', () => {
  /* 앞이 '+ '·'− '인 자리는 이어진 식의 가운데라 두 항만 떼어 보면 틀리게 잡힌다 → 건너뛴다 */
  const re = /(?<![+−]\s)(\d{1,4})\s*([+−])\s*(\d{1,4})\s*=\s*(\d{1,4})/g;
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    const a = +m[1], b = +m[3], c = +m[4];
    const got = m[2] === '+' ? a + b : a - b;
    cnt++;
    if (got !== c) bad.push(m[0].trim());
  }
  ok(bad.length === 0, '틀린 식(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · 검산 식 ' + cnt + '건 일치 (도형 단원이라 식은 적다)');
});
T('leveled 정답 = 계승 값', () => {
  const WANT = {
    'u2_l01': ['변 3개, 꼭짓점 3개', '변 4개, 꼭짓점 4개'],
    'u2_l02': ['선분 ㄱㄴ', '반직선 ㄴㄱ'],
    'u2_l03': ['점 ㄴ', '각 ㄷㄴㄱ'],
    'u2_l04': ['직각이에요', '직각이 아니에요'],
    'u2_l05': ['직각삼각형이에요', '직각은 1개예요'],
    'u2_l06': ['직사각형이에요', '정사각형이에요'],
    'u2_l07': ['직각삼각형 2개', '선분 4개'],
    'u2_l08': ['직각삼각형이에요', '정사각형이에요']
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
    'u2_l01': /곧은 선|굽은/,
    'u2_l02': /시작점|ㄴㄱ/,
    'u2_l03': /벌어진|길수록/,
    'u2_l04': /길수록|같은 크기/,
    'u2_l05': /방향|아래/,
    'u2_l06': /모두 정사각형|네 변/,
    'u2_l07': /이름|정확/,
    'u2_l08': /네 변|길이/
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
T('미도입 갈래 노출 0 (뒤 단원 소관)', () => {
  const banned = ['분수', '소수', '나눗셈', '곱셈', '×', '÷', '밀리미터', '킬로미터', '㎝', '㎜'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '미도입 갈래 노출: ' + bad.join(','));
});
T('학생 노출 자리 어려운 용어 0 (4학년 이상 소관)', () => {
  const banned = ['예각', '둔각', '평각', '각도', '수직', '평행', '마름모', '사다리꼴',
                  '다각형', '합동', '대칭', '둘레', '넓이', '이등변삼각형', '정삼각형', '직교'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '어려운 용어: ' + bad.join(','));
});
T("'직각' 선행 노출 0 (l02·l03 · next_lesson 제외)", () => {
  const bad = [];
  ['u2_l02', 'u2_l03'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/직각/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'직각' 선행 노출: " + bad.join(','));
});
T("'직각삼각형' 선행 노출 0 (l02~l04 · next_lesson 제외)", () => {
  const bad = [];
  ['u2_l02', 'u2_l03', 'u2_l04'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/직각삼각형/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'직각삼각형' 선행 노출: " + bad.join(','));
});
T("'직사각형·정사각형' 선행 노출 0 (l02~l05 · next_lesson 제외)", () => {
  const bad = [];
  ['u2_l02', 'u2_l03', 'u2_l04', 'u2_l05'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/직사각형|정사각형/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'직사각형·정사각형' 선행 노출: " + bad.join(','));
});
T('l01 = 단원 예고 차시 = 네 걸음 이름 실존', () => {
  const src = plain(L[PREVIEW].slides);
  ['선분', '반직선', '직선', '직각', '직각삼각형', '직사각형', '정사각형'].forEach(v => ok(src.indexOf(v) >= 0, 'l01 예고 누락: ' + v));
});
T('도입 차시(l02·l03·l04·l05·l06)에 해당 용어 실존', () => {
  ok(/선분/.test(plain(L['u2_l02'].slides)) && /반직선/.test(plain(L['u2_l02'].slides)) && /직선/.test(plain(L['u2_l02'].slides)), 'l02 선 갈래 없음');
  ok(/두 반직선/.test(plain(L['u2_l03'].slides)), 'l03에 각 정의 없음');
  ok(/직각/.test(plain(L['u2_l04'].slides)), 'l04에 직각 없음');
  ok(/직각삼각형/.test(plain(L['u2_l05'].slides)), 'l05에 직각삼각형 없음');
  ok(/직사각형/.test(plain(L['u2_l06'].slides)) && /정사각형/.test(plain(L['u2_l06'].slides)), 'l06에 두 사각형 없음');
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
  const want = {u2_l02:'u2_l01', u2_l03:'u2_l02', u2_l04:'u2_l03', u2_l05:'u2_l04',
                u2_l06:'u2_l05', u2_l07:'u2_l06', u2_l08:'u2_l07'};
  const bad = [];
  Object.keys(want).forEach(k => {
    const rv = L[k].slides.find(s => s.block === 'review');
    if (!rv || !rv.data.items || rv.data.items.length < 3 || rv.data.from !== want[k]) bad.push(k);
  });
  ok(bad.length === 0, bad.join(','));
});
T('l01 = review 블록 없음 (단원 첫 차시)', () => {
  ok(!L['u2_l01'].slides.some(s => s.block === 'review'), 'l01에 review 존재');
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
    if (m.grade !== 3 || m.subject !== '수학' || m.unit !== 2 || m.n !== i + 1) bad.push(k + ':meta');
    if (!/등굣길 도형 지도/.test(m.theme || '')) bad.push(k + ':theme');
    if (!/4수02-0/.test(m.std || '')) bad.push(k + ':std');
    if (m.duration_min !== 40) bad.push(k + ':duration');
    if (!/grade3\/semester1\/math\/2단원/.test(m.live_url || '')) bad.push(k + ':live_url');
  });
  ok(bad.length === 0, bad.join(','));
});
T('CURRICULUM u2 ↔ LESSONS 정합 (8차시 ready)', () => {
  const W2 = boot();
  const u2 = W2.CURRICULUM.find(u => u.unit === 2);
  ok(u2 && u2.lesson_count === 8, 'lesson_count');
  ok(u2.lessons.length === 8 && u2.lessons.every(l => l.ready), 'ready 플래그');
  u2.lessons.forEach((l, i) => {
    const m = L['u2_l' + String(i + 1).padStart(2, '0')].meta;
    ok(l.title.replace(/\s*\(단원 도입\)/, '') === m.title.replace(/\s*\(단원 도입\)/, ''), 'title 불일치 l' + (i + 1) + ': ' + l.title + ' / ' + m.title);
  });
});
T('CURRICULUM u1 회귀 (9차시 ready 무손상)', () => {
  const W2 = boot();
  const u1 = W2.CURRICULUM.find(u => u.unit === 1);
  ok(u1 && u1.lesson_count === 9 && u1.lessons.length === 9 && u1.lessons.every(l => l.ready), 'u1 손상');
});
/* ⚠️ 단원 개통 때마다 g3 게이트 전 자리의 허브 단언을 함께 올린다 — 동반 갱신 규약 (u6 개통: 5/43 → 6/54) */
T('허브 index.html "3_math" 등재 정합 (units 6 · lessons 54)   /* ⚠️ 단원 개통 때마다 함께 올린다 */', () => {
  /* ⚠️ u5(10차시) 개통으로 4/33 → 5/43. 새 단원 개통 시
     g3 게이트 다섯 자리(u1~u5)의 이 단언을 함께 올려야 회귀가 깨지지 않는다. */
  const hub = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
  const m = hub.match(/"3_math":\s*\{\s*file:\s*"g3_math\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '"3_math" 미등재');
  /* ⚠️ 규약: 단원이 늘 때마다 허브 카운트가 커진다 — g3 게이트 전 자리를 함께 갱신할 것 */
  ok(+m[1] === 6 && +m[2] === 54, '허브 카운트 ' + m[1] + '/' + m[2]);
});
T('g3_math.html 배선 정합 (v3 3요소 · 데이터 · slug)', () => {
  ok(/teacher-v3\.css/.test(G3HTML), 'v3 css 미배선');
  ok(/<body class="kt3 subj-math">/.test(G3HTML), 'body kt3 없음');
  ok(/theme=classic/.test(G3HTML), 'classic 롤백 스니펫 없음');
  ok(/<script src="data\/g3_math_u1\.js"><\/script>/.test(G3HTML), 'u1 데이터 미배선');
  ok(/<script src="data\/g3_math_u2\.js"><\/script>/.test(G3HTML), 'u2 데이터 미배선');
  ok(/slug:\s*"g3_math"/.test(G3HTML), 'slug 불일치');
  ok(!/g2_math/.test(G3HTML), 'g2 잔재 존재');
});
T('케이랩 u2 매핑 없음 = 의도적 (선·각은 자·삼각자·종이접기 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_math_klab.js')), 'g3 klab 매핑 파일이 생겼다 — 헤더 규약 재검토 필요');
  ok(!KEYS.some(k => L[k].slides.some(s => s.block === 'klab')), '데이터에 klab 블록 존재');
});

console.log('═══ G. 차단 어휘 ═══');
T('u2 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
