/* 케이원더 화산 — 화면 찍기(헤드리스 크롬, 서버 없이 파일을 바로 띄움 · ?shot=1 로 시간을 손으로 감는다)
 *   node wonder/tests/shot_volcano.mjs <out_dir> [장면 …]     장면 = first · shield · dome · blast · sea · phone (없으면 전부)
 *   PLAYWRIGHT=<playwright 경로> 를 주면 그것을 쓴다.  Q=low|mid|high, SEED=숫자
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
const browser = await pw.chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const q = process.env.Q || 'high', seed = process.env.SEED || 20261123;
async function open(w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.route('http://wonder.test/**', async route => {
    let p = decodeURIComponent(new URL(route.request().url()).pathname); if (p.endsWith('/')) p += 'index.html';
    try { await route.fulfill({ body: await readFile(path.join(root, p)), contentType: TYPES[path.extname(p)] || 'application/octet-stream' }); } catch { await route.fulfill({ status: 404, body: 'nope' }); }
  });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('  [콘솔]', m.text().slice(0, 300)); });
  page.on('pageerror', e => console.log('  [오류]', e.message));
  await page.goto(`http://wonder.test/wonder/volcano/?shot=1&q=${q}&seed=${seed}`);
  await page.waitForFunction(() => document.title === 'ready', null, { timeout: 120000 });
  return page;
}
const run = (page, sec) => page.evaluate(async s => { let r; for (let t = 0; t < s; t += 2) { r = window.__w.run(Math.min(2, s - t)); await new Promise(f => setTimeout(f, 0)); } return r; }, sec);
const snap = async (page, name) => { await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 86 }); console.log('찍음', name); };
const info = r => console.log('  ', JSON.stringify({ t: +r.t.toFixed(1), mode: r.mode, counts: r.counts, h: Math.round(r.m.height), w: Math.round(r.m.width), slope: +r.m.slopeDeg.toFixed(1) }));
const SCENES = {
  /** 저절로 돌아가는 쇼를 차례로 */
  async first() { const p = await open(1600, 900);
    for (const [name, sec] of [['01_첫화면_바다가_끓는다', 2.5], ['02_섬이_얼굴을_내민다', 7], ['03_용암이_흘러_섬이_넓어진다', 30], ['04_불분수와_원뿔', 62], ['05_용암_혹', 86], ['06_대폭발_순간', 97.5], ['07_재_기둥', 106], ['08_풀이_돋는다', 128]]) { const r = await run(p, sec - (this.t || 0)); this.t = sec; info(r); await snap(p, name); }
    await p.close(); },
  /** 손잡이로: 묽게만 기른 섬 */
  async shield() { const p = await open(1600, 900); await p.evaluate(() => window.__w.set({ visc: .05, gas: .05 })); info(await run(p, 75)); await snap(p, '10_묽게_기른_섬_방패'); await p.evaluate(() => { window.__w.scene.cam.drift = 0; window.__w.cam({ az: 1.2 }); }); await snap(p, '11_묽게_기른_섬_다른쪽');
    for (let i = 0; i < 30 && !(await p.evaluate(() => window.__w.scene.props.at >= 0 && window.__w.scene.props.k > .95)); i++) await run(p, 1);   // 등대가 설 때까지
    await p.evaluate(() => { const w = window.__w, h = w.scene.props.house; w.ui(false); w.scene.props.lamp.scale.setScalar(.12); w.scene.props.boatLamp.scale.setScalar(.06); w.scene.cam.look = [h.position.x, h.position.y + .28, h.position.z, 1.7]; w.scene.render(0); }); await snap(p, '17_등대_가까이');
    await p.evaluate(() => { const w = window.__w, b = w.scene.props.boat; w.scene.cam.look = [b.position.x, .1, b.position.z, 1.4]; w.scene.render(0); }); await snap(p, '18_고깃배_가까이'); await p.close(); },
  /** 손잡이로: 끈적하게만 기른 섬 */
  async dome() { const p = await open(1600, 900); await p.evaluate(() => window.__w.set({ visc: .95, gas: .1 })); info(await run(p, 75)); await snap(p, '12_끈적하게_기른_섬_돔'); await p.close(); },
  /** 용암이 바다에 닿는 순간(가까이) */
  async sea() { const p = await open(1600, 900); await p.evaluate(() => window.__w.set({ visc: .05, gas: .05 })); info(await run(p, 26)); await p.evaluate(() => { window.__w.ui(false); window.__w.cam({ dist: 34, el: .16 }); }); await snap(p, '13_용암이_바다에_닿는다'); await p.evaluate(() => window.__w.cam({ dist: 16, el: .3, az: 2.2 })); await snap(p, '13b_용암_가까이'); await p.evaluate(() => window.__w.cam({ dist: 60, el: 1.45, az: 0 })); await snap(p, '13c_위에서'); await p.close(); },
  async blast() { const p = await open(1600, 900); await p.evaluate(() => window.__w.set({ visc: .05, gas: .05 })); await run(p, 40); await p.evaluate(() => window.__w.set({ visc: .95, gas: .97 })); let r; for (let i = 0; i < 40 && (r = await run(p, .5)).mode !== 'column'; i++); info(await run(p, .6)); await snap(p, '14_대폭발_첫순간'); for (let i = 0; i < 60; i++) { r = await run(p, .1); if (i > 20 && await p.evaluate(() => window.__w.scene.flashing())) break; } info(r); await snap(p, '15_재기둥_번개'); info(await run(p, 9)); await snap(p, '16_재기둥_꼭대기가_퍼진다'); await p.close(); },
  async phone() { const p = await open(390, 780); info(await run(p, 40)); await snap(p, '20_폰_세로'); await p.close(); },
};
for (const k of want.length ? want : Object.keys(SCENES)) { console.log('──', k); const t0 = Date.now(); await SCENES[k](); console.log('  ', ((Date.now() - t0) / 1000).toFixed(0) + '초'); }
await browser.close();
