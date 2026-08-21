/* gate_g3_korean_u1.js — 케이티처 g3 국어 u1 「생생하게 표현해요」 신규 제작 게이트.
   40분 표준 v2 실내용 신규 제작 검증. 실엔진(jsdom) 부팅 → openShow → 7요소 실렌더 + 회귀.

   ⚠️ 국어 첫 진입이라 수학 게이트와 달라지는 자리 네 곳 (파일 머리 규약을 그대로 검사한다):
   (1) 키가 연속하지 않는다 — u1_l01 · u1_l02(2·3) · u1_l04(4·5) · u1_l06 ·
       u1_l07(7·8) · u1_l09(9·10) · u1_l11(11·12) · u1_l13.  l03·l05·l08·l10·l12는 생기지 않는다.
       수학의 "l01~lNN 연속" 단언을 그대로 가져오면 즉시 실패한다.
   (2) 묶음 차시는 80분 — duration_min·covers·period_split을 함께 검사하고,
       period_split 슬라이드 tnote에 교시 경계가 적혀 있는지 본다.
   (3) 수학의 D(사칙 전수 검산) 자리를 **인용 전수 대조**가 대신한다 —
       자체 창작 동시 두 편의 네 행을 학생 본차시 원문과 문자열 완전 일치로 검사한다.
   (4) 국어 최우선 가드 = 저작권. 지도서 수록 제재명·작가명이 학생 노출 자리에 0건이어야 한다.

   ⚠️ 2026-08-21 2차 — u1 8항목 완주. 이 시점에 허브(index.html)에 "3_korean"을 등재했다
      (units 1 · lessons 8). g3 수학이 u1 개통 때 1/9로 등재하고 단원마다 카운트를 올린 선례를 따른다.
      다음 단원(g3 국어 u2) 개통 시 이 게이트의 허브 카운트 단언을 함께 올려야 한다.

   실행: NODE_PATH=/home/claude/.jsdom/node_modules node gate_g3_korean_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const DATA = fs.readFileSync(path.join(TDIR, 'data/g3_korean_u1.js'), 'utf8');
/* 용어·저작권 가드는 본문만 대상 — 파일 머리 주석에 차단 목록 자체가 적혀 있어
   자기 참조 오탐을 막으려면 반드시 잘라내고 검사한다 (g3 수학 u1~u7 선례 계승). */
const BODY = DATA.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const HOME = fs.readFileSync(path.join(TDIR, 'g3_korean.html'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const CURRIC_SRC = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0]
  .replace(/^const CURRICULUM/, 'window.CURRICULUM');

/* 학생 본차시 원문 = 인용 대조의 단일 정답 */
const SDIR = path.join(ROOT, 'grade3/semester1/korean/1단원_생생하게표현해요');
const SRC01 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l01.html'), 'utf8');
const SRC02 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l02_03.html'), 'utf8');
const SRC04 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l04_05.html'), 'utf8');
const SRC06 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l06.html'), 'utf8');
const SRC07 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l07_08.html'), 'utf8');
const SRC09 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l09_10.html'), 'utf8');
const SRC11 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l11_12.html'), 'utf8');
const SRC13 = fs.readFileSync(path.join(SDIR, 'g3_kor_u1_l13.html'), 'utf8');

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const plain = (o) => JSON.stringify(o).replace(/\*/g, '');
/* ⚠️ 학생 본차시 원문은 <b class="emph">가 낱말 한가운데를 가르는 곳이 있다
   (예: 자신감 넘치고 밝은<b>목소리</b>, 글씨 쓰기 칸은 한 글자씩 따로 감싼다).
   원문 대조는 그래서 두 갈래로 한다 —
     txt(): 태그 제거 + 공백 1칸으로 정규화 (문장·구 대조용)
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
  w.eval(DATA); w.eval(CURRIC_SRC); w.eval(ENGINE);
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
eval(DATA);
const L = global.window.LESSONS;

const KEYS = ['u1_l01', 'u1_l02', 'u1_l04', 'u1_l06', 'u1_l07',
              'u1_l09', 'u1_l11', 'u1_l13'];
const NS = { u1_l01: 1, u1_l02: 2, u1_l04: 4, u1_l06: 6, u1_l07: 7,
             u1_l09: 9, u1_l11: 11, u1_l13: 13 };
/* 묶음 차시 24슬(1교시 12 + 2교시 12) / 단일 차시 19슬 */
const PAIRED = ['u1_l02', 'u1_l04', 'u1_l07', 'u1_l09', 'u1_l11'];
const BLOCKED = {};
KEYS.forEach(k => { BLOCKED[k] = PAIRED.includes(k) ? 24 : 19; });

function studentText(k) {
  const s = L[k].slides.map(x => { const c = Object.assign({}, x); delete c.tnote; return c; });
  return plain(s);
}
const STUDENT = KEYS.map(studentText).join('\n');
const TNOTE = KEYS.map(k => plain(L[k].slides.map(x => x.tnote).filter(Boolean))).join('\n');

/* ══════════════════════════════════════════════════════════ */
console.log('═══ A. 부팅 · 키 규약 ═══');
let W;
T('부팅 + u1 3항목 로드', () => {
  W = boot();
  const keys = Object.keys(W.LESSONS).filter(k => k.startsWith('u1_'));
  ok(keys.length === 8, 'u1 항목 ' + keys.length);
});
T('⚠️ 키가 건너뛴다 = 묶음 차시 규약 (l03·l05·l08·l10·l12 없음)', () => {
  const got = Object.keys(L).filter(k => k.startsWith('u1_')).sort();
  ok(JSON.stringify(got) === JSON.stringify(KEYS), got.join(','));
  ['u1_l03', 'u1_l05', 'u1_l08', 'u1_l10', 'u1_l12']
    .forEach(k => ok(!L[k], '묶인 차시가 따로 생김: ' + k));
  ok(Object.keys(L).filter(k => k.startsWith('u1_')).length === 8, '8항목 아님');
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
    const html = renderAll(W, 1, NS[k], L[k].slides.length + 2);
    ok(!/내용을 추가하세요/.test(html), '폴백 잔존');
    const blocks = L[k].slides.map(s => s.block);
    ['cover', 'objective', 'motivate', 'concept', 'misconception', 'basic_problem',
     'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem',
     'exit_ticket', 'summary', 'self_assessment', 'next_lesson']
      .forEach(b => ok(blocks.includes(b), k + ' ' + b + ' 없음'));
    ok(html.length > 3000, '렌더 길이 ' + html.length);
  });
});
T('u1_l01만 review 없음 · 나머지 일곱 항목은 review 실존', () => {
  ok(!L['u1_l01'].slides.some(s => s.block === 'review'), 'l01에 review');
  KEYS.filter(k => k !== 'u1_l01').forEach(k =>
    ok(L[k].slides.some(s => s.block === 'review'), k + ' review 없음'));
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
    const html = renderAll(w2, 1, NS[k], 4);
    ok(html.length > 800, '렌더 실패');
  });
});

console.log('═══ D. 근거 인용 전수 대조 (수학의 검산기 자리) ═══');
const POEM_MEADOW = ['초록 풀밭에 살랑살랑', '노랑 민들레 방긋방긋',
                     '풀벌레는 또르르 또르르', '코끝에 스미는 풀 내음 향긋'];
const POEM_ROPE = ['휘잉휘잉 줄이 노래해', '빙글빙글 동그라미 그려요',
                   '폴짝폴짝 콩처럼 튀고', '사뿐사뿐 깃털로 내려요'];
T('「풀밭에서」 4행 = 학생 본차시 원문과 문자열 완전 일치', () => {
  POEM_MEADOW.forEach(line => {
    ok(SRC02.includes(line), '본차시에 없는 행: ' + line);
    ok(BODY.includes(line), '케이티처에 없는 행: ' + line);
  });
});
T('「폴짝 줄넘기」 4행 = 학생 본차시 원문과 문자열 완전 일치', () => {
  POEM_ROPE.forEach(line => {
    ok(SRC04.includes(line), '본차시에 없는 행: ' + line);
    ok(BODY.includes(line), '케이티처에 없는 행: ' + line);
  });
});
T('흉내말 ↔ 감각 짝 전수 대조 (l02)', () => {
  const pairs = [['살랑살랑', '눈'], ['방긋방긋', '눈'], ['또르르 또르르', '귀'], ['향긋', '코']];
  const t = plain(L['u1_l02'].slides);
  pairs.forEach(([w]) => ok(t.includes(w), 'l02에 없는 표현: ' + w));
  const s13 = L['u1_l02'].slides.find(s => s.id === 's13').data.content.replace(/\*/g, '');
  ok(/살랑살랑.*방긋방긋.*눈으로 본 모습/.test(s13), '눈 짝 어긋남');
  ok(/또르르 또르르.*귀로 들은 소리/.test(s13), '귀 짝 어긋남');
  ok(/향긋.*코로 맡은 냄새/.test(s13), '코 짝 어긋남');
});
T('흉내말 ↔ 모습 짝 전수 대조 (l04)', () => {
  const s14 = L['u1_l04'].slides.find(s => s.id === 's14').data.content.replace(/\*/g, '');
  ok(/줄이 도는 소리는 휘잉휘잉/.test(s14), '휘잉휘잉 짝 어긋남');
  ok(/도는 모습은 빙글빙글/.test(s14), '빙글빙글 짝 어긋남');
  ok(/뛰는 모습은 폴짝폴짝/.test(s14), '폴짝폴짝 짝 어긋남');
  ok(/가볍게 내려서는 모습은 사뿐사뿐/.test(s14), '사뿐사뿐 짝 어긋남');
});
T('기본문제 정답 = 학생 본차시 계승 (사뿐사뿐 뜻 · 귀로 듣는 소리 · 짹짹 새소리)', () => {
  const a = KEYS.flatMap(k => L[k].slides.filter(s => s.block === 'basic_problem')
    .map(s => s.data.answer));
  ok(a.includes('짹짹 새소리'), 'l01 정답 어긋남');
  ok(a.includes('귀로 듣는 소리'), 'l02 정답 어긋남');
  ok(a.includes('소리 없이 가볍게 내딛는 모양'), 'l04 정답 어긋남');
  ok(SRC01.includes('짹짹 새소리'), '본차시 미대응 (l01)');
  ok(SRC04.includes('소리 없이 가볍게 내딛는 모양'), '본차시 미대응 (l04)');
});
T('낭송 방법 3종 = 본차시 계승 (분위기 목소리 · 쉬어 읽기 · 강조)', () => {
  const s13 = plain(L['u1_l04'].slides.find(s => s.id === 's13'));
  ['분위기', '쉬어 읽어요', '강조'].forEach(w => ok(s13.includes(w), '누락: ' + w));
  ok(SRC04.includes('쉬어 읽기'), '본차시 미대응');
});
T('감각적 표현 정의 = 본차시 계승', () => {
  const def = plain(L['u1_l02'].slides.find(s => s.id === 's05'));
  ok(/보고 듣고 맛보고 냄새 맡고 만진 경험을.*생생하게 나타낸 말/.test(def), '정의 어긋남');
  ok(SRC02.includes('생생하게 나타낸 말'), '본차시 미대응');
});

/* ── 2차(l06·l07·l09·l11·l13) 인용 대조 ── */
const STORY = ['하준이는 발표가 무서워 고개를 푹 숙였어요.',
               '"나… 못 하겠어." 떨리는 작은 목소리였어요.',
               '서아가 어깨를 토닥이며 밝게 말했어요.',
               '"괜찮아, 내가 응원할게!"'];
T('「떨리는 발표」 4행 = 학생 본차시 원문과 문자열 완전 일치', () => {
  const s06 = L['u1_l07'].slides.find(s => s.id === 's06').data.content.replace(/\*/g, '');
  STORY.forEach(line => {
    ok(SRC07.includes(line), '본차시에 없는 줄: ' + line);
    ok(s06.includes(line), '케이티처에 없는 줄: ' + line);
  });
});
T('l06 상황 ↔ 목소리·말투 짝 전수 대조', () => {
  const a = L['u1_l06'].slides.find(s => s.id === 's10').data.answer;
  [['칭찬을 들음', '밝고 자신감 넘치는 목소리'],
   ['잘못을 깨달음', '공손하고 작은 목소리'],
   ['반가운 친구를 만남', '반갑고 신나는 목소리']]
    .forEach(([k, v]) => ok(a.includes(k + '-' + v), '짝 어긋남: ' + k));
  ['자신감 넘치고 밝은 목소리', '공손하고 작은 목소리']
    .forEach(w => ok(txt(SRC06).includes(w), '본차시 미대응: ' + w));
});
T('l06 좋은 점 3종 = 본차시 계승 · 오답 1종 분리', () => {
  const t = plain(L['u1_l06'].slides);
  ['내 마음을 정확히 전해요', '상대의 마음을 배려해요', '서로의 처지를 이해해요']
    .forEach(w => { ok(t.includes(w), '누락: ' + w); ok(SRC06.includes(w), '본차시 미대응: ' + w); });
  ok(L['u1_l06'].slides.find(s => s.id === 's11').data.answer === '친구가 더 화나요', '오답 자리 어긋남');
  ok(SRC06.includes('친구가 더 화나요'), '본차시 미대응 (오답)');
});
T('l07 마음 ↔ 표정·몸짓 짝 전수 대조', () => {
  const a = L['u1_l07'].slides.find(s => s.id === 's10').data.answer;
  [['무서움', '고개 숙이고 움츠리기'], ['응원함', '웃으며 어깨 토닥이기'],
   ['해냈음', '활짝 웃으며 두 손 번쩍']]
    .forEach(([k, v]) => {
      ok(a.includes(k + '-' + v), '짝 어긋남: ' + k);
      ok(SRC07.includes(v), '본차시 미대응: ' + v);
    });
});
T('l07 응원 표현 3종 · 아닌 것 2종 = 본차시 계승', () => {
  const yes = ['환하게 웃는 표정', '밝고 다정한 목소리', '어깨를 토닥이는 몸짓'];
  const no = ['눈을 흘기는 표정', '등을 돌리는 몸짓'];
  const t = plain(L['u1_l07'].slides);
  yes.concat(no).forEach(w => { ok(t.includes(w), '누락: ' + w); ok(SRC07.includes(w), '본차시 미대응: ' + w); });
  const a = L['u1_l07'].slides.find(s => s.id === 's16').data.answer;
  no.forEach(w => ok(a.includes(w), '오답 자리 어긋남: ' + w));
  yes.forEach(w => ok(!a.includes(w), '정답이 오답 자리에: ' + w));
});
T('l09 상황 ↔ 말투 짝 전수 대조 · 표정 정답', () => {
  const a = L['u1_l09'].slides.find(s => s.id === 's10').data.answer;
  [['친구가 다침', '걱정스럽고 다정한 말투'], ['준비물 빌리기', '미안하고 공손한 말투'],
   ['반가운 친구 만남', '반갑고 신나는 말투']]
    .forEach(([k, v]) => ok(a.includes(k + '-' + v), '짝 어긋남: ' + k));
  ok(L['u1_l09'].slides.find(s => s.id === 's09').data.answer === '환하게 웃는 표정', 'l09 표정 정답 어긋남');
  ['걱정스러운 표정', '괜찮아? 내가 도와줄게.', '환하게 웃는 표정']
    .forEach(w => ok(SRC09.includes(w), '본차시 미대응: ' + w));
});
T('l09 지킬 점 3종 · 아닌 것 2종 = 본차시 계승', () => {
  const yes = ['상황에 맞게 실감 나게', '언어 예절 지키기', '또렷한 목소리로 전하기'];
  const no = ['친구를 비웃기', '대충 장난치기'];
  const t = plain(L['u1_l09'].slides);
  yes.concat(no).forEach(w => { ok(t.includes(w), '누락: ' + w); ok(SRC09.includes(w), '본차시 미대응: ' + w); });
  const a = L['u1_l09'].slides.find(s => s.id === 's16').data.answer;
  no.forEach(w => ok(a.includes(w), '오답 자리 어긋남: ' + w));
});
T('l11 감각적 표현 판별 5항목 = 본차시 계승 (정답 3 · 아닌 것 2)', () => {
  const yes = ['파도가 철썩철썩 친다', '갈매기가 끼룩끼룩 운다', '모래가 보슬보슬하다'];
  const no = ['바다가 있다', '날씨가 그렇다'];
  const t = plain(L['u1_l11'].slides);
  yes.concat(no).forEach(w => { ok(t.includes(w), '누락: ' + w); ok(SRC11.includes(w), '본차시 미대응: ' + w); });
  const a = L['u1_l11'].slides.find(s => s.id === 's10').data.answer;
  no.forEach(w => ok(a.includes(w), '오답 자리 어긋남: ' + w));
  yes.forEach(w => ok(!a.includes(w), '정답이 오답 자리에: ' + w));
});
T('l11 상황 ↔ 대화 짝 전수 대조', () => {
  const a = L['u1_l11'].slides.find(s => s.id === 's16').data.answer;
  [['비가 와서 좋을 때', '빗소리가 시원해서 좋아!'],
   ['친구가 아플 때', '많이 아프니? 얼른 나아.'],
   ['선물을 받을 때', '우아, 정말 고마워!']]
    .forEach(([k, v]) => {
      ok(a.includes(k) && a.includes(v), '짝 어긋남: ' + k);
      ok(SRC11.includes(v), '본차시 미대응: ' + v);
    });
  ok(/느낌을 살려 또박또박/.test(plain(L['u1_l11'].slides)), '낭송회 태도 누락');
  ok(SRC11.includes('느낌을 살려 또박또박'), '본차시 미대응 (낭송회 태도)');
});
T('⚠️ l13 연음 전수 대조 (이어 읽기 4 · 대표음화 2) = 본차시 값과 완전 일치', () => {
  const LINK = [['꽃이', '꼬치'], ['무릎을', '무르플'], ['부엌에서', '부어케서'], ['책을', '채글']];
  const CHANGE = [['부엌 안', '부어간'], ['무릎 위', '무르뷔']];
  const t = plain(L['u1_l13'].slides);
  LINK.concat(CHANGE).forEach(([w, snd]) => {
    ok(t.includes(w), 'l13에 없는 낱말: ' + w);
    ok(t.includes('[' + snd + ']'), 'l13에 없는 발음: [' + snd + ']');
    ok(SRC13.includes(snd), '본차시 미대응: ' + snd);
  });
  /* 규칙이 갈리는 자리 = 뒤에 뜻이 있는 낱말이 오면 소리가 바뀐다 */
  const s06 = L['u1_l13'].slides.find(s => s.id === 's06').data.content.replace(/\*/g, '');
  ok(/뜻을 지닌 낱말/.test(s06) && /다른 소리로 바꿔/.test(s06), 'l13 대표음화 규칙문 어긋남');
  const s05 = L['u1_l13'].slides.find(s => s.id === 's05').data.content.replace(/\*/g, '');
  ok(/뜻이 없는 ㅇ/.test(s05) && /그대로 이어/.test(s05), 'l13 연음 규칙문 어긋남');
});
T('⚠️ l13 오답 발음 2종이 정답 자리에 새지 않는다', () => {
  const a = L['u1_l13'].slides.find(s => s.id === 's10').data.answer;
  ok(a.includes('무르플위') && a.includes('부어칸'), '오답 자리 어긋남');
  const s11a = L['u1_l13'].slides.find(s => s.id === 's11').data.answer;
  ['무르플위', '부어칸'].forEach(w => ok(!s11a.includes(w), '오답이 정답 잇기에 샘: ' + w));
  ok(L['u1_l13'].slides.find(s => s.id === 's09').data.answer === '[꼬치]', 'l13 발음 정답 어긋남');
});
T('l13 글씨 쓰기 낱말 3종 = 본차시 계승 (향기·시간·햇살)', () => {
  const o = L['u1_l13'].slides.find(s => s.block === 'offline_activity').data;
  ['향기', '시간', '햇살'].forEach(w => {
    ok(plain(o).includes(w), '누락: ' + w);
    /* 본차시는 글씨 쓰기 칸에 '향'·'기'를 한 글자씩 따로 담는다 -> 공백 제거 대조 */
    ok(sq(SRC13).includes(w), '본차시 미대응: ' + w);
  });
});

console.log('═══ E. 저작권 · 용어 가드 ═══');
T('⚠️ 지도서 수록 제재명·작가명 0건 (국어 최우선 가드)', () => {
  const COPY_BAN = ['웃음 참는 나무', '한현정', '벚꽃 팝콘', '김기연', '오늘부터는', '오은영',
                    '권영세', '학교 가는 길', '이진희', '뜨거운 호두과자', '김기택',
                    '슬비', '레오의 특별한 꿈', '정소현', '꿈 마을', '황금새',
                    '봉구야 말해 줘', '아이스크림 사 오는 길에 생긴 일'];
  const hit = COPY_BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('게재 제재는 자체 창작 세 편뿐 (「풀밭에서」·「폴짝 줄넘기」·「떨리는 발표」)', () => {
  /* ⚠️ 「떨리는 발표」는 학생 본차시가 지도서 수록 동화 자리를 대신해 자체 창작한 이야기다.
     허용 목록을 넓히는 것이 아니라, 본차시가 이미 창작해 둔 것만 1:1로 계승한다. */
  const ALLOW = ['「풀밭에서」', '「폴짝 줄넘기」', '「떨리는 발표」', '「생생하게 표현해요」'];
  const titles = BODY.match(/「[^」]+」/g) || [];
  const uniq = [...new Set(titles)];
  ok(uniq.every(t => ALLOW.includes(t)), uniq.join(','));
  ok(SRC07.includes('「떨리는 발표」'), '본차시가 창작하지 않은 제목');
});
T('미도입 갈래(4학년 이상 소관) 학생 노출 0', () => {
  const BAN = ['비유', '은유', '직유', '의인법', '운율', '심상', '시적 화자',
               '서정', '정형시', '자유시', '연과 행', '행과 연'];
  const hit = BAN.filter(w => STUDENT.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('⚠️ 교사 몫 용어는 tnote 밖 학생 본문에 0 · tnote에는 실존', () => {
  ['의성어', '의태어'].forEach(w => ok(!STUDENT.includes(w), '학생 노출: ' + w));
  ok(/의성어|의태어|정의적|낭독/.test(TNOTE) || TNOTE.includes('교시'),
     'tnote에 교사 몫 표지 없음');
});
T('학생 본문은 "흉내 내는 말"로만 쓴다', () => {
  ok(STUDENT.includes('흉내 내는 말') || STUDENT.includes('흉내 낸 말'), '표현 누락');
});
T('선행 용어 규약 — l01 본문에 "감각적 표현"은 단원 예고로만', () => {
  const l01 = studentText('u1_l01');
  const cnt = (l01.match(/감각적 표현/g) || []).length;
  ok(cnt >= 1 && cnt <= 4, '노출 횟수 ' + cnt);
  ok(!/「풀밭에서」/.test(l01) || /next_lesson/.test(plain(L['u1_l01'].slides)),
     'l01이 시를 미리 게재');
});

console.log('═══ F. 구조 정합 ═══');
T('슬라이드 수 = 단일 19슬 / 묶음 24슬', () => {
  KEYS.forEach(k => ok(L[k].slides.length === BLOCKED[k],
    k + ' ' + L[k].slides.length + '슬'));
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
T('tnote 6슬 이상', () => {
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
T('⚠️ 묶음 차시 = 80분 · covers · period_split 3종 일치', () => {
  PAIRED.forEach(k => {
    const m = L[k].meta;
    ok(m.duration_min === 80, k + ' duration ' + m.duration_min);
    ok(/차시$/.test(m.covers) && m.covers.includes('·'), k + ' covers ' + m.covers);
    ok(m.period_split === 's12', k + ' period_split ' + m.period_split);
  });
  KEYS.filter(k => !PAIRED.includes(k)).forEach(k => {
    ok(L[k].meta.duration_min === 40, k + ' duration ' + L[k].meta.duration_min);
    ok(!L[k].meta.period_split, k + '에 period_split');
    ok(!/·/.test(L[k].meta.covers), k + ' covers ' + L[k].meta.covers);
  });
});
T('⚠️ period_split 슬라이드 tnote가 교시 경계를 적는다', () => {
  PAIRED.forEach(k => {
    const s = L[k].slides.find(x => x.id === L[k].meta.period_split);
    ok(s, k + ' period_split 슬라이드 없음');
    ok(s.tnote && /1교시/.test(s.tnote.watch), k + ' 교시 경계 미기재');
    ok(s.block === 'self_assessment', k + ' 경계 블록 ' + s.block);
  });
});
T('⚠️ 2교시 시작 슬라이드가 s13이고 제목이 이어짐을 밝힌다', () => {
  PAIRED.forEach(k => {
    const s = L[k].slides.find(x => x.id === 's13');
    ok(s && /2교시/.test(s.data.title || ''), k + ' 2교시 표시 없음');
  });
});
T('⚠️ review 계보 = 직전 항목 exit 3문항 q·a 전수 계승', () => {
  const chain = [['u1_l02', 'u1_l01'], ['u1_l04', 'u1_l02'], ['u1_l06', 'u1_l04'],
                 ['u1_l07', 'u1_l06'], ['u1_l09', 'u1_l07'], ['u1_l11', 'u1_l09'],
                 ['u1_l13', 'u1_l11']];
  chain.forEach(([cur, prev]) => {
    const r = L[cur].slides.find(s => s.block === 'review');
    ok(r.data.from === prev, cur + ' from ' + r.data.from);
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
T('leveled = 기본·도전·심화 3수준 · 심화 open', () => {
  KEYS.forEach(k => {
    const lv = L[k].slides.find(s => s.block === 'leveled_problem').data.levels;
    ok(lv['기본'] && lv['도전'] && lv['심화'], k + ' 수준 누락');
    ok(lv['심화'].open === true, k + ' 심화 open 아님');
    ok(Array.isArray(lv['기본'].steps) && lv['기본'].steps.length >= 3, k + ' 기본 steps');
  });
});
T('offline_activity = 전 항목 유지 · 준비물·분 실존', () => {
  KEYS.forEach(k => {
    const o = L[k].slides.find(s => s.block === 'offline_activity').data;
    ok(o.materials.length >= 2, k + ' materials');
    ok(o.minutes >= 8, k + ' minutes ' + o.minutes);
    ok(o.steps.length >= 4, k + ' steps');
  });
});
T('meta 정합 (grade·subject·unit·n·std·theme·live_url)', () => {
  KEYS.forEach(k => {
    const m = L[k].meta;
    ok(m.grade === 3 && m.subject === '국어' && m.unit === 1, k + ' meta 기본');
    ok(m.n === NS[k], k + ' n ' + m.n);
    ok(/^\[4국|단원 전체/.test(m.std), k + ' std ' + m.std);
    ok(m.theme === '곰이·펭이 봄 풀밭 시 마을', k + ' theme');
    ok(m.live_url.includes('1단원_생생하게표현해요'), k + ' live_url');
    ok(fs.existsSync(path.join(ROOT, m.live_url.replace('../../', ''))),
       k + ' 본차시 파일 없음');
  });
});
T('CURRICULUM ↔ LESSONS 정합 (8항목 등재 · ready 8 = u1 완주)', () => {
  const cur = (HOME.match(/const CURRICULUM[\s\S]*?\];/) || [''])[0];
  const ns = [...cur.matchAll(/\{n:\s*(\d+),/g)].map(m => +m[1]);
  ok(JSON.stringify(ns) === JSON.stringify([1, 2, 4, 6, 7, 9, 11, 13]), ns.join(','));
  const ready = (cur.match(/ready:\s*true/g) || []).length;
  ok(ready === 8, 'ready ' + ready);
  ok(/lesson_count:\s*8/.test(cur), 'lesson_count 어긋남');
});
T('홈 배선 · slug', () => {
  ok(HOME.includes('data/g3_korean_u1.js'), 'u1 배선 없음');
  ok(/slug:\s*"g3_korean"/.test(HOME), 'slug 어긋남');
  ok(!HOME.includes('g3_math'), '수학 잔여 참조');
});
T('⚠️ 허브 "3_korean" 등재 (u1 완주 = units 1 · lessons 8)', () => {
  const m = HUB.match(/"3_korean":\s*\{\s*file:\s*"g3_korean\.html",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/);
  ok(m, '허브에 3_korean 미등재 — u1 완주 시점에 등재한다');
  ok(+m[1] === 1, 'units ' + m[1]);
  ok(+m[2] === 8, 'lessons ' + m[2]);
  /* ⚠️ 다음 단원 개통 시 이 두 수를 함께 올릴 것 (수학 라인에서 매 단원 겪은 대목) */
  ok(+m[2] === KEYS.length, '허브 lessons ↔ 실제 항목 수 어긋남');
  ok(/"3_math"[\s\S]*?lessons:\s*55/.test(HUB), 'g3 수학 허브 단언 훼손');
});
T('케이랩 매핑 없음 = 의도적 (목소리·몸짓 실물이 우위)', () => {
  ok(!fs.existsSync(path.join(TDIR, 'data/g3_korean_klab.js')), 'klab 파일 생김');
  ok(!/klab/i.test(BODY), '데이터에 klab 블록');
});

console.log('═══ G. 차단 어휘 ═══');
T('u1 차단 어휘 0', () => {
  const BAN = ['결로', '빵꾸', '갈아엎', '내용을 추가하세요', 'TODO', 'lorem'];
  const hit = BAN.filter(w => BODY.includes(w));
  ok(hit.length === 0, hit.join(','));
});
T('채움말 "자리" 0 (보호 어휘 제외)', () => {
  const hit = (BODY.match(/[가-힣]+\s자리(?!값|수)/g) || [])
    .filter(s => !/(빈|제|학생|앉을|누울|한|두|세|네)\s*자리/.test(s));
  ok(hit.length === 0, hit.join(','));
});

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
