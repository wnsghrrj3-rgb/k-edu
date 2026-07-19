/* 케이파크 · 마블런 — tests/ui.smoke.js
 * jsdom UI 스모크 (M2b 분기·합류 + M3 마블캠·슬로모). 실행: jsdom 설치된 위치에서 node ui.smoke.js
 * (jsdom은 임시 설치·제거 관례 — package.json 공용 파일 불변 유지) */
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..');

const dom = new JSDOM('<!DOCTYPE html><body><div id="ui"></div></body>', { runScripts: 'outside-only' });
global.window = dom.window;
global.document = dom.window.document;

// 코어 로드 (window에 부착)
for (const f of ['core/hexgrid.js','core/parts/basic.js','core/parts/action.js','core/parts/ballistic.js','core/parts/switchpart.js','core/parts/splitter.js','core/parts/mergepart.js','core/graph.js','core/sim.js','core/serialize.js','core/tracks.js','core/builder.js','core/multisim.js']) {
  const code = fs.readFileSync(path.join(BASE, f), 'utf8');
  dom.window.eval(code);
}
const NS = dom.window.MarbleSim;
let pass = 0, fail = 0;
function T(name, fn) { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } }
function assert(c, m) { if (!c) throw new Error(m || 'assert'); }

// ui.js는 ESM — CJS 변환해 평가
let uiCode = fs.readFileSync(path.join(BASE, 'stage/ui.js'), 'utf8').replace('export function createUI', 'window.__createUI = function createUI');
dom.window.eval(uiCode);
const createUI = dom.window.__createUI;

T('UI 생성: 스위치 버튼·갈래 버튼·구슬 수 세그먼트 존재', () => {
  const calls = [];
  const h = new Proxy({}, { get: (_, k) => (...a) => { calls.push([k, a]); return 'orbit'; } });
  const ui = createUI(document.getElementById('ui'), h, NS.TRACKS);
  assert(document.querySelector('[data-part="switch"]'), '스위치 팔레트 버튼 없음');
  assert(document.querySelector('#mr-branch'), '갈래 버튼 없음');
  assert(document.querySelectorAll('#mr-count button').length === 3, '구슬 수 버튼');
  assert(typeof ui.setMarbleCount === 'function', 'setMarbleCount 누락');
});

T('건설 흐름: 스위치 배치 → 갈래 버튼 노출 + 왼길 활성', () => {
  const state = { startH: 3, seq: [] };
  let comp = NS.compile(state, []);
  // 경사 → 스위치
  state.seq.push('slope');
  comp = NS.compile(state, []);
  assert(NS.canPlace(comp, 'switch'), '스위치 배치 가능해야 함');
  state.seq.push({ type: 'switch', left: [], right: [] });
  comp = NS.compile(state, [0]);
  assert(comp.routes.length === 2, '갈래 2개');
  assert(comp.activeRoute === 0, '왼길 활성');
  const ui = createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  ui.setBuildState(comp, NS.canPlace);
  assert(!document.querySelector('#mr-branch').classList.contains('hidden'), '갈래 버튼 노출');
});

T('양 갈래 골 종결 → ended + 완성 힌트', () => {
  const state = { startH: 3, seq: ['slope',
    { type: 'switch', left: ['curve_l','goal'], right: ['curve_r','goal'] }] };
  const comp = NS.compile(state, []);
  assert(comp.ok && comp.ended, JSON.stringify(comp.errors));
  const ui = createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  ui.setBuildState(comp, NS.canPlace);
  const hint = document.getElementById('mr-hint');
  assert(!hint.classList.contains('hidden') && /완성/.test(hint.textContent), '완성 힌트: ' + hint.textContent);
});

T('결과 카드: 다중 구슬 표시', () => {
  const ui = createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  ui.showResult({ marbles: [
    { emoji: '🔵', bell: '🔔A', time: 3.21 },
    { emoji: '🩷', bell: '🔔B', time: 3.87 },
  ], vMax: 1.9 });
  const body = document.querySelector('#mr-result .result-body').innerHTML;
  assert(/🔔A/.test(body) && /🔔B/.test(body) && /3.21/.test(body), body);
});

T('프리셋 셀렉터에 갈림길 광장·세 갈래 종탑·신호기 관제탑·날아라 언덕 포함', () => {
  createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  const html = document.getElementById('mr-track').innerHTML;
  assert(/갈림길 광장/.test(html) && /세 갈래 종탑/.test(html), '프리셋 누락');
  assert(/신호기 관제탑/.test(html) && /날아라 언덕/.test(html), 'M2b-3 프리셋 누락');
});

T('신호기 버튼 존재 + 배치 시 갈래 트리 생성', () => {
  createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  const btn = document.querySelector('#mr-palette button[data-part="splitter"]');
  assert(btn, '신호기 버튼 없음');
  const c = NS.compile({ startH: 3, seq: ['slope',
    { type: 'splitter', left: ['goal'], right: ['goal'] }] });
  assert(c.ok && c.routes.length === 2 && c.ended, '신호기 트리 컴파일 실패');
});


T('🤝 합류 버튼: 마주 본 갈래에서 노출 + 힌트, 평소엔 숨김', () => {
  const ui = createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  const btn = document.querySelector('#mr-merge');
  assert(btn, '합류 버튼 없음');
  const stFar = { startH: 3, seq: ['slope', { type: 'switch', left: ['curve_r'], right: ['curve_l'] }] };
  ui.setBuildState(NS.compile(stFar, [0]), NS.canPlace, NS.canMerge(stFar));
  assert(btn.classList.contains('hidden'), '엇갈린 갈래인데 합류 버튼 노출');
  const stMeet = { startH: 3, seq: ['slope', { type: 'switch',
    left: ['curve_r', 'slope', 'curve_r'], right: ['curve_l', 'slope', 'curve_l'] }] };
  ui.setBuildState(NS.compile(stMeet, [0]), NS.canPlace, NS.canMerge(stMeet));
  assert(!btn.classList.contains('hidden'), '마주 본 갈래인데 합류 버튼 숨김');
  const hint = document.getElementById('mr-hint');
  assert(/합류|합쳐/.test(hint.textContent), '합류 힌트 없음: ' + hint.textContent);
});

T('🤝 합류 후 상태: 공유 꼬리에 이어 짓기 + 다시 만나는 길 프리셋 포함', () => {
  createUI(document.getElementById('ui'), new Proxy({}, { get: () => () => {} }), NS.TRACKS);
  assert(/다시 만나는 길/.test(document.getElementById('mr-track').innerHTML), '프리셋 누락');
  const st = { startH: 3, seq: ['slope', { type: 'switch',
    left: ['curve_r', 'slope', 'curve_r'], right: ['curve_l', 'slope', 'curve_l'] }] };
  const t = NS.tryMerge(st);
  assert(t.ok, 'tryMerge 실패');
  let comp = NS.compile(st, [0]);
  assert(comp.ok && comp.routes.length === 2, '합류 후 잎 수');
  // 활성 잎의 seqRef = 공유 꼬리 → 부품 하나 놓으면 두 잎 모두에 반영
  const route = comp.routes[comp.activeRoute];
  assert(route.seqRef === st.seq[1].tail, '활성 seqRef가 꼬리가 아님');
  route.seqRef.push('slope', 'goal');
  comp = NS.compile(st, [0]);
  assert(comp.ok && comp.ended && comp.routes.every(rt => rt.ended), '꼬리 이어 짓기 실패');
  assert(NS.unMerge(st.seq[1]) === false, '꼬리가 찼는데 unMerge 허용됨');
});


// ── M3 연출층 ──
T('M3: 슬로모 버튼 존재 + 토글 시 on 클래스', () => {
  let slomoOn = false;
  const h = new Proxy({}, { get: (_, k) => {
    if (k === 'onSlomo') return () => { slomoOn = !slomoOn; return slomoOn; };
    return () => 'orbit';
  } });
  const ui = createUI(document.getElementById('ui'), h, NS.TRACKS);
  const btn = document.querySelector('#mr-slomo');
  assert(btn, '슬로모 버튼 없음');
  btn.dispatchEvent(new dom.window.Event('click'));
  assert(btn.classList.contains('on'), '켜짐 표시 없음');
  btn.dispatchEvent(new dom.window.Event('click'));
  assert(!btn.classList.contains('on'), '꺼짐 표시 실패');
  ui.setSlomo(true);
  assert(btn.classList.contains('on'), 'setSlomo(true) 실패');
  ui.setSlomo(false);
  assert(!btn.classList.contains('on'), 'setSlomo(false) 실패');
});

T('M3: 카메라 버튼 3모드 순환 라벨 (전경→추적→마블캠)', () => {
  const modes = ['follow', 'marble', 'orbit'];   // 클릭마다 핸들러가 반환할 다음 모드
  let i = 0;
  const h = new Proxy({}, { get: (_, k) => {
    if (k === 'onToggleCamera') return () => modes[i++ % modes.length];
    if (k === 'onSlomo') return () => false;
    return () => {};
  } });
  const ui = createUI(document.getElementById('ui'), h, NS.TRACKS);
  const btn = document.querySelector('#mr-cam');
  assert(btn.textContent.includes('전경'), '초기 라벨');
  btn.dispatchEvent(new dom.window.Event('click'));
  assert(btn.textContent.includes('추적'), '추적 라벨');
  btn.dispatchEvent(new dom.window.Event('click'));
  assert(btn.textContent.includes('마블캠'), '마블캠 라벨');
  btn.dispatchEvent(new dom.window.Event('click'));
  assert(btn.textContent.includes('전경'), '전경 복귀 라벨');
  ui.setCamLabel('orbit');
  assert(btn.textContent.includes('전경'), 'setCamLabel 실패');
});

console.log('\nUI 스모크: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail === 0 ? 0 : 1);
