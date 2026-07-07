/* augment_g2_math_u3.js — L3 증보(g2 수학 3단원 「덧셈과 뺄셈」).
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + tnote/img/items/from 필드 추가만.
   서사(③): 곰이·펭이 — 물고기·구슬·책·딱지·색종이·도토리·사과·사탕·재활용 소재로 전 차시 일관.
   범위: l03·l05는 이미 증보(골든·기증보)이므로 AUG에서 제외 → 나머지 10차시만.
   각 차시 증보 데이터 정의 → 삽입 → 산수 검산 → 파일 재출력. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_math_u3.js');

global.window = {};
require('./g2_math_u3.js');
const L = window.LESSONS;

const SELF_TAIL = ['조금 헷갈려요', '다시 배우고 싶어요'];

/* 차시별 증보 스펙.
   review: 전시학습 문항 2~3(from=이전차시). img: 폴백 경로. offline: 활동 소지 차시만.
   leveled: 기본·도전·심화. exit: 확인3+신호등. tnote: 슬라이드 id별. */
const AUG = {
  u3_l01: {
    img: 'assets/photo/math/fish_basket.jpg',
    review: null, from: null,   // 단원 첫 차시 = 전시학습 없음
    offline: { title: '모으기·덜어내기 몸으로', type: 'pair', goal: '모으면 덧셈, 덜면 뺄셈임을 손으로',
      steps: ['짝과 바둑돌을 나눠 갖기', '두 손을 모아 합치기(＝덧셈)', '한 줌 덜어내기(＝뺄셈)'],
      materials: ['바둑돌'], minutes: 3 },
    leveled: { title: '물고기 세기', levels: {
      기본: { q: '물고기 12마리에 6마리를 더 잡으면 몇 마리일까요?', a: '18마리', steps: ['12+6'] },
      도전: { q: '물고기 25마리 중 8마리를 놓아주면 몇 마리 남을까요?', a: '17마리', steps: ['25-8'] },
      심화: { q: '물고기 20마리를 두 통에 나눠 담는 방법을 여러 가지로 말해 봐요.', a: '여러 답 (예: 10+10, 12+8 …)', open: true } } },
    exit: { items: [ { q: '13+5는?', a: '18' }, { q: '16-4는?', a: '12' }, { q: '24+13은?', a: '37' } ],
      self: ['모으기·덜기를 식으로 쓸 수 있어요', ...SELF_TAIL] },
    tnote: { s03: { ask: ['모으는 건 덧셈일까 뺄셈일까?', '덜어내면 어느 쪽일까?'], watch: '상황을 식으로 옮기게 — 모으기＝＋, 덜기＝－', min: 3 },
      s07: { ask: ['13에 5를 더하면 왜 18일까?'], watch: '이어 세기(13→14…18)로 확인', min: 2 } }
  },
  u3_l02: {
    img: 'assets/photo/math/marbles.jpg',
    review: [ { q: '13+5는?', a: '18' }, { q: '24+13은?', a: '37' } ], from: 'u3_l01',
    offline: { title: '10 만들어 더하기', type: 'pair', goal: '가르기로 10을 먼저 만들기',
      steps: ['구슬 18개와 5개를 놓기', '5를 2와 3으로 가르기', '18+2=20, 20+3=23 확인'],
      materials: ['구슬'], minutes: 3 },
    leveled: { title: '구슬 더하기', levels: {
      기본: { q: '17 + 6 은 얼마일까요?', a: '23', steps: ['17+3=20', '20+3'] },
      도전: { q: '28 + 7 은 얼마일까요?', a: '35', steps: ['28+2=30', '30+5'] },
      심화: { q: '□ + 7 = 32 가 되는 □를 찾고, 어떻게 생각했는지 말해 봐요.', a: '25 (32-7)', open: true } } },
    exit: { items: [ { q: '18+5는?', a: '23' }, { q: '25+7은?', a: '32' }, { q: '38+5는?', a: '43' } ],
      self: ['받아올림 있는 덧셈을 할 수 있어요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['10을 먼저 만들면 왜 더 쉬울까?'], watch: '가르기로 10 채우기 — 몇을 더 줘야 10이 될까', min: 2 },
      s06: { ask: ['7+6을 1713처럼 이어 붙이면 왜 안 될까?'], watch: '자리값 — 일의 자리끼리만 더함', min: 2 } }
  },
  u3_l04: {
    img: 'assets/photo/math/books_stack.jpg',
    review: [ { q: '25+7은?', a: '32' }, { q: '38+5는?', a: '43' } ], from: 'u3_l03',
    offline: { title: '세로셈 자리 맞추기', type: 'pair', goal: '십은 십끼리, 일은 일끼리',
      steps: ['58과 46 수 카드를 놓기', '일의 자리끼리 세로로 맞추기', '십의 자리끼리 맞춰 더하기'],
      materials: ['수 카드'], minutes: 3 },
    leveled: { title: '책 세기', levels: {
      기본: { q: '47 + 38 은 얼마일까요?', a: '85', steps: ['7+8=15', '40+30+10'] },
      도전: { q: '66 + 57 은 얼마일까요?', a: '123', steps: ['6+7=13', '60+50+10'] },
      심화: { q: '더해서 100이 넘는 두 자리 수 짝을 여러 개 말해 봐요.', a: '여러 답 (예: 58+46, 70+35 …)', open: true } } },
    exit: { items: [ { q: '58+46은?', a: '104' }, { q: '75+74는?', a: '149' }, { q: '68+59는?', a: '127' } ],
      self: ['세로셈으로 두 자리 수를 더할 수 있어요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['자리를 안 맞추고 쓰면 무엇이 잘못될까?'], watch: '일·십 세로 정렬 확인', min: 2 },
      s05: { ask: ['합이 100을 넘으면 백의 자리는 어디서 올까?'], watch: '십의 자리 합이 10 넘으면 백으로 올림', min: 2 } }
  },
  u3_l06: {
    img: 'assets/photo/math/ttakji.jpg',
    review: [ { q: '25-8은?', a: '17' }, { q: '32-15는?', a: '17' } ], from: 'u3_l05',
    offline: { title: '딱지 덜어내기', type: 'group', goal: '십에서 10을 빌려 빼기',
      steps: ['딱지 42장을 놓기', '일의 자리 2에서 9를 못 빼면 십에서 10 빌리기', '12-9=3, 남은 십 2개 → 23 확인'],
      materials: ['딱지'], minutes: 3 },
    leveled: { title: '딱지 빼기', levels: {
      기본: { q: '51 - 24 는 얼마일까요?', a: '27', steps: ['십에서 빌리기', '11-4=7'] },
      도전: { q: '83 - 46 은 얼마일까요?', a: '37', steps: ['십에서 빌리기', '13-6=7'] },
      심화: { q: '□ - 19 = 23 이 되는 □를 찾고, 방법을 말해 봐요.', a: '42 (23+19)', open: true } } },
    exit: { items: [ { q: '42-19는?', a: '23' }, { q: '45-28은?', a: '17' }, { q: '63-27은?', a: '36' } ],
      self: ['받아내림 있는 뺄셈을 할 수 있어요', ...SELF_TAIL] },
    tnote: { s05: { ask: ['십에서 10을 빌리면 십의 자리는 어떻게 될까?'], watch: '빌린 뒤 십의 자리 1 줄이기 잊지 않기', min: 3 },
      s06: { ask: ['빌려 놓고 십의 자리를 안 줄이면 무엇이 잘못될까?'], watch: '받아내림 표시로 확인', min: 2 } }
  },
  u3_l07: {
    img: 'assets/photo/math/colored_paper.jpg',
    review: [ { q: '42-19는?', a: '23' }, { q: '63-27은?', a: '36' } ], from: 'u3_l06',
    offline: { title: '뺄셈을 덧셈으로 확인', type: 'pair', goal: '뺀 값을 다시 더해 맞나 확인',
      steps: ['65-18=47 세로셈으로 풀기', '답 47에 18을 더하기', '47+18=65면 맞음 확인'],
      materials: ['색종이 수 카드'], minutes: 3 },
    leveled: { title: '색종이 빼기', levels: {
      기본: { q: '52 - 7 은 얼마일까요?', a: '45', steps: ['십에서 빌리기', '12-7=5'] },
      도전: { q: '74 - 29 는 얼마일까요?', a: '45', steps: ['십에서 빌리기', '14-9=5'] },
      심화: { q: '답이 45가 되는 (두 자리 수)-(두 자리 수)를 여러 개 말해 봐요.', a: '여러 답 (예: 74-29, 63-18 …)', open: true } } },
    exit: { items: [ { q: '23-4는?', a: '19' }, { q: '65-18은?', a: '47' }, { q: '81-37은?', a: '44' } ],
      self: ['세로셈으로 뺄 수 있어요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['일의 자리 3에서 4를 못 빼면 어떻게 할까?'], watch: '거꾸로 빼지 않게 — 십에서 빌리기', min: 3 },
      s05: { ask: ['뺄셈이 맞는지 어떻게 확인할까?'], watch: '답＋빼는 수＝처음 수', min: 2 } }
  },
  u3_l08: {
    img: 'assets/photo/math/acorns.jpg',
    review: [ { q: '65-18은?', a: '47' }, { q: '81-37은?', a: '44' } ], from: 'u3_l07',
    offline: { title: '세 수 앞에서부터', type: 'group', goal: '앞 두 수 먼저, 그다음 셋째',
      steps: ['도토리로 24+17 먼저 모으기(41)', '거기서 19를 덜어내기', '남은 22 확인'],
      materials: ['도토리 모형'], minutes: 3 },
    leveled: { title: '도토리 계산', levels: {
      기본: { q: '30 + 15 - 20 을 차례대로 구해요.', a: '25', steps: ['30+15=45', '45-20'] },
      도전: { q: '52 - 18 + 26 을 차례대로 구해요.', a: '60', steps: ['52-18=34', '34+26'] },
      심화: { q: '세 수 45, 27, 19로 답이 53이 되는 식을 만들어 봐요.', a: '45+27-19=53', open: true } } },
    exit: { items: [ { q: '24+17-19는?', a: '22' }, { q: '28+25-36은?', a: '17' }, { q: '42-15+27은?', a: '54' } ],
      self: ['세 수를 차례대로 계산할 수 있어요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['세 수는 어느 쪽부터 계산할까?'], watch: '앞에서부터 차례대로 ①②', min: 3 },
      s06: { ask: ['뒤부터 계산하면 왜 답이 달라질까?'], watch: '앞에서부터 순서 지키기', min: 2 } }
  },
  u3_l09: {
    img: 'assets/photo/math/apples.jpg',
    review: [ { q: '24+17-19는?', a: '22' }, { q: '42-15+27은?', a: '54' } ], from: 'u3_l08',
    offline: { title: '전체와 부분 가족', type: 'pair', goal: '덧셈식 하나로 뺄셈식 둘 만들기',
      steps: ['사과 부분 8·부분 5를 놓기', '모으면 전체 13 (8+5=13)', '전체에서 한 부분 덜기 (13-8=5, 13-5=8)'],
      materials: ['사과 모형'], minutes: 3 },
    leveled: { title: '사과 식 가족', levels: {
      기본: { q: '부분 6과 부분 7을 모으면 전체는?', a: '13', steps: ['6+7'] },
      도전: { q: '9 + □ = 16 이면 16 - 9 는?', a: '7', steps: ['16-9'] },
      심화: { q: '전체 14로 만들 수 있는 덧셈식·뺄셈식을 여러 개 말해 봐요.', a: '여러 답 (예: 6+8=14, 14-8=6 …)', open: true } } },
    exit: { items: [ { q: '부분 8과 5를 모으면?', a: '13' }, { q: '전체 15, 한 부분 9면 다른 부분은?', a: '6' }, { q: '7+8=15면 15-8은?', a: '7' } ],
      self: ['덧셈식과 뺄셈식의 관계를 알아요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['전체와 부분은 어떻게 다를까?'], watch: '전체 하나에 부분 둘', min: 2 },
      s05: { ask: ['덧셈식 하나에서 뺄셈식이 왜 둘이 나올까?'], watch: '전체-부분＝다른 부분', min: 3 } }
  },
  u3_l10: {
    img: 'assets/photo/math/candies.jpg',
    review: [ { q: '부분 8과 5를 모으면?', a: '13' }, { q: '7+8=15면 15-8은?', a: '7' } ], from: 'u3_l09',
    offline: { title: '□ 저울 맞추기', type: 'pair', goal: '양쪽을 같게 만드는 □ 찾기',
      steps: ['왼쪽에 5개, 오른쪽에 9개 놓기', '왼쪽에 몇 개 더 놓아야 같아질까 세기', '5+4=9 → □=4 확인'],
      materials: ['바둑돌', '간이 저울판'], minutes: 4 },
    leveled: { title: '□ 찾기', levels: {
      기본: { q: '6 + □ = 14 에서 □는?', a: '8', steps: ['14-6'] },
      도전: { q: '□ - 9 = 16 에서 □는?', a: '25', steps: ['16+9'] },
      심화: { q: '□가 7이 되는 식을 덧셈으로 하나, 뺄셈으로 하나 만들어 봐요.', a: '여러 답 (예: 3+□=10, □-5=2)', open: true } } },
    exit: { items: [ { q: '5+□=9에서 □는?', a: '4' }, { q: '13-□=8에서 □는?', a: '5' }, { q: '□-7=8에서 □는?', a: '15' } ],
      self: ['□의 값을 구할 수 있어요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['모르는 수를 무엇으로 나타낼까?'], watch: '□＝모르는 수, 거꾸로 계산으로 찾기', min: 3 },
      s06: { ask: ['12-□=9에서 왜 12+9가 아닐까?'], watch: '□ 위치에 따라 더하기/빼기가 달라짐', min: 3 } }
  },
  u3_l11: {
    img: 'assets/photo/math/recycle.jpg',
    review: [ { q: '5+□=9에서 □는?', a: '4' }, { q: '□-7=8에서 □는?', a: '15' } ], from: 'u3_l10',
    offline: null,   // 단원 평가 = 활동 없이 점검
    leveled: { title: '단원 도전 문제', levels: {
      기본: { q: '54 + 38 은 얼마일까요?', a: '92', steps: ['4+8=12', '50+30+10'] },
      도전: { q: '72 - 45 + 18 을 차례대로 구해요.', a: '45', steps: ['72-45=27', '27+18'] },
      심화: { q: '답이 40이 되는, 덧셈·뺄셈이 섞인 세 수 식을 만들어 봐요.', a: '여러 답 (예: 25+30-15=40)', open: true } } },
    exit: { items: [ { q: '47+28은?', a: '75' }, { q: '63-27은?', a: '36' }, { q: '□+8=15에서 □는?', a: '7' } ],
      self: ['단원 내용을 스스로 점검했어요', ...SELF_TAIL] },
    tnote: { s03: { ask: ['이번 단원에서 가장 자신 있는 건 무엇일까?'], watch: '네 영역(덧셈·뺄셈·세 수·□) 스스로 점검', min: 2 } }
  },
  u3_l12: {
    img: 'assets/photo/math/recycle_craft.jpg',
    review: [ { q: '47+28은?', a: '75' }, { q: '28+35-19는?', a: '44' } ], from: 'u3_l11',
    offline: { title: '재활용품 작품 세기', type: 'group', goal: '모으기(덧셈)·차이(뺄셈)를 작품으로',
      steps: ['모둠이 모은 병뚜껑 세기', '두 모둠 것을 모으기(덧셈)', '더 많은 쪽이 몇 개 더인지 빼기(뺄셈)'],
      materials: ['병뚜껑'], minutes: 4 },
    leveled: { title: '작품 재료 계산', levels: {
      기본: { q: '빨강 26개와 파랑 18개이면 모두 몇 개?', a: '44', steps: ['26+18'] },
      도전: { q: '곰이 52개, 펭이 35개이면 곰이가 몇 개 더 썼을까요?', a: '17', steps: ['52-35'] },
      심화: { q: '모두 80개가 되도록 두 사람이 나눠 쓰는 방법을 여러 가지로 말해 봐요.', a: '여러 답 (예: 40+40, 55+25 …)', open: true } } },
    exit: { items: [ { q: '23+19는?', a: '42' }, { q: '45-28은?', a: '17' }, { q: '38+47은?', a: '85' } ],
      self: ['모으기와 차이를 구분해 쓸 수 있어요', ...SELF_TAIL] },
    tnote: { s04: { ask: ['모두 몇 개인지 구할 때는 무엇을 쓸까?'], watch: '모으기＝덧셈', min: 2 },
      s06: { ask: ['몇 개 더 많은지 구할 때 왜 더하면 안 될까?'], watch: '차이＝뺄셈', min: 2 } }
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

  // 삽입 슬라이드 id를 유니크하게 재부여
  let n = 100;
  S.forEach(s => { if (['s-off', 's-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });

  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(7요소)';
});

// ── 산수 검산 (leveled 기본·도전 핵심 계산) ──
const HARD = [
  ['12+6', 18], ['25-8', 17], ['17+6', 23], ['28+7', 35], ['47+38', 85], ['66+57', 123],
  ['51-24', 27], ['83-46', 37], ['52-7', 45], ['74-29', 45], ['30+15-20', 25], ['52-18+26', 60],
  ['6+7', 13], ['16-9', 7], ['14-6', 8], ['16+9', 25], ['54+38', 92], ['72-45+18', 45],
  ['26+18', 44], ['52-35', 17]
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

console.log('✅ g2 수학 u3 증보 완료 (' + Object.keys(AUG).length + '차시 — l03·l05 골든 제외)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'offline_activity', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 (전 차시 블록 교체 — IIFE 보존) ──
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
