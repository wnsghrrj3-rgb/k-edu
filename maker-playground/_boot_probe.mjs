import { JSDOM } from 'jsdom';
import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('..', 'maker');           // k-edu/maker (정적 제품본)
const SITE = path.resolve('..');                     // 배포 루트 = 레포 루트
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html.replace(/<script src=[^>]+><\/script>/g, ''),
  { runScripts: 'outside-only', url: 'https://keduclass.com/maker/', pretendToBeVisual: true });
const { window } = dom;
window.alert = () => {}; window.confirm = () => true;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  try { window.eval(m[1]); } catch (e) { console.log('INLINE ERROR:', e.message); }
}
console.log('MK_PRODUCT =', window.MK_PRODUCT);
let errs = [], cnt = 0, missing = [];
for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(x => !/^https?:/.test(x))) {
  const rel = u.split('?')[0];
  const cand = [
    path.resolve(ROOT, rel),                 // ../maker-playground/... 상대경로
    path.join(SITE, rel.replace(/^\//, '')), // /kedu_back.js 류 절대경로 = 배포 루트
  ];
  const f = cand.find(p => { try { return fs.existsSync(p) && fs.statSync(p).isFile(); } catch { return false; } });
  if (!f) { missing.push(u); continue; }
  cnt++;
  try { window.eval(fs.readFileSync(f, 'utf8')); }
  catch (e) { errs.push({ file: u, msg: e.message }); }
}
console.log('실행', cnt, '| 못 찾음', missing.length, missing.slice(0, 6));
console.log('스크립트 예외', errs.length, JSON.stringify(errs.slice(0, 6)));
try { window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true })); } catch (e) { console.log('DCL ERROR:', e.message); }
const app = window.document.getElementById('app');
console.log('#app:', !!app, '내용길이:', app ? app.innerHTML.length : 0);
const form = window.document.querySelector('#h2Form');
console.log('만들기폼:', !!form, '| onsubmit:', !!(form && form.onsubmit),
  '| 칩:', window.document.querySelectorAll('[data-h2-chip]').length,
  '| 미니도구 앵커:', window.document.querySelectorAll('a[href*="/maker/invite"],a[href*="/maker/card"]').length);
/* 칩 실클릭 — 반응(라우팅) 확인 */
const chip = window.document.querySelector('[data-h2-chip]');
if (chip) { /* click 생략 */  }
