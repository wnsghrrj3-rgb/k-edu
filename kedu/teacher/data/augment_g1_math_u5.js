/* augment_g1_math_u5.js — L3 증보(g1 수학 5단원 「50까지의 수」).
   방식(준호 확정, u2·u3 계승): 고밀도 라인 → 부족 4요소만 삽입 = ①review items ⑤leveled ⑥exit ⑦tnote.
     ④offline은 기존 유지(미삽입) · ②img는 폴백 필드만.
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + 필드 추가만.
   ★u5 특수:
     ① review 블록은 l02_03만 보유 → 나머지 차시는 review 슬라이드 신규 삽입(motivate 뒤).
     ② l10(평가)은 summary가 앞쪽(s04·s05)에 존재 → exit은 "마지막 summary 앞"에 삽입.
     ③ tnote는 concept 블록 우선, 없으면(l10) motivate 블록 타깃.
   ★학생 노출 자리 자리값 용어(십의 자리·일의 자리·자릿값) 금지 — 1학년 용어(묶음/낱개)만.
   서사(③): 9→10 → 십몇 → 모으고가르기 → 10씩 묶기 → 묶음·낱개 → 순서 → 비교 → 마무리 → 색 약속.
   근거 고정(§3, 산수·place-value 검산): 모든 식 eval 일치 + 크기 비교 정합. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u5.js');

global.window = { LESSONS: {} };
require('./g1_math_u5.js');
const L = window.LESSONS;

/* 차시별 증보 스펙. review: 전시학습 문항(from=이전차시). leveled: 기본·도전·심화.
   exit: 확인3+신호등. tnote: {ask,watch,min}(대상 슬라이드는 자동=concept/motivate). offline 미삽입. */
const AUG = {
  u5_l02_03: {
    img: 'assets/photo/math/num50_ten.jpg',
    review: [ { q: '9는 5와 몇으로 가를까요?', a: '4' }, { q: '9는 8과 몇으로 가를까요?', a: '1' } ], from: null,
    leveled: { title: '10 알아보기', levels: {
      기본: { q: '9보다 1만큼 더 큰 수는?', a: '10', steps: ['9 다음 수 → 10'] },
      도전: { q: '10은 7과 몇으로 가를까요?', a: '3', steps: ['10을 7과 □ → 3'] },
      심화: { q: '10을 두 수로 가르는 방법을 여러 가지 말해 봐요.', a: '여러 답 (예: 6과 4, 8과 2)', open: true } } },
    exit: { items: [ { q: '9 다음 수는?', a: '10' }, { q: '10은 8과 몇으로 가를까요?', a: '2' }, { q: '10은 10개씩 묶음 몇 개?', a: '1개' } ],
      self: ['10을 알고 가를 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['9 다음에 오는 수는 무엇일까?'], watch: '9와 1을 모아 10 만들기', min: 3 }
  },
  u5_l04: {
    img: 'assets/photo/math/num50_teen.jpg',
    review: [ { q: '9 다음 수는?', a: '10' }, { q: '10은 7과 몇으로 가를까요?', a: '3' } ], from: 'u5_l02_03',
    leveled: { title: '십몇 알아보기', levels: {
      기본: { q: '10과 3을 모으면 얼마일까요?', a: '13', steps: ['10＋3 = 13'] },
      도전: { q: '15는 10과 몇으로 이루어졌나요?', a: '5', steps: ['15 = 10 + 5'] },
      심화: { q: '10개씩 묶음 1개와 낱개 몇 개로 만들 수 있는 수를 말해 봐요.', a: '여러 답 (11~19)', open: true } } },
    exit: { items: [ { q: '10＋3은?', a: '13' }, { q: '15는 10과 몇?', a: '5' }, { q: '십몇은 10개씩 묶음 몇 개?', a: '1개' } ],
      self: ['십몇을 묶음과 낱개로 나타낼 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['십몇은 어떻게 이루어져 있을까?'], watch: '10개씩 묶음 1개 + 낱개', min: 3 }
  },
  u5_l05: {
    img: 'assets/photo/math/num50_combine.jpg',
    review: [ { q: '10＋3은?', a: '13' }, { q: '15는 10과 몇?', a: '5' } ], from: 'u5_l04',
    leveled: { title: '모으고 가르기', levels: {
      기본: { q: '8과 5를 모으면 얼마일까요?', a: '13', steps: ['8＋5 = 13'] },
      도전: { q: '14를 10과 몇으로 가를까요?', a: '4', steps: ['14 = 10 + 4'] },
      심화: { q: '13이 되도록 두 수로 모으는 방법을 말해 봐요.', a: '여러 답 (예: 8과 5, 9와 4)', open: true } } },
    exit: { items: [ { q: '8＋5는?', a: '13' }, { q: '14는 10과 몇?', a: '4' }, { q: '모으기는 무엇일까요?', a: '두 수를 합치기' } ],
      self: ['수를 모으고 가를 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['두 묶음을 모으면 얼마가 될까?'], watch: '모으기·가르기로 십몇 다루기', min: 3 }
  },
  u5_l06: {
    img: 'assets/photo/math/num50_tens.jpg',
    review: [ { q: '8＋5는?', a: '13' }, { q: '14는 10과 몇?', a: '4' } ], from: 'u5_l05',
    leveled: { title: '10씩 묶어 세기', levels: {
      기본: { q: '10개씩 묶음 2개는 얼마일까요?', a: '20', steps: ['10, 20 → 20'] },
      도전: { q: '10개씩 묶음 4개는 얼마일까요?', a: '40', steps: ['10, 20, 30, 40 → 40'] },
      심화: { q: '10씩 뛰어 세며 말할 수 있는 수를 말해 봐요.', a: '여러 답 (10, 20, 30, 40, 50)', open: true } } },
    exit: { items: [ { q: '10개씩 묶음 2개는?', a: '20' }, { q: '10개씩 묶음 4개는?', a: '40' }, { q: '40은 10개씩 묶음 몇 개?', a: '4개' } ],
      self: ['10씩 묶어 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['10씩 묶으면 세기가 왜 쉬울까?'], watch: '10씩 묶어 몇십 세기', min: 3 }
  },
  u5_l07: {
    img: 'assets/photo/math/num50_count.jpg',
    review: [ { q: '10개씩 묶음 2개는?', a: '20' }, { q: '10개씩 묶음 4개는?', a: '40' } ], from: 'u5_l06',
    leveled: { title: '묶음과 낱개로 세기', levels: {
      기본: { q: '10개씩 묶음 2개와 낱개 3개는 얼마일까요?', a: '23', steps: ['20 + 3 = 23'] },
      도전: { q: '35는 10개씩 묶음 몇 개와 낱개 몇 개인가요?', a: '묶음 3개, 낱개 5개', steps: ['35 = 30 + 5'] },
      심화: { q: '묶음과 낱개로 만들 수 있는 40보다 큰 수를 말해 봐요.', a: '여러 답 (41~50)', open: true } } },
    exit: { items: [ { q: '묶음 2개와 낱개 3개는?', a: '23' }, { q: '35는 묶음 몇·낱개 몇?', a: '묶음 3·낱개 5' }, { q: '50은 10개씩 묶음 몇 개?', a: '5개' } ],
      self: ['묶음과 낱개로 50까지 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['50까지 수는 어떻게 세면 좋을까?'], watch: '묶음·낱개로 두 자리 수 읽기', min: 3 }
  },
  u5_l08: {
    img: 'assets/photo/math/num50_order.jpg',
    review: [ { q: '묶음 2개와 낱개 3개는?', a: '23' }, { q: '50은 10개씩 묶음 몇 개?', a: '5개' } ], from: 'u5_l07',
    leveled: { title: '수의 순서', levels: {
      기본: { q: '12보다 1만큼 더 큰 수는?', a: '13', steps: ['12 다음 수 → 13'] },
      도전: { q: '30보다 1만큼 더 작은 수는?', a: '29', steps: ['30 앞의 수 → 29'] },
      심화: { q: '25부터 30까지 순서대로 말해 봐요.', a: '25, 26, 27, 28, 29, 30', open: true } } },
    exit: { items: [ { q: '12 다음 수는?', a: '13' }, { q: '30 앞의 수는?', a: '29' }, { q: '19 다음 수는?', a: '20' } ],
      self: ['50까지 수의 순서를 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['수의 순서에서 다음·앞의 수는?'], watch: '1만큼 큰 수·작은 수', min: 3 }
  },
  u5_l09: {
    img: 'assets/photo/math/num50_compare.jpg',
    review: [ { q: '12 다음 수는?', a: '13' }, { q: '30 앞의 수는?', a: '29' } ], from: 'u5_l08',
    leveled: { title: '수의 크기 비교', levels: {
      기본: { q: '32와 21 중 더 큰 수는?', a: '32', steps: ['묶음 3개 > 묶음 2개'] },
      도전: { q: '24와 27 중 더 큰 수는?', a: '27', steps: ['묶음 같음 → 낱개 7 > 4'] },
      심화: { q: '35보다 크고 40보다 작은 수를 말해 봐요.', a: '여러 답 (36~39)', open: true } } },
    exit: { items: [ { q: '32와 21 중 큰 수는?', a: '32' }, { q: '24와 27 중 큰 수는?', a: '27' }, { q: '크기를 비교할 때 무엇부터 볼까요?', a: '묶음 수부터' } ],
      self: ['수의 크기를 비교할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['두 수의 크기는 무엇부터 비교할까?'], watch: '묶음 먼저·같으면 낱개 비교', min: 3 }
  },
  u5_l10: {
    img: 'assets/photo/math/num50_check.jpg',
    review: [ { q: '32와 21 중 큰 수는?', a: '32' }, { q: '50은 10개씩 묶음 몇 개?', a: '5개' } ], from: 'u5_l09',
    leveled: { title: '단원 마무리 확인', levels: {
      기본: { q: '10과 5를 모으면 얼마일까요?', a: '15', steps: ['10＋5 = 15'] },
      도전: { q: '10개씩 묶음 4개와 낱개 2개는 얼마일까요?', a: '42', steps: ['40 + 2 = 42'] },
      심화: { q: '이 단원에서 배운 수로 나만의 문제를 만들어 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '10＋5는?', a: '15' }, { q: '묶음 4개와 낱개 2개는?', a: '42' }, { q: '41과 39 중 큰 수는?', a: '41' } ],
      self: ['50까지의 수를 스스로 다룰 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['배운 것으로 어떤 문제를 만들 수 있을까?'], watch: '50까지 수 종합 확인', min: 3 }
  },
  u5_l11: {
    img: 'assets/photo/math/num50_color.jpg',
    review: [ { q: '10＋5는?', a: '15' }, { q: '묶음 4개와 낱개 2개는?', a: '42' } ], from: 'u5_l09',
    leveled: { title: '수를 색으로 나타내기', levels: {
      기본: { q: '27은 20~29 범위예요. 무슨 색으로 약속했나요?', a: '노랑', steps: ['20~29 → 노랑'] },
      도전: { q: '34는 무슨 색으로 약속했나요?', a: '파랑', steps: ['30~39 → 파랑'] },
      심화: { q: '나만의 색 약속을 정해 45를 칠해 봐요.', a: '여러 답 (40~49 색)', open: true } } },
    exit: { items: [ { q: '27은 무슨 색?', a: '노랑 (20~29)' }, { q: '34는 무슨 색?', a: '파랑 (30~39)' }, { q: '45는 어느 범위?', a: '40~49' } ],
      self: ['수 범위를 색으로 나타낼 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['수의 범위마다 색을 어떻게 약속할까?'], watch: '수 범위 → 색 규칙 만들기', min: 3 }
  }
};

function findIdx(slides, pred) { return slides.findIndex(pred); }
function lastIdx(slides, pred) { for (let j = slides.length - 1; j >= 0; j--) if (pred(slides[j])) return j; return -1; }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];

  // ② img (motivate에 폴백 필드)
  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }

  // ① review — 기존 review 블록 있으면 items 추가, 없으면 슬라이드 신규 삽입(motivate 뒤)
  if (spec.review) {
    let rv = S.find(s => s.block === 'review');
    if (rv) {
      rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from;
    } else {
      const s_rv = { id: 's-rv', stage: '도입', block: 'review',
        data: { title: '우리가 배운 것', items: spec.review, from: spec.from || undefined },
        suggested_extras: ['e_prev_review'] };
      let i = findIdx(S, s => s.block === 'motivate');
      if (i < 0) i = findIdx(S, s => s.block === 'objective');
      S.splice(i + 1, 0, s_rv);
    }
  }

  // ⑦ tnote — concept 블록 우선, 없으면 motivate 타깃
  if (spec.tnote) {
    let t = S.find(s => s.block === 'concept') || S.find(s => s.block === 'motivate');
    if (t) t.tnote = spec.tnote;
  }

  // ⑤ leveled_problem 삽입 — 마지막 basic_problem 다음(없으면 마지막 summary 앞)
  if (spec.leveled) {
    const s_lv = { id: 's-lv', stage: '기본문제', block: 'leveled_problem', data: spec.leveled,
      suggested_extras: ['q_apply'] };
    let i = lastIdx(S, s => s.block === 'basic_problem');
    if (i < 0) i = lastIdx(S, s => s.block === 'summary') - 1;
    S.splice(i + 1, 0, s_lv);
  }
  // ⑥ exit_ticket 삽입 — 마지막 summary 앞(l10 평가: 앞쪽 summary 회피)
  if (spec.exit) {
    const s_ex = { id: 's-ex', stage: '정리', block: 'exit_ticket',
      data: { title: '오늘 확인해요', items: spec.exit.items, self: spec.exit.self },
      suggested_extras: ['q_reflect'] };
    let i = lastIdx(S, s => s.block === 'summary');
    if (i < 0) i = S.length;
    S.splice(i, 0, s_ex);
  }

  // 삽입 슬라이드 id 유니크 재부여 (s100~ 기존 뒤로)
  let n = 100;
  S.forEach(s => { if (['s-rv', 's-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });

  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(4요소)';
});

// ── 산수·place-value 정합 검산 ──
function norm(s) { return String(s).replace(/＋/g, '+').replace(/－/g, '-').replace(/＝/g, '='); }
// (1) 고정 사실 eval 일치
const FACTS = [
  ['9+1', 10], ['10+3', 13], ['8+5', 13], ['10+5', 15], ['20+3', 23], ['40+2', 42],
  ['30+5', 35], ['10+4', 14], ['12+1', 13], ['19+1', 20]
];
const bad = [];
FACTS.forEach(([e, v]) => { let r; try { r = eval(e); } catch (x) { bad.push('eval실패:' + e); return; } if (r !== v) bad.push('식 불일치:' + e + '=' + r + '(기대' + v + ')'); });
// (2) 크기 비교 정합
const COMP = [[32, 21, 32], [24, 27, 27], [41, 39, 41]];
COMP.forEach(([a, b, big]) => { if (Math.max(a, b) !== big) bad.push('비교 오류:' + a + 'vs' + b); });
// (3) 증보 텍스트 내 두 항 단순식 전수 검산(연쇄/세 항 제외)
const eqRe = /(?<![\d+\-＋－])(\d+)\s*([+\-＋－])\s*(\d+)\s*[=＝]\s*(\d+)(?![\d+\-＋－])/g;
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  ['leveled_problem', 'exit_ticket', 'review'].forEach(blk => {
    const ss = S.filter(x => x.block === blk);
    ss.forEach(s => {
      const txt = norm(JSON.stringify(s.data)); let m;
      while ((m = eqRe.exec(txt)) !== null) {
        const a = +m[1], op = m[2].replace('＋', '+').replace('－', '-'), b = +m[3], k = +m[4];
        const v = op === '+' ? a + b : a - b;
        if (v !== k) bad.push(key + ':' + blk + ' 식 모순 ' + a + op + b + '=' + v + '(표기' + k + ')');
      }
    });
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
  if (S.filter(s => s.tnote).length < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

// ── 학생 노출 자리 자리값 용어 금지(십의 자리·일의 자리·자릿값) ──
const banned = ['십의 자리', '일의 자리', '자릿값', '자리값'];
const termFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  ['leveled_problem', 'exit_ticket', 'review'].forEach(blk => {
    S.filter(x => x.block === blk).forEach(s => {
      const txt = JSON.stringify(s.data);
      banned.forEach(t => { if (txt.includes(t)) termFail.push(key + ':' + blk + ':' + t); });
    });
  });
});
if (termFail.length) { console.error('금지 자리값 용어 노출:', termFail); process.exit(1); }

console.log('✅ g1 수학 u5 증보 완료 (9차시 · 4요소)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x && (x !== 'review' || s.data.items))).join(','));
});

// ── 파일 재출력 (전차시 IIFE 안 · window.LESSONS 2칸 들여쓰기 패턴 보존) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
const footer = '})();\n';
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + footer, 'utf8');
console.log('  파일 재출력 완료 (IIFE 보존)');
