/* gate_g3_korean_u6.js — 케이티처 g3 국어 u6 「자신 있게 읽고 써요」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ u5 게이트 복제. u1~u5의 국어 규약을 계승하되 u6에서 처음 서는 넷을 새로 건다.
   (갈림 ①) **8항목 13차시**다 — u5는 8항목 14차시였다.
       건너뛰는 키 = l04·l06·l08·l10·l12 **다섯**.
       ⚠️ u5의 SKIPPED는 여섯(l04·l06·l08·l10·l11·l13)이었다. 복제하면 즉시 어긋난다.
   (갈림 ②) **3차시 묶음이 없다.** u2~u5에는 하나씩 있었으나 u6은 2차시 묶음 다섯 +
       단일 셋뿐이다 -> 36슬 항목 0 · period_split 경계는 전부 하나 ·
       covers 물결 0건. ⚠️ u5 게이트의 TRIPLE 갈래를 그대로 복제하면
       "3차시 묶음 개수 0"에서 죽는다. **물결 0건을 거꾸로 단언**해야 한다.
   (신규 ①) 국어 여섯 번째 기계 검산기 = **사실·의견 판별 검산기**(D-2).
       본문의 모든 `사실 — 문장 / 의견 — 문장` 선언 짝을 긁어
       ①사실 쪽 의견 표지 0건 ②의견 쪽 의견 표지 1건 이상을 견준다.
       ⚠️ **두 갈래를 함께 걸어야 한다** — 의견 쪽만 걸면 "표지가 있으면 통과"가
          되어 판별력이 0이다(u5 높임 검산기 선례).
       ⚠️ 나아가 사실/의견 **모으기 문제의 정답 필드**를 전수로 같은 자로 잰다.
          모으기 오답은 반대 갈래 문장이라 본문에 그대로 남아야 하므로
          **정답 필드만** 읽는다(u5의 필드 마스킹과 다른 길 — 마스킹이 필요 없다).
       ⚠️ '좋다'는 '좋은 점'·'사이가 좋다'에도 쓰인다. 표지는 **선언 짝과 정답 필드
          안에서만** 잰다. 본문 전체에서 낱말로 걸면 통째로 오탐이다.
   (신규 ②) 국어 일곱 번째 검산기 = **읽을 대상 맞춤 검산기**(D-3).
       `동생에게 — 문장 / 어려운 말 — 문장` 두 갈래를 함께 건다.
   (계승) **낫표 허용 목록이 비어 있다**(u4·u5와 같다). u6 본차시 여덟 파일의
       slides 본문에 「」 실측 0건이고 세 파일이 "본문 노출 0"을 직접 선언한다.
   (신규 ③) **'사실'·'의견'은 l01이 이름만 예고한다** — 본차시 l01이 두 이름을
       화면에 직접 띄운다. 이름은 노출하되 **뜻매김은 l02로 미룬다**.
   ⚠️ review 계보는 u6_l01 <- u5_l14 (단원을 넘는다)
      -> 이 게이트는 data/g3_korean_u5.js도 함께 로드한다.
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다(u2 태그 누락 선례).
   ⚠️ CURRICULUM 슬라이싱은 **다음 unit 앞에서 끊는 전방탐색**으로 짠다.
   ⚠️ 허브 카운트 단언은 「수를 못 박는 줄」과 「부분 합으로 다시 계산하는 줄」을
      **함께** 둔다 (u5에서 다섯 게이트가 사이좋게 틀렸던 자리).

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_korean_u6.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA5 = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u5.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u6.js'), 'utf8');
/* 용어·저작권 가드는 본문만 대상 — 머리 주석에 차단 목록 자체가 적혀 있어
   주석을 함께 걸면 게이트가 자기 주석에 걸려 넘어진다. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_korean.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/korean/6단원_자신있게읽고써요');
const SRC01 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l01.html'), 'utf8');
const SRC02 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l02.html'), 'utf8');
const SRC03 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l03_04.html'), 'utf8');
const SRC05 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l05_06.html'), 'utf8');
const SRC07 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l07_08.html'), 'utf8');
const SRC09 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l09_10.html'), 'utf8');
const SRC11 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l11_12.html'), 'utf8');
const SRC13 = fs.readFileSync(path.join(SDIR, 'g3_kor_u6_l13.html'), 'utf8');
const SRCALL = [SRC01, SRC02, SRC03, SRC05, SRC07, SRC09, SRC11, SRC13];

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
const txt = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const sq = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');
const NOSTAR = BODY.replace(/\*/g, '');   /* 굵게 표시를 지운 갈래 — 본문 대조용 */
const TXTALL = SRCALL.map(txt).join('\n');
const SQALL = SRCALL.map(sq).join('\n');

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
const HTML = `<!DOCTYPE html><html><body class="kt3 subj-korean">${extractBody(HOME)}</body></html>`;

function boot() {
  const dom = new JSDOM(HTML, { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  w.scrollTo = () => {};
  w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.eval('window.LESSONS = window.LESSONS || {};');
  w.eval(DATA5); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
  w.eval(`Teacher.init({ subject:{grade:3,subject:"국어",title:"3학년 1학기 국어",brand:"케이티처",slug:"g3_korean"}, curriculum:CURRICULUM, lessons:window.LESSONS });`);
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
eval(DATA5);
eval(DATA);
const L = global.window.LESSONS;

/* ⚠️ 8항목 13차시. 3차시 묶음이 없다. */
const KEYS = ['u6_l01', 'u6_l02', 'u6_l03', 'u6_l05', 'u6_l07', 'u6_l09', 'u6_l11', 'u6_l13'];
const NS = { u6_l01: 1, u6_l02: 2, u6_l03: 3, u6_l05: 5, u6_l07: 7, u6_l09: 9, u6_l11: 11, u6_l13: 13 };
const PAIRED = ['u6_l03', 'u6_l05', 'u6_l07', 'u6_l09', 'u6_l11'];
const SINGLE = KEYS.filter(k => !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });
/* ⚠️ u5(l04·l06·l08·l10·l11·l13) 여섯과 다르다. 다섯이다. */
const SKIPPED = ['u6_l04', 'u6_l06', 'u6_l08', 'u6_l10', 'u6_l12'];

function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u6 8항목 로드 (u5 8항목 동반 로드)', () => {
  W = boot();
  const k6 = Object.keys(W.LESSONS).filter(k => k.startsWith('u6_'));
  ok(k6.length === 8, 'u6 항목 ' + k6.length);
  const k5 = Object.keys(W.LESSONS).filter(k => k.startsWith('u5_'));
  ok(k5.length === 8, 'u5 동반 로드 실패 ' + k5.length);
});
T('⚠️ 키가 건너뛴다 — 다섯이다 (l04·l06·l08·l10·l12 · u5는 여섯이었다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u6_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(SKIPPED.length === 5, '건너뛴 키 개수 ' + SKIPPED.length);
  /* u5 SKIPPED를 그대로 복제하지 않았는지 역으로 못 박는다 */
  ok(!!L['u6_l11'] && !!L['u6_l13'], 'u5 SKIPPED(l11·l13)를 그대로 복제했다');
});
T('슬라이드 id 0패딩 s01~sNN 연속', () => {
  KEYS.forEach(k => {
    L[k].slides.map(s => s.id).forEach((id, i) =>
      ok(id === 's' + String(i + 1).padStart(2, '0'), k + ' ' + id));
  });
});

console.log('═══ B. 7요소 실렌더 ═══');
KEYS.forEach(k => {
  T(k + ' 7요소 실렌더', () => {
    const html = renderAll(W, 6, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ 전 항목에 review 실존 (u6_l01도 — 단원 넘는 계보)', () => {
  KEYS.forEach(k => ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
});
T('img 폴백 경로 실존 (미생성 = 폴백 정상)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/korean\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
});

console.log('═══ C. 회귀 (8항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, 6, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
const q = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const src = (s) => ok(TXTALL.includes(s), '본차시 근거 없음: ' + s);
const both = (s) => { src(s); q(s); };

T('① l01 두 친구의 글 두 줄 원문 일치', () => {
  both('내가 던진 공이 자꾸 빗나가서 너무 아쉬웠');
  both('응원도 신나고');
  both('비록 졌지만 최고의 경기였');
});
T('② l01 글이 다른 까닭 정답1·오답2', () => {
  both('사람마다 생각·느낌이 다르기 때문');
  both('경기를 한 날짜가 다르기 때문');
  both('경기를 한 장소가 다르기 때문');
});
T('③ l01 구분하면 좋은 때 정답3·오답2 (다섯 보기 원문 전부)', () => {
  ['신문이나 뉴스를 읽을 때', '광고의 내용을 따져 볼 때', '그냥 멍하니 쉬고 싶을 때',
   '설명하는 글을 정확히 이해할 때', '밥을 맛있게 먹고 싶을 때'].forEach(both);
});
T('④ l01 소단원 잇기 3짝', () => {
  both('사실과 의견 구분하며 읽기');
  both('쓰기 계획 세우고 글 쓰기');
  both('대화 예절·고유어·글씨 다지기');
});
T('⑤ l01 글 쓰기 전 생각할 점 3종', () => {
  both('무엇에 대해 쓸까');
  both('내 글을 읽을 사람은 누구일까');
  both('글쓰기 목표는 무엇으로 정할까');
});
T('⑥ l02 동물 두 설명 원문 일치', () => {
  both('물속을 다녀요. 날개가 있지만 하늘을 날지 못해요. 남극에 살아요.');
  both('똑똑해요.');
  q('설명 1'); q('설명 2');
});
T('⑦ l02 사실 뜻 · 의견 뜻 원문 일치', () => {
  both('실제로 있었던 일이나');
  both('어떤 일이나 대상에 대한');
  both('홍학이 한쪽 다리를 들고 서 있다.');
  both('홍학이 어쩐지 불편해 보여.');
});
T('⑧ l02 사실 문장 모으기 정답3·오답2 (다섯 보기 원문 전부)', () => {
  ['기린이 먹이를 먹고 있다.', '동물을 보호하는 일은 중요하다.',
   '동물원은 오후 6시에 문을 닫는다.', '홍학은 한쪽 다리를 들고 서 있다.',
   '다음에 또 동물원에 오고 싶다.'].forEach(both);
});
T('⑨ l02 의견 문장 모으기 정답3·오답2 (다섯 보기 원문 전부)', () => {
  ['동물원은 정말 즐거운 곳이다.', '우리 반 학생은 모두 스무 명이다.',
   '우리 반 친구들은 사이가 좋다.', '봄이 지나면 여름이 온다.',
   '나는 여름이 가장 좋다고 생각한다.'].forEach(both);
});
T('⑩ l02 참·거짓 오개념 + 로봇 공학자 적용', () => {
  both('고래는 물고기이다.');
  both('로봇 공학자는 로봇을 연구하는 사람이다.');
  both('나는 로봇 공학자가 멋진 일을 한다고 생각한다.');
});
T('⑪ l03 꿀벌 글 ① 3문장 원문 일치', () => {
  both('꿀벌은 꽃을 찾아다니며 꿀을 모아요.');
  both('꿀벌은 다리가 여섯 개이고, 두 쌍의 날개로 날아다녀요.');
  both('꿀벌은 꽃가루를 옮겨 열매를 맺도록 도와요.');
});
T('⑫ l03 꿀벌 글 ② 3문장 원문 일치', () => {
  both('꿀벌 한 마리가 평생 모으는 꿀은 작은 숟가락 하나도 안 돼요.');
  both('이렇게 작은 꿀벌이 큰 일을 한다는 것이 정말 놀라워요.');
  both('꿀벌은 우리에게 없어서는 안 될 고마운 곤충이에요.');
});
T('⑬ l03 의견 표현 3짝 + 의견 문장 고르기', () => {
  both('~라고 생각한다');
  both('놀랍다');
  both('~해야 한다');
  q('생각을 드러내는 말'); q('느낌을 드러내는 말'); q('주장을 드러내는 말');
  both('작은 꿀벌이 큰 일을 한다는 것이 놀라워요.');
});
T('⑭ l03 더 읽기 3문장 + 사실 모으기 다섯 보기 원문 전부', () => {
  ['꿀벌은 무리를 지어 함께 살아가요.', '꿀벌이 모은 꿀은 우리가 음식에 두루 써요.',
   '우리도 꿀벌을 아끼고 보호해야 해요.'].forEach(both);
  ['우리도 꿀벌을 보호해야 해요.', '꿀벌은 꽃가루를 옮겨 열매를 맺게 도와요.',
   '꿀벌이 모은 꿀을 음식에 써요.', '꿀벌은 정말 고마운 곤충이에요.'].forEach(both);
});
T('⑮ l05 기사 ① 3문장 원문 일치', () => {
  both('지난 5일, 마을 공원에 빗물 정원이 새로 생겼다.');
  both('빗물 정원은 비가 올 때 빗물을 모아 두는 곳이다.');
  both('모은 빗물은 날이 가물 때 정원의 식물에 준다.');
});
T('⑯ l05 기사 ② 3문장 + 기자 의견 고르기 + 사실 모으기 다섯 보기', () => {
  both('빗물 정원은 도시의 온도를 낮추는 데에도 도움을 준다.');
  both('빗물 정원은 환경을 지키는 좋은 시설이라고 생각한다.');
  both('우리 마을에도 빗물 정원이 더 많이 생기면 좋겠다.');
  ['지난 5일에 빗물 정원이 생겼다.', '빗물 정원은 좋은 시설이라고 생각한다.',
   '모은 빗물은 가물 때 식물에 준다.', '빗물 정원은 도시의 온도를 낮춘다.',
   '빗물 정원이 더 생기면 좋겠다.'].forEach(both);
});
T('⑰ l05 내 의견 표현 3짝', () => {
  both('나도 그렇게 생각한다');
  both('내 생각은 조금 다르다');
  both('왜 그럴까 궁금하다');
  q('글쓴이와 의견이 비슷할 때'); q('글쓴이와 의견이 다를 때'); q('더 알고 싶을 때');
});
T('⑱ l07 이야기 3문장 + 첫 쪽지 + 고친 쪽지 3문장 원문 일치', () => {
  both('쉬는 시간에 하준이가 자리에서 일어나다 서윤이의 책상을 쳤어요.');
  both('책상에 놓여 있던 색종이 작품이 바닥에 떨어져 구겨졌어요.');
  both('하준이는 미안한 마음에 쪽지를 써서 주기로 했어요.');
  both('서윤아, 안녕? 나는 하준이야.');
  both('아까 실수로 네 색종이 작품을 구겨서 정말 미안해.');
  both('많이 속상했지? 다시 만들 때 내가 꼭 도와줄게.');
});
T('⑲ l07 아쉬운 점 정답1·오답2 + 달라진 점 3짝 + 들어갈 내용 다섯 보기', () => {
  both('누가 무슨 일로 미안한지 알 수 없다');
  both('글씨가 너무 작다');
  both('색종이로 쓰지 않았다');
  both('누가 썼는지 밝혔어요');
  both('무슨 일인지 자세히 썼어요');
  both('상대의 마음을 헤아렸어요');
  ['누가 누구에게 쓰는지', '어떤 일이 있었는지(상황)', '오늘 급식 반찬이 무엇인지',
   '전하고 싶은 마음', '받는 사람의 키와 몸무게'].forEach(both);
});
T('⑳ l09 계획 3요소 + 계획 요소 다섯 보기 + 대상 알맞은 글 3종', () => {
  ['글쓰기 목표 정하기', '읽을 사람 예상하기', '글씨 색깔 고르기',
   '쓸 내용 정하기', '공책을 몇 권 살지 정하기'].forEach(both);
  both('줄넘기를 하면 몸이 튼튼해져요');
  both('규칙적 운동은 신체 발달에 기여한다.');
  both('체력 증진의 효율적 방안을 논하겠다.');
});
T('㉑ l11 기사 예시 3문장 + 광고 예시 2문장 + 좋은 태도 다섯 보기', () => {
  both('지난주, 우리 반 교실에서 작은 음악회가 열렸다.');
  both('두 친구가 리코더와 멜로디언을 연주했다.');
  both('끝까지 최선을 다하는 모습이 정말 멋졌다.');
  both('쓰레기통에 종이와 플라스틱이 함께 버려져 있다.');
  both('쓰레기를 잘 나누어 버려야 한다.');
  ['무엇을 쓸지 계획을 세워요', '사실과 의견을 구분해 써요',
   '아무 말이나 떠오르는 대로 써요', '읽을 사람을 생각하며 써요',
   '내용과 상관없이 길게만 써요'].forEach(both);
});
T('㉒ l13 의견 고르기 3문장 + 대화 예절 다섯 보기 + 날씨 고유어 3짝', () => {
  both('책보다 직접 체험하는 것이 좋다.');
  both('박물관에서 옛 그림을 보았다.');
  both('대한민국의 수도는 서울이다.');
  ['상대를 바라보며 말한다', '상대의 말을 끝까지 듣는다', '항상 큰 목소리로 말한다',
   '고운 말, 바른 말을 한다', '책을 읽으면서 듣는다'].forEach(both);
  both('함박눈'); both('가랑눈'); both('꽃샘추위');
  both('굵고 탐스럽게 내리는 눈');
  both('조금씩 잘게 내리는 눈');
  both('이른 봄, 꽃 필 무렵의 추위');
  both('토박이말');
});
T('㉓ l13 글씨 쓰기 3종 (sq 갈래 대조 — 칸에 갈라 담긴다)', () => {
  ['사실', '의견', '계획'].forEach(w => {
    ok(SQALL.includes(sq(w)), '본차시 근거 없음: ' + w);
    ok(NOSTAR.includes(w), '본문 누락: ' + w);
  });
});

console.log('═══ D-2. 사실·의견 판별 검산기 (국어 여섯 번째 기계 검산) ═══');
/* 의견 표지 = 생각·느낌·바람·주장을 드러내는 말. 본차시가 가르치는 세 갈래 그대로. */
const MARK = ['생각한다', '생각해요', '좋겠다', '좋다', '해야 한다', '해야 해요',
              '놀라워요', '놀랍다', '고맙다', '고마운', '멋졌다', '아쉬웠',
              '싶다', '즐거운', '최고'];
const marks = (s) => MARK.filter(m => s.includes(m));

T('⚠️ 표지 판정기 자체 검증 (참·거짓 양쪽)', () => {
  ok(marks('작은 꿀벌이 큰 일을 한다는 것이 정말 놀라워요.').length > 0, '의견을 못 잡는다');
  ok(marks('꿀벌은 꽃을 찾아다니며 꿀을 모아요.').length === 0, '사실을 의견으로 잡는다');
  ok(marks('지난 5일, 마을 공원에 빗물 정원이 새로 생겼다.').length === 0, '사실 오탐');
  ok(marks('우리 마을에도 빗물 정원이 더 많이 생기면 좋겠다.').length > 0, '바람을 못 잡는다');
});

/* ⚠️ 선언은 문자열 끝(")에서 끝나기도 하고 줄바꿈(\\n)에서 끝나기도 한다.
   줄바꿈만 잡으면 문장 끝에 놓인 선언이 통째로 새어 검산 대상이 반으로 준다. */
const DECL = [...NOSTAR.matchAll(/사실 — ([^\/]+?) \/ 의견 — ([^"\\]+?)(?:\\n|")/g)]
  .map(m => [m[1].trim(), m[2].trim()]);
T('⚠️ 검산 대상 실존 — 선언 짝이 다섯 이상', () => {
  ok(DECL.length >= 5, '선언 짝 ' + DECL.length + '개 — 검산 대상이 죽었다');
});
T('⚠️ 선언 짝 전수 — 사실 쪽 표지 0건 · 의견 쪽 1건 이상 (두 갈래를 함께)', () => {
  const bad = [];
  DECL.forEach(([f, o]) => {
    if (marks(f).length !== 0) bad.push('사실 쪽에 표지: ' + f + ' [' + marks(f) + ']');
    if (marks(o).length === 0) bad.push('의견 쪽에 표지 없음: ' + o);
  });
  ok(bad.length === 0, bad.join(' / '));
});
T('⚠️ 모으기 문제 정답 필드 전수 — 사실 모으기 답에 표지 0 · 의견 모으기 답에 표지 실존', () => {
  /* ⚠️ 오답은 반대 갈래 문장이라 본문에 남아야 한다 -> 정답 필드만 읽는다.
     마스킹이 필요 없는 길이다(u5의 필드 마스킹과 다르다). */
  let nF = 0, nO = 0; const bad = [];
  KEYS.forEach(k => L[k].slides.forEach(s => {
    if (s.block !== 'basic_problem' || !s.data.answer) return;
    const t = String(s.data.title || '');
    const a = String(s.data.answer).replace(/\*/g, '');
    if (/사실을 나타낸 문장 모으기|사실을 나타낸 문장을 모두/.test(t) ||
        /기사에서 사실을 나타낸 문장 모으기/.test(t)) {
      nF++;
      if (marks(a).length) bad.push(k + ' ' + s.id + ' 사실 정답에 표지 [' + marks(a) + ']');
    }
    if (/의견을 나타낸 문장 모으기/.test(t)) {
      nO++;
      if (!marks(a).length) bad.push(k + ' ' + s.id + ' 의견 정답에 표지 없음');
    }
  }));
  ok(nF >= 3, '사실 모으기 문제 ' + nF + '개 — 검산 대상 부족');
  ok(nO >= 1, '의견 모으기 문제 ' + nO + '개 — 한 갈래만으로는 판별력이 0이다');
  ok(bad.length === 0, bad.join(' / '));
});
T('본차시가 세 갈래 표현을 실제로 가르친다 (근거 확인)', () => {
  const t3 = sq(SRC03);
  ['~라고 생각한다', '놀랍다', '~해야 한다', '주장을 드러내는 말']
    .forEach(w => ok(t3.includes(sq(w)), '본차시 근거 없음: ' + w));
});

console.log('═══ D-3. 읽을 대상 맞춤 검산기 ═══');
const HARD = ['신체', '발달', '기여', '증진', '효율', '논하'];
const YOUNG = NOSTAR.match(/동생에게 — ([^\/]+?) \/ 어려운 말 — ([^"\\]+?)\\n/);
T('⚠️ 검산 대상 실존 (동생에게 / 어려운 말 두 갈래)', () => {
  ok(YOUNG, '두 갈래 선언이 없다 — 검산 대상 0건');
});
T('⚠️ 동생 갈래 = -요 말끝 · 어려운 한자말 0건', () => {
  const s = YOUNG[1].trim();
  ok(/요[.!]?$/.test(s), '말끝이 -요가 아니다: ' + s);
  const hit = HARD.filter(w => s.includes(w));
  ok(hit.length === 0, '동생 갈래에 어려운 말: ' + hit.join(','));
});
T('⚠️ 어려운 갈래 = 한자말 실존 · -요 말끝 아님 (한 갈래만 걸면 판별력 0)', () => {
  const s = YOUNG[2].trim();
  const hit = HARD.filter(w => s.includes(w));
  ok(hit.length > 0, '어려운 갈래에 한자말이 없다: ' + s);
  ok(!/요[.!]?$/.test(s), '어려운 갈래가 -요 말끝이다: ' + s);
});
T('본차시가 두 갈래를 실제로 견주게 한다 (근거 확인)', () => {
  const t9 = sq(SRC09);
  ['1학년 동생', '쉽고', '신체 발달에 기여한다']
    .forEach(w => ok(t9.includes(sq(w)), '본차시 근거 없음: ' + w));
});

console.log('═══ E. 저작권 · 용어 가드 ═══');
T('⚠️ 지도서 수록 제재명·인물명 0건 (국어 최우선 가드 · 차단 66종)', () => {
  /* u6 본차시 머리 주석이 명시적으로 회피한 것 */
  const BAN_U6 = ['피구 일기', '소금 이야기', '로봇과 함께하는 미래', '마음 쓰기',
                  '석빈', '지우'];
  const BAN_U5 = ['준우', '선주', '도현', '혜인', '하윤', '민호', '수환'];
  const BAN_U4 = ['매미', '버스 안전 수칙', '바다의 날', '장보고', '청해진',
                  '된장 만드는 방법', '내 감자가 생겼어요', '솔이', '두더지',
                  '딱지 만드는 방법', '눈 건강'];
  const BAN_U3 = ['흥부전', '플라스틱의 두 얼굴', '비밀번호', '문현식',
                  '손톱 깎기', '방주현', '수상한 선글라스', '고수산나', '박이름',
                  '은솔', '한솔', '콧수염 아저씨', '알뜰 장터', '신비한 선글라스'];
  const BAN_U2 = ['정우 사연', '지호와 나비', '지호', '노란 나비',
                  '하나 둘 셋 찰칵', '김치, 치즈, 카프카', '선현경',
                  '세계여행 할아버지', '카프카', '별이 된 할아버지'];
  const BAN_U1 = ['웃음 참는 나무', '한현정', '벚꽃 팝콘', '김기연', '오늘부터는', '오은영',
                  '권영세', '학교 가는 길', '이진희', '뜨거운 호두과자', '김기택',
                  '슬비', '레오의 특별한 꿈', '정소현', '꿈 마을', '황금새',
                  '봉구야 말해 줘', '아이스크림 사 오는 길에 생긴 일'];
  const all = BAN_U6.concat(BAN_U5, BAN_U4, BAN_U3, BAN_U2, BAN_U1);
  ok(all.length >= 66, '차단 목록이 줄었다 ' + all.length);
  const hit = all.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* 본차시 주석이 이 제재를 회피 대상으로 적어 두었는지 근거 확인 */
  ok(SRC03.includes('소금 이야기') && SRC03.includes('미인용'),
     '본차시가 지도서 정보글을 회피 대상으로 적지 않았다 — 차단 목록 재검토');
  ok(SRC07.includes('석빈') && SRC07.includes('미인용'),
     '본차시가 지도서 이야기 인물을 회피 대상으로 적지 않았다');
});
T('⚠️ 낫표 제목 0건 — u6도 허용 목록이 비어 있다', () => {
  ok(SRC03.includes('slides 본문 노출 0') && SRC05.includes('slides 본문 노출 0'),
     '본차시가 노출 0을 선언하지 않는다 — 단언 재검토');
  const uniq = [...new Set(BODY.match(/「[^」]+」/g) || [])];
  ok(uniq.length === 0, '낫표 제목이 생겼다: ' + uniq.join(','));
  /* 본차시 학생 화면에도 창작 제재명이 없어야 한다 (본차시 자체 검사) */
  SRCALL.forEach((s, i) => {
    const b = s.split('const slides=[')[1] || '';
    ok(!/「[^」]+」/.test(b), '본차시 slides에 낫표 제목 노출: 파일 ' + i);
  });
});
T('⚠️ 개념 이름표는 낫표로 감싸지 않는다', () => {
  ['「사실」', '「의견」', '「계획」', '「공익 광고」', '「토박이말」']
    .forEach(w => ok(!BODY.includes(w), '낫표로 감쌈: ' + w));
  ok(STUDENT.includes('공익 광고'), '개념 이름표 자체가 없음');
});
T('미도입 갈래(4학년 이상·다른 단원 소관) 학생 노출 0', () => {
  const BAN = ['논설문', '주장하는 글', '근거의 타당성', '설득', '매체 자료',
               '요약문', '개요', '서론', '본론', '결론', '주제문',
               '비유', '은유', '직유', '의인법', '운율', '심상', '시적 화자',
               '연과 행', '행과 연', '기승전결'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['사실 판단', '가치 판단', '명제', '진위', '텍스트 유형', '수사법', '화용']
    .forEach(w => ok(!STUDENT.includes(w), '학생 노출: ' + w));
  ok(/사실|의견|계획/.test(TNOTE), 'tnote에 교사 몫 표지 없음');
});
T('⚠️ 신규 규약 ③ — l01은 이름만 예고하고 뜻매김은 l02로 미룬다', () => {
  /* 본차시 l01이 두 이름을 화면에 그대로 띄운다(렌더 대상). 감추지 않는다. */
  ok(txt(SRC01).includes('사실') && txt(SRC01).includes('의견'),
     '본차시 l01이 두 이름을 쓰지 않는다 — 단언 재검토');
  const l01 = plain(L['u6_l01'].slides);
  ok(l01.includes('사실') && l01.includes('의견'), 'l01에 두 이름이 없다');
  /* 뜻매김 문구는 l02 몫 */
  const l01ns = l01.replace(/\*/g, '');
  ok(!l01ns.includes('실제로 있었던 일이나'), 'l01이 사실의 뜻매김을 미리 꺼냄');
  ok(!l01ns.includes('어떤 일이나 대상에 대한'), 'l01이 의견의 뜻매김을 미리 꺼냄');
  const l02 = plain(L['u6_l02'].slides).replace(/\*/g, '');
  ok(l02.includes('실제로 있었던 일이나') && l02.includes('어떤 일이나 대상에 대한'),
     'l02에 뜻매김이 없다');
});
T('⚠️ 「읽을 사람」은 선행 검사 대상이 아니다 — 본차시 l01이 직접 쓴다', () => {
  /* ⚠️ 이 자리를 선행 금지로 걸면 l01의 근거 계승(D-1 ⑤)과 정면으로 부딪쳐
     둘 중 하나가 반드시 레드를 낸다. 본차시가 쓰는 말은 감추지 않는다. */
  ok(txt(SRC01).includes('내 글을 읽을 사람은 누구일까'),
     '본차시 l01이 이 말을 쓰지 않는다 — 선행 규약 재검토');
  ok(plain(L['u6_l01'].slides).includes('읽을 사람'), 'l01이 본차시 근거를 빠뜨렸다');
});
T('⚠️ 선행 용어 — 기사문 l05 · 읽을 대상 l09 · 공익 광고 l11 · 토박이말 l13', () => {
  const pre = (k, w) => {
    const t = plain(L[k].slides.filter(x => x.block !== 'next_lesson'));
    ok(!t.includes(w), k + ' 본문에 ' + w + ' 선행');
  };
  ['u6_l01', 'u6_l02', 'u6_l03'].forEach(k => pre(k, '기사문'));
  ['u6_l01', 'u6_l02', 'u6_l03', 'u6_l05', 'u6_l07'].forEach(k => pre(k, '읽을 대상'));
  ['u6_l01', 'u6_l02', 'u6_l03', 'u6_l05', 'u6_l07', 'u6_l09'].forEach(k => pre(k, '공익 광고'));
  KEYS.filter(k => k !== 'u6_l13').forEach(k => { pre(k, '토박이말'); pre(k, '함박눈'); });
  /* 도입 자리에는 실존해야 한다 */
  ok(plain(L['u6_l05'].slides).includes('기사문'), 'l05에 기사문 도입 없음');
  ok(plain(L['u6_l09'].slides).includes('읽을 대상'), 'l09에 읽을 대상 도입 없음');
  ok(plain(L['u6_l11'].slides).includes('공익 광고'), 'l11에 공익 광고 도입 없음');
  ok(plain(L['u6_l13'].slides).includes('토박이말'), 'l13에 토박이말 도입 없음');
});
T('l01은 단원 예고 차시 — next_lesson 역검사', () => {
  const l01 = plain(L['u6_l01'].slides.filter(x => x.block !== 'next_lesson'));
  ok(!/기사문/.test(l01), 'l01이 l05 용어를 미리 꺼냄');
  ok(!/사실 — /.test(l01), 'l01이 판별 선언 짝을 미리 꺼냄');
  const nx = plain(L['u6_l01'].slides.find(x => x.block === 'next_lesson'));
  ok(/사실/.test(nx) && /의견/.test(nx), 'l01 next_lesson이 다음 시간을 예고하지 않음');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 (36슬 항목 0)', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
  ok(!KEYS.some(k => L[k].slides.length === 36), '3차시 묶음이 생겼다');
});
T('⚠️ 슬라이드 총합 177슬 (19×3 + 24×5)', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 177, '총합 ' + tot);
  ok(tot === 19 * SINGLE.length + 24 * PAIRED.length, '부분 합 재계산 어긋남');
});
T('extras 20~30 · 참조 무결성 · 중복 0', () => {
  KEYS.forEach(k => {
    const ex = L[k].extras;
    ok(ex.length >= 20 && ex.length <= 30, k + ' extras ' + ex.length);
    const ids = ex.map(e => e.id);
    ok(new Set(ids).size === ids.length, k + ' extras id 중복');
    const set = new Set(ids);
    L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id =>
      ok(set.has(id), k + ' ' + s.id + ' 깨진 참조 ' + id)));
    ex.forEach(e => ok(e.type && e.icon && e.title && e.content && e.fit_slides,
      k + ' extras 필드 누락 ' + e.id));
  });
});
T('tnote 6슬 이상 · 구조 정합', () => {
  KEYS.forEach(k => {
    const t = L[k].slides.filter(s => s.tnote);
    ok(t.length >= 6, k + ' tnote ' + t.length);
    t.forEach(s => {
      ok(Array.isArray(s.tnote.ask) && s.tnote.ask.length >= 2, k + ' ' + s.id + ' ask');
      ok(typeof s.tnote.watch === 'string' && s.tnote.watch.length > 5, k + ' ' + s.id + ' watch');
      ok(typeof s.tnote.min === 'number' && s.tnote.min > 0, k + ' ' + s.id + ' min');
    });
  });
});
T('⚠️ 3차시 묶음 0 — covers 물결 0건 · period_split 경계는 전부 하나', () => {
  /* u5 게이트의 TRIPLE 갈래를 복제하면 여기서 죽는다. 거꾸로 못 박는다. */
  KEYS.forEach(k => {
    ok(!/~/.test(L[k].meta.covers), k + ' covers에 물결 ' + L[k].meta.covers);
    ok(L[k].meta.duration_min !== 120, k + ' 120분 항목이 생겼다');
    if (L[k].meta.period_split)
      ok(!L[k].meta.period_split.includes(','), k + ' 경계가 둘 ' + L[k].meta.period_split);
  });
});
T('⚠️ 2차시 묶음 = 80분 · covers 가운뎃점 · period_split s12 (다섯 — u5는 넷)', () => {
  ok(PAIRED.length === 5, '2차시 묶음 개수 ' + PAIRED.length);
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 단일 차시 = 40분 · period_split 없음 · covers 단수 (셋)', () => {
  ok(SINGLE.length === 3, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 40, k + ' ' + m.duration_min + '분');
    ok(!m.period_split, k + ' period_split 있음');
    ok(!/[·~]/.test(m.covers), k + ' covers ' + m.covers);
  });
});
T('⚠️ 수업시간 합 = 13차시 × 40분 = 520분', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 520, '합 ' + tot);
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
       k + '에 3교시 표시 — u6에는 3차시 묶음이 없다'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 (l01은 단원을 넘는다)', () => {
  const chain = [['u6_l01', 'u5_l14'], ['u6_l02', 'u6_l01'], ['u6_l03', 'u6_l02'],
                 ['u6_l05', 'u6_l03'], ['u6_l07', 'u6_l05'], ['u6_l09', 'u6_l07'],
                 ['u6_l11', 'u6_l09'], ['u6_l13', 'u6_l11']];
  ok(chain.length === 8, '계보 길이 ' + chain.length);
  chain.forEach(([k, from]) => {
    const rv = L[k].slides.find(s => s.block === 'review');
    ok(rv.data.from === from, k + ' from ' + rv.data.from + ' (기대 ' + from + ')');
    const ex = L[from].slides.find(s => s.block === 'exit_ticket');
    ok(ex, from + ' exit 없음');
    ok(JSON.stringify(rv.data.items) === JSON.stringify(ex.data.items),
       k + ' review가 ' + from + ' exit를 그대로 계승하지 않음');
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
    ok(m.grade === 3 && m.subject === '국어' && m.unit === 6, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 사실 의견 신문사', k + ' theme ' + m.theme);
    ok(/^\.\.\/\.\.\/grade3\/semester1\/korean\/6단원_/.test(m.live_url), k + ' live_url');
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
  });
});
T('⚠️ std = 전 항목 "단원 전체 통합" (본차시가 성취기준을 선언하지 않았다)', () => {
  KEYS.forEach(k => ok(L[k].meta.std === '단원 전체 통합', k + ' std ' + L[k].meta.std));
  SRCALL.forEach((s, i) => ok(!/\[4국/.test(s), '본차시 파일 ' + i + '에 성취기준 표기 실존 — 재검토'));
});
T('CURRICULUM ↔ LESSONS 정합 (u6 블록 8항목 · ready 8 = u6 완주)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u7이 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*6,[\s\S]*?(?=unit:\s*7,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 6 블록 없음');
  ok(/lesson_count:\s*8/.test(blk), 'lesson_count 8 아님');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok((blk.match(/ready:\s*true/g) || []).length === 8, 'ready 8 아님');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ 홈 배선 — 여섯 단원 전부 **닫는 태그까지** 성립한다 (u2 태그 누락 실측 자리)', () => {
  [1, 2, 3, 4, 5, 6].forEach(n => {
    const re = new RegExp('<script src="data/g3_korean_u' + n + '\\.js"></script>');
    ok(re.test(HOME), 'u' + n + ' script 태그가 닫는 태그까지 성립하지 않는다');
  });
  const open = (HOME.match(/<script[\s>]/g) || []).length;
  const close = (HOME.match(/<\/script>/g) || []).length;
  ok(open === close, 'script 여닫이 개수 불일치 ' + open + '/' + close);
});
T('홈 slug · u1~u5 회귀', () => {
  ok(/slug:\s*"g3_korean"/.test(HOME), 'slug 어긋남');
  ok(!/g3_math/.test(HOME), 'g3_math 잔재');
  [1, 2, 3, 4, 5].forEach(n => ok(CURRIC_SRC.includes('unit: ' + n), 'unit ' + n + ' 블록 없음'));
});
T('⚠️ 허브 "3_korean" 카운트 갱신 (units 6 · lessons 45)', () => {
  const m = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_korean 미등재');
  ok(+m[1] === 6, 'units ' + m[1]);
  ok(+m[2] === 45, 'lessons ' + m[2]);
  /* ⚠️ 못 박는 줄만 두면 여섯 게이트가 사이좋게 틀린다 — 부분 합으로 다시 계산한다.
     lessons = **항목 수** 합이지 차시 수가 아니다 (u5에서 14를 더해 깨진 자리). */
  ok(+m[2] === 8 + 7 + 7 + 7 + 8 + KEYS.length, '부분 합 재계산 어긋남 ' + m[2]);
  ok(+m[2] !== 8 + 7 + 7 + 7 + 8 + 13, 'lessons에 차시 수 13을 더했다 — 항목 수 8이어야 한다');
});
T('케이랩 매핑 없음 = 의도적 (신문·광고 만들기는 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_korean_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u6 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (칭찬·전시 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
  ok(BODY.includes('손뼉'), '손뼉으로 바꿔 쓴 곳이 없다 — 대체어 확인 필요');
});
T('채움말 "자리" 0 (보호 어휘 제외)', () => {
  /* ⚠️ 「자리에서 일어나다」는 본차시 원문의 실제 앉는 곳이다 — 채움말이 아니다.
     보호 목록에 넣지 않으면 D-1 ⑱ 인용 대조와 정면으로 부딪친다. */
  const hit = (BODY.match(/[가-힣]+\s자리(?!값|수|에서|에\s)/g) || [])
    .filter(s => !/(빈|제|학생|앉을|누울|한|두|세|네)\s*자리/.test(s));
  ok(hit.length === 0, hit.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
