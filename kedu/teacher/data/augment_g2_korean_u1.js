/* augment_g2_korean_u1.js — L4 증보(g2 국어 1단원 「만나서 반가워요!」) · 국어 매핑 §7.
   ★국어는 수학과 방식 다름(설계 §7): v1국어 8슬 골격에 얹기 =
     ① review 문항형(개념·표현 복습, from=이전차시) / ② img 장면 폴백 / ③ 서사=단원 세계관(소개·대화·말차례) /
     ④ offline 짝 활동(국어는 **필수 1**) / ⑤ leveled 대신 **활동 층**(읽기→쓰기→말하기 3층·leveled_problem 블록 재사용·라벨만) /
     ⑥ exit_ticket 동일 / ⑦ tnote 동일. → 국어 최종 12슬(l01=11, review 제외).
   원칙(§6): 기존 슬라이드 diff-0. 신규 필드(tnote/img) + 슬라이드 삽입만.
   근거 고정: 소개·대화 단원이라 산수/한글결합 검산 없음 → **저작권 가드 자체검증**(지도서 제재·예문 미포함)으로 대체.
   저작권: 교과서 본문·삽화·소단원 제재(「용기를 내, 비닐장갑!」 등)·소개 글 예문 전부 미차용.
     소개 항목·인사·대화문은 보편 어휘 자체 구성. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_korean_u1.js');

global.window = { LESSONS: {} };
require('./g2_korean_u1.js');
const L = window.LESSONS;

/* 차시별 증보 스펙. review(items·from) / leveled(활동층 읽기·쓰기·말하기) / offline(짝 활동) / exit / tnote.
   서사: 소개·대화·말차례 세계 — 만나서 인사하고, 말차례를 지켜 대화하며, 나와 주변 사람을 소개한다.
   보편 어휘 자체 구성(가상 인물·소개 항목: 이름·좋아하는 것·잘하는 것 등). */
const AUG = {
  u1_l01: { img: 'assets/photo/korean/g2_meet_greet.jpg', review: null, from: null,
    leveled: { title: '반갑게 인사 나누기', levels: {
      읽기: { q: '\'만나서 반가워\'를 밝은 목소리로 읽어 볼까요?', a: '만나서 반가워', open: true },
      쓰기: { q: '내 이름을 또박또박 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '옆 친구에게 이름을 넣어 반갑게 인사해 봐요.', a: '여러 답 (예: 안녕? 나는 ◯◯이야)', open: true } } },
    offline: { title: '이름 인사 짝 놀이', type: 'pair', goal: '마주 보고 인사하며 친해져요', body: '짝과 마주 보고 번갈아 인사하고 이름을 말해요. 서로 이름을 기억했는지 확인해요.', materials: ['이름표'], minutes: 5 },
    exit: { items: [{ q: '친구가 말할 때는 어떻게 하나요?', a: '끝까지 잘 들어요' }, { q: '인사할 때 마음은?', a: '반갑고 고운 마음' }, { q: '내 차례에 어떻게 말하나요?', a: '순서를 지켜 말해요' }],
      self: ['친구와 반갑게 인사했어요', '조금 쑥스러웠어요', '아직 어려워요'] },
    tnote: { ask: ['새 친구와 친해지려면 무엇부터 하면 좋을까?'], watch: '경청·인사 태도 열기', min: 3 } },

  u1_l02: { img: 'assets/photo/korean/g2_intro_writing.jpg', review: [{ q: '친구가 말할 때는?', a: '끝까지 잘 들어요' }, { q: '내 차례에 어떻게?', a: '순서를 지켜 말해요' }], from: 'u1_l01',
    leveled: { title: '소개 글에 담을 내용 찾기', levels: {
      읽기: { q: '\'저는 그림 그리기를 좋아합니다.\'는 나의 무엇을 알려 주나요?', a: '좋아하는 것' },
      쓰기: { q: '나를 알려 주는 내용 한 가지를 써 볼까요?', a: '여러 답 (예: 이름·좋아하는 것)', open: true },
      말하기: { q: '친구들에게 알려 주고 싶은 나의 점을 하나 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '소개 항목 모으기 짝 활동', type: 'pair', goal: '소개에 담을 내용을 함께 떠올려요', body: '짝과 번갈아 \'이름·좋아하는 것·잘하는 것\'처럼 소개에 담을 항목을 하나씩 말해요.', materials: ['메모지'], minutes: 6 },
    exit: { items: [{ q: '소개하는 글은 무엇을 알려 주나요?', a: '나에 대한 것' }, { q: '소개에 담을 수 있는 것은?', a: '이름·좋아하는 것 등' }, { q: '소개 글을 읽으면 좋은 점은?', a: '그 사람을 알 수 있어요' }],
      self: ['소개 글에 담을 내용을 알아요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['나를 소개한다면 무엇부터 말하고 싶어?'], watch: '소개 항목 떠올리기', min: 3 } },

  u1_l03: { img: 'assets/photo/korean/g2_turn_taking1.jpg', review: [{ q: '소개하는 글은 무엇을 알려 주나요?', a: '나에 대한 것' }, { q: '소개에 담을 수 있는 것은?', a: '이름·좋아하는 것 등' }], from: 'u1_l02',
    leveled: { title: '말차례 지켜 대화하기', levels: {
      읽기: { q: '\'친구가 말할 때 끝까지 듣습니다.\'를 읽고 왜 그런지 생각해 볼까요?', a: '서로의 말을 잘 알아듣기 위해서' },
      쓰기: { q: '말차례를 지키는 방법 한 가지를 써 볼까요?', a: '여러 답 (예: 손을 들고 기다려요)', open: true },
      말하기: { q: '짝과 한 가지 주제로 말차례를 지켜 한 번씩 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '말차례 대화 짝 놀이', type: 'pair', goal: '순서를 지켜 대화해요', body: '\'말하기 막대\'를 든 사람만 말하고, 짝은 끝까지 들은 뒤 막대를 넘겨받아 말해요.', materials: ['막대(연필)'], minutes: 6 },
    exit: { items: [{ q: '말차례란 무엇인가요?', a: '말하는 순서' }, { q: '여럿이 한꺼번에 말하면?', a: '알아듣기 어려워요' }, { q: '말차례를 지키려면?', a: '기다렸다 내 차례에 말해요' }],
      self: ['말차례를 지켜 대화할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['모두 한꺼번에 말하면 어떤 점이 불편할까?'], watch: '말차례 개념·필요 이해', min: 3 } },

  u1_l04: { img: 'assets/photo/korean/g2_turn_taking2.jpg', review: [{ q: '말차례란?', a: '말하는 순서' }, { q: '말차례를 지키려면?', a: '내 차례에 말해요' }], from: 'u1_l03',
    leveled: { title: '바른 대화 약속 지키기', levels: {
      읽기: { q: '\'말하는 사람을 바라보며 듣습니다.\'는 바른 대화일까요?', a: '네, 바른 대화' },
      쓰기: { q: '우리 반 대화 약속 한 가지를 써 볼까요?', a: '여러 답 (예: 고운 말을 써요)', open: true },
      말하기: { q: '짝과 대화 약속을 지키며 좋아하는 것을 한 가지씩 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '대화 약속 만들기 짝 활동', type: 'pair', goal: '함께 지킬 약속을 정해요', body: '짝과 함께 대화할 때 지킬 약속 두 가지를 정해 메모지에 써요.', materials: ['메모지'], minutes: 6 },
    exit: { items: [{ q: '대화에는 무엇이 필요한가요?', a: '약속' }, { q: '들을 때 바른 자세는?', a: '말하는 사람을 바라봐요' }, { q: '약속을 지키면 대화가 어떻게 되나요?', a: '즐겁고 잘 통해요' }],
      self: ['대화 약속을 지킬 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['친구와 즐겁게 대화하려면 어떤 약속이 필요할까?'], watch: '대화 약속 내면화', min: 3 } },

  u1_l05: { img: 'assets/photo/korean/g2_share_ideas1.jpg', review: [{ q: '대화에는 무엇이 필요한가요?', a: '약속' }, { q: '들을 때 바른 자세는?', a: '말하는 사람을 바라봐요' }], from: 'u1_l04',
    leveled: { title: '글 읽고 생각 나누기', levels: {
      읽기: { q: '짧은 글을 읽고 어떤 생각이 드는지 떠올려 볼까요?', a: '여러 답', open: true },
      쓰기: { q: '글을 읽고 든 내 생각을 한 문장으로 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '짝에게 내 생각을 말하고, 짝의 생각도 들어 봐요.', a: '여러 답', open: true } } },
    offline: { title: '생각 나누기 짝 활동', type: 'pair', goal: '서로 다른 생각을 존중해요', body: '같은 이야기를 떠올려 짝과 생각을 한 번씩 나누고, 서로 다른 점을 찾아요.', materials: [], minutes: 6 },
    exit: { items: [{ q: '같은 글을 읽어도 생각은?', a: '친구마다 달라요' }, { q: '생각을 나눌 때는?', a: '서로 존중하며 들어요' }, { q: '내 생각을 말할 때는?', a: '까닭과 함께 말해요' }],
      self: ['생각을 나눌 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['같은 글인데 왜 생각이 다를까?'], watch: '생각의 다양성 존중', min: 3 } },

  u1_l06: { img: 'assets/photo/korean/g2_share_ideas2.jpg', review: [{ q: '같은 글을 읽어도 생각은?', a: '친구마다 달라요' }, { q: '생각을 나눌 때는?', a: '서로 존중하며 들어요' }], from: 'u1_l05',
    leveled: { title: '질문하고 반응하기', levels: {
      읽기: { q: '\'왜 그렇게 생각했나요?\'라는 질문은 어떤 도움이 될까요?', a: '생각을 더 깊게 해요' },
      쓰기: { q: '친구 이야기를 듣고 궁금한 점을 질문으로 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '짝의 이야기를 듣고 \'좋은 생각이야\'처럼 반응해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '질문 주고받기 짝 놀이', type: 'pair', goal: '질문으로 대화를 이어요', body: '짝이 좋아하는 것을 말하면, 그에 대해 \'왜?·어떻게?\' 질문을 한 가지씩 주고받아요.', materials: [], minutes: 6 },
    exit: { items: [{ q: '좋은 질문은 대화를 어떻게 하나요?', a: '더 깊게 해요' }, { q: '친구 말에 어떻게 반응하나요?', a: '고개를 끄덕이거나 대답해요' }, { q: '질문할 때 마음은?', a: '궁금하고 존중하는 마음' }],
      self: ['질문하고 반응할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['어떤 질문을 하면 이야기가 더 깊어질까?'], watch: '질문·반응으로 대화 심화', min: 3 } },

  u1_l07: { img: 'assets/photo/korean/g2_organize_intro1.jpg', review: [{ q: '좋은 질문은 대화를 어떻게?', a: '더 깊게 해요' }, { q: '친구 말에 어떻게 반응하나요?', a: '고개를 끄덕이거나 대답해요' }], from: 'u1_l06',
    leveled: { title: '소개할 내용 정리하기', levels: {
      읽기: { q: '\'이름·좋아하는 것·잘하는 것\' 중 소개에 넣을 것을 골라 읽어 볼까요?', a: '여러 답', open: true },
      쓰기: { q: '나를 소개할 내용 두 가지를 골라 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '정리한 소개 내용을 짝에게 한 가지 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '소개 카드 채우기 짝 활동', type: 'pair', goal: '소개 내용을 정리해요', body: '짝과 서로에게 물으며 \'이름·좋아하는 것·잘하는 것\' 소개 카드를 채워 줘요.', materials: ['소개 카드'], minutes: 7 },
    exit: { items: [{ q: '소개하기 전에 먼저 할 일은?', a: '내용을 정리해요' }, { q: '소개에 넣으면 좋은 것은?', a: '이름·좋아하는 것 등' }, { q: '정리하면 무엇이 좋나요?', a: '소개를 또렷하게 할 수 있어요' }],
      self: ['소개 내용을 정리할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['나를 소개한다면 어떤 것부터 정리할까?'], watch: '소개 항목 선별·정리', min: 3 } },

  u1_l08: { img: 'assets/photo/korean/g2_organize_intro2.jpg', review: [{ q: '소개하기 전에 먼저 할 일은?', a: '내용을 정리해요' }, { q: '소개에 넣으면 좋은 것은?', a: '이름·좋아하는 것 등' }], from: 'u1_l07',
    leveled: { title: '까닭을 더해 소개하기', levels: {
      읽기: { q: '\'저는 책 읽기를 좋아합니다. 이야기가 재미있기 때문입니다.\'에서 까닭은?', a: '이야기가 재미있기 때문' },
      쓰기: { q: '내가 좋아하는 것과 그 까닭을 이어 한 문장으로 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '까닭을 더해 나를 소개하는 말을 한 가지 해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '까닭 더하기 짝 활동', type: 'pair', goal: '소개에 까닭을 더해요', body: '짝이 좋아하는 것을 말하면 \'왜 좋아해?\'라고 물어 까닭을 이끌어 내고 서로 소개 문장을 완성해요.', materials: [], minutes: 6 },
    exit: { items: [{ q: '소개에 까닭을 더하면?', a: '더 잘 이해돼요' }, { q: '\'좋아합니다\'에 무엇을 더하나요?', a: '까닭' }, { q: '소개 표현은 어떤 말투로?', a: '바르고 고운 말투' }],
      self: ['까닭을 더해 소개할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['\'좋아합니다\'에 까닭을 더하면 무엇이 좋을까?'], watch: '까닭 넣은 소개 표현', min: 3 } },

  u1_l09: { img: 'assets/photo/korean/g2_write_intro1.jpg', review: [{ q: '소개에 까닭을 더하면?', a: '더 잘 이해돼요' }, { q: '소개 표현은 어떤 말투로?', a: '바르고 고운 말투' }], from: 'u1_l08',
    leveled: { title: '소개 글 짜임에 맞게 쓰기', levels: {
      읽기: { q: '소개 글은 \'처음-가운데-끝\' 중 무엇으로 시작하면 좋을까요?', a: '처음(인사·이름)' },
      쓰기: { q: '\'안녕하세요, 저는 ◯◯입니다.\'로 소개 글 첫 문장을 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '내가 쓴 소개 글 첫 부분을 짝에게 읽어 줘요.', a: '여러 답', open: true } } },
    offline: { title: '소개 글 함께 다듬기 짝 활동', type: 'pair', goal: '짜임에 맞게 써요', body: '짝과 소개 글을 바꿔 읽고 \'처음-가운데-끝\'이 있는지 확인해 줘요.', materials: ['공책'], minutes: 7 },
    exit: { items: [{ q: '소개 글은 어떤 순서로 쓰나요?', a: '처음-가운데-끝' }, { q: '처음에는 무엇을 쓰나요?', a: '인사와 이름' }, { q: '가운데에는 무엇을 쓰나요?', a: '소개할 내용과 까닭' }],
      self: ['짜임에 맞게 소개 글을 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['소개 글을 어떤 순서로 쓰면 좋을까?'], watch: '글 짜임 이해·쓰기', min: 3 } },

  u1_l10: { img: 'assets/photo/korean/g2_write_intro2.jpg', review: [{ q: '소개 글은 어떤 순서로?', a: '처음-가운데-끝' }, { q: '처음에는 무엇을?', a: '인사와 이름' }], from: 'u1_l09',
    leveled: { title: '다듬고 바르게 발표하기', levels: {
      읽기: { q: '발표할 때 목소리는 어떻게 하면 좋을까요?', a: '또렷하고 알맞은 크기로' },
      쓰기: { q: '소개 글에서 고칠 곳 한 군데를 찾아 바르게 고쳐 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '바른 자세로 내 소개 글을 발표해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '발표 연습 짝 활동', type: 'pair', goal: '바른 발표를 연습해요', body: '짝 앞에서 소개 글을 발표하고, 짝은 좋았던 점 한 가지를 말해 줘요.', materials: ['공책'], minutes: 7 },
    exit: { items: [{ q: '발표 전에 글을 어떻게 하나요?', a: '다듬어요' }, { q: '바른 발표 자세는?', a: '허리를 펴고 또렷하게' }, { q: '들을 때는 어떻게?', a: '끝까지 잘 들어요' }],
      self: ['소개 글을 다듬어 발표할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['친구들이 잘 들으려면 어떻게 발표할까?'], watch: '다듬기·바른 발표', min: 3 } },

  u1_l11: { img: 'assets/photo/korean/g2_intro_others1.jpg', review: [{ q: '발표 전에 글을 어떻게?', a: '다듬어요' }, { q: '바른 발표 자세는?', a: '허리를 펴고 또렷하게' }], from: 'u1_l10',
    leveled: { title: '주변 사람 소개할 내용 정하기', levels: {
      읽기: { q: '\'우리 이모는 요리를 잘합니다.\'는 그 사람의 무엇을 알려 주나요?', a: '잘하는 것' },
      쓰기: { q: '소개하고 싶은 사람의 좋은 점 한 가지를 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '소개하고 싶은 사람이 누구이고 왜인지 짝에게 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '누구를 소개할까 짝 활동', type: 'pair', goal: '소개할 사람을 정해요', body: '짝과 서로 소개하고 싶은 사람과 그 좋은 점을 한 가지씩 말해 주고 정해요.', materials: ['소개 카드'], minutes: 7 },
    exit: { items: [{ q: '주변 사람을 소개할 때 무엇을 알려 주나요?', a: '그 사람의 좋은 점' }, { q: '소개할 사람으로 누가 있을까요?', a: '가족·친구 등' }, { q: '소개 전에 할 일은?', a: '알려 줄 내용을 정해요' }],
      self: ['소개할 사람과 내용을 정할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['소개하고 싶은 사람의 어떤 점을 알려 주고 싶어?'], watch: '대상·내용 선정', min: 3 } },

  u1_l12: { img: 'assets/photo/korean/g2_intro_others2.jpg', review: [{ q: '주변 사람을 소개할 때 무엇을?', a: '그 사람의 좋은 점' }, { q: '소개 전에 할 일은?', a: '알려 줄 내용을 정해요' }], from: 'u1_l11',
    leveled: { title: '소개하고 질문 나누기', levels: {
      읽기: { q: '친구의 소개를 듣고 궁금한 점을 어떻게 물으면 좋을까요?', a: '고운 말로 질문해요' },
      쓰기: { q: '친구 소개를 듣고 물어볼 질문 한 가지를 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '내가 정한 사람을 짝에게 소개하고, 짝의 질문에 답해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '소개 발표·질문 짝 활동', type: 'pair', goal: '소개하고 질문을 나눠요', body: '짝에게 주변 사람을 소개하고, 서로 한 가지씩 질문하고 답해요.', materials: [], minutes: 7 },
    exit: { items: [{ q: '소개를 들은 뒤 무엇을 하나요?', a: '궁금한 점을 질문해요' }, { q: '질문할 때 말투는?', a: '고운 말' }, { q: '소개를 들을 때는?', a: '끝까지 잘 들어요' }],
      self: ['소개하고 질문을 나눌 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['친구 소개를 듣고 무엇을 물어보면 좋을까?'], watch: '소개 발표·경청·질문 종합', min: 3 } },

  u1_l13: { img: 'assets/photo/korean/g2_review1.jpg', review: [{ q: '소개를 들은 뒤 무엇을?', a: '궁금한 점을 질문해요' }, { q: '소개를 들을 때는?', a: '끝까지 잘 들어요' }], from: 'u1_l12',
    leveled: { title: '단원을 돌아보며 확인하기', levels: {
      읽기: { q: '\'말차례를 지켜 대화합니다.\'가 바른 문장인지 읽고 판단해 볼까요?', a: '네, 바른 문장' },
      쓰기: { q: '이 단원에서 배운 것 한 가지를 문장으로 써 볼까요?', a: '여러 답', open: true },
      말하기: { q: '가장 기억에 남는 것을 짝에게 말해 봐요.', a: '여러 답', open: true } } },
    offline: { title: '배운 것 나누기 짝 활동', type: 'pair', goal: '단원을 함께 정리해요', body: '짝과 번갈아 이 단원에서 배운 것을 하나씩 말하며 정리해요.', materials: [], minutes: 6 },
    exit: { items: [{ q: '대화할 때 지킬 것은?', a: '말차례' }, { q: '소개 글에 담는 것은?', a: '이름·좋아하는 것 등' }, { q: '들을 때 바른 자세는?', a: '끝까지 잘 들어요' }],
      self: ['배운 것을 스스로 확인할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['이 단원에서 가장 도움이 된 것은 무엇일까?'], watch: '단원 자기점검', min: 3 } },

  u1_l14: { img: 'assets/photo/korean/g2_basics1.jpg', review: [{ q: '대화할 때 지킬 것은?', a: '말차례' }, { q: '소개 글에 담는 것은?', a: '이름·좋아하는 것 등' }], from: 'u1_l13',
    leveled: { title: '바른 문장과 문장 부호', levels: {
      읽기: { q: '\'저는 책을 좋아합니다\' 끝에는 어떤 부호가 어울릴까요?', a: '마침표(.)' },
      쓰기: { q: '\'너도 책을 좋아하니\' 끝에 알맞은 부호를 넣어 써 볼까요?', a: '물음표(?)' },
      말하기: { q: '느낌을 담은 짧은 문장을 만들어 말해 봐요.', a: '여러 답 (예: 정말 재미있어!)', open: true } } },
    offline: { title: '문장 부호 짝 놀이', type: 'pair', goal: '문장에 알맞은 부호를 넣어요', body: '짝이 문장을 말하면 다른 짝이 어울리는 부호(마침표·물음표·느낌표)를 말해 줘요.', materials: ['부호 카드'], minutes: 6 },
    exit: { items: [{ q: '알리는 문장 끝에는?', a: '마침표(.)' }, { q: '묻는 문장 끝에는?', a: '물음표(?)' }, { q: '느낌 문장 끝에는?', a: '느낌표(!)' }],
      self: ['문장을 바르게 끝맺을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { ask: ['문장은 어떻게 끝맺을까?'], watch: '문장 부호로 바른 문장 마무리', min: 3 } }
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

// ── 저작권 가드 자체검증 (지도서 제재·예문 미포함) ──
const guardBad = [];
const BANNED_SRC = ['용기를 내', '비닐장갑'];  // 지도서 제재 제목/키워드 — 증보 텍스트에 절대 미포함
Object.keys(AUG).forEach(key => {
  L[key].slides.forEach(s => {
    if (['leveled_problem', 'exit_ticket', 'review', 'offline_activity'].includes(s.block)) {
      const txt = JSON.stringify(s.data);
      BANNED_SRC.forEach(t => { if (txt.includes(t)) guardBad.push(key + ':' + s.block + ' 지도서 제재 노출:' + t); });
    }
  });
});
if (guardBad.length) { console.error('저작권 가드 위반:', guardBad); process.exit(1); }

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

console.log('✅ g2 국어 u1 「만나서 반가워요!」 증보 완료 (14차시 · 국어 §7 · 저작권 가드 통과)');
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
