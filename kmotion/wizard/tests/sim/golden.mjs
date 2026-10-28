// 골든 리플레이(13 문서 9절 · 12 문서 7절) — 시드 + 입력 기록(키 이벤트와 시각)만으로 한 판을 다시 돌려 같은 결과(이벤트 해시·통계)가 나오는지
// node tests/sim/golden.mjs            → tests/golden/*.json 과 대조(시스템을 바꿔 결과가 달라지면 실패 = 「손맛이 바뀌었다」는 신호)
// node tests/sim/golden.mjs --update   → 시드 봇으로 다시 녹음(수치를 일부러 바꾼 뒤에만)
// 스킨 쪽 쓰임: 같은 inputs 를 boot 가 재생하면 그림만 바꾼 스킨이 같은 판을 그린다(hq 스킨 교체 8단계 중 「골든 리플레이 1개 통과」)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createFlow } from '../../sim/flow/screens.js';
import { createRng } from '../../sim/core/rng.js';
import { loadData } from './load.mjs';
import { playOne } from './run.mjs';
const data = loadData(), DIR = new URL('../golden/', import.meta.url), UPDATE = process.argv.includes('--update');
const GOLDEN = [{ name: 'forest-1-1', seed: 4242, stage: 'forest-1-1' }, { name: 'forest-1-2', seed: 4343, stage: 'forest-1-2' }, { name: 'forest-1-3', seed: 4444, stage: 'forest-1-3' }];
const hashOf = evs => { let h = 7; for (const ev of evs) { const s = ev.type + '|' + (ev.amount != null ? ev.amount : '') + '|' + (ev.uid != null ? ev.uid : '') + '|' + (ev.slot != null ? ev.slot : ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000000007; } return h; };
const statsOf = g => { const st = g.stats; return { win: g.snapshot().screen === 'S13', kills: st.kills, q: st.q, right: st.right, puzzles: st.puzzles || 0, fireflies: st.fireflies || 0, shields: st.shields || 0, bounces: st.bounces || 0, zone: g.zoneIdx, t: Math.round(g.t) }; };

function record(G){
  const rng = createRng(G.seed * 7 + 1), inputs = [], record = [];
  const r = playOne({ data, seed: G.seed, acc: .85, react: .35, stage: G.stage, rand: () => rng.next(), inputLog: inputs, record, progress: { xp: 0, level: 1 } });
  return { seed: G.seed, stage: G.stage, grade: 1, inputs, hash: hashOf(record), stats: { win: r.win, kills: r.kills, q: r.q, right: r.right, puzzles: r.puzzles, fireflies: r.fireflies, shields: r.shields, bounces: r.bounces, zone: r.zone, t: r.t } };
}
export function replay(gd){
  const f = createFlow({ data, grade: gd.grade || 1, seed: gd.seed, stage: gd.stage, forceStage: true, progress: { xp: 0, level: 1 } }); f.action('start', { mode: 'keyboard', seed: gd.seed });
  const g = f.game, evs = []; let i = 0; const dt = 1 / 60; const endT = (gd.inputs.at(-1) ? gd.inputs.at(-1).at / 1000 : 0) + 20;
  while (f.t < endT) { const tMs = Math.round(f.t * 1000); while (i < gd.inputs.length && gd.inputs[i].at <= tMs) { const inp = gd.inputs[i++]; g.input.push({ type: inp.type, t: inp.at, via: 'key', value: inp.value }); }
    f.step(dt); evs.push(...f.drainEvents()); const sc = g.snapshot().screen; if (sc === 'S13' || sc === 'S14') { if (sc === 'S14' && i < gd.inputs.length) { f.action('again'); continue; } break; } }
  return { hash: hashOf(evs), stats: statsOf(g) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true }); let fail = 0; const rows = [];
  for (const G of GOLDEN) { const file = new URL(G.name + '.json', DIR);
    if (UPDATE || !existsSync(file)) { const gd = record(G); const chk = replay(gd); if (chk.hash !== gd.hash) { console.log('녹음 직후 재생이 다름(결정성 깨짐):', G.name, gd.hash, chk.hash); fail++; } writeFileSync(file, JSON.stringify(gd)); rows.push({ 판: G.name, 상태: '녹음', 입력: gd.inputs.length, 해시: gd.hash, 결과: JSON.stringify(gd.stats) }); continue; }
    const gd = JSON.parse(readFileSync(file, 'utf8')); const r = replay(gd); const same = r.hash === gd.hash && JSON.stringify(r.stats) === JSON.stringify(gd.stats); if (!same) fail++;
    rows.push({ 판: G.name, 상태: same ? '✓ 같음' : '✗ 다름', 입력: gd.inputs.length, 해시: `${gd.hash}${same ? '' : ' → ' + r.hash}`, 결과: same ? JSON.stringify(gd.stats) : JSON.stringify(gd.stats) + ' → ' + JSON.stringify(r.stats) }); }
  console.table(rows); if (fail) { console.log('✗ 골든 리플레이 불일치 — 의도한 수치 변경이면 --update'); process.exit(1); } console.log('전부 통과');
}
