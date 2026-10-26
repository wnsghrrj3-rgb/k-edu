// K-MOTION POSE HERO · GameStateManager / ModeManager / ScoreManager / ComboManager
// 모든 모드는 같은 PoseEvaluator 를 쓴다. 게임은 hooks(ui·audio·3d)만 호출하고 DOM 을 모른다.
import { POSES, POSE_BY_ID, gradeOf, PASS } from './poses.js';
import { PoseEvaluator } from './evaluator.js';
export const MODES = {
  speed:  { title: 'SPEED POSE', ko: '스피드 포즈', desc: '60초 동안 포즈를 빠르게! 빠를수록 점수 UP', icon: '⚡', color: '#ffd23f' },
  mirror: { title: 'MIRROR BATTLE', ko: '미러 배틀', desc: '캐릭터를 거울처럼 따라 해요. 단계마다 더 정확하게!', icon: '🪞', color: '#4de1ff' },
  memory: { title: 'MEMORY POSE', ko: '메모리 포즈', desc: '포즈 순서를 기억했다가 그대로 재현해요', icon: '🧠', color: '#b388ff' },
  rhythm: { title: 'RHYTHM POSE', ko: '리듬 포즈', desc: '음악 박자에 맞춰 딱! 타이밍이 점수', icon: '🎵', color: '#7cff6b' },
  boss:   { title: 'BOSS CHALLENGE', ko: '보스 챌린지', desc: '포즈를 성공할 때마다 보스를 공격! 콤보로 큰 한 방', icon: '👹', color: '#ff4d6d' },
};
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
// 같은 포즈 연속 금지 + 난이도 섞기
function nextPose(prev, diff){ const pool = POSES.filter(p => p.id !== prev && (diff === 'easy' ? p.difficulty <= 2 : true)); return pool[Math.random() * pool.length | 0]; }

export class ScoreManager { constructor(){ this.reset(); } reset(){ this.score = 0; this.combo = 0; this.maxCombo = 0; this.hits = 0; this.tries = 0; this.simSum = 0; this.grades = { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 }; }
  hit(sim, extra = 0){ const g = gradeOf(sim); this.hits++; this.tries++; this.simSum += sim; this.grades[g.id]++; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); const bonus = Math.min(50, (this.combo - 1) * 10); const pts = g.pts + bonus + extra; this.score += pts; return { grade: g, pts, bonus, combo: this.combo }; }
  miss(){ this.tries++; this.grades.MISS++; this.combo = 0; }
  get avg(){ return this.hits ? this.simSum / this.hits : 0; }
  rank(){ const a = this.avg, h = this.tries ? this.hits / this.tries : 0; const s = a * .6 + h * .4; return s >= .9 ? 'S' : s >= .8 ? 'A' : s >= .68 ? 'B' : s >= .5 ? 'C' : 'D'; }
}

export class Game {
  constructor(hooks){ this.h = hooks; this.ev = new PoseEvaluator(); this.score = new ScoreManager(); this.state = 'idle'; this.mode = null; this.diff = 'normal'; this.pauseReason = ''; this.test = false; }
  get norm(){ return this.ev.norm; }
  // ───── 시작·종료
  start(mode, diff){ this.mode = mode; this.diff = diff; this.score.reset(); this.state = 'play'; this.elapsed = 0; this.cur = null; this.poseStart = 0; this.poseN = 0; this.timeLeft = 0; this.samples = [];
    this.timeout = diff === 'easy' ? 12000 : diff === 'hard' ? 6000 : 8000; this.ev.scale = diff === 'hard' ? 1.08 : 1; this.ev.alpha = diff === 'easy' ? .45 : .4;
    const m = this['init_' + mode]; m && m.call(this); }
  end(win){ if (this.state === 'end') return; this.state = 'end'; this.ev.setTarget(null); const s = this.score; this.h.end({ mode: this.mode, diff: this.diff, win, score: s.score, hits: s.hits, tries: s.tries, maxCombo: s.maxCombo, avg: s.avg, rank: s.rank(), grades: s.grades, time: this.elapsed, extra: this.resultExtra ? this.resultExtra() : null }); }
  pause(reason){ if (this.state !== 'play') return; this.state = 'pause'; this.pauseReason = reason; this.pausedAt = performance.now(); if (this.mode === 'rhythm') { this.rhythmPending = null; this.ev.setTarget(null); this.audioT0 = null; } this.h.pause(reason); }
  resume(){ if (this.state !== 'pause') return; this.state = 'play'; const d = performance.now() - this.pausedAt; this.poseStart += d; if (this.memShowUntil) this.memShowUntil += d; this.h.resume(); }
  // ───── 포즈 제시(공통)
  present(pose, { hold, silent } = {}){ this.cur = pose; this.poseN++; this.poseStart = performance.now(); this.ev.setTarget(pose, hold || pose.hold * (this.diff === 'hard' ? 1.3 : this.diff === 'easy' ? .9 : 1)); if (!silent) this.h.pose(pose, this.poseN); }
  // ───── 매 프레임: pose33 = 엔진 관절(없으면 null), t = ms
  update(pose33, t, dt){ if (this.state !== 'play') return; this.elapsed += dt;
    const res = this.ev.update(pose33, t); const sim = this.ev.sim, prog = this.ev.progress;
    this.h.meter(sim, prog, this.ev.missing, this.ev.detail);
    const u = this['tick_' + this.mode]; u && u.call(this, res, dt, t); }
  // 개발자 테스트 모드: 강제 성공/실패/다음
  forceSuccess(){ if (this.state !== 'play' || !this.cur) return; if (this.mode === 'rhythm') { const P = this.rhythmPending; if (P && !P.judged) { P.best = .95; P.cross = 0; P.at = 0; P.due = -1e9; P.forced = true; } return; } this.ev.locked = true; const u = this['tick_' + this.mode]; u && u.call(this, { sim: .95, peak: .95, forced: true }, 0, performance.now()); }
  forceFail(){ if (this.state !== 'play' || !this.cur) return; this.poseStart = -1e9; if (this.rhythmPending) this.rhythmPending.due = -1e9; }
  skip(){ if (this.state !== 'play' || !this.cur) return; this.forceFail(); }
  // 공통 성공 처리 → {grade, pts}
  succeed(res, extra = 0){ const r = this.score.hit(res.sim, extra); const took = performance.now() - this.poseStart; this.h.success(r, took, this.cur, res.forced); return r; }
  failPose(reason = 'timeout'){ this.score.miss(); this.h.fail(reason, this.cur); }

  // ═════ MODE 1 SPEED
  init_speed(){ this.timeLeft = 60000; this.present(nextPose(null, this.diff)); }
  tick_speed(res, dt){ this.timeLeft -= dt; this.h.time(this.timeLeft); if (this.timeLeft <= 0) return this.end(true);
    if (res) { const took = performance.now() - this.poseStart; const speed = Math.round(Math.max(0, 1 - took / 4000) * 60); this.succeed(res, speed); this.present(nextPose(this.cur.id, this.diff)); }
    else if (performance.now() - this.poseStart > this.timeout) { this.failPose('timeout'); this.present(nextPose(this.cur.id, this.diff)); } }

  // ═════ MODE 4 MIRROR (단계별: 유지 시간 ↑, 기준 ↑)
  init_mirror(){ this.level = 1; this.perLevel = 4; this.total = 16; this.retry = 0; this.h.level(this.level); this.mirrorNext(); }
  mirrorNext(){ if (this.poseN >= this.total) return this.end(true); const lv = this.level; this.ev.scale = (this.diff === 'hard' ? 1.08 : 1) * (1 + (lv - 1) * .035); this.present(nextPose(this.cur && this.cur.id, this.diff), { hold: 450 + lv * 120 }); if ((this.poseN - 1) % this.perLevel === 0 && this.poseN > 1) { this.level = lv + 1; this.h.level(this.level); } }
  tick_mirror(res){ if (res) { this.retry = 0; this.succeed(res, this.level * 10); this.mirrorNext(); }
    else if (performance.now() - this.poseStart > this.timeout + 2000) { this.failPose('timeout'); if (++this.retry >= 2) { this.retry = 0; this.mirrorNext(); } else { this.poseStart = performance.now(); this.ev.reset(); this.h.retry(this.cur); } } }

  // ═════ MODE 2 MEMORY (보여주기 → 가려진 채 순서대로 수행)
  init_memory(){ this.round = 0; this.fails = 0; this.memStart(); }
  memStart(){ this.round++; if (this.round > 4) return this.end(true); const n = this.round + 1; let prev = null; this.seq = []; for (let i = 0; i < n; i++) { const p = nextPose(prev, this.diff); this.seq.push(p); prev = p.id; } this.seqI = 0; this.phase = 'show'; this.showI = -1; this.memShowUntil = 0; this.ev.setTarget(null); this.h.memRound(this.round, this.seq.length); }
  tick_memory(res, dt, t){ const now = performance.now();
    if (this.phase === 'show') { if (now >= this.memShowUntil) { this.showI++; if (this.showI >= this.seq.length) { this.phase = 'do'; this.h.memDo(this.seq.length); this.present(this.seq[0], { silent: true }); this.h.memSlot(0); return; } this.memShowUntil = now + 1500; this.h.memShow(this.seq[this.showI], this.showI, this.seq.length); } return; }
    if (this.phase !== 'do') return;
    if (res) { this.succeed(res, 20 * this.seq.length); this.seqI++; this.h.memSlot(this.seqI); if (this.seqI >= this.seq.length) { this.h.memClear(this.round); this.phase = 'wait'; setTimeout(() => { if (this.state === 'play' || this.state === 'pause') this.memStart(); }, 1600); } else this.present(this.seq[this.seqI], { silent: true }); return; }
    // 다른 포즈를 하면 틀림(목표가 통과 중이 아닐 때만), 시간 초과도 틀림
    const others = this.seq.filter(p => p.id !== this.cur.id).map(p => p.id); if (others.length && this.ev.sim < PASS * .9 && !this.ev.missing.length) { const b = this.ev.bestOf(others); if (b && b.sim >= .86) { this.wrongN = (this.wrongN || 0) + dt; if (this.wrongN > 450) { this.wrongN = 0; return this.memWrong('wrong', b.id); } } else this.wrongN = 0; }
    if (now - this.poseStart > this.timeout + 4000) this.memWrong('timeout'); }
  memWrong(reason, did){ this.failPose(reason); this.phase = 'wait'; this.fails++; this.h.memWrong(reason, this.seqI, did); if (this.fails >= 4) return setTimeout(() => this.end(false), 1200);
    setTimeout(() => { if (this.state !== 'play' && this.state !== 'pause') return; this.seqI = 0; this.phase = 'show'; this.showI = -1; this.memShowUntil = performance.now() + 300; this.ev.setTarget(null); this.h.memRound(this.round, this.seq.length, true); }, 1400); }
  resultExtra(){ return this.mode === 'memory' ? { round: this.round } : this.mode === 'boss' ? { bossHp: this.bossHp, life: this.life } : this.mode === 'rhythm' ? { timing: this.timing } : null; }

  // ═════ MODE 3 RHYTHM — 오디오 시각 기준. 포즈 마디 4박: 1박에 등장, 4박 머리(due)에 판정(±창 안 최대 유사도)
  init_rhythm(){ this.bpm = this.diff === 'easy' ? 88 : this.diff === 'hard' ? 112 : 100; this.beat = 60 / this.bpm; this.total = 16; this.bar = -1; this.window = this.diff === 'easy' ? .42 : .34; this.timing = []; this.ev.setTarget(null); this.rhythmPending = null; this.h.rhythmStart(this.bpm); this.audioT0 = null; }
  onBeat(i, tAudio){ if (this.state !== 'play') return; this.h.beat(i); if (this.audioT0 === null) this.audioT0 = tAudio - i * this.beat; const q = i & 3, bar = (i >> 2) - 1; // 첫 마디는 카운트인
    if (q === 0) { if (bar >= 0 && this.poseN < this.total) { const p = nextPose(this.cur && this.cur.id, this.diff); this.present(p, { hold: 999999, silent: true }); this.rhythmPending = { pose: p, due: tAudio + 3 * this.beat, best: 0, judged: false, cross: null }; this.h.rhythmPose(p, this.poseN, this.total); }
      else if (bar === -1) this.h.rhythmCount(); } }
  tick_rhythm(res, dt, t){ const P = this.rhythmPending; if (!P || P.judged) return;
    const now = this.h.audioNow(); const d = now - P.due; this.h.rhythmRing(Math.max(0, Math.min(1, 1 + d / (3 * this.beat))));
    if (Math.abs(d) <= this.window) { if (this.ev.sim > P.best) { P.best = this.ev.sim; P.at = d; } if (P.cross === null && this.ev.sim >= PASS) P.cross = d; }
    if (d > this.window || (P.cross !== null && d > this.window * .5)) { P.judged = true; const sim = P.best; this.timing.push(P.cross ?? P.at ?? 0); this.ev.locked = true;
      if (sim >= PASS) { const timingBonus = Math.round((1 - Math.min(1, Math.abs(P.cross ?? P.at ?? 0) / this.window)) * 40); this.succeed({ sim, peak: sim, forced: P.forced }, timingBonus); } else this.failPose('miss');
      if (this.poseN >= this.total) setTimeout(() => this.end(true), this.beat * 1000 * 2); } }

  // ═════ MODE 5 BOSS
  init_boss(){ this.bossHp = 100; this.life = 3; this.poses = this.diff === 'easy' ? 10 : 12; this.dmgBase = this.diff === 'easy' ? [13, 11, 9] : [11, 9, 7]; this.h.bossIntro(); this.phase = 'intro'; setTimeout(() => { if (this.state === 'play' || this.state === 'pause') { this.phase = 'fight'; this.present(nextPose(null, this.diff)); } }, 2000); }
  tick_boss(res){ if (this.phase !== 'fight') return;
    if (res) { const r = this.succeed(res); const big = r.combo > 0 && r.combo % 3 === 0; const dmg = Math.round(this.dmgBase[r.grade.id === 'PERFECT' ? 0 : r.grade.id === 'GREAT' ? 1 : 2] * (big ? 1.8 : 1)); this.phase = 'anim';
      this.h.bossAttack(big, dmg, () => { this.bossHp = Math.max(0, this.bossHp - dmg); this.h.bossHp(this.bossHp, dmg); if (this.bossHp <= 0) { this.phase = 'end'; this.h.bossWin(); setTimeout(() => this.end(true), 2200); } else if (this.poseN >= this.poses) { this.phase = 'end'; this.h.bossEscape(); setTimeout(() => this.end(false), 1500); } else { this.phase = 'fight'; this.present(nextPose(this.cur.id, this.diff)); } }); }
    else if (performance.now() - this.poseStart > this.timeout) { this.failPose('timeout'); this.phase = 'anim'; this.h.bossStrike(() => { this.life--; this.h.life(this.life); if (this.life <= 0) { this.phase = 'end'; this.h.bossLose(); setTimeout(() => this.end(false), 1500); } else { this.phase = 'fight'; this.present(nextPose(this.cur.id, this.diff)); } }); } }
}
