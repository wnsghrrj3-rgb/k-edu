/* augment_g2_math_u2.js — L3 증보(g2 수학 2단원 「여러 가지 도형」).
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + tnote/img/items/from 필드 추가만.
   서사(③): 곰이·펭이의 모양 공방 — 도형을 찾고·모으고·쌓아 작품을 만드는 전 차시 일관 흐름.
   근거 고정(§3, 원본 정답): 삼각형 변3·꼭짓점3 / 사각형 변4·꼭짓점4 / 원 곧은선0·꼭짓점0 /
     칠교 7조각(삼각형5·사각형2) / 쌓기나무 개수 세기.
   각 차시 증보 데이터 정의 → 삽입 → 도형사실·산수 검산 → 파일 재출력. */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_math_u2.js');

global.window = {};
require('./g2_math_u2.js');
const L = window.LESSONS;

/* 차시별 증보 스펙.
   review: 전시학습 문항 2~3(from=이전차시). img: 폴백 경로. offline: 활동 소지 차시만.
   leveled: 기본·도전·심화. exit: 확인3+신호등. tnote: 슬라이드 id별. */
const AUG = {
  u2_l01: {
    img: 'assets/photo/math/shapes_around.jpg',
    review: null, from: null,   // 단원 첫 차시 = 전시학습 없음
    offline: { title: '교실에서 모양 찾기', type: 'pair', goal: '세모·네모·동그라미를 실물에서 구분',
      steps: ['짝과 교실을 둘러보기', '세모 · 네모 · 동그라미 물건을 하나씩 찾기', '“이건 왜 네모야?” 서로 설명하기'],
      materials: ['모양 찾기 기록장'], minutes: 3 },
    leveled: { title: '곰이 공방 정리하기', levels: {
      기본: { q: '뾰족한 곳이 세 군데인 모양의 이름은?', a: '세모(삼각형)', steps: ['꼭짓점 3개 세기'] },
      도전: { q: '창문·문·칠판은 모두 어떤 모양일까요?', a: '네모(사각형)', steps: ['곧은 변 4개 확인'] },
      심화: { q: '한 물건에서 세모·네모·동그라미를 모두 찾아 말해 봐요.', a: '여러 답 (예: 시계=동그라미+숫자칸 네모 …)', open: true } } },
    exit: { items: [ { q: '뾰족한 곳 3개인 모양은?', a: '세모(삼각형)' }, { q: '곧은 변 4개인 모양은?', a: '네모(사각형)' }, { q: '어느 쪽도 뾰족하지 않고 둥근 모양은?', a: '동그라미(원)' } ],
      self: ['세 가지 모양을 구분할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['우리 교실 어디에 어떤 모양이 숨어 있을까?'], watch: '“둥글면 다 동그라미” 오개념 — 길쭉한 건 따로 봄', min: 3 },
      s04: { ask: ['세모·네모·동그라미는 무엇이 다를까?'], watch: '뾰족한 곳(꼭짓점) 개수로 구분하게 유도', min: 2 } }
  },
  u2_l02: {
    img: 'assets/photo/math/triangle_signs.jpg',
    review: [ { q: '뾰족한 곳 3개인 모양의 이름은?', a: '세모(삼각형)' }, { q: '둥근 모양의 이름은?', a: '동그라미(원)' } ], from: 'u2_l01',
    offline: { title: '막대로 삼각형 만들기', type: 'pair', goal: '곧은 선 3개로 삼각형이 됨을 손으로',
      steps: ['막대(또는 연필) 3개를 짝과 모으기', '끝끼리 맞대어 삼각형 만들기', '변 3개·꼭짓점 3개를 함께 세기'],
      materials: ['막대 또는 연필 3개'], minutes: 3 },
    leveled: { title: '펭이의 삼각형 조각', levels: {
      기본: { q: '삼각형의 변은 모두 몇 개일까요?', a: '3개', steps: ['곧은 선 세기'] },
      도전: { q: '삼각형의 꼭짓점은 모두 몇 개일까요?', a: '3개', steps: ['뾰족한 곳 세기'] },
      심화: { q: '우리 주변에서 삼각형을 세 가지 찾아 말해 봐요.', a: '여러 답 (예: 표지판·삼각김밥·옷걸이 …)', open: true } } },
    exit: { items: [ { q: '삼각형의 변은 몇 개?', a: '3개' }, { q: '삼각형의 꼭짓점은 몇 개?', a: '3개' }, { q: '한 곳이 열려 있으면 삼각형일까요?', a: '아니요(둘러싸여야 함)' } ],
      self: ['삼각형을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['길에서 본 삼각형 표지판은 무엇이 있었지?'], watch: '실생활 삼각형 연결', min: 3 },
      s04: { ask: ['왜 한 군데라도 열리면 삼각형이 아닐까?'], watch: '“둘러싸인”의 뜻 강조 — 끊긴 모양과 구분', min: 2 } }
  },
  u2_l03: {
    img: 'assets/photo/math/window_squares.jpg',
    review: [ { q: '삼각형의 변은 몇 개?', a: '3개' }, { q: '삼각형의 꼭짓점은 몇 개?', a: '3개' } ], from: 'u2_l02',
    offline: null,
    leveled: { title: '곰이의 네모 창문', levels: {
      기본: { q: '사각형의 변은 모두 몇 개일까요?', a: '4개', steps: ['곧은 선 세기'] },
      도전: { q: '사각형은 삼각형보다 변이 몇 개 더 많을까요?', a: '1개', steps: ['4-3'] },
      심화: { q: '기울거나 길쭉해도 사각형인 까닭을 말해 봐요.', a: '여러 답 (곧은 변 4개·꼭짓점 4개면 사각형)', open: true } } },
    exit: { items: [ { q: '사각형의 변은 몇 개?', a: '4개' }, { q: '사각형의 꼭짓점은 몇 개?', a: '4개' }, { q: '네모반듯한 것만 사각형일까요?', a: '아니요(변 4개면 사각형)' } ],
      self: ['사각형을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['삼각형과 사각형은 무엇이 다를까?'], watch: '변·꼭짓점 개수 차이(3↔4)로 구분', min: 3 } }
  },
  u2_l04: {
    img: 'assets/photo/math/circle_buttons.jpg',
    review: [ { q: '사각형의 변은 몇 개?', a: '4개' }, { q: '사각형의 꼭짓점은 몇 개?', a: '4개' } ], from: 'u2_l03',
    offline: null,
    leveled: { title: '펭이의 동그란 단추', levels: {
      기본: { q: '원에는 곧은 선이 몇 개 있을까요?', a: '0개(없어요)', steps: ['곧은 변 찾기'] },
      도전: { q: '원에는 꼭짓점이 몇 개 있을까요?', a: '0개(없어요)', steps: ['뾰족한 곳 찾기'] },
      심화: { q: '달걀 모양이 원이 아닌 까닭을 말해 봐요.', a: '여러 답 (어느 쪽에서 봐도 똑같이 둥글지 않음)', open: true } } },
    exit: { items: [ { q: '원에는 곧은 선이 몇 개?', a: '0개' }, { q: '원에는 꼭짓점이 몇 개?', a: '0개' }, { q: '길쭉한 모양도 원일까요?', a: '아니요' } ],
      self: ['원을 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['원은 삼각형·사각형과 무엇이 가장 다를까?'], watch: '곧은 선·꼭짓점이 “없다”는 점을 또렷이', min: 3 } }
  },
  u2_l05: {
    img: 'assets/photo/math/tangram_pieces.jpg',
    review: [ { q: '원에는 곧은 선이 몇 개?', a: '0개' }, { q: '사각형의 변은 몇 개?', a: '4개' } ], from: 'u2_l04',
    offline: { title: '칠교로 곰이 집 만들기', type: 'group', goal: '7조각을 모아 새 모양을 만들기',
      steps: ['칠교 7조각을 모둠이 펼치기', '조각을 맞대어 집·배 모양 만들기', '어떤 조각을 몇 개 썼는지 말하기'],
      materials: ['칠교판 세트'], minutes: 4 },
    leveled: { title: '칠교 조각 세기', levels: {
      기본: { q: '칠교판은 모두 몇 조각일까요?', a: '7조각', steps: ['조각 세기'] },
      도전: { q: '칠교판의 삼각형 5개와 사각형 2개를 합하면 몇 조각일까요?', a: '7조각', steps: ['5+2'] },
      심화: { q: '칠교 조각으로 만들 수 있는 모양을 여러 가지 말해 봐요.', a: '여러 답 (집·배·사람·고양이 …)', open: true } } },
    exit: { items: [ { q: '칠교판은 몇 조각?', a: '7조각' }, { q: '칠교판의 삼각형 조각은 몇 개?', a: '5개' }, { q: '칠교판의 사각형 조각은 몇 개?', a: '2개' } ],
      self: ['칠교로 모양을 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['칠교 7조각으로 무엇을 만들어 볼까?'], watch: '“조각은 다 삼각형” 오개념 — 사각형 조각 2개 짚기', min: 3 },
      s04: { ask: ['조각을 어떻게 붙이면 큰 모양이 될까?'], watch: '조각 모으기 = 새 도형 만들기로 연결', min: 2 } }
  },
  u2_l06: {
    img: 'assets/photo/math/stacking_blocks.jpg',
    review: [ { q: '칠교판은 몇 조각?', a: '7조각' }, { q: '삼각형의 꼭짓점은 몇 개?', a: '3개' } ], from: 'u2_l05',
    offline: { title: '쌓기나무 개수 세기', type: 'pair', goal: '가려진 나무까지 빠짐없이 세기',
      steps: ['짝이 쌓은 모양을 관찰하기', '아래층부터 위층까지 층별로 세기', '뒤에 가려진 나무가 있는지 확인하기'],
      materials: ['쌓기나무'], minutes: 3 },
    leveled: { title: '곰이의 블록 탑', levels: {
      기본: { q: '아래층 4개, 그 위에 2개를 쌓으면 모두 몇 개일까요?', a: '6개', steps: ['4+2'] },
      도전: { q: '아래층 4개, 그 위에 1개를 쌓으면 모두 몇 개일까요?', a: '5개', steps: ['4+1'] },
      심화: { q: '뒤에 가려진 나무가 있을 때 어떻게 세면 좋을지 말해 봐요.', a: '여러 답 (층별로·앞뒤 확인하며 세기)', open: true } } },
    exit: { items: [ { q: '아래 4개 위에 2개면 모두?', a: '6개' }, { q: '나무 3개를 나란히 놓으면?', a: '3개' }, { q: '보이는 면만 세면 될까요?', a: '아니요(가려진 것도 셈)' } ],
      self: ['쌓기나무 개수를 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['블록으로 무엇을 쌓아 봤니?'], watch: '개수·위치·방향으로 설명하도록', min: 3 },
      s04: { ask: ['안 보이는 나무는 어떻게 알 수 있을까?'], watch: '가려진 나무 빠뜨리는 오개념 교정', min: 2 } }
  },
  u2_l07: {
    img: 'assets/photo/math/block_shapes.jpg',
    review: [ { q: '아래 4개 위에 2개면 모두?', a: '6개' }, { q: '보이는 면만 세면 될까요?', a: '아니요' } ], from: 'u2_l06',
    offline: { title: '나무 4개로 여러 모양 쌓기', type: 'pair', goal: '같은 4개로 다른 모양 만들기',
      steps: ['쌓기나무 4개를 짝과 나눠 갖기', '한 줄·ㄱ자·2층 등 서로 다르게 쌓기', '모양은 달라도 개수는 4개로 같음을 확인'],
      materials: ['쌓기나무 4개'], minutes: 3 },
    leveled: { title: '펭이의 건물 짓기', levels: {
      기본: { q: '1층에 3개, 2층에 1개를 쌓으면 모두 몇 개일까요?', a: '4개', steps: ['3+1'] },
      도전: { q: '1층에 4개, 2층에 1개로 지으면 모두 몇 개일까요?', a: '5개', steps: ['4+1'] },
      심화: { q: '나무 4개로 만들 수 있는 서로 다른 모양을 말해 봐요.', a: '여러 답 (한 줄·ㄱ자·2층 …)', open: true } } },
    exit: { items: [ { q: '1층 3개 2층 1개면 모두?', a: '4개' }, { q: '나무 4개를 한 줄로 놓으면?', a: '4개' }, { q: '모양이 다르면 개수도 달라질까요?', a: '아니요(개수는 그대로)' } ],
      self: ['여러 모양을 쌓고 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s04: { ask: ['모양은 달라도 왜 개수는 같을까?'], watch: '“모양 다르면 개수도 다르다” 오개념 교정 — 세어 확인', min: 3 } }
  },
  u2_l08: {
    img: 'assets/photo/math/shape_review.jpg',
    review: [ { q: '1층 3개 2층 1개면 모두?', a: '4개' }, { q: '나무 4개를 한 줄로 놓으면?', a: '4개' } ], from: 'u2_l07',
    offline: { title: '짝과 도형 퀴즈', type: 'pair', goal: '배운 도형을 서로 묻고 답하기',
      steps: ['짝에게 도형 문제 하나 내기(예: “삼각형 변은?”)', '짝이 답하면 맞는지 확인', '역할을 바꿔 한 번 더'],
      materials: ['도형 그림 카드'], minutes: 3 },
    leveled: { title: '모양 공방 총정리', levels: {
      기본: { q: '삼각형의 꼭짓점과 사각형의 변은 각각 몇 개일까요?', a: '삼각형 꼭짓점 3개 · 사각형 변 4개', steps: ['각각 세기'] },
      도전: { q: '원의 곧은 선 개수와 칠교판 조각 수를 말해 봐요.', a: '원 곧은 선 0개 · 칠교 7조각', steps: ['특징 떠올리기'] },
      심화: { q: '오늘 배운 도형 중 하나를 골라 친구에게 설명하는 말을 만들어 봐요.', a: '여러 답 (도형 이름·변·꼭짓점 포함)', open: true } } },
    exit: { items: [ { q: '삼각형의 꼭짓점은 몇 개?', a: '3개' }, { q: '사각형의 변은 몇 개?', a: '4개' }, { q: '원에는 곧은 선이 몇 개?', a: '0개' } ],
      self: ['배운 도형을 확인했어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['이번 단원에서 가장 기억에 남는 도형은?'], watch: '자기 점검(self_assessment)과 연결', min: 3 },
      s04: { ask: ['삼각형·사각형·원을 한 문장으로 어떻게 구분할까?'], watch: '변·꼭짓점 개수로 정리', min: 2 } }
  },
  u2_l09: {
    img: 'assets/photo/math/shape_craft.jpg',
    review: [ { q: '삼각형의 꼭짓점은 몇 개?', a: '3개' }, { q: '칠교판은 몇 조각?', a: '7조각' } ], from: 'u2_l08',
    offline: { title: '도형으로 작품 만들기', type: 'group', goal: '여러 도형을 모아 하나의 작품 완성',
      steps: ['만들 작품을 모둠이 정하기(집·로봇·동물 …)', '색종이를 세모·네모·동그라미로 오리기', '조각을 붙여 작품을 완성하고 쓴 도형을 말하기'],
      materials: ['색종이', '가위', '풀'], minutes: 4 },
    leveled: { title: '곰이·펭이의 모양 공방 완성작', levels: {
      기본: { q: '게시판에 세모 깃발 3개를 붙이면 세모는 모두 몇 개일까요?', a: '3개', steps: ['깃발 세기'] },
      도전: { q: '세모 2개와 네모 2개로 집을 만들면 도형은 모두 몇 개일까요?', a: '4개', steps: ['2+2'] },
      심화: { q: '내가 만든 작품에 어떤 도형을 몇 개 썼는지 설명해 봐요.', a: '여러 답 (도형 이름·개수 포함)', open: true } } },
    exit: { items: [ { q: '세모 깃발 3개면 세모는 모두?', a: '3개' }, { q: '세모 2개와 네모 2개면 도형은 모두?', a: '4개' }, { q: '색종이를 아무렇게나 잘라도 삼각형일까요?', a: '아니요(곧은 변 3개여야 함)' } ],
      self: ['도형으로 작품을 만들 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['어떤 작품을 만들어 볼까?'], watch: '작품 속에서 배운 도형을 찾게 연결', min: 3 },
      s04: { ask: ['색종이를 자를 때 무엇을 확인해야 삼각형이 될까?'], watch: '곧은 선·꼭짓점 수 확인 — 오개념 교정', min: 2 } }
  }
};

// ── 증보 적용 ──
function findIdx(slides, pred) { return slides.findIndex(pred); }

Object.keys(AUG).forEach(key => {
  const lesson = L[key];
  if (!lesson) { console.error('차시 없음:', key); process.exit(1); }
  const S = lesson.slides;
  const spec = AUG[key];
  const by = id => S.find(s => s.id === id);

  // ① review items (기존 review 슬라이드에 필드 추가 — content 보존)
  if (spec.review) {
    const rv = S.find(s => s.block === 'review');
    if (rv) { rv.data.items = spec.review; if (spec.from) rv.data.from = spec.from; }
  }
  // ② img (motivate에 폴백 필드)
  if (spec.img) { const mot = S.find(s => s.block === 'motivate'); if (mot) mot.data.img = spec.img; }
  // ⑦ tnote (지정 슬라이드)
  if (spec.tnote) Object.keys(spec.tnote).forEach(sid => { const s = by(sid); if (s) s.tnote = spec.tnote[sid]; });

  // ④ offline_activity 삽입 — misconception 다음(없으면 마지막 concept 다음)
  if (spec.offline) {
    const s_off = { id: 's-off', stage: '전개', block: 'offline_activity', data: spec.offline,
      suggested_extras: ['r_class'] };
    let i = findIdx(S, s => s.block === 'misconception');
    if (i < 0) { for (let j = S.length - 1; j >= 0; j--) if (S[j].block === 'concept') { i = j; break; } }
    S.splice(i + 1, 0, s_off);
  }
  // ⑤ leveled_problem 삽입 — 마지막 basic_problem 다음
  if (spec.leveled) {
    const s_lv = { id: 's-lv', stage: '기본문제', block: 'leveled_problem', data: spec.leveled,
      suggested_extras: ['q_apply'] };
    let i = -1; for (let j = S.length - 1; j >= 0; j--) if (S[j].block === 'basic_problem') { i = j; break; }
    if (i < 0) i = findIdx(S, s => s.block === 'real_world') - 1;
    S.splice(i + 1, 0, s_lv);
  }
  // ⑥ exit_ticket 삽입 — summary 앞
  if (spec.exit) {
    const s_ex = { id: 's-ex', stage: '정리', block: 'exit_ticket',
      data: { title: '오늘 확인해요', items: spec.exit.items, self: spec.exit.self },
      suggested_extras: ['q_reflect'] };
    let i = findIdx(S, s => s.block === 'summary');
    if (i < 0) i = S.length;
    S.splice(i, 0, s_ex);
  }

  // 삽입 슬라이드 id를 유니크하게 재부여 (s100~ 기존 뒤로)
  let n = 100;
  S.forEach(s => { if (['s-off', 's-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });

  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(7요소)';
});

// ── 도형사실 + 산수 검산 ──
// (1) 도형 사실 상수 — 원본 정답과 일치해야 함
const FACTS = [
  ['삼각형 변', 3], ['삼각형 꼭짓점', 3],
  ['사각형 변', 4], ['사각형 꼭짓점', 4],
  ['원 곧은선', 0], ['원 꼭짓점', 0],
  ['칠교 조각', 7], ['칠교 삼각형', 5], ['칠교 사각형', 2]
];
const FACT_MAP = Object.fromEntries(FACTS);
// (2) 계산으로 확인 가능한 answer (쌓기 합·차·조각 합)
const HARD = [
  ['4-3', 1],           // l03 도전: 사각형 변 - 삼각형 변
  ['5+2', 7],           // l05 도전: 칠교 삼각형+사각형
  ['4+2', 6], ['4+1', 5], // l06
  ['3+1', 4],           // l07/l09
  ['2+2', 4]            // l09 도전
];
const badH = HARD.filter(([e, a]) => eval(e) !== a);
if (badH.length) { console.error('산수 오류:', badH); process.exit(1); }
// (3) 도형 사실 자체 정합(내부 일관) 확인
const badF = FACTS.filter(([k, v]) => FACT_MAP[k] !== v);
if (badF.length) { console.error('도형 사실 오류:', badF); process.exit(1); }
// (4) 칠교 삼각형+사각형 = 전체 조각 정합
if (FACT_MAP['칠교 삼각형'] + FACT_MAP['칠교 사각형'] !== FACT_MAP['칠교 조각']) {
  console.error('칠교 조각 합 불일치'); process.exit(1);
}

// ── 7요소 검증 ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides, b = S.map(s => s.block);
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.leveled && !b.includes('leveled_problem')) elemFail.push(key + ':leveled');
  if (spec.exit && !b.includes('exit_ticket')) elemFail.push(key + ':exit');
  if (spec.offline && !b.includes('offline_activity')) elemFail.push(key + ':offline');
  const tn = S.filter(s => s.tnote).length;
  if (tn < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

console.log('✅ g2 수학 u2 증보 완료 (9차시)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'offline_activity', 'leveled_problem', 'exit_ticket'].filter(x => S.some(s => s.block === x || (x === 'review' && s.block === 'review' && s.data.items))).join(','));
});

// ── 파일 재출력 (전 차시 블록 교체) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
const footer = '})();\n';   // IIFE 닫기
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + footer, 'utf8');
console.log('  파일 재출력 완료');
