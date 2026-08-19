/* 뽑기 도구 — 순수 로직 게이트 (P1)
 * 실행: node pick/pick_logic.test.js
 */
const L = require('./pick_logic.js');

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log('  ✅ ' + name); }
  catch (e) { fail++; console.log('  ❌ ' + name + ' — ' + e.message); }
}
function eq(a, b, msg) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) throw new Error((msg || '') + ' 기댓값 ' + B + ' / 실제 ' + A);
}
function ok(c, msg) { if (!c) throw new Error(msg || '거짓'); }

const R30 = Array.from({ length: 30 }, (_, i) => '학생' + (i + 1));

console.log('\n[A] 명단 파싱');
t('줄바꿈·쉼표·탭 혼합', () => {
  eq(L.parseRoster('김하늘\n박바다, 이든\t최솔'), ['김하늘', '박바다', '이든', '최솔']);
});
t('선행 번호 제거 (1. / 12) / 3-)', () => {
  eq(L.parseRoster('1. 김하늘\n12) 박바다\n3- 이든\n04: 최솔'), ['김하늘', '박바다', '이든', '최솔']);
});
t('빈 줄·공백만 있는 줄 제거', () => {
  eq(L.parseRoster('김하늘\n\n   \n박바다\n'), ['김하늘', '박바다']);
});
t('중복 제거 — 먼저 적은 순서 보존', () => {
  eq(L.parseRoster('김하늘\n박바다\n김하늘'), ['김하늘', '박바다']);
});
t('이름 안 공백은 한 칸으로 정규화', () => {
  eq(L.parseRoster('  김  하늘  '), ['김 하늘']);
});
t('문자열 아닌 입력 → 빈 배열', () => { eq(L.parseRoster(null), []); eq(L.parseRoster(7), []); });

console.log('\n[B] 셔플');
t('원본 불변 + 구성원 보존', () => {
  const src = R30.slice();
  const out = L.shuffle(src, L.makeRng(42));
  eq(src, R30, '원본이 변했다');
  eq(out.slice().sort(), R30.slice().sort(), '구성원이 변했다');
});
t('같은 시드 = 같은 결과 (결정성)', () => {
  eq(L.shuffle(R30, L.makeRng(7)), L.shuffle(R30, L.makeRng(7)));
});
t('다른 시드 = 다른 결과', () => {
  ok(JSON.stringify(L.shuffle(R30, L.makeRng(1))) !== JSON.stringify(L.shuffle(R30, L.makeRng(2))));
});

console.log('\n[C] 한 명 뽑기 — 한 바퀴 안 중복 없음');
t('30명 30번 뽑으면 전원 정확히 1회', () => {
  const rng = L.makeRng(99);
  let st = { names: R30, excluded: [], drawn: [], round: 1, rng };
  const got = [];
  for (let i = 0; i < 30; i++) {
    const r = L.drawOne(st);
    got.push(r.name); st.drawn = r.drawn; st.round = r.round;
  }
  eq(got.slice().sort(), R30.slice().sort(), '전원 1회가 아니다');
  eq(st.round, 1, '한 바퀴 안에서 라운드가 넘어갔다');
});
t('31번째 = 새 바퀴 시작 (round 2, 기록 초기화)', () => {
  const rng = L.makeRng(99);
  let st = { names: R30, excluded: [], drawn: [], round: 1, rng };
  for (let i = 0; i < 30; i++) { const r = L.drawOne(st); st.drawn = r.drawn; st.round = r.round; }
  const r31 = L.drawOne(st);
  eq(r31.round, 2, '라운드가 안 올라갔다');
  eq(r31.drawn.length, 1, '새 바퀴 기록이 1명이 아니다');
});
t('오늘 제외한 사람은 절대 안 나온다', () => {
  const rng = L.makeRng(5);
  const ex = ['학생3', '학생10', '학생30'];
  let st = { names: R30, excluded: ex, drawn: [], round: 1, rng };
  for (let i = 0; i < 100; i++) {
    const r = L.drawOne(st);
    ok(ex.indexOf(r.name) === -1, '제외한 ' + r.name + '이(가) 나왔다');
    st.drawn = r.drawn; st.round = r.round;
  }
});
t('제외 3명이면 한 바퀴 = 27명', () => {
  const rng = L.makeRng(5);
  let st = { names: R30, excluded: ['학생3', '학생10', '학생30'], drawn: [], round: 1, rng };
  for (let i = 0; i < 27; i++) { const r = L.drawOne(st); st.drawn = r.drawn; st.round = r.round; }
  eq(st.round, 1);
  const r28 = L.drawOne(st);
  eq(r28.round, 2, '27명 뒤에 새 바퀴가 안 열렸다');
});
t('전원 제외 → name null·exhausted', () => {
  const r = L.drawOne({ names: ['가', '나'], excluded: ['가', '나'], drawn: [], round: 1, rng: L.makeRng(1) });
  eq(r.name, null); ok(r.exhausted);
});
t('빈 명단 → name null', () => {
  eq(L.drawOne({ names: [], excluded: [], drawn: [], round: 1, rng: L.makeRng(1) }).name, null);
});
t('반복 허용 방식은 기록을 쌓지 않는다', () => {
  const r = L.drawOne({ names: R30, excluded: [], drawn: ['학생1'], round: 1, rng: L.makeRng(3), repeatAllowed: true });
  eq(r.drawn, ['학생1'], '반복 허용인데 기록이 늘었다');
  ok(R30.indexOf(r.name) !== -1);
});
t('1명짜리 명단 — 뽑을 때마다 그 사람, 라운드만 증가', () => {
  let st = { names: ['혼자'], excluded: [], drawn: [], round: 1, rng: L.makeRng(1) };
  const r1 = L.drawOne(st); st = Object.assign(st, { drawn: r1.drawn, round: r1.round });
  const r2 = L.drawOne(st);
  eq(r1.name, '혼자'); eq(r2.name, '혼자'); eq(r2.round, 2);
});

console.log('\n[D] 여러 명 뽑기');
t('5명 요청 = 서로 다른 5명', () => {
  const r = L.drawMany({ names: R30, excluded: [], drawn: [], round: 1, rng: L.makeRng(11) }, 5);
  eq(r.picked.length, 5);
  eq(new Set(r.picked).size, 5, '겹친 사람이 있다');
});
t('명단보다 많이 요청하면 있는 만큼만', () => {
  const r = L.drawMany({ names: ['가', '나', '다'], excluded: [], drawn: [], round: 1, rng: L.makeRng(2) }, 10);
  eq(r.picked.length, 3);
});
t('제외자는 여러 명 뽑기에서도 빠진다', () => {
  const r = L.drawMany({ names: R30, excluded: ['학생1'], drawn: [], round: 1, rng: L.makeRng(4) }, 29);
  ok(r.picked.indexOf('학생1') === -1);
  eq(r.picked.length, 29);
});

console.log('\n[E] 모둠 짜기');
t('30명 6모둠 = 5명씩', () => {
  const g = L.makeGroups(R30, { mode: 'count', value: 6, rng: L.makeRng(21) });
  eq(g.length, 6);
  eq(g.map(x => x.length), [5, 5, 5, 5, 5, 5]);
  ok(L.verifyGroups(g, R30).ok);
});
t('29명 6모둠 = 5,5,5,5,5,4 (편차 1 이하)', () => {
  const names = R30.slice(0, 29);
  const g = L.makeGroups(names, { mode: 'count', value: 6, rng: L.makeRng(22) });
  eq(g.map(x => x.length), [5, 5, 5, 5, 5, 4]);
  const v = L.verifyGroups(g, names);
  ok(v.ok, JSON.stringify(v));
  ok(v.spread <= 1, '인원 편차가 2 이상');
});
t('26명 4명씩 = 4,4,4,4,4,3,3 (빈 모둠 없음)', () => {
  const names = R30.slice(0, 26);
  const g = L.makeGroups(names, { mode: 'size', value: 4, rng: L.makeRng(23) });
  eq(g.length, 7);
  eq(g.map(x => x.length), [4, 4, 4, 4, 4, 3, 3]);
  ok(L.verifyGroups(g, names).ok);
  ok(g.every(x => x.length >= 1), '빈 모둠이 생겼다');
});
t('모둠 수 > 인원수 → 인원수만큼만, 빈 모둠 없음', () => {
  const names = ['가', '나', '다'];
  const g = L.makeGroups(names, { mode: 'count', value: 10, rng: L.makeRng(24) });
  eq(g.length, 3);
  ok(g.every(x => x.length === 1));
});
t('전원 배정 + 중복 0 (100회 무작위 검산)', () => {
  for (let s = 1; s <= 100; s++) {
    const n = 2 + (s % 33);
    const names = Array.from({ length: n }, (_, i) => 'N' + i);
    const mode = s % 2 ? 'count' : 'size';
    const value = 1 + (s % 7);
    const g = L.makeGroups(names, { mode, value, rng: L.makeRng(s) });
    const v = L.verifyGroups(g, names);
    ok(v.ok, `시드${s} n=${n} ${mode}=${value} → ${JSON.stringify(v)}`);
  }
});
t('제외자는 모둠에 안 들어간다', () => {
  const ex = ['학생1', '학생2'];
  const g = L.makeGroups(R30, { mode: 'count', value: 4, rng: L.makeRng(31), excluded: ex });
  const flat = g.flat();
  eq(flat.length, 28);
  ok(ex.every(n => flat.indexOf(n) === -1));
});
t('같은 시드 = 같은 모둠 (결정성)', () => {
  eq(L.makeGroups(R30, { mode: 'count', value: 5, rng: L.makeRng(77) }),
     L.makeGroups(R30, { mode: 'count', value: 5, rng: L.makeRng(77) }));
});
t('빈 명단 → 빈 결과', () => { eq(L.makeGroups([], { mode: 'count', value: 3, rng: L.makeRng(1) }), []); });

console.log('\n[F] 짝 짓기');
t('짝수 24명 = 2명씩 12짝', () => {
  const names = R30.slice(0, 24);
  const g = L.makePairs(names, { rng: L.makeRng(41) });
  eq(g.length, 12);
  ok(g.every(x => x.length === 2));
});
t('홀수 25명 = 한 짝만 3명, 나머지 2명', () => {
  const names = R30.slice(0, 25);
  const g = L.makePairs(names, { rng: L.makeRng(42) });
  const sizes = g.map(x => x.length);
  eq(sizes.filter(s => s === 3).length, 1, '3명짜리가 정확히 1개가 아니다');
  ok(sizes.filter(s => s === 2).length === g.length - 1);
  ok(L.verifyGroups(g, names).ok);
});
t('1명 → 혼자인 한 짝 (빠짐 없음)', () => {
  const g = L.makePairs(['혼자'], { rng: L.makeRng(1) });
  eq(g, [['혼자']]);
});

console.log('\n[G] 자기검산 함수가 실제로 잡아내는가');
t('중복을 잡는다', () => {
  const v = L.verifyGroups([['가', '나'], ['나']], ['가', '나']);
  ok(!v.ok && v.duplicated);
});
t('누락을 잡는다', () => {
  const v = L.verifyGroups([['가']], ['가', '나']);
  ok(!v.ok); eq(v.missing, ['나']);
});
t('인원 편차 2 이상을 잡는다', () => {
  const v = L.verifyGroups([['가', '나', '다'], ['라']], ['가', '나', '다', '라']);
  ok(!v.ok && v.spread === 2);
});

console.log('\n[H] 차단 어휘 스캔 (PRINCIPLES 12조)');
t('로직·테스트 파일에 차단 어휘 0', () => {
  const fs = require('fs');
  // 어휘를 조각으로 조립한다 — 이 테스트 파일 자체가 스캔에 걸리지 않도록.
  const banned = [
    new RegExp('\uBC15' + '\uC74C'),
    new RegExp('\uBE75' + '\uAF49'),
    new RegExp('\uAC08\uC544' + '\uC5CE'),
    new RegExp('\uACB0' + '\uB85C'),
    new RegExp('(^|[^\uAC00-\uD7A3])' + '\uACB0' + '([^\uAC00-\uD7A3]|$)')
  ];
  ['./pick_logic.js', './pick_logic.test.js', './index.html'].forEach(f => {
    let src;
    try { src = fs.readFileSync(__dirname + '/' + f.slice(2), 'utf8'); } catch (e) { return; }
    banned.forEach(re => { ok(!re.test(src), f + ' 에 차단 어휘: ' + re); });
  });
});

console.log('\n─────────────────────────────');
console.log(`통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
