/* gate_g3_science_u4.js — 케이티처 g3 과학 u4 「생물의 한살이」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_science_u3.js 복제. **과학 네 번째 단원**이라 u3에서 온 갈래 중
      단원을 타는 것들은 전부 갈아 끼웠다. 복제할 사람은 아래를 먼저 읽을 것.

   (갈림 ①) **9항목 11차시 — 2차시 묶음이 둘이다**(l02 = 2·3차시 · l08 = 8·9차시).
       u1·u2·u3는 묶음이 하나뿐이었다. 총합 181슬 = 19×7 + 24×2 · 440분 = 40×7 + 80×2.
   (🚨 갈림 ② — 이 단원에서 가장 중요한 대목) **키 번호 = 그 항목이 여는 차시 번호(n)**.
       엔진 `lessonKey(unit, lesson)`이 CURRICULUM의 n을 그대로 `u4_l{NN}`으로 만들어
       찾는다. 처음 데이터는 **본차시 파일 차례**(l01~l07·l09·l10)로 키를 매겨서
       홈 카드 아홉 중 **일곱이 엉뚱한 차시를 열거나 아예 안 열렸다**(2026-08-26 실측).
       → 키를 n에 맞춰 다시 매겼다. **건너뛰는 키는 `u4_l03`·`u4_l09` 둘**(묶음이
       먹은 뒤 차시)이고, n 목록에서도 3과 9가 빠진다.
       ⚠️ **본차시 파일 번호와는 어긋난다** — `u4_l04`의 근거 파일은 `..._l03_...`이다.
          SFILE 매핑을 이름 규칙으로 짐작하지 말 것.
       ⚠️ 이 게이트는 **홈 카드가 여는 차시를 실제로 확인한다**(B 섹션). 렌더 길이만
          재면 openShow가 실패해도 앞 차시 화면이 남아 조용히 초록이 난다(실측).
   (갈림 ③) **전 항목 review가 있다(u3 계승).** u4_l01은 **`u3_l10`을 넘어 받는다**
       → **앞 단원(u3) 데이터 동반 로드 필수** · 단원을 넘는 자리는 l01 하나뿐.
       ⚠️ 부팅 뒤 `Object.keys(W.LESSONS).length === 18`(u3 9 + u4 9). u1·u2는 싣지 않는다.
       ⚠️ l10은 묶음 l08의 exit를 받는다(l09 키가 없다).
   (🚨 신규 함정 ①) **「잠자리」로는 선행 가드를 못 건다** — 본차시가 l02에서
       「사마귀·잠자리·메뚜기처럼」으로, l04에서 「닭·개구리·잠자리·뱀처럼」으로 먼저 쓴다.
       l10 도입 가드는 **「무당벌레」**로 건다. l02·l04에 잠자리가 실존하는지 역단언.
   (🚨 신규 함정 ②) **「빛」과 「햇빛」은 다른 낱말이다** — 본차시 l05가 「빛이 없으면」으로
       「빛」을 쓴다(싹틀 때는 빛이 없어도 된다는 결론 자체다). l06 선행 가드는
       **「햇빛」만** 건다. l05 본문에 「빛」 실존 · 「햇빛」 0건 · l05 next_lesson에
       「햇빛」 실존을 역단언으로 잠근다.
   (🚨 신규 함정 ③) **민들레는 풀이지만 여러해살이다**(l07 오개념 자리) — 「풀 = 한해살이」로
       진리표를 짜면 레드다. D-4 진리표는 한해살이/여러해살이 두 갈래로만 짠다.
   (🚨 신규 함정 ④) **성취기준 다섯 갈래 · l08만 `[4과12-03]`**, 나머지는
       `[4과04-01~03]`·단원 전체 통합. u3의 `4과03` 접두로 짜면 통째로 샌다.
   (검산기 여섯 — 전부 「대상 N건 실존」 + 「선언 표지 수 = 검산된 수」 동반)
       D-2 알·새끼 `닭 — 알을 낳아요` (BODY · **개·소·뱀·새·닭 한 글자 역확인**)
       D-3 번데기 유무 `배추흰나비 — 번데기 있음` (**STUDENT만** — tnote 오탐 `아이 — 번데기 있음`)
       D-4 한해·여러해 `벼 — 한해살이` (**STUDENT만** — tnote 오탐 `아이 — 여러해살이`)
       D-5 조건 판정 `씨 싹트기 — 햇빛 → 아니다` (기준 셋 · 갈래 둘 · 대상 둘, BODY)
       D-6 실험 조건 `물 실험 — 온도 → 같게 할 조건`
           (**표가 아니라 규칙** — 실험마다 「다르게」가 정확히 하나 · 「같게」 둘 이상)
       D-7 다음 단계 `배추흰나비 · 애벌레 — 다음은 번데기`
           (**왼쪽에 생물 이름을 함께** — 배추흰나비의 알과 닭의 알이 부딪친다)
   ⚠️ **LEFT 검사를 이름 목록으로 짜지 말 것** — 본문이 「강낭콩 · 감나무 · 벼」처럼
      가운뎃점을 구분자로 쓴다. `(이름) · ` 꼴로 짜면 26건이 걸린다(3/4 실측).
      **선언 표지 자체를 세는 꼴**(`— 다음은` / `— 번데기 (있음|없음)` /
      `— (한해살이|여러해살이)`)로 짜고 그 수와 검산된 수가 같은지를 잰다.
   ⚠️ D-4의 표지에는 **낱말 경계**가 필요하다 — 자기점검의
      「지식·이해 — 한해살이와 여러해살이를…」이 `(?![가-힣])` 없이는 걸린다(실측).
   (안전) **과학 최우선 가드 = 생명 존중.** u3의 「함부로 건드리지」·「가만히 관찰」을
       복제하면 u4 본차시엔 없어 레드다. u4는 「꾸준히 관찰」(l01) ·
       「함부로 만지지」(l02) · 「소중히 여」(l10) + 실험 뒤 「손을 씻」(l05·l06).
   ⚠️ **concept의 `note`는 학생 노출 갈래다** — 난생·태생은 tnote에만 둔다(3/4에서 옮긴 자리).
   ⚠️ **교시 경계(s12) tnote는 「⏸ 여기까지 1교시(40분)」로 시작한다**(u1~u3 규약).
      3/4 데이터는 l08이 이 표지를 잃고 있었다 — 생성기가 구조적으로 앞에 붙이도록 고쳤다.
   ⚠️ 채움말 「자리」 보호 어휘 = **같은 자리·제자리·잠자리**(「잠자리」가 「자리」로 걸린다).
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_science_u4.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 부팅 body class는 **`kt3 subj-science`**다.
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다(u5 대비).
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다(u1·u2·u3·u4 넷).
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      lessons = **항목 수 합 37**(u1 9 + u2 10 + u3 9 + u4 9)이지 차시 수 합 40이 아니다.
   ⚠️ 본차시 근거 대조는 **`sq()`(공백 제거) 한 갈래**로만 한다(u3의 교훈).
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

/* ⚠️ 9항목 11차시. **키 번호 = n**(엔진이 n으로 키를 만든다) · 묶음이 먹은 l03·l09는 없다. */
const KEYS = ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l05', 'u4_l06',
              'u4_l07', 'u4_l08', 'u4_l10', 'u4_l11'];
const NS = { u4_l01: 1, u4_l02: 2, u4_l04: 4, u4_l05: 5, u4_l06: 6,
             u4_l07: 7, u4_l08: 8, u4_l10: 10, u4_l11: 11 };
const PAIRED = ['u4_l02', 'u4_l08'];
const SINGLE = KEYS.filter(k => !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });
const SKIPPED = ['u4_l03', 'u4_l09'];

/* 학생 본차시 원문 = 인용 대조의 단일 정답.
   ⚠️ 키 번호와 파일 번호가 어긋난다 — 파일은 제 차례(l01~l07·l09·l10) 그대로다. */
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
/* ⚠️ 근거 대조는 공백을 지운 SQ 갈래로만 (u3의 교훈 — 태그가 낱말을 가른다) */
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

/* ⚠️ 홈 → 차시 진입을 **엔진이 실제로 여는 차시**로 확인한다.
   렌더 길이만 재면 openShow가 실패해도 앞 차시 화면이 남아 조용히 초록이 난다(실측). */
function openAs(w, key) {
  w.Teacher.backToHome();
  w.Teacher.openShow('4', String(NS[key]));
  ok(w.document.getElementById('show-view').classList.contains('active'),
     key + ' — 카드 n=' + NS[key] + '이 열리지 않는다(홈 유지). 키 번호와 n이 어긋났다');
  const meta = w.document.querySelector('#aside header .meta');
  const want = L[key].meta.title;
  ok(meta && meta.textContent.trim() === want,
     key + ' — 카드 n=' + NS[key] + '이 「' + (meta ? meta.textContent.trim() : '?') + '」를 열었다 (기대 「' + want + '」)');
}
function renderAll(w, key, steps) {
  openAs(w, key);
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

/* 🚨🚨 키 집합 선점검 — **라이브 버그(항목 순번 키)를 잡는 그물은 여기여야 한다.**
   ⚠️ A 섹션까지 미루면 안 된다: 바로 아래 STUDENT·TNOTE가 L[k]를 곧바로 읽으므로
      키가 하나라도 어긋나면 **단언이 아니라 TypeError로 죽어** 「N 통과 / M 실패」 줄
      자체가 안 나온다(역검증 ⑦ 실측 — `LESSONS["u4_l11"]`을 `["u4_l10x"]`로 주입하면
      게이트가 173줄에서 그냥 터졌다). 실패는 반드시 빨간 줄로 보이게 만든다.
   ⚠️ 복제할 사람은 이 블록을 **`const L` 바로 뒤**에 그대로 옮길 것. */
console.log('═══ @. 키 집합 선점검 (파생 상수보다 먼저) ═══');
T('🚨🚨 uN 키 집합이 KEYS와 정확히 같다 — 항목 순번으로 붙이면 여기서 잡힌다', () => {
  const got = Object.keys(L).filter(k => /^u4_/.test(k)).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS),
     '키 집합 어긋남 — 빠진 키 [' + KEYS.filter(k => !got.includes(k)).join(',') +
     '] · 군더더기 키 [' + got.filter(k => !KEYS.includes(k)).join(',') + ']');
  KEYS.forEach(k => ok(L[k] && Array.isArray(L[k].slides) && L[k].slides.length,
    k + ' 항목이 비었다 — 키는 있는데 slides가 없다'));
});
if (fail) {
  console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패 (키 집합이 어긋나 이후 검사를 돌릴 수 없다)');
  process.exit(1);
}

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
/* 근거 대조 — 공백 무시 */
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
T('🚨 키 번호 = 그 항목이 여는 차시 번호(n) — 엔진 lessonKey가 n으로 키를 만든다', () => {
  KEYS.forEach(k => ok(k === 'u4_l' + String(L[k].meta.n).padStart(2, '0'),
    k + '의 키 번호가 n(' + L[k].meta.n + ')과 어긋난다 — 홈 카드가 엉뚱한 차시를 연다'));
  const ns = KEYS.map(k => L[k].meta.n);
  ok(JSON.stringify(ns) === JSON.stringify([1, 2, 4, 5, 6, 7, 8, 10, 11]), 'n 목록 ' + ns.join(','));
});
T('⚠️ 건너뛰는 키는 l03·l09 둘 (묶음 l02·l08이 먹은 뒤 차시)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u4_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(SKIPPED.length === 2, '건너뛴 키 개수 ' + SKIPPED.length + ' (묶음이 둘이다)');
  /* u3의 SKIPPED는 l08 하나였다 — 그 자리를 복제하지 않았는지 역으로 못 박는다 */
  ok(!!L['u4_l08'], 'u3의 SKIPPED(l08)를 그대로 복제했다 — u4에서 l08은 놀이터 항목이다');
});
T('⚠️ SFILE 매핑 — 키 번호와 본차시 파일 번호가 어긋난다 (이름 규칙으로 짐작 금지)', () => {
  ok(SFILE['u4_l04'].includes('_l03_'), 'l04의 근거 파일이 l03이 아니다');
  ok(SFILE['u4_l08'].includes('_l07_'), 'l08의 근거 파일이 l07이 아니다');
  ok(SFILE['u4_l11'].includes('_l10_'), 'l11의 근거 파일이 l10이 아니다');
  const mismatch = KEYS.filter(k => !SFILE[k].includes('_' + k.slice(3) + '_'));
  ok(mismatch.length === 7, '어긋나는 자리 ' + mismatch.length + '개 (l01·l02만 맞는다)');
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

console.log('═══ B. 홈 카드 진입 · 7요소 실렌더 ═══');
T('🚨 홈 카드 아홉이 저마다 제 차시를 연다 (엉뚱한 차시·안 열림 0 — 라이브 버그를 잡은 자리)', () => {
  KEYS.forEach(k => openAs(W, k));
});
KEYS.forEach(k => {
  T(k + ' 7요소 실렌더', () => {
    const html = renderAll(W, k, L[k].slides.length + 2);
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
T('⚠️ review가 전 항목에 있다 (u3 계승) · 단일 concept 셋 · 묶음 둘은 concept 다섯', () => {
  KEYS.forEach(k => ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
  SINGLE.forEach(k => {
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 3, k + ' concept ' + c + ' (단일은 셋)');
  });
  PAIRED.forEach(k => {
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 5, k + ' concept ' + c + ' (묶음은 다섯)');
  });
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
    ok(renderAll(w2, k, 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (sq 갈래) ═══');
T('① l01 한살이 도입 원문 일치', () => {
  ['우리 주변의 동물과 식물을 찾아봐요.',
   '생물이 자라면서 모습이 변하는 것을 알아봐요.',
   '동물과 식물은 자라면서 모습이 조금씩 달라져요.',
   '생물이 나고 자라 다시 자손을 남기는 과정을 한살이라고 해요.'].forEach(s => both('u4_l01', s));
});
T('② l02 배추흰나비 한살이 원문 일치 (2·3차시 묶음)', () => {
  ['배추흰나비의 한살이 순서를 알아봐요.',
   '알·애벌레·번데기·어른벌레의 특징을 살펴봐요.',
   '알 → 애벌레 → 번데기 → 어른벌레',
   '몸이 머리·가슴·배로 구분되고 다리가 세 쌍인 동물을 곤충이라고 해요.'].forEach(s => both('u4_l02', s));
});
T('③ l04 다양한 동물의 한살이 원문 일치', () => {
  ['알을 낳는 동물(닭)의 한살이를 알아봐요.',
   '새끼를 낳는 동물(개)의 한살이를 알아봐요.',
   '동물마다 한살이가 다양함을 살펴봐요.',
   '개·소·돌고래·박쥐처럼 새끼를 낳는 동물은 어미젖을 먹여 키워요.'].forEach(s => both('u4_l04', s));
});
T('④ l05 씨가 싹 트는 조건 원문 일치', () => {
  ['씨가 싹 트는 데 필요한 조건을 알아봐요.',
   '실험에서 다르게 할 조건과 같게 할 조건을 정해요.',
   '물 준 컵과 안 준 컵을 비교해 봐요.',
   '다르게 할 조건과 같게 할 조건으로 나눠 봐요'].forEach(s => both('u4_l05', s));
});
T('⑤ l06 식물이 자라는 조건 원문 일치', () => {
  ['식물이 자라는 데 필요한 조건을 알아봐요.',
   '다르게 할 조건과 같게 할 조건을 정해요.',
   '햇빛을 받은 식물과 못 받은 식물',
   '식물이 자라려면 물과 햇빛이 필요해요.'].forEach(s => both('u4_l06', s));
});
T('⑥ l07 여러 가지 식물의 한살이 원문 일치', () => {
  ['여러 식물의 한살이를 비교해요.',
   '한해살이와 여러해살이로 나눠요.',
   '모든 식물은 씨에서 시작해 다시 씨를 남겨요.',
   '씨 → 싹 → 자람 → 꽃 → 열매'].forEach(s => both('u4_l07', s));
});
T('⑦ l08 놀이터 원문 일치 (8·9차시 묶음)', () => {
  ['생물에 알맞은 한살이 순서를 골라요.',
   '친구에게 보여줄 소개 자료를 완성해요.',
   '한살이 순서가 바르게 담겨 있고',
   '그림을 예쁘게 꾸미는 것보다'].forEach(s => both('u4_l08', s));
  ok(SQ['u4_l08'].includes('소개자료'), '본차시 근거 없음: 소개 자료');
});
T('⑧ l10 잠자리 애벌레 원문 일치', () => {
  ['여러 곤충의 한살이를 살펴봐요.',
   '번데기 단계가 있는 곤충과 없는 곤충으로 나눠요.',
   '잠자리 애벌레의 특별한 점을 알아봐요.',
   '잠자리는 번데기 단계가 없어요'].forEach(s => both('u4_l10', s));
});
T('⑨ l11 단원 마무리 원문 일치', () => {
  ['4단원에서 배운 개념을 모아요.',
   '씨 싹트기·식물 자라기·여러 한살이를 복습해요.',
   '문제를 풀며 스스로 확인해요.',
   '식물은 씨로 한살이를 시작해요.'].forEach(s => both('u4_l11', s));
});
T('⑩ 단원 낱말 5종 (sq 갈래 대조 — 칸에 갈라 담긴다)', () => {
  ['한살이', '번데기', '어른벌레', '한해살이', '여러해살이'].forEach(w => {
    ok(SQALL.includes(sq(w)), '본차시 근거 없음: ' + w);
    ok(NOSTAR.includes(w), '본문 누락: ' + w);
  });
});

console.log('═══ D-2. 알·새끼 검산기 (두 갈래를 함께 · BODY) ═══');
const BIRTH = {
  '알을 낳아요': ['닭', '개구리', '뱀', '새', '거북', '물고기'],
  '새끼를 낳아요': ['개', '소', '돌고래', '박쥐', '고양이', '사람']
};
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  const a = BIRTH['알을 낳아요'], b = BIRTH['새끼를 낳아요'];
  const dup = a.filter(x => b.includes(x));
  ok(dup.length === 0, '두 갈래에 겹친 동물: ' + dup.join(','));
  ok(a.length >= 4 && b.length >= 4, '한쪽 갈래가 얇다');
});
/* ⚠️ 한 글자 동물이 다섯이다(닭·뱀·새·개·소) → {1,6}으로 연다 */
const BR = [...NOSTAR.matchAll(/([가-힣]{1,6}) — (알을 낳아요|새끼를 낳아요)/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 알·새끼 선언이 여덟 이상 · 두 갈래 각 넷 이상', () => {
  ok(BR.length >= 8, '선언 ' + BR.length + '건 — 검산 대상이 죽었다');
  ok(BR.filter(x => x[1] === '알을 낳아요').length >= 4, '알 선언이 얇다');
  ok(BR.filter(x => x[1] === '새끼를 낳아요').length >= 4, '새끼 선언이 얇다');
});
T('⚠️ 알·새끼 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = BR.filter(([a, g]) => !BIRTH[g].includes(a)).map(([a, g]) => a + ' — ' + g);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ — (알을|새끼를) 낳아요/g) || []).length;
  ok(mk === BR.length, '선언 표지 ' + mk + '건인데 검산은 ' + BR.length + '건 — 진리표 밖 이름이 샜다');
});
T('🚨 한 글자 동물 다섯(닭·뱀·새·개·소)이 실제로 걸린다 (정규식 폭 역확인 — u3의 「가장 긴 이름」을 복제하면 대상이 없다)', () => {
  ['닭', '뱀', '새', '개', '소'].forEach(a =>
    ok(BR.some(x => x[0] === a), a + '이(가) 안 걸렸다 — {2,6}으로 좁히면 조용히 빠진다'));
  ok(BR.filter(x => x[0].length === 1).length >= 5, '한 글자 선언 ' + BR.filter(x => x[0].length === 1).length + '건');
});
T('본차시 l04가 알·새끼를 실제로 가른다 (근거 확인)', () => {
  ['알을낳는동물', '새끼를낳는동물', '어미젖'].forEach(w =>
    ok(SQ['u4_l04'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 번데기 유무 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ tnote의 교사 안내가 `아이 — 번데기 있음` 꼴로 걸린다 — STUDENT에서만 긁는다 */
const PUPA = { '있음': ['배추흰나비', '무당벌레', '사슴벌레', '벌', '파리', '개미'],
               '없음': ['잠자리', '메뚜기', '매미', '사마귀', '노린재'] };
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  const dup = PUPA['있음'].filter(x => PUPA['없음'].includes(x));
  ok(dup.length === 0, '두 갈래에 겹친 곤충: ' + dup.join(','));
  ok(PUPA['있음'].length >= 3 && PUPA['없음'].length >= 3, '한쪽 갈래가 얇다');
});
const PP = [...STUDENT.matchAll(/([가-힣]{1,6}) — 번데기 (있음|없음)/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 번데기 선언이 여섯 이상 · 두 갈래 각 셋 이상', () => {
  ok(PP.length >= 6, '선언 ' + PP.length + '건 — 검산 대상이 죽었다');
  ok(PP.filter(x => x[1] === '있음').length >= 3, '있음 선언이 얇다');
  ok(PP.filter(x => x[1] === '없음').length >= 3, '없음 선언이 얇다');
});
T('⚠️ 번데기 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = PP.filter(([a, v]) => !PUPA[v].includes(a)).map(([a, v]) => a + ' — 번데기 ' + v);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (STUDENT.match(/ — 번데기 (있음|없음)/g) || []).length;
  ok(mk === PP.length, '선언 표지 ' + mk + '건인데 검산은 ' + PP.length + '건');
});
T('⚠️ tnote 교사 안내(아이 — 번데기 있음)는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/아이 — 번데기 있음/.test(TNOTE), 'tnote 오탐 자리가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  ok(!/아이 — 번데기 있음/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
  ok(!PP.some(x => /아이$/.test(x[0])), 'tnote 안내가 검산 대상에 새어 들었다');
});
T('본차시 l10이 번데기 유무를 실제로 가른다 (근거 확인)', () => {
  ['번데기단계가있는곤충', '잠자리는번데기단계가없어요'].forEach(w =>
    ok(SQ['u4_l10'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-4. 한해·여러해 검산기 (학생 노출 갈래에서만) ═══');
/* ⚠️ 민들레는 풀이지만 여러해살이다(l07 오개념 자리) — 「풀 = 한해살이」로 짜면 레드 */
const LIFE = { '한해살이': ['벼', '강낭콩', '나팔꽃', '옥수수', '봉숭아', '해바라기'],
               '여러해살이': ['감나무', '사과나무', '민들레', '소나무', '개나리', '무궁화'] };
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다 · 민들레는 여러해살이 쪽)', () => {
  const dup = LIFE['한해살이'].filter(x => LIFE['여러해살이'].includes(x));
  ok(dup.length === 0, '두 갈래에 겹친 식물: ' + dup.join(','));
  ok(LIFE['여러해살이'].includes('민들레'), '민들레를 한해살이로 넣었다 — l07 오개념 자리다');
});
/* ⚠️ 낱말 경계 필수 — 자기점검의 「지식·이해 — 한해살이와 여러해살이를…」이 걸린다 */
const LF = [...STUDENT.matchAll(/([가-힣]{1,6}) — (한해살이|여러해살이)(?![가-힣])/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 한해·여러해 선언이 여섯 이상 · 두 갈래 각 셋 이상', () => {
  ok(LF.length >= 6, '선언 ' + LF.length + '건 — 검산 대상이 죽었다');
  ok(LF.filter(x => x[1] === '한해살이').length >= 3, '한해살이 선언이 얇다');
  ok(LF.filter(x => x[1] === '여러해살이').length >= 3, '여러해살이 선언이 얇다');
});
T('⚠️ 한해·여러해 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = LF.filter(([a, v]) => !LIFE[v].includes(a)).map(([a, v]) => a + ' — ' + v);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (STUDENT.match(/ — (한해살이|여러해살이)(?![가-힣])/g) || []).length;
  ok(mk === LF.length, '선언 표지 ' + mk + '건인데 검산은 ' + LF.length + '건');
});
T('🚨 낱말 경계가 실제로 필요하다 (자기점검 「지식·이해 — 한해살이와」 역확인)', () => {
  ok(/지식·이해 — 한해살이와/.test(STUDENT), '자기점검 문구가 사라졌다 — 이 단언은 대상이 실존할 때만 뜻이 있다');
  const loose = [...STUDENT.matchAll(/([가-힣]{1,6}) — (한해살이|여러해살이)/g)].map(m => m[1]);
  ok(loose.includes('이해'), '경계 없는 갈래에서 「이해」가 안 걸린다 — 경계를 뺄 이유가 사라졌다');
  ok(!LF.some(x => x[0] === '이해'), '경계를 넣었는데도 「이해」가 걸린다');
});
T('⚠️ tnote 교사 안내(아이 — 여러해살이)는 검산 대상이 아니다 (오탐 방지 역확인)', () => {
  ok(/아이 — 여러해살이/.test(TNOTE), 'tnote 오탐 자리가 사라졌다');
  ok(!/아이 — 여러해살이/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
});
T('본차시 l07이 한해·여러해를 실제로 가른다 (근거 확인)', () => {
  ['한해살이와여러해살이로나눠요', '벼처럼한해만살고'].forEach(w =>
    ok(SQ['u4_l07'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-5. 조건 판정 검산기 (기준 셋 · 갈래 둘 · 대상 둘) ═══');
/* 진리표 — 본차시 l05·l06 실측. ⚠️ 씨는 빛이 없어도 싹튼다(단원의 결론 자체) */
const COND = {
  '씨 싹트기': { '물': '그렇다', '알맞은 온도': '그렇다', '햇빛': '아니다' },
  '식물 자라기': { '물': '그렇다', '햇빛': '그렇다' }
};
T('⚠️ 진리표 자체 검증 (대상 둘 · 기준 셋 · 갈래 둘이 모두 산다)', () => {
  ok(Object.keys(COND).length === 2, '대상 수 ' + Object.keys(COND).length);
  const cs = new Set([].concat(...Object.values(COND).map(o => Object.keys(o))));
  ok(cs.size === 3, '기준 수 ' + cs.size);
  const vs = new Set([].concat(...Object.values(COND).map(o => Object.values(o))));
  ok(vs.size === 2, '갈래가 하나뿐 — 판별력 0');
  ok(COND['씨 싹트기']['햇빛'] === '아니다' && COND['식물 자라기']['햇빛'] === '그렇다',
     '햇빛이 두 대상에서 갈리지 않는다 — 이 단원의 핵심 대비가 죽었다');
});
const CD = [...NOSTAR.matchAll(/(씨 싹트기|식물 자라기) — ([가-힣 ]{1,7}) → (그렇다|아니다)/g)]
  .map(m => [m[1], m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 조건 판정 선언이 다섯 이상 · 대상 둘이 다 있다', () => {
  ok(CD.length >= 5, '선언 ' + CD.length + '건 — 검산 대상이 죽었다');
  ok(new Set(CD.map(x => x[0])).size === 2, '대상이 하나뿐 — 대비가 죽었다');
  ok(new Set(CD.map(x => x[2])).size === 2, '갈래가 하나뿐 — 판별력 0');
});
T('⚠️ 조건 판정 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = CD.filter(([s, c, v]) => COND[s][c] !== v).map(([s, c, v]) => s + ' — ' + c + ' → ' + v);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ → (그렇다|아니다)/g) || []).length;
  ok(mk === CD.length, '선언 표지 ' + mk + '건인데 검산은 ' + CD.length + '건 — 진리표 밖 대상이 샜다');
});
T('🚨 「씨 싹트기 — 햇빛 → 아니다」가 실제로 선언돼 있다 (단원의 결론 자리)', () => {
  ok(CD.some(x => x[0] === '씨 싹트기' && x[1] === '햇빛' && x[2] === '아니다'),
     '싹틀 때 햇빛이 필요 없다는 선언이 없다');
  ok(CD.some(x => x[0] === '식물 자라기' && x[1] === '햇빛' && x[2] === '그렇다'),
     '자랄 때 햇빛이 필요하다는 선언이 없다');
});
T('본차시 l05·l06이 조건을 실제로 가른다 (근거 확인)', () => {
  ok(SQ['u4_l05'].includes('물과적당한온도'), 'l05 근거 없음');
  ok(SQ['u4_l06'].includes('물과햇빛이필요해요'), 'l06 근거 없음');
});

console.log('═══ D-6. 실험 조건 검산기 (표가 아니라 규칙) ═══');
/* ⚠️ 이 검산기는 이름표를 대조하지 않는다 — 「실험마다 다르게 할 조건이 정확히 하나,
   같게 할 조건이 둘 이상」이라는 **변인 통제 규칙 자체**를 잰다. 실험이 늘어도 산다. */
const EX = [...NOSTAR.matchAll(/([가-힣]{1,4} 실험) — ([가-힣 ]{1,7}) → (다르게|같게) 할 조건/g)]
  .map(m => [m[1], m[2], m[3]]);
T('⚠️ 검산 대상 실존 — 실험 조건 선언이 여섯 이상 · 실험 둘 이상', () => {
  ok(EX.length >= 6, '선언 ' + EX.length + '건 — 검산 대상이 죽었다');
  ok(new Set(EX.map(x => x[0])).size >= 2, '실험이 하나뿐 — 대비가 죽었다');
  const mk = (NOSTAR.match(/ → (다르게|같게) 할 조건/g) || []).length;
  ok(mk === EX.length, '선언 표지 ' + mk + '건인데 검산은 ' + EX.length + '건');
});
T('⚠️ 변인 통제 규칙 전수 검산 (실험마다 「다르게」 정확히 하나 · 「같게」 둘 이상)', () => {
  const by = {};
  EX.forEach(([e, c, v]) => { (by[e] = by[e] || []).push([c, v]); });
  Object.keys(by).forEach(e => {
    const d = by[e].filter(x => x[1] === '다르게');
    const s = by[e].filter(x => x[1] === '같게');
    ok(d.length === 1, e + ' 다르게 할 조건 ' + d.length + '건 (정확히 하나여야 한다)');
    ok(s.length >= 2, e + ' 같게 할 조건 ' + s.length + '건 (둘 이상이어야 한다)');
    const names = by[e].map(x => x[0]);
    ok(new Set(names).size === names.length, e + ' 같은 조건이 두 번 선언됐다');
  });
});
T('🚨 다르게 할 조건이 실험 이름과 맞는다 (물 실험 → 물 · 햇빛 실험 → 햇빛)', () => {
  const diff = {};
  EX.filter(x => x[2] === '다르게').forEach(([e, c]) => { diff[e] = c; });
  Object.keys(diff).forEach(e =>
    ok(e.startsWith(diff[e]), e + '의 다르게 할 조건이 ' + diff[e] + ' — 실험 이름과 어긋난다'));
  ok(Object.keys(diff).length >= 2, '다르게 할 조건이 잡힌 실험 ' + Object.keys(diff).length + '개');
});
T('본차시가 변인 통제를 실제로 가르친다 (근거 확인)', () => {
  ['다르게할조건과같게할조건'].forEach(w => {
    ok(SQ['u4_l05'].includes(w), 'l05 본차시 근거 없음: ' + w);
    ok(SQ['u4_l06'].includes(w), 'l06 본차시 근거 없음: ' + w);
  });
});

console.log('═══ D-7. 다음 단계 검산기 (왼쪽에 생물 이름을 함께) ═══');
/* ⚠️ 배추흰나비의 알과 닭의 알이 부딪친다 → 「생물 · 단계 — 다음은 X」 꼴로만 잰다 */
const SEQ = {
  '배추흰나비': ['알', '애벌레', '번데기', '어른벌레'],
  '닭': ['알', '병아리', '어린 닭', '다 자란 닭'],
  '강낭콩': ['씨', '싹', '자람', '꽃', '열매']
};
T('⚠️ 진리표 자체 검증 (사슬 셋 · 각 사슬 안에서 단계가 겹치지 않는다)', () => {
  ok(Object.keys(SEQ).length === 3, '사슬 수 ' + Object.keys(SEQ).length);
  Object.keys(SEQ).forEach(a => {
    ok(new Set(SEQ[a]).size === SEQ[a].length, a + ' 사슬에 겹친 단계');
    ok(SEQ[a].length >= 4, a + ' 사슬 길이 ' + SEQ[a].length);
  });
  /* 배추흰나비와 닭이 「알」을 함께 쓴다 — 왼쪽에 이름이 필요한 이유 */
  ok(SEQ['배추흰나비'][0] === '알' && SEQ['닭'][0] === '알',
     '두 사슬이 「알」을 함께 쓰지 않는다 — 이름 동반이 필요 없어졌다');
});
const SQn = [...NOSTAR.matchAll(/([가-힣]{1,7}) · ([가-힣 ]{1,7}) — 다음은 ([가-힣 ]{1,8})/g)]
  .map(m => [m[1], m[2].trim(), m[3].trim()]);
T('⚠️ 검산 대상 실존 — 다음 단계 선언이 아홉 이상 · 사슬 셋이 모두 실존', () => {
  ok(SQn.length >= 9, '선언 ' + SQn.length + '건 — 검산 대상이 죽었다');
  Object.keys(SEQ).forEach(a => ok(SQn.some(x => x[0] === a), a + ' 사슬 선언이 없다'));
  const mk = (NOSTAR.match(/ — 다음은 /g) || []).length;
  ok(mk === SQn.length, '선언 표지 ' + mk + '건인데 검산은 ' + SQn.length + '건 — 이름 없는 선언이 샜다');
});
T('⚠️ 다음 단계 선언 전수 검산 (사슬 대조 · 어긋남 0)', () => {
  const bad = SQn.filter(([a, cur, nxt]) => {
    const c = SEQ[a];
    if (!c) return true;
    const i = c.indexOf(cur);
    return i < 0 || i + 1 >= c.length || c[i + 1] !== nxt;
  }).map(([a, cur, nxt]) => a + ' · ' + cur + ' — 다음은 ' + nxt);
  ok(bad.length === 0, bad.join(' / '));
});
T('🚨 「알」이 두 사슬에서 다르게 이어진다 (이름 동반의 실효 역확인)', () => {
  const b = SQn.find(x => x[0] === '배추흰나비' && x[1] === '알');
  const d = SQn.find(x => x[0] === '닭' && x[1] === '알');
  ok(b && d, '두 사슬의 「알」 선언이 다 있지 않다');
  ok(b[2] !== d[2], '두 사슬의 「알」 다음이 같다 — 이름을 뗄 수 있게 됐다');
});
T('본차시가 세 사슬을 실제로 준다 (근거 확인)', () => {
  ok(SQ['u4_l02'].includes(sq('알 → 애벌레 → 번데기 → 어른벌레')), 'l02 근거 없음');
  ok(SQ['u4_l04'].includes('병아리'), 'l04 근거 없음');
  ok(SQ['u4_l07'].includes(sq('씨 → 싹 → 자람 → 꽃 → 열매')), 'l07 근거 없음');
});

console.log('═══ E. 안전 · 용어 가드 (과학 최우선 = 생명 존중) ═══');
T('⚠️ 생명 존중 3문구 + l05·l06 손 씻기 (u3의 「함부로 건드리지」·「가만히 관찰」과 자리가 다르다)', () => {
  ok(/꾸준히 관찰/.test(studentText('u4_l01')), 'l01 꾸준히 관찰 문구 없음');
  ok(/함부로 만지지/.test(studentText('u4_l02')), 'l02 함부로 만지지 문구 없음');
  ok(/소중히 여/.test(studentText('u4_l10')), 'l10 소중히 여기기 문구 없음');
  ['u4_l05', 'u4_l06'].forEach(k => ok(/손을 씻/.test(studentText(k)), k + ' 실험 뒤 손 씻기 문구 없음'));
  /* 본차시 근거 — 「함부로 만져요」가 l01 오개념 자리에 실존한다 */
  ok(SQ['u4_l01'].includes('꾸준히'), 'l01 본차시 근거 없음: 꾸준히 관찰');
  ok(SQALL.includes('함부로만'), '본차시 근거 없음: 함부로 만지기');
  ['생물을 죽여', '함부로 잡아', '눌러 죽'].forEach(w =>
    ok(!STUDENT.includes(w), '생명 훼손 문구가 학생 갈래에 남았다: ' + w));
});
T('⚠️ 상표 가드 — 놀이터·마무리 차시에 회사·제품 이름 0건', () => {
  const BRAND = ['디즈니', '픽사', '레고', '닌텐도', '포켓몬', '지브리', '내셔널지오그래픽',
                 '바이엘', '몬산토', '신젠타', '삼성', '엘지', '농심', '오뚜기', '풀무원',
                 '동원', '유한양행', '3M', '테슬라', '유튜브'];
  const s = studentText('u4_l08') + studentText('u4_l11');
  const hit = BRAND.filter(w => s.includes(w));
  ok(hit.length === 0, hit.join(','));
  ok(BRAND.length === 20, '상표 목록 ' + BRAND.length + '종');
});
T('미도입 갈래(4학년 이상·중등 소관) 학생 노출 0', () => {
  const BAN = ['변태', '탈피', '발아', '수분', '수정', '배아', '떡잎', '광합성', '생식',
               '포유류', '조류', '유충', '번식', '세대', '서식지', '생체모방', '적응', '진화'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  ok(BAN.length === 18, '미도입 목록 ' + BAN.length + '종');
  /* ⚠️ 「한살이」·「곤충」 단독은 걸지 않는다 — 이 단원이 정식으로 가르치는 낱말이다 */
  ok(STUDENT.includes('한살이'), '한살이가 사라졌다 — 단독 가드를 걸었는지 확인');
  ok(studentText('u4_l02').includes('곤충'), 'l02의 곤충이 사라졌다 — 인용 대조와 어긋난다');
});
T('⚠️ 교사 몫 용어 넷은 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['완전 변태', '불완전 변태', '난생', '태생'].forEach(w => {
    ok(!STUDENT.includes(w), '학생 노출: ' + w);
    ok(TNOTE.includes(w), 'tnote에 없음 — 대상 0건에서 사이좋게 초록이 난다: ' + w);
  });
  ['조작 변인', '통제 변인', '가설 검증', '변인 통제', '정량 관찰'].forEach(w =>
    ok(!STUDENT.includes(w), '학생 노출: ' + w));
});
T('🚨 concept의 note는 학생 노출 갈래다 — 난생·태생 0건 (3/4에서 tnote로 옮긴 자리)', () => {
  KEYS.forEach(k => {
    const c = plain(L[k].slides.filter(s => s.block === 'concept')
      .map(s => { const x = Object.assign({}, s); delete x.tnote; return x; }));
    ok(!/난생|태생/.test(c), k + ' concept(note 포함)에 난생·태생');
    ok(/"note":/.test(c), k + ' concept에 note가 없다 — 단언 대상이 죽었다');
  });
  /* tnote 쪽에는 실제로 남아 있다 — 옮긴 것이지 지운 것이 아니다 */
  ok(/난생/.test(TNOTE) && /태생/.test(TNOTE), 'tnote에서 난생·태생이 사라졌다');
});
T('⚠️ 「서식지」·「생체모방」은 u4 본차시 학생 화면에 없다 (u3와 같이 전 항목 미도입 · 역단언)', () => {
  KEYS.forEach(k => {
    ok(!SQ[k].includes('서식지'), '본차시 ' + k + '가 서식지를 쓴다 — 단언 재검토');
    ok(!SQ[k].includes('생체모방'), '본차시 ' + k + '가 생체모방을 쓴다 — 단언 재검토');
  });
  ok(plain(L['u3_l10'].slides).length > 100, 'u3 동반 로드가 흔들렸다');
});
T('⚠️ 선행 용어 9갈래 — slides − next_lesson − review (🚨 l01 review가 u3 exit를 데려온다)', () => {
  /* ⚠️ 가드 대상은 slides만 — extras는 뺀다. 예외는 next_lesson + review 두 블록.
     ⚠️ 「잠자리」로는 걸 수 없다(l02·l04가 먼저 쓴다) → l10은 「무당벌레」로.
     ⚠️ 「빛」으로도 걸 수 없다(l05가 「빛이 없으면」으로 쓴다) → l06은 「햇빛」만. */
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
  ok(studentText('u4_l04').includes('새끼'), 'l04에 새끼 도입 없음');
  ok(studentText('u4_l05').includes('다르게 할 조건'), 'l05에 다르게 할 조건 도입 없음');
  ok(studentText('u4_l06').includes('햇빛'), 'l06에 햇빛 도입 없음');
  ok(studentText('u4_l07').includes('한해살이') && studentText('u4_l07').includes('여러해살이'), 'l07에 한해·여러해 도입 없음');
  ok(studentText('u4_l08').includes('소개 자료'), 'l08에 소개 자료 도입 없음');
  ok(studentText('u4_l10').includes('무당벌레'), 'l10에 무당벌레 도입 없음');
});
T('🚨 역단언 ① — l01 review에 「분류」·「본떠」가 실제로 있다 (가드를 review까지 넓히면 죽는다)', () => {
  const rv = plain(L['u4_l01'].slides.filter(s => s.block === 'review'));
  ok(rv.includes('분류') && rv.includes('본떠'), 'l01 review가 u3의 분류·본떠를 데려오지 않는다 — 동반 로드 재검토');
  ok(plain(studentSlides('u4_l01', false, true)).includes('분류'), 'review 포함 갈래에서 분류가 안 걸린다 — 좁힐 이유가 사라졌다');
});
T('🚨 역단언 ② — 「잠자리」는 선행 가드로 걸 수 없다 (본차시 l02·l04가 먼저 쓴다)', () => {
  ['u4_l02', 'u4_l04'].forEach(k => ok(SQ[k].includes('잠자리'), '본차시 ' + k + '가 잠자리를 쓰지 않는다 — 가드 재검토'));
  ['u4_l02', 'u4_l04'].forEach(k =>
    ok(plain(studentSlides(k, false, false)).includes('잠자리'), '케이티처 ' + k + '가 잠자리를 잃었다'));
});
T('🚨 역단언 ③ — 「빛」과 「햇빛」은 다른 낱말이다 (l05 본문에 빛 실존 · 햇빛 0 · next에 햇빛 실존)', () => {
  const b5 = plain(studentSlides('u4_l05', false, false));
  ok(b5.includes('빛'), 'l05 본문에 「빛」이 없다 — 싹틀 때 빛이 필요 없다는 결론이 사라졌다');
  ok(!b5.includes('햇빛'), 'l05 본문에 「햇빛」이 있다 — l06 선행 가드가 죽는다');
  const nx = plain(L['u4_l05'].slides.filter(s => s.block === 'next_lesson'));
  ok(nx.includes('햇빛'), 'l05 next_lesson이 햇빛을 예고하지 않는다');
  ok(SQ['u4_l05'].includes('빛'), '본차시 l05가 빛을 쓰지 않는다 — 가드 재검토');
});
T('🚨 역단언 ④ — l01 next_lesson에 「번데기」가 실제로 있다 (선행 가드가 next를 빼는 이유)', () => {
  const nx = plain(L['u4_l01'].slides.filter(s => s.block === 'next_lesson'));
  ok(nx.includes('번데기'), 'l01 next_lesson이 번데기를 예고하지 않는다 — next를 뺄 이유가 사라졌다');
  ok(!plain(studentSlides('u4_l01', false, false)).includes('번데기'), 'l01 본문에 번데기 선행');
});
T('⚠️ next_lesson 예고 역검사 (l01→배추흰나비 · l04→씨 · l06→여러 식물 · l08→잠자리 · l11→다음 단원)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(/배추흰나비/.test(nx('u4_l01')), 'l01 next_lesson이 배추흰나비를 예고하지 않음');
  ok(/씨/.test(nx('u4_l04')), 'l04 next_lesson이 씨 싹트기를 예고하지 않음');
  ok(/식물/.test(nx('u4_l06')), 'l06 next_lesson이 여러 식물을 예고하지 않음');
  ok(/잠자리|곤충/.test(nx('u4_l08')), 'l08 next_lesson이 잠자리를 예고하지 않음');
  ok(/다음 단원/.test(nx('u4_l11')), 'l11이 다음 단원을 예고하지 않음');
});
T('⚠️ 성취기준 항목별 선언 — 다섯 갈래 · l08만 [4과12-03] (u3의 4과03 접두로 짜면 통째로 샌다)', () => {
  const STD = { u4_l01: '단원 전체 통합', u4_l02: '[4과04-01]', u4_l04: '[4과04-01]',
                u4_l05: '[4과04-02]', u4_l06: '[4과04-02]', u4_l07: '[4과04-03]',
                u4_l08: '[4과12-03]', u4_l10: '단원 전체 통합', u4_l11: '단원 전체 통합' };
  KEYS.forEach(k => ok(L[k].meta.std === STD[k], k + ' std ' + L[k].meta.std));
  ok(new Set(Object.values(STD)).size === 5, '성취기준 갈래 수가 어긋남');
  ok(KEYS.filter(k => L[k].meta.std === '[4과12-03]').length === 1, '4과12-03이 l08 하나가 아니다');
  ok(!KEYS.some(k => /4과03|4과02|4과01/.test(L[k].meta.std)), '앞 단원 성취기준 잔재');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 (36슬 항목 0)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음이 생겼다');
});
T('⚠️ 슬라이드 총합 181슬 (19×7 + 24×2) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 181, '총합 ' + tot);
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
T('⚠️ 2차시 묶음 = l02·l08 **둘** · 80분 · covers 가운뎃점 · period_split s12 (u1~u3는 하나였다)', () => {
  ok(PAIRED.length === 2, '2차시 묶음 개수 ' + PAIRED.length);
  const got = KEYS.filter(k => L[k].meta.period_split);
  ok(JSON.stringify(got) === JSON.stringify(PAIRED), '묶음 자리 ' + got.join(','));
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
  /* 묶음이 먹은 차시가 covers에 적혀 있다 — 건너뛴 키와 짝이 맞는다 */
  ok(L['u4_l02'].meta.covers === '2·3차시', 'l02 covers ' + L['u4_l02'].meta.covers);
  ok(L['u4_l08'].meta.covers === '8·9차시', 'l08 covers ' + L['u4_l08'].meta.covers);
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
T('⚠️ 수업시간 합 = 11차시 × 40분 = 440분 — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 440, '합 ' + tot);
  ok(tot === 40 * SINGLE.length + 80 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('⚠️ 교시 경계 슬라이드 tnote가 교시 끝을 적는다 (둘 다 — 3/4에서 l08이 잃었던 자리)', () => {
  PAIRED.forEach(k => {
    const s = L[k].slides.find(x => x.id === L[k].meta.period_split);
    ok(s, k + ' 경계 슬라이드 없음');
    ok(s.block === 'self_assessment', k + ' 경계 블록 ' + s.block);
    ok(s.tnote && /1교시/.test(s.tnote.watch), k + ' 교시 경계 미기재');
    ok(s.tnote.watch.startsWith('⏸ 여기까지 1교시(40분)'), k + ' 경계 표지가 u1~u3 규약과 다르다: ' + s.tnote.watch.slice(0, 24));
  });
});
T('⚠️ 2교시 시작은 s13 (제목이 이어짐을 밝힌다 — 둘 다) · 3교시 표시 0', () => {
  PAIRED.forEach(k => {
    const s13 = L[k].slides.find(x => x.id === 's13');
    ok(s13 && /2교시/.test(s13.data.title || ''), k + ' 2교시 표시 없음');
  });
  const cnt = KEYS.filter(k => L[k].slides.some(x => /2교시/.test((x.data && x.data.title) || ''))).length;
  ok(cnt === 2, '2교시 표시가 있는 항목 ' + cnt + '개 (묶음이 둘이다)');
  KEYS.forEach(k =>
    ok(!L[k].slides.some(x => /3교시/.test((x.data && x.data.title) || '')),
       k + '에 3교시 표시 — u4에는 3차시 묶음이 없다'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 · 9연쇄 · l01만 단원을 넘는다 · l10은 l08을 받는다', () => {
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
  /* 묶음 l08을 넘어 l10이 받는다(l09 키가 없다) */
  ok(L['u4_l10'].slides.find(s => s.block === 'review').data.from === 'u4_l08', 'l10이 l08 exit를 받지 않는다');
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
T('CURRICULUM ↔ LESSONS 정합 (u4 블록 9항목 · ready 9 · n 목록에 3·9 없음)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u5가 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*4,[\s\S]*?(?=unit:\s*5,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 4 블록 없음');
  ok(/lesson_count:\s*9/.test(blk), 'lesson_count 9 아님 (항목 수 9이지 차시 수 11이 아니다)');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok(!ns.includes(3), 'n 목록에 3이 있다 — l02가 먹은 차시다');
  ok(!ns.includes(9), 'n 목록에 9가 있다 — l08이 먹은 차시다');
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
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u1·u2·u3·u4 넷) · u5 미리 생김 0', () => {
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
T('⚠️ 허브 "3_science" 등재 (units 4 · lessons 37) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_science":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_science 미등재');
  ok(+m[1] === 4, 'units ' + m[1]);
  ok(+m[2] === 37, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이지 차시 수가 아니다. u1 9 + u2 10 + u3 9 + u4 9 = 37. */
  ok(+m[2] === 9 + 10 + 9 + KEYS.length, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] !== 40, 'lessons에 차시 수 합 40을 넣었다 — 항목 수 37이어야 한다');
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
T('⚠️ 박- 계열 0 (놀이터·발표 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
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
