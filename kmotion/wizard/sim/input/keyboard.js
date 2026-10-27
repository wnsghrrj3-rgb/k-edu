// 키보드 대체(02 9절) — 같은 이벤트. DOM 을 모른다: boot.js 가 key(code, down, t)·tick(t) 를 불러 준다
import { ChargeFSM } from './charge.js';
export class KeyInput {
  constructor(){ this.out = []; this.down = new Set(); this.u = 0; this.charge = new ChargeFSM(e => this.out.push(Object.assign(e, { via: 'key' }))); this.lastT = 0; this.lastMove = null; }
  drain(){ return this.out.splice(0, this.out.length); }
  e(type, t, value = {}){ this.out.push({ type, t, via: 'key', value, conf: 1 }); }
  key(code, isDown, t){
    const was = this.down.has(code); if (isDown) this.down.add(code); else this.down.delete(code);
    if (isDown && was) return;   // 자동 반복 무시
    const shift = this.down.has('ShiftLeft') || this.down.has('ShiftRight');
    const L = code === 'ArrowLeft' || code === 'KeyA', R = code === 'ArrowRight' || code === 'KeyD';
    if (isDown && shift && (L || R)) this.e('DODGE', t, { dir: L ? -1 : 1 });
    if (code === 'ArrowDown' || code === 'KeyS') this.e('DUCK', t, { on: isDown });
    if (isDown && (code === 'Space' || code === 'KeyJ')) this.e('ATTACK', t, { side: this.u < 0 ? 'L' : 'R', zone: 1, power: 1 });
    if (code === 'KeyK') { if (isDown) this.charge.start(t, 'key'); else this.charge.update(t, false, true, 'auto'); }
    if (code === 'KeyL') this.e('BLOCK', t, { on: isDown });
    if (isDown && /^Digit[1-4]$/.test(code)) this.e('SELECT', t, { slot: +code.slice(5) - 1 });
    if (isDown && (code === 'Escape' || code === 'KeyP')) this.e('PAUSE', t);
    if (isDown && code === 'KeyH') this.e('HINT', t);   // 🦉 힌트(문제 중)
  }
  // 누르고 있는 동안 위치 목표가 움직임(연속) — 1.6/초
  tick(t){ const dt = this.lastT ? Math.min(.1, (t - this.lastT) / 1000) : 0; this.lastT = t;
    const l = this.down.has('ArrowLeft') || this.down.has('KeyA'), r = this.down.has('ArrowRight') || this.down.has('KeyD');
    if (l !== r) this.u = Math.max(-1, Math.min(1, this.u + (r ? 1 : -1) * 1.6 * dt));
    if (this.lastMove !== this.u) { this.lastMove = this.u; this.e('MOVE', t, { u: Math.round(this.u * 1000) / 1000 }); }
    if (this.charge.active) this.charge.update(t, this.down.has('KeyK'), false, 'auto');
  }
  reset(){ this.down.clear(); }
}
