// K-MOTION POSE HERO · PoseNormalizer / PoseEvaluator / CalibrationManager
// 입력: kmotion.js 엔진의 f.pose(33 관절, 거울 캔버스 픽셀 {x,y,z,v}). 절대 좌표가 아니라 어깨폭 단위·관절 각도로 정규화한다.
import { POSES, PASS } from './poses.js';
const DEG = 180 / Math.PI;
const vis = (p, i, th = .5) => p && p[i] && p[i].v >= th;
const ang3 = (a, b, c) => { const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y; const d = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1; return Math.acos(Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / d))) * DEG; };
export const wrap = d => { d = Math.abs(d) % 360; return d > 180 ? 360 - d : d; };

export class PoseNormalizer {
  constructor(){ this.base = null; }
  // base = 보정값 {sw, shY, cx}
  read(p){
    if (!p || !vis(p, 11) || !vis(p, 12)) return null;
    const L = p[11], R = p[12], sh = { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2 };
    let sw = Math.abs(L.x - R.x); const B = this.base; if (B) sw = Math.max(sw, B.sw * .7); sw = Math.max(sw, 24);
    const hipOk = vis(p, 23, .45) && vis(p, 24, .45); const hip = hipOk ? { x: (p[23].x + p[24].x) / 2, y: (p[23].y + p[24].y) / 2 } : null;
    const f = { ok: true, sw, sh, hip, vis: {} };
    // 기울기: 엉덩이→어깨, 없으면 어깨중심→코(머리) 로 추정
    if (hip) f.lean = Math.atan2(sh.x - hip.x, hip.y - sh.y) * DEG; else if (vis(p, 0)) f.lean = Math.atan2(p[0].x - sh.x, sh.y - p[0].y) * DEG * .9; else f.lean = 0;
    // 팔: 학생 왼팔 = 11/13/15(거울 화면 왼쪽), 오른팔 = 12/14/16. 바깥쪽 = 왼팔 −x, 오른팔 +x
    for (const [side, s, e, w, out] of [['L', 11, 13, 15, -1], ['R', 12, 14, 16, 1]]) {
      const S = p[s], E = p[e], W = p[w]; f.vis['wr' + side] = vis(p, w, .4) && vis(p, e, .4);
      if (vis(p, e, .4)) { f['arm' + side] = Math.atan2((E.x - S.x) * out, E.y - S.y) * DEG; } // 0 아래, ±180 위
      if (f.vis['wr' + side]) { f['elb' + side] = ang3(S, E, W); f['wx' + side] = (W.x - sh.x) * out / sw; f['wy' + side] = (sh.y - W.y) / sw; }
    }
    if (f.vis.wrL && f.vis.wrR) f.wd = Math.hypot(p[15].x - p[16].x, p[15].y - p[16].y) / sw;
    f.drop = B ? (sh.y - B.shY) / B.sw : 0;
    if (vis(p, 25, .4) && vis(p, 27, .4) && hipOk) f.knee = Math.min(ang3(p[23], p[25], p[27]), vis(p, 26, .4) && vis(p, 28, .4) ? ang3(p[24], p[26], p[28]) : 999);
    if (f.knee === 999) f.knee = undefined;
    return f;
  }
}

// 유사도 = 1 − Σ w·clamp((|오차| − tol) / range) / Σ w  (관절별 가중 오차의 정규화 점수)
export function similarity(pose, f){
  if (!f) return { sim: 0, detail: {}, missing: ['body'] };
  const missing = pose.need.filter(k => !f.vis[k]); if (missing.length) return { sim: 0, detail: {}, missing };
  let sw = 0, se = 0; const detail = {};
  for (const [k, c] of Object.entries(pose.feats)) {
    const v = f[k]; if (v === undefined || v === null) { if (c.optional) continue; se += c.w; sw += c.w; detail[k] = 1; continue; }
    const isAng = k.startsWith('arm') || k.startsWith('elb') || k === 'lean' || k === 'knee';
    const d = isAng && k.startsWith('arm') ? wrap(v - c.t) : Math.abs(v - c.t);
    const e = Math.max(0, Math.min(1, (d - c.tol) / c.range)); detail[k] = e; se += c.w * e; sw += c.w; }
  return { sim: sw ? 1 - se / sw : 0, detail, missing: [] };
}

// 유지 시간 판정: 프레임 간 노이즈를 EMA로 줄이고, 기준 이상 유지한 시간을 누적(잠깐 떨어지면 천천히 깎임)
export class PoseEvaluator {
  constructor(){ this.norm = new PoseNormalizer(); this.target = null; this.sim = 0; this.hold = 0; this.holdMs = 500; this.acc = 0; this.accN = 0; this.feat = null; this.missing = []; this.lastT = 0; this.locked = false; this.alpha = .4; this.scale = 1; }
  setTarget(pose, holdMs){ this.target = pose; this.holdMs = holdMs || (pose ? pose.hold : 500); this.reset(); }
  reset(){ this.sim = 0; this.hold = 0; this.acc = 0; this.accN = 0; this.locked = false; }
  // 매 프레임. 반환: null 또는 성공 {sim(유지 중 평균), peak}
  update(pose33, t){
    const dt = this.lastT ? Math.min(100, t - this.lastT) : 0; this.lastT = t;
    this.feat = this.norm.read(pose33); if (!this.target || this.locked) return null;
    const r = similarity(this.target, this.feat); this.missing = r.missing; this.detail = r.detail;
    if (r.missing.length) { this.sim *= .97; return null; } // 안 보이면 진행 멈춤
    this.sim += (r.sim - this.sim) * this.alpha;
    const pass = PASS * this.scale;
    if (this.sim >= pass) { this.hold += dt; this.acc += this.sim; this.accN++; } else { this.hold = Math.max(0, this.hold - dt * 2); }
    if (this.hold >= this.holdMs) { this.locked = true; return { sim: this.accN ? this.acc / this.accN : this.sim, peak: this.sim }; }
    return null;
  }
  get progress(){ return Math.min(1, this.hold / this.holdMs); }
  // 전체 포즈 중 지금 가장 비슷한 것(메모리 모드의 「다른 포즈」 감지용)
  bestOf(ids){ let best = null; for (const id of ids) { const p = POSES.find(x => x.id === id); const r = similarity(p, this.feat); if (!best || r.sim > best.sim) best = { id, sim: r.sim }; } return best; }
}

// 3초 보정: 몸이 보이는 프레임만 센다. 결과 = 어깨 중심·어깨 폭·어깨 높이. 몸이 화면에서 잘리면 안내만 하고 완료하지 않는다.
export class CalibrationManager {
  constructor(norm){ this.norm = norm; this.c = null; }
  start(ms, onProgress){ this.norm.base = null; return new Promise(res => { this.c = { need: ms, acc: 0, last: 0, sx: 0, sy: 0, sw: 0, n: 0, onProgress, res }; }); }
  cancel(){ this.c = null; }
  // 반환 상태 문구
  feed(p, f, t, W, H){ const c = this.c; if (!c) return null; let msg = '카메라를 바라보세요', ok = false;
    if (!f) msg = '몸이 화면에 들어오도록 서세요';
    else { const margin = .04 * W, cut = (f.sh.x < W * .25 || f.sh.x > W * .75) ? '가운데로 와 주세요' : (p[0] && p[0].v > .5 && p[0].y < margin) ? '조금 뒤로 물러나요' : (!f.vis.wrL || !f.vis.wrR) ? '양팔이 보이게 편하게 내려주세요' : null;
      if (cut) msg = cut; else { ok = true; msg = '좋아요! 그대로 있어요'; } }
    const dt = c.last ? Math.min(100, t - c.last) : 0; c.last = t;
    if (ok) { c.acc += dt; c.sx += f.sh.x; c.sy += f.sh.y; c.sw += Math.abs(p[11].x - p[12].x); c.n++; } else c.acc = Math.max(0, c.acc - dt * .5);
    c.onProgress(Math.min(1, c.acc / c.need), ok, msg);
    if (c.acc >= c.need) { this.norm.base = { cx: c.sx / c.n, shY: c.sy / c.n, sw: c.sw / c.n }; const r = c.res; this.c = null; r(this.norm.base); return '준비가 완료되었습니다'; }
    return msg; }
}
