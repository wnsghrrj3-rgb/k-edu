/* 구슬 모으기(슬라임 공방 2장 맛보기) — 양손에 하나씩 잡아 맞대면 합쳐진다. 모으기 = 맞대기.
 * 한 손(터치)으로도: 하나를 잡아 다른 것 위에 잠깐 올려 둔다.
 * 받는 문제 모양: compose {target, shelf[5]} */
import { W, H, txt, panel, circle, dist, lerp, danger } from '../ui.js';
export default function(api){
  const N = 7, HOME = [[190, 270], [190, 500], [1090, 270], [1090, 500], [640, 590]], RAD = 70, DOOR = { x: 640, y: 190 };
  const S = { i: 0, q: null, items: [], phase: 'play', pt: 0, sum: 0, pair: null };
  function next(){ S.q = api.pack.compose(); S.items = S.q.shelf.map((v, k) => ({ v, hx: HOME[k][0], hy: HOME[k][1], x: HOME[k][0], y: HOME[k][1], held: null, dwell: 0, gone: false })); S.phase = 'play'; S.pair = null; api.say(S.q.say); }
  function join(a, b){ S.sum = a.v + b.v; S.pair = [a, b]; const ok = S.sum === S.q.target; S.phase = ok ? 'ok' : 'no'; S.pt = ok ? 1.0 : .8; a.held = b.held = null; a.dwell = b.dwell = 0; if (ok) { a.gone = b.gone = true; api.correct(); } else api.wrong(); }
  return {
    id: 'merge', icon: '🟡', title: '구슬 모으기', how: '양손에 하나씩 쥐고 가운데서 맞대면 합쳐져요. 문에 적힌 수를 만들어요. (한 손이면: 하나를 쥐어 다른 것 위에 올려 두기)', touch: '하나를 끌어다 다른 것 위에 겹쳐요',
    threatSec: 17, pushBack: .5, total: N,
    dbg: () => S,
    prog: () => [S.i, N],
    start(){ S.i = 0; next(); },
    update(dt, cur){
      if (S.phase !== 'play') { S.pt -= dt; if (S.pt <= 0) { if (S.phase === 'ok') { S.i++; if (S.i >= N) return api.finish(); next(); } else S.phase = 'play'; } }
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
      c.fillStyle = '#1b1f3a'; c.fillRect(0, 0, W, H);
      // 문(위협 = 닫혀 감)
      const v = api.threat.v, open = S.phase === 'ok' ? 1 : 0, dw = 300, half = dw / 2 * (1 - (open ? 0 : v * .92));
      panel(c, DOOR.x - dw / 2 - 16, DOOR.y - 150, dw + 32, 250, '#3a2a1c', '#c9a15a', 14); c.fillStyle = '#0c0f1c'; c.fillRect(DOOR.x - dw / 2, DOOR.y - 134, dw, 218);
      c.fillStyle = '#6b4a2a'; c.fillRect(DOOR.x - dw / 2, DOOR.y - 134, dw / 2 - half, 218); c.fillRect(DOOR.x + half, DOOR.y - 134, dw / 2 - half, 218);
      txt(c, S.q.target, DOOR.x, DOOR.y - 30, 110, open ? '#6dffb0' : '#ffe27a');
      for (const it of S.items) { if (it.gone) continue; const big = String(it.v).length > 1; circle(c, it.x, it.y, RAD * (it.held ? 1.12 : 1), it.held ? '#ffd45c' : '#f2b631', '#fff', it.held ? 7 : 4); txt(c, it.v, it.x, it.y + 3, big ? 58 : 72, '#3b2408'); }
      if (S.phase === 'ok') txt(c, `${S.pair[0].v} + ${S.pair[1].v} = ${S.sum}`, W / 2, 400, 60, '#6dffb0');
      if (S.phase === 'no') txt(c, `${S.pair[0].v} + ${S.pair[1].v} = ${S.sum} … 다른 짝!`, W / 2, 400, 52, '#ffb3b3');
      if (v > .7 && S.phase === 'play') txt(c, '문이 닫혀요!', W / 2, 340, 34, '#ffb04d');
      danger(c, v, t);
    } };
}
