// 케이모션 과학실 — 실험 2 「공기를 빼면」 기구 올리기: assets/props/vacuum/*.glb (+ props.json 이 있으면 그 값)
// 기구 GLB 는 다른 작업이 만들고 있다 → 파일이 없거나 부품(자식 노드)이 빠져도 멈추지 않는다:
//   · GLB 가 없으면 크기를 맞춘 대신 모형(같은 노드 이름)을 쓰고, 파일이 생기면 다음에 열 때 저절로 진짜를 쓴다.
//   · bell_cracked 는 bell.glb 를 복제해 가는 금(crack_fine)과 큰 금(crack_big, 처음엔 숨김)을 덧그린다(진짜 파일이 오면 그것을 쓴다).
// 반환: { glb: { id: Object3D }, meta: { id: { extras, size, placeholder } }, placeholder: Set }
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BASE = './assets/props/vacuum/';
const loader = new GLTFLoader();

// 대신 모형의 크기(m) — 설계·기구 작업 메모에 맞춘 것
export const SIZE = { plate: [.38, .05, .32], pump: [.3, .56, .1], shield: [.64, .55, .3], bell: [.256, .312, .256], bell_cracked: [.256, .312, .256],
  marshmallow: [.116, .04, .116], balloon_s: [.07, .11, .07], clock: [.092, .136, .05], beaker_water: [.09, .12, .09], candle: [.1, .07, .1],
  suction: [.15, .18, .07], foam: [.11, .05, .11], chips: [.13, .03, .17], sponge: [.14, .035, .14], droptube: [.07, .42, .07] };

const mat = (name, color, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? .5, metalness: o.m ?? 0, transparent: !!o.t, opacity: o.t ?? 1 }); m.name = name; return m; };
function node(parent, name, obj, x = 0, y = 0, z = 0){ const o = obj || new THREE.Object3D(); o.name = name; o.position.set(x, y, z); parent.add(o); return o; }
function mesh(parent, name, geo, m, x = 0, y = 0, z = 0){ const o = new THREE.Mesh(geo, m); return node(parent, name, o, x, y, z); }
const cyl = (r, h, open = false, seg = 28) => { const g = new THREE.CylinderGeometry(r, r, h, seg, 1, open); g.translate(0, h / 2, 0); return g; };

/** 금: 유리 겉면을 따라 꺾이는 가는 선(가는 금 = 자세히 보면 보임 · 큰 금 = 쩍 하고 번진 것) */
function crackLines(r, h, seed, n, len){
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pts = [];
  for (let k = 0; k < n; k++) { let a = .3 + rnd() * .9, y = h * (.25 + rnd() * .5);
    for (let j = 0; j < len; j++) { const a2 = a + (rnd() - .5) * .25, y2 = Math.max(.01, Math.min(h * .95, y + (rnd() - .4) * .05));
      const rr = r * (y > h * .8 ? .8 : 1) + .0015, rr2 = r * (y2 > h * .8 ? .8 : 1) + .0015;
      pts.push(Math.sin(a) * rr, y, Math.cos(a) * rr, Math.sin(a2) * rr2, y2, Math.cos(a2) * rr2); a = a2; y = y2; } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
}
function addCracks(root, r, h){
  const fine = new THREE.LineSegments(crackLines(r, h, 77, 3, 5), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 }));
  const big = new THREE.LineSegments(crackLines(r, h, 991, 9, 9), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 }));
  node(root, 'crack_fine', fine); node(root, 'crack_big', big); big.visible = false; fine.renderOrder = big.renderOrder = 4;
}

/** 대신 모형 하나(진짜 GLB 와 같은 노드 이름을 갖게) */
function placeholder(id, glb){
  const g = new THREE.Group(); g.name = id; node(g, 'base');
  const S = SIZE[id] || [.08, .08, .08];
  switch (id) {
    case 'bell_cracked': {
      if (glb.bell) { const c = glb.bell.clone(true); c.name = 'bell_cracked'; addCracks(c, .1278, .30); return c; }
      mesh(g, 'bell_glass', cyl(.128, .3, true), mat('glass_bell', 0xe4f3ec, { t: .25, r: .05 })); node(g, 'grip', null, 0, .296, 0); addCracks(g, .1278, .30); return g; }
    case 'bell': mesh(g, 'bell_glass', cyl(.128, .3, true), mat('glass_bell', 0xe4f3ec, { t: .25, r: .05 })); node(g, 'grip', null, 0, .296, 0); return g;
    case 'beaker_water': {
      const glass = mesh(g, 'beaker_glass', cyl(.045, .12, true), mat('glass_beaker', 0xeef6f6, { t: .25, r: .05 }));
      mesh(g, 'beaker_floor', new THREE.CylinderGeometry(.045, .045, .004, 28), mat('glass_beaker_floor', 0xeef6f6, { t: .3 }), 0, .002, 0); glass.renderOrder = 2;
      const inner = mesh(g, 'inner_volume', cyl(.041, .085), mat('liquid_fill', 0x9fc8d8), 0, .005, 0); inner.visible = false;
      node(g, 'inner', null, 0, .005, 0); node(g, 'grip', null, .045, .07, 0);
      const tube = mesh(g, 'thermo_tube', cyl(.004, .16), mat('glass_thermo', 0xffffff, { t: .35 }), .018, .012, .012); tube.rotation.z = -.12;
      const col = mesh(tube, 'thermo_column', cyl(.0018, .14), new THREE.MeshBasicMaterial({ color: 0xd8262a }), 0, .006, 0); col.name = 'thermo_column';
      mesh(tube, 'thermo_bulb', new THREE.SphereGeometry(.0042, 12, 8), new THREE.MeshBasicMaterial({ color: 0xd8262a }), 0, .006, 0);
      return g; }
    case 'droptube': {
      mesh(g, 'tube_glass', cyl(.03, .4, true), mat('glass_tube', 0xeef6f6, { t: .22 }), 0, .015, 0);
      mesh(g, 'tube_caps', cyl(.034, .015), mat('plastic_cap', 0x2a2d33), 0, 0, 0); mesh(g, 'tube_cap_top', cyl(.034, .015), mat('plastic_cap2', 0x2a2d33), 0, .415, 0);
      mesh(g, 'ball', new THREE.SphereGeometry(.009, 14, 10), mat('metal_ball', 0xc8ccd0, { m: 1, r: .25 }), -.01, .025, 0);
      const f = mesh(g, 'feather', new THREE.PlaneGeometry(.012, .05), new THREE.MeshStandardMaterial({ color: 0xf4f0e6, side: THREE.DoubleSide, roughness: .9 }), .01, .04, 0); f.rotation.z = .4;
      node(g, 'grip', null, 0, .3, 0); g.userData.top = .41; return g; }
    case 'plate': {
      mesh(g, 'plate_body', cyl(.17, .028), mat('metal_cast_plate', 0x5a5f66, { m: .6, r: .4 }));
      mesh(g, 'plate_gasket', cyl(.131, .034, true), mat('rubber_gasket', 0x111111, { r: .8 }));
      const gauge = node(g, 'gauge', null, .181, .112, -.039); mesh(gauge, 'gauge_dial', new THREE.CircleGeometry(.034, 24), new THREE.MeshBasicMaterial({ color: 0xf2f0ea }));
      const nd = mesh(gauge, 'needle', new THREE.BoxGeometry(.003, .03, .002).translate(0, .012, .002), new THREE.MeshBasicMaterial({ color: 0xd02020 })); nd.userData = { angleMin: -135, angleMax: 135, axis: [0, 0, 1] };
      mesh(g, 'gauge_stem', cyl(.006, .08), mat('metal_brass_plate', 0xb08d3a, { m: 1 }), .181, .03, -.039);
      const vk = mesh(g, 'valve_knob', cyl(.014, .016), mat('plastic_knob_red', 0xc0221a), -.164, .048, .087); vk.userData = { turn: 180, axis: [0, 1, 0] };
      node(g, 'seat', null, 0, .03, 0).userData = { r: .106 }; node(g, 'bell_seat', null, 0, .034, 0); node(g, 'hose_port', null, -.13, .039, -.167); node(g, 'grip', null, .1, .03, .1);
      return g; }
    case 'pump': {
      mesh(g, 'pump_foot', new THREE.BoxGeometry(.25, .028, .09).translate(0, .014, 0), mat('metal_cast_pump_foot', 0x3a3e44, { m: .6 }));
      mesh(g, 'pump_barrel', cyl(.026, .5), mat('metal_pump_barrel', 0x9aa0a6, { m: 1, r: .3 }), 0, .024, 0);
      const h = node(g, 'handle'); h.userData = { travel: .3, axis: [0, 1, 0] };
      mesh(h, 'handle_rod', cyl(.006, .33), mat('metal_chrome_rod', 0xdddddd, { m: 1, r: .2 }), 0, .195, 0);
      mesh(h, 'handle_bar', new THREE.BoxGeometry(.29, .03, .024), mat('metal_handle_black', 0x1a1a1a), 0, .536, 0);
      node(h, 'grip', null, .085, .537, 0); node(h, 'grip_l', null, -.085, .537, 0); node(g, 'hose_port', null, .13, .009, .181);
      return g; }
    case 'shield': {
      mesh(g, 'shield_panel', new THREE.BoxGeometry(.59, .44, .006).translate(0, .297, 0), mat('glass_polycarbonate', 0xeef6f6, { t: .2 }));
      mesh(g, 'shield_frame', new THREE.BoxGeometry(.64, .03, .3).translate(0, .03, 0), mat('metal_alu_frame', 0xb8bcc2, { m: 1 }));
      node(g, 'grip', null, 0, .545, 0); return g; }
    case 'marshmallow': mesh(g, 'dish', cyl(.058, .012), mat('plastic_dish_white', 0xf4f4f4)); mesh(g, 'marsh', cyl(.033, .029), mat('organic_marshmallow', 0xfff6ee, { r: .9 }), 0, .004, 0); node(g, 'grip', null, .058, .012, 0); return g;
    case 'balloon_s': mesh(g, 'stand', cyl(.025, .018), mat('wood_ring', 0x9a6a3a)); mesh(g, 'balloon', new THREE.SphereGeometry(.033, 20, 14).translate(0, .05, 0), mat('rubber_balloon_blue', 0x2a6fd8, { r: .4 })); node(g, 'grip', null, 0, .047, 0); return g;
    case 'clock': { mesh(g, 'clock_body', cyl(.045, .09).rotateX(Math.PI / 2).translate(0, .06, 0), mat('metal_clock_red', 0xc0221a, { m: .5 })); const hm = mesh(g, 'hammer', cyl(.004, .03), mat('metal_chrome_clock', 0xdddddd, { m: 1 }), 0, .101, -.002); hm.userData = { axis: [0, 0, 1], amp: 14, hz: 18 }; node(g, 'grip', null, 0, .132, -.01); return g; }
    case 'candle': mesh(g, 'holder', cyl(.048, .016), mat('metal_tin_holder', 0x9aa0a6, { m: 1 })); mesh(g, 'candle_body', cyl(.018, .056), mat('organic_wax', 0xf4ecd8), 0, .004, 0); node(g, 'flame', null, 0, .066, 0); node(g, 'grip', null, .066, .004, 0); return g;
    case 'suction': { mesh(g, 'stand_base', new THREE.BoxGeometry(.15, .012, .07).translate(0, .006, 0), mat('plastic_stand_black', 0x1a1a1a)); mesh(g, 'stand_arch', new THREE.BoxGeometry(.13, .012, .05).translate(0, .172, 0), mat('metal_alu_arch', 0xb8bcc2, { m: 1 }));
      mesh(g, 'cup', new THREE.CylinderGeometry(.02, .02, .01, 16).translate(0, -.005, 0), mat('rubber_suction_cup', 0xd8a040, { t: .8 }), 0, .163, 0); const w = mesh(g, 'weight', cyl(.012, .043), mat('metal_brass_weight', 0xb08d3a, { m: 1 }), .005, .095, 0); w.userData = { drop: .0835 };
      node(g, 'floor', null, .005, .012, 0); node(g, 'grip', null, 0, .172, 0); return g; }
    case 'foam': mesh(g, 'dish', cyl(.055, .01), mat('plastic_dish_blue', 0x3a7bd5)); mesh(g, 'blob', new THREE.SphereGeometry(.042, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('liquid_foam', 0xffffff, { r: .95 }), 0, .004, 0); node(g, 'grip', null, .055, .01, 0); return g;
    case 'chips': mesh(g, 'bag', new THREE.BoxGeometry(.128, .027, .172).translate(0, .0135, 0), mat('plastic_foil_bag', 0xe0b030, { m: .6, r: .3 })); node(g, 'grip', null, 0, .006, -.07); return g;
    case 'sponge': mesh(g, 'dish', cyl(.07, .012), mat('plastic_saucer_white', 0xf4f4f4)); mesh(g, 'sponge_body', new THREE.BoxGeometry(.098, .022, .066).translate(0, .015, 0), mat('organic_sponge_wet', 0xe8d040, { r: .95 })); node(g, 'grip', null, 0, .033, 0); return g;
    default: mesh(g, 'body', new THREE.BoxGeometry(S[0], S[1], S[2]).translate(0, S[1] / 2, 0), mat('plastic_placeholder', 0x888888)); node(g, 'grip', null, 0, S[1] * .8, 0); return g;
  }
}

/** 노드의 extras(userData)를 모아 meta.extras 로 — props.json 이 없을 때도 같은 모양 */
function extrasOf(root){ const ex = {}; root.traverse(o => { const u = o.userData; if (u && Object.keys(u).length && o.name) ex[o.name] = u; }); return ex; }

/** names 를 받는다. GLB 가 없거나 깨졌으면 대신 모형. 빠진 부품은 부품 대신 노드를 덧붙인다(부르는 쪽이 E(name) 로 찾을 수 있게). */
export async function loadVacuumAssets(names){
  let meta = { props: {} }; try { const r = await fetch(BASE + 'props.json', { cache: 'no-cache' }); if (r.ok) meta = await r.json(); } catch (_) {}
  const glb = {}, info = {}, ph = new Set(), sleep = ms => new Promise(r => setTimeout(r, ms));
  const queue = names.filter(n => n !== 'bell_cracked').concat(names.includes('bell_cracked') ? ['bell_cracked'] : []);   /* 금 간 종은 맨 뒤(진짜가 없으면 bell 을 복제하니까) */
  async function one(n){ const file = (meta.props[n] && meta.props[n].file) || (n + '.glb');
    for (let k = 0; k < 3; k++) { try { const r = await fetch(BASE + file, { method: 'HEAD', cache: 'no-cache' }); if (!r.ok) break; glb[n] = (await loader.loadAsync(BASE + file)).scene; return; }
      catch (e) { if (k === 2) console.warn('[lab vac] 기구를 못 올림 → 대신 모형', n, e); else await sleep(250 * (k + 1)); } } }
  // 네 개씩(작은 서버·학교 망에서 한꺼번에 받다 끊기지 않게). bell_cracked 는 bell 을 쓰니 따로 마지막에
  const main = queue.filter(n => n !== 'bell_cracked');
  await Promise.all(Array.from({ length: 4 }, async () => { while (main.length) await one(main.shift()); }));
  if (names.includes('bell_cracked')) await one('bell_cracked');
  for (const n of names) {
    if (!glb[n]) { glb[n] = placeholder(n, glb); ph.add(n); }
    else if (n === 'bell_cracked' && !glb[n].getObjectByName('crack_big')) addCracks(glb[n], .1278, .30);   /* 진짜 금 간 종에 큰 금이 빠졌으면 */
    info[n] = { ...(meta.props[n] || {}), extras: { ...extrasOf(glb[n]), ...((meta.props[n] || {}).extras || {}) }, placeholder: ph.has(n) };
    if (!info[n].size) { const b = new THREE.Box3().setFromObject(glb[n]); const s = b.getSize(new THREE.Vector3()); info[n].size = [s.x, s.y, s.z]; }
  }
  return { glb, meta: info, placeholder: ph };
}

/** 빠진 부품을 찾을 때: 있으면 그것, 없으면 부모 아래 빈 노드를 만들어 돌려준다(부품을 움직여도 아무 일 없게) */
export function partOf(root, name, fallbackPos){ let o = root.getObjectByName(name); if (o) return o; o = new THREE.Object3D(); o.name = name; if (fallbackPos) o.position.fromArray(fallbackPos); root.add(o); o.userData.missing = true; return o; }
