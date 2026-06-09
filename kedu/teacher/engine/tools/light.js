/* ============================================================================
   케이랩 도구 모듈 — 빛·그림자 (light) v1  [과학 4호]
   4학년 그림자와 거울 (빛의 직진).
     변수 → 현상 → 발견:
       ▸ 광원(전구)과 물체를 끌어 옮김
       ▸ 빛은 곧게 나아가고, 물체에 막힌 곳 뒤로 그림자가 생김(스크린에 맺힘)
       ▸ 광원이 물체에 가까울수록 그림자가 커지고, 광원 위치 따라 방향·크기 변함
       ▸ "빛은 직진한다 → 막히면 그림자"
   - 의존: window.KLab (순수 SVG)
   - config: { } (기본 배치)
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={light:'#FFD43B',ray:'#FFC078',shadow:'#3A4A5C',ink:'#1B3A57',sub:'#5a7894',screen:'#CED4DA'};
  window.KLab.register('light', function (el, config) {
    var src={x:130,y:230}, obj={x:430,y:230,h:150}, SCRX=810, TOP=45, BOT=415;
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=460;

    function hitScreen(px,py){ // 광원→(px,py) 직선이 x=SCRX와 만나는 y
      if(px<=src.x) return null; return src.y + (py-src.y)*(SCRX-src.x)/(px-src.x); }

    function buildUI(){
      el.innerHTML='<style>.lt-stage{touch-action:none;}.lt-grab{cursor:grab;}.lt-stage.drag .lt-grab{cursor:grabbing;}</style>'
        +'<div style="text-align:center;font-size:16px;color:'+C.sub+';margin:4px 0 8px;">💡 전구와 물체를 끌어 옮겨 보세요. 빛이 곧게 나아가다 물체에 막히면 뒤에 그림자가 생겨요.</div>'
        +'<div class="lt-stage" style="width:100%;height:48vh;min-height:350px;background:radial-gradient(120% 120% at 18% 30%,#FFFDF3 0%,#EEF2F7 70%,#E1E8F0 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="lt-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;"></div>';
      bind(); render();
    }

    var stage;
    function render(){
      stage=el.querySelector('.lt-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<radialGradient id="ltSun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF9DB"/><stop offset="60%" stop-color="#FFE066"/><stop offset="100%" stop-color="#FCC419"/></radialGradient>';svg.appendChild(d);
      var oy1=obj.y-obj.h/2, oy2=obj.y+obj.h/2;
      // 빛 영역(광원 → 스크린 전체) 노랑
      if(src.x<SCRX){
        svg.appendChild(svgEl('path',{d:'M '+src.x+' '+src.y+' L '+SCRX+' '+TOP+' L '+SCRX+' '+BOT+' Z',fill:C.light,'fill-opacity':0.16}));
      }
      // 그림자 영역(물체 뒤) — 물체 위끝/아래끝 광선이 스크린에 맺히는 사이
      var y1=hitScreen(obj.x,oy1), y2=hitScreen(obj.x,oy2);
      if(src.x<obj.x && y1!=null && y2!=null){
        svg.appendChild(svgEl('path',{d:'M '+obj.x+' '+oy1+' L '+SCRX+' '+y1+' L '+SCRX+' '+y2+' L '+obj.x+' '+oy2+' Z',fill:C.shadow,'fill-opacity':0.30}));
        // 광선 경계(점선)
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:y1,stroke:C.ray,'stroke-width':2,'stroke-dasharray':'7 6'}));
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:y2,stroke:C.ray,'stroke-width':2,'stroke-dasharray':'7 6'}));
        // 스크린에 맺힌 그림자(진하게)
        svg.appendChild(svgEl('line',{x1:SCRX-4,y1:Math.max(TOP,Math.min(y1,y2)),x2:SCRX-4,y2:Math.min(BOT,Math.max(y1,y2)),stroke:C.shadow,'stroke-width':9,'stroke-opacity':0.85,'stroke-linecap':'round'}));
      }
      // 직진 광선 몇 줄(광원→스크린, 물체 안 막힌 곳)
      for(var k=0;k<=6;k++){var ty=TOP+(BOT-TOP)*k/6;
        svg.appendChild(svgEl('line',{x1:src.x,y1:src.y,x2:SCRX,y2:ty,stroke:C.ray,'stroke-width':1.5,'stroke-opacity':0.35}));}
      // 스크린(벽)
      svg.appendChild(svgEl('rect',{x:SCRX,y:TOP-10,width:24,height:BOT-TOP+20,rx:5,fill:C.screen,stroke:'#9AA7B4','stroke-width':2}));
      // 물체(막대)
      var og=svgEl('g',{class:'lt-grab','data-grab':'obj'});
      og.appendChild(svgEl('rect',{x:obj.x-15,y:oy1,width:30,height:obj.h,rx:8,fill:'#495057',stroke:'#212529','stroke-width':2}));
      og.appendChild(svgEl('rect',{x:obj.x-15,y:oy1,width:11,height:obj.h,rx:8,fill:'#fff','fill-opacity':0.15}));
      svg.appendChild(og);
      // 광원(전구/태양)
      var sg=svgEl('g',{class:'lt-grab','data-grab':'src'});
      for(var a=0;a<360;a+=30){var rad=a*Math.PI/180;sg.appendChild(svgEl('line',{x1:src.x+24*Math.cos(rad),y1:src.y+24*Math.sin(rad),x2:src.x+34*Math.cos(rad),y2:src.y+34*Math.sin(rad),stroke:'#FCC419','stroke-width':4,'stroke-linecap':'round'}));}
      sg.appendChild(svgEl('circle',{cx:src.x,cy:src.y,r:22,fill:'url(#ltSun)',stroke:'#F59F00','stroke-width':3}));
      svg.appendChild(sg);
      stage.appendChild(svg);
      renderStatus(y1,y2);
    }
    function renderStatus(y1,y2){
      var s=el.querySelector('.lt-status');
      if(src.x>=obj.x){s.textContent='전구가 물체보다 오른쪽에 있어요. 전구를 물체 왼쪽으로 옮기면 그림자가 스크린에 생겨요.';return;}
      var sh=(y1!=null&&y2!=null)?Math.abs(y2-y1):0;
      var dist=obj.x-src.x;
      s.textContent='빛은 곧게 나아가요. 물체에 막힌 곳 뒤로 그림자가 생겨요 — '+(dist<200?'전구가 물체에 가까워 그림자가 커요.':'전구가 멀어 그림자가 또렷하고 작아요.');
    }

    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){var g=e.target.closest?e.target.closest('.lt-grab'):null;if(!g)return;drag=g.getAttribute('data-grab');stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
    function move(e){if(!drag)return;var P=pt(e);
      if(drag==='src'){src.x=Math.max(40,Math.min(P[0],SCRX-40));src.y=Math.max(TOP,Math.min(P[1],BOT));}
      else{obj.x=Math.max(120,Math.min(P[0],SCRX-60));obj.y=Math.max(TOP+obj.h/2,Math.min(P[1],BOT-obj.h/2));}
      render();}
    function up(){drag=null;if(stage)stage.classList.remove('drag');}
    function bind(){
      stage=el.querySelector('.lt-stage');
      stage.addEventListener('mousedown',down);
      stage.addEventListener('touchstart',down,{passive:false});
      stage.addEventListener('touchmove',function(e){if(drag){move(e);e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',up);
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
