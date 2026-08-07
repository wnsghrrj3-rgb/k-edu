/* ============================================================
   test-round79.mjs — R79 전면 진입 전환
   ① 진입 3곳(메인·teacher·hub2) 이 /maker/ 를 가리킨다 — /kmake/ 0
   ② 역경로 보존: /kmake 는 살아있고 배너로 /maker 안내
   ③ boxbar: /maker/ 링크가 '케이메이커'로 분류된다 (kmake 분류 유지)
   ④ /maker 정적본 드리프트 0 (R77 재확인)
   ============================================================ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
let pass = 0, fail = 0;
const t = (name, ok, why) => { if (ok) { pass++; } else { fail++; console.log('  ✗', name, why ? '— ' + why : ''); } };

console.log('R79 ① 진입 3곳 전환');
for (const f of ['index.html', 'teacher/index.html', 'hub2/index.html']) {
  const src = site(f);
  t(f + ' → /maker/ 링크 존재', src.includes('href="/maker/"'));
  t(f + ' → /kmake/ 링크 0', !src.includes('href="/kmake/"'));
  t(f + ' → 케이메이커 라벨 유지', src.includes('케이메이커'));
}

console.log('R79 ② 역경로 보존');
{
  const km = site('kmake/index.html');
  t('/kmake 시작 화면 생존', km.includes('<div id="start">'));
  t('/kmake → /maker 배너 유지', km.includes('mkNewBanner') && km.includes('href="/maker/"'));
}

console.log('R79 ③ boxbar 분류');
{
  const bx = site('kedu_boxbar.js');
  const mKmake = bx.match(/\/\^\\\/kmake\\\/\/\.test\(p\)\) return 'kmake'/);
  const mMaker = bx.match(/\/\^\\\/maker\\\/\/\.test\(p\)\) return 'kmake'/);
  t('kmake 분류 유지', !!mKmake);
  t('maker → 케이메이커 분류 추가', !!mMaker);
  t('라벨 사전에 케이메이커 존재', bx.includes("kmake: '케이메이커'"));
}

console.log('R79 ④ /maker 정적본 드리프트');
{
  const built = site('maker/index.html');
  const { transform } = await import(path.join(__dirname, '..', 'maker', 'build.mjs'));
  const fresh = transform(fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8'));
  t('재생성본 일치', built === fresh, 'node maker/build.mjs 재실행 필요');
}

console.log('\nR79 결과:', pass + '/' + (pass + fail), fail === 0 ? '전부 통과' : '실패 ' + fail);
process.exit(fail === 0 ? 0 : 1);
