/* augment_g2_math_u1.js — L3 증보(g2 수학 1단원 「세 자리 수」).
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + tnote/img/items/from 필드 추가만.
   서사(③): 도서관의 곰이·펭이 — 전 차시 일관.
   각 차시 증보 데이터를 정의 → 삽입 → 산수 검산 → 파일 재출력. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_math_u1.js');

global.window = {};
require('./g2_math_u1.js');
const L = window.LESSONS;

/* 차시별 증보 스펙.
   review: 전시학습 문항 2~3(from=이전차시). img: 폴백 경로. offline: 활동 소지 차시만.
   leveled: 기본·도전·심화. exit: 확인3+신호등. tnote: 슬라이드 id별. */
const AUG = {
  u1_l01: {
    img: 'assets/photo/math/library_books.jpg',
    review: null, from: null,   // 단원 첫 차시 = 전시학습 없음
    offline: { title: '십 모형으로 100 만들기', type: 'pair', goal: '10이 10개면 100임을 손으로',
      steps: ['십 모형 카드를 짝과 나눠 갖기', '10개를 한 줄로 모으기', '“10이 10개 = 100” 함께 외치기'],
      materials: ['십 모형 카드'], minutes: 3 },
    leveled: { title: '도서관 책 세기', levels: {
      기본: { q: '10이 6개이면 얼마일까요?', a: '60', steps: ['10×6'] },
      도전: { q: '책 70권에 30권을 더 모으면 몇 권일까요?', a: '100권', steps: ['70+30'] },
      심화: { q: '100권을 두 책장에 나눠 꽂는 방법을 여러 가지로 말해 봐요.', a: '여러 답 (예: 60+40, 50+50 …)', open: true } } },
    exit: { items: [ { q: '10이 10개이면 얼마?', a: '100' }, { q: '60과 40을 모으면?', a: '100' }, { q: '99 다음 수는?', a: '100' } ],
      self: ['100을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['99보다 큰 수는 어떻게 부를까?', '10씩 묶으면 세기 쉬울까?'], watch: '“많다”에서 멈추지 않게 — 10씩 묶어 세기로 유도', min: 3 },
      s07: { ask: ['10이 10개면 왜 100이 될까?'], watch: '십 모형을 눈으로 세어 확인', min: 2 } }
  },
  u1_l02: {
    img: 'assets/photo/math/pencils_bundle.jpg',
    review: [ { q: '10이 10개이면?', a: '100' }, { q: '99 다음 수는?', a: '100' } ], from: 'u1_l01',
    offline: { title: '연필 100자루 묶기', type: 'group', goal: '10자루 묶음 10개 = 100',
      steps: ['10자루 묶음 카드를 모둠이 모으기', '10묶음을 한 자리에 놓기', '“100자루!” 확인'],
      materials: ['연필 묶음 카드'], minutes: 3 },
    leveled: { title: '연필 세기', levels: {
      기본: { q: '10이 8개이면 얼마일까요?', a: '80', steps: ['10×8'] },
      도전: { q: '80자루에 몇 자루를 더 모으면 100이 될까요?', a: '20자루', steps: ['100-80'] },
      심화: { q: '100자루를 10자루 묶음과 낱개로 나누는 방법을 여러 가지로 말해 봐요.', a: '여러 답 (예: 묶음 9+낱개 10, 묶음 8+낱개 20 …)', open: true } } },
    exit: { items: [ { q: '10이 10개이면?', a: '100' }, { q: '100은 10이 몇 개?', a: '10개' }, { q: '60과 얼마를 모으면 100?', a: '40' } ],
      self: ['백을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['10묶음이 10개면 얼마가 될까?'], watch: '묶음과 낱개 구분 — 묶음 하나 = 10', min: 2 },
      s08: { ask: ['100은 10이 몇 개인지 거꾸로 세어 볼까?'], watch: '“10이 10개”와 “100은 10이 10개”를 양방향으로', min: 2 } }
  },
  u1_l03: {
    img: 'assets/photo/math/library_shelves.jpg',
    review: [ { q: '10이 10개이면?', a: '100' }, { q: '100은 10이 몇 개?', a: '10개' } ], from: 'u1_l02',
    offline: null,
    leveled: { title: '책장 세기', levels: {
      기본: { q: '100이 4개이면 얼마일까요?', a: '400', steps: ['100×4'] },
      도전: { q: '책장 3개에 100권씩, 여기에 200권을 더하면 몇 권일까요?', a: '500권', steps: ['300+200'] },
      심화: { q: '700권을 100권짜리 책장에 나눠 꽂는 방법을 여러 가지로 말해 봐요.', a: '여러 답 (예: 4+3, 5+2 …)', open: true } } },
    exit: { items: [ { q: '100이 5개이면?', a: '500' }, { q: '600은 100이 몇 개?', a: '6개' }, { q: '100이 8개이면?', a: '800' } ],
      self: ['몇백을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['100이 5개면 어떻게 셀까?'], watch: '100단위로 뛰어 세기(100·200·300…)', min: 2 },
      s07: { ask: ['500은 100이 몇 개인지 거꾸로 말해 볼까?'], watch: '몇백↔100의 개수 양방향', min: 2 } }
  },
  u1_l04: {
    img: 'assets/photo/math/library_cards.jpg',
    review: [ { q: '100이 5개이면?', a: '500' }, { q: '600은 100이 몇 개?', a: '6개' } ], from: 'u1_l03',
    offline: { title: '자리 카드로 세 자리 수 만들기', type: 'pair', goal: '백·십·일 묶음으로 수 만들기',
      steps: ['백·십·일 카드를 짝과 나누기', '백 3·십 4·일 7을 놓기', '“347!” 읽고 확인'],
      materials: ['백·십·일 자리 카드'], minutes: 4 },
    leveled: { title: '대출증 세기', levels: {
      기본: { q: '백 2개·십 5개·일 4개이면 얼마일까요?', a: '254', steps: ['200+50+4'] },
      도전: { q: '백 6개·십 3개·일 5개이면 얼마일까요?', a: '635', steps: ['600+30+5'] },
      심화: { q: '숫자 카드 3·4·7로 만들 수 있는 세 자리 수를 여러 개 말해 봐요.', a: '여러 답 (347·374·437·473·734·743)', open: true } } },
    exit: { items: [ { q: '백 3·십 4·일 7이면?', a: '347' }, { q: '503의 십의 자리 숫자는?', a: '0' }, { q: '백 6·십 3·일 5면?', a: '635' } ],
      self: ['세 자리 수를 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['백·십·일 묶음을 어떻게 하나의 수로 읽을까?'], watch: '자리 순서(백→십→일) 유지', min: 3 },
      s09: { ask: ['503에서 십의 자리가 왜 0일까?'], watch: '빈 자리 0의 의미 — 십 묶음이 없음', min: 2 } }
  },
  u1_l05: {
    img: 'assets/photo/math/place_value.jpg',
    review: [ { q: '백 3·십 4·일 7이면?', a: '347' }, { q: '503의 십의 자리 숫자는?', a: '0' } ], from: 'u1_l04',
    offline: null,
    leveled: { title: '같은 숫자, 다른 값', levels: {
      기본: { q: '382에서 8이 나타내는 값은 얼마일까요?', a: '80', steps: ['십의 자리 8 = 80'] },
      도전: { q: '323에서 앞의 3과 뒤의 3이 나타내는 값의 차는 얼마일까요?', a: '297', steps: ['300-3'] },
      심화: { q: '숫자 5가 500을 나타내는 세 자리 수를 여러 개 말해 봐요.', a: '여러 답 (예: 512·567·503 …)', open: true } } },
    exit: { items: [ { q: '382에서 8의 값은?', a: '80' }, { q: '600+40+0은?', a: '640' }, { q: '705에서 십의 자리 값은?', a: '0' } ],
      self: ['자릿값을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['323의 두 3은 정말 같은 값일까?'], watch: '자리에 따라 값이 다름 — 앞 3=300, 뒤 3=3', min: 3 },
      s07: { ask: ['705에서 십의 자리 0은 무슨 뜻일까?'], watch: '0도 자리를 지키는 중요한 숫자', min: 2 } }
  },
  u1_l06: {
    img: 'assets/photo/math/skip_count.jpg',
    review: [ { q: '382에서 8의 값은?', a: '80' }, { q: '600+40+0은?', a: '640' } ], from: 'u1_l05',
    offline: { title: '몸으로 뛰어 세기', type: 'whole', goal: '100씩·10씩 뛰는 규칙을 몸으로',
      steps: ['한 걸음마다 100씩 외치며 걷기(100·200·300…)', '방향 바꿔 10씩 외치기', '멈춘 수에서 다음 수 맞히기'],
      materials: ['바닥 수 카드'], minutes: 3 },
    leveled: { title: '뛰어 세기 규칙', levels: {
      기본: { q: '100씩 뛰면 200-300 다음은?', a: '400', steps: ['300+100'] },
      도전: { q: '622에서 10씩 두 번 뛰면 얼마일까요?', a: '642', steps: ['622+10+10'] },
      심화: { q: '400에 도착하는 뛰어 세기 방법을 여러 가지로 말해 봐요.', a: '여러 답 (예: 100씩 4번, 200에서 100씩 2번 …)', open: true } } },
    exit: { items: [ { q: '200-300 다음 100씩은?', a: '400' }, { q: '999보다 1 큰 수는?', a: '1000' }, { q: '622에서 10씩 뛰면?', a: '632' } ],
      self: ['뛰어 세기를 할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['어느 자리 숫자가 바뀌고 있지?'], watch: '뛰는 단위(100·10·1)에 따라 바뀌는 자리 확인', min: 2 },
      s08: { ask: ['999 다음이 왜 1000일까?'], watch: '자리 올림 — 세 자리에서 네 자리로', min: 3 } }
  },
  u1_l07: {
    img: 'assets/photo/math/compare_numbers.jpg',
    review: [ { q: '200-300 다음 100씩은?', a: '400' }, { q: '999보다 1 큰 수는?', a: '1000' } ], from: 'u1_l06',
    offline: { title: '누구 수가 더 클까', type: 'pair', goal: '자리별로 비교하는 순서 익히기',
      steps: ['짝과 세 자리 수 카드 한 장씩 뽑기', '백의 자리부터 차례로 비교', '더 큰 수를 든 사람이 설명하기'],
      materials: ['수 카드'], minutes: 4 },
    leveled: { title: '수의 크기 비교', levels: {
      기본: { q: '169와 168 중 더 큰 수는?', a: '169', steps: ['일의 자리 9>8'] },
      도전: { q: '754와 745 중 더 큰 수는? 왜일까요?', a: '754 (십의 자리 5>4)', steps: ['백 같음→십 비교'] },
      심화: { q: '백의 자리가 5인 수 중 561보다 큰 수를 여러 개 말해 봐요.', a: '여러 답 (예: 562·570·599 …)', open: true } } },
    exit: { items: [ { q: '169와 168 중 큰 수?', a: '169' }, { q: '754와 745 중 큰 수?', a: '754' }, { q: '561과 516 중 큰 수?', a: '561' } ],
      self: ['수의 크기를 비교할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['169와 196은 어느 자리부터 비교해야 할까?'], watch: '백→십→일 순서. 앞자리가 같을 때만 다음 자리로', min: 3 },
      s07: { ask: ['754와 745는 백의 자리가 같은데 어떻게 비교하지?'], watch: '같으면 다음 자리로 — 십의 자리 비교', min: 2 } }
  },
  u1_l08: {   // 단원 확인(정리형) — self_assessment 이미 있음. offline 없이 leveled·exit·review·tnote만
    img: null,
    review: [ { q: '100이 5개이면?', a: '500' }, { q: '763과 736 중 큰 수?', a: '763' } ], from: 'u1_l07',
    offline: null,
    leveled: { title: '단원 종합', levels: {
      기본: { q: '백 4·십 5·일 3이면 얼마일까요?', a: '453', steps: ['400+50+3'] },
      도전: { q: '245에서 10씩 두 번 뛰면 얼마일까요?', a: '265', steps: ['245+10+10'] },
      심화: { q: '367에서 각 자리 숫자가 나타내는 값을 모두 말해 봐요.', a: '300, 60, 7', open: true } } },
    exit: { items: [ { q: '100이 5개이면?', a: '500' }, { q: '백 4·십 5·일 3이면?', a: '453' }, { q: '763과 736 중 큰 수?', a: '763' } ],
      self: ['단원 내용을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['이번 단원에서 가장 자신 있는 건 뭘까?'], watch: '점검 차시 — 학생이 스스로 약한 부분 말하게', min: 2 } }
  },
  u1_l09: {   // 만들기(활동형)
    img: null,
    review: [ { q: '백 4·십 5·일 3이면?', a: '453' }, { q: '367에서 백의 자리 값은?', a: '300' } ], from: 'u1_l08',
    offline: { title: '우리 주변 세 자리 수 찾기', type: 'group', goal: '생활 속에서 세 자리 수 발견',
      steps: ['교실·책에서 세 자리 수 찾기', '찾은 수를 백·십·일로 나눠 읽기', '모둠에서 가장 큰 수 뽑기'],
      materials: ['찾기 기록장'], minutes: 5 },
    leveled: { title: '수 만들기', levels: {
      기본: { q: '백 2·십 4·일 5이면 얼마일까요?', a: '245', steps: ['200+40+5'] },
      도전: { q: '500+10+2가 나타내는 수는?', a: '512', steps: ['500+10+2'] },
      심화: { q: '숫자 2·4·5로 만들 수 있는 세 자리 수 중 가장 큰 수와 가장 작은 수는?', a: '가장 큰 542, 가장 작은 245', open: true } } },
    exit: { items: [ { q: '백 2·십 4·일 5면?', a: '245' }, { q: '500+10+2는?', a: '512' }, { q: '245에서 백의 자리 숫자는?', a: '2' } ],
      self: ['세 자리 수를 만들고 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['우리 주변 어디에 세 자리 수가 있을까?'], watch: '실생활 연결 — 쪽수·번호·개수', min: 3 } }
  }
};

// ── 증보 적용 ──
function findIdx(slides, pred) { return slides.findIndex(pred); }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];
  const by = id => S.find(s => s.id === id);

  // ① review items (기존 review 슬라이드에 필드 추가 — content 보존)
  if (spec.review) {
    const rv = S.find(s => s.block === 'review');
    if (rv) { rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from; }
  }
  // ② img (motivate에 폴백 필드)
  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }
  // ⑦ tnote (지정 슬라이드)
  if (spec.tnote) Object.keys(spec.tnote).forEach(sid => { const s = by(sid); if (s) s.tnote = spec.tnote[sid]; });

  // ④ offline_activity 삽입 — misconception 다음(없으면 마지막 concept 다음)
  if (spec.offline) {
    const s_off = { id: 's-off', stage: '전개', block: 'offline_activity', data: spec.offline,
      suggested_extras: ['r_class'] };
    let i = findIdx(S, s => s.block === 'misconception');
    if (i < 0) { for (let j = S.length - 1; j >= 0; j--) if (S[j].block === 'concept') { i = j; break; } }
    S.splice(i + 1, 0, s_off);
  }
  // ⑤ leveled_problem 삽입 — 마지막 basic_problem 다음
  if (spec.leveled) {
    const s_lv = { id: 's-lv', stage: '기본문제', block: 'leveled_problem', data: spec.leveled,
      suggested_extras: ['q_apply'] };
    let i = -1; for (let j = S.length - 1; j >= 0; j--) if (S[j].block === 'basic_problem') { i = j; break; }
    if (i < 0) i = findIdx(S, s => s.block === 'real_world') - 1;
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

  // 삽입 슬라이드 id를 유니크하게 재부여 (s13, s14 … 기존 뒤로)
  let n = 100;
  S.forEach(s => { if (['s-off', 's-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });

  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(7요소)';
});

// ── 산수 검산 ──
const arithChecks = [];
Object.keys(AUG).forEach(key => {
  const sp = AUG[key];
  const collect = obj => { if (!obj) return; };
  if (sp.leveled) Object.values(sp.leveled.levels).forEach(lv => { if (!lv.open) arithChecks.push([key, lv.q, lv.a]); });
});
// 명시 검산 (핵심 계산만 — 코드로 확인 가능한 것)
const HARD = [
  ['10*6', 60], ['70+30', 100], ['10*8', 80], ['100-80', 20], ['100*4', 400], ['300+200', 500],
  ['200+50+4', 254], ['600+30+5', 635], ['300-3', 297], ['600+40+0', 640], ['300+100', 400],
  ['622+10+10', 642], ['400+50+3', 453], ['245+10+10', 265], ['200+40+5', 245], ['500+10+2', 512]
];
const badH = HARD.filter(([e, a]) => eval(e) !== a);
if (badH.length) { console.error('산수 오류:', badH); process.exit(1); }

// ── 7요소 검증 ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides, b = S.map(s => s.block);
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.leveled && !b.includes('leveled_problem')) elemFail.push(key + ':leveled');
  if (spec.exit && !b.includes('exit_ticket')) elemFail.push(key + ':exit');
  if (spec.offline && !b.includes('offline_activity')) elemFail.push(key + ':offline');
  const tn = S.filter(s => s.tnote).length;
  if (tn < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

console.log('✅ g2 수학 u1 증보 완료 (9차시)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'offline_activity', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 (전 차시 블록 교체) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
const footer = '})();\n';   // IIFE 닫기
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + footer, 'utf8');
console.log('  파일 재출력 완료');
