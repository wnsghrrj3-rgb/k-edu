/* gate_g2_math_u4.js — g2 수학 u4 「길이 재기」 신규 제작 게이트 (9차시).
   케이티처 유일 미제작 단원 → 40분 표준 v2 실내용 신규 제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀 + 근거 정합 + 2학년 용어/선행 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g2_math_u4.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_math_u4.js'), 'utf8');
/* 용어 가드(E)는 학생 노출 본문만 대상 — 파일 머리 주석에는 규약 설명을 위해
   금지어 목록 자체가 적혀 있으므로 자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
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
  // 엔진이 케이퀴즈 카탈로그를 fetch — jsdom에 없으므로 빈 목록 스텁
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:2,subject:"수학",title:"2학년 1학기 수학",brand:"케이티처",slug:"g2_math"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
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

const KEYS = ['u4_l01','u4_l02','u4_l03','u4_l04','u4_l05','u4_l06','u4_l07','u4_l08','u4_l09'];
const NO_OFFLINE = ['u4_l08'];            // 단원 평가 차시만 제외
const PREVIEW = 'u4_l01';                 // 단원 도입 = 여섯 걸음 예고 차시 (선행 용어 검사 제외)

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u4 9차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u4_'));
  ok(keys.length === 9, 'u4 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u4_l01~l09', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u4_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= 9; n++) {
  const key = 'u4_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 4, n);
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
  T('회귀 u4_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('4', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 근거 정합 (학생 본차시 검증 값 계승) ═══');
T('기본문제 정답 = 본차시 계승 값', () => {
  const FACTS = {
    'u4_l02:s08': '나',          // 종이띠로 본뜬 두 나뭇잎 — 나가 더 김
    'u4_l03:s08': '8번',         // 수학책 긴 쪽 = 종이집게 8번
    'u4_l03:s09': '3뼘',         // 팔 길이 = 3뼘
    'u4_l04:s08': '3 cm',        // 1 cm가 3번
    'u4_l04:s09': '1 센티미터',  // 1 cm 읽기
    'u4_l05:s08': '8 cm',        // 0 맞춤 색연필
    'u4_l05:s09': '7 cm',        // 2~9 칸 세기
    'u4_l06:s08': '약 7 cm',     // 7과 8 사이, 7에 가까움
    'u4_l06:s09': '약 6 cm',     // 0에 없을 때
    'u4_l07:s08': '약 1 cm',     // 엄지손톱
    'u4_l07:s09': '약 10 cm',    // 가운뎃손가락(약 5 cm)의 두 배
    'u4_l08:s07': '7 cm',        // 단원 평가 — 칸 세기
    'u4_l08:s08': '약 10 cm',    // 단원 평가 — 한 뼘
    'u4_l09:s07': '6 cm',        // 딱 맞음 → '약' 없이
    'u4_l09:s08': '약 5 cm'      // 어림값 → '약'
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
T('leveled 산수 정합 (칸 세기·배·이어 붙이기)', () => {
  const WANT = {
    'u4_l04': ['4 cm', '6 cm'],            // 1 cm 4번 / 개미 1 cm씩 6번
    'u4_l05': ['6 cm', '5 cm'],            // 0 맞춤 6 / 3~8 = 5칸
    'u4_l07': ['약 10 cm'],                // 한 뼘
    'u4_l08': ['5 cm']                     // 3~8 = 5칸, 딱 맞음
  };
  const bad = [];
  Object.keys(WANT).forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem');
    const src = JSON.stringify(lv.data.levels);
    WANT[k].forEach(v => { if (src.indexOf('"' + v + '"') < 0 && src.indexOf(v) < 0) bad.push(k + '→' + v); });
  });
  ok(bad.length === 0, '누락: ' + bad.join(','));
});
T('몸의 기준 3종 실존 (약 1·5·10 cm)', () => {
  const src = JSON.stringify(L['u4_l07']);
  ['약 1 cm', '약 5 cm', '약 10 cm', '엄지손톱', '가운뎃손가락', '뼘'].forEach(v => {
    ok(src.indexOf(v) >= 0, 'l07 기준 누락: ' + v);
  });
});
T('차시별 오개념 실존 (단원 오답 5종)', () => {
  const need = {
    'u4_l01': /눈|눈대중/,
    'u4_l02': /끝|시작점/,
    'u4_l03': /횟수/,
    'u4_l04': /사람마다|약속/,
    'u4_l05': /숫자|칸/,
    'u4_l06': /약/,
    'u4_l07': /어림/,
    'u4_l09': /꾸미/
  };
  const bad = [];
  Object.keys(need).forEach(k => {
    const mc = L[k].slides.find(s => s.block === 'misconception');
    if (!mc) { bad.push(k + ':misconception 없음'); return; }
    if (!need[k].test(JSON.stringify(mc.data))) bad.push(k + ':오개념 내용 불일치');
  });
  ok(bad.length === 0, bad.join(','));
});

console.log('═══ E. 2학년 용어 가드 · 선행 노출 가드 ═══');
T('미도입 단위 노출 0 (mm·m·km·조합문자)', () => {
  const banned = ['㎝', '㎜', '㎞', '밀리미터', '킬로미터'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  // 라틴 약어는 .html·파일명 부분 매칭 회피 위해 단어 경계로
  [/\bmm\b/, /\bkm\b/, /\bm\b/].forEach(re => { if (re.test(BODY)) bad.push(re.source); });
  // '미터'는 '센티미터'의 일부로만 등장해야 한다
  if (BODY.replace(/센티미터/g, '').indexOf('미터') >= 0) bad.push('미터(단독)');
  ok(bad.length === 0, '금지 단위 노출: ' + bad.join(','));
});
T('학생 노출 자리 어려운 용어 0', () => {
  const banned = ['소수', '오차', '측정값', '표준 단위', '단위 환산'];
  const bad = banned.filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, '어려운 용어: ' + bad.join(','));
});
T("'약 N cm' 선행 노출 0 (l02~l05 · l01·next_lesson 제외)", () => {
  const bad = [];
  ['u4_l02','u4_l03','u4_l04','u4_l05'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/약\s*\d+\s*cm|약 몇 cm/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'약 몇 cm' 선행 노출: " + bad.join(','));
});
T("'어림' 선행 노출 0 (l02~l06 · l01·next_lesson 제외)", () => {
  const bad = [];
  ['u4_l02','u4_l03','u4_l04','u4_l05','u4_l06'].forEach(k => {
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/어림/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, "'어림' 선행 노출: " + bad.join(','));
});
T('l01은 단원 예고 차시 = 여섯 걸음 이름 실존', () => {
  const src = JSON.stringify(L[PREVIEW].slides);
  ['본떠', '단위', '1 cm', '자', '약 몇 cm', '어림'].forEach(v => ok(src.indexOf(v) >= 0, 'l01 예고 누락: ' + v));
});

console.log('═══ F. 구조 정합 ═══');
T('전 차시 슬라이드 17~19슬 · extras 20~30', () => {
  const bad = [];
  KEYS.forEach(k => {
    const n = L[k].slides.length, e = L[k].extras.length;
    if (n < 17 || n > 19) bad.push(k + ':슬' + n);
    if (e < 20 || e > 30) bad.push(k + ':extras' + e);
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
  const want = {u4_l02:'u4_l01', u4_l03:'u4_l02', u4_l04:'u4_l03', u4_l05:'u4_l04',
                u4_l06:'u4_l05', u4_l07:'u4_l06', u4_l08:'u4_l07', u4_l09:'u4_l08'};
  const bad = [];
  Object.keys(want).forEach(k => {
    const rv = L[k].slides.find(s => s.block === 'review');
    if (!rv || !rv.data.items || rv.data.items.length < 2 || rv.data.from !== want[k]) bad.push(k);
  });
  ok(bad.length === 0, bad.join(','));
});
T('l01 = review 블록 없음 (단원 첫 차시)', () => {
  ok(!L['u4_l01'].slides.some(s => s.block === 'review'), 'l01에 review 존재');
});
T('offline 8차시 (l08 평가 제외) · 필수 필드', () => {
  const bad = [];
  KEYS.forEach(k => {
    const oa = L[k].slides.find(s => s.block === 'offline_activity');
    if (NO_OFFLINE.includes(k)) { if (oa) bad.push(k + ':평가차시에 offline'); return; }
    if (!oa) { bad.push(k + ':offline없음'); return; }
    const d = oa.data;
    if (!d.type || !d.goal || !Array.isArray(d.steps) || !d.steps.length || !Array.isArray(d.materials) || !d.minutes) bad.push(k + ':offline 필드');
  });
  ok(bad.length === 0, bad.join(','));
});
T('4단계 이상 등장 · 정리에 exit·summary·next_lesson', () => {
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
T('meta 정합 (grade·unit·n·theme·std)', () => {
  const bad = [];
  KEYS.forEach((k, i) => {
    const m = L[k].meta;
    if (m.grade !== 2 || m.subject !== '수학' || m.unit !== 4 || m.n !== i + 1) bad.push(k + ':meta');
    if (!/자연 관찰 수첩/.test(m.theme || '')) bad.push(k + ':theme');
    if (!/2수03-0[12]/.test(m.std || '')) bad.push(k + ':std');
    if (m.duration_min !== 40) bad.push(k + ':duration');
  });
  ok(bad.length === 0, bad.join(','));
});
T('CURRICULUM u4 ↔ LESSONS 정합 (9차시 ready)', () => {
  const W2 = boot();
  const u4 = W2.CURRICULUM.find(u => u.unit === 4);
  ok(u4 && u4.lesson_count === 9, 'lesson_count');
  ok(u4.lessons.length === 9 && u4.lessons.every(l => l.ready), 'ready 플래그');
  u4.lessons.forEach((l, i) => {
    const m = L['u4_l' + String(i + 1).padStart(2, '0')].meta;
    ok(l.title.replace(/\s*\(단원 도입\)/, '') === m.title.replace(/\s*\(단원 도입\)/, ''), 'title 불일치 l' + (i + 1) + ': ' + l.title + ' / ' + m.title);
  });
});
T('케이랩 u4 매핑 없음 = 의도적 (실물 자 우위)', () => {
  const klab = fs.readFileSync(path.join(TDIR, 'data/g2_math_klab.js'), 'utf8');
  ok(!/\bu4(_l\d+)?\s*:/.test(klab), 'u4 klab 매핑이 생겼다 — 헤더 규약 재검토 필요');
  ok(!KEYS.some(k => L[k].slides.some(s => s.block === 'klab')), '데이터에 klab 블록 존재');
});

console.log('═══ G. 차단 어휘 ═══');
T('u4 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => BODY.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
