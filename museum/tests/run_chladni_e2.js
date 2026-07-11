/* run_chladni_e2.js — C2 소리가 그리는 그림 E2 무대 실부팅 검증
   jsdom으로 ex02_chladni.html 실행 → 문지름·공명 아래 흩어짐·자기조직(평균 |χ| 하강)·
   손 세 곡→자동 이양·최종 정착→betray 700ms·여운·슬라이더·재문지름 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','science','ex02_chladni.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/science/ex02_chladni.html',
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
function tick(times, pump){ for(var t=0;t<times;t++){
  if(pump && win.__C2) win.__C2.pump(1);
  var q=rafQueue; rafQueue=[];
  for(var i=0;i<q.length;i++){ try{ q[i](nowFn()); }catch(e){ process.stdout.write('rAF err: '+e.message+'\n'); } } } }

try{
  var M=win.__C2, S=M.S, PURE=M.PURE;
  ok('부팅: __C2 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  ok('부팅: 모래 2,400알 · 판 안', (function(){
    if(M.G!==2400) return false;
    for(var i=0;i<M.G;i+=97){ var g=M.grains(i); if(g.x<0||g.x>1||g.y<0||g.y>1) return false; }
    return true;
  })());
  ok('부팅: 열두 곡 · 최종 인덱스', PURE.count===12 && M.FINAL===11);
  tick(3);
  ok('초기 phase = boot · 공명 아래 조율', S.phase==='boot' && S.tune<-0.5);

  // 문지르다 → 전제 + rub
  var down=new win.Event('pointerdown'); down.clientX=683; down.clientY=380; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  M.rubStart(); tick(2);
  ok('문지름 시작 → rub', S.phase==='rub');
  var prem=win.document.getElementById('premise');
  ok('전제 한 줄 등장', prem && prem.classList.contains('is-in'));

  // 공명 아래: 드라이브는 있는데 잠금은 없다 — 모래는 흩어질 뿐
  var amp0=M.meanAmp();
  tick(12, true);
  ok('공명 아래: drive>0 · lock=0 (문지르면 튈 뿐)', S.drive>0.5 && S.lock===0 && S.tune>M.TUNE0);
  ok('공명 아래: 무늬 없음(평균 |χ| 정체)', Math.abs(M.meanAmp()-amp0)<0.12);

  // 첫 공명 — 자기조직
  M.jumpTune(-0.01); tick(2, true);
  ok('첫 공명: lock>0.8 · 첫 곡', S.lock>0.8 && S.modeIdx===0);
  var ampBefore=M.meanAmp();
  tick(260, true);
  var ampAfter=M.meanAmp();
  ok('★ 자기조직: 평균 |χ| 하강(E1 정합, '+ampBefore.toFixed(2)+'→'+ampAfter.toFixed(2)+')', ampAfter < ampBefore*0.72);
  ok('모래는 판을 벗어나지 않는다', (function(){
    for(var i=0;i<M.G;i+=53){ var g=M.grains(i); if(g.x<0||g.x>1||g.y<0||g.y>1) return false; }
    return true;
  })());

  // 손 세 곡 뒤 — 판이 스스로 운다
  M.jumpTune(M.HAND_LIMIT-0.005); tick(4, true);
  ok('세 곡 뒤: 판이 스스로 운다(auto 이양)', S.phase==='auto');
  var down2=new win.Event('pointerdown'); down2.clientX=683; down2.clientY=380; down2.pointerId=2;
  win.document.getElementById('stage-canvas').dispatchEvent(down2);
  tick(2);
  ok('판이 우는 동안은 끊지 않는다(입력 무시)', S.phase==='auto');

  // 자동 스윕: 조율이 스스로 오른다
  var tuneA=S.tune; tick(40);
  ok('자동 스윕: 조율 자가 전진', S.tune>tuneA);

  // 최종 곡 정착 → 배반
  M.jumpTune(M.FINAL); tick(900);
  ok('마지막 별 완성 → 배반 발동', S.betrayed===true && S.phase==='betrayed');
  ok('배반 프레임: 최종 곡', S.modeIdx===M.FINAL);
  ok('배반 중 입력 잠금', win.Museum.isLocked()===true);
} catch(e){
  process.stdout.write('예외: '+e.message+'\n'+e.stack+'\n'); fail++;
}

// betray 700ms 실타이머 소화 후 여운 검사
setTimeout(function(){
  try{
    var M=win.__C2, S=M.S;
    tick(6);
    ok('여운 진입(betray 700ms 경유)', S.phase==='after');
    var f=win.document.getElementById('formula');
    ok('여운 수식(피했을 뿐·그림)', f && /피했을 뿐이다/.test(f.innerHTML) && /그림/.test(f.innerHTML));
    ok('명판(1787)', /1787/.test(win.document.body.innerHTML));
    ok('티켓 c2_chladni 발급', win.localStorage.getItem('kmuseum.tickets') && /c2_chladni/.test(win.localStorage.getItem('kmuseum.tickets')));
    var re=win.document.getElementById('reexp');
    ok('재체험 슬라이더 등장', re && re.classList.contains('is-in'));

    // 슬라이더: 곡 직접 선택
    var slider=win.document.querySelector('#reexp input');
    slider.value='1'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('슬라이더: 첫 곡 재선택', S.modeIdx===0 && S.lock===1);
    slider.value='7'; slider.dispatchEvent(new win.Event('input')); tick(3);
    ok('슬라이더: 일곱 번째 곡', S.modeIdx===6);

    // 재문지름: 모래가 튀었다가 같은 무늬로 귀향 · 재배반 없음
    var down3=new win.Event('pointerdown'); down3.clientX=683; down3.clientY=380; down3.pointerId=3;
    win.document.getElementById('stage-canvas').dispatchEvent(down3);
    M.pump(1); tick(240, true);
    ok('여운 재문지름: 드라이브 유입·정렬 유지 방향', S.phase==='after' && M.meanAmp()<0.8);
    ok('재배반 없음 · 잠금 해제', S.betrayed===true && win.Museum.isLocked()===false);

    // freeze 존중
    var t0=S.time;
    win.dispatchEvent(new win.Event('museum:freeze'));
    win.Museum._locked=true;
    tick(6);
    ok('freeze 존중: 시간 정지', S.time===t0);
    win.Museum._locked=false;
    win.dispatchEvent(new win.Event('museum:unfreeze'));
    tick(3);
    ok('unfreeze: 시간 재개', S.time>t0);

    process.stdout.write('E2: '+pass+'/'+(pass+fail)+(fail? ' — 실패 '+fail : ' 통과')+'\n');
    process.exit(fail?1:0);
  } catch(e){
    process.stdout.write('마무리 예외: '+e.message+'\n'); process.exit(1);
  }
}, 1200);
