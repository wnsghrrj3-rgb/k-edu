/* augment_g1_korean_u1.js — L3 증보(g1 국어 1단원 「글자를 만들어요」) · 국어 매핑 §7.
   ★국어는 수학과 방식 다름(설계 §7): v1국어 8슬 골격에 얹기 =
     ① review 문항형(낱말·문장 복습, from=이전차시) / ② img 장면 폴백 / ③ 서사=단원 세계관(글자 마을) /
     ④ offline 짝 활동(국어는 **필수 1**) / ⑤ leveled 대신 **활동 층**(읽기→쓰기→말하기 3층·leveled_problem 블록 재사용·라벨만) /
     ⑥ exit_ticket 동일 / ⑦ tnote 동일. → 국어 최종 12슬(8+4 삽입).
   원칙(§6): 기존 슬라이드 diff-0. 신규 필드(tnote/img) + 슬라이드 삽입만.
   근거 고정: 한글 결합(자음+모음=글자) 유니코드 조합 검산으로 정합 확인.
   저작권: 교과서 본문·삽화 미차용. 예시 낱말은 보편 어휘(가지·오이·포도) 자체 구성. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_korean_u1.js');

global.window = { LESSONS: {} };
require('./g1_korean_u1.js');
const L = window.LESSONS;

// ── 한글 결합 유틸(받침 없는 글자) ──
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
function compose(cho, jung) {
  const ci = CHO.indexOf(cho), ji = JUNG.indexOf(jung);
  if (ci < 0 || ji < 0) return null;
  return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28);
}

/* 차시별 증보 스펙. review(items·from) / leveled(활동층 읽기·쓰기·말하기) / offline(짝 활동) / exit / tnote.
   서사: 곰이·펭이 '글자 마을' — 자음자·모음자를 만나 글자를 만든다. */
const AUG = {
  u1_l01: { img: 'assets/photo/korean/letters_intro.jpg', review: null, from: null,
    leveled: { title: '글자와 친해지기', levels: {
      읽기: { q: '내 이름의 첫 글자를 소리 내어 읽어 볼까요?', a: '여러 답', open: true },
      쓰기: { q: '내가 아는 글자 하나를 따라 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '주변에서 본 글자를 하나 말해 봐요.', a: '여러 답 (예: 간판·책 제목)', open: true } } },
    offline: { title: '글자 찾기 짝 놀이', type: 'pair', goal: '교실에서 글자를 함께 찾아요', body: '짝과 함께 교실을 둘러보며 눈에 띄는 글자를 번갈아 가리켜요.', materials: ['글자 카드'], minutes: 5 },
    exit: { items: [{ q: '오늘 무엇에 대해 배웠나요?', a: '글자' }, { q: '글자는 어디에서 볼 수 있을까요?', a: '책·간판 등 여러 곳' }, { q: '글자를 배우면 무엇이 좋을까요?', a: '읽고 쓸 수 있어요' }],
      self: ['글자에 관심이 생겼어요', '조금 궁금해요', '아직 어려워요'] },
    tnote: { ask: ['우리 주변 어디에 글자가 있을까?'], watch: '글자에 대한 관심 열기', min: 3 } },

  u1_l02: { img: 'assets/photo/korean/why_letters.jpg', review: [{ q: '오늘 배운 것은?', a: '글자' }, { q: '글자는 어디에서 볼까요?', a: '여러 곳' }], from: 'u1_l01',
    leveled: { title: '글자가 하는 일', levels: {
      읽기: { q: '\'물\'이라고 쓰인 컵과 빈 컵 중 어느 것이 물일까요?', a: '\'물\'이라고 쓰인 컵', steps: ['글자가 뜻을 알려줘요'] },
      쓰기: { q: '내 물건에 붙일 이름표에 글자를 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '글자가 없다면 어떤 점이 불편할지 말해 봐요.', a: '여러 답 (예: 어디가 화장실인지 몰라요)', open: true } } },
    offline: { title: '이름표 만들기 짝 활동', type: 'pair', goal: '글자로 뜻을 전해요', body: '짝과 서로의 물건에 이름표를 만들어 붙여 줘요.', materials: ['종이', '색연필'], minutes: 6 },
    exit: { items: [{ q: '글자는 무엇을 전할까요?', a: '뜻·생각' }, { q: '이름표에 글자를 쓰면?', a: '누구 것인지 알 수 있어요' }, { q: '글자가 없으면?', a: '뜻을 전하기 어려워요' }],
      self: ['글자의 쓰임을 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['글자가 없으면 무엇이 불편할까?'], watch: '글자로 뜻을 전한다는 감각', min: 3 } },

  u1_l03: { img: 'assets/photo/korean/consonant_vowel.jpg', review: [{ q: '글자는 무엇을 전할까요?', a: '뜻' }, { q: '이름표에 글자를 쓰면?', a: '누구 것인지 알아요' }], from: 'u1_l02',
    leveled: { title: '자음자와 모음자 찾기', levels: {
      읽기: { q: 'ㄱ, ㄴ, ㄷ을 소리 내어 읽어 볼까요?', a: '기역·니은·디귿' },
      쓰기: { q: '모음자 ㅏ, ㅓ를 따라 써 볼까요?', a: 'ㅏ·ㅓ' },
      말하기: { q: '자음자와 모음자가 어떻게 다른지 말해 봐요.', a: '여러 답 (예: 자음자는 닿소리, 모음자는 홀소리)', open: true } } },
    offline: { title: '자모 카드 나누기 짝 활동', type: 'pair', goal: '자음자·모음자를 구별해요', body: '섞인 카드를 짝과 함께 자음자 칸·모음자 칸으로 나눠요.', materials: ['자모 카드'], minutes: 6 },
    exit: { items: [{ q: 'ㄱ은 무엇일까요?', a: '자음자' }, { q: 'ㅏ는 무엇일까요?', a: '모음자' }, { q: '자음자와 모음자를 나누는 기준은?', a: '소리 나는 방법' }],
      self: ['자음자·모음자를 구별해요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['자음자와 모음자는 어떻게 다를까?'], watch: '자음자·모음자 구별', min: 3 } },

  u1_l04: { img: 'assets/photo/korean/make_letter.jpg', review: [{ q: 'ㄱ은 무엇?', a: '자음자' }, { q: 'ㅏ는 무엇?', a: '모음자' }], from: 'u1_l03',
    leveled: { title: '자음자＋모음자로 글자 만들기', levels: {
      읽기: { q: 'ㄱ＋ㅏ＝가, ㄴ＋ㅏ＝나, ㄷ＋ㅏ＝다를 읽어 볼까요?', a: '가·나·다', steps: ['자음자＋모음자 → 글자'] },
      쓰기: { q: 'ㄱ과 ㅏ를 합쳐 \'가\'를 써 볼까요?', a: '가', steps: ['ㄱ＋ㅏ＝가'] },
      말하기: { q: '\'가\'로 시작하는 낱말을 말해 봐요.', a: '여러 답 (예: 가지, 가위)', open: true } } },
    offline: { title: '글자 만들기 짝 놀이', type: 'pair', goal: '자음자＋모음자를 합쳐 글자를 만들어요', body: '짝과 자음자 카드·모음자 카드를 골라 합쳐 글자를 만들고 읽어 줘요.', materials: ['자음자 카드', '모음자 카드'], minutes: 7 },
    exit: { items: [{ q: 'ㄱ＋ㅏ는?', a: '가' }, { q: 'ㄴ＋ㅏ는?', a: '나' }, { q: '글자는 무엇과 무엇으로 만들까요?', a: '자음자와 모음자' }],
      self: ['자음자＋모음자로 글자를 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['자음자와 모음자를 합치면 무엇이 될까?'], watch: '결합 원리(자음자＋모음자＝글자)', min: 3 } },

  u1_l05: { img: 'assets/photo/korean/structure.jpg', review: [{ q: 'ㄱ＋ㅏ는?', a: '가' }, { q: '글자는 무엇으로 만들까요?', a: '자음자와 모음자' }], from: 'u1_l04',
    leveled: { title: '받침 없는 글자의 짜임', levels: {
      읽기: { q: 'ㅇ＋ㅗ＝오, ㅇ＋ㅣ＝이를 읽어 볼까요?', a: '오·이', steps: ['첫소리＋가운뎃소리'] },
      쓰기: { q: 'ㅇ과 ㅗ를 합쳐 \'오\'를 써 볼까요?', a: '오', steps: ['ㅇ＋ㅗ＝오'] },
      말하기: { q: '받침 없는 글자를 하나 만들어 말해 봐요.', a: '여러 답 (예: 아, 무)', open: true } } },
    offline: { title: '짜임 나누기 짝 활동', type: 'pair', goal: '글자를 첫소리·가운뎃소리로 나눠요', body: '짝과 함께 글자 카드를 보고 첫소리와 가운뎃소리를 손가락으로 짚어요.', materials: ['글자 카드'], minutes: 6 },
    exit: { items: [{ q: '받침 없는 글자는 무엇과 무엇으로?', a: '첫소리와 가운뎃소리' }, { q: 'ㅇ＋ㅗ는?', a: '오' }, { q: '\'이\'는 어떤 소리로 이루어졌나요?', a: 'ㅇ과 ㅣ' }],
      self: ['받침 없는 글자의 짜임을 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['받침이 없는 글자는 어떻게 이루어질까?'], watch: '첫소리＋가운뎃소리 짜임', min: 3 } },

  u1_l06: { img: 'assets/photo/korean/play_make.jpg', review: [{ q: 'ㅇ＋ㅗ는?', a: '오' }, { q: '받침 없는 글자는 무엇과 무엇으로?', a: '첫소리와 가운뎃소리' }], from: 'u1_l05',
    leveled: { title: '글자 만들기 놀이', levels: {
      읽기: { q: 'ㅍ＋ㅗ＝포, ㄷ＋ㅗ＝도를 읽어 볼까요?', a: '포·도', steps: ['자음자를 바꾸면 글자가 달라져요'] },
      쓰기: { q: 'ㅍ과 ㅗ를 합쳐 \'포\'를 써 볼까요?', a: '포', steps: ['ㅍ＋ㅗ＝포'] },
      말하기: { q: '모음자 ㅗ에 자음자를 바꿔 끼워 여러 글자를 말해 봐요.', a: '여러 답 (예: 고·노·도·포)', open: true } } },
    offline: { title: '자음자 바꿔 끼우기 짝 놀이', type: 'pair', goal: '자음자를 바꾸며 새 글자를 만들어요', body: '모음자 카드 하나를 두고 짝과 번갈아 자음자를 바꿔 끼워 글자를 만들어요.', materials: ['자음자 카드', '모음자 카드'], minutes: 7 },
    exit: { items: [{ q: 'ㅍ＋ㅗ는?', a: '포' }, { q: 'ㄷ＋ㅗ는?', a: '도' }, { q: '자음자를 바꾸면 글자는?', a: '달라져요' }],
      self: ['자음자를 바꿔 글자를 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['자음자를 바꾸면 글자가 어떻게 될까?'], watch: '자모 조합 놀이', min: 3 } },

  u1_l07: { img: 'assets/photo/korean/read_posture.jpg', review: [{ q: 'ㅍ＋ㅗ는?', a: '포' }, { q: '자음자를 바꾸면 글자는?', a: '달라져요' }], from: 'u1_l06',
    leveled: { title: '바른 자세로 읽기', levels: {
      읽기: { q: '허리를 펴고 \'가·나·다\'를 또박또박 읽어 볼까요?', a: '가·나·다' },
      쓰기: { q: '바르게 읽는 자세를 그림으로 표시해 볼까요?', a: '여러 답', open: true },
      말하기: { q: '바르게 읽으려면 어떻게 해야 할지 말해 봐요.', a: '여러 답 (예: 허리를 펴고 또박또박)', open: true } } },
    offline: { title: '또박또박 읽기 짝 점검', type: 'pair', goal: '바른 자세로 또박또박 읽어요', body: '짝과 마주 앉아 한 사람이 읽고 다른 사람이 자세를 살펴 줘요.', materials: ['글자 카드'], minutes: 5 },
    exit: { items: [{ q: '바르게 읽을 때 허리는?', a: '곧게 펴요' }, { q: '어떻게 읽어야 할까요?', a: '또박또박' }, { q: '바른 자세는 왜 필요할까요?', a: '잘 읽고 오래 앉을 수 있어요' }],
      self: ['바른 자세로 읽을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['바르게 읽으려면 어떤 자세가 좋을까?'], watch: '읽기 자세·또박또박', min: 3 } },

  u1_l08: { img: 'assets/photo/korean/write_posture.jpg', review: [{ q: '바르게 읽을 때 허리는?', a: '곧게 펴요' }, { q: '어떻게 읽어야 할까요?', a: '또박또박' }], from: 'u1_l07',
    leveled: { title: '바른 자세로 쓰기', levels: {
      읽기: { q: '바르게 쓰는 자세를 설명한 글을 읽어 볼까요?', a: '연필을 바르게 잡고 씁니다' },
      쓰기: { q: '연필을 바르게 잡고 \'나\'를 또박또박 써 볼까요?', a: '나' },
      말하기: { q: '바르게 쓰려면 어떻게 해야 할지 말해 봐요.', a: '여러 답 (예: 연필을 바르게 잡아요)', open: true } } },
    offline: { title: '연필 바르게 잡기 짝 점검', type: 'pair', goal: '연필을 바르게 잡고 써요', body: '짝과 서로 연필 잡는 손 모양을 살펴 주고 고쳐 줘요.', materials: ['연필', '공책'], minutes: 6 },
    exit: { items: [{ q: '쓸 때 연필은 어떻게?', a: '바르게 잡아요' }, { q: '글자는 어떻게 써야 할까요?', a: '또박또박' }, { q: '바른 쓰기 자세는 왜 좋을까요?', a: '글씨가 예쁘고 손이 편해요' }],
      self: ['바른 자세로 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['연필을 어떻게 잡아야 바를까?'], watch: '쓰기 자세·연필 잡기', min: 3 } },

  u1_l09: { img: 'assets/photo/korean/vowels1.jpg', review: [{ q: '쓸 때 연필은?', a: '바르게 잡아요' }, { q: '글자는 어떻게 써야 할까요?', a: '또박또박' }], from: 'u1_l08',
    leveled: { title: '여러 가지 모음자 ①', levels: {
      읽기: { q: '모음자 ㅐ, ㅔ를 읽어 볼까요?', a: 'ㅐ·ㅔ' },
      쓰기: { q: 'ㄱ과 ㅐ를 합쳐 \'개\'를 써 볼까요?', a: '개', steps: ['ㄱ＋ㅐ＝개'] },
      말하기: { q: 'ㅐ가 들어간 글자를 하나 말해 봐요.', a: '여러 답 (예: 개, 배)', open: true } } },
    offline: { title: '모음자 이어 붙이기 짝 놀이', type: 'pair', goal: '새 모음자로 글자를 만들어요', body: '짝과 자음자에 ㅐ·ㅔ를 붙여 글자를 만들어 읽어 줘요.', materials: ['자모 카드'], minutes: 6 },
    exit: { items: [{ q: 'ㄱ＋ㅐ는?', a: '개' }, { q: 'ㅐ와 ㅔ는 무엇일까요?', a: '모음자' }, { q: '모음자가 바뀌면 글자는?', a: '달라져요' }],
      self: ['여러 모음자를 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['모음자가 바뀌면 글자가 어떻게 될까?'], watch: '여러 모음자 ㅐ·ㅔ', min: 3 } },

  u1_l10: { img: 'assets/photo/korean/vowels2.jpg', review: [{ q: 'ㄱ＋ㅐ는?', a: '개' }, { q: 'ㅐ와 ㅔ는?', a: '모음자' }], from: 'u1_l09',
    leveled: { title: '여러 가지 모음자 ②', levels: {
      읽기: { q: '모음자 ㅑ, ㅕ를 읽어 볼까요?', a: 'ㅑ·ㅕ' },
      쓰기: { q: 'ㅇ과 ㅑ를 합쳐 \'야\'를 써 볼까요?', a: '야', steps: ['ㅇ＋ㅑ＝야'] },
      말하기: { q: 'ㅑ나 ㅕ가 들어간 글자를 말해 봐요.', a: '여러 답 (예: 야, 여)', open: true } } },
    offline: { title: '모음자 짝 맞추기', type: 'pair', goal: '비슷한 모음자를 구별해요', body: '짝과 ㅏ/ㅑ, ㅓ/ㅕ 카드를 짝지어 소리 내어 읽어요.', materials: ['모음자 카드'], minutes: 6 },
    exit: { items: [{ q: 'ㅇ＋ㅑ는?', a: '야' }, { q: 'ㅑ는 무엇일까요?', a: '모음자' }, { q: 'ㅏ와 ㅑ는 소리가 같을까요?', a: '아니요, 달라요' }],
      self: ['여러 모음자를 구별해요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['ㅏ와 ㅑ는 어떻게 다를까?'], watch: '여러 모음자 ㅑ·ㅕ', min: 3 } },

  u1_l11: { img: 'assets/photo/korean/vowels3.jpg', review: [{ q: 'ㅇ＋ㅑ는?', a: '야' }, { q: 'ㅑ는 무엇?', a: '모음자' }], from: 'u1_l10',
    leveled: { title: '여러 가지 모음자 ③', levels: {
      읽기: { q: '모음자 ㅛ, ㅠ를 읽어 볼까요?', a: 'ㅛ·ㅠ' },
      쓰기: { q: 'ㅇ과 ㅛ를 합쳐 \'요\'를 써 볼까요?', a: '요', steps: ['ㅇ＋ㅛ＝요'] },
      말하기: { q: 'ㅛ나 ㅠ가 들어간 글자를 말해 봐요.', a: '여러 답 (예: 요, 유)', open: true } } },
    offline: { title: '모음자 모으기 짝 놀이', type: 'pair', goal: '여러 모음자를 모아 읽어요', body: '짝과 함께 배운 모음자 카드를 모두 모아 순서대로 읽어요.', materials: ['모음자 카드'], minutes: 6 },
    exit: { items: [{ q: 'ㅇ＋ㅛ는?', a: '요' }, { q: 'ㅛ와 ㅠ는 무엇일까요?', a: '모음자' }, { q: '모음자는 몇 가지나 배웠나요?', a: '여러 가지' }],
      self: ['여러 모음자를 모두 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['지금까지 배운 모음자를 떠올려 볼까?'], watch: '여러 모음자 ㅛ·ㅠ 종합', min: 3 } },

  u1_l12: { img: 'assets/photo/korean/check_structure.jpg', review: [{ q: 'ㅇ＋ㅛ는?', a: '요' }, { q: 'ㅛ와 ㅠ는?', a: '모음자' }], from: 'u1_l11',
    leveled: { title: '글자 짜임 점검', levels: {
      읽기: { q: '\'다\'는 어떤 자음자와 모음자로 되어 있나요?', a: 'ㄷ과 ㅏ', steps: ['ㄷ＋ㅏ＝다'] },
      쓰기: { q: 'ㄷ과 ㅏ를 합쳐 \'다\'를 써 볼까요?', a: '다', steps: ['ㄷ＋ㅏ＝다'] },
      말하기: { q: '내가 만든 글자의 짜임을 짝에게 설명해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '글자 짜임 알아맞히기 짝 활동', type: 'pair', goal: '글자를 자음자·모음자로 풀어요', body: '짝이 글자를 보여 주면 어떤 자음자＋모음자인지 맞혀요.', materials: ['글자 카드'], minutes: 6 },
    exit: { items: [{ q: '\'다\'의 자음자는?', a: 'ㄷ' }, { q: '\'다\'의 모음자는?', a: 'ㅏ' }, { q: '글자는 무엇과 무엇으로 이루어질까요?', a: '자음자와 모음자' }],
      self: ['글자의 짜임을 풀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['이 글자는 어떤 자음자와 모음자로 되어 있을까?'], watch: '글자 짜임 분해', min: 3 } },

  u1_l13: { img: 'assets/photo/korean/play_letters.jpg', review: [{ q: '\'다\'의 자음자는?', a: 'ㄷ' }, { q: '글자는 무엇으로 이루어질까요?', a: '자음자와 모음자' }], from: 'u1_l12',
    leveled: { title: '자음자와 모음자로 놀이하기', levels: {
      읽기: { q: '만든 글자 \'나·도·개\'를 읽어 볼까요?', a: '나·도·개' },
      쓰기: { q: '자음자와 모음자를 골라 새 글자를 만들어 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '내가 만든 글자를 친구에게 소리 내어 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '글자 만들기 대결 짝 놀이', type: 'pair', goal: '정해진 시간에 글자를 많이 만들어요', body: '짝과 카드를 골라 받침 없는 글자를 번갈아 만들며 읽어요.', materials: ['자모 카드'], minutes: 7 },
    exit: { items: [{ q: '자음자와 모음자로 무엇을 만들까요?', a: '글자' }, { q: '\'도\'는 무엇과 무엇으로?', a: 'ㄷ과 ㅗ' }, { q: '글자 만들기는 재미있었나요?', a: '여러 답' }],
      self: ['자음자·모음자로 글자를 만들며 놀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['자음자와 모음자로 어떤 글자를 만들 수 있을까?'], watch: '자모 조합 놀이 종합', min: 3 } },

  u1_l14: { img: 'assets/photo/korean/words.jpg', review: [{ q: '자음자와 모음자로 무엇을 만들까요?', a: '글자' }, { q: '\'도\'는 무엇과 무엇으로?', a: 'ㄷ과 ㅗ' }], from: 'u1_l13',
    leveled: { title: '낱말을 만들고 또박또박 읽기', levels: {
      읽기: { q: '낱말 \'가지·오이·포도\'를 또박또박 읽어 볼까요?', a: '가지·오이·포도' },
      쓰기: { q: '글자를 이어 낱말 \'포도\'를 써 볼까요?', a: '포도', steps: ['포＋도＝포도'] },
      말하기: { q: '내가 아는 낱말을 하나 만들어 말해 봐요.', a: '여러 답 (예: 오이, 나비)', open: true } } },
    offline: { title: '낱말 이어 만들기 짝 놀이', type: 'pair', goal: '글자를 이어 낱말을 만들어요', body: '짝과 글자 카드를 이어 낱말을 만들고 또박또박 읽어 줘요.', materials: ['글자 카드'], minutes: 7 },
    exit: { items: [{ q: '\'포도\'는 몇 글자인가요?', a: '두 글자' }, { q: '낱말은 무엇을 이어 만들까요?', a: '글자' }, { q: '낱말을 읽을 때는 어떻게?', a: '또박또박' }],
      self: ['글자를 이어 낱말을 읽을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['글자를 이으면 무엇이 될까?'], watch: '낱말 만들기·또박또박 읽기', min: 3 } }
};

function findIdx(slides, pred) { return slides.findIndex(pred); }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];

  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }
  if (spec.tnote) { const c = S.find(s => s.block === 'concept') || S.find(s => s.block === 'motivate'); if (c) c.tnote = spec.tnote; }

  // ① review 슬라이드 삽입(국어 원본 review 블록 없음) — motivate 뒤. 첫 차시(l01)는 null → 미삽입.
  if (spec.review) {
    const s_rv = { id: 's-rv', stage: '도입', block: 'review',
      data: { title: '지난 시간에 배운 것', items: spec.review, from: spec.from || undefined }, suggested_extras: ['e_prev_review'] };
    let i = findIdx(S, s => s.block === 'motivate');
    if (i < 0) i = findIdx(S, s => s.block === 'objective');
    S.splice(i + 1, 0, s_rv);
  }

  // ⑤ 활동 층(leveled_problem 재사용·읽기/쓰기/말하기) + ④ offline 짝 활동 + ⑥ exit — summary 앞(순서 유지)
  const inserts = [];
  if (spec.leveled) inserts.push({ id: 's-lv', stage: '활동', block: 'leveled_problem', data: spec.leveled, suggested_extras: ['q_apply'] });
  if (spec.offline) inserts.push({ id: 's-off', stage: '활동', block: 'offline_activity', data: Object.assign({ tag: '👋 짝 활동' }, spec.offline), suggested_extras: [] });
  if (spec.exit) inserts.push({ id: 's-ex', stage: '정리', block: 'exit_ticket', data: { title: '오늘 확인해요', items: spec.exit.items, self: spec.exit.self }, suggested_extras: ['q_reflect'] });
  if (inserts.length) {
    let si = findIdx(S, s => s.block === 'summary');
    if (si < 0) si = S.length;
    S.splice(si, 0, ...inserts);
  }

  // 삽입 슬라이드 id 유니크 재부여
  let n = 100;
  S.forEach(s => { if (['s-rv', 's-lv', 's-off', 's-ex'].includes(s.id)) s.id = 's' + (n++); });
  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(국어 §7)';
});

// ── 한글 결합 정합 검산 (자음자＋모음자＝글자) ──
const bad = [];
const FACTS = [['ㄱ', 'ㅏ', '가'], ['ㄴ', 'ㅏ', '나'], ['ㄷ', 'ㅏ', '다'], ['ㅇ', 'ㅗ', '오'], ['ㅇ', 'ㅣ', '이'], ['ㅍ', 'ㅗ', '포'], ['ㄷ', 'ㅗ', '도'], ['ㄱ', 'ㅐ', '개'], ['ㅇ', 'ㅑ', '야'], ['ㅇ', 'ㅛ', '요']];
FACTS.forEach(([c, j, exp]) => { const g = compose(c, j); if (g !== exp) bad.push('결합 불일치: ' + c + '＋' + j + '＝' + g + '(기대 ' + exp + ')'); });
// 증보 텍스트 내 "자음＋모음＝글자" 패턴 전수 검산
const combRe = /([ㄱ-ㅎ])\s*[+＋]\s*([ㅏ-ㅣ])\s*[=＝]\s*([가-힣])/g;
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  ['leveled_problem', 'exit_ticket', 'review'].forEach(blk => {
    const s = S.find(x => x.block === blk); if (!s) return;
    const txt = JSON.stringify(s.data); let m;
    while ((m = combRe.exec(txt)) !== null) {
      const g = compose(m[1], m[2]);
      if (g !== m[3]) bad.push(key + ':' + blk + ' 결합 모순 ' + m[1] + '＋' + m[2] + '＝' + g + '(표기 ' + m[3] + ')');
    }
  });
});
if (bad.length) { console.error('한글 결합 정합 오류:', bad); process.exit(1); }

// ── 국어 5요소 검증 (review[l01제외]·leveled·offline·exit·tnote) ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides, b = S.map(s => s.block);
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.leveled && !b.includes('leveled_problem')) elemFail.push(key + ':leveled');
  if (spec.offline && !b.includes('offline_activity')) elemFail.push(key + ':offline');
  if (spec.exit && !b.includes('exit_ticket')) elemFail.push(key + ':exit');
  if (S.filter(s => s.tnote).length < 1) elemFail.push(key + ':tnote');
  // 활동 층 라벨 검증(읽기·쓰기·말하기)
  const lv = S.find(s => s.block === 'leveled_problem');
  if (lv) { const ks = Object.keys(lv.data.levels || {}); if (!(ks.includes('읽기') && ks.includes('쓰기') && ks.includes('말하기'))) elemFail.push(key + ':활동층라벨'); }
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

// ── 차단 어휘 ──
const banned = ['박음', '빵꾸', '갈아엎', '결로'];
const termFail = [];
Object.keys(AUG).forEach(key => {
  L[key].slides.forEach(s => {
    if (['leveled_problem', 'exit_ticket', 'review', 'offline_activity'].includes(s.block)) {
      const txt = JSON.stringify(s.data);
      banned.forEach(t => { if (new RegExp('(?<![가-힣])' + t).test(txt)) termFail.push(key + ':' + s.block + ':' + t); });
    }
  });
});
if (termFail.length) { console.error('차단 어휘:', termFail); process.exit(1); }

console.log('✅ g1 국어 u1 「글자를 만들어요」 증보 완료 (14차시 · 국어 §7)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'leveled_problem', 'offline_activity', 'exit_ticket'].filter(x => S.some(s => s.block === x)).join(','));
});

// ── 파일 재출력 (전차시 IIFE 안 · window.LESSONS 2칸 들여쓰기 보존) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + '})();\n', 'utf8');
console.log('  파일 재출력 완료 (IIFE 보존)');
