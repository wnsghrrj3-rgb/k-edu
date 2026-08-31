// 공용 브라우저 런처 — 기본은 headless chromium(playwright).
// KMV_ELECTRON=<electron 실행 파일> 이면 Electron 으로 같은 page API 를 만든다
// (playwright chromium 을 못 내려받는 차단망용 — WebCodecs·AAC 디코더까지 있어 실크롬에 더 가깝다.
//  xvfb-run 아래에서 창을 실제로 띄워 rAF 스로틀링을 피한다).
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function launch(viewport) {
  viewport = viewport || { width: 1500, height: 900 };
  if (process.env.KMV_ELECTRON) {
    const { _electron } = await import('playwright-core');
    const app = await _electron.launch({
      executablePath: process.env.KMV_ELECTRON,
      args: ['--no-sandbox', path.join(HERE, 'electron-main.cjs')],
      env: { ...process.env, KMV_VW: String(viewport.width), KMV_VH: String(viewport.height) },
    });
    const page = await app.firstWindow();
    await page.setViewportSize(viewport);
    await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));   // 차단망 — 글꼴은 프리텐다드 폴백
    // Electron 렌더러엔 window.prompt 가 없다 → 테스트의 dialog 핸들러(d.accept(값))와
    // 같은 값을 돌려주는 폴리필(핸들러 없으면 null=취소). chromium 경로는 그대로 진짜 dialog.
    await page.addInitScript(() => { window.prompt = () => (window.__kmvPromptVal === undefined ? null : window.__kmvPromptVal); });
    const setPrompt = v => { page.addInitScript(x => { window.__kmvPromptVal = x; }, v).catch(() => {}); return page.evaluate(x => { window.__kmvPromptVal = x; }, v).catch(() => {}); };
    const origOn = page.on.bind(page);
    page.on = (ev, fn) => {
      if (ev === 'dialog') { fn({ type: () => 'prompt', message: () => '', accept: v => setPrompt(v == null ? '' : String(v)), dismiss: () => setPrompt(undefined) }); return page; }
      return origOn(ev, fn);
    };
    return { page, close: () => app.close() };
  }
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required', '--enable-features=WebCodecs'] });
  const page = await (await browser.newContext({ viewport })).newPage();
  await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  return { page, close: () => browser.close() };
}
