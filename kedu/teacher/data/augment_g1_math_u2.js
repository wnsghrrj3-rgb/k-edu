/* augment_g1_math_u2.js — L3 증보(g1 수학 2단원 「여러 가지 모양」).
   방식(준호 확정): g1 부족 4요소만 삽입 = ①review items ⑤leveled ⑥exit ⑦tnote. ④offline 미삽입·②img 폴백.
   ⚠️ 단원 제약: 학생 노출 자리(leveled·exit·review)에 수학용어(직육면체·원기둥·정육면체) 금지 →
     일상용어(상자 모양·기둥 모양·공 모양)로만. 교사 tnote는 수학용어 OK.
   서사(③): 곰이·펭이의 모양 탐험 — 세 모양을 찾고·굴리고·쌓고·만드는 흐름.
   근거 고정(§3): 상자 모양=평평한 면·뾰족한 곳·잘 쌓임 / 기둥 모양=눕히면 굴러·세우면 쌓임 / 공 모양=어느 쪽으로도 굴러. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u2.js');

global.window = {};
require('./g1_math_u2.js');
const L = window.LESSONS;

const AUG = {
  u2_l01: {
    img: 'assets/photo/math/shapes_three.jpg',
    review: null, from: null,
    leveled: { title: '곰이의 모양 찾기', levels: {
      기본: { q: '어느 쪽으로도 잘 굴러가는 모양은?', a: '공 모양', steps: ['둥근 겉면'] },
      도전: { q: '평평한 면과 뾰족한 곳이 있어 잘 쌓이는 모양은?', a: '상자 모양', steps: ['평평한 면 세기'] },
      심화: { q: '교실에서 상자 모양·기둥 모양·공 모양을 하나씩 찾아 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '어느 쪽으로도 잘 굴러가는 모양은?', a: '공 모양' }, { q: '평평한 면과 뾰족한 곳이 있는 모양은?', a: '상자 모양' }, { q: '세워도 눕혀도 쓰는 모양은?', a: '기둥 모양' } ],
      self: ['세 모양을 구분할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['우리 주변엔 어떤 모양이 숨어 있을까?'], watch: '상자(직육면체)·기둥(원기둥)·공(구)을 일상용어로 안내', min: 3 } }
  },
  u2_l02: {
    img: 'assets/photo/math/shapes_gather.jpg',
    review: [ { q: '어느 쪽으로도 잘 굴러가는 모양은?', a: '공 모양' }, { q: '평평한 면이 많아 잘 쌓이는 모양은?', a: '상자 모양' } ], from: 'u2_l01',
    leveled: { title: '펭이의 모양 모으기', levels: {
      기본: { q: '축구공은 어떤 모양일까요?', a: '공 모양', steps: ['둥글어 굴러감'] },
      도전: { q: '음료수 캔은 어떤 모양일까요?', a: '기둥 모양', steps: ['눕히면 굴러·세우면 쌓임'] },
      심화: { q: '교실 물건을 세 모양으로 나눠 담아 봐요.', a: '여러 답 (생김새로 분류)', open: true } } },
    exit: { items: [ { q: '주사위는 어떤 모양?', a: '상자 모양' }, { q: '구슬은 어떤 모양?', a: '공 모양' }, { q: '같은 모양끼리 모으려면?', a: '생김새를 비교해요' } ],
      self: ['같은 모양끼리 모을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s07: { ask: ['왜 이 물건들을 같은 자리에 모았을까?'], watch: '분류 기준=모양(생김새)', min: 3 } }
  },
  u2_l03: {
    img: 'assets/photo/math/shapes_touch.jpg',
    review: [ { q: '축구공은 어떤 모양?', a: '공 모양' }, { q: '음료수 캔은 어떤 모양?', a: '기둥 모양' } ], from: 'u2_l02',
    leveled: { title: '곰이의 모양 특징', levels: {
      기본: { q: '어느 쪽으로도 잘 굴러가는 모양은?', a: '공 모양', steps: ['둥근 겉면'] },
      도전: { q: '눕히면 굴러가고 세우면 쌓이는 모양은?', a: '기둥 모양', steps: ['위·아래 평평'] },
      심화: { q: '상자 모양이 잘 쌓이는 까닭을 말해 봐요.', a: '평평한 면이 있어서', open: true } } },
    exit: { items: [ { q: '잘 쌓이는 모양은?', a: '상자 모양' }, { q: '잘 안 쌓이고 잘 굴러가는 모양은?', a: '공 모양' }, { q: '기둥 모양은 어떻게 하면 쌓이나요?', a: '세우면 쌓여요' } ],
      self: ['세 모양의 특징을 말할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['만져 보고 굴려 보면 무엇이 다를까?'], watch: '굴림·쌓임으로 특징 구분', min: 3 } }
  },
  u2_l04: {
    img: 'assets/photo/math/shapes_build.jpg',
    review: [ { q: '잘 쌓이는 모양은?', a: '상자 모양' }, { q: '잘 굴러가는 모양은?', a: '공 모양' } ], from: 'u2_l03',
    leveled: { title: '펭이의 놀이터 만들기', levels: {
      기본: { q: '시소 받침대로 알맞은 모양은?', a: '기둥 모양', steps: ['세우면 단단'] },
      도전: { q: '높이 쌓는 탑에 알맞은 모양은?', a: '상자 모양', steps: ['평평해 잘 쌓임'] },
      심화: { q: '놀이터에서 공 모양을 어디에 쓸지 말해 봐요.', a: '여러 답 (굴리는 놀이 등)', open: true } } },
    exit: { items: [ { q: '굴려서 노는 데 좋은 모양은?', a: '공 모양' }, { q: '탑을 쌓을 때 좋은 모양은?', a: '상자 모양' }, { q: '받침으로 쓰기 좋은 모양은?', a: '기둥 모양' } ],
      self: ['모양을 골라 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s05: { ask: ['왜 시소 받침대는 기둥 모양일까?'], watch: '모양 특징↔쓰임 연결', min: 3 } }
  },
  u2_l05: {
    img: 'assets/photo/math/shapes_memory.jpg',
    review: [ { q: '탑 쌓기에 좋은 모양은?', a: '상자 모양' }, { q: '시소 받침에 좋은 모양은?', a: '기둥 모양' } ], from: 'u2_l04',
    leveled: { title: '곰이의 짝 맞추기', levels: {
      기본: { q: '뒤집어 같은 것을 찾는 놀이에서 짝은 무엇이 같아야 할까요?', a: '모양', steps: ['생김새 비교'] },
      도전: { q: '상자 모양 카드의 짝으로 알맞은 것은?', a: '상자 모양 카드', steps: ['같은 모양끼리'] },
      심화: { q: '세 모양으로 짝 맞추기 규칙을 만들어 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '짝을 맞추려면 무엇이 같아야?', a: '모양' }, { q: '공 모양 카드의 짝은?', a: '공 모양 카드' }, { q: '놀이에서 이기려면?', a: '카드 위치를 기억해요' } ],
      self: ['같은 모양의 짝을 찾을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['어떻게 하면 짝을 잘 찾을까?'], watch: '모양 일치로 짝 판단', min: 3 } }
  },
  u2_l06: {
    img: 'assets/photo/math/shapes_check.jpg',
    review: [ { q: '어느 쪽으로도 잘 굴러가는 모양은?', a: '공 모양' }, { q: '잘 쌓이는 모양은?', a: '상자 모양' } ], from: 'u2_l05',
    leveled: { title: '곰이·펭이와 스스로 점검', levels: {
      기본: { q: '야구공은 어떤 모양일까요?', a: '공 모양', steps: ['둥글어 굴러감'] },
      도전: { q: '통나무처럼 눕히면 굴러가는 모양은?', a: '기둥 모양', steps: ['위·아래 평평'] },
      심화: { q: '세 모양의 다른 점을 하나씩 말해 봐요.', a: '여러 답 (굴림·쌓임 차이)', open: true } } },
    exit: { items: [ { q: '상자 모양의 특징 하나는?', a: '평평한 면·잘 쌓임' }, { q: '공 모양의 특징은?', a: '어느 쪽으로도 굴러감' }, { q: '기둥 모양의 특징은?', a: '눕히면 굴러·세우면 쌓임' } ],
      self: ['세 모양을 스스로 점검할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s02: { ask: ['어떤 모양이 아직 헷갈리는지 스스로 찾아볼까?'], watch: '자기점검 — 헷갈리는 모양 표시', min: 3 } }
  },
  u2_l07: {
    img: 'assets/photo/math/shapes_make.jpg',
    review: [ { q: '공 모양의 특징은?', a: '어느 쪽으로도 굴러감' }, { q: '상자 모양의 특징은?', a: '잘 쌓임' } ], from: 'u2_l06',
    leveled: { title: '곰이·펭이의 재활용 만들기', levels: {
      기본: { q: '휴지 심으로 만들기 좋은 모양은?', a: '기둥 모양', steps: ['가운데가 둥근 기둥'] },
      도전: { q: '상자로 책상을 만들면 어떤 모양을 쓴 걸까요?', a: '상자 모양', steps: ['평평한 면 활용'] },
      심화: { q: '재활용품으로 만들 물건과 쓸 모양을 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '하나의 물건에도 여러 모양이 있을까요?', a: '있어요' }, { q: '캔으로 만들기 좋은 모양은?', a: '기둥 모양' }, { q: '공 모양으로 만들 수 있는 것은?', a: '여러 답 (공·구슬 등)' } ],
      self: ['모양을 활용해 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['하나의 물건은 어떤 모양들로 이루어졌을까?'], watch: '물건 속 여러 모양 찾기', min: 3 } }
  }
};

function findIdx(slides, pred) { return slides.findIndex(pred); }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];
  const by = id => S.find(s => s.id === id);

  if (spec.review) {
    const rv = S.find(s => s.block === 'review');
    if (rv) { rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from; }
  }
  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }
  if (spec.tnote) Object.keys(spec.tnote).forEach(sid => { const s = by(sid); if (s) s.tnote = spec.tnote[sid]; });

  if (spec.leveled) {
    const s_lv = { id: 's-lv', stage: '기본문제', block: 'leveled_problem', data: spec.leveled,
      suggested_extras: ['q_apply'] };
    let i = -1; for (let j = S.length - 1; j >= 0; j--) if (S[j].block === 'basic_problem') { i = j; break; }
    if (i < 0) i = findIdx(S, s => s.block === 'summary') - 1;
    S.splice(i + 1, 0, s_lv);
  }
  if (spec.exit) {
    const s_ex = { id: 's-ex', stage: '정리', block: 'exit_ticket',
      data: { title: '오늘 확인해요', items: spec.exit.items, self: spec.exit.self },
      suggested_extras: ['q_reflect'] };
    let i = findIdx(S, s => s.block === 'summary');
    if (i < 0) i = S.length;
    S.splice(i, 0, s_ex);
  }

  let n = 100;
  S.forEach(s => { if (['s-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });
  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(4요소)';
});

// ── 수학용어 금지 자체검증 (학생 노출 자리: leveled·exit·review) ──
const BAN = ['직육면체', '원기둥', '정육면체'];   // '구'는 흔한 글자라 제외
const studentText = [];
Object.keys(AUG).forEach(key => {
  const s = AUG[key];
  const push = o => studentText.push(JSON.stringify(o));
  if (s.review) push(s.review);
  if (s.leveled) push(s.leveled);
  if (s.exit) push(s.exit);
});
const banHit = BAN.filter(w => studentText.join('\n').indexOf(w) >= 0);
if (banHit.length) { console.error('학생 노출 자리 수학용어 위반:', banHit); process.exit(1); }

// ── 4요소 검증 ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides, b = S.map(s => s.block);
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.leveled && !b.includes('leveled_problem')) elemFail.push(key + ':leveled');
  if (spec.exit && !b.includes('exit_ticket')) elemFail.push(key + ':exit');
  if (S.filter(s => s.tnote).length < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

console.log('✅ g1 수학 u2 증보 완료 (7차시 · 4요소 · 일상용어)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 ──
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
