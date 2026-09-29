/* parse_selfdirected_sci.js — 자기주도 과학(3-2, ka- 과학 골격) 차시 HTML → 케이티처 재료 JSON (41차, 베프).
   사용: node parse_selfdirected_sci.js <단원 폴더> <out.json>
   과학 3-2 자기주도는 수학 꼴(q-prompt·data-answer)도 국어 꼴(slides=[{tag,t,html}])도 아니다 —
   3-1 과학 4단원 l06 골격: 18장 = 도입 3(흥미·목표·개념) · 전개 4(시뮬 featObserve · 시뮬 classifyBy · 정리 카드 · 오개념) · 문제 8(mcq·cls·mcq·mt·ms·cls·mcq·ms) · 정리 3(요약·자기 평가·다음).
   차시마다: file·title·n(차시 범위)·std·goal[]·slides[{stage,badge,title,kind,text,cards,feat,things,msgs}]·problems[{kind,t,body,pts,hints,opts+ci|items+bins|pairs|chips}]·summary[]·self·next·next_icons.
   <b>/<span class="emph"> → **굵게**, <br> → 줄바꿈. 시뮬 표(featObserve data · classifyBy things/msgs)는 vm 으로 그대로 읽는다. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ent = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
const clean = (s) => ent(String(s || '').replace(/<br\s*\/?>/g, '\n').replace(/<\/?(b|strong)>/g, '**').replace(/<span class="emph">/g, '**').replace(/<\/span>/g, '**').replace(/<[^>]+>/g, '')).split('\n').map(x => x.trim()).filter(Boolean).join('\n').replace(/\*\*\*\*/g, '');
const first = (re, s, d = '') => { const m = s.match(re); return m ? m[1] : d; };
const all = (re, s) => { const out = []; let m; const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); while ((m = r.exec(s))) out.push(m); return out; };
const evalObj = (code) => { const c = {}; vm.createContext(c); return vm.runInContext('(' + code + ')', c); };

function parse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const head = src.slice(0, 2000);
  const out = { file: path.basename(file), title: first(/<title>(.*?) · K-edu/, src), n: first(/(\d+(?:~\d+)?)차시 \/ \d+차시/, head), std: first(/성취기준: (.*)/, head).trim(), goal: [], slides: [], problems: [], summary: [], self: '', next: '', next_icons: [] };
  const parts = src.split(/<div class="slide(?: active)?"/).slice(1);
  parts.forEach((p, idx) => {
    const html = p.split(/<!-- 슬 \d+ ·/)[0];
    const stage = first(/data-stage="(.*?)"/, html), badge = clean(first(/class="stage-badge">(.*?)<\/span>/, html)), title = clean(first(/class="slide-title">([\s\S]*?)<\/h2>/, html));
    if (/data-q-id/.test(html.slice(0, 200))) {
      const q = { i: idx, stage, badge, t: title, pts: +first(/data-q-points="(\d+)"/, html) || 0, hints: JSON.parse(ent(first(/data-hints='(.*?)'/, html, '[]'))), body: clean(first(/class="bub">([\s\S]*?)<\/div>/, html)) };
      if (/class="mcq"/.test(html)) { q.kind = 'mcq'; const os = all(/<button class="mcq-opt"( data-correct="1")?>([\s\S]*?)<\/button>/, html); q.opts = os.map(m => clean(m[2])); q.ci = os.findIndex(m => m[1]); }
      else if (/class="cls-items"/.test(html)) { q.kind = 'cls'; q.items = all(/<button class="cls-item" data-bin="(.*?)"><span class="ci-emoji">(.*?)<\/span>(.*?)<\/button>/, html).map(m => ({ bin: m[1], emoji: m[2], t: clean(m[3]) })); q.bins = all(/<div class="cls-bin" data-bin="(.*?)"><div class="cls-bin-name">(.*?)<\/div>/, html).map(m => ({ id: m[1], name: clean(m[2]) })); }
      else if (/class="mt-wrap"/.test(html)) { q.kind = 'mt'; const L = all(/class="mt-cell mt-left" data-pair="(.*?)">([\s\S]*?)<\/div>/, html), R = all(/class="mt-cell mt-right" data-pair="(.*?)">([\s\S]*?)<\/div>/, html); q.pairs = L.map(m => [clean(m[2]), clean(R.find(r => r[1] === m[1])[2])]); }
      else if (/class="ms-grid"/.test(html)) { q.kind = 'ms'; q.chips = all(/<button class="ms-item" data-correct="(\d)"><span class="msi-emoji">(.*?)<\/span>([\s\S]*?)<\/button>/, html).map(m => ({ hit: m[1] === '1', emoji: m[2], t: clean(m[3]) })); }
      out.problems.push(q); return;
    }
    if (/class="goal-list"/.test(html)) { out.goal = all(/<li>([\s\S]*?)<\/li>/, html).map(m => clean(m[1])); out.slides.push({ i: idx, stage, badge, title, kind: 'goal', text: out.goal.join('\n') }); return; }
    if (/class="sum-list"/.test(html)) { out.summary = all(/<div class="sum-item"><span class="si-i">(.*?)<\/span>([\s\S]*?)<\/div>/, html).map(m => clean(m[2])); out.summary_icons = all(/<span class="si-i">(.*?)<\/span>/, html).map(m => m[1]); return; }
    if (/class="self-row"/.test(html)) { out.self = title; return; }
    if (/class="next-preview"/.test(html)) { out.next = clean(first(/class="next-preview">([\s\S]*?)<\/div>/, html)); out.next_icons = all(/<span>(.*?)<\/span>/, first(/class="intro-row"[^>]*>([\s\S]*?)<\/div>/, html)).map(m => m[1]); return; }
    const sl = { i: idx, stage, badge, title, kind: 'concept', text: clean(first(/class="bub">([\s\S]*?)<\/div>/, html)) };
    if (/class="intro"/.test(html)) { sl.kind = 'intro'; sl.icons = all(/<span>(.*?)<\/span>/, first(/class="intro-row">([\s\S]*?)<\/div>/, html)).map(m => m[1]); }
    if (/class="recall"/.test(html)) { sl.kind = 'miscon'; sl.recall = clean(first(/class="recall">([\s\S]*?)<\/div>/, html)); }
    const cards = all(/<div class="fx-card"><div class="fx-emoji">(.*?)<\/div><div class="fx-label">([\s\S]*?)<\/div><\/div>/, html);
    if (cards.length) sl.cards = cards.map(m => ({ emoji: m[1], label: clean(m[2]) }));
    if (/class="feat-pick"/.test(html)) { sl.kind = 'feat'; sl.feat = evalObj(first(/function featObserve\(\) \{\s*const data = (\{[\s\S]*?\});/, src)); sl.fb = clean(first(/class="fc-head">(.*?)<\/div>/, html)); }
    if (/class="crit-pick"/.test(html)) { sl.kind = 'classify'; sl.crits = all(/<button class="crit-btn" data-crit="(.*?)">(.*?)<\/button>/, html).map(m => ({ id: m[1], t: clean(m[2]) })); sl.things = evalObj(first(/function classifyBy\(\) \{\s*const things = (\[[\s\S]*?\]);/, src)); sl.msgs = evalObj(first(/const msgs = (\{[\s\S]*?\});/, src)); sl.fb = clean(first(/class="sim-fb"[^>]*>(.*?)<\/div>/, html)); }
    out.slides.push(sl);
  });
  return out;
}

if (require.main === module) {
  const [d, o] = process.argv.slice(2);
  const files = fs.readdirSync(d).filter(f => /^g\d_\w+_u\d+_l\d+.*\.html$/.test(f)).sort();
  const res = {};
  files.forEach(f => { res[f.match(/_(u\d+_l\d+)_/)[1]] = parse(path.join(d, f)); });
  fs.writeFileSync(o, JSON.stringify(res, null, 1));
  const ks = Object.keys(res);
  console.log(o, ks.length, '차시', ks.reduce((a, k) => a + res[k].slides.length, 0), '개념 장', ks.reduce((a, k) => a + res[k].problems.length, 0), '문제');
}
module.exports = { parse };
