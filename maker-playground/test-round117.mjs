/* ============================================================
   test-round117.mjs — R117 켄번즈·변형 축이 초점을 향한다 (§1.114 R94 이월)
   ------------------------------------------------------------
   R94는 cover 크롭의 「남길 곳」만 정했고, 변형(켄번즈·등장 scale·
   rotate 델타)의 축은 여전히 요소 중앙이었다 — 초점 찍은 얼굴을
   줌이 지나쳐 갔다. R117 = 정본 하나(MK_FOCAL.originOf)를 재생
   (CSS transform-origin)과 MP4(캔버스 animPivot 피벗)가 함께 읽어
   패리티가 구조로 성립한다.

   계약:
     ⑴ originOf 순수 — 무초점·가운데·회전(el.rot) → null / 0.1% 격자 /
        범위 밖 클램프
     ⑵ sceneHTML — focal 미디어에 transform-origin % 실값 방출
     ⑶ 무초점·가운데·회전 → origin 부재(종전 바이트 보존)
     ⑷ still 모드 — 같은 경로라 origin 동일 방출
     ⑸ animPivot — 좌표 수학(ex+ew·x, ey+eh·y)·null 폴백
     ⑹ 패리티 — CSS % 파싱값/100 == animPivot 분율(같은 originOf 수)
     ⑺ 영상 요소 동일 — 미디어 브랜치 공용
     ⑻ 회귀 — R90 kb 방출 정규식·playAudit·videoAudit·focal audit
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R117_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
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

const F = w.MK_FOCAL, P = w.MK_PLAY, V = w.MK_VIDEO;
/* 초점 있는 사진 요소 — sceneHTML 미디어 브랜치용 */
const photo = (extra) => Object.assign(
  { kind: 'image', src: 'data:image/png;base64,X', x: 10, y: 10, w: 60, h: 40 }, extra);
const sceneOf = (el) => ({ duration: 3, elements: [el] });
/* 렌더된 미디어 래퍼(mkp-img div)의 style 문자열 */
const wrapStyle = (htmlStr) => {
  const m = htmlStr.match(/class="mkp-el mkp-img" style="([^"]*)"/);
  return m ? m[1] : null;
};
const originIn = (styleStr) => {
  const m = (styleStr || '').match(/transform-origin:([\d.]+)% ([\d.]+)%/);
  return m ? { x: +m[1], y: +m[2] } : null;
};

console.log('--- ⑴ originOf 순수 계약 ---');
T('T1 정본 실존 + focal audit 통과(R117 검사 포함)', () => {
  if (!F || typeof F.originOf !== 'function') return 'MK_FOCAL.originOf 없음';
  const a = F.audit(); return a.ok ? true : a.violations.join(', ');
});
T('T2 무초점·null 요소 → null', () => {
  return F.originOf(null) === null && F.originOf({}) === null
    && F.originOf({ src: 'data:image/png;base64,X' }) === null ? true : '무초점에 축 발급';
});
T('T3 가운데(0.5,0.5) → null — 종전 중앙 축과 같으니 발급 안 함', () => {
  return F.originOf({ focal: { x: 0.5, y: 0.5 } }) === null ? true : '가운데에 축 발급';
});
T('T4 회전 요소(el.rot) → null — R107 정적 회전 축 보전(정직 제외)', () => {
  return F.originOf({ focal: { x: 0.3, y: 0.8 }, rot: 15 }) === null
    && F.originOf({ focal: { x: 0.3, y: 0.8 }, rot: -0.5 }) === null ? true : '회전에 축 발급';
});
T('T5 0.1% 격자 양자화 — 0.3335 → 0.334', () => {
  const o = F.originOf({ focal: { x: 0.3335, y: 1 } });
  return o && o.x === 0.334 && o.y === 1 ? true : JSON.stringify(o);
});
T('T6 범위 밖 클램프 — norm 경유라 0..1 안', () => {
  const o = F.originOf({ focal: { x: 5, y: -3 } });
  return o && o.x === 1 && o.y === 0 ? true : JSON.stringify(o);
});

console.log('--- ⑵ sceneHTML — focal 미디어 origin 방출 ---');
T('T7 focal(0.2,0.9) → transform-origin:20% 90%', () => {
  const s = wrapStyle(P.sceneHTML(sceneOf(photo({ focal: { x: 0.2, y: 0.9 } }))));
  const o = originIn(s);
  return o && o.x === 20 && o.y === 90 ? true : String(s);
});
T('T8 격자 수가 그대로 % 로 — 0.3335 → 33.4%', () => {
  const s = wrapStyle(P.sceneHTML(sceneOf(photo({ focal: { x: 0.3335, y: 0.75 } }))));
  const o = originIn(s);
  return o && o.x === 33.4 && o.y === 75 ? true : String(s);
});

console.log('--- ⑶ 부재 = 종전 바이트 보존 ---');
T('T9 무초점 요소 — transform-origin 부재', () => {
  const s = wrapStyle(P.sceneHTML(sceneOf(photo({}))));
  return s !== null && !/transform-origin/.test(s) ? true : String(s);
});
T('T10 가운데·회전 요소 — 부재', () => {
  const a = wrapStyle(P.sceneHTML(sceneOf(photo({ focal: { x: 0.5, y: 0.5 } }))));
  const b = wrapStyle(P.sceneHTML(sceneOf(photo({ focal: { x: 0.2, y: 0.9 }, rot: 15 }))));
  return !/transform-origin/.test(a || '') && !/transform-origin/.test(b || '') ? true
    : JSON.stringify([a, b]);
});
T('T11 무초점 장면 전체 — R117 이전과 같은 자리에 새 문자열 0', () => {
  const h = P.sceneHTML(sceneOf(photo({ anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } })));
  return !/transform-origin/.test(h) ? true : '무초점에 origin 유출';
});

console.log('--- ⑷ still 모드 — 같은 경로 ---');
T('T12 still 렌더에도 origin 동일 방출(축은 애니가 아니라 요소 속성)', () => {
  const s = wrapStyle(P.sceneHTML(sceneOf(photo({ focal: { x: 0.2, y: 0.9 } })), { still: true }));
  const o = originIn(s);
  return o && o.x === 20 && o.y === 90 ? true : String(s);
});
T('T13 still 무초점 — 부재 + 애니 미섞임(기존 계약 동행)', () => {
  const h = P.sceneHTML(sceneOf(photo({ anim: { preset: 'fade' } })), { still: true });
  return !/transform-origin/.test(h) && !/animation:/.test(h) ? true : 'still 오염';
});

console.log('--- ⑸ animPivot — 캔버스 피벗 수학 ---');
T('T14 좌표 변환 — (0.2,0.9) × 틀(100,50,200,100) → (140,140)', () => {
  const p = V.animPivot({ focal: { x: 0.2, y: 0.9 } }, 100, 50, 200, 100);
  return p && Math.abs(p.px - 140) < 1e-9 && Math.abs(p.py - 140) < 1e-9 ? true : JSON.stringify(p);
});
T('T15 null 폴백 3종 — 무초점·가운데·회전', () => {
  return V.animPivot({}, 0, 0, 10, 10) === null
    && V.animPivot({ focal: { x: 0.5, y: 0.5 } }, 0, 0, 10, 10) === null
    && V.animPivot({ focal: { x: 0.2, y: 0.9 }, rot: 10 }, 0, 0, 10, 10) === null ? true : '폴백 위반';
});
T('T16 격자 수가 피벗에도 — 0.3335 × 폭 1000 → 334', () => {
  const p = V.animPivot({ focal: { x: 0.3335, y: 0 } }, 0, 0, 1000, 1000);
  return p && Math.abs(p.px - 334) < 1e-9 && Math.abs(p.py - 0) < 1e-9 ? true : JSON.stringify(p);
});

console.log('--- ⑹ 패리티 — CSS % == 캔버스 분율(같은 originOf 수) ---');
T('T17 대표 5점에서 CSS 파싱값/100 == animPivot 분율', () => {
  const pts = [[0, 0], [1, 1], [0.25, 0.75], [0.3335, 0.1], [0.999, 0.001]];
  for (const [x, y] of pts) {
    const el = photo({ focal: { x, y } });
    const css = originIn(wrapStyle(P.sceneHTML(sceneOf(el))));
    const pv = V.animPivot(el, 0, 0, 1, 1); /* 단위 틀 → px·py 가 곧 분율 */
    if (!css || !pv) return `(${x},${y}) 방출 결손 css=${JSON.stringify(css)} pv=${JSON.stringify(pv)}`;
    if (Math.abs(css.x / 100 - pv.px) > 1e-9 || Math.abs(css.y / 100 - pv.py) > 1e-9)
      return `(${x},${y}) 불일치 css=${JSON.stringify(css)} pv=${JSON.stringify(pv)}`;
  }
  return true;
});
T('T18 null 도 함께 null — 회전·가운데에서 두 세계 동시 침묵', () => {
  for (const el of [photo({ focal: { x: 0.5, y: 0.5 } }), photo({ focal: { x: 0.2, y: 0.9 }, rot: 5 })]) {
    const css = originIn(wrapStyle(P.sceneHTML(sceneOf(el))));
    const pv = V.animPivot(el, 0, 0, 1, 1);
    if (css !== null || pv !== null) return `동시 침묵 위반 css=${JSON.stringify(css)} pv=${JSON.stringify(pv)}`;
  }
  return true;
});

console.log('--- ⑺ 영상 요소 — 미디어 브랜치 공용 ---');
T('T19 kind:video + focal → <video> 래퍼에 같은 origin', () => {
  const h = P.sceneHTML(sceneOf(photo({ kind: 'video', video: true, src: 'data:video/mp4;base64,V', focal: { x: 0.1, y: 0.6 } })));
  if (!/<video /.test(h)) return '영상 태그 미방출';
  const o = originIn(wrapStyle(h));
  return o && o.x === 10 && o.y === 60 ? true : JSON.stringify(o);
});
T('T20 영상 무초점 — origin 부재(사진과 같은 규칙)', () => {
  const h = P.sceneHTML(sceneOf(photo({ kind: 'video', video: true, src: 'data:video/mp4;base64,V' })));
  return /<video /.test(h) && !/transform-origin/.test(h) ? true : '영상 부재 규칙 위반';
});

console.log('--- ⑻ 회귀 ---');
T('T21 R90 kb 방출 — 결합식(시간값 2개·정위치 지연) 그대로', () => {
  const h = P.sceneHTML(sceneOf(photo({ focal: { x: 0.2, y: 0.9 }, anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } })));
  if (!/mkp-kb-zoom-in [\d.]+s linear [\d.]+s forwards/.test(h)) return 'kb 결합식 이탈: ' + h.slice(0, 400);
  if (/both [\d.]+s,/.test(h)) return 'R90 무효 모양 재발';
  return true;
});
T('T22 playAudit 전량 통과', () => { const a = P.playAudit(); return a.ok ? true : a.violations.join(', '); });
T('T23 videoAudit 전량 통과(R117 피벗 검사 포함)', () => { const a = V.videoAudit(); return a.ok ? true : a.violations.join(', '); });
T('T24 animPivot 공개 API — 순수·입력 무변형', () => {
  const el = { focal: { x: 0.2, y: 0.9 } };
  const before = JSON.stringify(el);
  V.animPivot(el, 0, 0, 10, 10); F.originOf(el);
  return JSON.stringify(el) === before ? true : '입력 변형';
});

console.log(`\nR117: ${pass}/${pass + fail} ${fail ? '— FAIL' : 'ALL PASS'}`);
process.exit(fail ? 1 : 0);
