// 케이월드 128 — 탐험일지 🧬 물려받은 것: carryIn 이 적어 둔 것이 journalHtml 맨 위에 다시 보인다(토스트는 한 번 지나가지만 일지는 언제든).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const { Life } = await import('../core/life.js'); const { Story } = await import('../core/story.js');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const J = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const mk = (carry) => { const says = []; const g = { flags: new Set(), ui: { say: (t) => says.push(t) }, world: { journal: { a: { title: '발견 하나', note: '한 줄' } } }, era: 'x' }; const l = Object.create(Life.prototype); l.g = g; l.d = { carry }; l.values = { craft: 1, heart: 0, grain: 0 }; l.hurt = new Set(); g.life = l; return { g, l, says }; };
// ① 데이터 — carry 있는 열 시대 전부 fromName 이 chain short 와 같다, 구석기는 carry 없음
const chain = J('eras/chain.json'); const short = Object.fromEntries(chain.eras.map((e) => [e.era, e.short]));
let n = 0; for (const e of chain.eras) { const d = J(`eras/${e.era}/life.json`); if (!d.carry) continue; n++; ok(d.carry.fromName === short[d.carry.from], `${e.era} carry.fromName = ${short[d.carry.from]}`); }
ok(n === 10 && !J('eras/life/life.json').carry, 'carry 있는 시대 열 · 구석기엔 없음');
// ② 조상 기록 있음 → inherited 채움 → 일지 🧬 칸에 시대·갈림·신분·값·물려줄 것·흔적·이름
store['kworld_carry:joseon-life'] = JSON.stringify({ craft: 4, heart: 2, grain: 3, branch: 'feeder', title: '곳간을 연 양반의 집', status: 'yangban', statusName: '양반', heirlooms: [{ id: 'h1', name: '깨진 벼루' }], marks: ['절뚝이는 다리'], titles: [{ id: 't1', name: '호랑이와 눈을 맞춘 사람' }] });
{ const { g, l } = mk({ from: 'joseon-life', fromName: '조선 전기', keep: ['craft', 'heart', 'grain'], ratios: { craft: 0.5, heart: 0.5, grain: 1.0 } }); l.carryIn();
  ok(l.inherited && l.inherited.fromName === '조선 전기' && l.inherited.title === '곳간을 연 양반의 집' && l.inherited.statusName === '양반', 'inherited 시대·갈림·신분');
  ok(l.inherited.got.join('|') === '✋ 솜씨 2|🤝 인심 1|🌾 곡식 3' && l.values.craft === 3 && l.values.grain === 3, '넘어온 값 셋(비율대로)');
  ok(l.inherited.heirlooms[0] === '깨진 벼루' && l.inherited.marks[0] === '절뚝이는 다리' && l.inherited.titles[0] === '호랑이와 눈을 맞춘 사람', '물려줄 것·흔적·이름');
  const h = l.inheritHtml(); ok(h.includes('🧬 물려받은 것') && h.includes('조선 전기') && h.includes('「곳간을 연 양반의 집」') && h.includes('양반') && h.includes('✋ 솜씨 2 · 🤝 인심 1 · 🌾 곡식 3') && h.includes('🎁 물려줄 것 깨진 벼루') && h.includes('🩹 조상의 흔적 절뚝이는 다리') && h.includes('🏷 조상의 이름 호랑이와 눈을 맞춘 사람'), '🧬 칸 한 줄씩: ' + h);
  g.flags.add('journal:a'); const st = Object.create(Story.prototype); st.g = g; const jh = st.journalHtml(); ok(jh.indexOf('🧬') > jh.indexOf('📔 탐험일지') && jh.indexOf('🧬') < jh.indexOf('발견 하나'), '탐험일지 제목 바로 밑·발견 목록 위');
  l.carryIn(); ok(l.values.craft === 3 && l.inherited.got.length === 3, '두 번 안 더함(carried)'); }
// ③ 조상 기록 없음 → 첫 사람 한 줄 · 값 0 이면 「넘어온 값은 없다」 · carry 없는 시대(구석기)는 빈 글 · 글자 escape
// 137 — 조상이 만난 사람(carry.figures) · 인물이 남긴 것(heirlooms from figure)은 🎁 줄과 따로 「(이순신에게서)」
store['kworld_carry:joseon-late-life'] = JSON.stringify({ craft: 2, heart: 2, branch: 'x', title: '장시 집', heirlooms: [{ id: 'h1', name: '깨진 벼루' }, { id: 'figure:fig_yisunsin', name: '거북선 쇠못', from: 'figure', tag: '📯 이순신이 남긴 것' }, { id: 'bond:b', name: '돌쇠의 짚신', from: 'bond', tag: '👤 돌쇠' }], figures: [{ id: 'yisunsin', name: '이순신', choice: '배 만드는 나무를 댄다' }, { id: 'saimdang', name: '신사임당', choice: null }] });
{ const { l } = mk({ from: 'joseon-late-life', fromName: '조선 후기', keep: ['craft', 'heart'] }); l.carryIn(); const h = l.inheritHtml();
  ok(l.inherited.figures.length === 2 && l.inherited.relics.length === 1 && l.inherited.relics[0].who === '이순신' && l.inherited.heirlooms.length === 2, '137 inherited — 만난 사람 둘·인물이 남긴 것 하나(who)·🎁 줄엔 인물 것 뺌');
  ok(h.includes('👤 조상이 만난 사람 이순신(배 만드는 나무를 댄다)·신사임당') && h.includes('🎁 거북선 쇠못(이순신에게서)') && h.includes('🎁 물려줄 것 깨진 벼루·돌쇠의 짚신') && !h.includes('물려줄 것 깨진 벼루·돌쇠의 짚신·거북선'), '137 🧬 칸 — 「👤 조상이 만난 사람 …」 + 「🎁 …(이순신에게서)」: ' + h); }
{ const { l } = mk({ from: 'goryeo-life', fromName: '고려', keep: ['craft'] }); l.carryIn(); ok(l.inherited === null && l.inheritHtml().includes('이 집의 첫 사람') && l.inheritHtml().includes('맨손'), '조상 없음 → 첫 사람'); }
store['kworld_carry:neo'] = JSON.stringify({ craft: 0, heart: 0, branch: 'left', title: '떠난 <집>' });
{ const { l, says } = mk({ from: 'neo', fromName: '신석기', keep: ['craft', 'heart'] }); l.carryIn(); const h = l.inheritHtml(); ok(l.inherited.got.length === 0 && h.includes('넘어온 값은 없다') && h.includes('「떠난 &lt;집&gt;」') && !h.includes('🎁') && !h.includes('🩹') && says.length === 0, '값 0 — 한 줄·토스트 없음·escape'); }
{ const { l } = mk(undefined); ok(l.inheritHtml() === '' && !('inherited' in l), '구석기(carry 없음) 빈 글'); }
{ const st = Object.create(Story.prototype); st.g = { flags: new Set(), world: {} }; ok(st.journalHtml().includes('아직 적은 게 없어') && !st.journalHtml().includes('🧬'), 'life 없는 세계(story-p1)는 전처럼'); }
console.log(`inherit ${pass}/${fail}`); process.exit(fail ? 1 : 0);
