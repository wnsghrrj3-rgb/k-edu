/* 케이글쓰기 선생님 표시 시험지 v3 채점 — node tests/test_kedu_write_marks.js [-v]
   tests/kwrite_marks_v3.json: 문장 단위. must 재현율 = 1.0 · clean 문장 하드 표시 = 0 · none 종류 0 · fix 가 있으면 글자까지 같아야 한다.
   더해서 사전 위생: corrections.json 의 모든 why 에 평가 낱말 0, 모든 re 가 컴파일 됨, fix 의 $n·{map:$n} 이 그룹 수 안에. */
const fs = require('fs'), path = require('path');
const K = require('../kedu/write/engine.js');
const D = p => JSON.parse(fs.readFileSync(path.join(__dirname, '../kedu/write/data', p), 'utf8'));
const C = D('corrections.json');
K.init({ templates: D('templates.json'), signals: D('signals.json'), feedback: D('feedback.json'), corrections: C });
const items = JSON.parse(fs.readFileSync(path.join(__dirname, 'kwrite_marks_v3.json'), 'utf8')).items;
const verbose = process.argv.includes('-v');
let mustN = 0, mustHit = 0, dirty = 0, fails = [];
items.forEach((it, n) => {
  const r = K.correct({ text: it.t, band: it.band || 'high', type: it.type || 'argue', keywords: it.kw || [] });
  const marks = r.marks;
  (it.must || []).forEach(m => {
    mustN++;
    const hit = marks.find(x => x.kind === m.kind && (!m.original || (x.original || '').includes(m.original) || m.original.includes(x.original || '\u0000')) && (!m.fix || (x.fix || '').includes(m.fix) || m.fix.includes(x.fix || '\u0000')));
    if (hit) mustHit++; else fails.push(`#${n} 「${it.t}」 표시 ${m.kind} ${m.original || ''}${m.fix ? ' → ' + m.fix : ''} 안 잡힘 — 잡힌 것: ${marks.map(x => x.kind + ':' + x.original + '→' + x.fix).join(', ') || '-'}`);
  });
  (it.none || []).forEach(k => { if (marks.some(x => x.kind === k)) { dirty++; fails.push(`#${n} 「${it.t}」 ${k} 표시가 있으면 안 됨`); } });
  if (it.clean) marks.filter(m => !m.soft).forEach(m => { dirty++; fails.push(`#${n} 「${it.t}」 깨끗한 문장에 하드 표시 ${m.kind} '${m.original}' → ${m.fix}`); });
  if (verbose) console.log(n, it.t, '|', marks.map(x => x.kind + ':' + x.original + '→' + x.fix + (x.soft ? '(soft)' : '')).join(' · ') || '-');
});
/* 사전 위생 */
const bad = /틀렸|부족|미흡|못했|잘못|점수|등급|실패|낮/;
let hyg = 0;
['spelling', 'spacing', 'spoken', 'word', 'particle'].forEach(k => (C[k] || []).forEach((e, i) => {
  if (e.why && bad.test(e.why)) { hyg++; fails.push(`위생 ${k}[${i}] why 평가 낱말: ${e.why}`); }
  if (e.re) { try { new RegExp(e.re, 'gu'); } catch (x) { hyg++; fails.push(`위생 ${k}[${i}] re 컴파일: ${e.re}`); } }
  if (e.re && e.fix) { const groups = (new RegExp(e.re + '|', 'u')).exec('').length - 1; (e.fix.match(/\$(\d)/g) || []).forEach(g => { if (+g.slice(1) > groups) { hyg++; fails.push(`위생 ${k}[${i}] fix ${g} > 그룹 ${groups}: ${e.re}`); } }); }
}));
(C.agree || []).forEach((e, i) => { if (bad.test(e.why)) { hyg++; fails.push(`위생 agree[${i}] why: ${e.why}`); } ['re', 'need', 'bad'].forEach(f => { if (e[f]) { try { new RegExp(e[f], 'u'); } catch (x) { hyg++; fails.push(`위생 agree[${i}] ${f}: ${e[f]}`); } } }); });
console.log(`표시 재현 ${mustHit}/${mustN} · 오탐 ${dirty} · 사전 위생 ${hyg} (spelling ${C.spelling.length} · spacing ${C.spacing.length} · spoken ${C.spoken.length} · word ${C.word.length} · agree ${C.agree.length})`);
fails.forEach(f => console.log('  ✗', f));
const ok = mustHit === mustN && dirty === 0 && hyg === 0;
console.log(ok ? 'test_kedu_write_marks: PASS' : 'test_kedu_write_marks: FAIL');
process.exit(ok ? 0 : 1);
