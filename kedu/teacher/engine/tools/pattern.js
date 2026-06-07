/* ============================================================================
   케이랩 도구 모듈 — 규칙·패턴 (pattern) v1
   초점 (2학년 규칙 찾기) = 패턴을 만들고, 반복 규칙을 찾고, 다음을 예측.
     · 팔레트(색)에서 눌러 패턴 줄을 만든다.
     · [규칙 찾기] → 가장 짧은 반복 단위(코어)를 자동으로 찾아 묶어 보여주고
       "다음에 올 것"을 빈칸에 예측해 표시. ("규칙이 뭘까? 다음은?")
   - 의존: window.KLab (THREE 불필요)
   - config: { colors(기본 4색), preset([인덱스 배열]) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var DEF=['#E64980','#1565C0','#F59F00','#0CA678']; // 빨강·파랑·노랑·초록
  var NAME=['빨강','파랑','노랑','초록','보라','주황'];
  window.KLab.register('pattern', function (el, config) {
    var colors=(config.colors&&config.colors.length)?config.colors:DEF;
    var seq=Array.isArray(config.preset)?config.preset.slice():[];
    var showRule=false;
    var btn='font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function build(){
      var pal=colors.map(function(c,i){return '<button class="pt-pal" data-i="'+i+'" style="width:54px;height:54px;border-radius:14px;border:4px solid #fff;background:'+c+';cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.18);"></button>';}).join('');
      el.innerHTML='<style>.pt-btn:active,.pt-pal:active{transform:translateY(2px);}.pt-pal:hover{transform:scale(1.06);}.pt-cell{transition:transform .15s;}</style>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">'
          +'<span style="font-size:20px;font-weight:800;color:#5a7894;">색 고르기</span>'+pal
        +'</div>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
          +'<button class="pt-btn" data-act="rule" style="'+btn+'background:#7048E8;color:#fff;border-color:#7048E8;">🔍 규칙 찾기</button>'
          +'<button class="pt-btn" data-act="back" style="'+btn+'background:#fff;color:#1565C0;">← 하나 지우기</button>'
          +'<button class="pt-btn" data-act="reset" style="font-size:24px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 비우기</button>'
        +'</div>'
        +'<div class="pt-stage" style="width:100%;height:46vh;min-height:320px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="pt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#5a7894;font-size:19px;"></div>';
      bind(); render();
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function findCore(){ // 가장 짧은 반복 단위 길이
      for(var L=1;L<=Math.floor(seq.length/2);L++){var ok=true;for(var i=L;i<seq.length;i++)if(seq[i]!==seq[i%L]){ok=false;break;}if(ok)return L;}
      return 0;
    }
    var VBW=880,VBH=300;
    function render(){
      var stage=el.querySelector('.pt-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="ptSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var core=showRule?findCore():0;
      var nextIdx=(core>0)?seq[seq.length%core]:null;
      var showNext=showRule&&core>0;
      var total=seq.length+(showNext?1:0);
      var size=Math.min(72,(VBW-60)/Math.max(total,1)-12), gap=12;
      var rowW=total*(size+gap)-gap, x0=(VBW-rowW)/2, y=VBH/2-size/2;
      for(var i=0;i<seq.length;i++){
        var bx=x0+i*(size+gap);
        // 규칙 단위 묶음 배경
        if(core>0 && i<core) svg.appendChild(svgEl('rect',{x:bx-5,y:y-5,width:size+10,height:size+10,rx:14,fill:'none',stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'8 5'}));
        svg.appendChild(svgEl('rect',{x:bx,y:y,width:size,height:size,rx:12,fill:colors[seq[i]],stroke:'#fff','stroke-width':4,class:'pt-cell',filter:'url(#ptSh)'}));
      }
      if(core>0) { var lx=x0+core*(size+gap)-gap/2; svgEl('text',{}); var t=svgEl('text',{x:x0+(core*(size+gap)-gap)/2,y:y-18,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':20,'font-weight':800,fill:'#7048E8'});t.textContent='규칙';svg.appendChild(t);}
      if(showNext){
        var bx2=x0+seq.length*(size+gap);
        svg.appendChild(svgEl('rect',{x:bx2,y:y,width:size,height:size,rx:12,fill:colors[nextIdx],stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'7 5',filter:'url(#ptSh)'}));
        var t2=svgEl('text',{x:bx2+size/2,y:y-18,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:'#7048E8'});t2.textContent='다음!';svg.appendChild(t2);
      }
      if(seq.length===0){var t3=svgEl('text',{x:VBW/2,y:VBH/2,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':24,'font-weight':800,fill:'#9AB7D4'});t3.textContent='색을 눌러 패턴을 만들어 보세요';svg.appendChild(t3);}
      stage.appendChild(svg);
      var st=el.querySelector('.pt-status');
      if(showRule){ st.textContent=(core>0)?('규칙 단위 '+core+'개가 반복돼요 → 다음은 '+NAME[seq[seq.length%core]]):'아직 반복 규칙이 안 보여요 (블록을 더 넣어 보세요)'; }
      else st.textContent='색 블록을 눌러 패턴을 만들고 [규칙 찾기]를 눌러요';
    }
    function bind(){
      el.querySelectorAll('.pt-pal').forEach(function(b){b.addEventListener('click',function(){seq.push(+b.dataset.i);showRule=false;render();});});
      var H={rule:function(){showRule=!showRule;render();},back:function(){seq.pop();showRule=false;render();},reset:function(){seq=[];showRule=false;render();}};
      el.querySelectorAll('.pt-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    }
    build();
    return function cleanup(){};
  });
})();
