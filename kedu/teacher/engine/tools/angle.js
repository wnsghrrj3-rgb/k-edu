/* ============================================================================
   케이랩 도구 모듈 — 각도기 (angle) v4 · 3모드 + 학년칸
   v4: 학년 칸(low/mid/high) — D칸 표상 전환 사다리.
     · 저 = 각도 숫자·눈금 숫자 숨김·"조금/많이 벌어진 각" 일상어
            ·★직각(90°)일 때 반듯한 코너(┐) 기호가 뜨는 신규 닻·step 15·퀴즈 숨김.
     · 중 = 각도기 눈금 읽기·예각/직각/둔각 용어·퀴즈(분류·눈금 읽기).
     · 고 = 기존 전부 유지(양방향 눈금·왼쪽 0 미션·퀴즈 5문).
   - 의존: window.KLab
   - config: { deg, step, startSide, showGuide, grade:"low|mid|high", mode }
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('angle', function (el, config) {
    var ui = window.KLab.ui;
    function snd(n){ if(window.KLab.sound&&window.KLab.sound.play) window.KLab.sound.play(n); } // 와우 ③ 효과음
    var armLong = false; // 와우 ④ 변 길이 — 늘여도 각도 불변(길이=각크기 오개념 반증)

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES={
      low:  { modes:['free','mission'],        step:15, nums:false, kindWord:false, rightMark:true,  guide:false, twoway:false },
      mid:  { modes:['free','mission','quiz'], step:5,  nums:true,  kindWord:true,  rightMark:false, guide:true,  twoway:false },
      high: { modes:['free','mission','quiz'], step:5,  nums:true,  kindWord:true,  rightMark:false, guide:true,  twoway:true  }
    };
    var grade=(['low','mid','high'].indexOf(config.grade)>=0)?config.grade:'high';
    function G(){ return GRADES[grade]; }

    function defDeg(){ return (typeof config.deg==='number')?Math.max(0,Math.min(config.deg,180)):(grade==='low'?45:50); }
    function curStep(){ return config.step || G().step; }
    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';

    // ---- 자유탐구 상태 ----
    var deg = defDeg();
    var startSide = (config.startSide === 'left' && G().twoway) ? 'left' : 'right';
    function guideOn(){ return (config.showGuide !== false) && G().guide; }

    var bands=ui.gradeBands({grade:grade,locked:!!config.grade,onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      if(!G().twoway) startSide='right';
      deg=defDeg(); mStep=0; mDone=false; mLock=false; armLong=false;
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    // ---- 미션 (학년칸별 풀) ----
    var LOW_MISSIONS = [
      { text: '두 변을 <b style="color:#7048E8;">조금만</b> 벌려 봐요! (뾰족한 각)',
        check: function() { return deg > 0 && deg < 90; } },
      { text: '딱 <b style="color:#7048E8;">반듯한 직각</b>을 만들어 봐요! (┐ 모양이 떠요)',
        check: function() { return deg === 90; } },
      { text: '이번엔 <b style="color:#7048E8;">많이</b> 벌려 봐요! (넓은 각)',
        check: function() { return deg > 90 && deg < 180; } }
    ];
    var MID_MISSIONS = [
      { text: '<b style="color:#7048E8;">예각</b>(0°보다 크고 90°보다 작은 각)을 만들어 봐요!',
        check: function() { return deg > 0 && deg < 90; } },
      { text: '정확히 <b style="color:#7048E8;">직각(90°)</b>을 만들어 봐요!',
        check: function() { return deg === 90; } },
      { text: '<b style="color:#7048E8;">둔각</b>(90°보다 크고 180°보다 작은 각)을 만들어 봐요!',
        check: function() { return deg > 90 && deg < 180; } }
    ];
    var HIGH_MISSIONS = [
      { text: '<b style="color:#7048E8;">예각</b>(0°보다 크고 90°보다 작은 각)을 만들어 봐요!',
        check: function() { return deg > 0 && deg < 90; } },
      { text: '정확히 <b style="color:#7048E8;">직각(90°)</b>을 만들어 봐요!',
        check: function() { return deg === 90; } },
      { text: '<b style="color:#7048E8;">둔각</b>(90°보다 크고 180°보다 작은 각)을 만들어 봐요!',
        check: function() { return deg > 90 && deg < 180; } },
      { text: '<b style="color:#7048E8;">왼쪽 0에서</b> 시작해서 <b style="color:#7048E8;">70°</b>를 만들어 봐요!',
        check: function() { return startSide === 'left' && deg === 70; } }
    ];
    function curMissions(){ return (grade==='low')?LOW_MISSIONS:(grade==='mid')?MID_MISSIONS:HIGH_MISSIONS; }
    var mStep = 0, mDone = false, mLock = false;

    // ---- 퀴즈 (중·고만) ----
    var QUIZ_POOL = [
      { q: '이 각의 종류는 무엇인가요?', deg: 45,  answer: '예각',  choices: ['예각','직각','둔각','평각'] },
      { q: '이 각의 종류는 무엇인가요?', deg: 90,  answer: '직각',  choices: ['예각','직각','둔각','평각'] },
      { q: '이 각의 종류는 무엇인가요?', deg: 130, answer: '둔각',  choices: ['예각','직각','둔각','평각'] },
      { q: '이 각은 몇 도일까요?',        deg: 60,  answer: '60',   choices: ['50','60','70','80'] },
      { q: '이 각은 몇 도일까요?',        deg: 120, answer: '120',  choices: ['100','110','120','130'] },
    ];
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = QUIZ_POOL.slice();
      for (var i = qList.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = qList[i]; qList[i] = qList[j]; qList[j] = tmp;
      }
      qIdx = 0; qScore = 0; qCount = 0;
    }

    var btn = 'font-size:24px;padding:13px 22px;border-radius:16px;border:3px solid #1565C0;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;transition:transform .08s;';
    var tgl = 'font-size:21px;padding:11px 18px;border-radius:14px;border:3px solid #0B7285;background:#fff;color:#0B7285;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;';

    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode);
      var bar = '', foot = '';
      var sideRow = G().twoway ? ('<div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;">'
        + '<button class="ag-side' + (startSide==='left'?' ag-on':'') + '" data-side="left" style="' + tgl + '">◀ 왼쪽 0에서</button>'
        + '<button class="ag-side' + (startSide==='right'?' ag-on':'') + '" data-side="right" style="' + tgl + '">오른쪽 0에서 ▶</button>'
        + '</div>') : '';
      var ctrlRow = sideRow
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">'
        + '<button class="ag-btn" data-act="minus" style="' + btn + 'background:#fff;color:#1565C0;">－ 각</button>'
        + '<button class="ag-btn" data-act="plus"  style="' + btn + 'background:#1565C0;color:#fff;">＋ 각</button>'
        + '<button class="ag-btn" data-act="arm" style="' + btn + 'background:' + (armLong?'#7048E8':'#fff') + ';color:' + (armLong?'#fff':'#7048E8') + ';border-color:#7048E8;">🔭 ' + (armLong?'변 줄이기':'변 늘이기') + '</button>'
        + '<button class="ag-btn" data-act="reset" style="font-size:24px;padding:13px 18px;border-radius:16px;border:3px solid #9aa;background:#fff;color:#666;cursor:pointer;font-weight:800;font-family:inherit;line-height:1;">↺</button>'
        + '</div>';

      if (mode === 'mission') {
        var _M=curMissions();
        bar = mDone ? ui.doneBar() : ui.missionBar(_M[mStep].text, mStep, _M.length);
      } else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        bar = ui.quizBar(q.q, qScore, qCount);
        foot = ui.choices(q.choices.map(function(v){ return {v:v,label:v}; }));
      }

      var showCtrl = (mode !== 'quiz');
      el.innerHTML = '<style>.ag-btn:active,.ag-side:active{transform:translateY(2px);}.ag-stage{cursor:grab;}.ag-stage.drag{cursor:grabbing;}.ag-side.ag-on{background:#0B7285 !important;color:#fff !important;}.kl-choice{min-width:90px !important;}'
        + '.ag-flash{animation:agFlashKf 1.8s ease both;}@keyframes agFlashKf{0%{opacity:0;}12%{opacity:1;}82%{opacity:1;}100%{opacity:0;}}'   /* 와우 ④ 길이 불변 배너 */
        + '.ag-hold{display:inline-block;animation:agHoldKf 1.1s ease both;transform-origin:center;}@keyframes agHoldKf{0%{transform:scale(1);}25%{transform:scale(1.35);color:#7048E8;}55%{transform:scale(.9);}100%{transform:scale(1);}}'   /* 와우 ④ 각도는 그대로 펄스 */
        + '</style>'
        + top + bar
        + (showCtrl ? ctrlRow : '')
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="ag-stage" style="width:100%;height:' + (mode==='quiz'?'42vh':'50vh') + ';min-height:340px;background:radial-gradient(120% 120% at 30% 0%,#FBFDFF 0%,#E4EFFB 70%,#D6E7F8 100%);border-radius:26px;overflow:hidden;touch-action:none;box-shadow:inset 0 0 0 3px rgba(21,101,192,0.10);"></div>'
        + '</div>'
        + foot
        + '<div class="ag-status" style="text-align:center;margin-top:12px;font-weight:800;font-family:inherit;"></div>';

      ui.bindModeTabs(el, function(m) {
        mode = m; deg = defDeg(); if(!G().twoway) startSide = 'right'; armLong = false;
        mStep = 0; mDone = false; mLock = false;
        if (m === 'quiz') shuffleQuiz();
        build();
      });
      bands.bind(el);
      bindControls(); render();
    }

    var VBW = 900, VBH = 440, cx = VBW/2, cy = VBH - 90, R = 260;
    function P(a, r) { var rad = a * Math.PI / 180; return [cx + r*Math.cos(rad), cy - r*Math.sin(rad)]; }
    function kind(d) { if(d===0)return['','']; if(d<90)return['예각','#0CA678']; if(d===90)return['직각','#1565C0']; if(d<180)return['둔각','#E8590C']; return['평각','#7048E8']; }
    function lowWord(d) { if(d===0)return['','#5a7894']; if(d<90)return['조금 벌어진 각','#0CA678']; if(d===90)return['반듯한 직각!','#1565C0']; if(d<180)return['많이 벌어진 각','#E8590C']; return['쭉 펴진 각','#7048E8']; }
    function svgEl(t,a){var e=document.createElementNS('http://www.w3.org/2000/svg',t);for(var k in a)e.setAttribute(k,a[k]);return e;}
    function txt(svg,x,y,s,sz,fill,fw){var t=svgEl('text',{x:x,y:y,'text-anchor':'middle','font-family':'Gowun Dodum,sans-serif','font-size':sz,'font-weight':fw||800,fill:fill});t.textContent=s;svg.appendChild(t);}

    function render(quizDeg, opts) {
      opts = opts || {};
      var stage = el.querySelector('.ag-stage');
      var statusEl = el.querySelector('.ag-status');
      if (!stage) return;
      stage.innerHTML = '';
      var d = (mode === 'quiz') ? quizDeg : deg;
      var svg = svgEl('svg', {viewBox:'0 0 '+VBW+' '+VBH, width:'100%', height:'100%'});
      var defs = svgEl('defs',{});
      defs.innerHTML = '<filter id="agSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#13315C" flood-opacity="0.18"/></filter>';
      svg.appendChild(defs);
      var kc = kind(d)[1] || '#1565C0';
      var right = (startSide === 'right');
      var posA = right ? d : (180 - d);
      var baseA = right ? 0 : 180;
      var armLen = R * (armLong ? 1.32 : 1.0); // 와우 ④ 변만 길어짐(호·눈금·각도 숫자는 R 그대로)
      if(d > 0) {
        var rr = R*0.60, pb = P(baseA, rr), pm = P(posA, rr), lg = (d>180)?1:0, sweep = right?0:1;
        svg.appendChild(svgEl('path',{d:'M '+cx+' '+cy+' L '+pb[0]+' '+pb[1]+' A '+rr+' '+rr+' 0 '+lg+' '+sweep+' '+pm[0]+' '+pm[1]+' Z',fill:kc,'fill-opacity':0.15}));
      }
      svg.appendChild(svgEl('path',{d:'M '+(cx-R)+' '+cy+' A '+R+' '+R+' 0 0 1 '+(cx+R)+' '+cy+' Z',fill:'#fff','fill-opacity':0.55,stroke:'#9AB7D4','stroke-width':2,filter:'url(#agSh)'}));
      for(var a=0;a<=180;a+=10){
        var big=(a%30===0), p1=P(a,R), p2=P(a,big?R-24:R-14);
        svg.appendChild(svgEl('line',{x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1],stroke:'#5a7894','stroke-width':big?2.5:1.5}));
        if(big && G().nums){
          var pOut=P(a,R-44), pIn=P(a,R-82);
          var outActive=(right && a===d), inActive=(!right && (180-a)===d);
          txt(svg,pOut[0],pOut[1]+6,String(a),outActive?22:16,outActive?kc:'#8AA6C2',outActive?800:600);
          if(G().twoway) txt(svg,pIn[0],pIn[1]+6,String(180-a),inActive?22:16,inActive?kc:'#B0C4DA',inActive?800:600);
        }
      }
      var base=P(baseA,armLen), mov=P(posA,armLen);
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:base[0],y2:base[1],stroke:'#1B3A57','stroke-width':7,'stroke-linecap':'round'}));
      svg.appendChild(svgEl('line',{x1:cx,y1:cy,x2:mov[0],y2:mov[1],stroke:kc,'stroke-width':8,'stroke-linecap':'round'}));
      // ★저학년 직각 기호 닻: d===90이면 꼭짓점에 반듯한 코너(┐)
      if(G().rightMark && d===90){
        var s=34, dir=right?1:-1;
        svg.appendChild(svgEl('path',{d:'M '+(cx+dir*s)+' '+cy+' L '+(cx+dir*s)+' '+(cy-s)+' L '+cx+' '+(cy-s),fill:'none',stroke:'#1565C0','stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'}));
      }
      // 퀴즈 모드 또는 저학년(nums off)은 각도 숫자 숨김
      if (mode !== 'quiz' && G().nums) {
        svg.appendChild(svgEl('circle',{cx:mov[0],cy:mov[1],r:16,fill:kc,stroke:'#fff','stroke-width':4,style:'cursor:grab;'}));
        var mid = P((baseA+posA)/2, R*0.38);
        txt(svg, mid[0], mid[1]+10, d+'°', 38, kc);
      } else {
        svg.appendChild(svgEl('circle',{cx:mov[0],cy:mov[1],r:(mode!=='quiz'?16:14),fill:kc,stroke:'#fff','stroke-width':4,style:(mode!=='quiz'?'cursor:grab;':'')}));
      }
      svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:10,fill:'#1B3A57'}));
      if(guideOn() && mode === 'free'){
        svg.appendChild(svgEl('circle',{cx:cx,cy:cy,r:22,fill:'none',stroke:'#E8590C','stroke-width':2.5,'stroke-dasharray':'4 4'}));
        txt(svg,cx,cy+44,'① 중심을 꼭짓점에',18,'#E8590C');
        var bl=P(baseA,R*0.78); txt(svg,bl[0],bl[1]+28,'② 이 변을 0에',17,'#1B3A57');
        var rd=P(posA,R+4), rd2=P(posA,R+34);
        svg.appendChild(svgEl('circle',{cx:rd[0],cy:rd[1],r:5,fill:kc}));
        txt(svg,rd2[0],rd2[1]+(rd2[1]<cy?-8:20),'③ 여기 눈금 읽기',17,kc);
      }
      // 와우 ④ 마법모먼트 — 변을 늘여도 각도기 숫자는 꿈쩍 안 함(길이=각크기 오개념 반증). 1회성.
      if(opts.flash){
        var fg=svgEl('g',{class:'ag-flash','pointer-events':'none'});
        fg.appendChild(svgEl('rect',{x:cx-330,y:8,width:660,height:38,rx:19,fill:'#7048E8',opacity:'0.96',filter:'url(#agSh)'}));
        var ft=svgEl('text',{x:cx,y:28,'text-anchor':'middle','dominant-baseline':'central','font-family':'Gowun Dodum,sans-serif','font-size':20,'font-weight':800,fill:'#fff'});
        ft.textContent='✋ 변을 늘여도 각의 크기는 그대로! 각은 길이가 아니라 두 변이 벌어진 정도';
        fg.appendChild(ft); svg.appendChild(fg);
      }
      stage.appendChild(svg);

      if (statusEl) {
        var hold = opts.flash ? ' ag-hold' : '';
        if (mode === 'quiz') {
          statusEl.innerHTML = '<span style="font-size:22px;color:#5a7894;">각도를 확인하고 아래에서 선택하세요!</span>';
        } else if (grade==='low') {
          // ★저학년: 각도 숫자 없이 벌어짐 일상어
          var lw = lowWord(d);
          statusEl.innerHTML = lw[0] ? ('<span class="'+('agw'+hold)+'" style="font-size:36px;color:'+lw[1]+';">'+lw[0]+'</span>') : '<span style="font-size:24px;color:#5a7894;">두 변을 벌려 봐요!</span>';
        } else {
          var k = kind(d);
          statusEl.innerHTML = '<span class="'+('agw'+hold)+'" style="font-size:32px;color:'+kc+';">'+d+'°</span>'
            + (G().kindWord && k[0]?'<span style="font-size:26px;color:#1B3A57;"> — </span><span style="font-size:32px;color:'+kc+';">'+k[0]+'</span>':'');
        }
        var pb=el.querySelector('[data-act="plus"]'), mb=el.querySelector('[data-act="minus"]');
        if(pb)pb.disabled=(d>=180); if(mb)mb.disabled=(d<=0);
      }
    }

    var dragging = false;
    function snapStep(a){ var st=curStep(); return Math.round(a/st)*st; }
    function angleFromEvent(e) {
      var stage = el.querySelector('.ag-stage');
      var rect = stage.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      var sx=(p.clientX-rect.left)/rect.width*VBW, sy=(p.clientY-rect.top)/rect.height*VBH;
      var a=Math.atan2(cy-sy,sx-cx)*180/Math.PI; a=Math.max(0,Math.min(Math.round(a),180));
      var dd = (startSide==='right')? a : (180-a);
      // 저학년은 step(15) 단위 스냅 — 직각(90) 정확히 짚기 쉽게
      if(grade==='low') dd=Math.max(0,Math.min(snapStep(dd),180));
      return dd;
    }
    var mm=function(e){if(dragging&&mode==='free'){deg=angleFromEvent(e);render();}};
    var mu=function(){dragging=false;var s=el.querySelector('.ag-stage');if(s)s.classList.remove('drag');};

    function checkMission(action) {
      if (mode !== 'mission' || mDone || mLock) return;
      var _M=curMissions();
      if (_M[mStep].check(action)) {
        mLock = true;
        ui.toast(el, true);
        setTimeout(function() {
          mStep++;
          if (mStep >= _M.length) { mDone = true; build(); return; }
          mLock = false; build();
        }, 1500);
      }
    }

    function bindControls() {
      var stage = el.querySelector('.ag-stage');
      if (stage && mode === 'free') {
        stage.addEventListener('mousedown',function(e){dragging=true;stage.classList.add('drag');deg=angleFromEvent(e);render();});
        stage.addEventListener('touchstart',function(e){dragging=true;deg=angleFromEvent(e);render();e.preventDefault();},{passive:false});
        stage.addEventListener('touchmove',function(e){if(dragging){deg=angleFromEvent(e);render();e.preventDefault();}},{passive:false});
        stage.addEventListener('touchend',function(){dragging=false;});
      }
      var plusBtn = el.querySelector('[data-act="plus"]');
      var minusBtn = el.querySelector('[data-act="minus"]');
      var resetBtn = el.querySelector('[data-act="reset"]');
      var armBtn = el.querySelector('[data-act="arm"]');
      if (plusBtn) plusBtn.addEventListener('click', function() {
        deg = Math.min(180, deg + curStep()); snd(deg===90?'select':'tap'); render(); // 직각 스냅
        if (mode === 'mission') checkMission('change');
      });
      if (minusBtn) minusBtn.addEventListener('click', function() {
        deg = Math.max(0, deg - curStep()); snd(deg===90?'select':'tap'); render();
        if (mode === 'mission') checkMission('change');
      });
      if (resetBtn) resetBtn.addEventListener('click', function() {
        deg = defDeg(); if(!G().twoway) startSide = 'right'; armLong = false; build();
      });
      // 와우 ④ 변 늘이기 — 늘이는 순간(짧→긺)에만 길이 불변 마법(각도 그대로). 줄이기는 조용히.
      if (armBtn) armBtn.addEventListener('click', function() {
        armLong = !armLong; snd(armLong?'whoosh':'tap'); build(); render(null, {flash:armLong});
      });
      el.querySelectorAll('.ag-side').forEach(function(b){
        b.addEventListener('click', function() {
          if(startSide !== b.dataset.side){ startSide = b.dataset.side; build(); }
          if (mode === 'mission') checkMission('side');
        });
      });
      // 퀴즈 선택지
      el.querySelectorAll('.kl-choice').forEach(function(b) {
        b.addEventListener('click', function() {
          if (qLock) return;
          qLock = true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          setTimeout(function() {
            qIdx++;
            if (qIdx >= qList.length) { shuffleQuiz(); }
            qLock = false; build();
            var nq = qList[qIdx] || qList[0];
            render(nq.deg);
          }, 1400);
        });
      });
      // 미션 모드에서 드래그 변경도 체크
      if (stage && mode === 'mission') {
        stage.addEventListener('mousedown',function(e){dragging=true;stage.classList.add('drag');deg=angleFromEvent(e);render();checkMission('change');});
        stage.addEventListener('touchstart',function(e){dragging=true;deg=angleFromEvent(e);render();checkMission('change');e.preventDefault();},{passive:false});
        stage.addEventListener('touchmove',function(e){if(dragging){deg=angleFromEvent(e);render();checkMission('change');}},{passive:false});
        stage.addEventListener('touchend',function(){dragging=false;});
      }
    }

    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);

    shuffleQuiz();
    build();
    if (mode === 'quiz') { var q0 = qList[0]; render(q0.deg); }

    return function cleanup() {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
    };
  });
})();
