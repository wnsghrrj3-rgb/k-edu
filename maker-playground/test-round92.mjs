/* ============================================================
   test-round92.mjs — R92 케이메이커 = context 모드 (이주 누락 복원)
   ------------------------------------------------------------
   준호 실기기 반복 보고: 워크스페이스·재생 어디서든 왼쪽 위
   「← 나가기」 칩이 떠 있고, 누르면 자기주도(케이랩) 허브로 회귀.
   해부: 그 칩은 사이트 셸 #kedu-back — kedu_back.js 원설계에
   「케이뮤지엄·케이메이크처럼 자체 버튼이 있는 화면은
   data-mode="context"(칩 없음)」가 명시돼 있고, 구 /kmake도
   context 로 실었는데(69fc561 이전 원본 확인) 플레이그라운드→
   /maker 이주 때 그 속성이 빠졌다. 케이메이커의 「← 나가기」 칩
   자체가 이주 누락 버그다.

   계약:
     ① 플레이그라운드 index.html 의 kedu_back 태그 = context 모드.
     ② 정적 /maker(빌드 산출물) 태그도 context 모드.
     ③ kedu_back.js 를 실제 로드해 context 판독 시 #kedu-back 미생성.
     ④ context 에서도 KEDU_BACK 맥락(go·href)은 살아 있다(원설계).
     ⑤ 비교 기준: context 없이 로드하면 칩이 생긴다 — 속성이 실제로
        갈림길임을 같은 하니스에서 증명(잣대의 잣대).
     ⑥ R91 재생 중 숨김 규칙은 이중 안전망으로 잔존(회귀 0).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const SITE = path.resolve('..');
const read = (f) => fs.readFileSync(f, 'utf8');

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

console.log('--- ①② 정적 계약 — 태그에 context ---');
T('T1 플레이그라운드 index — kedu_back 태그 context 모드', () => {
  const h = read(path.join(ROOT, 'index.html'));
  const m = h.match(/<script src="\/kedu_back\.js"[^>]*>/);
  return m && /data-mode="context"/.test(m[0]) ? true : (m ? m[0] : '태그 없음');
});
T('T2 정적 /maker index — 빌드 산출물도 context 모드', () => {
  const h = read(path.join(SITE, 'maker', 'index.html'));
  const m = h.match(/<script src="\/kedu_back\.js"[^>]*>/);
  return m && /data-mode="context"/.test(m[0]) ? true : (m ? m[0] : '태그 없음');
});

/* kedu_back.js 실로드 하니스 — currentScript 의 data-mode 를 읽는 원 코드를
   jsdom 에서 그대로 태운다. currentScript 는 실제 <script> 삽입으로 재현. */
function bootShell(withContext) {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'dangerously', url: 'https://x.test/maker/' });
  const w = dom.window;
  try { w.sessionStorage.clear(); } catch (_) {}
  const s = w.document.createElement('script');
  if (withContext) s.setAttribute('data-mode', 'context');
  s.textContent = read(path.join(SITE, 'kedu_back.js'));
  w.document.body.appendChild(s);   /* 삽입 시점 실행 — currentScript = s */
  return w;
}

console.log('--- ③④⑤ 실로드 판정 ---');
T('T3 context 로드 → #kedu-back 칩 미생성', () => {
  const w = bootShell(true);
  return w.document.getElementById('kedu-back') ? '칩 생성됨' : true;
});
T('T4 context 에서도 KEDU_BACK 맥락은 산다 (go·label)', () => {
  const w = bootShell(true);
  const K = w.KEDU_BACK;
  return K && typeof K.go === 'function' && typeof K.label === 'string' ? true
    : JSON.stringify({ has: !!K });
});
T('T5 잣대의 잣대 — context 없이 로드하면 칩이 생긴다', () => {
  const w = bootShell(false);
  return w.document.getElementById('kedu-back') ? true : '칩 미생성 — 속성이 갈림길이 아님';
});

console.log('--- ⑥ R91 이중 안전망 잔존 ---');
T('T6 play.js 에 body.mkp-on #kedu-back 숨김 규칙 잔존', () => {
  const src = read(path.join(ROOT, 'data', 'play.js'));
  return /body\.mkp-on #kedu-back[^}]*display:\s*none/.test(src) ? true : '규칙 소실';
});

console.log('');
console.log('test-round92: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
