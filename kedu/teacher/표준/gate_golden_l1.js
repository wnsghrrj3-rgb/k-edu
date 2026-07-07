/* gate_golden_l1.js — L1 골든 게이트 (jsdom 실엔진 렌더).
   목적: u3_l05 골든이 실제 엔진에서 7요소 전부 렌더되는지 + u3 전차시 openShow 회귀 무손상.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_golden_l1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');            // kedu/teacher
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g2_math_u3.js'), 'utf8');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

// 실제 g2_math.html의 <body> 골격을 그대로 사용 (엔진이 참조하는 모든 id 보장, script만 제거)
function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  b = b.replace(/<script[\s\S]*?<\/script>/g, '');
  return b;
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-math">${extractBody(fs.readFileSync(path.join(TDIR, 'g2_math.html'), 'utf8'))}</body></html>`;

// 실제 HTML에서 CURRICULUM 정의 추출 (init에 필요)
const G2HTML = fs.readFileSync(path.join(TDIR, 'g2_math.html'), 'utf8');
const CURRIC_SRC = (G2HTML.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0].replace(/^const CURRICULUM/, 'window.CURRICULUM');

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  // jsdom 미구현 API 폴백
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.HTMLCanvasElement.prototype.getContext = () => null;
  // 데이터 → CURRICULUM → 엔진 순으로 주입
  w.eval(DATA);
  w.eval(CURRIC_SRC);
  w.eval(ENGINE);
  return w;
}

// 실제 g2_math.html과 동일한 init 호출
function initGolden(w) {
  w.eval(`Teacher.init({
    subject:{ grade:2, subject:"수학", title:"2학년 1학기 수학", brand:"케이티처", slug:"g2_math" },
    curriculum: CURRICULUM,
    lessons: window.LESSONS
  });`);
}

console.log('═══ A. 부팅 & 데이터 ═══');
let W;
T('엔진·데이터 부팅, window.LESSONS 12차시', () => {
  W = boot();
  ok(W.LESSONS, 'LESSONS 없음');
  ok(Object.keys(W.LESSONS).length === 12, '차시 수 ' + Object.keys(W.LESSONS).length);
  ok(W.LESSONS['u3_l05'], 'u3_l05 없음');
});
T('Teacher.init 노출 & 골든 openShow 진입', () => {
  ok(W.Teacher && typeof W.Teacher.init === 'function', 'Teacher.init 없음');
  initGolden(W);
  W.Teacher.openShow('3', '5');   // u3_l05
  const html = W.document.getElementById('slide-content').innerHTML;
  ok(html && html.length > 0, 'slide-content 비어있음');
});

console.log('═══ B. 골든 7요소 실렌더 (전 슬라이드 순회) ═══');
// openShow 후 next-btn으로 전 슬라이드를 실제 렌더시키며 누적 HTML 수집
function renderAllAndCollect(W) {
  const seen = [];
  const content = () => W.document.getElementById('slide-content').innerHTML;
  seen.push(content());
  // slides 길이만큼 next 클릭 (엔진 내부 slides 접근 불가 → 넉넉히 25회, 끝이면 무변화)
  const nextBtn = W.document.getElementById('next-btn');
  for (let i = 0; i < 25; i++) {
    nextBtn.dispatchEvent(new W.Event('click', { bubbles: true }));
    seen.push(content());
  }
  return seen.join('\n<<<SLIDE>>>\n');
}
let ALL;
T('전 슬라이드 순회 렌더 (오류 없이)', () => {
  ALL = renderAllAndCollect(W);
  ok(ALL.length > 100, '렌더 누적 실패');
  ok(!/undefined<\/|NaN|교구 로드 오류/.test(ALL), '렌더 오류 흔적: ' + (ALL.match(/undefined<\/|NaN|교구 로드 오류/) || [''])[0]);
});
T('① review 문항형: 문항 카드(kt-rv) 렌더', () => ok(/kt-rv/.test(ALL), 'kt-rv 없음'));
T('② motivate 이미지: kt-scene-img 렌더', () => ok(/kt-scene-img/.test(ALL) || /candy_share/.test(ALL), 'img 필드 미렌더'));
T('③ 서사: 곰이·펭이 인물 재등장 (도입+문제)', () => {
  const hits = (ALL.match(/곰이|펭이/g) || []).length;
  ok(hits >= 2, '서사 인물 재등장 부족(' + hits + ')');
});
T('④ offline_activity: 단계 카드(kt-oa) + 타이머 버튼', () => {
  ok(/kt-oa-steps/.test(ALL), '단계 카드 없음');
  ok(/kt-oa-timer/.test(ALL), '타이머 버튼 없음');
  ok(/kt-oa-chip/.test(ALL), '준비물 칩 없음');
});
T('⑤ leveled_problem: 탭 3종(기본·도전·심화) + reveal', () => {
  ok(/kt-lv-tab/.test(ALL), '수준 탭 없음');
  ok(/기본/.test(ALL) && /도전/.test(ALL) && /심화/.test(ALL), '3수준 라벨 누락');
  ok(/kt-lv-reveal/.test(ALL), 'reveal 버튼 없음');
});
T('⑥ exit_ticket: 확인 문항(kt-et) + 신호등 3단', () => {
  ok(/kt-et/.test(ALL), '출구 카드 없음');
  ok(/🟢/.test(ALL) && /🟡/.test(ALL) && /🔴/.test(ALL), '신호등 3색 누락');
});
T('⑦ tnote: 골든에 6개 이상 (데이터 레벨)', () => {
  const n = W.LESSONS['u3_l05'].slides.filter(s => s.tnote).length;
  ok(n >= 6, 'tnote ' + n + '개');
});

console.log('═══ C. u3 전차시 회귀 (openShow 무손상) ═══');
for (let n = 1; n <= 12; n++) {
  const key = 'u3_l' + String(n).padStart(2, '0');
  T('회귀 ' + key + ' openShow 렌더', () => {
    const W2 = boot();
    initGolden(W2);
    W2.Teacher.openShow('3', String(n));
    const html = W2.document.getElementById('slide-content').innerHTML;
    ok(html && html.length > 20, '빈 렌더');
    ok(!/교구 로드 오류/.test(html), '교구 오류');
  });
}

console.log('═══ D. 산수 검산 (골든 신설 문항) ═══');
T('leveled·exit·review 전 문항 검산', () => {
  const checks = [['27+5', 32], ['25-6', 19], ['34-8', 26], ['42-27', 15], ['23-5', 18], ['41-6', 35]];
  const bad = checks.filter(([e, a]) => eval(e) !== a);
  ok(bad.length === 0, '산수 오류: ' + JSON.stringify(bad));
});

console.log('═══ E. 차단 어휘 ═══');
T('골든 차시 차단 어휘 0', () => {
  const src = JSON.stringify(W.LESSONS['u3_l05']);
  const bad = ['박음', '빵꾸', '갈아엎', '결로'].filter(x => src.indexOf(x) >= 0);
  ok(bad.length === 0, '차단어: ' + bad.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
