// 마법 충전 상태기계(02 4-5) — 몸(I5)·키보드(K)·터치가 같이 쓴다
// IDLE ─모으기→ CHARGING ─시전 시간→ CHARGED ─내림→ CAST / 일찍 풀면 FIZZLE / CHARGED 3초 → 자동 CAST
import { INPUT } from './config.js';
export class ChargeFSM {
  constructor(push){ this.push = push; this.state = 'idle'; this.t0 = 0; this.chargeTime = 0.5; this.canCharge = () => true; this.offT = 0; this.lastP = -1; }
  start(t, via){ if (this.state !== 'idle') return; if (!this.canCharge()) { this.push({ type: 'NEED_MANA', t, via, value: {}, conf: 1 }); this.state = 'denied'; return; }
    this.state = 'charging'; this.t0 = t; this.via = via; this.offT = 0; this.lastP = -1; this.push({ type: 'CHARGE', t, via, value: { p: 0, start: true }, conf: 1 }); }
  // gathered: 지금 모으고 있나 · dropped: 손이 어깨 아래로 내려왔나 · aim: 'L'|'C'|'R'|'auto'
  update(t, gathered, dropped, aim = 'auto'){
    if (this.state === 'denied') { if (!gathered) this.state = 'idle'; return; }
    if (this.state === 'idle') return;
    const p = Math.min(1, (t - this.t0) / 1000 / this.chargeTime);
    if (this.state === 'charging') {
      if (!gathered) { if (!this.offT) this.offT = t; if (t - this.offT > INPUT.gather.grace || dropped) return this.end(t, 'FIZZLE'); }
      else this.offT = 0;
      if (p >= 1) { this.state = 'charged'; this.chargedT = t; }
      if (Math.abs(p - this.lastP) >= 0.05 || p >= 1) { this.lastP = p; this.push({ type: 'CHARGE', t, via: this.via, value: { p }, conf: 1 }); }
      return;
    }
    if (this.state === 'charged') {
      if (dropped) return this.end(t, 'CAST', aim);
      if (t - this.chargedT > INPUT.gather.autoCast) return this.end(t, 'CAST', 'auto');
    }
  }
  end(t, type, aim){ this.push({ type, t, via: this.via, value: type === 'CAST' ? { aim } : {}, conf: 1 }); this.state = 'idle'; }
  cancel(t){ if (this.state === 'charging' || this.state === 'charged') this.end(t, 'FIZZLE'); this.state = 'idle'; }
  get active(){ return this.state === 'charging' || this.state === 'charged'; }
}
