/* 케이라이브 코어 단독 테스트 — node live/tests/test_klive_core.js */
'use strict';
const C = require('../klive-core.js');
let n = 0, bad = 0;
function ok(cond, name) { n++; if (!cond) { bad++; console.error('  ✗', name); } }

/* 1. 코드·채널 */
ok(C.makeCode(() => 0) === 'AAAA', '결정적 rand → 결정적 코드');
ok(!/[0O1I]/.test(C.makeCode()), '혼동 글자 없음');
ok(C.channelName('ab2c') === 'klive:AB2C', '채널명 대문자');
ok(C.normCode(' ab2c ') === 'AB2C', 'normCode 정리');
ok(C.normCode('AB1C') === null && C.normCode('ABC') === null, 'normCode 불량 거부');

/* 2. 메시지 검증 */
ok(C.isValid({ kind: 'hello', sid: 's1', name: '가' }), 'hello 유효');
ok(!C.isValid({ kind: 'hello', sid: 's1' }), 'hello 이름 없으면 무효');
ok(!C.isValid({ kind: 'zzz' }) && !C.isValid(null), '미정의 kind·null 거부');
ok(C.isValid({ kind: 'ping' }) && C.isValid({ kind: 'end' }), '교사 무인자 메시지 유효');

/* 3. 명부 리듀서 */
let r = {};
r = C.rosterReduce(r, { kind: 'hello', sid: 's1', name: '민지' }, 1000);
ok(r.s1 && r.s1.name === '민지', 'hello → 입장');
r = C.rosterReduce(r, { kind: 'state', sid: 's1', name: '민지', page: '물감 공방', path: '/draw/', thumb: 'data:x' }, 2000);
ok(r.s1.page === '물감 공방' && r.s1.thumb === 'data:x', 'state → 갱신');
const r2 = C.rosterReduce(r, { kind: 'state', sid: 's1', name: '민지', page: '허브', path: '/' }, 3000);
ok(r2.s1.thumb === 'data:x', '썸네일 없는 하트비트 → 이전 그림 유지');
ok(r.s1.page === '물감 공방', '불변 갱신(원본 보존)');
const r3 = C.rosterReduce(r2, { kind: 'bye', sid: 's1' }, 4000);
ok(!r3.s1, 'bye → 퇴장');
ok(C.rosterReduce(r2, { kind: 'zzz' }, 0) === r2, '무효 메시지 → 원본 그대로');

/* 4. 생기 분류 */
ok(C.classify(10000, 0) === 'fresh', '12초 미만 fresh');
ok(C.classify(20000, 0) === 'idle', '45초 미만 idle');
ok(C.classify(60000, 0) === 'off', '45초 이상 off');

/* 5. 송신 판단기 */
const s = C.createSender();
ok(s.dueState(0, false, false), '첫 상태 즉시');
ok(!s.dueState(3000, false, false), '주기 전 침묵');
ok(s.dueState(3001, false, true), 'force(페이지 이동) 즉시');
ok(s.dueState(5001 + 3001, false, false), '주기 도달 송신');
const big = 'data:image/jpeg;base64,' + 'A'.repeat(5000);
ok(s.dueThumb(0, false, big), '첫 썸네일 송신');
ok(!s.dueThumb(10000, false, big), '동일 내용 침묵');
const big2 = 'data:image/jpeg;base64,' + 'B'.repeat(5100);
ok(!s.dueThumb(10500, false, null), 'null 거부');
ok(!s.dueThumb(10600, false, 'data:tiny'), '빈/검은 화면(EMPTY_MIN) 거부');
ok(!s.dueThumb(10700, false, 'x'.repeat(C.THUMB_MAX + 1)), '상한 초과 거부');
ok(s.dueThumb(10800, false, big2), '내용 변화 → 송신');
const s2 = C.createSender();
ok(s2.plan(true).thumbMs < s2.plan(false).thumbMs, '지목 시 주기 단축');
ok(s2.plan(true).thumbW > s2.plan(false).thumbW, '지목 시 해상도 상승');

/* 6. 스포트라이트 */
let sp = null;
sp = C.spotReduce(sp, { kind: 'spotlight', sid: 's1', name: '민지' });
ok(sp && sp.sid === 's1', '지목');
ok(C.spotView(sp, 's1') === 'me', '지목된 본인 → me');
ok(C.spotView(sp, 's9') === 'watch', '나머지 → watch');
sp = C.spotReduce(sp, { kind: 'spotlight', sid: null });
ok(sp === null && C.spotView(sp, 's9') === null, '해제');
ok(C.spotReduce({ sid: 's1' }, { kind: 'state', sid: 's2', name: 'x' }).sid === 's1', '무관 메시지 무시');

console.log(bad === 0 ? `✅ ${n}/${n} 통과` : `❌ ${bad}/${n} 실패`);
process.exit(bad === 0 ? 0 : 1);
