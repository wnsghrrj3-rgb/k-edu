/* run_map_e2.js — S8 거짓말하는 지도 E2 무대 실부팅 검증
   jsdom으로 ex08_map.html 실행 → 끌어내리기·예측 심기(적도권 무변화)·그린란드 수축·적도 안착·
   기계의 밤 이양·betray 700ms·여운 수치 해금·위도 슬라이더·재이동·freeze 존중 검사. */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var html=fs.readFileSync(path.join(__dirname,'..','social','ex08_map.html'),'utf8');
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
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://keduclass.com/museum/social/ex08_map.html',
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
function screenArea(M,id){ return M.PURE.planarArea(M.shapeOf(id)); }

try{
  var M=win.__S8, S=M.S, P=M.PURE;
  ok('부팅: __S8 노출', !!M && !!S);
  ok('부팅: Museum API', !!win.Museum && typeof win.Museum.betray==='function');
  tick(3);
  ok('초기 phase = boot · 전 나라 제자리', S.phase==='boot'
     && P.ORDER.every(function(id){ return S.lat[id]===P.DATA[id].lat0 && !S.moved[id]; }));

  // ── 1막: 지도의 거짓말이 화면에 이미 서 있다 ─────────────────────
  var gScr=screenArea(M,'greenland'), cScr=screenArea(M,'congo');
  ok('1막: 화면에서 그린란드 > 콩고 ×10 (실측 '+(gScr/cScr).toFixed(1)+'배) — 실제는 더 작다',
     gScr/cScr>10 && P.km2('greenland')<P.km2('congo'));

  // ── 2막: 초대 전 그린란드는 잡히지 않는다 ────────────────────────
  ok('초대 전 그린란드 잡기 불가(hit 제외)', S.phase==='boot' && (function(){
      var rs=M.shapeOf('greenland'), p={x:M.sx(rs[0][0][0]), y:M.sy(rs[0][0][1])};
      return M.hit(p)!=='greenland';
    })());
  ok('북쪽(러시아·캐나다·스칸디나비아)은 손에 잡히지 않는다 — 기계의 몫',
     M.AUTO_IDS.every(function(id){
       var rs=M.shapeOf(id), c=rs[0][0];
       return M.hit({x:M.sx(c[0]), y:M.sy(c[1])})!==id;
     }));

  // ── ★2막 손의 촉감 — 잡은 자리가 손에 붙는다(오프셋) ─────────────
  // 회귀 방어: 오프셋 없이 커서 위도를 나라 위도에 대입하면
  //   브라질 남반부를 잡을 때 클램프에 걸려 제자리(무반응), 북반부를 잡으면 순간이동한다.
  var bHome=M.homeLimit('brazil');                       // -14.3
  M.grab('brazil', -30);                                 // 남단을 잡았다(중심보다 한참 남쪽)
  ok('★잡는 순간 나라가 튀지 않는다', Math.abs(S.lat.brazil-bHome)<1e-9);
  M.dragTo(-30 + S.grabOff); tick(1);                    // 손이 그 자리 그대로
  ok('★손이 멈추면 나라도 멈춘다', Math.abs(S.lat.brazil-bHome)<1e-9);
  M.dragTo(-20 + S.grabOff); tick(1);                    // 손을 정확히 10도 북쪽으로
  ok('★손이 간 만큼만 나라가 간다 (오프셋 보존)', Math.abs(S.lat.brazil-(bHome+10))<1e-6);
  M.release(); tick(1);

  // ── ★2막 손의 밴드 — 끌리는 폭이 실제로 있다 ────────────────────
  // 회귀 방어: "제 위도↔적도"로만 묶으면 콩고는 4도(수십 px)뿐이라 조작이 성립하지 않는다.
  M.grab('congo', 0);
  M.dragTo(60); tick(1);  var cHi=S.lat.congo;
  M.dragTo(-60); tick(1); var cLo=S.lat.congo;
  M.release(); tick(1);
  ok('★적도권 나라는 남북 양방향으로 끌린다 (콩고 스팬 '+(cHi-cLo).toFixed(0)+'° ≥ 40°)', (cHi-cLo)>=40);
  ok('★밴드 안에서만 — 배반은 새어나가지 않는다', cHi<=25.001 && cLo>=-25.001);

  // ── ★잡을 수 있는 것은 손이 먼저 안다(hover) ────────────────────
  var canvasEl=win.document.getElementById('stage-canvas');
  function toClient(lx,ly){
    var sc=Math.min(1366/1600, 768/900);
    return { x: lx*sc + (1366-1600*sc)/2, y: ly*sc + (768-900*sc)/2 };
  }
  function pmove(lx,ly){
    var c=toClient(lx,ly);
    var e=new win.Event('pointermove'); e.clientX=c.x; e.clientY=c.y; e.pointerId=1;
    canvasEl.dispatchEvent(e);
  }
  pmove(M.sx(-50), M.sy(S.lat.brazil-10));               // 브라질 위
  ok('★나라 위에서 손이 열린다', S.hover==='brazil' && canvasEl.classList.contains('is-over'));
  pmove(M.sx(-30), M.sy(-40));                           // 남대서양 — 아무것도 없다
  ok('★빈 바다에서는 손이 닫힌다', S.hover===null && !canvasEl.classList.contains('is-over'));
  pmove(M.sx(-42), M.sy(72));                            // 그린란드 — 초대 전
  ok('★초대 전 그린란드는 손에 안 잡힌다', S.hover===null);

  // ── 2막: 예측 심기 — 적도권은 끌어내려도 거의 그대로 ─────────────
  var plant=['brazil','australia','india'];
  var worst=0;
  plant.forEach(function(id){
    var before=screenArea(M,id);
    M.grab(id); M.dragTo(0); tick(1);
    var after=screenArea(M,id);
    var chg=Math.abs(after-before)/before;
    if(chg>worst) worst=chg;
    M.release(); tick(1);
  });
  ok('★예측 심기: 적도권 3국은 적도로 끌어내려도 화면 변화 25% 미만 (최악 '+(100*worst).toFixed(0)+'%)', worst<0.25);
  ok('스프링 복귀: 손 떼면 제자리로', plant.every(function(id){
     return Math.abs(S.lat[id]-P.DATA[id].lat0)<1e-9; }));
  ok('떠난 자리 = 유령 윤곽 기록(moved)', plant.every(function(id){ return S.moved[id]===true; }));
  ok('세 나라를 끌어본 뒤 → 그린란드 초대', S.handMoves>=M.HAND_NEEDED && S.invited===true);

  // ── 3막: 그린란드 — 끌수록 쪼그라든다 ────────────────────────────
  ok('초대 후 그린란드 잡기 가능', (function(){
      var rs=M.shapeOf('greenland'), p={x:M.sx(rs[0][0][0]), y:M.sy(rs[0][0][1])};
      return M.hit(p)==='greenland';
    })());
  var g0=screenArea(M,'greenland');
  M.grab('greenland');
  M.dragTo(40); tick(1);
  var g40=screenArea(M,'greenland');
  M.dragTo(0); tick(1);
  var g00=screenArea(M,'greenland');
  ok('★수축: 끌수록 작아진다 (제자리 > 북위40 > 적도)', g0>g40 && g40>g00);
  ok('★배반의 크기: 적도에서 화면 1/9 이하 (실측 1/'+(g0/g00).toFixed(1)+')', g0/g00>9);
  ok('★지구 위에서는 하나도 줄지 않았다: 구면 면적 불변',
     Math.abs(P.sphericalArea(M.shapeOf('greenland'))-P.sphericalArea(P.rings('greenland')))
       / P.sphericalArea(P.rings('greenland')) < 1e-9);

  // 적도 안착 — 스프링 복귀 없음
  M.release(); tick(1);
  ok('★적도 안착: 눌러앉는다(복귀 없음) → settled', S.lat.greenland===0 && S.phase==='settled');

  // 안착 중 입력 차단
  var before=S.lat.brazil;
  var down=new win.Event('pointerdown'); down.clientX=400; down.clientY=400; down.pointerId=1;
  win.document.getElementById('stage-canvas').dispatchEvent(down);
  tick(1);
  ok('안착 정적 중 손 무시', S.grabbed===null && S.lat.brazil===before);

  // ── 4막: 기계의 밤 ───────────────────────────────────────────────
  M.startAuto(); tick(1);
  ok('이양: phase = auto', S.phase==='auto');
  var norths=M.AUTO_IDS.map(function(id){ return screenArea(M,id); });
  var guard=0;
  while(S.phase==='auto' && guard++<4000){ M.autoTick(0.05); }
  ok('기계의 밤: 북쪽 다섯 나라가 모두 적도로 내려왔다',
     M.AUTO_IDS.every(function(id){ return Math.abs(S.lat[id])<1e-6 && S.moved[id]; }));
  var shrank=M.AUTO_IDS.every(function(id,i){ return screenArea(M,id) < norths[i]*0.75; });
  ok('★북쪽은 전부 쪼그라들었다(화면 25% 이상 축소)', shrank);
  ok('구면 면적은 전부 불변 — 지도만 거짓말했다',
     M.AUTO_IDS.every(function(id){
       var base=P.sphericalArea(P.rings(id));
       return Math.abs(P.sphericalArea(M.shapeOf(id))-base)/base < 1e-9; }));
  ok('마지막 안착 → betray 진입', S.betrayed===true && (S.phase==='betrayed'||S.phase==='after'));

  // ── betray 700ms 정지 ────────────────────────────────────────────
  ok('배반 중 무대 잠금(isLocked)', S.phase==='after' || win.Museum.isLocked());
  setTimeout(function(){
    tick(4);
    ok('★betray 후 여운 진입(700ms 정지 후 해제)', S.phase==='after' && !win.Museum.isLocked());

    var f=win.document.getElementById('formula');
    ok('여운 문장', /한 뼘도 줄지 않았다/.test(f.textContent));
    ok('★여운 수치 해금: 그린란드·아프리카·열네 배',
       /2,166,086/.test(f.textContent) && /30,370,000/.test(f.textContent) && /열네 배/.test(f.textContent));
    ok('★여운: 콩고민주공화국이 그린란드보다 크다',
       /콩고민주공화국/.test(f.textContent) && /그린란드보다 크다/.test(f.textContent));
    ok('티켓 발급 s8_map', (win.localStorage.getItem('kmuseum.tickets')||'').indexOf('s8_map')>=0);
    ok('재체험 손잡이 노출', win.document.getElementById('reexp').className.indexOf('is-in')>=0);

    // ── 여운: 위도 손잡이 ──────────────────────────────────────────
    S.picked='greenland';
    M.setLatBySlider(0); tick(1);
    var a0=screenArea(M,'greenland');
    M.setLatBySlider(60); tick(1);
    var a60=screenArea(M,'greenland');
    ok('★위도 손잡이: 북위 60도 → 화면 네 배 안팎 (실측 '+(a60/a0).toFixed(1)+'배 · E1 sec²60 = 4)',
       a60/a0>3.2 && a60/a0<5.2);
    ok('분필 즉석 = E1 정합', /북위 60도/.test(M.chalkLat()) && /네 배로 부푼다/.test(M.chalkLat()));
    M.setLatBySlider(0); tick(1);
    ok('적도에서는 있는 그대로', /적도에서는, 있는 그대로/.test(M.chalkLat()));
    M.setLatBySlider(80); tick(1);
    ok('★극 안전 구간: 슬라이더 80도도 극을 넘지 않는다',
       P.inSafe('greenland', S.lat.greenland)
       && P.maxAbsLat(M.shapeOf('greenland'))<=P.LIMIT+1e-9);

    // 남반구 나라는 남쪽으로
    S.picked='australia';
    M.setLatBySlider(50); tick(1);
    ok('남반구는 남위로 (부호 유지)', S.lat.australia<0 && Math.abs(S.lat.australia+50)<1e-9);

    // 재이동 — 재배반 없음
    var cs0=screenArea(M,'congo');
    M.grab('congo'); M.dragTo(60); M.release(); tick(2);
    ok('★여운 재이동: 적도의 콩고를 북위 60도로 → 화면에서 부푼다 (실측 '
       +(screenArea(M,'congo')/cs0).toFixed(1)+'배) · 재배반 없음',
       S.phase==='after' && S.lat.congo>55 && screenArea(M,'congo')/cs0>3.0);

    // freeze 존중
    win.dispatchEvent(new win.Event('museum:freeze'));
    tick(1);
    var t0=S.time;
    tick(3);
    ok('freeze 존중: 무대 시간 정지', S.time===t0);
    win.dispatchEvent(new win.Event('museum:unfreeze'));

    console.log('\nS8 거짓말하는 지도 — E2: '+pass+'/'+(pass+fail)+' 통과');
    if(fail) process.exit(1);
  }, 1100);

  // betray 700ms 대기 동안 프레임 공급
  var iv=setInterval(function(){ tick(1); }, 16);
  setTimeout(function(){ clearInterval(iv); }, 1050);

}catch(e){
  console.log('E2 예외: '+e.message+'\n'+e.stack);
  process.exit(1);
}
