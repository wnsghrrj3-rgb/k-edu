/* ============================================================
   test-round91.mjs — R91 재생 중 셸 「나가기」 칩 숨김
   ------------------------------------------------------------
   준호 실기기: 재생에서 「나가기」를 누르니 케이메이커가 아니라
   자기주도 학습 과학(케이랩 허브)으로 나가버림. 그 「← 나가기」는
   재생기 버튼이 아니라 사이트 셸 칩(#kedu-back, fixed·z 9999) —
   오버레이(z 900) 위에 떠서 「재생 나가기」로 오해되고, 누르면
   발자국 트레일 하드 내비게이션으로 /maker 를 통째로 떠난다.
   재생의 나가기는 ✕·ESC 하나면 된다 — 재생 중 셸 칩은 숨긴다.

   계약:
     ① open() → body.mkp-on 부여 + mkpStyle 에 #kedu-back 숨김 규칙 실림.
     ② close() → body.mkp-on 제거(칩 복원).
     ③ ESC 경로도 복원한다 (onKey → close).
     ④ 마지막 장면 자동 종료 경로도 복원한다 (go 초과 → close).
     ⑤ 재생기 자체 계약 무회귀 — playAudit ok · 오버레이 생성/제거.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><a id="kedu-back" href="/x">← 나가기</a></body>',
  { runScripts: 'outside-only', url: 'https://x.test/', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const PL = w.MK_PLAY;
const doc = { title: 't', scenes: [
  { name: 'a', duration: 2, background: '#fff', elements: [{ kind: 'text', x: 5, y: 5, w: 60, size: 6, text: '가' }] },
  { name: 'b', duration: 2, background: '#fff', elements: [{ kind: 'text', x: 5, y: 5, w: 60, size: 6, text: '나' }] },
] };
const bodyOn = () => w.document.body.classList.contains('mkp-on');

console.log('--- ① 열기 = 칩 숨김 ---');
T('T1 open → body.mkp-on 부여', () => {
  const r = PL.open(doc, { setTimeout: () => 0, clearTimeout: () => {} });
  return r.ok && bodyOn() ? true : JSON.stringify({ ok: r.ok, on: bodyOn() });
});
T('T2 mkpStyle 에 #kedu-back 숨김 규칙이 실린다', () => {
  const st = w.document.getElementById('mkpStyle');
  return st && /body\.mkp-on #kedu-back[^}]*display:\s*none/.test(st.textContent) ? true
    : (st ? st.textContent.slice(0, 80) : '스타일 없음');
});

console.log('--- ② 닫기 = 칩 복원 ---');
T('T3 close → mkp-on 제거·오버레이 제거', () => {
  PL.close();
  return !bodyOn() && !w.document.getElementById('mkPlayer') ? true
    : JSON.stringify({ on: bodyOn(), player: !!w.document.getElementById('mkPlayer') });
});

console.log('--- ③ ESC 경로 ---');
T('T4 ESC 로 닫아도 복원된다', () => {
  PL.open(doc, { setTimeout: () => 0, clearTimeout: () => {} });
  if (!bodyOn()) return '전제 실패';
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
  return !bodyOn() && !w.document.getElementById('mkPlayer') ? true : '미복원';
});

console.log('--- ④ 자동 종료 경로 ---');
T('T5 마지막 장면 넘김(go 초과) 종료도 복원된다', () => {
  PL.open(doc, { startIdx: 1, setTimeout: () => 0, clearTimeout: () => {} });
  if (!bodyOn()) return '전제 실패';
  PL.go(2); /* scenes.length 초과 = 종료 */
  return !bodyOn() ? true : '미복원';
});

console.log('--- ⑤ 무회귀 ---');
T('T6 playAudit ok', () => {
  const a = PL.playAudit();
  return a.ok ? true : a.violations.join(' / ');
});
T('T7 재열기 정상 (숨김/복원 왕복 뒤에도)', () => {
  const r = PL.open(doc, { setTimeout: () => 0, clearTimeout: () => {} });
  const ok = r.ok && bodyOn() && !!w.document.getElementById('mkPlayer');
  PL.close();
  return ok && !bodyOn() ? true : '왕복 실패';
});

console.log('');
console.log('test-round91: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
