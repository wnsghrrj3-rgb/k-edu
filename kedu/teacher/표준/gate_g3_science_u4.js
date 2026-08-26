/* gate_g3_science_u4.js — 케이티처 g3 과학 u4 「생물의 한살이」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_science_u3.js 복제. **과학 네 번째 단원**이라 u3에서 온 갈래 중
      단원을 타는 것들은 전부 갈아 끼웠다. 복제할 사람은 아래를 먼저 읽을 것.

   (갈림 ①) 🚨 **2차시 묶음이 둘이다.** `u4_l02`(2·3차시) · `u4_l08`(8·9차시).
       u1·u2·u3는 묶음이 하나뿐이었다 — **PAIRED를 하나로 복제하면 통째로 어긋난다.**
       총합 **181슬 = 19×7 + 24×2** · **440분 = 40×7 + 80×2** · tnote **98 = 10×7 + 14×2**.
   (갈림 ①-a) 🚨🚨 **케이티처 키 번호 = 차시 번호(n)다. 항목 순번이 아니다.**
       엔진 `lessonKey(unit, lesson)`가 CURRICULUM의 `n`을 그대로 `u4_l{0패딩}`으로
       바꿔 `LESSONS`를 찾는다(teacher-engine.js 1289줄). 그래서
       **건너뛰는 키 = l03·l09 둘 = 빠지는 n(3·9)과 정확히 같다.**
       n 목록 = [1,2,4,5,6,7,8,10,11].
       ⚠️ **이 게이트가 실제로 잡은 라이브 버그(2026-08-26)**: 첫 데이터가 항목 순번으로
       l01~l07·l09·l10을 붙여 **n=8·11 카드가 「차시 데이터 없음」으로 죽고
       n=4·5·6·7 카드가 엉뚱한 차시를 열었다.** u1~u3는 두 셈이 우연히 같아 안 보였다.
   (갈림 ①-b) ⚠️ **본차시 파일 번호는 키 번호와 다르다.** 자기주도 4단원은 항목 순번으로
       매겨 `g3_sci_u4_l07_창의과학놀이터.html`이 8·9차시다 → **SFILE은 키(n) → 파일 이름**
       매핑이지 같은 번호끼리가 아니다. u1~u3 게이트의 「번호가 같다」 전제를 복제하지 말 것.
   (갈림 ②) **l01 review가 `u3_l10` exit를 넘어 받는다** → **앞 단원(u3) 동반 로드 필수**.
       부팅 뒤 `Object.keys(W.LESSONS).length === 18`(u3 9 + u4 9). u1·u2는 싣지 않는다.
   (🚨 신규 함정 ①) **「잠자리」로는 l09 선행 가드를 못 건다.** 본차시 l02가
       「사마귀·잠자리·메뚜기처럼」으로, l03이 「닭·개구리·잠자리·뱀처럼」으로 먼저 쓴다.
       l09 도입 가드는 **「무당벌레」**로 건다. l02·l03에 잠자리가 실존하는지 역단언.
   (🚨 신규 함정 ②) **「빛」과 「햇빛」은 다른 낱말이다.** 본차시 l04가 「빛이 없으면」으로
       「빛」을 먼저 쓴다 → l05 도입 가드는 **「햇빛」만**. l04 본문에 「빛」 실존 ·
       「햇빛」 0 · l04 next_lesson에 「햇빛」 실존을 역단언으로 잠근다.
   (🚨 신규 함정 ③) **민들레는 풀이지만 여러해살이다**(l06 오개념 자리) — D-4 진리표에서
       「풀 = 한해살이」로 짜면 어긋난다.
   (🚨 신규 함정 ④) **성취기준이 다섯 갈래**(단원 전체 통합 · 4과04-01 · 4과04-02 ·
       4과04-03 · **4과12-03**). l07 하나만 4과12-03이다.
   (검산기 여섯 — 전부 「대상 N건 실존」 동반)
       D-2 알·새끼 `닭 — 알을 낳아요` 꼴 (BODY · **개·소·뱀·새 한 글자 넷 역확인**)
       D-3 번데기 유무 `배추흰나비 — 번데기 있음` (**STUDENT만** · tnote 오탐 「아이 — 번데기 있음」)
       D-4 사는 기간 `벼 — 한해살이` (**STUDENT만** · tnote 오탐 「아이 — 여러해살이」)
       D-5 조건 판정 `씨 싹트기 — 햇빛 → 아니다` (BODY · 기준 셋 · 갈래 둘 · 대상 둘)
       D-6 실험 조건 `물 실험 — 온도 → 같게 할 조건` (BODY · **표가 아니라 규칙**:
           실험마다 「다르게」가 **정확히 하나**, 「같게」가 둘 이상)
       D-7 다음 단계 사슬 `배추흰나비 · 애벌레 — 다음은 번데기` (BODY ·
           **왼쪽에 생물 이름을 함께** 적는다 — 배추흰나비의 알과 닭의 알이 부딪친다)
       ⚠️ **LEFT 검사를 이름 목록으로 짜면 안 된다** — 본문이 「강낭콩 · 감나무 · 벼」처럼
          가운뎃점을 구분자로 쓴다(u3에서 26건 오탐 실측). **선언 표지 자체를 세는 꼴**
          (`— 다음은` / `— 번데기 (있음|없음)` / `— (한해살이|여러해살이)`)로 짠다.
   (안전) **과학 최우선 가드 = 생명 존중.** u3의 「함부로 건드리지」·「가만히 관찰」을
       복제하면 u4 본차시엔 그 자리가 없어 레드다. u4는 「꾸준히 관찰」(l01) ·
       「함부로 만지지」(l02) · 「소중히 여」(l09) + 실험 뒤 「손을 씻」(l04·l05).
   ⚠️ **concept의 `note`는 학생 노출 갈래다** — 교사 몫 용어(완전 변태·불완전 변태·
      난생·태생)는 **tnote에만** 둔다.
   ⚠️ 채움말 「자리」 보호 어휘 = **같은 자리·제자리·잠자리**(「잠자리」가 「자리」로 걸린다).
   ⚠️ 본차시 근거 대조는 **`sq()`(공백 제거) 한 갈래**로만 잰다(u3의 교훈).
      u4는 태그→공백 갈래가 17건이나 깨진다 — 아래에 역확인 단언을 박았다.
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_science_u4.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 부팅 body class는 **`kt3 subj-science`**다.
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다(u5 대비).
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      lessons = **항목 수 합 37**(u1 9 + u2 10 + u3 9 + u4 9)이지 차시 수 합 41이 아니다.
   ⚠️ jsdom은 세션마다 새로 깔아야 한다.
   ⚠️ 게이트는 **k-edu 클론에서 돌릴 것** — handoff에는 `grade3/`가 없어 본차시 대조가 죽는다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_science_u4.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const V3CSS = fs.readFileSync(path.join(TDIR, 'engine/teacher-v3.css'), 'utf8');
/* ⚠️ 앞 단원 동반 로드 필수 — u4_l01의 review가 u3_l10을 넘어 받는다 */
const DATA3 = fs.readFileSync(path.join(TDIR, 'data/g3_science_u3.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_science_u4.js'), 'utf8');
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
const txt = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const sq = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');
const NOSTAR = BODY.replace(/\*/g, '');   /* 굵게 표시를 지운 갈래 — 본문 대조용 */

/* ⚠️ 9항목 11차시. 🚨 키 번호 = 차시 번호(n) — 엔진이 n으로 LESSONS를 찾는다. */
const KEYS = ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l05', 'u4_l06',
              'u4_l07', 'u4_l08', 'u4_l10', 'u4_l11'];
const NS = { u4_l01: 1, u4_l02: 2, u4_l04: 4, u4_l05: 5, u4_l06: 6,
             u4_l07: 7, u4_l08: 8, u4_l10: 10, u4_l11: 11 };
/* 🚨 묶음이 **둘**이다 — u1·u2·u3처럼 하나로 복제하면 총합·경계 검사가 전부 어긋난다 */
const PAIRED = ['u4_l02', 'u4_l08'];
const SINGLE = KEYS.filter(k => !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });
/* 🚨 건너뛰는 키 = 빠지는 n. 키 번호가 곧 차시 번호이므로 두 목록은 반드시 같다. */
const SKIPPED = ['u4_l03', 'u4_l09'];
const MISSING_N = [3, 9];

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/science/4단원_생물의한살이');
const SFILE = {
  u4_l01: 'g3_sci_u4_l01_활짝과학열기.html',
  u4_l02: 'g3_sci_u4_l02_배추흰나비의한살이.html',
  u4_l04: 'g3_sci_u4_l03_다양한동물의한살이.html',
  u4_l05: 'g3_sci_u4_l04_씨가싹트는조건.html',
  u4_l06: 'g3_sci_u4_l05_식물이자라는조건.html',
  u4_l07: 'g3_sci_u4_l06_여러가지식물의한살이.html',
  u4_l08: 'g3_sci_u4_l07_창의과학놀이터.html',
  u4_l10: 'g3_sci_u4_l09_톡톡과학잠자리애벌레.html',
  u4_l11: 'g3_sci_u4_l10_단원마무리.html'
};
const SRC = {};
KEYS.forEach(k => { SRC[k] = fs.readFileSync(path.join(SDIR, SFILE[k]), 'utf8'); });
const TXT = {};
KEYS.forEach(k => { TXT[k] = txt(SRC[k]); });
/* ⚠️ 본차시가 태그로 낱말을 가른다 — 근거 대조는 공백을 지운 SQ 갈래로 */
const SQ = {};
KEYS.forEach(k => { SQ[k] = sq(SRC[k]); });
const SQALL = KEYS.map(k => SQ[k]).join('\n');

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
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
  w.eval(DATA3); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:3,subject:"과학",title:"3학년 1학기 과학",brand:"케이티처",slug:"g3_science"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

/* ⚠️ openShow가 실패하면 엔진은 console.warn만 남기고 **묵은 화면을 그대로 둔다**.
   창 하나를 돌려 쓰는 B 섹션에서 앞 차시 화면이 초록을 대신 내주던 자리 —
   연 차시의 제목이 실제로 화면에 떴는지 확인해 그 구멍을 막는다. */
function renderAll(w, unit, lesson, steps, expectTitle) {
  w.Teacher.openShow(String(unit), String(lesson));
  if (expectTitle) {
    ok(w.document.body.innerHTML.includes(expectTitle),
       unit + '단원 ' + lesson + '차시 openShow가 먹지 않았다 (묵은 화면) — 기대 제목: ' + expectTitle);
  }
  const content = () => w.document.getElementById('slide-content').innerHTML;
  const seen = [content()];
  const nb = w.document.getElementById('next-btn');
  for (let i = 0; i < steps; i++) { nb.dispatchEvent(new w.Event('click', { bubbles: true })); seen.push(content()); }
  return seen.join('\n<<<>>>\n');
}

global.window = { LESSONS: {} };
eval(DATA3);
eval(DATA);
const L = global.window.LESSONS;

/* ⚠️ 세 번째 인수 keepReview — 선행 가드는 review까지 빼고 잰다(l01 review가 u3 exit를 데려온다) */
function studentSlides(k, keepNext, keepReview) {
  if (keepReview === undefined) keepReview = true;
  return L[k].slides
    .filter(x => keepNext || x.block !== 'next_lesson')
    .filter(x => keepReview || x.block !== 'review')
    .map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
}
const studentText = (k) => plain(studentSlides(k, true, true));
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');
/* 근거 대조 — 공백 무시(본차시 태그 분할 대응) */
const inSrc = (k, s) => ok(SQ[k].includes(sq(s)), k + ' 본차시 근거 없음: ' + s);
const inBody = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const both = (k, s) => { inSrc(k, s); inBody(s); };

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('⚠️ 부팅 + u4 9항목 로드 + u3 동반 로드 (l01 review가 u3_l10을 넘어 받는다)', () => {
  W = boot();
  const k4 = Object.keys(W.LESSONS).filter(k => k.startsWith('u4_'));
  ok(k4.length === 9, 'u4 항목 ' + k4.length);
  const k3 = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(k3.length === 9, 'u3 동반 로드 실패 ' + k3.length + ' — l01 review가 죽는다');
  ok(Object.keys(W.LESSONS).length === 18, '엉뚱한 단원이 함께 로드됨 ' + Object.keys(W.LESSONS).length);
});
T('🚨🚨 키 번호 = 차시 번호(n) — 엔진이 n으로 LESSONS를 찾는다 (라이브 버그가 났던 자리)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u4_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  KEYS.forEach(k => ok(+k.slice(-2) === NS[k], k + ' 키 번호와 n(' + NS[k] + ')이 어긋난다'));
  ok(Math.max.apply(null, KEYS.map(k => NS[k])) === 11, 'n 최대가 11이 아니다 — 11차시 단원이다');
  /* 항목 순번으로 붙였다면 최대 키가 l10에서 끝난다 — 그 꼴을 거꾸로 못 박는다 */
  ok(!!L['u4_l11'], '항목 순번으로 키를 붙였다 — 11차시 카드가 죽는다');
});
T('🚨 건너뛰는 키(l03·l09) = 빠지는 n(3·9) — 두 목록이 같아야 한다', () => {
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(JSON.stringify(SKIPPED.map(k => +k.slice(-2))) === JSON.stringify(MISSING_N),
     '건너뛴 키 번호와 빠진 n이 다르다 — 항목 순번으로 키를 붙였는지 확인');
  ok(SKIPPED.length === 2, '건너뛴 키 개수 ' + SKIPPED.length);
  /* u3의 SKIPPED(l08 하나)를 그대로 복제하지 않았는지 역으로 못 박는다 */
  ok(!!L['u4_l08'], 'u3의 SKIPPED(l08)를 그대로 복제했다 — u4에서 l08은 8·9차시 묶음이다');
  ok(!!L['u4_l02'] && !!L['u4_l08'], '묶음 두 자리가 다 서지 않았다');
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
    const html = renderAll(W, 4, NS[k], L[k].slides.length + 2, L[k].meta.title.split(' (')[0]);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    ok(!/이 슬라이드를 그리지 못했어요/.test(html), '오류 카드 검출');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ review가 전 항목에 있다 · 단일 concept 셋 · 묶음 **둘 다** concept 다섯', () => {
  KEYS.forEach(k => ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
  SINGLE.forEach(k => {
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 3, k + ' concept ' + c + ' (단일은 셋)');
  });
  PAIRED.forEach(k => {
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 5, k + ' concept ' + c + ' (묶음은 다섯)');
  });
  ok(PAIRED.length === 2, '묶음이 둘이 아니다 ' + PAIRED.length);
});
T('img 폴백 경로 실존 (9개 미생성 = 폴백 정상)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/science\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
  const ids = KEYS.map(k => L[k].slides.find(s => s.data && s.data.img).data.img);
  ok(new Set(ids).size === 9, 'img 경로 중복 — 단원 안에서 갈라져야 한다');
});

console.log('═══ C. 회귀 (9항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, 4, NS[k], 4, L[k].meta.title.split(' (')[0]).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (sq 갈래 — 본차시 태그 분할 대응) ═══');
T('① l01 한살이 도입 원문 일치', () => {
  ['생물이 나고 자라 다시 자손을 남기는 과정을 한살이라고 해요.',
   '우리 주변에는 여러 가지 동물과 식물이 살고 있어요.',
   '동물과 식물은 자라면서 모습이 조금씩 달라져요.'].forEach(s => both('u4_l01', s));
});
T('② l02 배추흰나비 한살이 원문 일치 (2차시 묶음)', () => {
  ['몸이 머리·가슴·배로 구분되고 다리가 세 쌍인 동물을 곤충이라고 해요.',
   '배추흰나비는 알 → 애벌레 → 번데기 → 어른벌레 순서로 자라요.',
   '표면에 줄무늬가 있고 크기는 약 1mm로 아주 작아요.'].forEach(s => both('u4_l02', s));
  /* 본차시 전용 근거 — 잠자리 가드를 못 거는 까닭이 여기 있다 */
  ['사마귀·잠자리·메뚜기처럼', '번데기 단계 없이'].forEach(s => inSrc('u4_l02', s));
});
T('③ l03 다양한 동물의 한살이 원문 일치', () => {
  ['개·소·돌고래·박쥐처럼 새끼를 낳는 동물은 어미젖을 먹여 키워요.',
   '닭·개구리·잠자리·뱀처럼 알을 낳는 동물이 있어요.'].forEach(s => both('u4_l04', s));
  ['병아리', '어미젖'].forEach(w => ok(SQ['u4_l04'].includes(w), '본차시 근거 없음: ' + w));
});
T('④ l04 씨가 싹 트는 조건 원문 일치', () => {
  ['실험에서는 다르게 할 조건 하나만 빼고 모두 같게 해요.',
   '씨가 싹 트려면 물과 적당한 온도가 필요해요.'].forEach(s => both('u4_l05', s));
  ['빛이 없으면'].forEach(s => inSrc('u4_l05', s));
});
T('⑤ l05 식물이 자라는 조건 원문 일치', () => {
  ['공정한 실험은 다르게 할 조건 하나만 정하고 나머지는 같게 해요.',
   '씨가 싹 틀 때(물·온도)와 달리 자랄 때는 햇빛이 필요해요.'].forEach(s => both('u4_l06', s));
});
T('⑥ l06 여러 가지 식물의 한살이 원문 일치', () => {
  ['모든 식물은 씨 → 싹 → 자람 → 꽃 → 열매를 거쳐요.',
   '여러해살이는 여러 해 살며 해마다 열매를 맺어요.',
   '모든 식물은 씨에서 시작해 다시 씨를 남겨요.'].forEach(s => both('u4_l07', s));
  ['사는 기간'].forEach(s => inSrc('u4_l07', s));
});
T('⑦ l07 놀이터 원문 일치 (2차시 묶음)', () => {
  ['한살이 순서가 바르게 담겨 있고, 보는 사람이 쉽게 알 수 있어요.',
   '좋은 소개 자료는 한살이 순서를 바르게 담아요.',
   '가장 중요한 것은 한살이 순서를 바르게 담는 거예요.'].forEach(s => both('u4_l08', s));
});
T('⑧ l09 잠자리 애벌레 원문 일치', () => {
  ['어떤 곤충은 번데기를 거치고, 어떤 곤충은 거치지 않아요.',
   '잠자리는 번데기가 없고, 애벌레가 물속에서 살아요.'].forEach(s => both('u4_l10', s));
});
T('⑨ l10 단원 마무리 원문 일치', () => {
  ['한해살이·여러해살이, 번데기가 있는 곤충·없는 곤충이 있어요.',
   '동물은 알·새끼, 식물은 씨로 한살이를 시작해요.'].forEach(s => both('u4_l11', s));
  ['물·온도'].forEach(s => inSrc('u4_l11', s));
});
T('⑩ 단원 낱말 4종 (sq 갈래 대조 — 칸에 갈라 담긴다)', () => {
  ['한살이', '번데기', '애벌레', '싹'].forEach(w => {
    ok(SQALL.includes(sq(w)), '본차시 근거 없음: ' + w);
    ok(NOSTAR.includes(w), '본문 누락: ' + w);
  });
});
T('⚠️ sq 갈래 대조가 실제로 필요하다 (본차시 태그 분할 역확인 — 태그→공백 갈래가 깨진다)', () => {
  /* u4는 태그가 낱말 사이 공백을 먹는 자리가 17건이다(실측). 태그→공백 갈래로 재면
     l03·l10 인용이 통째로 샌다. 이 자리가 초록이 아니면 본차시가 바뀐 것 — 갈래를 다시 고를 것. */
  ok(!TXT['u4_l04'].includes('닭·개구리·잠자리·뱀처럼 알을 낳는 동물이 있어요.'),
     'l03 태그→공백 갈래가 잡힌다 — 역확인 대상이 죽었다');
  ok(!TXT['u4_l11'].includes('동물은 알·새끼, 식물은 씨로 한살이를 시작해요.'),
     'l10 태그→공백 갈래가 잡힌다 — 역확인 대상이 죽었다');
  ok(SQ['u4_l04'].includes(sq('닭·개구리·잠자리·뱀처럼 알을 낳는 동물이 있어요.')) &&
     SQ['u4_l11'].includes(sq('동물은 알·새끼, 식물은 씨로 한살이를 시작해요.')),
     'sq 갈래에서도 안 잡힌다 — 본차시가 바뀌었다');
});

console.log('═══ D-2. 알·새끼 판정 검산기 (두 갈래 · 한 글자 이름 넷) ═══');
const EGG = ['닭', '개구리', '뱀', '새', '잠자리'];
const BABY = ['개', '소', '돌고래', '박쥐'];
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  ok(!EGG.some(w => BABY.includes(w)), '알·새끼에 겹친 동물');
  ok(EGG.length >= 3 && BABY.length >= 3, '한쪽 갈래가 얇다');
});
/* 🚨 {1,6} — 한 글자 이름이 넷이다(개·소·뱀·새). {2,6}으로 긁으면 조용히 빠진다. */
const LAY = [...NOSTAR.matchAll(/([가-힣]{1,6}) — (알을|새끼를) 낳아요/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 알·새끼 선언이 여덟 이상 · 두 갈래가 다 있다', () => {
  ok(LAY.length >= 8, '선언 ' + LAY.length + '건 — 검산 대상이 죽었다');
  ok(new Set(LAY.map(x => x[1])).size === 2, '한 갈래만 선언됐다 — 판별력 0');
});
T('⚠️ 알·새끼 선언 전수 검산 (진리표 대조)', () => {
  const bad = LAY.filter(([nm, w]) => !(w === '알을' ? EGG : BABY).includes(nm))
    .map(([nm, w]) => nm + ' — ' + w + ' 낳아요');
  ok(bad.length === 0, bad.join(' / '));
});
T('🚨 한 글자 이름 넷(개·소·뱀·새)이 실제로 걸린다 (정규식 폭 역확인)', () => {
  ['개', '소', '뱀', '새'].forEach(one =>
    ok(LAY.some(x => x[0] === one), one + '이(가) 안 걸렸다 — {2,6}으로 긁으면 조용히 빠진다'));
});
T('본차시가 알·새끼 갈래를 실제로 가르친다 (근거 확인)', () => {
  ['알을낳는동물', '새끼를낳는동물'].forEach(w =>
    ok(SQ['u4_l04'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 번데기 유무 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ tnote의 교사 안내가 `아이 — 번데기 있음` 꼴로 걸린다 — STUDENT에서만 긁는다 */
const PUPA = { '있음': ['배추흰나비', '무당벌레', '사슴벌레'], '없음': ['잠자리', '메뚜기', '매미'] };
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  ok(!PUPA['있음'].some(w => PUPA['없음'].includes(w)), '번데기 두 갈래에 겹친 곤충');
});
const PU = [...STUDENT.matchAll(/([가-힣]{2,6}) — 번데기 (있음|없음)/g)].map(m => [m[1], m[2]]);
/* ⚠️ LEFT는 이름 목록이 아니라 **선언 표지**를 센다(본문이 가운뎃점을 구분자로 쓴다) */
const PUL = [...STUDENT.matchAll(/— 번데기 (있음|없음)/g)];
T('⚠️ 검산 대상 실존 — 번데기 선언이 여섯 이상 · 두 갈래가 다 있다', () => {
  ok(PU.length >= 6, '선언 ' + PU.length + '건 — 검산 대상이 죽었다');
  ok(new Set(PU.map(x => x[1])).size === 2, '한 갈래만 선언됐다 — 판별력 0');
});
T('⚠️ 번데기 선언 전수 검산 (어긋남 0 · 진리표 밖 곤충 0)', () => {
  const bad = PU.filter(([nm, v]) => !PUPA[v].includes(nm)).map(([nm, v]) => nm + ' — 번데기 ' + v);
  ok(bad.length === 0, bad.join(' / '));
  ok(PUL.length === PU.length, '진리표에 없는 곤충이 선언됐다 ' + PUL.length + '/' + PU.length);
});
T('⚠️ tnote 교사 안내(아이 — 번데기 있음)는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/아이 — 번데기 있음/.test(TNOTE), 'tnote 오탐 자리가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  ok(!/아이 — 번데기 있음/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
});
T('본차시 l09가 번데기 갈래를 실제로 준다 (근거 확인)', () => {
  ['번데기', '잠자리'].forEach(w => ok(SQ['u4_l10'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-4. 사는 기간 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ tnote의 교사 안내가 `아이 — 여러해살이` 꼴로 걸린다 — STUDENT에서만 긁는다
   🚨 민들레는 **풀이지만 여러해살이**다(l06 오개념 자리) — 「풀=한해살이」로 짜면 어긋난다 */
const LIFE = { '한해살이': ['벼', '강낭콩', '나팔꽃'], '여러해살이': ['감나무', '사과나무', '민들레'] };
T('🚨 진리표 자체 검증 (두 갈래가 겹치지 않는다 · 민들레는 여러해살이)', () => {
  ok(!LIFE['한해살이'].some(w => LIFE['여러해살이'].includes(w)), '사는 기간 두 갈래에 겹친 식물');
  ok(LIFE['여러해살이'].includes('민들레'), '민들레는 풀이지만 여러해살이다 — 진리표를 다시 볼 것');
});
const LF = [...STUDENT.matchAll(/([가-힣]{1,6}) — (한해살이|여러해살이)(?![가-힣])/g)].map(m => [m[1], m[2]]);
const LFL = [...STUDENT.matchAll(/— (한해살이|여러해살이)(?![가-힣])/g)];
T('⚠️ 검산 대상 실존 — 사는 기간 선언이 여섯 이상 · 두 갈래가 다 있다', () => {
  ok(LF.length >= 6, '선언 ' + LF.length + '건 — 검산 대상이 죽었다');
  ok(new Set(LF.map(x => x[1])).size === 2, '한 갈래만 선언됐다 — 판별력 0');
});
T('⚠️ 사는 기간 선언 전수 검산 (어긋남 0 · 진리표 밖 식물 0)', () => {
  const bad = LF.filter(([nm, v]) => !LIFE[v].includes(nm)).map(([nm, v]) => nm + ' — ' + v);
  ok(bad.length === 0, bad.join(' / '));
  ok(LFL.length === LF.length, '진리표에 없는 식물이 선언됐다 ' + LFL.length + '/' + LF.length);
});
T('⚠️ tnote 교사 안내(아이 — 여러해살이)는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/아이 — 여러해살이/.test(TNOTE), 'tnote 오탐 자리가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  ok(!/아이 — 여러해살이/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
});
T('본차시 l06이 사는 기간 갈래를 실제로 가르친다 (근거 확인)', () => {
  ['한해살이', '여러해살이', '사는기간'].forEach(w =>
    ok(SQ['u4_l07'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-5. 조건 판정 검산기 (기준 셋 · 갈래 둘 · 대상 둘) ═══');
const COND = {
  '씨 싹트기|물': '그렇다', '씨 싹트기|알맞은 온도': '그렇다', '씨 싹트기|햇빛': '아니다',
  '식물 자라기|물': '그렇다', '식물 자라기|햇빛': '그렇다'
};
const CD = [...NOSTAR.matchAll(/(씨 싹트기|식물 자라기) — ([가-힣 ]{1,6}) → (그렇다|아니다)/g)]
  .map(m => [m[1], m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 조건 판정 선언이 다섯 이상 · 기준 셋 · 갈래 둘 · 대상 둘', () => {
  ok(CD.length >= 5, '선언 ' + CD.length + '건 — 검산 대상이 죽었다');
  ok(new Set(CD.map(x => x[1])).size === 3, '기준 셋이 다 서지 않았다');
  ok(new Set(CD.map(x => x[2])).size === 2, '한 갈래만 선언됐다 — 판별력 0');
  ok(new Set(CD.map(x => x[0])).size === 2, '대상 둘이 다 서지 않았다');
});
T('⚠️ 조건 판정 선언 전수 검산 (진리표 밖 짝 0 · 어긋남 0)', () => {
  const bad = CD.filter(([a, f, v]) => COND[a + '|' + f] !== v).map(([a, f, v]) => a + ' — ' + f + ' → ' + v);
  ok(bad.length === 0, bad.join(' / '));
});
T('🚨 「씨 싹트기 — 햇빛 → 아니다」가 실제로 있다 (이 단원의 핵심 갈림)', () => {
  ok(CD.some(x => x[0] === '씨 싹트기' && x[1] === '햇빛' && x[2] === '아니다'),
     '핵심 갈림이 사라졌다 — 싹틀 때는 햇빛이 필요 없다');
  ok(CD.some(x => x[0] === '식물 자라기' && x[1] === '햇빛' && x[2] === '그렇다'),
     '자랄 때 햇빛이 그렇다로 서지 않았다 — 대조가 죽으면 갈림이 뜻을 잃는다');
});
T('본차시가 두 조건을 실제로 가르친다 (근거 확인)', () => {
  ok(SQ['u4_l05'].includes('적당한온도') || SQ['u4_l05'].includes('알맞은온도'), 'l04 온도 근거 없음');
  ok(SQ['u4_l06'].includes('햇빛'), 'l05 햇빛 근거 없음');
});

console.log('═══ D-6. 실험 조건 검산기 (표가 아니라 규칙 — 다르게가 정확히 하나) ═══');
const EXP = [...NOSTAR.matchAll(/(물 실험|햇빛 실험) — ([가-힣 ]{1,6}) → (다르게|같게) 할 조건/g)]
  .map(m => [m[1], m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 실험 조건 선언이 일곱 이상 · 실험 둘', () => {
  ok(EXP.length >= 7, '선언 ' + EXP.length + '건 — 검산 대상이 죽었다');
  ok(new Set(EXP.map(x => x[0])).size === 2, '실험 둘이 다 서지 않았다');
});
T('🚨 실험마다 「다르게 할 조건」이 정확히 하나 · 「같게 할 조건」이 둘 이상', () => {
  ['물 실험', '햇빛 실험'].forEach(name => {
    const rows = EXP.filter(x => x[0] === name);
    ok(rows.length >= 3, name + ' 선언 ' + rows.length + '건');
    const diff = rows.filter(x => x[2] === '다르게').map(x => x[1]);
    const same = rows.filter(x => x[2] === '같게').map(x => x[1]);
    ok(diff.length === 1, name + '의 다르게 할 조건이 ' + diff.length + '가지 — 하나여야 한다');
    ok(same.length >= 2, name + '의 같게 할 조건이 ' + same.length + '가지');
    ok(!diff.some(f => same.includes(f)), name + '에서 같은 조건이 두 갈래에 있다');
  });
});
T('⚠️ 다르게 할 조건이 실험 이름과 맞는다 (물 실험 → 물 · 햇빛 실험 → 햇빛)', () => {
  const d1 = EXP.filter(x => x[0] === '물 실험' && x[2] === '다르게').map(x => x[1]);
  const d2 = EXP.filter(x => x[0] === '햇빛 실험' && x[2] === '다르게').map(x => x[1]);
  ok(JSON.stringify(d1) === JSON.stringify(['물']), '물 실험의 다르게 할 조건 ' + d1.join(','));
  ok(JSON.stringify(d2) === JSON.stringify(['햇빛']), '햇빛 실험의 다르게 할 조건 ' + d2.join(','));
});
T('본차시가 공정한 실험 규칙을 실제로 가르친다 (근거 확인)', () => {
  ['다르게할조건', '같게할조건'].forEach(w =>
    ok(SQ['u4_l05'].includes(w) || SQ['u4_l06'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-7. 다음 단계 사슬 검산기 (왼쪽에 생물 이름을 함께) ═══');
/* 🚨 배추흰나비의 「알」과 닭의 「알」이 부딪친다 — 왼쪽에 생물 이름을 함께 적는다 */
const CHAIN = {
  '배추흰나비': { '알': '애벌레', '애벌레': '번데기', '번데기': '어른벌레' },
  '닭': { '알': '병아리', '병아리': '어린 닭', '어린 닭': '다 자란 닭' },
  '강낭콩': { '씨': '싹', '싹': '자람', '자람': '꽃', '꽃': '열매' }
};
T('⚠️ 진리표 자체 검증 (사슬이 제자리를 가리키지 않는다 · 다음 단계가 겹치지 않는다)', () => {
  Object.keys(CHAIN).forEach(who => {
    const mp = CHAIN[who];
    ok(!Object.keys(mp).some(a => mp[a] === a), who + ' 사슬이 제자리를 가리킨다');
    ok(new Set(Object.values(mp)).size === Object.keys(mp).length, who + ' 다음 단계가 겹친다');
  });
  ok(Object.keys(CHAIN).length === 3, '사슬 수 ' + Object.keys(CHAIN).length);
});
const NX = [...NOSTAR.matchAll(/([가-힣]{1,6}) · ([가-힣 ]{1,6}) — 다음은 ([가-힣 ]{1,8})/g)]
  .map(m => [m[1], m[2], m[3]]);
/* ⚠️ LEFT는 이름 목록이 아니라 **선언 표지**를 센다 — 본문이 가운뎃점을 구분자로 쓴다 */
const NXL = [...NOSTAR.matchAll(/— 다음은/g)];
T('⚠️ 검산 대상 실존 — 다음 단계 선언이 열 이상 · 세 사슬이 다 선다', () => {
  ok(NX.length >= 10, '선언 ' + NX.length + '건 — 검산 대상이 죽었다');
  ok(new Set(NX.map(x => x[0])).size === 3, '세 사슬이 다 서지 않았다');
});
T('⚠️ 다음 단계 선언 전수 검산 (어긋남 0 · 진리표 밖 선언 0)', () => {
  const bad = NX.filter(([who, a, b]) => !CHAIN[who] || CHAIN[who][a] !== b)
    .map(([who, a, b]) => who + ' · ' + a + ' — 다음은 ' + b);
  ok(bad.length === 0, bad.join(' / '));
  ok(NXL.length === NX.length,
     '생물 이름 없는 선언이 섞였다 ' + NXL.length + '/' + NX.length + ' — 「X — 다음은」 꼴 금지');
});
T('🚨 알이 부딪치는 두 사슬이 실제로 갈린다 (배추흰나비 알 → 애벌레 · 닭 알 → 병아리)', () => {
  ok(NX.some(x => x[0] === '배추흰나비' && x[1] === '알' && x[2] === '애벌레'), '배추흰나비 알 선언이 없다');
  ok(NX.some(x => x[0] === '닭' && x[1] === '알' && x[2] === '병아리'), '닭 알 선언이 없다');
});
T('본차시가 세 사슬을 실제로 준다 (근거 확인)', () => {
  ok(SQ['u4_l02'].includes('애벌레'), 'l02 근거 없음');
  ok(SQ['u4_l04'].includes('병아리'), 'l03 근거 없음');
  ok(SQ['u4_l07'].includes('강낭콩'), 'l06 근거 없음');
});

console.log('═══ E. 안전 · 용어 가드 (과학 최우선 = 생명 존중) ═══');
T('⚠️ 생명 존중 3문구 + 실험 뒤 손 씻기 둘 (u3의 「함부로 건드리지·가만히 관찰」과 자리가 다르다)', () => {
  ok(/꾸준히 관찰/.test(studentText('u4_l01')), 'l01 꾸준히 관찰 문구 없음');
  ok(/함부로 만지지/.test(studentText('u4_l02')), 'l02 함부로 만지지 문구 없음');
  ok(/소중히 여/.test(studentText('u4_l10')), 'l09 소중히 여기기 문구 없음');
  ['u4_l05', 'u4_l06'].forEach(k => ok(/손을 씻/.test(studentText(k)), k + ' 실험 뒤 손 씻기 문구 없음'));
  /* 본차시가 실제로 존중을 짚는지 근거 확인(sq 갈래) */
  ok(SQ['u4_l01'].includes('꾸준히관찰해요'), '본차시 l01 근거 없음: 꾸준히 관찰해요');
  ok(SQ['u4_l01'].includes('함부로만져요'), '본차시 근거(함부로 만져요)가 사라졌다 — l02 문구의 근거 자리');
  ['함부로 잡아', '함부로 뜯어', '밟아 죽'].forEach(w =>
    ok(!STUDENT.includes(w), '생물 훼손 문구가 학생 갈래에 남았다: ' + w));
});
T('⚠️ 상표 가드 — 놀이터·소개 자료 차시에 회사·제품 이름 0건', () => {
  const BRAND = ['벨크로', '스피도', '나이키', '아디다스', '보잉', '에어버스', '고어텍스', '샤크스킨',
                 '듀폰', '지멘스', '테슬라', '삼성', '엘지', '혼다', '노스페이스', '컬럼비아',
                 '파타고니아', '3M', '레고', '디즈니'];
  const s67 = studentText('u4_l07') + studentText('u4_l08');
  const hit = BRAND.filter(w => s67.includes(w));
  ok(hit.length === 0, hit.join(','));
  ok(BRAND.length === 20, '상표 목록 ' + BRAND.length + '종');
});
T('미도입 갈래(4학년 이상·중등 소관) 학생 노출 0', () => {
  const BAN = ['변태', '탈피', '발아', '수분', '수정', '배아', '떡잎', '광합성', '생식',
               '포유류', '조류', '유충', '번식', '세대', '서식지', '생체모방', '적응', '진화'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  ok(BAN.length === 18, '미도입 목록 ' + BAN.length + '종');
  /* ⚠️ 「한살이」·「곤충」·「애벌레」 단독은 걸지 않는다 — 이 단원이 정식으로 쓰는 낱말이다 */
  ['한살이', '곤충', '애벌레', '번데기'].forEach(w =>
    ok(STUDENT.includes(w), w + '이(가) 사라졌다 — 단독 가드를 걸었는지 확인'));
});
T('⚠️ 교사 몫 용어 넷은 tnote 밖 학생 본문에 0 · tnote에는 실존 (note도 학생 노출 갈래다)', () => {
  ['완전 변태', '불완전 변태', '난생', '태생'].forEach(w => {
    ok(!STUDENT.includes(w), '학생 노출: ' + w);
    ok(TNOTE.includes(w), 'tnote에 없음 — 대상 0건에서 사이좋게 초록이 난다: ' + w);
  });
  ['조작 변인', '통제 변인', '가설 검증', '변인 통제'].forEach(w =>
    ok(!STUDENT.includes(w), '학생 노출: ' + w));
});
T('⚠️ 선행 용어 9갈래 — slides − next_lesson − review (l01 review가 u3 exit를 데려온다)', () => {
  /* ⚠️ 가드 대상은 slides만 — extras는 뺀다. 예외는 next_lesson + review 두 블록.
     🚨 「잠자리」로는 l09를 못 건다(l02·l03이 먼저 쓴다) → 「무당벌레」.
     🚨 「빛」으로는 l05를 못 건다(l04가 쓴다) → 「햇빛」만. */
  const pre = (k, w) => ok(!plain(studentSlides(k, false, false)).includes(w), k + ' 본문에 ' + w + ' 선행');
  ['u4_l01'].forEach(k => { pre(k, '번데기'); pre(k, '곤충'); });
  ['u4_l01', 'u4_l02'].forEach(k => pre(k, '새끼'));
  ['u4_l01', 'u4_l02', 'u4_l04'].forEach(k => pre(k, '다르게 할 조건'));
  ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l05'].forEach(k => pre(k, '햇빛'));
  ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l05', 'u4_l06'].forEach(k => { pre(k, '한해살이'); pre(k, '여러해살이'); });
  ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l05', 'u4_l06', 'u4_l07'].forEach(k => pre(k, '소개 자료'));
  ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l05', 'u4_l06', 'u4_l07', 'u4_l08'].forEach(k => pre(k, '무당벌레'));
  /* 도입 자리에는 실존해야 한다 */
  ok(studentText('u4_l02').includes('번데기') && studentText('u4_l02').includes('곤충'), 'l02에 번데기·곤충 도입 없음');
  ok(studentText('u4_l04').includes('새끼'), 'l03에 새끼 도입 없음');
  ok(studentText('u4_l05').includes('다르게 할 조건'), 'l04에 다르게 할 조건 도입 없음');
  ok(studentText('u4_l06').includes('햇빛'), 'l05에 햇빛 도입 없음');
  ok(studentText('u4_l07').includes('한해살이') && studentText('u4_l07').includes('여러해살이'), 'l06에 사는 기간 도입 없음');
  ok(studentText('u4_l08').includes('소개 자료'), 'l07에 소개 자료 도입 없음');
  ok(studentText('u4_l10').includes('무당벌레'), 'l09에 무당벌레 도입 없음');
});
T('🚨 역단언 ① — l01 next_lesson에 「번데기」가 실제로 있다 (가드를 next까지 넓히면 죽는다)', () => {
  const nx = plain(L['u4_l01'].slides.filter(s => s.block === 'next_lesson'));
  ok(nx.includes('번데기'), 'l01 next_lesson이 번데기를 예고하지 않는다 — 가드 범위 재검토');
});
T('🚨 역단언 ② — l04 next_lesson에 「햇빛」이 있고 본문에는 없다', () => {
  const nx = plain(L['u4_l05'].slides.filter(s => s.block === 'next_lesson'));
  ok(nx.includes('햇빛'), 'l04 next_lesson이 햇빛을 예고하지 않는다');
  ok(!plain(studentSlides('u4_l05', false, false)).includes('햇빛'), 'l04 본문에 햇빛 선행');
});
T('🚨 역단언 ③ — 「빛」으로는 선행 가드를 걸 수 없다 (l04가 본문에 쓴다 · 본차시 근거 실존)', () => {
  ok(plain(studentSlides('u4_l05', false, false)).includes('빛'),
     'l04 본문에 「빛」이 없다 — 「햇빛」만 고른 까닭이 사라졌다');
  ok(SQ['u4_l05'].includes(sq('빛이 없으면')), '본차시 5차시가 「빛」을 쓰지 않는다 — 가드 재검토');
  /* ⚠️ 가드 대상은 **케이티처 본문**뿐이다 — 본차시는 「햇빛」을 써도 된다(실측: 쓴다).
     본차시까지 걸면 레드다. 여기서는 근거가 살아 있는지만 잰다. */
  ok(SQ['u4_l05'].includes('햇빛'), '본차시가 햇빛을 잃었다 — 「빛/햇빛」 갈림의 근거가 사라졌다');
});
T('🚨 역단언 ④ — 「잠자리」로는 l09 가드를 걸 수 없다 (l02·l03이 먼저 쓴다)', () => {
  ['u4_l02', 'u4_l04'].forEach(k => {
    ok(studentText(k).includes('잠자리'), k + '에 잠자리가 없다 — 무당벌레 가드를 고른 까닭이 사라졌다');
    ok(SQ[k].includes('잠자리'), '본차시 ' + k + '가 잠자리를 쓰지 않는다');
  });
});
T('🚨 역단언 ⑤ — l01 review에 「분류」·「본떠」가 실제로 있다 (가드를 review까지 넓히면 죽는다)', () => {
  const rv = plain(L['u4_l01'].slides.filter(s => s.block === 'review'));
  ok(rv.includes('분류') && rv.includes('본떠'), 'l01 review가 u3_l10 exit를 데려오지 않는다 — 가드 범위 재검토');
  /* review를 포함한 갈래에서는 실제로 걸린다 — 좁힌 이유를 실측으로 남긴다 */
  ok(plain(studentSlides('u4_l01', false, true)).includes('본떠'),
     'review 포함 갈래에서 본떠가 안 걸린다 — 좁힐 이유가 사라졌다');
});
T('🚨 concept note에 선행 낱말 0 (note도 학생 노출 갈래)', () => {
  const c1 = plain(L['u4_l01'].slides.filter(s => s.block === 'concept'));
  ok(!c1.includes('번데기'), 'l01 concept(note 포함)에 번데기 선행');
  ok(/"note":/.test(c1), 'l01 concept에 note가 없다 — 단언 대상이 죽었다');
  const c6 = plain(L['u4_l07'].slides.filter(s => s.block === 'concept'));
  ok(!c6.includes('소개 자료'), 'l06 concept(note 포함)에 소개 자료 선행');
});
T('⚠️ next_lesson 예고 역검사 (l01→나비 · l03→씨 · l04→햇빛 · l06→소개 · l10→다음 단원)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(/배추흰나비|애벌레/.test(nx('u4_l01')), 'l01 next_lesson이 배추흰나비를 예고하지 않음');
  ok(/씨|싹/.test(nx('u4_l04')), 'l03 next_lesson이 식물 한살이를 예고하지 않음');
  ok(/햇빛/.test(nx('u4_l05')), 'l04 next_lesson이 햇빛을 예고하지 않음');
  ok(/소개/.test(nx('u4_l07')), 'l06 next_lesson이 소개 자료를 예고하지 않음');
  /* 마지막 항목은 다음 단원을 예고한다 — 단원 안을 가리키면 안 된다 */
  ok(/다음 단원/.test(nx('u4_l11')), 'l10이 다음 단원을 예고하지 않음');
});
T('⚠️ 성취기준 항목별 선언 — 다섯 갈래 · l07만 [4과12-03] (접두 4과04만 검사하면 l07이 샌다)', () => {
  const STD = { u4_l01: '단원 전체 통합', u4_l02: '[4과04-01]', u4_l04: '[4과04-01]',
                u4_l05: '[4과04-02]', u4_l06: '[4과04-02]', u4_l07: '[4과04-03]',
                u4_l08: '[4과12-03]', u4_l10: '단원 전체 통합', u4_l11: '단원 전체 통합' };
  KEYS.forEach(k => ok(L[k].meta.std === STD[k], k + ' std ' + L[k].meta.std));
  ok(new Set(Object.values(STD)).size === 5, '성취기준 갈래 수가 어긋남');
  ok(KEYS.filter(k => L[k].meta.std === '[4과12-03]').length === 1, '4과12-03이 l07 하나가 아니다');
  /* u3의 [4과03-*]가 딸려 오지 않았는지 */
  ok(!KEYS.some(k => /4과03/.test(L[k].meta.std)), 'u3 성취기준 잔재');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 (36슬 항목 0)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음이 생겼다');
});
T('🚨 슬라이드 총합 181슬 (19×7 + 24×2) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 181, '총합 ' + tot);
  ok(tot === 19 * SINGLE.length + 24 * PAIRED.length, '부분 합 재계산 어긋남');
  ok(SINGLE.length === 7 && PAIRED.length === 2, '단일 ' + SINGLE.length + ' / 묶음 ' + PAIRED.length);
});
T('extras 전 항목 20개 · 참조 무결성 · 중복 0 (총합 180)', () => {
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
  ok(tot === 20 * KEYS.length, '부분 합 재계산 어긋남');
});
T('tnote 6슬 이상 · 구조 정합 (총 98슬 = 10×7 + 14×2)', () => {
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
  ok(tot === 98, 'tnote 총합 ' + tot);
  ok(tot === 10 * SINGLE.length + 14 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('⚠️ 3차시 묶음 0 — covers 물결 0건 · 120분 0 · period_split 경계는 전부 하나', () => {
  KEYS.forEach(k => {
    ok(!/~/.test(L[k].meta.covers), k + ' covers에 물결 ' + L[k].meta.covers);
    ok(L[k].meta.duration_min !== 120, k + ' 120분 항목이 생겼다');
    if (L[k].meta.period_split)
      ok(!L[k].meta.period_split.includes(','), k + ' 경계가 둘 ' + L[k].meta.period_split);
  });
});
T('🚨 2차시 묶음 = l02·l08 **둘** · 80분 · covers 가운뎃점 · period_split s12 둘', () => {
  ok(PAIRED.length === 2, '2차시 묶음 개수 ' + PAIRED.length);
  const got = KEYS.filter(k => L[k].meta.period_split);
  ok(JSON.stringify(got) === JSON.stringify(PAIRED), 'period_split 보유 항목 ' + got.join(','));
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
  /* 묶인 차시가 따로 키를 만들지 않았는지 — u4에서 건너뛰는 자리는 l03·l09다 */
  SKIPPED.forEach(k => ok(!L[k], '건너뛴 키 ' + k + '이(가) 생겼다'));
});
T('⚠️ 단일 차시 = 40분 · period_split 없음 · covers 단수 (일곱)', () => {
  ok(SINGLE.length === 7, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 40, k + ' ' + m.duration_min + '분');
    ok(!m.period_split, k + ' period_split 있음');
    ok(!/[·~]/.test(m.covers), k + ' covers ' + m.covers);
  });
});
T('🚨 수업시간 합 = 11차시 × 40분 = 440분 — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 440, '합 ' + tot);
  ok(tot === 40 * SINGLE.length + 80 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('⚠️ 교시 경계 슬라이드 tnote가 교시 끝을 적는다 (묶음 둘 다)', () => {
  PAIRED.forEach(k => {
    const s = L[k].slides.find(x => x.id === L[k].meta.period_split);
    ok(s, k + ' 경계 슬라이드 없음');
    ok(s.block === 'self_assessment', k + ' 경계 블록 ' + s.block);
    /* ⚠️ 교시 끝 표시가 watch에만 있다고 짜면 안 된다 — 묶음 둘 다 ask에 적었다(실측).
       tnote 전체(ask + watch)에서 교시 표시를 찾는다. */
    ok(s.tnote && /[12]교시/.test(plain(s.tnote)), k + ' 교시 경계 미기재 ' + plain(s.tnote).slice(0, 60));
  });
});
T('🚨 2교시 시작은 s13 (묶음 **둘 다**) · 3교시 표시 0', () => {
  PAIRED.forEach(k => {
    const s13 = L[k].slides.find(x => x.id === 's13');
    ok(s13 && /2교시/.test(s13.data.title || ''), k + ' 2교시 표시 없음');
  });
  const n2 = KEYS.filter(k => L[k].slides.some(x => /2교시/.test((x.data && x.data.title) || ''))).length;
  ok(n2 === 2, '2교시 표시를 가진 항목이 ' + n2 + '개 — 묶음이 둘이므로 둘이어야 한다');
  KEYS.forEach(k =>
    ok(!L[k].slides.some(x => /3교시/.test((x.data && x.data.title) || '')),
       k + '에 3교시 표시 — u4에는 3차시 묶음이 없다'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 · 9연쇄 · l01만 단원을 넘는다', () => {
  const chain = [['u4_l01', 'u3_l10'], ['u4_l02', 'u4_l01'], ['u4_l04', 'u4_l02'],
                 ['u4_l05', 'u4_l04'], ['u4_l06', 'u4_l05'], ['u4_l07', 'u4_l06'],
                 ['u4_l08', 'u4_l07'], ['u4_l10', 'u4_l08'], ['u4_l11', 'u4_l10']];
  ok(chain.length === 9, '계보 길이 ' + chain.length);
  chain.forEach(([k, from]) => {
    const rv = L[k].slides.find(s => s.block === 'review');
    ok(rv.data.from === from, k + ' from ' + rv.data.from + ' (기대 ' + from + ')');
    const ex = L[from].slides.find(s => s.block === 'exit_ticket');
    ok(ex, from + ' exit 없음 — 앞 단원 동반 로드를 확인할 것');
    ok(JSON.stringify(rv.data.items) === JSON.stringify(ex.data.items),
       k + ' review가 ' + from + ' exit를 그대로 계승하지 않음');
  });
  /* ⚠️ 단원을 넘는 자리는 l01 하나뿐이다 — 늘어나면 동반 로드 전제가 흔들린다 */
  const cross = chain.filter(([k, from]) => !/^u4_/.test(from));
  ok(cross.length === 1 && cross[0][0] === 'u4_l01', '단원을 넘는 계보가 ' + cross.length + '건');
  /* 묶음 l07을 넘어 l09가 받는다(l08 건너뜀) */
  ok(L['u4_l10'].slides.find(s => s.block === 'review').data.from === 'u4_l08', 'l09가 l07 exit를 받지 않는다');
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
    ok(m.grade === 3 && m.subject === '과학' && m.unit === 4, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 한살이 탐험대', k + ' theme ' + m.theme + ' (u3의 식물 탐험대를 복제했는지)');
    ok(/^\.\.\/\.\.\/grade3\/semester1\/science\/4단원_/.test(m.live_url), k + ' live_url');
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
    ok(path.basename(f) === SFILE[k], k + ' live_url이 SFILE과 다르다');
  });
});
T('🚨 CURRICULUM ↔ LESSONS 정합 (u4 블록 9항목 · ready 9 · n 목록에서 3과 9가 둘 다 빠진다)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u5가 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*4,[\s\S]*?(?=unit:\s*5,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 4 블록 없음');
  ok(/lesson_count:\s*9/.test(blk), 'lesson_count 9 아님 (항목 수 9이지 차시 수 11이 아니다)');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  MISSING_N.forEach(n => ok(!ns.includes(n), 'n 목록에 ' + n + '이(가) 있다 — l02·l07이 먹은 차시다'));
  ok(Math.max.apply(null, ns) === 11, 'n 최대가 11이 아니다 — 11차시 단원이다');
  ok((blk.match(/ready:\s*true/g) || []).length === 9, 'ready 9 아님');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ u1·u2·u3 블록 무영향 회귀 (전방탐색이 u4를 먹지 않는다)', () => {
  const b1 = (CURRIC_SRC.match(/unit:\s*1,[\s\S]*?(?=unit:\s*2,|\];)/) || [''])[0];
  ok(/lesson_count:\s*9/.test(b1), 'u1 lesson_count가 흔들렸다');
  ok((b1.match(/ready:\s*true/g) || []).length === 9, 'u1 ready 9 아님');
  ok(!/unit:\s*2/.test(b1), 'u1 블록이 u2를 먹었다');
  const b2 = (CURRIC_SRC.match(/unit:\s*2,[\s\S]*?(?=unit:\s*3,|\];)/) || [''])[0];
  ok(/lesson_count:\s*10/.test(b2), 'u2 lesson_count가 흔들렸다');
  ok((b2.match(/ready:\s*true/g) || []).length === 10, 'u2 ready 10 아님');
  ok(!/unit:\s*3/.test(b2), 'u2 블록이 u3를 먹었다');
  const b3 = (CURRIC_SRC.match(/unit:\s*3,[\s\S]*?(?=unit:\s*4,|\];)/) || [''])[0];
  ok(/lesson_count:\s*9/.test(b3), 'u3 lesson_count가 흔들렸다');
  ok((b3.match(/ready:\s*true/g) || []).length === 9, 'u3 ready 9 아님 — u4가 딸려 들어왔다');
  ok(!/unit:\s*4/.test(b3), 'u3 블록이 u4를 먹었다');
});
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u1·u2·u3·u4 넷) · u5 선생성 0', () => {
  ['u1', 'u2', 'u3', 'u4'].forEach(u =>
    ok(new RegExp('<script src="data\\/g3_science_' + u + '\\.js"><\\/script>').test(HOME),
       u + ' script 태그가 닫는 태그까지 성립하지 않는다'));
  ok(!/g3_science_u5\.js/.test(HOME), 'u5 배선이 미리 생겼다');
  const open = (HOME.match(/<script[\s>]/g) || []).length;
  const close = (HOME.match(/<\/script>/g) || []).length;
  ok(open === close, 'script 여닫이 개수 불일치 ' + open + '/' + close);
});
T('홈 slug · 과목 · 복제 원본(국어) 잔재 0', () => {
  ok(/slug:\s*"g3_science"/.test(HOME), 'slug 어긋남');
  ok(/subject:\s*"과학"/.test(HOME), 'subject 어긋남');
  ok(!/g3_korean|g3_math/.test(HOME), '다른 과목 파일 잔재');
  const noComment = HOME.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const hit = (noComment.match(/국어/g) || []);
  ok(hit.length === 0, '렌더 대상에 국어 잔재 ' + hit.length + '건');
  ok(/과학/.test(noComment), '과학 표기가 없다');
});
T('🚨 허브 "3_science" 등재 (units 4 · lessons 37) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_science":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_science 미등재');
  ok(+m[1] === 4, 'units ' + m[1]);
  ok(+m[2] === 37, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이지 차시 수가 아니다. u1 9 + u2 10 + u3 9 + u4 9 = 37. */
  ok(+m[2] === 9 + 10 + 9 + KEYS.length, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] !== 41, 'lessons에 차시 수 합 41을 넣었다 — 항목 수 37이어야 한다');
  ok(/id:\s*"science"/.test(HUB), '허브 SUB_HIGH에 과학이 없다');
});
T('⚠️ 허브 옆 줄 무영향 회귀 (3_korean 6/45 · 3_math 7/55)', () => {
  const k = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(k && +k[1] === 6 && +k[2] === 45, '3_korean 카운트가 흔들렸다');
  const t = HUB.match(/"3_math":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(t && +t[1] === 7 && +t[2] === 55, '3_math 카운트가 흔들렸다');
});
T('케이랩 매핑 없음 = 의도적 (실물 관찰·기르기가 화면 교구보다 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_science_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u4 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '박음', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (놀이·발표 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
});
T('채움말 "자리" 0 (보호 어휘 = 같은 자리·제자리·잠자리)', () => {
  /* ⚠️ u4 보호 어휘에 「잠자리」가 든다 — 곤충 이름이 채움말 가드에 걸린다 */
  const hit = (BODY.match(/[가-힣 ]{0,6}자리[가-힣]{0,3}/g) || []).filter(s => !/같은 자리|제자리|잠자리/.test(s));
  ok(hit.length === 0, hit.join(' / '));
  ok(/잠자리/.test(BODY), '보호 어휘 잠자리가 사라졌다 — 보호 목록 재검토');
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
