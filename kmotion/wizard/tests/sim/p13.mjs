// v2.9 월드 2 「도형의 신전」(16 문서 7절 검증 계획) — node tests/sim/p13.mjs
// 그림 보기(choicePic → choices[].pic·num 은 코드) / 문제 그림(pic) / 2학년 변환표 temple-2-1 / 지도 월드 바꾸기(앞·다음·받침대·] 키·닫힌 세계 토스트·잠김 requires) / 봇 temple-2-1 1·2학년 완주
import { createFlow } from '../../sim/flow/screens.js';
import { createGame } from '../../sim/game/game.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { conceptsFor } from '../../sim/learn/gradeTable.js';
import { PIC, FAMILY } from '../../sim/learn/pics.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['temple-2-1'];

// ── 1. 생성기·엔진: 그림 보기
{ const picKeys = ['g1.solid.same', 'g1.solid.prop', 'g2.plane.pick', 'g2.plane.not', 'g2.plane.bySides'], numKeys = ['g1.solid.count', 'g2.plane.count', 'g2.cubes.count'];
  ok('그림 보기 생성기 5종 choicePic · 수 답 3종 아님', picKeys.every(k => GENERATORS[k] && GENERATORS[k].choicePic) && numKeys.every(k => GENERATORS[k] && !GENERATORS[k].choicePic));
  let bad = 0, n = 0; for (const k of picKeys) { const qe = new QuestionEngine({ rng: createRng(5), concepts: [k] }); for (let i = 0; i < 60; i++) { const b = qe.next(); n++;
      const pics = b.choices.map(c => c.pic); if (!(pics.every(p => p && FAMILY[p]) && new Set(pics).size === 3 && b.choices.every(c => PIC[c.num] === c.pic) && b.choicePic)) bad++;
      // 정답 그림 하나만 그 묶음(fam)·오답은 다른 묶음(not 은 반대)
      const q = b; const fams = b.choices.map(c => FAMILY[c.pic]); const af = fams[b.correctSlot]; const others = fams.filter((_, i) => i !== b.correctSlot);
      if (k === 'g2.plane.not') { if (!(others[0] === others[1] && others[0] !== af)) bad++; } else if (others.some(f => f === af)) bad++; } }
  ok(`그림 보기 ${n}문: 보기 pic 3·서로 다름·num = 코드·정답 묶음만 정답`, bad === 0, `어긋남 ${bad}`);
  bad = 0; n = 0; for (const k of numKeys) { const qe = new QuestionEngine({ rng: createRng(6), concepts: [k] }); for (let i = 0; i < 60; i++) { const b = qe.next(); n++; if (!(typeof b.pic === 'string' && b.pic.length > 0 && b.choices.every(c => c.pic === null) && Number.isInteger(b.answer))) bad++;
      if (k === 'g2.cubes.count' && !/^cubes:\d(,\d){1,3}$/.test(b.pic)) bad++; if (k === 'g1.solid.count' && !/^row:(\w+,){3,5}\w+$/.test(b.pic)) bad++; if (k === 'g2.plane.count' && !FAMILY[b.pic]) bad++; } }
  ok(`수 답 ${n}문: 문제 그림 있음(row:·cubes:·도형)·보기 pic null`, bad === 0, `어긋남 ${bad}`);
  // 숫자 생성기는 pic·choicePic 없음(기존 그대로)
  { const qe = new QuestionEngine({ rng: createRng(7), concepts: ['g1.add.expr9'] }); const b = qe.next(); ok('숫자 생성기: pic null·choicePic false·choices[].pic null(기존 무변경)', b.pic === null && b.choicePic === false && b.choices.every(c => c.pic === null)); }
}

// ── 2. 변환표·스테이지
{ ok('temple-2-1: world temple · requires 1-보스 · 1학년 개념 = 입체 3키 · 2학년 = 평면·쌓기나무 5키 · 3학년 = 평면도형·원 7키(v2.10, 상세는 p14)', ST.world === 'temple' && ST.requires === 'forest-1-boss' && conceptsFor(data, ST, 1).join() === 'g1.solid.same,g1.solid.prop,g1.solid.count' && conceptsFor(data, ST, 2).join() === 'g2.plane.pick,g2.plane.not,g2.plane.count,g2.plane.bySides,g2.cubes.count' && conceptsFor(data, ST, 3).length === 7 && conceptsFor(data, ST, 3)[0] === 'g3.line.find');
  ok('방패병 없음(방패 식은 수와 연산) · 퍼즐 없음(도형 퍼즐은 2차) · 보스 없음', !JSON.stringify(ST.zones).includes('shield-goblin') && ST.zones.every(z => !z.puzzle) && ST.zones.every(z => z.type !== 'boss'));
  const g1 = createGame({ data, seed: 3, grade: 1, stageId: 'temple-2-1' }), g2 = createGame({ data, seed: 3, grade: 2, stageId: 'temple-2-1' });
  ok('엔진: 1학년 concepts 3(g1-1-u2) · 2학년 5(g2-1-u2) · empty 아님 · world.id temple', !g1.qe.empty && g1.qe.concepts.length === 3 && [...g1.qe.units].join() === 'g1-1-u2' && !g2.qe.empty && g2.qe.concepts.length === 5 && [...g2.qe.units].join() === 'g2-1-u2' && g1.snapshot().world.id === 'temple');
  ok('문구 키: stage.temple-2-1 · map.locked.temple-2-1 · map.world.temple · learn 8키', !!T['stage.temple-2-1'] && !!T['map.locked.temple-2-1'] && !!T['map.world.temple'] && ['g1.solid.same', 'g1.solid.prop', 'g1.solid.count', 'g2.plane.pick', 'g2.plane.not', 'g2.plane.count', 'g2.plane.bySides', 'g2.cubes.count'].every(k => !!T['learn.' + k]));
}

// ── 3. 지도 월드 바꾸기
{ const f = createFlow({ data, grade: 1, seed: 1 }); f.action('start', { mode: 'keyboard' }); let s = f.snapshot();
  ok('처음: 숲 · 스테이지 4 · world:next 열림·world:prev 없음', s.map.world === 'forest' && s.map.stages.length === 4 && s.map.worldIdx === 0 && s.targets.some(t => t.id === 'world:next' && !t.locked) && !s.targets.some(t => t.id === 'world:prev'));
  f.action('world', { dir: 1 }); s = f.snapshot();
  ok('다음 세계 → 신전 · 스테이지 1(잠김, 1-보스 전) · 고른 것 = temple-2-1 · enter 잠김 · learn = 입체 3키', s.map.world === 'temple' && s.map.worldName === '도형의 신전' && s.map.worldIcon === '⛩' && s.map.stages.length === 1 && s.map.stages[0].locked && s.map.stage === 'temple-2-1' && s.map.locked && s.targets.find(t => t.id === 'enter').locked && s.map.learn.join() === 'g1.solid.same,g1.solid.prop,g1.solid.count');
  ok('신전에서 world:prev 있음(열림) · world:next 있음(협곡 닫힘 = locked)', s.targets.some(t => t.id === 'world:prev' && !t.locked) && s.targets.some(t => t.id === 'world:next' && t.locked));
  f.action('enter'); ok('잠긴 신전 enter → 토스트 map.locked.temple-2-1 · 판 없음', !f.game && f.snapshot().toast === 'map.locked.temple-2-1');
  f.action('world', { dir: 1 }); ok('닫힌 협곡으로 → 토스트 worldClosed · 그대로 신전', f.snapshot().toast === 'map.worldClosed' && f.snapshot().map.world === 'temple');
  f.action('world', { id: 'forest' }); s = f.snapshot(); ok('받침대 id 로 숲 → 숲 · 고른 것 = 1-1', s.map.world === 'forest' && s.map.stage === 'forest-1-1');
  f.key('BracketRight', true, 0); ok('] 키 → 신전', f.snapshot().map.world === 'temple'); f.key('BracketLeft', true, 0); ok('[ 키 → 숲', f.snapshot().map.world === 'forest');
  // 1-보스를 깬 기록 → 신전 열림 · 들어가기 · 화살표가 세계 끝을 넘어감(잠긴 칸은 pick 이 안 되므로 다 깬 기록으로)
  const f2 = createFlow({ data, grade: 1, seed: 2, progress: { cleared: { 'forest-1-1': 3, 'forest-1-2': 3, 'forest-1-3': 3, 'forest-1-boss': 3 }, crystals: ['number'] } }); f2.action('start', { mode: 'keyboard' });
  for (let i = 0; i < 4; i++) f2.key('ArrowRight', true, 0); ok('→ 4번: 숲 끝에서 신전으로 넘어감', f2.snapshot().map.world === 'temple'); f2.key('ArrowLeft', true, 0); ok('← 신전 첫 칸에서 숲으로 · 고른 것 = 1-보스(마지막)', f2.snapshot().map.world === 'forest' && f2.snapshot().map.stage === 'forest-1-boss');
  f2.action('world', { dir: 1 });
  ok('1-보스 깬 뒤: 신전 열림 · enter 가능', !f2.snapshot().map.locked && !f2.snapshot().targets.find(t => t.id === 'enter').locked); f2.action('enter'); ok('신전 판 시작 · world temple · 스테이지 이름', !!f2.game && f2.game.snapshot().world.id === 'temple' && f2.game.snapshot().world.stageName === '모양의 문');
  // ?stage= 강제 → 월드 자동
  const f3 = createFlow({ data, grade: 2, seed: 3, stage: 'temple-2-1', forceStage: true }); f3.action('start', { mode: 'keyboard' }); ok('?stage=temple-2-1(잠김 무시) → 바로 판 · 2학년 concepts 평면', !!f3.game && f3.game.qe.concepts[0] === 'g2.plane.pick');
}

// ── 4. 봇 완주(1·2학년) — 문제가 전부 그림 문제(pic 또는 choicePic)
{ const seen = { pic: 0, choicePic: 0, none: 0 }; const rec = s => { const q = s.question; if (!q) return; if (q.choices.some(c => c.pic)) seen.choicePic++; else if (q.pic) seen.pic++; else seen.none++; };
  for (const grade of [1, 2]) { let wins = 0, qs = 0; for (const seed of [11, 12, 13]) { const r = playOne({ data, seed, grade, acc: .8, stage: 'temple-2-1', rand: createRng(seed).next }); if (r.win) wins++; qs += r.q || 0; }
    ok(`봇 ${grade}학년 temple-2-1 3판 완주`, wins === 3, `wins ${wins} q ${qs}`); }
  // 2학년 한 판의 문제 개념 — 전부 g2-1-u2 그림 생성기(choicePic 5종 + 수 답 3종 둘 다 나옴)
  { const rec = []; playOne({ data, seed: 21, grade: 2, acc: .8, stage: 'temple-2-1', rand: createRng(21).next, record: rec }); const opens = rec.filter(e => e.type === 'q:open'); const cps = opens.map(e => e.concept || '');
    const picN = cps.filter(c => GENERATORS[c] && GENERATORS[c].choicePic).length, numN = cps.filter(c => GENERATORS[c] && !GENERATORS[c].choicePic).length, other = cps.filter(c => !GENERATORS[c] || GENERATORS[c].unit !== 'g2-1-u2').length;
    ok('2학년 판: 문제 전부 g2-1-u2 · 그림 보기 문제·수 답 문제 둘 다 나옴', opens.length > 0 && other === 0 && picN > 0 && numN > 0, `열림 ${opens.length} 그림 보기 ${picN} 수 답 ${numN} 밖 ${other}`); }
}
console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과'); process.exit(fail ? 1 : 0);
