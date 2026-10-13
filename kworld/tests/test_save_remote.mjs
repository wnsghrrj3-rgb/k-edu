// 서버 저장 시험 — 정식 좌석이면 kworld_progress upsert(인생 층 포함)·끝 카드 kworld_jokbo insert·다른 기기 재개(loadMerged 가 새것 고름)·서버 족보 → 이 기기 carry(syncJokbo) · 좌석 없으면 아무것도 안 함
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.join(here, '..');
const src = fs.readFileSync(path.join(root, 'core/save.js'), 'utf8');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const tick = () => new Promise((r) => setTimeout(r, 5));

// ---- 가짜 Supabase (체인 쿼리 → 표에 쓰고 읽는다) ----
const tables = { kworld_progress: [], kworld_jokbo: [] };
const fakeDb = { from(t) { const rows = tables[t]; const q = { _f: [], _sel: null, _ord: null, _lim: null, _op: null, _data: null,
  select(s) { q._sel = s; q._op = q._op || 'select'; return q; }, eq(k, v) { q._f.push([k, v]); return q; }, order(k, o) { q._ord = [k, o?.ascending !== false]; return q; }, limit(n) { q._lim = n; return q; },
  upsert(d) { q._op = 'upsert'; q._data = d; return q; }, insert(d) { q._op = 'insert'; q._data = d; return q; }, delete() { q._op = 'delete'; return q; }, maybeSingle() { q._single = true; return q; },
  _run() { const m = (r) => q._f.every(([k, v]) => r[k] === v); let out = rows.filter(m); if (q._ord) out = out.slice().sort((a, b) => (a[q._ord[0]] > b[q._ord[0]] ? 1 : -1) * (q._ord[1] ? 1 : -1)); if (q._lim) out = out.slice(0, q._lim);
    if (q._op === 'upsert') { const i = rows.findIndex((r) => r.student_id === q._data.student_id && r.era === q._data.era); if (i >= 0) rows[i] = q._data; else rows.push(q._data); return { data: [q._data], error: null }; }
    if (q._op === 'insert') { rows.push(q._data); return { data: [q._data], error: null }; }
    if (q._op === 'delete') { for (let i = rows.length - 1; i >= 0; i--) if (m(rows[i])) rows.splice(i, 1); return { data: null, error: null }; }
    return { data: q._single ? (out[0] || null) : out, error: null }; },
  then(res, rej) { return Promise.resolve(q._run()).then(res, rej); }, catch(f) { return Promise.resolve(q._run()).catch(f); } }; return q; } };

// ---- 가짜 브라우저 ----
const ls = {}; globalThis.localStorage = { getItem: (k) => ls[k] ?? null, setItem(k, v) { ls[k] = String(v); }, removeItem(k) { delete ls[k]; } };
let tier = { tier: 'student', profile: { profile_id: 'stu-1' } };
globalThis.window = { KeduTier: { resolve: async () => tier, canSave: (t) => !!(t && t.tier === 'student') } };
globalThis.getKeduDb = () => fakeDb;
const { Save, syncJokbo, seat } = await import(path.join(root, 'core/save.js'));
const g = { flags: new Set(['a', 'b', 'sit:x:done']), inventory: ['stone'], hunger: 70, p: { pos: { x: 1.23, z: -4.5 }, yaw: 0.5 }, results: [], telemetry: { missions: [{ sec: 30 }], hints: 1, starved: 0 }, character: { id: 'eye' }, sex: { id: 'f' }, mi: 3, life: { snapshot: () => ({ values: { craft: 2, heart: 3, grain: 0 }, statusName: '농민', log: [1, 2], hurt: [] }) }, story: { cutsceneOn: false } };

// 1) 정식 좌석 → upsert 에 인생 층·성별·사람
const sv = new Save(g, 'neo'); sv.write(); await tick(); await tick();
const row = tables.kworld_progress[0];
ok(row && row.student_id === 'stu-1' && row.era === 'neo', '학생 행 upsert');
ok(row && row.life?.values?.craft === 2 && row.chr === 'eye' && row.sex === 'f' && row.mi === 3, '인생 층·사람·성별·미션 저장 ' + JSON.stringify(row?.life?.values));
ok(row && Array.isArray(row.flags) && row.flags.length === 3 && row.pos[0] === 1.2, '깃발·자리');
ok(JSON.parse(ls['kworld_progress:neo']).life.statusName === '농민', '이 기기에도');

// 2) 끝 카드 → 족보 한 줄
await sv.recordEnd({ branch: 'rich', title: '곳간이 찬 집', status: 'rich', statusName: '곳간이 찬 집', nation: null, nationName: null, craft: 4, heart: 2, grain: 5, marks: ['절뚝'], sits: 7, t: 1700000000000 });
const jb = tables.kworld_jokbo[0];
ok(jb && jb.era === 'neo' && jb.title === '곳간이 찬 집' && jb.record.grain === 5 && jb.ended_at === new Date(1700000000000).toISOString(), '족보 insert ' + JSON.stringify(jb));

// 3) 다른 기기 — 기기 저장 없음 → 서버 것으로 재개, 족보도 당겨 carry 가 생긴다
for (const k of Object.keys(ls)) delete ls[k];
const sv2 = new Save(g, 'neo'); const snap = await sv2.loadMerged();
ok(snap && snap.flags.length === 3 && snap.life.statusName === '농민' && snap.sex === 'f' && snap.char === 'eye', '서버 저장으로 재개 ' + JSON.stringify(snap && { f: snap.flags.length, s: snap.sex }));
ok(ls['kworld_progress:neo'], '서버 것을 이 기기에 베낌');
const carry = JSON.parse(ls['kworld_carry:neo'] || 'null'); ok(carry && carry.grain === 5 && carry.t === 1700000000000, '서버 족보 → kworld_carry:neo ' + JSON.stringify(carry));
const hist = JSON.parse(ls['kworld_jokbo'] || '[]'); ok(hist.length === 1 && hist[0].title === '곳간이 찬 집', '서버 족보 → kworld_jokbo 기록');

// 4) 기기 것이 더 새면 기기 것
ls['kworld_progress:neo'] = JSON.stringify({ v: 1, era: 'neo', flags: ['z'], inventory: [], t: Date.now() + 100000 });
const snap2 = await sv2.loadMerged(); ok(snap2.flags[0] === 'z', '기기 저장이 더 새면 기기 것');
// 서버 것이 더 새면 서버 것
ls['kworld_progress:neo'] = JSON.stringify({ v: 1, era: 'neo', flags: ['old'], inventory: [], t: 1 });
const snap3 = await sv2.loadMerged(); ok(snap3.flags.length === 3, '서버 저장이 더 새면 서버 것');
// 족보 두 번 당겨도 기록은 한 줄
await syncJokbo(); ok(JSON.parse(ls['kworld_jokbo']).length === 1, '족보 중복 없음');

// 5) 처음부터 → 서버 행도 지움
sv2.clear(); await tick(); await tick(); ok(tables.kworld_progress.length === 0 && !ls['kworld_progress:neo'], '처음부터 = 서버 행도 삭제');
ok(tables.kworld_jokbo.length === 1, '족보는 안 지운다');

// 6) 좌석 없음(게스트·방문자·교사) → 서버에 아무것도 안 쓴다 (seat 는 한 번 묻고 기억하므로 새 모듈로)
tables.kworld_progress.length = 0; tier = { tier: 'guest', guest: { code: 'ABCD' } };
const mod2 = await import(path.join(root, 'core/save.js') + '?v=2'); const sv3 = new mod2.Save(g, 'neo'); sv3.write(); await tick(); await tick();
ok(tables.kworld_progress.length === 0 && ls['kworld_progress:neo'], '게스트: 서버 0, 기기만(동의 전 기기 저장은 kedu_scope 가 메모리로 막는다)');
await sv3.recordEnd({ branch: 'x', t: 1 }); ok(tables.kworld_jokbo.length === 1, '게스트: 족보 서버 0');
ok(!(await mod2.syncJokbo()), '게스트: syncJokbo false');

// 7) index.html·jokbo.html 이 케이에듀 스크립트를 싣는다(scope 가 먼저) · SQL #38 에 열·표·뷰가 있다
for (const f of ['index.html', 'jokbo.html']) { const h = fs.readFileSync(path.join(root, f), 'utf8'); const i = h.indexOf('/kedu_scope.js'), j = h.indexOf('supabase-js'), k = h.indexOf('/kedu_tier.js'); ok(i > 0 && j > i && k > j && h.indexOf('/kedu_config.js') > j, f + ' 케이에듀 스크립트 순서'); }
const sql = fs.readFileSync(path.join(root, '../sql/setup_kworld_progress.sql'), 'utf8');
for (const t of ['add column if not exists life jsonb', 'add column if not exists chr', 'add column if not exists sex', 'add column if not exists mi', 'create table if not exists kworld_jokbo', 'create view report_kworld with (security_invoker = true)', 'create view report_kworld_jokbo with (security_invoker = true)', 'p_kworld_jokbo_teacher_read']) ok(sql.includes(t), 'SQL #38 v2: ' + t);
ok(src.includes("from('kworld_jokbo').insert") && src.includes("from('kworld_progress').upsert"), 'save.js 표 이름');
const rep = fs.readFileSync(path.join(root, '../teacher/learning-report.html'), 'utf8');
for (const s of ['why_n', 'why_ok_n', 'luck_n', 'luck_hold_n', 'hist_results', "p.life->>'status' as status"]) ok(sql.includes(s), 'SQL v3 report_kworld 열 ' + s);
ok(rep.includes('kworldWhyHtml(K)') && rep.includes('hist_results') && rep.includes('/kworld/eras/dogam.json') && rep.includes('오개념'), '교사 리포트 왜·운·도감 칸');
const lib = fs.readFileSync(path.join(root, '../kedu_report_lib.js'), 'utf8'); ok(lib.includes('why_ok_n') && lib.includes('luck_hold_n') && lib.includes('살아 본 집') && lib.includes('/kworld/dogam.html'), '학생·학부모 리포트 왜·운·도감 줄');
const tg = fs.readFileSync(path.join(root, 'teacher.html'), 'utf8'); ok(tg.includes('./eras/chain.json') && tg.includes('왜 그랬을까') && tg.includes('판단하지 않는다') && rep.includes('/kworld/teacher.html'), '교사 안내 한 장(teacher.html) + 리포트에서 링크');
ok(rep.includes("from('report_kworld_jokbo')") && rep.includes("from('report_kworld')") && rep.includes('kworldClassHtml(C)') && rep.includes('kworldStudentHtml(kwStu)') && rep.includes('/kworld/eras/chain.json'), '교사 리포트 케이히스토리 칸');

console.log(`save_remote ${pass}/${fail}`); process.exit(fail ? 1 : 0);
