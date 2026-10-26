// K-MOTION MATH BATTLE · InputManager / GestureSelector(손·카메라, ../kmotion.js 엔진 hands 모드) / MouseSelector
// 둘 다 같은 이벤트: hover(slot, progress) · select(slot) · lost · found
export class InputManager { constructor(){ this.subs = {}; this.locked = true; } on(t, f){ (this.subs[t] = this.subs[t] || []).push(f); return this; } emit(t, d){ (this.subs[t] || []).forEach(f => f(d || {})); } lock(v){ this.locked = v; } }

export class MouseSelector {
  constructor(input, orbEls){ this.input = input; orbEls.forEach((el, i) => { el.onclick = e => { e.preventDefault(); if (!input.locked) input.emit('select', { slot: i, via: 'mouse' }); }; el.onpointerenter = () => !input.locked && input.emit('hover', { slot: i, progress: 0 }); el.onpointerleave = () => input.emit('hover', { slot: -1, progress: 0 }); }); }
}

// 손 위치(거울 캔버스 픽셀) → 화면 비율 좌표 → 구슬 영역 판정 → 600ms 유지 선택
export class GestureSelector {
  constructor(input, { video, canvas, orbEls, cursorEl, onStatus, onDebug, dwellMs = 600 }){
    this.input = input; this.orbEls = orbEls; this.cursor = cursorEl; this.onStatus = onStatus || (() => {}); this.onDebug = onDebug || (() => {}); this.dwell = dwellMs;
    this.km = KMotion.create({ video, canvas, modes: ['hands'], numHands: 2, activity: 'math-battle' });
    this.pos = null; this.sm = null; this.hoverSlot = -1; this.hoverSince = 0; this.selectedAt = 0; this.seen = false; this.lostAt = 0; this.active = false; this.calib = null;
    this.cfg = { smooth: .45, margin: 1.15, edge: { x0: .08, x1: .92, y0: .12, y1: .95 } }; // 손 이동 범위를 화면 전체에 펴기(가장자리 보정)
    this.km.onFrame = f => this.frame(f); this.km.on('error', e => this.onStatus({ kind: 'error', text: e.message }));
  }
  async start(){ await this.km.start(); this.started = true; }
  stop(){ this.km.stop(); this.started = false; }
  // 손 고르기: 지난 프레임 위치에 가까운 손 우선(손이 바뀌어 튀는 것 방지), 없으면 신뢰도 높은 손
  pickHand(f){ if (!f.hands.length) return null; let best = null, bd = 1e9; for (let i = 0; i < f.hands.length; i++) { const h = f.hands[i], a = f.actions.hands[i]; const c = a && a.center ? a.center : h[9]; const d = this.pos ? Math.hypot(c.x - this.pos.x, c.y - this.pos.y) : 0; if (d < bd) { bd = d; best = { c, a, h }; } } return best; }
  frame(f){
    const km = this.km; km.drawCamera(); for (let i = 0; i < f.hands.length; i++) km.drawSkeleton(f.hands[i], km.HAND_BONES, 'rgba(94,242,200,.9)', 3);
    const hand = this.pickHand(f), now = f.t;
    if (!hand) { this.pos = null; if (this.seen) { this.seen = false; this.lostAt = now; this.input.emit('lost'); } this.resetHover(); this.cursor.classList.add('hidden'); this.onStatus({ kind: 'lost', text: '손이 안 보여요' }); return; }
    if (!this.seen) { this.seen = true; this.input.emit('found'); }
    // 손 중심 → 화면 비율. 캔버스는 이미 거울이라 그대로 왼쪽=왼쪽.
    const e = this.cfg.edge; const nx = Math.min(1, Math.max(0, (hand.c.x / f.W - e.x0) / (e.x1 - e.x0))), ny = Math.min(1, Math.max(0, (hand.c.y / f.H - e.y0) / (e.y1 - e.y0)));
    this.pos = hand.c; this.sm = this.sm ? { x: this.sm.x + (nx - this.sm.x) * this.cfg.smooth, y: this.sm.y + (ny - this.sm.y) * this.cfg.smooth } : { x: nx, y: ny };
    const sx = this.sm.x * innerWidth, sy = this.sm.y * innerHeight; this.cursor.classList.remove('hidden'); this.cursor.style.transform = `translate(${sx}px,${sy}px)`;
    this.onStatus({ kind: 'ok', text: '손 인식 중' }); this.onDebug({ fps: km.fps, nx: +nx.toFixed(2), ny: +ny.toFixed(2), hands: f.hands.length, pose: hand.a ? hand.a.pose : '-' });
    // 보정 단계면 보정 쪽으로
    if (this.calib) { this.calib(sx, sy, now); return; }
    if (!this.active || this.input.locked) { this.resetHover(); return; }
    // 구슬 판정: 반지름 × margin 안
    let slot = -1; for (let i = 0; i < this.orbEls.length; i++) { const r = this.orbEls[i].getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (Math.hypot(sx - cx, sy - cy) < r.width / 2 * this.cfg.margin) { slot = i; break; } }
    if (slot !== this.hoverSlot) { this.hoverSlot = slot; this.hoverSince = now; }
    const prog = slot < 0 ? 0 : Math.min(1, (now - this.hoverSince) / this.dwell);
    this.setRing(prog); this.input.emit('hover', { slot, progress: prog });
    if (slot >= 0 && prog >= 1) { this.input.emit('select', { slot, via: 'hand' }); this.resetHover(); }
  }
  setRing(p){ const fg = this.cursor.querySelector('.fg'); if (fg) fg.style.strokeDashoffset = 151 * (1 - p); }
  resetHover(){ if (this.hoverSlot !== -1) this.input.emit('hover', { slot: -1, progress: 0 }); this.hoverSlot = -1; this.hoverSince = 0; this.setRing(0); }
  // 보정: 화면 위 3개 구슬을 차례로 400ms 씩 만지기 → 손이 화면 전체에 닿는지 확인
  calibrate(targets, onProgress){ return new Promise(res => { let i = 0, since = 0; const T = 420;
    this.calib = (sx, sy, now) => { const r = targets[i].getBoundingClientRect(); const inside = Math.hypot(sx - (r.left + r.width / 2), sy - (r.top + r.height / 2)) < r.width * .7; if (!inside) { since = 0; onProgress(i, 0); this.setRing(0); return; } if (!since) since = now; const p = Math.min(1, (now - since) / T); onProgress(i, p); this.setRing(p);
      if (p >= 1) { i++; since = 0; this.setRing(0); if (i >= targets.length) { this.calib = null; onProgress(targets.length, 1); res(); } } }; }); }
}
