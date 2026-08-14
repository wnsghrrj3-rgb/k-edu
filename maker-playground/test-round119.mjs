/* ============================================================
   test-round119.mjs — R119 회전 요소 초점 축 분리 (§1.139-① R94/R117 이월)
   ------------------------------------------------------------
   R117 originOf 는 회전 요소(el.rot)를 정직하게 제외했다 — CSS
   transform-origin 이 요소당 하나뿐이라 초점 축을 주면 정적 회전
   축까지 초점으로 끌려가 재생≠파일. R119 = 축 분리.
     · 재생(CSS) — 바깥 div rotate(θ)·origin 중앙 / 안쪽 div scale·
       origin 초점. 두 transform 이 물리적으로 갈려 서로 안 덮는다.
     · MP4(캔버스) — 스프라이트에 구워진 정적 회전 위에 애니 scale 을
       「초점을 θ만큼 중앙 회전시킨 점」 P=R(θ,C)·Fs 에서 얹는다.
   균등 scale·rotate 는 A_P·R(θ,C)=R(θ,C)·A_{R⁻¹P} 로 켤레되므로 두 세계
   net 이 동치 — 이 하니스는 그 동치를 순수 어파인 행렬로 직접 증명한다.

   계약:
     ⑴ focalRot — 게이트(무회전·가운데·0/360·비초점 null)·0.1% 격자·rot 동반
     ⑵ rotPivot — P=R(θ,C)·Fs 좌표 수학·무회전 null
     ⑶ 패리티(핵심) — CSS net R(θ,C)∘S(s,F) == 캔버스 net S(s,P)∘R(θ,C)
        (등장 scale·zoom·pop + 등장 rotate 델타까지 여러 각·초점·배율에서)
     ⑷ sceneHTML 방출 — 대상은 중첩 분리(바깥 rotate·origin 중앙 / 안쪽 origin 초점)
     ⑸ 제외 — pan/diagonal idle 은 종전 단일 div(중앙 폴백)·무회전은 R117 경로 불변
     ⑹ 회귀 — originOf 회전 제외 유지·focal/play/video audit 전량·R90 kb 방출
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R119_ROOT || path.resolve('.');
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

/* ---------- 순수 어파인 행렬 [a,b,c,d,e,f] : x'=ax+cy+e, y'=bx+dy+f (CSS matrix 순서) ---------- */
const I = [1, 0, 0, 1, 0, 0];
const mul = (M, N) => [                         /* M∘N : 점에 N 먼저, 그다음 M */
  M[0] * N[0] + M[2] * N[1],
  M[1] * N[0] + M[3] * N[1],
  M[0] * N[2] + M[2] * N[3],
  M[1] * N[2] + M[3] * N[3],
  M[0] * N[4] + M[2] * N[5] + M[4],
  M[1] * N[4] + M[3] * N[5] + M[5],
];
const trans = (x, y) => [1, 0, 0, 1, x, y];
const scal = (s) => [s, 0, 0, s, 0, 0];
const rot = (deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
const about = (M, ox, oy) => mul(mul(trans(ox, oy), M), trans(-ox, -oy)); /* 원점 (ox,oy) 기준 */
const rotAbout = (deg, ox, oy) => about(rot(deg), ox, oy);
const scaleAbout = (s, ox, oy) => about(scal(s), ox, oy);
const matEq = (A, B, tol = 1e-6) => A.every((x, i) => Math.abs(x - B[i]) <= tol);

/* ---------- 방출 파서 ---------- */
const sceneOf = (el) => ({ duration: 3, elements: [el] });
const outerStyle = (h) => { const m = h.match(/class="mkp-el mkp-img" style="([^"]*)"/); return m ? m[1] : null; };
const innerStyle = (h) => { const m = h.match(/class="mkp-inner" style="([^"]*)"/); return m ? m[1] : null; };
const photo = (extra) => Object.assign({ kind: 'image', src: 'data:image/png;base64,X', x: 10, y: 10, w: 60, h: 40 }, extra);

console.log('\n=== R119 회전 요소 초점 축 분리 ===\n');

/* ---------- ⑴ focalRot 게이트·격자 ---------- */
console.log('--- ⑴ focalRot — 게이트·격자·rot 동반 ---');
T('T1 무회전·비초점·초점만 → null', () =>
  (F.focalRot(null) === null && F.focalRot({ rot: 10 }) === null && F.focalRot({ focal: { x: 0.2, y: 0.3 } }) === null) || 'null 게이트 실패');
T('T2 rot 0/360 → null(무회전 경로 위임)', () =>
  (F.focalRot({ rot: 0, focal: { x: 0.2, y: 0.3 } }) === null && F.focalRot({ rot: 360, focal: { x: 0.2, y: 0.3 } }) === null) || '0/360 미차단');
T('T3 가운데 초점 → null(축 이동 없음)', () =>
  F.focalRot({ rot: 15, focal: { x: 0.5, y: 0.5 } }) === null || '가운데 미차단');
T('T4 0.1% 격자 + rot 동반 기록', () => {
  const r = F.focalRot({ rot: 90, focal: { x: 0.3335, y: 1 } });
  return (r && r.x === 0.334 && r.y === 1 && r.rot === 90) || JSON.stringify(r);
});

/* ---------- ⑵ rotPivot 좌표 수학 ---------- */
console.log('--- ⑵ rotPivot — P=R(θ,C)·Fs ---');
T('T5 90° : 초점(0.3,1)·틀(0,0,100,100) → (0,30)', () => {
  const p = F.rotPivot({ rot: 90, focal: { x: 0.3, y: 1 } }, 0, 0, 100, 100);
  return (p && Math.abs(p.px - 0) < 1e-6 && Math.abs(p.py - 30) < 1e-6) || JSON.stringify(p);
});
T('T6 무회전 → null(중앙 폴백은 호출부)', () =>
  F.rotPivot({ focal: { x: 0.2, y: 0.3 } }, 0, 0, 10, 10) === null || 'null 아님');
T('T7 rot=0 도 null(originOf 무회전 경로 소관)', () =>
  F.rotPivot({ rot: 0, focal: { x: 0.2, y: 0.3 } }, 0, 0, 10, 10) === null || 'null 아님');

/* ---------- ⑶ 패리티(핵심) — CSS net == 캔버스 net ---------- */
console.log('--- ⑶ 패리티 — CSS net R(θ,C)∘A_F == 캔버스 net A_P∘R(θ,C) ---');
/* 요소 틀(px) : x=10,y=10,w=60,h=40 → ex,ey,ew,eh */
const FR = { ex: 10, ey: 10, ew: 60, eh: 40 };
const C = { cx: FR.ex + FR.ew / 2, cy: FR.ey + FR.eh / 2 };
const Fs = (fx, fy) => ({ x: FR.ex + FR.ew * fx, y: FR.ey + FR.eh * fy });

const cssNetScale = (theta, s, fx, fy) => {          /* 바깥 rotate(중앙) ∘ 안쪽 scale(초점) */
  const f = Fs(fx, fy);
  return mul(rotAbout(theta, C.cx, C.cy), scaleAbout(s, f.x, f.y));
};
const canvasNetScale = (theta, s, fx, fy) => {        /* scale(피벗) ∘ 구워진 rotate(중앙) */
  const p = F.rotPivot({ rot: theta, focal: { x: fx, y: fy } }, FR.ex, FR.ey, FR.ew, FR.eh);
  return mul(scaleAbout(s, p.px, p.py), rotAbout(theta, C.cx, C.cy));
};
let scaleMiss = 0;
for (const theta of [5, 30, 90, -20, 175]) for (const s of [1.08, 0.82, 1.14, 0.6, 1]) for (const fxy of [[0.3, 1], [0.2, 0.9], [0.75, 0.15]]) {
  if (!matEq(cssNetScale(theta, s, fxy[0], fxy[1]), canvasNetScale(theta, s, fxy[0], fxy[1]))) scaleMiss++;
}
T('T8 등장/켄번즈 scale — 5각×5배율×3초점 = 75조합 net 동치', () => scaleMiss === 0 || (scaleMiss + '조합 어긋남'));

/* 등장 rotate 델타 ρ + 정적 회전 θ + 초점 — 켤레 성립 검증 */
const cssNetRotDelta = (theta, rho, s, fx, fy) => {
  const f = Fs(fx, fy);
  const innerA = about(mul(rot(rho), scal(s)), f.x, f.y);   /* 안쪽: rotate(ρ) scale(s) about 초점 */
  return mul(rotAbout(theta, C.cx, C.cy), innerA);
};
const canvasNetRotDelta = (theta, rho, s, fx, fy) => {
  const p = F.rotPivot({ rot: theta, focal: { x: fx, y: fy } }, FR.ex, FR.ey, FR.ew, FR.eh);
  const canvasA = about(mul(rot(rho), scal(s)), p.px, p.py); /* 캔버스: translate(P) rotate(ρ) scale(s) translate(-P) */
  return mul(canvasA, rotAbout(theta, C.cx, C.cy));
};
let rotMiss = 0;
for (const theta of [8, 45, -30]) for (const rho of [-7, -3.5, 0]) for (const s of [0.94, 1]) for (const fxy of [[0.3, 0.85], [0.6, 0.2]]) {
  if (!matEq(cssNetRotDelta(theta, rho, s, fxy[0], fxy[1]), canvasNetRotDelta(theta, rho, s, fxy[0], fxy[1]))) rotMiss++;
}
T('T9 등장 rotate 델타(ρ)+정적 회전(θ)+초점 — 켤레로 net 동치', () => rotMiss === 0 || (rotMiss + '조합 어긋남'));

/* 반례 — R117 종전(중앙 폴백)은 초점 줌에서 어긋난다(수사가 실제 문제를 짚는지) */
T('T10 반례: 회전 요소 중앙 피벗은 초점 net 과 불일치(옛 한계 재현)', () => {
  const oldCanvas = mul(scaleAbout(1.14, C.cx, C.cy), rotAbout(30, C.cx, C.cy)); /* 옛: 피벗=중앙 */
  return !matEq(oldCanvas, cssNetScale(30, 1.14, 0.3, 1)) || '중앙 피벗이 초점과 같아버림(무의미 검사)';
});

/* ---------- ⑷ sceneHTML 방출 — 중첩 분리 ---------- */
console.log('--- ⑷ sceneHTML — 대상은 중첩 분리 ---');
const hRotFocal = P.sceneHTML(sceneOf(photo({ rot: 12, focal: { x: 0.3, y: 0.85 }, anim: { preset: 'zoom', idle: 'kb-zoom-in', idleDur: 4 } })));
T('T11 바깥 div — rotate(12deg)·초점 origin 없음(중앙 기본축)·애니 없음', () => {
  const o = outerStyle(hRotFocal);
  return (o && /transform:rotate\(12deg\)/.test(o) && !/transform-origin/.test(o) && !/animation:/.test(o)) || o;
});
T('T12 안쪽 div — origin 초점 30% 85%·애니 실림·overflow 클립', () => {
  const inr = innerStyle(hRotFocal);
  return (inr && /transform-origin:30% 85%/.test(inr) && /animation:/.test(inr) && /overflow:hidden/.test(inr)) || inr;
});
T('T13 바깥엔 초점 origin 없음(회전 축은 중앙 유지 = R107)', () => {
  const o = outerStyle(hRotFocal);
  return (o && !/transform-origin:30%/.test(o)) || '바깥에 초점 침범';
});
T('T14 still 모드도 같은 중첩(축은 요소 속성)', () => {
  const hs = P.sceneHTML(sceneOf(photo({ rot: 12, focal: { x: 0.3, y: 0.85 } })), { still: true });
  const o = outerStyle(hs), inr = innerStyle(hs);
  return (o && /rotate\(12deg\)/.test(o) && inr && /transform-origin:30% 85%/.test(inr)) || 'still 분리 실패';
});

/* ---------- ⑸ 제외 — pan·무회전은 종전 경로 ---------- */
console.log('--- ⑸ 제외 — pan idle·무회전은 단일 div ---');
T('T15 pan idle 회전 요소 → 단일 div(중첩 없음·중앙 폴백)', () => {
  const h = P.sceneHTML(sceneOf(photo({ rot: 12, focal: { x: 0.3, y: 0.85 }, anim: { idle: 'kb-pan-left', idleDur: 4 } })));
  return innerStyle(h) === null || 'pan 인데 분리됨';
});
T('T16 diagonal idle 회전 요소 → 단일 div', () => {
  const h = P.sceneHTML(sceneOf(photo({ rot: 12, focal: { x: 0.3, y: 0.85 }, anim: { idle: 'kb-diagonal', idleDur: 4 } })));
  return innerStyle(h) === null || 'diagonal 인데 분리됨';
});
T('T17 무회전 초점 요소 → R117 경로(단일 div·origin 초점)', () => {
  const h = P.sceneHTML(sceneOf(photo({ focal: { x: 0.3, y: 0.85 }, anim: { preset: 'zoom' } })));
  const o = outerStyle(h);
  return (innerStyle(h) === null && o && /transform-origin:30% 85%/.test(o)) || '무회전 경로 변형됨';
});
T('T18 회전+가운데 초점 → 단일 div(초점 없음이므로 종전 바이트)', () => {
  const h = P.sceneHTML(sceneOf(photo({ rot: 12, focal: { x: 0.5, y: 0.5 }, anim: { preset: 'zoom' } })));
  const o = outerStyle(h);
  return (innerStyle(h) === null && o && !/transform-origin:/.test(o.replace(/transform-origin:50% 50%/, '')) ) || '가운데인데 분리됨';
});

/* ---------- ⑹ 회귀 ---------- */
console.log('--- ⑹ 회귀 — 종전 계약 불변 ---');
T('T19 originOf 회전 제외 유지(무회전 경로 불변)', () =>
  (F.originOf({ focal: { x: 0.3, y: 0.8 }, rot: 15 }) === null && F.originOf({ focal: { x: 0.3, y: 0.8 } }) !== null) || 'originOf 변형');
T('T20 animPivot 회전 요소 여전히 null(무회전 전용 유지)', () =>
  V.animPivot({ focal: { x: 0.2, y: 0.9 }, rot: 10 }, 0, 0, 10, 10) === null || 'animPivot 회전 침범');
T('T21 focal audit 전량 통과(R119 케이스 포함)', () => { const a = F.audit(); return a.ok || JSON.stringify(a.violations); });
T('T22 playAudit 전량 통과', () => { const a = P.playAudit(); return a.ok || JSON.stringify(a.violations || a); });
T('T23 videoAudit 전량 통과(R119 피벗 검사 포함)', () => { const a = V.videoAudit(); return a.ok || JSON.stringify(a.violations || a); });
T('T24 R90 kb 방출 — 결합식(시간값 2개·정위치 지연) 그대로', () => {
  const h = P.sceneHTML(sceneOf(photo({ anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } })));
  const o = outerStyle(h);
  return (o && /animation:mkp-fade[^;"]*,mkp-kb-zoom-in/.test(o)) || o;
});

console.log(`\nR119: ${pass}/${pass + fail} ${fail ? 'FAIL ✗' : 'ALL PASS'}\n`);
process.exit(fail ? 1 : 0);
