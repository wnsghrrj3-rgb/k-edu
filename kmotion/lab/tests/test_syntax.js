// 과학실 JS 파일 전부 문법 검사(node --check) — 한 줄 안에 // 주석이 끼어 뒤가 잘리는 일 같은 것을 커밋 전에 잡는다
import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = []; (function walk(d){ for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== 'node_modules' && f !== 'assets') walk(p); } else if (f.endsWith('.js')) files.push(p); } })(root);
let bad = 0;
for (const f of files) { try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { bad++; console.log('  ✗', relative(root, f), String(e.stderr).split('\n').find(l => /Error/.test(l))); } }
if (bad) process.exit(1); console.log(`syntax: ${files.length}개 파일 문법 통과`);
