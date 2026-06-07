/* ============================================================================
   케이랩 도구 모듈 — 가능성 (probability) v1
   초점 (6학년 가능성) = 직접 여러 번 시행해 가능성을 눈으로.
     · 동전/주사위/회전판을 [한 번] 또는 [여러 번] 굴려 결과 누적.
     · 결과 빈도 막대 → "여러 번 하면 반반에 가까워진다"(큰 수 감각).
   실물은 100번 굴리기 번거롭지만 여기선 즉각 — 교구화 기준.
   - 의존: window.KLab (THREE 불필요)
   - config: { type:"coin"|"dice", batch(여러번 횟수, 기본50) }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('probability', function (el, config) {
    var type=(config.type==='dice')?'dice':'coin';
    var batch=config.batch||50;
    var faces=(type==='dice')?[1,2,3,4,5,6]:['앞','뒤'];
    var COL=['#1565C0','#0CA678','#F59F00','#E64980','#7048E8','#FF8A3D'];
    var counts={}; faces.forEach(function(f){counts[f]=0;});
    var total=0, last=null;
    var btn='font-size:25px;padding:13px 24px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:22px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';
    function build(){
      el.innerHTML='<style>.pb-btn:active,.pb-tg:active{transform:translateY(2px);}.pb-tg.on{background:#7048E8 !important;color:#fff !important;}</style>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="pb-tg" data-type="coin" style="'+tg+'">동전</button>'
          +'<button class="pb-tg" data-type="dice" style="'+tg+'">주사위</button>'
        +'</div>'
        +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
          +'<button class="pb-btn" data-act="one" style="'+btn+'background:#1565C0;color:#fff;">한 번 굴리기</button>'
          +'<button class="pb-btn" data-act="many" style="'+btn+'background:#fff;color:#1565C0;">'+batch+'번 굴리기</button>'
          +'<button class="pb-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>'
        +'<div class="pb-stage" style="width:100%;height:46vh;min-height:320px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'<div class="pb-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      el.querySelectorAll('.pb-tg').forEach(function(b){b.classList.toggle('on',b.dataset.type===type);});
      bind(); render();
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,f,an){var t=svgEl('text',{x:x,y:y,'text-anchor':an||'middle','font-family':'Jua,sans-serif','font-size':sz,'font-weight':800,fill:f});t.textContent=s;svg.appendChild(t);}
    var VBW=820,VBH=360;
    function roll(n){for(var i=0;i<n;i++){var f=faces[Math.floor(Math.random()*faces.length)];counts[f]++;total++;last=f;}render();}
    function render(){
      var stage=el.querySelector('.pb-stage'); stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var n=faces.length, padB=70, padT=40, plotH=VBH-padB-padT, slot=(VBW-80)/n;
      var mx=1; faces.forEach(function(f){if(counts[f]>mx)mx=counts[f];});
      faces.forEach(function(f,i){
        var cx=40+slot*(i+0.5), h=counts[f]/mx*plotH, by=padT+plotH-h;
        svg.appendChild(svgEl('rect',{x:cx-slot*0.32,y:by,width:slot*0.64,height:h,rx:8,fill:COL[i%6],stroke:'#fff','stroke-width':2}));
        txt(svg,cx,by-10,counts[f],22,COL[i%6]);
        txt(svg,cx,padT+plotH+30,(type==='dice'?'⚂ ':'')+f,22,'#1B3A57');
        var pct=total?Math.round(counts[f]/total*100):0;
        txt(svg,cx,padT+plotH+54,pct+'%',18,'#5a7894');
      });
      stage.appendChild(svg);
      var st=el.querySelector('.pb-status');
      st.innerHTML='<span style="font-size:26px;color:#1B3A57;">모두 </span><span style="font-size:36px;color:#1565C0;">'+total+'</span><span style="font-size:26px;color:#1B3A57;">번</span>'
        +(last!=null?'<span style="font-size:22px;color:#5a7894;">   (방금: '+last+')</span>':'');
    }
    function bind(){
      el.querySelectorAll('.pb-tg').forEach(function(b){b.addEventListener('click',function(){if(type!==b.dataset.type){type=b.dataset.type;faces=(type==='dice')?[1,2,3,4,5,6]:['앞','뒤'];counts={};faces.forEach(function(f){counts[f]=0;});total=0;last=null;build();}});});
      var H={one:function(){roll(1);},many:function(){roll(batch);},reset:function(){faces.forEach(function(f){counts[f]=0;});total=0;last=null;render();}};
      el.querySelectorAll('.pb-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    }
    build();
    return function cleanup(){};
  });
})();
