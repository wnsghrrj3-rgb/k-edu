/* ============================================================================
   케이랩 도구 모듈 — 지층과 화석 (strata) v1  [과학 9호 · 지구 영역]
   4학년 지층과 화석. KLab.ui 3모드(자유탐구/미션/퀴즈) 표준.
   디지털 우위: 수만 년 걸리는 쌓임·굳음·융기를 시간 압축, 단면을 직접 봄.
   변수 → 현상 → 발견:
     ▸ 바다 밑에 🪨자갈·🟡모래·🟤진흙을 골라 차곡차곡 쌓기 → 줄무늬 지층.
     ▸ 층을 클릭하면 쌓인 순서 번호 — "아래에 있을수록 먼저 쌓인(오래된) 층".
     ▸ 🐚조개·🌿고사리·🐟물고기를 두고 위에 퇴적물을 빨리 덮으면 화석!
       (안 덮고 융기하면 사라짐 — 화석이 되기 어려운 까닭)
     ▸ ⛰️ 융기 → 물이 빠지고 지층이 땅 위로 — "산에서 조개 화석 = 옛날엔 바다".
   미션 4종(줄무늬/가장 오래된 층/화석 만들기/융기) + 퀴즈 5문.
   - 의존: window.KLab (순수 SVG + requestAnimationFrame, THREE 불필요)
   - config: { mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('strata', function (el, config) {
    var ui = window.KLab.ui;
    var mode = (['free','mission','quiz'].indexOf(config.mode) >= 0) ? config.mode : 'free';
    var raf = null, frame = 0;
    var C = { ink:'#1B3A57', sub:'#5a7894', good:'#12B886', vio:'#7048E8', water:'#339AF0',
              gravel:'#B0BEC5', gravelDot:'#78909C', sand:'#F2D388', sandDot:'#D9B45B',
              mud:'#A1887F', mudLine:'#8D6E63', rock:'#6E4226' };
    var btn = 'font-size:20px;padding:11px 16px;border-radius:14px;border:3px solid;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    function svgEl(t,a){ var e=document.createElementNS('http://www.w3.org/2000/svg',t); for(var k in a)e.setAttribute(k,a[k]); return e; }

    /* ───────────── 상태 ───────────── */
    var TYPES = { gravel:{nm:'자갈',fill:C.gravel}, sand:{nm:'모래',fill:C.sand}, mud:{nm:'진흙',fill:C.mud} };
    var FOSSILS = { shell:{nm:'조개',ic:'🐚',env:'바다'}, fern:{nm:'고사리',ic:'🌿',env:'따뜻하고 습한 곳'}, fish:{nm:'물고기',ic:'🐟',env:'물속'} };
    var GX=150, GW=600, GY=400, LH=34, MAXL=7;
    var layers, pending, up, uplifting, sel, clickedOldest;
    function reset(){ layers=[]; pending=null; up=0; uplifting=false; sel=-1; clickedOldest=false; }
    reset();
    function embeddedFossils(){ var r=[]; for(var i=0;i<layers.length;i++)if(layers[i].fossil)r.push(layers[i].fossil); return r; }

    function deposit(type){
      if(up>0){ ui.toast(el,false,'🌊 지층은 물속에서 쌓여요 — ↺ 처음부터!'); return; }
      if(layers.length>=MAXL){ ui.toast(el,false,'층이 가득! 이만하면 멋진 지층이에요'); return; }
      var f=null;
      if(pending){ f=pending; pending=null; }          // 위에 덮이면 화석으로!
      layers.push({ type:type, fossil:f, prog:0 });
      sel=-1; renderScene(); renderStatus(); checkMission();
    }
    function placeFossil(kind){
      if(up>0){ ui.toast(el,false,'물이 빠진 뒤엔 생물이 가라앉지 못해요 — ↺ 처음부터!'); return; }
      if(layers.length>=MAXL){ ui.toast(el,false,'덮을 자리가 없어요!'); return; }
      pending=kind; renderScene(); renderStatus();
    }
    function doUplift(){
      if(up>0)return;
      if(layers.length===0){ ui.toast(el,false,'먼저 지층을 쌓아야 들어 올리죠!'); return; }
      if(pending){ pending=null; ui.toast(el,false,'덮이지 못한 생물은 화석이 못 돼요…'); }
      uplifting=true; renderStatus(); checkMission();
    }
    function clickLayer(i){
      sel=i; renderScene(); renderStatus();
      if(mode==='mission'&&mStep===1&&!mLock&&layers.length>=3&&i!==0)ui.toast(el,false);
      if(layers.length>=3&&i===0)clickedOldest=true;
      checkMission();
    }

    /* ───────────── 미션 ───────────── */
    var MISSIONS=[
      { text:'퇴적물을 <b style="color:#7048E8;">서로 다른 종류로 3층 이상</b> 쌓아 줄무늬 지층을 만들어요!',
        keep:false, check:function(){ var t={}; layers.forEach(function(l){t[l.type]=1;});
          return layers.length>=3 && Object.keys(t).length>=2; } },
      { text:'<b style="color:#7048E8;">가장 먼저 쌓인(가장 오래된) 층</b>을 클릭해 찾아요!',
        keep:true, check:function(){ return clickedOldest; } },
      { text:'🐚 <b style="color:#7048E8;">조개를 두고 위에 퇴적물을 덮어</b> 화석을 만들어요!',
        keep:true, check:function(){ return embeddedFossils().length>0; } },
      { text:'⛰️ <b style="color:#7048E8;">융기!</b> 화석이 든 지층을 땅 위로 — 산에서 조개가 나오는 까닭을 확인해요!',
        keep:true, check:function(){ return up>=1 && embeddedFossils().length>0; } }
    ];
    /* ── 학년 칸 (헌법 3장) — 카드 D칸 닻대로 ──
       저=줄무늬 지층 쌓기·화석 만들기(일상어, 오래된 층 추론·융기·퀴즈 숨김) /
       중=가장 오래된 층·화석·융기 전부+퀴즈(4학년 본 과정) /
       고=중과 동일(지층은 4학년 과정 — 풀세트 유지). */
    var LOW_MISSIONS=[
      { text:'🪨🟡🟤 <b style="color:#7048E8;">서로 다른 퇴적물을 3층 이상</b> 차곡차곡 쌓아 줄무늬를 만들어요!',
        keep:false, check:function(){ var t={}; layers.forEach(function(l){t[l.type]=1;});
          return layers.length>=3 && Object.keys(t).length>=2; } },
      { text:'🐚 <b style="color:#7048E8;">조개를 두고 위에 퇴적물을 덮어</b> 화석을 만들어요!',
        keep:true, check:function(){ return embeddedFossils().length>0; } }
    ];
    var GRADES={
      low:  { modes:['free','mission'],        missions:LOW_MISSIONS, low:true  },
      mid:  { modes:['free','mission','quiz'], missions:MISSIONS,     low:false },
      high: { modes:['free','mission','quiz'], missions:MISSIONS,     low:false }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    function curMissions(){ return G().missions; }
    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; mode='free'; mStep=0; mDone=false; mLock=false; reset(); build();
    }});
    var mStep=0, mDone=false, mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){
          mLock=false; var M=curMissions();
          if(mStep<M.length-1){ mStep++; if(!M[mStep].keep)reset(); }
          else mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 ───────────── */
    var QUIZ=[
      { q:'지층에서 가장 먼저 쌓인 층은 어디에 있을까요?',
        ch:['맨 아래','맨 위','가운데'], a:0 },
      { q:'지층은 주로 어디에서 만들어질까요?',
        ch:['바다나 호수의 물 밑','뜨거운 사막 위','구름 속'], a:0 },
      { q:'죽은 생물이 화석이 되려면 어떻게 되어야 할까요?',
        ch:['퇴적물이 빨리 덮어야 해요','햇빛에 오래 말라야 해요','바람에 날려가야 해요'], a:0 },
      { q:'산에서 조개 화석이 발견되면 알 수 있는 것은?',
        ch:['옛날에 그곳이 바다였다','조개가 산을 좋아했다','누가 조개를 버렸다'], a:0 },
      { q:'지층에 줄무늬가 생기는 까닭은?',
        ch:['종류가 다른 퇴적물이 차례로 쌓여서','누가 줄을 그어서','비가 많이 와서'], a:0 }
    ];
    var qIdx=0,qScore=0,qCount=0,qLock=false,qUsed=[];
    function newQuiz(){
      if(qUsed.length>=QUIZ.length)qUsed=[];
      var cand=[]; for(var i=0;i<QUIZ.length;i++)if(qUsed.indexOf(i)<0)cand.push(i);
      qIdx=cand[Math.floor(Math.random()*cand.length)]; qUsed.push(qIdx); qLock=false;
    }
    function quizChoices(){
      var q=QUIZ[qIdx], idx=[0,1,2].sort(function(){return Math.random()-0.5;});
      return idx.map(function(i){ return {v:i, label:'<span style="font-size:21px;">'+q.ch[i]+'</span>'}; });
    }

    /* ───────────── UI ───────────── */
    function ctrlRow(){
      function bt(act,lab,col,extra){ return '<button class="st-btn" data-act="'+act+'" style="'+btn+'border-color:'+col+';background:#fff;color:'+col+';'+(extra||'')+'">'+lab+'</button>'; }
      return '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">'
        +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';">쌓기</span>'
        + bt('d-gravel','🪨 자갈','#607D8B') + bt('d-sand','🟡 모래','#C9971C') + bt('d-mud','🟤 진흙','#8D6E63')
        +'<span style="font-size:17px;font-weight:800;color:'+C.sub+';margin-left:8px;">생물 두기</span>'
        + bt('f-shell','🐚','#1565C0') + bt('f-fern','🌿','#2F9E44') + bt('f-fish','🐟','#1098AD')
        + (G().low?'':bt('uplift','⛰️ 융기!',C.vio,'margin-left:8px;'+(up>0?'opacity:.45;':'')))
        + bt('reset','↺ 처음부터','#889')
        +'</div>';
    }
    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      if(mode==='mission'){ bar=mDone?ui.doneBar():ui.missionBar(curMissions()[mStep].text,mStep,curMissions().length); body=ctrlRow(); }
      else if(mode==='quiz'){ bar=ui.quizBar(QUIZ[qIdx].q,qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=ctrlRow();
      el.innerHTML='<style>.st-btn:active,.kl-choice:active{transform:translateY(2px);}.kl-choice{min-width:auto !important;padding:14px 20px !important;}.st-layer{cursor:pointer;}</style>'
        + top + bar + body
        +'<div class="kl-stage-host" style="position:relative;"><div class="st-stage" style="width:100%;height:'+(mode==='quiz'?'34vh':'44vh')+';min-height:'+(mode==='quiz'?'240':'320')+'px;background:linear-gradient(180deg,#D0EBFF 0%,#E7F5FF 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        + foot
        +'<div class="st-status" style="text-align:center;margin-top:11px;font-weight:800;font-family:inherit;"></div>';
      ui.bindModeTabs(el,function(m){
        mode=m; mStep=0; mDone=false; mLock=false; reset();
        if(m==='quiz'){ qScore=0;qCount=0;qUsed=[];newQuiz(); }
        build();
      });
      drawStage(); bind(); bands.bind(el); renderScene(); renderStatus();
    }

    /* ───────────── 무대 ───────────── */
    var stage, svg;
    function drawStage(){
      stage=el.querySelector('.st-stage'); stage.innerHTML='';
      svg=svgEl('svg',{viewBox:'0 0 900 460',width:'100%',height:'100%'});
      stage.appendChild(svg);
    }
    function texture(g,type,x,y,w,h,seed){
      var i,n;
      function rnd(k){ var v=Math.sin(seed*91.7+k*47.3)*10000; return v-Math.floor(v); }
      if(type==='gravel'){ n=Math.floor(w/46);
        for(i=0;i<n;i++)g.appendChild(svgEl('circle',{cx:x+18+rnd(i)*( w-36),cy:y+h*0.3+rnd(i+30)*h*0.45,r:4.5+rnd(i+60)*3,fill:C.gravelDot}));
      } else if(type==='sand'){ n=Math.floor(w/26);
        for(i=0;i<n;i++)g.appendChild(svgEl('circle',{cx:x+10+rnd(i)*(w-20),cy:y+5+rnd(i+30)*(h-10),r:1.7,fill:C.sandDot}));
      } else { for(i=1;i<=2;i++)g.appendChild(svgEl('line',{x1:x+14,y1:y+h*i/3,x2:x+w-14,y2:y+h*i/3,stroke:C.mudLine,'stroke-width':2,'stroke-opacity':0.55})); }
    }
    function renderScene(){
      if(!svg)return;
      svg.innerHTML='';
      var topY=GY-layers.length*LH;
      // 해 (융기 후 더 크고 밝게)
      svg.appendChild(svgEl('circle',{cx:790,cy:74,r:26+up*8,fill:'#F59F00','fill-opacity':0.55+up*0.45}));
      // 바닷물 — 융기하면 빠짐
      if(up<1){
        var wy=118+up*(GY-118);
        svg.appendChild(svgEl('rect',{x:100,y:wy,width:700,height:GY-wy+40,rx:14,fill:C.water,'fill-opacity':0.32*(1-up*0.5)}));
        for(var wv=0;wv<3;wv++){ var wx=140+wv*240+Math.sin(frame/22+wv)*14;
          svg.appendChild(svgEl('path',{d:'M '+wx+' '+(wy+8)+' q 22 -9 44 0 q 22 9 44 0',fill:'none',stroke:'#fff','stroke-width':3,'stroke-opacity':0.5*(1-up)})); }
      }
      // 기반암
      svg.appendChild(svgEl('rect',{x:GX-14,y:GY,width:GW+28,height:46,rx:8,fill:C.rock}));
      // 지층
      for(var i=0;i<layers.length;i++){
        var L=layers[i], h=LH*Math.min(L.prog,1), y=GY-i*LH-h;
        var g=svgEl('g',{'class':'st-layer','data-i':i}); svg.appendChild(g);
        g.appendChild(svgEl('rect',{x:GX,y:y,width:GW,height:h,fill:TYPES[L.type].fill,
          stroke:(sel===i?C.vio:(up>0.5?'#5D4037':'#90785F')),'stroke-width':(sel===i?5:2.5+up*1)}));
        if(L.prog>=1)texture(g,L.type,GX,y,GW,h,i+1);
        // 쌓이는 중 낙하 알갱이
        if(L.prog<1)for(var p2=0;p2<5;p2++){ var px=GX+60+p2*110+((i*37)%50), py=130+((frame*5+p2*55)%(y-140>40?y-140:40));
          g.appendChild(svgEl('circle',{cx:px,cy:130+py%((y-130)>0?(y-130):1),r:3.5,fill:TYPES[L.type].fill,stroke:'#888','stroke-width':1})); }
        // 화석 (층 위 경계에 묻힘)
        if(L.fossil&&L.prog>=0.6){
          var fx=GX+GW*0.5+((i%2)?110:-110);
          g.appendChild(svgEl('circle',{cx:fx,cy:y+LH*0.52,r:17,fill:'#fff','fill-opacity':0.55,stroke:'#fff','stroke-width':2}));
          var ft=svgEl('text',{x:fx,y:y+LH*0.52+8,'text-anchor':'middle','font-size':24,'data-fossil':L.fossil}); ft.textContent=FOSSILS[L.fossil].ic; g.appendChild(ft);
        }
        // 순서 번호 (층 선택 시 전체 표시)
        if(sel>=0&&L.prog>=1){
          var nb=svgEl('text',{x:GX-34,y:y+LH-10,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':22,'font-weight':800,fill:(i===sel?C.vio:C.sub)});
          nb.textContent=(i+1)+'번째'; svg.appendChild(nb);
        }
      }
      // 기다리는 생물 (아직 안 덮임)
      if(pending){
        var pt=svgEl('text',{x:GX+GW*0.5,y:topY-8,'text-anchor':'middle','font-size':30,'data-pending':pending}); pt.textContent=FOSSILS[pending].ic; svg.appendChild(pt);
      }
      // 융기 후 풀·나무·새
      if(up>0.65&&layers.length>0){
        for(var gr=0;gr<7;gr++){ var gx2=GX+30+gr*90;
          svg.appendChild(svgEl('path',{d:'M '+gx2+' '+topY+' q 4 -16 8 0 M '+(gx2+9)+' '+topY+' q 4 -13 8 0',fill:'none',stroke:'#2F9E44','stroke-width':3,'stroke-linecap':'round','stroke-opacity':(up-0.65)/0.35})); }
        var bd=svgEl('text',{x:240+Math.sin(frame/30)*30,y:90,'font-size':22,opacity:(up-0.65)/0.35}); bd.textContent='🐦'; svg.appendChild(bd);
        var lb2=svgEl('text',{x:GX+GW*0.5,y:topY-34,'text-anchor':'middle','font-family':'Jua,sans-serif','font-size':23,'font-weight':800,fill:C.good,opacity:(up-0.65)/0.35});
        lb2.textContent='⛰️ 땅 위로 드러난 지층!'; svg.appendChild(lb2);
      }
      // 레이어 클릭 바인딩
      svg.querySelectorAll('.st-layer').forEach(function(g2){
        g2.addEventListener('click',function(){ clickLayer(+g2.getAttribute('data-i')); });
      });
    }

    /* ───────────── 갱신 ───────────── */
    function loop(){ frame++;
      var busy=false;
      layers.forEach(function(L){ if(L.prog<1){ L.prog=Math.min(1,L.prog+0.06); busy=true; } });
      if(uplifting){ up=Math.min(1,up+0.018); busy=true;
        if(up>=1){ uplifting=false; renderStatus(); checkMission(); } }
      if(mode!=='quiz'&&(busy||frame%3===0))renderScene();
      raf=requestAnimationFrame(loop);
    }

    function renderStatus(){
      var s=el.querySelector('.st-status'); if(!s)return;
      if(mode==='quiz'){ s.innerHTML='<div style="font-size:18px;color:'+C.sub+';">지층을 쌓아 본 걸 떠올리며 답을 골라요</div>'; return; }
      var fos=embeddedFossils(), h;
      if(up>=1){
        h='<div style="font-size:24px;color:'+C.good+';">⛰️ 융기 — 물속 지층이 땅 위로 솟아올랐어요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">'
          +(fos.length?('산에서 '+FOSSILS[fos[0]].nm+' 화석이 — <b>옛날에 이곳이 '+FOSSILS[fos[0]].env+'였다는 증거</b>예요!')
          :'오랜 시간 눌려 굳은 줄무늬가 그대로 보여요. ↺로 새 바다에서 다시!')+'</div>';
      } else if(uplifting){
        h='<div style="font-size:24px;color:'+C.vio+';">땅이 솟아오르는 중… (실제로는 아주아주 오랜 시간!)</div>';
      } else if(pending){
        h='<div style="font-size:24px;color:'+C.vio+';">'+FOSSILS[pending].ic+' '+FOSSILS[pending].nm+'가 바닥에 가라앉았어요</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">썩기 전에 <b>퇴적물이 빨리 덮어야</b> 화석이 돼요 — 위에 한 층 쌓아 봐요!</div>';
      } else if(layers.length===0){
        h='<div style="font-size:24px;color:'+C.ink+';">🌊 여기는 바다 밑 — 퇴적물 단추로 차곡차곡 쌓아 봐요!</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">자갈·모래·진흙이 물에 실려 와 가라앉아요. 생물을 두고 덮으면 화석도!</div>';
      } else if(sel>=0){
        var i=sel,extra=(i===0?' — <b>가장 먼저 쌓인, 가장 오래된 층!</b>':(i===layers.length-1?' — <b>가장 나중에 쌓인, 가장 새로운 층!</b>':''));
        h='<div style="font-size:24px;color:'+C.vio+';">'+(i+1)+'번째로 쌓인 '+TYPES[layers[i].type].nm+' 층'+extra+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">아래에 있을수록 먼저 쌓인 층이에요 — 지층의 순서로 옛날을 알 수 있어요.</div>';
      } else {
        h='<div style="font-size:24px;color:'+C.ink+';">'+layers.length+'층 지층'+(fos.length?' · 화석 '+fos.length+'개':'')+'</div><div style="font-size:18px;color:'+C.sub+';margin-top:5px;">종류가 다른 퇴적물이 차례로 쌓여 <b>줄무늬</b>가 생겨요. 층을 클릭해 순서를 확인해 봐요!</div>';
      }
      s.innerHTML=h;
    }

    /* ───────────── 바인딩 ───────────── */
    function bind(){
      el.querySelectorAll('.st-btn').forEach(function(b){ b.addEventListener('click',function(){
        var a=b.dataset.act;
        if(a.indexOf('d-')===0)deposit(a.slice(2));
        else if(a.indexOf('f-')===0)placeFossil(a.slice(2));
        else if(a==='uplift')doUplift();
        else if(a==='reset'){ reset(); build(); }
      }); });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true;
          var q=QUIZ[qIdx], ok=(+b.dataset.v===q.a);
          qCount++; if(ok)qScore++;
          ui.toast(el,ok,ok?null:('🤔 정답은 "'+q.ch[q.a]+'"!'));
          setTimeout(function(){ newQuiz(); build(); },1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build(); loop();
    return function cleanup(){ if(raf)cancelAnimationFrame(raf); };
  });
})();
