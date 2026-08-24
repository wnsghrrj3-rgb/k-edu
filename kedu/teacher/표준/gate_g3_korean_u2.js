/* gate_g3_korean_u2.js — 케이티처 g3 국어 u2 「분명하고 유창하게」 신규 제작 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ u1 게이트 복제. u1에서 세운 국어 규약 넷을 계승하되 u2에서 처음 서는 셋을 새로 건다.
   (신규 ①) 3차시 묶음 = 120분 · 36슬(12+12+12) · period_split "s12,s24"(경계가 둘).
       ⚠️ covers 구분자가 갈린다 — 2차시 묶음은 가운뎃점("5·6차시"), 3차시 묶음은 물결("2~4차시").
          u1 게이트의 covers.includes('·') 단언을 그대로 복제하면 3차시 묶음에서 실패한다.
   (신규 ②) review 계보가 단원을 넘는다 — u2_l01.review.from = "u1_l13".
       ⚠️ 그래서 이 게이트는 data/g3_korean_u1.js도 함께 로드한다. u2만 로드하면 계보가 무너진다.
       ⚠️ u1은 "l01만 review 없음"이 규약이었으나 u2는 전 항목에 review가 있다.
   (신규 ③) 국어 첫 기계 검산기 = 띄어 읽기 검산기(D-2).
       본문의 모든 쐐기표 줄을 긁어 ∨ 앞 토막이 조사·연결어미로 끝나는지,
       ∨∨가 문장 끝에만 오는지를 전수로 견준다.
       ⚠️ 틀린 띄어 읽기 보기 6종은 WRONG_SPACING으로 받아 마스킹한 뒤 검산한다
          (수학 u5의 덧뺄식 마스킹 선례). 판별 문제의 근거라 본문에서 뺄 수 없다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_korean_u2.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA1 = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u1.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u2.js'), 'utf8');
/* 용어·저작권 가드는 본문만 대상 — 파일 머리 주석에 차단 목록 자체가 적혀 있어
   자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다 (u1·수학 u1~u7 선례 계승). */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_korean.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/korean/2단원_분명하고유창하게');
const SRC01 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l01.html'), 'utf8');
const SRC02 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l02_04.html'), 'utf8');
const SRC05 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l05_06.html'), 'utf8');
const SRC07 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l07_08.html'), 'utf8');
const SRC09 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l09_11.html'), 'utf8');
const SRC12 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l12_13.html'), 'utf8');
const SRC14 = fs.readFileSync(path.join(SDIR, 'g3_kor_u2_l14.html'), 'utf8');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
/* ⚠️ 학생 본차시 원문은 <b class="emph">가 낱말 한가운데를 가르는 곳이 있고
   글씨 쓰기 칸은 한 글자씩 따로 감싼다 -> 대조는 두 갈래로 (u1 게이트에서 세운 헬퍼 그대로 복제).
     txt(): 태그 제거 + 공백 1칸 정규화 (문장·구 대조용)
     sq() : 태그 제거 + 공백 전부 제거      (칸에 갈라 담긴 낱말 대조용) */
const txt = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const sq = (h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, '');

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
  w.eval(DATA1); w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA1);
eval(DATA);
const L = global.window.LESSONS;

const KEYS = ['u2_l01', 'u2_l02', 'u2_l05', 'u2_l07', 'u2_l09', 'u2_l12', 'u2_l14'];
const NS = { u2_l01: 1, u2_l02: 2, u2_l05: 5, u2_l07: 7, u2_l09: 9, u2_l12: 12, u2_l14: 14 };
/* ⚠️ 묶음 판정을 표에서 파생시킨다 (u1 2차의 PAIRED 표 선례).
   3차시 묶음 36슬(120분) / 2차시 묶음 24슬(80분) / 단일 19슬(40분) */
const TRIPLE = ['u2_l02', 'u2_l09'];
const PAIRED = ['u2_l05', 'u2_l07', 'u2_l12'];
const SINGLE = KEYS.filter(k => !TRIPLE.includes(k) && !PAIRED.includes(k));
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = TRIPLE.includes(k) ? 36 : PAIRED.includes(k) ? 24 : 19; });
const SKIPPED = ['u2_l03', 'u2_l04', 'u2_l06', 'u2_l08', 'u2_l10', 'u2_l11', 'u2_l13'];

function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u2 7항목 로드 (u1 8항목 동반 로드)', () => {
  W = boot();
  const k2 = Object.keys(W.LESSONS).filter(k => k.startsWith('u2_'));
  ok(k2.length === 7, 'u2 항목 ' + k2.length);
  const k1 = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(k1.length === 8, 'u1 동반 로드 실패 ' + k1.length);
});
T('⚠️ 키가 건너뛴다 = 묶음 차시 규약 (l03·l04·l06·l08·l10·l11·l13 없음)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u2_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  SKIPPED.forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
});
T('슬라이드 id 0패딩 s01~sNN 연속', () => {
  KEYS.forEach(k => {
    const ids = L[k].slides.map(s => s.id);
    ids.forEach((id, i) => ok(id === 's' + String(i + 1).padStart(2, '0'), k + ' ' + id));
  });
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
T('⚠️ 전 항목에 review 실존 (u2_l01도 — 단원 넘는 계보)', () => {
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
    const html = renderAll(w2, 2, NS[k], 4);
    ok(html.length > 800, '렌더 실패');
  });
});

console.log('═══ D-1. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
const TEXT_SPEAK = ['발표할 때에는 또박또박 말해요.',
                    '듣는 사람을 바라봐요.',
                    '친구가 말할 때에는 끝까지 들어요.'];
const STORY_ALBUM = ['지우는 사진첩을 가만히 펼쳤습니다.',
                     '"할머니, 보고 싶어요." 지우가 속삭였습니다.',
                     '지우의 마음이 따뜻해졌습니다.'];

T('① 문장 짜임 세 갈래 정의 = 본차시 계승', () => {
  const t = plain(L['u2_l02'].slides);
  [['어찌하다', '움직임'], ['어떠하다', '성질이나 상태'], ['무엇이다', '무엇인지']]
    .forEach(([a, b]) => {
      ok(t.includes(a) && t.includes(b), '누락: ' + a + '/' + b);
      ok(txt(SRC02).includes(b), '본차시 미대응: ' + b);
    });
  const s06 = L['u2_l02'].slides.find(s => s.id === 's06').data.content.replace(/\*/g, '');
  ok(/어찌하다.*움직임/.test(s06), 'l02 어찌하다 정의 어긋남');
  const s07 = L['u2_l02'].slides.find(s => s.id === 's07').data.content.replace(/\*/g, '');
  ok(/어떠하다.*성질이나 상태/.test(s07), 'l02 어떠하다 정의 어긋남');
  const s13 = L['u2_l02'].slides.find(s => s.id === 's13').data.content.replace(/\*/g, '');
  ok(/무엇이다.*무엇인지/.test(s13), 'l02 무엇이다 정의 어긋남');
});
T('② l02 서술어 ↔ 짜임 3짝 전수 대조', () => {
  const a = L['u2_l02'].slides.find(s => s.id === 's17').data.answer;
  [['달립니다', '어찌하다'], ['예쁩니다', '어떠하다'], ['학생입니다', '무엇이다']]
    .forEach(([k, v]) => {
      ok(a.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(SRC02.includes(k), '본차시 미대응: ' + k);
    });
});
T('③ l02 어찌하다 문장 모으기 정답 3 · 오답 2 분리', () => {
  const yes = ['새가 날아갑니다.', '아이들이 웃습니다.', '물이 흐릅니다.'];
  const no = ['꽃이 빨갛습니다.', '그는 농부입니다.'];
  const t = plain(L['u2_l02'].slides);
  yes.concat(no).forEach(w => { ok(t.includes(w), '누락: ' + w); ok(SRC02.includes(w), '본차시 미대응: ' + w); });
  const a = L['u2_l02'].slides.find(s => s.id === 's18').data.answer;
  yes.forEach(w => ok(a.includes(w), '정답 자리 어긋남: ' + w));
  no.forEach(w => ok(!a.includes(w), '오답이 정답 자리에: ' + w));
});
T('④ l02 두 부분 나누기 3짝 = 본차시 원문 계승', () => {
  const a = L['u2_l02'].slides.find(s => s.id === 's10').data.answer;
  ['콩이가 / 뛰어갑니다.', '민주는 / 친절합니다.', '콩이는 / 강아지입니다.']
    .forEach(w => { ok(a.includes(w), '누락: ' + w); ok(txt(SRC02).includes(w), '본차시 미대응: ' + w); });
  const a28 = L['u2_l02'].slides.find(s => s.id === 's28').data.answer;
  ok(a28 === '동생이 / 우유를 마십니다.', 'l02 s28 정답 어긋남');
  /* ⚠️ 본차시는 이 값을 버튼 속성 data-fb 안에 담아 뒀다 — txt()는 태그를 통째로 걷어내므로
     여기서는 원문 그대로 대조해야 한다 (태그 밖 문장과 갈리는 자리). */
  ok(SRC02.includes('동생이 / 우유를 마십니다'), '본차시 미대응 (동생이)');
});
T('⑤ l05 쐐기표 규칙문 2줄 = 본차시 계승', () => {
  const s06 = L['u2_l05'].slides.find(s => s.id === 's06').data.content.replace(/\*/g, '');
  ok(/쐐기표 ∨.*조금 쉬어/.test(s06), 'l05 쐐기표 규칙문 어긋남');
  const s07 = L['u2_l05'].slides.find(s => s.id === 's07').data.content.replace(/\*/g, '');
  ok(/겹쐐기표 ∨∨.*조금 더/.test(s07), 'l05 겹쐐기표 규칙문 어긋남');
  ['조금 쉬어', '조금 더'].forEach(w => ok(txt(SRC05).includes(w), '본차시 미대응: ' + w));
});
T('⑥ l05 단오 사실 3종 = 본차시 계승', () => {
  const t = plain(L['u2_l05'].slides);
  ['음력 5월 5일', '그네', '씨름', '창포물'].forEach(w => {
    ok(t.includes(w), '누락: ' + w);
    ok(txt(SRC05).includes(w), '본차시 미대응: ' + w);
  });
});
T('⑦ l05 띄어 읽기 판별 정답 3 · 오답 2 분리', () => {
  const yes = ['사람들은 ∨ 씨름을 합니다.', '창포물이 ∨ 향기롭습니다.', '단오는 ∨ 명절입니다.'];
  const no = ['사람 ∨ 들은 씨름을 합니다.', '단오는 명절 ∨ 입니다.'];
  const t = plain(L['u2_l05'].slides);
  yes.concat(no).forEach(w => { ok(t.includes(w), '누락: ' + w); ok(txt(SRC05).includes(w), '본차시 미대응: ' + w); });
  const a = L['u2_l05'].slides.find(s => s.id === 's16').data.answer;
  yes.forEach(w => ok(a.includes(w), '정답 자리 어긋남: ' + w));
  no.forEach(w => ok(!a.includes(w), '오답이 정답 자리에: ' + w));
  ok(L['u2_l05'].slides.find(s => s.id === 's09').data.answer === '수리취떡은 ∨ 둥급니다',
     'l05 s09 정답 어긋남');
});
T('⑧ l07 「발표를 잘하려면」 3줄 = 본차시 원문과 문자열 완전 일치', () => {
  const s07 = L['u2_l07'].slides.find(s => s.id === 's07').data.content.replace(/\*/g, '');
  TEXT_SPEAK.forEach(line => {
    ok(txt(SRC07).includes(line), '본차시에 없는 줄: ' + line);
    ok(s07.includes(line), '케이티처에 없는 줄: ' + line);
  });
  ok(L['u2_l07'].slides.find(s => s.id === 's10').data.answer === '발표 예절을 지키자',
     'l07 글쓴이 생각 어긋남');
  ok(txt(SRC07).includes('발표 예절을 지키자'), '본차시 미대응 (글쓴이 생각)');
});
T('⑨ l07 문장 부호 ↔ 쉬는 정도 3짝 · 유창 태도 정답 3 · 오답 2', () => {
  const a = L['u2_l07'].slides.find(s => s.id === 's16').data.answer;
  [['쉼표', '조금 쉬어 읽기'], ['마침표', '조금 더 쉬어 읽기'], ['물음표', '끝을 올려 읽기']]
    .forEach(([k, v]) => {
      ok(a.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(txt(SRC07).includes(v), '본차시 미대응: ' + v);
    });
  const yes = ['뜻을 생각하며 읽기', '알맞은 빠르기로 읽기', '부호에 맞게 쉬어 읽기'];
  const no = ['글자를 건너뛰며 읽기', '아무 데서나 끊어 읽기'];
  yes.concat(no).forEach(w => ok(txt(SRC07).includes(w), '본차시 미대응(태도): ' + w));
});
T('⑩ l09 「할머니의 사진첩」 3줄 = 본차시 원문과 문자열 완전 일치', () => {
  const s26 = L['u2_l09'].slides.find(s => s.id === 's26').data.content.replace(/\*/g, '');
  STORY_ALBUM.forEach(line => {
    ok(txt(SRC09).includes(line), '본차시에 없는 줄: ' + line);
    ok(s26.includes(line), '케이티처에 없는 줄: ' + line);
  });
});
T('⑪ l09 준언어·비언어 정의 + 마음 ↔ 표현 3짝 · 방법 정답 3 · 오답 2', () => {
  const s13 = L['u2_l09'].slides.find(s => s.id === 's13').data.content.replace(/\*/g, '');
  ok(/준언어.*목소리/.test(s13), 'l09 준언어 정의 어긋남');
  const s14 = L['u2_l09'].slides.find(s => s.id === 's14').data.content.replace(/\*/g, '');
  ok(/비언어.*표정과 몸짓/.test(s14), 'l09 비언어 정의 어긋남');
  ['준언어', '비언어'].forEach(w => ok(txt(SRC09).includes(w), '본차시 미대응: ' + w));
  const a = L['u2_l09'].slides.find(s => s.id === 's17').data.answer;
  [['그리운 마음', '차분하고 부드러운 목소리'], ['기쁜 마음', '밝고 신나는 목소리'],
   ['놀란 마음', '커진 눈, 빨라진 말']]
    .forEach(([k, v]) => {
      ok(a.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(txt(SRC09).includes(v), '본차시 미대응: ' + v);
    });
  const yes = ['인물의 마음 짐작하기', '마음에 맞게 목소리 바꾸기', '표정·몸짓 함께 쓰기'];
  const no = ['아무 표정 없이 읽기', '마음과 상관없이 똑같이 읽기'];
  const a18 = L['u2_l09'].slides.find(s => s.id === 's18').data.answer;
  yes.forEach(w => { ok(a18.includes(w), '정답 자리 어긋남: ' + w); ok(txt(SRC09).includes(w), '본차시 미대응: ' + w); });
  no.forEach(w => { ok(!a18.includes(w), '오답이 정답 자리에: ' + w); ok(txt(SRC09).includes(w), '본차시 미대응: ' + w); });
  ok(L['u2_l09'].slides.find(s => s.id === 's09').data.answer === '차분하고 부드럽게',
     'l09 목소리 정답 어긋남');
});
T('⑫ l12 장면 ↔ 실감 표현 3짝 · 칭찬할 점 정답 3 · 오답 2', () => {
  const a = L['u2_l12'].slides.find(s => s.id === 's10').data.answer;
  [['신나는 장면', '밝고 빠른 목소리'], ['슬픈 장면', '느리고 낮은 목소리'],
   ['놀라는 장면', '커진 눈, 빨라진 말']]
    .forEach(([k, v]) => {
      ok(a.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(txt(SRC12).includes(v), '본차시 미대응: ' + v);
    });
  const yes = ['또박또박 분명하게 읽었어요', '알맞게 띄어 읽었어요', '마음을 살려 실감 나게 읽었어요'];
  const no = ['너무 빨라 알 수 없었어요', '표정 없이 웅얼거렸어요'];
  const a16 = L['u2_l12'].slides.find(s => s.id === 's16').data.answer;
  yes.forEach(w => { ok(a16.includes(w), '정답 자리 어긋남: ' + w); ok(txt(SRC12).includes(w), '본차시 미대응: ' + w); });
  no.forEach(w => { ok(!a16.includes(w), '오답이 정답 자리에: ' + w); ok(txt(SRC12).includes(w), '본차시 미대응: ' + w); });
});
T('⑬ l14 짜임 고르기 · 띄어 읽기 판별 · 짜임 잇기 = 본차시 계승', () => {
  ok(L['u2_l14'].slides.find(s => s.id === 's09').data.answer === '어떠하다', 'l14 국이 짜다 정답 어긋남');
  ok(txt(SRC14).includes('국이 짜다'), '본차시 미대응 (국이 짜다)');
  const yes = ['새가 ∨ 노래합니다.', '하늘이 ∨ 맑습니다.', '그는 ∨ 화가입니다.'];
  const no = ['새 ∨ 가 노래합니다.', '그는 화가 ∨ 입니다.'];
  const a10 = L['u2_l14'].slides.find(s => s.id === 's10').data.answer;
  yes.concat(no).forEach(w => ok(txt(SRC14).includes(w), '본차시 미대응: ' + w));
  yes.forEach(w => ok(a10.includes(w), '정답 자리 어긋남: ' + w));
  no.forEach(w => ok(!a10.includes(w), '오답이 정답 자리에: ' + w));
  const a11 = L['u2_l14'].slides.find(s => s.id === 's11').data.answer;
  [['강아지가', '짖습니다'], ['하늘이', '파랗습니다'], ['그는', '농부입니다']]
    .forEach(([k, v]) => {
      ok(a11.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(SRC14.includes(v), '본차시 미대응: ' + v);
    });
});
T('⑭ l14 글씨 쓰기 낱말 3종 = 본차시 계승 (문장·유창·예절)', () => {
  const o = L['u2_l14'].slides.find(s => s.block === 'offline_activity').data;
  ['문장', '유창', '예절'].forEach(w => {
    ok(plain(o).includes(w), '누락: ' + w);
    /* 본차시는 글씨 쓰기 칸에 '문'·'장'을 한 글자씩 따로 담는다 -> 공백 제거 대조 */
    ok(sq(SRC14).includes(w), '본차시 미대응: ' + w);
  });
});
T('⑮ l01 상황 ↔ 읽기 방법 3짝 · 태도 정답 3 · 오답 2 = 본차시 계승', () => {
  const a = L['u2_l01'].slides.find(s => s.id === 's10').data.answer;
  [['교실에서 발표할 때', '모두 들리게 큰 목소리로'],
   ['동생에게 책 읽어 줄 때', '다정하고 천천히'],
   ['방송으로 알릴 때', '똑똑하게 또박또박']]
    .forEach(([k, v]) => {
      ok(a.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(txt(SRC01).includes(v), '본차시 미대응: ' + v);
    });
  const yes = ['또박또박 분명하게 읽기', '알맞게 띄어 읽기', '알맞은 빠르기로 읽기'];
  const no = ['아무렇게나 빨리 읽기', '소리 없이 눈으로만 보기'];
  const a11 = L['u2_l01'].slides.find(s => s.id === 's11').data.answer;
  yes.forEach(w => { ok(a11.includes(w), '정답 자리 어긋남: ' + w); ok(txt(SRC01).includes(w), '본차시 미대응: ' + w); });
  no.forEach(w => { ok(!a11.includes(w), '오답이 정답 자리에: ' + w); ok(txt(SRC01).includes(w), '본차시 미대응: ' + w); });
  ok(L['u2_l01'].slides.find(s => s.id === 's09').data.answer === '또박또박 분명하게',
     'l01 방법 정답 어긋남');
});

console.log('═══ D-2. ⚠️ 띄어 읽기 검산기 (국어 첫 기계 검산) ═══');
/* ⚠️ 틀린 띄어 읽기 보기 6종 — 판별 문제의 근거라 본문에서 뺄 수 없다.
   오답 목록으로 받아 ①오답 자리에만 있는지 확인하고 ②마스킹한 뒤 나머지를 전수 검산한다.
   (수학 u5가 덧뺄식을 마스킹한 뒤 환산식을 검산한 선례와 같은 갈래) */
/* ⚠️ 짧은 토막으로 잡는다 — 오답 보기는 문제 줄에도, 풀이 줄에도 나온다
   (예: "풀이: 사람 ∨ 들은과 명절 ∨ 입니다는 낱말을 갈라 놓았어요").
   긴 문장 형태로만 마스킹하면 풀이 줄이 새어 검산기가 오탐한다. */
const WRONG_SPACING = ['사람 ∨ 들은', '명절 ∨ 입니다', '수리취떡 ∨ 은', '둥급 ∨ 니다',
                       '새 ∨ 가', '화가 ∨ 입니다'];
const JOSA = /(은|는|이|가|을|를|에|에서|도|만|와|과)$/;
const CONN = /(면|고|서|며|자)$/;
function spacingErrors(text) {
  const bad = [];
  let t = text.replace(/\\n/g, ' ').replace(/\*/g, '');
  WRONG_SPACING.forEach(w => { t = t.split(w.replace(/\*/g, '')).join('▣'); });
  /* ∨∨ = 문장 끝에만 (앞이 '다.' 또는 '요.') */
  /* ⚠️ ∨∨는 '겹쐐기표 ∨∨ = …'처럼 이름표로도 쓰인다 -> 읽기 줄에 놓인 것만 잡는다:
     뒤가 따옴표·역슬래시(줄바꿈 escape)·문장 끝·(공백+한글)일 때만 검산 대상. */
  const re2 = / ∨∨(?=["\\]|$| [가-힣])/g; let m;
  while ((m = re2.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 30), m.index).trim();
    if (!/(다\.|요\.|\?|!)$/.test(before)) bad.push('∨∨ 앞: …' + before.slice(-14));
  }
  /* ∨(하나) = 앞 토막이 조사 또는 연결어미로 끝난다 */
  const re1 = / ∨ (?=[가-힣"])/g;
  while ((m = re1.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 30), m.index).trim();
    const tok = (before.split(/[\s\u00a0]+/).pop() || '').replace(/["'`]/g, '');
    if (!(tok.length >= 2 && (JOSA.test(tok) || CONN.test(tok)))) bad.push('∨ 앞: …' + before.slice(-14));
  }
  return bad;
}
T('오답 6종은 오답 자리에만 있다 (정답 문자열에 새지 않음)', () => {
  const answers = KEYS.flatMap(k => L[k].slides
    .filter(s => s.data && typeof s.data.answer === 'string').map(s => s.data.answer));
  WRONG_SPACING.forEach(w => {
    ok(BODY.includes(w), '오답 보기가 본문에 없음: ' + w);
    answers.forEach(a => ok(!a.includes(w), '오답이 정답 자리에: ' + w));
  });
});
T('⚠️ ∨ 전수 검산 — 앞 토막이 조사·연결어미로 끝난다 (오답 마스킹 뒤)', () => {
  const bad = spacingErrors(STUDENT);
  ok(bad.length === 0, bad.slice(0, 6).join(' / '));
});
T('⚠️ ∨∨ 전수 검산 — 문장 끝에만 온다 (오답 마스킹 뒤)', () => {
  const bad = spacingErrors(STUDENT).filter(x => x.startsWith('∨∨'));
  ok(bad.length === 0, bad.slice(0, 6).join(' / '));
});
T('띄어 읽기 줄이 실제로 여러 항목에 실존한다 (검산기가 헛도는 것 방지)', () => {
  const n = (STUDENT.match(/ ∨ /g) || []).length;
  ok(n >= 15, '쐐기표 줄 ' + n + '개뿐 — 검산 대상이 모자란다');
  ['u2_l05', 'u2_l07', 'u2_l12', 'u2_l14'].forEach(k =>
    ok(/ ∨ /.test(studentText(k)), k + '에 쐐기표 줄 없음'));
});

console.log('═══ E. 저작권 · 용어 가드 ═══');
T('⚠️ 지도서 수록 제재명·작가명 0건 (국어 최우선 가드)', () => {
  /* u2 본차시 머리 주석이 명시적으로 회피한 것 + u1의 차단 18종(같은 지도서) */
  const COPY_BAN_U2 = ['정우 사연', '지호와 나비', '지호', '노란 나비',
                       '하나 둘 셋 찰칵', '김치, 치즈, 카프카', '선현경',
                       '세계여행 할아버지', '카프카', '별이 된 할아버지'];
  const COPY_BAN_U1 = ['웃음 참는 나무', '한현정', '벚꽃 팝콘', '김기연', '오늘부터는', '오은영',
                       '권영세', '학교 가는 길', '이진희', '뜨거운 호두과자', '김기택',
                       '슬비', '레오의 특별한 꿈', '정소현', '꿈 마을', '황금새',
                       '봉구야 말해 줘', '아이스크림 사 오는 길에 생긴 일'];
  const hit = COPY_BAN_U2.concat(COPY_BAN_U1).filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('게재 제재는 본차시 자체 창작 세 편뿐 (낫표 전수 검사)', () => {
  const ALLOW = ['「민주와 강아지」', '「발표를 잘하려면」', '「할머니의 사진첩」',
                 '「분명하고 유창하게」'];
  const uniq = [...new Set(BODY.match(/「[^」]+」/g) || [])];
  ok(uniq.every(t => ALLOW.includes(t)), uniq.join(','));
  /* ⚠️ 허용 목록만 넓히면 다음 사람이 아무 제목이나 얹을 수 있다 ->
     본차시가 실제로 그 제목을 창작했는지까지 함께 잠근다 (u1 「떨리는 발표」 선례) */
  ok(SRC02.includes('「민주와 강아지」'), '본차시가 창작하지 않은 제목 (l02)');
  ok(SRC07.includes('「발표를 잘하려면」'), '본차시가 창작하지 않은 제목 (l07)');
  ok(SRC09.includes('「할머니의 사진첩」'), '본차시가 창작하지 않은 제목 (l09)');
});
T('⚠️ 문법 이름표는 낫표로 감싸지 않는다 (누가/무엇이 등)', () => {
  ['「누가/무엇이」', '「어찌하다」', '「어떠하다」', '「무엇이다」', '「단오」', '「발표 예절」']
    .forEach(w => ok(!BODY.includes(w), '낫표로 감쌈: ' + w));
  ok(STUDENT.includes('누가/무엇이'), '문법 이름표 자체가 없음');
});
T('미도입 갈래(4학년 이상 소관) 학생 노출 0', () => {
  /* ⚠️ '주어'는 단독으로 걸면 안 된다 — '읽어 주어요·도와주어'가 통째로 오탐이다.
     '주어부'·'주어와 서술어' 묶음으로만 검사한다 (u1의 '연과 행' 선례 계승).
     ⚠️ '서술어'·'서술부'·'준언어'·'비언어'는 본차시가 학생에게 직접 쓰는 낱말이라 금지어가 아니다. */
  const BAN = ['목적어', '문장 성분', '홑문장', '겹문장', '품사', '명사', '동사', '형용사',
               '시제', '높임 표현', '부사어', '관형어', '문장의 호응', '주어부', '주어와 서술어'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['문장 성분', '읽기 유창성', '의미 단위'].forEach(w => ok(!STUDENT.includes(w), '학생 노출: ' + w));
  ok(/교시|짜임|마음/.test(TNOTE), 'tnote에 교사 몫 표지 없음');
});
T('⚠️ 준언어·비언어는 쉬운 풀이말과 함께 쓴다 (본차시 계승 · 정직 원칙)', () => {
  const s13 = plain(L['u2_l09'].slides.find(s => s.id === 's13'));
  const s14 = plain(L['u2_l09'].slides.find(s => s.id === 's14'));
  ok(s13.includes('목소리'), '준언어에 풀이말 없음');
  ok(s14.includes('표정') && s14.includes('몸짓'), '비언어에 풀이말 없음');
  /* 쉬운 풀이 안내는 슬라이드 note와 보조자료(extras)에 둔다 — tnote만 보면 놓친다 */
  ok(/목소리로 나타내는 것/.test(BODY), '쉬운 풀이 안내가 어디에도 없음');
});
T('⚠️ 선행 용어 — 쐐기표·∨는 l05 도입 (l01·l02 본문 0, next_lesson 예외)', () => {
  ['u2_l01', 'u2_l02'].forEach(k => {
    const s = L[k].slides.filter(x => x.block !== 'next_lesson');
    const t = plain(s);
    ok(!t.includes('쐐기표'), k + ' 본문에 쐐기표 선행');
    ok(!t.includes('∨'), k + ' 본문에 ∨ 선행');
  });
  ok(plain(L['u2_l02'].slides.find(s => s.block === 'next_lesson')).includes('쐐기표'),
     'l02 next_lesson에 쐐기표 예고 없음');
  ok(plain(L['u2_l05'].slides).includes('쐐기표'), 'l05에 쐐기표 도입 없음');
});
T('⚠️ 선행 용어 — 준언어·비언어는 l09 도입 (l01·l02·l05·l07 본문 0)', () => {
  ['u2_l01', 'u2_l02', 'u2_l05', 'u2_l07'].forEach(k => {
    const t = plain(L[k].slides.filter(x => x.block !== 'next_lesson'));
    ['준언어', '비언어'].forEach(w => ok(!t.includes(w), k + ' 본문에 ' + w + ' 선행'));
  });
  ok(plain(L['u2_l09'].slides).includes('준언어'), 'l09에 준언어 도입 없음');
});
T('l01은 단원 예고 차시 — 세 갈래 이름만 소개하고 본론은 뒤로 미룬다', () => {
  const l01 = studentText('u2_l01');
  ok(/유창하게/.test(l01) && /실감 나게/.test(l01) && /문장의 짜임/.test(l01), 'l01 예고 누락');
  ok(!/어찌하다/.test(l01) || /next_lesson/.test(plain(L['u2_l01'].slides)),
     'l01이 짜임 본론을 미리 꺼냄');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 2차시 묶음 24슬 / 3차시 묶음 36슬', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬 (기대 ' + BLOCKED[k] + ')'));
});
T('extras 20~26 · 참조 무결성 · 중복 0', () => {
  KEYS.forEach(k => {
    const ids = L[k].extras.map(e => e.id);
    ok(ids.length >= 20 && ids.length <= 26, k + ' extras ' + ids.length);
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
T('⚠️ 3차시 묶음 = 120분 · covers 물결 · period_split 경계 둘', () => {
  TRIPLE.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 120, k + ' duration ' + m.duration_min);
    /* ⚠️ 3차시 묶음은 물결(~)로 적는다 — u1의 covers.includes('·') 단언을 복제하면 여기서 깨진다 */
    ok(/차시$/.test(m.covers) && m.covers.includes('~'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12,s24', k + ' period_split ' + m.period_split);
  });
});
T('⚠️ 2차시 묶음 = 80분 · covers 가운뎃점 · period_split 하나', () => {
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
T('⚠️ 수업시간 합 = 14차시 × 40분 = 560분', () => {
  const sum = KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0);
  ok(sum === 560, '합 ' + sum + '분');
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
  const chain = [['u2_l01', 'u1_l13'], ['u2_l02', 'u2_l01'], ['u2_l05', 'u2_l02'],
                 ['u2_l07', 'u2_l05'], ['u2_l09', 'u2_l07'], ['u2_l12', 'u2_l09'],
                 ['u2_l14', 'u2_l12']];
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
T('leveled = 기본·도전·심화 3수준 · 심화 open (묶음은 2개 이상)', () => {
  KEYS.forEach(k => {
    const lvs = L[k].slides.filter(s => s.block === 'leveled_problem');
    ok(lvs.length >= 1, k + ' leveled 없음');
    ok(lvs.length === (TRIPLE.includes(k) ? 2 : 1), k + ' leveled ' + lvs.length + '개');
    lvs.forEach(s => {
      const lv = s.data.levels;
      ok(lv['기본'] && lv['도전'] && lv['심화'], k + ' ' + s.id + ' 수준 누락');
      ok(lv['심화'].open === true, k + ' ' + s.id + ' 심화 open 아님');
      ok(Array.isArray(lv['기본'].steps) && lv['기본'].steps.length >= 3, k + ' ' + s.id + ' 기본 steps');
    });
  });
});
T('offline_activity = 전 항목 유지 · 준비물·분 실존', () => {
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
T('meta 정합 (grade·subject·unit·n·std·theme·live_url·본차시 실존)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(m.grade === 3 && m.subject === '국어' && m.unit === 2, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(/^\[4국|단원 전체/.test(m.std), k + ' std ' + m.std);
    ok(m.theme === '곰이·펭이 또랑또랑 읽기 방송국', k + ' theme');
    ok(m.live_url.includes('2단원_분명하고유창하게'), k + ' live_url');
    ok(fs.existsSync(path.join(ROOT, m.live_url.replace('../../', ''))),
       k + ' 본차시 파일 없음');
  });
});
T('⚠️ std = 본차시 머리 주석이 선언한 성취기준 그대로', () => {
  ok(L['u2_l02'].meta.std === '[4국04-03]' && SRC02.includes('[4국04-03]'), 'l02 std');
  ok(L['u2_l05'].meta.std === '[4국04-03]' && SRC05.includes('[4국04-03]'), 'l05 std');
  ok(L['u2_l07'].meta.std === '[4국02-01]' && SRC07.includes('[4국02-01]'), 'l07 std');
  ok(L['u2_l09'].meta.std === '[4국01-03]' && SRC09.includes('[4국01-03]'), 'l09 std');
  /* l01·l12·l14는 본차시가 성취기준을 선언하지 않았다 -> 억지로 고르지 않고 통합으로 둔다
     (수학 u7이 "1학기 종합"으로 둔 선례) */
  ['u2_l01', 'u2_l12', 'u2_l14'].forEach(k =>
    ok(L[k].meta.std === '단원 전체 통합', k + ' std ' + L[k].meta.std));
});
T('CURRICULUM ↔ LESSONS 정합 (u2 블록 7항목 · ready 7 = u2 완주)', () => {
  const cur = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0];
  /* ⚠️ u3 개통으로 단원이 셋이 되었다 — 뒤 전부를 먹으면 {n: 전수 긁기가 무너진다.
     u1 게이트와 같은 방식으로 unit 2 블록만 잘라낸다. */
  const u2 = (cur.match(/unit:\s*2,[\s\S]*?(?=\n\s*\},\n\s*\{\n\s*unit:\s*3|\];)/) || [''])[0];
  ok(u2.length > 100, 'unit 2 블록을 못 잘랐다');
  const ns = [...u2.matchAll(/\{n:\s*(\d+),/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify([1, 2, 5, 7, 9, 12, 14]), ns.join(','));
  ok((u2.match(/ready:\s*true/g) || []).length === 7, 'u2 ready 어긋남');
  ok(/lesson_count:\s*7/.test(u2), 'lesson_count 어긋남');
  KEYS.forEach(k => {
    const t = L[k].meta.title;
    ok(u2.includes(t), 'CURRICULUM 제목 불일치: ' + t);
  });
});
T('홈 배선 · slug · u1 회귀', () => {
  ok(HOME.includes('data/g3_korean_u1.js'), 'u1 배선 없음');
  ok(HOME.includes('data/g3_korean_u2.js'), 'u2 배선 없음');
  ok(/slug:\s*"g3_korean"/.test(HOME), 'slug 어긋남');
  ok(!HOME.includes('g3_math'), '수학 잔여 참조');
  ok(/unit:\s*1,\s*title:\s*"생생하게 표현해요"/.test(HOME), 'u1 블록 훼손');
});
T('⚠️ 허브 "3_korean" 카운트 갱신 (u1 8 + u2 7 + u3 7 = units 3 · lessons 22)', () => {
  const m = HUB.match(/"3_korean":\s*\{\s*file:\s*"g3_korean\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '허브에 3_korean 미등재');
  ok(+m[1] === 3, 'units ' + m[1]);
  ok(+m[2] === 22, 'lessons ' + m[2]);
  /* ⚠️ 다음 단원(u3) 개통 시 이 두 수와 gate_g3_korean_u1.js의 같은 단언을 함께 올릴 것 */
  ok(/"3_math"[\s\S]*?lessons:\s*55/.test(HUB), 'g3 수학 허브 단언 훼손');
});
T('케이랩 매핑 없음 = 의도적 (목소리·표정 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_korean_klab.js')), 'klab 파일 생김');
  ok(!/klab/i.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u2 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '본격', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 박- 계열 0 (발표회 차시라 「손뼉」으로 갈라 쓴다)', () => {
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
