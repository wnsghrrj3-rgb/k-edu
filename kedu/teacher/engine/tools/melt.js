/* ============================================================================
   케이랩 도구 — 상태변화 (melt)  ★거시(실사)↔미시(입자) 연결 듀얼뷰
   왼쪽: 실사 얼음 PNG가 녹고 물이 끓어 김이 되는 "눈에 보이는 모습".
   오른쪽: 같은 온도에서 분자(구슬 PNG)가 어떻게 배열·운동하는지 "입자의 모습".
   둘 다 하나의 슬라이더(−20→120℃, 가한 열)로 완전 동기.
     고체 → [0℃ 융해정체] → 액체 → [100℃ 기화정체] → 기체  (거꾸로=식히기)
   - 자산: assets/states/{ice,water,molecule}.png (루트 절대경로)
   - 의존: window.KLab (SVG + rAF + KLab.sound)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var ICE='/kedu/teacher/engine/tools/assets/states/ice.png';
  var WATER='/kedu/teacher/engine/tools/assets/states/water.png';
  var MOL='/kedu/teacher/engine/tools/assets/states/molecule.png';
  var SVGNS='http://www.w3.org/2000/svg', XLINK='http://www.w3.org/1999/xlink';

  window.KLab.register('melt', function (el, config) {
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play){ try{window.KLab.sound.play(n);}catch(e){} } }
    function S(t,a){ var e=document.createElementNS(SVGNS,t); if(a)for(var k in a)e.setAttribute(k,a[k]); return e; }
    function href(e,u){ e.setAttributeNS(XLINK,'href',u); e.setAttribute('href',u); }

    /* ── 좌표 (viewBox 0 0 1120 480) ─────────────────────────────── */
    var TH_X=74, TH_TOP=196, TH_BOT=404, TH_R=15, T_MIN=-20, T_MAX=120;
    var BX=176, BY=182, BW=316, BH=250, BB=BY+BH;
    var ICE_X=BX+BW/2-78, ICE_W=156, ICE_FULLH=176, ICE_BASE=BB-6, WATER_MAX=232;
    var MX=590, MY=182, MW=466, MH=250, MB=MY+MH;
    var COLS=9, ROWS=4, NP=COLS*ROWS, PR=13, GX=34, GY=34;

    /* ── 상태 유도 ───────────────────────────────────────────────── */
    function derive(e){
      var A=15,B=30,C=60,D=85,E=100,t,melt=0,vapor=0,iceH=0,water=0,phase;
      if(e<=A){ t=-20+(e/A)*20; iceH=1; phase='solid'; }
      else if(e<=B){ var f=(e-A)/(B-A); t=0; melt=f; iceH=1-f; water=f; phase='melt'; }
      else if(e<=C){ t=((e-B)/(C-B))*100; water=1; phase='liquid'; }
      else if(e<=D){ var v=(e-C)/(D-C); t=100; vapor=v; water=1-v; phase='boil'; }
      else { t=100+((e-D)/(E-D))*20; vapor=1; phase='steam'; }
      return {t:t,melt:melt,vapor:vapor,iceH:iceH,water:water,phase:phase};
    }
    function microParams(m){
      var solid=m.phase==='solid', melt=m.phase==='melt', gas=(m.phase==='boil'||m.phase==='steam');
      return { latticeK: solid?0.13 : (melt?0.13*(1-m.melt):0),
               thermal: 0.5 + Math.max(0,(m.t+20))/140*2.7,
               gravity: gas?0.012 : (solid?0.0:0.16),
               damp: solid?0.80 : (gas?0.99:0.90) };
    }
    var LABEL={
      solid:['고체 (얼음)','#1971C2','입자가 제자리에서 규칙적으로 진동만 해요.'],
      melt :['녹는 중 — 융해 (0℃ 정체)','#1C7ED6','열을 받아도 0℃에 머물러요. 입자 사이가 느슨해져요.'],
      liquid:['액체 (물)','#1C7ED6','입자가 서로 미끄러지며 자유롭게 움직여요.'],
      boil :['끓는 중 — 기화 (100℃ 정체)','#E8590C','100℃에 머물며 입자가 떨어져 나가 날아가요.'],
      steam:['기체 (수증기)','#E8590C','입자가 멀리 흩어져 빠르게 날아다녀요.']
    };

    /* ── DOM ─────────────────────────────────────────────────────── */
    var btn='font-size:21px;padding:11px 18px;border-radius:15px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;background:#fff;';
    el.innerHTML=
      '<style>'
      +'.mlt-btn:active{transform:translateY(2px);}'
      +'.mlt-rng{-webkit-appearance:none;appearance:none;height:16px;border-radius:9px;outline:none;background:linear-gradient(90deg,#74C0FC,#A5D8FF 22%,#D0EBFF 42%,#FFE3BF 62%,#FFA94D 82%,#FF6B3D);}'
      +'.mlt-rng::-webkit-slider-thumb{-webkit-appearance:none;width:32px;height:32px;border-radius:50%;background:#fff;border:5px solid #1565C0;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2);}'
      +'.mlt-rng::-moz-range-thumb{width:32px;height:32px;border-radius:50%;background:#fff;border:5px solid #1565C0;cursor:pointer;}'
      +'.mlt-chip{font-size:18px;padding:9px 15px;border-radius:13px;border:2.5px solid #C5D7E8;background:#fff;cursor:pointer;font-weight:800;font-family:inherit;color:#37536e;}'
      +'.mlt-chip.on{border-color:#1565C0;color:#1565C0;background:#EAF3FB;}'
      +'</style>'
      +'<div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:10px;flex-wrap:wrap;">'
        +'<span style="font-size:19px;font-weight:800;color:#1971C2;">❄️ 식히기</span>'
        +'<input class="mlt-rng" type="range" min="0" max="100" value="6" aria-label="가한 열" style="width:min(60vw,520px);">'
        +'<span style="font-size:19px;font-weight:800;color:#E8590C;">데우기 🔥</span>'
      +'</div>'
      +'<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:12px;flex-wrap:wrap;">'
        +'<button class="mlt-chip" data-e="6">🧊 얼음</button>'
        +'<button class="mlt-chip" data-e="22">💧 녹이기</button>'
        +'<button class="mlt-chip" data-e="45">🌊 물</button>'
        +'<button class="mlt-chip" data-e="72">♨️ 끓이기</button>'
        +'<button class="mlt-chip" data-e="95">💨 수증기</button>'
        +'<button class="mlt-btn" data-act="auto" style="'+btn+'color:#E8590C;border-color:#E8590C;">▶ 천천히 가열</button>'
      +'</div>'
      +'<div class="kl-stage-host"><div class="mlt-stage" style="width:100%;max-width:1080px;margin:0 auto;background:radial-gradient(120% 120% at 50% 10%,#FCFEFF,#EAF3FB 70%,#DBE9F6);border-radius:26px;box-shadow:inset 0 0 0 3px rgba(21,101,192,.1);overflow:hidden;"></div></div>'
      +'<div class="mlt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';
    var stageHost=el.querySelector('.mlt-stage'), rng=el.querySelector('.mlt-rng'), statusEl=el.querySelector('.mlt-status');

    /* ── SVG ─────────────────────────────────────────────────────── */
    var svg=S('svg',{viewBox:'0 0 1120 480',width:'100%',style:'display:block;height:auto;'}); stageHost.appendChild(svg);
    var defs=S('defs'); svg.appendChild(defs);
    defs.innerHTML=
      '<linearGradient id="mWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdeeff" stop-opacity="0.92"/><stop offset="0.5" stop-color="#74c0f7" stop-opacity="0.92"/><stop offset="1" stop-color="#2b8fde" stop-opacity="0.95"/></linearGradient>'
      +'<linearGradient id="mGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.12" stop-color="#fff" stop-opacity="0.06"/><stop offset="0.85" stop-color="#cfe2f2" stop-opacity="0.04"/><stop offset="1" stop-color="#fff" stop-opacity="0.4"/></linearGradient>'
      +'<radialGradient id="mSteam" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="0.6" stop-color="#eef6ff" stop-opacity="0.45"/><stop offset="1" stop-color="#eef6ff" stop-opacity="0"/></radialGradient>'
      +'<linearGradient id="mMerc" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a4d"/><stop offset="1" stop-color="#ff8a5c"/></linearGradient>'
      +'<filter id="mBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>'
      +'<clipPath id="mIceClip"><rect id="mIceRect" x="'+ICE_X+'" y="'+(ICE_BASE-ICE_FULLH)+'" width="'+ICE_W+'" height="'+ICE_FULLH+'" rx="14"/></clipPath>'
      +'<clipPath id="mBeakerClip"><path d="M'+(BX+4)+' '+BY+' L'+(BX+BW-4)+' '+BY+' L'+(BX+BW-4)+' '+(BB-20)+' Q'+(BX+BW-4)+' '+BB+' '+(BX+BW-24)+' '+BB+' L'+(BX+24)+' '+BB+' Q'+(BX+4)+' '+BB+' '+(BX+4)+' '+(BB-20)+' Z"/></clipPath>'
      +'<clipPath id="mMicroClip"><rect x="'+MX+'" y="'+MY+'" width="'+MW+'" height="'+MH+'" rx="20"/></clipPath>';

    function title(x,txt,sub){ var g=S('g');
      var t=S('text',{x:x,y:BY-26,'font-size':19,'font-weight':800,fill:'#2a4a68','text-anchor':'middle','font-family':'inherit'}); t.textContent=txt; g.appendChild(t);
      var s=S('text',{x:x,y:BY-7,'font-size':13,fill:'#6b8aa6','text-anchor':'middle','font-family':'inherit'}); s.textContent=sub; g.appendChild(s);
      svg.appendChild(g);
    }
    title(BX+BW/2,'👁 눈에 보이는 모습','얼음·물·수증기');
    title(MX+MW/2,'🔬 입자의 모습','분자의 배열과 운동');

    // 온도계
    var thermo=S('g'); svg.appendChild(thermo);
    thermo.appendChild(S('rect',{x:TH_X-TH_R,y:TH_TOP,width:TH_R*2,height:(TH_BOT-TH_TOP+10),rx:TH_R,fill:'#fff',stroke:'#b9c9da','stroke-width':3}));
    thermo.appendChild(S('circle',{cx:TH_X,cy:TH_BOT+26,r:24,fill:'#fff',stroke:'#b9c9da','stroke-width':3}));
    var merc=S('rect',{x:TH_X-7,y:TH_BOT,width:14,height:0,rx:7,fill:'url(#mMerc)'}); thermo.appendChild(merc);
    thermo.appendChild(S('circle',{cx:TH_X,cy:TH_BOT+26,r:17,fill:'url(#mMerc)'}));
    function tY(t){ return TH_BOT-(t-T_MIN)/(T_MAX-T_MIN)*(TH_BOT-TH_TOP); }
    [['0℃',0,'#1971C2'],['100℃',100,'#E8590C']].forEach(function(m){ var y=tY(m[1]);
      thermo.appendChild(S('line',{x1:TH_X+TH_R,y1:y,x2:TH_X+TH_R+8,y2:y,stroke:m[2],'stroke-width':2.5,'stroke-dasharray':'4 3'}));
      var tx=S('text',{x:TH_X+TH_R+11,y:y+5,'font-size':13,'font-weight':800,fill:m[2],'font-family':'inherit'}); tx.textContent=m[0]; thermo.appendChild(tx); });
    var tempTxt=S('text',{x:TH_X,y:TH_TOP-12,'font-size':22,'font-weight':800,fill:'#37536e','text-anchor':'middle','font-family':'inherit'}); thermo.appendChild(tempTxt);

    // 비커(거시)
    var bkPath='M'+BX+' '+BY+' L'+(BX+BW)+' '+BY+' L'+(BX+BW)+' '+(BB-22)+' Q'+(BX+BW)+' '+(BB+4)+' '+(BX+BW-26)+' '+(BB+4)+' L'+(BX+26)+' '+(BB+4)+' Q'+BX+' '+(BB+4)+' '+BX+' '+(BB-22)+' Z';
    svg.appendChild(S('path',{d:bkPath,fill:'#f2f9ff',opacity:0.5,stroke:'#bcd6ec','stroke-width':3}));
    var waterG=S('g',{'clip-path':'url(#mBeakerClip)'}); svg.appendChild(waterG);
    var waterBody=S('path',{fill:'url(#mWater)'}); waterG.appendChild(waterBody);
    var shimmer1=S('ellipse',{rx:54,ry:5,fill:'#fff',opacity:0}); waterG.appendChild(shimmer1);
    var shimmer2=S('ellipse',{rx:34,ry:3.5,fill:'#fff',opacity:0}); waterG.appendChild(shimmer2);
    var bubbleLayer=S('g'); waterG.appendChild(bubbleLayer);
    var iceFallback=S('rect',{x:ICE_X,y:ICE_BASE-ICE_FULLH,width:ICE_W,height:ICE_FULLH,rx:16,fill:'#e9f6ff',stroke:'#bfe0f5','stroke-width':2,'clip-path':'url(#mIceClip)',opacity:0}); svg.appendChild(iceFallback);
    var iceImg=S('image',{x:ICE_X,y:ICE_BASE-ICE_FULLH,width:ICE_W,height:ICE_FULLH,'clip-path':'url(#mIceClip)',preserveAspectRatio:'xMidYMax meet'}); href(iceImg,ICE);
    iceImg.addEventListener('error',function(){ iceImg.setAttribute('opacity','0'); iceFallback.setAttribute('opacity','0.95'); }); svg.appendChild(iceImg);
    var iceRect=svg.querySelector('#mIceRect');
    svg.appendChild(S('path',{d:bkPath,fill:'url(#mGlass)',stroke:'#a9cbe6','stroke-width':3.5}));
    svg.appendChild(S('rect',{x:BX-10,y:BY-9,width:BW+20,height:11,rx:5,fill:'#dfeefb',stroke:'#a9cbe6','stroke-width':3}));
    var steamLayer=S('g'); svg.appendChild(steamLayer);
    var dripLayer=S('g'); svg.appendChild(dripLayer);

    // 입자 패널(미시)
    svg.appendChild(S('rect',{x:MX,y:MY,width:MW,height:MH,rx:20,fill:'#f4faff',stroke:'#bcd6ec','stroke-width':3}));
    var molLayer=S('g',{'clip-path':'url(#mMicroClip)'}); svg.appendChild(molLayer);
    var parts=[];
    (function buildParts(){
      var startX=MX+MW/2-(COLS-1)*GX/2, startY=(MB-26)-(ROWS-1)*GY;
      for(var i=0;i<NP;i++){ var c=i%COLS, r=Math.floor(i/COLS), hx=startX+c*GX, hy=startY+r*GY;
        var im=S('image',{x:hx-PR,y:hy-PR,width:PR*2,height:PR*2}); href(im,MOL); molLayer.appendChild(im);
        parts.push({el:im,x:hx,y:hy,vx:0,vy:0,hx:hx,hy:hy}); }
    })();

    /* ── 동적 ────────────────────────────────────────────────────── */
    var cur={e:6,t:derive(6).t,iceH:1,water:0}, bubbles=[],steams=[],drips=[],frame=0,auto=false,lastPhase='solid',tDrip=0,raf=null;
    function waterTopY(wf){ return BB-wf*WATER_MAX; }
    function setWaterPath(topY,amp,ph){ var d='M'+(BX+4)+' '+topY.toFixed(1);
      for(var x=BX+4;x<=BX+BW-4;x+=14){ var y=topY+Math.sin(x*0.06+ph)*amp+Math.sin(x*0.13+ph*1.7)*amp*0.5; d+=' L'+x.toFixed(1)+' '+y.toFixed(1); }
      d+=' L'+(BX+BW-4)+' '+(BB+4)+' L'+(BX+4)+' '+(BB+4)+' Z'; waterBody.setAttribute('d',d); }
    function spawnBubble(){ var c=S('circle',{cx:BX+30+Math.random()*(BW-60),cy:BB-8,r:2+Math.random()*4,fill:'#fff',opacity:0}); bubbleLayer.appendChild(c);
      bubbles.push({el:c,y:BB-8,vy:0.8+Math.random()*1.4}); }
    function spawnSteam(x){ var e=S('ellipse',{cx:x,cy:BY-4,rx:16,ry:13,fill:'url(#mSteam)',filter:'url(#mBlur)',opacity:0}); steamLayer.appendChild(e);
      steams.push({el:e,x:x,y:BY-4,vy:0.7+Math.random()*0.7,drift:(Math.random()-0.5)*0.5,life:0,max:90+Math.random()*60}); }
    function spawnDrip(){ var x=ICE_X+ICE_W/2+(Math.random()-0.5)*ICE_W*0.7, topY=ICE_BASE-cur.iceH*ICE_FULLH+6;
      var im=S('image',{x:x-11,y:topY,width:22,height:22}); href(im,WATER); dripLayer.appendChild(im); drips.push({el:im,y:topY,vy:1.2+Math.random()*0.6}); }

    function microStep(mp){
      var i,j,p,q,dx,dy,d,md=PR*2-2;
      var L=MX+22,R=MX+MW-22,T=MY+22,Bm=MB-22;
      for(i=0;i<NP;i++){ p=parts[i];
        p.vx+=(Math.random()-0.5)*mp.thermal; p.vy+=(Math.random()-0.5)*mp.thermal;
        if(mp.latticeK>0){ p.vx+=(p.hx-p.x)*mp.latticeK; p.vy+=(p.hy-p.y)*mp.latticeK; }
        p.vy+=mp.gravity; p.vx*=mp.damp; p.vy*=mp.damp; p.x+=p.vx; p.y+=p.vy; }
      for(i=0;i<NP;i++){ for(j=i+1;j<NP;j++){ p=parts[i]; q=parts[j]; dx=q.x-p.x; dy=q.y-p.y; d=Math.sqrt(dx*dx+dy*dy)||0.01;
        if(d<md){ var o=(md-d)/d*0.5; p.x-=dx*o; p.y-=dy*o; q.x+=dx*o; q.y+=dy*o; } } }
      for(i=0;i<NP;i++){ p=parts[i];
        if(p.x<L){p.x=L;p.vx*=-0.5;} if(p.x>R){p.x=R;p.vx*=-0.5;}
        if(p.y<T){p.y=T;p.vy*=-0.5;} if(p.y>Bm){p.y=Bm;p.vy*=-0.5;}
        p.el.setAttribute('x',(p.x-PR).toFixed(1)); p.el.setAttribute('y',(p.y-PR).toFixed(1)); }
    }

    function render(){
      var m=derive(cur.e);
      cur.t+=(m.t-cur.t)*0.18; var my=tY(cur.t); merc.setAttribute('y',my); merc.setAttribute('height',Math.max(0,TH_BOT-my)); tempTxt.textContent=Math.round(cur.t)+'℃';
      cur.iceH+=(m.iceH-cur.iceH)*0.16; var ih=cur.iceH*ICE_FULLH;
      iceRect.setAttribute('y',(ICE_BASE-ih).toFixed(1)); iceRect.setAttribute('height',Math.max(0,ih).toFixed(1)); iceRect.setAttribute('rx',(14+(1-cur.iceH)*60).toFixed(1));
      var iceOp=cur.iceH<0.04?0:Math.min(1,0.35+cur.iceH*0.8);
      if(iceImg.getAttribute('opacity')!=='0'||iceFallback.getAttribute('opacity')==='0') iceImg.setAttribute('opacity',iceImg.getAttribute('opacity')==='0'?'0':iceOp);
      if(iceFallback.getAttribute('opacity')!=='0') iceFallback.setAttribute('opacity',(iceOp*0.95).toFixed(2));
      cur.water+=(m.water-cur.water)*0.14; var topY=waterTopY(cur.water);
      var agit=m.phase==='boil'?5.5:(cur.t>70?3.2:2.0); setWaterPath(topY,cur.water>0.02?agit:0,frame*0.07);
      if(cur.water>0.02){ shimmer1.setAttribute('opacity',0.32); shimmer2.setAttribute('opacity',0.28);
        shimmer1.setAttribute('cx',BX+BW*0.42+Math.sin(frame*0.04)*36); shimmer1.setAttribute('cy',topY+8);
        shimmer2.setAttribute('cx',BX+BW*0.6+Math.cos(frame*0.05)*28); shimmer2.setAttribute('cy',topY+14);
      } else { shimmer1.setAttribute('opacity',0); shimmer2.setAttribute('opacity',0); }
      var L=LABEL[m.phase];
      statusEl.innerHTML='<div style="font-size:28px;color:'+L[1]+';">'+L[0]+'</div><div style="font-size:17px;color:#5a7894;margin-top:5px;line-height:1.4;">'+L[2]+'</div>';
      if(m.phase!==lastPhase){ snd(m.phase==='boil'||m.phase==='steam'?'charge':'success'); lastPhase=m.phase; }
      return m;
    }

    function loop(){ frame++;
      if(auto){ var nv=Math.min(100,+rng.value+0.45); rng.value=nv; if(nv>=100)auto=false; }
      cur.e+=((+rng.value)-cur.e)*0.2;
      var m=render();
      microStep(microParams(m));
      if(m.phase==='boil'&&frame%3===0) spawnBubble();
      if(cur.t>92&&frame%9===0&&cur.water>0.05) spawnBubble();
      var topY=waterTopY(cur.water);
      for(var i=bubbles.length-1;i>=0;i--){ var b=bubbles[i]; b.y-=b.vy; b.vy+=0.02; b.el.setAttribute('cy',b.y); b.el.setAttribute('opacity',Math.min(0.7,+b.el.getAttribute('opacity')+0.06));
        if(b.y<=topY+2){ if(b.el.parentNode)b.el.parentNode.removeChild(b.el); bubbles.splice(i,1); } }
      if(m.vapor>0.02&&frame%Math.max(3,Math.round(9-m.vapor*6))===0) spawnSteam(BX+BW/2+(Math.random()-0.5)*BW*0.55);
      for(var j=steams.length-1;j>=0;j--){ var s=steams[j]; s.life++; s.y-=s.vy; s.x+=s.drift; var k=s.life/s.max;
        s.el.setAttribute('cx',s.x.toFixed(1)); s.el.setAttribute('cy',s.y.toFixed(1)); s.el.setAttribute('opacity',(Math.sin(Math.min(1,k)*Math.PI)*0.7).toFixed(2));
        var sc=1+k*1.3; s.el.setAttribute('rx',(16*sc).toFixed(1)); s.el.setAttribute('ry',(13*sc).toFixed(1));
        if(s.life>=s.max){ if(s.el.parentNode)s.el.parentNode.removeChild(s.el); steams.splice(j,1); } }
      if(m.phase==='melt'&&m.iceH>0.03){ tDrip++; if(tDrip%20===0){ spawnDrip(); snd('tap'); } }
      var floorY=waterTopY(cur.water)-4;
      for(var d2=drips.length-1;d2>=0;d2--){ var dp=drips[d2]; dp.vy+=0.16; dp.y+=dp.vy; dp.el.setAttribute('y',dp.y.toFixed(1));
        if(dp.y>=floorY){ if(dp.el.parentNode)dp.el.parentNode.removeChild(dp.el); drips.splice(d2,1); } }
      raf=requestAnimationFrame(loop);
    }

    rng.addEventListener('input',function(){ auto=false; });
    el.querySelectorAll('.mlt-chip').forEach(function(c){ c.addEventListener('click',function(){ auto=false; var tv=+c.dataset.e, st=+rng.value, t0=Date.now();
      el.querySelectorAll('.mlt-chip').forEach(function(x){x.classList.remove('on');}); c.classList.add('on'); snd('select');
      (function tw(){ var k=Math.min(1,(Date.now()-t0)/520); rng.value=(st+(tv-st)*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2)); if(k<1)requestAnimationFrame(tw); })(); }); });
    el.querySelector('[data-act="auto"]').addEventListener('click',function(){ auto=true; if(+rng.value>=99)rng.value=6; snd('charge'); });

    render(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
