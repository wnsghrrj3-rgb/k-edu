/* ============================================================================
   케이랩 도구 모듈 — 빛·그림자 (light) v2  [과학 4호 · 완성도]
   4학년 그림자와 거울.
     [그림자] 모드: 광원·물체 옮기며 빛 직진→그림자 (v1).
     [거울] 모드: 광원에서 광선을 쏘고 거울을 돌려, 입사각=반사각으로 빛이 튕기는
        광선 경로를 추적해서 봄. 거울 회전·이동.
   - 의존: window.KLab (순수 SVG)
   - config: { mode:"shadow"|"mirror"(기본shadow) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={light:'#FFD43B',ray:'#FFA94D',rayHot:'#FF922B',shadow:'#3A4A5C',ink:'#1B3A57',sub:'#5a7894',screen:'#CED4DA',mirror:'#74C0FC'};
  window.KLab.register('light', function (el, config) {
    var mode=(config.mode==='mirror')?'mirror':'shadow';
    var src={x:130,y:200}, obj={x:430,y:230,h:150}, mir={x:540,y:270,ang:-0.78,len:220};
    var SCRX=810, TOP=45, BOT=415, VBW=900, VBH=460;
    var btn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    var mbtn='font-size:21px;padding:10px 18px;border-radius:14px;border:3px solid #1565C0;background:#fff;color:#1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}

    function buildUI(){
      var rot = mode==='mirror' ? '<button class="lt-btn" data-act="rot" style="'+btn+'background:#fff;color:#7048E8;">↻ 거울 돌리기</button>' : '';
      el.innerHTML='<style>.lt-btn:active,.lt-mode:active{transform:translateY(2px);}.lt-mode.on{background:#1565C0 !important;color:#fff !important;}.lt-stage{touch-action:none;}.lt-grab{cursor:grab;}.lt-stage.drag .lt-grab{cursor:grabbing;}</style>'
        +'<div style="display:flex;gap:8px;justify-content:center;margin-bottom:7px;">'
          +'<button class="lt-mode'+(mode==='shadow'?' on':'')+'" data-mode="shadow" style="'+mbtn+'">그림자</button>'
          +'<button class="lt-mode'+(mode==='mirror'?' on':'')+'" data-mode="mirror" style="'+mbtn+'">거울 반사</button>'
          +(rot?'<span style="width:6px;"></span>'+rot:'')
        +'</div>'
        +'<div class="lt-hint" style="text-align:center;font-size:15px;color:'+C.sub+';margin-bottom:6px;"></div>'
        +'<div class="lt-stage" style="width:100%;height:45vh;min-height:340px;background:radial-gradient(120% 120% at 18% 30%,#FFFDF3 0%,#EEF2F7 70%,#E1E8F0 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="lt-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;color:'+C.sub+';font-size:18px;"></div>';
      el.querySelector('.lt-hint').textContent = mode==='shadow'
        ? '💡 전구와 물체를 끌어 옮겨요. 빛이 곧게 가다 물체에 막히면 그림자가 생겨요.'
        : '💡 전구를 끌어 옮기고 거울을 돌려요. 빛이 거울에 부딪히면 입사각=반사각으로 튕겨요.';
      bind(); render();
    }

    function sun(svg,x,y){var g=svgEl('g',{class:'lt-grab','data-grab':'src'});
      for(var a=0;a<360;a+=30){var r=a*Math.PI/180;g.appendChild(svgEl('line',{x1:x+24*Math.cos(r),y1:y+24*Math.sin(r),x2:x+34*Math.cos(r),y2:y+34*Math.sin(r),stroke:'#FCC419','stroke-width':4,'stroke-linecap':'round'}));}
      g.appendChild(svgEl('circle',{cx:x,cy:y,r:22,fill:'#FFE066',stroke:'#F59F00','stroke-width':3}));svg.appendChild(g);}

    var stage;
    function render(){
      stage=el.querySelector('.lt-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      if(mode==='shadow') renderShadow(svg); else renderMirror(svg);
      stage.appendChild(svg); renderStatus();
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
      if(mode==='shadow'){
        if(src.x>=obj.x){s.textContent='전구를 물체 왼쪽으로 옮기면 그림자가 스크린에 생겨요.';return;}
        s.textContent='빛은 곧게 나아가요. 물체에 막힌 곳 뒤로 그림자가 생겨요 — '+(obj.x-src.x<200?'전구가 가까워 그림자가 커요.':'전구가 멀어 그림자가 작아요.');
      } else {
        s.textContent='빛이 거울에 부딪히면 들어온 각(입사각)과 똑같은 각(반사각)으로 튕겨 나가요. 거울을 돌리면 반사 방향이 바뀌어요.';
      }
    }

    var drag=null;
    function pt(e){var r=stage.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return [(p.clientX-r.left)/r.width*VBW,(p.clientY-r.top)/r.height*VBH];}
    function down(e){var g=e.target.closest?e.target.closest('.lt-grab'):null;if(!g)return;drag=g.getAttribute('data-grab');stage.classList.add('drag');e.preventDefault&&e.preventDefault();}
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
      el.querySelectorAll('.lt-mode').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;buildUI();}});});
      var rb=el.querySelector('[data-act="rot"]'); if(rb)rb.addEventListener('click',function(){mir.ang+=Math.PI/12;render();});
    }
    var mm=function(e){move(e);}, mu=function(){up();};
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    buildUI();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
