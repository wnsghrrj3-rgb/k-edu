/* gate_g3s2_korean_u4.js — 3학년 2학기 국어 4단원 「서로 존중하며 대화해요」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g3s2_korean_u1 틀 + 높임 사전 대조).
   옛 게이트(38차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g3s2_korean_u4.js 에 보관. 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(3학년 2학기 · 4단원 · 지도서 차시 묶음 · 성취기준 문구 · 학습 목표 · 분 · 지도서 쪽 · live_url · theme) · 부품 등록 · slug g3s2_korean
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 동기 장 + 장면) · 실사 자리 9종 서로 다름 · 3-2 국어 다른 단원과 겹침 0 · 교실 활동 글 길이
   D 복습 계보(l01 = 3단원 마지막 차시 출구 — 3단원 데이터에서 마지막 키를 동적으로 읽어 대조 → 이후 = 직전 차시 출구) · 마지막 = 5단원 「사전으로 여는 세상」 예고
   E 정답 다시 풀기 — 게이트 자체 사전으로 푼다: 높임의 뜻이 있는 낱말 표(지도서 258쪽) 역찾기 · 고친 표현 표(186~187·196~197·265·288·293쪽) · 높임 방법 표(185쪽 · 국어활동 58쪽)
       · 높임 대상 표(185쪽 민수와 아버지) · 낱말 관계 표(195쪽) · 방언 표(214쪽) · 부탁·거절 예절 표(270~271쪽) · 전화 예절 ○✕ 표(205·214쪽) · 사과 넷 ○✕(213쪽) · 사실 표 → 기본 27 · 수준별 18 · 출구 27 · 넓히기 9 = 81
   F 차례 사슬 — 범수의 마음 변화(어색함 → 왕자처럼 좋음 → 부끄러움 → 뉘우침)와 이야기 사건 차례 · 모둠 대화 네 차례 · 대화 상대 → 목적 → 방식 · 기억 놀이 ①~④ · 평가 자료 1 ㉠~㉣ · 무엇을 배울까요 여섯 칸
   G 그림 — 렌더 · 쓰는 부품만(text·mood·sort2·note·letter·link·tools·chain + panels 안쪽) · 높임 낱말 메모 = 사전 · 낱말 관계 표 = 사전 · 방언 표 = 사전 · 사과 넷 ○2 ✕2 · 문제 그림이 정답을 보이지 않음 · 문제 카드 ≤ 3(넘침)
   H 재료 충실(개념·문제·다음 = src) · 교과서 낱말 표(활동목록.md 차시별) · 보탬 흡수 대조(옛 TB 33장 핵심 낱말이 본류 장에 · b_l id 0) · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 분(40분 30~45 · 80분 60~80) · 물음 끝 「요?」 · 지도서 유의점이 교사 층에
   L 선행(높임 표현의 뜻·공식적 l02 · ‘-시-’·께서·높임의 뜻이 있는 낱말 l03 · 범수·낱말 관계 l05 · 대화 예절의 뜻·효진 l07 · 대화 상황·귓속말·끝인사 l08 · 몸짓·역할놀이·점검표 l10 · 다짐판·기억 놀이 l12 · 방언·표준어 l14 — l01 단원 도입 예외)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 교사 화면 영어 코드 0 · 인물 = 곰이·펭이(+ 교과서 인물) · 옛 창작 인물 0
   N 제재 — 작품마다 제목·지은이 · 교과서 쪽 안내 · 작품별 인용 줄 ≤ 4(그림 text 를 모두 모아 셈 · [간추림]·→ 줄 빼고) · 「아드님, 진지 드세요」 원문 문장(교과서 활동 글 포함) 덱 전체 ≤ 12
   O 정답이 하나가 아님 — 심화 open · 「여러 답 (예:」 · 열린 장(사람마다·여러 답 + 까닭·근거) ≥ 4차시
   R 역검증 레드 — 망가뜨린 사본(정답 · 높임 낱말 · 고친 표현 · 복습 · 「결」 · b_ 카드 · 보탬 낱말 · 교과서 낱말 · 인용 줄 · 지은이 · 차례 · 문제 그림 · 인물 · 선행 · 높임 낱말 메모)을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_korean_u4.js */
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
const L = load(path.join(TDIR, 'data/g3s2_korean_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u4.json'), 'utf8'));
const KEYS = ['u4_l01', 'u4_l02', 'u4_l03', 'u4_l05', 'u4_l07', 'u4_l08', 'u4_l10', 'u4_l12', 'u4_l14'];
const COV = { u4_l01: [1, 1], u4_l02: [2, 2], u4_l03: [3, 4], u4_l05: [5, 6], u4_l07: [7, 7], u4_l08: [8, 9], u4_l10: [10, 11], u4_l12: [12, 13], u4_l14: [14, 14] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '서로 존중하며 대화해요';

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

/* ══════════ 지도서 사전·표 (게이트 자체 — 생성기와 따로 옮김) ══════════ */
/* 높임의 뜻이 있는 특별한 낱말 — 지도서 258쪽 표 + 264쪽 짝 찾기(말-말씀) */
const HONW = { 나이: ['연세'], 밥: ['진지'], 생일: ['생신'], 병: ['병환'], 사람: ['분'], 집: ['댁'], 이름: ['성함'], 딸: ['따님'], 아들: ['아드님'], 아프다: ['편찮으시다'], 있다: ['계시다'], 자다: ['주무시다'],
  주다: ['드리다', '올리다'], 죽다: ['돌아가시다'], 먹다: ['잡수시다', '드시다'], 묻다: ['여쭙다', '여쭈다'], 보다: ['뵈다', '뵙다'], 말: ['말씀'] };
/* 잘못된 높임 표현 → 고친 표현 — 186쪽 3번 · 187쪽 4번 · 196쪽 장면 · 197쪽 · 265쪽 참고 자료 · 266쪽 활동지 · 288쪽 만화 · 293쪽 평가 자료 1 · 265쪽 ‘있으시다’ */
const FIX = { '제품이시고요': '제품이에요', '아메리카노 나오셨습니다': '아메리카노 나왔습니다', '매진되셨어요': '매진되었어요', '인사하고': '인사드리고', '집': '댁', '떡이세요': '떡이에요',
  '오나요': '오시나요', '데리러': '모시러', '할머니가': '할머니께서', '할게': '할게요', '있으시니': '계시니', '손님, 이쪽으로 오실게요': '손님, 이쪽으로 오세요', '선생님이 너 오래': '선생님께서 너 오라고 하셔',
  '오늘 저녁 반찬은 뭐야?': '오늘 저녁 반찬은 뭐예요?', '먹어 볼래요': '드셔 보시겠어요', '할머니, 생일 축하해': '할머니, 생신 축하드려요', '올해 나이가 몇 살이야?': '올해 연세가 어떻게 되세요?' };
/* 높임 방법 — 185쪽 1번 (2) 선 잇기 · 「국어활동」 58쪽 1번 예시 답안(①‘-습니다’·‘요’ ②‘-시-’ ③‘께서’·‘께’ ④높임의 뜻이 있는 낱말) */
const M185 = { '가시니': ['께서', '-시-'], '여쭈어보자': ['높임의 뜻이 있는 낱말'], '다녀오겠습니다': ['-습니다', '요'] };
const M58 = { '할아버지, 그동안 잘 지내셨어요?': ['-습니다·요', '-시-'], '이 내용은 선생님께 여쭈어보자.': ['께서·께', '높임의 뜻이 있는 낱말'] };
/* 높임의 대상 — 185쪽 2번 예시 답안 */
const TARGET = { '오시는': '할아버지', '모시러': '할아버지', '께': '할아버지', '드렸대': '할아버지', '가요?': '아버지' };
const HONPARTS = { '할머니께 드릴 선물이야.': ['께', '드릴'] };                                            // 181쪽 · 254쪽 유의점
const REL = { '식탁|가구': '한 낱말이 다른 낱말의 뜻을 포함하는 관계', '고치다|바로잡다': '서로 뜻이 비슷한 관계', '가르치다|배우다': '서로 뜻이 반대인 관계' }; // 195쪽
const DIAL = { '가우, 가새, 가시개': '가위', '개구락지, 까구리, 깨구리': '개구리' };                         // 214쪽 2번
const REFUSE = { '동호야, 지금 뭐 해? 나 좀 도와줄 수 있어?': '친구가 부탁을 들어줄 수 있는 상황인지 확인했어요', '미안해. 나 지금 선생님 심부름 가는 길이어서 안 될 것 같아.': '미안한 마음을 표현하고, 도와줄 수 없는 까닭을 자세히 말했어요',
  '혹시 같이 좀 들어 줄 수 있어?': '부탁하는 까닭과 부탁하는 내용을 자세하게 말했어요', '도와줘서 고마워.': '부탁을 들어준 친구에게 고마운 마음을 표현했어요' };   // 270~271쪽 활동지
const PHONE6 = { ok: ['자신이 누구인지 밝히고, 상대가 누구인지 확인한다', '상대가 통화하기 괜찮은 상황인지 확인한다', '통화를 마칠 때에는 끝인사를 한다'], no: ['상대가 전화를 받을 때까지 계속해서 전화를 건다', '하고 싶은 말을 다 했으면 언제든 전화를 끊는다'] }; // 205쪽 6번
const PHONE214 = { ok: ['자신이 누구인지 밝히고 상대를 확인한다', '공공장소에서는 작은 목소리로 통화한다', '상대가 말할 때에는 귀 기울여 듣는다', '상대의 상황을 생각하여 대화한다'], no: ['전화를 끊고 싶으면 언제든지 바로 전화를 끊는다', '상대가 전화를 받으면 자신이 하고 싶은 말부터 먼저 한다'] }; // 214쪽 1번
/* 문제 보기(실렌더 높이 — 보기 30자 안팎으로 줄인 꼴 · 뜻은 같은 쪽 표 그대로) */
const PHONE6S = { ok: ['자신을 밝히고 상대를 확인한다', '통화하기 괜찮은지 확인한다', '마칠 때 끝인사를 한다'], no: ['받을 때까지 계속 전화를 건다', '말을 다 했으면 언제든 끊는다'] };
const APPLES = { ok: ['웃어른께는 ‘-시-’, ‘-습니다’ 같은 높임 표현을 쓴다', '통화를 마칠 때에는 끝인사를 한다'], no: ['어디서든 잘 들리게 큰 소리로 말한다', '‘밥’, ‘생일’은 높임의 뜻이 있는 낱말이다'] };
const APPLE = { ok: ['대화하는 상대가 웃어른일 때에는 ‘-시-’, ‘-습니다’와 같은 높임 표현을 사용한다', '통화를 마칠 때에는 끝인사를 한다'], no: ['언제 어디에서든 자신의 말이 잘 들릴 수 있도록 큰 소리로 대화한다', '‘밥’, ‘생일’은 높임의 뜻이 있는 낱말이다'] }; // 213쪽
/* 지도서 사실 표 — 쪽마다 예시 답안 */
const S = {
  yuchanWhy: '대화하는 상대가 달라져서', yuchanWhat: '국어사전을 빌릴 수 있을지 묻는 내용', manners179: ['도서관에서는 작게 말하기', '할 말이 끝났는지 살피고 끝인사 하기'], firstWord: '제가', place179: '도서관', // 177~179쪽
  cause: '대화하는 상대', sub: ['높임 표현을 바르게 사용하기', '대화 예절을 지키며 대화하기'],
  subOrder: [['높임 표현을 사용하는 상황 알기', '높임 표현을 바르게 사용하는 방법 알기', '높임 표현을 바르게 사용하여 대화하기'], ['대화 예절의 중요성 알기', '상황에 알맞은 대화 예절 알기', '상황에 알맞은 대화 예절을 지키며 대화하기']], // 179쪽
  birthday: '㉮ 진우 · ㉯ 할아버지', situWords: ['웃어른', '공식적', '존중'], meeting: '학급 회의 같은 공식적 상황이라서', def: '높임 표현', official: '공식적 상황', respect: '존중', // 180~183쪽
  jiwoonEat: '잡수시면', evalA: [['오나요', '오시나요'], ['데리러', '모시러'], ['할머니가', '할머니께서'], ['할게', '할게요']],                      // 187쪽 (1) · 293쪽
  secret: '비밀 모의를 하고 범수에게 높임말을 쓰셨어요', bounce: '왕자가 된 것처럼 기분이 좋아서', promise: '누구에게나 높임말을 잘 쓰겠다',            // 195쪽 내용 알기
  moodFlow: ['어색함', '왕자처럼 좋음', '부끄러움', '뉘우침'], storyOrder: ['비밀 모의', '왕자', '마트', '태권도장', '약속'],                            // 262쪽 유의점
  call: '효진 「야!」 · 소영 「동호야.」', why: '소영이가 동호를 배려하며 조심스럽게 부탁해서', face: '화난 표정', title: '호칭', etq: '대화 예절', care: '배려', misund: '오해', // 198~200쪽
  polite: '「문 좀 닫을래?」와 「문 좀 닫아 주겠니?」',                                                                                         // 273쪽
  place: '운동장과 달리 도서관에서는 조용히 말해야 해서', blank203: ['공공장소', '공손한', '주제', '귓속말'], hyejin: '태수가 모둠 활동과 관련 없는 이야기를 해서', // 201~203쪽
  steps: ['주제 확인하기', '의견 마련하기', '의견 모으기', '의견 정하기'], way: '방식', ident: '상대가 누구인지', whisper: '귓속말',                       // 277쪽(「의견 결정하기」 → 「의견 정하기」) · 205쪽
  situB: '어머니 · 부탁을 거절하려고 · 직접 만나서 대화', planRows: ['대화 상대', '대화 목적', '대화 방식'], jiwon: '아…… 어떡하죠? 저 친구랑 만나기로 약속한 시간이라 나가 봐야 하거든요', // 206~207쪽
  check209: ['대화 상대에 알맞은 대화 예절을 지켰나요?', '대화 목적에 알맞은 대화 예절을 지켰나요?', '대화 방식에 알맞은 대화 예절을 지켰나요?'], wayA: '전화 대화', // 209쪽 점검표
  tones: { 지욱: '즐거운 말투', 혜인: '어쩔 줄 몰라 하는 말투', 남수: '기뻐하는 말투' }, plan: '대화 방식', tone: '말투', turns: '두 번',                // 280·282쪽
  pledges: ['친구의 말을 존중하고 고운 말을 사용하겠습니다', '친구의 말을 끝까지 귀담아듣겠습니다'], game: ['색깔별로', '가위바위보', '한 장씩 뒤집기', '뜻이 같으면'], same: '뜻', keep: '지킬 점', // 210~211쪽
  dialectDef: '표준어', appleSi: '-시-', phoneIdent: '자신이 누구인지 밝히고'                                                                     // 213~214쪽
};

/* ── 풀이기(문항 하나 → 게이트가 낸 정답) ── */
const quotes = (t) => (clean(t).match(/「[^」]+」/g) || []).map(x => x.slice(1, -1));
const HON = (q) => { const m = clean(q).match(/「([^」]+)」(?:의 높임의 뜻이 있는 낱말은| 대신 쓴 높임 표현은)/); ok(m, '높임 낱말 물음 꼴 아님 ' + q); const v = HONW[m[1]]; ok(v && v.length === 1, '사전에 하나로 없는 낱말 ' + m[1]); return v[0]; };
const FIXQ = (txt) => { const qs = quotes(txt); let hits = []; qs.forEach(x => { const k = x.replace(/[.]$/, ''); if (FIX[k]) hits.push(FIX[k]); });
  if (!hits.length) qs.forEach(x => Object.keys(FIX).filter(k => k.length >= 2 && x.indexOf(k) >= 0).forEach(k => hits.push(FIX[k]))); hits = Array.from(new Set(hits)); ok(hits.length === 1, '고친 표현 후보 ' + hits.length + ' ' + clean(txt).slice(0, 40)); return hits[0]; };
const RELQ = (q) => { const qs = quotes(q); const k = Object.keys(REL).filter(p => { const [a, b] = p.split('|'); return qs.indexOf(a) >= 0 && qs.indexOf(b) >= 0; }); ok(k.length === 1, '낱말 관계 짝 ' + k.length); return REL[k[0]]; };
const DIALQ = (q) => { const k = quotes(q).filter(x => DIAL[x]); ok(k.length === 1, '방언 ' + k.length); return DIAL[k[0]]; };
const METHODQ = (q) => { const qs = quotes(q); let list = null; qs.forEach(x => { if (M58[x]) list = M58[x]; }); if (!list) qs.forEach(x => Object.keys(M185).forEach(k => { if (x.indexOf(k) >= 0) list = M185[k]; }));
  ok(list, '방법 표에 없는 말'); const named = (clean(q).match(/‘([^’]+)’와 무엇/) || [])[1]; ok(named, '물음에 이미 나온 방법'); const rest = list.filter(x => x.indexOf(named) < 0); ok(rest.length === 1, '남은 방법 ' + rest.length); return rest[0]; };
const optsT = (d) => d.options.map(o => clean(o.text));
const HONPAIR = (d) => { const c = optsT(d).filter(t => { const m = t.match(/^(\S+) — (\S+)$/); return m && (HONW[m[1]] || []).indexOf(m[2]) >= 0; }); ok(c.length === 1, '바른 짝 ' + c.length); return c[0]; };
const FIXPAIR = (d) => optsT(d).filter(t => { const m = t.match(/^(.+) → (.+)$/); return m && FIX[m[1]] === m[2]; });
const MINSU = (d) => optsT(d).filter(t => { const ws = (t.replace(/‘[^’]+’ 대신 /g, '').match(/‘[^’]+’/g) || []).map(x => x.slice(1, -1)); ok(ws.length, '반응 속 낱말 없음 ' + t); const who = /할아버지를 높이/.test(t) ? '할아버지' : '?'; return ws.every(x => TARGET[x] === who); });
const PARTS = (d) => { const k = quotes(d.question).filter(x => HONPARTS[x]); ok(k.length === 1, '높임 조각 문장'); return optsT(d).filter(t => HONPARTS[k[0]].indexOf(t) >= 0); };
const REFUSEQ = (d) => { const k = quotes(d.question).filter(x => REFUSE[x]); ok(k.length === 1, '활동지 장면'); optsT(d).forEach(t => ok(Object.values(REFUSE).indexOf(t) >= 0, '보기가 활동지 보기 표에 없음 ' + t)); return REFUSE[k[0]]; };
const AMONG = (list) => (d) => optsT(d).filter(t => list.indexOf(t) >= 0);
const NOTOK = (tab) => (d) => { const out = optsT(d).filter(t => tab.ok.indexOf(t) < 0); ok(out.length === 1 && tab.no.indexOf(out[0]) >= 0, '알맞지 않은 보기 ' + out.length); return out[0]; };
const PLEDGE = (d) => { const c = optsT(d).filter(t => S.pledges.indexOf(t) >= 0); ok(c.length === 1, '교과서 다짐 보기 ' + c.length); return c[0]; };
const NEXTSTEP = (q) => { const m = clean(q).match(/「([^」]+)」 다음은/); ok(m, '차례 물음 꼴'); const i = S.steps.indexOf(m[1]); ok(i >= 0 && i < S.steps.length - 1, '차례 표에 없음'); return S.steps[i + 1]; };
const TONEQ = (t) => { const ns = Object.keys(S.tones).filter(n => clean(t).indexOf(n) >= 0); ok(ns.length === 1, '말투 인물 ' + ns.length); return S.tones[ns[0]]; };
const WHO = (kw) => (d) => { const c = ['곰이', '펭이'].filter(n => { const seg = d.context.split(/[,.]/).find(x => x.indexOf(n) >= 0) || ''; return seg.indexOf(kw) >= 0; }); ok(c.length === 1, '넓히기 인물 ' + c.length); return c[0]; };
const OPEN = 'OPEN';
const fx = (f) => (typeof f === 'function' ? f : () => f);
const EXP = {
  basic: {
    u4_l01: [S.yuchanWhy, S.yuchanWhat, AMONG(S.manners179)],
    u4_l02: [S.birthday, PARTS, (d) => S.situWords.join(' · ')],
    u4_l03: [MINSU, (d) => FIXQ(d.question), FIXPAIR],
    u4_l05: [S.secret, (d) => RELQ(d.question), (d) => FIXQ(d.question)],
    u4_l07: [S.call, S.why, REFUSEQ],
    u4_l08: [S.place, (d) => S.blank203.join(' · '), (d) => { optsT(d).forEach(t => ok(PHONE6S.ok.concat(PHONE6S.no).indexOf(t) >= 0, '전화 예절 표에 없는 보기 ' + t)); return AMONG(PHONE6S.ok)(d); }],
    u4_l10: [S.situB, S.jiwon, AMONG(S.check209)],
    u4_l12: [HONPAIR, PLEDGE, (d) => FIXQ(d.question)],
    u4_l14: [(d) => { optsT(d).forEach(t => ok(APPLES.ok.concat(APPLES.no).indexOf(t) >= 0, '사과 표에 없는 보기 ' + t)); return AMONG(APPLES.ok)(d); }, (d) => DIALQ(d.question), NOTOK(PHONE214)]
  },
  lev: {
    u4_l01: [S.firstWord, S.place179], u4_l02: [(q) => HON(q), S.meeting], u4_l03: [(q) => HON(q), (q) => FIXQ(q)], u4_l05: [S.bounce, (q) => RELQ(q)],
    u4_l07: [S.face, S.title], u4_l08: [S.hyejin, (q) => NEXTSTEP(q)], u4_l10: [S.wayA, (q) => TONEQ(q)], u4_l12: [(q) => HON(q), (q) => FIXQ(q)], u4_l14: [(q) => DIALQ(q), (q) => HON(q)]
  },
  exit: {
    u4_l01: [S.cause, S.sub[0], S.sub[1]], u4_l02: [S.def, S.official, S.respect], u4_l03: [(q) => METHODQ(q), S.jiwoonEat, (q) => METHODQ(q)],
    u4_l05: [S.promise, (q) => RELQ(q), (q) => FIXQ(q)], u4_l07: [S.etq, S.care, S.misund], u4_l08: [S.way, S.ident, S.whisper],
    u4_l10: [S.plan, S.tone, S.turns], u4_l12: [(q) => HON(q), S.same, S.keep], u4_l14: [S.dialectDef, (q) => HON(q), S.appleSi]
  },
  /* 넓히기 — 맥락에서 다시 푼다(누가 「작은 목소리」 · 고친 표현 표 · 공손형 · 누가 「끝까지 귀 기울여」 · 말투 표 · 누가 「끝까지 듣겠」 · 자신을 밝혔나) */
  adv: {
    u4_l01: WHO('작은 목소리'), u4_l02: S.official.replace(' 상황', ''), u4_l03: (d) => FIXQ(d.context), u4_l05: (d) => FIXQ(d.context), u4_l07: S.polite,
    u4_l08: WHO('끝까지 귀 기울여'), u4_l10: (d) => TONEQ(d.context), u4_l12: WHO('끝까지 듣겠'),
    u4_l14: (d) => { const q = quotes(d.context)[0] || ''; ok(!/(저|나) [가-힣]+(이)?(예요|야)/.test(q), '맥락에 자신을 밝힌 말이 있음'); ok(/끊었/.test(d.context), '맥락에 끊은 일 없음'); return S.phoneIdent; }
  }
};
const stem = (s) => nsp(s).replace(/[.,!?·]/g, '').replace(/(했어요|했다|어요|았다|었다|다|요)$/, '');

/* ══════════ 검사기 (사본에도 쓸 수 있게 L 을 받는다 — R 역검증) ══════════ */
function errAnswers(LX) { const er = []; let n = 0;
  KEYS.forEach(k => { const sl = LX[k].slides;
    sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { const d = s.data, at = k + ' ' + s.id; n++;
      let exp; try { exp = fx(EXP.basic[k][i])(d); } catch (e) { er.push(at + ' 풀이기 ' + e.message); return; }
      const cor = d.options.filter(o => o.correct).map(o => clean(o.text));
      if (Array.isArray(exp)) { if (!d.multi || !SAME(cor.slice().sort(), exp.slice().sort())) er.push(at + ' 모두 고르기 ' + cor.join('/') + ' ≠ ' + exp.join('/')); if (d.note.indexOf('**' + exp.length + '개**') < 0) er.push(at + ' 개수 풀이'); if (!/모두 고르세요\.$/.test(d.question)) er.push(at + ' 모두 고르기 물음 꼴'); if (exp.length >= d.options.length || exp.length < 2) er.push(at + ' 모두 고르기 정답 수'); }
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

/* 3단원 마지막 차시 — 파일에서 동적으로 읽음(3단원이 다시 지어져도 마지막 키를 따라감) */
const P3 = load(path.join(TDIR, 'data/g3s2_korean_u3.js'));
const P3K = Object.keys(P3), P3LAST = P3K[P3K.length - 1];
const PEXIT = P3[P3LAST].slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== 'g3s2_korean:' + P3LAST) er.push('l01 from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), PEXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 3단원 ' + P3LAST + ' 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
function errBan(LX) { const er = [], all = JSON.stringify(LX); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」 ' + (all.match(new RegExp('.{0,12}' + b + '.{0,8}')) || [''])[0]); }); return er; }
/* 옛 덱(자기주도 창작 장면)의 인물·장면 — 새 덱에 0 */
const OLD_NAMES = ['민결', '희찬', '혜온', '원준', '지웅', '기현', '은후', '준오', '온서', '교장 선생님', '쪽지 심부름', '정구지', '부추'];
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이');
    LX[k].slides.forEach(s => { if (s.block !== 'motivate' && s.data.kids) er.push(k + ' ' + s.id + ' 동기 장 밖 kids'); }); });
  const all = JSON.stringify(LX); OLD_NAMES.forEach(b => { if (all.indexOf(b) >= 0) er.push('옛 창작 인물·장면 「' + b + '」'); });
  return er; }
/* 교과서 낱말 표 — 활동목록.md 차시 줄(교과서 쪽·활동·발문·예시)의 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u4_l01: ['내가 지난 주말에', '제가 지난 주말에', '유찬', '지현아, 국어사전 좀 빌려줄래?', '빌려주시겠어요', '국어사전을 빌릴 수 있을지 묻는 내용', '대화하는 상대가 달라', '하하하! 이 부분 엄청 재밌다!', '여긴 도서관인데', '끊어 버렸네', '높임 표현을 사용하는 상황 알기', '대화 예절의 중요성 알기', '학습 계획'],
  u4_l02: ['진우야, 생일 축하해!', '할아버지, 생신 축하드려요!', '생신', '높임 표현은 대상을 높이는 표현', '존중과 공경의 마음', '지윤이한테 줄 선물이야', '할머니께 드릴 선물이야', '박성준 학생', '말해 주십시오', '김동현', '진헌이 할머니', '웃어른', '공식적', '존중', '비공식적', '모둠 활동', '처음 만난 자리', '부모님께'],
  u4_l03: ['스승의 날', '작년 담임 선생님에게', '가시니', '여쭈어보자', '다녀오겠습니다', '께서', '-시-', '-습니다', '높임의 뜻이 있는 낱말', '오시는', '모시러', '드렸대', '가요?', '제품이시고요', '아메리카노 나오셨습니다', '매진되셨어요', '제품이에요', '나왔습니다', '매진되었어요',
    '인사드리고', '댁', '떡이에요', '잡수시면', '연세', '진지', '생신', '성함', '편찮으시', '계시다', '주무시다', '여쭙다', '뵙다', '귀가 참 밝으시다', '오나요', '데리러', '할머니가', '할게', '조리사님', '감사한 마음', '지내셨어요'],
  u4_l05: ['아드님, 진지 드세요', '강민경', '-님', '밥 먹으세요', '진지 드세요', '잘못된 높임 표현을 듣거나', '비밀 모의', '왕자가 된 것처럼', '마트', '태권도장', '누구에게나 높임말을 잘 쓰겠다', '식탁', '가구', '고치다', '바로잡다', '가르치다', '배우다', '포함하는 관계', '비슷한 관계', '반대인 관계', '어색', '부끄러',
    '오늘 저녁 반찬은 뭐야?', '뭐예요', '떡갈비요', '밥은 이따가 먹고 싶어요', '부르지 말아 주세요', '듣는 상대의 마음', '선생님이 너 오래', '선생님께서 너 오라고 하셔', '음식 나오셨습니다', '선생님이 조용히 하래', '먹어 볼래요', '밥-진지', '말-말씀'],
  u4_l07: ['가는 말이 고와야 오는 말이 곱다', '말 한마디에 천 냥 빚도 갚는다', '쌀은 쏟고 주워도 말은 하고 못 줍는다', '아 해 다르고 어 해 다르다', '효진이와 소영이의 부탁', '야!', '동호야', '화난 표정', '웃는 표정', '내가 왜? 나 바빠', '응, 알았어', '존중하지 않고', '배려하며 조심스럽게', '귀 기울여', '호칭',
    '말하는 이와 듣는 이가 서로 말을 주고받을 때 지켜야 할 예절', '좋은 관계', '오해', '미안한 마음', '고마운 마음', '부탁하는 까닭과 부탁하는 내용', '문 좀 닫아 주겠니', '누워서 인사', '주머니에 손', '그것도 모르냐', '줄임말', '별명'],
  u4_l08: ['참 좋은 말', '상대의 처지를 헤아려 주는 말', '토의·토론 학습 모형', '주현', '지환', '외투 가져가야지', '멀리서도 잘 들려', '목소리가 너무 커', '도서관에서는 조용히', '대화하는 상대, 시간이나 장소, 대화의 목적이나 방식', '태수', '가위', '서랍장에요', '급식 메뉴', '모둠 활동 중이잖아', '귓속말', '소외감', '공공장소', '공손한', '주제',
    '거는 사람과 받는 사람', '여보세요?', '이만 끊을게', '할머니, 저 인영이예요', '지금 통화하기 괜찮아?', '그럼 내일 보자. 안녕', '주제 확인하기', '의견 마련하기', '의견 모으기', '중간에 끊지 않고', '강요하지', '책임감', '학급 회의', '버스', '희지', '통화 괜찮으세요'],
  u4_l10: ['응답하라 1, 2, 3', '지욱', '맛있는 거 사 먹어라', '감사합니다', '즐거운 말투', '화내는 말투', '울먹이는 말투', '혜인', '어쩔 줄 몰라 하는 말투', '남수', '미술 대회', '축하해', '전화로 약속', '분리배출', '거절', '대화 상대', '대화 목적', '대화 방식', '통화할 수 있는 상황', '공손한 태도', '거절당하는 사람의 마음',
    '다인아, 나 은혜야. 지금 통화 괜찮아?', '2시에 놀이터', '죄송해요. 다음에는 꼭 도와드릴게요', '두 번 이상', '또박또박', '그렇구나', '같은 말이라도 말하는 이의 표정, 몸짓, 말투에 따라 듣는 이의 기분이 달라질 수 있어요', '점검표', '칭찬', '대화를 나누는 사람', '평가 자료 2'],
  u4_l12: ['이런 활동 어때요', '높임의 뜻이 있는 낱말 기억 놀이', '색깔별로', '가위바위보', '뜻이 같으면', '밥', '진지', '다짐판', '친구의 말을 존중하고 고운 말을 사용하겠습니다', '친구의 말을 끝까지 귀담아듣겠습니다', '구체적인 상황과 지킬 점', '붙임딱지', '목 · 금 · 토 · 일', '서로서로 통하는 말', '박은정', '할머니, 생일 축하해', '나이가 몇 살이야', '공익 광고', '이야기 바꾸어 쓰기', '편지'],
  u4_l14: ['스스로 확인하기', '‘-시-’, ‘-습니다’', '큰 소리', '‘밥’, ‘생일’', '끝인사', '생활 속으로', '정한솔', '최연재', '김민수', '기초 다지기', '자신이 누구인지 밝히고', '언제든지 바로 전화를 끊는다', '하고 싶은 말부터', '공공장소에서는 작은 목소리', '귀 기울여', '가우', '가새', '가시개', '가위', '개구락지', '까구리', '깨구리', '개구리',
    '방언이란 어느 한 지역에서만 쓰는', '표준어', '나만의 방언 사전', '배려', '샘물', '메다', '연세', '얘기', '예절', '기계', '혜택', '푹신푹신한 솜이불처럼 편안했어요', '이럴 땐 어떻게 말할까?', '김은의', '꼼마', '높임말과 예사말']
};
/* 옛 보탬 표(TB, archive/neutral/gen_g3s2_korean_u4.js 455~489줄) 33장 — [옛 차시, 카드 제목, 흡수한 새 차시, 핵심 낱말] · 본류 장(그림 포함 · extras 아님)에 있어야 한다.
   옛 l02 넷째 카드(「국어활동」 58~59쪽)는 높임 방법 ①~④를 배운 뒤인 3~4차시(u4_l03 출구·실생활 장)에 흡수. */
const ABSORB = [
  ['u4_l01', '생각 열기 · 유찬이의 국어사전 부탁', 'u4_l01', ['내가 지난 주말에', '제가 지난 주말에', '지현아, 국어사전 좀 빌려줄래?', '빌려주시겠어요', '국어사전을 빌릴 수 있을지 묻는 내용', '대화하는 상대가 달라']],
  ['u4_l01', '도서관 웃음 · 끊긴 전화 — 대화 예절 떠올리기', 'u4_l01', ['하하하! 이 부분 엄청 재밌다!', '여긴 도서관인데', '끊어 버렸네', '지켜야 할 예절']],
  ['u4_l01', '무엇을 배울까요 — 단원 학습 계획', 'u4_l01', ['높임 표현을 사용하는 상황 알기', '높임 표현을 바르게 사용하여 대화하기', '대화 예절의 중요성 알기', '상황에 알맞은 대화 예절을 지키며 대화하기', '학습 계획', '알고 싶은 것']],
  ['u4_l02', '진우의 생일 잔치 — 높임 표현이란', 'u4_l02', ['부모님께', '진우야, 생일 축하해!', '할아버지, 생신 축하드려요!', '생일의 주인공', '높임 표현은 대상을 높이는 표현', '존중과 공경의 마음']],
  ['u4_l02', '상황 ㉮~㉱ — 높임 표현을 쓴 까닭', 'u4_l02', ['지윤이한테 줄 선물이야', '할머니께 드릴 선물이야', '박성준 학생', '말해 주십시오', '김동현', '진헌이 할머니', '처음 만난', '나이와 관계없이']],
  ['u4_l02', '「높임 표현을 사용하는 상황」 정리 · 언제 쓰면 좋을까', 'u4_l02', ['웃어른', '공식적', '존중', '비공식적', '모둠 활동', '처음 만난 자리']],
  ['u4_l02', '「국어활동」 58~59쪽 — 높임 방법 고르기 · 웃어른께 편지', 'u4_l03', ['여쭈어보자', '지내셨어요', '조리사님', '감사한 마음', '누구를 높였는지']],
  ['u4_l03', '스승의 날 일기 · 높임 표현 고르기와 방법 잇기', 'u4_l03', ['선생님께서 작년 담임 선생님께', '작년 담임 선생님에게', '가시니', '여쭈어보자', '다녀오겠습니다', '‘께서’와 ‘-시-’', '높임의 뜻이 있는 낱말', '‘-습니다’나 ‘요’', '누가 어찌하다']],
  ['u4_l03', '민수와 아버지 — 누구를 높였나', 'u4_l03', ['할아버지께서 오시는 날이지요', '모시러', '드렸대', '가요?', '말을 듣는 아버지']],
  ['u4_l03', '동영상 — 물건을 높이는 말 고치기', 'u4_l03', ['제품이시고요', '아메리카노 나오셨습니다', '매진되셨어요', '제품이에요', '나왔습니다', '매진되었어요', '귀가 참 밝으시다']],
  ['u4_l03', '지운이의 쪽지 · 평가 자료 1', 'u4_l03', ['인사드리고', '댁', '떡이에요', '잡수시면', '연세', '편찮으시다', '여쭈어보다', '모시러 가다', '오시나요', '할머니께서', '할게요']],
  ['u4_l05', '「아드님, 진지 드세요」 — 제목 질문과 경험', 'u4_l05', ['강민경', '-님', '밥 먹으세요', '진지 드세요', '잘못된 높임 표현을 듣거나', '비밀 모의', '마트', '태권도장', '누구에게나 높임말을 잘 쓰겠다', '따라 하지 않']],
  ['u4_l05', '내용 알기 · 마음 짐작 · 낱말 알기', 'u4_l05', ['왕자가 된 것처럼', '어색', '부끄러', '식탁', '가구', '고치다', '바로잡다', '가르치다', '배우다', '밥-진지', '말-말씀']],
  ['u4_l05', '장면 ㉮~㉰ 고치기 · 짝과 주고받기', 'u4_l05', ['밥은 이따가 먹고 싶어요', '뭐예요', '떡갈비요', '부르지 말아 주세요', '듣는 상대의 마음', '먹어 볼래요', '드셔 보시겠어요']],
  ['u4_l05', '세상과 잇기 — 헷갈리는 높임 표현', 'u4_l05', ['선생님이 너 오래', '선생님께서 너 오라고 하셔', '음식 나오셨습니다', '선생님이 조용히 하래', '오실게요']],
  ['u4_l07', '속담 떠올리기 · 「효진이와 소영이의 부탁」', 'u4_l07', ['가는 말이 고와야 오는 말이 곱다', '말 한마디에 천 냥 빚도 갚는다', '쌀은 쏟고 주워도 말은 하고 못 줍는다', '아 해 다르고 어 해 다르다', '야!', '동호야', '화난 표정', '웃는 표정', '계단까지']],
  ['u4_l07', '대화 예절이란 · 지키면 좋은 점', 'u4_l07', ['듣는 사람의 기분을 헤아리', '귀 기울여', '호칭', '말하는 이와 듣는 이가 서로 말을 주고받을 때 지켜야 할 예절', '존중받는 느낌', '좋은 관계', '오해', '말투와 표정']],
  ['u4_l07', '활동지 — 부탁하고 거절할 때의 예절', 'u4_l07', ['들어줄 수 있는 상황인지 확인', '부탁하는 까닭과 부탁하는 내용', '미안한 마음', '도와줄 수 없는 까닭', '고마운 마음', '선생님 심부름']],
  ['u4_l07', '참고 — 공손하게 말하기 · 일상 사례 돌아보기', 'u4_l07', ['문 좀 닫아', '바람 들어온다', '문 좀 닫을래?', '문 좀 닫아 주겠니?', '누워서 인사', '주머니에 손', '끼어들', '그것도 모르냐', '줄임말', '별명']],
  ['u4_l08', '「주현이와 지환이의 대화」 — 장소가 달라지면', 'u4_l08', ['참 좋은 말', '상대의 처지를 헤아려 주는 말', '외투 가져가야지', '멀리서도 잘 들려', '목소리가 너무 커', '도서관에서는 조용히', '대화하는 상대, 시간이나 장소, 대화의 목적이나 방식']],
  ['u4_l08', '「태수의 대화」 ㉮~㉰ · 빈칸 정리', 'u4_l08', ['가위', '서랍장에요', '공손하게 말해야지', '급식 메뉴', '모둠 활동 중이잖아', '귓속말', '소외감', '공공장소', '주제와 관련한 말']],
  ['u4_l08', '전화 대화의 특징 · 인영이의 전화', 'u4_l08', ['거는 사람과 받는 사람', '상대의 상황을 볼 수 없', '할머니, 저 인영이예요', '지금 통화하기 괜찮아?', '그럼 내일 보자. 안녕', '계속 전화를 건다', '하고 싶은 말만 하고 끊어도', '끝인사']],
  ['u4_l08', '토의·토론 학습 모형 — 모둠 대화 차례와 발표', 'u4_l08', ['토의·토론 학습 모형', '중간에 끊지 않고', '강요하지', '책임감', '주제 확인하기', '의견 마련하기', '의견 모으기', '의견 정하기', '1모둠', '2모둠', '3모둠', '학급 회의', '버스', '희지', '통화 괜찮으세요']],
  ['u4_l10', '응답하라 1, 2, 3 — 같은 말, 다른 말투', 'u4_l10', ['지욱', '맛있는 거 사 먹어라', '감사합니다', '울먹이는 말투', '혜인', '어쩔 줄 몰라 하는 말투', '남수', '미술 대회', '축하해']],
  ['u4_l10', '상황 ㉮·㉯ 분석 · 예절 떠올리기', 'u4_l10', ['전화로 약속', '분리배출', '부탁을 거절', '대화 상대', '대화 목적', '대화 방식', '통화할 수 있는 상황', '공손한 태도', '거절당하는 사람의 마음', '강요']],
  ['u4_l10', '역할놀이 대본 · 표정·몸짓·말투 · 점검', 'u4_l10', ['다인아, 나 은혜야. 지금 통화 괜찮아?', '2시에 놀이터', '죄송해요. 다음에는 꼭 도와드릴게요', '두 번 이상', '또박또박', '그렇구나', '같은 말이라도 말하는 이의 표정, 몸짓, 말투에 따라 듣는 이의 기분이 달라질 수 있어요', '점검표', '칭찬']],
  ['u4_l10', '평가 자료 2 — 대화 계획 세우고 대화하기', 'u4_l10', ['평가 자료 2', '대화를 나누는 사람', '방식', '목적', '주제', '높임 표현이나 태도']],
  ['u4_l12', '이런 활동 1 — 높임의 뜻이 있는 낱말 기억 놀이', 'u4_l12', ['색깔별로', '가위바위보', '한 장씩 뒤집', '뜻이 같으면', '많이 가져간 사람', '밥', '진지', '문장을 만들']],
  ['u4_l12', '이런 활동 2 — 대화 예절을 실천하는 다짐판', 'u4_l12', ['친구의 말을 존중하고 고운 말을 사용하겠습니다', '친구의 말을 끝까지 귀담아듣겠습니다', '구체적인 상황과 지킬 점', '붙임딱지', '목 · 금 · 토 · 일']],
  ['u4_l12', '우리 반 예시 — 이야기 바꾸어 쓰기 · 공익 광고', 'u4_l12', ['서로서로 통하는 말', '박은정', '할머니, 생일 축하해', '나이가 몇 살이야', '생신 축하드려요', '연세가 어떻게 되세요', '공익 광고', '편지']],
  ['u4_l14', '스스로 확인하기 · 생활 속으로', 'u4_l14', ['‘-시-’, ‘-습니다’', '큰 소리', '‘밥’, ‘생일’', '끝인사', '정한솔', '최연재', '김민수', '고마운 마음']],
  ['u4_l14', '기초 다지기 — 전화 예절 · 방언', 'u4_l14', ['자신이 누구인지 밝히고', '언제든지 바로 전화를 끊는다', '하고 싶은 말부터', '공공장소에서는 작은 목소리', '귀 기울여', '가우', '가새', '가시개', '개구락지', '까구리', '깨구리', '방언이란 어느 한 지역에서만 쓰는', '나만의 방언 사전']],
  ['u4_l14', '글씨 쓰기 · 「국어활동」 스스로 읽기', 'u4_l14', ['배려', '샘물', '메다', '연세', '얘기', '예절', '기계', '혜택', '푹신푹신한 솜이불처럼', '이럴 땐 어떻게 말할까?', '김은의', '꼼마', '높임말과 예사말']]
];
const OLD_FILES = { u4_l01: 'g3_kor_u4_l01.html', u4_l02: 'g3_kor_u4_l02.html', u4_l03: 'g3_kor_u4_l03_04.html', u4_l05: 'g3_kor_u4_l05_06.html', u4_l07: 'g3_kor_u4_l07.html', u4_l08: 'g3_kor_u4_l08_09.html', u4_l10: 'g3_kor_u4_l10_11.html', u4_l12: 'g3_kor_u4_l12_13.html', u4_l14: 'g3_kor_u4_l14.html' };
/* 지도서 차시 이름 · 쪽 · 학습 목표 · 성취기준 */
const TITLE = { u4_l01: '배울 내용 살펴보기', u4_l02: '높임 표현을 사용하는 상황 알기', u4_l03: '높임 표현을 바르게 사용하는 방법 알기', u4_l05: '높임 표현을 바르게 사용하여 대화하기', u4_l07: '대화 예절의 중요성 알기', u4_l08: '상황에 알맞은 대화 예절 알기', u4_l10: '상황에 알맞은 대화 예절을 지키며 대화하기', u4_l12: '배운 내용 실천하기', u4_l14: '마무리하기' };
const PAGES = { u4_l01: '250~251', u4_l02: '252~255', u4_l03: '256~259', u4_l05: '260~267', u4_l07: '268~273', u4_l08: '274~279', u4_l10: '280~285', u4_l12: '286~289', u4_l14: '290~291' };
const GOAL = { u4_l01: '배울 내용을 살펴볼 수 있다.', u4_l02: '높임 표현을 사용하는 상황을 안다.', u4_l03: '높임 표현을 바르게 사용하는 방법을 안다.', u4_l05: '높임 표현을 바르게 사용하여 대화할 수 있다.', u4_l07: '대화 예절의 중요성을 안다.', u4_l08: '상황에 알맞은 대화 예절을 안다.', u4_l10: '상황에 알맞은 대화 예절을 지키며 대화할 수 있다.', u4_l12: '배운 내용을 실천할 수 있다.', u4_l14: '배운 내용을 마무리할 수 있다.' };
const STDT = { '01-04': '상황과 상대의 입장을 이해하고 예의를 지키며 대화한다.', '04-01': '단어와 단어 간의 의미 관계를 파악한다.', '04-04': '글과 담화에 쓰인 높임 표현과 지시·접속 표현을 이해하고 상황에 맞게 표현한다.', '04-05': '언어가 의사소통과 관계 형성의 수단임을 이해하고 국어를 소중히 여기는 태도를 지닌다.' };
const STDC = { u4_l01: ['01-04', '04-04'], u4_l02: ['04-04'], u4_l03: ['04-04'], u4_l05: ['04-04', '01-04', '04-01'], u4_l07: ['01-04', '04-05'], u4_l08: ['01-04'], u4_l10: ['01-04', '04-04'], u4_l12: ['04-04', '01-04'], u4_l14: ['04-04', '01-04'] };

function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 낱말 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  ABSORB.forEach(([oldK, title, newK, words]) => { n++; const main = nsp(JSON.stringify(LX[newK].slides.map(s => s.data))); words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(oldK + '→' + newK + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }

/* ── 차례 사슬 ── */
function errOrder(LX) { const er = [];
  const fl = LX.u4_l05.slides[4].data.fig; if (!(fl && fl.k === 'mood' && fl.flow && SAME(fl.flow.map(f => f.name), S.moodFlow))) er.push('l05 범수의 마음 변화 차례 ' + (fl && fl.flow ? fl.flow.map(f => f.name).join('→') : ''));
  const story = LX.u4_l05.slides.filter(s => s.block === 'concept').map(s => s.data.content).join(' '); let p = -1; S.storyOrder.forEach(kw => { const q = story.indexOf(kw, p + 1); if (q < 0 || q <= p) er.push('l05 이야기 사건 차례 「' + kw + '」'); else p = q; });
  const st = LX.u4_l08.slides[12].data.steps; S.steps.forEach((x, i) => { if (!st[i] || st[i].indexOf(x) !== 0) er.push('l08 모둠 대화 차례 ' + (i + 1) + ' 「' + (st[i] || '') + '」 ≠ ' + x); });
  const pr = LX.u4_l10.slides[3].data.fig; if (!(pr.k === 'link' && SAME(pr.rows.map(r => r[0]), S.planRows))) er.push('l10 상대 → 목적 → 방식 차례');
  const ch = LX.u4_l12.slides[4].data.fig; if (!(ch.k === 'chain' && ch.items.length === 4 && ch.items.every((it, i) => it.name.indexOf('①②③④'[i]) === 0 && it.name.indexOf(S.game[i]) >= 0))) er.push('l12 기억 놀이 ①~④ 차례');
  const ev = LX.u4_l03.slides[11].data.levels.심화.a; let q2 = -1; ['㉠', '㉡', '㉢', '㉣'].forEach((m, i) => { const at = ev.indexOf(m + ' ' + S.evalA[i][0] + ' → ' + S.evalA[i][1]); if (at < 0 || at <= q2) er.push('l03 평가 자료 1 ' + m + ' 차례·고친 말'); else q2 = at; if (FIX[S.evalA[i][0]] !== S.evalA[i][1]) er.push('l03 평가 자료 1 ' + m + ' ≠ 고친 표현 표'); });
  const so = LX.u4_l01.slides[6].data.fig; if (!(so.k === 'sort2' && SAME(so.a.items, S.subOrder[0]) && SAME(so.b.items, S.subOrder[1]))) er.push('l01 무엇을 배울까요 여섯 칸 차례');
  return er; }

/* ── 그림 ── */
const PARTS_USED = ['text', 'mood', 'sort2', 'note', 'letter', 'link', 'tools', 'chain'];
function honNotePairs(f) { const pairs = []; (f.items || []).forEach(it => { const s = typeof it === 'string' ? it : it.t; s.split(/ · | — /).forEach(seg => { const m = seg.match(/^([가-힣/]+) → ([가-힣/, ]+)$/); if (!m) return; const as = m[1].split('/'), bs = m[2].split(/, /); if (as.length > 1) { const bb = m[2].split('/'); as.forEach((a, i) => pairs.push([a, bb[i]])); } else bs.forEach(b => pairs.push([m[1], b])); }); }); return pairs; }
function errFigs(LX) { const er = []; let nF = 0, nH = 0;
  KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; nF++; const at = k + ' ' + s.id + ' ' + f.k;
    if (f.k === 'panels' ? !(f.items || []).length || f.items.some(it => !it.fig || PARTS_USED.indexOf(it.fig.k) < 0) : PARTS_USED.indexOf(f.k) < 0) er.push(at + ' 모르는 부품'); /* panels 한 칸 = 글 상자 min-width 풀기(실렌더 — 정답 공개 때 480 칸) */
    const h = FIG.render(f); if (!h || /NaN|undefined|\[object/.test(h)) er.push(at + ' 렌더');
    if (s.block === 'basic_problem') { const d = s.data; const tx = nsp(docOf(h).body.textContent); const cs = d.options.filter(o => o.correct).map(o => clean(o.text));
      cs.forEach(a => { if (nsp(d.question).indexOf(nsp(a)) >= 0) return; if (tx.indexOf(nsp(a)) >= 0) er.push(at + ' 문제 그림에 정답 「' + a + '」'); });
      if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 3) er.push(at + ' 문제 그림 카드 ' + f.items.length + '장(넘침)'); if (f.k === 'text' || f.k === 'letter' || f.k === 'sort2') er.push(at + ' 기본 문제 글 상자는 panels 로 감쌀 것(넘침)'); }
    if (s.block === 'concept') { if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 4) er.push(at + ' 개념 카드 ' + f.items.length); if (f.k === 'text' && f.lines.length > 5) er.push(at + ' 글 판 ' + f.lines.length + '줄'); if (f.k === 'note' && f.items.length > 7) er.push(at + ' 메모 ' + f.items.length + '줄'); if (f.k === 'link' && f.rows.length > 4) er.push(at + ' 잇기 ' + f.rows.length + '줄'); } }));
  const hn = LX.u4_l03.slides[6].data.fig; const hp = honNotePairs(hn); nH = hp.length; if (hp.length < 18) er.push('l03 높임 낱말 메모 짝 ' + hp.length); hp.forEach(([a, b]) => { if ((HONW[a] || []).indexOf(b) < 0) er.push('l03 높임 낱말 메모 「' + a + ' → ' + b + '」 ≠ 258쪽 표'); });
  const rl = LX.u4_l05.slides[6].data.fig; if (!(rl.k === 'link' && rl.rows.length === 3 && rl.rows.every(r => REL[r[0].replace(' — ', '|')] === r[1]))) er.push('l05 낱말 관계 표 ≠ 195쪽');
  const mt = LX.u4_l03.slides[4].data.fig; if (!(mt.k === 'link' && mt.rows.every(r => { const w = r[0].replace(/^㉮ |^㉯ |^㉰ /, ''); return M185[w] && M185[w].every(x => r[1].indexOf(x) >= 0); }))) er.push('l03 높임 방법 잇기 ≠ 185쪽');
  const dl = LX.u4_l14.slides[5].data.fig; if (!(dl.k === 'link' && dl.rows.every(r => DIAL[r[0].replace(/ · /g, ', ')] === r[1]))) er.push('l14 방언 표 ≠ 214쪽');
  const ap = LX.u4_l14.slides[3].data.fig; if (!(ap.k === 'sort2' && SAME(ap.a.items, APPLE.ok) && SAME(ap.b.items, APPLE.no))) er.push('l14 사과 넷 ○2 ✕2 ≠ 213쪽');
  return { er, nF, nH }; }

/* ── 제재(작품) — 제목·지은이 · 쪽 안내 · 인용 줄 ── */
const WORKS = [{ t: '아드님, 진지 드세요', a: '강민경', page: '「국어」 교과서 188', cap: 4 }, { t: '서로서로 통하는 말', a: '박은정', cap: 4 }, { t: '이럴 땐 어떻게 말할까?', a: '김은의', page: '「국어활동」 62', cap: 4 }];
/* 「아드님, 진지 드세요」 원문 문장(지도서 260~264쪽 축소면) — 교과서 활동 글(196쪽 장면 · 195쪽 낱말 알기 · 215쪽 글씨 쓰기)까지 덱 전체에서 셈 */
const STORY = ['밥 안 먹어. 더 잘 거야.', '아드님, 학교 다녀오시느라 힘드셨지요?', '오늘 저녁 반찬은 뭐야?', '아드님은 뭐가 드시고 싶으세요?', '떡갈비.', '할머니, 잘못했어. 손자님이라고 부르지 마.', '그럼 약속하세요. 이제부터 누구에게나 높임말을 잘 쓰겠다고요.', '약속할게……요. 앞으로 높임말 잘 쓸게……요.',
  '범수는 반말을 고치고 싶은 마음이 전혀 없었어요.', '범수는 식탁에서 벌떡 일어났어요.', '우리 범수가 이참에 단단히 배우겠구먼.', '엄마가 해 주는 반말이 푹신푹신한 솜이불처럼 편안했어요.', '엄마, 이게 뭐야? 누가 아침부터 이렇게 밥을 많이 먹어?', '아이고, 우리 손자님 왜 그러세요?', '엄마, 물 줘!', '손자님! 가방은 제가 정리할게요.', '세상이 망할 때가 되었네그려.', '아드님, 저랑 같이 마트 가실래요?'];
function quotedOf(LX, t) { const set = new Set(); KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f || f.k !== 'text' || String(f.title || '').indexOf('「' + t + '」') < 0) return;
  (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).filter(l => !/^\[간추림\]|^→/.test(l)).forEach(l => l.split(' / ').forEach(x => set.add(x.trim()))); })); return set; }
const storyCount = (LX) => { const all = nsp(JSON.stringify(LX)); return STORY.filter(x => all.indexOf(nsp(x)) >= 0).length; };
function errWorks(LX) { const er = []; const all = JSON.stringify(LX);
  WORKS.forEach(wk => { const re = new RegExp('「' + wk.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '」[^「」]{0,6}' + wk.a); if (!re.test(all)) er.push('「' + wk.t + '」 지은이 ' + wk.a + ' 함께 없음');
    if (wk.page && all.indexOf(wk.page) < 0) er.push('「' + wk.t + '」 쪽 안내 ' + wk.page + ' 없음');
    const q = quotedOf(LX, wk.t); if (q.size > wk.cap) er.push('「' + wk.t + '」 인용 줄 ' + q.size + ' > ' + wk.cap); });
  const sc = storyCount(LX); if (sc > 12) er.push('「아드님, 진지 드세요」 원문 문장 덱 전체 ' + sc + ' > 12');
  return er; }

/* ── 선행 ── */
const FIRST = [['높임 표현은 대상을 높이는 표현', 'u4_l02'], ['공식적', 'u4_l02'], ['-시-', 'u4_l03'], ['께서', 'u4_l03'], ['높임의 뜻이 있는 낱말', 'u4_l03'], ['잡수시', 'u4_l03'], ['연세', 'u4_l03'], ['범수', 'u4_l05'], ['포함하는 관계', 'u4_l05'],
  ['대화 예절은 말하는 이와 듣는 이', 'u4_l07'], ['효진', 'u4_l07'], ['대화 상황은', 'u4_l08'], ['귓속말', 'u4_l08'], ['끝인사', 'u4_l08'], ['몸짓', 'u4_l10'], ['역할놀이', 'u4_l10'], ['점검표', 'u4_l10'], ['다짐판', 'u4_l12'], ['기억 놀이', 'u4_l12'], ['방언', 'u4_l14'], ['표준어', 'u4_l14']];
const teach = (LX, k) => JSON.stringify(LX[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => s.data)).replace(/"다음(?: 단원)?: [^"]*"/g, '') + JSON.stringify(LX[k].extras.filter(e => e.type !== 'checklist'));
function errFirst(LX) { const er = []; FIRST.forEach(([t, at]) => { const ai = KEYS.indexOf(at); KEYS.forEach((k, i) => { if (!i) return; const has = nsp(teach(LX, k)).indexOf(nsp(t)) >= 0; if (i < ai && has) er.push(k + ' 선행 「' + t + '」(처음은 ' + at + ')'); if (i === ai && !has) er.push(at + ' 에 「' + t + '」 없음'); }); }); return er; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드·meta ═══');
T('9차시 키(지도서 묶음 첫 번호 1·2·3·5·7·8·10·12·14 — 옛 키와 같음) · 파일 data/g3s2_korean_u4.js', () => ok(SAME(Object.keys(L), KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 국어 · 4단원 · n·covers·분 = 지도서 차시 · 성취기준 문구(지도서 247쪽) · 학습 목표 · 지도서 쪽 · src_key · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 3 && m.term === 2 && m.unit === 4 && m.subject === '국어' && m.unit_title === UT && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '~' + b + '차시'), k + ' covers ' + m.covers);
  ok(m.std === STDC[k].map(c => '[4국' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.goal === GOAL[k], k + ' 학습 목표');
  ok(m.source.indexOf('지도서 4단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade3/semester2/korean/4단원_서로존중하며대화해요/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 존중 대화 교실', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 + 차시 표기 · 묶음 제목에 「a~b차시」 · 합계 560분', () => { KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k]; ok(m.title.indexOf(TITLE[k]) === 0, k + ' ' + m.title); ok(m.title.indexOf(a === b ? a + '차시' : a + '~' + b + '차시') >= 0, k + ' 차시 표기'); }); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 560, '분'); });
T('[4국04-04] 차시 = 1·2·3~4(평가 자료 1)·5~6·10~11·12~13·14 · [4국01-04] = 1·5~6·7·8~9·10~11(평가 자료 2)·12~13·14 · [4국04-01] = 5~6(낱말 관계) · [4국04-05] = 7(대화 예절의 중요성)', () => { const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf('[4국' + c + ']') >= 0).join();
  ok(has('04-04') === 'u4_l01,u4_l02,u4_l03,u4_l05,u4_l10,u4_l12,u4_l14', has('04-04')); ok(has('01-04') === 'u4_l01,u4_l05,u4_l07,u4_l08,u4_l10,u4_l12,u4_l14', has('01-04')); ok(has('04-01') === 'u4_l05' && has('04-05') === 'u4_l07', has('04-01') + '/' + has('04-05')); });
T('slug — KT2.slugOf({g:3,s:korean,t:2}) = g3s2_korean · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'korean', t: '2' }) === 'g3s2_korean', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록(text·mood·sort2·note·letter·link·tools·chain·panels)', () => PARTS_USED.concat('panels').forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 171장 (9 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 171, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 장면) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length === 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 3-2 국어 다른 단원(1·2·3·5·6단원)과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); let other = []; [1, 2, 3, 5, 6].forEach(u => { const f = path.join(TDIR, 'data/g3s2_korean_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => ((l.slides || [])[2] || {}).data).filter(Boolean).map(d => d.img).filter(Boolean)); }); ok(other.length > 30 && !im.some(x => other.indexOf(x) >= 0), '겹침 · 다른 단원 ' + other.length); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2 · 옛 창작 인물·장면 0', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });
T('교실 활동 장 글 길이(넘침 미리 피하기) — goal ≤ 45자 · steps 4개 각 ≤ 45자 · solo 2~3개 각 ≤ 40자', () => KEYS.forEach(k => { const d = L[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); d.steps.forEach(s => ok(s.length <= 45, k + ' step ' + s.length + ' ' + s)); ok(d.solo.length >= 2 && d.solo.length <= 3, k + ' solo 수'); d.solo.forEach(s => ok(s.length <= 40, k + ' solo ' + s.length + ' ' + s)); ok(d.minutes === d.tnote.min, k + ' 활동 분'); }));

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 3단원 마지막 차시(' + P3LAST + ') 출구 — 파일에서 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 5단원 사전으로 여는 세상 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u4_l14.slides[18].data; ok(nx.title === '다음 단원엔' && /사전으로 여는 세상/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 풀기 (지도서 사전·표) ═══');
const EA = errAnswers(L);
T('기본 27 · 수준별 기본·도전 18 · 출구 27 · 넓히기 9 = 게이트가 다시 푼 정답', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 푼 정답 = 81', () => ok(EA.n === 81, EA.n));
T('모두 고르기 ≥ 5 · 높임 낱말 물음 ≥ 6 · 고친 표현 물음 ≥ 6(사전·표가 실제로 쓰임)', () => { let ms = 0, hq = 0, fq = 0; const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => { if (s.data.multi) ms++; qs.push(s.data.question); }); const lv = sl[11].data.levels; qs.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => qs.push(x.q)); });
  qs.forEach(q => { if (/높임의 뜻이 있는 낱말은|대신 쓴 높임 표현은/.test(q)) hq++; if (/고친 말은|어떻게 고쳐야/.test(q)) fq++; }); ok(ms >= 5 && hq >= 6 && fq >= 6, ms + '/' + hq + '/' + fq); });
T('풀이기 자체 확인 — 높임 낱말 역찾기 · 고친 표현 · 방법 · 관계 · 틀린 것 잡음', () => { ok(HON('「집」의 높임의 뜻이 있는 낱말은 무엇일까요?') === '댁' && FIXQ('「매진되셨어요」') === '매진되었어요' && RELQ('「가르치다」와 「배우다」') === '서로 뜻이 반대인 관계', '역찾기');
  ok(HON('「나이」의 높임의 뜻이 있는 낱말은 무엇일까요?') === '연세', '연세'); let c = 0; try { HON('「먹다」의 높임의 뜻이 있는 낱말은 무엇일까요?'); } catch (e) { c++; } try { FIXQ('「안녕하세요?」'); } catch (e) { c++; } try { RELQ('「하늘」과 「땅」'); } catch (e) { c++; } ok(c === 3, '두 갈래 낱말·표에 없는 말을 못 잡음 ' + c);
  ok(METHODQ('「너희 부모님께서도 가시니?」에서 ‘께서’와 무엇일까요?') === '-시-' && RELQ('「식탁」과 「가구」') === REL['식탁|가구'] && DIALQ('「가우, 가새, 가시개」') === '가위', '방법·관계·방언'); });

console.log('═══ F. 차례 사슬 ═══');
T('범수의 마음 변화 네 칸 · 이야기 사건 차례 · 모둠 대화 네 차례 · 상대 → 목적 → 방식 · 기억 놀이 ①~④ · 평가 자료 1 ㉠~㉣ · 무엇을 배울까요 여섯 칸', () => { const e = errOrder(L); ok(!e.length, e.join(' | ')); });
T('민수와 아버지 반응 넷 = 185쪽 높임 대상 표에서 다시 냄(‘가요?’ = 아버지)', () => { const d = L.u4_l03.slides[8].data; ok(SAME(MINSU(d), d.options.filter(o => o.correct).map(o => clean(o.text))) && MINSU(d).length === 3, '반응'); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nF + '개 — 쓰는 부품만 · 렌더 · 높임 낱말 메모 짝 ' + EF.nH + ' = 258쪽 표 · 낱말 관계·방언·방법 잇기·사과 넷 = 교과서 · 문제 그림 정답 숨김 · 문제 카드 ≤ 3 · 문제 글 상자 panels', () => ok(!EF.er.length, EF.er.slice(0, 6).join(' | ')));
T('개념 36장 · 기본 문제 27장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('개념 글 3줄 이하(큰 그림 · 넘침 미리 피하기)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 3, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
T('그림 검사기 자체 확인 — 틀린 높임 낱말 짝 · 문제 그림 속 정답 · 넘치는 카드 · 모르는 부품 · 맨 글 상자 잡음', () => { const X = clone(L); X.u4_l03.slides[6].data.fig.items[0] = '나이 → 진지'; X.u4_l14.slides[9].data.fig = { k: 'tools', items: [{ name: '가위' }] }; X.u4_l07.slides[8].data.fig.items.push({ name: 'a' }, { name: 'b' }); X.u4_l01.slides[3].data.fig = { k: 'zzz' }; X.u4_l02.slides[8].data.fig = { k: 'text', lines: ['a'] };
  const e = errFigs(X).er.join(' | '); ok(/나이 → 진지/.test(e) && /정답 「가위」/.test(e) && /카드 4장/.test(e) && /모르는 부품/.test(e) && /panels/.test(e), e.slice(0, 240)); });

console.log('═══ H. 재료 충실 · 교과서 낱말 · 보탬 흡수 ═══');
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(clean(lines(src.slides[i].text)) === clean(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.options.map(o => o.text), p.opts), s.id + ' 보기'); const ci = Array.isArray(p.ci) ? p.ci : [p.ci]; ok(SAME(d.options.map((o, j) => !!o.correct), p.opts.map((_, j) => ci.indexOf(j) >= 0)), s.id + ' 정답 표시'); });
  const nx = L[k].slides[18].data; if (k !== 'u4_l14') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 낱말 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음(활동목록.md)', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 낱말 표 자체 확인 — 다른 차시 낱말은 없음(l02 에 「아드님, 진지 드세요」 · l14 에 「주현」 없음)', () => { ok(nsp(JSON.stringify(L.u4_l02)).indexOf(nsp('아드님, 진지 드세요')) < 0, 'l02'); ok(nsp(JSON.stringify(L.u4_l14)).indexOf('주현') < 0, 'l14'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말이 본류 장(그림 포함 · extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 33, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
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
T('지도서 유의점이 교사 층에 — 정답보다 생각·호기심·학습 계획(l01) · 문장 전체·께와 드리다·공식적 상황에서 안 쓰면·나이와 관계없이·여러 요인(l02) · 누가 어찌하다·문법 용어·물건에 -시-·께서와 함께·여쭈어보·과정 중심 평가(l03) · 따라 하지 않·마음 변화·가르치·듣는 상대의 마음(l05) · 다양한 답·무시하거나 배려하지 않은·말투 표정 듣기 자세·첫출발(l07) · 토의·토론 학습 모형·협력적·처지를 헤아려·멈추·네다섯 명(l08) · 두 번 이상·호응·칭찬·역할놀이에만 관심·평가 자료 2(l10) · 성취기준·상황과 지킬 점·문장을 만들(l12) · 뜻을 생각·ㅐㅔㅒㅖ·구체적·질문을 더 보태(l14)', () => { const tx = (k) => JSON.stringify(L[k]);
  [['u4_l01', [/정답을 제시하기보다|스스로 생각을 나누/, /호기심/, /학습 계획/]], ['u4_l02', [/문장 전체/, /‘께’, ‘드리다’/, /공식적 상황에서 높임 표현을 사용하지 않/, /나이와 관계없이/, /여러 요인/]],
   ['u4_l03', [/누가 어찌하다/, /문법 용어/, /물건에 ‘-시-’/, /‘께서’와 함께/, /여쭈어보/, /과정 중심 평가/]], ['u4_l05', [/따라 하지 않/, /어색함 → 좋음 → 부끄러움/, /가르치/, /듣는 상대의 마음/]],
   ['u4_l07', [/다양한 답/, /무시하거나 배려하지 않은/, /말투, 표정, 듣기 자세/, /첫출발/]], ['u4_l08', [/토의·토론 학습 모형/, /협력적/, /상대의 처지를 헤아려/, /멈추/, /네다섯 명/]],
   ['u4_l10', [/두 번 이상/, /호응/, /칭찬/, /역할놀이에만 관심/, /평가 자료 2/]], ['u4_l12', [/성취기준/, /구체적인 상황과 지킬 점/, /문장을 만들/]], ['u4_l14', [/뜻을 생각/, /ㅐ·ㅔ·ㅒ·ㅖ/, /구체적/, /질문을 더 보태/]]].forEach(([k, res]) => res.forEach(re => ok(re.test(tx(k)), k + ' ' + re))); });

console.log('═══ L. 선행 ═══');
const EFI = errFirst(L);
T('처음 배우는 차시 전에는 그 말 0 · 그 차시에는 있음 (l01 단원 도입 · 복습·다음 장 · 다음 시간 준비 카드 예외) — ' + FIRST.length + '말', () => ok(!EFI.length, EFI.join(' | ')));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('렌더된 그림 속 「결」·겹낫표 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) { const h = FIG.render(s.data.fig); ok(h.indexOf('결') < 0 && !/[『』]/.test(h), k + ' ' + s.id); } })));
T('교사 화면(렌더 글자)에 영어 코드(u4 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~F)만', () => { KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(/^[A-F]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1, k: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ N. 제재 — 제목·지은이 · 쪽 안내 · 인용 줄 ═══');
T('작품 ' + WORKS.length + '편 — 제목 곁에 지은이 · 교과서 쪽 안내 · 인용 줄 ≤ 4(그림 글 판 전부 · [간추림]·→ 빼고) · 「아드님, 진지 드세요」 원문 문장 덱 전체 ' + storyCount(L) + ' ≤ 12', () => { const e = errWorks(L); ok(!e.length, e.join(' | ')); });
T('이야기 글 판 2장 모두 [간추림] 줄과 「→ 「국어」 교과서 ○○쪽」 안내 · 만화 글 판 [간추림]', () => { const st = L.u4_l05.slides.filter(s => s.block === 'concept' && s.data.fig.k === 'text'); ok(st.length === 2 && st.every(s => s.data.fig.lines.some(l => /^\[간추림\]/.test(l)) && s.data.fig.lines.some(l => /^→ 「국어」 교과서 1\d\d/.test(l))), '이야기 쪽 안내');
  const cm = L.u4_l12.slides[6].data.fig; ok(cm.k === 'text' && cm.lines.some(l => /^\[간추림\]/.test(l)), '만화'); });
T('인용 셈 자체 확인 — 「아드님, 진지 드세요」 지금 4줄 · 한 줄 더하면 5', () => { ok(quotedOf(L, '아드님, 진지 드세요').size === 4, quotedOf(L, '아드님, 진지 드세요').size); const X = clone(L); X.u4_l05.slides[3].data.fig.lines.splice(1, 0, '“엄마, 물 줘!”'); ok(quotedOf(X, '아드님, 진지 드세요').size === 5, '셈'); });

console.log('═══ O. 정답이 하나가 아님 ═══');
T('심화 = open · 답은 「여러 답 (예:」로 시작', () => KEYS.forEach(k => { const v = L[k].slides[11].data.levels.심화; ok(v.open === true && /^여러 답 \(예:/.test(v.a), k); }));
T('열린 장(오개념 바른 생각·넓히기·심화에 「사람마다/여러 답」 + 「까닭/근거」) ≥ 4차시 · l01 오개념 = 대화하는 상대 · l07 = 존중하고 배려하는 태도', () => { const n = KEYS.filter(k => { const sl = L[k].slides; return [sl[7].data.right, sl[14].data.note, sl[11].data.levels.심화.q + ' ' + sl[11].data.levels.심화.a].some(t => /사람마다|여러 답/.test(t) && /까닭|근거/.test(t)); }).length; ok(n >= 4, n);
  ok(/대화하는 상대/.test(L.u4_l01.slides[7].data.right) && /존중하고 배려하는 태도/.test(L.u4_l07.slides[7].data.right), '오개념'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('기본 문제 정답 바꿈(l03 ② 나왔습니다 → 나오셨어요 보기)', X => { const d = X.u4_l03.slides[9].data; d.options[0].correct = false; d.options[1].correct = true; }, X => errAnswers(X).er);
red('출구 높임 낱말 정답 바꿈(l12 계시다 → 있으시다)', X => { X.u4_l12.slides[15].data.items[0].a = '있으시다'; }, X => errAnswers(X).er);
red('수준별 고친 표현 정답 바꿈(l03 모시러 → 데리고)', X => { X.u4_l03.slides[11].data.levels.도전.a = '데리고'; }, X => errAnswers(X).er);
red('넓히기 정답 바꿈(l10 기뻐하는 말투 → 울먹이는 말투)', X => { X.u4_l10.slides[14].data.note = X.u4_l10.slides[14].data.note.replace('**기뻐하는 말투**', '**울먹이는 말투**'); }, X => errAnswers(X).er);
red('복습 계보 끊음(l07 복습 한 줄 바꿈)', X => { X.u4_l07.slides[1].data.items[0].a = '높임말'; }, errReview);
red('l01 복습을 3단원 아닌 것으로', X => { X.u4_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l05 개념 「세상과 연결하기」)', X => { X.u4_l05.slides[3].data.content += ' 세상과 연결하기를 해요.'; }, errBan);
red('보탬 카드 b_l3_1 되살림', X => { X.u4_l03.extras.push({ id: 'b_l3_1', type: 'other_activity', title: '교과서 활동', content: '민수와 아버지' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지움(l08 귓속말 → 속삭임)', X => { X.u4_l08.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/귓속말/g, '속삭임')); }); }, X => errAbsorb(X).er);
red('교과서 낱말 지움(l14 깨구리)', X => { X.u4_l14 = JSON.parse(JSON.stringify(X.u4_l14).replace(/깨구리/g, '개굴이')); }, errTB);
red('인용 줄 넘침(「아드님, 진지 드세요」 원문 한 줄 더함)', X => { X.u4_l05.slides[5].data.fig.lines.splice(1, 0, '“엄마, 물 줘!”'); }, errWorks);
red('지은이 지움(「아드님, 진지 드세요」 강민경)', X => { X.u4_l05 = JSON.parse(JSON.stringify(X.u4_l05).replace(/강민경/g, '')); }, errWorks);
red('마음 변화 차례 바꿈(l05 왕자처럼 좋음 ↔ 부끄러움)', X => { const it = X.u4_l05.slides[4].data.fig.flow; [it[1], it[2]] = [it[2], it[1]]; }, errOrder);
red('모둠 대화 차례 바꿈(l08 의견 모으기 ↔ 의견 마련하기)', X => { const st = X.u4_l08.slides[12].data.steps; [st[1], st[2]] = [st[2], st[1]]; }, errOrder);
red('문제 그림에 정답 보임(l08 ③ 카드에 끝인사 예절)', X => { X.u4_l08.slides[10].data.fig.items[0].kind = '마칠 때 끝인사를 한다'; }, X => errFigs(X).er);
red('높임 낱말 메모 틀림(l03 집 → 진지)', X => { X.u4_l03.slides[6].data.fig.items[1] = '병 → 병환 · 사람 → 분 · 집 → 진지'; }, X => errFigs(X).er);
red('인물 바꿈(l07 곰이 → 지웅)', X => { X.u4_l07.slides[2].data.kids[0].label = '지웅\n"어?"'; }, errPeople);
red('선행 말 앞당김(l02 개념에 「‘-시-’」)', X => { X.u4_l02.slides[4].data.content += ' 높임을 나타내는 ‘-시-’를 써요.'; }, errFirst);

console.log('\n게이트 g3s2 국어 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
