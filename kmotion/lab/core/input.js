// 케이모션 과학실 — 입력 통일: 카메라 손(KMotion) · 화면 터치 · 마우스 · 자동 재생(script) → 같은 「손」 두 개
// 손 = { id, present, x, y (화면 비율 0~1, 위=0), grab, dir(손목 방향°, 카메라만), tiltIn(°, 터치·마우스의 기울이기 입력), lastSeen }
// 엔진(kmotion.js) 기본값은 건드리지 않는다. 속도·기울기 계산은 hands.js 에서.

const REACH = 0.70;   // 카메라에 잡힌 손 영역의 가운데 70% 를 화면 전체로 늘려 쓴다

function blankHand(id){ return { id, present: false, x: .5, y: .6, grab: false, dir: 0, tiltIn: 0, lastSeen: -1e9, src: null }; }
const reach = r => Math.min(1, Math.max(0, (r - (1 - REACH) / 2) / REACH));

export function createInput({ mode, el, camBox, camStatus, video, camCanvas }){
  const hands = [blankHand(0), blankHand(1)];
  const api = { mode, hands, km: null, camOk: false, onError: null };

  // ── 카메라 손
  if (mode === 'cam') {
    camBox.classList.remove('off');
    // 엔진의 작은 「📷 카메라」 단추는 끄고(카메라 창이 작아 안 보임) 과학실 도구 줄의 카메라 고르기 창을 쓴다
    const km = api.km = window.KMotion.create({ video, canvas: camCanvas, modes: ['hands'], numHands: 2, activity: 'lab', rangeButton: false });
    km.onStatus = s => { camStatus.textContent = s || '카메라 연결됨'; };
    const grabbed = [false, false];
    km.on('hand:grab', e => { if (e.hand < 2) grabbed[e.hand] = true; });
    km.on('hand:release', e => { if (e.hand < 2) grabbed[e.hand] = false; });
    km.onFrame = f => {
      km.drawCamera(); f.hands.forEach(h => h && km.drawSkeleton(h, km.HAND_BONES, 'rgba(120,220,255,.9)', 3));
      const seen = [false, false];
      for (const a of (f.actions && f.actions.hands) || []) { if (a.hand > 1) continue; const H = hands[a.hand];
        const p = a.pinched ? a.pinchPt : { x: (a.center.x + a.pinchPt.x) / 2, y: (a.center.y + a.pinchPt.y) / 2 };
        H.x = reach(p.x / f.W); H.y = reach(p.y / f.H); H.dir = a.dir; H.grab = grabbed[a.hand]; H.present = true; H.lastSeen = performance.now(); H.src = 'cam'; seen[a.hand] = true; }
      hands.forEach((H, i) => { if (!seen[i]) { H.present = false; H.grab = false; grabbed[i] = false; } });
    };
    const boot = () => km.start().then(() => { api.camOk = true; api.camError = null; api.onReady && api.onReady(); }).catch(e => { api.camOk = false; api.camError = e.message; camStatus.textContent = e.message; api.onError && api.onError(e); throw e; });
    boot().catch(() => {});
    // 카메라 고르기 — 저장 키는 엔진과 같은 'kmotion.camId'(모든 케이모션 활동에 같이 적용)
    api.listCameras = () => km.listCameras();
    api.currentCamera = () => km.camId || '';
    api.useCamera = async id => {
      if (km.running) { await km.switchCamera(id, true); return; }
      try { if (id) localStorage.setItem('kmotion.camId', id); else localStorage.removeItem('kmotion.camId'); } catch (_) {}
      await boot();                                                       // 처음 켜기가 실패했으면 고른 카메라로 다시 켠다
    };
    api.openRange = onClose => { if (km.running) km.openRangeUI(onClose); };
  }

  // ── 화면 터치·마우스 (pointer events 하나로). 첫 손가락 = 손 0, 둘째 = 손 1.
  //    둘째 손가락이 빈 곳에서 위아래로 끌면 tiltIn(기울이기 짝). 마우스는 휠·←→ 키가 기울이기.
  if (mode === 'touch') {
    const ptr = new Map();
    const rel = ev => { const r = el.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height }; };
    el.addEventListener('pointerdown', ev => { ev.preventDefault(); el.setPointerCapture && el.setPointerCapture(ev.pointerId);
      const used = new Set([...ptr.values()].map(p => p.slot)); const slot = used.has(0) ? 1 : 0; if (used.has(slot)) return;
      const p = rel(ev); ptr.set(ev.pointerId, { slot, y0: p.y }); const H = hands[slot];
      H.x = p.x; H.y = p.y; H.present = true; H.grab = true; H.lastSeen = performance.now(); H.src = ev.pointerType; H.tiltIn = 0; H.downY = p.y; });
    el.addEventListener('pointermove', ev => { const p = rel(ev); const P = ptr.get(ev.pointerId);
      if (!P) { if (ev.pointerType === 'mouse') { const H = hands[0]; H.x = p.x; H.y = p.y; H.present = true; H.src = 'mouse'; H.lastSeen = performance.now(); } return; }
      const H = hands[P.slot]; H.x = p.x; H.y = p.y; H.lastSeen = performance.now(); H.dragDy = p.y - P.y0; });
    const up = ev => { const P = ptr.get(ev.pointerId); if (!P) return; ptr.delete(ev.pointerId); const H = hands[P.slot]; H.grab = false; H.dragDy = 0;
      if (ev.pointerType !== 'mouse') H.present = false; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse' && !ptr.size) hands[0].present = false; });
    el.addEventListener('wheel', ev => { ev.preventDefault(); hands[0].tiltIn = Math.max(-110, Math.min(110, hands[0].tiltIn + ev.deltaY * .12)); }, { passive: false });
    addEventListener('keydown', ev => { if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { hands[0].tiltIn = Math.max(-110, Math.min(110, hands[0].tiltIn + (ev.key === 'ArrowRight' ? 10 : -10))); } });
    el.addEventListener('contextmenu', ev => ev.preventDefault());
  }

  // ── 자동 재생(세 관문 「한 판」): [{t(초), hand, x, y, grab, tilt}] 사이를 이어 손을 움직인다
  let script = null;
  api.play = function(keys, onDone){ script = { keys: keys.slice().sort((a, b) => a.t - b.t), t0: null, onDone }; api.mode = 'script'; };
  api.freeze = function(){ script = null; };   // 자동 재생을 그 자리에서 멈춤(손은 그대로 쥔 채) — 화면 찍기용
  api.update = function(now){
    if (!script) return; if (script.t0 == null) script.t0 = now;
    const t = (now - script.t0) / 1000, ks = script.keys;
    for (const id of [0, 1]) { const mine = ks.filter(k => k.hand === id); if (!mine.length) continue;
      let a = mine[0], b = mine[0]; for (const k of mine) { if (k.t <= t) a = k; if (k.t > t) { b = k; break; } b = k; }
      const u = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 1, lerp = (p, q) => p + (q - p) * u;
      const H = hands[id]; H.present = a.present !== false; H.x = lerp(a.x, b.x); H.y = lerp(a.y, b.y); H.grab = !!a.grab; H.tiltIn = lerp(a.tilt || 0, b.tilt || 0); H.lastSeen = now; H.src = 'script'; }
    if (t > ks[ks.length - 1].t + .3) { const d = script.onDone; script = null; hands.forEach(H => { H.present = false; H.grab = false; }); d && d(); }
  };
  return api;
}
