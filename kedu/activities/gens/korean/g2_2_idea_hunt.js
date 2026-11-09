/* gens/korean/g2_2_idea_hunt.js — 글쓴이의 생각 찾기 (2학년 2학기 국어 7단원 「내 생각은 이래요」 l03·l05·l07·l14) · 교과서판 2학기
 * 순수 함수·DOM 무관 (§9-3). 장르 text_hunt(글 속 찾기 · 문장 토큰)가 쓴다 — 토큰 하나 = 문장 하나. para_hunt(3-1 문단 속 문장 찾기)와 같은 계약.
 * 맨 위 한 줄은 글 이름(fixed — 누를 수 없는 글 조각, text_hunt v1.1.0)이다 — 교과서 「제목을 보고 짐작해요」를 판마다 보이게.
 * params: { upto: 'l03'|'l05'|'l07'|'all' }  단원 처음부터 그 차시까지 누적 · 이번 차시 판이 덱 앞머리
 * next() → { prompt, icon, src, sents:[문장…], tokens:[{t, fixed:true} | {t, hit}], hits:[번호…], answer:[문장…], ask?, type, explain, l }
 *
 * 근거(지도서 『국어 2-2 지도서』 7단원 · 인쇄 쪽 = 『국어』 쪽):
 *   3~4차시 지도서 284~289쪽 · 『국어』 202~206쪽 「반려견을 사랑한다면」 — 「글 ㉯에서 중심 생각을 찾아 ○표를 해 봅시다」(시범) · 「글 ㉰」(질문하기) ·
 *            「글 ㉱, ㉲를 다시 읽고 중심 생각을 찾아봅시다」(활동하기). ㉲ 의 중심 생각은 끝 문장(「다른 사람과 내 반려견을 위해 에티켓을 꼭 지키도록 하자.」)
 *   5~6차시 지도서 290~292쪽 · 『국어』 207~208쪽 「아침에 운동장을 달려요」 — 글 ㉯·㉰ 의 중심 생각 · 글 ㉮ 에 글쓴이가 전하고 싶은 생각
 *   7~9차시 지도서 294~298쪽 · 『국어』 216쪽 4번 「규빈이가 쓴 글」 — 보기 = 생각 / 생각에 대한 까닭 / 경험이나 알고 있는 것 / 느낌 · 지도서 296쪽 <예시 글 1> 「책을 많이 읽읍시다」
 *   14~15차시 지도서 306~307쪽 · 『국어』 224쪽 1번 다육 식물 글 · 225쪽 2번 「자신의 생각을 표현하는 문장을 찾아 ○표」(지금 다섯 시야 · 이 아이스크림은 오백 원이야 = 아님)
 * 정본(케이티처 g2s2_korean_u7): l03 s05·s11 반려견 중심 생각 · s15 「글자 수가 가장 많은 문장」 오개념 · l05 s09 ㉯·㉰ 중심 생각 ·
 *        l07 s06·s11 규빈이 글과 네 역할 · s08 「그래서 ~ 때문입니다」 오개념 · l11 s11 손 팻말 · l14 s04·s12 다육 식물 글 · s10 생각 문장 고르기 · s15 「첫 문장만 보면」 오개념
 *
 * type(문항 단위 · 진단 축 — 무엇을 보고 고르는가):
 *   idea_front  중심 생각이 맨 앞 — 작은 글에서 찾기 (l03·l05)
 *   idea_back   중심 생각이 끝·가운데 — 「첫 문장만 보면」(l14 s15)·「가장 긴 문장」(l03 s15) 오개념 축 · 여는 글의 인사·자기소개 덫 (l03·l05)
 *   idea_part   생각 글의 네 부분 — 물은 역할(생각·까닭·경험·느낌)의 문장 하나 (l07·l14) · 묻는 역할은 판마다 rng
 *   idea_say    생각을 나타낸 문장 모두 — 「~하자」·「~는 어때?」 vs 지금 있는 일·설명 (l14 · 『국어』 225쪽)
 * 글 = 교과서 글 줄임(작은 글마다 몇 줄) + 같은 꼴 자체 구성(곰이·펭이 교실 · 정본 l07 s12 「교실에서 화분을 키웁시다」 · l11 s14 「우리 집 손 팻말」).
 * 중심 생각 판(front·back)의 문장 차례는 글 그대로(「그러면」·「그리고」가 앞 문장을 받으므로 섞지 않는다).
 */
(function (root, factory) {
  var g = factory();
  if (typeof module === 'object' && module.exports) module.exports = g;
  root.GENS = root.GENS || {};
  root.GENS['g2_2_idea_hunt'] = g;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ORDER = ['l03', 'l05', 'l07', 'l14'];
  var ROLES = ['idea', 'reason', 'exp', 'feel'];
  var ROLE_NAME = { idea: '생각', reason: '생각에 대한 까닭', exp: '경험이나 알고 있는 것', feel: '느낌' };
  var ROLE_WHY = {
    idea: '「~합시다」·「~하자」처럼 무엇을 하자는 글쓴이의 생각을 밝힌 문장이에요.',
    reason: '왜 그렇게 생각하는지 까닭을 말하는 문장이에요. 까닭은 「왜냐하면 ~ 때문입니다」처럼 써요.',
    exp: '직접 겪은 일이나 책·선생님께 보고 들어 알고 있는 것을 말하는 문장이에요.',
    feel: '「뿌듯할 것 같습니다」처럼 글쓴이의 마음(느낌)을 말하는 문장이에요.'
  };
  var PROMPT = {
    idea_front: '중심 생각을 찾아 눌러요',
    idea_back: '중심 생각을 찾아 눌러요',
    idea_say: '생각을 나타낸 문장을 모두 찾아 눌러요'
  };

  /* 판 — l 차시 · type · icon · src 글 이름 · s 문장(글의 차례) · hit 중심 생각 자리(front·back) · roles 문장마다 역할(part) · hits 생각 문장 자리(say) · why 풀이 끝말 */
  var T = [
    // ── idea_front · 중심 생각이 맨 앞 (지도서 287~288쪽 시범·질문하기·활동하기 — 「첫째」 없이 ○표 판 그대로)
    { l: 'l03', type: 'idea_front', icon: '🧻', src: '「반려견을 사랑한다면」 글 ㉯',
      s: ['반려견의 배설물은 주인이 치워야 한다.', '반려견이 산책 중 변을 봤을 때 모르는 척 그냥 가 버리는 사람이 있다.',
          '그러면 그 자리에서 냄새가 나고 다른 사람이 배설물을 밟을 수도 있다.', '반려견과 함께 산책할 때에는 비닐봉지와 집게 같은 도구를 챙겨야 한다.'], hit: 0,
      why: '다른 문장들은 주인이 치워야 하는 까닭과 치우는 방법을 설명해요.' },
    { l: 'l03', type: 'idea_front', icon: '🦮', src: '「반려견을 사랑한다면」 글 ㉰',
      s: ['반려견을 야외로 데리고 나갈 때에는 목줄을 채워야 한다.', '개에게 물렸던 경험을 가진 사람이나 개를 무서워하는 어린이들은 개가 가까이 오는 것에 공포를 느낄 수 있다.',
          '반려견을 목줄 없이 풀어놓는 것은 이들에게 위협적인 행동이 될 수 있다.'], hit: 0,
      why: '뒤의 두 문장은 왜 목줄을 채워야 하는지 뒷받침해요.' },
    { l: 'l03', type: 'idea_front', icon: '🚫', src: '「반려견을 사랑한다면」 글 ㉱',
      s: ['반려견의 출입이 금지된 곳에는 반려견을 데리고 가지 않아야 한다.', '반려견의 짖는 소리나 움직임이 다른 사람에게 방해가 될 수 있는 장소들이 있다.',
          '예를 들어 도서관 같은 곳에서 반려견이 짖게 되면 다른 사람에게 큰 피해를 줄 수 있다.'], hit: 0,
      why: '도서관 이야기는 이 생각을 설명하는 예예요.' },
    { l: 'l03', type: 'idea_front', icon: '🚶', src: '「복도에서는 천천히」 작은 글',
      s: ['복도에서는 천천히 걸어야 한다.', '복도에서 뛰다가 친구와 부딪쳐 넘어지는 일이 있다.', '모퉁이에서는 앞에서 오는 친구가 잘 보이지 않는다.'], hit: 0,
      why: '부딪치는 일과 모퉁이 이야기는 천천히 걸어야 하는 까닭이에요.' },
    { l: 'l03', type: 'idea_front', icon: '🔇', src: '「소음을 줄입시다」 작은 글',
      s: ['교실에서는 작은 목소리로 말해야 한다.', '여러 사람이 한꺼번에 크게 말하면 선생님 말씀이 잘 들리지 않는다.', '옆 반에서 공부하는 친구들에게도 방해가 될 수 있다.'], hit: 0,
      why: '뒤의 두 문장은 작은 목소리로 말해야 하는 까닭이에요.' },
    { l: 'l05', type: 'idea_front', icon: '😊', src: '「아침에 운동장을 달려요」 글 ㉯',
      s: ['아침에 운동장을 달리면 기분이 좋아져요.', '이른 아침 운동장에는 시원한 공기가 가득해요.', '시원한 아침 공기는 스트레스를 사라지게 해 줘요.',
          '운동장을 달릴 때마다 기분이 상쾌해지는 것을 느껴요.'], hit: 0,
      why: '시원한 공기·상쾌한 기분은 기분이 좋아지는 까닭이에요.' },
    { l: 'l05', type: 'idea_front', icon: '💪', src: '「아침에 운동장을 달려요」 글 ㉰',
      s: ['아침에 운동장을 달리면 더 건강해져요.', '아침에 운동장을 달리면 점점 체력이 좋아져요.', '그리고 몸무게를 조절하는 데에도 도움이 된답니다.',
          '꾸준히 아침에 운동장을 달리면 점점 더 오래, 더 빠르게 달릴 수 있어요.'], hit: 0,
      why: '체력·몸무게·더 오래 달리기는 모두 「더 건강해져요」를 뒷받침해요.' },

    // ── idea_back · 중심 생각이 끝·가운데 (지도서 288쪽 글 ㉲ · 290쪽 글 ㉮ — 첫 문장이 아닐 때)
    { l: 'l03', type: 'idea_back', icon: '💗', src: '「반려견을 사랑한다면」 글 ㉲',
      s: ['반려견을 진심으로 사랑한다면 자신의 반려견이 다른 사람으로부터 미움을 받거나 공포의 대상이 되지 않도록 해야 하지 않을까?',
          '그것이 반려견의 가족으로서 지켜야 할 ‘책임’이라고 생각한다.', '내 눈에는 예쁘고 착하기만 한 반려견일지라도 다른 사람에게 피해를 줄 수 있다.',
          '다른 사람과 내 반려견을 위해 에티켓을 꼭 지키도록 하자.'], hit: 3,
      why: '가장 긴 첫 문장이 아니라, 「~하자」로 끝나는 끝 문장이 중심 생각이에요.' },
    { l: 'l03', type: 'idea_back', icon: '🍚', src: '「급식실에서」 작은 글',
      s: ['급식실에서는 줄을 서서 차례를 기다리는 친구들이 많다.', '먼저 먹으려고 앞으로 끼어들면 기다리던 친구들이 속상하다.', '급식실에서는 차례를 지켜 줄을 서자.'], hit: 2,
      why: '앞의 두 문장은 급식실에서 생기는 일을 말해요.' },
    { l: 'l03', type: 'idea_back', icon: '🌳', src: '「운동장 나무를 아껴요」 작은 글',
      s: ['운동장 나무에 올라가 가지를 꺾는 친구가 있다.', '가지가 꺾이면 나무가 아프고 시원한 그늘도 줄어든다.', '운동장 나무를 아끼고 소중히 돌보자.'], hit: 2,
      why: '앞의 두 문장은 나무를 아껴야 하는 까닭이에요.' },
    { l: 'l03', type: 'idea_back', icon: '🚰', src: '「물을 아껴 써요」 작은 글',
      s: ['손을 씻을 때 물을 틀어 놓고 장난치는 친구가 있다.', '우리는 물을 아껴 써야 한다.', '물은 우리 모두가 함께 쓰는 소중한 것이기 때문이다.'], hit: 1,
      why: '첫 문장은 겪은 일, 끝 문장은 까닭이에요.' },
    { l: 'l05', type: 'idea_back', icon: '🏃', src: '「아침에 운동장을 달려요」 글 ㉮',
      s: ['안녕하세요?', '저는 2학년 3반 이채영이에요.', '저는 아침에 다 같이 운동장에서 달리기를 하자는 생각을 전하고 싶어요.', '아침에 운동장을 달리면 좋은 점이 많기 때문이에요.'], hit: 2,
      why: '인사와 자기소개는 생각이 아니고, 끝 문장은 그 까닭이에요.' },
    { l: 'l05', type: 'idea_back', icon: '📚', src: '「쉬는 시간에 책을 읽어요」 글 ㉮',
      s: ['안녕하세요?', '저는 2학년 1반 곰이예요.', '저는 쉬는 시간에 다 같이 책을 읽자는 생각을 전하고 싶어요.', '책을 읽으면 새로운 것을 많이 알게 되기 때문이에요.'], hit: 2,
      why: '인사와 자기소개는 생각이 아니고, 끝 문장은 그 까닭이에요.' },

    // ── idea_part · 생각 글의 네 부분 (『국어』 216쪽 4번 · 지도서 296쪽 예시 글 1 · 『국어』 224쪽 · 정본 l11 s11 팻말)
    { l: 'l07', type: 'idea_part', icon: '🐣', src: '규빈이가 쓴 글',
      s: ['뒤뜰에서 병아리를 키웁시다.', '왜냐하면 병아리를 직접 키우면서 책임감을 기를 수 있기 때문입니다.',
          '병아리는 연약해서 잘 보살펴 주어야 한다는 것을 책에서 보았습니다.', '우리 반 친구들이 노력해서 병아리를 잘 키운다면 정말 뿌듯할 것 같습니다.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },
    { l: 'l07', type: 'idea_part', icon: '📖', src: '「책을 많이 읽읍시다」',
      s: ['책을 많이 읽읍시다.', '왜냐하면 책을 많이 읽으면 좋은 점이 많기 때문입니다.', '저는 책을 읽고 새로운 것들을 많이 알게 되었습니다.',
          '그리고 책을 다 읽고 나면 뿌듯한 기분을 느낄 수 있습니다.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },
    { l: 'l07', type: 'idea_part', icon: '🪧', src: '모둠 손 팻말',
      s: ['계단에서 뛰지 말자!', '부딪쳐 다칠 수 있으니까.', '나도 계단에서 미끄러질 뻔했어.', '모두 안전하면 마음이 놓여.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },
    { l: 'l07', type: 'idea_part', icon: '🌱', src: '「교실에서 화분을 키웁시다」',
      s: ['교실에서 화분을 키웁시다.', '왜냐하면 식물을 돌보면서 책임감을 기를 수 있기 때문입니다.',
          '식물은 햇빛과 물이 있어야 잘 자란다는 것을 과학책에서 읽었습니다.', '초록빛 화분이 있으면 교실이 한결 싱그러울 것 같습니다.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },
    { l: 'l07', type: 'idea_part', icon: '👟', src: '우리 집 손 팻말',
      s: ['현관에 신발을 가지런히 놓읍시다.', '왜냐하면 신발이 흩어져 있으면 걸려 넘어질 수 있기 때문입니다.', '어제 동생이 신발에 걸려 넘어질 뻔했습니다.',
          '신발이 가지런하면 현관이 깨끗해 보여서 기분이 좋습니다.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },
    { l: 'l07', type: 'idea_part', icon: '🥗', src: '「급식을 골고루 먹읍시다」',
      s: ['급식을 골고루 먹읍시다.', '왜냐하면 골고루 먹어야 몸이 튼튼해지기 때문입니다.', '채소에는 몸에 좋은 영양소가 많다는 것을 보건 선생님께 들었습니다.',
          '남김없이 다 먹고 나면 마음이 뿌듯합니다.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },
    { l: 'l14', type: 'idea_part', icon: '🪴', src: '다육 식물을 키우자는 글',
      s: ['우리 교실에서 다육 식물을 키우면 좋겠습니다.', '왜냐하면 다육 식물은 키우기가 쉽기 때문이에요.',
          '예전에 집에서 다육 식물을 키웠는데 물을 많이 주지 않아도 잘 자라서 돌보는 일이 어렵지 않았어요.',
          '그리고 다육 식물은 정말 귀엽게 생겨서 우리 교실의 분위기를 더 밝게 만들어 줄 거예요.'],
      roles: ['idea', 'reason', 'exp', 'feel'] },

    // ── idea_say · 생각을 나타낸 문장 모두 (『국어』 225쪽 2번 — 첫 두 판은 교과서 문장, 아님 = 지금 있는 일·설명)
    { l: 'l14', type: 'idea_say', icon: '⭕', src: '여러 가지 문장 ①',
      s: ['교실 문을 닫고 다니자.', '지금 다섯 시야.', '물을 낭비하지 말자.', '주말에 단풍을 보러 가는 건 어때요?', '이 아이스크림은 오백 원이야.'], hits: [0, 2, 3] },
    { l: 'l14', type: 'idea_say', icon: '⭕', src: '여러 가지 문장 ②',
      s: ['점심시간에 운동장에서 축구하는 건 어때?', '오늘은 비가 와요.', '우리의 소중한 자연유산을 지키자.', '우리 집에 가서 놀자.',
          '우리 반은 스물네 명이에요.', '놀이할 때 규칙을 지키자.'], hits: [0, 2, 3, 5] },
    { l: 'l14', type: 'idea_say', icon: '🏫', src: '교실에서 들은 말',
      s: ['복도에서는 천천히 걷자.', '이 연필은 노란색이야.', '급식실에서 줄을 서는 건 어때?', '운동장에 큰 나무가 있어요.', '친구에게 고운 말을 쓰자.',
          '시계가 열두 시를 가리켜요.'], hits: [0, 2, 4] },
    { l: 'l14', type: 'idea_say', icon: '🥬', src: '텃밭에서 들은 말',
      s: ['우리 반 텃밭에 상추를 심자.', '상추는 초록색이에요.', '물고기 밥은 아침에 주는 건 어때?', '토끼는 귀가 길어요.',
          '교실 어항에는 물고기가 세 마리 있어요.', '쓰레기는 쓰레기통에 버리자.'], hits: [0, 2, 5] },
    { l: 'l14', type: 'idea_say', icon: '📕', src: '도서관에서 들은 말',
      s: ['도서관에서는 조용히 하자.', '도서관은 3층에 있어요.', '책을 다 읽으면 제자리에 꽂자.', '이 책은 그림이 많아요.',
          '내일 같이 책을 빌리러 가는 건 어때?'], hits: [0, 2, 4] },
    { l: 'l14', type: 'idea_say', icon: '🪁', src: '쉬는 시간에 들은 말',
      s: ['지금은 쉬는 시간이에요.', '창문을 열어 바람을 쐬는 건 어때?', '밖에 바람이 불어요.', '우리 다 같이 줄넘기하자.', '줄넘기는 내 사물함에 있어.'], hits: [1, 3] }
  ];

  function shuffle(rng, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function q(s) { return '「' + s.replace(/[.!]$/, '') + '」'; }
  /* 받침 있으면 「은」 · 없으면 「는」 — 「」 앞 마지막 글자로 고른다 */
  function eunNeun(w) { var s = w.replace(/[.!?」]+$/, ''); var c = s.charCodeAt(s.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '은' : '는'; }
  function ulReul(w) { var c = w.charCodeAt(w.length - 1) - 0xAC00; return (c >= 0 && c < 11172 && c % 28) ? '을' : '를'; }

  function hitsOf(t, ask) {
    if (t.type === 'idea_say') return t.hits.slice();
    if (t.type === 'idea_part') return [t.roles.indexOf(ask)];
    return [t.hit];
  }

  function build(t, k, rng) {
    var ask = t.type === 'idea_part' ? ROLES[Math.floor(rng() * ROLES.length)] : null;
    var hits = hitsOf(t, ask), ex;
    var prompt = t.type === 'idea_part' ? ROLE_NAME[ask] + ulReul(ROLE_NAME[ask]) + ' 쓴 문장을 찾아 눌러요' : PROMPT[t.type];
    if (t.type === 'idea_front') {
      ex = q(t.s[t.hit]) + ' — 이 작은 글의 중심 생각이에요. ' + t.why + ' 여기서는 맨 앞에 있어요.';
    } else if (t.type === 'idea_back') {
      ex = q(t.s[t.hit]) + ' — 이 글의 중심 생각이에요. ' + t.why + ' 중심 생각이 늘 첫 문장에 있는 것은 아니에요.';
    } else if (t.type === 'idea_part') {
      ex = q(t.s[hits[0]]) + ' — ' + ROLE_WHY[ask] + ' 생각 글은 생각 → 까닭 → 경험이나 알고 있는 것 → 느낌으로 써요.';
    } else {
      var no = t.s.filter(function (s, j) { return hits.indexOf(j) < 0; });
      var last = q(no[no.length - 1]);
      ex = hits.map(function (j) { return q(t.s[j]); }).join(' · ') + ' — 「~하자」·「~는 어때?」처럼 무엇을 하자는 생각을 나타내요.  (' +
        no.map(q).join('·') + eunNeun(last) + ' 지금 있는 일이나 무엇을 설명하는 문장이에요)';
    }
    var tokens = [{ t: t.icon + ' ' + t.src, fixed: true }].concat(t.s.map(function (s, j) { return { t: s, hit: hits.indexOf(j) >= 0 }; }));
    var o = { id: 'ih' + k, l: t.l, type: t.type, icon: t.icon, src: t.src, prompt: t.icon + ' ' + prompt,
              sents: t.s.slice(), tokens: tokens, hits: hits, answer: hits.map(function (j) { return t.s[j]; }), explain: ex };
    if (ask) o.ask = ask;
    return o;
  }

  var MARK = ['㉠', '㉡', '㉢', '㉣', '㉤', '㉥'];

  return {
    id: 'g2_2_idea_hunt',
    title: '글쓴이의 생각 찾기',
    T: T, ORDER: ORDER, ROLES: ROLES, ROLE_NAME: ROLE_NAME, PROMPT: PROMPT, eunNeun: eunNeun,
    create: function (params, rng) {
      var p = params || {};
      var upto = ORDER.indexOf(p.upto) >= 0 && p.upto !== 'l14' ? p.upto : 'all';
      var lim = upto === 'all' ? ORDER.length - 1 : ORDER.indexOf(upto);
      var idx = [];
      T.forEach(function (t, k) { if (ORDER.indexOf(t.l) <= lim) idx.push(k); });
      var focus = upto === 'all' ? [] : idx.filter(function (k) { return T[k].l === upto; });
      var deck = shuffle(rng, focus).concat(shuffle(rng, idx.filter(function (k) { return focus.indexOf(k) < 0; })));
      var last = -1, n = 0;
      return {
        size: idx.length,
        next: function () {
          if (!deck.length) {
            deck = shuffle(rng, idx);
            if (deck.length > 1 && deck[0] === last) deck.push(deck.shift());   // 같은 글이 연달아 나오지 않게
          }
          var k = deck.shift(); last = k;
          return build(T[k], k + '_' + (n++), rng);
        },
        check: function (pick, q2) { return q2.answer.indexOf(String(pick)) >= 0; }
      };
    },
    printRender: function (q2) {
      return q2.icon + ' <b>' + q2.src + '</b> — ' + q2.prompt.replace(/^\S+ /, '') + '<br>' +
        q2.sents.map(function (s, k) { return MARK[k] + ' ' + s; }).join('<br>');
    },
    printAnswer: function (q2) { return q2.hits.map(function (j) { return MARK[j] + ' ' + q2.sents[j]; }).join(' · '); },
    printHead: '글 이름을 보고 무엇을 말하려는지 짐작한 뒤, 물음에 맞는 문장의 기호에 ○를 하세요.'
  };
}));
