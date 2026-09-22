/* augment3_offline_g1_math.js — ④교실 활동(offline_activity) 삽입: g1 수학 5단원 9차시 + 3단원 l13, 2026-09-22 베프.
   밀도표준 v2 §2 ④·§5(신규 슬라이드 삽입만). 이미 offline_activity 가 있는 차시는 건너뜀. 자리 = 응용문제 단계 끝(첫 정리 슬라이드 앞).
   실행: node kedu/teacher/data/augment3_offline_g1_math.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const A = {
  'g1_math_u5.js': {
    u5_l02_03: { id: 's16b', title: '10 만들기 손가락 짝', tag: '짝 활동', type: 'pair', icon: '🤲', goal: '둘의 손가락을 모아 10을 만들어요.', steps: ['짝과 마주 봐요.', '한 사람이 손가락을 몇 개 펴요(예: 3).', '짝은 모아서 10이 되게 손가락을 펴요(7).', '역할을 바꿔 다섯 번 해요.'], materials: ['없음'], minutes: 4, tnote: { ask: ['3이면 몇 개를 펴야 10이 돼요?'], watch: '10 가르기 짝을 말로 같이', min: 4 } },
    u5_l04: { id: 's15b', title: '연결 모형으로 십몇 만들기', tag: '짝 활동', type: 'pair', icon: '🧱', goal: '10개 묶음 하나와 낱개로 십몇을 만들어요.', steps: ['연결 모형 10개를 한 줄로 끼워 묶음 하나를 만들어요.', '선생님이 부르는 수(예: 14)만큼 낱개를 옆에 놓아요.', '짝이 묶음 1·낱개 4를 확인하고 두 가지로 읽어요.', '역할을 바꿔요.'], materials: ['연결 모형 20개(짝당)'], minutes: 5, tnote: { ask: ['14는 묶음 몇, 낱개 몇?'], watch: '낱개를 10개 넘게 놓으면 묶어야 함을 발견', min: 5 } },
    u5_l05: { id: 's15b', title: '모으기·가르기 카드 짝', tag: '짝 활동', type: 'pair', icon: '🃏', goal: '십몇을 두 수로 모으고 갈라요.', steps: ['수 카드 1~9 를 두 장 뽑아 모으면 몇인지 말해요.', '짝은 이어 세기로 확인해요.', '이번엔 11~19 카드 한 장을 뽑아 두 수로 갈라 말해요.', '다른 방법으로 한 번 더 갈라요.'], materials: ['수 카드 1~19'], minutes: 5, tnote: { ask: ['어느 수부터 이어 세면 빨라요?'], watch: '큰 수부터', min: 5 } },
    u5_l06: { id: 's15b', title: '10개씩 묶어 세기 — 교실 물건', tag: '모둠 활동', type: 'group', icon: '📦', goal: '많은 물건을 10개씩 묶어 몇십인지 말해요.', steps: ['모둠에 연결 모형(또는 바둑돌) 한 통을 받아요.', '10개씩 묶어 놓아요.', '묶음이 몇 개인지 세고 몇십인지 두 가지로 읽어요.', '남은 낱개가 있으면 따로 세어 봐요.'], materials: ['연결 모형 또는 바둑돌 30~50개(모둠당)'], minutes: 5, tnote: { ask: ['묶음이 4개면 몇?'], watch: '묶음 수 ≠ 개수 — 40', min: 5 } },
    u5_l07: { id: 's15b', title: '묶음·낱개 수 만들기 대결', tag: '짝 활동', type: 'pair', icon: '🎯', goal: '묶음과 낱개로 두 자리 수를 만들고 읽어요.', steps: ['한 사람이 묶음 수(1~5)와 낱개 수(0~9)를 말해요.', '짝이 연결 모형으로 만들고 수를 말해요.', '두 가지로 읽어요(예: 스물셋 · 이십삼).', '역할을 바꿔요.'], materials: ['연결 모형 50개(짝당)'], minutes: 5, tnote: { ask: ['묶음 3·낱개 4면 어떤 수?'], watch: '7이라고 하면 묶음 하나가 10임을 다시', min: 5 } },
    u5_l08: { id: 's15b', title: '수 배열표 빈칸 채우기 짝', tag: '짝 활동', type: 'pair', icon: '🔢', goal: '배열표의 규칙으로 빈칸을 채워요.', steps: ['1~50 배열표에서 짝이 수 몇 개를 손가락으로 가려요.', '가려진 수를 양옆·위아래 수로 알아내 말해요.', '맞으면 손을 떼고 확인해요.', '역할을 바꿔요.'], materials: ['1~50 수 배열표(짝당 1장)'], minutes: 4, tnote: { ask: ['위 칸은 얼마 작아요? 아래 칸은?'], watch: '10 작고 10 큼', min: 4 } },
    u5_l09: { id: 's15b', title: '카드 두 장 크기 비교 대결', tag: '짝 활동', type: 'pair', icon: '🆚', goal: '두 수의 크기를 묶음·낱개로 비교해요.', steps: ['수 카드(10~50)를 뒤집어 놓아요.', '둘이 동시에 한 장씩 뒤집어요.', '더 큰 수를 먼저 말한 사람이 두 장을 가져가요.', '묶음이 같으면 낱개로 비교해요.'], materials: ['수 카드 10~50'], minutes: 5, tnote: { ask: ['묶음이 같을 땐 뭘 봐요?'], watch: '낱개', min: 5 } },
    u5_l10: { id: 's14b', title: '짝과 답 맞춰 보기', tag: '짝 활동', type: 'pair', icon: '✅', goal: '평가 답을 짝과 비교하고 이유를 말해요.', steps: ['평가 1~9 답을 짝과 번갈아 말해요.', '다른 답이 있으면 묶음·낱개로 다시 세어 봐요.', '어느 쪽이 맞는지 이유를 말해요.', '틀린 문제는 ○ 표시해 두어요.'], materials: ['평가지'], minutes: 5, tnote: { ask: ['답이 다르면 무엇으로 확인해요?'], watch: '묶음·낱개', min: 5 } },
    u5_l11: { id: 's15b', title: '수 카드 줄 세우기 짝', tag: '짝 활동', type: 'pair', icon: '📏', goal: '수 카드 네 장을 큰 순서·작은 순서로 놓아요.', steps: ['수 카드 네 장을 뽑아요.', '한 사람이 큰 순서로 놓고, 짝이 확인해요.', '같은 카드를 작은 순서로 다시 놓아요.', '이웃한 카드의 자리가 같은지 이야기해요.'], materials: ['수 카드 10~50'], minutes: 4, tnote: { ask: ['큰 순서와 작은 순서, 이웃은 같아요?'], watch: '자리 관계는 하나', min: 4 } }
  },
  // g1_math_u4 l06 은 단원 설계가 「평가형 — offline 제외」(meta.lesson_format)라 넣지 않는다.
  'g1_math_u3.js': {
    u3_l13: { id: 's14b', title: '식 카드 짝 점검', tag: '짝 활동', type: 'pair', icon: '🧮', goal: '덧셈·뺄셈 식을 서로 내고 확인해요.', steps: ['수 카드 두 장을 뽑아 덧셈식을 만들어 말해요.', '짝이 이어 세기로 답을 확인해요.', '큰 카드에서 작은 카드를 빼는 뺄셈식도 만들어요.', '덧셈으로 답을 확인하고 역할을 바꿔요.'], materials: ['수 카드 0~9'], minutes: 5, tnote: { ask: ['뺄셈 답은 무엇으로 확인해요?'], watch: '덧셈으로', min: 5 } }
  }
};
for (const file of Object.keys(A)) {
  const FILE = path.join(__dirname, file); let src = fs.readFileSync(FILE, 'utf8'); let added = 0;
  const L0 = {}; const c0 = { window: { LESSONS: L0 }, LESSONS: L0, document: { getElementById: () => null } }; c0.window.window = c0.window; vm.createContext(c0); vm.runInContext(src, c0);
  for (const key of Object.keys(A[file])) {
    const les = L0[key]; if (!les) { console.log('⛔ 없음', key); continue; }
    if (les.slides.some(s => s.block === 'offline_activity')) { console.log('건너뜀(이미 있음)', key); continue; }
    const first정리 = les.slides.find(s => s.stage === '정리'); if (!first정리) { console.log('⛔ 정리 없음', key); continue; }
    // 파일에서 그 차시 구간 안의 첫 정리 슬라이드 위치
    const marks = [...src.matchAll(/LESSONS\["(u\d+_l[\w]+)"\]\s*=/g)].map(m => ({ key: m[1], at: m.index }));
    const mi = marks.findIndex(m => m.key === key); const rg = [marks[mi].at, mi + 1 < marks.length ? marks[mi + 1].at : src.length];
    const seg = src.slice(rg[0], rg[1]); const re = new RegExp('\\n( {4,8})\\{\\n\\s+"id": "' + first정리.id + '"'); const m = seg.match(re); if (!m) { console.log('⛔ 자리 못 찾음', key, first정리.id); continue; }
    const I = m[1]; const sp = A[file][key]; const d = Object.assign({}, sp); delete d.id;
    const obj = '\n' + I + JSON.stringify({ id: sp.id, stage: '응용문제', block: 'offline_activity', data: d }, null, 2).split('\n').join('\n' + I) + ',';
    const at = rg[0] + m.index; src = src.slice(0, at) + obj + src.slice(at); added++;
  }
  const L = {}; const c = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(src, c);
  const miss = Object.keys(A[file]).filter(k => !(L[k] && L[k].slides.some(s => s.block === 'offline_activity')));
  if (miss.length) { console.log('⛔ 검산 실패', file, miss); continue; }
  fs.writeFileSync(FILE, src); console.log('✅', file, '교실 활동 삽입', added);
}
