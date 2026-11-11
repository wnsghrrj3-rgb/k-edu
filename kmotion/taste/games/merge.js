/* 구슬 모으기(슬라임 공방 2장 맛보기) — 양손에 하나씩 잡아 맞대면 합쳐진다. 모으기 = 맞대기.
 * 한 손(터치)으로도: 하나를 잡아 다른 것 위에 잠깐 올려 둔다.
 * 받는 문제 모양: compose {target, shelf[5]} */
import { W, H, txt, panel, circle, dist, lerp, danger, rr } from '../ui.js';
import { scene, orb, bolt, glow } from '../scenes.js';
export default function(api){
  const HOME = [[190, 270], [190, 500], [1090, 270], [1090, 500], [640, 590]], RAD = 70, DOOR = { x: 640, y: 190 };
  const S = { i: 0, q: null, items: [], phase: 'play', pt: 0, sum: 0, pair: null };
  function next(){ S.q = api.pack.compose(); S.items = S.q.shelf.map((v, k) => ({ v, hx: HOME[k][0], hy: HOME[k][1], x: HOME[k][0], y: HOME[k][1], held: null, dwell: 0, gone: false })); S.phase = 'play'; S.pair = null; api.say(S.q.say); }
  function join(a, b){ S.sum = a.v + b.v; S.pair = [a, b]; const ok = S.sum === S.q.target; S.phase = ok ? 'ok' : 'no'; S.pt = ok ? 1.0 : .8; a.held = b.held = null; a.dwell = b.dwell = 0; const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; if (ok) { a.gone = b.gone = true; api.correct(); api.fx.burst(mx, my, '#ffe27a', 30, 520); api.fx.ring(mx, my, '#fff3c2'); api.fx.ring(DOOR.x, DOOR.y, '#6dffb0', 60); } else { api.wrong(); api.fx.burst(mx, my, '#9fb6ff', 12, 300); api.fx.shake(10); } }
  return {
    id: 'merge', icon: '🟡', title: '구슬 모으기', how: '양손에 하나씩 쥐고 가운데서 맞대면 합쳐져요. 문에 적힌 수를 만들어요. (한 손이면: 하나를 쥐어 다른 것 위에 올려 두기)', touch: '하나를 끌어다 다른 것 위에 겹쳐요',
    threatSec: 17, pushBack: .5, dbg: () => S,
    start(){ S.i = 0; next(); },
    update(dt, cur){
      if (S.phase !== 'play') { S.pt -= dt; if (S.pt <= 0) { if (S.phase === 'ok') { S.i++; next(); } else S.phase = 'play'; } }
      const live = S.items.filter(it => !it.gone);
      for (const it of live) { const c = it.held && cur.find(q => q.id === it.held);
        if (it.held && (!c || !c.grab)) it.held = null;
        if (c && c.grab) { it.x = c.x; it.y = c.y; } else { it.x = lerp(it.x, it.hx, Math.min(1, dt * 7)); it.y = lerp(it.y, it.hy, Math.min(1, dt * 7)); } }
      if (S.phase !== 'play') return;
      for (const c of cur) { if (!c.jg || live.some(it => it.held === c.id)) continue; let best = null, bd = RAD + 45; for (const it of live) { if (it.held) continue; const d = dist(it, c); if (d < bd) { bd = d; best = it; } } if (best) { best.held = c.id; api.sfx('grab'); } }
      for (const a of live) { if (!a.held) continue; let hit = null; for (const b of live) { if (b === a) continue; if (dist(a, b) < RAD * 1.45) hit = b; }
        if (!hit) { a.dwell = 0; continue; } if (hit.held) return join(a, hit);            // 둘 다 쥐고 맞댐 = 바로
        a.dwell += dt; if (a.dwell > .28) return join(a, hit); }                              // 하나만 쥐었으면 잠깐 겹쳐 둠
    },
    draw(c, t){
      const v = api.threat.v, open = S.phase === 'ok' ? 1 : 0, dw = 300, half = dw / 2 * (1 - (open ? 0 : v * .92));
      scene.vault(c, t, v);
      // 문(위협 = 닫혀 감)
      c.fillStyle = '#4a4560'; rr(c, DOOR.x - dw / 2 - 30, DOOR.y - 168, dw + 60, 280, 40); c.fill(); c.strokeStyle = '#c9a15a'; c.lineWidth = 6; c.stroke();
      c.fillStyle = '#05060f'; c.fillRect(DOOR.x - dw / 2, DOOR.y - 134, dw, 230);
      if (open) { glow(c, DOOR.x, DOOR.y - 20, 320, 'rgba(255,240,170,A)', .9); c.fillStyle = 'rgba(255,240,170,.5)'; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(DOOR.x, DOOR.y - 20); const a = -Math.PI / 2 + (k - 3) * .32 + Math.sin(t / 300) * .05; c.lineTo(DOOR.x + Math.cos(a - .06) * 520, DOOR.y - 20 + Math.sin(a - .06) * 520); c.lineTo(DOOR.x + Math.cos(a + .06) * 520, DOOR.y - 20 + Math.sin(a + .06) * 520); c.closePath(); c.fill(); } }
      else glow(c, DOOR.x, DOOR.y - 20, 170, 'rgba(120,140,255,A)', .5 + .2 * Math.sin(t / 300));
      const pw = dw / 2 - half; for (const sx of [-1, 1]) { const x = sx < 0 ? DOOR.x - dw / 2 : DOOR.x + half; c.fillStyle = '#7a5530'; c.fillRect(x, DOOR.y - 134, pw, 230); c.strokeStyle = '#3d2914'; c.lineWidth = 4; if (pw > 12) { c.strokeRect(x + 4, DOOR.y - 130, pw - 8, 222); for (let yy = DOOR.y - 90; yy < DOOR.y + 90; yy += 60) { c.fillStyle = '#c9a15a'; c.fillRect(x, yy, pw, 8); } } }
      txt(c, S.q.target, DOOR.x, DOOR.y - 26, 112, open ? '#6dffb0' : '#ffe27a');
      const live = S.items.filter(it => !it.gone), held = live.filter(it => it.held);
      if (held.length === 2) bolt(c, held[0], held[1], t); else if (held.length === 1) { const o = live.filter(b => b !== held[0]).sort((a, b) => dist(a, held[0]) - dist(b, held[0]))[0]; if (o && dist(o, held[0]) < 260) bolt(c, held[0], o, t); }
      for (const it of live) { const big = String(it.v).length > 1, r = RAD * (it.held ? 1.12 : 1), by = orb(c, it.x, it.y, r, t, !!it.held, it.hx); txt(c, it.v, it.x, it.y + by + 3, big ? 58 : 72, '#3b2408'); }
      if (S.phase === 'ok') txt(c, `${S.pair[0].v} + ${S.pair[1].v} = ${S.sum}`, W / 2, 400, 64, '#6dffb0');
      if (S.phase === 'no') txt(c, `${S.pair[0].v} + ${S.pair[1].v} = ${S.sum} … 다른 짝!`, W / 2, 400, 52, '#ffd0d0');
      if (v > .7 && S.phase === 'play') txt(c, '문이 닫혀요!', W / 2, 350, 36, '#ffb04d');
      danger(c, v, t);
    } };
}
