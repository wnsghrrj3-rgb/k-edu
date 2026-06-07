/* ============================================================================
   케이랩 도구 모듈 — 넓이 격자 (area) v1
   초점 (4~6학년 넓이) = 도형을 단위넓이(1) 칸으로 덮어 넓이·둘레를 눈으로.
     · 가로/세로 ＋/－ → 격자 즉시 재생성, 넓이(가로×세로)·둘레 자동.
     · 칸을 누르면 색칠/지움 → "넓이 = 덮은 칸 수"를 직접 세기(L자 등 도형).
   실물 모눈종이는 칸 세기가 번거롭지만 여기선 즉각·정확 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { w(기본5), h(기본3), maxW(기본12), maxH(기본10), unit(기본"㎠"), fillAll(기본true) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('area', function (el, config) {
    var maxW=config.maxW||12, maxH=config.maxH||10, unit=config.unit||'㎠';
    var w=Math.min(config.w||5,maxW), h=Math.min(config.h||3,maxH);
    var fillAll=(config.fillAll===false)?false:true;
    var filled={};
    function fill_init(){filled={};if(fillAll)for(var r=0;r<h;r++)for(var c=0;c<w;c++)filled[c+','+r]=true;}
    fill_init();
    var btn='font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    el.innerHTML='<style>.aa-btn:active{transform:translateY(2px);}.aa-btn[disabled]{opacity:.35;cursor:not-allowed;}.aa-cell{cursor:pointer;transition:fill .15s;}</style>'
      +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        +'<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">가로</span>'
        +'<button class="aa-btn" data-act="wm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="aa-btn" data-act="wp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">세로</span>'
        +'<button class="aa-btn" data-act="hm" style="'+btn+'background:#fff;color:#1565C0;">－</button>'
        +'<button class="aa-btn" data-act="hp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        +'<span style="width:8px;"></span>'
        +'<button class="aa-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      +'</div>'
      +'<div class="aa-stage" style="width:100%;height:48vh;min-height:330px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
      +'<div class="aa-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
    var stage=el.querySelector('.aa-stage'), statusEl=el.querySelector('.aa-status');
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=860,VBH=400;
    function area(){var n=0;for(var k in filled)if(filled[k])n++;return n;}
    function render(){
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="aaSh" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#13315C" flood-opacity="0.16"/></filter>'
        +'<linearGradient id="aaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63E6BE"/><stop offset="1" stop-color="#12B886"/></linearGradient>';svg.appendChild(d);
      var cell=Math.min((VBW-120)/w,(VBH-100)/h,72);
      var gw=cell*w, gh=cell*h, x0=(VBW-gw)/2, y0=(VBH-gh)/2;
      var g=svgEl('g',{filter:'url(#aaSh)'});
      for(var r=0;r<h;r++)for(var c=0;c<w;c++){
        var on=!!filled[c+','+r];
        g.appendChild(svgEl('rect',{x:x0+c*cell,y:y0+r*cell,width:cell,height:cell,fill:on?'url(#aaG)':'#F4F9FF',stroke:'#9AB7D4','stroke-width':1.5,'data-c':c,'data-r':r,class:'aa-cell'}));
      }
      // 바깥 둘레 굵게
      g.appendChild(svgEl('rect',{x:x0,y:y0,width:gw,height:gh,fill:'none',stroke:'#0B7A5C','stroke-width':5,'pointer-events':'none'}));
      svg.appendChild(g);
      stage.appendChild(svg);
      var isRect=(area()===w*h);
      statusEl.innerHTML='<span style="font-size:28px;color:#1B3A57;">넓이 ＝ </span>'
        +(isRect?'<span style="font-size:30px;color:#0CA678;">'+w+' × '+h+' ＝ </span>':'<span style="font-size:28px;color:#1B3A57;">덮은 칸 </span>')
        +'<span style="font-size:48px;color:#0CA678;">'+area()+'</span>'
        +'<span style="font-size:28px;color:#1B3A57;"> '+unit+'</span>'
        +(isRect?'<span style="font-size:24px;color:#5a7894;">   (둘레 '+(2*(w+h))+' ㎝)</span>':'');
      el.querySelector('[data-act="wp"]').disabled=w>=maxW; el.querySelector('[data-act="wm"]').disabled=w<=1;
      el.querySelector('[data-act="hp"]').disabled=h>=maxH; el.querySelector('[data-act="hm"]').disabled=h<=1;
      stage.querySelectorAll('.aa-cell').forEach(function(p){p.addEventListener('click',function(){var k=p.dataset.c+','+p.dataset.r;filled[k]=!filled[k];render();});});
    }
    var H={wp:function(){if(w<maxW){w++;fill_init();render();}},wm:function(){if(w>1){w--;fill_init();render();}},
      hp:function(){if(h<maxH){h++;fill_init();render();}},hm:function(){if(h>1){h--;fill_init();render();}},
      reset:function(){w=Math.min(config.w||5,maxW);h=Math.min(config.h||3,maxH);fill_init();render();}};
    el.querySelectorAll('.aa-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    render();
    return function cleanup(){};
  });
})();
