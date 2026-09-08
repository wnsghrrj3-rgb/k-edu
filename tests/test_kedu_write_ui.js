/* 케이글쓰기 화면 왕복 — node tests/test_kedu_write_ui.js
   jsdom 으로 index.html 을 열어 ① 쓰기 → ② 색칠 → ③ 글 틀 → ④ 선생님 표시 → 표시 누르기 → 「이렇게 바꾸기」 반영 → 다시 ④ 까지 돈다. 평가 낱말 0 검사 포함. */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'kedu/write/index.html'), 'utf8').replace('<script src="/kedu_back.js" data-mount=".bar"></script>', '');
const data = n => fs.readFileSync(path.join(root, 'kedu/write/data', n + '.json'), 'utf8');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('  ✗', m)); };
(async () => {
  const dom = new JSDOM(html, { url: 'https://keduclass.com/kedu/write/?type=argue&grade=4&topic=' + encodeURIComponent('숙제가 없어야 할까요?'), runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.fetch = url => Promise.resolve({ json: () => Promise.resolve(JSON.parse(data(url.split('/').pop().replace('.json', '')))) });
  w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
  w.eval(fs.readFileSync(path.join(root, 'kedu/write/engine.js'), 'utf8'));
  const scripts = [...dom.window.document.querySelectorAll('script:not([src])')].map(s => s.textContent);
  scripts.forEach(s => w.eval(s));
  await new Promise(r => setTimeout(r, 50));
  const d = w.document, $ = s => d.querySelector(s);
  ok($('#text'), '① 쓰기 화면');
  const ta = $('#text');
  ta.value = '나는 근데 숙제가 없어야 한다고 생각해요. 왜냐하면 숙제가 엄청 많으면 놀 시간이 없기때문이에요.\n예를들어 어제 숙제를 하느라 축구를 못 했어요\n그래서 나는 숙제가 없으면 좋겠어요.';
  ta.dispatchEvent(new w.Event('input'));
  $('#go').click();
  ok($('.palette'), '② 색칠 화면(중학년)');
  $('.sent[data-i="0"]').click(); // 생각 칠하기
  $('#see').click();
  ok($('.frame'), '③ 글 틀 화면');
  ok($('#teacher'), '③ 선생님 표시 버튼');
  const cnt = $('#teacher .tcount'); ok(cnt && +cnt.textContent >= 4, '③ 표시 개수 배지 ' + (cnt && cnt.textContent));
  $('#teacher').click();
  ok($('.paper'), '④ 종이 화면');
  ok(d.querySelectorAll('.para .role').length === 3, '④ 문단 역할 도장 3');
  ok(d.querySelectorAll('.stamp').length >= 3, '④ 문장 도장(생각·이유·예시·마무리)');
  const tms = [...d.querySelectorAll('.tm')];
  ok(tms.length >= 4, '④ 표시 ≥4 (' + tms.length + ')');
  const spoken = tms.find(t => t.textContent.startsWith('근데'));
  ok(spoken, '④ 「근데」 표시');
  spoken.click();
  ok($('.pop'), '④ 표시 누르면 설명');
  ok(/그런데/.test($('.pop').textContent), '④ 설명에 바꿔 볼 말');
  $('#apply').click();
  ok($('.paper') && !/근데/.test($('.paper').textContent), '④ 바꾸기 반영 → 근데 사라짐');
  ok(/그런데/.test($('.paper').textContent), '④ 그런데로 바뀜');
  const app = [...d.querySelectorAll('.tm.append')][0];
  ok(app, '④ 마침표 없는 문장 표시');
  app.click(); $('#apply').click();
  ok(/못 했어요\./.test($('.paper').textContent), '④ 마침표 붙음');
  ok(d.querySelectorAll('.stamp').length >= 3, '④ 바꾼 뒤에도 도장 유지');
  $('#frame').click(); ok($('.frame'), '④→③ 돌아가기');
  $('#fix').click(); ok($('#text') && /그런데/.test($('#text').value), '③→① 글에 반영돼 있음');
  // 평가 낱말 0 — 화면 전체 문구·표시 사전
  const bad = /틀렸|부족|미흡|못했|잘못|점수|등급|실패|낮/;
  const walk = (o, p) => { if (typeof o === 'string') ok(!bad.test(o), '평가 낱말: ' + p + ' ' + o); else if (o && typeof o === 'object') Object.keys(o).forEach(k => k !== '_doc' && walk(o[k], p + '.' + k)); };
  walk(JSON.parse(data('corrections')), 'corrections'); walk(JSON.parse(data('feedback')), 'feedback');
  console.log(`test_kedu_write_ui: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
