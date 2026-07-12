/* run_yearcal_e2.js — S2 지구의 1년 E2 무대 실부팅 검증
   jsdom으로 ex02_year.html 실행 → 찢기·이양·사건 정지·재귀 펼침·자정→betray 700ms·여운·슬라이더 환산·자유 넘김 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex02_year.html'),'utf8');
var museumJs=fs.readFileSync(path.join(__dirname,'..','core','museum.js'),'utf8');
html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');

function gradientStub(){ return { addColorStop:function(){} }; }
function ctxStub(){
  var c={ globalAlpha:1, textAlign:'left', font:'' };
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex02_year.html',
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
  var M=win.__S2, S=M.S, P=M.PURE;
  ok('부팅: __S2 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 사건 목록 = E1 정렬 그대로', M.EV.length===P.EVENTS.length && M.EV[0].id==='earth');
  tick(3);
  ok('초기 phase = boot · 1월 1일', S.phase==='boot' && S.sec===0);

  // 첫 터치 → tear
  var down=new win.Event('pointerdown'); down.clientX=680; down.clientY=400; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('첫 터치 → tear(찢기의 시간)', S.phase==='tear');

  // 손 찢기: 한 장 = 하루 — 아무것도 없다
  M.tear(); tick(2);
  ok('찢기 1장 = 하루 전진', S.sec===P.SEC_DAY);
  var c=P.calOf(S.sec);
  ok('달력 = 1월 2일 (E1 정합)', c.m===1 && c.d===2);
  for(var i=0;i<9;i++) M.tear();
  tick(2);
  ok('열 장 = 열흘 — 불덩이와 돌뿐, 생명 없음', S.handTears===10 && (!S.lastEvent || S.lastEvent.kind==='cosmos'));

  // 이양: 달력이 손을 이어받는다
  tick(90);
  ok('열 장 뒤 → 자동 넘김(이양)', S.phase==='auto');
  var secD=S.sec;
  M.tear(); tick(1);
  ok('이양 중 손 찢기 무시', S.sec>=secD && S.handTears===10);

  // 자동 항해: 사건의 장에서 정지 + 분필 소문(E1 정합)
  tick(40);
  ok('자동 항해: 시간 전진', S.sec>secD);
  M.skipTo(P.eventSec({y:600000000})-5000);              // multi 직전으로 도약
  tick(30);
  ok('사건 정지: 다세포("점들이, 처음으로 모여 산다")', S.lastEvent && S.lastEvent.id==='multi');
  var cm=P.calOf(M.EV.filter(function(e){return e.id==='multi';})[0].sec);
  ok('사건 시각 = E1 정합(11월)', cm.m===11);

  // 재귀 펼침: 마지막 하루 = 시간의 장
  M.skipTo(P.SEC_YEAR-7200); tick(6);
  var lb=M.labelOf(S.sec);
  ok('재귀 펼침: 마지막 하루의 장 = "12월 31일"', lb.big==='12월 31일');

  // 사피엔스 — 23시 25분의 장
  M.skipTo(P.SEC_YEAR-2100); tick(30);
  ok('사피엔스의 장: "뒤를 돌아본다"', S.lastEvent && S.lastEvent.id==='sapiens');
  var cs=P.calOf(M.EV.filter(function(e){return e.id==='sapiens';})[0].sec);
  ok('사피엔스 = 12/31 23:25 (E1 정합)', cs.m===12 && cs.d===31 && cs.hh===23 && cs.mm===25);

  // 마지막 초들 → 자정 → betray
  M.skipTo(P.SEC_YEAR-3); tick(60);
  ok('자정 → 배반 발화', S.betrayed===true);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms(실타이머) 경과 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__S2, S=M.S, P=M.PURE;
    tick(8);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    ok('여운 후 입력 해제', win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운 수식(마지막 4초)', f && /마지막 4초/.test(f.innerHTML));
    ok('전제 한 줄 표시됨', win.document.getElementById('premise').classList.contains('is-in'));
    ok('명판(11시 25분 도착)', /11시 25분/.test(win.document.body.innerHTML));
    ok('티켓 s2_year 발급', win.localStorage.getItem('kmuseum.tickets') && /s2_year/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더 = 아무 날짜나 짚기 — E1 즉석 환산 정합
    var slider=win.document.querySelector('#reexp input');
    slider.value='134'; slider.dispatchEvent(new win.Event('input')); tick(3);
    var c=P.calOf(S.sec);
    ok('짚기: 134일째 = 5월 14일', c.m===5 && c.d===14);
    var ya=P.yearsAgoOf((134-1)*P.SEC_DAY+P.SEC_DAY*0.5);
    ok('환산 분필 = E1 정합(약 '+(ya/1e8).toFixed(1)+'억 년 전)',
       M.pickText()==='약 '+(ya/1e8).toFixed(1).replace(/\.0$/,'')+'억 년 전');
    slider.value='365'; slider.dispatchEvent(new win.Event('input')); tick(3);
    var c2=P.calOf(S.sec);
    ok('짚기: 365일째 = 12월 31일', c2.m===12 && c2.d===31);

    // 자유 넘김: 재배반 없음
    var move=new win.Event('pointermove');
    var dn=new win.Event('pointerdown'); dn.clientX=680; dn.clientY=300; dn.pointerId=2;
    win.document.getElementById('stage-canvas').dispatchEvent(dn);
    move.clientX=680; move.clientY=500;
    win.document.getElementById('stage-canvas').dispatchEvent(move);
    win.dispatchEvent(new win.Event('pointerup'));
    tick(4);
    ok('여운 자유 넘김: sec 이동·재배반 없음', S.phase==='after' && win.Museum.isLocked()===false);

    // freeze 존중
    var t0=S.time;
    win.dispatchEvent(new win.Event('museum:freeze'));
    tick(6);
    ok('freeze 존중: 시간 정지', S.time===t0);
    win.dispatchEvent(new win.Event('museum:unfreeze'));
    tick(3);
    ok('unfreeze: 시간 재개', S.time>t0);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
