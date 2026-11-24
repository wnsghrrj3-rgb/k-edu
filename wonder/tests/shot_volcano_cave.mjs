/* 케이원더 화산 탐방 ① 용암 동굴 — 화면 찍기(헤드리스 크롬, 서버 없이 파일을 바로 띄움 · ?shot=1)
 *   node wonder/tests/shot_volcano_cave.mjs <out_dir> [장면 …]     장면 = now · rewind · out · look · phone · probe (없으면 probe 빼고 전부)
 *   PLAYWRIGHT=<playwright 경로>, Q=low|mid|high, CHROME=<크롬 경로>
 */
import { createRequire } from 'node:module';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../..');
const out = process.argv[2] || path.join(root, 'wonder/volcano/_shots'); await mkdir(out, { recursive: true });
const want = process.argv.slice(3);
const pw = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const browser = await pw.chromium.launch({ headless: true, executablePath: process.env.CHROME || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const q = process.env.Q || 'high';
async function open(w, h, url = `wonder/volcano/cave/?shot=1&q=${q}`, wait = () => document.title === 'ready') {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.route('http://wonder.test/**', async route => {
    let p = decodeURIComponent(new URL(route.request().url()).pathname); if (p.endsWith('/')) p += 'index.html';
    try { await route.fulfill({ body: await readFile(path.join(root, p)), contentType: TYPES[path.extname(p)] || 'application/octet-stream' }); } catch { await route.fulfill({ status: 404, body: 'nope' }); }
  });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('  [콘솔]', m.text().slice(0, 900)); });
  page.on('pageerror', e => console.log('  [오류]', e.message));
  await page.goto('http://wonder.test/' + url);
  await page.waitForFunction(wait, null, { timeout: 180000 });
  return page;
}
const snap = async (page, name) => { await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 86, timeout: 180000 }); console.log('찍음', name); };
const set = (p, t, sec = 1.2) => p.evaluate(([t, sec]) => { window.__c.set(t); window.__c.run(sec); }, [t, sec]);
const SCENES = {
  async now() { const p = await open(1600, 900); await set(p, 0); await snap(p, '30_굴_지금_식은_빈_굴');
    await p.evaluate(() => window.__c.look(-0.9, 0.12)); await snap(p, '31_굴_벽의_가로줄');
    await p.evaluate(() => window.__c.look(0.25, 0.62)); await snap(p, '32_굴_천장의_돌_고드름');
    await p.evaluate(() => window.__c.look(0.5, -0.5)); await snap(p, '33_굴_밧줄_무늬_바닥과_표지_막대');
    await p.evaluate(() => { window.__c.look(0, 0); window.__c.lamp(false); }); await snap(p, '34_굴_등불을_끄면'); await p.close(); },
  async rewind() { const p = await open(1600, 900);
    await set(p, 1 / 3); await snap(p, '35_굴_조금_전_무릎_높이_용암'); await p.evaluate(() => window.__c.look(-0.9, 0.05)); await snap(p, '36_굴_가로줄이_용암_높이였다');
    await p.evaluate(() => window.__c.look(0, 0)); await set(p, 2 / 3, 2.5); await snap(p, '37_굴_더_옛날_반쯤_찬_용암'); await p.evaluate(() => window.__c.look(0.3, 0.5)); await snap(p, '38_굴_천장에서_떨어지는_방울'); await p.close(); },
  async out() { const p = await open(1600, 900); await set(p, 1, 2); await snap(p, '39_굴_처음_땅_위의_용암_강'); await set(p, 0.9, 2); await snap(p, '40_굴_지붕이_덮여_간다'); await set(p, 0.8, 2); await snap(p, '41_굴_지붕이_거의_덮였다'); await p.close(); },
  async look() { const p = await open(1600, 900); await set(p, 0); await p.evaluate(() => { window.__c.ui(false); window.__c.look(0, 0.02); }); await snap(p, '42_굴_그림만'); await p.close(); },
  /** 천장을 톡 쳐 표본 줍기 · 까닭 글 */
  async pick() { const p = await open(1600, 900); await set(p, 0); await p.evaluate(() => window.__c.look(0.2, 0.7));
    const r = await p.evaluate(() => window.__c.tap(800, 380)); console.log('  천장을 치면:', r); await set(p, 1 / 3, .2); console.log('  뜨거울 때 치면:', await p.evaluate(() => window.__c.tap(800, 380)));
    await set(p, 0, .2); await p.mouse.click(800, 380); await p.waitForTimeout(700); await p.evaluate(() => { window.__c.run(.3); window.__c.why(); }); await p.waitForTimeout(900); await snap(p, '47_굴_표본_줍기와_까닭_글'); await p.close(); },
  async phone() { const p = await open(390, 780); await set(p, 1 / 3); await snap(p, '43_굴_폰_세로'); await p.close(); },
  /** 섬 화면에서 무인기 → 깃발 → 굴 → 돌아오기 */
  async door() { const p = await open(1600, 900, `wonder/volcano/?shot=1&q=${q}&seed=20261123`);
    await p.evaluate(async () => { for (let t = 0; t < 40; t += 2) { window.__w.run(2); await new Promise(f => setTimeout(f, 0)); } });
    await p.evaluate(() => { document.querySelector('#drone').click(); window.__w.scene.render(0); }); await p.waitForTimeout(300); await snap(p, '44_섬_무인기와_깃발');
    const before = await p.evaluate(() => JSON.stringify(window.__w.measure()));
    await p.evaluate(() => document.querySelector('.flag.on').click()); await p.waitForFunction(() => document.querySelector('#tour iframe')?.contentDocument?.title === 'ready', null, { timeout: 180000 }); await p.waitForTimeout(2500); await snap(p, '45_섬_위에_뜬_굴');
    await p.evaluate(() => document.querySelector('#tour iframe').contentDocument.querySelector('#back').click()); await p.waitForFunction(() => !document.querySelector('#tour iframe')); await p.waitForTimeout(400);
    const after = await p.evaluate(() => JSON.stringify(window.__w.measure())); console.log('  돌아오면 섬이 그대로인가:', before === after ? '그대로' : '달라짐!'); await snap(p, '46_섬으로_돌아옴'); await p.close(); },
  async probe() { const p = await open(1600, 900); for (const t of (process.env.T || '0').split(',')) { await set(p, +t, 1.5); const [y, pi] = (process.env.LOOK || '0,0').split(',').map(Number); await p.evaluate(([y, pi]) => window.__c.look(y, pi), [y, pi]); await snap(p, 'probe_' + t); } await p.close(); },
};
for (const k of want.length ? want : Object.keys(SCENES).filter(k => k !== 'probe')) { console.log('──', k); const t0 = Date.now(); await SCENES[k](); console.log('  ', ((Date.now() - t0) / 1000).toFixed(0) + '초'); }
await browser.close();
