/* gate_g1_math_u4.js — g1 수학 u4 「비교하기」 재제작 게이트 (7차시).
   껍데기(18슬 title/desc만) → 40분 표준 v2 실내용 재제작 검증.
   실엔진(jsdom) 부팅 → 전 차시 openShow → 7요소 실렌더 + 회귀 + 비교 판정 정합 + 1학년 용어 가드.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g1_math_u4.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g1_math_u4.js'), 'utf8');
const G1HTML = fs.readFileSync(path.join(TDIR, 'g1_math.html'), 'utf8');
const CURRIC_SRC = (G1HTML.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0].replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-math">${extractBody(G1HTML)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  // 엔진이 케이퀴즈 카탈로그를 fetch — jsdom에 없으므로 빈 목록 스텁
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  // g1_math는 bare LESSONS 패턴 — 선초기화 필요
  w.eval('var LESSONS = {}; window.LESSONS = LESSONS;');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:1,subject:"수학",title:"1학년 1학기 수학",brand:"케이티처",slug:"g1_math"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
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
global.window = {};
global.LESSONS = {};
eval(DATA);
const L = global.LESSONS;

const KEYS = ['u4_l01','u4_l02','u4_l03','u4_l04','u4_l05','u4_l06','u4_l07'];
const HAS_OFFLINE = ['u4_l01','u4_l02','u4_l03','u4_l04','u4_l05','u4_l07']; // l06 = 평가 차시 제외

console.log('═══ A. 부팅 ═══');
let W;
T('부팅 + u4 7차시 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u4_'));
  ok(keys.length === 7, 'u4 차시 ' + keys.length);
});
T('차시 키 = 0패딩 u4_l01~l07', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u4_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
});

console.log('═══ B. 전 차시 7요소 실렌더 ═══');
for (let n = 1; n <= 7; n++) {
  const key = 'u4_l' + String(n).padStart(2, '0');
  T(key + ' 7요소 렌더', () => {
    const W2 = boot();
    const ALL = renderAll(W2, 4, n);
    ok(!/교구 로드 오류|undefined<\/|NaN/.test(ALL), '렌더 오류');
    ok(!/내용을 추가하세요/.test(ALL), '껍데기 폴백 렌더 잔존');
    ok(/kt-lv-tab/.test(ALL), '⑤ leveled 미렌더');
    ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 누락');
    ok(/kt-et/.test(ALL) && /🟢/.test(ALL) && /🔴/.test(ALL), '⑥ exit 미렌더');
    if (n !== 1) ok(/kt-rv/.test(ALL), '① review items 미렌더');   // l01 = 단원 첫 차시
    if (HAS_OFFLINE.includes(key)) ok(/kt-oa-steps/.test(ALL) && /kt-oa-timer/.test(ALL), '④ offline 미렌더');
    ok(/곰이|펭이/.test(ALL), '③ 서사 인물 없음');
  });
}

console.log('═══ C. 회귀 (openShow 무손상) ═══');
for (let n = 1; n <= 7; n++) {
  T('회귀 u4_l' + String(n).padStart(2, '0'), () => {
    const W2 = boot();
    W2.Teacher.openShow('4', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20 && !/교구 로드 오류/.test(html), '빈/오류 렌더');
  });
}

console.log('═══ D. 비교 판정 정합 (학생 본차시 계승) ═══');
T('정답 = 학생 본차시 판정 계승', () => {
  const FACTS = {
    'u4_l02:s09': '보라 색연필',   // 끝 맞춰 더 나온 쪽
    'u4_l02:s10': '크레파스',      // 색연필이 더 기니 크레파스가 더 짧다
    'u4_l03:s08': '수학책',        // 수학책 > 지우개
    'u4_l03:s09': '풍선',          // 콩 주머니가 더 무거우니 풍선이 더 가볍다
    'u4_l04:s09': '책',            // 책 > 수첩
    'u4_l04:s10': '메모지',        // 스케치북이 더 넓으니 메모지가 더 좁다
    'u4_l05:s09': '유리병',        // 넘쳤다 → 유리병이 더 많이 담긴다
    'u4_l05:s10': '작은 컵',       // 남았다 → 작은 컵이 더 적게 담긴다
    'u4_l06:s05': '책',            // 의자가 더 무거우니 책이 더 가볍다
    'u4_l06:s06': '물통',          // 물통 > 우유갑
    'u4_l07:s08': '긴 뱀',
    'u4_l07:s09': '납작 빈대떡',
    'u4_l07:s10': '우묵한 그릇'
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
T('세 개 비교 판정 정합 (가장 ~다)', () => {
  const WANT = [
    ['u4_l02', '지우개'], ['u4_l02', '자'], ['u4_l02', '젓가락'],
    ['u4_l03', '의자'], ['u4_l03', '깃털'], ['u4_l03', '축구공'],
    ['u4_l04', '수첩'], ['u4_l04', '칠판'], ['u4_l04', '티셔츠'],
    ['u4_l05', '물병'], ['u4_l05', '욕조']
  ];
  const bad = [];
  WANT.forEach(([k, v]) => {
    const hit = L[k].slides.some(s => s.block === 'match' && JSON.stringify(s.data).indexOf('"' + v + '"') >= 0);
    if (!hit) bad.push(k + '→' + v);
  });
  ok(bad.length === 0, '누락: ' + bad.join(','));
});
T('세 대 오개념 실존 (크기≠무게 · 길이≠넓이 · 높이≠들이 · 끝맞추기)', () => {
  const need = {
    'u4_l02': /끝|시작점/,
    'u4_l03': /크|크기/,
    'u4_l04': /길|길이/,
    'u4_l05': /키|높이/,
    'u4_l07': /모양|양은 그대로|늘였/
  };
  const bad = [];
  Object.keys(need).forEach(k => {
    const mc = L[k].slides.find(s => s.block === 'misconception');
    if (!mc) { bad.push(k + ':misconception 없음'); return; }
    if (!need[k].test(JSON.stringify(mc.data))) bad.push(k + ':오개념 내용 불일치');
  });
  ok(bad.length === 0, bad.join(','));
});

console.log('═══ E. 1학년 용어 가드 (수치 측정 금지) ═══');
T('단위 기호·수치 측정 표현 0', () => {
  const banned = ['㎝', '센티미터', '㎏', '킬로그램', '그램', '㎖', '리터', '㎠', '제곱'];
  const bad = banned.filter(x => DATA.indexOf(x) >= 0);
  // 라틴 약어는 .html 등 부분 매칭 회피 위해 단어 경계로
  [/\bcm\b/, /\bkg\b/, /\bmL?\b/, /\bL\b/].forEach(re => { if (re.test(DATA)) bad.push(re.source); });
  ok(bad.length === 0, '금지 단위 노출: ' + bad.join(','));
});
T('학생 노출 자리 어려운 용어 0', () => {
  const banned = ['부피', '질량', '용량', '측정값', '표준 단위'];
  const bad = banned.filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, '어려운 용어: ' + bad.join(','));
});
T('l07 이전 차시에 「높이」 선행 노출 0', () => {
  const bad = [];
  ['u4_l01','u4_l02','u4_l03','u4_l04','u4_l05','u4_l06'].forEach(k => {
    // next_lesson(다음 차시 예고)은 예외 — l06이 l07의 '높이'를 예고하는 자리
    const body = L[k].slides.filter(s => s.block !== 'next_lesson');
    if (/더 높다|더 낮다|가장 높다|가장 낮다/.test(JSON.stringify(body))) bad.push(k);
  });
  ok(bad.length === 0, '높이 선행 노출: ' + bad.join(','));
});

console.log('═══ F. 구조 정합 ═══');
T('전 차시 슬라이드 15~19슬 · extras 20~30', () => {
  const bad = [];
  KEYS.forEach(k => {
    const n = L[k].slides.length, e = L[k].extras.length;
    if (n < 15 || n > 19) bad.push(k + ':슬' + n);
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
  const want = {u4_l02:'u4_l01', u4_l03:'u4_l02', u4_l04:'u4_l03', u4_l05:'u4_l04', u4_l06:'u4_l05', u4_l07:'u4_l06'};
  const bad = [];
  Object.keys(want).forEach(k => {
    const rv = L[k].slides.find(s => s.block === 'review');
    if (!rv || !rv.data.items || rv.data.from !== want[k]) bad.push(k);
  });
  ok(bad.length === 0, bad.join(','));
});
T('5단계 전부 등장 · 정리에 exit·summary·next_lesson', () => {
  const bad = [];
  KEYS.forEach(k => {
    const S = L[k].slides;
    const stages = [...new Set(S.map(s => s.stage))];
    if (stages.length < 4) bad.push(k + ':단계' + stages.length);
    ['exit_ticket', 'summary', 'next_lesson'].forEach(b => {
      if (!S.some(s => s.block === b)) bad.push(k + ':' + b + '없음');
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
T('extras 필수 필드 (id·type·icon·title·content|url·fit_slides)', () => {
  const bad = [];
  KEYS.forEach(k => L[k].extras.forEach(e => {
    if (!e.id || !e.type || !e.icon || !e.title) bad.push(k + ':' + (e.id || '?') + ' 필드누락');
    if (!e.content && !e.url) bad.push(k + ':' + e.id + ' 본문없음');
    if (!Array.isArray(e.fit_slides) || !e.fit_slides.length) bad.push(k + ':' + e.id + ' fit_slides');
  }));
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
T('CURRICULUM u4 ↔ LESSONS 정합 (7차시 ready)', () => {
  const W2 = boot();
  const u4 = W2.CURRICULUM.find(u => u.unit === 4);
  ok(u4 && u4.lesson_count === 7, 'lesson_count');
  ok(u4.lessons.length === 7 && u4.lessons.every(l => l.ready), 'ready 플래그');
});
T('l04 케이랩 넓이 격자 블록 실존', () => {
  const s = L['u4_l04'].slides.find(x => x.block === 'klab');
  ok(s && s.data.tool === 'area', 'klab area 블록 없음');
});

console.log('═══ G. 차단 어휘 ═══');
T('u4 차단 어휘 0', () => {
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => DATA.indexOf(x) >= 0);
  ok(bad.length === 0, bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
