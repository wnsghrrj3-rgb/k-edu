// 힌트(07 문서 8절)·문장제(보스 마지막 봉인 칸)·전투장 2 — 화면 없이 sim/ 만으로(node tests/sim/hint.mjs)
import { createFlow } from '../../sim/flow/screens.js';
import { loadData } from './load.mjs';
import { GENERATORS, QuestionEngine } from '../../sim/learn/questionEngine.js';
import { createRng } from '../../sim/core/rng.js';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: note }); if (!cond) fail++; };
const run = (f, s, until) => { const ev = []; for (let i = 0; i < 60 * s; i++) { f.step(1 / 60); ev.push(...f.drainEvents()); if (until && until(f.game.snapshot())) break; } return ev; };
const push = (g, type, value = {}, via = 'key') => g.input.push({ type, t: 0, via, value });
function setup(mode = 'keyboard', grade = 1){ const f = createFlow({ data, grade, seed: 21, unlock: 'all' }); f.action('start', { mode: mode === 'camera' ? 'mouse' : mode }); const g = f.game; run(f, 3.0); return { f, g }; }
// 수정 쳐서 문제 열기(키보드)
function openCrystal(f, g){ run(f, 40, s => s.crystals.length > 0); const c = g.crystals[0]; if (!c) return false; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 6, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, .5); return g.screen === 'S08Q'; }

// ① 생성기 — 문장제 2종 2만 개 검산 + 모든 생성기에 힌트 1·2 있음
{ const rng = createRng(7); let bad = 0, n = 0; for (const k of ['g1.compare.word', 'g1.join.word']) for (let i = 0; i < 10000; i++) { const q = GENERATORS[k].gen(rng, rng.next()); n++; if (!GENERATORS[k].verify(q) || q.type !== 'word1' || !q.hint1 || !q.hint2) bad++; }
  ok('문장제 2만 개 검산', bad === 0, `오류 ${bad}/${n}`);
  ok('전 생성기 힌트', Object.keys(GENERATORS).every(k => { const q = GENERATORS[k].gen(rng, .5); return q.hint1 && q.hint1.key && q.hint2 && q.hint2.kind === 'beads'; }), Object.keys(GENERATORS).length + '종');
  const qe = new QuestionEngine({ rng, concepts: data.stages['forest-1-1'].concepts }); const w = qe.next({ want: 'word' }), c = qe.next({ want: 'calc' });
  ok('want:word → 문장제', w.type === 'word1' && /word/.test(w.concept), w.concept); ok('want:calc → 계산형', c.type === 'calc1', c.concept); }

// ② 힌트 1→2 단계, 마나·숙달 y, 재도전 문제는 힌트 1부터
{ const { f, g } = setup(); ok('수정 열림', openCrystal(f, g));
  let s = g.snapshot(); ok('힌트 구슬 대상', s.targets.some(t => t.kind === 'hint' && t.id === 'hint'), s.targets.map(t => t.id).join(','));
  run(f, 2.0); push(g, 'HINT'); const ev1 = run(f, .1); s = g.snapshot();
  ok('힌트 1단계', s.question.hintStep === 1 && !!s.question.hint && !s.question.hintPic && ev1.some(e => e.type === 'q:hint' && e.step === 1), JSON.stringify(s.question.hint));
  push(g, 'SELECT', { id: 'hint', slot: -1 }, 'hand'); run(f, .1); s = g.snapshot();
  ok('힌트 2단계(손 대상)', s.question.hintStep === 2 && s.question.hintPic && s.question.hintPic.kind === 'beads', JSON.stringify(s.question.hintPic));
  ok('2단계 뒤 구슬 잠김', s.targets.find(t => t.id === 'hint').locked);
  const mp = g.player.mana, m0 = g.qe.m.get(g.q.v.concept).m; push(g, 'SELECT', { slot: g.q.v.correctSlot }); run(f, .1); const m1 = g.qe.m.get(g.stats.log.at(-1).concept).m;
  ok('힌트 2단계 정답 마나 +15', g.player.mana - mp === 15, `${mp}→${g.player.mana}`); ok('숙달 y=.6 (덜 오름)', m1 > m0 && m1 - m0 < .2 * (1 - .2), `${m0.toFixed(3)}→${m1.toFixed(3)}`);
  ok('기록에 hint·type', g.stats.log.at(-1).hint === 2 && g.stats.log.at(-1).type === 'calc1');
  run(f, 2); // 닫힘
  ok('오답 → 재도전', openCrystal(f, g)); run(f, 2.0); push(g, 'SELECT', { slot: (g.q.v.correctSlot + 1) % 3 }); run(f, 3.5);
  ok('재도전 문제는 힌트 1부터', openCrystal(f, g) && g.q.v.retry && g.q.hint === 1, `retry=${g.q && g.q.v.retry} hint=${g.q && g.q.hint}`); }

// ③ 1~2학년 카메라: 6초 손이 안 움직이면 부엉이 자동 · 3학년은 안 함
{ const { f, g } = setup('camera', 1); push(g, 'CURSOR', { x: .5, y: .5 }); ok('카메라 수정 열림', openCrystal(f, g)); run(f, 2.0, s => s.question && s.question.readP >= 1);
  const ev = run(f, 7.0, s => s.question.hintStep > 0); ok('1학년 6초 자동 힌트', g.q && g.q.hint === 1 && ev.some(e => e.type === 'q:hint' && e.auto), `t=${g.t.toFixed(1)}`); }
{ const { f, g } = setup('camera', 3); push(g, 'CURSOR', { x: .5, y: .5 }); openCrystal(f, g); run(f, 9.0); ok('3학년은 자동 힌트 없음', g.q && g.q.hint === 0, `hint=${g.q && g.q.hint}`); }

// ④ 전투장 2 → 보스 · 보스 마지막 칸 = 문장제 · 봉인 3번째부터 힌트 1
{ const rec = []; const r = playOne({ data, seed: 1007, acc: .9, react: .3, record: rec });
  const zones = rec.filter(e => e.type === 'zone:enter').map(e => e.idx ?? 0); const seals = r.log.filter(x => /seal/.test(x.qid) || x.type === 'word1');
  ok('전투장 2 거침', zones.includes(1) && r.win, `zone idx ${zones.join('→')} · 처치 ${r.kills}`);
  const words = r.log.filter(x => x.type === 'word1'); ok('보스 마지막 칸 문장제', words.length >= 1, `문장제 ${words.length}개 · 전체 ${r.q}`);
  // 재도전(전투장 2에서 패배하면 전투장 2부터)
  const f = createFlow({ data, grade: 1, seed: 5 }); f.action('start', { mode: 'keyboard' }); const g = f.game; for (let i = 0; i < 12 && g.zoneIdx === 0; i++) { run(f, 2.5); g.enemies.forEach(e => { if (e.state !== 'dead') { e.hp = 0; e.state = 'dead'; e.stateT = 0; } }); run(f, 2.5, s => s.world.zoneIdx === 1); }
  ok('전투장 2 진입', g.zoneIdx === 1 && g.checkpoint && g.checkpoint.zone === 'arena'); g.player.hp = 1; g.player.invulnUntil = 0; run(f, 60, s => s.screen === 'S14'); f.action('again'); run(f, .5);
  ok('전투장 2에서 지면 전투장 2부터', g.zoneIdx === 1 && g.screen === 'S08', `zoneIdx=${g.zoneIdx}`); }

console.table(out); console.log(fail ? `✗ 실패 ${fail}` : '전부 통과');
if (fail) process.exit(1);
