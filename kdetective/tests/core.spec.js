/* 케이탐정 코어 테스트 — node kdetective/tests/core.spec.js */
'use strict';
const KD = require('../kd_core.js');
const POOL = require('../case1/pool.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } };

console.log('[등급]');
ok(KD.rankOf(0).name === '견습 탐정', '0점 = 견습');
ok(KD.rankOf(400).name === '베테랑 탐정', '400점 = 베테랑');
ok(KD.rankOf(99999).name === '전설의 탐정', '최고 등급 상한');
ok(KD.nextRank(0).min === 150 && KD.nextRank(9999) === null, '다음 등급 계산');

console.log('[기록]');
{
  const store = { d: {}, getItem(k) { return this.d[k] || null; }, setItem(k, v) { this.d[k] = v; } };
  let rec = KD.loadRec(store);
  ok(rec.total === 0 && rec.solved === 0, '빈 기록');
  KD.commitRound(rec, 'case1.find.l1', 60, 1, 3); KD.saveRec(rec, store);
  rec = KD.loadRec(store);
  ok(rec.total === 60 && rec.best['case1.find.l1'] === 60 && rec.streakBest === 3, '저장·복원');
  KD.commitRound(rec, 'case1.find.l1', 40, 1, 1);
  ok(rec.best['case1.find.l1'] === 60 && rec.total === 100, '최고 기록 유지 · 누적 합산');
  ok(KD.unlockedLevel(rec, 'case1.find', KD.perfectFind) === 2, 'L1 만점 75의 60%(45) 넘김 → L2 열림');
  ok(KD.unlockedLevel({ best: {} }, 'case1.find', KD.perfectFind) === 1, '기록 없음 → L1');
}

console.log('[레벨 규칙]');
ok(KD.levelRule(1).slots === 1 && !KD.levelRule(1).subtle, 'L1 뚜렷 1곳');
ok(KD.levelRule(2).slots === 1 && KD.levelRule(2).subtle, 'L2 교묘 1곳');
ok(KD.levelRule(3).slots === 2 && !KD.levelRule(3).subtle, 'L3 뚜렷 2곳');
ok(KD.levelRule(5).timed && KD.levelRule(5).seconds === 40, 'L5 시간 제한');
ok(KD.levelRule(9).level === 5 && KD.levelRule(0).level === 1, '레벨 범위 고정');

console.log('[기사 풀]');
ok(POOL.length === 12, '기사 12개');
{
  const ids = new Set(POOL.map(a => a.id)); ok(ids.size === POOL.length, 'id 중복 없음');
  let good = true;
  for (const a of POOL) {
    if (!KD.TRUSTED.includes(a.src)) good = false;
    if (!(a.fake.title.obvious && a.fake.title.subtle && a.fake.photo.obvious && a.fake.photo.subtle && a.fake.date.obvious && a.fake.date.subtle && a.fake.titleKey)) good = false;
    if (a.fake.title.obvious === a.title || a.fake.title.subtle === a.title) good = false;
    if (!/^20\d\d\.\d\d\.\d\d$/.test(a.date) || !/^20\d\d\.\d\d\.\d\d$/.test(a.fake.date.obvious)) good = false;
    if (Number(a.fake.date.obvious.slice(0, 4)) >= Number(a.date.slice(0, 4))) good = false;
  }
  ok(good, '모든 기사: 믿을 만한 출처 · 조작 재료 6종 · 조작 날짜는 과거');
  ok(POOL.every(a => [3, 4, 5, 6].includes(a.grade)), '학년 3~6');
}

console.log('[조작 생성]');
{
  const r1 = KD.rng(7), r2 = KD.rng(7);
  const c1 = KD.forge(POOL[0], 1, r1), c2 = KD.forge(POOL[0], 1, r2);
  ok(JSON.stringify(c1) === JSON.stringify(c2), '같은 시드 → 같은 사건');
  ok(c1.forged.length === 1, 'L1 조작 1곳');
  const c3 = KD.forge(POOL[1], 3, KD.rng(3));
  ok(c3.forged.length === 2 && c3.forged[0] !== c3.forged[1], 'L3 조작 2곳 서로 다름');
  // 모든 자리가 실제로 바뀌는지 (시드 훑기)
  let seen = {}, t = 0;
  for (let s = 1; s < 60; s++) { const c = KD.forge(POOL[2], 2, KD.rng(s)); seen[c.forged[0]] = 1; t++;
    const a = POOL[2];
    if (c.forged[0] === 'title' && c.title === a.title) fail++;
    if (c.forged[0] === 'source' && (c.src === a.src || KD.TRUSTED.includes(c.src))) fail++;
    if (c.forged[0] === 'date' && (c.date === a.date || c.title.indexOf('[속보]') !== 0)) fail++;
    if (c.forged[0] === 'photo' && c.photo.cap === a.photo.cap) fail++;
  }
  ok(Object.keys(seen).length === 4, '60시드 안에 4자리 모두 등장');
  const cSub = KD.forge(POOL[0], 2, KD.rng(11)), cOb = KD.forge(POOL[0], 1, KD.rng(11));
  ok(cSub.forged[0] === cOb.forged[0], '같은 시드면 레벨이 달라도 같은 자리');
  ok(Object.keys(c1.why).length === 1 && typeof c1.why[c1.forged[0]] === 'string', 'why 설명이 조작 자리에만 있음');
}

console.log('[판정]');
{
  const card = { forged: ['title'] };
  ok(KD.judge(card, [{ slot: 'title', reason: 'exag' }]).score === 15, '자리+근거 = 15');
  ok(KD.judge(card, [{ slot: 'title', reason: 'photo' }]).score === 10, '자리만 = 10');
  const j = KD.judge(card, [{ slot: 'photo', reason: 'photo' }]);
  ok(j.score === 0 && j.misses.length === 1 && j.missed[0] === 'title', '틀린 자리 = 0점(음수 없음) · 놓친 자리 기록');
  const two = { forged: ['photo', 'source'] };
  const j2 = KD.judge(two, [{ slot: 'photo', reason: 'photo' }, { slot: 'source', reason: 'source' }]);
  ok(j2.score === 30 && j2.perfect, '2곳 전부 근거까지 = 30 · perfect');
  const j3 = KD.judge(two, [{ slot: 'photo', reason: 'photo' }, { slot: 'title', reason: 'exag' }]);
  ok(j3.score === 10 && j3.missed[0] === 'source' && !j3.perfect, '하나 맞고 하나 틀리면 15-5=10');
  ok(KD.judge(two, [{ slot: 'photo', reason: 'photo' }, { slot: 'photo', reason: 'photo' }]).score === 10, '같은 자리 두 번 찍어도 한 번만');
  ok(KD.streakBonus(1) === 0 && KD.streakBonus(3) === 6 && KD.streakBonus(9) === 10, '연속 보너스 상한 10');
}

console.log('[제작 턴 · AI 탐정]');
{
  const a = POOL[0];
  ok(!KD.detect({ title: a.title }, a).valid, '아무것도 안 바꾸면 무효');
  const d1 = KD.detect({ title: a.fake.title.obvious, titleKind: 'obvious' }, a);
  ok(d1.valid && d1.caught && d1.score === 5, '뚜렷한 제목 → 잡힘');
  const d2 = KD.detect({ title: a.fake.title.subtle, titleKind: 'subtle' }, a);
  ok(!d2.caught && d2.score > 30, '교묘한 제목 → 통과, 점수');
  const d3 = KD.detect({ title: a.fake.title.subtle, titleKind: 'subtle', source: 'subtle' }, a);
  ok(d3.changed === 2 && d3.caught, '교묘 2곳은 합산 위험(45+15=60)으로 잡힘 — 욕심 금지');
  const d4 = KD.detect({ title: a.title, photo: 'subtle' }, a);
  ok(!d4.caught && d4.changed === 1, '사진 교묘 1곳만 → 통과');
  ok(KD.titleObviousness('충격! 급식 치킨 하루 세 번 100%', a.title) >= 60, '자유 제목: 자극어·느낌표 → 뚜렷');
  ok(KD.titleObviousness('초등학교 급식, 매주 치킨 데이', a.title) < 60, '자유 제목: 조용한 부풀림 → 교묘');
  ok(KD.titleObviousness(a.title, a.title) === -1, '원문 그대로 = -1');
}

console.log(`\n${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
