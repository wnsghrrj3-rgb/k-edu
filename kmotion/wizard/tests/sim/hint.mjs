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
function setup(mode = 'keyboard', grade = 1){ const f = createFlow({ data, grade, seed: 21, unlock: 'all', startZone: 1 }); f.action('start', { mode: mode === 'camera' ? 'mouse' : mode }); f.action('enter'); const g = f.game; run(f, 3.0); return { f, g }; }
// 수정 쳐서 문제 열기(키보드)
function openCrystal(f, g){ run(f, 40, s => s.crystals.length > 0); const c = g.crystals[0]; if (!c) return false; push(g, 'MOVE', { u: c.pos[0] / 4 }); run(f, 6, s => s.crystals[0] && s.crystals[0].near); push(g, 'ATTACK', { zone: 1, side: 'R' }); run(f, .5); return g.screen === 'S08Q'; }

// ① 생성기 — 문장제 2종 2만 개 검산 + 모든 생성기에 힌트 1·2 있음
{ const rng = createRng(7); let bad = 0, n = 0; for (const k of ['g1.compare.word', 'g1.join.word']) for (let i = 0; i < 10000; i++) { const q = GENERATORS[k].gen(rng, rng.next()); n++; if (!GENERATORS[k].verify(q) || q.type !== 'word1' || !q.hint1 || !q.hint2) bad++; }
  ok('문장제 2만 개 검산', bad === 0, `오류 ${bad}/${n}`);
  const g1u3 = Object.keys(GENERATORS).filter(k => GENERATORS[k].unit === 'g1-1-u3');
  ok('1-1 3단원 전 생성기 힌트', g1u3.every(k => { const q = GENERATORS[k].gen(rng, .5); return q.hint1 && q.hint1.key && q.hint2 && q.hint2.kind === 'beads'; }), g1u3.length + '종');
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
  ok('전투장 2 거침', zones.includes(3) && r.win, `zone idx ${zones.join('→')} · 처치 ${r.kills}`);
  const words = r.log.filter(x => x.type === 'word1'); ok('보스 마지막 칸 문장제', words.length >= 1, `문장제 ${words.length}개 · 전체 ${r.q}`);
  // 재도전(전투장 2에서 패배하면 전투장 2부터)
  const f = createFlow({ data, grade: 1, seed: 5, startZone: 1 }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const g = f.game; for (let i = 0; i < 12 && g.zoneIdx === 1; i++) { run(f, 2.5); g.enemies.forEach(e => { if (e.state !== 'dead') { e.hp = 0; e.state = 'dead'; e.stateT = 0; } }); run(f, 2.5, s => s.world.zoneIdx !== 1); }
  if (g.zoneIdx === 2) { g.jumpZone(3); run(f, .5); }   // 길 B는 p3.mjs 가 따로 검사 — 여기선 전투장 2 체크포인트만
  ok('전투장 2 진입', g.zoneIdx === 3 && g.checkpoint && g.checkpoint.zone === 'arena'); g.player.hp = 1; g.player.invulnUntil = 0; run(f, 60, s => s.screen === 'S14'); f.action('again'); run(f, .5);
  ok('전투장 2에서 지면 전투장 2부터', g.zoneIdx === 3 && g.screen === 'S08', `zoneIdx=${g.zoneIdx}`); }

// ⑤ 손 유지 마법 바퀴(멈춤 화면) · 경험치·레벨
{ const { f, g } = setup('camera', 1); push(g, 'PAUSE'); run(f, .1); let s = g.snapshot();
  ok('멈춤 → 바퀴 대상(주 마법 3 + 다시)', s.paused === 'user' && s.targets.filter(t => t.kind === 'menu').length === 3 + 1, s.targets.map(t => t.id).join(','));
  ok('멈춤 중 모드 hands', f.wantModes().join() === 'hands');
  const tg = s.targets.find(t => t.id === 'spell:ice'); push(g, 'CURSOR', { x: tg.rect.x + tg.rect.w / 2, y: tg.rect.y + tg.rect.h / 2 }); const ev = run(f, 1.0, s => s.player.main === 'ice');
  ok('손 유지 → 얼음 폭풍 장착', g.spell === 'ice' && ev.some(e => e.type === 'spell:equip'), `main=${g.spell} t=${g.t.toFixed(2)}`);
  const rs = s.targets.find(t => t.id === 'resume'); push(g, 'CURSOR', { x: rs.rect.x + rs.rect.w / 2, y: rs.rect.y + rs.rect.h / 2 }); run(f, 1.2, s => !s.paused);
  ok('손 유지 → 다시 하기', !g.paused && g.snapshot().targets.length === 0);
  const { f: f2, g: g2 } = setup('keyboard', 1); push(g2, 'PAUSE'); run(f2, .1); ok('키보드 멈춤엔 바퀴 대상 없음(DOM 버튼)', g2.snapshot().targets.length === 0); }
{ const rec = []; const r = playOne({ data, seed: 1011, acc: .9, react: .3, record: rec }); const lv = rec.filter(e => e.type === 'level:up').map(e => e.level), xp = rec.filter(e => e.type === 'xp');
  ok('경험치 이벤트(처치·정답·클리어)', ['kill', 'q', 'clear', 'boss'].every(w => xp.some(e => e.why === w)), [...new Set(xp.map(e => e.why))].join(' '));
  ok('한 판 안에 레벨 업', lv.length >= 1 && r.win, `Lv ${lv.join('→')}`);
  const f = createFlow({ data, grade: 1, seed: 3, progress: { level: 10, xp: 0 } }); f.action('start', { mode: 'keyboard' }); f.action('enter'); const P = f.game.snapshot().player;
  ok('레벨 10 이어받기 → HP 136·ATK 14.5', P.level === 10 && P.hpMax === 136 && Math.abs(f.game.player.atk - 14.5) < 1e-9 && P.xpNext === 1343, `hp ${P.hpMax} atk ${f.game.player.atk} next ${P.xpNext}`);
  const f3 = createFlow({ data, grade: 1, seed: 3, progress: { level: 30, xp: 99999 } }); f3.action('start', { mode: 'keyboard' }); f3.action('enter'); run(f3, 1); f3.game.gainXp && f3.game.gainXp(1000);
  ok('최대 레벨 30 고정', f3.game.snapshot().player.level === 30);
  // 레벨 차이 상한 ±25%: 레벨 30 → 받는 피해 ×.75
  const f4 = createFlow({ data, grade: 1, seed: 4, progress: { level: 30, xp: 0 } }); f4.action('start', { mode: 'keyboard' }); f4.action('enter'); run(f4, 1); const g4 = f4.game; g4.player.invulnUntil = 0; const hp = g4.player.hp;
  g4.enemyStrike({ uid: 0, kind: 'test', telegraph: { center: g4.player.pos.slice(), size: [1] }, def: { atk: 100 } });
  ok('레벨 30 받는 피해 −25%', hp - g4.player.hp < 100 * .7 * .75 + 1 && hp - g4.player.hp > 100 * .7 * .75 - 8, `피해 ${hp - g4.player.hp}`); }

console.table(out); console.log(fail ? `✗ 실패 ${fail}` : '전부 통과');
if (fail) process.exit(1);
