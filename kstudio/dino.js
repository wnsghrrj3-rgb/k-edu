/* 케이스튜디오 — 🦖 공룡 등장 v1
 * 실제 같은 티라노사우루스를 코드로 빚어(외부 모델 파일 없음) 카메라 화면 속 교실에 걸어 들어오게 한다.
 *  · 몸통·꼬리·목 = 척추 뼈 11개에 살을 입힌 한 덩어리(SkinnedMesh) → 꼬리·목이 자연스럽게 휘어짐
 *  · 피부 = 비늘 무늬(보로노이) 요철 + 등 짙고 배 밝은 위장색 + 줄무늬
 *  · 바닥 그림자 · 발자국 먼지 · 화면 흔들림 · 발소리/포효 합성음(WebAudio, 녹음 파일 없음)
 *  · 반응: 사람 머리를 눈으로 따라감 · 양손 번쩍 → 포효 · 쪼그려 앉으면 못 찾고 킁킁 · 점프 착지 → 깜짝 포효
 * 사용: const d = KDino.create({ W, H }); d.update(dt, pose, body); d.drawTo(ctx); d.enter(); d.roar(); d.leave();
 */
(() => {
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, rnd = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function hash(x, y){ const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y){ const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), u), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u), v); }
const fbm = (x, y) => vnoise(x, y) * .55 + vnoise(x * 2.1, y * 2.1) * .3 + vnoise(x * 4.3, y * 4.3) * .15;

// ───── 비늘 질감(타일링 보로노이) — 요철(bump)과 색 얼룩 두 장
function scaleTextures(T){ const N = 512, G = 22, pts = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) pts.push([(i + .15 + Math.random() * .7) / G, (j + .15 + Math.random() * .7) / G, Math.random()]);
  const bc = document.createElement('canvas'); bc.width = bc.height = N; const cc = document.createElement('canvas'); cc.width = cc.height = N;
  const bx = bc.getContext('2d'), cx = cc.getContext('2d'), bi = bx.createImageData(N, N), ci = cx.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / N, v = y / N, gi = Math.floor(u * G), gj = Math.floor(v * G); let f1 = 9, f2 = 9, id = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = (gi + di + G) % G, jj = (gj + dj + G) % G, p = pts[jj * G + ii];
      const px = p[0] + (gi + di < 0 ? -1 : gi + di >= G ? 1 : 0), py = p[1] + (gj + dj < 0 ? -1 : gj + dj >= G ? 1 : 0), d = Math.hypot(u - px, v - py);
      if (d < f1) { f2 = f1; f1 = d; id = p[2]; } else if (d < f2) f2 = d; }
    const edge = smooth(0, .018, f2 - f1), dome = 1 - clamp(f1 * G * .9, 0, 1) * .35, k = (y * N + x) * 4;
    const b = clamp(edge * dome * 235 + 10, 0, 255); bi.data[k] = bi.data[k + 1] = bi.data[k + 2] = b; bi.data[k + 3] = 255;
    const n = fbm(u * 8, v * 8), c = clamp(185 + edge * 55 + (id - .5) * 34 + (n - .5) * 50, 0, 255); ci.data[k] = ci.data[k + 1] = ci.data[k + 2] = c; ci.data[k + 3] = 255; }
  bx.putImageData(bi, 0, 0); cx.putImageData(ci, 0, 0);
  const mk = c => { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; };
  return { bump: mk(bc), color: mk(cc) }; }

// ───── 위장색(정점 색): 등 짙은 올리브갈색 · 옆 줄무늬 · 배 크림색
const C_TOP = [.17, .16, .10], C_SIDE = [.36, .29, .17], C_BELLY = [.70, .62, .45], C_MOUTH = [.36, .08, .08];
function skinColor(p, n, out){ const up = n.y, belly = smooth(-.15, -.65, up), top = smooth(.1, .75, up);
  let r = lerp(C_SIDE[0], C_TOP[0], top), g = lerp(C_SIDE[1], C_TOP[1], top), b = lerp(C_SIDE[2], C_TOP[2], top);
  const stripe = smooth(.55, .8, Math.sin(p.x * 4.2 + fbm(p.x * .8, p.y * 1.3) * 5)) * (1 - belly) * smooth(-.2, .3, up) * .45;
  const blot = (fbm(p.x * 1.7 + 9, p.z * 1.7 + p.y) - .5) * .35;
  r = r * (1 - stripe) * (1 + blot); g = g * (1 - stripe) * (1 + blot); b = b * (1 - stripe) * (1 + blot * .6);
  out[0] = lerp(r, C_BELLY[0], belly); out[1] = lerp(g, C_BELLY[1], belly); out[2] = lerp(b, C_BELLY[2], belly); return out; }
function legColor(p, n, out){ const bl = (fbm(p.x * 2.3 + 4, p.y * 2.3 + p.z * 3) - .5) * .3, sh = smooth(.3, .9, n.y) * .25; out[0] = C_SIDE[0] * (1 + bl - sh) * .82; out[1] = C_SIDE[1] * (1 + bl - sh) * .82; out[2] = C_SIDE[2] * (1 + bl * .6 - sh) * .82; return out; }
const toLin = c => { c[0] = Math.pow(c[0], 2.2); c[1] = Math.pow(c[1], 2.2); c[2] = Math.pow(c[2], 2.2); return c; };

// ───── 쓸기(sweep) 도형: 중심선 + 단면(위·아래·옆 반지름, 네모짐 정도)
function sweep(T, opt){ const R = opt.rings, S = opt.segs, pos = [], nor = [], uv = [], col = [], idx = [], ts = [];
  const tan = new T.Vector3(), nrm = new T.Vector3(), bin = new T.Vector3(), up = new T.Vector3(0, 1, 0), c = new T.Vector3(), c2 = new T.Vector3();
  let len = 0, prev = null; const lens = [];
  for (let i = 0; i <= R; i++) { const t = i / R; const s = opt.at(t); if (prev) len += s.c.distanceTo(prev); lens.push(len); prev = s.c.clone(); }
  for (let i = 0; i <= R; i++) { const t = i / R, s = opt.at(t); c.copy(s.c); c2.copy(opt.at(Math.min(1, t + .002)).c).sub(opt.at(Math.max(0, t - .002)).c); tan.copy(c2).normalize();
    bin.crossVectors(tan, up); if (bin.lengthSq() < 1e-6) bin.set(0, 0, 1); bin.normalize(); nrm.crossVectors(bin, tan).normalize();
    const p = s.p || 1;
    for (let j = 0; j <= S; j++) { const th = j / S * Math.PI * 2, co = Math.cos(th), si = Math.sin(th);
      const cy = Math.sign(co) * Math.pow(Math.abs(co), p), sz = Math.sign(si) * Math.pow(Math.abs(si), p);
      let ry = co > 0 ? s.rT : s.rB, rz = s.rZ; if (s.lump) { const l = 1 + s.lump * (fbm(t * 9 + 3, th * 1.6) - .5); ry *= l; rz *= l; }
      pos.push(c.x + nrm.x * cy * ry + bin.x * sz * rz, c.y + nrm.y * cy * ry + bin.y * sz * rz, c.z + nrm.z * cy * ry + bin.z * sz * rz);
      uv.push(lens[i] * (opt.uvL || .95), j / S * (opt.uvC || 2.6)); ts.push(t); } }
  for (let i = 0; i < R; i++) for (let j = 0; j < S; j++) { const a = i * (S + 1) + j, b = a + S + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const N = g.attributes.normal; for (let i = 0; i <= R; i++) { const a = i * (S + 1), b = a + S; const x = N.getX(a) + N.getX(b), y = N.getY(a) + N.getY(b), z = N.getZ(a) + N.getZ(b), l = Math.hypot(x, y, z) || 1; N.setXYZ(a, x / l, y / l, z / l); N.setXYZ(b, x / l, y / l, z / l); }
  const P = g.attributes.position, tmpP = new T.Vector3(), tmpN = new T.Vector3(), out = [0, 0, 0];
  for (let k = 0; k < P.count; k++) { tmpP.fromBufferAttribute(P, k); tmpN.fromBufferAttribute(N, k); if (opt.colorSpace) tmpP.applyMatrix4(opt.colorSpace), tmpN.transformDirection(opt.colorSpace);
    toLin((opt.color || skinColor)(tmpP, tmpN, out, ts[k])); col.push(out[0], out[1], out[2]); }
  g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.userData.ts = ts; return g; }

function catmull(T, pts){ return new T.CatmullRomCurve3(pts.map(p => new T.Vector3(p[0], p[1], p[2] || 0)), false, 'centripetal'); }
function table(rows){ return t => { for (let i = 1; i < rows.length; i++) if (t <= rows[i][0]) { const a = rows[i - 1], b = rows[i], k = smooth(0, 1, (t - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, j) => lerp(v, b[j + 1], k)); } return rows[rows.length - 1].slice(1); }; }

// ───── 소리(합성) — 녹음 파일 없이 WebAudio로
function makeAudio(){ let ac = null, master = null, dest = null, noiseBuf = null;
  function ensure(){ if (ac) { if (ac.state === 'suspended') ac.resume(); return ac; } const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A();
    master = ac.createGain(); master.gain.value = .9; const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 6; master.connect(comp); comp.connect(ac.destination);
    try { dest = ac.createMediaStreamDestination(); comp.connect(dest); } catch (_) {}
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate); const d = noiseBuf.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { b = .97 * b + .03 * (Math.random() * 2 - 1); d[i] = b * 6 + (Math.random() * 2 - 1) * .25; } return ac; }
  const noise = () => { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; };
  function curve(k){ const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
  return {
    get stream(){ return dest && dest.stream; }, ensure,
    step(vol){ if (!ensure()) return; const t = ac.currentTime, v = vol == null ? 1 : vol;
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(26, t + .45); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.95 * v, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(g); g.connect(master); o.start(t); o.stop(t + .65);
      const n = noise(), f = ac.createBiquadFilter(), ng = ac.createGain(); f.type = 'lowpass'; f.frequency.value = 260; ng.gain.setValueAtTime(.5 * v, t); ng.gain.exponentialRampToValueAtTime(.001, t + .35); n.connect(f); f.connect(ng); ng.connect(master); n.start(t, Math.random()); n.stop(t + .4); },
    roar(len){ if (!ensure()) return; const t = ac.currentTime, L = len || 2.3;
      const env = ac.createGain(); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(.55, t + .28); env.gain.setValueAtTime(.55, t + L * .55); env.gain.exponentialRampToValueAtTime(.001, t + L);
      const shaper = ac.createWaveShaper(); shaper.curve = curve(18); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.linearRampToValueAtTime(2200, t + .5); lp.frequency.linearRampToValueAtTime(700, t + L); lp.Q.value = 2.5;
      const trem = ac.createGain(), lfo = ac.createOscillator(), lfoG = ac.createGain(); lfo.frequency.value = 23; lfoG.gain.value = .35; trem.gain.value = .65; lfo.connect(lfoG); lfoG.connect(trem.gain);
      shaper.connect(lp); lp.connect(trem); trem.connect(env); env.connect(master);
      const vib = ac.createOscillator(), vibG = ac.createGain(); vib.frequency.value = 6.5; vibG.gain.value = 7; vib.connect(vibG);
      [[1, 'sawtooth', .5], [.5, 'square', .32], [1.51, 'sawtooth', .18]].forEach(([m, type, a]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type;
        o.frequency.setValueAtTime(64 * m, t); o.frequency.linearRampToValueAtTime(118 * m, t + .45); o.frequency.linearRampToValueAtTime(96 * m, t + L * .6); o.frequency.linearRampToValueAtTime(52 * m, t + L);
        vibG.connect(o.frequency); g.gain.value = a; o.connect(g); g.connect(shaper); o.start(t); o.stop(t + L + .05); });
      const n = noise(), bp = ac.createBiquadFilter(), ng = ac.createGain(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(450, t); bp.frequency.linearRampToValueAtTime(1400, t + .5); bp.frequency.linearRampToValueAtTime(380, t + L); bp.Q.value = .9; ng.gain.value = .9; n.connect(bp); bp.connect(ng); ng.connect(shaper); n.start(t, Math.random()); n.stop(t + L + .05);
      const sub = ac.createOscillator(), sg = ac.createGain(); sub.type = 'sine'; sub.frequency.setValueAtTime(38, t); sub.frequency.linearRampToValueAtTime(30, t + L); sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(.6, t + .3); sg.gain.exponentialRampToValueAtTime(.001, t + L); sub.connect(sg); sg.connect(master); sub.start(t); sub.stop(t + L + .05);
      lfo.start(t); vib.start(t); lfo.stop(t + L + .05); vib.stop(t + L + .05); },
    snort(){ if (!ensure()) return; const t = ac.currentTime; for (let i = 0; i < 2; i++) { const s = t + i * .22, n = noise(), bp = ac.createBiquadFilter(), g = ac.createGain(); bp.type = 'bandpass'; bp.frequency.value = 900 + i * 250; bp.Q.value = 1.2;
      g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.7, s + .03); g.gain.exponentialRampToValueAtTime(.001, s + .18); n.connect(bp); bp.connect(g); g.connect(master); n.start(s, Math.random()); n.stop(s + .2); } },
    growl(){ if (!ensure()) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), sh = ac.createWaveShaper(), lp = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(58, t + .6); o.frequency.linearRampToValueAtTime(44, t + 1.2);
      sh.curve = curve(10); lp.type = 'lowpass'; lp.frequency.value = 420; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .2); g.gain.exponentialRampToValueAtTime(.001, t + 1.3); o.connect(sh); sh.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 1.35); } }; }

// ───── 공룡 만들기
function build(T){ const tex = scaleTextures(T);
  const skin = new T.MeshStandardMaterial({ vertexColors: true, map: tex.color, bumpMap: tex.bump, bumpScale: .4, roughness: .82, metalness: 0 });
  const skinS = skin.clone(); skinS.skinning = true;
  const bone = new T.MeshStandardMaterial({ color: 0xe9dfc4, roughness: .45 }), eyeM = new T.MeshStandardMaterial({ color: 0x1a0d02, roughness: .12, metalness: 0, emissive: 0x3a1c00, emissiveIntensity: .6 }), irisM = new T.MeshBasicMaterial({ color: 0xc98a12 }), clawM = new T.MeshStandardMaterial({ color: 0x2b2420, roughness: .35 });
  const root = new T.Group();

  // 척추(꼬리 끝 t=0 → 목 끝 t=1), 단위 ≈ m
  const spine = catmull(T, [[-5.6, 2.15], [-4.4, 2.4], [-3.0, 2.72], [-1.6, 2.95], [-.4, 3.05], [.4, 3.02], [1.3, 2.9], [2.0, 2.85], [2.55, 3.15], [2.85, 3.55]]);
  //               t     위     아래   옆    네모
  const rad = table([[0, .03, .03, .03, 1], [.05, .11, .12, .09, 1], [.3, .38, .5, .33, .95], [.5, .66, .9, .58, .9], [.6, .78, 1.22, .74, .88], [.72, .74, 1.1, .7, .9], [.82, .55, .6, .5, .95], [.9, .42, .42, .38, 1], [1, .38, .36, .34, 1]]);
  const bodyGeo = sweep(T, { rings: 110, segs: 30, at: t => { const r = rad(t); return { c: spine.getPoint(t), rT: r[0], rB: r[1], rZ: r[2], p: r[3], lump: .07 }; } });
  // 뼈: 엉덩이(뿌리) → 꼬리 6 / 가슴 → 목 2 → 머리
  const BT = [0, .1, .2, .3, .4, .5, .6, .7, .82, .92, 1], HIP = 5; const bones = BT.map(() => new T.Bone()); const bp = BT.map(t => spine.getPoint(t));
  bones[HIP].position.copy(bp[HIP]);
  for (let i = HIP - 1; i >= 0; i--) { bones[i + 1].add(bones[i]); bones[i].position.copy(bp[i]).sub(bp[i + 1]); }
  for (let i = HIP + 1; i < BT.length; i++) { bones[i - 1].add(bones[i]); bones[i].position.copy(bp[i]).sub(bp[i - 1]); }
  const si = [], sw = []; for (const t of bodyGeo.userData.ts) { let k = 0; while (k < BT.length - 2 && t > BT[k + 1]) k++; const f = clamp((t - BT[k]) / (BT[k + 1] - BT[k]), 0, 1); si.push(k, k + 1, 0, 0); sw.push(1 - f, f, 0, 0); }
  bodyGeo.setAttribute('skinIndex', new T.Uint16BufferAttribute(si, 4)); bodyGeo.setAttribute('skinWeight', new T.Float32BufferAttribute(sw, 4));
  const body = new T.SkinnedMesh(bodyGeo, skinS); body.add(bones[HIP]); body.updateMatrixWorld(true); body.bind(new T.Skeleton(bones)); body.castShadow = true; body.frustumCulled = false; root.add(body);
  const tail = bones.slice(0, HIP).reverse(), chest = bones[6], belly = bones[7], neck1 = bones[8], neck2 = bones[9], headB = bones[10];

  // 머리(머리뼈에 붙임): 앞=+x. 위턱 / 아래턱(경첩) / 이빨 / 눈
  const head = new T.Group(); head.rotation.z = -.3; head.scale.setScalar(1.12); headB.add(head);
  const mouthColor = (zone) => (p, n, out, t) => { skinColor(p, n, out); const inside = zone === 'up' ? smooth(-.35, -.85, n.y) : smooth(.35, .85, n.y); const mid = 1 - smooth(.12, .3, Math.abs(p.z));
    const m = inside * mid * smooth(.04, .12, t) * (1 - smooth(.9, .98, t)); out[0] = lerp(out[0], C_MOUTH[0], m); out[1] = lerp(out[1], C_MOUTH[1], m); out[2] = lerp(out[2], C_MOUTH[2], m); return out; };
  const skullC = catmull(T, [[-.5, .02], [.05, .12], [.8, .03], [1.42, -.08], [1.72, -.12]]);
  const skullR = table([[0, .36, .3, .36, 1], [.15, .5, .27, .46, .85], [.35, .5, .24, .44, .8], [.65, .38, .2, .34, .8], [.88, .3, .17, .27, .85], [.97, .2, .12, .18, .9], [1, .03, .03, .03, 1]]);
  const skull = new T.Mesh(sweep(T, { rings: 48, segs: 26, at: t => { const r = skullR(t); return { c: skullC.getPoint(t), rT: r[0], rB: r[1], rZ: r[2], p: r[3], lump: .05 }; }, color: mouthColor('up') }), skin); skull.castShadow = true; head.add(skull);
  // 눈썹 융기 + 코 위 울퉁불퉁
  [-1, 1].forEach(sd => { const brow = new T.Mesh(sweep(T, { rings: 14, segs: 12, at: t => ({ c: new T.Vector3(.0 + t * .45, .5 - t * .06, sd * (.38 - t * .05)), rT: .07 * Math.sin(Math.PI * t) + .01, rB: .05 * Math.sin(Math.PI * t) + .01, rZ: .08 * Math.sin(Math.PI * t) + .01, p: 1 }) }), skin); head.add(brow);
    const eye = new T.Mesh(new T.SphereGeometry(.068, 18, 14), eyeM); eye.position.set(.2, .37, sd * .405); head.add(eye);
    const iris = new T.Mesh(new T.CircleGeometry(.04, 16), irisM); iris.position.set(.215, .372, sd * .472); iris.rotation.y = sd > 0 ? .25 : Math.PI - .25; head.add(iris);
    const pupil = new T.Mesh(new T.PlaneGeometry(.014, .06), new T.MeshBasicMaterial({ color: 0x080300 })); pupil.position.copy(iris.position).add(new T.Vector3(0, 0, sd * .002)); pupil.rotation.copy(iris.rotation); head.add(pupil);
    const nost = new T.Mesh(new T.SphereGeometry(.035, 10, 8), new T.MeshBasicMaterial({ color: 0x120a05 })); nost.scale.set(1.6, .7, .6); nost.position.set(1.6, .02, sd * .14); head.add(nost); });
  const jaw = new T.Group(); jaw.position.set(-.05, -.08, 0); head.add(jaw);
  const jawC = catmull(T, [[0, -.12], [.5, -.18], [1.1, -.16], [1.55, -.12], [1.66, -.1]]);
  const jawR = table([[0, .12, .26, .38, .9], [.2, .14, .3, .4, .85], [.55, .12, .22, .32, .85], [.85, .1, .14, .24, .9], [.97, .07, .08, .15, 1], [1, .02, .02, .02, 1]]);
  const jawM = new T.Mesh(sweep(T, { rings: 40, segs: 22, at: t => { const r = jawR(t); return { c: jawC.getPoint(t), rT: r[0], rB: r[1], rZ: r[2], p: r[3], lump: .05 }; }, color: mouthColor('down') }), skin); jawM.castShadow = true; jaw.add(jawM);
  const tongue = new T.Mesh(new T.SphereGeometry(.5, 16, 8), new T.MeshStandardMaterial({ color: 0x6a1c1c, roughness: .5 })); tongue.scale.set(1.3, .1, .32); tongue.position.set(.6, -.03, 0); jaw.add(tongue);
  const palate = new T.Mesh(new T.SphereGeometry(.5, 16, 8), new T.MeshStandardMaterial({ color: 0x4a1414, roughness: .6, side: T.DoubleSide })); palate.scale.set(1.45, .06, .36); palate.position.set(.7, -.1, 0); head.add(palate);
  // 이빨: 위 13쌍(앞쪽 크게) / 아래 12쌍, 살짝 휘고 들쭉날쭉
  const toothG = new T.ConeGeometry(.024, .12, 7); toothG.translate(0, -.05, 0);
  const placeTeeth = (parent, curve, rr, n, dir) => { for (const sd of [-1, 1]) for (let i = 0; i < n; i++) { const t = .1 + i / n * .84, c = curve.getPoint(t), r = rr(t); const th = new T.Mesh(toothG, bone);
    const s = (.75 + .6 * Math.sin(Math.PI * clamp(t * 1.3, 0, 1))) * rnd(.8, 1.15); th.scale.set(s, s * (dir < 0 ? 1.15 : .9), s); th.position.set(c.x, dir < 0 ? c.y - r[1] * .72 : c.y + r[0] * .6, sd * r[2] * .84); th.rotation.set(sd * rnd(-.08, .08), 0, dir < 0 ? rnd(-.1, .25) : Math.PI + rnd(-.25, .1)); th.castShadow = true; parent.add(th); } };
  placeTeeth(head, skullC, skullR, 13, -1); placeTeeth(jaw, jawC, jawR, 12, 1);

  // 다리: 엉덩이 관절 → 허벅지 → 정강이 → 발허리 → 발가락 3
  const hipP = spine.getPoint(.5);
  function seg(len, r0, r1, bulge, opt){ opt = opt || {}; const g = sweep(T, { rings: 22, segs: 18, at: t => { const r = lerp(r0, r1, t) * (1 + bulge * Math.sin(Math.PI * clamp(t * 1.15, 0, 1))) * (opt.cap && t > .94 ? .4 + (1 - t) / .06 * .6 : 1);
    return { c: new T.Vector3(opt.fx ? opt.fx(t) : 0, -t * len, 0), rT: r * (opt.wx || 1.0), rB: r * (opt.wx || 1.0), rZ: r * (opt.wz || .85), p: .95, lump: .06 }; }, color: legColor });
    const m = new T.Mesh(g, skin); m.castShadow = true; return m; }
  function joint(r){ const g = new T.SphereGeometry(r, 18, 14), P = g.attributes.position, Nn = g.attributes.normal, c = [], o = [0, 0, 0], v = new T.Vector3(), n = new T.Vector3();
    for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k); n.fromBufferAttribute(Nn, k); toLin(legColor(v, n, o)); c.push(o[0], o[1], o[2]); } g.setAttribute('color', new T.Float32BufferAttribute(c, 3)); const m = new T.Mesh(g, skin); m.scale.set(1, 1, .8); m.castShadow = true; return m; }
  function leg(sd){ const L = { hip: new T.Group() }; L.hip.position.set(hipP.x + .1, hipP.y - .35, sd * .62); root.add(L.hip);
    const thigh = seg(1.35, .66, .4, .28, { wx: 1.1, wz: .72, fx: t => Math.sin(Math.PI * t) * .12 }); L.hip.add(thigh);
    L.knee = new T.Group(); L.knee.position.y = -1.3; L.hip.add(L.knee); L.knee.add(joint(.38)); L.knee.add(seg(1.25, .36, .2, .18, { wz: .8, fx: t => -Math.sin(Math.PI * t) * .06 }));
    L.ankle = new T.Group(); L.ankle.position.y = -1.22; L.knee.add(L.ankle); L.ankle.add(joint(.2)); L.ankle.add(seg(.72, .19, .14, .05)); 
    L.toe = new T.Group(); L.toe.position.y = -.7; L.ankle.add(L.toe); L.toe.add(joint(.16));
    [-1, 0, 1].forEach(k => { const f = new T.Group(); f.rotation.y = k * .32; f.position.z = k * .06; L.toe.add(f); const tg = seg(k ? .5 : .62, .11, .055, .1, { wz: 1, cap: true }); tg.rotation.z = Math.PI / 2; tg.position.x = -.02; f.add(tg);
      const cl = new T.Mesh(new T.ConeGeometry(.05, .2, 8), clawM); cl.rotation.z = -Math.PI / 2 - .3; cl.position.set((k ? .5 : .62) + .07, -.04, 0); f.add(cl); });
    return L; }
  const legs = [leg(1), leg(-1)];
  // 앞다리(작게): 가슴 아래
  const chestP = spine.getPoint(.66);
  function arm(sd){ const A = { sh: new T.Group() }; A.sh.position.set(chestP.x + .35, chestP.y - .75, sd * .55); root.add(A.sh); A.sh.add(seg(.42, .1, .07, .2));
    A.el = new T.Group(); A.el.position.y = -.4; A.sh.add(A.el); A.el.add(seg(.36, .07, .05, .1));
    for (const k of [-1, 1]) { const c = new T.Mesh(new T.ConeGeometry(.025, .13, 6), clawM); c.position.set(.03, -.4, k * .03); c.rotation.z = .5; A.el.add(c); } return A; }
  const arms = [arm(1), arm(-1)];
  return { root, body, bones, tail, chest, belly, neck1, neck2, headB, head, jaw, legs, arms, hipY: hipP.y }; }

// ───── 걷기 자세(다리 각) — 휴식 각 + 위상
const LEG_REST = { hip: .45, knee: -1.15, ankle: .95 };
function poseLeg(L, ph, amp){ const s = Math.sin(ph), swing = Math.max(0, Math.sin(ph + Math.PI)); // swing>0 = 발 듦
  const hip = LEG_REST.hip + Math.cos(ph) * .42 * amp, knee = LEG_REST.knee - swing * .55 * amp, ankle = LEG_REST.ankle + swing * .35 * amp - s * .1 * amp;
  L.hip.rotation.z = hip; L.knee.rotation.z = knee; L.ankle.rotation.z = ankle; L.toe.rotation.z = -(hip + knee + ankle) - swing * .3 * amp; return swing; }
function footDrop(){ // 휴식 자세에서 엉덩이 관절 → 발바닥 높이
  const a1 = LEG_REST.hip, a2 = a1 + LEG_REST.knee, a3 = a2 + LEG_REST.ankle; return 1.3 * Math.cos(a1) + 1.22 * Math.cos(a2) + .7 * Math.cos(a3) + .1; }

function create(opt){ const T = window.THREE, W = opt.W, H = opt.H;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  let renderer; try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }); } catch (e) { return null; }
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0, 0); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(48, W / H, .1, 200); camera.position.set(0, 1.35, 9); camera.lookAt(0, 2.1, 0);
  scene.add(new T.HemisphereLight(0xfff4e0, 0x5a4a3a, .75));
  const key = new T.DirectionalLight(0xfff1dc, 1.35); key.position.set(-6, 12, 9); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); const sc = key.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -4; sc.near = 1; sc.far = 40; key.shadow.bias = -.0008; key.shadow.normalBias = .02; scene.add(key); scene.add(key.target);
  const rim = new T.DirectionalLight(0xbfd6ff, .7); rim.position.set(5, 6, -10); scene.add(rim);
  const floor = new T.Mesh(new T.PlaneGeometry(60, 30), new T.ShadowMaterial({ opacity: .42 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const D = build(T); const stage = new T.Group(); stage.add(D.root); scene.add(stage);
  const lift = footDrop() - (D.hipY - .35); D.root.position.y = lift; // 엉덩이 관절 높이를 다리 길이에 맞춤
  const audio = makeAudio(); let soundOn = true;
  const st = { mode: 'off', x: 14, side: 1, goalX: 4.2, face: Math.PI, faceGoal: Math.PI, phase: 0, walkAmp: 0, t: 0, act: null, actT: 0, cool: 0, idleT: 0, hideT: 0, lookYaw: 0, lookPitch: 0, jaw: 0, shake: 0, scale: 1, z: -2, lastStep: [0, 0], seen: true };
  const dust = []; const tmpV = new T.Vector3(), tmpV2 = new T.Vector3(), target = new T.Vector3(0, 2, 1.5);
  function setScale(s){ st.scale = s; stage.scale.setScalar(s); }
  setScale(opt.scale || 1.25);
  function screenOf(v){ tmpV2.copy(v).project(camera); return { x: (tmpV2.x * .5 + .5) * W, y: (-tmpV2.y * .5 + .5) * H }; }
  function personTarget(p){ if (!p || !p[0] || p[0].v < .4) return false; const nx = p[0].x / W * 2 - 1, ny = -(p[0].y / H * 2 - 1); tmpV.set(nx, ny, .5).unproject(camera).sub(camera.position).normalize();
    const zP = 1.6, k = (zP - camera.position.z) / tmpV.z; target.copy(camera.position).addScaledVector(tmpV, k); return true; }
  function act(name){ st.act = name; st.actT = 0; if (name === 'roar') { soundOn && audio.roar(2.3); st.cool = 5; } if (name === 'sniff') { st.cool = 2.5; } if (name === 'growl') { soundOn && audio.growl(); st.cool = 3; } }

  const api = { canvas: cv, audio, get mode(){ return st.mode; }, get shake(){ return st.shake; },
    set sound(v){ soundOn = !!v; }, get sound(){ return soundOn; }, setScale, setSide(s){ st.side = s >= 0 ? 1 : -1; st.goalX = st.side * Math.abs(st.goalX); if (st.mode === 'idle') st.mode = 'walk'; },
    setOffset(x){ st.goalX = x; st.side = x >= 0 ? 1 : -1; if (st.mode === 'idle') st.mode = 'walk'; },
    enter(){ audio.ensure(); st.side = st.goalX >= 0 ? 1 : -1; st.x = st.side * 15; st.face = st.side > 0 ? Math.PI : 0; st.mode = 'walk'; st.act = null; st.cool = 1.2; st.seen = true; },
    leave(){ if (st.mode === 'off') return; st.mode = 'exit'; st.act = null; },
    roar(){ if (st.mode === 'off') return api.enter(); act('roar'); },
    startle(){ if (st.mode === 'idle' && st.cool <= 0 && st.seen) act('roar'); },
    update, drawTo };

  function update(dt, pose, b){ st.t += dt; if (st.mode === 'off') return;
    const has = personTarget(pose); st.cool = Math.max(0, st.cool - dt); st.shake = Math.max(0, st.shake - dt * 2.2);
    // 반응
    if (st.mode === 'idle' && b && b.ok) { if (b.squat) { st.hideT += dt; if (st.hideT > .5 && st.seen) { st.seen = false; act('sniff'); soundOn && audio.snort(); } } else { if (!st.seen) { st.seen = true; if (st.cool < 1.5) act('growl'); } st.hideT = 0; }
      if (b.armsUp && st.cool <= 0 && st.seen) act('roar'); }
    if (st.mode === 'idle') { st.idleT += dt; if (st.idleT > 11 && st.cool <= 0 && !st.act) { st.idleT = 0; act(Math.random() < .5 ? 'roar' : 'growl'); } }
    // 이동
    let speed = 0, goal = st.mode === 'exit' ? -st.side * 16 : st.goalX;
    if (st.mode === 'walk' || st.mode === 'exit') { const dx = goal - st.x, dir = Math.sign(dx) || 1; st.faceGoal = dir < 0 ? Math.PI : 0; speed = 2.8; st.x += dir * Math.min(Math.abs(dx), speed * dt);
      if (Math.abs(dx) < .05) { if (st.mode === 'exit') { st.mode = 'off'; return; } st.mode = 'idle'; st.idleT = 0; if (!st.act) act('roar'); } }
    if (st.mode === 'idle') st.faceGoal = st.side > 0 ? Math.PI + .62 : -.62;
    let df = st.faceGoal - st.face; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2; st.face += df * Math.min(1, dt * 2.2);
    st.walkAmp = lerp(st.walkAmp, speed > 0 ? 1 : 0, Math.min(1, dt * 4)); st.phase += dt * (speed > 0 ? 3.9 : 0);
    const R = D.root; stage.position.set(st.x * st.scale, 0, st.z); stage.rotation.y = st.face;
    // 다리·몸 흔들림
    const sw = [poseLeg(D.legs[0], st.phase, st.walkAmp), poseLeg(D.legs[1], st.phase + Math.PI, st.walkAmp)];
    if (st.walkAmp > .2) for (let i = 0; i < 2; i++) { const down = sw[i] < .02; if (down && st.lastStep[i] > .02) { st.shake = Math.min(1, st.shake + .55); soundOn && audio.step(.9); const fp = new T.Vector3(); D.legs[i].toe.getWorldPosition(fp); const s = screenOf(fp); for (let k = 0; k < 14; k++) dust.push({ x: s.x + rnd(-40, 40) * st.scale, y: s.y + rnd(-6, 4), vx: rnd(-1.6, 1.6), vy: rnd(-1.1, -.2), r: rnd(10, 26) * st.scale, life: 1 }); } st.lastStep[i] = sw[i]; }
    const breathe = Math.sin(st.t * 1.6);
    R.position.y = lift + Math.abs(Math.cos(st.phase)) * .1 * st.walkAmp - .05 * st.walkAmp + breathe * .015;
    D.chest.rotation.z = breathe * .02; D.belly.scale.setScalar(1 + breathe * .012);
    D.tail.forEach((bn, i) => { const k = (i + 1) / D.tail.length; bn.rotation.y = Math.sin(st.t * 1.3 - i * .55 + st.phase * .5) * (.05 + .06 * st.walkAmp) * (1 + k); bn.rotation.z = Math.sin(st.t * 1.1 - i * .4) * .02 - .01 * k + Math.sin(st.phase * 2) * .02 * st.walkAmp; });
    D.arms.forEach((A, i) => { A.sh.rotation.z = .5 + Math.sin(st.t * 1.4 + i) * .06; A.el.rotation.z = .9 + Math.sin(st.t * 1.7 + i) * .08; });
    // 머리: 사람 바라보기 + 행동
    let yaw = 0, pitch = -.1;
    if (has && st.seen && st.mode !== 'exit') { R.updateMatrixWorld(true); tmpV.copy(target); D.neck1.parent.worldToLocal(tmpV); const base = D.neck1.position; const dx = tmpV.x - base.x, dy = tmpV.y - base.y, dz = tmpV.z - base.z;
      yaw = clamp(Math.atan2(-dz, dx), -1.3, 1.3); pitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)) + .25, -.75, .55); }
    else if (!st.seen) { yaw = Math.sin(st.t * .9) * .8; pitch = -.45; }
    else if (st.walkAmp > .3) { yaw = Math.sin(st.phase * .5) * .1; pitch = -.05; }
    let jawGoal = .04 + Math.max(0, Math.sin(st.t * .7)) * .03, extraP = 0, shakeYaw = 0;
    if (st.act) { st.actT += dt; const a = st.actT;
      if (st.act === 'roar') { if (a < .45) { extraP = smooth(0, .45, a) * .38; jawGoal = .18; } else if (a < 2.4) { const k = smooth(.45, .75, a) * (1 - smooth(2.0, 2.4, a)); extraP = .38 - smooth(.45, .8, a) * .62; jawGoal = .05 + k * .78 + Math.sin(a * 38) * .03 * k; shakeYaw = Math.sin(a * 9) * .09 * k; st.shake = Math.max(st.shake, .6 * k); } else st.act = null; }
      else if (st.act === 'growl') { const k = Math.sin(Math.PI * clamp(a / 1.3, 0, 1)); jawGoal = .05 + k * .2; extraP = -.12 * k; if (a > 1.3) st.act = null; }
      else if (st.act === 'sniff') { extraP = -.35 * Math.sin(Math.PI * clamp(a / 2.2, 0, 1)); jawGoal = .03 + (Math.sin(a * 14) > .7 ? .05 : 0); if (a > 2.2) st.act = null; } }
    st.lookYaw = lerp(st.lookYaw, yaw + shakeYaw, Math.min(1, dt * (st.act === 'roar' ? 9 : 3.5))); st.lookPitch = lerp(st.lookPitch, pitch + extraP, Math.min(1, dt * 4));
    D.neck1.rotation.set(0, st.lookYaw * .4, st.lookPitch * .35); D.neck2.rotation.set(0, st.lookYaw * .3, st.lookPitch * .3); D.headB.rotation.set(0, st.lookYaw * .3, st.lookPitch * .35);
    st.jaw = lerp(st.jaw, jawGoal, Math.min(1, dt * 12)); D.jaw.rotation.z = -st.jaw;
    renderer.render(scene, camera); }

  function drawTo(ctx){ if (st.mode === 'off') return; ctx.drawImage(cv, 0, 0, W, H);
    for (const q of dust) { q.x += q.vx; q.y += q.vy; q.vy *= .97; q.r *= 1.012; q.life -= .016; const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r); g.addColorStop(0, `rgba(150,128,100,${.32 * q.life})`); g.addColorStop(1, 'rgba(150,128,100,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill(); }
    for (let i = dust.length - 1; i >= 0; i--) if (dust[i].life <= 0) dust.splice(i, 1); }
  return api; }

window.KDino = { create };
})();
