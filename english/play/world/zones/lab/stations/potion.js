/* 마법 연구소 · 자리 ③ 무지개 물약 (Red · Blue · Yellow · Pink · Mix) — 연구소 설계 v1 8장 · 묶음 3-2(L1-3-2), 주인공은 몬스터 고고.
 * 저녁. 방이 어둑해지고 실험대 가운데 뚜껑문에서 냄비가 솟고, 위에서 병 걸이가 내려온다. 냄비 속 물약의 색이 방 전체를 물들인다 — 이 자리의 얼굴이다.
 * 손이 하는 일 셋이 이어진다: ① 붓기(병을 냄비 위로 — 스스로 기울어 줄기가 떨어진다) ② 젓기(냄비 안에서 원을 그린다 — 따로 놀던 색이 저어야 한 색이 된다. 여기서 Mix 에 뜻이 생긴다)
 *   ③ 끼얹기(국자로 떠서 대상 위로 — 그 색으로 물든다. 수도꼭지 물을 뜨면 씻긴다). 쉬운 길: 병을 누르면 날아가 조금 붓는다 · 냄비를 문지르면 저어진다 · 국자를 누르고 대상을 누르면 끼얹는다.
 * 될까 말까: 냄비는 OVER 단위까지 — 가까워질수록 보글거림이 빨라지고 겉면이 부풀다가 넘친다("Splash!"). 마개 줄을 당기면 꾸르륵 빈다.
 * 낱말 · 부탁 · 색 규칙 · 수치는 자료(data/lab.js stations.potion)에서만 읽는다. 자료에 없는 수치만 아래 T 에 있다. 소리는 전부 합성(임시).
 * 색 상태는 물건의 `t.color` 한 줄로 바꾼다 — 겉에 입히는 일은 engine/skin_color.js 가 한다(어느 자리에서나 보인다).
 * 자동 확인 명령: pour:색:단위 · stir:바퀴 · scoop · splash:대상 · feed:gogo · plug · paint:대상:색(붓기 → 젓기 → 뜨기 → 끼얹기를 한 번에) · dunk:대상 · water(국자에 수돗물) · tapon(수도꼭지) · carry:대상:tap|pot · grab:색(병을 집었다 놓는다) · rub:바퀴 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, rand } from '../../../engine/stage.js?v=2';
import { sfx, tone, hiss } from '../../../engine/sound.js?v=2';
import { stepThing, centerOf, topOf, pickAt } from '../../../engine/things.js?v=2';
import { createColorSkin } from '../../../engine/skin_color.js?v=1';

// ───────────────────────── 수치(자료에 없는 것만 — 준호가 만져 보고 바꾼다. 자료의 수치는 create 안에서 앞에 펼친다) ─────────────────────────
export const T = {
  FURN_SEC: 0.8, POT_DROP: 1.3, RAIL_UP: 3.4, TAP_DROP: 1.3,   // 가구가 들고 나는 시간(자료 move.steps) · 냄비가 내려가 있는 깊이 · 병 걸이가 올라가 있는 높이 · 수도꼭지 깊이
  LEVEL: [0.2, 0.55], BULGE: 0.07,           // 물약 겉면의 높이(비었을 때 · 가득) · 넘치기 직전에 부푸는 높이
  HOLD_Z: 0.3, FOLLOW: 22, BACK: 8,          // 든 물건이 떠 있는 깊이 · 든 것이 손을 따라오는 빠르기 · 제자리로 돌아가는 빠르기
  TAP_S: 0.3, TAP_PX: 14,                    // 이보다 짧고 덜 움직였으면 「누르기」(쉬운 길), 아니면 「끌기」
  EASY_POUR: 1,                              // 병을 누르기만 했을 때 붓는 양(단위) — 「조금」
  UNMIX: 2,                                  // 새 색을 한 단위 부으면 섞임이 이만큼 풀린다(반 단위면 다 풀린다 — 다시 따로 논다)
  MIX_AT: 0.5, MIX_REARM: 0.15,              // "Mix!" 문턱(자료 says) · 다시 말하려면 이만큼 물러났다가
  WARN_AT: 0.6,                              // 냄비가 이만큼(OVER 의 비율) 차면 보글거림이 빨라지기 시작한다
  FOAM_STAY: 7,                              // 넘친 거품이 실험대에 남아 있는 시간
  GLOW: { power: 5.5, y: 1.25, wall: 0.75, bench: 0.4, halo: 0.28, SAT: 1.7 },   // 방을 물들이는 점 빛의 세기 · 높이 · 벽과 실험대에 번지는 빛의 짙기
  DUNK_UNDER: 0.6, DUNK_FLOAT: 1.1,          // 퐁당 빠져 있는 시간 · 물들어 떠 있는 시간
  TAP_RUN: 2.2,                              // 수도꼭지를 누르면 물이 나오는 시간
  OWN_LIKE: { apple: 'red' },                // 제 색이 그 색인 것(빨간 사과에 빨강 → 윤이 난다)
  RAINBOW_STAY: 7, HICCUPS: 3,
  LADLE_OFF: [-0.3, -0.66], ARM_AT: [0.08, 1.12],   // 손가락에서 국자 바가지까지 · 「뜬 채 기다리는」 국자의 자리(냄비에서)
  SHAKE: 0.05,
};
const SECOND = { 'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple' };
const RECIPE = { red: ['red'], yellow: ['yellow'], blue: ['blue'], white: ['white'], pink: ['red', 'white'], purple: ['red', 'blue'], orange: ['red', 'yellow'], green: ['yellow', 'blue'], brown: ['red', 'yellow', 'blue'] };
const PROF = [[0.14, 0], [0.15, 0.27], [0.24, 0.45], [0.36, 0.53], [0.47, 0.5], [0.56, 0.465], [0.62, 0.5]];   // 냄비 안쪽의 옆모습(높이, 반지름) — tools/make_lab_potion.py 와 맞춘다
const rAt = y => { for (let i = 1; i < PROF.length; i++) if (y <= PROF[i][0]) { const a = PROF[i - 1], b = PROF[i]; return a[1] + (b[1] - a[1]) * clamp((y - a[0]) / (b[0] - a[0]), 0, 1); } return 0.5; };
const ease = k => k * k * (3 - 2 * k);

/** 껍데기가 이 자리에 처음 갈 때 한 번 부른다: 모형을 받고 자리를 돌려준다. C = 껍데기가 넘기는 것(lab.js). */
export async function create(C) {
  const { stage, scene, camera, gogo, brain, things, GOGO, targets, fx, voice, seen, P, BENCH, LAB, say } = C, s = gogo.state, D = LAB.stations.potion, W = LAB.words;
  Object.assign(T, D.T, { HALF_AT: parseFloat(LAB.thingState.size.words.big.replace(/[^\d.]/g, '')) });      // 자료의 수치 + 「큰 것」의 문턱(한 번에 위쪽 반만 물든다)
  const B = brain.B, { run, wait, until, walk, face } = brain, INKS = T.RAIL.order, HEX = Object.fromEntries(Object.entries(D.colors.hex).map(([k, v]) => [k, new THREE.Color(v)]));
  const WATER = new THREE.Color('#bfe9f5'), WHITE = new THREE.Color('#ffffff'), v3 = new THREE.Vector3(), v3b = new THREE.Vector3(), v3c = new THREE.Vector3(), vWord = new THREE.Vector3(), cTmp = new THREE.Color(), cTmp2 = new THREE.Color();
  const skin = createColorSkin(C), by = n => n === 'gogo' ? GOGO : things[n], len = n => gogo.info[n] ? gogo.info[n].dur : LAB.clips[n][0], has = n => !!gogo.info[n];
  const pack = await new GLTFLoader().loadAsync(new URL('../../../assets/lab_potion.glb?v=1', import.meta.url).href), M = {};
  pack.scene.traverse(o => { if (o.isMesh) { M[o.name] = o; o.castShadow = true; o.receiveShadow = true; } });
  const POT = { x: T.CAULDRON.at[0], z: T.CAULDRON.at[1], R: T.CAULDRON.r, rim: T.CAULDRON.rim }, TAP = { x: T.PLACE.tap[0], z: T.PLACE.tap[1] }, OUT = new THREE.Vector3(TAP.x - 0.48, 0.62, TAP.z);
  const benchPlane = C.benchPlane, plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), rimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -POT.rim);

  // ───────────────────────── 색 모형(자료 colors.rule 다섯 줄 · colors.show) ─────────────────────────
  /** 섞인 물약의 이름. a = { red, yellow, blue, white }(단위). 양을 따진다 — 25% · 15% 문턱. */
  function nameOf(a) {
    const c = a.red + a.yellow + a.blue, tot = c + a.white; if (tot < 1e-4) return ''; if (c < 1e-4) return 'white';
    const f = { red: a.red / c, yellow: a.yellow / c, blue: a.blue / c }, ks = ['red', 'yellow', 'blue'].sort((p, q) => f[q] - f[p]);
    const n = f[ks[2]] >= 0.15 ? 'brown' : f[ks[1]] >= 0.25 ? SECOND[[ks[0], ks[1]].sort().join('+')] : ks[0];
    return n === 'red' && a.white / tot >= 0.25 ? 'pink' : n;
  }
  /** 보이는 색: 화면 색을 평균하지 않는다. 고른 색 띠(빨강 → 주황 → 노랑 → 초록 → 파랑 → 보라 → 빨강) 위에서 비율대로 잡고, 흰색만큼 옅게(최대 70%), 갈색은 정해진 색. */
  function showOf(a, out) {
    const c = a.red + a.yellow + a.blue, tot = c + a.white, n = nameOf(a); if (!n) return out.copy(WATER); if (n === 'white') return out.copy(HEX.white); if (n === 'brown') return out.copy(HEX.brown);
    const w = a.white / tot; if (n === 'pink') return out.copy(HEX.pink).lerp(HEX.red, clamp((0.5 - w) / 0.25, 0, 1) * 0.3).lerp(HEX.white, clamp((w - 0.5) / 0.5, 0, 1) * 0.6);
    const ks = ['red', 'yellow', 'blue'].sort((p, q) => a[q] - a[p]), t = a[ks[1]] / Math.max(a[ks[0]] + a[ks[1]], 1e-6), sec = SECOND[[ks[0], ks[1]].sort().join('+')];
    return out.copy(HEX[ks[0]]).lerp(HEX[sec], clamp(t * 2, 0, 1)).lerp(HEX.white, Math.min(0.7, w));
  }

  // ───────────────────────── 작은 것들: 방울(떨어지는 물약 · 튀는 색) · 뭉게(꺼억 · 김) · 줄기(붓는 줄기 · 수돗물) ─────────────────────────
  const DROPS = 96, dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ roughness: 0.18 }), DROPS), drops = Array.from({ length: DROPS }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: 0.03, floor: 0 })), m4 = new THREE.Matrix4(); let dropNext = 0;
  dropMesh.frustumCulled = false; dropMesh.castShadow = true; scene.add(dropMesh); for (let i = 0; i < DROPS; i++) { dropMesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); dropMesh.setColorAt(i, WATER); }
  function drop(p, vx, vy, vz, color, floor = 0, r = 0.035) { const d = drops[dropNext]; dropMesh.setColorAt(dropNext, color); dropMesh.instanceColor.needsUpdate = true; dropNext = (dropNext + 1) % DROPS; d.life = 2; d.p.copy(p); d.v.set(vx, vy, vz); d.r = r * rand(0.7, 1.2); d.floor = floor; }
  const puffGeo = new THREE.SphereGeometry(1, 14, 10), puffs = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); m.visible = false; m.renderOrder = 3; scene.add(m); return { m, life: 0, max: 1, v: new THREE.Vector3(), r0: 0.1, r1: 0.3, a: 0.5 }; }); let puffNext = 0;
  function puff(p, color, r0, r1, life, a = 0.5, vx = 0, vy = 0.5, vz = 0) { const q = puffs[puffNext]; puffNext = (puffNext + 1) % puffs.length; q.m.position.copy(p); q.m.material.color.copy(color); q.life = q.max = life; q.r0 = r0; q.r1 = r1; q.a = a; q.v.set(vx, vy, vz); q.m.visible = true; }
  const streamGeo = new THREE.CylinderGeometry(1, 0.7, 1, 8, 1, true).translate(0, -0.5, 0), UP = new THREE.Vector3(0, -1, 0);
  const mkStream = () => { const m = new THREE.Mesh(streamGeo, new THREE.MeshStandardMaterial({ roughness: 0.15, transparent: true, opacity: 0.9 })); m.visible = false; scene.add(m); return { m, k: 0 }; };
  /** 줄기 하나를 a 에서 b 로 잇는다(k = 굵기 0~1 — 0 이면 감춘다). */
  function stream(st, a, b, color, k, clock) { st.m.visible = k > 0.02; if (!st.m.visible) return; const d = v3c.subVectors(b, a), L = d.length(); st.m.position.copy(a); st.m.quaternion.setFromUnitVectors(UP, d.normalize()); const w = 0.028 * k * (1 + 0.18 * Math.sin(clock * 31)); st.m.scale.set(w, L, w); st.m.material.color.copy(color); st.m.material.emissive.copy(color); st.m.material.emissiveIntensity = 0.35; }
  const pourStream = mkStream(), tapStream = mkStream();
  function stepBits(dt) {
    for (let i = 0; i < DROPS; i++) { const d = drops[i]; if (d.life <= 0) continue; d.life -= dt; d.v.y -= 9 * dt; d.p.addScaledVector(d.v, dt);
      if (d.p.y < d.floor || d.life <= 0) { d.life = 0; dropMesh.setMatrixAt(i, m4.makeScale(0, 0, 0)); } else { const st = 1 + Math.min(1.2, Math.abs(d.v.y) * 0.12); dropMesh.setMatrixAt(i, m4.makeScale(d.r, d.r * st, d.r).setPosition(d.p)); } }
    dropMesh.instanceMatrix.needsUpdate = true;
    for (const q of puffs) { if (q.life <= 0) continue; q.life -= dt; const k = 1 - Math.max(0, q.life / q.max); q.m.position.addScaledVector(q.v, dt); q.v.multiplyScalar(Math.exp(-1.6 * dt)); q.m.scale.setScalar(q.r0 + (q.r1 - q.r0) * (1 - (1 - k) ** 2)); q.m.material.opacity = q.a * Math.min(1, k * 8) * (1 - k) ** 1.2; if (q.life <= 0) q.m.visible = false; }
  }
  const bell = (k = 1) => { for (const [f, g, at] of [[1568, 0.13, 0], [2093, 0.1, 0.09], [3136, 0.05, 0.02]]) tone(f * k, f * k * 0.995, 0.9, { g, at }); };      // 다 섞임 종
  const gurgle = () => { for (let i = 0; i < 7; i++) tone(270 - i * 24, 130 - i * 9, 0.15, { g: 0.13, at: i * 0.17 }); hiss(1.1, { g: 0.05, f: 420, q: 0.7 }); };   // 꾸르륵
  const hic = () => { const k = C.voiceK(); tone(520 * k, 980 * k, 0.07, { type: 'triangle', g: 0.14 }); tone(900 * k, 640 * k, 0.05, { type: 'triangle', g: 0.08, at: 0.08 }); };   // 딸꾹

  // ───────────────────────── 냄비 ─────────────────────────
  // K = 냄비의 상태. amt = 들어 있는 색(단위) · base = 이미 섞인 덩어리(양 · 보이는 색) · fresh = 마지막으로 다 섞인 뒤 새로 부은 색(따로 논다) · mixed = 섞임(0~1)
  const K = { amt: { red: 0, yellow: 0, blue: 0, white: 0 }, fresh: { red: 0, yellow: 0, blue: 0, white: 0 }, base: { u: 0, col: new THREE.Color() }, vol: 0, mixed: 1, mixArmed: true,
    lv: 0, boil: 0, spin: 0, spinV: 0, jolt: 0, joltV: 0, bubT: 0, warnT: 0, pourNow: '', pourT: 0, pourK: 0, pourCol: new THREE.Color(), pourFrom: new THREE.Vector3(), drainT: 0, drain0: 0, sink: 0,
    show: WATER.clone(), glowC: new THREE.Color('#000000'), glowK: 0, glowKey: '', pulse: 0, vis: 0, here: false, clock: 0, foamT: 0, foamK: 0, spillT: 0, tapT: 0, tapK: 0, tapSpin: 0, washT: 0,
    stirT: 0, stirAcc: 0, stirAng: 0, burp: null, shakeT: 0, shakeCol: WATER, bowT: 0, bowK: 0, bowV: 0, bowOn: false, carry: null, rets: [], dunk: null, press: null, downT: 0, moved: false, x0: 0, y0: 0, mime: null, mimeT: 0, look: false, shine: null, plugPull: 0, plugV: 0, gogoStir: 0 };
  const inksN = () => INKS.filter(c => K.amt[c] > 0.01).length, name = () => nameOf(K.amt), dominant = () => INKS.reduce((a, c) => K.amt[c] > K.amt[a] ? c : a, INKS[0]);
  const scaleAll = f => { for (const c of INKS) { K.amt[c] *= f; K.fresh[c] *= f; } K.base.u *= f; K.vol *= f; };
  const potG = new THREE.Group(); potG.add(M.pot); potG.position.set(POT.x, -T.POT_DROP, POT.z); scene.add(potG);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.64, 36).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#1c1230' })); hole.position.set(POT.x, 0.003, POT.z); scene.add(hole);
  const lids = [1, -1].map(sx => { const g = new THREE.Group(), m = sx > 0 ? M.lid : M.lid.clone(); m.position.x = 0.66; g.add(m); g.position.set(POT.x - sx * 0.66, 0.006, POT.z); g.rotation.y = sx > 0 ? 0 : Math.PI; scene.add(g); return { g, m, sx }; });
  // 물약 겉면: 일렁이는 면. 부은 색들(넷까지)이 저마다 띠가 되어 따로 소용돌이치다가, 저은 만큼(uMix) 가늘게 감기며 한 색(uOne)이 된다.
  const liq = new THREE.Mesh(new THREE.LatheGeometry(Array.from({ length: 12 }, (_, i) => new THREE.Vector2(i / 11, 0)), 40), new THREE.ShaderMaterial({ side: THREE.DoubleSide,
    uniforms: { uC: { value: [0, 1, 2, 3].map(() => new THREE.Color()) }, uE: { value: new THREE.Vector3(2, 2, 2) }, uOne: { value: new THREE.Color() }, uMix: { value: 1 }, uSpin: { value: 0 }, uT: { value: 0 }, uBoil: { value: 0 }, uBulge: { value: 0 }, uSink: { value: 0 } },
    vertexShader: `uniform float uT, uBoil, uBulge, uSink; varying vec2 vP;
      void main() { vP = position.xz; vec3 p = position; float r = length(vP);
        p.y += (sin(r * 13.0 - uT * 3.0) * 0.010 + sin(p.x * 9.0 + uT * 2.3) * sin(p.z * 8.0 - uT * 1.7) * 0.014) * (1.0 + uBoil * 2.2) * smoothstep(1.0, 0.75, r);
        p.y += uBulge * (1.0 - r * r) - uSink * (1.0 - r) * (1.0 - r);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform vec3 uC[4]; uniform vec3 uE; uniform vec3 uOne; uniform float uT, uMix, uSpin, uBoil; varying vec2 vP;
      void main() { float r = length(vP), a = atan(vP.y, vP.x);
        float s = fract(a / 6.2832 * 2.0 + r * (1.1 + uMix * 5.0) - uSpin - uT * 0.05 + 0.11 * sin(a * 3.0 + r * 6.0 - uT * 1.3) + 0.05 * sin(r * 17.0 + uT * 2.1));
        float e = 0.035 + 0.1 * uMix; vec3 c = uC[0];
        c = mix(c, uC[1], smoothstep(uE.x - e, uE.x + e, s)); c = mix(c, uC[2], smoothstep(uE.y - e, uE.y + e, s)); c = mix(c, uC[3], smoothstep(uE.z - e, uE.z + e, s));
        c = mix(c, uC[0], smoothstep(1.0 - e, 1.0, s));
        c = mix(c, uOne, smoothstep(0.0, 1.0, uMix));
        c *= 0.82 + 0.3 * r * r;
        c += smoothstep(0.82, 1.0, sin(a * 3.0 + r * 9.0 - uT * 1.2 - uSpin * 3.0)) * 0.08 * (1.0 + uBoil);
        c += pow(max(0.0, 1.0 - length(vP - vec2(-0.3, -0.42)) * 2.4), 2.0) * 0.22;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` }));
  potG.add(liq); liq.visible = false;
  const bubMat = new THREE.MeshStandardMaterial({ roughness: 0.12, transparent: true, opacity: 0.85 }), bubs = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(puffGeo, bubMat); m.visible = false; potG.add(m); return { m, t: 0, dur: 1, r: 0.05 }; });
  const burpM = new THREE.Mesh(puffGeo, new THREE.MeshStandardMaterial({ roughness: 0.1, transparent: true, opacity: 0.8 })); burpM.visible = false; potG.add(burpM);
  const plugG = new THREE.Group(); plugG.add(M.plug); plugG.position.set(0.47, 0.52, 0.4); potG.add(plugG);
  const levelY = () => T.LEVEL[0] + (T.LEVEL[1] - T.LEVEL[0]) * K.lv, potTop = out => out.set(POT.x, potG.position.y + POT.rim + 0.3, POT.z), surf = out => out.set(POT.x, potG.position.y + levelY(), POT.z);
  // 넘친 거품: 냄비 앞으로 흘러내려 실험대에 퍼졌다가 스러진다
  const foam = { g: new THREE.Group(), mat: new THREE.MeshStandardMaterial({ roughness: 0.35 }) };
  { const d = new THREE.Mesh(new THREE.CircleGeometry(1, 28).rotateX(-Math.PI / 2), foam.mat); d.position.y = 0.012; d.receiveShadow = true; foam.g.add(d);
    for (let i = 0; i < 11; i++) { const a = i * 2.4, rr = 0.25 + (i * 0.37 % 0.6), b = new THREE.Mesh(puffGeo, foam.mat); b.position.set(Math.cos(a) * rr, 0.02, Math.sin(a) * rr * 0.8); b.scale.set(0.24 - i * 0.011, 0.2 - i * 0.008, 0.3 - i * 0.012); b.castShadow = true; foam.g.add(b); }
    for (let i = 0; i < 7; i++) { const k = Math.abs(i - 3), b = new THREE.Mesh(puffGeo, foam.mat); b.position.set(-0.54 + i * 0.18, 0.6 - (i % 2) * 0.16 - k * 0.03, -0.66 - k * k * 0.05); b.scale.set(0.13, 0.15 + (i % 2) * 0.07, 0.1); foam.g.add(b); }      // 테두리를 넘어 흘러내리는 덩이
    foam.g.position.set(POT.x + 0.05, 0, POT.z + 0.98); foam.g.scale.setScalar(0.001); foam.g.visible = false; scene.add(foam.g); }
  // 무지개(둥근 창 위로 뜬다)
  const bow = new THREE.Group(); ['red', 'orange', 'yellow', 'green', 'blue', 'purple'].forEach((n, i) => bow.add(new THREE.Mesh(new THREE.TorusGeometry(1.95 - i * 0.1, 0.055, 8, 48, Math.PI), new THREE.MeshBasicMaterial({ color: D.colors.hex[n], transparent: true, opacity: 0.92 }))));
  bow.position.set(-0.35, 1.5, -1.66); bow.visible = false; scene.add(bow);
  // 방을 물들이는 빛: 점 빛 하나(물건 · 고고 · 벽에 번진다) + 벽과 실험대에 번지는 빛 무늬(어두운 저녁 벽에서도 색이 보이게)
  const glow = new THREE.PointLight('#ffffff', 0, 14, 1.6); glow.position.set(POT.x, T.GLOW.y, POT.z + 0.35); scene.add(glow);
  const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glowMat = () => new THREE.MeshBasicMaterial({ map: gtex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const wallGlow = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.5), glowMat()); wallGlow.position.set(POT.x, 1.5, -1.745); wallGlow.renderOrder = 1; scene.add(wallGlow);
  const benchGlow = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4).rotateX(-Math.PI / 2), glowMat()); benchGlow.position.set(POT.x, 0.008, POT.z + 0.35); benchGlow.renderOrder = 1; scene.add(benchGlow);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(2.3, 1.7, 1); halo.renderOrder = 4; scene.add(halo);

  /** 냄비에 색을 붓는다(장면마다 · u 단위). 한 색뿐이면 그대로 그 색이고, 다른 색이 들어오면 따로 놀기 시작한다(섞임이 풀린다). */
  function pourIn(c, u) {
    if (K.drainT > 0) return; K.amt[c] += u; K.vol += u; K.pourNow = c; K.pourT = 1.2; K.boil = Math.max(K.boil, 0.4);
    if (inksN() < 2) { K.base.u = K.vol; K.base.col.copy(HEX[c]); K.fresh[c] = 0; K.mixed = 1; }
    else { K.fresh[c] += u; K.mixed = Math.max(0, K.mixed - u * T.UNMIX); if (K.mixed < T.MIX_AT - T.MIX_REARM) K.mixArmed = true; }
    if (K.vol > T.OVER) overflow();
  }
  /** 젓는다(바퀴 수). 저은 만큼 섞이고, 반쯤 섞인 순간 "Mix!", 다 섞이면 한 색이 된다. */
  function stirBy(turns) {
    K.spinV += turns * 9; K.stirT = 0.35; K.stirAcc += turns; if (K.stirAcc > 0.25) { K.stirAcc = 0; hiss(0.16, { g: 0.05, f: rand(600, 900), q: 0.7 }); }      // 젓는 소리
    if (K.vol <= 0 || K.mixed >= 1 || K.drainT > 0) return; const was = K.mixed; K.mixed = Math.min(1, K.mixed + turns / T.STIR_TURN); K.boil = Math.max(K.boil, 0.5);
    if (K.mixArmed && was < T.MIX_AT && K.mixed >= T.MIX_AT) { K.mixArmed = false; voice.word(W.mix.text + '!', () => potTop(vWord), { cls: W.mix.cls, by: 'cauldron' }); sfx.spark(false); fx.spark(potTop(v3), '#fff6c8', 10, 0.3, 1.2); }
    if (K.mixed >= 1) mixedDone();
  }
  /** 다 섞였다: 종소리와 함께 한 색이 되고 그 색 이름(자료 says 에 적힌 색만 말한다 — Pink · Purple · Orange · Green · Brown). */
  function mixedDone() {
    const n = name(); K.mixed = 1; K.base.u = K.vol; showOf(K.amt, K.base.col); for (const c of INKS) K.fresh[c] = 0; K.pulse = 1; K.joltV += 2.4; K.boil = 1.6; bell(); C.ask.act();
    fx.spark(potTop(v3), '#' + K.base.col.getHexString(), 26, 0.35, 2); fx.spark(v3, '#fff6c8', 12, 0.4, 1.4);
    if (D.says.some(q => q.w === n && /섞여/.test(q.when))) voice.word(W[n].text + '!', () => potTop(vWord), { cls: W[n].cls, by: 'cauldron' });
    if (n === 'brown') { K.burp = { t: 0 }; seen.add('brownBurp'); }
    run(tok => afterMix(tok, n));
  }
  /** 넘친다: "Splash!" — 거품이 실험대로 흘러내리고 OVER_SPILL 단위가 덜어진다. 벌이 아니라 가장 웃긴 사건이다. */
  function overflow() {
    showOf(K.amt, cTmp); foam.mat.color.copy(K.mixed >= 1 ? cTmp : HEX[dominant()]).lerp(WHITE, 0.45); scaleAll((K.vol - T.OVER_SPILL) / K.vol); seen.add('overflow'); K.foamT = T.FOAM_STAY; K.spillT = 2.6; foam.g.visible = true; K.joltV += 4; K.boil = 2;
    sfx.splat(); hiss(0.7, { g: 0.12, f: 2600 }); tone(180, 60, 0.35, { g: 0.25 }); stage.shake(T.SHAKE * 0.6); voice.word(W.splash.text + '!', () => potTop(vWord), { cls: W.splash.cls, by: 'cauldron' });
    for (let i = 0; i < 18; i++) drop(v3.set(POT.x + rand(-0.45, 0.45), POT.rim + 0.05, POT.z + rand(0.2, 0.5)), rand(-0.9, 0.9), rand(0.8, 2.2), rand(0.3, 1.5), cTmp2.copy(foam.mat.color), 0, 0.05);
    run(async tok => { s.target = null; gogo.lookAt(v3.set(POT.x, 0.1, POT.z + 0.9)); gogo.setMood('fluster', 2.6); say('oops'); await loopAct(tok, 'hopFeet', 2.3, 'fluster'); gogo.setMood('smile', 1.2); say('joy'); gogo.lookAt(camera.position); await wait(tok, 0.6); });
  }
  /** 마개 줄을 당긴다: DRAIN 초에 꾸르륵 빈다. 언제든 처음부터. */
  function pullPlug() { K.plugV -= 9; sfx.clink(); C.ask.touch(); if (K.drainT > 0) return; if (K.vol <= 0.01) { tone(300, 200, 0.1, { g: 0.08 }); return; } K.drainT = T.DRAIN; K.drain0 = K.vol; gurgle(); C.ask.act(); if (!B.tok) { gogo.lookAt(potTop(v3)); gogo.setMood('wow', 1.2); } }
  function emptyPot() { for (const c of INKS) K.amt[c] = K.fresh[c] = 0; K.base.u = 0; K.vol = 0; K.mixed = 1; K.mixArmed = true; }
  function stepPot(dt) {
    const u = liq.material.uniforms, clock = K.clock, py = potG.position.y;
    if (K.pourT > 0) K.pourT -= dt; if (K.spillT > 0) K.spillT -= dt;
    if (K.drainT > 0) { K.drainT -= dt; const want = K.drain0 * Math.max(0, K.drainT / T.DRAIN); if (K.vol > 0.001) scaleAll(want / K.vol); K.spinV += 26 * dt; if (K.drainT <= 0) { emptyPot(); seen.add('drain'); tone(160, 90, 0.2, { g: 0.2 }); } }
    K.sink += ((K.drainT > 0 ? 0.16 : 0) - K.sink) * Math.min(1, 6 * dt);
    // 보이는 색 · 띠(이미 섞인 덩어리 + 새로 부은 색들)
    const slots = []; if (K.base.u > 0.01) slots.push([K.base.col, K.base.u]); for (const c of INKS) if (K.fresh[c] > 0.01) slots.push([HEX[c], K.fresh[c]]);
    while (slots.length > 4) { slots.sort((a, b) => b[1] - a[1]); const x = slots.pop(); slots[slots.length - 1][1] += x[1]; }
    const tot = slots.reduce((n, q) => n + q[1], 0) || 1; let acc = 0, big = slots[0]; const E = [2, 2, 2];
    for (let i = 0; i < 4; i++) { const q = slots[Math.min(i, slots.length - 1)]; if (q) u.uC.value[i].copy(q[0]); if (i < slots.length) { acc += slots[i][1] / tot; if (i < 3 && i < slots.length - 1) E[i] = acc; if (slots[i][1] > big[1]) big = slots[i]; } }
    u.uE.value.set(E[0], E[1], E[2]); showOf(K.amt, u.uOne.value); u.uMix.value = slots.length < 2 ? 1 : K.mixed;
    if (K.vol > 0.01) K.show.copy(big ? big[0] : WATER).lerp(u.uOne.value, slots.length < 2 ? 1 : ease(K.mixed));
    K.spinV *= Math.exp(-2.2 * dt); K.spin += (K.spinV + 0.08) * dt / 6.283; u.uSpin.value = K.spin; u.uT.value = clock; K.boil = Math.max(0, K.boil - dt * 0.55);
    const warn = clamp((K.vol / T.OVER - T.WARN_AT) / (1 - T.WARN_AT), 0, 1); u.uBoil.value = K.boil + warn * 1.6; u.uBulge.value = T.BULGE * warn * warn * (1 + 0.25 * Math.sin(clock * 9)) + K.pulse * 0.02; u.uSink.value = K.sink;
    K.lv += (clamp(K.vol / T.CAULDRON.cap, 0, 1.06) - K.lv) * Math.min(1, 5 * dt); const y = levelY(), rr = rAt(y) - 0.012; liq.visible = K.vol > 0.02 || K.lv > 0.02; liq.position.y = y; liq.scale.set(rr, 1, rr);
    K.joltV += (-90 * K.jolt - 7 * K.joltV) * dt; K.jolt += K.joltV * dt; const jit = warn * warn * 0.012 * Math.sin(clock * 47); potG.scale.set(1 - K.jolt * 0.05 + jit, 1 + K.jolt * 0.07 - jit, 1 - K.jolt * 0.05 + jit);      // 냄비가 출렁 · 넘치기 직전에는 달달 떤다
    K.plugV += (-120 * K.plugPull - 9 * K.plugV) * dt; K.plugPull += K.plugV * dt; plugG.position.y = 0.52 + K.plugPull * 0.5; plugG.rotation.z = Math.sin(clock * 1.7) * 0.06 + K.plugV * 0.03;
    // 보글: 올라와 부풀다가 터진다. 테두리에 가까워질수록 빨라진다(될까 말까는 소리로 먼저 온다)
    bubMat.color.copy(K.show).lerp(WHITE, 0.35); if (K.vol > 0.05) K.bubT -= dt * (0.9 + K.boil * 7 + warn * 14);
    if (K.bubT <= 0) { K.bubT = rand(0.5, 1.2); const b = bubs.find(q => q.t <= 0); if (b) { const a = rand(0, 6.28), d = Math.sqrt(Math.random()) * rr * 0.8; b.m.position.set(Math.cos(a) * d, y, Math.sin(a) * d); b.t = b.dur = rand(0.5, 1.1) / (1 + K.boil * 0.5 + warn); b.r = rand(0.035, 0.075) * (1 + K.boil * 0.3 + warn * 0.7); b.m.visible = true; } }
    for (const b of bubs) { if (b.t <= 0) continue; b.t -= dt; const k = 1 - b.t / b.dur; b.m.position.y = y + u.uBulge.value * 0.6 + b.r * 0.2 * k; b.m.scale.setScalar(b.r * (0.2 + 0.8 * Math.sin(k * 1.57)));
      if (b.t <= 0) { b.m.visible = false; if (K.here) { fx.spark(v3.copy(b.m.position).add(potG.position), cTmp.copy(bubMat.color), 2, 0.03, 0.5); if (K.boil > 0.3 || warn > 0) tone(rand(160, 260) * (1 + warn), rand(320, 460) * (1 + warn), 0.06, { g: 0.03 + warn * 0.04 }); } } }
    // 갈색이 되면 큰 방울을 꺼억 뱉는다
    if (K.burp) { const q = K.burp, was = q.t; q.t += dt; const k = clamp((q.t - 0.5) / 0.9, 0, 1); burpM.visible = q.t > 0.5 && k < 1; burpM.material.color.copy(HEX.brown).lerp(WHITE, 0.2); burpM.position.set(0.05, y + 0.1 + k * 0.5, 0.05); burpM.scale.setScalar(0.05 + 0.27 * Math.sin(k * 1.57)) ;
      if (was < 1.4 && q.t >= 1.4) { tone(150, 62, 0.42, { type: 'sawtooth', g: 0.16 }); tone(110, 70, 0.3, { g: 0.2, at: 0.1 }); for (let i = 0; i < 6; i++) puff(v3.set(POT.x + rand(-0.2, 0.3), py + y + 0.6, POT.z + rand(-0.1, 0.2)), cTmp.set(i % 2 ? '#8a7a70' : '#b59a84'), 0.12, rand(0.3, 0.5), rand(1, 1.8), 0.6, rand(-0.6, 0.6), rand(0.4, 1.2), rand(0, 0.5)); K.joltV += 3; K.burp = null; burpM.visible = false; } }
    // 넘친 거품 · 무지개
    if (foam.g.visible) { K.foamT -= dt; K.foamK += ((K.foamT > 0 ? 1 : 0) - K.foamK) * Math.min(1, (K.foamT > 0 ? 3.5 : 2) * dt); foam.g.scale.set(Math.max(0.001, K.foamK) * 0.78, 0.4 + 0.6 * K.foamK, Math.max(0.001, K.foamK) * 0.5); if (K.foamT <= 0 && K.foamK < 0.02) foam.g.visible = false; }
    if (K.bowT > 0 || K.bowK > 0.01) { K.bowT -= dt; K.bowV += (60 * ((K.bowT > 0 ? 1 : 0) - K.bowK) - 9 * K.bowV) * dt; K.bowK = Math.max(0, K.bowK + K.bowV * dt); bow.visible = K.bowK > 0.01; bow.scale.setScalar(Math.max(0.001, K.bowK)); if (K.bowT > 0 && Math.random() < dt * 14) fx.spark(v3.set(-0.35 + rand(-1.7, 1.7), rand(1.9, 3.4), -1.5), '#fff6c8', 1, 0.05, 0.4); }
  }
  /** 방을 물들이는 빛: 물약 색을 따라간다(다른 자리에 가 있으면 꺼진다). 색이 바뀌면 발견 거리 roomGlow. */
  function stepGlow(dt) {
    const on = K.vol > 0.05 && K.drainT <= 0, key = !on ? '' : K.mixed >= 1 || inksN() < 2 ? name() : 'swirl:' + dominant();
    if (key !== K.glowKey) { if (key && K.here && K.vis > 0.9) { seen.add('roomGlow'); K.pulse = Math.max(K.pulse, 0.6); } K.glowKey = key; }
    K.pulse = Math.max(0, K.pulse - dt * 1.4); K.glowK += ((on ? 0.55 + 0.45 * Math.min(1, K.vol / 3) : 0) * ease(K.vis) - K.glowK) * Math.min(1, 3.5 * dt); if (on) K.glowC.lerp(K.show, Math.min(1, 4 * dt));
    const k = K.glowK * (1 + 0.07 * Math.sin(K.clock * 5.3) + 0.05 * Math.sin(K.clock * 8.9) + K.pulse * 0.8); glow.color.copy(K.glowC); glow.intensity = T.GLOW.power * k; const m = Math.max(K.glowC.r, K.glowC.g, K.glowC.b, 0.01); cTmp.setRGB((K.glowC.r / m) ** T.GLOW.SAT, (K.glowC.g / m) ** T.GLOW.SAT, (K.glowC.b / m) ** T.GLOW.SAT);      // 번지는 빛은 더 짙게(옅은 색이 희게 뜨지 않게)
    wallGlow.material.color.copy(cTmp); wallGlow.material.opacity = T.GLOW.wall * k; benchGlow.material.color.copy(cTmp); benchGlow.material.opacity = T.GLOW.bench * k;
    halo.material.color.copy(cTmp); halo.material.opacity = T.GLOW.halo * k; halo.position.set(POT.x, potG.position.y + POT.rim + 0.25, POT.z + 0.1); wallGlow.visible = benchGlow.visible = halo.visible = k > 0.01;
  }

  // ───────────────────────── 병 걸이와 병 넷 ─────────────────────────
  const railG = new THREE.Group(); railG.add(M.rail); railG.position.set(0, T.RAIL.y + T.RAIL_UP, T.RAIL.z); scene.add(railG);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#e4f6ff', transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 2.2 });
  const bottles = {}; INKS.forEach((c, i) => {
    const g = new THREE.Group(), glass = M['glass_' + c], lq = M['liq_' + c]; glass.material = glassMat; glass.castShadow = false; glass.renderOrder = 2;
    lq.material = new THREE.MeshStandardMaterial({ color: D.colors.hex[c], roughness: 0.22, emissive: D.colors.hex[c], emissiveIntensity: 0.3 }); lq.castShadow = false;      // 속 물약은 어둑한 저녁에도 제 빛을 낸다
    g.add(lq, glass, M['band_' + c], M['cork_' + c]); scene.add(g);
    bottles[c] = { c, obj: g, cork: M['cork_' + c], home: new THREE.Vector3(T.RAIL.xs[i], T.RAIL.y - 0.07, T.RAIL.z), pos: new THREE.Vector3(T.RAIL.xs[i], T.RAIL.y + T.RAIL_UP, T.RAIL.z), to: new THREE.Vector3(), state: 'rest', tilt: 0, tiltTo: 0, dir: 1, sw: 0, swV: 0, auto: null, lastX: T.RAIL.xs[i], glugT: 0, poured: 0 };
  });
  const BL = Object.values(bottles), mouthOf = (b, out) => out.set(b.pos.x + Math.sin(b.obj.rotation.z) * 0.1, b.pos.y - Math.cos(b.obj.rotation.z) * 0.1, b.pos.z);
  /** 병을 집는다: 코르크가 뽁 빠지고 그 색 이름("Red."). */
  function grabBottle(b) { b.cork.visible = false; sfx.pop(); tone(900, 1500, 0.05, { g: 0.06 }); b.swV += 3; b.poured = 0; B.idle = 0; voice.word(W[b.c].text, () => v3c.copy(b.pos).setY(b.pos.y + 0.12), { name: true, cls: 'name ' + W[b.c].cls, by: 'bottle' }); }
  /** 쉬운 길 · 자동 확인: 병이 스스로 날아가 u 단위를 붓고 돌아온다. */
  function autoPour(c, u = T.EASY_POUR) { const b = bottles[c]; if (!b || b.state === 'held' || b.state === 'auto') return; grabBottle(b); b.state = 'auto'; b.auto = { left: u, t: 0 }; b.dir = b.home.x <= POT.x ? 1 : -1; }
  function stepBottles(dt) {
    let pouring = null;
    for (const b of BL) {
      b.home.y = railG.position.y - 0.07; let k = T.BACK;
      if (b.state === 'held') { plane.constant = -POT.z; if (stage.worldOn(plane, P.x, P.y, v3)) b.to.set(v3.x, v3.y + 0.42, POT.z); k = T.FOLLOW;
        const over = Math.abs(b.to.x - POT.x) < T.POUR_PAD; b.to.y = Math.max(b.to.y, over || Math.abs(b.to.x - POT.x) < T.POUR_PAD + 0.35 ? POT.rim + 0.62 : 0.95); if (b.tilt < 0.3) b.dir = b.to.x <= POT.x ? 1 : -1; b.tiltTo = over ? 1 : 0; }
      else if (b.state === 'auto') { const a = b.auto; a.t += dt; b.to.set(POT.x - b.dir * 0.3, POT.rim + 0.95, POT.z); k = 10; if (b.pos.distanceTo(b.to) < 0.12 || a.t > 1.2) b.tiltTo = a.left > 0 ? 1 : 0; if (a.left <= 0 && b.tilt < 0.25) { b.state = 'back'; b.auto = null; C.ask.act(); } }
      else { b.to.copy(b.home); b.tiltTo = 0; if (b.state === 'back' && b.pos.distanceTo(b.home) < 0.04) { b.state = 'rest'; b.cork.visible = true; sfx.tick(); } if (b.state === 'rest') k = 30; }
      b.pos.lerp(b.to, 1 - Math.exp(-k * dt)); b.tilt += clamp(b.tiltTo - b.tilt, -dt / T.TILT, dt / T.TILT);
      const vx = (b.pos.x - b.lastX) / Math.max(dt, 1e-4); b.lastX = b.pos.x; b.swV += (-60 * b.sw - 5 * b.swV) * dt - clamp(vx, -6, 6) * 1.6 * dt; b.sw += b.swV * dt;       // 매달린 병은 움직이면 흔들린다
      b.obj.position.copy(b.pos); b.obj.rotation.z = -b.dir * ease(b.tilt) * 2.05 + clamp(b.sw, -0.5, 0.5) * (1 - b.tilt);
      if (K.mime && (K.mime === b.c || (K.mime === 'pink' && (b.c === 'red' || b.c === 'white'))) && b.state === 'rest' && Math.abs(b.swV) < 0.4) b.swV += 2.2;                   // 부탁의 몸짓 도움: 그 병이 흔들린다
      if (b.tilt > 0.9 && (b.state === 'held' || (b.state === 'auto' && b.auto.left > 0)) && Math.abs(b.pos.x - POT.x) < T.POUR_PAD + 0.1 && K.here) {
        const u = Math.min(T.POUR * dt, b.state === 'auto' ? b.auto.left : 9); if (b.state === 'auto') b.auto.left -= u; b.poured += u; pourIn(b.c, u); pouring = b;
        if ((b.glugT -= dt) <= 0) { b.glugT = rand(0.09, 0.15); tone(rand(300, 430), rand(170, 240), 0.08, { g: 0.05 }); hiss(0.06, { g: 0.03, f: 1600, q: 1.2 }); }      // 조르륵
      }
    }
    // 붓는 줄기: 병 입에서 물약 겉면까지. 닿는 곳에서 그 색 방울이 튄다
    K.pourK += ((pouring ? 1 : 0) - K.pourK) * Math.min(1, 14 * dt);
    if (pouring) { mouthOf(pouring, K.pourFrom); K.pourCol.copy(HEX[pouring.c]); if (Math.random() < dt * 22) drop(v3.set(clamp(K.pourFrom.x, POT.x - 0.38, POT.x + 0.38) + rand(-0.04, 0.04), potG.position.y + levelY() + 0.03, POT.z + rand(-0.04, 0.04)), rand(-0.5, 0.5), rand(0.5, 1.3), rand(-0.3, 0.5), K.pourCol, potG.position.y + levelY() - 0.02, 0.028); }
    stream(pourStream, K.pourFrom, v3b.set(clamp(K.pourFrom.x, POT.x - 0.38, POT.x + 0.38), potG.position.y + levelY(), POT.z), K.pourCol, K.pourK, K.clock);
    return pouring;
  }

  // ───────────────────────── 국자 ─────────────────────────
  const ladG = new THREE.Group(), ladDisc = new THREE.Mesh(new THREE.CircleGeometry(0.118, 20).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ roughness: 0.15, emissiveIntensity: 0.4 })); ladDisc.position.y = -0.004; ladDisc.visible = false; ladG.add(M.ladle, ladDisc); scene.add(ladG);
  const L = { pos: new THREE.Vector3(POT.x, -1, POT.z), to: new THREE.Vector3(), state: 'rest', rot: -0.45, tip: 0, tipTo: 0, load: null, z: POT.z, dwell: 0, fly: null, done: false, stir: new THREE.Vector3(POT.x, 0, POT.z), washT: 0 };
  const handleTop = out => { const a = L.rot + L.tip * 1.9; return out.set(L.pos.x + 0.28 * Math.cos(a) - 0.74 * Math.sin(a), L.pos.y + 0.28 * Math.sin(a) + 0.74 * Math.cos(a), L.pos.z); };
  const mouth = out => out.set(s.pos.x + Math.sin(s.heading) * 0.3 * s.size, s.y + 0.6 * s.size, s.pos.z + Math.cos(s.heading) * 0.3 * s.size);
  /** 뜬 물약의 이름: 다 섞였으면 그 색, 아직 따로 놀면 가장 많은 색(얼룩 하나를 뜬 셈). */
  const scoopName = () => K.mixed >= 1 || inksN() < 2 ? name() : dominant();
  /** 국자로 한 번 뜬다(SCOOP 단위 — 냄비가 바닥나지는 않게 반까지만). */
  function scoop() {
    if (K.vol <= 0.02 || K.drainT > 0) return false; const take = Math.min(T.SCOOP, K.vol * 0.5), f = take / K.vol, n = scoopName();
    L.load = { name: n, col: (K.mixed >= 1 || inksN() < 2 ? showOf(K.amt, new THREE.Color()) : HEX[n].clone()), part: Object.fromEntries(INKS.map(c => [c, K.amt[c] * f])), mixed: K.mixed >= 1 }; scaleAll(1 - f); sfx.gulp(); K.joltV += 1; return true;
  }
  function unload() { const q = L.load; L.load = null; if (!q || q.water) return; for (const c of INKS) { const u = q.part[c]; if (u <= 0) continue; K.amt[c] += u; K.vol += u; if (q.mixed && K.mixed >= 1) K.base.u += u; else K.fresh[c] += u; } if (inksN() < 2) { K.base.u = K.vol; for (const c of INKS) K.fresh[c] = 0; } }      // 남은 것은 냄비에 도로 붓는다
  /** 국자를 누르기만 했다(쉬운 길): 한 번 떠서 냄비 위에 뜬 채 기다린다 → 대상을 누르면 날아가 끼얹는다. 다시 누르면 도로 붓는다. */
  function ladleTap() { if (L.state === 'armed') { L.state = 'back'; sfx.tick(); return; } if (!L.load) scoop(); L.state = 'armed'; L.fly = null; sfx.grab(); B.idle = 0; }
  /** 뜬 국자가 스스로 날아간다: kind = 'thing'(끼얹기) · 'mouth'(고고 입에) · 'tap'(수돗물을 받는다). */
  function flyTo(kind, t) { if (L.state === 'held' || L.state === 'fly') return; if (kind !== 'tap' && !L.load && !scoop()) { sfx.clink(); return; } L.state = 'fly'; L.fly = { kind, t, phase: 'go', u: 0 }; L.done = false; B.idle = 0; }
  /** 끼얹는다: 물약이면 그 색으로 물들고(DYE 초 — 색 겉이 번지게 한다), 수돗물이면 씻긴다. */
  function doSplash(t) {
    const q = L.load; L.load = null; if (!q) return; const top = topOf(t, v3b), col = q.water ? WATER : q.col; sfx.splat(); C.ask.act();
    for (let i = 0; i < 12; i++) drop(v3.set(L.pos.x + rand(-0.06, 0.06), L.pos.y - 0.05, t.z + rand(-0.05, 0.05)), rand(-0.5, 0.5), rand(-0.5, 0.6), rand(-0.3, 0.3), col, Math.max(0, top.y - 0.25), 0.045);
    if (q.water) wash(t); else dye(t, q.name, q.col);
  }
  /** 물든다. 큰 것은 한 번에 위쪽 반만(한 번 더 끼얹으면 다) · 이미 그 색이면(빨간 사과에 빨강) 반짝반짝 윤이 난다. 낱말은 자료 says 가 「물들 때」라고 적은 색만. */
  function dye(t, n, col) {
    const big = t.size >= T.HALF_AT, own = t.color === 'own' && T.OWN_LIKE[t.name] === n, same = own || (t.color === n && !t.dyeHalf);
    if (same) { K.shine = { t, left: 1.6 }; seen.add('sameShine'); t.color = n; t.dyeHalf = false; for (let i = 0; i < 5; i++) tone(1568 * 1.19 ** i, 1568 * 1.19 ** i, 0.3, { g: 0.05, at: i * 0.07 }); }
    else if (big && !(t.color === n && t.dyeHalf)) { t.color = n; t.dyeHalf = true; seen.add('bigHalf'); }
    else { t.color = n; t.dyeHalf = false; }
    fx.spark(topOf(t, v3), '#' + (col || HEX[n]).getHexString(), 14, 0.25, 1.4); tone(880, 1320, 0.12, { type: 'triangle', g: 0.08 });
    if (D.says.some(q => q.w === n && /물들 때/.test(q.when))) voice.word(W[n].text + '!', () => topOf(t, vWord), { cls: W[n].cls, by: t.name });
    if (t === GOGO) { s.sizeV += 1.6; run(tok => dyedSelf(tok, n)); } else { t.v += 2.4; t.tvx += rand(-3, 3); run(tok => compare(tok, t)); }
    rainbowCheck();
  }
  /** 씻긴다: WASH 초에 제 색으로. */
  function wash(t) {
    for (let i = 0; i < 8; i++) drop(topOf(t, v3), rand(-1.2, 1.2), rand(0.6, 1.8), rand(-0.4, 0.8), WATER, 0, 0.035); const was = t.color !== 'own'; t.color = 'own'; t.dyeHalf = false; hiss(0.3, { g: 0.06, f: 2400, q: 0.8 }); rainbowCheck();
    if (t === GOGO) { s.sizeV -= 1.4; if (was) run(async tok => { gogo.setMood('fluster', 0.6); say('oops'); K.shakeT = len('shake'); K.shakeCol = WATER; gogo.act('shake'); if (!has('shake')) gogo.pose('sway', 1); await wait(tok, len('shake')); gogo.pose('sway', 0); gogo.setMood('smile', 1.2); gogo.lookAt(camera.position); }); } else { t.v -= 2; t.tvz += rand(-3, 3); }
  }
  /** 넷을 서로 다른 색으로 물들였으면 창에 무지개가 뜨고 고고가 손뼉을 친다. */
  function rainbowCheck() {
    const cs = Object.values(things).map(t => t.color), ok = cs.every(c => c !== 'own') && new Set(cs).size >= T.RAINBOW; if (!ok) { K.bowOn = false; return; } if (K.bowOn) return;
    K.bowOn = true; K.bowT = T.RAINBOW_STAY; K.bowV = 3; seen.add('rainbow'); for (let i = 0; i < 6; i++) tone(784 * 1.189 ** i, 784 * 1.189 ** i, 0.5, { g: 0.09, at: 0.4 + i * 0.11 });
    run(async tok => { await wait(tok, 0.5); s.target = null; s.faceTo = 0; gogo.lookAt(v3.set(-0.35, 3, -1.6)); gogo.act('cheer', { mood: 'joy' }); say('joy'); await wait(tok, len('cheer') + 0.1); gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 1); gogo.lookAt(camera.position); });
  }
  /** 국자를 고고 입에: 한 모금 마시고 딸꾹질마다 그 색 방울이 나온다. */
  function feed(find = 'sipHiccup') {
    const q = L.load; L.load = null; if (!q) return; const col = q.water ? WATER : q.col.clone(); C.ask.act();
    run(async tok => { s.target = null; gogo.act('sip', { mood: 'joy' }); if (!has('sip')) gogo.pose('hands', 1); sfx.gulp(); await wait(tok, len('sip')); gogo.pose('hands', 0);
      for (let i = 0; i < T.HICCUPS; i++) { gogo.act('hiccup'); gogo.setMood('wow', 0.35); s.sizeV += 1.5; hic(); seen.add(find); mouth(v3); for (let j = 0; j < 4; j++) drop(v3, rand(-0.5, 0.5) + Math.sin(s.heading) * 0.9, rand(1.2, 2.2), Math.cos(s.heading) * rand(0.6, 1.4), col, 0, 0.05); fx.spark(v3, '#' + col.getHexString(), 6, 0.08, 1); await wait(tok, 0.78); }
      gogo.setMood('smile', 1.4); say('joy'); gogo.lookAt(camera.position); await wait(tok, 0.5); });
  }
  function stepLadle(dt) {
    const py = potG.position.y; let k = T.BACK, rotTo = -0.45; L.tipTo = 0;
    if (L.state === 'rest') { const a = K.clock * (K.gogoStir > 0 ? 5.2 : 1.3), r = K.gogoStir > 0 ? 0.22 : 0.06; L.to.set(POT.x - 0.1 + Math.cos(a) * r, py + levelY() - 0.02, POT.z + 0.04 + Math.sin(a) * r); k = K.here && K.vis >= 1 ? 9 : 40; }
    else if (L.state === 'stir') { L.to.set(L.stir.x, py + levelY() - 0.02, L.stir.z); k = T.FOLLOW; rotTo = -0.25; }
    else if (L.state === 'armed') { L.to.set(POT.x + T.ARM_AT[0], py + T.ARM_AT[1] + Math.sin(K.clock * 3) * 0.035, POT.z + 0.06); rotTo = -0.12; k = 10; }
    else if (L.state === 'back') { L.to.set(POT.x - 0.1, py + levelY() + 0.05, POT.z + 0.04); k = 10; if (L.pos.distanceTo(L.to) < 0.08) { L.state = 'rest'; if (L.load) { unload(); sfx.gulp(); } } }
    else if (L.state === 'held') {
      plane.constant = -L.z; if (stage.worldOn(plane, P.x, P.y, v3)) L.to.set(v3.x + T.LADLE_OFF[0], Math.max(0.16, v3.y + T.LADLE_OFF[1]), L.z); k = T.FOLLOW; rotTo = -0.1; let hv = null, zTo = T.HOLD_Z;
      if (L.load && !L.load.water) { mouth(v3); if (Math.abs(L.to.x - v3.x) < 0.42 * s.size && L.to.y > s.y + 0.3 * s.size && L.to.y < s.y + 0.92 * s.size && !B.hop) { hv = 'mouth'; zTo = v3.z + 0.1; } }
      if (!hv && L.load) { let bd = 9; for (const t of targets) { if (t.state === 'gone' || (K.dunk && K.dunk.t === t)) continue; const dx = Math.abs(L.to.x - t.x), top = topOf(t, v3).y; if (dx < T.SPLASH_PAD * Math.max(0.75, Math.min(t.size, 1.3)) && L.to.y > top - 0.06 && dx < bd) { bd = dx; hv = t; } } }
      if (hv && hv !== 'mouth') { zTo = hv.z + 0.03; L.to.y = Math.max(L.to.y, topOf(hv, v3).y + 0.24); }
      const overPot = Math.abs(L.to.x - POT.x) < 0.45 && L.to.y < POT.rim + 0.55, atTap = Math.abs(L.to.x - OUT.x) < 0.36 && L.to.y < OUT.y + 0.05;
      if (overPot) { zTo = POT.z; if (!L.load && L.to.y < POT.rim + 0.25 && scoop()) L.dwell = -0.3; } if (atTap) { zTo = TAP.z; tapOn(0.5); L.to.y = Math.min(L.to.y, OUT.y - 0.22); if ((L.washT += dt) > 0.25 && !(L.load && L.load.water)) { if (L.load) L.load = null; L.load = { water: true, col: WATER }; sfx.gulp(); } } else L.washT = 0;
      L.z += (zTo - L.z) * Math.min(1, 9 * dt); if (hv !== L.hv) { L.hv = hv; L.dwell = Math.min(L.dwell, 0); } if (hv) L.dwell += dt;
      if (hv && L.load && L.dwell > (hv === 'mouth' ? 0.22 : 0.1)) { if (hv === 'mouth') { L.tipTo = 0.4; if (L.tip > 0.3) feed(); } else { L.tipTo = 1; if (L.tip > 0.92) doSplash(hv); } }
    } else if (L.state === 'fly') {
      const f = L.fly, t = f.t; k = 9; rotTo = -0.1; f.u += dt;
      if (f.kind === 'thing') L.to.set(t.x + 0.02, topOf(t, v3).y + 0.3, t.z + 0.03); else if (f.kind === 'mouth') { mouth(v3); L.to.set(v3.x + 0.02, v3.y + 0.05, v3.z + 0.12); } else L.to.set(OUT.x, OUT.y - 0.3, TAP.z);
      if (f.phase === 'go' && (L.pos.distanceTo(L.to) < 0.09 || f.u > 1.3)) { f.phase = 'tip'; f.u = 0; if (f.kind === 'tap') tapOn(1); }
      if (f.phase === 'tip') { if (f.kind === 'thing') { L.tipTo = 1; if (L.tip > 0.92 && !L.done) { L.done = true; doSplash(t); } } else if (f.kind === 'mouth') { L.tipTo = 0.4; if (L.tip > 0.3 && !L.done) { L.done = true; feed(f.idle ? 'idleSip' : 'sipHiccup'); } } else if (f.u > 0.4 && !L.done) { L.done = true; L.load = { water: true, col: WATER }; sfx.gulp(); }
        if (L.done && f.u > 0.6) { L.fly = null; L.state = L.load ? 'armed' : 'back'; } }
    }
    L.pos.lerp(L.to, 1 - Math.exp(-k * dt)); L.tip += clamp(L.tipTo - L.tip, -dt / 0.16, dt / 0.16); L.rot += (rotTo - L.rot) * Math.min(1, 10 * dt);
    ladG.position.copy(L.pos); ladG.rotation.z = L.rot + ease(L.tip) * 1.9; ladDisc.visible = !!L.load; if (L.load) { ladDisc.material.color.copy(L.load.col); ladDisc.material.emissive.copy(L.load.col); }
  }

  // ───────────────────────── 수도꼭지 ─────────────────────────
  const tapG = new THREE.Group(); M.tap_handle.position.set(0, 0.42, 0.14); M.tap_handle.rotation.x = Math.PI / 2; M.basin.position.set(-0.48, 0, 0); tapG.add(M.tap, M.tap_handle, M.basin); tapG.position.set(TAP.x, -T.TAP_DROP, TAP.z); scene.add(tapG);
  /** 수도꼭지를 튼다(secs 초 동안). 처음 트는 순간 "Water."(이름). */
  function tapOn(secs, named = true) { if (K.tapT <= 0) { hiss(0.5, { g: 0.07, f: 3200, q: 0.7 }); sfx.tick(); if (named) voice.word(W.water.text, () => vWord.copy(OUT).setY(1.1), { name: true, by: 'tap' }); } K.tapT = Math.max(K.tapT, secs); }
  function stepTap(dt) {
    if (K.tapT > 0) { K.tapT -= dt; K.tapSpin += dt * 7; if (Math.random() < dt * 9) hiss(0.12, { g: 0.03, f: 3000, q: 0.8 }); } K.tapK += ((K.tapT > 0 ? 1 : 0) - K.tapK) * Math.min(1, 12 * dt); M.tap_handle.rotation.y = K.tapSpin;
    let floor = 0.04; const ct = K.carry && Math.abs(K.carry.t.x - OUT.x) < 0.4 ? K.carry.t : null; if (ct) floor = Math.min(OUT.y - 0.05, topOf(ct, v3).y); else if (Math.abs(L.pos.x - OUT.x) < 0.3 && L.pos.y < OUT.y) floor = L.pos.y;
    stream(tapStream, v3.copy(OUT).setY(tapG.position.y + OUT.y), v3b.set(OUT.x, floor, OUT.z), WATER, K.tapK, K.clock);
    if (K.tapK > 0.5 && Math.random() < dt * 20) drop(v3.set(OUT.x + rand(-0.03, 0.03), floor + 0.03, OUT.z), rand(-0.6, 0.6), rand(0.4, 1.1), rand(-0.2, 0.6), WATER, 0, 0.025);
    if (ct && K.tapK > 0.5 && ct.color !== 'own') { if ((K.washT += dt) > 0.3) { K.washT = 0; wash(ct); C.ask.act(); } } else K.washT = 0;
  }

  // ───────────────────────── 물건을 집어 옮기기(냄비에 퐁당 · 수돗물에 씻기) ─────────────────────────
  const canCarry = t => t !== GOGO && (t.state === 'home' || t.state === 'up' || t.state === 'down') && !(K.dunk && K.dunk.t === t);
  function carryStart(t) { K.rets = K.rets.filter(r => r.t !== t); K.carry = { t, auto: null, bonk: false }; sfx.grab(); B.idle = 0; if (!B.tok) gogo.lookAt(centerOf(t, v3)); }
  /** 놓는다: 냄비 위이고 작은 것(DUNK_SMALL 아래)이면 퐁당, 아니면 제자리로 돌아간다. */
  function carryEnd() { const c = K.carry; if (!c) return; K.carry = null; const t = c.t; if (Math.abs(t.x - POT.x) < POT.R * 0.8 && t.size <= T.DUNK_SMALL) dunkIn(t); else { t.floor = 0; K.rets.push({ t, x0: t.x, z0: t.z, u: 0 }); sfx.pop(); } }
  function dunkIn(t) { K.dunk = { t, phase: 'in', u: 0, x0: t.x, z0: t.z, y0: t.y, name: '' }; C.ask.act(); }
  function stepCarry(dt) {
    const c = K.carry;
    if (c) { const t = c.t, hh = (t.ball ? t.r : t.h * 0.5) * t.size; let x, y, z = T.HOLD_Z;
      if (c.auto) { x = c.auto[0]; y = c.auto[1]; } else { plane.constant = -T.HOLD_Z; if (stage.worldOn(plane, P.x, P.y, v3)) { x = v3.x; y = v3.y - hh; } else { x = t.x; y = t.y; } }
      const overPot = Math.abs(x - POT.x) < POT.R * 0.8, atTap = Math.abs(x - OUT.x) < 0.42; y = Math.max(y, 0); if (overPot) { z = POT.z; const small = t.size <= T.DUNK_SMALL; y = Math.max(y, POT.rim + (small ? -0.1 : 0.04)); if (!small && y <= POT.rim + 0.05 && !c.bonk) { c.bonk = true; sfx.clink(); K.joltV += 1.5; } if (small && y < POT.rim + 0.12) { t.x += (x - t.x) * 0.5; K.carry = null; dunkIn(t); return; } } else c.bonk = false;
      if (atTap) { z = TAP.z; x = OUT.x; y = Math.min(y, 0.12); tapOn(0.4); } const k = 1 - Math.exp(-T.FOLLOW * dt); t.x += (x - t.x) * k; t.z += (z - t.z) * Math.min(1, 9 * dt); t.y += (y - t.y) * k; t.floor = t.y; t.vy = 0; if (t.ball) t.vx = 0; }
    for (let i = K.rets.length - 1; i >= 0; i--) { const r = K.rets[i], t = r.t; r.u = Math.min(1, r.u + dt / 0.45); const e = ease(r.u); t.x = r.x0 + (t.home.x - r.x0) * e; t.z = r.z0 + (t.home.z - r.z0) * e; if (t.ball) t.vx = 0; if (r.u >= 1) K.rets.splice(i, 1); }
    const d = K.dunk; if (!d) return; const t = d.t, py = potG.position.y, top = (t.ball ? t.r * 2 : t.h) * t.size; d.u += dt; if (t.ball) t.vx = 0;
    if (d.phase === 'in') { const k = Math.min(1, d.u / 0.28); t.x = d.x0 + (POT.x - d.x0) * k; t.z = d.z0 + (POT.z - d.z0) * k; t.y = d.y0 + (py + Math.max(0.14, levelY() - top * 1.05) - d.y0) * k * k;
      if (k >= 1) { d.phase = 'under'; d.u = 0; sfx.splat(); tone(420, 150, 0.16, { g: 0.2 }); K.joltV += 2.5; K.boil = 1.2; for (let i = 0; i < 10; i++) drop(surf(v3), rand(-1, 1), rand(1.2, 2.4), rand(-0.3, 0.9), K.show, 0, 0.045); if (!B.tok) { gogo.lookAt(potTop(v3)); gogo.setMood('wow', 1); say('wow'); } } }
    else if (d.phase === 'under') { if (d.u > T.DUNK_UNDER) { d.phase = 'float'; d.u = 0; if (K.vol > 0.05) { const n = scoopName(); d.name = n; t.color = n; t.dyeHalf = false; seen.add('dunkSmall'); sfx.pop(); fx.spark(potTop(v3), '#' + HEX[n].getHexString(), 14, 0.25, 1.4); if (D.says.some(q => q.w === n && /물들 때/.test(q.when))) voice.word(W[n].text + '!', () => potTop(vWord), { cls: W[n].cls, by: t.name }); rainbowCheck(); } } }
    else if (d.phase === 'float') { t.y += (py + levelY() - top * 0.45 + Math.sin(d.u * 5) * 0.02 - t.y) * Math.min(1, 7 * dt); t.tvx += Math.sin(d.u * 4) * dt * 6; if (d.u > T.DUNK_FLOAT) { d.phase = 'out'; d.u = 0; d.y0 = t.y; sfx.pop(); } }
    else { const k = Math.min(1, d.u / 0.5), e = ease(k); t.x = POT.x + (t.home.x - POT.x) * e; t.z = POT.z + (t.home.z - POT.z) * e; t.y = d.y0 * (1 - k) + 1.1 * 4 * k * (1 - k) * 0.5; if (k >= 1) { t.y = 0; t.floor = 0; t.vy = 0; K.dunk = null; sfx.bounce(0.4); if (d.name) run(tok => compare(tok, t)); return; } }
    t.floor = t.y; t.vy = 0;
  }

  // ───────────────────────── 고고가 하고 싶은 일 ─────────────────────────
  /** 되풀이 동작을 secs 초 한다(클립이 아직 없으면 덧자세로 대신한다). 끊겨도 동작과 덧자세가 남지 않는다. */
  async function loopAct(tok, n, secs, pose) { gogo.act(n); if (!has(n) && pose) gogo.pose(pose, 1); try { await wait(tok, secs); } finally { if (s.act && s.act.name === n) s.act = null; if (pose) gogo.pose(pose, 0); } }
  /** 다 섞여 색이 바뀌면 눈이 커진다. 갈색에는 코를 쥔다. */
  async function afterMix(tok, n) {
    s.target = null; gogo.lookAt(potTop(v3)); gogo.act('surprise', { mood: 'wow' }); say('wow'); await wait(tok, 1.0);
    if (n === 'brown') { gogo.act('noseHold'); gogo.setMood('stuffy', len('noseHold') + 1.2); say('yuck'); if (!has('noseHold')) gogo.pose('lean', -0.8); await wait(tok, len('noseHold') + 1.2); gogo.pose('lean', 0); }
    else { gogo.act('jump', { mood: 'joy' }); say('joy'); await wait(tok, 0.9); }
    gogo.lookAt(camera.position);
  }
  /** 제가 물들면 손을 내려다보고 몸을 턴다(색 방울이 튄다). */
  async function dyedSelf(tok, n) {
    s.target = null; gogo.pose('hands', 1); gogo.setMood('wow', 1.2); say('wow'); gogo.lookAt(v3.set(s.pos.x + Math.sin(s.heading) * 0.55 * s.size, s.y + 0.5 * s.size, s.pos.z + Math.cos(s.heading) * 0.55 * s.size)); await wait(tok, 1.15); gogo.pose('hands', 0);
    gogo.act('shake'); if (!has('shake')) gogo.pose('sway', 1); K.shakeT = len('shake'); K.shakeCol = HEX[n]; seen.add('gogoDye'); say('dizzy'); await wait(tok, len('shake')); gogo.pose('sway', 0);
    gogo.setMood('joy', 1.2); say('joy'); gogo.lookAt(camera.position); await wait(tok, 0.8);
  }
  /** 물든 물건에 다가가 제 팔과 견주어 본다. 같은 색이면 좋아한다. */
  async function compare(tok, t) {
    await wait(tok, 0.45); await C.toBench(tok); if (t.state === 'gone' || t.state === 'roll' || t.state === 'fall') return;
    const side = s.pos.x >= t.x ? 1 : -1; await walk(tok, t.x + side * (t.r * t.size + 0.42 * s.size + 0.12), clamp(t.z + 0.5, BENCH.Z0, BENCH.Z1)); await face(tok, Math.atan2(t.x - s.pos.x, t.z - s.pos.z));
    gogo.lookAt(centerOf(t, v3)); gogo.setMood('wow', 0.9); say('hm'); await wait(tok, 0.8);
    gogo.pose('hands', 1); gogo.lookAt(v3.set(s.pos.x + Math.sin(s.heading) * 0.55 * s.size, s.y + 0.5 * s.size, s.pos.z + Math.cos(s.heading) * 0.55 * s.size)); await wait(tok, 0.9); gogo.pose('hands', 0); gogo.lookAt(centerOf(t, v3)); seen.add('compare');
    if (GOGO.color === t.color) { gogo.act('jump', { mood: 'joy' }); say('joy'); } else { gogo.setMood('smile', 1.2); say('hm'); } await wait(tok, 0.9); await face(tok, 0); gogo.lookAt(camera.position);
  }
  /** 가만두면 혼자 국자로 젓고 한 모금 맛본다(낱말은 나오지 않는다 — 아이가 한 일이 아니므로 섞임도 바뀌지 않는다). */
  async function idlePlay(tok) {
    await C.toBench(tok); await walk(tok, POT.x - 1.0, POT.z + 0.32); await face(tok, Math.atan2(POT.x - s.pos.x, POT.z - s.pos.z)); gogo.lookAt(potTop(v3)); seen.add('idleStir');
    K.gogoStir = 2.5; try { await loopAct(tok, 'stir', 2.4, 'reach'); } finally { K.gogoStir = 0; }
    if (K.vol > 0.05 && L.state === 'rest') { flyTo('mouth'); if (L.fly) L.fly.idle = true; await until(tok, () => L.state !== 'fly', 3); } else { gogo.act('shrug', { mood: 'smile' }); say('hm'); await wait(tok, 1); }
    await walk(tok, T.PLACE.gogo[0], T.PLACE.gogo[1]); await face(tok, 0); gogo.lookAt(camera.position);
  }

  // ───────────────────────── 손 ─────────────────────────
  const stirWorld = (x, y, out) => stage.worldOn(rimPlane, x, y, out), px = () => { const a = stage.screenOf(v3.set(0, 1, 0)), b = stage.screenOf(v3b.set(1, 1, 0)); return Math.abs(b.x - a.x); };
  function stirStart(x, z) { L.state = 'stir'; L.stir.set(x, 0, z); K.stirAng = 0; B.idle = 0; if (L.load) unload(); }
  /** 냄비 안에서 손이 (x, z) 로 움직였다: 움직인 길이만큼 저어진다(원을 그리면 한 바퀴 = 한 바퀴, 문지르기만 해도 저어진다). */
  function stirTo(x, z) { const dx = x - L.stir.x, dz = z - L.stir.z, d = Math.hypot(dx, dz), r = Math.hypot(x - POT.x, z - POT.z); if (d < 1e-4) return; const rr = clamp(r, T.STIR_R[0] * POT.R * 2, T.STIR_R[1] * POT.R); stirBy(Math.min(d, 0.5) / (6.283 * rr)); const m = Math.min(1, 0.4 / Math.max(r, 0.001)); L.stir.set(POT.x + (x - POT.x) * m, 0, POT.z + (z - POT.z) * m); }
  function onDown(e) {
    const x = e.clientX, y = e.clientY, u = px(), near = (p, rx, ry = rx) => { const c = stage.screenOf(p); return Math.abs(c.x - x) < rx && Math.abs(c.y - y) < ry; }; K.downT = 0; K.moved = false; K.x0 = x; K.y0 = y; B.idle = 0;
    const furn = K.vis >= 0.6, t = pickAt(stage, targets, x, y);                                                       // 가구가 다 나오기 전에는 물건과 실험대만
    if (furn) for (const b of BL) if (b.state !== 'auto' && near(v3.copy(b.pos).setY(b.pos.y - 0.42), 0.27 * u + 8, 0.44 * u + 8)) { P.mode = 'bottle'; K.press = b; b.state = 'held'; grabBottle(b); return; }
    if (furn && L.state !== 'fly' && (near(handleTop(v3), 0.2 * u + 10) || near(v3.copy(L.pos).lerp(handleTop(v3b), 0.6), 0.15 * u + 8) || (L.state === 'armed' && near(L.pos, 0.22 * u + 8)))) { P.mode = 'ladle'; K.wasArmed = L.state === 'armed'; if (!L.load) scoop(); L.state = 'held'; L.z = L.pos.z; L.dwell = -0.15; L.hv = null; sfx.grab(); return; }
    if (furn && near(v3.set(potG.position.x + 0.47, potG.position.y + 0.15, POT.z + 0.4), 0.2 * u + 8, 0.24 * u + 8)) { P.mode = 'plug'; return; }
    if (furn && (near(v3.set(TAP.x - 0.24, 0.8, TAP.z), 0.36 * u, 0.24 * u) || (!t && near(v3.set(TAP.x - 0.24, 0.5, TAP.z), 0.38 * u, 0.52 * u)))) { P.mode = 'tap'; tapOn(T.TAP_RUN); C.ask.touch(); if (L.state === 'armed') flyTo('tap'); return; }
    const inPot = furn && stirWorld(x, y, v3) && Math.hypot(v3.x - POT.x, v3.z - POT.z) < POT.R * 0.86;
    if (inPot && !(t === GOGO && near(centerOf(GOGO, v3b), 0.3 * u))) { P.mode = 'stir'; stirStart(v3.x, v3.z); sfx.tick(); return; }
    if (t) { if (L.state === 'armed') { P.mode = 'aim'; flyTo('thing', t); return; } P.mode = 'thing'; K.press = t; C.touch(t); return; }
    P.mode = 'walk'; if (stage.worldOn(benchPlane, x, y, v3)) C.tapBench(v3.x, v3.z);
  }
  function onMove(e) {
    const x = e.clientX, y = e.clientY; if (!K.moved && Math.hypot(x - K.x0, y - K.y0) > T.TAP_PX) K.moved = true;
    if (P.mode === 'stir') { if (!stirWorld(x, y, v3)) return; if (Math.hypot(v3.x - POT.x, v3.z - POT.z) > POT.R * 1.5) { P.mode = 'ladle'; K.wasArmed = false; K.moved = true; scoop(); L.state = 'held'; L.z = POT.z; L.dwell = -0.15; L.hv = null; sfx.grab(); } else stirTo(v3.x, v3.z); }
    else if (P.mode === 'thing' && K.moved && !K.carry && canCarry(K.press)) carryStart(K.press);
    else if (P.mode === 'plug' && y - K.y0 > 26 && !K.pulled) { K.pulled = true; pullPlug(); }
    else if (P.mode === 'walk' && stage.worldOn(benchPlane, x, y, v3) && s.target && B.where === 'bench') gogo.goTo(clamp(v3.x, -BENCH.X, BENCH.X), clamp(v3.z, BENCH.Z0, BENCH.Z1));
  }
  function onUp() {
    const quick = !K.moved && K.downT < T.TAP_S;
    if (P.mode === 'bottle') { const b = K.press; if (b.state === 'held') { b.state = 'back'; if (b.poured > 0.05) C.ask.act(); if (quick && b.poured <= 0) { b.cork.visible = true; autoPour(b.c); } } }      // 누르기만 했으면 스스로 날아가 조금 붓는다
    else if (P.mode === 'ladle') { if (L.state === 'held') { if (!K.moved) { L.state = 'rest'; if (K.wasArmed) { L.state = 'back'; sfx.tick(); } else ladleTap(); } else { L.state = 'back'; sfx.pop(); } } }
    else if (P.mode === 'stir') { if (L.state === 'stir') L.state = 'rest'; }
    else if (P.mode === 'thing') { if (K.carry) carryEnd(); }
    else if (P.mode === 'plug') { if (!K.pulled) pullPlug(); K.pulled = false; }
    K.press = null; if (!B.tok) gogo.lookAt(camera.position);
  }

  // ───────────────────────── 매 장면 ─────────────────────────
  function step(dt) {
    K.clock += dt; if (P.down) K.downT += dt; const gs = s.size;
    const pouring = stepBottles(dt); stepLadle(dt); stepTap(dt); stepCarry(dt);
    for (const t of Object.values(things)) { t.lit = !!(K.shine && K.shine.t === t && Math.sin(K.shine.left * 22) > -0.2) || (K.carry && K.carry.t === t); stepThing(t, dt); }
    if (K.shine) { const q = K.shine; q.left -= dt; if (Math.random() < dt * 30) fx.spark(v3.set(q.t.x + rand(-0.3, 0.3) * q.t.size, q.t.y + rand(0.1, 1) * (q.t.ball ? q.t.r * 2 : q.t.h) * q.t.size, q.t.z + 0.2), '#fffbe0', 1, 0.04, 0.3); if (q.left <= 0) K.shine = null; }
    stepPot(dt); stepGlow(dt); stepBits(dt);
    // 고고의 눈길: 병과 붓는 줄기를 올려다보고, 젓는 손을 따라 고개를 빙글빙글 돌리고, 든 국자를 따라간다
    if (K.stirT > 0) K.stirT -= dt; if (K.gogoStir > 0) K.gogoStir -= dt;
    if (!B.tok) {
      const hb = BL.find(b => b.state === 'held' || b.state === 'auto'); let look = true;
      if (pouring) gogo.lookAt(v3.copy(K.pourFrom).setY(K.pourFrom.y - 0.25)); else if (hb) gogo.lookAt(hb.pos);
      else if (K.stirT > 0 && L.state === 'stir') { const a = Math.atan2(L.pos.z - POT.z, L.pos.x - POT.x); gogo.lookAt(v3.set(POT.x + Math.cos(a) * 1.5, POT.rim + 0.35 + Math.sin(a) * 0.9, POT.z + 0.4)); gogo.setMood('smile', 0.3); }
      else if (L.state === 'held' || L.state === 'fly') gogo.lookAt(L.pos); else if (K.carry) gogo.lookAt(centerOf(K.carry.t, v3)); else look = false;
      if (K.look && !look) gogo.lookAt(camera.position); K.look = look;
    } else K.look = false;
    // 몸을 털면 그 색 방울이 사방으로 튄다
    if (K.shakeT > 0) { K.shakeT -= dt; if (!has('shake')) s.sizeV += Math.sin(K.clock * 40) * 30 * dt; if (Math.random() < dt * 34) { const a = rand(0, 6.28); drop(v3.set(s.pos.x + Math.cos(a) * 0.3 * gs, s.y + rand(0.3, 0.95) * gs, s.pos.z + Math.sin(a) * 0.3 * gs), Math.cos(a) * rand(1, 2.4), rand(0.6, 2), Math.sin(a) * rand(1, 2.4), K.shakeCol, 0, 0.04); } }
    // 부딪힘: 냄비 · 수도꼭지 · 물건을 비켜 간다
    if (B.where === 'bench' && !B.hop) {
      for (const [ox, oz, or] of [[POT.x, POT.z, POT.R + 0.02], [TAP.x - 0.2, TAP.z, 0.42]]) { const dx = s.pos.x - ox, dz = s.pos.z - oz, d = Math.hypot(dx, dz) || 0.001, need = or + 0.3 * gs; if (d < need) { s.pos.x += dx / d * (need - d); s.pos.z = clamp(s.pos.z + dz / d * (need - d), BENCH.Z0, BENCH.Z1); } }
      for (const t of Object.values(things)) { if (t.y > 0.3 || t.state === 'fall' || t.state === 'gone') continue; const dx = s.pos.x - t.x, dz = s.pos.z - t.z, d = Math.hypot(dx, dz) || 0.001, need = 0.3 * gs + t.r * t.size * 0.85; if (d < need) { if (t.ball) t.vx -= dx / d * 3 * dt * 8; s.pos.x += dx / d * (need - d); s.pos.z = clamp(s.pos.z + dz / d * (need - d), BENCH.Z0, BENCH.Z1); } }
    }
    // 가만두면 혼자 젓고 맛본다(조르는 중 · 손이 닿아 있는 중에는 하지 않는다)
    const calm = !B.tok && !P.down && !s.moving && !s.act && B.where === 'bench' && !C.ask.active && !pouring && L.state === 'rest' && !K.carry && !K.dunk && K.vis >= 1 && !C.moving();
    if (calm) { B.idle += dt; if (B.idle > T.IDLE_STIR) run(idlePlay); } else if (P.down || s.moving) B.idle = 0;
  }
  /** 이 자리에 없을 때도 도는 일: 냄비가 뚜껑문으로 솟고 들어가고, 병 걸이가 내려오고 올라가고, 수도꼭지가 나오고 들어간다. 물약 빛도 같이 꺼지고 켜진다. */
  function bg(dt) {
    const to = K.here ? 1 : 0; if (K.vis === to && !K.here) return; if (K.vis !== to) K.vis += clamp(to - K.vis, -dt / T.FURN_SEC, dt / T.FURN_SEC);
    const e = ease(K.vis), lidK = clamp(K.vis / 0.3, 0, 1), up = ease(clamp((K.vis - 0.12) / 0.88, 0, 1)), vis = K.vis > 0.01;
    potG.position.y = -(1 - up) * T.POT_DROP; potG.visible = vis; hole.visible = vis; for (const l of lids) { l.g.rotation.z = -ease(lidK) * 1.75; l.g.visible = lidK < 1; }
    railG.position.y = T.RAIL.y + (1 - e) * T.RAIL_UP; railG.visible = vis; tapG.position.y = -(1 - e) * T.TAP_DROP; tapG.visible = vis; for (const b of BL) b.obj.visible = vis; ladG.visible = vis && K.vis > 0.5;
    if (!K.here) { stepBottles(dt); stepLadle(dt); stepPot(dt); stepGlow(dt); stepBits(dt); }                                  // 떠난 뒤에도 가구가 들어가는 동안은 움직임을 잇는다
  }
  /** 자리를 떠난다: 든 병 · 국자 · 물건은 제자리로. 냄비 안의 물약은 그대로 둔다(돌아오면 그대로). 거품과 무지개는 걷는다. */
  function leave() {
    for (const b of BL) { if (b.state !== 'rest') b.state = 'back'; b.auto = null; b.tiltTo = 0; } if (L.state !== 'rest') { L.fly = null; L.state = 'rest'; unload(); } L.tipTo = 0;
    if (K.carry) { const t = K.carry.t; K.carry = null; t.floor = 0; } K.rets.length = 0; if (K.dunk) { const t = K.dunk.t; K.dunk = null; t.y = 0.6; t.floor = 0; t.vy = 0.01; }
    K.foamT = Math.min(K.foamT, 0); K.bowT = 0; K.tapT = 0; K.shine = null; K.gogoStir = 0; K.mime = null; K.here = false; P.mode = null; K.press = null; if (s.act && s.act.loop) s.act = null;
  }

  const defRead = (n, k) => { const t = by(n); return !t ? undefined : k === 'size' ? t.size : t[k]; };
  return {
    title: D.title, T, K, L, bottles, asks: D.asks, place: T.PLACE, step, bg, onDown, onMove, onUp, nameOf, showOf,
    enter() { K.here = true; },
    leave,
    /** 조르면 안 되는 때: 넘치는 중 · 비는 중 · 퐁당 빠진 중 · 든 것이 있는 중. */
    busy: () => K.spillT > 0 || K.drainT > 0 || !!K.dunk || !!K.carry || L.state === 'fly' || BL.some(b => b.state === 'auto') || K.vis < 1,
    /** 몸으로 흉내: 색 낱말 = 그 병을 가리킨다(병이 흔들린다 — Pink 는 빨강과 흰 병) · Mix = 두 손으로 젓는 시늉. */
    mime(w, on) {
      K.mime = on ? w : null; if (!on) { gogo.pose('poke', 0); gogo.pose('reach', 0); if (s.act && s.act.name === 'stir') s.act = null; return; }
      if (w === 'mix') { gogo.act('stir'); if (!has('stir')) gogo.pose('reach', 1); gogo.lookAt(potTop(v3)); say('hm'); } else { const b = bottles[w === 'pink' ? 'red' : w]; if (b) gogo.lookAt(b.pos); gogo.pose('poke', 1); gogo.setMood('smile', 4); say('hm'); }
    },
    /** 부탁이 읽는 상태: 냄비(cauldron)의 mixed · pour(지금 붓는 색) · potion(다 섞인 물약의 이름) · poured(들어간 색의 수 — '2colors' 꼴). 나머지는 물건의 것. */
    read(n, k) { if (n !== 'cauldron') return defRead(n, k); return k === 'mixed' ? (inksN() >= 2 ? K.mixed : 0) : k === 'pour' ? (K.pourT > 0 ? K.pourNow : '') : k === 'potion' ? (K.vol > 0.05 && K.mixed >= 1 ? name() : '') : k === 'poured' ? inksN() + 'colors' : undefined; },
    top(n, out) { return n === 'cauldron' ? potTop(out) : by(n) ? topOf(by(n), out) : out.set(s.pos.x, 1.2, s.pos.z); },
    wiggle(n) { if (n === 'cauldron') { K.joltV += 3; K.boil = Math.max(K.boil, 1); } else if (things[n]) { const t = things[n]; t.tvx += rand(-1, 1) * 3; t.tvz += (Math.random() < 0.5 ? -1 : 1) * 6; if (t.y === 0) { t.vy = 1.6; t.y = 0.001; } } else if (!brain.busy) gogo.setMood('wow', 0.8); },
    /** 생각 방울에 넣을 작은 모형: 냄비는 빈 냄비, 물건은 물들지 않은 제 색으로(상태는 보여 주지 않는다 — 어떻게는 귀로 알아들어야 한다). */
    mini(n) { if (n === 'cauldron') { const m = M.pot.clone(); m.castShadow = m.receiveShadow = false; return m; } if (things[n]) { const m = things[n].mesh.clone(); m.geometry = skin.plain(n); m.material = C.part[n].material; m.castShadow = m.receiveShadow = false; m.position.set(0, 0, 0); m.rotation.set(0, 0.4, 0); return m; } return null; },
    summary: () => ({ pot: INKS.map(c => c[0] + +K.amt[c].toFixed(2)).join(' ') + ' vol' + K.vol.toFixed(2) + ' mix' + K.mixed.toFixed(2) + ' ' + (name() || 'empty') + ' #' + K.show.getHexString(), glow: K.glowKey + ' ' + K.glowK.toFixed(2) + ' #' + K.glowC.getHexString(), ladle: L.state + (L.load ? ':' + (L.load.water ? 'water' : L.load.name) : ''), dye: Object.fromEntries(targets.map(t => [t.name, t.color + (t.dyeHalf ? '/half' : '')])) }),
    auto: {
      pour: async (a, b, tick) => { C.ask.touch(); autoPour(a, +b || T.EASY_POUR); for (let i = 0; i < 1200 && bottles[a].state !== 'rest'; i++) await tick(); },
      stir: async (a, b, tick) => { C.ask.touch(); const n = Math.round((+a || 1) * 48); stirStart(POT.x + 0.3, POT.z); for (let i = 1; i <= n; i++) { const g = i / 48 * 6.283; stirTo(POT.x + Math.cos(g) * 0.3, POT.z + Math.sin(g) * 0.3); await tick(); } L.state = 'rest'; },
      rub: async (a, b, tick) => { C.ask.touch(); const n = Math.round((+a || 1) * 40); stirStart(POT.x - 0.3, POT.z); for (let i = 1; i <= n; i++) { stirTo(POT.x + Math.sin(i * 0.45) * 0.3, POT.z + 0.02); await tick(); } L.state = 'rest'; },
      scoop: async (a, b, tick) => { C.ask.touch(); if (L.state !== 'armed') ladleTap(); for (let i = 0; i < 24; i++) await tick(); },
      splash: async (a, b, tick) => { C.ask.touch(); if (L.state !== 'armed') ladleTap(); flyTo('thing', by(a)); for (let i = 0; i < 400 && L.state === 'fly'; i++) await tick(); },
      feed: async (a, b, tick) => { C.ask.touch(); if (L.state !== 'armed') ladleTap(); flyTo('mouth'); for (let i = 0; i < 400 && L.state === 'fly'; i++) await tick(); },
      water: async (a, b, tick) => { C.ask.touch(); if (L.state !== 'armed') ladleTap(); tapOn(T.TAP_RUN); flyTo('tap'); for (let i = 0; i < 400 && L.state === 'fly'; i++) await tick(); },
      tapon: () => { C.ask.touch(); tapOn(T.TAP_RUN); },
      plug: () => pullPlug(),
      name: () => { seen.add('pot=' + (name() || 'empty') + ' mix' + K.mixed.toFixed(2) + ' vol' + K.vol.toFixed(1) + ' #' + K.show.getHexString() + ' glow#' + K.glowC.getHexString() + '*' + K.glowK.toFixed(2) + ' ladle=' + L.state + (L.load ? ':' + (L.load.water ? 'water' : L.load.name) : '')); },      // 확인용: 냄비의 지금 상태를 seen 에 적는다(껍데기의 요약에 자리의 summary 가 아직 없어서)
      grab: async (a, b, tick) => { const q = bottles[a]; q.state = 'held'; grabBottle(q); P.x = stage.screenOf(v3.set(+b || q.home.x, 1.9, POT.z)).x; P.y = stage.screenOf(v3).y; for (let i = 0; i < 40; i++) await tick(); q.state = 'back'; },
      paint: async (a, b, tick) => {                                                       // 붓기 → 젓기 → 뜨기 → 끼얹기를 한 번에(같은 함수들을 차례로 부른다)
        C.ask.touch(); if (L.state !== 'rest') { L.state = 'back'; for (let i = 0; i < 60 && L.state !== 'rest'; i++) await tick(); } if (K.vol > 0.01) { pullPlug(); for (let i = 0; i < 200 && K.vol > 0; i++) await tick(); }
        for (const c of RECIPE[b] || [b]) { autoPour(c, 1); for (let i = 0; i < 600 && bottles[c].state !== 'rest'; i++) await tick(); }
        if (K.mixed < 1) { stirStart(POT.x + 0.3, POT.z); for (let i = 1; i <= 96 && K.mixed < 1; i++) { const g = i / 48 * 6.283; stirTo(POT.x + Math.cos(g) * 0.3, POT.z + Math.sin(g) * 0.3); await tick(); } L.state = 'rest'; }
        ladleTap(); for (let i = 0; i < 12; i++) await tick(); flyTo('thing', by(a)); for (let i = 0; i < 400 && L.state === 'fly'; i++) await tick();
      },
      dunk: async (a, b, tick) => { C.ask.touch(); const t = by(a); carryStart(t); K.carry.auto = [POT.x, POT.rim + 0.6]; for (let i = 0; i < 30; i++) await tick(); if (K.carry) { K.carry.auto = [POT.x, POT.rim]; for (let i = 0; i < 20 && K.carry; i++) await tick(); } if (K.carry) carryEnd(); },
      carry: async (a, b, tick) => { C.ask.touch(); const t = by(a); carryStart(t); K.carry.auto = b === 'tap' ? [OUT.x, 0.1] : [POT.x, POT.rim + 0.5]; for (let i = 0; i < 70; i++) await tick(); if (K.carry) carryEnd(); },
    },
  };
}
