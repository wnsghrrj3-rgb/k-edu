/* gate_g3_korean_u3.js — 케이티처 g3 국어 u3 「짜임새 있는 글, 재미와 감동이 있는 글」 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ u2 게이트 복제. u1·u2의 국어 규약을 계승하되 u3에서 처음 서는 셋을 새로 건다.
   (신규 ①) 국어 두 번째 기계 검산기 = **격음화 검산기**(D-2).
       본문의 모든 `낱말 → [발음]` 짝을 긁어 한글 자모를 실제로 분해해
       받침 ㅎ + ㄱ/ㄷ/ㅈ -> [ㅋ/ㅌ/ㅊ], 받침 ㅂ/ㄱ + ㅎ -> [ㅍ/ㅋ]를 견준다.
       ⚠️ 오답 보기 [이박]·[입학]은 판별 문제의 근거라 마스킹한 뒤 검산한다
          (u2 띄어 읽기 검산기의 WRONG_SPACING 선례).
   (신규 ②) **문단 짜임 검산기**(D-3). 본문에 실린 완성 문단을 긁어
       중심 문장이 하나인지, 뒷받침 문장이 화제 낱말을 공유하는지를 견준다.
       ⚠️ l04의 "저는 피구를 가장 좋아합니다"는 어긋난 보기라 마스킹한다.
   (신규 ③) 성취기준이 **전 항목 미선언**이다. u2는 네 항목이 [4국NN-NN]을 적어 뒀으나
       u3 본차시 일곱 파일 어디에도 없다 -> 전 항목 "단원 전체 통합".
       게이트가 본차시 원문에 [4국 표기가 0건임을 함께 검사한다.
   ⚠️ 키 건너뜀 자리가 u2와 다르다: l03·l05·l07·l09·l10·l12.
   ⚠️ 3차시 묶음은 l08 하나뿐. review 계보는 u3_l01 <- u2_l14 (단원을 넘는다)
      -> 이 게이트는 data/g3_korean_u2.js도 함께 로드한다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_korean_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA2 = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u2.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u3.js'), 'utf8');
/* 용어·저작권 가드는 본문만 대상 — 머리 주석에 차단 목록 자체가 적혀 있어
   자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다 (u1·u2 선례 계승). */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_korean.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/korean/3단원_짜임새있는글재미와감동이있는글');
const SRC01 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l01.html'), 'utf8');
const SRC02 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l02_03.html'), 'utf8');
const SRC04 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l04_05.html'), 'utf8');
const SRC06 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l06_07.html'), 'utf8');
const SRC08 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l08_10.html'), 'utf8');
const SRC11 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l11_12.html'), 'utf8');
const SRC13 = fs.readFileSync(path.join(SDIR, 'g3_kor_u3_l13.html'), 'utf8');
const SRCALL = [SRC01, SRC02, SRC04, SRC06, SRC08, SRC11, SRC13];

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
/* ⚠️ 학생 본차시는 <b class="emph">가 낱말 한가운데를 가르고 글씨 쓰기 칸은
   한 글자씩 따로 감싼다 -> 대조는 두 갈래로 (u1 게이트에서 세운 헬퍼 복제). */
const txt = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const sq = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');
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
  w.eval(DATA2); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA2);
eval(DATA);
const L = global.window.LESSONS;

const KEYS = ['u3_l01', 'u3_l02', 'u3_l04', 'u3_l06', 'u3_l08', 'u3_l11', 'u3_l13'];
const NS = { u3_l01: 1, u3_l02: 2, u3_l04: 4, u3_l06: 6, u3_l08: 8, u3_l11: 11, u3_l13: 13 };
/* 3차시 묶음 36슬(120분) / 2차시 묶음 24슬(80분) / 단일 19슬(40분) */
const TRIPLE = ['u3_l08'];
const PAIRED = ['u3_l02', 'u3_l04', 'u3_l06', 'u3_l11'];
const SINGLE = KEYS.filter(k => !TRIPLE.includes(k) && !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = TRIPLE.includes(k) ? 36 : PAIRED.includes(k) ? 24 : 19; });
/* ⚠️ u2와 건너뛰는 자리가 다르다 */
const SKIPPED = ['u3_l03', 'u3_l05', 'u3_l07', 'u3_l09', 'u3_l10', 'u3_l12'];

function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u3 7항목 로드 (u2 7항목 동반 로드)', () => {
  W = boot();
  const k3 = Object.keys(W.LESSONS).filter(k => k.startsWith('u3_'));
  ok(k3.length === 7, 'u3 항목 ' + k3.length);
  const k2 = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(k2.length === 7, 'u2 동반 로드 실패 ' + k2.length);
});
T('⚠️ 키가 건너뛴다 (l03·l05·l07·l09·l10·l12 없음 — u2와 자리가 다르다)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u3_')).sort();
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
    const html = renderAll(W, 3, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'review', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('⚠️ 전 항목에 review 실존 (u3_l01도 — 단원 넘는 계보)', () => {
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
    ok(renderAll(w2, 3, NS[k], 4).length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
/* ① 자체 설명문 「나무가 주는 것」 4문장 — 본차시 원문과 완전 일치 */
const TREE = ['나무는 우리에게 여러 가지 도움을 줍니다.',
              '더운 날에는 시원한 그늘을 만들어 줍니다.',
              '맑은 공기를 내뿜어 숨 쉬기 좋게 해 줍니다.',
              '맛있는 열매를 맺어 먹을거리도 줍니다.'];
T('① 「나무가 주는 것」 4문장 원문 일치 (l02 ↔ SRC02)', () => {
  TREE.forEach(s => {
    ok(txt(SRC02).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
});
/* ② 동물 문단 = 중심 문장이 끝에 오는 문단 */
const ANIMAL = ['토끼는 귀가 깁니다.', '기린은 목이 깁니다.', '코끼리는 코가 깁니다.',
                '이처럼 동물마다 길게 자란 부분이 다릅니다.'];
T('② 동물 문단 4문장 + 중심 문장이 끝 (l02)', () => {
  ANIMAL.forEach(s => {
    ok(txt(SRC02).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  const s16 = plain(L['u3_l02'].slides.find(s => s.id === 's16'));
  ok(s16.includes('이처럼 동물마다 길게 자란 부분이 다릅니다'), 'l02 s16 정답 어긋남');
  ok(/끝/.test(s16), '중심 문장이 끝에 왔음을 밝히지 않음');
});
/* ③ 용어 정의 3갈래 */
T('③ 문단·중심 문장·뒷받침 문장 정의 3갈래 (l02)', () => {
  [['문단', '한 가지 생각'], ['중심 문장', '대표'], ['뒷받침 문장', '예를 드는']]
    .forEach(([a, b]) => ok(BODY.includes(a) && BODY.includes(b), a + ' 정의 어긋남'));
  ok(txt(SRC02).includes('한 가지 생각'), '본차시 근거 없음');
});
/* ④ 문단 쓰는 약속 3종 */
T('④ 문단 쓰는 약속 3종 (한 칸 들여·줄 바꿔·중심 문장 하나) (l02)', () => {
  ok(/한 칸 들여/.test(BODY), '들여쓰기 없음');
  ok(/줄을 바꿔/.test(BODY), '줄 바꿈 없음');
  ok(/중심 문장 하나/.test(BODY), '중심 문장 하나 없음');
  ok(sq(SRC02).includes('한칸들여'), '본차시 근거 없음');
});
/* ⑤ 학교 소개 문단 + 어긋난 뒷받침 문장 */
const SCHOOL = ['우리 학교에는 다양한 장소가 있습니다.',
                '학생들이 공부하는 교실이 있습니다.',
                '책을 빌릴 수 있는 도서관이 있습니다.'];
T('⑤ 학교 소개 문단 3문장 + 어긋난 보기 1문장 (l04 ↔ SRC04)', () => {
  SCHOOL.forEach(s => {
    ok(txt(SRC04).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
  ok(txt(SRC04).includes('저는 피구를 가장 좋아합니다'), '본차시 어긋난 보기 없음');
  ok(BODY.includes('저는 피구를 가장 좋아합니다'), '어긋난 보기 없음');
});
/* ⑥ 어울리는 문장 정답 3 · 오답 2 */
T('⑥ 어울리는 뒷받침 문장 정답 3 · 오답 2 분리 (l04)', () => {
  const s10 = plain(L['u3_l04'].slides.find(s => s.id === 's10'));
  ['운동을 하는 강당이 있습니다', '치료받는 보건실이 있습니다', '밥을 먹는 급식실이 있습니다']
    .forEach(s => ok(s10.includes(s), '정답 누락: ' + s));
  ['어제 비가 많이 왔습니다', '제 동생은 두 살입니다']
    .forEach(s => ok(s10.includes(s), '오답 보기 누락: ' + s));
  const ans = L['u3_l04'].slides.find(s => s.id === 's10').data.answer;
  ['어제 비가 많이 왔습니다', '제 동생은 두 살입니다']
    .forEach(s => ok(!ans.includes(s), '오답이 정답으로 샜다: ' + s));
});
/* ⑦ 중심↔뒷받침 3짝 */
T('⑦ 중심 문장↔뒷받침 문장 3짝 (l04)', () => {
  const pairs = [['우리 학교 도서관은 좋습니다', '읽고 싶은 책이 가득합니다'],
                 ['우리 학교 운동장은 넓습니다', '달리기를 마음껏 할 수 있습니다'],
                 ['우리 학교에는 행사가 많습니다', '운동회와 발표회가 열립니다']];
  const s16 = L['u3_l04'].slides.find(s => s.id === 's16').data.answer;
  pairs.forEach(([a, b]) => {
    ok(txt(SRC04).includes(a) && txt(SRC04).includes(b), '본차시 근거 없음: ' + a);
    const i = s16.indexOf(a.slice(-6, -4) === '' ? a : a.replace('우리 학교 ', '').replace('우리 학교', ''));
    ok(s16.includes(b), '짝 누락: ' + b);
  });
});
/* ⑧ 시 「발소리」 원문 9행 */
const POEM = ['계단을 오르는 발소리로 누구인지 알아요', '쿵쿵쿵 빠른 발소리는 형',
              '또각또각 가벼운 발소리는 누나', '천천히 또 천천히',
              '가장 느린 발소리는 할아버지', '이제는 들을 수 없는',
              '그 느린 발소리가', '오늘따라 자꾸 생각나요', '보고 싶은 할아버지'];
T('⑧ 시 「발소리」 9행 원문 완전 일치 (l06 ↔ SRC06)', () => {
  POEM.forEach(s => {
    ok(txt(SRC06).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
});
/* ⑨ 발소리↔사람 3짝 */
T('⑨ 발소리↔사람 3짝 (l06)', () => {
  const a = L['u3_l06'].slides.find(s => s.id === 's09').data.answer;
  [['쿵쿵쿵 빠른 발소리', '형'], ['또각또각 가벼운 발소리', '누나'],
   ['가장 느린 발소리', '할아버지']].forEach(([x, y]) => {
    const i = a.indexOf(x);
    ok(i >= 0, '발소리 누락: ' + x);
    ok(a.slice(i, i + x.length + 6).includes(y), '짝 어긋남: ' + x + '—' + y);
  });
});
/* ⑩ 감상 방법 정답 4 · 오답 1 */
T('⑩ 감상 방법 정답 4 · 오답 1 분리 (l06)', () => {
  const s16 = L['u3_l06'].slides.find(s => s.id === 's16').data;
  ['떠오르는 장면을 생각하기', '비슷한 내 경험 떠올리기', '마음이 뭉클한 부분 찾기',
   '소리 내어 낭송해 보기'].forEach(s => ok(s16.answer.includes(s), '정답 누락: ' + s));
  ok(s16.question.includes('뜻과 상관없이 빨리 읽기'), '오답 보기 누락');
  ok(!s16.answer.includes('빨리 읽기'), '오답이 정답으로 샜다');
});
/* ⑪ 이야기 「할머니의 단추 상자」 원문 3부분 */
const STORY = ['수아는 할머니 댁 서랍에서 낡은 단추 상자를 찾았습니다.',
               '상자 안에는 색깔도 모양도 다른 단추가 가득했습니다.',
               '할머니는 단추마다 담긴 이야기를 하나씩 들려주셨습니다.',
               '수아는 낡은 단추 하나하나에 소중한 추억이 담겨 있다는 것을 알게 되었습니다.',
               '집으로 돌아온 수아는 자신의 물건도 함부로 버리지 않고 아껴 쓰기로 마음먹었습니다.'];
T('⑪ 「할머니의 단추 상자」 원문 5문장 일치 (l08 ↔ SRC08)', () => {
  STORY.forEach(s => {
    ok(txt(SRC08).includes(s), '본차시에 없음: ' + s);
    ok(BODY.includes(s), '케이티처에 없음: ' + s);
  });
});
/* ⑫ 낱말↔뜻 3짝 */
T('⑫ 낱말↔뜻 3짝 (l08)', () => {
  const a = L['u3_l08'].slides.find(s => s.id === 's17').data.answer;
  [['낡다', '오래되어 헐다'], ['간직하다', '잘 두어 보관하다'],
   ['소중하다', '매우 귀하고 중요하다']].forEach(([x, y]) => {
    ok(a.includes(x + '—' + y), '짝 어긋남: ' + x);
    ok(txt(SRC08).includes(y), '본차시 뜻 근거 없음: ' + y);
  });
});
/* ⑬ 사건 차례 + 본보기 문단 */
T('⑬ 사건 차례 첫 장면 + 재미·감동 본보기 문단 (l08)', () => {
  const s10 = L['u3_l08'].slides.find(s => s.id === 's10').data;
  ok(s10.answer.includes('서랍에서 단추 상자를 찾았다'), '첫 장면 어긋남');
  const model = '나는 할머니가 단추마다 담긴 이야기를 들려주는 부분에서 감동을 느꼈다.';
  ok(txt(SRC08).includes(model), '본차시 본보기 문단 없음');
  ok(BODY.includes(model), '케이티처 본보기 문단 없음');
  ok(/왜냐하면[\s\S]{0,80}때문이다/.test(BODY), '왜냐하면~때문이다 짜임 없음');
});
/* ⑭ 표현 방법 3종 + 오답 2 */
T('⑭ 표현 방법 3종 정답 · 오답 2 분리 (l08·l11)', () => {
  const s28 = L['u3_l08'].slides.find(s => s.id === 's28').data;
  ['역할극으로 표현하기', '네 칸 만화로 그리기', '인물에게 편지 쓰기']
    .forEach(s => ok(s28.answer.includes(s), '정답 누락: ' + s));
  ['아무것도 하지 않기', '친구 작품을 그대로 베끼기']
    .forEach(s => ok(s28.question.includes(s) && !s28.answer.includes(s), '오답 샘: ' + s));
  /* 표현 방법↔특징 3짝 (l11) */
  const a = L['u3_l11'].slides.find(s => s.id === 's16').data.answer;
  [['역할극', '인물이 되어 말과 몸짓으로 표현해요'],
   ['네 칸 만화', '장면을 그림으로 그려요'],
   ['편지 쓰기', '인물에게 마음을 글로 전해요']].forEach(([x, y]) => {
    ok(a.includes(x + '—' + y), '특징 짝 어긋남: ' + x);
    ok(txt(SRC11).includes(y), '본차시 특징 근거 없음: ' + y);
  });
});
/* ⑮ '나' 설명서 본보기 문단 */
T('⑮ \'나\' 설명서 본보기 문단 4문장 (l11 ↔ SRC11)', () => {
  ['나는 그림 그리기를 좋아합니다.', '쉬는 시간에 공책에 만화를 그립니다.',
   '가족의 모습을 그려 선물하기도 합니다.', '색칠할 때가 가장 즐겁습니다.']
    .forEach(s => {
      ok(txt(SRC11).includes(s), '본차시에 없음: ' + s);
      ok(BODY.includes(s), '케이티처에 없음: ' + s);
    });
  const s09 = L['u3_l11'].slides.find(s => s.id === 's09').data;
  ok(s09.answer === '나는 그림 그리기를 좋아합니다', '중심 문장 어긋남');
});
/* ⑯ 소개 자료 3요소 + 점검 3항목 */
T('⑯ 소개 자료 3요소 · 쓴 글 점검 3항목 (l11)', () => {
  ['제목', '지은이', '까닭'].forEach(s => ok(BODY.includes(s), '소개 자료 요소 누락: ' + s));
  ok(txt(SRC11).includes('그렇게 느낀 까닭'), '본차시 근거 없음');
  const s07 = plain(L['u3_l11'].slides.find(s => s.id === 's07'));
  ok(/중심 문장/.test(s07) && /뒷받침 문장/.test(s07) && /한 칸 들여/.test(s07),
     '점검 3항목 어긋남');
});
/* ⑰ 복수 표준어 짝 6쌍 */
const DBL = [['자장면', '짜장면'], ['날개', '나래'], ['봉선화', '봉숭아'],
             ['옥수수', '강냉이'], ['만날', '맨날'], ['가엾다', '가엽다']];
T('⑰ 복수 표준어 6쌍 (l13 ↔ SRC13)', () => {
  DBL.forEach(([a, b]) => {
    ok(sq(SRC13).includes(a) && sq(SRC13).includes(b), '본차시에 없음: ' + a);
    ok(BODY.includes(a) && BODY.includes(b), '케이티처에 없음: ' + a);
  });
  const a10 = L['u3_l13'].slides.find(s => s.id === 's10').data.answer;
  [['자장면', '짜장면'], ['날개', '나래'], ['봉선화', '봉숭아']]
    .forEach(([x, y]) => ok(a10.includes(x + '—' + y), '짝 어긋남: ' + x));
});
/* ⑱ 스스로 확인 정답 3 · 오답 2 */
T('⑱ 스스로 확인 정답 3 · 오답 2 분리 (l13)', () => {
  const s11 = L['u3_l13'].slides.find(s => s.id === 's11').data;
  ['짜임새 있는 글은 이해하기 쉽다', '중심 문장에 중요한 내용이 드러난다',
   '문단을 시작할 때 한 칸 들여 쓴다'].forEach(s => ok(s11.answer.includes(s), '정답 누락: ' + s));
  ['중심 문장은 늘 문단 맨 앞에만 온다', '뒷받침 문장은 중심 문장과 관계없어도 된다']
    .forEach(s => ok(s11.question.includes(s) && !s11.answer.includes(s), '오답 샘: ' + s));
});
/* ⑲ 글씨 쓰기 3종 — sq() 대조 (칸에 한 글자씩 갈라 담긴다) */
T('⑲ 글씨 쓰기 낱말 3종 sq() 대조 (l13)', () => {
  ['문단', '중심', '감동'].forEach(w => {
    ok(SQALL.includes(w), '본차시 글씨 쓰기 칸에 없음: ' + w);
    ok(BODY.includes(w), '케이티처에 없음: ' + w);
  });
});

console.log('═══ D-2. ⚠️ 격음화 검산기 (국어 두 번째 기계 검산) ═══');
/* 한글 자모 분해 — 받침 ㅎ + ㄱ/ㄷ/ㅈ -> [ㅋ/ㅌ/ㅊ], 받침 ㅂ/ㄱ + ㅎ -> [ㅍ/ㅋ] */
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function decomp(ch) {
  const c = ch.charCodeAt(0) - 0xAC00;
  if (c < 0 || c > 11171) return null;
  return { cho: CHO[Math.floor(c / 588)], jung: Math.floor(c / 28) % 21, jong: JONG[c % 28] };
}
function compose(choIdx, jung, jongIdx) {
  return String.fromCharCode(0xAC00 + choIdx * 588 + jung * 28 + jongIdx);
}
/* 격음화를 실제로 적용해 발음을 계산한다 */
const ASPI_FWD = { 'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅈ': 'ㅊ' };   // 받침 ㅎ 계열 + 뒤 첫소리
const ASPI_BWD = { 'ㅂ': 'ㅍ', 'ㄱ': 'ㅋ' };                 // 받침 ㅂ·ㄱ + 뒤 ㅎ
const H_JONG = { 'ㅎ': '', 'ㄶ': 'ㄴ', 'ㅀ': 'ㄹ' };         // ㅎ이 빠진 뒤 남는 받침
function aspirate(word) {
  const a = word.split('').map(decomp);
  if (a.some(x => !x)) return null;
  for (let i = 0; i < a.length - 1; i++) {
    const cur = a[i], nxt = a[i + 1];
    if (cur.jong in H_JONG && nxt.cho in ASPI_FWD) {
      nxt.cho = ASPI_FWD[nxt.cho];
      cur.jong = H_JONG[cur.jong];
    } else if (nxt.cho === 'ㅎ' && cur.jong in ASPI_BWD) {
      nxt.cho = ASPI_BWD[cur.jong];
      cur.jong = '';
    }
  }
  return a.map(x => compose(CHO.indexOf(x.cho), x.jung, JONG.indexOf(x.jong))).join('');
}
T('격음화 자모 분해기 자체 검증 (역검증 포함)', () => {
  ok(aspirate('놓다') === '노타', '놓다 → ' + aspirate('놓다'));
  ok(aspirate('입학') === '이팍', '입학 → ' + aspirate('입학'));
  ok(aspirate('않고') === '안코', '않고 → ' + aspirate('않고'));
  /* 역검증: 규칙이 걸리지 않는 낱말은 그대로여야 한다 */
  ok(aspirate('바다') === '바다', '무관한 낱말이 바뀜');
});
/* ⚠️ 오답 보기는 판별 문제의 근거라 본문에서 뺄 수 없다 -> 마스킹한 뒤 검산.
   ⚠️⚠️ 마스킹을 BODY 전체 문자열 치환으로 하면 안 된다 — 정답 자리의 [이팍]을
   [이박]으로 어긋뜨려도 마스킹이 그것까지 먹어 버려 게이트가 그린으로 남는다
   (이번 세션에서 역검증으로 실제로 겪었다: 73/0이 아니라 75/0이 나왔다).
   오답 보기가 실린 자리(l13 s09의 question) **하나만** 도려내고 나머지는 전수 검산한다. */
const MASKED = (() => {
  const skip = L['u3_l13'].slides.find(s => s.id === 's09').data.question;
  return BODY.split(JSON.stringify(skip).slice(1, -1)).join('__오답보기자리__');
})();
T('⚠️ 본문의 모든 `낱말 → [발음]` 짝을 기계로 전수 검산', () => {
  const body = MASKED;
  ok(!body.includes('[이박]'), '오답 발음이 판별 문제 밖에 있다 (또는 마스킹 실패)');
  const pairs = [...body.matchAll(/([가-힣]{2,4})\s*(?:→|->)\s*\*{0,2}\[([가-힣]{2,4})\]/g)];
  ok(pairs.length >= 4, '검산 대상이 없다 (' + pairs.length + '건)');
  pairs.forEach(([, w, p]) => {
    const calc = aspirate(w);
    ok(calc === p, w + ' → [' + p + '] (계산 [' + calc + '])');
  });
  /* 문장 속 `낱말[발음]` 꼴도 함께 검산 */
  const inline = [...body.matchAll(/([가-힣]{2,4})\[([가-힣]{2,4})\]/g)];
  inline.forEach(([, w, p]) => {
    const calc = aspirate(w);
    ok(calc === p, w + '[' + p + '] (계산 [' + calc + '])');
  });
  ok(inline.length >= 3, '문장 속 발음 표기가 없다 (' + inline.length + '건)');
});
T('⚠️ 격음화 두 규칙이 본문에 모두 서 있다 (ㅎ이 앞 / ㅎ이 뒤)', () => {
  ok(/받침 \*{0,2}ㅎ\*{0,2} 뒤에/.test(BODY), '규칙 ① 없음');
  ok(/받침 \*{0,2}ㅂ·ㄱ\*{0,2} 뒤에/.test(BODY), '규칙 ② 없음');
  ok(txt(SRC13).includes('놓다') && txt(SRC13).includes('입학'), '본차시 근거 없음');
});
T('⚠️ 오답 발음이 정답으로 새지 않는다 (판별 문제 근거는 보존)', () => {
  const s09 = L['u3_l13'].slides.find(s => s.id === 's09').data;
  ok(s09.question.includes('[이박]') && s09.question.includes('[입학]'), '오답 보기 소실');
  ok(s09.answer === '[이팍]', '정답 어긋남: ' + s09.answer);
});

console.log('═══ D-3. ⚠️ 문단 짜임 검산기 (중심 하나 + 뒷받침 어울림) ═══');
T('완성 문단은 중심 문장 하나 + 뒷받침 여럿이다 (화제 낱말 공유)', () => {
  /* ⚠️ l04의 "저는 피구를 가장 좋아합니다"는 어긋난 보기라 마스킹한다 */
  const paras = [
    { name: '나무가 주는 것', lines: TREE, topic: '줍니다' },
    { name: '동물 문단', lines: ANIMAL, topic: '깁니다|다릅니다' },
    { name: '학교 소개 완성본', lines: ['우리 학교에는 다양한 장소가 있습니다.',
        '공부하는 교실이 있습니다.', '책을 빌리는 도서관이 있습니다.',
        '운동을 하는 강당도 있습니다.'], topic: '있습니다' },
    { name: "'나' 설명서", lines: ['나는 그림 그리기를 좋아합니다.',
        '쉬는 시간에 공책에 만화를 그립니다.', '가족의 모습을 그려 선물하기도 합니다.',
        '색칠할 때가 가장 즐겁습니다.'], topic: '그리|그려|색칠' },
  ];
  paras.forEach(p => {
    p.lines.forEach(l => ok(BODY.includes(l), p.name + ' 문장 누락: ' + l));
    const hit = p.lines.filter(l => new RegExp(p.topic).test(l)).length;
    ok(hit >= 2, p.name + ' 화제 공유 ' + hit + '문장 (2 미만)');
    ok(p.lines.length >= 3 && p.lines.length <= 4, p.name + ' 문장 수 ' + p.lines.length);
  });
});
T('⚠️ 어긋난 뒷받침 문장은 정답 문단에 섞이지 않는다 (역검증)', () => {
  const bad = '저는 피구를 가장 좋아합니다';
  /* 어긋난 보기는 l04에만, 그것도 판별 문제·개념 설명 자리에만 있어야 한다 */
  KEYS.filter(k => k !== 'u3_l04').forEach(k =>
    ok(!studentText(k).includes(bad), k + '에 어긋난 보기가 샜다'));
  const s = L['u3_l04'].slides.filter(x => plain(x).includes(bad)).map(x => x.id);
  ok(s.length >= 2 && s.length <= 4, 'l04 어긋난 보기 등장 ' + s.length + '곳: ' + s.join(','));
  /* 완성 본보기 문단(s16 정답·본보기)에는 절대 없어야 한다 */
  ok(!L['u3_l04'].slides.find(x => x.id === 's16').data.answer.includes(bad),
     '완성 문단에 어긋난 보기');
});

console.log('═══ E. 저작권 · 용어 가드 ═══');
T('⚠️ 지도서 수록 제재명·작가명 0건 (국어 최우선 가드 · 차단 36종)', () => {
  /* u3 본차시 머리 주석이 명시적으로 회피한 것 */
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
  const all = BAN_U3.concat(BAN_U2, BAN_U1);
  ok(all.length >= 36, '차단 목록이 줄었다 ' + all.length);
  const hit = all.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('게재 제재는 본차시 자체 창작 세 편뿐 (낫표 전수 검사)', () => {
  const ALLOW = ['「나무가 주는 것」', '「발소리」', '「할머니의 단추 상자」'];
  const uniq = [...new Set(BODY.match(/「[^」]+」/g) || [])];
  ok(uniq.every(t => ALLOW.includes(t)), uniq.join(','));
  /* ⚠️ 허용 목록만 넓히면 다음 사람이 아무 제목이나 얹을 수 있다 ->
     본차시가 실제로 그 제목을 창작했는지까지 함께 잠근다 (u1 「떨리는 발표」 선례) */
  ok(SRC02.includes('나무가 주는 것'), '본차시가 창작하지 않은 제목 (l02)');
  ok(SRC06.includes('발소리'), '본차시가 창작하지 않은 제목 (l06)');
  ok(SRC08.includes('할머니의 단추 상자'), '본차시가 창작하지 않은 제목 (l08)');
});
T('⚠️ 개념 이름표는 낫표로 감싸지 않는다 (중심 문장 등)', () => {
  ['「중심 문장」', '「뒷받침 문장」', '「문단」', '「짜임새」', '「복수 표준어」']
    .forEach(w => ok(!BODY.includes(w), '낫표로 감쌈: ' + w));
  ok(STUDENT.includes('중심 문장'), '개념 이름표 자체가 없음');
});
T('미도입 갈래(4학년 이상 소관) 학생 노출 0', () => {
  /* ⚠️ '연'은 단독으로 걸면 안 된다 — 연습·자연·연필이 통째로 오탐 (u1 선례).
     '주제'도 단독 금지 대신 '주제문'으로만 건다. */
  const BAN = ['서론', '본론', '주제문', '개요', '논설문', '비유', '은유', '직유',
               '의인법', '운율', '심상', '시적 화자', '복선', '시점', '설의법',
               '연과 행', '행과 연', '기승전결'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['문장 성분', '읽기 유창성', '의미 단위', '통일성', '응집성', '격음화']
    .forEach(w => ok(!STUDENT.includes(w), '학생 노출: ' + w));
  ok(/짜임|받침|마음/.test(TNOTE), 'tnote에 교사 몫 표지 없음');
});
T('⚠️ 선행 용어 — l01은 이름만, 정의는 l02 도입 (본차시 1:1 계승)', () => {
  /* ⚠️ u1·u2의 "앞 차시 본문 0" 단언을 그대로 복제하면 여기서 깨진다.
     본차시 l01이 「중심 문장과 뒷받침 문장으로 문단 쓰기」를 단원 계획으로 직접 예고하기
     때문이다(둘러보기 슬라이드). 정직 원칙대로 케이티처도 이름은 그대로 노출하되,
     **정의와 활동은 l02로 미룬다**. 게이트는 그 경계를 검사한다. */
  ok(SRC01.includes('뒷받침 문장'), '본차시 l01이 예고하지 않는다 — 단언 재검토');
  const l01 = plain(L['u3_l01'].slides);
  ok(l01.includes('뒷받침 문장'), 'l01 예고 누락');
  ok(!l01.includes('덧붙여 설명하거나 예를 드는'), 'l01이 뒷받침 문장 정의를 미리 꺼냄');
  ok(!l01.includes('한 칸 들여'), 'l01이 문단 쓰는 약속을 미리 꺼냄');
  ok(plain(L['u3_l02'].slides).includes('덧붙여 설명하거나 예를 드는'), 'l02에 정의 도입 없음');
});
T('⚠️ 선행 용어 — 복수 표준어·받침 소리는 l13 도입 (앞 여섯 항목 본문 0)', () => {
  KEYS.filter(k => k !== 'u3_l13').forEach(k => {
    const t = plain(L[k].slides.filter(x => x.block !== 'next_lesson'));
    ['복수 표준어', '자장면'].forEach(w => ok(!t.includes(w), k + ' 본문에 ' + w + ' 선행'));
  });
  ok(plain(L['u3_l13'].slides).includes('복수 표준어'), 'l13에 도입 없음');
});
T('l01은 단원 예고 차시 — 두 소단원 이름만 소개하고 본론은 뒤로 미룬다', () => {
  const l01 = studentText('u3_l01');
  ok(/문단/.test(l01) && /재미와 감동/.test(l01), 'l01 예고 누락');
  ok(!/왜냐하면/.test(l01), 'l01이 뒤 차시 본론을 미리 꺼냄');
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
  ok(TRIPLE.length === 1, 'u3의 3차시 묶음은 하나다');
  TRIPLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 120, k + ' duration ' + m.duration_min);
    ok(/차시$/.test(m.covers) && m.covers.includes('~'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12,s24', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 2차시 묶음 = 80분 · covers 가운뎃점 · period_split 하나 (넷)', () => {
  ok(PAIRED.length === 4, 'u3의 2차시 묶음은 넷이다');
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
  const chain = [['u3_l01', 'u2_l14'], ['u3_l02', 'u3_l01'], ['u3_l04', 'u3_l02'],
                 ['u3_l06', 'u3_l04'], ['u3_l08', 'u3_l06'], ['u3_l11', 'u3_l08'],
                 ['u3_l13', 'u3_l11']];
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
    ok(m.grade === 3 && m.subject === '국어' && m.unit === 3, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(m.theme === '곰이·펭이 짜임새 글 공방', k + ' theme');
    ok(m.live_url.includes('3단원_짜임새있는글재미와감동이있는글'), k + ' live_url');
    ok(fs.existsSync(path.join(ROOT, m.live_url.replace('../../', ''))),
       k + ' 본차시 파일 없음');
  });
});
T('⚠️ std = 전 항목 "단원 전체 통합" (본차시가 성취기준을 선언하지 않았다)', () => {
  KEYS.forEach(k => ok(L[k].meta.std === '단원 전체 통합', k + ' std ' + L[k].meta.std));
  /* ⚠️ 근거: 일곱 파일 어디에도 [4국NN-NN] 표기가 없다. u2와 갈리는 자리다. */
  const decl = SRCALL.filter(s => /\[4국\d{2}-\d{2}\]/.test(s));
  ok(decl.length === 0, '본차시가 성취기준을 선언했다 (' + decl.length + '파일) — std 재검토');
});
T('CURRICULUM ↔ LESSONS 정합 (u3 블록 7항목 · ready 7 = u3 완주)', () => {
  const cur = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0];
  /* ⚠️ 단원이 셋이 되었으므로 unit 3 블록만 잘라내고 검사한다 (u1 게이트 정정 선례) */
  const u3 = (cur.match(/unit:\s*3,[\s\S]*?(?=\n\s*\},\n\s*\{\n\s*unit:\s*4|\];)/) || [''])[0];
  ok(u3.length > 100, 'unit 3 블록을 못 잘랐다');
  const ns = [...u3.matchAll(/\{n:\s*(\d+),/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify([1, 2, 4, 6, 8, 11, 13]), ns.join(','));
  ok((u3.match(/ready:\s*true/g) || []).length === 7, 'u3 ready 어긋남');
  ok(/lesson_count:\s*7/.test(u3), 'lesson_count 어긋남');
});
T('홈 배선 · slug · u1·u2 회귀', () => {
  ['u1', 'u2', 'u3'].forEach(u =>
    ok(HOME.includes('data/g3_korean_' + u + '.js'), u + ' 배선 없음'));
  ok(/slug:\s*"g3_korean"/.test(HOME), 'slug 어긋남');
  ok(!HOME.includes('g3_math'), '수학 잔여 참조');
  ok(/unit:\s*1,\s*title:\s*"생생하게 표현해요"/.test(HOME), 'u1 블록 훼손');
  ok(/unit:\s*2,\s*title:\s*"분명하고 유창하게"/.test(HOME), 'u2 블록 훼손');
});
T('⚠️ 허브 "3_korean" 카운트 갱신 (8+7+7+7 = units 4 · lessons 29)', () => {
  const m = HUB.match(/"3_korean":\s*\{\s*file:\s*"g3_korean\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '허브에 3_korean 미등재');
  ok(+m[1] === 4, 'units ' + m[1]);
  ok(+m[2] === 29, 'lessons ' + m[2]);
  /* ⚠️ 다음 단원(u4) 개통 시 이 두 수와 gate_g3_korean_u1·u2의 같은 단언을 함께 올릴 것 */
  ok(/"3_math"[\s\S]*?lessons:\s*55/.test(HUB), 'g3 수학 허브 단언 훼손');
});
T('케이랩 매핑 없음 = 의도적 (낭송·역할극 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_korean_klab.js')), 'klab 파일 생김');
  ok(!/klab/i.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u3 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (발표·표현 차시가 둘이라 「손뼉」으로 갈라 쓴다)', () => {
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
