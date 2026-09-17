// 자산 대장 검사 — manifest 의 파일이 있고, 삼각형이 예산 안이고, 사람·동물은 대기·걷기 동작이 있는지
import fs from 'fs';
const dir = new URL('../assets/', import.meta.url); const man = JSON.parse(fs.readFileSync(new URL('manifest.json', dir), 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
function readGlb(path) { const b = fs.readFileSync(path); const ln = b.readUInt32LE(12); return JSON.parse(b.subarray(20, 20 + ln).toString('utf8')); }
for (const [rel, a] of Object.entries(man.assets)) {
  const p = new URL(rel, dir); ok(fs.existsSync(p), `${rel} 존재`); if (!fs.existsSync(p)) continue;
  const j = readGlb(p); const tris = j.meshes.reduce((s, m) => s + m.primitives.reduce((t, pr) => t + (pr.indices != null ? j.accessors[pr.indices].count / 3 : j.accessors[pr.attributes.POSITION].count / 3), 0), 0);
  ok(Math.abs(tris - a.tris) < 5, `${rel} 삼각형 ${tris} = 대장 ${a.tris}`); ok(tris <= man.budget[a.kind], `${rel} 예산 ${man.budget[a.kind]} 안`);
  if (a.kind === 'person' || a.kind === 'animal') { const names = (j.animations || []).map((x) => x.name.toLowerCase()); ok(names.some((n) => n.includes('walk')) && (a.kind === 'animal' || names.some((n) => n.includes('wait') || n.includes('idle'))), `${rel} ${a.kind === 'animal' ? '걷기' : '대기·걷기'} 동작`); ok((j.skins || []).length === 1, `${rel} 뼈대 1`); }
  ok(fs.statSync(p).size < 4 * 1024 * 1024, `${rel} 4MB 안`);
}
console.log(`assets: ${pass} pass / ${fail} fail`); if (fail) process.exit(1);
