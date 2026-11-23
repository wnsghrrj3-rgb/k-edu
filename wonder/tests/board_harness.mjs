/* 케이원더 회색 판 확인(헤드리스 크롬, 서버 없이 파일을 바로 띄움)
 *   PLAYWRIGHT=<playwright-core 또는 감쌈 경로> node wonder/tests/board_harness.mjs <장면> [화면 폴더]
 * 하는 일: /wonder/<장면>/ 을 연다 → 콘솔 오류가 없나 → wonder/tests/board_<장면>.mjs 의 check(page) 를 돌린다
 *          (표의 줄·의뢰를 손잡이로 돌려 글자가 나오는지) → 1024×768 과 375×812 화면을 찍고 폰 너비에서 가로로 넘치지 않나 본다.
 */
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const scene = process.argv[2]; if (!scene) { console.error('장면 이름을 주세요'); process.exit(2); }
const outDir = process.argv[3];
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../..');
const pw = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright-core');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };

const browser = await pw.chromium.launch({ headless: true });
const errors = [];
async function open(viewport) {
  const page = await browser.newPage({ viewport });
  await page.route('http://wonder.test/**', async route => {
    let p = decodeURIComponent(new URL(route.request().url()).pathname); if (p.endsWith('/')) p += 'index.html';
    try { const body = await readFile(path.join(root, p)); await route.fulfill({ body, contentType: TYPES[path.extname(p)] || 'application/octet-stream' }); }
    catch { await route.fulfill({ status: 404, body: 'nope' }); }
  });
  page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(`[${viewport.width}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${viewport.width}] ${e.message}`));
  // 그림 판이 선 장면은 회색 판이 board.html 로 옮겨져 있다
  const { existsSync } = await import('node:fs'); const hasBoard = existsSync(new URL(`../${scene}/board.html`, import.meta.url));
  await page.goto(`http://wonder.test/wonder/${scene}/${hasBoard ? 'board.html' : ''}`); await page.waitForTimeout(700);
  return page;
}
let fail = 0;
const page = await open({ width: 1024, height: 768 });
const checkFile = path.join(here, `board_${scene}.mjs`);
try {
  const { check } = await import(pathToFileURL(checkFile).href);
  const lines = await check(page);
  for (const l of lines) { console.log(l.ok === false ? 'FAIL' : 'ok  ', l.name, '—', l.text); if (l.ok === false) fail++; }
} catch (e) { console.log('FAIL check:', e.message); fail++; }
if (outDir) { await mkdir(outDir, { recursive: true }); await page.screenshot({ path: path.join(outDir, `${scene}_desk.png`) }); }
const phone = await open({ width: 375, height: 812 });
const sw = await phone.evaluate(() => document.documentElement.scrollWidth);
console.log(sw > 375 ? 'FAIL' : 'ok  ', '폰 너비 —', 'scrollWidth', sw); if (sw > 375) fail++;
if (outDir) await phone.screenshot({ path: path.join(outDir, `${scene}_phone.png`) });
for (const e of errors) { console.log('FAIL 콘솔 —', e); fail++; }
await browser.close();
console.log(fail ? `${fail} 실패` : '판 확인 통과');
process.exit(fail ? 1 : 0);
