/* =============================================================
 * test_hanja_data.js — 아침활동 한자 데이터 불변식 검산 (node)
 *   ① 어문회 배정한자 원본과 학년별 집합 대조(자수·누락·혼입)
 *   ② 학년 간 중복 배정 없음 · 훈음 표기법(훈에 공백 없음, 음 1글자)
 *   ③ 대표낱말이 그 학년까지 배운 한자로만 이뤄졌는지(어휘 사다리)
 *   ④ step 분할 무손실
 * 실행: node kedu/quiz/test_hanja_data.js
 * ============================================================= */
const D = require('./templates/hanja_data.js');
let fail = 0, pass = 0;
const T=(c,m)=>{ if(c){pass++;} else {fail++; console.log('  ✗ '+m);} };

// 어문회 배정 원본(나무위키 배정한자 표에서 대조 추출)
const SRC = {
1:'校敎九國軍金南女年大東六萬母木門民白父北四山三生西先小水室十五王外月二人一日長弟中靑寸七土八學韓兄火',
2:'家間江車工空氣記男內農答道動力立每名物方不事上姓世手時市食安午右子自場電前全正足左直平下漢海話活孝後',
3:'歌口旗同洞冬登來老里林面命文問百夫算色夕少所數植心語然有育邑入字祖住主重紙地千天川草村秋春出便夏花休',
4:'各角界計高公功共果科光球今急短堂代對圖讀童等樂利理明聞半反班發放部分社書線雪成省消術始身神信新弱藥業勇用運音飮意作昨才戰庭第題注集窓淸體表風幸現形和會',
5:'感強開京古苦交區郡根近級多待度頭例禮路綠李目美米朴番別病服本使死席石速孫樹習勝式失愛夜野陽洋言英永溫園遠由油銀醫衣者章在定朝族晝親太通特合行向號畫黃訓',
6:'價客格見結決敬告課過觀關廣具舊局基己念能團當德到獨朗良旅歷練勞流類陸望法變兵福奉史士仕産商相鮮仙說性洗歲束首宿順識臣實兒惡約養要友雨雲元偉以任財材的傳典展節切店情調卒種週州知質着參責充宅品必筆害化效凶'
};
const EXPECT = {1:50,2:50,3:50,4:75,5:75,6:100};

const seen = new Map();          // 한자 → 최초 학년
D.grades().forEach(g => {
  const rows = D.all(g);
  T(rows.length === EXPECT[g], `g${g} 신출 자수 ${rows.length} ≠ ${EXPECT[g]}`);

  // 배정 원본과 집합 대조
  const mine = new Set(rows.map(r=>r.c));
  const src  = new Set(Array.from(SRC[g]));
  const missing = [...src].filter(c=>!mine.has(c));
  const extra   = [...mine].filter(c=>!src.has(c));
  T(missing.length===0, `g${g} 배정 원본에 있는데 빠짐: ${missing.join('')}`);
  T(extra.length===0,   `g${g} 배정 원본에 없는 글자 섞임: ${extra.join('')}`);

  // 누적 집합(이 학년까지 배운 글자 전체)
  const cum = new Set();
  D.grades().filter(x=>x<=g).forEach(x=>D.all(x).forEach(r=>cum.add(r.c)));

  rows.forEach(r => {
    T(!seen.has(r.c) || seen.get(r.c)===g, `${r.c} 가 g${seen.get(r.c)}·g${g} 중복 배정`);
    if(!seen.has(r.c)) seen.set(r.c, g);
    T(!!r.hun && !!r.eum, `${r.c} 훈 또는 음 비어 있음`);
    T(r.hun.indexOf(' ')<0, `${r.c} 훈에 공백 있음(어문회 대표훈음 표기법 위배): ${r.hun}`);
    T(r.eum.length===1, `${r.c} 음이 1글자가 아님: ${r.eum}`);
    if (r.word) {
      T(!!r.wordKo, `${r.c} 대표낱말 ${r.word} 에 뜻풀이 없음`);
      T(r.word.indexOf(r.c)>=0, `${r.c} 가 제 대표낱말 ${r.word} 안에 없음`);
      const out = Array.from(r.word).filter(ch=>!cum.has(ch));
      T(out.length===0, `${r.c} 의 낱말 ${r.word} 이 g${g}까지 안 배운 한자 포함: ${out.join('')}`);
    }
  });
});

// step 분할 무손실
D.grades().forEach(g=>{
  const all = D.all(g), n = D.stepCount(g);
  let acc = [];
  for(let s=1;s<=n;s++) acc = acc.concat(D.step(g,s));
  T(acc.length===all.length && acc.every((r,i)=>r.c===all[i].c), `g${g} step 분할이 전체와 불일치`);
  T(D.upto(g,n).length===all.length, `g${g} upto(마지막)가 전체와 불일치`);
  T(D.step(g,n).length>0, `g${g} 마지막 회차가 비어 있음`);
});

console.log(`\n데이터 검사: ${pass} PASS / ${fail} FAIL`);
process.exit(fail?1:0);
