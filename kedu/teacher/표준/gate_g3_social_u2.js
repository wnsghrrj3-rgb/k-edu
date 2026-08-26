/* gate_g3_social_u2.js — 케이티처 g3 사회 u2 「일상에서 만나는 과거」 게이트.
   40분 표준 v2 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ gate_g3_social_u1.js 복제. **u1과 갈리는 자리가 여섯**이다. 복제할 사람은 먼저 읽을 것.

   (🚨 갈림 ① — 이 단원 최대 자리) **사회에 앞 단원이 생겼다.**
       `u2_l01.review.from = "u1_l13"` — 단원을 넘어 받는다.
       → **`data/g3_social_u1.js`를 동반 로드**해야 하고 부팅 뒤
         `Object.keys(LESSONS).length === 31`(13+18)이다.
       🚨 u1 게이트의 「다른 단원 0」·「단원을 넘는 계보 0」 두 줄을 복제하면 **통째로 죽는다**.
          계보 = u1_l13 ← l01 ← … ← l18 (**18연쇄 · 단원을 넘는 자리는 l01 하나**).
   (🚨 갈림 ②) **마무리 자리가 셋이다.** l06 = 소단원 ① · l12 = 소단원 ② · l18 = 2단원 정리.
       u1은 둘이었다 — 「둘」을 복제하면 하나가 조용히 빈다.
   (🚨 갈림 ③) **성취기준 세 갈래 · 혼재 0**: `[4사02-01]` = l01~l06 ·
       `[4사02-02]` = l07~l12 · `[4사02-03]` = l13~l18.
       ⚠️ 접두(`[4사02-`)로는 **셋이 갈리지 않는다** — 갈래별 키 목록으로 못 박는다.
   (🚨 갈림 ④) **전 항목 review**. u1은 l01만 review가 없었다(첫 단원) —
       그 줄을 복제하면 죽는다. concept는 전 항목 셋 · basic 셋(넷으로 짜면 20슬로 터진다).
   (🚨 갈림 ⑤) **선행 가드 열일곱 · 뒤집힌 것이 열둘**(전수 실측).
       ✗ 「조사」로 l03 못 건다(l02가 먼저) · ✗「연표」로 l04 못 건다(l03) ·
       ✗「증언」으로 l09 못 건다(l08) · ✗「옛이야기」로 l14 못 건다(l09) ·
       ✗「영상」으로 l17 못 건다(l13) · ✗「전시관」으로 l11 못 건다(l10) ·
       ✗「지도」·「기록」으로 l13 못 건다(l03) · ✗「단서」·「생활 모습」으로 l12 못 건다(l07) ·
       ✗「쓰임」으로 l11 못 건다(l08) · ✗「사진」·「변화」로는 아무것도 못 건다(l02부터).
       🚨 **「지역」이 l12에서 처음 나온다** — l01~l11 학생 화면에 한 번이라도 쓰면 통째로 레드다
          (그 앞에서는 「우리가 사는 곳」·「동네」·「마을」로 쓴다).
          **「우리 지역」은 l13이 처음**이라 l12에서도 못 쓴다.
       ⚠️ 「띠」는 **한 글자 가드**다 — 그 글자를 품은 다른 낱말(허리띠·머리띠·띠다)이
          앞 차시에 새면 통째로 죽는다. u1의 「무조건」 자리와 같은 계열로 안전장치를 둔다.
   (🚨 갈림 ⑥) **채움말 「자리」의 보호 어휘가 없다.** 본차시 18파일에 「자리」가 **0건**이라
       u1의 보호 목록(그 자리에서·한자리에 …)을 복제하면 **실존 단언이 먼저 운다**.
       이 단원은 0으로 간다.
   (검산기 여섯 — 전부 「대상 N건 실존」 + 「갈래 실존」 동반 · 꼬리를 전부 갈랐다)
       D-2 시간 판정   `어제 — 과거를 나타내요`   (7건 · 세 갈래) · 꼬리 「를 나타내요」
       D-3 물건 쓰임   `맷돌 — 곡식을 가는 물건`  (4건)          · 꼬리 「는 물건」
       D-4 옛↔오늘 짝  `맷돌 — 믹서기가 대신해요` (2건)          · 꼬리 「가 대신해요」
       D-5 알아보는 길 `옛 신문 — 읽고 아는 길`   (8건 · 세 갈래) · 꼬리 「아는 길」
       D-6 연표 차례   `자료 모으기 — 1단계`      (4건)          · 꼬리 「단계」
       D-7 땅 이름     `밤골 — 밤나무가 많던 곳`  (3건)          · 꼬리 「던 곳」
       🚨 **D-3과 D-4는 왼쪽 항이 겹친다**(맷돌·다듬이). 꼬리가 갈렸는지는 원문을 다시 긁지 말고
          **파싱 결과 집합끼리** 견주어 잠근다(7차 교훈 — 정규식으로 짜면 두 번 죽는다).
       ⚠️ D-4 근거는 본차시에 **둘뿐**이다(맷돌↔믹서기 · 다듬이↔전기다리미). 셋째 짝을 지어내면
          이 표가 먼저 운다.
   ⚠️ 상표 24종 — 영상 차시(l17)가 있어 가장 위험한데 **본차시가 이미 0건**이다(전수 실측).
   ⚠️ 미도입 20종. 🚨 **「도시」·「역사」·「세기」는 넣지 말 것** — 공백 지운 본차시에서
      「학교도 시간이」가 「도시」로, 「몇 개인지 세기」가 「세기」로 걸린다(오탐 실측).
   ⚠️ **「박수」는 본차시 l17에 실존한다** — 케이티처는 「손뼉」으로 쓰고, 가드는 케이티처 본문에만
      건다. 본차시 실존을 역단언으로 잠근다(사라지면 「손뼉」 규약이 뜻을 잃는다).
   ⚠️ 게이트에 데이터 md5를 박지 말 것 — 생성기를 고치면 즉시 깨진다.
      재현성은 `python3 scripts/gen_g3_social_u2.py`를 두 번 돌려 재는 것이 옳다.
   ⚠️ 본차시 근거 대조는 **`sq()`(공백 제거) 한 갈래**로만 한다. 🚨 `<script>`를 지우면
      본문이 통째로 사라진다 — 사회 본차시는 본문을 script 안 템플릿 문자열로 쓴다(5차 실측).
   ⚠️ CURRICULUM 슬라이싱은 다음 unit 앞에서 끊는 **전방탐색**으로 짠다(u3 대비).
   ⚠️ 허브 카운트는 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을 **함께** 둔다.
      lessons = **항목 수 합**(13+18=31)이지 차시 수가 아니다 — 사회는 묶음이 0이라 둘이 같을 뿐.
      🚨 이 수를 올리면 `gate_g3_social_u1.js`의 허브 단언이 즉시 깨진다 — 함께 올릴 것.
   ⚠️ jsdom은 세션마다 새로 깔아야 한다.
   ⚠️ 게이트는 **k-edu 클론에서 돌릴 것** — handoff에는 `grade3/`가 없어 본차시 대조가 죽는다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_social_u2.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const V3CSS = fs.readFileSync(path.join(TDIR, 'engine/teacher-v3.css'), 'utf8');
/* 🚨 u1과 갈리는 최대 자리 — 앞 단원 동반 로드. u2_l01의 review가 u1_l13을 넘어 받는다.
   u1 게이트에는 없는 줄이다. 지우면 계보 검사가 통째로 죽는다. */
const DATA1 = fs.readFileSync(path.join(TDIR, 'data/g3_social_u1.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_social_u2.js'), 'utf8');
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
/* 🚨 `<script>`를 지우지 않는다 — 사회 본차시는 본문을 script 안 템플릿 문자열로 쓴다. */
const sq = (h) => h.replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');
const NOSTAR = BODY.replace(/\*/g, '');   /* 굵게 표시를 지운 갈래 — 본문 대조용 */

/* ⚠️ 18항목 18차시. **묶음 0** — 키가 l01~l18로 끊김 없이 이어진다(META 전수 실측). */
const KEYS = [];
for (let n = 1; n <= 18; n++) KEYS.push('u2_l' + String(n).padStart(2, '0'));
const NS = {};
KEYS.forEach((k, i) => { NS[k] = i + 1; });
const PAIRED = [];                 /* 🚨 묶음 0 — 없음을 거꾸로 못 박는다 */
const SINGLE = KEYS.slice();
const SKIPPED = [];                /* 🚨 건너뛰는 키 0 */
/* 🚨 소단원 **셋** · 성취기준 **셋** (전수 실측 · 접두로는 안 갈린다) */
const SUB1 = KEYS.slice(0, 6);     /* ① 시간의 흐름 */
const SUB2 = KEYS.slice(6, 12);    /* ② 과거의 모습 */
const SUB3 = KEYS.slice(12, 18);   /* ③ 지역의 변화 */
const STD_A = SUB1, STD_B = SUB2, STD_C = SUB3;
const CLOSERS = ['u2_l06', 'u2_l12', 'u2_l18'];   /* 🚨 마무리 자리가 **셋**이다 */

/* 학생 본차시 원문 = 인용 대조의 단일 정답. 키 번호와 파일 번호가 1:1로 같다. */
const SDIR = path.join(ROOT, 'grade3/semester1/social/2단원_일상에서만나는과거');
const SFILE = {
  u2_l01: 'g3_social_u2_l01_시간을나타내는말.html',
  u2_l02: 'g3_social_u2_l02_중요한일.html',
  u2_l03: 'g3_social_u2_l03_조사하기.html',
  u2_l04: 'g3_social_u2_l04_연표만들기.html',
  u2_l05: 'g3_social_u2_l05_연표만들기실습.html',
  u2_l06: 'g3_social_u2_l06_단원정리.html',
  u2_l07: 'g3_social_u2_l07_옛생활단서.html',
  u2_l08: 'g3_social_u2_l08_오래된물건.html',
  u2_l09: 'g3_social_u2_l09_자료와증언.html',
  u2_l10: 'g3_social_u2_l10_자료분석.html',
  u2_l11: 'g3_social_u2_l11_전시관꾸미기.html',
  u2_l12: 'g3_social_u2_l12_과거정리.html',
  u2_l13: 'g3_social_u2_l13_지역옛모습.html',
  u2_l14: 'g3_social_u2_l14_옛이야기.html',
  u2_l15: 'g3_social_u2_l15_여러자료.html',
  u2_l16: 'g3_social_u2_l16_지역조사.html',
  u2_l17: 'g3_social_u2_l17_영상표현.html',
  u2_l18: 'g3_social_u2_l18_2단원정리.html'
};
const SRC = {};
KEYS.forEach(k => { SRC[k] = fs.readFileSync(path.join(SDIR, SFILE[k]), 'utf8'); });
const TXT = {};
KEYS.forEach(k => { TXT[k] = txt(SRC[k]); });
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
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('window.LESSONS = window.LESSONS || {};');
  /* 🚨 앞 단원 동반 로드 — u2_l01 review가 u1_l13을 받는다 */
  w.eval(DATA1); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:3,subject:"사회",title:"3학년 1학기 사회",brand:"케이티처",slug:"g3_social"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
  return w;
}

/* ⚠️ 홈 → 차시 진입을 **엔진이 실제로 여는 차시**로 확인한다.
   렌더 길이만 재면 openShow가 실패해도 앞 차시 화면이 남아 조용히 초록이 난다(과학 u4 실측). */
function openAs(w, key) {
  w.Teacher.backToHome();
  w.Teacher.openShow('2', String(NS[key]));
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
eval(DATA1);
eval(DATA);
const L = global.window.LESSONS;

/* 🚨🚨 키 집합 선점검 — 라이브 버그(항목 순번 키)를 잡는 그물은 여기여야 한다.
   ⚠️ A 섹션까지 미루면 안 된다: 바로 아래 STUDENT·TNOTE가 L[k]를 곧바로 읽으므로
      키가 하나라도 어긋나면 **단언이 아니라 TypeError로 죽어** 「N 통과 / M 실패」 줄
      자체가 안 나온다(과학 u4 역검증 ⑦ 실측). */
console.log('═══ @. 키 집합 선점검 (파생 상수보다 먼저) ═══');
T('🚨🚨 u2 키 집합이 KEYS와 정확히 같다 — 항목 순번으로 붙이면 여기서 잡힌다', () => {
  const got = Object.keys(L).filter(k => /^u2_/.test(k)).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS),
     '키 집합 어긋남 — 빠진 키 [' + KEYS.filter(k => !got.includes(k)).join(',') +
     '] · 군더더기 키 [' + got.filter(k => !KEYS.includes(k)).join(',') + ']');
  KEYS.forEach(k => ok(L[k] && Array.isArray(L[k].slides) && L[k].slides.length,
    k + ' 항목이 비었다 — 키는 있는데 slides가 없다'));
});
T('🚨 앞 단원 u1 13항목도 함께 실려 있다 — l01 review가 u1_l13을 받는다', () => {
  const g1 = Object.keys(L).filter(k => /^u1_/.test(k)).sort();
  ok(g1.length === 13, 'u1 항목 ' + g1.length + ' — DATA1 동반 로드 줄을 지웠는지 확인');
  ok(L['u1_l13'] && L['u1_l13'].slides.some(s => s.block === 'exit_ticket'),
     'u1_l13 exit가 없다 — 계보의 뿌리가 사라졌다');
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
const inSrc = (k, s) => ok(SQ[k].includes(sq(s)), k + ' 본차시 근거 없음: ' + s);
const inBody = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const both = (k, s) => { inSrc(k, s); inBody(s); };

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('🚨 부팅 + u2 18항목 로드 — **앞 단원 동반 로드 있음**(u1 13 + u2 18 = 31)', () => {
  W = boot();
  const k2 = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(k2.length === 18, 'u2 항목 ' + k2.length);
  const k1 = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(k1.length === 13, 'u1 동반 로드 ' + k1.length + ' — DATA1 줄이 살아 있는지 확인');
  ok(Object.keys(W.LESSONS).length === 31,
     '로드된 키 ' + Object.keys(W.LESSONS).length + ' (기대 31 = 13+18)');
  ok(!Object.keys(W.LESSONS).some(k => /^u3_/.test(k)), '엉뚱한 단원(u3)이 딸려 왔다');
});
T('🚨 키 번호 = 그 항목이 여는 차시 번호(n) — 이 단원은 둘이 같아서 안 보일 뿐이다', () => {
  KEYS.forEach(k => ok(k === 'u2_l' + String(L[k].meta.n).padStart(2, '0'),
    k + '의 키 번호가 n(' + L[k].meta.n + ')과 어긋난다 — 홈 카드가 엉뚱한 차시를 연다'));
  const ns = KEYS.map(k => L[k].meta.n);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map((_, i) => i + 1)), 'n 목록 ' + ns.join(','));
});
T('🚨 건너뛰는 키 0 · 묶음 0 — l01~l18이 끊김 없이 이어진다 (없음을 거꾸로 못 박는다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u2_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  ok(SKIPPED.length === 0, '건너뛴 키가 생겼다 ' + SKIPPED.join(','));
  ok(PAIRED.length === 0, '묶음이 생겼다 ' + PAIRED.join(','));
  for (let n = 1; n <= 18; n++) ok(!!L['u2_l' + String(n).padStart(2, '0')], 'l' + n + ' 자리가 비었다');
  ok(!L['u2_l19'], '단원 밖 키가 생겼다: u2_l19');
});
T('⚠️ SFILE 매핑 — 키 번호와 파일 번호가 1:1로 같다 (과학 u4처럼 어긋나지 않는다)', () => {
  KEYS.forEach(k => ok(SFILE[k].includes('_' + k.slice(3) + '_'),
    k + '의 근거 파일이 같은 번호가 아니다: ' + SFILE[k]));
  ok(Object.keys(SFILE).length === 18, 'SFILE ' + Object.keys(SFILE).length + '개');
  KEYS.forEach(k => ok(fs.existsSync(path.join(SDIR, SFILE[k])), '본차시 파일 없음 ' + SFILE[k]));
});
T('🚨 본차시 sq()가 살아 있다 — script를 지우면 본문이 통째로 사라진다 (5차 실측 자리)', () => {
  KEYS.forEach(k => ok(SQ[k].length > 3000, k + ' 본차시 sq 길이 ' + SQ[k].length + ' — script를 지웠는지 확인'));
  const killed = SRC['u2_l01'].replace(/<script[\s\S]*?<\/script>/g, '');
  ok(sq(killed).length < SQ['u2_l01'].length / 2,
     'script를 지워도 본문이 남는다 — 이 단언은 본차시가 script 안에 본문을 쓸 때만 뜻이 있다');
});
T('🚨 본차시 META가 소단원 셋을 선언한다 (조사하지 말고 소스를 읽어라 — 5차 최대 교훈)', () => {
  const grab = (k) => (SRC[k].match(/const META\s*=\s*"([^"]*)"/) || [, ''])[1];
  KEYS.forEach(k => ok(grab(k), k + ' 본차시에 const META가 없다 — 차시 판정 근거가 사라졌다'));
  SUB1.forEach(k => ok(/시간의 흐름/.test(grab(k)), k + ' META 소단원 ①이 아니다: ' + grab(k)));
  SUB2.forEach(k => ok(/과거의 모습/.test(grab(k)), k + ' META 소단원 ②가 아니다: ' + grab(k)));
  SUB3.forEach(k => ok(/지역의 변화/.test(grab(k)), k + ' META 소단원 ③이 아니다: ' + grab(k)));
  /* 범위 꼴(「5·6차시」)이 하나도 없다 = 묶음 0의 근거 */
  /* ⚠️ 범위 꼴 = 「5·6차시」처럼 **숫자 사이**에 구분자가 낀 것이다.
     META는 늘 「… · N차시」로 끝나므로 `[·~]\s*\d+차시`로 걸면 정상 META가 통째로 걸린다. */
  KEYS.forEach(k => ok(!/\d+\s*[·~]\s*\d+\s*차시/.test(grab(k)),
    k + ' META에 범위 꼴이 있다 — 묶음이 생겼다: ' + grab(k)));
  /* META가 선언한 차시 번호가 소단원 안에서 1~6으로 이어진다 */
  [SUB1, SUB2, SUB3].forEach((sub, i) => {
    const ns = sub.map(k => +(grab(k).match(/(\d+)차시/) || [, 0])[1]);
    ok(JSON.stringify(ns) === JSON.stringify([1, 2, 3, 4, 5, 6]),
       '소단원 ' + (i + 1) + ' META 차시 번호 ' + ns.join(',') + ' (1~6 연속이어야)');
  });
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
T('🚨 홈 카드 열여덟이 저마다 제 차시를 연다 (엉뚱한 차시·안 열림 0)', () => {
  KEYS.forEach(k => openAs(W, k));
});
KEYS.forEach(k => {
  T(k + ' 7요소 실렌더', () => {
    const html = renderAll(W, k, L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    ok(!/이 슬라이드를 그리지 못했어요/.test(html), '오류 카드 검출');
    const blocks = L[k].slides.map(s => s.block);
    const need = ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception',
                  'basic_problem', 'leveled_problem', 'offline_activity', 'real_world',
                  'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
    need.forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('🚨 전 항목 review — u1의 「l01만 review 없음」을 복제하면 죽는다 · concept 셋 · basic 셋', () => {
  KEYS.forEach(k => {
    ok(L[k].slides.some(s => s.block === 'review'),
       k + ' review 없음 — u2는 앞 단원이 있어 l01도 review를 받는다');
    const c = L[k].slides.filter(s => s.block === 'concept').length;
    ok(c === 3, k + ' concept ' + c + ' (셋이어야 — u1_l01의 넷은 review 자리를 메운 것이다)');
    const b = L[k].slides.filter(s => s.block === 'basic_problem').length;
    ok(b === 3, k + ' basic ' + b + ' (셋이어야 19슬로 떨어진다 — 넷으로 짜면 20슬로 터진다)');
  });
});
T('img 폴백 경로 실존 (18개 미생성 = 폴백 정상 · 경로 중복 0)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/social\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
  const ids = KEYS.map(k => L[k].slides.find(s => s.data && s.data.img).data.img);
  ok(new Set(ids).size === 18, 'img 경로 중복 — 단원 안에서 갈라져야 한다');
  /* ⚠️ u1의 경로를 복제하면 두 단원이 같은 사진을 쓴다 */
  const u1img = new Set(Object.keys(L).filter(k => /^u1_/.test(k))
    .map(k => { const m = L[k].slides.find(s => s.data && s.data.img); return m ? m.data.img : ''; }));
  const dup = ids.filter(x => u1img.has(x));
  ok(dup.length === 0, 'u1과 같은 img 경로를 쓴다: ' + dup.join(','));
});

console.log('═══ C. 회귀 (18항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, k, 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (sq 갈래) ═══');
const QUOTE = {
  u2_l01: ['과거', '현재', '미래'],
  u2_l02: ['중요한 일', '태어난 날', '입학'],
  u2_l03: ['조사', '면담', '기록'],
  u2_l04: ['연표', '있었던 일', '순서'],
  u2_l05: ['자료 모으기', '순서 정하기', '꾸미기'],
  u2_l06: ['타임캡슐', '연표', '시간을 나타내는 말'],
  u2_l07: ['옛 사진', '옛 건축물', '오래된 물건'],
  u2_l08: ['맷돌', '다듬이', '쓰임'],
  u2_l09: ['옛 신문', '증언', '자료'],
  u2_l10: ['살펴', '정리', '자료'],
  u2_l11: ['전시', '명패', '주제'],
  u2_l12: ['단서', '정리', '전시'],
  u2_l13: ['옛 사진과 지도', '어른의 증언', '영상 자료'],
  u2_l14: ['입에서 입으로 전해 온 이야기', '땅 이름', '밤나무가 많던'],
  u2_l15: ['여러 자료를 함께 보면', '신문·기록 자료', '움직임과 소리로 생생하게'],
  u2_l16: ['조사 계획', '조사 보고서', '문화 해설사'],
  u2_l17: ['차례 정하기', '자막', '친구에게 소개하기'],
  u2_l18: ['시간의 흐름', '지역의 달라진 모습', '축제']
};
KEYS.forEach((k, i) => {
  T('인용 ' + String(i + 1).padStart(2, '0') + ' ' + k + ' 원문 일치', () => {
    ok(QUOTE[k] && QUOTE[k].length === 3, k + ' 인용 갈래가 셋이 아니다');
    QUOTE[k].forEach(s => both(k, s));
  });
});

console.log('═══ D-2. 시간 판정 검산기 (세 갈래 · 대상 7건 · l01) ═══');
const TIME2 = { '어제': '과거', '옛날': '과거', '작년': '과거',
                '오늘': '현재', '지금': '현재', '내일': '미래', '앞으로': '미래' };
const RE_D2 = /([가-힣]{2,3}) — (과거|현재|미래)를 나타내요/g;
const T2 = [...NOSTAR.matchAll(RE_D2)].map(m => [m[1], m[2]]);
T('🚨 D-2 대상 7건 실존 (대상 0건에서 사이좋게 초록이 나는 것을 막는다)', () => {
  ok(T2.length >= 7, '대상 ' + T2.length + '건 (7 이상이어야)');
  ok(new Set(T2.map(x => x[0])).size >= 7, '왼쪽 항이 겹친다 ' + T2.map(x => x[0]).join(','));
});
T('D-2 전수 판정 일치 (진리표 7)', () => {
  T2.forEach(([l, r]) => ok(TIME2[l] === r,
    '「' + l + ' — ' + r + '를 나타내요」 (기대 ' + TIME2[l] + ')'));
});
T('⚠️ D-2 세 갈래가 다 있다 (한 갈래만이면 판별력 0)', () => {
  ['과거', '현재', '미래'].forEach(g =>
    ok(T2.some(x => x[1] === g), '갈래 「' + g + '」가 없다'));
  ok(new Set(Object.values(TIME2)).size === 3, '진리표 갈래 ' + new Set(Object.values(TIME2)).size);
});
T('D-2 본차시 근거 — l01이 과거·현재·미래를 실제로 가르친다', () => {
  ['과거', '현재', '미래'].forEach(w => ok(SQ['u2_l01'].includes(w), '본차시 l01에 없음: ' + w));
  Object.keys(TIME2).forEach(w => ok(SQALL.includes(w), '본차시 전체에 없는 낱말: ' + w));
});

console.log('═══ D-3. 물건 쓰임 검산기 (대상 4건 · l08) ═══');
const USE3 = { '맷돌': '곡식을 가', '다듬이': '옷의 구김을 펴', '가마솥': '밥을 짓', '재봉틀': '옷을 짓' };
const RE_D3 = /([가-힣]{2,4}) — ([가-힣 ]{2,12}?)는 물건/g;
const U3 = [...NOSTAR.matchAll(RE_D3)].map(m => [m[1], m[2].trim()]);
T('🚨 D-3 대상 4건 실존 · 네 물건이 다 선다', () => {
  ok(U3.length >= 4, '대상 ' + U3.length + '건 (4 이상이어야)');
  ok(new Set(U3.map(x => x[0])).size >= 4, '네 물건이 다 서지 않았다 ' + U3.map(x => x[0]).join(','));
});
T('D-3 전수 판정 일치 (진리표 4)', () => {
  U3.forEach(([l, r]) => ok(USE3[l] === r, '「' + l + ' — ' + r + '는 물건」 (기대 ' + USE3[l] + ')'));
});
T('D-3 본차시 근거 — l08이 맷돌·다듬이의 쓰임을 실제로 가르친다', () => {
  ['맷돌', '다듬이', '쓰임'].forEach(w => ok(SQ['u2_l08'].includes(w), '본차시 l08에 없음: ' + w));
});

console.log('═══ D-4. 옛↔오늘 짝 검산기 (대상 2건 · l08) ═══');
const NOW4 = { '맷돌': '믹서기', '다듬이': '전기다리미' };
const RE_D4 = /([가-힣]{2,4}) — ([가-힣]{2,6})가 대신해요/g;
const N4 = [...NOSTAR.matchAll(RE_D4)].map(m => [m[1], m[2]]);
T('🚨 D-4 대상 2건 실존 — ⚠️ 본차시 근거는 둘뿐이다 (셋째 짝을 지어내면 여기가 운다)', () => {
  ok(N4.length >= 2, '대상 ' + N4.length + '건 (2 이상이어야)');
  ok(new Set(N4.map(x => x[0])).size === 2, '두 짝이 다 서지 않았다 ' + N4.map(x => x[0]).join(','));
  ok(Object.keys(NOW4).length === 2, '진리표가 늘었다 — 본차시 근거를 다시 잴 것');
});
T('D-4 전수 판정 일치 (진리표 2)', () => {
  N4.forEach(([l, r]) => ok(NOW4[l] === r, '「' + l + ' — ' + r + '가 대신해요」 (기대 ' + NOW4[l] + ')'));
});
T('🚨🚨 D-3과 D-4는 왼쪽 항이 겹친다 — **파싱 결과 집합끼리** 견준다 (7차 최대 교훈)', () => {
  /* ⚠️ 원문을 정규식으로 다시 긁어 두 검산기가 부딪치는지 보면 두 번 죽는다(7차 실측).
     재는 자리는 낱말이 아니라 「검산기가 실제로 긁어낸 결과」다. */
  const pair = (a) => a.map(x => x.join('\u0001'));
  const inter = pair(U3).filter(x => pair(N4).includes(x));
  ok(inter.length === 0, '같은 쌍을 두 검산기가 잡았다 — 꼬리가 안 갈렸다: ' + inter.join(','));
  const l3 = new Set(U3.map(x => x[0])), l4 = new Set(N4.map(x => x[0]));
  const shared = [...l4].filter(x => l3.has(x));
  ok(shared.length === 2,
     '왼쪽 항이 겹치지 않는다 (' + shared.join(',') + ') — 꼬리를 가른 이유가 사라졌다');
  /* 꼬리가 실제로 갈렸는지 — 두 표지가 한 줄에 붙지 않는다 */
  ok(!/는 물건[^\n]{0,4}가 대신해요/.test(NOSTAR), '두 꼬리가 한 줄에 붙었다');
  ok(Object.keys(NOW4).every(k => k in USE3), '진리표 왼쪽 항 겹침이 사라졌다');
});

console.log('═══ D-5. 알아보는 길 검산기 (세 갈래 · 대상 8건 · l07·l09·l13) ═══');
const WAY5 = { '옛 사진': '보고', '옛 건축물': '보고', '오래된 물건': '보고', '영상': '보고',
               '옛 신문': '읽고', '옛 기록': '읽고', '어른 증언': '듣고', '옛이야기': '듣고' };
const RE_D5 = /([가-힣 ]{2,8}?) — (보고|읽고|듣고) 아는 길/g;
const W5 = [...NOSTAR.matchAll(RE_D5)].map(m => [m[1].trim(), m[2]]);
T('🚨 D-5 대상 8건 실존 · 여덟 길이 다 선다', () => {
  ok(W5.length >= 8, '대상 ' + W5.length + '건 (8 이상이어야)');
  ok(new Set(W5.map(x => x[0])).size >= 8, '여덟 길이 다 서지 않았다 ' + W5.map(x => x[0]).join(','));
});
T('D-5 전수 판정 일치 (진리표 8)', () => {
  W5.forEach(([l, r]) => ok(WAY5[l] === r, '「' + l + ' — ' + r + ' 아는 길」 (기대 ' + WAY5[l] + ')'));
});
T('⚠️ D-5 세 갈래가 다 있다 · 갈래마다 둘 이상', () => {
  ['보고', '읽고', '듣고'].forEach(g => {
    const n = W5.filter(x => x[1] === g).length;
    ok(n >= 2, '갈래 「' + g + '」 ' + n + '건 (둘 이상이어야 판별력이 산다)');
  });
});
T('D-5 본차시 근거 — l07·l09·l13이 저마다 제 길을 가르친다', () => {
  ['옛 사진', '옛 건축물'].forEach(w => ok(SQ['u2_l07'].includes(sq(w)), '본차시 l07에 없음: ' + w));
  ['옛 신문', '증언'].forEach(w => ok(SQ['u2_l09'].includes(sq(w)), '본차시 l09에 없음: ' + w));
  ok(SQ['u2_l13'].includes('영상'), '본차시 l13에 「영상」이 없다');
});

console.log('═══ D-6. 연표 차례 검산기 (대상 4건 · l05) ═══');
const STEP6 = { '자료 모으기': '1', '순서 정하기': '2', '띠에 적기': '3', '꾸미기': '4' };
const RE_D6 = /([가-힣 ]{2,10}?) — ([1-4])단계/g;
const S6 = [...NOSTAR.matchAll(RE_D6)].map(m => [m[1].trim(), m[2]]);
T('🚨 D-6 대상 4건 실존 · 네 걸음이 다 선다 (차례가 겹치지 않는다)', () => {
  ok(S6.length >= 4, '대상 ' + S6.length + '건 (4 이상이어야)');
  ok(new Set(S6.map(x => x[1])).size === 4, '네 걸음이 다 서지 않았다 ' + S6.map(x => x[1]).join(','));
});
T('D-6 전수 판정 일치 (진리표 4)', () => {
  S6.forEach(([l, r]) => ok(STEP6[l] === r, '「' + l + ' — ' + r + '단계」 (기대 ' + STEP6[l] + ')'));
});
T('D-6 본차시 근거 — l05가 연표 만드는 차례를 실제로 가르친다', () => {
  ['자료 모으기', '순서 정하기', '꾸미기'].forEach(w =>
    ok(SQ['u2_l05'].includes(sq(w)), '본차시 l05에 없음: ' + w));
});

console.log('═══ D-7. 땅 이름 검산기 (대상 3건 · l14) ═══');
const LAND7 = { '밤골': '밤나무가 많', '말죽거리': '말에게 죽을 먹이', '배다리': '배를 이어 다리를 놓' };
const RE_D7 = /([가-힣]{2,4}) — ([가-힣 ]{2,14}?)던 곳/g;
const D7 = [...NOSTAR.matchAll(RE_D7)].map(m => [m[1], m[2].trim()]);
T('🚨 D-7 대상 3건 실존 — ⚠️ 본차시 근거는 셋뿐이다 (넷째를 지어내면 여기가 운다)', () => {
  ok(D7.length >= 3, '대상 ' + D7.length + '건 (3 이상이어야)');
  ok(new Set(D7.map(x => x[0])).size === 3, '세 이름이 다 서지 않았다 ' + D7.map(x => x[0]).join(','));
  ok(Object.keys(LAND7).length === 3, '진리표가 늘었다 — 본차시 근거를 다시 잴 것');
});
T('D-7 전수 판정 일치 (진리표 3)', () => {
  D7.forEach(([l, r]) => ok(LAND7[l] === r, '「' + l + ' — ' + r + '던 곳」 (기대 ' + LAND7[l] + ')'));
});
T('D-7 본차시 근거 — l14가 땅 이름의 유래를 실제로 가르친다', () => {
  ['땅 이름', '밤나무가 많던'].forEach(w => ok(SQ['u2_l14'].includes(sq(w)), '본차시 l14에 없음: ' + w));
});
T('🚨 여섯 검산기의 꼬리가 전부 갈렸다 (서로의 정규식에 안 걸린다)', () => {
  const TAILS = ['를 나타내요', '는 물건', '가 대신해요', ' 아는 길', '단계', '던 곳'];
  ok(new Set(TAILS).size === 6, '꼬리가 겹친다');
  /* 각 검산기가 잡은 왼쪽 항 집합이 다른 검산기의 꼬리로도 잡히는지 — D-3·D-4만 겹쳐야 한다 */
  const sets = { D2: T2, D3: U3, D4: N4, D5: W5, D6: S6, D7: D7 };
  const names = Object.keys(sets);
  const overlaps = [];
  names.forEach((a, i) => names.slice(i + 1).forEach(b => {
    const la = new Set(sets[a].map(x => x[0])), lb = new Set(sets[b].map(x => x[0]));
    const sh = [...la].filter(x => lb.has(x));
    if (sh.length) overlaps.push(a + '×' + b + ':' + sh.join('/'));
  }));
  ok(JSON.stringify(overlaps) === JSON.stringify(['D3×D4:맷돌/다듬이']),
     '검산기 왼쪽 항 겹침이 예상과 다르다: ' + overlaps.join(' · '));
});

console.log('═══ E. 가드 (선행 17 · 역단언 12 · 상표 24 · 미도입 20 · 성취기준 세 갈래) ═══');
/* 🚨 살아남은 가드 열일곱 — 전수 실측으로 이것만 남았다(머리 주석 갈림 ⑤). */
const GUARD = {
  '앨범': 'u2_l02', '면담': 'u2_l03', '띠': 'u2_l04', '꾸미기': 'u2_l05',
  '타임캡슐': 'u2_l06', '건축물': 'u2_l07', '다듬이': 'u2_l08', '신문': 'u2_l09',
  '전시관': 'u2_l10', '명패': 'u2_l11', '지역': 'u2_l12', '우리 지역': 'u2_l13',
  '땅 이름': 'u2_l14', '보고서': 'u2_l15', '문화 해설사': 'u2_l16',
  '자막': 'u2_l17', '축제': 'u2_l18'
};
T('⚠️ 선행 용어 17갈래 — slides − next_lesson − review (예외 두 블록)', () => {
  ok(Object.keys(GUARD).length === 17, '가드 ' + Object.keys(GUARD).length + '갈래');
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
T('🚨🚨 「지역」이 l12에서 처음 나온다 — l01~l11에 한 번이라도 쓰면 통째로 레드다', () => {
  /* 그 앞에서는 「우리가 사는 곳」·「동네」·「마을」로 쓴다(본차시 규약 계승). */
  KEYS.slice(0, 11).forEach(k => {
    ok(!plain(studentSlides(k, false, false)).includes('지역'),
       k + ' 학생 화면에 「지역」이 있다 (도입 = u2_l12)');
  });
  ok(studentText('u2_l12').includes('지역'), 'l12에 「지역」 도입이 없다');
  /* 대신 쓰는 말이 실제로 살아 있다 — 지운 자리가 빈칸이 되면 안 된다 */
  const early = KEYS.slice(0, 11).map(studentText).join('\n');
  ok(/우리가 사는 곳|동네|마을/.test(early), '대신 쓰는 말(우리가 사는 곳·동네·마을)이 사라졌다');
});
T('🚨 「우리 지역」은 l13이 처음 — l12에서도 못 쓴다 (「지역」보다 한 칸 늦다)', () => {
  KEYS.slice(0, 12).forEach(k => {
    ok(!plain(studentSlides(k, false, false)).replace(/ /g, '').includes('우리지역'),
       k + ' 학생 화면에 「우리 지역」이 있다 (도입 = u2_l13)');
  });
  ok(studentText('u2_l13').replace(/ /g, '').includes('우리지역'), 'l13에 「우리 지역」 도입이 없다');
  ok(GUARD['지역'] === 'u2_l12' && GUARD['우리 지역'] === 'u2_l13',
     '두 가드의 자리가 바뀌었다 — 한 칸 차이가 이 단언의 전제다');
});
T('🚨 「띠」는 한 글자 가드 — 그 글자를 품은 다른 낱말이 앞 차시에 새면 통째로 죽는다', () => {
  /* u1의 「무조건 → 조건」 자리와 같은 계열이다.
     ⚠️ 흔한 한 글자를 가드로 쓸 때는 **그 글자를 품은 다른 낱말부터 grep할 것.** */
  const BAD = ['허리띠', '머리띠', '띠다', '띠고', '넥타이'];
  KEYS.filter(k => k < 'u2_l04').forEach(k => {
    const s = plain(studentSlides(k, false, false));
    BAD.forEach(w => ok(!s.includes(w),
      '「' + w + '」가 ' + k + '에 있다 — l04의 「띠」 가드가 통째로 죽는다'));
  });
  ok(GUARD['띠'] === 'u2_l04', '띠 가드 자리가 바뀌었다 — 이 단언의 전제가 흔들린다');
  /* 도입 뒤에는 「종이띠」처럼 품은 낱말이 정상적으로 산다는 역확인 */
  ok(/종이띠|띠에|띠를/.test(studentText('u2_l04')), 'l04에 띠 관련 표현이 없다');
});
/* 🚨 역단언 열둘 — 가드로 쓸 수 없는 낱말의 근거를 본차시에서 직접 잰다.
      이것이 가드 목록의 안전장치다: 본차시가 바뀌면 여기가 먼저 운다. */
const REV = [['조사', 'u2_l02'], ['사진', 'u2_l02'], ['변화', 'u2_l02'],
             ['연표', 'u2_l03'], ['지도', 'u2_l03'], ['기록', 'u2_l03'],
             ['단서', 'u2_l07'], ['생활 모습', 'u2_l07'],
             ['쓰임', 'u2_l08'], ['증언', 'u2_l08'],
             ['옛이야기', 'u2_l09'], ['영상', 'u2_l13']];
T('🚨 역단언 12 — 그럴듯한 낱말들이 왜 가드가 될 수 없는지 본차시에서 직접 잰다', () => {
  ok(REV.length === 12, '역단언 ' + REV.length + '건');
  REV.forEach(([w, k]) => ok(SQ[k].includes(sq(w)),
    '역단언 실패: 「' + w + '」가 본차시 ' + k + '에 없다 — 가드 목록을 다시 재야 한다'));
  REV.forEach(([w]) => ok(!(w in GUARD), '「' + w + '」를 가드 목록에 넣었다 — 본차시가 먼저 쓴다'));
  /* 그 낱말이 실제로 「도입보다 앞선 차시」에 있다는 것까지 — 이것이 뒤집힌 이유다 */
  REV.forEach(([w, k]) => {
    const later = KEYS.filter(x => x > k);
    ok(later.length > 0, k + ' 뒤에 차시가 없다 — 역단언이 뜻을 잃는다');
  });
});
T('🚨 next_lesson 예외 자리 열일곱 — 가드 낱말이 저마다 앞 차시 예고에 실존한다', () => {
  /* next를 가드에서 빼는 이유가 실제로 있는지 전수로 잰다.
     ⚠️ 예고가 사라지면 next를 뺄 이유도 사라진다 — 그때 이 줄이 먼저 운다. */
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson')).replace(/ /g, '');
  let hit = 0;
  Object.keys(GUARD).forEach(w => {
    const n = +GUARD[w].slice(-2);
    const prev = 'u2_l' + String(n - 1).padStart(2, '0');
    if (!L[prev]) return;
    ok(nx(prev).includes(w.replace(/ /g, '')),
       prev + ' next_lesson이 「' + w + '」를 예고하지 않는다 — next를 뺄 이유가 사라졌다');
    ok(!plain(studentSlides(prev, false, false)).replace(/ /g, '').includes(w.replace(/ /g, '')),
       prev + ' 본문에 「' + w + '」 선행');
    hit++;
  });
  ok(hit === 17, 'next 예외 자리 ' + hit + '곳 (열일곱이어야)');
});
T('⚠️ review 예외 자리 열둘 — 앞 차시 낱말이 review로 실제로 들어온다 (넓히면 죽는다)', () => {
  const rv = (k) => plain(L[k].slides.filter(s => s.block === 'review')).replace(/ /g, '');
  let hit = 0;
  Object.keys(GUARD).forEach(w => {
    const n = +GUARD[w].slice(-2);
    const next = 'u2_l' + String(n + 1).padStart(2, '0');
    if (!L[next]) return;
    if (rv(next).includes(w.replace(/ /g, ''))) {
      hit++;
      /* review 포함 갈래에서는 실제로 걸린다 = 좁힐 이유 */
      ok(plain(studentSlides(next, false, true)).replace(/ /g, '').includes(w.replace(/ /g, '')),
         next + ' review 포함 갈래에서 「' + w + '」가 안 걸린다 — 좁힐 이유가 사라졌다');
    }
  });
  ok(hit === 12, 'review 계승 자리 ' + hit + '곳 (열둘이어야 — 계보가 바뀌었는지 확인)');
});
T('⚠️ next_lesson 예고 역검사 (l06→건축물 · l12→지역 · l17→축제 · l18→다음 단원)', () => {
  const nx = (k) => plain(L[k].slides.filter(x => x.block === 'next_lesson'));
  ok(/건축물|과거의 모습/.test(nx('u2_l06')), 'l06 next_lesson이 소단원 ②를 예고하지 않음');
  ok(/지역/.test(nx('u2_l12')), 'l12 next_lesson이 소단원 ③을 예고하지 않음');
  ok(/축제|정리/.test(nx('u2_l17')), 'l17 next_lesson이 단원 정리를 예고하지 않음');
  ok(/앞으로|넓게|여러 모습/.test(nx('u2_l18')), 'l18이 다음을 예고하지 않는다');
});
T('🚨 상표 가드 24종 — 케이티처 0건 · 본차시도 0건 (영상 차시라 가장 위험한 자리)', () => {
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
  ok(STUDENT.includes('영상') && STUDENT.includes('누리집'), '일반명이 사라졌다');
});
T('미도입 갈래(4학년 이상·중등 소관) 학생 노출 0 (20종)', () => {
  /* 🚨 「도시」·「역사」·「세기」를 넣지 말 것 — 공백 지운 본차시에서
     「학교도 시간이」가 「도시」로, 「몇 개인지 세기」가 「세기」로 걸린다(오탐 실측). */
  const BAN = ['인구', '촌락', '행정', '지역사회', '공공기관', '민주주의', '자치',
               '조례', '세금', '위도', '경도', '축척', '등고선', '방위',
               '유물', '유적', '문화재', '연대', '왕조', '선사'];
  ok(BAN.length === 20, '미도입 목록 ' + BAN.length + '종');
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* ⚠️ 오탐 자리를 역으로 못 박는다 — 이 셋을 목록에 넣으면 즉시 레드가 난다 */
  ['도시', '역사', '세기'].forEach(w => ok(!BAN.includes(w),
    '「' + w + '」를 미도입 목록에 넣었다 — 공백 지운 본차시에서 오탐이 난다'));
  ok(STUDENT.includes('자료') && STUDENT.includes('과거'), '이 단원이 가르치는 낱말이 사라졌다');
});
T('⚠️ 성취기준 세 갈래 · 혼재 0 — 🚨 접두 검사로는 셋이 안 갈린다(키 목록으로 못 박는다)', () => {
  STD_A.forEach(k => ok(L[k].meta.std === '[4사02-01]', k + ' std ' + L[k].meta.std + ' (기대 [4사02-01])'));
  STD_B.forEach(k => ok(L[k].meta.std === '[4사02-02]', k + ' std ' + L[k].meta.std + ' (기대 [4사02-02])'));
  STD_C.forEach(k => ok(L[k].meta.std === '[4사02-03]', k + ' std ' + L[k].meta.std + ' (기대 [4사02-03])'));
  ok(STD_A.length === 6 && STD_B.length === 6 && STD_C.length === 6,
     '갈래 크기 ' + [STD_A, STD_B, STD_C].map(x => x.length).join('/'));
  ok(STD_A.concat(STD_B, STD_C).length === KEYS.length, '세 갈래가 18항목을 덮지 않는다');
  ok(new Set(KEYS.map(k => L[k].meta.std)).size === 3, '성취기준 갈래 수가 셋이 아니다');
  ok(!KEYS.some(k => /4과|4국|4수|4사01/.test(L[k].meta.std)), '다른 단원·과목 성취기준 잔재');
  /* 접두 검사가 왜 못 쓰는지 — 셋이 같은 접두를 쓴다는 역확인 */
  ok(KEYS.every(k => L[k].meta.std.startsWith('[4사02-')), '접두가 갈렸다 — 키 목록으로 짤 이유가 사라졌다');
});

console.log('═══ F. 구조 정합 ═══');
T('🚨 슬라이드 수 = 전 항목 19슬 (묶음 0 — 24슬·36슬 항목 0을 거꾸로 못 박는다)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === 19, k + ' ' + L[k].slides.length + '슬 (기대 19)'));
  ok(!KEYS.some(k => L[k].slides.length === 24), '2차시 묶음(24슬)이 생겼다');
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음(36슬)이 생겼다');
});
T('⚠️ 슬라이드 총합 342슬 (19×18) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 342, '총합 ' + tot);
  ok(tot === 19 * SINGLE.length + 24 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('extras 전 항목 20개 · 참조 무결성 · 중복 0 (총합 360)', () => {
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
  ok(tot === 360, 'extras 총합 ' + tot);
  ok(tot === 20 * KEYS.length, '부분 합 재계산 어긋남');
});
T('tnote 전 항목 10슬 (6슬 이상) · 구조 정합 (총 180슬 = 10×18)', () => {
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
  ok(tot === 180, 'tnote 총합 ' + tot);
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
T('⚠️ 단일 차시 18 — covers가 단수 「N차시」 · n과 일치', () => {
  ok(SINGLE.length === 18, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => ok(L[k].meta.covers === L[k].meta.n + '차시',
    k + ' covers ' + L[k].meta.covers + ' (기대 ' + L[k].meta.n + '차시)'));
});
T('⚠️ 수업시간 합 = 18차시 × 40분 = 720분 — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 720, '합 ' + tot);
  ok(tot === 40 * SINGLE.length + 80 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('🚨🚨 review 계보 = 18연쇄 · l01만 단원을 넘어 u1_l13을 받는다 (u1 게이트와 정반대)', () => {
  const chain = [['u2_l01', 'u1_l13']];
  for (let n = 2; n <= 18; n++) {
    chain.push(['u2_l' + String(n).padStart(2, '0'), 'u2_l' + String(n - 1).padStart(2, '0')]);
  }
  ok(chain.length === 18, '계보 길이 ' + chain.length);
  chain.forEach(([k, from]) => {
    const rv = L[k].slides.find(s => s.block === 'review');
    ok(rv, k + ' review 없음');
    ok(rv.data.from === from, k + ' from ' + rv.data.from + ' (기대 ' + from + ')');
    const ex = L[from].slides.find(s => s.block === 'exit_ticket');
    ok(ex, from + ' exit 없음 — 동반 로드가 죽었는지 확인');
    ok(JSON.stringify(rv.data.items) === JSON.stringify(ex.data.items),
       k + ' review가 ' + from + ' exit를 그대로 계승하지 않음');
  });
  /* 🚨 단원을 넘는 자리는 **정확히 하나**다 — 0이면 동반 로드를 지운 것이고, 둘이면 계보가 샜다 */
  const cross = chain.filter(([, from]) => !/^u2_/.test(from));
  ok(cross.length === 1 && cross[0][0] === 'u2_l01',
     '단원을 넘는 계보 ' + cross.length + '건 (l01 하나여야) — ' + cross.map(x => x.join('←')).join(','));
});
T('🚨 마무리 자리가 셋 — l06(소단원 ①) · l12(소단원 ②) · l18(2단원) (u1의 둘을 복제하면 하나가 빈다)', () => {
  ok(CLOSERS.length === 3, '마무리 자리 ' + CLOSERS.length + '곳');
  ['u2_l06', 'u2_l12'].forEach(k => {
    const s = L[k].slides.find(x => x.block === 'summary');
    ok(/소단원/.test(plain(s)), k + ' summary에 「소단원」 표지가 없다');
    ok(/소단원/.test(L[k].meta.title), k + ' 제목에 소단원 마무리 표지가 없다');
  });
  const s18 = L['u2_l18'].slides.find(x => x.block === 'summary');
  ok(/2단원/.test(plain(s18)), 'l18 summary에 「2단원」 표지가 없다');
  ok(/2단원/.test(L['u2_l18'].meta.title), 'l18 제목에 단원 정리 표지가 없다');
  /* 소단원 갈래가 실제로 여섯씩 셋으로 갈린다 */
  ok(SUB1.length === 6 && SUB2.length === 6 && SUB3.length === 6,
     '소단원 갈래 ' + [SUB1, SUB2, SUB3].map(x => x.length).join('/'));
  ok(SUB1.concat(SUB2, SUB3).length === KEYS.length, '세 소단원이 18항목을 덮지 않는다');
  /* 마무리가 각 소단원의 **끝자리**에 있다 */
  ok(CLOSERS[0] === SUB1[5] && CLOSERS[1] === SUB2[5] && CLOSERS[2] === SUB3[5],
     '마무리 자리가 소단원 끝이 아니다: ' + CLOSERS.join(','));
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
  ok(ind.length === 1 && ind[0] === 'u2_l05',
     'individual 자리 ' + ind.join(',') + ' (l05 하나여야 — 아래 폴백 단언의 전제다)');
});
T('🚨 individual은 엔진 라벨이 없다 — 폴백이 실제로 뜬다 (undefined 노출 0 · 실렌더)', () => {
  /* ⚠️ 엔진 `typeLabel`에는 pair·group·whole 셋뿐이라 individual은
     `d.tag || typeLabel[type] || '교실에서 함께 해요'` 폴백으로 떨어진다.
     깨지지는 않지만 개인 활동에 「함께」 라벨이 붙는다 — 엔진에 라벨을 더하면 이 단언이 먼저 운다. */
  const w3 = boot();
  openAs(w3, 'u2_l05');
  const idx = L['u2_l05'].slides.findIndex(s => s.block === 'offline_activity');
  const nb = w3.document.getElementById('next-btn');
  for (let i = 0; i < idx; i++) nb.dispatchEvent(new w3.Event('click', { bubbles: true }));
  const html = w3.document.getElementById('slide-content').innerHTML;
  ok(/i-offline-card/.test(html), 'offline 카드가 안 그려졌다');
  ok(!/undefined/.test(html), '라벨이 undefined로 샜다 — 엔진 폴백이 죽었다');
  const d = L['u2_l05'].slides[idx].data;
  ok(d.tag ? html.includes(d.tag) : /교실에서 함께 해요/.test(html),
     'individual 폴백 라벨이 바뀌었다 — 엔진에 individual 라벨이 생겼다면 이 단언을 갱신할 것');
});
T('meta 정합 (grade·subject·unit·n·theme·live_url·본차시 실존)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(m.grade === 3 && m.subject === '사회' && m.unit === 2, k + ' meta 기본 (unit ' + m.unit + ')');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 시간 여행대',
       k + ' theme ' + m.theme + ' (u1의 동네 탐험대를 복제했는지)');
    ok(/^\.\.\/\.\.\/grade3\/semester1\/social\/2단원_/.test(m.live_url), k + ' live_url ' + m.live_url);
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
    ok(path.basename(f) === SFILE[k], k + ' live_url이 SFILE과 다르다');
  });
  /* u1의 live_url(1단원_)이 섞여 들지 않았다 */
  ok(!KEYS.some(k => /1단원_/.test(L[k].meta.live_url)), 'u1 본차시 경로가 섞였다');
});
T('CURRICULUM ↔ LESSONS 정합 (u2 블록 18항목 · ready 18 · n 목록 1~18 연속)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u3가 붙는 순간 무너진다.
     ⚠️ 머리 주석에도 「ready: true」가 적혀 있다 — 블록으로 잘라 세지 않으면 수가 어긋난다. */
  const blk = (CURRIC_SRC.match(/unit:\s*2,[\s\S]*?(?=unit:\s*3,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 2 블록 없음');
  ok(/lesson_count:\s*18/.test(blk), 'lesson_count 18 아님');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok(ns.length === 18 && ns[0] === 1 && ns[17] === 18, 'n 목록이 1~18 연속이 아니다');
  ok((blk.match(/ready:\s*true/g) || []).length === 18, 'ready 18 아님');
  ok(!/unit:\s*3/.test(blk), 'u2 블록이 u3를 먹었다');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ u1 블록 무영향 회귀 — u2를 붙여도 앞 블록이 흔들리지 않는다 (1블록 13항목·ready 13)', () => {
  const b1 = (CURRIC_SRC.match(/unit:\s*1,[\s\S]*?(?=unit:\s*2,|\];)/) || [''])[0];
  ok(b1, 'CURRICULUM에 unit 1 블록 없음');
  ok(/lesson_count:\s*13/.test(b1), 'u1 lesson_count가 흔들렸다');
  ok((b1.match(/ready:\s*true/g) || []).length === 13, 'u1 ready 13 아님');
  ok(!/unit:\s*2/.test(b1), 'u1 블록이 u2를 먹었다 — 전방탐색이 죽었다');
});
T('⚠️ 홈 배선 — **닫는 태그까지** 성립한다 (u1·u2 둘) · u3 미리 생김 0', () => {
  ok(/<script src="data\/g3_social_u1\.js"><\/script>/.test(HOME),
     'u1 script 태그가 닫는 태그까지 성립하지 않는다');
  ok(/<script src="data\/g3_social_u2\.js"><\/script>/.test(HOME),
     'u2 script 태그가 닫는 태그까지 성립하지 않는다');
  ok(!/g3_social_u3\.js/.test(HOME), 'u3 배선이 미리 생겼다');
  /* 로드 차례 — u1이 u2보다 먼저 실려야 review 계보가 성립한다 */
  ok(HOME.indexOf('data/g3_social_u1.js') < HOME.indexOf('data/g3_social_u2.js'),
     'u2가 u1보다 먼저 실린다 — 계보가 어긋날 수 있다');
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
  /* ⚠️ 「묶음 차시는 시작 번호 하나로 등재」는 사회에서 거짓말이다(묶음 0) —
     홈은 그 문구를 **「복제하지 말 것」 경고 안에서만** 쓴다. 경고문까지 통째로 금지하면
     다음 사람이 그 교훈을 잃는다. 두 갈래를 갈라 잰다(7차 교훈). */
  HOME.split('\n').filter(ln => /묶음 차시는 시작 번호/.test(ln)).forEach(ln =>
    ok(/복제하지 말 것/.test(ln), '묶음 주석이 경고가 아니라 선언으로 적혀 있다: ' + ln.trim()));
  ok(/묶음\(2차시\) 차시가 하나도 없다|묶음 0/.test(HOME), '홈이 묶음 0을 밝히지 않는다');
});
T('⚠️ 허브 "3_social" 등재 (units 2 · lessons 31) — 못 박는 줄 + 부분 합 재계산 줄', () => {
  const m = HUB.match(/"3_social":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_social 미등재');
  ok(+m[1] === 2, 'units ' + m[1]);
  ok(+m[2] === 31, 'lessons ' + m[2]);
  /* ⚠️ lessons = **항목 수** 합이다(u1 13 + u2 18 = 31). 사회는 묶음이 0이라
     항목 수와 차시 수가 우연히 같을 뿐 — 묶음이 생기면 항목 수 쪽으로 적을 것. */
  ok(+m[2] === 13 + KEYS.length, '부분 합 재계산 어긋남 ' + m[2]);
  ok(KEYS.every(k => !L[k].meta.covers.includes('·')),
     'u2에 묶음이 생겼다 — 항목 수와 차시 수가 갈린다');
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
T('케이랩 매핑 없음 = 의도적 (옛 물건 실물·종이 연표가 화면 교구보다 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_social_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u2 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '박음', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('🚨 박- 계열 0 · 본차시 l17에는 「박수」가 실존한다 (케이티처는 「손뼉」으로 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
  /* ⚠️ 역단언 — 본차시에서 「박수」가 사라지면 「손뼉」 규약이 뜻을 잃는다 */
  ok(SQ['u2_l17'].includes('박수'),
     '본차시 l17에 「박수」가 없다 — 「손뼉」으로 갈아 쓴 이유가 사라졌다');
  ok(plain(L['u2_l17']).includes('손뼉'), 'l17에 「손뼉」이 없다');
});
T('🚨 채움말 "자리" 0 — **보호 어휘가 없다** (본차시 18파일 0건이라 u1 목록을 복제하면 죽는다)', () => {
  /* ⚠️ u1은 장소 단원이라 「그 자리에서」·「한자리에」 다섯을 보호했다.
     u2 본차시에는 「자리」가 **한 건도 없다** — 보호 목록을 복제하면 실존 단언이 먼저 운다.
     이 단원은 0으로 간다. */
  const hit = [...BODY.matchAll(/[가-힣 ]{0,8}자리[가-힣 ]{0,6}/g)].map(m => m[0]);
  ok(hit.length === 0, hit.join(' / '));
  KEYS.forEach(k => ok(!SQ[k].includes('자리'),
    '본차시 ' + k + '에 「자리」가 생겼다 — 보호 어휘를 다시 재야 한다'));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
