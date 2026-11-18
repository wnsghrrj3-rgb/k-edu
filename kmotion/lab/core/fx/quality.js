// 케이모션 과학실 — 화질 등급(상·중·하): 처음 3초를 재서 모자라면 한 단 내린다. 다시 올리지 않는다. (설계 6-4)
// ?q=high|mid|low 로 고정. 등급마다 내부 해상도·후처리·안개 장수·그림자를 정해 둔다.

export const TIERS = ['high', 'mid', 'low'];
export const SETTINGS = {
  //      내부 해상도   닿는 자리 음영  빛 번짐       유리               안개 장수·안개 그림 크기   그림자                          튀는 방울  반짝 조각    붓는 방울
  high: { label: '상', height: 1080, gtao: true, bloom: true, glass: 'physical', fog: 600, fogScale: .5, shadows: true, shadowMap: 1024, drops: 64, glitter: 160, splash: 96 },
  mid: { label: '중', height: 900, gtao: false, bloom: true, glass: 'fake', fog: 300, fogScale: .5, shadows: true, shadowMap: 1024, drops: 40, glitter: 96, splash: 64 },
  low: { label: '하', height: 720, gtao: false, bloom: false, glass: 'fake', fog: 150, fogScale: .4, shadows: false, shadowMap: 0, drops: 24, glitter: 48, splash: 32 },
};
export const settingsOf = tier => SETTINGS[tier] || SETTINGS.mid;

/** 그래픽 칩 이름으로 첫 등급을 어림한다(모르면 중). 측정이 틀린 어림을 바로잡는다. */
export function guessTier(renderer){
  let name = '';
  try { const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || ''); } catch (e) { }
  const n = name.toLowerCase(), cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4, mem = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4;
  if (/swiftshader|llvmpipe|software|basic render/.test(n)) return 'low';
  if (/mali-4|mali-t|adreno \(tm\) [1-5]|powervr|videocore/.test(n)) return 'low';
  if (/nvidia|geforce|rtx|gtx|radeon rx|radeon pro|apple m|apple gpu/.test(n) && cores >= 6 && mem >= 8) return 'high';
  return 'mid';
}

/**
 * const quality = createQuality({ renderer, onChange(tier, settings) })
 * - 그려진 장마다 quality.sample() 을 한 번 부른다(실제 시각으로 잰다 — 놀이 시간·느린 동작과 무관).
 * - quality.applyTo(stage): 내부 해상도·그림자를 등급에 맞춘다.
 */
export function createQuality({ renderer = null, query = (typeof location !== 'undefined' ? location.search : ''), target = 30, seconds = 3, onChange = null, start = null } = {}){
  const Q = new URLSearchParams(query || ''), forced = TIERS.includes(Q.get('q')) ? Q.get('q') : null;
  const listeners = []; if (onChange) listeners.push(onChange);
  const st = { tier: forced || start || (renderer ? guessTier(renderer) : 'mid'), locked: !!forced, fixed: !!forced, fps: 0, t0: 0, last: 0, frames: 0, warm: .6, steps: 0 };
  const api = {
    get tier(){ return st.tier; }, get settings(){ return settingsOf(st.tier); }, get locked(){ return st.locked; }, get fps(){ return st.fps; }, fixed: st.fixed, showFps: Q.get('fps') === '1',
    onChange(f){ listeners.push(f); },
    /** 등급을 손으로 정한다(더 재지 않는다) */
    set(tier){ if (!TIERS.includes(tier)) return; st.locked = true; if (tier !== st.tier) { st.tier = tier; for (const f of listeners) f(tier, settingsOf(tier)); } },
    /** 그린 장마다 한 번. 3초 평균이 목표(초당 30장)에 못 미치면 한 단 내리고 다시 3초를 잰다. 넘으면 그 등급으로 굳힌다. */
    sample(now = performance.now()){
      const gap = st.last ? (now - st.last) / 1000 : 0; st.last = now;
      if (gap > 0) st.fps = st.fps ? st.fps * .9 + (1 / gap) * .1 : 1 / gap;
      if (st.locked) return;
      if (gap <= 0 || gap > .25 || (typeof window !== 'undefined' && window.__pause)) { st.t0 = 0; st.frames = 0; return; }   // 숨은 창·멈춤 구간은 버린다
      if (!st.t0) { st.t0 = now + st.warm * 1000; st.frames = 0; return; }                                                   // 첫 0.6초(재질 굽는 동안)는 세지 않는다
      if (now < st.t0) return;
      st.frames++;
      const el = (now - st.t0) / 1000; if (el < seconds) return;
      const avg = st.frames / el, i = TIERS.indexOf(st.tier);
      if (avg < target * .9 && i < TIERS.length - 1) { st.tier = TIERS[i + 1]; st.steps++; st.t0 = 0; st.frames = 0; st.warm = 1; for (const f of listeners) f(st.tier, settingsOf(st.tier)); if (st.tier === 'low') st.locked = true; }
      else st.locked = true;
    },
    /** 내부 해상도(세로 1080/900/720 줄)와 그림자를 맞춘다. stage.resize() 가 있으면 불러 준다. */
    applyTo(stage){
      const s = settingsOf(st.tier), r = stage.renderer, el = r.domElement, cssH = el.clientHeight || (typeof innerHeight !== 'undefined' ? innerHeight : s.height);
      r.setPixelRatio(Math.max(.5, Math.min((typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1) || 1, s.height / Math.max(1, cssH))));
      if (stage.resize) stage.resize();
      if (stage.sun) stage.sun.castShadow = s.shadows;
      return s;
    },
  };
  return api;
}

/** 후처리 묶음(상: 닿는 자리 음영 + 빛 번짐 · 중: 빛 번짐만 · 하: 없음). 무대가 renderer.render 대신 post.render() 를 부른다.
 *  하 등급이면 null 을 돌려준다(그대로 renderer.render). 등급이 바뀌면 다시 만든다. */
export async function createPost(renderer, scene, camera, settings){
  if (!settings.bloom && !settings.gtao) return null;
  const THREE = await import('three');
  const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
    import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
    import('three/addons/postprocessing/UnrealBloomPass.js'), import('three/addons/postprocessing/OutputPass.js')]);
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: settings.gtao ? 4 : 0 });
  const composer = new EffectComposer(renderer, rt); composer.setPixelRatio(1); composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));
  if (settings.gtao) { const { GTAOPass } = await import('three/addons/postprocessing/GTAOPass.js'); const g = new GTAOPass(scene, camera, size.x, size.y); g.updateGtaoMaterial({ radius: .12, distanceExponent: 1.5, thickness: 1, scale: 1.1, samples: 8 }); composer.addPass(g); }
  if (settings.bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.x / 2, size.y / 2), .3, .5, 1.55));   // 세기·번짐·문턱(아주 밝은 곳만: 반짝 조각·서리 빛·쇠의 번쩍임. 안개(밝기 1.4쯤)는 번지지 않게 문턱을 그 위에 둔다)
  composer.addPass(new OutputPass());
  return { composer, render(){ composer.render(); }, setSize(w, h){ composer.setSize(w, h); }, dispose(){ composer.dispose(); rt.dispose(); } };
}
