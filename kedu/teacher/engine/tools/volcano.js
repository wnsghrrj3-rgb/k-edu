/* ============================================================================
   케이랩 도구 모듈 — 화산과 지진 (volcano) v2  [과학 12호 · 지구 영역]
   4학년 화산과 지진. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   v2: 🌋 화산을 three.js 3D 무대로 — 황혼 하늘·별 아래, 안에서 차오르는 마그마 발광과
       분출 파티클(용암 분수+화산재 기둥+가스). 드래그 회전·휠/핀치 줌.
       (지진은 SVG 유지, 퀴즈 썸네일도 SVG. 학습 흐름·미션·퀴즈는 동일.)
   디지털 우위: 위험해서 못 보는 화산 분출·지진을 안전하게 입체로 체험.
   변수 → 현상 → 발견:
     ▸ 🌋 화산 — 🔥 버튼으로 마그마 방 압력을 키우면 분출! 분출물 3종
       (용암·화산재·화산 가스) 라벨을 클릭해 이름 확인.
       분출 후 🪨 빨리 식히기=현무암(구멍 송송) / 💎 천천히 식히기=화강암(알갱이 큼).
     ▸ 🌍 지진 — ➡️ 힘을 계속 가하면 땅이 휘다가 우지끈 끊어지며 흔들림.
       "땅이 큰 힘을 오래 받으면 끊어지면서 지진이 난다".
   미션 4종(분출/분출물 3종/암석 2종/지진) + 퀴즈 5문(마그마·용암·현무암·화강암·대처).
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('volcano', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, frame = 0;
    var C = { ink:'#1B3A57', sub:'#5a7894', hot:'#FA5252', lava:'#FF6B2C', lava2:'#FFD43B',
              rock:'#6E4226', rock2:'#8D6E63', sky:'#CDE8FF', ash:'#868E96',
              basalt:'#343A40', granite:'#E9D8C8', good:'#12B886', vio:'#7048E8' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }

    /* ───────────── 상태 ───────────── */
    var exp; // 'volcano' | 'quake'
    var vol, qk;
    function volReset(){ vol={ press:0, erupting:false, t:0, seen:{lava:false,ash:false,gas:false}, made:{basalt:false,granite:false} }; }
    function qkReset(){ qk={ stress:0, broken:false, t:0 }; }
    function resetAll(){ exp='volcano'; volReset(); qkReset(); }
    resetAll();
    var v3d=null; // 3D 화산 무대 컨트롤러

    function pump(){
      if(vol.erupting){ ui.toast(el,false,'이미 분출 중이에요! ↺ 새 화산으로'); return; }
      vol.press=Math.min(100,vol.press+20);
      if(vol.press>=100){ vol.erupting=true; vol.t=0; ui.toast(el,true,'🌋 콰과광! 화산이 분출했어요!'); }
      renderScene(); renderStatus(); checkMission();
    }
    function cool(kind){
      if(!vol.erupting){ ui.toast(el,false,'먼저 화산을 분출시켜야 해요!'); return; }
      vol.made[kind]=true;
      ui.toast(el,true, kind==='basalt' ? '🪨 표면에서 빨리 식어 현무암! 구멍이 송송'
                                        : '💎 땅속에서 천천히 식어 화강암! 알갱이가 커요');
      renderScene(); renderStatus(); checkMission();
    }
    function seeEjecta(k){
      vol.seen[k]=true;
      var M={ lava:'🔥 용암 — 마그마가 땅 위로 흘러나온 것!', ash:'🌫️ 화산재 — 잘게 부서진 돌가루가 하늘 높이!', gas:'💨 화산 가스 — 수증기 등 여러 기체!' };
      ui.toast(el,true,M[k]);
      renderScene(); renderStatus(); checkMission();
    }
    function push(){
      if(qk.broken){ ui.toast(el,false,'이미 끊어졌어요! ↺ 새 땅으로'); return; }
      qk.stress=Math.min(100,qk.stress+20);
      if(qk.stress>=100){ qk.broken=true; qk.t=0; ui.toast(el,true,'🌍 우지끈! 땅이 끊어지며 지진!'); }
      renderScene(); renderStatus(); checkMission();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { exp:'volcano', text:'🔥 <b style="color:#7048E8;">압력 키우기</b>를 눌러 마그마 방 압력을 100%로 — <b style="color:#7048E8;">화산 분출</b>!',
        check:function(){ return exp==='volcano' && vol.erupting; } },
      { exp:'volcano', text:'분출물 <b style="color:#7048E8;">용암·화산재·화산 가스</b> 라벨을 모두 눌러 이름을 확인해 봐요!',
        check:function(){ return exp==='volcano' && vol.erupting && vol.seen.lava && vol.seen.ash && vol.seen.gas; } },
      { exp:'volcano', text:'🪨 빨리 식혀 <b style="color:#7048E8;">현무암</b>, 💎 천천히 식혀 <b style="color:#7048E8;">화강암</b> — 둘 다 만들어 봐요!',
        check:function(){ return exp==='volcano' && vol.made.basalt && vol.made.granite; } },
      { exp:'quake', text:'➡️ <b style="color:#7048E8;">힘 가하기</b>를 계속 눌러 땅을 끊어 봐요 — <b style="color:#7048E8;">지진</b> 발생!',
        check:function(){ return exp==='quake' && qk.broken; } }
    ];
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1){
            mStep++;
            var keep=(MISSIONS[mStep].exp===exp); // 1→2→3은 같은 화산 상태 유지
            exp=MISSIONS[mStep].exp;
            if(!keep){ volReset(); qkReset(); }
          } else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { pic:'volcano', q:'땅속 깊은 곳에서 암석이 녹아 있는 것을 무엇이라고 할까요?', ch:['마그마','용암','화산재'], a:0 },
      { pic:'volcano', q:'마그마가 땅 위로 흘러나온 것을 무엇이라고 할까요?', ch:['용암','마그마','화산 가스'], a:0 },
      { pic:'volcano', q:'표면에서 빨리 식어 구멍이 송송 뚫린 어두운 암석은?', ch:['현무암','화강암','대리암'], a:0 },
      { pic:'volcano', q:'땅속 깊은 곳에서 천천히 식어 알갱이가 큰 암석은?', ch:['화강암','현무암','석회암'], a:0 },
      { pic:'quake', q:'건물 안에서 지진이 났을 때 가장 올바른 행동은?', ch:['책상 아래로 들어가 머리 보호','창문 옆에 서 있기','엘리베이터 타고 내려가기'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:20px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function expTabs(){
      var L=[['volcano','🌋 화산'],['quake','🌍 지진']];
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + L.map(function(x){ var on=(exp===x[0]);
            return '<button class="vc-exp" data-e="'+x[0]+'" style="font-size:20px;padding:10px 18px;border-radius:14px;border:3px solid '+C.hot+';cursor:pointer;font-weight:800;font-family:inherit;line-height:1;'
              +'background:'+(on?C.hot:'#fff')+';color:'+(on?'#fff':C.hot)+';">'+x[1]+'</button>'; }).join('')
        + '</div>';
    }
    function ctrlRow(){
      if(exp==='volcano'){
        var canCool=vol.erupting;
        return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="vc-btn" data-act="pump" style="'+btn+'background:#fff;color:'+C.hot+';border-color:'+C.hot+';">🔥 압력 키우기</button>'
          +'<button class="vc-btn" data-act="basalt" style="'+btn+(canCool?'background:#fff;color:'+C.ink+';border-color:'+C.basalt:'background:#f1f3f5;color:#adb5bd;border-color:#dee2e6')+';">🪨 빨리 식히기 → 현무암</button>'
          +'<button class="vc-btn" data-act="granite" style="'+btn+(canCool?'background:#fff;color:'+C.ink+';border-color:#C9A227':'background:#f1f3f5;color:#adb5bd;border-color:#dee2e6')+';">💎 천천히 식히기 → 화강암</button>'
          +'<button class="vc-btn" data-act="volReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 화산</button></div>';
      }
      return '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        +'<button class="vc-btn" data-act="push" style="'+btn+'background:#fff;color:'+C.vio+';border-color:'+C.vio+';">➡️ 힘 가하기</button>'
        +'<button class="vc-btn" data-act="qkReset" style="'+btn+'background:#fff;color:#666;border-color:#9aa;">↺ 새 땅</button></div>';
    }

    function build(){
      if(v3d){ v3d.dispose(); v3d=null; }
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=expTabs()+ctrlRow();
      el.innerHTML='<style>.vc-btn:active,.vc-exp:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}@keyframes vcShake{0%,100%{transform:translate(0,0);}20%{transform:translate(-7px,3px);}40%{transform:translate(6px,-3px);}60%{transform:translate(-5px,2px);}80%{transform:translate(4px,-2px);}}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="vc-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:radial-gradient(120% 120% at 50% 20%,#FCFEFF 0%,#EAF3FB 75%,#DCEAF6 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="vc-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; resetAll();
        if(m==='mission')exp=MISSIONS[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      renderScene(); bind(); renderStatus();
    }

    /* ───────────── 3D 화산 무대 (three.js) ─────────────
       황혼 하늘·별 아래, 안에서 차오르는 마그마 발광과 분출 파티클
       (용암 분수 + 화산재 기둥 + 가스). 드래그 회전·휠/핀치 줌. */
    function Volcano3D(host, opts){
      opts = opts || {};
      var T = window.THREE;
      function CW(){ return host.clientWidth || 800; }
      function CH(){ return host.clientHeight || 480; }
      var alive3 = true, raf3 = null, last = performance.now();
      var S = { press:0, erupting:false, seen:{}, made:{} };

      host.style.position = 'relative';
      var wrap = document.createElement('div');
      wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#23306a;';
      host.appendChild(wrap);

      var renderer = new T.WebGLRenderer({ antialias:true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(CW(), CH());
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:none;';
      wrap.appendChild(renderer.domElement);

      var scene = new T.Scene();
      var camera = new T.PerspectiveCamera(52, CW()/CH(), 0.1, 3000);

      // 하늘 돔(그라데이션)
      (function(){
        var c=document.createElement('canvas'); c.width=16; c.height=256; var g=c.getContext('2d');
        var grd=g.createLinearGradient(0,0,0,256);
        grd.addColorStop(0,'#1c2c60'); grd.addColorStop(.4,'#3c3a76'); grd.addColorStop(.68,'#71406a'); grd.addColorStop(.86,'#b65c4c'); grd.addColorStop(1,'#e89a54');
        g.fillStyle=grd; g.fillRect(0,0,16,256);
        var sky=new T.Mesh(new T.SphereGeometry(900,32,24), new T.MeshBasicMaterial({map:new T.CanvasTexture(c), side:T.BackSide, depthWrite:false}));
        scene.add(sky);
      })();
      // 별
      (function(){
        var N=1300, p=new Float32Array(N*3);
        for(var i=0;i<N;i++){ var th=Math.random()*Math.PI*2, ph=Math.acos(Math.random()*0.92+0.04);
          p[i*3]=820*Math.sin(ph)*Math.cos(th); p[i*3+1]=Math.abs(820*Math.cos(ph))*0.9+30; p[i*3+2]=820*Math.sin(ph)*Math.sin(th); }
        var gg=new T.BufferGeometry(); gg.setAttribute('position', new T.BufferAttribute(p,3));
        scene.add(new T.Points(gg, new T.PointsMaterial({color:0xffffff, size:1.7, sizeAttenuation:false, transparent:true, opacity:.85})));
      })();
      // 조명
      var amb=new T.AmbientLight(0x4a5578, 1.2); scene.add(amb);
      var hemi=new T.HemisphereLight(0xbfd0ff, 0x4a3a2c, 0.95); scene.add(hemi);
      var moon=new T.DirectionalLight(0xcfe0ff, 1.15); moon.position.set(-30,46,22); scene.add(moon);
      var glow=new T.PointLight(0xff5a1e, 0, 140, 2); glow.position.set(0,8,0); scene.add(glow);

      // 지면
      (function(){
        var c=document.createElement('canvas'); c.width=c.height=256; var g=c.getContext('2d');
        var rg=g.createRadialGradient(128,128,8,128,128,150); rg.addColorStop(0,'#2a211d'); rg.addColorStop(1,'#0c0a09');
        g.fillStyle=rg; g.fillRect(0,0,256,256);
        for(var i=0;i<420;i++){ g.fillStyle='rgba('+(18+Math.random()*32|0)+','+(14+Math.random()*20|0)+',13,.5)'; g.beginPath(); g.arc(Math.random()*256,Math.random()*256,Math.random()*2.6,0,7); g.fill(); }
        var ground=new T.Mesh(new T.CircleGeometry(70,64), new T.MeshStandardMaterial({map:new T.CanvasTexture(c), roughness:1, metalness:0}));
        ground.rotation.x=-Math.PI/2; scene.add(ground);
      })();

      // 화산 본체 (실제 화산 옆모습 LatheGeometry + 바위 질감 + 분화구 발광 균열)
      var volGroup=new T.Group(); scene.add(volGroup);
      // 절차적 바위 텍스처
      function rockTex(){ var c=document.createElement('canvas'); c.width=c.height=512; var g=c.getContext('2d');
        g.fillStyle='#5b4636'; g.fillRect(0,0,512,512);
        for(var i=0;i<11000;i++){ var sh=(Math.random()*64-22)|0; g.fillStyle='rgba('+(92+sh)+','+(74+sh*0.8|0)+','+(58+sh*0.7|0)+',0.5)'; g.fillRect(Math.random()*512,Math.random()*512,2,2); }
        for(var k=0;k<46;k++){ g.strokeStyle='rgba(38,28,22,'+(0.12+Math.random()*0.26)+')'; g.lineWidth=2+Math.random()*5; g.beginPath(); var xx=Math.random()*512; g.moveTo(xx,0); for(var y=0;y<512;y+=14){ xx+=(Math.random()-0.5)*9; g.lineTo(xx,y);} g.stroke(); }
        var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(4,2); return t; }
      // 분화구 둘레 발광 균열 (텍스처 위쪽=정상부)
      function crackTex(){ var c=document.createElement('canvas'); c.width=c.height=512; var g=c.getContext('2d');
        g.fillStyle='#000'; g.fillRect(0,0,512,512);
        for(var k=0;k<26;k++){ var x=Math.random()*512, y=Math.random()*120; g.strokeStyle='rgba(255,'+(80+Math.random()*110|0)+',24,0.95)'; g.lineWidth=2+Math.random()*3; g.beginPath(); g.moveTo(x,y); var xx=x,yy=y, len=70+Math.random()*150; for(var s=0;s<len;s+=9){ xx+=(Math.random()-0.5)*18; yy+=9; g.lineTo(xx,yy);} g.stroke(); }
        var t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(4,1); return t; }
      var volMat=new T.MeshStandardMaterial({ map:rockTex(), roughness:1, metalness:0, emissive:0xff4a14, emissiveMap:crackTex(), emissiveIntensity:0, side:T.DoubleSide });
      // 옆모습: 아래 넓게 퍼지고 위로 오목하게 좁아지다 분화구 함몰
      var rimY=8.6, baseR=11.5, rimR=2.7;
      var prof=[];
      for(var pi=0; pi<=26; pi++){ var t=pi/26; var y=rimY*t; var r=baseR-(baseR-rimR)*Math.pow(t,0.82); prof.push(new T.Vector2(Math.max(0.05,r), y)); }
      prof.push(new T.Vector2(1.7, rimY-0.5));
      prof.push(new T.Vector2(0.95, rimY-1.5));
      prof.push(new T.Vector2(0.5, rimY-1.7));
      prof.push(new T.Vector2(0.0, rimY-1.7));
      var volGeo=new T.LatheGeometry(prof, 120);
      (function(){ var pos=volGeo.attributes.position, v=new T.Vector3();
        for(var i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i); var rr=Math.hypot(v.x,v.z);
          if(rr>0.7 && v.y<rimY-0.3){ var ang=Math.atan2(v.z,v.x);
            var n=Math.sin(ang*9)*0.5+Math.sin(ang*15+v.y*0.7)*0.32+Math.sin(ang*23)*0.18;
            var s=(rr+n*0.45)/rr; v.x*=s; v.z*=s; pos.setXYZ(i,v.x,v.y,v.z); } }
        volGeo.computeVertexNormals();
      })();
      var cone=new T.Mesh(volGeo, volMat); volGroup.add(cone);
      var craterGlowMat=new T.MeshBasicMaterial({color:0xff7a1e, transparent:true, opacity:0, side:T.DoubleSide});
      var craterGlow=new T.Mesh(new T.CircleGeometry(1.5,32), craterGlowMat); craterGlow.rotation.x=-Math.PI/2; craterGlow.position.y=rimY-1.55; volGroup.add(craterGlow);
      var throatMat=new T.MeshBasicMaterial({color:0xffc24d, transparent:true, opacity:0});
      var throat=new T.Mesh(new T.SphereGeometry(1.1,20,16), throatMat); throat.position.y=rimY-1.2; volGroup.add(throat);

      // 파티클
      function sprite(col){ var c=document.createElement('canvas'); c.width=c.height=64; var g=c.getContext('2d');
        var rg=g.createRadialGradient(32,32,0,32,32,32); rg.addColorStop(0,col); rg.addColorStop(.4,col); rg.addColorStop(1,'rgba(0,0,0,0)');
        g.fillStyle=rg; g.beginPath(); g.arc(32,32,32,0,7); g.fill(); return new T.CanvasTexture(c); }
      function makeSys(n, tex, blend, size){
        var pos=new Float32Array(n*3), col=new Float32Array(n*3);
        var geo=new T.BufferGeometry(); geo.setAttribute('position',new T.BufferAttribute(pos,3)); geo.setAttribute('color',new T.BufferAttribute(col,3));
        var mat=new T.PointsMaterial({size:size, map:tex, blending:blend, transparent:true, depthWrite:false, vertexColors:true, sizeAttenuation:true});
        var pts=new T.Points(geo,mat); pts.frustumCulled=false; scene.add(pts);
        var P=[]; for(var i=0;i<n;i++){ P.push({life:0,max:1,vx:0,vy:0,vz:0,x:0,y:0,z:0,r:0,g:0,b:0}); pos[i*3]=pos[i*3+1]=pos[i*3+2]=NaN; }
        return {n:n,P:P,pos:pos,col:col,geo:geo,mat:mat};
      }
      var lava=makeSys(260, sprite('rgba(255,225,140,1)'), T.AdditiveBlending, 2.6);
      var flow=makeSys(240, sprite('rgba(255,205,110,1)'), T.AdditiveBlending, 3.0);
      var ash =makeSys(180, sprite('rgba(120,112,108,0.95)'), T.NormalBlending, 6.0);
      var gas =makeSys(110, sprite('rgba(225,230,240,0.7)'), T.NormalBlending, 4.6);

      function spawnLava(p){ var a=Math.random()*Math.PI*2, out=0.4+Math.random()*0.8;
        p.x=Math.cos(a)*0.3*Math.random(); p.y=6.9+Math.random()*0.3; p.z=Math.sin(a)*0.3*Math.random();
        p.vx=Math.cos(a)*out; p.vz=Math.sin(a)*out; p.vy=7.4+Math.random()*5.2; p.life=p.max=1.0+Math.random()*0.9; }
      // 경사면을 타고 흘러내리는 용암 줄기 — 분화구 가장자리에서 비탈 따라 아래로
      var FLOWCH=[0.5,2.1,3.7,5.3];
      function spawnFlow(p){ var a=FLOWCH[(Math.random()*FLOWCH.length)|0]+(Math.random()-0.5)*0.16;
        p.x=Math.cos(a)*2.7; p.y=7.9; p.z=Math.sin(a)*2.7;
        var sp=2.1+Math.random()*1.1;
        p.vx=Math.cos(a)*sp; p.vz=Math.sin(a)*sp; p.vy=-sp*0.92; p.life=p.max=3.4+Math.random()*1.2; }
      function spawnAsh(p){ var a=Math.random()*Math.PI*2, rr=Math.random()*0.6;
        p.x=Math.cos(a)*rr; p.y=8.6+Math.random()*0.6; p.z=Math.sin(a)*rr;
        p.vx=Math.cos(a)*(0.3+Math.random()*0.7); p.vz=Math.sin(a)*(0.3+Math.random()*0.7); p.vy=2.6+Math.random()*1.8; p.life=p.max=3.0+Math.random()*2.2; }
      function spawnGas(p){ var a=Math.random()*Math.PI*2;
        p.x=Math.cos(a)*0.4*Math.random(); p.y=8.0+Math.random()*0.4; p.z=Math.sin(a)*0.4*Math.random();
        p.vx=Math.cos(a)*0.5; p.vz=Math.sin(a)*0.5; p.vy=3.2+Math.random()*1.6; p.life=p.max=1.6+Math.random()*1.2; }
      function emit(sys, count, spawn){ var got=0; for(var i=0;i<sys.n && got<count;i++){ if(sys.P[i].life<=0){ spawn(sys.P[i]); got++; } } }

      function stepSys(sys, dt, grav, fade){
        var P=sys.P, pos=sys.pos, col=sys.col;
        for(var i=0;i<sys.n;i++){ var q=P[i];
          if(q.life>0){
            q.vy-=grav*dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.z+=q.vz*dt; q.life-=dt;
            var f=q.life/q.max; fade(q,f);
            if(q.y<0){ q.life=0; }
          }
          if(q.life<=0){ pos[i*3]=pos[i*3+1]=pos[i*3+2]=NaN; col[i*3]=col[i*3+1]=col[i*3+2]=0; }
          else { pos[i*3]=q.x; pos[i*3+1]=q.y; pos[i*3+2]=q.z; col[i*3]=q.r; col[i*3+1]=q.g; col[i*3+2]=q.b; }
        }
        sys.geo.attributes.position.needsUpdate=true; sys.geo.attributes.color.needsUpdate=true;
      }
      function lavaFade(q,f){ var age=1-f; // 0 어림 → 1 늙음
        q.r=1; q.g=Math.max(0.12, 0.95-age*0.85); q.b=Math.max(0.04, 0.6-age*0.85); }
      function ashFade(q,f){ var s=0.32+(1-f)*0.18; q.r=s*0.95; q.g=s*0.9; q.b=s*0.86; }
      function gasFade(q,f){ var s=0.75*f+0.1; q.r=s; q.g=s*1.02; q.b=s*1.06; }
      function flowFade(q,f){ var age=1-f; q.r=1; q.g=Math.max(0.16,0.82-age*0.7); q.b=Math.max(0.04,0.32-age*0.32); }

      // 분출물 라벨 칩(클릭)
      var chipBox=document.createElement('div');
      chipBox.style.cssText='position:absolute;inset:0;pointer-events:none;font-family:inherit;';
      wrap.appendChild(chipBox);
      var CHIP='position:absolute;pointer-events:auto;cursor:pointer;font-size:16px;font-weight:800;padding:8px 14px;border-radius:13px;border:3px solid;background:rgba(8,12,26,.72);backdrop-filter:blur(3px);white-space:nowrap;transition:transform .08s;';
      function mkChip(kind,label,color,css){ var b=document.createElement('button');
        b.style.cssText=CHIP+css+'color:'+color+';border-color:'+color+';';
        b.innerHTML=label; b.onclick=function(){ if(opts.onEjecta)opts.onEjecta(kind); };
        b.style.display='none'; chipBox.appendChild(b); return b; }
      var chipLava=mkChip('lava','🔥 용암','#FFB266','left:50%;bottom:14px;transform:translateX(-50%);');
      var chipAsh =mkChip('ash','🌫️ 화산재','#CED4DA','left:50%;top:12px;transform:translateX(-50%);');
      var chipGas =mkChip('gas','💨 화산 가스','#E9ECEF','right:12px;top:42%;');
      function updateChips(){
        var show=S.erupting;
        [['lava',chipLava],['ash',chipAsh],['gas',chipGas]].forEach(function(o){
          var b=o[1]; if(!show){ b.style.display='none'; return; }
          b.style.display=''; var seen=S.seen&&S.seen[o[0]];
          var base=b===chipLava?'🔥 용암':b===chipAsh?'🌫️ 화산재':'💨 화산 가스';
          b.innerHTML=base+(seen?' ✓':''); b.style.opacity=seen?'0.75':'1';
        });
      }

      // 카메라 궤도
      var radius=38, theta=0.6, phi=1.05, target=new T.Vector3(0,4.5,0);
      function place(){ camera.position.set(
        target.x+radius*Math.sin(phi)*Math.sin(theta),
        target.y+radius*Math.cos(phi),
        target.z+radius*Math.sin(phi)*Math.cos(theta)); camera.lookAt(target); }
      place();
      var drag=false, lx=0, ly=0, idle=0;
      var dom=renderer.domElement;
      dom.addEventListener('pointerdown',function(e){ if(e.pointerType==='touch'&&touches>1)return; drag=true; idle=0; lx=e.clientX; ly=e.clientY; dom.style.cursor='grabbing'; });
      window.addEventListener('pointermove',onMove); function onMove(e){ if(!drag)return; idle=0;
        theta-=(e.clientX-lx)*0.006; phi-=(e.clientY-ly)*0.006; phi=Math.max(0.35,Math.min(1.45,phi)); lx=e.clientX; ly=e.clientY; place(); }
      window.addEventListener('pointerup',onUp); function onUp(){ drag=false; dom.style.cursor='grab'; }
      dom.addEventListener('wheel',function(e){ e.preventDefault(); radius*=(1+e.deltaY*0.0012); radius=Math.max(18,Math.min(80,radius)); place(); }, {passive:false});
      var touches=0, pd=0;
      dom.addEventListener('touchstart',function(e){ touches=e.touches.length; if(touches>1){ drag=false; pd=tdist(e); } },{passive:false});
      dom.addEventListener('touchmove',function(e){ if(e.touches.length>1){ e.preventDefault(); var d=tdist(e); if(pd){ radius*=(pd/d); radius=Math.max(18,Math.min(80,radius)); place(); } pd=d; } },{passive:false});
      dom.addEventListener('touchend',function(e){ touches=e.touches.length; pd=0; });
      function tdist(e){ var a=e.touches[0],b=e.touches[1]; return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY); }

      // 리사이즈
      var ro=null;
      if(window.ResizeObserver){ ro=new ResizeObserver(function(){ if(!alive3)return; renderer.setSize(CW(),CH()); camera.aspect=CW()/CH(); camera.updateProjectionMatrix(); }); ro.observe(host); }

      // 루프
      var gI=0, shake=0;
      function loop(){ if(!alive3)return; raf3=requestAnimationFrame(loop);
        var now=performance.now(), dt=Math.min(0.05,(now-last)/1000); last=now;
        if(!drag){ idle+=dt; if(idle>1.2){ theta+=dt*0.08; place(); } }
        var cooled=!!(S.made&&(S.made.basalt||S.made.granite));
        var strength=S.erupting?(cooled?0.18:1):0;
        // 발광
        var gT=S.erupting?(cooled?1.0:2.6):(S.press/100)*0.95;
        gI+=(gT-gI)*Math.min(1,dt*6); glow.intensity=gI;
        var thT=S.erupting?1:S.press/150; throatMat.opacity+=(thT-throatMat.opacity)*Math.min(1,dt*6);
        var cgT=S.erupting?0.9:S.press/200; craterGlowMat.opacity+=(cgT-craterGlowMat.opacity)*Math.min(1,dt*6);
        throat.scale.setScalar(0.8+gI*0.15);
        // 바위 틈으로 비치는 용암 발광 (압력↑→은은, 분출→강하게, 식으면 약하게)
        var eT=S.erupting?(cooled?0.5:2.3):(S.press/100)*1.3;
        volMat.emissiveIntensity+=(eT-volMat.emissiveIntensity)*Math.min(1,dt*4);
        // 흔들림
        var trembling=(!S.erupting&&S.press>=60)|| (S.erupting&&!cooled);
        shake=trembling?Math.min(0.18,shake+dt*0.4):Math.max(0,shake-dt*0.6);
        volGroup.position.x=(Math.random()-0.5)*shake; volGroup.position.z=(Math.random()-0.5)*shake;
        // 방출
        var flowing=S.erupting && !cooled;
        if(strength>0){ emit(lava, Math.round(7*strength), spawnLava); emit(ash, Math.round(4*strength), spawnAsh); emit(gas, Math.round(3*strength), spawnGas); }
        else if(S.press>0){ if(Math.random()<0.5) emit(gas,1,spawnGas); }
        if(flowing){ emit(flow, 6, spawnFlow); }
        stepSys(lava,dt,16,lavaFade); stepSys(flow,dt,2.2,flowFade); stepSys(ash,dt,1.0,ashFade); stepSys(gas,dt,1.4,gasFade);
        renderer.render(scene,camera);
      }
      loop();

      return {
        sync:function(v){ S.press=v.press; S.erupting=v.erupting; S.seen=v.seen; S.made=v.made; updateChips(); },
        dispose:function(){ alive3=false; if(raf3)cancelAnimationFrame(raf3);
          window.removeEventListener('pointermove',onMove); window.removeEventListener('pointerup',onUp); if(ro)ro.disconnect();
          try{ renderer.dispose(); }catch(e){}
          try{ scene.traverse(function(o){ if(o.geometry)o.geometry.dispose&&o.geometry.dispose(); if(o.material){ var m=o.material; if(m.map)m.map.dispose&&m.map.dispose(); m.dispose&&m.dispose(); } }); }catch(e){}
          if(wrap.parentNode)wrap.parentNode.removeChild(wrap);
        }
      };
    }

    /* ───────────── 무대 ───────────── */
    function renderScene(){
      var stage=el.querySelector('.vc-stage'); if(!stage)return;
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp;
      var use3D=(mode!=='quiz' && exp==='volcano' && window.THREE);
      if(use3D){
        if(!v3d){ stage.innerHTML=''; v3d=Volcano3D(stage,{onEjecta:seeEjecta}); }
        v3d.sync(vol);
        return;
      }
      if(v3d){ v3d.dispose(); v3d=null; }
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      if(pic==='volcano')drawVolcano(svg); else drawQuake(svg);
      stage.appendChild(svg);
    }

    function drawVolcano(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      g.innerHTML=
        // 하늘 + 땅 단면
        '<rect x="0" y="0" width="900" height="250" fill="'+C.sky+'"/>'
        +'<rect x="0" y="250" width="900" height="210" fill="'+C.rock2+'"/>'
        +'<rect x="0" y="250" width="900" height="14" fill="#5D8C3F"/>'
        // 화산 산체
        +'<path d="M 250 250 L 430 70 L 470 70 L 650 250 Z" fill="'+C.rock+'"/>'
        // 마그마 방 + 화도
        +'<ellipse cx="450" cy="395" rx="120" ry="52" fill="'+C.lava+'" opacity="0.95"/>'
        +'<rect x="436" y="92" width="28" height="310" fill="'+C.lava+'" opacity="'+(vol.press>=40?0.95:0.45)+'"/>'
        +'<text x="450" y="402" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="inherit">마그마 방</text>'
        // 압력 게이지
        +'<rect x="40" y="300" width="34" height="130" rx="10" fill="#fff" stroke="'+C.hot+'" stroke-width="3"/>'
        +'<rect x="44" y="'+(426-118*vol.press/100)+'" width="26" height="'+(118*vol.press/100)+'" rx="7" fill="'+C.hot+'"/>'
        +'<text x="57" y="290" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.hot+'" font-family="inherit">압력 '+vol.press+'%</text>';
      if(vol.erupting){
        var e=svgEl('g',{class:'vc-erupt'}); g.appendChild(e);
        var ashDots='';
        for(var i=0;i<26;i++){
          var a=(i*0.83)%1, x=450+Math.sin(i*2.7)*(30+a*120), y=70-a*64-Math.abs(Math.sin(i))*8;
          ashDots+='<circle cx="'+x.toFixed(0)+'" cy="'+y.toFixed(0)+'" r="'+(4+(i%3)*2)+'" fill="'+C.ash+'" opacity="'+(0.85-a*0.5).toFixed(2)+'"/>';
        }
        e.innerHTML=
          // 화산 가스(연기 기둥) → 화산재 구름 → 용암 흐름
          '<ellipse cx="450" cy="34" rx="120" ry="26" fill="#ADB5BD" opacity="0.8"/>'
          + ashDots
          +'<path d="M 450 84 C 470 120 520 150 560 250 L 520 250 C 495 170 462 140 446 100 Z" fill="'+C.lava+'"/>'
          +'<path d="M 450 84 C 440 130 400 170 370 250 L 402 250 C 425 175 450 140 456 104 Z" fill="'+C.lava2+'"/>'
          // 분출물 라벨 칩 (클릭)
          + chip('lava', 600, 215, '🔥 용암')
          + chip('ash', 660, 60, '🌫️ 화산재')
          + chip('gas', 240, 30, '💨 화산 가스');
      }
      // 만든 암석 카드
      var cards='', cx=720;
      if(vol.made.basalt){
        cards+='<g><rect x="'+cx+'" y="290" width="150" height="74" rx="14" fill="#fff" stroke="'+C.basalt+'" stroke-width="3"/>'
          +'<circle cx="'+(cx+38)+'" cy="322" r="22" fill="'+C.basalt+'"/>'
          +'<circle cx="'+(cx+30)+'" cy="316" r="3" fill="#6c757d"/><circle cx="'+(cx+44)+'" cy="312" r="3" fill="#6c757d"/><circle cx="'+(cx+40)+'" cy="328" r="3" fill="#6c757d"/><circle cx="'+(cx+28)+'" cy="328" r="2.5" fill="#6c757d"/>'
          +'<text x="'+(cx+98)+'" y="318" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">현무암</text>'
          +'<text x="'+(cx+98)+'" y="344" text-anchor="middle" font-size="14" font-weight="800" fill="'+C.sub+'" font-family="inherit">구멍 송송</text></g>';
      }
      if(vol.made.granite){
        cards+='<g><rect x="'+cx+'" y="374" width="150" height="74" rx="14" fill="#fff" stroke="#C9A227" stroke-width="3"/>'
          +'<circle cx="'+(cx+38)+'" cy="406" r="22" fill="'+C.granite+'"/>'
          +'<rect x="'+(cx+28)+'" y="396" width="8" height="8" fill="#B0A8B9"/><rect x="'+(cx+42)+'" y="402" width="9" height="9" fill="#D9B45B"/><rect x="'+(cx+32)+'" y="412" width="8" height="8" fill="#9aa5b1"/>'
          +'<text x="'+(cx+98)+'" y="402" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">화강암</text>'
          +'<text x="'+(cx+98)+'" y="428" text-anchor="middle" font-size="14" font-weight="800" fill="'+C.sub+'" font-family="inherit">알갱이 큼</text></g>';
      }
      if(cards){ var cg=svgEl('g',{}); cg.innerHTML=cards; g.appendChild(cg); }
      function chip(k,x,y,label){
        var on=vol.seen[k];
        return '<g class="vc-chip" data-k="'+k+'" style="cursor:pointer;">'
          +'<rect x="'+(x-8)+'" y="'+(y-22)+'" width="'+(label.length*15+34)+'" height="34" rx="12" fill="'+(on?C.good:'#fff')+'" stroke="'+(on?C.good:C.vio)+'" stroke-width="3"/>'
          +'<text x="'+(x+label.length*7.5+9)+'" y="'+(y+2)+'" text-anchor="middle" font-size="18" font-weight="800" fill="'+(on?'#fff':C.vio)+'" font-family="inherit">'+label+(on?' ✓':'')+'</text></g>';
      }
    }

    function drawQuake(svg){
      var g=svgEl('g',{}); svg.appendChild(g);
      if(qk.broken) g.setAttribute('style','animation:vcShake 0.5s ease 2;');
      var bend=qk.broken?0:qk.stress*0.18;            // 휘는 정도
      var off=qk.broken?26:0;                          // 끊어진 뒤 어긋남
      g.innerHTML=
        '<rect x="0" y="0" width="900" height="460" fill="'+C.sky+'"/>'
        // 왼쪽 판
        +'<g'+(qk.broken?' transform="translate(0,'+off+')"':'')+'>'
        +'<path d="M 0 250 L 430 '+(250-bend)+' L 450 460 L 0 460 Z" fill="'+C.rock2+'"/>'
        +'<path d="M 0 250 L 430 '+(250-bend)+' L 432 '+(264-bend)+' L 0 264 Z" fill="#5D8C3F"/>'
        +'<text x="120" y="225" font-size="40" font-family="inherit">🏠</text><text x="280" y="'+(218-bend)+'" font-size="38" font-family="inherit">🌳</text>'
        +'</g>'
        // 오른쪽 판
        +'<g><path d="M 460 '+(250-bend)+' L 900 250 L 900 460 L 470 460 Z" fill="'+C.rock+'"/>'
        +'<path d="M 460 '+(250-bend)+' L 900 250 L 900 264 L 462 '+(264-bend)+' Z" fill="#6FA34B"/>'
        +'<text x="600" y="'+(220-bend*0.5)+'" font-size="40" font-family="inherit">🏫</text><text x="780" y="222" font-size="38" font-family="inherit">🌲</text></g>'
        // 단층선
        +(qk.broken
          ? '<path d="M 445 '+(248+off)+' L 452 300 L 442 350 L 455 410 L 446 460" stroke="#3E2723" stroke-width="7" fill="none" stroke-linecap="round"/>'
            +'<text x="450" y="80" text-anchor="middle" font-size="30" font-weight="800" fill="'+C.hot+'" font-family="inherit">우지끈! 지진 발생!</text>'
            +'<text x="450" y="118" text-anchor="middle" font-size="19" font-weight="800" fill="'+C.ink+'" font-family="inherit">땅이 끊어지면서 흔들려요</text>'
          : '<line x1="445" y1="'+(250-bend)+'" x2="445" y2="460" stroke="#3E2723" stroke-width="3" stroke-dasharray="10 8" opacity="0.5"/>')
        // 힘 화살표 + 게이지
        +(qk.broken?'':'<text x="60" y="320" font-size="44" font-family="inherit">➡️</text><text x="800" y="320" font-size="44" font-family="inherit">⬅️</text>')
        +'<rect x="40" y="30" width="200" height="30" rx="12" fill="#fff" stroke="'+C.vio+'" stroke-width="3"/>'
        +'<rect x="44" y="34" width="'+(192*qk.stress/100)+'" height="22" rx="9" fill="'+C.vio+'"/>'
        +'<text x="140" y="86" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.vio+'" font-family="inherit">쌓인 힘 '+qk.stress+'%</text>';
    }

    /* ───────────── 상태줄 ───────────── */
    function renderStatus(){
      var s=el.querySelector('.vc-status'); if(!s)return;
      var pic=(mode==='quiz')?QUIZ[qIdx].pic:exp, msg;
      if(pic==='volcano'){
        if(vol.erupting) msg='<span style="color:'+C.hot+';font-size:19px;">🌋 분출 중! 분출물 라벨을 눌러 보고, 식혀서 암석도 만들어 봐요</span>';
        else if(vol.press>0) msg='<span style="color:'+C.ink+';font-size:19px;">압력 '+vol.press+'% — 100%가 되면 분출해요!</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">땅속 마그마 방에 🔥 압력을 키워 봐요</span>';
      } else {
        if(qk.broken) msg='<span style="color:'+C.hot+';font-size:19px;">땅이 큰 힘을 오래 받으면 끊어지면서 지진이 나요</span>';
        else msg='<span style="color:'+C.sub+';font-size:19px;">➡️ 양쪽에서 미는 힘을 계속 가해 봐요 (쌓인 힘 '+qk.stress+'%)</span>';
      }
      s.innerHTML=msg;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.vc-exp').forEach(function(b){
        b.addEventListener('click',function(){ exp=b.dataset.e; build(); });
      });
      el.querySelectorAll('.vc-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var a=b.dataset.act;
          if(a==='pump')pump();
          else if(a==='basalt')cool('basalt');
          else if(a==='granite')cool('granite');
          else if(a==='volReset'){ volReset(); build(); }
          else if(a==='push')push();
          else if(a==='qkReset'){ qkReset(); build(); }
        });
      });
      el.addEventListener('click',function(ev){
        var c=ev.target.closest?ev.target.closest('.vc-chip'):null;
        if(c)seeEjecta(c.dataset.k);
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    build();
    return { destroy:function(){ if(v3d){v3d.dispose();v3d=null;} if(raf)cancelAnimationFrame(raf); } };
  });
})();
