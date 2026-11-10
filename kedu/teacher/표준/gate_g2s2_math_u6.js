/* gate_g2s2_math_u6.js — 2학년 2학기 수학 6단원 「규칙 찾기」 케이티처 2세대 게이트 (교과서판 2단계, 2026-11-10 — gate_g6s2_math_u1 틀 + 지도서 직행 점검).
   옛 게이트(145차 · 자기주도 원문 대조)는 kedu/teacher/archive/neutral/gate_g2s2_math_u6.js 에 보관.
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(prow2·pgd2·nstr2·optab2·ntab2·cubep2·mcal2·spin2·gdot2·beat2·tools) · meta(2학년 2학기 · 6단원 · 차시별 성취기준 지도서 문구 · 40분 · 지도서 쪽 · theme·live_url) · slug g2s2_math
   B 19장 골격 · C 7요소(2학년 = 곰이·펭이 말풍선 + 실사 자리 9종 서로 다름 · 다른 덧과 겹침 0)
   D 복습 계보(l01 = 5단원 데이터 파일의 마지막 차시 출구 — 게이트도 그 파일에서 동적으로 읽어 대조 → l02 … l09 = 직전 출구) · l09 다음 단원 = 수학이랑 함께해요 · 7단원 u7_l01 복습 = 이 단원 l09 출구
   E 정답 다시 셈 — 게이트 자체 규칙 셈기(반복 묶음 · 같은 수씩 · 늘어나는 수 · 도는 방향 · 덧셈·곱셈 · 요일 · 자리 · 몇째)로 기본 27 · 수준별 18 · 출구 27 · 넓히기 9 = 81
   F 식 전수 — 글 속 「… = …」 사슬 다시 셈 · 틀린 생각은 정말 틀림(틀린 말 · 바른 말에 셈 값) · 검산기 자체 확인
   G 그림 — 모양 줄·모양 판은 반복 묶음이 성립(모양·색 따로) · 수 띠·수 배열표 빈칸 = 게이트 셈 · 배열표 방향 간격 = 글 · 덧셈표·곱셈표 칸 = 게이트 셈 · 색칠한 줄 간격 = 글
          · 도는 무늬 방향 일정 = 글 · 쌓기나무 개수 = 꼬리표 · 달력 칠한 날 = 글 · 구슬 개수 늘어남 · 박자 소리·수 = 글 · 문제 그림 「?」 값 = 정답 · 문제 그림이 답을 보이지 않음
   H 재료 충실(개념·문제 = src · 그림 = fig json) · 교과서 수 표(활동목록.md) · 보탬 흡수 대조(옛 TB 20줄의 핵심 낱말·수가 본류 장에 · b_ id 0) · 중복 · src 회수 키
   I 실렌더 · J extras 22 · K 발문 6↑ · 30~45분 · 물음 끝 「요?」 · 지도서 유의 사항이 교사 층에
   L 선행(시계 방향·늘어나 3 · 쌓기나무 4 · 덧셈표 5 · 곱셈표 6 · 달력 7 — 1차시 단원 도입 예외) · M 차단 어휘 · 「결」 0 · 겹낫표 0 · 인물(곰이·펭이만) · 영어 코드 0 · 조사
   R 역검증 레드 — 일부러 망가뜨린 사본(출구 답 · 선행 말 · 보탬 카드 · 복습 계보 · 문제 그림 답 노출 · 조사 · 교과서 수 · 그림 빈칸 값)을 위 검사가 잡는지 8종
   실행: NODE_PATH=<jsdom node_modules> node kedu/teacher/표준/gate_g2s2_math_u6.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ROOT = path.resolve(TDIR, '../..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
const throws = (f) => { try { f(); return false; } catch (e) { return true; } };

function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L0 = load(path.join(TDIR, 'data/g2s2_math_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u6.json'), 'utf8'));
const FIGJ = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/fig_g2s2_math_u6.json'), 'utf8'));
const PREV = load(path.join(TDIR, 'data/g2s2_math_u5.js'));
const PREV_LAST = Object.keys(PREV).sort().pop();
const KEYS = Array.from({ length: 9 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = (o) => JSON.parse(JSON.stringify(o));
const slideText = (s) => clean([s.data.title, s.data.content, s.data.question, s.data.scenario && s.data.scenario.body].filter(Boolean).join(' '));
const S = String;

/* ── 게이트 자체 규칙 셈기 (부품·생성기와 따로 짬) ── */
const CN = { red: '빨간색', yel: '노란색', blu: '파란색', grn: '초록색', sky: '하늘색', lgr: '연두색', pnk: '분홍색', gry: '회색', org: '주황색', pur: '보라색' };
const SN = { sq: '사각형', cir: '원', tri: '삼각형', dia: '◆', clb: '♣', hs: '집' };
const SYM = { cir: '●', dia: '◆' };
const POS4 = ['위', '오른쪽', '아래', '왼쪽'];
const ORD = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째', '열한째', '열둘째'];
const WD = '일월화수목금토';
const eqv = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/* 반복 묶음: 알려진 칸끼리 p 칸 떨어진 값이 모두 같은 가장 작은 p (비교 쌍 1개 이상) */
function period(arr) { for (let p = 1; p < arr.length; p++) { let pairs = 0, good = true; for (let i = p; i < arr.length; i++) { if (arr[i] == null || arr[i - p] == null) continue; pairs++; if (!eqv(arr[i], arr[i - p])) { good = false; break; } } if (good && pairs >= 1) return p; } return 0; }
function fillRep(arr, i) { const p = period(arr); ok(p > 0, '반복 묶음 없음 ' + JSON.stringify(arr)); for (let j = i - p; j >= 0; j -= p) if (arr[j] != null) return arr[j]; for (let j = i + p; j < arr.length; j += p) if (arr[j] != null) return arr[j]; throw new Error('채울 값 없음'); }
const NEXT = (arr) => fillRep(arr.concat([null]), arr.length);
const NTH = (unit, k) => unit[(k - 1) % unit.length];
/* 모양·색처럼 두 요소는 따로 반복 */
const fillCell = (cells, i) => [0, 1].map(a => fillRep(cells.map(c => (c ? c[a] : null)), i));
const nthCell = (cells, k) => [0, 1].map(a => { const col = cells.map(c => c[a]); const p = period(col); return col[(k - 1) % p]; });
const cellName = (c) => CN[c[1]] + ' ' + SN[c[0]];
/* 같은 수씩: 알려진 칸으로 간격을 정해 빈칸 채우기 */
function arDiff(arr) { let d = null; for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) { if (arr[i] == null || arr[j] == null) continue; const dd = (arr[j] - arr[i]) / (j - i); if (d == null) d = dd; else if (dd !== d) return null; } return d; }
function fillAR(arr) { const d = arDiff(arr); ok(d != null && Number.isInteger(d), '같은 수씩 아님 ' + JSON.stringify(arr)); const k = arr.findIndex(x => x != null); const i = arr.indexOf(null); return arr[k] + d * (i - k); }
const NEXTAR = (arr) => fillAR(arr.concat([null]));
function NEXT2(arr) { const d = arr.slice(1).map((x, i) => x - arr[i]); const dd = d.slice(1).map((x, i) => x - d[i]); ok(dd.length && dd.every(x => x === dd[0]), '늘어나는 수 규칙 아님 ' + arr); return arr[arr.length - 1] + d[d.length - 1] + dd[0]; }
function rotStep(n, marks) { const d = marks.slice(1).map((m, i) => ((m - marks[i]) % n + n) % n); ok(d.length && d.every(x => x === d[0]) && d[0] > 0, '도는 간격 일정하지 않음 ' + marks); return d[0]; }
const ROTNEXT = (n, marks) => (marks[marks.length - 1] + rotStep(n, marks)) % n;
const DIRN = (n, marks) => { const d = rotStep(n, marks); return d === 1 ? '시계 방향' : d === n - 1 ? '시계 반대 방향' : '?'; };
const DAYNAME = (first, d) => WD[(first + d - 1) % 7] + '요일';
const ADD = (a, b) => a + b, MUL = (a, b) => a * b;
const rowOf = (g, v) => g.findIndex(r => r.indexOf(v) >= 0), colOf = (g, v) => g[rowOf(g, v)].indexOf(v);
function gridHole(vals, hole) { const [r, c] = hole; const row = vals[r].map((v, j) => (j === c ? null : v)); if (row.filter(x => x != null).length >= 2 && arDiff(row) != null) return fillAR(row); const col = vals.map((rw, i) => (i === r ? null : rw[c])); return fillAR(col); }
const G16 = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];
const LIFT10 = [[5, 10], [4, 9], [3, 8], [2, 7], [1, 6]];
const LIFT4 = [[10, 11, 12], [7, 8, 9], [4, 5, 6], [1, 2, 3]];
const SEAT4 = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
const FLOOR0 = [['tri', 'sky'], ['sq', 'lgr'], ['cir', 'sky'], ['tri', 'lgr'], ['sq', 'sky'], ['cir', 'lgr'], ['tri', 'sky']];
const CK2 = [['tri', 'blu'], ['sq', 'blu'], ['cir', 'grn'], ['tri', 'grn'], ['sq', 'blu'], ['cir', 'blu'], ['tri', 'grn'], null];
const MPIECE = [[25, 30, 35, 40], [30, 36, 42, 48], [35, 42, 49, 56], [40, 48, 56, 64]];
const all = (rh, ch, op, f) => rh.every(a => ch.every(b => f(op(a, b))));
const KUNG = ['쿵', '쿵', '짝'], KUNGN = [4, 4, 1];

const EXP = {
  basic: {
    u6_l01: [S(G16[1][0] - G16[0][0]) + '씩', SYM[NEXT(['cir', 'dia', 'dia', 'cir', 'dia'])], S(gridHole(LIFT10, [2, 1]))],
    u6_l02: [CN[NEXT(['red', 'yel', 'blu', 'red', 'yel'])], S(NEXT([1, 2, 3, 2, 1, 2])), cellName(fillCell(FLOOR0.slice(0, 5).concat([null]), 5))],
    u6_l03: [DIRN(5, [0, 1, 2]), POS4[ROTNEXT(4, [0, 3, 2, 1, 0, 3])], S(NEXTAR([1, 2, 3]))],
    u6_l04: [NEXT(['왼쪽', '위', '오른쪽', '왼쪽']), S(NEXT2([1, 3, 6])), S(NEXTAR([2, 4, 6]))],
    u6_l05: [S(ADD(6, 5)), S(ADD(9, 9)), S(ADD(1, 4) - ADD(0, 3)) + '씩'],
    u6_l06: [S(MUL(4, 5)), S(MUL(9, 7)), S(fillAR([54, 63, null, 81]))],
    u6_l07: [S(NEXTAR([6, 13, 20])), S(Math.abs(LIFT4[1][0] - LIFT4[0][0])) + '씩', ORD[rowOf(SEAT4, 11) + 1] + ' 줄'],
    u6_l08: [cellName(fillCell(CK2, 7)), S(NEXTAR([1, 3, 5])), S(fillAR([9, null, 11, 12]))],
    u6_l09: [S(NEXT([4, 4, 1, 4, 4])), NEXT(['쿵', '타', '리', '쿵']), NTH(['단', '짝', '친', '구'], 10)]
  },
  lev: {
    u6_l01: [S(NEXTAR([1, 3, 5, 7, 9])), S(NEXTAR([1, 6, 11]))], u6_l02: [CN[NEXT(['yel', 'blu', 'red', 'yel', 'blu', 'red', 'yel'])], S(NEXT([1, 2, 3, 2, 1, 2, 3]))],
    u6_l03: [NEXTAR([1, 2]) + '개', ORD[4 + 1]], u6_l04: [NEXTAR([1, 2, 3, 4]) + '개', NEXTAR([6, 5, 4]) + '개'], u6_l05: [S(ADD(5, 4)), S(NEXTAR([3, 5, 7, 9]))],
    u6_l06: [S(MUL(6, 5)), S(NEXTAR([3, 9, 15, 21]))], u6_l07: [S(9 + 7) + '일', DAYNAME(2, 15)], u6_l08: [POS4[ROTNEXT(4, [0, 1, 2])], S(fillAR([30, null, 42, 48]))],
    u6_l09: [S(NEXT([4, 2, 1, 4, 2, 1, 4])), S(NTH([2, 3, 4, 5], 7))]
  },
  exit: {
    u6_l01: [CN[NEXT(['red', 'blu', 'red', 'blu', 'red'])], S(NEXTAR([1, 5, 9])), SYM[NEXT(['cir', 'dia', 'dia', 'cir', 'dia', 'dia', 'cir'])]],
    u6_l02: [CN[NEXT(['red', 'yel', 'blu', 'red', 'yel'])], S(NEXT(['꽃', 2, 3, 2, '꽃', 2, 3])), SN[NEXT(['tri', 'sq', 'cir', 'tri', 'sq'])]],
    u6_l03: [ORD[5 + 1], POS4[ROTNEXT(4, [0, 3, 2])], NEXTAR([2, 3, 4]) + '개'],
    u6_l04: [NEXTAR([2, 4, 6, 8]) + '개', NTH(['왼쪽', '위', '오른쪽'], 4), NEXTAR([3, 4, 5, 6]) + '개'],
    u6_l05: [S(ADD(9, 7)), S(ADD(1, 0) - ADD(0, 0)) + '씩', S(ADD(1, 1) - ADD(0, 0)) + '씩'],
    u6_l06: [S(MUL(5, 4)), S(MUL(3, 2) - MUL(3, 1)) + '씩', all([2, 4, 6, 8], [1, 2, 3, 4, 5, 6, 7, 8, 9], MUL, x => x % 2 === 0) ? '짝수' : '홀수'],
    u6_l07: [S(6 + 7) + '일', S(7 + 1) + '씩', S(NEXTAR([18, 15, 12]))],
    u6_l08: [CN[NEXT(['yel', 'red', 'blu', 'yel', 'red'])], S(fillAR([35, 42, null, 56])), S(fillAR([11, null, null, 14]))],
    u6_l09: [NEXT(['쿵', '쿵', '짝', '쿵', '쿵', '짝', '쿵']), S(NEXT([1, 2, 3, 4, 1, 2])), S(KUNGN[KUNG.indexOf('짝')])]
  },
  adv: {
    u6_l01: S(NEXTAR([1, 11, 21])), u6_l02: cellName(nthCell(FLOOR0, 10)), u6_l03: S(1 + 2 + 3 + 4) + '개', u6_l04: S(NEXT2([1, 3, 6, NEXT2([1, 3, 6])])) + '개',
    u6_l05: S(ADD(7, 8)), u6_l06: S(MUL(5, 3) - MUL(5, 1)) + '씩', u6_l07: ORD[colOf(SEAT4, 18) + 1], u6_l08: S(fillAR([40, 48, 56, null])),
    u6_l09: S(Array.from({ length: 12 }, (_, i) => NTH(KUNG, i + 1)).filter(x => x === '쿵').length) + '번'
  }
};
/* 지도서 차시 이름 · 쪽 · 성취기준(300쪽 수업의 흐름 표) */
const TITLE = { u6_l01: '규칙 찾기', u6_l02: '무늬에서 규칙을 찾아볼까요 ⑴', u6_l03: '무늬에서 규칙을 찾아볼까요 ⑵', u6_l04: '쌓은 모양에서 규칙을 찾아볼까요', u6_l05: '덧셈표에서 규칙을 찾아볼까요', u6_l06: '곱셈표에서 규칙을 찾아볼까요', u6_l07: '생활에서 규칙을 찾아볼까요', u6_l08: '수학이랑 확인해요', u6_l09: '수학이랑 만들어요' };
const PAGES = { u6_l01: '306~309', u6_l02: '310~311', u6_l03: '312~313', u6_l04: '314~315', u6_l05: '316~317', u6_l06: '318~319', u6_l07: '320~321', u6_l08: '322~323', u6_l09: '324~325' };
const STDS = { a: '[2수02-01] 물체, 무늬, 수 등의 배열에서 규칙을 찾아 여러 가지 방법으로 표현할 수 있다.', b: '[2수02-02] 자신이 정한 규칙에 따라 물체, 무늬, 수 등을 배열할 수 있다.' };
const STD_OF = (n) => (n === 1 || n === 7 ? STDS.a : STDS.a + ' · ' + STDS.b);
/* 교과서 수 표 — 활동목록.md(지도서 296~325쪽 정독)의 차시별 교과서·익힘·확인해요 수·장면 낱말. 그 차시 데이터에 있어야 한다 */
const TB = {
  u6_l01: ['수학 체험관', '포장지', '◆, ♣', '칠하는 판', '바닥 매트', '12월 달력', '1씩', '4씩', '5씩', '●◆◆', '●●◆◆', '2씩', '10씩', '12씩', '8씩', '승강기', '우측통행'],
  u6_l02: ['벽의 무늬', '빨간색, 노란색, 파란색', '↙ 방향', '받침대', '꽃, 2, 3, 2', '1, 2, 3, 2', '삼각형, 사각형, 원', '하늘색, 연두색', '2가지 색', '초록 □, 파랑 ○', '꽃 8송이', '꽃잎마다'],
  u6_l03: ['종이 팔찌', '5칸', '시계 방향', '여섯째', '집 모양', '위, 왼쪽, 아래, 오른쪽', '시계 반대 방향', '회오리 모빌', '빨1, 파1, 빨2, 파2, 빨3, 파3', '1개씩', '시작점', '포장지', '수학익힘 87쪽'],
  u6_l04: ['성벽', '빨간 쌓기나무를 기준으로', '왼쪽, 위, 오른쪽', '1개, 3개, 6개', '1층에서 오른쪽으로 2층, 3층', '2개씩 늘어나고 있으니까', '순서를 바꿔', '1층에 있는 3개', '맨 왼쪽 쌓기나무 위에', '3개, 4개, 5개', '6개'],
  u6_l05: ['비어 있는 부분이 있네', '2 + 4 = 6', '2 + 5 = 7', '3 + 6 = 9', '3 + 7 = 10', '6 + 5 = 11', '9 + 9 = 18', '1씩', '2씩', '규칙으로 찾은 수와 덧셈으로 찾은 수가 같을까', '1, 3, 5, 7, 9', '0, 2, 4, 6, 8', '2, 4, 6, 8', '↙ 방향', '수학익힘 91쪽'],
  u6_l06: ['출구 번호', '4, 8, 12', '4 × 4 = 16', '5 × 5 = 25', '6 × 4 = 24', '9 × 7 = 63', '3씩', '8씩', '짝수', '홀수', '왜 홀수만', '↘ 방향으로 접으면', '54', '63', '72', '81'],
  u6_l07: ['바닥무늬', '3개씩', '12월', '화요일', '6일, 13일, 20일, 27일', '7일마다', '1씩', '7씩', '6씩', '8씩', '8 + 16 = 9 + 15', '승강기', '3씩', '옷 무늬', '3가지', '연두색 삼각형', '회색 삼각형', '가 구역', '나 구역', '다 구역', '18번', '4씩 커지는'],
  u6_l08: ['노란색, 빨간색, 파란색', '파랑, 파랑, 초록, 초록', '초록색 사각형', '위, 오른쪽, 아래, 왼쪽', '1개, 3개, 5개', '1 큰 수', '1 작은 수', '25, 30, 35, 40', '36', '49', '64', '목걸이', '구슬', '세모', '달', '난 이렇게 만들었어', '길바닥', '↗, ↘'],
  u6_l09: ['쿵 쿵 짝', '4 4 1', '쿵 타 리', '4 2 1', '단 짝 친 구', '1 2 3 4', '손 우 리 짝', '2 3 4 5', '동작 1~5', '2~3번']
};
/* 옛 보탬 표 TB(archive/neutral/gen_g2s2_math_u6.js) 20줄 — 각 줄의 핵심 낱말·수가 본류 장(extras 아님)에 있어야 한다 */
const TBA = {
  u6_l01: [['수학 체험관 그림 속 규칙', ['포장지', '칠하는 판', '바닥 매트', '12월 달력', '신발장', '한옥']], ['알고 있어요 — ●◆ 규칙과 1, 3, 5 … 수 배열표', ['●◆●◆', '◆●◆●', '●●◆◆', '12씩', '8씩', '자기 말로']], ['단원 실천 활동 — 생활 속에서 규칙을 함께 찾아봐요', ['건물', '승강기', '우측통행', '색칠해', '수학익힘 96쪽', '포스터']]],
  u6_l02: [['받침대 무늬를 숫자로 — 꽃, 2, 3, 2', ['1, 2, 3, 2', '↙ 방향', '다른 모양', '직접 숫자를 써서']], ['바닥 무늬 꾸미기와 꽃 색칠하기', ['하늘색, 연두색', '2가지 색', '꽃 8송이', '꽃잎마다', '방향 그림']]],
  u6_l03: [['집 모양 지붕 — 빈칸 두 칸과 반대 방향', ['시계 반대 방향', '붙임딱지', '반대 방향으로 돈다면', '시계 방향 그림']], ['회오리 모빌 시작점 · 포장지 꾸미기', ['시작점', '빨1, 파1, 빨2', '학생 관점', '모빌', '포장지']]],
  u6_l04: [['성벽 사진 · 빨간 쌓기나무 기준 · 1개, 3개, 6개', ['성벽', '빨간 쌓기나무를 기준으로', '왼쪽, 위, 오른쪽', '1개, 3개, 6개', '단계마다 모두 쌓아']], ['쌓기나무 규칙 만들기 놀이 — 순서를 바꿔', ['2개씩 늘어나고 있으니까', '순서를 바꿔', '다른 관점', '맨 왼쪽 쌓기나무 위에', '3개, 4개, 5개']]],
  u6_l05: [['수학 활동지 0~9 덧셈표 — 파란 줄 · 분홍 줄', ['2 + 4 = 6', '9 + 9 = 18', '1씩', '2씩', '규칙으로 찾은 수와 덧셈으로 찾은 수가 같을까', '개인 → 모둠 → 전체', '규칙을 많이 찾는']], ['다른 덧셈표 · 나만의 덧셈표', ['1, 3, 5, 7, 9', '0, 2, 4, 6, 8', '↙ 방향', '친구와 바꾸어', '1씩 커지는 수 4개', '수학익힘 91쪽']]],
  u6_l06: [['출구 번호 찾기 · 1~9 곱셈표 — 파란 3단 · 분홍 8', ['출구 번호', '4, 8, 12', '3씩', '8씩', '짝수', '6씩, 7씩']], ['홀수 곱셈표와 계단 조각', ['1, 3, 5, 7, 9', '홀수', '왜 홀수만', '↘ 방향으로 접으면', '54', '63', '72']]],
  u6_l07: [['교과서 12월 달력 — 1일은 화요일', ['12월', '화요일', '7일마다', '7씩', '6씩', '8씩', '8 + 16 = 9 + 15', '직사각형']], ['주변에서 또 다른 규칙 — 승강기 · 옷 · 벽', ['승강기', '3씩', '옷 무늬', '3가지', '연두색 삼각형', '회색 삼각형', '3개씩']], ['공연장 의자 — 하라는 다 구역 18번', ['가 구역', '나 구역', '다 구역', '18번', '4씩 커지는', '다섯 번째', '두 번째']]],
  u6_l08: [['확인해요 문항과 지도서 오답 유형', ['파란색', '초록색 사각형', '시계 방향', '1개, 3개, 5개', '1 큰 수', '1 작은 수', '36', '49', '64']], ['목걸이 만들기 · 수학이랑 확인해요 · 자기 평가', ['목걸이', '구슬', '세모', '달', '난 이렇게', '길바닥', '↗, ↘', '아름다움']]],
  u6_l09: [['짝과 함께 — 단 짝 친 구', ['단 짝 친 구', '1 2 3 4', '손 우 리 짝', '2 3 4 5', '4 4 1', '쿵 타 리', '4 2 1', '평가하는 시간이 아님']], ['이런 활동도 — 나만의 악기와 리듬', ['악기', '리듬', '연주', '조화로운']]]
};
/* 틀린 생각 — 틀린 말은 정말 틀리고, 바른 생각에 셈 값이 있다 */
const WRONG = { u6_l01: ['●◆◆만 맞는 규칙', '●◆●◆'], u6_l02: ['↘ 방향', '↙ 방향'], u6_l03: ['오른쪽, 아래', POS4[ROTNEXT(4, [0, 3, 2, 1, 0, 3])] + '**, 여덟째는 **' + POS4[ROTNEXT(4, [0, 3, 2, 1, 0, 3, 2])]], u6_l04: ['9개', S(NEXT2([1, 3, 6])) + '개'], u6_l05: ['곱하거나', '5 + 3 = ' + ADD(5, 3)], u6_l06: ['1씩', S(MUL(3, 2) - MUL(3, 1)) + '씩'], u6_l07: ['1씩', '6일 아래는 **' + (6 + 7) + '일'], u6_l08: ['파란색 사각형', cellName(fillCell(CK2, 7))], u6_l09: ['틀린 규칙', '한 묶음'] };
/* 「?」 없이 한 묶음만 보여 주고 몇째를 세게 하는 문제 — 묶음 안의 것이 보여야 풀 수 있음(정답이 「다음 칸」이 아님) */
const LEAK_OK = { 'u6_l09 s11': '단 짝 친 구 한 묶음을 보고 열째 소리를 셈' };
const FIRST = [['시계 방향', 3], ['늘어나', 3], ['쌓기나무', 4], ['덧셈표', 5], ['곱셈표', 6], ['달력', 7]];

/* ── 검사 함수 (역검증에서 망가뜨린 사본에도 다시 쓴다) ── */
function want(d, exp) {
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); ok(new Set(d.options.map(o => clean(o.text))).size === d.options.length, '보기 겹침'); }
  else { ok(d.input === 'count_input' && String(d.answer) === String(exp), '답 ' + d.answer + ' ≠ 셈 ' + exp); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), '풀이 끝 = 답'); }
}
function checkAnswers(Ls, k) { let n = 0; const sl = Ls[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, EXP.basic[k][i]); } catch (e) { throw new Error(s.id + ' ' + e.message); } n++; });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === EXP.lev[k][i], t + ' ' + lv[t].a + ' ≠ ' + EXP.lev[k][i]); ok(lv[t].steps.length >= 3 && nsp(lv[t].steps[lv[t].steps.length - 1]) === nsp(lv[t].a), t + ' 풀이 단계·끝'); n++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === EXP.exit[k][i], '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXP.exit[k][i]); n++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === EXP.adv[k], '넓히기 끝 ' + last + ' ≠ ' + EXP.adv[k]); n++;
  return n; }
function checkLineage(Ls, k, i) { const rv = Ls[k].slides[1].data;
  if (!i) { const pe = PREV[PREV_LAST].slides.find(s => s.block === 'exit_ticket').data.items; ok(rv.from === 'g2s2_math:' + PREV_LAST && SAME(rv.items.map(x => [x.q, x.a]), pe.map(x => [x.q, x.a])), 'l01 복습 = 5단원 ' + PREV_LAST + ' 출구'); ok(/지난 단원/.test(rv.title) && /표와 그래프/.test(rv.content), 'l01 복습 글'); return; }
  const ex = Ls[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }
const dataStrings = (Ls, k, opt) => { const out = []; (function walk(o, where) { if (typeof o === 'string') out.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (opt && opt.skip && opt.skip[x]) return; walk(o[x], where + '.' + x); }); })(opt && opt.slidesOnly ? Ls[k].slides : Ls[k], k); return out; };
const teach = (Ls, k) => JSON.stringify(Ls[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null, options: null }))) + JSON.stringify(Ls[k].extras);
function checkFirst(Ls) { KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(Ls, k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }); }
function checkExtras(Ls, k) { const ex = Ls[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복'); ok(!ids.some(x => /^b_l/.test(x)) && !ex.some(e => e.type === 'other_activity'), '보탬 카드(b_ · other_activity) 남음');
  const cnt = {}; ex.forEach(e => { cnt[e.type] = (cnt[e.type] || 0) + 1; }); ok(SAME(cnt, { video: 1, fun_question: 5, tip: 5, real_world: 3, game: 2, misconception: 2, example: 3, checklist: 1 }), JSON.stringify(cnt));
  Ls[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }
function checkTB(Ls, k) { const a = nsp(JSON.stringify(Ls[k])); const miss = TB[k].filter(t => a.indexOf(nsp(t)) < 0); ok(!miss.length, '없음 ' + miss.join(' / ')); }
/* 조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요 (마지막 숫자의 읽는 소리 받침) */
function finalOf(wd) { const d = +String(wd).slice(-1); return d === 0 ? 1 : [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; const t = String(s).replace(/\*\*/g, ''); const re = /(?<![\d,])(\d+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g; let m; while ((m = re.exec(t))) { const f = finalOf(m[1]); if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }
function checkJosa(Ls) { const bad = []; KEYS.forEach(k => { dataStrings(Ls, k, { skip: { options: 1, fig: 1, url: 1, id: 1, img: 1, live_url: 1, source: 1 } }).forEach(([s, wh]) => josa(s).forEach(b => bad.push(wh + ' 「' + b + '」'))); }); ok(!bad.length, bad.slice(0, 5).join(' | ')); }

console.log('═══ A. 로드 ═══');
T('9차시 키 u6_l01~l09 · 파일 data/g2s2_math_u6.js', () => ok(SAME(Object.keys(L0).sort(), KEYS), Object.keys(L0).join(',')));
T('meta: 2학년 2학기 수학 · 6단원 규칙 찾기 · 성취기준 지도서 문구(차시별) · 40분 · 지도서 쪽 · theme · live_url 원문 실재 · n', () => KEYS.forEach((k, i) => { const m = L0[k].meta; ok(m.grade === 2 && m.term === 2 && m.unit === 6 && m.subject === '수학' && m.unit_title === '규칙 찾기' && m.n === i + 1, k); ok(m.std === STD_OF(i + 1), k + ' 성취기준 ' + m.std); ok(!/임시/.test(m.std), k + ' 임시'); ok(m.duration_min === 40, k + ' 40분'); ok(m.source.indexOf('지도서 6단원(지도서 ' + PAGES[k]) >= 0, k + ' 지도서 쪽 ' + m.source); ok(m.src_key === k, k + ' src_key'); ok(m.theme === '곰이·펭이 수학 체험관', k + ' theme'); ok(fs.existsSync(path.resolve(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));
T('차시 제목 = 지도서 차시 이름 · 합계 360분', () => { KEYS.forEach(k => ok(L0[k].meta.title.indexOf(TITLE[k]) === 0, k + ' ' + L0[k].meta.title)); ok(KEYS.reduce((a, k) => a + L0[k].meta.duration_min, 0) === 360, '분'); });
T('slug — KT2.slugOf({g:2,s:math,t:2}) = g2s2_math · 2학년 = tier-mid', () => { ok(KT2.slugOf({ g: 2, s: 'math', t: '2' }) === 'g2s2_math', 'slug'); ok(/g <= 4 \? 'mid' : 'high'/.test(fs.readFileSync(path.join(S2, 'stage2.js'), 'utf8')), 'tier 규칙'); });
T('그림 부품 prow2·pgd2·nstr2·optab2·ntab2·cubep2·mcal2·spin2·gdot2·beat2·tools 등록 · 렌더 깨짐 0', () => { [{ k: 'prow2', cells: [['sq', 'red'], null] }, { k: 'pgd2', rows: [[['sq', 'red']]] }, { k: 'nstr2', vals: [1, null] }, { k: 'optab2', op: 'x', rh: [1, 2], ch: [3, 4] }, { k: 'ntab2', vals: [[1, 2]] }, { k: 'cubep2', steps: [[[0, 0, 'yel']]], nums: ['1개'] }, { k: 'mcal2', first: 2, days: 31 }, { k: 'spin2', n: 4, marks: [0, 1] }, { k: 'gdot2', cells: [['red', 1]] }, { k: 'beat2', cells: [['쿵', 4], null] }, { k: 'tools', items: [{ emoji: '⚪', name: 'a', kind: 'b' }] }].forEach(f => { ok(FIG.parts.indexOf(f.k) >= 0, f.k + ' 미등록'); const h = FIG.render(f); ok(h && h.length > 60 && !/NaN|undefined/.test(h), f.k); }); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L0[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));
T('전체 171장 (9 × 19)', () => ok(KEYS.reduce((a, k) => a + L0[k].slides.length, 0) === 171, '장 수'));

console.log('═══ C. 7요소 (2학년 = 곰이·펭이 말풍선 + 실사 자리) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 곰이·펭이', () => { const sl = L0[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); const mo = sl[2].data;
  ok(mo.kids && mo.kids.length === 2 && mo.kids[0].face === '🐻' && /^곰이\n"/.test(mo.kids[0].label) && mo.kids[1].face === '🐧' && /^펭이\n"/.test(mo.kids[1].label) && mo.question, '③장면·물음 + 곰이·펭이');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length >= 4 && s.data.solo && s.data.solo.length >= 2 && ['group', 'pair', 'whole'].indexOf(s.data.type) >= 0), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(mo.img), '실사 자리 이름 ' + mo.img); }));
T('실사 자리 9종 서로 다름 · 다른 덱(data 전체)과 겹침 0', () => { const im = KEYS.map(k => L0[k].slides[2].data.img); ok(new Set(im).size === 9, im.join(',')); const other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g\d(s\d)?_[a-z]+_u\d+\.js$/.test(f) && f !== 'g2s2_math_u6.js').forEach(f => { try { Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => { if (s.data && s.data.img) other.push(s.data.img); })); } catch (e) { /* 다른 꼴 파일 */ } }); ok(other.length >= 300, '다른 덱 실사 ' + other.length); ok(!im.some(x => other.indexOf(x) >= 0), '겹침 ' + im.filter(x => other.indexOf(x) >= 0)); });
T('교실 활동 장 — goal 45자 안팎 · steps 4개 각 50자 안팎 · solo 3개(넘침 미리 피하기)', () => KEYS.forEach(k => { const d = L0[k].slides[12].data; ok(d.goal.length <= 45, k + ' goal ' + d.goal.length); ok(d.steps.length === 4 && d.steps.every(x => x.length <= 50), k + ' steps ' + d.steps.map(x => x.length)); ok(d.solo.length === 3, k + ' solo'); }));

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '5단원 마지막 g2s2_math ' + PREV_LAST + ' 출구(동적)'), () => checkLineage(L0, k, i)));
T('마지막 차시 「다음 단원엔」 = 수학이랑 함께해요 · 다른 차시는 「다음 시간엔」 + 다음 차시 이름', () => { const nx = L0.u6_l09.slides[18].data; ok(nx.title === '다음 단원엔' && /수학이랑 함께해요/.test(nx.preview), nx.preview); KEYS.slice(0, -1).forEach((k, i) => { const d = L0[k].slides[18].data; ok(d.title === '다음 시간엔', k); ok(d.preview.indexOf(TITLE[KEYS[i + 1]]) === 0, k + ' 예고 ' + d.preview); }); });
T('7단원 이음 — g2s2_math_u7 u7_l01 복습 = 이 단원 u6_l09 출구(그 생성기가 vm 으로 읽음)', () => { const U7 = load(path.join(TDIR, 'data/g2s2_math_u7.js')); const rv = U7.u7_l01.slides[1].data; ok(rv.from === 'g2s2_math:u6_l09', 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), L0.u6_l09.slides[15].data.items.map(x => [x.q, x.a])), 'u7_l01 복습이 옛 출구 — gen_g2s2_math_u7 다시 돌릴 것'); });

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기 = 게이트 셈', () => { nCheck += checkAnswers(L0, k); }));
T('다시 셈한 정답 = 81', () => ok(nCheck === 81, nCheck));
T('셈기 자체 확인 — 반복 묶음(모양·색 따로) · 같은 수씩 · 늘어나는 수 · 도는 방향 · 요일 · 몇째 · 틀린 답 잡음', () => {
  ok(NEXT([1, 2, 3, 2, 1, 2]) === 3 && NEXT(['쿵', '타', '리', '쿵']) === '타' && period([1, 1, 2, 1, 1, 2]) === 3, '반복'); ok(cellName(fillCell(CK2, 7)) === '초록색 사각형' && cellName(nthCell(FLOOR0, 10)) === '연두색 삼각형', '모양·색 따로');
  ok(NEXTAR([2, 4, 6]) === 8 && fillAR([54, 63, null, 81]) === 72 && NEXT2([1, 3, 6]) === 10 && NEXT2([1, 3, 6, 10]) === 15, '수'); ok(DIRN(4, [0, 3, 2, 1]) === '시계 반대 방향' && DIRN(5, [0, 1, 2]) === '시계 방향' && POS4[ROTNEXT(4, [0, 3, 2])] === '오른쪽', '돌기');
  ok(DAYNAME(2, 15) === '화요일' && DAYNAME(2, 6) === '일요일' && ORD[rowOf(SEAT4, 18) + 1] === '다섯째' && ORD[colOf(SEAT4, 18) + 1] === '둘째', '요일·자리'); ok(throws(() => NEXTAR([1, 3, 6])) && throws(() => rotStep(4, [0, 1, 3])), '규칙 없는 것 잡음');
  let c = 0; [() => want({ options: [{ text: '파란색 사각형', correct: true }, { text: '초록색 사각형' }] }, cellName(fillCell(CK2, 7))), () => want({ input: 'count_input', answer: 9, note: '**9**' }, S(NEXT2([1, 3, 6]))), () => want({ options: [{ text: '오른쪽', correct: true }, { text: '아래' }] }, POS4[ROTNEXT(4, [0, 3, 2, 1, 0, 3])])].forEach(f => { if (throws(f)) c++; }); ok(c === 3, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 식 전수 ═══');
const EQ = /\d[\d \t+\-−×]*=[\d \t+\-−×=]*\d/g;
function evI(e) { const t = String(e).replace(/[−]/g, '-').replace(/×/g, '*').replace(/\s+/g, ''); ok(/^[\d+\-*]+$/.test(t), '식 글자 ' + e); return t.split(/(?=[+-])/).reduce((a, term) => { const sg = term[0] === '-' ? -1 : 1; const v = term.replace(/^[+-]/, '').split('*').reduce((p, x) => p * +x, 1); return a + sg * v; }, 0); }
const chainOK = (e) => { const p = String(e).split('=').map(x => x.trim()).filter(Boolean); const v = p.map(evI); return v.every(x => x === v[0]); };
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { const t = m[0].trim(); if (!/[+\-−×]/.test(t)) continue; nEq++; try { if (!chainOK(t)) badEq.push(where + ' 「' + t + '」'); } catch (e) { badEq.push(where + ' 못 읽음 「' + t + '」'); } } }
KEYS.forEach(k => dataStrings(L0, k, { slidesOnly: true, skip: { fig: 1 } }).forEach(([s, where]) => { if (/\.wrong$|\.watch$|\.ask\.\d$/.test(where)) return; eqText(s, where); }));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 20', () => ok(!badEq.length && nEq >= 20, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('틀린 생각은 정말 틀림 — 틀린 말이 틀린 생각에 · 바른 생각에 셈 값', () => KEYS.forEach(k => { const d = L0[k].slides[7].data, [bad, good] = WRONG[k]; ok(d.wrong.indexOf(bad) >= 0, k + ' 틀린 생각에 「' + bad + '」 없음'); ok(d.right.indexOf(good) >= 0, k + ' 바른 생각에 「' + good + '」 없음'); }));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['8 + 16 = 9 + 16', '6 × 4 = 25', '1 + 2 + 3 + 4 = 9'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('9 × 7 = 63', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s, k]); }));
const nG = {};
const attr = (d, sel, a) => { const e = d.querySelector(sel); ok(e, sel + ' 없음'); return e.getAttribute(a); };
const hasHole = (f) => (f.cells || f.vals || []).some(x => x === null) || (f.holes || []).length > 0;
function checkFig(w0, f, prob, tx) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더'); const d = docOf(h); nG[f.k] = (nG[f.k] || 0) + 1;
  if (f.lab && prob) ok(true, '');
  if (f.k === 'prow2' || f.k === 'beat2') { const cs = f.cells, key = (c) => (c ? c[0] + ':' + c[1] : '?'); ok(attr(d, '.fig-' + f.k, f.k === 'prow2' ? 'data-prow' : 'data-beat') === cs.map(key).join(','), w0 + ' 칸');
    const holes = cs.map((c, i) => (c ? -1 : i)).filter(i => i >= 0);
    if (!holes.length) { if (!prob) [0, 1].forEach(a => ok(period(cs.map(c => c[a])) > 0, w0 + ' 반복 묶음 없음')); else ok(LEAK_OK[w0.split(' ').slice(0, 2).join(' ')], w0 + ' 「?」 없는 문제 줄'); if (f.k === 'beat2' && !prob) cs.forEach(c => { ok(tx.indexOf(c[0]) >= 0 && tx.indexOf(String(c[1])) >= 0, w0 + ' 박자 ' + c + ' 이 글에 없음'); }); return []; }
    ok(prob && holes.length === 1, w0 + ' 「?」는 문제 그림에 하나'); const v = fillCell(cs, holes[0]); return f.k === 'prow2' ? [cellName(v), CN[v[1]], SN[v[0]], SYM[v[0]]] : [v[0], String(v[1])]; }
  if (f.k === 'pgd2') { ok(attr(d, '.fig-pgd2', 'data-pgrid') === f.rows.map(r => r.map(c => c[0] + ':' + c[1]).join(',')).join('|'), w0 + ' 칸'); f.rows.forEach((r, i) => [0, 1].forEach(a => ok(period(r.map(c => c[a])) > 0, w0 + ' ' + (i + 1) + '째 줄 반복 묶음 없음'))); return []; }
  if (f.k === 'nstr2') { ok(attr(d, '.fig-nstr2', 'data-nstrip') === f.vals.map(v => (v == null ? '?' : v)).join(','), w0 + ' 칸'); const i = f.vals.indexOf(null); if (i < 0) return []; ok(prob, w0 + ' 「?」는 문제 그림에만'); const v = arDiff(f.vals) != null ? fillAR(f.vals) : fillRep(f.vals, i); return [String(v)]; }
  if (f.k === 'ntab2') { const vs = f.vals, holes = f.holes || [], isH = (r, c) => holes.some(x => x[0] === r && x[1] === c); ok(attr(d, '.fig-ntab2', 'data-numtab') === vs.map((row, r) => row.map((v, c) => (isH(r, c) ? '?' : v)).join(',')).join(';'), w0 + ' 칸');
    const rowD = vs.map(r => arDiff(r)), colD = vs[0].map((_, c) => arDiff(vs.map(r => r[c])));
    if (!prob && vs.length > 1 && vs[0].length > 1 && rowD.every(x => x != null && x === rowD[0]) && colD.every(x => x != null && x === colD[0])) [rowD[0], colD[0]].forEach(dd => ok(tx.indexOf(Math.abs(dd) + '씩') >= 0, w0 + ' 배열표 간격 ' + dd + ' 이 글에 없음'));
    else if (!prob && rowD.every(x => x != null)) new Set(rowD.map(Math.abs)).forEach(dd => ok(tx.indexOf(dd + '씩') >= 0, w0 + ' 줄 간격 ' + dd + ' 이 글에 없음'));
    else if (!prob) vs.forEach((r, i) => ok(period(r) > 0 && (i === 0 || SAME(r.slice(0, -1), vs[i - 1].slice(1))), w0 + ' 받침대 줄 밀림'));
    if ((f.band || []).length) { const bv = f.band.map(([r, c]) => vs[r][c]); const dd = arDiff(bv); if (dd) ok(tx.indexOf(Math.abs(dd) + '씩') >= 0, w0 + ' 칠한 칸 간격 ' + dd); else ok(bv.every(x => x === bv[0]) && tx.indexOf(String(bv[0])) >= 0, w0 + ' 칠한 칸'); }
    if (!holes.length) return []; ok(prob && holes.length === 1, w0 + ' 「?」는 문제 그림에 하나'); return [String(gridHole(vs, holes[0]))]; }
  if (f.k === 'optab2') { const op = f.op === 'x' ? MUL : ADD, holes = f.holes || [], isH = (r, c) => holes.some(x => x[0] === r && x[1] === c); const dat = attr(d, '.fig-optab2', 'data-optab').split('|'); ok(dat[0] === (f.op === 'x' ? 'x' : '+') && dat[3] === f.rh.map((a, r) => f.ch.map((b, c) => (isH(r, c) ? '?' : op(a, b))).join(',')).join(';'), w0 + ' 표 칸 ≠ 게이트 셈');
    (f.bands || []).forEach(([cells]) => { const bv = cells.map(([r, c]) => op(f.rh[r], f.ch[c])); const dd = arDiff(bv); if (dd == null) { ok(SAME(f.rh, f.ch) && cells.every(([r, c]) => r === c) && /접/.test(tx), w0 + ' 칠한 줄 같은 수씩 아님(접는 선도 아님)'); return; } if (!prob) ok(dd === 0 ? /같/.test(tx) : tx.indexOf(Math.abs(dd) + '씩') >= 0, w0 + ' 칠한 줄 간격 ' + dd + ' 이 글에 없음'); });
    if (!prob && f.op === 'x' && f.rh.every(a => a % 2) && f.ch.every(b => b % 2)) ok(/홀수/.test(tx), w0 + ' 홀수 곱셈표');
    if (!prob && SAME(f.rh, f.ch)) ok(/같/.test(tx) || !(f.bands || []).length, w0 + ' 접으면 같은 수');
    if (!holes.length) return []; if (!prob) { holes.forEach(([r, c]) => { const v = op(f.rh[r], f.ch[c]); ok(tx.indexOf(String(v)) >= 0 || /빈칸/.test(tx), w0 + ' 빈칸 ' + v); }); return []; } ok(holes.length === 1, w0 + ' 문제 「?」 하나'); return [String(op(f.rh[holes[0][0]], f.ch[holes[0][1]]))]; }
  if (f.k === 'spin2') { ok(attr(d, '.fig-spin2', 'data-spin').split('|').slice(0, 2).join('|') === f.n + '|' + f.marks.join(','), w0 + ' 칸'); const dn = DIRN(f.n, f.marks); ok(dn !== '?' && (f.dir === 'cw') === (dn === '시계 방향'), w0 + ' 도는 방향 ' + dn + ' ≠ ' + f.dir); if (!prob) ok(tx.indexOf(dn) >= 0, w0 + ' 방향 「' + dn + '」 이 글에 없음'); return []; }
  if (f.k === 'cubep2') { const cnt = f.steps.map(s => s.length); ok(attr(d, '.fig-cubep2', 'data-cubep') === cnt.join(','), w0 + ' 개수'); (f.nums || []).forEach((lb, i) => { if (/개$/.test(lb)) ok(+lb.replace('개', '') === cnt[i], w0 + ' 꼬리표 ' + lb + ' ≠ ' + cnt[i]); }); ok(arDiff(cnt) != null || throws(() => NEXT2(cnt)) === false, w0 + ' 개수 규칙'); f.steps.forEach(st => st.forEach(c => ok(c[0] === 0 || st.some(b => b[1] === c[1] && b[0] === c[0] - 1), w0 + ' 떠 있는 쌓기나무'))); if (!prob && (f.nums || []).every(x => /개$/.test(x))) cnt.forEach(c => ok(tx.indexOf(c + '개') >= 0, w0 + ' ' + c + '개 이 글에 없음')); return []; }
  if (f.k === 'mcal2') { ok(attr(d, '.fig-mcal2', 'data-mcal') === f.first + '|' + f.days + '|' + (f.holes || []).join(',') + '|' + (f.band || []).join(','), w0 + ' 칸'); if (!prob) (f.band || []).forEach(x => ok(tx.indexOf(String(x)) >= 0, w0 + ' 칠한 날 ' + x + ' 이 글에 없음')); if (!prob && /1일은/.test(tx)) ok(tx.indexOf('1일은 ' + DAYNAME(f.first, 1)) >= 0, w0 + ' 1일 요일');
    if (!(f.holes || []).length) return []; ok(prob && f.holes.length === 1, w0 + ' 「?」 하나'); if ((f.band || []).length >= 2) ok(NEXTAR(f.band) === f.holes[0] && DAYNAME(f.first, f.holes[0]) === DAYNAME(f.first, f.band[0]), w0 + ' 빈칸 날 ≠ 같은 요일 다음'); return [String(f.holes[0])]; }
  if (f.k === 'gdot2') { ok(attr(d, '.fig-gdot2', 'data-grow') === f.cells.map(c => c[0] + ':' + c[1]).join(','), w0 + ' 칸'); const byC = {}; f.cells.forEach(c => (byC[c[0]] = byC[c[0]] || []).push(c[1])); Object.keys(byC).forEach(c => ok(arDiff(byC[c]) != null, w0 + ' ' + c + ' 개수 규칙')); return []; }
  if (f.k === 'tools') { if (!prob) f.items.forEach(it => ok(tx.indexOf(it.name) >= 0, w0 + ' 카드 ' + it.name + ' 이 글에 없음')); return []; }
  ok(0, w0 + ' 모르는 부품 ' + f.k); return [];
}
const ansOf = (d) => (d.options ? clean(d.options.find(o => o.correct).text) : String(d.answer));
function checkFigs(Ls) { let ask = 0; KEYS.forEach(k => Ls[k].slides.forEach(s => { const f = s.data.fig; if (!f) return; const prob = s.block === 'basic_problem'; const ws = checkFig(k + ' ' + s.id + ' ' + f.k, f, prob, slideText(s)); if (prob && ws.length) { ask++; ok(ws.indexOf(ansOf(s.data)) >= 0, k + ' ' + s.id + ' 그림 「?」 값 ' + ws[0] + ' ≠ 답 ' + ansOf(s.data)); } })); return ask; }
let nAsk = 0;
T('그림 ' + figs.length + '개 — 반복 묶음 · 칸 값 · 간격 · 방향 · 개수 · 칠한 날 · 박자 = 게이트 셈·글 · 문제 그림 「?」 값 = 정답', () => { nAsk = checkFigs(L0); });
function checkNoLeak(Ls) { KEYS.forEach(k => Ls[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, A = ansOf(d), f = d.fig; const txt = docOf(FIG.render(f).replace(/></g, '> <')).body.textContent;
  if (f.lab) ok(f.lab.indexOf(A) < 0, k + ' ' + s.id + ' 꼬리표에 정답');
  if (/\?/.test(d.question.replace(/\?\s*$/, ''))) ok(hasHole(f) && (txt.match(/\?/g) || []).length === 1, k + ' ' + s.id + ' 물음에 「?」 — 그림에도 「?」 하나');
  if (hasHole(f)) return; /* 「?」 자리 값 = 정답은 G 에서 대조 · 반복 무늬라 다른 칸에 같은 것이 보이는 것은 규칙 그 자체 */
  if (LEAK_OK[k + ' ' + s.id]) return;
  if (/^\d+$/.test(A)) ok((txt.match(/\d+/g) || []).indexOf(A) < 0, k + ' ' + s.id + ' 그림에 정답 ' + A);
  else ok(nsp(txt).indexOf(nsp(A)) < 0, k + ' ' + s.id + ' 그림에 정답 ' + A); })); }
T('문제 그림이 답을 보이지 않음 — 「?」 자리 · 그림 글자·꼬리표에 정답 0', () => checkNoLeak(L0));
T('개념 36장 · 기본 문제 27장 모두 그림 · 문제 그림 「?」 대조 ≥ 12 · 부품 갈래 ≥ 10', () => { let c = 0, p = 0; KEYS.forEach(k => L0[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem') { ok(s.data.fig, k + ' ' + s.id); p++; } })); ok(c === 36 && p === 27, c + '/' + p); ok(nAsk >= 12 && Object.keys(nG).length >= 10, nAsk + ' ' + JSON.stringify(nG)); });
T('그림 검사기 자체 확인 — 반복 깨짐 · 표 칸 · 방향 · 꼬리표 · 빈칸 날 · 글 없는 간격 잡음', () => { let c = 0; const tr = (f, prob, tx) => { if (throws(() => checkFig('probe', f, prob, tx))) c++; };
  tr({ k: 'pgd2', rows: [[['sq', 'red'], ['sq', 'yel'], ['sq', 'red'], ['sq', 'blu']]] }, false, '');
  const R0 = FIG.render; FIG.render = (f) => R0(f).replace('|12,15', '|12,16'); tr({ k: 'optab2', op: 'x', rh: [3], ch: [4, 5] }, false, ''); FIG.render = R0;
  tr({ k: 'spin2', n: 4, marks: [0, 3, 2], dir: 'cw' }, false, '시계 방향');
  tr({ k: 'cubep2', steps: [[[0, 0, 'yel']], [[0, 0, 'yel'], [1, 0, 'yel']]], nums: ['1개', '3개'] }, false, '1개 3개');
  tr({ k: 'mcal2', first: 2, days: 31, band: [6, 13], holes: [21] }, true, '');
  tr({ k: 'ntab2', vals: [[1, 2, 3], [4, 5, 6]] }, false, '1씩');
  ok(c === 6, '잡은 수 ' + c); });

console.log('═══ H. 재료 충실 · 교과서 수 · 보탬 흡수 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const lines = (t) => String(t).replace(/([다요])\. /g, '$1.\n').trim();
KEYS.forEach(k => T(k + ' 개념 = 지도서 재료(src) · 그림 = fig json · 기본 문제 = src(물음·보기·정답) · 다음 시간 = src 다음', () => { const src = SRC[k], F = FIGJ[k];
  L0[k].slides.filter(s => s.block === 'concept').forEach((s, i) => { ok(normT(lines(src.slides[i].text)) === normT(s.data.content) && src.slides[i].title === s.data.title, s.id + ' 재료 아님'); ok(SAME(s.data.fig, F.slides[i]), s.id + ' 그림 명세'); ok(src.slides[i].text.split('\n').length <= 3, s.id + ' 개념 글 3줄 안팎'); });
  L0[k].slides.filter(s => s.block === 'basic_problem').forEach((s, i) => { const p = src.problems[i], d = s.data; ok(p.q === d.question, s.id + ' 물음'); ok(SAME(d.fig, F.problems[i]), s.id + ' 그림 명세'); if (p.opts) ok(SAME(d.options.map(o => o.text), p.opts) && d.options[p.ci].correct, s.id + ' 보기·정답'); else ok(d.answer === +p.a, s.id + ' 답'); });
  const nx = L0[k].slides[18].data; if (k !== 'u6_l09') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
KEYS.forEach(k => T(k + ' 교과서 수 표 ' + TB[k].length + '개가 그 차시에 있음', () => checkTB(L0, k)));
T('교과서 수 표 자체 확인 — 다른 차시 수는 없음(l07 「8 + 16 = 9 + 15」는 l05 에 · l09 「단 짝 친 구」는 l02 에 없음)', () => { ok(nsp(JSON.stringify(L0.u6_l05)).indexOf(nsp('8 + 16 = 9 + 15')) < 0, 'l05'); ok(nsp(JSON.stringify(L0.u6_l02)).indexOf(nsp('단 짝 친 구')) < 0, 'l02'); });
const TBA_N = Object.values(TBA).reduce((a, x) => a + x.length, 0);
function checkTBA(Ls) { const old = fs.readFileSync(path.join(TDIR, 'archive/neutral/gen_g2s2_math_u6.js'), 'utf8'); ok(TBA_N === 20, 'TB 줄 ' + TBA_N); Object.keys(TBA).forEach(k => { const main = nsp(JSON.stringify(Ls[k].slides)); TBA[k].forEach(([title, toks]) => { ok(old.indexOf("['" + title + "'") >= 0, '보관본에 TB 줄 없음 ' + title); const miss = toks.filter(t => main.indexOf(nsp(t)) < 0); ok(!miss.length, k + ' 「' + title + '」 본류에 없음 ' + miss.join(' / ')); }); }); KEYS.forEach(k => ok(!Ls[k].extras.some(e => /^b_l/.test(e.id)), k + ' b_ id')); }
T('보탬 흡수 대조 — 옛 TB ' + TBA_N + '줄(보관본에 실재)의 핵심 낱말·수가 그 차시 본류 장(extras 아님)에 · b_ id 0', () => checkTBA(L0));
T('한 차시 안에서 같은 문제 중복 0 · 수준별 기본·도전은 출구·기본 문제와 수가 다름', () => KEYS.forEach(k => { const sl = L0[k].slides; const lv = sl[11].data.levels; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q)); const allq = e.concat([lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(allq).size === allq.length, k + ' 중복'); const numsOf = (t) => (normT(t).match(/\d+/g) || []).join(','); ['기본', '도전'].forEach(t => { const n = numsOf(lv[t].q); ok(!n || e.map(numsOf).indexOf(n) < 0, k + ' ' + t + ' 수 같음'); }); }));
T('src 회수 키 — 차시마다 file = g2_math_u6_lNN_….html · 원문 파일 실재(투영 지도)', () => KEYS.forEach(k => { const f = SRC[k].file; ok(new RegExp('^g2_math_u6_' + k.slice(3) + '_.+\\.html$').test(f), k + ' ' + f); ok(fs.existsSync(path.join(ROOT, 'grade2/semester2/math/6단원_규칙찾기', f)), k + ' 원문 없음'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 동기 장 mo2(곰이·펭이) · 1인 흐름 · 그림 섬', () => { const les = L0[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'motivate') ok(r.cls === 'mo2' && /mo2-bub/.test(r.body), s.id + ' 동기 장 꼴 ' + r.cls);
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22(영상1·물음5·팁5·실생활3·놀이2·오개념2·예시3·준비1) · id 유일 · 추천 연결 전부 존재 · 보탬 카드 0', () => checkExtras(L0, k)));

console.log('═══ K. 발문 · 물음 끝맺음 · 지도서 유의 사항 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L0[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L0[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」 · 물음 속 「~다.」 0 (l01 되짚기는 5단원 덱 출구 그대로라 뺌)', () => { const qs = []; KEYS.forEach((k, i) => { const sl = L0[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(i ? sl[1].data.items : []).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('지도서 유의 사항이 교사 층에 — 관찰 유도 l01 · 방향 그림 l02·l07 · 시작점·학생 관점 l03 · 단계마다 모두 쌓기·다른 관점 l04 · 규칙 많이 찾기·개인 → 모둠 → 전체 l05 · 왜 홀수만 l06 · 두 요소 l08 · 평가 아님 l09', () => { const tx = (k) => JSON.stringify(L0[k].slides);
  ok(/관찰/.test(JSON.stringify(L0.u6_l01.slides[2].data.tnote)), 'l01 관찰'); ok(/방향 그림/.test(tx('u6_l02')) && /방향 그림/.test(tx('u6_l07')), '방향 그림'); ok(/시작점/.test(tx('u6_l03')) && /학생 관점/.test(tx('u6_l03')), 'l03'); ok(/단계마다 모두 쌓/.test(tx('u6_l04')) && /다른 관점/.test(tx('u6_l04')), 'l04');
  ok(/규칙을 많이 찾/.test(tx('u6_l05')) && /개인 → 모둠 → 전체/.test(tx('u6_l05')), 'l05'); ok(/왜 홀수만/.test(tx('u6_l06')), 'l06'); ok(/두 요소/.test(tx('u6_l08')), 'l08'); ok(/평가하는 시간이 아님/.test(tx('u6_l09')), 'l09'); ok(/여러 관점|다른 관점/.test(JSON.stringify(L0.u6_l02)), '여러 규칙 인정'); });

console.log('═══ L. 선행 용어 ═══');
T('처음 배우는 차시 전에는 그 말 0 (시계 방향·늘어나 l03 · 쌓기나무 l04 · 덧셈표 l05 · 곱셈표 l06 · 달력 l07 — l01 단원 도입 예외)', () => checkFirst(L0));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(L0, KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));

console.log('═══ M. 차단 어휘 · 「결」 · 겹낫표 · 인물 · 영어 코드 · 조사 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 겹낫표 0 · 교과서 속 다른 인물 이름(하라) 0', () => { const a = JSON.stringify(L0); ['박음', '빵꾸', '갈아엎', '결로', '결', '『', '』', '하라'].forEach(b => ok(a.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면(렌더 글자)에 영어 코드(u6 · l01 · L01 · lesson) 0 · 영어 낱말은 보기 기호(A~D)만', () => KEYS.forEach(k => L0[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L0[k], rev); const sep = (h) => String(h).replace(/></g, '> <'); const txt = docOf(sep(r.body)).body.textContent + ' ' + (typeof r.cover === 'string' ? docOf(sep(r.cover)).body.textContent : ''); ok(!/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b|lesson|slide/i.test(txt), k + ' ' + s.id + ' 영어 코드'); const wds = (txt.match(/[A-Za-z]+/g) || []).filter(x => !/^[A-D]$/.test(x)); ok(!wds.length, k + ' ' + s.id + ' 영어 낱말 「' + wds.join(',') + '」'); }))));
T('데이터 글(그림 명세·키 칸 빼고 — 제목·발문·본문·extras 글)에도 영어 코드 0', () => { const SKIP = { fig: 1, from: 1, id: 1, img: 1, src_key: 1, suggested_extras: 1, url: 1, fit_slides: 1, type: 1, block: 1, stage: 1, input: 1, source: 1, live_url: 1 }; const bad = [];
  KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') { if (/\bu\d+(_l\d+)?\b|\bl\d\d\b|\bL\d\d\b/.test(o)) bad.push(where + ' 「' + o.slice(0, 40) + '」'); } else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (!SKIP[x]) walk(o[x], where + '.' + x); }); })(L0[k], k)); ok(!bad.length, bad.slice(0, 4).join(' | ')); });
T('조사 — 수 뒤 은/는 · 이/가 · 을/를 · 과/와 · 이에요/예요가 읽는 소리 받침에 맞음', () => checkJosa(L0));
T('조사 검사기 자체 확인', () => { ok(josa('10이에요').length === 0 && josa('10예요').length === 1 && josa('2가').length === 0 && josa('3가').length === 1 && josa('5와').length === 0 && josa('3와').length === 1, '조사'); });

console.log('═══ R. 역검증 레드 — 망가뜨린 사본을 잡는지 ═══');
const RED = [
  ['출구 답을 틀리게(l03 「여섯째」 → 「다섯째」)', (B) => { B.u6_l03.slides[15].data.items[0].a = '다섯째'; }, (B) => checkAnswers(B, 'u6_l03')],
  ['선행 말을 앞 차시에(l02 개념에 「덧셈표」)', (B) => { B.u6_l02.slides[4].data.content += ' 덧셈표에서도 찾아요.'; }, (B) => checkFirst(B)],
  ['보탬 카드를 되살림(l04 extras 에 b_l4_1)', (B) => { B.u6_l04.extras[21] = { id: 'b_l4_1', type: 'other_activity', icon: '📗', title: '교과서 활동 — 성벽', content: '…', fit_slides: ['concept'] }; }, (B) => checkExtras(B, 'u6_l04')],
  ['복습 계보를 끊음(l06 복습 첫 답)', (B) => { B.u6_l06.slides[1].data.items[0].a = '17'; }, (B) => checkLineage(B, 'u6_l06', 5)],
  ['문제 그림에 답이 보임(l02 기본 ① 「?」 자리에 파란 칸)', (B) => { B.u6_l02.slides[8].data.fig.cells[5] = ['sq', 'blu']; }, (B) => checkNoLeak(B)],
  ['그림 빈칸 값이 정답과 다름(l05 기본 ① 「?」를 다른 칸으로)', (B) => { B.u6_l05.slides[8].data.fig.holes = [[0, 0]]; }, (B) => checkFigs(B)],
  ['조사 틀림(l09 개념 「4 4 1이에요」 → 「4 4 1예요」)', (B) => { B.u6_l09.slides[3].data.content = B.u6_l09.slides[3].data.content.replace('**4 4 1**이에요', '**4 4 1**예요'); }, (B) => checkJosa(B)],
  ['교과서 수를 지움(l07 「8 + 16 = 9 + 15」)', (B) => { B.u6_l07.slides[5].data.content = B.u6_l07.slides[5].data.content.replace(/\(8 \+ 16 = 9 \+ 15\)/, ''); }, (B) => checkTB(B, 'u6_l07')]
];
RED.forEach(([name, broke, chk]) => T('레드 — ' + name + ' → 잡힘 · 원본은 통과', () => { ok(!throws(() => chk(L0)), '원본이 걸림'); const B = clone(L0); broke(B); ok(throws(() => chk(B)), '못 잡음'); }));
T('역검증 8종', () => ok(RED.length >= 8, RED.length));

console.log('\n게이트 g2s2 수학 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
