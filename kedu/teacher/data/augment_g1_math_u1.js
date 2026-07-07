/* augment_g1_math_u1.js — L3 증보(g1 수학 1단원 「9까지의 수」).
   방식(준호 확정): g1 고밀도 라인 → 부족 4요소만 삽입 = ①review items ⑤leveled ⑥exit ⑦tnote.
     ④offline은 기존 유지(미삽입) · ②img는 폴백 필드만.
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + 필드 추가만.
   서사(③): 곰이·펭이의 수 세기 배움터 — 세고·순서 짓고·비교하며 9까지의 수를 익히는 흐름.
   근거 고정(§3): 수 이름 두 가지(하나=1 …) / 서수(첫째…)≠개수 / 1만큼 크면 바로 다음 수·작으면 앞 수 /
     0=아무것도 없음·1보다 1 작은 수 / 비교는 하나씩 짝지어.
   각 차시 증보 데이터 정의 → 삽입 → 산수 검산 → 파일 재출력. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u1.js');

global.window = {};
require('./g1_math_u1.js');
const L = window.LESSONS;

/* 차시별 증보 스펙. review: 전시학습 문항(from=이전차시). leveled: 기본·도전·심화.
   exit: 확인3+신호등. tnote: 슬라이드 id별. offline 미삽입(기존 유지). */
const AUG = {
  u1_l01: {
    img: 'assets/photo/math/count_school.jpg',
    review: null, from: null,   // 단원 첫 차시
    leveled: { title: '곰이의 수 세기', levels: {
      기본: { q: '친구 4명을 세면 모두 몇 명일까요?', a: '4명', steps: ['하나씩 짚으며 세기'] },
      도전: { q: '연필 6자루는 모두 몇 자루일까요?', a: '6자루', steps: ['하나씩 세기'] },
      심화: { q: '교실에서 5개인 물건을 찾아 말해 봐요.', a: '여러 답 (예: 손가락 한 손 5개 …)', open: true } } },
    exit: { items: [ { q: '하나 · 둘 · 셋 다음은?', a: '넷' }, { q: '물건의 개수를 알려면 어떻게 해요?', a: '하나씩 세요' }, { q: '1부터 다섯까지 세면?', a: '1 · 2 · 3 · 4 · 5' } ],
      self: ['하나씩 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['우리 교실에는 무엇이 몇 개 있을까?'], watch: '하나씩 짚으며 세는 습관 잡기', min: 3 } }
  },
  u1_l02_03: {
    img: 'assets/photo/math/count_1to5.jpg',
    review: [ { q: '하나씩 세면 무엇을 알 수 있어요?', a: '물건의 개수' }, { q: '손가락 3개는 몇?', a: '3(셋)' } ], from: 'u1_l01',
    leveled: { title: '펭이의 1~5 수 카드', levels: {
      기본: { q: '사과 4개를 숫자로 쓰면?', a: '4', steps: ['넷 = 4'] },
      도전: { q: '‘다섯’을 숫자로 쓰면?', a: '5', steps: ['다섯 = 5'] },
      심화: { q: '1~5 중 좋아하는 수를 골라 그 개수만큼 그려 봐요.', a: '여러 답 (수↔개수 일치)', open: true } } },
    exit: { items: [ { q: '사과 2개는 숫자로?', a: '2' }, { q: '‘넷’을 숫자로?', a: '4' }, { q: '5는 몇 개인가요?', a: '다섯 개' } ],
      self: ['1~5를 읽고 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['수는 왜 이름이 두 가지(하나·1)일까?'], watch: '수 이름↔숫자 연결', min: 3 } }
  },
  u1_l04_05: {
    img: 'assets/photo/math/count_6to9.jpg',
    review: [ { q: '사과 4개를 숫자로?', a: '4' }, { q: '‘다섯’을 숫자로?', a: '5' } ], from: 'u1_l02_03',
    leveled: { title: '곰이의 6~9 구슬', levels: {
      기본: { q: '구슬 7개를 숫자로 쓰면?', a: '7', steps: ['일곱 = 7'] },
      도전: { q: '‘아홉’을 숫자로 쓰면?', a: '9', steps: ['아홉 = 9'] },
      심화: { q: '6·7·8·9 중 하나를 골라 그 개수만큼 스티커를 붙여 봐요.', a: '여러 답 (수↔개수 일치)', open: true } } },
    exit: { items: [ { q: '구슬 6개는 숫자로?', a: '6' }, { q: '‘여덟’을 숫자로?', a: '8' }, { q: '9는 몇 개인가요?', a: '아홉 개' } ],
      self: ['6~9를 읽고 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['5보다 큰 수는 어떻게 세면 좋을까?'], watch: '5 다음부터 이어 세기', min: 3 } }
  },
  u1_l06: {
    img: 'assets/photo/math/order_line.jpg',
    review: [ { q: '구슬 7개를 숫자로?', a: '7' }, { q: '‘아홉’을 숫자로?', a: '9' } ], from: 'u1_l04_05',
    leveled: { title: '펭이의 줄 서기', levels: {
      기본: { q: '줄 선 친구 중 앞에서 셋째는 몇 번째 친구일까요?', a: '세 번째', steps: ['첫째·둘째·셋째'] },
      도전: { q: '다섯째 바로 앞은 몇째일까요?', a: '넷째', steps: ['다섯째 앞 = 넷째'] },
      심화: { q: '우리 줄에서 내가 몇째인지 말해 봐요.', a: '여러 답 (서수로 말하기)', open: true } } },
    exit: { items: [ { q: '앞에서 첫째 다음은?', a: '둘째' }, { q: '‘넷째’와 ‘넷’은 같은 말일까요?', a: '아니요(순서 ↔ 개수)' }, { q: '다섯째는 몇 번째?', a: '다섯 번째' } ],
      self: ['순서(서수)를 말할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['‘셋’과 ‘셋째’는 무엇이 다를까?'], watch: '개수 ↔ 순서 구분', min: 3 } }
  },
  u1_l07: {
    img: 'assets/photo/math/number_order.jpg',
    review: [ { q: '앞에서 첫째 다음은?', a: '둘째' }, { q: '다섯째는 몇 번째?', a: '다섯 번째' } ], from: 'u1_l06',
    leveled: { title: '곰이의 수 순서', levels: {
      기본: { q: '5 다음 수는 무엇일까요?', a: '6', steps: ['1→…→5→6'] },
      도전: { q: '8 바로 앞의 수는 무엇일까요?', a: '7', steps: ['7→8'] },
      심화: { q: '9부터 거꾸로 세어 말해 봐요.', a: '9·8·7·6·5·4·3·2·1', open: true } } },
    exit: { items: [ { q: '6 다음 수는?', a: '7' }, { q: '4 바로 앞의 수는?', a: '3' }, { q: '순서대로 세면 5 다음은?', a: '6' } ],
      self: ['수의 순서를 알 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['수를 순서대로 세면 무엇을 알 수 있을까?'], watch: '다음 수·앞 수 감각', min: 3 } }
  },
  u1_l08: {
    img: 'assets/photo/math/one_more_less.jpg',
    review: [ { q: '5 다음 수는?', a: '6' }, { q: '8 바로 앞의 수는?', a: '7' } ], from: 'u1_l07',
    leveled: { title: '펭이의 하나 더·하나 덜', levels: {
      기본: { q: '6보다 1만큼 큰 수는?', a: '7', steps: ['6 다음 수'] },
      도전: { q: '8보다 1만큼 작은 수는?', a: '7', steps: ['8 앞 수'] },
      심화: { q: '어떤 수를 골라 그보다 1 큰 수와 1 작은 수를 말해 봐요.', a: '여러 답 (예: 5 → 6·4)', open: true } } },
    exit: { items: [ { q: '4보다 1만큼 큰 수는?', a: '5' }, { q: '7보다 1만큼 작은 수는?', a: '6' }, { q: '1만큼 큰 수는 순서로 어느 쪽?', a: '바로 다음 수' } ],
      self: ['1만큼 큰·작은 수를 알 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['하나 더 많아지면 수가 어떻게 될까?'], watch: '1 큰 수=다음 / 1 작은 수=앞', min: 3 } }
  },
  u1_l09: {
    img: 'assets/photo/math/zero_empty.jpg',
    review: [ { q: '6보다 1만큼 큰 수는?', a: '7' }, { q: '8보다 1만큼 작은 수는?', a: '7' } ], from: 'u1_l08',
    leveled: { title: '곰이의 빈 접시', levels: {
      기본: { q: '접시에 사탕이 하나도 없으면 몇 개일까요?', a: '0', steps: ['아무것도 없음 = 0'] },
      도전: { q: '1보다 1만큼 작은 수는?', a: '0', steps: ['1 앞 수 = 0'] },
      심화: { q: '0을 쓰는 상황을 하나 말해 봐요.', a: '여러 답 (예: 사탕을 다 먹어 0개)', open: true } } },
    exit: { items: [ { q: '아무것도 없을 때의 수는?', a: '0' }, { q: '1보다 1만큼 작은 수는?', a: '0' }, { q: '0은 1보다 큰가요, 작은가요?', a: '작아요' } ],
      self: ['0을 알 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s05: { ask: ['하나도 없을 때도 수로 나타낼 수 있을까?'], watch: '0의 필요성·1 앞 수 연결', min: 3 } }
  },
  u1_l10: {
    img: 'assets/photo/math/compare_size.jpg',
    review: [ { q: '아무것도 없을 때의 수는?', a: '0' }, { q: '1보다 1만큼 작은 수는?', a: '0' } ], from: 'u1_l09',
    leveled: { title: '펭이의 수 비교', levels: {
      기본: { q: '3과 5 중 더 큰 수는?', a: '5', steps: ['짝지어 남는 쪽이 큼'] },
      도전: { q: '7과 4 중 더 작은 수는?', a: '4', steps: ['짝지어 모자란 쪽이 작음'] },
      심화: { q: '두 수를 골라 하나씩 짝지어 어느 쪽이 큰지 말해 봐요.', a: '여러 답 (짝짓기 비교)', open: true } } },
    exit: { items: [ { q: '3과 5 중 큰 수는?', a: '5' }, { q: '6과 2 중 작은 수는?', a: '2' }, { q: '두 수를 비교하려면?', a: '하나씩 짝지어요' } ],
      self: ['수의 크기를 비교할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['어느 쪽이 더 많은지 어떻게 알까?'], watch: '하나씩 짝지어 남는 쪽 판단', min: 3 } }
  },
  u1_l11: {
    img: 'assets/photo/math/unit_check.jpg',
    review: [ { q: '3과 5 중 큰 수는?', a: '5' }, { q: '7과 4 중 작은 수는?', a: '4' } ], from: 'u1_l10',
    leveled: { title: '곰이·펭이와 스스로 점검', levels: {
      기본: { q: '‘일곱’을 숫자로 쓰고 개수를 세면?', a: '7 (일곱 개)', steps: ['일곱 = 7'] },
      도전: { q: '6보다 1 큰 수와 1 작은 수는?', a: '7과 5', steps: ['6 다음 7 · 6 앞 5'] },
      심화: { q: '1~9 중 세 수를 골라 작은 수부터 순서대로 놓아 봐요.', a: '여러 답 (오름차순)', open: true } } },
    exit: { items: [ { q: '5 다음 수는?', a: '6' }, { q: '8보다 1만큼 작은 수는?', a: '7' }, { q: '아무것도 없으면 수는?', a: '0' } ],
      self: ['네 가지를 스스로 점검할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s02: { ask: ['어떤 수가 아직 헷갈리는지 스스로 찾아볼까?'], watch: '자기점검 — 틀린 유형 표시', min: 3 } }
  },
  u1_l12: {
    img: 'assets/photo/math/number_book.jpg',
    review: [ { q: '5 다음 수는?', a: '6' }, { q: '아무것도 없으면 수는?', a: '0' } ], from: 'u1_l11',
    leveled: { title: '곰이·펭이의 수 그림책', levels: {
      기본: { q: '그림책에 사과 3개를 그리면 숫자는?', a: '3', steps: ['셋 = 3'] },
      도전: { q: '그림책 8쪽은 몇 번째 쪽일까요?', a: '여덟 번째', steps: ['쪽수 = 순서'] },
      심화: { q: '나만의 수 그림책 한 장을 어떻게 꾸밀지 말해 봐요.', a: '여러 답 (개수·순서 활용)', open: true } } },
    exit: { items: [ { q: '수는 개수 말고 무엇에 쓰나요?', a: '순서(쪽수 등)' }, { q: '3은 몇 개인가요?', a: '세 개' }, { q: '셋째는 몇 번째?', a: '세 번째' } ],
      self: ['수의 여러 쓰임을 알 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['수는 개수 말고 또 어디에 쓰일까?'], watch: '개수 ↔ 순서 두 쓰임 정리', min: 3 } }
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

// ── 산수 검산 (1만큼 크/작·0) ──
const HARD = [
  ['6+1', 7], ['8-1', 7], ['4+1', 5], ['7-1', 6],   // l08
  ['1-1', 0],                                         // l09
  ['6+1', 7], ['6-1', 5], ['8-1', 7]                  // l11
];
const badH = HARD.filter(([e, a]) => eval(e) !== a);
if (badH.length) { console.error('산수 오류:', badH); process.exit(1); }

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

console.log('✅ g1 수학 u1 증보 완료 (10차시 · 4요소)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 (전 차시 블록 교체) ──
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
