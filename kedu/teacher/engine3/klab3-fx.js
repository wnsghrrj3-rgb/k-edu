/* klab3-fx.js — 공용 연출: GPU 김/연기 · 불꽃 스프라이트 · 등장 낙하 · 기포 */
import * as THREE from 'three';

/* GPU 김/연기 — color/rate/spread 옵션화 (연기=회색, 김=흰색) */
export function makeSteam(opts = {}) {
  const N = opts.count ?? 110;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = Math.random();
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const col = new THREE.Color(opts.color ?? 0xeef2f8);
  const uni = {
    uTime: { value: 0 }, uIntensity: { value: 0 },
    uScale: { value: innerHeight * 0.5 },
    uRise: { value: opts.rise ?? 0.52 },
    uR0: { value: opts.spawnR ?? 0.05 },
    uRate: { value: opts.rate ?? 0.26 },
    uCol: { value: new THREE.Vector3(col.r, col.g, col.b) },
    uAlpha: { value: opts.alpha ?? 0.34 }
  };
  const pts = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false,
    vertexShader: `
      attribute float aSeed;
      uniform float uTime,uIntensity,uScale,uRise,uR0,uRate;
      varying float vA;
      float h(float n){return fract(sin(n)*43758.5453);}
      void main(){
        float sp=mix(0.55,1.0,h(aSeed*7.13));
        float life=fract(uTime*uRate*sp+aSeed);
        float ang=h(aSeed*3.31)*6.28318;
        float r0=h(aSeed*9.71)*uR0;
        vec3 p=vec3(cos(ang)*r0,0.0,sin(ang)*r0);
        p.y+=life*uRise;
        p.x+=sin(uTime*1.25+aSeed*21.0)*(0.015+0.09*life)+life*life*0.04;
        p.z+=cos(uTime*1.05+aSeed*13.0)*(0.015+0.07*life);
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        vA=smoothstep(0.0,0.15,life)*(1.0-life)*uIntensity;
        gl_PointSize=mix(0.05,0.30,life)*uScale/max(-mv.z,0.1);
      }`,
    fragmentShader: `
      uniform vec3 uCol; uniform float uAlpha;
      varying float vA;
      void main(){
        float d=length(gl_PointCoord-0.5);
        gl_FragColor=vec4(uCol, smoothstep(0.5,0.06,d)*vA*uAlpha);
      }`
  }));
  pts.frustumCulled = false;
  addEventListener('resize', () => { uni.uScale.value = innerHeight * 0.5; });
  return { obj: pts, uni,
    set intensity(v) { uni.uIntensity.value = v; },
    get intensity() { return uni.uIntensity.value; },
    tick(t, target, dt) {
      uni.uTime.value = t;
      if (target !== undefined)
        uni.uIntensity.value += (target - uni.uIntensity.value) * Math.min((dt ?? 0.016) * 2.5, 1);
    } };
}

/* 알코올 불꽃(2겹 스프라이트 + 흔들리는 조명) */
export function makeFlame() {
  function tex(inner, outer) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 78, 4, 64, 64, 60);
    gr.addColorStop(0, inner); gr.addColorStop(0.45, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const outer = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex('rgba(255,244,200,1)', 'rgba(255,150,40,0.85)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  const inner = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex('rgba(190,230,255,1)', 'rgba(70,140,255,0.7)'),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  const light = new THREE.PointLight(0xFFA640, 0, 1.6, 2);
  const grp = new THREE.Group();
  outer.position.y = 0.023; inner.position.y = 0;
  grp.add(outer, inner, light);
  let on = false;
  return { obj: grp,
    set lit(v) { on = v; outer.visible = inner.visible = v; if (!v) light.intensity = 0; },
    get lit() { return on; },
    tick(t) {
      if (!on) return;
      const f = 1 + 0.10 * Math.sin(t * 23) + 0.06 * Math.sin(t * 57 + 1.7);
      outer.scale.set(0.058 * f, 0.115 * f * (1 + 0.05 * Math.sin(t * 31)), 1);
      inner.scale.set(0.034 * f, 0.06 * f, 1);
      light.intensity = 2.3 + 0.6 * Math.sin(t * 19) * Math.sin(t * 7);
    } };
}

/* 등장 낙하 연출 매니저 (배치=위에서 사뿐히) */
export function makeDropper() {
  const list = [];
  return {
    drop(obj, baseY, height = 0.28) {
      obj.visible = true;
      obj.position.y = baseY + height;
      list.push({ obj, baseY, height, t: 0 });
    },
    tick(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const d = list[i]; d.t += dt * 3.2;
        const k = Math.min(d.t, 1), e = 1 - Math.pow(1 - k, 3);
        d.obj.position.y = d.baseY + d.height * (1 - e);
        if (k >= 1) { d.obj.position.y = d.baseY; list.splice(i, 1); }
      }
    } };
}
