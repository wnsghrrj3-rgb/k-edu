/* run_reach_gate.js — ★도달 게이트(§5.6) — 게이트는 전시 안만 보았지, 전시 밖을 보지 않았다.
   준호 지적으로 확진: 스물여덟 전시가 라이브인데
     · 허브에 뮤지엄으로 들어오는 링크가 하나도 없었고(URL을 직접 쳐야만 들어올 수 있었다)
     · 전시실에서 복도로 나가는 문이 하나도 없었다(티켓을 받아도 티켓북이 있는 로비로 갈 수 없었다).
   이 결함은 E1·E2·칠판 게이트·입력 게이트를 전부 통과하고도 살아남았다.
   전시를 짓는 것과, 사람이 오갈 수 있는 것은 다른 일이다.

   검사:
     ① 허브에서 뮤지엄으로 들어올 수 있다
     ② 로비에서 허브로 나갈 수 있다
     ③ 로비의 문이 전부 실재한다(깨진 문 0)
     ④ 실재하는 전시가 전부 로비에 걸려 있다(아무도 못 찾는 전시 0)
     ⑤ 전시 전부에서 로비로 나갈 수 있다(실부팅 — 문이 실제로 생기는가)
     ⑥ 나가는 문은 배반의 정적을 침범하지 않는다(museum:freeze에 숨는다)
     ⑦ 티켓 번호는 겹치지 않는다 */
'use strict';
var fs=require('fs'), path=require('path');
var { JSDOM } = require('jsdom');

var ROOT   = path.join(__dirname,'..','..');      // k-edu 루트
var MUSEUM = path.join(__dirname,'..');

var pass=0, fail=0;
function ok(name,cond){ if(cond) pass++; else { fail++; process.stdout.write('  x '+name+'\n'); } }

/* ── ① 허브 → 뮤지엄 ────────────────────────────────────────────── */
var hub = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
var hubLinks = (hub.match(/href="\/museum\/?"/g)||[]).length;
ok('① 허브에서 뮤지엄으로 들어올 수 있다', hubLinks > 0);
ok('① 입구는 역할을 고르기 전에 있다(학년 무관 헌법)',
   hub.indexOf('museum-door') > 0 && hub.indexOf('museum-door') < hub.indexOf('id="s-grade"'));

/* ── ② 로비 → 허브 ─────────────────────────────────────────────── */
var lobby = fs.readFileSync(path.join(MUSEUM,'index.html'),'utf8');
ok('② 로비에서 허브로 나갈 수 있다', /id="exit-door"/.test(lobby));

/* ── ③④ 로비의 문 ↔ 실재하는 전시 ──────────────────────────────── */
var doorUrls = [];
var re=/\{\s*type:'open',[^}]*url:'([^']+)'/g, m;
while((m=re.exec(lobby))) doorUrls.push(m[1]);

var broken = doorUrls.filter(function(u){ return !fs.existsSync(path.join(MUSEUM,u)); });
ok('③ 로비의 문이 전부 실재한다(깨진 문 '+broken.length+')', broken.length===0);
if(broken.length) broken.forEach(function(b){ process.stdout.write('      깨진 문: '+b+'\n'); });

var onDisk=[];
['math','science','art','social'].forEach(function(d){
  fs.readdirSync(path.join(MUSEUM,d)).forEach(function(f){
    if(/^ex\d+_.*\.html$/.test(f)) onDisk.push(d+'/'+f);
  });
});
var orphan = onDisk.filter(function(f){ return doorUrls.indexOf(f) < 0; });
ok('④ 실재하는 전시가 전부 로비에 걸려 있다(아무도 못 찾는 전시 '+orphan.length+')', orphan.length===0);
if(orphan.length) orphan.forEach(function(o){ process.stdout.write('      고아 전시: '+o+'\n'); });
ok('④ 문 수 = 전시 수 ('+doorUrls.length+' / '+onDisk.length+')', doorUrls.length===onDisk.length);

/* ── ⑦ 티켓 번호는 겹치지 않는다 ────────────────────────────────── */
var ids={}, dup=[], noGrant=[];
onDisk.forEach(function(f){
  var s=fs.readFileSync(path.join(MUSEUM,f),'utf8');
  if(s.indexOf('ticket.grant(') < 0){ noGrant.push(f); return; }
  // id를 변수로 넘기는 전시가 있다(M1 — 본편·히든 티켓을 한 함수로 준다).
  // 중복 검사는 리터럴 id만 대상으로 한다.
  var re=/ticket\.grant\(\s*\{\s*id:\s*'([^']+)'/g, t;
  while((t=re.exec(s))){ if(ids[t[1]]) dup.push(t[1]); else ids[t[1]]=f; }
});
ok('⑦ 전 전시가 티켓을 준다(미발급 '+noGrant.length+')', noGrant.length===0);
ok('⑦ 티켓 번호가 겹치지 않는다(중복 '+dup.length+')', dup.length===0);

/* ── ⑤⑥ 전시에서 로비로 — 실부팅 ──────────────────────────────── */
var museumJs=fs.readFileSync(path.join(MUSEUM,'core','museum.js'),'utf8');

function boot(file){
  var html=fs.readFileSync(path.join(MUSEUM,file),'utf8');
  html=html.replace('<script src="../core/museum.js"></script>','<script>\n'+museumJs+'\n</script>');
  html=html.replace(/<link[^>]*fonts\.googleapis[^>]*>/g,'').replace(/<link rel="preconnect"[^>]*>/g,'');
  var rafQueue=[], vclock=1000;
  function nowFn(){ vclock+=16; return vclock; }
  function gradientStub(){ return { addColorStop:function(){} }; }
  function ctxStub(){
    var c={ globalAlpha:1, textAlign:'left', font:'', lineWidth:1, fillStyle:'', strokeStyle:'', globalCompositeOperation:'source-over', filter:'none', lineCap:'butt', lineJoin:'miter', shadowBlur:0, shadowColor:'' };
    ['setTransform','clearRect','fillRect','strokeRect','beginPath','moveTo','lineTo',
     'arc','arcTo','stroke','fill','save','restore','translate','scale','rotate','closePath',
     'drawImage','quadraticCurveTo','bezierCurveTo','clip','rect','ellipse','setLineDash',
     'createPattern','putImageData','transform','resetTransform','fillText','strokeText'].forEach(function(k){ c[k]=function(){}; });
    c.measureText=function(t){ return {width:String(t).length*11}; };
    c.createRadialGradient=gradientStub; c.createLinearGradient=gradientStub;
    c.getImageData=function(){ return { data:new Uint8ClampedArray(4) }; };
    c.canvas={width:1366,height:768};
    return c;
  }
  var dom=new JSDOM(html,{
    runScripts:'dangerously', pretendToBeVisual:true,
    url:'https://keduclass.com/museum/'+file,
    beforeParse:function(win){
      win.HTMLCanvasElement.prototype.getContext=function(){ return ctxStub(); };
      win.HTMLCanvasElement.prototype.getBoundingClientRect=function(){ return {left:0,top:0,width:1366,height:768}; };
      win.HTMLCanvasElement.prototype.setPointerCapture=function(){};
      win.HTMLCanvasElement.prototype.releasePointerCapture=function(){};
      Object.defineProperty(win,'devicePixelRatio',{value:1});
      win.matchMedia=function(){ return {matches:false, addEventListener:function(){}, addListener:function(){}}; };
      win.requestAnimationFrame=function(fn){ rafQueue.push(fn); return rafQueue.length; };
      win.cancelAnimationFrame=function(){};
      if(!win.performance) win.performance={};
      win.performance.now=nowFn;
      function nodeStub(){ return { connect:function(){}, disconnect:function(){}, start:function(){}, stop:function(){},
        frequency:{value:0, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}},
        gain:{value:0, setValueAtTime:function(){}, exponentialRampToValueAtTime:function(){}, linearRampToValueAtTime:function(){}},
        type:'sine', buffer:null, loop:false, Q:{value:0}, detune:{value:0} }; }
      win.AudioContext=function(){ return {
        currentTime:0, destination:{}, sampleRate:44100, state:'running', resume:function(){},
        createOscillator:nodeStub, createGain:nodeStub, createBiquadFilter:nodeStub,
        createBufferSource:nodeStub, createBuffer:function(){ return { getChannelData:function(){ return new Float32Array(8); } }; },
        createDynamicsCompressor:nodeStub, createStereoPanner:nodeStub, createConvolver:nodeStub
      }; };
      win.localStorage.clear();
    }
  });
  var win=dom.window;
  function tick(sec){
    var steps=Math.max(1, Math.round(sec/0.016));
    for(var i=0;i<steps;i++){
      var q=rafQueue.slice(); rafQueue.length=0;
      q.forEach(function(fn){ try{ fn(vclock); }catch(e){} });
      nowFn();
    }
  }
  return { win:win, tick:tick };
}

var NAME={};
doorUrls.forEach(function(u){
  var t=/teaser:'([^']*)'/.exec((/\{[^}]*url:'/.source, lobby.split(u)[0].split('{ type:').pop()));
  NAME[u]=u;
});

onDisk.forEach(function(file){
  var b;
  try{ b=boot(file); }catch(e){ ok(file+' — 부팅', false); return; }
  b.tick(0.5);
  var win=b.win;
  var door = win.document.getElementById('exit-door');
  ok('⑤ '+file+' — 로비로 나갈 수 있다', !!door);
  if(!door) return;
  ok('⑤ '+file+' — 나가는 문이 로비를 가리킨다', /index\.html$|^\.\.\/$/.test(door.getAttribute('href')||''));

  // ⑥ 배반의 정적은 침범하지 않는다
  win.dispatchEvent(new win.Event('museum:freeze'));
  b.tick(0.05);
  var hidden = door.style.opacity === '0';
  win.dispatchEvent(new win.Event('museum:unfreeze'));
  b.tick(0.05);
  var back = door.style.opacity === '1';
  ok('⑥ '+file+' — 배반의 정적에 숨었다가 돌아온다', hidden && back);
});

console.log('\n도달 게이트: '+pass+'/'+(pass+fail)+' 통과  ('+onDisk.length+'전시 + 허브·로비)');
process.exit(fail ? 1 : 0);
