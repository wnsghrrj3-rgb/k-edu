// 준비: kmotion/wizard 에서 `npm i --no-save jsdom@24` 한 번 → node tests/contract/smoke-proto.mjs
// proto 스킨 실제 코드 스모크 — jsdom + 가짜 렌더러(WebGL 없음) + 진짜 Three 장면 그래프 + 진짜 sim 한 판(키보드 봇)
import { JSDOM } from 'jsdom';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
const KE = new URL('../../../../', import.meta.url).pathname, WZ = KE + 'kmotion/wizard/', TMP = tmpdir() + '/mw-proto-smoke/';
const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', { url: 'https://keduclass.com/kmotion/wizard/', pretendToBeVisual: true });
const w = dom.window; for (const k of ['window', 'document', 'HTMLElement', 'MouseEvent', 'getComputedStyle', 'localStorage', 'navigator']) { try { globalThis[k] = k === 'window' ? w : w[k]; } catch (_) { Object.defineProperty(globalThis, k, { value: w[k], configurable: true }); } }
globalThis.innerWidth = 1280; globalThis.innerHeight = 720; globalThis.devicePixelRatio = 1; globalThis.self = globalThis;
globalThis.requestAnimationFrame = f => setTimeout(() => f(performance.now()), 0); globalThis.addEventListener = () => {};
const PROPS = new Set(['fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'font', 'textAlign', 'textBaseline', 'globalAlpha', 'canvas']);
const ctx2d = new Proxy({}, { get: (o, k) => PROPS.has(k) ? o[k] : k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop(){} }) : k === 'measureText' ? () => ({ width: 10 }) : () => {}, set: (o, k, v) => { o[k] = v; return true; } });
w.HTMLCanvasElement.prototype.getContext = () => ctx2d;
// 가짜 렌더러
globalThis.FakeRenderer = class { constructor(){ this.domElement = w.document.createElement('canvas'); this.shadowMap = {}; this.info = { render: { calls: 0, triangles: 0 }, memory: { textures: 0 } }; this.n = 0; }
  setPixelRatio(){} setSize(){} dispose(){} render(scene, cam){ this.n++; let c = 0; scene.traverse(o => { if (o.visible && (o.isMesh || o.isPoints || o.isSprite)) c++; if (o.isMesh && o.geometry && !o.geometry.attributes.position) throw new Error('빈 지오메트리'); }); this.info.render.calls = c; cam.updateMatrixWorld(); } };
const THREE_URL = 'file://' + KE + 'labs/vendor/three185/three.module.min.js';
mkdirSync(TMP, { recursive: true });
for (const f of readdirSync(WZ + 'skins/proto')) { let s = readFileSync(WZ + 'skins/proto/' + f, 'utf8'); if (f.endsWith('.js')) s = s.replace(/from 'three'/g, `from '${THREE_URL}'`).replace('new THREE.WebGLRenderer(', 'new globalThis.FakeRenderer('); writeFileSync(TMP + f, s); }
const { createSkin } = await import('file://' + TMP + 'index.js');
const { createFlow } = await import(WZ + 'sim/flow/screens.js');
const { checkInterface, checkTelegraphs, checkTargets } = await import(WZ + 'contract/validate.js');
const J = p => JSON.parse(readFileSync(WZ + p, 'utf8'));
const data = { spells: J('data/spells.json'), enemies: J('data/enemies.json'), anim: J('data/anim-timing.json'), layout: J('data/layout/targets.json'), text: J('data/text/ko.json'), camera: J('contract/camera.json'), stages: { 'forest-1-1': J('data/stages/forest-1-1.json'), 'forest-1-2': J('data/stages/forest-1-2.json') } };
const text = (k, a) => { const s = data.text[k] ?? k; return a ? s.replace(/\{(\w+)\}/g, (_, x) => a[x] ?? '') : s; };
const root = w.document.getElementById('root');
const skin = createSkin({ root, quality: 'medium', text, assetBase: '', dev: true, camera: data.camera, layout: data.layout, anim: data.anim });
console.log('인터페이스', checkInterface(skin)); await skin.load(() => {}); skin.mount();
const errs = []; const S = fn => { try { fn(); } catch (e) { errs.push(e.stack.split('\n').slice(0, 3).join(' | ')); } };
for (const mode of ['keyboard', 'camera-menu']) {}
// v1.6: 시드 21·44 는 1-2 「버섯 마을 길」 — 21 은 1-1 깬 기록으로 시작 화면 스테이지 단추를 눌러 들어감(잠김 해제 경로), 44 는 ?stage= 강제
const runs = []; for (const seed of [7, 31, 99, 5, 13, 21, 44]) { const passive = seed === 5, all = seed === 13, s12 = seed === 21 || seed === 44;
  const flow = createFlow({ data, grade: 1, seed, unlock: all ? 'all' : null, stage: seed === 44 ? 'forest-1-2' : null, forceStage: seed === 44, progress: seed === 21 ? { xp: 0, level: 1, cleared: { 'forest-1-1': 2 }, unlocked: ['shield'] } : null }); const castSeen = new Set(); let cur = null, lastToast = null, acts = [];
  skin.ui.bind({ action: (id, p) => { acts.push(id); flow.action(id, p); } });
  const frame = () => { flow.step(1 / 60); if (flow.game) flow.game.aspect = 16 / 9; for (const ev of flow.drainEvents()) { if (ev.type === 'spell:cast' || ev.type === 'shield:on') castSeen.add(ev.spell || 'shield'); if (ev.type === 'obstacle:hit') railStat.hits++; if (ev.type === 'pickup' && ev.kind === 'firefly') railStat.fly++; if (ev.type === 'bounce') railStat.bounce = (railStat.bounce || 0) + 1; if (ev.type === 'enemy:shieldBreak') railStat.shield = (railStat.shield || 0) + 1; S(() => skin.onEvent(ev)); } const snap = flow.snapshot();
    if (snap.screen !== cur) { const p = cur; cur = snap.screen; S(() => { if (p) skin.ui.hide(p); skin.ui.show(cur, snap); }); }
    S(() => skin.ui.update(cur, snap)); if (snap.toast && snap.toast !== lastToast) S(() => skin.ui.toast(snap.toast)); lastToast = snap.toast; S(() => skin.render(snap, 0)); return snap; };
  for (let i = 0; i < 30; i++) frame();                                  // S01 메뉴
  // 보정 화면 거쳐 보기(카메라 모드, 몸 없음 → 단계 건너뛰기 4번)
  root.querySelectorAll('.modes button')[0].click(); root.querySelector('.go').click(); let calSeen = ''; for (let i = 0; i < 20; i++) { flow.pose(null, flow.t * 1000, 640, 480); calSeen = frame().screen + ':' + root.querySelector('.mw-calib .msg').textContent; } console.log('보정 화면', calSeen);
  for (let k = 0; k < 4; k++) { root.querySelector('.skip') && root.querySelector('.skip').click(); for (let i = 0; i < 5; i++) { flow.pose(null, flow.t * 1000, 640, 480); frame(); } }
  console.log('보정 건너뛴 뒤', flow.snapshot().screen); flow.action('home'); for (let i = 0; i < 5; i++) frame();
  if (seed === 21) { const sb = root.querySelectorAll('.mw-stage'); if (sb.length !== 2 || sb[1].disabled || !sb[0].textContent.includes('⭐⭐☆')) errs.push('스테이지 단추 ' + sb.length + ' ' + [...sb].map(b => b.textContent + (b.disabled ? '(잠김)' : '')).join('/')); sb[1].click(); }
  if (seed === 7) { const sb = root.querySelectorAll('.mw-stage'); if (sb.length !== 2 || !sb[1].disabled) errs.push('1-2 잠김 단추 아님'); }
  root.querySelectorAll('.modes button')[1].click(); root.querySelector('.go').click();   // 키보드
  if (s12 && flow.game && flow.game.stageId !== 'forest-1-2') errs.push('1-2 로 시작 안 됨: ' + flow.game.stageId);
  let hurt = 0; let tick = 0, tgBad = 0, tgN = 0, qN = 0, rectBad = 0, screens = new Set(), maxEnemies = 0, pzN = 0, pzRectBad = 0, railStat = { stones: 0, hits: 0, fly: 0 }; const press = (c, d) => flow.key(c, d, flow.t * 1000);
  let bossMax = -1, bossTg = 0; while (tick++ < 60 * 600) { const s = frame(); screens.add(s.screen);
    if (s.boss) { bossMax = Math.max(bossMax, s.boss.phase + (s.boss.state === 'dead' ? 1 : 0)); if (s.boss.telegraphs.length) bossTg++; if (s.boss.telegraphs.some(t => t.avoid === 'duck')) press('ArrowDown', true); else press('ArrowDown', false); }
    if (s.enemies) { maxEnemies = Math.max(maxEnemies, s.enemies.length); const st = skin.stats(); const a = checkTelegraphs(s, st.telegraphs); if (s.enemies.some(e => e.telegraph) || (s.boss && s.boss.telegraphs.length)) tgN++; if (!a.ok) tgBad++; }
    if (s.screen === 'S08Q' && s.question && s.question.state === 'open' && s.question.readP >= 1) { const st = skin.stats(); if (!checkTargets(s, st.targetRects).ok) rectBad++;
      if (tick % 20 === 0) { qN++; const slot = !passive && (qN % 2 || s.question.kind === 'seal') ? flow.game.q.v.correctSlot : (flow.game.q.v.correctSlot + 1) % 3; root.querySelectorAll('.mw-q .mw-orb:not(.mw-owl)')[slot].click(); } }
    // v1.5 S08P — 돌 구슬이 targets rect 자리에 있는지 + 봇이 돌을 집음(정답 2개 중 하나씩, passive 는 틀린 돌만 → reveal 경로)
    if (s.screen === 'S08P' && s.puzzle && s.puzzle.state === 'open') { const st = skin.stats(); if (!checkTargets(s, st.targetRects).ok) pzRectBad++; const Z = s.puzzle;
      if (Z.stones && tick % 25 === 0) { const want = Z.type === 'number-bridge' ? Z.stones.filter(x => !x.lit && (passive ? !(x.num + (Z.picks[0] || 0) === Z.target && Z.picks.length) && x.num !== Z.target - (Z.stones.find(y => y.lit) || { num: -99 }).num : true)) : Z.stones.filter(x => !x.lit);
        const pick = passive ? want[want.length - 1] : (Z.type === 'mushroom-add' ? Z.stones.find(y => y.num === Z.target) : Z.type === 'number-bridge' ? (() => { const lit = Z.stones.find(y => y.lit); if (lit) return Z.stones.find(y => !y.lit && y.num + lit.num === Z.target); for (const a of Z.stones) for (const b of Z.stones) if (a !== b && a.num + b.num === Z.target) return a; return Z.stones[0]; })() : (Z.seq ? Z.stones.find(y => y.num === Z.seq.at(-1) + (Z.seq[1] - Z.seq[0])) : Z.stones[0]));
        if (pick) { const el = root.querySelectorAll('.mw-pz .mw-orb:not(.mw-hide)')[pick.slot]; if (el) { el.click(); pzN++; railStat.stones++; } } }
      if (Z.gate) { const ans = flow.game.puzzle.cur.answer; press('ArrowLeft', ans === 'L'); press('ArrowRight', ans === 'R'); if (!root.querySelector('.mw-gate.mw-hide') && root.querySelector('.mw-gate .door.' + ans)) railStat.gate = (railStat.gate || 0) + 1; } }
    if (s.screen === 'S08' && !s.paused && s.world && s.world.rail && s.world.rail.phase === 'go') { const P = s.player, near = (s.obstacles || []).filter(o => o.state === 'ahead' && o.pos[2] > 0 && o.pos[2] < 9).sort((a, b) => a.pos[2] - b.pos[2]), o = near[0];
      let want = null, duck = false; if (o && o.kind === 'rock' && Math.abs(o.pos[0] - P.pos[0]) < o.r + .7) want = o.pos[0] > 0 ? 'ArrowLeft' : 'ArrowRight'; if (o && o.kind === 'branch' && o.pos[2] < 5) duck = true;
      const fly = (s.obstacles || []).find(x => (x.kind === 'firefly' || x.kind === 'mushroom') && x.state === 'ahead' && x.pos[2] > 1 && x.pos[2] < 12); if (!want && fly && Math.abs(fly.pos[0] - P.pos[0]) > .3 && !(o && o.kind === 'rock' && o.pos[2] < 6)) want = fly.pos[0] > P.pos[0] ? 'ArrowRight' : 'ArrowLeft';
      press('ArrowLeft', want === 'ArrowLeft'); press('ArrowRight', want === 'ArrowRight'); press('ArrowDown', duck); press('KeyL', false); }
    if (all && s.screen === 'S08' && !s.paused && tick % 500 === 250) { root.querySelector('.mw-top-r .pause').click(); frame(); const bs = root.querySelectorAll('.mw-ui .spells button'); if (bs.length) bs[(tick / 500 | 0) % bs.length].click(); frame(); root.querySelector('.mw-ui .resume').click(); }
    if (all && s.screen === 'S08') { flow.game.player.mana = Math.max(flow.game.player.mana, 55); if (tick % 900 === 450) flow.game.player.mana = 100; }
    if (s.screen === 'S08' && !s.paused && !(s.world && s.world.rail)) { const P = s.player, e = s.enemies.find(x => x.state !== 'dead');
      if (!passive && tick > 900 && tick % 30 === 0) { press('Space', true); press('Space', false); }
      if (e) { const want = e.pos[0] > P.pos[0] + .3 ? 'ArrowRight' : e.pos[0] < P.pos[0] - .3 ? 'ArrowLeft' : null; press('ArrowLeft', want === 'ArrowLeft'); press('ArrowRight', want === 'ArrowRight'); if (e.telegraph && tick % 30 === 0) { press('KeyL', true); } else press('KeyL', false); }
      const c = s.crystals.find(c => c.near); if (c && tick % 20 === 0 && (!passive || qN < 3)) { press('Space', true); press('Space', false); }
      if (P.mana >= 20 && tick % (all ? 120 : 200) === 0) press('KeyK', true); if (tick % (all ? 120 : 200) === (all ? 100 : 50)) press('KeyK', false); if (all && tick % 700 === 600) press('KeyL', true); if (all && tick % 700 === 690) press('KeyL', false); }
    if (s.screen === 'S13' || s.screen === 'S14') { for (let i = 0; i < 30; i++) frame(); break; } }
  const snap = flow.snapshot(); runs.push({ seed, stage: flow.game && flow.game.stageId, casts: [...castSeen].join(','), bossMax, bossTg, bossUI: root.querySelector('.mw-boss .nm') ? root.querySelector('.mw-boss .nm').textContent : '', end: snap.screen, ticks: tick, screens: [...screens].join(','), tg: `${tgN}프레임 중 누락 ${tgBad}`, rectBad, qClicks: qN, pzClicks: pzN, pzRectBad, rail: JSON.stringify(railStat), railUI: root.querySelector('.mw-rail') ? root.querySelector('.mw-rail').textContent : '', maxEnemies, result: JSON.stringify(snap.result), resultUI: root.querySelector('.mw-result') ? root.querySelector('.mw-result').textContent.slice(0, 60) : '' });
  root.querySelector('.again') && root.querySelector('.again').click(); for (let i = 0; i < 30; i++) frame(); flow.action('home'); for (let i = 0; i < 5; i++) frame();
}
// 마우스(카메라) 모드 멈춤 — 손 유지 마법 바퀴 구슬이 targets 자리에 그려지는지(v1.3)
{ const flow = createFlow({ data, grade: 1, seed: 77, unlock: 'all' }); let cur = null; skin.ui.bind({ action: (id, p) => flow.action(id, p) });
  const frame = () => { flow.step(1 / 60); if (flow.game) flow.game.aspect = 16 / 9; for (const ev of flow.drainEvents()) S(() => skin.onEvent(ev)); const snap = flow.snapshot();
    if (snap.screen !== cur) { const p = cur; cur = snap.screen; S(() => { if (p) skin.ui.hide(p); skin.ui.show(cur, snap); }); } S(() => skin.ui.update(cur, snap)); S(() => skin.render(snap, 0)); return snap; };
  for (let i = 0; i < 5; i++) frame(); flow.action('start', { mode: 'mouse' }); for (let i = 0; i < 60; i++) frame(); flow.game.input.push({ type: 'PAUSE', t: 0, via: 'key', value: {} }); let s; for (let i = 0; i < 5; i++) s = frame();
  const r = checkTargets(s, skin.stats().targetRects); const orbs = root.querySelectorAll('.mw-wheel .mw-orb:not(.mw-hide)').length;
  console.log('멈춤 바퀴', s.paused, '대상', s.targets.map(t => t.id).join(','), '그림', r.ok ? '✓' : '✗ ' + r.bad, '구슬', orbs); if (!r.ok || orbs !== s.targets.length) errs.push('멈춤 바퀴 대상 어긋남');
  root.querySelector('.mw-wheel .mw-orb').click(); for (let i = 0; i < 3; i++) s = frame(); flow.action('resume'); for (let i = 0; i < 3; i++) s = frame(); console.log('바퀴 클릭 뒤 주 마법', s.player.main, '· 다시 뒤 대상', s.targets.length); flow.action('home'); for (let i = 0; i < 3; i++) frame(); }
console.log(runs); console.log('stats', skin.stats().drawCalls, '그린 횟수 OK'); console.log(errs.length ? '오류 ' + errs.length + '\n' + [...new Set(errs)].slice(0, 8).join('\n') : '오류 0'); skin.dispose(); process.exit(0);
