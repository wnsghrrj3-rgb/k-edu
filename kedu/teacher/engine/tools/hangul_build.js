/* ============================================================================
   케이랩 도구 모듈 — 글자 조립 (hangul_build) v2
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
    var useJong = config.batchims !== false; // false = 받침 줄 숨김(v1 동작)
    var jongs = (config.batchims && config.batchims.length) ? config.batchims : defJong;
    var cho = (config.consonant && CHO.indexOf(config.consonant) >= 0) ? config.consonant : cons[0];
    var jung = (config.vowel && JUNG.indexOf(config.vowel) >= 0) ? config.vowel : vows[0];
    var jong = (useJong && config.batchim && JONG.indexOf(config.batchim) >= 0) ? config.batchim : '';

    function compose(c, j, b) {
      var ci = CHO.indexOf(c), ji = JUNG.indexOf(j);
      if (ci < 0 || ji < 0) return '';
      var bi = b ? JONG.indexOf(b) + 1 : 0;
      if (bi < 0) bi = 0;
      return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + bi);
    }

    var C_CON = '#1E88A8', C_CON_BG = '#E3F1F5', C_CON_LINE = '#13647A';
    var C_VOW = '#E07A2C', C_VOW_BG = '#FBEDDF', C_VOW_LINE = '#B25812';
    var C_JNG = '#12B886', C_JNG_BG = '#E2F7F0', C_JNG_LINE = '#0B7A5C';
    var keyBase = 'font-family:inherit;cursor:pointer;border-radius:16px;font-weight:800;line-height:1;transition:transform .08s,background .15s;font-size:clamp(22px,3.4vw,34px);min-width:clamp(52px,7vw,72px);padding:14px 4px;';

    el.innerHTML = '<style>'
      + '.hb-key:active{transform:translateY(2px);}'
      + '.hb-result{animation:hbPop .3s cubic-bezier(.2,1.4,.4,1);}'
      + '@keyframes hbPop{from{transform:scale(.5);opacity:0;}to{transform:scale(1);opacity:1;}}'
      + '</style>'
      + '<div class="hb-stage" style="display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:18px;">'
      + '<div class="hb-break" style="font-size:clamp(26px,4vw,40px);font-weight:800;color:#5a6b78;display:flex;align-items:center;gap:10px;"></div>'
      + '<div class="hb-result-wrap" style="width:100%;display:flex;justify-content:center;">'
      + '<div class="hb-result" style="font-size:clamp(120px,22vw,220px);font-weight:800;color:#2C3A45;line-height:1;"></div>'
      + '</div></div>'
      + '<div style="display:flex;flex-direction:column;gap:14px;">'
      + '<div><div style="font-size:clamp(15px,2vw,18px);font-weight:800;color:' + C_CON + ';margin-bottom:7px;">자음 (닿소리)</div>'
      + '<div class="hb-cons" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div></div>'
      + '<div><div style="font-size:clamp(15px,2vw,18px);font-weight:800;color:' + C_VOW + ';margin-bottom:7px;">모음 (홀소리)</div>'
      + '<div class="hb-vows" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div></div>'
      + (useJong
        ? '<div><div style="font-size:clamp(15px,2vw,18px);font-weight:800;color:' + C_JNG + ';margin-bottom:7px;">받침 (글자 아래에 끼워요)</div>'
          + '<div class="hb-jongs" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div></div>'
        : '')
      + '</div>'
      + '<div style="text-align:center;margin-top:16px;">'
      + '<button class="hb-reset" style="font-family:inherit;cursor:pointer;border-radius:14px;border:3px solid #9aa;background:#fff;color:#666;font-weight:800;font-size:clamp(16px,2vw,20px);padding:11px 24px;">↺ 처음으로</button>'
      + '</div>';

    var resultEl = el.querySelector('.hb-result');
    var breakEl = el.querySelector('.hb-break');
    var consWrap = el.querySelector('.hb-cons');
    var vowsWrap = el.querySelector('.hb-vows');
    var jongsWrap = el.querySelector('.hb-jongs');

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
    if (useJong) makeKeys(jongsWrap, [''].concat(jongs), 'jong');

    function paint() {
      var g = compose(cho, jung, jong);
      resultEl.textContent = g;
      // 합쳐지는 느낌: 매 갱신마다 pop 재생
      resultEl.classList.remove('hb-result');
      void resultEl.offsetWidth;
      resultEl.classList.add('hb-result');
      breakEl.innerHTML = '<span style="color:' + C_CON + ';">' + cho + '</span>'
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
        return;
      }
      if (e.target.closest('.hb-reset')) {
        cho = (config.consonant && CHO.indexOf(config.consonant) >= 0) ? config.consonant : cons[0];
        jung = (config.vowel && JUNG.indexOf(config.vowel) >= 0) ? config.vowel : vows[0];
        jong = (useJong && config.batchim && JONG.indexOf(config.batchim) >= 0) ? config.batchim : '';
        paint();
      }
    });

    paint();
    return function cleanup() {};
  });
})();
