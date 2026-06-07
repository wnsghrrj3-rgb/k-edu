/* ============================================================================
   케이랩 도구 모듈 — 원 (circle) v1
   초점 = 원 한 도구로 3학년(원 그리기)~6학년(원주율·원의 넓이)까지.
     ▸ [원 그리기] — 반지름을 바꾸면 원·반지름·지름·원주(지름×3.14) 즉시.
     ▸ [원의 넓이] — 원을 N조각 부채꼴로 잘라 번갈아 펼치면 직사각형에
        가까워진다(N↑). "넓이 = 원주÷2 × 반지름 = 3.14×반지름×반지름". (6학년)
   종이로 한 번 자르면 끝이지만 여기선 조각 수를 늘려가며 반복 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { mode:"draw"|"area", r(반지름 단위, 기본4), pieces(조각, 기본8) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var PI=3.14;
  window.KLab.register('circle', function (el, config) {
    var mode=(config.mode==='area')?'area':'draw';
    var r=Math.max(1,Math.min(config.r||4,8));
    var pieces=Math.max(4,Math.min((config.pieces||8),24)); if(pieces%2)pieces++;
    var btn='font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:22px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function build(){
      var ctrl=(mode==='draw')
        ?'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">반지름</span><button class="cr-btn" data-act="rm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="cr-btn" data-act="rp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        :'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">조각 수</span><button class="cr-btn" data-act="pm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="cr-btn" data-act="pp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>';
      el.innerHTML='<style>.cr-btn:active,.cr-tg:active{transform:translateY(2px);}.cr-btn[disabled]{opacity:.35;cursor:not-allowed;}.cr-tg.on{background:#7048E8 !important;color:#fff !important;}</style>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="cr-tg" data-mode="draw" style="'+tg+'">원 그리기</button>'
          +'<button class="cr-tg" data-mode="area" style="'+tg+'">원의 넓이</button>'
        +'</div>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrl
          +'<span style="width:8px;"></span><button class="cr-btn" data-act="reset" style="font-size:24px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="cr-stage" style="width:100%;height:50vh;min-height:350px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="cr-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      el.querySelectorAll('.cr-tg').forEach(function(b){b.classList.toggle('on',b.dataset.mode===mode);});
      bind(); render();
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,f,an){var t=svgEl('text',{x:x,y:y,'text-anchor':an||'middle','font-family':'Jua,sans-serif','font-size':sz,'font-weight':800,fill:f});t.textContent=s;svg.appendChild(t);}
    var VBW=860,VBH=400, UNIT=26;
    function render(){
      var stage=el.querySelector('.cr-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="crSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#13315C" flood-opacity="0.16"/></filter>';svg.appendChild(d);
      if(mode==='draw') drawCircle(svg); else drawArea(svg);
      stage.appendChild(svg);
      var st=el.querySelector('.cr-status');
      if(mode==='draw'){
        st.innerHTML='<span style="font-size:24px;color:#1B3A57;">반지름 </span><span style="font-size:34px;color:#1565C0;">'+r+'</span>'
          +'<span style="font-size:24px;color:#1B3A57;">   지름 </span><span style="font-size:34px;color:#0CA678;">'+(2*r)+'</span>'
          +'<span style="font-size:24px;color:#1B3A57;">   원주 ≈ 지름×3.14 ＝ </span><span style="font-size:34px;color:#E8590C;">'+(2*r*PI).toFixed(2)+'</span>';
      } else {
        st.innerHTML='<span style="font-size:22px;color:#5a7894;">조각이 많을수록 직사각형! </span>'
          +'<span style="font-size:24px;color:#1B3A57;">넓이 ≈ </span><span style="font-size:30px;color:#E8590C;">3.14 × '+r+' × '+r+' ＝ '+(PI*r*r).toFixed(2)+'</span>';
      }
      var sel=function(s){return el.querySelector(s);};
      if(mode==='draw'){sel('[data-act="rp"]').disabled=r>=8;sel('[data-act="rm"]').disabled=r<=1;}
      else{sel('[data-act="pp"]').disabled=pieces>=24;sel('[data-act="pm"]').disabled=pieces<=4;}
    }
    function drawCircle(svg){
      var cx=VBW/2,cy=VBH/2,rr=r*UNIT, g=svgEl('g',{filter:'url(#crSh)'});
      g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:rr,fill:'#63E6BE','fill-opacity':0.5,stroke:'#0B7A5C','stroke-width':5}));
      svg.appendChild(g);
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx+rr,y2:cy,stroke:'#1565C0','stroke-width':4}));  // 반지름
      txt(svg,cx+rr/2,cy-12,'반지름 '+r,18,'#1565C0');
      svg.appendChild(svgEl('line',{x1:cx-rr,y1:cy,x2:cx+rr,y2:cy,stroke:'#0CA678','stroke-width':3,'stroke-dasharray':'7 5'}));
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:7,fill:'#1B3A57'}));
    }
    function drawArea(svg){
      var N=pieces, theta=2*Math.PI/N, rr=r*16+30;
      // 위: 원 N등분 파이
      var cx=200,cy=150;
      for(var i=0;i<N;i++){var a0=i*theta,a1=(i+1)*theta;
        var p0=[cx+rr*Math.cos(a0),cy+rr*Math.sin(a0)],p1=[cx+rr*Math.cos(a1),cy+rr*Math.sin(a1)];
        svg.appendChild(svgEl('path',{d:'M'+cx+' '+cy+' L'+p0[0]+' '+p0[1]+' A'+rr+' '+rr+' 0 0 1 '+p1[0]+' '+p1[1]+' Z',fill:(i%2?'#63E6BE':'#38D9A9'),stroke:'#fff','stroke-width':1.5}));}
      txt(svg,cx,cy+rr+28,'원을 '+N+'조각으로',18,'#5a7894');
      // 아래: 부채꼴 펼쳐 직사각형 근사 (번갈아)
      var arc=rr*theta, baseY=330, startX=460;
      var half=N/2;
      for(var j=0;j<N;j++){
        var up=(j%2===0);
        var bx=startX+Math.floor(j/2)*arc*1.0 + (up?0:arc*0.5);
        // 부채꼴 path (꼭지 원점, 아래로 벌어짐)
        var h=theta/2, lx=-rr*Math.sin(h), ly=rr*Math.cos(h), rx=rr*Math.sin(h);
        var path='M0 0 L'+lx+' '+ly+' A'+rr+' '+rr+' 0 0 1 '+rx+' '+ly+' Z';
        var g=svgEl('g',{});
        if(up) g.setAttribute('transform','translate('+bx+','+baseY+')');
        else   g.setAttribute('transform','translate('+(bx)+','+(baseY+ly)+') rotate(180)');
        g.appendChild(svgEl('path',{d:path,fill:(j%2?'#63E6BE':'#38D9A9'),stroke:'#fff','stroke-width':1.2}));
        svg.appendChild(g);
      }
      txt(svg,640,baseY+40,'펼치면 직사각형에 가까워요',17,'#5a7894');
    }
    function bind(){
      el.querySelectorAll('.cr-tg').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;build();}});});
      var H={rp:function(){if(r<8){r++;render();}},rm:function(){if(r>1){r--;render();}},
        pp:function(){if(pieces<24){pieces+=2;render();}},pm:function(){if(pieces>4){pieces-=2;render();}},
        reset:function(){r=config.r||4;pieces=config.pieces||8;render();}};
      el.querySelectorAll('.cr-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    }
    build();
    return function cleanup(){};
  });
})();
