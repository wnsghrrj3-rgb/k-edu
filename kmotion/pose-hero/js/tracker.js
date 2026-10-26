// K-MOTION POSE HERO · CameraManager + PoseTracker (../kmotion.js 엔진 0.5.x pose 모드 재사용, MediaPipe Pose Landmarker lite)
// 카메라 영상은 브라우저 안에서만 처리하고 저장하지 않는다. 렌더링(Three.js)과 포즈 추론은 서로 다른 루프(엔진 rAF vs 게임 rAF)로 분리.
export class PoseTracker {
  constructor({ video, canvas, onFrame, onStatus }){
    this.km = KMotion.create({ video, canvas, modes: ['pose'], activity: 'pose-hero' });
    this.onFrame = onFrame; this.onStatus = onStatus || (() => {}); this.started = false; this.seen = false; this.lostSince = 0; this.lostMs = 900; this.paused = false; this.colors = null;
    this.km.onFrame = f => this.frame(f);
    this.km.on('error', e => this.onStatus({ kind: 'error', text: e.message }));
  }
  async start(){ if (this.started) return; await this.km.start(); this.started = true; }
  stop(){ if (!this.started) return; this.km.stop(); this.started = false; }
  get fps(){ return this.km.fps; }
  // 관절 가이드: 팔은 판정 오차에 따라 색(초록=맞음, 노랑=근접, 빨강=멀다)
  frame(f){
    const km = this.km, ctx = f.ctx, p = f.pose, now = f.t;
    km.drawCamera();
    if (p) { const c = this.colors || {}; const col = k => c[k] === undefined ? 'rgba(77,225,255,.9)' : c[k] < .2 ? 'rgba(93,235,122,.95)' : c[k] < .6 ? 'rgba(255,214,70,.95)' : 'rgba(255,90,95,.95)';
      km.drawSkeleton(p, [[11, 12], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]], col('body'), 5);
      km.drawSkeleton(p, [[11, 13], [13, 15]], col('L'), 5); km.drawSkeleton(p, [[12, 14], [14, 16]], col('R'), 5);
      if (p[0] && p[0].v > .5) { ctx.beginPath(); ctx.arc(p[0].x, p[0].y - 10, 16, 0, Math.PI * 2); ctx.strokeStyle = col('body'); ctx.lineWidth = 4; ctx.stroke(); } }
    const ok = !!p && p[11].v > .5 && p[12].v > .5;
    if (ok) { this.seen = true; this.lostSince = 0; if (this.paused) { this.paused = false; this.onStatus({ kind: 'found', text: 'PLAYER DETECTED' }); } }
    else { this.seen = false; if (!this.lostSince) this.lostSince = now; if (!this.paused && now - this.lostSince > this.lostMs) { this.paused = true; this.onStatus({ kind: 'lost', text: 'NO PLAYER' }); } }
    km.drawMouseHelp && km.drawMouseHelp();
    this.onFrame(f, ok);
  }
}
