/* 케이생기부 엔진 검사 — node tests/test_kedu_record.js */
const K = require('../teacher/record_engine.js');
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
// 1) 「~한다」→「~함」
[['글자를 바르게 쓴다', '글자를 바르게 씀'], ['글을 소리 내어 읽는다', '글을 소리 내어 읽음'], ['모양을 만든다', '모양을 만듦'], ['수를 셀 수 있다', '수를 셀 수 있음'],
 ['귀 기울여 듣는다', '귀 기울여 들음'], ['규칙을 찾아 말합니다', '규칙을 찾아 말함'], ['비교할 수 있습니다', '비교할 수 있음'], ['이야기를 짓는다', '이야기를 지음'],
 ['문제를 푼다', '문제를 풂'], ['책을 읽음', '책을 읽음'], ['친구를 돕는다', '친구를 도움'], ['한글 자음자 쓰기', '한글 자음자 쓰기를 잘함']]
  .forEach(([a, b]) => ok(K.levelText(a, 'h') === b, a + ' → ' + K.levelText(a, 'h')));
ok(K.levelText('수를 센다', 'm') === '대체로 수를 셈' && K.levelText('수를 센다', 'l') === '도움을 받아 수를 셈', '수준 문장');
const pc = K.parseCriteria('1. 바르게 쓴다\n정확하게 읽는다 | 읽는다 | 도움을 받아 읽는다\n\n');
ok(pc.length === 2 && pc[1].m === '읽음' && pc[1].l === '도움을 받아 읽음' && pc[0].h === '바르게 씀', '기준 읽기');
// 2) 행동특성 — 모든 조합이 33~48자, 마침표로 끝남
let n = 0;
K.LINES.forEach(L => { const ids = L.traits.map(t => t.id);
  ['h', 'm', 'l'].forEach(lv => ids.forEach(a => {
    const one = K.candidates(L.id, { sel: { [a]: lv } }, { seed: a }); ok(one.length >= 2, '후보 수 ' + a);
    [one[0]].concat(ids.filter(b => b > a).map(b => K.compose(L.id, { sel: { [a]: lv, [b]: 'h' } }, { seed: a + b }))).forEach(t => { n++; ok(t.length >= 33 && t.length <= 48 && /[음임함됨앎듦줌삼냄씀힘끎감봄짐침]\.$/.test(t) || /\.$/.test(t) && t.length >= 33 && t.length <= 48, t.length + ' ' + t); });
  }));
  ['수학', '피아노', '우유 당번'].forEach(x => ['h', 'm', 'l'].forEach(lv => { const t = K.compose(L.id, { x, xl: lv }, { seed: x }); ok(t.indexOf(x) >= 0 && t.length >= 30 && t.length <= 48, t); }));
});
// 3) 같은 반 중복 피하기 · 다시 짓기
const first = K.compose('l1', { sel: { focus: 'h', present: 'h' } }, { seed: 'a' });
const second = K.compose('l1', { sel: { focus: 'h', present: 'h' } }, { seed: 'a', used: { [first]: 1 } });
ok(first !== second, '중복 회피'); ok(K.compose('l1', { sel: { focus: 'h' } }, { seed: 'a', roll: 1 }) !== K.compose('l1', { sel: { focus: 'h' } }, { seed: 'a', roll: 0 }), '다시 짓기');
ok(K.fill('{X}{을} 좋아하여', '피아노') === '피아노를 좋아하여' && K.fill('{X}{을}', '수학') === '수학을', '조사');
// 4) 나누어 넣기 — 개수·고른 분배
const cnt = [0, 0, 0, 0, 0]; for (let i = 0; i < 30; i++) { const p = K.assign(5, 2, i, 0, 's'); ok(p.length === 2 && p[0] !== p[1], '개수'); p.forEach(x => cnt[x]++); }
ok(Math.max(...cnt) - Math.min(...cnt) <= 2, '고른 분배 ' + cnt); ok(K.assign(3, 5, 0, 0, 's').length === 3, '기준보다 많이 고르면 전부');
ok(K.subjectText(pc, [0, 1], { 1: 'l' }) === '바르게 씀. 도움을 받아 읽음.', '문장 잇기'); ok(K.bytes('가a\n') === 6, '바이트'); ok(K.watch('학원에서 배운').length === 1, '확인 낱말');
console.log(fail ? fail + ' FAILED' : 'OK (' + n + ' 문장)'); process.exit(fail ? 1 : 0);
