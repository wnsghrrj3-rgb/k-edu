// 층 분리·계약 검사(13 문서 9절) — node tests/contract/check.mjs. 브라우저 없이 도는 것만.
// ① sim/ 에 three·DOM 0  ② skins/ 가 sim/·엔진을 import 0  ③ 모든 skin.json 계약 = 시스템 계약  ④ empty 스킨 인터페이스  ⑤ 스킨이 쓰는 문구 키가 ko.json 에 있음
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { checkInterface, CONTRACT } from '../../contract/validate.js';
const here = new URL('../../', import.meta.url), P = p => new URL(p, here);
const walk = d => readdirSync(P(d)).flatMap(n => { const q = d + n; return statSync(P(q)).isDirectory() ? walk(q + '/') : [q]; });
const fail = []; const ok = m => console.log('✓ ' + m);
const simFiles = walk('sim/').filter(f => f.endsWith('.js'));
for (const f of simFiles) { const s = readFileSync(P(f), 'utf8');
  if (/from\s+['"]three/.test(s) || /\b(document|window|requestAnimationFrame|localStorage)\s*[.(]/.test(s.replace(/\/\/.*$/gm, ''))) fail.push('sim 금지 사용: ' + f); }
ok(`① sim/ ${simFiles.length}개 파일 three·DOM 검사`);
const skinDirs = readdirSync(P('skins/')).filter(n => statSync(P('skins/' + n)).isDirectory());
for (const d of skinDirs) { for (const f of walk(`skins/${d}/`).filter(f => f.endsWith('.js'))) { const s = readFileSync(P(f), 'utf8');
    if (/from\s+['"][./]*sim\//.test(s) || /kmotion\.js/.test(s) || /KMotion\./.test(s)) fail.push('스킨이 시스템·엔진 import: ' + f); }
  const meta = JSON.parse(readFileSync(P(`skins/${d}/skin.json`), 'utf8')); if (String(meta.contract) !== CONTRACT) fail.push(`skins/${d} 계약 ${meta.contract} ≠ ${CONTRACT}`);
  const idx = readFileSync(P(`skins/${d}/index.js`), 'utf8'); if (!/export function createSkin/.test(idx) || !/export const CONTRACT/.test(idx)) fail.push(`skins/${d}/index.js createSkin·CONTRACT 내보내기 없음`); }
ok(`②③ 스킨 ${skinDirs.join(', ')} — import 방향·계약 번호`);
const { createSkin } = await import('../../skins/empty/index.js'); const e = createSkin({}); const ci = checkInterface(e); if (!ci.ok) fail.push('empty 인터페이스: ' + ci.miss); ok('④ empty 스킨 인터페이스');
const ko = JSON.parse(readFileSync(P('data/text/ko.json'), 'utf8'));
for (const d of skinDirs) for (const f of walk(`skins/${d}/`).filter(f => f.endsWith('.js'))) { const s = readFileSync(P(f), 'utf8');
  for (const m of s.matchAll(/\b(?:T|ui\.toast)\('([a-z][\w.-]+)'/g)) if (!m[1].endsWith('.') && !(m[1] in ko)) fail.push(`${f} 문구 키 없음: ${m[1]}`); }
ok('⑤ 스킨 문구 키');
if (fail.length) { console.log('\n✗ ' + fail.join('\n✗ ')); process.exit(1); } else console.log('\n전부 통과');
