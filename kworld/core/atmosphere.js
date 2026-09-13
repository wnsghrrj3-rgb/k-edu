import * as THREE from 'three';

// A small, deterministic sky texture: no downloads or per-frame cloud work.
export function applyAtmosphere(engine) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, 1024);
  sky.addColorStop(0, '#427da8');
  sky.addColorStop(0.28, '#82b7d6');
  sky.addColorStop(0.48, '#d9e1de');
  sky.addColorStop(0.55, '#e5dfca');
  sky.addColorStop(1, '#9aab91');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 2048, 1024);
  let seed = 37;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  // Repeat clouds over the panorama seam, keeping the zenith clear.
  for (let i = 0; i < 24; i++) {
    const x = random() * 2048, y = 240 + random() * 200;
    const width = 65 + random() * 140, height = 8 + random() * 15;
    for (const offset of [-2048, 0, 2048]) {
      ctx.save(); ctx.translate(x + offset, y); ctx.scale(width, height);
      const cloud = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      cloud.addColorStop(0, 'rgba(255,249,229,0.55)');
      cloud.addColorStop(0.45, 'rgba(255,249,229,0.28)');
      cloud.addColorStop(1, 'rgba(255,249,229,0)');
      ctx.fillStyle = cloud; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  engine.scene.background = texture;
  engine.scene.fog = new THREE.Fog(0xd9e1de, 45, 145);
  engine.renderer.toneMappingExposure = 0.95;
  const ambient = engine.scene.children.find((o) => o.isHemisphereLight);
  ambient.color.set(0xd9eafa); ambient.groundColor.set(0x857355); ambient.intensity = 0.65;
  engine.sun.color.set(0xffdfac); engine.sun.intensity = 2.1;
  engine.sun.position.set(-34, 32, 24); engine.sunOffset = new THREE.Vector3(-34, 32, 24);
  engine.sun.shadow.normalBias = 0.035;
}
