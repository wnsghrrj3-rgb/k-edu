/* ============================================================================
   케이랩 도구 모듈 — 넓이 격자 (area) v3 · 3모드 + 학년칸
   v3: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = "칸 세기"(넓이=칸 개수)·★채운 칸에 1·2·3 번호를 찍는 세기 신규 닻
            ·빈 격자에서 채움·작은 격자(6×5)·곱셈식/둘레/㎠/퀴즈 숨김(일상어 "몇 칸").
     · 중 = 가로×세로 곱셈식·둘레 등장·퀴즈(넓이·둘레).
     · 고 = 기존 전부 유지(큰 격자·곱셈·둘레·퀴즈 5문).
   - 의존: window.KLab
   - config: { w, h, maxW, maxH, unit, fillAll, grade:"low|mid|high", mode }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('area', function (el, config) {
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES={
      low:  { modes:['free','mission'],        maxW:6,  maxH:5,  mult:false, perim:false, count:true,  fill:false },
      mid:  { modes:['free','mission','quiz'], maxW:12, maxH:10, mult:true,  perim:true,  count:false, fill:true  },
      high: { modes:['free','mission','quiz'], maxW:12, maxH:10, mult:true,  perim:true,  count:false, fill:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    var unit = config.unit || '㎠';
    var maxW = config.maxW || G().maxW, maxH = config.maxH || G().maxH;
    function startW(){ return Math.min(config.w || (grade==='low'?4:5), maxW); }
    function startH(){ return Math.min(config.h || (grade==='low'?4:3), maxH); }
    var w = startW(), h = startH();
    function fillAllNow(){ return (config.fillAll===false) ? false : G().fill; }
    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    var filled = {};

    function fill_init() {
      filled = {};
      if (fillAllNow()) for(var r=0;r<h;r++) for(var c=0;c<w;c++) filled[c+','+r]=true;
    }
    fill_init();

    function countFilled() { var n=0; for(var k in filled) if(filled[k]) n++; return n; }

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      maxW = config.maxW || G().maxW; maxH = config.maxH || G().maxH;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false;
      w=startW(); h=startH(); fill_init();
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS = [
      { text: '칸을 색칠해서 정확히 <b style="color:#7048E8;">4칸</b>을 채워 봐요! (하나씩 세어 봐요)',
        check: function() { return countFilled() === 4; } },
      { text: '이번엔 <b style="color:#7048E8;">6칸</b>을 채워 봐요!',
        check: function() { return countFilled() === 6; } },
      { text: '<b style="color:#7048E8;">ㄴ자 모양</b>으로 <b style="color:#7048E8;">5칸</b>을 채워 봐요! (꼭 네모가 아니어도 돼요)',
        check: function() { return countFilled() === 5; } }
    ];
    var MID_MISSIONS = [
      { text: '격자를 만들어 <b style="color:#7048E8;">넓이가 6㎠</b>인 직사각형을 만들어 봐요!',
        check: function() { return countFilled() === 6 && countFilled() === w*h; } },
      { text: '칸을 <b style="color:#7048E8;">일부만 색칠</b>해서 넓이가 <b style="color:#7048E8;">5칸</b>인 ㄴ자 모양을 만들어 봐요!',
        check: function() { return countFilled() === 5 && countFilled() < w*h; } },
      { text: '격자를 <b style="color:#7048E8;">가로 7, 세로 4</b>로 만들어 봐요! (넓이 28㎠)',
        check: function() { return w === 7 && h === 4 && countFilled() === w*h; } },
      { text: '직사각형의 <b style="color:#7048E8;">둘레가 20㎝</b>가 되게 만들어 봐요!',
        check: function() { return countFilled() === w*h && 2*(w+h) === 20; } }
    ];
    var HIGH_MISSIONS = MID_MISSIONS;
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep = 0, mDone = false, mLock = false;

    // ---- 퀴즈 (중·고만) ----
    var QUIZ_POOL = [
      { q: '직사각형의 넓이는 몇 ㎠인가요?', w:4, h:3, preset:null, answer:'12', choices:['10','12','14','18'], type:'rect' },
      { q: '직사각형의 넓이는 몇 ㎠인가요?', w:5, h:2, preset:null, answer:'10', choices:['7','10','14','20'], type:'rect' },
      { q: '색칠한 칸의 넓이는 몇 ㎠인가요?', w:4, h:3,
        preset:{'0,0':1,'1,0':1,'2,0':1,'0,1':1,'0,2':1}, answer:'5', choices:['4','5','6','7'], type:'fill' },
      { q: '직사각형의 둘레는 몇 ㎝인가요?', w:5, h:3, preset:null, answer:'16', choices:['14','15','16','18'], type:'rect' },
      { q: '직사각형의 둘레는 몇 ㎝인가요?', w:6, h:2, preset:null, answer:'16', choices:['12','16','18','24'], type:'rect' },
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = QUIZ_POOL.slice();
      for(var i=qList.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=qList[i];qList[i]=qList[j];qList[j]=tmp;}
      qIdx=0; qScore=0; qCount=0;
    }
    function applyQuizState(q) {
      w = q.w; h = q.h;
      filled = {};
      if (q.preset) { for(var k in q.preset) if(q.preset[k]) filled[k]=true; }
      else { for(var r=0;r<h;r++) for(var c=0;c<w;c++) filled[c+','+r]=true; }
    }

    var btn = 'font-size:25px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';

    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode);
      var bar = '', foot = '';
      var ctrlRow = '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-bottom:12px;">'
        + '<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">가로</span>'
        + '<button class="aa-btn" data-act="wm" style="' + btn + 'background:#fff;color:#1565C0;">－</button>'
        + '<button class="aa-btn" data-act="wp" style="' + btn + 'background:#1565C0;color:#fff;">＋</button>'
        + '<span style="width:8px;"></span>'
        + '<span style="font-size:21px;font-weight:800;color:#1565C0;align-self:center;">세로</span>'
        + '<button class="aa-btn" data-act="hm" style="' + btn + 'background:#fff;color:#1565C0;">－</button>'
        + '<button class="aa-btn" data-act="hp" style="' + btn + 'background:#1565C0;color:#fff;">＋</button>'
        + '<span style="width:8px;"></span>'
        + '<button class="aa-btn" data-act="reset" style="font-size:25px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        + '</div>';

      if (mode === 'mission') {
        var _M=curMissions();
        bar = mDone ? ui.doneBar() : ui.missionBar(_M[mStep].text, mStep, _M.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(q.choices.map(function(v){ return {v:v,label:v+'㎠'}; }));
        applyQuizState(q);
      }

      el.innerHTML = '<style>.aa-btn:active{transform:translateY(2px);}.aa-btn[disabled]{opacity:.35;cursor:not-allowed;}.aa-cell{cursor:pointer;transition:fill .15s;}.kl-choice{min-width:90px !important;}</style>'
        + top + bar
        + (mode !== 'quiz' ? ctrlRow : '')
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="aa-stage" style="width:100%;height:' + (mode==='quiz'?'40vh':'48vh') + ';min-height:300px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        + '</div>'
        + foot
        + '<div class="aa-status" style="text-align:center;margin-top:14px;font-weight:800;font-family:inherit;"></div>';

      ui.bindModeTabs(el, function(m) {
        mode = m; w = startW(); h = startH();
        fill_init(); mStep=0; mDone=false; mLock=false;
        if (m === 'quiz') shuffleQuiz();
        build();
      });
      bands.bind(el);
      bind(); render();

      el.querySelectorAll('.kl-choice').forEach(function(b) {
        b.addEventListener('click', function() {
          if (qLock) return; qLock=true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function() {
            qIdx++; if(qIdx>=qList.length) shuffleQuiz();
            qLock=false; build();
          }, 1400);
        });
      });
    }

    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    var VBW=860, VBH=400;

    function render() {
      var stage = el.querySelector('.aa-stage');
      var statusEl = el.querySelector('.aa-status');
      if (!stage) return;
      stage.innerHTML = '';
      var svg = svgEl('svg',{viewBox:'0 0 '+VBW+' '+VBH,width:'100%',height:'100%'});
      var d=svgEl('defs',{});
      d.innerHTML='<filter id="aaSh" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#13315C" flood-opacity="0.16"/></filter>'
        +'<linearGradient id="aaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63E6BE"/><stop offset="1" stop-color="#12B886"/></linearGradient>';
      svg.appendChild(d);
      var cell=Math.min((VBW-120)/w,(VBH-100)/h,72);
      var gw=cell*w, gh=cell*h, x0=(VBW-gw)/2, y0=(VBH-gh)/2;
      var g=svgEl('g',{filter:'url(#aaSh)'});
      var cnt=0; // ★저학년 세기 번호용
      for(var r=0;r<h;r++) for(var c=0;c<w;c++){
        var on=!!filled[c+','+r];
        var cellEl=svgEl('rect',{x:x0+c*cell,y:y0+r*cell,width:cell,height:cell,fill:on?'url(#aaG)':'#F4F9FF',stroke:'#9AB7D4','stroke-width':1.5,'data-c':c,'data-r':r,class:'aa-cell'});
        g.appendChild(cellEl);
        if(G().count && on){
          cnt++;
          var num=svgEl('text',{x:x0+c*cell+cell/2,y:y0+r*cell+cell/2,'text-anchor':'middle','dominant-baseline':'central','font-family':'Jua,sans-serif','font-size':Math.min(cell*0.5,30),'font-weight':800,fill:'#fff','pointer-events':'none'});
          num.textContent=cnt; g.appendChild(num);
        }
      }
      g.appendChild(svgEl('rect',{x:x0,y:y0,width:gw,height:gh,fill:'none',stroke:'#0B7A5C','stroke-width':5,'pointer-events':'none'}));
      svg.appendChild(g);
      stage.appendChild(svg);

      if (mode !== 'quiz') {
        stage.querySelectorAll('.aa-cell').forEach(function(p){
          p.addEventListener('click',function(){
            var k=p.dataset.c+','+p.dataset.r; filled[k]=!filled[k]; render();
            if (mode === 'mission') checkMission();
          });
        });
      }

      if (statusEl) {
        var n = countFilled();
        var isRect = (n === w*h);
        if (mode === 'quiz') {
          statusEl.innerHTML = '<span style="font-size:22px;color:#5a7894;">넓이를 세어 보고 아래에서 선택하세요!</span>';
        } else if (grade==='low') {
          // ★저학년: "○칸" 만 (곱셈식·둘레·㎠ 없음)
          statusEl.innerHTML = '<span style="font-size:28px;color:#1B3A57;">색칠한 칸 ＝ </span>'
            + '<span style="font-size:52px;color:#0CA678;">'+n+'</span>'
            + '<span style="font-size:28px;color:#1B3A57;">칸</span>'
            + '<div style="font-size:17px;color:#5a7894;margin-top:4px;">칸을 하나씩 눌러 세어 봐요!</div>';
          var wp0=el.querySelector('[data-act="wp"]'),wm0=el.querySelector('[data-act="wm"]');
          var hp0=el.querySelector('[data-act="hp"]'),hm0=el.querySelector('[data-act="hm"]');
          if(wp0)wp0.disabled=w>=maxW; if(wm0)wm0.disabled=w<=1;
          if(hp0)hp0.disabled=h>=maxH; if(hm0)hm0.disabled=h<=1;
        } else {
          var mult = G().mult && isRect;
          statusEl.innerHTML = '<span style="font-size:28px;color:#1B3A57;">넓이 ＝ </span>'
            + (mult?'<span style="font-size:30px;color:#0CA678;">'+w+' × '+h+' ＝ </span>':'<span style="font-size:28px;color:#1B3A57;">덮은 칸 </span>')
            + '<span style="font-size:48px;color:#0CA678;">'+n+'</span>'
            + '<span style="font-size:28px;color:#1B3A57;"> '+unit+'</span>'
            + ((G().perim && isRect)?'<span style="font-size:24px;color:#5a7894;">   (둘레 '+(2*(w+h))+'㎝)</span>':'');
          var wp=el.querySelector('[data-act="wp"]'),wm=el.querySelector('[data-act="wm"]');
          var hp=el.querySelector('[data-act="hp"]'),hm=el.querySelector('[data-act="hm"]');
          if(wp)wp.disabled=w>=maxW; if(wm)wm.disabled=w<=1;
          if(hp)hp.disabled=h>=maxH; if(hm)hm.disabled=h<=1;
        }
      }
    }

    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      var _M=curMissions();
      if (_M[mStep].check()) {
        mLock = true;
        ui.toast(el, true);
        setTimeout(function() {
          mStep++;
          if (mStep >= _M.length) { mDone = true; build(); return; }
          mLock = false;
          // 중·고 미션3은 가로7세로4 조작 — 시작 격자 리셋(저학년 미션엔 없음)
          if (grade!=='low' && mStep === 2) { w=5; h=3; fill_init(); }
          build();
        }, 1500);
      }
    }

    function bind() {
      var H = {
        wp:function(){if(w<maxW){w++;fill_init();render();checkMission();}},
        wm:function(){if(w>1){w--;fill_init();render();checkMission();}},
        hp:function(){if(h<maxH){h++;fill_init();render();checkMission();}},
        hm:function(){if(h>1){h--;fill_init();render();checkMission();}},
        reset:function(){w=startW();h=startH();fill_init();render();}
      };
      el.querySelectorAll('.aa-btn').forEach(function(b){b.addEventListener('click',function(){var f=H[b.dataset.act];if(f)f();});});
    }

    shuffleQuiz();
    build();
    return function cleanup() {};
  });
})();
