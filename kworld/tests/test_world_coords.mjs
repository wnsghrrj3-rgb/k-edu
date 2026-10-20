// 91-③: world.json 의 좌표 목록(풀 피하기 scenery.grass.avoid · 밤 안전 danger.safe)이 엔진 좌표(x, z = -블렌더 y)인지 — GLB area_ 자리와 맞물려야 한다.
// 전엔 여덟 시대에서 원래 13곳 항목이 블렌더 y 그대로(거울)라 풀이 광장에 났고, 삼국 산성·통일신라 호족/관아·고려 권문/산성/군영·조선 관아/서당/들의 밤 안전 자리가 엉뚱한 곳에 있었다.
import fs from 'node:fs'; import path from 'node:path';
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const root = new URL('../eras/', import.meta.url);
for (const era of ['life', 'neo', 'bronze-life', 'gojoseon-life', 'samguk-life', 'silla-life', 'goryeo-life', 'joseon-life', 'joseon-late-life', 'gaehang-life', 'daehan-life']) {
  const base = new URL(era + '/', root); const w = JSON.parse(fs.readFileSync(new URL('world.json', base), 'utf8'));
  const gp = path.resolve(path.dirname(new URL('world.json', base).pathname), w.glb); const buf = fs.readFileSync(gp); const data = JSON.parse(buf.subarray(20, 20 + buf.readUInt32LE(12)).toString());
  const areas = data.nodes.filter((n) => (n.name || '').startsWith('area_')).map((n) => n.translation || [0, 0, 0]);
  const near = (x, z) => Math.min(...areas.map((a) => Math.hypot(a[0] - x, a[2] - z)));
  for (const [name, list] of [['avoid', w.scenery?.grass?.avoid || []], ['safe', w.danger?.safe || []]]) for (const e of list) { const d = near(e[0], e[1]), m = near(e[0], -e[1]);
    ok(!(d > 4 && m <= 4), `${era} ${name} [${e[0]},${e[1]}] 가 거울 자리(z 부호 반대)에 있다 — 가까운 구역 ${m.toFixed(1)}m`); }
}
console.log(`\n좌표 목록(엔진 z = -y): ${pass} 통과 / ${fail} 실패`); if (fail) process.exit(1);
