/* augment_g2_math_u6.js — L3 증보(g2 수학 6단원 「곱셈」).
   원칙(밀도표준 v2 §5): 기존 슬라이드 본문 diff-0. 신규 슬라이드 삽입 + tnote/img/items/from 필드 추가만.
   레시피 원본 = augment_g2_math_u1.js(일반 개념형 7요소). offline은 활동 소지 차시만(l01 도입·l08 평가 제외).
   서사(③): 곰이·펭이 텃밭·학교 — 기존 12슬 서사 계승(텃밭→딱지→체육관→쌓기나무→막대→급식실 컵→발표회 소고→평가→곤충 카드).
   ★곱셈구구 전 단계 규약(파일 헤더 계승): 곱은 동수누가·뛰어 세기로 구한다. ×기호는 l06 도입 이후 차시에서만 학생 노출 문구에 사용,
     l01~l05 증보 텍스트는 '몇씩 몇 묶음'·'몇의 몇 배'·뛰어 세기 표현만 사용(선행 노출 금지).
   근거 고정(§3, 학생 본 차시 검증 수 계승): 5씩4=20 · 3씩6=18 · 3씩4=12 · 15를 5씩=3묶음 · 6씩4=24 · 2의4배=8 ·
     6의4배=24 · 2칸의3배=6칸 · 8칸=2칸의4배 · 2×7=14 · 5×3=15 · 4×6=24 · 2×5=10 · 4×3=12 · 6×3=18 · 2×6=12 · 5×7=35 · 3×5=15 · 3×2=6.
   각 차시 증보 데이터 정의 → 삽입 → 산수 검산 → 파일 재출력(IIFE 보존). */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g2_math_u6.js');

global.window = {};
require('./g2_math_u6.js');
const L = window.LESSONS;

/* 차시별 증보 스펙.
   review: 전시학습 문항 2~3(from=이전차시). img: 폴백 경로. offline: 활동 소지 차시만.
   leveled: 기본·도전·심화. exit: 확인3+신호등. tnote: 슬라이드 id별. */
const AUG = {
  u6_l01: {
    img: 'assets/photo/math/garden_tomato.jpg',
    review: null, from: null,   // 단원 첫 차시 = 전시학습 없음
    offline: null,              // 단원 도입 = 예고 중심
    leveled: { title: '텃밭에서 묶어 세기', levels: {
      기본: { q: '토마토가 5개씩 3줄로 열렸어요. 모두 몇 개일까요?', a: '15개', steps: ['5, 10, 15 → 15개'] },
      도전: { q: '색연필을 3씩 6묶음으로 묶으면 모두 몇 자루일까요?', a: '18자루', steps: ['3, 6, 9, 12, 15, 18 → 18자루'] },
      심화: { q: '교실에서 묶어 세면 좋은 물건을 찾아 몇씩 몇 묶음인지 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '많은 물건을 빠르게 세는 방법은?', a: '같은 수로 묶어 세기' }, { q: '5씩 4묶음이면 모두?', a: '20개' }, { q: '5씩 뛰어 세면 5 다음은?', a: '10' } ],
      self: ['묶어 세기를 할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['이 많은 것을 하나씩 세면 어떨까?', '몇 개씩 묶으면 세기 편할까?'], watch: '“많다”에서 멈추는 반응 — 같은 수로 묶는 쪽으로 유도', min: 3 },
      s07: { ask: ['5씩 4묶음을 어떻게 세었니?'], watch: '하나씩 세기로 되돌아가는 학생 — 뛰어 세기로 다시', min: 2 } }
  },
  u6_l02: {
    img: 'assets/photo/math/ttakji_pile.jpg',
    review: [ { q: '많은 물건을 빠르게 세려면?', a: '같은 수로 묶어 세기' }, { q: '5씩 4묶음이면 모두?', a: '20개' } ], from: 'u6_l01',
    offline: { title: '딱지 묶어 세기', type: 'pair', goal: '같은 수로 묶어야 뛰어 셀 수 있음을 손으로',
      steps: ['딱지 카드 12장을 짝과 펼치기', '3장씩 한 묶음으로 모으기', '3, 6, 9, 12 뛰어 세며 확인하기'],
      materials: ['딱지 카드 12장'], minutes: 4 },
    leveled: { title: '어떻게 세면 편할까', levels: {
      기본: { q: '딱지를 3씩 4묶음으로 묶으면 모두 몇 장일까요?', a: '12장', steps: ['3, 6, 9, 12 → 12장'] },
      도전: { q: '구슬 15개를 5씩 묶으면 몇 묶음일까요?', a: '3묶음', steps: ['5, 10, 15 → 3묶음'] },
      심화: { q: '딱지 24장을 세는 나만의 묶음 방법을 정해 말해 봐요.', a: '여러 답 (예: 4씩 6묶음, 6씩 4묶음)', open: true } } },
    exit: { items: [ { q: '뛰어 세려면 어떻게 묶어야 할까요?', a: '같은 수로' }, { q: '3씩 4묶음은 모두?', a: '12장' }, { q: '구슬 15개를 5씩 묶으면?', a: '3묶음' } ],
      self: ['세 가지 세기 방법을 견줄 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['하나씩 세면 무엇이 힘들까?'], watch: '“정확하니까 하나씩”에 머무는 학생 — 시간·빠뜨림으로 견주기', min: 2 },
      s06: { ask: ['들쭉날쭉 묶으면 왜 뛰어 세기 어려울까?'], watch: '묶음 크기가 다르면 뛰어 세기가 무너짐을 손으로 확인', min: 3 } }
  },
  u6_l03: {
    img: 'assets/photo/math/gym_balls.jpg',
    review: [ { q: '3씩 4묶음은 모두?', a: '12장' }, { q: '뛰어 세려면 어떻게 묶나요?', a: '같은 수로' } ], from: 'u6_l02',
    offline: { title: '공 20개를 두 가지로 묶기', type: 'group', goal: '같은 양도 여러 방법으로 묶을 수 있음',
      steps: ['모둠이 공 그림 카드 20장을 펼치기', '5씩 묶어 세고 묶음 수 적기', '4씩 다시 묶어 세고 견주기'],
      materials: ['공 그림 카드 20장'], minutes: 5 },
    leveled: { title: '몇씩 몇 묶음', levels: {
      기본: { q: '5씩 4묶음이면 공은 모두 몇 개일까요?', a: '20개', steps: ['5, 10, 15, 20 → 20개'] },
      도전: { q: '같은 공 20개를 4씩 묶으면 몇 묶음일까요?', a: '5묶음', steps: ['4, 8, 12, 16, 20 → 5묶음'] },
      심화: { q: '24개를 묶는 방법을 두 가지 찾아 말해 봐요.', a: '여러 답 (예: 6씩 4묶음, 4씩 6묶음)', open: true } } },
    exit: { items: [ { q: '5씩 4묶음은 모두?', a: '20개' }, { q: '공 20개를 4씩 묶으면?', a: '5묶음' }, { q: '묶는 수가 커지면 묶음 수는?', a: '적어져요' } ],
      self: ['몇씩 몇 묶음으로 셀 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['곰이와 펭이 중 누구 말이 맞을까?'], watch: '한쪽만 정답으로 고르려는 반응 — 둘 다 20개임을 확인', min: 3 },
      s05: { ask: ['묶는 수를 키우면 묶음 수는 어떻게 될까?'], watch: '묶음 크기와 묶음 수가 반대로 움직임', min: 2 } }
  },
  u6_l04: {
    img: 'assets/photo/math/blocks_tower.jpg',
    review: [ { q: '5씩 4묶음은 모두?', a: '20개' }, { q: '공 20개를 4씩 묶으면?', a: '5묶음' } ], from: 'u6_l03',
    offline: { title: '쌓기나무로 배 만들기', type: 'pair', goal: '기준이 몇 번 들어가는지 = 배',
      steps: ['짝과 쌓기나무 2개로 기준 탑 쌓기', '기준 탑을 3번 이어 쌓기', '“2의 3배는 6” 함께 말하기'],
      materials: ['쌓기나무 8개'], minutes: 4 },
    leveled: { title: '몇의 몇 배', levels: {
      기본: { q: '2씩 4묶음은 2의 몇 배일까요?', a: '4배', steps: ['2가 4번 들어감 → 2의 4배'] },
      도전: { q: '6의 4배는 모두 몇 개일까요?', a: '24개', steps: ['6, 12, 18, 24 → 24개'] },
      심화: { q: '8개를 서로 다른 배로 말하는 방법을 찾아 봐요.', a: '여러 답 (예: 2의 4배, 4의 2배, 8의 1배)', open: true } } },
    exit: { items: [ { q: '4씩 3묶음은 4의 몇 배?', a: '3배' }, { q: '6의 4배는 모두?', a: '24개' }, { q: '8의 1배는?', a: '8' } ],
      self: ['몇의 몇 배로 말할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['4배 높이라는 말은 무슨 뜻일까?'], watch: '“더 높다”에서 멈추지 않게 — 기준 탑이 몇 번인지로', min: 3 },
      s06: { ask: ['8의 1배는 얼마일까?'], watch: '배는 무조건 커진다는 오해 — 1배는 그대로', min: 2 } }
  },
  u6_l05: {
    img: 'assets/photo/math/color_rods.jpg',
    review: [ { q: '2씩 4묶음은 2의 몇 배?', a: '4배' }, { q: '6의 4배는 모두?', a: '24개' } ], from: 'u6_l04',
    offline: { title: '막대로 몇 배 재기', type: 'pair', goal: '짧은 막대가 몇 번 들어가는지로 배 말하기',
      steps: ['짝과 2칸 막대·긴 막대 고르기', '짧은 막대를 이어 대며 몇 번인지 세기', '“긴 막대는 2칸의 ○배”라고 말하기'],
      materials: ['색 막대(2칸·6칸·8칸)'], minutes: 4 },
    leveled: { title: '길이와 양의 배', levels: {
      기본: { q: '2칸 막대의 3배는 몇 칸일까요?', a: '6칸', steps: ['2, 4, 6 → 6칸'] },
      도전: { q: '8칸은 2칸의 몇 배일까요?', a: '4배', steps: ['2칸이 4번 들어감 → 4배'] },
      심화: { q: '교실에서 다른 물건의 몇 배가 되는 물건을 찾아 말해 봐요.', a: '여러 답', open: true } } },
    exit: { items: [ { q: '2칸 막대의 3배는?', a: '6칸' }, { q: '8칸은 2칸의 몇 배?', a: '4배' }, { q: '구슬 5개의 2배는?', a: '10개' } ],
      self: ['길이와 양을 몇 배로 견줄 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['펭이 막대에 곰이 막대가 몇 번 들어갈까?'], watch: '“더 길다”로만 답하는 반응 — 몇 번인지 세도록', min: 3 },
      s06: { ask: ['“3배 길다”와 “더 길다”는 어떻게 다를까?'], watch: '기준을 대어 세는 말하기로 옮기기', min: 2 } }
  },
  u6_l06: {
    img: 'assets/photo/math/cups_rows.jpg',
    review: [ { q: '2칸 막대의 3배는?', a: '6칸' }, { q: '구슬 5개의 2배는?', a: '10개' } ], from: 'u6_l05',
    offline: { title: '컵 줄 세워 곱셈식 만들기', type: 'pair', goal: '같은 수의 덧셈을 곱셈식으로 짧게 쓰기',
      steps: ['짝과 컵 그림 카드를 3개씩 여러 줄로 놓기', '줄 수를 세어 3＋3＋3…으로 말하기', '같은 것을 3×○로 쓰고 소리내어 읽기'],
      materials: ['컵 그림 카드 18장'], minutes: 5 },
    leveled: { title: '곱셈식으로 쓰기', levels: {
      기본: { q: '2×7은 얼마일까요? (2씩 7번)', a: '14', steps: ['2, 4, 6, 8, 10, 12, 14 → 14'] },
      도전: { q: '5＋5＋5를 곱셈식으로 쓰고 답을 구해 봐요.', a: '5×3 = 15', steps: ['5, 10, 15 → 15'] },
      심화: { q: '6×4를 뛰어 세기로 구하고, 어떻게 세었는지 말해 봐요.', a: '24 (세는 방법은 여러 답)', open: true } } },
    exit: { items: [ { q: '3의 6배를 곱셈식으로 쓰면?', a: '3×6' }, { q: '4＋4＋4＋4＋4를 곱셈식으로?', a: '4×5' }, { q: '2×7은?', a: '14' } ],
      self: ['곱셈식을 쓰고 읽을 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['3을 여섯 번 더한 식을 짧게 쓸 방법이 있을까?'], watch: '긴 덧셈식의 불편함을 먼저 겪게', min: 3 },
      s06: { ask: ['3×6의 곱은 어떻게 구할까?'], watch: '외워 답하려는 반응 — 뛰어 세기(3·6·9·12·15·18)로', min: 3 } }
  },
  u6_l07: {
    img: 'assets/photo/math/sogo_drums.jpg',
    review: [ { q: '3의 6배를 곱셈식으로?', a: '3×6' }, { q: '2×7은?', a: '14' } ], from: 'u6_l06',
    offline: { title: '교실 물건 곱셈식 찾기', type: 'group', goal: '한 묶음을 두 가지 곱셈식으로',
      steps: ['모둠이 줄지어 놓인 교실 물건 찾기', '몇씩 몇 묶음인지 세어 곱셈식 쓰기', '묶는 방법을 바꿔 다른 곱셈식도 쓰기'],
      materials: ['모둠 기록판'], minutes: 5 },
    leveled: { title: '여러 곱셈식', levels: {
      기본: { q: '4×6은 얼마일까요?', a: '24', steps: ['4, 8, 12, 16, 20, 24 → 24'] },
      도전: { q: '소고 24개를 나타내는 곱셈식을 두 가지 말해 봐요.', a: '4×6과 6×4 (3×8·8×3도 가능)', steps: ['묶는 방법이 달라지면 곱셈식도 달라져요'] },
      심화: { q: '자전거 5대의 바퀴 수를 곱셈식으로 쓰고 답을 말해 봐요.', a: '2×5 = 10 (설명은 여러 답)', open: true } } },
    exit: { items: [ { q: '4×6은?', a: '24' }, { q: '4×6과 곱이 같은 다른 식은?', a: '6×4' }, { q: '사자 3마리의 다리는 모두?', a: '12개' } ],
      self: ['한 물건을 여러 곱셈식으로 쓸 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['곰이와 펭이의 묶음이 둘 다 맞을 수 있을까?'], watch: '한 가지 식만 정답으로 여기는 반응', min: 3 },
      s05: { ask: ['4×6과 6×4는 무엇이 같고 무엇이 다를까?'], watch: '곱은 같아도 묶는 방법(상황)은 다름', min: 3 } }
  },
  u6_l08: {
    img: 'assets/photo/math/mult_check.jpg',
    review: [ { q: '4×6은?', a: '24' }, { q: '6씩 3묶음을 곱셈식으로?', a: '6×3' } ], from: 'u6_l07',
    offline: null,              // 단원 평가 = 개별 확인 중심
    leveled: { title: '단원 확인', levels: {
      기본: { q: '6씩 3묶음, 6×3은 얼마일까요?', a: '18', steps: ['6, 12, 18 → 18'] },
      도전: { q: '2＋2＋2＋2＋2＋2를 곱셈식으로 쓰고 답을 구해 봐요.', a: '2×6 = 12', steps: ['2, 4, 6, 8, 10, 12 → 12'] },
      심화: { q: '매일 3개씩 5일 동안 만든 수를 곱셈식으로 쓰고 그렇게 쓴 까닭을 말해 봐요.', a: '3×5 = 15 (상황에 맞는 식)', open: true } } },
    exit: { items: [ { q: '6×3은?', a: '18' }, { q: '5×7은?', a: '35' }, { q: '3개씩 5일이면 곱셈식은?', a: '3×5' } ],
      self: ['배운 곱셈을 스스로 확인했어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['묶음·배·곱셈식은 어떻게 이어질까?'], watch: '세 표현을 따로 외운 학생 — 한 그림으로 이어 보이기', min: 3 },
      s07: { ask: ['3개씩 5일을 왜 3×5로 쓸까?'], watch: '곱이 같다고 상황 표현까지 같다고 여기는 반응', min: 3 } }
  },
  u6_l09: {
    img: 'assets/photo/math/garden_insects.jpg',
    review: [ { q: '6×3은?', a: '18' }, { q: '5×7은?', a: '35' } ], from: 'u6_l08',
    offline: { title: '우리 반 곱셈 카드 만들기', type: 'group', goal: '한 그림을 여러 곱셈 표현으로',
      steps: ['모둠이 붙임 스티커를 몇씩 몇 줄로 붙이기', '곱셈식과 덧셈식을 카드에 쓰기', '“3×2 = 3＋3 = 3의 2배” 소리내어 읽기'],
      materials: ['카드 종이', '붙임 스티커'], minutes: 5 },
    leveled: { title: '곱셈 카드', levels: {
      기본: { q: '개미 카드 3×2는 모두 몇 마리일까요?', a: '6마리', steps: ['3, 6 → 6마리'] },
      도전: { q: '나비 카드 4×3은 모두 몇 마리일까요?', a: '12마리', steps: ['4, 8, 12 → 12마리'] },
      심화: { q: '3×2를 나타내는 다른 표현을 모두 말해 봐요.', a: '3＋3 · 3씩 2묶음 · 3의 2배 (여러 답)', open: true } } },
    exit: { items: [ { q: '3×2는?', a: '6' }, { q: '3×2를 덧셈식으로 쓰면?', a: '3＋3' }, { q: '6마리씩 2줄이면 모두?', a: '12마리' } ],
      self: ['한 그림을 여러 곱셈 표현으로 말할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] },
    tnote: { s03: { ask: ['곤충을 셀 때 어떤 마음으로 다가갈까?'], watch: '세기 활동과 생명 존중을 함께', min: 2 },
      s05: { ask: ['같은 그림을 몇 가지 방법으로 말할 수 있을까?'], watch: '표현 한 가지만 고집하는 반응', min: 3 } }
  }
};

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
  // ② img (motivate에 폴백 필드 · 평가차처럼 motivate 없으면 첫 concept)
  if (spec.img) {
    const mot = S.find(s => s.block === 'motivate') || S.find(s => s.block === 'concept');
    if (mot) mot.data.img = spec.img;
  }
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

  // 삽입 슬라이드 id를 유니크하게 재부여 (기존 id 뒤로)
  let n = 100;
  S.forEach(s => { if (['s-off', 's-lv', 's-ex'].includes(s.id)) s.id = 's' + (n++); });

  lesson.meta.lesson_format = (lesson.meta.lesson_format || '') + ' · 40분 표준 증보(7요소)';
});

// ── 산수 검산 (증보 문항의 곱·뛰어 세기 결과) ──
const HARD = [
  ['5*3', 15], ['3*6', 18], ['5*4', 20], ['3*4', 12], ['15/5', 3], ['20/4', 5],
  ['2*4', 8], ['6*4', 24], ['4*3', 12], ['8*1', 8], ['2*3', 6], ['8/2', 4], ['5*2', 10],
  ['2*7', 14], ['5*3', 15], ['4*5', 20], ['4*6', 24], ['6*3', 18], ['2*6', 12], ['5*7', 35],
  ['3*5', 15], ['3*2', 6], ['3+3', 6], ['6*2', 12], ['2*5', 10]
];
const badH = HARD.filter(([e, a]) => eval(e) !== a);
if (badH.length) { console.error('산수 오류:', badH); process.exit(1); }

// ── 뛰어 세기 열(steps) 정합: "a, 2a, 3a … → 마지막 = 곱" 형태 자체 검산 ──
const seqBad = [];
Object.keys(AUG).forEach(key => {
  const sp = AUG[key];
  if (!sp.leveled) return;
  Object.values(sp.leveled.levels).forEach(lv => {
    (lv.steps || []).forEach(st => {
      const m = st.match(/^([\d,\s]+)\s*→/);
      if (!m) return;
      const nums = m[1].split(',').map(x => Number(x.trim())).filter(x => !Number.isNaN(x));
      if (nums.length < 2) return;
      const d = nums[1] - nums[0];
      for (let i = 1; i < nums.length; i++) if (nums[i] - nums[i - 1] !== d) seqBad.push(key + ':' + st);
    });
  });
});
if (seqBad.length) { console.error('뛰어 세기 열 오류:', seqBad); process.exit(1); }

// ── ×기호 선행 노출 금지 검사 (l01~l05 증보 텍스트) ──
const preMul = [];
['u6_l01', 'u6_l02', 'u6_l03', 'u6_l04', 'u6_l05'].forEach(key => {
  const sp = AUG[key];
  const txt = JSON.stringify([sp.review, sp.leveled, sp.exit, sp.offline, sp.tnote]);
  if (/×/.test(txt)) preMul.push(key);
});
if (preMul.length) { console.error('곱셈 기호 선행 노출:', preMul); process.exit(1); }

// ── 7요소 검증 ──
let elemFail = [];
Object.keys(AUG).forEach(key => {
  const S = L[key].slides, b = S.map(s => s.block);
  const spec = AUG[key];
  if (spec.review && !S.some(s => s.block === 'review' && s.data.items)) elemFail.push(key + ':review');
  if (spec.img && !S.some(s => s.data && s.data.img)) elemFail.push(key + ':img');
  if (spec.leveled && !b.includes('leveled_problem')) elemFail.push(key + ':leveled');
  if (spec.exit && !b.includes('exit_ticket')) elemFail.push(key + ':exit');
  if (spec.offline && !b.includes('offline_activity')) elemFail.push(key + ':offline');
  if (S.filter(s => s.tnote).length < 1) elemFail.push(key + ':tnote');
});
if (elemFail.length) { console.error('요소 누락:', elemFail); process.exit(1); }

console.log('✅ g2 수학 u6 「곱셈」 증보 완료 (9차시)');
Object.keys(AUG).forEach(key => {
  const S = L[key].slides;
  console.log('  ' + key + ': ' + S.length + '슬 | tnote ' + S.filter(s => s.tnote).length +
    ' | ' + ['review', 'offline_activity', 'leveled_problem', 'exit_ticket']
      .filter(x => S.some(s => s.block === x && (x !== 'review' || s.data.items))).join(','));
});

// ── 파일 재출력 (전 차시 블록 교체 · IIFE 보존) ──
const src = fs.readFileSync(FILE, 'utf8');
const header = src.slice(0, src.indexOf('  window.LESSONS['));
const footer = '})();\n';
let body = '';
Object.keys(L).forEach(key => {
  const json = JSON.stringify(L[key], null, 2).split('\n').map((ln, i) => i === 0 ? ln : '  ' + ln).join('\n');
  body += `  window.LESSONS["${key}"] =\n  ${json};\n\n`;
});
fs.writeFileSync(FILE, header + body + footer, 'utf8');
console.log('  파일 재출력 완료 (IIFE 보존)');
