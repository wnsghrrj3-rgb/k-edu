// v3.0 월드 3 「측정의 협곡」(17 문서 7절 검증 계획) — node tests/sim/p19.mjs
// 비교 생성기 4종(번호 답 1~3·그림 bars:/tall:/cups:) / 길이 재기 3종(cm 답·그림 units:/ruler:/ruler2:) / 변환표 canyon-3-1 / 지도 협곡 열림 / 봇 canyon-3-1 1·2학년 완주
import { createFlow } from '../../sim/flow/screens.js';
import { createGame } from '../../sim/game/game.js';
import { QuestionEngine, GENERATORS } from '../../sim/learn/questionEngine.js';
import { conceptsFor } from '../../sim/learn/gradeTable.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), out = []; let fail = 0;
const ok = (name, cond, note = '') => { out.push({ 검사: name, 결과: cond ? '✓' : '✗', 메모: String(note).slice(0, 120) }); if (!cond) fail++; };
const T = data.text, ST = data.stages['canyon-3-1'];

// ── 1. 1학년 비교하기 4종: 답 = 번호 1~3 · 보기 3개 = {1,2,3} · 그림 셋이 서로 다른 값 · 정답 번호 = 가장 긴/짧은/높은/많은 것
{ const CMP = { 'g1.cmp.long': ['bars', 'max'], 'g1.cmp.short': ['bars', 'min'], 'g1.cmp.tall': ['tall', 'max'], 'g1.cmp.most': ['cups', 'max'] };
  let bad = 0, n = 0, near = 0; for (const [k, [kind, m]] of Object.entries(CMP)) { const qe = new QuestionEngine({ rng: createRng(19), concepts: [k] }); for (let i = 0; i < 75; i++) { const b = qe.next(); n++;
      const mt = (b.pic || '').match(new RegExp(`^${kind}:(\\d),(\\d),(\\d)$`)); if (!mt) { bad++; continue; } const vs = mt.slice(1).map(Number); const best = m === 'max' ? Math.max(...vs) : Math.min(...vs);
      const nums = b.choices.map(c => c.num).sort().join(); if (nums !== '1,2,3' || vs[b.choices[b.correctSlot].num - 1] !== best || new Set(vs).size !== 3 || b.choices.some(c => c.pic)) bad++;
      const sorted = vs.slice().sort((a, b2) => a - b2); if ((m === 'max' ? sorted[2] - sorted[1] : sorted[1] - sorted[0]) === 1) near++; } }
  ok(`비교 ${n}문: 그림 kind:a,b,c · 보기 = 1,2,3 · 정답 번호 = 가장 긴/짧은/높은/많은 것 · 보기 그림 없음`, bad === 0, `어긋남 ${bad}`);
  ok('비교: 새 엔진(d 낮음)에선 차이 1칸 판 없음(2칸 이상)', near === 0, `1칸 차 ${near}/${n}`);
  { const rng = createRng(29); let hi = 0; for (let i = 0; i < 200; i++) { const q = GENERATORS['g1.cmp.long'].gen(rng, .9); const vs = q.vs.slice().sort((a, b) => a - b); if (vs[2] - vs[1] === 1) hi++; } ok('비교: d 0.9 면 차이 1칸인 어려운 판이 나옴', hi > 20, `1칸 차 ${hi}/200`); }
  ok('비교 4종 max 9·choicePic 아님·unit g1-1-u4', Object.keys(CMP).every(k => GENERATORS[k] && !GENERATORS[k].choicePic && GENERATORS[k].max === 9 && GENERATORS[k].unit === 'g1-1-u4')); }

// ── 2. 2학년 길이 재기 3종: cm 답 · 그림 units:n / ruler:a,b / ruler2:x,y 와 답이 맞음 · 오답 셋 서로 다르고 양수
{ let bad = 0, n = 0, a0 = 0, aN = 0; for (const k of ['g2.len.unit', 'g2.len.ruler', 'g2.len.diff']) { const qe = new QuestionEngine({ rng: createRng(23), concepts: [k] }); for (let i = 0; i < 100; i++) { const b = qe.next(); n++; const ans = b.choices[b.correctSlot].num;
      let want = null; let mt; if ((mt = (b.pic || '').match(/^units:(\d)$/))) want = +mt[1]; else if ((mt = (b.pic || '').match(/^ruler:(\d+),(\d+)$/))) { want = mt[2] - mt[1]; if (+mt[1] === 0) a0++; else aN++; if (+mt[2] > 10) bad++; } else if ((mt = (b.pic || '').match(/^ruler2:(\d+),(\d+)$/))) { want = Math.abs(mt[1] - mt[2]); if (mt[1] === mt[2] || +mt[1] > 10 || +mt[2] > 10) bad++; }
      if (want === null || want !== ans || ans < 1 || b.choices.length < 3 || new Set(b.choices.map(c => c.num)).size !== b.choices.length || b.choices.some(c => c.num < 0 || c.pic)) bad++; } }
  ok(`길이 재기 ${n}문: 그림과 답 일치(조각 수 · b−a · |x−y|) · 자 눈금 ≤10 · 보기 서로 다름·음수 없음`, bad === 0, `어긋남 ${bad}`);
  ok('자 읽기: 0 에서 시작하는 판과 0 이 아닌 눈금에서 시작하는 판(끝 눈금 그대로 읽는 오답) 둘 다', a0 > 10 && aN > 10, `0시작 ${a0} · n시작 ${aN}`); }

// ── 3. 변환표·스테이지·문구
{ ok('canyon-3-1: world canyon · requires 2-보스 · recLevel 3 · 1학년 = 비교 4키 · 2학년 = 길이 재기 3키 · 3학년 = 환산 11키 · 4학년 = g3 임시', ST.world === 'canyon' && ST.requires === 'temple-2-boss' && ST.recLevel === 3 && conceptsFor(data, ST, 1).join() === 'g1.cmp.long,g1.cmp.short,g1.cmp.tall,g1.cmp.most' && conceptsFor(data, ST, 2).join() === 'g2.len.unit,g2.len.ruler,g2.len.diff' && conceptsFor(data, ST, 3).length === 11 && conceptsFor(data, ST, 3)[0] === 'g3.len.mm' && conceptsFor(data, ST, 4).join() === conceptsFor(data, ST, 3).join());   /* v3.2 3학년 줄 11키, 4학년 = g3 임시 */
  ok('퍼즐 = 길 B length-bridge 60%(v3.1) · 정령·방패병 0 · 보스 0 · 전투장 2', ST.zones.every(z => (!z.puzzle || (z.id === 'rail-b' && z.puzzle.type === 'length-bridge' && z.puzzle.at === .6)) && z.type !== 'boss') && !JSON.stringify(ST.zones).includes('shape-spirit') && !JSON.stringify(ST.zones).includes('shield-goblin') && ST.zones.filter(z => z.type === 'arena').length === 2);
  const g1 = createGame({ data, seed: 3, grade: 1, stageId: 'canyon-3-1' }), g2 = createGame({ data, seed: 3, grade: 2, stageId: 'canyon-3-1' });
  ok('엔진: 1학년 concepts 4(g1-1-u4) · 2학년 3(g2-1-u4) · empty 아님 · world.id canyon', !g1.qe.empty && g1.qe.concepts.length === 4 && [...g1.qe.units].join() === 'g1-1-u4' && !g2.qe.empty && g2.qe.concepts.length === 3 && [...g2.qe.units].join() === 'g2-1-u4' && g1.snapshot().world.id === 'canyon');
  const keys = ['stage.canyon-3-1', 'map.locked.canyon-3-1', 'map.world.canyon', 'toast.canyon.rail', 'hud.railCanyon', 'why.cmp-most', 'why.cmp-least', 'why.cmp-middle', 'why.read-end', 'why.count-ticks', 'why.read-long', 'why.read-short', 'why.count-off'];
  ok('문구 키 13 + learn·q·hint 7종씩', keys.every(k => !!T[k]) && ['g1.cmp.long', 'g1.cmp.short', 'g1.cmp.tall', 'g1.cmp.most', 'g2.len.unit', 'g2.len.ruler', 'g2.len.diff'].every(k => T['learn.' + k] && T['q.' + k] && T['hint.' + k])); }

// ── 4. 지도: 신전 → 협곡 열림 · 스테이지 1(잠김: 2-보스 안 깸) · 2-보스 깬 기록이면 열림
{ const f = createFlow({ data, grade: 1, seed: 1 }); f.action('start', { mode: 'keyboard' }); f.action('world', { dir: 1 }); f.action('world', { dir: 1 }); let s = f.snapshot();
  ok('협곡: worldName 측정의 협곡 · 🏜 · worldIdx 2 · 스테이지 1 잠김 · learn = 비교 4키', s.map.world === 'canyon' && s.map.worldName === '측정의 협곡' && s.map.worldIcon === '🏜' && s.map.worldIdx === 2 && s.map.stages.length === 1 && s.map.stages[0].locked && s.map.learn.length === 4);
  f.action('enter'); ok('잠긴 협곡 enter → 토스트 map.locked.canyon-3-1 · 판 없음', !f.game && f.snapshot().toast === 'map.locked.canyon-3-1');
  const f2 = createFlow({ data, grade: 2, seed: 1, progress: { xp: 0, level: 3, cleared: { 'forest-1-1': 3, 'forest-1-2': 3, 'forest-1-3': 3, 'forest-1-boss': 3, 'temple-2-1': 3, 'temple-2-boss': 3 }, unlocked: [] } }); f2.action('start', { mode: 'keyboard' }); f2.action('world', { dir: 1 }); f2.action('world', { dir: 1 }); s = f2.snapshot();
  ok('2-보스 깬 기록 → canyon-3-1 열림 · 2학년 learn 3키 · enter 되면 판 생김', !s.map.stages[0].locked && s.map.learn.length === 3 && (f2.action('enter'), !!f2.game)); }

// ── 5. 봇 완주(1·2학년) — 문제가 전부 그림 문제(pic) · 1학년 답 ≤3
{ for (const grade of [1, 2]) { let wins = 0, qs = 0, badPic = 0; for (const seed of [11, 12, 13]) { const rec = []; const r = playOne({ data, seed, grade, acc: .8, stage: 'canyon-3-1', rand: createRng(seed).next, record: rec }); if (r.win) wins++; qs += r.q || 0;
      for (const e of rec.filter(e => e.type === 'q:open')) { if (!(e.concept && (e.concept.startsWith(grade === 1 ? 'g1.cmp.' : 'g2.len.') || e.concept === `g${grade}.clock.read`))) badPic++; } }   /* v3.4 시간 정령 시계 문제(전투장 2)는 허용 */
    ok(`봇 ${grade}학년 canyon-3-1 3판 완주 · 문제 전부 ${grade === 1 ? '비교' : '길이 재기'} 개념(+시간 정령 시계)`, wins === 3 && badPic === 0, `wins ${wins} q ${qs} 다른 개념 ${badPic}`); }
  // 판 안 스냅샷: 문제 그림이 측정 그림(pic 문자열)
  { const rec = []; playOne({ data, seed: 14, grade: 1, acc: .8, stage: 'canyon-3-1', rand: createRng(14).next, record: rec }); const g = createGame({ data, seed: 14, grade: 1, stageId: 'canyon-3-1' }); const b = g.qe.next(); ok('판 엔진의 첫 문제: pic = 측정 그림 · 보기 3 · 답 1~3', /^(bars|tall|cups):\d,\d,\d$/.test(b.pic) && b.choices.length === 3 && b.choices[b.correctSlot].num <= 3); } }

console.table(out); console.log(fail ? `✗ ${fail} 실패` : '✓ 전부 통과');
process.exit(fail ? 1 : 0);
