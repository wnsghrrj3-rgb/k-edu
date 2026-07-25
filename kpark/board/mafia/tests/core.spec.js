/* 🕵️ 마피아 대작전 — core 테스트. 실행: node kpark/board/mafia/tests/core.spec.js */
'use strict';
const C = require('../core.js');
let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.error('  ✗ ' + m); } }
const names = n => Array.from({ length: n }, (_, i) => (i + 1) + '번');

console.log('[추천 역할]');
{
  ok(JSON.stringify(C.recommendRoles(5)) === JSON.stringify({ mafia: 1, doctor: 1, police: 0 }), '5명 → 마피아1 의사1');
  ok(JSON.stringify(C.recommendRoles(7)) === JSON.stringify({ mafia: 1, doctor: 1, police: 1 }), '7명 → 경찰 등장');
  ok(C.recommendRoles(12).mafia === 2 && C.recommendRoles(13).mafia === 3, '12명 2 / 13명 3');
  ok(C.recommendRoles(25).mafia === 5 && C.recommendRoles(30).mafia === 6, '25명 5 / 30명 6');
  for (let n = C.MIN; n <= C.MAX; n++) ok2(C.validRoles(n, C.recommendRoles(n)), n);
  function ok2(c, n) { if (!c) { fail++; console.error('  ✗ 추천 구성 유효성 실패 n=' + n); } }
  pass++; console.log('  ✓ 5~35명 전 구간 추천 구성 유효');
}

console.log('[배정]');
{
  const g = C.newGame(names(25), { mafia: 4, doctor: 1, police: 1 }, 7);
  const cnt = {};
  g.players.forEach(p => cnt[p.role] = (cnt[p.role] || 0) + 1);
  ok(cnt.mafia === 4 && cnt.doctor === 1 && cnt.police === 1 && cnt.citizen === 19, '역할 수 정확 (25명)');
  ok(g.players.every(p => p.alive), '전원 생존 시작');
  const g2 = C.newGame(names(25), { mafia: 4, doctor: 1, police: 1 }, 7);
  ok(JSON.stringify(g.players.map(p => p.role)) === JSON.stringify(g2.players.map(p => p.role)), '같은 시드 = 같은 배정');
  const g3 = C.newGame(names(25), { mafia: 4, doctor: 1, police: 1 }, 8);
  ok(JSON.stringify(g.players.map(p => p.role)) !== JSON.stringify(g3.players.map(p => p.role)), '다른 시드 = 다른 배정');
  const m0 = g.players.find(p => p.role === 'mafia');
  ok(C.mates(g, m0.id).length === 3 && C.mates(g, m0.id).every(p => p.role === 'mafia'), '동료 마피아 조회');
  let threw = false;
  try { C.newGame(names(5), { mafia: 3, doctor: 1, police: 1 }, 1); } catch (e) { threw = true; }
  ok(threw, '마피아 우세 시작 금지');
}

console.log('[밤 → 아침]');
{
  const g = C.newGame(names(10), { mafia: 2, doctor: 1, police: 1 }, 3);
  const cop = g.players.find(p => p.role === 'police');
  const maf = g.players.find(p => p.role === 'mafia');
  const cit = g.players.find(p => p.role === 'citizen');
  ok(C.nightCheck(g, maf.id) === true && C.nightCheck(g, cit.id) === false, '경찰 조사 O/X');
  C.nightKill(g, cit.id); C.nightSave(g, cit.id);
  let r = C.resolveNight(g);
  ok(r.saved && r.victim === null && g.players[cit.id].alive, '의사가 지키면 무사');
  C.nightKill(g, cop.id); C.nightSave(g, cit.id);
  r = C.resolveNight(g);
  ok(!r.saved && r.victim.id === cop.id && !g.players[cop.id].alive, '지목 성공 시 탈락');
  ok(g.night.kill === null && g.night.save === null, '밤 상태 초기화');
  let threw = false;
  try { C.nightKill(g, cop.id); } catch (e) { threw = true; }
  ok(threw, '탈락자 재지목 금지');
  r = C.resolveNight(g);
  ok(r.victim === null && !r.saved, '지목 없는 밤 = 평화');
}

console.log('[투표·승리]');
{
  const g = C.newGame(names(6), { mafia: 1, doctor: 1, police: 0 }, 5);
  const maf = g.players.find(p => p.role === 'mafia');
  ok(C.winner(g) === null, '시작엔 승자 없음');
  ok(C.voteOut(g, null) === null && g.day === 2, '무효표 → 아무도 탈락 없음, 날짜 증가');
  const out = C.voteOut(g, maf.id);
  ok(out.role === 'mafia' && C.winner(g) === 'citizen', '마피아 전멸 → 시민 승');

  const h = C.newGame(names(5), { mafia: 1, doctor: 1, police: 0 }, 5);
  const civs = h.players.filter(p => p.role !== 'mafia');
  C.voteOut(h, civs[0].id); C.voteOut(h, civs[1].id);
  ok(C.winner(h) === null, '1 대 2는 아직 진행');
  C.voteOut(h, civs[2].id);
  ok(C.winner(h) === 'mafia', '1 대 1 → 마피아 승');
}

console.log('\n결과: ' + pass + ' 통과, ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
