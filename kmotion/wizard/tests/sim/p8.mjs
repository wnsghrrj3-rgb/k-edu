// v2.1 — 비교형·규칙형 생성기(강화 수정 얼음·번개, 05 문서 12항) · want 풀 단원 규칙(같은 학년 장면 단원 이하) — node tests/sim/p8.mjs
import { createFlow } from '../../sim/flow/screens.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 110) }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot(), ev)) break; } return ev; };
const push = (g, type, value = {}, via = 'key') => g.input.push({ type, t: 0, via, value });
const CONCEPTS = data.stages['forest-1-1'].concepts;
// ① 엔진 want 풀 — 1-1 3단원 장면
{ const qe = new QuestionEngine({ rng: createRng(5), concepts: CONCEPTS });
  ok('장면 단원 = g1-1-u3 · 학년 1 · 단원 키 103', qe.units.has('g1-1-u3') && qe.grade === 1 && qe.unitMax === 103, `${[...qe.units]} ${qe.grade} ${qe.unitMax}`);
  ok('unitOk: 1단원 비교·규칙은 됨', qe.unitOk('g1-1-u1', 'compare') && qe.unitOk('g1-1-u1', 'pattern'));
  ok('unitOk: 5단원(아직 안 배움)·2학년·word/calc 는 안 됨', !qe.unitOk('g1-1-u5', 'compare') && !qe.unitOk('g1-2-u5', 'pattern') && !qe.unitOk('g2-1-u1', 'compare') && !qe.unitOk('g1-1-u1', 'word') && !qe.unitOk('g1-1-u1', 'calc'));
  const cnt = {}; for (let i = 0; i < 60; i++) { const q = qe.next({ want: 'compare' }); cnt[q.concept] = (cnt[q.concept] || 0) + 1; if (!(GENERATORS[q.concept].compare === true && q.choices.length === 3 && new Set(q.choices.map(c => c.num)).size === 3)) { ok('compare 풀 = 비교형만', false, q.concept); break; } }
  ok('compare 셋 다 나옴(max·min·word)', cnt['g1.compare.max'] > 0 && cnt['g1.compare.min'] > 0 && cnt['g1.compare.word'] > 0, JSON.stringify(cnt));
  const pc = {}; for (let i = 0; i < 60; i++) { const q = qe.next({ want: 'pattern' }); pc[q.concept] = (pc[q.concept] || 0) + 1; if (!(GENERATORS[q.concept].pattern === true && q.hint2 === null && q.hint1 && q.type === 'calc1')) { ok('pattern 풀 = 규칙형만', false, q.concept); break; } }
  ok('pattern 둘 다 나옴', pc['g1.pattern.count'] > 0 && pc['g1.pattern.between'] > 0, JSON.stringify(pc));
  for (let i = 0; i < 40; i++) { const q = qe.next({ want: 'calc' }); if (GENERATORS[q.concept].unit !== 'g1-1-u3' || GENERATORS[q.concept].word) { ok('calc 풀은 장면 단원 계산형만', false, q.concept); break; } }
  for (let i = 0; i < 40; i++) { const q = qe.next({ want: 'word' }); if (!GENERATORS[q.concept].word) { ok('word 풀은 문장제만', false, q.concept); break; } }
  for (let i = 0; i < 60; i++) { const q = qe.next(); if (GENERATORS[q.concept].unit !== 'g1-1-u3') { ok('want 없으면 장면 개념만(1단원 안 섞임)', false, q.concept); break; } }
  ok('풀 검사 끝', true); }
// ② 생성기 내용 — 비교 정답 = 보기 중 최대/최소, 규칙 정답 = 다음 수, 세 보기가 전부 수(0~9)
{ const rng = createRng(9); let bad = 0;
  for (let i = 0; i < 500; i++) { const q = GENERATORS['g1.compare.max'].gen(rng, rng.next()); const xs = [q.prompt.args.a, q.prompt.args.b, q.prompt.args.c]; if (q.answer !== Math.max(...xs) || !q.wrongs.every(w => xs.includes(w[0]))) bad++; }
  ok('compare.max 정답 = 보기 최대 · 오답 = 나머지 두 수(500)', bad === 0, bad);
  bad = 0; for (let i = 0; i < 500; i++) { const q = GENERATORS['g1.pattern.count'].gen(rng, rng.next()); const s = q.prompt.args.s.split(', ').map(Number); if (s[2] + (s[1] - s[0]) !== q.answer || q.answer < 0 || q.answer > 9) bad++; }
  ok('pattern.count 정답 = 규칙대로 다음 수(500)', bad === 0, bad);
  const seen = new Set(); for (let i = 0; i < 300; i++) seen.add(GENERATORS['g1.pattern.count'].gen(rng, rng.next()).fact.split(':')[1].replace(/^\d+/, '')); ok('규칙 3종(+1·+2·−1)', seen.has('+1') && seen.has('+2') && seen.has('-1'), [...seen].join(' ')); }
// ③ 판 안: 얼음 장착 + 강화 수정 → 비교형 · 번개 → 규칙형 · 불꽃탄 → 계산형
function powerQ(spell, seed){ const f = createFlow({ data, grade: 1, seed, unlock: 'all', startZone: 1 }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game; run(f, 2); g.meteorOff = true; g.spell = spell;
  g.player.mana = 100; run(f, 6, s => s.crystals.some(c => c.kind === 'empower')); const c = g.crystals.find(c => c.kind === 'empower'); if (!c) return null;
  push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 6, s => { const x = s.crystals.find(y => y.uid === c.uid); return x && x.near; }); push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, .5); return g.screen === 'S08Q' ? g.q : null; }
for (const [spell, tag] of [['ice', 'compare'], ['lightning', 'pattern'], ['fireball', 'calc']]) { let n = 0, good = 0; for (const seed of [21, 22, 23, 24]) { const q = powerQ(spell, seed); if (!q) continue; n++; const G = GENERATORS[q.v.concept]; if (q.kind === 'power' && (tag === 'calc' ? (!G.word && G.unit === 'g1-1-u3') : G[tag] === true)) good++; }
  ok(`${spell} 강화 수정 → ${tag} (${n}판)`, n >= 3 && good === n, `${good}/${n}`); }
console.table(out); console.log(fail ? `✗ 실패 ${fail}` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
