// K-MOTION RUN · InputManager 어댑터: KeyboardInput · MotionController(CameraManager+PoseTracker 는 ../kmotion.js 엔진 재사용)
// 둘 다 같은 이벤트(MOVE_LEFT / MOVE_RIGHT / JUMP / SLIDE / PAUSE)만 보낸다.

export class KeyboardInput {
  constructor(input){ this.input = input; this.enabled = true; this.downHeld = false;
    addEventListener('keydown', e => { if (!this.enabled || e.repeat) return; const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { input.emit('MOVE_LEFT', { via: 'key' }); e.preventDefault(); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { input.emit('MOVE_RIGHT', { via: 'key' }); e.preventDefault(); }
      else if (k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W') { input.emit('JUMP', { via: 'key' }); e.preventDefault(); }
      else if (k === 'ArrowDown' || k === 's' || k === 'S') { this.downHeld = true; input.emit('SLIDE', { via: 'key' }); e.preventDefault(); }
      else if (k === 'Escape') { input.emit('PAUSE', { via: 'key' }); } });
    addEventListener('keyup', e => { if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.downHeld = false; });
    setInterval(() => { if (this.enabled && this.downHeld) input.emit('SLIDE', { via: 'key', hold: true }); }, 350);
  }
}

// 동작 → 조작. 보정값(몸 중심 x·어깨 너비·엉덩이 높이·몸통 길이)으로 정규화, 히스테리시스 + 유지 시간으로 떨림·재입력 방지.
export class MotionController {
  constructor(input, { video, canvas, getLane, onStatus, onDebug }){
    this.input = input; this.getLane = getLane; this.onStatus = onStatus || (() => {}); this.onDebug = onDebug || (() => {});
    this.km = KMotion.create({ video, canvas, modes: ['pose'], activity: 'run' });
    this.base = null; this.calib = null; this.zone = 'center'; this.zoneCand = 'center'; this.zoneSince = 0; this.lastMove = 0;
    this.armsWas = false; this.bent = false; this.lastSlide = 0; this.seen = false; this.lostSince = 0; this.paused = false; this.foundAt = 0; this.active = false;
    this.cfg = { laneIn: .55, laneOut: .28, holdMs: 90, bendIn: .13, bendOut: .07, lostMs: 900 };
    this.km.onFrame = f => this.frame(f);
    this.km.on('error', e => this.onStatus({ kind: 'error', text: e.message }));
  }
  async start(){ await this.km.start(); this.started = true; }
  stop(){ this.km.stop(); this.started = false; }
  // 3초 보정: 몸이 보이는 프레임만 셈. onProgress(0~1, visible)
  calibrate(seconds, onProgress){ return new Promise(res => { this.base = null; this.calib = { need: seconds * 1000, acc: 0, last: 0, hx: 0, hy: 0, sw: 0, to: 0, n: 0, onProgress, res }; }); }
  frame(f){
    const km = this.km, ctx = f.ctx, b = f.actions.body, ok = !!(f.pose && b && b.ok);
    km.drawCamera();
    // 차선 안내선(거울 화면): 가운데 영역 표시
    if (this.base) { const sw = this.base.sw, cx = this.base.hx; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + s * sw * this.cfg.laneIn, 0); ctx.lineTo(cx + s * sw * this.cfg.laneIn, f.H); ctx.stroke(); } ctx.restore(); }
    if (f.pose) km.drawSkeleton(f.pose, km.POSE_BONES, ok ? 'rgba(93,211,122,.95)' : 'rgba(255,90,95,.9)');
    const now = f.t;
    // ── 보정 중
    if (this.calib) { const c = this.calib; if (ok) { const dt = c.last ? Math.min(100, now - c.last) : 0; c.acc += dt; c.hx += b.hip.x; c.hy += b.hip.y; c.sw += Math.abs(f.pose[11].x - f.pose[12].x); c.to += b.torso; c.n++; } c.last = now;
      c.onProgress(Math.min(1, c.acc / c.need), ok);
      if (c.acc >= c.need) { this.base = { hx: c.hx / c.n, hy: c.hy / c.n, sw: Math.max(40, c.sw / c.n), torso: c.to / c.n }; this.calib = null; this.zone = this.zoneCand = 'center'; this.armsWas = false; this.bent = false; c.res(this.base); }
      return; }
    // ── 인식 끊김 → 일시 정지 / 재개
    if (ok) { if (!this.seen) { this.seen = true; this.foundAt = now; } this.lostSince = 0; if (this.paused && now - this.foundAt > 400) { this.paused = false; this.input.emit('RESUME', { via: 'motion' }); } }
    else { this.seen = false; if (!this.lostSince) this.lostSince = now; if (this.active && !this.paused && now - this.lostSince > this.cfg.lostMs) { this.paused = true; this.input.emit('PAUSE_LOST', { via: 'motion' }); } }
    if (!ok || !this.base || !this.active) { this.onStatus({ kind: ok ? 'ok' : 'lost', text: ok ? 'PLAYER DETECTED' : 'NO PLAYER' }); return; }
    const B = this.base, dx = (b.hip.x - B.hx) / B.sw, drop = (b.hip.y - B.hy) / B.torso;
    // ── 좌우 차선: 영역 + 히스테리시스 + 유지 시간
    let z = this.zone; if (z === 'center') { if (dx < -this.cfg.laneIn) z = 'left'; else if (dx > this.cfg.laneIn) z = 'right'; } else if (Math.abs(dx) < this.cfg.laneOut) z = 'center'; else if (z === 'left' && dx > this.cfg.laneIn) z = 'right'; else if (z === 'right' && dx < -this.cfg.laneIn) z = 'left';
    if (z !== this.zoneCand) { this.zoneCand = z; this.zoneSince = now; } else if (z !== this.zone && now - this.zoneSince >= this.cfg.holdMs) this.zone = z;
    const want = this.zone === 'left' ? 0 : this.zone === 'right' ? 2 : 1, lane = this.getLane();
    let status = 'PLAYER DETECTED';
    if (want !== lane && now - this.lastMove > 160) { this.lastMove = now; this.input.emit(want < lane ? 'MOVE_LEFT' : 'MOVE_RIGHT', { via: 'motion', dx }); }
    if (this.zone === 'left') status = 'MOVE LEFT'; else if (this.zone === 'right') status = 'MOVE RIGHT';
    // ── 점프: 양손 들기(상승 에지)
    if (b.armsUp && !this.armsWas) { this.input.emit('JUMP', { via: 'motion' }); } this.armsWas = b.armsUp; if (b.armsUp) status = 'JUMP';
    // ── 슬라이드: 가볍게 무릎 굽히기(엉덩이가 몸통 길이의 13% 내려감) 또는 엔진 스쿼트
    const bend = this.bent ? (drop > this.cfg.bendOut || b.squat) : (drop > this.cfg.bendIn || b.squat);
    if (bend && (!this.bent || now - this.lastSlide > 350)) { this.lastSlide = now; this.input.emit('SLIDE', { via: 'motion', drop, hold: this.bent }); } this.bent = bend; if (bend) status = 'SLIDE';
    this.onStatus({ kind: 'ok', text: status });
    this.onDebug({ fps: km.fps, dx: +dx.toFixed(2), drop: +drop.toFixed(2), zone: this.zone, armsUp: b.armsUp, squat: b.squat, knee: b.knee });
  }
}
