/* augment_g1_math_u2.js — L3 증보(g1 수학 2단원 「여러 가지 모양」).
   방식(준호 확정, u1 계승): g1 고밀도 라인 → 부족 4요소만 삽입 = ①review items ⑤leveled ⑥exit ⑦tnote.
     ④offline은 기존 유지(미삽입) · ②img는 폴백 필드만.
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + 필드 추가만.
   ★학생 노출 자리 수학용어(직육면체·원기둥·구) 금지 — 일상용어(상자/기둥/공 모양)만.
   서사(③): 교실 → 학교 → 상자 속 → 놀이터 → 짝 → 분류 → 만들기, 모양 탐정 흐름으로 원본 서사 이어감.
   근거 고정(§3, 원본 정답 계승): 상자 모양=평평한 면·뾰족한 곳·안 굴러감·쌓기 좋음 /
     기둥 모양=위아래 동그람·옆 매끈·세우면 쌓임·눕히면 굴러감 / 공 모양=어디서 봐도 동그람·잘 굴러감·쌓기 어려움.
   각 차시 증보 데이터 정의 → 삽입 → 모양 정합 검산 → 파일 재출력. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u2.js');

global.window = {};
require('./g1_math_u2.js');
const L = window.LESSONS;

/* 차시별 증보 스펙. review: 전시학습 문항(from=이전차시). leveled: 기본·도전·심화.
   exit: 확인3+신호등. tnote: 슬라이드 id별(concept/motivate). offline 미삽입(기존 유지). */
const AUG = {
  u2_l01: {
    img: 'assets/photo/math/shape_classroom.jpg',
    review: null, from: null,   // 단원 첫 차시
    leveled: { title: '모양 찾기 첫걸음', levels: {
      기본: { q: '어디서 봐도 동그랗고 잘 굴러가는 모양은?', a: '공 모양', steps: ['잘 굴러감 = 공 모양'] },
      도전: { q: '평평한 면이 있고 뾰족한 곳이 있는 모양은?', a: '상자 모양', steps: ['평평·뾰족 = 상자 모양'] },
      심화: { q: '교실에서 상자·기둥·공 모양 물건을 하나씩 찾아 말해 봐요.', a: '여러 답 (예: 필통·통조림·공)', open: true } } },
    exit: { items: [ { q: '잘 굴러가는 모양은?', a: '공 모양' }, { q: '쌓기 좋은 모양은?', a: '상자 모양' }, { q: '두루마리 휴지는 어떤 모양?', a: '기둥 모양' } ],
      self: ['세 가지 모양을 구별할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['물건마다 모양이 왜 다를까?'], watch: '세 모양 이름·느낌 익히기', min: 3 } }
  },
  u2_l02: {
    img: 'assets/photo/math/shape_school.jpg',
    review: [ { q: '잘 굴러가는 모양은?', a: '공 모양' }, { q: '쌓기 좋은 모양은?', a: '상자 모양' } ], from: 'u2_l01',
    leveled: { title: '학교 안 모양 찾기', levels: {
      기본: { q: '통조림 캔은 어떤 모양일까요?', a: '기둥 모양', steps: ['위아래 동그람·옆 매끈'] },
      도전: { q: '주사위는 어떤 모양일까요?', a: '상자 모양', steps: ['평평한 면·뾰족한 곳'] },
      심화: { q: '학교에서 기둥 모양 물건을 두 개 찾아 말해 봐요.', a: '여러 답 (예: 두루마리 휴지·컵)', open: true } } },
    exit: { items: [ { q: '두루마리 휴지는 어떤 모양?', a: '기둥 모양' }, { q: '공은 어떤 모양?', a: '공 모양' }, { q: '책은 어떤 모양?', a: '상자 모양' } ],
      self: ['학교에서 세 모양을 찾을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s07: { ask: ['같은 모양끼리 무엇이 닮았을까?'], watch: '모양별 공통 느낌 모으기', min: 3 } }
  },
  u2_l03: {
    img: 'assets/photo/math/shape_touch.jpg',
    review: [ { q: '두루마리 휴지는 어떤 모양?', a: '기둥 모양' }, { q: '주사위는 어떤 모양?', a: '상자 모양' } ], from: 'u2_l02',
    leveled: { title: '모양 탐정 — 만져서 알기', levels: {
      기본: { q: '뾰족한 곳이 있고 안 굴러가는 모양은?', a: '상자 모양', steps: ['뾰족·평평·안 굴러감'] },
      도전: { q: '어디를 만져도 둥글고 잘 굴러가는 모양은?', a: '공 모양', steps: ['어디서 봐도 동그람·잘 굴러감'] },
      심화: { q: '눈을 감고 물건을 만져 모양을 알아맞히는 방법을 말해 봐요.', a: '여러 답 (뾰족·평평·둥금으로 판단)', open: true } } },
    exit: { items: [ { q: '안 굴러가고 평평한 면이 있는 모양은?', a: '상자 모양' }, { q: '잘 굴러가는 모양은?', a: '공 모양' }, { q: '세우면 쌓이고 눕히면 굴러가는 모양은?', a: '기둥 모양' } ],
      self: ['만져서 모양을 알 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['만져 보면 모양의 무엇을 알 수 있을까?'], watch: '뾰족·평평·둥금 손끝 감각', min: 3 } }
  },
  u2_l04: {
    img: 'assets/photo/math/shape_playground.jpg',
    review: [ { q: '뾰족하고 안 굴러가는 모양은?', a: '상자 모양' }, { q: '잘 굴러가는 모양은?', a: '공 모양' } ], from: 'u2_l03',
    leveled: { title: '놀이터 모양 찾기', levels: {
      기본: { q: '축구공은 어떤 모양일까요?', a: '공 모양', steps: ['어디서 봐도 동그람'] },
      도전: { q: '미끄럼틀을 받치는 둥근 기둥은 어떤 모양일까요?', a: '기둥 모양', steps: ['위아래 동그람·옆 매끈'] },
      심화: { q: '놀이터에서 상자·기둥·공 모양을 하나씩 찾아 말해 봐요.', a: '여러 답 (예: 그네 좌석·기둥·공)', open: true } } },
    exit: { items: [ { q: '축구공은 어떤 모양?', a: '공 모양' }, { q: '그네 좌석 판은 어떤 모양?', a: '상자 모양' }, { q: '잘 굴러가는 모양은?', a: '공 모양' } ],
      self: ['놀이터에서 모양을 찾을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s05: { ask: ['같은 놀이터에도 여러 모양이 숨어 있을까?'], watch: '주변에서 모양 눈으로 찾기', min: 3 } }
  },
  u2_l05: {
    img: 'assets/photo/math/shape_pair.jpg',
    review: [ { q: '축구공은 어떤 모양?', a: '공 모양' }, { q: '그네 좌석 판은 어떤 모양?', a: '상자 모양' } ], from: 'u2_l04',
    leveled: { title: '같은 모양 짝 찾기', levels: {
      기본: { q: '딱풀과 같은 모양은? (두루마리 휴지 · 주사위)', a: '두루마리 휴지', steps: ['둘 다 기둥 모양'] },
      도전: { q: '농구공과 같은 모양의 물건은? (구슬 · 필통)', a: '구슬', steps: ['둘 다 공 모양'] },
      심화: { q: '내 필통과 같은 모양의 물건을 찾아 짝지어 봐요.', a: '여러 답 (상자 모양끼리)', open: true } } },
    exit: { items: [ { q: '딱풀과 두루마리 휴지는 같은 모양일까요?', a: '예 (둘 다 기둥 모양)' }, { q: '도시락과 농구공은 같은 모양일까요?', a: '아니요 (상자 · 공)' }, { q: '같은 모양끼리 짝지으려면 무엇을 봐요?', a: '굴러가는지 · 평평한 면' } ],
      self: ['같은 모양끼리 짝지을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['두 물건이 같은 모양인지 어떻게 알까?'], watch: '특징 비교로 짝 판단', min: 3 } }
  },
  u2_l06: {
    img: 'assets/photo/math/shape_sort.jpg',
    review: [ { q: '딱풀과 두루마리 휴지는 같은 모양일까요?', a: '예 (기둥 모양)' }, { q: '농구공과 같은 모양은?', a: '구슬 (공 모양)' } ], from: 'u2_l05',
    leveled: { title: '모양끼리 모으기', levels: {
      기본: { q: '통조림 캔과 컵은 어느 모양끼리 모을까요?', a: '기둥 모양', steps: ['둘 다 기둥 모양'] },
      도전: { q: '수박과 구슬은 어느 모양끼리 모을까요?', a: '공 모양', steps: ['둘 다 공 모양'] },
      심화: { q: '책상 위 물건을 세 모양으로 나눠 담는 방법을 말해 봐요.', a: '여러 답 (상자·기둥·공으로 분류)', open: true } } },
    exit: { items: [ { q: '수박은 어느 모양끼리 모을까요?', a: '공 모양' }, { q: '통조림 캔은 어느 모양끼리?', a: '기둥 모양' }, { q: '필통은 어느 모양끼리?', a: '상자 모양' } ],
      self: ['모양끼리 모을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['물건을 어떤 기준으로 나누면 좋을까?'], watch: '분류 기준 = 모양', min: 3 } }
  },
  u2_l07: {
    img: 'assets/photo/math/shape_make.jpg',
    review: [ { q: '수박은 어느 모양끼리 모을까요?', a: '공 모양' }, { q: '통조림 캔은 어느 모양끼리?', a: '기둥 모양' } ], from: 'u2_l06',
    leveled: { title: '모양으로 만들기', levels: {
      기본: { q: '책상 다리로 알맞은 모양은?', a: '기둥 모양', steps: ['세우면 안정적'] },
      도전: { q: '탑을 높이 쌓기 좋은 모양은?', a: '상자 모양', steps: ['평평한 면·안 굴러감'] },
      심화: { q: '상자 모양과 기둥 모양으로 무엇을 만들 수 있을지 말해 봐요.', a: '여러 답 (예: 책상·자동차)', open: true } } },
    exit: { items: [ { q: '책상 다리로 알맞은 모양은?', a: '기둥 모양' }, { q: '탑을 높이 쌓기 좋은 모양은?', a: '상자 모양' }, { q: '공 모양은 쌓기 쉬울까요, 어려울까요?', a: '어려워요 (잘 굴러가요)' } ],
      self: ['모양으로 물건을 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['어떤 모양이 어디에 쓰기 좋을까?'], watch: '모양 특징 ↔ 쓰임 연결', min: 3 } }
  }
};

function findIdx(slides, pred) { return slides.findIndex(pred); }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];
  const by = id => S.find(s => s.id === id);

  // ① review items (기존 review 슬라이드에 필드 추가 — title/content 보존)
  if (spec.review) {
    const rv = S.find(s => s.block === 'review');
    if (rv) { rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from; }
  }
  // ② img (motivate에 폴백 필드)
  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }
  // ⑦ tnote (지정 슬라이드)
  if (spec.tnote) Object.keys(spec.tnote).forEach(sid => { const s = by(sid); if (s) s.tnote = spec.tnote[sid]; });

  // ⑤ leveled_problem 삽입 — 마지막 basic_problem 다음(없으면 summary 앞)
  if (spec.leveled) {
    const s_lv = { id: 's-lv', stage: '기본문제', block: 'leveled_problem', data: spec.leveled,
      suggested_extras: ['q_apply'] };
    let i = -1; for (let j = S.length - 1; j >= 0; j--) if (S[j].block === 'basic_problem') { i = j; break; }
    if (i < 0) i = findIdx(S, s => s.block === 'summary') - 1;
    S.splice(i + 1, 0, s_lv);
  }
  // ⑥ exit_ticket 삽입 — summary 앞
  if (spec.exit) {
    const s_ex = { id: 's-ex', stage: '정리', block: 'exit_ticket',
      data: { title: '오늘 확인해요', items: spec.exit.items, self: spec.exit.self },
      suggested_extras: ['q_reflect'] };
    let i = findIdx(S, s => s.block === 'summary');
    if (i < 0) i = S.length;
    S.splice(i, 0, s_ex);
  }

  // 삽입 슬라이드 id 유니크 재부여 (s100~ 기존 뒤로)
  let n = 100;
  S.forEach(s => { if (['s-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });

  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(4요소)';
});

// ── 모양 정합 검산 (원본 정답 계승 · 학생 노출 정답 무모순) ──
// 개념 카드: 상자=안 굴러감/평평/뾰족·쌓기좋음 / 기둥=위아래동그람/옆매끈/세우면쌓임·눕히면굴러감 / 공=어디서봐도동그람/잘굴러감/쌓기어려움
const SHAPE = {
  '상자 모양': { roll: false, stack: true, round: false },
  '기둥 모양': { roll: true,  stack: true, round: true  },   // 눕히면 굴러가고 세우면 쌓임
  '공 모양':   { roll: true,  stack: false, round: true  }
};
// 원본·증보 정답 사실 어서션
const FACTS = [
  ['통조림 캔', '기둥 모양'], ['주사위', '상자 모양'], ['두루마리 휴지', '기둥 모양'],
  ['축구공', '공 모양'], ['그네 좌석 판', '상자 모양'], ['수박', '공 모양'],
  ['구슬', '공 모양'], ['필통', '상자 모양'], ['딱풀', '기둥 모양'], ['도시락', '상자 모양']
];
const bad = [];
// (1) 모든 leveled/exit 정답에 등장한 모양명이 SHAPE 3종 안에 있는지
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  const lv = S.find(s => s.block === 'leveled_problem');
  const ex = S.find(s => s.block === 'exit_ticket');
  const answers = [];
  if (lv) Object.values(lv.data.levels).forEach(v => answers.push(v.a));
  if (ex) ex.data.items.forEach(it => answers.push(it.a));
  answers.forEach(a => {
    ['상자 모양', '기둥 모양', '공 모양'].forEach(nm => {
      if (a.includes(nm) && !SHAPE[nm]) bad.push(key + ':미정의모양 ' + nm);
    });
  });
});
// (2) 핵심 사실: 잘 굴러가는=공/기둥(눕힘), 안 굴러가고 쌓기좋음=상자
if (SHAPE['공 모양'].roll !== true) bad.push('공=굴러감 위반');
if (SHAPE['상자 모양'].roll !== false) bad.push('상자=안굴러감 위반');
if (SHAPE['상자 모양'].stack !== true) bad.push('상자=쌓기좋음 위반');
if (SHAPE['공 모양'].stack !== false) bad.push('공=쌓기어려움 위반');
// (3) 사실 테이블 자기무결성(중복·상충 없음)
const seen = {};
FACTS.forEach(([obj, sh]) => {
  if (!SHAPE[sh]) bad.push('사실 미정의: ' + obj);
  if (seen[obj] && seen[obj] !== sh) bad.push('사실 상충: ' + obj);
  seen[obj] = sh;
});
if (bad.length) { console.error('모양 정합 오류:', bad); process.exit(1); }

// ── 4요소 검증 ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides, b = S.map(s => s.block);
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.leveled && !b.includes('leveled_problem')) elemFail.push(key + ':leveled');
  if (spec.exit && !b.includes('exit_ticket')) elemFail.push(key + ':exit');
  const tn = S.filter(s => s.tnote).length;
  if (tn < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

// ── 학생 노출 자리 수학용어 금지 검사 (직육면체·원기둥·구) ──
const banned = ['직육면체', '원기둥'];
const termFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  ['leveled_problem', 'exit_ticket', 'review'].forEach(blk => {
    const s = S.find(x => x.block === blk);
    if (!s) return;
    const txt = JSON.stringify(s.data);
    banned.forEach(t => { if (txt.includes(t)) termFail.push(key + ':' + blk + ':' + t); });
  });
});
if (termFail.length) { console.error('금지 수학용어 노출:', termFail); process.exit(1); }

console.log('✅ g1 수학 u2 증보 완료 (7차시 · 4요소)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 (전 차시 블록 교체 · window.LESSONS 패턴 보존) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
const footer = '})();\n';
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + footer, 'utf8');
console.log('  파일 재출력 완료');
