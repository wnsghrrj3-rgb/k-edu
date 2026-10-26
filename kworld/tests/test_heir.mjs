// 케이월드 129 — 「그 뒤」 카드 🧬 다음 대가 받는 것: bridge.carry(다음 시대 carry 와 같음) 로 지금 값을 셈해 한 줄.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem(k, v) { store[k] = v; }, removeItem(k) { delete store[k]; } };
globalThis.document = { getElementById: () => ({ style: {}, classList: { contains: () => false } }) };
const { Life } = await import('../core/life.js');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const J = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
// ① 데이터 — 열 시대 bridge.carry 가 다음 시대 life.json carry 와 같다(keep·ratios·next=short), 대한민국엔 없음
const chain = J('eras/chain.json').eras;
for (let i = 0; i < chain.length - 1; i++) { const w = J(`eras/${chain[i].era}/world.json`), c = J(`eras/${chain[i + 1].era}/life.json`).carry; const bc = w.bridge?.carry; const keep = c.keep || ['craft', 'heart']; ok(bc && bc.next === chain[i + 1].short && JSON.stringify(bc.keep) === JSON.stringify(keep) && keep.every((k) => bc.ratios[k] === ((c.ratios || {})[k] ?? c.ratio ?? 0.5)), `${chain[i].era} bridge.carry = ${chain[i + 1].era} carry`); }
ok(!J(`eras/${chain[chain.length - 1].era}/world.json`).bridge?.carry, '대한민국엔 bridge.carry 없음');
// ② 엔진
const mk = (carry, values, hurt = []) => { const l = Object.create(Life.prototype); l.g = { era: 'joseon-life', flags: new Set(), world: { bridge: carry ? { carry } : {} } }; l.values = values; l.hurt = new Set(hurt); l.d = { hurts: { leg: { name: '절뚝이는 다리' } } }; return l; };
const C = { next: '조선 후기', keep: ['craft', 'heart', 'grain'], ratios: { craft: 0.5, heart: 0.5, grain: 1.0 } };
let h = mk(C, { craft: 5, heart: 3, grain: 2 }).heirLine(); ok(h.startsWith('조선 후기의 자손이 받는 것 — ✋ 솜씨 3 · 🤝 인심 2 · 🌾 곡식 2') && h.endsWith('(솜씨·인심은 절반만, 곡식은 그대로)') && !h.includes('🎁') && !h.includes('🩹'), '값 비율·반올림·규칙 한 줄: ' + h);
h = mk(C, { craft: 0, heart: 0, grain: 0 }).heirLine(); ok(h.includes('넘어갈 값이 없다') && h.includes('맨손'), '값 0 → 맨손');
store.kworld_heirlooms = JSON.stringify([{ id: 'a', era: 'joseon-life', name: '깨진 벼루' }, { id: 'b', era: 'neo', name: '다른 시대 것' }]); store.kworld_titles = JSON.stringify([{ id: 't1', era: 'joseon-life', name: '이름 하나' }, { id: 't2', era: 'joseon-life', name: '이름 둘' }, { id: 't3', era: 'joseon-life', name: '이름 셋' }, { id: 't4', era: 'joseon-life', name: '이름 넷' }]);
h = mk(C, { craft: 1, heart: 0, grain: 0 }, ['leg']).heirLine(); ok(h.includes('✋ 솜씨 1') && !h.includes('🤝') && h.includes('🎁 깨진 벼루') && !h.includes('다른 시대') && h.includes('🩹 절뚝이는 다리') && h.includes('🏷 이름 하나·이름 둘·이름 셋 외 1'), '0.5 → 1 · 🎁 이 시대 것만 · 🩹 · 🏷 셋+외: ' + h);
h = mk({ next: '신석기', keep: ['craft', 'heart'] }, { craft: 4, heart: 2 }).heirLine(); ok(h.includes('✋ 솜씨 2 · 🤝 인심 1') && h.endsWith('(솜씨·인심은 절반만)'), 'ratios 없으면 0.5');
ok(mk(null, { craft: 9 }).heirLine() === '', 'bridge.carry 없으면 빈 글');
// ③ bridge() 가 🧬 줄을 카드에 넣는다
const src = fs.readFileSync(path.join(root, 'core/life.js'), 'utf8'); ok(/const heir = this\.heirLine\(\);/.test(src) && /class=\\?"ear heir\\?"><b>🧬<\/b> \$\{esc\(heir\)\}/.test(src), 'bridge 카드 🧬 줄(👂 뒤)');
console.log(`heir ${pass}/${fail}`); process.exit(fail ? 1 : 0);
