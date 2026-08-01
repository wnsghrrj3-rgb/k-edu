/* R46 — Workspace +Image/+Video 실파일 삽입 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));

const src = fs.readFileSync('screens/workspace.js', 'utf8');

T('R46 코드 — image/video 분기가 실파일 input 생성', () => {
  A(src.includes("(k === 'image' || k === 'video') && window.MK_LIVE"), '분기');
  A(src.includes("inp.type = 'file'"), 'file input');
  A(src.includes("k === 'video' ? 'video/*' : 'image/*'"), 'accept 분기');
});
T('R46 코드 — insertWithSrc 실경로 사용 (#/editor R41 동일)', () => {
  A(src.includes('window.MK_LIVE.insertWithSrc(doc(), WS.sceneIdx'), 'insertWithSrc');
});
T('R46 코드 — 취소 시 아무것도 안 넣음 (return)', () => {
  const i = src.indexOf("inp.click();");
  A(i > -1 && src.slice(i, i + 120).includes('return'), 'click 후 return');
});
T('R46 코드 — MK_LIVE 부재 시 기존 자리표시자 폴백 유지', () => {
  A(src.includes("label: k === 'video' ? '영상 클립'"), '폴백 잔존');
});

/* 실동작: MK_LIVE 경유 삽입이 src를 실보존하는지 (fake reader) */
load('data/animations.js'); load('data/easy.js'); load('data/live.js');
const IMG = 'data:image/png;base64,AAA=';
class FakeReader { readAsDataURL() { this.result = IMG; setTimeout(() => this.onload(), 0); } }
T('실삽입 — fileToSrc→insertWithSrc로 el.src 보존', () => {
  const doc = { scenes: [{ id: 's1', width: 1280, height: 720, background: '#151B26', elements: [] }] };
  let done = false;
  window.MK_LIVE.fileToSrc({ type: 'image/png', size: 100, name: 'a.png' }, (s) => {
    const r = window.MK_LIVE.insertWithSrc(doc, 0, { name: 'a', kind: 'image', src: s });
    A(r.ok, 'insert ok');
    const el = doc.scenes[0].elements.at(-1);
    A(el.src === IMG, 'src 보존');
    done = true;
  }, FakeReader);
  return new Promise((res) => setTimeout(() => { A(done, '콜백 미도달'); res(); }, 20));
});

setTimeout(() => { console.log(`\nR46: ${pass}/${pass + fail}`); process.exit(fail ? 1 : 0); }, 100);
