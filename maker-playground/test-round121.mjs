/* ============================================================
   test-round121.mjs — R121 준호 실기기 결함의 회귀 감시
   ------------------------------------------------------------
   R121 이 잡은 구멍: 준호가 실기기에서 **직접 눈으로** 잡아낸 결함들
   (R88 화면 밖 패널 · R90 빈 재생 장면 · R95 태블릿 리사이즈 불능)의
   회귀를 지금 아무도 안 지키고 있었다. 스위트를 뜯어보면

     · R88 T2  = scrollIntoView 를 **호출했는지**만 잰다
     · R95 T3  = 「rect 폭 0(jsdom·미배치) = 판정 안 함」 — 아예 못 돈다
     · R95 T6  = CSS 선언 **문자열**을 확인한다
     · R90     = CSS 선언 문자열을 파싱한다

   전부 **처방의 흔적**까지다. 증상 자체(안 보인다·안 잡힌다·투명하다)를
   밟는 눈은 준호 하나였고, 같은 결함이 돌아와도 아무 불이 안 켜졌다.
   R120 이 판 문(#/selfcheck)에 그 감시를 올린다.

   그래서 이 하니스의 표적은 R120 과 같은 성격이다 — **브라우저 탐침은
   jsdom 에서 돌릴 수 없으므로, 탐침이 판정 근거로 쓰는 것을 전량 검사한다.**

   ① 임계 정합성 (이 파일의 존재 이유)
      touch-hit 은 「히트 반경 ≥ 12px」로 합격을 준다. 이 12 라는 수가
      CSS 실물과 어긋나면 초록불도 빨간불도 뜻이 없다. CSS 에서 실제
      히트패드·핸들 치수를 **파싱해** 임계가 그 사이에 정확히 놓였는지
      확인한다 — 통과 가능해야 하고(패드보다 작다), 옛 세계는 반드시
      걸려야 한다(옛 핸들보다 크다). 반례가 안 걸리는 검사기는 검사기가
      아니라는 R120 §켤레 반례와 같은 결.

   ② 실경로 실존 — 탐침이 재는 그 자리가 진짜인가
      anim-live 는 MK_PLAY.sceneHTML 실방출을 잰다. 그 방출에 애니 선언이
      실제로 실리는지, .ws-hd 히트패드 CSS 가 실존하는지 문자열로 못 박는다.

   ③ 명세·화면 정직성
      R121 착수 때 실제로 밟은 함정: 화면의 라운드 목록이 하드코딩이라
      CHECKS 에 2건을 넣어도 안 그려졌다. 도출로 고쳤고 여기서 고정한다.

   ④ jsdom 안전 계약 — 신규 무대(data-sc-hit)도 잔존 0
      R11~R15 가 전 화면을 render+mount 한다. 신규 탐침이 게이트를 새면
      다섯 스위트가 한꺼번에 무너진다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R121_ROOT || path.resolve('.');
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

const E = w.MK_SELFCHECK, P = w.MK_PLAY, SCR = w.MK_SCREENS;
const CSS = read('playground.css');
const SRC = read('data/selfcheck.js');

/* ================================================================
   ⑴ 임계 정합성 — 「12px」이 CSS 실물과 맞물리는가
   ================================================================ */
sec('1. 임계 정합성 (검사기가 검사받는다)');

/* CSS 에서 실물 치수를 파싱한다 — 손으로 적은 수를 믿지 않는다 */
const padPx = (() => {
  const m = CSS.match(/\.ws-el\s+\.ws-hd::after\s*\{[^}]*?width:\s*(\d+(?:\.\d+)?)px[^}]*?height:\s*(\d+(?:\.\d+)?)px[^}]*?\}/);
  return m ? Math.min(+m[1], +m[2]) : null;
})();
const baseHd = (() => {
  const m = CSS.match(/\.ws-el\s+\.ws-hd\{[^}]*?width:\s*(\d+(?:\.\d+)?)px/);
  return m ? +m[1] : null;
})();
const coarseHd = (() => {
  const m = CSS.match(/@media\s*\(pointer:coarse\)\{[^]*?\.ws-el\s+\.ws-hd\{[^}]*?width:\s*(\d+(?:\.\d+)?)px/);
  return m ? +m[1] : null;
})();
const HIT_MIN = (() => { const m = SRC.match(/const HIT_MIN\s*=\s*(\d+)/); return m ? +m[1] : null; })();
const HIT_OLD = (() => { const m = SRC.match(/HIT_OLD\s*=\s*(\d+)/); return m ? +m[1] : null; })();

T('CSS 실물 파싱 — 히트패드·핸들 치수 실존', () =>
  (padPx > 0 && baseHd > 0 && coarseHd > 0)
  || `패드 ${padPx} / 기본핸들 ${baseHd} / coarse핸들 ${coarseHd}`);

T('임계가 코드에 상수로 박혀 있다', () =>
  (HIT_MIN > 0 && HIT_OLD > 0) || `HIT_MIN ${HIT_MIN} / HIT_OLD ${HIT_OLD}`);

T('★ 통과 가능 — 임계가 히트패드 반경 안에 든다', () => {
  const reach = padPx / 2;                       /* 중심 정렬 정사각 패드 → 축방향 반경 */
  if (!(HIT_MIN > 0)) return '임계 미검출 — 검사가 성립하지 않는다';   /* null <= n 은 참이다 */
  return HIT_MIN <= reach || `임계 ${HIT_MIN}px > 실제 도달 가능 ${reach}px — 절대 통과 못 하는 검사`;
});

T('★ 반례 검출 — 옛 세계(패드 없음)는 반드시 걸린다', () => {
  const oldReach = Math.max(baseHd, coarseHd) / 2;   /* 패드가 사라지면 핸들 자체가 상한 */
  return HIT_MIN > oldReach || `임계 ${HIT_MIN}px ≤ 옛 도달 ${oldReach}px — 회귀해도 초록불이 뜬다`;
});

T('HIT_OLD 가 옛 세계 상한을 실제로 덮는다', () => {
  const oldReach = Math.max(baseHd, coarseHd) / 2;
  return HIT_OLD >= oldReach || `HIT_OLD ${HIT_OLD} < 옛 도달 ${oldReach} — 회귀를 「옛 세계」로 안 부른다`;
});

T('임계 사이에 실제 여유가 있다 (경계 붙어 있지 않음)', () => {
  const reach = padPx / 2, oldReach = Math.max(baseHd, coarseHd) / 2;
  return (reach - HIT_MIN >= 2 && HIT_MIN - oldReach >= 2)
    || `여유 부족: 위 ${(reach - HIT_MIN).toFixed(1)}px · 아래 ${(HIT_MIN - oldReach).toFixed(1)}px`;
});

/* ================================================================
   ⑵ 실경로 실존 — 탐침이 재는 자리가 진짜인가
   ================================================================ */
sec('2. 실경로 실존');

T('히트패드 CSS 가 .ws-hd 에 실제로 걸려 있다', () =>
  /\.ws-el\s+\.ws-hd::after\s*\{[^}]*content/.test(CSS) || '::after 히트패드 규칙 부재');

T('핸들이 포인터를 받는다 (pointer-events:auto)', () =>
  /\.ws-el\s+\.ws-hd\{[^}]*pointer-events:\s*auto/.test(CSS) || '핸들이 포인터를 안 받으면 히트패드가 무의미');

T('coarse 확대 블록 실존 (태블릿·폰)', () =>
  /@media\s*\(pointer:coarse\)\{[^]*?\.ws-hd/.test(CSS) || 'coarse 블록 부재');

T('sceneHTML 이 애니 선언을 실제로 방출한다', () => {
  if (!P || !P.sceneHTML) return 'MK_PLAY.sceneHTML 부재';
  const h = P.sceneHTML({ duration: 4, width: 1280, height: 720,
    elements: [{ kind: 'image', src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      x: 10, y: 20, w: 50, h: 60, anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } }] });
  return /animation:/.test(h) || '방출에 animation 선언이 없다 — 탐침이 잴 것이 없다';
});

T('still 방출엔 애니가 없다 (탐침 대조군 계약 생존)', () => {
  if (!P || !P.sceneHTML) return 'MK_PLAY.sceneHTML 부재';
  const h = P.sceneHTML({ duration: 4, width: 1280, height: 720,
    elements: [{ kind: 'image', src: 'x', x: 0, y: 0, w: 10, h: 10, anim: { preset: 'fade', idle: 'kb-zoom-in' } }] }, { still: true });
  return !/animation:/.test(h) || 'still 인데 애니가 실렸다';
});

/* ================================================================
   ⑶ 명세 정직성
   ================================================================ */
sec('3. 명세 정직성');

/* R122 개정 — 총 건수 고정은 매 라운드 손질을 부른다. R121 이 지켜야 할 것은
   「R121 이 넣은 2건이 살아 있다」이지 「총 11건이다」가 아니다. 정확한 총량은
   그 라운드 스위트(R122 = 15건)가 잰다. 여기선 R121 몫만 못 박는다. */
T('R121 2건 생존 · 필드 전량 · id 유일', () => {
  if (!E || !Array.isArray(E.CHECKS)) return 'CHECKS 부재';
  const mine = ['touch-hit', 'anim-live'].filter((id) => !E.CHECKS.some((c) => c.id === id));
  if (mine.length) return 'R121 검사 소실: ' + mine.join(',');
  if (E.CHECKS.length < 11) return '검사 수 ' + E.CHECKS.length + ' — R121 시점보다 줄었다';
  if (!E.CHECKS.every((c) => c.id && c.round && c.title && c.proves && c.blind)) return '필드 누락';
  return new Set(E.CHECKS.map((c) => c.id)).size === E.CHECKS.length || 'id 중복';
});

T('신규 2건이 실제로 등재됐다', () => {
  const ids = E.CHECKS.map((c) => c.id);
  for (const id of ['touch-hit', 'anim-live']) if (!ids.includes(id)) return id + ' 미등재';
  return true;
});

T('신규 2건이 회귀 대상 라운드를 가리킨다', () => {
  const by = Object.fromEntries(E.CHECKS.map((c) => [c.id, c]));
  if (by['touch-hit'].round !== 'R95') return 'touch-hit round=' + by['touch-hit'].round;
  if (by['anim-live'].round !== 'R90') return 'anim-live round=' + by['anim-live'].round;
  return true;
});

T('R120 기존 9건 무손 (회귀)', () => {
  const ids = E.CHECKS.map((c) => c.id);
  for (const id of ['idb-open', 'idb-disk', 'idb-survive', 'idb-bulk', 'focus-origin', 'focus-none', 'rot-nest', 'rot-parity', 'rot-pan'])
    if (!ids.includes(id)) return id + ' 소실';
  return true;
});

T('R118 은 여전히 기계 검사 밖 (R120 정직 분리 생존)', () =>
  !E.CHECKS.some((c) => c.round === 'R118') || 'R118 이 기계 검사로 올라왔다 — 순수 계층 착시');

T('R88 은 기계 검사에 넣지 않았다 (실경로 불가 — 정직 분리)', () =>
  !E.CHECKS.some((c) => c.round === 'R88') || 'R88 은 화면 전환 없이 못 재는데 등재됐다');

/* ================================================================
   ⑷ 화면 — 하드코딩 함정 재발 방지
   ================================================================ */
sec('4. 화면이 모든 라운드를 그린다');

T('화면 등재·계약 생존', () => {
  const s = SCR && SCR.selfcheck;
  return (s && typeof s.render === 'function' && typeof s.mount === 'function') || 'selfcheck 화면 계약 위반';
});

T('★ render 산출에 CHECKS 의 모든 라운드가 나온다', () => {
  const s = SCR.selfcheck, h = s.render(s.variants[0]);
  const rounds = [...new Set(E.CHECKS.map((c) => c.round))];
  for (const r of rounds) if (!h.includes(r)) return r + ' 이 화면에 안 그려진다 (하드코딩 함정)';
  return true;
});

T('★ render 산출에 신규 2건 제목이 실제로 실린다', () => {
  const s = SCR.selfcheck, h = s.render(s.variants[0]);
  const by = Object.fromEntries(E.CHECKS.map((c) => [c.id, c]));
  for (const id of ['touch-hit', 'anim-live']) if (!h.includes(by[id].title)) return by[id].title + ' 미표시';
  return true;
});

T('라운드 목록이 하드코딩이 아니다 (도출)', () =>
  !/const rounds\s*=\s*\[\s*'R1/.test(read('screens/selfcheck.js')) || '라운드 배열이 다시 손으로 적혔다');

T('눈 확인 목록 무손 (R120 4건)', () =>
  (Array.isArray(E.EYES) && E.EYES.length >= 4) || 'EYES 축소: ' + (E.EYES && E.EYES.length));

/* ================================================================
   ⑸ jsdom 안전 계약 — 신규 탐침이 게이트를 안 샌다
   ================================================================ */
sec('5. jsdom 안전 계약');

T('supported() 가 여전히 jsdom 을 막는다', () => {
  const r = E.supported(w);
  return (r.ok === false && !!r.why) || '게이트 미작동: ' + JSON.stringify(r);
});

T('render+mount 무예외 (R11~R15 가 하는 그 호출)', () => {
  const s = SCR.selfcheck, body = w.document.getElementById('pgBody');
  body.innerHTML = s.render(s.variants[0]);
  s.mount(body);
  return true;
});

T('전 화면 순회 재현 — 전량 render+mount 무예외', () => {
  const body = w.document.getElementById('pgBody');
  for (const k of Object.keys(SCR)) {
    const s = SCR[k];
    if (!s || typeof s.render !== 'function') continue;
    try {
      body.innerHTML = s.render((s.variants && s.variants[0]) || '');
      if (typeof s.mount === 'function') s.mount(body);
    } catch (e) { return k + ' 에서 예외: ' + e.message; }
  }
  return true;
});

T('신규 탐침이 공개 표면을 안 늘렸다 (탐침은 run 뒤에만)', () => {
  for (const k of ['probeTouch', 'probeAnim']) if (E[k]) return k + ' 이 공개 표면에 샜다';
  return true;
});

T('히트 무대가 stageEl 과 분리돼 있다 (화면 안 무대는 별도)', () =>
  /data-sc-hit/.test(SRC) || '히트 무대 표식 부재');

T('히트 무대가 즉시 걷히는 계약 (finally remove)', () => {
  const seg = SRC.slice(SRC.indexOf('function probeTouch'), SRC.indexOf('function probeAnim'));
  return /finally\s*\{\s*if \(host\) host\.remove\(\);\s*\}/.test(seg) || 'probeTouch 에 finally 정리 없음';
});

T('애니 탐침도 무대를 걷는다', () => {
  const i = SRC.indexOf('function probeAnim');
  const seg = SRC.slice(i, i + 2600);
  return /finally\s*\{\s*if \(host\) host\.remove\(\);\s*\}/.test(seg) || 'probeAnim 에 finally 정리 없음';
});

T('elementFromPoint 부재 환경은 skip (거짓 불합격 금지 — R120 settle 정신)', () => {
  const seg = SRC.slice(SRC.indexOf('function probeTouch'), SRC.indexOf('function probeAnim'));
  return /elementFromPoint[^]*?'skip'/.test(seg) || '히트를 못 묻는 환경에서 불합격을 준다';
});

/* ================================================================
   ⑹ 판정 집계 회귀 (R120 계약 생존)
   ================================================================ */
sec('6. 판정 집계 회귀');

T('skip 은 여전히 합격이 아니다', () =>
  E.verdict([{ state: 'pass' }, { state: 'skip' }]).ok === false || 'skip 을 합격으로 셈');

T('11건 전량 합격이면 ok', () => {
  const v = E.verdict(new Array(11).fill({ state: 'pass' }));
  return (v.ok === true && v.pass === 11) || JSON.stringify(v);
});

T('신규 2건이 불합격이면 전체 불합격', () => {
  const v = E.verdict([...new Array(9).fill({ state: 'pass' }), { state: 'fail' }, { state: 'fail' }]);
  return (v.ok === false && v.fail === 2) || JSON.stringify(v);
});

T('audit() 무위반 (엔진 자가검증)', () => {
  const a = E.audit();
  return a.ok || '위반: ' + a.violations.join(' / ');
});

/* ================================================================
   ⑺ run() — jsdom 에서 탐침 0 · 무대 잔존 0 (신규 무대 포함)
   ================================================================ */
sec('7. run() 게이트·무대 잔존');

const finish = () => {
  console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
  process.exit(fail ? 1 : 0);
};

if (!E || typeof E.run !== 'function') {
  T('run() 게이트', () => 'MK_SELFCHECK.run 부재');
  finish();
} else E.run(w).then((out) => {
  T('run() 이 jsdom 에서 탐침 0 · skipped 사유 반환', () =>
    (Array.isArray(out.results) && out.results.length === 0 && typeof out.skipped === 'string' && out.skipped.length > 0)
    || `게이트 통과됨: ${JSON.stringify(out).slice(0, 160)}`);
  T('탐침 무대 잔존 0 (data-sc-stage)', () =>
    w.document.querySelectorAll('[data-sc-stage]').length === 0 || '무대 노드 잔존');
  T('★ 히트 무대 잔존 0 (data-sc-hit — 화면 안에 떠 있으면 클릭을 가로챈다)', () =>
    w.document.querySelectorAll('[data-sc-hit]').length === 0 || '히트 무대 노드 잔존');
  finish();
}).catch((e) => {
  T('run() 예외 0', () => 'run 이 던졌다: ' + e.message);
  finish();
});
