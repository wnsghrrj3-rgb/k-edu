/* gate_g3_social_u1.js — 케이티처 g3 사회 u1 「우리가 사는 곳」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_science_u4.js 복제. **케이티처 네 번째 과목(사회)의 첫 단원**이라
      과학에서 온 갈래 중 과목·단원을 타는 것을 전부 갈아 끼웠다. 복제할 사람은 먼저 읽을 것.

   (🚨 갈림 ① — 이 단원 최대 결론) **묶음이 하나도 없다. 13항목 = 13차시.**
       본차시 13파일이 저마다 `const META`에 차시 번호를 직접 선언하고, 각 소단원 안에서
       번호가 끊김 없이 이어지며 범위 꼴(「5·6차시」)이 하나도 없다(전수 실측).
       → **키 = n = 1..13 · 건너뛰는 키 0 · PAIRED 0 · period_split 0.**
       이 게이트는 그 없음을 **거꾸로 못 박는다** — 36슬 0 · 물결 covers 0 · 120분 0 ·
       80분 0 · 2교시 표시 0 · 3교시 표시 0. 과학 u4의 PAIRED 갈래를 복제하면 통째로 죽는다.
       🚨 그래도 「키 번호 = 차시 번호(n)」 규약은 그대로다(엔진 `lessonKey`).
          이 단원은 둘이 우연히 같아서 안 보일 뿐이다 — 다음 단원에서 전제로 삼지 말 것.
   (🚨 갈림 ②) **사회 첫 단원이라 앞 단원이 없다.**
       `u1_l01`에는 **review가 없다** — 대신 concept를 넷 둔다(과학 u1_l01과 같은 갈래).
       → 과학 u4 게이트의 **`DATA2`/`DATA3` 동반 로드 줄을 복제하면 죽는다**.
       부팅 뒤 `Object.keys(LESSONS).length === 13`(다른 단원이 딸려 오지 않았음까지 단언).
       계보 = l01←l02←…←l13 **12연쇄**(단원을 넘는 자리 0).
   (🚨 갈림 ③) **마무리 자리가 둘이다.** l06 = 소단원 ① 마무리 · l13 = 단원 정리.
       요약 검산기를 「단원 끝 하나」로만 짜면 **l06이 빈다**.
   (갈림 ④) **성취기준 두 갈래 · 혼재 0**: `[4사01-01]` = l01~l09 · `[4사01-02]` = l10~l13.
       ⚠️ 접두(`4사01`) 검사로는 둘이 구분되지 않는다 — **갈래별 키 목록으로** 못 박는다.
   (🚨 신규 함정 ①) **`_sq()`를 과학에서 복제할 때 `<script>`를 지우면 본문이 통째로 사라진다.**
       사회 본차시는 본문을 `<script>` 안 템플릿 문자열로 쓴다. 과학 생성기는 script를
       지우는데, 그대로 옮기면 첫 덤프가 빈 결과로 나온다(5차 실측). **지우지 않는다.**
   (🚨 신규 함정 ②) **선행 가드로 쓸 수 있는 낱말이 열하나뿐이다.**
       분류·경험·느낌·존중·하는 일·병원은 **l01이 먼저 쓰고**, 표현은 l03이,
       공유 앱은 l04가, 확대는 l09가, 살기 좋은은 l10이, 방안은 l11이 먼저 쓴다.
       살아남은 가드 = 기준(l02) · 장소 카드(l03) · 마을 신문(l04) · 댓글(l05) ·
       그림일기(l06) · 소방서(l07) · 안전을 지키는 곳(l08) · 디지털 영상 지도(l09) ·
       축소(l10) · 조건(l11) · 어린이 보호구역(l12).
       E 섹션의 **역단언 열하나**가 그 근거를 본차시에서 직접 잰다 — 가드 목록의 안전장치다.
       ⚠️ **「조건」은 아주 흔한 낱말이다** — 활동 안내에 무심코 쓰면 l11 가드가 통째로 죽는다.
   (🚨 신규 함정 ③) **「도서관」·「시장」·「학교」·「놀이터」는 본차시 13파일 전부에 있다.**
       LEFT 검사를 장소 이름 목록으로 짜면 통째로 오탐이다 — 과학 u4의 교훈대로
       **선언 표지를 세고 검산된 수와 견주는 꼴**로 짠다.
   (🚨 신규 함정 ④) **오개념 문구의 「무조건」이 「조건」 가드에 걸린다.** 가드는 부분
       문자열로 재므로 **무조건·조건반사·조건부**가 통째로 죽는다(6차 실측 · 「언제나 크게만」
       으로 갈아 해소). **흔한 한 낱말을 가드로 쓸 때는 그 낱말을 품은 다른 낱말부터 grep할 것.**
   (검산기 여섯 — 전부 「대상 N건 실존」 + 「선언 표지 수 = 검산 수」 동반)
       D-2 장소 판정   `학교 — 장소예요` / `기쁨 — 장소가 아니에요` (두 갈래, BODY)
       D-3 분류 기준   `산 — 자연이 만든 장소` / `학교 — 사람이 만든 장소` (두 갈래, BODY)
       D-4 장소와 도움 `병원 — 건강을 도와요` (**STUDENT만** — tnote 오탐 `아이 — 건강을 도와요`)
       D-5 하는 일 무리 `소방서 — 안전을 지키는 곳` (세 갈래 × 각 둘, BODY)
       D-6 지도 기능   `크게 보기 — 확대 기능` (넷 · 꼬리 「… 기능」 고정, BODY)
       D-7 문제와 방안 `어두운 길 — 가로등을 세워요` (넷) + 조건 판정 `밝은 가로등 — 안전 조건`
       ⚠️ **두 진리표의 꼬리를 일부러 갈랐다** — 「…을 세워요/해요/만들어요/나눠요」 vs 「… 조건」.
          둘 다 「— 안전」으로 끝냈다면 서로를 먹었을 자리다(과학 u4 D-7의 교훈).
       ⚠️ **조건 판정의 역단언은 「조건 왼쪽 항 목록」으로 좁힌다.** `— (안전|환경|편리|어울림)을
          도와요`로 넓게 걸면 D-4의 정상 표지 **`소방서 — 안전을 도와요`**가 레드다(6차 실측).
          「안전」은 조건 이름이자 도움 이름이다.
   ⚠️ 상표 24종 — 공유 앱·지도 차시라 가장 위험한 자리인데 **본차시가 이미 0건**이다(실측).
      케이티처 본문도 일반명(공유 앱 · 디지털 영상 지도)만 쓴다. 본차시 쪽도 함께 잰다.
   ⚠️ 미도입 15종 = 인구·도시·촌락·행정·지역사회·공공기관·민주주의·자치·조례·세금·
      위도·경도·축척·등고선·방위 (본차시 전수 0건 실측).
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_social_u1.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 부팅 body class는 **`kt3 subj-social`** · 악센트 `--acc:#A784E6`.
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다(u2 대비).
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다(u1 하나 · u2 미리 생김 0).
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      사회는 단원이 하나뿐이라 lessons = 항목 수 13 = 차시 수 13이다 —
      **둘이 같아서 안 보일 뿐**이니 u2가 붙을 때 항목 수 쪽으로 올릴 것.
   ⚠️ 본차시 근거 대조는 **`sq()`(공백 제거) 한 갈래**로만 한다(u3의 교훈).
   ⚠️ jsdom은 세션마다 새로 깔아야 한다.
   ⚠️ 게이트는 **k-edu 클론에서 돌릴 것** — handoff에는 `grade3/`가 없어 본차시 대조가 죽는다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_social_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const V3CSS = fs.readFileSync(path.join(TDIR, 'engine/teacher-v3.css'), 'utf8');
/* 🚨 사회 첫 단원 — 앞 단원 동반 로드가 없다. 과학 u4의 DATA2/DATA3 줄을 복제하면 죽는다. */
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_social_u1.js'), 'utf8');
/* 용어·가드는 본문만 대상 — 머리 주석에 가드 목록과 검산기 예시가 그대로 적혀 있어
   주석을 함께 걸면 게이트가 자기 주석에 걸려 넘어진다. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_social.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
const txt = (h) => h.replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
/* 🚨 `<script>`를 지우지 않는다 — 사회 본차시는 본문을 script 안 템플릿 문자열로 쓴다.
      과학 생성기의 sq()를 그대로 복제하면 본문이 통째로 사라진다(5차 실측). */
const sq = (h) => h.replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');
const NOSTAR = BODY.replace(/\*/g, '');   /* 굵게 표시를 지운 갈래 — 본문 대조용 */

/* ⚠️ 13항목 13차시. **묶음 0** — 키가 l01~l13으로 끊김 없이 이어진다. */
const KEYS = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06', 'u1_l07',
              'u1_l08', 'u1_l09', 'u1_l10', 'u1_l11', 'u1_l12', 'u1_l13'];
const NS = {};
KEYS.forEach((k, i) => { NS[k] = i + 1; });
const PAIRED = [];                 /* 🚨 묶음 0 — 없음을 거꾸로 못 박는다 */
const SINGLE = KEYS.slice();
const SKIPPED = [];                /* 🚨 건너뛰는 키 0 */
/* 소단원 · 성취기준 갈래 (전수 실측) */
const SUB1 = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06'];
const SUB2 = ['u1_l07', 'u1_l08', 'u1_l09', 'u1_l10', 'u1_l11', 'u1_l12', 'u1_l13'];
const STD_A = ['u1_l01', 'u1_l02', 'u1_l03', 'u1_l04', 'u1_l05', 'u1_l06', 'u1_l07', 'u1_l08', 'u1_l09'];
const STD_B = ['u1_l10', 'u1_l11', 'u1_l12', 'u1_l13'];
const CLOSERS = ['u1_l06', 'u1_l13'];   /* 🚨 마무리 자리가 **둘**이다 */

/* 학생 본차시 원문 = 인용 대조의 단일 정답.
   ⚠️ 사회 u1은 키 번호와 파일 번호가 1:1로 같다 — 과학 u4처럼 어긋나지 않는다. */
const SDIR = path.join(ROOT, 'grade3/semester1/social/1단원_우리가사는곳');
const SFILE = {
  u1_l01: 'g3_social_u1_l01_여러장소.html',
  u1_l02: 'g3_social_u1_l02_분류해요.html',
  u1_l03: 'g3_social_u1_l03_경험과느낌.html',
  u1_l04: 'g3_social_u1_l04_표현하기.html',
  u1_l05: 'g3_social_u1_l05_공유앱.html',
  u1_l06: 'g3_social_u1_l06_표현정리.html',
  u1_l07: 'g3_social_u1_l07_도움주는장소.html',
  u1_l08: 'g3_social_u1_l08_하는일.html',
  u1_l09: 'g3_social_u1_l09_지도찾기.html',
  u1_l10: 'g3_social_u1_l10_지도활용.html',
  u1_l11: 'g3_social_u1_l11_살기좋은곳.html',
  u1_l12: 'g3_social_u1_l12_방안탐색.html',
  u1_l13: 'g3_social_u1_l13_단원정리.html'
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
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-social">${extractBody(HOME)}</body></html>`;

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
  w.eval(`Teacher.init({ subject:{grade:3,subject:"사회",title:"3학년 1학기 사회",brand:"케이티처",slug:"g3_social"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

/* ⚠️ 홈 → 차시 진입을 **엔진이 실제로 여는 차시**로 확인한다.
   렌더 길이만 재면 openShow가 실패해도 앞 차시 화면이 남아 조용히 초록이 난다(과학 u4 실측). */
function openAs(w, key) {
  w.Teacher.backToHome();
  w.Teacher.openShow('1', String(NS[key]));
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
eval(DATA);
const L = global.window.LESSONS;

/* 🚨🚨 키 집합 선점검 — 라이브 버그(항목 순번 키)를 잡는 그물은 여기여야 한다.
   ⚠️ A 섹션까지 미루면 안 된다: 바로 아래 STUDENT·TNOTE가 L[k]를 곧바로 읽으므로
      키가 하나라도 어긋나면 **단언이 아니라 TypeError로 죽어** 「N 통과 / M 실패」 줄
      자체가 안 나온다(과학 u4 역검증 ⑦ 실측).
   ⚠️ 복제할 사람은 이 블록을 **`const L` 바로 뒤**에 그대로 옮길 것. */
console.log('═══ @. 키 집합 선점검 (파생 상수보다 먼저) ═══');
T('🚨🚨 uN 키 집합이 KEYS와 정확히 같다 — 항목 순번으로 붙이면 여기서 잡힌다', () => {
  const got = Object.keys(L).filter(k => /^u1_/.test(k)).sort();
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

/* ⚠️ 세 번째 인수 keepReview — 선행 가드는 review까지 빼고 잰다(review가 앞 차시 낱말을 데려온다) */
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
T('🚨 부팅 + u1 13항목 로드 — **앞 단원 동반 로드 없음**(사회 첫 단원)', () => {
  W = boot();
  const k1 = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(k1.length === 13, 'u1 항목 ' + k1.length);
  ok(Object.keys(W.LESSONS).length === 13,
     '엉뚱한 단원이 함께 로드됨 ' + Object.keys(W.LESSONS).length + ' — 과학 u4의 DATA2/DATA3 줄을 복제했는지 확인');
});
T('🚨 키 번호 = 그 항목이 여는 차시 번호(n) — 이 단원은 둘이 같아서 안 보일 뿐이다', () => {
  KEYS.forEach(k => ok(k === 'u1_l' + String(L[k].meta.n).padStart(2, '0'),
    k + '의 키 번호가 n(' + L[k].meta.n + ')과 어긋난다 — 홈 카드가 엉뚱한 차시를 연다'));
  const ns = KEYS.map(k => L[k].meta.n);
  ok(JSON.stringify(ns) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]), 'n 목록 ' + ns.join(','));
});
T('🚨 건너뛰는 키 0 · 묶음 0 — l01~l13이 끊김 없이 이어진다 (없음을 거꾸로 못 박는다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u1_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  ok(SKIPPED.length === 0, '건너뛴 키가 생겼다 ' + SKIPPED.join(','));
  ok(PAIRED.length === 0, '묶음이 생겼다 ' + PAIRED.join(','));
  for (let n = 1; n <= 13; n++) ok(!!L['u1_l' + String(n).padStart(2, '0')], 'l' + n + ' 자리가 비었다');
  ok(!L['u1_l14'], '단원 밖 키가 생겼다: u1_l14');
});
T('⚠️ SFILE 매핑 — 사회 u1은 키 번호와 파일 번호가 1:1로 같다 (과학 u4처럼 어긋나지 않는다)', () => {
  KEYS.forEach(k => ok(SFILE[k].includes('_' + k.slice(3) + '_'),
    k + '의 근거 파일이 같은 번호가 아니다: ' + SFILE[k]));
  ok(Object.keys(SFILE).length === 13, 'SFILE ' + Object.keys(SFILE).length + '개');
  KEYS.forEach(k => ok(fs.existsSync(path.join(SDIR, SFILE[k])), '본차시 파일 없음 ' + SFILE[k]));
});
T('🚨 본차시 sq()가 살아 있다 — script를 지우면 본문이 통째로 사라진다 (5차 실측 자리)', () => {
  KEYS.forEach(k => ok(SQ[k].length > 3000, k + ' 본차시 sq 길이 ' + SQ[k].length + ' — script를 지웠는지 확인'));
  const killed = SRC['u1_l01'].replace(/<script[\s\S]*?<\/script>/g, '');
  ok(sq(killed).length < SQ['u1_l01'].length / 2,
     'script를 지워도 본문이 남는다 — 이 단언은 본차시가 script 안에 본문을 쓸 때만 뜻이 있다');
});
T('슬라이드 id 0패딩 s01~sNN 연속', () => {
  KEYS.forEach(k => {
    L[k].slides.map(s => s.id).forEach((id, i) =>
      ok(id === 's' + String(i + 1).padStart(2, '0'), k + ' ' + id));
  });
});
T('⚠️ body class = kt3 subj-social · 사회 악센트가 CSS에 실존', () => {
  ok(/<body class="kt3 subj-social">/.test(HOME), '홈 body class 어긋남');
  ok(/body\.kt3\.subj-social\s*\{[^}]*--acc:/.test(V3CSS), 'teacher-v3.css에 사회 악센트 없음');
  ok(!/subj-korean|subj-math|subj-science/.test(HOME), '다른 과목 class 잔재');
});

console.log('═══ B. 홈 카드 진입 · 7요소 실렌더 ═══');
T('🚨 홈 카드 열셋이 저마다 제 차시를 연다 (엉뚱한 차시·안 열림 0)', () => {
  KEYS.forEach(k => openAs(W, k));
});
KEYS.forEach(k => {
  T(k + ' 7요소 실렌더', () => {
    const html = renderAll(W, k, L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    ok(!/이 슬라이드를 그리지 못했어요/.test(html), '오류 카드 검출');
    const blocks = L[k].slides.map(s => s.block);
    const need = ['cover', 'objective', 'motivate', 'concept', 'misconception', 'basic_problem',
                  'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
                  'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
    need.forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    if (k !== 'u1_l01') ok(blocks.includes('review'), k + ' review 없음');
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('🚨 l01만 review가 없다 (사회 첫 단원) · l01 concept 넷 · 나머지 concept 셋', () => {
  ok(!L['u1_l01'].slides.some(s => s.block === 'review'),
     'l01에 review가 있다 — 앞 단원이 없는데 어디서 받았는지 확인');
  ok(L['u1_l01'].slides.filter(s => s.block === 'concept').length === 4,
     'l01 concept ' + L['u1_l01'].slides.filter(s => s.block === 'concept').length + ' (review 자리를 메우느라 넷이다)');
  KEYS.filter(k => k !== 'u1_l01').forEach(k => {
    ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음');
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 3, k + ' concept ' + c + ' (셋이어야)');
  });
  KEYS.forEach(k => {
    const b = L[k].slides.filter(s => s.block === 'basic_problem').length;
    ok(b === 3, k + ' basic ' + b + ' (셋이어야 19슬로 떨어진다 — 넷으로 짜면 20슬로 터진다)');
  });
});
T('img 폴백 경로 실존 (13개 미생성 = 폴백 정상 · 경로 중복 0)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/social\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
  const ids = KEYS.map(k => L[k].slides.find(s => s.data && s.data.img).data.img);
  ok(new Set(ids).size === 13, 'img 경로 중복 — 단원 안에서 갈라져야 한다');
});

console.log('═══ C. 회귀 (13항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, k, 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (sq 갈래) ═══');
T('① l01 장소의 뜻 원문 일치', () => {
  ['장소는 사람들이 생활하면서 이용하는 곳',
   '우리가 사는 곳을 이루는 한 부분',
   '장소는 언제나 우리가 갈 수 있는 곳'].forEach(s => both('u1_l01', s));
});
T('② l02 분류 기준 원문 일치', () => {
  ['무엇을 보고 나눌지', '기준이 있어야 비슷한 것끼리', '기준이 달라지면'].forEach(s => both('u1_l02', s));
});
T('③ l03 경험과 느낌 원문 일치', () => {
  ['경험', '그때 든 마음', '장소 카드'].forEach(s => both('u1_l03', s));
});
T('④ l04 표현하고 소개하기 원문 일치', () => {
  ['장소 사진', '소개 글', '여러 장소를 한눈에 알릴 수 있'].forEach(s => both('u1_l04', s));
});
T('⑤ l05 공유 앱 예절 원문 일치', () => {
  ['고운 말', '남의 정보를 함부로 올리지 않', '친구를 흉보지 않'].forEach(s => both('u1_l05', s));
});
T('⑥ l06 그림일기·소단원 마무리 원문 일치', () => {
  ['그림일기', '존중', '표현'].forEach(s => both('u1_l06', s));
});
T('⑦ l07 도움 주는 장소 원문 일치', () => {
  ['여러 사람이 함께 이용하며', '생활을 편리하고 안전하게'].forEach(s => both('u1_l07', s));
});
T('⑧ l08 하는 일 무리 원문 일치', () => {
  ['안전을 지키는 곳', '건강을 돌보는 곳', '배우고 즐기는 곳'].forEach(s => both('u1_l08', s));
});
T('⑨ l09 디지털 영상 지도 원문 일치', () => {
  ['위성', '실제 모습을 보여 주는 지도', '검색'].forEach(s => both('u1_l09', s));
});
T('⑩ l10 지도 기능 원문 일치', () => {
  ['길찾기', '확대', '축소'].forEach(s => both('u1_l10', s));
});
T('⑪ l11 살기 좋은 곳의 조건 원문 일치', () => {
  ['안전', '환경', '어울림'].forEach(s => both('u1_l11', s));
});
T('⑫ l12 방안 탐색 원문 일치', () => {
  ['어린이 보호구역', '가로등'].forEach(s => both('u1_l12', s));
});
T('⑬ l13 단원 정리 원문 일치 (두 갈래를 함께 되짚는다)', () => {
  ['여러 장소', '도움 주는 장소'].forEach(s => both('u1_l13', s));
});

console.log('═══ D-2. 장소 판정 검산기 (두 갈래를 함께 · BODY) ═══');
const ISPLACE = {
  '장소예요': ['학교', '시장', '산', '강', '도서관', '놀이터', '병원', '공원'],
  '장소가 아니에요': ['기쁨', '어제', '빠르다', '슬픔', '내일', '즐겁다']
};
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  const a = ISPLACE['장소예요'], b = ISPLACE['장소가 아니에요'];
  const dup = a.filter(x => b.includes(x));
  ok(dup.length === 0, '두 갈래에 겹친 낱말: ' + dup.join(','));
  ok(a.length >= 4 && b.length >= 3, '한쪽 갈래가 얇다');
});
/* ⚠️ 「장소가 아니에요」가 「장소예요」의 앞자락을 먹지 않도록 긴 쪽을 먼저 쓴다 */
const PL = [...NOSTAR.matchAll(/([가-힣]{1,6}) — (장소가 아니에요|장소예요)/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 장소 판정 선언이 일곱 이상 · 두 갈래 각 셋 이상', () => {
  ok(PL.length >= 7, '선언 ' + PL.length + '건 — 검산 대상이 죽었다');
  ok(PL.filter(x => x[1] === '장소예요').length >= 4, '장소 갈래가 얇다');
  ok(PL.filter(x => x[1] === '장소가 아니에요').length >= 3, '장소 아닌 갈래가 얇다');
});
T('⚠️ 장소 판정 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = PL.filter(([a, g]) => !ISPLACE[g].includes(a)).map(([a, g]) => a + ' — ' + g);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ — (장소가 아니에요|장소예요)/g) || []).length;
  ok(mk === PL.length, '선언 표지 ' + mk + '건인데 검산은 ' + PL.length + '건 — 진리표 밖 이름이 샜다');
  const seen = {};
  PL.forEach(([a, g]) => ok((seen[a] = seen[a] || g) === g, '「' + a + '」가 두 갈래에 걸쳐 있다'));
});
T('🚨 한 글자 낱말(산·강)이 실제로 걸린다 (정규식 폭 역확인 — {2,6}으로 좁히면 조용히 빠진다)', () => {
  ['산', '강'].forEach(a => ok(PL.some(x => x[0] === a), a + '이(가) 안 걸렸다'));
  ok(PL.filter(x => x[0].length === 1).length >= 2, '한 글자 선언 ' + PL.filter(x => x[0].length === 1).length + '건');
});
T('본차시 l01이 장소와 장소 아닌 것을 실제로 가른다 (근거 확인)', () => {
  ['장소는사람들이생활하면서이용하는곳'].forEach(w =>
    ok(SQ['u1_l01'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 분류 기준 검산기 (자연/사람 두 갈래 · BODY) ═══');
const MADE = { '자연이 만든 장소': ['산', '강', '바다', '숲', '들'],
               '사람이 만든 장소': ['학교', '시장', '도서관', '놀이터', '병원', '공원', '소방서'] };
T('⚠️ 진리표 자체 검증 (두 갈래가 겹치지 않는다)', () => {
  const dup = MADE['자연이 만든 장소'].filter(x => MADE['사람이 만든 장소'].includes(x));
  ok(dup.length === 0, '두 갈래에 겹친 장소: ' + dup.join(','));
  ok(MADE['자연이 만든 장소'].length >= 3 && MADE['사람이 만든 장소'].length >= 4, '한쪽 갈래가 얇다');
});
const MD = [...NOSTAR.matchAll(/([가-힣]{1,6}) — (자연이 만든 장소|사람이 만든 장소)/g)].map(m => [m[1], m[2]]);
T('⚠️ 검산 대상 실존 — 분류 선언이 여섯 이상 · 자연 둘 이상 · 사람 넷 이상', () => {
  ok(MD.length >= 6, '선언 ' + MD.length + '건 — 검산 대상이 죽었다');
  ok(MD.filter(x => x[1] === '자연이 만든 장소').length >= 2, '자연 갈래가 얇다');
  ok(MD.filter(x => x[1] === '사람이 만든 장소').length >= 4, '사람 갈래가 얇다');
});
T('⚠️ 분류 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = MD.filter(([a, g]) => !MADE[g].includes(a)).map(([a, g]) => a + ' — ' + g);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ — (자연이 만든 장소|사람이 만든 장소)/g) || []).length;
  ok(mk === MD.length, '선언 표지 ' + mk + '건인데 검산은 ' + MD.length + '건');
  const seen = {};
  MD.forEach(([a, g]) => ok((seen[a] = seen[a] || g) === g, '「' + a + '」가 두 갈래에 걸쳐 있다'));
});
T('본차시 l02가 기준을 실제로 가르친다 (근거 확인)', () => {
  ['기준이있어야비슷한것끼리', '기준이달라지면'].forEach(w =>
    ok(SQ['u1_l02'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-4. 장소와 도움 검산기 (🚨 학생 노출 갈래에서만) ═══');
/* 🚨 tnote 교사 안내가 `… 아이 — 건강을 도와요` 꼴로 걸린다 — STUDENT로 좁혀 재는 것이 핵심 */
const HELP4 = { '병원': '건강', '소방서': '안전', '경찰서': '안전', '우체국': '소식', '도서관': '배움' };
const RE_D4 = /([가-힣]{1,6}) — ([가-힣]{1,4})을 도와요/g;
const HP = [...STUDENT.matchAll(RE_D4)].map(m => [m[1], m[2]]);
T('⚠️ 진리표 자체 검증 (다섯 대상 · 갈래 넷 · 왼쪽 항 중복 0)', () => {
  ok(Object.keys(HELP4).length === 5, '대상 ' + Object.keys(HELP4).length + '곳');
  ok(new Set(Object.values(HELP4)).size === 4, '갈래 ' + new Set(Object.values(HELP4)).size + '종 (건강·안전·소식·배움 넷)');
});
T('⚠️ 검산 대상 실존 — 장소와 도움 선언이 다섯 이상 · 네 갈래가 다 선다', () => {
  ok(HP.length >= 5, '선언 ' + HP.length + '건 — 검산 대상이 죽었다');
  ['건강', '안전', '소식', '배움'].forEach(g =>
    ok(HP.some(x => x[1] === g), '갈래 「' + g + '」가 없다'));
});
T('⚠️ 장소와 도움 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = HP.filter(([a, g]) => HELP4[a] !== g).map(([a, g]) => a + ' — ' + g + '을 도와요');
  ok(bad.length === 0, bad.join(' / '));
  const mk = (STUDENT.match(/ — [가-힣]{1,4}을 도와요/g) || []).length;
  ok(mk === HP.length, '선언 표지 ' + mk + '건인데 검산은 ' + HP.length + '건');
});
T('🚨 tnote 교사 안내(… 아이 — 건강을 도와요)는 검산 대상이 아니다 (STUDENT 좁힘의 근거 · 역확인)', () => {
  const loose = [...NOSTAR.matchAll(RE_D4)].map(m => [m[1], m[2]]);
  const bad = loose.filter(([a, g]) => HELP4[a] !== g);
  ok(bad.length > 0,
     'BODY 갈래에서도 어긋남이 0이다 — tnote 오탐 자리가 사라졌다. STUDENT 좁힘이 뜻을 잃는다');
  ok(/아이 — 건강을 도와요/.test(TNOTE), 'tnote 오탐 자리(아이 — 건강을 도와요)가 사라졌다');
  ok(!/아이 — 건강을 도와요/.test(STUDENT), 'tnote 안내가 학생 갈래에 새어 들었다');
  ok(!HP.some(x => /아이$/.test(x[0])), 'tnote 안내가 검산 대상에 새어 들었다');
});
T('본차시 l07이 도움 주는 장소를 실제로 가르친다 (근거 확인)', () => {
  ['여러사람이함께이용하며', '생활을편리하고안전하게'].forEach(w =>
    ok(SQ['u1_l07'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-5. 하는 일 무리 검산기 (세 갈래 × 각 둘 · BODY) ═══');
const GROUP5 = { '소방서': '안전을 지키는 곳', '경찰서': '안전을 지키는 곳',
                 '병원': '건강을 돌보는 곳', '보건소': '건강을 돌보는 곳',
                 '도서관': '배우고 즐기는 곳', '놀이터': '배우고 즐기는 곳' };
const G5 = [...NOSTAR.matchAll(/([가-힣]{1,6}) — (안전을 지키는 곳|건강을 돌보는 곳|배우고 즐기는 곳)/g)]
  .map(m => [m[1], m[2]]);
T('⚠️ 진리표 자체 검증 (세 갈래 · 갈래마다 둘 · 겹침 0 · 대상 여섯)', () => {
  ok(Object.keys(GROUP5).length === 6, '대상 ' + Object.keys(GROUP5).length + '곳');
  ['안전을 지키는 곳', '건강을 돌보는 곳', '배우고 즐기는 곳'].forEach(g =>
    ok(Object.values(GROUP5).filter(v => v === g).length === 2, '「' + g + '」 갈래가 둘이 아니다'));
});
T('⚠️ 검산 대상 실존 — 무리 선언이 여섯 이상 · 세 갈래 각 둘 이상', () => {
  ok(G5.length >= 6, '선언 ' + G5.length + '건 — 검산 대상이 죽었다');
  ['안전을 지키는 곳', '건강을 돌보는 곳', '배우고 즐기는 곳'].forEach(g =>
    ok(G5.filter(x => x[1] === g).length >= 2, '「' + g + '」 갈래가 둘 미만'));
});
T('⚠️ 무리 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수 · 한 곳이 두 갈래에 걸치지 않는다)', () => {
  const bad = G5.filter(([a, g]) => GROUP5[a] !== g).map(([a, g]) => a + ' — ' + g);
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ — (안전을 지키는 곳|건강을 돌보는 곳|배우고 즐기는 곳)/g) || []).length;
  ok(mk === G5.length, '선언 표지 ' + mk + '건인데 검산은 ' + G5.length + '건');
  const seen = {};
  G5.forEach(([a, g]) => ok((seen[a] = seen[a] || g) === g, '「' + a + '」가 두 갈래에 걸쳐 있다'));
});
T('본차시 l08이 세 무리를 실제로 가른다 (근거 확인)', () => {
  ['안전을지키는곳', '건강을돌보는곳', '배우고즐기는곳'].forEach(w =>
    ok(SQ['u1_l08'].includes(w), '본차시 근거 없음: ' + w));
});

console.log('═══ D-6. 지도 기능 검산기 (넷 · 꼬리 「… 기능」 고정 · BODY) ═══');
const FUNC6 = { '이름으로 찾기': '검색', '크게 보기': '확대', '넓게 보기': '축소', '가는 길 보기': '길찾기' };
const F6 = [...NOSTAR.matchAll(/([가-힣 ]{2,10}?) — ([가-힣]{2,3}) 기능/g)].map(m => [m[1].trim(), m[2]]);
T('⚠️ 진리표 자체 검증 (네 기능 · 겹침 0)', () => {
  ok(Object.keys(FUNC6).length === 4, '대상 ' + Object.keys(FUNC6).length + '개');
  ok(new Set(Object.values(FUNC6)).size === 4, '네 기능이 서로 다르지 않다');
});
T('⚠️ 검산 대상 실존 — 기능 선언이 넷 이상 · 네 기능이 다 선다', () => {
  ok(F6.length >= 4, '선언 ' + F6.length + '건 — 검산 대상이 죽었다');
  ok(new Set(F6.map(x => x[1])).size === 4, '네 기능이 다 서지 않았다: ' + [...new Set(F6.map(x => x[1]))].join(','));
});
T('⚠️ 기능 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = F6.filter(([a, g]) => FUNC6[a] !== g).map(([a, g]) => a + ' — ' + g + ' 기능');
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ — [가-힣]{2,3} 기능/g) || []).length;
  ok(mk === F6.length, '선언 표지 ' + mk + '건인데 검산은 ' + F6.length + '건');
});
T('🚨 네 기능이 본차시 l10에 전부 실존한다 (진리표를 지어내지 않았다)', () => {
  ['검색', '확대', '축소', '길찾기'].forEach(w =>
    ok(SQ['u1_l10'].includes(w), '본차시 l10에 없음: ' + w));
});
T('🚨 보기 나열 뒤의 「— 물음」은 검산기 표지와 부딪친다 (6차에 밟은 자리 · 회귀)', () => {
  /* 「색칠하기 · 길찾기 · 노래하기 · 지우기 — 알맞은 기능은?」이 D-6의 `X — Y 기능` 꼴로 걸렸다.
     보기 줄 끝을 「… 가운데 알맞은 것은?」으로 갈아 해소한 자리 — 되돌아가면 여기서 잡힌다. */
  ok(!/ — 알맞은 기능은/.test(NOSTAR), '보기 줄이 「— 알맞은 기능은?」으로 되돌아갔다 — D-6 표지와 부딪친다');
  ok(!/예 — [가-힣]{2,3} 기능/.test(NOSTAR), '예시 답이 「예 — X 기능」 꼴이다 — D-6 표지와 부딪친다');
});

console.log('═══ D-7. 문제와 방안 검산기 (넷) + 조건 판정 (여섯 · 꼬리를 갈랐다) ═══');
const PLAN7 = { '어두운 길': '가로등', '쌓인 쓰레기': '분리배출', '쉴 곳 없음': '공원', '외로운 이웃': '인사' };
const P7 = [...NOSTAR.matchAll(/([가-힣 ]{2,10}?) — ([가-힣]{2,4})(?:을|를) (?:세워요|해요|만들어요|나눠요)/g)]
  .map(m => [m[1].trim(), m[2]]);
T('⚠️ 진리표 자체 검증 (넷 · 방안 겹침 0)', () => {
  ok(Object.keys(PLAN7).length === 4, '대상 ' + Object.keys(PLAN7).length + '건');
  ok(new Set(Object.values(PLAN7)).size === 4, '네 방안이 서로 다르지 않다');
});
T('⚠️ 검산 대상 실존 — 방안 선언이 넷 이상 · 네 방안이 다 선다', () => {
  ok(P7.length >= 4, '선언 ' + P7.length + '건 — 검산 대상이 죽었다');
  ok(new Set(P7.map(x => x[1])).size === 4, '네 방안이 다 서지 않았다: ' + [...new Set(P7.map(x => x[1]))].join(','));
});
T('⚠️ 방안 선언 전수 검산 (어긋남 0)', () => {
  const bad = P7.filter(([a, g]) => PLAN7[a] !== g).map(([a, g]) => a + ' — ' + g);
  ok(bad.length === 0, bad.join(' / '));
});
const COND7 = { '밝은 가로등': '안전', '넓은 횡단보도': '안전', '깨끗한 공원': '환경',
                '분리배출': '환경', '가까운 병원': '편리', '서로 돕는 이웃': '어울림' };
const C7 = [...NOSTAR.matchAll(/([가-힣 ]{2,10}?) — (안전|환경|편리|어울림) 조건/g)].map(m => [m[1].trim(), m[2]]);
T('⚠️ 조건 진리표 자체 검증 (여섯 대상 · 네 갈래)', () => {
  ok(Object.keys(COND7).length === 6, '대상 ' + Object.keys(COND7).length + '건');
  ok(new Set(Object.values(COND7)).size === 4, '갈래 ' + new Set(Object.values(COND7)).size + '종 (안전·환경·편리·어울림 넷)');
});
T('⚠️ 검산 대상 실존 — 조건 선언이 여섯 이상 · 네 갈래가 다 선다', () => {
  ok(C7.length >= 6, '선언 ' + C7.length + '건 — 검산 대상이 죽었다');
  ['안전', '환경', '편리', '어울림'].forEach(g => ok(C7.some(x => x[1] === g), '조건 갈래 「' + g + '」가 없다'));
});
T('⚠️ 조건 선언 전수 검산 (어긋남 0 · 표지 수 = 검산 수)', () => {
  const bad = C7.filter(([a, g]) => COND7[a] !== g).map(([a, g]) => a + ' — ' + g + ' 조건');
  ok(bad.length === 0, bad.join(' / '));
  const mk = (NOSTAR.match(/ — (안전|환경|편리|어울림) 조건/g) || []).length;
  ok(mk === C7.length, '선언 표지 ' + mk + '건인데 검산은 ' + C7.length + '건');
});
T('🚨 두 진리표의 꼬리가 갈렸다 — 같은 왼쪽 항이 두 꼬리를 겹쳐 쓰지 않는다', () => {
  /* 🚨🚨 이 역단언을 **정규식으로 넓게 짜면 안 된다**(6차에 두 번 밟은 자리).
     ① `— (안전|환경|편리|어울림)을 도와요`로 걸면 D-4의 **정상 표지**
        `소방서 — 안전을 도와요`가 레드다 — 「안전」은 조건 이름이자 도움 이름이다.
     ② 조건 왼쪽 항 목록으로 좁혀도 부분 문자열이라 **`가까운 병원 — 편리 조건`** 안의
        「병원」이 D-4 왼쪽 항으로 걸린다.
     → 재는 자리는 낱말이 아니라 **파싱된 왼쪽 항 그 자체**다. 두 검산기가 실제로 긁어낸
        왼쪽 항 집합이 겹치지 않는지만 보면 정규식 함정이 통째로 사라진다. */
  const cLeft = new Set(C7.map(x => x[0]));
  const hLeft = new Set(HP.map(x => x[0]));
  const dup = [...cLeft].filter(x => hLeft.has(x));
  ok(dup.length === 0, '같은 왼쪽 항이 두 꼬리를 겹쳐 쓴다: ' + dup.join(',') + ' — 진리표가 부딪친다');
  /* 진리표 선언 쪽에서도 같은 것을 잰다 */
  const tdup = Object.keys(COND7).filter(x => x in HELP4);
  ok(tdup.length === 0, '진리표 왼쪽 항이 겹친다: ' + tdup.join(','));
  /* 이 역단언이 뜻을 가지려면 「안전」이 두 진리표에 **오른쪽 항으로** 다 있어야 한다 */
  ok(Object.values(HELP4).includes('안전') && Object.values(COND7).includes('안전'),
     '「안전」이 두 진리표에 다 있지 않다 — 꼬리를 가른 이유가 사라졌다');
  /* 꼬리가 실제로 갈렸는지 — 두 표지가 서로의 정규식에 안 걸린다 */
  ok(!/ — [가-힣]{1,4}을 도와요 조건/.test(NOSTAR), '두 꼬리가 한 줄에 붙었다');
});
T('본차시 l11·l12가 조건과 방안을 실제로 가르친다 (근거 확인)', () => {
  ['안전', '환경', '어울림'].forEach(w => ok(SQ['u1_l11'].includes(w), '본차시 l11에 없음: ' + w));
  ['어린이보호구역', '가로등'].forEach(w => ok(SQ['u1_l12'].includes(w), '본차시 l12에 없음: ' + w));
});

console.log('═══ E. 가드 (선행 11 · 역단언 11 · 상표 24 · 미도입 15 · 성취기준 두 갈래) ═══');
/* 🚨 살아남은 가드 열하나 — 전수 실측으로 이것만 남았다. 자세한 근거는 머리 주석 (신규 함정 ②). */
const GUARD = {
  '기준': 'u1_l02', '장소 카드': 'u1_l03', '마을 신문': 'u1_l04', '댓글': 'u1_l05',
  '그림일기': 'u1_l06', '소방서': 'u1_l07', '안전을 지키는 곳': 'u1_l08',
  '디지털 영상 지도': 'u1_l09', '축소': 'u1_l10', '조건': 'u1_l11', '어린이 보호구역': 'u1_l12'
};
T('⚠️ 선행 용어 11갈래 — slides − next_lesson − review (예외 두 블록)', () => {
  ok(Object.keys(GUARD).length === 11, '가드 ' + Object.keys(GUARD).length + '갈래');
  Object.keys(GUARD).forEach(w => {
    const first = GUARD[w];
    KEYS.filter(k => k < first).forEach(k => {
      const s = plain(studentSlides(k, false, false)).replace(/ /g, '');
      ok(!s.includes(w.replace(/ /g, '')),
         '선행 가드 위반: 「' + w + '」가 ' + k + ' 학생 화면에 있다(도입 = ' + first + ')');
    });
  });
});
T('⚠️ 도입 자리에는 실존한다 (가드가 대상 0건에서 사이좋게 초록이 나는 것을 막는다)', () => {
  Object.keys(GUARD).forEach(w => {
    const first = GUARD[w];
    ok(studentText(first).replace(/ /g, '').includes(w.replace(/ /g, '')),
       first + '에 「' + w + '」 도입이 없다 — 가드가 뜻을 잃는다');
  });
});
T('🚨 「조건」을 품은 다른 낱말이 가드를 통째로 죽인다 — 무조건·조건반사·조건부 0 (6차에 밟은 자리)', () => {
  /* 가드는 부분 문자열로 재므로 오개념 문구의 「무조건 크게만」이 l11 가드에 걸렸다.
     「언제나 크게만」으로 갈아 해소한 자리 — 되돌아가면 여기서 잡힌다.
     ⚠️ 흔한 한 낱말을 가드로 쓸 때는 **그 낱말을 품은 다른 낱말부터 grep할 것.** */
  ['무조건', '조건반사', '조건부'].forEach(w =>
    ok(!NOSTAR.includes(w), '「' + w + '」가 본문에 있다 — l11의 「조건」 가드가 통째로 죽는다'));
  ok(GUARD['조건'] === 'u1_l11', '조건 가드 자리가 바뀌었다 — 이 단언의 전제가 흔들린다');
});
/* 🚨 역단언 열하나 — 가드로 쓸 수 없는 낱말의 근거를 본차시에서 직접 잰다.
      이것이 가드 목록의 안전장치다: 본차시가 바뀌면 여기가 먼저 운다. */
const REV = [['분류', 'u1_l01'], ['경험', 'u1_l01'], ['느낌', 'u1_l01'], ['존중', 'u1_l01'],
             ['하는 일', 'u1_l01'], ['병원', 'u1_l01'], ['표현', 'u1_l03'], ['공유 앱', 'u1_l04'],
             ['확대', 'u1_l09'], ['살기 좋은', 'u1_l10'], ['방안', 'u1_l11']];
T('🚨 역단언 11 — 그럴듯한 낱말들이 왜 가드가 될 수 없는지 본차시에서 직접 잰다', () => {
  ok(REV.length === 11, '역단언 ' + REV.length + '건');
  REV.forEach(([w, k]) => ok(SQ[k].includes(sq(w)),
    '역단언 실패: 「' + w + '」가 본차시 ' + k + '에 없다 — 가드 목록을 다시 재야 한다'));
  /* 그 낱말들이 GUARD에 들어 있지 않은지도 함께 못 박는다 */
  REV.forEach(([w]) => ok(!(w in GUARD), '「' + w + '」를 가드 목록에 넣었다 — 본차시가 먼저 쓴다'));
});
T('🚨 next_lesson 예외 자리 둘 — l01의 「기준」 · l06의 「소방서」가 실제로 예고에 있다', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(nx('u1_l01').includes('기준'), 'l01 next_lesson이 「기준」을 예고하지 않는다 — next를 뺄 이유가 사라졌다');
  ok(nx('u1_l06').includes('소방서'), 'l06 next_lesson이 「소방서」를 예고하지 않는다 — next를 뺄 이유가 사라졌다');
  ok(!plain(studentSlides('u1_l01', false, false)).includes('기준'), 'l01 본문에 「기준」 선행');
  ok(!plain(studentSlides('u1_l06', false, false)).includes('소방서'), 'l06 본문에 「소방서」 선행');
});
T('⚠️ review 예외 자리 — 앞 차시 낱말이 review로 실제로 들어온다 (가드를 review까지 넓히면 죽는다)', () => {
  const rv = plain(L['u1_l03'].slides.filter(s => s.block === 'review'));
  ok(rv.includes('기준'), 'l03 review가 l02의 「기준」을 데려오지 않는다 — 계보 재검토');
  ok(plain(studentSlides('u1_l03', false, true)).includes('기준'),
     'review 포함 갈래에서 「기준」이 안 걸린다 — 좁힐 이유가 사라졌다');
});
T('⚠️ next_lesson 예고 역검사 (l01→기준 · l06→소방서 · l09→지도 기능 · l12→단원 정리 · l13→다음 단원)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(/기준/.test(nx('u1_l01')), 'l01 next_lesson이 기준을 예고하지 않음');
  ok(/소방서|도움/.test(nx('u1_l06')), 'l06 next_lesson이 도움 주는 장소를 예고하지 않음');
  ok(/확대|축소|기능/.test(nx('u1_l09')), 'l09 next_lesson이 지도 기능을 예고하지 않음');
  ok(/정리|되짚/.test(nx('u1_l12')), 'l12 next_lesson이 단원 정리를 예고하지 않음');
  ok(/다음 단원|2단원/.test(nx('u1_l13')), 'l13이 다음 단원을 예고하지 않음');
});
T('🚨 상표 가드 24종 — 케이티처 0건 · 본차시도 0건 (공유 앱·지도 차시라 가장 위험한 자리)', () => {
  const BRAND = ['카카오', '네이버', '구글', '패들렛', '유튜브', '인스타', '페이스북',
                 '틱톡', '클래스팅', '하이러닝', '티맵', '애플', '아이패드', '갤럭시',
                 '삼성', '웨일', '크롬', '줌', '다음지도', '구글지도', '네이버지도',
                 '엘지', '밴드', '위두랑'];
  ok(BRAND.length === 24, '상표 목록 ' + BRAND.length + '종');
  const hit = BRAND.filter(w => BODY.includes(w));
  ok(hit.length === 0, '케이티처 상표 노출: ' + hit.join(','));
  KEYS.forEach(k => {
    const h2 = BRAND.filter(w => SQ[k].includes(w));
    ok(h2.length === 0, '본차시 ' + k + '에 상표가 생겼다: ' + h2.join(','));
  });
  /* 일반명은 살아 있어야 한다 — 상표를 지운 자리가 빈칸이 되면 안 된다 */
  ok(STUDENT.includes('공유 앱') && STUDENT.includes('디지털 영상 지도'), '일반명이 사라졌다');
});
T('미도입 갈래(4학년 이상·중등 소관) 학생 노출 0 (15종)', () => {
  const BAN = ['인구', '도시', '촌락', '행정', '지역사회', '공공기관', '민주주의',
               '자치', '조례', '세금', '위도', '경도', '축척', '등고선', '방위'];
  ok(BAN.length === 15, '미도입 목록 ' + BAN.length + '종');
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* ⚠️ 「장소」·「지도」 단독은 걸지 않는다 — 이 단원이 정식으로 가르치는 낱말이다 */
  ok(STUDENT.includes('장소'), '장소가 사라졌다 — 단독 가드를 걸었는지 확인');
  ok(studentText('u1_l09').includes('지도'), 'l09의 지도가 사라졌다 — 인용 대조와 어긋난다');
});
T('⚠️ 성취기준 두 갈래 · 혼재 0 — 🚨 접두 검사로는 둘이 안 갈린다(키 목록으로 못 박는다)', () => {
  STD_A.forEach(k => ok(L[k].meta.std === '[4사01-01]', k + ' std ' + L[k].meta.std + ' (기대 [4사01-01])'));
  STD_B.forEach(k => ok(L[k].meta.std === '[4사01-02]', k + ' std ' + L[k].meta.std + ' (기대 [4사01-02])'));
  ok(STD_A.length === 9 && STD_B.length === 4, '갈래 크기 ' + STD_A.length + '/' + STD_B.length);
  ok(STD_A.concat(STD_B).length === KEYS.length, '두 갈래가 13항목을 덮지 않는다');
  ok(new Set(KEYS.map(k => L[k].meta.std)).size === 2, '성취기준 갈래 수가 둘이 아니다');
  ok(!KEYS.some(k => /4과|4국|4수/.test(L[k].meta.std)), '다른 과목 성취기준 잔재');
  /* 접두 검사가 왜 못 쓰는지 — 둘이 같은 접두를 쓴다는 역확인 */
  ok(KEYS.every(k => L[k].meta.std.startsWith('[4사01-')), '접두가 갈렸다 — 키 목록으로 짤 이유가 사라졌다');
});

console.log('═══ F. 구조 정합 ═══');
T('🚨 슬라이드 수 = 전 항목 19슬 (묶음 0 — 24슬·36슬 항목 0을 거꾸로 못 박는다)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === 19, k + ' ' + L[k].slides.length + '슬 (기대 19)'));
  ok(!KEYS.some(k => L[k].slides.length === 24), '2차시 묶음(24슬)이 생겼다');
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음(36슬)이 생겼다');
});
T('⚠️ 슬라이드 총합 247슬 (19×13) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 247, '총합 ' + tot);
  ok(tot === 19 * SINGLE.length + 24 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('extras 전 항목 20개 · 참조 무결성 · 중복 0 (총합 260)', () => {
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
  ok(tot === 260, 'extras 총합 ' + tot);
  ok(tot === 20 * KEYS.length, '부분 합 재계산 어긋남');
});
T('tnote 전 항목 10슬 (6슬 이상) · 구조 정합 (총 130슬 = 10×13)', () => {
  let tot = 0;
  KEYS.forEach(k => {
    const t = L[k].slides.filter(s => s.tnote);
    tot += t.length;
    ok(t.length === 10, k + ' tnote ' + t.length + ' (10이어야)');
    ok(t.length >= 6, k + ' tnote ' + t.length);
    t.forEach(s => {
      ok(Array.isArray(s.tnote.ask) && s.tnote.ask.length >= 1, k + ' ' + s.id + ' ask');
      ok(typeof s.tnote.watch === 'string' && s.tnote.watch.length > 5, k + ' ' + s.id + ' watch');
      ok(typeof s.tnote.min === 'number' && s.tnote.min > 0, k + ' ' + s.id + ' min');
    });
  });
  ok(tot === 130, 'tnote 총합 ' + tot);
  ok(tot === 10 * KEYS.length, '부분 합 재계산 어긋남');
});
T('🚨 묶음 0 — period_split 0 · covers 물결 0 · 80분 0 · 120분 0 (없음을 거꾸로 못 박는다)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(!m.period_split, k + ' period_split이 생겼다 ' + m.period_split);
    ok(!/~/.test(m.covers), k + ' covers에 물결 ' + m.covers);
    ok(!/·/.test(m.covers), k + ' covers에 가운뎃점 ' + m.covers + ' — 묶음이 생겼다');
    ok(m.duration_min === 40, k + ' ' + m.duration_min + '분 (전 항목 40분이다)');
  });
  ok(KEYS.filter(k => L[k].meta.period_split).length === 0, 'period_split 항목이 생겼다');
});
T('🚨 교시 표시 0 — 2교시·3교시 표지가 하나도 없다 (묶음이 없으니 교시 경계도 없다)', () => {
  KEYS.forEach(k => {
    L[k].slides.forEach(s => {
      const t = (s.data && s.data.title) || '';
      ok(!/[23]교시/.test(t), k + ' ' + s.id + ' 제목에 교시 표시: ' + t);
    });
    const tw = plain(L[k].slides.map(s => s.tnote).filter(Boolean));
    ok(!/여기까지 1교시/.test(tw), k + ' tnote에 교시 경계 표지 — 묶음이 없는데 생겼다');
  });
});
T('⚠️ 단일 차시 13 — covers가 단수 「N차시」 · n과 일치', () => {
  ok(SINGLE.length === 13, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => ok(L[k].meta.covers === L[k].meta.n + '차시',
    k + ' covers ' + L[k].meta.covers + ' (기대 ' + L[k].meta.n + '차시)'));
});
T('⚠️ 수업시간 합 = 13차시 × 40분 = 520분 — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 520, '합 ' + tot);
  ok(tot === 40 * SINGLE.length + 80 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('🚨 review 계보 = 12연쇄 · 직전 항목 exit 3문항 q·a 전수 계승 · 단원을 넘는 자리 0', () => {
  const chain = [];
  for (let n = 2; n <= 13; n++) {
    chain.push(['u1_l' + String(n).padStart(2, '0'), 'u1_l' + String(n - 1).padStart(2, '0')]);
  }
  ok(chain.length === 12, '계보 길이 ' + chain.length);
  chain.forEach(([k, from]) => {
    const rv = L[k].slides.find(s => s.block === 'review');
    ok(rv, k + ' review 없음');
    ok(rv.data.from === from, k + ' from ' + rv.data.from + ' (기대 ' + from + ')');
    const ex = L[from].slides.find(s => s.block === 'exit_ticket');
    ok(ex, from + ' exit 없음');
    ok(JSON.stringify(rv.data.items) === JSON.stringify(ex.data.items),
       k + ' review가 ' + from + ' exit를 그대로 계승하지 않음');
  });
  /* 🚨 사회 첫 단원 — 단원을 넘는 계보가 하나라도 생기면 동반 로드가 필요해진다 */
  const cross = chain.filter(([, from]) => !/^u1_/.test(from));
  ok(cross.length === 0, '단원을 넘는 계보가 ' + cross.length + '건 — 사회 첫 단원이다');
  ok(!L['u1_l01'].slides.some(s => s.block === 'review'), 'l01에 review가 생겼다');
});
T('🚨 마무리 자리가 둘 — l06(소단원 ①) · l13(단원) (단원 끝 하나로만 짜면 l06이 빈다)', () => {
  ok(CLOSERS.length === 2, '마무리 자리 ' + CLOSERS.length + '곳');
  const s6 = L['u1_l06'].slides.find(s => s.block === 'summary');
  ok(/소단원/.test(plain(s6)), 'l06 summary에 「소단원」 표지가 없다');
  const s13 = L['u1_l13'].slides.find(s => s.block === 'summary');
  ok(/1단원/.test(plain(s13)), 'l13 summary에 「1단원」 표지가 없다');
  ok(/소단원/.test(L['u1_l06'].meta.title), 'l06 제목에 소단원 마무리 표지가 없다');
  ok(/단원 마무리/.test(L['u1_l13'].meta.title), 'l13 제목에 단원 마무리 표지가 없다');
  /* 소단원 갈래가 실제로 여섯 + 일곱으로 갈린다 */
  ok(SUB1.length === 6 && SUB2.length === 7, '소단원 갈래 ' + SUB1.length + '/' + SUB2.length);
  ok(SUB1.concat(SUB2).length === KEYS.length, '두 소단원이 13항목을 덮지 않는다');
});
T('exit_ticket = 확인 3문항 + 신호등 3', () => {
  KEYS.forEach(k => {
    const e = L[k].slides.find(s => s.block === 'exit_ticket');
    ok(e.data.items.length === 3, k + ' exit 문항 ' + e.data.items.length);
    e.data.items.forEach(i => ok(i.q && i.a, k + ' exit q·a 누락'));
    ok(e.data.self.length === 3, k + ' 신호등 ' + e.data.self.length);
  });
});
T('leveled = 기본·도전·심화 3수준 · 심화 open (전 항목 1개 — 묶음이 없다)', () => {
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
  /* 🚨 사회 u1은 `individual`을 쓴다(l03 장소 카드 · l06 그림일기 = 저마다 만드는 활동).
     ⚠️ **엔진 `typeLabel`에는 pair·group·whole 셋뿐이라 individual은 라벨이 없다** —
        `d.tag || typeLabel[type] || '교실에서 함께 해요'` 폴백으로 떨어진다(실렌더 확인 아래).
        깨지지는 않지만 개인 활동에 「함께」 라벨이 붙는다 — 엔진에 라벨을 더할 자리다(이월). */
  const TYPES = ['pair', 'group', 'whole', 'individual'];
  KEYS.forEach(k => {
    const of = L[k].slides.filter(s => s.block === 'offline_activity');
    ok(of.length === 1, k + ' offline ' + of.length);
    of.forEach(s => {
      ok(TYPES.includes(s.data.type), k + ' type ' + s.data.type);
      ok(s.data.steps.length >= 3, k + ' steps');
      ok(s.data.materials.length >= 2, k + ' materials');
      ok(s.data.minutes >= 8, k + ' minutes ' + s.data.minutes);
    });
  });
  const ind = KEYS.filter(k => L[k].slides.find(s => s.block === 'offline_activity').data.type === 'individual');
  ok(ind.length === 2 && ind[0] === 'u1_l03' && ind[1] === 'u1_l06',
     'individual 자리 ' + ind.join(',') + ' (l03·l06 둘이어야 — 아래 폴백 단언의 전제다)');
});
T('🚨 individual은 엔진 라벨이 없다 — 폴백이 실제로 뜬다 (undefined 노출 0 · 실렌더)', () => {
  const w3 = boot();
  openAs(w3, 'u1_l03');
  const idx = L['u1_l03'].slides.findIndex(s => s.block === 'offline_activity');
  const nb = w3.document.getElementById('next-btn');
  for (let i = 0; i < idx; i++) nb.dispatchEvent(new w3.Event('click', { bubbles: true }));
  const html = w3.document.getElementById('slide-content').innerHTML;
  ok(/i-offline-card/.test(html), 'offline 카드가 안 그려졌다');
  ok(!/undefined/.test(html), '라벨이 undefined로 샜다 — 엔진 폴백이 죽었다');
  ok(/교실에서 함께 해요/.test(html),
     'individual 폴백 라벨이 바뀌었다 — 엔진에 individual 라벨이 생겼다면 이 단언을 갱신할 것');
});
T('meta 정합 (grade·subject·unit·n·theme·live_url·본차시 실존)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(m.grade === 3 && m.subject === '사회' && m.unit === 1, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 우리 동네 탐험대', k + ' theme ' + m.theme + ' (과학의 한살이 탐험대를 복제했는지)');
    ok(/^\.\.\/\.\.\/grade3\/semester1\/social\/1단원_/.test(m.live_url), k + ' live_url ' + m.live_url);
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
    ok(path.basename(f) === SFILE[k], k + ' live_url이 SFILE과 다르다');
  });
});
T('CURRICULUM ↔ LESSONS 정합 (u1 블록 13항목 · ready 13 · n 목록 1~13 연속)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u2가 붙는 순간 무너진다.
     ⚠️ 머리 주석에도 「ready: true」가 적혀 있다 — 블록으로 잘라 세지 않으면 15가 나온다. */
  const blk = (CURRIC_SRC.match(/unit:\s*1,[\s\S]*?(?=unit:\s*2,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 1 블록 없음');
  ok(/lesson_count:\s*13/.test(blk), 'lesson_count 13 아님');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok(ns.length === 13 && ns[0] === 1 && ns[12] === 13, 'n 목록이 1~13 연속이 아니다');
  ok((blk.match(/ready:\s*true/g) || []).length === 13, 'ready 13 아님');
  ok(!/unit:\s*2/.test(blk), 'u1 블록이 u2를 먹었다');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u1 하나) · u2 미리 생김 0', () => {
  ok(/<script src="data\/g3_social_u1\.js"><\/script>/.test(HOME),
     'u1 script 태그가 닫는 태그까지 성립하지 않는다');
  ok(!/g3_social_u2\.js/.test(HOME), 'u2 배선이 미리 생겼다');
  const open = (HOME.match(/<script[\s>]/g) || []).length;
  const close = (HOME.match(/<\/script>/g) || []).length;
  ok(open === close, 'script 여닫이 개수 불일치 ' + open + '/' + close);
});
T('홈 slug · 과목 · 복제 원본(과학) 잔재 0', () => {
  ok(/slug:\s*"g3_social"/.test(HOME), 'slug 어긋남');
  ok(/subject:\s*"사회"/.test(HOME), 'subject 어긋남');
  ok(!/g3_science|g3_korean|g3_math/.test(HOME), '다른 과목 파일 잔재');
  const noComment = HOME.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ['과학', '국어', '수학'].forEach(w => {
    const hit = (noComment.match(new RegExp(w, 'g')) || []);
    ok(hit.length === 0, '렌더 대상에 ' + w + ' 잔재 ' + hit.length + '건');
  });
  ok(/사회/.test(noComment), '사회 표기가 없다');
  /* ⚠️ 과학 홈 머리 주석의 「묶음 차시는 시작 번호 하나로 등재」를 **선언으로** 복제하면
     사회에서는 거짓말이 된다(묶음 0). 홈은 그 문구를 **「복제하지 말 것」 경고 안에서만** 쓴다 —
     경고문까지 통째로 금지하면 다음 사람이 그 교훈을 잃는다. 두 갈래를 갈라 잰다. */
  HOME.split('\n').filter(ln => /묶음 차시는 시작 번호/.test(ln)).forEach(ln =>
    ok(/복제하지 말 것/.test(ln), '묶음 주석이 경고가 아니라 선언으로 적혀 있다: ' + ln.trim()));
  ok(/묶음\(2차시\) 차시가 하나도 없다|묶음 0/.test(HOME), '홈이 묶음 0을 밝히지 않는다');
});
T('⚠️ 허브 "3_social" 등재 (units 1 · lessons 13) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_social":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_social 미등재');
  ok(+m[1] === 1, 'units ' + m[1]);
  ok(+m[2] === 13, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이다. 사회 u1은 항목 13 = 차시 13이라 둘이 같아 안 보일 뿐 —
     u2가 붙을 때 반드시 항목 수 쪽으로 올릴 것. */
  ok(+m[2] === KEYS.length, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] === KEYS.reduce((a, k) => a + (L[k].meta.covers.includes('·') ? 2 : 1), 0),
     '항목 수와 차시 수가 갈렸다 — 묶음이 생겼으면 항목 수로 적을 것');
  ok(/id:\s*"social"/.test(HUB), '허브 SUB_HIGH에 사회가 없다');
  ok(/"3_social":\s*\{[^}]*file:\s*"g3_social\.html"/.test(HUB), '허브 file 경로 어긋남');
});
T('⚠️ 허브 옆 줄 무영향 회귀 (3_korean 6/45 · 3_math 7/55 · 3_science 4/37)', () => {
  const k = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(k && +k[1] === 6 && +k[2] === 45, '3_korean 카운트가 흔들렸다');
  const t = HUB.match(/"3_math":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(t && +t[1] === 7 && +t[2] === 55, '3_math 카운트가 흔들렸다');
  const s = HUB.match(/"3_science":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(s && +s[1] === 4 && +s[2] === 37, '3_science 카운트가 흔들렸다');
});
T('케이랩 매핑 없음 = 의도적 (동네 걷기·종이 지도가 화면 교구보다 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_social_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '박음', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (발표·소개 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
});
T('채움말 "자리" 0 (보호 어휘 = 그 자리에서·이 자리에서·그 자리를·한자리에·자리를 만들어)', () => {
  /* ⚠️ 사회는 장소 단원이라 「자리」가 실제 뜻으로 자주 쓰인다 — 아래 다섯은 채움말이 아니다.
        · 「그/이 자리에서」 = 그 대목에서 바로(교사 안내) · 「그 자리를 지키고」 = 소방서가 지키는 곳
        · 「한자리에 모아」 = 한 곳에 모아(단원 정리) · 「자리를 만들어」 = 의논할 모임을 열어
     ⚠️ 보호 어휘는 **실존까지 함께 잰다** — 목록만 넓히면 가드가 조용히 죽는다. */
  /* ⚠️ 잡은 조각만 보면 안 된다 — 「자리를 만들어」는 잡은 조각이 「…자리를」에서 끊겨
     보호 목록에 안 걸린다. **앞뒤를 함께 뜬 문맥**으로 판정한다(6차에 밟은 자리). */
  const SAFE = /그 자리에서|이 자리에서|그 자리를|한자리에|자리를 만들어/;
  const hit = [...BODY.matchAll(/[가-힣 ]{0,8}자리[가-힣 ]{0,6}/g)]
    .map(m => m[0]).filter(s => !SAFE.test(s));
  ok(hit.length === 0, hit.join(' / '));
  ['한자리에', '그 자리를'].forEach(w =>
    ok(BODY.includes(w), '보호 어휘 「' + w + '」가 사라졌다 — 보호 목록 재검토'));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
