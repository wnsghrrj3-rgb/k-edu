/* 케이라이브 부팅 스모크 — node live/tests/test_klive_boot.js
   jsdom 위에서 학생·교사 페이지를 켜고, 가짜 채널로 실제 핸드셰이크를 돌린다:
   교사 시작 → ping → 학생 입장 → hello/state → 타일 생성 → 스포트라이트 왕복 → end. */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let n = 0, bad = 0;
function ok(cond, name) { n++; if (!cond) { bad++; console.error('  ✗', name); } }

/* ── 가짜 Supabase — 페이지 간 공유 버스 ── */
const bus = { subs: [] };
function makeSupabase(win) {
  return {
    createClient: () => ({
      channel: (name, cfg) => {
        const sub = { name, handlers: [], statusCb: null };
        return {
          on: (t, f, cb) => { sub.handlers.push(cb); return this; },
          subscribe: (cb) => { sub.statusCb = cb; bus.subs.push(sub); setTimeout(() => cb('SUBSCRIBED'), 0); },
          send: (msg) => { // self:false — 자기 제외 전파
            bus.subs.forEach(s => { if (s !== sub && s.name === sub.name)
              s.handlers.forEach(h => h({ payload: msg.payload })); });
            return Promise.resolve('ok');
          },
          unsubscribe: () => { const i = bus.subs.indexOf(sub); if (i >= 0) bus.subs.splice(i, 1); }
        };
      },
      removeChannel: () => {}
    })
  };
}

function boot(file) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
    .replace(/<script src="[^"]*supabase[^"]*"><\/script>/, '')
    .replace(/<script src="\.\.\/kedu_config\.js"><\/script>/, '')
    .replace(/<script src="klive-core\.js"><\/script>/, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://keduclass.com/live/' + file });
  const w = dom.window;
  w.supabase = makeSupabase(w);
  w.getKeduDb = () => w.supabase.createClient();
  w.confirm = () => true;
  w.eval(fs.readFileSync(path.join(__dirname, '..', 'klive-core.js'), 'utf8'));
  const scripts = html.match(/<script>([\s\S]*?)<\/script>/g).map(s => s.replace(/<\/?script>/g, ''));
  scripts.forEach(s => w.eval(s));
  return dom;
}

(async () => {
  const tick = () => new Promise(r => setTimeout(r, 5));

  /* 교사 부팅 + 시작 */
  const T = boot('teacher.html');
  T.window.document.getElementById('startBtn').click();
  await tick();
  const code = T.window.document.getElementById('codeBox').textContent;
  ok(/^[A-Z2-9]{4}$/.test(code), '교사: 코드 생성·표시');
  ok(T.window.document.getElementById('mon').style.display === 'flex', '교사: 모니터 화면 전환');

  /* 학생 부팅 + 입장 */
  const S = boot('index.html');
  const sd = S.window.document;
  sd.getElementById('name').value = '민지';
  sd.getElementById('code').value = code.toLowerCase();
  sd.getElementById('goBtn').click();
  await tick();
  ok(sd.getElementById('stage').style.display === 'block', '학생: 라이브 화면 전환');
  ok(sd.getElementById('badge').style.display === 'flex', '학생: 배지 표시');
  await tick(); // hello 전파
  const td = T.window.document;
  ok(td.querySelectorAll('.tile').length === 1, '교사: hello → 타일 1개');
  ok(td.querySelector('.nm').textContent === '민지', '교사: 타일 이름');

  /* 스포트라이트 왕복 */
  td.querySelector('.tile').click();
  await tick();
  ok(td.getElementById('spotBar').style.display === 'block', '교사: 스포트 배너');
  ok(sd.getElementById('meBar').style.display === 'block', '학생(지목됨): meBar 표시');
  td.querySelector('.tile').click();
  await tick();
  ok(sd.getElementById('meBar').style.display === 'none', '학생: 스포트 해제');

  /* 종료 */
  try { td.getElementById('endBtn').click(); } catch (e) { /* jsdom: reload 미구현 예외 무시 */ }
  await tick();
  ok(sd.getElementById('badgeTxt').textContent === '라이브 끝', '학생: end 수신 → 배지 종료');

  console.log(bad === 0 ? `✅ ${n}/${n} 통과` : `❌ ${bad}/${n} 실패`);
  process.exit(bad === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
