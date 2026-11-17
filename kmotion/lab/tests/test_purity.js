// 시스템과 그림을 가른다: sim/ 과 hands.js 는 document·THREE 를 부르지 않는다(설계 8-1)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [join(root, 'core/hands.js')];
if (existsSync(join(root, 'sim'))) for (const f of readdirSync(join(root, 'sim'))) if (f.endsWith('.js')) files.push(join(root, 'sim', f));
let bad = 0;
for (const f of files) { const s = readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const w of ['document', 'window', 'THREE', "from 'three'", 'requestAnimationFrame']) if (s.includes(w)) { console.log('  ✗', f.slice(root.length + 1), '→', w); bad++; } }
if (bad) process.exit(1); console.log(`purity: ${files.length}개 파일 화면 코드 없음`);
