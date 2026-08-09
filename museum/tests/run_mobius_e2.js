/* run_mobius_e2.js — M4 가위의 배신 E2 무대 실부팅 검증(견고 하네스)
   jsdom으로 ex04_mobius.html 실행 → 보통 고리 절단(예측 심기)→꼬인 고리 절단(배반)
   →700ms 정지→여운·티켓→슬라이더 재체험을 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex04_mobius.html'),'utf8');
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
  c.setLineDash=function(){}; c.getLineDash=function(){ return []; };
  c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
  c.canvas={width:1366,height:768};
  return c;
}
var pass=0, fail=0, rafQueue=[], vclock=1000;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }
function nowFn(){ vclock+=16; return vclock; }

var dom=new JSDOM(html,{
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex04_mobius.html',
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
  var M=win.__M4, S=M.S;
  ok('부팅: __M4 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: KMuseumMobius 위상(centerCut(1).pieces=1)', !!win.KMuseumMobius && win.KMuseumMobius.centerCut(1).pieces===1);
  ok('부팅: §8.6 칠판 상주', !!win.__BOARD);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');
  ok('초기 배치: 왼쪽 보통(0)·오른쪽 뫼비우스(1)', S.twistL===0 && S.twistR===1);

  M.start(false); tick(3);
  ok('start → intro (전제 한 줄)', S.phase==='intro');

  // 2막 — 보통 고리 절단: 예측 심기(툭 두 조각)
  M.cutLeft(); tick(2);
  ok('보통 고리 절단 → split_normal', S.phase==='split_normal' && S.cutL>=1);
  tick(160);
  ok('두 조각 펼침 완료 → cutting 복귀·오른쪽 활성', S.phase==='cutting' && S.active==='R' && S.spread===0);
  ok('아직 배반 전', S.betrayed===false);

  // betray 700ms 정지: freeze/unfreeze 목격
  var froze=false, unfroze=false;
  win.addEventListener('museum:freeze', function(){ froze=true; });
  win.addEventListener('museum:unfreeze', function(){ unfroze=true; });

  // 3막 — 꼬인 고리 절단: 배반
  M.cutRight(); tick(2);
  ok('꼬인 고리 절단 → 배반 격발', S.betrayed===true && S.phase==='betrayed');
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);

  // jsdom 타이머는 실시간 — betray 시퀀스(플래시 180ms + 정지 700ms) 경과 대기
  setTimeout(function(){
    tick(30);
    ok('배반 시퀀스: freeze→unfreeze 700ms 정지 목격', froze && unfroze);
    ok('배반 후 입력 해제', win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운: afterglow + "안팎이 없는 세계"', S.phase==='afterglow' && f && f.innerHTML.indexOf('안팎이 없는 세계')>=0);
    ok('여운: 명판 DOM 생성', !!win.document.querySelector('.plaque'));
    ok('여운: 티켓 m4_mobius 발급', win.Museum.ticket.has('m4_mobius'));
    ok('칠판 회수: 답이 밝혀짐', win.__BOARD.isAfter());

    // 재체험 슬라이더 — 꼬임 3(홀수): 다시 잘라도 하나
    var slider=win.document.querySelector('#reexp input');
    slider.value='3'; slider.dispatchEvent(new win.Event('input'));
    tick(2);
    ok('슬라이더 t=3 → reexp·배반 리셋', S.phase==='reexp' && S.twistR===3 && S.betrayed===false && S.cutR===0);
    ok('E1 정합: 꼬임 3도 하나로 펼침(pieces=1·2배)', (function(){ var c=M.PURE.centerCut(3); return c.pieces===1&&c.lenFactor===2; })());
    ok('E1 정합: 꼬임 2는 둘·얽힘(재체험 대비)', (function(){ var c=M.PURE.centerCut(2); return c.pieces===2&&c.linked===true; })());

    console.log('E2: '+pass+'/'+(pass+fail)+(fail?' FAIL':' 통과'));
    process.exit(fail?1:0);
  }, 1100);
}catch(e){
  console.log('하네스 예외: '+e.message);
  process.exit(1);
}
