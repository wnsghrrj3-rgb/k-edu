/* augment_g2_math_u5.js — L3 증보(g2 수학 5단원 「분류하기」).
   방식(준호 확정, u3 계승): 고밀도 라인 → 부족 4요소만 삽입 = ①review items ⑤leveled ⑥exit ⑦tnote.
     ④offline은 기존 유지(미삽입) · ②img는 폴백 필드만.
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + 필드 추가만.
   ★분류 단원: 문제풀이보다 '분명한 기준 → 분류 → 세기 → 비교' 위계. leveled는 기준·분류·세기 판단형.
   서사(③): 곰이·펭이 정리/분류 — 모으기 → 기준 → 색깔분류 → 세기 → 결과말하기 → 되짚기 → 조각보.
   근거 고정(§3, 학생 본 차시 검증 수 계승): 과일 사과4·귤6·바나나3=13 / 조각보 빨강6·노랑3·파랑4·흰색2=15.
   각 차시 증보 데이터 정의 → 삽입 → 세기 합·비교 검산 → 파일 재출력(IIFE 보존). */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_math_u5.js');

global.window = { LESSONS: {} };
require('./g2_math_u5.js');
const L = window.LESSONS;

const AUG = {
  u5_l01: {
    img: 'assets/photo/math/sort_intro.jpg',
    review: null, from: null,   // 단원 첫 차시
    leveled: { title: '같은 것끼리 모으기', levels: {
      기본: { q: '흩어진 물건을 정리하려면 어떻게 하면 좋을까요?', a: '같은 것끼리 모아요', steps: ['같은 것 찾기 → 한곳에 모으기'] },
      도전: { q: '연필·지우개·자를 정리한다면 무엇끼리 모을까요?', a: '같은 종류끼리 (필기구·지우개 등)', steps: ['쓰임이 같은 것끼리'] },
      심화: { q: '내 책상 위 물건을 같은 것끼리 모아 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '정리의 첫걸음은?', a: '같은 것끼리 모으기' }, { q: '물건을 모을 때 무엇을 볼까요?', a: '같은 것(종류·색깔 등)' }, { q: '정리하면 무엇이 좋을까요?', a: '찾기 쉬워요' } ],
      self: ['같은 것끼리 모을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['흩어진 물건을 어떻게 하면 깔끔해질까?'], watch: '같은 것끼리 모으는 직관 세우기', min: 3 }
  },
  u5_l02: {
    img: 'assets/photo/math/sort_criteria.jpg',
    review: [ { q: '정리의 첫걸음은?', a: '같은 것끼리 모으기' }, { q: '물건을 모을 때 무엇을 볼까요?', a: '같은 것' } ], from: 'u5_l01',
    leveled: { title: '분명한 기준 찾기', levels: {
      기본: { q: '색깔·모양·종류는 분명한 기준일까요?', a: '네 (누가 나눠도 결과가 같아요)', steps: ['결과가 늘 같음 → 분명한 기준'] },
      도전: { q: "'예쁜 것'은 분명한 기준일까요?", a: '아니요 (사람마다 달라요)', steps: ['사람마다 달라짐 → 분명하지 않음'] },
      심화: { q: '물건을 나눌 분명한 기준을 두 가지 말해 봐요.', a: '여러 답 (예: 색깔, 모양)', open: true } } },
    exit: { items: [ { q: '분명한 기준의 예는?', a: '색깔·모양·종류' }, { q: "'예쁜 것'은 기준이 될까요?", a: '아니요' }, { q: '분명한 기준의 특징은?', a: '누가 나눠도 결과가 같아요' } ],
      self: ['분명한 기준을 고를 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['어떤 기준이 분명한 기준일까?'], watch: '결과가 같아지는 기준 구별', min: 3 }
  },
  u5_l03: {
    img: 'assets/photo/math/sort_bycolor.jpg',
    review: [ { q: '분명한 기준의 예는?', a: '색깔·모양·종류' }, { q: '분명한 기준의 특징은?', a: '누가 나눠도 결과가 같아요' } ], from: 'u5_l02',
    leveled: { title: '기준에 따라 분류하기', levels: {
      기본: { q: '빨강·파랑 블록을 색깔 기준으로 나누면 어떻게 될까요?', a: '빨강 칸·파랑 칸으로 나뉘어요', steps: ['색깔 기준 → 같은 색끼리'] },
      도전: { q: '모양 기준으로 나눈다면 무엇끼리 모을까요?', a: '같은 모양끼리 (동그라미·네모 등)', steps: ['모양 기준 → 같은 모양끼리'] },
      심화: { q: '한 가지 물건 묶음을 두 가지 기준으로 각각 나눠 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '색깔 기준으로 나누면?', a: '같은 색끼리 모여요' }, { q: '모양 기준으로 나누면?', a: '같은 모양끼리 모여요' }, { q: '기준을 바꾸면 결과는?', a: '달라져요' } ],
      self: ['기준에 따라 분류할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['기준을 바꾸면 나눔이 어떻게 달라질까?'], watch: '기준 → 분류 결과 연결', min: 3 }
  },
  u5_l04: {
    img: 'assets/photo/math/sort_count.jpg',
    review: [ { q: '색깔 기준으로 나누면?', a: '같은 색끼리 모여요' }, { q: '기준을 바꾸면 결과는?', a: '달라져요' } ], from: 'u5_l03',
    leveled: { title: '분류하고 세기', levels: {
      기본: { q: '사과 4개, 귤 6개, 바나나 3개를 세면 과일은 모두 몇 개?', a: '13개', steps: ['4＋6＋3 = 13'] },
      도전: { q: '가장 많은 과일은 무엇일까요?', a: '귤 (6개)', steps: ['4, 6, 3 중 가장 큰 수 → 6'] },
      심화: { q: '셀 때 빠뜨리지 않는 나만의 방법을 말해 봐요.', a: '여러 답 (예: ／ 표시)', open: true } } },
    exit: { items: [ { q: '사과 4·귤 6·바나나 3은 모두?', a: '13개' }, { q: '셀 때 하는 표시는?', a: '／ 표시' }, { q: '가장 많은 과일은?', a: '귤' } ],
      self: ['분류하고 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['셀 때 왜 표시를 하며 셀까?'], watch: '칸마다 세기·빠뜨림 방지', min: 3 }
  },
  u5_l05: {
    img: 'assets/photo/math/sort_result.jpg',
    review: [ { q: '사과 4·귤 6·바나나 3은 모두?', a: '13개' }, { q: '가장 많은 과일은?', a: '귤' } ], from: 'u5_l04',
    leveled: { title: '분류 결과 말하기', levels: {
      기본: { q: '사과 4·귤 6·바나나 3 중 가장 적은 것은?', a: '바나나 (3개)', steps: ['4, 6, 3 중 가장 작은 수 → 3'] },
      도전: { q: '가장 많은 것과 가장 적은 것의 차이는 몇 개?', a: '3개', steps: ['6－3 = 3'] },
      심화: { q: '분류 결과를 한 문장으로 말해 봐요.', a: '여러 답 (예: 귤이 가장 많고 바나나가 가장 적어요)', open: true } } },
    exit: { items: [ { q: '가장 많은 것은 어느 칸?', a: '수가 가장 큰 칸' }, { q: '가장 적은 것은 어느 칸?', a: '수가 가장 작은 칸' }, { q: '6과 3의 차이는?', a: '3' } ],
      self: ['분류 결과를 말할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['분류 결과에서 무엇을 읽어낼 수 있을까?'], watch: '가장 많은/적은·차이 말하기', min: 3 }
  },
  u5_l06: {
    img: 'assets/photo/math/sort_check.jpg',
    review: [ { q: '가장 많은 것은 어느 칸?', a: '수가 가장 큰 칸' }, { q: '6과 3의 차이는?', a: '3' } ], from: 'u5_l05',
    leveled: { title: '분류 위계 확인', levels: {
      기본: { q: '분류의 첫 단계는 무엇을 정하는 걸까요?', a: '분명한 기준', steps: ['기준 정하기가 먼저'] },
      도전: { q: '기준 정하기 다음에 할 일은?', a: '기준에 따라 분류하고 세기', steps: ['기준 → 분류 → 세기'] },
      심화: { q: '분류 순서를 차례로 말해 봐요.', a: '기준 정하기 → 분류 → 세기 → 비교/전체 말하기', open: true } } },
    exit: { items: [ { q: '분류 첫 단계는?', a: '분명한 기준 정하기' }, { q: '분류 다음은?', a: '세기' }, { q: '세기 다음은?', a: '비교·전체 말하기' } ],
      self: ['분류 순서를 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['분류는 어떤 순서로 이루어질까?'], watch: '기준→분류→세기→비교 위계 되짚기', min: 3 }
  },
  u5_l07: {
    img: 'assets/photo/math/sort_quilt.jpg',
    review: [ { q: '분류 첫 단계는?', a: '분명한 기준 정하기' }, { q: '분류 다음은?', a: '세기' } ], from: 'u5_l06',
    leveled: { title: '조각보 색깔 분류', levels: {
      기본: { q: '조각보 빨강 6·노랑 3·파랑 4·흰색 2를 세면 조각은 모두 몇 개?', a: '15개', steps: ['6＋3＋4＋2 = 15'] },
      도전: { q: '가장 많은 색은 무엇일까요?', a: '빨강 (6개)', steps: ['6, 3, 4, 2 중 가장 큰 수 → 6'] },
      심화: { q: '내 조각보를 색깔로 분류해 가장 많은 색을 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '빨강 6·노랑 3·파랑 4·흰색 2는 모두?', a: '15개' }, { q: '가장 많은 색은?', a: '빨강' }, { q: '분류 기준은 무엇이었나요?', a: '색깔' } ],
      self: ['색깔로 분류하고 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['조각보를 무엇을 기준으로 나눌까?'], watch: '색깔 기준 분류·세기 종합', min: 3 }
  }
};

function findIdx(slides, pred) { return slides.findIndex(pred); }
function lastIdx(slides, pred) { for (let j = slides.length - 1; j >= 0; j--) if (pred(slides[j])) return j; return -1; }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];

  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }

  // ① review — 기존 review 블록에 items 추가(전차시 보유). 첫 차시(l01)는 null → 미변경.
  if (spec.review) {
    const rv = S.find(s => s.block === 'review');
    if (rv) { rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from; }
  }

  // ⑦ tnote — concept 우선, 없으면 motivate
  if (spec.tnote) {
    const t = S.find(s => s.block === 'concept') || S.find(s => s.block === 'motivate');
    if (t) t.tnote = spec.tnote;
  }

  // ⑤ leveled — 마지막 basic_problem 다음(없으면 마지막 summary 앞)
  if (spec.leveled) {
    const s_lv = { id: 's-lv', stage: '기본문제', block: 'leveled_problem', data: spec.leveled, suggested_extras: ['q_apply'] };
    let i = lastIdx(S, s => s.block === 'basic_problem');
    if (i < 0) i = lastIdx(S, s => s.block === 'summary') - 1;
    S.splice(i + 1, 0, s_lv);
  }
  // ⑥ exit — 마지막 summary 앞
  if (spec.exit) {
    const s_ex = { id: 's-ex', stage: '정리', block: 'exit_ticket',
      data: { title: '오늘 확인해요', items: spec.exit.items, self: spec.exit.self }, suggested_extras: ['q_reflect'] };
    let i = lastIdx(S, s => s.block === 'summary');
    if (i < 0) i = S.length;
    S.splice(i, 0, s_ex);
  }

  let n = 100;
  S.forEach(s => { if (['s-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });
  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(4요소)';
});

// ── 세기 합·비교 정합 검산 (학생 본 차시 수 계승) ──
function norm(s) { return String(s).replace(/＋/g, '+').replace(/－/g, '-').replace(/＝/g, '='); }
const FACTS = [['4+6+3', 13], ['6+3+4+2', 15], ['6-3', 3]];
const bad = [];
FACTS.forEach(([e, v]) => { let r; try { r = eval(e); } catch (x) { bad.push('eval실패:' + e); return; } if (r !== v) bad.push('합 불일치:' + e + '=' + r + '(기대' + v + ')'); });
// 분류 최다/최소 정합
const FRUIT = { 사과: 4, 귤: 6, 바나나: 3 };
const maxK = Object.keys(FRUIT).reduce((a, b) => FRUIT[a] >= FRUIT[b] ? a : b);
const minK = Object.keys(FRUIT).reduce((a, b) => FRUIT[a] <= FRUIT[b] ? a : b);
if (maxK !== '귤') bad.push('최다 오류:' + maxK);
if (minK !== '바나나') bad.push('최소 오류:' + minK);
const QUILT = { 빨강: 6, 노랑: 3, 파랑: 4, 흰색: 2 };
const qMax = Object.keys(QUILT).reduce((a, b) => QUILT[a] >= QUILT[b] ? a : b);
if (qMax !== '빨강') bad.push('조각보 최다 오류:' + qMax);
// 두 항 단순식 전수 검산
const eqRe = /(?<![\d+\-＋－])(\d+)\s*([+\-＋－])\s*(\d+)\s*[=＝]\s*(\d+)(?![\d+\-＋－])/g;
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  ['leveled_problem', 'exit_ticket', 'review'].forEach(blk => {
    const s = S.find(x => x.block === blk); if (!s) return;
    const txt = norm(JSON.stringify(s.data)); let m;
    while ((m = eqRe.exec(txt)) !== null) {
      const a = +m[1], op = m[2].replace('＋', '+').replace('－', '-'), b = +m[3], k = +m[4];
      const v = op === '+' ? a + b : a - b;
      if (v !== k) bad.push(key + ':' + blk + ' 식 모순 ' + a + op + b + '=' + v + '(표기' + k + ')');
    }
  });
});
if (bad.length) { console.error('분류·세기 정합 오류:', bad); process.exit(1); }

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

console.log('✅ g2 수학 u5 「분류하기」 증보 완료 (7차시 · 4요소)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x && (x !== 'review' || s.data.items))).join(','));
});

// ── 파일 재출력 (전차시 IIFE 안 · window.LESSONS 2칸 들여쓰기 보존) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + '})();\n', 'utf8');
console.log('  파일 재출력 완료 (IIFE 보존)');
