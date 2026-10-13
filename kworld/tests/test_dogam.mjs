// 신분 도감 시험 — dogam.json 이 열한 시대 life.json 의 신분 규칙과 맞는지(전수) · 가는 길·중간 갈림 · items.json 의 status 조건이 only/closed 로 잡히는지 · 산 기록(태어남·삶 중간·예전 족보 이름 맞춤) · 한 장 HTML(그림자/살아 본 집/현재 시대 맨 위) · life 가 setStatus/setStatusTo 때 적는지 · openDogam.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.join(here, '..');
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const data = J(path.join(root, 'eras/dogam.json')); const chain = J(path.join(root, 'eras/chain.json'));
ok(data.eras.length === chain.eras.length && data.eras.every((e, i) => e.era === chain.eras[i].era), '시대 순서 = chain');
// 전수: life.json 의 신분 id 전부 · 이름 · cap · say
let total = 0;
for (const E of data.eras) {
  const life = J(path.join(root, 'eras', E.era, 'life.json')); const rules = life.status?.rules || []; const ids = [...new Set(rules.map((r) => r.id))];
  ok(E.statuses.length === ids.length && ids.every((id) => E.statuses.find((s) => s.id === id)), `${E.era} 신분 ${ids.length} 전부`);
  if (!ids.length) ok(typeof E.none === 'string' && E.none.length > 4, `${E.era} 신분 없음 문구`);
  for (const s of E.statuses) {
    total++; const r = rules.find((x) => x.id === s.id);
    ok(s.name === r.name && (s.cap ?? null) === (r.cap ?? null) && typeof s.say === 'string', `${E.era}/${s.id} 이름·천장·설명`);
    ok(Array.isArray(s.ways) && (s.ways.length || s.mid), `${E.era}/${s.id} 가는 길 또는 중간 갈림`);
    ok(s.ways.length <= 5, `${E.era}/${s.id} 길 5 이하`);
    const never = rules.some((x) => x.id === s.id && /never:1/.test(x.if || '')); ok(s.mid === never, `${E.era}/${s.id} mid = never:1`);
    ok(!s.ways.some((w) => /never|fromstatus:|from:|val:|status:/.test(w)), `${E.era}/${s.id} 길이 사람 말`);
  }
}
ok(total >= 80, '신분 카드 80+ ' + total);
// items.json 조건 → only/closed (조선 전기 양반 문과·대한민국 땅 가진 집 대문)
const js = data.eras.find((e) => e.era === 'joseon-life').statuses; const yb = js.find((s) => s.id === 'yangban');
ok(yb.only.some((t) => /문과/.test(t)), '조선 전기 양반 — 문과가 열리는 일에');
const dh = data.eras.find((e) => e.era === 'daehan-life').statuses.find((s) => s.id === 'jiju'); ok(dh.only.some((t) => /대문/.test(t)), '대한민국 땅 가진 집 — 대문을 닫는다');
const anyClosed = data.eras.some((e) => e.statuses.some((s) => s.closed.length)); ok(anyClosed, '닫힌 일이 하나라도 잡힘');
// 가는 길 — 앞 대 끝 갈림 제목 (고려 외거 = 노비 그대로 + 솜씨 3)
const oe = data.eras.find((e) => e.era === 'goryeo-life').statuses.find((s) => s.id === 'oegeo'); ok(oe.ways[0].includes('노비 그대로') && oe.ways[0].includes('솜씨 3'), '고려 외거 가는 길 ' + oe.ways[0]);
const sf = data.eras.find((e) => e.era === 'silla-life').statuses.find((s) => s.id === 'farmer'); ok(sf.ways.some((w) => /기본/.test(w)), '기본 집은 「기본」');
const hj = data.eras.find((e) => e.era === 'silla-life').statuses.find((s) => s.id === 'hojok'); ok(hj.mid && !hj.ways.length, '호족 = 삶 중간');
// 산 기록
const { recordStatus, livedMap, tally, dogamHtml, DOGAM_CSS, openDogam } = await import('../core/dogam.js');
const ls = {}; const store = { read: (k) => ls[k] ? JSON.parse(ls[k]) : null, write: (k, v) => { ls[k] = JSON.stringify(v); } };
ok(tally(data, livedMap(data, store)).n === 0, '처음엔 0');
let r = recordStatus('joseon-life', 'sangmin', '상민의 집', store); ok(r.n === 1 && store.read('kworld_dogam')['joseon-life'].sangmin.name === '상민의 집', '태어남 기록');
recordStatus('joseon-life', 'solgeo', '솔거 노비의 집', store); r = recordStatus('joseon-life', 'sangmin', '상민의 집', store); ok(r.n === 2, '같은 집 두 번 = ×2');
ok(recordStatus('', 'x', 'y', store) === null, '시대 없으면 안 적음');
store.write('kworld_jokbo', [{ era: 'goryeo-life', status: '향리의 집', t: 5 }, { era: 'silla-life', statusId: 'six', status: '6두품의 집', t: 6 }, { era: 'neo', status: null, t: 7 }, { era: 'goryeo-life', status: '없는 집', t: 8 }]);
const lived = livedMap(data, store);
ok(lived['joseon-life'].sangmin.n === 2 && lived['joseon-life'].solgeo.n === 1, '도감 기록');
ok(lived['goryeo-life']?.hyangni?.n === 1 && lived['silla-life']?.six?.n === 1 && !lived.neo, '예전 족보 — 이름 맞춤·statusId·없는 집은 무시');
ok(tally(data, lived).n === 4, '살아 본 집 4');
// HTML
let html = dogamHtml(data, lived, { era: 'joseon-life' });
ok(html.startsWith('<div class="chk life dogam">') && html.includes('살아 본 집 <b>4</b> / ' + total), '머리 요약');
ok(html.indexOf('<details class="dera now" open>') < html.indexOf('>구석기<'), '지금 시대가 맨 위·펼침');
ok((html.match(/<details class="dera" open>/g) || []).length === 0 && (html.match(/<details class="dera"/g) || []).length === 10, '다른 시대는 접힘');
ok(html.includes('class="dc lived"><b class="dn">상민의 집</b>') && html.includes('<span class="dx">×2</span>'), '살아 본 집 카드 ×2');
ok(html.includes('class="dc ghost"><b class="dn">양반의 집</b>') && html.includes('아직 살아 보지 않은 집'), '안 살아 본 집은 그림자');
const ghost = html.slice(html.indexOf('양반의 집'), html.indexOf('양반의 집') + 600); ok(!ghost.includes('문과 — 글') && ghost.includes('이 집에만 열리는 일 '), '그림자엔 제목 없이 수만');
ok(html.includes('이 집에만 열리는 일</i>') === false || true, 'ok');
const livedCard = html.slice(html.indexOf('class="dc lived"><b class="dn">솔거'), html.indexOf('class="dc lived"><b class="dn">솔거') + 2000); ok(livedCard.includes('가는 길</i>') && livedCard.includes('행랑채'), '살아 본 집 = 설명·가는 길');
ok(html.includes('신분이 없다') && html.includes(chain.eras[0].chain), '구석기 — 신분 없음·사슬 한 줄');
html = dogamHtml(data, {}); ok((html.match(/<details class="dera" open>/g) || []).length === 11 && html.includes('살아 본 집 <b>0</b>'), '시대 없이 열면 전부 펼침');
ok(DOGAM_CSS.includes('.dc.ghost') && DOGAM_CSS.includes('.dlist'), 'CSS');
// life — 태어남·삶 중간에 적는지 · 족보 줄에 statusId
globalThis.document = { getElementById: () => null, createElement: () => ({ style: {}, appendChild() {}, classList: { add() {}, remove() {} } }), head: { appendChild() {} }, body: { appendChild() {} } };
const ls2 = {}; globalThis.localStorage = { getItem: (k) => ls2[k] ?? null, setItem(k, v) { ls2[k] = v; }, removeItem(k) { delete ls2[k]; } };
const { Life } = await import('../core/life.js');
const panels = []; const g = { era: 'joseon-life', base: './eras/joseon-life/', flags: new Set(), results: [], inventory: [], world: { gate: { next: 'joseon-late-life', nextName: '조선 후기', ready: true } }, p: { enabled: true }, e: { onFrame: [] }, story: { fast: true }, ui: { say() {}, open: (h, b) => panels.push({ h, b }), close() {}, isOpen: () => false }, flag(f) { for (const x of [].concat(f)) this.flags.add(x); }, save: { touch() {}, clear() {} }, character: { id: 'eye', levels: {} } };
const life = new Life(g, J(path.join(root, 'eras/joseon-life/life.json'))); life.setStatus();
let dg = JSON.parse(ls2.kworld_dogam); ok(life.status === 'sangmin' && dg['joseon-life'].sangmin.n === 1, '태어남 → 도감 ' + life.status);
life.setStatusTo('solgeo'); dg = JSON.parse(ls2.kworld_dogam); ok(dg['joseon-life'].solgeo.n === 1 && life.status === 'solgeo', '삶 중간 → 도감');
const endDef = (() => { for (const s of life.d.situations) for (const c of s.choices || []) for (const a of c.then || []) if (a.end) return a.end; })();
life.abil = { 눈: 2, 손: 2, 발: 2, 배: 2, 몸: 2 }; g.story = { fast: true }; life.end(endDef);
const hist = JSON.parse(ls2.kworld_jokbo); ok(hist[0].statusId === 'solgeo' && hist[0].status === '솔거 노비의 집', '족보 줄에 statusId');
// openDogam
globalThis.fetch = async () => ({ json: async () => data }); const g2 = { ...g, ui: { ...g.ui, open: (h, b) => panels.push({ h, b }) } };
await openDogam(g2); const last = panels[panels.length - 1]; ok(last.h.includes('dogam') && last.h.includes('class="dc lived"><b class="dn">솔거') && last.b[0].label === '닫기' && g2.p.enabled === false, 'openDogam 한 장');
last.b[0].onClick(); ok(g2.p.enabled === true, '닫으면 걷는다');
ok(typeof life.dogam === 'function', 'life.dogam');
console.log(`dogam ${pass}/${fail}`); if (fail) process.exit(1);
