/* run_gauss_e2_real.js — E2 무대 실부팅 검증(견고 하네스)
   jsdom으로 ex01_gauss.html 실행 → 장면 전환 트리거 + betray 700ms 정지 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex01_gauss.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true,
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
  var S=win.__gaussState, setPhase=win.__gaussSet;
  ok('부팅: __gaussState 노출', !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: KMuseumGauss gaussSum(100)=5050', !!win.KMuseumGauss && win.KMuseumGauss.gaussSum(100)===5050);
  tick(3);
  ok('초기 phase = chalk', S.phase==='chalk');

  // 2막 재설계(2026-07-10): 칠판 수식 노동 — 항 분필 리빌 + 합계 지우고 다시쓰기
  setPhase('free');
  S.dish.push(3); tick(40);
  ok('수식: 첫 항 분필 완성', S.eqShown===1);
  S.dish.push(7); tick(80);
  ok('수식: 둘째 항+합계 작성(=10)', S.eqShown===2 && S.sumState==='shown' && S.sumVal===10);
  S.dish.push(12); tick(120);
  ok('수식: 합계 지우고 다시쓰기(=22)', S.eqShown===3 && S.sumState==='shown' && S.sumVal===22);

  var slider=win.document.getElementById('nslider');
  slider.value='2'; slider.dispatchEvent(new win.Event('input'));
  tick(2);
  ok('슬라이더→ribbon 진입', S.phase==='ribbon');
  ok('ribbon pairs 50쌍', S.pairs.length===50);

  setPhase('folding'); S._foldStarted=true; S.foldGrab=false; S.fold=0.7; S._chainGo=false;
  tick(60);
  ok('fold 자동 완주(>=0.99)', S.fold>=0.99);
  tick(3);
  ok('완주 후 chain/이후 phase', ['chain','standing','betrayed','afterglow'].indexOf(S.phase)>=0);

  tick(1400);
  ok('기립 후 카운터 5050', Math.round(S.counter)===5050);
  ok('배반 시퀀스 진입', S.phase==='betrayed'||S.phase==='afterglow');

  var fz=0, ufz=0;
  win.addEventListener('museum:freeze',function(){ fz++; });
  win.addEventListener('museum:unfreeze',function(){ ufz++; });
  var t0=Date.now();
  var bp=win.Museum.betray({x:0.5,y:0.2});
  tick(2); // betray 첫 rAF 플러시 → 내부 setTimeout(180/700) 체인 시작
  bp.then(function(){
    var dur=Date.now()-t0;
    ok('betray freeze 발생', fz>=1);
    ok('betray unfreeze 발생', ufz>=1);
    ok('정지 >=650ms(700 목표)', dur>=650);
    finish();
  });
  setTimeout(function(){ if(pass+fail<16){ process.stdout.write('  x betray Promise 미완\n'); fail++; finish(); } }, 3000);
}catch(e){ process.stdout.write('예외: '+e.message+'\n'); fail++; finish(); }

function finish(){ process.stdout.write('- E2 부팅/전환/배반: '+pass+' pass / '+fail+' fail\n'); process.exit(fail?1:0); }
