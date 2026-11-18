// 케이모션 과학실 — 화면 찍기(세 관문 「그림」): 헤드리스 크롬을 원격 디버깅으로 띄워, 페이지가 준비될 때까지 기다렸다 찍는다.
// 쓰는 법: node kmotion/lab/tests/cap.mjs <out.png> "<주소 또는 ?뒤 질의>" [기다릴 식] [찍기 전 더 기다릴 ms] [--eval "찍기 전에 돌릴 JS"]
//   기다릴 식 기본값 = document.documentElement.dataset.lab === 'ready'  (자동 한 판은 "document.title.startsWith('AUTO')")
//   끝나면 한 줄 JSON 을 찍는다: { ok, title, waited, console: [오류…] }
// 왜: --screenshot + --virtual-time-budget 은 GLB·그림 풀기를 안 기다려 로딩 중 화면이 찍힌다. node 24 의 내장 WebSocket 만 쓴다(설치할 것 없음).
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2); let evalJs = null; const ei = args.indexOf('--eval'); if (ei >= 0) { evalJs = args[ei + 1]; args.splice(ei, 2); }
const [out, target = '', waitExpr = "document.documentElement.dataset.lab === 'ready'", extra = '600'] = args;
if (!out) { console.error('usage: cap.mjs <out.png> <url|query> [waitExpr] [extraMs] [--eval js]'); process.exit(2); }
const url = /^https?:/.test(target) ? target : 'http://localhost:' + (process.env.LAB_PORT || 8779) + '/kmotion/lab/' + (target.startsWith('?') || target.includes('.html') ? target : '?' + target);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 600), W = +(process.env.CAP_W || 1280), H = +(process.env.CAP_H || 720), TIMEOUT = +(process.env.CAP_TIMEOUT || 90000);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio', '--hide-scrollbars', '--no-first-run',
  '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'labcap-'))}`, `--window-size=${W},${H}`, `--remote-debugging-port=${port}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
// 끝낼 때 크롬 나무(자식 프로세스까지) 전부 닫는다 — 남은 chrome.exe 가 쌓이지 않게
import { execFileSync } from 'node:child_process';
const killChrome = () => { try { if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }); else chrome.kill('SIGKILL'); } catch (_) { try { chrome.kill(); } catch (__) {} } };
process.on('exit', killChrome); process.on('SIGINT', () => process.exit(130)); process.on('SIGTERM', () => process.exit(143));
const done = (code, obj) => { console.log(JSON.stringify(obj)); killChrome(); process.exit(code); };
const t0 = Date.now();
try {
  let ws = null; for (let k = 0; k < 60 && !ws; k++) { await sleep(250); try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = list.find(t => t.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch (_) {} }
  if (!ws) done(1, { ok: false, error: '크롬에 붙지 못함' });
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pend = new Map(), logs = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') logs.push('예외: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 300));
    else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) logs.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300)); };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expression => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); return r.result?.result?.value; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  // 여러 장(자동 한 판의 &shots=이름,…): 제목이 「SHOT 이름」이 될 때마다 <out 앞부분>_<이름>.png 로 찍고 window.__shotDone 으로 풀어 준다
  const multi = process.env.CAP_MULTI === '1', taken = [];
  let ok = false; while (Date.now() - t0 < TIMEOUT) { await sleep(300); try {
    if (multi) { const ti = await ev('document.title'); if (ti && ti.startsWith('SHOT ')) { const name = ti.slice(5); await sleep(+extra); const s = await send('Page.captureScreenshot', { format: 'png' }); const f = out.replace(/\.png$/, '') + '_' + name + '.png'; writeFileSync(f, Buffer.from(s.result.data, 'base64')); taken.push(name); await ev(`window.__shotDone = ${JSON.stringify(name)}`); continue; } }
    if (await ev(`!!(${waitExpr})`)) { ok = true; break; } } catch (_) {} }
  if (multi) logs.unshift('찍음: ' + taken.join(','));
  if (evalJs) { try { await ev(evalJs); } catch (e) { logs.push('eval 실패: ' + e); } }
  await sleep(+extra);
  const shot = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  done(ok ? 0 : 1, { ok, title: await ev('document.title'), waited: Date.now() - t0, console: logs.slice(0, 8) });
} catch (e) { done(1, { ok: false, error: String(e) }); }
