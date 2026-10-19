/* gen_g2s2_math_u7.js — 2학년 2학기 수학 7단원 「수학이랑 함께해요」(바른 식습관 프로젝트) 케이티처 2세대 차시 생성기 (146차, 베프).
   재료 = 자기주도 차시(grade2/semester2/math/7단원_수학이랑함께해요/) → scripts/src_g2s2_math_u7.json (parse_selfdirected_g1s2.py figs14, 146차)
   골격 = u6 와 같은 19장·7요소 · 4차시(준비해요·계획해요·해 봐요·마무리해요 — 각 40분). 개념 글·기본 문제·정리·예고·자기 점검 줄은 원문 그대로, 교사 층은 T 표가 정본.
   그림 = 원문 그림을 부품으로: tbl → tbl2 · graph → cg2(144차) · plan → pln2 · pcard → pcd2 · pcrow → pcrw2 · rtab → rtb2(146차) · clock → clk1 · hcard → objs1 · 그림 둘 = panels.
          원문 장에 그림이 없는 개념 장은 T.figs 로 그 장 글에 맞는 그림(nstr2 같은 점수 띠 · objs1 · chain)을 준다 — 준호: 「어떤 그림도 없으면 심심하고 지루해 보여」.
   물음이 「~하면」으로 끝나 묻는 말이 없으면 QOVR 로 「…몇 점/cm일까요?」(답·그림 그대로).
   성취기준 = 임시 [2수01-11]·[2수04-01]·[2수02-02](2-2 u2·u5·u6 문구) — 2-2 지도서 오면 문구 교체.
   slug = g2s2_math · 주소 stage.html?g=2&s=math&t=2&u=7&l=u7_lNN
   실행: node kedu/teacher/scripts/gen_g2s2_math_u7.js  → kedu/teacher/data/g2s2_math_u7.js */
'use strict';
const fs = require('fs'), path = require('path'), vmm = require('vm');
const SRC = JSON.parse(fs.readFileSync(path.join(__dirname, 'src_g2s2_math_u7.json'), 'utf8'));
const OUT = path.join(__dirname, '..', 'data', 'g2s2_math_u7.js');
const DIR = 'grade2/semester2/math/7단원_수학이랑함께해요/', LIVE = '../../' + DIR;
const STD = '[2수01-11] 곱셈구구를 이해하고, 곱셈구구의 범위에서 곱셈을 할 수 있다 · [2수04-01] 생활 주변의 자료를 수집하여 기준에 따라 분류하고, 분류한 자료를 표로 나타내고 해석할 수 있다 · [2수02-02] 자신이 정한 규칙에 따라 물체, 무늬, 수 등을 배열할 수 있다';
const PREV_KEY = 'g2s2_math:u6_l09';
const PREV_EXIT = (() => { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vmm.createContext(c); vmm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'data', 'g2s2_math_u6.js'), 'utf8'), c); return L.u6_l09.slides.find(s => s.block === 'exit_ticket').data.items; })();
const TN = (a1, a2, watch, min) => ({ ask: [a1, a2], watch, min });

/* 원문 물음이 「~하면」·「~의 점수는?」꼴이라 묻는 말이 흐린 곳 → 물음만 바꿈(답·그림 그대로) */
const QOVR = {
  '수찬이가 2번 실천하면': '수찬이가 2번 실천하면 모두 몇 점일까요?',
  '연우가 3번 실천하면': '연우가 3번 실천하면 모두 몇 점일까요?',
  '지아가 4번 실천하면': '지아가 4번 실천하면 모두 몇 점일까요?',
  '세미가 6번 실천하면': '세미가 6번 실천하면 모두 몇 점일까요?',
  '8점씩 5번을 모으면': '8점씩 5번을 모으면 모두 몇 점일까요?',
  '슬기의 점수는?': '슬기의 점수는 모두 몇 점일까요?',
  '재이의 실천 기록': '재이가 모은 점수는 모두 몇 점일까요?',
  '수찬이의 실천 기록': '수찬이가 모은 점수는 모두 몇 점일까요?',
  '카드 6장을 이으면': '카드 6장을 이으면 모두 몇 cm일까요?',
  '카드 9장을 걸려면': '카드 9장을 이으면 모두 몇 cm일까요?',
  '◯를 몇 개 그릴까요?': '「음식 골고루 먹기」 줄에 ◯를 몇 개 그려야 할까요?',
  '조사에 참여한 학생은 모두 몇 명?': '조사에 참여한 학생은 모두 몇 명일까요?',
  '가장 많은 학생이 생각한 바른 식습관은?': '가장 많은 학생이 생각한 바른 식습관은 무엇일까요?',
  '두 번째로 많은 것은?': '두 번째로 많은 학생이 생각한 식습관은 무엇일까요?',
  '빈자리에 올 카드는?': '빈자리에 올 카드는 무엇일까요?'
};

/* ── 원문 그림 → 부품 ── */
const card = (c) => c ? { name: c.name, habit: c.habit, score: c.score, emoji: c.emoji } : null;
function partOf(f) {
  let o = null;
  if (f.k === 'tbl') o = Object.assign({ title: f.title, head: f.head, cats: f.cats, vals: f.vals, total: f.total }, f.total_hole ? { total_hole: true } : {}, f.holes && f.holes.length ? { holes: f.holes } : {});
  else if (f.k === 'graph') o = Object.assign({ title: f.title, sym: f.sym, vert: f.vert, cats: f.cats, max: f.max, grid: f.grid, ax: f.ax }, f.holes && f.holes.length ? { holes: f.holes } : {}, f.odd ? { odd: f.odd } : {});
  else if (f.k === 'plan') o = Object.assign({ rows: f.rows }, f.rows[0] && f.rows[0][0] === '바른 식습관' ? { head: true } : {});
  else if (f.k === 'pcard') o = card(f);
  else if (f.k === 'pcrow') o = Object.assign({ cards: f.cards.map(card) }, f.cm ? { cm: f.cm } : {});
  else if (f.k === 'rtab') o = Object.assign(f.title ? { title: f.title } : {}, { rows: f.rows, sum: f.sum });
  else if (f.k === 'clock') o = Object.assign({ h: f.h, m: f.m, hands: f.hands == null ? 'hm' : f.hands }, f.tag ? { tag: f.tag } : {});
  else if (f.k === 'hcard') o = { items: f.items.map(i => ({ emoji: i.emoji, name: i.name + (i.sub ? '\n' + i.sub : '') })) };
  if (!o) return null;
  const K = { tbl: 'tbl2', graph: 'cg2', plan: 'pln2', pcard: 'pcd2', pcrow: 'pcrw2', rtab: 'rtb2', clock: 'clk1', hcard: 'objs1' }[f.k];
  return Object.assign(o, { k: K }); // k 는 마지막에 — 원문 k 가 덮지 않게(144차)
}
function figOf(figs) {
  const parts = (figs || []).map(partOf).filter(Boolean);
  if (!parts.length) return null;
  if (parts.length === 1) return parts[0];
  return { k: 'panels', items: parts.slice(0, 3).map(p => ({ fig: p })) };
}
/* 개념 글 = 원문 문장 줄 · 네 줄까지 */
const conText = (s) => { const ls = s.text.split('\n'), keep = ls.map(l => l.length > 4 && (/[요다!?.」)]$/.test(l) || /\*\*/.test(l))); for (let i = ls.length - 2; i >= 0; i--) if (/,$/.test(ls[i]) && keep[i + 1]) keep[i] = true; return ls.filter((l, i) => keep[i]).slice(0, 4).join('\n'); };
const ansOf = (p) => p.opts ? p.opts[p.ci].replace(/\*\*/g, '') : p.a + (p.unit ? ' ' + p.unit : '');

const T = {
  u7_l01: { cover: ['수학이랑 함께해요\n바른 식습관을 알아봐요', '🍽️'],
    review: '6단원에서는 무늬와 수에서 **규칙**을 찾았어요. 이번 단원에서는 2학기에 배운 **표와 그래프 · 곱셈구구 · 규칙 · 길이 · 시각**을 모아 **바른 식습관 프로젝트**를 해요.',
    kids: [['🐻', '곰이\n"슬기가 배가 아프대!"'], ['🐧', '펭이\n"먹는 습관을 바꿔 보자"']],
    mot: ['슬기는 왜 배가 자주 아플까요?', '튼튼한 몸을 위해 어떤 식습관이 필요할까요?', '', 3],
    con: [[3, TN('내가 생각하는 바른 식습관은 무엇인가요?', '글 대신 그림으로 나타낼 수도 있을까요?', '', 4)], [4, TN('「반찬을 가리지 않고 먹는다」는 어디로 모을까요?', '어디에도 넣기 어려운 카드는 어떻게 할까요?', '분류하기 어려운 카드를 버리는 경우', 5)], [5, TN('가장 많은 식습관은 몇 명인가요?', '합계 23은 무엇을 알려 주나요?', '', 4)], [6, TN('◯는 어디부터 그리나요?', '가장 적은 식습관은 무엇인가요?', '◯를 위에서부터 그리는 경우', 5)]],
    figs: { 4: { k: 'chain', items: [{ emoji: '📝', name: '반찬을 가리지 않고 먹는다' }, { emoji: '🥗', name: '음식 골고루 먹기' }] } },
    mis: ['분류하기 어려운 카드는 **빼고** 세어 표를 만든다.', '분류하기 어려운 카드도 **「기타」**로 모아 함께 세어야 해요. 빼고 세면 표의 **합계**가 조사한 사람 수와 맞지 않아요. 「기타」는 중요하지 않다는 뜻이 아니에요.', '카드를 모두 센 뒤 표의 합계와 걷은 카드 장수를 나란히 칠판에 적고 견주게 하세요.', TN('걷은 카드는 모두 몇 장인가요?', '표의 합계와 같은가요?', '빠진 카드가 있는데 그냥 넘어가는 경우', 3)],
    basic: [0, 1, 2], scene: '우리 반 친구들이 생각한 바른 식습관을 조사했어요.',
    lev: { 기본: { q: '식사 전 손 씻기는 6명, 음식 남기지 않기는 7명이에요. 두 식습관을 생각한 학생은 모두 몇 명일까요?', a: '13명', steps: ['두 칸의 수를 더해요', '6 + 7 = 13', '13명'] }, 도전: { q: '꼭꼭 씹어 먹기는 2명, 식사 후 이 닦기는 3명이에요. 이 닦기는 씹어 먹기보다 몇 명 더 많을까요?', a: '1명', steps: ['큰 수에서 작은 수를 빼요', '3 - 2 = 1', '1명'] }, 심화: { q: '6명, 7명, 5명, 2명, 3명을 모두 더하면 몇 명일까요?', a: '23명', steps: ['차례로 더해요', '6 + 7 + 5 + 2 + 3 = 23', '23명'] } },
    levTn: TN('기본에서 어느 두 칸을 더했나요?', '심화의 23은 표의 어느 칸과 같나요?', '도전을 5명이라고 더하는 경우', 5),
    act: { t: '우리 반 식습관 카드 모으기', type: 'group', goal: '모둠이 바른 식습관 카드를 모아 비슷한 것끼리 분류하고, 표와 ◯ 그래프로 나타내 발표하기', steps: ['한 사람이 카드 한 장에 바른 식습관을 글이나 그림으로 쓴다', '모둠 카드를 모아 비슷한 것끼리 분류하고 어려운 카드는 「기타」로 모은다', '종류별로 세어 표로 나타내고 합계로 빠진 카드가 없는지 확인한다', '◯를 아래에서부터 그려 그래프로 나타내고 가장 많은 식습관을 발표한다'], solo: ['가족에게 바른 식습관을 하나씩 물어 카드에 적는다', '내 카드까지 모아 비슷한 것끼리 분류한다', '종류별로 세어 표로 나타낸다', '◯ 그래프를 그리고 가장 많은 것을 한 문장으로 쓴다'], mats: ['빈 카드', '큰 종이', '색연필'], min: 15, tn: TN('어떤 기준으로 분류했나요?', '표와 그래프 가운데 무엇이 더 한눈에 보이나요?', '분류하기 어려운 카드를 버리는 경우', 15) },
    real: ['급식실 잔반 조사', '🍱', '학교 급식실에서는 남은 음식을 **종류별로 분류**하고 양을 세어 표로 정리해요. 어떤 반찬이 많이 남는지 한눈에 보이면 다음 식단을 더 알맞게 바꿀 수 있어요.', '모은 생각을 **분류하고 세면** 한눈에 보여요.'],
    adv: [7, TN('표에서 음식 골고루 먹기는 몇 명인가요?', '◯는 아래에서부터 몇 칸까지 그리나요?', '', 4), '표를 보면 음식 골고루 먹기는 5명이에요. 그런데 그래프의 「음식 골고루 먹기」 줄이 비어 있어요.'],
    exit: [{ q: '음식 골고루 먹기는 5명, 꼭꼭 씹어 먹기는 2명이에요. 두 식습관은 모두 몇 명일까요?', a: '7명' }, { q: '◯가 손 씻기 6개, 음식 남기지 않기 7개, 이 닦기 3개예요. 가장 많은 식습관은 무엇일까요?', a: '음식 남기지 않기' }, { q: '분류하기 어려운 카드는 어디로 모을까요?', a: '기타' }],
    self: '우리 반에서 가장 많은 식습관을 짝에게 말해 볼까요?' },
  u7_l02: { cover: ['실천을 계획해요\n나의 실천 카드', '📝'],
    review: '지난 시간에는 우리 반 친구들이 생각한 바른 식습관을 **분류**해 **표와 그래프**로 나타냈어요. 오늘은 그 가운데 **내가 실천할 식습관 하나**를 골라 계획을 세워요.',
    kids: [['🐻', '곰이\n"나는 음식을 자주 남겨"'], ['🐧', '펭이\n"밥 먹기 전에 손을 씻을래!"']],
    mot: ['내가 가장 고치고 싶은 식습관은 무엇인가요?', '꾸준히 하려면 무엇을 정해 두면 좋을까요?', '', 3],
    con: [[3, TN('언제부터 언제까지 실천하나요?', '어디에서, 어떻게 실천하나요?', '', 4)], [4, TN('두 친구의 계획은 무엇이 다른가요?', '나는 어디에서 실천할 수 있을까요?', '', 4)], [5, TN('수찬이는 실천할 때마다 몇 점을 주나요?', '수찬이가 2번 하면 몇 점일까요?', '', 4)], [6, TN('점수는 몇 점부터 몇 점까지 정하나요?', '왜 실천할 때마다 같은 점수를 줄까요?', '날마다 점수를 바꾸려는 경우', 5)]],
    figs: { 6: { k: 'nstr2', vals: [5, 5, 5, 5, 5], lab: '실천할 때마다 같은 점수' } },
    mis: ['실천할 때마다 점수를 **다르게** 주거나, 친구보다 **높은 점수**를 정해야 잘한 것이라고 생각한다.', '점수는 **2점부터 9점까지 한 가지**를 정해 실천할 때마다 **같은 점수**를 줘요. 같은 점수가 되풀이되면 나중에 **곱셈구구**로 쉽게 모을 수 있어요. 점수는 친구와 견주지 않아요.', '5점, 5점, 5점처럼 같은 점수 카드와 3점, 7점, 2점처럼 다른 점수 카드를 나란히 붙이고 어느 쪽이 모으기 쉬운지 묻게 하세요.', TN('같은 점수를 3번 모으면 어떤 곱셈인가요?', '점수가 날마다 다르면 어떻게 모아야 하나요?', '높은 점수가 더 잘한 것이라고 하는 경우', 3)],
    basic: [0, 1, 2], scene: '실천 카드에 점수를 정했어요.',
    lev: { 기본: { q: '5점씩 2번 실천하면 모두 몇 점일까요?', a: '10점', steps: ['5점씩 2번', '5 × 2 = 10', '10점'] }, 도전: { q: '7점씩 3번 실천하면 모두 몇 점일까요?', a: '21점', steps: ['7점씩 3번', '7 × 3 = 21', '21점'] }, 심화: { q: '12월 26일부터 12월 30일까지 날마다 실천하면 모두 며칠일까요?', a: '5일', steps: ['첫날과 마지막 날도 세요', '26, 27, 28, 29, 30', '5일'] } },
    levTn: TN('기본은 몇 단 곱셈구구인가요?', '심화에서 첫날도 세었나요?', '심화를 30 - 26 = 4일이라고 하는 경우', 5),
    act: { t: '나의 실천 카드 만들기', type: 'pair', goal: '실천할 식습관 하나를 골라 언제·어디에서·어떻게를 정하고 실천 카드를 만든 뒤, 짝과 서로의 계획을 읽어 주며 고칠 점을 말하기', steps: ['가장 고치고 싶은 식습관 하나를 고른다', '계획표에 언제·어디에서·어떻게를 적는다', '실천 카드에 이름·식습관·점수(2점~9점)를 적고 꾸민다', '짝에게 계획을 읽어 주고 꾸준히 할 수 있는지 서로 묻는다'], solo: ['실천하고 싶은 식습관 하나를 고른다', '언제·어디에서·어떻게를 계획표에 적는다', '실천 카드를 만들고 점수를 하나 정한다', '가족에게 계획을 읽어 주고 응원 한마디를 받아 적는다'], mats: ['계획표', '실천 카드 종이', '색연필'], min: 15, tn: TN('어떤 식습관을 골랐나요?', '그 점수를 고른 까닭은 무엇인가요?', '실천 기간을 너무 길게 정하는 경우', 15) },
    real: ['운동 계획표', '🏃', '줄넘기를 잘하고 싶은 친구는 「언제, 어디에서, 몇 번」을 정해 계획표를 써요. 계획을 세우면 잊지 않고 **꾸준히** 할 수 있어요.', '계획은 **언제·어디에서·어떻게**를 정해요.'],
    adv: [7, TN('8점씩 몇 번인가요?', '8단 곱셈구구에서 8 × 5 는 얼마인가요?', '', 4), '수찬이는 음식을 남기지 않을 때마다 8점씩 주기로 했어요. 그리고 5번 실천했어요.'],
    exit: [{ q: '4점씩 2번 실천하면 모두 몇 점일까요?', a: '8점' }, { q: '1월 3일부터 1월 7일까지 날마다 실천하면 모두 며칠일까요?', a: '5일' }, { q: '6점씩 3번 실천하면 모두 몇 점일까요?', a: '18점' }],
    self: '내가 세운 실천 계획을 짝에게 말해 볼까요?' },
  u7_l03: { cover: ['점수를 모아요\n실천 기록표', '✅'],
    review: '지난 시간에는 **언제·어디에서·어떻게**를 정하고, 실천할 때마다 **같은 점수**를 주는 실천 카드를 만들었어요. 오늘은 기록표에 모은 점수를 **곱셈구구**로 구해요.',
    kids: [['🐻', '곰이\n"하루는 깜빡했어…"'], ['🐧', '펭이\n"그날은 ×와 0점이야"']],
    mot: ['기록표에서 ◯와 ×는 무엇을 뜻할까요?', '모은 점수를 빠르게 구하는 방법이 있을까요?', '', 3],
    con: [[3, TN('◯는 몇 번인가요?', '× 인 날은 몇 점인가요?', '× 인 날도 5점으로 세는 경우', 5)], [4, TN('5 + 5 + 5 + 5 를 곱셈식으로 쓰면?', '왜 곱셈이 더 편할까요?', '', 4)], [5, TN('슬기는 몇 점씩 몇 번 했나요?', '어떤 곱셈구구를 썼나요?', '', 4)], [6, TN('글에 꼭 들어가야 할 것은 무엇인가요?', '식으로도 쓸 수 있을까요?', '', 4)]],
    figs: { 4: { k: 'nstr2', vals: [5, 5, 5, 5], lab: '5점씩 4번 → 5 × 4' }, 6: { k: 'objs1', items: [{ emoji: '🎯', name: '몇 점씩' }, { emoji: '🔁', name: '몇 번' }, { emoji: '✖️', name: '어떤\n곱셈구구' }] } },
    mis: ['기록표의 **날짜 수(5일)**를 그대로 세어 5 × 5 = **25점**이라고 한다.', '× 인 날은 실천하지 못한 날이라 **0점**이에요. ◯인 날만 세면 **4번**이니 5점씩 4번, **5 × 4 = 20점**이에요.', '기록표의 ◯에만 색연필로 동그라미를 하나씩 더 치며 세게 하고, × 줄은 손으로 가리게 하세요.', TN('◯에만 표시하면 몇 개인가요?', '× 인 날의 점수는 몇 점인가요?', '날짜 수로 곱하는 경우', 3)],
    basic: [0, 1, 3], scene: '실천 기록표에 ◯와 점수를 적었어요.',
    lev: { 기본: { q: '6점씩 3번 모으면 모두 몇 점일까요?', a: '18점', steps: ['6점씩 3번', '6 × 3 = 18', '18점'] }, 도전: { q: '9점씩 4번 모으면 모두 몇 점일까요?', a: '36점', steps: ['9점씩 4번', '9 × 4 = 36', '36점'] }, 심화: { q: '7점씩 주기로 했는데 ◯가 5번, ×가 2번이에요. 모은 점수는 모두 몇 점일까요?', a: '35점', steps: ['× 인 날은 0점', '7 × 5 = 35', '35점'] } },
    levTn: TN('기본은 몇 단 곱셈구구인가요?', '심화에서 × 인 날은 어떻게 했나요?', '심화를 7 × 7 = 49점이라고 하는 경우', 5),
    act: { t: '점수 모으기 짝 설명회', type: 'pair', goal: '짝과 실천 기록표를 바꾸어 ◯의 수를 세고 곱셈구구로 모은 점수를 구한 뒤, 「몇 점씩 몇 번」으로 짝에게 설명하기', steps: ['내 실천 기록표에 ◯·×와 점수를 적는다', '짝과 기록표를 바꾸어 ◯의 수를 센다', '「몇 점씩 몇 번」을 곱셈식으로 써서 모은 점수를 구한다', '짝에게 어떤 곱셈구구를 썼는지 설명하고 답을 맞추어 본다'], solo: ['내 실천 기록표에 ◯·×와 점수를 적는다', '◯의 수를 세어 적는다', '모은 점수를 덧셈식과 곱셈식으로 두 번 구해 같은지 본다', '「안녕, 나는 …」으로 시작하는 수학 글을 쓴다'], mats: ['실천 기록표', '색연필'], min: 15, tn: TN('짝의 점수는 몇 점씩 몇 번이었나요?', '덧셈식과 곱셈식의 답이 같았나요?', '× 인 날까지 세는 경우', 15) },
    real: ['칭찬 도장 판', '🌟', '칭찬 도장 하나가 **3점**인 도장 판이라면, 도장 개수만 세어 곱셈구구로 점수를 바로 구할 수 있어요. 하나하나 더하지 않아도 돼요.', '같은 점수를 여러 번 모으면 **곱셈**이에요.'],
    adv: [7, TN('◯는 몇 번인가요?', '8점씩 몇 번인지 곱셈식으로 쓰면?', '', 4), '수찬이는 12월 26일부터 12월 31일까지 실천 기록표를 썼어요. 실천한 날은 ◯와 8점, 못한 날(12월 28일)은 ×와 0점을 적었어요.'],
    exit: [{ q: '5점씩 4번 모으면 모두 몇 점일까요?', a: '20점' }, { q: '6점씩 주기로 했는데 ◯가 3번, ×가 2번이에요. 모은 점수는 모두 몇 점일까요?', a: '18점' }, { q: '8 + 8 + 8 을 곱셈식으로 나타내면 무엇일까요?', a: '8 × 3' }],
    self: '내가 모은 점수를 어떻게 구했는지 짝에게 말해 볼까요?' },
  u7_l04: { cover: ['바른 식습관을 다짐해요\n실천 카드 전시회', '🎨'],
    review: '지난 시간에는 실천 기록표의 ◯를 세어 모은 점수를 **곱셈구구**로 구했어요. 오늘은 친구들의 실천 카드를 **규칙**에 따라 전시하고, 끈의 **길이**를 어림하고, 생활 **시계**에 다짐을 붙여요.',
    kids: [['🐻', '곰이\n"카드를 어떻게 걸까?"'], ['🐧', '펭이\n"규칙대로 걸면 예뻐!"']],
    mot: ['친구들의 실천 카드를 어떤 차례로 걸면 좋을까요?', '6단원에서 배운 규칙을 쓸 수 있을까요?', '', 3],
    con: [[3, TN('되풀이되는 한 묶음은 무엇인가요?', '수찬 다음에는 누구의 카드를 걸까요?', '', 4)], [4, TN('카드 한 장은 몇 cm인가요?', '끈은 왜 60 cm보다 길어야 할까요?', '끈을 딱 60 cm로 자르는 경우', 5)], [5, TN('실천하고 나니 어떤 점이 좋았나요?', '점수가 적으면 잘못한 것일까요?', '점수로 친구와 견주는 경우', 4)], [6, TN('시계는 몇 시를 가리키나요?', '내 다짐은 몇 시에 붙이면 좋을까요?', '', 4)]],
    figs: { 5: { k: 'objs1', items: [{ emoji: '🧼', name: '연우\n몸이 튼튼해졌어요' }, { emoji: '🍽️', name: '수찬\n지구에 좋은 일' }] } },
    mis: ['카드 6장을 이은 길이가 60 cm이니, 끈도 **딱 60 cm**로 자른다.', '카드를 이은 길이는 10 cm씩 6번 **60 cm**지만, 양 끝을 **묶을 부분**이 있어야 해요. 그래서 끈은 **60 cm보다 조금 길게** 준비해요.', '60 cm 끈과 80 cm 끈을 실제로 칠판에 대어 보고, 어느 끈으로 카드를 걸어 묶을 수 있는지 해 보게 하세요.', TN('카드를 모두 이으면 몇 cm인가요?', '끈의 양 끝은 어떻게 하나요?', '묶을 부분을 생각하지 않는 경우', 3)],
    basic: [0, 1, 2], scene: '친구들의 실천 카드를 전시해요.',
    lev: { 기본: { q: '카드 한 장이 10 cm예요. 카드 4장을 이으면 모두 몇 cm일까요?', a: '40 cm', steps: ['10 cm씩 4장', '10 × 4 = 40', '40 cm'] }, 도전: { q: '음식, 손 씻기, 이 닦기 카드가 차례로 되풀이돼요. 7번째에 올 카드는 무엇일까요?', a: '음식', steps: ['3장이 한 묶음', '3 + 3 = 6', '7번째는 다시 음식'] }, 심화: { q: '카드 한 장이 10 cm예요. 카드 8장을 이으면 모두 몇 cm일까요?', a: '80 cm', steps: ['10 cm씩 8장', '10 × 8 = 80', '80 cm'] } },
    levTn: TN('기본은 10 cm씩 몇 번인가요?', '도전에서 6번째 카드는 무엇인가요?', '도전을 손 씻기라고 하는 경우', 5),
    act: { t: '실천 카드 전시회', type: 'group', goal: '모둠이 정한 규칙에 따라 실천 카드를 끈에 걸어 전시하고, 필요한 끈의 길이를 어림해 준비한 뒤 다른 모둠의 규칙을 알아맞히기', steps: ['모둠 친구들의 실천 카드를 모은다', '식습관 종류가 되풀이되는 규칙을 정해 차례를 정한다', '카드 장수로 끈의 길이를 어림하고 묶을 부분까지 더해 자른다', '카드를 걸고 다른 모둠의 전시 규칙을 알아맞힌다'], solo: ['내 실천 카드와 가족 카드 몇 장을 만든다', '종류가 되풀이되게 차례를 정한다', '카드 장수로 끈의 길이를 어림하고 조금 길게 자른다', '카드를 걸고 생활 시계에 나의 다짐을 붙인다'], mats: ['실천 카드', '끈', '집게', '자'], min: 20, tn: TN('어떤 규칙으로 걸었나요?', '끈은 몇 cm쯤 준비했나요?', '규칙 없이 섞어 거는 경우', 20) },
    real: ['교실 게시판', '📌', '교실 게시판에 작품을 걸 때도 **규칙**에 따라 늘어놓으면 보기 좋고, 작품 한 장의 길이를 알면 필요한 끈의 길이를 **어림**할 수 있어요.', '배운 수학으로 **전시**하고 **다짐**해요.'],
    adv: [6, TN('카드 한 장은 몇 cm인가요?', '10 cm씩 9번이면?', '', 4), '실천 카드가 9장으로 늘었어요. 카드 한 장의 길이는 10 cm이고, 카드를 빈틈없이 이어 붙여 걸어요.'],
    exit: [{ q: '카드 한 장이 10 cm예요. 카드 5장을 이으면 모두 몇 cm일까요?', a: '50 cm' }, { q: '음식, 손 씻기, 이 닦기, 음식, 손 씻기 다음에 올 카드는 무엇일까요?', a: '이 닦기' }, { q: '세미가 5점씩 6번 실천하면 모두 몇 점일까요?', a: '30점' }],
    self: '나의 바른 식습관 다짐을 짝에게 말해 볼까요?',
    lastTitle: '2학기를 마쳤어요', nextText: '**2학년 2학기 수학**을 모두 마쳤어요! 네 자리 수부터 규칙 찾기까지 배운 수학으로 **바른 식습관**을 지켰어요.', next: '🎉' }
};

/* ── extras ── */
function extras(n, t, s) {
  const id = (p, i) => p + '_l' + n + '_' + i, ex = [];
  ex.push({ id: id('v', 1), type: 'video', icon: '🎥', title: t.cover[0].split('\n')[0] + ' 영상', url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent('초등 2학년 수학 바른 식습관 ' + t.cover[0].split('\n')[0]).replace(/%20/g, '+'), description: '수업 전 교사가 짧은 영상을 골라 두세요.', source: '유튜브 검색 (교사 사전 확인 권장)', fit_slides: ['concept', 'motivate'] });
  const app = s.problems.filter(p => p.stage === '응용문제');
  app.slice(0, 3).forEach((p, i) => ex.push({ id: id('q', i + 1), type: 'fun_question', icon: '💡', title: QOVR[p.q] || p.q, content: (QOVR[p.q] || p.q) + (p.prompt ? ' — ' + p.prompt.replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' ') : ''), fit_slides: ['concept', 'basic_problem'] }));
  s.problems.filter(p => p.miss && typeof p.miss === 'string' && p.miss).slice(0, 2).forEach((p, i) => ex.push({ id: id('t', i + 1), type: 'tip', icon: '🧩', title: '자주 틀리는 곳', content: p.miss.replace(/<\/?b>/g, '**'), fit_slides: ['concept', 'misconception'] }));
  ex.push({ id: id('r', 1), type: 'real_world', icon: '🌍', title: t.real[0], content: t.real[2], fit_slides: ['real_world', 'summary'] });
  ex.push({ id: id('g', 1), type: 'game', icon: '🎮', title: t.act.t, content: t.act.goal, fit_slides: ['leveled_problem', 'offline_activity'] });
  ex.push({ id: id('x', 1), type: 'misconception', icon: '⚠️', title: '오개념 확인', content: t.mis[0].replace(/\*\*/g, '') + ' → ' + t.mis[1].replace(/\*\*/g, ''), fit_slides: ['misconception', 'basic_problem'] });
  return ex;
}

const ICON = { tbl2: '🗒️', cg2: '📊', pln2: '📝', pcd2: '🃏', pcrw2: '🃏', rtb2: '✅', clk1: '🕐', objs1: '🍽️' };
function problemData(p, title, scene) {
  const fig = figOf(p.figs);
  const q = QOVR[p.q] || p.q, f0 = fig && (fig.k === 'panels' ? fig.items[fig.items.length - 1].fig : fig);
  const d = { title, scenario: { icon: (f0 && ICON[f0.k]) || '🍽️', body: (p.prompt || scene).replace(/\s*\n\s*/g, ' ') }, question: /[?.!]$/.test(q) || !/(까요|나요)$/.test(q) ? q : q + '?' };
  if (fig) d.fig = fig;
  const hint = (p.hints || []).join(' ');
  if (p.opts) { d.options = p.opts.map((t, i) => { const o = { text: t }; if (i === p.ci) o.correct = true; return o; }); d.note = '풀이: ' + hint + ' → **' + ansOf(p) + '**'; }
  else { d.input = 'count_input'; d.answer = isNaN(+p.a) ? p.a : +p.a; if (p.unit) d.unit = p.unit; d.note = '풀이: ' + hint + ' → **' + p.a + (p.unit ? ' ' + p.unit : '') + '**'; }
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
  add('review', '도입', { title: idx === 0 ? '지난 단원 마지막 시간엔 무엇을 했나요?' : '지난 시간엔 무엇을 했나요?', content: t.review || (s.slides.find(x => x.kind === '떠올리기') || {}).text || '', items: prevExit.map(x => ({ q: x.q, a: x.a })), from: idx === 0 ? PREV_KEY : keys[idx - 1] }, has('q').slice(0, 1));
  add('motivate', '도입', { scene_title: S0.title, kids: t.kids.map(([face, label]) => ({ face, label })), question: conText(S0) || S0.text.split('\n').slice(0, 2).join(' ') }, has('r'), TN(...t.mot));
  t.con.slice().sort((a, b) => a[0] - b[0]).forEach(([si, tn], i) => { const src = s.slides[si]; if (!src) throw new Error(key + ' 개념 장 ' + si);
    const fig = (t.figs && t.figs[si]) || figOf(src.figs); if (!fig) throw new Error(key + ' 개념 장 그림 없음 ' + si);
    const content = conText(src) || src.title;
    add('concept', '전개', Object.assign({ title: src.title, content }, { fig }), [has('t')[i % 2], i === 3 ? has('q')[1] : null], tn); });
  add('misconception', '전개', { title: '이런 생각을 조심해요', label: '자주 하는 생각', wrong: t.mis[0], right: t.mis[1], hint: t.mis[2] }, has('x'), t.mis[3]);
  t.basic.forEach((pi, i) => { const p = s.problems[pi]; if (!p || !['pad', 'mcq'].includes(p.part)) throw new Error(key + ' 기본 문제 ' + pi + ' 꼴 ' + (p && p.part)); add('basic_problem', '기본문제', problemData(p, '기본 문제 ' + '①②③'[i], t.scene), [has('t')[0]]); });
  add('leveled_problem', '기본문제', { title: '수준을 골라 풀어요', levels: t.lev }, has('g'), t.levTn);
  add('offline_activity', '응용문제', { title: t.act.t, type: t.act.type, goal: t.act.goal, steps: t.act.steps, solo: t.act.solo, materials: t.act.mats, minutes: t.act.min }, has('g'), t.act.tn);
  add('real_world', '응용문제', { title: t.real[0], scenario: { icon: t.real[1], body: t.real[2] }, content: t.real[3] }, has('r'));
  const ap = s.problems[t.adv[0]]; if (!ap || !(ap.opts || ap.a)) throw new Error(key + ' 응용 ' + t.adv[0]);
  add('advanced_problem', '응용문제', { title: '생각을 넓혀요', context: (t.adv[2] || ap.prompt || t.scene).replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' '), challenge: (QOVR[ap.q] || ap.q) + (ap.opts ? ' (' + ap.opts.map(o => o.replace(/\*\*/g, '')).join(' / ') + ')' : ''), note: '풀이: ' + (ap.hints || []).join(' ') + ' → **' + String(ansOf(ap)).replace(/\*\*/g, '') + '**' }, has('q').slice(2, 3), t.adv[1]);
  add('exit_ticket', '정리', { title: '오늘 확인해요', items: t.exit, self: ['오늘 배운 것을 혼자 설명할 수 있어요', '조금 헷갈려요', '다시 배우고 싶어요'] }, []);
  add('summary', '정리', { title: '오늘 배운 것', points: s.summary.split('\n').filter(Boolean), arrows: (s.goal && s.goal.length ? s.goal : t.arrows || t.exit.map(e => e.q)).slice(0, 3) }, has('r'));
  const selfL = (s.slides.find(x => x.kind === '스스로 점검') || { text: '' }).text.split('\n').filter(l => l && !/^잘했어요/.test(l));
  if (selfL.length !== 3) throw new Error(key + ' 스스로 점검 줄 ' + selfL.length);
  add('self_assessment', '정리', { title: '스스로 점검해요', items: ['📚 ' + selfL[0], '🔧 ' + selfL[1], '💛 ' + selfL[2]], prompts: [t.self] }, []);
  add('next_lesson', '정리', { title: idx === keys.length - 1 ? (t.lastTitle || '다음 단원엔') : '다음 시간엔', preview: t.nextText || s.next, emoji: t.next || s.next_emoji }, []);
  LESSONS[key] = { meta: { grade: 2, subject: '수학', term: 2, unit: 7, unit_title: '수학이랑 함께해요', n, title: s.title.replace(/ · K-edu.*$/, ''), std: STD, duration_min: 40, lesson_format: '수학이랑 프로젝트 ' + ['준비해요', '계획해요', '해 봐요', '마무리해요'][n - 1] + ' · 2세대 19장(7요소)', theme: '곰이·펭이 바른 식습관 프로젝트', live_url: LIVE + s.file, source: DIR + s.file }, slides, extras: ex };
});

const head = `/* ============================================================================
   2학년 2학기 수학 — 7단원 「수학이랑 함께해요」 케이티처 2세대 차시 데이터 (4차시 × 19장)
   - 생성물: kedu/teacher/scripts/gen_g2s2_math_u7.js 가 만든다. 손으로 고치지 말고 생성기(T 표)를 고칠 것.
   - 키: window.LESSONS["u7_l{NN}"] · 주소 stage.html?g=2&s=math&t=2&u=7&l=u7_lNN · slug g2s2_math (2학년 2학기 — 2세대 전용).
   - 재료: 자기주도 2-2 「수학이랑 함께해요」 4차시(바른 식습관 프로젝트) → 19장·7요소 + 교사 층(발문·오개념·교실 활동+1인 흐름).
   - 계보: u7_l01 복습 = 6단원 마지막 g2s2_math u6_l09 출구 퀴즈 · 이후 차시 복습 = 직전 차시 출구 퀴즈. u7_l04 = 2학년 2학기 수학 마지막 차시.
   - 그림: tbl2·cg2(144차) · pln2·pcd2·pcrw2·rtb2(146차) · clk1 · objs1 · chain · nstr2.
   ============================================================================ */
`;
fs.writeFileSync(OUT, head + '(function () {\n  if (!window.LESSONS) window.LESSONS = {};\n' + keys.map(k => '  window.LESSONS[' + JSON.stringify(k) + '] = ' + JSON.stringify(LESSONS[k]) + ';').join('\n') + '\n})();\n');
console.log('→', path.relative(process.cwd(), OUT), keys.length, '차시 ·', keys.reduce((a, k) => a + LESSONS[k].slides.length, 0), '장 ·', keys.reduce((a, k) => a + LESSONS[k].extras.length, 0), 'extras');
