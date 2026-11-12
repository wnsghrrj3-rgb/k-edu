/* ============================================================
   케이생기부 엔진 (record_engine.js) — 2026-11-12
   ------------------------------------------------------------
   학교생활기록부 문장을 규칙만으로 짓는다(API 없음 · 학생 정보는 어디로도 나가지 않는다).

   ① 행동특성 및 종합의견 — 세 줄, 한 줄 40자 안팎
        1줄 학습·수업 태도 / 2줄 인품·친구 관계 / 3줄 예체능 특기
      교사는 칩(두 가지까지)을 고르거나 낱말 하나를 적는다. 수준은 ◎ 뛰어남 · ○ 잘함 · △ 노력 중.
      두 가지 = 앞 것의 이음꼴(c) + 뒤 것의 맺음꼴(t).  한 가지 = 이음꼴(c) + 줄 맺음말(close).
      후보를 모두 지어 ① 같은 반에서 이미 쓴 문장 제외 ② 낱말 되풀이 적은 것 ③ 40자에 가까운 것 순으로 고른다.

   ② 교과학습발달상황 · 학기말 종합의견 · 창의적 체험활동
      수행평가 기준을 한 줄에 하나씩 넣으면 「~한다」를 「~함」으로 바꾸고,
      학생마다 N가지를 서로 다른 조합으로 나누어 넣는다(수준: 잘함 · 보통 · 노력요함).
      한 줄에 「잘함 | 보통 | 노력요함」 세 문장을 넣으면 그 문장을 그대로 쓴다.

   브라우저(window.KeduRecord)·node(module.exports) 양쪽에서 돈다.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeduRecord = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- 한글 도구 ---------- */
  var JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  function isHangul(ch) { var c = ch ? ch.charCodeAt(0) : 0; return c >= 0xAC00 && c <= 0xD7A3; }
  function jongOf(ch) { return isHangul(ch) ? JONG[(ch.charCodeAt(0) - 0xAC00) % 28] : ''; }
  function setJong(ch, j) { var c = ch.charCodeAt(0) - 0xAC00; return String.fromCharCode(0xAC00 + c - (c % 28) + JONG.indexOf(j)); }
  /* 받침 판정 — 한글이 아니면 숫자·영문 끝소리를 어림한다 */
  function endJong(word) {
    var w = String(word || '').replace(/[\s)\]"'’”.,·]+$/g, ''); var ch = w.charAt(w.length - 1);
    if (isHangul(ch)) return jongOf(ch);
    if (/[0-9]/.test(ch)) return { '0': 'ㅇ', '1': 'ㄹ', '3': 'ㅁ', '6': 'ㄱ', '7': 'ㄹ', '8': 'ㄹ' }[ch] || '';
    if (/[lmnLMN]/.test(ch)) return 'ㄴ';
    return '';
  }
  var JOSA = { '이': ['이', '가'], '을': ['을', '를'], '은': ['은', '는'], '과': ['과', '와'], '으로': ['으로', '로'] };
  function josa(word, kind) {
    var j = endJong(word), p = JOSA[kind]; if (!p) return kind;
    if (kind === '으로') return (j && j !== 'ㄹ') ? p[0] : p[1];
    return j ? p[0] : p[1];
  }
  /* '{X}{을}' 꼴 채우기 */
  function fill(tpl, x) {
    return tpl.replace(/\{X\}\{(이|을|은|과|으로)\}/g, function (_, k) { return x + josa(x, k); }).replace(/\{X\}/g, x);
  }
  /* 나이스 바이트(한글 3 · 줄바꿈 2 · 그 밖 1) */
  function bytes(s) {
    var n = 0; s = String(s || '');
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); n += c === 10 ? 2 : (c === 13 ? 0 : (c > 127 ? 3 : 1)); }
    return n;
  }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = hash(String(seed)); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ============================================================
     ① 행동특성 및 종합의견 — 글감
     c  = 이음꼴(◎·○ 공용)   cl = 이음꼴(△)
     t  = 맺음꼴 {h:◎, m:○, l:△}
     ============================================================ */
  var LINES = [
    {
      id: 'l1', label: '학습·수업 태도', xLabel: '잘하는 과목·활동', xHint: '예: 수학, 책 읽기',
      traits: [
        { id: 'focus', label: '집중', c: ['수업 시간에 바른 자세로 집중하여 듣고', '선생님 말씀에 귀 기울여 집중하고'], cl: ['수업에 집중하려고 스스로 노력하고'],
          t: { h: ['수업에 몰입하는 집중력이 매우 뛰어남', '바른 자세로 수업에 집중하는 모습이 돋보임'], m: ['수업 시간에 바른 자세로 집중하여 참여함'], l: ['수업에 집중하는 시간이 점점 길어지고 있음'] } },
        { id: 'present', label: '발표', c: ['자기 생각을 자신 있게 발표하고', '큰 목소리로 또박또박 발표하고'], cl: ['용기를 내어 발표에 참여하려 노력하고'],
          t: { h: ['자기 생각을 조리 있게 발표하는 능력이 뛰어남', '자신감 넘치는 발표로 수업에 활기를 더함'], m: ['자기 생각을 또박또박 발표할 수 있음'], l: ['발표에 조금씩 자신감을 키워 가고 있음'] } },
        { id: 'curious', label: '호기심·질문', c: ['궁금한 점을 스스로 찾아 질문하고', '새로운 내용에 호기심이 많아 즐겨 질문하고'], cl: ['모르는 것을 물어보려고 노력하고'],
          t: { h: ['지적 호기심이 많아 탐구하는 자세가 돋보임', '궁금한 것을 끝까지 알아내려는 탐구심이 뛰어남'], m: ['궁금한 점이 생기면 스스로 질문하여 해결함'], l: ['궁금한 점을 질문으로 표현하는 힘을 기르고 있음'] } },
        { id: 'diligent', label: '과제·성실', c: ['주어진 과제를 끝까지 성실하게 해내고', '맡은 학습 활동을 꼼꼼하게 마무리하고'], cl: ['과제를 스스로 끝내려고 꾸준히 노력하고'],
          t: { h: ['어떤 과제든 끝까지 해내는 성실함이 돋보임', '학습 활동을 꼼꼼하게 마무리하는 태도가 훌륭함'], m: ['주어진 과제를 미루지 않고 성실하게 해결함'], l: ['과제를 끝까지 해내는 끈기를 기르고 있음'] } },
        { id: 'understand', label: '이해력', c: ['새로 배운 내용을 빠르고 정확하게 이해하고', '이해력이 좋아 배운 내용을 금방 익히고'], cl: ['배운 내용을 차근차근 익히려 노력하고'],
          t: { h: ['이해력이 뛰어나 배운 내용을 쉽게 익힘', '학습 내용을 정확하게 이해하는 힘이 돋보임'], m: ['배운 내용을 차근차근 이해하며 익혀 나감'], l: ['반복하여 익히며 기초 학습 능력을 다지고 있음'] } },
        { id: 'selfdir', label: '스스로 공부', c: ['해야 할 공부를 스스로 찾아서 하고', '시키지 않아도 스스로 학습 준비를 하고'], cl: ['스스로 공부하는 습관을 들이려 노력하고'],
          t: { h: ['스스로 공부하는 학습 습관이 잘 잡혀 있음', '무엇이든 스스로 해 보려는 의욕이 돋보임'], m: ['학습 준비물을 스스로 챙기고 수업을 준비함'], l: ['스스로 공부하는 습관을 조금씩 기르고 있음'] } },
        { id: 'read', label: '독서', c: ['책 읽기를 좋아하여 틈틈이 독서하고', '다양한 책을 즐겨 읽어 아는 것이 많고'], cl: ['책과 친해지려고 꾸준히 노력하고'],
          t: { h: ['독서량이 풍부하여 어휘력과 표현력이 뛰어남', '책을 즐겨 읽어 배경지식이 매우 풍부함'], m: ['아침 독서 시간에 바른 자세로 책을 읽음'], l: ['책 읽는 즐거움을 조금씩 알아 가고 있음'] } },
        { id: 'team', label: '모둠 활동', c: ['모둠 활동에서 친구들과 의견을 잘 나누고', '짝과 서로 도우며 즐겁게 공부하고'], cl: ['모둠 활동에 함께하려고 노력하고'],
          t: { h: ['모둠 활동을 이끌며 협력하는 모습이 돋보임', '친구들과 협력하여 문제를 해결하는 힘이 뛰어남'], m: ['모둠 활동에 즐겁게 참여하며 맡은 몫을 해냄'], l: ['모둠 활동에 참여하는 즐거움을 알아 가고 있음'] } },
        { id: 'active', label: '적극 참여', c: ['모든 수업 활동에 적극적으로 참여하고', '배우려는 의욕이 넘쳐 무엇이든 열심히 하고'], cl: ['수업 활동에 참여하려고 꾸준히 노력하고'],
          t: { h: ['학습 의욕이 높아 매사에 적극적으로 참여함', '배움에 대한 열정과 적극적인 태도가 돋보임'], m: ['수업 활동에 즐거운 마음으로 빠짐없이 참여함'], l: ['수업에 참여하는 모습이 점점 적극적으로 변함'] } },
        { id: 'neat', label: '글씨·정리', c: ['글씨를 또박또박 바르고 예쁘게 쓰고', '학습 결과물을 깔끔하게 정리하고'], cl: ['글씨를 바르게 쓰려고 꾸준히 연습하고'],
          t: { h: ['글씨가 바르고 학습 결과물이 매우 꼼꼼함', '공책 정리를 깔끔하게 하는 습관이 돋보임'], m: ['글씨를 한 자 한 자 정성 들여 바르게 씀'], l: ['바른 글씨 쓰기를 꾸준히 연습하고 있음'] } },
        { id: 'grit', label: '끈기·도전', c: ['어려운 문제도 포기하지 않고 도전하고', '틀려도 다시 해 보는 끈기가 있고'], cl: ['어려워도 끝까지 해 보려고 노력하고'],
          t: { h: ['어려운 문제에 끝까지 도전하는 끈기가 돋보임', '실수를 두려워하지 않는 도전 정신이 훌륭함'], m: ['모르는 문제도 끝까지 풀어 보려고 애씀'], l: ['어려운 문제에 도전하는 힘을 기르고 있음'] } }
      ],
      x: { c: ['{X}에 흥미가 많아 즐겁게 참여하고', '{X} 시간을 특히 좋아하여 열심히 하고'], cl: ['{X}{을} 차근차근 익히려 노력하고'],
        t: { h: ['{X}에 남다른 흥미와 재능을 보임', '{X}에 대한 이해가 깊고 실력이 돋보임'], m: ['{X} 활동에 흥미를 가지고 즐겁게 참여함'], l: ['{X}에 조금씩 자신감을 키워 가고 있음'] } },
      close: {
        h: [{ s: '학습 내용을 정확하게 이해하여 성취도가 높음' }, { s: '학급 친구들에게 좋은 본보기가 되고 있음' }, { s: '배운 것을 생활에 활용하는 능력이 뛰어남' }],
        m: [{ s: '배운 내용을 차근차근 익혀 나가고 있음' }, { s: '학습 활동에 빠짐없이 성실하게 참여함' }, { s: '꾸준한 노력으로 실력을 쌓아 가고 있음' }],
        l: [{ s: '꾸준한 노력으로 조금씩 발전하고 있음' }, { s: '앞으로의 성장이 더욱 기대되는 어린이임' }, { s: '칭찬과 격려 속에 점점 자신감을 얻고 있음' }]
      }
    },
    {
      id: 'l2', label: '인품·친구 관계', xLabel: '맡은 역할', xHint: '예: 우유 당번, 칠판 도우미',
      traits: [
        { id: 'kind', label: '배려', c: ['친구의 마음을 잘 헤아려 배려하고', '어려움에 처한 친구를 먼저 도와주고'], cl: ['친구의 입장을 생각해 보려고 노력하고'],
          t: { h: ['남을 먼저 생각하는 배려심이 깊어 칭찬을 받음', '친구를 따뜻하게 배려하는 마음씨가 돋보임'], m: ['친구들에게 늘 친절하고 다정하게 대함'], l: ['친구를 배려하는 마음이 조금씩 자라고 있음'] } },
        { id: 'friendly', label: '사이좋게', c: ['누구와도 사이좋게 어울려 지내고', '친구들과 다툼 없이 즐겁게 지내고'], cl: ['친구들과 사이좋게 지내려고 노력하고'],
          t: { h: ['교우 관계가 원만하여 친구들에게 인기가 많음', '누구와도 잘 어울려 주변에 친구가 많음'], m: ['친구들과 사이좋게 어울려 즐겁게 생활함'], l: ['친구와 어울리는 방법을 차츰 익혀 가고 있음'] } },
        { id: 'responsible', label: '책임감', c: ['맡은 일을 끝까지 책임감 있게 해내고', '1인 1역을 잊지 않고 성실히 실천하고'], cl: ['맡은 일을 스스로 해내려고 노력하고'],
          t: { h: ['맡은 일은 끝까지 해내는 책임감이 돋보임', '책임감이 강하여 맡은 역할을 빈틈없이 해냄'], m: ['학급에서 자기가 맡은 역할을 성실하게 해냄'], l: ['맡은 일을 끝까지 하는 책임감을 기르고 있음'] } },
        { id: 'polite', label: '예의·고운 말', c: ['어른을 만나면 공손하게 인사하고', '언제나 고운 말과 바른 말을 사용하고'], cl: ['고운 말을 쓰려고 스스로 노력하고'],
          t: { h: ['인사성이 밝고 예의 바른 태도가 돋보임', '언행이 바르고 예의가 발라 칭찬을 자주 받음'], m: ['웃어른께 공손하고 예의 바르게 행동함'], l: ['고운 말을 쓰는 습관을 조금씩 기르고 있음'] } },
        { id: 'honest', label: '정직', c: ['언제나 거짓 없이 솔직하게 행동하고', '자기 잘못을 솔직하게 인정할 줄 알고'], cl: ['잘못을 솔직하게 말하려고 노력하고'],
          t: { h: ['정직하고 성실하여 친구들의 믿음을 받음', '잘못을 스스로 인정하는 정직한 태도가 돋보임'], m: ['자기 잘못을 솔직하게 인정하고 고치려 함'], l: ['솔직하게 말하는 용기를 조금씩 키우고 있음'] } },
        { id: 'rule', label: '규칙·질서', c: ['학급 규칙과 약속을 스스로 잘 지키고', '차례와 질서를 지키며 안전하게 생활하고'], cl: ['학급 규칙을 지키려고 스스로 노력하고'],
          t: { h: ['약속과 규칙을 스스로 지키는 모습이 모범이 됨', '질서를 잘 지켜 기본 생활 습관이 매우 바름'], m: ['학급 규칙과 약속을 잘 지키며 생활함'], l: ['규칙을 지키는 습관이 점차 자리 잡고 있음'] } },
        { id: 'cheerful', label: '밝음·긍정', c: ['밝고 명랑한 성격으로 늘 웃으며 지내고', '매사에 긍정적이고 표정이 밝으며'], cl: ['밝은 표정으로 생활하려고 노력하고'],
          t: { h: ['밝고 긍정적인 성격으로 학급에 웃음을 줌', '늘 밝은 웃음으로 교실 분위기를 환하게 만듦'], m: ['밝고 명랑한 모습으로 즐겁게 학교생활을 함'], l: ['학교생활에 적응하며 표정이 점점 밝아지고 있음'] } },
        { id: 'leader', label: '이끎', c: ['친구들의 의견을 모아 앞장서서 이끌고', '놀이나 활동에서 친구들을 잘 이끌고'], cl: ['친구들 앞에 나서 보려고 노력하고'],
          t: { h: ['친구들을 이끄는 지도력이 있어 신뢰를 받음', '앞장서서 실천하는 모습이 친구들의 본보기가 됨'], m: ['학급 일에 관심이 많아 앞장서서 참여함'], l: ['친구들 앞에 나서는 자신감을 키워 가고 있음'] } },
        { id: 'share', label: '양보·나눔', c: ['자기 물건을 친구와 기꺼이 나누어 쓰고', '친구에게 차례를 양보할 줄 알고'], cl: ['친구에게 양보하려고 스스로 노력하고'],
          t: { h: ['양보하고 나눌 줄 아는 넉넉한 마음씨가 돋보임', '자기 것을 기꺼이 나누는 따뜻한 마음을 지님'], m: ['친구와 물건을 나누어 쓰고 차례를 양보함'], l: ['양보하고 나누는 기쁨을 조금씩 알아 가고 있음'] } },
        { id: 'calm', label: '차분함', c: ['차분하고 온순한 성품을 지녔고', '언제나 침착하게 자기 할 일을 하고'], cl: ['차분하게 행동하려고 스스로 노력하고'],
          t: { h: ['차분하고 생각이 깊어 행동이 믿음직스러움', '침착하고 신중한 태도로 친구들의 믿음을 얻음'], m: ['차분한 태도로 자기 할 일을 묵묵히 해냄'], l: ['차분하게 생각하고 행동하는 힘을 기르고 있음'] } },
        { id: 'tidy', label: '정리 정돈', c: ['자기 자리와 사물함을 깨끗이 정리하고', '자기 물건을 스스로 잘 챙기고'], cl: ['주변을 정리하려고 스스로 노력하고'],
          t: { h: ['정리 정돈을 잘하여 주변이 항상 깨끗함', '기본 생활 습관이 바르게 잡혀 있어 모범이 됨'], m: ['자기 물건을 스스로 챙기고 주변을 정리함'], l: ['정리 정돈하는 습관을 조금씩 기르고 있음'] } },
        { id: 'help', label: '돕기·봉사', c: ['학급을 위한 일에 스스로 나서서 돕고', '궂은일도 마다하지 않고 앞장서서 하고'], cl: ['친구와 선생님을 도우려고 노력하고'],
          t: { h: ['남을 돕는 일에 앞장서는 봉사 정신이 돋보임', '도움이 필요한 친구에게 먼저 손을 내밀 줄 앎'], m: ['친구와 선생님을 돕는 일에 즐겁게 참여함'], l: ['남을 돕는 일의 보람을 조금씩 알아 가고 있음'] } },
        { id: 'listen', label: '공감·경청', c: ['친구의 이야기를 끝까지 잘 들어 주고', '친구의 기쁨과 슬픔에 함께 공감하고'], cl: ['친구의 말을 끝까지 들으려고 노력하고'],
          t: { h: ['친구의 마음에 공감하는 능력이 뛰어남', '남의 말을 귀담아듣는 경청 태도가 돋보임'], m: ['친구의 이야기를 귀 기울여 들어 줌'], l: ['친구의 말을 끝까지 듣는 태도를 기르고 있음'] } }
      ],
      x: { c: ['{X} 역할을 책임감 있게 해내고', '맡은 {X} 일을 끝까지 성실히 하고'], cl: ['{X} 역할을 잊지 않으려고 노력하고'],
        t: { h: ['{X} 역할을 누구보다 책임감 있게 해냄', '{X} 역할을 빈틈없이 해내어 믿음을 줌'], m: ['{X} 역할을 맡아 성실하게 해냄'], l: ['{X} 역할을 스스로 해내려고 노력함'] } },
      close: {
        h: [{ s: '친구들에게 두터운 믿음과 사랑을 받고 있음' }, { s: '학급 친구들에게 좋은 본보기가 되고 있음' }, { s: '심성이 곱고 행동이 발라 칭찬을 자주 받음' }],
        m: [{ s: '즐겁고 바른 태도로 학교생활을 하고 있음' }, { s: '친구들과 두루 원만하게 어울려 지냄' }, { s: '바른 생활 습관을 꾸준히 실천하고 있음' }],
        l: [{ s: '꾸준히 노력하는 모습이 무척 대견함' }, { s: '하루하루 조금씩 성장하는 모습을 보여 줌' }, { s: '앞으로의 변화와 성장이 더욱 기대됨' }]
      }
    },
    {
      id: 'l3', label: '예체능 특기', xLabel: '특기', xHint: '예: 피아노, 태권도',
      traits: [
        { id: 'draw', tag: 'art', label: '그리기', c: ['그림 그리기를 좋아하여 즐겨 그리고', '색을 조화롭게 사용하여 그림을 그리고'], cl: ['그림으로 표현하려고 꾸준히 노력하고'],
          t: { h: ['생각을 그림으로 표현하는 솜씨가 뛰어남', '색감이 풍부하고 그림 표현력이 돋보임'], m: ['자기 생각을 그림으로 즐겁게 표현함'], l: ['그림으로 표현하는 즐거움을 알아 가고 있음'] } },
        { id: 'craft', tag: 'art', label: '만들기·꾸미기', c: ['손재주가 좋아 만들기를 즐겨 하고', '여러 재료로 꾸미고 만드는 활동을 좋아하고'], cl: ['만들기 작품을 끝까지 완성하려 노력하고'],
          t: { h: ['손끝이 야무져 만들기 작품의 완성도가 높음', '창의적인 생각을 담아 만드는 솜씨가 돋보임'], m: ['여러 가지 재료로 작품을 즐겁게 만듦'], l: ['가위질과 풀칠 등 손 조작 능력이 좋아지고 있음'] } },
        { id: 'origami', tag: 'art', label: '종이접기', c: ['종이접기를 좋아하여 쉬는 시간에도 즐겨 접고', '설명을 보고 종이접기를 스스로 해내고'], cl: ['종이접기를 차근차근 따라 하려 노력하고'],
          t: { h: ['종이접기 솜씨가 좋아 친구들에게 알려 주기도 함', '복잡한 종이접기도 척척 해내는 손재주가 돋보임'], m: ['종이접기 활동에 흥미를 가지고 즐겁게 참여함'], l: ['종이접기를 하며 손끝 힘을 차츰 기르고 있음'] } },
        { id: 'sing', tag: 'art', label: '노래', c: ['노래 부르기를 좋아하여 즐겨 부르고', '고운 목소리로 바르게 노래 부르고'], cl: ['노래를 자신 있게 부르려고 노력하고'],
          t: { h: ['음정과 박자가 정확하여 노래 실력이 뛰어남', '맑고 고운 목소리로 노래하는 모습이 돋보임'], m: ['즐거운 마음으로 노래 부르기에 참여함'], l: ['친구들과 함께 노래하는 즐거움을 알아 가고 있음'] } },
        { id: 'instrument', tag: 'art', label: '악기·리듬', c: ['리듬감이 좋아 악기 연주를 즐기고', '박자에 맞추어 리듬 악기를 연주하고'], cl: ['박자를 맞추어 연주하려고 노력하고'],
          t: { h: ['리듬감이 뛰어나 악기 연주 실력이 돋보임', '박자 감각이 좋아 리듬 악기를 능숙하게 다룸'], m: ['리듬 악기로 박자에 맞추어 즐겁게 연주함'], l: ['악기 연주에 조금씩 자신감을 얻고 있음'] } },
        { id: 'dance', tag: 'art', label: '율동·몸 표현', c: ['음악에 맞추어 신나게 몸을 움직이고', '율동을 빨리 익혀 즐겁게 표현하고'], cl: ['율동을 끝까지 따라 하려고 노력하고'],
          t: { h: ['느낌을 몸으로 표현하는 능력이 뛰어남', '동작이 유연하고 율동 표현이 돋보임'], m: ['음악에 맞추어 율동을 즐겁게 따라 함'], l: ['몸으로 표현하는 활동에 점점 자신감을 보임'] } },
        { id: 'run', tag: 'pe', label: '달리기·운동', c: ['달리기를 잘하고 몸놀림이 날쌔며', '운동을 좋아하여 바깥 활동을 즐기고'], cl: ['신체 활동에 끝까지 참여하려 노력하고'],
          t: { h: ['운동 신경이 뛰어나고 달리기를 특히 잘함', '체력이 좋고 민첩하여 신체 활동에 두각을 보임'], m: ['신체 활동에 즐겁고 활기차게 참여함'], l: ['꾸준한 신체 활동으로 기초 체력을 기르고 있음'] } },
        { id: 'ball', tag: 'pe', label: '공놀이', c: ['공놀이를 좋아하여 친구들과 즐겨 하고', '공을 던지고 받는 동작을 잘하고'], cl: ['공을 다루는 연습을 꾸준히 하고'],
          t: { h: ['공을 다루는 감각이 좋아 공놀이를 잘함', '공놀이에서 순발력과 협동심이 돋보임'], m: ['규칙을 지키며 공놀이에 즐겁게 참여함'], l: ['공을 주고받는 기능이 조금씩 좋아지고 있음'] } },
        { id: 'rope', tag: 'pe', label: '줄넘기', c: ['줄넘기를 꾸준히 연습하여 실력을 쌓고', '쉬는 시간마다 줄넘기를 즐겨 하고'], cl: ['줄넘기를 포기하지 않고 연습하고'],
          t: { h: ['줄넘기 실력이 뛰어나 친구들의 부러움을 삼', '여러 가지 줄넘기 동작을 능숙하게 해냄'], m: ['줄넘기를 박자에 맞추어 꾸준히 연습함'], l: ['줄넘기 횟수가 조금씩 늘어 성취감을 느끼고 있음'] } },
        { id: 'play', tag: 'art', label: '놀이·역할극', c: ['역할놀이에서 맡은 역할을 실감 나게 표현하고', '전래 놀이와 협동 놀이를 즐겨 하고'], cl: ['놀이 활동에 어울려 참여하려고 노력하고'],
          t: { h: ['표정과 몸짓이 풍부하여 표현력이 뛰어남', '놀이 규칙을 잘 알고 친구들을 즐겁게 이끎'], m: ['친구들과 어울려 놀이 활동에 즐겁게 참여함'], l: ['놀이에 참여하며 표현하는 재미를 알아 가고 있음'] } }
      ],
      x: { c: ['{X}{을} 좋아하여 꾸준히 연습하고', '{X}에 소질이 있어 즐겨 하고'], cl: ['{X}{을} 포기하지 않고 연습하고'],
        t: { h: ['{X}에 뛰어난 소질을 보임', '{X} 실력이 또래보다 뛰어나 돋보임'], m: ['{X}{을} 즐겨 하며 꾸준히 실력을 키움'], l: ['{X}{을} 꾸준히 연습하며 실력을 키워 감'] } },
      close: {
        h: [{ s: '예술적 감각과 표현력이 또래보다 뛰어남', tag: 'art' }, { s: '자기만의 개성을 살려 표현하는 힘이 돋보임', tag: 'art' }, { s: '건강한 몸과 마음으로 늘 활기차게 생활함', tag: 'pe' }, { s: '신체 활동 시간마다 자신감이 넘침', tag: 'pe' }, { s: '소질을 꾸준히 키워 나갈 것이 기대됨' }, { s: '꾸준한 연습으로 실력이 나날이 늘고 있음' }, { s: '배운 것을 친구들 앞에서 자신 있게 선보임' }],
        m: [{ s: '즐겁게 참여하며 실력을 쌓아 가고 있음' }, { s: '예체능 활동을 즐기며 꾸준히 참여함' }],
        l: [{ s: '꾸준한 연습으로 조금씩 실력이 늘고 있음' }, { s: '즐겁게 참여하며 자신감을 키워 가고 있음' }]
      }
    }
  ];
  var LINE_BY_ID = {}; LINES.forEach(function (L) { LINE_BY_ID[L.id] = L; L.byId = {}; L.traits.forEach(function (t) { L.byId[t.id] = t; }); });

  var TARGET = 40, MAX_PICK = 2;

  /* 낱말 되풀이 세기 — 앞 두 글자가 같은 낱말 수(조사 차이는 무시) */
  function keysOf(s) { var out = {}; s.split(/\s+/).forEach(function (w) { w = w.replace(/[^가-힣A-Za-z0-9]/g, ''); if (w.length >= 2) out[w.slice(0, 2)] = 1; }); return out; }
  function repeats(a, b) { var ka = keysOf(a), kb = keysOf(b), n = 0; for (var k in ka) if (kb[k]) n++; return n; }

  /* 한 줄에 쓸 글감 꾸러미로 — sel:{traitId:'h'|'m'|'l'}, x:'낱말', xl:수준 */
  function providers(L, input) {
    var out = [], sel = (input && input.sel) || {};
    L.traits.forEach(function (t) { if (sel[t.id]) out.push({ c: t.c, cl: t.cl, t: t.t, lv: sel[t.id], tag: t.tag || null }); });
    var x = input && String(input.x || '').trim();
    if (x) {
      var f = function (arr) { return arr.map(function (s) { return fill(s, x); }); };
      out.push({ c: f(L.x.c), cl: f(L.x.cl), t: { h: f(L.x.t.h), m: f(L.x.t.m), l: f(L.x.t.l) }, lv: (input.xl || 'h'), tag: null, isX: true });
    }
    return out.slice(0, MAX_PICK);
  }

  /* 한 줄의 후보 문장 전부(마침표 포함) — 좋은 순서로 */
  function candidates(lineId, input, opts) {
    var L = LINE_BY_ID[lineId]; if (!L) return [];
    var ps = providers(L, input), list = [];
    function conn(p) { return p.lv === 'l' ? p.cl : p.c; }
    if (ps.length === 1) {
      var p = ps[0];
      conn(p).forEach(function (c) {
        L.close[p.lv].forEach(function (cl) {
          if (cl.tag && p.tag && cl.tag !== p.tag) return;
          if (cl.tag && !p.tag) return;
          list.push({ a: c, b: cl.s });
        });
      });
    } else if (ps.length >= 2) {
      [[ps[0], ps[1]], [ps[1], ps[0]]].forEach(function (pair) {
        conn(pair[0]).forEach(function (c) { pair[1].t[pair[1].lv].forEach(function (t) { list.push({ a: c, b: t }); }); });
      });
    }
    var used = (opts && opts.used) || {}, rand = rng((opts && opts.seed) || 'x');
    var scored = list.map(function (x) {
      var text = x.a + ' ' + x.b + '.', d = Math.abs(text.length - TARGET);
      return { text: text, dup: used[text] ? 1 : 0, rep: repeats(x.a, x.b), band: d <= 4 ? 0 : (d <= 7 ? 1 : d), r: rand() };
    });
    scored.sort(function (p, q) { return (p.dup - q.dup) || (p.rep - q.rep) || (p.band - q.band) || (p.r - q.r); });
    return scored.map(function (s) { return s.text; });
  }
  /* roll 번째 후보(다시 짓기를 누를 때마다 다음 것) */
  function compose(lineId, input, opts) {
    var c = candidates(lineId, input, opts); if (!c.length) return '';
    return c[((opts && opts.roll) || 0) % c.length];
  }

  /* ============================================================
     ② 수행평가 기준 → 생기부 문장
     ============================================================ */
  var B_IRREG = { '돕': '도움', '눕': '누움', '줍': '주움', '굽': '구움', '곱': '고움', '쉽': '쉬움', '춥': '추움', '덥': '더움', '맵': '매움' };
  var D_IRREG = { '듣': '들음', '걷': '걸음', '묻': '물음', '깨닫': '깨달음', '싣': '실음' };
  var S_IRREG = { '짓': '지음', '잇': '이음', '긋': '그음', '젓': '저음', '낫': '나음', '붓': '부음' };
  /* 「만든다」처럼 ㄹ이 빠진 줄기 되살리기 */
  var L_STEM = ['만드', '노', '푸', '여', '이끄', '떠드', '흔드', '부', '거', '드', '아', '느', '도', '기우', '머무', '베푸'];
  function restoreL(stem) {
    var words = stem.split(' '), last = words[words.length - 1];
    for (var i = 0; i < L_STEM.length; i++) {
      var s = L_STEM[i];
      if (last === s || (s.length >= 2 && last.slice(-s.length) === s)) { words[words.length - 1] = last.slice(0, -1) + setJong(last.charAt(last.length - 1), 'ㄹ'); return words.join(' '); }
    }
    return stem;
  }
  /* 줄기 → 명사형(~ㅁ/음) */
  function nounForm(stem) {
    var ch = stem.charAt(stem.length - 1), head = stem.slice(0, -1), lastWord = stem.split(' ').pop();
    if (/깨닫$/.test(lastWord)) return stem.slice(0, -2) + '깨달음';
    if (/[듣걷싣]$/.test(lastWord) || lastWord === '묻') return head + D_IRREG[ch];
    if (/[짓잇긋젓]$/.test(lastWord) || lastWord === '낫' || lastWord === '붓') return head + S_IRREG[ch];
    if (/[돕눕줍]$/.test(lastWord) || (lastWord === ch && B_IRREG[ch])) return head + B_IRREG[ch];
    if (/(답|롭|럽|겁|갑|볍|깝)$/.test(stem)) return head + setJong(ch, '') + '움';   // 아름답→아름다움, 즐겁→즐거움
    if (!isHangul(ch)) return stem;
    var j = jongOf(ch);
    if (j === '') return head + setJong(ch, 'ㅁ');
    if (j === 'ㄹ') return head + setJong(ch, 'ㄻ');
    return stem + '음';
  }
  /* 기준 문장 한 개 → {ok, text(명사형), noun(서술어 없이 끝남)} */
  function nominalize(src) {
    var s = String(src || '').replace(/\s+/g, ' ').trim().replace(/[.。!?]+$/, '').trim();
    if (!s) return { ok: false, text: '' };
    var last = s.charAt(s.length - 1);
    if (/(습니다)$/.test(s)) return { ok: true, text: nounForm(s.slice(0, -3)) };
    if (/니다$/.test(s) && jongOf(s.charAt(s.length - 3)) === 'ㅂ') { var b = s.slice(0, -2); return { ok: true, text: nounForm(b.slice(0, -1) + setJong(b.charAt(b.length - 1), '')) }; }
    if (/(어요|아요|해요|예요|에요)$/.test(s)) return { ok: true, text: s, raw: true };
    if (last === '다' && s.length >= 2) {
      var body = s.slice(0, -1), p = body.charAt(body.length - 1), stem;
      if (p === '는' && body.length >= 2 && isHangul(body.charAt(body.length - 2)) && body.charAt(body.length - 2) !== ' ') stem = body.slice(0, -1);         // 읽는다 → 읽
      else if (jongOf(p) === 'ㄴ' && !/[않많]/.test(p)) stem = restoreL(body.slice(0, -1) + setJong(p, ''));   // 쓴다 → 쓰, 만든다 → 만들
      else stem = body;                                                                                  // 있다 · 이다 · 쉽다
      return { ok: true, text: nounForm(stem) };
    }
    var j = jongOf(last);
    if (j === 'ㅁ' || j === 'ㄻ') return { ok: true, text: s };          // 이미 ~함 · ~음 꼴
    return { ok: true, text: s, noun: true };                             // 「글자 바르게 쓰기」 같은 이름꼴
  }
  function stripLead(s) {
    return String(s || '').replace(/^\s*(?:[-•·*▶▷■□○●◦]|\(?\d{1,2}[.)]|[①-⑳]|[가-하][.)])\s*/, '').replace(/^\s*(잘함|매우\s?잘함|보통|노력\s?요함|상|중|하)\s*[:：]\s*/, '').trim();
  }
  function levelText(base, lv) {
    var n = nominalize(base); if (!n.ok) return '';
    if (n.noun) {
      if (lv === 'h') return n.text + josa(n.text, '을') + ' 잘함';
      if (lv === 'm') return n.text + josa(n.text, '을') + ' 대체로 잘함';
      return '도움을 받아 ' + n.text + josa(n.text, '을') + ' 함';
    }
    if (lv === 'h') return n.text;
    if (lv === 'm') return '대체로 ' + n.text;
    return '도움을 받아 ' + n.text;
  }
  /* 기준 붙여넣기 → [{src, h, m, l}]  (한 줄에 하나 · 「잘함 | 보통 | 노력요함」도 받음) */
  function parseCriteria(text) {
    var out = [];
    String(text || '').split(/\r?\n/).forEach(function (line) {
      if (!line.trim()) return;
      var parts = line.split(/\s*[|\t]\s*/).map(stripLead).filter(function (x) { return x; });
      if (!parts.length) return;
      var plain = function (s) { return nominalize(s).text; };
      if (parts.length >= 3) out.push({ src: parts[0], h: plain(parts[0]), m: plain(parts[1]), l: plain(parts[2]), given: 3 });
      else if (parts.length === 2) out.push({ src: parts[0], h: plain(parts[0]), m: plain(parts[1]), l: levelText(parts[0], 'l'), given: 2 });
      else out.push({ src: parts[0], h: levelText(parts[0], 'h'), m: levelText(parts[0], 'm'), l: levelText(parts[0], 'l'), given: 1 });
    });
    return out;
  }
  /* k개 가운데 n개 조합 전부(많으면 창문 돌리기) */
  function combos(k, n) {
    n = Math.max(1, Math.min(n, k)); var out = [];
    if (n === k) return [Array.from({ length: k }, function (_, i) { return i; })];
    var total = 1, i; for (i = 0; i < n; i++) total = total * (k - i) / (i + 1);
    if (total > 400) { for (i = 0; i < k; i++) { var w = []; for (var j = 0; j < n; j++) w.push((i + j) % k); out.push(w.sort(function (a, b) { return a - b; })); } return out; }
    (function rec(start, cur) { if (cur.length === n) { out.push(cur.slice()); return; } for (var x = start; x < k; x++) { cur.push(x); rec(x + 1, cur); cur.pop(); } })(0, []);
    return out;
  }
  /* 학생 order(0부터)에게 줄 기준 번호 — 학생마다 다른 조합, 기준마다 고르게 */
  function assign(k, n, order, shift, seed) {
    if (!k) return [];
    var cs = combos(k, n), r = rng('assign:' + (seed || '') + ':' + k + ':' + n);
    /* 고른 분배: 지금까지 덜 쓰인 기준이 든 조합부터 차례로 줄 세운다 */
    var count = new Array(k).fill(0), pool = cs.map(function (c) { return { c: c, r: r() }; }), seq = [];
    while (pool.length) {
      pool.sort(function (a, b) { var sa = a.c.reduce(function (s, i) { return s + count[i]; }, 0), sb = b.c.reduce(function (s, i) { return s + count[i]; }, 0); return (sa - sb) || (a.r - b.r); });
      var pick = pool.shift(); seq.push(pick.c); pick.c.forEach(function (i) { count[i]++; });
    }
    return seq[(((order + (shift || 0)) % seq.length) + seq.length) % seq.length];
  }
  /* 고른 기준 + 수준 → 한 학생의 문장 */
  function subjectText(criteria, picks, levels) {
    return picks.map(function (i) { var c = criteria[i]; if (!c) return ''; var lv = (levels && levels[i]) || 'h'; return c[lv] ? c[lv] + '.' : ''; }).filter(Boolean).join(' ');
  }

  /* 기재요령 확인이 필요한 낱말(참고용) */
  var WATCH = [
    [/학원|과외|방과\s?후\s?학교\s?외|사교육/, '사교육 관련 표현'],
    [/교외|전국\s?대회|도\s?대회|시\s?대회|경시/, '교외 대회·수상'],
    [/자격증|급수|인증\s?시험|토익|토플/, '자격증·인증시험'],
    [/아버지|어머니|부모|엄마|아빠|직업|가정\s?형편/, '부모·가정 정보'],
    [/진단|ADHD|장애|치료|약을|병원/, '질병·진단 관련'],
    [/영재\s?교육원|영재원|영재\s?학급/, '영재교육 관련']
  ];
  function watch(text) { var out = []; WATCH.forEach(function (w) { if (w[0].test(text || '')) out.push(w[1]); }); return out; }

  return {
    LINES: LINES, TARGET: TARGET, MAX_PICK: MAX_PICK,
    josa: josa, fill: fill, bytes: bytes,
    candidates: candidates, compose: compose,
    nominalize: nominalize, levelText: levelText, parseCriteria: parseCriteria,
    combos: combos, assign: assign, subjectText: subjectText, watch: watch
  };
});
