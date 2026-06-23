/* ============================================================================
   케이랩 도구 모듈 — 글자 조립 (hangul_build) v3 · 3모드
   초점 (1학년 한글 깨치기) = 자음과 모음(과 받침)이 만나 글자가 된다.
     · 자음 1개 + 모음 1개(+ 받침)를 고르면 → 글자가 즉시 합쳐져 크게 나타난다.
     · ㄱ+ㅏ=가, ㄱ+ㅏ+받침ㅁ=감 — 받침을 끼우고 빼며 글자 변화를 직접 본다.
     · 유니코드 한글 합성(초성·중성·종성)으로 11,172자 어떤 조합이든 정확히 표시.
   - 의존: window.KLab (THREE 불필요)
   - config: {
       consonant(초기 자음, 기본 'ㄱ'), vowel(초기 모음, 기본 'ㅏ'),
       consonants(보여줄 자음 배열, 기본 기본자음 14),
       vowels(보여줄 모음 배열, 기본 기본모음 10),
       batchim(초기 받침, 기본 '' = 없음),
       batchims(보여줄 받침 배열 | false = 받침 줄 숨김(v1 동작), 기본 8+쌍받침 2)
     }
   - v2 추가: 받침(종성) 줄. batchims:false 주면 v1(받침 없는 글자)과 동일.
   - v3: KLab.ui 3모드(자유탐구/미션4/퀴즈5). 퀴즈 = 조합식(ㄱ+ㅏ+ㅁ)을 보고 글자 고르기
         (결과 글자는 가림). config.mode:"free"|"mission"|"quiz".
   ============================================================================ */
(function () {
  if (!window.KLab) return;
  window.KLab.register('hangul_build', function (el, config) {
    config = config || {};
    var CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    var JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
    var JONG = ['ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    var defCons = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    var defVow = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];
    var defJong = ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㄲ', 'ㅆ'];
    var cons = (config.consonants && config.consonants.length) ? config.consonants : defCons;
    var vows = (config.vowels && config.vowels.length) ? config.vowels : defVow;
    var jongs = (config.batchims && config.batchims.length) ? config.batchims : defJong;
    var ui = window.KLab.ui;

    /* ── 학년 칸 (헌법 3장) — D칸 사다리 ── */
    var GRADES = {
      low:  { modes:['free','mission'],        jong:false, quiz:false, missionN:2 },
      mid:  { modes:['free','mission','quiz'], jong:true,  quiz:true,  missionN:3 },
      high: { modes:['free','mission','quiz'], jong:true,  quiz:true,  missionN:4 }
    };
    var grade = (['low','mid','high'].indexOf(config.grade) >= 0) ? config.grade : 'high';
    function G(){ return GRADES[grade]; }
    function useJong(){ return G().jong && config.batchims !== false; } // 받침 줄 노출 여부

    var mode = (G().modes.indexOf(config.mode) >= 0) ? config.mode : 'free';
    function startCho(){ return (config.consonant && CHO.indexOf(config.consonant) >= 0) ? config.consonant : cons[0]; }
    function startJung(){ return (config.vowel && JUNG.indexOf(config.vowel) >= 0) ? config.vowel : vows[0]; }
    function startJong(){ return (useJong() && config.batchim && JONG.indexOf(config.batchim) >= 0) ? config.batchim : ''; }
    var cho = startCho(), jung = startJung(), jong = startJong();

    var bands = ui.gradeBands({grade:grade, locked:!!config.grade, onChange:function(g){
      grade=g;
      if(G().modes.indexOf(mode)<0) mode='free';
      mStep=0; mDone=false; mLock=false;
      cho=startCho(); jung=startJung(); jong=startJong();
      if(mode==='quiz') shuffleQuiz();
      build();
    }});

    function compose(c, j, b) {
      var ci = CHO.indexOf(c), ji = JUNG.indexOf(j);
      if (ci < 0 || ji < 0) return '';
      var bi = b ? JONG.indexOf(b) + 1 : 0;
      if (bi < 0) bi = 0;
      return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + bi);
    }

    /* ───────────── 미션 (학년칸·받침 여부 동적) ───────────── */
    function curMissions() {
      var hasJong = useJong();
      var M = [
        { text: 'ㄱ과 ㅏ를 골라 <b style="color:#7048E8;">〈가〉</b>를 만들어 봐요!',
          check: function () { return compose(cho, jung, jong) === '가'; } },
        { text: '모음만 바꿔 <b style="color:#7048E8;">〈고〉</b>를 만들어 봐요!',
          check: function () { return compose(cho, jung, jong) === '고'; } },
        hasJong
          ? { text: '받침 ㅁ을 끼워 <b style="color:#7048E8;">〈곰〉</b>! 받침은 글자 아래에 들어가요!',
              check: function () { return compose(cho, jung, jong) === '곰'; } }
          : { text: '자음을 바꿔 <b style="color:#7048E8;">〈노〉</b>를 만들어 봐요!',
              check: function () { return compose(cho, jung, jong) === '노'; } },
        hasJong
          ? { text: '자음·모음·받침을 바꿔 <b style="color:#7048E8;">〈산〉</b>을 만들어 봐요!',
              check: function () { return compose(cho, jung, jong) === '산'; } }
          : { text: '<b style="color:#7048E8;">〈수〉</b>를 만들어 봐요!',
              check: function () { return compose(cho, jung, jong) === '수'; } }
      ];
      return M.slice(0, G().missionN);
    }
    var mStep = 0, mDone = false, mLock = false;
    function checkMission() {
      if (mode !== 'mission' || mDone || mLock) return;
      var M = curMissions();
      if (M[mStep].check()) {
        mLock = true; ui.toast(el, true);
        setTimeout(function () {
          mLock = false; mStep++;
          if (mStep >= M.length) mDone = true;
          build();
        }, 1500);
      }
    }

    /* ───────────── 퀴즈 (조합식을 보고 글자 고르기 — 결과 가림) ───────────── */
    var ALL_QUIZ = [
      { cho: 'ㄱ', jung: 'ㅏ', jong: '',  answer: '가', choices: ['가', '거', '기'] },
      { cho: 'ㄴ', jung: 'ㅗ', jong: '',  answer: '노', choices: ['노', '누', '나'] },
      { cho: 'ㄱ', jung: 'ㅏ', jong: 'ㅁ', answer: '감', choices: ['감', '강', '곰'] },
      { cho: 'ㅂ', jung: 'ㅏ', jong: 'ㅂ', answer: '밥', choices: ['밥', '법', '봅'] },
      { cho: 'ㅎ', jung: 'ㅏ', jong: 'ㄴ', answer: '한', choices: ['한', '함', '혼'] }
    ];
    // 받침 가능 여부로 거르고, 중학년은 기본 3문, 고학년은 전체
    function quizPool() {
      var base = ALL_QUIZ.filter(function (q) { return useJong() || !q.jong; });
      return (grade === 'mid') ? base.slice(0, 3) : base;
    }
    var qList = [], qIdx = 0, qScore = 0, qCount = 0, qLock = false;
    function shuffleQuiz() {
      qList = quizPool().slice();
      for (var i = qList.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = qList[i]; qList[i] = qList[j]; qList[j] = t; }
      qIdx = 0; qScore = 0; qCount = 0;
    }
    function shuffled(arr) { var c = arr.slice(); for (var i = c.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = c[i]; c[i] = c[j]; c[j] = t; } return c; }
    function quizQText(q) {
      return '<span style="color:#1E88A8;">' + q.cho + '</span> ＋ <span style="color:#E07A2C;">' + q.jung + '</span>'
        + (q.jong ? ' ＋ <span style="color:#12B886;">' + q.jong + '</span>' : '')
        + ' ＝ 무슨 글자일까요?';
    }

    var C_CON = '#1E88A8', C_CON_BG = '#E3F1F5', C_CON_LINE = '#13647A';
    var C_VOW = '#E07A2C', C_VOW_BG = '#FBEDDF', C_VOW_LINE = '#B25812';
    var C_JNG = '#12B886', C_JNG_BG = '#E2F7F0', C_JNG_LINE = '#0B7A5C';
    var keyBase = 'font-family:inherit;cursor:pointer;border-radius:16px;font-weight:800;line-height:1;transition:transform .08s,background .15s;font-size:clamp(22px,3.4vw,34px);min-width:clamp(52px,7vw,72px);padding:14px 4px;';

    var resultEl, breakEl, consWrap, vowsWrap, jongsWrap;
    function build() {
      var top = bands.selectorHTML() + ui.modeTabs(G().modes, mode), bar = '', foot = '';
      if (mode === 'mission') { var M = curMissions(); bar = mDone ? ui.doneBar() : ui.missionBar(M[mStep].text, mStep, M.length); }
      else if (mode === 'quiz') {
        var q = qList[qIdx] || qList[0];
        cho = q.cho; jung = q.jung; jong = q.jong;
        bar = ui.quizBar(quizQText(q), qScore, qCount);
        foot = ui.choices(shuffled(q.choices).map(function (v) { return { v: v, label: '<span style="font-size:34px;">' + v + '</span>' }; }));
      }
      el.innerHTML = '<style>'
        + '.hb-key:active{transform:translateY(2px);}'
        + '.hb-result{animation:hbPop .3s cubic-bezier(.2,1.4,.4,1);}'
        + '@keyframes hbPop{from{transform:scale(.5);opacity:0;}to{transform:scale(1);opacity:1;}}'
        + '.kl-choice{min-width:110px !important;}'
        + '</style>'
        + top + bar
        + '<div class="kl-stage-host" style="position:relative;">'
        + '<div class="hb-stage" style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:18px;">'
        + (mode === 'quiz' ? '' : '<div class="hb-break" style="font-size:clamp(26px,4vw,40px);font-weight:800;color:#5a6b78;display:flex;align-items:center;gap:10px;"></div>')
        + '<div class="hb-result-wrap" style="width:100%;display:flex;justify-content:center;">'
        + (mode === 'quiz'
          ? '<div class="hb-result" style="font-size:clamp(120px,22vw,220px);font-weight:800;color:#C9D7E6;line-height:1;">?</div>'
          : '<div class="hb-result" style="font-size:clamp(120px,22vw,220px);font-weight:800;color:#2C3A45;line-height:1;"></div>')
        + '</div></div>'
        + '</div>'
        + foot
        + (mode === 'quiz' ? '' :
          '<div style="display:flex;flex-direction:column;gap:14px;">'
          + '<div><div style="font-size:clamp(15px,2vw,18px);font-weight:800;color:' + C_CON + ';margin-bottom:7px;">자음 (닿소리)</div>'
          + '<div class="hb-cons" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div></div>'
          + '<div><div style="font-size:clamp(15px,2vw,18px);font-weight:800;color:' + C_VOW + ';margin-bottom:7px;">모음 (홀소리)</div>'
          + '<div class="hb-vows" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div></div>'
          + (useJong()
            ? '<div><div style="font-size:clamp(15px,2vw,18px);font-weight:800;color:' + C_JNG + ';margin-bottom:7px;">받침 (글자 아래에 끼워요)</div>'
              + '<div class="hb-jongs" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div></div>'
            : '')
          + '</div>'
          + '<div style="text-align:center;margin-top:16px;">'
          + '<button class="hb-reset" style="font-family:inherit;cursor:pointer;border-radius:14px;border:3px solid #9aa;background:#fff;color:#666;font-weight:800;font-size:clamp(16px,2vw,20px);padding:11px 24px;">↺ 처음으로</button>'
          + '</div>');

      resultEl = el.querySelector('.hb-result');
      breakEl = el.querySelector('.hb-break');
      consWrap = el.querySelector('.hb-cons');
      vowsWrap = el.querySelector('.hb-vows');
      jongsWrap = el.querySelector('.hb-jongs');
      makeKeys(consWrap, cons, 'cho');
      makeKeys(vowsWrap, vows, 'jung');
      if (useJong()) makeKeys(jongsWrap, [''].concat(jongs), 'jong');

      ui.bindModeTabs(el, function (m2) {
        mode = m2; mStep = 0; mDone = false; mLock = false;
        cho = startCho(); jung = startJung(); jong = startJong();
        if (m2 === 'mission') { cho = cons[1] || cons[0]; jung = vows[0]; jong = ''; }  // '나'에서 시작(가 자동달성 방지)
        if (m2 === 'quiz') shuffleQuiz();
        build();
      });
      bands.bind(el);
      el.querySelectorAll('.kl-choice').forEach(function (b) {
        b.addEventListener('click', function () {
          if (qLock) return; qLock = true; qCount++;
          var q = qList[qIdx];
          var ok = (b.dataset.v === String(q.answer));
          if (ok) qScore++;
          ui.toast(el, ok);
          if (ok && resultEl) { resultEl.textContent = q.answer; resultEl.style.color = '#2C3A45'; }  // 정답이면 글자 공개
          setTimeout(function () {
            qIdx++; if (qIdx >= qList.length) shuffleQuiz();
            qLock = false; build();
          }, 1400);
        });
      });
      if (mode !== 'quiz') paint();
    }

    function makeKeys(wrap, list, kind) {
      if (!wrap) return;
      wrap.innerHTML = '';
      list.forEach(function (ch) {
        var b = document.createElement('button');
        b.className = 'hb-key';
        b.textContent = (kind === 'jong' && ch === '') ? '없음' : ch;
        b.setAttribute('data-ch', ch);
        b.setAttribute('data-kind', kind);
        var line = kind === 'cho' ? C_CON_LINE : (kind === 'jung' ? C_VOW_LINE : C_JNG_LINE);
        b.style.cssText = keyBase + 'border:3px solid ' + line + ';'
          + (kind === 'jong' && ch === '' ? 'font-size:clamp(16px,2.2vw,22px);' : '');
        wrap.appendChild(b);
      });
    }
    makeKeys(consWrap, cons, 'cho');
    makeKeys(vowsWrap, vows, 'jung');
    if (useJong()) makeKeys(jongsWrap, [''].concat(jongs), 'jong');

    function paint() {
      if (!resultEl) return;
      var g = compose(cho, jung, jong);
      resultEl.textContent = g;
      // 합쳐지는 느낌: 매 갱신마다 pop 재생
      resultEl.classList.remove('hb-result');
      void resultEl.offsetWidth;
      resultEl.classList.add('hb-result');
      if (breakEl) breakEl.innerHTML = '<span style="color:' + C_CON + ';">' + cho + '</span>'
        + '<span style="color:#9aa;font-weight:700;">＋</span>'
        + '<span style="color:' + C_VOW + ';">' + jung + '</span>'
        + (jong
          ? '<span style="color:#9aa;font-weight:700;">＋</span><span style="color:' + C_JNG + ';">' + jong + '</span>'
          : '')
        + '<span style="color:#9aa;font-weight:700;">＝</span>'
        + '<span style="color:#2C3A45;">' + g + '</span>';
      el.querySelectorAll('.hb-key').forEach(function (b) {
        var kind = b.dataset.kind;
        var on = (kind === 'cho' && b.dataset.ch === cho)
          || (kind === 'jung' && b.dataset.ch === jung)
          || (kind === 'jong' && b.dataset.ch === jong);
        var C = kind === 'cho' ? C_CON : (kind === 'jung' ? C_VOW : C_JNG);
        var BG = kind === 'cho' ? C_CON_BG : (kind === 'jung' ? C_VOW_BG : C_JNG_BG);
        var LINE = kind === 'cho' ? C_CON_LINE : (kind === 'jung' ? C_VOW_LINE : C_JNG_LINE);
        b.style.background = on ? C : BG;
        b.style.color = on ? '#fff' : LINE;
      });
    }

    el.addEventListener('click', function (e) {
      var k = e.target.closest('.hb-key');
      if (k) {
        if (k.dataset.kind === 'cho') cho = k.dataset.ch;
        else if (k.dataset.kind === 'jung') jung = k.dataset.ch;
        else jong = k.dataset.ch;
        paint();
        if (mode === 'mission') checkMission();
        return;
      }
      if (e.target.closest('.hb-reset')) {
        cho = (mode === 'mission') ? cons[0] : startCho();
        jung = (mode === 'mission') ? vows[0] : startJung();
        jong = (mode === 'mission') ? '' : startJong();
        paint();
      }
    });

    shuffleQuiz();
    build();
    return function cleanup() {};
  });
})();
