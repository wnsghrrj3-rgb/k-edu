// 높이맵 연결 — height.json 이 있는 시대는 world.json 에 "height" 가 적혀 있어야 한다(없으면 engine.hm 이 null → 바닥 0·깊은 강 못 막음·미니맵 땅 없음, ㉝에서 발견).
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ ') + m); };
for (const era of fs.readdirSync(path.join(root, 'eras'))) {
  const dir = path.join(root, 'eras', era); if (!fs.statSync(dir).isDirectory()) continue;
  const w = JSON.parse(fs.readFileSync(path.join(dir, 'world.json'), 'utf8'));
  const has = fs.existsSync(path.join(dir, 'height.json'));
  if (!has && !w.height) { console.log('  · ' + era + ' (height.json 없음)'); continue; }
  ok(!!w.height, era + ' world.height 적힘');
  if (w.height) { const hp = path.resolve(dir, w.height); ok(fs.existsSync(hp), era + ' height 파일 있음: ' + w.height);
    const h = JSON.parse(fs.readFileSync(hp, 'utf8')); ok(h.ext > 0 && h.n === h.h.length && h.h[0].length === h.n, era + ' 높이맵 꼴 {ext,n,h}'); }
}
console.log(`height_wired ${pass}/${fail}`); if (fail) process.exit(1);
