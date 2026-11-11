/* 슬라임 가르기(슬라임 공방 1장 맛보기) — 두 손을 모았다 벌리면 슬라임이 갈라진다. 가르기 = 벌리기.
 * 한 손(또는 터치)으로도: 쥐어서(눌러서) 틈을 고르고, 펴면(떼면) 갈라진다.
 * 받는 문제 모양: part {n, a, label} */
import { W, H, txt, panel, circle, clamp, dist, danger, sign } from '../ui.js';
import { scene, slimeBody } from '../scenes.js';
export default function(api){
  const CY = 420, CLOSE = 480, OPEN = 700;      // 화면(1280) 기준 두 손 사이: 손 한 뼘쯤 붙이면 모음, 어깨너비 넘게 벌리면 가름
  const S = { i: 0, q: null, gap: null, armed: false, hold: null, phase: 'play', pt: 0, left: 0, lastTwo: 0 };
  const sp = () => Math.min(72, 940 / S.q.n), x0 = () => W / 2 - (S.q.n - 1) * sp() / 2;
  const gapAt = x => clamp(Math.round((x - x0()) / sp() + .5), 1, S.q.n - 1);
  function next(){ S.q = api.pack.part(); S.gap = null; S.armed = false; S.hold = null; S.phase = 'play'; api.say(S.q.say); }
  function cut(g){ S.left = g; const ok = g === S.q.a || S.q.n - g === S.q.a; S.phase = ok ? 'ok' : 'no'; S.pt = ok ? 1.1 : .8; S.gap = null; S.armed = false; S.hold = null; if (ok) { api.correct(); const gx = x0() + (g - .5) * sp(); api.fx.burst(gx, CY, '#8ff0a8', 26); api.fx.burst(gx, CY, '#ffe27a', 10); api.fx.ring(gx, CY, '#bfffd6'); } else { api.wrong(); api.fx.shake(10); } }
  return {
    id: 'split', icon: '🟢', title: '슬라임 가르기', how: '두 손을 모아 슬라임에 대고, 자리를 정한 뒤 양옆으로 벌리면 갈라져요. (한 손이면: 주먹 쥐고 자리 정하고 활짝 펴기)', touch: '가르고 싶은 자리를 누른 채 옮기고, 손을 떼면 갈라져요',
    threatSec: 15, pushBack: .5, dbg: () => S,
    start(){ S.i = 0; next(); },
    update(dt, cur, t){
      if (S.phase !== 'play') { S.pt -= dt; if (S.pt <= 0) { if (S.phase === 'ok') { S.i++; next(); } else S.phase = 'play'; } return; }
      const near = cur.filter(c => Math.abs(c.y - CY) < 260);
      // ① 두 손: 모으면 틈이 잡히고, 벌리면 갈라진다
      if (near.length >= 2) { const [a, b] = near; const d = dist(a, b), mx = (a.x + b.x) / 2; S.lastTwo = t;
        if (d < CLOSE) { S.armed = true; S.gap = gapAt(mx); } else if (S.armed && d > OPEN) return cut(S.gap); }
      else if (S.armed && t - S.lastTwo > 700) { S.armed = false; S.gap = null; }      // 겹쳐서 한 손을 잠깐 놓쳐도 0.7초는 기다린다
      // ② 한 손·터치: 쥐고(누르고) 옮기다 펴면(떼면) 갈라진다
      if (!S.armed) for (const c of cur) { if (c.jg && Math.abs(c.y - CY) < 200 && Math.abs(c.x - W / 2) < 560) S.hold = c.id;
        if (S.hold === c.id) { if (c.grab) S.gap = gapAt(c.x); else if (c.jr && S.gap) return cut(S.gap); } }
      if (S.hold && !cur.some(c => c.id === S.hold)) { if (S.gap) return cut(S.gap); S.hold = null; }
    },
    draw(c, t){
      const n = S.q.n, s = sp(), X0 = x0(), v = api.threat.v, swell = 1 + v * .3 + Math.sin(t / 260) * .02;
      scene.slime(c, t, v);
      sign(c, S.q.label, W / 2, 110, 64); txt(c, `구슬 ${S.q.n}개`, W / 2, 200, 32, '#bfe8ff', 'center', 700);
      const beads = (from, to, dx = 0, dy = 0) => { for (let k = from; k < to; k++) { const bx = X0 + k * s + dx, by = CY + 16 + dy, r = Math.min(24, s * .34); const g = c.createRadialGradient(bx - r * .3, by - r * .3, 2, bx, by, r); g.addColorStop(0, '#fff6c9'); g.addColorStop(1, '#f0b62a'); c.fillStyle = g; c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); c.strokeStyle = '#a8760c'; c.lineWidth = 3; c.stroke(); } };
      const calm = [['#8ff0a8', '#2f9e58'], ['#8fe3f0', '#2b8fa6']], hot = ['#ffc27a', '#d9622b'], bad = ['#f0a08f', '#a8452b'];
      const col = v > .7 ? hot : calm[0], pad = s * .65, hgt = 176 * swell;
      if (S.phase === 'ok' || S.phase === 'no') { const g = S.left, good = S.phase === 'ok', p = good ? Math.min(1, (1.1 - S.pt) * 2.2) : Math.max(0, S.pt / .8 - .2), off = p * 96, hop = good ? -Math.abs(Math.sin(t / 110)) * 30 : 0;
        slimeBody(c, X0 - pad - off, X0 + (g - 1) * s + pad - off, CY + hop, 170, t, good ? calm[0] : bad, good ? 1 : -1, 1); slimeBody(c, X0 + g * s - pad + off, X0 + (n - 1) * s + pad + off, CY + hop, 170, t, good ? calm[1] : bad, good ? 1 : -1, 2);
        beads(0, g, -off, hop); beads(g, n, off, hop); txt(c, g, X0 + (g - 1) * s / 2 - off, CY - 160 + hop, 88, '#fff'); txt(c, n - g, X0 + (g + n - 1) * s / 2 + off, CY - 160 + hop, 88, '#fff');
        txt(c, good ? '잘 갈랐어!' : '다시 붙었어 — 다시!', W / 2, 630, 44, good ? '#6dffb0' : '#ffd0d0'); }
      else { slimeBody(c, X0 - pad * swell, X0 + (n - 1) * s + pad * swell, CY, hgt, t, col, v > .7 ? -1 : 0, 0); beads(0, n);
        if (v > .7 && Math.random() < .3) api.fx.dust(X0 + Math.random() * (n - 1) * s, CY - hgt / 2, 'rgba(255,255,255,1)', 1);
        if (S.gap) { const gx = X0 + (S.gap - .5) * s; c.shadowColor = '#fff'; c.shadowBlur = 18; c.strokeStyle = '#fff'; c.lineWidth = 7; c.setLineDash([14, 10]); c.lineDashOffset = -t / 30; c.beginPath(); c.moveTo(gx, CY - 128); c.lineTo(gx, CY + 128); c.stroke(); c.setLineDash([]); c.shadowBlur = 0;
          txt(c, S.gap, X0 + (S.gap - 1) * s / 2, CY - 160, 80, '#fff'); txt(c, n - S.gap, X0 + (S.gap + n - 1) * s / 2, CY - 160, 80, '#fff');
          txt(c, S.armed ? '← 벌려요 →' : '손을 펴면(떼면) 갈라져요', W / 2, 630, 40, '#ffe27a'); }
        else txt(c, '두 손을 모아 슬라임에 대 봐요', W / 2, 630, 36, '#bfe8ff', 'center', 700); }
      if (v > .7 && S.phase === 'play') txt(c, '부풀어 올라요!', W / 2, 684, 30, '#ffb04d');
      danger(c, v, t);
    } };
}
