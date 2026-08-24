/* gate_g3_korean_u5.js — 케이티처 g3 국어 u5 「인물에게 마음을 전해요」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ u4 게이트 복제. u1~u4의 국어 규약을 계승하되 u5에서 처음 서는 넷을 새로 건다.
   (갈림 ①) **8항목 14차시**다 — u2~u4는 7항목이었다. 단일 항목도 셋(l01·l02·l14).
       건너뛰는 키 = l04·l06·l08·l10·l11·l13.
       ⚠️ u3·u4의 SKIPPED(l03·l05·l07·l09·l10·l12)를 복제하면 즉시 어긋난다.
   (신규 ①) 국어 네 번째 기계 검산기 = **-ㄹ게 표기 검산기**(D-2).
       본문의 모든 `바른 ↔ 잘못` 짝을 자모로 분해해 ①마지막 음절 하나만 다르고
       ②바른 쪽 = 게(초성 ㄱ·중성 ㅔ·종성 없음) ③잘못된 쪽 초성 = ㄲ
       ④그 앞 음절 종성 = ㄹ 임을 견준다. 나아가 학생 노출 본문 전체에서
       「종성 ㄹ + 께/껄」이 **선언된 오답 밖에 0건**임을 전수로 못 박는다.
       ⚠️ u4의 띄어쓰기 짝 검산기(공백 지운 글자열 대조)를 그대로 복제하면
          판정 규칙이 달라 **오답 짝에서 레드가 나거나 검산 대상이 죽는다.**
       ⚠️ '께'는 높임 표현(할머니께)에도 쓰인다 — **종성 ㄹ 뒤일 때만** 잡는다.
          낱말 단독으로 걸면 높임 표현이 통째로 오탐이다.
       ⚠️ 오답 마스킹은 **문자열이 아니라 필드 단위**로 한다(u2 선례).
          잘못된 표기가 실리는 곳은 l14의 네 필드뿐이다.
   (신규 ②) 국어 다섯 번째 검산기 = **높임 표현 검산기**(D-3).
       웃어른께/친구에게 두 갈래를 함께 걸어야 검산이 성립한다.
   (계승) **낫표 허용 목록이 비어 있다**(u4와 같다). u5 본차시 여덟 파일의
       slides 본문에 「」 실측 0건이고 다섯 파일이 "본문 노출 0"을 직접 선언한다.
   (신규 ③) **직접 제시·간접 제시는 학생 노출 용어다** — 본차시가 슬라이드 tag로
       화면에 띄운다. 감추지 않되 쉬운 풀이말 동반을 검사한다(u2 준언어 선례).
   ⚠️ review 계보는 u5_l01 <- u4_l13 (단원을 넘는다)
      -> 이 게이트는 data/g3_korean_u4.js도 함께 로드한다.
   ⚠️ 홈 배선은 문자열 존재가 아니라 **닫는 태그까지** 검사한다(u2 태그 누락 선례).
   ⚠️ CURRICULUM 슬라이싱은 **다음 unit 앞에서 끊는 전방탐색**으로 짠다.
      뒤 전부를 먹는 `unit:\s*5,[\s\S]*`로 짜면 u6이 붙는 순간 무너진다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_korean_u5.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA4 = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u4.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u5.js'), 'utf8');
/* 용어·저작권 가드는 본문만 대상 — 머리 주석에 차단 목록 자체가 적혀 있어
   주석을 함께 걸면 게이트가 자기 주석에 걸려 넘어진다. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_korean.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
/* ⚠️ 전방탐색으로 unit 5 블록만 끊는다. 뒤 전부를 먹으면 u6이 붙는 순간 깨진다. */
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/korean/5단원_인물에게마음을전해요');
const SRC01 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l01.html'), 'utf8');
const SRC02 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l02.html'), 'utf8');
const SRC03 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l03_04.html'), 'utf8');
const SRC05 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l05_06.html'), 'utf8');
const SRC07 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l07_08.html'), 'utf8');
const SRC09 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l09_11.html'), 'utf8');
const SRC12 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l12_13.html'), 'utf8');
const SRC14 = fs.readFileSync(path.join(SDIR, 'g3_kor_u5_l14.html'), 'utf8');
const SRCALL = [SRC01, SRC02, SRC03, SRC05, SRC07, SRC09, SRC12, SRC14];

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
/* ⚠️ 학생 본차시는 <b class="emph">가 낱말 한가운데를 가르고 글씨 쓰기 칸은
   글자를 하나씩 따로 담는다 -> 세 갈래 헬퍼가 필요하다 (u1·u4 선례). */
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
  w.eval(DATA4); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA4);
eval(DATA);
const L = global.window.LESSONS;

/* ⚠️ 8항목이다. u2~u4는 7항목이었다. */
const KEYS = ['u5_l01', 'u5_l02', 'u5_l03', 'u5_l05', 'u5_l07', 'u5_l09', 'u5_l12', 'u5_l14'];
const NS = { u5_l01: 1, u5_l02: 2, u5_l03: 3, u5_l05: 5, u5_l07: 7, u5_l09: 9, u5_l12: 12, u5_l14: 14 };
/* 3차시 묶음 36슬(120분) / 2차시 묶음 24슬(80분) / 단일 19슬(40분) */
const TRIPLE = ['u5_l09'];
const PAIRED = ['u5_l03', 'u5_l05', 'u5_l07', 'u5_l12'];
const SINGLE = KEYS.filter(k => !TRIPLE.includes(k) && !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = TRIPLE.includes(k) ? 36 : PAIRED.includes(k) ? 24 : 19; });
/* ⚠️ u3·u4(l03·l05·l07·l09·l10·l12)와 자리가 다르다. */
const SKIPPED = ['u5_l04', 'u5_l06', 'u5_l08', 'u5_l10', 'u5_l11', 'u5_l13'];

function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u5 8항목 로드 (u4 7항목 동반 로드)', () => {
  W = boot();
  const k5 = Object.keys(W.LESSONS).filter(k => k.startsWith('u5_'));
  ok(k5.length === 8, 'u5 항목 ' + k5.length);
  const k4 = Object.keys(W.LESSONS).filter(k => k.startsWith('u4_'));
  ok(k4.length === 7, 'u4 동반 로드 실패 ' + k4.length);
});
T('⚠️ 키가 건너뛴다 (l04·l06·l08·l10·l11·l13 없음 — u3·u4와 다른 자리)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u5_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  /* 앞 단원 자리를 물려받지 않았는지 역으로 못 박는다 */
  ok(!!L['u5_l03'] && !!L['u5_l05'], 'u3·u4 SKIPPED를 그대로 복제했다');
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
    const html = renderAll(W, 5, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ 전 항목에 review 실존 (u5_l01도 — 단원 넘는 계보)', () => {
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
    ok(renderAll(w2, 5, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
const q = (s) => ok(NOSTAR.includes(s), '본문 누락: ' + s);
const src = (s) => ok(TXTALL.includes(s), '본차시 근거 없음: ' + s);
const both = (s) => { src(s); q(s); };

T('① l01 성격의 뜻 + 성격 낱말 세 갈래', () => {
  both('남다른 성질이나 성품');
  ["'친절하다', '용감하다', '끈기 있다'처럼"].forEach(src);
  ['친절하다', '용감하다', '끈기 있다'].forEach(q);
});
T('② l01 성격 나타내는 말 정답1·오답2', () => {
  ['끈기 있다', '키가 크다', '사과를 좋아한다'].forEach(both);
  const s = L['u5_l01'].slides.find(x => x.id === 's09');
  ok(s.data.answer === '끈기 있다', '정답 어긋남 ' + s.data.answer);
});
T('③ l01 소단원 잇기 3짝', () => {
  ['인물의 성격 파악하며 읽기', '마음을 전하는 글 쓰기',
   '표기법·성격 낱말·글씨 다지기'].forEach(both);
});
T('④ l01 마음 전하면 좋은 때 정답3·오답2', () => {
  ['도와준 친구에게 고마울 때', '대회를 앞둔 친구를 응원할 때', '실수를 사과하고 싶을 때',
   '그냥 멍하니 있고 싶을 때', '할 일이 하나도 없을 때'].forEach(both);
});
T('⑤ l02 성격 파악 방법 정답3·오답2', () => {
  ['인물을 수식하는 말을 살펴봐요', '상황에서 인물이 한 말을 살펴봐요',
   '상황에서 인물이 한 행동을 살펴봐요', '그림만 대충 넘겨 봐요',
   '제목만 보고 짐작해요'].forEach(both);
});
T('⑥ l02 이야기 두 도막 6줄 원문 일치', () => {
  ['줄넘기 대회가 일주일 앞으로 다가왔어요.',
   '콩이와 별이는 아직 줄넘기를 잘 넘지 못했어요.',
   '둘은 운동장에서 연습을 시작했어요.',
   '성질이 급한 별이는 몇 번 해 보고 줄을 던졌어요.'].forEach(both);
  ['됐어. 난 못 해. 이제 그만할래.', '이렇게 그만둘 순 없어. 분명히 방법이 있을 거야.']
    .forEach(s => { ok(SQALL.includes(sq(s)), '본차시 근거 없음: ' + s); q(s); });
});
T('⑦ l02 직접 제시 정답·오답2 + 말↔성격 3짝', () => {
  ['성질이 급한', '줄넘기를', '집으로'].forEach(both);
  ['끈기 있다', '성질이 급하다', '포기가 빠르다'].forEach(both);
  const s = L['u5_l02'].slides.find(x => x.id === 's10');
  ok(s.data.answer === '성질이 급한', '정답 어긋남');
});
T('⑧ l03 성격 단서 정답3·오답2', () => {
  ['내 것은 내가 지킨다며 혼자 집을 지음', '어려워도 스스로 방법을 찾음',
   '도움받은 뒤 고마워하며 나눔', '낮잠만 자며 아무것도 안 함',
   '늘 남이 해 주기만 기다림'].forEach(both);
});
T('⑨ l03 이야기 두 도막 6줄 원문 일치', () => {
  ['마을 너구리들과 부딪히기 싫어 산꼭대기로 떠났어요.',
   '도리는 혼자 힘으로 튼튼한 집을 지었어요.',
   '어느 날 밤, 큰비가 내려 산꼭대기가 무너졌어요.',
   '도리는 무너진 기둥에 깔려 꼼짝할 수 없었어요.'].forEach(both);
  ['내가 모은 건 내 것', '여기는 산꼭대기인데, 누가 내 소리를 들을까']
    .forEach(s => { ok(SQALL.includes(sq(s)), '본차시 근거 없음: ' + s); q(s); });
});
T('⑩ l03 마음 고르기 정답·오답2 + 일어난 일↔마음 3짝', () => {
  ['무섭고 막막하다', '신나고 즐겁다', '나른하고 졸리다'].forEach(both);
  ['집이 무너져 갇힘', '이웃이 구해 줌', '함께 나누며 삶'].forEach(both);
  const s = L['u5_l03'].slides.find(x => x.id === 's16');
  ok(s.data.answer === '무섭고 막막하다', '정답 어긋남');
});
T('⑪ l05 그림책 단서 정답3·오답2', () => {
  ['인물이 한 말', '인물의 행동', '그림 속 인물의 표정과 몸짓',
   '글자의 크기와 색깔만', '책의 두께'].forEach(both);
});
T('⑫ l05 민서 편지 3줄 · 할머니 답장 3줄 원문 일치', () => {
  ['할머니께, 죄송해요. 그림을 그리다 공이 굴러가',
   '할머니 화분을 깨뜨렸어요. 제 실수예요.',
   '다시 잘 키울게요. 약속해요. ─ 민서 올림',
   '민서에게, 솔직하게 말해 줘서 고맙구나.',
   '화분은 괜찮으니 걱정 말거라.',
   '주말에 새 꽃 심는 걸 보여 주마. ─ 옆집 할머니로부터'].forEach(both);
});
T('⑬ l05 민서 성격 정답·오답2 + 말↔성격 3짝', () => {
  ['정직하다', '욕심이 많다', '쌀쌀맞다'].forEach(both);
  ['배려심이 많다', '책임감이 있다'].forEach(both);
  const s = L['u5_l05'].slides.find(x => x.id === 's10');
  ok(s.data.answer === '정직하다', '정답 어긋남');
});
T('⑭ l07 들어갈 내용 정답3·오답2 + 글 예시 3줄', () => {
  ['받는 사람과 쓴 사람', '마음을 전하는 상황', '전하고 싶은 마음',
   '받는 사람의 시험 점수', '오늘의 날씨 예보'].forEach(both);
  ['오늘 화분을 깨뜨려서 정말 죄송했어요.',
   '너그럽게 이해해 주셔서 고맙습니다. ─ 민서 올림'].forEach(both);
});
T('⑮ l07 높임 표현 정답·오답2 + 높임 세 자국', () => {
  ['할머니, 감사합니다.', '할머니, 고마워.', '할머니, 잘 있어.'].forEach(both);
  ['할머니께', '민서 올림'].forEach(both);
  const s = L['u5_l07'].slides.find(x => x.id === 's16');
  ok(s.data.answer === '할머니, 감사합니다.', '정답 어긋남');
});
T('⑯ l09 마음 나타내는 말 정답3·오답2 + 상황과 마음 3줄', () => {
  ['고마운 마음', '응원하는 마음', '걱정스러운 마음', '동그라미', '빨간색'].forEach(both);
  ['늘 응원해 주시는 부모님', '대회 연습을 열심히 하는 친구', '편찮으신 할머니',
   '감사한 마음'].forEach(both);
});
T('⑰ l09 어울리는 말 정답·오답2 + 다양한 표현 2종', () => {
  ['힘내! 넌 분명 잘할 거야.', '그거 한다고 되겠어?', '나랑은 상관없어.']
    .forEach(s => { ok(SQALL.includes(sq(s)), '본차시 근거 없음: ' + s); q(s); });
  ['덕분에 용기가 났어', '정말 든든했어'].forEach(both);
  ok(/언제·어디서·무슨 일/.test(NOSTAR), '구체적으로 쓰기 세 가지 누락');
});
T('⑱ l12 좋은 실천 정답3·오답2 + 예시 3줄', () => {
  ['읽을 사람의 마음을 헤아려요', '있었던 일을 구체적으로 써요', '진심을 담아 써요',
   '글씨를 아무렇게나 휘갈겨요', '마음과 상관없이 길게만 써요'].forEach(both);
  ['콩이에게, 끝까지 포기하지 않은 모습이 멋졌어.',
   '나도 너처럼 끈기 있게 해 볼게.'].forEach(both);
});
T('⑲ l12 인물↔마음 3짝 + 전학 가는 친구 정답·오답2', () => {
  ['본받고 싶은 마음', '칭찬하는 마음'].forEach(both);
  ['자주 못 봐서 아쉬워. 연락하자!', '잘됐다, 신난다!', '가든지 말든지.']
    .forEach(s => { ok(SQALL.includes(sq(s)), '본차시 근거 없음: ' + s); q(s); });
});
T('⑳ l14 마음 글 방법·성격 낱말 뜻 3짝·더 연습 3줄·글씨 3종', () => {
  ['전하고 싶은 마음을 구체적으로 쓴다', '마음과 상관없이 길게만 쓴다'].forEach(both);
  ok(SQALL.includes(sq("'고마워'만 여러 번 반복한다")), '본차시 근거 없음: 반복');
  ['쉽게 포기하지 않고 견딘다', '정이 많다', '거짓 없이 바르고 솔직하다',
   '다정하다'].forEach(both);
  ['제 방 청소는 제가 할게요.', '다음에는 약속을 꼭 지킬게요.',
   '문제가 없는지 잘 살펴볼게.'].forEach(both);
  /* 글씨 쓰기 칸은 글자를 하나씩 따로 담는다 -> sq() 갈래로 대조 */
  ['정직', '마음', '배려'].forEach(w => {
    ok(sq(SRC14).includes(w), '본차시 글씨 칸 없음: ' + w);
    ok(sq(BODY).includes(w), '본문 글씨 낱말 누락: ' + w);
  });
});

console.log('═══ D-2. -ㄹ게 표기 검산기 (u5 전용 갈래) ═══');
/* ⚠️ 자모 분해기. u3의 격음화 검산기에서 쓰던 분해기 계보다.
   u4의 띄어쓰기 검산기(공백 지운 글자열 대조)와는 판정 규칙이 완전히 다르다. */
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function dec(ch) {
  const c = ch.charCodeAt(0) - 0xAC00;
  if (c < 0 || c > 11171) return null;
  return { cho: CHO[Math.floor(c / 588)], jung: JUNG[Math.floor((c % 588) / 28)], jong: JONG[c % 28] };
}
T('자모 분해기 자체 검증 (갈·게·께·껄)', () => {
  const g = dec('갈'); ok(g.cho === 'ㄱ' && g.jung === 'ㅏ' && g.jong === 'ㄹ', '갈 ' + JSON.stringify(g));
  const e = dec('게'); ok(e.cho === 'ㄱ' && e.jung === 'ㅔ' && e.jong === '', '게 ' + JSON.stringify(e));
  const k = dec('께'); ok(k.cho === 'ㄲ' && k.jung === 'ㅔ' && k.jong === '', '께 ' + JSON.stringify(k));
  const l = dec('껄'); ok(l.cho === 'ㄲ' && l.jung === 'ㅓ' && l.jong === 'ㄹ', '껄 ' + JSON.stringify(l));
  ok(dec('A') === null, '한글 아닌 글자를 분해함');
});

/* 본문의 모든 `A ↔ B` 짝을 긁는다. ⚠️ ↔는 이 단원에서 -ㄹ게 표기 짝 전용이다.
   다른 뜻으로 ↔를 쓰면 여기서 레드가 난다(그것이 규약이다). */
const PAIRS = [...NOSTAR.matchAll(/([가-힣]+)\s*↔\s*([가-힣]+)/g)].map(m => [m[1], m[2]]);
T('⚠️ -ㄹ게 표기 짝 실존 (검산 대상 0건이면 죽은 게이트다)', () => {
  ok(PAIRS.length >= 5, '검산 대상 ' + PAIRS.length + '건 — u4 갈래를 복제해 죽었는지 확인');
});
T('⚠️ 짝 전수 검산 — 마지막 음절만 다르고 게(ㄱ)↔ㄲ, 앞 음절 종성 = ㄹ', () => {
  PAIRS.forEach(([good, bad]) => {
    ok(good.length === bad.length, '길이가 다르다: ' + good + ' / ' + bad);
    const n = good.length;
    ok(n >= 2, '너무 짧다: ' + good);
    for (let i = 0; i < n - 1; i++)
      ok(good[i] === bad[i], '마지막 음절 밖이 다르다: ' + good + ' / ' + bad);
    const g = dec(good[n - 1]), b = dec(bad[n - 1]), p = dec(good[n - 2]);
    ok(g && g.cho === 'ㄱ' && g.jung === 'ㅔ' && g.jong === '',
       '바른 쪽 끝이 「게」가 아니다: ' + good);
    ok(b && b.cho === 'ㄲ', '잘못된 쪽 끝 초성이 ㄲ이 아니다: ' + bad);
    ok(p && p.jong === 'ㄹ', '앞 음절 종성이 ㄹ이 아니다: ' + good);
  });
});
T('본차시가 -ㄹ게 표기 규칙을 실제로 다룬다 (근거 확인)', () => {
  const t14 = txt(SRC14);
  ok(t14.includes('내일 꼭 갈게.'), '본차시에 바른 표기 없음');
  ok(t14.includes('내일 꼭 갈께.'), '본차시에 잘못된 표기 보기 없음');
  ok(sq(SRC14).includes(sq("소리는 [께]로 나지만")), '본차시에 표기 원리 없음');
});

/* ⚠️ 오답 마스킹은 문자열이 아니라 **필드 단위**로 한다 (u2 선례).
   잘못된 표기가 실리는 곳은 l14의 이 세 필드뿐이다. */
const MASK14 = [['s04', 'kids'], ['s07', 'content'], ['s08', 'wrong'], ['s11', 'question']];
function maskedStudent() {
  const out = [];
  KEYS.forEach(k => {
    L[k].slides.forEach(s => {
      const c = JSON.parse(JSON.stringify(s));
      delete c.tnote;
      if (k === 'u5_l14') MASK14.forEach(([id, f]) => {
        if (c.id === id && c.data && c.data[f] !== undefined) delete c.data[f];
      });
      out.push(c);
    });
  });
  return plain(out);
}
function badSpots(s) {
  const hit = [];
  for (let i = 0; i + 1 < s.length; i++) {
    const a = dec(s[i]);
    if (a && a.jong === 'ㄹ' && (s[i + 1] === '께' || s[i + 1] === '껄'))
      hit.push(s.slice(Math.max(0, i - 3), i + 2));
  }
  return hit;
}
T('⚠️ 학생 노출 본문 전수 — 「종성 ㄹ + 께/껄」이 선언된 오답 밖에 0건', () => {
  const hit = badSpots(maskedStudent());
  ok(hit.length === 0, '잘못된 표기가 샜다: ' + hit.join(' / '));
  /* 마스킹이 통째로 먹어 검산이 죽지 않았는지 역으로 확인 */
  ok(badSpots(STUDENT).length >= 4,
     '마스킹 전에도 오답이 없다 — 판별 문제가 사라졌는지 확인');
});
T('⚠️ 높임 표현의 「께」는 잡지 않는다 (종성 ㄹ 뒤일 때만)', () => {
  ok(badSpots('할머니께 드립니다').length === 0, '높임 표현을 오탐했다');
  ok(badSpots('선생님께 올립니다').length === 0, '높임 표현을 오탐했다');
  ok(badSpots('내일 꼭 갈께.').length === 1, '잘못된 표기를 못 잡는다');
  ok(badSpots('내일 꼭 갈껄.').length === 1, '껄 갈래를 못 잡는다');
  ok(badSpots('내일 꼭 갈게.').length === 0, '바른 표기를 오탐했다');
});

console.log('═══ D-3. 높임 표현 검산기 ═══');
const HI = NOSTAR.match(/웃어른께 — ([^\/]+) \/ ([^\/]+) \/ ([^\\"]+)/);
const LO = NOSTAR.match(/친구에게 — ([^\/]+) \/ ([^\/]+) \/ ([^\\"]+)/);
T('⚠️ 검산 대상 실존 (웃어른께 / 친구에게 두 갈래)', () => {
  ok(HI, '웃어른께 예문이 없다 — 검산 대상 0건');
  ok(LO, '친구에게 예문이 없다 — 한 갈래만으로는 검산이 성립하지 않는다');
});
T('⚠️ 웃어른께 = 께 · -습니다/요 · 올림 세 자국 전수', () => {
  const [, to, mid, from] = HI;
  ok(to.trim().endsWith('께'), '받는 사람 뒤에 께가 없다: ' + to.trim());
  ok(/(습니다|요)\.$/.test(mid.trim()), '문장 끝이 높임이 아니다: ' + mid.trim());
  ok(from.trim().endsWith('올림'), '쓴 사람 뒤에 올림이 없다: ' + from.trim());
});
T('⚠️ 친구에게 = 에게 · 낮춤 · 올림 없음 (두 갈래가 갈려야 검산이 산다)', () => {
  const [, to, mid, from] = LO;
  ok(to.trim().endsWith('에게'), '받는 사람 뒤가 에게가 아니다: ' + to.trim());
  ok(!/(습니다|요)\.$/.test(mid.trim()), '친구 예문이 높임이다: ' + mid.trim());
  ok(!from.includes('올림') && from.trim().endsWith('가'),
     '친구 예문에 올림을 썼다: ' + from.trim());
});
T('본차시가 높임 세 자국을 실제로 가르친다 (근거 확인)', () => {
  const t7 = sq(SRC07);
  ['받는 사람 뒤에', '올림', '고맙습니다'].forEach(w =>
    ok(t7.includes(sq(w)), '본차시 근거 없음: ' + w));
});

console.log('═══ E. 저작권 · 용어 가드 ═══');
T('⚠️ 지도서 수록 제재명·작가명·인물명 0건 (국어 최우선 가드 · 차단 60종)', () => {
  /* u5 본차시 머리 주석이 명시적으로 회피한 것 = 지도서 편지글 인물 */
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
  const all = BAN_U5.concat(BAN_U4, BAN_U3, BAN_U2, BAN_U1);
  ok(all.length >= 60, '차단 목록이 줄었다 ' + all.length);
  const hit = all.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
  /* 본차시 주석이 이 인물들을 회피 대상으로 적어 두었는지 근거 확인 */
  ok(SRC09.includes('준우') && SRC09.includes('미인용'),
     '본차시가 편지글 인물을 회피 대상으로 적지 않았다 — 차단 목록 재검토');
});
T('⚠️ 낫표 제목 0건 — u5도 허용 목록이 비어 있다', () => {
  /* 본차시가 창작 제재명을 주석에만 두고 학생 화면 노출 0으로 못 박았다.
     앞 단원 게이트의 ALLOW 목록을 물려받으면 이 규약이 조용히 풀린다. */
  ok(SRC02.includes('slides 본문 노출 0') && SRC05.includes('slides 본문 노출 0'),
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
  ['「성격」', '「높임 표현」', '「상장」', '「우체통」', '「답장」']
    .forEach(w => ok(!BODY.includes(w), '낫표로 감쌈: ' + w));
  ok(STUDENT.includes('높임 표현'), '개념 이름표 자체가 없음');
});
T('미도입 갈래(4학년 이상·다른 단원 소관) 학생 노출 0', () => {
  /* ⚠️ '주제'는 단독 금지 대신 '주제문'으로만 건다 (u4 선례). */
  const BAN = ['서술자', '시점', '전지적', '갈등', '복선', '주제문', '개요',
               '평면적 인물', '입체적 인물', '비유', '은유', '직유', '의인법',
               '운율', '심상', '시적 화자', '연과 행', '행과 연', '기승전결'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['인물 묘사', '성격 묘사', '서사 구조', '정서 어휘', '화용', '경어법', '상대 높임법']
    .forEach(w => ok(!STUDENT.includes(w), '학생 노출: ' + w));
  ok(/성격|마음|계획/.test(TNOTE), 'tnote에 교사 몫 표지 없음');
});
T('⚠️ 신규 규약 ③ — 직접 제시·간접 제시는 쉬운 풀이말을 함께 붙인다', () => {
  /* 본차시가 슬라이드 tag로 학생 화면에 그대로 띄우는 용어다(렌더 대상).
     정직 원칙대로 감추지 않되 풀이말 동반을 못 박는다 (u2 준언어 선례). */
  ok(SRC02.includes('직접 제시') && SRC02.includes('간접 제시'),
     '본차시가 이 용어를 쓰지 않는다 — 단언 재검토');
  const l02 = plain(L['u5_l02'].slides);
  ok(l02.includes('직접 제시') && l02.includes('바로 알려 주는 방법'),
     '직접 제시에 풀이말이 없다');
  ok(l02.includes('간접 제시') && l02.includes('살펴서 아는 방법'),
     '간접 제시에 풀이말이 없다');
  /* 나머지 항목이 풀이말 없이 용어만 꺼내지 않는지 */
  KEYS.filter(k => k !== 'u5_l02').forEach(k =>
    ok(!studentText(k).includes('간접 제시'), k + '이 풀이말 없이 용어를 꺼냄'));
});
T('⚠️ 선행 용어 — 표정·몸짓 l05 · 높임 표현 l07 · 우체통 l12 · -ㄹ게 표기 l14', () => {
  const pre = (k, w) => {
    const t = plain(L[k].slides.filter(x => x.block !== 'next_lesson'));
    ok(!t.includes(w), k + ' 본문에 ' + w + ' 선행');
  };
  ['u5_l01', 'u5_l02', 'u5_l03'].forEach(k => pre(k, '표정과 몸짓'));
  ['u5_l01', 'u5_l02', 'u5_l03', 'u5_l05'].forEach(k => pre(k, '높임 표현'));
  ['u5_l01', 'u5_l02', 'u5_l03', 'u5_l05', 'u5_l07', 'u5_l09'].forEach(k => pre(k, '우체통'));
  KEYS.filter(k => k !== 'u5_l14').forEach(k => { pre(k, '-ㄹ게'); pre(k, '[께]'); });
  /* 도입 자리에는 실존해야 한다 */
  ok(plain(L['u5_l05'].slides).includes('표정과 몸짓'), 'l05에 표정·몸짓 도입 없음');
  ok(plain(L['u5_l07'].slides).includes('높임 표현'), 'l07에 높임 표현 도입 없음');
  ok(plain(L['u5_l12'].slides).includes('우체통'), 'l12에 우체통 도입 없음');
  ok(plain(L['u5_l14'].slides).includes('-ㄹ게'), 'l14에 표기 규칙 도입 없음');
});
T('l01은 단원 예고 차시 — 본차시가 예고하는 것만 예고한다', () => {
  /* ⚠️ 본차시 l01이 미리 보기에서 수식하는 말·말과 행동을 직접 예고한다.
     "앞 항목 본문 0"을 그대로 쓰면 깨진다 — 이름은 노출하되 연습은 뒤로 미룬다.
     ⚠️ next_lesson 슬라이드는 다음 시간 예고 자체라 선행 검사에서 뺀다(u3 선례). */
  ok(sq(SRC01).includes(sq('수식하는 말')) && sq(SRC01).includes(sq('말과 행동')),
     '본차시 l01이 예고하지 않는다 — 단언 재검토');
  const l01 = plain(L['u5_l01'].slides.filter(x => x.block !== 'next_lesson'));
  ok(/수식하는 말/.test(l01) && /말과 행동/.test(l01), 'l01 예고 누락');
  ok(!/직접 제시/.test(l01), 'l01이 l02 용어를 미리 꺼냄');
  ok(!/일관되게/.test(l01), 'l01이 l02 개념을 미리 꺼냄');
  ok(!/↔/.test(l01), 'l01이 표기 짝을 미리 꺼냄');
  const nx = plain(L['u5_l01'].slides.find(x => x.block === 'next_lesson'));
  ok(/수식하는 말/.test(nx) && /말과 행동/.test(nx),
     'l01 next_lesson이 다음 시간을 예고하지 않음');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 / 3차시 묶음 36슬', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
});
T('⚠️ 슬라이드 총합 189슬 (19+19+24+24+24+36+24+19)', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(tot === 189, '총합 ' + tot);
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
T('⚠️ 3차시 묶음 = 120분 · covers 물결 · period_split 경계 둘 (l09 하나뿐)', () => {
  ok(TRIPLE.length === 1, '3차시 묶음 개수 ' + TRIPLE.length);
  TRIPLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 120, k + ' ' + m.duration_min + '분');
    ok(/~/.test(m.covers), k + ' covers 구분자 ' + m.covers);
    ok(m.period_split === 's12,s24', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 2차시 묶음 = 80분 · covers 가운뎃점 · period_split 하나 (넷)', () => {
  ok(PAIRED.length === 4, '2차시 묶음 개수 ' + PAIRED.length);
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' ' + m.duration_min + '분');
    ok(m.covers.includes('·') && !/~/.test(m.covers), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 단일 차시 = 40분 · period_split 없음 · covers 단수 (셋 — 앞 단원은 둘)', () => {
  ok(SINGLE.length === 3, '단일 항목 개수 ' + SINGLE.length);
  SINGLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 40, k + ' ' + m.duration_min + '분');
    ok(!m.period_split, k + ' period_split 있음');
    ok(!/[·~]/.test(m.covers), k + ' covers ' + m.covers);
  });
});
T('⚠️ 수업시간 합 = 14차시 × 40분 = 560분', () => {
  const tot = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(tot === 560, '합 ' + tot);
});
T('⚠️ 교시 경계 슬라이드 tnote가 교시 끝을 적는다', () => {
  TRIPLE.concat(PAIRED).forEach(k => {
    L[k].meta.period_split.split(',').forEach((id, i) => {
      const s = L[k].slides.find(x => x.id === id);
      ok(s, k + ' 경계 슬라이드 없음: ' + id);
      ok(s.block === 'self_assessment', k + ' ' + id + ' 경계 블록 ' + s.block);
      ok(s.tnote && new RegExp((i + 1) + '교시').test(s.tnote.watch),
         k + ' ' + id + ' 교시 경계 미기재');
    });
  });
});
T('⚠️ 2교시 시작은 s13 · 3교시 시작은 s25 (제목이 이어짐을 밝힌다)', () => {
  TRIPLE.concat(PAIRED).forEach(k => {
    const s13 = L[k].slides.find(x => x.id === 's13');
    ok(s13 && /2교시/.test(s13.data.title || ''), k + ' 2교시 표시 없음');
  });
  TRIPLE.forEach(k => {
    const s25 = L[k].slides.find(x => x.id === 's25');
    ok(s25 && /3교시/.test(s25.data.title || ''), k + ' 3교시 표시 없음');
  });
  PAIRED.concat(SINGLE).forEach(k =>
    ok(!L[k].slides.some(x => /3교시/.test((x.data && x.data.title) || '')),
       k + '에 3교시 표시'));
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승 (l01은 단원을 넘는다)', () => {
  const chain = [['u5_l01', 'u4_l13'], ['u5_l02', 'u5_l01'], ['u5_l03', 'u5_l02'],
                 ['u5_l05', 'u5_l03'], ['u5_l07', 'u5_l05'], ['u5_l09', 'u5_l07'],
                 ['u5_l12', 'u5_l09'], ['u5_l14', 'u5_l12']];
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
T('leveled = 기본·도전·심화 3수준 · 심화 open (3차시 묶음은 2개)', () => {
  KEYS.forEach(k => {
    const lv = L[k].slides.filter(s => s.block === 'leveled_problem');
    ok(lv.length === (TRIPLE.includes(k) ? 2 : 1), k + ' leveled ' + lv.length);
    lv.forEach(s => {
      const v = s.data.levels;
      ['기본', '도전', '심화'].forEach(n => ok(v[n] && v[n].q && v[n].a, k + ' ' + n + ' 누락'));
      ok(v['심화'].open === true, k + ' 심화 open 아님');
      ['기본', '도전'].forEach(n => ok(Array.isArray(v[n].steps) && v[n].steps.length >= 3,
        k + ' ' + n + ' steps'));
    });
  });
});
T('offline_activity = 전 항목 유지 · 준비물·분 실존 (3차시 묶음은 2개)', () => {
  KEYS.forEach(k => {
    const of = L[k].slides.filter(s => s.block === 'offline_activity');
    ok(of.length === (TRIPLE.includes(k) ? 2 : 1), k + ' offline ' + of.length);
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
    ok(m.grade === 3 && m.subject === '국어' && m.unit === 5, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 마음 우체국', k + ' theme ' + m.theme);
    ok(/^\.\.\/\.\.\/grade3\/semester1\/korean\/5단원_/.test(m.live_url), k + ' live_url');
    const f = path.join(ROOT, m.live_url.replace(/^\.\.\/\.\.\//, ''));
    ok(fs.existsSync(f), k + ' 본차시 파일 없음 ' + m.live_url);
  });
});
T('⚠️ std = 전 항목 "단원 전체 통합" (본차시가 성취기준을 선언하지 않았다)', () => {
  KEYS.forEach(k => ok(L[k].meta.std === '단원 전체 통합', k + ' std ' + L[k].meta.std));
  SRCALL.forEach((s, i) => ok(!/\[4국/.test(s), '본차시 파일 ' + i + '에 성취기준 표기 실존 — 재검토'));
});
T('CURRICULUM ↔ LESSONS 정합 (u5 블록 8항목 · ready 8 = u5 완주)', () => {
  /* ⚠️ 다음 unit 앞에서 끊는 전방탐색. 뒤 전부를 먹으면 u6이 붙는 순간 무너진다. */
  const blk = (CURRIC_SRC.match(/unit:\s*5,[\s\S]*?(?=unit:\s*6,|\];)/) || [''])[0];
  ok(blk, 'CURRICULUM에 unit 5 블록 없음');
  ok(/lesson_count:\s*8/.test(blk), 'lesson_count 8 아님');
  const ns = [...blk.matchAll(/\{n:\s*(\d+)/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify(KEYS.map(k => NS[k])), 'n 목록 ' + ns.join(','));
  ok((blk.match(/ready:\s*true/g) || []).length === 8, 'ready 8 아님');
  KEYS.forEach(k => ok(blk.includes(L[k].meta.title.split(' (')[0]),
    k + ' 제목이 CURRICULUM에 없음'));
});
T('⚠️ 홈 배선 — 다섯 단원 전부 **닫는 태그까지** 성립한다 (u2 태그 누락 실측 자리)', () => {
  [1, 2, 3, 4, 5].forEach(n => {
    const re = new RegExp('<script src="data/g3_korean_u' + n + '\\.js"></script>');
    ok(re.test(HOME), 'u' + n + ' script 태그가 닫는 태그까지 성립하지 않는다');
  });
  const open = (HOME.match(/<script[\s>]/g) || []).length;
  const close = (HOME.match(/<\/script>/g) || []).length;
  ok(open === close, 'script 여닫이 개수 불일치 ' + open + '/' + close);
});
T('홈 slug · u1~u4 회귀', () => {
  ok(/slug:\s*"g3_korean"/.test(HOME), 'slug 어긋남');
  ok(!/g3_math/.test(HOME), 'g3_math 잔재');
  ['u1_l01', 'u2_l01', 'u3_l01', 'u4_l01'].forEach(k =>
    ok(CURRIC_SRC.includes('unit: ' + k[1]), 'unit ' + k[1] + ' 블록 없음'));
});
T('⚠️ 허브 "3_korean" 카운트 갱신 (8+7+7+7+8 = units 5 · lessons 37)', () => {
  const m = HUB.match(/"3_korean":\s*\{[^}]*units:\s*(\d+),\s*lessons:\s*(\d+)/);
  ok(m, '허브에 3_korean 미등재');
  ok(+m[1] === 5, 'units ' + m[1]);
  ok(+m[2] === 37, 'lessons ' + m[2]);
});
T('케이랩 매핑 없음 = 의도적 (편지·역할 말하기는 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_korean_klab.js')), 'klab 데이터가 생겼다');
  ok(!/klab/.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u5 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (칭찬·응원 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
  const hit = (BODY.match(/박수|박차|박탈|박살/g) || []);
  ok(hit.length === 0, hit.join(','));
  ok(BODY.includes('손뼉'), '손뼉으로 바꿔 쓴 곳이 없다 — 대체어 확인 필요');
});
T('채움말 "자리" 0 (보호 어휘 제외)', () => {
  const hit = (BODY.match(/[가-힣]+\s자리(?!값|수)/g) || [])
    .filter(s => !/(빈|제|학생|앉을|누울|한|두|세|네)\s*자리/.test(s));
  ok(hit.length === 0, hit.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
