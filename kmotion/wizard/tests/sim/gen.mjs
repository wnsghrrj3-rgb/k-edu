// 생성기 공통 검산(14 문서 4절) — node tests/sim/gen.mjs [단원꼬리표]   예) node tests/sim/gen.mjs g2-1-u3
// 등록된 모든 생성기(또는 한 단원)를 난이도 6단 × 300 돌려 틀·정답·오답·문구 키·길이를 검사한다. 화면·three 없음.
import { GENERATORS, QuestionEngine } from '../../sim/learn/questionEngine.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
const data = loadData(), T = data.text, only = process.argv[2] || null, out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const TYPES = ['calc1', 'calc2', 'word1'], DS = [0, .2, .4, .6, .8, 1], N = 300;
const render = p => (T[p.key] || '').replace(/\{(\w+)\}/g, (_, k) => p.args && p.args[k] != null ? String(p.args[k]) : `{${k}}`);
const keys = Object.keys(GENERATORS).filter(k => !only || GENERATORS[k].unit === only);
ok('생성기 있음', keys.length > 0, only ? `단원 ${only} 에 등록된 생성기 0` : `${keys.length}종`);
for (const k of keys) {
  const G = GENERATORS[k], rng = createRng(11), bad = [];
  const need = (c, m) => { if (!c && bad.length < 6) bad.push(m); if (!c) return false; return true; };
  // 틀
  need(typeof G.gen === 'function' && typeof G.verify === 'function', 'gen/verify 없음');
  need(typeof G.unit === 'string' && /^g[1-6]-[12]-u\d+$/.test(G.unit), `unit 꼬리표 「${G.unit}」 형식(g학년-학기-u단원)`);
  need(Number.isInteger(G.max) && G.max >= 9, `max(오답 상한) 정수 아님: ${G.max}`);
  need(k.startsWith('g' + G.unit[1] + '.'), `개념 키 「${k}」 가 학년 접두 g${G.unit[1]}. 로 시작하지 않음`);
  need(!!T['learn.' + k], `ko.json 「learn.${k}」 없음(지도 「배울 것」 글자)`);
  const grade = +G.unit[1], lim = q => q.type === 'word1' ? 45 : grade <= 2 ? 25 : 40;   // 계산형 25/40자(08 문서 7절) · 문장제는 큰 패널이라 45자
  let n = 0, maxAns = 0, facts = new Set(), slots = [0, 0, 0];
  for (const d of DS) for (let i = 0; i < N; i++) {
    let q; try { q = G.gen(rng, d); } catch (e) { need(false, `gen 예외(d=${d}): ${e.message}`); break; }
    n++; facts.add(q.fact);
    need(q.concept === k, `concept 「${q.concept}」 ≠ 키`);
    need(typeof q.fact === 'string' && q.fact.length > 0, 'fact 없음');
    need(Number.isFinite(q.d) && q.d >= 0 && q.d <= 1, `d 범위 밖 ${q.d}`);
    need(TYPES.includes(q.type), `type 「${q.type}」 (calc1·calc2·word1 만)`);
    need(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= G.max, `answer ${q.answer} 정수·0~max 밖`);
    need(G.verify(q) === true, `verify 거짓: ${q.fact} answer=${q.answer}`);
    need(q.prompt && T[q.prompt.key] != null, `ko.json 「${q.prompt && q.prompt.key}」 없음`);
    const txt = render(q.prompt); need(!/\{\w+\}/.test(txt), `문구에 안 채워진 자리 「${txt}」`); need(txt.length <= lim(q), `문구 ${txt.length}자 > ${lim(q)}자 「${txt}」`);
    need(Array.isArray(q.wrongs) && q.wrongs.length >= 2, 'wrongs 2개 미만');
    const seenW = new Set(); let validW = 0;
    for (const w of q.wrongs || []) { need(Array.isArray(w) && w.length === 2 && typeof w[1] === 'string', 'wrongs 항목은 [값, 태그]'); need(!!T['why.' + w[1]] || (q.type === 'word1' && !!T['why.word.' + w[1]]), `ko.json 「why.${w[1]}」 없음`);
      if (Number.isInteger(w[0]) && w[0] >= 0 && w[0] <= G.max && !seenW.has(w[0]) && w[0] !== q.answer) { seenW.add(w[0]); validW++; } }
    need(validW >= 2, `쓸 수 있는 오답(0~max·중복 없음) ${validW}개 < 2: ${q.fact}`);
    need(q.hint1 && T[q.hint1.key] != null, `hint1 키 「${q.hint1 && q.hint1.key}」 없음`);
    if (q.hint2) { need((q.hint2.kind === 'beads' && (q.hint2.op === '+' || q.hint2.op === '-') && q.hint2.a + (q.hint2.op === '+' ? q.hint2.b : 0) <= 20) || (q.hint2.kind === 'groups' && q.hint2.n >= 2 && q.hint2.n <= 8 && q.hint2.n * q.hint2.each <= 96), `hint2 는 beads(+·− 합 20 이하) 또는 groups(묶음 그림, v2.3 share — n 2~8·합 96 이하)만, 아니면 null: ${JSON.stringify(q.hint2)}`); }
    maxAns = Math.max(maxAns, q.answer);
  }
  // 엔진 통과: 선택지 3·중복 0·정답 자리
  { const qe = new QuestionEngine({ rng: createRng(3), concepts: [k] }); for (let i = 0; i < 120; i++) { const b = qe.next(); const nums = b.choices.map(c => c.num);
      need(nums.length === 3 && new Set(nums).size === 3, `선택지 중복/부족 ${nums}`); need(nums[b.correctSlot] === b.answer && b.verified, '정답 자리·verified'); slots[b.correctSlot]++; need(b.id.startsWith(G.unit + '-gen-'), `id 접두 ${b.id}`); } }
  ok(`${k} (${G.unit}) ${n}개`, bad.length === 0, bad.join(' | ') || `답 최대 ${maxAns}/max ${G.max} · 사실 키 ${facts.size}종 · 정답 자리 ${slots}`);
  if (bad.length === 0) need(facts.size >= 8, `사실 키 종류 ${facts.size} < 8(너무 반복됨)`), bad.length && ok(`${k} 다양성`, false, bad[0]);
}
console.table(out); console.log(fail ? `✗ 실패 ${fail}` : `✓ 전부 통과(생성기 ${keys.length}종)`); process.exit(fail ? 1 : 0);
