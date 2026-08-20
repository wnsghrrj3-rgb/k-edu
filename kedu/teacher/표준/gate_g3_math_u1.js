/* gate_g3_math_u1.js — g3 수학 u1 「덧셈과 뺄셈」 신규 제작 게이트 (9차시).
   케이티처 3학년 첫 대상 → 40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀 + 근거/산수 정합 + 3학년 용어·선행 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_math_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_math_u1.js'), 'utf8');
/* 용어 가드(E)는 학생 노출 본문만 대상 — 파일 머리 주석에는 규약 설명을 위해
   금지어·선행 용어 목록 자체가 적혀 있으므로 자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다.
   ⚠️ 신규 게이트 복제 시 이 BODY 슬라이싱을 반드시 포함할 것. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
/* 산수 검산은 굵게 표시(**)가 섞여 있어도 잡히도록 별표를 걷어낸 텍스트로 한다. */
const NUMTXT = BODY.replace(/\*/g, '');
const G3HTML = fs.readFileSync(path.join(TDIR, 'g3_math.html'), 'utf8');
const CURRIC_SRC = (G3HTML.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0].replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

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

const KEYS = ['u1_l01','u1_l02','u1_l03','u1_l04','u1_l05','u1_l06','u1_l07','u1_l08','u1_l09'];
const NO_OFFLINE = ['u1_l09'];            // 단원 마무리·평가 차시만 제외
const PREVIEW = 'u1_l01';                 // 단원 도입 = 세 걸음 예고 차시

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u1 9차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(keys.length === 9, 'u1 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u1_l01~l09', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u1_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= 9; n++) {
  const key = 'u1_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 1, n);
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
for (let n = 1; n <= 9; n++) {
  T('회귀 u1_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('1', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 근거 정합 (학생 본차시 검증 식 계승 · 산수 검산) ═══');
T('기본문제 정답 = 본차시 계승 값', () => {
  const FACTS = {
    'u1_l01:s09': 86,    'u1_l01:s10': 33,    'u1_l01:s11': 2,
    'u1_l02:s08': 477,   'u1_l02:s09': 896,   'u1_l02:s10': 739,
    'u1_l03:s08': 673,   'u1_l03:s09': 781,   'u1_l03:s10': 805,
    'u1_l04:s08': 523,   'u1_l04:s09': 711,   'u1_l04:s10': 1502,
    'u1_l05:s08': 152,   'u1_l05:s09': 234,   'u1_l05:s10': 316,
    'u1_l06:s08': 126,   'u1_l06:s09': 419,   'u1_l06:s10': 461,
    'u1_l07:s08': 163,   'u1_l07:s09': 615,   'u1_l07:s10': 218,
    'u1_l08:s08': 593,   'u1_l08:s09': 783,   'u1_l08:s10': 156,
    'u1_l09:s08': 687,   'u1_l09:s09': 492,   'u1_l09:s10': 305,   'u1_l09:s11': 286
  };
  const bad = [];
  Object.keys(FACTS).forEach(ref => {
    const [k, sid] = ref.split(':');
    const s = L[k].slides.find(x => x.id === sid);
    if (!s) { bad.push(ref + ' 슬라이드 없음'); return; }
    if (Number(s.data.answer) !== FACTS[ref]) bad.push(ref + '=' + s.data.answer + '(기대 ' + FACTS[ref] + ')');
  });
  ok(bad.length === 0, bad.join(' / '));
});
T('본문 산수 전수 검산 (덧셈·뺄셈 식 eval)', () => {
  const re = /(\d{1,4})\s*([+−])\s*(\d{1,4})\s*=\s*(\d{1,4})/g;
  const bad = []; let m, cnt = 0;
  while ((m = re.exec(NUMTXT)) !== null) {
    const a = +m[1], b = +m[3], c = +m[4];
    const got = m[2] === '+' ? a + b : a - b;
    cnt++;
    if (got !== c) bad.push(m[0].trim());
  }
  ok(cnt >= 80, '검산 대상이 너무 적다: ' + cnt);
  ok(bad.length === 0, '틀린 식(' + bad.length + '): ' + bad.slice(0, 8).join(' / '));
  console.log('     · 검산 식 ' + cnt + '건 전부 일치');
});
T('leveled 정답 = 계승 값', () => {
  const WANT = {
    'u1_l01': ['85', '337'],
    'u1_l02': ['478', '397'],
    'u1_l03': ['542', '383'],
    'u1_l04': ['1023', '743'],
    'u1_l05': ['213', '127'],
    'u1_l06': ['435', '218'],
    'u1_l07': ['356', '354'],
    'u1_l08': ['705', '746'],
    'u1_l09': ['425', '821']
  };
  const bad = [];
  Object.keys(WANT).forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    const src = JSON.stringify(lv.data.levels);
    WANT[k].forEach(v => { if (src.indexOf(v) < 0) bad.push(k + '→' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(','));
});
T('l08 비사치기 점수표·물건값 실존 (본차시 계승)', () => {
  const src = JSON.stringify(L['u1_l08']);
  ['234', '359', '318', '465', '387', '816', '755', '627', '543', '852', '36'].forEach(v => {
    ok(src.indexOf(v) >= 0, 'l08 점수/물건값 누락: ' + v);
  });
});
T('차시별 오개념 실존 (단원 오답 계보)', () => {
  const need = {
    'u1_l01': /자리|줄을 맞/,
    'u1_l02': /끝|자리/,
    'u1_l03': /10|올림|한 자리/,
    'u1_l04': /한 번|여러/,
    'u1_l05': /순서|바꿔/,
    'u1_l06': /빌려|줄이/,
    'u1_l07': /0/,
    'u1_l08': /견주|바꿀/,
    'u1_l09': /어림/
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
  const banned = ['분수', '소수', '나눗셈', '곱셈', '×', '÷'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '미도입 갈래 노출: ' + bad.join(','));
});
T('학생 노출 자리 어려운 용어 0', () => {
  const banned = ['교환법칙', '결합법칙', '항등원', '알고리즘', '오차', '근사값'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '어려운 용어: ' + bad.join(','));
});
T("'받아올림' 선행 노출 0 (l01·l02 · next_lesson 제외)", () => {
  const bad = [];
  ['u1_l01', 'u1_l02'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/받아올림/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'받아올림' 선행 노출: " + bad.join(','));
});
T("'어림' 선행 노출 0 (l01·l02 · next_lesson 제외)", () => {
  const bad = [];
  ['u1_l01', 'u1_l02'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/어림/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'어림' 선행 노출: " + bad.join(','));
});
T("'받아내림' 선행 노출 0 (l01~l05 · next_lesson 제외)", () => {
  const bad = [];
  ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/받아내림/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'받아내림' 선행 노출: " + bad.join(','));
});
T('l01 = 단원 예고 차시 = 세 걸음 이름 실존', () => {
  const src = JSON.stringify(L[PREVIEW].slides);
  ['세 자리 수', '덧셈', '뺄셈', '생활 속 문제'].forEach(v => ok(src.indexOf(v) >= 0, 'l01 예고 누락: ' + v));
});
T('도입 차시(l03·l06)에 해당 용어 실존', () => {
  ok(/받아올림/.test(JSON.stringify(L['u1_l03'].slides)), 'l03에 받아올림 없음');
  ok(/어림/.test(JSON.stringify(L['u1_l03'].slides)), 'l03에 어림 없음');
  ok(/받아내림/.test(JSON.stringify(L['u1_l06'].slides)), 'l06에 받아내림 없음');
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
  const want = {u1_l02:'u1_l01', u1_l03:'u1_l02', u1_l04:'u1_l03', u1_l05:'u1_l04',
                u1_l06:'u1_l05', u1_l07:'u1_l06', u1_l08:'u1_l07', u1_l09:'u1_l08'};
  const bad = [];
  Object.keys(want).forEach(k => {
    const rv = L[k].slides.find(s => s.block === 'review');
    if (!rv || !rv.data.items || rv.data.items.length < 3 || rv.data.from !== want[k]) bad.push(k);
  });
  ok(bad.length === 0, bad.join(','));
});
T('l01 = review 블록 없음 (단원 첫 차시)', () => {
  ok(!L['u1_l01'].slides.some(s => s.block === 'review'), 'l01에 review 존재');
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
T('offline 8차시 (l09 마무리 제외) · 필수 필드', () => {
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
T('meta 정합 (grade·unit·n·theme·std·duration)', () => {
  const bad = [];
  KEYS.forEach((k, i) => {
    const m = L[k].meta;
    if (m.grade !== 3 || m.subject !== '수학' || m.unit !== 1 || m.n !== i + 1) bad.push(k + ':meta');
    if (!/온라인 마을/.test(m.theme || '')) bad.push(k + ':theme');
    if (!/4수01-01/.test(m.std || '')) bad.push(k + ':std');
    if (m.duration_min !== 40) bad.push(k + ':duration');
    if (!/grade3\/semester1\/math\/1단원/.test(m.live_url || '')) bad.push(k + ':live_url');
  });
  ok(bad.length === 0, bad.join(','));
});
T('CURRICULUM u1 ↔ LESSONS 정합 (9차시 ready)', () => {
  const W2 = boot();
  const u1 = W2.CURRICULUM.find(u => u.unit === 1);
  ok(u1 && u1.lesson_count === 9, 'lesson_count');
  ok(u1.lessons.length === 9 && u1.lessons.every(l => l.ready), 'ready 플래그');
  u1.lessons.forEach((l, i) => {
    const m = L['u1_l' + String(i + 1).padStart(2, '0')].meta;
    ok(l.title.replace(/\s*\(단원 도입\)/, '') === m.title.replace(/\s*\(단원 도입\)/, ''), 'title 불일치 l' + (i + 1) + ': ' + l.title + ' / ' + m.title);
  });
});
/* ⚠️ 허브 카운트는 단원이 늘 때마다 커진다 — u2(8차시) 개통으로 1/9 → 2/17.
   신규 단원 개통 시 이 자리도 함께 갱신할 것. */
T('허브 index.html "3_math" 등재 정합 (units 4 · lessons 33)   /* ⚠️ 단원 개통 때마다 함께 올린다 */', () => {
  const hub = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
  const m = hub.match(/"3_math":\s*\{\s*file:\s*"g3_math\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '"3_math" 미등재');
  /* ⚠️ 규약: 단원이 늘 때마다 허브 카운트가 커진다 — g3 게이트 전 자리를 함께 갱신할 것 */
  ok(+m[1] === 4 && +m[2] === 33, '허브 카운트 ' + m[1] + '/' + m[2]);
});
T('g3_math.html 배선 정합 (v3 3요소 · 데이터 · slug)', () => {
  ok(/teacher-v3\.css/.test(G3HTML), 'v3 css 미배선');
  ok(/<body class="kt3 subj-math">/.test(G3HTML), 'body kt3 없음');
  ok(/theme=classic/.test(G3HTML), 'classic 롤백 스니펫 없음');
  ok(/<script src="data\/g3_math_u1\.js"><\/script>/.test(G3HTML), 'u1 데이터 미배선');
  ok(/slug:\s*"g3_math"/.test(G3HTML), 'slug 불일치');
  ok(!/g2_math/.test(G3HTML), 'g2 잔재 존재');
});
T('케이랩 u1 매핑 없음 = 의도적 (세로셈은 공책·수 모형 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_math_klab.js')), 'g3 klab 매핑 파일이 생겼다 — 헤더 규약 재검토 필요');
  ok(!KEYS.some(k => L[k].slides.some(s => s.block === 'klab')), '데이터에 klab 블록 존재');
});

console.log('═══ G. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
