/* run_anamorph_e2.js — A2 엉망진창의 정체 E2 무대 실부팅 검증
   jsdom으로 ex02_anamorph.html 실행 → 보행·낙서 월드 불변·초대·도킹 이양·잠금→안착→betray 700ms·여운·슬라이더·재보행 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','art','ex02_anamorph.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/art/ex02_anamorph.html',
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
function artSnapshot(M){
  return M.art().map(function(s){ return [s.a.x,s.a.y,s.b.x,s.b.y].map(function(v){ return v.toFixed(6); }).join(','); }).join('|');
}

try{
  var M=win.__A2, S=M.S, P=M.PURE;
  ok('부팅: __A2 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 낙서 12선분·전부 바닥(z=0)', M.art().length===12 && M.art().every(function(s){ return s.a.z===0 && s.b.z===0; }));
  tick(3);
  ok('초기 phase = boot · 첫 자리는 설계 자리에서 멀다', S.phase==='boot' && Math.abs(S.th-S.thE)>1);

  // 시작 자리 = 확실한 엉망 (E1 정합)
  ok('시작 엉망 실증: misalign ≥ TOL×5', P.misalign(S.th,S.thE)>=P.TOL_LOCK*5);

  // 첫 터치 → walk
  var down=new win.Event('pointerdown'); down.clientX=500; down.clientY=400; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(2);
  ok('첫 터치 → walk', S.phase==='walk');

  // 보행: th 전진 + 낙서는 월드 고정
  var snap0=artSnapshot(M), th0=S.th;
  M.walkBy(0.3); tick(3);
  ok('보행: th 전진', Math.abs(S.th-th0-0.3)<1e-9);
  ok('정직: 낙서는 월드에서 1px도 안 움직임', artSnapshot(M)===snap0);

  // 누적 보행 → 놋쇠 발자국 초대
  for(var w=0; w<30 && !S.invite; w++){ M.walkBy(w%2? 0.09 : -0.05); tick(2); }
  ok('누적 보행 → 초대(놋쇠 발자국)', S.invite===true);
  ok('초대 시점엔 아직 배반 없음', S.betrayed===false);

  // 방치 2.5s → 자동 도킹(이양)
  tick(170);
  ok('방치 → 자동 도킹 시작', S.docking===true);
  var thD=S.th;
  M.walkBy(0.5); tick(1);
  ok('도킹 중 손 입력 무시(이양)', Math.abs(S.th-thD)<0.02);

  // 도킹 → 잠금창 진입 → 철컥 안착 → betray
  var reached=false;
  for(var d=0; d<40 && !reached; d++){ tick(20); if(S.phase==='settle'||S.phase==='betrayed'||S.betrayed) reached=true; }
  ok('도킹 → 잠금창 진입(안착 개시)', reached);
  tick(40);
  ok('안착 종점 = 정확히 설계 자리·배반 발화', S.betrayed===true && Math.abs(S.th-S.thE)<1e-6);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms(실타이머) 경과 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__A2, S=M.S, P=M.PURE;
    tick(8);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    ok('여운 후 입력 해제', win.Museum.isLocked()===false);
    var f=win.document.getElementById('formula');
    ok('여운 수식(그 자리에 섰을 뿐)', f && /그 자리에 섰을 뿐/.test(f.innerHTML));
    ok('전제 한 줄 표시됨', win.document.getElementById('premise').classList.contains('is-in'));
    ok('명판(홀바인 1533)', /1533/.test(win.document.body.innerHTML));
    ok('티켓 a2_anamorph 발급', win.localStorage.getItem('kmuseum.tickets') && /a2_anamorph/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 여운 재보행: 벗어났다 재도착해도 재배반 없음
    M.walkBy(-0.6); tick(4);
    ok('여운 재보행 허용·자리 이탈', S.arrived===false && S.phase==='after');
    M.setTheta(S.thE+0.001); tick(4);
    ok('재도착 = 딸깍만·재배반 없음', S.arrived===true && S.betrayed===true && win.Museum.isLocked()===false);

    // 슬라이더 = 숨은 자리 옮기기 → 다시 엉망
    var snapOld=artSnapshot(M);
    var slider=win.document.querySelector('#reexp input');
    slider.value='90'; slider.dispatchEvent(new win.Event('input')); tick(4);
    ok('슬라이더: 새 설계 자리 thE=0.90', Math.abs(S.thE-0.90)<1e-9);
    ok('슬라이더: 낙서가 새로 눕고(재투영) 초대 리셋', artSnapshot(M)!==snapOld && S.invite===false && S.arrived===false);
    ok('슬라이더: 지금 자리는 다시 엉망(E1 정합)', P.misalign(S.th,S.thE)>=P.TOL_LOCK*5);

    // 새 자리 재도착 — 역시 재배반 없음
    M.setTheta(0.90); tick(4);
    ok('새 숨은 자리 재발견 = 딸깍만', S.arrived===true && win.Museum.isLocked()===false);

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
