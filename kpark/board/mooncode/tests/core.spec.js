/* 🌙 달빛 암호 — core 테스트. 실행: node kpark/board/mooncode/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }
function sorted(row) { for (let i = 1; i < row.length; i++) if (C.cmp(row[i - 1], row[i]) >= 0) return false; return true; }

console.log('[타일·배치]');
{
  ok(C.allTiles().length === 24, '전체 24장');
  ok(C.cmp({ c: 'b', n: 5 }, { c: 'w', n: 5 }) < 0, '같은 수는 흑 < 백');
  const g = C.newGame(1);
  ok(g.rows[1].length === 4 && g.rows[2].length === 4, '각자 4장');
  ok(g.pool.length === 16, '더미 16장');
  ok(sorted(g.rows[1]) && sorted(g.rows[2]), '줄 자동 정렬');
  ok(g.rows[1].every(t => !t.open), '전부 비밀로 시작');
  const g2 = C.newGame(1);
  ok(JSON.stringify(g.pool) === JSON.stringify(g2.pool), '같은 시드 = 같은 셔플');
}

console.log('[추리 규칙]');
{
  const g = C.newGame(3);
  const held = C.draw(g);
  ok(held && g.phase === 'guess', '뽑고 추리 단계');
  const target = g.rows[2][0];
  const r = C.guess(g, 0, target.n);
  ok(r.correct && g.rows[2][0].open, '정답 → 공개');
  ok(g.turn === 1 && g.phase === 'guess', '맞히면 차례 유지');
  /* 틀린 추리: 다른 숫자 */
  const t2 = g.rows[2].find(t => !t.open);
  const wrongN = (t2.n + 1) % 12 === t2.n ? t2.n + 2 : (t2.n + 1) % 12;
  const before = g.rows[1].length;
  const r2 = C.guess(g, g.rows[2].indexOf(t2), wrongN === t2.n ? (t2.n + 2) % 12 : wrongN);
  ok(!r2.correct, '오답 판정');
  ok(g.rows[1].length === before + 1 && g.rows[1].some(t => t.open), '오답 → 든 타일 공개 삽입');
  ok(g.turn === 2 && g.phase === 'draw', '오답 → 차례 넘김');
  ok(sorted(g.rows[1]), '삽입 후에도 정렬 유지');
}

console.log('[멈추기·승리]');
{
  const g = C.newGame(5);
  C.draw(g);
  const t = g.rows[2][2];
  C.guess(g, 2, t.n);
  const before = g.rows[1].length;
  C.stop(g);
  ok(g.rows[1].length === before + 1 && g.turn === 2, '멈추면 비밀로 내려놓고 차례 넘김');
  /* 전부 공개 → 승리 */
  const h = C.newGame(7);
  C.draw(h);
  let win = null;
  while (true) {
    const hid = h.rows[2].map((t, i) => t.open ? -1 : i).filter(i => i >= 0);
    if (!hid.length) break;
    const r = C.guess(h, hid[0], h.rows[2][hid[0]].n);   /* 훔쳐보고 정답만 */
    if (r.win) { win = true; break; }
  }
  ok(win && C.winner(h) === 1, '상대 전부 공개 → 승리');
}

console.log('[추리 AI]');
{
  const g = C.newGame(11);
  C.draw(g);
  const a = C.analyze(g, 1);
  ok(a.total > 0 && a.best && a.best.p > 0 && a.best.p <= 1, '가능 세계 계산·최선 후보');
  /* 확률 합 = 1 (각 칸) */
  const idx = +Object.keys(a.table)[0];
  const sum = Object.values(a.table[idx]).reduce((s, x) => s + x, 0);
  ok(Math.abs(sum - 1) < 1e-9, '칸별 확률 합 1');
  /* 확실한 상황: 상대 비밀 1칸 + 미지 1장이면 확률 1 */
  const h = C.newGame(2);
  h.rows[2].forEach((t, i) => { if (i > 0) t.open = true; });
  /* 미지 타일을 1장으로 줄이기: 더미를 내 줄(공개)로 옮김 */
  while (h.pool.length > 1) { const t = h.pool.pop(); h.rows[1].push({ c: t.c, n: t.n, open: true }); }
  h.rows[1].sort(C.cmp);
  h.phase = 'draw'; h.turn = 1;
  C.draw(h); /* 마지막 1장 뽑음 → 미지 = 상대 비밀 1장뿐 */
  const a2 = C.analyze(h, 1);
  ok(a2.best.p === 1 && a2.best.n === h.rows[2][0].n, '미지 1장 → 100% 정답 추리');
  /* AI 대국 완주: hard vs easy, 항상 승자가 나옴 */
  let done = 0;
  for (let s = 1; s <= 5; s++) {
    const m = C.newGame(s * 13);
    let guard = 200;
    while (!C.winner(m) && guard--) C.aiTurn(m, m.turn === 1 ? 'hard' : 'easy', C.cmp ? Math.random : Math.random);
    if (C.winner(m)) done++;
  }
  ok(done === 5, 'AI 자동 대국 5판 완주');
}

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
