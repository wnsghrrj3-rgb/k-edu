/* run_galton_e2.js — M9 우연이 만드는 산 E2 무대 실부팅 검증
   jsdom으로 ex09_galton.html 실행 → 탭 낙하·크랭크 비·쓸기→유령 능선·2차 도달→betray 700ms 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex09_galton.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex09_galton.html',
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
  var M=win.__M9, S=M.S, B=M.B, P=M.PURE;
  ok('부팅: __M9 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: E1 정합(pathBin popcount)', P.pathBin([1,0,1],3)===2 && P.binom(12,6)===924n);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');
  ok('보드 기하: 칸 수 = rows+1', B.bins.length===B.rows+1);

  // 시작(첫 탭) → intro
  var down=new win.Event('pointerdown'); down.clientX=683; down.clientY=384; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('첫 탭 → intro', S.phase==='intro');

  // 수동 낙하: 8알 → 크랭크
  for(var d=0; d<8; d++){ M.dropOne(); tick(300); }
  var sumBins=B.bins.reduce(function(a,b){return a+b;},0);
  ok('수동 8알 안착(도수 합=8)', sumBins===8);
  ok('8알 후 크랭크 등장', S.crank.alive===true && S.phase==='crank');
  ok('안착 구슬 목격(rests>0)', S.rests.length>0);

  // 크랭크 회전 → 비(도수 누적)
  M.spin(8); tick(120);
  ok('크랭크 비: 도수 누적 증가', S.simCount>200);

  // 1차 만 개 도달 → settle → 쓸기 → 유령 능선
  M.forceCount(M.TARGET); tick(2);
  ok('1차 도달 → settle1', S.phase==='settle1');
  tick(90);   // settle 0.9s + 쓸기 진입
  ok('쓸기 진입 또는 완료', S.phase==='sweep' || S.phase==='crank');
  tick(160);  // 쓸기 1.6s 완주
  ok('유령 능선 보존(길이 rows+1)', !!S.ghost && S.ghost.length===B.rows+1);
  ok('쓸기 후 칸 비움·2차 준비', S.run===2 && B.bins.reduce(function(a,b){return a+b;},0)===0 && S.crank.alive===true);

  // 2차 비 → 만 개 도달 → 마지막 한 알 → betray
  M.spin(8); tick(60);
  M.forceCount(M.TARGET); tick(2);
  ok('2차 도달 → finale(마지막 한 알)', S.phase==='finale' && S.marbles.some(function(m){ return m.final; }));
  tick(320);  // 마지막 구슬 낙하 완주
  ok('배반 발동', S.betrayed===true);

  // betray 700ms 정지 — freeze 이벤트 후 unfreeze까지
  var frozenAt=vclock;
  for(var w=0; w<80 && S.phase!=='afterglow'; w++){ tick(1); vclock+=16; win.dispatchEvent(new win.Event('resize')); }
  // betray promise는 timer 기반 — jsdom 타이머 진행
  var t0=Date.now();
  (function waitAfter(){ })();
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray의 setTimeout(700ms 정지) 소화를 위해 실타이머 대기 후 마무리 검사
setTimeout(function(){
  try{
    var M=win.__M9, S=M.S;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='afterglow');
    var f=win.document.getElementById('formula');
    ok('여운 수식(우연 10,000번)', f && /10,000/.test(f.innerHTML) && /약속/.test(f.innerHTML));
    ok('티켓 m9_galton 발급', win.localStorage.getItem('kmuseum.tickets') && /m9_galton/.test(win.localStorage.getItem('kmuseum.tickets')));

    // 재체험 슬라이더 — 층수 재구성
    var slider=win.document.querySelector('#reexp input');
    slider.value='18';
    slider.dispatchEvent(new win.Event('input'));
    tick(4);
    ok('슬라이더: 층수 18 재구성(칸 19)', M.B.rows===18 && M.B.bins.length===19);
    var tot=M.B.bins.reduce(function(a,b){return a+b;},0);
    ok('슬라이더: 자동 비(도수>0)·이론 능선', tot>1000 && !!M.S.ghost===false);

    console.log('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 전부 통과'));
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('여운 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1600);
