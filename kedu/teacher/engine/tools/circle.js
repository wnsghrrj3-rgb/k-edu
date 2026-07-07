/* ============================================================================
   케이랩 도구 모듈 — 원 (circle) v3 · 3모드 + 학년칸
   초점 = 원 한 도구로 3학년(원 그리기)~6학년(원주율·원의 넓이)까지.
     ▸ [원 그리기] — 반지름을 바꾸면 원·반지름·지름·원주(지름×3.14) 즉시.
     ▸ [원의 넓이] — 원을 N조각 부채꼴로 잘라 번갈아 펼치면 직사각형에
        가까워진다(N↑). "넓이 = 원주÷2 × 반지름 = 3.14×반지름×반지름". (6학년)
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 원 그리기만·"지름은 반지름 두 개" 닻(반지름 막대 둘이 지름을 이룸)
            ·원주식·원의 넓이·퀴즈 숨김.
     · 중 = 원주(둘레 = 지름 × 3.14) 추가·퀴즈(지름/원주).
     · 고 = 기존 전부 유지(원의 넓이 부채꼴 펼치기·원주율·퀴즈 5문).
   - 의존: window.KLab (THREE 불필요)
   - config: { view:"draw"|"area", r(기본4), pieces(기본8), grade:"low|mid|high", mode }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  var PI=3.14;
  window.KLab.register('circle', function (el, config) {
    var ui=window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES={
      low:  { modes:['free','mission'],        areaView:false, circumf:false, twoRadius:true,  quiz:false, dbl:false },
      mid:  { modes:['free','mission','quiz'], areaView:false, circumf:true,  twoRadius:false, quiz:true,  dbl:false },
      high: { modes:['free','mission','quiz'], areaView:true,  circumf:true,  twoRadius:false, quiz:true,  dbl:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    var legacy=(config.mode==='draw'||config.mode==='area')?config.mode:null;
    var mode=(G().modes.indexOf(config.mode)>=0)?config.mode:'free';
    var view=(G().areaView&&(config.view==='area'||legacy==='area'))?'area':'draw';
    var sr=Math.max(1,Math.min(config.r||4,8));
    var r=sr;
    var pieces=Math.max(4,Math.min((config.pieces||8),24)); if(pieces%2)pieces++;
    var btn='font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tg='font-size:22px;padding:12px 18px;border-radius:16px;border:3px solid #7048E8;background:#fff;color:#7048E8;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      if(!G().areaView) view='draw';
      r=sr; pieces=8; mStep=0; mDone=false; mLock=false;
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    /* ───────────── 미션 (학년칸별 풀) ───────────── */
    var LOW_MISSIONS=[
      { text:'반지름을 <b style="color:#7048E8;">5</b>로 키워 봐요 — 지름은 얼마가 될까요?',
        check:function(){ return view==='draw'&&r===5; } },
      { text:'반지름 <b style="color:#7048E8;">3</b>으로! 지름은 반지름 <b style="color:#7048E8;">두 개</b>랑 같아요!',
        check:function(){ return view==='draw'&&r===3; } }
    ];
    var MID_MISSIONS=[
      { text:'반지름을 <b style="color:#7048E8;">5</b>로 키워 봐요 — 지름은 얼마일까요?',
        check:function(){ return view==='draw'&&r===5; } },
      { text:'반지름 <b style="color:#7048E8;">3</b>으로! 원주(둘레)는 지름×3.14예요!',
        check:function(){ return view==='draw'&&r===3; } },
      { text:'반지름을 <b style="color:#7048E8;">6</b>으로 키워 원주를 확인해 봐요!',
        check:function(){ return view==='draw'&&r===6; } }
    ];
    var HIGH_MISSIONS=[
      { text:'반지름을 <b style="color:#7048E8;">5</b>로 키워 봐요 — 지름은 얼마가 될까요?',
        check:function(){ return view==='draw'&&r===5; } },
      { text:'반지름 <b style="color:#7048E8;">3</b>으로! 원주(둘레)는 지름×3.14예요!',
        check:function(){ return view==='draw'&&r===3; } },
      { text:'<b style="color:#7048E8;">원의 넓이</b> 보기로 바꿔 봐요!',
        check:function(){ return view==='area'; } },
      { text:'조각 수를 <b style="color:#7048E8;">16 이상</b>으로! 직사각형에 가까워지는 게 보이나요?',
        check:function(){ return view==='area'&&pieces>=16; } }
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep=0,mDone=false,mLock=false;
    function checkMission(){
      if(mode!=='mission'||mDone||mLock)return;
      var M=curMissions();
      if(M[mStep].check()){
        mLock=true; ui.toast(el,true);
        setTimeout(function(){ mLock=false; mStep++;
          if(mStep>=M.length)mDone=true;
          build();
        },1500);
      }
    }

    /* ───────────── 퀴즈 (중·고만) ───────────── */
    var MID_QUIZ=[
      { view:'draw', r:4, q:'반지름이 4일 때 지름은 얼마일까요?', answer:'8', choices:['8','4','16'] },
      { view:'draw', r:2, q:'반지름 2인 원의 원주는? (지름×3.14)', answer:'12.56', choices:['12.56','6.28','3.14'] },
      { view:'draw', r:3, q:'반지름 3인 원의 원주는? (지름×3.14)', answer:'18.84', choices:['18.84','9.42','6.28'] },
      { view:'draw', r:5, q:'한 원에서 지름은 반지름의 몇 배일까요?', answer:'2배', choices:['2배','3배','3.14배'] }
    ];
    var HIGH_QUIZ=[
      { view:'draw', r:4, q:'반지름이 4일 때 지름은 얼마일까요?', answer:'8', choices:['8','4','16'] },
      { view:'draw', r:2, q:'반지름 2인 원의 원주는? (지름×3.14)', answer:'12.56', choices:['12.56','6.28','3.14'] },
      { view:'area', r:4, q:'원을 잘게 잘라 번갈아 펼치면 어떤 모양에 가까워질까요?', answer:'직사각형', choices:['직사각형','삼각형','원'] },
      { view:'draw', r:3, q:'원의 넓이를 구하는 식은 무엇일까요?', answer:'3.14×반지름×반지름', choices:['3.14×반지름×반지름','3.14×지름','반지름×반지름'] },
      { view:'draw', r:5, q:'한 원에서 지름은 반지름의 몇 배일까요?', answer:'2배', choices:['2배','3배','3.14배'] }
    ];
    function quizPool(){ return (grade==='mid')?MID_QUIZ:HIGH_QUIZ; }
    var qList=[],qIdx=0,qScore=0,qCount=0,qLock=false;
    function shuffleQuiz(){
      qList=quizPool().slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=qList[i];qList[i]=qList[j];qList[j]=t;}
      qIdx=0;qScore=0;qCount=0;
    }
    function shuffled(arr){var c=arr.slice();for(var i=c.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=c[i];c[i]=c[j];c[j]=t;}return c;}

    function build(){
      var top=bands.selectorHTML()+ui.modeTabs(G().modes,mode), bar='', foot='';
      var ctrl=(view==='draw')
        ?'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">반지름</span><button class="cr-btn" data-act="rm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="cr-btn" data-act="rp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>'
        :'<span style="font-size:20px;font-weight:800;color:#1565C0;align-self:center;">조각 수</span><button class="cr-btn" data-act="pm" style="'+btn+'background:#fff;color:#1565C0;">－</button><button class="cr-btn" data-act="pp" style="'+btn+'background:#1565C0;color:#fff;">＋</button>';
      if(view==='draw' && G().dbl) ctrl+='<span style="width:10px;"></span><button class="cr-btn" data-act="dbl" style="'+btn+'background:#7048E8;color:#fff;border-color:#7048E8;font-size:21px;">🔭 반지름 2배</button>';
      var viewRow=G().areaView
        ?'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">'
          +'<button class="cr-tg" data-view="draw" style="'+tg+'">원 그리기</button>'
          +'<button class="cr-tg" data-view="area" style="'+tg+'">원의 넓이</button>'
        +'</div>':'';
      var rows=viewRow
        +'<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'+ctrl
          +'<span style="width:8px;"></span><button class="cr-btn" data-act="reset" style="font-size:24px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        +'</div>';
      if(mode==='mission'){ var M=curMissions(); bar=mDone?ui.doneBar():ui.missionBar(M[mStep].text,mStep,M.length); }
      else if(mode==='quiz'){
        var q=qList[qIdx]||qList[0];
        view=q.view; r=q.r; rows='';
        bar=ui.quizBar(q.q,qScore,qCount);
        foot=ui.choices(shuffled(q.choices).map(function(v){return {v:v,label:v};}));
      }
      el.innerHTML='<style>.cr-btn:active,.cr-tg:active{transform:translateY(2px);}.cr-btn[disabled]{opacity:.35;cursor:not-allowed;}.cr-tg.on{background:#7048E8 !important;color:#fff !important;}.kl-choice{min-width:130px !important;}'
        +'.cr-flash{animation:crFlashKf 2s ease both;}@keyframes crFlashKf{0%{opacity:0;}10%{opacity:1;}85%{opacity:1;}100%{opacity:0;}}'   /* 와우 ④ 마법 배너 */
        +'.cr-hold{display:inline-block;animation:crHoldKf 1.1s ease both;transform-origin:center;}@keyframes crHoldKf{0%{transform:scale(1);}25%{transform:scale(1.35);color:#7048E8;}55%{transform:scale(.92);}100%{transform:scale(1);}}'   /* 와우 ④ 넓이 4배 펄스 */
        +'</style>'
        + top + bar + rows
        +'<div class="kl-stage-host" style="position:relative;">'
        +'<div class="cr-stage" style="width:100%;height:'+(mode==='quiz'?'38vh':'50vh')+';min-height:'+(mode==='quiz'?'280':'350')+'px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        +'</div>'
        + foot
        +'<div class="cr-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';
      el.querySelectorAll('.cr-tg').forEach(function(b){b.classList.toggle('on',b.dataset.view===view);});
      ui.bindModeTabs(el,function(m2){
        mode=m2; mStep=0;mDone=false;mLock=false;
        view='draw'; r=(m2==='mission')?2:sr; pieces=8;
        if(m2==='quiz')shuffleQuiz();
        build();
      });
      el.querySelectorAll('.kl-choice').forEach(function(b){
        b.addEventListener('click',function(){
          if(qLock)return; qLock=true; qCount++;
          var q=qList[qIdx], ok=(b.dataset.v===String(q.answer));
          if(ok)qScore++;
          ui.toast(el,ok);
          setTimeout(function(){ qIdx++; if(qIdx>=qList.length)shuffleQuiz(); qLock=false; build(); },1400);
        });
      });
      bind(); render(); bands.bind(el);
    }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,f,an){var t=svgEl('text',{x:x,y:y,'text-anchor':an||'middle','font-family':'Gowun Dodum,sans-serif','font-size':sz,'font-weight':800,fill:f});t.textContent=s;svg.appendChild(t);}
    var VBW=860,VBH=400, UNIT=26;
    function render(opts){
      opts=opts||{};
      var stage=el.querySelector('.cr-stage'); if(!stage)return; stage.innerHTML='';
      var svg=svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});d.innerHTML='<filter id="crSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#13315C" flood-opacity="0.16"/></filter>';svg.appendChild(d);
      if(view==='draw') drawCircle(svg); else drawArea(svg);
      // 와우 ④ 마법모먼트 배너 — 1회성(다음 render에서 opts 없이 호출되며 자동 해제)
      if(opts.flash){
        var msg=(opts.flash==='dbl')
          ?'✋ 반지름을 2배로! 둘레(원주)는 2배인데 넓이는 4배! 넓이는 반지름을 두 번 곱하니까요'
          :'✨ 조각을 잘게 펴니 매끈한 직사각형! 이 직사각형이 곧 원의 넓이예요';
        var fg=svgEl('g',{'class':'cr-flash','pointer-events':'none'});
        fg.appendChild(svgEl('rect',{x:VBW/2-348,y:6,width:696,height:38,rx:19,fill:'#7048E8',opacity:'0.96',filter:'url(#crSh)'}));
        var ft=svgEl('text',{x:VBW/2,y:26,'text-anchor':'middle','dominant-baseline':'central','font-family':'Gowun Dodum,sans-serif','font-size':18,'font-weight':800,fill:'#fff'});
        ft.textContent=msg; fg.appendChild(ft); svg.appendChild(fg);
      }
      stage.appendChild(svg);
      var st=el.querySelector('.cr-status');
      if(mode==='quiz'){
        st.innerHTML='<div style="font-size:19px;color:#8aa0b6;">그림 속 반지름을 잘 보고 답을 골라요!</div>';
        return;
      }
      if(view==='draw'){
        if(G().twoRadius){
          st.innerHTML='<span style="font-size:24px;color:#1B3A57;">반지름 </span><span style="font-size:34px;color:#1565C0;">'+r+'</span>'
            +'<span style="font-size:24px;color:#1B3A57;">   지름 </span><span style="font-size:34px;color:#0CA678;">'+(2*r)+'</span>'
            +'<div style="font-size:20px;color:#5a7894;margin-top:6px;">반지름 두 개를 이으면 지름이에요!</div>';
        } else {
          st.innerHTML='<span style="font-size:24px;color:#1B3A57;">반지름 </span><span style="font-size:34px;color:#1565C0;">'+r+'</span>'
            +'<span style="font-size:24px;color:#1B3A57;">   지름 </span><span style="font-size:34px;color:#0CA678;">'+(2*r)+'</span>'
            +(G().circumf?'<span style="font-size:24px;color:#1B3A57;">   원주 ≈ 지름×3.14 ＝ </span><span style="font-size:34px;color:#E8590C;">'+(2*r*PI).toFixed(2)+'</span>':'')
            +((opts.flash==='dbl')?'<div style="margin-top:9px;font-size:23px;color:#1B3A57;">둘레는 <b style="color:#E8590C;">2배</b>인데 넓이는 <span class="cr-hold" style="color:#7048E8;font-size:32px;">4배</span>! <span style="font-size:19px;color:#5a7894;">(넓이 '+(PI*(r/2)*(r/2)).toFixed(2)+' → '+(PI*r*r).toFixed(2)+')</span></div>':'');
        }
      } else {
        st.innerHTML='<span style="font-size:22px;color:#5a7894;">조각이 많을수록 직사각형! </span>'
          +'<span style="font-size:24px;color:#1B3A57;">넓이 ≈ </span><span style="font-size:30px;color:#E8590C;">3.14 × '+r+' × '+r+' ＝ '+(PI*r*r).toFixed(2)+'</span>';
      }
      var sel=function(s2){return el.querySelector(s2);};
      if(view==='draw'){var rp=sel('[data-act="rp"]');if(rp){rp.disabled=r>=8;sel('[data-act="rm"]').disabled=r<=1;}}
      else{var pp=sel('[data-act="pp"]');if(pp){pp.disabled=pieces>=24;sel('[data-act="pm"]').disabled=pieces<=4;}}
    }
    function drawCircle(svg){
      var cx=VBW/2,cy=VBH/2,rr=r*UNIT, g=svgEl('g',{filter:'url(#crSh)'});
      g.appendChild(svgEl('circle',{cx:cx,cy:cy,r:rr,fill:'#63E6BE','fill-opacity':0.5,stroke:'#0B7A5C','stroke-width':5}));
      svg.appendChild(g);
      if(G().twoRadius){
        // 저학년 닻: 지름을 반지름 두 개(왼쪽+오른쪽)로 분리해 색을 달리 → "반지름 + 반지름 = 지름"
        svg.appendChild(svgEl('line',{x1:cx-rr,y1:cy,x2:cx,y2:cy,stroke:'#FF8A3D','stroke-width':6,'stroke-linecap':'round'}));
        svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx+rr,y2:cy,stroke:'#1565C0','stroke-width':6,'stroke-linecap':'round'}));
        txt(svg,cx-rr/2,cy-12,'반지름',17,'#E8590C');
        txt(svg,cx+rr/2,cy-12,'반지름',17,'#1565C0');
        txt(svg,cx,cy+rr+30,'반지름 ＋ 반지름 ＝ 지름',19,'#0CA678');
      } else {
        svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:cx+rr,y2:cy,stroke:'#1565C0','stroke-width':4}));  // 반지름
        txt(svg,cx+rr/2,cy-12,'반지름 '+r,18,'#1565C0');
        svg.appendChild(svgEl('line',{x1:cx-rr,y1:cy,x2:cx+rr,y2:cy,stroke:'#0CA678','stroke-width':3,'stroke-dasharray':'7 5'}));
      }
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:7,fill:'#1B3A57'}));
    }
    function drawArea(svg){
      var N=pieces, theta=2*Math.PI/N, rr=r*16+30;
      var cx=200,cy=150;
      for(var i=0;i<N;i++){var a0=i*theta,a1=(i+1)*theta;
        var p0=[cx+rr*Math.cos(a0),cy+rr*Math.sin(a0)],p1=[cx+rr*Math.cos(a1),cy+rr*Math.sin(a1)];
        svg.appendChild(svgEl('path',{d:'M'+cx+' '+cy+' L'+p0[0]+' '+p0[1]+' A'+rr+' '+rr+' 0 0 1 '+p1[0]+' '+p1[1]+' Z',fill:(i%2?'#63E6BE':'#38D9A9'),stroke:'#fff','stroke-width':1.5}));}
      txt(svg,cx,cy+rr+28,'원을 '+N+'조각으로',18,'#5a7894');
      var arc=rr*theta, baseY=330, startX=460;
      for(var j=0;j<N;j++){
        var up=(j%2===0);
        var bx=startX+Math.floor(j/2)*arc*1.0 + (up?0:arc*0.5);
        var h=theta/2, lx=-rr*Math.sin(h), ly=rr*Math.cos(h), rx=rr*Math.sin(h);
        var path='M0 0 L'+lx+' '+ly+' A'+rr+' '+rr+' 0 0 1 '+rx+' '+ly+' Z';
        var gg=svgEl('g',{});
        if(up) gg.setAttribute('transform','translate('+bx+','+baseY+')');
        else   gg.setAttribute('transform','translate('+(bx)+','+(baseY+ly)+') rotate(180)');
        gg.appendChild(svgEl('path',{d:path,fill:(j%2?'#63E6BE':'#38D9A9'),stroke:'#fff','stroke-width':1.2}));
        svg.appendChild(gg);
      }
      txt(svg,640,baseY+40,'펼치면 직사각형에 가까워요',17,'#5a7894');
    }
    function bind(){
      el.querySelectorAll('.cr-tg').forEach(function(b){b.addEventListener('click',function(){
        if(view!==b.dataset.view){view=b.dataset.view;snd('select');build();if(mode==='mission')checkMission();}});});
      var H={
        rp:function(){if(r<8){r++;snd('tap');render();}},
        rm:function(){if(r>1){r--;snd('tap');render();}},
        pp:function(){if(pieces<24){var was=pieces;pieces+=2;
              if(was<16&&pieces>=16){snd('success');render({flash:'rect'});} else {snd('pop');render();} }},
        pm:function(){if(pieces>4){pieces-=2;snd('pop');render();}},
        // 와우 ④ 헤드라인 마법: 반지름 2배 → 둘레는 2배·넓이는 4배(반지름² 의 힘). 더 못 키우면 작게 되돌려 다시 시도.
        dbl:function(){ if(r*2<=8){r*=2;snd('whoosh');render({flash:'dbl'});} else {r=2;snd('pop');render();} },
        reset:function(){r=(mode==='mission')?2:sr;pieces=8;snd('pop');render();}
      };
      el.querySelectorAll('.cr-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f){f();if(mode==='mission')checkMission();}});});
    }
    shuffleQuiz();
    build();
    return function cleanup(){};
  });
})();
