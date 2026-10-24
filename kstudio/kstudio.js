/* 케이스튜디오 v0.1 — 몸으로 만드는 CG
 * ① 캐릭터: 포즈(33관절) → 3D 로봇 실시간 리타게팅(거울)   ② 배경: 포즈 모델 사람 마스크로 배경 교체   ③ 효과: 뼈대 위치에 그림
 * ④ 녹화: 합성 캔버스 → MediaRecorder(webm) / 사진(png).  얼굴 인식·표정 없음(의도). 영상 반출 0.
 */
(() => {
const $ = id => document.getElementById(id), now = () => performance.now(), rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const km = KMotion.create({ video: $('v'), canvas: $('c'), modes: ['pose'], segment: false, activity: 'kstudio' });
KMotionData.attach(km, $('hdr'));
const ov = $('ov'), dev = $('dev'), { ctx, W, H } = km; if (new URLSearchParams(location.search).has('dev')) dev.classList.remove('hidden');
let view = 'person', bg = 'camera', bgImg = null, fx = { fire: false, shock: false, crown: false, sparkle: false, bones: false }, parts = [], shocks = [];

// ───── Three.js 캐릭터(로봇)
const tcv = $('three'); const renderer = new THREE.WebGLRenderer({ canvas: tcv, antialias: false, alpha: true, powerPreference: 'low-power' }); renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0); renderer.setSize(W, H, false);
const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(40, W / H, .1, 100); camera.position.set(0, 1.6, 7.2); camera.lookAt(0, 1.5, 0);
scene.add(new THREE.HemisphereLight(0xffffff, 0x334466, 1.0)); const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(3, 6, 5); scene.add(key);
const M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: .4, metalness: .45 });
const robot = new THREE.Group(); scene.add(robot);
const torsoG = new THREE.Group(); torsoG.position.y = 1.0; robot.add(torsoG); // 엉덩이 기준 회전
const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, .6), M(0xe8ecf5)); torso.position.y = .75; torsoG.add(torso);
const chest = new THREE.Mesh(new THREE.CircleGeometry(.18, 24), new THREE.MeshBasicMaterial({ color: 0x4de1ff })); chest.position.set(0, .95, .31); torsoG.add(chest);
const headG = new THREE.Group(); headG.position.y = 1.45; torsoG.add(headG);
const head = new THREE.Mesh(new THREE.SphereGeometry(.42, 32, 32), M(0xf4f6fb)); head.position.y = .42; headG.add(head);
const visor = new THREE.Mesh(new THREE.SphereGeometry(.27, 32, 16, 0, Math.PI * 2, 0, Math.PI * .55), M(0x171b2e)); visor.rotation.x = -Math.PI / 2 + .3; visor.position.set(0, .42, .22); headG.add(visor);
const eye = (x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 12), new THREE.MeshBasicMaterial({ color: 0x4de1ff })); e.position.set(x, .46, .44); headG.add(e); }; eye(-.09); eye(.09);
const ant = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .35), M(0x9ba3b5)); ant.position.y = .98; headG.add(ant); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffae45 })); bulb.position.y = 1.18; headG.add(bulb);
function limb(parent, x, y, upLen, lowLen, upR, lowR, endGeo, endColor){ const g = new THREE.Group(); g.position.set(x, y, 0); const up = new THREE.Mesh(new THREE.CylinderGeometry(upR, upR * .9, upLen), M(0xc9d2e3)); up.position.y = -upLen / 2; g.add(up);
  const low = new THREE.Group(); low.position.y = -upLen; const lo = new THREE.Mesh(new THREE.CylinderGeometry(lowR, lowR, lowLen), M(0xe8ecf5)); lo.position.y = -lowLen / 2; low.add(lo); const end = new THREE.Mesh(endGeo, M(endColor)); end.position.y = -lowLen - .05; low.add(end); g.add(low); g.userData.low = low; parent.add(g); return g; }
const armL = limb(torsoG, -.72, 1.3, .7, .65, .12, .1, new THREE.SphereGeometry(.15, 16, 16), 0x4865f5), armR = limb(torsoG, .72, 1.3, .7, .65, .12, .1, new THREE.SphereGeometry(.15, 16, 16), 0x4865f5);
const legL = limb(robot, -.3, 1.0, .6, .55, .15, .13, new THREE.BoxGeometry(.3, .14, .5), 0x4865f5), legR = limb(robot, .3, 1.0, .6, .55, .15, .13, new THREE.BoxGeometry(.3, .14, .5), 0x4865f5);
[legL, legR].forEach(l => { l.userData.low.children[1].position.z = .1; });
const ground = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .25 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; robot.add(ground);
// 목표 각도(부드럽게)
const rig = { armL: 0, armR: 0, lowL: 0, lowR: 0, legL: 0, legR: 0, kneeL: 0, kneeR: 0, head: 0, torso: 0, x: 0, y: 0 }, goal = Object.assign({}, rig);
const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);                    // 화면 좌표 각(y 아래 +)
const rel = (a) => { let r = a - Math.PI / 2; while (r > Math.PI) r -= Math.PI * 2; while (r < -Math.PI) r += Math.PI * 2; return r; }; // 아래로 늘어뜨림 = 0
function retarget(p, b){ if (!p || !b) return;
  const okv = i => p[i].v > .4;
  if (okv(11) && okv(13)) goal.armL = -rel(ang(p[11], p[13])); if (okv(12) && okv(14)) goal.armR = -rel(ang(p[12], p[14]));
  if (okv(13) && okv(15)) goal.lowL = -rel(ang(p[13], p[15])) - goal.armL; if (okv(14) && okv(16)) goal.lowR = -rel(ang(p[14], p[16])) - goal.armR;
  if (okv(23) && okv(25)) goal.legL = clamp(-rel(ang(p[23], p[25])), -1.2, 1.2); if (okv(24) && okv(26)) goal.legR = clamp(-rel(ang(p[24], p[26])), -1.2, 1.2);
  if (okv(25) && okv(27)) goal.kneeL = clamp(-rel(ang(p[25], p[27])) - goal.legL, -1.6, .3); if (okv(26) && okv(28)) goal.kneeR = clamp(-rel(ang(p[26], p[28])) - goal.legR, -1.6, .3);
  if (okv(7) && okv(8)) goal.head = -Math.atan2(p[8].y - p[7].y, p[8].x - p[7].x);
  goal.torso = -(ang(b.hip, b.sh) + Math.PI / 2);
  goal.x = ((b.hip.x / W) - .5) * 4.2; goal.y = b.squat ? -.45 : (b.air ? .6 : 0); }
function renderRobot(dt){ for (const k in goal) rig[k] += (goal[k] - rig[k]) * Math.min(1, dt * 10);
  armL.rotation.z = rig.armL; armR.rotation.z = rig.armR; armL.userData.low.rotation.z = rig.lowL; armR.userData.low.rotation.z = rig.lowR;
  legL.rotation.z = rig.legL; legR.rotation.z = rig.legR; legL.userData.low.rotation.z = rig.kneeL; legR.userData.low.rotation.z = rig.kneeR;
  headG.rotation.z = rig.head * .8; torsoG.rotation.z = rig.torso; robot.position.x = rig.x; robot.position.y = rig.y; renderer.render(scene, camera); }

// ───── 배경
const bgCache = {};
function drawBg(t){ if (bg === 'camera') { km.drawCamera(); return; } if (bg === 'green') { ctx.fillStyle = '#00b140'; ctx.fillRect(0, 0, W, H); return; }
  if (bg === 'upload') { if (bgImg) { const s = Math.max(W / bgImg.width, H / bgImg.height); ctx.drawImage(bgImg, (W - bgImg.width * s) / 2, (H - bgImg.height * s) / 2, bgImg.width * s, bgImg.height * s); } else { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H); } return; }
  if (bg === 'space') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#060a1f'); g.addColorStop(1, '#1a1f4a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; for (let i = 0; i < 140; i++) { const x = (i * 131) % W, y = (i * 71) % H; ctx.globalAlpha = .4 + ((i * 7) % 6) / 10; ctx.fillRect(x, y, 2, 2); } ctx.globalAlpha = 1;
    ctx.fillStyle = '#8466f5'; ctx.beginPath(); ctx.arc(W * .82, H * .22, 70, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(201,167,255,.7)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(W * .82, H * .22, 120, 28, -.3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#20264d'; ctx.fillRect(0, H * .78, W, H * .22); ctx.strokeStyle = 'rgba(77,225,255,.35)'; ctx.lineWidth = 2; for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, H * .78); ctx.lineTo(x - 160, H); ctx.stroke(); } for (let y = H * .78; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = '#2c3470'; for (let i = 0; i < 6; i++) ctx.fillRect(i * W / 6 + 20, H * .3, 40, H * .48); return; }
  if (bg === 'joseon') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f6d9a8'); g.addColorStop(1, '#e8b982'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#9c6b3f'; for (let i = 0; i < 5; i++) { const x = i * W / 5; ctx.fillRect(x + 10, H * .42, W / 5 - 20, H * .36); ctx.fillStyle = '#3b3b3b'; ctx.beginPath(); ctx.moveTo(x - 10, H * .44); ctx.lineTo(x + W / 10, H * .3); ctx.lineTo(x + W / 5 + 10, H * .44); ctx.fill(); ctx.fillStyle = '#9c6b3f'; }
    ctx.fillStyle = '#6b4a2b'; for (let i = 0; i < 5; i++) ctx.fillRect(i * W / 5 + W / 10 - 30, H * .55, 60, H * .23);
    ctx.fillStyle = '#c9a070'; ctx.fillRect(0, H * .78, W, H * .22); ctx.strokeStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, H * .78); ctx.lineTo(x - 80, H); ctx.stroke(); } return; }
  if (bg === 'forest') { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#bfe6ff'); g.addColorStop(.5, '#dff7e4'); g.addColorStop(1, '#5c9a4a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const x = i * W / 8 + ((i * 37) % 40), s = .8 + ((i * 13) % 5) / 10; ctx.fillStyle = '#5b3a1e'; ctx.fillRect(x - 12 * s, H * .45, 24 * s, H * .35); ctx.fillStyle = i % 2 ? '#2f7d4a' : '#3f9a5a'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x, H * (.18 + k * .09)); ctx.lineTo(x - (70 - k * 12) * s, H * (.36 + k * .08)); ctx.lineTo(x + (70 - k * 12) * s, H * (.36 + k * .08)); ctx.fill(); } }
    ctx.fillStyle = '#4f8a3f'; ctx.fillRect(0, H * .8, W, H * .2); return; } }

// ───── 효과
function spawnFx(p, b, t){ if (!p || !b) return;
  if (fx.fire) for (const w of [15, 16]) if (p[w].v > .4) for (let i = 0; i < 3; i++) parts.push({ x: p[w].x + rnd(-8, 8), y: p[w].y, vx: rnd(-1, 1), vy: rnd(-4, -1.5), r: rnd(6, 14), life: 1, decay: .04, kind: 'fire' });
  if (fx.sparkle) for (let i = 0; i < 2; i++) { const k = [0, 11, 12, 15, 16, 23, 24][Math.random() * 7 | 0]; parts.push({ x: p[k].x + rnd(-30, 30), y: p[k].y + rnd(-30, 30), vx: rnd(-.5, .5), vy: rnd(-1.5, -.3), r: rnd(2, 5), life: 1, decay: .025, kind: 'spark', hue: rnd(0, 360) }); } }
km.on('warn', e => { if (e.kind === 'slow') { $('posetxt').textContent = '느림 — 효과·배경을 줄여 보세요'; } });
km.on('body:land', e => { if (fx.shock) shocks.push({ x: e.pos.x, y: Math.min(H - 10, e.pos.y + (km.last && km.last.pose ? (km.last.pose[27].y - e.pos.y) : 150)), r: 10, life: 1 }); });
function drawFx(p, t){ for (const q of parts) { q.x += q.vx; q.y += q.vy; q.life -= q.decay; if (q.kind === 'fire') { q.r *= .97; const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r); g.addColorStop(0, `rgba(255,240,150,${q.life})`); g.addColorStop(.5, `rgba(255,120,30,${q.life * .8})`); g.addColorStop(1, 'rgba(200,30,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = `hsla(${q.hue},90%,70%,${q.life})`; ctx.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + t / 300; ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + Math.cos(a) * q.r * 2, q.y + Math.sin(a) * q.r * 2); } ctx.strokeStyle = `hsla(${q.hue},90%,75%,${q.life})`; ctx.lineWidth = 2; ctx.stroke(); } } parts = parts.filter(q => q.life > 0);
  for (const s of shocks) { s.r += 14; s.life -= .05; ctx.strokeStyle = `rgba(255,255,255,${s.life})`; ctx.lineWidth = 8 * s.life + 2; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * .35, 0, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = `rgba(255,211,92,${s.life * .8})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * .7, s.r * .25, 0, 0, Math.PI * 2); ctx.stroke(); } shocks = shocks.filter(s => s.life > 0);
  if (fx.crown && p && p[0].v > .4 && p[7].v > .4 && p[8].v > .4) { const cx = (p[7].x + p[8].x) / 2, w = Math.abs(p[8].x - p[7].x) * 1.3, y = p[0].y - w * 1.15, tilt = Math.atan2(p[8].y - p[7].y, p[8].x - p[7].x); ctx.save(); ctx.translate(cx, y); ctx.rotate(tilt); ctx.fillStyle = '#ffd35c'; ctx.strokeStyle = '#c9931a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -w * .35); ctx.lineTo(-w / 4, -w * .15); ctx.lineTo(0, -w * .5); ctx.lineTo(w / 4, -w * .15); ctx.lineTo(w / 2, -w * .35); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#f1646c'; for (const x of [-w / 2, 0, w / 2]) { ctx.beginPath(); ctx.arc(x, x === 0 ? -w * .5 : -w * .35, w * .06, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  if (fx.bones && p) km.drawSkeleton(p, km.POSE_BONES, 'rgba(92,242,164,.9)', 5); }

// ───── 프레임
let last = 0;
km.onFrame = f => { const t = now(), dt = Math.min(.05, (t - last) / 1000 || .016); last = t; const p = f.pose, b = f.actions.body, ok = !!(p && b && b.ok);
  $('posedot').className = 'dot ' + (ok ? 'on' : km.running ? 'bad' : ''); $('posetxt').textContent = !km.running ? '인식 대기' : ok ? '인식 중' : '몸이 안 보여요';
  drawBg(t);
  if (view !== 'robot') { if (bg === 'camera') { /* 카메라 그대로면 이미 사람 포함 */ } else if (f.maskCanvas && !km.mouse) km.drawPerson(ctx); else if (!km.mouse && km.segmentOn) { ctx.font = '700 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('사람 분리 준비 중…', W / 2, H - 30); } }
  if (view !== 'person') { retarget(p, b); renderRobot(dt); ctx.drawImage(tcv, 0, 0, W, H); }
  spawnFx(p, b, t); drawFx(p, t);
  if (recording) { ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.arc(W - 26, 26, 10, 0, Math.PI * 2); ctx.fill(); }
  if (km.mouse) km.drawMouseHelp();
  if (!dev.classList.contains('hidden')) dev.textContent = `fps ${km.fps} view ${view} bg ${bg} mask ${!!f.maskCanvas} ` + (b ? `squat ${b.squat} air ${b.air} lean ${b.lean}` : 'no body'); };

// ───── UI
document.querySelectorAll('[data-view]').forEach(btn => btn.onclick = () => { view = btn.dataset.view; document.querySelectorAll('[data-view]').forEach(x => x.classList.toggle('on', x === btn)); syncSegment(); km.emit('kstudio:view', { view }); });
document.querySelectorAll('[data-fx]').forEach(btn => btn.onclick = () => { fx[btn.dataset.fx] = !fx[btn.dataset.fx]; btn.classList.toggle('on', fx[btn.dataset.fx]); });
function syncSegment(){ const need = bg !== 'camera' && view !== 'robot'; if (need !== km.segmentOn) km.setSegment(need); }
$('bg').onchange = e => { bg = e.target.value; if (bg === 'upload') $('bgfile').click(); syncSegment(); km.emit('kstudio:bg', { bg }); };
$('bgfile').onchange = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => bgImg = img; img.src = URL.createObjectURL(f); };
$('fs').onclick = () => { const el = $('stage'); document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen(); };
$('snap').onclick = () => { const a = document.createElement('a'); a.download = `kstudio-${Date.now()}.png`; a.href = $('c').toDataURL('image/png'); a.click(); addClip(a.download, a.href, '📷'); };
// 녹화: 합성 캔버스 그대로 webm
let recorder = null, chunks = [], recording = false, recT0 = 0, recTimer = 0;
$('rec').onclick = async () => { if (recording) return stopRec(); if (!km.running) return;
  const stream = $('c').captureStream(30); if ($('mic').checked) { try { const a = await navigator.mediaDevices.getUserMedia({ audio: true }); a.getAudioTracks().forEach(tr => stream.addTrack(tr)); } catch (e) { console.warn('마이크 없음', e); } }
  const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || '';
  recorder = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 6e6 } : undefined); chunks = []; recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
  recorder.onstop = () => { const blob = new Blob(chunks, { type: 'video/webm' }); const url = URL.createObjectURL(blob); addClip(`kstudio-${Date.now()}.webm`, url, '🎞', blob.size); km.emit('kstudio:clip', { seconds: Math.round((now() - recT0) / 1000), bytes: blob.size, view, bg }); };
  recorder.start(250); recording = true; recT0 = now(); $('rec').textContent = '⏹ 정지'; $('rec').classList.add('rec'); recTimer = setInterval(() => $('rectime').textContent = '⏺ ' + Math.round((now() - recT0) / 1000) + '초', 500); };
function stopRec(){ recording = false; clearInterval(recTimer); $('rectime').textContent = '—'; $('rec').textContent = '⏺ 녹화'; $('rec').classList.remove('rec'); if (recorder && recorder.state !== 'inactive') recorder.stop(); }
function addClip(name, url, icon, bytes){ const a = document.createElement('a'); a.href = url; a.download = name; a.textContent = `${icon} ${name}${bytes ? ' · ' + (bytes / 1048576).toFixed(1) + 'MB' : ''} ↓`; $('clips').prepend(a); }
addEventListener('pagehide', () => { if (recording) stopRec(); });

// ───── 시작
function setup(){ ov.innerHTML = `<h2>🎬 케이스튜디오</h2><p>몸으로 만드는 CG 스튜디오 — 내가 움직이면 캐릭터가 따라 하고, 배경이 바뀌고, 손에서 불꽃이 나와요.<br>녹화 버튼을 누르면 보이는 그대로 영상 파일이 돼요.</p><p style="color:var(--dim)">머리부터 무릎까지 보이게 두세 걸음 떨어져 서면 캐릭터가 제일 잘 따라 해요</p><button class="btn" id="start">스튜디오 열기</button>`; ov.classList.remove('hidden'); $('start').onclick = begin; }
async function begin(){ ov.innerHTML = '<h2>카메라 준비 중…</h2>'; $('camtxt').textContent = '연결 중'; try { await km.start(); $('camdot').className = 'dot on'; $('camtxt').textContent = km.mouse ? '마우스 모드' : '카메라 연결됨'; ov.classList.add('hidden'); km.emit('kstudio:start'); }
  catch (e) { $('camdot').className = 'dot bad'; $('camtxt').textContent = '카메라 실패'; ov.innerHTML = `<h2>열 수 없어요</h2><p>${e.message}</p><p style="color:var(--dim)">카메라 없이 보려면 주소 뒤에 ?mouse=1</p><button class="btn" id="b">다시</button>`; $('b').onclick = setup; } }
setup();
})();
