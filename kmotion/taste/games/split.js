/* 슬라임 가르기(슬라임 공방 1장 맛보기) — 두 손을 모았다 벌리면 슬라임이 갈라진다. 가르기 = 벌리기.
 * 한 손(또는 터치)으로도: 쥐어서(눌러서) 틈을 고르고, 펴면(떼면) 갈라진다.
 * 받는 문제 모양: part {n, a, label} */
import { W, H, txt, panel, circle, clamp, dist, danger, sign } from '../ui.js';
export default function(api){
  const N = 7, CY = 420, CLOSE = 480, OPEN = 700;      // 화면(1280) 기준 두 손 사이: 손 한 뼘쯤 붙이면 모음, 어깨너비 넘게 벌리면 가름
  const S = { i: 0, q: null, gap: null, armed: false, hold: null, phase: 'play', pt: 0, left: 0, lastTwo: 0 };
  const sp = () => Math.min(72, 940 / S.q.n), x0 = () => W / 2 - (S.q.n - 1) * sp() / 2;
  const gapAt = x => clamp(Math.round((x - x0()) / sp() + .5), 1, S.q.n - 1);
  function next(){ S.q = api.pack.part(); S.gap = null; S.armed = false; S.hold = null; S.phase = 'play'; api.say(S.q.say); }
  function cut(g){ S.left = g; const ok = g === S.q.a || S.q.n - g === S.q.a; S.phase = ok ? 'ok' : 'no'; S.pt = ok ? 1.1 : .8; S.gap = null; S.armed = false; S.hold = null; ok ? api.correct() : api.wrong(); }
  return {
    id: 'split', icon: '🟢', title: '슬라임 가르기', how: '두 손을 모아 슬라임에 대고, 자리를 정한 뒤 양옆으로 벌리면 갈라져요. (한 손이면: 주먹 쥐고 자리 정하고 활짝 펴기)', touch: '가르고 싶은 자리를 누른 채 옮기고, 손을 떼면 갈라져요',
    threatSec: 15, pushBack: .5, total: N,
    dbg: () => S,
    prog: () => [S.i, N],
    start(){ S.i = 0; next(); },
    update(dt, cur, t){
      if (S.phase !== 'play') { S.pt -= dt; if (S.pt <= 0) { if (S.phase === 'ok') { S.i++; if (S.i >= N) return api.finish(); next(); } else S.phase = 'play'; } return; }
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
      c.fillStyle = '#152238'; c.fillRect(0, 0, W, H); c.fillStyle = '#1f3350'; c.fillRect(0, 560, W, 160);
      sign(c, S.q.label, W / 2, 110, 64); txt(c, `구슬 ${S.q.n}개`, W / 2, 200, 32, '#9fb6d6', 'center', 700);
      const n = S.q.n, s = sp(), X0 = x0(), v = api.threat.v, swell = 1 + v * .28 + Math.sin(t / 260) * .02;
      const drawBlob = (xa, xb, col, dy = 0) => { const w = xb - xa + s * 1.3, h = 170 * swell; c.save(); c.translate((xa + xb) / 2, CY + dy); c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 5; c.stroke(); circle(c, -18, -h * .22, 9, '#123'); circle(c, 18, -h * .22, 9, '#123'); c.restore(); };
      const beads = (from, to, dx = 0, dy = 0) => { for (let k = from; k < to; k++) circle(c, X0 + k * s + dx, CY + 14 + dy, Math.min(24, s * .34), '#ffe27a', '#b78a12', 3); };
      const col = v > .7 ? '#e9a13b' : '#49c46f';
      if (S.phase === 'ok' || S.phase === 'no') { const g = S.left, p = S.phase === 'ok' ? Math.min(1, (1.1 - S.pt) * 2.2) : Math.max(0, S.pt / .8 - .2), off = p * 90, hop = S.phase === 'ok' ? -Math.abs(Math.sin(t / 110)) * 26 : 0;
        drawBlob(X0 - off, X0 + (g - 1) * s - off, S.phase === 'ok' ? '#49c46f' : '#c46a49', hop); drawBlob(X0 + g * s + off, X0 + (n - 1) * s + off, S.phase === 'ok' ? '#3fb3c9' : '#c46a49', hop);
        beads(0, g, -off, hop); beads(g, n, off, hop); txt(c, g, X0 + (g - 1) * s / 2 - off, CY - 150, 84, '#fff'); txt(c, n - g, X0 + (g + n - 1) * s / 2 + off, CY - 150, 84, '#fff');
        txt(c, S.phase === 'ok' ? '잘 갈랐어!' : '다시 붙었어 — 다시!', W / 2, 620, 44, S.phase === 'ok' ? '#6dffb0' : '#ffb3b3'); }
      else { drawBlob(X0, X0 + (n - 1) * s, col); beads(0, n);
        if (S.gap) { const gx = X0 + (S.gap - .5) * s; c.strokeStyle = '#fff'; c.lineWidth = 6; c.setLineDash([12, 10]); c.beginPath(); c.moveTo(gx, CY - 120); c.lineTo(gx, CY + 120); c.stroke(); c.setLineDash([]);
          txt(c, S.gap, X0 + (S.gap - 1) * s / 2, CY - 150, 78, '#fff'); txt(c, n - S.gap, X0 + (S.gap + n - 1) * s / 2, CY - 150, 78, '#fff');
          txt(c, S.armed ? '← 벌려요 →' : '손을 펴면(떼면) 갈라져요', W / 2, 620, 38, '#ffe27a'); }
        else txt(c, '두 손을 모아 슬라임에 대 봐요', W / 2, 620, 36, '#9fb6d6', 'center', 700); }
      if (v > .7 && S.phase === 'play') txt(c, '부풀어 올라요!', W / 2, 676, 30, '#ffb04d');
      danger(c, v, t);
    } };
}
