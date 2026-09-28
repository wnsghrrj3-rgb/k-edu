/* augment7_g3_science_u3.js — 2세대 27차 「개념 그림 층」 3학년 과학 3단원 「식물의 생활」 개념 장 29장.
   부품 = anat(잎 잎몸·잎맥·잎자루 / 부레옥잠 볼록한 잎자루·공기주머니 / 선인장 줄기·가시·뿌리) · ask(기준 질문) · habitat(들과 산·강과 호수·사막)
          · trait(생김새 → 쓸모) · bins(풀/나무 · 줄기/잎 저장 · 좋은/좋지 않은 기준) · mimic(식물 → 본떠요 → 물건 · 잡는 방법).
   ⚠️ 그림 글자에 「 — 」 을 쓰지 않는다. 실행: node kedu/teacher/data/augment7_g3_science_u3.js */
'use strict';
const A = (name, emoji) => emoji ? { name, emoji } : { name };
const M = { burr: { name: '도꼬마리 갈고리', ic: '도꼬마리' }, velcro: { name: '찍찍이', emoji: '👟' }, maple: { name: '단풍나무 씨앗', emoji: '🍁' }, heli: { name: '헬리콥터 날개', emoji: '🚁' }, lotus: { name: '연잎', emoji: '🪷' }, coat: { name: '방수 옷', emoji: '🧥' }, dand: { name: '민들레 씨앗', emoji: '🌬️' }, para: { name: '낙하산', emoji: '🪂' } };
const SAME = (last) => ({ k: 'tools', items: [{ emoji: '🌿', name: '뿌리 · 줄기 · 잎' }, { emoji: '🟩', name: '초록색 잎' }, last] });
const F = {
  u3_l01: {
    s05: { k: 'habitat', zones: [{ at: 'land', name: '길가', items: [A('민들레')] }, { at: 'field', name: '산', items: [A('소나무')] }, { at: 'land', name: '화단', items: [A('봉숭아')] }] },
    s06: { k: 'trait', subs: [{ name: '단풍나무', rows: [{ part: '잎', use: '넓적해요' }] }, { name: '소나무', rows: [{ part: '잎', use: '뾰족해요' }, { part: '키', use: '커요' }] }, { name: '민들레', rows: [{ part: '꽃', use: '피어요' }] }] },
    s07: { k: 'habitat', zones: [{ at: 'land', name: '화단과 집', items: [A('봉숭아')] }, { at: 'field', name: '들판 · 산', items: [A('민들레'), A('소나무')] }, { at: 'lake', name: '물가', items: [A('부들')] }], note: '자세히 관찰하면 식물의 **특징**' }
  },
  u3_l02: {
    s05: { k: 'anat', of: 'leaf', hi: ['blade', 'vein', 'stalk'] },
    s06: { k: 'ask', q: '가장자리가 톱니 모양인가?', yes: [A('단풍나무')], no: [A('은행나무')], note: '잎이 갈라져 있는가 · 잎이 길쭉한가도 기준이 돼요' },
    s07: { k: 'bins', bins: [{ name: '좋은 기준', emoji: '○', tone: 't0', items: [{ name: '톱니 모양인가요?', emoji: '📏' }], hint: '누가 나눠도 **같은 결과**' }, { name: '좋지 않은 기준', emoji: '✗', tone: 'x', items: [{ name: '예쁜가요?', emoji: '💭' }], hint: '사람마다 달라요' }] }
  },
  u3_l03: {
    s05: { k: 'habitat', zones: [{ at: 'field', items: [A('민들레'), A('강아지풀'), A('소나무'), A('단풍나무')], note: '풀도 살고 나무도 살아요' }] },
    s06: { k: 'bins', bins: [{ name: '풀', emoji: '🌿', tone: 't2', items: [A('민들레'), A('강아지풀')], hint: '줄기가 **가늘고 연해요** · 키가 작아요' }, { name: '나무', emoji: '🌳', tone: 't0', items: [A('소나무'), A('단풍나무')], hint: '줄기가 **굵고 단단해요** · 키가 커요' }] },
    s07: SAME({ emoji: '⛰️', name: '땅에 뿌리를 내려요', on: true })
  },
  u3_l04: {
    s05: { k: 'habitat', zones: [{ at: 'lake', name: '물에 떠서', items: [A('부레옥잠'), A('수련')] }, { at: 'lake', name: '물속에 잠겨서', items: [A('검정말')] }, { at: 'lake', name: '물가에 솟아서', items: [A('부들')] }] },
    s06: { k: 'anat', of: 'hyacinth', hi: ['stalk', 'air'], note: '공기주머니 덕분에 물에 **떠요**' },
    s07: SAME({ emoji: '💧', name: '물에서 살기 알맞은 모습', on: true })
  },
  u3_l05: {
    s05: { k: 'habitat', zones: [{ at: 'desert', items: [A('선인장'), A('용설란'), A('바오바브나무'), A('알로에')], note: '물을 **저장**하거나 빠져나가는 것을 막아요' }] },
    s06: { k: 'bins', bins: [{ name: '줄기에 물 저장', emoji: '🪵', tone: 't0', items: [A('선인장'), A('바오바브나무')], hint: '굵은 줄기' }, { name: '잎에 물 저장', emoji: '🍃', tone: 't2', items: [A('용설란'), A('알로에')], hint: '두툼한 잎' }] },
    s07: { k: 'anat', of: 'cactus', hi: ['stem', 'spine', 'root'] }
  },
  u3_l06: {
    s05: { k: 'mimic', rows: [[M.burr, M.velcro], [M.maple, M.heli], [M.lotus, M.coat], [M.dand, M.para]] },
    s06: { k: 'chain', items: [{ emoji: '👀', name: '① 자세히 관찰' }, { emoji: '🔍', name: '② 도움 되는 특징' }, { emoji: '💡', name: '③ 본떠 만들기', on: true }] },
    s07: { k: 'mimic', rows: [[M.lotus, M.coat], [M.burr, M.velcro]], note: '환경에 알맞게 살아온 **지혜**' }
  },
  u3_l07: {
    s05: { k: 'mimic', rows: [[M.burr, M.velcro], [M.lotus, M.coat], [M.dand, M.para]], note: '우리도 발명할 수 있을까요?' },
    s06: { k: 'bins', bins: [{ name: '본뜰 특징이 있어요', emoji: '🌿', tone: 't2', items: [A('도꼬마리'), { name: '연잎', emoji: '🪷' }] }, { name: '살아 있지 않아요', emoji: '🪨', tone: 'x', items: [A('돌멩이'), A('벽돌')] }] },
    s07: { k: 'chain', items: [{ emoji: '👀', name: '① 관찰하기' }, { emoji: '🔍', name: '② 좋은 점 찾기' }, { emoji: '💡', name: '③ 본떠 만들기', on: true }] },
    s13: { k: 'mimic', rows: [[M.lotus, M.coat, '물이 또르르']], note: '물을 빨아들이는 스펀지를 본뜨면 오히려 흠뻑 젖어요' },
    s14: { k: 'mimic', rows: [[M.maple, M.heli, '빙글빙글 도는 날개'], [M.dand, M.para, '바람을 타는 솜털']] }
  },
  u3_l09: {
    s05: { k: 'mimic', verb: '이렇게', ha: '벌레잡이 식물', hb: '잡는 방법', rows: [[A('파리지옥'), { name: '잎을 닫아요' }], [A('끈끈이주걱'), { name: '끈끈이로 붙여요' }], [A('벌레잡이통풀'), { name: '통에 빠뜨려요' }], [A('통발'), { name: '빨아들여요' }]] },
    s06: { k: 'chain', items: [{ emoji: '🏜️', name: '양분이 적은 땅' }, { emoji: '🪰', name: '벌레를 잡아요' }, { emoji: '🌱', name: '부족한 양분을 더 얻어요', on: true }] },
    s07: { k: 'bins', bins: [{ name: '이렇게 해요', emoji: '○', tone: 't0', items: [{ name: '가만히 관찰해요', emoji: '👀' }] }, { name: '하지 않아요', emoji: '✗', tone: 'x', items: [{ name: '잎을 자꾸 건드리기', emoji: '👆' }] }], note: '벌레잡이 식물도 **햇빛을 받아 살아가요**' }
  },
  u3_l10: {
    s05: { k: 'chain', items: [{ emoji: '🧺', name: '분류' }, { emoji: '🗺️', name: '사는 곳' }, { emoji: '💡', name: '생활 속 이용' }, { emoji: '✨', name: '신기한 식물' }] },
    s06: { k: 'habitat', zones: [{ at: 'field', items: [A('소나무')] }, { at: 'lake', items: [A('부레옥잠')] }, { at: 'desert', items: [A('선인장')] }], note: '사는 곳에 **알맞은 생김새**' },
    s07: { k: 'mimic', rows: [[M.burr, M.velcro], [M.lotus, M.coat]], note: '식물을 **소중히** 여겨요' }
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_science_u3.js'), F);
