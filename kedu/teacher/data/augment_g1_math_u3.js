/* augment_g1_math_u3.js — L3 증보(g1 수학 3단원 「덧셈과 뺄셈」).
   방식(준호 확정, u1·u2 계승): g1 고밀도 라인 → 부족 4요소만 삽입 = ①review items ⑤leveled ⑥exit ⑦tnote.
     ④offline은 기존 유지(미삽입) · ②img는 폴백 필드만.
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + 필드 추가만.
   ★학생 노출 자리 수학용어(교환법칙·결합법칙·항등원) 금지 — 일상 표현("순서를 바꿔도 같아요")만.
   서사(③): 곰이·펭이 숲 나들이 — 세기 → 모으기 → 가르기 → 이야기 → +기호 → 이어세기·순서 →
     −기호 → 거꾸로세기·확인 → 0 → 세 수 → 마무리. 원본 자연/덧뺄 맥락 계승(인물 무주입).
   근거 고정(§3, 원본 정답 계승 · 산수 검산): 모든 식 eval 일치 확인.
   각 차시 증보 데이터 정의 → 삽입 → 산수 정합 검산 → 파일 재출력(IIFE 경계 보존). */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u3.js');

global.window = { LESSONS: {} };
require('./g1_math_u3.js');
const L = window.LESSONS;

/* 차시별 증보 스펙. review: 전시학습 문항(from=이전차시). leveled: 기본·도전·심화.
   exit: 확인3+신호등. tnote: 슬라이드 id별. offline 미삽입(기존 유지). */
const AUG = {
  u3_l01: {
    img: 'assets/photo/math/nature_intro.jpg',
    review: null, from: null,   // 단원 첫 차시
    leveled: { title: '자연 속 수 세기', levels: {
      기본: { q: '무당벌레가 5마리 있어요. 몇 마리인지 세어 볼까요?', a: '5마리', steps: ['하나씩 짚으며 세기 → 5'] },
      도전: { q: '꽃 5송이와 사과 4개 중 어느 것이 더 많을까요?', a: '꽃 (5가 4보다 큼)', steps: ['5와 4 비교 → 5가 큼'] },
      심화: { q: '숲에서 본 것을 수로 세어 친구에게 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '무당벌레 5마리는 몇 마리?', a: '5마리' }, { q: '사과 4개와 꽃 5송이 중 많은 것은?', a: '꽃' }, { q: '수를 셀 때 어떻게 세면 좋을까요?', a: '하나씩 빠짐없이' } ],
      self: ['자연 속 수를 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['숲에서 무엇을 세어 볼 수 있을까?'], watch: '하나씩 빠짐없이 세기', min: 3 } }
  },
  u3_l02: {
    img: 'assets/photo/math/nature_gather.jpg',
    review: [ { q: '무당벌레 5마리는 몇 마리?', a: '5마리' }, { q: '사과 4개와 꽃 5송이 중 많은 것은?', a: '꽃' } ], from: 'u3_l01',
    leveled: { title: '모으면 몇 개', levels: {
      기본: { q: '도토리 2개와 3개를 모으면 모두 몇 개?', a: '5개', steps: ['2와 3을 모으기 → 5'] },
      도전: { q: '솔방울 4개와 3개를 모으면 모두 몇 개?', a: '7개', steps: ['4와 3을 모으기 → 7'] },
      심화: { q: '7이 되도록 두 묶음으로 모으는 방법을 말해 봐요.', a: '여러 답 (예: 4와 3, 5와 2)', open: true } } },
    exit: { items: [ { q: '2와 3을 모으면?', a: '5' }, { q: '4와 3을 모으면?', a: '7' }, { q: '모으기는 무엇과 비슷할까요?', a: '더하기(합치기)' } ],
      self: ['모으기를 할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['두 묶음을 모으면 수가 어떻게 될까?'], watch: '모으기 = 합쳐 세기', min: 3 } }
  },
  u3_l03: {
    img: 'assets/photo/math/nature_split.jpg',
    review: [ { q: '2와 3을 모으면?', a: '5' }, { q: '4와 3을 모으면?', a: '7' } ], from: 'u3_l02',
    leveled: { title: '가르면 몇 개', levels: {
      기본: { q: '도토리 7개를 3개와 몇 개로 가를까요?', a: '4개', steps: ['7을 3과 □ → 4'] },
      도전: { q: '솔방울 8개를 6개와 몇 개로 가를까요?', a: '2개', steps: ['8을 6과 □ → 2'] },
      심화: { q: '8을 두 묶음으로 가르는 방법을 여러 가지 말해 봐요.', a: '여러 답 (예: 6과 2, 5와 3)', open: true } } },
    exit: { items: [ { q: '7을 3과 몇으로 가를까요?', a: '4' }, { q: '8을 6과 몇으로 가를까요?', a: '2' }, { q: '가르기는 무엇과 비슷할까요?', a: '빼기(덜어내기)' } ],
      self: ['가르기를 할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['한 묶음을 둘로 가르면?'], watch: '가르기 = 나눠 세기', min: 3 } }
  },
  u3_l04: {
    img: 'assets/photo/math/nature_story.jpg',
    review: [ { q: '7을 3과 몇으로 가를까요?', a: '4' }, { q: '8을 6과 몇으로 가를까요?', a: '2' } ], from: 'u3_l03',
    leveled: { title: '그림으로 이야기 만들기', levels: {
      기본: { q: '다람쥐 5마리가 있고 3마리가 더 왔어요. 모두 몇 마리?', a: '8마리', steps: ['5와 3을 모으기 → 8'] },
      도전: { q: '연못에 물고기가 7마리 헤엄쳐요. 이야기를 수로 말하면?', a: '7마리', steps: ['그림 속 수 = 7'] },
      심화: { q: '그림을 보고 모으기 이야기를 만들어 식으로 말해 봐요.', a: '여러 답 (예: 5와 3 → 8)', open: true } } },
    exit: { items: [ { q: '5마리와 3마리가 모이면?', a: '8마리' }, { q: '물고기 7마리는 몇 마리?', a: '7마리' }, { q: '그림 이야기는 무엇으로 나타낼 수 있을까요?', a: '모으기(더하기)' } ],
      self: ['그림으로 이야기를 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['그림 속 이야기를 수로 어떻게 말할까?'], watch: '그림 → 수 이야기 옮기기', min: 3 } }
  },
  u3_l05: {
    img: 'assets/photo/math/nature_plus.jpg',
    review: [ { q: '5마리와 3마리가 모이면?', a: '8마리' }, { q: '물고기 7마리는 몇 마리?', a: '7마리' } ], from: 'u3_l04',
    leveled: { title: '＋와 ＝로 나타내기', levels: {
      기본: { q: '4 더하기 2는 얼마일까요? (4＋2)', a: '6', steps: ['4＋2 = 6'] },
      도전: { q: '5 더하기 3을 식으로 쓰고 답을 구해요. (5＋3)', a: '8', steps: ['5＋3 = 8'] },
      심화: { q: '6＋2가 되는 이야기를 하나 만들어 봐요.', a: '여러 답 (합 8)', open: true } } },
    exit: { items: [ { q: '4＋2는?', a: '6' }, { q: '5＋3은?', a: '8' }, { q: '＋ 기호는 무엇을 뜻할까요?', a: '더하기(모으기)' } ],
      self: ['덧셈식을 읽고 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['＋와 ＝ 기호는 무엇을 나타낼까?'], watch: '기호로 덧셈식 읽고 쓰기', min: 3 } }
  },
  u3_l06_07: {
    img: 'assets/photo/math/nature_addup.jpg',
    review: [ { q: '4＋2는?', a: '6' }, { q: '5＋3은?', a: '8' } ], from: 'u3_l05',
    leveled: { title: '이어 세어 더하기', levels: {
      기본: { q: '6에서 이어 세어 6＋2를 구해요.', a: '8', steps: ['6 다음 7, 8 → 8'] },
      도전: { q: '2＋5와 5＋2의 답을 비교하면?', a: '둘 다 7 (순서를 바꿔도 같아요)', steps: ['2＋5 = 7', '5＋2 = 7'] },
      심화: { q: '순서를 바꿔도 답이 같은 덧셈을 하나 더 만들어 봐요.', a: '여러 답 (예: 3＋4 = 4＋3)', open: true } } },
    exit: { items: [ { q: '6＋2는?', a: '8' }, { q: '2＋5와 5＋2의 답은?', a: '둘 다 7' }, { q: '더하는 두 수의 순서를 바꾸면 답은?', a: '같아요' } ],
      self: ['이어 세어 더할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['두 수의 순서를 바꾸면 답이 달라질까?'], watch: '이어 세기·순서 바꿔 더하기', min: 3 } }
  },
  u3_l08: {
    img: 'assets/photo/math/nature_minus.jpg',
    review: [ { q: '6＋2는?', a: '8' }, { q: '2＋5와 5＋2의 답은?', a: '둘 다 7' } ], from: 'u3_l06_07',
    leveled: { title: '－로 나타내기', levels: {
      기본: { q: '6 빼기 2는 얼마일까요? (6－2)', a: '4', steps: ['6－2 = 4'] },
      도전: { q: '7－2를 식으로 쓰고 답을 구해요.', a: '5', steps: ['7－2 = 5'] },
      심화: { q: '8－3이 되는 이야기를 하나 만들어 봐요.', a: '여러 답 (차 5)', open: true } } },
    exit: { items: [ { q: '6－2는?', a: '4' }, { q: '7－2는?', a: '5' }, { q: '－ 기호는 무엇을 뜻할까요?', a: '빼기(덜어내기)' } ],
      self: ['뺄셈식을 읽고 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['－ 기호는 무엇을 나타낼까?'], watch: '기호로 뺄셈식 읽고 쓰기', min: 3 } }
  },
  u3_l09_10: {
    img: 'assets/photo/math/nature_countback.jpg',
    review: [ { q: '6－2는?', a: '4' }, { q: '7－2는?', a: '5' } ], from: 'u3_l08',
    leveled: { title: '거꾸로 세어 빼기', levels: {
      기본: { q: '8에서 거꾸로 세어 8－3을 구해요.', a: '5', steps: ['8→7→6→5 → 5'] },
      도전: { q: '8－3＝5가 맞는지 덧셈으로 확인하면?', a: '5＋3＝8이라 맞아요', steps: ['5＋3 = 8 확인'] },
      심화: { q: '뺄셈 하나를 골라 덧셈으로 확인해 봐요.', a: '여러 답 (예: 9－4＝5 → 5＋4＝9)', open: true } } },
    exit: { items: [ { q: '8－3은?', a: '5' }, { q: '8－3＝5를 덧셈으로 확인하면?', a: '5＋3＝8' }, { q: '뺄셈이 맞는지 무엇으로 확인할까요?', a: '덧셈으로' } ],
      self: ['거꾸로 세어 뺄 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['뺄셈이 맞는지 어떻게 확인할까?'], watch: '거꾸로 세기·덧셈으로 확인', min: 3 } }
  },
  u3_l11: {
    img: 'assets/photo/math/nature_zero.jpg',
    review: [ { q: '8－3은?', a: '5' }, { q: '8－3＝5를 덧셈으로 확인하면?', a: '5＋3＝8' } ], from: 'u3_l09_10',
    leveled: { title: '0을 더하고 빼기', levels: {
      기본: { q: '3＋0은 얼마일까요?', a: '3', steps: ['0을 더하면 그대로 → 3'] },
      도전: { q: '5－0과 4－4의 답을 각각 구해요.', a: '5－0＝5, 4－4＝0', steps: ['0을 빼면 그대로 → 5', '같은 수를 빼면 0 → 0'] },
      심화: { q: '답이 0이 되는 뺄셈을 하나 만들어 봐요.', a: '여러 답 (예: 6－6＝0)', open: true } } },
    exit: { items: [ { q: '3＋0은?', a: '3' }, { q: '5－0은?', a: '5' }, { q: '4－4는?', a: '0' } ],
      self: ['0이 있는 덧셈·뺄셈을 할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['0을 더하거나 빼면 수가 어떻게 될까?'], watch: '0의 성질·같은 수 빼기', min: 3 } }
  },
  u3_l12: {
    img: 'assets/photo/math/nature_three.jpg',
    review: [ { q: '3＋0은?', a: '3' }, { q: '4－4는?', a: '0' } ], from: 'u3_l11',
    leveled: { title: '두 번 계산하기', levels: {
      기본: { q: '4＋3은 얼마일까요?', a: '7', steps: ['4＋3 = 7'] },
      도전: { q: '4＋3－2를 앞에서부터 차례로 구해요.', a: '5', steps: ['4＋3 = 7', '7－2 = 5'] },
      심화: { q: '세 수로 계산하는 이야기를 하나 만들어 봐요.', a: '여러 답 (예: 8－5＋1＝4)', open: true } } },
    exit: { items: [ { q: '4＋3은?', a: '7' }, { q: '8－5는?', a: '3' }, { q: '4＋3－2는?', a: '5' } ],
      self: ['세 수를 차례로 계산할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['세 수는 어떤 순서로 계산할까?'], watch: '앞에서부터 차례로 계산', min: 3 } }
  },
  u3_l13: {
    img: 'assets/photo/math/nature_check.jpg',
    review: [ { q: '4＋3은?', a: '7' }, { q: '4＋3－2는?', a: '5' } ], from: 'u3_l12',
    leveled: { title: '단원 마무리 확인', levels: {
      기본: { q: '5＋3은 얼마일까요?', a: '8', steps: ['5＋3 = 8'] },
      도전: { q: '9－4와 6－0을 각각 구해요.', a: '9－4＝5, 6－0＝6', steps: ['9－4 = 5', '6－0 = 6'] },
      심화: { q: '이 단원에서 배운 것으로 나만의 덧셈·뺄셈 문제를 내 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '5＋3은?', a: '8' }, { q: '9－4는?', a: '5' }, { q: '6－0은?', a: '6' } ],
      self: ['덧셈·뺄셈을 스스로 할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['배운 것으로 어떤 문제를 만들 수 있을까?'], watch: '덧셈·뺄셈 종합 확인', min: 3 } }
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

// ── 산수 정합 검산 (원본 정답 계승 · eval 일치) ──
// 전각 기호(＋－＝) → ASCII 정규화 후 eval
function norm(s) { return String(s).replace(/＋/g, '+').replace(/－/g, '-').replace(/＝/g, '='); }
// (1) 고정 사실 테이블 eval 일치
const FACTS = [
  ['2+3', 5], ['4+3', 7], ['7-3', 4], ['8-6', 2], ['5+3', 8], ['4+2', 6], ['6+2', 8],
  ['2+5', 7], ['5+2', 7], ['6-2', 4], ['7-2', 5], ['8-3', 5], ['5+4', 9],
  ['3+0', 3], ['5-0', 5], ['4-4', 0], ['4+3-2', 5], ['8-5', 3], ['9-4', 5], ['6-0', 6]
];
const bad = [];
FACTS.forEach(([expr, exp]) => {
  let v; try { v = eval(expr); } catch (e) { bad.push('eval 실패: ' + expr); return; }
  if (v !== exp) bad.push('식 불일치: ' + expr + '=' + v + ' (기대 ' + exp + ')');
});
// (2) 증보 텍스트 내 "N±M＝K" 패턴 전수 검산 (내부 모순 차단)
// 두 항 단순식만: 앞뒤에 다른 연산자·숫자가 붙은 연쇄/세 항 식은 건너뜀(예: 3＋4＝4＋3, 8－5＋1＝4)
const eqRe = /(?<![\d+\-＋－])(\d+)\s*([+\-＋－])\s*(\d+)\s*[=＝]\s*(\d+)(?![\d+\-＋－])/g;
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  ['leveled_problem', 'exit_ticket', 'review'].forEach(blk => {
    const s = S.find(x => x.block === blk);
    if (!s) return;
    const txt = norm(JSON.stringify(s.data));
    let m;
    while ((m = eqRe.exec(txt)) !== null) {
      const a = +m[1], op = m[2].replace('＋', '+').replace('－', '-'), b = +m[3], k = +m[4];
      const v = op === '+' ? a + b : a - b;
      if (v !== k) bad.push(key + ':' + blk + ' 식 모순 ' + a + op + b + '=' + v + ' (표기 ' + k + ')');
    }
  });
});
if (bad.length) { console.error('산수 정합 오류:', bad); process.exit(1); }

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

// ── 학생 노출 자리 수학용어 금지 검사 (교환법칙·결합법칙·항등원) ──
const banned = ['교환법칙', '결합법칙', '항등원'];
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

console.log('✅ g1 수학 u3 증보 완료 (11차시 · 4요소)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 (IIFE 경계 보존: l01~l03 밖 · l04~l13 안) ──
const src = fs.readFileSync(FILE, 'utf8');
const OUTSIDE = ['u3_l01', 'u3_l02', 'u3_l03'];
const header = src.slice(0, src.indexOf('window.LESSONS["u3_l01"]'));
const iifeOpen = src.slice(src.indexOf('(function () {'), src.indexOf('window.LESSONS["u3_l04"]'));
const footer = '})();\n';
function emit(key) {
  const json = JSON.stringify(L[key], null, 2);
  return `window.LESSONS["${key}"] =\n${json};\n\n`;
}
let out = header;
OUTSIDE.forEach(k => { out += emit(k); });
out += iifeOpen;
Object.keys(L).filter(k => !OUTSIDE.includes(k)).forEach(k => { out += emit(k); });
out += footer;
fs.writeFileSync(FILE, out, 'utf8');
console.log('  파일 재출력 완료 (IIFE 경계 보존)');
