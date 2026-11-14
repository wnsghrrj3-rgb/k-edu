/* 학력경시 시험지 엔진 검사 — node tests/test_kedu_exam.js */
const K = require('../kedu/worksheet/exam/exam_core.js'), H = require('../kedu/worksheet/exam/exam_hwpx.js'), fs = require('fs');
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
ok(K.examEnding('무엇인가요?') === '무엇입니까?' && K.examEnding('알맞은 것을 고르세요.') === '알맞은 것을 고르시오.' && K.examEnding('무엇을 주나요?') === '무엇을 줍니까?', '말투');
ok(K.stripTags('「확인 문제」 『국어』 37쪽 2번에서 친구가 말한 것은?') === '친구가 말한 것은?', '머리표·쪽수 지우기 ' + K.stripTags('「확인 문제」 『국어』 37쪽 2번에서 친구가 말한 것은?'));
ok(K.bookPages({ stem: '『국어』 36쪽', explanation: ['『국어』 42쪽 5번'] }).join() === '36,42', '쪽수 모으기');
ok(K.splitMath('⟨1 2/3⟩ + ⟨1/4⟩').filter(s => s.eq).map(s => s.eq).join('|') === '1 {2} over {3}|{1} over {4}', '분수 수식');
const f = K.fifthOption([{ t: '⟨2/5⟩', correct: true }, { t: '⟨3/5⟩' }, { t: '⟨1/5⟩' }, { t: '⟨4/5⟩' }], [], K.rng('x'), []);
ok(f.t === '⟨5/5⟩', '분수 다섯째 보기 ' + f.t);
ok(K.fifthOption([{ t: '12 cm' }, { t: '13 cm' }, { t: '14 cm' }, { t: '11 cm' }], [], K.rng('x'), []).t === '15 cm', '수 다섯째 보기');
ok(K.fifthOption([{ t: '사과' }, { t: '배' }, { t: '감' }, { t: '귤' }], ['포도'], K.rng('x'), []).blank, '글 보기는 남의 오답을 빌리지 않음');
/* 실제 세트로: 단원 뽑기 · 문항 수 · 같은 발문 없음 · 정답 표시 */
const D = __dirname + '/../kedu/worksheet/data/';
[['tb_g4_2_math_u1', 'u1'], ['g4_2_soc_u1', 'u1'], ['tb_g4_2_kor_u2', 'u2'], ['g5_2_sci_u2', 'u2']].forEach(([pre, u]) => {
  let cards = []; fs.readdirSync(D).filter(n => n.startsWith(pre + '_')).forEach(n => { cards = cards.concat(K.cardsOf(JSON.parse(fs.readFileSync(D + n)))); });
  const pick = K.recommend(cards, [{ unit: u, n: 12 }], { seed: 's' });
  ok(pick.length === 12, pre + ' 개수 ' + pick.length);
  const items = pick.map(c => K.toItem(c, { seed: 's' }));
  ok(new Set(items.map(x => x.stem)).size === items.length, pre + ' 같은 발문');
  items.forEach(x => { ok(x.answer !== '', pre + ' 정답 ' + x.stem); if (x.kind === 'mc') ok(x.options.filter(o => o.correct).length === 1, pre + ' 정답 하나 ' + x.stem); ok(!/세요\.?$|나요\?$|가요\?$/.test(x.stem), pre + ' 말투 ' + x.stem); });
  items.forEach((x, i) => { const bs = H.blocks(x, i + 1); ok(bs.length >= 2, '덩어리'); });
});
console.log(fail ? fail + ' FAILED' : 'OK'); process.exit(fail ? 1 : 0);
