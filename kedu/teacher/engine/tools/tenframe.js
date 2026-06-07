/* ============================================================================
   케이랩 도구 모듈 — 십 배열판 (tenframe) v1
   초점 (1학년 수 감각·가르기모으기) = 10을 한눈에, 가르고 모으기.
     · 점을 ＋/－로 채운다. 10칸(2×5) 한 판이 꽉 차면 다음 판으로(십몇).
     · 점을 누르면 색이 파랑↔주황으로 바뀐다 → "7은 5와 2로 가르기".
     · "10까지 몇 개 더?" 자동 안내 → 10의 보수 감각.
   - 의존: window.KLab (THREE 불필요)
   - config: { num(기본7), frames(기본2, 보여줄 판 수), max(기본20) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('tenframe', function (el, config) {
    var frames=Math.max(1,Math.min(config.frames||2,3));
    var max=Math.min(config.max||(frames*10),frames*10);
    var num=Math.max(0,Math.min(config.num!=null?config.num:7,max));
    var blue={};  // 주황으로 바뀐 점 인덱스 (가르기)
    var btn='font-size:27px;padding:15px 30px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    el.innerHTML='<style>.tf-btn:active{transform:translateY(2px);}.tf-btn[disabled]{opacity:.35;cursor:not-allowed;}.tf-dot{cursor:pointer;transition:fill .15s,transform .18s cubic-bezier(.2,1.4,.4,1);transform-origin:center;transform-box:fill-box;}.tf-dot:hover{transform:scale(1.08);}</style>'
      +'<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:14px;">'
        +'<button class="tf-btn" data-act="minus" style="'+btn+'background:#fff;color:#1565C0;">－ 점</button>'
        +'<button class="tf-btn" data-act="plus" style="'+btn+'background:#1565C0;color:#fff;">＋ 점</button>'
        +'<button class="tf-btn" data-act="reset" style="font-size:27px;padding:15px 22px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
      +'</div>'
      +'<div class="tf-stage" style="width:100%;height:46vh;min-height:320px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
      +'<div class="tf-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
    var stage=el.querySelector('.tf-stage'), statusEl=el.querySelector('.tf-status');
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=860,VBH=360;
    function render(){
      stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="tfSh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var shown=Math.max(1,Math.min(Math.ceil(num/10)||1,frames)); if(num===0)shown=1;
      var cell=56, fw=cell*5, fh=cell*2, gap=40;
      var totalW=fw*shown+gap*(shown-1), x0=(VBW-totalW)/2, y0=(VBH-fh)/2-10, gk=0;
      for(var f=0;f<shown;f++){
        var fx=x0+f*(fw+gap);
        for(var r=0;r<2;r++)for(var c=0;c<5;c++){
          var cxp=fx+c*cell, cyp=y0+r*cell;
          svg.appendChild(svgEl('rect',{x:cxp,y:cyp,width:cell,height:cell,fill:'rgba(255,255,255,0.4)',stroke:'#9AB7D4','stroke-width':2,'stroke-dasharray':'5 5'}));
          if(gk<num){var orange=!!blue[gk];svg.appendChild(svgEl('circle',{cx:cxp+cell/2,cy:cyp+cell/2,r:cell*0.36,fill:orange?'#FF8A3D':'#1565C0',stroke:orange?'#C24E0E':'#0B447C','stroke-width':3,'data-gk':gk,class:'tf-dot',filter:'url(#tfSh)'}));}
          gk++;
        }
        svg.appendChild(svgEl('rect',{x:fx,y:y0,width:fw,height:fh,fill:'none',stroke:'#5a7894','stroke-width':3,rx:8}));
      }
      stage.appendChild(svg);
      stage.querySelectorAll('.tf-dot').forEach(function(p){p.addEventListener('click',function(){var k=+p.dataset.gk;blue[k]=!blue[k];render();});});
      var oc=0;for(var k in blue)if(blue[k]&&k<num)oc++;var bc=num-oc;
      var toTen=(num<10)?(10-num):(num<20?20-num:0);
      statusEl.innerHTML='<span style="font-size:46px;color:#1565C0;">'+num+'</span>'
        +(oc>0?'<span style="font-size:26px;color:#1B3A57;"> ＝ </span><span style="font-size:36px;color:#1565C0;">'+bc+'</span><span style="font-size:26px;color:#1B3A57;">(파랑) 와 </span><span style="font-size:36px;color:#FF8A3D;">'+oc+'</span><span style="font-size:26px;color:#1B3A57;">(주황)</span>':'')
        +(toTen>0?'<span style="font-size:22px;color:#5a7894;">    10까지 '+toTen+'개 더</span>':(num%10===0&&num>0?'<span style="font-size:22px;color:#0CA678;">    꽉 찼어요!</span>':''));
      el.querySelector('[data-act="plus"]').disabled=num>=max; el.querySelector('[data-act="minus"]').disabled=num<=0;
    }
    el.querySelector('[data-act="plus"]').addEventListener('click',function(){if(num<max){num++;render();}});
    el.querySelector('[data-act="minus"]').addEventListener('click',function(){if(num>0){delete blue[num-1];num--;render();}});
    el.querySelector('[data-act="reset"]').addEventListener('click',function(){num=(config.num!=null?config.num:7);blue={};render();});
    render();
    return function cleanup(){};
  });
})();
