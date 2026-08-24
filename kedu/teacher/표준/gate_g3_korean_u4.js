/* gate_g3_korean_u4.js — 케이티처 g3 국어 u4 「중요한 내용을 찾아요」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ u3 게이트 복제. u1~u3의 국어 규약을 계승하되 u4에서 처음 서는 셋을 새로 건다.
   (신규 ①) 국어 세 번째 기계 검산기 = **띄어쓰기 검산기**(D-2).
       본문의 모든 `A ↔ B` 띄어쓰기 짝을 긁어 **공백을 지운 글자열이 서로 같은지**를
       기계로 견준다. 한 글자라도 어긋나면 레드가 난다.
       ⚠️ u3의 `낱말 → [발음]` 꼴과 갈래가 다르다. u3 D-2를 그대로 복제하면
          검산 대상이 0건이 되어 **죽은 게이트가 그린으로 남는다**.
   (신규 ②) **낫표 허용 목록이 비어 있다**(E). u1~u3는 본차시가 자체 창작 제재의
       제목을 학생 화면에 노출했기에 허용 목록을 두었으나, u4 본차시는 창작 제재명을
       주석에만 두고 slides 본문 노출 0으로 못 박았다 -> 낫표 전수 검사 = **0건**.
       ⚠️ 앞 단원 게이트를 복제하며 허용 목록을 물려받으면 이 규약이 조용히 풀린다.
       게이트가 본차시 주석의 "본문 노출 0" 선언 자체를 근거로 확인한 뒤 단언한다.
   (신규 ③) **단원을 넘는 개념 재등장**. 문단·중심 문장·뒷받침 문장은 u3에서 배운
       개념인데 l06이 다시 쓴다. 새로 가르치는 척하지 않고 "3단원에서 배운"을
       밝히는지 검사한다(정직 원칙).
   ⚠️ 키 건너뜀 자리는 u3와 **같다**(l03·l05·l07·l09·l10·l12). u2와는 다르다.
   ⚠️ 3차시 묶음은 l08 하나뿐. review 계보는 u4_l01 <- u3_l13 (단원을 넘는다)
      -> 이 게이트는 data/g3_korean_u3.js도 함께 로드한다.
   ⚠️ 홈 배선은 **문자열 존재가 아니라 닫는 태그까지** 검사한다 — u2 script 태그에
      </script>가 빠져 u3.js가 통째로 로드되지 않던 것을 이번에 실측으로 잡았다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_korean_u4.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA3 = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u3.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u4.js'), 'utf8');
/* 용어·저작권 가드는 본문만 대상 — 머리 주석에 차단 목록 자체가 적혀 있어
   주석을 함께 걸면 게이트가 자기 주석에 걸려 넘어진다. */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_korean.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/korean/4단원_중요한내용을찾아요');
const SRC01 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l01.html'), 'utf8');
const SRC02 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l02_03.html'), 'utf8');
const SRC04 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l04_05.html'), 'utf8');
const SRC06 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l06_07.html'), 'utf8');
const SRC08 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l08_10.html'), 'utf8');
const SRC11 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l11_12.html'), 'utf8');
const SRC13 = fs.readFileSync(path.join(SDIR, 'g3_kor_u4_l13.html'), 'utf8');
const SRCALL = [SRC01, SRC02, SRC04, SRC06, SRC08, SRC11, SRC13];

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
/* ⚠️ 학생 본차시는 <b class="emph">가 낱말 한가운데를 가르고 글씨 쓰기 칸은
   글자를 하나씩 따로 담는다 -> 두 갈래 헬퍼가 필요하다 (u1 선례). */
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
  w.eval(DATA3); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA3);
eval(DATA);
const L = global.window.LESSONS;

const KEYS = ['u4_l01', 'u4_l02', 'u4_l04', 'u4_l06', 'u4_l08', 'u4_l11', 'u4_l13'];
const NS = { u4_l01: 1, u4_l02: 2, u4_l04: 4, u4_l06: 6, u4_l08: 8, u4_l11: 11, u4_l13: 13 };
/* 3차시 묶음 36슬(120분) / 2차시 묶음 24슬(80분) / 단일 19슬(40분) */
const TRIPLE = ['u4_l08'];
const PAIRED = ['u4_l02', 'u4_l04', 'u4_l06', 'u4_l11'];
const SINGLE = KEYS.filter(k => !TRIPLE.includes(k) && !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = TRIPLE.includes(k) ? 36 : PAIRED.includes(k) ? 24 : 19; });
/* ⚠️ u3와 같은 자리다. u2(l03·l04·l06·l08·l10·l11·l13)와는 다르다. */
const SKIPPED = ['u4_l03', 'u4_l05', 'u4_l07', 'u4_l09', 'u4_l10', 'u4_l12'];

function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u4 7항목 로드 (u3 7항목 동반 로드)', () => {
  W = boot();
  const k4 = Object.keys(W.LESSONS).filter(k => k.startsWith('u4_'));
  ok(k4.length === 7, 'u4 항목 ' + k4.length);
  const k3 = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(k3.length === 7, 'u3 동반 로드 실패 ' + k3.length);
});
T('⚠️ 키가 건너뛴다 (l03·l05·l07·l09·l10·l12 없음 — u3와 같은 자리)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u4_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
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
    const html = renderAll(W, 4, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ 전 항목에 review 실존 (u4_l01도 — 단원 넘는 계보)', () => {
  KEYS.forEach(k => ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
});
T('img 폴백 경로 실존 (미생성 = 폴백 정상)', () => {
  KEYS.forEach(k => {
    const m = L[k].slides.find(s => s.data && s.data.img);
    ok(m, k + ' img 없음');
    ok(/^assets\/photo\/korean\//.test(m.data.img), k + ' img 경로 ' + m.data.img);
  });
});

console.log('═══ C. 회귀 (7항목 전수 재부팅) ═══');
KEYS.forEach(k => {
  T(k + ' 회귀 부팅', () => {
    const w2 = boot();
    ok(renderAll(w2, 4, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
/* ① 메모 예시 세 줄 — 본차시 원문과 일치 */
const MEMO = ['날짜: 이번 주 토요일 오전 열 시', '장소: 학교 운동장',
              '할 일: 우리 반 친구들과 축구하기'];
T('① 메모 예시 3줄 원문 일치 (l01 ↔ SRC01)', () => {
  MEMO.forEach(s => {
    ok(txt(SRC01).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
});
/* ② 메모의 뜻·좋은 점 */
T('② 메모의 뜻 + 좋은 점 정답1·오답2 (l01)', () => {
  ok(BODY.includes('중요한 내용을 간단히 적어 둔 글'), '메모 정의 어긋남');
  ok(txt(SRC01).includes('중요한 내용을 간단히 적어 둔 글'), '본차시 근거 없음');
  const s09 = L['u4_l01'].slides.find(s => s.id === 's09').data;
  ok(s09.answer === '중요한 내용을 오래 기억할 수 있어요', '정답 어긋남: ' + s09.answer);
  ['들은 내용을 모두 잊어버려요', '생각이 더 헷갈려요']
    .forEach(w => ok(s09.question.includes(w), '오답 보기 누락: ' + w));
  ok(!s09.answer.includes('잊어버려요') && !s09.answer.includes('헷갈려요'),
     '오답이 정답으로 샜다');
});
/* ③ 메모가 도움이 되는 때 정답3·오답2 */
T('③ 메모가 도움이 되는 때 정답3·오답2 (l01)', () => {
  const s11 = L['u4_l01'].slides.find(s => s.id === 's11').data;
  ['친구와 만날 약속을 정할 때', '수업에서 중요한 내용을 들을 때', '해야 할 준비물을 기억할 때']
    .forEach(w => { ok(s11.answer.includes(w), '정답 누락: ' + w); ok(txt(SRC01).includes(w.replace(' 때', '')) || txt(SRC01).includes(w), '본차시 근거 없음: ' + w); });
  ok(s11.question.includes('그냥 멍하니 쉬고 싶을 때'), '오답 보기 누락');
  ok(!s11.answer.includes('멍하니'), '오답이 정답으로 샜다');
});
/* ④ 듣기 전 준비 3종 */
T('④ 듣기 전 준비 3종(듣는 목적·아는 내용·강조하는 내용) (l02)', () => {
  ['듣는 목적', '아는 내용', '강조하는 내용']
    .forEach(w => { ok(BODY.includes(w), '케이티처에 없음: ' + w); ok(txt(SRC02).includes(w), '본차시에 없음: ' + w); });
  const s09 = L['u4_l02'].slides.find(s => s.id === 's09').data;
  ok(s09.question.includes('딴생각을 하며 들어요'), '오답 보기 누락');
  ok(!s09.answer.includes('딴생각'), '오답이 정답으로 샜다');
});
/* ⑤ 무당벌레 설명 3문장 — 본차시 원문과 완전 일치 */
const LADYBUG = ['무당벌레는 진딧물을 잡아먹어 식물을 지켜요.',
                 '등에 있는 점의 개수로 종류를 구별해요.',
                 '위험하면 다리를 오므리고 죽은 척해요.'];
T('⑤ 무당벌레 설명 3문장 원문 일치 (l02 ↔ SRC02)', () => {
  LADYBUG.forEach(s => {
    ok(txt(SRC02).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  const s10 = L['u4_l02'].slides.find(s => s.id === 's10').data;
  ok(s10.answer === '진딧물', '정답 어긋남: ' + s10.answer);
  ['꽃잎', '작은 돌'].forEach(w => ok(s10.question.includes(w), '오답 보기 누락: ' + w));
});
/* ⑥ 정리 방법 3짝 */
T('⑥ 제목·숫자·기호 ↔ 하는 일 3짝 (l02)', () => {
  const s16 = L['u4_l02'].slides.find(s => s.id === 's16').data;
  [['제목', '한눈에 알게 묶어 줘요'], ['숫자', '차례를 매겨 나누어 줘요'],
   ['기호', '눈에 띄게 해요']].forEach(([a, b]) => {
    ok(s16.answer.includes(a) && s16.answer.includes(b), '짝 어긋남: ' + a);
    ok(txt(SRC02).includes(b), '본차시 근거 없음: ' + b);
  });
});
/* ⑦ 영상의 세 요소 + 영상 내용 3줄 */
const EARTH = ['지구의 날은 4월 22일이에요.',
               '환경을 생각하고 지구를 지키자는 날이에요.',
               '이날에는 불을 끄고 쓰레기를 줍는 행사를 해요.'];
T('⑦ 영상 내용 3줄 원문 일치 + 4월 22일 판별 (l04 ↔ SRC04)', () => {
  EARTH.forEach(s => {
    ok(txt(SRC04).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  const s10 = L['u4_l04'].slides.find(s => s.id === 's10').data;
  ok(s10.answer === '지구의 날', '정답 어긋남: ' + s10.answer);
  ['생일잔치 날', '물건 사는 날'].forEach(w => ok(s10.question.includes(w), '오답 보기 누락: ' + w));
});
/* ⑧ 화면 요소 3짝 */
T('⑧ 소리·글·그림 ↔ 하는 일 3짝 (l04)', () => {
  const s16 = L['u4_l04'].slides.find(s => s.id === 's16').data;
  [['소리', '설명을 들려줘요'], ['글', '중요한 말을 글자로 보여줘요'],
   ['그림·장면', '실제 모습을 눈으로 보여줘요']].forEach(([a, b]) => {
    ok(s16.answer.includes(b), '짝 어긋남: ' + a);
    ok(txt(SRC04).includes(b), '본차시 근거 없음: ' + b);
  });
  const s09 = L['u4_l04'].slides.find(s => s.id === 's09').data;
  ['눈을 감고 소리만 들어요', '빨리 넘겨 대충 봐요']
    .forEach(w => ok(s09.question.includes(w), '오답 보기 누락: ' + w));
  ok(!s09.answer.includes('눈을 감고') && !s09.answer.includes('빨리 넘겨'), '오답이 정답으로 샜다');
});
/* ⑨ 소금 문단 3문장 + 중심 문장 판별 */
const SALT_PARA = ['먼저, 바닷물을 넓은 염전에 가두어요.',
                   '염전은 바닷가에 만든 얕은 밭이에요.',
                   '바닷물을 얕게 가두면 햇볕을 잘 받아요.'];
T('⑨ 소금 문단 3문장 원문 일치 + 중심 문장 판별 (l06 ↔ SRC06)', () => {
  SALT_PARA.forEach(s => {
    ok(txt(SRC06).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  const s10 = L['u4_l06'].slides.find(s => s.id === 's10').data;
  ok(s10.answer === '바닷물을 넓은 염전에 가두어요', '정답 어긋남: ' + s10.answer);
  ok(s10.question.includes('염전은 바닷가에 만든 얕은 밭이에요'), '뒷받침 보기 누락');
});
/* ⑩ 낱말 뜻 3짝 */
T('⑩ 염전·물기·알갱이 ↔ 뜻 3짝 (l06)', () => {
  [['염전', '바닷물을 가두어 소금을 얻는 밭'], ['물기', '젖어 있는 물의 기운'],
   ['알갱이', '작고 동그란 낱낱의 덩이']].forEach(([a, b]) => {
    ok(BODY.includes(b), '뜻 누락: ' + a);
    ok(txt(SRC06).includes(b), '본차시 근거 없음: ' + b);
  });
});
/* ⑪ 간추림 3문장 */
const SALT_SUM = ['소금은 바닷물에서 얻을 수 있어요.',
                  '바닷물을 넓은 염전에 가두어요.',
                  '햇볕과 바람에 물기를 말리면 소금 알갱이가 남아요.'];
T('⑪ 중심 문장만 모은 간추림 3문장 원문 일치 (l06 ↔ SRC06)', () => {
  SALT_SUM.forEach(s => {
    ok(txt(SRC06).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
});
/* ⑫ 이야기 세 도막 원문 일치 */
const STORY1 = ['지우는 학교에서 방울토마토 모종을 받았어요.',
                '베란다에 심고 날마다 물을 주었어요.',
                '빨간 토마토가 열릴 생각에 마음이 설렜어요.'];
const STORY2 = ['어느 날, 지우는 잎이 축 시든 것을 보았어요.',
                '물을 주었는데도 시들어서 속이 상했어요.'];
const STORY3 = ['지우가 볕 드는 곳에 화분을 옮기자 토마토가 다시 살아났어요.'];
T('⑫ 이야기 세 도막 원문 일치 (l08 ↔ SRC08)', () => {
  STORY1.concat(STORY2, STORY3).forEach(s => {
    ok(txt(SRC08).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  /* 따옴표가 든 두 줄은 본차시가 &quot; 로 담아 두어 sq() 갈래로 대조한다 */
  ['내토마토가왜이러지', '햇볕과바람도함께길러준단다']
    .forEach(s => { ok(sq(SRC08).includes(s), '본차시에 없음: ' + s); ok(sq(BODY).includes(s), '케이티처에 없음: ' + s); });
});
/* ⑬ 인물 마음 판별 + 일어난 일↔마음 3짝 */
T('⑬ 인물 마음 판별 + 일어난 일 ↔ 마음 3짝 (l08)', () => {
  const s17 = L['u4_l08'].slides.find(s => s.id === 's17').data;
  ok(s17.answer === '속상하다', '정답 어긋남: ' + s17.answer);
  ['신난다', '졸리다'].forEach(w => ok(s17.question.includes(w), '오답 보기 누락: ' + w));
  const s28 = L['u4_l08'].slides.find(s => s.id === 's28').data;
  [['모종을 받아 심음', '설렌다'], ['잎이 시들어 버림', '속상하다'],
   ['토마토가 익음', '기쁘고 고맙다']].forEach(([a, b]) => {
    ok(s28.answer.includes(a) && s28.answer.includes(b), '짝 어긋남: ' + a);
    ok(txt(SRC08).includes(b), '본차시 근거 없음: ' + b);
  });
});
/* ⑭ 종이비행기 3줄 + 판별 */
const PLANE = ['종이를 반으로 접어 가운데 선을 만들어요.',
               '양쪽 모서리를 가운데 선에 맞추어 접어요.',
               '날개를 반듯하게 접으면 멀리 날아가요.'];
T('⑭ 종이비행기 3줄 원문 일치 + 판별 (l11 ↔ SRC11)', () => {
  PLANE.forEach(s => {
    ok(txt(SRC11).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  const s09 = L['u4_l11'].slides.find(s => s.id === 's09').data;
  ok(s09.answer === '날개를 반듯하게 접어요', '정답 어긋남: ' + s09.answer);
  ['종이를 마구 구겨요', '종이를 잘게 잘라요']
    .forEach(w => ok(s09.question.includes(w), '오답 보기 누락: ' + w));
});
/* ⑮ 바른 자세 3줄 + 방법↔좋은 점 3짝 */
const POSTURE = ['등을 곧게 펴고 앉아요.', '두 발을 바닥에 나란히 두어요.',
                 '책은 눈에서 알맞게 떨어뜨려 봐요.'];
T('⑮ 바른 자세 3줄 원문 일치 + 방법 ↔ 좋은 점 3짝 (l11 ↔ SRC11)', () => {
  POSTURE.forEach(s => {
    ok(txt(SRC11).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  const s16 = L['u4_l11'].slides.find(s => s.id === 's16').data;
  [['등을 곧게 펴기', '허리가 아프지 않아요'], ['두 발을 바닥에 두기', '몸이 안정돼요'],
   ['책을 알맞게 떨어뜨리기', '눈이 편해요']].forEach(([a, b]) => {
    ok(s16.answer.includes(a) && s16.answer.includes(b), '짝 어긋남: ' + a);
    ok(txt(SRC11).includes(b), '본차시 근거 없음: ' + b);
  });
});
/* ⑯ 메모 점검 3항목 */
T('⑯ 메모 점검 3항목 (l11)', () => {
  ['내용에 알맞은 제목을 썼나요', '숫자나 기호를 사용해 정리했나요',
   '중요한 내용을 한눈에 알아볼 수 있나요'].forEach(w => {
    ok(NOSTAR.includes(w), '케이티처에 없음: ' + w);
    ok(txt(SRC11).includes(w), '본차시에 없음: ' + w);
  });
});
/* ⑰ 스스로 확인 정답3·오답2 */
T('⑰ 스스로 확인 정답3·오답2 (l13)', () => {
  const s09 = L['u4_l13'].slides.find(s => s.id === 's09').data;
  ['설명을 들을 때에는 간단히 메모한다', '문단의 중심 문장과 뒷받침 문장을 파악한다',
   '이야기는 일어난 일을 중심으로 파악한다'].forEach(w => {
    ok(s09.answer.includes(w), '정답 누락: ' + w);
    ok(txt(SRC13).includes(w), '본차시 근거 없음: ' + w);
  });
  ['자신이 좋아하는 경험만 떠올린다', '중요하지 않은 내용까지 모두 적는다']
    .forEach(w => ok(s09.question.includes(w), '오답 보기 누락: ' + w));
  ok(!s09.answer.includes('좋아하는 경험만') && !s09.answer.includes('모두 적는다'),
     '오답이 정답으로 샜다');
});
/* ⑱ 생각그물 3짝 */
T('⑱ 생각그물 기준 ↔ 낱말 3짝 (l13)', () => {
  const s11 = L['u4_l13'].slides.find(s => s.id === 's11').data;
  [['색깔', '빨강·노랑'], ['맛', '달다·시다'], ['종류', '사과·배·귤']]
    .forEach(([a, b]) => {
      ok(s11.answer.includes(a) && s11.answer.includes(b), '짝 어긋남: ' + a);
      ok(sq(SRC13).includes(b.replace(/·/g, '')) || sq(SRC13).includes(b),
         '본차시 근거 없음: ' + b);
    });
  ok(BODY.includes('가지처럼 이어 모은 것'), '생각그물 정의 어긋남');
  ok(txt(SRC13).includes('가지처럼 이어 모은 것'), '본차시 근거 없음');
});
/* ⑲ 글씨 쓰기 3종 — sq() 대조 (본차시는 글자를 칸에 갈라 담는다) */
T('⑲ 글씨 쓰기 3종(중요·내용·메모) sq() 대조 (l13 ↔ SRC13)', () => {
  ['중요', '내용', '메모'].forEach(w => {
    ok(sq(SRC13).includes(w), '본차시 글씨 쓰기 칸에 없음: ' + w);
    ok(BODY.includes(w), '케이티처에 없음: ' + w);
  });
  const s18 = plain(L['u4_l13'].slides.find(s => s.id === 's18'));
  ['중요', '내용', '메모'].forEach(w => ok(s18.includes(w), 's18 글씨 쓰기 누락: ' + w));
});

console.log('═══ D-2. ⚠️ 띄어쓰기 검산기 (신규 · 공백 제거 동일성을 기계로 견줌) ═══');
/* ⚠️ u3의 `낱말 → [발음]` 검산기와 갈래가 다르다. 그것을 그대로 복제하면
   검산 대상 0건으로 조용히 죽는다. 여기서는 `A ↔ B` 짝을 긁어
   **공백을 지운 글자열이 서로 같은지**를 기계로 견준다. */
const strip = (s) => s.replace(/\s+/g, '');
T('띄어쓰기 검산기 자체 검증 (역검증 포함)', () => {
  ok(strip('아이가 오리를') === strip('아이 가오리를'), '검산기가 참을 거짓이라 함');
  ok(strip('아빠가 방에') === strip('아빠 가방에'), '검산기가 참을 거짓이라 함');
  /* 역검증: 글자가 하나라도 다르면 반드시 걸려야 한다 */
  ok(strip('아이가 오리를') !== strip('아이 가오리롤'), '검산기가 거짓을 참이라 함');
});
T('⚠️ 본문의 모든 `A ↔ B` 짝을 기계로 전수 검산 (공백 제거 동일)', () => {
  const pairs = [...BODY.matchAll(/([가-힣][가-힣 ]{1,23}) ↔ ([가-힣][가-힣 ]{1,23})/g)];
  ok(pairs.length >= 6, '검산 대상이 모자라다 (' + pairs.length + '건)');
  pairs.forEach(([, a, b]) => {
    ok(strip(a) === strip(b),
       '띄어쓰기 짝이 아니다: ' + a + ' ↔ ' + b + ' (' + strip(a) + ' vs ' + strip(b) + ')');
  });
});
T('⚠️ 여섯 짝이 모두 실존하고 본차시가 근거를 준다', () => {
  const P = [['아이가 오리를', '아이 가오리를'], ['아빠가 방에', '아빠 가방에'],
             ['오늘 밤나무를 심자', '오늘 밤 나무를 심자'], ['나물 좀 줘', '나 물 좀 줘'],
             ['손수건으로 닦아', '손 수건으로 닦아'], ['나무 그늘', '나 무그늘']];
  P.forEach(([a, b]) => {
    ok(BODY.includes(a + ' ↔ ' + b), '짝 누락: ' + a + ' ↔ ' + b);
    ok(sq(SRC13).includes(strip(a)), '본차시 근거 없음: ' + a);
  });
});
T('⚠️ 판별 문제의 정답·오답이 보존된다 (역검증)', () => {
  const s10 = L['u4_l13'].slides.find(s => s.id === 's10').data;
  ok(s10.answer === '오늘 밤나무를 심자', '정답 어긋남: ' + s10.answer);
  ok(s10.question.includes('오늘 밤 나무를 심자'), '오답 보기 소실');
  ok(txt(SRC13).includes('오늘 밤나무를 심자'), '본차시 근거 없음');
});
T('⚠️ 띄어쓰기 두 쪽의 뜻이 서로 다르게 적혀 있다', () => {
  const s12 = L['u4_l13'].slides.find(s => s.id === 's12').data.levels;
  ok(s12['기본'].a.includes('오리를 본 아이') && s12['기본'].a.includes('가오리를 본 아이'),
     '기본 뜻 두 갈래 아님');
  ok(s12['도전'].a.includes('방으로 들어감') && s12['도전'].a.includes('가방 속'),
     '도전 뜻 두 갈래 아님');
});

console.log('═══ D-3. ⚠️ 문단 짜임 검산기 (중심 하나 + 뒷받침 화제 공유) ═══');
T('완성 문단은 중심 문장 하나 + 뒷받침 여럿이다 (화제 낱말 공유)', () => {
  const paras = [
    { name: '소금 문단', lines: SALT_PARA, topic: '염전|바닷물' },
    { name: '소금 간추림', lines: SALT_SUM, topic: '바닷물|소금' },
    { name: '이야기 첫 도막', lines: STORY1, topic: '토마토|물|모종' },
  ];
  paras.forEach(p => {
    p.lines.forEach(l => ok(BODY.includes(l), p.name + ' 문장 누락: ' + l));
    const hit = p.lines.filter(l => new RegExp(p.topic).test(l)).length;
    ok(hit >= 2, p.name + ' 화제 공유 ' + hit + '문장 (2 미만)');
    ok(p.lines.length >= 3 && p.lines.length <= 4, p.name + ' 문장 수 ' + p.lines.length);
  });
});
T('⚠️ 뒷받침 문장이 중심 문장으로 새지 않는다 (역검증)', () => {
  const s10 = L['u4_l06'].slides.find(s => s.id === 's10').data;
  ['염전은 바닷가에 만든 얕은 밭이에요', '얕게 가두면 햇볕을 잘 받아요']
    .forEach(w => ok(!s10.answer.includes(w), '뒷받침 문장이 정답으로 샜다: ' + w));
  /* 소금 문단의 뒷받침 두 문장은 l06 밖으로 새면 안 된다 */
  KEYS.filter(k => k !== 'u4_l06').forEach(k =>
    ok(!studentText(k).includes('염전은 바닷가에 만든 얕은 밭'), k + '에 소금 문단이 샜다'));
});

console.log('═══ E. 저작권 · 용어 가드 ═══');
T('⚠️ 지도서 수록 제재명·작가명 0건 (국어 최우선 가드 · 차단 47종)', () => {
  /* u4 본차시 머리 주석이 명시적으로 회피한 것 */
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
  const all = BAN_U4.concat(BAN_U3, BAN_U2, BAN_U1);
  ok(all.length >= 47, '차단 목록이 줄었다 ' + all.length);
  const hit = all.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 낫표 제목 0건 — u4는 허용 목록이 비어 있다 (앞 단원과 갈리는 자리)', () => {
  /* ⚠️ 본차시가 창작 제재명을 주석에만 두고 학생 화면 노출 0으로 못 박았다.
     그 선언 자체를 근거로 확인한 뒤 케이티처도 0건임을 단언한다.
     앞 단원 게이트의 ALLOW 목록을 복제하면 이 규약이 조용히 풀린다. */
  ok(SRC06.includes('slides 본문 노출 0') && SRC08.includes('slides 본문 노출 0'),
     '본차시가 노출 0을 선언하지 않는다 — 단언 재검토');
  const uniq = [...new Set(BODY.match(/「[^」]+」/g) || [])];
  ok(uniq.length === 0, '낫표 제목이 생겼다: ' + uniq.join(','));
  /* 본차시 학생 화면에도 창작 제재명이 없어야 한다 (본차시 자체 검사) */
  ['소금은 어떻게 만들어질까', '지우의 방울토마토'].forEach(t => {
    const body6 = SRC06.split('const slides=[')[1] || '';
    const body8 = SRC08.split('const slides=[')[1] || '';
    ok(!body6.includes(t) && !body8.includes(t), '본차시 slides에 제재명 노출: ' + t);
  });
});
T('⚠️ 개념 이름표는 낫표로 감싸지 않는다 (중심 문장 등)', () => {
  ['「중심 문장」', '「뒷받침 문장」', '「문단」', '「메모」', '「생각그물」']
    .forEach(w => ok(!BODY.includes(w), '낫표로 감쌈: ' + w));
  ok(STUDENT.includes('중심 문장'), '개념 이름표 자체가 없음');
});
T('미도입 갈래(4학년 이상 소관) 학생 노출 0', () => {
  /* ⚠️ '연'은 단독으로 걸면 안 된다 — 연습·자연·연필이 통째로 오탐 (u1 선례).
     '주제'도 단독 금지 대신 '주제문'으로만 건다. */
  const BAN = ['서론', '본론', '주제문', '개요', '논설문', '비유', '은유', '직유',
               '의인법', '운율', '심상', '시적 화자', '복선', '시점', '설의법',
               '연과 행', '행과 연', '기승전결', '요약문', '개요표'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['문장 성분', '읽기 유창성', '의미 단위', '통일성', '응집성', '격음화', '어휘 구조화']
    .forEach(w => ok(!STUDENT.includes(w), '학생 노출: ' + w));
  ok(/메모|차례|마음/.test(TNOTE), 'tnote에 교사 몫 표지 없음');
});
T('⚠️ 신규 규약 ③ — 문단·중심 문장은 3단원에서 배운 개념임을 밝힌다', () => {
  /* 본차시가 이 개념을 새로 정의하지 않고 되짚는 자리다. 정직 원칙대로
     케이티처도 새로 가르치는 척하지 않고 앞 단원 것임을 밝힌다. */
  const l06 = plain(L['u4_l06'].slides);
  ok(/3단원에서 배운/.test(l06), 'l06이 앞 단원 개념임을 밝히지 않음');
  ok(l06.includes('한 가지 생각을 나타내는 글의 단위'), 'l06에 문단 되짚기 없음');
  ok(txt(SRC06).includes('한 가지 생각을 나타내는 글의 단위'), '본차시 근거 없음');
  /* 앞 세 항목은 이 개념을 미리 꺼내지 않는다 (l01은 단원 계획이라 예외 없음) */
  ['u4_l02', 'u4_l04'].forEach(k =>
    ok(!studentText(k).includes('뒷받침 문장'), k + '이 뒷받침 문장을 미리 꺼냄'));
});
T('⚠️ 선행 용어 — 띄어쓰기·생각그물은 l13 도입 (l01 단원 계획만 예외)', () => {
  /* ⚠️ u3의 "앞 항목 본문 0" 단언을 그대로 복제하면 여기서 깨진다.
     본차시 l01이 소단원 잇기에서 「띄어쓰기·생각그물·글씨 다지기」를 단원 계획으로
     직접 예고하기 때문이다. 정직 원칙대로 케이티처도 이름은 그대로 노출하되
     정의와 활동은 l13으로 미룬다. 게이트는 그 경계를 검사한다. */
  ok(sq(SRC01).includes('띄어쓰기·생각그물'), '본차시 l01이 예고하지 않는다 — 단언 재검토');
  const l01 = plain(L['u4_l01'].slides);
  ok(l01.includes('생각그물'), 'l01 예고 누락');
  ok(!l01.includes('가지처럼 이어 모은 것'), 'l01이 생각그물 정의를 미리 꺼냄');
  ok(!l01.includes('↔'), 'l01이 띄어쓰기 짝을 미리 꺼냄');
  KEYS.filter(k => k !== 'u4_l13' && k !== 'u4_l01').forEach(k => {
    const t = plain(L[k].slides.filter(x => x.block !== 'next_lesson'));
    ['생각그물', '띄어쓰기'].forEach(w => ok(!t.includes(w), k + ' 본문에 ' + w + ' 선행'));
  });
  ok(plain(L['u4_l13'].slides).includes('가지처럼 이어 모은 것'), 'l13에 정의 도입 없음');
});
T('l01은 단원 예고 차시 — 두 소단원 이름만 소개하고 본론은 뒤로 미룬다', () => {
  /* ⚠️ next_lesson 슬라이드는 다음 시간 예고 자체라 선행 검사에서 뺀다 (u3 선례) */
  const l01 = plain(L['u4_l01'].slides.filter(x => x.block !== 'next_lesson'));
  ok(/듣고 보며/.test(l01) && /간추리기/.test(l01), 'l01 예고 누락');
  ok(!/중심 문장/.test(l01), 'l01이 뒤 차시 본론을 미리 꺼냄');
  ok(!/제목·숫자·기호/.test(l01), 'l01이 l02 정리 방법을 미리 꺼냄');
  ok(/제목·숫자·기호/.test(plain(L['u4_l01'].slides.find(x => x.block === 'next_lesson'))),
     'l01 next_lesson이 다음 시간을 예고하지 않음');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 / 3차시 묶음 36슬', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
});
T('extras 20~30 · 참조 무결성 · 중복 0', () => {
  KEYS.forEach(k => {
    const ids = L[k].extras.map(e => e.id);
    ok(ids.length >= 20 && ids.length <= 30, k + ' extras ' + ids.length);
    ok(new Set(ids).size === ids.length, k + ' extras 중복');
    L[k].slides.forEach(s => (s.suggested_extras || []).forEach(x =>
      ok(ids.includes(x), k + ' 깨진 참조 ' + x)));
    L[k].extras.forEach(e => ok(Array.isArray(e.fit_slides) && e.fit_slides.length >= 2,
      k + ' fit_slides ' + e.id));
  });
});
T('tnote 6슬 이상 · 구조 정합', () => {
  KEYS.forEach(k => {
    const n = L[k].slides.filter(s => s.tnote).length;
    ok(n >= 6, k + ' tnote ' + n);
    L[k].slides.filter(s => s.tnote).forEach(s => {
      ok(Array.isArray(s.tnote.ask) && s.tnote.ask.length >= 2, k + ' ' + s.id + ' ask');
      ok(typeof s.tnote.watch === 'string' && s.tnote.watch.length > 5, k + ' ' + s.id + ' watch');
      ok(typeof s.tnote.min === 'number', k + ' ' + s.id + ' min');
    });
  });
});
T('⚠️ 3차시 묶음 = 120분 · covers 물결 · period_split 경계 둘 (l08 하나뿐)', () => {
  ok(TRIPLE.length === 1, 'u4의 3차시 묶음은 하나다');
  TRIPLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 120, k + ' duration ' + m.duration_min);
    ok(/차시$/.test(m.covers) && m.covers.includes('~'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12,s24', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 2차시 묶음 = 80분 · covers 가운뎃점 · period_split 하나 (넷)', () => {
  ok(PAIRED.length === 4, 'u4의 2차시 묶음은 넷이다');
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' duration ' + m.duration_min);
    ok(/차시$/.test(m.covers) && m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
});
T('단일 차시 = 40분 · period_split 없음 · covers 단수', () => {
  SINGLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 40, k + ' duration ' + m.duration_min);
    ok(!m.period_split, k + '에 period_split');
    ok(!/·|~/.test(m.covers), k + ' covers ' + m.covers);
  });
});
T('⚠️ 수업시간 합 = 13차시 × 40분 = 520분', () => {
  const sum = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(sum === 520, '합 ' + sum + '분');
});
T('⚠️ 슬라이드 총합 170슬 (19+24+24+24+36+24+19)', () => {
  const sum = KEYS.reduce((a, k) => a + L[k].slides.length, 0);
  ok(sum === 170, '합 ' + sum + '슬');
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
  const chain = [['u4_l01', 'u3_l13'], ['u4_l02', 'u4_l01'], ['u4_l04', 'u4_l02'],
                 ['u4_l06', 'u4_l04'], ['u4_l08', 'u4_l06'], ['u4_l11', 'u4_l08'],
                 ['u4_l13', 'u4_l11']];
  chain.forEach(([cur, prev]) => {
    const r = L[cur].slides.find(s => s.block === 'review');
    ok(r.data.from === prev, cur + ' from ' + r.data.from);
    ok(L[prev], cur + '의 계보 대상 ' + prev + '이 로드되지 않았다');
    const ex = L[prev].slides.find(s => s.block === 'exit_ticket').data.items;
    ok(JSON.stringify(r.data.items) === JSON.stringify(ex), cur + ' 계승 어긋남');
  });
});
T('exit_ticket = 확인 3문항 + 신호등 3', () => {
  KEYS.forEach(k => {
    const e = L[k].slides.find(s => s.block === 'exit_ticket').data;
    ok(e.items.length === 3, k + ' items ' + e.items.length);
    ok(e.self.length === 3, k + ' self ' + e.self.length);
    e.items.forEach(it => ok(it.q && it.a, k + ' exit q·a'));
  });
});
T('leveled = 기본·도전·심화 3수준 · 심화 open (3차시 묶음은 2개)', () => {
  KEYS.forEach(k => {
    const lvs = L[k].slides.filter(s => s.block === 'leveled_problem');
    ok(lvs.length === (TRIPLE.includes(k) ? 2 : 1), k + ' leveled ' + lvs.length + '개');
    lvs.forEach(s => {
      const lv = s.data.levels;
      ok(lv['기본'] && lv['도전'] && lv['심화'], k + ' ' + s.id + ' 수준 누락');
      ok(lv['심화'].open === true, k + ' ' + s.id + ' 심화 open 아님');
      ok(Array.isArray(lv['기본'].steps) && lv['기본'].steps.length >= 3, k + ' ' + s.id + ' 기본 steps');
    });
  });
});
T('offline_activity = 전 항목 유지 · 준비물·분 실존 (3차시 묶음은 2개)', () => {
  KEYS.forEach(k => {
    const os = L[k].slides.filter(s => s.block === 'offline_activity');
    ok(os.length === (TRIPLE.includes(k) ? 2 : 1), k + ' offline ' + os.length + '개');
    os.forEach(s => {
      const o = s.data;
      ok(o.materials.length >= 2, k + ' ' + s.id + ' materials');
      ok(o.minutes >= 8, k + ' ' + s.id + ' minutes ' + o.minutes);
      ok(o.steps.length >= 4, k + ' ' + s.id + ' steps');
    });
  });
});
T('meta 정합 (grade·subject·unit·n·theme·live_url·본차시 실존)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(m.grade === 3 && m.subject === '국어' && m.unit === 4, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 중요 내용 탐정소', k + ' theme');
    ok(m.live_url.includes('4단원_중요한내용을찾아요'), k + ' live_url');
    ok(fs.existsSync(path.join(ROOT, m.live_url.replace('../../', ''))),
       k + ' 본차시 파일 없음');
  });
});
T('⚠️ std = 전 항목 "단원 전체 통합" (본차시가 성취기준을 선언하지 않았다)', () => {
  KEYS.forEach(k => ok(L[k].meta.std === '단원 전체 통합', k + ' std ' + L[k].meta.std));
  /* ⚠️ 근거: 일곱 파일 어디에도 [4국NN-NN] 표기가 없다 (u3와 같다). */
  const decl = SRCALL.filter(s => /\[4국\d{2}-\d{2}\]/.test(s));
  ok(decl.length === 0, '본차시가 성취기준을 선언했다 (' + decl.length + '파일) — std 재검토');
});
T('CURRICULUM ↔ LESSONS 정합 (u4 블록 7항목 · ready 7 = u4 완주)', () => {
  const cur = CURRIC_SRC;
  /* ⚠️ 단원이 넷이 되었으므로 unit 4 블록만 잘라내고 검사한다 (u1 게이트 정정 선례) */
  const u4 = (cur.match(/unit:\s*4,[\s\S]*?(?=\n\s*\},\n\s*\{\n\s*unit:\s*5|\];)/) || [''])[0];
  ok(u4.length > 100, 'unit 4 블록을 못 잘랐다');
  const ns = [...u4.matchAll(/\{n:\s*(\d+),/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify([1, 2, 4, 6, 8, 11, 13]), ns.join(','));
  ok((u4.match(/ready:\s*true/g) || []).length === 7, 'u4 ready 어긋남');
  ok(/lesson_count:\s*7/.test(u4), 'lesson_count 어긋남');
});
T('⚠️ 홈 배선 — 네 단원 전부 **닫는 태그까지** 성립한다 (u2 태그 누락 실측 자리)', () => {
  /* ⚠️ 문자열 존재만 보면 안 된다. u2 script 태그에 </script>가 빠져 있어
     브라우저가 u3.js 줄을 u2 script의 본문으로 먹고 **u3를 로드하지 않던** 것을
     이번 세션에서 실측으로 잡았다. 닫는 태그까지 정규식으로 못 박는다. */
  [1, 2, 3, 4].forEach(u => {
    const re = new RegExp('<script src="data/g3_korean_u' + u + '\\.js"></script>');
    ok(re.test(HOME), 'u' + u + ' script 태그가 닫히지 않았다 (또는 없다)');
  });
  const opens = (HOME.match(/<script\b/g) || []).length;
  const closes = (HOME.match(/<\/script>/g) || []).length;
  ok(opens === closes, 'script 여닫이 불일치 ' + opens + '/' + closes);
});
T('홈 slug · u1~u3 회귀', () => {
  ok(/slug:\s*"g3_korean"/.test(HOME), 'slug 어긋남');
  ok(!HOME.includes('g3_math'), '수학 잔여 참조');
  ok(/unit:\s*1,\s*title:\s*"생생하게 표현해요"/.test(HOME), 'u1 블록 훼손');
  ok(/unit:\s*2,\s*title:\s*"분명하고 유창하게"/.test(HOME), 'u2 블록 훼손');
  ok(/unit:\s*3,\s*title:\s*"짜임새 있는 글, 재미와 감동이 있는 글"/.test(HOME), 'u3 블록 훼손');
});
T('⚠️ 허브 "3_korean" 카운트 갱신 (8+7+7+7+8 = units 5 · lessons 37)', () => {
  const m = HUB.match(/"3_korean":\s*\{\s*file:\s*"g3_korean\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '허브에 3_korean 미등재');
  ok(+m[1] === 5, 'units ' + m[1]);
  ok(+m[2] === 37, 'lessons ' + m[2]);
  /* ⚠️ 다음 단원(u6) 개통 시 이 두 수와 gate_g3_korean_u1·u2·u3·u5의 같은 단언을 함께 올릴 것 */
  ok(/"3_math"[\s\S]*?lessons:\s*55/.test(HUB), 'g3 수학 허브 단언 훼손');
});
T('케이랩 매핑 없음 = 의도적 (듣기·발표는 실물 목소리가 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_korean_klab.js')), 'klab 파일 생김');
  ok(!/klab/i.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u4 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (발표·칭찬 차시가 있어 「손뼉」으로 갈라 쓴다)', () => {
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
