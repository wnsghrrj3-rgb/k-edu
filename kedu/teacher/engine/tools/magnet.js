/* ============================================================================
   케이랩 도구 모듈 — 자석·자기장 (magnet) v3  [과학 3호 · 3모드]
   3학년 자석의 이용.
   v2 추가 (준호 "전기 v4 수준으로 깊게"):
     ▸ 자기력선(field line) 실제 곡선 — N극에서 나와 S극으로 휘어 들어가는
        눈에 안 보이는 자기장을 그려서 보여줌. (v1은 나침반 격자뿐)
     ▸ 보기 토글 — [자기력선]/[나침반]. 두 방식으로 같은 자기장을 봄.
     ▸ 끌림·밀림 — 두 자석이 마주본 극을 판정해 끌리는지 미는지 설명.
     ▸ 탐구 미션 2종 — 끌리게(다른 극 마주) / 밀리게(같은 극 마주) 만들기.
   변수 → 현상 → 발견:
     자석을 옮기고 돌리고 1·2개 전환 → 자기장 모양 변화 →
     "자석 둘레엔 눈에 안 보이는 자기장이 있고, 다른 극은 당기고 같은 극은 민다."
   - 의존: window.KLab (순수 SVG)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 자기력선/나침반 장면을 보고 답하기.
   - config: { count(자석 1|2, 기본1), mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={N:'#E03131',S:'#1C7ED6',ink:'#1B3A57',sub:'#5a7894',good:'#12B886',line:'#7048E8'};
  window.KLab.register('magnet', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    function oneMag(){ return [{x:450,y:250,ang:0}]; }
    function twoMag(){ return [{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]; }
    var mags = (config.count===2)?twoMag():oneMag();
    var view='lines';                 // 'lines' | 'compass'
    var rotCount=0, rotInCompass=false;
    var btn='font-size:21px;padding:10px 16px;border-radius:14px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460, ML=80, MW=42; // 자석 반길이/폭

    function poles(){var ps=[];mags.forEach(function(m){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
      ps.push({x:m.x+dx,y:m.y+dy,q:1}); ps.push({x:m.x-dx,y:m.y-dy,q:-1});});return ps;}
    function field(px,py){var bx=0,by=0,P=poles();for(var i=0;i<P.length;i++){var p=P[i],rx=px-p.x,ry=py-p.y,r2=rx*rx+ry*ry,r=Math.sqrt(r2);if(r<14)r=14;var inv=p.q/(r2*r);bx+=rx*inv;by+=ry*inv;}return [bx,by];}

    // 자기력선: N극 둘레 시작점에서 필드 방향을 따라 적분하며 S극으로 추적
    function trace(sx,sy){
      var pts=[sx+','+sy], x=sx, y=sy, step=5, P=poles();
      for(var k=0;k<260;k++){
        var f=field(x,y), m=Math.sqrt(f[0]*f[0]+f[1]*f[1]); if(m<1e-9)break;
        x+=f[0]/m*step; y+=f[1]/m*step;
        if(x<-40||x>VBW+40||y<-40||y>VBH+40)break;
        pts.push(x.toFixed(1)+','+y.toFixed(1));
        var stop=false;                       // S극에 충분히 가까우면 멈춤
        for(var j=0;j<P.length;j++){if(P[j].q<0&&Math.hypot(x-P[j].x,y-P[j].y)<14){stop=true;break;}}
        if(stop)break;
      }
      return pts.join(' ');
    }
    function fieldLines(svg){
      mags.forEach(function(m){
        var nx=m.x+Math.cos(m.ang)*ML, ny=m.y+Math.sin(m.ang)*ML;   // 이 자석 N극
        for(var a=0;a<360;a+=45){var rad=a*Math.PI/180;
          var sx=nx+Math.cos(rad)*16, sy=ny+Math.sin(rad)*16;
          svg.appendChild(svgEl('polyline',{points:trace(sx,sy),fill:'none',stroke:C.line,'stroke-width':2,'stroke-opacity':0.5,'stroke-linecap':'round'}));
        }
      });
    }

    function facing(){
      if(mags.length<2)return null;
      function near(m,t){var dx=Math.cos(m.ang)*ML,dy=Math.sin(m.ang)*ML;
        return Math.hypot(m.x+dx-t.x,m.y+dy-t.y) < Math.hypot(m.x-dx-t.x,m.y-dy-t.y) ? 'N':'S';}
      var pa=near(mags[0],mags[1]), pb=near(mags[1],mags[0]);
      var dist=Math.hypot(mags[0].x-mags[1].x,mags[0].y-mags[1].y);
      return {kind:(pa===pb?'repel':'attract'), pa:pa, pb:pb, near:dist<320};
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'↻ <b style="color:#7048E8;">돌리기를 두 번</b> 눌러 자기력선이 자석을 따라 도는지 봐요!',
        check:function(){ return rotCount>=2; } },
      { text:'🧲 자석 2개로 바꿔, <b style="color:#7048E8;">다른 극(N–S)을 마주</b>해 가까이 — 서로 끌리게!',
        check:function(){ var f=facing(); return !!f && f.near && f.kind==='attract'; } },
      { text:'💢 이번엔 <b style="color:#7048E8;">같은 극을 마주</b>해 봐요 — 서로 밀어내게!',
        check:function(){ var f=facing(); return !!f && f.near && f.kind==='repel'; } },
      { text:'🧭 <b style="color:#7048E8;">나침반 보기</b>로 바꿔서 자석을 돌려 봐요 — 바늘이 따라 돌아요!',
        check:function(){ return view==='compass' && rotInCompass; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(MISSIONS[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          if(mStep<MISSIONS.length-1)mStep++; else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (자기장 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { q:'마주본 극이 N–S인 이 두 자석은 어떻게 될까요?', ch:['서로 끌려요','서로 밀어내요','아무 일 없어요'], a:0,
        scn:function(){ view='lines'; mags=[{x:340,y:230,ang:0},{x:560,y:230,ang:0}]; } },
      { q:'마주본 극이 같은 이 두 자석은 어떻게 될까요?', ch:['서로 밀어내요','서로 끌려요','달라붙어요'], a:0,
        scn:function(){ view='lines'; mags=[{x:340,y:230,ang:0},{x:560,y:230,ang:Math.PI}]; } },
      { q:'보라색 자기력선은 어느 쪽으로 갈까요?', ch:['N극에서 나와 S극으로','S극에서 나와 N극으로','극과 상관없어요'], a:0,
        scn:function(){ view='lines'; mags=oneMag(); } },
      { q:'나침반 바늘이 가리키는 것은 무엇일까요?', ch:['자석이 만든 자기장의 방향','바람이 부는 방향','해가 뜨는 방향'], a:0,
        scn:function(){ view='compass'; mags=oneMag(); } },
      { q:'철 클립이 자석에 잘 붙는 까닭은?', ch:['철로 만들어져서','플라스틱이라서','아주 가벼워서'], a:0,
        scn:function(){ view='lines'; mags=oneMag(); } }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      QUIZ[qIdx].scn();
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var rot=mags.map(function(m,i){return '<button class="mg-btn" data-rot="'+i+'" style="'+btn+'background:#fff;color:#7048E8;border-color:#7048E8;">↻ 자석'+(mags.length>1?(i+1):'')+' 돌리기</button>';}).join('');
      var top=ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      var viewRow='<div style="display:flex;gap:7px;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-view'+(view==='lines'?' on':'')+'" data-view="lines" style="'+btn+'border-color:#7048E8;'+(view==='lines'?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🧲 자기력선</button>'
          +'<button class="mg-view'+(view==='compass'?' on':'')+'" data-view="compass" style="'+btn+'border-color:#7048E8;'+(view==='compass'?'background:#7048E8;color:#fff;':'background:#fff;color:#7048E8;')+'">🧭 나침반</button>'
        +'</div>';
      var cntRow='<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:6px;">'
          +'<button class="mg-btn" data-cnt="1" style="'+btn+(mags.length===1?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 1개</button>'
          +'<button class="mg-btn" data-cnt="2" style="'+btn+(mags.length===2?'background:#1565C0;color:#fff;':'background:#fff;color:#1565C0;')+'">자석 2개</button>'
          +'<span style="width:6px;"></span>'+rot
        +'</div>';
      var hint='<div style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;">자석을 끌어 옮기고, \'돌리기\'로 방향을 바꿔요. '+(view==='lines'?'보라색 선이 자기력선이에요(N극→S극).':'나침반 바늘(빨강이 N극)이 자기장 방향을 가리켜요.')+'</div>';
      var mid=viewRow+cntRow+hint;
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(MISSIONS[mStep].text,mStep,MISSIONS.length); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); mid=''; foot=ui.choices(quizChoices()); }
      el.innerHTML='<style>.mg-btn:active,.kl-choice:active{transform:translateY(2px);}.mg-stage{cursor:default;touch-action:none;}.mg-mag{cursor:grab;}.mg-stage.drag .mg-mag{cursor:grabbing;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.mg-view.on{background:#7048E8 !important;color:#fff !important;}</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="mg-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'42vh')+';min-height:'+(mode==='quiz'?'260':'330')+'px;background:radial-gradient(120% 120% at 50% 25%,#FCFEFF 0%,#EFF4F9 75%,#E2EAF3 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="mg-status" style="text-align:center;margin-top:10px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;line-height:1.4;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false; rotCount=0; rotInCompass=false;
        view='lines'; mags=oneMag();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      bind(); render();
    }

    var stage;
    function compass(svg,x,y){
      var f=field(x,y), ang=Math.atan2(f[1],f[0]), L=15;
      var nx=x+Math.cos(ang)*L, ny=y+Math.sin(ang)*L, sx=x-Math.cos(ang)*L, sy=y-Math.sin(ang)*L;
      var px=Math.cos(ang+Math.PI/2)*4, py=Math.sin(ang+Math.PI/2)*4;
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:17,fill:'#fff','fill-opacity':0.5,stroke:'#C7D4E0','stroke-width':1}));
      svg.appendChild(svgEl('path',{d:'M '+nx+' '+ny+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:C.N}));
      svg.appendChild(svgEl('path',{d:'M '+sx+' '+sy+' L '+(x+px)+' '+(y+py)+' L '+(x-px)+' '+(y-py)+' Z',fill:'#ADB5BD'}));
      svg.appendChild(svgEl('circle',{cx:x,cy:y,r:2.5,fill:C.ink}));
    }
    function magnet(svg,m,i){
      var g=svgEl('g',{class:'mg-mag','data-mag':i,transform:'rotate('+(m.ang*180/Math.PI)+' '+m.x+' '+m.y+')'});
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2+4,width:ML*2,height:MW,rx:8,fill:'#1A3357','fill-opacity':0.16}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML,height:MW,rx:8,fill:C.S}));
      g.appendChild(svgEl('rect',{x:m.x,y:m.y-MW/2,width:ML,height:MW,rx:8,fill:C.N}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML*2,height:MW,rx:8,fill:'none',stroke:'#fff','stroke-width':2,'stroke-opacity':0.5}));
      g.appendChild(svgEl('rect',{x:m.x-ML,y:m.y-MW/2,width:ML*2,height:MW*0.4,rx:8,fill:'#fff','fill-opacity':0.18}));
      var tS=svgEl('text',{x:m.x-ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tS.textContent='S';g.appendChild(tS);
      var tN=svgEl('text',{x:m.x+ML/2,y:m.y+8,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#fff'});tN.textContent='N';g.appendChild(tN);
      svg.appendChild(g);
    }
    function render(){
      stage=el.querySelector('.mg-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      if(view==='lines'){ fieldLines(svg); }
      else { var cols=11, rows=6, mx=70, my=60;
        for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var x=mx+(VBW-2*mx)*c/(cols-1), y=my+(VBH-2*my)*r/(rows-1); compass(svg,x,y);} }
      mags.forEach(function(m,i){magnet(svg,m,i);});
      stage.appendChild(svg);
      renderStatus();
      checkMission();
    }
    function renderStatus(){
      var s=el.querySelector('.mg-status');
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:19px;">그림 속 자석과 자기장을 보고 답을 골라요!</div>'; return; }
      if(mags.length===1){
        s.textContent='자기력선이 자석을 빙 둘러 N극에서 나와 S극으로 들어가요 — 이게 눈에 안 보이는 자기장이에요. 자석을 돌려도 자기장이 함께 따라 돌아요.';
        return;
      }
      var f=facing(), msg, sub, col=C.sub;
      if(!f.near){ msg='두 자석이 멀어요'; sub='가까이 옮기면 두 자석 사이 자기장이 서로 영향을 줘요.'; }
      else if(f.kind==='attract'){ msg='<span style="color:'+C.good+';">서로 끌려요 🧲</span>'; sub='마주본 극이 다르면(N–S) 자기력선이 한 자석에서 다른 자석으로 이어져 서로 당겨요.'; }
      else { msg='<span style="color:'+C.N+';">서로 밀어내요 💢</span>'; sub='마주본 극이 같으면(N–N 또는 S–S) 자기력선이 부딪쳐 갈라지고 서로 밀어내요.'; }
      s.innerHTML='<div style="font-size:21px;">'+msg+'</div><div style="font-size:17px;color:'+C.sub+';margin-top:4px;">'+sub+'</div>';
    }
    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){if(mode==='quiz')return;var g=e.target.closest?e.target.closest('.mg-mag'):null;if(!g)return;var i=+g.getAttribute('data-mag');var P=pt(e);drag={i:i,ox:P[0]-mags[i].x,oy:P[1]-mags[i].y};stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
    function move(e){if(!drag)return;var P=pt(e);mags[drag.i].x=Math.max(ML,Math.min(P[0]-drag.ox,VBW-ML));mags[drag.i].y=Math.max(MW,Math.min(P[1]-drag.oy,VBH-MW));render();}
    function up(){drag=null;if(stage)stage.classList.remove('drag');}
    function bind(){
      stage=el.querySelector('.mg-stage');
      stage.addEventListener('mousedown',down); stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){move(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      el.querySelectorAll('[data-view]').forEach(function(b){b.addEventListener('click',function(){if(view!==b.dataset.view){view=b.dataset.view;buildUI();}});});
      el.querySelectorAll('[data-cnt]').forEach(function(b){b.addEventListener('click',function(){var n=+b.dataset.cnt;if(n!==mags.length){mags=(n===2)?[{x:330,y:250,ang:0},{x:580,y:250,ang:Math.PI}]:[{x:450,y:250,ang:0}];buildUI();}});});
      el.querySelectorAll('[data-rot]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.rot;mags[i].ang+=Math.PI/6;rotCount++;if(view==='compass')rotInCompass=true;render();});});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ newQuiz(); buildUI(); },1500);
        });
      });
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
