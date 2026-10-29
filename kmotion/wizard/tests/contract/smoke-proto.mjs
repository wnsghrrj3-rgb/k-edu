// 준비: kmotion/wizard 에서 `npm i --no-save jsdom@24` 한 번 → node tests/contract/smoke-proto.mjs (12판, 컨테이너 300초 제한이면 `SEEDS=7,31,99,5,13` · `SEEDS=21,44,61,62,63,64` · `SEEDS=65` 로 나눠서)
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
const data = { spells: J('data/spells.json'), enemies: J('data/enemies.json'), anim: J('data/anim-timing.json'), layout: J('data/layout/targets.json'), text: J('data/text/ko.json'), camera: J('contract/camera.json'), worlds: J('data/worlds.json'), gradeTable: J('data/concepts-by-grade.json'),   /* v2.3 변환표 */ stages: { 'forest-1-1': J('data/stages/forest-1-1.json'), 'forest-1-2': J('data/stages/forest-1-2.json'), 'forest-1-3': J('data/stages/forest-1-3.json'), 'forest-1-boss': J('data/stages/forest-1-boss.json') } };
const text = (k, a) => { const s = data.text[k] ?? k; return a ? s.replace(/\{(\w+)\}/g, (_, x) => a[x] ?? '') : s; };
const root = w.document.getElementById('root');
const skin = createSkin({ root, quality: 'medium', text, assetBase: '', dev: true, camera: data.camera, layout: data.layout, anim: data.anim });
console.log('인터페이스', checkInterface(skin)); await skin.load(() => {}); skin.mount();
const errs = []; const S = fn => { try { fn(); } catch (e) { errs.push(e.stack.split('\n').slice(0, 3).join(' | ')); } };
for (const mode of ['keyboard', 'camera-menu']) {}
// v1.6: 시드 21·44 는 1-2 「버섯 마을 길」 — 21 은 1-1 깬 기록으로 시작 화면 스테이지 단추를 눌러 들어감(잠김 해제 경로), 44 는 ?stage= 강제
const runs = []; const SEEDS = process.env.SEEDS ? process.env.SEEDS.split(',').map(Number) : [7, 31, 99, 5, 13, 21, 44, 61, 62, 63, 64, 65];   // v2.3: 65 = ?grade=3&stage=forest-1-1&zone=3 (전투장 2부터 — 묶음 몬스터·share 문제·청록 탄·흩어짐·groups 그림 경로)
for (const seed of SEEDS) { const passive = seed === 5, all = seed === 13, g3 = seed === 65, s12 = seed === 21 || seed === 44, s13 = seed === 61 || seed === 62, sB = seed === 63 || seed === 64;   // v1.7: 61 = ?stage=forest-1-3 강제 · 62 = 1-2 깬 기록으로 1-3 단추 · v1.8: 63 = ?stage=forest-1-boss 강제 · 64 = 1-3 깬 기록으로 👑 단추
  const flow = createFlow({ data, grade: g3 ? 3 : 1, seed, unlock: all || g3 ? 'all' : null, startZone: g3 ? 3 : 0, stage: seed === 44 ? 'forest-1-2' : seed === 61 ? 'forest-1-3' : seed === 63 ? 'forest-1-boss' : g3 ? 'forest-1-1' : null, forceStage: seed === 44 || seed === 61 || seed === 63 || g3, progress: seed === 21 ? { xp: 0, level: 1, cleared: { 'forest-1-1': 2 }, unlocked: ['shield'] } : seed === 62 ? { xp: 0, level: 3, cleared: { 'forest-1-1': 3, 'forest-1-2': 1 }, unlocked: ['shield', 'ice'] } : seed === 64 ? { xp: 0, level: 4, cleared: { 'forest-1-1': 3, 'forest-1-2': 2, 'forest-1-3': 2 }, unlocked: ['shield', 'ice', 'lightning'] } : null }); const castSeen = new Set(); let cur = null, lastToast = null, acts = [];
  skin.ui.bind({ action: (id, p) => { acts.push(id); flow.action(id, p); } });
  const frame = () => { flow.step(1 / 60); if (flow.game) flow.game.aspect = 16 / 9; for (const ev of flow.drainEvents()) { if (ev.type === 'spell:cast' || ev.type === 'shield:on') castSeen.add(ev.spell || 'shield'); if (ev.type === 'obstacle:hit') railStat.hits++; if (ev.type === 'pickup' && ev.kind === 'firefly') railStat.fly++; if (ev.type === 'bounce') railStat.bounce = (railStat.bounce || 0) + 1; if (ev.type === 'enemy:shieldBreak') railStat.shield = (railStat.shield || 0) + 1; S(() => skin.onEvent(ev)); } const snap = flow.snapshot();
    if (snap.screen !== cur) { const p = cur; cur = snap.screen; S(() => { if (p) skin.ui.hide(p); skin.ui.show(cur, snap); }); }
    S(() => skin.ui.update(cur, snap)); if (snap.toast && snap.toast !== lastToast) S(() => skin.ui.toast(snap.toast)); lastToast = snap.toast; S(() => skin.render(snap, 0)); return snap; };
  for (let i = 0; i < 30; i++) frame();                                  // S01 메뉴
  // 보정 화면 거쳐 보기(카메라 모드, 몸 없음 → 단계 건너뛰기 4번)
  root.querySelectorAll('.modes button')[0].click(); root.querySelector('.go').click(); let calSeen = ''; for (let i = 0; i < 20; i++) { flow.pose(null, flow.t * 1000, 640, 480); calSeen = frame().screen + ':' + root.querySelector('.mw-calib .msg').textContent; } console.log('보정 화면', calSeen);
  for (let k = 0; k < 4; k++) { root.querySelector('.skip') && root.querySelector('.skip').click(); for (let i = 0; i < 5; i++) { flow.pose(null, flow.t * 1000, 640, 480); frame(); } }
  const forced = seed === 44 || seed === 61 || seed === 63 || g3;   // ?stage= 강제 = 지도 없이 바로 판(v1.9)
  console.log('보정 건너뛴 뒤', flow.snapshot().screen); if (flow.snapshot().screen !== (forced ? 'S08' : 'S04')) errs.push('보정 뒤 화면: ' + flow.snapshot().screen); for (let i = 0; i < 5; i++) frame();
  // v1.9 S04 지도(카메라 모드): 노드 4 + 들어가기 = targets rect 자리에 그려짐(검사기), 받침대 6, 잠긴 노드 클릭 → 토스트
  if (forced) { flow.action('home'); for (let i = 0; i < 5; i++) frame(); } else { const s4 = flow.snapshot(); const st = skin.stats(); const ck = checkTargets(s4, st.targetRects); if (!ck.ok) errs.push('지도 대상 rect 어긋남 ' + JSON.stringify(ck.bad)); const nodes = root.querySelectorAll('.mw-map .mw-node'), ped = root.querySelectorAll('.mw-ped i');
    if (nodes.length !== 4 || ped.length !== 6 || !root.querySelector('.mw-map .mw-enter')) errs.push(`지도 노드 ${nodes.length} 받침대 ${ped.length}`);
    const lockedNode = [...nodes].find(n => n.classList.contains('locked')); if (lockedNode) { lockedNode.click(); let saw = ''; for (let i = 0; i < 4; i++) { const sn = frame(); if (sn.toast) saw = sn.toast; } if (!/^map\.locked\./.test(saw)) errs.push('잠긴 노드 토스트 없음: ' + saw); }
    if (seed === 21) { if (!nodes[1].classList.contains('locked') && nodes[2].classList.contains('locked') && nodes[3].classList.contains('locked') && nodes[0].querySelector('s').textContent.includes('⭐⭐☆')) {} else errs.push('지도 노드 상태(21) ' + [...nodes].map(n => n.textContent + (n.classList.contains('locked') ? '(잠김)' : '')).join('/')); }
    if (seed === 7 && !(nodes[1].classList.contains('locked') && nodes[2].classList.contains('locked') && nodes[3].classList.contains('locked') && nodes[3].textContent.includes('🔒'))) errs.push('1-2·1-3·보스 노드 잠김 아님');
    if (seed === 64 && !(nodes[3].querySelector('b').textContent === '👑')) errs.push('보스 노드 👑 아님: ' + nodes[3].textContent);
    // 손 유지(마우스 모드가 아니라 카메라라 커서 0) → 클릭 경로로 들어가기 대신 처음으로 돌아가 키보드 판
    root.querySelector('.mw-map .home').click(); for (let i = 0; i < 5; i++) frame(); if (flow.snapshot().screen !== 'S01') errs.push('지도 → 처음으로 안 됨'); }
  root.querySelectorAll('.modes button')[1].click(); root.querySelector('.go').click();   // 키보드 → S04(강제는 바로 판)
  for (let i = 0; i < 3; i++) frame(); if (!forced && flow.snapshot().screen !== 'S04') errs.push('키보드 시작 뒤 S04 아님');
  if (!forced) { const nodes = root.querySelectorAll('.mw-map .mw-node'); const want = seed === 21 ? 1 : seed === 62 ? 2 : seed === 64 ? 3 : null;
    if (want != null) { if (nodes[want].classList.contains('locked')) errs.push('노드 ' + want + ' 안 열림'); else nodes[want].click(); frame(); }
    if (seed === 7) { nodes[1].click(); let saw = ''; for (let i = 0; i < 3; i++) { const sn = frame(); if (sn.toast) saw = sn.toast; } if (saw !== 'map.locked.forest-1-2') errs.push('키보드 모드 잠긴 노드 토스트: ' + saw); }
    if (seed === 21) { flow.key('ArrowLeft', true, 0); flow.key('ArrowRight', true, 0); flow.key('Enter', true, 0); } else root.querySelector('.mw-map .mw-enter').click(); /* 21 = 키보드 ←→ Enter 경로(1-2) */ for (let i = 0; i < 3; i++) frame(); if (!flow.game) errs.push('들어가기 뒤 게임 없음 ' + flow.snapshot().screen); }
  if (s12 && flow.game && flow.game.stageId !== 'forest-1-2') errs.push('1-2 로 시작 안 됨: ' + flow.game.stageId);
  if (s13 && flow.game && flow.game.stageId !== 'forest-1-3') errs.push('1-3 로 시작 안 됨: ' + flow.game.stageId);
  if (sB && flow.game && flow.game.stageId !== 'forest-1-boss') errs.push('1-보스 로 시작 안 됨: ' + flow.game.stageId);
  let hurt = 0; let tick = 0, tgBad = 0, tgN = 0, qN = 0, rectBad = 0, screens = new Set(), maxEnemies = 0, pzN = 0, pzRectBad = 0, railStat = { stones: 0, hits: 0, fly: 0 }; const press = (c, d) => flow.key(c, d, flow.t * 1000);
  let bossMax = -1, bossTg = 0, darkUI = '', darkN = 0, golemQ = 0, heartUI = ''; let packUI = '', shareQ = 0, groupsN = 0, shareShots = 0, scatterN = 0, exactHits = 0, shareSeen = new Set(); /* v2.3 */ while (tick++ < 60 * 600) { const s = frame(); screens.add(s.screen);
    if (s.world && s.world.heart && s.world.rail && !heartUI) { const nm = root.querySelector('.mw-rail .nm'); heartUI = nm ? nm.textContent : ''; }   // v1.8 심장길 HUD
    if (s.world && s.world.dark) { darkN++; if (s.world.rail && !darkUI) { const nm = root.querySelector('.mw-rail .nm'); darkUI = nm ? nm.textContent : ''; } }   // v1.7 동굴 HUD
    if (s.question && s.question.kind === 'golem' && root.querySelector('.mw-qpanel.golemq')) golemQ++;
    if (g3) { const pk = root.querySelector('.mw-pack'); if (pk && !pk.classList.contains('mw-hide') && !packUI) packUI = pk.textContent;   // v2.3 묶음 띠
      if (s.question && s.question.kind === 'share' && s.question.state === 'open' && root.querySelector('.mw-qpanel.shareq')) { if (!shareSeen.has(s.question.id)) { shareSeen.add(s.question.id); shareQ++; } if (s.question.readP >= 1 && !s.question.hintPic && tick % 6 === 0) { press('KeyH', true); press('KeyH', false); }   /* H 두 번 → groups 그림 */ if (root.querySelectorAll('.mw-q i.g').length) groupsN++; }
      for (const pr of (s.projectiles || [])) { if (pr.kind === 'share') { if (pr.scatter) scatterN++; else shareShots++; } } }
    if (s.boss) { bossMax = Math.max(bossMax, s.boss.phase + (s.boss.state === 'dead' ? 1 : 0)); if (s.boss.telegraphs.length) bossTg++; if (s.boss.telegraphs.some(t => t.avoid === 'duck')) press('ArrowDown', true); else press('ArrowDown', false); }
    if (s.enemies) { maxEnemies = Math.max(maxEnemies, s.enemies.length); const st = skin.stats(); const a = checkTelegraphs(s, st.telegraphs); if (s.enemies.some(e => e.telegraph) || (s.boss && s.boss.telegraphs.length)) tgN++; if (!a.ok) tgBad++; }
    if (s.screen === 'S08Q' && s.question && s.question.state === 'open' && s.question.readP >= 1) { const st = skin.stats(); if (!checkTargets(s, st.targetRects).ok) rectBad++;
      if (tick % 20 === 0 && !(g3 && s.question.kind === 'share' && !s.question.hintPic && tick % 60)) { qN++; const slot = !passive && (qN % 2 || s.question.kind === 'seal') ? flow.game.q.v.correctSlot : (flow.game.q.v.correctSlot + 1) % 3; root.querySelectorAll('.mw-q .mw-orb:not(.mw-owl)')[slot].click(); } }
    // v1.5 S08P — 돌 구슬이 targets rect 자리에 있는지 + 봇이 돌을 집음(정답 2개 중 하나씩, passive 는 틀린 돌만 → reveal 경로)
    if (s.screen === 'S08P' && s.puzzle && s.puzzle.state === 'open') { const st = skin.stats(); if (!checkTargets(s, st.targetRects).ok) pzRectBad++; const Z = s.puzzle;
      if (Z.stones && tick % 25 === 0) { const want = Z.type === 'number-bridge' ? Z.stones.filter(x => !x.lit && (passive ? !(x.num + (Z.picks[0] || 0) === Z.target && Z.picks.length) && x.num !== Z.target - (Z.stones.find(y => y.lit) || { num: -99 }).num : true)) : Z.stones.filter(x => !x.lit);
        const pick = passive ? want[want.length - 1] : (Z.type === 'mushroom-add' || Z.type === 'crystal-count' ? Z.stones.find(y => y.num === Z.target) : Z.type === 'number-bridge' ? (() => { const lit = Z.stones.find(y => y.lit); if (lit) return Z.stones.find(y => !y.lit && y.num + lit.num === Z.target); for (const a of Z.stones) for (const b of Z.stones) if (a !== b && a.num + b.num === Z.target) return a; return Z.stones[0]; })() : (Z.seq ? Z.stones.find(y => y.num === Z.seq.at(-1) + (Z.seq[1] - Z.seq[0])) : Z.stones[0]));
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
  if (s13 && (!darkUI.includes('🔦') || !darkUI.includes('동굴길') || darkN < 600)) errs.push('동굴 HUD/어둠 경로 안 탐: ' + darkUI + ' ' + darkN);
  if (g3) { if (!packUI.includes('🟢×')) errs.push('묶음 띠 안 보임: ' + packUI); if (!shareQ) errs.push('share 문제 패널 0'); if (!groupsN) errs.push('groups 힌트 그림 0'); if (!shareShots) errs.push('청록 share 탄 0'); if (!scatterN) errs.push('흩어진 탄 0'); const R = flow.snapshot().result; if (!(R && R.packClears > 0)) errs.push('packClears 0: ' + JSON.stringify(R && { packClears: R.packClears, shareRight: R.shareRight, shareWrong: R.shareWrong })); }
  if (sB && (!heartUI.includes('🌳') || !heartUI.includes('심장길'))) errs.push('심장길 HUD 안 보임: ' + heartUI);
  if (sB && flow.snapshot().screen === 'S13') { const rs = root.querySelector('.mw-result') ? root.querySelector('.mw-result').textContent : ''; if (!rs.includes('수의 결정')) errs.push('결과에 수의 결정 없음: ' + rs.slice(0, 80)); }
  const snap = flow.snapshot(); runs.push({ seed, heartUI, g3: g3 ? { packUI, shareQ, groupsN, shareShots, scatterN, packClears: flow.snapshot().result && flow.snapshot().result.packClears, shareRight: flow.snapshot().result && flow.snapshot().result.shareRight, shareWrong: flow.snapshot().result && flow.snapshot().result.shareWrong } : undefined, stage: flow.game && flow.game.stageId, darkUI, darkN, golemQ, casts: [...castSeen].join(','), bossMax, bossTg, bossUI: root.querySelector('.mw-boss .nm') ? root.querySelector('.mw-boss .nm').textContent : '', end: snap.screen, ticks: tick, screens: [...screens].join(','), tg: `${tgN}프레임 중 누락 ${tgBad}`, rectBad, qClicks: qN, pzClicks: pzN, pzRectBad, rail: JSON.stringify(railStat), railUI: root.querySelector('.mw-rail') ? root.querySelector('.mw-rail').textContent : '', maxEnemies, result: JSON.stringify(snap.result), resultUI: root.querySelector('.mw-result') ? root.querySelector('.mw-result').textContent.slice(0, 60) : '' });
  root.querySelector('.again') && root.querySelector('.again').click(); for (let i = 0; i < 30; i++) frame(); flow.action('home'); for (let i = 0; i < 5; i++) frame();
}
// 마우스(카메라) 모드 멈춤 — 손 유지 마법 바퀴 구슬이 targets 자리에 그려지는지(v1.3)
{ const flow = createFlow({ data, grade: 1, seed: 77, unlock: 'all' }); let cur = null; skin.ui.bind({ action: (id, p) => flow.action(id, p) });
  const frame = () => { flow.step(1 / 60); if (flow.game) flow.game.aspect = 16 / 9; for (const ev of flow.drainEvents()) S(() => skin.onEvent(ev)); const snap = flow.snapshot();
    if (snap.screen !== cur) { const p = cur; cur = snap.screen; S(() => { if (p) skin.ui.hide(p); skin.ui.show(cur, snap); }); } S(() => skin.ui.update(cur, snap)); S(() => skin.render(snap, 0)); return snap; };
  for (let i = 0; i < 5; i++) frame(); flow.action('start', { mode: 'mouse' }); flow.action('enter'); for (let i = 0; i < 60; i++) frame(); flow.game.input.push({ type: 'PAUSE', t: 0, via: 'key', value: {} }); let s; for (let i = 0; i < 5; i++) s = frame();
  const r = checkTargets(s, skin.stats().targetRects); const orbs = root.querySelectorAll('.mw-wheel .mw-orb:not(.mw-hide)').length;
  console.log('멈춤 바퀴', s.paused, '대상', s.targets.map(t => t.id).join(','), '그림', r.ok ? '✓' : '✗ ' + r.bad, '구슬', orbs); if (!r.ok || orbs !== s.targets.length) errs.push('멈춤 바퀴 대상 어긋남');
  root.querySelector('.mw-wheel .mw-orb').click(); for (let i = 0; i < 3; i++) s = frame(); flow.action('resume'); for (let i = 0; i < 3; i++) s = frame(); console.log('바퀴 클릭 뒤 주 마법', s.player.main, '· 다시 뒤 대상', s.targets.length); flow.action('home'); for (let i = 0; i < 3; i++) frame(); }
console.log(runs); console.log('stats', skin.stats().drawCalls, '그린 횟수 OK'); console.log(errs.length ? '오류 ' + errs.length + '\n' + [...new Set(errs)].slice(0, 8).join('\n') : '오류 0'); skin.dispose(); process.exit(0);
