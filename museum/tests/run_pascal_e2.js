/* run_pascal_e2.js — M2 숨은 그림 E2 무대 실부팅 검증
   jsdom으로 ex02_pascal.html 실행 → 성장·홀수칠/짝수거부·물결 전파·128줄·줌아웃→betray 700ms·여운·슬라이더 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex02_pascal.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={};
  ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
   'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
   'fillText','drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse',
   'setLineDash'].forEach(function(m){ c[m]=function(){}; });
  c.measureText=function(){ return {width:12}; };
  c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
  c.canvas={width:1366,height:768};
  return c;
}
var pass=0, fail=0, rafQueue=[], vclock=1000;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function nowFn(){ vclock+=16; return vclock; }

var dom=new JSDOM(html,{
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex02_pascal.html',
  beforeParse:function(win){
    win.HTMLCanvasElement.prototype.getContext=function(){ return ctxStub(); };
    win.HTMLCanvasElement.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:1366,height:768}; };
    Object.defineProperty(win,'devicePixelRatio',{value:1});
    win.matchMedia=function(){ return {matches:false, addEventListener:function(){}, addListener:function(){}}; };
    win.requestAnimationFrame=function(fn){ rafQueue.push(fn); return rafQueue.length; };
    win.cancelAnimationFrame=function(){};
    if(!win.performance) win.performance={};
    win.performance.now=nowFn;
    function nodeStub(){ return { connect:function(){}, disconnect:function(){}, start:function(){}, stop:function(){},
      gain:{value:0,setValueAtTime:function(){},exponentialRampToValueAtTime:function(){},linearRampToValueAtTime:function(){}},
      frequency:{value:0,setValueAtTime:function(){},exponentialRampToValueAtTime:function(){},linearRampToValueAtTime:function(){}},
      Q:{value:0}, type:'', buffer:null, loop:false }; }
    function AC(){ this.currentTime=0; this.state='running'; this.sampleRate=44100; this.destination={}; this.resume=function(){}; }
    AC.prototype.createGain=nodeStub; AC.prototype.createOscillator=nodeStub;
    AC.prototype.createBufferSource=nodeStub; AC.prototype.createBiquadFilter=nodeStub;
    AC.prototype.createBuffer=function(ch,len){ return { getChannelData:function(){ return new Float32Array(len); } }; };
    win.AudioContext=AC; win.webkitAudioContext=AC;
  }
});
var win=dom.window;
function tick(times){ for(var t=0;t<times;t++){ var q=rafQueue; rafQueue=[];
  for(var i=0;i<q.length;i++){ try{ q[i](nowFn()); }catch(e){ process.stdout.write('rAF err: '+e.message+'\n'); } } } }

try{
  var M=win.__M2, S=M.S, P=M.PURE;
  ok('부팅: __M2 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: E1 정합(뤼카·oddTotal)', P.parity(4,2)===0 && P.parity(7,3)===1 && P.oddTotal(128)===2187);
  tick(3);
  ok('초기 phase = grow1', S.phase==='grow1');

  // 1막: 성장 → 8줄 도달 → paint
  tick(600);   // vclock 16ms/tick — 약 9.6s 진행
  ok('1막: 8줄 도달 → paint', S.rows===M.ROWS_PAUSE && S.phase==='paint');
  var prem=win.document.getElementById('premise');
  ok('전제 한 줄 등장', prem && prem.classList.contains('is-in'));

  // 2막: 홀수 탭 → 칠, 짝수 탭 → 거부
  M.tapCell(3,1);                                        // parity(3,1)=1 홀수
  ok('홀수 탭 → 분필', M.isPainted(3,1)===true && S.paintedCount===1);
  M.tapCell(4,2);                                        // parity(4,2)=0 짝수
  ok('짝수 탭 → 거부(칠 0)', M.isPainted(4,2)===false && S.paintedCount===1);
  M.tapCell(3,1);
  ok('재탭 무효(중복 칠 0)', S.paintedCount===1);

  // 6칠 → 숨쉼
  M.tapCell(0,0); M.tapCell(1,0); M.tapCell(1,1); M.tapCell(2,0); M.tapCell(2,2);
  ok('6칠 → 남은 홀수 숨쉼', S.paintedCount===6 && S.breathing===true);

  // 물결: 숨쉬는 홀수 탭 → wave → rows0..7 홀수 전부 칠 → surge
  M.tapCell(7,7);
  ok('물결 시작', S.phase==='wave' || S.phase==='surge');
  tick(400);
  var allOdd=true;
  for(var n=0;n<8;n++) for(var k=0;k<=n;k++)
    if(P.parity(n,k)===1 && !M.isPainted(n,k)) allOdd=false;
  ok('물결 완료: 8줄 홀수 전부 분필', allOdd);
  ok('물결 후 phase = surge', S.phase==='surge');
  ok('E1 정합(불변식): 칠 수 = oddTotal(현재 줄 수)', S.paintedCount===P.oddTotal(S.rows));

  // 3막: 128줄 (고속 경로)
  M.forceSurge(); tick(3);
  ok('3막: 128줄 도달 → hold', S.rows===M.ROWS_MAX && S.phase==='hold');
  ok('★ E1 정합: 총 칠 수 = oddTotal(128) = 3^7', S.paintedCount===P.oddTotal(128));

  // 4막: hold 0.7s → pull → betray
  tick(60);
  ok('hold → pull 진입', S.phase==='pull');
  tick(180);                                             // 2.2s 줌아웃 완주
  ok('줌아웃 완료 → 배반 발동', S.betrayed===true);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
  M.tapCell(5,1);
  ok('잠금 중 탭 무시', M.isPainted(5,1)===false || S.phase!=='paint');
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray의 setTimeout(700ms 정지) 소화를 위해 실타이머 대기 후 마무리 검사
setTimeout(function(){
  try{
    var M=win.__M2, S=M.S, P=M.PURE;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(숨어 있었다)', f && /숨어 있었다/.test(f.innerHTML) && /시에르핀스키/.test(f.innerHTML));
    ok('티켓 m2_sierpinski 발급', win.localStorage.getItem('kmuseum.tickets') && /m2_sierpinski/.test(win.localStorage.getItem('kmuseum.tickets')));

    // 재체험 슬라이더 — 깊이 재구성(언제나 같은 그림)
    var slider=win.document.querySelector('#reexp input');
    slider.value='64';
    slider.dispatchEvent(new win.Event('input'));
    tick(4);
    ok('슬라이더: 깊이 64 재구성', S.view.rows===64);
    slider.value='256';
    slider.dispatchEvent(new win.Event('input'));
    tick(4);
    ok('슬라이더: 깊이 256 재구성', S.view.rows===256);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
