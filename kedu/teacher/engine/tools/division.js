/* ============================================================================
   케이랩 도구 모듈 — 나눗셈 모형 (division) v1
   초점 (3학년 나눗셈) = 똑같이 나누어 담기를 눈으로.
     · 전체 개수와 묶음 수를 ＋/－ → 구슬이 바구니에 똑같이 자동 분배.
     · 한 바구니에 몇 개? + 나머지 → "12 ÷ 3 = 4 … 0".
     · [등분제]: 묶음 수를 정함(몇 묶음으로). [포함제]: 한 묶음 개수를 정함(몇 개씩).
   실물은 매번 다시 나눠야 하지만 여기선 즉각 재분배 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { total(기본12), groups(기본3), size(기본4), mode:"partition"|"quotition", maxTotal(기본30) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('division', function (el, config) {
    var maxTotal=config.maxTotal||30;
    var total=Math.min(config.total||12,maxTotal);
    var groups=Math.max(1,config.groups||3);
    var size=Math.max(1,config.size||4);
    var mode=(config.mode==='quotition')?'quotition':'partition'; // partition=등분제(묶음수 지정), quotition=포함제(개수 지정)
    var btn='font-size:24px;padding:12px 20px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:22px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function build(){
      var ctrl='<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">전체</span>'
        +'<button class="dv-btn" data-act="tm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="dv-btn" data-act="tp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +(mode==='partition'
          ?'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">묶음 수</span><button class="dv-btn" data-act="gm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="dv-btn" data-act="gp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
          :'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">한 묶음 개수</span><button class="dv-btn" data-act="sm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="dv-btn" data-act="sp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>');
      el.innerHTML='<style>.dv-btn:active,.dv-tg:active{transform:translateY(2px);}.dv-btn[disabled]{opacity:.35;cursor:not-allowed;}.dv-tg.on{background:#7048E8 !important;color:#fff !important;}</style>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="dv-tg" data-mode="partition" style="'+tg+'">몇 묶음으로</button>'
          +'<button class="dv-tg" data-mode="quotition" style="'+tg+'">몇 개씩</button>'
        +'</div>'
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrl
          +'<span style="width:8px;"></span><button class="dv-btn" data-act="reset" style="font-size:24px;padding:12px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="dv-stage" style="width:100%;height:48vh;min-height:330px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="dv-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      el.querySelectorAll('.dv-tg').forEach(function(b){b.classList.toggle('on',b.dataset.mode===mode);});
      bind(); render();
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=880,VBH=380;
    function render(){
      var stage=el.querySelector('.dv-stage'); stage.innerHTML='';
      var g=(mode==='partition')?groups:Math.max(1,Math.ceil(total/size));
      var per=(mode==='partition')?Math.floor(total/groups):size;
      var rem=(mode==='partition')?(total-per*groups):(total-size*(Math.floor(total/size)));
      var nb=(mode==='partition')?groups:Math.floor(total/size); // 꽉 찬 묶음 수
      if(mode==='quotition'){g=nb+(rem>0?1:0); if(g<1)g=1;}
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="dvSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var cols=Math.min(g,5), rows=Math.ceil(g/cols);
      var bw=Math.min((VBW-80)/cols-16, 240), bh=Math.min((VBH-60)/rows-16, 150);
      var x0=(VBW-(bw+16)*cols+16)/2, y0=(VBH-(bh+16)*rows+16)/2;
      var placed=0;
      for(var gi=0;gi<g;gi++){
        var col=gi%cols, row=Math.floor(gi/cols), bx=x0+col*(bw+16), by=y0+row*(bh+16);
        svg.appendChild(svgEl('rect',{x:bx,y:by,width:bw,height:bh,rx:14,fill:'rgba(255,255,255,0.5)',stroke:'#1565C0','stroke-width':3,filter:'url(#dvSh)'}));
        // 이 바구니에 담길 개수
        var inThis=(mode==='partition')?(per+(gi<rem?0:0)):(gi<nb?size:rem);
        if(mode==='partition') inThis=per; // 등분제: 나머지는 따로
        var per_cols=Math.min(inThis,5);
        for(var b=0;b<inThis;b++){
          var pc=b%5, pr=Math.floor(b/5);
          var dotR=Math.min(bw/12,bh/8,15);
          var dx=bx+18+pc*(dotR*2+6)+dotR, dy=by+18+pr*(dotR*2+6)+dotR;
          svg.appendChild(svgEl('circle',{cx:dx,cy:dy,r:dotR,fill:'#12B886',stroke:'#0B7A5C','stroke-width':2}));
          placed++;
        }
      }
      // 등분제 나머지 표시 (오른쪽 별도)
      if(mode==='partition'&&rem>0){
        for(var rr=0;rr<rem;rr++){var dotR=13,dx=VBW-50,dy=40+rr*(dotR*2+6)+dotR;svg.appendChild(svgEl('circle',{cx:dx,cy:dy,r:dotR,fill:'#FF8A3D',stroke:'#C24E0E','stroke-width':2}));}
        svg.appendChild(svgEl('text',{x:VBW-50,y:30,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':18,'font-weight':800,fill:'#C24E0E'})).textContent='나머지';
      }
      stage.appendChild(svg);
      var st=el.querySelector('.dv-status');
      if(mode==='partition'){
        st.innerHTML='<span style="font-size:40px;color:#1565C0;">'+total+'</span><span style="font-size:28px;"> ÷ </span><span style="font-size:40px;color:#1565C0;">'+groups+'</span><span style="font-size:28px;"> ＝ </span><span style="font-size:48px;color:#0CA678;">'+per+'</span>'+(rem>0?'<span style="font-size:26px;color:#C24E0E;"> … 나머지 '+rem+'</span>':'');
      } else {
        st.innerHTML='<span style="font-size:40px;color:#1565C0;">'+total+'</span><span style="font-size:28px;"> 을 </span><span style="font-size:40px;color:#1565C0;">'+size+'</span><span style="font-size:28px;">개씩 ＝ </span><span style="font-size:48px;color:#0CA678;">'+nb+'</span><span style="font-size:28px;">묶음</span>'+(rem>0?'<span style="font-size:26px;color:#C24E0E;"> … 나머지 '+rem+'</span>':'');
      }
    }
    function bind(){
      el.querySelectorAll('.dv-tg').forEach(function(b){b.addEventListener('click',function(){if(mode!==b.dataset.mode){mode=b.dataset.mode;build();}});});
      var H={tp:function(){if(total<maxTotal){total++;render();}},tm:function(){if(total>1){total--;render();}},
        gp:function(){if(groups<10){groups++;render();}},gm:function(){if(groups>1){groups--;render();}},
        sp:function(){if(size<maxTotal){size++;render();}},sm:function(){if(size>1){size--;render();}},
        reset:function(){total=Math.min(config.total||12,maxTotal);groups=config.groups||3;size=config.size||4;render();}};
      el.querySelectorAll('.dv-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    }
    build();
    return function cleanup(){};
  });
})();
