/* ============================================================================
   케이랩 도구 모듈 — 곱셈 배열판 (array) v1
   초점 (2~4학년 곱셈) = 곱셈을 "몇 줄(행) × 한 줄에 몇 개(열)"의 배열로.
     · 행/열을 ＋/－로 바꾸면 즉시 재배열, 곱 자동 계산("3 × 4 = 12").
     · [가로세로 바꾸기] = 3×4 ⇄ 4×3 으로 교환법칙을 눈으로(곱은 그대로).
   실물 바둑돌 배열은 매번 다시 놓아야 하지만 여기선 즉각·정확 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { rows(기본3), cols(기본4), maxR(기본10), maxC(기본10), shape:"dot"|"square" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var C={topD:'#4DABF7',dot:'#1565C0',dotEdge:'#0B447C',empty:'#E7F1FB'};
  window.KLab.register('array', function (el, config) {
    var maxR=(config.maxR>=1)?config.maxR:10, maxC=(config.maxC>=1)?config.maxC:10;
    var rows=Math.min(config.rows||3,maxR), cols=Math.min(config.cols||4,maxC);
    var shape=(config.shape==='square')?'square':'dot';
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    el.innerHTML='<style>.ar-btn:active{transform:translateY(2px);}.ar-btn[disabled]{opacity:.35;cursor:not-allowed;}'
      +'.ar-cell{transition:transform .2s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}</style>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        +'<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">줄(행)</span>'
        +'<button class="ar-btn" data-act="rm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="ar-btn" data-act="rp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">한 줄 개수(열)</span>'
        +'<button class="ar-btn" data-act="cm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="ar-btn" data-act="cp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<button class="ar-btn" data-act="swap" style="'+btn+'background:#fff;color:#0B7285;border-color:#0B7285;">⇄ 가로세로</button>'
        +'<button class="ar-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      +'</div>'
      +'<div class="ar-stage" style="width:100%;height:50vh;min-height:350px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
      +'<div class="ar-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
    var stage=el.querySelector('.ar-stage'), statusEl=el.querySelector('.ar-status');
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=900,VBH=440;
    function render(){
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="arSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.22"/></filter>'
        +'<linearGradient id="arG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+C.topD+'"/><stop offset="1" stop-color="'+C.dot+'"/></linearGradient>';svg.appendChild(d);
      var padX=80,padY=50,areaW=VBW-padX*2,areaH=VBH-padY*2;
      var cw=areaW/cols, ch=areaH/rows, s=Math.min(cw,ch,86), size=s*0.66;
      var gridW=s*cols, gridH=s*rows, x0=(VBW-gridW)/2, y0=(VBH-gridH)/2;
      var g=svgEl('g',{filter:'url(#arSh)'});
      for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
        var cx=x0+c*s+s/2, cy=y0+r*s+s/2;
        if(shape==='square') g.appendChild(svgEl('rect',{x:cx-size/2,y:cy-size/2,width:size,height:size,rx:8,fill:'url(#arG)',stroke:'#fff','stroke-width':3,class:'ar-cell'}));
        else g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:size/2,fill:'url(#arG)',stroke:C.dotEdge,'stroke-width':3,class:'ar-cell'}));
      }
      svg.appendChild(g);
      stage.appendChild(svg);
      statusEl.innerHTML='<span style="font-size:38px;color:#1565C0;">'+rows+'</span>'
        +'<span style="font-size:28px;color:#1B3A57;"> 줄 × 한 줄 </span>'
        +'<span style="font-size:38px;color:#1565C0;">'+cols+'</span>'
        +'<span style="font-size:28px;color:#1B3A57;">개 ＝ </span>'
        +'<span style="font-size:30px;color:#0CA678;">'+rows+' × '+cols+' ＝ </span>'
        +'<span style="font-size:52px;color:#0CA678;">'+(rows*cols)+'</span>';
      el.querySelector('[data-act="rp"]').disabled=rows>=maxR; el.querySelector('[data-act="rm"]').disabled=rows<=1;
      el.querySelector('[data-act="cp"]').disabled=cols>=maxC; el.querySelector('[data-act="cm"]').disabled=cols<=1;
    }
    var H={rp:function(){if(rows<maxR){rows++;render();}},rm:function(){if(rows>1){rows--;render();}},
      cp:function(){if(cols<maxC){cols++;render();}},cm:function(){if(cols>1){cols--;render();}},
      swap:function(){var t=rows;rows=Math.min(cols,maxR);cols=Math.min(t,maxC);render();},
      reset:function(){rows=Math.min(config.rows||3,maxR);cols=Math.min(config.cols||4,maxC);render();}};
    el.querySelectorAll('.ar-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    render();
    return function cleanup(){};
  });
})();
