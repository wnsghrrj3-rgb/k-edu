/* 마법 연구소 · 자리 ③ 무지개 물약 (Red · Blue · Yellow · Pink · Mix) — 연구소 설계 v1.2 8장 「큰 유리 수조」 · 묶음 3-5(L1-3-2), 주인공은 몬스터 고고.
 * 준호 11-25 「더 크게 · 큰 수조에 · 조금씩 따라서 색깔 변화를 확실하게」 → 냄비 · 국자 · 수도꼭지 · 마개 줄을 버리고 수조로 다시 지었다.
 * 수조가 주인공이다: 방은 어둑하고 수조만 뒤에서 빛을 받아 환하다. 보여 주려는 것은 하나 — 색이 「바뀐다」가 아니라 「옮겨 간다」.
 *   ① 한 모금씩(병을 누르면 한 모금 — 줄기가 가라앉고 구름처럼 말리며 퍼진다) ② 다섯 걸음으로 짙어진다(SHADE) ③ 한 모금마다 색 띠 위를 한 걸음씩(물 전체의 색은 초당 HUE_STEP 으로만 따라간다)
 *   ④ 젓지 않으면 두 색 구름이 따로 떠다니다 만나는 자리부터 섞이고 저절로는 반까지만(SELF_MIX) ⑤ 색이 둘이 되면 고고가 수조 위에 올라 긴 노로 젓는다(아이가 수조를 문지르면 아이가 젓는다) → "Mix!" → 새 색 이름.
 * 물들이기 = 퐁당: 물건을 누르면 스스로 수조에 뛰어들었다 그 색이 되어 나온다(맑은 물이면 씻긴다). 고고를 누르면 뛰어들어 헤엄친다. 열두 모금을 넘으면 넘친다("Splash!"). 꼭지를 열면 맑은 물로.
 * 첫 손길(설계 0장 · 자료 first): 들어가면 맑은 물 · 뒤 빛 · 공기 방울 · 살랑이는 병 → 고고가 파랑 한 모금을 해 보인다 → 노랑 병에 빛 고리. 누르기만으로 핵심 낱말이 다 나온다.
 * 낱말 · 부탁 · 색 규칙 · 수치는 자료(data/lab.js stations.potion)에서만 읽는다. 자료에 없는 수치만 아래 T 에 있다. 소리는 전부 합성(임시). 색 상태는 `t.color` 한 줄 — 겉은 engine/skin_color.js 가 입힌다(껍데기가 돌린다).
 * 장소(묶음 3-6 · 11-26 준호 「다 비슷하다 → 장소를 바꿔도 될 것 같아」): 이 자리는 연구소 방이 아니라 「지하 물약 방」에 있다 — 돌벽 · 큰 아치 벽감 · 나무 통 · 등불 · 구리 배관(tools/make_place_potion.py → assets/place_potion.glb).
 *   껍데기가 이 자리에 올 때 방 · 벽 · 바닥을 감추고 scenery 를 보인다. 놀이는 그대로다. 물빛은 수조 뒤 벽감과 돌벽을 물들이고(wallGlow · stoneGlow), 등불 셋은 이 자리에 있을 때만 일렁인다.
 * 자동 확인 명령: sip:색[:left|right] · pour:색:모금 · stir:바퀴 · dunk:대상 · drain · paint:대상:색 / 확인용: snap(수조 가운데 픽셀과 띠 그림 한 칸) · strip(띠 그림을 화면에 띄운다) */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, rand } from '../../../engine/stage.js?v=2';
import { sfx, tone, hiss } from '../../../engine/sound.js?v=2';
import { stepThing, centerOf, topOf, pickAt } from '../../../engine/things.js?v=2';

// ───────────────────────── 수치(자료에 없는 것만 — 준호가 만져 보고 바꾼다. 자료의 수치는 create 안에서 앞에 펼친다) ─────────────────────────
export const T = {
  FURN_SEC: 0.8, TANK_DROP: 1.85, RAIL_UP: 3.2,   // 가구가 들고 나는 시간 · 수조가 내려가 있는 깊이 · 병 걸이가 올라가 있는 높이
  BASE: 0.1,                                 // 수조 받침의 높이(모형과 맞춘다)
  TAP_S: 0.3, TAP_PX: 14,                    // 이보다 짧고 덜 움직였으면 「누르기」, 아니면 「끌기」
  SIP_SEC: 0.45,                             // 한 모금을 붓는 데 걸리는 시간
  MIX_AT: 0.75,                              // "Mix!" 문턱(자료 says)
  ALPHA: [0.1, 0.8], DEEP: 0.28,             // 물의 짙기(맑은 물 · 가장 짙은 물) — 뒤 빛 판이 이만큼 가려진다 · 짙어질수록 색도 이만큼 깊어진다(다섯 걸음이 밝기로도 갈리게)
  SHADE_K: 0.55, TINT_K: 0.6,                // 짙기 · 옅음과 갈색이 따라가는 빠르기(1/초)
  STIR_SETTLE: 1.1, GOGO_STIR: 1.15,         // 부은 뒤 이만큼 지나야 고고가 젓기 시작한다 · 고고가 젓는 빠르기(바퀴/초)
  SWIM: 2.4, FLOAT_MORE: 0.9,                // 고고가 헤엄치는 시간 · 작은 것이 더 떠다니는 시간
  OTHER_GAP: 0.6,                            // 고고가 해 보인 직후 다른 것으로 같은 낱말을 내면 이만큼만 지나도 말한다(첫 누르기가 조용하지 않게)
  GLOW: { power: 5, wall: 0.6, bench: 0.42, SAT: 1.6, stone: 0.3 },   // stone = 벽감 밖 돌벽에 번지는 물빛(벽감 안쪽 wall 보다 옅게)
  NICHE_Z: -2.25, BOW_Z: -1.36,              // 벽감의 안쪽 벽(모형과 맞춘다) · 무지개가 서는 자리(아치 돌보다 앞)
  LAMP: { color: '#ffd27a', halo: '#ffb45e', r: 1.5, a: 0.5, flick: 0.16 },   // 등불: 유리 색 · 둘레 빛의 색 · 크기 · 짙기 · 일렁이는 폭
  RAINBOW_STAY: 7, HICCUPS: 3, SHAKE: 0.05,
};
const SECOND = { 'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple' }, POS = { red: 0, yellow: 2, blue: 4 }, BAND = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const RECIPE = { red: ['red'], yellow: ['yellow'], blue: ['blue'], white: ['white'], pink: ['red', 'white'], purple: ['red', 'blue'], orange: ['red', 'yellow'], green: ['yellow', 'blue'], brown: ['red', 'yellow', 'blue'] };
const ease = k => k * k * (3 - 2 * k);

/** 껍데기가 이 자리에 처음 갈 때 한 번 부른다: 모형을 받고 자리를 돌려준다. C = 껍데기가 넘기는 것(lab.js). */
export async function create(C) {
  const { stage, scene, camera, gogo, brain, things, GOGO, targets, fx, voice, seen, P, BENCH, LAB, say } = C, s = gogo.state, D = LAB.stations.potion, W = LAB.words;
  Object.assign(T, D.T);
  const B = brain.B, { run, wait, until, walk, face } = brain, INKS = T.RAIL.order, HEX = Object.fromEntries(Object.entries(D.colors.hex).map(([k, v]) => [k, new THREE.Color(v)]));
  const CLEAR = new THREE.Color('#cdeef8'), WHITE = new THREE.Color('#ffffff'), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), v3c = new THREE.Vector3(), vWord = new THREE.Vector3(), vRing = new THREE.Vector3(), cTmp = new THREE.Color();
  const by = n => n === 'gogo' ? GOGO : things[n], len = n => gogo.info[n] ? gogo.info[n].dur : (LAB.clips[n] || [1])[0], has = n => !!gogo.info[n];
  const [pack, placePack] = await Promise.all(['lab_potion.glb?v=2', 'place_potion.glb?v=1'].map(f => new GLTFLoader().loadAsync(new URL('../../../assets/' + f, import.meta.url).href))), M = {};
  pack.scene.traverse(o => { if (o.isMesh) { M[o.name] = o; o.castShadow = true; o.receiveShadow = true; } });
  const TK = { x: T.TANK.at[0], z: T.TANK.at[1], w: T.TANK.w, h: T.TANK.h, d: T.TANK.d }, FRONT = TK.z + TK.d / 2, IH = TK.h - T.BASE, HW = TK.w / 2 - 0.07, DR = new THREE.Vector3(T.PLACE.drain[0], 0.9, T.TANK.at[1] + 0.3);      // 꼭지: 수조 오른쪽 벽에서 옆으로 나온다(자료의 x — 앞에 선 컵 위로 보이게 높이 단다)
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -TK.z);

  // ───────────────────────── 색 모형(자료 colors.rule 다섯 줄 · colors.show · colors.gradual) ─────────────────────────
  /** 섞인 물의 이름. a = { red, yellow, blue, white }(모금). 양을 따진다 — 25% · 15% 문턱. */
  function nameOf(a) {
    const c = a.red + a.yellow + a.blue, tot = c + a.white; if (tot < 0.02) return ''; if (c < 0.02) return 'white';
    const f = { red: a.red / c, yellow: a.yellow / c, blue: a.blue / c }, ks = ['red', 'yellow', 'blue'].sort((p, q) => f[q] - f[p]);
    const n = f[ks[2]] >= 0.15 ? 'brown' : f[ks[1]] >= 0.25 ? SECOND[[ks[0], ks[1]].sort().join('+')] : ks[0];
    return n === 'red' && a.white / tot >= 0.25 ? 'pink' : n;
  }
  /** 그 양이 가 닿을 곳: 색 띠 위의 자리 h(0 빨강 · 1 주황 · 2 노랑 · 3 초록 · 4 파랑 · 5 보라) · 갈색 · 옅음 · 짙기. 화면 색을 평균하지 않는다. */
  function goal(a, out) {
    const c = a.red + a.yellow + a.blue, tot = c + a.white, n = tot - 1, i = Math.floor(n); out.shade = tot <= 0 ? 0 : tot < 1 ? T.SHADE[0] * tot : n >= T.SHADE.length - 1 ? 1 : T.SHADE[i] + (T.SHADE[i + 1] - T.SHADE[i]) * (n - i);
    out.pale = tot > 0.02 ? (c < 0.02 ? 1 : Math.min(0.7, a.white / tot)) : 0; out.brown = nameOf(a) === 'brown' ? 1 : 0; out.any = c > 0.02; if (!out.any) return out;
    const ks = ['red', 'yellow', 'blue'].sort((p, q) => a[q] - a[p]); let d = POS[ks[1]] - POS[ks[0]]; if (d > 2) d -= 6; if (d < -2) d += 6; out.h = (POS[ks[0]] + d * a[ks[1]] / (a[ks[0]] + a[ks[1]]) + 6) % 6; return out;
  }
  /** 색 띠 위의 자리 → 색. 빨강 쪽이 옅어지면 분홍으로 간다(자료의 분홍 값). */
  function bandCol(h, pale, brown, out) {
    const i = Math.floor(h) % 6, k = h - Math.floor(h); out.copy(HEX[BAND[i]]).lerp(HEX[BAND[(i + 1) % 6]], k); const red = 1 - Math.min(1, Math.min(h, 6 - h) / 0.6);
    if (pale > 0) { out.lerp(HEX.pink, clamp(pale / 0.3, 0, 1) * red); out.lerp(HEX.white, red > 0.5 ? clamp((pale - 0.5) / 0.5, 0, 1) * 0.6 : pale); } return out.lerp(HEX.brown, brown);
  }

  // ───────────────────────── 수조 ─────────────────────────
  // K = 수조의 상태. amt = 들어간 물감(모금) · base = 마지막으로 다 섞였을 때의 양 · mixed = 그 뒤 부은 것이 섞인 정도(0~1). 물이 보여 주는 양 = base + (amt - base) × mixed
  const K = { amt: { red: 0, yellow: 0, blue: 0, white: 0 }, base: { red: 0, yellow: 0, blue: 0, white: 0 }, mixed: 1, mixSaid: false, g: { h: 4, pale: 0, brown: 0, shade: 0, any: false }, h: 4, pale: 0, brown: 0, shade: 0, col: CLEAR.clone(), gcol: new THREE.Color(), lv: T.TANK.water, fill: 1,
    settle: 9, pourNow: '', pourT: 0, plumeAcc: 0, drain: null, vis: 0, here: false, clock: 0, glowC: new THREE.Color('#9fd8ee'), glowK: 0, glowKey: '', pulse: 0, walked: 0, steps: new Set(), spillT: 0, pudK: 0, pudT: 0, burp: null, mixName: null,
    gstir: false, stirT: 0, stirAcc: 0, rub: null, dive: null, dives: 0, dunks: [], shakeT: 0, shakeCol: CLEAR, bowT: 0, bowK: 0, bowV: 0, bowOn: false, press: null, downT: 0, moved: false, x0: 0, y0: 0, mime: null, lastBy: {}, enterT: 9, arrived: true, demo: { red: 0, yellow: 0, blue: 0, white: 0 }, swayT: 1, snaps: [], strip: null, look: false, meet: false, bubT: 0 };
  const tot = () => INKS.reduce((n, c) => n + K.amt[c], 0), inksN = () => INKS.filter(c => K.amt[c] > 0.05).length, shown = () => Object.fromEntries(INKS.map(c => [c, K.base[c] + (K.amt[c] - K.base[c]) * K.mixed])), nameNow = () => nameOf(shown());
  const frac = () => clamp((T.TANK.water + T.LEVEL * tot()) * K.fill, 0.05, 0.985), levelY = () => tankG.position.y + T.BASE + IH * K.lv;
  const tankG = new THREE.Group(); tankG.position.set(TK.x, -T.TANK_DROP, TK.z); scene.add(tankG); tankG.add(M.tank);
  M.backlight.material = new THREE.MeshBasicMaterial({ color: '#fff6e4', toneMapped: false }); M.backlight.castShadow = M.backlight.receiveShadow = false; M.backlight.position.z = -TK.d / 2 + 0.04; tankG.add(M.backlight);      // 수조 뒤 빛 판(수족관처럼)
  const water = new THREE.Mesh(new THREE.BoxGeometry(TK.w - 0.1, 1, TK.d - 0.1).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: CLEAR, transparent: true, opacity: T.ALPHA[0], depthWrite: false, toneMapped: false })); water.position.y = T.BASE; water.renderOrder = 2; tankG.add(water);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(TK.w - 0.1, TK.d - 0.1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false })); top.renderOrder = 3; tankG.add(top);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(TK.w - 0.04, IH - 0.04, TK.d - 0.04), new THREE.MeshPhysicalMaterial({ color: '#e4f6ff', transparent: true, opacity: 0.1, roughness: 0.04, depthWrite: false, envMapIntensity: 2 })); glass.position.y = T.BASE + IH / 2; glass.renderOrder = 4; tankG.add(glass);
  for (const [x, w] of [[-1.1, 0.16], [-0.86, 0.05]]) { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, IH - 0.2).applyMatrix4(new THREE.Matrix4().makeShear(0, 0, 0.16, 0, 0, 0)), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.13, depthWrite: false })); g.position.set(x, T.BASE + IH / 2, TK.d / 2 + 0.005); g.renderOrder = 5; tankG.add(g); }      // 유리의 빛 줄
  // 물감 구름 · 공기 방울 · 떨어지는 방울 · 줄기
  const blobGeo = new THREE.SphereGeometry(1, 14, 10), blobs = Array.from({ length: 34 }, () => { const m = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); m.visible = false; m.renderOrder = 1; scene.add(m); return { m, on: false, age: 0, x: 0, y: 0, z: 0, ph: 0, r: 0.1, a: 0, c: '', stay: false, depth: 0.7, col: new THREE.Color() }; }); let blobNext = 0;
  const airN = 14, airMesh = new THREE.InstancedMesh(blobGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6, depthWrite: false }), airN), air = Array.from({ length: airN }, () => ({ x: rand(-1.4, 1.4), y: rand(0, 1), z: rand(-0.3, 0.3), r: rand(0.015, 0.04), v: rand(0.25, 0.55), ph: rand(0, 6) })), m4 = new THREE.Matrix4(); airMesh.frustumCulled = false; airMesh.renderOrder = 1; scene.add(airMesh);
  const DROPS = 90, dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.18 }), DROPS), drops = Array.from({ length: DROPS }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0.03, floor: 0 })); let dropNext = 0;
  dropMesh.frustumCulled = false; scene.add(dropMesh); for (let i = 0; i < DROPS; i++) { dropMesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); dropMesh.setColorAt(i, CLEAR); }
  function drop(p, vx, vy, vz, color, floor = 0, r = 0.035) { const d = drops[dropNext]; dropMesh.setColorAt(dropNext, color); dropMesh.instanceColor.needsUpdate = true; dropNext = (dropNext + 1) % DROPS; d.life = 2; d.p.copy(p); d.v.set(vx, vy, vz); d.r = r * rand(0.7, 1.2); d.floor = floor; }
  const streamGeo = new THREE.CylinderGeometry(1, 0.7, 1, 8, 1, true).translate(0, -0.5, 0), DOWN = new THREE.Vector3(0, -1, 0);
  const mkStream = () => { const m = new THREE.Mesh(streamGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92 })); m.visible = false; scene.add(m); return { m, k: 0, a: new THREE.Vector3(), col: new THREE.Color() }; };
  function stream(st, b, wide = 1) { st.m.visible = st.k > 0.03; if (!st.m.visible) return; const d = v3c.subVectors(b, st.a), L = d.length(); st.m.position.copy(st.a); st.m.quaternion.setFromUnitVectors(DOWN, d.normalize()); const w = 0.03 * wide * st.k * (1 + 0.18 * Math.sin(K.clock * 31)); st.m.scale.set(w, L, w); st.m.material.color.copy(st.col); }
  const pourS = mkStream(), drainS = mkStream(), fillS = mkStream();
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 30).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ roughness: 0.1, transparent: true, opacity: 0, depthWrite: false })); puddle.position.set(TK.x, 0.012, FRONT + 0.5); puddle.visible = false; scene.add(puddle);
  const burpM = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false })); burpM.visible = false; burpM.renderOrder = 1; scene.add(burpM);
  const bow = new THREE.Group(); BAND.forEach((n, i) => bow.add(new THREE.Mesh(new THREE.TorusGeometry(1.95 - i * 0.1, 0.055, 8, 48, Math.PI), new THREE.MeshBasicMaterial({ color: D.colors.hex[n], transparent: true, opacity: 0.92 })))); bow.position.set(-0.35, 1.9, T.BOW_Z); bow.visible = false; scene.add(bow);
  // 방을 물들이는 빛: 점 빛 하나 + 벽과 실험대에 번지는 덧빛(물 색을 따라간다)
  const glow = new THREE.PointLight('#ffffff', 0, 14, 1.6); glow.position.set(TK.x, 1.1, FRONT + 0.9); scene.add(glow);
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glowMat = () => new THREE.MeshBasicMaterial({ map: gtex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const wallGlow = new THREE.Mesh(new THREE.PlaneGeometry(9, 6.5), glowMat()); wallGlow.position.set(TK.x, 1.5, T.NICHE_Z + 0.07); wallGlow.renderOrder = 1; scene.add(wallGlow);                                 // 수조 뒤 벽감의 안쪽 벽(아치 돌이 앞에서 가린다)
  const stoneGlow = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), glowMat()); stoneGlow.position.set(TK.x, 1.6, -1.4); stoneGlow.renderOrder = 1; scene.add(stoneGlow);                                            // 벽감 밖 돌벽과 아치 돌
  // 장소 「지하 물약 방」 한 벌(껍데기가 보이고 감춘다). 등불의 유리는 스스로 빛나고, 둘레에 따뜻한 빛이 번진다 — 이 자리에 있을 때만 일렁인다
  const scenery = new THREE.Group(), lamps = []; scenery.visible = false; scene.add(scenery);
  for (const o of [...placePack.scene.children]) { if (!o.isMesh) continue; scenery.add(o); o.castShadow = false; o.receiveShadow = o.name === 'place';
    if (o.name === 'place_metal') { o.material.metalness = 0.55; o.material.roughness = 0.34; }
    if (o.name.startsWith('lamp_')) { o.material = new THREE.MeshBasicMaterial({ color: T.LAMP.color, toneMapped: false }); const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()), halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat()); halo.material.color.set(T.LAMP.halo); halo.position.copy(c).setZ(c.z + 0.2); halo.renderOrder = 1; scenery.add(halo); lamps.push({ glass: o, halo, ph: rand(0, 6), k: 1, to: 1, t: 0 }); } }
  const LAMP_C = new THREE.Color(T.LAMP.color);
  function stepLamps(dt) { for (const q of lamps) { if ((q.t -= dt) <= 0) { q.t = rand(0.06, 0.22); q.to = 1 - Math.random() ** 2 * T.LAMP.flick; } q.k += (q.to - q.k) * Math.min(1, 14 * dt); const k = q.k * (1 + 0.03 * Math.sin(K.clock * 9 + q.ph)); q.glass.material.color.copy(LAMP_C).multiplyScalar(0.82 + 0.18 * k); q.halo.material.opacity = T.LAMP.a * k; q.halo.scale.setScalar(T.LAMP.r * (0.9 + 0.1 * k)); q.halo.quaternion.copy(camera.quaternion); } }
  const benchGlow = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.6).rotateX(-Math.PI / 2), glowMat()); benchGlow.position.set(TK.x, 0.008, FRONT + 0.55); benchGlow.renderOrder = 1; scene.add(benchGlow);
  const bell = (k = 1) => { for (const [f, g, at] of [[1568, 0.13, 0], [2093, 0.1, 0.09], [3136, 0.05, 0.02]]) tone(f * k, f * k * 0.995, 0.9, { g, at }); };      // 다 섞임 종
  const plop = () => { sfx.splat(); tone(420, 150, 0.16, { g: 0.2 }); }, hic = () => { const k = C.voiceK(); tone(520 * k, 980 * k, 0.07, { type: 'triangle', g: 0.14 }); tone(900 * k, 640 * k, 0.05, { type: 'triangle', g: 0.08, at: 0.08 }); };   // 퐁당 · 딸꾹

  /** 물감 구름 한 덩이(x 자리에서 물 겉으로 들어온다). */
  function blob(c, x) { const q = blobs[blobNext]; blobNext = (blobNext + 1) % blobs.length; q.on = true; q.age = 0; q.c = c; q.col.copy(HEX[c]); q.x = clamp(x + rand(-0.06, 0.06), TK.x - HW + 0.2, TK.x + HW - 0.2); q.y = 0; q.z = rand(-0.22, 0.22); q.ph = rand(0, 6.28); q.r = rand(0.07, 0.11); q.a = 0.85; q.stay = false; q.depth = rand(0.45, 0.95); q.m.visible = true; }
  /** 수조에 물감을 붓는다(u 모금 · x 자리). 한 색뿐이면 저절로 다 퍼지고, 다른 색이 들어오면 따로 놀기 시작한다. */
  function pourIn(c, u, x) {
    if (K.drain) return; const fresh0 = INKS.reduce((n, k) => n + Math.abs(K.amt[k] - K.base[k]), 0); K.amt[c] += u; K.pourNow = c; K.pourT = 1.2; K.settle = 0;
    if (inksN() >= 2) K.mixed = K.mixed * fresh0 / (fresh0 + u); if (K.mixed < T.MIX_AT - 0.1) K.mixSaid = false;      // 이미 보이던 색은 그대로 두고, 새로 부은 만큼만 「아직 안 섞인 것」이 된다
    if ((K.plumeAcc += u) >= 0.12) { K.plumeAcc = 0; blob(c, x); } if (K.dive && K.dive.ph === 'swim') K.dive.gulp = c;
    if (tot() > T.OVER) overflow();
  }
  /** 젓는다(바퀴 수). 저은 만큼 섞이고, MIX_AT 을 넘는 순간 "Mix!", 물 전체가 한 색이 되면 종소리와 새 색 이름. */
  function stirBy(turns) {
    K.stirT = 0.35; if ((K.stirAcc += turns) > 0.25) { K.stirAcc = 0; hiss(0.16, { g: 0.05, f: rand(500, 800), q: 0.7 }); }      // 노 젓는 소리
    if (inksN() < 2 || K.mixed >= 1 || K.drain) return; const was = K.mixed; K.mixed = Math.min(1, K.mixed + turns / T.STIR_TURN);
    if (!K.mixSaid && was < T.MIX_AT && K.mixed >= T.MIX_AT) { K.mixSaid = true; voice.word(W.mix.text + '!', () => wordAt(vWord), { cls: W.mix.cls, by: 'tank' }); sfx.spark(false); }
    if (K.mixed >= 1) mixedDone();
  }
  const wordAt = out => out.set(TK.x, tankG.position.y + TK.h + 0.12, FRONT);
  function settleBase() { for (const c of INKS) K.base[c] = K.amt[c]; K.mixed = 1; for (const q of blobs) q.stay = false; }
  function mixedDone() {
    settleBase(); const n = nameOf(K.amt); K.pulse = 1; bell(); C.ask.act(); fx.spark(wordAt(v3), '#' + HEX[n].getHexString(), 26, 0.5, 2);
    if (D.says.some(q => q.w === n && /섞여/.test(q.when))) voice.word(W[n].text + '!', () => wordAt(vWord), { cls: W[n].cls, by: 'tank' });
    if (n === 'brown') { K.burp = { t: 0 }; seen.add('brownBurp'); }
    if (!K.gstir && !K.dive) run(tok => afterMix(tok, n)); else K.mixName = n;
  }
  /** 넘친다: "Splash!" — 물이 테두리를 넘어 실험대로 쏟아지고 OVER_SPILL 모금이 덜어진다. */
  function overflow() {
    const t0 = tot(), f = (t0 - T.OVER_SPILL) / t0; for (const c of INKS) { K.amt[c] *= f; K.base[c] *= f; } seen.add('overflow'); K.spillT = 2.6; K.pudT = 7; puddle.visible = true; puddle.material.color.copy(K.col); plop(); hiss(0.8, { g: 0.13, f: 2400 }); tone(180, 60, 0.35, { g: 0.25 }); stage.shake(T.SHAKE * 0.7);
    voice.word(W.splash.text + '!', () => wordAt(vWord), { cls: W.splash.cls, by: 'tank' });
    for (let i = 0; i < 34; i++) drop(v3.set(TK.x + rand(-1.5, 1.5), TK.h + 0.02, FRONT + 0.03), rand(-0.3, 0.3), rand(0.3, 1.6), rand(0.5, 1.8), K.col, 0, 0.055);
    if (!K.dive) run(async tok => { if (B.where === 'tank') await down(tok); s.target = null; gogo.lookAt(v3.set(TK.x, 0.1, FRONT + 0.5)); gogo.setMood('fluster', 2.6); say('oops'); await loopAct(tok, 'hopFeet', 2.3, 'fluster'); gogo.setMood('smile', 1.2); say('joy'); gogo.lookAt(camera.position); await wait(tok, 0.5); });
  }
  /** 꼭지를 연다: 물든 물이 빠지고(DRAIN) 맑은 물이 다시 찬다(REFILL). "Water."(이름) */
  function openDrain() { C.ask.touch(); if (K.drain) return; K.drain = { ph: 'out', u: 0 }; sfx.clink(); voice.word(W.water.text, () => vWord.copy(DR).setY(0.95), { name: true, by: 'drain' }); for (let i = 0; i < 6; i++) tone(270 - i * 24, 130 - i * 9, 0.15, { g: 0.12, at: i * 0.2 }); hiss(1.4, { g: 0.05, f: 420, q: 0.7 }); C.ask.act(); if (!B.tok) { gogo.lookAt(DR); gogo.setMood('wow', 1); } }
  function stepTank(dt) {
    const ty = tankG.position.y; K.settle += dt; if (K.pourT > 0) K.pourT -= dt; if (K.spillT > 0) K.spillT -= dt;
    if (K.drain) { const q = K.drain; q.u += dt; if (q.ph === 'out') { K.fill = 1 - 0.86 * ease(Math.min(1, q.u / T.DRAIN)); if (q.u >= T.DRAIN) { for (const c of INKS) K.amt[c] = K.base[c] = 0; K.mixed = 1; K.walked = 0; K.steps.clear(); K.shade = 0; for (const b of blobs) b.stay = false; q.ph = 'in'; q.u = 0; K.fill = 0.14 / T.TANK.water; hiss(1.4, { g: 0.06, f: 1800, q: 0.6 }); } }
      else { K.fill = (0.14 + (T.TANK.water - 0.14) * ease(Math.min(1, q.u / T.REFILL))) / T.TANK.water; if (q.u >= T.REFILL) { K.fill = 1; K.drain = null; seen.add('freshWater'); sfx.spark(true); } } }
    // 젓지 않아도 저절로: 한 색뿐이면 다 퍼지고, 둘이면 반까지만(구름이 가라앉아 말린 뒤에)
    const selfTo = inksN() < 2 ? 1 : T.SELF_MIX; if (K.mixed < selfTo && K.settle > T.PLUME.fall) { K.mixed = Math.min(selfTo, K.mixed + dt / T.PLUME.curl); if (K.mixed >= 1) settleBase(); } else if (inksN() < 2 && K.mixed >= 1 && K.settle > 0.2) settleBase();
    // 물 전체의 색: 색 띠 위를 초당 HUE_STEP 으로만 따라간다(눈이 놓치지 않게) · 짙기는 한 모금마다 한 걸음
    const g = goal(shown(), K.g); if (g.any) { if (K.shade < 0.03 || K.pale > 0.95) K.h = g.h; else { let d = g.h - K.h; if (d > 3) d -= 6; if (d < -3) d += 6; const st = clamp(d, -T.HUE_STEP * dt, T.HUE_STEP * dt); K.h = (K.h + st + 6) % 6; K.walked += Math.abs(st); if (K.walked >= 0.9) seen.add('hueWalk'); } }
    K.shade += clamp(g.shade - K.shade, -T.SHADE_K * dt, T.SHADE_K * dt); K.pale += clamp(g.pale - K.pale, -T.TINT_K * dt, T.TINT_K * dt); K.brown += clamp(g.brown - K.brown, -T.TINT_K * dt, T.TINT_K * dt);
    if (inksN() === 1 && K.mixed >= 1 && K.settle > 0.8) { const n = Math.min(5, Math.round(tot())); if (n >= 1 && Math.abs(K.shade - T.SHADE[n - 1]) < 0.02) { K.steps.add(n); if (K.steps.size >= T.SHADE.length) seen.add('shadeSteps'); } }
    bandCol(K.h, K.pale, K.brown, K.col); water.material.color.copy(CLEAR).lerp(K.col, clamp(K.shade / T.SHADE[0], 0, 1)).multiplyScalar(1 - T.DEEP * K.shade * (1 - K.pale * 0.6)); water.material.opacity = T.ALPHA[0] + (T.ALPHA[1] - T.ALPHA[0]) * K.shade;
    K.lv += (frac() - K.lv) * Math.min(1, 4 * dt); const hgt = IH * K.lv, near = clamp((tot() - (T.OVER - 3)) / 3, 0, 1), slosh = (near * 0.012 + (K.stirT > 0 ? 0.008 : 0.003)) * Math.sin(K.clock * (5 + near * 6));      // 테두리에 가까워지면 찰랑거린다
    water.scale.y = Math.max(0.01, hgt + slosh); top.position.y = T.BASE + hgt + slosh + 0.002; top.material.color.copy(WHITE).lerp(K.col, clamp(K.shade * 1.4, 0, 0.75)); top.rotation.z = slosh * 1.5;
    // 물감 구름: 가라앉으며 말리고(fall) 퍼진다(curl). 다른 색이 있으면 얼룩으로 남아 서로 다가가다, 만나는 자리부터 섞인 색이 번진다
    const ly = ty + T.BASE + hgt, mixing = inksN() >= 2 && K.mixed < 1; let nMeet = 0; if (mixing) { const a = K.amt; K.gcol.copy(HEX[nameOf({ red: a.red, yellow: a.yellow, blue: a.blue, white: 0 }) || 'white']).lerp(HEX.white, Math.min(0.7, a.white / tot())); }
    for (const q of blobs) { if (!q.on) continue; q.age += dt; const fall = Math.min(1, q.age / T.PLUME.fall), curl = clamp((q.age - T.PLUME.fall) / T.PLUME.curl, 0, 1);
      if (q.age < T.PLUME.fall + T.PLUME.curl && mixing) q.stay = true; q.y = -(1 - (1 - fall) ** 2) * q.depth * hgt * 0.8 + Math.sin(q.age * 1.3 + q.ph) * 0.04 * curl; q.x += Math.sin(q.age * 5 + q.ph) * 0.35 * dt * (1 - curl * 0.7) + (K.stirT > 0 ? Math.cos(K.clock * 6 + q.ph) * 1.2 * dt : 0);
      if (q.stay && mixing) { let ox = 0, on = 0; for (const o of blobs) if (o.on && o.stay && o.c !== q.c) { ox += o.x; on++; if (Math.abs(o.x - q.x) < 0.42) { nMeet++; q.col.lerp(K.gcol, Math.min(1, 1.2 * dt)); } } if (on) q.x += clamp(ox / on - q.x, -1, 1) * 0.42 * dt; q.a += (0.5 - q.a) * Math.min(1, 2 * dt); }
      else q.a -= dt * (q.age > T.PLUME.fall ? 0.85 / T.PLUME.curl : 0) + (q.stay && !mixing ? dt * 1.5 : 0);
      q.x = clamp(q.x, TK.x - HW + 0.15, TK.x + HW - 0.15); const r = q.r + (0.36 - q.r) * ease(curl); q.m.position.set(q.x, Math.max(ty + T.BASE + r * 0.5, ly + q.y - r * 0.4), TK.z + q.z); q.m.scale.set(r * 1.25, r, 0.2); q.m.material.color.copy(q.col); q.m.material.opacity = Math.max(0, q.a) * 0.75; if (q.a <= 0 || !K.here) { q.on = false; q.m.visible = false; } }
    if (mixing) { if (nMeet > 1 && !K.meet) { K.meet = true; seen.add('cloudMeet'); } } else K.meet = false;
    // 공기 방울(늘 올라간다 — 들어가면 이미 일이 벌어지고 있다)
    for (let i = 0; i < airN; i++) { const q = air[i]; q.y += q.v * dt / Math.max(hgt, 0.2); if (q.y > 1) { q.y = 0; q.x = rand(-1.4, 1.4); } const rr = q.r * (0.6 + 0.4 * q.y); airMesh.setMatrixAt(i, m4.makeScale(rr, rr, rr).setPosition(TK.x + q.x + Math.sin(K.clock * 2 + q.ph) * 0.03, ty + T.BASE + 0.03 + q.y * (hgt - 0.06), TK.z + q.z)); } airMesh.instanceMatrix.needsUpdate = true; airMesh.visible = K.vis > 0.5;
    if ((K.bubT -= dt) <= 0 && K.here) { K.bubT = rand(0.5, 1.4); tone(rand(500, 900), rand(900, 1400), 0.04, { g: 0.012 }); }      // 물속 보글
    // 갈색이 되면 바닥에서 큰 공기 방울이 꺼억 올라온다
    if (K.burp) { const q = K.burp; q.t += dt; const k = clamp(q.t / 1.3, 0, 1); burpM.visible = k < 1; burpM.position.set(TK.x + 0.3 + Math.sin(q.t * 7) * 0.05, ty + T.BASE + 0.15 + k * (hgt - 0.1), TK.z); burpM.scale.setScalar(0.1 + 0.2 * k); if (k >= 1) { K.burp = null; burpM.visible = false; tone(150, 62, 0.42, { type: 'sawtooth', g: 0.16 }); tone(110, 70, 0.3, { g: 0.2, at: 0.1 }); for (let i = 0; i < 8; i++) drop(v3.set(TK.x + 0.3, ly, TK.z), rand(-0.8, 0.8), rand(1, 2), rand(-0.2, 0.6), HEX.brown, ly - 0.05, 0.04); } }
    // 꼭지로 빠지는 물 · 대롱으로 차는 물 · 넘친 웅덩이 · 무지개
    drainS.k += ((K.drain && K.drain.ph === 'out' ? 1 : 0) - drainS.k) * Math.min(1, 10 * dt); drainS.a.set(DR.x + 0.02, ty + DR.y - 0.16, DR.z); drainS.col.copy(water.material.color); stream(drainS, v3.set(DR.x + 0.02, 0.02, DR.z), 1.6); if (drainS.k > 0.5 && Math.random() < dt * 20) drop(v3.set(DR.x, 0.05, DR.z), rand(-0.5, 0.5), rand(0.4, 1), rand(0, 0.6), drainS.col, 0, 0.03);
    fillS.k += ((K.drain && K.drain.ph === 'in' ? 1 : 0) - fillS.k) * Math.min(1, 10 * dt); fillS.a.set(TK.x + HW - 0.2, ty + TK.h + 0.02, TK.z); fillS.col.copy(CLEAR); stream(fillS, v3.set(TK.x + HW - 0.2, ly, TK.z), 1.6);
    if (puddle.visible) { K.pudT -= dt; K.pudK += ((K.pudT > 0 ? 1 : 0) - K.pudK) * Math.min(1, 2.5 * dt); puddle.scale.set(1.9 * K.pudK + 0.01, 1, 0.5 * K.pudK + 0.01); puddle.material.opacity = 0.75 * Math.min(1, K.pudK * 1.5); if (K.pudT <= 0 && K.pudK < 0.03) puddle.visible = false; }
    if (K.bowT > 0 || K.bowK > 0.01) { K.bowT -= dt; K.bowV += (60 * ((K.bowT > 0 ? 1 : 0) - K.bowK) - 9 * K.bowV) * dt; K.bowK = Math.max(0, K.bowK + K.bowV * dt); bow.visible = K.bowK > 0.01; bow.scale.setScalar(Math.max(0.001, K.bowK)); }
    for (let i = 0; i < DROPS; i++) { const d = drops[i]; if (d.life <= 0) continue; d.life -= dt; d.v.y -= 9 * dt; d.p.addScaledVector(d.v, dt); if (d.p.y < d.floor || d.life <= 0) { d.life = 0; dropMesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); } else dropMesh.setMatrixAt(i, m4.makeScale(d.r, d.r * (1 + Math.min(1.2, Math.abs(d.v.y) * 0.12)), d.r).setPosition(d.p)); } dropMesh.instanceMatrix.needsUpdate = true;
    // 방을 물들이는 빛
    const key = K.shade < 0.05 ? '' : nameNow(); if (key !== K.glowKey) { if (key && K.here && K.vis > 0.9) { seen.add('roomGlow'); K.pulse = Math.max(K.pulse, 0.5); if (!B.tok && !K.dive) gogo.setMood('wow', 0.7); } K.glowKey = key; }      // 색이 한 걸음 옮겨 갈 때마다 고고의 눈이 커진다
    K.pulse = Math.max(0, K.pulse - dt * 1.4); K.glowK += ((0.4 + 0.6 * K.shade) * ease(K.vis) - K.glowK) * Math.min(1, 3 * dt); K.glowC.lerp(water.material.color, Math.min(1, 3 * dt)); const gk = K.glowK * (1 + 0.05 * Math.sin(K.clock * 5.3) + K.pulse * 0.7), mx = Math.max(K.glowC.r, K.glowC.g, K.glowC.b, 0.01);
    cTmp.setRGB((K.glowC.r / mx) ** T.GLOW.SAT, (K.glowC.g / mx) ** T.GLOW.SAT, (K.glowC.b / mx) ** T.GLOW.SAT); glow.color.copy(cTmp); glow.intensity = T.GLOW.power * gk; wallGlow.material.color.copy(cTmp); wallGlow.material.opacity = T.GLOW.wall * gk; benchGlow.material.color.copy(cTmp); benchGlow.material.opacity = T.GLOW.bench * gk; stoneGlow.material.color.copy(cTmp); stoneGlow.material.opacity = T.GLOW.stone * gk; wallGlow.visible = benchGlow.visible = stoneGlow.visible = gk > 0.01;
  }

  // ───────────────────────── 병 걸이와 병 넷 ─────────────────────────
  const railG = new THREE.Group(); railG.add(M.rail); railG.position.set(0, T.RAIL.y + T.RAIL_UP, T.RAIL.z); scene.add(railG);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#e4f6ff', transparent: true, opacity: 0.2, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 2.2 });
  const bottles = {}; INKS.forEach((c, i) => {
    const g = new THREE.Group(), gl = M['glass_' + c], lq = M['liq_' + c]; gl.material = glassMat; gl.castShadow = false; gl.renderOrder = 6; lq.material = new THREE.MeshStandardMaterial({ color: D.colors.hex[c], roughness: 0.22, emissive: D.colors.hex[c], emissiveIntensity: 0.35 }); lq.castShadow = false;
    g.add(lq, gl, M['band_' + c], M['cork_' + c]); scene.add(g);
    bottles[c] = { c, obj: g, cork: M['cork_' + c], home: new THREE.Vector3(T.RAIL.xs[i], T.RAIL.y - 0.07, T.RAIL.z), pos: new THREE.Vector3(T.RAIL.xs[i], T.RAIL.y + T.RAIL_UP, T.RAIL.z), to: new THREE.Vector3(), state: 'rest', tilt: 0, tiltTo: 0, dir: i < 2 ? 1 : -1, sw: 0, swV: 0, sip: null, lastX: T.RAIL.xs[i], glugT: 0, poured: 0, named: false, demo: false };
  });
  const BL = Object.values(bottles), mouthOf = (b, out) => out.set(b.pos.x + Math.sin(b.obj.rotation.z) * 0.1, b.pos.y - Math.cos(b.obj.rotation.z) * 0.1, b.pos.z);
  function grabBottle(b) { b.byGogo = false; b.cork.visible = false; sfx.pop(); tone(900, 1500, 0.05, { g: 0.06 }); b.swV += 3; b.poured = 0; b.named = false; B.idle = 0; }      // 코르크 뽁
  /** 병이 스스로 u 모금을 붓고 돌아온다(누르기 한 번 = 한 모금). x = 붓는 자리(없으면 걸린 자리에서). */
  function sipAuto(c, u = T.SIP, x) { const b = bottles[c]; if (!b || b.state === 'held' || b.state === 'sip') return false; grabBottle(b); b.state = 'sip'; b.sip = { left: u, t: 0, x: x ?? b.home.x, rate: u <= T.SIP ? T.SIP / T.SIP_SEC : T.POUR }; return true; }
  function stepBottles(dt) {
    let pouring = null; if ((K.swayT -= dt) <= 0) { K.swayT = rand(1.2, 2.4); const b = BL[Math.floor(Math.random() * 4)]; if (b.state === 'rest') b.swV += rand(-1, 1) * 1.3; }      // 병 넷은 늘 살랑살랑 흔들린다
    for (const b of BL) {
      b.home.y = railG.position.y - 0.07; let k = 8;
      if (b.state === 'held') { if (stage.worldOn(plane, P.x, P.y, v3)) b.to.set(clamp(v3.x, TK.x - HW + 0.15, TK.x + HW - 0.15), Math.max(v3.y + 0.35, TK.h + 0.5), TK.z); k = 22; b.tiltTo = K.moved || K.downT > T.TAP_S ? 1 : 0; }
      else if (b.state === 'sip') { const q = b.sip; q.t += dt; b.to.set(q.x, b.home.y - 0.12, TK.z); k = 11; if (b.pos.distanceTo(b.to) < 0.1 || q.t > 1) b.tiltTo = q.left > 0 ? 1 : 0; if (q.left <= 0 && b.tilt < 0.25) { b.state = 'back'; b.sip = null; } }
      else { b.to.copy(b.home); b.tiltTo = 0; if (b.state === 'back' && b.pos.distanceTo(b.home) < 0.04) { b.state = 'rest'; b.cork.visible = true; sfx.tick(); } if (b.state === 'rest') k = 30; }
      b.pos.lerp(b.to, 1 - Math.exp(-k * dt)); b.tilt += clamp(b.tiltTo - b.tilt, -dt / 0.2, dt / 0.2);
      const vx = (b.pos.x - b.lastX) / Math.max(dt, 1e-4); b.lastX = b.pos.x; b.swV += (-60 * b.sw - 4 * b.swV) * dt - clamp(vx, -6, 6) * 1.6 * dt; b.sw += b.swV * dt;
      b.obj.position.copy(b.pos); b.obj.rotation.z = -b.dir * ease(b.tilt) * 2.05 + clamp(b.sw, -0.5, 0.5) * (1 - b.tilt);
      if (K.mime && (K.mime === b.c || (K.mime === 'pink' && (b.c === 'red' || b.c === 'white'))) && b.state === 'rest' && Math.abs(b.swV) < 0.4) b.swV += 2.2;
      if (b.tilt > 0.9 && K.here && (b.state === 'held' || (b.state === 'sip' && b.sip.left > 0))) {
        const u = Math.min((b.state === 'sip' ? b.sip.rate : T.POUR) * dt, b.state === 'sip' ? b.sip.left : 9); if (b.state === 'sip') b.sip.left -= u; b.poured += u; pouring = b; mouthOf(b, pourS.a); pourS.col.copy(HEX[b.c]); pourIn(b.c, u, pourS.a.x); if (b.byGogo) K.demo[b.c] += u;
        if (!b.named) { b.named = true; voice.word(W[b.c].text, () => v3c.copy(b.pos).setY(b.pos.y + 0.15), { name: true, cls: 'name ' + W[b.c].cls, by: 'bottle' }); if (!b.demo) C.ask.act(); b.demo = false; }      // 부을 때 그 색 이름
        if ((b.glugT -= dt) <= 0) { b.glugT = rand(0.09, 0.15); tone(rand(300, 430), rand(170, 240), 0.08, { g: 0.05 }); hiss(0.06, { g: 0.03, f: 1600, q: 1.2 }); }      // 조르륵
      }
    }
    pourS.k += ((pouring ? 1 : 0) - pourS.k) * Math.min(1, 14 * dt); stream(pourS, v3b.set(pourS.a.x, levelY(), TK.z)); return pouring;
  }

  // ───────────────────────── 젓는 노 · 꼭지 ─────────────────────────
  const padG = new THREE.Group(); padG.add(M.paddle); scene.add(padG); const PD = { top: new THREE.Vector3(TK.x - HW - 0.32, 1.5, TK.z - 0.2), tip: new THREE.Vector3(TK.x - HW - 0.3, 0, TK.z - 0.2), tt: new THREE.Vector3(), tp: new THREE.Vector3(), ang: 0 };
  M.spigot.position.set(TK.w / 2 - 0.02, DR.y, DR.z - TK.z); M.spigot.rotation.y = Math.PI / 2; M.spigot_handle.position.set(TK.w / 2 + 0.16, DR.y + 0.02, DR.z - TK.z + 0.1); M.pipe.position.set(HW - 0.2, TK.h + 0.1, 0); tankG.add(M.spigot, M.spigot_handle, M.pipe);
  function stepPaddle(dt) {
    const ly = levelY(); let k = 6;
    if (K.gstir) { PD.ang += dt * T.GOGO_STIR * 6.283; PD.tt.set(s.pos.x + 0.42, s.y + 0.78 * s.size, TK.z + 0.05); PD.tp.set(s.pos.x + 0.75 + Math.cos(PD.ang) * 0.32, ly - 0.5 + Math.sin(PD.ang) * 0.16, TK.z + Math.sin(PD.ang) * 0.2); k = 12; stirBy(T.GOGO_STIR * dt); }
    else if (K.rub) { PD.tp.set(K.rub.x, clamp(K.rub.y, tankG.position.y + T.BASE + 0.2, ly - 0.05), TK.z); PD.tt.set(K.rub.x + 0.2, TK.h + 0.75, TK.z); k = 20; }
    else { PD.tt.set(TK.x - HW - 0.32, tankG.position.y + 1.5, TK.z - 0.2); PD.tp.set(TK.x - HW - 0.3, tankG.position.y, TK.z - 0.2); }
    PD.top.lerp(PD.tt, 1 - Math.exp(-k * dt)); PD.tip.lerp(PD.tp, 1 - Math.exp(-k * dt)); padG.position.copy(PD.top); padG.quaternion.setFromUnitVectors(DOWN, v3c.subVectors(PD.tip, PD.top).normalize()); M.spigot_handle.rotation.z += (K.drain ? 7 : 0) * dt;
  }

  // ───────────────────────── 퐁당: 물건이 뛰어들어 물든다 · 고고가 뛰어들어 헤엄친다 ─────────────────────────
  const canDunk = t => t !== GOGO && (t.state === 'home' || t.state === 'up' || t.state === 'down') && !K.dunks.some(d => d.t === t), topH = t => (t.ball ? t.r * 2 : t.h) * t.size;
  const gapFor = (w, who) => { const g = K.lastBy[w] && K.lastBy[w] !== who ? T.OTHER_GAP : undefined; K.lastBy[w] = who; return g; };
  /** 물드는 순간의 한마디(자료 says 가 「물들 때」라고 적은 색만). */
  function dyeWord(t, n) { if (D.says.some(q => q.w === n && /물들 때/.test(q.when))) voice.word(W[n].text + '!', () => topOf(t, vWord), { cls: W[n].cls, by: t.name, gap: gapFor(n, t.name) }); }
  function dunk(t, demo) { if (!canDunk(t)) return false; const side = t.home.x < TK.x ? -1 : 1, n = K.dunks.filter(d => (d.t.home.x < TK.x ? -1 : 1) === side).length; K.dunks.push({ t, ph: 'in', u: 0, x0: t.x, z0: t.z, y0: t.y, x: TK.x + side * (0.95 - n * 0.55), demo, name: null, flip: t.size >= T.BIG_HALF && t.dyeHalf && t.color === nameNow() }); sfx.grab(); B.idle = 0; if (!demo) C.ask.act(); return true; }
  function stepDunks(dt) {
    for (let i = K.dunks.length - 1; i >= 0; i--) { const d = K.dunks[i], t = d.t, th = topH(t), big = t.size >= T.BIG_HALF, small = t.size <= T.DUNK_SMALL, ly = levelY(), fl = tankG.position.y + T.BASE + 0.03; d.u += dt; if (t.ball) t.vx = 0;
      const rest = (small ? ly - th * 0.62 : big ? Math.max(fl, ly - th * 0.5) : Math.max(fl, ly - th - 0.3)) + (t.ball ? 0 : 0);
      if (d.ph === 'in') { const k = Math.min(1, d.u / T.DUNK.in), e = ease(k); t.x = d.x0 + (d.x - d.x0) * e; t.z = d.z0 + (TK.z - d.z0) * e; t.y = d.y0 + (rest - d.y0) * k + (TK.h + 0.5 - Math.min(d.y0, rest)) * 4 * k * (1 - k) * 0.62; if (d.flip) { t.mesh.rotation.z = Math.PI * e; if (!t.ball) t.mesh.position.y = t.h * e; }
        if (k >= 1) { d.ph = 'soak'; d.u = 0; plop(); for (let j = 0; j < 9; j++) drop(v3.set(t.x, ly, TK.z), rand(-1, 1), rand(1.2, 2.4), rand(-0.2, 0.7), water.material.color, ly - 0.05, 0.04); if (!B.tok && !K.dive) { gogo.lookAt(v3.set(t.x, ly - 0.3, FRONT)); gogo.setMood('wow', 0.8); } } }
      else if (d.ph === 'soak') { t.y += (rest + Math.sin(d.u * 5) * 0.03 - t.y) * Math.min(1, 6 * dt); if (small) t.x += Math.sin(d.u * 2.2) * 0.25 * dt; t.tvx += Math.sin(d.u * 4) * dt * 5;
        if (d.name === null && d.u >= T.DUNK.soak) { const n = K.shade > 0.05 ? nameNow() : ''; d.name = n; if (!n) { t.color = 'own'; t.dyeHalf = false; } else if (big && !d.flip) { t.color = n; t.dyeHalf = true; seen.add('bigHalf'); } else { t.color = n; t.dyeHalf = false; } if (n && small) seen.add('floatSmall'); if (n) fx.spark(centerOf(t, v3), '#' + HEX[n].getHexString(), 10, 0.25, 1.2); }
        if (d.u >= T.DUNK.soak + (small ? T.FLOAT_MORE : 0.25)) { d.ph = 'out'; d.u = 0; d.y1 = t.y; d.x1 = t.x; sfx.pop(); } }
      else { const k = Math.min(1, d.u / T.DUNK.out), e = ease(k); t.x = d.x1 + (t.home.x - d.x1) * e; t.z = TK.z + (t.home.z - TK.z) * e; t.y = d.y1 * (1 - k) + (TK.h + 0.45 - d.y1 * 0.5) * 4 * k * (1 - k) * 0.62; if (d.flip) { t.mesh.rotation.z = Math.PI * (1 - e); if (!t.ball) t.mesh.position.y = t.h * (1 - e); }
        if (k >= 1) { t.y = 0; t.floor = 0; t.vy = 0; t.v += 2; K.dunks.splice(i, 1); sfx.bounce(0.4); if (d.name) { dyeWord(t, d.name); tone(880, 1320, 0.12, { type: 'triangle', g: 0.08 }); rainbowCheck(); for (let j = 0; j < 6; j++) drop(topOf(t, v3), rand(-1, 1), rand(0.5, 1.5), rand(-0.3, 0.6), HEX[d.name], 0, 0.035); if (!B.tok && !K.dive && !d.demo) run(tok => compare(tok, t)); } continue; } }
      t.floor = t.y; t.vy = 0; }
    // 고고: 뛰어들고(dive) → 헤엄치고(swim — 물속에서 그 색이 된다) → 나와서 몸을 턴다
    const d = K.dive; if (!d) return; d.u += dt; s.target = null; const ly = levelY(), sy = Math.max(tankG.position.y + T.BASE + 0.05, ly - 0.85 * s.size);
    if (d.ph === 'in') { const k = Math.min(1, d.u / T.DUNK.in), e = ease(k); s.pos.x = d.x0 + (TK.x - 0.55 - d.x0) * e; s.pos.z = d.z0 + (TK.z - d.z0) * e; s.y = sy * k + (TK.h + 0.55) * 4 * k * (1 - k) * 0.62; s.heading = Math.PI * 0.5 * e;
      if (k >= 1) { d.ph = 'swim'; d.u = 0; plop(); gogo.act('swim'); for (let j = 0; j < 12; j++) drop(v3.set(s.pos.x, ly, TK.z), rand(-1.2, 1.2), rand(1.2, 2.6), rand(-0.2, 0.8), water.material.color, ly - 0.05, 0.045); if (K.dives++ % 3 === 0) voice.word(W.splash.text + '!', () => wordAt(vWord), { cls: W.splash.cls, by: 'gogo' }); } }
    else if (d.ph === 'swim') { const a = d.u * 1.7; s.pos.x = TK.x - 0.55 + (1 - Math.cos(a)) * 0.55; s.heading = Math.sin(a) >= 0 ? Math.PI / 2 : -Math.PI / 2; s.y = sy + Math.sin(d.u * 3) * 0.06; gogo.setMood(d.gulp ? 'wow' : 'joy', 0.3);
      if (d.name === null && d.u >= T.DUNK.soak) { const n = K.shade > 0.05 ? nameNow() : ''; d.name = n; GOGO.color = n || 'own'; GOGO.dyeHalf = false; if (n) dyeWord(GOGO, n); }
      if (d.u >= T.SWIM) { d.ph = 'out'; d.u = 0; d.y1 = s.y; d.x1 = s.pos.x; if (s.act && s.act.name === 'swim') s.act = null; sfx.pop(); } }
    else { const k = Math.min(1, d.u / T.DUNK.out), e = ease(k); s.pos.x = d.x1 + (T.PLACE.gogo[0] - d.x1) * e; s.pos.z = TK.z + (T.PLACE.gogo[1] - TK.z) * e; s.y = d.y1 * (1 - k) + (TK.h + 0.5) * 4 * k * (1 - k) * 0.62; s.heading *= 1 - e;
      if (k >= 1) { s.y = 0; s.heading = 0; K.dive = null; B.where = 'bench'; sfx.thud(s.size * 0.6); run(tok => afterDive(tok, d)); } }
  }
  /** 고고가 뛰어든다(누르기 한 번). */
  function dive(demo) { if (K.dive || B.hop) return false; brain.stop(); K.gstir = false; if (s.act) s.act = null; K.dive = { ph: 'in', u: 0, x0: s.pos.x, z0: s.pos.z, name: null, gulp: null }; B.where = 'tank'; gogo.act('dive'); say('joy'); if (!demo) C.ask.act(); return true; }
  function rainbowCheck() {
    const cs = Object.values(things).map(t => t.color), ok = cs.every(c => c !== 'own') && new Set(cs).size >= T.RAINBOW; if (!ok) { K.bowOn = false; return; } if (K.bowOn) return;
    K.bowOn = true; K.bowT = T.RAINBOW_STAY; K.bowV = 3; seen.add('rainbow'); for (let i = 0; i < 6; i++) tone(784 * 1.189 ** i, 784 * 1.189 ** i, 0.5, { g: 0.09, at: 0.4 + i * 0.11 });
    if (!K.dive) run(async tok => { if (B.where === 'tank') await down(tok); await wait(tok, 0.3); s.target = null; s.faceTo = 0; gogo.lookAt(v3.set(-0.35, 3.4, -1.6)); gogo.act('cheer', { mood: 'joy' }); say('joy'); await wait(tok, len('cheer') + 0.1); gogo.act('jump', { mood: 'joy' }); await wait(tok, 1); gogo.lookAt(camera.position); });
  }

  // ───────────────────────── 고고가 하고 싶은 일 ─────────────────────────
  async function loopAct(tok, n, secs, pose) { gogo.act(n); if (!has(n) && pose) gogo.pose(pose, 1); try { await wait(tok, secs); } finally { if (s.act && s.act.name === n) s.act = null; if (pose) gogo.pose(pose, 0); } }
  /** 수조 위에서 내려온다. */
  async function down(tok) { if (B.hop) await until(tok, () => !B.hop); if (B.where !== 'tank' || K.dive) return; brain.hop(T.PLACE.gogo[0], T.PLACE.gogo[1], 0, 'bench', 0.5); await until(tok, () => !B.hop); }
  /** 색이 둘이 되면 수조 왼쪽 끝에 올라 긴 노로 젓는다 → 물 전체가 한 색이 되면 두 팔을 번쩍. */
  async function gogoStir(tok) {
    if (B.where !== 'tank') { if (B.where !== 'bench') await C.toBench(tok); brain.hop(TK.x - HW + 0.05, TK.z + 0.1, TK.h - 0.02, 'tank', 0.5); await until(tok, () => !B.hop); } s.faceTo = Math.PI / 2; gogo.lookAt(v3.set(TK.x, levelY() - 0.3, TK.z)); K.mixName = null;
    K.gstir = true; try { gogo.act('stir'); if (!has('stir')) gogo.pose('reach', 1); await until(tok, () => K.mixed >= 1 || inksN() < 2, 4); } finally { K.gstir = false; if (s.act && s.act.name === 'stir') s.act = null; gogo.pose('reach', 0); }
    s.faceTo = 0; await afterMix(tok, K.mixName); await down(tok); gogo.lookAt(camera.position);
  }
  /** 다 섞여 새 색이 되면 두 팔을 번쩍. 갈색에는 코를 쥔다. */
  async function afterMix(tok, n) {
    s.target = null; if (n === 'brown') { gogo.act('noseHold'); gogo.setMood('stuffy', len('noseHold') + 1); say('yuck'); await wait(tok, len('noseHold') + 0.8); }
    else if (n) { gogo.act('cheer', { mood: 'joy' }); say('joy'); await wait(tok, len('cheer')); } gogo.lookAt(camera.position);
  }
  /** 물에서 나와 몸을 턴다(그 색 방울이 튄다). 헤엄치다 물을 삼켰으면 딸꾹질마다 그 색 방울. */
  async function afterDive(tok, d) {
    s.target = null; s.faceTo = 0; gogo.act('shake'); if (!has('shake')) gogo.pose('sway', 1); K.shakeT = len('shake'); K.shakeCol = d.name ? HEX[d.name] : CLEAR; if (d.name) seen.add('gogoDive'); say('dizzy'); await wait(tok, len('shake')); gogo.pose('sway', 0);
    if (d.gulp) for (let i = 0; i < T.HICCUPS; i++) { gogo.act('hiccup'); gogo.setMood('wow', 0.35); s.sizeV += 1.5; hic(); seen.add('gulpHiccup'); v3.set(s.pos.x, s.y + 0.6 * s.size, s.pos.z + 0.3 * s.size); for (let j = 0; j < 4; j++) drop(v3, rand(-0.5, 0.5), rand(1.2, 2.2), rand(0.6, 1.4), HEX[d.gulp], 0, 0.05); await wait(tok, 0.75); }
    gogo.setMood('joy', 1.2); say('joy'); gogo.lookAt(camera.position); await wait(tok, 0.5);
  }
  /** 물든 물건을 제 팔과 견주어 본다. */
  async function compare(tok, t) {
    await wait(tok, 0.3); if (B.where === 'tank') await down(tok); const side = s.pos.x >= t.x ? 1 : -1; await walk(tok, t.x + side * (t.r * t.size + 0.42 * s.size + 0.1), clamp(t.z + 0.15, BENCH.Z0, BENCH.Z1)); await face(tok, Math.atan2(t.x - s.pos.x, t.z - s.pos.z));
    gogo.lookAt(centerOf(t, v3)); gogo.setMood('wow', 0.8); say('hm'); await wait(tok, 0.6); gogo.pose('hands', 1); await wait(tok, 0.8); gogo.pose('hands', 0); seen.add('compare'); if (GOGO.color === t.color) { gogo.act('jump', { mood: 'joy' }); say('joy'); } await wait(tok, 0.7); await walk(tok, T.PLACE.gogo[0], T.PLACE.gogo[1]); await face(tok, 0); gogo.lookAt(camera.position);
  }
  /** 가만두면 유리에 얼굴을 대고 공기 방울을 눈으로 따라가다 유리를 톡톡 친다(낱말은 나오지 않는다 — 아이가 한 일이 아니므로 붓지는 않는다). */
  async function idlePlay(tok) {
    await walk(tok, rand(-0.9, 0.9), FRONT + 0.45); await face(tok, Math.PI); seen.add('idleWatch'); for (let i = 0; i < 3; i++) { const q = air[i * 3]; gogo.lookAt(v3.set(TK.x + q.x, levelY() - 0.3, TK.z)); await wait(tok, 0.8); } gogo.pose('poke', 1); sfx.tick(); await wait(tok, 0.5); gogo.pose('poke', 0);
    await walk(tok, T.PLACE.gogo[0], T.PLACE.gogo[1]); await face(tok, 0); gogo.lookAt(camera.position);
  }

  // ───────────────────────── 첫 손길(설계 0장 · 자료 first) ─────────────────────────
  // 해 보이기: 파랑 한 모금("Blue") → 손을 쉬면 다른 것으로(사과를 퐁당 → "Blue!" · 빨강 한 모금 → 고고가 저어 "Mix!" …). 내밀기: 나머지 병을 흔들고 아이를 본다. 빛 고리: 노랑 병.
  const SHOW = ['sip:blue', 'dunk:apple', 'sip:red', 'dunk:cup', 'dunk:ball', 'sip:yellow', 'dunk:chair'];
  const first = { done: false, showing: false,
    show(n) { const [k, a] = SHOW[n % SHOW.length].split(':'); first.done = false; first.showing = true;
      run(async tok => { try { if (B.where === 'tank') await down(tok); s.target = null;
        if (k === 'sip') { const b = bottles[a]; gogo.lookAt(b.pos); gogo.act('reachJump', { mood: 'joy' }); say('hm'); await wait(tok, 0.3); if (sipAuto(a)) b.demo = b.byGogo = true; await until(tok, () => b.named, 2); first.done = true; gogo.lookAt(v3.set(b.home.x, levelY() - 0.2, FRONT)); await wait(tok, 1.2); }
        else { const t = things[a]; gogo.lookAt(centerOf(t, v3)); gogo.pose('poke', 1); await wait(tok, 0.3); gogo.pose('poke', 0); if (dunk(t, true)) await until(tok, () => !K.dunks.some(d => d.t === t), 3); first.done = true; await wait(tok, 0.3); }
        for (const b of BL) if (b.state === 'rest' && b.c !== a) b.swV += rand(2, 3) * (Math.random() < 0.5 ? -1 : 1); sfx.clink(); gogo.act('surprise', { mood: 'smile' }); s.faceTo = 0; gogo.lookAt(camera.position); await wait(tok, 0.6); if (Math.hypot(s.pos.x - T.PLACE.gogo[0], s.pos.z - T.PLACE.gogo[1]) > 0.3) { await walk(tok, T.PLACE.gogo[0], T.PLACE.gogo[1]); await face(tok, 0); gogo.lookAt(camera.position); } } finally { first.showing = false; } }); },
    ready: () => first.done,
    pick: () => bottles[['yellow', 'red', 'white', 'blue'].find(c => K.amt[c] < 0.5 && bottles[c].state === 'rest') || 'yellow'],
    ring() { const b = first.pick(); return K.vis < 1 ? null : vRing.copy(b.pos).setY(b.pos.y - 0.36); }, r: () => 0.46 };

  /** 자동 확인 명령이 넘겨받는다: 고고가 해 보이느라 부은 물감은 걷고(명령이 바라는 물에서 시작하게), 해 보이던 일은 그 자리에서 그친다. 진짜 손길은 걷지 않는다 — 고고가 부은 파랑에 아이의 노랑이 얹혀 초록이 된다. */
  function takeOver() {
    C.ask.touch(); if (C.first) C.first.touch(); const u = INKS.reduce((n, c) => n + K.demo[c], 0); for (const b of BL) if (b.byGogo && b.sip) { b.sip.left = 0; b.byGogo = false; }
    if (u > 0) { for (const c of INKS) { K.amt[c] = Math.max(0, K.amt[c] - K.demo[c]); K.base[c] = Math.min(K.base[c], K.amt[c]); K.demo[c] = 0; } if (tot() < 0.02) { K.shade = 0; K.mixed = 1; settleBase(); K.walked = 0; K.steps.clear(); } for (const q of blobs) { q.on = false; q.m.visible = false; } }
    if (first.showing) { brain.stop(); first.showing = false; }
  }
  // ───────────────────────── 손 ─────────────────────────
  const px = () => { const a = stage.screenOf(v3.set(0, 1, 0)), b = stage.screenOf(v3b.set(1, 1, 0)); return Math.abs(b.x - a.x); };
  function onDown(e) {
    const x = e.clientX, y = e.clientY, u = px(), near = (p, rx, ry = rx) => { const c = stage.screenOf(p); return Math.abs(c.x - x) < rx && Math.abs(c.y - y) < ry; }; K.downT = 0; K.moved = false; K.x0 = x; K.y0 = y; B.idle = 0; K.press = null; for (const c of INKS) K.demo[c] = 0;
    const furn = K.vis >= 0.6, t = pickAt(stage, targets.filter(q => !K.dunks.some(d => d.t === q) && !(q === GOGO && (K.dive || B.where === 'tank'))), x, y);
    if (furn) for (const b of BL) if (b.state !== 'sip' && near(v3.copy(b.pos).setY(b.pos.y - 0.36), 0.3 * u + 8, 0.42 * u + 8)) { P.mode = 'bottle'; K.press = b; b.state = 'held'; grabBottle(b); return; }
    if (furn && near(v3.copy(DR).setX(DR.x - 0.06), 0.27 * u + 8)) { P.mode = 'drain'; openDrain(); return; }
    if (t) { P.mode = 'thing'; K.press = t; if (t !== GOGO) C.touch(t); else sfx.tick(); return; }
    if (furn && stage.worldOn(plane, x, y, v3) && Math.abs(v3.x - TK.x) < HW + 0.1 && v3.y > T.BASE && v3.y < TK.h + 0.1) { P.mode = 'rub'; K.rub = { x: v3.x, y: v3.y }; sfx.tick(); return; }
    P.mode = 'walk'; if (stage.worldOn(C.benchPlane, x, y, v3) && !K.dive && B.where !== 'tank') C.tapBench(v3.x, Math.max(v3.z, FRONT + 0.35));
  }
  function onMove(e) {
    const x = e.clientX, y = e.clientY; if (!K.moved && Math.hypot(x - K.x0, y - K.y0) > T.TAP_PX) K.moved = true;
    if (P.mode === 'rub' && K.rub && stage.worldOn(plane, x, y, v3)) rubTo(clamp(v3.x, TK.x - HW + 0.2, TK.x + HW - 0.2), v3.y);
  }
  /** 수조를 문지른다: 움직인 길이만큼 저어진다(반지름 0.5 의 원 한 바퀴 = 한 바퀴). */
  function rubTo(x, y) { const d = Math.hypot(x - K.rub.x, y - K.rub.y); K.rub.x = x; K.rub.y = y; if (d > 1e-4) { stirBy(Math.min(d, 0.6) / 3.14); if (inksN() >= 2 && !K.rub.act) { K.rub.act = true; C.ask.act(); } } }
  function onUp() {
    const quick = !K.moved && K.downT < T.TAP_S;
    if (P.mode === 'bottle') { const b = K.press; if (b.state === 'held') { b.state = 'back'; if (quick && b.poured <= 0) { b.cork.visible = true; sipAuto(b.c); } } }      // 누르기만 했으면 한 모금
    else if (P.mode === 'thing') { const t = K.press; if (t === GOGO) dive(); else if (t) dunk(t); }                                                                // 누르면 스스로 뛰어든다
    K.rub = null; K.press = null; if (!B.tok && !K.dive) gogo.lookAt(camera.position);
  }

  // ───────────────────────── 매 장면 ─────────────────────────
  function step(dt) {
    K.clock += dt; if (P.down) K.downT += dt; const gs = s.size;
    if (K.enterT < 2 && (K.enterT += dt) >= 1.15 && !K.arrived) { K.arrived = true; if (B.tok && s.target && !C.nofirst) brain.stop(); }      // 들어와 제자리로 걸어가는 길이 길면 해 보이기가 늦는다 — 걷던 채로 일을 비워, 가는 길에 바로 해 보이게 한다
    const pouring = stepBottles(dt); stepPaddle(dt); stepDunks(dt);
    for (const t of Object.values(things)) { t.lit = false; stepThing(t, dt); }
    stepTank(dt); if (K.stirT > 0) K.stirT -= dt; stepLamps(dt);
    // 고고의 눈길: 붓는 줄기와 퍼지는 구름을 따라간다
    if (!B.tok && !K.dive) { let look = true; if (pouring) gogo.lookAt(v3.set(pourS.a.x, levelY() - 0.2, FRONT)); else if (K.settle < T.PLUME.fall + T.PLUME.curl && K.pourT > 0) gogo.lookAt(v3.set(pourS.a.x + Math.sin(K.clock * 2) * 0.3, levelY() - 0.5, FRONT)); else if (K.rub) gogo.lookAt(PD.tip); else look = false; if (K.look && !look) gogo.lookAt(camera.position); K.look = look; } else K.look = false;
    if (K.shakeT > 0) { K.shakeT -= dt; if (Math.random() < dt * 34) { const a = rand(0, 6.28); drop(v3.set(s.pos.x + Math.cos(a) * 0.3 * gs, s.y + rand(0.3, 0.95) * gs, s.pos.z + Math.sin(a) * 0.3 * gs), Math.cos(a) * rand(1, 2.4), rand(0.6, 2), Math.sin(a) * rand(1, 2.4), K.shakeCol, 0, 0.04); } }
    // 색이 둘이 되면 고고가 노를 들고 와 젓는다(누르기만 하는 아이도 "Mix!" 까지 간다)
    const free = !B.tok && !K.dive && !P.down && K.vis >= 1 && !C.moving() && !B.hop && !(s.act && s.act.lock);
    if (free && inksN() >= 2 && K.mixed < 1 && K.settle > T.STIR_SETTLE && !pouring) run(gogoStir); else if (free && B.where === 'tank' && !K.gstir) run(down);
    // 부딪힘: 수조와 물건을 비켜 간다
    if (B.where === 'bench' && !B.hop && !K.dive) { if (s.pos.z < FRONT + 0.3 * gs && Math.abs(s.pos.x - TK.x) < HW + 0.3) s.pos.z = FRONT + 0.3 * gs;
      for (const t of Object.values(things)) { if (t.y > 0.3 || t.state === 'fall' || t.state === 'gone') continue; const dx = s.pos.x - t.x, dz = s.pos.z - t.z, d = Math.hypot(dx, dz) || 0.001, need = 0.3 * gs + t.r * t.size * 0.85; if (d < need) { if (t.ball) t.vx -= dx / d * 3 * dt * 8; s.pos.x += dx / d * (need - d); s.pos.z = clamp(s.pos.z + dz / d * (need - d), BENCH.Z0, BENCH.Z1); } } }
    const calm = free && !s.moving && !s.act && B.where === 'bench' && !C.ask.active && !pouring && !K.dunks.length && (C.nofirst || !C.first || C.first.F.acts >= LAB.firstTouch.untilActs);
    if (calm) { B.idle += dt; if (B.idle > T.IDLE_STIR) run(idlePlay); } else if (P.down || s.moving) B.idle = 0;
  }
  /** 이 자리에 없을 때도 도는 일: 수조가 실험대에서 솟고 들어가고, 병 걸이가 내려오고 올라간다. 물빛도 같이 꺼지고 켜진다. */
  function bg(dt) {
    const to = K.here ? 1 : 0; if (K.vis === to && !K.here) return; if (K.vis !== to) K.vis += clamp(to - K.vis, -dt / T.FURN_SEC, dt / T.FURN_SEC); const e = ease(K.vis), vis = K.vis > 0.01;
    tankG.position.y = -(1 - e) * T.TANK_DROP; tankG.visible = vis; railG.position.y = T.RAIL.y + (1 - e) * T.RAIL_UP; railG.visible = vis; for (const b of BL) b.obj.visible = vis; padG.visible = vis;
    if (!K.here) { stepBottles(dt); stepPaddle(dt); stepTank(dt); }
  }
  /** 자리를 떠난다: 든 병은 제자리로, 물속의 물건과 고고는 나온다. 수조의 물은 그대로 둔다(돌아오면 그대로). 웅덩이와 무지개는 걷는다. */
  function leave() {
    for (const b of BL) { if (b.state !== 'rest') b.state = 'back'; b.sip = null; b.tiltTo = 0; } K.gstir = false; K.rub = null;
    for (const d of K.dunks) { const t = d.t; t.mesh.rotation.z = 0; if (!t.ball) t.mesh.position.y = 0; t.x = t.home.x; t.z = t.home.z; t.y = 0.5; t.floor = 0; t.vy = 0.01; } K.dunks.length = 0;
    if (K.dive || B.where === 'tank') { brain.stop(); K.dive = null; B.hop = null; s.y = 0; s.heading = 0; s.pos.set(T.PLACE.gogo[0], 0, T.PLACE.gogo[1]); B.where = 'bench'; }
    K.pudT = 0; K.bowT = 0; K.mime = null; K.here = false; P.mode = null; K.press = null; if (s.act && s.act.loop) s.act = null; pourS.k = 0; pourS.m.visible = false;
  }
  /** 확인용: 수조 가운데(물건 · 구름이 잘 안 지나는 자리)의 화면 픽셀을 뽑고, 띠 그림에 수조 한 칸을 더한다. */
  function snap() {
    stage.render(); const gl = stage.renderer.getContext(), cv = stage.renderer.domElement, k = cv.width / innerWidth, c = stage.screenOf(v3.set(TK.x + 0.45, T.BASE + IH * T.TANK.water * 0.45, FRONT)), b = new Uint8Array(4);
    gl.readPixels(Math.round(c.x * k), Math.round((innerHeight - c.y) * k), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); K.snaps.push('#' + [b[0], b[1], b[2]].map(n => n.toString(16).padStart(2, '0')).join('') + ' L' + Math.round(0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2]));
    const a = stage.screenOf(v3.set(TK.x - TK.w / 2 - 0.1, TK.h + 0.1, FRONT)), z = stage.screenOf(v3b.set(TK.x + TK.w / 2 + 0.1, 0, FRONT)), n = K.snaps.length - 1; if (!K.strip) { K.strip = document.createElement('canvas'); K.strip.width = 1200; K.strip.height = 800; const x = K.strip.getContext('2d'); x.fillStyle = '#241a44'; x.fillRect(0, 0, 1200, 800); }
    const W3 = 400, H3 = Math.round(W3 * (z.y - a.y) / (z.x - a.x)); K.strip.getContext('2d').drawImage(cv, a.x * k, a.y * k, (z.x - a.x) * k, (z.y - a.y) * k, (n % 3) * W3, 20 + Math.floor(n / 3) * (H3 + 20), W3, H3);
  }

  const defRead = (n, k) => { const t = by(n); return !t ? undefined : k === 'size' ? t.size : t[k]; }, waitT = async (tick, cond, max = 600) => { for (let i = 0; i < max && !cond(); i++) await tick(); };
  /** 자동 확인의 누르기: 진짜 onDown · onUp 을 지난다(끌지 않고). */
  const pressAt = async (p, tick) => { const c = stage.screenOf(p); P.down = true; P.x = c.x; P.y = c.y; C.ask.touch(); if (C.first) C.first.touch(); onDown({ clientX: c.x, clientY: c.y }); for (let i = 0; i < 3; i++) await tick(); P.down = false; onUp(); P.mode = null; };
  const sipCmd = async (a, b, tick) => { takeOver(); const q = bottles[a]; await waitT(tick, () => q.state === 'rest' && K.vis >= 1 && !K.drain, 400); if (b === 'left' || b === 'right') { C.ask.touch(); sipAuto(a, T.SIP, TK.x + (b === 'left' ? -1 : 1) * 1.0); } else await pressAt(v3.copy(q.pos).setY(q.pos.y - 0.36), tick); await waitT(tick, () => q.state !== 'sip' && q.state !== 'held', 300); };
  const stirCmd = async (a, tick) => { takeOver(); const n = Math.round((+a || 1) * 48), y0 = levelY() - 0.5; K.rub = { x: TK.x + 0.5, y: y0 }; for (let i = 1; i <= n; i++) { const g = i / 48 * 6.283; rubTo(TK.x + Math.cos(g) * 0.5, y0 + Math.sin(g) * 0.3); await tick(); } K.rub = null; };
  return {
    title: D.title, T, K, bottles, asks: D.asks, place: T.PLACE, step, bg, onDown, onMove, onUp, nameOf, first, scenery,
    /** 들어가면 이미 일이 벌어지고 있다: 맑은 물 · 뒤 빛 · 공기 방울 · 살랑이는 병(늘 그렇다 — 따로 차릴 것이 없다). */
    enter() { K.here = true; K.swayT = 0.2; K.enterT = 0; K.arrived = false; },
    leave,
    busy: () => K.spillT > 0 || !!K.drain || !!K.dive || K.dunks.length > 0 || K.gstir || B.where === 'tank' || BL.some(b => b.state === 'sip') || K.vis < 1,
    /** 몸으로 흉내: 색 낱말 = 그 병을 가리킨다(병이 흔들린다 — Pink 는 빨강과 흰 병) · Mix = 두 손으로 젓는 시늉. */
    mime(w, on) { K.mime = on ? w : null; if (!on) { gogo.pose('poke', 0); if (s.act && s.act.name === 'stir') s.act = null; return; } if (w === 'mix') { gogo.act('stir'); gogo.lookAt(wordAt(v3)); say('hm'); } else { const b = bottles[w === 'pink' ? 'red' : w]; if (b) gogo.lookAt(b.pos); gogo.pose('poke', 1); gogo.setMood('smile', 4); say('hm'); } },
    /** 부탁이 읽는 상태: 수조(tank)의 mixed · pour(지금 붓는 색) · potion(다 섞인 물의 이름) · poured(들어간 색의 수 — '2colors' 꼴). 나머지는 물건의 것. */
    read(n, k) { if (n !== 'tank') return defRead(n, k); return k === 'mixed' ? (inksN() >= 2 ? K.mixed : 0) : k === 'pour' ? (K.pourT > 0 ? K.pourNow : '') : k === 'potion' ? (K.mixed >= 1 ? nameOf(K.amt) : '') : k === 'poured' ? inksN() + 'colors' : undefined; },
    top(n, out) { return n === 'tank' ? wordAt(out) : by(n) ? topOf(by(n), out) : out.set(s.pos.x, 1.2, s.pos.z); },
    wiggle(n) { if (n === 'tank') { for (const b of BL) b.swV += 2; K.pulse = 0.6; } else if (things[n]) { const t = things[n]; t.tvx += rand(-1, 1) * 3; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 6; if (t.y === 0) { t.vy = 1.6; t.y = 0.001; } } else if (!brain.busy) gogo.setMood('wow', 0.8); },
    /** 생각 방울에 넣을 작은 모형: 수조는 작은 물 상자(물건은 껍데기가 제 색으로 넣는다). */
    mini(n) { if (n !== 'tank') return null; const g = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.5), new THREE.MeshStandardMaterial({ color: '#bfe6f5', roughness: 0.2 })), f = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.6), new THREE.MeshStandardMaterial({ color: '#b97c48' })); f.position.y = -0.44; g.add(m, f); return g; },
    summary: () => ({ water: INKS.map(c => c[0] + +K.amt[c].toFixed(2)).join(' ') + ' mix' + K.mixed.toFixed(2) + ' ' + (nameNow() || 'clear') + '/' + (nameOf(K.amt) || 'clear') + ' h' + K.h.toFixed(2) + ' shade' + K.shade.toFixed(2) + ' lv' + K.lv.toFixed(2) + ' #' + water.material.color.getHexString(), walked: +K.walked.toFixed(2), steps: [...K.steps], snaps: K.snaps, glow: K.glowKey, where: B.where }),
    auto: {
      sip: (a, b, tick) => sipCmd(a, b, tick),
      pour: async (a, b, tick) => { takeOver(); const q = bottles[a]; await waitT(tick, () => q.state === 'rest' && K.vis >= 1, 200); sipAuto(a, +b || 1); await waitT(tick, () => q.state !== 'sip', 1500); },
      stir: (a, b, tick) => stirCmd(a, tick),
      dunk: async (a, b, tick) => { takeOver(); const t = by(a); await waitT(tick, () => K.vis >= 1 && (t === GOGO ? !K.dive && !B.hop : canDunk(t)), 300); if (t === GOGO) { C.ask.touch(); dive(); } else await pressAt(centerOf(t, v3), tick); for (let i = 0; i < 40; i++) await tick(); },
      drain: async (a, b, tick) => { takeOver(); await pressAt(v3.copy(DR).setX(DR.x - 0.06), tick); },
      paint: async (a, b, tick) => {                                                       // 붓고 → 저어 → 퐁당의 줄임(같은 함수들을 차례로 부른다)
        takeOver(); const t = by(a); await waitT(tick, () => K.vis >= 1); if (tot() > 0.01) { openDrain(); await waitT(tick, () => !K.drain, 400); }
        for (const c of RECIPE[b] || [b]) await sipCmd(c, 'here', tick); for (let i = 0; i < 20; i++) await tick(); if (inksN() >= 2) { await stirCmd(1.1, tick); await waitT(tick, () => K.mixed >= 1, 300); } else await waitT(tick, () => K.mixed >= 1 && K.shade > 0.1, 300);
        await waitT(tick, () => canDunk(t), 300); dunk(t); await waitT(tick, () => !K.dunks.some(d => d.t === t), 400);
      },
      snap, strip: () => { if (!K.strip) return; K.strip.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99;object-fit:contain;background:#241a44'; document.body.appendChild(K.strip); },
    },
  };
}
