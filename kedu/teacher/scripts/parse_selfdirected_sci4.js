/* parse_selfdirected_sci4.js — 자기주도 과학 4-1(g4_sci) 차시 HTML → 케이티처 재료 JSON (66차, 베프).
   사용: node parse_selfdirected_sci4.js <단원 폴더> <out.json>
   4-1 과학 자기주도는 3-2 꼴(featObserve·classifyBy)과 다르다 — 18장 = 도입 3(흥미 intro · 목표 goal · 예상 recall/POE)
   · 전개 4(시뮬 ① pose-stage 예상→관찰 items 또는 차시마다 다른 시뮬 · 시뮬 ② feat-pick data · 정리 카드 fx-card 2)
   · 문제 8(기본 4 · 응용 4: mcq·cls·mcq·mt·ms·cls·mcq·ms 가 기본, 차시에 따라 조금 다름) · 정리 3(요약·자기 평가·다음).
   시뮬 표는 원문 스크립트의 IIFE 안 const 배열·객체를 vm 으로 그대로 읽는다(차시마다 이름이 달라 IIFE 단위로 찾음).
   차시마다: file·title·n·std·goal[]·slides[{i,stage,badge,title,kind,text,cards,icons,recall,pose,sim,feat,fb}]·problems[...]·summary[]·self·next. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ent = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
const clean = (s) => ent(String(s || '').replace(/<br\s*\/?>/g, '\n').replace(/<\/?(b|strong)>/g, '**').replace(/<span class="emph">/g, '**').replace(/<\/span>/g, '**').replace(/<[^>]+>/g, '')).split('\n').map(x => x.trim()).filter(Boolean).join('\n').replace(/\*\*\*\*/g, '').replace(/\*\*\s*\*\*/g, ' ');
const first = (re, s, d = '') => { const m = s.match(re); return m ? m[1] : d; };
const all = (re, s) => { const out = []; let m; const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); while ((m = r.exec(s))) out.push(m); return out; };
const evalObj = (code) => { const c = {}; vm.createContext(c); return vm.runInContext('(' + code + ')', c); };
/* 괄호 짝 맞춰 const X = [..] / {..} 읽기 */
function consts(body) {
  const out = {}; const re = /const (\w+) = ([\[{])/g; let m;
  while ((m = re.exec(body))) {
    let i = m.index + m[0].length - 1, dep = 0, q = null;
    for (; i < body.length; i++) { const ch = body[i]; if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; } if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; } if (ch === '[' || ch === '{') dep++; else if (ch === ']' || ch === '}') { dep--; if (!dep) break; } }
    const code = body.slice(m.index + m[0].length - 1, i + 1);
    try { const v = evalObj(code); if (v && typeof v === 'object') out[m[1]] = v; } catch (e) { /* DOM 참조 등은 건너뜀 */ }
    re.lastIndex = i;
  }
  return out;
}
function iifes(src) { return all(/\(function (\w+)\(\) \{([\s\S]*?)\n\}\)\(\);/, src).map(m => ({ name: m[1], body: m[2] })); }

function parse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const head = src.slice(0, 3000);
  const fns = iifes(src);
  const cmt = first(/<!--([\s\S]*?)-->/, head);
  const out = { file: path.basename(file), title: first(/<title>(.*?) · K-edu/, src) || first(/<title>(.*?)<\/title>/, src), n: first(/class="intro-meta">[^<]*· (\d+(?:~\d+)?)차시/, src), notes: all(/^\s*- (.*)$/m, cmt).map(m => m[1].trim()), guide: first(/지도서: (.*)/, cmt).trim(), std: first(/성취기준[:：] ?(.*)/, head).replace(/-->.*/, '').trim(), goal: [], slides: [], problems: [], summary: [], self: '', next: '', next_icons: [] };
  const parts = src.split(/<div class="slide(?: active)?"/).slice(1);
  let simNo = 0;
  parts.forEach((p, idx) => {
    const html = p.split(/<!-- 슬 \d+ ·/)[0];
    const stage = first(/data-stage="(.*?)"/, html), badge = clean(first(/class="stage-badge">(.*?)<\/span>/, html)), title = clean(first(/class="slide-title">([\s\S]*?)<\/h2>/, html));
    if (/data-q-id/.test(html.slice(0, 200))) {
      const q = { i: idx, stage, badge, t: title, pts: +first(/data-q-points="(\d+)"/, html) || 0, hints: (() => { try { return JSON.parse(ent(first(/data-hints='(.*?)'/, html, '[]'))); } catch (e) { return []; } })(), body: clean(first(/class="bub">([\s\S]*?)<\/div>/, html)) };
      if (/class="mcq"/.test(html)) { q.kind = 'mcq'; const os = all(/<button class="mcq-opt"( data-correct="1")?[^>]*>([\s\S]*?)<\/button>/, html); q.opts = os.map(m => clean(m[2])); q.ci = os.findIndex(m => m[1]); }
      else if (/class="cls-items"/.test(html)) { q.kind = 'cls'; q.items = all(/<button class="cls-item" data-bin="(.*?)"[^>]*><span class="ci-emoji">(.*?)<\/span>([\s\S]*?)<\/button>/, html).map(m => ({ bin: m[1], emoji: m[2], t: clean(m[3]) })); q.bins = all(/<div class="cls-bin" data-bin="(.*?)"[^>]*><div class="cls-bin-name">([\s\S]*?)<\/div>/, html).map(m => ({ id: m[1], name: clean(m[2]) })); }
      else if (/class="mt-wrap"/.test(html)) { q.kind = 'mt'; const L = all(/class="mt-cell mt-left" data-pair="(.*?)"[^>]*>([\s\S]*?)<\/div>/, html), R = all(/class="mt-cell mt-right" data-pair="(.*?)"[^>]*>([\s\S]*?)<\/div>/, html); q.pairs = L.map(m => [clean(m[2]), clean((R.find(r => r[1] === m[1]) || [, , ''])[2])]); }
      else if (/class="ms-grid"/.test(html)) { q.kind = 'ms'; q.chips = all(/<button class="ms-item" data-correct="(\d)"[^>]*><span class="msi-emoji">(.*?)<\/span>([\s\S]*?)<\/button>/, html).map(m => ({ hit: m[1] === '1', emoji: m[2], t: clean(m[3]) })); }
      out.problems.push(q); return;
    }
    if (/class="goal-list"/.test(html)) { out.goal = all(/<li>([\s\S]*?)<\/li>/, html).map(m => clean(m[1])); out.slides.push({ i: idx, stage, badge, title, kind: 'goal', text: out.goal.join('\n') }); return; }
    if (/class="sum-list"/.test(html) && stage === '정리') { out.summary = all(/<div class="sum-item"[^>]*><span class="si-i">(.*?)<\/span>([\s\S]*?)<\/div>/, html).map(m => clean(m[2])); out.summary_icons = all(/<span class="si-i">(.*?)<\/span>/, html).map(m => m[1]); return; }
    if (/class="self-row"/.test(html)) { out.self = title; return; }
    if (/class="next-preview"/.test(html)) { out.next = clean(first(/class="next-preview">([\s\S]*?)<\/div>/, html)); out.next_icons = all(/<span>(.*?)<\/span>/, first(/class="intro-row"[^>]*>([\s\S]*?)<\/div>/, html)).map(m => m[1]); return; }
    const sl = { i: idx, stage, badge, title, kind: 'concept', text: clean(first(/class="bub"[^>]*>([\s\S]*?)<\/div>/, html)) }; /* 69차: u4 정리 장 말풍선은 카드 뒤 · style 속성이 붙어 있음 */
    if (/class="intro"/.test(html)) { sl.kind = 'intro'; sl.icons = all(/<span>(.*?)<\/span>/, first(/class="intro-row">([\s\S]*?)<\/div>/, html)).map(m => m[1]); }
    if (/class="recall"/.test(html)) { sl.kind = stage === '도입' ? 'predict' : 'recall'; sl.recall = clean(first(/class="recall">([\s\S]*?)<\/div>/, html)); }
    if (/class="sum-list"/.test(html)) { sl.kind = 'list'; sl.items = all(/<div class="sum-item"[^>]*><span class="si-i">(.*?)<\/span>([\s\S]*?)<\/div>/, html).map(m => ({ emoji: m[1], t: clean(m[2]) })); }
    const cards = all(/<div class="fx-card"[^>]*><div class="fx-emoji">(.*?)<\/div><div class="fx-label">([\s\S]*?)<\/div><\/div>/, html);
    if (cards.length) sl.cards = cards.map(m => ({ emoji: m[1], label: clean(m[2]) }));
    if (/class="sim"/.test(html)) {
      const fn = fns[simNo++] || { name: '', body: '' };
      sl.fn = fn.name; sl.data = consts(fn.body);
      sl.simText = clean(first(/class="sim">([\s\S]*)$/, html)).slice(0, 600);
      sl.fb = clean(first(/class="(?:sim-fb|fc-head)"[^>]*>(.*?)<\/div>/, html));
      if (/class="feat-pick"/.test(html)) { sl.kind = 'feat'; sl.btns = all(/<button class="feat-btn" data-an="(.*?)"[^>]*><span class="fb-emoji">(.*?)<\/span><span class="fb-name">(.*?)<\/span>/, html).map(m => ({ id: m[1], emoji: m[2], name: clean(m[3]) })); }
      else if (/class="pose-stage"/.test(html)) { sl.kind = 'pose'; sl.btn = clean(first(/id="poseShow">(.*?)<\/button>/, html)); }
      else sl.kind = 'sim';
    }
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
