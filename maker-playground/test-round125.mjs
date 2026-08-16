/* ============================================================
   test-round125.mjs — R125 거짓 경보를 끝낸다
   ------------------------------------------------------------
   R125 가 메운 구멍: **검사기가 멀쩡한 제품을 불합격이라 불렀다.**

   준호 실기기 1차(R124 배포본)에서 `anim-live` 가 「등장이 끝났는데 요소가
   투명해요 — 빈 장면으로 재생됩니다」로 붉게 떴다. 그런데 같은 보고서가
   `animationName = mkp-fade, mkp-kb-zoom-in` 을 함께 찍고 있었다 —
   **브라우저가 선언을 받아들였다는 뜻**이라 R90 원인(콤마 하나로 shorthand
   전체 무효 → animationName:none)은 돌아오지 않았다. 준호가 미리보기를
   눌러 확인한 결과도 「보인다」였다. **틀린 쪽은 제품이 아니라 잣대였다(§5⑤).**

   원인: 탐침이 `animationDelay` 를 밀어 놓고 **같은 틱에서** opacity 를 읽었다.
   브라우저는 새 타이밍으로 애니를 다음 프레임에 다시 표집하므로, 그 자리에서
   읽으면 애니 효과값이 아니라 **인라인 기저값(opacity:0)** 이 나온다.

   ★ 거짓 경보는 무해하지 않다. 다음에 진짜 결함이 떠도 「또 검사기겠지」로
   넘어가면 이 페이지 전체가 값을 잃는다. 늑대소년은 한 번이면 족하다.

   함께 갚는 R124 누락 2건 — 둘 다 같은 성격이다(**아는 걸 안 말했다**):
   ⑵ 먹서가 이미 올라와 있으면 무조건 합격이라 **자체/CDN 을 한 번도 안 갈랐다.**
      R124 를 통째로 만든 이유가 그 구분인데 정작 그 정보를 버리고 있었다.
   ⑶ `muxer-reach` 의 설명줄이 아직 「CDN 에서 받아온다」였다 — 자체 호스팅으로
      옮겨 놓고 화면에는 옛말이 나가고 있었다.

   ⚠ 이 스위트도 **부재를 결과로 환원한다**(§5②). 전제가 안 서면 통과가 아니라
   실패다 — 원본 세계에서 저절로 참이 되는 비교를 두지 않는다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R125_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/selfcheck', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};
const sec = (n) => console.log('\n[' + n + ']');

const E = w.MK_SELFCHECK;
const V = w.MK_VIDEO;
const P = w.MK_PLAY;
const ssrc = read('data/selfcheck.js');

/* 탐침 본문만 떼어 낸다 — 다른 탐침의 문자열이 섞이면 검사가 흐려진다 */
const seg = (from, to) => {
  const i = ssrc.indexOf(from);
  if (i < 0) return '';
  const j = to ? ssrc.indexOf(to, i) : -1;
  return ssrc.slice(i, j < 0 ? ssrc.length : j);
};
const ANIM = seg('async function probeAnim', 'async function probeExport') || seg('function probeAnim', 'function probeExport');
const EXPORTSEG = seg('async function probeExport', 'async function encodeTwoFrames');

/* ================================================================
   ⑴ ★ 거짓 경보의 원인 — 같은 틱 측정을 끝냈다
   ================================================================ */
sec('1. 측정 시점 (anim-live)');

T('probeAnim 이 실존한다', () => !!ANIM || 'probeAnim 본문을 못 찾았다');

T('★ probeAnim 이 비동기다 (프레임을 기다릴 수 있어야 한다)', () =>
  /async function probeAnim/.test(ssrc) || '동기 함수 — 프레임을 기다릴 방법이 없다');

T('★ run() 이 probeAnim 을 await 한다 (안 하면 결과가 늦게 와 검사 수가 어긋난다)', () =>
  /await probeAnim\(/.test(ssrc) || 'await 없이 부른다');

T('★ 스타일을 바꾼 뒤 프레임을 기다린 다음에 읽는다 (거짓 경보의 원인)', () => {
  if (!ANIM) return 'probeAnim 부재';
  /* R132 정정(의도 보존): 대기가 둘이 됐다 — 인스턴스를 세우는 선(先)대기와
     측정 직전 대기. 잣대의 의도는 「**측정 직전에** 대기가 있다」이므로
     마지막 대기를 본다(첫 대기를 보면 조작보다 앞서 순서가 뒤집힌다). */
  const iSet = Math.max(ANIM.indexOf('animationDelay'), ANIM.indexOf('finish()'));
  const iWait = ANIM.lastIndexOf('nextFrames');
  const iRead = ANIM.indexOf('.opacity');
  if (iSet < 0) return '등장을 끝내는 조작이 없다';
  if (iWait < 0) return '프레임 대기가 없다 — 같은 틱에서 읽으면 기저값이 나온다';
  if (iRead < 0) return 'opacity 를 읽지 않는다';
  return (iSet < iWait && iWait < iRead)
    || `순서 위반: 조작 ${iSet} · 대기 ${iWait} · 측정 ${iRead}`;
});

T('nextFrames 가 rAF 를 쓰고 없는 환경은 타이머로 내려간다', () => {
  const nf = seg('const nextFrames', 'async function probeAnim');
  if (!nf) return 'nextFrames 부재';
  return (/requestAnimationFrame/.test(nf) && /setTimeout/.test(nf)) || '폴백이 없다';
});

T('★ 프레임이 안 오면 불합격이 아니라 미확정이다 (배경 탭에서 거짓 경보 금지)', () => {
  if (!ANIM) return 'probeAnim 부재';
  const i = ANIM.indexOf('ROPE');
  if (i < 0) return '밧줄이 없다 — 프레임이 안 오면 영영 안 끝나거나 거짓 불합격이다';
  return /'anim-live', 'skip'/.test(ANIM) || '시간 초과가 skip 이 아니다';
});

T('가능하면 Web Animations 로 의도를 그대로 말한다 (끝내라)', () => {
  if (!ANIM) return 'probeAnim 부재';
  return (/getAnimations/.test(ANIM) && /finish\(\)/.test(ANIM))
    || 'getAnimations 경로가 없다 — 지연 밀기만으로는 의도가 간접적이다';
});

T('★ 어떻게 끝냈는지 보고서에 남는다 (다음 사람이 재현할 수 있어야 한다)', () => {
  if (!ANIM) return 'probeAnim 부재';
  return /how/.test(ANIM) || '측정 방법이 결과에 안 실린다';
});

/* ================================================================
   ⑵ 제품은 멀쩡했다 — R90 원인이 안 돌아왔음을 못 박는다
   ================================================================ */
sec('2. R90 회귀 감시 (제품 쪽)');

const animCssOf = (el) => {
  const h = P.sceneHTML({ duration: 4, width: 1280, height: 720, elements: [el] });
  const m = /animation:([^"';]*)/.exec(h);
  return m ? m[1] : '';
};
const EL = { kind: 'image', src: 'x', x: 10, y: 20, w: 50, h: 60,
  anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } };

T('등장+idle 이 선언 2개로 방출된다', () => {
  const a = animCssOf(EL);
  return a.split(',').length === 2 || `선언 ${a.split(',').length}개: ${a}`;
});

T('★ 첫 선언이 채움(both)을 가진다 — 등장이 끝나도 보이는 근거', () => {
  const a = animCssOf(EL);
  return /\bboth\b/.test(a.split(',')[0]) || `채움 없음: ${a.split(',')[0]}`;
});

T('★ 시간값이 선언당 2개다 (R90 = 3개가 되어 shorthand 가 통째로 죽은 사건)', () => {
  const bad = animCssOf(EL).split(',').map((d) => d.trim()).filter((d) => {
    const times = d.match(/(^|\s)-?[\d.]+m?s(\s|$)/g) || [];
    return times.length !== 2;
  });
  return !bad.length || '시간값 개수 위반: ' + bad.join(' | ');
});

T('idle 없는 요소는 선언 1개 (헛선언을 안 붙인다)', () => {
  const a = animCssOf({ ...EL, anim: { preset: 'fade' } });
  return a.split(',').length === 1 || `선언 ${a.split(',').length}개: ${a}`;
});

/* ================================================================
   ⑶ 먹서가 이미 올라와 있을 때 — 아는 걸 말하고, 모르면 모른다고 한다
   ================================================================ */
sec('3. 선적재 분기 (muxer-reach · R124 누락분)');

T('★ 선적재 분기가 muxerSource 를 묻는다', () => {
  if (!EXPORTSEG) return 'probeExport 본문을 못 찾았다';
  const i = EXPORTSEG.indexOf('if (muxOK) {');
  if (i < 0) return '선적재 분기가 블록이 아니다 — 종전 무조건 합격 그대로다';
  return /muxerSource/.test(EXPORTSEG.slice(i, i + 900)) || '출처를 안 묻고 합격시킨다';
});

T('★ 출처를 모르면 합격이 아니라 미확정이다 (헛통과 금지 · §5②)', () => {
  if (!EXPORTSEG) return 'probeExport 부재';
  const i = EXPORTSEG.indexOf('if (muxOK) {');
  if (i < 0) return '선적재 분기 부재';
  const blk = EXPORTSEG.slice(i, i + 900);
  return /'muxer-reach', 'skip'/.test(blk) || '출처 불명을 합격 처리한다 — R124 가 검증되지 않은 채 초록불이 뜬다';
});

T('선적재가 자체면 합격, CDN 이면 불합격 (세 갈래가 다 있다)', () => {
  if (!EXPORTSEG) return 'probeExport 부재';
  const i = EXPORTSEG.indexOf('if (muxOK) {');
  const blk = EXPORTSEG.slice(i, i + 900);
  const miss = [];
  if (!/'self'/.test(blk)) miss.push('self');
  if (!/'cdn'/.test(blk)) miss.push('cdn');
  if (!/'muxer-reach', 'pass'/.test(blk)) miss.push('pass');
  if (!/'muxer-reach', 'fail'/.test(blk)) miss.push('fail');
  return !miss.length || '누락: ' + miss.join(',');
});

T('★ 미확정 안내가 「어떻게 하면 갈리는지」를 말한다 (준호가 다음 행동을 알아야 한다)', () => {
  if (!EXPORTSEG) return 'probeExport 부재';
  const i = EXPORTSEG.indexOf('if (muxOK) {');
  const blk = EXPORTSEG.slice(i, i + 900);
  return /새로고침/.test(blk) || '무엇을 하면 되는지 안 알려준다';
});

/* ================================================================
   ⑷ 화면이 옛말을 하지 않는다
   ================================================================ */
sec('4. 설명줄 정직성 (R124 누락분)');

const MR = (E.CHECKS || []).find((c) => c.id === 'muxer-reach');

T('muxer-reach 명세가 실존한다', () => !!MR || 'CHECKS 에 muxer-reach 가 없다');

T('★ 설명줄이 「CDN 에서 받아온다」라고 말하지 않는다 (R124 로 자체가 1순위다)', () => {
  if (!MR) return 'muxer-reach 부재';
  return !/CDN 에서 실제로 받아온다/.test(MR.proves) || '옛말 잔존: ' + MR.proves;
});

T('★ 설명줄이 자체 호스팅을 말한다', () => {
  if (!MR) return 'muxer-reach 부재';
  return /우리 서버/.test(MR.proves) || '자체 호스팅을 안 말한다: ' + MR.proves;
});

T('검사 총량은 그대로 15건이다 (R125 는 검사를 늘리지 않았다 · §5③)', () =>
  (E.CHECKS || []).length === 15 || `${(E.CHECKS || []).length}건`);

T('선적재 skip 은 판정에서 합격이 아니다 (건너뜀은 합격이 아니다)', () =>
  (!E.verdict([{ state: 'pass' }, { state: 'skip' }]).ok && E.verdict([{ state: 'pass' }]).ok)
  || 'skip 판정 규약 붕괴');

/* ================================================================
   ⑸ jsdom 안전 계약 — 비동기가 된 탐침이 게이트를 안 샌다
   ================================================================ */
sec('5. jsdom 게이트');

E.run(w).then((res) => {
  T('★ run() 이 jsdom 에서 탐침 0 · skipped 사유 반환 (비동기화로 게이트가 안 샜다)', () =>
    (Array.isArray(res.results) && res.results.length === 0
      && typeof res.skipped === 'string' && res.skipped.length > 0)
    || `게이트 통과됨: ${JSON.stringify(res).slice(0, 160)}`);
  T('탐침 무대 잔존 0', () =>
    (w.document.querySelectorAll('[data-sc-stage]').length === 0
      && w.document.querySelectorAll('[data-sc-hit]').length === 0) || '무대 노드 잔존');
  T('probeAnim 이 공개 표면에 안 샌다', () =>
    !E.probeAnim || 'probeAnim 이 공개 표면에 샜다');
  T('probeAnim 이 finally 로 무대를 걷는다 (비동기가 돼도 정리는 남는다)', () =>
    /finally\s*\{\s*if \(host\) host\.remove\(\);\s*\}/.test(ANIM) || 'finally 정리 없음');
  console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
  process.exit(fail ? 1 : 0);
}).catch((e) => {
  console.log('  ✗ R125 검사 예외 0  → 던졌다: ' + e.message);
  console.log(`\n결과: ${pass}/${pass + fail + 1}  (실패 ${fail + 1})`);
  process.exit(1);
});
