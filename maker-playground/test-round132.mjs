/* ============================================================
   test-round132.mjs — R132 못 재는 것을 불합격이라 부르지 않는다
   ------------------------------------------------------------
   ★ R125 가 틀렸다. 준호 실기기 2차에서 `anim-live` 가 **또** 붉게 떴고,
   detail 이 원인을 말해 줬다: `지연 -30s ×2`. 즉 R125 가 심은 1순위 경로
   (getAnimations().finish())가 **안 잡혔고** 폴백으로 내려갔다는 뜻이다.
   인스턴스가 없다 = 브라우저가 애니를 **시작조차 안 했다.**

   진짜 원인: 탐침 무대(stageEl)가 `left:-99999px` — 화면 밖이라 브라우저가
   렌더 최적화로 애니를 안 돌린다. 스타일 계산은 되므로 animationName 은
   나오고(그래서 R125 는 「선언은 받아들여졌다」까지만 옳게 읽었다), 애니
   효과값은 없으니 인라인 기저값 opacity:0 이 그대로 읽힌다.

   ★ R121 이 이미 같은 자리를 밟았다 — 「stageEl 은 left:-99999px 라
   elementFromPoint 가 닿지 않는다. 화면 안에 있어야 브라우저가 답한다.」
   그 교훈이 애니에도 똑같이 적용된다는 걸 R125 가 못 봤다. **원인을 한 층
   더 안 파고 가설 하나에 걸었다** — 실기기 없이 고쳤으니 검증도 불가능했다.

   처방 둘(하나는 수리, 하나는 재발 방지):
   ① stageAnim — 애니 전용 화면 안 무대(opacity 0.01·z-index -1).
   ② **못 재면 skip.** 인스턴스 부재도, 폴백 경로의 0 도 불합격이 아니라
      미확정이다. R125 는 「프레임 미도래」에만 이 원칙을 썼고 「애니 미실행」
      에는 안 썼다 — 그래서 거짓 경보가 두 번 났다. 거짓 경보는 무해하지
      않다: 다음에 진짜 결함이 떠도 「또 검사기겠지」로 넘어간다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R132_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/selfcheck', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
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
const ssrc = read('data/selfcheck.js');
const ANIM = (() => {
  const i = ssrc.indexOf('async function probeAnim');
  const j = ssrc.indexOf('async function probeExport');
  return i >= 0 ? ssrc.slice(i, j < 0 ? i + 4000 : j) : '';
})();

/* ================================================================
   ⑴ ★ 무대가 화면 안이다 (진짜 원인의 수리)
   ================================================================ */
sec('1. 애니 무대 (stageAnim)');

T('★ 애니 전용 무대가 실존한다', () => /function stageAnim/.test(ssrc) || 'stageAnim 부재');

T('★ 화면 안이다 (left:-99999px 가 아니다 — 화면 밖은 애니를 안 돌린다)', () => {
  const i = ssrc.indexOf('function stageAnim');
  const seg = ssrc.slice(i, i + 700);
  if (/-99999px/.test(seg)) return '여전히 화면 밖';
  return /left:0/.test(seg) || '위치 규약 불명';
});

T('★ 확실히 그린다 (opacity 0 이 아니라 0.01 — 애니 최적화 기준은 히트와 다르다)', () => {
  const i = ssrc.indexOf('function stageAnim');
  const seg = ssrc.slice(i, i + 700);
  return /opacity:0\.01/.test(seg) || '완전 투명 — 최적화로 애니가 죽을 수 있다';
});

T('사람 눈·손을 안 가린다 (pointer-events:none · z-index 뒤)', () => {
  const i = ssrc.indexOf('function stageAnim');
  const seg = ssrc.slice(i, i + 700);
  return (/pointer-events:none/.test(seg) && /z-index:-1/.test(seg)) || '무대가 화면을 가린다';
});

T('★ probeAnim 이 새 무대를 쓴다 (stageEl 잔존 0)', () => {
  if (!ANIM) return 'probeAnim 부재';
  if (/stageEl\(/.test(ANIM)) return '옛 무대 잔존';
  return /stageAnim\(win/.test(ANIM) || '새 무대 미사용';
});

T('다른 탐침의 무대는 안 건드렸다 (stageEl 사용처 유지 — 범위 밖 회귀 0)', () => {
  const n = ssrc.split('stageEl(win').length - 1;
  return n >= 4 || `stageEl 사용처 ${n}곳 — 다른 탐침이 휩쓸렸다`;
});

T('무대 표식이 같다 (data-sc-stage — 잔존 검사가 새 무대도 잡는다)', () => {
  const i = ssrc.indexOf('function stageAnim');
  return /data-sc-stage/.test(ssrc.slice(i, i + 700)) || '표식 불일치 — 잔존 검사를 빠져나간다';
});

/* ================================================================
   ⑵ ★ 못 재면 불합격이 아니다 (재발 방지)
   ================================================================ */
sec('2. 측정 불가 = 미확정');

T('★ 인스턴스가 없으면 skip 이다 (R125 가 fail 로 부르던 자리)', () => {
  if (!ANIM) return 'probeAnim 부재';
  const i = ANIM.indexOf('} else if (anims) {');
  if (i < 0) return '인스턴스 부재 갈래가 없다 — 폴백으로 새서 거짓 경보가 난다';
  return /'anim-live', 'skip'/.test(ANIM.slice(i, i + 500)) || '인스턴스 부재를 불합격으로 부른다';
});

T('★ 폴백 경로의 불투명도 0 도 단정하지 않는다 (미확정)', () => {
  if (!ANIM) return 'probeAnim 부재';
  const i = ANIM.indexOf('else if (/지연/.test(how))');
  if (i < 0) return '폴백 0 을 갈라 보지 않는다';
  return /'anim-live', 'skip'/.test(ANIM.slice(i, i + 400)) || '폴백 0 을 불합격으로 단정한다';
});

T('★ 불합격은 확실히 잰 경우에만 남는다 (getAnimations 로 끝냈는데 투명)', () => {
  if (!ANIM) return 'probeAnim 부재';
  /* 「빈 장면으로 재생됩니다」 갈래를 이름으로 집는다. lastIndexOf 로 잡으면
     catch 절의 '탐침 실패' 가 걸린다(R132 1차에서 실제로 걸린 하니스 버그). */
  const i = ANIM.indexOf('등장이 끝났는데 요소가 투명해요');
  if (i < 0) return '불합격 갈래가 사라졌다 — 진짜 결함을 못 잡는다';
  const before = ANIM.slice(Math.max(0, i - 500), i);
  return /지연/.test(before) || '불합격이 측정 확실성과 안 묶였다';
});

T('미확정 안내가 다음 행동을 말한다 (재생 화면에서 눈으로)', () => {
  if (!ANIM) return 'probeAnim 부재';
  return /재생 화면에서 눈으로/.test(ANIM) || '막힌 채 끝난다';
});

T('선언 미수용(animationName:none)은 여전히 불합격이다 (R90 감시 유지)', () => {
  if (!ANIM) return 'probeAnim 부재';
  const i = ANIM.indexOf("name === 'none'");
  return (i > 0 && /'anim-live', 'fail'/.test(ANIM.slice(i, i + 400)))
    || '선언 미수용을 미확정으로 눅였다 — R90 감시가 죽는다';
});

T('인스턴스가 서도록 한 프레임 먼저 준다 (삽입 직후엔 아직 없다)', () => {
  if (!ANIM) return 'probeAnim 부재';
  const iWait = ANIM.indexOf('nextFrames(win, 1)');
  const iGet = ANIM.indexOf('getAnimations');
  return (iWait > 0 && iWait < iGet) || '인스턴스를 세기 전에 묻는다';
});

/* ================================================================
   ⑶ 회귀
   ================================================================ */
sec('3. 회귀');

T('검사 총량 15건 불변 (R132 는 검사를 늘리지 않았다 · §5③)', () =>
  (E.CHECKS || []).length === 15 || `${(E.CHECKS || []).length}건`);

T('skip 은 판정에서 합격이 아니다 (미확정을 초록으로 세지 않는다)', () =>
  (!E.verdict([{ state: 'pass' }, { state: 'skip' }]).ok && E.verdict([{ state: 'pass' }]).ok)
  || 'skip 판정 규약 붕괴');

T('R125 측정 시점 계약 유지 (조작 → 대기 → 측정 순서)', () => {
  if (!ANIM) return 'probeAnim 부재';
  const iSet = Math.max(ANIM.indexOf('animationDelay'), ANIM.indexOf('finish()'));
  const iWait = ANIM.lastIndexOf('nextFrames(win, 2)');
  const iRead = ANIM.indexOf('.opacity');
  return (iSet < iWait && iWait < iRead) || `순서 위반: ${iSet}/${iWait}/${iRead}`;
});

T('probeAnim 이 finally 로 무대를 걷는다', () =>
  /finally\s*\{\s*if \(host\) host\.remove\(\);\s*\}/.test(ANIM) || 'finally 정리 없음');

E.run(w).then((res) => {
  T('jsdom 게이트 무손상 (탐침 0 · skipped 사유)', () =>
    (Array.isArray(res.results) && res.results.length === 0 && typeof res.skipped === 'string')
    || JSON.stringify(res).slice(0, 140));
  T('무대 잔존 0 (새 무대도 걷힌다)', () =>
    (w.document.querySelectorAll('[data-sc-stage]').length === 0
      && w.document.querySelectorAll('[data-sc-hit]').length === 0) || '무대 노드 잔존');
  console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
  process.exit(fail ? 1 : 0);
}).catch((e) => {
  console.log('  ✗ R132 검사 예외 0  → ' + e.message);
  console.log(`\n결과: ${pass}/${pass + fail + 1}  (실패 ${fail + 1})`);
  process.exit(1);
});
