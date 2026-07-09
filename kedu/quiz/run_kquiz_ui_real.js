/* run_kquiz_ui_real.js — 케이퀴즈 플레이어 jsdom 실마운트 스모크
 * 실행: node kedu/quiz/run_kquiz_ui_real.js
 * 검증: mount → 문항 렌더 → 정답 클릭·확인·다음 → 결과 → onSubmit payload 규격
 */
'use strict';
var path = require('path');
var JSDOM = require('/home/claude/node_modules/jsdom').JSDOM;
var fs = require('fs');

var dom = new JSDOM('<!DOCTYPE html><body><div id="m"></div></body>', { runScripts: 'outside-only' });
var win = dom.window;
global.self = win; global.window = win; global.document = win.document;
win.console = console;

// core + template + ui 로드(브라우저 분기)
function load(p){ new Function('self','window','document','module', fs.readFileSync(p,'utf8'))(win, win, win.document, undefined); }
load(path.join(__dirname,'kquiz-core.js'));
load(path.join(__dirname,'templates/g1_math_u3.js'));
load(path.join(__dirname,'kquiz-ui.js'));
var KQuiz = win.KQuiz;

var fails=0; function ok(c,m){ if(!c){fails++;console.log('  ✗ '+m);} }

var submitted=null;
var el = win.document.getElementById('m');
KQuiz.mount(el, { mode:'student', lesson:'g1_math_u3_l05', n:5, seed:1,
  onSubmit:function(p){ submitted=p; return Promise.resolve(); } });

ok(el.querySelector('.kq-qt'), '문항 제목 렌더 안됨');
ok(el.querySelectorAll('.kq-opt').length>=2, '보기 렌더 안됨');
console.log('  Q1:', el.querySelector('.kq-qt').textContent);

// 5문항 전부 정답으로 진행
function answerAndNext(){
  // 정답 인덱스 알아내기 위해 재생성(같은 seed) — 플레이어와 동일 순서
  return;
}
var gen = KQuiz.core.generate({lesson:'g1_math_u3_l05',n:5,seed:1});
for(var i=0;i<5;i++){
  var it = gen.items[i];
  var opts = el.querySelectorAll('.kq-opt');
  if(it.type==='choice'){ opts[it.answer].click(); }
  else if(it.type==='ox'){ opts[it.answer?0:1].click(); }
  else if(it.type==='short'){ el.querySelector('.kq-short input').value = String(it.answer); el.querySelector('.kq-short input').dispatchEvent(new win.Event('input')); }
  // 확인
  var check = [].slice.call(el.querySelectorAll('.kq-btn.pri')).find(function(b){return b.textContent==='확인';});
  ok(check, '확인 버튼 없음 (문항 '+(i+1)+')'); if(check) check.click();
  // 다음/결과
  var nx = [].slice.call(el.querySelectorAll('.kq-btn.pri')).find(function(b){return /다음|결과/.test(b.textContent);});
  ok(nx, '다음 버튼 없음 (문항 '+(i+1)+')'); if(nx) nx.click();
}

// 결과 화면
ok(el.querySelector('.kq-done'), '결과 화면 안뜸');
var sub = [].slice.call(el.querySelectorAll('.kq-btn.pri')).find(function(b){return /제출/.test(b.textContent);});
ok(sub, '제출 버튼 없음'); if(sub) sub.click();

setTimeout(function(){
  ok(submitted, 'onSubmit 미호출');
  if(submitted){
    ok(submitted.set==='g1_math_u3_l05', 'set 불일치');
    ok(submitted.seed===1, 'seed 미전달');
    ok(submitted.score===submitted.max && submitted.max===5, '전정답 만점 아님: '+submitted.score+'/'+submitted.max);
    ok(Array.isArray(submitted.items)&&submitted.items.length===5, 'items 배열 규격');
    ok(typeof submitted.spent_sec==='number', 'spent_sec 없음');
    console.log('  payload:', JSON.stringify({set:submitted.set,seed:submitted.seed,score:submitted.score,max:submitted.max,n:submitted.n}));
  }
  console.log('\n──────────────\n'+(fails?('FAIL '+fails):'ALL PASS'));
  process.exit(fails?1:0);
}, 50);
