/* 성문 지키기(1장 「막기」 맛보기) — 조건에 맞는 것만 손바닥으로 막는다. 나머지는 지나가게 둔다(주민이 받는 선물).
 * 받는 문제 모양: judge {text, ok(v), gen()} */
import { W, H, txt, panel, circle, rr, dist, lerp, danger, sign } from '../ui.js';
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
            if (s.need) { api.correct(); say('막았다!'); } else { api.wrong(); say('앗, 그건 선물이었어'); } }
          else if (s.t >= 1) { S.done++; if (s.need) { s.state = 'hit'; api.wrong(); api.threat.v = Math.min(.999, api.threat.v + .34); S.cracks++; say('성문에 금이 갔어!'); api.sfx('hit'); if (api.threat.v > .99) api.threat.v = 1; }
            else { s.state = 'gift'; api.correct(); say('선물 도착!'); } } }
        else s.bt += dt; }
      S.shots = S.shots.filter(s => s.state === 'fly' || s.bt < .7);
      if (S.done >= SHOTS && !S.shots.length) api.finish();
    },
    draw(c, t){
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#20305a'); g.addColorStop(1, '#3d5a4a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      sign(c, S.rule.text, W / 2, 90, S.rule.text.length > 14 ? 40 : 52);
      // 성문
      const v = api.threat.v; panel(c, GATE.x - 150, GATE.y - 120, 300, 230, '#6f5a45', '#e2c58e', 16); rr(c, GATE.x - 70, GATE.y - 60, 140, 170, 60); c.fillStyle = '#2b1d10'; c.fill();
      c.strokeStyle = '#1a0f06'; c.lineWidth = 5; for (let k = 0; k < Math.ceil(v * 3 - .01); k++) { c.beginPath(); c.moveTo(GATE.x - 120 + k * 90, GATE.y - 118); c.lineTo(GATE.x - 100 + k * 90, GATE.y - 60); c.lineTo(GATE.x - 126 + k * 90, GATE.y - 10); c.stroke(); }
      txt(c, '🧑‍🌾', GATE.x - 210, GATE.y + 60, 60); txt(c, '👧', GATE.x + 210, GATE.y + 60, 60);
      for (const s of S.shots) { let x = s.x, y = s.y, a = 1; if (s.state === 'back') { x += s.from * s.bt * 900; y -= s.bt * 500; a = 1 - s.bt / .7; } else if (s.state !== 'fly') a = 1 - s.bt / .7;
        c.globalAlpha = Math.max(0, a); circle(c, x, y, R, '#f4efe2', '#7b5a2c', 6); txt(c, s.v, x, y + 3, String(s.v).length > 2 ? 40 : 54, '#2b1d10'); c.globalAlpha = 1; }
      for (const q of api.cursors()) { if (!(q.cam || q.grab)) continue; c.save(); c.translate(q.x, q.y); c.beginPath(); c.arc(0, 0, SHIELD, 0, Math.PI * 2); c.fillStyle = 'rgba(90,200,255,.22)'; c.fill(); c.strokeStyle = '#7fe0ff'; c.lineWidth = 8; c.stroke(); txt(c, '✋', 0, 4, 64); c.restore(); }
      if (S.mt > 0) txt(c, S.msg, W / 2, 190, 44, S.msg.includes('금') || S.msg.includes('앗') ? '#ffb3b3' : '#6dffb0');
      danger(c, v, t);
    } };
}
