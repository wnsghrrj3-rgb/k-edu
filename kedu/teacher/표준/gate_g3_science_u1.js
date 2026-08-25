/* gate_g3_science_u1.js — 케이티처 g3 과학 u1 「힘과 우리 생활」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_korean_u6.js 복제. **과학 라인 첫 게이트**라 국어에서 온 갈래 중
      과목을 타는 것들은 전부 갈아 끼웠다. 복제할 사람은 아래를 먼저 읽을 것.

   (갈림 ①) **9항목 10차시**다. 건너뛰는 키는 **`u1_l08` 하나뿐**.
       ⚠️ 국어 게이트의 SKIPPED(다섯·여섯)를 복제하면 즉시 어긋난다.
   (갈림 ②) **2차시 묶음은 l07 하나**(80분·24슬·period_split "s12"·covers 가운뎃점).
       단일 여덟(40분·19슬) · 3차시 묶음 0 → **36슬 항목 0 · 물결 covers 0 ·
       3교시 표시 0**을 거꾸로 못 박는다. 총합 176슬 = 19×8 + 24 · 400분 = 40×8 + 80.
   (갈림 ③) **l01만 review가 없다** — 과학 라인 자체의 첫 항목이라 계승할 직전
       항목이 없다. 그래서 l01은 concept가 넷이다. 계보는 단원을 넘지 않는
       8연쇄(l02<-l01 → … → l10<-l09) → **앞 단원 데이터 동반 로드가 필요 없다**.
       ⚠️ 국어 게이트의 "전 항목 review 실존"과 "u5 동반 로드"를 복제하면 죽는다.
   (신규 ①) **D-2 수평 판정 검산기** — `왼쪽 N개 ↔ 오른쪽 M개 = 판정` 선언 여섯을
       긁어 N>M이면 왼쪽으로 기욺 · N<M이면 오른쪽으로 기욺 · N=M이면 수평을 견준다.
   (신규 ②) **D-3 무게 견줌 검산기** — `물체 — N g → 무거움|가벼움` 선언 여섯을
       100 g 기준으로 견준다. ⚠️ **선언은 전부 g 단위여야 한다** — 숫자만 읽는
       검산기라 kg가 섞이면 통째로 어긋난다. kg 혼입 0을 함께 못 박는다.
   (신규 ③) **D-4 도구 갈래 판별 검산기** — `지레 — 도구` / `빗면 — 도구`
       **두 갈래를 함께** 건다. 한 갈래만 걸면 판별력이 0이다(국어 u5·u6 선례).
       ⚠️ 「경사로」는 `빗면 — 경사로` 꼴 선언이 아니라 판별 문제 보기로만 나온다.
          진리표에는 두되 선언 개수로 세지 않는다.
   ⚠️ **검산기에는 반드시 「검산 대상이 N건 이상 실존한다」는 줄을 함께 둘 것** —
      없으면 대상 0건에서 사이좋게 초록이 난다(국어 u6에서 겪은 함정).
   (신규 ④) **과학 최우선 가드 = 안전**(국어의 저작권 자리). 세 문구를 못 박는다.
   ⚠️ 「작용」을 단독 낱말로 걸면 안 된다 — l01이 "힘이 작용해요"를 학생 화면에
      직접 쓴다. 미도입 가드는 `작용점`·`작용과 반작용` 묶음으로만.
      같은 계열로 **`kg`는 l05가 정식으로 가르치는 단위**라 낱말로 걸면 오탐이다.
      `\bN\b`(뉴턴 기호)는 0건 실측이라 단어 경계로 걸 수 있다.
   ⚠️ 「받침점」은 학생 노출 용어다(본차시 l04가 직접 쓴다). 감추지 않되
      풀이말 「가운뎃점」 동반을 l04·l10 둘 다에서 검사한다.
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_science_u1.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 부팅 body class는 **`kt3 subj-science`**다(국어 게이트를 복제하면 subj-korean이 남는다).
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다.
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다(u2 태그 누락 선례).
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      lessons = **항목 수 9**이지 차시 수 10이 아니다.
   ⚠️ jsdom은 세션마다 새로 깔아야 한다.
   ⚠️ 게이트는 **k-edu 클론에서 돌릴 것** — handoff에는 `grade3/`가 없어 본차시 대조가 죽는다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_science_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const V3CSS = fs.readFileSync(path.join(TDIR, 'engine/teacher-v3.css'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_science_u1.js'), 'utf8');
/* 용어·안전 가드는 본문만 대상 — 머리 주석에 가드 목록 자체가 적혀 있어
   주석을 함께 걸면 게이트가 자기 주석에 걸려 넘어진다. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_science.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
const txt = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const sq = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');
const NOSTAR = BODY.replace(/\*/g, '');   /* 굵게 표시를 지운 갈래 — 본문 대조용 */

/* ⚠️ 9항목 10차시. 건너뛰는 키는 l08 하나뿐이다. */
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06', 'u1_l07', 'u1_l09', 'u1_l10'];
const NS = { u1_l01: 1, u1_l02: 2, u1_l03: 3, u1_l04: 4, u1_l05: 5, u1_l06: 6, u1_l07: 7, u1_l09: 9, u1_l10: 10 };
const PAIRED = ['u1_l07'];
const SINGLE = KEYS.filter(k => !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });
const SKIPPED = ['u1_l08'];

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/science/1단원_힘과우리생활');
const SFILE = {
  u1_l01: 'g3_sci_u1_l01_활짝과학열기.html',
  u1_l02: 'g3_sci_u1_l02_우리생활속힘.html',
  u1_l03: 'g3_sci_u1_l03_물체를밀거나당길때의힘.html',
  u1_l04: 'g3_sci_u1_l04_수평잡기로무게비교.html',
  u1_l05: 'g3_sci_u1_l05_저울로무게비교.html',
  u1_l06: 'g3_sci_u1_l06_도구를이용할때드는힘.html',
  u1_l07: 'g3_sci_u1_l07_창의가반짝과학놀이터.html',
  u1_l09: 'g3_sci_u1_l09_톡톡과학입는로봇.html',
  u1_l10: 'g3_sci_u1_l10_단원마무리.html'
};
const SRC = {};
KEYS.forEach(k => { SRC[k] = fs.readFileSync(path.join(SDIR, SFILE[k]), 'utf8'); });
const SRCALL = KEYS.map(k => SRC[k]);
const TXT = {};
KEYS.forEach(k => { TXT[k] = txt(SRC[k]); });
const TXTALL = KEYS.map(k => TXT[k]).join('\n');
const SQALL = SRCALL.map(sq).join('\n');

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
/* ⚠️ subj-science — 국어 게이트를 복제하면 subj-korean이 남는다 */
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-science">${extractBody(HOME)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  /* 엔진 스텁 3종 — 케이퀴즈 fetch · LESSONS 선초기화 · canvas getContext */
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:3,subject:"과학",title:"3학년 1학기 과학",brand:"케이티처",slug:"g3_science"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

function renderAll(w, unit, lesson, steps) {
  w.Teacher.openShow(String(unit), String(lesson));
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < steps; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

global.window = { LESSONS: {} };
eval(DATA);
const L = global.window.LESSONS;

function studentSlides(k, keepNext) {
  return L[k].slides
    .filter(x => keepNext || x.block !== 'next_lesson')
    .map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
}
const studentText = (k) => plain(studentSlides(k, true));
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u1 9항목 로드 (앞 단원 동반 로드 없음 — 과학 라인 첫 단원)', () => {
  W = boot();
  const k1 = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(k1.length === 9, 'u1 항목 ' + k1.length);
  ok(Object.keys(W.LESSONS).length === 9, '다른 단원이 함께 로드됨');
});
T('⚠️ 건너뛰는 키는 l08 하나뿐 (국어의 다섯·여섯을 복제하면 어긋난다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u1_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(SKIPPED.length === 1, '건너뛴 키 개수 ' + SKIPPED.length);
  /* 국어 SKIPPED를 그대로 복제하지 않았는지 역으로 못 박는다 */
  ['u1_l04', 'u1_l06', 'u1_l10'].forEach(k => ok(!!L[k], '국어 SKIPPED를 그대로 복제했다: ' + k));
});
T('슬라이드 id 0패딩 s01~sNN 연속', () => {
  KEYS.forEach(k => {
    L[k].slides.map(s => s.id).forEach((id, i) =>
      ok(id === 's' + String(i + 1).padStart(2, '0'), k + ' ' + id));
  });
});
T('⚠️ body class = kt3 subj-science · 과학 악센트가 CSS에 실존', () => {
  ok(/<body class="kt3 subj-science">/.test(HOME), '홈 body class 어긋남');
  ok(/body\.kt3\.subj-science\s*\{[^}]*--acc:/.test(V3CSS), 'teacher-v3.css에 과학 악센트 없음');
  ok(!/subj-korean|subj-math/.test(HOME), '다른 과목 class 잔재');
});

console.log('═══ B. 7요소 실렌더 ═══');
KEYS.forEach(k => {
  T(k + ' 7요소 실렌더', () => {
    const html = renderAll(W, 1, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ l01만 review가 없다 — 과학 라인 첫 항목 (역단언)', () => {
  ok(!L['u1_l01'].slides.some(s => s.block === 'review'),
     'l01에 review가 생겼다 — 계승할 직전 항목이 없다');
  const c = L['u1_l01'].slides.filter(s => s.block === 'concept').length;
  ok(c === 4, 'l01 concept ' + c + ' (review 자리를 concept가 메운다 — 넷)');
  KEYS.filter(k => k !== 'u1_l01').forEach(k =>
    ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
});
T('img 폴백 경로 실존 (9개 미생성 = 폴백 정상)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/science\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
});

console.log('═══ C. 회귀 (9항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, 1, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
const inSrc = (k, s) => ok(TXT[k].includes(s), k + ' 본차시 근거 없음: ' + s);
const inBody = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const both = (k, s) => { inSrc(k, s); inBody(s); };

T('① l01 놀이·힘 알아차리기 원문 일치', () => {
  ['공을 밀어 페트병을 넘어뜨리는 놀이를 해요.',
   '우리 생활에서 힘과 관련된 것에 호기심을 가져요.',
   '공을 발로 차요', '미는 힘과 당기는 힘'].forEach(s => both('u1_l01', s));
});
T('② l02 생활 속 힘 · 오개념 직격 원문 일치', () => {
  ['우리 생활 속에서 힘을 찾아봐요.',
   '일상에서 힘과 관련된 일에 관심을 가져요.',
   '멈춰 있는 물체는 스스로 움직이지 않아요.',
   '손으로 잡아 힘을 줘요', '멈추게 하는 힘'].forEach(s => both('u1_l02', s));
});
T('③ l03 무게↑ → 힘↑ · 탐구 과정 원문 일치', () => {
  ['무거운 물체와 가벼운 물체를 밀어 봐요.',
   '예상하고, 직접 확인하고, 견주어 봐요.',
   '물체가 무거울수록 움직일 때 큰 힘이 들어요.',
   '물건이 가득 찬 상자', '더 큰 힘이 들어요'].forEach(s => both('u1_l03', s));
});
T('④ l04 수평 잡기 판정 원문 일치', () => {
  ['수평 잡기 활동을 해 봐요.', '왼쪽 물체가 더 무거워요',
   '무거운 쪽으로 기울어요'].forEach(s => both('u1_l04', s));
});
T('⑤ l05 저울·무게 단위 원문 일치', () => {
  ['저울이 왜 필요한지 알아봐요.', '무게의 단위 g·kg을 알아요.',
   '저울을 사용해요', 'g(그램), kg(킬로그램)'].forEach(s => both('u1_l05', s));
});
T('⑥ l06 지레·빗면 도입 원문 일치', () => {
  ['지레와 빗면 같은 도구를 알아봐요.',
   '도구를 쓰면 드는 힘이 어떻게 달라지는지 봐요.',
   '도구를 쓰면 작은 힘으로 들 수 있어요.', '작은 힘이 들어요'].forEach(s => both('u1_l06', s));
});
T('⑦ l07 도구 찾기 마당 원문 일치 (2차시 묶음)', () => {
  ['우리 생활 속 지레·빗면 도구를 찾아봐요.',
   '어떤 일에 어떤 도구를 쓰면 좋은지 골라 봐요.',
   '찾은 도구를 친구들과 나누고 이야기해요.',
   '경사로(빗면)로 밀어 올려요'].forEach(s => both('u1_l07', s));
});
T('⑧ l09 입는 로봇 원문 일치', () => {
  ['입는 로봇이 무엇인지 알아봐요.',
   '입는 로봇을 입으면 힘이 어떻게 달라지는지 봐요.',
   '입는 로봇이 어디에 쓰이는지 찾아봐요.',
   '몸에 입어 힘을 더해 주는 기계', '작은 힘으로 들 수 있어요'].forEach(s => both('u1_l09', s));
});
T('⑨ l10 단원 마무리 원문 일치', () => {
  ['1단원에서 배운 것을 한눈에 정리해요.',
   '힘·무게·도구를 얼마나 알았는지 확인해요.',
   '힘은 물체를 움직이게도 멈추게도 해요.',
   '움직이게도, 멈추게도 해요'].forEach(s => both('u1_l10', s));
});
T('⑩ 단원 낱말 3종 (sq 갈래 대조 — 칸에 갈라 담긴다)', () => {
  ['힘', '무게', '도구'].forEach(w => {
    ok(SQALL.includes(sq(w)), '본차시 근거 없음: ' + w);
    ok(NOSTAR.includes(w), '본문 누락: ' + w);
  });
});

console.log('═══ D-2. 수평 판정 검산기 (과학 첫 번째 기계 검산) ═══');
const judge = (a, b) => (a === b ? '수평' : a > b ? '왼쪽으로 기욺' : '오른쪽으로 기욺');
T('⚠️ 판정기 자체 검증 (세 갈래 전부)', () => {
  ok(judge(3, 3) === '수평', '같음을 못 잡는다');
  ok(judge(5, 2) === '왼쪽으로 기욺', '왼쪽을 못 잡는다');
  ok(judge(1, 4) === '오른쪽으로 기욺', '오른쪽을 못 잡는다');
});
const BAL = [...NOSTAR.matchAll(/왼쪽 (\d+)개 ↔ 오른쪽 (\d+)개 = (수평|왼쪽으로 기욺|오른쪽으로 기욺)/g)]
  .map(m => [+m[1], +m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 수평 판정 선언이 여섯 이상', () => {
  ok(BAL.length >= 6, '선언 ' + BAL.length + '개 — 검산 대상이 죽었다');
});
T('⚠️ 수평 판정 선언 전수 검산 (같음·왼쪽·오른쪽 세 갈래를 함께)', () => {
  const bad = BAL.filter(([a, b, v]) => judge(a, b) !== v)
    .map(([a, b, v]) => a + '↔' + b + ' = ' + v + ' (기대 ' + judge(a, b) + ')');
  ok(bad.length === 0, bad.join(' / '));
  /* 한 갈래만 있으면 판별력이 0이다 — 세 갈래가 전부 실존해야 한다 */
  const kinds = new Set(BAL.map(x => x[2]));
  ok(kinds.size === 3, '판정 갈래 ' + kinds.size + '종 — 세 갈래를 함께 걸어야 한다');
});
T('본차시가 수평 판정을 실제로 가르친다 (근거 확인)', () => {
  ['수평', '기울', '같은 거리'].forEach(w => ok(TXT['u1_l04'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 무게 견줌 검산기 (100 g 기준) ═══');
const heavy = (g) => (g >= 100 ? '무거움' : '가벼움');
T('⚠️ 판정기 자체 검증 (양쪽)', () => {
  ok(heavy(5) === '가벼움' && heavy(3000) === '무거움', '판정기가 뒤집혔다');
  ok(heavy(100) === '무거움' && heavy(99) === '가벼움', '기준선이 어긋났다');
});
const WT = [...NOSTAR.matchAll(/([가-힣]{1,6}) — (\d+) ?g → (무거움|가벼움)/g)]
  .map(m => [m[1], +m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 무게 선언이 여섯 이상', () => {
  ok(WT.length >= 6, '선언 ' + WT.length + '개 — 검산 대상이 죽었다');
});
T('⚠️ 무게 선언 전수 검산 · 두 갈래 함께 실존', () => {
  const bad = WT.filter(([n, g, v]) => heavy(g) !== v)
    .map(([n, g, v]) => n + ' ' + g + 'g → ' + v + ' (기대 ' + heavy(g) + ')');
  ok(bad.length === 0, bad.join(' / '));
  ok(WT.some(x => x[2] === '무거움') && WT.some(x => x[2] === '가벼움'),
     '한 갈래만 선언됐다 — 판별력이 0이다');
});
T('⚠️ 선언에 kg 혼입 0 (숫자만 읽는 검산기라 섞이면 통째로 어긋난다)', () => {
  const kg = [...NOSTAR.matchAll(/[가-힣]{1,6} — \d+ ?kg → (?:무거움|가벼움)/g)].map(m => m[0]);
  ok(kg.length === 0, 'kg 선언: ' + kg.join(','));
  /* ⚠️ kg 낱말 자체는 금지어가 아니다 — l05가 정식으로 가르치는 단위다 */
  ok(NOSTAR.includes('g·kg'), '무게 단위를 가르치는 자리가 사라졌다');
});
T('본차시가 무게 값을 실제로 준다 (근거 확인 — 넷)', () => {
  [['동전', 5], ['연필', 10], ['가방', 1500], ['수박', 3000]].forEach(([n, g]) => {
    ok(TXT['u1_l05'].includes(n), '본차시에 ' + n + ' 없음');
    ok(TXT['u1_l05'].includes(g + ' g'), '본차시에 ' + n + ' 무게값 ' + g + ' g 없음');
  });
});

console.log('═══ D-4. 도구 갈래 판별 검산기 (두 갈래를 함께) ═══');
/* 진리표. ⚠️ 「경사로」는 판별 문제 보기로만 나온다 — 선언 개수로 세지 않는다. */
const LEVER = ['가위', '병따개', '시소', '집게'];
const RAMP = ['미끄럼틀', '계단', '경사로', '비탈길'];
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  const dup = LEVER.filter(w => RAMP.includes(w));
  ok(dup.length === 0, '두 갈래에 겹친 도구: ' + dup.join(','));
});
const DL = [...NOSTAR.matchAll(/지레 — ([가-힣]{2,8})/g)].map(m => m[1]);
const DR = [...NOSTAR.matchAll(/빗면 — ([가-힣]{2,8})/g)].map(m => m[1]);
T('⚠️ 검산 대상 실존 — 두 갈래 각각 셋 이상 (한 갈래만 걸면 판별력 0)', () => {
  ok(DL.length >= 3, '지레 선언 ' + DL.length + '건');
  ok(DR.length >= 3, '빗면 선언 ' + DR.length + '건');
  ok(DL.length + DR.length >= 10, '선언 합 ' + (DL.length + DR.length) + '건');
});
T('⚠️ 지레 갈래 전수 — 진리표와 일치 · 빗면 도구 혼입 0', () => {
  const bad = DL.filter(w => !LEVER.includes(w));
  ok(bad.length === 0, '지레로 선언된 빗면·미상 도구: ' + bad.join(','));
});
T('⚠️ 빗면 갈래 전수 — 진리표와 일치 · 지레 도구 혼입 0', () => {
  const bad = DR.filter(w => !RAMP.includes(w));
  ok(bad.length === 0, '빗면으로 선언된 지레·미상 도구: ' + bad.join(','));
});
T('본차시가 두 갈래 도구를 실제로 준다 (근거 확인)', () => {
  const t67 = TXT['u1_l06'] + TXT['u1_l07'];
  ['가위', '병따개', '시소', '미끄럼틀', '계단', '경사로'].forEach(w =>
    ok(t67.includes(w), '본차시 근거 없음: ' + w));
  ok(TXT['u1_l06'].includes('지레') && TXT['u1_l06'].includes('빗면'), '본차시 갈래 이름 없음');
});

console.log('═══ E. 안전 · 용어 가드 (과학 최우선 = 안전) ═══');
T('⚠️ 안전 3문구 실존 — 과학 최우선 가드 (국어의 저작권 자리)', () => {
  const l03 = studentText('u1_l03'), l04 = studentText('u1_l04'), l05 = studentText('u1_l05');
  ok(/무리해서/.test(l03) && /들지/.test(l03), 'l03 무거운 물건 안전 문구 없음');
  ok(/장난치지/.test(l04), 'l04 수평대·자 안전 문구 없음');
  ok(/세게 당기/.test(l05), 'l05 용수철저울 안전 문구 없음');
  /* 본차시가 실제로 안전을 짚는지 근거 확인 */
  ok(TXT['u1_l03'].includes('무리해서'), '본차시 l03 근거 없음');
  ok(TXT['u1_l04'].includes('장난'), '본차시 l04 근거 없음');
  ok(TXT['u1_l05'].includes('세게 당기'), '본차시 l05 근거 없음');
});
T('⚠️ 상표 가드 — l09 입는 로봇 차시에 회사·제품 이름 0건', () => {
  const BRAND = ['삼성', '엘지', 'LG', '현대', '기아', '보스턴', '다이내믹스', '혼다', '도요타',
                 '테슬라', '사이버다인', 'HAL', '엑소스켈레톤', '아이언맨', '마블'];
  const hit = BRAND.filter(w => studentText('u1_l09').includes(w));
  ok(hit.length === 0, hit.join(','));
  /* 이름 대신 하는 일로 쓴다 */
  ok(studentText('u1_l09').includes('몸에 입어'), '하는 일로 쓴 자리가 없다');
});
T('미도입 갈래(4학년 이상·중등 소관) 학생 노출 0', () => {
  const BAN = ['작용점', '작용과 반작용', '마찰력', '탄성력', '중력', '자기력', '전기력',
               '질량', '밀도', '부피', '일의 양', '역학적', '지렛대의 원리',
               '받침점과 힘점', '뉴턴', '중심축', '토크'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* ⚠️ 「작용」 단독은 걸지 않는다 — l01이 "힘이 작용해요"를 직접 쓴다 */
  ok(STUDENT.includes('작용'), 'l01의 "힘이 작용해요"가 사라졌다 — 단독 가드를 걸었는지 확인');
  /* 뉴턴 기호는 단어 경계로 걸 수 있다 (0건 실측) */
  ok(!/\bN\b/.test(NOSTAR.replace(/[A-Za-z]{2,}/g, '')), '뉴턴 기호 N 노출');
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['변인 통제', '정성 관찰'].forEach(w => {
    ok(!STUDENT.includes(w), '학생 노출: ' + w);
    ok(TNOTE.includes(w), 'tnote에 없음 — 대상 0건에서 사이좋게 초록이 난다: ' + w);
  });
  ['조작 변인', '통제 변인', '정량 관찰', '가설 검증'].forEach(w =>
    ok(!STUDENT.includes(w), '학생 노출: ' + w));
});
T('⚠️ 「받침점」은 학생 노출 용어 — 풀이말 「가운뎃점」 동반 (l04·l10 둘 다)', () => {
  ok(TXT['u1_l04'].includes('받침점'), '본차시 l04가 받침점을 쓰지 않는다 — 단언 재검토');
  ['u1_l04', 'u1_l10'].forEach(k => {
    const t = studentText(k);
    ok(t.includes('받침점'), k + '에 받침점이 없다');
    ok(t.includes('가운뎃점'), k + '에 풀이말 가운뎃점이 없다');
  });
  /* 도입 전 차시에는 나오지 않는다 */
  ['u1_l01', 'u1_l02', 'u1_l03'].forEach(k =>
    ok(!plain(studentSlides(k, false)).includes('받침점'), k + '에 받침점 선행'));
});
T('⚠️ 선행 용어 5갈래 — 무게 l03 · 수평 잡기 l04 · 저울 l05 · 지레/빗면 l06 · 입는 로봇 l09', () => {
  /* ⚠️ 가드 대상은 slides만 — extras는 뺀다(국어 게이트 선례 계승).
     예외는 next_lesson 블록뿐이다. */
  const pre = (k, w) => ok(!plain(studentSlides(k, false)).includes(w), k + ' 본문에 ' + w + ' 선행');
  ['u1_l01', 'u1_l02'].forEach(k => pre(k, '무게'));
  ['u1_l01', 'u1_l02', 'u1_l03'].forEach(k => pre(k, '수평 잡기'));
  ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04'].forEach(k => pre(k, '저울'));
  ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05'].forEach(k => { pre(k, '지레'); pre(k, '빗면'); });
  ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06', 'u1_l07'].forEach(k => pre(k, '입는 로봇'));
  /* 도입 자리에는 실존해야 한다 */
  ok(studentText('u1_l03').includes('무게'), 'l03에 무게 도입 없음');
  ok(studentText('u1_l04').includes('수평 잡기'), 'l04에 수평 잡기 도입 없음');
  ok(studentText('u1_l05').includes('저울'), 'l05에 저울 도입 없음');
  ok(studentText('u1_l06').includes('지레') && studentText('u1_l06').includes('빗면'), 'l06에 지레·빗면 도입 없음');
  ok(studentText('u1_l09').includes('입는 로봇'), 'l09에 입는 로봇 도입 없음');
});
T('⚠️ next_lesson 예외가 실제로 예고를 한다 (l04→저울 · l05→지레·빗면 · l07→입는 로봇)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(nx('u1_l04').includes('저울'), 'l04 next_lesson이 저울을 예고하지 않음');
  ok(/지레|빗면/.test(nx('u1_l05')), 'l05 next_lesson이 도구를 예고하지 않음');
  ok(nx('u1_l07').includes('로봇'), 'l07 next_lesson이 입는 로봇을 예고하지 않음');
});
T('⚠️ 성취기준 항목별 선언 (본차시 지도서 쪽수 기준 실측)', () => {
  const STD = { u1_l01: '[4과01-01]', u1_l02: '[4과01-01]', u1_l03: '[4과01-02]',
                u1_l04: '[4과01-02]', u1_l05: '[4과01-03]', u1_l06: '[4과01-04]',
                u1_l07: '[4과01-04]', u1_l09: '[4과01-04]', u1_l10: '단원 전체 통합' };
  KEYS.forEach(k => ok(L[k].meta.std === STD[k], k + ' std ' + L[k].meta.std));
  ok(new Set(Object.values(STD)).size === 5, '성취기준 갈래 수가 어긋남');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 (36슬 항목 0)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음이 생겼다');
});
T('⚠️ 슬라이드 총합 176슬 (19×8 + 24) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 176, '총합 ' + tot);
  ok(tot === 19 * SINGLE.length + 24 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('extras 전 항목 20개 · 참조 무결성 · 중복 0', () => {
  KEYS.forEach(k => {
    const ex = L[k].extras;
    ok(ex.length === 20, k + ' extras ' + ex.length);
    const ids = ex.map(e => e.id);
    ok(new Set(ids).size === ids.length, k + ' extras id 중복');
    const set = new Set(ids);
    L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id =>
      ok(set.has(id), k + ' ' + s.id + ' 깨진 참조 ' + id)));
    ex.forEach(e => ok(e.type && e.icon && e.title && e.content && e.fit_slides,
      k + ' extras 필드 누락 ' + e.id));
  });
  const tot = KEYS.reduce((a, k) => a + L[k].extras.length, 0);
  ok(tot === 180, 'extras 총합 ' + tot);
});
T('tnote 6슬 이상 · 구조 정합 (총 94슬)', () => {
  let tot = 0;
  KEYS.forEach(k => {
    const t = L[k].slides.filter(s => s.tnote);
    tot += t.length;
    ok(t.length >= 6, k + ' tnote ' + t.length);
    t.forEach(s => {
      ok(Array.isArray(s.tnote.ask) && s.tnote.ask.length >= 1, k + ' ' + s.id + ' ask');
      ok(typeof s.tnote.watch === 'string' && s.tnote.watch.length > 5, k + ' ' + s.id + ' watch');
      ok(typeof s.tnote.min === 'number' && s.tnote.min > 0, k + ' ' + s.id + ' min');
    });
  });
  ok(tot === 94, 'tnote 총합 ' + tot);
});
T('⚠️ 3차시 묶음 0 — covers 물결 0건 · period_split 경계는 전부 하나', () => {
  KEYS.forEach(k => {
    ok(!/~/.test(L[k].meta.covers), k + ' covers에 물결 ' + L[k].meta.covers);
    ok(L[k].meta.duration_min !== 120, k + ' 120분 항목이 생겼다');
    if (L[k].meta.period_split)
      ok(!L[k].meta.period_split.includes(','), k + ' 경계가 둘 ' + L[k].meta.period_split);
  });
});
T('⚠️ 2차시 묶음 = l07 하나 · 80분 · covers 가운뎃점 · period_split s12', () => {
  ok(PAIRED.length === 1, '2차시 묶음 개수 ' + PAIRED.length);
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 단일 차시 = 40분 · period_split 없음 · covers 단수 (여덟)', () => {
  ok(SINGLE.length === 8, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 40, k + ' ' + m.duration_min + '분');
    ok(!m.period_split, k + ' period_split 있음');
    ok(!/[·~]/.test(m.covers), k + ' covers ' + m.covers);
  });
});
T('⚠️ 수업시간 합 = 10차시 × 40분 = 400분 — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 400, '합 ' + tot);
  ok(tot === 40 * SINGLE.length + 80 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('⚠️ 교시 경계 슬라이드 tnote가 교시 끝을 적는다', () => {
  PAIRED.forEach(k => {
    const s = L[k].slides.find(x => x.id === L[k].meta.period_split);
    ok(s, k + ' 경계 슬라이드 없음');
    ok(s.block === 'self_assessment', k + ' 경계 블록 ' + s.block);
    ok(s.tnote && /1교시/.test(s.tnote.watch), k + ' 교시 경계 미기재');
  });
});
T('⚠️ 2교시 시작은 s13 (제목이 이어짐을 밝힌다) · 3교시 표시 0', () => {
  PAIRED.forEach(k => {
    const s13 = L[k].slides.find(x => x.id === 's13');
    ok(s13 && /2교시/.test(s13.data.title || ''), k + ' 2교시 표시 없음');
  });
  KEYS.forEach(k =>
    ok(!L[k].slides.some(x => /3교시/.test((x.data && x.data.title) || '')),
       k + '에 3교시 표시 — u1에는 3차시 묶음이 없다'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 · 8연쇄 · 단원을 넘지 않는다', () => {
  const chain = [['u1_l02', 'u1_l01'], ['u1_l03', 'u1_l02'], ['u1_l04', 'u1_l03'],
                 ['u1_l05', 'u1_l04'], ['u1_l06', 'u1_l05'], ['u1_l07', 'u1_l06'],
                 ['u1_l09', 'u1_l07'], ['u1_l10', 'u1_l09']];
  ok(chain.length === 8, '계보 길이 ' + chain.length);
  chain.forEach(([k, from]) => {
    const rv = L[k].slides.find(s => s.block === 'review');
    ok(rv.data.from === from, k + ' from ' + rv.data.from + ' (기대 ' + from + ')');
    const ex = L[from].slides.find(s => s.block === 'exit_ticket');
    ok(ex, from + ' exit 없음');
    ok(JSON.stringify(rv.data.items) === JSON.stringify(ex.data.items),
       k + ' review가 ' + from + ' exit를 그대로 계승하지 않음');
    ok(/^u1_/.test(from), k + ' 계보가 단원을 넘었다 — 앞 단원 동반 로드가 필요해진다');
  });
});
T('exit_ticket = 확인 3문항 + 신호등 3', () => {
  KEYS.forEach(k => {
    const e = L[k].slides.find(s => s.block === 'exit_ticket');
    ok(e.data.items.length === 3, k + ' exit 문항 ' + e.data.items.length);
    e.data.items.forEach(i => ok(i.q && i.a, k + ' exit q·a 누락'));
    ok(e.data.self.length === 3, k + ' 신호등 ' + e.data.self.length);
  });
});
T('leveled = 기본·도전·심화 3수준 · 심화 open (전 항목 1개 — 3차시 묶음이 없다)', () => {
  KEYS.forEach(k => {
    const lv = L[k].slides.filter(s => s.block === 'leveled_problem');
    ok(lv.length === 1, k + ' leveled ' + lv.length);
    lv.forEach(s => {
      const v = s.data.levels;
      ['기본', '도전', '심화'].forEach(n => ok(v[n] && v[n].q && v[n].a, k + ' ' + n + ' 누락'));
      ok(v['심화'].open === true, k + ' 심화 open 아님');
      ['기본', '도전'].forEach(n => ok(Array.isArray(v[n].steps) && v[n].steps.length >= 3,
        k + ' ' + n + ' steps'));
    });
  });
});
T('offline_activity = 전 항목 유지 · 준비물·분 실존 (전 항목 1개)', () => {
  KEYS.forEach(k => {
    const of = L[k].slides.filter(s => s.block === 'offline_activity');
    ok(of.length === 1, k + ' offline ' + of.length);
    of.forEach(s => {
      ok(['pair', 'group', 'whole'].includes(s.data.type), k + ' type ' + s.data.type);
      ok(s.data.steps.length >= 3, k + ' steps');
      ok(s.data.materials.length >= 2, k + ' materials');
      ok(s.data.minutes >= 8, k + ' minutes ' + s.data.minutes);
    });
  });
});
T('meta 정합 (grade·subject·unit·n·theme·live_url·본차시 실존)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(m.grade === 3 && m.subject === '과학' && m.unit === 1, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 힘 탐험대', k + ' theme ' + m.theme);
    ok(/^\.\.\/\.\.\/grade3\/semester1\/science\/1단원_/.test(m.live_url), k + ' live_url');
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
  });
});
T('CURRICULUM ↔ LESSONS 정합 (u1 블록 9항목 · ready 9 · n 목록 l08 건너뜀)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u2가 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*1,[\s\S]*?(?=unit:\s*2,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 1 블록 없음');
  ok(/lesson_count:\s*9/.test(blk), 'lesson_count 9 아님 (항목 수 9이지 차시 수 10이 아니다)');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok(!ns.includes(8), 'n 목록에 8이 있다 — l08은 l07에 묶였다');
  ok((blk.match(/ready:\s*true/g) || []).length === 9, 'ready 9 아님');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u2 태그 누락 실측 자리)', () => {
  ok(/<script src="data\/g3_science_u1\.js"><\/script>/.test(HOME),
     'u1 script 태그가 닫는 태그까지 성립하지 않는다');
  const open = (HOME.match(/<script[\s>]/g) || []).length;
  const close = (HOME.match(/<\/script>/g) || []).length;
  ok(open === close, 'script 여닫이 개수 불일치 ' + open + '/' + close);
});
T('홈 slug · 과목 · 복제 원본(국어) 잔재 0', () => {
  ok(/slug:\s*"g3_science"/.test(HOME), 'slug 어긋남');
  ok(/subject:\s*"과학"/.test(HOME), 'subject 어긋남');
  ok(!/g3_korean|g3_math/.test(HOME), '다른 과목 파일 잔재');
  /* ⚠️ 주석은 뺀다 — 머리 주석이 "국어 단원들은 다섯·여섯이었다"처럼 **의도적으로**
     국어를 견줌 대상으로 적는다. 주석째로 걸면 게이트가 그 설명에 걸려 넘어진다.
     걸러야 할 것은 복제 원본에서 딸려 온 **렌더 대상** 국어다. */
  const noComment = HOME.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const hit = (noComment.match(/국어/g) || []);
  ok(hit.length === 0, '렌더 대상에 국어 잔재 ' + hit.length + '건');
  ok(/과학/.test(noComment), '과학 표기가 없다');
});
T('⚠️ 허브 "3_science" 등재 (units 3 · lessons 28) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_science":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_science 미등재');
  ok(+m[1] === 3, 'units ' + m[1]);
  ok(+m[2] === 28, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이지 차시 수가 아니다 (국어 u5에서 깨진 자리).
     u1 9항목 + u2 10항목 + u3 9항목 = 28. 단원이 늘 때마다 이 줄을 함께 올릴 것. */
  ok(+m[2] === KEYS.length + 10 + 9, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] !== 31, 'lessons에 차시 수 합 31을 넣었다 — 항목 수 28이어야 한다');
  /* g=3은 SUB_HIGH라 과학 카드가 실제로 뜬다 */
  ok(/id:\s*"science"/.test(HUB), '허브 SUB_HIGH에 과학이 없다');
});
T('⚠️ 허브 옆 줄 무영향 회귀 (3_korean 6/45 · 3_math 7/55)', () => {
  const k = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(k && +k[1] === 6 && +k[2] === 45, '3_korean 카운트가 흔들렸다');
  const t = HUB.match(/"3_math":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(t && +t[1] === 7 && +t[2] === 55, '3_math 카운트가 흔들렸다');
});
T('케이랩 매핑 없음 = 의도적 (상자·수평대·저울 실물이 화면 교구보다 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_science_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (놀이·발표 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
});
T('채움말 "자리" 0 (보호 어휘 제외)', () => {
  const hit = (BODY.match(/[가-힣]+\s자리(?!값|수|에서|에\s)/g) || [])
    .filter(s => !/(빈|제|학생|앉을|누울|한|두|세|네)\s*자리/.test(s));
  ok(hit.length === 0, hit.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
