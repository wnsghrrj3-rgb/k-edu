// 케이모션 과학실 — 효과 묶음: 안개·끓음·서리·깨짐·붓는 줄기·액면·유리를 한 번에 만들고 update(dt) 하나로 돌린다
// 모든 효과는 update(dt) 로만 시간이 흐른다(자기 시계 없음) → 무대의 advance()·느린 동작과 그대로 맞는다.
// 무늬(잡음·연기 조각)는 받아 오지 않고 여기서 만든다.
import * as THREE from 'three';
import { SETTINGS, settingsOf, createQuality, createPost, guessTier, TIERS } from './quality.js';
import { createFog, FX_LAYER } from './fog.js';
import { createBoil } from './boil.js';
import { createFrost } from './frost.js';
import { createShatter } from './shatter.js';
import { createPour } from './pour.js';
import { createLevel } from './level.js';
import { createGlass } from './glass.js';

export { SETTINGS, settingsOf, createQuality, createPost, guessTier, TIERS, FX_LAYER, createFog, createBoil, createFrost, createShatter, createPour, createLevel, createGlass };

/** 씨앗 있는 난수(같은 dt 로 흘리면 같은 그림) */
export function makeRand(seed = 20261117){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** 이어 붙는 잡음 무늬 256²: R = 큰 얼룩, G = 잔 얼룩, B = 세포(결정) 무늬, A = 흰 잡음 */
export function makeNoiseTexture(rand = makeRand(7)){
  const S = 256, data = new Uint8Array(S * S * 4);
  const lattice = n => { const a = new Float32Array(n * n); for (let i = 0; i < a.length; i++) a[i] = rand(); return a; };
  const value = (lat, n) => (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), x0 = xi % n, x1 = (xi + 1) % n, y0 = yi % n, y1 = (yi + 1) % n;
    return (lat[y0 * n + x0] * (1 - sx) + lat[y0 * n + x1] * sx) * (1 - sy) + (lat[y1 * n + x0] * (1 - sx) + lat[y1 * n + x1] * sx) * sy; };
  const oct = [8, 16, 32, 64, 128].map(n => value(lattice(n), n));
  const CN = 16, cx = lattice(CN), cy = lattice(CN);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S, i = (y * S + x) * 4;
    const r = oct[0](u * 8, v * 8) * .5 + oct[1](u * 16, v * 16) * .27 + oct[2](u * 32, v * 32) * .15 + oct[3](u * 64, v * 64) * .08;
    const g = oct[2](u * 32 + 5.5, v * 32 + 1.5) * .5 + oct[3](u * 64 + 3.5, v * 64) * .3 + oct[4](u * 128, v * 128 + 7.5) * .2;
    const gx = u * CN, gy = v * CN, ix = Math.floor(gx), iy = Math.floor(gy); let f1 = 9;
    for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { const qx = ((ix + k) % CN + CN) % CN, qy = ((iy + j) % CN + CN) % CN, d = Math.hypot(ix + k + cx[qy * CN + qx] - gx, iy + j + cy[qy * CN + qx] - gy); if (d < f1) f1 = d; }
    const st = t => Math.max(0, Math.min(255, Math.round(t * 255)));
    data[i] = st((r - .5) * 1.7 + .5); data[i + 1] = st((g - .5) * 1.9 + .5); data[i + 2] = st(f1 / 1.05); data[i + 3] = st(rand());
  }
  const t = new THREE.DataTexture(data, S, S, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}

/** 효과들이 같이 쓰는 것: 장면·카메라·등급 값·상판 자리·잡음 무늬·난수 */
/** 상판 네모: { y, x0, x1, z0, z1, floorY } 또는 room.json 의 benchTop 모양 { y, xMin, xMax, zMin, zMax } 을 받아 앞의 모양으로 */
export function benchOf(r, base = {}){
  if (!r) return { ...base };
  return { ...base, y: r.y ?? base.y, x0: r.x0 ?? r.xMin ?? base.x0, x1: r.x1 ?? r.xMax ?? base.x1, z0: r.z0 ?? r.zMin ?? base.z0, z1: r.z1 ?? r.zMax ?? base.z1, floorY: r.floorY ?? base.floorY };
}
export function makeContext(stage, opt = {}){
  const tier = TIERS.includes(opt.tier) ? opt.tier : 'mid', y = stage.BENCH_Y ?? .8;
  const rand = makeRand(opt.seed);
  // 상판: opt.bench > stage.benchRect(구운 방의 room.json benchTop) > 회색 판 기본값
  const bench = benchOf(opt.bench || stage.benchRect, { y, x0: -1.33, x1: 1.33, z0: -.41, z1: .41, floorY: 0 });
  return { scene: stage.scene, camera: stage.camera, renderer: stage.renderer, tier, q: { ...settingsOf(tier) }, rand, noise: makeNoiseTexture(makeRand(7)),
    bench, fog: null, noFogDepth: null };
}

/**
 * const fx = createFx(stage, { tier: 'high'|'mid'|'low', bench: { y, x0, x1, z0, z1, floorY } })
 *   stage 에서 쓰는 것: scene · camera · renderer · BENCH_Y (· sun 이 있으면 안개에 비치는 빛 방향)
 *   매 프레임 한 번: fx.update(dt)     ← stage.onTick((dt) => fx.update(dt)) (느린 동작이 곱해진 dt)
 *   fx.fog · fx.frost · fx.shatter · fx.pour · fx.glass  — 하나씩 있는 것
 *   fx.newBoil(opt) · fx.newLevel(inner, opt) · fx.newPour() — 그릇·줄기마다 만드는 것(update 는 fx 가 돌린다)
 *   fx.vessel(inner, opt) — 그릇 하나 = 액면 + 끓음 + 가장자리 안개를 값 둘(fill, boil)로 묶은 것
 */
export function createFx(stage, opt = {}){
  const ctx = makeContext(stage, opt), list = [];
  const fog = opt.fog === false ? null : createFog(ctx, { light: stage.sun ? stage.sun.position.clone().sub(stage.sun.target.position) : undefined });
  ctx.fog = fog; ctx.noFogDepth = o => { if (fog) fog.exclude(o); else o.traverse(c => c.layers.set(FX_LAYER)); return o; };
  if (!fog) stage.camera.layers.enable(FX_LAYER);
  const frost = createFrost(ctx), shatter = createShatter(ctx), pour = createPour(ctx), glass = createGlass(ctx);
  const vessels = [], receivers = []; let compat = null;

  const fx = {
    ctx, fog, frost, shatter, pour, glass, vessels, receivers, layer: FX_LAYER,
    get tier(){ return ctx.tier; }, get settings(){ return ctx.q; },
    newBoil(o){ const b = createBoil(ctx, o); list.push(b); return b; },
    newLevel(inner, o){ const l = createLevel(ctx, inner, o); list.push(l); return l; },
    newPour(o){ const p = createPour(ctx, o); p.auto = true; list.push(p); return p; },
    /** 그릇 하나: inner = 닫힌 안쪽 모양 Mesh 또는 { rBot, rTop, h, parent, y }. 매 프레임 v.fill(0~1)·v.boil(0~1)만 넣는다. (v.level = 액면, v.bubbles = 튀는 방울, v.rim = 가장자리 안개)
     *  v.receiver 는 붓는 줄기가 받는 그릇으로 쓴다(fx.receivers 에 들어 있다). v.onAbsorb = amount => { … } 로 부은 양을 받는다. */
    vessel(inner, o = {}){
      const level = createLevel(ctx, inner, o), bubbles = createBoil(ctx, { liquid: o.liquid, surface: false, drops: o.drops });
      const rim = fog && o.fog !== false ? fog.rim(level.rimCenter, level.rimRadius) : null;
      const v = { level, bubbles, rim, fill: o.fill ?? 0, boil: 0, fogBoil: null /* 안개만 따로 정하고 싶을 때(없으면 boil 을 따른다) */, liquid: o.liquid || 'ln2', onAbsorb: null, receiver: null,
        /** 물체를 담그는 순간: 방울이 확 튀고 액면이 출렁인다 */
        splash(at, strength = 1){ bubbles.splash(at || level.center, Math.round(10 + 14 * strength), strength, level.radius * .35); level.kick((ctx.rand() - .5) * 2.4 * strength, (ctx.rand() - .5) * 2.4 * strength); },
        update(dt){ const wet = v.fill > .01, b = wet ? Math.min(1, Math.max(0, v.boil)) : 0;
          level.fill = v.fill; level.boil = b; level.update(dt);
          bubbles.visible = wet; bubbles.boil = b; bubbles.setSurface(level.center, level.radius); bubbles.update(dt);
          if (rim) { rim.radius = level.rimRadius; rim.baseRadius = level.bottomRadius; rim.boil = v.fogBoil != null ? v.fogBoil : (v.liquid === 'ln2' ? b * (.35 + .65 * Math.min(1, v.fill * 4)) : 0); } },
        dispose(){ level.dispose(); bubbles.dispose(); if (rim) fog.remove(rim); const i = vessels.indexOf(v); if (i >= 0) vessels.splice(i, 1); const j = receivers.indexOf(v.receiver); if (j >= 0) receivers.splice(j, 1); } };
      v.receiver = level.receiver(amount => { if (v.onAbsorb) v.onAbsorb(amount); });
      vessels.push(v); receivers.push(v.receiver); return v;
    },
    /** 매 프레임 한 번. pour 는 fx.receivers(그릇들)와 상판 높이로 스스로 닿는 자리를 찾는다. */
    update(dt){
      for (let k = 0; k < vessels.length; k++) vessels[k].update(dt);
      for (let k = 0; k < list.length; k++) { const e = list[k]; if (e.auto) e.update(dt, receivers, ctx.bench.y); else e.update(dt); }
      pour.update(dt, compat || receivers, ctx.bench.y); frost.update(dt); shatter.update(dt);
      if (fog) fog.update(dt);                                              // 안개는 마지막(다른 효과가 이번 프레임에 낸 김까지 그린다)
    },
    /** 상판 네모를 나중에 정할 때(구운 방을 createFx 뒤에 올렸을 때): fx.setBench(stage.benchRect) — room.json benchTop 모양도 받는다 */
    setBench(rect){ Object.assign(ctx.bench, benchOf(rect, ctx.bench)); if (fog) fog.setBench(); },
    /** 등급이 내려갔을 때(안개 장수·안개 그림 크기). 유리는 fx.glass.applyToObject(root) 를 다시 부른다. */
    setTier(tier){ if (!TIERS.includes(tier)) return; ctx.tier = tier; Object.assign(ctx.q, settingsOf(tier)); if (fog) fog.setTier(ctx.q); },
    /** 회색 판 core/liquid.js 와 같은 모양(grain·bubbles·update) — props.js 를 고치기 전에도 끼워 볼 수 있게 */
    liquidCompat(){
      const o = new THREE.Vector3(), d = new THREE.Vector3(); let grains = 0, liq = 'ln2';
      return { live: 0, set liquid(v){ liq = v; },
        grain(at, dir){ o.copy(at); d.set(dir * .9, -.35, 0); grains++; },
        bubbles(at, count, strength = 1, radius = .04){ const v = vessels[0]; if (v) { v.bubbles.splash(at, Math.min(24, count), strength, radius); if (count > 20) v.level.kick((ctx.rand() - .5) * 2, (ctx.rand() - .5) * 2); } },
        update(dt, ves, benchY){ const flow = dt > 0 ? Math.min(1, Math.max(0, (grains / dt - 25) / 110)) : 0; pour.setFlow(o, d, grains ? Math.max(.05, flow) : 0, liq); grains = 0; this.live = pour.active ? 1 : 0; compat = ves || null; if (benchY != null) ctx.bench.y = benchY; } };
    },
  };
  return fx;
}
