/* ============================================================================
   케이랩 도구 모듈 — 규칙·패턴 (pattern) v3
   초점 (2학년 규칙 찾기) = 패턴을 만들고, 반복 규칙을 찾고, 다음을 예측.
   v2: 자유탐구 / 미션 / 퀴즈 3모드 (KLab.ui 표준).
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 두 색(AB) 반복·★규칙 찾기 시 반복 마디 교차 배경 띠로 "여기까지 한
            묶음, 또 반복!"을 끊어 보는 신규 닻·일상어·퀴즈 숨김.
     · 중 = 세 색(ABC)·코어 2~3칸·퀴즈.
     · 고 = 기존 전부 유지(4색·코어 4칸 자유 도전·퀴즈).
   - 의존: window.KLab (THREE 불필요)
   - config: { colors(기본 4색), preset, grade:"low|mid|high", mode:"free"|"mission"|"quiz" }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var DEF=['#E64980','#1565C0','#F59F00','#0CA678']; // 빨강·파랑·노랑·초록
  var NAME=['빨강','파랑','노랑','초록','보라','주황'];
  window.KLab.register('pattern', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음
    var jump100=null;   // 와우 ④ 일반항 점프 — 100번째 색 인덱스(seq 바뀌면 해제)

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ──
       저=두 색 반복·반복 마디 띠 닻·퀴즈 숨김 / 중=세 색·퀴즈 / 고=기존 유지(4색). */
    var GRADES={
      low:  { modes:['free','mission'],        palN:2, bandHint:true  },
      mid:  { modes:['free','mission','quiz'], palN:3, bandHint:false },
      high: { modes:['free','mission','quiz'], palN:4, bandHint:false }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }
    var allColors=(config.colors&&config.colors.length)?config.colors:DEF;
    function palCount(){ return (config.colors&&config.colors.length)?config.colors.length:Math.min(DEF.length,G().palN); }
    var colors=allColors.slice(0,palCount());

    var seq=Array.isArray(config.preset)?config.preset.slice():[];
    var showRule=false;
    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var btn='font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g; colors=allColors.slice(0,palCount());
      if(G().modes.indexOf(mode)<0) mode='free';
      // 새 팔레트에 없는 색 인덱스 제거
      seq=seq.filter(function(i){return i<colors.length;});
      mStep=0; mDone=false; mLock=false; showRule=false; jump100=null;
      if(mode==='quiz'){ qScore=0; qCount=0; newQuiz(); }
      build();
    }});

    function findCoreOf(s){
      for(var L=1;L<=Math.floor(s.length/2);L++){var ok=true;for(var i=L;i<s.length;i++)if(s[i]!==s[i%L]){ok=false;break;}if(ok)return L;}
      return 0;
    }
    function distinct(s){var set={},n=0;for(var i=0;i<s.length;i++)if(!set[s[i]]){set[s[i]]=1;n++;}return n;}

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS=[
      {text:'<b style="color:#7048E8;">두 가지 색</b>을 번갈아 <b style="color:#7048E8;">6칸</b> 만들어 봐요! (예: 빨강-파랑-빨강-파랑…)',
        check:function(act){var c=findCoreOf(seq);return seq.length>=6&&c>0&&c<=2&&distinct(seq)===2;}},
      {text:'<b style="color:#7048E8;">🔍 규칙 찾기</b>를 눌러 — 어디까지가 한 묶음이고 다음 색이 뭔지 봐요!',
        check:function(act){return act==='rule'&&showRule&&findCoreOf(seq)>0;}},
      {text:'두 가지 색 반복을 <b style="color:#7048E8;">8칸</b>까지 길게 이어 봐요!',
        check:function(act){var c=findCoreOf(seq);return seq.length>=8&&c>0&&c<=2&&distinct(seq)===2;}}
    ];
    var MID_MISSIONS=[
      {text:'<b style="color:#7048E8;">두 가지 색</b>이 반복되는 패턴을 <b style="color:#7048E8;">6칸 이상</b> 만들어 봐요!',
        check:function(act){var c=findCoreOf(seq);return seq.length>=6&&c>0&&c<=2&&distinct(seq)===2;}},
      {text:'이번엔 <b style="color:#7048E8;">세 가지 색</b>이 반복되는 패턴을 <b style="color:#7048E8;">6칸 이상</b>!',
        check:function(act){var c=findCoreOf(seq);return seq.length>=6&&c===3&&distinct(seq)===3;}},
      {text:'<b style="color:#7048E8;">🔍 규칙 찾기</b>를 눌러 케이가 찾은 규칙과 "다음" 색을 확인해 봐요!',
        check:function(act){return act==='rule'&&showRule&&findCoreOf(seq)>0;}}
    ];
    var HIGH_MISSIONS=[
      {text:'<b style="color:#7048E8;">두 가지 색</b>이 반복되는 패턴을 <b style="color:#7048E8;">6칸 이상</b> 만들어 봐요! (예: 빨강-파랑-빨강-파랑…)',
        check:function(act){var c=findCoreOf(seq);return seq.length>=6&&c>0&&c<=2&&distinct(seq)===2;}},
      {text:'이번엔 <b style="color:#7048E8;">세 가지 색</b>이 반복되는 패턴을 <b style="color:#7048E8;">6칸 이상</b>!',
        check:function(act){var c=findCoreOf(seq);return seq.length>=6&&c===3&&distinct(seq)===3;}},
      {text:'<b style="color:#7048E8;">🔍 규칙 찾기</b>를 눌러 케이가 찾은 규칙과 "다음" 색을 확인해 봐요!',
        check:function(act){return act==='rule'&&showRule&&findCoreOf(seq)>0;}},
      {text:'자유 도전! 규칙 단위가 <b style="color:#7048E8;">4칸</b>인 패턴을 <b style="color:#7048E8;">8칸 이상</b> 만들어 봐요!',
        check:function(act){var c=findCoreOf(seq);return seq.length>=8&&c===4;}}
    ];
    function curMissions(){
      var pool=(grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS;
      // 세 색 미션은 팔레트 3색 이상일 때만
      var f=pool.filter(function(m){ if(/세 가지 색/.test(m.text)) return colors.length>=3; return true; });
      return f.length?f:pool.slice(0,1);
    }
    var mStep=0, mDone=false, mLock=false;

    // ---- 퀴즈 ----
    var qSeq=[],qScore=0,qCount=0,qLock=false;
    function newQuiz(){
      var coreLen=2+Math.floor(Math.random()*2);              // 2~3
      var core=[];var used={};
      while(core.length<coreLen){var c=Math.floor(Math.random()*Math.min(colors.length,4));if(core.length===0||core[core.length-1]!==c){core.push(c);}}
      var shows=coreLen*2+1+Math.floor(Math.random()*coreLen); // 코어 2회 이상 + 일부
      qSeq=[];for(var i=0;i<shows;i++)qSeq.push(core[i%coreLen]);
      qLock=false;
    }
    function qAnswer(){var c=findCoreOf(qSeq);return qSeq[qSeq.length%c];}
    function quizChoices(){
      var n=Math.min(colors.length,4),out=[];
      for(var i=0;i<n;i++)out.push({v:i,label:'<span style="display:inline-block;width:34px;height:34px;border-radius:9px;background:'+colors[i]+';vertical-align:middle;"></span>'});
      return out;
    }

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', body='', foot='';
      var pal=colors.map(function(c,i){return '<button class="pt-pal" data-i="'+i+'" style="width:54px;height:54px;border-radius:14px;border:4px solid #fff;background:'+c+';cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.18);"></button>';}).join('');
      var palRow='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:10px;">'
        +'<span style="font-size:20px;font-weight:800;color:#5a7894;">색 고르기</span>'+pal+'</div>';
      var btnRow='<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        +'<button class="pt-btn" data-act="rule" style="'+btn+'background:#7048E8;color:#fff;border-color:#7048E8;">🔍 규칙 찾기</button>'
        +'<button class="pt-btn" data-act="next" style="'+btn+'background:#0CA678;color:#fff;border-color:#0CA678;">다음 ▶</button>'
        +(grade!=='low'?'<button class="pt-btn" data-act="jump" style="'+btn+'background:#FF8A3D;color:#fff;border-color:#FF8A3D;">✨ 100번째는?</button>':'')
        +'<button class="pt-btn" data-act="back" style="'+btn+'background:#fff;color:#1565C0;">← 하나 지우기</button>'
        +'<button class="pt-btn" data-act="reset" style="font-size:24px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺ 비우기</button></div>';
      if(mode==='mission'){ var _M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(_M[mStep].text,mStep,_M.length); body=palRow+btnRow; }
      else if(mode==='quiz'){ bar=ui.quizBar('다음에 올 색은 무엇일까요?',qScore,qCount); foot=ui.choices(quizChoices()); }
      else body=palRow+btnRow;
      el.innerHTML='<style>.pt-btn:active,.pt-pal:active,.kl-choice:active{transform:translateY(2px);}.pt-pal:hover{transform:scale(1.06);}.pt-cell{transition:transform .15s;}.kl-choice{min-width:64px !important;}'
        +'.pt-pop{animation:ptPop .5s cubic-bezier(.2,1.5,.4,1) both;transform-origin:center;transform-box:fill-box;}@keyframes ptPop{0%{transform:scale(0) translateY(-18px);opacity:0;}60%{transform:scale(1.25);opacity:1;}100%{transform:scale(1);opacity:1;}}'
        +'.pt-flash{animation:ptFlashKf 1.9s ease both;}@keyframes ptFlashKf{0%{opacity:0;}12%{opacity:1;}82%{opacity:1;}100%{opacity:0;}}'
        +'.pt-spark{animation:ptSpark 1.1s ease-in-out infinite;transform-origin:center;transform-box:fill-box;}@keyframes ptSpark{0%,100%{transform:scale(1);}50%{transform:scale(1.12);}}</style>'
        +top+bar+body
        +'<div class="kl-stage-host" style="position:relative;"><div class="pt-stage" style="width:100%;height:'+(mode==='quiz'?'38vh':'46vh')+';min-height:280px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div></div>'
        +foot
        +'<div class="pt-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;color:#5a7894;font-size:19px;"></div>';
      ui.bindModeTabs(el,function(m){mode=m;mStep=0;mDone=false;seq=[];showRule=false;jump100=null;
        if(m==='quiz'){qScore=0;qCount=0;newQuiz();}
        build();});
      bind(); bands.bind(el); render();
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=880,VBH=300;
    function render(opts){
      opts=opts||{};
      var stage=el.querySelector('.pt-stage'); stage.innerHTML='';
      var S=(mode==='quiz')?qSeq:seq;
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="ptSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#13315C" flood-opacity="0.20"/></filter>';svg.appendChild(d);
      var isQuiz=(mode==='quiz');
      var jShow=(!isQuiz && jump100!=null);                 // 와우 ④ 일반항 점프 표시 중
      var core=isQuiz?0:(showRule?findCoreOf(S):0);
      var nextIdx=(core>0)?S[S.length%core]:null;
      var showNext=(!isQuiz&&showRule&&core>0&&!jShow);     // 점프 중엔 작은 '다음!' 미리보기 숨김(헤드라인=100번째)
      var qMark=isQuiz; // 퀴즈는 마지막에 ? 칸
      var total=S.length+(jShow?2:(showNext||qMark?1:0));   // 점프 시 ⋯ + 100번째 칸 자리 확보
      var size=Math.min(72,(VBW-60)/Math.max(total,1)-12), gap=12;
      var rowW=total*(size+gap)-gap, x0=(VBW-rowW)/2, y=VBH/2-size/2;
      // ★저학년 닻: 반복 마디 교차 배경 띠 (규칙 찾기 켰을 때만)
      if(G().bandHint && core>0 && S.length>=core){
        for(var mB=0; mB*core<S.length; mB++){
          if(mB%2===1) continue; // 한 칸 걸러 띠
          var bs=mB*core, be=Math.min(bs+core,S.length);
          var bxL=x0+bs*(size+gap)-6, bxR=x0+(be-1)*(size+gap)+size+6;
          svg.appendChild(svgEl('rect',{x:bxL,y:y-14,width:bxR-bxL,height:size+28,rx:16,fill:'#7048E8','fill-opacity':0.10}));
        }
      }
      for(var i=0;i<S.length;i++){
        var bx=x0+i*(size+gap);
        if(core>0 && i<core) svg.appendChild(svgEl('rect',{x:bx-5,y:y-5,width:size+10,height:size+10,rx:14,fill:'none',stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'8 5'}));
        var cls='pt-cell'+(opts.gen&&i===S.length-1?' pt-pop':'');  // 와우 ②: ▶로 막 생성된 칸이 척척 등장
        svg.appendChild(svgEl('rect',{x:bx,y:y,width:size,height:size,rx:12,fill:colors[S[i]],stroke:'#fff','stroke-width':4,class:cls,filter:'url(#ptSh)'}));
      }
      if(core>0){var t=svgEl('text',{x:x0+(core*(size+gap)-gap)/2,y:y-18,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:'#7048E8'});t.textContent=(G().bandHint?'반복 마디':'규칙');svg.appendChild(t);}
      if(showNext){
        var bx2=x0+S.length*(size+gap);
        svg.appendChild(svgEl('rect',{x:bx2,y:y,width:size,height:size,rx:12,fill:colors[nextIdx],stroke:'#7048E8','stroke-width':4,'stroke-dasharray':'7 5',filter:'url(#ptSh)'}));
        var t2=svgEl('text',{x:bx2+size/2,y:y-18,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':22,'font-weight':800,fill:'#7048E8'});t2.textContent='다음!';svg.appendChild(t2);
      }
      if(qMark){
        var bx3=x0+S.length*(size+gap);
        svg.appendChild(svgEl('rect',{x:bx3,y:y,width:size,height:size,rx:12,fill:'#fff',stroke:'#F59F00','stroke-width':4,'stroke-dasharray':'7 5',filter:'url(#ptSh)'}));
        var t3=svgEl('text',{x:bx3+size/2,y:y+size/2+14,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':40,'font-weight':800,fill:'#F59F00'});t3.textContent='?';svg.appendChild(t3);
      }
      if(S.length===0){var t4=svgEl('text',{x:VBW/2,y:VBH/2,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':24,'font-weight':800,fill:'#9AB7D4'});t4.textContent='색을 눌러 패턴을 만들어 보세요';svg.appendChild(t4);}
      // ── 와우 ④ 일반항 점프: ⋯ 건너뛰고 100번째 칸을 규칙으로 바로 보여줌 ──
      if(jShow){
        var exX=x0+S.length*(size+gap)+size/2;
        var te=svgEl('text',{x:exX,y:y+size/2+10,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':34,'font-weight':800,fill:'#9AB7D4'});te.textContent='⋯';svg.appendChild(te);
        var jx=x0+(S.length+1)*(size+gap);
        svg.appendChild(svgEl('rect',{x:jx,y:y,width:size,height:size,rx:12,fill:colors[jump100],stroke:'#FF8A3D','stroke-width':5,class:'pt-spark',filter:'url(#ptSh)'}));
        var ts=svgEl('text',{x:jx+size/2,y:y-16,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':22,'font-weight':800,fill:'#C24E0E'});ts.textContent='✨100번째';svg.appendChild(ts);
        if(opts.magic){
          var fx=svgEl('text',{x:VBW/2,y:26,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':23,'font-weight':800,fill:'#C24E0E',class:'pt-flash'});
          fx.textContent='✨ 세어 보지 않아도, 규칙이면 100번째 색도 바로 알 수 있어요!';
          svg.appendChild(fx);
        }
      }
      stage.appendChild(svg);
      var st=el.querySelector('.pt-status');
      if(isQuiz){ st.textContent='패턴의 규칙을 찾아 ? 자리에 올 색을 골라요'; }
      else if(jShow){ st.innerHTML='✨ <b style="color:#C24E0E;">100번째 색 = '+NAME[jump100]+'</b> — 끝까지 세지 않고 <b style="color:#7048E8;">규칙</b>으로 바로 알았어요!'; }
      else if(showRule){
        var c2=findCoreOf(S);
        if(c2>0){
          if(G().bandHint){
            var unit=[]; for(var u=0;u<c2;u++) unit.push(NAME[S[u]]);
            st.textContent='『'+unit.join('-')+'』가 계속 반복돼요! → 다음은 '+NAME[S[S.length%c2]];
          } else st.textContent='규칙 단위 '+c2+'개가 반복돼요 → 다음은 '+NAME[S[S.length%c2]];
        } else st.textContent='아직 반복 규칙이 안 보여요 (블록을 더 넣어 보세요)';
      }
      else st.textContent='색 블록을 눌러 패턴을 만들고 [규칙 찾기]를 눌러요';
    }

    function checkMission(act){
      if(mode!=='mission'||mDone||mLock)return;
      var _M=curMissions();
      if(_M[mStep].check(act)){
        mLock=true;
        window.KLab.ui.toast(el,true);
        setTimeout(function(){
          mLock=false;
          var _M2=curMissions();
          if(mStep<_M2.length-1){mStep++; if(!/규칙 찾기/.test(_M2[mStep].text)){seq=[];showRule=false;jump100=null;}}
          else mDone=true;
          build();
        },1500);
      }
    }

    function bind(){
      el.querySelectorAll('.pt-pal').forEach(function(b){b.addEventListener('click',function(){seq.push(+b.dataset.i);showRule=false;jump100=null;snd('tap');render();checkMission();});});
      var H={
        rule:function(){showRule=!showRule;jump100=null;if(showRule&&findCoreOf(seq)>0)snd('select');render();checkMission('rule');},
        next:function(){
          var c=findCoreOf(seq);
          if(c<=0){ el.querySelector('.pt-status').textContent='먼저 색을 눌러 반복되는 규칙을 만들어요 (예: 빨강-파랑-빨강-파랑)'; snd('fail'); return; }
          showRule=true; jump100=null;
          seq.push(seq[seq.length%c]);   // 규칙대로 다음 색
          snd('pop');
          render({gen:true}); checkMission();
        },
        jump:function(){
          var c=findCoreOf(seq);
          if(c<=0){ el.querySelector('.pt-status').textContent='먼저 색을 눌러 반복되는 규칙을 만들어요 — 그럼 100번째도 규칙으로 알 수 있어요!'; snd('fail'); return; }
          showRule=true;
          jump100=seq[(100-1)%c];        // 100번째(1-시작) → (100-1) mod 코어
          snd('whoosh'); snd('success');
          render({magic:true});
        },
        back:function(){seq.pop();showRule=false;jump100=null;render();checkMission();},
        reset:function(){seq=[];showRule=false;jump100=null;render();}
      };
      el.querySelectorAll('.pt-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return;qLock=true;
          var ok=(+b.dataset.v===qAnswer());
          qCount++;if(ok)qScore++;
          window.KLab.ui.toast(el,ok,ok?null:('🤔 정답은 '+NAME[qAnswer()]+'!'));
          setTimeout(function(){newQuiz();build();},1500);
        });
      });
    }

    if(mode==='quiz')newQuiz();
    build();
    return function cleanup(){};
  });
})();
