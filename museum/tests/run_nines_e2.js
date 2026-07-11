/* run_nines_e2.js — M6 0.999…의 방 E2 무대 실부팅 검증
   jsdom으로 ex06_nines.html 실행 → 전진·자기유사 줌·폭주·간극 소멸·betray 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex06_nines.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={};
  ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
   'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
   'fillText','drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse'].forEach(function(m){ c[m]=function(){}; });
  c.measureText=function(){ return {width:12}; };
  c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
  c.canvas={width:1366,height:768};
  return c;
}
var pass=0, fail=0, rafQueue=[], vclock=1000;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function nowFn(){ vclock+=16; return vclock; }

var dom=new JSDOM(html,{
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex06_nines.html',
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
  var M=win.__M6, S=M.S;
  ok('부팅: __M6 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: KMuseumNines gapNumerator(7)=1n', !!win.KMuseumNines && win.KMuseumNines.gapNumerator(7)===1n);
  tick(3);
  ok('초기 phase = boot · n=1', S.phase==='boot' && S.n===1);

  M.start(); tick(4);
  ok('start → intro (전제 한 줄)', S.phase==='intro');

  M.setPhase('pull');
  var ls0=S.logSpanT;
  M.onForward(); tick(2);
  ok('전진 → n=2', S.n===2);
  ok('자기유사 줌: logSpanT −1 (×10 줌인)', S.logSpanT === ls0-1);
  M.onForward(); M.onForward(); tick(2);
  ok('전진 반복 → n=4 · logSpanT=−3', S.n===4 && S.logSpanT===-3);
  ok('간극 목표 = −n (logGapT)', S.logGapT===-4);

  // 8번째 이후 조작 → 폭주(통제 상실)
  S.n=8; M.onForward(); tick(2);
  ok('9번째 조작 → cascade(통제 상실)', S.casc===true && S.phase==='cascade');
  tick(700);
  ok('폭주 → n=40 도달', S.n>=40);
  ok('간극 소멸 → betray 격발', S.betrayed===true);

  setTimeout(function(){
    tick(30);
    var f=win.document.getElementById('formula');
    ok('여운: 수식 0.999… = 1', S.phase==='afterglow' && f && f.innerHTML.indexOf('0.999')>=0 && f.innerHTML.indexOf('= 1')>=0);
    ok('여운: 명판 DOM 생성', !!win.document.querySelector('.plaque'));
    ok('여운: 티켓 m6_nines 발급', win.Museum.ticket.has('m6_nines'));

    // 슬라이더 재체험: 유한이면 언제나 간극
    var slider=win.document.querySelector('#reexp input');
    slider.value='5'; slider.dispatchEvent(new win.Event('input'));
    tick(3);
    ok('슬라이더 n=5 → replay·줌 점프', S.phase==='replay' && S.n===5 && S.logSpan===-4);
    ok('재체험: 간극 존재(logGap 유한)', S.logGap===-5 && S.logGap<0);
    ok('E1 정합: lessThanOne(5) · gapNumerator=1n', M.PURE.lessThanOne(5)===true && M.PURE.gapNumerator(5)===1n);

    console.log('E2: '+pass+'/'+(pass+fail)+(fail?' FAIL':' 통과'));
    process.exit(fail?1:0);
  }, 900);
}catch(e){
  console.log('하네스 예외: '+e.message);
  process.exit(1);
}
