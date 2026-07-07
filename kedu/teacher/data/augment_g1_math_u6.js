/* augment_g1_math_u6.js — L3 증보(g1 수학 6단원 「수학이랑 함께해요」·프로젝트 단원).
   방식(준호 확정): 프로젝트 단원 → leveled 제외, **3요소만** = ①review items ⑥exit(성찰형) ⑦tnote.
     ④offline은 프로젝트 중심 요소라 기존 유지·미삽입 · ②img 폴백.
   서사(③): 수학 보물 탐험 프로젝트 — 찾기→나타내기→전시회 (곰이·펭이 대신 보물·전시 소재).
   ⚠️ 문제풀이(basic/leveled) 없는 단원 — exit는 정답 확인이 아닌 활동 성찰형. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u6.js');

global.window = {};
require('./g1_math_u6.js');
const L = window.LESSONS;

const AUG = {
  u6_l01: {
    img: 'assets/photo/math/treasure_explore.jpg',
    review: null, from: null,   // 프로젝트 도입(첫 차시)
    exit: { items: [ { q: '오늘 찾은 수학 보물을 하나 말해 봐요.', a: '여러 답 (수·모양·규칙 등)' }, { q: '눈에 안 보이는 수학 보물도 있을까요?', a: '있어요 (순서·규칙 등)' }, { q: '다음엔 어디서 더 찾아보고 싶나요?', a: '여러 답' } ],
      self: ['즐겁게 탐험했어요', '조금 아쉬워요', '더 찾아보고 싶어요'] },
    tnote: { s04: { ask: ['수학은 교실 밖 어디에 숨어 있을까?'], watch: '생활 속 수학(수·모양·규칙)을 보물로 연결', min: 3 } }
  },
  u6_l02: {
    img: 'assets/photo/math/treasure_express.jpg',
    review: [ { q: '지난 시간에 찾은 수학 보물은 무엇이었나요?', a: '여러 답 (수·모양·규칙)' }, { q: '수학 보물은 눈에 보이는 것만 있나요?', a: '아니요' } ], from: 'u6_l01',
    exit: { items: [ { q: '수학 보물을 나타내는 방법을 하나 말해 봐요.', a: '여러 답 (그림·몸·만들기)' }, { q: '몸으로 표현하는 방법을 무엇이라고 했나요?', a: '타블로' }, { q: '재료를 아껴 쓰려면 어떻게 하면 좋을까요?', a: '필요한 만큼만 써요' } ],
      self: ['내 방법으로 표현했어요', '조금 아쉬워요', '다르게도 표현해 보고 싶어요'] },
    tnote: { s04: { ask: ['같은 보물도 여러 방법으로 나타낼 수 있을까?'], watch: '그림·몸(타블로)·만들기 등 다양한 표현 존중', min: 3 } }
  },
  u6_l03: {
    img: 'assets/photo/math/treasure_exhibit.jpg',
    review: [ { q: '수학 보물을 나타내는 방법을 하나 말해 봐요.', a: '여러 답 (그림·몸·만들기)' }, { q: '몸으로 표현하는 것을 무엇이라 했나요?', a: '타블로' } ], from: 'u6_l02',
    exit: { items: [ { q: '전시회를 여는 방법을 하나 말해 봐요.', a: '여러 답 (구역별·둘 가고 둘 남기 등)' }, { q: '친구 작품을 볼 때 지킬 예절은?', a: '조심히 보고 칭찬해요' }, { q: '이번 프로젝트에서 가장 기억에 남는 것은?', a: '여러 답' } ],
      self: ['전시회에 즐겁게 참여했어요', '조금 아쉬워요', '또 열어 보고 싶어요'] },
    tnote: { s04: { ask: ['내 보물을 친구에게 어떻게 소개하면 좋을까?'], watch: '전시·관람 예절과 표현 나눔 안내', min: 3 } }
  }
};

function findIdx(slides, pred) { return slides.findIndex(pred); }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];
  const by = id => S.find(s => s.id === id);

  // ① review items
  if (spec.review) {
    const rv = S.find(s => s.block === 'review');
    if (rv) { rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from; }
  }
  // ② img
  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }
  // ⑦ tnote
  if (spec.tnote) Object.keys(spec.tnote).forEach(sid => { const s = by(sid); if (s) s.tnote = spec.tnote[sid]; });

  // ⑥ exit_ticket 삽입 — summary 앞 (leveled 없음: 프로젝트 단원)
  if (spec.exit) {
    const s_ex = { id: 's-ex', stage: '정리', block: 'exit_ticket',
      data: { title: '오늘 돌아봐요', items: spec.exit.items, self: spec.exit.self },
      suggested_extras: ['q_reflect'] };
    let i = findIdx(S, s => s.block === 'summary');
    if (i < 0) i = S.length;
    S.splice(i, 0, s_ex);
  }

  let n = 100;
  S.forEach(s => { if (s.id === 's-ex') s.id = 's' + (n++); });
  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(3요소·프로젝트)';
});

// ── 3요소 검증 (leveled 제외) ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.exit && !S.some(s => s.block === 'exit_ticket')) elemFail.push(key + ':exit');
  if (S.filter(s => s.tnote).length < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

console.log('✅ g1 수학 u6 증보 완료 (3차시 · 3요소 · 프로젝트)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
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
