/* run_chess_e2.js — M7 체스판의 공포 E2 무대 실부팅 검증(견고 하네스)
   jsdom으로 ex07_chess.html 실행 → 칸 넘김 누적·moundOf 배가·20칸 쌀사태·
   64칸 배반 700ms→여운·티켓→슬라이더 재체험을 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex07_chess.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex07_chess.html',
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
  var M=win.__M7, S=M.S;
  ok('부팅: __M7 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: KMuseumChess BigInt(total64 문자열)', !!win.KMuseumChess && win.KMuseumChess.total64().toString()==='18446744073709551615');
  tick(3);
  ok('초기 phase = boot·col=0', S.phase==='boot' && S.col===0);

  M.start(false); tick(3);
  ok('start → intro (쌀 한 톨·이야기 전제)', S.phase==='intro');

  // moundOf 배가 — 무대 높이가 E1 배가를 그대로 목격시키는지
  ok('moundOf 배가: moundOf(k+1)=2·moundOf(k) (k=1..30 전수)', (function(){
    for(var k=1;k<30;k++){ if(Math.abs(M.moundOf(k+1)-2*M.moundOf(k))>1e-9) return false; }
    return M.moundOf(0)===0;
  })());

  // 2막 — 칸 넘김 누적
  M.advance(); tick(2);
  ok('첫 넘김: col=1·산 형성·힌트 소거', S.col===1 && S.moundH===M.moundOf(1) && S.hint===0);
  for(var i=0;i<9;i++) M.advance();
  tick(2);
  ok('10칸: 누적·낟알 파티클 생성', S.col===10 && S.grains.length>0);
  ok('아직 통제 중(쌀사태 전)', S.avalanche===false);

  // 3막 — 20칸부터 통제 상실
  for(i=0;i<10;i++) M.advance();
  tick(2);
  ok('20칸 → 쌀사태(통제 상실)', S.col===20 && S.avalanche===true);

  // betray 700ms 정지: freeze/unfreeze 목격
  var froze=false, unfroze=false;
  win.addEventListener('museum:freeze', function(){ froze=true; });
  win.addEventListener('museum:unfreeze', function(){ unfroze=true; });

  // 4막 — 64칸 배반
  while(S.col<64) M.advance();
  tick(2);
  ok('64칸 → 배반 격발', S.col===64 && S.betrayed===true && S.phase==='betrayed');
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
  M.advance();
  ok('배반 후 넘김 무시(col=64 유지)', S.col===64);

  setTimeout(function(){
    tick(30);
    ok('배반 시퀀스: freeze→unfreeze 700ms 정지 목격', froze && unfroze);
    var f=win.document.getElementById('formula');
    ok('여운: afterglow + 2^64−1 원문(콤마 묶음)', S.phase==='afterglow' && f && f.innerHTML.indexOf('18,446,744,073,709,551,615')>=0);
    ok('여운: 명판 DOM 생성', !!win.document.querySelector('.plaque'));
    ok('여운: 티켓 m7_chess 발급', win.Museum.ticket.has('m7_chess'));

    // 재체험 슬라이더 — "이 칸이면?" 카메라 점프
    var slider=win.document.querySelector('#reexp input');
    slider.value='30'; slider.dispatchEvent(new win.Event('input'));
    tick(2);
    ok('슬라이더 col=30 → 산 재구성·사태 리셋', S.col===30 && S.moundH===M.moundOf(30) && S.avalanche===false);
    ok('E1 정합: 30칸까지 누적 = 2^30−1', M.PURE.cumulative(30)===2n**30n-1n);
    ok('E1 정합: 배반의 핵 grains(31)=cumulative(30)+1', M.PURE.grains(31)===M.PURE.cumulative(30)+1n);

    console.log('E2: '+pass+'/'+(pass+fail)+(fail?' FAIL':' 통과'));
    process.exit(fail?1:0);
  }, 1100);
}catch(e){
  console.log('하네스 예외: '+e.message);
  process.exit(1);
}
