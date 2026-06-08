/* ============================================================================
   케이랩 도구 모듈 — 각도기 (angle) v2
   v2 초점 = "각도기를 쓸 줄 알게" + 양쪽에서 재기 (준호 2026-06-08 피드백)
     ▸ 양방향 눈금: 0이 오른쪽인 줄 + 0이 왼쪽인 줄 (실제 각도기 그대로).
     ▸ 시작 변 토글: [오른쪽 0에서] / [왼쪽 0에서] — 양쪽에서 각을 시작.
     ▸ 사용 안내(showGuide): ①중심을 꼭짓점에 ②한 변을 0에 ③다른 변의 눈금을
       읽기. 읽어야 할 눈금을 하이라이트 + 화살표로 콕 집어줌 → 혼자서도 익힘.
   v1 자산(드래그/±/예각·직각·둔각·평각 분류) 유지.
   - 의존: window.KLab
   - config: { deg(기본50), step(기본5), startSide:"right"|"left"(기본right),
               showGuide(기본true) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('angle', function (el, config) {
    var deg=(typeof config.deg==='number')?Math.max(0,Math.min(config.deg,180)):50;
    var step=config.step||5;
    var startSide=(config.startSide==='left')?'left':'right';
    var guide=(config.showGuide!==false);
    var btn='font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tgl='font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function ui(){
      el.innerHTML='<style>.ag-btn:active,.ag-side:active{transform:translateY(2px);}.ag-stage{cursor:grab;}.ag-stage.drag{cursor:grabbing;}.ag-side.on{background:#0B7285 !important;color:#fff !important;}</style>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
          +'<button class="ag-side'+(startSide==='left'?' on':'')+'" data-side="left" style="'+tgl+'">◀ 왼쪽 0에서</button>'
          +'<button class="ag-side'+(startSide==='right'?' on':'')+'" data-side="right" style="'+tgl+'">오른쪽 0에서 ▶</button>'
        +'</div>'
        +'<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="ag-btn" data-act="minus" style="'+btn+'background:#fff;color:#1565C0;">－ 각</button>'
          +'<button class="ag-btn" data-act="plus" style="'+btn+'background:#1565C0;color:#fff;">＋ 각</button>'
          +'<button class="ag-btn" data-act="reset" style="font-size:24px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="ag-stage" style="width:100%;height:50vh;min-height:360px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="ag-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';
      bind(); render();
    }
    var stage,statusEl;
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=440, cx=VBW/2, cy=VBH-90, R=260;
    function P(a,r){var rad=a*Math.PI/180;return[cx+r*Math.cos(rad),cy-r*Math.sin(rad)];}
    function kind(d){if(d===0)return['',''];if(d<90)return['예각','#0CA678'];if(d===90)return['직각','#1565C0'];if(d<180)return['둔각','#E8590C'];return['평각','#7048E8'];}
    function txt(svg,x,y,s,sz,fill,fw){var t=svgEl('text',{x:x,y:y,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':sz,'font-weight':fw||800,fill:fill});t.textContent=s;svg.appendChild(t);}

    function render(){
      stage=el.querySelector('.ag-stage'); statusEl=el.querySelector('.ag-status'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="agSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.18"/></filter>';svg.appendChild(d);
      var kc=kind(deg)[1]||'#1565C0', right=(startSide==='right');
      var posA = right? deg : (180-deg);            // 움직이는 변의 화면상 실제 위치 각
      var baseA = right? 0 : 180;                    // 기준 변(0에 맞춘 변)
      // 각 영역(부채꼴)
      if(deg>0){var rr=R*0.60, pb=P(baseA,rr), pm=P(posA,rr), lg=(deg>180)?1:0, sweep=right?0:1;
        svg.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+pb[0]+' '+pb[1]+' A '+rr+' '+rr+' 0 '+lg+' '+sweep+' '+pm[0]+' '+pm[1]+' Z',fill:kc,'fill-opacity':0.15}));}
      // 각도기 반원
      svg.appendChild(svgEl('path',{d:'M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+' Z',fill:'#fff','fill-opacity':0.55,stroke:'#9AB7D4','stroke-width':2,filter:'url(#agSh)'}));
      // 양방향 눈금: 바깥 줄(오른쪽 0) + 안쪽 줄(왼쪽 0)
      for(var a=0;a<=180;a+=10){
        var big=(a%30===0), p1=P(a,R), p2=P(a,big?R-24:R-14);
        svg.appendChild(svgEl('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:'#5a7894','stroke-width':big?2.5:1.5}));
        if(big){
          var pOut=P(a,R-44), pIn=P(a,R-82);
          // 바깥 = 오른쪽0 기준 숫자(a), 안쪽 = 왼쪽0 기준 숫자(180-a)
          var outActive=(right && a===deg), inActive=(!right && (180-a)===deg);
          txt(svg,pOut[0],pOut[1]+6,String(a),outActive?22:16,outActive?kc:'#8AA6C2',outActive?800:600);
          txt(svg,pIn[0],pIn[1]+6,String(180-a),inActive?22:16,inActive?kc:'#B0C4DA',inActive?800:600);
        }
      }
      // 기준 변(0에 맞춘 변) + 움직이는 변
      var base=P(baseA,R), mov=P(posA,R);
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:base[0],y2:base[1],stroke:'#1B3A57','stroke-width':7,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:mov[0],y2:mov[1],stroke:kc,'stroke-width':8,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('circle',{cx:mov[0],cy:mov[1],r:16,fill:kc,stroke:'#fff','stroke-width':4,style:'cursor:grab;'}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:10,fill:'#1B3A57'}));
      // 각도 큰 표시(부채꼴 안)
      var mid=P((baseA+posA)/2,R*0.38); txt(svg,mid[0],mid[1]+10,deg+'°',38,kc);
      // ── 사용 안내
      if(guide){
        // 꼭짓점
        svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:22,fill:'none',stroke:'#E8590C','stroke-width':2.5,'stroke-dasharray':'4 4'}));
        txt(svg,cx,cy+44,'① 중심을 꼭짓점에',18,'#E8590C');
        // 기준 변 안내
        var bl=P(baseA,R*0.78); txt(svg,bl[0],bl[1]+(right?28:28),'② 이 변을 0에',17,'#1B3A57');
        // 읽는 눈금 화살표
        var rd=P(posA,R+4), rd2=P(posA,R+34);
        svg.appendChild(svgEl('line',{x1:rd2[0],y1:rd2[1],x2:rd[0],y2:rd[1],stroke:kc,'stroke-width':3,'marker-end':''}));
        svg.appendChild(svgEl('circle',{cx:rd[0],cy:rd[1],r:5,fill:kc}));
        txt(svg,rd2[0],rd2[1]+(rd2[1]<cy?-8:20),'③ 여기 눈금 읽기',17,kc);
      }
      stage.appendChild(svg);
      var k=kind(deg);
      statusEl.innerHTML='<span style="font-size:32px;color:'+kc+';">'+deg+'°</span>'
        +(k[0]?'<span style="font-size:26px;color:#1B3A57;"> — </span><span style="font-size:32px;color:'+kc+';">'+k[0]+'</span>':'')
        +(guide?'<div style="font-size:18px;color:#5a7894;margin-top:6px;">'+(startSide==='right'?'오른쪽':'왼쪽')+' 변을 0에 맞추고, 다른 변이 가리키는 '+(startSide==='right'?'바깥':'안쪽')+' 눈금을 읽어요</div>':'');
      var pb=el.querySelector('[data-act="plus"]'), mb=el.querySelector('[data-act="minus"]');
      if(pb)pb.disabled=deg>=180; if(mb)mb.disabled=deg<=0;
    }

    var dragging=false;
    function angleFromEvent(e){var rect=stage.getBoundingClientRect();var p=e.touches?e.touches[0]:e;
      var sx=(p.clientX-rect.left)/rect.width*VBW, sy=(p.clientY-rect.top)/rect.height*VBH;
      var a=Math.atan2(cy-sy, sx-cx)*180/Math.PI; a=Math.max(0,Math.min(Math.round(a),180));
      return (startSide==='right')? a : (180-a);}  // 시작 변 기준으로 각 환산
    var mm=function(e){if(dragging){deg=angleFromEvent(e);render();}}, mu=function(){dragging=false;if(stage)stage.classList.remove('drag');};
    function bind(){
      stage=el.querySelector('.ag-stage');
      stage.addEventListener('mousedown',function(e){dragging=true;stage.classList.add('drag');deg=angleFromEvent(e);render();});
      stage.addEventListener('touchstart',function(e){dragging=true;deg=angleFromEvent(e);render();e.preventDefault();},{passive:false});
      stage.addEventListener('touchmove',function(e){if(dragging){deg=angleFromEvent(e);render();e.preventDefault();}},{passive:false});
      stage.addEventListener('touchend',function(){dragging=false;});
      el.querySelector('[data-act="plus"]').addEventListener('click',function(){deg=Math.min(180,deg+step);render();});
      el.querySelector('[data-act="minus"]').addEventListener('click',function(){deg=Math.max(0,deg-step);render();});
      el.querySelector('[data-act="reset"]').addEventListener('click',function(){deg=(typeof config.deg==='number')?config.deg:50;render();});
      el.querySelectorAll('.ag-side').forEach(function(b){b.addEventListener('click',function(){if(startSide!==b.dataset.side){startSide=b.dataset.side;ui();}});});
    }
    window.addEventListener('mousemove',mm); window.addEventListener('mouseup',mu);
    ui();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
