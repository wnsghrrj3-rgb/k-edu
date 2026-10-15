/* gen_g1s2_math_u7.js — 1학년 2학기 수학 7단원 「수학이랑 안전」 케이티처 2세대 차시 생성기 (132차, 베프).
   재료 = 자기주도 차시(grade1/semester2/math/7단원_수학이랑안전/) → scripts/src_g1s2_math_u7.json (parse_selfdirected_g1s2.py figs7 + figs5 patc, 131·132차)
   골격 = u6 와 같은 19장·7요소. 개념 글·기본 문제·정리·예고·자기 평가 물음은 원문 그대로, 교사 층(발문·오개념·수준별·교실 활동+1인 흐름·생활 속·출구)은 T 표가 정본.
   프로젝트 단원 3차시(준비해요·계획해요 → 해 봐요 → 마무리해요) · 차시마다 40분.
   그림 = 원문 그림을 부품으로: 안전 표지판 → sign1 · 약속 고른 사람 점 줄 → tally1 · 모양 규칙 줄(patc) → pat1 모양 토큰(p) (131·132차 부품)
          · 시계 → clk1 · 시각 카드 → tcard · 모양 줄 → shp1 · 물건 카드 → objs1 · 식 띠 → eqt (기존 부품).
     문제 그림엔 답을 그리지 않는다: 모양 규칙 줄은 묶음 테(pu) 없이 · 「다음에 올 모양」은 끝에 「?」 칸 · 점 줄의 견준 식(diff) 없음.
   차단 어휘 — 원문 「연결 모형」 → 「블록」, 「결과는/도/가」 → 「답은/도/이」(u6 와 같은 치환, 7단원 원문엔 없음).
   성취기준 = 7단원 지도서 확인 전 임시: 2학기 앞 단원 지도서 문구 셋([2수01-05] 실생활 덧셈·뺄셈 · [2수03-03] 모양 · [2수02-01] 규칙).
   slug = g1s2_math · 주소 stage.html?g=1&s=math&t=2&u=7&l=u7_lNN
   실행: node kedu/teacher/scripts/gen_g1s2_math_u7.js  → kedu/teacher/data/g1s2_math_u7.js */
'use strict';
const fs = require('fs'), path = require('path'), vmm = require('vm');
const SRC = JSON.parse(fs.readFileSync(path.join(__dirname, 'src_g1s2_math_u7.json'), 'utf8'));
const OUT = path.join(__dirname, '..', 'data', 'g1s2_math_u7.js');
const DIR = 'grade1/semester2/math/7단원_수학이랑안전/', LIVE = '../../' + DIR;
const STD = '[2수01-05] 덧셈과 뺄셈이 이루어지는 실생활 상황과 연결하여 덧셈과 뺄셈의 의미를 이해한다 · [2수03-03] 교실 및 생활 주변에서 여러 가지 물건을 관찰하여 삼각형, 사각형, 원의 모양을 찾고, 이를 이용하여 여러 가지 모양을 만들 수 있다 · [2수02-01] 물체, 무늬, 수 등의 배열에서 규칙을 찾아 여러 가지 방법으로 표현할 수 있다';
const PREV_KEY = 'g1s2_math:u6_l09';
const PREV_EXIT = (() => { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vmm.createContext(c); vmm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'g1s2_math_u6.js'), 'utf8'), c); return L.u6_l09.slides.find(s => s.block === 'exit_ticket').data.items; })();
const TN = (a1, a2, watch, min) => ({ ask: [a1, a2], watch, min });

const FIX = (s) => s.replace(/연결 모형/g, '블록').replace(/결과는/g, '답은').replace(/결과도/g, '답도').replace(/결과가/g, '답이');
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = FIX(o[k]); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC);

/* ── 원문 그림 → 부품 ── prob=true 면 답을 그리지 않는다 · q = 물음 글(「다음에 올」이면 끝에 「?」 칸) */
function partOf(f, prob, q) {
  if (f.k === 'sign') return { k: 'sign1', items: f.items.map(i => Object.assign({ s: i.s, c: i.c }, i.n ? { n: i.n } : {}, i.t ? { t: i.t } : {}, i.tag ? { tag: i.tag } : {})) };
  if (f.k === 'tally') return Object.assign({ k: 'tally1', rows: f.rows.map(r => ({ lab: r.lab, n: r.n, on: !!r.on })), unit: f.unit });
  if (f.k === 'phases') return { k: 'phases1', on: f.on, items: f.items };
  if (f.k === 'patc') { const toks = f.toks.map(t => (t.h ? { h: 1 } : { p: t.p }));
    if (prob && !toks.some(t => t.h) && /다음에 올/.test(q || '')) toks.push({ h: 1 });
    return Object.assign({ k: 'pat1', toks }, !prob ? { pu: Array(Math.floor(toks.length / f.n)).fill(f.n) } : {}); }
  if (f.k === 'clock') return Object.assign({ k: 'clk1', h: f.h, m: f.m, hands: f.hands == null ? 'hm' : f.hands }, f.tag ? { tag: f.tag } : {});
  if (f.k === 'tc') return Object.assign({ k: 'tcard', h: f.h }, f.m != null ? { m: f.m } : {});
  if (f.k === 'shp') return { k: 'shp1', items: f.items };
  if (f.k === 'objs') return { k: 'objs1', items: f.items };
  return null;
}
function figOf(figs, prob, q) {
  const parts = []; let rows = [];
  const flush = () => { if (rows.length) parts.push({ k: 'eqt', rows }); rows = []; };
  for (const f of figs || []) {
    if (f.k === 'eqt') rows.push({ toks: f.toks, hi: prob ? [] : f.hi, q: f.q });
    else { flush(); const p = partOf(f, prob, q); if (p) parts.push(p); }
  }
  flush();
  if (!parts.length) return null;
  if (parts.length === 1) return parts[0];
  return { k: 'panels', items: parts.slice(0, 3).map(p => ({ fig: p })) };
}
const optText = (p, i) => p.opts[i];
const conText = (s) => { const ls = s.text.split('\n'), keep = ls.map(l => l.length > 4 && (/[요다!?.」]$/.test(l) || /\*\*/.test(l))); for (let i = ls.length - 2; i >= 0; i--) if (/,$/.test(ls[i]) && keep[i + 1]) keep[i] = true; return ls.filter((l, i) => keep[i]).slice(0, 4).join('\n'); };
const ansOf = (p) => p.opts ? optText(p, p.ci).replace(/\*\*/g, '') : Array.isArray(p.a) ? p.a.join(', ') : p.a;

const T = {
  u7_l01: { cover: ['학교 안전 약속을 정해요\n우리는 안전 지킴이', '🚸'],
    review: '6단원에서는 두 자리 수를 **10개씩 묶음과 낱개**로 나누어 더하고 뺐어요. 3단원에서는 **모양**과 **시각**을 배웠지요.',
    kids: [['🐻', '곰이\n"복도에서 뛰면 위험해!"'], ['🐧', '펭이\n"우리가 지킴이 할까?"']],
    mot: ['학교에서 다칠 뻔한 적이 있나요?', '안전 지킴이는 무엇을 하는 사람일까요?', '', 3],
    txt: { 5: '「계단을 한 칸씩 내려가요.」처럼\n내가 **지킬 수 있는** 약속을 하나 떠올려 봐요.' }, // 원문 첫 줄이 「처럼」으로 끝나 conText 가 빼므로 두 줄 그대로
    con: [[3, TN('그림 속 친구들은 왜 다칠 수 있나요?', '우리 학교에서 비슷한 곳은 어디인가요?', '다친 친구 탓만 하는 경우', 4)], [4, TN('짧은바늘과 긴바늘은 어디를 가리키나요?', '10시 30분에는 어떤 약속을 지키나요?', '짧은바늘이 10 과 11 사이인데 11시라고 읽는 경우', 5)], [5, TN('내가 지킬 수 있는 약속은 무엇인가요?', '왜 그 약속을 골랐나요?', '「안 다치기」처럼 무엇을 할지 모르는 약속을 고르는 경우', 4)], [6, TN('어느 약속을 고른 사람이 더 많나요?', '몇 명 더 많은지 어떻게 구하나요?', '14 + 8 처럼 두 수를 더하는 경우', 5)]],
    mis: ['「몇 명 더 많은지」 물으면 **두 수를 더한다**(14 + 8 = 22).', '「몇 명 더 많은지」는 두 수를 **견주는** 거예요. **많은 쪽에서 적은 쪽을** 빼요. 14 − 8 = 6 이에요.', '두 약속을 고른 친구 이름 자석을 한 줄씩 짝 지어 붙이고, 짝 없는 자석만 세게 하세요.', TN('짝 없는 자석은 몇 개인가요?', '더하면 22 가 되는데, 정말 22명 더 많을까요?', '「모두」와 「더 많은지」를 헷갈리는 경우', 3)],
    basic: [0, 1, 4], scene: '학교 곳곳에서 안전 약속을 찾아요.',
    lev: { 기본: { q: '「한 줄로 서요」를 고른 사람은 9명, 「조용히 걸어요」를 고른 사람은 5명이에요. 「한 줄로 서요」가 몇 명 더 많을까요?', a: '4명', steps: ['견주는 이야기 → 뺄셈', '9 − 5 = 4', '4명'] }, 도전: { q: '14 − 8 은 얼마일까요?', a: '6', steps: ['8 을 4 와 4 로 가르기', '14 − 4 = 10', '10 − 4 = 6'] }, 심화: { q: '계단 지킴이는 6명, 복도 지킴이는 7명이에요. 지킴이는 모두 몇 명일까요?', a: '13명', steps: ['7 을 4 와 3 으로 가르기', '6 + 4 = 10', '10 + 3 = 13명'] } },
    levTn: TN('기본에서 많은 쪽은 어느 약속인가요?', '심화에서 10 을 만들려면 7 을 어떻게 갈랐나요?', '더 많은지 묻는데 더하는 경우', 5),
    act: { t: '우리 반 안전 약속 투표', type: 'group', goal: '모둠이 학교에서 안전하지 못한 곳을 찾아 약속 후보를 세우고, 반 전체가 붙임 딱지로 투표해 가장 많이 고른 약속을 우리 반 약속으로 정하기', steps: ['모둠마다 학교 지도 한 장을 받아 위험한 곳에 ✕ 표시를 한다', '✕ 표시한 곳마다 지킬 약속을 한 줄로 쓴다', '모둠 약속 두 개를 칠판에 붙이고 한 사람이 붙임 딱지 하나로 투표한다', '두 약속의 딱지를 짝 지어 세고 몇 명 더 많은지 식으로 말한다'], solo: ['학교에서 다칠 수 있는 곳 세 군데를 떠올려 적는다', '곳마다 지킬 약속을 한 줄로 쓴다', '가장 지키고 싶은 약속 하나에 동그라미를 친다', '그 약속을 지킬 시각을 몇 시 몇 분으로 함께 적는다'], mats: ['학교 지도', '붙임 딱지', '색연필'], min: 12, tn: TN('가장 많이 고른 약속은 무엇인가요?', '몇 명 더 많았나요?', '딱지를 세지 않고 눈으로만 견주는 경우', 12) },
    real: ['등굣길 횡단보도', '🚦', '등굣길 횡단보도에서는 초록불이 켜져도 왼쪽과 오른쪽을 살핀 뒤 건너요. 학교 밖에도 모두가 함께 지키는 안전 약속이 있어요.', '안전은 **우리 모두의 일** — 함께 정할 약속은 **몇 명 더 많은지** 견주어 골라요.'],
    adv: [7, TN('30분일 때 긴바늘은 어디에 있나요?', '급식 시각과 다음 공부 시각 가운데 어느 쪽이 더 늦나요?', '', 4)],
    exit: [{ q: '짧은바늘이 10 과 11 사이, 긴바늘이 6 을 가리키면 몇 시 몇 분일까요?', a: '10시 30분' }, { q: '「걸어 다녀요」는 12명, 「한 줄로 서요」는 7명이 골랐어요. 「걸어 다녀요」가 몇 명 더 많을까요?', a: '5명' }, { q: '「몇 명 더 많은지」 구할 때는 어떤 식을 쓸까요?', a: '뺄셈식' }],
    self: '오늘 정한 우리 반 약속을 언제 지킬지 짝에게 말해 볼까요?', next: '🪧' },
  u7_l02: { cover: ['안전 표지판을 만들어요\n모양과 색으로 알려요', '🪧'],
    kids: [['🐻', '곰이\n"세모 표지판은 조심하래"'], ['🐧', '펭이\n"우리 반 표지판도 만들자!"']],
    mot: ['길에서 어떤 표지판을 보았나요?', '표지판마다 모양과 색이 왜 다를까요?', '', 3],
    con: [[3, TN('파란 표지판은 무엇을 알리나요?', '빨간 표지판을 보면 어떻게 해야 하나요?', '색은 꾸미려고 칠한 것이라고 생각하는 경우', 4)], [4, TN('표지판 안의 수는 얼마인가요?', '30 은 10개씩 묶음 몇 개인가요?', '100 을 「십공」처럼 따로 읽는 경우', 4)], [5, TN('어떤 모양으로 나타낼지 정했나요?', '어떤 내용을 알릴지 정했나요?', '모양만 정하고 알릴 내용을 빼는 경우', 5)], [6, TN('빈 표지판에 어떤 약속을 담을까요?', '보는 사람이 무엇을 해야 할지 알 수 있나요?', '글씨를 길게 많이 쓰는 경우', 5)]],
    mis: ['표지판은 **글씨를 많이** 쓸수록 잘 알려 준다.', '표지판은 **한눈에** 알아봐야 해요. **모양과 색**으로 뜻을 정해 두고, 글은 **짧게** 써요.', '긴 글 표지판과 짧은 글 표지판을 교실 뒤에 붙이고, 앞에서 3초만 보고 무슨 뜻인지 말하게 하세요.', TN('3초 만에 읽을 수 있었나요?', '어느 표지판이 더 빨리 알아보였나요?', '글이 길수록 좋다고 하는 경우', 3)],
    basic: [0, 1, 3], scene: '우리 반 안전 표지판을 만들어요.',
    lev: { 기본: { q: '10개씩 묶음 5개와 낱개 0개인 수는?', a: '50', steps: ['10개씩 묶음 5개', '낱개 0개', '50'] }, 도전: { q: '네모 표지판은 15개, 세모 표지판은 9개예요. 네모 표지판이 몇 개 더 많을까요?', a: '6개', steps: ['많은 쪽에서 적은 쪽을 빼요', '15 − 5 = 10, 10 − 4 = 6', '6개'] }, 심화: { q: '동그라미 표지판 12개와 세모 표지판 6개를 만들었어요. 표지판은 모두 몇 개일까요?', a: '18개', steps: ['낱개끼리 2 + 6 = 8', '10개씩 묶음 1개 그대로', '18개'] } },
    levTn: TN('기본의 수를 빠르기 표지판에 써 볼까요?', '도전에서 많은 쪽은 어느 표지판인가요?', '', 5),
    act: { t: '우리 반 안전 표지판 만들기', type: 'group', goal: '모둠이 지난 시간에 정한 약속 하나를 골라 알맞은 모양과 색을 정하고, 짧은 글과 그림으로 안전 표지판을 만들어 서로 좋은 점을 말해 주기', steps: ['모둠마다 네모·세모·동그라미 색 도화지를 받는다', '알릴 약속을 고르고 어울리는 모양과 색을 정한다', '짧은 글과 그림으로 표지판을 꾸민다', '다른 모둠 표지판을 보고 좋은 점을 한 가지씩 말한다'], solo: ['지킬 약속 하나를 고른다', '「이렇게 해요·조심해요·하면 안 돼요」 가운데 무엇인지 정한다', '알맞은 모양과 색으로 표지판을 그린다', '다섯 글자 안팎의 짧은 글을 넣는다'], mats: ['색 도화지(네모·세모·동그라미)', '색연필', '가위'], min: 15, tn: TN('왜 그 모양과 색을 골랐나요?', '친구 표지판의 좋은 점은 무엇이었나요?', '글을 길게 쓰는 경우', 15) },
    real: ['학교 앞 표지판', '🏫', '학교 앞 길에는 빨간 테 동그라미 안에 30 이 적힌 표지판이 있어요. 자동차가 30 보다 빠르게 다니면 안 된다는 뜻이라, 어린이가 안전하게 다닐 수 있어요.', '표지판은 **모양·색·짧은 글**로 **한눈에** 알려 줘요.'],
    adv: [6, TN('둥근 표지판부터 세어 볼까요?', '뾰족한 곳이 세 군데인 표지판은 몇 개인가요?', '', 4), '우리 반이 만든 표지판 넷 — 동그라미 「걸어 다녀요」 · 세모 「조심하세요」 · 네모 「조용히 해요」 · 동그라미 「한 줄로 서요」', '동그라미 표지판과 세모 표지판은 각각 몇 개일까요?', '동그라미 2개, 세모 1개'],
    exit: [{ q: '뾰족한 곳이 세 군데인 표지판은 어떤 모양일까요?', a: '세모' }, { q: '10개씩 묶음 3개와 낱개 0개인 수는?', a: '30' }, { q: '빨간색 표지판은 무엇을 알릴까요?', a: '하면 안 되는 것' }],
    self: '내가 만든 표지판의 모양과 색을 고른 까닭을 짝에게 말해 볼까요?', next: '🦺' },
  u7_l03: { cover: ['안전을 다짐해요\n안전 지킴이 활동', '🦺'],
    kids: [['🐻', '곰이\n"모양 차례로 줄 서자"'], ['🐧', '펭이\n"지킴이는 모두 몇 명?"']],
    mot: ['친구 표지판은 무엇을 알리고 있나요?', '안전 지킴이 활동은 어떻게 할까요?', '', 3],
    con: [[3, TN('되풀이되는 한 묶음은 어디까지인가요?', '한 묶음에 모양이 몇 개 있나요?', '세모 · 동그라미 두 개만 묶음으로 보는 경우', 5)], [4, TN('마지막 모양은 무엇인가요?', '그다음은 묶음의 몇 번째 모양인가요?', '바로 앞 모양을 한 번 더 쓰는 경우', 4)], [5, TN('계단과 복도의 지킴이는 몇 명인가요?', '10 을 먼저 만들려면 8 을 어떻게 가르나요?', '4 부터 하나씩 이어 세다 하나를 빠뜨리는 경우', 5)], [6, TN('「모두 몇 명」은 어떤 식인가요?', '「몇 명 더 많은지」는 어떤 식인가요?', '두 물음을 모두 덧셈으로 푸는 경우', 4)]],
    mis: ['되풀이되는 규칙에서 **앞의 두 모양만** 보고 「세모 다음에 동그라미가 와요」라고 말한다.', '같은 모양이 **다시 나올 때까지**가 한 묶음이에요. **세모 · 동그라미 · 네모** 세 개가 한 묶음으로 되풀이돼요.', '친구들이 세모·동그라미·네모 표지판을 들고 줄을 선 뒤, 같은 표지판이 다시 나오는 자리에서 손을 들게 하세요.', TN('세모가 다시 나온 자리는 몇 번째인가요?', '한 묶음에 모양이 몇 개인가요?', '두 개만 보고 규칙을 말하는 경우', 3)],
    basic: [0, 1, 2], scene: '안전 지킴이 활동을 해요.',
    lev: { 기본: { q: '5 + 7 은 얼마일까요?', a: '12', steps: ['7 을 5 와 2 로 가르기', '5 + 5 = 10', '10 + 2 = 12'] }, 도전: { q: '세모, 동그라미, 네모가 되풀이돼요. 네모 다음에 올 모양은 무엇일까요?', a: '세모', steps: ['한 묶음은 세모 · 동그라미 · 네모', '네모는 한 묶음의 마지막', '다음은 처음 모양 세모'] }, 심화: { q: '계단 지킴이는 9명, 복도 지킴이는 6명이에요. 지킴이는 모두 몇 명일까요?', a: '15명', steps: ['6 을 1 과 5 로 가르기', '9 + 1 = 10', '10 + 5 = 15명'] } },
    levTn: TN('도전에서 한 묶음은 무엇인가요?', '심화에서 10 을 먼저 만들었나요?', '', 5),
    act: { t: '안전 지킴이 활동', type: 'group', goal: '모둠이 만든 표지판을 들고 세모·동그라미·네모가 되풀이되는 규칙으로 줄을 선 뒤, 맡은 곳(계단·복도)에서 지킴이 활동을 하고 모두 몇 명이 활동했는지 덧셈식으로 말하기', steps: ['모둠마다 만든 표지판을 들고 세모·동그라미·네모 차례로 되풀이해 줄을 선다', '계단 모둠과 복도 모둠으로 나누어 맡은 곳으로 간다', '쉬는 시간에 표지판을 들고 친구들에게 약속을 알린다', '교실에 돌아와 두 곳의 지킴이 수를 더해 모두 몇 명인지 말한다'], solo: ['지난 시간에 만든 표지판을 꺼낸다', '세모·동그라미·네모가 되풀이되는 줄을 그림으로 그린다', '교실 문 앞에 표지판을 붙이고 하루 동안 약속을 지킨다', '약속을 지킨 시각을 몇 시 몇 분으로 적는다'], mats: ['만든 표지판', '안전 지킴이 띠'], min: 15, tn: TN('줄은 어떤 규칙으로 섰나요?', '지킴이는 모두 몇 명이었나요?', '활동을 장난처럼 하는 경우', 15) },
    real: ['우리 집 안전', '🏠', '학교에서 정한 안전 약속은 집에서도 지킬 수 있어요. 계단은 한 칸씩 내려가고, 뜨거운 냄비 가까이에서는 뛰지 않아요.', '배운 **수·모양·시각·규칙**으로 학교를 **안전한 곳**으로 만들고, 약속은 **계속** 지켜요.'],
    adv: [4, TN('「모두」를 물었나요, 「더 많은지」를 물었나요?', '많은 쪽은 어디인가요?', '', 4)],
    exit: [{ q: '세모, 동그라미, 네모가 되풀이돼요. 동그라미 다음에 올 모양은 무엇일까요?', a: '네모' }, { q: '4 + 8 은 얼마일까요?', a: '12' }, { q: '복도 지킴이는 8명, 계단 지킴이는 4명이에요. 복도 지킴이가 몇 명 더 많을까요?', a: '4명' }],
    self: '한 학기 동안 배운 것 가운데 가장 자랑하고 싶은 것을 짝에게 말해 볼까요?', lastTitle: '한 학기를 마쳤어요' }
};

/* ── extras ── */
function extras(n, t, s) {
  const id = (p, i) => p + '_l' + n + '_' + i, ex = [];
  ex.push({ id: id('v', 1), type: 'video', icon: '🎥', title: t.cover[0].split('\n')[0] + ' 영상', url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent('초등 1학년 학교 안전 ' + t.cover[0].split('\n')[0]).replace(/%20/g, '+'), description: '수업 전 교사가 짧은 영상을 골라 두세요.', source: '유튜브 검색 (교사 사전 확인 권장)', fit_slides: ['concept', 'motivate'] });
  const app = s.problems.filter(p => p.stage === '응용문제');
  app.slice(0, 3).forEach((p, i) => ex.push({ id: id('q', i + 1), type: 'fun_question', icon: '💡', title: p.q, content: p.q + (p.prompt ? ' — ' + p.prompt.replace(/\*\*/g, '') : ''), fit_slides: ['concept', 'basic_problem'] }));
  s.problems.filter(p => p.miss && typeof p.miss === 'string' && p.miss).slice(0, 2).forEach((p, i) => ex.push({ id: id('t', i + 1), type: 'tip', icon: '🧩', title: '자주 틀리는 곳', content: p.miss.replace(/<\/?b>/g, '**'), fit_slides: ['concept', 'misconception'] }));
  ex.push({ id: id('r', 1), type: 'real_world', icon: '🌍', title: t.real[0], content: t.real[2], fit_slides: ['real_world', 'summary'] });
  ex.push({ id: id('g', 1), type: 'game', icon: '🎮', title: t.act.t, content: t.act.goal, fit_slides: ['leveled_problem', 'offline_activity'] });
  ex.push({ id: id('x', 1), type: 'misconception', icon: '⚠️', title: '오개념 확인', content: t.mis[0].replace(/\*\*/g, '') + ' → ' + t.mis[1].replace(/\*\*/g, ''), fit_slides: ['misconception', 'basic_problem'] });
  return ex;
}

function problemData(p, title, scene) {
  const fig = figOf(p.figs, true, (p.prompt || '') + p.q);
  const q = p.q;
  const d = { title, scenario: { icon: '🔢', body: p.prompt || scene }, question: /[?.!]$/.test(q) || !/(까요|나요)$/.test(q) ? q : q + '?' };
  if (fig) d.fig = fig;
  const hint = (p.hints || []).join(' ');
  if (p.opts) { d.options = p.opts.map((t, i) => { const o = { text: optText(p, i) }; if (i === p.ci) o.correct = true; return o; }); d.note = '풀이: ' + hint + ' → **' + ansOf(p) + '**'; }
  else { d.input = 'count_input'; d.answer = isNaN(+p.a) ? p.a : +p.a; if (p.unit) d.unit = p.unit; d.note = '풀이: ' + hint + ' → **' + p.a + (p.unit || '') + '**'; }
  return d;
}

const LESSONS = {}, keys = Object.keys(T);
keys.forEach((key, idx) => {
  const t = T[key], s = SRC[key], n = idx + 1; if (!s) throw new Error('원문 없음 ' + key);
  const ex = extras(n, t, s), has = (pre) => ex.filter(e => e.id.startsWith(pre + '_l' + n + '_')).map(e => e.id);
  const prevExit = idx === 0 ? PREV_EXIT : T[keys[idx - 1]].exit;
  const slides = [];
  const add = (block, stage, data, sug, tn) => { const sl = { id: 's' + String(slides.length + 1).padStart(2, '0'), stage, block, data }; if (tn) data.tnote = tn; sl.suggested_extras = (sug || []).filter(Boolean); slides.push(sl); };
  const S0 = s.slides[0];
  add('cover', '도입', { title: t.cover[0], emoji: t.cover[1] }, has('v'));
  add('review', '도입', { title: idx === 0 ? '6단원 마지막 시간엔 무엇을 했나요?' : '지난 시간엔 무엇을 했나요?', content: t.review || (s.slides.find(x => x.kind === '떠올리기') || {}).text || '', items: prevExit.map(x => ({ q: x.q, a: x.a })), from: idx === 0 ? PREV_KEY : keys[idx - 1] }, has('q').slice(0, 1));
  add('motivate', '도입', { scene_title: S0.title, kids: t.kids.map(([face, label]) => ({ face, label })), question: conText(S0) || S0.text.split('\n').slice(0, 2).join(' ') }, has('r'), TN(...(t.mot || ['무엇이 보이나요?', '모두 몇 개일까요?', '', 3])));
  t.con.slice().sort((a, b) => a[0] - b[0]).forEach(([si, tn], i) => { const src = s.slides[si]; if (!src) throw new Error(key + ' 개념 장 ' + si);
    const fig = (t.figs && t.figs[si]) || figOf(src.figs, false, src.text);
    const content = (t.txt && t.txt[si]) || conText(src) || src.title;
    add('concept', '전개', Object.assign({ title: src.title, content }, fig ? { fig } : {}), [has('t')[i % 2], i === 3 ? has('q')[1] : null], tn); });
  add('misconception', '전개', { title: '이런 생각을 조심해요', label: '자주 하는 생각', wrong: t.mis[0], right: t.mis[1], hint: t.mis[2] }, has('x'), t.mis[3]);
  t.basic.forEach((pi, i) => { const p = s.problems[pi]; if (!p || !(p.part === 'pad' || p.part === 'mcq')) throw new Error(key + ' 기본 문제 ' + pi + ' 꼴 ' + (p && p.part)); add('basic_problem', '기본문제', problemData(p, '기본 문제 ' + '①②③'[i], t.scene), [has('t')[0]]); });
  add('leveled_problem', '기본문제', { title: '수준을 골라 풀어요', levels: t.lev }, has('g'), t.levTn);
  add('offline_activity', '응용문제', { title: t.act.t, type: t.act.type, goal: t.act.goal, steps: t.act.steps, solo: t.act.solo, materials: t.act.mats, minutes: t.act.min }, has('g'), t.act.tn);
  add('real_world', '응용문제', { title: t.real[0], scenario: { icon: t.real[1], body: t.real[2] }, content: t.real[3] }, has('r'));
  const ap = s.problems[t.adv[0]]; if (!ap || !(ap.opts || ap.a)) throw new Error(key + ' 응용 ' + t.adv[0]);
  add('advanced_problem', '응용문제', { title: '생각을 넓혀요', context: (t.adv[2] || ap.prompt || t.scene).replace(/\s*\n\s*/g, ' '), challenge: (t.adv[3] || ap.q) + (ap.opts ? ' (' + ap.opts.map((o, i) => optText(ap, i).replace(/\*\*/g, '')).join(' / ') + ')' : ''), note: '풀이: ' + (ap.hints || []).join(' ') + ' → **' + String(t.adv[4] || ansOf(ap)).replace(/\*\*/g, '') + (t.adv[4] || !ap.unit || /[가-힣]$/.test(String(ansOf(ap))) ? '' : ap.unit) + '**' }, has('q').slice(2, 3), t.adv[1]);
  add('exit_ticket', '정리', { title: '오늘 확인해요', items: t.exit, self: ['오늘 배운 것을 혼자 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] }, []);
  add('summary', '정리', { title: '오늘 배운 것', points: s.summary.split('\n').filter(Boolean), arrows: (t.arrows || (s.goal && s.goal.length ? s.goal : t.exit.map(e => e.q))).slice(0, 3) }, has('r'));
  const selfL = (s.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l));
  add('self_assessment', '정리', { title: '스스로 점검해요', items: ['📚 지식·이해 — ' + (selfL[0] || '오늘 배운 것을 말할 수 있나요?'), '🔧 과정·기능 — ' + (selfL[1] || '찾고 읽을 수 있나요?'), '💛 가치·태도 — ' + (selfL[2] || '오늘 공부가 즐거웠나요?')], prompts: [t.self] }, []);
  add('next_lesson', '정리', { title: t.lastTitle || '다음 시간엔', preview: t.nextText || s.next, emoji: t.next || s.next_emoji }, []);
  LESSONS[key] = { meta: { grade: 1, subject: '수학', term: 2, unit: 7, unit_title: '수학이랑 안전', n, title: s.title.replace(/ · K-edu.*$/, ''), std: STD, duration_min: 40, lesson_format: '수학이랑 프로젝트 ' + ['준비해요·계획해요', '해 봐요', '마무리해요'][n - 1] + ' · 2세대 19장(7요소)', theme: '곰이·펭이 안전 지킴이', live_url: LIVE + s.file, source: DIR + s.file }, slides, extras: ex };
});

const head = `/* ============================================================================
   1학년 2학기 수학 — 7단원 「수학이랑 안전」 케이티처 2세대 차시 데이터 (3차시 × 19장)
   - 생성물: kedu/teacher/scripts/gen_g1s2_math_u7.js 가 만든다. 손으로 고치지 말고 생성기(T 표)를 고칠 것.
   - 키: window.LESSONS["u7_l{NN}"] · 주소 stage.html?g=1&s=math&t=2&u=7&l=u7_lNN · slug g1s2_math (1학년 2학기 — 2세대 전용).
   - 재료: 자기주도 1-2 「수학이랑 안전」 3차시(프로젝트 준비·해 봐요·마무리) → 19장·7요소 + 교사 층(발문·오개념·교실 활동+1인 흐름).
   - 계보: u7_l01 복습 = 6단원 마지막 g1s2_math u6_l09 출구 퀴즈 · 이후 차시 복습 = 직전 차시 출구 퀴즈. u7_l03 = 1학년 2학기 수학 마지막 차시.
   - 그림: sign1 · tally1 · pat1 모양 토큰(131·132차 부품) · clk1 · tcard · shp1 · objs1 · eqt.
   ============================================================================ */
`;
fs.writeFileSync(OUT, head + '(function () {\n  if (!window.LESSONS) window.LESSONS = {};\n' + keys.map(k => '  window.LESSONS[' + JSON.stringify(k) + '] = ' + JSON.stringify(LESSONS[k]) + ';').join('\n') + '\n})();\n');
console.log('→', path.relative(process.cwd(), OUT), keys.length, '차시 ·', keys.reduce((a, k) => a + LESSONS[k].slides.length, 0), '장 ·', keys.reduce((a, k) => a + LESSONS[k].extras.length, 0), 'extras');
