// 긴장·설렘 층 — 열 시대 데이터 연결(10-16): 쫓김 1·급한 일 1·일과 4+·숨은 것 3, 깃발이 상황 선택지와 맞물리는지
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const ERAS = ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life'];
const flagsOf = (s) => (s || '').replace(/[()!]/g, ' ').split(/&&|\|\|/).map((x) => x.trim()).filter(Boolean);
for (const era of ERAS) {
  const d = path.join(root, 'eras', era); const w = JSON.parse(fs.readFileSync(path.join(d, 'world.json'), 'utf8')); const lf = JSON.parse(fs.readFileSync(path.join(d, 'life.json'), 'utf8')); const npcs = JSON.parse(fs.readFileSync(path.join(d, 'npcs.json'), 'utf8'));
  const P = w.pulse; const sits = lf.situations; const sit = (id) => sits.find((s) => s.id === id);
  ok(P && P.chases?.length >= 1 && P.deadlines?.length >= 1 && P.routines?.length >= 4 && P.secrets?.length === 3, `${era}: 쫓김 ${P?.chases?.length} · 급한 일 ${P?.deadlines?.length} · 일과 ${P?.routines?.length} · 숨은 것 ${P?.secrets?.length}`);
  if (!P) continue;
  const blob = JSON.stringify(npcs) + JSON.stringify(sits.map((s) => s.choices.map((c) => c.flag)));
  for (const c of P.chases) {
    ok(w.areas[c.from] && w.areas[c.goal_at] && c.from !== c.goal_at, `${era} 쫓김 ${c.id}: from·goal 이 서로 다른 구역`);
    ok(c.caughtHurt in (lf.hurts || {}), `${era} 쫓김 ${c.id}: 흔적 ${c.caughtHurt} 가 hurts 에`);
    ok(!c.pursuer?.animal || (w.animals || {})[c.pursuer.animal], `${era} 쫓김 ${c.id}: 쫓는 짐승 ${c.pursuer?.animal || '(사람)'}`);
    const untilSit = flagsOf(c.until).map((f) => f.match(/^sit:([a-z0-9_]+):done$/)?.[1]).filter(Boolean)[0]; const s = untilSit ? sit(untilSit) : sits.find((x) => x.choices.some((y) => y.done === c.caughtFlag));
    ok(s, `${era} 쫓김 ${c.id}: until 이 상황 ${untilSit || s?.id} 과 맞물림`);
    if (s) { ok(s.choices.some((x) => x.done === c.caughtFlag), `${era} 쫓김 ${c.id}: 잡힘 ${c.caughtFlag} 이 상황 선택지`); ok(s.choices.some((x) => x.done === c.escapedFlag) || !sits.some((x) => x.choices.some((y) => y.done === c.escapedFlag)), `${era} 쫓김 ${c.id}: 놓침 ${c.escapedFlag} 은 선택지이거나 조용한 깃발`); }
    const on = flagsOf(c.on)[0]; ok(/^sit:/.test(on) || blob.includes(`"${on}"`), `${era} 쫓김 ${c.id}: 시작 깃발 ${on} 을 세우는 곳(상황 열림 또는 NPC 선택지)`);
  }
  for (const dl of P.deadlines) {
    const onSit = flagsOf(dl.on).map((f) => f.match(/^sit:([a-z0-9_]+):open$/)?.[1]).filter(Boolean)[0]; const s = onSit && sit(onSit);
    ok(s, `${era} 급한 일 ${dl.id}: 상황 ${onSit} 이 열릴 때`); ok(s && s.choices.some((x) => x.done === dl.failFlag), `${era} 급한 일 ${dl.id}: 늦으면 서는 ${dl.failFlag} 선택지`);
    ok(dl.sec >= 30 && dl.sec <= 120, `${era} 급한 일 ${dl.id}: ${dl.sec}초`);
  }
  ok(P.routines.every((r) => npcs[r.actor] && w.areas[r.day] && w.areas[r.night]), `${era} 일과: 사람·낮·밤 자리 전부 있음`);
  ok(P.secrets.every((s) => w.areas[s.at] && s.heirloom && s.fact && w.journal[s.journal] && (s.craft || s.heart)), `${era} 숨은 것: 자리·물려줄 것·실제·탐험일지·값`);
  ok(new Set(P.secrets.map((s) => s.id)).size === 3, `${era} 숨은 것 id 셋이 다름`);
}
console.log(`\n긴장·설렘 층 열 시대: ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
