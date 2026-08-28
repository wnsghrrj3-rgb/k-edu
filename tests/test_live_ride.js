/* 케이라이브 동승(kedu_live_ride.js) — jsdom 시나리오
 * 실행: NODE_PATH=<jsdom> node tests/test_live_ride.js (k-edu 루트) */
'use strict';
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const R = path.join(__dirname, '..');
const rideSrc = fs.readFileSync(path.join(R, 'kedu_live_ride.js'), 'utf8');
const coreSrc = fs.readFileSync(path.join(R, 'live/klive-core.js'), 'utf8');

let pass = 0, fail = 0;
function ok(c, name) { if (c) { pass++; console.log('  ✓ ' + name); } else { fail++; console.error('  ✗ ' + name); } }

function makeWin(scene) {
  const dom = new JSDOM('<!doctype html><html><head></head><body><canvas width="300" height="200"></canvas></body></html>',
    { runScripts: 'outside-only', url: 'https://keduclass.com' + (scene.path || '/grade1/semester1/korean/index.html') });
  const w = dom.window;
  w.eval(coreSrc);                                 // KLiveCore 실물
  // 캔버스 스텁 (jsdom엔 2d 컨텍스트 없음 — 썸네일은 null 폴백 경로로)
  w.HTMLCanvasElement.prototype.getContext = () => { throw new Error('no ctx'); };
  w.supabase = {};
  w.__sent = [];
  w.__subscribed = 0;
  w.getKeduDb = () => ({
    rpc: (n, a) => {
      if (n === 'list_class_openings') return Promise.resolve({ data: scene.open ? [{ content_key: 'feature:klive' }] : [], error: null });
      if (n === 'my_seat_class') return Promise.resolve({ data: scene.seat || { status: 'no_profile' }, error: null });
      return Promise.resolve({ data: null, error: null });
    },
    auth: { getSession: () => Promise.resolve({ data: { session: scene.session || null } }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) }),
    channel: () => ({
      on: function () { return this; },
      subscribe: function (cb) { w.__subscribed++; if (cb) cb('SUBSCRIBED'); return this; },
      send: (m) => { w.__sent.push(m.payload); }
    })
  });
  // KeduTier 스텁 — guest/resolve 만 흉내
  w.KeduTier = {
    guest: () => scene.guest || null,
    resolve: () => Promise.resolve(scene.tier || { tier: 'visitor' })
  };
  w.eval(rideSrc);
  return w;
}
const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  // ① 방문자 — 구독하지 않는다
  let w = makeWin({ open: true, tier: { tier: 'visitor' } });
  await wait(30);
  ok(w.__subscribed === 0, '방문자: 채널 구독 0');

  // ② 게스트 + 라이브 미개방 — 구독 보류
  w = makeWin({ open: false, guest: { code: 'U7G96M', grade: 1, day: 'x' } });
  await wait(30);
  ok(w.__subscribed === 0, '게스트+미개방: 구독 보류(웹소켓 0)');

  // ③ 게스트 + 개방 — 구독하지만 ping 전까지 침묵·배지 없음
  w = makeWin({ open: true, guest: { code: 'U7G96M', grade: 1, day: 'x' } });
  await wait(30);
  ok(w.__subscribed === 1, '게스트+개방: 채널 구독 1');
  ok(w.__sent.length === 0, 'ping 전: 아무것도 안 보냄');
  ok(!w.document.getElementById('kedu-ride-badge'), 'ping 전: 배지 없음');

  // ④ ping 수신 — hello+state 즉시, 배지 표시, 이름은 손님-xx
  w.KeduRide._onMsg({ kind: 'ping' });
  await wait(10);
  const kinds = w.__sent.map(m => m.kind);
  ok(kinds.indexOf('hello') >= 0 && kinds.indexOf('state') >= 0, 'ping: hello+state 핸드셰이크');
  ok(/^손님-/.test(w.__sent[0].name), '게스트 이름 = 손님-xx');
  const badge = w.document.getElementById('kedu-ride-badge');
  ok(badge && badge.style.display !== 'none', 'ping: 🔴 배지 표시');
  ok(w.KeduRide._state().live === true, '라이브 판정 on');

  // ⑤ 스포트라이트 — 내 sid 면 배지 문구 전환
  const sid = w.__sent[0].sid;
  w.KeduRide._onMsg({ kind: 'spotlight', sid: sid, name: '손님' });
  ok(w.document.getElementById('kedu-ride-badge').textContent.indexOf('내 화면') >= 0, '스포트라이트(me): 배지 문구 전환');

  // ⑥ end — 침묵 + 배지 제거, 이후 tick 이 안 보냄
  w.KeduRide._onMsg({ kind: 'end' });
  const sentBefore = w.__sent.length;
  w.KeduRide._tick();
  ok(w.__sent.length === sentBefore, 'end 후: tick 침묵');
  ok(w.document.getElementById('kedu-ride-badge').style.display === 'none', 'end 후: 배지 제거');
  ok(w.KeduRide._state().live === false, '라이브 판정 off');

  // ⑦ 좌석 학생 — 닉네임으로 방송
  w = makeWin({ open: true, session: { user: { id: 'u1' } },
                tier: { tier: 'student', profile: { class_code: 'U7G96M', nickname: '하늘이' } } });
  await wait(30);
  ok(w.__subscribed === 1, '좌석 학생: 구독');
  w.KeduRide._onMsg({ kind: 'ping' });
  await wait(10);
  ok(w.__sent.some(m => m.name === '하늘이'), '좌석 학생: 닉네임으로 방송');

  // ⑧ 잘못된 메시지 무시
  const n0 = w.__sent.length;
  w.KeduRide._onMsg({ kind: 'evil' }); w.KeduRide._onMsg(null);
  ok(w.__sent.length === n0, '무효 메시지 무시');

  console.log('동승 라이브: ' + pass + ' 통과, ' + fail + ' 실패');
  process.exit(fail ? 1 : 0);
})();
