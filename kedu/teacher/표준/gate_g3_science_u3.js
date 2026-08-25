/* gate_g3_science_u3.js — 케이티처 g3 과학 u3 「식물의 생활」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_science_u2.js 복제. **과학 세 번째 단원**이라 u2에서 온 갈래 중
      단원을 타는 것들은 전부 갈아 끼웠다. 복제할 사람은 아래를 먼저 읽을 것.

   (갈림 ①) **9항목 10차시**다. 건너뛰는 키는 **`u3_l08` 하나뿐**.
       ⚠️ u2의 SKIPPED는 `u2_l09`였다 — 자리가 다르다. 복제하면 즉시 어긋난다.
   (갈림 ②) **2차시 묶음은 l07 하나**(80분·24슬·period_split "s12"·covers 가운뎃점).
       단일 여덟(40분·19슬) · 3차시 묶음 0 → **36슬 항목 0 · 물결 covers 0 ·
       3교시 표시 0**을 거꾸로 못 박는다. 총합 176슬 = 19×8 + 24 · 400분 = 40×8 + 80.
       ⚠️ 묶음 l07은 concept가 **다섯**이다(단일 여덟은 셋).
   (갈림 ③) **전 항목 review가 있다(u2 계승).** u3_l01은 **`u2_l11`을 넘어 받는다**
       → **앞 단원(u2) 데이터 동반 로드 필수** · 단원을 넘는 자리는 l01 하나뿐.
       ⚠️ 부팅 뒤 `Object.keys(W.LESSONS).length === 19`(u2 10 + u3 9). u1은 싣지 않는다.
   (🚨 신규 함정 ①) **앞 단원 exit가 선행 금지어를 데리고 들어온다.** u2_l11 exit에
       「분류」·「본떠」가 있어 l01 review가 금지를 스스로 어긴다 →
       **선행 가드 = slides − next_lesson − review**로 좁힌다(`studentSlides(k, false, false)`).
       그리고 l01 review에 그 두 낱말이 실제로 있는지 **역단언**으로 잠근다.
       ⚠️ u2 게이트의 `studentSlides(k, false)`(review 포함)를 그대로 쓰면 l01이 레드다.
   (🚨 신규 함정 ②) **「양분」으로 선행 가드를 못 건다** — 본차시 l02가 잎맥을
       "물·양분이 지나는 줄"로 학생 화면에 쓴다(실측). l09 도입 가드는 **「벌레」**로.
       l02에 「양분」이 실존하는지 역단언.
   (🚨 신규 함정 ③) **「찍찍이」는 상표가 아니다** — u2 상표 목록에 있었으나 u3에선
       본차시 l06의 근거 낱말(도꼬마리 갈고리 → 찍찍이). 상표는 「벨크로」 쪽이다.
   (🚨 신규 함정 ④) **성취기준이 다섯 갈래**(단원 전체 통합 · 4과03-01 · 4과03-02 ·
       4과03-03 · **4과12-03**). l07 하나만 4과12-03이다 — 「접두 4과03만 검사」로
       짜면 l07이 통째로 샌다.
   (검산기 여섯 — 전부 「대상 N건 실존」 동반)
       D-2 잎 특징 판정 `식물 — 톱니|갈라짐|길쭉 → 그렇다|아니다` (기준 셋 · 갈래 둘, BODY)
       D-3 사는 곳 세 갈래 `들과 산|강과 호수|사막 — 식물` (BODY)
       D-4 풀·나무 `식물 — 풀|나무` (**STUDENT에서만** — tnote에 「아이 — 나무」 오탐 자리)
       D-5 물 저장 곳 `식물 — 줄기|잎에 물 저장` (BODY)
       D-6 본뜬 짝 넷 `도꼬마리 갈고리 — 찍찍이` 꼴 (**STUDENT에서만** — tnote에
           「연잎 — 낙하산」 오탐 자리)
       D-7 벌레잡이 방법 넷 `파리지옥 — 잎을 닫아요` 꼴 (BODY)
       ⚠️ 식물엔 한 글자 이름이 없다 → u2의 「한 글자 역확인」 대신
          **가장 긴 이름(바오바브나무 여섯 자) 역확인**으로 뒤집는다. 복제하면 레드.
       ⚠️ 본차시가 태그로 낱말을 가른다(「함부로<br>건드리지」는 태그가 공백 자리,
          l10 「잎의 특징에 따라」는 태그가 낱말 사이에 공백 없이 낀다) → 태그→공백·
          태그→없음 어느 한 갈래로도 다 못 잡는다. 본차시 근거 대조는 **`sq()`(공백 제거)
          갈래**로만 잰다. u2의 `txt()` 대조를 그대로 쓰면 인용 대조가 레드다.
   (안전) **과학 최우선 가드 = 식물 존중.** u2의 「동물 안전 4문구」·「서식지·생체모방
       풀이말 동반」을 복제하면 이 단원엔 그런 자리가 없어 통째로 레드다.
       u3는 「함부로 건드리지」·「가만히 관찰」(l09) · 「소중히 여」(l10) + l03 「손을 씻」.
   ⚠️ 「서식지」·「생체모방」은 u3 본차시 학생 화면엔 없다 → **전 항목 미도입 금지**(u2와 반대).
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_science_u3.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 부팅 body class는 **`kt3 subj-science`**다.
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다(u4 대비).
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다(u1·u2·u3 셋).
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      lessons = **항목 수 합 28**(u1 9 + u2 10 + u3 9)이지 차시 수 합 31이 아니다.
   ⚠️ jsdom은 세션마다 새로 깔아야 한다.
   ⚠️ 게이트는 **k-edu 클론에서 돌릴 것** — handoff에는 `grade3/`가 없어 본차시 대조가 죽는다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_science_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const V3CSS = fs.readFileSync(path.join(TDIR, 'engine/teacher-v3.css'), 'utf8');
/* ⚠️ 앞 단원 동반 로드 필수 — u3_l01의 review가 u2_l11을 넘어 받는다 */
const DATA2 = fs.readFileSync(path.join(TDIR, 'data/g3_science_u2.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_science_u3.js'), 'utf8');
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

/* ⚠️ 9항목 10차시. 건너뛰는 키는 l08 하나뿐이다(u2는 l09였다). */
const KEYS = ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05',
              'u3_l06', 'u3_l07', 'u3_l09', 'u3_l10'];
const NS = { u3_l01: 1, u3_l02: 2, u3_l03: 3, u3_l04: 4, u3_l05: 5,
             u3_l06: 6, u3_l07: 7, u3_l09: 9, u3_l10: 10 };
const PAIRED = ['u3_l07'];
const SINGLE = KEYS.filter(k => !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });
const SKIPPED = ['u3_l08'];

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/science/3단원_식물의생활');
const SFILE = {
  u3_l01: 'g3_sci_u3_l01_활짝과학열기.html',
  u3_l02: 'g3_sci_u3_l02_잎의특징에따른식물분류.html',
  u3_l03: 'g3_sci_u3_l03_들과산에사는식물.html',
  u3_l04: 'g3_sci_u3_l04_강이나호수에사는식물.html',
  u3_l05: 'g3_sci_u3_l05_특별한곳에사는식물.html',
  u3_l06: 'g3_sci_u3_l06_생활속식물특징이용.html',
  u3_l07: 'g3_sci_u3_l07_창의과학놀이터.html',
  u3_l09: 'g3_sci_u3_l09_톡톡과학벌레잡이식물.html',
  u3_l10: 'g3_sci_u3_l10_단원마무리.html'
};
const SRC = {};
KEYS.forEach(k => { SRC[k] = fs.readFileSync(path.join(SDIR, SFILE[k]), 'utf8'); });
const TXT = {};
KEYS.forEach(k => { TXT[k] = txt(SRC[k]); });
/* ⚠️ 본차시가 <br>로 낱말을 가른다 — 근거 대조는 공백을 지운 SQ 갈래로 */
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
  w.eval(DATA2); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA2);
eval(DATA);
const L = global.window.LESSONS;

/* ⚠️ 세 번째 인수 keepReview — 선행 가드는 review까지 빼고 잰다(l01 review가 u2 exit를 데려온다) */
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
/* 근거 대조 — 공백 무시(본차시 <br> 분할 대응) */
const inSrc = (k, s) => ok(SQ[k].includes(sq(s)), k + ' 본차시 근거 없음: ' + s);
const inBody = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const both = (k, s) => { inSrc(k, s); inBody(s); };

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('⚠️ 부팅 + u3 9항목 로드 + u2 동반 로드 (l01 review가 u2_l11을 넘어 받는다)', () => {
  W = boot();
  const k3 = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(k3.length === 9, 'u3 항목 ' + k3.length);
  const k2 = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(k2.length === 10, 'u2 동반 로드 실패 ' + k2.length + ' — l01 review가 죽는다');
  ok(Object.keys(W.LESSONS).length === 19, '엉뚱한 단원이 함께 로드됨 ' + Object.keys(W.LESSONS).length);
});
T('⚠️ 건너뛰는 키는 l08 하나뿐 (u2의 l09를 복제하면 어긋난다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u3_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(SKIPPED.length === 1, '건너뛴 키 개수 ' + SKIPPED.length);
  /* u2의 SKIPPED 자리를 그대로 복제하지 않았는지 역으로 못 박는다 */
  ok(!!L['u3_l09'], 'u2의 SKIPPED(l09)를 그대로 복제했다');
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
    const html = renderAll(W, 3, NS[k], L[k].slides.length + 2);
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
T('⚠️ review가 전 항목에 있다 (u2 계승) · 단일 concept 셋 · 묶음 l07 concept 다섯', () => {
  KEYS.forEach(k => ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
  SINGLE.forEach(k => {
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 3, k + ' concept ' + c + ' (단일은 셋)');
  });
  const c7 = L['u3_l07'].slides.filter(s => s.block === 'concept').length;
  ok(c7 === 5, 'l07 concept ' + c7 + ' (묶음은 다섯)');
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
    ok(renderAll(w2, 3, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (sq 갈래 — 본차시 <br> 분할 대응) ═══');
T('① l01 식물과 친해지기 도입 원문 일치', () => {
  ['식물마다 다른 생김새를 살펴봐요.',
   '우리 주변 식물에 호기심과 관심을 가져요.',
   '식물은 우리 주변 곳곳에서 살고 있어요.',
   '노란 꽃이 피고 솜털 씨앗이 날아가는 식물은?'].forEach(s => both('u3_l01', s));
});
T('② l02 잎 특징·분류 원문 일치', () => {
  ['기준에 따라 식물을 무리 지어 나눠요.',
   '잎은 보통 잎자루, 잎몸, 잎맥으로 이루어져 있어요.',
   '좋은 분류 기준은 누가 나눠도 결과가 같은 명확한 기준이에요.',
   '물·양분이 지나는 줄'].forEach(s => both('u3_l02', s));
  ['잎자루', '잎몸', '잎맥'].forEach(w => ok(SQ['u3_l02'].includes(w), '본차시 근거 없음: ' + w));
});
T('③ l03 들과 산 식물 원문 일치', () => {
  ['들과 산에 사는 식물을 관찰해요.',
   '풀은 줄기가 가늘고 연하며, 나무는 줄기가 굵고 단단해요.',
   '들과 산에 사는 식물은 그곳 환경에 어울리는 모습으로 살아가요.'].forEach(s => both('u3_l03', s));
  ['민들레', '소나무'].forEach(w => ok(SQ['u3_l03'].includes(w), '본차시 근거 없음: ' + w));
});
T('④ l04 강·호수 식물 원문 일치', () => {
  ['물에 사는 식물을 관찰해요.',
   '이 공기주머니 덕분에 물에 잘 떠서 살 수 있어요.',
   '물에 사는 식물도 뿌리·줄기·잎이 있어요.'].forEach(s => both('u3_l04', s));
  ['부레옥잠'].forEach(w => ok(SQ['u3_l04'].includes(w), '본차시 근거 없음: ' + w));
});
T('⑤ l05 특별한 곳 식물 원문 일치', () => {
  ['특별한 곳에 사는 식물을 관찰해요.',
   '잎이 가시로 변해 물이 빠져나가는 것을 막아요.',
   '뿌리는 넓게 뻗어 적은 물도 잘 빨아들여요.'].forEach(s => both('u3_l05', s));
  ['선인장', '사막'].forEach(w => ok(SQ['u3_l05'].includes(w), '본차시 근거 없음: ' + w));
});
T('⑥ l06 본뜨기 원문 일치', () => {
  ['식물의 특징을 본떠 만든 물건을 알아봐요.',
   '그 특징을 본떠 물건을 만들어요.',
   '붙였다 떼는 찍찍이', '빙글빙글 도는 헬리콥터 날개'].forEach(s => both('u3_l06', s));
});
T('⑦ l07 놀이터 원문 일치 (2차시 묶음)', () => {
  ['발명에 도움 줄 식물의 특징을 찾아봐요.',
   '만들고 싶은 것에 알맞은 식물 특징을 골라요.',
   '식물을 자세히 관찰하기', '친구와 생각을 나눠요'].forEach(s => both('u3_l07', s));
  ok(SQ['u3_l07'].includes('발명'), '본차시 근거 없음: 발명');
});
T('⑧ l09 벌레잡이 식물 원문 일치', () => {
  ['대부분의 식물은 햇빛을 받아 살아가지만',
   '그래서 벌레를 잡아 부족한 양분을 더 얻으며 살아가요.',
   '신기해도 가만히 관찰해요', '함부로 건드리지 않기'].forEach(s => both('u3_l09', s));
});
T('⑨ l10 단원 마무리 원문 일치', () => {
  ['식물의 생활에서 배운 것을 한눈에 정리해요.',
   '식물은 잎의 특징에 따라 분류해요.',
   '식물은 사는 곳에 알맞은 생김새를 가져요.', '소중히 여기기'].forEach(s => both('u3_l10', s));
});
T('⑩ 단원 낱말 4종 (sq 갈래 대조 — 칸에 갈라 담긴다)', () => {
  ['분류', '잎맥', '공기주머니', '가시'].forEach(w => {
    ok(SQALL.includes(sq(w)), '본차시 근거 없음: ' + w);
    ok(NOSTAR.includes(w), '본문 누락: ' + w);
  });
});
T('⚠️ sq 갈래 대조가 실제로 필요하다 (본차시 태그 분할 역확인 — 태그→공백·태그→없음 둘 다 깨진다)', () => {
  /* 태그를 공백으로 바꾸면 「잎의 특징에 따라 분류해요」(l10·태그가 낱말 사이 공백을 먹는다)가,
     태그를 지우면 「함부로 건드리지」(l09·<br>가 공백 자리)가 안 잡힌다. sq()만 둘 다 잡는다.
     이 자리가 초록이 아니면 본차시가 바뀐 것 — 대조 갈래를 다시 고를 것. */
  const txt0 = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  ok(!TXT['u3_l10'].includes('식물은 잎의 특징에 따라 분류해요.'), 'l10 태그→공백 갈래가 잡힌다 — 역확인 대상이 죽었다');
  ok(!txt0(SRC['u3_l09']).includes('함부로 건드리지'), 'l09 태그→없음 갈래가 잡힌다 — 역확인 대상이 죽었다');
  ok(SQ['u3_l10'].includes(sq('식물은 잎의 특징에 따라 분류해요.')) && SQ['u3_l09'].includes('함부로건드리지'),
     'sq 갈래에서도 안 잡힌다 — 본차시가 바뀌었다');
});

console.log('═══ D-2. 잎 특징 판정 검산기 (기준 셋 · 갈래 둘을 함께) ═══');
/* 진리표 — 본차시 l02 JS 실측. */
const LEAF = {
  '톱니':   { yes: ['단풍나무', '토끼풀', '민들레'], no: ['은행나무', '강아지풀', '소나무'] },
  '갈라짐': { yes: ['단풍나무', '민들레'],           no: ['은행나무', '강아지풀', '토끼풀', '소나무'] },
  '길쭉':   { yes: ['강아지풀', '소나무'],           no: ['단풍나무', '은행나무', '토끼풀', '민들레'] }
};
T('⚠️ 진리표 자체 검증 (같은 기준에서 두 갈래가 겹치지 않는다)', () => {
  Object.keys(LEAF).forEach(c => {
    const dup = LEAF[c].yes.filter(a => LEAF[c].no.includes(a));
    ok(dup.length === 0, c + ' 두 갈래에 겹친 식물: ' + dup.join(','));
    ok(LEAF[c].yes.length >= 2 && LEAF[c].no.length >= 2, c + ' 한쪽 갈래가 얇다');
  });
  ok(Object.keys(LEAF).length === 3, '기준 수 ' + Object.keys(LEAF).length);
});
const JUD = [...NOSTAR.matchAll(/([가-힣]{2,6}) — (톱니|갈라짐|길쭉) → (그렇다|아니다)/g)]
  .map(m => [m[1], m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 잎 특징 판정 선언이 열둘 이상', () => {
  ok(JUD.length >= 12, '선언 ' + JUD.length + '개 — 검산 대상이 죽었다');
});
T('⚠️ 잎 특징 판정 선언 전수 검산 (진리표 대조)', () => {
  const bad = JUD.filter(([a, c, v]) => {
    const t = LEAF[c];
    if (!t) return true;
    return (v === '그렇다') ? !t.yes.includes(a) : !t.no.includes(a);
  }).map(([a, c, v]) => a + ' — ' + c + ' → ' + v);
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ 기준 셋이 모두 실존 · 두 갈래가 다 있다 (한 갈래만이면 판별력 0)', () => {
  const seen = {};
  JUD.forEach(([a, c, v]) => { (seen[c] = seen[c] || new Set()).add(v); });
  ok(Object.keys(seen).length === 3, '실존 기준 ' + Object.keys(seen).length + '종');
  ok(new Set(JUD.map(x => x[2])).size === 2, '갈래가 하나뿐 — 판별력 0');
});
T('본차시가 잎 특징 분류를 실제로 가르친다 (근거 확인)', () => {
  ['분류', '기준', '톱니', '단풍나무'].forEach(w =>
    ok(SQ['u3_l02'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 사는 곳 갈래 검산기 (세 갈래를 함께) ═══');
const HAB = {
  '들과 산': ['민들레', '강아지풀', '소나무', '단풍나무', '토끼풀', '밤나무', '은행나무', '봉숭아'],
  '강과 호수': ['부레옥잠', '수련', '검정말', '부들', '개구리밥', '나사말'],
  '사막': ['선인장', '용설란', '바오바브나무', '알로에', '부채선인장']
};
T('⚠️ 진리표 자체 검증 (세 갈래가 겹치지 않는다)', () => {
  const names = [].concat(...Object.values(HAB));
  ok(new Set(names).size === names.length, '두 갈래에 겹친 식물이 있다');
  ok(Object.keys(HAB).length === 3, '갈래 수 ' + Object.keys(HAB).length);
});
const HD = [...NOSTAR.matchAll(/(?:^|[^가-힣])(들과 산|강과 호수|사막) — ([가-힣]{2,6})/g)]
  .map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 사는 곳 선언이 열둘 이상 · 세 갈래 각 셋 이상', () => {
  ok(HD.length >= 12, '선언 ' + HD.length + '건 — 검산 대상이 죽었다');
  Object.keys(HAB).forEach(h =>
    ok(HD.filter(x => x[0] === h).length >= 3, h + ' 선언 ' + HD.filter(x => x[0] === h).length + '건'));
});
T('⚠️ 사는 곳 선언 전수 검산 (다른 갈래 식물 혼입 0)', () => {
  const bad = HD.filter(([h, a]) => !HAB[h].includes(a)).map(([h, a]) => h + ' — ' + a);
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ 가장 긴 이름 바오바브나무(여섯 자)가 실제로 걸린다 (정규식 폭 역확인 — u2의 한 글자 역확인 자리)', () => {
  ok(HD.some(x => x[1] === '바오바브나무'), '바오바브나무가 안 걸렸다 — {2,6}이 좁아지면 조용히 빠진다');
  ok(!HD.some(x => x[1].length === 1), '한 글자 식물이 걸렸다 — u3에는 없어야 한다');
});
T('본차시가 세 사는 곳을 실제로 준다 (근거 확인)', () => {
  ok(SQ['u3_l03'].includes('들과산'), 'l03 근거 없음');
  ok(SQ['u3_l04'].includes('호수'), 'l04 근거 없음');
  ok(SQ['u3_l05'].includes('사막'), 'l05 근거 없음');
});

console.log('═══ D-4. 풀·나무 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ tnote의 교사 안내가 `아이 — 나무` 꼴로 걸린다 — STUDENT에서만 긁는다 */
const GRASS = ['민들레', '강아지풀', '토끼풀', '봉숭아', '해바라기'];
const TREE = ['소나무', '단풍나무', '밤나무', '은행나무', '떡갈나무', '향나무'];
T('⚠️ 진리표 자체 검증 (풀·나무가 겹치지 않는다)', () => {
  ok(!GRASS.some(w => TREE.includes(w)), '풀·나무에 겹친 식물');
});
const GT = [...STUDENT.matchAll(/([가-힣]{2,6}) — (풀|나무)(?![가-힣])/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 풀·나무 선언이 여섯 이상 · 두 갈래 각 둘 이상', () => {
  ok(GT.length >= 6, '선언 ' + GT.length + '건 — 검산 대상이 죽었다');
  ok(GT.filter(x => x[1] === '풀').length >= 2, '풀 선언 ' + GT.filter(x => x[1] === '풀').length + '건');
  ok(GT.filter(x => x[1] === '나무').length >= 2, '나무 선언 ' + GT.filter(x => x[1] === '나무').length + '건');
});
T('⚠️ 풀·나무 선언 전수 검산 (어긋남 0)', () => {
  const bad = GT.filter(([a, g]) => !(g === '풀' ? GRASS : TREE).includes(a)).map(([a, g]) => a + ' — ' + g);
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ tnote 교사 안내(아이 — 나무)는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/아이 — 나무/.test(TNOTE), 'tnote 오탐 자리가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  ok(!/아이 — 나무/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
  ok(!GT.some(x => /아이$/.test(x[0])), 'tnote 안내가 검산 대상에 새어 들었다');
});
T('본차시가 풀·나무를 실제로 가르친다 (근거 확인)', () => {
  ['풀은줄기가가늘고', '나무는줄기가굵고'].forEach(w =>
    ok(SQ['u3_l03'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-5. 물 저장 곳 검산기 (줄기 · 잎 두 갈래를 함께) ═══');
const STORE = { '줄기': ['선인장', '바오바브나무', '부채선인장'], '잎': ['용설란', '알로에'] };
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  ok(!STORE['줄기'].some(w => STORE['잎'].includes(w)), '줄기·잎에 겹친 식물');
});
const ST = [...NOSTAR.matchAll(/([가-힣]{2,6}) — (줄기|잎)에 물 저장/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 물 저장 선언이 다섯 이상 · 두 갈래 실존', () => {
  ok(ST.length >= 5, '선언 ' + ST.length + '건 — 검산 대상이 죽었다');
  ok(new Set(ST.map(x => x[1])).size === 2, '한 갈래만 선언됐다 — 판별력 0');
});
T('⚠️ 물 저장 선언 전수 검산 (어긋남 0)', () => {
  const bad = ST.filter(([a, w]) => !STORE[w].includes(a)).map(([a, w]) => a + ' — ' + w + '에 물 저장');
  ok(bad.length === 0, bad.join(' / '));
});
T('본차시가 물 저장을 실제로 가르친다 (근거 확인)', () => {
  ['줄기', '물을저장', '선인장'].forEach(w => ok(SQ['u3_l05'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-6. 본뜬 짝 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ tnote의 교사 안내가 `연잎 — 낙하산` 꼴로 걸린다 — STUDENT에서만 긁는다 */
const MIMIC = { '도꼬마리 갈고리': '찍찍이', '단풍나무 씨앗': '헬리콥터 날개', '연잎': '방수 옷', '민들레 씨앗': '낙하산' };
T('⚠️ 진리표 자체 검증 (넷 · 물건이 겹치지 않는다)', () => {
  const v = Object.values(MIMIC);
  ok(new Set(v).size === v.length, '물건이 겹친다');
  ok(v.length === 4, '짝 수 ' + v.length);
});
const BM = [...STUDENT.matchAll(/(도꼬마리 갈고리|단풍나무 씨앗|연잎|민들레 씨앗) — (찍찍이|헬리콥터 날개|방수 옷|낙하산)/g)]
  .map(m => [m[1], m[2]]);
const BL = [...STUDENT.matchAll(/(도꼬마리 갈고리|단풍나무 씨앗|연잎|민들레 씨앗) — /g)];
T('⚠️ 검산 대상 실존 — 본뜨기 선언이 여덟 이상 · 네 짝이 모두 실존', () => {
  ok(BM.length >= 8, '선언 ' + BM.length + '건 — 검산 대상이 죽었다');
  Object.keys(MIMIC).forEach(a =>
    ok(BM.some(x => x[0] === a && x[1] === MIMIC[a]), a + ' — ' + MIMIC[a] + ' 짝이 없다'));
});
T('⚠️ 본뜨기 선언 전수 검산 (어긋난 짝 0 · 진리표 밖 물건 0)', () => {
  const bad = BM.filter(([a, b]) => MIMIC[a] !== b).map(([a, b]) => a + ' — ' + b);
  ok(bad.length === 0, bad.join(' / '));
  ok(BL.length === BM.length, '진리표에 없는 물건이 선언됐다 ' + BL.length + '/' + BM.length + ' — 「X — 각각」 꼴 금지');
});
T('⚠️ tnote 교사 안내(연잎 — 낙하산)는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/연잎 — 낙하산/.test(TNOTE), 'tnote 오탐 자리가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  ok(!/연잎 — 낙하산/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
});
T('본차시가 본뜨기를 실제로 가르친다 (근거 확인)', () => {
  ['찍찍이', '헬리콥터', '도꼬마리'].forEach(w => ok(SQ['u3_l06'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-7. 벌레잡이 방법 검산기 (넷을 함께) ═══');
const TRAP = { '파리지옥': '잎을 닫아요', '끈끈이주걱': '끈끈이로 붙여요', '벌레잡이통풀': '통에 빠뜨려요', '통발': '빨아들여요' };
T('⚠️ 진리표 자체 검증 (넷 · 방법이 겹치지 않는다)', () => {
  const v = Object.values(TRAP);
  ok(new Set(v).size === v.length && v.length === 4, '방법이 겹치거나 모자란다');
});
const TP = [...NOSTAR.matchAll(/(파리지옥|끈끈이주걱|벌레잡이통풀|통발) — (잎을 닫아요|끈끈이로 붙여요|통에 빠뜨려요|빨아들여요)/g)]
  .map(m => [m[1], m[2]]);
const TL = [...NOSTAR.matchAll(/(파리지옥|끈끈이주걱|벌레잡이통풀|통발) — /g)];
T('⚠️ 검산 대상 실존 — 벌레잡이 선언이 여섯 이상 · 네 짝이 모두 실존', () => {
  ok(TP.length >= 6, '선언 ' + TP.length + '건 — 검산 대상이 죽었다');
  Object.keys(TRAP).forEach(a =>
    ok(TP.some(x => x[0] === a && x[1] === TRAP[a]), a + ' — ' + TRAP[a] + ' 짝이 없다'));
});
T('⚠️ 벌레잡이 선언 전수 검산 (어긋난 짝 0 · 진리표 밖 방법 0)', () => {
  const bad = TP.filter(([a, b]) => TRAP[a] !== b).map(([a, b]) => a + ' — ' + b);
  ok(bad.length === 0, bad.join(' / '));
  ok(TL.length === TP.length, '진리표에 없는 방법이 선언됐다 ' + TL.length + '/' + TP.length + ' — 「X — 각각/주머니로」 꼴 금지');
});
T('본차시 l09가 네 짝을 실제로 준다 (근거 확인 — sq 갈래)', () => {
  Object.keys(TRAP).forEach(a =>
    ok(SQ['u3_l09'].includes(sq(a + ' ' + TRAP[a])), '본차시 근거 없음: ' + a + ' ' + TRAP[a]));
});

console.log('═══ E. 안전 · 용어 가드 (과학 최우선 = 식물 존중) ═══');
T('⚠️ 식물 존중 3문구 + l03 손 씻기 — 과학 최우선 가드 (u2의 동물 안전 4문구와 자리가 다르다)', () => {
  const l09 = studentText('u3_l09'), l10 = studentText('u3_l10'), l03 = studentText('u3_l03');
  ok(/함부로 건드리지/.test(l09), 'l09 함부로 건드리지 문구 없음');
  ok(/가만히 관찰/.test(l09), 'l09 가만히 관찰 문구 없음');
  ok(/소중히 여/.test(l10), 'l10 소중히 여기기 문구 없음');
  ok(/손을 씻/.test(l03), 'l03 화단 관찰 손 씻기 문구 없음');
  /* 본차시가 실제로 존중을 짚는지 근거 확인(sq 갈래 — <br> 분할) */
  [['u3_l09', '함부로건드리지'], ['u3_l09', '가만히관찰'], ['u3_l10', '소중히여']].forEach(([k, w]) =>
    ok(SQ[k].includes(w), '본차시 ' + k + ' 근거 없음: ' + w));
  ['함부로 꺾어', '함부로 뽑아', '잎을 떼어 내'].forEach(w =>
    ok(!STUDENT.includes(w), '식물 훼손 문구가 학생 갈래에 남았다: ' + w));
});
T('⚠️ 상표 가드 — 본뜨기·놀이터 차시에 회사·제품 이름 0건 (찍찍이는 제외 = 근거 낱말)', () => {
  const BRAND = ['벨크로', '스피도', '나이키', '아디다스', '보잉', '에어버스', '고어텍스', '샤크스킨',
                 '듀폰', '지멘스', '테슬라', '삼성', '엘지', '혼다', '노스페이스', '컬럼비아',
                 '파타고니아', '3M', '레고', '디즈니'];
  const s67 = studentText('u3_l06') + studentText('u3_l07');
  const hit = BRAND.filter(w => s67.includes(w));
  ok(hit.length === 0, hit.join(','));
  ok(BRAND.length === 20, '상표 목록 ' + BRAND.length + '종');
  /* ⚠️ 찍찍이는 상표가 아니다 — 본차시 l06 근거 낱말. u2 목록에 있었다고 걸면 레드다 */
  ok(!BRAND.includes('찍찍이'), '찍찍이를 상표로 걸었다');
  ok(studentText('u3_l06').includes('찍찍이') && SQ['u3_l06'].includes('찍찍이'), '찍찍이 근거 자리가 사라졌다');
});
T('미도입 갈래(4학년 이상·중등 소관 + 서식지·생체모방) 학생 노출 0', () => {
  const BAN = ['진화', '적응', '광합성', '엽록소', '증산', '기공', '식충', '다육', '쌍떡잎', '외떡잎',
               '생태계', '종자', '수생', '부유', '침수', '서식지', '생체모방', '생물 다양성'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  ok(BAN.length === 18, '미도입 목록 ' + BAN.length + '종');
  /* ⚠️ 「분류」·「양분」 단독은 걸지 않는다 — l02가 정식으로 쓰는 낱말이다 */
  ok(STUDENT.includes('분류'), 'l02의 분류가 사라졌다 — 단독 가드를 걸었는지 확인');
  ok(studentText('u3_l02').includes('양분'), 'l02의 양분이 사라졌다 — 인용 대조와 어긋난다');
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['이분 분류', '생물 다양성', '정성 관찰'].forEach(w => {
    ok(!STUDENT.includes(w), '학생 노출: ' + w);
    ok(TNOTE.includes(w), 'tnote에 없음 — 대상 0건에서 사이좋게 초록이 난다: ' + w);
  });
  ['조작 변인', '통제 변인', '정량 관찰', '가설 검증', '변인 통제'].forEach(w =>
    ok(!STUDENT.includes(w), '학생 노출: ' + w));
});
T('⚠️ 「서식지」·「생체모방」은 u3 본차시 학생 화면에 없다 — 전 항목 미도입 (u2와 반대, 역단언)', () => {
  KEYS.forEach(k => {
    ok(!SQ[k].includes('서식지'), '본차시 ' + k + '가 서식지를 쓴다 — 단언 재검토');
    ok(!SQ[k].includes('생체모방'), '본차시 ' + k + '가 생체모방을 쓴다 — 단언 재검토');
  });
  /* u2 l11에는 실존했다 — 가드가 u2를 잘못 겨누지 않도록 역확인 */
  const t2 = plain(L['u2_l11'].slides);
  ok(t2.includes('서식지') && t2.includes('생체모방'), 'u2_l11 동반 로드가 흔들렸다');
});
T('⚠️ 선행 용어 9갈래 — slides − next_lesson − review (🚨 l01 review가 u2 exit를 데려온다)', () => {
  /* ⚠️ 가드 대상은 slides만 — extras는 뺀다. 예외는 next_lesson + review 두 블록.
     ⚠️ 「양분」으로는 걸 수 없다 — l02가 잎맥 설명에 쓴다. l09는 「벌레」로 건다. */
  const pre = (k, w) => ok(!plain(studentSlides(k, false, false)).includes(w), k + ' 본문에 ' + w + ' 선행');
  ['u3_l01'].forEach(k => { pre(k, '분류'); pre(k, '기준'); });
  ['u3_l01', 'u3_l02', 'u3_l03'].forEach(k => { pre(k, '부레옥잠'); pre(k, '공기주머니'); });
  ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04'].forEach(k => { pre(k, '사막'); pre(k, '가시'); });
  ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05'].forEach(k => pre(k, '본떠'));
  ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05', 'u3_l06'].forEach(k => pre(k, '발명'));
  ['u3_l01', 'u3_l02', 'u3_l03', 'u3_l04', 'u3_l05', 'u3_l06', 'u3_l07'].forEach(k => pre(k, '벌레'));
  /* 도입 자리에는 실존해야 한다 */
  ok(studentText('u3_l02').includes('분류') && studentText('u3_l02').includes('기준'), 'l02에 분류·기준 도입 없음');
  ok(studentText('u3_l04').includes('부레옥잠') && studentText('u3_l04').includes('공기주머니'), 'l04에 부레옥잠·공기주머니 도입 없음');
  ok(studentText('u3_l05').includes('사막') && studentText('u3_l05').includes('가시'), 'l05에 사막·가시 도입 없음');
  ok(studentText('u3_l06').includes('본떠'), 'l06에 본뜨기 도입 없음');
  ok(studentText('u3_l07').includes('발명'), 'l07에 발명 도입 없음');
  ok(studentText('u3_l09').includes('벌레'), 'l09에 벌레 도입 없음');
});
T('🚨 역단언 — l01 review에 「분류」·「본떠」가 실제로 있다 (가드를 review까지 넓히면 죽는다)', () => {
  const rv = plain(L['u3_l01'].slides.filter(s => s.block === 'review'));
  ok(rv.includes('분류') && rv.includes('본떠'), 'l01 review가 분류·본떠를 데려오지 않는다 — 가드 범위 재검토');
  /* review를 포함한 갈래에서는 실제로 걸린다 — 좁힌 이유를 실측으로 남긴다 */
  ok(plain(studentSlides('u3_l01', false, true)).includes('분류'), 'review 포함 갈래에서 분류가 안 걸린다 — 좁힐 이유가 사라졌다');
});
T('🚨 역단언 — 「양분」은 선행 가드로 걸 수 없다 (본차시 l02가 학생 화면에 쓴다)', () => {
  ok(SQ['u3_l02'].includes('양분'), '본차시 l02가 양분을 쓰지 않는다 — 가드 재검토');
  ok(plain(studentSlides('u3_l02', false, false)).includes('양분'), '케이티처 l02가 양분을 잃었다');
});
T('🚨 l06 concept note에 발명 0건 (note도 학생 노출 갈래)', () => {
  const c6 = plain(L['u3_l06'].slides.filter(s => s.block === 'concept'));
  ok(!c6.includes('발명'), 'l06 concept(note 포함)에 발명 선행');
  ok(/"note":/.test(c6), 'l06 concept에 note가 없다 — 단언 대상이 죽었다');
});
T('⚠️ next_lesson 예고 역검사 (l01→잎 · l03→물 · l05→활용 · l07→벌레 · l10→다음 단원)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(/잎/.test(nx('u3_l01')) && /나누/.test(nx('u3_l01')), 'l01 next_lesson이 잎 분류를 예고하지 않음');
  ok(/물/.test(nx('u3_l03')), 'l03 next_lesson이 물 식물을 예고하지 않음');
  ok(/활용|본떠/.test(nx('u3_l05')), 'l05 next_lesson이 본뜨기를 예고하지 않음');
  ok(/벌레/.test(nx('u3_l07')), 'l07 next_lesson이 벌레잡이 식물을 예고하지 않음');
  /* 마지막 항목은 다음 단원을 예고한다 — 단원 안을 가리키면 안 된다 */
  ok(/다음 단원/.test(nx('u3_l10')), 'l10이 다음 단원을 예고하지 않음');
});
T('⚠️ 성취기준 항목별 선언 — 다섯 갈래 · l07만 [4과12-03] (접두 4과03만 검사하면 l07이 샌다)', () => {
  const STD = { u3_l01: '단원 전체 통합', u3_l02: '[4과03-01]', u3_l03: '[4과03-02]',
                u3_l04: '[4과03-02]', u3_l05: '[4과03-02]', u3_l06: '[4과03-03]',
                u3_l07: '[4과12-03]', u3_l09: '단원 전체 통합', u3_l10: '단원 전체 통합' };
  KEYS.forEach(k => ok(L[k].meta.std === STD[k], k + ' std ' + L[k].meta.std));
  ok(new Set(Object.values(STD)).size === 5, '성취기준 갈래 수가 어긋남');
  ok(KEYS.filter(k => L[k].meta.std === '[4과12-03]').length === 1, '4과12-03이 l07 하나가 아니다');
  /* u2의 [4과02-*]가 딸려 오지 않았는지 */
  ok(!KEYS.some(k => /4과02/.test(L[k].meta.std)), 'u2 성취기준 잔재');
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
T('tnote 6슬 이상 · 구조 정합 (총 94슬 = 10×8 + 14)', () => {
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
T('⚠️ 2차시 묶음 = l07 하나 · 80분 · covers 가운뎃점 · period_split s12', () => {
  ok(PAIRED.length === 1, '2차시 묶음 개수 ' + PAIRED.length);
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
  /* u2의 묶음 자리(l08)를 복제하지 않았는지 */
  ok(!L['u3_l08'], 'u2의 묶음 자리 l08이 생겼다');
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
       k + '에 3교시 표시 — u3에는 3차시 묶음이 없다'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 · 9연쇄 · l01만 단원을 넘는다', () => {
  const chain = [['u3_l01', 'u2_l11'], ['u3_l02', 'u3_l01'], ['u3_l03', 'u3_l02'],
                 ['u3_l04', 'u3_l03'], ['u3_l05', 'u3_l04'], ['u3_l06', 'u3_l05'],
                 ['u3_l07', 'u3_l06'], ['u3_l09', 'u3_l07'], ['u3_l10', 'u3_l09']];
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
  const cross = chain.filter(([k, from]) => !/^u3_/.test(from));
  ok(cross.length === 1 && cross[0][0] === 'u3_l01', '단원을 넘는 계보가 ' + cross.length + '건');
  /* 묶음 l07을 넘어 l09가 받는다(l08 건너뜀) */
  ok(L['u3_l09'].slides.find(s => s.block === 'review').data.from === 'u3_l07', 'l09가 l07 exit를 받지 않는다');
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
    ok(m.grade === 3 && m.subject === '과학' && m.unit === 3, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 식물 탐험대', k + ' theme ' + m.theme + ' (u2의 동물 탐험대를 복제했는지)');
    ok(/^\.\.\/\.\.\/grade3\/semester1\/science\/3단원_/.test(m.live_url), k + ' live_url');
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
    ok(path.basename(f) === SFILE[k], k + ' live_url이 SFILE과 다르다');
  });
});
T('CURRICULUM ↔ LESSONS 정합 (u3 블록 9항목 · ready 9 · n 목록 l08 건너뜀)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u4가 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*3,[\s\S]*?(?=unit:\s*4,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 3 블록 없음');
  ok(/lesson_count:\s*9/.test(blk), 'lesson_count 9 아님 (항목 수 9이지 차시 수 10이 아니다)');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok(!ns.includes(8), 'n 목록에 8이 있다 — l08은 l07에 묶였다');
  ok((blk.match(/ready:\s*true/g) || []).length === 9, 'ready 9 아님');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ u1·u2 블록 무영향 회귀 (전방탐색이 u3를 먹지 않는다)', () => {
  const b1 = (CURRIC_SRC.match(/unit:\s*1,[\s\S]*?(?=unit:\s*2,|\];)/) || [''])[0];
  ok(/lesson_count:\s*9/.test(b1), 'u1 lesson_count가 흔들렸다');
  ok((b1.match(/ready:\s*true/g) || []).length === 9, 'u1 ready 9 아님');
  ok(!/unit:\s*2/.test(b1), 'u1 블록이 u2를 먹었다');
  const b2 = (CURRIC_SRC.match(/unit:\s*2,[\s\S]*?(?=unit:\s*3,|\];)/) || [''])[0];
  ok(/lesson_count:\s*10/.test(b2), 'u2 lesson_count가 흔들렸다');
  ok((b2.match(/ready:\s*true/g) || []).length === 10, 'u2 ready 10 아님 — u3가 딸려 들어왔다');
  ok(!/unit:\s*3/.test(b2), 'u2 블록이 u3를 먹었다');
});
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u1·u2·u3 셋)', () => {
  ['u1', 'u2', 'u3'].forEach(u =>
    ok(new RegExp('<script src="data\\/g3_science_' + u + '\\.js"><\\/script>').test(HOME),
       u + ' script 태그가 닫는 태그까지 성립하지 않는다'));
  ok(!/g3_science_u4\.js/.test(HOME), 'u4 배선이 미리 생겼다');
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
T('⚠️ 허브 "3_science" 등재 (units 3 · lessons 28) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_science":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_science 미등재');
  ok(+m[1] === 3, 'units ' + m[1]);
  ok(+m[2] === 28, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이지 차시 수가 아니다. u1 9 + u2 10 + u3 9 = 28. */
  ok(+m[2] === 9 + 10 + KEYS.length, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] !== 31, 'lessons에 차시 수 합 31을 넣었다 — 항목 수 28이어야 한다');
  ok(/id:\s*"science"/.test(HUB), '허브 SUB_HIGH에 과학이 없다');
});
T('⚠️ 허브 옆 줄 무영향 회귀 (3_korean 6/45 · 3_math 7/55)', () => {
  const k = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(k && +k[1] === 6 && +k[2] === 45, '3_korean 카운트가 흔들렸다');
  const t = HUB.match(/"3_math":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(t && +t[1] === 7 && +t[2] === 55, '3_math 카운트가 흔들렸다');
});
T('케이랩 매핑 없음 = 의도적 (실물 관찰·카드가 화면 교구보다 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_science_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u3 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '박음', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (놀이·발표 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
});
T('채움말 "자리" 0 (보호 어휘 = 잎자루·가장자리)', () => {
  /* ⚠️ u3 보호 어휘는 「잎자루」·「가장자리」(l02 잎 가장자리) — 생성기 자체 점검이 잡은 자리 */
  const hit = (BODY.match(/[가-힣 ]{0,6}자리[가-힣]{0,3}/g) || []).filter(s => !/잎자루|가장자리/.test(s));
  ok(hit.length === 0, hit.join(' / '));
  ok(/가장자리/.test(BODY), '보호 어휘 가장자리가 사라졌다 — 보호 목록 재검토');
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
