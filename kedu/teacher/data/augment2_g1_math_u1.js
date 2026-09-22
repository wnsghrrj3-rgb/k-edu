/* augment2_g1_math_u1.js — ⑦발문 증보(g1 수학 1단원 「9까지의 수」), 2026-09-22 베프.
   밀도표준 v2 §2 ⑦: 차시당 tnote 6슬 이상. 증보 전 1슬/차시 → 증보 후 7~8슬.
   §5 원칙: 기존 슬라이드 본문 diff-0 — 이미 tnote 가 있는 슬라이드는 건너뛰고, 없는 슬라이드의 data 맨 앞에 tnote 필드만 끼운다.
   근거: 각 차시의 실제 슬라이드 내용(질문·개념·오개념)에서 뽑은 즉석 발문. ask = 아이들에게 그대로 던질 말, watch = 예상 오답·유의점, min = 이 슬라이드에 머무는 분.
   실행: node kedu/teacher/data/augment2_g1_math_u1.js  → 검산 뒤 g1_math_u1.js 갱신 */
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'g1_math_u1.js');

const T = {
  u1_l01: {
    s02: { ask: ['학교 오는 길에 본 것 중에 셀 수 있는 게 있었나요?', '자동차는 몇 대쯤 봤어요?'], watch: '"많이요"로 끝나면 "몇 개?"로 되물어 수로 말하게', min: 3 },
    s03: { ask: ['친구·자동차·가로수 말고 또 뭘 셀 수 있을까?'], watch: '셀 수 없는 것(바람·소리)을 말하면 "하나, 둘 짚을 수 있나?"로 구분', min: 2 },
    s06: { ask: ['비슷한 것끼리 모으면 세기가 왜 쉬워질까?'], watch: '모으는 기준이 여러 가지(색·종류)일 수 있음을 인정', min: 3 },
    s09: { ask: ['동물을 셀 때 어디서부터 셀까?', '한 번 센 걸 또 세지 않으려면?'], watch: '건너뛰기·중복 세기 — 손가락으로 짚거나 표시하기', min: 3 },
    s10b: { ask: ['빨리 세다가 틀린 적 있어요?'], watch: '속도보다 하나씩 짚기', min: 2 },
    s11: { ask: ['짝은 무엇을 세었어요? 나와 달랐어요?'], watch: '다르게 센 것을 틀렸다고 하지 않기', min: 3 },
    s12: { ask: ['집에서 셀 수 있는 것 하나만 말해 볼까?'], watch: '숟가락·신발처럼 짝으로 있는 것은 "한 켤레=2"가 헷갈릴 수 있음', min: 2 },
    s16: { ask: ['오늘 무엇을 세어 봤어요?', '단원 약속 중 하나만 말해 볼까?'], watch: '약속을 못 고른 아이는 짝의 것을 빌려도 됨', min: 2 }
  },
  u1_l02_03: {
    s03: { ask: ['가위는 몇 개? 지우개는 몇 개?', '무엇부터 세면 좋을까?'], watch: '가위·지우개를 섞어 세는 아이 — 종류별로', min: 3 },
    s05: { ask: ['하나는 손가락 몇 개? 어떻게 읽어요?'], watch: '"하나"와 "일" 둘 다 1이라는 것을 반복', min: 2 },
    s07: { ask: ['셋을 십 배열판에서 찾아볼까?'], watch: '칸 위치가 달라도 3인 것을 확인', min: 2 },
    s09: { ask: ['다섯은 한 손 손가락과 같아요. 맞나요?'], watch: '5 = 배열판 한 줄 꽉 참을 눈에 넣기', min: 2 },
    s11: { ask: ['3과 ㅌ가 왜 헷갈릴까?', '2와 5는 어디가 달라요?'], watch: '거울 글자(2↔5, 3↔ㅌ) — 시작점부터 보여 주기', min: 3 },
    s12: { ask: ['토끼가 몇 마리? 우리말로는? 한자어로는?'], watch: '"세 마리"까지 말하게(단위 붙이기)', min: 2 },
    s15: { ask: ['3이면 몇 칸 색칠할까?', '5는 몇 줄이 찰까?'], watch: '외친 수보다 하나 더 칠하는 아이 — 세면서 칠하기', min: 4 },
    s21: { ask: ['같은 수가 왜 여러 개 있을까?'], watch: '그림·숫자·글자가 같은 수를 나타냄을 연결', min: 3 }
  },
  u1_l04_05: {
    s03: { ask: ['5보다 많이 있는 동물은 뭐예요?', '어떻게 알았어요?'], watch: '한 손을 다 펴고 더 펴야 하면 5보다 크다는 감각', min: 3 },
    s04: { ask: ['5를 먼저 보고 나머지를 보면 왜 빠를까?'], watch: '5+얼마로 보기(십 배열판 한 줄 기준)', min: 3 },
    s06: { ask: ['7은 5하고 몇이 더 있는 수예요?'], watch: '"5, 6, 7"로 이어 세기 유도', min: 2 },
    s09: { ask: ['6·7·8·9 중에서 가장 많은 건? 어떻게 한눈에 알아요?'], watch: '두 번째 줄 칸 수만 비교하면 됨을 발견', min: 3 },
    s11: { ask: ['6과 9는 어디가 다를까?'], watch: '6↔9 뒤집힘 — 동그라미 위치로 구별', min: 2 },
    s14: { ask: ['토마토는 5칸 다 차고 몇 칸 더?'], watch: '5+1=6을 "여섯"으로 말하기', min: 2 },
    s17: { ask: ['연결 모형 7개를 5개와 몇 개로 나눠 볼까?'], watch: '5묶음 색을 다르게 하면 잘 보임', min: 4 },
    s23: { ask: ['손가락을 다 펴면 몇? 5하고 몇?'], watch: '"열"이 아니라 오늘은 9까지 — 한 손+네 손가락 = 9', min: 2 }
  },
  u1_l06: {
    s03: { ask: ['누가 첫째로 들어왔어요? 둘째는?', '첫째는 몇 명이에요?'], watch: '"첫째"는 자리, "하나"는 개수 — 섞이면 되물음', min: 3 },
    s04: { ask: ['"셋"과 "셋째"는 뭐가 달라요?'], watch: '셋=3개, 셋째=3번째 자리 하나', min: 3 },
    s06: { ask: ['앞에서 둘째인 사람이 뒤에서 세면 몇째예요?'], watch: '기준 바뀌면 순서가 바뀜을 몸으로(줄 서기)', min: 3 },
    s08: { ask: ['첫째부터 셋째까지 하면 몇 명이에요?'], watch: '"셋째"를 3명으로 답하는 아이 — 색칠해 보기', min: 2 },
    s10: { ask: ['같은 사람인데 앞에서·뒤에서가 왜 달라요?'], watch: '기준 말 없이 "둘째"만 말하면 안 됨', min: 3 },
    s13: { ask: ['엘리베이터 5층은 아래에서 몇째 층?'], watch: '1층=첫째, 5층=다섯째 연결', min: 2 },
    s16: { ask: ['순서를 말할 때 꼭 함께 말해야 하는 건?'], watch: '"기준(앞에서·뒤에서)"이 답', min: 2 }
  },
  u1_l07: {
    s03: { ask: ['흩어진 카드를 어디서부터 놓을까?', '1 다음은?'], watch: '큰 수부터 놓는 아이도 인정하고 "작은 수부터"로 통일', min: 3 },
    s05: { ask: ['계단이 한 칸씩 높아지는 건 무슨 뜻일까?'], watch: '수가 1씩 커진다 = 하나씩 많아진다', min: 3 },
    s06: { ask: ['9부터 거꾸로 세어 볼까? 어디서 멈춰요?'], watch: '거꾸로 셀 때 7·6에서 자주 막힘 — 계단 보며', min: 3 },
    s08: { ask: ['4 다음은? 4 이전은?'], watch: '"다음·이전"을 "크다·작다"로 바꿔 말해 보기', min: 2 },
    s10: { ask: ['빈칸에 왜 4가 들어가요?'], watch: '앞뒤 수를 둘 다 보고 답하게', min: 2 },
    s13: { ask: ['달력에서 오늘 다음 날 수는?'], watch: '요일과 숫자 구별', min: 2 },
    s16: { ask: ['수의 순서를 한 줄로 말해 볼까? 거꾸로도?'], watch: '앞으로·거꾸로 둘 다 확인', min: 2 }
  },
  u1_l08: {
    s03: { ask: ['딱지를 하나 따면 몇 장이 돼요? 잃으면?'], watch: '"이겼다"에 머물지 말고 수의 변화로', min: 3 },
    s04: { ask: ['하나 더 많아지면 수는 어떻게 될까?'], watch: '1만큼 더 큰 수 = 바로 다음 수', min: 3 },
    s06b: { ask: ['3에서 하나 더 채우면? 하나 비우면?'], watch: '"4"와 "2"가 3의 양옆임을 배열판에서 확인', min: 4 },
    s09: { ask: ['3·4·2를 한눈에 보면 어느 게 가장 많아요?'], watch: '가운데(3)를 기준으로 양쪽 보기', min: 2 },
    s13: { ask: ['3에서 하나 적어지면 0일까요?'], watch: '3-1=2 — "하나"를 빼는 것이지 다 없애는 것이 아님', min: 3 },
    s17: { ask: ['8은 9보다 1만큼 더 ___ 수?', '8은 7보다는?'], watch: '같은 8이 큰 수도 작은 수도 됨(기준에 따라)', min: 3 },
    s20: { ask: ['3층에서 한 층 올라가면? 한 층 내려가면?'], watch: '엘리베이터 버튼 순서 = 수의 순서', min: 2 },
    s30: { ask: ['5보다 1만큼 더 큰 수와 작은 수를 짝과 번갈아 말해 볼까?'], watch: '두 방향 모두 말하는지', min: 2 }
  },
  u1_l09: {
    s03: { ask: ['풀이 하나씩 없어지면 마지막엔 몇 개가 남을까?'], watch: '"없어요"를 수로 말하게: 0', min: 3 },
    s05: { ask: ['아무것도 없는 것도 수로 적을 수 있어요. 어떻게?'], watch: '0을 "동그라미"라고만 부르지 않게 — "영"', min: 3 },
    s06: { ask: ['1보다 1만큼 더 작은 수는?'], watch: '0이 1 앞에 오는 수임을 계단·수직선으로', min: 3 },
    s08: { ask: ['빈칸으로 두는 것과 0을 적는 것은 같을까?'], watch: '안 적기 ≠ 0 — 0은 "없다"를 적은 것', min: 2 },
    s09: { ask: ['통이 비었어요. 가위는 몇 개? 어떻게 적을까?'], watch: '"0개"라고 단위까지', min: 2 },
    s12: { ask: ['3에서 하나씩 비우면 어떤 수가 지나가요?'], watch: '3→2→1→0 순서로 말하며 비우기', min: 4 },
    s16: { ask: ['0은 무엇을 뜻하는 수예요?'], watch: '"아무것도 없음"과 "1보다 1 작은 수" 두 가지 모두', min: 2 }
  },
  u1_l10: {
    s03: { ask: ['어느 모둠이 가장 많이 넣었어요? 어떻게 알 수 있을까?'], watch: '"보면 알아요"에서 "하나씩 짝지어" 방법으로', min: 3 },
    s04: { ask: ['하나씩 짝을 지으면 남는 쪽은 어느 쪽?'], watch: '남는 쪽이 더 많다(크다)', min: 3 },
    s05: { ask: ['배열판에서 어느 쪽이 더 많이 찼어요?'], watch: '칸 위치 말고 찬 칸 수', min: 2 },
    s07: { ask: ['사탕이 많은 것과 사탕이 큰 것은 같은 말일까?'], watch: '"많다"는 개수, "크다"는 크기 — 수의 크기는 "많다"에서 옴', min: 3 },
    s08: { ask: ['0과 2 중에 어느 쪽이 더 커요? 0은 비교할 수 있어요?'], watch: '0도 수 — 가장 작은 수', min: 2 },
    s09: { ask: ['7과 3 중 어느 쪽이 커요? 반대로도 말해 볼까?'], watch: '"7이 커요"에서 "3은 7보다 작아요"까지', min: 2 },
    s11: { ask: ['다섯 수 중 가장 큰 수를 어떻게 찾았어요?'], watch: '둘씩 비교해 가는 방법 말로 하기', min: 3 },
    s16: { ask: ['두 수를 비교할 때 무엇을 하면 돼요?'], watch: '하나씩 짝짓기·배열판·순서 셋 중 하나를 말하면 통과', min: 2 }
  },
  u1_l11: {
    s03: { ask: ['농장 친구들은 무엇을 세려고 해요?'], watch: '평가라는 말 대신 "농장 문제"로 긴장 낮추기', min: 2 },
    s04: { ask: ['배추는 몇 포기? 어디서부터 셌어요?'], watch: '중복·건너뛰기 — 짚으며 세기', min: 3 },
    s05: { ask: ['바구니가 다 비면 어떻게 적을까?'], watch: '빈칸으로 두는 아이 — 0', min: 2 },
    s06: { ask: ['3과 6 중 어느 쪽이 커요? 반대로도?'], watch: '두 방향 말하기', min: 2 },
    s07: { ask: ['빠진 수를 어떻게 찾았어요?'], watch: '앞뒤 수 보고 답하기', min: 2 },
    s08: { ask: ['왼쪽에서 여섯째는 몇 번째 사람? 오른쪽에서 둘째는?'], watch: '기준을 안 보면 틀림(오개념 s09b로 연결)', min: 3 },
    s09: { ask: ['캔 5개에서 1만큼 더 작은 수는? 큰 수는?'], watch: '4와 6 — 양옆', min: 2 },
    s16: { ask: ['오늘 확인한 것 중에 가장 자신 있는 건?'], watch: '부족한 것도 말하게 하되 격려로 마무리', min: 2 }
  },
  u1_l12: {
    s03: { ask: ['어제 본 수는 무엇이었어요? 어디서 봤어요?'], watch: '버스 번호·집 호수처럼 "세지 않는 수"도 나옴 — 쓰임으로 인정', min: 3 },
    s04: { ask: ['수는 세는 것 말고 또 어디에 써요?'], watch: '개수·순서·이름표(버스 번호) 세 가지 쓰임', min: 3 },
    s05: { ask: ['1 페이지에는 무엇이 하나 있어요?'], watch: '그림 수와 숫자가 맞는지', min: 2 },
    s08: { ask: ['어떤 수를 고를 거예요? 왜?'], watch: '어려운 수를 고른 아이 칭찬', min: 2 },
    s10: { ask: ['숫자와 그림의 개수가 같아요?'], watch: '그림을 더 그리고 싶어 수가 안 맞는 경우 — 숫자를 고칠지 그림을 고칠지 스스로 정하기', min: 5 },
    s12: { ask: ['짝의 그림책에서 칭찬할 곳 하나는?'], watch: '"잘 그렸어요" 말고 수와 관련해서', min: 3 },
    s16: { ask: ['1단원에서 가장 재미있었던 건?'], watch: '세기·순서·비교 중 하나 말하면 정리', min: 2 }
  }
};

let src = fs.readFileSync(FILE, 'utf8');
let added = 0, skipped = 0, missing = [];
// 차시 구간 경계
const marks = [...src.matchAll(/LESSONS\["(u\d+_l[\w]+)"\]\s*=/g)].map(m => ({ key: m[1], at: m.index }));
function range(key) { const i = marks.findIndex(m => m.key === key); if (i < 0) return null; return [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length]; }
for (const key of Object.keys(T)) {
  const rg = range(key); if (!rg) { missing.push(key); continue; }
  for (const sid of Object.keys(T[key])) {
    const seg = src.slice(rg[0], rg[1]);
    const re = new RegExp('"id":\\s*"' + sid + '"[\\s\\S]*?"data":\\s*\\{'); const m = seg.match(re);
    if (!m) { missing.push(key + '/' + sid); continue; }
    const at = rg[0] + m.index + m[0].length;
    // 이 슬라이드 data 안에 이미 tnote 가 있으면 건너뜀(데이터 diff-0)
    const after = src.slice(at, at + 4000); const closeIdx = after.search(/\n\s{2,6}\},?\n/);
    if (/"tnote"\s*:/.test(after.slice(0, closeIdx > 0 ? closeIdx : 1500))) { skipped++; continue; }
    const n = T[key][sid];
    const ins = '\n        "tnote": ' + JSON.stringify(n) + ',';
    src = src.slice(0, at) + ins + src.slice(at); added++;
    // 경계 갱신
    marks.forEach(mk => { if (mk.at > at) mk.at += ins.length; }); rg[1] += ins.length;
  }
}
// 검산: 실행되는가 · 차시별 tnote 수
const vm = require('vm'); const L = {}; const ctx = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(src, ctx);
const report = Object.keys(L).map(k => k + ':' + (L[k].slides || []).filter(s => s.data && s.data.tnote).length).join(' ');
const under = Object.keys(L).filter(k => (L[k].slides || []).filter(s => s.data && s.data.tnote).length < 6);
console.log('tnote 추가', added, '· 이미 있음', skipped, '· 못 찾음', missing.length, missing.join(','));
console.log('차시별 tnote:', report);
if (under.length) { console.log('⛔ 6슬 미만:', under.join(',')); process.exit(1); }
fs.writeFileSync(FILE, src);
console.log('✅ g1_math_u1.js 갱신');
