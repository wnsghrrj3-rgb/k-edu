/* ============================================================================
   케이랩 도구 모듈 — 대칭 (symmetry) v1
   초점 (5학년 선대칭·점대칭) = 한쪽을 그리면 대칭이 되도록 자동 완성.
     · 격자 칸을 누르면 색칠 → 대칭축(선대칭) / 대칭의 중심(점대칭) 기준
       반사 칸이 다른 색으로 자동으로 채워진다. ("대칭이 되려면 어디?")
     · [선대칭]/[점대칭] 모드, 선대칭은 축 방향(세로/가로) 토글.
   실물은 접어 봐야 알지만 여기선 즉각 반사 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { n(격자 칸수, 기본8), mode:"line"|"point", axis:"v"|"h" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('symmetry', function (el, config) {
    var n=Math.max(4,Math.min(config.n||8,12));
    var mode=(config.mode==='point')?'point':'line';
    var axis=(config.axis==='h')?'h':'v';
    var src={};  // 원본 색칠
    var btn='font-size:24px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:23px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function build(){
      el.innerHTML='<style>.sy-btn:active,.sy-tg:active{transform:translateY(2px);}.sy-tg.on{background:#7048E8 !important;color:#fff !important;}.sy-ax.on{background:#0B7285 !important;color:#fff !important;border-color:#0B7285 !important;}.sy-cell{cursor:pointer;transition:fill .15s;}</style>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
          +'<button class="sy-tg" data-mode="line" style="'+tg+'">선대칭</button>'
          +'<button class="sy-tg" data-mode="point" style="'+tg+'">점대칭</button>'
          +(mode==='line'?'<span style="width:10px;"></span><button class="sy-ax" data-axis="v" style="'+tg.replace('#7048E8','#0B7285')+'">세로축</button><button class="sy-ax" data-axis="h" style="'+tg.replace('#7048E8','#0B7285')+'">가로축</button>':'')
          +'<span style="width:10px;"></span>'
          +'<button class="sy-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 지우기</button>'
        +'</div>'
        +'<div class="sy-stage" style="width:100%;height:52vh;min-height:370px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="sy-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#5a7894;font-size:19px;"></div>';
      el.querySelectorAll('.sy-tg').forEach(function(b){b.classList.toggle('on',b.dataset.mode===mode);});
      el.querySelectorAll('.sy-ax').forEach(function(b){b.classList.toggle('on',b.dataset.axis===axis);});
      bind(); render();
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function mirror(c,r){ if(mode==='point')return[n-1-c,n-1-r]; return (axis==='v')?[n-1-c,r]:[c,n-1-r]; }
    var VBW=440,VBH=440;
    function render(){
      var stage=el.querySelector('.sy-stage'); stage.innerHTML='';
      var cell=Math.min(VBW,VBH)/(n+0.5), x0=(VBW-cell*n)/2, y0=(VBH-cell*n)/2;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%',style:'max-height:48vh;display:block;margin:0 auto;'});
      // 반사 칸 계산
      var ref={};for(var k in src){if(src[k]){var p=k.split(','),m=mirror(+p[0],+p[1]);ref[m[0]+','+m[1]]=true;}}
      for(var r=0;r<n;r++)for(var c=0;c<n;c++){
        var key=c+','+r, isSrc=!!src[key], isRef=!!ref[key]&&!isSrc;
        var fill=isSrc?'#12B886':(isRef?'#FFB066':'#F4F9FF');
        svg.appendChild(svgEl('rect',{x:x0+c*cell,y:y0+r*cell,width:cell,height:cell,fill:fill,stroke:'#B8CFE8','stroke-width':1.2,'data-c':c,'data-r':r,class:'sy-cell'}));
      }
      // 대칭축 / 중심
      if(mode==='line'){
        if(axis==='v'){var ax=x0+cell*n/2;svg.appendChild(svgEl('line',{x1:ax,y1:y0-6,x2:ax,y2:y0+cell*n+6,stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'10 7'}));}
        else{var ay=y0+cell*n/2;svg.appendChild(svgEl('line',{x1:x0-6,y1:ay,x2:x0+cell*n+6,y2:ay,stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'10 7'}));}
      } else {
        svg.appendChild(svgEl('circle',{cx:x0+cell*n/2,cy:y0+cell*n/2,r:8,fill:'#7048E8'}));
      }
      stage.appendChild(svg);
      stage.querySelectorAll('.sy-cell').forEach(function(p){p.addEventListener('click',function(){var k=p.dataset.c+','+p.dataset.r;src[k]=!src[k];render();});});
      el.querySelector('.sy-status').textContent=(mode==='line')?'한쪽 칸을 누르면 '+(axis==='v'?'세로':'가로')+'축 반대편에 대칭으로 채워져요':'칸을 누르면 가운데 점 기준 반대편에 채워져요';
    }
    function bind(){
      el.querySelectorAll('.sy-tg').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;build();}});});
      el.querySelectorAll('.sy-ax').forEach(function(b){b.addEventListener('click',function(){axis=b.dataset.axis;el.querySelectorAll('.sy-ax').forEach(function(x){x.classList.toggle('on',x.dataset.axis===axis);});render();});});
      var rs=el.querySelector('[data-act="reset"]'); if(rs)rs.addEventListener('click',function(){src={};render();});
    }
    build();
    return function cleanup(){};
  });
})();
