/* 케이글쓰기 정답 시험지 채점 — node tests/test_kedu_write_corpus.js
   tests/kwrite_corpus.json 30편: 요소 검출 정밀도·재현율, 요소 신호등 일치, 구조 카드, 선생님 표시 재현율, 깨끗한 글의 하드 표시 0.
   문턱(설계 v2 §10): 문장 요소 정밀도 ≥ 0.85 · 재현율 ≥ 0.80 · 신호등 일치 ≥ 0.90 · 표시 재현율 = 1.0 · 깨끗한 글 하드 표시 = 0 */
const fs = require('fs'), path = require('path');
const K = require('../kedu/write/engine.js');
const D = p => JSON.parse(fs.readFileSync(path.join(__dirname, '../kedu/write/data', p), 'utf8'));
const T = D('templates.json');
K.init({ templates: T, signals: D('signals.json'), feedback: D('feedback.json'), corrections: D('corrections.json') });
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'kwrite_corpus.json'), 'utf8')).items;
const verbose = process.argv.includes('-v');

let tp = 0, fp = 0, fn = 0, lightOk = 0, lightN = 0, markHit = 0, markN = 0, dirty = 0, structHit = 0, structN = 0, fails = [];
corpus.forEach(it => {
  const r = K.analyze({ text: it.text, type: it.type, band: it.grade, topic: it.topic, keywords: it.keywords });
  const need = Object.keys(r.spec.need);
  if (r.sentences.length !== it.labels.length) fails.push(`${it.id}: 문장 수 ${r.sentences.length} ≠ 라벨 ${it.labels.length}`);
  r.sentences.forEach((s, i) => {
    const wants = [].concat(it.labels[i] || []).filter(c => need.includes(c)), got = Object.keys(s.detected).filter(c => s.detected[c] >= 2 && need.includes(c));
    wants.forEach(want => { if (got.includes(want)) tp++; else { fn++; if (verbose) console.log(`  FN ${it.id}#${i} want ${want} got ${got.join(',') || '-'} | ${s.text}`); } });
    // 마지막 문단의 마무리 문장에 생각(C)이 다시 나오는 것은 맞는 신호 — 오탐으로 세지 않는다
    got.forEach(c => { if (!wants.includes(c) && !(c === 'C' && wants.includes('W'))) { fp++; if (verbose) console.log(`  FP ${it.id}#${i} got ${c} want ${wants.join(',') || '-'} | ${s.text}`); } });
  });
  Object.keys(it.expect).forEach(c => {
    lightN++;
    if (r.elements[c] && r.elements[c].status === it.expect[c]) lightOk++;
    else fails.push(`${it.id}: ${c} 신호등 ${r.elements[c] && r.elements[c].status} ≠ ${it.expect[c]}`);
  });
  (it.structure || []).forEach(code => { structN++; if (r.structure.issues.some(x => x.code === code)) structHit++; else fails.push(`${it.id}: 구조 ${code} 안 잡힘`); });
  const marks = r.teacher.marks;
  (it.marks || []).forEach(m => {
    markN++;
    const hit = marks.some(x => x.kind === m.kind && (m.append ? x.append : m.original ? x.original.includes(m.original) : true));
    if (hit) markHit++; else fails.push(`${it.id}: 표시 ${m.kind} ${m.original || ''} 안 잡힘`);
  });
  if (it.clean) marks.filter(m => !m.soft).forEach(m => { dirty++; fails.push(`${it.id}: 깨끗한 글에 하드 표시 ${m.kind} '${m.original}' → ${m.fix} (#${m.i})`); });
  if (verbose) console.log(it.id, need.map(c => c + ':' + r.elements[c].status).join(' '), '| cards', r.cards.length, '| marks', marks.length);
});
const P = tp / (tp + fp || 1), R = tp / (tp + fn || 1), L = lightOk / lightN;
console.log(`요소 문장 정밀도 ${P.toFixed(3)} (tp ${tp} fp ${fp}) · 재현율 ${R.toFixed(3)} (fn ${fn})`);
console.log(`신호등 일치 ${lightOk}/${lightN} = ${L.toFixed(3)} · 구조 ${structHit}/${structN} · 표시 재현 ${markHit}/${markN} · 깨끗한 글 하드 표시 ${dirty}`);
fails.forEach(f => console.log('  ✗', f));
const ok = P >= 0.85 && R >= 0.80 && L >= 0.90 && markHit === markN && dirty === 0 && structHit === structN;
console.log(ok ? 'test_kedu_write_corpus: PASS' : 'test_kedu_write_corpus: FAIL');
process.exit(ok ? 0 : 1);
