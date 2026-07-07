/* golden_augment.js — L1 골든: u3_l05를 40분 표준 7요소 시연본으로 증보.
   원칙(설계 §6): 기존 슬라이드 본문 diff 0. 신규 슬라이드 삽입 + tnote/img 필드 추가만.
   증보 결과를 g2_math_u3.js 파일 내 u3_l05 블록만 교체해 재출력. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_math_u3.js');

// 원본 로드
global.window = {};
require('./g2_math_u3.js');
const L = window.LESSONS['u3_l05'];
const S = L.slides;

// id로 슬라이드 찾기
const by = id => S.find(s => s.id === id);

// ── 1) 기존 슬라이드에 tnote/img 필드만 추가 (본문 data 불변) ──
// ① review 문항형 확장: 기존 content는 보존하되 items 추가(하위호환 — 둘 다 렌더)
by('s02').data.items = [
  { q: '27 + 5 = ?', a: '32' },
  { q: '받아올림은 어느 자리로 올려요?', a: '십의 자리로 1' }
];
by('s02').data.from = 'u3_l04';
by('s02').tnote = { ask: ['어제 받아올림에서 1을 어디로 올렸지?', '올림과 내림은 반대말일까?'], watch: '받아올림·받아내림 혼동. 방향(위로/아래로)을 손으로 짚어 확인', min: 3 };

// ② motivate 이미지 필드(폴백) + 서사 발문
by('s03').data.img = 'assets/photo/math/candy_share.jpg';
by('s03').tnote = { ask: ['3에서 5를 빼려니 왜 막힐까?', '없으면 어디서 빌려올 수 있을까?'], watch: '“못 빼요”에서 멈추지 않게 — 빌려오기(받아내림)로 자연스럽게 유도', min: 4 };

// concept 발문
by('s04').tnote = { ask: ['23을 20과 3으로 나누면 왜 편할까?'], watch: '가르기가 목적이 아니라 “빼기 쉬운 모양 만들기”가 목적', min: 2 };
by('s06').tnote = { ask: ['5-3=2로 거꾸로 빼면 답이 왜 이상해질까?'], watch: '가장 흔한 오류 — 큰 수에서 작은 수만 빼려는 습관. 십 배열로 반증', min: 3 };

// ── 2) 신규 슬라이드 삽입 ──
// ④ offline_activity — misconception(s06) 다음, 기본문제 앞
const s_offline = {
  id: 's06b', stage: '전개', block: 'offline_activity',
  data: {
    title: '짝과 받아내림 만들기', type: 'pair',
    goal: '십을 “풀어” 빼는 과정을 손으로',
    steps: ['10개 묶음 카드 1장 + 낱개 3장을 짝과 놓기', '“3에서 5 못 빼!” → 묶음 하나를 낱개 10개로 풀기', '이제 13에서 5 빼서 8, 십은 1 남아 18 확인'],
    materials: ['십 묶음 카드', '낱개 카드'], minutes: 4
  },
  tnote: { ask: ['묶음을 풀었더니 낱개가 몇 개가 됐지?'], watch: '“푼다=10을 낱개로 바꾼다”를 말로 표현하게. 조작만 하고 말 안 하는 학생 주의', min: 4 },
  suggested_extras: ['r_class']
};

// ⑤ leveled_problem — 기본문제 3개(s07~09) 다음, real_world 앞
const s_leveled = {
  id: 's09b', stage: '기본문제', block: 'leveled_problem',
  data: {
    title: '사탕 가게 받아내림',
    levels: {
      기본: { q: '25 - 6 = ?', a: '19', steps: ['25-5=20', '20-1=19'] },
      도전: { q: '곰이가 사탕 34개 중 8개를 나눠 줬어요. 남은 사탕은?', a: '26개', steps: ['34-4=30', '30-4=26'] },
      심화: { q: '사탕 42개를 두 친구에게 나눠 줬더니 27개가 남았어요. 몇 개를 줬을까요? 나눠 주는 방법을 여러 가지로 말해 봐요.', a: '15개 (예: 7개+8개, 5개+10개 …)', open: true }
    },
    note: '기본→도전→심화로 갈수록 “상황 속 받아내림”으로 넓혀요.'
  },
  tnote: { ask: ['심화 문제는 답이 하나뿐일까?', '다르게 나눠도 15개가 되는 방법은?'], watch: '심화는 정답 수렴이 목적 아님 — 여러 조합을 발표시키기', min: 5 },
  suggested_extras: ['q_apply']
};

// ⑥ exit_ticket — summary(s11) 앞
const s_exit = {
  id: 's10b', stage: '정리', block: 'exit_ticket',
  data: {
    title: '오늘 확인해요',
    items: [
      { q: '23 - 5 = ?', a: '18' },
      { q: '일의 자리에서 못 빼면 어떻게 해요?', a: '십의 자리에서 10을 빌려와요(받아내림)' },
      { q: '41 - 6 = ?', a: '35' }
    ],
    self: ['받아내림을 설명할 수 있어요', '조금 헷갈려요', '다시 한 번 배우고 싶어요']
  },
  tnote: { ask: [], watch: '신호등은 손들기용 — 🔴 든 학생 수만 눈으로 세고 다음 차시 도입에서 보충', min: 3 },
  suggested_extras: ['q_reflect']
};

// summary·next_lesson 발문
by('s11').tnote = { ask: ['오늘 두 가지 방법 중 어떤 게 더 편했어?'], watch: '방법 우열이 아니라 “문제에 따라 골라 쓴다”로 정리', min: 2 };

// ── 삽입 (역순으로 넣어 인덱스 안정) ──
function insertAfter(id, slide) {
  const i = S.findIndex(s => s.id === id);
  S.splice(i + 1, 0, slide);
}
insertAfter('s06', s_offline);   // 오프라인 활동
insertAfter('s09', s_leveled);   // 수준별
insertAfter('s10', s_exit);      // 출구(응용 다음, 요약 앞) — real_world=s10

// meta 갱신 (골든 표식)
L.meta.lesson_format = '교사주도 골든(40분 표준 7요소 시연) — 받아내림 여러 방법 + 수준별·활동·출구·발문';
L.meta.golden = true;

// ── 검증: 산수 검산 ──
const arith = [
  ['27+5', 32], ['25-6', 19], ['34-8', 26], ['42-27', 15],
  ['23-5', 18], ['41-6', 35], ['32-7', 25], ['53-7', 46], ['62-8', 54]
];
let bad = arith.filter(([e, a]) => eval(e) !== a);
if (bad.length) { console.error('산수 오류:', bad); process.exit(1); }

// ── 7요소 존재 검증 ──
const blocks = S.map(s => s.block);
const need7 = {
  '①review문항': S.some(s => s.block === 'review' && s.data.items),
  '②img': S.some(s => s.block === 'motivate' && s.data.img),
  '③서사(theme 인물 재등장)': /곰이|펭이/.test(JSON.stringify(S)),
  '④offline_activity': blocks.includes('offline_activity'),
  '⑤leveled_problem': blocks.includes('leveled_problem'),
  '⑥exit_ticket': blocks.includes('exit_ticket'),
  '⑦tnote': S.filter(s => s.tnote).length >= 6
};
const missing = Object.entries(need7).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) { console.error('7요소 누락:', missing); process.exit(1); }

console.log('✅ 골든 증보 완료');
console.log('  슬라이드:', S.length, '(', blocks.join(' → '), ')');
console.log('  tnote 슬라이드:', S.filter(s => s.tnote).length);
console.log('  7요소:', Object.keys(need7).join(' '));

// ── 파일 재출력: u3_l05 블록만 교체 ──
const src = fs.readFileSync(FILE, 'utf8');
const startMarker = '  window.LESSONS["u3_l05"] =';
const nextMarker = '  window.LESSONS["u3_l06"] =';
const iStart = src.indexOf(startMarker);
const iNext = src.indexOf(nextMarker);
if (iStart < 0 || iNext < 0) { console.error('블록 마커 못 찾음'); process.exit(1); }

// 새 블록 직렬화 (2-space indent, 기존 스타일에 맞춤)
const json = JSON.stringify(L, null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
const newBlock = `  window.LESSONS["u3_l05"] =\n  ${json};\n\n`;
const out = src.slice(0, iStart) + newBlock + src.slice(iNext);
fs.writeFileSync(FILE, out, 'utf8');
console.log('  파일 재출력 완료:', FILE);
