// K-MOTION MATH BATTLE · GameStateManager / ScoreManager — 선택 방식·3D와 분리된 순수 상태 기계
import { MathQuestionEngine, AnswerValidator } from './math.js';

export class ScoreManager {
  constructor(){ this.reset(); }
  reset(){ this.score = 0; this.combo = 0; this.maxCombo = 0; this.ok = 0; this.ng = 0; this.wrongs = []; }
  correct(fast){ this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.ok++; const bonus = Math.min(50, (this.combo - 1) * 10) + (fast ? 20 : 0); this.score += 100 + bonus; return { combo: this.combo, bonus }; }
  wrong(q, picked){ this.combo = 0; this.ng++; if (this.wrongs.length < 12) this.wrongs.push({ text: q.text.replace('?', String(q.ans)), picked }); }
  get rate(){ const n = this.ok + this.ng; return n ? Math.round(this.ok / n * 100) : 0; }
}

export const ADVENTURE = [{ key: 'slime', hp: 3 }, { key: 'golem', hp: 4 }, { key: 'dragon', hp: 5 }];
export const TIME_CYCLE = [{ key: 'slime', hp: 3 }, { key: 'golem', hp: 3 }, { key: 'dragon', hp: 4 }];

// hooks: question(q) · result({ok, slot, q, fast}) · monsterDown(def) · monsterNext(def, idx) · life(n) · timer(sec) · end(summary) · turn(team, idx) · retry()
export class GameStateManager {
  constructor(hooks){ this.h = hooks; this.state = 'idle'; this.score = new ScoreManager(); }
  start(cfg){ this.cfg = cfg; this.engine = new MathQuestionEngine({ grade: 1, type: cfg.type, diff: cfg.diff }); this.score.reset(); this.life = 3; this.q = null; this.qAt = 0; this.elapsed = 0; this.qElapsed = 0; this.locked = true; this.monIdx = -1; this.monHp = 0; this.monMax = 0; this.answered = 0;
    this.teams = cfg.mode === 'class' ? cfg.teams.map(n => ({ name: n, score: 0, ok: 0, ng: 0 })) : null; this.teamIdx = 0;
    this.roundLen = cfg.mode === 'time' ? 60 : cfg.mode === 'class' ? 30 : 0; this.state = 'play';
    if (cfg.mode === 'class') { this.state = 'turn'; this.h.turn(this.teams[0], 0); } else this.nextMonster(); }
  // 모둠 차례 시작(안내 뒤 호출)
  beginTurn(){ this.state = 'play'; this.elapsed = 0; this.score.reset(); this.monIdx = -1; this.nextMonster(); }
  nextMonster(){ this.monIdx++; const list = this.cfg.mode === 'adventure' ? ADVENTURE : TIME_CYCLE; const def = list[this.monIdx % list.length]; if (this.cfg.mode === 'adventure' && this.monIdx >= ADVENTURE.length) { this.finish(true); return; }
    this.monHp = this.monMax = def.hp; this.h.monsterNext(def, this.monIdx); }
  ask(){ if (this.state !== 'play') return; this.q = this.engine.gen(); this.qElapsed = 0; this.locked = false; this.h.question(this.q, { index: this.answered + 1, total: this.cfg.mode === 'adventure' ? 12 : 0 }); }
  answer(slot){ if (this.locked || this.state !== 'play' || !this.q) return null; this.locked = true; const ok = AnswerValidator.check(this.q, slot); const fast = this.cfg.mode !== 'adventure' && this.qElapsed < 3; this.answered++;
    let r; if (ok) { r = this.score.correct(fast); this.monHp--; } else { this.score.wrong(this.q, this.q.choices.values[slot]); if (this.cfg.mode === 'adventure') { this.life--; this.h.life(this.life); } }
    const out = { ok, slot, q: this.q, fast, combo: this.score.combo, bonus: r ? r.bonus : 0, monDown: ok && this.monHp <= 0, dead: this.life <= 0 }; this.h.result(out); return out; }
  timeoutQuestion(){ if (this.locked || !this.q) return; const wrongSlot = (this.q.choices.correct + 1) % 3; this.answer(wrongSlot); }
  // 공격 연출이 끝난 뒤 호출 → 다음 단계
  proceed(res){ if (this.state !== 'play') return; if (res.dead) { this.state = 'dead'; this.h.retry(); return; } if (res.monDown) { this.h.monsterDown(); return; } this.ask(); }
  afterMonsterDown(){ if (this.state !== 'play') return; this.nextMonster(); }
  retry(){ // 모험: 지금 몬스터부터 다시, 체력 3
    this.life = 3; this.h.life(3); this.score.combo = 0; this.state = 'play'; this.monIdx--; this.nextMonster(); }
  tick(dt){ if (this.state !== 'play') return; this.elapsed += dt; if (!this.locked) this.qElapsed += dt;
    if (this.roundLen) { const left = Math.max(0, this.roundLen - this.elapsed); this.h.timer(left); if (left <= 0) { if (this.cfg.mode === 'class') this.endTurn(); else this.finish(true); } }
    else if (this.cfg.limit && !this.locked) { const left = Math.max(0, this.cfg.limit - this.qElapsed); this.h.timer(left); if (left <= 0) this.timeoutQuestion(); } }
  endTurn(){ const t = this.teams[this.teamIdx]; t.score = this.score.score; t.ok = this.score.ok; t.ng = this.score.ng; this.teamIdx++; this.locked = true;
    if (this.teamIdx >= this.teams.length) { this.finish(true); return; } this.state = 'turn'; this.h.turn(this.teams[this.teamIdx], this.teamIdx); }
  finish(win){ this.state = 'end'; this.locked = true; const s = this.score; this.h.end({ win, mode: this.cfg.mode, score: s.score, ok: s.ok, ng: s.ng, rate: s.rate, maxCombo: s.maxCombo, wrongs: s.wrongs, teams: this.teams ? [...this.teams].sort((a, b) => b.score - a.score) : null }); }
}
