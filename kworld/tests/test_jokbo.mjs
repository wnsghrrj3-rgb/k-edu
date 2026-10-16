// 족보 시험 — chain.json 이 시대 문(gate) 순서와 맞는지 · 끝 카드가 carry 에 제목·신분 이름·흔적 이름을 남기는지 · 족보 줄 모으기(이 집/지난 집/지금/아직) · 끝 카드 「📜 족보」 단추 · openJokbo 가 한 장을 여는지.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.join(here, '..');
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const chain = J(path.join(root, 'eras/chain.json')); const E = chain.eras;
ok(E.length === 11, '대 11');
for (let i = 0; i < E.length; i++) {
  const e = E[i]; const dir = path.join(root, 'eras', e.era); ok(fs.existsSync(path.join(dir, 'world.json')) && fs.existsSync(path.join(dir, 'life.json')), e.era + ' world·life');
  const w = J(path.join(dir, 'world.json')); ok(w.short === e.short, e.era + ' short 같음 ' + w.short); ok(e.chain && e.chain.includes('→'), e.era + ' 사슬 한 줄에 →');
  const next = E[(i + 1) % E.length].era; ok(w.gate?.next === next && w.gate.ready === true, `${e.era} 문 → ${next} (실제 ${w.gate?.next})`);
  if (i > 0) { const l = J(path.join(dir, 'life.json')); ok(l.carry?.from === E[i - 1].era, e.era + ' carry from ' + E[i - 1].era); }
}
// 줄 모으기
const { collect, jokboHtml, carryRecord, openJokbo } = await import('../core/jokbo.js');
const rec = (t, extra = {}) => JSON.stringify({ craft: 3, heart: 2, grain: 0, rank: 0, branch: 'b', title: '갈림', statusName: null, marks: [], sits: 5, t, ...extra });
const store = { 'kworld_carry:life': rec(100), 'kworld_carry:neo': rec(200, { marks: ['절뚝이는 다리'] }), 'kworld_carry:bronze-life': rec(50, { title: '옛 갈림' }), 'kworld_carry:goryeo-life': rec(999) };
let rows = collect(chain, null, (k) => store[k] ? JSON.parse(store[k]) : null);
ok(rows[0].kind === 'lived' && rows[1].kind === 'lived', '1·2대 이 집');
ok(rows[2].kind === 'old' && rows[2].title === '옛 갈림', '3대 — 앞 대보다 먼저 끝난 줄은 지난 집');
ok(rows[3].kind === 'none' && rows[6].kind === 'old', '4대 아직 · 7대는 끊긴 뒤라 지난 집');
let html = jokboHtml(chain, rows, { history: [{ era: 'life' }, { era: 'life' }, { era: 'neo' }] });
ok(html.includes('2대 / 11대') && html.includes('지난 집 1채') && html.includes('남은 흔적 1') && html.includes('아직 오지 않은 대') && html.includes('지난 집</span>'), '한 장 요약·줄');
ok(html.includes(E[0].chain) && !html.includes(E[2].chain), '사슬 한 줄은 이 집 줄에만');
// 지금 사는 시대 줄
const fakeLife = { nationName: '고구려', statusName: '평민의 집', values: { craft: 1, heart: 4, grain: 2, rank: 1 }, cap: () => 3, hurt: new Set(['leg']), d: { hurts: { leg: { name: '절뚝이는 다리' } } }, log: [1, 2] };
rows = collect(chain, { era: 'samguk-life', life: fakeLife }, (k) => store[k] ? JSON.parse(store[k]) : null);
ok(rows[4].kind === 'now' && rows[4].statusName === '평민의 집' && rows[4].cap === 3, '지금 사는 대');
html = jokboHtml(chain, rows); ok(html.includes('지금 사는 중') && html.includes('🎖 1/3') && html.includes('🏳️ 고구려'), '지금 줄 값·천장·나라');
ok(jokboHtml(chain, collect(chain, null, () => null)).includes('0대 / 11대'), '빈 기록');
// 물려줄 것 사슬 — chain.relics · carry 에 실린 것 + 이 기기 kworld_heirlooms 합침 · 줄 🎁 · 아래 상자 · 지난 집 것은 상자에 안 들어감
ok(E.every((e) => e.relics === 3), '시대마다 숨은 것 3(chain.relics)');
const { heirloomsOf, chestHtml } = await import('../core/jokbo.js');
const store2 = { ...store, 'kworld_carry:life': rec(100, { heirlooms: [{ id: 'axe', name: '옛날 주먹도끼', fact: '주먹도끼는 구석기 사람의 만능 도구였다.' }] }), 'kworld_heirlooms': JSON.stringify([{ id: 'axe', era: 'life', name: '옛날 주먹도끼' }, { id: 'shell', era: 'life', name: '구멍 뚫린 조개', tag: '강가 자갈밭' }, { id: 'comb', era: 'neo', name: '빗살무늬 조각' }, { id: 'sword', era: 'bronze-life', name: '부러진 동검 날' }, { id: 'tile', era: 'samguk-life', name: '연꽃무늬 수막새' }]) };
const rd2 = (k) => store2[k] ? JSON.parse(store2[k]) : null;
ok(heirloomsOf('life', rd2).length === 2 && heirloomsOf(null, rd2).length === 5, '이 기기 물려줄 것 — 시대별/전체');
rows = collect(chain, null, rd2);
ok(rows[0].heirlooms.length === 2 && rows[0].heirlooms[0].fact && rows[1].heirlooms.length === 1 && rows[2].kind === 'old' && rows[2].heirlooms.length === 1 && rows[4].kind === 'none' && rows[4].heirlooms.length === 1, '줄마다 물려줄 것(carry+기기 합침, 겹침 1)');
html = jokboHtml(chain, rows);
ok(html.includes('🎁 옛날 주먹도끼 · 구멍 뚫린 조개') && html.includes('2/3') && html.includes('집에 내려오는 것 4/33'), '줄 🎁 · 2/3 · 요약 4/33 ' + (html.match(/집에 내려오는 것 [^<]*/) || [])[0]);
ok(html.includes('jchest') && html.includes('📜 주먹도끼는') && html.includes('1대 구석기 · 강가 자갈밭') && !chestHtml(rows).includes('부러진 동검 날') && chestHtml(rows).includes('연꽃무늬 수막새'), '아래 상자 — 실제 한 줄·자리, 지난 집 것은 빠지고 아직 안 끝낸 시대 것은 들어감');
ok(chestHtml(collect(chain, null, () => null)) === '', '찾은 게 없으면 상자 없음');
// 끝 카드 — carry 기록·족보 단추
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, appendChild() {}, classList: { add() {}, remove() {} } }), head: { appendChild() {} }, body: { appendChild() {} } };
const ls = {}; globalThis.localStorage = { getItem: (k) => ls[k] ?? null, setItem(k, v) { ls[k] = v; }, removeItem(k) { delete ls[k]; } };
const { Life } = await import('../core/life.js');
const panels = []; const g = { era: 'neo', base: './eras/neo/', flags: new Set(), results: [], inventory: [], world: { gate: { next: 'bronze-life', nextName: '청동기', ready: true } }, p: { enabled: true }, e: { onFrame: [] }, story: { fast: true }, ui: { say() {}, open: (h, b) => panels.push({ h, b }), close() {}, isOpen: () => false }, flag(f) { for (const x of [].concat(f)) this.flags.add(x); }, save: { touch() {}, clear() {} } };
const life = new Life(g, J(path.join(root, 'eras/neo/life.json'))); life.values = { craft: 4, heart: 1, grain: 0, rank: 0 }; life.abil = { 눈: 2, 손: 2, 발: 2, 배: 2, 몸: 2 }; life.hurt.add('leg'); life.log.push({ sit: 'x', choice: 'y' });
const endDef = (() => { for (const s of life.d.situations) for (const c of s.choices || []) for (const a of c.then || []) if (a.end) return a.end; })();
life.end(endDef);
const saved = JSON.parse(ls['kworld_carry:neo']); ok(saved.title && typeof saved.title === 'string' && Array.isArray(saved.marks) && saved.sits === 1 && saved.craft === 4, '끝 카드 carry 에 제목·흔적 이름·상황 수 ' + saved.title);
ok(Array.isArray(saved.heirlooms), '끝 카드 carry 에 heirlooms 배열'); ok(JSON.parse(ls['kworld_jokbo']).length === 1 && JSON.parse(ls['kworld_jokbo'])[0].era === 'neo', '족보 기록 한 줄');
const endPanel = panels[panels.length - 1]; ok(endPanel.b.some((x) => x.label === '📜 족보') && endPanel.b.some((x) => x.label.startsWith('청동기로 가기')), '끝 카드 단추: 족보·다음 시대');
// openJokbo — chain.json 을 base 위에서 읽어 한 장을 연다, 닫으면 끝 카드로 돌아온다
globalThis.fetch = async (u) => { ok(u === './eras/chain.json', 'chain.json 경로 ' + u); return { json: async () => chain }; };
const before = panels.length; await endPanel.b.find((x) => x.label === '📜 족보').onClick(); await new Promise((r) => setTimeout(r, 20));
const jk = panels[panels.length - 1]; ok(panels.length === before + 1 && jk.h.includes('jokbo') && jk.h.includes('2대 / 11대') === false && jk.h.includes('1대 / 11대'), '족보 한 장(1대)');
jk.b[0].onClick(); ok(panels.length === before + 2 && panels[panels.length - 1].h.includes('이번 삶'), '닫으면 끝 카드 다시');
// 시대 사이 — 「청동기로 가기」를 누르면 족보가 먼저(「청동기로 →」 단추 + 돌아가기), 돌아가면 끝 카드
globalThis.location = { href: 'https://keduclass.com/kworld/?era=neo' }; let went = null; Object.defineProperty(globalThis.location, 'href', { get: () => 'https://keduclass.com/kworld/?era=neo', set: (v) => { went = v; } });
const b2 = panels.length; await endPanel.b.find((x) => x.label.startsWith('청동기로 가기')).onClick(); await new Promise((r) => setTimeout(r, 20));
const jk2 = panels[panels.length - 1]; ok(panels.length === b2 + 1 && jk2.h.includes('jokbo') && jk2.h.includes('다음 대로') && jk2.b[0].label === '청동기로 →' && jk2.b[1].label === '돌아가기' && went === null, '시대 사이 족보 먼저 ' + jk2.b.map((x) => x.label).join('/'));
jk2.b[1].onClick(); ok(panels[panels.length - 1].h.includes('이번 삶'), '돌아가기 → 끝 카드');
await endPanel.b.find((x) => x.label.startsWith('청동기로 가기')).onClick(); await new Promise((r) => setTimeout(r, 20)); panels[panels.length - 1].b[0].onClick(); ok(went && went.includes('era=bronze-life'), '「청동기로 →」 가 실제로 간다 ' + went);
console.log(`jokbo ${pass}/${pass + fail}`); if (fail) process.exit(1);
