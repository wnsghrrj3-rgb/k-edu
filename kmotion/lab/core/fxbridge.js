// 케이모션 과학실 — 효과 다리: core/fx(안개·끓음·서리·깨짐·붓는 줄기·액면·유리)를 안전하게 감싼다.
// fx 를 못 불러오거나 한 효과가 오류를 내도 놀이는 계속된다(그 효과만 간단한 대신 그림으로 바뀐다).
// 놀이 쪽(play.js)은 이 다리만 부른다 → fx 의 모양이 바뀌어도 여기만 고치면 된다.
import * as THREE from 'three';

const warned = new Set();
function warn(key, e){ if (warned.has(key)) return; warned.add(key); console.warn('[lab fx] ' + key + ' → 대신 그림으로', e); }

export async function createFxBridge(stage, opt = {}){
  const scene = stage.scene;
  let FX = null, fx = null, quality = null; const tierListeners = [];
  if (!opt.off) {
    try { FX = await import('./fx/index.js'); } catch (e) { warn('fx 불러오기', e); }
    if (FX) {
      try {
        const Q = new URLSearchParams(location.search), want = Q.get('q');
        let tier = FX.TIERS && FX.TIERS.includes(want) ? want : null;
        if (!tier) { try { tier = FX.guessTier ? FX.guessTier(stage.renderer) : 'mid'; } catch (_) { tier = 'mid'; } }
        if (opt.tier) tier = opt.tier;
        fx = FX.createFx(stage, { tier });
        try { if (FX.createQuality) { quality = FX.createQuality({ renderer: stage.renderer, start: tier }); quality.applyTo(stage);
          quality.onChange(t => { try { fx.setTier(t); quality.applyTo(stage); for (const f of tierListeners) f(t); } catch (e) { warn('등급 바꾸기', e); } }); } } catch (e) { warn('화질 측정', e); quality = null; }
      } catch (e) { warn('fx 만들기', e); fx = null; }
    }
  }
  const has = k => !!fx && !warned.has(k);
  const tmpV = new THREE.Vector3();

  // ── 그릇 하나(액면 + 끓음 + 가장자리 안개). inner = inner_volume 메시, ex = props.json extras.inner, parent = 그릇 모델
  function vessel(inner, ex, parent, opts = {}){
    let real = null;
    if (has('그릇') && inner) { try { real = fx.vessel(inner, { liquid: opts.liquid || 'ln2' }); inner.visible = true; } catch (e) { warn('그릇', e); real = null; } }
    if (!real && inner) inner.visible = false;
    // 대신 그림: 수평 원판(차오름) + 흔들림
    let disc = null;
    const innerY = inner ? inner.position.y : .01;
    if (!real) { disc = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshPhysicalMaterial({ color: 0xdfeefa, roughness: .05, metalness: 0, transmission: 0, transparent: true, opacity: .82, envMapIntensity: 1.4 }));
      disc.rotation.x = -Math.PI / 2; disc.visible = false; disc.renderOrder = 3; parent.add(disc); }
    let kick = 0, t = 0;
    const v = {
      fill: 0, boil: 0, real: !!real,
      surfaceY(){ if (real) { try { return real.level.surfaceY; } catch (e) { warn('액면 높이', e); } } parent.updateWorldMatrix(true, false); return parent.getWorldPosition(tmpV).y + innerY + Math.min(1, v.fill) * ex.h * .92; },
      radiusAt(){ return ex.rBot + (ex.rTop - ex.rBot) * Math.min(1, v.fill) * .92; },
      splash(at, s = 1){ if (real) { try { real.splash(at, s); return; } catch (e) { warn('튐', e); } } kick = Math.max(kick, .6 * s); },
      update(dt){ t += dt;
        if (real) { try { real.fill = v.fill; real.boil = v.boil; return; } catch (e) { warn('그릇 갱신', e); real = null; } }
        if (!disc) return; disc.visible = v.fill > .01; const r = v.radiusAt(); disc.scale.set(r, r, 1); disc.position.y = innerY + Math.min(1, v.fill) * ex.h * .92;
        kick *= Math.pow(.1, dt); const w = (v.boil * .05 + kick * .2); disc.rotation.y = 0; disc.rotation.x = -Math.PI / 2 + Math.sin(t * 23) * w * .2; disc.rotation.z = Math.cos(t * 19) * w * .2; },
    };
    if (real) { const upd = v.update; v.update = dt => upd(dt); }
    return v;
  }

  // ── 붓는 줄기: 매 프레임 setFlow(origin, dir, flow 0~1, 'ln2'|'water')
  let fallbackStream = null;
  function streamMesh(){ if (fallbackStream) return fallbackStream; const m = new THREE.Mesh(new THREE.CylinderGeometry(.006, .01, 1, 10, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xeaf4ff, roughness: .1, transparent: true, opacity: .7 })); m.visible = false; scene.add(m); fallbackStream = m; return m; }
  const up = new THREE.Vector3(0, 1, 0), mid = new THREE.Vector3();
  const pour = {
    setFlow(origin, dir, flow, liq = 'ln2', landY = null){
      if (has('붓기')) { try { fx.pour.setFlow(origin, dir, flow, liq); return; } catch (e) { warn('붓기', e); } }
      const m = streamMesh(); if (!(flow > 0)) { m.visible = false; return; }
      const y1 = landY == null ? (stage.BENCH_Y || .8) : landY, len = Math.max(.02, origin.y - y1);
      mid.set(origin.x + dir.x * .02, (origin.y + y1) / 2, origin.z); m.position.copy(mid); m.scale.set(.6 + flow, len, .6 + flow); m.quaternion.setFromUnitVectors(up, up); m.visible = true; },
    get vessel(){ try { return has('붓기') ? fx.pour.vessel : null; } catch (_) { return null; } },
    get landed(){ try { return has('붓기') ? fx.pour.landed : false; } catch (_) { return false; } },
  };

  // ── 서리: 물체마다 handle.amount = 0~1
  function frost(root){
    if (has('서리')) { try { const h = fx.frost.apply(root, { sparkle: 1.2 }); if (h) return h; } catch (e) { warn('서리', e); } }
    const mats = []; root.traverse(o => { if (o.isMesh && o.material && o.material.color) mats.push({ m: o.material, c: o.material.color.clone(), r: o.material.roughness }); });
    const white = new THREE.Color(0xeef4fa); let amt = 0;
    return { get amount(){ return amt; }, set amount(a){ if (Math.abs(a - amt) < .01) return; amt = a; for (const x of mats) { x.m.color.copy(x.c).lerp(white, a * .75); if (x.r != null) x.m.roughness = x.r + (1 - x.r) * a * .6; } }, remove(){ this.amount = 0; } };
  }
  function glass(root){ if (has('유리')) { try { fx.glass.applyToObject(root, fx.tier); return true; } catch (e) { warn('유리', e); } } return false; }

  // ── 깨짐: shards = 따로 떨어진 Object3D 들(세계 자리 그대로 흩뿌린다)
  const own = [];
  function shatter(shards, o = {}){
    if (has('깨짐')) { try { return fx.shatter.burst(shards, o); } catch (e) { warn('깨짐', e); } }
    const by = o.benchY ?? stage.BENCH_Y ?? .8, S = [0, .4, .8, 1.3][o.strength || 2];
    for (const s of shards) { scene.attach(s); s.visible = true; const a = Math.random() * 6.283;
      own.push({ o: s, v: new THREE.Vector3(Math.cos(a) * S * Math.random(), .4 + Math.random() * S, Math.sin(a) * S * Math.random() * .6), w: new THREE.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9), y0: by + .004 }); }
    return { clear(){ for (const s of shards) s.removeFromParent(); } };
  }
  function stepOwn(dt){ for (let i = own.length - 1; i >= 0; i--) { const b = own[i]; b.v.y -= 9.8 * dt; b.o.position.addScaledVector(b.v, dt); b.o.rotation.x += b.w.x * dt; b.o.rotation.y += b.w.y * dt;
    if (b.o.position.y < b.y0) { b.o.position.y = b.y0; b.v.y = -b.v.y * .3; b.v.x *= .6; b.v.z *= .6; b.w.multiplyScalar(.5); if (Math.abs(b.v.y) < .05 && b.v.lengthSq() < .002) own.splice(i, 1); } } }

  // ── 안개: 큰 구름 · 찬 물체에서 흘러내리는 김
  function cloud(center, strength = 1, radius){ if (fx && fx.fog && !warned.has('구름')) { try { fx.fog.burst(center, strength, radius ? { radius } : undefined); return true; } catch (e) { warn('구름', e); } } return false; }
  function trail(obj, radius = .04){ if (fx && fx.fog && !warned.has('김')) { try { return fx.fog.trail(obj, { radius }); } catch (e) { warn('김', e); } } return { rate: 0 }; }
  function puff(x, y, z, n = 6, size = .06){ if (fx && fx.fog && !warned.has('김조각')) { try { for (let k = 0; k < n; k++) fx.fog.emit(x + (Math.random() - .5) * .05, y, z + (Math.random() - .5) * .05, (Math.random() - .5) * .08, -.02, (Math.random() - .5) * .08, size * .6, size * 1.6, 1.6 + Math.random(), .5); } catch (e) { warn('김조각', e); } } }

  return {
    get ok(){ return !!fx; }, get tier(){ try { return fx ? fx.tier : 'none'; } catch (_) { return 'none'; } }, get white(){ try { return fx && fx.fog ? fx.fog.white || 0 : 0; } catch (_) { return 0; } },
    get fogCount(){ try { return fx && fx.fog ? fx.fog.live || 0 : 0; } catch (_) { return 0; } },
    fx, vessel, pour, frost, glass, shatter, cloud, trail, puff,
    get quality(){ return quality; }, onTier(f){ tierListeners.push(f); },
    get settings(){ try { return fx ? fx.settings : null; } catch (_) { return null; } },
    /** 깨진 조각 소리: (빠르기, 자리) */
    set onBounce(f){ try { if (fx && fx.shatter) fx.shatter.onBounce = f; } catch (_) {} },
    sample(now){ if (quality) { try { quality.sample(now); } catch (e) { warn('화질 측정', e); quality = null; } } },
    update(dt){ stepOwn(dt); if (!fx) return; try { fx.update(dt); } catch (e) { warn('fx 갱신', e); fx = null; } },
  };
}
