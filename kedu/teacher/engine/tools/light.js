/* ============================================================================
   케이랩 도구 모듈 — 빛·그림자 (light) v3  [과학 4호 · 3모드]
   4학년 그림자와 거울.
     [그림자] 모드: 광원·물체 옮기며 빛 직진→그림자 (v1).
     [거울] 모드: 광원에서 광선을 쏘고 거울을 돌려, 입사각=반사각으로 빛이 튕기는
        광선 경로를 추적해서 봄. 거울 회전·이동.
   - 의존: window.KLab (순수 SVG)
   v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 실험 토글 exp=그림자|거울.
   - config: { exp:"shadow"|"mirror"(기본shadow), mode:"free"|"mission"|"quiz" }
     (옛 config.mode="mirror"도 거울 진입으로 호환)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={light:'#FFD43B',ray:'#FFA94D',rayHot:'#FF922B',shadow:'#3A4A5C',ink:'#1B3A57',sub:'#5a7894',screen:'#CED4DA',mirror:'#74C0FC'};
  window.KLab.register('light', function (el, config) {
    var ui=window.KLab.ui;
    var mode=(['free','mission','quiz'].indexOf(config.mode)>=0)?config.mode:'free';
    var exp=(config.mode==='mirror'||config.exp==='mirror')?'mirror':'shadow';
    var src={x:130,y:200}, obj={x:430,y:230,h:150}, mir={x:540,y:270,ang:-0.78,len:220};
    var SCRX=810, TOP=45, BOT=415, VBW=900, VBH=460;
    var btn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #1565C0;background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}

    // 중심 광선의 반사 방향 (거울 미션 판정)
    function centralReflect(){
      var base=Math.atan2(mir.y-src.y,mir.x-src.x), dx=Math.cos(base), dy=Math.sin(base);
      var hit=rayMirror(src.x,src.y,dx,dy); if(!hit)return null;
      var nx=-Math.sin(mir.ang), ny=Math.cos(mir.ang);
      var dot=dx*nx+dy*ny; return {rx:dx-2*dot*nx, ry:dy-2*dot*ny};
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { exp:'shadow', text:'💡 전구를 물체 <b style="color:#7048E8;">가까이</b> 옮겨 그림자를 크게 만들어 봐요!',
        check:function(){ return exp==='shadow' && src.x<obj.x && (obj.x-src.x)<200; } },
      { exp:'shadow', text:'💡 이번엔 전구를 <b style="color:#7048E8;">멀리</b> 옮겨 그림자를 작게 만들어 봐요!',
        check:function(){ return exp==='shadow' && src.x<obj.x && (obj.x-src.x)>420; } },
      { exp:'mirror', text:'🪞 거울을 돌려 반사된 주황 빛을 <b style="color:#7048E8;">위쪽</b>으로 보내 봐요!',
        check:function(){ if(exp!=='mirror')return false; var r=centralReflect(); return !!r && r.ry<-0.4; } },
      { exp:'mirror', text:'🪞 이번엔 빛을 <b style="color:#7048E8;">아래 바닥 쪽</b>으로 보내 봐요!',
        check:function(){ if(exp!=='mirror')return false; var r=centralReflect(); return !!r && r.ry>0.4; } }
    ];
    var mStep=0,mDone=false,mLock=false;
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=그림자 만들기 / 중=광원 위치와 그림자 크기(직진) / 고=거울 반사(입사각=반사각). 그림자/거울 토글은 고학년만. */
    var GRADES={
      low:  { mIdx:[0],         showExp:false },
      mid:  { mIdx:[0,1],       showExp:false },
      high: { mIdx:[0,1,2,3],   showExp:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function curMissions(){ return GRADES[grade].mIdx.map(function(i){return MISSIONS[i];}); }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0;mDone=false;mLock=false; exp='shadow';
      src={x:130,y:200}; obj={x:430,y:230,h:150}; mir={x:540,y:270,ang:-0.78,len:220};
      buildUI();
    }});
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      if(curMissions()[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          var CM=curMissions(); if(mStep<CM.length-1){ mStep++; exp=CM[mStep].exp; } else mDone=true;
          buildUI();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (빛 장면을 보고 답하기) ───────────── */
    var QUIZ=[
      { exp:'shadow', q:'그림자는 물체의 어느 쪽에 생길까요?', ch:['빛의 반대쪽 (물체 뒤)','빛이 오는 쪽','아무 데나 생겨요'], a:0 },
      { exp:'shadow', q:'전구를 물체에 더 가까이 가져가면 그림자는?', ch:['더 커져요','더 작아져요','없어져요'], a:0 },
      { exp:'shadow', q:'빛은 어떻게 나아갈까요?', ch:['곧게 나아가요','구불구불 휘어 가요','제자리에 멈춰요'], a:0 },
      { exp:'mirror', q:'빛이 거울에 부딪히면 어떻게 될까요?', ch:['들어온 각과 같은 각으로 튕겨요','거울을 그냥 통과해요','빛이 사라져요'], a:0 },
      { exp:'shadow', q:'그림자가 생기려면 꼭 필요한 두 가지는?', ch:['빛과 빛을 막는 물체','소리와 바람','물과 공기'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
      src={x:130,y:200}; obj={x:430,y:230,h:150}; mir={x:540,y:270,ang:-0.78,len:220};
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i,label:'<span style="font-size:19px;">'+q.ch[i]+'</span>'}; });
    }

    function buildUI(){
      var rot = exp==='mirror' ? '<button class="lt-btn" data-act="rot" style="'+btn+'background:#fff;color:#7048E8;">↻ 거울 돌리기</button>' : '';
      var top=bands.selectorHTML()+ui.modeTabs(['free','mission','quiz'],mode), bar='', foot='';
      var expRow=GRADES[grade].showExp?('<div style="display:flex;gap:8px;justify-content:center;margin-bottom:7px;">'
          +'<button class="lt-mode'+(exp==='shadow'?' on':'')+'" data-mode="shadow" style="'+mbtn+'">그림자</button>'
          +'<button class="lt-mode'+(exp==='mirror'?' on':'')+'" data-mode="mirror" style="'+mbtn+'">거울 반사</button>'
          +(rot?'<span style="width:6px;"></span>'+rot:'')
        +'</div>'):(rot?'<div style="display:flex;justify-content:center;margin-bottom:7px;">'+rot+'</div>':'');
      var hint='<div class="lt-hint" style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;"></div>';
      var mid=expRow+hint;
      if(mode==='mission'){ var CMB=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(CMB[mStep].text,mStep,CMB.length); mid=(exp==='mirror'&&rot?'<div style="display:flex;justify-content:center;margin-bottom:7px;">'+rot+'</div>':''); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); mid=''; foot=ui.choices(quizChoices()); }
      el.innerHTML='<style>.lt-btn:active,.lt-mode:active,.kl-choice:active{transform:translateY(2px);}.lt-mode.on{background:#1565C0 !important;color:#fff !important;}'
        +'.kl-choice{min-width:auto !important;padding:14px 18px !important;}'
        +'.lt-stage{touch-action:none;}.lt-grab{cursor:grab;}.lt-stage.drag .lt-grab{cursor:grabbing;}</style>'
        + top + bar + mid
        +'<div class="kl-stage-host" style="position:relative;"><div class="lt-stage" style="width:100%;height:'+(mode==='quiz'?'36vh':'45vh')+';min-height:'+(mode==='quiz'?'260':'340')+'px;background:radial-gradient(120% 120% at 18% 30%,#FFFDF3 0%,#EEF2F7 70%,#E1E8F0 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="lt-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0;mDone=false;mLock=false;
        src={x:130,y:200}; obj={x:430,y:230,h:150}; mir={x:540,y:270,ang:-0.78,len:220};
        if(m==='mission')exp=curMissions()[0].exp;
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        buildUI();
      });
      var hh=el.querySelector('.lt-hint'); if(hh)hh.textContent = exp==='shadow'
        ? '💡 전구와 물체를 끌어 옮겨요. 빛이 곧게 가다 물체에 막히면 그림자가 생겨요.'
        : '💡 전구를 끌어 옮기고 거울을 돌려요. 빛이 거울에 부딪히면 입사각=반사각으로 튕겨요.';
      bind(); render(); bands.bind(el);
    }

    function sun(svg,x,y){var g=svgEl('g',{class:'lt-grab','data-grab':'src'});
      for(var a=0;a<360;a+=30){var r=a*Math.PI/180;g.appendChild(svgEl('line',{x1:x+24*Math.cos(r),y1:y+24*Math.sin(r),x2:x+34*Math.cos(r),y2:y+34*Math.sin(r),stroke:'#FCC419','stroke-width':4,'stroke-linecap':'round'}));}
      g.appendChild(svgEl('circle',{cx:x,cy:y,r:22,fill:'#FFE066',stroke:'#F59F00','stroke-width':3}));svg.appendChild(g);}

    var stage;
    function render(){
      stage=el.querySelector('.lt-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      if((mode==='quiz'?QUIZ[qIdx].exp:exp)==='shadow') renderShadow(svg); else renderMirror(svg);
      stage.appendChild(svg); renderStatus(); checkMission();
    }

    // ── 그림자 모드 (v1)
    function hitScreen(px,py){if(px<=src.x)return null;return src.y+(py-src.y)*(SCRX-src.x)/(px-src.x);}
    function renderShadow(svg){
      var oy1=obj.y-obj.h/2, oy2=obj.y+obj.h/2;
      if(src.x<SCRX)svg.appendChild(svgEl('path',{d:'M '+src.x+' '+src.y+' L '+SCRX+' '+TOP+' L '+SCRX+' '+BOT+' Z',fill:C.light,'fill-opacity':0.16}));
      var y1=hitScreen(obj.x,oy1), y2=hitScreen(obj.x,oy2);
      if(src.x<obj.x&&y1!=null&&y2!=null){
        svg.appendChild(svgEl('path',{d:'M '+obj.x+' '+oy1+' L '+SCRX+' '+y1+' L '+SCRX+' '+y2+' L '+obj.x+' '+oy2+' Z',fill:C.shadow,'fill-opacity':0.30}));
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:y1,stroke:C.ray,'stroke-width':2,'stroke-dasharray':'7 6'}));
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:y2,stroke:C.ray,'stroke-width':2,'stroke-dasharray':'7 6'}));
        svg.appendChild(svgEl('line',{x1:SCRX-4,y1:Math.max(TOP,Math.min(y1,y2)),x2:SCRX-4,y2:Math.min(BOT,Math.max(y1,y2)),stroke:C.shadow,'stroke-width':9,'stroke-opacity':0.85,'stroke-linecap':'round'}));
      }
      for(var k=0;k<=6;k++){var ty=TOP+(BOT-TOP)*k/6;svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:ty,stroke:C.ray,'stroke-width':1.5,'stroke-opacity':0.32}));}
      svg.appendChild(svgEl('rect',{x:SCRX,y:TOP-10,width:24,height:BOT-TOP+20,rx:5,fill:C.screen,stroke:'#9AA7B4','stroke-width':2}));
      var og=svgEl('g',{class:'lt-grab','data-grab':'obj'});
      og.appendChild(svgEl('rect',{x:obj.x-15,y:oy1,width:30,height:obj.h,rx:8,fill:'#495057',stroke:'#212529','stroke-width':2}));
      svg.appendChild(og); sun(svg,src.x,src.y);
    }

    // ── 거울 모드 (광선 추적)
    function mP(){var hx=Math.cos(mir.ang)*mir.len/2, hy=Math.sin(mir.ang)*mir.len/2;return [[mir.x-hx,mir.y-hy],[mir.x+hx,mir.y+hy]];}
    function rayMirror(ox,oy,dx,dy){var m=mP(),p1=m[0],p2=m[1],ex=p2[0]-p1[0],ey=p2[1]-p1[1];
      var den=dx*ey-dy*ex; if(Math.abs(den)<1e-6)return null;
      var t=((p1[0]-ox)*ey-(p1[1]-oy)*ex)/den, s=((p1[0]-ox)*dy-(p1[1]-oy)*dx)/den;
      if(t>0.5&&s>=0&&s<=1)return {t:t,x:ox+dx*t,y:oy+dy*t}; return null;}
    function renderMirror(svg){
      var m=mP();
      // 거울 (반사면 + 뒷면 빗금)
      svg.appendChild(svgEl('line',{x1:m[0][0],y1:m[0][1],x2:m[1][0],y2:m[1][1],stroke:C.mirror,'stroke-width':7,'stroke-linecap':'round'}));
      var nx=-Math.sin(mir.ang), ny=Math.cos(mir.ang);
      for(var i=0;i<=10;i++){var px=m[0][0]+(m[1][0]-m[0][0])*i/10, py=m[0][1]+(m[1][1]-m[0][1])*i/10;
        svg.appendChild(svgEl('line',{x1:px,y1:py,x2:px-nx*11,y2:py-ny*11,stroke:'#A5D8FF','stroke-width':3}));}
      // 광선들 (S에서 거울 향해 부채꼴)
      var base=Math.atan2(mir.y-src.y,mir.x-src.x);
      for(var r=-4;r<=4;r++){var ang=base+r*0.06, dx=Math.cos(ang), dy=Math.sin(ang);
        var hit=rayMirror(src.x,src.y,dx,dy);
        if(hit){
          svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:hit.x,y2:hit.y,stroke:C.ray,'stroke-width':2.5,'stroke-opacity':0.85}));
          var dot=dx*nx+dy*ny, rx=dx-2*dot*nx, ry=dy-2*dot*ny;
          svg.appendChild(svgEl('line',{x1:hit.x,y1:hit.y,x2:hit.x+rx*900,y2:hit.y+ry*900,stroke:C.rayHot,'stroke-width':2.5,'stroke-opacity':0.85}));
        } else {
          svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:src.x+dx*1200,y2:src.y+dy*1200,stroke:C.ray,'stroke-width':2,'stroke-opacity':0.5}));
        }
      }
      // 법선(중심) 표시
      svg.appendChild(svgEl('line',{x1:mir.x,y1:mir.y,x2:mir.x-nx*40,y2:mir.y-ny*40,stroke:'#ADB5BD','stroke-width':1.5,'stroke-dasharray':'4 4'}));
      // 거울 드래그 핸들
      svg.appendChild(svgEl('circle',{cx:mir.x,cy:mir.y,r:30,fill:'transparent',class:'lt-grab','data-grab':'mir'}));
      sun(svg,src.x,src.y);
    }

    function renderStatus(){
      var s=el.querySelector('.lt-status');
      if(mode==='quiz'){ s.textContent='그림 속 빛을 잘 보고 답을 골라요!'; return; }
      if(exp==='shadow'){
        if(src.x>=obj.x){s.textContent='전구를 물체 왼쪽으로 옮기면 그림자가 스크린에 생겨요.';return;}
        s.textContent='빛은 곧게 나아가요. 물체에 막힌 곳 뒤로 그림자가 생겨요 — '+(obj.x-src.x<200?'전구가 가까워 그림자가 커요.':'전구가 멀어 그림자가 작아요.');
      } else {
        s.textContent='빛이 거울에 부딪히면 들어온 각(입사각)과 똑같은 각(반사각)으로 튕겨 나가요. 거울을 돌리면 반사 방향이 바뀌어요.';
      }
    }

    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){if(mode==='quiz')return;var g=e.target.closest?e.target.closest('.lt-grab'):null;if(!g)return;drag=g.getAttribute('data-grab');stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
    function move(e){if(!drag)return;var P=pt(e);
      if(drag==='src'){src.x=Math.max(40,Math.min(P[0],VBW-40));src.y=Math.max(TOP,Math.min(P[1],BOT));}
      else if(drag==='obj'){obj.x=Math.max(120,Math.min(P[0],SCRX-60));obj.y=Math.max(TOP+obj.h/2,Math.min(P[1],BOT-obj.h/2));}
      else if(drag==='mir'){mir.x=Math.max(260,Math.min(P[0],VBW-80));mir.y=Math.max(TOP+40,Math.min(P[1],BOT-40));}
      render();}
    function up(){drag=null;if(stage)stage.classList.remove('drag');}
    function bind(){
      stage=el.querySelector('.lt-stage');
      stage.addEventListener('mousedown',down); stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){move(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
      el.querySelectorAll('.lt-mode').forEach(function(b){b.addEventListener('click',function(){if(exp!==b.dataset.mode){exp=b.dataset.mode;buildUI();}});});
      var rb=el.querySelector('[data-act="rot"]'); if(rb)rb.addEventListener('click',function(){mir.ang+=Math.PI/12;render();});
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
