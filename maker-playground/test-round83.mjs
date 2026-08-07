/* ============================================================
   test-round83.mjs — R83 카드는 담을 수 없는 수를 약속하지 않는다
   ------------------------------------------------------------
   문제→해결(cx-problem) 카드가 「사진·영상 0~8장」을 약속했지만
   실제 미디어 자리는 문제·해결 각 1, 총 2가 전부였다 — 빌드 시점의
   「자리가 없어요」 정직 안내가 있어도, 고르는 순간의 카드가 먼저
   거짓말을 하면 학생은 8장을 고르고 나서야 배신을 안다.

   여기서 못 박는 계약:
     ① 실수용량은 선언이 아니라 씬 구조에서 센다 — pairMode·
        repeatable(슬롯 보유 또는 usePlan) = 상한 없음, 그 외 = 슬롯 합.
     ② cx-problem 의 실수용량은 2 다 (문제 1 + 해결 1).
     ③ 선언(recommendedMediaCount)이 실수용량을 넘으면 감사가 잡는다 —
        max 도 ideal 도. 이 재발 차단망은 등록된 모든 구성에 걸린다.
     ④ 등록 전 구성이 지금 그 감사를 통과한다 (거짓말 0).
     ⑤ 카드 문구가 진실을 렌더한다: 「사진·영상 0~2장 (딱 좋아요: 2장)」.
     ⑥ 초과분의 빌드 시점 정직 안내는 그대로 산다 — 3장이면
        unusedMedia 1 + 「초과」 노트.
     ⑦ 종전 사용법 무손상 — 2장·0장 빌드는 R51 계약 그대로 성공.
   ============================================================ */
import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div><div id="pgBody"></div></body></html>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', virtualConsole: vc });
const { window } = dom;
Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
window.alert = () => {}; window.confirm = () => true;
window.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0);
const store = {};
Object.defineProperty(window, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => { for (const k in store) delete store[k]; },
  key: (i) => Object.keys(store)[i] || null, get length() { return Object.keys(store).length; } } });

const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
for (const u of [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((x) => !/^https?:/.test(x))) {
  const f = __res(u.split('?')[0]);
  if (!f) continue;
  try { window.eval(fs.readFileSync(f, 'utf8')); } catch (e) { /* 부트 부작용 무시 */ }
}

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const C = window.MK_COMPOSE;
const H = window.MK_VIDHUB;
const mk = (n) => Array.from({ length: n }, (_, i) =>
  ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: i % 2 ? 800 : 600, h: i % 2 ? 600 : 800 }));

console.log('== ① 실수용량은 씬 구조에서 센다 ==');
T('mediaCapacity 가 공개돼 있다', () => typeof C.mediaCapacity === 'function' || 'missing');
T('pairMode = 상한 없음 (cx-beforeafter)', () => C.mediaCapacity('cx-beforeafter') === Infinity || String(C.mediaCapacity('cx-beforeafter')));
T('repeatable 미디어 씬 = 상한 없음 (cx-slideshow)', () => C.mediaCapacity('cx-slideshow') === Infinity || String(C.mediaCapacity('cx-slideshow')));
T('repeatable items 씬(슬롯 보유) = 상한 없음 (cx-review)', () => C.mediaCapacity('cx-review') === Infinity || String(C.mediaCapacity('cx-review')));
T('usePlan repeatable(합성 comp) = 상한 없음', () =>
  C.mediaCapacity({ scenes: [{ id: 'a', repeatable: true, usePlan: true }] }) === Infinity || 'usePlan not honored');
T('고정 구조(합성 comp) = 슬롯 합', () =>
  C.mediaCapacity({ scenes: [{ id: 'a', mediaSlots: [{}, {}] }, { id: 'b', mediaSlots: [{}] }, { id: 'c' }] }) === 3 || 'sum wrong');
T('없는 id = 0', () => C.mediaCapacity('cx-없음') === 0 || 'not 0');

console.log('== ② cx-problem 의 실수용량 = 2 ==');
T('실수용량 2 (문제 1 + 해결 1)', () => C.mediaCapacity('cx-problem') === 2 || String(C.mediaCapacity('cx-problem')));

console.log('== ③④ 감사 재발 차단망 ==');
T('과대 선언은 감사가 잡는다 (심어서 확인)', () => {
  const bad = C.registerComposition({ id: 'zz-r83-bad', name: 'x', category: 'x', hidden: true,
    recommendedMediaCount: { min: 0, max: 9, ideal: 5 },
    recommendedDuration: { min: 5, max: 10, default: 5 },
    scenes: [{ id: 's1', role: 'intro', name: 'i', required: true,
      duration: { default: 2, min: 1, max: 3, mode: 'fixed' },
      mediaSlots: [{ id: 'm1', frame: { x: 0, y: 0, w: 100, h: 100 } }],
      textSlots: [{ id: 't1', role: 'headline', defaultText: 'x', maxCh: 8, maxLines: 1, frame: { x: 8, y: 40, w: 84 } }] }] });
  if (!bad) return 'register failed';
  const a = C.audit();
  C.unregisterComposition('zz-r83-bad');
  const hitMax = a.violations.some((v) => /^zz-r83-bad:declared-over-capacity:9>1$/.test(v));
  const hitIdeal = a.violations.some((v) => /^zz-r83-bad:ideal-over-capacity:5>1$/.test(v));
  return (hitMax && hitIdeal) || 'not caught: ' + a.violations.filter((v) => v.startsWith('zz')).join(',');
});
T('등록 전 구성에 수용량 거짓말 0 (감사 청정)', () => {
  const a = C.audit();
  const cap = a.violations.filter((v) => /over-capacity/.test(v));
  return cap.length === 0 || cap.join(' | ');
});
T('감사 전체도 통과 (기존 항목 무손상)', () => { const a = C.audit(); return a.ok || a.violations.join(' | '); });

console.log('== ⑤ 카드 문구가 진실을 렌더한다 ==');
T('선언 고정 {0,2,2}', () => {
  const e = C.listCompositions().find((c) => c.id === 'cx-problem');
  const m = e && e.recommendedMediaCount;
  return (m && m.min === 0 && m.max === 2 && m.ideal === 2) || JSON.stringify(m);
});
T('카드 문구 = 「사진·영상 0~2장 (딱 좋아요: 2장)」', () => {
  const e = C.listCompositions().find((c) => c.id === 'cx-problem');
  const t = H.mediaText(e);
  return t === '사진·영상 0~2장 (딱 좋아요: 2장)' || t;
});
T('허브 렌더의 cx-problem 카드에 0~8장 잔존 0 · 0~2장 표기', () => {
  const scr = window.MK_SCREENS && window.MK_SCREENS.video;
  if (!scr || !scr.render) return 'no screen';
  const out = scr.render();
  const i = out.indexOf('data-vh-comp="cx-problem"');
  if (i < 0) return 'no card';
  const block = out.slice(i, out.indexOf('</button>', i));
  return (!/0~8장/.test(block) && /0~2장/.test(block)) || 'stale copy in card';
});

console.log('== ⑥ 초과분의 빌드 시점 정직 안내 생존 ==');
T('3장 → unusedMedia 1 + 「초과」 노트', () => {
  const r = C.buildProject('cx-problem', 'th-bold', { medias: mk(3), texts: { problem: 'P', solution: 'S' } });
  if (!r.ok) return 'build fail ' + r.why;
  return (r.unusedMedia === 1 && (r.notes || []).some((n) => /초과/.test(n))) ||
    'unused=' + r.unusedMedia + ' notes=' + JSON.stringify(r.notes);
});

console.log('== ⑦ 종전 사용법 무손상 (R51 계약) ==');
T('2장 빌드 성공 · 버림 0', () => {
  const r = C.buildProject('cx-problem', 'th-bold', { medias: mk(2),
    texts: { hook: '숙제 관리 힘들죠', problem: '알림장을 놓쳐요', solution: '자동 알림으로 해결', metric: '98%', metricDesc: '전달률', cta: '지금 시작' } });
  return (r.ok && r.unusedMedia === 0) || (r.why || 'unused=' + r.unusedMedia);
});
T('0장 빌드 성공 (needsMedia:false)', () => {
  const r = C.buildProject('cx-problem', 'th-bold', { medias: [], texts: { problem: 'P', solution: 'S' } });
  return r.ok || r.why;
});

console.log('');
console.log('test-round83: ' + pass + '/' + (pass + fail) + (fail ? '  FAIL' : '  ALL PASS'));
process.exit(fail ? 1 : 0);
