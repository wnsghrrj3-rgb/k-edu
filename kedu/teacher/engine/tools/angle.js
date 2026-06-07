/* ============================================================================
   케이랩 도구 모듈 — 각도기 (angle) v1
   초점 (4학년 각도) = 각을 만들고 크기를 재고 분류한다.
     · 움직이는 변을 손으로 드래그(또는 ＋/－)하면 각이 즉시 변하고 각도 표시.
     · 각도기 눈금이 정확히 겹쳐 있어 "재는 법"을 그대로 본다.
     · 예각/직각/둔각/평각 자동 분류 — 각의 종류를 색·이름으로.
   실물 각도기는 눈금 읽기가 어렵지만 여기선 정확·즉각 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { deg(초기각, 기본50), step(±버튼 증감, 기본5) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('angle', function (el, config) {
    var deg=(typeof config.deg==='number')?Math.max(0,Math.min(config.deg,180)):50;
    var step=config.step||5;
    var btn='font-size:26px;padding:14px 26px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    el.innerHTML='<style>.ag-btn:active{transform:translateY(2px);}.ag-stage{cursor:grab;}.ag-stage.drag{cursor:grabbing;}</style>'
      +'<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        +'<button class="ag-btn" data-act="minus" style="'+btn+'background:#fff;color:#1565C0;">－ 각</button>'
        +'<button class="ag-btn" data-act="plus" style="'+btn+'background:#1565C0;color:#fff;">＋ 각</button>'
        +'<button class="ag-btn" data-act="reset" style="font-size:26px;padding:14px 20px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      +'</div>'
      +'<div class="ag-stage" style="width:100%;height:52vh;min-height:370px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
      +'<div class="ag-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
    var stage=el.querySelector('.ag-stage'), statusEl=el.querySelector('.ag-status');
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=420, cx=VBW/2, cy=VBH-70, R=270;
    // 각도기는 cx,cy 기준 위쪽 반원. 0도=오른쪽 수평, 각은 반시계로 위.
    function P(a,r){var rad=a*Math.PI/180;return[cx+r*Math.cos(rad),cy-r*Math.sin(rad)];}
    function kind(d){ if(d===0)return['',''];if(d<90)return['예각','#0CA678'];if(d===90)return['직각','#1565C0'];if(d<180)return['둔각','#E8590C'];return['평각','#7048E8'];}
    function render(){
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="agSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.18"/></filter>';svg.appendChild(d);
      var kc=kind(deg)[1]||'#1565C0';
      // 채운 부채꼴(각 영역)
      if(deg>0){var pe=P(deg,R*0.62);var large=(deg>180)?1:0;
        svg.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+(cx+R*0.62)+' '+cy+' A '+(R*0.62)+' '+(R*0.62)+' 0 '+large+' 0 '+pe[0]+' '+pe[1]+' Z',fill:kc,'fill-opacity':0.15}));}
      // 각도기 반원 + 눈금
      svg.appendChild(svgEl('path',{d:'M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+' Z',fill:'#fff','fill-opacity':0.55,stroke:'#9AB7D4','stroke-width':2,filter:'url(#agSh)'}));
      for(var a=0;a<=180;a+=10){var p1=P(a,R),p2=P(a,a%30===0?R-26:R-15);
        svg.appendChild(svgEl('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:'#5a7894','stroke-width':a%30===0?2.5:1.5}));
        if(a%30===0){var pl=P(a,R-46);var t=svgEl('text',{x:pl[0],y:pl[1]+6,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:'#5a7894'});t.textContent=a;svg.appendChild(t);}}
      // 고정 변(오른쪽) + 움직이는 변
      var fixed=P(0,R);var mov=P(deg,R);
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:fixed[0],y2:fixed[1],stroke:'#1B3A57','stroke-width':7,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:mov[0],y2:mov[1],stroke:kc,'stroke-width':8,'stroke-linecap':'round'}));
      // 움직이는 변 끝 손잡이
      svg.appendChild(svgEl('circle',{cx:mov[0],cy:mov[1],r:16,fill:kc,stroke:'#fff','stroke-width':4,class:'ag-handle',style:'cursor:grab;'}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:9,fill:'#1B3A57'}));
      // 각도 큰 표시
      var mid=P(deg/2,R*0.40);var t2=svgEl('text',{x:mid[0],y:mid[1]+10,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':40,'font-weight':800,fill:kc});t2.textContent=deg+'°';svg.appendChild(t2);
      stage.appendChild(svg);
      var k=kind(deg);
      statusEl.innerHTML='<span style="font-size:34px;color:'+kc+';">'+deg+'°</span>'
        +(k[0]?'<span style="font-size:28px;color:#1B3A57;"> — </span><span style="font-size:34px;color:'+kc+';">'+k[0]+'</span>':'');
      el.querySelector('[data-act="plus"]').disabled=deg>=180; el.querySelector('[data-act="minus"]').disabled=deg<=0;
    }
    // 드래그로 각 조절
    var dragging=false;
    function angleFromEvent(e){var rect=stage.getBoundingClientRect();var p=e.touches?e.touches[0]:e;
      var sx=(p.clientX-rect.left)/rect.width*VBW, sy=(p.clientY-rect.top)/rect.height*VBH;
      var a=Math.atan2(cy-sy, sx-cx)*180/Math.PI; return Math.max(0,Math.min(Math.round(a),180));}
    stage.addEventListener('mousedown',function(e){dragging=true;stage.classList.add('drag');deg=angleFromEvent(e);render();});
    window.addEventListener('mousemove',function(e){if(dragging){deg=angleFromEvent(e);render();}});
    window.addEventListener('mouseup',function(){dragging=false;stage.classList.remove('drag');});
    stage.addEventListener('touchstart',function(e){dragging=true;deg=angleFromEvent(e);render();e.preventDefault();},{passive:false});
    stage.addEventListener('touchmove',function(e){if(dragging){deg=angleFromEvent(e);render();e.preventDefault();}},{passive:false});
    stage.addEventListener('touchend',function(){dragging=false;});
    el.querySelector('[data-act="plus"]').addEventListener('click',function(){deg=Math.min(180,deg+step);render();});
    el.querySelector('[data-act="minus"]').addEventListener('click',function(){deg=Math.max(0,deg-step);render();});
    el.querySelector('[data-act="reset"]').addEventListener('click',function(){deg=(typeof config.deg==='number')?config.deg:50;render();});
    var mm=function(e){if(dragging){deg=angleFromEvent(e);render();}}, mu=function(){dragging=false;stage.classList.remove('drag');};
    render();
    return function cleanup(){window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu);};
  });
})();
