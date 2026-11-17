/* 수학 놀이터 3D 무대 — 다리 길·광장·가게 섬(그리고 뒤의 낚시 섬)이 같은 바다로 보이게 한 벌로 쓴다.
 * 하늘 빛깔 · 바다(물결) · 깊은 물 · 해와 그림자 · 카메라 · 재료 불러오기(GLTF) · 모형을 이어진 조각으로 나누기 · 작은 tween · 사람(애니메이션) · 화면 좌표.
 * 코드로 그리는 것은 바다 평면과 하늘 빛깔뿐 — 물체는 모두 기성 재료(Quaternius Pirate Kit, CC0).
 * ?lite = 그림자·물결 끔·낮은 해상도(느린 기기와 하네스용). 섬 페이지는 무대를 만들고, 매 장면의 일은 frame(fn) 으로 덧붙인다. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneRig } from 'three/addons/utils/SkeletonUtils.js';
export { THREE };

const Q = new URLSearchParams(location.search);
/* 가벼운 판: ?lite 로 켜거나, 처음 몇 초가 느리면 스스로 켠다(이 창이 열려 있는 동안은 다른 섬도 가볍게 시작 — sessionStorage `kedu_mathplay_lite`, 기기에 남기지 않음). ?hq = 스스로 켜지 않음 */
const LITE_KEY = 'kedu_mathplay_lite', remembered = (() => { try { return sessionStorage.getItem(LITE_KEY) === '1'; } catch (_) { return false; } })();
export const LITE = Q.has('lite') || (remembered && !Q.has('hq')), CALM = Q.has('calm');
export const AUTO = { FROM: 1.2, SPAN: 3, FPS: 22 };   // 불러온 뒤 1.2초부터 3초 동안의 평균이 초당 22장보다 느리면 가볍게
/** 기본 빛깔(다리 길에서 정한 것 — 네 곳이 같은 바다) */
export const LOOK = { SKY: ['#5fb8ea', '#bfe6f5', '#e8f6fb'], SEA: 0x2b9fd2, DEEP: 0x0f6a9c, FOG: 0xbfe6f5, HEMI: [0xeaf6ff, 0x7aa37a, 1.25], SUN: [0xfff1d8, 2.4] };

/** 무대를 만든다. opt = { canvas, seaX(바다 가운데 x), seaW, fog:[가까이,멀리], shadow:{left,right,top,bottom} } */
export function createStage(opt){
  const canvas = opt.canvas, renderer = new THREE.WebGLRenderer({ canvas, antialias: !LITE, powerPreference: 'high-performance' });
  renderer.setPixelRatio(LITE ? .6 : Math.min(devicePixelRatio || 1, 1.75)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = !LITE; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), fog = opt.fog || [24, 70]; scene.fog = new THREE.Fog(LOOK.FOG, fog[0], fog[1]);
  const sky = document.createElement('canvas'); sky.width = 4; sky.height = 256; const skyX = sky.getContext('2d'), skyTex = new THREE.CanvasTexture(sky); skyTex.colorSpace = THREE.SRGBColorSpace; scene.background = skyTex;
  function paintSky(c = LOOK.SKY){ const g = skyX.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, c[0]); g.addColorStop(.6, c[1]); g.addColorStop(1, c[2]); skyX.fillStyle = g; skyX.fillRect(0, 0, 4, 256); skyTex.needsUpdate = true; }
  paintSky();
  const hemi = new THREE.HemisphereLight(...LOOK.HEMI); scene.add(hemi);
  const sun = new THREE.DirectionalLight(...LOOK.SUN); sun.castShadow = !LITE; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 8, bottom: -6, near: 1, far: 40, ...(opt.shadow || {}) }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .04; scene.add(sun, sun.target);
  const W = opt.seaW || 140, seaG = new THREE.PlaneGeometry(W, 120, W / 2, 60).rotateX(-Math.PI / 2), sea = new THREE.Mesh(seaG, new THREE.MeshStandardMaterial({ color: LOOK.SEA, roughness: .35, metalness: .05, transparent: true, opacity: .92, flatShading: true }));
  sea.receiveShadow = true; sea.position.x = opt.seaX || 0; scene.add(sea); const seaBase = seaG.attributes.position.array.slice();
  const deep = new THREE.Mesh(new THREE.PlaneGeometry(W, 120).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: LOOK.DEEP })); deep.position.set(opt.seaX || 0, -1.6, 0); scene.add(deep);
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 200);

  // ── 재료
  const loader = new GLTFLoader(), cache = new Map();
  const load = n => { if (!cache.has(n)) cache.set(n, loader.loadAsync(`${opt.assets || './assets/'}${n}.glb`)); return cache.get(n); };
  const shadows = (o, cast = true) => { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } }); return o; };
  /** 모형을 놓는다. */
  const put = (o, x, y, z, s = 1, ry = 0) => { const c = o.scene.clone(); c.position.set(x, y, z); c.scale.setScalar(s); c.rotation.y = ry; scene.add(shadows(c)); return c; };

  // ── tween(아주 작은 것) · 사람
  const tweens = [], people = [], frames = [];
  function tween(o, to, ms, ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2){ return new Promise(res => { const from = {}; for (const k in to) from[k] = k.split('.').reduce((a, b) => a[b], o); tweens.push({ o, to, from, ms: Math.max(1, ms), t: 0, ease, res }); }); }
  const setPath = (o, k, v) => { const ks = k.split('.'), last = ks.pop(); ks.reduce((a, b) => a[b], o)[last] = v; };
  /** 사람 하나(애니메이션 있는 캐릭터 모형). 무기는 숨기고, tint 를 주면 빛깔을 입힌다. */
  function person(rig, { tint = null, scale = .62 } = {}){ const obj = cloneRig(rig.scene); obj.traverse(m => { if (/^Weapon_/.test(m.name)) m.visible = false; if (tint && m.isMesh) { m.material = m.material.clone(); m.material.color.set(tint).lerp(new THREE.Color('#ffffff'), .45); }   /* 빛깔은 옅게(무늬가 살게) */ }); obj.scale.setScalar(scale); scene.add(shadows(obj));
    const mixer = new THREE.AnimationMixer(obj), acts = {}; for (const clip of rig.animations) acts[clip.name] = mixer.clipAction(clip); const p = { obj, mixer, acts, act: null, rig }; people.push(p); return p; }
  const unperson = p => { scene.remove(p.obj); const i = people.indexOf(p); if (i >= 0) people.splice(i, 1); };
  function play(p, name, once = false){ const next = p.acts[name]; if (!next || p.act === next) return; next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); next.clampWhenFinished = once; next.play(); if (p.act) p.act.crossFadeTo(next, .25, false); p.act = next; }
  const face = (p, dir) => { p.obj.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; };
  /** x 까지 걷거나 달린다(speed = 초당 거리). */
  async function go(p, x, speed, run = false){ const o = p.obj; if (Math.abs(x - o.position.x) < .02) return; face(p, x - o.position.x); play(p, run ? 'Run' : 'Walk'); await tween(o, { 'position.x': x }, Math.abs(x - o.position.x) / speed * 1000, t => t); play(p, 'Idle'); }

  /** 모형의 메시 하나를 이어진 조각으로 나눈다 → [{ geo, size, center, tris }] (위치가 같은 정점을 이어 봄). 선착장 → 판자·받침·기둥. */
  function pieces(mesh){ const g = mesh.geometry, pos = g.attributes.position, idx = g.index ? g.index.array : null, n = idx ? idx.length : pos.count, key = new Map(), rep = new Int32Array(pos.count);
    for (let i = 0; i < pos.count; i++) { const k = `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`; if (!key.has(k)) key.set(k, key.size); rep[i] = key.get(k); }
    const par = Array.from({ length: key.size }, (_, i) => i), find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }, at = t => idx ? idx[t] : t;
    for (let t = 0; t < n; t += 3) { const a = find(rep[at(t)]); par[find(rep[at(t + 1)])] = a; par[find(rep[at(t + 2)])] = a; }
    const groups = new Map(); for (let t = 0; t < n; t += 3) { const r = find(rep[at(t)]); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(t); }
    return [...groups.values()].map(ts => { const geo = new THREE.BufferGeometry(); for (const name of Object.keys(g.attributes)) { const src = g.attributes[name], arr = new Float32Array(ts.length * 3 * src.itemSize); let o = 0; for (const t of ts) for (let j = 0; j < 3; j++) { const v = at(t + j); for (let c = 0; c < src.itemSize; c++) arr[o++] = src.getComponent(v, c); } geo.setAttribute(name, new THREE.BufferAttribute(arr, src.itemSize)); }
      geo.computeBoundingBox(); const b = geo.boundingBox; return { geo, size: b.getSize(new THREE.Vector3()), center: b.getCenter(new THREE.Vector3()), tris: ts.length }; }); }
  /** 선착장 모형 → { planks:[가운데 맞춘 판자 모양…], frame:[받침·기둥 조각…], mat, plankH } */
  function dockKit(dock){ let mesh = null; dock.scene.traverse(m => { if (m.isMesh && !mesh) mesh = m; }); const ps = pieces(mesh), planks = ps.filter(p => p.size.z > 1.9 && p.size.y < .15 && p.size.x < .4);
    return { mat: mesh.material, frame: ps.filter(p => !planks.includes(p)), planks: planks.map(p => { const g = p.geo.clone(); g.translate(-p.center.x, -p.center.y, -p.center.z); return g; }), plankH: planks[0].size.y, plankAt: planks.map(p => p.center.clone()) }; }

  // ── 화면 좌표 · 크기 · 그리기
  const screenOf = obj => { const v = (obj.isVector3 ? obj.clone() : obj.getWorldPosition(new THREE.Vector3())).project(camera), b = canvas.getBoundingClientRect(); return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  /** 누른 자리에서 나가는 빛줄기(끌기용). */
  const pointerRay = e => { const b = canvas.getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ndc, camera); return ray; };
  let onResize = null; function resize(){ renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; if (onResize) onResize(innerWidth, innerHeight); camera.updateProjectionMatrix(); } addEventListener('resize', resize);
  const st = { t: 0, waves: !LITE, lite: LITE, frames: 0, t0: 0 };
  function goLite(){ if (st.lite) return; st.lite = true; st.waves = false; renderer.shadowMap.enabled = false; sun.castShadow = false; renderer.setPixelRatio(.7); scene.traverse(m => { if (m.material) m.material.needsUpdate = true; }); try { sessionStorage.setItem(LITE_KEY, '1'); } catch (_) {} }
  let last = performance.now(); function loop(now){ requestAnimationFrame(loop); const raw = (now - last) / 1000, dt = Math.max(0, Math.min(.05, raw)); last = now; st.t += dt; const t = st.t;
    if (!st.lite && !Q.has('hq') && !st.judged) { st.real = (st.real || 0) + Math.min(raw, 1); if (st.real > AUTO.FROM) { st.frames++; st.t0 = st.t0 || st.real; if (st.real - st.t0 >= AUTO.SPAN) { st.judged = true; if (st.frames / (st.real - st.t0) < AUTO.FPS) goLite(); } } }
    const sp = seaG.attributes.position; if (st.waves) { for (let i = 0; i < sp.count; i++) { const x = seaBase[i * 3], z = seaBase[i * 3 + 2]; sp.array[i * 3 + 1] = Math.sin(x * .45 + t * 1.2) * .05 + Math.cos(z * .5 + t * .9) * .05; } sp.needsUpdate = true; }
    for (const f of frames) f(dt, t);
    for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt * 1000; const k = Math.min(1, w.t / w.ms), e = w.ease(k); for (const key in w.to) setPath(w.o, key, w.from[key] + (w.to[key] - w.from[key]) * e); if (k >= 1) { tweens.splice(i, 1); w.res(); } }
    for (const p of people) p.mixer.update(dt);
    renderer.render(scene, camera); }
  requestAnimationFrame(loop);
  return { THREE, scene, camera, renderer, sun, hemi, sea, deep, seaBase, paintSky, load, put, shadows, pieces, dockKit, tween, tweens, person, unperson, play, face, go, people, screenOf, pointerRay, frame: f => frames.push(f), resize, set onResize(f){ onResize = f; }, st }; }

export const sleep = ms => new Promise(r => setTimeout(r, ms));
