/* 성문 지키기(1장 「막기」 맛보기) — 조건에 맞는 것만 손바닥으로 막는다. 나머지는 지나가게 둔다(주민이 받는 선물).
 * 받는 문제 모양: judge {text, ok(v), gen()} */
import { W, H, txt, panel, circle, rr, dist, lerp, danger, sign } from '../ui.js';
import { scene, villager, glow } from '../scenes.js';
export default function(api){
  const SHOTS = 16, DUR = 4.6, EVERY = 2.5, GATE = { x: 640, y: 610 }, R = 54, SHIELD = 92;
  const S = { rule: null, shots: [], spawned: 0, st: 0, cracks: 0, done: 0, msg: null, mt: 0 };
  function spawn(){ const from = S.spawned % 2 ? 1 : -1, v = S.rule.gen(); S.shots.push({ v, need: S.rule.ok(v), from, sx: from < 0 ? -50 : W + 50, sy: 230 + api.rnd() * 170, t: 0, state: 'fly', x: 0, y: 0, bt: 0 }); S.spawned++; }
  const pos = (s, t) => { const x = lerp(s.sx, GATE.x, t), y = lerp(s.sy, GATE.y, t) - Math.sin(t * Math.PI) * 190; return { x, y }; };
  const say = (m) => { S.msg = m; S.mt = 1.1; };
  return {
    id: 'gate', icon: '🛡️', title: '성문 지키기', how: '손바닥을 펴서 방패로 써요. 팻말에 맞는 수만 막고, 아닌 수는 지나가게 둬요.', touch: '막을 수를 눌러요',
    threatSec: 0, pushBack: 0, total: SHOTS,
    dbg: () => S,
    prog: () => [Math.min(S.done, SHOTS), SHOTS],
    start(){ S.rule = api.pack.judge(); S.shots = []; S.spawned = 0; S.st = 1.2; S.cracks = 0; S.done = 0; api.say(S.rule.say); },
    update(dt, cur){
      S.mt = Math.max(0, S.mt - dt); S.st -= dt; if (S.spawned < SHOTS && S.st <= 0) { spawn(); S.st = EVERY; }
      const shields = cur.filter(c => c.cam || c.grab);                 // 카메라: 손이 보이면 방패 · 터치: 누르는 동안
      for (const s of S.shots) {
        if (s.state === 'fly') { s.t += dt / DUR; Object.assign(s, pos(s, Math.min(1, s.t)));
          if (s.t < .93 && shields.some(c => dist(c, s) < SHIELD + R * .5)) { s.state = 'back'; s.bt = 0; S.done++; api.sfx('block');
            api.fx.burst(s.x, s.y, '#bff1ff', 20, 480); api.fx.ring(s.x, s.y, '#bff1ff');
            if (s.need) { api.correct(); say('막았다!'); api.fx.text(s.x, s.y - 70, '철컹!', '#bff1ff', 46); } else { api.wrong(); say('앗, 그건 선물이었어'); } }
          else if (s.t >= 1) { S.done++; if (s.need) { s.state = 'hit'; api.wrong(); api.threat.v = Math.min(.999, api.threat.v + .34); S.cracks++; say('성문에 금이 갔어!'); api.sfx('hit'); api.fx.shake(26); api.fx.flash('255,80,60', .35); api.fx.burst(GATE.x, GATE.y - 60, '#8b7a94', 26, 500); if (api.threat.v > .99) api.threat.v = 1; }
            else { s.state = 'gift'; api.correct(); say('선물 도착!'); api.fx.burst(GATE.x, GATE.y - 40, '#ffd35c', 16, 360); api.fx.burst(GATE.x, GATE.y - 40, '#ff8fd0', 10, 300); } } }
        else s.bt += dt; }
      S.shots = S.shots.filter(s => s.state === 'fly' || s.bt < .7);
      if (S.done >= SHOTS && !S.shots.length) api.finish();
    },
    draw(c, t){
      const v = api.threat.v; scene.castle(c, t, v);
      sign(c, S.rule.text, W / 2, 90, S.rule.text.length > 14 ? 40 : 52);
      // 성문 탑
      c.fillStyle = '#9a8aa3'; c.fillRect(GATE.x - 170, GATE.y - 170, 340, 290); c.fillStyle = '#7c6d86'; for (let x = GATE.x - 170; x < GATE.x + 170; x += 68) c.fillRect(x, GATE.y - 200, 44, 34);
      c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 2; for (let yy = GATE.y - 130; yy < GATE.y + 120; yy += 44) { c.beginPath(); c.moveTo(GATE.x - 170, yy); c.lineTo(GATE.x + 170, yy); c.stroke(); }
      rr(c, GATE.x - 78, GATE.y - 70, 156, 190, 70); c.fillStyle = '#5a3a1c'; c.fill(); c.strokeStyle = '#2b1d10'; c.lineWidth = 6; c.stroke(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3; for (let x = GATE.x - 52; x < GATE.x + 78; x += 26) { c.beginPath(); c.moveTo(x, GATE.y - 60); c.lineTo(x, GATE.y + 118); c.stroke(); }
      c.strokeStyle = '#120a04'; c.lineWidth = 6; c.lineJoin = 'round'; for (let k = 0; k < Math.ceil(v * 3 - .01); k++) { const x0 = GATE.x - 130 + k * 110; c.beginPath(); c.moveTo(x0, GATE.y - 168); c.lineTo(x0 + 24, GATE.y - 100); c.lineTo(x0 - 8, GATE.y - 40); c.lineTo(x0 + 18, GATE.y + 30); c.stroke(); }
      const cheer = S.mt > 0 && !(S.msg.includes('금') || S.msg.includes('앗')) ? 1 : 0;
      villager(c, GATE.x - 260, 512, t, '#4d9dff', cheer); villager(c, GATE.x + 260, 512, t, '#ff8fd0', cheer); villager(c, GATE.x - 400, 512, t, '#6dd08f', cheer); villager(c, GATE.x + 400, 512, t, '#ffd35c', cheer);
      for (const s of S.shots) { let x = s.x, y = s.y, a = 1; if (s.state === 'back') { x += s.from * s.bt * 900; y -= s.bt * 500; a = 1 - s.bt / .7; } else if (s.state !== 'fly') a = 1 - s.bt / .7;
        c.globalAlpha = Math.max(0, a); if (s.state === 'fly') { for (let k = 1; k <= 5; k++) { const q = pos(s, Math.max(0, s.t - k * .018)); c.fillStyle = `rgba(255,190,90,${.3 - k * .05})`; c.beginPath(); c.arc(q.x, q.y, R * (1 - k * .13), 0, 7); c.fill(); } }
        const g = c.createRadialGradient(x - 16, y - 18, 6, x, y, R); g.addColorStop(0, '#fffdf2'); g.addColorStop(1, '#d9cba6'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill(); c.strokeStyle = '#7b5a2c'; c.lineWidth = 6; c.stroke(); txt(c, s.v, x, y + 3, String(s.v).length > 2 ? 40 : 54, '#2b1d10'); c.globalAlpha = 1; }
      for (const q of api.cursors()) { if (!(q.cam || q.grab)) continue; glow(c, q.x, q.y, SHIELD * 1.9, 'rgba(110,210,255,A)', .45); c.save(); c.translate(q.x, q.y); c.beginPath(); c.arc(0, 0, SHIELD, 0, Math.PI * 2); c.fillStyle = 'rgba(90,200,255,.25)'; c.fill(); c.strokeStyle = '#bff1ff'; c.lineWidth = 9; c.stroke(); c.rotate(t / 500); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(SHIELD * .45, 0); c.lineTo(SHIELD * .8, 0); c.stroke(); } c.restore(); }
      if (S.mt > 0) txt(c, S.msg, W / 2, 190, 46, S.msg.includes('금') || S.msg.includes('앗') ? '#ffd0d0' : '#6dffb0');
      danger(c, v, t);
    } };
}
