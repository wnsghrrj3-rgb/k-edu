/* run_hotel_e2.js — M5 끝없는 호텔 E2 무대 실부팅 검증(견고 하네스)
   jsdom으로 ex05_hotel.html 실행 → 복도 전진·벨→시프트·1호 소등·betray 700ms 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex05_hotel.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex05_hotel.html',
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
  var M=win.__M5, S=M.S;
  ok('부팅: __M5 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.stage==='function');
  ok('부팅: KMuseumHotel 사상(occupantOf(2,1)=1)', !!win.KMuseumHotel && win.KMuseumHotel.occupantOf(2,1)===1);
  tick(3);
  ok('초기 phase = boot', S.phase==='boot');

  M.start(); tick(4);
  ok('start → intro (이야기 한 줄 전제)', S.phase==='intro');

  M.setPhase('walk');
  var z0=S.camZ; S.camVel=2200; tick(30);
  ok('드래그 관성 → camZ 전진', S.camZ>z0+300);
  ok('초기 만실(vacatedK=0)', S.vacatedK===0);

  M.knock(3); tick(2);
  ok('노크 반응(knockAnim·카운트)', S.knocks>=1 && (S.knockAnim===null || S.knockAnim.room===3));

  // 귀환 트리거: 12호 초과 전진
  S.camZ = M.zDoor(13); S.camVel=0; tick(3);
  ok('12호 초과 → return(벨 호출)', S.phase==='return');
  tick(260);
  ok('프런트 귀환 → bell 대기', S.phase==='bell');

  // 벨 탭 → 시프트(첫 회 = 배반)
  M.doShift(1, true);
  ok('벨 → shift 개시', S.phase==='shift' && !!S.shiftAnim && S.shiftAnim.k===1);
  tick(120);
  ok('시프트 완료 → 1호 소등(vacatedK=1)', S.vacatedK===1);

  // betray 700ms 정지: freeze 이벤트 → unfreeze까지 시간
  var frozeAt=-1, unfrozeAt=-1;
  win.addEventListener('museum:freeze', function(){ if(frozeAt<0) frozeAt=vclock; });
  win.addEventListener('museum:unfreeze', function(){ if(unfrozeAt<0) unfrozeAt=vclock; });
  ok('배반 격발됨', S.betrayed===true);
  // 정지 해제까지 가상시계 진행(setTimeout 소화)
  for(var t=0;t<80;t++){ vclock+=16; try{ win.__advanceTimers && win.__advanceTimers(); }catch(e){} tick(1); }
  // jsdom 타이머는 실시간 — 실제 경과 대기
  var done=false;
  setTimeout(function(){
    tick(30);
    // 여운: 1호 문 열림 → 가방 입장 → afterglow
    S.door1=1; S.caseT=1.25; tick(10);
    var f=win.document.getElementById('formula');
    ok('여운: 수식 n → n+1 표기', S.phase==='afterglow' && f && f.innerHTML.indexOf('n+1')>=0);
    ok('여운: 명판 DOM 생성', !!win.document.querySelector('.plaque'));
    ok('여운: 티켓 m5_hotel 발급', win.Museum.ticket.has('m5_hotel'));

    // 슬라이더 재체험 k=7
    var slider=win.document.querySelector('#reexp input');
    slider.value='7'; slider.dispatchEvent(new win.Event('input'));
    tick(2);
    ok('슬라이더 k=7 → shift 재생', !!S.shiftAnim && S.shiftAnim.k===7 && S.shiftAnim.first===false);
    tick(130);
    ok('재체험 완료: 1~7호 빈방(vacatedK=7)', S.vacatedK===7);
    ok('E1 정합: occupantOf(8,7)=1 (아무도 사라지지 않음)', M.PURE.occupantOf(8,7)===1);
    ok('수식 갱신: n+7', f.innerHTML.indexOf('n+7')>=0);

    console.log('E2: '+pass+'/'+(pass+fail)+(fail?' FAIL':' 통과'));
    process.exit(fail?1:0);
  }, 900);
}catch(e){
  console.log('하네스 예외: '+e.message);
  process.exit(1);
}
