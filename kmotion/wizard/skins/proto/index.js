// proto 스킨 — 기준 구현(13 문서 8절). createSkin(ctx) → Skin(contract/skin.d.ts). 에셋 0·절차적.
// 규칙: 스냅샷은 읽기만 · 판정 크기·시간은 스냅샷 값 그대로 · 모르는 이벤트는 무시 · 엔진·sim import 0
import * as THREE from 'three';
import { WX, makePlayer, posePlayer, tipWorld, makeSlime, poseSlime, makeGoblin, poseGoblin, makeShieldGoblin, poseShieldGoblin, makeCrystalGolem, poseCrystalGolem, makeCrystal, poseCrystal, makeGolem, poseGolem, makeRock, makeObstacle, poseObstacle, makePuzzleProp, posePuzzleProp } from './actors.js';
import { makeTelegraph, poseTelegraph, makeProjectile, poseProjectile, Sparks, makeBlast, makeTelegraphLine, poseTelegraphLine, makeTelegraphRing, poseTelegraphRing, makeIce, poseIce, makeBolt, poseBolt, makeMeteor, poseMeteor } from './vfx.js';
import { createUI } from './ui.js';
import { createAudio } from './audio.js';
import { buildForest } from './env.js';

export const CONTRACT = '1';
export function createSkin(ctx){
  const CAM = ctx.camera, TIMING = ctx.anim || {};
  let quality = ctx.quality, css = null, renderer, scene, camera, sun, sparks, forest, W = innerWidth, H = innerHeight, hemi = null, staffLight = null, darkK = 0;
  // v1.7 낮 숲 ↔ 동굴 조명 두 벌(09 문서 3행) — darkK 0~1 로 섞음
  const LIT = { bg: new THREE.Color(0x9fd0f0), fog: new THREE.Color(0xa9d6ee), near: 18, far: 46, sky: new THREE.Color(0xdff2ff), gnd: new THREE.Color(0x3d5a2a), hemi: 1.25, sun: 2.2 };
  const DARK = { bg: new THREE.Color(0x120e26), fog: new THREE.Color(0x1d1838), near: 7, far: 30, sky: new THREE.Color(0x7a6fc4), gnd: new THREE.Color(0x15112a), hemi: .55, sun: .18 };
  const _c = new THREE.Color();
  let player = null, playerId = null; const enemies = new Map(), shots = new Map(), crystals = new Map(), tgs = new Map(), blasts = new Map(), btgs = new Map(); let bolts = [], golem = null, golemUid = null; const obst = new Map(); let pzProp = null, pzId = null;
  let lastT = performance.now(), drawnTg = [], kick = 0, fovPulse = 0, camPos = new THREE.Vector3(0, 4.2, -7.5), camLook = new THREE.Vector3(0, 1, 3), menuSpin = 0, hopY = 0;
  const audio = createAudio(), ui = createUI(ctx, audio), tmp = new THREE.Vector3();

  function toScreen(pos){ tmp.set(WX(pos[0]), pos[1], pos[2]).project(camera); return { x: (tmp.x * .5 + .5) * W, y: (-tmp.y * .5 + .5) * H, front: tmp.z < 1 }; }
  function applyQuality(){ if (!renderer) return; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1));
    renderer.shadowMap.enabled = quality !== 'low'; sun.castShadow = quality !== 'low'; if (sparks) sparks.mul = quality === 'low' ? .5 : 1; if (forest) forest.setQuality(quality); }
  function sync(map, list, make, remove){ const seen = new Set(); for (const it of list) { seen.add(it.uid); if (!map.has(it.uid)) map.set(it.uid, make(it)); }
    for (const [k, v] of map) if (!seen.has(k)) { remove(v, k); map.delete(k); } return seen; }
  const drop = o => { const g = o.g || o; scene.remove(g); g.traverse(n => { if (n.geometry && !n.geometry.userData.shared) n.geometry.dispose(); }); };

  const skin = {
    ui,
    async load(progress){ progress(0);
      css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('./theme.css', import.meta.url).href; await new Promise(r => { css.onload = css.onerror = r; document.head.append(css); setTimeout(r, 3000); });
      renderer = new THREE.WebGLRenderer({ antialias: quality !== 'low', powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0';
      scene = new THREE.Scene(); scene.background = new THREE.Color(0x9fd0f0); scene.fog = new THREE.Fog(0xa9d6ee, 18, 46);
      camera = new THREE.PerspectiveCamera(CAM.arena.fov, W / H, .1, 120);
      hemi = new THREE.HemisphereLight(0xdff2ff, 0x3d5a2a, 1.25); scene.add(hemi); staffLight = new THREE.PointLight(0xcff6ff, 0, 15, 1.4); scene.add(staffLight);   // v1.7 지팡이 빛(동굴에서만 켬, 닿는 거리 = 시스템 light)
      sun = new THREE.DirectionalLight(0xfff1d6, 2.2); sun.position.set(-6, 14, -4); sun.target.position.set(0, 0, 6); scene.add(sun, sun.target);
      Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 12, bottom: -6, near: 1, far: 40 }); sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0005;
      progress(.4); forest = buildForest(scene, { arenaZ: CAM.arenaCenterZ || 9 }); sparks = new Sparks(scene, 700); progress(1); applyQuality(); },
    mount(){ ctx.root.prepend(renderer.domElement); skin.resize(innerWidth, innerHeight, devicePixelRatio || 1);
      const unlock = () => audio.unlock(); addEventListener('pointerdown', unlock, { once: true }); addEventListener('keydown', unlock, { once: true }); },
    render(s, alpha){
      const now = performance.now(), dt = Math.min(.1, (now - lastT) / 1000); lastT = now; forest.update(dt);
      if (!s.player) { // 메뉴: 고른 캐릭터를 천천히 돌려 보여 줌
        const id = s.title ? s.title.char : 'luna'; if (playerId !== id) { if (player) scene.remove(player); player = makePlayer(id); playerId = id; scene.add(player); }
        menuSpin += dt * .4; player.position.set(0, 0, 4); player.rotation.y = Math.PI + Math.sin(menuSpin) * .6; player.userData.armR.rotation.x = -.6 + Math.sin(menuSpin * 3) * .2; player.userData.orb.visible = false; player.userData.shield.visible = false;
        for (const m of [enemies, shots, crystals, tgs, blasts, btgs, obst]) { for (const v of m.values()) drop(v); m.clear(); } if (golem) { scene.remove(golem); golem = null; golemUid = null; } if (pzProp) { drop(pzProp); pzProp = null; pzId = null; } forest.setMode('arena'); forest.setDark(false); forest.setHeart(false); darkK = 0; scene.background.copy(LIT.bg); scene.fog.color.copy(LIT.fog); scene.fog.near = LIT.near; scene.fog.far = LIT.far; hemi.intensity = LIT.hemi; hemi.color.copy(LIT.sky); hemi.groundColor.copy(LIT.gnd); sun.intensity = LIT.sun; staffLight.intensity = 0;
        camera.position.set(Math.sin(menuSpin * .5) * 1.2, 2.2, -.8); camera.lookAt(0, 1.2, 4); camera.fov = 50; camera.updateProjectionMatrix(); sparks.update(dt); renderer.render(scene, camera); drawnTg = []; return; }
      const P = s.player; if (playerId !== P.id) { if (player) scene.remove(player); player = makePlayer(P.id); playerId = P.id; scene.add(player); }
      player.rotation.y = 0; posePlayer(player, P, dt, TIMING); hopY += ((P.hopping ? .9 : 0) - hopY) * Math.min(1, dt * (P.hopping ? 14 : 9)); player.position.y = hopY;   // v1.6 버섯 발판 폴짝(스킨 연출, 판정은 시스템)
      sync(enemies, s.enemies, e => { const g = e.kind === 'calc-goblin' ? makeGoblin(e) : e.kind === 'shield-goblin' ? makeShieldGoblin(e) : e.kind === 'crystal-golem' ? makeCrystalGolem(e) : makeSlime(e); g.userData.kind = e.kind; scene.add(g); return g; }, drop);
      for (const e of s.enemies) { const g = enemies.get(e.uid); if (g.userData.kind === 'calc-goblin') poseGoblin(g, e, dt, camera, s.gameT); else if (g.userData.kind === 'shield-goblin') poseShieldGoblin(g, e, dt, camera, s.gameT); else if (g.userData.kind === 'crystal-golem') poseCrystalGolem(g, e, dt, camera, s.gameT); else poseSlime(g, e, dt, camera, s.gameT); }
      sync(shots, s.projectiles, p => { const o = makeProjectile(p); scene.add(o.g, o.trail); return o; }, o => { scene.remove(o.g, o.trail); o.trail.geometry.dispose(); });
      for (const p of s.projectiles) poseProjectile(shots.get(p.uid), p);
      sync(crystals, s.crystals, c => { const g = makeCrystal(c); scene.add(g); return g; }, drop); for (const c of s.crystals) poseCrystal(crystals.get(c.uid), c, dt);
      // v1.5 길 위 물건·퍼즐 소품(27 문서 ①) — 크기·자리는 스냅샷 그대로, 바닥·나무는 env 가 rail.dist 로 흘림
      const R = s.world && s.world.rail; forest.setMode(R ? 'rail' : 'arena', R);
      // v1.7 동굴: world.dark 면 조명·안개를 천천히 어둡게 + 지팡이 빛(거리 = world.light)
      forest.setHeart(!!(s.world && s.world.heart));   // v1.8 고대 나무 심장(1-보스)
      const dk = s.world && s.world.dark ? 1 : 0; forest.setDark(!!dk); darkK += (dk - darkK) * Math.min(1, dt * 2.5);
      scene.background.copy(_c.copy(LIT.bg).lerp(DARK.bg, darkK)); scene.fog.color.copy(_c.copy(LIT.fog).lerp(DARK.fog, darkK)); scene.fog.near = LIT.near + (DARK.near - LIT.near) * darkK; scene.fog.far = LIT.far + (DARK.far - LIT.far) * darkK;
      hemi.color.copy(_c.copy(LIT.sky).lerp(DARK.sky, darkK)); hemi.groundColor.copy(_c.copy(LIT.gnd).lerp(DARK.gnd, darkK)); hemi.intensity = LIT.hemi + (DARK.hemi - LIT.hemi) * darkK; sun.intensity = LIT.sun + (DARK.sun - LIT.sun) * darkK;
      staffLight.intensity = 9 * darkK; staffLight.distance = (s.world && s.world.light) || 15; if (player && darkK > .01) { tipWorld(player, staffLight.position); staffLight.position.y += .3; staffLight.position.z += 1.2; }
      sync(obst, s.obstacles || [], o => { const g = makeObstacle(o); scene.add(g); return g; }, drop); for (const o of (s.obstacles || [])) poseObstacle(obst.get(o.uid), o, dt, s.gameT);
      const PZ = s.puzzle; if (!PZ && pzProp) { drop(pzProp); pzProp = null; pzId = null; }
      if (PZ) { if (pzId !== PZ.id) { if (pzProp) drop(pzProp); pzProp = makePuzzleProp(PZ); pzId = PZ.id; scene.add(pzProp); } posePuzzleProp(pzProp, PZ, dt); }
      // 예고 — 반드시 그린다(검사기 checkTelegraphs). 크기·시간 = 스냅샷
      const withTg = s.enemies.filter(e => e.telegraph).map(e => ({ uid: e.uid, tg: e.telegraph }));
      sync(tgs, withTg, x => { const g = x.tg.shape === 'line' ? makeTelegraphLine() : makeTelegraph(); g.userData.shape = x.tg.shape; scene.add(g); return g; }, drop);
      for (const x of withTg) { const g = tgs.get(x.uid); if (g.userData.shape !== x.tg.shape) { drop(g); const n = x.tg.shape === 'line' ? makeTelegraphLine() : makeTelegraph(); n.userData.shape = x.tg.shape; scene.add(n); tgs.set(x.uid, n); }
        const o = tgs.get(x.uid); if (x.tg.shape === 'line') poseTelegraphLine(o, x.tg, s.gameT); else poseTelegraph(o, x.tg, s.gameT); } drawnTg = withTg.map(x => x.uid);
      // 보스 — 몸·예고(여러 개, 모양별)
      const B = s.boss; if (!B && golem) { scene.remove(golem); golem = null; golemUid = null; }
      if (B) { if (golemUid !== B.uid) { if (golem) scene.remove(golem); golem = makeGolem(); golemUid = B.uid; scene.add(golem); } poseGolem(golem, B, dt, s.gameT); }
      const bt = B ? B.telegraphs.map((tg, i) => ({ uid: 'b' + i + ':' + tg.shape + ':' + tg.t0, i, tg })) : [];
      sync(btgs, bt, x => { const o = x.tg.shape === 'line' ? makeTelegraphLine() : x.tg.shape === 'ring' ? makeTelegraphRing() : makeTelegraph(); if (x.tg.label) { const r = makeRock(x.tg.label); o.add(r); o.userData.rock = r; } scene.add(o); return o; }, drop);
      for (const x of bt) { const o = btgs.get(x.uid), tg = x.tg; if (tg.shape === 'line') poseTelegraphLine(o, tg, s.gameT); else if (tg.shape === 'ring') poseTelegraphRing(o, tg, s.gameT); else poseTelegraph(o, tg, s.gameT);
        if (o.userData.rock) { const k = Math.max(0, Math.min(1, (s.gameT - tg.t0) / (tg.t1 - tg.t0))), f = Math.max(0, (k - .45) / .55); o.userData.rock.position.y = (7 - 7 * f * f) / Math.max(.01, tg.size[0]); o.userData.rock.scale.setScalar(1 / Math.max(.01, tg.size[0])); o.userData.rock.rotation.x += dt * 4; } }
      drawnTg = drawnTg.concat(bt.map(x => 'b' + x.i));
      sync(blasts, s.areas, a => { const m = a.kind === 'ice' ? makeIce() : a.kind === 'meteor' ? makeMeteor() : makeBlast(0xff8a3d); m.userData.kind = a.kind; scene.add(m); return m; }, drop);
      for (const a of s.areas) { const m = blasts.get(a.uid); if (a.kind === 'ice') { poseIce(m, a, s.gameT); continue; } if (a.kind === 'meteor') { poseMeteor(m, a, s.gameT); continue; } { const k = Math.max(0, Math.min(1, (s.gameT - a.t0) / Math.max(.01, a.t1 - a.t0))); m.position.set(WX(a.pos[0]), .2, a.pos[2]); m.scale.set(a.radius * (.6 + .4 * k), a.radius * .55 * (.6 + .4 * k), a.radius * (.6 + .4 * k)); m.material.opacity = .75 * (1 - k); } }
      bolts = bolts.filter(b => { const live = poseBolt(b); if (!live) { scene.remove(b); b.geometry.dispose(); } return live; });
      if (player) { const ar = P.arcana; player.userData.shield.visible = P.blocking || !!ar; player.userData.shield.material.color.setHex(ar ? 0xb28cff : 0x9a8cc8); player.userData.shield.material.opacity = ar ? .28 + .1 * Math.sin(now / 90) : .22; }
      sparks.update(dt * (s.slow < 1 ? Math.max(.25, s.slow) : 1));
      // 카메라 — 기준 자세(contract/camera.json) + 연출 오프셋(흔들림 ±0.6m 이하, FOV ±8° 이하)
      const cm = s.camera.mode, C = cm === 'q' ? CAM.q : cm === 'rail' ? CAM.rail : cm === 'puzzle' ? CAM.puzzle : CAM.arena, px = P.pos[0] * C.trackX, pz = P.pos[2], intro = cm === 'boss-intro' && s.boss;
      const wantPos = new THREE.Vector3(WX(px), C.height, pz - C.dist), wantLook = C.lookAhead != null ? new THREE.Vector3(WX(px), C.lookY, pz + C.lookAhead) : new THREE.Vector3(WX(px), C.lookY, pz + (CAM.arenaCenterZ - pz) * C.lookMix);
      const runFov = R && C.fovRun ? C.fovRun * Math.min(1.3, R.speed / Math.max(.1, R.base)) : 0;   // 길: 달릴수록 FOV +(속도/기준×6)
      if (intro) { wantLook.set(WX(s.boss.pos[0]), 2.0, s.boss.pos[2]); wantPos.y += .5; }   // 등장 컷: 기준 자세 그대로, 시선만 보스로
      const kk = 1 - Math.exp(-dt / C.tau); camPos.lerp(wantPos, kk); camLook.lerp(wantLook, kk);
      const sh = Math.min(.6, (s.camera.shake || 0) * .6 + kick); kick = Math.max(0, kick - dt * 1.6);
      camera.position.set(camPos.x + (Math.random() - .5) * sh, camPos.y + (Math.random() - .5) * sh * .6, camPos.z); camera.lookAt(camLook);
      fovPulse = Math.max(0, fovPulse - dt * 20); const fov = C.fov + runFov + Math.min(8, fovPulse); if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
      renderer.render(scene, camera);
    },
    onEvent(ev){ try { handle(ev); } catch (e) { if (ctx.dev) console.warn('[proto] 이벤트', ev.type, e); } },
    resize(w, h, dpr){ W = w; H = h; if (!renderer) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
    setQuality(q){ quality = q; applyQuality(); },
    stats(){ const i = renderer ? renderer.info : null; return { drawCalls: i ? i.render.calls : 0, triangles: i ? i.render.triangles : 0, textures: i ? i.memory.textures : 0, telegraphs: drawnTg.slice(), targetRects: ui.targetRects() }; },
    dispose(){ audio.dispose(); ui.dispose(); if (css) css.remove(); if (renderer) { renderer.dispose(); renderer.domElement.remove(); } },
  };

  function enemyAt(uid){ return enemies.get(uid); }
  function P_(){ return player ? -player.position.x : 0; }   // 계약 x(스킨은 x 뒤집어 그림)
  function handle(ev){
    const T = ev.type;
    if (T === 'attack:fire') { audio.play('bolt'); if (player) { const p = tipWorld(player, new THREE.Vector3()); sparks.burst([-p.x, p.y, p.z], 0xfff1a8, 8, 2, 1); } kick = Math.max(kick, .03); }
    else if (T === 'spell:charge') audio.play('charge');
    else if (T === 'spell:cast') { audio.play(ev.spell === 'ice' ? 'ice' : ev.spell === 'meteor' ? 'sky' : 'cast'); fovPulse = 5; kick = .08; }
    else if (T === 'spell:chain') { audio.play('zap'); const b = makeBolt(ev.points); scene.add(b); bolts.push(b); for (const p of ev.points.slice(1)) sparks.burst(p, 0xfff27a, 16, 3, 2); fovPulse = 3; }
    else if (T === 'shield:on') audio.play('shield');
    else if (T === 'shield:block') { audio.play('block'); if (player) { const p = player.position; sparks.burst([-p.x, 1, p.z], 0xb28cff, 30, 3, 2); } }
    else if (T === 'spell:equip') audio.play('click');
    else if (T === 'spell:impact') { audio.play(ev.spell === 'meteor' ? 'meteor' : 'boom'); if (ev.spell === 'meteor') { sparks.burst(ev.pos, 0xffb46b, 160, 9, 5); kick = .6; fovPulse = 8; } sparks.burst(ev.pos, 0xff8a3d, 60, 5, 3); sparks.burst(ev.pos, 0xffe27a, 30, 3, 4); kick = .2; }
    else if (T === 'spell:fizzle') { audio.play('fizzle'); if (ev.reason === 'mana') ui.toast('toast.findCrystal'); else ui.toast('toast.fizzle'); }
    else if (T === 'hit') { const pos = ev.pos || [0, 1, 0], sc = toScreen(pos);
      if (ev.target === 'player') { audio.play(ev.blocked ? 'block' : 'hurt'); if (!ev.blocked) { ui.flash(); if (player) player.userData.flash = 1; } if (sc.front) ui.floatAt(sc.x, sc.y - 40, '−' + ev.amount, 'hurt'); }
      else if (ev.deflect) { audio.play('ting'); const g = enemyAt(ev.target); if (g) g.userData.flash = .4; sparks.burst(pos, 0xcff6ff, 14, 3.5, 1.5); if (sc.front) ui.floatAt(sc.x, sc.y - 30, '팅! ' + ev.amount, ''); }
      else { audio.play(ev.shielded ? 'block' : 'hit', ev.crit); const g = ev.target === golemUid ? golem : enemyAt(ev.target); if (g) g.userData.flash = 1; sparks.burst(pos, ev.crit ? 0xffd45c : 0xffffff, ev.crit ? 18 : 10, 3, 2); if (sc.front) ui.floatAt(sc.x, sc.y - 30, String(ev.amount), ev.crit ? 'crit' : ''); } }
    else if (T === 'block') { audio.play('block'); if (ev.pos) sparks.burst(ev.pos, 0xb28cff, 20, 3, 1); }
    else if (T === 'dodge') { audio.play('dodge'); if (ev.acorn && player) { const p = player.position; sparks.burst([-p.x, 1.2, p.z], 0xfff1a8, 24, 3, 2); audio.play('crystal'); } }
    else if (T === 'enemy:spawn') { if (!ev.mini) audio.play('spawn'); if (ev.pos) sparks.burst(ev.pos, ev.mini ? 0xc8ffe0 : 0x9dffc7, ev.mini ? 12 : 24, 2.5, 2.5); }
    else if (T === 'enemy:split') { if (!ev.prevented) { audio.play('split'); if (ev.pos) { sparks.burst(ev.pos, 0x9dffc7, 40, 3.5, 3); } } else audio.play('right', 0); }
    else if (T === 'enemy:shoot') { audio.play('throw'); if (ev.from) sparks.burst(ev.from, 0xd9b27a, 8, 2, 1.5); }
    else if (T === 'empower:on') { audio.play('empower'); ui.toast('toast.empowerOn'); if (ev.pos) { sparks.burst(ev.pos, 0xffd45c, 120, 4, 5); sparks.burst(ev.pos, 0xfff1a8, 60, 3, 4); } fovPulse = 6; kick = .15; }
    else if (T === 'empower:off') audio.play('fizzle');
    else if (T === 'telegraph:start') audio.play('windup');
    else if (T === 'enemy:die') { audio.play('die'); if (ev.pos) { sparks.burst(ev.pos, 0xffd45c, 50, 4, 3); sparks.burst(ev.pos, 0x9dffc7, 30, 3, 2); } }
    else if (T === 'crystal:spawn') { audio.play(ev.kind === 'empower' ? 'gold' : 'crystal'); if (ev.pos) sparks.burst(ev.pos, ev.kind === 'empower' ? 0xffd45c : 0x7ae7ff, ev.kind === 'empower' ? 50 : 30, 2.5, 2.5); }
    else if (T === 'crystal:break') { audio.play(ev.fade ? 'fizzle' : 'crystal'); if (ev.pos && !ev.fade) sparks.burst(ev.pos, ev.kind === 'empower' ? 0xffd45c : 0x7ae7ff, 70, 4, 3); }
    else if (T === 'hint:crystal') { ui.toast('toast.findCrystal'); audio.play('crystal'); }
    else if (T === 'q:open') audio.play('qopen');
    else if (T === 'q:right') { audio.play('right', ev.streak); ui.setMana(ev.mana); forest.pulseDigits(); if (player) { const p = player.position; sparks.burst([-p.x, 1.6, p.z], 0x58b7ff, 60, 3, 4); sparks.burst([-p.x, 1.6, p.z], 0xffd45c, 40, 3, 5); } }
    else if (T === 'q:wrong') audio.play('wrong');
    else if (T === 'q:hint') audio.play('hint');
    else if (T === 'zone:enter' && ev.zone === 'arena' && ev.idx) { audio.play('wave'); ui.toast('toast.zone'); }
    else if (T === 'q:gauge') { audio.play('gauge'); }
    else if (T === 'reward') { audio.play(ev.kind === 'feather' ? 'feather' : ev.kind === 'crystal' ? 'clear' : 'crystal'); if (ev.pos) sparks.burst(ev.pos, ev.kind === 'feather' ? 0xffffff : ev.kind === 'crystal' ? 0x9b6bff : 0x58b7ff, ev.kind === 'crystal' ? 120 : 40, 2, ev.kind === 'crystal' ? 6 : 4); if (ev.kind === 'crystal') forest.pulseDigits(); }
    else if (T === 'wave') { audio.play('wave'); ui.toast('toast.wave'); }
    else if (T === 'xp') { if (ev.pos && ev.amount >= 5) { const sc = toScreen(ev.pos); if (sc.front) ui.floatAt(sc.x, sc.y - 50, `+${ev.amount} XP`, 'xp'); } }
    else if (T === 'level:up') { audio.play('levelup'); ui.toast('toast.levelUp'); if (player) { const p = player.position; sparks.burst([-p.x, 1.2, p.z], 0xffd45c, 90, 3, 5); sparks.burst([-p.x, 1.6, p.z], 0xb28cff, 60, 3, 4); } }
    else if (T === 'boss:intro') { audio.play('roar'); kick = .3; }
    else if (T === 'boss:shield') { audio.play('shield'); ui.toast('toast.seal'); }
    else if (T === 'boss:seal') { audio.play('glass'); if (ev.pos) { sparks.burst(ev.pos, 0x9fe8ff, 90, 6, 4); sparks.burst(ev.pos, 0xffffff, 40, 4, 5); } kick = .35; fovPulse = 6; }
    else if (T === 'boss:weak') { if (ev.on) { audio.play('weak'); ui.toast('toast.weak'); } }
    else if (T === 'boss:phaseEnd') { audio.play('roar'); kick = .4; if (golem) sparks.burst([-golem.position.x, 1.8, golem.position.z], 0xff8a3d, 80, 5, 4); }
    else if (T === 'boss:die') { audio.play('boom'); audio.play('clear'); if (golem) { const p = [-golem.position.x, 1.5, golem.position.z]; sparks.burst(p, 0xffd45c, 160, 7, 5); sparks.burst(p, 0x9fe8ff, 80, 5, 6); } kick = .5; }
    else if (T === 'stage:clear') { audio.play('clear'); if (ev.reward) ui.toast('toast.reward.' + ev.reward); else if (ev.crystal) ui.toast('toast.reward.crystal.' + ev.crystal); }
    // v1.6 방패병·버섯 발판
    else if (T === 'enemy:shieldHit') { audio.play('block'); if (ev.pos) sparks.burst(ev.pos, 0xd9a35c, 12, 2.5, 2); }
    else if (T === 'enemy:shieldBreak') { audio.play(ev.byMath ? 'glass' : 'boom'); if (ev.pos) { sparks.burst(ev.pos, 0xd9a35c, 60, 4, 3); sparks.burst(ev.pos, 0xfff4d6, 30, 3, 4); } kick = Math.max(kick, .2); if (ev.byMath) fovPulse = 4; const sc = toScreen(ev.pos || [0, 1, 6]); if (sc.front) ui.floatAt(sc.x, sc.y - 40, '방패 깨짐!', 'crit'); }
    else if (T === 'enemy:crack') { audio.play('crack'); if (ev.pos) { sparks.burst(ev.pos, 0x5ef2c8, 70, 4.5, 3); sparks.burst(ev.pos, 0xffffff, 30, 3, 4); } kick = Math.max(kick, .25); fovPulse = 5; const sc = toScreen(ev.pos || [0, 1, 6]); if (sc.front) ui.floatAt(sc.x, sc.y - 50, ev.def > 0 ? `🛡 ${ev.def + 8} → ${ev.def}` : '💥 활짝!', 'crit'); }
    else if (T === 'bounce') { audio.play('dodge'); audio.play('crystal'); if (ev.pos) sparks.burst(ev.pos, 0xffc8b0, 28, 3, 3); kick = Math.max(kick, .06); const sc = toScreen([P_(), 1.8, 0]); if (sc.front) ui.floatAt(sc.x, sc.y - 30, '폴짝!', 'xp'); }
    // v1.5 길·퍼즐
    else if (T === 'rail:start') audio.play('wave');
    else if (T === 'obstacle:hit') { kick = Math.max(kick, .3); if (ev.pos) sparks.burst(ev.pos, ev.kind === 'branch' ? 0x7fc466 : 0xb8bcc8, 24, 3, 2); const g = obst.get(ev.uid); if (g) g.userData.t = 0; }
    else if (T === 'obstacle:pass' && ev.nice) { audio.play('dodge'); if (player) { const p = player.position; sparks.burst([-p.x, 1.1, p.z], 0xfff1a8, 20, 3, 2); const sc = toScreen([P_(), 1.6, 0]); if (sc.front) ui.floatAt(sc.x, sc.y - 30, '멋져!', 'xp'); } }
    else if (T === 'pickup') { if (ev.kind === 'firefly') { audio.play('crystal'); ui.setFireflies(ev.n); if (ev.pos) { sparks.burst(ev.pos, 0xfff1a8, 26, 2.5, 3); const sc = toScreen(ev.pos); if (sc.front) ui.floatAt(sc.x, sc.y - 20, `🪲 ${ev.n}마리`, 'xp'); } }
      else { audio.play('gold'); if (ev.pos) { sparks.burst(ev.pos, 0xffd45c, 70, 4, 4); sparks.burst(ev.pos, 0xfff1a8, 30, 3, 5); const sc = toScreen(ev.pos); if (sc.front) ui.floatAt(sc.x, sc.y - 40, `💰 +${ev.gold}`, 'crit'); } fovPulse = 4; } }
    else if (T === 'puzzle:open') audio.play('qopen');
    else if (T === 'puzzle:pick') audio.play('click');
    else if (T === 'puzzle:right') { audio.play('right', 0); if (ev.pos) { sparks.burst(ev.pos, 0x58b7ff, 50, 3, 4); sparks.burst(ev.pos, 0xffd45c, 40, 3, 5); } if (ev.gold) { const sc = toScreen(ev.pos || [0, 1.2, 0]); if (sc.front) ui.floatAt(sc.x, sc.y - 60, `💰 +${ev.gold}`, 'crit'); } }
    else if (T === 'puzzle:wrong') { audio.play('wrong'); kick = Math.max(kick, ev.ptype === 'size-gate' ? .25 : .08); if (ev.ptype !== 'size-gate') sparks.burst([0, .3, 7], 0x4f9fd6, 30, 2.5, 2); }
    else if (T === 'puzzle:reveal') audio.play('hint');
    else if (T === 'puzzle:close') { if (ev.solved) audio.play('clear'); }
    else if (T === 'player:defeat') audio.play('defeat');
  }
  return skin;
}
