/* 그림자 괴물 · 「마을을 지켜라」 놀이 규칙(시스템 층). 그리기는 render.js, 소리는 audio.js
 * 내 그림자 = 괴물. 도둑이 등불을 훔치러 살금살금 오면, 그림자를 도둑 위로 크게 드리워 쫓아낸다.
 * 너무 커지면(마을 공포 한계) 마을 사람들이 숨고 도둑도 겁을 안 먹는다 — 거리 조절이 곧 놀이.
 * me = { present, size(0~1, 벽 높이 대비 그림자 키), x0, x1(벽 px 좌우), top, hx, hw }
 */
import * as A from './audio.js?v=2';
import { drawVillage, drawThief, drawThreatMeter, drawLampRail, banner } from './render.js?v=2';
import { drawFigure } from './silhouette.js?v=2';

export const FEAR_LIMIT = .9;         // 이보다 크면 마을이 무서워함
export const ROUND = 90;              // 초

export class Village {
  constructor(W, H){ this.W = W; this.H = H; this.reset(); }
  reset(){
    this.houses = [.25, .375, .5, .625, .75].map(x => ({ x, w: .085, lit: true, shake: 0 }));
    this.folk = [.3125, .4375, .5625, .6875].map(x => ({ x, hide: 0 }));
    this.fear = 0; this.panic = false; this.thieves = []; this.t = 0; this.next = 2.5; this.score = 0; this.combo = 0; this.scared = 0; this.stolen = 0;
    this.lamp = { x: .5, y: .5 }; this.lampTo = { x: .5, y: .5 }; this.lampT = 0; this.wave = 1; this.msg = ''; this.msgT = 0; this.over = false; this.boss = null; this.bossHold = 0; this.events = [];
  }
  get lanterns(){ return this.houses.filter(h => h.lit).length; }
  say(m, sec = 2.4){ this.msg = m; this.msgT = sec; }
  spawn(boss = false){
    const dir = Math.random() < .5 ? 1 : -1; const H = this.H, W = this.W;
    const need = boss ? .82 : (.45 + Math.random() * .3) * (this.wave === 3 ? 1.1 : 1);
    const th = { x: dir < 0 ? W * .06 : W * .94, y: H * .86, h: H * (boss ? .3 : .12 + Math.random() * .04), dir: dir < 0 ? 1 : -1, flee: 0, state: 'sneak', need: Math.min(.86, need),
      speed: (this.wave === 1 ? .035 : this.wave === 2 ? .05 : .065) * W * (boss ? .55 : 1), target: null, boss, hold: 0, carry: false, pause: 0 };
    const lit = this.houses.filter(h => h.lit); th.target = lit.length ? lit[Math.floor(Math.random() * lit.length)] : null;   // 아무 등불이나 노린다 — 옆으로 따라가야 함
    this.thieves.push(th); if (boss) this.boss = th;
  }
  update(dt, t, me){
    if (this.over) return; this.t += dt; const W = this.W, H = this.H;
    // 전등 이동(웨이브)
    const w = this.t < 30 ? 1 : this.t < 60 ? 2 : 3;
    if (w !== this.wave) { this.wave = w; A.bell(2);
      if (w === 2) { this.say('전등이 옆으로 옮겨가요! 그림자가 어디로 늘어나는지 봐요', 3.5); }
      if (w === 3) { this.say('전등이 바닥으로! 그림자가 길어져요 — 도둑이 빨라져요', 3.5); this.moveLamp(.5, .86); } }
    if (this.wave === 2 && Math.floor(this.t / 12) !== Math.floor((this.t - dt) / 12)) this.moveLamp(this.lampTo.x < .5 ? .72 : .28, .5);
    if (this.lampT > 0) { this.lampT = Math.max(0, this.lampT - dt / 1.2); const k = 1 - this.lampT, e = k * k * (3 - 2 * k); this.lamp.x = this.lampFrom.x + (this.lampTo.x - this.lampFrom.x) * e; this.lamp.y = this.lampFrom.y + (this.lampTo.y - this.lampFrom.y) * e; }
    // 마을 공포
    const tooBig = me.present && me.size > FEAR_LIMIT;
    this.fear = Math.max(0, Math.min(1, this.fear + (tooBig ? dt * .9 : -dt * .6)));
    if (!this.panic && this.fear >= 1) { this.panic = true; A.scream(); this.say('너무 커요! 마을 사람들이 숨었어요 — 조금 물러나요', 2.5); }
    if (this.panic && this.fear < .25) { this.panic = false; this.say('휴, 마을 사람들이 돌아왔어요', 1.8); }
    for (const f of this.folk) f.hide = Math.max(0, Math.min(1, f.hide + (this.panic ? dt * 3 : -dt * 1.5)));
    // 도둑 등장
    if (this.t >= this.next && this.lanterns > 0) { const alive = this.thieves.filter(x => x.state === 'sneak').length; const max = this.wave === 1 ? 1 : 2;
      if (alive < max) { if (this.wave === 3 && this.t > 78 && !this.boss) { this.spawn(true); this.say('도둑왕이 왔어요! 아주 크게, 2초 동안 덮쳐요', 3); } else this.spawn(); }
      this.next = this.t + (this.wave === 1 ? 4.5 : this.wave === 2 ? 3.2 : 2.6) + Math.random(); }
    // 도둑 움직임·판정
    for (const th of this.thieves) {
      if (th.state === 'sneak') {
        if (th.pause > 0) th.pause -= dt; else { const tx = th.target ? th.target.x * W : (th.dir > 0 ? W : 0); const dx = tx - th.x; th.x += Math.sign(dx) * Math.min(Math.abs(dx), th.speed * dt); th.dir = dx > 0 ? -1 : 1;
          if (Math.random() < dt * .25) th.pause = .4 + Math.random() * .5; }
        const over = me.present && me.x0 - 20 <= th.x && th.x <= me.x1 + 20; const big = me.size >= th.need && !this.panic;
        if (over && big) { th.hold += dt; if (th.hold >= (th.boss ? 2 : .35)) this.scare(th); }
        else th.hold = Math.max(0, th.hold - dt);
        if (th.target && Math.abs(th.x - th.target.x * W) < 4 && th.target.lit) this.steal(th);
      } else if (th.state === 'flee') { th.flee = Math.min(1, th.flee + dt / .9); th.x += th.dir * th.speed * 3 * dt; if (th.x < -60 || th.x > W + 60) th.state = 'gone'; }
      else if (th.state === 'carry') { th.x += (th.x < W / 2 ? -1 : 1) * th.speed * 1.6 * dt; if (th.x < -60 || th.x > W + 60) th.state = 'gone'; }
    }
    this.thieves = this.thieves.filter(th => th.state !== 'gone');
    for (const h of this.houses) if (h.shake > 0) h.shake -= dt;
    if (this.msgT > 0) { this.msgT -= dt; if (this.msgT <= 0) this.msg = ''; }
    if (this.t >= ROUND || this.lanterns === 0) { this.over = true; this.win = this.lanterns > 0; }
  }
  moveLamp(x, y){ this.lampFrom = { x: this.lamp.x, y: this.lamp.y }; this.lampTo = { x, y }; this.lampT = 1; A.lampMove(); }
  scare(th){ th.state = 'flee'; th.dir = th.x < this.W / 2 ? -1 : 1; this.combo++; this.scared++; const pts = (th.boss ? 500 : 100) + this.combo * 20; this.score += pts; A.flee(); A.growl(Math.min(1, th.need));
    this.events.push({ kind: 'scare', x: th.x / this.W, text: (th.boss ? '도둑왕 도망! +' : '도망! +') + pts }); if (th.boss) this.boss = null; }
  steal(th){ th.state = 'carry'; th.carry = true; th.target.lit = false; th.target.shake = .6; this.combo = 0; this.stolen++; A.steal(); this.events.push({ kind: 'steal', x: th.x / this.W, text: '등불을 뺏겼어요!' }); }
  /** 그리기(그림자 위에). me 로 얼굴은 main 이 그림 */
  draw(ctx, t, me){
    const W = this.W, H = this.H;
    drawVillage(ctx, W, H, this, t * 1000);
    for (const th of this.thieves) drawThief(ctx, th, drawFigure, t * 1000);
    // 도둑 위 「겁」 표시: 내 그림자가 닿았는데 아직 작으면 화살표
    for (const th of this.thieves) if (th.state === 'sneak') { const over = me.present && me.x0 - 20 <= th.x && th.x <= me.x1 + 20;
      ctx.save(); ctx.textAlign = 'center'; ctx.font = '800 15px sans-serif'; ctx.fillStyle = over ? (me.size >= th.need ? '#5cf2a4' : '#ffd35c') : 'rgba(255,255,255,.6)';
      ctx.fillText(th.boss ? '도둑왕' : over ? (me.size >= th.need ? (th.boss ? '덮쳐요…' : '으악!') : '더 크게!') : '살금살금', th.x, th.y - th.h - 10);
      if (th.hold > 0) { ctx.fillStyle = 'rgba(92,242,164,.9)'; ctx.fillRect(th.x - 24, th.y - th.h - 6, 48 * Math.min(1, th.hold / (th.boss ? 2 : .35)), 4); } ctx.restore(); }
    drawLampRail(ctx, W, H, this.lamp, t * 1000);
    const nxt = this.thieves.find(x => x.state === 'sneak');
    drawThreatMeter(ctx, { x: W * .5 - 160, y: H * .86 - 86 - (this.wave === 3 ? 70 : 0), w: 320, h: 64 }, me.present ? me.size : 0, nxt ? nxt.need : null, FEAR_LIMIT);
    if (this.msg) banner(ctx, W, this.msg, 150, '#ffe9b0', 30);
  }
}
