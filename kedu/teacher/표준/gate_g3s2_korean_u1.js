/* gate_g3s2_korean_u1.js — 3학년 2학기 국어 1단원 「경험과 관련지으며 이해해요」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 · gate_g2s2_math_u3 틀 + 국어 사전 대조).
   옛 게이트(35차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g3s2_korean_u1.js 에 보관. 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(3학년 2학기 · 1단원 · 지도서 차시 묶음 · 성취기준 문구 · 학습 목표 · 분 · 지도서 쪽 · live_url · theme) · 부품 등록 · slug g3s2_korean
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 동기 장 + 장면) · 실사 자리 8종 서로 다름 · 3-2 국어 다른 단원과 겹침 0
   D 복습 계보(l01 = 1학기 g3_korean u6_l13 출구 — 파일에서 동적으로 읽어 대조 → 이후 = 직전 차시 출구) · 마지막 = 2단원 「유창하게 읽고 발표해요」 예고
   E 정답 다시 풀기 — 게이트 자체 사전으로 푼다: 낱말 뜻 사전(지도서 47·53·57쪽) 역찾기 · 받침 ㅎ 소리 규칙(한글 자모를 풀어 ㅎ·ㄶ·ㅀ 뒤 모음이면 ㅎ 빼고 넘김)
       · 차례 표(흥부 놀부 9사건) 다음 사건 · 질문 갈래 표(사실·추론) · 「아닌 것」 = 표에 없는 보기 · 지도서 사실 표(예시 답안) → 기본 24 · 수준별 16 · 출구 24 · 넓히기 8 = 72
   F 차례 사슬 — 「호랑이를 이긴 개미」 여섯 칸 · 「나는, 나는 될 터이다」 일곱 사건 · 듣기 전→중→후 · 「갈대와 떡갈나무」 봄→여름→가을 · 원인 → 그래서 일어난 일 · 심화 예시 글의 사건 차례
   G 그림 — 렌더 · 쓰는 부품만(text·mood·sort2·note·letter·sound·link·tools·chain) · 받침 ㅎ 소리 카드 = 게이트 규칙 · 문제 그림이 정답을 보이지 않음 · 문제 카드 ≤ 3(넘침) · 감 바구니 ○4 ✕1 · 대화 질문-대답 표
   H 재료 충실(개념·문제·다음 = src) · 교과서 낱말 표(활동목록.md 차시별) · 보탬 흡수 대조(옛 TB 28장 핵심 낱말이 본류 장에 · b_l id 0) · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 분(40분 30~45 · 80분 60~80) · 물음 끝 「요?」 · 지도서 유의점이 교사 층에
   L 선행(말하는 이 l02 · 질문 갈래 l04 · 첫째·기호 l06 · 사실 질문·인물의 특성·일어난 일의 차례 l07 · 자랑거리 l09 · 분리배출 l11 · 받침 ㅎ·생각그물 l13 — l01 단원 도입 예외)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 교사 화면 영어 코드 0 · 인물 = 곰이·펭이(+ 교과서 인물) · 옛 창작 작품·인물 0
   N 제재 — 작품마다 제목·지은이 · 교과서 쪽 안내 · 작품별 인용 줄 ≤ 4(그림 text 를 모두 모아 셈 · [간추림]·→ 줄 빼고 · 시는 행 단위)
   O 정답이 하나가 아님 — 심화 open · 「여러 답 (예:」 · 열린 장(사람마다·여러 답 + 까닭·근거) ≥ 4차시
   R 역검증 레드 — 망가뜨린 사본(정답 · 낱말 뜻 · 소리 · 복습 · 「결」 · b_ 카드 · 보탬 낱말 · 교과서 낱말 · 인용 줄 · 차례 · 인물 · 선행)을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_korean_u1.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g3s2_korean_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u1.json'), 'utf8'));
const KEYS = ['u1_l01', 'u1_l02', 'u1_l04', 'u1_l06', 'u1_l07', 'u1_l09', 'u1_l11', 'u1_l13'];
const COV = { u1_l01: [1, 1], u1_l02: [2, 3], u1_l04: [4, 5], u1_l06: [6, 6], u1_l07: [7, 8], u1_l09: [9, 10], u1_l11: [11, 12], u1_l13: [13, 13] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '경험과 관련지으며 이해해요';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: UT, classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const figText = (f) => docOf(FIG.render(f)).body.textContent;

/* ══════════ 지도서 사전·표 (게이트 자체 — 생성기와 따로 옮김) ══════════ */
/* 낱말 뜻 — 지도서 98쪽(국어 47쪽) · 106쪽(53쪽) · 111쪽(57쪽) 예시 답안 */
const WORDS = { 평범하다: '뛰어나거나 색다른 점이 없이 보통이다', 슬그머니: '남이 알아차리지 못하게 슬며시', 듬뿍: '매우 많거나 넉넉한 모양', 에워싸다: '둘레를 빙 둘러싸다',
  콧방귀: '코로 나오는 숨을 막았다가 갑자기 터뜨리면서 불어 내는 소리', 헛발질: '목표물을 맞히지 못하고 빗나가는 발길질', 요리조리: '일정한 방향이 없이 요쪽 조쪽으로',
  해산물: '바다에서 나는 모든 동물과 식물', 재배: '식물을 심어서 가꾸는 것', 장인: '어떤 일을 오랫동안 해 와서 손으로 물건을 잘 만들고 고치는 기술이 뛰어난 사람' };
/* 받침 ㅎ 소리 규칙(지도서 118~119쪽 · 국어 64쪽) — 한글 음절을 초·중·종성으로 풀어, 종성 ㅎ(27)·ㄶ(6)·ㅀ(15) 뒤에 ㅇ(초성 11)으로 시작하는 음절이 오면 ㅎ을 빼고 ㄴ·ㄹ은 뒤로 넘긴다 */
function hieut(word) {
  const cs = Array.from(String(word)).map(ch => { const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) return { raw: ch }; return { cho: Math.floor(c / 588), jung: Math.floor((c % 588) / 28), jong: c % 28 }; });
  let hit = 0;
  for (let i = 0; i < cs.length - 1; i++) { const a = cs[i], b = cs[i + 1]; if (a.raw || b.raw || b.cho !== 11) continue;
    if (a.jong === 27) { a.jong = 0; hit++; } else if (a.jong === 6) { a.jong = 0; b.cho = 2; hit++; } else if (a.jong === 15) { a.jong = 0; b.cho = 5; hit++; } }
  if (!hit) throw new Error('받침 ㅎ 규칙이 안 걸리는 낱말 ' + word);
  return cs.map(x => x.raw || String.fromCharCode(0xAC00 + x.cho * 588 + x.jung * 28 + x.jong)).join('');
}
/* 지도서 사실 표 — 쪽마다 예시 답안 */
const S = {
  wing34: ['본 것', '들은 것', '느낀 것'], table35: ['언제', '어디에서', '무엇을', '누구와'], unitParts: ['경험을 떠올리며 작품 감상하기', '중요한 내용 간추리기'],   // 34·35쪽 · 84쪽 단원 목표
  speaker: '말하는 이', ginkgoWho: '방학 때 이사 간 친구', ginkgoLetter: '갑자기 헤어져 속상하고 그립다는 말', wallMedicine: '입장 바꿔 생각해 보기', wallMeaning: '친구와 마음이 막혀 말하기 싫고 화가 나는 마음', // 37·39·92쪽
  wall5: ['언제 누구와', '무슨 일', '마음', '행동'], related: '생각이나 느낌', lineUnit: '의미 단위',                                    // 40쪽 · 91쪽 · 93쪽
  rosieHate: '바이올렛이 최고라는 말', rosieWhy: '자기 새싹이 최고가 되게 하고 싶어서', rosieTwoWeeks: '화분 두 개를 정성껏 돌보았어요', sort48: ['도움을 주었던 경험 / 도움을 받았던 경험', '혼자 한 경험 / 함께 한 경험'], // 47·45·48쪽
  qtype95: { '내용 확인 질문': '글 안에서 답을 찾을 수 있는 질문', '추론 질문': '글의 내용을 바탕으로 생각하고 답을 찾아야 하는 질문', '감상 질문': '자신의 생각이나 느낌을 이야기할 수 있는 질문' },
  talkWho: '대화법 전문가와 초등학교 3학년 학생', talkA: ['친구와 계속 이야기하려고 노력', '자신의 마음을 솔직하게 말', '선생님께 도움을 요청'], cues: ['첫째', '둘째', '이것은', '따라서'], // 50~51·103쪽
  listen: [['듣기 전', '제목'], ['듣기 중', '간단히 기록'], ['들은 후', '기호']], yunchan: '건강에 좋고, 다칠 일이 별로 없고, 시원해서 기분이 좋다',      // 51쪽 3번 · 국어활동 8쪽
  tigerAngry: '작은 개미가 호랑이를 무서워하지 않아서', cause54: [['개미가 무서워하지 않고 당당하게 대함', '호랑이가 화를 냄'], ['개미 떼가 호랑이 털 속으로 들어감', '호랑이는 가려움을 참지 못함']], // 53·54쪽
  sumWays: ['인물의 특성', '일어난 일의 차례'], q107: { 사실: ['호랑이가 개미를 무시한 까닭은 무엇인가요?', '개미는 어떤 방법으로 호랑이를 이길 수 있었나요?'], 추론: ['호랑이는 개미가 자신을 어떻게 대할 것이라 생각했을까요?', '개미가 생각하는 ‘숲속의 왕’은 어떤 모습일까요?'] },
  local: ['홍천 옥수수', '울릉도 오징어', '전주 한지', '공주 알밤'], squidTaste: '고소하고 씹을수록 약간의 단맛', hongcheon: '강원특별자치도 홍천군', hanjiTrait: '질기고 오랜 시간이 흘러도 변하지 않음', chestnutEnv: '깨끗한 공기와 물, 흙으로 재배함', listenWrite: '몇 가지로 나누어 간단히', // 57~58·111쪽
  cup: '깨끗이 씻어서 종이컵 전용으로', remember: '더러운 것은 깨끗이 씻어 버려야 해요', petCap: '따로 떼어서 플라스틱으로', can: '캔', fit60: { 여행: '「하나 둘 셋 찰칵! 김치, 치즈, 카프카」', 연필: '「까먹어도 될까요」' }, sticky: '붙임쪽지', // 115·60·116쪽
  persimmonOk: ['듣는 목적을 생각한다', '제목을 보고 들을 내용을 예상한다', '「첫째」, 「둘째」와 같은 말에 주의한다', '적절한 기호를 활용한다'], persimmonNo: '모든 내용을 옮겨 적는다', net64: { 동물: ['개', '나비', '고래'], 옷: ['모자', '양말', '바지'] }, broadcast: '중요한 내용을 간단히 정리' // 63·64쪽
};
/* 차례 표 — 지도서 108쪽(호랑이 여섯 칸) · 116쪽(곰손 일곱 사건) · 117쪽(흥부 놀부 아홉 사건) · 국어활동 9쪽 예시 답안(갈대와 떡갈나무) */
const TIGER_KW = ['만남', '화남', '더 화남', '다음 날', '털 속', '괴롭히지 않'];
const TIGER_STORY = ['만났다', '화를 내', '요리조리 피했다', '다음 날', '털 속', '괴롭히지 않게'];
const GOMSON_KW = ['숙제', '소라', '성빈', '한솔', '원태의 인터뷰', '발표 날', '흐뭇'];
const HEUNG = ['흥부와 놀부가 한집에서 살았다', '아버지가 돌아가시자 놀부는 돈 한 푼 주지 않은 채 흥부를 내쫓았다', '흥부는 놀부네 집에 쌀을 구하러 갔다가 놀부 아내에게 주걱으로 따귀를 맞고 돌아온다',
  '어느 날, 흥부는 구렁이에게 공격당하던 제비의 부러진 다리를 치료해 주었다', '이듬해 봄, 치료를 받은 제비가 돌아와 흥부에게 박씨를 떨어뜨려 주었다', '흥부가 그 박씨를 심어 거대하게 자란 박을 타자 온갖 곡물과 보물이 쏟아져 나왔다',
  '그 소식을 들은 놀부는 제비의 다리를 부러뜨려 치료해 주고 박씨를 얻었다', '놀부의 박에서는 거지, 도둑, 도깨비 등이 나왔고, 놀부는 거지가 되었다', '흥부는 거지가 된 놀부를 도와주었다'];
const REED = { 봄: ['떡갈나무는 자신의 모습이 자랑스러웠다', '갈대들은 작은 바람에도 흔들렸다'], 여름: ['떡갈나무의 잎이 무성해졌고, 더욱 자신만만해졌다', '갈대는 더운 바람에 흔들리면서도 조용히 자리를 지키고 있었다'], 가을: ['바람이 거세도 떡갈나무가 흔들림 없이 버티려 했다', '바람이 불어 떡갈나무의 기둥이 부러졌다'], 겨울: ['부러진 떡갈나무는 조용히 누워서 후회했다', '갈대는 떡갈나무에게 때로는 흔들릴 줄도 알아야 한다고 말했다'] };
const stem = (s) => nsp(s).replace(/[.,!?·]/g, '').replace(/(했어요|했다|어요|았다|었다|다|요)$/, '');

/* ── 풀이기(문항 하나 → 게이트가 낸 정답) ── */
const WORD = (q) => { const m = clean(q).match(/「(.+?)」(?:이)?라는 뜻의 낱말/); ok(m, '낱말 뜻 물음 꼴 아님 ' + q); const ws = Object.keys(WORDS).filter(k => WORDS[k] === m[1]); ok(ws.length === 1, '사전에 없는 뜻 ' + m[1]); return ws[0]; };
const HIEUT = (q) => { const m = clean(q).match(/^「([가-힣]+)」는 어떻게 소리 날까요\?$/); ok(m, '소리 물음 꼴 아님 ' + q); return '[' + hieut(m[1]) + ']'; };
const optsT = (d) => d.options.map(o => clean(o.text));
const NOT_IN = (keysIn) => (d) => { const out = optsT(d).filter(t => !keysIn.some(k => t.indexOf(k) >= 0)); ok(out.length === 1, '표에 없는 보기 ' + out.length); return out[0]; };
const PAIR_W = (d) => { const c = optsT(d).filter(t => { const m = t.match(/^(\S+) — (.+)$/); return m && WORDS[m[1]] === m[2]; }); ok(c.length === 1, '바른 짝 ' + c.length); return c[0]; };
const evIn = (t, e) => nsp(e).indexOf(nsp(t).replace(/[.]$/, '').replace(/다$/, '')) >= 0;
const NEXT_HEUNG = (d) => { const i = HEUNG.findIndex(e => nsp(d.question).indexOf(nsp('제비의 부러진 다리를 치료해')) >= 0 && e.indexOf('부러진 다리를 치료해') >= 0); ok(i >= 0, '흥부 사건 못 찾음');
  const c = optsT(d).filter(t => evIn(t, HEUNG[i + 1])); ok(c.length === 1, '다음 사건 보기 ' + c.length);
  optsT(d).filter(t => t !== c[0]).forEach(t => ok(HEUNG.some((e, j) => j !== i + 1 && evIn(t, e)), '오답 보기가 아홉 사건에 없음 ' + t)); return c[0]; };
const QTYPE = (d) => { const c = optsT(d).filter(t => S.q107.추론.indexOf(t) >= 0); ok(c.length === 1, '추론 질문 보기 ' + c.length); optsT(d).filter(t => t !== c[0]).forEach(t => ok(S.q107.사실.indexOf(t) >= 0, '오답 보기가 사실 질문 표에 없음 ' + t)); return c[0]; };
const AMONG = (list) => (d) => optsT(d).filter(t => list.indexOf(t) >= 0);
const OPEN = 'OPEN';
const fx = (f) => (typeof f === 'function' ? f : () => f);
const EXP = {
  basic: {
    u1_l01: [(d) => optsT(d).filter(t => S.table35.indexOf(t) >= 0), '중요한 것만 간단히 쓴다', '정리하는 목적이나 방법이 달라서'],
    u1_l02: [S.ginkgoLetter, S.wallMeaning, NOT_IN(S.wall5)],
    u1_l04: [S.rosieWhy, PAIR_W, S.sort48[0]],
    u1_l06: [(d) => optsT(d).find(t => t.indexOf(S.talkA[1]) === 0), AMONG(S.cues), S.yunchan],
    u1_l07: [S.cause54[1][1], (d) => WORD(d.question), QTYPE],
    u1_l09: [AMONG(S.local), (d) => WORD(d.question), S.hanjiTrait],
    u1_l11: [S.cup, S.remember, NEXT_HEUNG],
    u1_l13: [S.persimmonNo, (d) => HIEUT(d.question), NOT_IN(S.net64.동물)]
  },
  lev: {
    u1_l01: [S.wing34[2], S.table35[3]], u1_l02: [S.ginkgoWho, S.wallMedicine], u1_l04: [S.rosieHate, (q) => WORD(q)], u1_l06: [S.talkWho, S.talkA[2] + '함'],
    u1_l07: [(q) => WORD(q), S.sumWays[1]], u1_l09: [(q) => WORD(q), S.squidTaste], u1_l11: [S.fit60.여행, S.petCap], u1_l13: [(q) => HIEUT(q), (q) => HIEUT(q)]
  },
  exit: {
    u1_l01: ['사람마다 달라요', '중요한 것', S.unitParts[1]], u1_l02: [S.speaker, S.related, S.lineUnit],
    u1_l04: [() => Object.keys(S.qtype95).find(k => S.qtype95[k].indexOf('글 안에서 답') === 0), (q) => WORD(q), S.rosieTwoWeeks],
    u1_l06: [S.listen[0][1], S.listen[2][1], S.talkA[0] + '하기'], u1_l07: ['사실 질문', S.tigerAngry, (q) => WORD(q)],
    u1_l09: [(q) => WORD(q), S.hongcheon, S.listenWrite], u1_l11: [S.can, S.fit60.연필, S.sticky], u1_l13: [(q) => HIEUT(q), (q) => HIEUT(q), S.broadcast + '하기']
  },
  /* 넓히기 — 맥락에서 다시 푼다(누가 「다 받아」 적지 않았나 · 누가 순서와 상관없이 썼나 · 겨울 사건 · 소리와 글자) */
  adv: {
    u1_l01: (d) => ['곰이', '펭이'].find(n => { const seg = d.context.split(/[,.]/).find(x => x.indexOf(n) >= 0) || ''; return seg.indexOf('다 받아') < 0; }),
    u1_l02: OPEN, u1_l04: OPEN, u1_l06: '중요한 부분만 간단히 기록',
    u1_l07: (d) => REED.겨울[0], u1_l09: S.chestnutEnv,
    u1_l11: (d) => ['곰이', '펭이'].find(n => { const seg = d.context.split(/[,.]/).find(x => x.indexOf(n) >= 0) || ''; return seg.indexOf('순서와 상관없이') >= 0; }),
    u1_l13: (d) => { const m = d.context.match(/「안 ([가-힣]+)」/); ok(m, '잘못 쓴 말'); const cand = (d.context.match(/[가-힣]+/g) || []).filter(x => { try { return hieut(x) === m[1]; } catch (e) { return false; } }); ok(cand.length >= 1, '바른 글자 후보'); return cand[0]; }
  }
};

/* ══════════ 검사기 (사본에도 쓸 수 있게 L 을 받는다 — R 역검증) ══════════ */
function errAnswers(LX) { const er = []; let n = 0;
  KEYS.forEach(k => { const sl = LX[k].slides;
    sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { const d = s.data, at = k + ' ' + s.id; n++;
      let exp; try { exp = fx(EXP.basic[k][i])(d); } catch (e) { er.push(at + ' 풀이기 ' + e.message); return; }
      const cor = d.options.filter(o => o.correct).map(o => clean(o.text));
      if (Array.isArray(exp)) { if (!d.multi || !SAME(cor.slice().sort(), exp.slice().sort())) er.push(at + ' 모두 고르기 ' + cor.join('/') + ' ≠ ' + exp.join('/')); if (d.note.indexOf('**' + exp.length + '개**') < 0) er.push(at + ' 개수 풀이'); if (!/모두 고르세요\.$/.test(d.question)) er.push(at + ' 모두 고르기 물음 꼴'); if (exp.length >= d.options.length) er.push(at + ' 오답 보기 없음'); }
      else { if (d.multi || cor.length !== 1 || cor[0] !== clean(exp)) er.push(at + ' 정답 「' + cor.join('/') + '」 ≠ 사전 「' + exp + '」'); if (!new RegExp('\\*\\*' + String(exp).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*$').test(d.note)) er.push(at + ' 풀이 끝 ≠ 정답'); }
      if (new Set(optsT(d)).size !== d.options.length) er.push(at + ' 같은 보기 둘'); });
    const lv = sl[11].data.levels; if (!(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true)) er.push(k + ' 수준 셋·심화 open');
    ['기본', '도전'].forEach((t, i) => { n++; let exp; try { exp = fx(EXP.lev[k][i])(lv[t].q); } catch (e) { er.push(k + ' ' + t + ' 풀이기 ' + e.message); return; }
      if (clean(lv[t].a) !== clean(exp)) er.push(k + ' ' + t + ' 「' + lv[t].a + '」 ≠ 사전 「' + exp + '」'); if (!(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]) === nsp(lv[t].a))) er.push(k + ' ' + t + ' 풀이 끝'); });
    sl[15].data.items.forEach((x, i) => { n++; let exp; try { exp = fx(EXP.exit[k][i])(x.q); } catch (e) { er.push(k + ' 출구 ' + (i + 1) + ' 풀이기 ' + e.message); return; } if (clean(x.a) !== clean(exp)) er.push(k + ' 출구 ' + (i + 1) + ' 「' + x.a + '」 ≠ 사전 「' + exp + '」'); });
    const ad = sl[14].data, ae = EXP.adv[k]; n++;
    if (ae === OPEN) { if (!/^풀이: 여러 답/.test(ad.note) || !/까닭|근거/.test(ad.note)) er.push(k + ' 열린 넓히기 꼴'); }
    else { let exp; try { exp = fx(ae)(ad); } catch (e) { er.push(k + ' 넓히기 풀이기 ' + e.message); return; } const first = ((ad.note.match(/\*\*([^*]+)\*\*/) || [])[1]) || '';
      if (stem(first) !== stem(exp)) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 사전 「' + exp + '」'); } });
  return { er, n }; }
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== 'g3_korean:u6_l13') er.push('l01 from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), PEXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 1학기 u6_l13 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
function errBan(LX) { const er = [], all = JSON.stringify(LX); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」 ' + (all.match(new RegExp('.{0,12}' + b + '.{0,8}')) || [''])[0]); }); return er; }
const OLD_NAMES = ['운동회 전날', '김 서린 창문', '돌아선 등', '나중에 온 아이', '소리 돌려주는 골짜기', '수린', '도빈', '찬유', '시헌', '규안', '아율', '하나와 두리', '두리가', '두리는'];
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이');
    LX[k].slides.forEach(s => { if (s.block !== 'motivate' && s.data.kids) er.push(k + ' ' + s.id + ' 동기 장 밖 kids'); }); });
  const all = JSON.stringify(LX); OLD_NAMES.forEach(b => { if (all.indexOf(b) >= 0) er.push('옛 창작 작품·인물 「' + b + '」'); });
  return er; }
/* 교과서 낱말 표 — 활동목록.md 차시 줄(교과서 쪽·활동·발문·예시)의 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u1_l01: ['갯벌', '물놀이하기', '찰흙으로 작품 만들기', '추석에 보름달 보기', '공연이나 영화 보기', '본 것, 들은 것, 느낀 것', '언제, 어디에서, 무엇을, 누구와', '그대로 받아쓰지', '목적이나 방법', '학습 계획'],
  u1_l02: ['키를 낮출게', '김마리아', '은행잎 편지', '김홍관', '방학 때 이사 간 친구', '시 속에서 이야기하는 사람 또는 사물', '주고받으며', '돌림 노래', '박수', '전학', '사촌', '벽 부수기', '박희순', '맘속에 벽', '입장 바꿔 생각해 보기', '좋은 추억 생각해 보기', '의미 단위', '붙임딱지', '맛있는 소리', '신민규', '책에 나온 것들', '김옥애', '강아지'],
  u1_l04: ['나도 최고가 되고 싶어요', '앨리슨 워치', '천미나', '밑줄', '공기·물·햇빛·흙', '바이올렛이 최고라는 말', '최고의 원예사', '평범하다', '슬그머니', '듬뿍', '에워싸다', '내용 확인', '추론', '감상', '반으로 접어', '강낭콩', '지윤', '도움을 주었던', '혼자', '둘 가고 둘 남기', '로지야, 넌 참 대단해', '추천', '편지', '빙그레'],
  u1_l06: ['놀이기구를 탈 때 기억해요', '첫째', '둘째', '셋째', '생각이 달라도 대화로 풀어요', '대화법 전문가', '3학년', '계속 이야기하려고', '솔직하게', '선생님께 도움', '듣는 목적', '제목', '이것은', '따라서', '간단히 기록', '기호', '나쁜 듣기 습관', '내가 좋아하는 운동', '윤찬', '수영', '민이', '축구'],
  u1_l07: ['별주부전', '순서', '중요한 내용이 빠', '좋아하는 옛이야기', '호랑이를 이긴 개미', '무서워하지 않', '콧방귀', '헛발질', '요리조리', '사실 질문', '추론 질문', '인물의 특성', '일어난 일의 차례', '털 속', '다음 날', '한 편의 이야기', '인상 깊었던 부분', '활동지', '평가 자료 2', '갈대와 떡갈나무', '솜 장수와 고양이'],
  u1_l09: ['가평 잣', '보령 김', '상주 곶감', '순천 딸기', '해운대', '동백꽃', '자갈치 시장', '장소, 음식, 동물이나 식물', '듣는 목적', '책 한쪽', '우리 지역의 자랑거리', '홍천 옥수수', '울릉도 오징어', '전주 한지', '공주 알밤', '해산물', '재배', '장인', '사는 곳', '환경', '만드는 방법', '특성', '기억에 남는 부분', '궁금한 점', '소개한 글'],
  u1_l11: ['경험에 어울리는 이야기', '바위', '하나 둘 셋 찰칵! 김치, 치즈, 카프카', '까먹어도 될까요', '흥부와 놀부', '분리배출을 잘하는 방법', '음료수 캔', '통조림 캔', '신문지', '플라스틱 도시락통', '종이컵', '코팅', '페트병 뚜껑', '피자 상자', '스티로폼', '이것은 꼭 기억하세요', '실천 다짐', '사건 카드', '붙임쪽지', '빙고', '흥부 놀부 이야기', '나는, 나는 될 터이다'],
  u1_l13: ['스스로 확인하기', '듣는 목적', '제목을 보고', '기호', '첫째', '모든 내용을 옮겨 적는다', '주인공이 겪은 일', '안내 방송', '선생님 말씀', '낳아', '놓아', '좋아', '닿아', '[나아]', '[노아]', '[조아]', '[다아]', '쌓아', '넣어', '끓이다', '끊어지다', '많아지다', '생각그물', '나비', '고래', '모자', '양말', '바지', '자랑', '방학', '야구장', '먼저', '정말', '영상', '편지', '으뜸']
};
/* 옛 보탬 표(TB, archive/neutral/gen_g3s2_korean_u1.js 404~437줄) 28장의 핵심 낱말 — 본류 장(그림 포함 · extras 아님)에 있어야 한다 */
const ABSORB = {
  u1_l01: [['생각 열기 — 갯벌 이야기', ['갯벌', '조개', '새']], ['그림 가~라와 관련 있는 경험', ['물놀이하기', '찰흙으로 작품 만들기', '추석에 보름달 보기', '공연이나 영화 보기', '본 것, 들은 것, 느낀 것']], ['친구 경험 정리하기', ['언제', '어디에서', '무엇을', '누구와', '그대로 받아쓰지', '목적이나 방법']]],
  u1_l02: [['「은행잎 편지」 읽고 묻고 답하기', ['키를 낮출게', '김마리아', '주고받으며', '돌림 노래', '박수', '방학 때 이사 간 친구', '시 속에서 이야기하는 사람 또는 사물']], ['떨어져 지낸 경험과 은행잎 편지', ['전학', '사촌', '다른 반', '은행잎 편지', '생각이나 느낌이 비슷하면', '다시 읽']], ['「벽 부수기」 — 마음의 벽 경험과 바꾸어 쓰기', ['맘속에 벽', '벽의 특징', '나만의 방법', '좋은 추억 생각해 보기', '행을 나누', '붙임딱지']], ['국어활동 6~7쪽 — 재미있는 표현과 비슷한 경험', ['맛있는 소리', '신민규', '음식 먹는 소리를 다양하게', '책에 나온 것들', '김옥애', '강아지']]],
  u1_l04: [['읽기 전·읽는 중', ['제목', '밑줄', '공기·물·햇빛·흙', '그림 속']], ['내용 알기·낱말 알기와 질문 만들기', ['바이올렛이 최고라는 말', '평범하다', '슬그머니', '듬뿍', '에워싸다', '내용 확인', '추론', '감상']], ['경험 나누기 놀이', ['반으로 접어', '강낭콩', '가위', '도움을 주었던', '혼자', '로지의 마음']], ['인물에게 하고 싶은 말 · 이야기 추천', ['둘 가고 둘 남기', '로지야, 넌 참 대단해', '추천', '편지']]],
  u1_l06: [['질문·대답 정리', ['대화법 전문가', '3학년', '계속 이야기하려고', '솔직하게', '선생님께 도움']], ['간추리며 듣는 방법 표 채우기', ['듣는 목적', '제목', '첫째', '둘째', '이것은', '따라서', '기호', '놀이기구']], ['국어활동 8쪽 — 「내가 좋아하는 운동」', ['내가 좋아하는 운동', '윤찬', '수영', '민이', '축구']]],
  u1_l07: [['잘못 간추린 옛이야기 찾기', ['별주부전', '순서', '중요한 내용이 빠', '좋아하는 옛이야기']], ['「호랑이를 이긴 개미」 내용 알기·질문 만들기', ['콧방귀', '헛발질', '요리조리', '사실 질문', '추론 질문', '숲속의 왕']], ['원인 · 일어난 차례로 간추리기', ['원인', '털 속', '다음 날', '한 편의 이야기', '평가 자료 2']], ['들려주고 싶은 옛이야기 · 국어활동 9쪽', ['제목', '중요한 내용', '까닭', '갈대와 떡갈나무', '봄', '겨울', '활동지']]],
  u1_l09: [['우리 지역 자랑거리 떠올리기', ['장소, 음식, 동물이나 식물', '해운대', '동백꽃', '자갈치 시장', '가평 잣', '보령 김', '상주 곶감', '순천 딸기']], ['「우리 지역의 자랑거리」 듣고 내용 알기·낱말', ['홍천 옥수수', '울릉도 오징어', '전주 한지', '공주 알밤', '해산물', '재배', '장인', '책 한쪽']], ['나누어 정리하기 표', ['사는 곳', '환경', '맛', '만드는 방법', '특성', '전북특별자치도 전주시', '닥나무']], ['기억에 남는 부분 · 궁금한 점 · 소개 글 찾기', ['기억에 남는 부분', '궁금한 점', '소개한 글']]],
  u1_l11: [['경험에 어울리는 이야기 찾기', ['바위', '하나 둘 셋 찰칵! 김치, 치즈, 카프카', '까먹어도 될까요', '흥부와 놀부']], ['「분리배출을 잘하는 방법」 듣고 실천 다짐', ['캔', '종이', '플라스틱', '종이컵', '페트병 뚜껑', '피자 상자', '스티로폼', '이것은 꼭 기억하세요', '실천 다짐']], ['우리 반 활동 — 사건 카드 · 사건 빙고', ['나는, 나는 될 터이다', '붙임쪽지', '빙고', '흥부 놀부 이야기']]],
  u1_l13: [['스스로 확인하기 · 생활 속으로', ['듣는 목적', '제목을 보고', '기호', '첫째', '모든 내용을 옮겨 적는다', '안내 방송', '선생님 말씀']], ['받침 ㅎ 대화 읽기', ['낳아', '놓아', '좋아', '닿아', '[나아]', '[노아]', '[조아]', '[다아]', '쌓아', '넣어', '끓이다', '끊어지다', '많아지다']], ['생각그물 · 글씨 쓰기', ['생각그물', '나비', '고래', '모자', '양말', '바지', '자랑', '방학', '야구장', '먼저', '정말', '영상', '편지']]]
};
const OLD_FILES = { u1_l01: 'g3_kor_u1_l01.html', u1_l02: 'g3_kor_u1_l02_03.html', u1_l04: 'g3_kor_u1_l04_05.html', u1_l06: 'g3_kor_u1_l06.html', u1_l07: 'g3_kor_u1_l07_08.html', u1_l09: 'g3_kor_u1_l09_10.html', u1_l11: 'g3_kor_u1_l11_12.html', u1_l13: 'g3_kor_u1_l13.html' };
/* 지도서 차시 이름 · 쪽 · 학습 목표 · 성취기준 */
const TITLE = { u1_l01: '배울 내용 살펴보기', u1_l02: '경험을 떠올리며 시 읽기', u1_l04: '경험을 떠올리며 이야기 감상하기', u1_l06: '중요한 내용을 간추리며 듣는 방법 알기', u1_l07: '영상을 보고 중요한 내용 간추리기', u1_l09: '이야기를 듣고 글로 정리하기', u1_l11: '배운 내용 실천하기', u1_l13: '마무리하기' };
const PAGES = { u1_l01: '88~89', u1_l02: '90~93', u1_l04: '94~99', u1_l06: '100~103', u1_l07: '104~109', u1_l09: '110~113', u1_l11: '114~117', u1_l13: '118~119' };
const GOAL = { u1_l01: '배울 내용을 살펴볼 수 있다.', u1_l02: '경험을 떠올리며 시를 읽을 수 있다.', u1_l04: '경험을 떠올리며 이야기를 감상할 수 있다.', u1_l06: '중요한 내용을 간추리며 듣는 방법을 안다.', u1_l07: '영상을 보고 중요한 내용을 간추릴 수 있다.', u1_l09: '이야기를 듣고 글로 정리할 수 있다.', u1_l11: '배운 내용을 실천할 수 있다.', u1_l13: '배운 내용을 마무리할 수 있다.' };
const STDT = { '05-02': '자신의 경험을 바탕으로 작품 속 세계와 현실 세계를 비교하여 작품을 감상한다.', '05-05': '재미나 감동을 느끼며 작품을 즐겨 감상하는 태도를 지닌다.', '01-01': '중요한 내용과 주제를 파악하며 듣고 그 내용을 요약한다.' };
const STDC = { u1_l01: ['05-02', '01-01'], u1_l02: ['05-02', '05-05'], u1_l04: ['05-02', '05-05'], u1_l06: ['01-01'], u1_l07: ['01-01'], u1_l09: ['01-01'], u1_l11: ['05-02', '01-01'], u1_l13: ['05-02', '01-01'] };

/* 1학기 6단원 마지막 차시 — 파일에서 동적으로 읽음 */
const P6 = load(path.join(TDIR, 'data/g3_korean_u6.js'));
const PEXIT = P6.u6_l13.slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));

function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 낱말 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  Object.keys(ABSORB).forEach(k => { const main = nsp(JSON.stringify(LX[k].slides.map(s => s.data))); ABSORB[k].forEach(([title, words]) => { n++; words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(k + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }

/* ── 차례 사슬 ── */
function errOrder(LX) { const er = [];
  const t6 = LX.u1_l07.slides[6].data.fig; if (!(t6 && t6.k === 'note' && t6.items.length === 6)) er.push('l07 여섯 칸 그림'); else t6.items.forEach((it, i) => { const s = typeof it === 'string' ? it : it.t; if (s.indexOf(TIGER_KW[i]) < 0) er.push('l07 여섯 칸 ' + (i + 1) + ' 「' + s + '」 ≠ ' + TIGER_KW[i]); });
  const story = LX.u1_l07.slides[11].data.levels.심화.a; let p = -1; TIGER_STORY.forEach(kw => { const q = story.indexOf(kw, p + 1); if (q < 0 || q <= p) er.push('l07 심화 예시 차례 「' + kw + '」'); else p = q; });
  const g7 = LX.u1_l11.slides[6].data.fig; if (!(g7 && g7.k === 'note' && g7.items.length === 7)) er.push('l11 일곱 사건 그림'); else g7.items.forEach((it, i) => { const s = typeof it === 'string' ? it : it.t; if (s.indexOf(GOMSON_KW[i]) < 0) er.push('l11 사건 ' + (i + 1) + ' 「' + s + '」 ≠ ' + GOMSON_KW[i]); });
  [['u1_l06', 5, 3], ['u1_l09', 4, 2]].forEach(([k, si, nn]) => { const f = LX[k].slides[si].data.fig; const names = (f.items || []).map(x => x.name); if (!SAME(names, S.listen.slice(0, nn).map(x => x[0]))) er.push(k + ' 듣기 차례 ' + names.join('→')); });
  const ctx = LX.u1_l07.slides[14].data.context; const ps = ['봄', '여름', '가을'].map(sn => ctx.indexOf(sn + ' —')); if (!(ps[0] >= 0 && ps[0] < ps[1] && ps[1] < ps[2])) er.push('l07 갈대와 떡갈나무 계절 차례'); if (ctx.indexOf('겨울') >= 0) er.push('l07 넓히기 맥락에 겨울(답)이 보임');
  ['봄', '여름', '가을'].forEach(sn => { const st = stem(REED[sn][0]).slice(0, 6); if (nsp(ctx).indexOf(st) < 0) er.push('l07 ' + sn + ' 떡갈나무 사건 ' + st); });
  const c0 = LX.u1_l07.slides[8].data.fig; if (!(c0.k === 'link' && clean(c0.rows[0][0]) === S.cause54[0][0] && clean(c0.rows[0][1]) === S.cause54[0][1] && clean(c0.rows[1][0]) === S.cause54[1][0] && c0.rows[1][1] === '?')) er.push('l07 원인 → 그래서 일어난 일 표');
  const tk = LX.u1_l06.slides[4].data.fig; if (!(tk.k === 'link' && tk.rows.length === 3 && tk.rows.every((r, i) => clean(r[1]).indexOf(S.talkA[i]) === 0))) er.push('l06 질문-대답 표 ≠ 지도서 103쪽 대답 차례');
  return er; }

/* ── 그림 ── */
const PARTS_USED = ['text', 'mood', 'sort2', 'note', 'letter', 'sound', 'link', 'tools', 'chain'];
function errFigs(LX) { const er = []; let nF = 0, nS = 0;
  KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; nF++; const at = k + ' ' + s.id + ' ' + f.k;
    if (f.k === 'panels' ? !(f.items || []).length || f.items.some(it => !it.fig || PARTS_USED.indexOf(it.fig.k) < 0) : PARTS_USED.indexOf(f.k) < 0) er.push(at + ' 모르는 부품'); /* panels 한 칸 = 글 상자 min-width 풀기(실렌더 — 정답 공개 때 480 칸) */ const h = FIG.render(f); if (!h || /NaN|undefined|\[object/.test(h)) er.push(at + ' 렌더');
    if (f.k === 'sound') (f.items || []).forEach(it => { nS++; let want; try { want = '[' + hieut(it.w) + ']'; } catch (e) { er.push(at + ' ' + e.message); return; } if (it.s.replace(/ː/g, '') !== want) er.push(at + ' 소리 ' + it.w + ' ' + it.s + ' ≠ 규칙 ' + want); });
    if (s.block === 'basic_problem') { const d = s.data; const tx = nsp(docOf(h).body.textContent); const cs = d.options.filter(o => o.correct).map(o => clean(o.text));
      cs.forEach(a => { if (nsp(d.question).indexOf(nsp(a)) >= 0) return; if (tx.indexOf(nsp(a)) >= 0) er.push(at + ' 문제 그림에 정답 「' + a + '」'); });
      if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 3) er.push(at + ' 문제 그림 카드 ' + f.items.length + '장(넘침)'); }
    if (s.block === 'concept') { if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 4) er.push(at + ' 개념 카드 ' + f.items.length); if (f.k === 'text' && f.lines.length > 5) er.push(at + ' 글 판 ' + f.lines.length + '줄'); if (f.k === 'note' && f.items.length > 7) er.push(at + ' 메모 ' + f.items.length + '줄'); } }));
  /* 데이터 글 속 「낱말[소리]」 짝(팁 포함)도 규칙으로 */
  KEYS.forEach(k => { const all = JSON.stringify(LX[k]); let m; const re = /([가-힣]+)\[([가-힣ː]+)\]/g; while ((m = re.exec(all))) { nS++; let want; try { want = hieut(m[1]); } catch (e) { er.push(k + ' ' + e.message); continue; } if (m[2].replace(/ː/g, '') !== want) er.push(k + ' 소리 짝 ' + m[1] + '[' + m[2] + '] ≠ ' + want); } });
  const pb = LX.u1_l13.slides[3].data.fig; if (!(pb.k === 'sort2' && SAME(pb.a.items, S.persimmonOk) && SAME(pb.b.items, [S.persimmonNo]))) er.push('l13 감 바구니 ○4 ✕1 ≠ 63쪽');
  const nt = LX.u1_l13.slides[6].data.fig; if (!(nt.k === 'sort2' && nt.a.name === '동물' && SAME(nt.a.items, S.net64.동물) && nt.b.name === '옷' && SAME(nt.b.items, S.net64.옷))) er.push('l13 생각그물 보기 ≠ 64쪽');
  return { er, nF, nS }; }

/* ── 제재(작품) — 제목·지은이 · 쪽 안내 · 인용 줄 ── */
const WORKS = [
  { t: '은행잎 편지', a: '김홍관', page: '「국어」 교과서 36', cap: 4, poem: true }, { t: '벽 부수기', a: '박희순', page: '「국어」 교과서 39', cap: 4, poem: true }, { t: '키를 낮출게', a: '김마리아', cap: 4, poem: true },
  { t: '맛있는 소리', a: '신민규', page: '「국어활동」 6쪽', cap: 4, poem: true }, { t: '책에 나온 것들', a: '김옥애', page: '「국어활동」 7쪽', cap: 4, poem: true },
  { t: '나도 최고가 되고 싶어요', a: '앨리슨 워치 글, 천미나 옮김', page: '「국어」 교과서 42', cap: 4 }, { t: '나는, 나는 될 터이다', a: '양승현', cap: 4 }];
function quotedOf(LX, t) { const set = new Set(); KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f || f.k !== 'text' || String(f.title || '').indexOf('「' + t + '」') < 0) return;
  (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).filter(l => !/^\[간추림\]|^→/.test(l)).forEach(l => l.split(' / ').forEach(x => set.add(x.trim()))); })); return set; }
function errWorks(LX) { const er = []; const all = JSON.stringify(LX);
  WORKS.forEach(wk => { const re = new RegExp('「' + wk.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '」[^「」]{0,6}' + wk.a.split(' ')[0]); if (!re.test(all)) er.push('「' + wk.t + '」 지은이 ' + wk.a + ' 함께 없음');
    if (wk.page && all.indexOf(wk.page) < 0) er.push('「' + wk.t + '」 쪽 안내 ' + wk.page + ' 없음');
    const q = quotedOf(LX, wk.t); if (q.size > wk.cap) er.push('「' + wk.t + '」 인용 줄 ' + q.size + ' > ' + wk.cap); });
  return er; }

/* ── 선행 ── */
const FIRST = [['말하는 이', 'u1_l02'], ['내용 확인 질문', 'u1_l04'], ['추론 질문', 'u1_l04'], ['슬그머니', 'u1_l04'], ['첫째', 'u1_l06'], ['기호', 'u1_l06'], ['사실 질문', 'u1_l07'], ['인물의 특성', 'u1_l07'], ['일어난 일의 차례', 'u1_l07'], ['콧방귀', 'u1_l07'], ['자랑거리', 'u1_l09'], ['해산물', 'u1_l09'], ['분리배출', 'u1_l11'], ['받침 ㅎ', 'u1_l13'], ['생각그물', 'u1_l13']];
const teach = (LX, k) => JSON.stringify(LX[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => s.data)).replace(/"다음(?: 단원)?: [^"]*"/g, '') + JSON.stringify(LX[k].extras.filter(e => e.type !== 'checklist'));
function errFirst(LX) { const er = []; FIRST.forEach(([t, at]) => { const ai = KEYS.indexOf(at); KEYS.forEach((k, i) => { if (!i) return; const has = teach(LX, k).indexOf(t) >= 0; if (i < ai && has) er.push(k + ' 선행 「' + t + '」(처음은 ' + at + ')'); if (i === ai && !has) er.push(at + ' 에 「' + t + '」 없음'); }); }); return er; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드·meta ═══');
T('8차시 키(지도서 묶음 첫 번호 1·2·4·6·7·9·11·13) · 파일 data/g3s2_korean_u1.js', () => ok(SAME(Object.keys(L), KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 국어 · 1단원 · n·covers·분 = 지도서 차시 · 성취기준 문구(지도서 85쪽) · 학습 목표 · 지도서 쪽 · src_key · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 3 && m.term === 2 && m.unit === 1 && m.subject === '국어' && m.unit_title === UT && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '~' + b + '차시'), k + ' covers ' + m.covers);
  ok(m.std === STDC[k].map(c => '[4국' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.goal === GOAL[k], k + ' 학습 목표');
  ok(m.source.indexOf('지도서 1단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade3/semester2/korean/1단원_경험과관련지으며이해해요/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 기억 상자', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 + 차시 표기 · 묶음 제목에 「a~b차시」 · 합계 520분', () => { KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k]; ok(m.title.indexOf(TITLE[k]) === 0, k + ' ' + m.title); if (a !== b) ok(m.title.indexOf(a + '~' + b + '차시') >= 0, k + ' 묶음 표기'); }); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 520, '분'); });
T('[4국05-02] 차시 = 1·2~3·4~5·11~12·13 · [4국05-05] = 2~3·4~5(평가 자료 1) · [4국01-01] = 1·6·7~8(평가 자료 2)·9~10·11~12·13', () => { const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf('[4국' + c + ']') >= 0).join(); ok(has('05-05') === 'u1_l02,u1_l04', has('05-05')); ok(has('01-01') === 'u1_l01,u1_l06,u1_l07,u1_l09,u1_l11,u1_l13', has('01-01')); });
T('slug — KT2.slugOf({g:3,s:korean,t:2}) = g3s2_korean · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'korean', t: '2' }) === 'g3s2_korean', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록(text·mood·sort2·note·letter·sound·link·tools·chain)', () => PARTS_USED.forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 152장 (8 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 152, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 장면) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length === 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 8종 서로 다름 · 3-2 국어 다른 단원(2~6단원)과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 8, im.join(',')); let other = []; for (let u = 2; u <= 6; u++) { const f = path.join(TDIR, 'data/g3s2_korean_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => ((l.slides || [])[2] || {}).data).filter(Boolean).map(d => d.img).filter(Boolean)); } ok(other.length > 20 && !im.some(x => other.indexOf(x) >= 0), '겹침 · 다른 단원 ' + other.length); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });
T('교실 활동 장 글 길이(넘침 미리 피하기) — goal ≤ 45자 · steps 4개 각 ≤ 45자 · solo 2~3개 각 ≤ 40자', () => KEYS.forEach(k => { const d = L[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); d.steps.forEach(s => ok(s.length <= 45, k + ' step ' + s.length + ' ' + s)); ok(d.solo.length >= 2 && d.solo.length <= 3, k + ' solo 수'); d.solo.forEach(s => ok(s.length <= 40, k + ' solo ' + s.length + ' ' + s)); ok(d.minutes === d.tnote.min, k + ' 활동 분'); }));

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 1학기 6단원 마지막 차시(g3_korean u6_l13) 출구 — 파일에서 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 2단원 유창하게 읽고 발표해요 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u1_l13.slides[18].data; ok(nx.title === '다음 단원엔' && /유창하게 읽고 발표해요/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 풀기 (지도서 사전·표) ═══');
const EA = errAnswers(L);
T('기본 24 · 수준별 기본·도전 16 · 출구 24 · 넓히기 8 = 게이트가 다시 푼 정답', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 푼 정답 = 72', () => ok(EA.n === 72, EA.n));
T('모두 고르기 ≥ 3 · 낱말 뜻 물음 ≥ 8 · 소리 물음 ≥ 5(사전·규칙이 실제로 쓰임)', () => { let ms = 0, wq = 0, hq = 0; const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => { if (s.data.multi) ms++; qs.push(s.data.question); }); const lv = sl[11].data.levels; qs.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => qs.push(x.q)); });
  qs.forEach(q => { if (/라는 뜻의 낱말/.test(q)) wq++; if (/어떻게 소리 날까요/.test(q)) hq++; }); ok(ms >= 3 && wq >= 8 && hq >= 5, ms + '/' + wq + '/' + hq); });
T('풀이기 자체 확인 — 받침 ㅎ 규칙(ㅎ·ㄶ·ㅀ) · 뜻 역찾기 · 틀린 것 잡음', () => { ok(hieut('낳아') === '나아' && hieut('놓아') === '노아' && hieut('좋아') === '조아' && hieut('닿아') === '다아' && hieut('쌓아') === '싸아' && hieut('넣어') === '너어', 'ㅎ');
  ok(hieut('끓이다') === '끄리다' && hieut('끊어지다') === '끄너지다' && hieut('많아지다') === '마나지다', '겹받침'); let c = 0; try { hieut('먹어'); } catch (e) { c++; } try { WORD('「아주 빠르게」라는 뜻의 낱말은 무엇일까요?'); } catch (e) { c++; } ok(c === 2, '안 걸리는 것 못 잡음');
  ok(WORD('「둘레를 빙 둘러싸다」라는 뜻의 낱말은 무엇일까요?') === '에워싸다' && HIEUT('「좋아」는 어떻게 소리 날까요?') === '[조아]', '역찾기'); });

console.log('═══ F. 차례 사슬 ═══');
T('호랑이 여섯 칸 · 심화 예시 글 차례 · 곰손 일곱 사건 · 듣기 전→중→후 · 갈대와 떡갈나무 봄→여름→가을(겨울은 답이라 맥락에 없음) · 원인 → 그래서 일어난 일 · 질문-대답 차례', () => { const e = errOrder(L); ok(!e.length, e.join(' | ')); });
T('흥부 놀부 다음 사건 = 117쪽 아홉 사건 표에서 다시 냄(오답 보기도 아홉 사건 안)', () => { const d = L.u1_l11.slides[10].data; ok(clean(d.options.find(o => o.correct).text) === NEXT_HEUNG(d), '다음 사건'); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nF + '개 — 쓰는 부품만 · 렌더 · 받침 ㅎ 소리(' + EF.nS + ') = 규칙 · 문제 그림 정답 숨김 · 문제 카드 ≤ 3 · 감 바구니·생각그물 = 교과서', () => ok(!EF.er.length && EF.nS >= 10, EF.nS + ' ' + EF.er.slice(0, 6).join(' | ')));
T('개념 32장 · 기본 문제 24장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 32 && p === 24, c + '/' + p); });
T('개념 글 3줄 이하(큰 그림 · 넘침 미리 피하기)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 3, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
T('그림 검사기 자체 확인 — 틀린 소리 · 문제 그림 속 정답 · 넘치는 카드 · 모르는 부품 잡음', () => { const X = clone(L); X.u1_l13.slides[5].data.fig.items[0].s = '[나하]'; X.u1_l13.slides[9].data.fig = { k: 'sound', items: [{ w: '닿아', s: '[다아]' }] }; X.u1_l06.slides[9].data.fig.items.push({ name: 'a' }, { name: 'b' }); X.u1_l01.slides[3].data.fig = { k: 'zzz' };
  const e = errFigs(X).er.join(' | '); ok(/소리 낳아/.test(e) && /정답 「\[다아\]」/.test(e) && /카드 4장/.test(e) && /모르는 부품/.test(e), e.slice(0, 200)); });

console.log('═══ H. 재료 충실 · 교과서 낱말 · 보탬 흡수 ═══');
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(clean(lines(src.slides[i].text)) === clean(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.options.map(o => o.text), p.opts), s.id + ' 보기'); const ci = Array.isArray(p.ci) ? p.ci : [p.ci]; ok(SAME(d.options.map((o, j) => !!o.correct), p.opts.map((_, j) => ci.indexOf(j) >= 0)), s.id + ' 정답 표시'); });
  const nx = L[k].slides[18].data; if (k !== 'u1_l13') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 낱말 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음(활동목록.md)', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 낱말 표 자체 확인 — 다른 차시 낱말은 없음(l02 에 「분리배출」 · l11 에 「은행잎 편지」 없음)', () => { ok(nsp(JSON.stringify(L.u1_l02)).indexOf('분리배출') < 0, 'l02'); ok(nsp(JSON.stringify(L.u1_l11)).indexOf('은행잎편지') < 0, 'l11'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말이 본류 장(그림 포함 · extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 28, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
T('한 차시 안에서 같은 물음 중복 0 · 수준별 기본·도전 물음 ≠ 기본 문제·출구 물음', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));
T('src 회수 키 = 옛 src file 칸(자기주도 파일 이름) 그대로 — 투영 지도 바뀜 0', () => KEYS.forEach(k => ok(SRC[k].file === OLD_FILES[k], k + ' ' + SRC[k].file)));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 분 · 물음 끝맺음 · 지도서 유의점 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 — 40분 차시 30~45 · 80분 묶음 60~80', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0), d = L[k].meta.duration_min; ok(d === 40 ? m >= 30 && m <= 45 : m >= 60 && m <= 80, k + ' ' + m + '분/' + d); }));
T('학생이 읽는 물음 끝 = 「요?」(모두 고르기만 「세요.」) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question, s.data.multi])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.forEach(x => qs.push([k + ' 출구', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q, ms]) => { const t = clean(q); return ms ? !/모두 고르세요\.$/.test(t) : !/요\?$/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의점이 교사 층에 — 틀린 답 없음·호기심·목적이나 방법(l01) · 생각이나 느낌이 비슷·행 나누기·주고받기·벽의 특징(l02) · 그림 속·둘 가고 둘 남기·허용적·다르게 짐작(l04) · 그대로 옮겨 쓰는 것이 아니·활동 질문·나쁜 듣기 습관(l06) · 문제 풀이 학습 모형·인물의 특성·한 편의 이야기(l07) · 자신의 말로 다시 만드·책 한쪽·시범(l09) · 상의·까닭(l11) · 그대로·보조선(l13)', () => { const tx = (k) => JSON.stringify(L[k]);
  [['u1_l01', [/틀린 답이 없/, /호기심/, /목적이나 방법/]], ['u1_l02', [/생각이나 느낌이 비슷/, /행을 나누|뜻 덩어리/, /주고받/, /벽의 특징/]], ['u1_l04', [/그림 속/, /둘 가고 둘 남기/, /허용적/, /다르게 짐작/]], ['u1_l06', [/그대로 옮겨 쓰는 것이 아니/, /활동 질문/, /나쁜 듣기 습관/]],
   ['u1_l07', [/문제 풀이 학습 모형/, /인물의 특성/, /한 편의 이야기/]], ['u1_l09', [/자신의 말로 다시 만드/, /책 한쪽/, /시범/]], ['u1_l11', [/상의/, /까닭/]], ['u1_l13', [/그대로/, /보조선/]]].forEach(([k, res]) => res.forEach(re => ok(re.test(tx(k)), k + ' ' + re))); });

console.log('═══ L. 선행 ═══');
const EFI = errFirst(L);
T('처음 배우는 차시 전에는 그 말 0 · 그 차시에는 있음 (l01 단원 도입 · 복습·다음 장 · 다음 시간 준비 카드 예외) — ' + FIRST.length + '말', () => ok(!EFI.length, EFI.join(' | ')));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('렌더된 그림 속 「결」·겹낫표 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) { const h = FIG.render(s.data.fig); ok(h.indexOf('결') < 0 && !/[『』]/.test(h), k + ' ' + s.id); } })));
T('교사 화면(렌더 글자)에 영어 코드(u1 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~F)만', () => { KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(/^[A-F]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1, k: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ N. 제재 — 제목·지은이 · 쪽 안내 · 인용 줄 ═══');
T('작품 ' + WORKS.length + '편 — 제목 곁에 지은이 · 교과서 쪽 안내 · 인용 줄 ≤ 4(그림 글 판 전부 · [간추림]·→ 빼고 · 시는 행)', () => { const e = errWorks(L); ok(!e.length, e.join(' | ')); });
T('시 글 판에는 [간추림] 줄과 「→ 「국어」 교과서 ○○쪽」 안내가 함께 있음 · 이야기 글 판 3장 모두 쪽 안내', () => { ['은행잎 편지', '벽 부수기'].forEach(t => { const f = L.u1_l02.slides.find(s => s.block === 'concept' && s.data.fig && s.data.fig.k === 'text' && s.data.fig.title.indexOf(t) >= 0).data.fig; ok(f.lines.some(l => /^\[간추림\]/.test(l)) && f.lines.some(l => /^→ 「국어」 교과서 \d+/.test(l)), t); });
  const st = L.u1_l04.slides.filter(s => s.block === 'concept' && s.data.fig.k === 'text'); ok(st.length === 3 && st.every(s => s.data.fig.lines.some(l => /^→ 「국어」 교과서 4\d/.test(l))), '이야기 쪽 안내'); });
T('인용 셈 자체 확인 — 「은행잎 편지」 지금 4행 · 한 줄 더하면 5', () => { ok(quotedOf(L, '은행잎 편지').size === 4, quotedOf(L, '은행잎 편지').size); const X = clone(L); X.u1_l02.slides[3].data.fig.lines.splice(1, 0, '떨어진 은행잎에'); ok(quotedOf(X, '은행잎 편지').size === 5, '셈'); });

console.log('═══ O. 정답이 하나가 아님 ═══');
T('심화 = open · 답은 「여러 답 (예:」로 시작', () => KEYS.forEach(k => { const v = L[k].slides[11].data.levels.심화; ok(v.open === true && /^여러 답 \(예:/.test(v.a), k); }));
T('열린 장(오개념 바른 생각·넓히기·심화에 「사람마다/여러 답」 + 「까닭/근거」) ≥ 4차시 · l01 오개념 = 사람마다 다름 · l04 = 생각이나 느낌이 비슷', () => { const n = KEYS.filter(k => { const sl = L[k].slides; return [sl[7].data.right, sl[14].data.note, sl[11].data.levels.심화.q + ' ' + sl[11].data.levels.심화.a].some(t => /사람마다|여러 답/.test(t) && /까닭|근거/.test(t)); }).length; ok(n >= 4, n);
  ok(/사람마다/.test(L.u1_l01.slides[7].data.right) && /생각이나 느낌이 비슷/.test(L.u1_l04.slides[7].data.right), '오개념'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('기본 문제 정답 바꿈(l07 ① 가려움 → 콧방귀 보기)', X => { const d = X.u1_l07.slides[8].data; d.options[0].correct = false; d.options[1].correct = true; }, X => errAnswers(X).er);
red('출구 낱말 뜻 정답 바꿈(l09 장인 → 재배)', X => { X.u1_l09.slides[15].data.items[0].a = '재배'; }, X => errAnswers(X).er);
red('수준별 소리 정답 바꿈(l13 [끄리다] → [끌히다])', X => { X.u1_l13.slides[11].data.levels.도전.a = '[끌히다]'; }, X => errAnswers(X).er);
red('복습 계보 끊음(l06 복습 한 줄 바꿈)', X => { X.u1_l06.slides[1].data.items[0].a = '말하는 사람'; }, errReview);
red('l01 복습을 1학기 아닌 것으로', X => { X.u1_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l07 개념 「원인과 결과」)', X => { X.u1_l07.slides[3].data.content += ' 원인과 결과를 생각해요.'; }, errBan);
red('보탬 카드 b_l2_1 되살림', X => { X.u1_l02.extras.push({ id: 'b_l2_1', type: 'other_activity', title: '교과서 활동', content: '은행잎 편지' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지우고 extras 로만(l04 둘 가고 둘 남기)', X => { X.u1_l04.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/둘 가고 둘 남기/g, '모둠 돌기')); }); }, X => errAbsorb(X).er);
red('교과서 낱말 지움(l09 공주 알밤)', X => { X.u1_l09 = JSON.parse(JSON.stringify(X.u1_l09).replace(/공주 알밤/g, '공주 밤')); }, errTB);
red('인용 줄 넘침(「벽 부수기」 원문 두 행 더함)', X => { X.u1_l02.slides[6].data.fig.lines.splice(1, 0, '말도 하고 싶지 않고 / 보고 싶지도 않고'); }, errWorks);
red('지은이 지움(「은행잎 편지」 김홍관)', X => { X.u1_l02 = JSON.parse(JSON.stringify(X.u1_l02).replace(/김홍관/g, '')); }, errWorks);
red('여섯 칸 차례 바꿈(l07 셋째·넷째 칸)', X => { const it = X.u1_l07.slides[6].data.fig.items; [it[2], it[3]] = [it[3], it[2]]; }, errOrder);
red('받침 ㅎ 소리 카드 틀림(l13 좋아 → [조하])', X => { X.u1_l13.slides[5].data.fig.items[2].s = '[조하]'; }, X => errFigs(X).er);
red('문제 그림에 정답 보임(l11 ② 메모에 정답)', X => { X.u1_l11.slides[9].data.fig.items[2] = '이것은 꼭 기억하세요 → 더러운 것은 깨끗이 씻어 버려야 해요'; }, X => errFigs(X).er);
red('인물 바꿈(l07 곰이 → 수린)', X => { X.u1_l07.slides[2].data.kids[0].label = '수린\n"어?"'; }, errPeople);
red('선행 말 앞당김(l04 개념에 「기호」)', X => { X.u1_l04.slides[3].data.content += ' 기호로 정리해요.'; }, errFirst);

console.log('\n게이트 g3s2 국어 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
