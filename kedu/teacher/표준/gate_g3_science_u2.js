/* gate_g3_science_u2.js — 케이티처 g3 과학 u2 「동물의 생활」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_science_u1.js 복제. **과학 두 번째 단원**이라 u1에서 온 갈래 중
      단원을 타는 것들은 전부 갈아 끼웠다. 복제할 사람은 아래를 먼저 읽을 것.

   (갈림 ①) **10항목 11차시**다. 건너뛰는 키는 **`u2_l09` 하나뿐**.
       ⚠️ u1의 SKIPPED는 `u1_l08`이었다 — 자리가 다르다. 복제하면 즉시 어긋난다.
   (갈림 ②) **2차시 묶음은 l08 하나**(80분·24슬·period_split "s12"·covers 가운뎃점).
       단일 아홉(40분·19슬) · 3차시 묶음 0 → **36슬 항목 0 · 물결 covers 0 ·
       3교시 표시 0**을 거꾸로 못 박는다. 총합 195슬 = 19×9 + 24 · 440분 = 40×9 + 80.
   (갈림 ③) **🚨 l01에 review가 있다 — u1과 정반대다.** u1_l01은 과학 라인 자체의
       첫 항목이라 계승할 자리가 없어 review가 없었지만, u2_l01은 **`u1_l10`을 넘어
       받는다**. 그래서 ①**전 항목 review 실존** ②**앞 단원(u1) 데이터 동반 로드 필수**
       ③계보가 단원을 넘는 자리가 l01 하나뿐임을 함께 못 박는다.
       ⚠️ u1 게이트의 "l01만 review 없음"·"다른 단원 0"을 복제하면 통째로 죽는다.
       ⚠️ l01 concept는 셋이다(u1_l01은 review 자리를 메우느라 넷이었다).
   (신규 ①) **D-2 분류 판정 검산기** — `동물 — 기준 → 그렇다|아니다` 선언을 긁어
       진리표와 견준다. 기준이 **셋**(날개·다리·지느러미)이고 갈래가 **둘**이라
       ⚠️ **세 기준이 모두 실존하고 각 기준에 두 갈래가 다 있는지**를 함께 건다.
       한 갈래만 있으면 "그렇다면 통과"가 되어 판별력이 0이다.
   (신규 ②) **D-3 서식지 갈래 검산기** — `땅|하늘|물|특별한 곳 — 동물` **네 갈래**.
       진리표 자체가 겹치지 않는지 먼저 검증한다.
       ⚠️ **한 글자 동물이 셋 있다**(뱀·벌·게). `[가-힣]{2,6}`으로 긁으면 조용히
          빠진다 — u1의 `{1,6}`을 반드시 지킬 것.
   (신규 ③) **D-4 새·곤충 다리 수 검산기** — `동물 — 새|곤충 → 다리 N개`.
       새 2개 / 곤충 6개를 산술로 견준다. 두 갈래 함께.
   (신규 ④) **D-5 본뜨기 짝 검산기** — `동물 부위 — 물건` 넷.
       ⚠️ **학생 노출 갈래에서만 긁는다.** tnote의 교사 안내가 `묻는 아이 — 물갈퀴`
          `답하는 아이 — 흡착판` 꼴로 걸려 통째로 오탐이 난다(실제로 밟은 자리).
   ⚠️ **검산기에는 반드시 「검산 대상이 N건 이상 실존한다」는 줄을 함께 둘 것** —
      없으면 대상 0건에서 사이좋게 초록이 난다(국어 u6·과학 u1 선례).
   (신규 ⑤) **과학 최우선 가드 = 안전**(국어의 저작권 자리). u2는 **동물을 대하는
      안전** 넷을 l10에서 못 박는다. u1의 세 문구(무리해서·장난치지·세게 당기)를
      복제하면 이 단원에는 그런 자리가 없어 통째로 레드가 난다.
   ⚠️ 「서식지」·「생체모방」은 학생 노출 용어다(본차시 l11이 직접 쓴다). 감추지 않되
      **풀이말 동반**(서식지=사는 곳 / 생체모방=특징을 본떠 물건 만들기)을 검사한다.
      u1의 「받침점 — 가운뎃점」과 같은 계열이다.
   ⚠️ 「지느러미」로 선행 가드를 걸면 안 된다 — l04가 판별 보기로 먼저 쓴다.
      l05 도입 가드는 **「아가미」**로 건다(l01~l04 0건 실측).
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_science_u2.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 부팅 body class는 **`kt3 subj-science`**다.
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다.
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다.
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      lessons = **항목 수 합 37**(u1 9 + u2 10 + u3 9 + u4 9)이지 차시 수 합 40이 아니다.
   ⚠️ jsdom은 세션마다 새로 깔아야 한다.
   ⚠️ 게이트는 **k-edu 클론에서 돌릴 것** — handoff에는 `grade3/`가 없어 본차시 대조가 죽는다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_science_u2.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const V3CSS = fs.readFileSync(path.join(TDIR, 'engine/teacher-v3.css'), 'utf8');
/* ⚠️ 앞 단원 동반 로드 필수 — u2_l01의 review가 u1_l10을 넘어 받는다 */
const DATA1 = fs.readFileSync(path.join(TDIR, 'data/g3_science_u1.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_science_u2.js'), 'utf8');
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

/* ⚠️ 10항목 11차시. 건너뛰는 키는 l09 하나뿐이다(u1은 l08이었다). */
const KEYS = ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l04', 'u2_l05',
              'u2_l06', 'u2_l07', 'u2_l08', 'u2_l10', 'u2_l11'];
const NS = { u2_l01: 1, u2_l02: 2, u2_l03: 3, u2_l04: 4, u2_l05: 5,
             u2_l06: 6, u2_l07: 7, u2_l08: 8, u2_l10: 10, u2_l11: 11 };
const PAIRED = ['u2_l08'];
const SINGLE = KEYS.filter(k => !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });
const SKIPPED = ['u2_l09'];

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/science/2단원_동물의생활');
const SFILE = {
  u2_l01: 'g3_sci_u2_l01_활짝과학열기.html',
  u2_l02: 'g3_sci_u2_l02_특징에따른동물분류.html',
  u2_l03: 'g3_sci_u2_l03_땅에사는동물.html',
  u2_l04: 'g3_sci_u2_l04_날수있는동물.html',
  u2_l05: 'g3_sci_u2_l05_물에사는동물.html',
  u2_l06: 'g3_sci_u2_l06_특별한곳에사는동물.html',
  u2_l07: 'g3_sci_u2_l07_생활속동물특징이용.html',
  u2_l08: 'g3_sci_u2_l08_창의과학놀이터.html',
  u2_l10: 'g3_sci_u2_l10_반려동물책임감돌보기.html',
  u2_l11: 'g3_sci_u2_l11_단원마무리.html'
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
  w.eval(DATA1); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA1);
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
T('⚠️ 부팅 + u2 10항목 로드 + u1 동반 로드 (l01 review가 u1_l10을 넘어 받는다)', () => {
  W = boot();
  const k2 = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(k2.length === 10, 'u2 항목 ' + k2.length);
  const k1 = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(k1.length === 9, 'u1 동반 로드 실패 ' + k1.length + ' — l01 review가 죽는다');
  ok(Object.keys(W.LESSONS).length === 19, '엉뚱한 단원이 함께 로드됨');
});
T('⚠️ 건너뛰는 키는 l09 하나뿐 (u1의 l08을 복제하면 어긋난다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u2_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(SKIPPED.length === 1, '건너뛴 키 개수 ' + SKIPPED.length);
  /* u1의 SKIPPED 자리를 그대로 복제하지 않았는지 역으로 못 박는다 */
  ok(!!L['u2_l08'], 'u1의 SKIPPED(l08)를 그대로 복제했다');
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
    const html = renderAll(W, 2, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ review가 전 항목에 있다 — u1(l01만 없음)과 정반대 (역단언)', () => {
  KEYS.forEach(k => ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
  const c = L['u2_l01'].slides.filter(s => s.block === 'concept').length;
  ok(c === 3, 'l01 concept ' + c + ' (u1_l01은 review 자리를 메우느라 넷이었다 — u2는 셋)');
});
T('img 폴백 경로 실존 (10개 미생성 = 폴백 정상)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/science\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
  const ids = KEYS.map(k => L[k].slides.find(s => s.data && s.data.img).data.img);
  ok(new Set(ids).size === 10, 'img 경로 중복 — 단원 안에서 갈라져야 한다');
});

console.log('═══ C. 회귀 (10항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, 2, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
const inSrc = (k, s) => ok(TXT[k].includes(s), k + ' 본차시 근거 없음: ' + s);
const inBody = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const both = (k, s) => { inSrc(k, s); inBody(s); };

T('① l01 몸짓·특징 도입 원문 일치', () => {
  ['동물의 특징을 몸짓으로 표현해요.',
   '동물마다 다른 생김새와 생활 방식을 살펴봐요.',
   '우리 주변 동물에 호기심을 가져요.'].forEach(s => both('u2_l01', s));
});
T('② l02 분류·기준 원문 일치', () => {
  ['동물을 관찰해 특징을 찾아요.',
   '동물의 특징으로 분류 기준을 정해요.',
   '기준에 따라 동물을 무리 지어 나눠요.'].forEach(s => both('u2_l02', s));
  ['공통점', '차이점'].forEach(w => ok(TXT['u2_l02'].includes(w), '본차시 근거 없음: ' + w));
});
T('③ l03 땅 동물 원문 일치', () => {
  ['땅에 사는 동물을 관찰해요.',
   '땅 위와 땅속에 사는 동물을 구분해요.',
   '다리와 이동 방법의 관계를 알아봐요.'].forEach(s => both('u2_l03', s));
  ['두더지', '지렁이'].forEach(w => ok(TXT['u2_l03'].includes(w), '본차시 근거 없음: ' + w));
});
T('④ l04 날 수 있는 동물 원문 일치', () => {
  ['날 수 있는 동물을 관찰해요.', '새와 곤충을 구분해요.',
   '날개와 나는 것의 관계를 알아봐요.'].forEach(s => both('u2_l04', s));
});
T('⑤ l05 물 동물 원문 일치', () => {
  ['물에 사는 동물을 관찰해요.', '물고기의 생김새를 알아봐요.',
   '지느러미와 아가미의 쓰임을 알아봐요.'].forEach(s => both('u2_l05', s));
});
T('⑥ l06 특별한 곳 동물 원문 일치', () => {
  ['특별한 곳에 사는 동물을 관찰해요.', '사막과 극지의 동물을 구분해요.',
   '환경에 알맞은 생김새를 알아봐요.'].forEach(s => both('u2_l06', s));
  ['낙타', '북극곰'].forEach(w => ok(TXT['u2_l06'].includes(w), '본차시 근거 없음: ' + w));
});
T('⑦ l07 본뜨기 도입 원문 일치', () => {
  ['동물의 특징을 본뜬 예를 알아봐요.', '동물과 본떠 만든 물건을 짝지어요.',
   '동물의 특징이 생활에 도움이 됨을 알아봐요.'].forEach(s => both('u2_l07', s));
});
T('⑧ l08 놀이터 원문 일치 (2차시 묶음)', () => {
  ['발명에 도움 줄 동물의 특징을 찾아봐요.',
   '만들고 싶은 것에 알맞은 동물 특징을 골라요.'].forEach(s => both('u2_l08', s));
  ok(TXT['u2_l08'].includes('발명'), '본차시 근거 없음: 발명');
});
T('⑨ l10 반려동물 원문 일치', () => {
  ['반려동물에게 필요한 돌봄을 알아봐요.', '반려동물을 책임감 있게 돌봐요.',
   '동물을 안전하게 대하는 방법을 알아봐요.'].forEach(s => both('u2_l10', s));
});
T('⑩ l11 단원 마무리 원문 일치', () => {
  ['2단원에서 배운 것을 한눈에 정리해요.',
   '2단원을 멋지게 마무리해요.'].forEach(s => both('u2_l11', s));
  ['서식지', '생체모방'].forEach(w => ok(TXT['u2_l11'].includes(w), '본차시 근거 없음: ' + w));
});
T('⑪ 단원 낱말 4종 (sq 갈래 대조 — 칸에 갈라 담긴다)', () => {
  ['분류', '특징', '지느러미', '아가미'].forEach(w => {
    ok(SQALL.includes(sq(w)), '본차시 근거 없음: ' + w);
    ok(NOSTAR.includes(w), '본문 누락: ' + w);
  });
});

console.log('═══ D-2. 분류 판정 검산기 (기준 셋 · 갈래 둘을 함께) ═══');
/* 진리표 — 기준별 그렇다/아니다. 본차시 실측으로 세웠다. */
const CRIT = {
  '날개가 있는가':   { yes: ['물까치', '나비'],           no: ['고라니', '뱀'] },
  '다리가 있는가':   { yes: ['다람쥐', '개미', '고라니'], no: ['뱀', '지렁이', '각시붕어'] },
  '지느러미가 있는가': { yes: ['붕어', '상어'],             no: ['문어', '게'] }
};
T('⚠️ 진리표 자체 검증 (같은 기준에서 두 갈래가 겹치지 않는다)', () => {
  Object.keys(CRIT).forEach(c => {
    const dup = CRIT[c].yes.filter(a => CRIT[c].no.includes(a));
    ok(dup.length === 0, c + ' 두 갈래에 겹친 동물: ' + dup.join(','));
    ok(CRIT[c].yes.length >= 2 && CRIT[c].no.length >= 2, c + ' 한쪽 갈래가 얇다');
  });
  ok(Object.keys(CRIT).length === 3, '기준 수 ' + Object.keys(CRIT).length);
});
/* ⚠️ 한 글자 동물이 셋(뱀·벌·게) — {1,6}을 지킬 것 */
const CLS = [...STUDENT.matchAll(/([가-힣]{1,6}) — ([가-힣 ]{2,12}가 있는가) → (그렇다|아니다)/g)]
  .map(m => [m[1], m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 분류 판정 선언이 열넷 이상', () => {
  ok(CLS.length >= 14, '선언 ' + CLS.length + '개 — 검산 대상이 죽었다');
});
T('⚠️ 분류 판정 선언 전수 검산 (진리표 대조)', () => {
  const bad = CLS.filter(([a, c, v]) => {
    const t = CRIT[c];
    if (!t) return true;
    return (v === '그렇다') ? !t.yes.includes(a) : !t.no.includes(a);
  }).map(([a, c, v]) => a + ' — ' + c + ' → ' + v);
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ 기준 셋이 모두 실존 · 기준마다 두 갈래가 다 있다 (한 갈래만이면 판별력 0)', () => {
  const seen = {};
  CLS.forEach(([a, c, v]) => { (seen[c] = seen[c] || new Set()).add(v); });
  ok(Object.keys(seen).length === 3, '실존 기준 ' + Object.keys(seen).length + '종');
  Object.keys(seen).forEach(c =>
    ok(seen[c].size === 2, c + ' 갈래 ' + seen[c].size + '종 — 두 갈래를 함께 걸어야 한다'));
});
T('본차시가 분류를 실제로 가르친다 (근거 확인)', () => {
  ['분류', '기준', '공통점', '차이점'].forEach(w =>
    ok(TXT['u2_l02'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 서식지 갈래 검산기 (네 갈래를 함께) ═══');
const HAB = {
  '땅': ['다람쥐', '개미', '지렁이', '뱀', '두더지'],
  '하늘': ['참새', '독수리', '나비', '벌', '비둘기'],
  '물': ['붕어', '상어', '문어', '게', '조개'],
  '특별한 곳': ['낙타', '사막여우', '북극곰', '펭귄', '도마뱀']
};
T('⚠️ 진리표 자체 검증 (네 갈래가 겹치지 않는다)', () => {
  const names = [].concat(...Object.values(HAB));
  ok(new Set(names).size === names.length, '두 갈래에 겹친 동물이 있다');
  ok(Object.keys(HAB).length === 4, '갈래 수 ' + Object.keys(HAB).length);
});
const HD = [...STUDENT.matchAll(/(땅|하늘|물|특별한 곳) — ([가-힣]{1,6})(?![가-힣])/g)]
  .map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 서식지 선언이 스물 이상 · 네 갈래 각 넷 이상', () => {
  ok(HD.length >= 20, '선언 ' + HD.length + '건 — 검산 대상이 죽었다');
  Object.keys(HAB).forEach(h =>
    ok(HD.filter(x => x[0] === h).length >= 4, h + ' 선언 ' + HD.filter(x => x[0] === h).length + '건'));
});
T('⚠️ 서식지 선언 전수 검산 (다른 갈래 동물 혼입 0)', () => {
  const bad = HD.filter(([h, a]) => !HAB[h].includes(a)).map(([h, a]) => h + ' — ' + a);
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ 한 글자 동물 셋(뱀·벌·게)이 실제로 걸린다 (정규식 폭 역확인)', () => {
  ['뱀', '벌', '게'].forEach(a =>
    ok(HD.some(x => x[1] === a), a + '이(가) 안 걸렸다 — {2,6}으로 긁으면 조용히 빠진다'));
});
T('본차시가 네 서식지를 실제로 준다 (근거 확인)', () => {
  ok(TXT['u2_l03'].includes('땅'), 'l03 근거 없음');
  ok(TXT['u2_l04'].includes('날'), 'l04 근거 없음');
  ok(TXT['u2_l05'].includes('물'), 'l05 근거 없음');
  ok(TXT['u2_l06'].includes('사막') && TXT['u2_l06'].includes('극지'), 'l06 근거 없음');
});

console.log('═══ D-4. 새·곤충 다리 수 검산기 (두 갈래를 함께) ═══');
const legs = (kind) => (kind === '새' ? 2 : 6);
T('⚠️ 판정기 자체 검증 (두 갈래)', () => {
  ok(legs('새') === 2 && legs('곤충') === 6, '판정기가 뒤집혔다');
});
const LG = [...STUDENT.matchAll(/([가-힣]{1,6}) — (새|곤충) → 다리 (\d)개/g)]
  .map(m => [m[1], m[2], +m[3]]);
T('⚠️ 검산 대상 실존 — 다리 수 선언이 여섯 이상 · 두 갈래 각 둘 이상', () => {
  ok(LG.length >= 6, '선언 ' + LG.length + '건 — 검산 대상이 죽었다');
  ok(LG.filter(x => x[1] === '새').length >= 2, '새 선언 ' + LG.filter(x => x[1] === '새').length + '건');
  ok(LG.filter(x => x[1] === '곤충').length >= 2, '곤충 선언 ' + LG.filter(x => x[1] === '곤충').length + '건');
});
T('⚠️ 다리 수 선언 전수 검산 (새 2개 · 곤충 6개)', () => {
  const bad = LG.filter(([a, k, n]) => legs(k) !== n)
    .map(([a, k, n]) => a + ' — ' + k + ' → 다리 ' + n + '개 (기대 ' + legs(k) + ')');
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ 새와 곤충에 같은 동물이 겹쳐 선언되지 않는다', () => {
  const b = new Set(LG.filter(x => x[1] === '새').map(x => x[0]));
  const i = LG.filter(x => x[1] === '곤충').map(x => x[0]).filter(a => b.has(a));
  ok(i.length === 0, '두 갈래에 겹친 동물: ' + i.join(','));
});
T('본차시가 새·곤충 갈래를 실제로 가르친다 (근거 확인)', () => {
  ['날개', '곤충'].forEach(w => ok(TXT['u2_l04'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-5. 본뜨기 짝 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ tnote의 교사 안내가 `묻는 아이 — 물갈퀴` 꼴로 걸린다 — STUDENT에서만 긁는다 */
const BIO = { '오리 발': '물갈퀴', '새 날개': '비행기', '상어 비늘': '빠른 수영복', '문어 빨판': '흡착판' };
T('⚠️ 진리표 자체 검증 (넷 · 물건이 겹치지 않는다)', () => {
  const v = Object.values(BIO);
  ok(new Set(v).size === v.length, '물건이 겹친다');
  ok(v.length === 4, '짝 수 ' + v.length);
});
const BM = [...STUDENT.matchAll(/([가-힣]{1,6}(?: [가-힣]{1,4})?) — (물갈퀴|비행기|빠른 수영복|흡착판)/g)]
  .map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 본뜨기 선언이 여덟 이상 · 네 짝이 모두 실존', () => {
  ok(BM.length >= 8, '선언 ' + BM.length + '건 — 검산 대상이 죽었다');
  Object.keys(BIO).forEach(a =>
    ok(BM.some(x => x[0] === a && x[1] === BIO[a]), a + ' — ' + BIO[a] + ' 짝이 없다'));
});
T('⚠️ 본뜨기 선언 전수 검산 (어긋난 짝 0)', () => {
  const bad = BM.filter(([a, b]) => BIO[a] !== b).map(([a, b]) => a + ' — ' + b);
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ tnote 교사 안내는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/묻는 아이 — 물갈퀴|답하는 아이 — 흡착판/.test(TNOTE),
     'tnote 오탐 자리가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  ok(!BM.some(x => /아이$/.test(x[0])), 'tnote 안내가 검산 대상에 새어 들었다');
});
T('본차시가 본뜨기를 실제로 가르친다 (근거 확인)', () => {
  ['물갈퀴', '흡착판'].forEach(w => ok(TXT['u2_l07'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ E. 안전 · 용어 가드 (과학 최우선 = 안전) ═══');
T('⚠️ 동물 안전 4문구 실존 — 과학 최우선 가드 (u1의 세 문구와 자리가 다르다)', () => {
  const l10 = studentText('u2_l10');
  ok(/손을 깨끗이/.test(l10), 'l10 손 씻기 문구 없음');
  ok(/갑자기 다가가/.test(l10), 'l10 모르는 동물 접근 문구 없음');
  ok(/큰 소리/.test(l10), 'l10 놀라게 하지 않기 문구 없음');
  ok(/무서워하면/.test(l10) && /억지로/.test(l10), 'l10 억지로 하지 않기 문구 없음');
  /* 본차시가 실제로 안전을 짚는지 근거 확인 */
  ['손', '다가가', '큰 소리', '무서워', '억지로'].forEach(w =>
    ok(TXT['u2_l10'].includes(w), '본차시 l10 근거 없음: ' + w));
});
T('⚠️ 상표 가드 — 수영복·흡착판·반려동물 차시에 회사·제품 이름 0건', () => {
  const BRAND = ['나이키', '아디다스', '스피도', '삼성', '엘지', 'LG', '현대', '기아',
                 '로얄캐닌', '퓨리나', '시저', '하림', '디즈니', '픽사', '포켓몬',
                 '니모', '펭수', '뽀로로', '도라에몽', '벨크로'];
  const hit = BRAND.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* 이름 대신 하는 일로 쓴다 */
  ok(studentText('u2_l07').includes('빠른 수영복'), '하는 일로 쓴 자리가 없다');
});
T('미도입 갈래(4학년 이상·중등 소관) 학생 노출 0', () => {
  const BAN = ['척추동물', '무척추동물', '절지동물', '연체동물', '포유류', '조류', '파충류',
               '양서류', '어류', '변온동물', '항온동물', '생태계', '먹이사슬', '먹이 그물',
               '적응', '진화', '학명', '분류 체계', '종류별 분류', '기관계', '항상성'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* ⚠️ 「분류」 단독은 걸지 않는다 — l02가 정식으로 가르치는 낱말이다 */
  ok(STUDENT.includes('분류'), 'l02의 분류가 사라졌다 — 단독 가드를 걸었는지 확인');
  /* ⚠️ 「새」도 단독으로 걸 수 없다 — l04가 갈래 이름으로 직접 쓴다 */
  ok(STUDENT.includes('곤충'), 'l04의 곤충이 사라졌다');
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['정성 관찰'].forEach(w => {
    ok(!STUDENT.includes(w), '학생 노출: ' + w);
    ok(TNOTE.includes(w), 'tnote에 없음 — 대상 0건에서 사이좋게 초록이 난다: ' + w);
  });
  ['조작 변인', '통제 변인', '정량 관찰', '가설 검증', '변인 통제'].forEach(w =>
    ok(!STUDENT.includes(w), '학생 노출: ' + w));
});
T('⚠️ 「서식지」·「생체모방」은 학생 노출 용어 — 풀이말 동반 (l11)', () => {
  ok(TXT['u2_l11'].includes('서식지'), '본차시 l11이 서식지를 쓰지 않는다 — 단언 재검토');
  ok(TXT['u2_l11'].includes('생체모방'), '본차시 l11이 생체모방을 쓰지 않는다 — 단언 재검토');
  const t = studentText('u2_l11');
  ok(t.includes('서식지(사는 곳)'), 'l11에 서식지 풀이말이 없다');
  ok(t.includes('생체모방(특징을 본떠 물건 만들기)'), 'l11에 생체모방 풀이말이 없다');
  /* 도입 전 차시에는 나오지 않는다 */
  KEYS.filter(k => k !== 'u2_l11').forEach(k => {
    ok(!plain(studentSlides(k, false)).includes('서식지'), k + '에 서식지 선행');
    ok(!plain(studentSlides(k, false)).includes('생체모방'), k + '에 생체모방 선행');
  });
});
T('⚠️ 선행 용어 4갈래 — 분류 l02 · 곤충 l04 · 아가미 l05 · 본떠 l07', () => {
  /* ⚠️ 가드 대상은 slides만 — extras는 뺀다. 예외는 next_lesson 블록뿐이다.
     ⚠️ 「지느러미」로는 걸 수 없다 — l04가 판별 보기로 먼저 쓴다. 아가미로 건다. */
  const pre = (k, w) => ok(!plain(studentSlides(k, false)).includes(w), k + ' 본문에 ' + w + ' 선행');
  ['u2_l01'].forEach(k => pre(k, '분류'));
  ['u2_l01', 'u2_l02', 'u2_l03'].forEach(k => pre(k, '곤충'));
  ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l04'].forEach(k => pre(k, '아가미'));
  ['u2_l01', 'u2_l02', 'u2_l03', 'u2_l04', 'u2_l05', 'u2_l06'].forEach(k => pre(k, '본떠'));
  /* 도입 자리에는 실존해야 한다 */
  ok(studentText('u2_l02').includes('분류'), 'l02에 분류 도입 없음');
  ok(studentText('u2_l04').includes('곤충'), 'l04에 곤충 도입 없음');
  ok(studentText('u2_l05').includes('아가미'), 'l05에 아가미 도입 없음');
  ok(studentText('u2_l07').includes('본떠'), 'l07에 본뜨기 도입 없음');
});
T('⚠️ next_lesson 예고 역검사 (l01→분류 · l04→물 · l06→본뜨기 · l08→반려동물)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(/분류|특징에 따라/.test(nx('u2_l01')), 'l01 next_lesson이 분류를 예고하지 않음');
  ok(/물/.test(nx('u2_l04')), 'l04 next_lesson이 물 동물을 예고하지 않음');
  ok(/본떠|특징을/.test(nx('u2_l06')), 'l06 next_lesson이 본뜨기를 예고하지 않음');
  ok(/반려동물/.test(nx('u2_l08')), 'l08 next_lesson이 반려동물을 예고하지 않음');
  /* 마지막 항목은 다음 단원을 예고한다 — 단원 안을 가리키면 안 된다 */
  ok(/다음 단원/.test(nx('u2_l11')), 'l11이 다음 단원을 예고하지 않음');
});
T('⚠️ 성취기준 항목별 선언 (본차시 지도서 쪽수 기준 실측)', () => {
  const STD = { u2_l01: '단원 전체 통합', u2_l02: '[4과02-01]', u2_l03: '[4과02-02]',
                u2_l04: '[4과02-02]', u2_l05: '[4과02-02]', u2_l06: '[4과02-02]',
                u2_l07: '[4과02-03]', u2_l08: '[4과02-03]', u2_l10: '단원 전체 통합',
                u2_l11: '단원 전체 통합' };
  KEYS.forEach(k => ok(L[k].meta.std === STD[k], k + ' std ' + L[k].meta.std));
  ok(new Set(Object.values(STD)).size === 4, '성취기준 갈래 수가 어긋남');
  /* u1의 [4과01-*]가 딸려 오지 않았는지 */
  ok(!KEYS.some(k => /4과01/.test(L[k].meta.std)), 'u1 성취기준 잔재');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 (36슬 항목 0)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음이 생겼다');
});
T('⚠️ 슬라이드 총합 195슬 (19×9 + 24) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 195, '총합 ' + tot);
  ok(tot === 19 * SINGLE.length + 24 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('extras 전 항목 20개 · 참조 무결성 · 중복 0 (총합 200)', () => {
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
  ok(tot === 200, 'extras 총합 ' + tot);
});
T('tnote 6슬 이상 · 구조 정합 (총 104슬)', () => {
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
  ok(tot === 104, 'tnote 총합 ' + tot);
});
T('⚠️ 3차시 묶음 0 — covers 물결 0건 · 120분 0 · period_split 경계는 전부 하나', () => {
  KEYS.forEach(k => {
    ok(!/~/.test(L[k].meta.covers), k + ' covers에 물결 ' + L[k].meta.covers);
    ok(L[k].meta.duration_min !== 120, k + ' 120분 항목이 생겼다');
    if (L[k].meta.period_split)
      ok(!L[k].meta.period_split.includes(','), k + ' 경계가 둘 ' + L[k].meta.period_split);
  });
});
T('⚠️ 2차시 묶음 = l08 하나 · 80분 · covers 가운뎃점 · period_split s12', () => {
  ok(PAIRED.length === 1, '2차시 묶음 개수 ' + PAIRED.length);
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 단일 차시 = 40분 · period_split 없음 · covers 단수 (아홉)', () => {
  ok(SINGLE.length === 9, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 40, k + ' ' + m.duration_min + '분');
    ok(!m.period_split, k + ' period_split 있음');
    ok(!/[·~]/.test(m.covers), k + ' covers ' + m.covers);
  });
});
T('⚠️ 수업시간 합 = 11차시 × 40분 = 440분 — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 440, '합 ' + tot);
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
       k + '에 3교시 표시 — u2에는 3차시 묶음이 없다'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 · 9연쇄 · l01만 단원을 넘는다', () => {
  const chain = [['u2_l01', 'u1_l10'], ['u2_l02', 'u2_l01'], ['u2_l03', 'u2_l02'],
                 ['u2_l04', 'u2_l03'], ['u2_l05', 'u2_l04'], ['u2_l06', 'u2_l05'],
                 ['u2_l07', 'u2_l06'], ['u2_l08', 'u2_l07'], ['u2_l10', 'u2_l08'],
                 ['u2_l11', 'u2_l10']];
  ok(chain.length === 10, '계보 길이 ' + chain.length);
  chain.forEach(([k, from]) => {
    const rv = L[k].slides.find(s => s.block === 'review');
    ok(rv.data.from === from, k + ' from ' + rv.data.from + ' (기대 ' + from + ')');
    const ex = L[from].slides.find(s => s.block === 'exit_ticket');
    ok(ex, from + ' exit 없음 — 앞 단원 동반 로드를 확인할 것');
    ok(JSON.stringify(rv.data.items) === JSON.stringify(ex.data.items),
       k + ' review가 ' + from + ' exit를 그대로 계승하지 않음');
  });
  /* ⚠️ 단원을 넘는 자리는 l01 하나뿐이다 — 늘어나면 동반 로드 전제가 흔들린다 */
  const cross = chain.filter(([k, from]) => !/^u2_/.test(from));
  ok(cross.length === 1 && cross[0][0] === 'u2_l01', '단원을 넘는 계보가 ' + cross.length + '건');
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
    ok(m.grade === 3 && m.subject === '과학' && m.unit === 2, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 동물 탐험대', k + ' theme ' + m.theme);
    ok(/^\.\.\/\.\.\/grade3\/semester1\/science\/2단원_/.test(m.live_url), k + ' live_url');
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
  });
});
T('CURRICULUM ↔ LESSONS 정합 (u2 블록 10항목 · ready 10 · n 목록 l09 건너뜀)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u3가 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*2,[\s\S]*?(?=unit:\s*3,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 2 블록 없음');
  ok(/lesson_count:\s*10/.test(blk), 'lesson_count 10 아님 (항목 수 10이지 차시 수 11이 아니다)');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok(!ns.includes(9), 'n 목록에 9가 있다 — l09는 l08에 묶였다');
  ok((blk.match(/ready:\s*true/g) || []).length === 10, 'ready 10 아님');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ u1 블록 무영향 회귀 (전방탐색이 u2를 먹지 않는다)', () => {
  const b1 = (CURRIC_SRC.match(/unit:\s*1,[\s\S]*?(?=unit:\s*2,|\];)/) || [''])[0];
  ok(/lesson_count:\s*9/.test(b1), 'u1 lesson_count가 흔들렸다');
  ok((b1.match(/ready:\s*true/g) || []).length === 9, 'u1 ready 9 아님 — u2가 딸려 들어왔다');
  ok(!/unit:\s*2/.test(b1), 'u1 블록이 u2를 먹었다');
});
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u1·u2 둘 다)', () => {
  ok(/<script src="data\/g3_science_u1\.js"><\/script>/.test(HOME),
     'u1 script 태그가 닫는 태그까지 성립하지 않는다');
  ok(/<script src="data\/g3_science_u2\.js"><\/script>/.test(HOME),
     'u2 script 태그가 닫는 태그까지 성립하지 않는다');
  const open = (HOME.match(/<script[\s>]/g) || []).length;
  const close = (HOME.match(/<\/script>/g) || []).length;
  ok(open === close, 'script 여닫이 개수 불일치 ' + open + '/' + close);
});
T('홈 slug · 과목 · 복제 원본(국어) 잔재 0', () => {
  ok(/slug:\s*"g3_science"/.test(HOME), 'slug 어긋남');
  ok(/subject:\s*"과학"/.test(HOME), 'subject 어긋남');
  ok(!/g3_korean|g3_math/.test(HOME), '다른 과목 파일 잔재');
  /* ⚠️ 주석은 뺀다 — 머리 주석이 국어를 **의도적 견줌**으로 적는다.
     걸러야 할 것은 복제 원본에서 딸려 온 **렌더 대상** 국어다. */
  const noComment = HOME.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const hit = (noComment.match(/국어/g) || []);
  ok(hit.length === 0, '렌더 대상에 국어 잔재 ' + hit.length + '건');
  ok(/과학/.test(noComment), '과학 표기가 없다');
});
T('⚠️ 허브 "3_science" 등재 (units 4 · lessons 37) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_science":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_science 미등재');
  ok(+m[1] === 4, 'units ' + m[1]);
  ok(+m[2] === 37, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이지 차시 수가 아니다 (국어 u5에서 깨진 자리).
     u1 9 + u2 10 + u3 9 + u4 9 = 37. 단원이 늘 때마다 이 줄을 함께 올릴 것. */
  ok(+m[2] === 9 + KEYS.length + 9 + 9, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] !== 40, 'lessons에 차시 수 합 40을 넣었다 — 항목 수 37이어야 한다');
  ok(/id:\s*"science"/.test(HUB), '허브 SUB_HIGH에 과학이 없다');
});
T('⚠️ 허브 옆 줄 무영향 회귀 (3_korean 6/45 · 3_math 7/55)', () => {
  const k = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(k && +k[1] === 6 && +k[2] === 45, '3_korean 카운트가 흔들렸다');
  const t = HUB.match(/"3_math":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(t && +t[1] === 7 && +t[2] === 55, '3_math 카운트가 흔들렸다');
});
T('케이랩 매핑 없음 = 의도적 (실물 동물 카드·관찰이 화면 교구보다 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_science_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u2 차단 어휘 0', () => {
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
    /* ⚠️ 보호 어휘에 「모둠·붙일」을 더했다 — u2는 모둠 앉는 곳과 약속을 붙이는
       곳을 실제로 가리킨다(u1에는 없던 자리). 나머지 열아홉은 「곳/때/대목」으로 갈랐다. */
    .filter(s => !/(빈|제|학생|앉을|누울|한|두|세|네|모둠|붙일)\s*자리/.test(s));
  ok(hit.length === 0, hit.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
