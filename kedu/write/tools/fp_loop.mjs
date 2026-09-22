#!/usr/bin/env node
/* 케이글쓰기 오탐 사전 루프 — write_fp_log(교사가 지운 자동 표시) → 사전 손질 제안
   쓰는 법:
     1) Supabase 표 write_fp_log 를 CSV 나 JSON 으로 내보낸다 (열: kind, original, fix, sentence, band, created_at)
        SQL: select kind, original, fix, sentence, band, created_at from write_fp_log order by created_at desc;
     2) node kedu/write/tools/fp_loop.mjs <내보낸 파일> [--min 2] [--out tests/kwrite_fp_proposals.json]
   하는 일:
     · (kind, original→fix) 로 묶어 몇 번 지웠는지 센다 — min 번 이상이면 「손질 후보」
     · 그 문장을 지금 사전으로 다시 돌려 아직도 같은 표시가 나오는지 본다(이미 고쳐진 것은 「해결됨」)
     · 어느 사전 항목이 그 표시를 냈는지 찾아(spelling·spacing·spoken·word 는 항목 하나씩 켜서 재현) 항목 번호와 re 를 보여 준다
     · 제안 두 가지 — ① 그 항목에 skipSent(문장 속 이 말이 있으면 넘김) 후보 ② 시험지 항목 {t, band, not:[{kind, original}]} (tests/kwrite_fp_proposals.json 에 쓰면 test_kedu_write_marks 가 같이 채점)
   사전은 여기서 안 고친다 — 준호·베프가 제안을 보고 corrections.json 을 손본다(정본). 학생 글 원문은 write_fp_log 에 문장 하나만 있으므로 그 이상 다루지 않는다. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const K = require(path.join(ROOT, 'engine.js'));
const D = n => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', n + '.json'), 'utf8'));
const base = { templates: D('templates'), signals: D('signals'), feedback: D('feedback'), corrections: D('corrections') };

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const MIN = +opt('--min', 2), OUT = opt('--out', null);
if (!file) { console.log('쓰는 법: node kedu/write/tools/fp_loop.mjs <write_fp_log.csv|json> [--min 2] [--out tests/kwrite_fp_proposals.json]'); process.exit(1); }

/* 읽기 — JSON 배열 또는 CSV(머리글 있음, 따옴표 안 쉼표 처리) */
function parseCSV(text) {
  const rows = [], re = /("([^"]|"")*"|[^,\n\r]*)(,|\r?\n|$)/g; let row = [], m;
  while ((m = re.exec(text))) { let v = m[1]; if (v.startsWith('"')) v = v.slice(1, -1).replace(/""/g, '"'); row.push(v); if (m[3] !== ',') { if (row.length > 1 || row[0] !== '') rows.push(row); row = []; } if (m.index === re.lastIndex) re.lastIndex++; if (m[3] === '') break; }
  const head = rows.shift().map(h => h.trim());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const raw = fs.readFileSync(file, 'utf8');
const logs = raw.trim().startsWith('[') ? JSON.parse(raw) : parseCSV(raw);
console.log(`write_fp_log ${logs.length}건 읽음 (${file})`);

/* 묶기 */
const groups = new Map();
logs.forEach(l => {
  if (!l.kind || !l.sentence) return;
  const key = `${l.kind}|${l.original || ''}|${l.fix || ''}`;
  const g = groups.get(key) || { kind: l.kind, original: l.original || '', fix: l.fix || '', n: 0, sents: new Map(), bands: new Set() };
  g.n++; g.bands.add(l.band || '?'); g.sents.set(l.sentence, (g.sents.get(l.sentence) || 0) + 1);
  groups.set(key, g);
});
const list = [...groups.values()].sort((a, b) => b.n - a.n);
console.log(`묶음 ${list.length}개 · ${MIN}번 이상 ${list.filter(g => g.n >= MIN).length}개\n`);

/* 어느 항목이 냈나 — 목록형 종류는 항목 하나씩 켜서 재현 */
const LISTED = ['spelling', 'spacing', 'spoken', 'word'];
function whichEntry(kind, sentence, band, original) {
  if (!LISTED.includes(kind)) return null;
  const C = base.corrections;
  for (let i = 0; i < (C[kind] || []).length; i++) {
    const solo = Object.assign({}, C, { spelling: [], spacing: [], spoken: [], word: [], particle: [], agree: [], tense: null, person: null });
    solo[kind] = [C[kind][i]];
    K.init(Object.assign({}, base, { corrections: solo }));
    const r = K.correct({ text: sentence, band, type: 'argue' });
    if (r.marks.some(m => m.kind === kind && m.original === original)) { K.init(base); return { idx: i, entry: C[kind][i] }; }
  }
  K.init(base);
  return null;
}
K.init(base);
const proposals = [];
list.forEach(g => {
  if (g.n < MIN) return;
  const sents = [...g.sents.entries()].sort((a, b) => b[1] - a[1]);
  const band = [...g.bands].filter(b => b !== '?')[0] || 'high';
  const still = sents.filter(([s]) => K.correct({ text: s, band, type: 'argue' }).marks.some(m => m.kind === g.kind && m.original === g.original));
  const status = still.length ? '손질 후보' : '해결됨(지금 사전은 안 잡음)';
  console.log(`■ ${g.kind} 「${g.original}」 → ${g.fix || '-'} · 지움 ${g.n}번 · 밴드 ${[...g.bands].join('/')} · ${status}`);
  sents.slice(0, 3).forEach(([s, n]) => console.log(`   · (${n}) ${s}`));
  if (!still.length) { console.log(''); return; }
  const w = whichEntry(g.kind, still[0][0], band, g.original);
  if (w) {
    console.log(`   ↳ 사전 ${g.kind}[${w.idx}] re: ${w.entry.re || w.entry.rule}${w.entry.skip ? ' · skip: ' + w.entry.skip : ''}${w.entry.skipSent ? ' · skipSent: ' + w.entry.skipSent : ''}`);
    const ctx = still.map(([s]) => { const i = s.indexOf(g.original); return i < 0 ? null : s.slice(Math.max(0, i - 4), i + g.original.length + 4).trim(); }).filter(Boolean);
    console.log(`   ↳ 제안 ① 앞뒤 말: ${ctx.slice(0, 3).map(c => '「' + c + '」').join(' ')} — 이 가운데 규칙이 되는 말을 skip/skipSent 에 더하거나, 규칙이 못 가릴 오탐이면 soft 로 낮춘다`);
  } else {
    console.log(`   ↳ 규칙형(${g.kind}) — engine.js 의 run${g.kind[0].toUpperCase() + g.kind.slice(1)} 또는 punct/${g.kind} 조건을 본다`);
  }
  console.log(`   ↳ 제안 ② 시험지 항목 ${still.length}건 → --out 로 저장`);
  still.forEach(([s]) => proposals.push({ t: s, band, kind: g.kind, not: [{ kind: g.kind, original: g.original }], n: g.sents.get(s) }));
  console.log('');
});
if (OUT) {
  const outPath = path.resolve(process.cwd(), OUT);
  const prev = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : { _doc: '오탐 루프 제안 — fp_loop.mjs 가 쓴다. test_kedu_write_marks 가 같이 채점(not = 이 표시가 있으면 안 됨). 사전을 고쳐 통과시킨 뒤 kwrite_marks_v3.json 으로 옮기거나 지운다.', items: [] };
  const seen = new Set(prev.items.map(i => i.t + '|' + i.not[0].kind + '|' + i.not[0].original));
  let added = 0;
  proposals.forEach(p => { const k = p.t + '|' + p.kind + '|' + p.not[0].original; if (seen.has(k)) return; seen.add(k); prev.items.push({ t: p.t, band: p.band, not: p.not, n: p.n }); added++; });
  fs.writeFileSync(outPath, JSON.stringify(prev, null, 1), 'utf8');
  console.log(`제안 ${added}건 추가 → ${OUT} (모두 ${prev.items.length}건)`);
}
