/* gate_g3s2_korean_u5.js — 3학년 2학기 국어 5단원 「사전으로 여는 세상」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g3s2_korean_u2 틀 + 국어 사전 대조 + 한글 자모 셈).
   옛 게이트(39차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g3s2_korean_u5.js 에 보관. 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·meta(3학년 2학기 · 5단원 · 지도서 차시 묶음 · 성취기준 문구 · 학습 목표 · 분 · 지도서 쪽 · live_url · theme) · 부품 등록 · slug g3s2_korean
   B 19장 골격 · C 7요소(3학년 = 곰이·펭이 말풍선 동기 장 + 장면) · 실사 자리 8종 서로 다름 · 3-2 국어 다른 단원과 겹침 0
   D 복습 계보(l01 = 4단원 마지막 차시 출구 — u4 데이터 파일에서 마지막 키까지 동적으로 읽어 대조 → 이후 = 직전 차시 출구) · 마지막 = 6단원 「감상과 표현의 즐거움」 예고
   E 정답 다시 풀기 — 게이트 자체 사전·셈으로 푼다:
       · 한글 자모 분해(첫 자음자·모음자·받침 = 붙임 11 차례표 차례)로 국어사전 차례를 스스로 셈(학교·교실·가방·하루 · 활동지 짝 다섯 · 국어활동 75쪽 ㉮㉯㉰ · ‘친구’ 찾기 장면)
       · 기본형 = 여러 형태의 자모 공통 앞부분 + ‘-다’(본다·보고·보면 → 보) · 한 형태는 바뀌는 부분 표(고·으니·으면·어서·아서·었다…)를 떼고 ‘-다’
       · ‘ㄴ’ 소리 = 받침 뒤 ‘이·야·여·요·유’의 첫 자음자 ㅇ → ㄴ(솜이불 → [솜니불]) · ㅘ·ㅙ·ㅚ = 모음자 분해 · 조사 은/는 = 받침 유무 · ‘ㅅ이 들어가는 두 글자’
       · 낱말 종류 표(지도서 305~309쪽 예시 답안 · 국어활동 72쪽) · 뜻풀이 표(지도서·교과서에 실린 것만 — 당일·우천·보건·사흘·얼·깃들다·미지·표면·시루·마무리·갈무리·고유어)
       · 놀이 예시 답안(221·225쪽) · 「낱말을 먹는 아이」 표 · 「아직도 미지의 세계는 남아 있다」 표 · 단서 카드(248쪽) · 국어활동 74쪽 네 친구의 말(자모·기본형으로 참거짓 셈)
       → 기본 24 · 수준별 16 · 출구 24 · 넓히기 8 = 72
   F 차례 사슬 — 놀이 네 단계(218쪽) · 말놀이 세 단계(225쪽) · 기본형 만들기 두 단계(229쪽) · 「낱말을 먹는 아이」 사건 차례 · ‘친구’ 찾기 차례(240쪽) · 「아직도 미지의」 차례 · 단서 놀이 · 나만의 국어사전 네 단계
   G 그림 — 렌더 · 쓰는 부품만(text·mood·sort2·sound·link·tools·chain · panels 안쪽) · 소단원 차시 이름 = 지도서 차시 표 · 낱말 종류 표 · 기본형 표 · 글자의 짜임 · 사전 차례
       · 뜻 표 · ‘ㄴ’ 소리 · ㅘ·ㅙ·ㅚ · 단서 카드 · 문제 그림이 정답을 보이지 않음 · 문제 카드 ≤ 3(넘침) · 기본 문제 글 상자는 panels
   H 재료 충실(개념·문제·다음 = src) · 교과서 낱말 표(활동목록.md 차시별) · 보탬 흡수 대조(옛 TB 32장 핵심 낱말이 본류 장에 · b_l id 0) · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 분(40분 30~45 · 80분 60~80) · 물음 끝 「요?」 · 지도서 유의점이 교사 층에
   L 선행(움직임을 나타내는 낱말 l02 · 기본형 l04 · 분류 정의 l06 · 첫 자음자·차례표 l08 · 미지·뜻을 짐작 l10 · 단서 카드·나만의 국어사전 l12 · 솜이불·갈무리 l14 — l01 단원 도입 예외)
   M 차단 어휘 · 「결」 0 · 겹낫표 0 · 품사 이름 0(유의 사항 ❶) · 교사 화면 영어 코드 0 · 인물 = 곰이·펭이(+ 교과서 인물) · 옛 창작 장면 0
   N 제재 — 작품마다 제목·지은이 · 교과서 쪽 안내 · 작품별 인용 줄 ≤ 4(그림 text 를 모두 모아 셈 · [간추림]·→ 줄 빼고)
   O 정답이 하나가 아님 — 심화 open · 「여러 답 (예:」 · 열린 장 ≥ 4차시
   R 역검증 레드 — 망가뜨린 사본을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g3s2_korean_u5.js */
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
const L = load(path.join(TDIR, 'data/g3s2_korean_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_korean_u5.json'), 'utf8'));
const KEYS = ['u5_l01', 'u5_l02', 'u5_l04', 'u5_l06', 'u5_l08', 'u5_l10', 'u5_l12', 'u5_l14'];
const COV = { u5_l01: [1, 1], u5_l02: [2, 3], u5_l04: [4, 5], u5_l06: [6, 7], u5_l08: [8, 9], u5_l10: [10, 11], u5_l12: [12, 13], u5_l14: [14, 14] };
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const UT = '사전으로 여는 세상';

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

/* ══════════ 한글 자모 셈 (게이트 자체 — 생성기와 따로) ══════════ */
/* 음절 = 첫 자음자(19) × 모음자(21) × 받침(28) — 유니코드 한글 음절 배치에서 칸 번호만 뽑고, 차례는 아래 「붙임 11 차례표」 글자열로 정한다 */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const JONG = [''].concat('ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split(''));
/* 국어사전에 낱자를 싣는 차례(「국어」 붙임 11 · 지도서 319쪽) — 받침 없음이 맨 앞 */
const DICT = { cho: 'ㄱ ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ'.split(' '), jung: 'ㅏ ㅐ ㅑ ㅒ ㅓ ㅔ ㅕ ㅖ ㅗ ㅘ ㅙ ㅚ ㅛ ㅜ ㅝ ㅞ ㅟ ㅠ ㅡ ㅢ ㅣ'.split(' '), jong: ['(없음)'].concat('ㄱ ㄲ ㄳ ㄴ ㄵ ㄶ ㄷ ㄹ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅁ ㅂ ㅄ ㅅ ㅆ ㅇ ㅈ ㅊ ㅋ ㅌ ㅍ ㅎ'.split(' ')) };
function jamo(ch) { const c = ch.charCodeAt(0) - 0xAC00; if (c < 0 || c > 11171) return null; return { cho: CHO[Math.floor(c / 588)], jung: JUNG[Math.floor((c % 588) / 28)], jong: JONG[c % 28] }; }
function compose(cho, jung, jong) { return String.fromCharCode(0xAC00 + CHO.indexOf(cho) * 588 + JUNG.indexOf(jung) * 28 + JONG.indexOf(jong || '')); }
const sylls = (wd) => Array.from(String(wd).replace(/\s/g, ''));
const keyOf = (s) => { const j = jamo(s); return [DICT.cho.indexOf(j.cho), DICT.jung.indexOf(j.jung), DICT.jong.indexOf(j.jong || '(없음)')]; };
function cmpWord(a, b) { const A = sylls(a), B = sylls(b); for (let i = 0; i < Math.min(A.length, B.length); i++) { const x = keyOf(A[i]), y = keyOf(B[i]); for (let t = 0; t < 3; t++) if (x[t] !== y[t]) return x[t] - y[t]; } return A.length - B.length; }
const dictSort = (ws) => ws.slice().sort(cmpWord);
/* 기본형 — 여러 형태: 자모 칸(첫·모·받침) 공통 앞부분 → 음절로 되돌림 */
const slots = (wd) => sylls(wd).reduce((a, s) => { const j = jamo(s); return a.concat([j.cho, j.jung, j.jong]); }, []);
function lcpStem(forms) { const S = forms.map(slots); let n = 0; while (S.every(x => n < x.length && x[n] === S[0][n])) n++; const sl = S[0].slice(0, n); let out = ''; for (let i = 0; i + 1 < sl.length; i += 3) out += compose(sl[i], sl[i + 1], i + 2 < sl.length ? sl[i + 2] : ''); return out; }
const restOf = (form, stem) => sylls(form).slice(sylls(stem).length).join('');
/* 기본형 — 한 형태: 바뀌는 부분 표(교과서 226~229쪽 · 국어활동 73쪽 · 평가 자료 1)를 뒤에서 떼고 ‘-다’ */
const ENDS = ['었다', '았다', '어서', '아서', '으니', '으면', '어요', '아요', '고', '니', '면', '서', '어', '아'];
function baseOf(form) { const f = String(form); const e = ENDS.find(x => f.length > x.length && f.endsWith(x)); ok(e, '바뀌는 부분 못 찾음 ' + f); return f.slice(0, f.length - e.length) + '다'; }
/* ‘ㄴ’ 소리 — 받침 뒤에 ‘이·야·여·요·유’가 오면 그 첫 자음자 ㅇ → ㄴ (「국어」 252쪽 · 지도서 330쪽) */
const YI = ['ㅣ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ'];
function pron(wd) { const S = sylls(wd).map(jamo); return '[' + S.map((j, i) => (i && S[i - 1].jong && j.cho === 'ㅇ' && YI.indexOf(j.jung) >= 0 ? compose('ㄴ', j.jung, j.jong) : compose(j.cho, j.jung, j.jong))).join('') + ']'; }
const josa = (wd, a, b) => (jamo(sylls(wd).pop()).jong ? a : b);
const hasJ = (wd, j) => sylls(wd).some(s => { const x = jamo(s); return x.cho === j || x.jong === j; });

/* ══════════ 지도서 사전·표 (게이트 자체 — 생성기와 따로 옮김) ══════════ */
const K3 = { 이름: '이름을 나타내는 낱말', 움직임: '움직임을 나타내는 낱말', 성질: '성질이나 상태를 나타내는 낱말' };
/* 낱말 종류 — 지도서 305~309쪽 예시 답안 · 국어활동 72쪽 · 지도서 316쪽 보기 · 251쪽 · 평가 자료 1 보정 · 지도서 314쪽 동기 */
const KIND = {};
[['이름', '의자 교실 운동장 축구공 친구 자전거 학교 칠판 날개 발톱 깃털 공 침대 초콜릿 책상 안경 가방 치약 떡볶이 시계 강아지 선생님 사과 전구 양말 모자 단추 목도리 신발 장갑 한복 방바닥 자랑 사랑 행복 용기 젓가락 반찬 소'],
 ['움직임', '돌아갔어 앉았어 뛰다 차다 마시다 먹다 던지다 울다 날다 펼치다 잡다 피하다 웃다 흐르다 켜다 달리다 신다 쓰다 두르다 매다 끼다 보다 잠자다 씻다 읽다 말하다 앉다 사랑하다 먹었다 올립니다 숙입니다'],
 ['성질', '멋있어 착해 맛있다 길다 빠르다 뜨겁다 즐겁다 무섭다 가볍다 날카롭다 크다 슬프다 괴롭다 밝다 따뜻하다 짧다 예쁘다 납작하다 푸르다 아름답다 높다 검다 노랗다 곱슬하다 자랑스럽다 사랑스럽다 다릅니다 행복하다 서럽다 든든하다 미안하다 우울하다 허전하다']
].forEach(([k, ws]) => ws.split(' ').forEach(x => { KIND[x] = k; }));
const kindName = (wd) => { ok(KIND[wd], '종류 표에 없는 낱말 ' + wd); return K3[KIND[wd]]; };
const changes = (wd) => KIND[wd] !== '이름'; /* 227쪽 — 움직임·성질이나 상태를 나타내는 낱말은 쓰임에 따라 형태가 바뀜 */
/* 놀이 셋(220~221쪽 보기 · 예시 답안) · 말놀이(225쪽) · 외출 준비 표시(국어활동 72쪽) */
const BOGI221 = ['멋있어', '의자', '돌아갔어', '교실', '착해', '앉았어'];
const GAME = { '……에 가면': '이름', '그리고 뭐 했어?': '움직임', '……은/는 어때?': '성질' };
const PLAY221 = { '학교에 가면': ['의자', '교실'], '의자에': ['앉았어'], '교실로': ['돌아갔어'], '내 친구는': ['착해'], '자동차는': ['멋있어'] };
const PLAY225 = { 점심시간: ['젓가락', '반찬'], 운동장: ['달리다', '던지다'] };
const MARK72 = { 이름: '○', 움직임: '□', 성질: '△' };
/* 뜻풀이 — 지도서·교과서에 실린 것만(217·241·246쪽 · 국어활동 75쪽 · 252쪽 · 지도서 331쪽 고유어 · 228·237쪽 날개) */
const DEF = { 당일: '일이 있는 바로 그날', 우천: '비가 오는 날씨', 보건: '건강을 온전하게 잘 지킴', 사흘: '세 날', 얼: '정신의 줏대', 깃들다: '감정, 생각, 노력 따위가 어리거나 스미다',
  미지: '아직 알지 못함', 표면: '사물의 가장 바깥쪽', 시루: '떡이나 쌀 따위를 찌는 데 쓰는 둥근 질그릇', 마무리: '일의 끝맺음', 갈무리: '물건 따위를 잘 정리함',
  안다미로: '담은 것이 그릇에 넘치도록 많이', 이드거니: '충분한 분량으로 만족스러운 모양', 내처: '어떤 일 끝에 더 나아가', 제풀에: '내버려두어도 저 혼자 저절로',
  기본형: '형태가 바뀌는 낱말의 기본이 되는 형태', 분류: '여럿 가운데에서 같은 특징을 가진 것끼리 갈라놓는 것' };
const GUESS246 = { 미지: '잘 모르거나 새로움', 표면: '겉 부분' };
/* 「낱말을 먹는 아이」(231~236쪽) — 먹은 낱말 → 그날의 모습 */
const EAT = { 기쁨: '즐거웠', 슬픔: '울기만', 사랑: '안아 주고 싶', 분노: '밀쳐 버리고 싶', 두려움: '무서웠' };
const NINE236 = ['웃다', '침대', '슬프다', '칠판', '울다', '흐르다', '괴롭다', '초콜릿', '즐겁다'];
/* 「아직도 미지의 세계는 남아 있다」(242~247쪽) · 짐작하는 방법(245쪽 · 지도서 323쪽) */
const GUESS323 = ['낱말의 앞뒤 내용을 살펴본다', '다른 낱말로 바꾸어 뜻이 통하는지 본다'];
const SEA247 = ['해저 지도', '해류의 흐름을 나타낸 지도', '수온의 분포를 나타낸 지도'];
/* 단서 카드(248쪽) · 놀이 차례 · 분류 릴레이(지도서 329쪽) · 나만의 국어사전(249쪽) */
const CLUE248 = { word: '학교', 종류: '이름을 나타내는 낱말', 뜻: '학생을 가르치는 교육 기관', 문장: '나는 날마다 (　　)에 간다.' };
const CLUENAME = { 종류: '낱말의 종류', 뜻: '낱말의 뜻', 문장: '낱말이 쓰이는 문장' };
const STEPS248 = ['카드 뒤집어 놓기', '가위바위보', '하나씩 열기', '먼저 알아맞히기'];
const RELAY329 = ['앞선 분류 기준에 따라 분류', '새 분류 기준을 외치며 분류'];
const MYDICT249 = ['낱말 모으기', '종류와 뜻', '싣는 차례', '그림'];
/* 국어사전 차례 — 239쪽 · 활동지(지도서 321쪽) 짝과 답 · 국어활동 75쪽 번호(쪽 그림 판독) · 240쪽 장면 낱말 */
const ORDER239 = ['가방', '교실', '하루', '학교'];
const PAIRS321 = [['나라', '가을', '가을'], ['사자', '소리', '사자'], ['자라', '장구', '자라'], ['강조', '갈래', '갈래'], ['발사', '발레', '발레']];
const KH75 = { '㉮': [['너비', 1], ['시루', 2]], '㉯': [['겨레', 1], ['고요', 2], ['구기', 3]], '㉰': [['하교', 1], ['학문', 2], ['한과', 3], ['한파', 4]] };
const SCENE240 = ['층간', '층수', '치통', '치하', '칙사', '친가', '친교', '친구'];
/* 국어활동 74쪽 네 친구의 말 — 참거짓을 게이트가 셈(자모·기본형) */
const CLAIM74 = {
  진영: { key: '첫 자음자가 같은 낱말끼리 모여', truth: () => { const ws = dictSort(Object.keys(KIND).concat(SCENE240, ORDER239)); const seen = []; let last = null; return ws.every(x => { const c = jamo(x[0]).cho; if (c !== last) { if (seen.indexOf(c) >= 0) return false; seen.push(c); last = c; } return true; }); } },
  선우: { key: '‘얼음’을 찾을 때 ‘ㄹ’', truth: () => jamo('얼').cho === 'ㄹ' },
  세희: { key: '‘먹다’라는 낱말을 찾아야', truth: () => baseOf('먹었다') === '먹다' },
  민호: { key: '형태가 바뀐 낱말이 모두 실려', truth: () => ['맛있는', '맛있고', '맛있어서'].every(f => f === lcpStem(['맛있는', '맛있고', '맛있어서']) + '다') }
};
/* ‘ㄴ’ 소리 표(252쪽) · ㅘ·ㅙ·ㅚ(253쪽) */
const PRON252 = { 솜이불: '[솜니불]', 담요: '[담뇨]', 맨입: '[맨닙]', 눈요기: '[눈뇨기]' };
const WAE = ['ㅘ', 'ㅙ', 'ㅚ'];
const WRITE253 = { ㅘ: ['과자', '영화', '완성'], ㅙ: ['돼지', '횃불'], ㅚ: ['괴물', '횡단보도'] };
/* 그 밖의 지도서 사실 표 — 쪽마다 예시 답안 */
const S = {
  why217: '낱말의 정확한 뜻을 몰라서', stuck217: ['당일', '우천'], riddle218: { word: '소', sound: '음매' }, three219: ['전구', '밝다', '켜다'], abstract303: ['행복', '사랑'],
  unitParts: ['기준에 따라 낱말 분류하기', '국어사전 활용하기'],
  empty236: '낱말을 모두 먹어 버리기로 했어요', help236: '내 기분이 어떤지, 내가 누구인지 잘 알 수 있도록 해 주어서', criteria317: '달라질 수 있어요',
  swap245: '새로운', rock247: '땅속을 이루는 암석에 대한 지도', why247: '인간들이 세상의 구석구석을 탐험해 만들었기 때문이에요', first323: '뜻을 짐작하며 읽어요', order324: '먼저 짐작하며 읽고, 국어사전으로 확인',
  win248: '상대의 낱말을 먼저 알아맞힌 사람'
};
const KNUM = { 3: '세', 6: '여섯' };
const stem = (s) => nsp(s).replace(/[.,!?·]/g, '').replace(/(했어요|했다|어요|았다|었다|한다|다|요)$/, '');
const sameStem = (a, b) => { const x = stem(a), y = stem(b); return x === y || (x.length >= 6 && y.indexOf(x) === 0); };

/* ── 풀이기(문항 하나 → 게이트가 낸 정답) ── */
const qt = (q) => clean(q);
const brk = (q) => (qt(q).match(/「[^」]+」/g) || []).map(x => x.slice(1, -1));
const WORD = (q) => { const m = qt(q).match(/「(.+?)」(?:이)?라는 뜻의 낱말/); ok(m, '낱말 뜻 물음 꼴 아님 ' + q); const ws = Object.keys(DEF).filter(k => DEF[k] === m[1]); ok(ws.length === 1, '사전에 없는 뜻 ' + m[1]); return ws[0]; };
const DEFQ = (q) => { const m = qt(q).match(/[‘「]([^’」]+)[’」]의 뜻/g); ok(m, '뜻 물음 꼴 아님 ' + q); const wd = m[m.length - 1].replace(/의 뜻$/, '').slice(1, -1); ok(DEF[wd], '뜻 표에 없음 ' + wd); return DEF[wd]; };
const optsT = (d) => d.options.map(o => clean(o.text));
const KINDQ = (q) => { const ws = brk(q).filter(x => KIND[x]); ok(ws.length === 1, '종류 물을 낱말 ' + ws.length); return kindName(ws[0]); };
const AMONG = (list) => (d) => optsT(d).filter(t => list.indexOf(t) >= 0);
const AMONG_KIND = (k) => (d) => { optsT(d).forEach(t => ok(KIND[t], '표에 없는 보기 ' + t)); return optsT(d).filter(t => KIND[t] === k); };
const FORMQ = (q) => { const fl = brk(q).find(x => x.indexOf(', ') > 0); ok(fl, '형태 묶음 없음'); const st = lcpStem(fl.split(', ')); return /바뀌지 않는 부분은 무엇/.test(qt(q)) ? st : st + '다'; };
const BASEQ = (q) => { const m = qt(q).match(/[‘「]([^’」]+)[’」]의 기본형/); ok(m, '기본형 물음 꼴'); return baseOf(m[1]); };
const LISTQ = (q) => { const fl = brk(q).find(x => x.indexOf(', ') > 0); ok(fl, '낱말 묶음 없음'); return fl.split(', '); };
const OPEN = 'OPEN';
const fx = (f) => (typeof f === 'function' ? f : () => f);
const missing = (all, q) => { const r = all.filter(x => qt(q).indexOf(x) < 0); ok(r.length === 1, '빠진 하나 ' + r.length); return r[0]; };
const EXP = {
  basic: {
    u5_l01: [(d) => DEFQ(d.question), S.why217, S.riddle218.word],
    u5_l02: [AMONG_KIND('이름'), (d) => { const g = Object.keys(GAME).find(x => qt(d.question).indexOf(x) >= 0); ok(g, '놀이 이름'); optsT(d).forEach(t => ok(BOGI221.indexOf(t) >= 0, '보기 밖 ' + t)); const c = optsT(d).filter(t => KIND[t] === GAME[g]); ok(c.length === 1, '규칙에 맞는 보기 ' + c.length); const slot = Object.keys(PLAY221).find(x => qt(d.question).indexOf(x) >= 0); ok(slot && PLAY221[slot].indexOf(c[0]) >= 0, '예시 답안과 다름'); return c[0]; },
      (d) => { const m = qt(d.question).match(/‘([^’]+)’에 해야 할 표시/); ok(m, '표시 물음'); return MARK72[KIND[m[1]]] + ' 표'; }],
    u5_l04: [(d) => FORMQ(d.question), (d) => FORMQ(d.question), (d) => BASEQ(d.question)],
    u5_l06: [(d) => { const e = Object.keys(EAT).find(x => qt(d.question).indexOf('‘' + x + '’') >= 0); ok(e, '먹은 낱말'); const c = optsT(d).filter(t => t.indexOf(EAT[e]) >= 0); ok(c.length === 1, '알맞은 보기 ' + c.length); optsT(d).filter(t => t !== c[0]).forEach(t => ok(Object.keys(EAT).some(x => x !== e && t.indexOf(EAT[x]) >= 0), '오답이 다른 날 모습 아님 ' + t)); return c[0]; },
      AMONG_KIND('성질'), (d) => { optsT(d).forEach(t => ok(NINE236.indexOf(t) >= 0, '보기 밖 ' + t)); return optsT(d).filter(t => !changes(t)); }],
    u5_l08: [(d) => dictSort(LISTQ(d.question)).join(' → '), (d) => dictSort(LISTQ(d.question))[0],
      (d) => { const body = d.scenario.body; return Object.keys(CLAIM74).filter(n => { ok(body.indexOf(n + ':') >= 0 && body.indexOf(CLAIM74[n].key) >= 0, n + ' 말 없음'); return !CLAIM74[n].truth(); }); }],
    u5_l10: [AMONG(GUESS323), (d) => { const a = DEFQ(d.question); optsT(d).filter(t => t !== a).forEach(t => ok(Object.values(GUESS246).concat(Object.values(DEF)).indexOf(t) >= 0, '오답이 짐작·사전 뜻 아님 ' + t)); return a; },
      (d) => { optsT(d).filter(t => t !== S.rock247).forEach(t => ok(SEA247.concat('우주 지도').indexOf(t) >= 0, '오답이 글의 지도 아님 ' + t)); return S.rock247; }],
    u5_l12: [(d) => KINDQ(d.question), (d) => { const c = optsT(d).filter(t => t === STEPS248.join(' → ')); ok(c.length === 1, '차례 보기'); return c[0]; }, (d) => dictSort(LISTQ(d.question))[0]],
    u5_l14: [(d) => pron(brk(d.question)[0]), (d) => DEFQ(d.question), (d) => { const sent = brk(d.question)[0]; optsT(d).forEach(t => ok(sent.indexOf(t) >= 0, '문장에 없는 글자 ' + t)); return optsT(d).filter(t => WAE.indexOf(jamo(t).jung) >= 0); }]
  },
  lev: {
    u5_l01: [() => S.stuck217.join(', '), (q) => WORD(q)], u5_l02: [(q) => KINDQ(q), (q) => { const slot = Object.keys(PLAY221).find(x => qt(q).indexOf(x) >= 0); const g = Object.keys(GAME).find(x => qt(q).indexOf(x) >= 0); const a = PLAY221[slot][0]; ok(KIND[a] === GAME[g] && BOGI221.indexOf(a) >= 0, '놀이 규칙'); return a; }],
    u5_l04: [(q) => FORMQ(q), (q) => FORMQ(q)], u5_l06: [(q) => WORD(q), S.empty236], u5_l08: [(q) => DEFQ(q), (q) => WORD(q)],
    u5_l10: [S.swap245, (q) => missing(SEA247, q)], u5_l12: [(q) => CLUENAME[Object.keys(CLUENAME).find(k => qt(q).indexOf(clean(CLUE248[k]).replace(/\(\s+\)/, '').slice(0, 6)) >= 0)], () => RELAY329[1] + '해요'],
    u5_l14: [(q) => WORD(q), (q) => pron(brk(q)[0])]
  },
  exit: {
    u5_l01: [(q) => { ok(qt(q).indexOf('‘' + S.riddle218.word + '’') >= 0, '낱말 소'); return S.riddle218.sound; }, (q) => missing(S.unitParts, q), (q) => missing(S.three219, q)],
    u5_l02: [(q) => missing(Object.values(K3), q), (q) => KINDQ(q), (q) => { const k = Object.keys(PLAY225).find(x => qt(q).indexOf(x) >= 0); return missing(PLAY225[k], q); }],
    u5_l04: [(q) => FORMQ(q), (q) => WORD(q), (q) => FORMQ(q)],
    u5_l06: [S.help236, (q) => KINDQ(q), S.criteria317],
    u5_l08: [(q) => { const m = qt(q).match(/‘(.)’의 첫 자음자/); ok(m, '글자'); return jamo(m[1]).cho; }, (q) => { const m = qt(q).match(/㉰의 (.+?) 가운데/); ok(m, '㉰ 낱말'); return dictSort(m[1].split(', '))[0]; }, (q) => baseOf(brk(q)[0])],
    u5_l10: [S.why247, S.first323, (q) => DEFQ(q)],
    u5_l12: [(q) => { ok(['뜻', '종류'].every(k => qt(q).indexOf(CLUE248[k]) >= 0), '단서 둘'); return CLUE248.word; }, S.win248,
      (q) => { const m = qt(q).match(/맞는 낱말은 (.+?) 가운데/); ok(m && /ㅅ이 들어가는 두 글자/.test(qt(q)), '조건'); const c = m[1].split(', ').filter(x => sylls(x).length === 2 && hasJ(x, 'ㅅ')); ok(c.length === 1, 'ㅅ 두 글자 ' + c.length); return c[0]; }],
    u5_l14: [(q) => KINDQ(q), () => { const ins = Object.keys(PRON252).map(wd => { const a = sylls(wd), b = sylls(PRON252[wd].slice(1, -1)); const i = a.findIndex((s, k) => s !== b[k]); return jamo(b[i]).cho; }); ok(new Set(ins).size === 1, '더해진 소리 하나'); return ins[0] + ' 소리'; }, (q) => baseOf(brk(q)[0])]
  },
  /* 넓히기 — 맥락에서 다시 푼다 */
  adv: {
    u5_l01: (d) => { ok(/「사랑」/.test(d.context), '사랑 카드'); return { has: S.abstract303 }; },
    u5_l02: (d) => { const ws = brk(d.context).filter(x => KIND[x]); ok(ws.length === 3, '세 낱말'); const short = { 이름: '이름', 움직임: '움직임', 성질: '성질이나 상태' }; return { exact: ws.map(x => x + josa(x, '은', '는') + ' ' + short[KIND[x]]).join(', ') }; },
    u5_l04: (d) => { const m = d.context.match(/「([^」]+)」를 그대로/); ok(m, '그대로 찾은 말'); return { exact: baseOf(m[1]) }; },
    u5_l06: (d) => { const kinds = {}; NINE236.forEach(x => { kinds[KIND[x]] = (kinds[KIND[x]] || 0) + 1; }); ok(Object.values(kinds).every(v => v === 3), '셋씩'); const no = NINE236.filter(x => !changes(x)), yes = NINE236.filter(changes);
      return { stem: '분류 기준이 다르면 나뉜 모습도 달라질 수 있어요', inNote: ['셋씩', KNUM[yes.length] + ' 개', KNUM[no.length] + ' 개(' + no.join('·') + ')'] }; },
    u5_l08: (d) => { const a = brk(d.context).length ? null : null; void a; const m = d.context.match(/‘(층\S*)’/); ok(m, '펼친 쪽 낱말'); return { exact: cmpWord(m[1], '친구') < 0 ? '뒤로' : '앞으로', inNote: [jamo('층').jung, jamo('친').jung] }; },
    u5_l10: (d) => { ok(d.context.indexOf(GUESS246.표면) >= 0 && d.context.indexOf(DEF.표면) >= 0, '짐작·사전 뜻'); return { exact: S.order324 }; },
    u5_l12: (d) => { const ws = brk(d.context); const placed = ws.filter(x => KIND[x]).slice(0, 2), held = ws.filter(x => KIND[x]).pop(); const k = KIND[held]; const fits = placed.some(x => KIND[x] === k);
      return { exact: K3[k], inNote: [fits ? '놓을 수 있' : '놓을 수 없'].concat(placed.filter(x => changes(x) === changes(held)).map(x => '「' + x + '」와 같은 쪽')) }; },
    u5_l14: (d) => { const wd = Object.keys(PRON252).find(x => d.context.indexOf(pron(x).slice(1, -1)) >= 0); ok(wd, '소리대로 쓴 말'); return { exact: wd }; }
  }
};

/* ══════════ 검사기 (사본에도 쓸 수 있게 L 을 받는다 — R 역검증) ══════════ */
function errAnswers(LX) { const er = []; let n = 0;
  KEYS.forEach(k => { const sl = LX[k].slides;
    sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { const d = s.data, at = k + ' ' + s.id; n++;
      let exp; try { exp = fx(EXP.basic[k][i])(d); } catch (e) { er.push(at + ' 풀이기 ' + e.message); return; }
      const cor = d.options.filter(o => o.correct).map(o => clean(o.text));
      if (Array.isArray(exp)) { if (!d.multi || !SAME(cor.slice().sort(), exp.slice().sort())) er.push(at + ' 모두 고르기 ' + cor.join('/') + ' ≠ ' + exp.join('/')); if (d.note.indexOf('**' + exp.length + '개**') < 0) er.push(at + ' 개수 풀이'); if (!/모두 고르세요\.$/.test(d.question)) er.push(at + ' 모두 고르기 물음 꼴'); if (exp.length >= d.options.length) er.push(at + ' 오답 보기 없음'); }
      else { if (d.multi || cor.length !== 1 || cor[0] !== clean(exp)) er.push(at + ' 정답 「' + cor.join('/') + '」 ≠ 셈 「' + exp + '」'); if (!new RegExp('\\*\\*' + String(exp).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*$').test(d.note)) er.push(at + ' 풀이 끝 ≠ 정답'); }
      if (new Set(optsT(d)).size !== d.options.length) er.push(at + ' 같은 보기 둘'); });
    const lv = sl[11].data.levels; if (!(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true)) er.push(k + ' 수준 셋·심화 open');
    ['기본', '도전'].forEach((t, i) => { n++; let exp; try { exp = fx(EXP.lev[k][i])(lv[t].q); } catch (e) { er.push(k + ' ' + t + ' 풀이기 ' + e.message); return; }
      if (exp == null || clean(lv[t].a) !== clean(exp)) er.push(k + ' ' + t + ' 「' + lv[t].a + '」 ≠ 셈 「' + exp + '」'); if (!(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]) === nsp(lv[t].a))) er.push(k + ' ' + t + ' 풀이 끝'); });
    sl[15].data.items.forEach((x, i) => { n++; let exp; try { exp = fx(EXP.exit[k][i])(x.q); } catch (e) { er.push(k + ' 출구 ' + (i + 1) + ' 풀이기 ' + e.message); return; } if (exp == null || clean(x.a) !== clean(exp)) er.push(k + ' 출구 ' + (i + 1) + ' 「' + x.a + '」 ≠ 셈 「' + exp + '」'); });
    const ad = sl[14].data, ae = EXP.adv[k]; n++;
    if (ae === OPEN) { if (!/^풀이: 여러 답/.test(ad.note) || !/까닭|근거/.test(ad.note)) er.push(k + ' 열린 넓히기 꼴'); }
    else { let exp; try { exp = fx(ae)(ad); } catch (e) { er.push(k + ' 넓히기 풀이기 ' + e.message); return; } const first = ((ad.note.match(/\*\*([^*]+)\*\*/) || [])[1]) || '';
      if (typeof exp === 'string') exp = { stem: exp };
      if (exp.exact != null && clean(first).replace(/[.]$/, '') !== clean(exp.exact).replace(/[.]$/, '')) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 셈 「' + exp.exact + '」');
      if (exp.stem != null && !sameStem(first, exp.stem)) er.push(k + ' 넓히기 첫 굵은 글 「' + first + '」 ≠ 「' + exp.stem + '」');
      (exp.has || []).forEach(h => { if (first.indexOf(h) < 0) er.push(k + ' 넓히기 첫 굵은 글에 「' + h + '」 없음'); });
      (exp.inNote || []).forEach(h => { if (clean(ad.note).indexOf(h) < 0) er.push(k + ' 넓히기 풀이에 「' + h + '」 없음'); }); } });
  return { er, n }; }
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== PKEY) er.push('l01 from ' + rv.from + ' ≠ ' + PKEY); if (!SAME(rv.items.map(x => [x.q, x.a]), PEXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 4단원 마지막 차시 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
/* 차단 — l01 복습 칸(4단원 출구 글)은 그 단원 게이트가 지키므로 뺀다 */
const POS = /(^|[^가-힣])(명사|동사|형용사|품사|용언|어간|어미|활용형)/;
function errBan(LX) { const er = []; const X = clone(LX); X.u5_l01.slides[1].data.items = []; const all = JSON.stringify(X);
  ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」 ' + (all.match(new RegExp('.{0,12}' + b + '.{0,8}')) || [''])[0]); });
  const m = all.match(POS); if (m) er.push('품사 이름 「' + m[2] + '」 ' + all.slice(Math.max(0, m.index - 12), m.index + 12)); return er; }
/* 옛 덱(39차) 창작 장면 — 새 덱에 남으면 안 됨 */
const OLD_NAMES = ['어귀', '비탈', '바구니', '사물함', '빗자루', '접으니', '물통', '한녀름', '여닫이', '수만 개 가운데'];
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이');
    LX[k].slides.forEach(s => { if (s.block !== 'motivate' && s.data.kids) er.push(k + ' ' + s.id + ' 동기 장 밖 kids'); }); });
  const all = JSON.stringify(LX); OLD_NAMES.forEach(b => { if (all.indexOf(b) >= 0) er.push('옛 창작 장면 「' + b + '」'); });
  return er; }
/* 교과서 낱말 표 — 활동목록.md 차시 줄(교과서 쪽·활동·발문·예시)의 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u5_l01: ['체육 대회', '당일', '우천', '체육관', '일이 있는 바로 그날', '비가 오는 날씨', '낱말 알아맞히기', '음매', '소리나 동작', '전구', '밝다', '켜다', '행복', '사랑', '학습 계획', '국어사전'],
  u5_l02: ['멋있어', '의자', '돌아갔어', '교실', '착해', '앉았어', '축구공', '운동장', '친구', '뛰다', '차다', '마시다', '맛있다', '길다', '빠르다', '자전거', '학교', '던지다', '뜨겁다', '즐겁다', '울다', '칠판', '무섭다', '날개', '발톱', '깃털', '날다', '펼치다', '잡다', '가볍다', '날카롭다', '크다', '피하다', '젓가락', '반찬', '달리다', '시작!', '둥글다', '책상', '안경', '노랗다', '곱슬하다', '웃다', '말하다', '앉다', '자랑', '자랑스럽다', '사랑하다', '사랑스럽다', '가방', '치약', '떡볶이', '안경 쓴 사람', '양말을 신다', '장갑이 따뜻하다'],
  u5_l04: ['‘리’ 자로 끝나는 말', '가지', '가재', '가수', '가시', '준우가 까치를 본다', '높다', '높고', '높으면', '먹고', '먹으니', '먹으면', '먹어서', '맛있고', '맛있어서', '길이나 통로가 통하지 못하게 하다', '막고', '막으니', '막아서', '막으면', '저요!', '너희 모두를 실을 수는 없어', '기본형', '높아서', '낮다', '잡다', '매다', '짧다', '국어사전에서 낱말을 찾으려면 낱말의 기본형을 알아야 해요', '먹, 먹, 먹 자로 시작하는 말', '설레다', '설레서', '설레니', '설레면', '입어서', '입으니', '입으면', '날아서', '날다', '가을 하늘이 높고 맑으니'],
  u5_l06: ['든든하다', '설레다', '행복하다', '자랑스럽다', '신나다', '감동적이다', '괴롭다', '미안하다', '서럽다', '우울하다', '허전하다', '실망하다', '두근두근', '설레나 보다', '설렌다고 하는군요', '더 정확하게', '낱말을 먹는 아이', '마를레트 수니에르', '김나현', '기쁨', '슬픔', '분노', '두려움', '텅 빈', '모든 낱말이 나를 도와주는 걸', '안아 주고 싶', '웃다', '침대', '슬프다', '칠판', '울다', '흐르다', '초콜릿', '즐겁다', '같은 특징을 가진 것끼리 갈라놓는 것을 분류', '용기', '꿈', '추억', '취미', '먹는다'],
  u5_l08: ['보건', '사흘', '얼', '깃든', '도자기', '어른께 여쭈어', '학교', '교실', '가방', '하루', '첫 자음자', '모음자', '받침', '붙임 11', '글자의 짜임', '친구', '층간', '층수', '치통', '치하', '칙사', '친가', '친교', '건강을 온전하게 잘 지킴', '세 날', '정신의 줏대', '감정, 생각, 노력 따위가 어리거나 스미다', '기본형', '발음', '쓰이는 예', '표준어', '맞춤법', '나라', '가을', '사자', '소리', '자라', '장구', '강조', '갈래', '발사', '발레', '진영', '선우', '세희', '민호', '얼음', '먹었다', '너비', '시루', '겨레', '고요', '구기', '하교', '학문', '한과', '한파', '떡이나 쌀 따위를 찌는 데 쓰는 둥근 질그릇'],
  u5_l10: ['놀이 방법', '사전을 찾아봤어', '조립 설명서', '짐작', '박물관 안내서', '요리법', '아직도 미지의 세계는 남아 있다', '류재명', '호기심', '아메리카', '남극', '바닷속', '행성', '구석구석', '완벽한 세계 지도', '윤곽', '길잡이', '알알이', '미지', '새로운', '앞뒤 내용', '표면', '잘 모르거나 새로움', '아직 알지 못함', '겉 부분', '사물의 가장 바깥쪽', '정확하게', '땅속을 이루는 암석에 대한 지도', '해저 지도', '해류의 흐름을 나타낸 지도', '수온의 분포를 나타낸 지도', '지하자원', '우주 지도', '마음속 지도', '만들고 싶은', '쓰임새', '평가 자료 2'],
  u5_l12: ['이런 활동 어때요', '세 가지 단서', '낱말의 종류', '낱말의 뜻', '낱말이 쓰이는 문장', '학교', '학생을 가르치는 교육 기관', '나는 날마다', '뒤집어', '가위바위보', '먼저 알아맞힌', '나만의 국어사전', '책 모양', '종 모양', '고리로 묶은 책 모양', '병풍 모양', '낱말 보물 찾기', 'ㅅ이 들어가는 두 글자 낱말', '색깔을 나타내는 낱말', '낱말 분류 릴레이', '선택 1', '선택 2', '새 분류 기준', '승패', '미술 시간', '성취기준'],
  u5_l14: ['스스로 확인하기', '맛있다', '사과', '먹었다', '생활 속으로', '뉴스', '앞뒤 내용을 살펴', '솜이불', '솜니불', '담요', '담뇨', '맨입', '맨닙', '눈요기', '눈뇨기', '이, 야, 여, 요, 유', '마무리', '일의 끝맺음', '갈무리', '물건 따위를 잘 정리함', '과자', '영화', '완성', '돼지', '횃불', '괴물', '횡단보도', '우리는 거의 완벽한 세계 지도를 가지게 되었지요.', '큰절하는 방법', '입고', '짚고', '포개어', '한복', '올립니다', '다릅니다', '사계절 우리말 사전', '신소영', '봄뜻', '꽃샘잎샘', '소나기밥', '달마중', '한추위', '안다미로', '이드거니', '전화', '화분', '쇠고기', '왜가리']
};
/* 옛 보탬 표(TB, archive/neutral/gen_g3s2_korean_u5.js 408~441줄) 32장의 핵심 낱말 — 본류 장(그림 포함 · extras 아님)에 있어야 한다 */
const ABSORB = {
  u5_l01: [['생각 열기 · 체육 대회 안내문', ['체육 대회', '당일', '우천', '일이 있는 바로 그날', '비가 오는 날씨', '정확한 뜻', '호기심']], ['낱말 알아맞히기 놀이', ['카드에 낱말', '한곳에', '설명', '알아맞', '음매', '소리나 동작', '행복', '사랑']], ['소감 나누기 · 전구·밝다·켜다 · 학습 계획', ['전구', '밝다', '켜다', '답이 달랐던 까닭', '기준에 따라 낱말 분류하기', '국어사전 활용하기', '학습 계획']]],
  u5_l02: [['낱말 떠올리기 놀이 셋', ['멋있어', '의자', '돌아갔어', '교실', '착해', '앉았어', '……에 가면', '그리고 뭐 했어?', '……은/는 어때?', '시범']], ['낱말의 종류 설명과 문장 틀', ['무엇이 무엇이다', '무엇이 어찌하다', '무엇이 어떠하다', '운동장', '축구공', '자전거', '울다', '칠판', '무섭다', '자랑스럽다', '사랑하다']], ['사진·그림을 보고 낱말 나누기', ['날개', '발톱', '깃털', '펼치다', '날카롭다', '던지다', '피하다', '책상', '안경', '곱슬하다']], ['종류 말놀이 · 국어활동 외출 준비', ['“시작!”', '젓가락', '반찬', '달리다', '둥글다', '장갑이 따뜻하다', '○', '□', '△']]],
  u5_l04: [['노랫말 바꾸어 부르기', ['‘리’ 자로 끝나는 말', '가지, 가재, 가수, 가시', '먹, 먹, 먹 자로 시작하는 말']], ['바뀌는 부분 · 바뀌지 않는 부분', ['준우가 까치를 본다', '높으면', '먹으니', '먹어서', '맛있으니', '형태가 바뀌어요', '밑줄']], ['국어사전 만화 — 너희 모두를 실을 수는 없어', ['길이나 통로가 통하지 못하게 하다', '막고', '막으니', '막아서', '막으면', '저요!', '곤란해', '떠오르는 장면']], ['기본형 만들기 표 · 형태 바꾸기 말놀이', ['높아서', '‘-다’', '낮다', '잡다', '매다', '짧다', '설레다', '설레서', '하나, 둘, 셋', '날아서', '날다']]],
  u5_l06: [['경험 떠올리기 — 설렌다는 말', ['두근두근', '설레나 보다', '설렌다고 하는군요', '더 정확하게', '든든하다', '허전하다', '감정을 표현할 말이 없다면']], ['「낱말을 먹는 아이」 읽기와 내용 알기', ['마를레트 수니에르', '김나현', '기쁨', '슬픔', '분노', '두려움', '텅 빈', '모든 낱말이 나를 도와주는 걸', '안아 주고 싶', '먹는다']], ['기준에 따라 낱말 분류하기 — 기준이 바뀌면', ['웃다', '침대', '초콜릿', '흐르다', '괴롭다', '형태가 바뀌는 부분', '분류', '기준이 바뀌면']], ['자신과 관련짓기 — 이야기 한 장면', ['용기', '어느 날, 나는', '꿈', '추억', '취미', '국어활동']]],
  u5_l08: [['낱말의 뜻이 궁금했던 경험', ['보건', '사흘', '얼', '깃든', '도자기', '어른께 여쭈어', '인터넷']], ['싣는 차례 예상과 글자의 짜임', ['학교', '교실', '가방', '하루', '첫 자음자', '모음자', '받침', '붙임 11', '글자의 짜임', '겹받침']], ['‘친구’ 찾기 여섯 장면 · 활동지 짝', ['친구', '층', '칙', '친', '소리 내어', '나라', '장구', '강조', '갈래', '발레']], ['뜻 찾기 · 「국어활동」 74~75쪽', ['건강을 온전하게 잘 지킴', '세 날', '정신의 줏대', '깃들다', '기본형', '발음', '선우', '민호', '얼음', '시루']]],
  u5_l10: [['모르는 낱말을 만났던 경험', ['놀이 방법', '조립 설명서', '박물관 안내서', '요리법', '짐작']], ['「아직도 미지의 세계는 남아 있다」 — 표시하며 읽기', ['류재명', '호기심', '아메리카', '남극', '길잡이', '알알이', '밑줄', '멈추어 사전부터 찾지 말고']], ['낱말의 뜻 짐작하기 · 찾아보기', ['미지', '세상의 잘 모르는 곳을 구석구석', '새로운', '앞뒤 내용', '표면', '아직 알지 못함', '사물의 가장 바깥쪽', '문맥', '차례표']], ['내용 알기 · 세상과 잇기', ['구석구석을 탐험해', '암석', '해저 지도', '해류의 흐름', '수온의 분포', '만들고 싶은', '쓰임새', '평가 자료 2']]],
  u5_l12: [['세 가지 단서로 낱말 놀이', ['낱말의 종류', '낱말의 뜻', '낱말이 쓰이는 문장', '학생을 가르치는 교육 기관', '뒤집어', '가위바위보', '종이 색']], ['나만의 국어사전 만들기', ['뜻이 궁금한 낱말', '종류와 뜻', '싣는 차례', '그림', '책 모양', '종 모양', '고리로 묶은 책 모양', '병풍 모양', '미술 시간']], ['우리 반 활동 — 낱말 보물 찾기', ['낱말 보물 찾기', 'ㅅ이 들어가는 두 글자 낱말', '이름에 있는 글자', '색깔을 나타내는 낱말', '뜻을 잘 모르는 낱말']], ['우리 반 활동 — 낱말 분류 릴레이', ['낱말 분류 릴레이', '선택 1', '선택 2', '앞선 분류 기준', '새 분류 기준', '승패', '추리']]],
  u5_l14: [['스스로 확인하기 · 생활 속으로', ['맛있다', '사과', '먹었다', '성질이나 상태', '생활 속으로', '뉴스', '앞뒤 내용을 살펴']], ['기초 다지기 — ‘ㄴ’ 소리 · 우리말', ['솜이불', '[솜니불]', '담요', '맨입', '눈요기', '마무리', '갈무리', '일의 끝맺음', '물건 따위를 잘 정리함', '안다미로']], ['글씨 쓰기 — ㅘ·ㅙ·ㅚ', ['과자', '영화', '완성', '돼지', '횃불', '괴물', '횡단보도', '완벽한 세계 지도']], ['평가 자료 1 — 「큰절하는 방법」', ['큰절하는 방법', '입고', '짚고', '포개어', '짚다', '포개다', '한복', '올립니다', '다릅니다']], ['스스로 읽기 「사계절 우리말 사전」', ['사계절 우리말 사전', '신소영', '봄뜻', '꽃샘잎샘', '소나기밥', '달마중', '땅거미', '한추위', '리듬']]]
};
const OLD_FILES = { u5_l01: 'g3_kor_u5_l01.html', u5_l02: 'g3_kor_u5_l02_03.html', u5_l04: 'g3_kor_u5_l04_05.html', u5_l06: 'g3_kor_u5_l06_07.html', u5_l08: 'g3_kor_u5_l08_09.html', u5_l10: 'g3_kor_u5_l10_11.html', u5_l12: 'g3_kor_u5_l12_13.html', u5_l14: 'g3_kor_u5_l14.html' };
/* 지도서 차시 이름 · 쪽 · 학습 목표 · 성취기준 */
const TITLE = { u5_l01: '배울 내용 살펴보기', u5_l02: '낱말의 종류 알기', u5_l04: '형태가 바뀌는 낱말 알기', u5_l06: '기준에 따라 낱말 분류하기', u5_l08: '국어사전에서 낱말을 찾는 방법 알기', u5_l10: '국어사전을 활용하며 글 읽기', u5_l12: '배운 내용 실천하기', u5_l14: '마무리하기' };
const PAGES = { u5_l01: '302~303', u5_l02: '304~309', u5_l04: '310~313', u5_l06: '314~317', u5_l08: '318~321', u5_l10: '322~325', u5_l12: '326~329', u5_l14: '330~335' };
const GOAL = { u5_l01: '배울 내용을 살펴볼 수 있다.', u5_l02: '낱말의 종류를 안다.', u5_l04: '형태가 바뀌는 낱말을 안다.', u5_l06: '기준에 따라 낱말을 분류할 수 있다.', u5_l08: '국어사전에서 낱말을 찾는 방법을 안다.', u5_l10: '국어사전을 활용하며 글을 읽을 수 있다.', u5_l12: '배운 내용을 실천할 수 있다.', u5_l14: '배운 내용을 마무리할 수 있다.' };
const STDT = { '04-02': '단어를 분류하고 국어사전을 활용하여 능동적인 국어 활동을 한다.', '02-03': '질문을 활용하여 글을 예측하며 읽고 자신의 읽기 과정을 점검한다.', '02-06': '바람직한 읽기 습관을 형성하고 읽기에 대한 자신감을 기른다.' };
const A3 = ['04-02', '02-03', '02-06'];
const STDC = { u5_l01: A3, u5_l02: ['04-02'], u5_l04: ['04-02'], u5_l06: ['04-02'], u5_l08: ['04-02'], u5_l10: A3, u5_l12: ['04-02'], u5_l14: A3 };

/* 4단원 마지막 차시 — 파일에서 마지막 키까지 동적으로 읽음(4단원을 다시 지어도 따라감) */
const P4 = load(path.join(TDIR, 'data/g3s2_korean_u4.js'));
const P4K = Object.keys(P4).filter(k => /^u4_l\d\d$/.test(k)).sort().pop();
const PKEY = 'g3s2_korean:' + P4K;
const PEXIT = P4[P4K].slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));

function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 낱말 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  Object.keys(ABSORB).forEach(k => { const main = nsp(JSON.stringify(LX[k].slides.map(s => s.data))); ABSORB[k].forEach(([title, words]) => { n++; words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(k + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }

/* ── 차례 사슬 ── */
const inOrder = (txt, kws) => { let p = -1; return kws.every(kw => { const q = txt.indexOf(kw, p + 1); if (q < 0) return false; p = q; return true; }); };
const figLines = (f) => (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).join(' | ');
const itemsTxt = (f) => (f.items || []).map(x => (x.name || '') + ' ' + (x.kind || '')).join(' | ');
function errOrder(LX) { const er = [];
  const g1 = LX.u5_l01.slides[4].data.fig; if (!(g1.k === 'chain' && g1.items.length === 4 && inOrder(itemsTxt(g1), ['카드에 낱말', '모으기', '설명', '알아맞히기']))) er.push('l01 놀이 네 단계 ≠ 218쪽');
  const g2 = LX.u5_l02.slides[6].data.fig; if (!(g2.k === 'chain' && inOrder(itemsTxt(g2), ['종류', '“시작!”', '차례대로']))) er.push('l02 말놀이 세 단계 ≠ 225쪽');
  const g4 = LX.u5_l04.slides[6].data.fig; if (!(g4.k === 'chain' && inOrder(itemsTxt(g4), ['나누기', '‘-다’', '기본형']))) er.push('l04 기본형 만들기 ① 나누기 → ② ‘-다’ ≠ 229쪽');
  if (!inOrder(figLines(LX.u5_l06.slides[4].data.fig) + figLines(LX.u5_l06.slides[5].data.fig), ['기쁨', '사랑', '분노', '텅 빈', '모두 먹어', '도와주는'])) er.push('l06 「낱말을 먹는 아이」 사건 차례');
  const g8 = LX.u5_l08.slides[6].data.fig; if (!(g8.k === 'chain' && inOrder(itemsTxt(g8), ['층', '치', '칙', '친', '구']))) er.push('l08 ‘친구’ 찾기 차례 ≠ 240쪽');
  if (!inOrder(figLines(LX.u5_l10.slides[4].data.fig), ['호기심', '아메리카', '구석구석', '윤곽'])) er.push('l10 「아직도 미지의」 차례');
  const s12 = LX.u5_l12.slides[4].data.fig; if (!(s12.k === 'chain' && SAME(s12.items.map(x => x.name), STEPS248))) er.push('l12 단서 놀이 차례 ≠ 248쪽');
  const d12 = LX.u5_l12.slides[5].data.fig; if (!(d12.k === 'chain' && d12.items.length === 4 && d12.items.every((x, i) => x.name.indexOf(MYDICT249[i]) >= 0))) er.push('l12 나만의 국어사전 네 단계 ≠ 249쪽');
  return er; }

/* ── 그림 ── */
const PARTS_USED = ['text', 'mood', 'sort2', 'sound', 'note', 'link', 'tools', 'chain'];
const cellName = (c) => (typeof c === 'string' ? c : (c && c.name) || '');
function errFigs(LX) { const er = []; let nF = 0;
  KEYS.forEach(k => LX[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; nF++; const at = k + ' ' + s.id + ' ' + f.k;
    if (f.k === 'panels' ? !(f.items || []).length || f.items.some(it => !it.fig || PARTS_USED.indexOf(it.fig.k) < 0) : PARTS_USED.indexOf(f.k) < 0) er.push(at + ' 모르는 부품');
    let h = ''; try { h = FIG.render(f); } catch (e) { er.push(at + ' 렌더 예외 ' + e.message); return; } if (!h || /NaN|undefined|\[object/.test(h)) er.push(at + ' 렌더');
    if (s.block === 'basic_problem') { const d = s.data; const tx = nsp(docOf(h).body.textContent); const cs = d.options.filter(o => o.correct).map(o => clean(o.text));
      cs.forEach(a => { if (nsp(d.question).indexOf(nsp(a)) >= 0) return; if (tx.indexOf(nsp(a)) >= 0) er.push(at + ' 문제 그림에 정답 「' + a + '」'); const bd = nsp(d.scenario.body); if (bd.indexOf(nsp(a)) >= 0 && !optsT(d).every(o => bd.indexOf(nsp(o)) >= 0)) er.push(at + ' 문제 장면 글에 정답 「' + a + '」'); }); /* 장면 글이 보기 전부를 늘어놓은 것(교과서 보기·친구들 말)이면 정답 노출 아님 */
      if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 3) er.push(at + ' 문제 그림 카드 ' + f.items.length + '장(넘침)');
      if (f.k === 'text' || f.k === 'letter' || f.k === 'sort2') er.push(at + ' 기본 문제의 글 상자·두 갈래 통은 panels 로 감싸기(넘침)'); }
    if (s.block === 'concept') { if ((f.k === 'tools' || f.k === 'chain') && f.items.length > 4) er.push(at + ' 개념 카드 ' + f.items.length); if (f.k === 'text' && f.lines.length > 5) er.push(at + ' 글 판 ' + f.lines.length + '줄'); if (f.k === 'link' && f.rows.length > 5) er.push(at + ' 이음 표 ' + f.rows.length + '줄'); } }));
  /* 소단원 차시 이름 = 지도서 300쪽 차시 표 */
  const un = LX.u5_l01.slides[6].data.fig; if (!(un.k === 'sort2' && SAME(un.a.items, ['u5_l02', 'u5_l04', 'u5_l06'].map(k => TITLE[k])) && SAME(un.b.items, ['u5_l08', 'u5_l10'].map(k => TITLE[k])) && un.a.name.indexOf(S.unitParts[0]) >= 0 && un.b.name.indexOf(S.unitParts[1]) >= 0)) er.push('l01 소단원 차시 이름 ≠ 지도서 300쪽 차시 표');
  /* 놀이 셋 빈칸 = 221쪽 예시 답안 · 낱말 종류 표(문장 틀 · 새 사진·운동장 그림) */
  const p0 = LX.u5_l02.slides[3].data.fig; [['학교에 가면'], ['의자에', '교실로'], ['내 친구는', '자동차는']].forEach((slots, i) => { const want = slots.reduce((a, x) => a.concat(PLAY221[x]), []).join(' · '); if (!p0.rows[i] || cellName(p0.rows[i][1]) !== want) er.push('l02 놀이 빈칸 ' + (i + 1) + ' ≠ ' + want); });
  [[LX.u5_l02.slides[4].data.fig, 'l02 문장 틀'], [LX.u5_l02.slides[5].data.fig, 'l02 새·운동장'], [LX.u5_l06.slides[6].data.fig, 'l06 분류표']].forEach(([f, nm]) => (f.rows || []).forEach(r => { const a = cellName(r[0]), b = cellName(r[1]); const kn = Object.keys(K3).find(x => a === K3[x] || b === K3[x]); if (!kn) return; const ws = (a === K3[kn] ? b : a.split(' — ').pop()).split(/ · | \/ /).map(x => x.replace(/\*\*/g, '').trim()).filter(Boolean);
    ws.forEach(x => { if (KIND[x] !== kn) er.push(nm + ' 「' + x + '」 ≠ ' + K3[kn]); }); }));
  /* 기본형 표 — 바뀌지 않는 부분 = 자모 공통 앞부분 */
  LX.u5_l04.slides[3].data.fig.rows.forEach(r => { const forms = cellName(r[0]).split(' · ').map(x => x.split(' ').pop()); const st = lcpStem(forms); if (cellName(r[1]).indexOf(st + ' + ') !== 0) er.push('l04 226쪽 표 「' + cellName(r[1]) + '」 ≠ ' + st); });
  LX.u5_l04.slides[4].data.fig.rows.forEach(r => { const forms = cellName(r[0]).split(' · '); const st = lcpStem(forms); const want = st + ' + ' + forms.map(x => restOf(x, st)).join(' · '); if (cellName(r[1]) !== want) er.push('l04 227쪽 표 「' + cellName(r[1]) + '」 ≠ ' + want); });
  const bf = LX.u5_l04.slides[6].data.fig, hi = ['높아서', '높고', '높으니', '높으면'], hs = lcpStem(hi); if (!(bf.items[0].kind === hs + ' | ' + hi.map(x => restOf(x, hs)).join(' · ') && bf.items[2].kind === hs + '다')) er.push('l04 기본형 만들기 ≠ ' + hs + '다');
  /* 글자의 짜임 · 사전 차례 · 친구 찾기 */
  LX.u5_l08.slides[4].data.fig.rows.forEach(r => { const j = jamo(cellName(r[0])); const want = [j.cho, j.jung, j.jong || '받침 없음'].join(' · '); if (cellName(r[1]) !== want) er.push('l08 글자의 짜임 「' + cellName(r[0]) + '」 ≠ ' + want); });
  const od = LX.u5_l08.slides[5].data.fig; if (!SAME(od.items.map(x => x.name), dictSort(od.items.map(x => x.name)))) er.push('l08 차례 카드 ≠ 자모 차례'); od.items.forEach(x => { const j = jamo(x.name[0]); if (x.kind.indexOf(j.cho + ' · ' + j.jung) !== 0) er.push('l08 차례 카드 「' + x.name + '」 짜임'); });
  const fd = LX.u5_l08.slides[6].data.fig, c0 = jamo('친'), c1 = jamo('구'); const ft = itemsTxt(fd);
  if (!(fd.items[0].name.indexOf(c0.cho) >= 0 && fd.items[0].kind.indexOf(cmpWord('층', '친') < 0 ? '뒤로' : '앞으로') >= 0 && fd.items[1].name.indexOf(c0.jung) >= 0 && fd.items[1].kind.indexOf('받침 ' + c0.jong) >= 0 && cmpWord('칙', '친') < 0 && fd.items[3].kind.indexOf(c1.cho) >= 0 && fd.items[3].kind.indexOf(c1.jung) >= 0 && ft.indexOf('친가') >= 0)) er.push('l08 ‘친구’ 찾기 낱자 ≠ 자모 셈');
  /* 뜻 표 · 단서 카드 · 사다리 · ‘ㄴ’ 소리 · ㅘ·ㅙ·ㅚ */
  LX.u5_l10.slides[6].data.fig.rows.forEach(r => { const [wd, g] = cellName(r[0]).split(' — '); if (DEF[wd] !== cellName(r[1]) || GUESS246[wd] !== g) er.push('l10 뜻 표 「' + wd + '」 ≠ 246쪽'); });
  const cl = LX.u5_l12.slides[3].data.fig; if (!(cl.rows.length === 3 && ['종류', '뜻', '문장'].every((k, i) => cellName(cl.rows[i][0]).indexOf(CLUENAME[k]) >= 0 && cellName(cl.rows[i][1]) === CLUE248[k]) && CLUE248.종류 === kindName(CLUE248.word))) er.push('l12 단서 카드 ≠ 248쪽(종류 = 학교의 종류)');
  LX.u5_l14.slides[3].data.fig.rows.forEach(r => { const wd = cellName(r[0]).split(' ').pop(); if (cellName(r[1]) !== kindName(wd).replace(/낱말$/, '말')) er.push('l14 사다리 「' + wd + '」'); });
  const so = LX.u5_l14.slides[4].data.fig; if (!(so.k === 'sound' && so.items.length >= 2 && so.items.every(it => it.s === pron(it.w) && PRON252[it.w] === it.s))) er.push('l14 ‘ㄴ’ 소리 ≠ 자모 셈 · 252쪽');
  LX.u5_l14.slides[5].data.fig.rows.forEach(r => { const m = cellName(r[0]).match(/\*\*(.+?)\*\*/); if (!m || DEF[m[1]] !== cellName(r[1])) er.push('l14 우리말 뜻 「' + (m && m[1]) + '」'); });
  const wr = LX.u5_l14.slides[6].data.fig; wr.items.forEach(it => { const ws = it.kind.split(' · '); if (!ws.every(x => sylls(x).some(c => jamo(c).jung === it.name)) || !ws.every(x => WRITE253[it.name].indexOf(x) >= 0)) er.push('l14 글씨 「' + it.name + '」'); });
  return { er, nF }; }

/* ── 제재(작품) — 제목·지은이 · 쪽 안내 · 인용 줄 ── */
const WORKS = [
  { t: '낱말을 먹는 아이', a: '마를레트 수니에르', page: '「국어」 교과서 231', cap: 4 }, { t: '아직도 미지의 세계는 남아 있다', a: '류재명', page: '「국어」 교과서 242', cap: 4 },
  { t: '사계절 우리말 사전', a: '신소영', page: '「국어활동」 76', cap: 0 }, { t: '큰절하는 방법', cap: 0 }];
function quotedOf(LX, t) { const set = new Set(); KEYS.forEach(k => LX[k].slides.forEach(s => { const figs = []; const f0 = s.data.fig; if (!f0) return; if (f0.k === 'panels') f0.items.forEach(it => figs.push(it.fig)); else figs.push(f0);
  figs.forEach(f => { if (f.k !== 'text' || String(f.title || '').indexOf('「' + t + '」') < 0) return; (f.lines || []).map(l => (typeof l === 'string' ? l : l.t)).filter(l => !/^\[간추림\]|^→/.test(l)).forEach(l => l.split(' / ').forEach(x => set.add(x.trim()))); }); })); return set; }
function errWorks(LX) { const er = []; const all = JSON.stringify(LX);
  WORKS.forEach(wk => { if (all.indexOf('「' + wk.t + '」') < 0) er.push('「' + wk.t + '」 제목 없음');
    if (wk.a) { const re = new RegExp('「' + wk.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '」[^「」]{0,6}' + wk.a.split(' ')[0]); if (!re.test(all)) er.push('「' + wk.t + '」 지은이 ' + wk.a + ' 함께 없음'); }
    if (wk.page && all.indexOf(wk.page) < 0) er.push('「' + wk.t + '」 쪽 안내 ' + wk.page + ' 없음');
    const q = quotedOf(LX, wk.t); if (q.size > wk.cap) er.push('「' + wk.t + '」 인용 줄 ' + q.size + ' > ' + wk.cap); });
  return er; }

/* ── 선행 ── */
const FIRST = [['움직임을 나타내는 낱말', 'u5_l02'], ['무엇이 어떠하다', 'u5_l02'], ['기본형', 'u5_l04'], ['바뀌지 않는 부분', 'u5_l04'], ['낱말을 먹는 아이', 'u5_l06'], ['같은 특징을 가진 것끼리', 'u5_l06'],
  ['첫 자음자', 'u5_l08'], ['차례표', 'u5_l08'], ['미지', 'u5_l10'], ['뜻을 짐작', 'u5_l10'], ['단서 카드', 'u5_l12'], ['나만의 국어사전', 'u5_l12'], ['솜이불', 'u5_l14'], ['갈무리', 'u5_l14']];
const teach = (LX, k) => JSON.stringify(LX[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => s.data)).replace(/"다음(?: 단원)?: [^"]*"/g, '') + JSON.stringify(LX[k].extras.filter(e => e.type !== 'checklist'));
function errFirst(LX) { const er = []; FIRST.forEach(([t, at]) => { const ai = KEYS.indexOf(at); KEYS.forEach((k, i) => { if (!i) return; const has = teach(LX, k).indexOf(t) >= 0; if (i < ai && has) er.push(k + ' 선행 「' + t + '」(처음은 ' + at + ')'); if (i === ai && !has) er.push(at + ' 에 「' + t + '」 없음'); }); }); return er; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드·meta ═══');
T('8차시 키(지도서 묶음 첫 번호 1·2·4·6·8·10·12·14) · 파일 data/g3s2_korean_u5.js', () => ok(SAME(Object.keys(L), KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 국어 · 5단원 · n·covers·분 = 지도서 차시 · 성취기준 문구(지도서 299쪽) · 학습 목표 · 지도서 쪽 · src_key · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k];
  ok(m.grade === 3 && m.term === 2 && m.unit === 5 && m.subject === '국어' && m.unit_title === UT && m.n === a && m.n === +k.slice(-2), k);
  ok(m.duration_min === 40 * (b - a + 1), k + ' 분'); ok(m.covers === (a === b ? a + '차시' : a + '~' + b + '차시'), k + ' covers ' + m.covers);
  ok(m.std === STDC[k].map(c => '[4국' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.goal === GOAL[k], k + ' 학습 목표');
  ok(m.source.indexOf('지도서 5단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade3/semester2/korean/5단원_사전으로여는세상/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 낱말 탐험대', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 + 차시 표기 · 묶음 제목에 「a~b차시」 · 합계 560분', () => { KEYS.forEach(k => { const m = L[k].meta, [a, b] = COV[k]; ok(m.title.indexOf(TITLE[k]) === 0, k + ' ' + m.title); if (a !== b) ok(m.title.indexOf(a + '~' + b + '차시') >= 0, k + ' 묶음 표기'); }); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 560, '분'); });
T('[4국04-02] = 모든 차시(평가 자료 1·2) · [4국02-03]·[4국02-06] = 1·10~11(통합 학습 읽기)·14차시', () => { const has = (c) => KEYS.filter(k => L[k].meta.std.indexOf('[4국' + c + ']') >= 0).join(); ok(has('04-02') === KEYS.join(), has('04-02')); ok(has('02-03') === 'u5_l01,u5_l10,u5_l14' && has('02-06') === has('02-03'), has('02-03')); });
T('slug — KT2.slugOf({g:3,s:korean,t:2}) = g3s2_korean · 3학년 = tier-mid', () => { ok(KT2.slugOf({ g: 3, s: 'korean', t: '2' }) === 'g3s2_korean', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록(text·mood·sort2·sound·note·link·tools·chain·panels)', () => PARTS_USED.concat('panels').forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 152장 (8 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 152, '장 수'));

console.log('═══ C. 7요소 (3학년 = 곰이·펭이 말풍선 + 장면) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length === 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/korean\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 8종 서로 다름 · 3-2 국어 다른 단원(1~4·6단원)과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 8, im.join(',')); let other = []; [1, 2, 3, 4, 6].forEach(u => { const f = path.join(TDIR, 'data/g3s2_korean_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => ((l.slides || [])[2] || {}).data).filter(Boolean).map(d => d.img).filter(Boolean)); }); ok(other.length > 20 && !im.some(x => other.indexOf(x) >= 0), '겹침 · 다른 단원 ' + other.length); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });
T('교실 활동 장 글 길이(넘침 미리 피하기) — goal ≤ 45자 · steps 4개 각 ≤ 45자 · solo 2~3개 각 ≤ 40자 · 활동 분 = 발문 분', () => KEYS.forEach(k => { const d = L[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); d.steps.forEach(s => ok(s.length <= 45, k + ' step ' + s.length + ' ' + s)); ok(d.solo.length >= 2 && d.solo.length <= 3, k + ' solo 수'); d.solo.forEach(s => ok(s.length <= 40, k + ' solo ' + s.length + ' ' + s)); ok(d.minutes === d.tnote.min, k + ' 활동 분'); }));

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 4단원 마지막 차시(' + PKEY + ') 출구 — 파일에서 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 6단원 감상과 표현의 즐거움 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u5_l14.slides[18].data; ok(nx.title === '다음 단원엔' && /감상과 표현의 즐거움/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 풀기 (지도서 사전·표 + 자모 셈) ═══');
const EA = errAnswers(L);
T('기본 24 · 수준별 기본·도전 16 · 출구 24 · 넓히기 8 = 게이트가 다시 푼 정답', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 푼 정답 = 72', () => ok(EA.n === 72, EA.n));
T('자모 사전 차례 자체 확인 — 239쪽 가방→교실→하루→학교 · 활동지 짝 다섯 답 · 국어활동 75쪽 ㉮㉯㉰ 번호 · 240쪽 장면 낱말 · ㅡ가 ㅣ보다 앞(층 → 친)', () => {
  ok(SAME(dictSort(['학교', '교실', '가방', '하루']), ORDER239), '239쪽 ' + dictSort(['학교', '교실', '가방', '하루']));
  PAIRS321.forEach(([a, b, ans]) => ok(dictSort([a, b])[0] === ans, '활동지 ' + a + '/' + b));
  Object.keys(KH75).forEach(g => { const ws = KH75[g].map(x => x[0]); const so = dictSort(ws); KH75[g].forEach(([x, n]) => ok(so.indexOf(x) + 1 === n, '국어활동 75쪽 ' + g + ' ' + x + ' ' + n)); });
  ok(SAME(dictSort(SCENE240.slice().reverse()), SCENE240), '240쪽 장면'); ok(cmpWord('층', '친') < 0 && cmpWord('칙', '친') < 0 && cmpWord('자', '장') < 0, 'ㅡ<ㅣ · 받침 없음 먼저'); });
T('자모 셈 자체 확인 — 기본형(본다·보고·보면 → 보 · 매고·매서 → 매 · 포개어 → 포개다) · ‘ㄴ’ 소리 넷 = 252쪽 · 조사 은/는 · ㅅ 두 글자 · 국어활동 74쪽 참거짓(진영○ 선우✕ 세희○ 민호✕)', () => {
  ok(lcpStem(['본다', '보고', '보면']) === '보' && lcpStem(['매고', '매서', '매니', '매면']) === '매' && lcpStem(['먹고', '먹으니', '먹으면', '먹어서']) === '먹' && lcpStem(['맛있고', '맛있어서']) === '맛있', 'lcp');
  ok(baseOf('포개어') === '포개다' && baseOf('날아서') === '날다' && baseOf('먹었다') === '먹다' && baseOf('맑으니') === '맑다' && baseOf('짚고') === '짚다' && baseOf('설레서') === '설레다', '기본형');
  Object.keys(PRON252).forEach(x => ok(pron(x) === PRON252[x], 'ㄴ 소리 ' + x + ' ' + pron(x))); ok(pron('사과') === '[사과]' && pron('구기') === '[구기]', 'ㄴ 소리 없음');
  ok(josa('사랑', '은', '는') === '은' && josa('사랑하다', '은', '는') === '는' && hasJ('사과', 'ㅅ') && !hasJ('하늘', 'ㅅ'), '조사·ㅅ');
  ok(CLAIM74.진영.truth() === true && CLAIM74.선우.truth() === false && CLAIM74.세희.truth() === true && CLAIM74.민호.truth() === false, '국어활동 74쪽 = 예시 답안 「선우, 민호」'); });
T('풀이기 자체 확인 — 뜻 역찾기 · 틀린 뜻 · 표에 없는 낱말 · 틀린 차례 잡음', () => { ok(WORD('「세 날」이라는 뜻의 낱말은 무엇일까요?') === '사흘' && DEFQ('‘얼’의 뜻은 무엇일까요?') === '정신의 줏대', '역찾기');
  let c = 0; try { WORD('「아주 빠르게」라는 뜻의 낱말은 무엇일까요?'); } catch (e) { c++; } try { kindName('비행기'); } catch (e) { c++; } try { baseOf('나무'); } catch (e) { c++; } ok(c === 3, '안 걸리는 것 못 잡음'); ok(dictSort(['학교', '가방'])[0] === '가방', '차례'); });
T('모두 고르기 ≥ 3 · 낱말 뜻 물음 ≥ 5 · 종류 물음 ≥ 4 · 기본형 물음 ≥ 5 · 사전 차례 물음 ≥ 4(사전과 셈이 실제로 쓰임)', () => { let ms = 0, wq = 0, kq = 0, bq = 0, oq = 0; const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => { if (s.data.multi) ms++; qs.push(s.data.question); }); const lv = sl[11].data.levels; qs.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => qs.push(x.q)); });
  qs.forEach(q => { if (/라는 뜻의 낱말|의 뜻은/.test(q)) wq++; if (/어떤 종류의 낱말|어느 칸|‘낱말의 종류’ 칸/.test(q)) kq++; if (/기본형|바뀌지 않는 부분|찾아야 하는 낱말/.test(q)) bq++; if (/국어사전에 (나오는|먼저|가장 먼저)|맨 처음에 올/.test(q)) oq++; }); ok(ms >= 3 && wq >= 5 && kq >= 4 && bq >= 5 && oq >= 4, [ms, wq, kq, bq, oq].join('/')); });

console.log('═══ F. 차례 사슬 ═══');
T('놀이 네 단계(218쪽) · 말놀이 세 단계(225쪽) · 기본형 두 단계(229쪽) · 「낱말을 먹는 아이」 사건 차례 · ‘친구’ 찾기 차례(240쪽) · 「아직도 미지의」 차례 · 단서 놀이(248쪽) · 나만의 국어사전(249쪽)', () => { const e = errOrder(L); ok(!e.length, e.join(' | ')); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nF + '개 — 쓰는 부품만 · 렌더 · 소단원 차시 이름 · 놀이 빈칸 · 낱말 종류 표 · 기본형 표 · 글자의 짜임 · 사전 차례 · 친구 찾기 · 뜻 표 · 단서 카드 · 사다리 · ‘ㄴ’ 소리 · ㅘ·ㅙ·ㅚ · 문제 그림·장면 글 정답 숨김 · 문제 카드 ≤ 3', () => ok(!EF.er.length, EF.er.slice(0, 6).join(' | ')));
T('개념 32장 · 기본 문제 24장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 32 && p === 24, c + '/' + p); });
T('개념 글 3줄 이하(큰 그림 · 넘침 미리 피하기)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.content.split('\n').length <= 3, k + ' ' + s.id + ' ' + s.data.content.split('\n').length + '줄'))));
T('그림 검사기 자체 확인 — 문제 그림 속 정답 · 넘치는 카드 · 모르는 부품 · 기본 문제 글 상자 잡음', () => { const X = clone(L); X.u5_l10.slides[10].data.fig = { k: 'tools', items: [{ name: '땅속을 이루는 암석에 대한 지도' }] }; X.u5_l01.slides[9].data.fig = { k: 'tools', items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }] }; X.u5_l12.slides[9].data.fig = { k: 'zzz' }; X.u5_l04.slides[9].data.fig = X.u5_l04.slides[9].data.fig.items[0].fig;
  const e = errFigs(X).er.join(' | '); ok(/정답 「땅속을/.test(e) && /카드 4장/.test(e) && /모르는 부품/.test(e) && /panels 로 감싸기/.test(e), e.slice(0, 240)); });

console.log('═══ H. 재료 충실 · 교과서 낱말 · 보탬 흡수 ═══');
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(clean(lines(src.slides[i].text)) === clean(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.options.map(o => o.text), p.opts), s.id + ' 보기'); const ci = Array.isArray(p.ci) ? p.ci : [p.ci]; ok(SAME(d.options.map((o, j) => !!o.correct), p.opts.map((_, j) => ci.indexOf(j) >= 0)), s.id + ' 정답 표시'); });
  const nx = L[k].slides[18].data; if (k !== 'u5_l14') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 낱말 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음(활동목록.md)', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 낱말 표 자체 확인 — 다른 차시 낱말은 없음(l02 에 「솜이불」 · l04 에 「류재명」 없음)', () => { ok(nsp(JSON.stringify(L.u5_l02)).indexOf('솜이불') < 0, 'l02'); ok(nsp(JSON.stringify(L.u5_l04)).indexOf('류재명') < 0, 'l04'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말이 본류 장(그림 포함 · extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 32, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
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
T('지도서 유의점이 교사 층에 — 호기심·답이 달랐던 까닭·눈에 보이지 않는 낱말(l01) · 직접 교수·시범·교사 보조·문법 용어(l02) · 규칙적으로·모든 형태를 실을 수 없는·떠오르는 장면·평가 자료 1(l04) · 통합 학습·제목·먹는다·기준이 바뀌면(l06) · 소리 내어·겹받침·필요·종이(l08) · 멈추어·짐작한 뜻·문맥·평가 자료 2(l10) · 승패·섞이지·성취기준·찾고자 하는 뜻(l12) · 용어·이름을 붙였을지·글자의 모양(l14)', () => { const tx = (k) => JSON.stringify(L[k]);
  [['u5_l01', [/호기심/, /답이 달랐던 까닭/, /눈에 보이지 않는 낱말/, /국어사전을 본 적/]], ['u5_l02', [/직접 교수 모형/, /시범/, /교사 보조/, /문법 용어/]], ['u5_l04', [/규칙적으로 바뀌는 낱말/, /모든 형태를 실을 수 없는/, /떠오르는 장면/, /평가 자료 1/]], ['u5_l06', [/통합 학습/, /제목을 보고/, /‘먹는다’/, /기준이 바뀌면/]],
   ['u5_l08', [/소리 내어 말하며/, /겹받침/, /자연스럽게 필요/, /종이/]], ['u5_l10', [/멈추어/, /짐작한 뜻과 국어사전의 뜻/, /문맥/, /평가 자료 2/]], ['u5_l12', [/승패에 연연/, /섞이/, /성취기준/, /찾고자 하는 뜻만/]], ['u5_l14', [/용어/, /이름을 붙였을지/, /글자의 모양/, /평가 자료 1/]]].forEach(([k, res]) => res.forEach(re => ok(re.test(tx(k)), k + ' ' + re))); });

console.log('═══ L. 선행 ═══');
const EFI = errFirst(L);
T('처음 배우는 차시 전에는 그 말 0 · 그 차시에는 있음 (l01 단원 도입 · 복습·다음 장 · 다음 시간 준비 카드 예외) — ' + FIRST.length + '말', () => ok(!EFI.length, EFI.join(' | ')));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 품사 이름 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0 · 품사 이름(명사·동사·형용사·품사·용언·어간·어미·활용형) 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('렌더된 그림 속 「결」·겹낫표 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) { const h = FIG.render(s.data.fig); ok(h.indexOf('결') < 0 && !/[『』]/.test(h), k + ' ' + s.id); } })));
T('교사 화면(렌더 글자)에 영어 코드(u5 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~F)만', () => { KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(/^[A-F]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1, k: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });
T('학생이 보는 칸(물음·보기·장면·수준별·출구·맥락·개념 글·정리·예고)에 「지도서」 0', () => { const bad = []; KEYS.forEach(k => L[k].slides.forEach(s => { const d = s.data; if (/지도서/.test(JSON.stringify([d.question, d.scenario, d.options, d.levels, d.block === 'exit_ticket' ? d.items : null, d.context, d.challenge, d.content, d.desc, d.wrong, d.right, d.points, d.preview]))) bad.push(k + ' ' + s.id); })); ok(!bad.length, bad.join(',')); });

console.log('═══ N. 제재 — 제목·지은이 · 쪽 안내 · 인용 줄 ═══');
T('작품 ' + WORKS.length + '편 — 제목 · 제목 곁에 지은이 · 교과서 쪽 안내 · 인용 줄 ≤ 4(그림 글 판 전부 · [간추림]·→ 빼고 · 「사계절 우리말 사전」은 낱말 이름만 = 0줄)', () => { const e = errWorks(L); ok(!e.length, e.join(' | ')); });
T('작품 글 판(「낱말을 먹는 아이」 ①② · 「아직도 미지의」)에는 [간추림] 줄과 「→ 「국어」 교과서 ○○쪽」 안내가 함께 있음', () => { [['u5_l06', 4], ['u5_l06', 5], ['u5_l10', 4]].forEach(([k, si]) => { const f = L[k].slides[si].data.fig; ok(f.k === 'text' && f.lines.some(l => /^\[간추림\]/.test(l)) && f.lines.some(l => /^→ 「국어」 교과서 \d+/.test(l)), k + ' ' + si); }); });
T('인용 셈 자체 확인 — 「낱말을 먹는 아이」 지금 4줄 · 한 줄 더하면 5', () => { ok(quotedOf(L, '낱말을 먹는 아이').size === 4, quotedOf(L, '낱말을 먹는 아이').size); const X = clone(L); X.u5_l06.slides[4].data.fig.lines.splice(1, 0, '어느 날, 나는 기쁨이라는 낱말을 먹었어.'); ok(quotedOf(X, '낱말을 먹는 아이').size === 5, '셈'); });

console.log('═══ O. 정답이 하나가 아님 ═══');
T('심화 = open · 답은 「여러 답 (예:」로 시작', () => KEYS.forEach(k => { const v = L[k].slides[11].data.levels.심화; ok(v.open === true && /^여러 답 \(예:/.test(v.a), k); }));
T('열린 장(오개념 바른 생각·넓히기·심화에 「사람마다/여러 답」 + 「까닭/근거」) ≥ 4차시 · l06 오개념 = 분류 기준이 바뀌면 나뉜 모습도 달라짐', () => { const n = KEYS.filter(k => { const sl = L[k].slides; return [sl[7].data.right, sl[14].data.note, sl[11].data.levels.심화.q + ' ' + sl[11].data.levels.심화.a].some(t => /사람마다|여러 답/.test(t) && /까닭|근거/.test(t)); }).length; ok(n >= 4, n);
  ok(/분류 기준\*\*이 바뀌면 나뉜 모습도 달라질 수 있어요/.test(L.u5_l06.slides[7].data.right), '오개념'); });
T('심화 예시 답 속 기본형도 자모 셈과 같음(l14 짚고 → 짚다 · 포개어 → 포개다)', () => { const a = L.u5_l14.slides[11].data.levels.심화.a; const pr = a.match(/(\S+) → (\S+)/g) || []; ok(pr.length >= 2, pr.length); pr.forEach(p => { const [f, b] = p.split(' → '); ok(baseOf(f) === b, p); }); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('사전 차례 정답 바꿈(l08 ① 가방→교실→하루→학교 → 가방→교실→학교→하루)', X => { const d = X.u5_l08.slides[8].data; d.options[0].correct = false; d.options[2].correct = true; }, X => errAnswers(X).er);
red('받침 차례 틀림(l08 ② 강조가 먼저)', X => { const d = X.u5_l08.slides[9].data; d.options[0].correct = false; d.options[1].correct = true; }, X => errAnswers(X).er);
red('국어활동 74쪽 참거짓 틀림(l08 ③ 세희도 잘못)', X => { X.u5_l08.slides[10].data.options[2].correct = true; }, X => errAnswers(X).er);
red('기본형 틀림(l04 출구 잡다 → 잡으다)', X => { X.u5_l04.slides[15].data.items[0].a = '잡으다'; }, X => errAnswers(X).er);
red('바뀌지 않는 부분 너무 길게(l04 출구 짧 → 짧으)', X => { X.u5_l04.slides[15].data.items[2].a = '짧으'; }, X => errAnswers(X).er);
red('낱말 종류 틀림(l02 ① 이름에 「뛰다」 표시)', X => { X.u5_l02.slides[8].data.options[2].correct = true; }, X => errAnswers(X).er);
red('‘ㄴ’ 소리 틀림(l14 도전 [눈뇨기] → [누뇨기])', X => { X.u5_l14.slides[11].data.levels.도전.a = '[누뇨기]'; }, X => errAnswers(X).er);
red('뜻풀이 바꿈(l10 출구 표면 → 겉 부분)', X => { X.u5_l10.slides[15].data.items[2].a = '겉 부분'; }, X => errAnswers(X).er);
red('조사까지 셈(l02 넓히기 「사랑은 이름」 → 「사랑는 이름」)', X => { X.u5_l02.slides[14].data.note = X.u5_l02.slides[14].data.note.replace('**사랑은 이름', '**사랑는 이름'); }, X => errAnswers(X).er);
red('친구 찾기 방향 거꾸로(l08 넓히기 뒤로 → 앞으로)', X => { X.u5_l08.slides[14].data.note = X.u5_l08.slides[14].data.note.replace('**뒤로**', '**앞으로**'); }, X => errAnswers(X).er);
red('복습 계보 끊음(l06 복습 한 줄 바꿈)', X => { X.u5_l06.slides[1].data.items[0].a = '기쁘다'; }, errReview);
red('l01 복습을 4단원 아닌 것으로', X => { X.u5_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l10 개념 「탐험의 성과가 알알이 박혀 있는 결과물」)', X => { X.u5_l10.slides[4].data.content += ' 탐험의 성과가 알알이 박혀 있는 결과물이에요.'; }, errBan);
red('품사 이름 넣음(l02 개념 「이름을 나타내는 낱말(명사)」)', X => { X.u5_l02.slides[4].data.content += ' 이름을 나타내는 낱말(명사)이에요.'; }, errBan);
red('보탬 카드 b_l5_1 되살림', X => { X.u5_l08.extras.push({ id: 'b_l5_1', type: 'other_activity', title: '교과서 활동', content: '친구 찾기' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지움(l14 사계절 우리말 사전)', X => { X.u5_l14.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/사계절 우리말 사전/g, '그림책')); }); }, X => errAbsorb(X).er);
red('교과서 낱말 지움(l08 칙사)', X => { X.u5_l08 = JSON.parse(JSON.stringify(X.u5_l08).replace(/칙사/g, '치사')); }, errTB);
red('인용 줄 넘침(「아직도 미지의」 원문 한 줄 더함)', X => { X.u5_l10.slides[4].data.fig.lines.splice(1, 0, '사람이 갈 수 없다고 생각한 남극의 존재도 알려졌습니다.'); }, errWorks);
red('지은이 지움(「낱말을 먹는 아이」 마를레트 수니에르)', X => { X.u5_l06 = JSON.parse(JSON.stringify(X.u5_l06).replace(/마를레트 수니에르/g, '')); }, errWorks);
red('단서 놀이 차례 바꿈(l12 가위바위보 ↔ 카드 뒤집어 놓기)', X => { const it = X.u5_l12.slides[4].data.fig.items; [it[0], it[1]] = [it[1], it[0]]; }, errOrder);
red('기본형 표 틀림(l04 「먹 + 고 · 으니」 → 「먹으 + …」)', X => { X.u5_l04.slides[4].data.fig.rows[0][1] = '먹으 + 고 · 니 · 면 · 어서'; }, X => errFigs(X).er);
red('사전 차례 카드 바꿈(l08 하루 ↔ 학교)', X => { const it = X.u5_l08.slides[5].data.fig.items; [it[2], it[3]] = [it[3], it[2]]; }, X => errFigs(X).er);
red('문제 장면 글에 정답 보임(l14 ① 「[담뇨]로 들려.」)', X => { X.u5_l14.slides[8].data.scenario.body += ' 「[담뇨]로 들려.」'; }, X => errFigs(X).er);
red('문제 그림에 정답 보임(l06 ① 카드에 「안아 주고 싶었다」)', X => { X.u5_l06.slides[8].data.fig.items[0].kind = '모든 사람을 안아 주고 싶었다'; }, X => errFigs(X).er);
red('인물 바꿈(l08 곰이 → 다올)', X => { X.u5_l08.slides[2].data.kids[0].label = '다올\n"어?"'; }, errPeople);
red('선행 말 앞당김(l02 개념에 「기본형」)', X => { X.u5_l02.slides[3].data.content += ' 기본형도 있어요.'; }, errFirst);

console.log('\n게이트 g3s2 국어 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
