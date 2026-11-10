/* gate_g2s2_math_u3.js — 2학년 2학기 수학 3단원 「길이 재기」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 틀 + 지도서 직행 점검).
   옛 게이트(142차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g2s2_math_u3.js 에 보관.
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(lbar·ltape·lpw·lcard·lch·tvert·eqt·ngrid·objs1·dtb·panels) · meta(2학년 2학기 · 3단원 · 차시별 성취기준 · 40분 · 지도서 쪽 · live_url) · slug g2s2_math
   B 19장 골격 · C 7요소(2학년 = 곰이·펭이 말풍선 동기 장 · 실사 자리 9종 서로 다름)
   D 복습 계보(l01 = 2단원 데이터 파일의 마지막 차시 출구 — 게이트도 그 파일에서 동적으로 읽어 대조 → l02 … l09 = 직전 출구) · l09 다음 단원 = 시각과 시간
   E 정답 다시 셈 — 게이트 자체 길이 계산기(「a m b cm」를 cm 로 바꾸어 셈)로 기본 27 · 수준별 18 · 출구 27 · 넓히기 9 = 81
   F 식 전수 — 슬라이드 글 속 「… = …」 사슬(길이·수)을 다시 셈(오개념 「틀린 생각」·발문 칸만 뺌) · 틀린 생각의 식은 정말 틀림 · 검산기 자체 확인
   G 그림 — lbar 막대 글 = 막대 길이 · 이어 붙인 줄 전체 = 부분 합 · 잘라 낸 칸 < 막대 · tvert 세로셈 답 = 게이트 셈(받아올림·받아내림 없음) · eqt 식 · lpw 전체 = 부분 합
          · lch 모두 = 부분 합 · ltape 끝 눈금 · dtb 같은 줄 = 같은 길이 · 그림 값이 장 글에 있음 · 문제 그림이 답을 보이지 않음 · 빈칸 답 = 그림에서 다시 낸 값
   H 재료 충실(개념 = src · 기본 문제 = src · 다음 = src) · 교과서 수 표(활동목록.md 차시별 수·장면 낱말) · 보탬 흡수 대조(옛 TB 19장의 핵심 낱말·수가 본류 장에 · b_l id 0) · 중복 · src file = 옛 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항(눈금 0 · 100 cm = 1 m · 받아올림·받아내림 · 약 · 걸음 일정 · m 의 좋은 점만 내세우지 않음)
   L 선행(줄자 l03 · m는 m끼리 l04 · 길이의 차 l05 · 어림 l06 · 간격 l07 — l01 단원 도입 예외) · N 받아올림·받아내림 없는 범위(9차시 넓히기 「100 cm = 1 m」 추론 한 곳만)
   M 차단 어휘(박음·빵꾸·갈아엎·결로) · 「결」 0 · 겹낫표 0 · 인물 = 곰이·펭이만 · 교사 화면 영어 코드(u3·L01) 0
   R 역검증 레드 — 일부러 망가뜨린 사본(정답 · 복습 · 「결」 · b_ 카드 · 교과서 수 · 세로셈 · 식 사슬 · 받아올림 · 인물)을 같은 검사기에 넣어 잡히는지
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g2s2_math_u3.js */
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
const L = load(path.join(TDIR, 'data/g2s2_math_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 9 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '길이 재기', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ── 게이트 자체 길이 계산기 (부품·생성기와 따로 짬) — 「a m b cm」「a m」「b cm」 = cm 한 덩이 · 맨 수 · + − × (×가 먼저) ── */
function len(s) { s = String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').replace(/^약 /, '').trim(); let m;
  if ((m = s.match(/^(\d+) m (\d+) cm$/))) return +m[1] * 100 + +m[2]; if ((m = s.match(/^(\d+) m$/))) return +m[1] * 100; if ((m = s.match(/^(\d+) cm$/))) return +m[1]; return null; }
function evalSide(s0) {
  const s = String(s0).replace(/\*\*/g, '').replace(/[−–]/g, '-').trim();
  const tk = s.match(/\d+\s*m\s+\d+\s*cm|\d+\s*m(?![a-z])|\d+\s*cm|\d+|[-+×()]|\S/g) || []; let i = 0;
  const atom = () => { const t = tk[i++]; let m; if (t === undefined) throw new Error('끝남 in ' + s0);
    if ((m = t.match(/^(\d+)\s*m\s+(\d+)\s*cm$/))) return { v: +m[1] * 100 + +m[2], k: 'L' }; if ((m = t.match(/^(\d+)\s*m$/))) return { v: +m[1] * 100, k: 'L' }; if ((m = t.match(/^(\d+)\s*cm$/))) return { v: +m[1], k: 'L' }; if (/^\d+$/.test(t)) return { v: +t, k: 'N' };
    throw new Error('모르는 글자 ' + t + ' in ' + s0); };
  const term = () => { let a = atom(); while (tk[i] === '×') { i++; const b = atom(); if (a.k === 'L' && b.k === 'L') throw new Error('길이 × 길이 ' + s0); a = { v: a.v * b.v, k: a.k === 'L' || b.k === 'L' ? 'L' : 'N' }; } return a; };
  let a = term(); while (tk[i] === '+' || tk[i] === '-') { const o = tk[i++], b = term(); if (a.k !== b.k) throw new Error('길이와 수를 섞음 ' + s0); a = { v: o === '+' ? a.v + b.v : a.v - b.v, k: a.k }; }
  if (i !== tk.length) throw new Error('남은 글자 ' + tk.slice(i).join('') + ' in ' + s0); return a;
}
function chain(e) { const vs = String(e).split('=').map(x => x.trim()).filter(Boolean).map(evalSide); return vs.every(v => v.k === vs[0].k && v.v === vs[0].v); }
const fm = (c) => (c < 100 ? c + ' cm' : c % 100 ? Math.floor(c / 100) + ' m ' + (c % 100) + ' cm' : c / 100 + ' m');
const fc = (c) => c + ' cm';
const m_ = (e) => { const r = evalSide(e); ok(r.k === 'L', '길이 아님 ' + e); return fm(r.v); };
const c_ = (e) => { const r = evalSide(e); ok(r.k === 'L', '길이 아님 ' + e); return fc(r.v); };
const A_ = (e, u) => { const r = evalSide(e); ok(r.k === 'N', '수 아님 ' + e); return '약 ' + r.v + (u === 'm' ? ' m' : u); };
const MAXL = (...xs) => xs.reduce((p, c) => (len(c) > len(p) ? c : p)), MINL = (...xs) => xs.reduce((p, c) => (len(c) < len(p) ? c : p));
const SHORTER = (e, opts) => { const v = evalSide(e).v; const c = opts.filter(o => len(o) < v); ok(c.length === 1, 'SHORTER 후보 ' + c); return c[0]; };
const GT = (lim, pairs) => { const c = pairs.filter(([, l]) => len(l) > lim); ok(c.length === 1, 'GT 후보 ' + c); return c[0][0]; };
const MINNAME = (pairs) => pairs.reduce((p, c) => (len(c[1]) < len(p[1]) ? c : p))[0];
/* 1 m 를 잰 몸의 단위 횟수(교과서 74쪽 — 양팔 약 1번 · 약 2걸음 · 약 7뼘) — 횟수가 가장 많은 사람 */
const MOST = (who) => { const per = { 양팔: 1, 걸음: 2, 뼘: 7 }; return Object.keys(who).reduce((p, c) => (per[who[c]] > per[who[p]] ? c : p)); };
const TIMES = (big, small) => { const q = len(big) / len(small); ok(Number.isInteger(q), 'TIMES'); return q + '배'; };

/* ── 정답 표 — 게이트가 식에서 다시 셈 ── */
const EXP = {
  basic: {
    u3_l01: [c_('8 cm - 1 cm'), '1 센티미터', '길이의 합'],
    u3_l02: [m_('200 cm'), c_('5 m 73 cm'), 'm'],
    u3_l03: [m_('250 cm'), c_('3 m 30 cm'), MAXL('1 m 90 cm', '4 m 30 cm', '2 m 80 cm')],
    u3_l04: [m_('4 m 26 cm + 1 m 60 cm'), m_('5 m 35 cm + 7 m 40 cm'), m_('130 cm + 150 cm')],
    u3_l05: [m_('4 m 29 cm - 1 m 6 cm'), m_('9 m 48 cm - 1 m 3 cm'), SHORTER('9 m 48 cm - 1 m 3 cm', ['8 m 29 cm', '8 m 50 cm', '8 m 78 cm', '9 m 14 cm'])],
    u3_l06: [A_('2 × 3', '걸음'), MOST({ 슬기: '양팔', 세미: '걸음', 지아: '뼘' }), GT(100, [['교실 문 짧은 쪽', '96 cm'], ['책꽂이 긴 쪽', '102 cm']])],
    u3_l07: [A_('6 + 4 + 6', 'm'), TIMES('10 m', '5 m'), A_('1 × 10', 'm')],
    u3_l08: [m_('6 m 88 cm - 4 m 26 cm'), A_('8 - 1', 'm'), m_('2 m 75 cm - 1 m 30 cm')],
    u3_l09: [c_('4 m 80 cm - 4 m 30 cm'), m_('2 m 20 cm + 1 m 30 cm'), MINNAME([['바다표범', '1 m 80 cm'], ['돌고래', '2 m 20 cm'], ['바다거북', '1 m 30 cm']])]
  },
  lev: {
    u3_l01: [c_('8 cm - 0 cm'), c_('9 cm - 2 cm')], u3_l02: [m_('300 cm'), m_('180 cm')], u3_l03: [m_('140 cm'), c_('5 m 10 cm')],
    u3_l04: [m_('1 m 20 cm + 2 m 30 cm'), m_('6 m 15 cm + 3 m 72 cm')], u3_l05: [m_('3 m 70 cm - 1 m 20 cm'), m_('8 m 65 cm - 5 m 31 cm')],
    u3_l06: [A_('7 × 2', '뼘'), A_('3 × 4', '걸음')], u3_l07: [A_('2 × 4', 'm'), A_('10 + 5 + 5', 'm')], u3_l08: [m_('142 cm'), m_('6 m 45 cm - 3 m 12 cm')],
    u3_l09: [m_('6 m 50 cm - 2 m 20 cm'), m_('4 m 30 cm + 2 m 20 cm')]
  },
  exit: {
    u3_l01: ['0', fc(1), '길이의 차'], u3_l02: [m_('100 cm'), m_('120 cm'), m_('400 cm')], u3_l03: ['0', m_('180 cm'), c_('2 m 20 cm')],
    u3_l04: [m_('2 m 10 cm + 1 m 50 cm'), m_('5 m 15 cm + 2 m 4 cm'), 'cm끼리'], u3_l05: [m_('4 m 50 cm - 2 m 30 cm'), m_('7 m 68 cm - 3 m 25 cm'), m_('2 m 50 cm - 1 m 10 cm')],
    u3_l06: [A_('2 × 4', '걸음'), A_('6 × 2', '뼘'), '약'], u3_l07: [A_('2 × 3', 'm'), A_('5 + 5 + 10', 'm'), '나누어 어림하기'],
    u3_l08: [c_('4 m 15 cm'), m_('2 m 40 cm + 3 m 35 cm'), m_('8 m 90 cm - 6 m 40 cm')], u3_l09: [m_('4 m 30 cm - 1 m 30 cm'), c_('2 m 20 cm'), m_('1 m 80 cm + 2 m 10 cm')]
  },
  adv: { u3_l01: c_('10 cm - 3 cm'), u3_l02: 'cm, m', u3_l03: MINL('3 m 50 cm', '4 m 30 cm', '5 m 10 cm', '4 m 20 cm'), u3_l04: m_('11 m 35 cm + 7 m 23 cm'), u3_l05: m_('5 m 90 cm - 3 m 60 cm'),
    u3_l06: A_('3 × 2 - 2 × 2', '걸음'), u3_l07: A_('5 × 4', 'm'), u3_l08: MAXL('248 cm', '2 m 5 cm'), u3_l09: '약 ' + c_('2 m 20 cm - 1 m 80 cm') }
};

/* ── 교과서 수 표 — 활동목록.md(지도서 쪽 그림으로 다시 읽은 수·장면)의 차시별 수·낱말. 그 차시 데이터에 있어야 한다 ── */
const TB = {
  u3_l01: ['나무 공방', '동물 연구소', '미술관', '축구 골대', '1 센티미터', '8 cm', '7 cm', '재단사', '디자이너', '나무 공예 기술자', '설계사', '철봉', '늑목', '정글짐', '구령대', '화단'],
  u3_l02: ['큐레이터', '120 cm', '600 cm', '600번', '100 cm = 1 m', '1 미터', '10번', '1 m 20 cm', '1 미터 20 센티미터', '200 cm', '2 m', '300 cm', '5 m 73 cm', '573 cm', '405 cm', '4 m 5 cm', '716 cm', '7 m 16 cm', '약 15 cm', '약 3 m', '약 200 cm', '약 7 m', '양팔'],
  u3_l03: ['수찬이의 일기', '곧은자', '줄자', '140 cm = 1 m 40 cm', '알림판', '520 cm', '5 m 20 cm', '180 cm', '1 m 80 cm', '2 m 10 cm', '3 m 50 cm', '3 m 30 cm', '1 m 90 cm', '4 m 30 cm', '2 m 80 cm', '1 m 60 cm', '5 m 10 cm', '4 m 20 cm', '2 m 20 cm', '3 m 10 cm', '직선거리', '250 cm', '색종이', '종이띠 10개'],
  u3_l04: ['1 m 70 cm', '1 m 20 cm', '2 m 90 cm', '17 + 12', '3 m 40 cm', '5 m 50 cm', '8 m 90 cm', '4 m 26 cm', '1 m 60 cm', '5 m 86 cm', '2 m 24 cm', '7 m 5 cm', '9 m 29 cm', '11 m 35 cm', '7 m 23 cm', '130 cm + 150 cm = 280 cm', '5 m 35 cm', '7 m 40 cm', '12 m 75 cm', '굴렁쇠'],
  u3_l05: ['2 m 50 cm', '1 m 40 cm', '1 m 10 cm', '250 cm − 140 cm = 110 cm', '6 m 80 cm', '4 m 50 cm', '2 m 30 cm', '7 m 74 cm', '5 m 32 cm', '2 m 42 cm', '4 m 29 cm', '1 m 6 cm', '3 m 23 cm', '9 m 48 cm', '1 m 3 cm', '8 m 45 cm', '8 m 29 cm', '8 m 50 cm', '8 m 78 cm', '9 m 14 cm', '쪽지'],
  u3_l06: ['바다악어', '약 3 m', '양팔', '약 2걸음', '약 7뼘', '엄지발가락', '96 cm', '102 cm', '1 m 80 cm', '3 m 10 cm', '2 m 90 cm', '1 m 70 cm', '4 m', '신발장', '슬기', '세미', '지아', '10 cm'],
  u3_l07: ['축구 골대', '약 5 m', '2배', '5배', '20 m', '10 + 5 + 10 = 25', '약 25 m', '25개', '13그루', '약 24 m', '무늬', '그네', '약 4 m', '울타리', '약 2 m', '6 + 4 + 6 = 16', '약 16 m'],
  u3_l08: ['100 cm = 1 m', '248 cm', '2 m 48 cm', '2 m 5 cm', '205 cm', '3 m 52 cm', '352 cm', '130 cm = 1 m 30 cm', '4 m 35 cm', '2 m 43 cm', '6 m 78 cm', '5 m 64 cm', '3 m 22 cm', '2 m 42 cm', '3 m 25 cm', '4 m 55 cm', '4 m 58 cm', '2 m 25 cm', '2 m 33 cm', '6 m 88 cm', '4 m 26 cm', '2 m 62 cm', '8명', '약 7 m', '사물함', '약 1 m', '자동차', '약 5 m', '2 m 75 cm', '1 m 45 cm', '142 cm', '1 m 42 cm'],
  u3_l09: ['바다표범', '약 1 m 80 cm', '돌고래', '약 2 m 20 cm', '범고래', '약 6 m 50 cm', '바다거북', '약 1 m 30 cm', '바다악어', '약 4 m 80 cm', '백상아리', '약 4 m 30 cm', '동물 몸길이 사전', '동물 카드', '스마트 기기']
};
/* ── 옛 보탬 표(TB, archive/neutral/gen_g2s2_math_u3.js 202~221줄) 19장의 핵심 낱말·수 — 본류 장(extras 아님)에 있어야 한다 ── */
const ABSORB = {
  u3_l01: [['길이 재기가 필요한 직업 찾기', ['나무 공방', '동물 연구소', '미술관', '축구 골대']], ['단원 실천 활동', ['재단사', '디자이너', '나무 공예 기술자', '설계사', '철봉', '늑목', '정글짐', '구령대', '화단', '가족의 키']]],
  u3_l02: [['큐레이터와 조각상 120 cm', ['큐레이터', '120 cm', '600 cm', '내 키']], ['716 cm와 7 m 16 cm', ['716 cm', '7 m 16 cm', '405 cm', '4 m 5 cm']], ['양팔을 벌린 길이 재기', ['양팔', '10 cm 자', '끈']]],
  u3_l03: [['수찬이의 일기', ['수찬이의 일기', '곧은자', '줄자', '둘레']], ['교실에서 1 m보다 긴 물건 재기', ['알림판', '520 cm', '180 cm', '250 cm']], ['멀리 던지기 기록표', ['멀리 던지기', '2 m 10 cm', '5 m 10 cm', '직선거리']], ['1 m 자 만들기', ['색종이', '종이띠', '5 cm, 10 cm']]],
  u3_l04: [['길이의 합 더 해 보기', ['4 m 26 cm', '2 m 24 cm', '9 m 29 cm', '11 m 35 cm', '17 + 12']], ['물건의 길이를 재어 합 구하기', ['1 m가 넘는 물건', '130 cm + 150 cm', '100 cm = 1 m', '받아올림']]],
  u3_l05: [['남은 길이 두 가지로 구하고 검산하기', ['250 cm − 140 cm = 110 cm', '1 m 10 cm + 1 m 40 cm = 2 m 50 cm']], ['친구와 길이의 차 쪽지 바꾸기', ['쪽지', '받아내림']]],
  u3_l06: [['어림하고 자로 재어 확인하기', ['1 m 80 cm', '3 m 10 cm', '2 m 90 cm', '1 m 70 cm', '96 cm', '102 cm']], ['한 걸음 약속과 줄자 안전', ['양발을 모은', '팽팽하게', '약 3걸음']]],
  u3_l07: [['10 m·20 m 어림하기', ['10 m', '2배', '5배', '20 m']], ['같은 간격 세어 어림하기', ['25개', '13그루', '약 24 m', '무늬', '10 + 5 + 10 = 25']]],
  u3_l08: [['확인해요 나머지 문항', ['2 m 5 cm', '205 cm', '6 m 78 cm', '2 m 42 cm', '8명', '약 7 m', '사물함', '자동차']], ['수학익힘 확인해요 — 가로와 세로', ['2 m 75 cm', '1 m 30 cm', '1 m 45 cm', '142 cm', '1 m 42 cm', '적극적으로']]]
};
const OLD_FILES = { u3_l01: 'g2_math_u3_l01_단원도입.html', u3_l02: 'g2_math_u3_l02_cm보다더큰단위를알아볼까요.html', u3_l03: 'g2_math_u3_l03_자로길이를재어볼까요.html', u3_l04: 'g2_math_u3_l04_길이의합을구해볼까요.html', u3_l05: 'g2_math_u3_l05_길이의차를구해볼까요.html', u3_l06: 'g2_math_u3_l06_길이를어림해볼까요⑴.html', u3_l07: 'g2_math_u3_l07_길이를어림해볼까요⑵.html', u3_l08: 'g2_math_u3_l08_수학이랑확인해요_단원평가.html', u3_l09: 'g2_math_u3_l09_수학이랑만들어요.html' };
/* ── 지도서 차시 제목(교과서 차시 이름) · 지도서 쪽 · 차시별 성취기준(지도서 209쪽 수업의 흐름) ── */
const TITLE = { u3_l01: '길이 재기', u3_l02: 'cm보다 더 큰 단위를 알아볼까요', u3_l03: '자로 길이를 재어 볼까요', u3_l04: '길이의 합을 구해 볼까요', u3_l05: '길이의 차를 구해 볼까요', u3_l06: '길이를 어림해 볼까요 ⑴', u3_l07: '길이를 어림해 볼까요 ⑵', u3_l08: '수학이랑 확인해요', u3_l09: '수학이랑 만들어요' };
const PAGES = { u3_l01: '216~219', u3_l02: '220~221', u3_l03: '222~223', u3_l04: '224~225', u3_l05: '226~227', u3_l06: '228~229', u3_l07: '230~231', u3_l08: '232~233', u3_l09: '234~235' };
const STDC = { u3_l01: ['10', '12'], u3_l02: ['10', '11'], u3_l03: ['11'], u3_l04: ['13'], u3_l05: ['13'], u3_l06: ['12'], u3_l07: ['12'], u3_l08: ['10', '11', '12', '13'], u3_l09: ['12'] };
const STDT = { 10: '길이 단위 1 cm와 1 m를 알고, 이를 이용하여 주변 사물의 길이를 측정할 수 있다.', 11: '1 m와 1 cm의 관계를 이해하고, 길이를 ‘몇 m 몇 cm’와 ‘몇 cm’로 표현할 수 있다.', 12: '여러 가지 물건의 길이를 어림하고, 길이에 대한 양감을 기른다.', 13: '실생활 문제 상황과 관련지어 길이의 덧셈과 뺄셈을 할 수 있다.' };

/* ── 2단원(다른 트랙이 다시 짓는 중) — 마지막 차시를 파일에서 동적으로 읽음 ── */
const P2 = load(path.join(TDIR, 'data/g2s2_math_u2.js'));
const P2KEY = Object.keys(P2).sort().pop();
const P2EXIT = P2[P2KEY].slides.find(s => s.block === 'exit_ticket').data.items.map(x => ({ q: x.q, a: x.a }));

/* ══════════ 검사기 (사본에도 쓸 수 있게 L 을 받는다 — R 역검증) ══════════ */
function errAnswers(LX) { const er = []; let n = 0;
  const want = (d, exp, at) => {
    if (d.options) { const c = d.options.filter(o => o.correct); if (c.length !== 1 || 'answer' in d) er.push(at + ' 보기 정답 수'); else if (clean(c[0].text) !== exp) er.push(at + ' 정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」');
      if (d.options.filter(o => clean(o.text) === exp).length !== 1) er.push(at + ' 같은 보기 둘'); d.options.filter(o => !o.correct).forEach(o => { if (len(o.text) != null && len(exp) != null && len(o.text) === len(exp)) er.push(at + ' 오답 보기가 정답과 같은 길이 ' + o.text); }); }
    else if (d.input === 'count_input') { if (String(d.answer) !== exp) er.push(at + ' 답 ' + d.answer + ' ≠ 셈 ' + exp); }
    else { if (String(d.answer) !== exp) er.push(at + ' 답 ' + d.answer + ' ≠ 셈 ' + exp); if (!/몇|얼마/.test(d.question)) er.push(at + ' 단위 답 물음에 「몇/얼마」 없음'); }
    if (!d.options && !new RegExp('\\*\\*' + String(d.answer).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*$').test(d.note)) er.push(at + ' 풀이 끝 ≠ 답');
    n++; };
  KEYS.forEach(k => { const sl = LX[k].slides;
    sl.filter(s => s.block === 'basic_problem').forEach((s, i) => want(s.data, EXP.basic[k][i], k + ' ' + s.id));
    const lv = sl[11].data.levels; if (!(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true)) er.push(k + ' 수준 셋·심화 open');
    ['기본', '도전'].forEach((t, i) => { if (String(lv[t].a) !== EXP.lev[k][i]) er.push(k + ' ' + t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); if (!(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]) === nsp(lv[t].a))) er.push(k + ' ' + t + ' 풀이 끝'); n++; });
    sl[15].data.items.forEach((x, i) => { if (String(x.a) !== EXP.exit[k][i]) er.push(k + ' 출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXP.exit[k][i]); n++; });
    const last = (sl[14].data.note.match(/\*\*([^*]+)\*\*/g) || []).pop(); if (!(last && last.replace(/\*/g, '') === EXP.adv[k])) er.push(k + ' 넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); n++; });
  return { er, n }; }
function errReview(LX) { const er = [];
  KEYS.forEach((k, i) => { const rv = LX[k].slides[1].data;
    if (!i) { if (rv.from !== 'g2s2_math:' + P2KEY) er.push('l01 from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), P2EXIT.map(x => [x.q, x.a]))) er.push('l01 복습 ≠ 2단원 ' + P2KEY + ' 출구'); return; }
    const ex = LX[KEYS[i - 1]].slides[15].data.items; if (rv.from !== KEYS[i - 1]) er.push(k + ' from ' + rv.from); if (!SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a]))) er.push(k + ' 복습 ≠ ' + KEYS[i - 1] + ' 출구'); });
  return er; }
function errBan(LX) { const er = [], all = JSON.stringify(LX); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』'].forEach(b => { if (all.indexOf(b) >= 0) er.push('차단 「' + b + '」'); }); return er; }
function errPeople(LX) { const er = [];
  KEYS.forEach(k => { const mo = LX[k].slides[2].data, ks = mo.kids || []; if (ks.length !== 2 || ks[0].face !== '🐻' || !/^곰이\n"/.test(ks[0].label) || ks[1].face !== '🐧' || !/^펭이\n"/.test(ks[1].label)) er.push(k + ' 동기 장 곰이·펭이'); });
  const all = JSON.stringify(LX); ['하나와 두리', '하나·두리', '두리가', '두리는'].forEach(b => { if (all.indexOf(b) >= 0) er.push('다른 인물 「' + b + '」'); });
  KEYS.forEach(k => LX[k].slides.forEach(s => (s.data.kids || []).forEach(kd => { if (!/^(곰이|펭이)\n/.test(kd.label)) er.push(k + ' ' + s.id + ' 인물 ' + kd.label.split('\n')[0]); })));
  return er; }
function strsOf(LX, k, withExtras) { const out = []; (function walk(o, where) { if (typeof o === 'string') out.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig') return; walk(o[x], where + '.' + x); }); })(withExtras ? LX[k] : LX[k].slides, k); return out; }
function errTB(LX) { const er = []; KEYS.forEach(k => { const all = nsp(JSON.stringify(LX[k])); TB[k].forEach(t => { if (all.indexOf(nsp(t)) < 0) er.push(k + ' 교과서 수 없음 「' + t + '」'); }); }); return er; }
function errAbsorb(LX) { const er = []; let n = 0;
  Object.keys(ABSORB).forEach(k => { const main = nsp(JSON.stringify(LX[k].slides.map(s => Object.assign({}, s.data, { fig: null })))); ABSORB[k].forEach(([title, words]) => { n++; words.forEach(wd => { if (main.indexOf(nsp(wd)) < 0) er.push(k + ' 보탬 「' + title + '」 낱말 「' + wd + '」 본류에 없음'); }); }); });
  KEYS.forEach(k => LX[k].extras.forEach(e => { if (/^b_l/.test(e.id) || e.type === 'other_activity') er.push(k + ' 보탬 카드 남음 ' + e.id); }));
  return { er, n }; }
/* 길이·수 식 사슬 찾기 — 줄을 넘지 않음 */
const SP = '[ \\t]', LENP = '\\d+(?:' + SP + '*m(?:' + SP + '+\\d+' + SP + '*cm)?(?![a-z])|' + SP + '*cm)?', TERMP = LENP + '(?:' + SP + '*×' + SP + '*' + LENP + ')*', SIDEP = TERMP + '(?:' + SP + '*[+−-]' + SP + '*' + TERMP + ')*';
const EQRE = new RegExp(SIDEP + '(?:' + SP + '*=' + SP + '*' + SIDEP + ')+', 'g');
function eqsIn(s0) { const s = String(s0).replace(/\*\*/g, ''); const out = []; let m; EQRE.lastIndex = 0; while ((m = EQRE.exec(s))) out.push(m[0].trim()); return out; }
function errChains(LX) { const er = []; let n = 0;
  KEYS.forEach(k => strsOf(LX, k, false).forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqsIn(s).forEach(t => { n++; try { if (!chain(t)) er.push(where + ' 「' + t + '」'); } catch (e) { er.push(where + ' 못 읽음 「' + t + '」 ' + e.message); } }); }));
  return { er, n }; }

/* ── 그림 검사 — 문제 그림이면 구할 값(cm)을 돌려준다 ── */
const segLen = (x) => (x === '?' ? null : len(x));
function figList(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figList(p.fig || p)); return [f]; }
function checkFig(at, f, prob, text) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), at + ' 렌더'); const d = docOf(h); const want = [];
  const inText = (lab) => { if (lab == null || lab === '?' || len(lab) == null) return; ok(nsp(text).indexOf(nsp(String(lab).replace(/^약 /, ''))) >= 0, at + ' 그림 값 「' + lab + '」 이 장 글에 없음'); };
  if (f.k === 'lbar') {
    f.rows.forEach(r => { const tot = r.join ? r.segs.reduce((a, g) => a + g.cm, 0) : r.cm;
      if (r.join) { r.segs.forEach(g => { if (g.lb === '?') want.push(g.cm); else if (segLen(g.lb) != null) { ok(segLen(g.lb) === g.cm, at + ' 부분 글 ' + g.lb + ' ≠ ' + g.cm); inText(g.lb); } }); }
      if (r.lb === '?') want.push(tot); else if (segLen(r.lb) != null) { ok(segLen(r.lb) === tot, at + ' 막대 글 ' + r.lb + ' ≠ ' + tot); inText(r.lb); }
      if (r.cut) ok(r.cut < r.cm, at + ' 잘라 낸 칸'); });
    ok(f.max === Math.max(...f.rows.map(r => (r.join ? r.segs.reduce((a, g) => a + g.cm, 0) : r.cm))), at + ' 공통 눈금 max');
    ok(d.querySelector('svg[data-bars]'), at + ' 막대 렌더'); }
  if (f.k === 'ltape') { ok(f.ticks.indexOf(f.len) >= 0, at + ' 끝 눈금이 자에 없음'); if (f.on != null) ok(f.on === f.len, at + ' 끝 눈금 강조 ≠ 길이'); if (prob) ok(f.on == null, at + ' 문제 그림 끝 눈금 강조');
    if (!f.brk) ok(f.s1 - f.s0 === f.len, at + ' 곧은자 s1 − s0 ≠ len'); else ok(f.ticks[0] === 0, at + ' 줄자 눈금 0');
    if (prob) want.push(f.len); ok(d.querySelector('svg[data-rul]'), at + ' 자 렌더'); }
  if (f.k === 'tvert') { const [a0, a1] = f.a, [b0, b1] = f.b, plus = f.op === '+';
    if (plus) ok(a1 + b1 < 100, at + ' 받아올림'); else ok(a1 >= b1 && a0 >= b0, at + ' 받아내림');
    const R = d.querySelector('.fig-tvert').getAttribute('data-r').split(',').map(Number), mine = plus ? a0 * 100 + a1 + b0 * 100 + b1 : a0 * 100 + a1 - b0 * 100 - b1;
    ok(R[0] * 100 + R[1] === mine, at + ' 세로셈 답 ' + R + ' ≠ 게이트 ' + mine); inText(fm(a0 * 100 + a1)); inText(fm(b0 * 100 + b1));
    if (prob) { ok(SAME(f.q, [0, 1]) && d.querySelectorAll('.tv-q').length === 2, at + ' 문제 세로셈 답 칸이 다 가려지지 않음'); want.push(mine); } else if (!f.q) inText(fm(mine)); }
  if (f.k === 'eqt') f.rows.forEach(r => { const t = r.toks.map(String).join(' ').replace(/\s+/g, ' '); const sides = t.split(' = ');
    if (sides.indexOf('?') >= 0) { ok(sides.length === 2 && sides[1] === '?', at + ' 빈칸 식'); want.push(evalSide(sides[0]).v); ok(prob, at + ' 개념 그림에 빈칸 식'); }
    else ok(chain(t), at + ' 식 ' + t); if (prob) ok(!(r.hi || []).length, at + ' 문제 식 강조'); });
  if (f.k === 'lpw') { ok(f.cm[0] === f.cm[1] + f.cm[2], at + ' 전체 ≠ 부분 합'); [[f.t, f.cm[0]], [f.a, f.cm[1]], [f.b, f.cm[2]]].forEach(([s, c]) => { if (s !== '?') { ok(len(s) === c, at + ' 가지 글 ' + s); inText(s); } }); if (f.t === '?') want.push(f.cm[0]); }
  if (f.k === 'lch') { f.segs.forEach((g, i) => { ok(len(g.lab) === f.cm[i], at + ' 부분 ' + g.lab); inText(g.lab); }); const sum = f.cm.reduce((a, b) => a + b, 0); if (f.tot === '?') want.push(sum); else { ok(len(f.tot) === sum, at + ' 모두 ' + f.tot + ' ≠ ' + sum); inText(f.tot); } }
  if (f.k === 'dtb') f.rows.forEach(r => { const ls = r.filter(c => !/^약 /.test(c)).map(len).filter(v => v != null); ok(ls.every(v => v === ls[0]), at + ' 바꾸기 표 줄 ' + r.join(' / ')); r.forEach(inText); });
  if (f.k === 'ngrid') f.rows.forEach(r => r.forEach(c => inText(typeof c === 'object' ? c.v : c)));
  if (f.k === 'lcard') f.items.forEach(it => { if (String(it.v).indexOf('?') < 0) inText(it.v); });
  ok(['lbar', 'ltape', 'tvert', 'eqt', 'lpw', 'lch', 'dtb', 'ngrid', 'lcard', 'objs1'].indexOf(f.k) >= 0, at + ' 모르는 부품 ' + f.k);
  return want; }
function slideText(s) { const d = s.data; return [d.title, d.content, d.question, d.note, d.scenario && d.scenario.body].filter(Boolean).join(' '); }
function errFigs(LX) { const er = []; const nG = { fig: 0, want: 0 };
  KEYS.forEach(k => LX[k].slides.forEach(s => { if (!s.data.fig) return; const prob = s.block === 'basic_problem';
    figList(s.data.fig).forEach(f => { nG.fig++; try { const wv = checkFig(k + ' ' + s.id + ' ' + f.k, f, prob, slideText(s));
      const d0 = s.data, A0 = prob ? (d0.options ? clean(d0.options.find(o => o.correct).text) : String(d0.answer)) : ''; if (prob && wv.length && len(A0) != null) { nG.want++; const A = A0; ok(wv.length === 1, k + ' ' + s.id + ' 구할 값 ' + wv.length); ok(len(A) === wv[0], k + ' ' + s.id + ' 답 「' + A + '」 ≠ 그림에서 다시 낸 ' + fm(wv[0])); } }
    catch (e) { er.push(e.message); } }); }));
  return { er, nG }; }
function errNoCarry(LX) { const er = []; let n = 0;
  const one = (q, at) => { const m = clean(q).match(/^(.+[+−].+?)는 얼마일까요\?$/); if (!m) return; const ts = m[1].split(/ (?=[+−] )/); let cm = 0, mm = 0;
    ts.forEach((t, i) => { const sg = i && t[0] === '−' ? -1 : 1; const tt = i ? t.slice(2) : t; const a = tt.match(/(\d+) m/), b = tt.match(/(\d+) cm/); mm += sg * (a ? +a[1] : 0); cm += sg * (b ? +b[1] : 0);
      if (i && sg < 0 && cm < 0) er.push(at + ' 받아내림 ' + q); }); if (cm >= 100 || cm < 0 || mm < 0) er.push(at + ' 받아올림·받아내림 ' + q); n++; };
  KEYS.forEach(k => { const sl = LX[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => one(s.data.question, k + ' ' + s.id)); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => one(lv[t].q, k + ' ' + t)); sl[15].data.items.forEach(x => one(x.q, k + ' 출구')); });
  return { er, n }; }

/* ══════════════════════════════ 게이트 ══════════════════════════════ */
console.log('═══ A. 로드 ═══');
T('9차시 키 u3_l01~l09 · 파일 data/g2s2_math_u3.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 2학년 2학기 수학 · 3단원 길이 재기 · 차시별 성취기준(지도서 문구) · 40분 · 지도서 쪽 · n · live_url · theme', () => KEYS.forEach(k => { const m = L[k].meta;
  ok(m.grade === 2 && m.term === 2 && m.unit === 3 && m.subject === '수학' && m.unit_title === '길이 재기' && m.n === +k.slice(-2), k);
  ok(m.std === STDC[k].map(c => '[2수03-' + c + '] ' + STDT[c]).join(' · '), k + ' 성취기준 ' + m.std); ok(m.duration_min === 40, k + ' 40분');
  ok(m.source.indexOf('지도서 3단원(지도서 ' + PAGES[k]) >= 0 && /자기주도 원문 없이 지도서에서 세움$/.test(m.source), k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key');
  ok(m.live_url === '../../grade2/semester2/math/3단원_길이재기/' + OLD_FILES[k] && fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url'); ok(m.theme === '곰이·펭이 길이 재기 마을', k + ' theme'); }));
T('차시 제목 = 지도서 차시 이름 · 합계 360분', () => { KEYS.forEach(k => ok(L[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L[k].meta.title)); ok(KEYS.reduce((a, k) => a + L[k].meta.duration_min, 0) === 360, '분'); });
T('slug — KT2.slugOf({g:2,s:math,t:2}) = g2s2_math · 2학년 = tier-mid', () => { ok(KT2.slugOf({ g: 2, s: 'math', t: '2' }) === 'g2s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 등록 · 렌더(lbar·ltape·lpw·lcard·lch·tvert·eqt·ngrid·objs1·dtb·panels)', () => ['lbar', 'ltape', 'lpw', 'lcard', 'lch', 'tvert', 'eqt', 'ngrid', 'objs1', 'dtb', 'panels'].forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 미등록')));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 171장 (9 × 19)', () => ok(KEYS.reduce((a, k) => a + L[k].slides.length, 0) === 171, '장 수'));

console.log('═══ C. 7요소 (2학년 = 곰이·펭이 말풍선) ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length === 2 && s.data.question && s.data.desc), '③장면·물음·인물');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 9종 서로 다름 · 2-2 수학 다른 단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); let other = []; for (let u = 1; u <= 7; u++) { if (u === 3) continue; const f = path.join(TDIR, 'data/g2s2_math_u' + u + '.js'); if (fs.existsSync(f)) other = other.concat(Object.values(load(f)).map(l => (l.slides[2].data || {}).img).filter(Boolean)); } ok(!im.some(x => other.indexOf(x) >= 0), '겹침'); });
T('인물 = 곰이·펭이(옛 덱 계승) · 동기 장 말풍선 실렌더 mo2', () => { const e = errPeople(L); ok(!e.length, e.join(' | ')); KEYS.forEach(k => { const r = render(L[k].slides[2], L[k], false); ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), k + ' mo2'); }); });

console.log('═══ D. 복습 계보 ═══');
T('l01 복습 = 2단원 마지막 차시(' + P2KEY + ') 출구 — 파일에서 동적으로 읽어 대조 · 이후 = 직전 차시 출구', () => { const e = errReview(L); ok(!e.length, e.join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 4단원 시각과 시간 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L.u3_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /시각과 시간/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) >= 0, k + ' 예고 ' + d.preview); }); });

console.log('═══ E. 정답 다시 셈 ═══');
const EA = errAnswers(L);
T('기본 27 · 수준별 기본·도전 18 · 출구 27 · 넓히기 9 = 게이트 셈', () => ok(!EA.er.length, EA.er.slice(0, 6).join(' | ')));
T('다시 셈한 정답 = 81', () => ok(EA.n === 81, EA.n));
T('셈기 자체 확인 — m·cm 덩이 · 받아쓰기 꼴 · × 먼저 · 특수 셈 · 틀린 답 잡음', () => { ok(m_('1 m 70 cm + 1 m 20 cm') === '2 m 90 cm' && c_('5 m 73 cm') === '573 cm' && m_('405 cm') === '4 m 5 cm' && m_('400 cm') === '4 m' && A_('3 × 2 - 2 × 2', '걸음') === '약 2걸음' && A_('6 + 4 + 6', 'm') === '약 16 m', '셈');
  ok(MAXL('248 cm', '2 m 5 cm') === '248 cm' && MINNAME([['가', '1 m 80 cm'], ['나', '1 m 30 cm']]) === '나' && MOST({ 가: '양팔', 나: '뼘', 다: '걸음' }) === '나' && TIMES('10 m', '2 m') === '5배', '특수');
  let c = 0; try { evalSide('1 m 20 cm + 3'); } catch (e) { c++; } try { evalSide('2 m × 3 m'); } catch (e) { c++; } ok(c === 2, '섞은 식 못 잡음'); });

console.log('═══ F. 식 전수 ═══');
const EC = errChains(L);
T('글 속 「… = …」 사슬 다시 셈 (' + EC.n + ') 틀림 0 · ≥ 60', () => ok(!EC.er.length && EC.n >= 60, 'n ' + EC.n + ' ' + EC.er.slice(0, 6).join(' | ')));
T('오개념 「틀린 생각」 칸의 식은 정말 틀림 · 식 있는 틀린 생각 ≥ 4', () => { let n = 0; KEYS.forEach(k => eqsIn(L[k].slides[7].data.wrong).forEach(t => { n++; ok(!chain(t), k + ' 틀린 생각이 맞는 식 ' + t); })); ok(n >= 4, '식 있는 틀린 생각 ' + n); });
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과 · 사슬 찾기)', () => { ok(!chain('2 m 24 cm + 7 m 5 cm = 9 m 74 cm') && !chain('405 cm = 40 m 5 cm') && !chain('3 m 52 cm = 55 cm'), '틀린 식'); ok(chain('120 cm = 100 cm + 20 cm = 1 m 20 cm') && chain('10 + 5 + 10 = 25') && chain('2 × 2 = 4'), '맞는 식');
  ok(SAME(eqsIn('m끼리 2 m − 1 m = 1 m · 50 cm − 40 cm = 10 cm예요'), ['2 m − 1 m = 1 m', '50 cm − 40 cm = 10 cm']), '사슬 찾기 ' + JSON.stringify(eqsIn('m끼리 2 m − 1 m = 1 m · 50 cm − 40 cm = 10 cm예요'))); });

console.log('═══ G. 그림 ═══');
const EF = errFigs(L);
T('그림 ' + EF.nG.fig + '개 — 막대·자·세로셈·식·가지·나누어 어림·표·카드 값 = 게이트 셈 · 그림 값이 장 글에 · 빈칸 답 = 그림에서 다시 낸 값(' + EF.nG.want + ')', () => ok(!EF.er.length && EF.nG.want >= 12, EF.nG.want + ' ' + EF.er.slice(0, 6).join(' | ')));
T('기본 문제 그림이 정답을 보이지 않음(그림 글자 속 정답 0 — 문제 글에 이미 있는 답 빼고)', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const ans = d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer); if (nsp(d.question).indexOf(nsp(ans)) >= 0) return; const txt = nsp(docOf(FIG.render(d.fig)).body.textContent); ok(txt.indexOf(nsp(ans)) < 0, k + ' ' + s.id + ' 그림에 정답 ' + ans); })));
T('개념 36장 · 기본 문제 27장 모두 그림', () => { let c = 0, p = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); });
T('그림 검사기 자체 확인 — 막대 합 · 세로셈 받아올림 · 문제 끝 눈금 · 가지 합 · 나누어 어림 · 바꾸기 표 잡음', () => { let c = 0; const tr = (f, prob) => { try { checkFig('probe', f, prob, '1 m 70 cm 1 m 20 cm 2 m 80 cm 2 m 30 cm 1 m 80 cm 130 cm 1 m 20 cm 약 2 m 약 5 m 405 cm 4 m 50 cm'); } catch (e) { c++; } };
  tr({ k: 'lbar', rows: [{ join: true, segs: [{ cm: 170, col: 'a', lb: '1 m 70 cm' }, { cm: 120, col: 'b', lb: '1 m 20 cm' }], lb: '2 m 80 cm' }], max: 290 }); tr({ k: 'tvert', units: ['m', 'cm'], base: 100, a: [2, 30], b: [1, 80], op: '+' });
  tr({ k: 'ltape', name: '책장', ticks: [0, 127, 128, 129, 130, 131], brk: true, len: 130, on: 130 }, true); tr({ k: 'lpw', t: '130 cm', a: '1 m', b: '20 cm', cm: [130, 100, 20] });
  tr({ k: 'lch', segs: [{ name: '①', lab: '약 2 m' }, { name: '②', lab: '약 2 m' }], cm: [200, 200], tot: '약 5 m' }); tr({ k: 'dtb', head: ['a', 'b'], rows: [['405 cm', '4 m 50 cm']] }); ok(c === 6, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 보탬 흡수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k];
  L[k].slides.filter(s => s.block === 'concept').forEach((s, i) => ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(String(d.answer) === p.a, s.id + ' 답'); });
  const nx = L[k].slides[18].data; if (k !== 'u3_l09') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
const ETB = errTB(L);
T('교과서 수 표 ' + KEYS.reduce((a, k) => a + TB[k].length, 0) + '개가 그 차시에 있음', () => ok(!ETB.length, ETB.slice(0, 8).join(' | ')));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l05 「9 m 48 cm」는 l02 에 · l02 「5 m 73 cm」는 l05 에 없음)', () => { ok(nsp(JSON.stringify(L.u3_l02)).indexOf(nsp('9 m 48 cm')) < 0, 'l02'); ok(nsp(JSON.stringify(L.u3_l05)).indexOf(nsp('5 m 73 cm')) < 0, 'l05'); });
const EAB = errAbsorb(L);
T('보탬 흡수 대조 — 옛 TB ' + EAB.n + '장의 핵심 낱말·수가 본류 장(extras 아님)에 · b_l id·교과서 활동 덤 장 0', () => ok(!EAB.er.length && EAB.n === 19, EAB.n + ' ' + EAB.er.slice(0, 6).join(' | ')));
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const all = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(n && e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 = 옛 src file 칸(자기주도 파일 이름) 그대로 — 투영 지도 바뀜 0', () => KEYS.forEach(k => ok(SRC[k].file === OLD_FILES[k], k + ' ' + SRC[k].file)));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 지도서 유의 사항 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~는가?」「~면?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.forEach(x => qs.push([k + ' 출구', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — 눈금 0(l01·l03·l08) · 100 cm = 1 m · 1 미터 읽기(l02) · 스스로 필요(l02) · m 의 좋은 점만(l02) · 팽팽·직선거리(l03) · 받아올림(l04) · 받아내림(l05·l09) · 약(l06) · 걸음 일정(l06) · 지나치게 강조하지(l06) · 세 전략(l07)', () => { const tx = (k) => JSON.stringify(L[k]);
  ['u3_l01', 'u3_l03', 'u3_l08'].forEach(k => ok(/눈금 0/.test(tx(k)), k + ' 눈금 0')); ok(/100 cm = 1 m|100 cm는 1 m/.test(tx('u3_l02')) && /1 미터 20 센티미터/.test(tx('u3_l02')), 'l02 1 m'); ok(/스스로 필요|먼저 알려 주지 말고/.test(tx('u3_l02')), 'l02 스스로'); ok(/좋은 점만/.test(tx('u3_l02')), 'l02 m 장점만');
  ok(/팽팽/.test(tx('u3_l03')) && /직선거리/.test(tx('u3_l03')), 'l03 줄자'); ok(/받아올림/.test(tx('u3_l04')) && /100 cm = 1 m/.test(tx('u3_l04')), 'l04 받아올림'); ['u3_l05', 'u3_l09'].forEach(k => ok(/받아내림/.test(tx(k)) && /100 cm(가| =) 1 m/.test(tx(k)), k + ' 받아내림'));
  ok(/「약」/.test(tx('u3_l06')) && /매번 같게/.test(tx('u3_l06')) && /지나치게 강조하지/.test(tx('u3_l06')), 'l06 어림'); ok(/기준 삼기/.test(tx('u3_l07')) && /나누어 어림하기/.test(tx('u3_l07')) && /간격 세기/.test(tx('u3_l07')), 'l07 세 전략');
  ok(/약 1 m/.test(tx('u3_l07')) && /5 m/.test(tx('u3_l07')) && /10 m/.test(tx('u3_l07')) && /20 m/.test(tx('u3_l07')), 'l07 1 m → 5 m → 10 m → 20 m'); });

console.log('═══ L. 선행 용어 · N. 받아올림·받아내림 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson' && s.block !== 'review').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['줄자', 3], ['m는 m끼리', 4], ['길이의 차', 5], ['어림', 6], ['간격', 7]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));
const EN = errNoCarry(L);
T('기본·수준별·출구의 길이 합·차 ' + EN.n + '개 모두 받아올림·받아내림 없음(지도서 209·225·227) · 받아내림은 9차시 넓히기 「100 cm = 1 m」 추론 한 곳만', () => { ok(!EN.er.length && EN.n >= 15, EN.n + ' ' + EN.er.join(' | ')); const a9 = L.u3_l09.slides[14].data; ok(/100 cm = 1 m/.test(a9.challenge) && /뺄 수 없어요/.test(a9.context), 'l09 넓히기'); });

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0', () => { const e = errBan(L); ok(!e.length, e.join(' | ')); });
T('렌더된 그림 속 「결」 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) ok(FIG.render(s.data.fig).indexOf('결') < 0, k + ' ' + s.id); })));
T('교사 화면(렌더 글자)에 영어 코드(u3 · l01 · L01 · lesson) 0 · 영어 낱말은 단위(cm·m)·보기 기호(A~D)만', () => { const UNITS = ['cm', 'm']; KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); (txt.match(/[A-Za-z]+/g) || []).forEach(wd => ok(UNITS.indexOf(wd) >= 0 || /^[A-D]$/.test(wd), k + ' ' + s.id + ' 영어 낱말 「' + wd + '」')); }))); });
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 같은 검사기에 ═══');
const red = (name, mut, check) => T('레드: ' + name, () => { const X = clone(L); mut(X); const e = check(X); ok(e.length > 0, '못 잡음'); });
red('기본 문제 정답 바꿈(l04 ① 5 m 86 cm → 5 m 68 cm)', X => { X.u3_l04.slides[8].data.answer = '5 m 68 cm'; X.u3_l04.slides[8].data.note = X.u3_l04.slides[8].data.note.replace('**5 m 86 cm**', '**5 m 68 cm**'); }, X => errAnswers(X).er);
red('출구 정답 바꿈(l09 3 m 90 cm → 3 m 9 cm)', X => { X.u3_l09.slides[15].data.items[2].a = '3 m 9 cm'; }, X => errAnswers(X).er);
red('복습 계보 끊음(l06 복습 한 줄 바꿈)', X => { X.u3_l06.slides[1].data.items[0].a = '약 9걸음'; }, errReview);
red('l01 복습을 2단원 아닌 것으로', X => { X.u3_l01.slides[1].data.items = [{ q: '1 + 1은 얼마일까요?', a: '2' }]; }, errReview);
red('「결」 글자 넣음(l03 개념 「해결」)', X => { X.u3_l03.slides[3].data.content += ' 문제를 해결해요.'; }, errBan);
red('보탬 카드 b_l3_1 되살림', X => { X.u3_l03.extras.push({ id: 'b_l3_1', type: 'other_activity', title: '교과서 활동', content: '멀리 던지기' }); }, X => errAbsorb(X).er);
red('보탬 낱말을 본류에서 지우고 extras 로만(l03 직선거리)', X => { X.u3_l03.slides.forEach(s => { if (s.data.content) s.data.content = s.data.content.replace(/직선거리/g, '곧은 거리'); }); X.u3_l03.extras[0].description += ' 직선거리'; }, X => errAbsorb(X).er);
red('교과서 수 지움(l05 9 m 48 cm)', X => { X.u3_l05.slides.forEach(s => { s.data = JSON.parse(JSON.stringify(s.data).replace(/9 m 48 cm/g, '9 m 40 cm')); }); }, errTB);
red('세로셈 수 바꿈(l04 개념 1 m 70 cm → 1 m 80 cm)', X => { X.u3_l04.slides[5].data.fig.a = [1, 80]; }, X => errFigs(X).er);
red('문제 세로셈 답 칸 드러냄(l05 ① q 지움)', X => { delete X.u3_l05.slides[8].data.fig.q; }, X => errFigs(X).er);
red('식 사슬 틀림(l02 개념 405 cm = … = 4 m 50 cm)', X => { X.u3_l02.slides[6].data.content = X.u3_l02.slides[6].data.content.replace('**4 m 5 cm**', '**4 m 50 cm**'); }, X => errChains(X).er);
red('받아올림 있는 출구(l04 2 m 70 cm + 1 m 50 cm)', X => { X.u3_l04.slides[15].data.items[0] = { q: '2 m 70 cm + 1 m 50 cm는 얼마일까요?', a: '4 m 20 cm' }; }, X => errNoCarry(X).er);
red('인물 바꿈(l07 곰이 → 하나)', X => { X.u3_l07.slides[2].data.kids[0].label = '하나\n"골대!"'; }, errPeople);

console.log('\n게이트 g2s2 수학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
