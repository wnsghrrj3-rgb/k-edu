/* 케이글쓰기 엔진 테스트 — node tests/test_kedu_write.js
   설계 v1 §8 G2: 밴드×유형 샘플 글, 요소 검출·색칠 대조·카드 규칙·평가 낱말 0 */
const fs = require('fs'), path = require('path');
const K = require('../kedu/write/engine.js');
const D = p => JSON.parse(fs.readFileSync(path.join(__dirname, '../kedu/write/data', p), 'utf8'));
K.init({ templates: D('templates.json'), signals: D('signals.json'), feedback: D('feedback.json') });

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('  ✗', m)); };
const eq = (a, b, m) => ok(a === b, m + ` (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);

const argueGood = `나는 초등학생도 스마트폰을 가져도 된다고 생각한다.
왜냐하면 급할 때 부모님께 바로 연락할 수 있기 때문이다. 또 모르는 것을 바로 찾아볼 수 있기 때문이다. 예를 들어 지난번에 학원이 끝나고 비가 많이 왔을 때 엄마께 전화해서 데리러 오시게 했다.
물론 게임을 너무 많이 할 수도 있다는 의견도 있지만, 시간을 정해 두면 괜찮다고 생각한다.
그래서 나는 초등학생도 스마트폰을 가져도 된다고 생각한다.`;

const argueNoReason = `나는 급식에 김치가 매일 나와야 한다고 생각한다.
김치는 맛있다. 김치는 건강에 좋다. 김치는 우리나라 음식이다.`;

const argueLow = `나는 강아지를 키우고 싶어요. 왜냐하면 강아지랑 같이 놀면 재미있기 때문이에요.`;

const argueSpoken = `나는 근데 숙제가 진짜 없어야 한다고 생각해요. 왜냐하면 숙제가 엄청 많으면 놀 시간이 없기 때문이에요.
예를 들어 어제 숙제를 하느라 축구를 못 했어요. 그래서 나는 숙제가 없으면 좋겠어요.`;

const explainGood = `연필깎이는 연필을 뾰족하게 만드는 도구이다.
연필깎이에는 손으로 돌리는 것과 전기로 움직이는 것이 있다.
사용하는 방법은 간단하다. 먼저 연필을 구멍에 넣는다. 다음으로 손잡이를 천천히 돌린다. 마지막으로 연필을 꺼내 끝을 확인한다.
이처럼 연필깎이는 쉽게 쓸 수 있는 도구이다.`;

const bookGood = `나는 「강아지똥」이라는 책을 읽었다. 이 책은 아무도 거들떠보지 않던 강아지똥이 민들레꽃을 피우는 이야기이다.
가장 기억에 남는 장면은 강아지똥이 빗물에 녹아 민들레 뿌리로 스며드는 장면이다.
나는 작고 보잘것없어 보이는 것도 소중하다는 것을 배웠다. 읽고 나서 마음이 따뜻해져서 좋았다.`;

const letterGood = `할머니께
안녕하세요, 할머니. 저 민준이에요.
지난 여름에 할머니 댁에서 옥수수를 같이 따던 일이 자꾸 생각나요. 그때 할머니가 삶아 주신 옥수수가 정말 맛있었어요.
할머니, 항상 저를 챙겨 주셔서 고마워요. 건강하세요.
민준 올림`;

const storyMid = `지난 토요일에 가족과 함께 계곡에 갔다.
먼저 텐트를 치고 점심을 먹었다. 그다음 동생과 물놀이를 했다. 마지막으로 고기를 구워 먹었다.
물이 차가워서 놀랐지만 정말 재미있었다. 다음에는 친구도 같이 가고 싶다.`;

/* --- split --- */
{
  const s = K.split('안녕? 나야. 잘 지내!\n\n둘째 문단이다.');
  eq(s.length, 4, 'split 4문장');
  eq(s[3].para, 1, 'split 문단 번호');
}

/* --- argue high good: 요소 전부 green --- */
{
  const r = K.analyze({ text: argueGood, type: 'argue', band: 6, topic: '초등학생도 스마트폰을 가져도 될까요?' });
  ['C', 'R', 'E', 'X', 'W'].forEach(c => eq(r.elements[c].status, 'green', 'argueGood ' + c));
  eq(r.topic.status, 'green', 'argueGood topic');
  ok(r.allGreen, 'argueGood allGreen');
  ok(r.topic.keywords.includes('스마트폰'), 'topic 키워드 자동 추출');
}

/* --- argue mid: 이유 없음 → R red, 카드 첫 장이 R --- */
{
  const r = K.analyze({ text: argueNoReason, type: 'argue', band: 3, keywords: ['김치'] });
  eq(r.elements.C.status, 'green', 'noReason C');
  eq(r.elements.R.status, 'red', 'noReason R red');
  eq(r.elements.W.status, 'red', 'noReason W red');
  eq(r.cards[0].code, 'R', 'noReason 첫 카드 = R');
  ok(r.cards.length <= 3, '카드 최대 3');
  ok(!r.allGreen, 'noReason not allGreen');
}

/* --- low band: 2요소만, 구어체 안 짚음, 문단 카드 없음 --- */
{
  const r = K.analyze({ text: argueLow, type: 'argue', band: 1 });
  eq(Object.keys(r.elements).sort().join(''), 'CR', 'low 요소 = C R');
  eq(r.elements.C.status, 'green', 'low C');
  eq(r.elements.R.status, 'green', 'low R');
  ok(!r.cards.some(c => c.kind === 'para'), 'low 문단 카드 없음');
  const r2 = K.analyze({ text: '나는 근데 강아지가 진짜 좋아요. 왜냐하면 귀엽기 때문이에요.', type: 'argue', band: 2 });
  ok(!r2.format.some(f => f.kind === 'spoken'), 'low 구어체 안 짚음');
}

/* --- mid: 구어체 짚음 (감점 아님, tidy) --- */
{
  const r = K.analyze({ text: argueSpoken, type: 'argue', band: 4 });
  const sp = r.format.find(f => f.kind === 'spoken');
  ok(sp && ['근데', '진짜', '엄청'].includes(sp.word), 'mid 구어체 검출');
  ok(r.cards.every(c => c.status !== 'tidy' || c.kind), 'tidy 카드 표시');
  ['C', 'R', 'E', 'W'].forEach(c => eq(r.elements[c].status, 'green', 'spoken ' + c));
}

/* --- W 위치 규칙: 앞 문단의 「그래서」는 마무리가 아니다 --- */
{
  const t = `그래서 나는 숙제가 필요하다고 생각한다.\n왜냐하면 복습이 되기 때문이다.\n오늘 날씨가 좋다.`;
  const r = K.analyze({ text: t, type: 'argue', band: 4 });
  eq(r.elements.W.status, 'red', 'W 앞 문단 그래서 무시');
}

/* --- explain / book / letter / story --- */
{
  const r = K.analyze({ text: explainGood, type: 'explain', band: 4 });
  ['F', 'O', 'W'].forEach(c => eq(r.elements[c].status, 'green', 'explain ' + c));
}
{
  const r = K.analyze({ text: bookGood, type: 'book', band: 4 });
  ['F', 'E', 'Q'].forEach(c => eq(r.elements[c].status, 'green', 'book ' + c));
}
{
  const r = K.analyze({ text: letterGood, type: 'letter', band: 4 });
  ['G', 'C', 'R'].forEach(c => ok(r.elements[c].status !== 'red', 'letter ' + c + ' not red'));
  eq(r.elements.G.status, 'green', 'letter G green (에게·올림)');
  ok(!r.format.some(f => f.kind === 'endings'), 'letter 어미 섞임 예외');
}
{
  const r = K.analyze({ text: storyMid, type: 'story', band: 3 });
  ['F', 'O', 'Q'].forEach(c => eq(r.elements[c].status, 'green', 'story ' + c));
}

/* --- 색칠 대조: 학생 표시를 먼저 믿는다 --- */
{
  const t = `나는 강아지를 키워야 한다고 생각한다.\n강아지는 외로울 때 친구가 되어 준다.`;
  const r0 = K.analyze({ text: t, type: 'argue', band: 3 });
  eq(r0.elements.R.status, 'red', '표시 전 R red');
  const r1 = K.analyze({ text: t, type: 'argue', band: 3, marks: { 1: 'R' } });
  eq(r1.elements.R.status, 'green', '학생이 R 칠하면 green');
  eq(r1.sentences[1].agree, 'markedNoSignal', '신호어 없는 표시 → markedNoSignal (붙여 볼 말 안내)');
  eq(r1.sentences[0].agree, 'signalNotMarked', '강한 신호 있는데 안 칠함 → signalNotMarked');
  eq(r1.sentences[0].suggest, 'C', 'suggest C');
  const r2 = K.analyze({ text: t, type: 'argue', band: 3, marks: { 0: 'C', 1: 'R' } });
  eq(r2.sentences[0].agree, 'match', '표시=신호 match');
}

/* --- 논제 대조 --- */
{
  const r = K.analyze({ text: '나는 축구가 좋다고 생각한다. 왜냐하면 재미있기 때문이다.', type: 'argue', band: 3, keywords: ['급식'] });
  eq(r.topic.status, 'red', '논제 낱말 0회 red');
  ok(r.topic.msg.includes('급식'), '논제 문구에 낱말');
}

/* --- 형식: 긴 문장·같은 시작·반복·어미 섞임·맞춤법 --- */
{
  const long = '나는 ' + '정말 '.repeat(40) + '좋다고 생각한다.';
  const r = K.analyze({ text: long, type: 'argue', band: 5 });
  ok(r.format.some(f => f.kind === 'sentence'), '긴 문장');
  ok(r.format.some(f => f.kind === 'repeat' && f.word === '정말'), '반복 낱말');
}
{
  const r = K.analyze({ text: '김치는 맛있다. 김치는 좋다. 김치는 빨갛다.', type: 'explain', band: 3 });
  ok(r.format.some(f => f.kind === 'sameStart'), '같은 시작어');
}
{
  const r = K.analyze({ text: '나는 학교가 좋다. 왜냐하면 친구가 있기 때문이에요.', type: 'argue', band: 3 });
  ok(r.format.some(f => f.kind === 'endings'), '어미 섞임');
  const r2 = K.analyze({ text: '몇일 동안 안되요.', type: 'story', band: 3 });
  ok(r2.format.some(f => f.kind === 'spelling'), '맞춤법 목록');
}

/* --- 분량 안내 --- */
{
  const r = K.analyze({ text: '짧다.', type: 'argue', band: 5 });
  eq(r.length.status, 'short', '짧음 안내');
}

/* --- 평가 낱말 0 — 모든 문구 --- */
{
  const fb = D('feedback.json');
  const bad = /틀렸|부족|미흡|못했|잘못|점수|등급|실패|낮/;
  const walk = (o, p) => { if (typeof o === 'string') ok(!bad.test(o), '평가 낱말: ' + p + ' ' + o); else if (o && typeof o === 'object') Object.keys(o).forEach(k => k !== '_doc' && walk(o[k], p + '.' + k)); };
  walk(fb, 'feedback');
}

/* --- 빈 글 --- */
{
  const r = K.analyze({ text: '', type: 'argue', band: 3 });
  ok(Object.keys(r.elements).every(c => r.elements[c].status === 'red'), '빈 글 전부 red');
  ok(!r.allGreen, '빈 글 not allGreen');
}

console.log(`test_kedu_write: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
