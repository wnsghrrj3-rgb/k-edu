/* run_birthday_e2.js — M10 생일 쌍둥이 E2 무대 실부팅 검증(견고 하네스)
   jsdom으로 ex10_birthday.html 실행 → 전제·수동 점화·강제 생일 충돌→정적 400ms→
   플레어→배반 700ms→여운(빈 촛대 수 실측)·티켓→슬라이더 정확 천분율을 검사.
   시간 축은 M.tick(dt) 직접 구동 — 무작위 자동 입장과 무관하게 결정론으로 몬다. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','math','ex10_birthday.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/math/ex10_birthday.html',
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
// 시간 직접 구동 — dt 초 단위를 잘게 흘림(자동 입장 판정 경계까지 결정론)
function flow(M, seconds){ var step=0.05, n=Math.round(seconds/step);
  for(var i=0;i<n;i++) M.tick(step); }

try{
  var M=win.__M10, S=M.S, B=M.B;
  ok('부팅: __M10 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function' && typeof win.Museum.board==='function');
  ok('부팅: KMuseumBirthday 사상(pMatchPermille(23)=507)', !!B && B.pMatchPermille(23)===507);
  ok('부팅: §8.6 칠판 상주', !!win.__BOARD);
  tick(3);
  ok('초기 phase = enter (스포트 훑기)', S.phase==='enter');

  // 1막 — 전제 한 줄이 뜨는가
  flow(M, 2.6);
  ok('전제 등장: premise is-in', win.document.getElementById('premise').classList.contains('is-in'));

  // freeze 존중 — 배반의 700ms를 침범하지 않는 구조
  win.dispatchEvent(new win.CustomEvent('museum:freeze'));
  var t0=S.time; M.tick(0.5);
  ok('freeze 존중: 시간 정지', S.time===t0);
  win.dispatchEvent(new win.CustomEvent('museum:unfreeze'));
  M.tick(0.05);
  ok('unfreeze: 시간 재개', S.time>t0);

  // dayToCell — 월 경계 정합(1일=1월 첫 칸 · 32일=2월 첫 칸 · 365일=12월 31칸)
  ok('dayToCell 월 경계: 1→(0,0) · 32→(1,0) · 365→(11,30)', (function(){
    var a=M.dayToCell(1), b=M.dayToCell(32), c=M.dayToCell(365);
    return a.col===0&&a.row===0 && b.col===1&&b.row===0 && c.col===11&&c.row===30;
  })());

  // 2막 — 수동 점화 7명(생일 강제·전부 다른 날)
  var days7=[10,40,70,100,200,300,360];
  for(var i=0;i<7;i++){ M.admit(days7[i]); flow(M, 1.15); }
  ok('7명 점화: litCount=7·전 촛대 정위치', S.litCount===7 && days7.every(function(d){ return S.lit[d]; }));
  ok('파티 개시(첫 입장에 enter→party)', S.phase==='party');
  ok('아직 배반 전(모두 다른 생일)', B.firstCollision(S.days)===-1);

  // betray 700ms 정지: freeze/unfreeze 목격
  var froze=false, unfroze=false;
  win.addEventListener('museum:freeze', function(){ froze=true; });
  win.addEventListener('museum:unfreeze', function(){ unfroze=true; });

  // 4막 — 8번째 손님 생일 강제 충돌(10일): 걷기→정적 400ms→플레어→배반
  var g8=M.admit(10);
  ok('8번째 손님: 충돌 예약(collide)', !!g8 && g8.collide===true && g8.ord===8);
  flow(M, 1.15);
  ok('도착 → 정적(pause 400ms)', g8.state==='pause');
  flow(M, 0.45);
  ok('정적 끝 → 플레어(두 불꽃 합침)', g8.state==='flare');
  flow(M, 1.0);
  ok('플레어 완료 → 배반 격발', S.phase==='betrayed' && S.n===8 && S.collision && S.collision.day===10);
  ok('배반 순간 손님 정리', S.guests.length===0);
  ok('E1 정합: 입장 기록의 첫 충돌 = 8번째', B.firstCollision(S.days)===8);
  tick(3);   // betray 내부 rAF 소화 → 180+700ms 타이머 개시

  setTimeout(function(){
    tick(30);
    ok('배반 시퀀스: freeze→unfreeze 700ms 정지 목격', froze && unfroze);
    var f=win.document.getElementById('formula');
    ok('여운: after + n=8 표기', S.phase==='after' && f && f.innerHTML.indexOf('>8<')>=0);
    ok('여운: 빈 촛대 358 실측(365−7)', f.innerHTML.indexOf('>358<')>=0);
    ok('여운: 명판 DOM 생성', !!win.document.querySelector('.plaque'));
    ok('여운: 티켓 m10_birthday 발급', win.Museum.ticket.has('m10_birthday'));
    ok('칠판 회수: 답이 밝혀짐', win.__BOARD.isAfter());

    // 재체험 슬라이더 — E1 정확 천분율이 속삭임에 그대로
    var range=win.document.getElementById('reexp-range');
    range.value='50'; range.dispatchEvent(new win.Event('input'));
    var w=win.document.getElementById('reexp-whisper').innerHTML;
    ok('슬라이더 n=50 → 97.0% (pMatchPermille=970)', S.ghostN===50 && w.indexOf('97.0%')>=0 && B.pMatchPermille(50)===970);
    range.value='23'; range.dispatchEvent(new win.Event('input'));
    w=win.document.getElementById('reexp-whisper').innerHTML;
    ok('슬라이더 n=23 → 50.7% (절반의 이정표)', w.indexOf('50.7%')>=0);

    console.log('E2: '+pass+'/'+(pass+fail)+(fail?' FAIL':' 통과'));
    process.exit(fail?1:0);
  }, 1100);
}catch(e){
  console.log('하네스 예외: '+e.message);
  process.exit(1);
}
