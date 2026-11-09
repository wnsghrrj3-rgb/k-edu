/* gens/social/g5_2_board_quiz.js — 말판 놀이 (5학년 2학기 사회 3단원 「식민 통치와 저항, 전쟁이 바꾼 사회와 생활」 · 교과서판 2학기)
 * 순수 함수·DOM 무관 (§9-3). 장르 duel_quiz(stream)가 쓴다 — 말판 칸의 문제 하나 + 보기 셋.
 * 놀이 = 『사회』 156~159쪽 단원 마무리 「교실 놀이를 함께해요 — 말판 놀이」(지도서 343쪽)
 *   주사위를 던져 홀수면 한 칸, 짝수면 두 칸 · 도착한 칸의 문제를 맞히면 그대로, 못 맞히면 한 칸 뒤로 · 태극기 도착점에 먼저 닿으면 이긴다.
 *   말판 두 길(가 · 나)에 칸 문제 아홉씩 — 지도서 343쪽 예시 답안 그대로. 이름을 둘 말하는 칸(가 ② · 나 ②)과 답이 열린 칸(가 ①)은 보기 셋으로 가를 수 없어 뺐다.
 * params: { upto: 'l05'|'l09'|'all' }  l05 = 5차시까지(국권 침탈·저항 · 3·1 운동 · 민족 운동) · l09 = 9차시까지(+ 광복) · all = 단원 전체(+ 6·25 전쟁)
 * next() → { prompt, path, cell, q, answer, options:[셋 · 섞임], kind, type, explain, l }
 * type = 칸 문제의 주제 — resist 국권 침탈과 저항 · move 3·1 운동과 민족 운동 · free 광복과 정부 수립 · war 6·25 전쟁
 * 보기 = 답 + 같은 갈래 낱말 둘(사람 ↔ 사람 · 운동 ↔ 운동 · 곳 ↔ 곳) — 모두 이 단원 교과서·지도서 낱말.
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g5_2_board_quiz'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l05', 'l09', 'l12'];
  var KIND_L = { resist: 'l05', move: 'l05', free: 'l09', war: 'l12' };
  var KIND_NAME = { resist: '국권 침탈과 저항', move: '3·1 운동과 민족 운동', free: '광복과 정부 수립', war: '6·25 전쟁' };

  /* [말판 길, 칸, 갈래, 문제, 답, 보기 덫 둘, 풀이(지도서 글)] */
  var T = [
    ['가', 3, 'resist', '만주 하얼빈역에서 이토 히로부미를 처단한 독립운동가는 누구인가요?', '안중근', ['윤봉길', '김구'], '안중근은 만주의 하얼빈역에서 이토 히로부미를 처단했어요.'],
    ['나', 1, 'resist', '고종이 헤이그 특사를 파견한 까닭은 무엇인가요?', '을사늑약이 무효임을 알리려고', ['헌법을 만들려고', '임시 정부를 세우려고'], '고종은 헤이그 평화 회의에 특사를 파견해 을사늑약이 무효임을 알리려 했어요.'],
    ['나', 3, 'resist', '일제가 우리 민족을 지배하려고 설치한 기관은 무엇인가요?', '조선 총독부', ['대한민국 임시 정부', '제헌 국회'], '일제는 조선 총독부를 두고 우리 민족을 지배했어요.'],
    ['가', 4, 'move', '1919년 서울을 비롯해 전국에서 일어난 만세 시위는 무엇인가요?', '3·1 운동', ['6·10 만세 운동', '광주 학생 항일 운동'], '1919년 전국에서 일어난 만세 시위는 3·1 운동이에요.'],
    ['가', 5, 'move', '3·1 운동 이후 우리 민족이 세운 통합된 임시 정부의 이름은 무엇인가요?', '대한민국 임시 정부', ['조선 총독부', '제헌 국회'], '3·1 운동 뒤 우리 민족은 통합된 대한민국 임시 정부를 세웠어요.'],
    ['가', 6, 'move', '홍범도, 김좌진 등이 이끄는 독립군 연합 부대가 일본군과 전투를 벌인 곳은 어디인가요?', '청산리', ['하얼빈', '부산'], '김좌진과 홍범도 등이 이끄는 독립군 연합 부대가 청산리에서 일본군과 싸웠어요.'],
    ['나', 4, 'move', '순종의 장례식 때 일어난 대규모 만세 시위는 무엇인가요?', '6·10 만세 운동', ['3·1 운동', '광주 학생 항일 운동'], '대한 제국의 마지막 황제인 순종의 장례식 때 6·10 만세 운동이 일어났어요.'],
    ['나', 5, 'move', '물산 장려 운동에서 내세운 구호는 무엇인가요?', '우리가 만든 것 우리가 쓰자', ['대한 독립 만세', '우리말로 수업을 하자'], '물산 장려 운동은 우리 손으로 만든 물건을 쓰자는 운동이었어요.'],
    ['나', 6, 'free', '식민 통치에서 벗어나 광복을 맞은 날은 언제인가요?', '1945년 8월 15일', ['1919년 3월 1일', '1950년 6월 25일'], '1945년 8월 15일에 우리 민족은 광복을 맞이했어요.'],
    ['나', 7, 'free', '광복 이후 학교생활에서 나타난 변화는 무엇인가요?', '우리말로 수업을 함', ['일본어로 수업을 함', '서당에서 천자문을 배움'], '광복 뒤 교사들은 우리말로 수업을 했고, 학생들은 우리글과 우리 역사를 배웠어요.'],
    ['가', 7, 'free', '우리나라 헌법을 만든 제1대 국회의 이름은 무엇인가요?', '제헌 국회', ['대한민국 임시 정부', '조선 총독부'], '제헌 국회는 7월 17일에 헌법을 공포했어요.'],
    ['나', 8, 'war', '1950년 북한군이 남한을 쳐들어오면서 시작된 전쟁은 무엇인가요?', '6·25 전쟁', ['3·1 운동', '청산리 전투'], '1950년 북한군이 남한을 쳐들어오면서 6·25 전쟁이 시작되었어요.'],
    ['가', 8, 'war', '6·25 전쟁 중 임시 수도로, 많은 피란민이 모여 살던 곳은 어디인가요?', '부산', ['청산리', '하얼빈'], '6·25 전쟁 중 피란민이 낙동강 이남으로 모여들었고, 부산을 임시 수도로 정했어요.'],
    ['가', 9, 'war', '전쟁 중 가족과 헤어져 만나지 못하는 사람을 가리키는 말은 무엇인가요?', '이산가족', ['전쟁고아', '피란민'], '피란을 떠났다가 가족과 헤어져 만나지 못하는 사람들을 이산가족이라고 해요.'],
    ['나', 9, 'war', '전쟁 중 부모를 잃은 아이를 가리키는 말은 무엇인가요?', '전쟁고아', ['이산가족', '피란민'], '6·25 전쟁으로 부모를 잃은 전쟁고아가 많이 생겼어요.']
  ];
  var KINDS = ['resist', 'move', 'free', 'war'];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function lim(upto) { var i = ORDER.indexOf(upto); return upto === 'all' || i < 0 ? ORDER.length - 1 : i; }
  function norm(upto) { return (upto === 'l05' || upto === 'l09') ? upto : 'all'; }

  return {
    id: 'g5_2_board_quiz',
    title: '말판 놀이',
    T: T, ORDER: ORDER, KIND_L: KIND_L, KIND_NAME: KIND_NAME, KINDS: KINDS,
    create: function (params, rng) {
      params = params || {};
      var upto = norm(params.upto), L = lim(upto);
      var idx = []; T.forEach(function (t, k) { if (ORDER.indexOf(KIND_L[t[2]]) <= L) idx.push(k); });
      var deck = shuffle(rng, idx), last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) { deck = shuffle(rng, idx); if (deck.length > 1 && deck[0] === last) deck.push(deck.shift()); }
          var k = deck.shift(), r = T[k]; last = k;
          var opts = shuffle(rng, [r[4]].concat(r[5]));
          return { id: 'bq' + k + '_' + (n++), l: KIND_L[r[2]], path: r[0], cell: r[1], kind: r[2], type: r[2], q: r[3], answer: r[4], options: opts,
                   prompt: '말판 ' + r[0] + ' 길 ' + r[1] + '번 칸 — ' + r[3] + ' (보기: ' + opts.join(' · ') + ')',
                   explain: '정답은 「' + r[4] + '」 — ' + r[6] };
        },
        check: function (pick, q) { return String(pick) === q.answer; }
      };
    },
    printRender: function (q) { return '말판 ' + q.path + ' 길 ' + q.cell + '번 칸: ' + q.q + '<br>보기: ' + q.options.join(' · '); },
    printAnswer: function (q) { return q.answer + ' (' + KIND_NAME[q.kind] + ')'; },
    printHead: '말판 칸의 문제를 읽고 알맞은 답에 ○ 하세요. 맞히면 그대로, 못 맞히면 한 칸 뒤로!'
  };
}));
